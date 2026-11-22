#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST v2.0 — RT-V2-DUEL-MORPH-QA (Adversarial Red-Team Suite)
// Verifies Upgrades #1, #2 & #4 live in real Headless Edge WebGL2 against `dist/`:
//   • Upgrade #1: `?duel=WSD2...` One-Tap Duel Link Round-Trip & Live Ghost Race
//   • Upgrade #2: `GLOBE_PIN_DROP` 6th 3D Morph (direct 3D canvas tap + 2D quick-anchor
//                 + 3D geodesic reveal + Haversine km score) & Visual Sapphire Blueprints
//                 across 360×640, 390×844, 844×390, and 1280×800 (`0/4` covered A–D, `0` SVG 404s)
//   • Upgrade #4: Bundle Code-Splitting (`index-*.js < 400 KB` raw) & `< 500ms` Instant
//                 Trial Prism Cold Open + Post-Prism Summons Chooser (`Campaign`/`Baseball`/`Daily`)
//
// Serves `dist/` on an ephemeral `127.0.0.1:0` port (NEVER touches `:8088`).
// Usage:
//   node tools/qa/rt_v2_duel_and_morphs_audit.mjs [--suite=all|bundle|instant|duel|morphs]
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { build as esbuild } from 'esbuild';
import {
  DIST_DIR,
  ROOT,
  launchCdpBrowser,
  sleep,
  startDistServer,
} from './rt_e2e_cdp.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOT_DIR =
  'C:/Users/mshaf/.gemini/antigravity/brain/e5b68413-1abb-49c5-b335-6dc9e46c2e6f/rt_v2_duel_morphs';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const CLI = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const i = a.indexOf('=');
      return i === -1 ? [a.slice(2), 'true'] : [a.slice(2, i), a.slice(i + 1)];
    }),
);
const SUITE = CLI.suite || 'all';
const FILTER_VPS = CLI.viewports ? new Set(CLI.viewports.split(',').map((s) => s.trim())) : null;

const ALL_MORPH_VIEWPORTS = [
  { id: '360x640', label: 'Compact Android Portrait', width: 360, height: 640, mobile: true, dpr: 2, isPortrait: true },
  { id: '390x844', label: 'iPhone 15 Portrait', width: 390, height: 844, mobile: true, dpr: 2, isPortrait: true },
  { id: '844x390', label: 'Phone Landscape', width: 844, height: 390, mobile: true, dpr: 2, isPortrait: false },
  { id: '1280x800', label: 'Desktop', width: 1280, height: 800, mobile: false, dpr: 1, isPortrait: false },
];
const MORPH_VIEWPORTS = FILTER_VPS
  ? ALL_MORPH_VIEWPORTS.filter((v) => FILTER_VPS.has(v.id))
  : ALL_MORPH_VIEWPORTS;

const SHARE_CAPTURE_PRELOAD = `
(() => {
  if (window.__rtShareHooked) return;
  window.__rtShareHooked = true;
  window.__rtClipboardWrites = [];
  window.__rtNativeShares = [];
  try {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      writable: true,
      value: undefined,
    });
  } catch {}
  try {
    const clip = {
      writeText: async (text) => {
        window.__rtClipboardWrites.push(String(text));
        return undefined;
      },
      readText: async () => window.__rtClipboardWrites[window.__rtClipboardWrites.length - 1] || '',
    };
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      get: () => clip,
    });
  } catch {}
})();
`;

const results = {
  passed: [],
  failed: [],
  screenshots: [],
  metrics: {},
};

function recordPass(id, detail) {
  results.passed.push({ id, detail });
  console.log(`  [PASS] ${id}: ${detail}`);
}

function recordFail(id, detail) {
  results.failed.push({ id, detail });
  console.error(`  [FAIL] ${id}: ${detail}`);
}

function assertCheck(cond, id, passDetail, failDetail) {
  if (cond) {
    recordPass(id, passDetail);
    return true;
  }
  recordFail(id, failDetail || passDetail);
  return false;
}

async function saveProof(browser, filename, caption) {
  const absPath = path.join(SCREENSHOT_DIR, filename).replace(/\\/g, '/');
  await browser.screenshot(absPath);
  results.screenshots.push({ path: absPath, caption });
  console.log(`    [SHOT] ${absPath} | ${caption}`);
  return absPath;
}

async function loadDuelCodec() {
  const tmpFile = path.join(os.tmpdir(), `ws_duel_codec_${Date.now()}.mjs`);
  await esbuild({
    entryPoints: [path.join(ROOT, 'src/modes/DuelLinkCodec.ts')],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile: tmpFile,
    logLevel: 'silent',
  });
  const mod = await import(pathToFileURL(tmpFile).href);
  try {
    fs.unlinkSync(tmpFile);
  } catch {}
  return mod;
}

async function launchAuditedBrowser(vp) {
  const browser = await launchCdpBrowser({ width: vp.width, height: vp.height });
  await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: SHARE_CAPTURE_PRELOAD });
  await browser.setViewport({
    width: vp.width,
    height: vp.height,
    mobile: vp.mobile,
    dpr: vp.dpr,
  });
  return browser;
}

function filterNonFaviconHttpErrors(httpErrors) {
  return httpErrors.filter((e) => !String(e.url || '').includes('favicon.ico'));
}

async function waitForTitleReady(browser, timeoutMs = 25000) {
  const ok = await browser.waitFor(
    `Boolean(
      document.querySelector('#ws-title-enter-cta') &&
      document.querySelector('#canvas-root canvas') &&
      (window.__rtStats?.webglContexts || 0) > 0
    )`,
    timeoutMs,
    100,
  );
  if (!ok) throw new Error('Title screen did not mount within timeout');
  // Wait 2 rAFs so the first WebGL2 frame has flushed on Title before user clicks
  await browser.evalJs(
    `new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true))))`,
  );
  await sleep(250);
}

async function waitForBootHydrated(browser) {
  // Wait until background bootAsync resources (`visual_globe_packs.json` + `campaign_20hr.json`) finish loading
  await browser.waitFor(
    `(() => {
      const entries = performance.getEntriesByType('resource');
      const hasVG = entries.some((e) => e.name.includes('visual_globe_packs.json') && e.responseEnd > 0);
      const hasCamp = entries.some((e) => e.name.includes('campaign_20hr.json') && e.responseEnd > 0);
      return hasVG && hasCamp;
    })()`,
    15000,
    150,
  );
  await sleep(450);
}

/**
 * Clicks an element safely using real CDP mouse or touch depending on viewport,
 * falling back cleanly to real pointer center coordinates.
 */
async function tapOrClickSelector(browser, selector, { mobile = true, timeoutMs = 10000 } = {}) {
  const ok = await browser.waitFor(
    `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && !el.disabled;
    })()`,
    timeoutMs,
    100,
  );
  if (!ok) throw new Error(`Clickable element not ready: ${selector}`);
  const pt = await browser.evalJs(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    const cx = Math.max(1, Math.min(window.innerWidth - 1, r.left + r.width / 2));
    const cy = Math.max(1, Math.min(window.innerHeight - 1, r.top + r.height / 2));
    const hit = document.elementFromPoint(cx, cy);
    const hitSelf = Boolean(hit && (hit === el || el.contains(hit)));
    const hitDesc = hit ? (hit.tagName.toLowerCase() + (hit.id ? '#' + hit.id : '') + (hit.className ? '.' + String(hit.className).trim().split(/\\s+/).slice(0, 2).join('.') : '')) : 'null';
    return { x: cx, y: cy, w: r.width, h: r.height, hitSelf, hitDesc };
  })()`);
  if (!pt.hitSelf) {
    console.warn(`    [WARN] tapOrClickSelector(${selector}) center (${Math.round(pt.x)},${Math.round(pt.y)}) hit ${pt.hitDesc} instead of target!`);
  }
  await sleep(60);
  await browser.mouseClick(pt.x, pt.y);
  return pt;
}

/**
 * Solves whichever of the 6 3D archetypes is currently mounted on screen and waits for Reveal
 * (`#ws-btn-next-q` or `#ws-instant-prism-next-bar`).
 */
async function answerCurrentQuestionAndWaitReveal(browser, { preferredFacet = 0, preferredAnchor = 0 } = {}) {
  for (let stepAttempt = 0; stepAttempt < 4; stepAttempt++) {
    const state = await browser.evalJs(`(() => {
      if (document.querySelector('#ws-btn-next-q') || document.querySelector('#ws-instant-prism-next-bar')) {
        return { revealed: true };
      }
      if (document.querySelector('#ws-globe-pin-controls')) return { archetype: 'GLOBE_PIN_DROP' };
      if (document.querySelector('[data-gauntlet]')) return { archetype: 'GAUNTLET_SHATTER' };
      if (document.querySelector('#ws-cal-slider')) return { archetype: 'CALIBRATOR_DIAL' };
      if (document.querySelector('[data-codex-subject], [data-codex-row], [data-codex-delta], .ws-codex-row')) return { archetype: 'CODEX_DUAL_RING' };
      if (document.querySelector('[data-facet-idx]')) return { archetype: 'SIGHTLINE_LOCK' };
      if (document.querySelector('#ws-btn-overclock') && !document.querySelector('#ws-btn-overclock').disabled) {
        return { archetype: 'OVERCLOCK_DIRECT' };
      }
      return { archetype: 'UNKNOWN' };
    })()`);

    if (state.revealed) return true;

    if (state.archetype === 'GAUNTLET_SHATTER') {
      await tapOrClickSelector(browser, '[data-gauntlet="VERIFY"]');
    } else if (state.archetype === 'GLOBE_PIN_DROP') {
      const anchorSel = `[data-globe-anchor-idx="${preferredAnchor}"]`;
      await tapOrClickSelector(browser, anchorSel);
      await sleep(140);
      await tapOrClickSelector(browser, '#ws-btn-overclock');
    } else if (
      state.archetype === 'CALIBRATOR_DIAL' ||
      state.archetype === 'CODEX_DUAL_RING' ||
      state.archetype === 'OVERCLOCK_DIRECT'
    ) {
      await tapOrClickSelector(browser, '#ws-btn-overclock');
    } else if (state.archetype === 'SIGHTLINE_LOCK') {
      // Pick first non-shattered, non-disabled facet and arm/lock via #ws-btn-overclock
      const pickInfo = await browser.evalJs(`(() => {
        const els = [...document.querySelectorAll('[data-facet-idx]')].filter(
          (el) => !el.disabled && !el.classList.contains('is-shattered'),
        );
        if (!els.length) return null;
        const chosen = els[Math.min(${preferredFacet}, els.length - 1)] || els[0];
        const idx = Number(chosen.dataset.facetIdx);
        const alreadySelected = chosen.classList.contains('is-sightline');
        return { idx, alreadySelected };
      })()`);
      if (!pickInfo) throw new Error('No playable facet found in SIGHTLINE_LOCK');
      if (!pickInfo.alreadySelected) {
        await tapOrClickSelector(browser, `[data-facet-idx="${pickInfo.idx}"]`);
        await sleep(120);
      }
      // If clicking facet didn't auto-commit, click #ws-btn-overclock
      const alreadyRev = await browser.evalJs(
        `Boolean(document.querySelector('#ws-btn-next-q') || document.querySelector('#ws-instant-prism-next-bar'))`,
      );
      if (!alreadyRev) {
        const hasOc = await browser.evalJs(
          `Boolean(document.querySelector('#ws-btn-overclock') && !document.querySelector('#ws-btn-overclock').disabled)`,
        );
        if (hasOc) {
          await tapOrClickSelector(browser, '#ws-btn-overclock');
        }
      }
    } else {
      await sleep(200);
    }

    const revealedNow = await browser.waitFor(
      `Boolean(document.querySelector('#ws-btn-next-q') || document.querySelector('#ws-instant-prism-next-bar'))`,
      3500,
      100,
    );
    if (revealedNow) return true;
    // Might be multi-step HERO_ARTIFACT_SYNTHESIS — loop for next step!
    await sleep(300);
  }
  const dbg = await browser.evalJs(`({
    prompt: (document.querySelector('.ws-question-prompt')?.textContent || '').slice(0, 80),
    hasNext: Boolean(document.querySelector('#ws-btn-next-q')),
    hasOc: Boolean(document.querySelector('#ws-btn-overclock')),
    ocDisabled: Boolean(document.querySelector('#ws-btn-overclock')?.disabled),
    ocText: (document.querySelector('#ws-btn-overclock')?.textContent || '').trim(),
    facets: document.querySelectorAll('[data-facet-idx]').length,
    gauntlets: document.querySelectorAll('[data-gauntlet]').length,
    globe: Boolean(document.querySelector('#ws-globe-pin-controls')),
    cal: Boolean(document.querySelector('#ws-cal-slider')),
    codex: document.querySelectorAll('[data-codex-subject]').length,
    hasSummary: Boolean(document.querySelector('#ws-btn-share-duel-link')),
    bodySnippet: document.body.innerText.replace(/\\s+/g, ' ').slice(0, 220),
  })`);
  throw new Error(`Question did not reach reveal state after 4 step attempts: ${JSON.stringify(dbg)}`);
}

/**
 * Surgical geometry prover for Visual Sapphire Blueprints (`visualPlate`) & `GLOBE_PIN_DROP`
 * across all 4 viewports (`360×640`, `390×844`, `844×390`, `1280×800`).
 */
const MEASURE_GAMEPLAY_GEOMETRY_FN = function measureV2GameplayGeometry(phaseLabel) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const r1 = (n) => Math.round(n * 10) / 10;

  function rectObj(el) {
    if (!el) return null;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.02) {
      return null;
    }
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    return {
      top: r1(r.top),
      bottom: r1(r.bottom),
      left: r1(r.left),
      right: r1(r.right),
      width: r1(r.width),
      height: r1(r.height),
    };
  }

  function overlapArea(a, b) {
    if (!a || !b) return 0;
    const xo = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const yo = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    if (xo <= 0.5 || yo <= 0.5) return 0;
    return Math.round(xo * yo);
  }

  function findClipViolations(el, r) {
    const clips = [];
    let p = el.parentElement;
    while (p && p !== document.body && p !== document.documentElement) {
      const cs = getComputedStyle(p);
      const ovY = cs.overflowY;
      const ovX = cs.overflowX;
      if (ovY === 'hidden' || ovY === 'auto' || ovY === 'scroll' || ovY === 'clip') {
        const pr = p.getBoundingClientRect();
        if (r.top < pr.top - 1.5 || r.bottom > pr.bottom + 1.5) {
          clips.push({
            ancestor: p.className ? String(p.className).slice(0, 50) : p.tagName,
            clippedTopPx: r1(Math.max(0, pr.top - r.top)),
            clippedBottomPx: r1(Math.max(0, r.bottom - pr.bottom)),
          });
        }
      }
      if (ovX === 'hidden' || ovX === 'auto' || ovX === 'scroll' || ovX === 'clip') {
        const pr = p.getBoundingClientRect();
        if (r.left < pr.left - 1.5 || r.right > pr.right + 1.5) {
          clips.push({
            ancestor: p.className ? String(p.className).slice(0, 50) : p.tagName,
            clippedLeftPx: r1(Math.max(0, pr.left - r.left)),
            clippedRightPx: r1(Math.max(0, r.right - pr.right)),
          });
        }
      }
      p = p.parentElement;
    }
    return clips;
  }

  const plateEl = document.querySelector('#ws-visual-plate-frame');
  const plateImgEl = document.querySelector('.ws-visual-plate-img');
  const controls = {
    visualPlate: rectObj(plateEl),
    peel: rectObj(document.querySelector('#ws-btn-peel')),
    overclock: rectObj(document.querySelector('#ws-btn-overclock')),
    bookmark: rectObj(document.querySelector('#ws-btn-bookmark')),
    nextQ: rectObj(document.querySelector('#ws-btn-next-q')),
    pinnedActions: rectObj(document.querySelector('.ws-dock-pinned-actions')),
    intelFlash: rectObj(document.querySelector('.ws-intel-flash')),
    clueDrawer: rectObj(document.querySelector('.ws-clue-drawer')),
    prompt: rectObj(document.querySelector('.ws-question-prompt')),
    globeControls: rectObj(document.querySelector('#ws-globe-pin-controls')),
    duelSplitBar: rectObj(document.querySelector('#ws-duel-live-split-bar')),
    instantNextBar: rectObj(document.querySelector('#ws-instant-prism-next-bar')),
  };

  function inspectInteractiveButtons(selector) {
    return [...document.querySelectorAll(selector)].map((el, i) => {
      const r = rectObj(el);
      const disabled = Boolean(el.disabled);
      if (!r) return { idx: i, visible: false, disabled };
      const inViewport =
        r.top >= -0.5 && r.bottom <= H + 0.5 && r.left >= -0.5 && r.right <= W + 0.5;
      const clips = findClipViolations(el, r);
      const overlaps = {
        visualPlate: overlapArea(r, controls.visualPlate),
        peel: overlapArea(r, controls.peel),
        overclock: overlapArea(r, controls.overclock),
        bookmark: overlapArea(r, controls.bookmark),
        nextQ: overlapArea(r, controls.nextQ),
        pinnedActions: overlapArea(r, controls.pinnedActions),
        intelFlash: overlapArea(r, controls.intelFlash),
        clueDrawer: overlapArea(r, controls.clueDrawer),
      };
      const maxOverlapPx = Math.max(0, ...Object.values(overlaps));
      const cx = Math.max(0, Math.min(W - 1, r.left + r.width / 2));
      const cy = Math.max(0, Math.min(H - 1, r.top + r.height / 2));
      const hitEl = document.elementFromPoint(cx, cy);
      const hitSelf = Boolean(hitEl && (hitEl === el || el.contains(hitEl)));
      const hitDesc = hitEl
        ? `${hitEl.tagName.toLowerCase()}${hitEl.id ? '#' + hitEl.id : ''}${hitEl.className ? '.' + String(hitEl.className).trim().split(/\s+/).slice(0, 2).join('.') : ''}`
        : 'null';
      return {
        idx: i,
        visible: true,
        disabled,
        rect: r,
        inViewport,
        heightOk: r.height >= 34,
        clips,
        overlaps,
        maxOverlapPx,
        hitSelf,
        hitDesc,
        text: (el.textContent || '').trim().slice(0, 44),
      };
    });
  }

  const facets = inspectInteractiveButtons('[data-facet-idx]');
  const globeAnchors = inspectInteractiveButtons('.ws-globe-anchor-btn');

  const visualPlateImg = plateImgEl
    ? {
        src: plateImgEl.getAttribute('src') || '',
        currentSrc: plateImgEl.currentSrc || '',
        complete: Boolean(plateImgEl.complete),
        naturalWidth: plateImgEl.naturalWidth || 0,
        naturalHeight: plateImgEl.naturalHeight || 0,
      }
    : null;

  return {
    phaseLabel,
    viewport: { W, H },
    controls,
    visualPlateImg,
    facets,
    globeAnchors,
    horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - W),
    promptText: (document.querySelector('.ws-question-prompt')?.textContent || '').trim(),
  };
};

// ============================================================================
// SUITE 0: BUNDLE CODE-SPLITTING & VISUAL SVG ASSET INTEGRITY (UPGRADES #4 & #2)
// ============================================================================
async function runBundleAndAssetAudit(baseUrl) {
  console.log('\n=== SUITE 0: BUNDLE CODE-SPLITTING & VISUAL SVG INTEGRITY ===');

  const assetsDir = path.join(DIST_DIR, 'assets');
  const jsFiles = fs
    .readdirSync(assetsDir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => {
      const sz = fs.statSync(path.join(assetsDir, f)).size;
      return { file: f, bytes: sz, kb: Number((sz / 1024).toFixed(2)) };
    })
    .sort((a, b) => b.bytes - a.bytes);

  const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  const entryMatch = indexHtml.match(/src="\.\/assets\/(index-[^"]+\.js)"/);
  const entryName = entryMatch ? entryMatch[1] : jsFiles.find((j) => j.file.startsWith('index-'))?.file;
  const entryChunk = jsFiles.find((j) => j.file === entryName);
  const largestChunk = jsFiles[0];

  results.metrics.bundleChunks = jsFiles;
  results.metrics.entryChunk = entryChunk;

  console.log('  JS chunks in dist/assets/:');
  for (const c of jsFiles) {
    console.log(`    - ${c.file}: ${c.kb} KiB (${(c.bytes / 1000).toFixed(2)} kB)`);
  }

  assertCheck(
    Boolean(entryChunk && entryChunk.bytes < 400 * 1024),
    'UPGRADE4_ENTRY_CHUNK_UNDER_400KB',
    `Entry chunk ${entryChunk?.file} is ${(entryChunk.bytes / 1000).toFixed(2)} kB (${entryChunk.kb} KiB) < 400 KB raw`,
    `Entry chunk missing or >= 400 KB: ${JSON.stringify(entryChunk)}`,
  );

  const monolithic = jsFiles.filter((c) => c.bytes >= 1_000_000);
  assertCheck(
    monolithic.length === 0,
    'UPGRADE4_NO_MONOLITHIC_1MB_CHUNK',
    `0 monolithic >= 1 MB JS chunks (largest chunk: ${largestChunk?.file} @ ${(largestChunk.bytes / 1000).toFixed(2)} kB)`,
    `Found monolithic >= 1 MB chunk(s): ${JSON.stringify(monolithic)}`,
  );

  // Check all visualPlate SVG URLs from dist/data/visual_globe_packs.json over live ephemeral HTTP
  const packPath = path.join(DIST_DIR, 'data', 'visual_globe_packs.json');
  assertCheck(
    fs.existsSync(packPath),
    'UPGRADE2_VISUAL_GLOBE_PACK_EXISTS',
    `dist/data/visual_globe_packs.json exists (${(fs.statSync(packPath).size / 1024).toFixed(1)} KiB)`,
    'dist/data/visual_globe_packs.json is MISSING!',
  );

  if (fs.existsSync(packPath)) {
    const rawPack = JSON.parse(fs.readFileSync(packPath, 'utf8'));
    const items = Array.isArray(rawPack) ? rawPack : rawPack.questions || [];
    const visualUrls = [...new Set(items.map((q) => q.visualPlate?.imageUrl).filter(Boolean))];
    const globeItems = items.filter((q) => q.archetype === 'GLOBE_PIN_DROP' || q.globePin);

    let failedSvgs = [];
    for (const relUrl of visualUrls) {
      const cleanRel = relUrl.replace(/^\.\//, '');
      const resp = await fetch(`${baseUrl}/${cleanRel}`);
      const ct = resp.headers.get('content-type') || '';
      const body = await resp.text();
      if (resp.status !== 200 || !ct.includes('svg') || !body.includes('<svg')) {
        failedSvgs.push({ relUrl, status: resp.status, ct });
      }
    }

    results.metrics.visualSvgCount = visualUrls.length;
    results.metrics.globePackCount = globeItems.length;

    assertCheck(
      visualUrls.length >= 60 && failedSvgs.length === 0,
      'UPGRADE2_ALL_VISUAL_SVGS_HTTP_200',
      `${visualUrls.length}/${visualUrls.length} unique ./assets/visuals/*.svg plates returned HTTP 200 image/svg+xml (0 404s; ${globeItems.length} GLOBE_PIN_DROP Qs in pack)`,
      `SVG fetch failures (${failedSvgs.length}/${visualUrls.length}): ${JSON.stringify(failedSvgs.slice(0, 5))}`,
    );
  }
}

// ============================================================================
// SUITE 1: UPGRADE #4 — < 500ms INSTANT TRIAL PRISM COLD OPEN + SUMMONS CHOOSER
// ============================================================================
async function runInstantTrialPrismAudit(baseUrl) {
  console.log('\n=== SUITE 1: UPGRADE #4 — INSTANT TRIAL PRISM COLD OPEN (< 500ms) ===');
  const vp = ALL_MORPH_VIEWPORTS[1]; // 390x844
  const browser = await launchAuditedBrowser(vp);
  try {
    await browser.navigate(`${baseUrl}/?nosw=1`);
    await waitForTitleReady(browser);

    const hasInstantBtn = await browser.waitFor(
      `Boolean(document.querySelector('#ws-btn-instant-prism'))`,
      6000,
    );
    assertCheck(
      hasInstantBtn,
      'UPGRADE4_INSTANT_PRISM_BTN_VISIBLE',
      '#ws-btn-instant-prism mounted on fresh cold-boot Title screen',
      '#ws-btn-instant-prism NOT found on Title screen',
    );

    // Measure exact mount latency from click -> live 3D Prism gameplay UI
    const clickPt = await browser.evalJs(`(() => {
      const el = document.querySelector('#ws-btn-instant-prism');
      const r = el.getBoundingClientRect();
      window.__rtInstantClickStart = performance.now();
      window.__rtInstantClickHandlerFiredAt = 0;
      window.__rtInstantPromptMutatedAt = 0;
      el.addEventListener('click', () => {
        window.__rtInstantClickHandlerFiredAt = performance.now();
      }, { capture: true, once: true });
      const mo = new MutationObserver(() => {
        if (document.querySelector('.ws-question-prompt')) {
          window.__rtInstantPromptMutatedAt = performance.now();
          mo.disconnect();
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()`);

    const t0 = performance.now();
    await browser.mouseClick(clickPt.x, clickPt.y);

    const mounted = await browser.waitFor(
      `Boolean(
        document.querySelector('.ws-question-prompt') &&
        document.querySelector('#canvas-root canvas') &&
        (document.querySelector('[data-facet-idx]') ||
         document.querySelector('[data-globe-anchor-idx]') ||
         document.querySelector('[data-gauntlet]') ||
         document.querySelector('#ws-cal-slider') ||
         document.querySelector('[data-codex-subject]'))
      )`,
      15000,
      20,
    );
    const wallElapsedMs = Math.round(performance.now() - t0);
    const inPageCheck = await browser.evalJs(`({
      hasCutscene: Boolean(document.querySelector('.ws-mc-overlay, .ws-cinema-overlay, .ws-cutscene-backdrop')),
      hasRegWall: Boolean(document.querySelector('#ws-reg-name')),
      prompt: (document.querySelector('.ws-question-prompt')?.textContent || '').trim().slice(0, 90),
      modeChyron: (document.querySelector('.ws-topbar-title, .ws-chyron-title')?.textContent || '').trim(),
      inPageElapsedMs: Math.round(performance.now() - (window.__rtInstantClickStart || performance.now())),
      clickToPromptDomMs:
        window.__rtInstantClickHandlerFiredAt && window.__rtInstantPromptMutatedAt
          ? Math.round(window.__rtInstantPromptMutatedAt - window.__rtInstantClickHandlerFiredAt)
          : -1,
      startToClickHandlerMs:
        window.__rtInstantClickHandlerFiredAt && window.__rtInstantClickStart
          ? Math.round(window.__rtInstantClickHandlerFiredAt - window.__rtInstantClickStart)
          : -1,
    })`);

    results.metrics.instantPrismMountMs = wallElapsedMs;
    results.metrics.instantPrismClickToDomMs = inPageCheck.clickToPromptDomMs;
    const effectiveMountMs =
      inPageCheck.clickToPromptDomMs >= 0 ? inPageCheck.clickToPromptDomMs : wallElapsedMs;
    assertCheck(
      mounted &&
        effectiveMountMs < 500 &&
        !inPageCheck.hasCutscene &&
        !inPageCheck.hasRegWall,
      'UPGRADE4_INSTANT_PRISM_SUB_500MS_NO_WALL',
      `Instant Trial Prism mounted live 3D gameplay in ${effectiveMountMs}ms click->DOM (wall=${wallElapsedMs}ms, < 500ms, 0 cutscene, 0 reg wall): "${inPageCheck.prompt}"`,
      `Instant Trial Prism slow or blocked: mounted=${mounted}, clickToDomMs=${effectiveMountMs}, wallMs=${wallElapsedMs}, info=${JSON.stringify(inPageCheck)}`,
    );

    await sleep(750);
    await saveProof(
      browser,
      '01_instant_prism_live_390x844.png',
      `Upgrade #4 Instant Trial Prism live 3D gameplay mounted in ${effectiveMountMs}ms (390x844)`,
    );

    // Solve the Instant Trial Prism question
    await answerCurrentQuestionAndWaitReveal(browser);
    await sleep(250);

    const summonsInfo = await browser.evalJs(`(() => {
      const bar = document.querySelector('#ws-instant-prism-next-bar');
      const camp = document.querySelector('#ws-instant-go-campaign');
      const bb = document.querySelector('#ws-instant-go-baseball');
      const daily = document.querySelector('#ws-instant-go-daily');
      const W = window.innerWidth, H = window.innerHeight;
      const checkBtn = (el) => {
        if (!el) return { ok: false };
        const r = el.getBoundingClientRect();
        const inVp = r.width > 0 && r.height > 0 && r.top >= -0.5 && r.bottom <= H + 0.5 && r.left >= -0.5 && r.right <= W + 0.5;
        const overflowX = Math.max(0, Math.round(el.scrollWidth - el.clientWidth));
        return { ok: inVp && overflowX <= 2, inVp, overflowX, text: (el.textContent || '').trim(), width: Math.round(r.width) };
      };
      const c = checkBtn(camp), b = checkBtn(bb), d = checkBtn(daily);
      return {
        hasBar: Boolean(bar),
        barText: (bar?.textContent || '').replace(/\\s+/g, ' ').trim(),
        campaignOk: c.ok,
        baseballOk: b.ok,
        dailyOk: d.ok,
        buttons: { campaign: c, baseball: b, daily: d },
      };
    })()`);

    assertCheck(
      summonsInfo.hasBar && summonsInfo.campaignOk && summonsInfo.baseballOk && summonsInfo.dailyOk,
      'UPGRADE4_SUMMONS_CHOOSER_ALL_3_BUTTONS',
      `Post-Prism Summons chooser rendered cleanly with unclipped Campaign/Baseball/Daily buttons in viewport`,
      `Post-Prism Summons chooser defective or text-clipped: ${JSON.stringify(summonsInfo)}`,
    );

    await saveProof(
      browser,
      '02_instant_prism_reveal_summons_390x844.png',
      'Upgrade #4 Instant Trial Prism Reveal + Post-Prism Summons Chooser (Campaign / Baseball / Daily)',
    );

    // Test Summons Chooser #1: Baseball Briefing
    await tapOrClickSelector(browser, '#ws-instant-go-baseball');
    const bbLoaded = await browser.waitFor(
      `Boolean(document.querySelector('.ws-question-prompt') && !document.querySelector('#ws-instant-prism-next-bar'))`,
      12000,
      120,
    );
    const bbInfo = await browser.evalJs(`({
      prompt: (document.querySelector('.ws-question-prompt')?.textContent || '').trim().slice(0, 80),
      header: (document.querySelector('.ws-live-header, .ws-topbar')?.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 100),
    })`);
    assertCheck(
      bbLoaded,
      'UPGRADE4_SUMMONS_BASEBALL_LAUNCH',
      `Post-Prism Baseball Briefing launched cleanly: "${bbInfo.prompt}"`,
      `Post-Prism Baseball Briefing failed to mount: ${JSON.stringify(bbInfo)}`,
    );

    // Test Summons Chooser #2: Daily 10 (fresh reload -> instant prism -> solve -> Daily)
    await browser.navigate(`${baseUrl}/?nosw=1`);
    await waitForTitleReady(browser);
    await tapOrClickSelector(browser, '#ws-btn-instant-prism');
    await browser.waitFor(`Boolean(document.querySelector('.ws-question-prompt'))`, 5000, 60);
    await answerCurrentQuestionAndWaitReveal(browser);
    await tapOrClickSelector(browser, '#ws-instant-go-daily');
    const dailyLoaded = await browser.waitFor(
      `Boolean(document.querySelector('.ws-question-prompt') && !document.querySelector('#ws-instant-prism-next-bar'))`,
      12000,
      120,
    );
    assertCheck(
      dailyLoaded,
      'UPGRADE4_SUMMONS_DAILY_LAUNCH',
      'Post-Prism Daily 10 launched cleanly into live Daily broadcast',
      'Post-Prism Daily 10 failed to launch',
    );

    // Test Summons Chooser #3: Enter Story Campaign
    await browser.navigate(`${baseUrl}/?nosw=1`);
    await waitForTitleReady(browser);
    await tapOrClickSelector(browser, '#ws-btn-instant-prism');
    await browser.waitFor(`Boolean(document.querySelector('.ws-question-prompt'))`, 10000, 60);
    await answerCurrentQuestionAndWaitReveal(browser);
    await tapOrClickSelector(browser, '#ws-instant-go-campaign');
    const campLoaded = await browser.waitFor(
      `Boolean(
        document.querySelector('#ws-mc-next') ||
        document.querySelector('.ws-mc-overlay') ||
        document.querySelector('#ws-reg-name') ||
        document.querySelector('#challenger-name-input') ||
        document.querySelector('.ws-dialogue-box') ||
        document.querySelector('.ws-city-card')
      )`,
      10000,
      120,
    );
    assertCheck(
      campLoaded,
      'UPGRADE4_SUMMONS_CAMPAIGN_LAUNCH',
      'Post-Prism Enter Story Campaign transitioned cleanly into Story Campaign/Prologue',
      'Post-Prism Enter Story Campaign failed to transition',
    );

    const errs = [
      ...browser.consoleErrors,
      ...browser.pageExceptions,
      ...filterNonFaviconHttpErrors(browser.httpErrors).map((e) => `${e.status} ${e.url}`),
    ];
    assertCheck(
      errs.length === 0,
      'UPGRADE4_ZERO_RUNTIME_ERRORS',
      '0 console errors, 0 page exceptions, 0 HTTP 404s across Instant Prism + all 3 Summons transitions',
      `Runtime errors during Instant Prism: ${JSON.stringify(errs)}`,
    );
  } finally {
    await browser.close();
  }
}

// ============================================================================
// SUITE 2: UPGRADE #1 — ?duel= ONE-TAP DUEL LINK ROUND-TRIP & LIVE GHOST RACE
// ============================================================================
async function runDuelLinkRoundTripAudit(baseUrl, duelCodec) {
  console.log('\n=== SUITE 2: UPGRADE #1 — ?duel= ONE-TAP DUEL LINK ROUND-TRIP & LIVE GHOST RACE ===');
  const vp = ALL_MORPH_VIEWPORTS[1]; // 390x844
  let capturedDuelUrl = '';
  let capturedToken = '';
  let challengerPayload = null;
  const challengerPrompts = [];

  // --- PHASE A: Challenger plays a real Baseball Briefing match & shares 1-Tap Duel Link ---
  const challengerBrowser = await launchAuditedBrowser(vp);
  try {
    await challengerBrowser.navigate(`${baseUrl}/?nosw=1`);
    await waitForTitleReady(challengerBrowser);

    // Seed a distinct Challenger name so we can prove Challenger Name shows up on Incoming Duel card!
    await challengerBrowser.evalJs(`(() => {
      try {
        localStorage.setItem('ws_challenger_name', 'AtlasAce');
        const raw = localStorage.getItem('ws_meridian_passport_v2');
        const obj = raw ? JSON.parse(raw) : {};
        obj.challengerName = 'AtlasAce';
        obj.hasRegisteredName = true;
        localStorage.setItem('ws_meridian_passport_v2', JSON.stringify(obj));
      } catch {}
    })()`);
    await challengerBrowser.navigate(`${baseUrl}/?nosw=1`);
    await waitForTitleReady(challengerBrowser);
    await waitForBootHydrated(challengerBrowser);

    // Launch real 10-Q Baseball Briefing via Campaign Map -> Briefing tab -> quick Baseball button
    await tapOrClickSelector(challengerBrowser, '[data-title-mode="CAMPAIGN"]');
    await challengerBrowser.waitFor(`Boolean(document.querySelector('[data-hub-tab="BRIEFING"]'))`, 8000);
    await tapOrClickSelector(challengerBrowser, '[data-hub-tab="BRIEFING"]');
    await challengerBrowser.waitFor(`Boolean(document.querySelector('[data-quick-topic="sports_baseball"]'))`, 8000);
    await tapOrClickSelector(challengerBrowser, '[data-quick-topic="sports_baseball"]');

    const started = await challengerBrowser.waitFor(
      `Boolean(document.querySelector('.ws-question-prompt'))`,
      15000,
      120,
    );
    if (!started) throw new Error('Challenger Baseball Briefing did not start');

    // Play every question in the Baseball Briefing match until Match Summary appears
    for (let qIdx = 0; qIdx < 15; qIdx++) {
      const onSummary = await challengerBrowser.evalJs(
        `Boolean(document.querySelector('#ws-btn-share-duel-link') || document.querySelector('#ws-summary-leaderboard'))`,
      );
      if (onSummary) break;

      await challengerBrowser.waitFor(`Boolean(document.querySelector('.ws-question-prompt'))`, 10000, 80);
      const promptText = await challengerBrowser.evalJs(
        `(document.querySelector('.ws-question-prompt')?.textContent || '').trim()`,
      );
      challengerPrompts.push(promptText);

      await answerCurrentQuestionAndWaitReveal(challengerBrowser, {
        preferredFacet: qIdx % 4,
        preferredAnchor: qIdx % 4,
      });
      await sleep(100);
      await tapOrClickSelector(challengerBrowser, '#ws-btn-next-q');
      await sleep(220);
    }

    const summaryReady = await challengerBrowser.waitFor(
      `Boolean(document.querySelector('#ws-btn-share-duel-link'))`,
      10000,
      100,
    );
    assertCheck(
      summaryReady,
      'UPGRADE1_CHALLENGER_SHARE_BTN_RENDERED',
      `Challenger finished ${challengerPrompts.length}-Q Baseball Briefing and #ws-btn-share-duel-link rendered`,
      'Challenger Match Summary missing #ws-btn-share-duel-link',
    );

    await sleep(300);
    await saveProof(
      challengerBrowser,
      '03_challenger_baseball_summary_390x844.png',
      `Upgrade #1 Challenger ${challengerPrompts.length}-Q Baseball Summary + Share 1-Tap Duel Link`,
    );

    // Click #ws-btn-share-duel-link and capture BOTH clipboard write & data-duel-url attribute
    await tapOrClickSelector(challengerBrowser, '#ws-btn-share-duel-link');
    await sleep(250);

    const shareInfo = await challengerBrowser.evalJs(`(() => {
      const btn = document.querySelector('#ws-btn-share-duel-link');
      const lbl = document.querySelector('#ws-share-duel-label');
      return {
        attrUrl: btn?.getAttribute('data-duel-url') || '',
        labelText: (lbl?.textContent || '').trim(),
        clipboardWrites: (window.__rtClipboardWrites || []).slice(),
      };
    })()`);

    capturedDuelUrl = shareInfo.clipboardWrites[shareInfo.clipboardWrites.length - 1] || shareInfo.attrUrl;
    const parsedUrl = new URL(capturedDuelUrl);
    capturedToken = parsedUrl.searchParams.get('duel') || '';

    const isUrlSafe = /^[A-Za-z0-9_-]+$/.test(capturedToken);
    const hasForbiddenChars = /[+/=]/.test(capturedToken);
    challengerPayload = duelCodec.decodeDuelChallenge(capturedToken);

    results.metrics.duelToken = {
      length: capturedToken.length,
      urlSafe: isUrlSafe && !hasForbiddenChars,
      qCount: challengerPayload?.qids?.length ?? 0,
      qids: challengerPayload?.qids ?? [],
      challengerName: challengerPayload?.challengerName ?? '',
      totalScore: challengerPayload?.totalScore ?? 0,
      topicLabel: challengerPayload?.topicLabel ?? '',
      labelFeedback: shareInfo.labelText,
    };

    assertCheck(
      capturedToken.length > 20 &&
        capturedToken.length < 220 &&
        isUrlSafe &&
        !hasForbiddenChars &&
        Boolean(challengerPayload) &&
        challengerPayload.qids.length === challengerPrompts.length &&
        shareInfo.clipboardWrites.length > 0 &&
        shareInfo.clipboardWrites[shareInfo.clipboardWrites.length - 1] === shareInfo.attrUrl,
      'UPGRADE1_DUEL_TOKEN_COMPACT_URLSAFE_VALID',
      `Captured ?duel= token (${capturedToken.length} chars < 220, 0 +/=, ${challengerPayload?.qids.length} QIDs, label="${shareInfo.labelText}", topic="${challengerPayload?.topicLabel}", score=${challengerPayload?.totalScore})`,
      `Invalid ?duel= token or share capture: len=${capturedToken.length}, safe=${isUrlSafe}, forbidden=${hasForbiddenChars}, share=${JSON.stringify(shareInfo)}, decoded=${JSON.stringify(challengerPayload)}`,
    );

    const cErrs = [
      ...challengerBrowser.consoleErrors,
      ...challengerBrowser.pageExceptions,
      ...filterNonFaviconHttpErrors(challengerBrowser.httpErrors).map((e) => `${e.status} ${e.url}`),
    ];
    assertCheck(
      cErrs.length === 0,
      'UPGRADE1_CHALLENGER_ZERO_ERRORS',
      '0 console/page/HTTP errors during Challenger Baseball match + Share Link',
      `Challenger errors: ${JSON.stringify(cErrs)}`,
    );
  } finally {
    await challengerBrowser.close();
  }

  // --- PHASE B: Recipient opens EXACT ?duel=<token> URL in a BRAND-NEW fresh browser context ---
  const recipientBrowser = await launchAuditedBrowser(vp);
  try {
    // Open the exact captured `?duel=<token>` URL (NO ?nosw=1 needed or append nothing so URL is 100% verbatim!)
    await recipientBrowser.navigate(capturedDuelUrl);
    await waitForTitleReady(recipientBrowser);

    const bannerOk = await recipientBrowser.waitFor(
      `Boolean(document.querySelector('#ws-incoming-duel-banner') && document.querySelector('#ws-btn-accept-duel'))`,
      8000,
      100,
    );
    const bannerData = await recipientBrowser.evalJs(`(() => {
      const el = document.querySelector('#ws-incoming-duel-banner');
      return {
        exists: Boolean(el),
        text: (el?.textContent || '').replace(/\\s+/g, ' ').trim(),
        acceptText: (document.querySelector('#ws-btn-accept-duel')?.textContent || '').trim(),
      };
    })()`);

    const expectedScoreText = challengerPayload.totalScore.toLocaleString('en-US');
    const nameShown = bannerData.text.includes(challengerPayload.challengerName);
    const scoreShown = bannerData.text.includes(`${expectedScoreText} PTS`);
    const topicShown =
      !challengerPayload.topicLabel ||
      bannerData.text.toLowerCase().includes(challengerPayload.topicLabel.toLowerCase().slice(0, 8));
    const prismCountShown = bannerData.text.includes(`${challengerPayload.qids.length} Exact Prisms`);

    assertCheck(
      bannerOk && nameShown && scoreShown && topicShown && prismCountShown,
      'UPGRADE1_INCOMING_DUEL_CARD_ACCURATE',
      `Fresh browser context rendered Incoming Challenger Duel banner with name="${challengerPayload.challengerName}", score="${expectedScoreText} PTS", topic="${challengerPayload.topicLabel}", ${challengerPayload.qids.length} Exact Prisms`,
      `Incoming Duel banner mismatch: ${JSON.stringify({ bannerOk, nameShown, scoreShown, topicShown, prismCountShown, bannerData, challengerPayload })}`,
    );

    await sleep(300);
    await saveProof(
      recipientBrowser,
      '04_incoming_duel_banner_390x844.png',
      `Upgrade #1 Incoming Challenger Duel Banner in fresh context (${challengerPayload.challengerName} · ${expectedScoreText} PTS)`,
    );

    // Click ACCEPT DUEL ▶
    await tapOrClickSelector(recipientBrowser, '#ws-btn-accept-duel');
    const duelStarted = await recipientBrowser.waitFor(
      `Boolean(document.querySelector('.ws-question-prompt') && document.querySelector('#ws-duel-live-split-bar'))`,
      15000,
      120,
    );
    assertCheck(
      duelStarted,
      'UPGRADE1_ACCEPT_DUEL_LAUNCHED',
      'ACCEPT DUEL ▶ hydrated exact Prisms and mounted live .ws-duel-live-split-bar',
      'ACCEPT DUEL ▶ failed to launch Duel gameplay or missing .ws-duel-live-split-bar',
    );

    // Play every single question, verifying exact prompt parity & live `.ws-duel-live-split-bar` updates!
    const recipientPrompts = [];
    const splitBarHistory = [];
    let splitBarVisibleAllQs = true;
    let splitBarUpdatedCount = 0;

    let capturedSplitBarShot = false;

    for (let qIdx = 0; qIdx < challengerPayload.qids.length; qIdx++) {
      await recipientBrowser.waitFor(
        `Boolean(document.querySelector('.ws-question-prompt') && document.querySelector('#ws-duel-live-split-bar'))`,
        10000,
        80,
      );

      const pre = await recipientBrowser.evalJs(`(() => {
        const bar = document.querySelector('#ws-duel-live-split-bar');
        const r = bar ? bar.getBoundingClientRect() : null;
        return {
          prompt: (document.querySelector('.ws-question-prompt')?.textContent || '').trim(),
          visible: Boolean(r && r.width > 0 && r.height > 0 && r.top >= -0.5 && r.bottom <= window.innerHeight + 0.5),
          you: (document.querySelector('#ws-duel-split-you')?.textContent || '').trim(),
          delta: (document.querySelector('#ws-duel-split-delta')?.textContent || '').trim(),
          rival: (document.querySelector('#ws-duel-split-rival')?.textContent || '').trim(),
          fill: document.querySelector('#ws-duel-split-fill')?.style?.width || '',
        };
      })()`);

      recipientPrompts.push(pre.prompt);
      if (!pre.visible) splitBarVisibleAllQs = false;

      // Intentionally choose different facet index than challenger so live split deltas vary!
      await answerCurrentQuestionAndWaitReveal(recipientBrowser, {
        preferredFacet: (qIdx + 1) % 4,
        preferredAnchor: (qIdx + 1) % 4,
      });
      await sleep(140);

      const post = await recipientBrowser.evalJs(`(() => {
        const bar = document.querySelector('#ws-duel-live-split-bar');
        const r = bar ? bar.getBoundingClientRect() : null;
        return {
          visible: Boolean(r && r.width > 0 && r.height > 0),
          you: (document.querySelector('#ws-duel-split-you')?.textContent || '').trim(),
          delta: (document.querySelector('#ws-duel-split-delta')?.textContent || '').trim(),
          rival: (document.querySelector('#ws-duel-split-rival')?.textContent || '').trim(),
          fill: document.querySelector('#ws-duel-split-fill')?.style?.width || '',
        };
      })()`);

      if (!post.visible) splitBarVisibleAllQs = false;
      const changed =
        post.you !== pre.you ||
        post.delta !== pre.delta ||
        post.rival !== pre.rival ||
        post.fill !== pre.fill;
      if (changed) splitBarUpdatedCount++;
      splitBarHistory.push({ qIdx, pre, post, changed });

      if (!capturedSplitBarShot && (changed || qIdx === challengerPayload.qids.length - 1)) {
        capturedSplitBarShot = true;
        await sleep(220);
        await saveProof(
          recipientBrowser,
          '05_duel_live_split_bar_390x844.png',
          `Upgrade #1 Live Ghost Race .ws-duel-live-split-bar on Q${qIdx + 1} (${post.you} | ${post.delta} | ${post.rival})`,
        );
      }

      await tapOrClickSelector(recipientBrowser, '#ws-btn-next-q');
      await sleep(220);
    }

    // Verify 100% identical prompt order between Challenger & Recipient
    let matchingPromptCount = 0;
    const promptMismatches = [];
    for (let i = 0; i < challengerPrompts.length; i++) {
      if (recipientPrompts[i] === challengerPrompts[i]) {
        matchingPromptCount++;
      } else {
        promptMismatches.push({ i, challenger: challengerPrompts[i], recipient: recipientPrompts[i] });
      }
    }

    // Wait for final Head-to-Head Split Verdict + Global Contender Leaderboard
    const verdictReady = await recipientBrowser.waitFor(
      `Boolean(document.querySelector('#ws-duel-verdict-card') && document.querySelector('#ws-summary-leaderboard'))`,
      10000,
      100,
    );

    const summaryData = await recipientBrowser.evalJs(`(() => {
      const verdict = document.querySelector('#ws-duel-verdict-card');
      const lb = document.querySelector('#ws-summary-leaderboard');
      const shareBtn = document.querySelector('#ws-btn-share-duel-link');
      const rivalsRaw = localStorage.getItem('ws_duel_rivals_v2');
      return {
        hasVerdict: Boolean(verdict),
        verdictText: (verdict?.textContent || '').replace(/\\s+/g, ' ').trim(),
        hasLeaderboard: Boolean(lb),
        lbText: (lb?.textContent || '').replace(/\\s+/g, ' ').trim(),
        lbRowCountCompact: document.querySelectorAll('.ws-leaderboard-row').length,
        rematchUrl: shareBtn?.getAttribute('data-duel-url') || '',
        rematchLabel: (document.querySelector('#ws-share-duel-label')?.textContent || '').trim(),
        rivalsPersisted: Boolean(rivalsRaw && rivalsRaw.length > 20),
      };
    })()`);

    // Decode Rematch URL to verify 100% EXACT QID array parity!
    const rematchPayload = summaryData.rematchUrl
      ? duelCodec.decodeDuelChallenge(summaryData.rematchUrl)
      : null;
    const qidsExactMatch =
      Boolean(rematchPayload) &&
      JSON.stringify(rematchPayload.qids) === JSON.stringify(challengerPayload.qids);

    assertCheck(
      qidsExactMatch && matchingPromptCount === challengerPrompts.length,
      'UPGRADE1_100PCT_IDENTICAL_QIDS_AND_ORDER',
      `100% identical QIDs (${challengerPayload.qids.length}/${challengerPayload.qids.length}) & exact prompt order (${matchingPromptCount}/${challengerPrompts.length}) between Challenger & Recipient`,
      `QID/prompt parity failure: qidsExactMatch=${qidsExactMatch}, prompts=${matchingPromptCount}/${challengerPrompts.length}, mismatches=${JSON.stringify(promptMismatches.slice(0, 3))}`,
    );

    // Check split bar updated live across the match
    // Note: if BOTH player and challenger got 0 on a particular Q, cumulative numbers stay identical on that Q;
    // verify split bar was visible on 100% of Qs AND updated whenever either side scored!
    const expectedScoringQs = challengerPayload.splits.filter((s) => s.pointsDiv10 > 0).length;
    assertCheck(
      splitBarVisibleAllQs && (splitBarUpdatedCount > 0 || expectedScoringQs === 0),
      'UPGRADE1_LIVE_SPLIT_BAR_UPDATES',
      `.ws-duel-live-split-bar visible on 100% (${challengerPayload.qids.length}/${challengerPayload.qids.length}) Qs and updated live on ${splitBarUpdatedCount} Qs`,
      `.ws-duel-live-split-bar failure: visibleAll=${splitBarVisibleAllQs}, updated=${splitBarUpdatedCount}`,
    );

    // Capture crisp full-window screenshot showing Head-to-Head Split Verdict + Global Contender Leaderboard + Rematch Link
    await sleep(300);
    await saveProof(
      recipientBrowser,
      '06_duel_verdict_and_leaderboard_390x844.png',
      'Upgrade #1 Final Head-to-Head Split Verdict + Global Contender Leaderboard + Rematch Link',
    );

    // Click Show Top 20 toggle on Global Contender Leaderboard (wait past any transient top toast or click via DOM center)
    await recipientBrowser.evalJs(`document.querySelector('#ws-leaderboard-toggle')?.scrollIntoView({ block: 'center', behavior: 'instant' })`);
    await sleep(150);
    await recipientBrowser.evalJs(`document.querySelector('#ws-leaderboard-toggle')?.click()`);
    await sleep(180);
    const expandedRows = await recipientBrowser.evalJs(
      `document.querySelectorAll('.ws-leaderboard-row').length`,
    );

    assertCheck(
      verdictReady &&
        summaryData.hasVerdict &&
        summaryData.verdictText.includes('Splits Won') &&
        summaryData.verdictText.includes('Q1') &&
        summaryData.hasLeaderboard &&
        summaryData.lbText.includes('GLOBAL CONTENDERS') &&
        summaryData.lbText.includes('YOUR RANK #') &&
        expandedRows >= 15 &&
        summaryData.rivalsPersisted,
      'UPGRADE1_FINAL_VERDICT_AND_LEADERBOARD',
      `Head-to-Head Split Verdict + Global Contender Leaderboard rendered cleanly (${summaryData.lbRowCountCompact} compact -> ${expandedRows} expanded rows, ws_duel_rivals_v2 persisted)`,
      `Verdict/Leaderboard defect: ${JSON.stringify({ verdictReady, expandedRows, summaryData })}`,
    );

    const rErrs = [
      ...recipientBrowser.consoleErrors,
      ...recipientBrowser.pageExceptions,
      ...filterNonFaviconHttpErrors(recipientBrowser.httpErrors).map((e) => `${e.status} ${e.url}`),
    ];
    assertCheck(
      rErrs.length === 0,
      'UPGRADE1_RECIPIENT_ZERO_ERRORS',
      '0 console errors, 0 page exceptions, 0 HTTP 404s across entire ?duel= round-trip',
      `Recipient errors: ${JSON.stringify(rErrs)}`,
    );
  } finally {
    await recipientBrowser.close();
  }
}

// ============================================================================
// SUITE 3: UPGRADE #2 — GLOBE_PIN_DROP 6TH 3D MORPH & VISUAL SAPPHIRE BLUEPRINTS
// Across 360×640, 390×844, 844×390, and 1280×800
// ============================================================================
async function runGlobeAndVisualMorphsAudit(baseUrl) {
  console.log('\n=== SUITE 3: UPGRADE #2 — GLOBE_PIN_DROP & VISUAL SAPPHIRE BLUEPRINTS (4 VIEWPORTS) ===');
  results.metrics.morphViewports = {};

  for (const vp of MORPH_VIEWPORTS) {
    console.log(`\n  --- Viewport ${vp.id} (${vp.label}) ---`);
    const browser = await launchAuditedBrowser(vp);
    const vpReport = { globe: {}, visual: {} };
    results.metrics.morphViewports[vp.id] = vpReport;

    try {
      // ------------------------------------------------------------------
      // PART 3A: GLOBE_PIN_DROP 6th 3D Morph
      // ------------------------------------------------------------------
      await browser.navigate(`${baseUrl}/?nosw=1`);
      await waitForTitleReady(browser);
      await waitForBootHydrated(browser);

      await tapOrClickSelector(browser, '[data-title-mode="CAMPAIGN"]', { mobile: vp.mobile });
      await browser.waitFor(`Boolean(document.querySelector('[data-hub-tab="BRIEFING"]'))`, 8000);
      await tapOrClickSelector(browser, '[data-hub-tab="BRIEFING"]', { mobile: vp.mobile });
      await browser.waitFor(`Boolean(document.querySelector('#ws-quick-globe-showcase'))`, 8000);
      await tapOrClickSelector(browser, '#ws-quick-globe-showcase', { mobile: vp.mobile });

      const globeMounted = await browser.waitFor(
        `Boolean(document.querySelector('#ws-globe-pin-controls') && document.querySelectorAll('.ws-globe-anchor-btn').length === 4)`,
        15000,
        120,
      );
      if (!globeMounted) {
        recordFail(`UPGRADE2_GLOBE_MOUNT_${vp.id}`, `GLOBE_PIN_DROP did not mount on ${vp.id}`);
        continue;
      }

      // Give 3D globe transition & camera lerp time to settle cleanly
      await sleep(900);

      const initialGlobe = await browser.evalJs(`({
        coordVal: (document.querySelector('#ws-globe-coord-val')?.textContent || '').trim(),
        coordStatus: (document.querySelector('#ws-globe-coord-status')?.textContent || '').trim(),
        overclockDisabled: Boolean(document.querySelector('#ws-btn-overclock')?.disabled),
      })`);

      // Compute viewport-specific 3D Globe center inside #canvas-root
      const globeCenter = vp.isPortrait
        ? { x: Math.round(vp.width * 0.5), y: Math.round(vp.height * 0.28) }
        : vp.width <= 900
          ? { x: Math.round(vp.width * 0.34), y: Math.round(vp.height * 0.50) }
          : { x: Math.round(vp.width * 0.50), y: Math.round(vp.height * 0.36) };

      const probeHit = await browser.evalJs(`(() => {
        const el = document.elementFromPoint(${globeCenter.x}, ${globeCenter.y});
        return el ? { tag: el.tagName, id: el.id || '', cls: String(el.className || '').slice(0, 40) } : null;
      })()`);

      // Test 1: Orbit drag (> 30px) MUST NOT drop a pin accidentally
      if (vp.mobile) {
        await browser.touchDrag(
          globeCenter.x - 22,
          globeCenter.y,
          globeCenter.x + 26,
          globeCenter.y - 6,
          8,
          20,
        );
      } else {
        await browser.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: globeCenter.x - 24, y: globeCenter.y });
        await browser.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: globeCenter.x - 24, y: globeCenter.y, button: 'left', clickCount: 1 });
        for (let s = 1; s <= 6; s++) {
          await sleep(18);
          await browser.send('Input.dispatchMouseEvent', {
            type: 'mouseMoved',
            x: globeCenter.x - 24 + s * 9,
            y: globeCenter.y,
            button: 'left',
          });
        }
        await browser.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: globeCenter.x + 30, y: globeCenter.y, button: 'left', clickCount: 1 });
      }
      await sleep(180);
      const afterDragCoord = await browser.evalJs(
        `(document.querySelector('#ws-globe-coord-val')?.textContent || '').trim()`,
      );

      // Test 2: Direct 3D canvas tap on #canvas-root -> candidate pin + coordinates update + armed!
      // Try globe center (and slight offsets if needed in case sphere projection shifted slightly)
      const tapOffsets = [
        [0, 0],
        [0, -18],
        [0, 18],
        [-22, 0],
        [22, 0],
      ];
      let canvasTapResult = null;
      for (const [dx, dy] of tapOffsets) {
        const tx = globeCenter.x + dx;
        const ty = globeCenter.y + dy;
        if (vp.mobile) {
          await browser.touchTap(tx, ty);
        } else {
          await browser.mouseClick(tx, ty);
        }
        await sleep(220);
        const cur = await browser.evalJs(`({
          coordVal: (document.querySelector('#ws-globe-coord-val')?.textContent || '').trim(),
          coordStatus: (document.querySelector('#ws-globe-coord-status')?.textContent || '').trim(),
          overclockDisabled: Boolean(document.querySelector('#ws-btn-overclock')?.disabled),
        })`);
        if (/\d+\.\d+°[NS],\s*\d+\.\d+°[EW]/.test(cur.coordVal)) {
          canvasTapResult = { ...cur, tx, ty };
          break;
        }
      }

      vpReport.globe.initial = initialGlobe;
      vpReport.globe.probeHit = probeHit;
      vpReport.globe.afterDragCoord = afterDragCoord;
      vpReport.globe.canvasTap = canvasTapResult;

      assertCheck(
        probeHit?.tag === 'CANVAS' &&
          afterDragCoord === initialGlobe.coordVal &&
          Boolean(canvasTapResult) &&
          !canvasTapResult.overclockDisabled,
        `UPGRADE2_GLOBE_3D_CANVAS_TAP_${vp.id}`,
        `${vp.id}: Direct 3D #canvas-root tap at (${canvasTapResult?.tx},${canvasTapResult?.ty}) dropped pin -> "${canvasTapResult?.coordVal}" (drag kept "${afterDragCoord}", Lock armed)`,
        `${vp.id}: 3D canvas tap failed! probe=${JSON.stringify(probeHit)}, afterDrag="${afterDragCoord}", canvasTap=${JSON.stringify(canvasTapResult)}`,
      );

      if (vp.id === '390x844' || vp.id === '1280x800') {
        await saveProof(
          browser,
          `07_globe_canvas_pin_${vp.id}.png`,
          `Upgrade #2 GLOBE_PIN_DROP direct 3D canvas tap candidate pin (${vp.id}: ${canvasTapResult?.coordVal})`,
        );
      }

      // Test 3: 2D `.ws-globe-anchor-btn` quick-anchor tap -> verify selection + geometry -> Peel -> Lock -> Geodesic Reveal + Haversine km score
      const anchorMeta = await browser.evalJs(`(() => {
        const b = document.querySelector('[data-globe-anchor-idx="0"]');
        return b ? {
          label: b.dataset.globeLabel || '',
          lat: Number(b.dataset.globeLat),
          lon: Number(b.dataset.globeLon),
        } : null;
      })()`);

      await tapOrClickSelector(browser, '[data-globe-anchor-idx="0"]', { mobile: vp.mobile });
      await sleep(300);

      const afterAnchor = await browser.evalJs(`({
        coordVal: (document.querySelector('#ws-globe-coord-val')?.textContent || '').trim(),
        coordStatus: (document.querySelector('#ws-globe-coord-status')?.textContent || '').trim(),
        anchorSelected: Boolean(document.querySelector('[data-globe-anchor-idx="0"]')?.classList.contains('is-selected')),
        overclockDisabled: Boolean(document.querySelector('#ws-btn-overclock')?.disabled),
      })`);

      assertCheck(
        afterAnchor.anchorSelected &&
          !afterAnchor.overclockDisabled &&
          afterAnchor.coordStatus.includes(anchorMeta.label) &&
          /\d+\.\d+°[NS],\s*\d+\.\d+°[EW]/.test(afterAnchor.coordVal),
        `UPGRADE2_GLOBE_2D_ANCHOR_TAP_${vp.id}`,
        `${vp.id}: 2D .ws-globe-anchor-btn "${anchorMeta.label}" armed "${afterAnchor.coordVal}" + rotated 3D Globe`,
        `${vp.id}: 2D quick-anchor tap failed: ${JSON.stringify({ anchorMeta, afterAnchor })}`,
      );

      // Verify GLOBE_PIN_DROP anchor pills geometry (0 clipped / 0 covered)
      const globeGeom = await browser.evalJs(`(${MEASURE_GAMEPLAY_GEOMETRY_FN.toString()})("GLOBE_LIVE_${vp.id}")`);
      const badGlobeAnchors = globeGeom.globeAnchors.filter(
        (a) => !a.visible || !a.inViewport || a.clips.length > 0 || a.maxOverlapPx > 0 || !a.hitSelf,
      );
      assertCheck(
        globeGeom.globeAnchors.length === 4 &&
          badGlobeAnchors.length === 0 &&
          globeGeom.horizontalOverflowPx === 0,
        `UPGRADE2_GLOBE_LAYOUT_ZERO_OVERLAP_${vp.id}`,
        `${vp.id}: 4/4 .ws-globe-anchor-btn pills in viewport, 0 clips, 0px overlap, 0px horizontal overflow`,
        `${vp.id}: GLOBE_PIN_DROP layout defect: badAnchors=${JSON.stringify(badGlobeAnchors)}, hOverflow=${globeGeom.horizontalOverflowPx}`,
      );

      // Lock via #ws-btn-overclock and verify 3D Geodesic Reveal + Haversine km score
      await tapOrClickSelector(browser, '#ws-btn-overclock', { mobile: vp.mobile });
      const revealedGlobe = await browser.waitFor(`Boolean(document.querySelector('#ws-btn-next-q'))`, 8000, 100);
      await sleep(650); // let 3D geodesic arc animate cleanly for screenshot!

      const revealGlobeData = await browser.evalJs(`({
        coordStatus: (document.querySelector('#ws-globe-coord-status')?.textContent || '').trim(),
        coordVal: (document.querySelector('#ws-globe-coord-val')?.textContent || '').trim(),
        intelFlash: (document.querySelector('.ws-intel-flash')?.textContent || '').replace(/\\s+/g, ' ').trim(),
        shaderErrors: (window.__rtStats?.shaderErrors || []).slice(),
        programErrors: (window.__rtStats?.programErrors || []).slice(),
      })`);

      vpReport.globe.reveal = revealGlobeData;
      const hasHaversineKm =
        /DISTANCE:\s*[\d,]+\s*KM/i.test(revealGlobeData.coordStatus) ||
        /\d[\d,]*\s*km/i.test(revealGlobeData.intelFlash);
      const hasTargetCoords = /TARGET\s+\d+\.\d+°[NS],\s*\d+\.\d+°[EW]/i.test(revealGlobeData.coordVal);

      assertCheck(
        revealedGlobe &&
          hasHaversineKm &&
          hasTargetCoords &&
          revealGlobeData.shaderErrors.length === 0 &&
          revealGlobeData.programErrors.length === 0,
        `UPGRADE2_GLOBE_GEODESIC_REVEAL_KM_${vp.id}`,
        `${vp.id}: 3D Geodesic Reveal + Haversine score verified ("${revealGlobeData.coordStatus}", "${revealGlobeData.coordVal}", 0 shader errors)`,
        `${vp.id}: Globe Reveal missing km/target or shader errors: ${JSON.stringify(revealGlobeData)}`,
      );

      await saveProof(
        browser,
        `08_globe_reveal_geodesic_${vp.id}.png`,
        `Upgrade #2 GLOBE_PIN_DROP 3D Geodesic Reveal + Haversine km (${vp.id}: ${revealGlobeData.coordStatus})`,
      );

      // ------------------------------------------------------------------
      // PART 3B: Visual Sapphire Blueprint (`visualPlate`) Question
      // ------------------------------------------------------------------
      await browser.navigate(`${baseUrl}/?nosw=1`);
      await waitForTitleReady(browser);
      await waitForBootHydrated(browser);

      await tapOrClickSelector(browser, '[data-title-mode="CAMPAIGN"]', { mobile: vp.mobile });
      await browser.waitFor(`Boolean(document.querySelector('[data-hub-tab="BRIEFING"]'))`, 8000);
      await tapOrClickSelector(browser, '[data-hub-tab="BRIEFING"]', { mobile: vp.mobile });
      await browser.waitFor(`Boolean(document.querySelector('#ws-quick-visual-showcase'))`, 8000);
      await tapOrClickSelector(browser, '#ws-quick-visual-showcase', { mobile: vp.mobile });

      const visualMounted = await browser.waitFor(
        `Boolean(
          document.querySelector('#ws-visual-plate-frame') &&
          document.querySelector('.ws-visual-plate-img')?.complete &&
          document.querySelectorAll('[data-facet-idx]').length === 4
        )`,
        15000,
        120,
      );
      if (!visualMounted) {
        const vDbg = await browser.evalJs(`({
          hasFrame: Boolean(document.querySelector('#ws-visual-plate-frame')),
          imgSrc: document.querySelector('.ws-visual-plate-img')?.getAttribute('src') || null,
          imgComplete: document.querySelector('.ws-visual-plate-img')?.complete ?? null,
          facets: document.querySelectorAll('[data-facet-idx]').length,
          prompt: (document.querySelector('.ws-question-prompt')?.textContent || '').slice(0, 90),
          hasQuickVisBtn: Boolean(document.querySelector('#ws-quick-visual-showcase')),
          bodySnippet: document.body.innerText.replace(/\\s+/g, ' ').slice(0, 200),
        })`);
        recordFail(
          `UPGRADE2_VISUAL_MOUNT_${vp.id}`,
          `Visual Sapphire Blueprint did not mount on ${vp.id}: ${JSON.stringify(vDbg)}`,
        );
        continue;
      }
      await sleep(550); // allow 3D hologram medallion texture load too!

      const visualLiveGeom = await browser.evalJs(
        `(${MEASURE_GAMEPLAY_GEOMETRY_FN.toString()})("VISUAL_LIVE_${vp.id}")`,
      );
      vpReport.visual.liveGeom = visualLiveGeom;

      const svgImgOk =
        Boolean(visualLiveGeom.visualPlateImg) &&
        visualLiveGeom.visualPlateImg.src.includes('./assets/visuals/') &&
        visualLiveGeom.visualPlateImg.src.endsWith('.svg') &&
        visualLiveGeom.visualPlateImg.complete &&
        visualLiveGeom.visualPlateImg.naturalWidth > 0;

      const badVisualFacets = visualLiveGeom.facets.filter(
        (f) => !f.visible || !f.inViewport || !f.heightOk || f.clips.length > 0 || f.maxOverlapPx > 0 || !f.hitSelf,
      );

      const svg404s = browser.httpErrors.filter(
        (e) => String(e.url || '').includes('/assets/visuals/') && e.status >= 400,
      );

      assertCheck(
        svgImgOk && svg404s.length === 0,
        `UPGRADE2_VISUAL_SVG_LOADED_ZERO_404_${vp.id}`,
        `${vp.id}: Visual Sapphire Blueprint loaded "${visualLiveGeom.visualPlateImg?.src}" (${visualLiveGeom.visualPlateImg?.naturalWidth}×${visualLiveGeom.visualPlateImg?.naturalHeight}, 0 SVG 404s)`,
        `${vp.id}: Visual Blueprint SVG load failed or 404: img=${JSON.stringify(visualLiveGeom.visualPlateImg)}, 404s=${JSON.stringify(svg404s)}`,
      );

      assertCheck(
        visualLiveGeom.facets.length === 4 &&
          badVisualFacets.length === 0 &&
          visualLiveGeom.horizontalOverflowPx === 0,
        `UPGRADE2_VISUAL_AD_ZERO_CLIP_OVERLAP_${vp.id}`,
        `${vp.id}: 0/4 clipped/covered A–D answers (0px overlap with .ws-visual-plate-frame & actions, all 4 hit-tested, 0px overflow)`,
        `${vp.id}: A–D facet clip/overlap with .ws-visual-plate-frame! badFacets=${JSON.stringify(badVisualFacets)}, plate=${JSON.stringify(visualLiveGeom.controls.visualPlate)}, hOverflow=${visualLiveGeom.horizontalOverflowPx}`,
      );

      await saveProof(
        browser,
        `09_visual_blueprint_live_${vp.id}.png`,
        `Upgrade #2 Visual Sapphire Blueprint (${vp.id}: 0/4 covered A-D, ${visualLiveGeom.visualPlateImg?.src})`,
      );

      // Adversarial extra torture check on tiny 360×640: open Peel Tier 2 clue drawer WITH visual plate!
      if (vp.id === '360x640') {
        await tapOrClickSelector(browser, '#ws-btn-peel', { mobile: true });
        await sleep(250);
        const peelGeom = await browser.evalJs(
          `(${MEASURE_GAMEPLAY_GEOMETRY_FN.toString()})("VISUAL_PEEL_360x640")`,
        );
        const badPeelFacets = peelGeom.facets.filter(
          (f) => !f.visible || !f.inViewport || !f.heightOk || f.clips.length > 0 || f.maxOverlapPx > 0 || !f.hitSelf,
        );
        vpReport.visual.peel360Geom = peelGeom;
        assertCheck(
          peelGeom.facets.length === 4 && badPeelFacets.length === 0,
          'UPGRADE2_VISUAL_360x640_PEEL_T2_ZERO_OVERLAP',
          '360x640 Peel Tier 2 + .ws-visual-plate-frame STILL holds 0/4 clipped/covered A–D answers!',
          `360x640 Peel Tier 2 + Visual Plate caused facet clip/overlap: ${JSON.stringify(badPeelFacets)}`,
        );
      }

      // Test tap-to-zoom lightbox on #ws-visual-plate-frame
      await tapOrClickSelector(browser, '#ws-visual-plate-frame', { mobile: vp.mobile });
      const lightboxOpen = await browser.waitFor(
        `Boolean(document.querySelector('.ws-visual-plate-lightbox #ws-lightbox-close'))`,
        4000,
        80,
      );
      if (lightboxOpen) {
        await sleep(150);
        await tapOrClickSelector(browser, '#ws-lightbox-close', { mobile: vp.mobile });
        await sleep(150);
      }
      const lightboxClosed = await browser.evalJs(`!document.querySelector('.ws-visual-plate-lightbox')`);
      assertCheck(
        lightboxOpen && lightboxClosed,
        `UPGRADE2_VISUAL_LIGHTBOX_ROUNDTRIP_${vp.id}`,
        `${vp.id}: Visual Blueprint tap-to-zoom lightbox opened & closed cleanly`,
        `${vp.id}: Visual Blueprint lightbox failed: open=${lightboxOpen}, closed=${lightboxClosed}`,
      );

      // Lock answer & verify Reveal geometry (0/4 covered A-D on Reveal!)
      await answerCurrentQuestionAndWaitReveal(browser, { preferredFacet: 0 });
      await sleep(250);
      const visualRevealGeom = await browser.evalJs(
        `(${MEASURE_GAMEPLAY_GEOMETRY_FN.toString()})("VISUAL_REVEAL_${vp.id}")`,
      );
      vpReport.visual.revealGeom = visualRevealGeom;
      const badRevealFacets = visualRevealGeom.facets.filter(
        (f) => !f.visible || !f.inViewport || f.clips.length > 0 || f.maxOverlapPx > 0,
      );
      assertCheck(
        visualRevealGeom.facets.length === 4 && badRevealFacets.length === 0,
        `UPGRADE2_VISUAL_REVEAL_ZERO_OVERLAP_${vp.id}`,
        `${vp.id}: Visual Blueprint Reveal holds 0/4 clipped/covered A–D facets (0px overlap)`,
        `${vp.id}: Visual Blueprint Reveal clip/overlap: ${JSON.stringify(badRevealFacets)}`,
      );

      if (vp.id === '360x640' || vp.id === '1280x800') {
        await saveProof(
          browser,
          `10_visual_blueprint_reveal_${vp.id}.png`,
          `Upgrade #2 Visual Sapphire Blueprint Reveal (${vp.id}: 0/4 covered A-D)`,
        );
      }

      const vpErrs = [
        ...browser.consoleErrors,
        ...browser.pageExceptions,
        ...filterNonFaviconHttpErrors(browser.httpErrors).map((e) => `${e.status} ${e.url}`),
      ];
      assertCheck(
        vpErrs.length === 0,
        `UPGRADE2_ZERO_RUNTIME_ERRORS_${vp.id}`,
        `${vp.id}: 0 console errors, 0 page exceptions, 0 HTTP 404s across GLOBE_PIN_DROP + Visual Blueprints`,
        `${vp.id}: Runtime errors: ${JSON.stringify(vpErrs)}`,
      );
    } finally {
      await browser.close();
    }
  }
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================
async function main() {
  console.log('============================================================================');
  console.log("WORLD'S SMARTEST v2.0 — RT-V2-DUEL-MORPH-QA (UPGRADES #1, #2 & #4)");
  console.log(`Serving dist/ from ephemeral 127.0.0.1:0 (suite=${SUITE})`);
  console.log('============================================================================');

  const srv = await startDistServer(DIST_DIR);
  console.log(`Ephemeral dist/ server live at ${srv.baseUrl}`);

  try {
    const duelCodec = await loadDuelCodec();

    if (SUITE === 'all' || SUITE === 'bundle') {
      await runBundleAndAssetAudit(srv.baseUrl);
    }
    if (SUITE === 'all' || SUITE === 'instant') {
      await runInstantTrialPrismAudit(srv.baseUrl);
    }
    if (SUITE === 'all' || SUITE === 'duel') {
      await runDuelLinkRoundTripAudit(srv.baseUrl, duelCodec);
    }
    if (SUITE === 'all' || SUITE === 'morphs') {
      await runGlobeAndVisualMorphsAudit(srv.baseUrl);
    }
  } finally {
    await srv.close();
  }

  const reportPath = path.join(SCREENSHOT_DIR, 'audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log('\n============================================================================');
  console.log(
    `FINAL SUMMARY: ${results.passed.length} PASSED · ${results.failed.length} FAILED · ${results.screenshots.length} SCREENSHOTS`,
  );
  console.log(`Report saved: ${reportPath}`);
  console.log('============================================================================');

  if (results.failed.length > 0) {
    console.error('\nFAILURES:');
    for (const f of results.failed) {
      console.error(`  - ${f.id}: ${f.detail}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('FATAL AUDIT ERROR:', err);
  process.exit(1);
});
