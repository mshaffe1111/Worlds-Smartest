#!/usr/bin/env node
/**
 * Focused final live proof for:
 * 1) Briefing 3-level drill-down (Sports & Games -> Sports -> Baseball) + Back/Escape/popstate
 * 2) Campaign Level Failure (CIRCUIT BREACH) -> RESTART modal -> RETRY relaunch
 */
import path from 'node:path';
import { startDistServer, launchCdpBrowser, sleep } from './rt_e2e_cdp.mjs';

const OUT_DIR = 'C:\\Users\\mshaf\\.gemini\\antigravity\\brain\\5105c2d2-97dc-437b-a862-15ee6ff8bb52';

async function main() {
  const srv = await startDistServer();
  const br = await launchCdpBrowser({ width: 390, height: 844 });
  const result = {
    goldMasterGpu: {},
    baseballDrilldown: {},
    circuitBreach: {},
    consoleErrors: [],
    pageExceptions: [],
    httpErrors: [],
    passed: true,
    failures: [],
  };

  try {
    await br.setViewport({ width: 390, height: 844, mobile: true, dpr: 2 });
    await br.navigate(srv.baseUrl);
    await br.waitFor(`document.querySelector('#ws-title-enter-cta')`, 25000, 150);
    await sleep(1200);

    // 0. Gold Master WebGL2 Draw Calls & FPS Check (Start Screen, 3D Observatory, Prism Atelier)
    const titlePerf = await br.measurePerf(1500);
    const titleShot = path.join(OUT_DIR, 'e2e_gold_title_390x844.png');
    await br.screenshot(titleShot);

    await br.clickSelector('#ws-util-vault');
    await sleep(260);
    await br.clickSelector('#ws-util-observatory');
    await sleep(1100);
    const obsPerf = await br.measurePerf(1500);
    const obsShot = path.join(OUT_DIR, 'e2e_gold_observatory_390x844.png');
    await br.screenshot(obsShot);

    await br.clickSelector('.ws-meta-backdrop [data-vault-trigger]');
    await sleep(200);
    await br.clickSelector('.ws-meta-backdrop [data-suite-nav="ATELIER"]');
    await sleep(1100);
    const atPerf = await br.measurePerf(1500);
    const atShot = path.join(OUT_DIR, 'e2e_gold_atelier_390x844.png');
    await br.screenshot(atShot);

    await br.pressKey('Escape');
    await sleep(350);

    result.goldMasterGpu = {
      title: { ...titlePerf, screenshot: titleShot },
      observatory: { ...obsPerf, screenshot: obsShot },
      atelier: { ...atPerf, screenshot: atShot },
    };

    // 1. Briefing 3-level drill-down: Sports & Games -> Sports -> Baseball
    await br.clickSelector('[data-title-mode="BRIEFING"]');
    await sleep(500);
    const openSheet = await br.waitFor(`document.querySelector('.ws-briefing-sheet')`, 5000, 100);
    if (!openSheet) {
      await br.evalJs(`document.querySelector('#ws-open-briefing-picker, .ws-btn-gold')?.click()`);
      await br.waitFor(`document.querySelector('.ws-briefing-sheet')`, 5000, 100);
    }
    await sleep(300);

    const l0 = await br.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('[data-pick-l0]')).find((b) => /Sports/i.test(b.textContent || ''));
      if (!btn) return null;
      btn.click();
      return btn.textContent.replace(/\\s+/g, ' ').trim();
    })()`);
    await sleep(300);

    const l1 = await br.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('[data-pick-l1]')).find((b) => /^Sports\\b/i.test((b.querySelector('.ws-briefing-row-title')?.textContent || b.textContent || '').trim()));
      if (!btn) return null;
      btn.click();
      return btn.textContent.replace(/\\s+/g, ' ').trim();
    })()`);
    await sleep(300);

    const l2 = await br.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('[data-pick-l2]')).find((b) => /Baseball/i.test(b.textContent || ''));
      if (!btn) return null;
      btn.click();
      return btn.textContent.replace(/\\s+/g, ' ').trim();
    })()`);
    await sleep(350);

    const crumbsL2 = await br.evalJs(`document.querySelector('#ws-briefing-breadcrumbs')?.textContent?.replace(/\\s+/g, ' ').trim() || ''`);
    const targetReadout = await br.evalJs(`document.querySelector('.ws-briefing-target-line')?.textContent?.replace(/\\s+/g, ' ').trim() || ''`);
    const bbShot = path.join(OUT_DIR, 'e2e_briefing_baseball_l2_390x844.png');
    await br.screenshot(bbShot);

    // Unwind L2 -> L1 via <- Back, then close via popstate
    await br.clickSelector('#ws-cat-back-btn');
    await sleep(250);
    const crumbsAfterBack = await br.evalJs(`document.querySelector('#ws-briefing-breadcrumbs')?.textContent?.replace(/\\s+/g, ' ').trim() || ''`);
    await br.evalJs(`window.history.back()`);
    await sleep(400);
    const closedByPopstate = await br.evalJs(`!document.querySelector('.ws-briefing-sheet')`);

    result.baseballDrilldown = {
      l0, l1, l2, crumbsL2, targetReadout, crumbsAfterBack, closedByPopstate, screenshot: bbShot,
    };
    if (!l2 || !/Baseball/i.test(crumbsL2)) result.failures.push(`Baseball drilldown failed: ${JSON.stringify(result.baseballDrilldown)}`);

    // 2. Campaign Mission ch_1 -> CIRCUIT BREACH -> RESTART modal -> RETRY relaunch
    await br.evalJs(`localStorage.clear()`);
    await br.navigate('about:blank');
    await sleep(150);
    await br.navigate(srv.baseUrl);
    await br.waitFor(`document.querySelector('[data-title-mode="CAMPAIGN"]')`, 20000, 150);
    await sleep(1200);
    await br.clickSelector('[data-title-mode="CAMPAIGN"]');
    await br.waitFor(`document.querySelector('[data-launch-mission], [data-mission-id], .ws-hub-scroll')`, 8000, 100);
    await sleep(500);

    // Launch ch_1 mission directly (NOT Prologue!)
    const hubLaunch = await br.evalJs(`(() => {
      const mBtn = document.querySelector('[data-launch-mission="ch_1"], [data-mission-id="ch_1"], [data-launch-mission]');
      if (mBtn) { mBtn.click(); return 'mission:' + (mBtn.dataset.launchMission || mBtn.dataset.missionId || 'first'); }
      const all = Array.from(document.querySelectorAll('button')).map((b) => ({
        id: b.id,
        ds: { ...b.dataset },
        txt: (b.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 50),
      }));
      return { notFound: true, buttons: all.slice(0, 25) };
    })()`);
    await sleep(650);

    // Advance past any pre-match beat or cutscene into live gameplay, then fail 3 shields -> CIRCUIT BREACH!
    let breachReached = false;
    let stepsLog = [];
    for (let step = 0; step < 30; step++) {
      const state = await br.evalJs(`(() => ({
        hasRetry: Boolean(document.querySelector('#ws-retry-mission')),
        hasVictoryOnly: Boolean(document.querySelector('#ws-summary-continue') && !document.querySelector('#ws-retry-mission')),
        hasNext: Boolean(document.querySelector('#ws-btn-next-q')),
        hasOverclock: Boolean(document.querySelector('#ws-btn-overclock')),
        hasGauntlet: Boolean(document.querySelector('[data-gauntlet]')),
        hasSkip: Boolean(document.querySelector('#ws-mc-skip, .ws-mc-btn-skip')),
        hasDialogueNext: Boolean(document.querySelector('#ws-dialogue-next, #ws-dialogue-continue')),
        hasChoice: Boolean(document.querySelector('[data-choice-id]')),
        hasLaunchMission: Boolean(document.querySelector('[data-launch-mission="ch_1"]')),
        shieldsTxt: document.querySelector('#ws-player-pts')?.textContent?.trim() || '',
        headline: document.body.innerText.slice(0, 140).replace(/\\s+/g, ' '),
      }))()`);

      if (state.hasRetry) {
        breachReached = true;
        stepsLog.push(`step ${step}: CIRCUIT BREACH REACHED`);
        break;
      }
      if (state.hasVictoryOnly) {
        stepsLog.push(`step ${step}: victory instead, retrying ch_1`);
        await br.clickSelector('#ws-summary-continue');
        await sleep(500);
        await br.evalJs(`document.querySelector('[data-launch-mission="ch_1"], [data-launch-mission]')?.click()`);
        await sleep(600);
        continue;
      }
      if (state.hasSkip) {
        await br.clickSelector('#ws-mc-skip, .ws-mc-btn-skip');
        await sleep(450);
        continue;
      }
      if (state.hasDialogueNext) {
        await br.clickSelector('#ws-dialogue-next, #ws-dialogue-continue');
        await sleep(400);
        continue;
      }
      if (state.hasChoice) {
        await br.clickSelector('[data-choice-id]');
        await sleep(450);
        continue;
      }
      if (state.hasNext) {
        await br.clickSelector('#ws-btn-next-q');
        await sleep(450);
        continue;
      }
      if (state.hasGauntlet) {
        await br.clickSelector('[data-gauntlet="DEBUNK"]');
        await sleep(500);
        continue;
      }
      if (state.hasOverclock) {
        // Pick extreme Calibrator or facet index rotating to miss + hold Overclock 550ms for shield shatter!
        await br.evalJs(`(() => {
          const slider = document.querySelector('#ws-calibrator-slider, input[type="range"]');
          if (slider) {
            slider.value = slider.min;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const idx = ${step % 4};
          const f = document.querySelector('[data-facet-idx="' + idx + '"]') || document.querySelector('[data-facet-idx="0"]');
          if (f && !f.classList.contains('is-sightline')) f.click();
        })()`);
        await sleep(120);
        const pt = await br.evalJs(`(() => {
          const el = document.querySelector('#ws-btn-overclock');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        })()`);
        if (pt) {
          await br.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y });
          await br.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
          await sleep(560);
          await br.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
        }
        await sleep(550);
        continue;
      }
      // Fallback click gold button if stuck on registration/intro
      await br.evalJs(`(() => {
        const reg = document.querySelector('#ws-reg-name, input.ws-name-input');
        if (reg) { reg.value = 'AUDITOR'; reg.dispatchEvent(new Event('input', { bubbles: true })); }
        document.querySelector('#ws-reg-submit, [data-launch-mission="ch_1"], .ws-btn-gold')?.click();
      })()`);
      await sleep(450);
    }

    const breachShot = path.join(OUT_DIR, 'e2e_circuit_breach_live_390x844.png');
    await br.screenshot(breachShot);

    let restartModalOk = false;
    let retryRelaunchOk = false;
    const restartShot = path.join(OUT_DIR, 'e2e_restart_modal_live_390x844.png');

    if (breachReached) {
      const hasRestart = await br.evalJs(`Boolean(document.querySelector('#ws-restart-from-start'))`);
      if (hasRestart) {
        await br.clickSelector('#ws-restart-from-start');
        await sleep(350);
        await br.screenshot(restartShot);
        restartModalOk = await br.evalJs(`Boolean(document.querySelector('#ws-rfs-city') && document.querySelector('#ws-rfs-campaign'))`);
        await br.evalJs(`document.querySelector('#ws-rfs-cancel')?.click()`);
        await sleep(250);
      }
      await br.clickSelector('#ws-retry-mission');
      await sleep(600);
      for (let i = 0; i < 6; i++) {
        const live = await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-gauntlet]'))`);
        if (live) { retryRelaunchOk = true; break; }
        await br.evalJs(`document.querySelector('#ws-mc-skip, #ws-dialogue-next, #ws-dialogue-continue, [data-choice-id]')?.click()`);
        await sleep(400);
      }
    }

    result.circuitBreach = {
      hubLaunch,
      breachReached,
      breachShot,
      restartModalOk,
      restartShot: breachReached ? restartShot : null,
      retryRelaunchOk,
      stepsLog,
    };
    if (!breachReached) result.failures.push('CIRCUIT BREACH not reached');
    if (breachReached && !restartModalOk) result.failures.push('RESTART modal failed');
    if (breachReached && !retryRelaunchOk) result.failures.push('RETRY relaunch failed');

    result.consoleErrors = br.consoleErrors.slice();
    result.pageExceptions = br.pageExceptions.slice();
    result.httpErrors = br.httpErrors.slice();
    if (br.consoleErrors.length || br.pageExceptions.length || br.httpErrors.length) {
      result.failures.push('Runtime/HTTP errors observed');
    }
  } finally {
    await br.close();
    await srv.close();
  }

  result.passed = result.failures.length === 0;
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
