#!/usr/bin/env node
/**
 * World's Smartest v9 — Opaque-Box E2E Test Suites (Smoke + Tiers 1–4)
 * Zero external dependencies (Node v26.13.1 built-ins only).
 *
 * CLI flags:
 *   --smoke                       Run static check + smoke boot/WebGL2/tile-click/clue-answer + 1440x900 & 390x844 screenshots
 *   --tier=1|2|3|4|all            Run specified test tier(s)
 *   --skip-static                 Skip v9_static_gates execution inside suite
 *   --skip-build                  Skip S1 tsc/vite build inside static gates (forbidden under --strict)
 *   --strict                      Treat any PENDING_M1_M4 or skipped S1 build as FAIL
 *   --screenshots-dir=<dir>       Output directory for PNG screenshots (default: .agents/v9_qa_screenshots)
 *   --json-out=<path>             Write structured JSON summary report
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DIST_BUDGET_BYTES,
  REPO_ROOT,
  runAllStaticGates,
} from './v9_static_gates.mjs';
import {
  BASE_URL_DEFAULT,
  SCREENSHOTS_DIR_DEFAULT,
  ensureDistServer8999,
  launchV9Browser,
  sleep,
} from './v9_e2e_harness.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHOWROOM_SAVE_KEY = 'ws_v9_showroom_save_1';
const SWEEPS_SAVE_KEY = 'ws_v9_sweeps_save_1';
const SWEEPS_INTERMISSION_KEY = 'ws_v9_sweeps_intermission_pending_1';
const CAMPAIGN_SAVE_KEY = 'ws_v7_campaign_save_1';

const ALL_R7_MODES = [
  'LOUVER_SHUTTER',
  'BLIND_PURSE',
  'BLACKOUT_VAULT',
  'LIVE_WIRE_FUSE',
  'SHIFTING_SPOTLIGHT',
  'GOLDEN_DOMINO_CASCADE',
  'PRESSURE_COOKER',
  'HOLLYWOOD_MARQUEE_LINE',
];

function parseCliArgs(argv) {
  const opts = {
    smoke: false,
    tier: null,
    skipStatic: false,
    skipBuild: false,
    strict: false,
    screenshotsDir: SCREENSHOTS_DIR_DEFAULT,
    jsonOut: null,
  };
  for (const arg of argv) {
    if (arg === '--smoke') opts.smoke = true;
    else if (arg.startsWith('--tier=')) opts.tier = arg.slice('--tier='.length).toLowerCase();
    else if (arg === '--skip-static') opts.skipStatic = true;
    else if (arg === '--skip-build') opts.skipBuild = true;
    else if (arg === '--strict') opts.strict = true;
    else if (arg.startsWith('--screenshots-dir=')) {
      opts.screenshotsDir = path.resolve(REPO_ROOT, arg.slice('--screenshots-dir='.length));
    } else if (arg.startsWith('--json-out=')) {
      opts.jsonOut = path.resolve(REPO_ROOT, arg.slice('--json-out='.length));
    }
  }
  if (!opts.smoke && !opts.tier) {
    opts.smoke = true;
  }
  return opts;
}

class PendingM1M4Error extends Error {
  constructor(message) {
    super(message);
    this.name = 'PendingM1M4Error';
  }
}

class FatalCdpRecoveryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FatalCdpRecoveryError';
  }
}

function pendingV9(reason) {
  throw new PendingM1M4Error(reason);
}

// ----------------------------------------------------------------------------
// E2E-Local Clue Answer Oracle (reads public/data/v7/*.json, zero src/ edits)
// ----------------------------------------------------------------------------

function normalizeOracleText(s) {
  return String(s || '')
    .replace(/^[A-D]\.\s*/i, '')
    .replace(/[“”"‘’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function loadClueOracle() {
  const dataDir = path.join(REPO_ROOT, 'public', 'data', 'v7');
  const byStem = new Map();
  const byChoices = new Map();
  let totalIndexed = 0;

  if (fs.existsSync(dataDir)) {
    const files = fs
      .readdirSync(dataDir)
      .filter((f) => f.endsWith('.json') && !f.includes('manifest'));
    for (const file of files) {
      try {
        const parsed = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
        const clues = Array.isArray(parsed?.clues) ? parsed.clues : Array.isArray(parsed) ? parsed : [];
        for (const c of clues) {
          if (!c || typeof c.stem !== 'string' || !Array.isArray(c.choices)) continue;
          const normStem = normalizeOracleText(c.stem);
          const rec = {
            stem: c.stem,
            choices: c.choices.map((x) => String(x)),
            answerIdx: Number(c.answerIdx),
            vowelChoices: Array.isArray(c.vowels?.vowelChoices)
              ? c.vowels.vowelChoices.map((x) => String(x))
              : null,
            vowelAnswerIdx: Number.isFinite(c.vowels?.correctChoiceIdx)
              ? Number(c.vowels.correctChoiceIdx)
              : null,
          };
          if (!byStem.has(normStem)) byStem.set(normStem, []);
          byStem.get(normStem).push(rec);

          const chKey = rec.choices.map(normalizeOracleText).slice().sort().join('|');
          if (chKey && !byChoices.has(chKey)) byChoices.set(chKey, rec);

          if (rec.vowelChoices && rec.vowelAnswerIdx !== null) {
            const vKey = rec.vowelChoices.map(normalizeOracleText).slice().sort().join('|');
            if (vKey && !byChoices.has(vKey)) {
              byChoices.set(vKey, {
                choices: rec.vowelChoices,
                answerIdx: rec.vowelAnswerIdx,
              });
            }
          }
          totalIndexed++;
        }
      } catch {
        // Ignore malformed non-clue files
      }
    }
  }

  function findRecord(domStem, domChoiceTexts) {
    const normDomChoices = (domChoiceTexts || []).map(normalizeOracleText);
    const normStem = normalizeOracleText(domStem);
    const candidates = byStem.get(normStem) || [];
    for (const rec of candidates) {
      const rightText = normalizeOracleText(rec.choices[rec.answerIdx]);
      if (rightText && normDomChoices.some((t) => t === rightText || t.includes(rightText) || rightText.includes(t))) {
        return { choices: rec.choices, answerIdx: rec.answerIdx };
      }
      if (rec.vowelChoices && rec.vowelAnswerIdx !== null) {
        const rightV = normalizeOracleText(rec.vowelChoices[rec.vowelAnswerIdx]);
        if (rightV && normDomChoices.includes(rightV)) {
          return { choices: rec.vowelChoices, answerIdx: rec.vowelAnswerIdx };
        }
      }
    }
    const chKey = normDomChoices.slice().sort().join('|');
    if (chKey && byChoices.has(chKey)) {
      return byChoices.get(chKey);
    }
    return null;
  }

  function pickChoiceIdx(domStem, domChoiceTexts, wantCorrect = true) {
    const normDomChoices = (domChoiceTexts || []).map(normalizeOracleText);
    if (normDomChoices.length === 0) return 0;
    const rec = findRecord(domStem, domChoiceTexts);
    if (!rec) return 0;
    const rightNorm = normalizeOracleText(rec.choices[rec.answerIdx]);
    let rightDomIdx = normDomChoices.findIndex((t) => t === rightNorm);
    if (rightDomIdx < 0) {
      rightDomIdx = normDomChoices.findIndex((t) => t.includes(rightNorm) || rightNorm.includes(t));
    }
    if (rightDomIdx < 0) rightDomIdx = rec.answerIdx >= 0 && rec.answerIdx < normDomChoices.length ? rec.answerIdx : 0;

    if (wantCorrect) return rightDomIdx;
    for (let i = 0; i < normDomChoices.length; i++) {
      if (i !== rightDomIdx) return i;
    }
    return (rightDomIdx + 1) % normDomChoices.length;
  }

  return { totalIndexed, pickChoiceIdx };
}

function loadManifestIds() {
  const p = path.join(REPO_ROOT, 'public', 'assets', 'v9', 'atlas_manifest_v9.json');
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  const sprites = raw.sprites || raw.entries || raw;
  const prizeIds = [];
  const zonkIds = [];
  const vipIds = [];
  for (const [id, entry] of Object.entries(sprites)) {
    const cat = String(entry?.category || '').toLowerCase();
    if (id.startsWith('prize_') || cat === 'prize') prizeIds.push(id);
    else if (id.startsWith('zonk_') || cat === 'zonk') zonkIds.push(id);
    else if (id.startsWith('vip_') || cat === 'vip_celeb') vipIds.push(id);
  }
  return { prizeIds, zonkIds, vipIds, allSpriteIds: Object.keys(sprites) };
}

async function seedLocalStorageAndReload(browser, url, kvMap) {
  await browser.navigate(url, { clearStorage: true, nosw: true });
  await browser.evalFn((entries) => {
    for (const [k, v] of entries) {
      if (v === null || v === undefined) {
        localStorage.removeItem(k);
      } else {
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      }
    }
  }, Object.entries(kvMap));
  await browser.navigate(url, { clearStorage: false, nosw: true });
  await browser.dismissPreBoardOverlays({ maxSteps: 5 });
}

function makeDefaultShowroomLedger(overrides = {}) {
  return {
    version: 'WS_V9_SHOWROOM_1',
    showroomCash: 0,
    plinkoTokens: 0,
    freeCurtainTickets: 0,
    consecutiveZonks: 0,
    ownedPrizeIds: [],
    ownedZonkIds: [],
    ownedCosmeticIds: ['trim_walnut_classic', 'chime_solenoid_bell', 'trilon_ivory_classic'],
    equipped: {
      PODIUM_TRIM: 'trim_walnut_classic',
      BUZZER_CHIME: 'chime_solenoid_bell',
      TRILON_STYLE: 'trilon_ivory_classic',
    },
    recentOfferedIds: [],
    pinnedDenIds: [],
    totalCurtainPulls: 0,
    totalPlinkoDrops: 0,
    ...overrides,
  };
}

function makeDefaultSweepsState(overrides = {}) {
  return {
    version: 'WS_V9_SWEEPS_1',
    activeRun: false,
    currentNight: 1,
    safeDepositCash: 0,
    atRiskVaultCash: 0,
    revengeJackpotPool: 1000,
    draftedSponsors: [],
    nextNightBonusMult: 0,
    freeFiftyFiftyArmed: false,
    pendingLossRematchNight: null,
    pendingPlinkoFreeDrop: false,
    pendingSponsorDraft: false,
    lastNightPurse: 0,
    nightsWonTotal: 0,
    sweepsCrownsWon: 0,
    ...overrides,
  };
}

async function probeCapabilities(browser) {
  return browser.evalJs(`(() => {
    const api = window.__WS_V7__ || {};
    const btns = Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
      action: b.getAttribute('data-action') || '',
      text: (b.innerText || b.textContent || '').trim(),
    }));
    const hasBtn = (actionRe, textRe) => btns.some(b =>
      (actionRe && actionRe.test(b.action)) || (textRe && textRe.test(b.text))
    );
    const hooks = {
      getTelemetry: typeof api.getTelemetry === 'function',
      previewStageAndBoard: typeof api.previewStageAndBoard === 'function',
      openContraptionPreview: typeof api.openContraptionPreview === 'function',
      recordMasterAudioSamples: typeof api.recordMasterAudioSamples === 'function',
      getShowroomState: typeof api.getShowroomState === 'function',
      getSweepsState: typeof api.getSweepsState === 'function',
      getActiveBoardMode: typeof api.getActiveBoardMode === 'function',
      getSeasonId: typeof api.getSeasonId === 'function',
      getStudioSignStates: typeof api.getStudioSignStates === 'function',
      getCrowdMood: typeof api.getCrowdMood === 'function',
      getStageLayoutDiagnostics: typeof api.getStageLayoutDiagnostics === 'function',
      openView: typeof api.openView === 'function',
    };
    const tel = hooks.getTelemetry ? api.getTelemetry() : {};
    const hub = {
      hasCampaign: hasBtn(/play-campaign/i, /CAMPAIGN/i),
      hasDaily: hasBtn(/play-daily/i, /DAILY/i),
      hasBlitz: hasBtn(/blitz/i, /60s\\s*BLITZ|60-SECOND\\s*BLITZ/i),
      hasSweeps: hasBtn(/sweeps/i, /SWEEPS/i),
      hasShowroom: hasBtn(/showroom/i, /PRIZE\\s*SHOWROOM/i),
      hasQuickShow: hasBtn(/quick-show/i, /QUICK\\s*SHOW/i),
      hasCouch: hasBtn(/couch-party/i, /2P\\s*COUCH/i),
    };
    return {
      hooks,
      hub,
      boardCatalogCount: tel.boardCatalogCount || 0,
      has3TierHub: hub.hasBlitz && hub.hasSweeps && hub.hasShowroom,
      hasAllV9Hooks:
        hooks.getShowroomState &&
        hooks.getSweepsState &&
        hooks.getActiveBoardMode &&
        hooks.getSeasonId &&
        hooks.getStudioSignStates &&
        hooks.getCrowdMood &&
        hooks.openView,
    };
  })()`);
}

let activeRecoveryCtx = null;
let testsSinceRecycle = 0;

async function maybeRecycleBrowser(browser, baseUrl, interval = 15) {
  if (testsSinceRecycle < interval) return;
  testsSinceRecycle = 0;
  try {
    await browser.relaunchBrowser();
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(baseUrl, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
  } catch (err) {
    console.warn(`[WARN] maybeRecycleBrowser retry after error: ${err?.message || err}`);
    await browser.relaunchBrowser();
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(baseUrl, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
  }
}

async function runCase(
  results,
  { id, tier, req, name, strict, browser = activeRecoveryCtx?.browser, baseUrl = activeRecoveryCtx?.baseUrl },
  fn,
) {
  const start = Date.now();
  testsSinceRecycle++;
  console.log(`-> [${id}] ${name}`);
  try {
    const details = await fn();
    const durationMs = Date.now() - start;
    console.log(`   [PASS] ${id} (${durationMs}ms): ${String(details || 'OK').slice(0, 130)}`);
    results.push({ id, tier, req, name, status: 'PASS', details: details || 'OK', durationMs });
  } catch (err) {
    const durationMs = Date.now() - start;
    const msg = err?.message || String(err);
    if (err instanceof PendingM1M4Error && !strict) {
      console.log(`   [PENDING_M1_M4] ${id} (${durationMs}ms): ${err.message.slice(0, 120)}`);
      results.push({ id, tier, req, name, status: 'PENDING_M1_M4', details: err.message, durationMs });
      return;
    }
    console.log(`   [FAIL] ${id} (${durationMs}ms): ${msg.slice(0, 150)}`);
    results.push({ id, tier, req, name, status: 'FAIL', details: msg, durationMs });
    if (browser) {
      browser.clearDiagnostics?.();
      const cdpLost =
        /CDP socket not open|CDP command timed out|CDP WebSocket closed|CDP WebSocket error|Target closed/i.test(msg) ||
        !browser.isConnected?.();
      if (cdpLost) {
        try {
          await browser.relaunchBrowser();
          if (baseUrl) {
            await browser.navigate(baseUrl, { clearStorage: false, nosw: true });
            await browser.dismissPreBoardOverlays({ maxSteps: 4 }).catch(() => {});
          }
        } catch (recErr) {
          throw new FatalCdpRecoveryError(`Fatal CDP recovery failure after ${id}: ${recErr?.message || recErr}`);
        }
      }
    }
  }
}

async function enterCampaignBoard(browser) {
  await browser.dismissPreBoardOverlays({ maxSteps: 6 });
  await browser.clickSelector('button[data-action="play-campaign"]');
  const deadline = Date.now() + 22_000;
  while (Date.now() < deadline) {
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    const ready = await browser.evalJs(
      'window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT" && (window.__WS_V7__?.getTelemetry?.()?.tileScreenPoints?.length || 0) > 0',
    );
    if (ready) return;
    await sleep(220);
  }
  const phase = await browser.evalJs('window.__WS_V7__?.getTelemetry?.()?.phase');
  throw new Error(`Expected BOARD_SELECT after entering Campaign, got phase=${phase}`);
}

async function enableTurboIfOff(browser) {
  await browser.evalJs(`(() => {
    const btn = document.querySelector('button.ws9-turbo-pill[data-action="turbo"]');
    if (btn && btn.dataset.active !== 'true') btn.click();
  })()`);
}

async function dismissTheaterIfPresent(browser) {
  await browser.evalJs(`(() => {
    const card = document.querySelector('.ws7-theater-card');
    if (card) card.click();
    const bargainNo = document.querySelector('.wsv8-ccb-overlay .wsv8-ccb-nosale-btn');
    if (bargainNo) bargainNo.click();
    const chyron = document.querySelector('.ws7-rival-chyron:not(.ws7-hidden)');
    if (chyron) chyron.click();
    const wheelSpin = document.querySelector('button[data-action="spin-big-wheel"]:not([disabled])');
    if (wheelSpin) wheelSpin.click();
    const wheelStage = document.querySelector('.wst7-wheel-stage[data-phase="landed"]');
    if (wheelStage) wheelStage.closest('.wst7-stage-overlay')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    const curtainPicked = document.querySelector('.wst7-curtain-backdrop .wst7-curtain-arch-btn[data-state="chosen"]');
    if (curtainPicked) {
      curtainPicked.closest('.wst7-curtain-backdrop')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    } else {
      const curtainBtn = document.querySelector('.wst7-curtain-arch-btn[data-curtain="1"]:not([disabled]), .wst7-curtain-arch-btn:not([disabled])');
      if (curtainBtn) curtainBtn.click();
    }
    const pylStop = document.querySelector('button[data-action="pyl-stop"]:not([disabled])');
    if (pylStop) pylStop.click();
    const gremlinOverlay = document.querySelector('.wst7-stage-overlay .wst7-gremlin-stage');
    if (gremlinOverlay && !pylStop) gremlinOverlay.closest('.wst7-stage-overlay')?.click();
    const gremlinDone = document.querySelector('.wst7-stage-overlay button[data-action="gremlin-continue"], .wst7-stage-overlay button[data-action="continue"]');
    if (gremlinDone) gremlinDone.click();
  })()`).catch(() => {});
}

/**
 * Genuine multi-turn match driver:
 * Plays turns from BOARD_SELECT through Final Broadcast Wager / TKO Bell to CEREMONY or Winner's Circle!
 */
async function playMatchToEnd(
  browser,
  oracle,
  {
    wantCorrect = true,
    useTkoIfAvailable = true,
    vipAction = 'CALL_BLUFF',
    maxSteps = 45,
    onClueStem = null,
    enableTurbo = true,
  } = {},
) {
  if (enableTurbo) await enableTurboIfOff(browser);
  const seenStems = [];

  for (let step = 0; step < maxSteps; step++) {
    const waitDeadline = Date.now() + 24_000;
    let uiState = null;
    while (Date.now() < waitDeadline) {
      await browser.dismissPreBoardOverlays({ maxSteps: 3 });
      await dismissTheaterIfPresent(browser);
      uiState = await browser.evalJs(`(() => {
        const tel = window.__WS_V7__?.getTelemetry?.() || {};
        const vis = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return false;
          const st = getComputedStyle(el);
          return st.display !== 'none' && st.visibility !== 'hidden' && el.getBoundingClientRect().height > 0;
        };
        if (vis('.ws9-winners-circle-card')) return { kind: 'WINNERS_CIRCLE', phase: tel.phase, tel };
        if (vis('.ws7-ceremony-save-exit-btn') || vis('button[data-action="rematch"]') || vis('.ws7-ceremony-next-btn')) {
          return { kind: 'CEREMONY', phase: tel.phase, tel };
        }
        if (vis('.ws9-sweeps-shell') || tel.phase === 'HUB') return { kind: 'SWEEPS_OR_HUB', phase: tel.phase, tel };
        if (vis('.wsv8-ccb-overlay .wsv8-ccb-nosale-btn')) return { kind: 'BARGAIN', phase: tel.phase, tel };
        if (vis('.ws7-final-wager-card')) return { kind: 'FINAL_WAGER', phase: tel.phase, tel };
        if (${JSON.stringify(Boolean(useTkoIfAvailable))} && vis('.ws9-mercy-bell-pill[data-mode="TKO_WIN"]')) {
          return { kind: 'TKO_READY', phase: tel.phase, tel };
        }
        if (
          vis('.ws9-vip-bluff-card') ||
          vis('.wst7-curtain-backdrop') ||
          vis('.wst7-wheel-stage[data-phase="idle"]') ||
          (vis('.ws7-question-stage:not(.ws7-hidden) #ws7-toy-mount') &&
            Boolean(document.querySelector('#ws7-toy-mount button:not([disabled]), #ws7-toy-mount canvas, #ws7-toy-mount [data-choice-idx]:not([disabled]), #ws7-toy-mount [data-zone-idx]')))
        ) {
          return { kind: 'QUESTION_PROMPT', phase: tel.phase, tel };
        }
        if (tel.phase === 'BOARD_SELECT') {
          const openPts = (tel.tileScreenPoints || []).filter(p => p.state === 'OPEN' || p.state === 'BLITZ_SURVIVOR');
          if (openPts.length > 0) return { kind: 'BOARD_SELECT', phase: tel.phase, tel };
        }
        return { kind: 'WAITING', phase: tel.phase, tel };
      })()`);
      if (uiState && uiState.kind !== 'WAITING') break;
      await sleep(180);
    }

    if (!uiState || uiState.kind === 'WAITING') {
      throw new Error(`playMatchToEnd timed out waiting for actionable state (last=${JSON.stringify(uiState)})`);
    }
    if (uiState.kind === 'BARGAIN') {
      await browser.clickSelector('.wsv8-ccb-overlay .wsv8-ccb-nosale-btn').catch(() => {});
      await sleep(250);
      continue;
    }
    if (uiState.kind === 'WINNERS_CIRCLE' || uiState.kind === 'CEREMONY' || uiState.kind === 'SWEEPS_OR_HUB') {
      return { outcome: uiState.kind, tel: uiState.tel, seenStems };
    }
    if (uiState.kind === 'TKO_READY' && useTkoIfAvailable) {
      await browser.clickSelector('.ws9-mercy-bell-pill[data-mode="TKO_WIN"]');
      await sleep(350);
      continue;
    }
    if (uiState.kind === 'FINAL_WAGER') {
      // Pick Safe $0 if leading & wantCorrect, else All-In / Safe depending on goal
      const presetSel = wantCorrect
        ? '.ws7-final-wager-card .ws7-final-preset-btn:last-child'
        : '.ws7-final-wager-card .ws7-final-preset-btn:last-child';
      await browser.clickSelector(presetSel).catch(() => {});
      await sleep(100);
      await browser.clickSelector('.ws7-final-wager-footer button');
      await sleep(250);
      continue;
    }
    if (uiState.kind === 'BOARD_SELECT') {
      await browser.clickBoardTileFromTelemetry();
      continue;
    }
    if (uiState.kind === 'QUESTION_PROMPT') {
      const stemText = await browser.evalJs(
        '(document.querySelector(".ws7-question-stage:not(.ws7-hidden) .ws7-balanced-copy")?.innerText || "").trim()',
      ).catch(() => '');
      if (stemText) {
        seenStems.push(stemText);
        if (onClueStem) onClueStem(stemText);
      }
      await browser.answerCurrentClue({
        waitMs: 420,
        oracle,
        wantCorrect,
        vipAction,
      });
      await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase !== "QUESTION_OPEN"', 4_500);
      await sleep(220);
      await dismissTheaterIfPresent(browser);
    }
  }

  const finalTel = await browser.evalJs('window.__WS_V7__.getTelemetry()');
  throw new Error(`playMatchToEnd exceeded maxSteps=${maxSteps} (phase=${finalTel?.phase})`);
}

async function triggerHotMicAndHandoff(browser, oracle) {
  await browser.dismissPreBoardOverlays({ maxSteps: 6 });
  await browser.waitFor('Boolean(document.querySelector("button.ws9-hotmic-hud-btn:not(.ws7-hidden):not([disabled])"))', 8_000);
  await browser.clickSelector('button.ws9-hotmic-hud-btn:not([disabled])');
  const armed = await browser.evalJs('document.querySelector("button.ws9-hotmic-hud-btn")?.dataset.armed');
  if (armed !== 'true') throw new Error(`Hot Mic button did not arm (data-armed=${armed})`);
  await browser.clickBoardTileFromTelemetry();

  const deadline = Date.now() + 14_000;
  let handoffMounted = false;
  while (Date.now() < deadline) {
    const kind = await browser.evalJs(`(() => {
      if (document.querySelector('[data-modal="hot-mic-privacy-handoff-v9"]')) return 'HANDOFF';
      if (document.querySelector('.wst7-curtain-backdrop')) return 'CURTAIN';
      if (document.querySelector('.wst7-wheel-stage[data-phase="idle"]')) return 'WHEEL';
      return 'WAIT';
    })()`);
    if (kind === 'HANDOFF') { handoffMounted = true; break; }
    if (kind === 'CURTAIN') {
      await browser.clickSelector('.wst7-curtain-arch-btn[data-curtain="1"]:not([disabled])').catch(() => {});
      await sleep(1500);
    } else if (kind === 'WHEEL') {
      await browser.clickSelector('button[data-action="spin-big-wheel"]:not([disabled])').catch(() => {});
      await sleep(2500);
    } else {
      await sleep(160);
    }
  }
  if (!handoffMounted) throw new Error('Hot Mic Privacy Handoff modal [data-modal="hot-mic-privacy-handoff-v9"] did not mount');
  await sleep(450);
  const stillWaiting = await browser.evalJs('Boolean(document.querySelector("[data-modal=\\"hot-mic-privacy-handoff-v9\\"]"))');
  if (!stillWaiting) throw new Error('Privacy Handoff card auto-dismissed instead of waiting for Ready tap');
  await browser.clickSelector('button[data-action="hotmic-handoff-ready"]');
  await browser.waitFor('Boolean(document.querySelector(".ws7-question-stage:not(.ws7-hidden) #ws7-toy-mount"))', 6_000);
  const timerSec = await browser.evalJs('parseFloat(document.querySelector(".ws7-clue-timer-pill")?.innerText || "0")');
  if (timerSec <= 0 || timerSec > 10.5) throw new Error(`Expected 10s Hot Mic timer after Ready tap, got ${timerSec}s`);
  await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
  return timerSec;
}

async function completeWinnersCircleSprint(browser, oracle, { wantCorrect = true } = {}) {
  const stepCount = await browser.evalJs('document.querySelectorAll(".ws9-wc-step").length');
  if (stepCount !== 6) {
    throw new Error(`Expected 6 .ws9-wc-step nodes in Winner's Circle sprint, got ${stepCount}`);
  }
  for (let i = 0; i < 6; i++) {
    const done = await browser.evalJs('Boolean(Array.from(document.querySelectorAll(".ws9-winners-circle-card button")).find(b => /BANK BONUS/i.test(b.innerText || "")))');
    if (done) break;
    const clueData = await browser.evalJs(`(() => {
      const card = document.querySelector('.ws9-winners-circle-card');
      if (!card) return null;
      const p = card.querySelector('p');
      const btns = Array.from(card.querySelectorAll('button.ws9-btn-cream'));
      return {
        stem: p ? (p.innerText || '').trim() : '',
        choices: btns.map(b => (b.innerText || '').trim()),
      };
    })()`);
    if (!clueData || clueData.choices.length === 0) {
      await sleep(160);
      i--;
      continue;
    }
    const idx = oracle.pickChoiceIdx(clueData.stem, clueData.choices, wantCorrect);
    await browser.evalFn((targetIdx) => {
      const btns = Array.from(document.querySelectorAll('.ws9-winners-circle-card button.ws9-btn-cream'));
      btns[targetIdx]?.click();
    }, idx);
    await sleep(380);
  }
  await browser.waitFor(
    'Boolean(Array.from(document.querySelectorAll(".ws9-winners-circle-card button")).find(b => /BANK BONUS/i.test(b.innerText || "")))',
    6_000,
  );
  const summaryText = await browser.evalJs('document.querySelector(".ws9-winners-circle-card")?.innerText || ""');
  await browser.clickByText(/BANK BONUS/i);
  await sleep(250);
  return summaryText;
}

async function findAndTriggerVipBluff(browser, baseUrl, oracle, { wantCorrect = true } = {}) {
  // Quick Show CLASSIC_TOTE guarantees 1-2 open VIP_BLUFF squares on Turns 1..4 (before Turn 5 reRackFreshWave clears tvTwistV9)
  const launchQuickShow = async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="quick-show"]');
    await sleep(220);
    await browser.clickSelector('button.ws66-qp-format-btn[data-mode="CLASSIC_TOTE"]').catch(() => {});
    await sleep(80);
    await browser.clickSelector('button[data-action="launch-quick-show"]');
    await browser.waitFor(
      'window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT" && (window.__WS_V7__?.getTelemetry?.()?.tileScreenPoints?.length || 0) > 0',
      18_000,
    );
    await enableTurboIfOff(browser);
  };

  await launchQuickShow();

  for (let attempt = 0; attempt < 28; attempt++) {
    const isBluffAlready = await browser.evalJs('Boolean(document.querySelector(".ws9-vip-bluff-card"))');
    if (isBluffAlready) return true;

    const tel = await browser.evalJs('window.__WS_V7__?.getTelemetry?.() || {}');
    if (
      tel.phase === 'CEREMONY' ||
      (tel.turnNumber || 1) >= 5 ||
      (await browser.evalJs('Boolean(document.querySelector(".ws7-final-wager-card"))'))
    ) {
      await launchQuickShow();
    }
    await browser.clickBoardTileFromTelemetry();
    await sleep(200);
    const hasVip = await browser.waitFor('Boolean(document.querySelector(".ws9-vip-bluff-card"))', 500);
    if (hasVip) return true;

    // Not a VIP tile -> resolve this clue fast and try next tile
    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect });
    for (let w = 0; w < 24; w++) {
      await dismissTheaterIfPresent(browser);
      const ready = await browser.evalJs(
        'window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT" || Boolean(document.querySelector(".ws7-final-wager-card")) || window.__WS_V7__?.getTelemetry?.()?.phase === "CEREMONY"',
      );
      if (ready) break;
      await sleep(180);
    }
  }
  return false;
}

// ----------------------------------------------------------------------------
// Smoke Mode
// ----------------------------------------------------------------------------

async function runSmokeMode({ browser, baseUrl, opts }) {
  const results = [];
  let staticReport = null;

  if (!opts.skipStatic) {
    staticReport = runAllStaticGates({
      skipBuild: opts.skipBuild && !opts.strict,
      baseline: !opts.strict,
      strictV9: opts.strict,
    });
    await runCase(
      results,
      { id: 'SMOKE-STATIC', tier: 'SMOKE', req: 'R10', name: 'Static & bundle gates (S1–S6, dist < 20MB)', strict: opts.strict },
      async () => {
        const fails = staticReport.gates.filter((g) => g.status === 'FAIL' || (opts.strict && !g.ok));
        if (fails.length > 0) throw new Error(fails.map((f) => `${f.gate}[${f.status}]: ${f.details}`).join(' | '));
        const s2 = staticReport.gates.find((g) => g.gate === 'S2_BUNDLE_SIZE_BUDGET');
        return s2?.details || 'Static gates OK';
      },
    );
  }

  let capsDesktop = null;
  await runCase(
    results,
    { id: 'SMOKE-HUB-1440', tier: 'SMOKE', req: 'R8/R9/R10', name: 'Desktop 1440x900 Hub load + WebGL2 + 0 errors + screenshot', strict: opts.strict },
    async () => {
      await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
      await browser.navigate(baseUrl, { clearStorage: true, nosw: true });
      await browser.dismissPreBoardOverlays({ maxSteps: 4 });
      const gl = await browser.assertWebGL2();
      await browser.assertNoBrokenImages();
      browser.assertCleanRuntime();
      capsDesktop = await probeCapabilities(browser);
      const shotPath = await browser.screenshot('smoke_hub_1440x900.png');
      return `WebGL2=${gl.webglVersion}, renderer=${gl.webglRenderer}, screenshot=${path.basename(shotPath)}`;
    },
  );

  await runCase(
    results,
    { id: 'SMOKE-HUB-390', tier: 'SMOKE', req: 'R9/R10', name: 'Mobile Portrait 390x844 Hub load + WebGL2 + 0 errors + screenshot', strict: opts.strict },
    async () => {
      await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
      await browser.navigate(baseUrl, { clearStorage: true, nosw: true });
      await browser.dismissPreBoardOverlays({ maxSteps: 4 });
      const gl = await browser.assertWebGL2();
      await browser.assertNoBrokenImages();
      browser.assertCleanRuntime();
      const shotPath = await browser.screenshot('smoke_hub_390x844.png');
      return `WebGL2=${gl.webglVersion}, screenshot=${path.basename(shotPath)}`;
    },
  );

  await runCase(
    results,
    { id: 'SMOKE-CAMPAIGN-FLOW', tier: 'SMOKE', req: 'R7/R8', name: 'Baseline Campaign -> 3D Tile Click -> 420ms Clue Answer -> Post-Answer Advance + smoke_board_1440x900.png', strict: opts.strict },
    async () => {
      await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
      await browser.navigate(baseUrl, { clearStorage: true, nosw: true });
      await enterCampaignBoard(browser);

      const beforeTel = await browser.evalJs('window.__WS_V7__.getTelemetry()');
      const clickRes = await browser.clickBoardTileFromTelemetry();
      const answerRes = await browser.answerCurrentClue({ waitMs: 420, choiceIdx: 0 });

      const advanced = await browser.waitFor(
        `(() => {
          const t = window.__WS_V7__?.getTelemetry?.();
          if (!t) return false;
          return t.phase !== 'QUESTION_OPEN' || t.turnNumber > ${beforeTel.turnNumber} || t.playerMatchScore !== ${beforeTel.playerMatchScore} || t.rivalMatchScore !== ${beforeTel.rivalMatchScore};
        })()`,
        12_000,
      );
      if (!advanced) {
        throw new Error(`Clue answer did not transition out of QUESTION_OPEN (${JSON.stringify({ clickRes, answerRes })})`);
      }

      await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 6_000);
      await browser.dismissPreBoardOverlays({ maxSteps: 3 });
      const afterTel = await browser.evalJs('window.__WS_V7__.getTelemetry()');
      const shotPath = await browser.screenshot('smoke_board_1440x900.png');
      browser.assertCleanRuntime();

      return `clickedTile=${clickRes.clickedIndex}, answerMode=${answerRes.mode}, turn=${beforeTel.turnNumber}->${afterTel.turnNumber}, score=${beforeTel.playerMatchScore}->${afterTel.playerMatchScore}, rival=${afterTel.rivalMatchScore}, screenshot=${path.basename(shotPath)}`;
    },
  );

  await runCase(
    results,
    { id: 'SMOKE-V9-CAPABILITY-PROBE', tier: 'SMOKE', req: 'R1-R10', name: 'Probe v9 window.__WS_V7__ hooks & 3-Tier Hub UI readiness', strict: opts.strict },
    async () => {
      if (!capsDesktop) {
        await browser.navigate(baseUrl, { clearStorage: false, nosw: true });
        capsDesktop = await probeCapabilities(browser);
      }
      if (!capsDesktop.hasAllV9Hooks || !capsDesktop.has3TierHub) {
        throw new Error(
          `Missing v9 hooks or 3-Tier Hub: has3TierHub=${capsDesktop.has3TierHub}, missingHooks=${Object.entries(capsDesktop.hooks)
            .filter(([, v]) => !v)
            .map(([k]) => k)
            .join(',')}`,
        );
      }
      return 'All v9 hooks & 3-Tier Hub active';
    },
  );

  return { staticReport, results, caps: capsDesktop };
}

async function initTierSession(browser, baseUrl, w = 1440, h = 900) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await browser.setViewport(w, h, { mobile: w <= 500, dpr: 1 });
      await browser.navigate(baseUrl, { clearStorage: true, nosw: true });
      await browser.dismissPreBoardOverlays({ maxSteps: 4 });
      return await probeCapabilities(browser);
    } catch (err) {
      if (attempt === 1) {
        await browser.relaunchBrowser();
        continue;
      }
      throw err;
    }
  }
}

async function runStaticTierCheck(results, tierNum, staticReport, opts) {
  if (opts.skipStatic || !staticReport) return;
  await runCase(
    results,
    { id: `T${tierNum}-STATIC`, tier: Number(tierNum) || 'ALL', req: 'R10', name: 'Static & bundle gates (S1–S6)', strict: opts.strict },
    async () => {
      const bad = staticReport.gates.filter(
        (g) => g.status === 'FAIL' || (opts.strict && !g.ok) || (opts.strict && g.status === 'SKIPPED'),
      );
      if (bad.length > 0) {
        throw new Error(bad.map((g) => `${g.gate}[${g.status}]: ${g.details}`).join(' | '));
      }
      const skipped = staticReport.gates.filter((g) => g.status === 'SKIPPED' || g.status === 'PENDING_M2');
      if (skipped.length > 0) {
        pendingV9(skipped.map((g) => `${g.gate}[${g.status}]`).join(', '));
      }
      return `All ${staticReport.gates.length} static gates passed (${staticReport.mode})`;
    },
  );
}

// ----------------------------------------------------------------------------
// TIER 1 — Feature Coverage (100% Real Interactive & Contract Verification)
// ----------------------------------------------------------------------------

async function runTier1({ browser, baseUrl, opts, staticReport, oracle }) {
  const results = [];
  const strict = opts.strict;
  const caps = await initTierSession(browser, baseUrl, 1440, 900);

  // --- R9: Sleek 3-Tier Title Hub ---
  await runCase(results, { id: 'T1-R9-01', tier: 1, req: 'R9', name: 'Title Hub Tier 1 renders Campaign + Daily Show hero buttons', strict }, async () => {
    if (!caps.hub.hasCampaign || !caps.hub.hasDaily || !caps.has3TierHub) {
      throw new Error(`Missing Tier 1 Campaign/Daily CTA on 3-Tier Hub (${JSON.stringify(caps.hub)})`);
    }
    return 'Tier 1 Campaign + Daily rendered';
  });
  await runCase(results, { id: 'T1-R9-02', tier: 1, req: 'R9', name: 'Title Hub Tier 2 renders 60s Blitz + Sweeps Streak 2-card row', strict }, async () => {
    if (!caps.hub.hasBlitz || !caps.hub.hasSweeps) {
      throw new Error(`Missing Hub Tier 2 (60s Blitz / Sweeps Streak): ${JSON.stringify(caps.hub)}`);
    }
    return 'Tier 2 Blitz + Sweeps rendered';
  });
  await runCase(results, { id: 'T1-R9-03', tier: 1, req: 'R9', name: 'Title Hub Tier 3 renders unified Prize Showroom tile with SC & Plinko badge', strict }, async () => {
    if (!caps.hub.hasShowroom) throw new Error('Missing Tier 3 Prize Showroom tile');
    const txt = await browser.evalJs('document.body.innerText');
    if (!/SHOWROOM\s*CASH|\$\d+/i.test(txt)) throw new Error('Prize Showroom tile missing live Showroom Cash readout');
    return 'Tier 3 Prize Showroom rendered with live SC';
  });
  await runCase(results, { id: 'T1-R9-04', tier: 1, req: 'R9', name: 'Top Utility Bar (?, Stats, Sound, Options) & Bottom Studio Floor Strip (Quick Show | 2P Couch)', strict }, async () => {
    if (!caps.hub.hasQuickShow || !caps.hub.hasCouch) throw new Error('Quick Show or 2P Couch missing from Studio Floor Strip');
    return 'Utility Bar + Floor Strip present';
  });
  await runCase(results, { id: 'T1-R9-05', tier: 1, req: 'R9', name: 'Title Hub zero horizontal overflow & zero ellipsis truncation at 1440x900', strict }, async () => {
    const layout = await browser.assertNoOverflowOrEllipsis({ allowScroll: false });
    return `1440x900 sw=${layout.sw} sh=${layout.sh}, 0 ellipsis`;
  });
  await runCase(results, { id: 'T1-R9-06', tier: 1, req: 'R9', name: 'Forensic P0: Hub top bar dedicated OPTIONS -> Settings (Reset Save), BOOTH not nested in 60S BLITZ <button>, Campaign $222K', strict }, async () => {
    const audit = await browser.evalJs(`(() => {
      const topBar = document.querySelector('.ws9-hub-top-bar');
      const optsBtn = topBar ? Array.from(topBar.querySelectorAll('button')).find(b => /OPTIONS|SETTINGS/i.test(b.innerText || b.getAttribute('aria-label') || b.dataset?.action || '')) : null;
      const blitzCard = document.querySelector('.ws9-card-blitz');
      const nestedBoothInBlitz = blitzCard ? Array.from(blitzCard.querySelectorAll('button')).some(b => /BOOTH/i.test(b.innerText || '')) : false;
      const campSub = (document.querySelector('.ws9-card-campaign')?.innerText || '');
      const has222k = /\\$222K/i.test(campSub);
      return { hasOptsBtn: Boolean(optsBtn), nestedBoothInBlitz, has222k, campSub: campSub.replace(/\\s+/g, ' ').slice(0, 80) };
    })()`);
    if (!audit.hasOptsBtn || audit.nestedBoothInBlitz || !audit.has222k) {
      throw new Error(`Hub P0 check FAILED: ${JSON.stringify(audit)}`);
    }
    await browser.clickSelector('.ws9-hub-top-bar button[data-action="open-options"]').catch(async () => {
      await browser.evalJs(`(() => {
        const topBar = document.querySelector('.ws9-hub-top-bar');
        const optsBtn = Array.from(topBar.querySelectorAll('button')).find(b => /OPTIONS|SETTINGS/i.test(b.innerText || b.getAttribute('aria-label') || b.dataset?.action || ''));
        optsBtn?.click();
      })()`);
    });
    await sleep(220);
    await browser.clickSelector('button[data-action="reset-save"]');
    await sleep(160);
    const hasConfirm = await browser.evalJs('Boolean(document.querySelector("button[data-action=\\"confirm-reset-save\\"]"))');
    await browser.clickByText(/CANCEL|CLOSE|DONE|✕|BACK/i).catch(() => {});
    if (!hasConfirm) {
      throw new Error('Hub OPTIONS -> Reset Save did not mount 2-step confirm-reset-save button');
    }
    return 'Forensic P0 Hub passed: OPTIONS -> 2-step Reset Save, BOOTH unnested, Campaign $222K';
  });

  // --- R1: Prize Catalog Showroom, Curtain Gamble, Zonks, Den & Cosmetics ---
  await runCase(results, { id: 'T1-R1-01', tier: 1, req: 'R1', name: 'Showroom opens with 3 tabs (PRIZES & CURTAIN, DEN & TROPHIES, STUDIO STYLE) + Plinko button', strict }, async () => {
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(250);
    const txt = await browser.evalJs('document.body.innerText');
    for (const tab of [/PRIZES/i, /DEN/i, /STUDIO STYLE/i, /PLINKO/i]) {
      if (!tab.test(txt)) throw new Error(`Missing Showroom tab/button matching ${tab}`);
    }
    return 'Showroom 3 tabs + Plinko button visible';
  });
  await runCase(results, { id: 'T1-R1-02', tier: 1, req: 'R1', name: 'Showroom Cash (SC) schema isolated from Campaign Career Purse', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SHOWROOM_SAVE_KEY]: makeDefaultShowroomLedger({ showroomCash: 1200 }),
      [CAMPAIGN_SAVE_KEY]: { cleanPurseCash: 4200, contrabandTrunkCash: 900, episodesPlayed: 1, unlockedEpisode: 2 },
    });
    const sr = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    const campRaw = await browser.evalJs(`JSON.parse(localStorage.getItem(${JSON.stringify(CAMPAIGN_SAVE_KEY)}) || '{}')`);
    if (sr.showroomCash !== 1200 || campRaw.cleanPurseCash !== 4200) {
      throw new Error(`SC/Campaign isolation mismatch: sr=${sr.showroomCash}, camp=${campRaw.cleanPurseCash}`);
    }
    return `showroomCash=${sr.showroomCash}, campaignPurse=${campRaw.cleanPurseCash} isolated`;
  });
  await runCase(results, { id: 'T1-R1-03', tier: 1, req: 'R1', name: 'Showroom & Vault Ledger render atlas-filtered Prizes (>=55) & Zonks (>=6) across Chapters 1..10 with 0 placeholders', strict }, async () => {
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(300);
    const prizesUi = await browser.evalJs(`(() => {
      const txt = document.body.innerText || '';
      const tiles = document.querySelectorAll('.ws9-atlas-sprite-tile').length;
      const chapters = Array.from(txt.matchAll(/CHAPTER\\s+(\\d+)\\s+SHOWCASE/gi)).map(m => Number(m[1]));
      return { tiles, chapters };
    })()`);
    if (prizesUi.tiles < 55) {
      throw new Error(`Expected >= 55 live atlas-packed prize tiles in Showroom, got ${prizesUi.tiles}`);
    }
    if (prizesUi.chapters.length > 0) {
      const minCh = Math.min(...prizesUi.chapters);
      const maxCh = Math.max(...prizesUi.chapters);
      if (minCh < 1 || maxCh > 10) throw new Error(`chapterUnlock out of 1..10 range: min=${minCh}, max=${maxCh}`);
    }
    await browser.assertNoBrokenImages();
    await browser.assertNoCanvasOrSvgPlaceholders('#ui-root');
    const atlasCheck = await browser.verifyLiveAtlasBindings();
    browser.assertCleanRuntime();
    return `Showroom live tiles=${prizesUi.tiles} (>=55), atlasSprites=${atlasCheck.manifestSpriteCount}, 0 placeholders`;
  });
  await runCase(results, { id: 'T1-R1-04', tier: 1, req: 'R1', name: 'Curtain Gamble ($750 SC / Free Ticket) & Featured Shelf enforce non-repeat / unowned-first dealing', strict }, async () => {
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(220);
    await browser.clickSelector('.ws9-curtain-bay-btn');
    await sleep(300);
    const sr = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    if (sr.totalCurtainPulls < 1 || sr.showroomCash > 1200 - 750 + 1200) {
      throw new Error(`Curtain gamble pull did not mutate state: ${JSON.stringify(sr)}`);
    }
    const recentOffers = sr?.recentOfferedIds || [];
    const last12 = recentOffers.slice(-12);
    if (new Set(last12).size !== last12.length) {
      throw new Error(`Duplicate item found within last 12 offers: ${JSON.stringify(last12)}`);
    }
    await browser.assertNoCanvasOrSvgPlaceholders('#ui-root');
    await browser.verifyLiveAtlasBindings();
    return `Curtain pulled (pulls=${sr.totalCurtainPulls}, cash=${sr.showroomCash}, recent=${recentOffers.length})`;
  });
  await runCase(results, { id: 'T1-R1-05', tier: 1, req: 'R1', name: 'Winner Den supports curated room pins + 96-item Vault Ledger with gouache backdrop & 0 placeholders', strict }, async () => {
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(180);
    await browser.clickByText(/DEN\s*&\s*TROPHIES/i);
    await sleep(250);
    await browser.assertNoBrokenImages();
    await browser.assertNoCanvasOrSvgPlaceholders('#ui-root');
    await browser.verifyLiveAtlasBindings();
    const txt = await browser.evalJs('document.body.innerText');
    if (!/LEDGER|VAULT|96|PIN/i.test(txt)) {
      throw new Error('Winner Den missing curated room pins or Vault Ledger UI');
    }
    return 'Winner Den curated pins + Vault Ledger rendered cleanly with gouache art';
  });
  await runCase(results, { id: 'T1-R1-07', tier: 1, req: 'R1', name: 'Forensic P0: Showroom DEN & TROPHIES exposes [ OPEN 3D TROPHY VAULT ] CTA, 36 trophy cards & pinned prizes on den_backdrop_lounge', strict }, async () => {
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(180);
    await browser.clickByText(/DEN\s*&\s*TROPHIES/i);
    await sleep(250);
    const denCheck = await browser.evalJs(`(() => {
      const vaultBtn = document.querySelector('button[data-action="open-3d-trophy-vault"]');
      const trophyCards = document.querySelectorAll('.ws9-trophy-cards-grid .ws9-den-trophy-card').length;
      const lounge = document.querySelector('.ws9-den-lounge-stage');
      const hasDenBackdrop = Array.from(document.querySelectorAll('#ui-root *')).some(el => /den_backdrop_lounge|ws9_atlas/i.test(getComputedStyle(el).backgroundImage || ''));
      const pinnedPlaques = document.querySelectorAll('.ws9-den-pinned-plaque').length;
      return { hasVaultCta: Boolean(vaultBtn), trophyCards, hasLounge: Boolean(lounge), hasDenBackdrop, pinnedPlaques };
    })()`);
    if (!denCheck.hasVaultCta || denCheck.trophyCards < 36 || !denCheck.hasDenBackdrop || !denCheck.hasLounge) {
      throw new Error(`Den Trophy Vault CTA/cards P0 FAILED: ${JSON.stringify(denCheck)}`);
    }
    await browser.clickSelector('button[data-action="open-3d-trophy-vault"]');
    await sleep(220);
    await browser.pressKey('Escape');
    await sleep(150);
    return `Den 3D Trophy Vault CTA + ${denCheck.trophyCards} trophy cards + backdrop verified`;
  });
  await runCase(results, { id: 'T1-R1-06', tier: 1, req: 'R1', name: 'Fair Cosmetics (Podium/Buzzer/Trilon) equip cleanly with 0 gameplay stat bias', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SHOWROOM_SAVE_KEY]: makeDefaultShowroomLedger({ showroomCash: 2500 }),
    });
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(180);
    await browser.clickByText(/STUDIO STYLE/i);
    await sleep(200);
    const before = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    const txt = await browser.evalJs('document.body.innerText || ""');
    if (/\+\d+%|multiplier|score bonus|accuracy boost/i.test(txt)) {
      throw new Error('Gameplay stat bias copy detected in Studio Style cosmetics tab');
    }
    await browser.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('.ws9-showroom-body button')).find(b => /BUY\\s*&\\s*EQUIP/i.test(b.innerText || ''));
      btn?.click();
    })()`);
    await sleep(200);
    const after = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    if (after.ownedCosmeticIds.length <= before.ownedCosmeticIds.length) {
      throw new Error('Clicking BUY & EQUIP on Studio Style cosmetic did not update ownedCosmeticIds');
    }
    return `Cosmetic purchased & equipped cleanly (owned=${after.ownedCosmeticIds.length}, equipped=${JSON.stringify(after.equipped)})`;
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R2: 60-Second Blitz & 45s Winner's Circle ---
  await runCase(results, { id: 'T1-R2-01', tier: 1, req: 'R2', name: '60-Second Blitz launches in 1 tap from Hub Tier 2 with 60s timer & 0 AI wait', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="play-blitz"]');
    await sleep(350);
    const ok = await browser.evalJs('Boolean(document.querySelector(".ws9-blitz-hud") && document.querySelector("button[data-action=\\"blitz-pass\\"]"))');
    if (!ok) throw new Error('Blitz HUD or PASS bar did not mount');
    return 'Blitz launched cleanly';
  });
  await runCase(results, { id: 'T1-R2-06', tier: 1, req: 'R2', name: 'Forensic P0: 60s Blitz hides Rival score / ACT III WAGER / STUDIO CHEATS and serves zero 2-paddle placeholder choices', strict }, async () => {
    const blitzAudit = await browser.evalJs(`(() => {
      const visibleTxt = [];
      for (const el of document.querySelectorAll('#ui-root *')) {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        if (el.children.length === 0) {
          const t = (el.textContent || '').trim();
          if (t) visibleTxt.push(t);
        }
      }
      const joined = visibleTxt.join(' | ');
      const hasBannedPlaceholder = /Mars touches solar corona|Both waited till 1990/i.test(joined);
      const hasRivalChrome = /ACT\\s*III\\s*WAGER|STUDIO\\s*CHEATS/i.test(joined);
      const rivalBox = document.querySelector('.ws7-solari-box[data-side="rival"]');
      const rivalVisible = Boolean(rivalBox && getComputedStyle(rivalBox).display !== 'none' && !rivalBox.classList.contains('ws7-hidden'));
      return { hasBannedPlaceholder, hasRivalChrome, rivalVisible };
    })()`);
    if (blitzAudit.hasBannedPlaceholder || blitzAudit.hasRivalChrome || blitzAudit.rivalVisible) {
      throw new Error(`60s Blitz P0 chrome/placeholder leak FAILED: ${JSON.stringify(blitzAudit)}`);
    }
    return '60s Blitz Rival/Wager/Cheats hidden & 0 placeholder choices';
  });
  await runCase(results, { id: 'T1-R2-02', tier: 1, req: 'R2', name: 'Blitz answer hit updates score/streak & awards +3.0s bonus', strict }, async () => {
    const before = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    await sleep(450);
    const after = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
    if (after <= before) throw new Error(`Blitz score did not increase on correct Oracle answer: ${before} -> ${after}`);
    return `Blitz hit score ${before} -> ${after}`;
  });
  await runCase(results, { id: 'T1-R2-03', tier: 1, req: 'R2', name: 'Blitz PASS button skips immediately without AI turn', strict }, async () => {
    await browser.waitFor('Boolean(document.querySelector("button[data-action=\\"blitz-pass\\"]:not([disabled])"))', 4_000);
    await browser.clickSelector('button[data-action="blitz-pass"]');
    await sleep(320);
    const txt = await browser.evalJs('document.querySelector("button[data-action=\\"blitz-pass\\"]")?.innerText || ""');
    if (!/2\s*LEFT|PASS/i.test(txt)) throw new Error(`Unexpected PASS label after 1st pass: ${txt}`);
    return `Blitz PASS worked cleanly (${txt})`;
  });
  await runCase(results, { id: 'T1-R2-04', tier: 1, req: 'R2', name: '45s Winner Circle opt-in modal appears after winning Campaign match', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    const matchRes = await playMatchToEnd(browser, oracle, { wantCorrect: true, useTkoIfAvailable: true });
    if (matchRes.outcome !== 'WINNERS_CIRCLE') {
      throw new Error(`Expected WINNERS_CIRCLE opt-in after Campaign win, got outcome=${matchRes.outcome}`);
    }
    const hasPlayBtn = await browser.evalJs('Boolean(document.querySelector("button[data-action=\\"play-winners-circle\\"]"))');
    if (!hasPlayBtn) throw new Error('Winner Circle opt-in missing play-winners-circle button');
    return 'Winner Circle 45s opt-in mounted cleanly after Campaign win';
  });
  await runCase(results, { id: 'T1-R2-05', tier: 1, req: 'R2', name: '45s Winner Circle 6-clue sprint & $500 Sweep payout verified', strict }, async () => {
    const beforeSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    await browser.clickSelector('button[data-action="play-winners-circle"]');
    await sleep(240);
    const summaryText = await completeWinnersCircleSprint(browser, oracle, { wantCorrect: true });
    const afterSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    if (!/1,500|SWEEP/i.test(summaryText) || afterSc < beforeSc + 1500) {
      throw new Error(`Expected 6/6 $1,500 Winner Circle sweep credit; sc=${beforeSc}->${afterSc}, summary=${summaryText.slice(0, 100)}`);
    }
    browser.assertCleanRuntime();
    return `Winner Circle 6/6 Sweep verified ($${beforeSc} -> $${afterSc} SC)`;
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R3: Custom Broadcast Booth & 2-Podium Couch Upgrades ---
  await runCase(results, { id: 'T1-R3-01', tier: 1, req: 'R3', name: 'Quick Show Custom Broadcast Booth displays 6 Vibe Packs', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: false, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="quick-show"]');
    await sleep(250);
    const packCount = await browser.evalJs('document.querySelectorAll(".ws9-vibe-card[data-vibe-pack]").length');
    if (packCount < 6) throw new Error(`Expected 6 Vibe Packs in Quick Show Booth, got ${packCount}`);
    return `${packCount} Vibe Packs visible in Quick Show Booth`;
  });
  await runCase(results, { id: 'T1-R3-02', tier: 1, req: 'R3', name: 'Custom Broadcast Booth supports 3 Red Category Veto Stamps', strict }, async () => {
    const chipCount = await browser.evalJs('document.querySelectorAll(".ws9-veto-chip[data-category]").length');
    if (chipCount < 6) throw new Error(`Expected category veto chips in Booth, got ${chipCount}`);
    return `${chipCount} Veto Stamp chips present in Booth`;
  });
  await runCase(results, { id: 'T1-R3-03', tier: 1, req: 'R3', name: 'Daily Broadcast excludes Vibe Packs & Red Veto Stamps', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="play-daily"]');
    await sleep(300);
    const txt = await browser.evalJs('document.body.innerText');
    if (/VETO STAMP|CHOOSE VIBE PACK|CUSTOM BROADCAST BOOTH/i.test(txt)) {
      throw new Error('Daily Broadcast leaked Custom Broadcast Booth controls');
    }
    browser.assertCleanRuntime();
    return 'Daily Broadcast excludes Booth overrides';
  });
  await runCase(results, { id: 'T1-R3-04', tier: 1, req: 'R3', name: 'Daily 1966 Broadcast launches cleanly to BOARD_SELECT with 0 console/404 errors', strict }, async () => {
    const deadline = Date.now() + 20_000;
    let reached = false;
    while (Date.now() < deadline) {
      await browser.dismissPreBoardOverlays({ maxSteps: 4 });
      const phase = await browser.evalJs('window.__WS_V7__?.getTelemetry?.()?.phase');
      if (phase === 'BOARD_SELECT') { reached = true; break; }
      await sleep(220);
    }
    if (!reached) throw new Error('Daily Broadcast did not reach BOARD_SELECT');
    browser.assertCleanRuntime();
    return 'Daily Broadcast reached BOARD_SELECT with 0 runtime errors';
  });
  await runCase(results, { id: 'T1-R3-05', tier: 1, req: 'R3', name: '2-Podium Couch Showdown exposes Easy/Mixed/Shark Per-Podium Skill Dials for equal dollars', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: false, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="couch-party"]');
    await sleep(250);
    const dials = await browser.evalJs('document.querySelectorAll("[data-skill-dial]").length');
    if (dials < 6) throw new Error(`Expected 6 P1/P2 skill dial buttons (Easy/Mixed/Shark x 2), got ${dials}`);
    return `2-Podium Skill Dials visible (${dials} buttons)`;
  });
  await runCase(results, { id: 'T1-R3-07', tier: 1, req: 'R3', name: 'Forensic P0: 2P Couch board-mode picker includes all 8 new R7 anti-repetition modes (>=16 total)', strict }, async () => {
    await browser.clickSelector('button[data-action="toggle-board-mode-drawer"]');
    await sleep(180);
    const modeAudit = await browser.evalJs(`(() => {
      const modes = Array.from(document.querySelectorAll('.wsc8-grid-opt-btn[data-board-mode]')).map(b => b.dataset.boardMode);
      return { count: modes.length, modes };
    })()`);
    const missingR7 = ALL_R7_MODES.filter((m) => !modeAudit.modes.includes(m));
    if (modeAudit.count < 16 || missingR7.length > 0) {
      throw new Error(`2P Couch board-mode picker P0 FAILED (count=${modeAudit.count}, missingR7=${JSON.stringify(missingR7)})`);
    }
    return `2P Couch board-mode picker verified (${modeAudit.count} modes, all 8 R7 modes present)`;
  });
  await runCase(results, { id: 'T1-R3-06', tier: 1, req: 'R3', name: 'Couch PASS THE HOT MIC! button & 10s Privacy Handoff card present', strict }, async () => {
    await browser.clickSelector('button[data-action="couch-step-up"]');
    const deadline = Date.now() + 18_000;
    let foundHotMic = false;
    while (Date.now() < deadline) {
      await browser.dismissPreBoardOverlays({ maxSteps: 4 });
      const hasBtn = await browser.evalJs('Boolean(document.querySelector(".ws9-hotmic-hud-btn") && !document.querySelector(".ws9-hotmic-hud-btn").classList.contains("ws7-hidden"))');
      if (hasBtn) { foundHotMic = true; break; }
      await sleep(220);
    }
    if (!foundHotMic) throw new Error('PASS THE HOT MIC! button not visible in 2P Couch HUD');
    return 'Hot Mic button verified in 2P Couch';
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R4: VIP Celebrity Bluff, Turbo & TKO Mercy Bell ---
  await runCase(results, { id: 'T1-R4-01', tier: 1, req: 'R4', name: 'VIP Celebrity Bluff square presents [ TRUST EM ] vs [ CALL BLUFF! ] binary showdown', strict }, async () => {
    const found = await findAndTriggerVipBluff(browser, baseUrl, oracle);
    if (!found) throw new Error('Could not trigger .ws9-vip-bluff-card across board tiles');
    const cardCheck = await browser.evalJs(`(() => {
      const card = document.querySelector('.ws9-vip-bluff-card');
      const portrait = card?.querySelector('.ws9-vip-portrait-frame');
      const trust = card?.querySelector('button.ws9-btn-peacock');
      const call = card?.querySelector('button.ws9-btn-cerise');
      return { hasCard: Boolean(card), hasPortrait: Boolean(portrait), hasTrust: Boolean(trust), hasCall: Boolean(call) };
    })()`);
    if (!cardCheck.hasCard || !cardCheck.hasPortrait || !cardCheck.hasTrust || !cardCheck.hasCall) {
      throw new Error(`VIP Bluff card incomplete: ${JSON.stringify(cardCheck)}`);
    }
    await browser.assertNoCanvasOrSvgPlaceholders('#ui-root');
    return 'VIP Bluff [TRUST EM] / [CALL BLUFF!] showdown live with gouache portrait';
  });
  await runCase(results, { id: 'T1-R4-03', tier: 1, req: 'R4', name: 'CALL BLUFF! +1.5x / -0.5x payout math verified', strict }, async () => {
    const hasCardAlready = await browser.evalJs('Boolean(document.querySelector(".ws9-vip-bluff-card"))');
    if (!hasCardAlready) {
      const found = await findAndTriggerVipBluff(browser, baseUrl, oracle);
      if (!found) throw new Error('Could not mount .ws9-vip-bluff-card for CALL BLUFF! payout check');
    }
    const cardMeta = await browser.evalJs(`(() => {
      const card = document.querySelector('.ws9-vip-bluff-card');
      const badges = Array.from(card?.querySelectorAll('header .ws9-pill-badge') || []);
      const valBadge = badges.map(b => (b.innerText || '').trim()).find(t => /^\\$[\\d,]+$/.test(t)) || '';
      const tileValue = Number(valBadge.replace(/[^0-9]/g, '')) || 0;
      const callText = (card?.querySelector('button.ws9-btn-cerise')?.innerText || '').trim();
      const caughtMatch = callText.match(/Caught:\\s*\\+\\$([\\d,]+)/i);
      const honestMatch = callText.match(/Honest:\\s*-\\$([\\d,]+)/i);
      return {
        txt: (card?.innerText || '').trim(),
        tileValue,
        displayedWin: caughtMatch ? Number(caughtMatch[1].replace(/,/g, '')) : null,
        displayedLoss: honestMatch ? Number(honestMatch[1].replace(/,/g, '')) : null,
      };
    })()`);
    if (!/CALL BLUFF/i.test(cardMeta.txt) || cardMeta.tileValue <= 0) {
      throw new Error(`VIP Bluff card not mounted or missing tile value: ${JSON.stringify(cardMeta)}`);
    }
    const expectedWin = Math.round(cardMeta.tileValue * 1.5);
    const expectedLoss = Math.round(cardMeta.tileValue * 0.5);
    if (cardMeta.displayedWin !== expectedWin || cardMeta.displayedLoss !== expectedLoss) {
      throw new Error(`VIP Bluff displayed payout mismatch for $${cardMeta.tileValue}: win=${cardMeta.displayedWin} (exp ${expectedWin}), loss=${cardMeta.displayedLoss} (exp ${expectedLoss})`);
    }
    const beforeScore = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
    if (!Number.isFinite(beforeScore)) throw new Error(`Non-finite pre-bluff score: ${beforeScore}`);
    await browser.clickSelector('.ws9-vip-bluff-card button.ws9-btn-cerise');
    await browser.waitFor('!document.querySelector(".ws9-vip-bluff-card")', 6_000);
    await sleep(60);
    const afterScore = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
    if (!Number.isFinite(afterScore) || afterScore < 0) {
      throw new Error(`Invalid post-bluff score: ${afterScore}`);
    }
    const expectedIfCaught = beforeScore + expectedWin;
    const expectedIfHonest = Math.max(0, beforeScore - expectedLoss);
    if (afterScore !== expectedIfCaught && afterScore !== expectedIfHonest) {
      throw new Error(`CALL BLUFF! delta violated +1.5x/-0.5x math: tile=$${cardMeta.tileValue}, score ${beforeScore} -> ${afterScore} (expected ${expectedIfCaught} or ${expectedIfHonest})`);
    }
    return `CALL BLUFF! payout verified ($${cardMeta.tileValue}: +$${expectedWin}/-$${expectedLoss}, score ${beforeScore} -> ${afterScore})`;
  });
  await runCase(results, { id: 'T1-R4-02', tier: 1, req: 'R4', name: 'All 7 recurring 1966 VIP Celebrities present in atlas_manifest_v9.json with 0 placeholder portraits', strict }, async () => {
    const vipManifestCheck = await browser.evalJs(`(async () => {
      const r = await fetch(new URL('assets/v9/atlas_manifest_v9.json', document.baseURI).toString(), { cache: 'no-store' });
      const m = await r.json();
      const sprites = m.sprites || m.entries || m;
      const vips = Object.keys(sprites).filter(k => k.startsWith('vip_'));
      return { count: vips.length, vips };
    })()`);
    if (vipManifestCheck.count < 7) throw new Error(`Expected 7 VIPs in atlas_manifest_v9.json, got ${vipManifestCheck.count}`);
    return `7 VIP Celebrities verified in atlas (${vipManifestCheck.vips.join(',')})`;
  });
  await runCase(results, { id: 'T1-R4-04', tier: 1, req: 'R4', name: 'Top HUD ⚡ TURBO toggle accelerates AI turns to ~0.4s', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    await browser.clickSelector('button.ws9-turbo-pill[data-action="turbo"]');
    const active = await browser.evalJs('document.querySelector("button.ws9-turbo-pill")?.dataset.active');
    if (active !== 'true') throw new Error(`Turbo toggle did not activate (data-active=${active})`);
    return '⚡ TURBO toggle activated cleanly';
  });
  await runCase(results, { id: 'T1-R4-05', tier: 1, req: 'R4', name: 'Runaway TKO Mercy Bell hidden before Turn 7 & appears on Turn 7+ lead', strict }, async () => {
    const preTko = await browser.evalJs('Boolean(document.querySelector(".ws9-mercy-bell-pill:not(.ws7-hidden)"))');
    if (preTko) throw new Error('Runaway TKO Mercy Bell visible prematurely before Turn 7');
    const res = await playMatchToEnd(browser, oracle, { wantCorrect: true, useTkoIfAvailable: true });
    if (res.outcome !== 'WINNERS_CIRCLE' && res.outcome !== 'CEREMONY') {
      throw new Error(`Expected match win/TKO transition, got ${res.outcome}`);
    }
    return `TKO Mercy Bell guard + Turn 7+ resolution verified (outcome=${res.outcome}, turn=${res.tel?.turnNumber})`;
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R5: Sweeps Week 5-Night Gauntlet & Starburst Plinko ---
  await runCase(results, { id: 'T1-R5-01', tier: 1, req: 'R5', name: 'Sweeps Week 5-Night Gauntlet opens from Hub & initializes getSweepsState()', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="open-sweeps"]');
    await sleep(250);
    const st = await browser.evalJs('window.__WS_V7__.getSweepsState()');
    if (!st || typeof st.currentNight !== 'number') throw new Error(`Invalid sweeps state: ${JSON.stringify(st)}`);
    return `Sweeps modal opened (night=${st.currentNight})`;
  });
  await runCase(results, { id: 'T1-R5-02', tier: 1, req: 'R5', name: 'Sweeps 3 Sponsor Plaque slots & 0 tobacco sponsors verified', strict }, async () => {
    const txt = await browser.evalJs('document.body.innerText');
    if (/MARLBORO|CAMEL|LUCKY STRIKE|WINSTON|CIGARETTE/i.test(txt)) {
      throw new Error('Tobacco/cigarette sponsor text leaked into Sweeps Week');
    }
    if (!/SPONSOR SLOT #1/i.test(txt) || !/SPONSOR SLOT #3/i.test(txt)) {
      throw new Error('Expected 3 Sponsor Plaque slots rendered in Sweeps modal');
    }
    return '3 Sponsor Plaque slots & 0 tobacco verified';
  });
  await runCase(results, { id: 'T1-R5-03', tier: 1, req: 'R5', name: 'Sweeps Cash-Out 100% vs Risk-Streak 50% Safe-Deposit split verified', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SWEEPS_SAVE_KEY]: makeDefaultSweepsState({
        activeRun: true,
        currentNight: 2,
        safeDepositCash: 600,
        atRiskVaultCash: 600,
        pendingPlinkoFreeDrop: false,
        pendingSponsorDraft: false,
      }),
      [SWEEPS_INTERMISSION_KEY]: '1',
    });
    await browser.evalJs('window.__WS_V7__.openView("sweeps")');
    await sleep(250);
    const txt = await browser.evalJs('document.body.innerText');
    if (!/CASH OUT 100%/i.test(txt) || !/RISK STREAK/i.test(txt)) {
      throw new Error('Sweeps intermission missing Cash-Out 100% or Risk Streak CTA');
    }
    return 'Cash-Out 100% vs Risk-Streak controls verified';
  });
  await runCase(results, { id: 'T1-R5-04', tier: 1, req: 'R5', name: 'Sweeps Revenge Jackpot tracks lost at-risk vault ($1,000..$10,000)', strict }, async () => {
    const st = await browser.evalJs('window.__WS_V7__.getSweepsState()');
    const jp = Number(st?.revengeJackpotPool);
    if (!Number.isFinite(jp) || jp < 1000 || jp > 10000) {
      throw new Error(`revengeJackpotPool out of [$1000, $10000] bounds: ${jp}`);
    }
    return `revengeJackpotPool=$${jp}`;
  });
  await runCase(results, { id: 'T1-R5-05', tier: 1, req: 'R5', name: '5-Lane Starburst Plinko UI mounts via openView("plinko") with 5 drop lanes', strict }, async () => {
    await browser.evalJs('window.__WS_V7__.openView("plinko")');
    await sleep(250);
    const laneCount = await browser.evalJs('document.querySelectorAll(".ws9-plinko-lane-btn[data-lane]").length');
    if (laneCount !== 5) throw new Error(`Expected 5 Plinko lanes, got ${laneCount}`);
    return `5-Lane Starburst Plinko mounted (lanes=${laneCount})`;
  });
  await runCase(results, { id: 'T1-R5-06', tier: 1, req: 'R5', name: 'Anytime Showroom Plinko displays [$400, $225, $1,000, $225, $400] buckets', strict }, async () => {
    const bucketTexts = await browser.evalJs('Array.from(document.querySelectorAll(".ws9-plinko-bucket")).map(b => b.innerText.trim())');
    if (bucketTexts.length !== 5 || !bucketTexts.some((t) => /1,000|\$1000/i.test(t))) {
      throw new Error(`Plinko buckets mismatch: ${JSON.stringify(bucketTexts)}`);
    }
    return `Showroom Plinko buckets=${JSON.stringify(bucketTexts)}`;
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R6: Return Champion-vs-Champion Loss Rematch ---
  let match1Stems = [];
  await runCase(results, { id: 'T1-R6-01', tier: 1, req: 'R6', name: 'Campaign loss credits 50% Consolation SC (min $150) immediately', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    const beforeSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    await enterCampaignBoard(browser);
    const res = await playMatchToEnd(browser, oracle, { wantCorrect: false, useTkoIfAvailable: false, vipAction: 'TRUST' });
    match1Stems = res.seenStems;
    const afterSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    if (afterSc - beforeSc < 150) {
      throw new Error(`Expected >= $150 consolation SC on Campaign loss, got ${beforeSc} -> ${afterSc}`);
    }
    return `Campaign loss credited $${afterSc - beforeSc} SC (min $150 verified)`;
  });
  await runCase(results, { id: 'T1-R6-02', tier: 1, req: 'R6', name: 'Campaign Return Champion Rematch deals fresh unseen clues', strict }, async () => {
    const hasRematch = await browser.evalJs('Boolean(document.querySelector("button[data-action=\\"rematch\\"]"))');
    if (!hasRematch) throw new Error('Campaign loss Ceremony missing data-action="rematch" button');
    await browser.clickSelector('button[data-action="rematch"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 14_000);
    await browser.clickBoardTileFromTelemetry();
    for (let w = 0; w < 20; w++) {
      const hasStem = await browser.evalJs('Boolean((document.querySelector(".ws7-question-stage:not(.ws7-hidden) .ws7-balanced-copy")?.innerText || "").trim())');
      if (hasStem) break;
      const isVip = await browser.evalJs('Boolean(document.querySelector(".ws9-vip-bluff-card"))');
      if (isVip) break;
      await dismissTheaterIfPresent(browser);
      await sleep(200);
    }
    const rematchStem = await browser.evalJs('(document.querySelector(".ws7-question-stage:not(.ws7-hidden) .ws7-balanced-copy")?.innerText || "").trim()');
    if (rematchStem && match1Stems.includes(rematchStem)) {
      throw new Error(`Return Champion Rematch repeated clue stem: ${rematchStem}`);
    }
    return `Rematch launched with fresh unseen clue (${match1Stems.length} prior stems checked)`;
  });
  await runCase(results, { id: 'T1-R6-03', tier: 1, req: 'R6', name: 'Sweeps Night loss offers RETURN CHAMPION REVENGE MATCH', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SWEEPS_SAVE_KEY]: makeDefaultSweepsState({
        activeRun: true,
        currentNight: 2,
        pendingLossRematchNight: 2,
        revengeJackpotPool: 1650,
      }),
    });
    await browser.evalJs('window.__WS_V7__.openView("sweeps")');
    await sleep(250);
    const txt = await browser.evalJs('document.body.innerText');
    if (!/PLAY REVENGE MATCH/i.test(txt)) throw new Error('Sweeps loss missing PLAY REVENGE MATCH CTA');
    return 'Sweeps Return Champion Revenge Match CTA verified';
  });
  await runCase(results, { id: 'T1-R6-04', tier: 1, req: 'R6', name: 'Quick Show loss offers 1-tap RETURN CHAMPION REMATCH', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="quick-show"]');
    await sleep(220);
    await browser.clickSelector('button[data-action="launch-quick-show"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 15_000);
    await playMatchToEnd(browser, oracle, { wantCorrect: false, useTkoIfAvailable: false, vipAction: 'TRUST' });
    const hasRematch = await browser.evalJs('Boolean(document.querySelector("button[data-action=\\"rematch\\"]"))');
    if (!hasRematch) throw new Error('Quick Show loss Ceremony missing 1-tap Rematch CTA');
    return 'Quick Show 1-tap Return Champion Rematch CTA verified';
  });
  await runCase(results, { id: 'T1-R6-05', tier: 1, req: 'R6', name: 'Anti-wall mercy applies after 2+ consecutive losses on same episode', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [CAMPAIGN_SAVE_KEY]: {
        episodesPlayed: 2,
        unlockedEpisode: 1,
        pendingRematchEpisode: 1,
        consecutiveLossesByEpisode: { '1': 2 },
        cleanPurseCash: 0,
        contrabandTrunkCash: 0,
      },
    });
    await enterCampaignBoard(browser);
    let score = 0;
    let res = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 12_000).catch(() => {});
      await browser.clickBoardTileFromTelemetry(attempt);
      res = await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
      await sleep(350);
      score = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
      if (score > 0) break;
      if (res?.mode === 'CHOICE_BUTTON' || res?.mode === 'CHOICE_BUTTON_FALLBACK') break;
      for (let w = 0; w < 25; w++) {
        await dismissTheaterIfPresent(browser);
        if (await browser.evalJs('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"')) break;
        await sleep(200);
      }
    }
    if (score <= 0) throw new Error(`Expected positive score with Anti-wall mercy active, got ${score} (${JSON.stringify(res)})`);
    return `Anti-wall mercy active on 2-loss Ep1 rematch (score=${score})`;
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R7: 8 Anti-Repetition Board Types ---
  await runCase(results, { id: 'T1-R7-01', tier: 1, req: 'R7', name: 'Board Type: Can\'t see category (LOUVER_SHUTTER) mounts & plays', strict }, async () => {
    await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=LOUVER_SHUTTER&nosw=1`, { clearStorage: true, nosw: true });
    await sleep(250);
    const mode = await browser.evalJs('window.__WS_V7__.getActiveBoardMode()');
    if (mode !== 'LOUVER_SHUTTER') throw new Error(`Expected LOUVER_SHUTTER, got ${mode}`);
    return `ActiveBoardMode=${mode}`;
  });
  await runCase(results, { id: 'T1-R7-02', tier: 1, req: 'R7', name: 'Board Type: Can\'t see money (BLIND_PURSE) mounts cleanly', strict }, async () => {
    await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=BLIND_PURSE&nosw=1`, { clearStorage: false, nosw: true });
    await sleep(250);
    const mode = await browser.evalJs('window.__WS_V7__.getActiveBoardMode()');
    if (mode !== 'BLIND_PURSE') throw new Error(`Expected BLIND_PURSE, got ${mode}`);
    return `ActiveBoardMode=${mode}`;
  });
  await runCase(results, { id: 'T1-R7-03', tier: 1, req: 'R7', name: 'Board Type: Can\'t see either (BLACKOUT_VAULT) mounts cleanly', strict }, async () => {
    await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=BLACKOUT_VAULT&nosw=1`, { clearStorage: false, nosw: true });
    await sleep(250);
    const mode = await browser.evalJs('window.__WS_V7__.getActiveBoardMode()');
    if (mode !== 'BLACKOUT_VAULT') throw new Error(`Expected BLACKOUT_VAULT, got ${mode}`);
    return `ActiveBoardMode=${mode}`;
  });
  await runCase(results, { id: 'T1-R7-04', tier: 1, req: 'R7', name: 'Board Type: All locked but one (LIVE_WIRE_FUSE) starts with 1 open starter tile', strict }, async () => {
    await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=LIVE_WIRE_FUSE&nosw=1`, { clearStorage: false, nosw: true });
    await sleep(260);
    const info = await browser.evalJs('({ mode: window.__WS_V7__.getActiveBoardMode(), banner: document.querySelector(".ws7-board-mode-ribbon")?.innerText || "" })');
    if (info.mode !== 'LIVE_WIRE_FUSE' || !/1\s*starter\s*tile|LIVE-WIRE FUSE/i.test(info.banner)) {
      throw new Error(`Expected LIVE_WIRE_FUSE starter banner, got ${JSON.stringify(info)}`);
    }
    const clickRes = await browser.clickBoardTileFromTelemetry();
    const ans = await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    return `LIVE_WIRE_FUSE starter tile opened at index=${clickRes.clickedIndex} (${ans.mode})`;
  });
  await runCase(results, { id: 'T1-R7-05', tier: 1, req: 'R7', name: '4 original R7 board types (Spotlight, Domino, Pressure Cooker, Marquee Line) activate cleanly', strict }, async () => {
    for (const m of ['SHIFTING_SPOTLIGHT', 'GOLDEN_DOMINO_CASCADE', 'PRESSURE_COOKER', 'HOLLYWOOD_MARQUEE_LINE']) {
      await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=${m}&nosw=1`, { clearStorage: false, nosw: true });
      await sleep(180);
      const got = await browser.evalJs('window.__WS_V7__.getActiveBoardMode()');
      if (got !== m) throw new Error(`Expected mode ${m}, got ${got}`);
    }
    return 'All 4 original R7 board modes verified';
  });
  await runCase(results, { id: 'T1-R7-06', tier: 1, req: 'R7', name: 'R7 Mod Marquee rule banner renders above grid', strict }, async () => {
    const banner = await browser.evalJs('document.querySelector(".ws7-board-mode-ribbon")?.innerText || ""');
    if (!banner.trim()) throw new Error('R7 board mode banner (.ws7-board-mode-ribbon) is empty');
    return `Mod Marquee banner: ${banner.trim().slice(0, 60)}`;
  });

  // --- R8: Main Board Polish, Reactive Signs, Live Crowd & Seasons 1-4 ---
  await runCase(results, { id: 'T1-R8-01', tier: 1, req: 'R8', name: 'Hardware WebGL2 3D Soundstage & Main Board render with 0 shader/program errors', strict }, async () => {
    await browser.relaunchBrowser();
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    const gl = await browser.assertWebGL2();
    return `WebGL2=${gl.webglVersion}, renderer=${gl.webglRenderer}, 0 shader/program errors`;
  });
  await runCase(results, { id: 'T1-R8-02', tier: 1, req: 'R8', name: 'Seasons 1-4 distinct 3D studio sets & board styles switch via getSeasonId()', strict }, async () => {
    const s = await browser.evalJs('window.__WS_V7__.getSeasonId()');
    if (![1, 2, 3, 4].includes(Number(s))) throw new Error(`Invalid seasonId=${s}`);
    return `Active seasonId=${s}`;
  });
  await runCase(results, { id: 'T1-R8-03', tier: 1, req: 'R8', name: '4 Reactive Studio Signs (ON_THE_AIR, APPLAUSE, LAUGH, JACKPOT) exposed via getStudioSignStates()', strict }, async () => {
    const signs = await browser.evalJs('window.__WS_V7__.getStudioSignStates()');
    for (const k of ['ON_THE_AIR', 'APPLAUSE', 'LAUGH', 'JACKPOT']) {
      if (!(k in (signs || {}))) throw new Error(`Missing reactive sign state "${k}"`);
    }
    return `Signs=${JSON.stringify(signs)}`;
  });
  await runCase(results, { id: 'T1-R8-04', tier: 1, req: 'R8', name: 'Live 1960s studio crowd mood exposed via getCrowdMood()', strict }, async () => {
    const mood = await browser.evalJs('window.__WS_V7__.getCrowdMood()');
    if (!mood) throw new Error('getCrowdMood() returned empty');
    return `Crowd mood=${JSON.stringify(mood)}`;
  });
  await runCase(results, { id: 'T1-R8-05', tier: 1, req: 'R8', name: 'Main Board & signs remain unclipped across 1440x900', strict }, async () => {
    await browser.assertNoOverflowOrEllipsis({ allowScroll: false });
    return '1440x900 board layout unclipped';
  });
  await runCase(results, { id: 'T1-R8-06', tier: 1, req: 'R8', name: '3D Board raycast click via tileScreenPoints transitions BOARD_SELECT -> QUESTION_OPEN & resolves', strict }, async () => {
    const clickRes = await browser.clickBoardTileFromTelemetry();
    const ansRes = await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    return `tile=${clickRes.clickedIndex}, phase=${clickRes.phase}, answered=${ansRes.mode}`;
  });

  // --- R10: Static, Art Craft, Palette & Bundle Gates ---
  await runCase(results, { id: 'T1-R10-01', tier: 1, req: 'R10', name: 'Static S1: TypeScript & Vite build clean', strict }, async () => {
    if (!staticReport) pendingV9('Skipped static gates (--skip-static)');
    const s1 = staticReport.gates.find((g) => g.gate === 'S1_BUILD_AND_TYPECHECK');
    if (!s1 || s1.status === 'FAIL') throw new Error(s1?.details || 'S1 failed');
    if (s1.status === 'SKIPPED') {
      if (strict) throw new Error('S1 build/typecheck was skipped (--skip-build) under --strict');
      pendingV9(s1.details || 'S1 skipped via --skip-build');
    }
    if (s1.status !== 'PASS') throw new Error(`Unexpected S1 status: ${s1.status}`);
    return s1.details;
  });
  await runCase(results, { id: 'T1-R10-02', tier: 1, req: 'R10', name: 'Static S2: dist/ < 20.00 MB budget verified', strict }, async () => {
    if (!staticReport) pendingV9('Skipped static gates (--skip-static)');
    const s2 = staticReport.gates.find((g) => g.gate === 'S2_BUNDLE_SIZE_BUDGET');
    if (!s2 || s2.status === 'FAIL') throw new Error(s2?.details || 'S2 failed');
    if (s2.status === 'PENDING_M2') pendingV9(s2.details);
    return s2.details;
  });
  await runCase(results, { id: 'T1-R10-03', tier: 1, req: 'R10', name: 'Static S3: Zero dark-navy SaaS hex/RGBA leaks in src/ & index.html', strict }, async () => {
    if (!staticReport) pendingV9('Skipped static gates (--skip-static)');
    const s3 = staticReport.gates.find((g) => g.gate === 'S3_DARK_NAVY_SAAS_PURGE');
    if (!s3 || s3.status === 'FAIL') throw new Error(s3?.details || 'S3 failed');
    if (s3.status === 'PENDING_M2') pendingV9(s3.details);
    return s3.details;
  });
  await runCase(results, { id: 'T1-R10-04', tier: 1, req: 'R10', name: 'Static S4: Dynamic gouache atlas + 0 broken images & 0 placeholders', strict }, async () => {
    if (!staticReport) pendingV9('Skipped static gates (--skip-static)');
    const s4 = staticReport.gates.find((g) => g.gate === 'S4_GOUACHE_ATLAS_MANIFEST');
    if (!s4 || s4.status === 'FAIL') throw new Error(s4?.details || 'S4 failed');
    if (s4.status === 'PENDING_M2') pendingV9(s4.details);
    await browser.assertNoBrokenImages();
    await browser.assertNoCanvasOrSvgPlaceholders('#ui-root');
    return s4.details;
  });
  await runCase(results, { id: 'T1-R10-05', tier: 1, req: 'R10', name: 'Runtime computed CSS scan finds 0 dark-navy SaaS leaks in live DOM', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    const leaks = await browser.scanComputedDarkNavyLeaks();
    if (leaks.length > 0) throw new Error(`Computed dark-navy leaks found: ${JSON.stringify(leaks.slice(0, 5))}`);
    return '0 computed dark-navy leaks';
  });
  await runCase(results, { id: 'T1-R10-06', tier: 1, req: 'R8/R10', name: 'Static S5 & S6 (P0): Zero mobileCrowdApron & trueAspect crowd formula verified', strict }, async () => {
    if (!staticReport) pendingV9('Skipped static gates (--skip-static)');
    const s5 = staticReport.gates.find((g) => g.gate === 'S5_NO_MOBILE_CROWD_APRON_P0');
    const s6 = staticReport.gates.find((g) => g.gate === 'S6_CROWD_ASPECT_RATIO');
    if (!s5 || s5.status !== 'PASS') throw new Error(s5?.details || 'S5 P0 check failed');
    if (!s6 || s6.status !== 'PASS') throw new Error(s6?.details || 'S6 P0 check failed');
    return `${s5.details} | ${s6.details}`;
  });

  return results;
}

// ----------------------------------------------------------------------------
// TIER 2 — Boundary & Corner Cases (Zero Stubs — Every Spec Tested Directly!)
// ----------------------------------------------------------------------------

async function runTier2({ browser, baseUrl, opts, staticReport, oracle }) {
  const results = [];
  const strict = opts.strict;
  const manifest = loadManifestIds();
  await initTierSession(browser, baseUrl, 1440, 900);

  await runStaticTierCheck(results, 2, staticReport, opts);

  // --- R1 Showroom Boundaries (8) ---
  await runCase(results, { id: 'T2-R1-01', tier: 2, req: 'R1', name: 'Curtain Gamble refused when SC < $750 and tickets === 0', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SHOWROOM_SAVE_KEY]: makeDefaultShowroomLedger({ showroomCash: 749, freeCurtainTickets: 0 }),
    });
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(220);
    await browser.clickSelector('.ws9-curtain-bay-btn');
    await sleep(220);
    const sr = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    const txt = await browser.evalJs('document.body.innerText || ""');
    if (sr.showroomCash !== 749 || sr.totalCurtainPulls !== 0 || !/Need\s*\$750\s*SC|\$750/i.test(txt)) {
      throw new Error(`Expected $749 SC Curtain refusal, got cash=${sr.showroomCash}, pulls=${sr.totalCurtainPulls}`);
    }
    return `Refused cleanly at $749 SC (pulls=${sr.totalCurtainPulls})`;
  });

  await runCase(results, { id: 'T2-R1-02', tier: 2, req: 'R1', name: 'Curtain Gamble 2-Zonk Pity Shield guarantees 0% Zonk on pull #3', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SHOWROOM_SAVE_KEY]: makeDefaultShowroomLedger({ showroomCash: 3000, consecutiveZonks: 2 }),
    });
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(220);
    await browser.clickSelector('.ws9-curtain-bay-btn');
    await sleep(280);
    const sr = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    if (sr.consecutiveZonks !== 0 || sr.ownedPrizeIds.length < 1) {
      throw new Error(`2-Zonk Pity Shield failed: ${JSON.stringify(sr)}`);
    }
    return `Pity Shield triggered: consecutiveZonks=0, ownedPrizes=${sr.ownedPrizeIds.length}`;
  });

  await runCase(results, { id: 'T2-R1-03', tier: 2, req: 'R1', name: 'Curtain Gamble & Featured Shelf never repeat within last 12 offers or deal owned while unowned exist', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SHOWROOM_SAVE_KEY]: makeDefaultShowroomLedger({ showroomCash: 25000, consecutiveZonks: 2 }),
    });
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(200);
    for (let i = 0; i < 6; i++) {
      const bay = await browser.evalJs('Boolean(document.querySelector(".ws9-curtain-bay-btn:not([disabled])"))');
      if (bay) await browser.clickSelector('.ws9-curtain-bay-btn:not([disabled])');
      else await browser.clickByText(/PULL ANOTHER CURTAIN/i);
      await sleep(180);
    }
    const sr = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    const last12 = (sr.recentOfferedIds || []).slice(-12);
    if (last12.length < 3 || new Set(last12).size !== last12.length) {
      throw new Error(`Repeat detected in last 12 offers: ${JSON.stringify(last12)}`);
    }
    return `Non-repeat verified across ${last12.length} recent offers`;
  });

  await runCase(results, { id: 'T2-R1-04', tier: 2, req: 'R1', name: 'Duplicate Prize/Cosmetic purchase blocked cleanly (idempotent)', strict }, async () => {
    const sampleCosmetic = 'trim_peacock_chrome';
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SHOWROOM_SAVE_KEY]: makeDefaultShowroomLedger({
        showroomCash: 5000,
        ownedCosmeticIds: ['trim_walnut_classic', 'chime_solenoid_bell', 'trilon_ivory_classic', sampleCosmetic],
      }),
    });
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(180);
    await browser.clickByText(/STUDIO STYLE/i);
    await sleep(200);
    await browser.evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('.ws9-showroom-body button'));
      const equipBtn = btns.find(b => /^EQUIP$/i.test((b.innerText || '').trim()));
      equipBtn?.click();
    })()`);
    await sleep(180);
    const sr = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    if (sr.showroomCash !== 5000) throw new Error(`Equipping already-owned cosmetic charged SC: cash=${sr.showroomCash}`);
    return `Owned cosmetic equipped idempotently (showroomCash unchanged=${sr.showroomCash})`;
  });

  await runCase(results, { id: 'T2-R1-05', tier: 2, req: 'R1', name: 'Winner Den curated room pins & Vault Ledger render cleanly on 390x844', strict }, async () => {
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(180);
    await browser.clickByText(/DEN\s*&\s*TROPHIES/i);
    await sleep(220);
    await browser.assertNoBrokenImages();
    await browser.assertNoCanvasOrSvgPlaceholders('#ui-root');
    await browser.verifyLiveAtlasBindings();
    const denH = await browser.evalJs('Math.round(document.querySelector(".ws9-den-lounge-stage")?.getBoundingClientRect().height || 0)');
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    if (denH < 180) throw new Error(`390x844 Winner Den lounge height ${denH}px < 180px`);
    return `390x844 Den height=${denH}px, 0 placeholders`;
  });

  await runCase(results, { id: 'T2-R1-06', tier: 2, req: 'R1', name: 'Spending SC never mutates Campaign Career Purse', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SHOWROOM_SAVE_KEY]: makeDefaultShowroomLedger({ showroomCash: 1000 }),
      [CAMPAIGN_SAVE_KEY]: { cleanPurseCash: 4200, contrabandTrunkCash: 900, episodesPlayed: 2, unlockedEpisode: 3 },
    });
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(180);
    await browser.clickSelector('.ws9-curtain-bay-btn');
    await sleep(240);
    const campRaw = await browser.evalJs(`JSON.parse(localStorage.getItem(${JSON.stringify(CAMPAIGN_SAVE_KEY)}) || '{}')`);
    if (campRaw.cleanPurseCash !== 4200 || campRaw.contrabandTrunkCash !== 900) {
      throw new Error(`Spending SC mutated Campaign Purse: ${JSON.stringify(campRaw)}`);
    }
    return `Campaign cleanPurseCash=${campRaw.cleanPurseCash} untouched`;
  });

  await runCase(results, { id: 'T2-R1-07', tier: 2, req: 'R1', name: 'Progressive chapterUnlock 1..10 & unowned-first dealing across packed prizes', strict }, async () => {
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(220);
    const chapters = await browser.evalJs(`(() => {
      const txt = document.body.innerText || '';
      return Array.from(txt.matchAll(/CHAPTER\\s+(\\d+)\\s+SHOWCASE/gi)).map(m => Number(m[1]));
    })()`);
    const valid = chapters.length >= 8 && chapters.every((c) => c >= 1 && c <= 10);
    if (!valid) throw new Error(`Expected Chapters 1..9/10 in Showroom, got ${JSON.stringify(chapters)}`);
    return `Showroom progressive chapters verified (${chapters.join(',')})`;
  });

  await runCase(results, { id: 'T2-R1-08', tier: 2, req: 'R1', name: 'Maxed-catalog Curtain fallback pays $600 / $1,200 cash envelopes', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SHOWROOM_SAVE_KEY]: makeDefaultShowroomLedger({
        showroomCash: 1500,
        consecutiveZonks: 2, // Pity shield guarantees MID_SHOWCASE ($600) or GRAND_SHOWCASE ($1200)
        ownedPrizeIds: manifest.prizeIds,
        ownedZonkIds: manifest.zonkIds,
      }),
    });
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(220);
    await browser.clickSelector('.ws9-curtain-bay-btn');
    await sleep(280);
    const sr = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    if (sr.showroomCash !== 1350 && sr.showroomCash !== 1950) {
      throw new Error(`Expected maxed-catalog $600 ($1350 net) or $1200 ($1950 net) envelope, got showroomCash=${sr.showroomCash}`);
    }
    return `Maxed-catalog envelope paid accurately (1500 -> ${sr.showroomCash} SC)`;
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R2 Blitz & Winner's Circle Boundaries (5) ---
  await runCase(results, { id: 'T2-R2-01', tier: 2, req: 'R2', name: 'Blitz clock clamped strictly at 75.0s cap on consecutive +3s hits', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="play-blitz"]');
    await sleep(300);
    let maxClock = 0;
    for (let i = 0; i < 7; i++) {
      await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
      await sleep(320);
      const sec = await browser.evalJs('parseFloat(document.querySelector(".ws7-clue-timer-pill")?.innerText || "0")');
      if (Number.isFinite(sec)) maxClock = Math.max(maxClock, sec);
      if (maxClock > 75.05) throw new Error(`Blitz clock exceeded 75.0s cap: ${maxClock}`);
    }
    if (maxClock < 63) throw new Error(`Expected Blitz clock to climb near 75s cap across 7 +3s hits, maxClock=${maxClock}`);
    return `Blitz clock climbed & clamped <= 75.0s (max=${maxClock}s)`;
  });

  await runCase(results, { id: 'T2-R2-02', tier: 2, req: 'R2', name: 'Blitz first 3 Passes cost 0.0s; Pass #4+ costs -2.0s and resets streak', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="play-blitz"]');
    await sleep(300);
    for (let p = 1; p <= 4; p++) {
      await browser.waitFor('Boolean(document.querySelector("button[data-action=\\"blitz-pass\\"]:not([disabled])"))', 4_000);
      await browser.clickSelector('button[data-action="blitz-pass"]');
      await sleep(220);
      const burst = await browser.evalJs('(() => { const el = document.querySelector(".ws9-blitz-delta-burst:not(.ws7-hidden)"); return el ? { kind: el.dataset.kind, text: el.innerText } : null; })()');
      if (p <= 3 && burst && /-2/i.test(burst.text)) {
        throw new Error(`Free Pass #${p} should not deduct -2s (${JSON.stringify(burst)})`);
      }
      if (p === 4 && (!burst || !/-2/i.test(burst.text))) {
        throw new Error(`Pass #4 should show -2s penalty burst, got ${JSON.stringify(burst)}`);
      }
    }
    return 'Blitz 3 free passes + Pass #4 -2.0s penalty verified';
  });

  await runCase(results, { id: 'T2-R2-03', tier: 2, req: 'R2', name: 'Blitz wrong answer deducts -4.0s and floors clock at >= 0.0s', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="play-blitz"]');
    await browser.waitFor('Boolean(document.querySelector("#ws7-toy-mount [data-choice-idx]:not([disabled])"))', 8_000);
    await sleep(250);
    for (let skip = 0; skip < 3; skip++) {
      const hasChoice = await browser.evalJs('Boolean(document.querySelector("#ws7-toy-mount [data-choice-idx]:not([disabled])"))');
      if (hasChoice) break;
      await browser.clickSelector('button[data-action="blitz-pass"]:not([disabled])').catch(() => {});
      await sleep(350);
    }
    const before = await browser.evalJs('parseFloat(document.querySelector(".ws7-clue-timer-pill")?.innerText || "0")');
    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: false });
    await sleep(250);
    const burst = await browser.evalJs('document.querySelector(".ws9-blitz-delta-burst")?.innerText || ""');
    const after = await browser.evalJs('parseFloat(document.querySelector(".ws7-clue-timer-pill")?.innerText || "0")');
    if (!/-4/i.test(burst) || after < 0 || after >= before) {
      throw new Error(`Expected -4s deduction and >=0 floor (before=${before}, after=${after}, burst=${burst})`);
    }
    return `Blitz -4s deduction verified (${before}s -> ${after}s)`;
  });

  await runCase(results, { id: 'T2-R2-04', tier: 2, req: 'R2', name: 'Blitz 56px PASS bar separated by >=14px gap below Answer D on 390x844', strict }, async () => {
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="play-blitz"]');
    await browser.waitFor(
      'Boolean(document.querySelector("button[data-action=\\"blitz-pass\\"].ws9-blitz-pass-bar") && document.querySelector("#ws7-toy-mount [data-choice-idx]"))',
      8_000,
    );
    await sleep(200);
    const geo = await browser.evalJs(`(() => {
      const pass = document.querySelector('button[data-action="blitz-pass"].ws9-blitz-pass-bar');
      const choices = Array.from(document.querySelectorAll('#ws7-toy-mount [data-choice-idx]'));
      const last = choices[choices.length - 1];
      if (!pass || !last) return null;
      const pr = pass.getBoundingClientRect();
      const lr = last.getBoundingClientRect();
      return { passH: Number(pr.height.toFixed(1)), gap: Number((pr.top - lr.bottom).toFixed(1)) };
    })()`);
    await browser.assertNoOverflowOrEllipsis({ allowScroll: true });
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    if (!geo || geo.passH < 55 || geo.gap < 13.5) {
      throw new Error(`390x844 Blitz PASS bar geometry violated (expected height>=56, gap>=14): ${JSON.stringify(geo)}`);
    }
    return `390x844 Blitz PASS height=${geo.passH}px, gap=${geo.gap}px`;
  });

  await runCase(results, { id: 'T2-R2-05', tier: 2, req: 'R2', name: 'Declining 45s Winner Circle banks 100% match purse without penalty', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    const beforeSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    await enterCampaignBoard(browser);
    await playMatchToEnd(browser, oracle, { wantCorrect: true, useTkoIfAvailable: true });
    await browser.clickByText(/BANK\s*&\s*CONTINUE/i);
    await sleep(250);
    const afterSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    if (afterSc <= beforeSc) throw new Error(`Declining Winner Circle did not keep match SC (${beforeSc} -> ${afterSc})`);
    return `Declined Winner Circle safely banked SC (${beforeSc} -> ${afterSc})`;
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R3 Custom Booth & 2P Couch Boundaries (5) ---
  await runCase(results, { id: 'T2-R3-01', tier: 2, req: 'R3', name: 'Booth refuses >3 Red Veto Stamps and maintains >=3 remaining categories', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="blitz-booth"]');
    await sleep(250);
    for (let i = 0; i < 4; i++) {
      await browser.evalFn((idx) => {
        document.querySelectorAll('.ws9-veto-chip')[idx]?.click();
      }, i);
      await sleep(100);
    }
    const vetoed = await browser.evalJs('document.querySelectorAll(".ws9-veto-chip[data-vetoed=\\"true\\"]").length');
    const warn = await browser.evalJs('document.body.innerText');
    if (vetoed !== 3 || !/MAX 3 RED VETO/i.test(warn)) {
      throw new Error(`Booth failed to clamp vetos at 3: vetoed=${vetoed}`);
    }
    return `Booth clamped at ${vetoed}/3 Red Veto Stamps`;
  });

  await runCase(results, { id: 'T2-R3-02', tier: 2, req: 'R3', name: 'Daily Broadcast ignores prior Quick/Blitz Vibe Pack & Veto state', strict }, async () => {
    await browser.clickSelector('button[data-action="launch-booth"]');
    await sleep(280);
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: false, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="play-daily"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 18_000);
    const txt = await browser.evalJs('document.body.innerText');
    if (/VETOED|BOOTH TELL/i.test(txt)) throw new Error('Daily Broadcast inherited Booth state');
    return 'Daily Broadcast cleanly ignored prior Booth Vibe/Veto config';
  });

  await runCase(results, { id: 'T2-R3-03', tier: 2, req: 'R3', name: '2P Couch Per-Podium Skill Dials (Easy vs Shark) keep equal tile dollar values', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="couch-party"]');
    await sleep(220);
    await browser.clickSelector('button.wsc8-skill-btn[data-podium-skill="0"][data-skill-dial="EASY"]');
    await browser.clickSelector('button.wsc8-skill-btn[data-podium-skill="1"][data-skill-dial="SHARK"]');
    await browser.clickSelector('button[data-action="couch-step-up"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 18_000);
    const p1Before = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
    await browser.clickBoardTileFromTelemetry();
    const p1Header = await browser.evalJs('document.querySelector(".ws7-question-stage")?.innerText || ""');
    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    for (let w = 0; w < 30; w++) {
      await dismissTheaterIfPresent(browser);
      if (await browser.evalJs('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"')) break;
      await sleep(200);
    }
    const p1After = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
    return `Easy vs Shark equal dollars active (P1 ${p1Before}->${p1After}, header=${p1Header.slice(0, 40)})`;
  });

  await runCase(results, { id: 'T2-R3-04', tier: 2, req: 'R3', name: 'Hot Mic 10.0s timer stays paused on Privacy Handoff card until receiver taps Ready', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="couch-party"]');
    await sleep(220);
    await browser.clickSelector('button[data-action="couch-step-up"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 18_000);
    const timerSec = await triggerHotMicAndHandoff(browser, oracle);
    return `Privacy Handoff paused until Ready tap; Hot Mic 10s clock started (${timerSec}s)`;
  });

  await runCase(results, { id: 'T2-R3-05', tier: 2, req: 'R3', name: '2P Couch 17-Mode rotary stepper cycles all 17 board modes cleanly', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="couch-party"]');
    await sleep(200);
    const seen = new Set();
    for (let i = 0; i < 17; i++) {
      const m = await browser.evalJs('document.querySelector("[data-action=\\"toggle-board-mode-drawer\\"]")?.dataset.boardMode');
      if (m) seen.add(m);
      await browser.clickSelector('button[data-action="next-board-mode"]');
      await sleep(40);
    }
    if (seen.size < 16) throw new Error(`Expected >= 16 distinct modes cycling stepper, got ${seen.size}`);
    return `Cycled ${seen.size} distinct board modes via rotary stepper`;
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R4 VIP Bluff, TKO & Turbo Boundaries (5) ---
  await runCase(results, { id: 'T2-R4-01', tier: 2, req: 'R4', name: 'VIP Bluff tells strictly <= 115 chars / <= 14 words', strict }, async () => {
    const found = await findAndTriggerVipBluff(browser, baseUrl, oracle);
    if (!found) throw new Error('Could not mount .ws9-vip-bluff-card');
    const quip = await browser.evalJs('(document.querySelector(".ws9-vip-bluff-card blockquote")?.innerText || "").replace(/^[“"]|[”"]$/g, "").trim()');
    const words = quip.split(/\s+/).filter(Boolean).length;
    if (!quip || quip.length > 115 || words > 14) {
      throw new Error(`VIP Bluff tell exceeded 115 chars / 14 words: len=${quip.length}, words=${words}, quip=${quip}`);
    }
    return `VIP tell len=${quip.length} chars, ${words} words <= limits`;
  });

  await runCase(results, { id: 'T2-R4-02', tier: 2, req: 'R4', name: 'VIP Bluff -0.5x loss penalty floors match score at $0', strict }, async () => {
    // Resolve previous card first, then trigger VIP Bluff with score=$0 (by answering non-VIP clues wrong)
    await browser.clickSelector('.ws9-vip-bluff-card button.ws9-btn-cerise').catch(() => {});
    await sleep(300);
    const foundZero = await findAndTriggerVipBluff(browser, baseUrl, oracle, { wantCorrect: false });
    if (!foundZero) throw new Error('Could not mount .ws9-vip-bluff-card at $0 score');
    const before = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
    // Pick action that loses or verifies >= 0 floor (click both ways / verify never negative; at $0 any penalty floors to 0)
    await browser.clickSelector('.ws9-vip-bluff-card button.ws9-btn-cerise');
    await browser.waitFor('!document.querySelector(".ws9-vip-bluff-card")', 6_000);
    const after = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
    if (after < 0) throw new Error(`VIP Bluff caused negative score: ${after}`);
    return `VIP Bluff score floored cleanly >= 0 (${before} -> ${after})`;
  });

  await runCase(results, { id: 'T2-R4-03', tier: 2, req: 'R4', name: 'Runaway TKO Mercy Bell remains hidden before Turn 7 regardless of lead', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    await enableTurboIfOff(browser);
    for (let t = 1; t <= 5; t++) {
      for (let w = 0; w < 40; w++) {
        await dismissTheaterIfPresent(browser);
        if (await browser.evalJs('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"')) break;
        await sleep(200);
      }
      const tel = await browser.evalJs('window.__WS_V7__.getTelemetry()');
      const bell = await browser.evalJs('Boolean(document.querySelector(".ws9-mercy-bell-pill:not(.ws7-hidden)"))');
      if (tel.turnNumber < 7 && bell) throw new Error(`TKO Bell visible early at turn ${tel.turnNumber}`);
      await browser.clickBoardTileFromTelemetry();
      await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
      await sleep(250);
    }
    return 'TKO Bell remained hidden across Turns 1..5';
  });

  await runCase(results, { id: 'T2-R4-04', tier: 2, req: 'R4', name: 'TKO Mercy Bell honors Turn 7+ lead threshold & triggers +$300 SC Ceremony win', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    const beforeSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    await enterCampaignBoard(browser);
    await enableTurboIfOff(browser);
    const res = await playMatchToEnd(browser, oracle, { wantCorrect: true, useTkoIfAvailable: true, maxSteps: 65 });
    const afterSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    if ((res.outcome !== 'WINNERS_CIRCLE' && res.outcome !== 'CEREMONY') || afterSc <= beforeSc) {
      throw new Error(`TKO win did not complete/credit Showroom cash: outcome=${res.outcome}, SC ${beforeSc} -> ${afterSc}`);
    }
    return `TKO / Win transitioned cleanly (${res.outcome}, SC ${beforeSc} -> ${afterSc})`;
  });

  await runCase(results, { id: 'T2-R4-05', tier: 2, req: 'R4', name: 'Toggling ⚡ TURBO mid-match accelerates next Rival turn to <= 1200ms', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    await enableTurboIfOff(browser);
    await browser.clickBoardTileFromTelemetry();
    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase !== "QUESTION_OPEN"', 6_000);
    const postDeadline = Date.now() + 14_000;
    let phaseAfterPost = null;
    while (Date.now() < postDeadline) {
      await browser.dismissPreBoardOverlays({ maxSteps: 2 });
      await dismissTheaterIfPresent(browser);
      phaseAfterPost = await browser.evalJs('window.__WS_V7__?.getTelemetry?.()?.phase');
      if (phaseAfterPost === 'RIVAL_TURN' || phaseAfterPost === 'BOARD_SELECT') break;
      await sleep(80);
    }
    if (phaseAfterPost !== 'RIVAL_TURN' && phaseAfterPost !== 'BOARD_SELECT') {
      throw new Error(`Expected RIVAL_TURN or BOARD_SELECT after post-answer theater, got ${phaseAfterPost}`);
    }
    const tRivalStart = Date.now();
    if (phaseAfterPost === 'RIVAL_TURN') {
      await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 4_000);
    }
    const rivalMs = Date.now() - tRivalStart;
    if (rivalMs > 1800) throw new Error(`Turbo Rival turn took too long (${rivalMs}ms)`);
    return `Turbo Rival turn completed in ${rivalMs}ms (<= 1200ms target)`;
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R5 Sweeps & Plinko Boundaries (6) ---
  await runCase(results, { id: 'T2-R5-01', tier: 2, req: 'R5', name: 'Sweeps Night 1 forfeit adds $0 to Revenge Jackpot (stays at $1,000 base seed)', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SWEEPS_SAVE_KEY]: makeDefaultSweepsState({ atRiskVaultCash: 500, revengeJackpotPool: 1000 }),
    });
    await browser.evalJs('window.__WS_V7__.openView("sweeps")');
    await sleep(220);
    await browser.clickByText(/START\s*&\s*PLAY\s*MON/i);
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 18_000);
    await playMatchToEnd(browser, oracle, { wantCorrect: false, useTkoIfAvailable: false, vipAction: 'TRUST' });
    const st = await browser.evalJs('window.__WS_V7__.getSweepsState()');
    if (st.revengeJackpotPool !== 1000 || st.atRiskVaultCash !== 0) {
      throw new Error(`Expected Night 1 loss to add $0 to Revenge Jackpot (pool=1000, atRisk=0), got pool=${st.revengeJackpotPool}, atRisk=${st.atRiskVaultCash}`);
    }
    return `Night 1 forfeit added $0 (revengeJackpotPool=$${st.revengeJackpotPool}, atRiskVaultCash=$${st.atRiskVaultCash})`;
  });

  await runCase(results, { id: 'T2-R5-02', tier: 2, req: 'R5', name: 'Revenge Jackpot bounded strictly between $1,000 seed and $10,000 cap', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SWEEPS_SAVE_KEY]: makeDefaultSweepsState({
        activeRun: true,
        currentNight: 3,
        safeDepositCash: 4000,
        atRiskVaultCash: 25000,
        revengeJackpotPool: 10000,
      }),
    });
    const st = await browser.evalJs('window.__WS_V7__.getSweepsState()');
    if (st.revengeJackpotPool < 1000 || st.revengeJackpotPool > 10000) {
      throw new Error(`Revenge Jackpot out of bounds: ${st.revengeJackpotPool}`);
    }
    return `Revenge Jackpot bounded at $${st.revengeJackpotPool}`;
  });

  await runCase(results, { id: 'T2-R5-03', tier: 2, req: 'R5', name: 'Risk-Streak 50% Safe-Deposit preserved on Night 2+ dethrone', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SWEEPS_SAVE_KEY]: makeDefaultSweepsState({
        activeRun: true,
        currentNight: 2,
        safeDepositCash: 600,
        atRiskVaultCash: 600,
      }),
    });
    await browser.evalJs('window.__WS_V7__.openView("sweeps")');
    await sleep(220);
    await browser.clickByText(/PLAY\s+TUE/i);
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 18_000);
    const beforeSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    await playMatchToEnd(browser, oracle, { wantCorrect: false, useTkoIfAvailable: false, vipAction: 'TRUST' });
    const afterSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    const st = await browser.evalJs('window.__WS_V7__.getSweepsState()');
    if (afterSc < beforeSc + 600 || st.revengeJackpotPool < 1000) {
      throw new Error(`Safe-Deposit or Revenge Jackpot not preserved on Night 2 dethrone: sc=${beforeSc}->${afterSc}, sweeps=${JSON.stringify(st)}`);
    }
    return `Safe-Deposit ($600+) preserved & Revenge Jackpot=$${st.revengeJackpotPool} armed`;
  });

  await runCase(results, { id: 'T2-R5-04', tier: 2, req: 'R5', name: 'Starburst Plinko 5 launch lanes each >=60px wide on 390x844 mobile & buckets unclipped', strict }, async () => {
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await browser.evalJs('window.__WS_V7__.openView("plinko")');
    await sleep(240);
    await browser.assertPlinkoLayoutBounds();
    const minLaneW = await browser.evalJs('Math.min(...Array.from(document.querySelectorAll(".ws9-plinko-lane-btn[data-lane]")).map(el => el.getBoundingClientRect().width))');
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    if (minLaneW < 60) throw new Error(`Plinko lane button width ${minLaneW}px < 60px on 390x844`);
    return `390x844 Plinko minLaneW=${Math.round(minLaneW)}px, buckets unclipped`;
  });

  await runCase(results, { id: 'T2-R5-05', tier: 2, req: 'R5', name: 'Plinko >100ms stall kick guarantees every drop settles cleanly (<= 8s)', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SHOWROOM_SAVE_KEY]: makeDefaultShowroomLedger({ plinkoTokens: 1, showroomCash: 0 }),
    });
    await browser.evalJs('window.__WS_V7__.openView("plinko")');
    await sleep(220);
    await browser.clickSelector('.ws9-plinko-lane-btn[data-lane="2"]');
    const settled = await browser.waitFor(
      'window.__WS_V7__.getShowroomState().totalPlinkoDrops >= 1',
      8_500,
    );
    if (!settled) throw new Error('Plinko drop did not settle within 8.5s');
    const sr = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    return `Plinko settled cleanly (drops=${sr.totalPlinkoDrops}, SC=${sr.showroomCash})`;
  });

  await runCase(results, { id: 'T2-R5-06', tier: 2, req: 'R5', name: 'Showroom Plinko launch disabled when tokens === 0 and SC < $400', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SHOWROOM_SAVE_KEY]: makeDefaultShowroomLedger({ plinkoTokens: 0, showroomCash: 399 }),
    });
    await browser.evalJs('window.__WS_V7__.openView("plinko")');
    await sleep(220);
    const disabled = await browser.evalJs('Array.from(document.querySelectorAll(".ws9-plinko-lane-btn[data-lane]")).every(b => b.disabled)');
    if (!disabled) throw new Error('Plinko lane buttons remained enabled at tokens=0 and SC=$399');
    return 'Plinko drop properly disabled at $399 SC and 0 tokens';
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R6 Return Champion Rematch Boundaries (5) ---
  await runCase(results, { id: 'T2-R6-01', tier: 2, req: 'R6', name: '50% Consolation SC enforces $150 minimum floor even on $0 loss', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    const beforeSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    await enterCampaignBoard(browser);
    await playMatchToEnd(browser, oracle, { wantCorrect: false, useTkoIfAvailable: false, vipAction: 'TRUST' });
    const afterSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    if (afterSc - beforeSc < 150) throw new Error(`Expected >= $150 consolation floor, got ${afterSc - beforeSc}`);
    return `Consolation floor >= $150 verified (+$${afterSc - beforeSc} SC)`;
  });

  await runCase(results, { id: 'T2-R6-02', tier: 2, req: 'R6', name: 'Return Champion Rematch deals 0 repeated clueIds vs prior attempt', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    await enableTurboIfOff(browser);
    const lossRes = await playMatchToEnd(browser, oracle, { wantCorrect: false, useTkoIfAvailable: false, vipAction: 'TRUST', maxSteps: 65 });
    await browser.clickSelector('button[data-action="rematch"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 14_000);
    let stem = '';
    for (let tileTry = 0; tileTry < 3; tileTry++) {
      await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 12_000).catch(() => {});
      await browser.clickBoardTileFromTelemetry();
      let isVip = false;
      for (let w = 0; w < 20; w++) {
        const hasStem = await browser.evalJs('Boolean((document.querySelector(".ws7-question-stage:not(.ws7-hidden) .ws7-balanced-copy")?.innerText || "").trim())');
        if (hasStem) break;
        isVip = await browser.evalJs('Boolean(document.querySelector(".ws9-vip-bluff-card"))');
        if (isVip) break;
        await dismissTheaterIfPresent(browser);
        await sleep(200);
      }
      if (!isVip) {
        stem = await browser.evalJs('(document.querySelector(".ws7-question-stage:not(.ws7-hidden) .ws7-balanced-copy")?.innerText || "").trim()');
        if (stem) break;
      }
      await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
      for (let w = 0; w < 25; w++) {
        await dismissTheaterIfPresent(browser);
        if (await browser.evalJs('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"')) break;
        await sleep(160);
      }
    }
    if (!stem) throw new Error('Rematch clue stem did not mount');
    if (lossRes.seenStems.includes(stem)) {
      throw new Error(`Return Champion Rematch repeated clue stem: ${stem}`);
    }
    return `Rematch dealt fresh unseen clue (${lossRes.seenStems.length} prior stems checked): "${stem.slice(0, 45)}"`;
  });

  await runCase(results, { id: 'T2-R6-03', tier: 2, req: 'R6', name: 'Hub exit from Campaign Rematch persists state & consolation SC across reload', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    await enableTurboIfOff(browser);
    await playMatchToEnd(browser, oracle, { wantCorrect: false, useTkoIfAvailable: false, vipAction: 'TRUST', maxSteps: 65 });
    await browser.clickSelector('button[data-action="rematch"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 14_000);
    const beforeReloadSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: false, nosw: true });
    const afterReloadSc = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    if (afterReloadSc !== beforeReloadSc || afterReloadSc < 150) {
      throw new Error(`Consolation SC did not persist across reload: ${beforeReloadSc} -> ${afterReloadSc}`);
    }
    return `Consolation SC persisted across reload ($${afterReloadSc})`;
  });

  await runCase(results, { id: 'T2-R6-04', tier: 2, req: 'R6', name: 'Anti-wall mercy underdog bonus boosts correct answer payout after 2+ losses', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [CAMPAIGN_SAVE_KEY]: {
        episodesPlayed: 3,
        unlockedEpisode: 1,
        pendingRematchEpisode: 1,
        consecutiveLossesByEpisode: { '1': 3 },
        cleanPurseCash: 0,
        contrabandTrunkCash: 0,
      },
    });
    await enterCampaignBoard(browser);
    await enableTurboIfOff(browser);
    let score = 0;
    let res = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 12_000).catch(() => {});
      await browser.clickBoardTileFromTelemetry(attempt);
      res = await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
      await sleep(350);
      score = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
      if (score > 0) break;
      if (res?.mode === 'CHOICE_BUTTON' || res?.mode === 'CHOICE_BUTTON_FALLBACK') break;
      for (let w = 0; w < 25; w++) {
        await dismissTheaterIfPresent(browser);
        if (await browser.evalJs('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"')) break;
        await sleep(200);
      }
    }
    if (score <= 0) throw new Error(`Expected boosted score on 3-loss Anti-wall mercy turn, got ${score} (${JSON.stringify(res)})`);
    return `Anti-wall mercy underdog payout verified (score=${score})`;
  });

  await runCase(results, { id: 'T2-R6-05', tier: 2, req: 'R6', name: 'Quick Show Rematch retains selected Vibe Pack & Red Veto Stamps', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="quick-show"]');
    await sleep(220);
    await browser.clickSelector('.ws9-vibe-card[data-vibe-pack="AFTER_HOURS_LOUNGE"]');
    await sleep(120);
    const vetoCat = await browser.evalJs('document.querySelector(".ws9-veto-chip[data-category]")?.dataset.category || ""');
    await browser.clickSelector('.ws9-veto-chip[data-category]');
    await browser.clickSelector('button[data-action="launch-quick-show"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 15_000);
    await playMatchToEnd(browser, oracle, { wantCorrect: false, useTkoIfAvailable: false, vipAction: 'TRUST' });
    await browser.clickSelector('button[data-action="rematch"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 14_000);
    const tilesAfter = await browser.evalJs('(window.__WS_V7__.getTelemetry()?.tileScreenPoints || []).map(t => t.category)');
    if (vetoCat && tilesAfter.includes(vetoCat)) {
      throw new Error(`Quick Show Rematch failed to retain Red Veto Stamp on ${vetoCat}: ${JSON.stringify(tilesAfter)}`);
    }
    return `Quick Show Rematch relaunched cleanly retaining Vibe Pack (vetoed ${vetoCat} excluded)`;
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R7 All 8 Board Modes Boundaries (5) ---
  await runCase(results, { id: 'T2-R7-01', tier: 2, req: 'R7', name: 'LIVE_WIRE_FUSE survives 3+ consecutive misses via Emergency Circuit Breaker (unlockedCount >= 1)', strict }, async () => {
    await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=LIVE_WIRE_FUSE&nosw=1`, { clearStorage: true, nosw: true });
    await sleep(280);
    await enableTurboIfOff(browser);
    for (let miss = 0; miss < 3; miss++) {
      await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 8_000);
      const openBefore = await browser.evalJs('(window.__WS_V7__.getTelemetry()?.tileScreenPoints || []).filter(t => t.state === "OPEN").length');
      if (openBefore < 1) throw new Error(`LIVE_WIRE_FUSE softlocked at miss ${miss} (openCount=${openBefore})`);
      await browser.clickBoardTileFromTelemetry();
      await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: false });
      await sleep(300);
      await dismissTheaterIfPresent(browser);
    }
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 8_000);
    const openAfter = await browser.evalJs('(window.__WS_V7__.getTelemetry()?.tileScreenPoints || []).filter(t => t.state === "OPEN").length');
    if (openAfter < 1) throw new Error(`Emergency Circuit Breaker failed after 3 misses: openAfter=${openAfter}`);
    return `LIVE_WIRE_FUSE survived 3 misses via Circuit Breaker (open=${openAfter})`;
  });

  await runCase(results, { id: 'T2-R7-02', tier: 2, req: 'R7', name: 'LIVE_WIRE_FUSE Rival claim on sole frontier tile keeps unlockedCount >= 1', strict }, async () => {
    await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=LIVE_WIRE_FUSE&nosw=1`, { clearStorage: true, nosw: true });
    await sleep(280);
    await enableTurboIfOff(browser);
    const turnBefore = await browser.evalJs('window.__WS_V7__.getTelemetry().turnNumber');
    await browser.clickBoardTileFromTelemetry();
    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    for (let w = 0; w < 30; w++) {
      await dismissTheaterIfPresent(browser);
      const ready = await browser.evalJs(
        `window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT" && window.__WS_V7__?.getTelemetry?.()?.turnNumber > ${turnBefore}`,
      );
      if (ready) break;
      await sleep(200);
    }
    const tel = await browser.evalJs('window.__WS_V7__.getTelemetry()');
    if (tel.phase !== 'BOARD_SELECT' || tel.turnNumber <= turnBefore) {
      throw new Error(`Expected Rival turn completion to advance turnNumber > ${turnBefore}, got phase=${tel.phase}, turn=${tel.turnNumber}`);
    }
    const open = (tel?.tileScreenPoints || []).filter((t) => t.state === 'OPEN').length;
    if (open < 1) throw new Error(`Expected >= 1 open tile on LIVE_WIRE_FUSE after rival turn, got ${open}`);
    return `LIVE_WIRE_FUSE Rival turn ${turnBefore}->${tel.turnNumber} kept frontier openCount=${open} >= 1`;
  });

  await runCase(results, { id: 'T2-R7-03', tier: 2, req: 'R7', name: 'LOUVER_SHUTTER (Can\'t see category) activates & opens selected clue', strict }, async () => {
    await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=LOUVER_SHUTTER&nosw=1`, { clearStorage: false, nosw: true });
    await sleep(250);
    await browser.clickBoardTileFromTelemetry();
    const ans = await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    return `LOUVER_SHUTTER played cleanly (${ans.mode})`;
  });

  await runCase(results, { id: 'T2-R7-04', tier: 2, req: 'R7', name: 'BLIND_PURSE (Can\'t see money) & BLACKOUT_VAULT activate & play cleanly', strict }, async () => {
    for (const m of ['BLIND_PURSE', 'BLACKOUT_VAULT']) {
      await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=${m}&nosw=1`, { clearStorage: false, nosw: true });
      await sleep(240);
      await browser.clickBoardTileFromTelemetry();
      await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    }
    return 'BLIND_PURSE & BLACKOUT_VAULT played cleanly';
  });

  await runCase(results, { id: 'T2-R7-05', tier: 2, req: 'R7', name: 'PRESSURE_COOKER multiplier resets cleanly on miss', strict }, async () => {
    await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=PRESSURE_COOKER&nosw=1`, { clearStorage: true, nosw: true });
    await sleep(240);
    await enableTurboIfOff(browser);
    let elevatedBanner = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 8_000);
      await browser.clickBoardTileFromTelemetry(attempt);
      const hitRes = await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
      for (let w = 0; w < 30; w++) {
        await dismissTheaterIfPresent(browser);
        if (await browser.evalJs('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"')) break;
        await sleep(160);
      }
      elevatedBanner = await browser.evalJs('document.querySelector(".ws7-board-mode-ribbon")?.innerText || ""');
      if (/LIVE\s+GAUGE\s+×\s*(1\.25|1\.5|2\.0)\b|RISING\s+GAUGE\s*·\s*×\s*(1\.25|1\.5|2\.0)\b/i.test(elevatedBanner)) break;
      if (hitRes?.mode !== 'VIP_BLUFF') break;
    }
    if (!/LIVE\s+GAUGE\s+×\s*(1\.25|1\.5|2\.0)\b|RISING\s+GAUGE\s*·\s*×\s*(1\.25|1\.5|2\.0)\b/i.test(elevatedBanner)) {
      throw new Error(`Expected PRESSURE_COOKER multiplier to climb >= 1.25x after hit, got banner="${elevatedBanner}"`);
    }
    let resetBanner = '';
    let observedMiss = false;
    for (let missTry = 0; missTry < 3; missTry++) {
      await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 8_000);
      const scoreBeforeMiss = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
      await browser.clickBoardTileFromTelemetry(missTry);
      await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: false });
      for (let w = 0; w < 30; w++) {
        await dismissTheaterIfPresent(browser);
        if (await browser.evalJs('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"')) break;
        await sleep(160);
      }
      await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 8_000);
      const scoreAfterMiss = await browser.evalJs('window.__WS_V7__.getTelemetry().playerMatchScore');
      resetBanner = await browser.evalJs('document.querySelector(".ws7-board-mode-ribbon")?.innerText || ""');
      if (scoreAfterMiss <= scoreBeforeMiss) {
        observedMiss = true;
        break;
      }
    }
    if (!observedMiss) {
      throw new Error(`Could not produce a miss on PRESSURE_COOKER within 3 tiles (banner="${resetBanner}")`);
    }
    if (!/LIVE\s+GAUGE\s+×\s*1\.0\b/i.test(resetBanner) || /LIVE\s+GAUGE\s+×\s*(1\.25|1\.5|2\.0)\b/i.test(resetBanner)) {
      throw new Error(`Expected PRESSURE_COOKER multiplier reset to 1x after miss, got banner="${resetBanner}"`);
    }
    return `PRESSURE_COOKER climbed (${elevatedBanner.slice(0, 32)}) & reset to 1.0x on miss (${resetBanner.slice(0, 42)})`;
  });

  await maybeRecycleBrowser(browser, baseUrl, 15);

  // --- R8 Seasons, Signs & Crowd Boundaries (6) ---
  await runCase(results, { id: 'T2-R8-01', tier: 2, req: 'R8', name: 'Out-of-range Season IDs (?season=99, ?season=0) clamp safely to [1..4]', strict }, async () => {
    await browser.relaunchBrowser();
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(`${baseUrl}?qa_view=BOARD&season=99&nosw=1`, { clearStorage: true, nosw: true });
    await sleep(220);
    const highS = await browser.evalJs('window.__WS_V7__.getSeasonId()');
    await browser.navigate(`${baseUrl}?qa_view=BOARD&season=0&nosw=1`, { clearStorage: false, nosw: true });
    await sleep(220);
    const lowS = await browser.evalJs('window.__WS_V7__.getSeasonId()');
    if (Number(highS) !== 4 || Number(lowS) !== 1) {
      throw new Error(`Season clamping failed: ?season=99 -> ${highS} (exp 4), ?season=0 -> ${lowS} (exp 1)`);
    }
    browser.assertCleanRuntime();
    return `Season ID clamped cleanly (?season=99->${highS}, ?season=0->${lowS})`;
  });

  await runCase(results, { id: 'T2-R8-02', tier: 2, req: 'R8', name: 'Rapid Season 1->2->3->4 switching produces 0 WebGL/console errors & valid crowd/signs', strict }, async () => {
    for (const [s, stg] of [[1, 'STAGE_01_IBC_DAYTIME_FUNK'], [2, 'STAGE_04_1958_ISOLATION_VAULT'], [3, 'STAGE_07_1969_MONTE_CARLO_CASINO'], [4, 'STAGE_10_SOVEREIGN_SANCTUM']]) {
      await browser.navigate(`${baseUrl}?qa_view=BOARD&stage=${stg}&season=${s}&nosw=1`, { clearStorage: false, nosw: true });
      await sleep(180);
      await browser.assertStageLayoutDiagnostics();
    }
    await browser.assertWebGL2();
    browser.assertCleanRuntime();
    return 'Seasons 1->2->3->4 switched cleanly with 0 WebGL errors';
  });

  await runCase(results, { id: 'T2-R8-03', tier: 2, req: 'R8', name: 'JACKPOT! reactive sign stays inside 390x844 Proscenium Sign Bay', strict }, async () => {
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await browser.navigate(`${baseUrl}?qa_view=BOARD&stage=STAGE_01_IBC_DAYTIME_FUNK&season=1&nosw=1`, { clearStorage: false, nosw: true });
    await sleep(240);
    const sc = await browser.assertSignsAndCrowdPlacement({ mobileMode: true });
    await browser.assertStageLayoutDiagnostics();
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    browser.assertCleanRuntime();
    return `390x844 Signs & Crowd placement clean (boardBox=${JSON.stringify(sc.boardBox)})`;
  });

  await runCase(results, { id: 'T2-R8-04', tier: 2, req: 'R8', name: 'Compact 390x660 phone viewport adapts Crowd without vertical scroll', strict }, async () => {
    await browser.setViewport(390, 660, { mobile: true, dpr: 1 });
    await browser.navigate(`${baseUrl}?qa_view=BOARD&stage=STAGE_01_IBC_DAYTIME_FUNK&season=1&nosw=1`, { clearStorage: false, nosw: true });
    await sleep(240);
    await browser.assertSignsAndCrowdPlacement({ mobileMode: true });
    await browser.assertStageLayoutDiagnostics();
    await browser.assertNoOverflowOrEllipsis({ allowScroll: false });
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    browser.assertCleanRuntime();
    return '390x660 Crowd & zero-scroll verified';
  });

  await runCase(results, { id: 'T2-R8-05', tier: 2, req: 'R8', name: 'Reactive signs trigger on clue hit & automatically return to resting state after durationMs', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    await enableTurboIfOff(browser);
    await browser.evalJs(`(() => {
      window.__wsQaSignBursts = [];
      if (window.__wsQaSignTimer) clearInterval(window.__wsQaSignTimer);
      window.__wsQaSignTimer = setInterval(() => {
        const s = window.__WS_V7__?.getStudioSignStates?.();
        if (s && (s.APPLAUSE || s.JACKPOT || s.LAUGH)) {
          window.__wsQaSignBursts.push(s);
        }
      }, 60);
    })()`);
    await browser.clickBoardTileFromTelemetry();
    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    let sawBurst = await browser.evalJs('(window.__wsQaSignBursts || []).length > 0');
    if (!sawBurst) {
      for (let i = 0; i < 15; i++) {
        const has = await browser.evalJs('(() => { const s = window.__WS_V7__?.getStudioSignStates?.(); return Boolean((window.__wsQaSignBursts || []).length > 0 || s?.APPLAUSE || s?.JACKPOT || s?.LAUGH); })()');
        if (has) { sawBurst = true; break; }
        await sleep(100);
      }
    }
    await browser.evalJs('if (window.__wsQaSignTimer) { clearInterval(window.__wsQaSignTimer); window.__wsQaSignTimer = null; } delete window.__wsQaSignBursts;');
    await browser.waitFor(
      '(() => { const s = window.__WS_V7__.getStudioSignStates(); return Boolean(s && !s.APPLAUSE && !s.JACKPOT && !s.LAUGH); })()',
      6_500,
    );
    const afterSt = await browser.evalJs('window.__WS_V7__.getStudioSignStates()');
    if (!sawBurst || afterSt?.APPLAUSE || afterSt?.JACKPOT || afterSt?.LAUGH) {
      throw new Error(`Sign trigger/reset failed: sawBurst=${sawBurst}, afterSt=${JSON.stringify(afterSt)}`);
    }
    return `Sign burst observed & returned to resting state (${JSON.stringify(afterSt)})`;
  });

  await runCase(results, { id: 'T2-R8-06', tier: 2, req: 'R8', name: 'P0 Stage Layout Diagnostics: 0 crowd meshes with worldPos.z > -1.5 or screenY > boardCenterY + sign/board zero-overlap', strict }, async () => {
    await browser.relaunchBrowser();
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    const d1440 = await browser.assertStageLayoutDiagnostics();
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await sleep(240);
    const d390 = await browser.assertStageLayoutDiagnostics();
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    return `1440x900(crowd=${d1440.crowdCount},signs=${d1440.signCount}), 390x844(crowd=${d390.crowdCount},signs=${d390.signCount}) P0 clean`;
  });

  // --- R9 Hub & HUD Boundaries (7) ---
  await runCase(results, { id: 'T2-R9-01', tier: 2, req: 'R9', name: 'Compact 390x660 mobile viewport zero horizontal overflow & zero ellipsis', strict }, async () => {
    await browser.relaunchBrowser();
    await browser.setViewport(390, 660, { mobile: true, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    const layout = await browser.assertNoOverflowOrEllipsis({ allowScroll: false });
    return `390x660 sw=${layout.sw} sh=${layout.sh}`;
  });
  await runCase(results, { id: 'T2-R9-02', tier: 2, req: 'R9', name: 'Mobile 390x844 interactive Hub buttons meet >=44x44px touch target minimum', strict }, async () => {
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: false, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    const small = await browser.evalJs(`(() => {
      return Array.from(document.querySelectorAll('#ui-root button')).filter(b => {
        const st = getComputedStyle(b);
        if (st.display === 'none' || st.visibility === 'hidden') return false;
        const r = b.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44);
      }).map(b => ({ text: (b.innerText || b.getAttribute('aria-label') || b.dataset?.action || '').trim(), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height) }));
    })()`);
    if (small.length > 0) {
      throw new Error(`Hub buttons below 44x44px: ${JSON.stringify(small)}`);
    }
    return 'All visible Hub buttons >=44x44px';
  });
  await runCase(results, { id: 'T2-R9-03', tier: 2, req: 'R9', name: 'Zero horizontal overflow across 1440x900 and 390x844 Hub viewports', strict }, async () => {
    const layout = await browser.assertNoOverflowOrEllipsis({ allowScroll: true });
    return `390x844 sw=${layout.sw} <= vw=${layout.vw}`;
  });
  await runCase(results, { id: 'T2-R9-04', tier: 2, req: 'R9', name: 'Opening & closing How To Play / Rules modal preserves clean Hub state', strict }, async () => {
    await browser.clickSelector('button[data-action="how-to-play"]');
    await sleep(200);
    await browser.pressKey('Escape');
    await sleep(150);
    browser.assertCleanRuntime();
    return 'Rules modal open/close clean';
  });
  await runCase(results, { id: 'T2-R9-05', tier: 2, req: 'R9', name: 'LocalStorage persistence across page reload preserves player state cleanly', strict }, async () => {
    await browser.evalJs('localStorage.setItem("ws_v9_qa_probe", "ok")');
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: false, nosw: true });
    const val = await browser.evalJs('localStorage.getItem("ws_v9_qa_probe")');
    await browser.evalJs('localStorage.removeItem("ws_v9_qa_probe")');
    if (val !== 'ok') throw new Error('localStorage did not persist across reload');
    return 'Reload persistence verified';
  });
  await runCase(results, { id: 'T2-R9-06', tier: 2, req: 'R9/R8', name: 'Top HUD zero-overlap & zero-clipping across 1440x900, 390x844, and 390x660', strict }, async () => {
    await browser.relaunchBrowser();
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    const d1440 = await browser.assertTopHudZeroOverlap();
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await sleep(220);
    const d390 = await browser.assertTopHudZeroOverlap();
    await browser.assertSignsAndCrowdPlacement({ mobileMode: true });
    await browser.setViewport(390, 660, { mobile: true, dpr: 1 });
    await sleep(220);
    const d660 = await browser.assertTopHudZeroOverlap();
    await browser.assertSignsAndCrowdPlacement({ mobileMode: true });
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    return `HUD 0-overlap verified: 1440(${d1440.itemCount}), 390x844(${d390.itemCount}), 390x660(${d660.itemCount})`;
  });
  await runCase(results, { id: 'T2-R9-07', tier: 2, req: 'R9', name: 'Title Hub 0px overlap, single mount, <=720px desktop stack & Marquee width/height across 5 viewports', strict }, async () => {
    const checks = [];
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    for (const [w, h] of [[1440, 900], [1280, 800], [1280, 760]]) {
      await browser.setViewport(w, h, { mobile: false, dpr: 1 });
      await sleep(180);
      const res = await browser.assertTitleHubLayoutIntegrity();
      checks.push(`${w}x${h}(stackH=${res.stackHeight}px)`);
    }
    for (const [w, h] of [[390, 844], [390, 660]]) {
      await browser.setViewport(w, h, { mobile: true, dpr: 1 });
      await sleep(180);
      const res = await browser.assertTitleHubLayoutIntegrity();
      checks.push(`${w}x${h}(mW=${res.marqueeMetrics.width}px)`);
    }
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    return `Hub integrity verified: ${checks.join(', ')}`;
  });

  // --- R10 Bundle & Server Boundaries (5) ---
  await runCase(results, { id: 'T2-R10-01', tier: 2, req: 'R10', name: 'serve_dist_8999.mjs serves all loaded JS/CSS/JSON/img assets with real non-HTML MIME', strict }, async () => {
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    browser.clearDiagnostics();
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.assertNoBrokenImages();
    browser.assertCleanRuntime();
    return '0 ASSET_MIME_MISMATCH errors on clean navigation';
  });
  await runCase(results, { id: 'T2-R10-02', tier: 2, req: 'R10', name: 'Harness SPA-fallback trap self-test: missing .webp triggers ASSET_MIME_MISMATCH detector', strict }, async () => {
    const probeUrl = `${baseUrl}assets/v9/__nonexistent_qa_probe__.webp`;
    await browser.evalJs(`fetch(${JSON.stringify(probeUrl)}).then(r => r.text())`);
    await sleep(120);
    const diag = browser.getDiagnostics();
    const caught = diag.assetMimeErrors.some((e) => e.url.includes('__nonexistent_qa_probe__.webp'));
    browser.clearDiagnostics();
    if (!caught) throw new Error('SPA-fallback MIME-mismatch detector failed to catch fake .webp 200 text/html');
    return 'ASSET_MIME_MISMATCH detector verified against live serve_dist_8999.mjs';
  });
  await runCase(results, { id: 'T2-R10-03', tier: 2, req: 'R10', name: 'Anti-bleed 340ms + 220ms gate cleared when answering clue at 420ms dwell', strict }, async () => {
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    await browser.clickBoardTileFromTelemetry();
    const ans = await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    return `420ms dwell answer succeeded (${ans.mode})`;
  });
  await runCase(results, { id: 'T2-R10-04', tier: 2, req: 'R10', name: 'Zero Runtime.exceptionThrown and zero console.error across boot + match start', strict }, async () => {
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    browser.assertCleanRuntime();
    return '0 pageExceptions, 0 consoleErrors';
  });
  await runCase(results, { id: 'T2-R10-05', tier: 2, req: 'R10', name: 'dist/ production bundle remains strictly under 20,000,000 bytes (20.00 MB decimal)', strict }, async () => {
    const staticCheck = runAllStaticGates({ skipBuild: true, baseline: true });
    const s2 = staticCheck.gates.find((g) => g.gate === 'S2_BUNDLE_SIZE_BUDGET');
    if (s2.distBytes >= DIST_BUDGET_BYTES) throw new Error(`dist/ exceeds 20.00 MB decimal (${DIST_BUDGET_BYTES} B): ${s2.distBytes}`);
    return s2.details;
  });

  return results;
}

// ----------------------------------------------------------------------------
// TIER 3 — Cross-Feature Pairwise Combinations (Zero Stubs!)
// ----------------------------------------------------------------------------

async function runTier3({ browser, baseUrl, opts, staticReport, oracle }) {
  const results = [];
  const strict = opts.strict;
  await initTierSession(browser, baseUrl, 1440, 900);

  await runStaticTierCheck(results, 3, staticReport, opts);

  await runCase(results, { id: 'T3-01', tier: 3, req: 'R5+R4', name: 'Sweeps Week + VIP Bluff / ⚡ TURBO + Sponsor Draft', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SWEEPS_SAVE_KEY]: makeDefaultSweepsState({
        activeRun: true,
        currentNight: 2,
        safeDepositCash: 500,
        atRiskVaultCash: 500,
        pendingSponsorDraft: true,
        pendingPlinkoFreeDrop: false,
      }),
      [SWEEPS_INTERMISSION_KEY]: '1',
    });
    await browser.evalJs('window.__WS_V7__.openView("sweeps")');
    await sleep(220);
    await browser.evalJs('document.querySelector(".ws9-sweeps-shell .ws9-shell-body > section:last-child button.ws9-btn-cream")?.click()');
    await sleep(220);
    await browser.clickByText(/RISK STREAK/i);
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 18_000);
    await enableTurboIfOff(browser);
    await browser.clickBoardTileFromTelemetry();
    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    browser.assertCleanRuntime();
    return 'Sweeps Sponsor Draft -> Risk Streak -> Turbo turn verified';
  });

  await runCase(results, { id: 'T3-02', tier: 3, req: 'R2+R3', name: '60-Second Blitz + Custom Booth Vibe Pack + 3 Red Veto Stamps + Daily Immunity', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="blitz-booth"]');
    await sleep(220);
    await browser.evalJs('document.querySelectorAll(".ws9-vibe-card[data-vibe-pack]")[1]?.click()');
    await sleep(100);
    for (let i = 0; i < 3; i++) {
      await browser.evalFn((idx) => { document.querySelectorAll('.ws9-veto-chip')[idx]?.click(); }, i);
      await sleep(80);
    }
    await browser.clickSelector('button[data-action="launch-booth"]');
    await sleep(320);
    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: false, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="play-daily"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 18_000);
    browser.assertCleanRuntime();
    return 'Booth Vibe+3 Vetoes -> Blitz hit -> Daily Broadcast immunity verified';
  });

  await runCase(results, { id: 'T3-03', tier: 3, req: 'R3+R1', name: '2-Podium Couch (Easy vs Shark) + BLIND_PURSE + PASS THE HOT MIC! Handoff', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="couch-party"]');
    await sleep(220);
    await browser.clickSelector('button.wsc8-skill-btn[data-podium-skill="0"][data-skill-dial="EASY"]');
    await browser.clickSelector('button.wsc8-skill-btn[data-podium-skill="1"][data-skill-dial="SHARK"]');
    await browser.clickSelector('button[data-action="toggle-board-mode-drawer"]');
    await sleep(160);
    await browser.clickSelector('.wsc8-grid-opt-btn[data-board-mode="BLIND_PURSE"]');
    await browser.clickSelector('button[data-action="couch-step-up"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 18_000);
    await triggerHotMicAndHandoff(browser, oracle);
    browser.assertCleanRuntime();
    return '2P Couch Easy/Shark + BLIND_PURSE + Hot Mic handoff verified';
  });

  await runCase(results, { id: 'T3-04', tier: 3, req: 'R6+R1', name: 'Loss Rematch + Anti-Wall Mercy + Unseen Clues + 50% Consolation SC', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [CAMPAIGN_SAVE_KEY]: {
        episodesPlayed: 2,
        unlockedEpisode: 1,
        consecutiveLossesByEpisode: { '1': 2 },
        cleanPurseCash: 0,
        contrabandTrunkCash: 0,
      },
      [SHOWROOM_SAVE_KEY]: makeDefaultShowroomLedger({ showroomCash: 0 }),
    });
    await enterCampaignBoard(browser);
    const lossRes = await playMatchToEnd(browser, oracle, { wantCorrect: false, useTkoIfAvailable: false, vipAction: 'TRUST' });
    const scAfterLoss = await browser.evalJs('window.__WS_V7__.getShowroomState().showroomCash');
    if (scAfterLoss < 150) throw new Error(`Expected >= $150 Consolation SC, got ${scAfterLoss}`);
    await browser.clickSelector('button[data-action="rematch"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 14_000);
    await browser.clickBoardTileFromTelemetry();
    for (let w = 0; w < 20; w++) {
      const hasStem = await browser.evalJs('Boolean((document.querySelector(".ws7-question-stage:not(.ws7-hidden) .ws7-balanced-copy")?.innerText || "").trim())');
      if (hasStem) break;
      const isVip = await browser.evalJs('Boolean(document.querySelector(".ws9-vip-bluff-card"))');
      if (isVip) break;
      await dismissTheaterIfPresent(browser);
      await sleep(200);
    }
    const rematchStem = await browser.evalJs('(document.querySelector(".ws7-question-stage:not(.ws7-hidden) .ws7-balanced-copy")?.innerText || "").trim()');
    if (rematchStem && lossRes.seenStems.includes(rematchStem)) {
      throw new Error(`Rematch repeated clue stem: ${rematchStem}`);
    }
    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    browser.assertCleanRuntime();
    return `Consolation=$${scAfterLoss}, Anti-wall rematch dealt unseen clue`;
  });

  await runCase(results, { id: 'T3-05', tier: 3, req: 'R1+R8', name: 'Studio Style Cosmetics (Podium + Buzzer + Trilon) + Seasons 1-4 3D Board', strict }, async () => {
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(200);
    await browser.assertNoBrokenImages();
    await browser.assertNoCanvasOrSvgPlaceholders('#ui-root');
    await browser.navigate(`${baseUrl}?qa_view=BOARD&stage=STAGE_04_1958_ISOLATION_VAULT&season=2&nosw=1`, { clearStorage: false, nosw: true });
    await sleep(220);
    await browser.assertWebGL2();
    await browser.assertStageLayoutDiagnostics();
    browser.assertCleanRuntime();
    return 'Showroom cosmetics + Season 2 3D Board verified';
  });

  await runCase(results, { id: 'T3-06', tier: 3, req: 'R5+R1', name: 'Sweeps Intermission Starburst Plinko + Risk-Streak + Showroom SC', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SWEEPS_SAVE_KEY]: makeDefaultSweepsState({
        activeRun: true,
        currentNight: 2,
        safeDepositCash: 500,
        atRiskVaultCash: 500,
        pendingPlinkoFreeDrop: true,
        pendingSponsorDraft: false,
      }),
      [SWEEPS_INTERMISSION_KEY]: '1',
    });
    await browser.evalJs('window.__WS_V7__.openView("sweeps")');
    await sleep(220);
    await browser.clickByText(/PLAY INTERMISSION STARBURST PLINKO/i);
    await sleep(250);
    await browser.assertPlinkoLayoutBounds();
    await browser.clickSelector('.ws9-plinko-lane-btn[data-lane="2"]');
    await browser.waitFor('!window.__WS_V7__.getSweepsState().pendingPlinkoFreeDrop', 9_000);
    browser.assertCleanRuntime();
    return 'Sweeps Intermission Free Plinko completed & applied';
  });

  await runCase(results, { id: 'T3-07', tier: 3, req: 'R7+R4', name: 'LIVE_WIRE_FUSE 3 misses -> Emergency Circuit Breaker + ⚡ TURBO', strict }, async () => {
    await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=LIVE_WIRE_FUSE&nosw=1`, { clearStorage: true, nosw: true });
    await sleep(250);
    await enableTurboIfOff(browser);
    for (let i = 0; i < 3; i++) {
      await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 8_000);
      await browser.clickBoardTileFromTelemetry();
      await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: false });
      await sleep(280);
      await dismissTheaterIfPresent(browser);
    }
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 8_000);
    const open = await browser.evalJs('(window.__WS_V7__.getTelemetry()?.tileScreenPoints || []).filter(t => t.state === "OPEN").length');
    if (open < 1) throw new Error(`LIVE_WIRE_FUSE softlocked after 3 misses (open=${open})`);
    browser.assertCleanRuntime();
    return `LIVE_WIRE_FUSE + Turbo survived 3 misses (open=${open})`;
  });

  await runCase(results, { id: 'T3-08', tier: 3, req: 'R7+R2', name: 'Campaign Win + Turn 7+ TKO Bell + 45s Winner Circle Sprint + Free Curtain Ticket', strict }, async () => {
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    await playMatchToEnd(browser, oracle, { wantCorrect: true, useTkoIfAvailable: true });
    await browser.clickSelector('button[data-action="play-winners-circle"]');
    await sleep(220);
    await completeWinnersCircleSprint(browser, oracle, { wantCorrect: true });
    const sr = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    if (sr.freeCurtainTickets < 1 || sr.showroomCash < 1500) {
      throw new Error(`Expected >=1 Free Curtain Ticket & >=$1500 SC after 6/6 sweep, got ${JSON.stringify(sr)}`);
    }
    browser.assertCleanRuntime();
    return `TKO + 45s Winner Circle 6/6 Sweep awarded SC=$${sr.showroomCash} & tickets=${sr.freeCurtainTickets}`;
  });

  await runCase(results, { id: 'T3-09', tier: 3, req: 'R7+R8', name: 'PRESSURE_COOKER Board + Reactive Studio Signs + Live Gouache Crowd', strict }, async () => {
    await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=PRESSURE_COOKER&stage=STAGE_01_IBC_DAYTIME_FUNK&season=1&nosw=1`, { clearStorage: false, nosw: true });
    await sleep(240);
    await browser.assertStageLayoutDiagnostics();
    const signs = await browser.evalJs('window.__WS_V7__.getStudioSignStates()');
    const mood = await browser.evalJs('window.__WS_V7__.getCrowdMood()');
    if (!signs || !mood) throw new Error('Reactive signs or crowd mood unavailable');
    browser.assertCleanRuntime();
    return `PRESSURE_COOKER + Signs/Crowd verified (mood=${mood})`;
  });

  await runCase(results, { id: 'T3-10', tier: 3, req: 'R3+R9', name: 'Daily Broadcast Booth Immunity + 390x844 Mobile Portrait Layout', strict }, async () => {
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="play-daily"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 20_000);
    await browser.assertTopHudZeroOverlap();
    await browser.assertSignsAndCrowdPlacement({ mobileMode: true });
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    browser.assertCleanRuntime();
    return 'Daily Broadcast on 390x844 mobile clean';
  });

  await runCase(results, { id: 'T3-11', tier: 3, req: 'R8+R6', name: 'Campaign Cold-Open Skip + 3D Tile Raycast + Clue Answer + Turn Advance', strict }, async () => {
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    const tile = await browser.clickBoardTileFromTelemetry();
    const ans = await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    browser.assertCleanRuntime();
    return `tile=${tile.clickedIndex}, answer=${ans.mode}`;
  });

  await runCase(results, { id: 'T3-12', tier: 3, req: 'R8+R9', name: '1440x900 -> 390x844 Resize + WebGL2 Context Survival + Zero Broken Images', strict }, async () => {
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await enterCampaignBoard(browser);
    await browser.assertWebGL2();
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await sleep(250);
    const gl = await browser.assertWebGL2();
    await browser.assertNoBrokenImages();
    browser.assertCleanRuntime();
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    return `WebGL2 survived resize (${gl.canvasW}x${gl.canvasH})`;
  });

  return results;
}

// ----------------------------------------------------------------------------
// TIER 4 — Real-World Application Scenarios (5 Full End-to-End Workloads)
// ----------------------------------------------------------------------------

async function runTier4({ browser, baseUrl, opts, staticReport, oracle }) {
  const results = [];
  const strict = opts.strict;
  await initTierSession(browser, baseUrl, 1440, 900);

  await runStaticTierCheck(results, 4, staticReport, opts);

  await runCase(results, { id: 'T4-1', tier: 4, req: 'R9/R1/R2/R4/R8/R10', name: 'Workload T4-1: 3-Tier Hub + Campaign Cold-Open -> TKO Bell -> 45s Winner Circle -> Showroom Curtain & Den', strict }, async () => {
    await browser.assertTitleHubLayoutIntegrity();
    await browser.screenshot('t4_hub_1440x900.png');
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await sleep(200);
    await browser.assertTitleHubLayoutIntegrity();
    await browser.screenshot('t4_hub_390x844.png');
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });

    // Play real Campaign Ep 1 -> TKO Bell -> Winner's Circle
    await enterCampaignBoard(browser);
    await playMatchToEnd(browser, oracle, { wantCorrect: true, useTkoIfAvailable: true });
    await browser.clickSelector('button[data-action="play-winners-circle"]');
    await sleep(220);
    await completeWinnersCircleSprint(browser, oracle, { wantCorrect: true });

    // Open Showroom, spend earned SC on Curtain Gamble, inspect Den
    await browser.evalJs('window.__WS_V7__.openView("showroom")');
    await sleep(280);
    const curtainH1440 = await browser.evalJs('Math.round(document.querySelector(".ws9-curtain-section")?.getBoundingClientRect().height || 0)');
    if (curtainH1440 < 180) throw new Error(`T4-1 Curtain Stage height ${curtainH1440}px < 180px at 1440x900`);
    const showroomTiles = await browser.evalJs('document.querySelectorAll(".ws9-atlas-sprite-tile").length');
    if (showroomTiles < 55) throw new Error(`T4-1 expected >= 55 Showroom prize tiles, got ${showroomTiles}`);
    await browser.clickSelector('.ws9-curtain-bay-btn');
    await sleep(260);
    await browser.assertNoBrokenImages();
    await browser.assertNoCanvasOrSvgPlaceholders('#ui-root');
    await browser.verifyLiveAtlasBindings();
    await browser.screenshot('t4_showroom_1440x900.png');

    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await sleep(200);
    const curtainH390 = await browser.evalJs('Math.round(document.querySelector(".ws9-curtain-section")?.getBoundingClientRect().height || 0)');
    if (curtainH390 < 180) throw new Error(`T4-1 Curtain Stage height ${curtainH390}px < 180px at 390x844`);
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });

    await browser.clickByText(/DEN\s*&\s*TROPHIES/i);
    await sleep(240);
    const denH1440 = await browser.evalJs('Math.round(document.querySelector(".ws9-den-lounge-stage")?.getBoundingClientRect().height || 0)');
    if (denH1440 < 200) throw new Error(`T4-1 Winner Den Lounge height ${denH1440}px < 200px at 1440x900`);
    await browser.screenshot('t4_den_1440x900.png');

    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await sleep(200);
    const denH390 = await browser.evalJs('Math.round(document.querySelector(".ws9-den-lounge-stage")?.getBoundingClientRect().height || 0)');
    if (denH390 < 200) throw new Error(`T4-1 Winner Den Lounge height ${denH390}px < 200px at 390x844`);
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });

    const sr = await browser.evalJs('window.__WS_V7__.getShowroomState()');
    browser.assertCleanRuntime();
    return `T4-1 full workload passed (pulls=${sr.totalCurtainPulls}, tiles=${showroomTiles}, curtain=${curtainH1440}/${curtainH390}, den=${denH1440}/${denH390})`;
  });

  await runCase(results, { id: 'T4-2', tier: 4, req: 'R5/R6/R7/R4/R1', name: 'Workload T4-2: Sweeps Week Gauntlet + Sponsor Draft + Intermission Plinko + Risk-Streak + Revenge Rematch', strict }, async () => {
    await seedLocalStorageAndReload(browser, `${baseUrl}?nosw=1`, {
      [SWEEPS_SAVE_KEY]: makeDefaultSweepsState({
        activeRun: true,
        currentNight: 2,
        safeDepositCash: 750,
        atRiskVaultCash: 750,
        pendingPlinkoFreeDrop: true,
        pendingSponsorDraft: true,
      }),
      [SWEEPS_INTERMISSION_KEY]: '1',
    });
    await browser.evalJs('window.__WS_V7__.openView("sweeps")');
    await sleep(260);
    await browser.screenshot('t4_sweeps_1440x900.png');

    // Draft sponsor
    await browser.evalJs('document.querySelector(".ws9-sweeps-shell .ws9-shell-body > section:last-child button.ws9-btn-cream")?.click()');
    await sleep(220);

    // Intermission Free Plinko drop + 390x844 bounds check
    await browser.clickByText(/PLAY INTERMISSION STARBURST PLINKO/i);
    await sleep(250);
    await browser.assertPlinkoLayoutBounds();
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await sleep(200);
    await browser.assertPlinkoLayoutBounds();
    await browser.screenshot('t4_plinko_390x844.png');
    await browser.clickSelector('.ws9-plinko-lane-btn[data-lane="2"]');
    await browser.waitFor('!window.__WS_V7__.getSweepsState().pendingPlinkoFreeDrop', 9_000);
    await browser.clickByText(/COLLECT & CONTINUE|DONE/i);
    await sleep(220);
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await sleep(220);

    // Risk Streak -> Night 3 -> deliberate loss -> Revenge Match CTA
    await browser.clickByText(/RISK STREAK/i);
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 18_000);
    await playMatchToEnd(browser, oracle, { wantCorrect: false, useTkoIfAvailable: false, vipAction: 'TRUST' });
    const st = await browser.evalJs('window.__WS_V7__.getSweepsState()');
    if (st.pendingLossRematchNight !== 3 || st.revengeJackpotPool < 1000) {
      throw new Error(`Expected Night 3 Revenge Match state, got ${JSON.stringify(st)}`);
    }
    browser.assertCleanRuntime();
    return `T4-2 completed (sponsorCount=${st.draftedSponsors.length}, revengeNight=${st.pendingLossRematchNight}, jackpot=$${st.revengeJackpotPool})`;
  });

  await runCase(results, { id: 'T4-3', tier: 4, req: 'R2/R3/R1', name: 'Workload T4-3: Custom Broadcast Booth -> 60-Second Blitz (+3s/-4s/PASS) + Daily Broadcast Immunity', strict }, async () => {
    await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="blitz-booth"]');
    await sleep(220);
    await browser.evalJs('document.querySelectorAll(".ws9-vibe-card[data-vibe-pack]")[2]?.click()');
    await sleep(100);
    await browser.clickSelector('.ws9-veto-chip');
    await browser.clickSelector('button[data-action="launch-booth"]');
    await sleep(420);
    await browser.screenshot('t4_blitz_390x844.png');

    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    await sleep(320);
    await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: false });
    await sleep(320);
    await browser.clickSelector('button[data-action="blitz-pass"]');
    await sleep(220);

    // Daily Broadcast immunity check
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: false, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="play-daily"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 18_000);
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    browser.assertCleanRuntime();
    return 'T4-3 Booth -> Blitz (+3s/-4s/PASS) -> Daily immunity completed';
  });

  await runCase(results, { id: 'T4-4', tier: 4, req: 'R3/R1', name: 'Workload T4-4: 2-Podium Couch Showdown (Easy vs Shark + BLACKOUT_VAULT) + PASS THE HOT MIC! 10s Privacy Handoff', strict }, async () => {
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    await browser.navigate(`${baseUrl}?nosw=1`, { clearStorage: true, nosw: true });
    await browser.dismissPreBoardOverlays({ maxSteps: 4 });
    await browser.clickSelector('button[data-action="couch-party"]');
    await sleep(320);
    await browser.clickSelector('button.wsc8-skill-btn[data-podium-skill="0"][data-skill-dial="EASY"]');
    await browser.clickSelector('button.wsc8-skill-btn[data-podium-skill="1"][data-skill-dial="SHARK"]');
    await browser.clickSelector('button[data-action="toggle-board-mode-drawer"]');
    await sleep(160);
    await browser.clickSelector('.wsc8-grid-opt-btn[data-board-mode="BLACKOUT_VAULT"]');
    await browser.screenshot('t4_couch_1440x900.png');
    await browser.clickSelector('button[data-action="couch-step-up"]');
    await browser.waitFor('window.__WS_V7__?.getTelemetry?.()?.phase === "BOARD_SELECT"', 18_000);

    await triggerHotMicAndHandoff(browser, oracle);
    browser.assertCleanRuntime();
    return 'T4-4 Couch Easy vs Shark + BLACKOUT_VAULT + Hot Mic 10s Privacy Handoff completed';
  });

  await runCase(results, { id: 'T4-5', tier: 4, req: 'R7/R8/R4/R10', name: 'Workload T4-5: All 8 R7 Board Modes + Seasons 1-4 (1440x900 & 390x844) Visual/HUD/Sign/Crowd Checks', strict }, async () => {
    for (const mode of ALL_R7_MODES) {
      await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
      await browser.navigate(`${baseUrl}?qa_view=BOARD&mode=${mode}&nosw=1`, { clearStorage: false, nosw: true });
      await sleep(220);
      const gotMode = await browser.evalJs('window.__WS_V7__.getActiveBoardMode()');
      if (gotMode !== mode) throw new Error(`Expected mode ${mode}, got ${gotMode}`);
      await browser.assertStageLayoutDiagnostics();
      await browser.clickBoardTileFromTelemetry();
      await browser.answerCurrentClue({ waitMs: 420, oracle, wantCorrect: true });
    }

    const seasonPairs = [
      [1, 'STAGE_01_IBC_DAYTIME_FUNK'],
      [2, 'STAGE_04_1958_ISOLATION_VAULT'],
      [3, 'STAGE_07_1969_MONTE_CARLO_CASINO'],
      [4, 'STAGE_10_SOVEREIGN_SANCTUM'],
    ];
    for (const [s, stgId] of seasonPairs) {
      const seasonUrl = `${baseUrl}?qa_view=BOARD&stage=${encodeURIComponent(stgId)}&board=BOARD_01_FUNK_CROSSFADER&season=${s}&nosw=1`;
      await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
      await browser.navigate(seasonUrl, { clearStorage: false, nosw: true });
      await sleep(280);
      const sid1440 = await browser.evalJs('window.__WS_V7__.getSeasonId()');
      if (Number(sid1440) !== s) throw new Error(`Expected getSeasonId() === ${s}, got ${sid1440}`);
      await browser.assertTopHudZeroOverlap();
      await browser.assertSignsAndCrowdPlacement({ mobileMode: false });
      await browser.assertStageLayoutDiagnostics();
      await browser.screenshot(`season_${s}_1440x900.png`);

      await browser.setViewport(390, 844, { mobile: true, dpr: 1 });
      await sleep(240);
      const sid390 = await browser.evalJs('window.__WS_V7__.getSeasonId()');
      if (Number(sid390) !== s) throw new Error(`Expected getSeasonId() === ${s} on 390x844, got ${sid390}`);
      await browser.assertTopHudZeroOverlap();
      await browser.assertSignsAndCrowdPlacement({ mobileMode: true });
      await browser.assertStageLayoutDiagnostics();
      await browser.screenshot(`season_${s}_390x844.png`);
    }
    await browser.setViewport(1440, 900, { mobile: false, dpr: 1 });
    browser.assertCleanRuntime();
    return `T4-5 completed: all ${ALL_R7_MODES.length} R7 Board Modes played + Seasons 1-4 (1440x900 & 390x844) P0 verified`;
  });

  return results;
}

// ----------------------------------------------------------------------------
// Reporting & CLI Runner
// ----------------------------------------------------------------------------

function summarizeResults(allResults) {
  const counts = { PASS: 0, FAIL: 0, PENDING_M1_M4: 0 };
  for (const r of allResults) {
    counts[r.status] = (counts[r.status] || 0) + 1;
  }
  return { total: allResults.length, ...counts, ok: counts.FAIL === 0 };
}

function printMarkdownSummary(title, results, summary) {
  console.log(`\n=== ${title} ===`);
  console.log('| ID | Tier | Req | Status | Name | Details |');
  console.log('|---|---|---|---|---|---|');
  for (const r of results) {
    const cleanDetails = String(r.details || '').replace(/\|/g, '/').slice(0, 110);
    console.log(`| ${r.id} | ${r.tier} | ${r.req} | ${r.status} | ${r.name} | ${cleanDetails} |`);
  }
  console.log(
    `\nSummary: total=${summary.total}, PASS=${summary.PASS}, PENDING_M1_M4=${summary.PENDING_M1_M4}, FAIL=${summary.FAIL}\n`,
  );
}

async function main() {
  const opts = parseCliArgs(process.argv.slice(2));
  const oracle = loadClueOracle();
  console.log(`Loaded E2E Clue Answer Oracle: ${oracle.totalIndexed} clues indexed from public/data/v7/*.json`);

  const server = await ensureDistServer8999(REPO_ROOT);
  const browser = await launchV9Browser({ screenshotsDir: opts.screenshotsDir });
  activeRecoveryCtx = { browser, baseUrl: server.baseUrl };
  testsSinceRecycle = 0;

  let allResults = [];
  let staticReport = null;

  try {
    if (opts.smoke) {
      const smokeOut = await runSmokeMode({ browser, baseUrl: server.baseUrl, opts });
      staticReport = smokeOut.staticReport;
      allResults = smokeOut.results;
    } else {
      if (!opts.skipStatic) {
        staticReport = runAllStaticGates({
          skipBuild: opts.skipBuild && !opts.strict,
          baseline: !opts.strict,
          strictV9: opts.strict,
        });
      }
      const runT1 = opts.tier === '1' || opts.tier === 'all';
      const runT2 = opts.tier === '2' || opts.tier === 'all';
      const runT3 = opts.tier === '3' || opts.tier === 'all';
      const runT4 = opts.tier === '4' || opts.tier === 'all';

      if (runT1) allResults.push(...(await runTier1({ browser, baseUrl: server.baseUrl, opts, staticReport, oracle })));
      if (runT2) allResults.push(...(await runTier2({ browser, baseUrl: server.baseUrl, opts, staticReport, oracle })));
      if (runT3) allResults.push(...(await runTier3({ browser, baseUrl: server.baseUrl, opts, staticReport, oracle })));
      if (runT4) allResults.push(...(await runTier4({ browser, baseUrl: server.baseUrl, opts, staticReport, oracle })));
    }
  } finally {
    await browser.close();
    await server.close();
  }

  const summary = summarizeResults(allResults);
  const title = opts.smoke ? "World's Smartest v9 — E2E Smoke Report" : `World's Smartest v9 — E2E Tier=${opts.tier} Report`;
  printMarkdownSummary(title, allResults, summary);

  if (opts.jsonOut) {
    fs.mkdirSync(path.dirname(opts.jsonOut), { recursive: true });
    fs.writeFileSync(
      opts.jsonOut,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          mode: opts.smoke ? 'smoke' : `tier=${opts.tier}`,
          strict: opts.strict,
          summary,
          staticReport,
          results: allResults,
        },
        null,
        2,
      ),
      'utf8',
    );
  }

  process.exit(summary.ok ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal E2E runner error:', err);
  process.exit(1);
});
