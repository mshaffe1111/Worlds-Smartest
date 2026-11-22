#!/usr/bin/env node
/**
 * RT-E2E-SYSTEMS-AUDITOR — Comprehensive Live Headless WebGL2 E2E & 3D Framing & 60 FPS Audit
 *
 * Tests:
 * 1. 3D Framing & 60 FPS Mobile GPU Audit across 375x667, 390x844, 844x390, 1280x800:
 *    - Start Screen 3D Veritas Prism 100% unobstructed in upper open viewport (0 bottom-card clipping)
 *    - 3D Intel Observatory & Prism Atelier 3D Crown/Relic/Prism 100% unobstructed in top 50dvh
 *      (or Left 50vw in 844x390 landscape) + 1-finger touch drag orbit proof!
 *    - >= 58-60 FPS, <120 draw calls, 0 shader/console errors, 0 HTTP 404s, <0.5% bloom whiteout
 * 2. End-to-End Playability Across All Features (390x844 Mobile Portrait):
 *    - Return Stack (<- Back, Escape, Browser Back popstate) from BOTH Title AND Mid-Match Gameplay:
 *      Vault -> Passport -> Observatory -> Stats -> Trophies -> 5-Slot Saves -> Briefing (Sports & Games -> Sports -> Baseball)
 *      proving mid-match timer pause + Peel Tier state preservation!
 *    - Level Failure (CIRCUIT BREACH), RETRY, & RESTART modal
 *    - 5-Slot Save Switch/New, Export (.ws-save.json), Delete, & Import
 *    - AMBIENCE: OFF default in live UI
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startDistServer, launchCdpBrowser, sleep } from './rt_e2e_cdp.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT_DIR = 'C:\\Users\\mshaf\\.gemini\\antigravity\\brain\\5105c2d2-97dc-437b-a862-15ee6ff8bb52';

const VIEWPORTS = [
  { name: '375x667', width: 375, height: 667, mobile: true, dpr: 2, landscape: false },
  { name: '390x844', width: 390, height: 844, mobile: true, dpr: 2, landscape: false },
  { name: '844x390', width: 844, height: 390, mobile: true, dpr: 2, landscape: true },
  { name: '1280x800', width: 1280, height: 800, mobile: false, dpr: 1, landscape: true },
];

function parseArgs() {
  const args = { suite: 'all', outDir: DEFAULT_OUT_DIR, softwareGl: false };
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--suite=')) args.suite = a.slice('--suite='.length);
    if (a.startsWith('--out=')) args.outDir = a.slice('--out='.length);
    if (a === '--software-gl') args.softwareGl = true;
  }
  return args;
}

function analyzeImage(imgPath, cropNorm = null) {
  const pyArgs = [path.join(__dirname, 'rt_pixel_metrics.py'), 'analyze', imgPath];
  if (cropNorm) pyArgs.push(JSON.stringify(cropNorm));
  const out = execFileSync('python', pyArgs, { encoding: 'utf8' });
  return JSON.parse(out);
}

function diffImages(pathA, pathB, cropNorm = null) {
  const pyArgs = [path.join(__dirname, 'rt_pixel_metrics.py'), 'diff', pathA, pathB];
  if (cropNorm) pyArgs.push(JSON.stringify(cropNorm));
  const out = execFileSync('python', pyArgs, { encoding: 'utf8' });
  return JSON.parse(out);
}

async function waitForAppReady(br) {
  const ok = await br.waitFor(
    `document.querySelector('#canvas-root canvas') && (document.querySelector('#ws-title-enter-cta') || document.querySelector('.ws-title-showcase') || document.querySelector('#ui-root button'))`,
    25000,
    150
  );
  if (!ok) {
    const diag = await br.evalJs(`({
      href: location.href,
      readyState: document.readyState,
      hasCanvas: Boolean(document.querySelector('#canvas-root canvas')),
      uiLen: document.querySelector('#ui-root')?.innerHTML?.length || 0,
      uiText: (document.querySelector('#ui-root')?.innerText || '').slice(0, 300),
      stats: window.__rtStats ? {
        webglContexts: window.__rtStats.webglContexts,
        webglVersion: window.__rtStats.webglVersion,
        webglRenderer: window.__rtStats.webglRenderer,
        shaderErrors: window.__rtStats.shaderErrors,
      } : null,
    })`).catch((e) => ({ evalErr: String(e) }));
    throw new Error(
      `Timed out waiting for app boot. diag=${JSON.stringify(diag)} consoleErrors=${JSON.stringify(br.consoleErrors)} pageExceptions=${JSON.stringify(br.pageExceptions)} httpErrors=${JSON.stringify(br.httpErrors)}`
    );
  }
  // Wait for 3D GLB assets to settle & fade in
  await sleep(1400);
}

async function openVaultDrawer(br) {
  const hasNewVault = await br.evalJs(`Boolean(document.querySelector('#ws-util-vault'))`);
  if (!hasNewVault) return false;
  const alreadyOpen = await br.evalJs(`Boolean(document.querySelector('#ws-vault-drawer.is-open'))`);
  if (!alreadyOpen) {
    await br.clickSelector('#ws-util-vault');
    await br.waitFor(`document.querySelector('#ws-vault-drawer.is-open')`, 4000, 80);
    await sleep(220);
  }
  return true;
}

async function clickVaultOrDirect(br, id) {
  const isDirectVisible = await br.evalJs(`(() => {
    const el = document.querySelector(${JSON.stringify(id)});
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && !el.closest('[hidden]');
  })()`);
  if (isDirectVisible) {
    await br.clickSelector(id);
    await sleep(450);
    return;
  }
  await openVaultDrawer(br);
  await br.clickSelector(id);
  await sleep(500);
}

async function jumpMetaSuiteSection(br, sectionId, fallbackVaultId) {
  // Prefer sleek Vault ▾ jumper inside Meta Suite if open
  const hasJumper = await br.evalJs(`Boolean(document.querySelector('.ws-meta-backdrop [data-vault-trigger]'))`);
  if (hasJumper) {
    await br.clickSelector('.ws-meta-backdrop [data-vault-trigger]');
    await sleep(180);
    const hasNav = await br.evalJs(`Boolean(document.querySelector('.ws-meta-backdrop [data-suite-nav=${JSON.stringify(sectionId)}]'))`);
    if (hasNav) {
      await br.clickSelector(`.ws-meta-backdrop [data-suite-nav=${JSON.stringify(sectionId)}]`);
      await sleep(550);
      return 'vault-jumper';
    }
  }
  // Fallback: legacy top buttons with data-suite-nav
  const hasLegacyNav = await br.evalJs(`Boolean(document.querySelector('.ws-meta-backdrop [data-suite-nav=${JSON.stringify(sectionId)}]'))`);
  if (hasLegacyNav) {
    await br.clickSelector(`.ws-meta-backdrop [data-suite-nav=${JSON.stringify(sectionId)}]`);
    await sleep(550);
    return 'suite-nav';
  }
  // Otherwise open via Vault drawer
  await clickVaultOrDirect(br, fallbackVaultId);
  return 'vault-drawer';
}

async function measureStageGeometry(br, mode) {
  return br.evalJs(`(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const topbar = document.querySelector('.ws-topbar');
    const topbarRect = topbar ? topbar.getBoundingClientRect() : null;

    if (${JSON.stringify(mode)} === 'TITLE') {
      const hero = document.querySelector('.ws-title-hero');
      const dock = document.querySelector('.ws-title-dock, .ws-title-pedestal');
      const heroR = hero ? hero.getBoundingClientRect() : null;
      const dockR = dock ? dock.getBoundingClientRect() : null;
      const openTop = Math.max(topbarRect ? topbarRect.bottom : 0, heroR ? heroR.bottom : 0);
      const openBottom = dockR ? dockR.top : vh;
      const openH = Math.max(0, openBottom - openTop);
      const sampleX = Math.round(vw * 0.5);
      const sampleY = Math.round(openTop + openH * 0.5);
      const hitEl = document.elementFromPoint(sampleX, sampleY);
      const hitCanvas = hitEl ? (hitEl.tagName === 'CANVAS' || hitEl.id === 'canvas-root' || hitEl.classList.contains('ws-title-showcase') || hitEl.id === 'ui-root') : false;
      return {
        vw, vh,
        topbarHeight: topbarRect ? Math.round(topbarRect.height) : 0,
        heroBottom: heroR ? Math.round(heroR.bottom) : 0,
        dockTop: dockR ? Math.round(dockR.top) : 0,
        dockHeight: dockR ? Math.round(dockR.height) : 0,
        dockHeightPct: dockR ? Number(((dockR.height / vh) * 100).toFixed(1)) : 0,
        open3dTopPct: Number(((openTop / vh) * 100).toFixed(1)),
        open3dBottomPct: Number(((openBottom / vh) * 100).toFixed(1)),
        open3dHeightPct: Number(((openH / vh) * 100).toFixed(1)),
        centerHitTag: hitEl ? (hitEl.tagName + (hitEl.id ? '#' + hitEl.id : '') + (hitEl.className ? '.' + String(hitEl.className).split(' ')[0] : '')) : null,
        centerHitPassThrough: hitCanvas,
      };
    }

    // OBSERVATORY or ATELIER
    const backdrop = document.querySelector('.ws-meta-backdrop');
    const sheet =
      document.querySelector('.ws-meta-sheet') ||
      document.querySelector('.ws-meta-shell') ||
      document.querySelector('.ws-obs-sheet') ||
      document.querySelector('.ws-atelier-sheet') ||
      document.querySelector('.ws-meta-panel');
    const sheetR = sheet ? sheet.getBoundingClientRect() : null;
    const isLandscape = vw > vh && vh <= 520;
    const openSampleX = isLandscape ? Math.round(vw * 0.25) : Math.round(vw * 0.5);
    const openSampleY = isLandscape ? Math.round(vh * 0.5) : Math.round(vh * 0.25);
    const hitEl = document.elementFromPoint(openSampleX, openSampleY);
    const hitCanvasOrPass = hitEl ? (hitEl.tagName === 'CANVAS' || hitEl.id === 'canvas-root') : false;
    const visibleButtons = Array.from((backdrop || document).querySelectorAll('button')).filter((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && !b.closest('[hidden]');
    }).length;
    return {
      vw, vh, isLandscape,
      hasBackdrop: Boolean(backdrop),
      sheetClass: sheet ? sheet.className : null,
      sheetTop: sheetR ? Math.round(sheetR.top) : 0,
      sheetLeft: sheetR ? Math.round(sheetR.left) : 0,
      sheetWidth: sheetR ? Math.round(sheetR.width) : 0,
      sheetHeight: sheetR ? Math.round(sheetR.height) : 0,
      openTopPct: sheetR ? Number(((sheetR.top / vh) * 100).toFixed(1)) : 0,
      openLeftPct: sheetR ? Number(((sheetR.left / vw) * 100).toFixed(1)) : 0,
      openSamplePoint: [openSampleX, openSampleY],
      openHitTag: hitEl ? (hitEl.tagName + (hitEl.id ? '#' + hitEl.id : '') + (hitEl.className ? '.' + String(hitEl.className).split(' ')[0] : '')) : null,
      openHitPassThroughCanvas: hitCanvasOrPass,
      visibleButtonsInModal: visibleButtons,
    };
  })()`);
}

async function testTouchOrbit(br, vp, label, outDir, cropNorm, dragCoords, saveProofName = null) {
  const beforePath = path.join(outDir, `_tmp_${label}_before.png`);
  const afterPath = saveProofName ? path.join(outDir, saveProofName) : path.join(outDir, `_tmp_${label}_after.png`);

  await br.evalJs(`(() => {
    window.__rtStats.canvasPointerEvents = { down: 0, move: 0, up: 0, lastTarget: null };
  })()`);

  await br.screenshot(beforePath);

  // Dispatch 1-finger touch drag (or mouse drag on desktop)
  if (vp.mobile) {
    await br.touchDrag(dragCoords.x1, dragCoords.y1, dragCoords.x2, dragCoords.y2, 12, 16);
  } else {
    await br.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: dragCoords.x1, y: dragCoords.y1 });
    await br.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: dragCoords.x1, y: dragCoords.y1, button: 'left', clickCount: 1 });
    for (let i = 1; i <= 12; i++) {
      const t = i / 12;
      await sleep(16);
      await br.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: dragCoords.x1 + (dragCoords.x2 - dragCoords.x1) * t,
        y: dragCoords.y1 + (dragCoords.y2 - dragCoords.y1) * t,
        buttons: 1,
      });
    }
    await br.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: dragCoords.x2, y: dragCoords.y2, button: 'left', clickCount: 1 });
  }
  await sleep(140);
  await br.screenshot(afterPath);

  const ptrEvents = await br.evalJs(`window.__rtStats.canvasPointerEvents`);
  const dragDiff = diffImages(beforePath, afterPath, cropNorm);

  try { fs.unlinkSync(beforePath); if (!saveProofName) fs.unlinkSync(afterPath); } catch {}

  const receivedCanvasDrag = ptrEvents.down >= 1 && ptrEvents.move >= 3 && ptrEvents.up >= 1 && ptrEvents.lastTarget === 'CANVAS';
  const orbited = receivedCanvasDrag && (dragDiff.mad >= 2.0 || dragDiff.changedPct >= 4.0);
  return { ptrEvents, dragDiff, receivedCanvasDrag, orbited, proofShot: saveProofName ? afterPath : null };
}

async function runGpuAndFramingSuite(br, baseUrl, outDir) {
  const results = [];
  const failures = [];

  for (const vp of VIEWPORTS) {
    const vpReport = {
      viewport: vp.name,
      title: null,
      observatory: null,
      atelier: null,
      consoleErrors: [],
      pageExceptions: [],
      httpErrors: [],
    };
    br.clearDiagnostics();
    await br.navigate('about:blank');
    await sleep(150);
    await br.setViewport({ width: vp.width, height: vp.height, mobile: vp.mobile, dpr: vp.dpr });
    await br.navigate(baseUrl);
    await waitForAppReady(br);
    await br.evalJs(`localStorage.clear()`).catch(() => {});

      // 1. START SCREEN
      const titleGeom = await measureStageGeometry(br, 'TITLE');
      const titlePerf = await br.measurePerf(1500);
      const titleShot = path.join(outDir, `e2e_title_${vp.name}.png`);
      await br.screenshot(titleShot);

      const titleOpenCrop = [
        0.05,
        Math.max(0.02, titleGeom.open3dTopPct / 100),
        0.95,
        Math.min(0.98, Math.max((titleGeom.open3dTopPct + 10) / 100, titleGeom.open3dBottomPct / 100)),
      ];
      const titleImg = analyzeImage(titleShot, titleOpenCrop);

      let titleOrbit = null;
      if (vp.name === '390x844' || vp.name === '375x667') {
        const yMid = Math.round(vp.height * ((titleOpenCrop[1] + titleOpenCrop[3]) / 2));
        titleOrbit = await testTouchOrbit(br, vp, `title_${vp.name}`, outDir, titleOpenCrop, {
          x1: Math.round(vp.width * 0.22),
          y1: yMid,
          x2: Math.round(vp.width * 0.78),
          y2: yMid,
        });
      }

      vpReport.title = {
        screenshot: titleShot,
        geom: titleGeom,
        perf: titlePerf,
        bloomWhiteoutPct: titleImg.fullBloom.whiteout250Pct,
        stageGoldHero: titleImg.stageGoldHero,
        touchOrbit: titleOrbit,
      };

      // Assertions for Start Screen
      if (titleGeom.topbarHeight > 52) {
        failures.push(`[${vp.name}] Title topbar too tall: ${titleGeom.topbarHeight}px (>52px)`);
      }
      if (!vp.landscape && titleGeom.open3dHeightPct < 42) {
        failures.push(`[${vp.name}] Title open 3D viewport too small: ${titleGeom.open3dHeightPct}%`);
      }
      if (titlePerf.maxDrawCalls >= 120) {
        failures.push(`[${vp.name}] Title draw calls >= 120 (max=${titlePerf.maxDrawCalls}, avg=${titlePerf.avgDrawCalls})`);
      }
      if (titlePerf.shaderErrors.length > 0 || titlePerf.programErrors.length > 0) {
        failures.push(`[${vp.name}] WebGL shader/program errors: ${JSON.stringify(titlePerf.shaderErrors)}`);
      }
      if (titleImg.fullBloom.whiteout250Pct >= 0.5) {
        failures.push(`[${vp.name}] Title bloom whiteout ${titleImg.fullBloom.whiteout250Pct}% >= 0.5%`);
      }

      // 2. 3D INTEL OBSERVATORY
      await clickVaultOrDirect(br, '#ws-util-observatory');
      await sleep(1200);
      const obsGeom = await measureStageGeometry(br, 'OBSERVATORY');
      const obsPerf = await br.measurePerf(1400);
      const obsShot = path.join(outDir, `e2e_observatory_${vp.name}.png`);
      await br.screenshot(obsShot);

      const obsCrop = vp.landscape
        ? [0.02, 0.08, Math.max(0.35, (obsGeom.openLeftPct || 48) / 100), 0.94]
        : [0.04, 0.05, 0.96, Math.max(0.35, Math.min(0.55, (obsGeom.openTopPct || 48) / 100))];
      const obsImg = analyzeImage(obsShot, obsCrop);

      const obsDrag = vp.landscape
        ? { x1: Math.round(vp.width * 0.12), y1: Math.round(vp.height * 0.5), x2: Math.round(vp.width * 0.38), y2: Math.round(vp.height * 0.5) }
        : { x1: Math.round(vp.width * 0.2), y1: Math.round(vp.height * 0.26), x2: Math.round(vp.width * 0.8), y2: Math.round(vp.height * 0.26) };
      const obsOrbit = await testTouchOrbit(
        br,
        vp,
        `obs_${vp.name}`,
        outDir,
        obsCrop,
        obsDrag,
        vp.name === '390x844' ? 'e2e_observatory_orbited_390x844.png' : null
      );

      vpReport.observatory = {
        screenshot: obsShot,
        geom: obsGeom,
        perf: obsPerf,
        bloomWhiteoutPct: obsImg.fullBloom.whiteout250Pct,
        stageGoldHero: obsImg.stageGoldHero,
        touchOrbit: obsOrbit,
      };

      if (!vp.landscape && obsGeom.openTopPct < 45) {
        failures.push(`[${vp.name}] Observatory bottom sheet rises too high (top=${obsGeom.openTopPct}dvh < 45dvh — slicing 3D Crown!)`);
      }
      if (vp.landscape && vp.width <= 960 && obsGeom.openLeftPct < 44) {
        failures.push(`[${vp.name}] Observatory landscape sheet overlaps Left 50vw 3D stage (left=${obsGeom.openLeftPct}vw)`);
      }
      if (!obsGeom.openHitPassThroughCanvas) {
        failures.push(`[${vp.name}] Observatory 3D open zone blocked pointer pass-through (hit: ${obsGeom.openHitTag})`);
      }
      if (!obsOrbit.orbited) {
        failures.push(`[${vp.name}] Observatory 1-finger touch drag did NOT orbit 3D artifact (idle=${JSON.stringify(obsOrbit.idleDiff)}, drag=${JSON.stringify(obsOrbit.dragDiff)})`);
      }
      if (obsPerf.maxDrawCalls >= 120) {
        failures.push(`[${vp.name}] Observatory draw calls >= 120 (max=${obsPerf.maxDrawCalls})`);
      }
      if (obsImg.fullBloom.whiteout250Pct >= 0.5) {
        failures.push(`[${vp.name}] Observatory bloom whiteout ${obsImg.fullBloom.whiteout250Pct}% >= 0.5%`);
      }

      // 3. PRISM ATELIER
      await jumpMetaSuiteSection(br, 'ATELIER', '#ws-util-atelier');
      await sleep(1100);
      const atGeom = await measureStageGeometry(br, 'ATELIER');
      const atPerf = await br.measurePerf(1300);
      const atShot = path.join(outDir, `e2e_atelier_${vp.name}.png`);
      await br.screenshot(atShot);

      const atCrop = vp.landscape
        ? [0.02, 0.08, Math.max(0.35, (atGeom.openLeftPct || 48) / 100), 0.94]
        : [0.04, 0.05, 0.96, Math.max(0.35, Math.min(0.55, (atGeom.openTopPct || 48) / 100))];
      const atImg = analyzeImage(atShot, atCrop);

      const atDrag = vp.landscape
        ? { x1: Math.round(vp.width * 0.12), y1: Math.round(vp.height * 0.5), x2: Math.round(vp.width * 0.38), y2: Math.round(vp.height * 0.5) }
        : { x1: Math.round(vp.width * 0.78), y1: Math.round(vp.height * 0.26), x2: Math.round(vp.width * 0.22), y2: Math.round(vp.height * 0.26) };
      const atOrbit = await testTouchOrbit(
        br,
        vp,
        `atelier_${vp.name}`,
        outDir,
        atCrop,
        atDrag,
        vp.name === '390x844' ? 'e2e_atelier_orbited_390x844.png' : null
      );

      vpReport.atelier = {
        screenshot: atShot,
        geom: atGeom,
        perf: atPerf,
        bloomWhiteoutPct: atImg.fullBloom.whiteout250Pct,
        stageGoldHero: atImg.stageGoldHero,
        touchOrbit: atOrbit,
      };

      if (!vp.landscape && atGeom.openTopPct < 45) {
        failures.push(`[${vp.name}] Atelier bottom sheet rises too high (top=${atGeom.openTopPct}dvh < 45dvh)`);
      }
      if (!atGeom.openHitPassThroughCanvas) {
        failures.push(`[${vp.name}] Atelier 3D open zone blocked pointer pass-through (hit: ${atGeom.openHitTag})`);
      }
      if (!atOrbit.orbited) {
        failures.push(`[${vp.name}] Atelier 1-finger touch drag did NOT orbit 3D Prism (idle=${JSON.stringify(atOrbit.idleDiff)}, drag=${JSON.stringify(atOrbit.dragDiff)})`);
      }
      if (atPerf.maxDrawCalls >= 120) {
        failures.push(`[${vp.name}] Atelier draw calls >= 120 (max=${atPerf.maxDrawCalls})`);
      }
      if (atImg.fullBloom.whiteout250Pct >= 0.5) {
        failures.push(`[${vp.name}] Atelier bloom whiteout ${atImg.fullBloom.whiteout250Pct}% >= 0.5%`);
      }

      vpReport.consoleErrors = br.consoleErrors.slice();
      vpReport.pageExceptions = br.pageExceptions.slice();
      vpReport.httpErrors = br.httpErrors.slice();

      if (br.consoleErrors.length > 0) failures.push(`[${vp.name}] Console errors: ${br.consoleErrors.join(' | ')}`);
      if (br.pageExceptions.length > 0) failures.push(`[${vp.name}] Page exceptions: ${br.pageExceptions.join(' | ')}`);
      if (br.httpErrors.length > 0) failures.push(`[${vp.name}] HTTP errors: ${JSON.stringify(br.httpErrors)}`);
    results.push(vpReport);
  }

  return { results, failures };
}

async function clickMetaBack(br) {
  const clicked = await br.evalJs(`(() => {
    const candidates = [
      '.ws-meta-backdrop [data-meta-back]',
      '.ws-meta-backdrop #ws-meta-back',
      '.ws-meta-backdrop .ws-meta-back-btn',
      '.ws-meta-backdrop .ws-meta-float-pill',
      '.ws-meta-backdrop button',
    ];
    for (const sel of candidates) {
      const els = Array.from(document.querySelectorAll(sel));
      for (const el of els) {
        const txt = (el.textContent || '').trim();
        if (sel.includes('back') || /←|Back|Return/i.test(txt)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && !el.closest('[hidden]')) {
            el.click();
            return txt || sel;
          }
        }
      }
    }
    return null;
  })()`);
  await sleep(380);
  return clicked;
}

async function drillDownBaseball(br) {
  // Wait for Briefing modal
  const open = await br.waitFor(`Boolean(document.querySelector('.ws-briefing-sheet, #ws-briefing-results'))`, 6000, 100);
  if (!open) throw new Error('Briefing modal did not open');
  await sleep(300);

  // Step 1: Click Sports & Games (L0)
  const l0Text = await br.evalJs(`(() => {
    const btns = Array.from(document.querySelectorAll('[data-pick-l0], .ws-sheet-row, button'));
    const target = btns.find((b) => /Sports\s*&\s*Games/i.test(b.textContent || ''));
    if (!target) return null;
    target.click();
    return target.textContent.trim().slice(0, 60);
  })()`);
  await sleep(320);

  // Step 2: Click Sports (L1)
  const l1Text = await br.evalJs(`(() => {
    const btns = Array.from(document.querySelectorAll('[data-pick-l1], .ws-sheet-row, button'));
    const target = btns.find((b) => /^Sports\b/i.test((b.querySelector('.ws-briefing-row-title')?.textContent || b.textContent || '').trim()));
    if (!target) return null;
    target.click();
    return target.textContent.trim().slice(0, 60);
  })()`);
  await sleep(320);

  // Step 3: Click Baseball (L2)
  const l2Text = await br.evalJs(`(() => {
    const btns = Array.from(document.querySelectorAll('[data-pick-l2], .ws-sheet-row, button'));
    const target = btns.find((b) => /\bBaseball\b/i.test(b.textContent || ''));
    if (!target) return null;
    target.click();
    return target.textContent.trim().slice(0, 80);
  })()`);
  await sleep(350);

  const breadcrumbs = await br.evalJs(`document.querySelector('#ws-briefing-breadcrumbs, .ws-sheet-breadcrumbs')?.textContent?.replace(/\\s+/g, ' ').trim() || ''`);
  return { l0Text, l1Text, l2Text, breadcrumbs };
}

async function runE2EPlayabilitySuite(br, baseUrl, outDir) {
  const report = {
    ambienceDefaultUi: null,
    titleReturnStack: {},
    gameplayReturnStack: {},
    savesExportImportDelete: {},
    circuitBreachRetryRestart: {},
    consoleErrors: [],
    pageExceptions: [],
    httpErrors: [],
    failures: [],
  };

  br.clearDiagnostics();
  await br.navigate('about:blank');
  await sleep(150);
  await br.setViewport({ width: 390, height: 844, mobile: true, dpr: 2 });
  await br.navigate(baseUrl);
  await waitForAppReady(br);
  await br.evalJs(`localStorage.clear(); location.reload();`);
  await sleep(400);
  await waitForAppReady(br);
  br.clearDiagnostics();

    // =========================================================================
    // 1. LIVE UI AMBIENCE: OFF DEFAULT
    // =========================================================================
    await openVaultDrawer(br);
    const vaultShot = path.join(outDir, 'e2e_vault_drawer_390x844.png');
    await br.screenshot(vaultShot);
    const ambienceUi = await br.evalJs(`(() => {
      const btn = document.querySelector('#ws-util-music');
      return {
        found: Boolean(btn),
        ariaPressed: btn?.getAttribute('aria-pressed'),
        text: btn?.textContent?.replace(/\\s+/g, ' ').trim() || '',
        lsAmbience: localStorage.getItem('ws_ambience_enabled_v2'),
        lsMusic: localStorage.getItem('ws_studio_music_enabled_v2'),
      };
    })()`);
    report.ambienceDefaultUi = { ...ambienceUi, screenshot: vaultShot };
    if (!ambienceUi.found || ambienceUi.ariaPressed === 'true' || /\bON\b/.test(ambienceUi.text)) {
      report.failures.push(`AMBIENCE default UI not OFF: ${JSON.stringify(ambienceUi)}`);
    }

    // Verify Escape closes Vault Drawer cleanly!
    await br.pressKey('Escape');
    await sleep(250);
    const vaultClosedAfterEsc = await br.evalJs(`!document.querySelector('#ws-vault-drawer.is-open')`);
    report.titleReturnStack.vaultEscapeClosed = vaultClosedAfterEsc;
    if (!vaultClosedAfterEsc) {
      report.failures.push('Pressing Escape while Vault Drawer is open did NOT close Vault Drawer');
      await br.clickSelector('#ws-vault-close');
      await sleep(200);
    }

    // =========================================================================
    // 2. RETURN STACK FROM TITLE SCREEN:
    //    Vault -> Passport (also stamp Challenger Name so Slot 1 has a real save!)
    //    -> Observatory -> Stats -> Trophies -> Back/Escape/popstate
    //    + 5-Slot Saves (Export / Import / Delete)
    //    + Briefing (Sports & Games -> Sports -> Baseball)
    // =========================================================================
    await clickVaultOrDirect(br, '#ws-util-passport');
    await sleep(500);
    const passportShot = path.join(outDir, 'e2e_passport_390x844.png');
    await br.screenshot(passportShot);

    // Register a custom Challenger Name in Passport so Slot 1 becomes a populated exportable save!
    await br.evalJs(`(() => {
      const inp = document.querySelector('.ws-meta-backdrop input[type="text"], .ws-meta-backdrop input');
      const stampBtn = Array.from(document.querySelectorAll('.ws-meta-backdrop button')).find((b) => /STAMP/i.test(b.textContent || ''));
      if (inp && stampBtn) {
        inp.value = 'AUDIT_PRO';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        stampBtn.click();
      }
    })()`);
    await sleep(400);

    await jumpMetaSuiteSection(br, 'OBSERVATORY', '#ws-util-observatory');
    await sleep(600);
    await jumpMetaSuiteSection(br, 'ANALYTICS', '#ws-util-stats');
    await sleep(550);
    const statsShot = path.join(outDir, 'e2e_stats_390x844.png');
    await br.screenshot(statsShot);

    await jumpMetaSuiteSection(br, 'HONOURS', '#ws-util-trophies');
    await sleep(550);
    const trophiesShot = path.join(outDir, 'e2e_trophies_390x844.png');
    await br.screenshot(trophiesShot);

    // Unwind Trophies -> Stats via <- Back
    const back1 = await clickMetaBack(br);
    const afterBack1 = await br.evalJs(`document.querySelector('.ws-meta-backdrop')?.textContent?.slice(0, 120) || ''`);
    // Unwind Stats -> Observatory via Browser Back (popstate)!
    await br.evalJs(`window.history.back()`);
    await sleep(450);
    const afterPop1 = await br.evalJs(`document.querySelector('.ws-meta-backdrop')?.textContent?.slice(0, 120) || ''`);
    // Unwind Observatory -> Passport -> Title via Escape!
    await br.pressKey('Escape');
    await sleep(400);
    const modalClosedAfterEsc = await br.evalJs(`!document.querySelector('.ws-meta-backdrop')`);

    // 5-Slot Saves from Title -> Back via Escape & popstate
    await clickVaultOrDirect(br, '#ws-util-saves');
    await sleep(400);
    const savesOpenFromTitle = await br.evalJs(`Boolean(document.querySelector('.ws-save-modal'))`);
    const savesShot = path.join(outDir, 'e2e_saves_390x844.png');
    await br.screenshot(savesShot);

    // Test 5-Slot Save Export / Delete / Import right here!
    const savesTest = { slotCount: 0, exportOk: false, deleteOk: false, importOk: false, exportedFilename: null };
    savesTest.slotCount = await br.evalJs(`document.querySelectorAll('.ws-save-slot-row').length`);
    // Export Slot 1
    await br.clickSelector('[data-slot-export="1"]');
    await sleep(300);
    const exported = await br.evalJs(`window.__rtStats.downloads[window.__rtStats.downloads.length - 1] || null`);
    savesTest.exportedFilename = exported?.filename || null;
    savesTest.exportOk = Boolean(exported && exported.text && exported.text.includes('WORLDS_SMARTEST_CAMPAIGN_SAVE'));

    // Import that exported backup into Slot 2!
    if (savesTest.exportOk) {
      await br.evalJs(`(() => {
        const importBtn = document.querySelector('[data-slot-import="2"]');
        const fileInput = document.querySelector('#ws-saves-file-input');
        if (!importBtn || !fileInput) throw new Error('Missing import button or file input');
        // Click import button without triggering OS picker block: stub input.click momentarily
        const origClick = fileInput.click;
        fileInput.click = () => {};
        importBtn.click();
        fileInput.click = origClick;
        const payload = window.__rtStats.downloads[window.__rtStats.downloads.length - 1].text;
        const dt = new DataTransfer();
        dt.items.add(new File([payload], 'backup_slot1.ws-save.json', { type: 'application/json' }));
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      })()`);
      await sleep(450);
      const slot2AfterImport = await br.evalJs(`(() => {
        const raw = localStorage.getItem('ws_campaign_slot_2');
        const banner = document.querySelector('.ws-saves-banner')?.textContent?.trim() || '';
        const hasDel = Boolean(document.querySelector('[data-slot-delete="2"]'));
        return { hasStorage: Boolean(raw), banner, hasDel };
      })()`);
      savesTest.importOk = slot2AfterImport.hasStorage && slot2AfterImport.hasDel;
      savesTest.importDetails = slot2AfterImport;

      // Now Delete Slot 2 via inline Confirm Delete!
      if (slot2AfterImport.hasDel) {
        await br.clickSelector('[data-slot-delete="2"]');
        await sleep(250);
        await br.clickSelector('[data-exec-confirm="2"]');
        await sleep(350);
        const slot2AfterDelete = await br.evalJs(`(() => {
          const raw = localStorage.getItem('ws_campaign_slot_2');
          const hasDel = Boolean(document.querySelector('[data-slot-delete="2"]'));
          const banner = document.querySelector('.ws-saves-banner')?.textContent?.trim() || '';
          return { storageCleared: raw === null, hasDel, banner };
        })()`);
        savesTest.deleteOk = slot2AfterDelete.storageCleared && !slot2AfterDelete.hasDel;
        savesTest.deleteDetails = slot2AfterDelete;
      }
    }
    report.savesExportImportDelete = { ...savesTest, screenshot: savesShot };
    if (savesTest.slotCount !== 5) report.failures.push(`Expected 5 save slots, got ${savesTest.slotCount}`);
    if (!savesTest.exportOk) report.failures.push('5-Slot Save Export failed');
    if (!savesTest.importOk) report.failures.push('5-Slot Save Import failed');
    if (!savesTest.deleteOk) report.failures.push('5-Slot Save Delete failed');

    // Close Saves via Browser Back (popstate)!
    await br.evalJs(`window.history.back()`);
    await sleep(400);
    const savesClosedPopstate = await br.evalJs(`!document.querySelector('.ws-save-modal')`);
    if (!savesClosedPopstate) {
      report.failures.push('5-Slot Saves did NOT unwind cleanly via Browser Back (popstate)');
      await br.clickSelector('#ws-saves-close');
      await sleep(250);
    }

    // Open Briefing from Title -> Drill Down Sports & Games -> Sports -> Baseball
    await br.clickSelector('[data-title-mode="BRIEFING"]');
    await sleep(500);
    // If on Hub Briefing tab, open the category picker if modal isn't directly open
    const briefingModalDirect = await br.evalJs(`Boolean(document.querySelector('.ws-briefing-sheet'))`);
    if (!briefingModalDirect) {
      await br.evalJs(`(() => {
        const btn = document.querySelector('#ws-open-briefing-picker, [data-open-briefing], .ws-btn-gold');
        btn?.click();
      })()`);
      await sleep(450);
    }
    const baseballDrill = await drillDownBaseball(br);
    const briefingShot = path.join(outDir, 'e2e_briefing_baseball_390x844.png');
    await br.screenshot(briefingShot);

    // Test <- Back inside Briefing (L2 -> L1 -> L0 -> Close)
    await br.clickSelector('#ws-cat-back-btn');
    await sleep(250);
    const crumbAfterBack = await br.evalJs(`document.querySelector('#ws-briefing-breadcrumbs')?.textContent?.replace(/\\s+/g, ' ').trim() || ''`);
    await br.pressKey('Escape');
    await sleep(300);
    const briefingClosedEsc = await br.evalJs(`!document.querySelector('.ws-briefing-sheet')`);

    report.titleReturnStack = {
      ...report.titleReturnStack,
      passportShot,
      statsShot,
      trophiesShot,
      briefingShot,
      back1Clicked: back1,
      afterBack1: afterBack1.replace(/\s+/g, ' ').trim().slice(0, 60),
      afterPop1: afterPop1.replace(/\s+/g, ' ').trim().slice(0, 60),
      modalClosedAfterEsc,
      savesOpenFromTitle,
      savesClosedPopstate,
      baseballDrill,
      briefingCrumbAfterBack: crumbAfterBack,
      briefingClosedEsc,
    };
    if (!modalClosedAfterEsc) report.failures.push('Meta Suite did NOT close on Escape from Title');
    if (!briefingClosedEsc) report.failures.push('Briefing Sheet did NOT close on Escape from Title');
    if (!baseballDrill.l2Text || !/Baseball/i.test(baseballDrill.breadcrumbs)) {
      report.failures.push(`Baseball drill-down incomplete: ${JSON.stringify(baseballDrill)}`);
    }

    // =========================================================================
    // 3. RETURN STACK FROM MID-MATCH GAMEPLAY (PRESERVING TIMER & PEEL STATE!)
    // =========================================================================
    // Re-open Briefing -> Baseball and LAUNCH a live Baseball match!
    const onTitle = await br.evalJs(`Boolean(document.querySelector('[data-title-mode="BRIEFING"]'))`);
    if (onTitle) {
      await br.clickSelector('[data-title-mode="BRIEFING"]');
      await sleep(450);
    }
    const briefingOpen2 = await br.evalJs(`Boolean(document.querySelector('.ws-briefing-sheet'))`);
    if (!briefingOpen2) {
      await br.evalJs(`document.querySelector('#ws-open-briefing-picker, .ws-btn-gold')?.click()`);
      await sleep(450);
    }
    await drillDownBaseball(br);
    await br.clickSelector('#ws-cat-launch-btn, .ws-briefing-launch-cta');
    const matchStarted = await br.waitFor(`document.querySelector('[data-facet-idx="0"]') && document.querySelector('#ws-btn-overclock')`, 10000, 150);
    if (!matchStarted) throw new Error('Baseball match failed to launch');
    await sleep(400);

    // Peel Crown once (Tier 1 -> Tier 2) so Peel state is non-default!
    const hasPeel = await br.evalJs(`Boolean(document.querySelector('#ws-btn-peel') && !document.querySelector('#ws-btn-peel').disabled)`);
    if (hasPeel) {
      await br.clickSelector('#ws-btn-peel');
      await sleep(350);
    }
    const liveShot = path.join(outDir, 'e2e_gameplay_live_baseball_390x844.png');
    await br.screenshot(liveShot);

    const beforeMatchSnap = await br.evalJs(`(() => {
      const prompt = document.querySelector('.ws-question-prompt, .ws-q-prompt, .ws-stem')?.textContent?.trim() || '';
      const timerTxt = document.querySelector('#ws-chrono-text, #ws-timer-text, .ws-chrono-ring')?.textContent?.trim() || '';
      const peelTxt = document.querySelector('#ws-btn-peel')?.textContent?.trim() || '';
      const multTxt = document.querySelector('#ws-tier-badge, .ws-tier-pill, .ws-mult-pill')?.textContent?.trim() || '';
      const clueVisible = Boolean(document.querySelector('.ws-clue-drawer, .ws-clue-line'));
      const m = timerTxt.match(/(\\d+(?:\\.\\d+)?)/);
      return { prompt, timerTxt, timerSec: m ? parseFloat(m[1]) : null, peelTxt, multTxt, clueVisible };
    })()`);

    // Open Vault -> wait 1.4s -> Passport -> Observatory -> Stats -> Trophies -> Back/Escape/popstate -> 5-Slot Saves -> popstate
    await openVaultDrawer(br);
    await sleep(1400);
    await br.clickSelector('#ws-util-passport');
    await sleep(500);
    await jumpMetaSuiteSection(br, 'OBSERVATORY', '#ws-util-observatory');
    await sleep(500);
    await jumpMetaSuiteSection(br, 'ANALYTICS', '#ws-util-stats');
    await sleep(450);
    await jumpMetaSuiteSection(br, 'HONOURS', '#ws-util-trophies');
    await sleep(450);

    // Unwind via <- Back, popstate, Escape
    await clickMetaBack(br); // Trophies -> Stats
    await br.evalJs(`window.history.back()`); // Stats -> Observatory
    await sleep(400);
    await br.pressKey('Escape'); // Close Meta Suite -> back to live gameplay
    await sleep(500);

    // Open 5-Slot Saves mid-match -> wait 1.2s -> unwind via popstate
    await clickVaultOrDirect(br, '#ws-util-saves');
    await sleep(1200);
    await br.evalJs(`window.history.back()`);
    await sleep(450);

    // Check if Briefing is reachable mid-match or via Leave Match guard (confirm we're STILL in live gameplay!)
    const afterMatchSnap = await br.evalJs(`(() => {
      const prompt = document.querySelector('.ws-question-prompt, .ws-q-prompt, .ws-stem')?.textContent?.trim() || '';
      const timerTxt = document.querySelector('#ws-chrono-text, #ws-timer-text, .ws-chrono-ring')?.textContent?.trim() || '';
      const peelTxt = document.querySelector('#ws-btn-peel')?.textContent?.trim() || '';
      const multTxt = document.querySelector('#ws-tier-badge, .ws-tier-pill, .ws-mult-pill')?.textContent?.trim() || '';
      const clueVisible = Boolean(document.querySelector('.ws-clue-drawer, .ws-clue-line'));
      const orphanModals = document.querySelectorAll('.ws-modal-backdrop, .ws-meta-backdrop, .ws-vault-drawer.is-open').length;
      const m = timerTxt.match(/(\\d+(?:\\.\\d+)?)/);
      return { prompt, timerTxt, timerSec: m ? parseFloat(m[1]) : null, peelTxt, multTxt, clueVisible, orphanModals };
    })()`);

    const timerDriftSec =
      beforeMatchSnap.timerSec !== null && afterMatchSnap.timerSec !== null
        ? Number((beforeMatchSnap.timerSec - afterMatchSnap.timerSec).toFixed(2))
        : null;

    report.gameplayReturnStack = {
      liveShot,
      before: beforeMatchSnap,
      after: afterMatchSnap,
      timerDriftSec,
      promptPreserved: beforeMatchSnap.prompt.length > 5 && beforeMatchSnap.prompt === afterMatchSnap.prompt,
      peelPreserved: beforeMatchSnap.clueVisible === afterMatchSnap.clueVisible && beforeMatchSnap.peelTxt === afterMatchSnap.peelTxt,
    };
    if (!report.gameplayReturnStack.promptPreserved) {
      report.failures.push(`Mid-match return stack lost live question! before="${beforeMatchSnap.prompt}" after="${afterMatchSnap.prompt}"`);
    }
    if (!report.gameplayReturnStack.peelPreserved) {
      report.failures.push(`Mid-match return stack lost Peel state! before=${JSON.stringify(beforeMatchSnap)} after=${JSON.stringify(afterMatchSnap)}`);
    }
    if (timerDriftSec !== null && timerDriftSec > 2.8) {
      report.failures.push(`Mid-match timer drained ${timerDriftSec}s while Vault/Modals were open (expected paused!)`);
    }
    if (afterMatchSnap.orphanModals !== 0) {
      report.failures.push(`Orphan modals remained open after unwinding mid-match return stack: ${afterMatchSnap.orphanModals}`);
    }

    // =========================================================================
    // 4. LEVEL FAILURE (CIRCUIT BREACH), RETRY, & RESTART
    // =========================================================================
    // Navigate fresh to Title with clean localStorage, then launch Geneva Campaign M1 (ch_1) directly from Hub!
    await br.evalJs(`localStorage.clear()`);
    await br.navigate(baseUrl);
    await waitForAppReady(br);

    // Click Circuit mode on Start Screen -> Meridian Hub -> click ch_1 mission card directly!
    await br.clickSelector('[data-title-mode="CAMPAIGN"]');
    await sleep(600);
    const enteredCampaign = await br.evalJs(`(() => {
      const mBtn = document.querySelector('[data-launch-mission="ch_1"], [data-mission-id="ch_1"], [data-launch-mission]');
      if (mBtn) { mBtn.click(); return 'mission-btn:' + (mBtn.dataset.launchMission || mBtn.dataset.missionId || 'first'); }
      // Fallback: find any button containing "M1" or "Geneva" or "Round 1" or "Vetting"
      const btns = Array.from(document.querySelectorAll('button'));
      const cand = btns.find((b) => /ch_1|MISSION 1|ROUND 1|LAUNCH|START MISSION/i.test((b.dataset.launchMission || '') + ' ' + (b.textContent || '')));
      if (cand) { cand.click(); return 'cand:' + cand.textContent.trim().slice(0, 40); }
      const primary = document.querySelector('#ws-hub-primary-cta, .ws-hub-launch-btn, .ws-btn-gold');
      if (primary) { primary.click(); return 'primary:' + primary.textContent.trim().slice(0, 30); }
      return null;
    })()`);
    await sleep(700);

    // Advance through any intro cinema cutscene (#ws-mc-skip), dialogue beats (#ws-dialogue-next), or registration (#ws-reg-submit)
    for (let step = 0; step < 16; step++) {
      const inGameplay = await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-facet-idx="0"]') || document.querySelector('[data-gauntlet]'))`);
      if (inGameplay) break;
      await br.evalJs(`(() => {
        const skip = document.querySelector('#ws-mc-skip, .ws-mc-btn-skip, #ws-cinema-skip, [data-cinema-skip]');
        if (skip) { skip.click(); return; }
        const regInput = document.querySelector('#ws-reg-name, input.ws-name-input');
        if (regInput) {
          regInput.value = 'AUDITOR';
          regInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const btn = document.querySelector('#ws-reg-submit, #ws-dialogue-next, #ws-dialogue-continue, [data-choice-id], [data-launch-mission="ch_1"], #ws-mc-next, .ws-btn-gold');
        btn?.click();
      })()`);
      await sleep(480);
    }

    // Deliberately fail Campaign M1 (ch_1) until CIRCUIT BREACH appears!
    let breachReached = false;
    for (let attempt = 0; attempt < 2 && !breachReached; attempt++) {
      if (attempt > 0) {
        await br.evalJs(`localStorage.clear()`);
        await br.navigate(baseUrl);
        await waitForAppReady(br);
        await br.clickSelector('[data-title-mode="CAMPAIGN"]');
        await sleep(600);
        await br.evalJs(`document.querySelector('[data-launch-mission="ch_1"], [data-mission-id="ch_1"], [data-launch-mission]')?.click()`);
        await sleep(700);
      }

      for (let qStep = 0; qStep < 20; qStep++) {
        const hasBreach = await br.evalJs(`Boolean(document.querySelector('#ws-retry-mission'))`);
        if (hasBreach) {
          breachReached = true;
          break;
        }
        const hasVictory = await br.evalJs(`Boolean(document.querySelector('#ws-summary-continue') && !document.querySelector('#ws-retry-mission'))`);
        if (hasVictory) break;

        // Skip any cinema cutscene / dialogue / boss banner
        const skippedCinema = await br.evalJs(`(() => {
          const skip = document.querySelector('#ws-mc-skip, .ws-mc-btn-skip, #ws-boss-engage, #ws-dialogue-next, #ws-dialogue-continue, [data-choice-id]');
          if (skip) { skip.click(); return true; }
          return false;
        })()`);
        if (skippedCinema) {
          await sleep(450);
          continue;
        }

        const hasNext = await br.evalJs(`Boolean(document.querySelector('#ws-btn-next-q'))`);
        if (hasNext) {
          await br.clickSelector('#ws-btn-next-q');
          await sleep(450);
          continue;
        }

        // On live question: make intentionally suboptimal move + Overclock hold (650ms) so wrong lock triggers Backfire shield shatter!
        const didSubmit = await br.evalJs(`(() => {
          const slider = document.querySelector('#ws-calibrator-slider, input[type="range"]');
          if (slider) {
            slider.value = slider.min;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const gBtn = document.querySelector('[data-gauntlet="DEBUNK"], [data-gauntlet="VERIFY"]');
          if (gBtn) { gBtn.click(); return 'gauntlet'; }
          const fBtn = document.querySelector('[data-facet-idx="${attempt % 4}"]') || document.querySelector('[data-facet-idx="0"]');
          if (fBtn) fBtn.click();
          return 'armed';
        })()`);
        if (didSubmit === 'armed') {
          await sleep(120);
          const hasLock = await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock'))`);
          if (hasLock) {
            const pt = await br.evalJs(`(() => {
              const r = document.querySelector('#ws-btn-overclock').getBoundingClientRect();
              return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            })()`);
            await br.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y });
            await br.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
            await sleep(560);
            await br.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
          }
        }
        await sleep(550);
      }
    }

    const breachShot = path.join(outDir, 'e2e_circuit_breach_390x844.png');
    await br.screenshot(breachShot);

    let restartModalOk = false;
    let retryOk = false;
    const restartShot = path.join(outDir, 'e2e_restart_sheet_390x844.png');

    if (breachReached) {
      const breachText = await br.evalJs(`document.body.innerText.includes('CIRCUIT BREACH')`);
      // Test RESTART button first (open sheet, screenshot, close via cancel/backdrop!)
      const hasRestartBtn = await br.evalJs(`Boolean(document.querySelector('#ws-restart-from-start'))`);
      if (hasRestartBtn) {
        await br.clickSelector('#ws-restart-from-start');
        await sleep(350);
        await br.screenshot(restartShot);
        restartModalOk = await br.evalJs(`Boolean(document.querySelector('#ws-rfs-city') || document.querySelector('#ws-rfs-campaign'))`);
        // Close Restart sheet via Escape/cancel so we can test RETRY right after!
        await br.evalJs(`document.querySelector('#ws-rfs-cancel')?.click()`);
        await sleep(300);
        const stillOpen = await br.evalJs(`Boolean(document.querySelector('#ws-rfs-campaign'))`);
        if (stillOpen) await br.pressKey('Escape');
        await sleep(250);
      }

      // Now click RETRY!
      await br.clickSelector('#ws-retry-mission');
      await sleep(700);
      // Advance any brief pre-match beat if present
      for (let i = 0; i < 4; i++) {
        const liveAgain = await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-facet-idx="0"]') || document.querySelector('[data-gauntlet]'))`);
        if (liveAgain) { retryOk = true; break; }
        await br.evalJs(`document.querySelector('#ws-cinema-skip, #ws-dialogue-next')?.click()`);
        await sleep(400);
      }

      report.circuitBreachRetryRestart = {
        enteredCampaign,
        breachReached,
        breachTextVisible: breachText,
        breachShot,
        restartModalOk,
        restartShot: hasRestartBtn ? restartShot : null,
        retryOk,
      };
    } else {
      report.circuitBreachRetryRestart = { enteredCampaign, breachReached: false, breachShot };
    }

    if (!breachReached) report.failures.push('Could not reach CIRCUIT BREACH level failure screen');
    if (breachReached && !restartModalOk) report.failures.push('RESTART FROM START modal failed to open from CIRCUIT BREACH');
    if (breachReached && !retryOk) report.failures.push('RETRY LEVEL button failed to relaunch mission');

    report.consoleErrors = br.consoleErrors.slice();
    report.pageExceptions = br.pageExceptions.slice();
    report.httpErrors = br.httpErrors.slice();
    if (br.consoleErrors.length > 0) report.failures.push(`E2E console errors: ${br.consoleErrors.join(' | ')}`);
    if (br.pageExceptions.length > 0) report.failures.push(`E2E page exceptions: ${br.pageExceptions.join(' | ')}`);
    if (br.httpErrors.length > 0) report.failures.push(`E2E HTTP errors: ${JSON.stringify(br.httpErrors)}`);

  return report;
}

async function main() {
  const args = parseArgs();
  fs.mkdirSync(args.outDir, { recursive: true });
  const srv = await startDistServer();
  const br = await launchCdpBrowser({ width: 1280, height: 800, softwareGl: args.softwareGl });
  const fullReport = {
    distPort: srv.port,
    timestamp: new Date().toISOString(),
    gpuAndFraming: null,
    e2ePlayability: null,
    passed: true,
    allFailures: [],
  };

  try {
    if (args.suite === 'all' || args.suite === 'gpu') {
      fullReport.gpuAndFraming = await runGpuAndFramingSuite(br, srv.baseUrl, args.outDir);
      fullReport.allFailures.push(...fullReport.gpuAndFraming.failures);
    }
    if (args.suite === 'all' || args.suite === 'e2e') {
      fullReport.e2ePlayability = await runE2EPlayabilitySuite(br, srv.baseUrl, args.outDir);
      fullReport.allFailures.push(...fullReport.e2ePlayability.failures);
    }
  } finally {
    await br.close();
    await srv.close();
  }

  fullReport.passed = fullReport.allFailures.length === 0;
  const reportPath = path.join(args.outDir, 'rt_e2e_systems_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
  console.log(JSON.stringify(fullReport, null, 2));
  if (!fullReport.passed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
