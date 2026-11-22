#!/usr/bin/env node
/**
 * Pure UI-click live E2E proof of:
 * Campaign Mission ch_1 -> Level Failure (CIRCUIT BREACH) -> RESTART modal -> RETRY relaunch
 */
import path from 'node:path';
import { startDistServer, launchCdpBrowser, sleep } from './rt_e2e_cdp.mjs';

const OUT_DIR = 'C:\\Users\\mshaf\\.gemini\\antigravity\\brain\\5105c2d2-97dc-437b-a862-15ee6ff8bb52';

async function main() {
  const srv = await startDistServer();
  const br = await launchCdpBrowser({ width: 390, height: 844 });
  const out = { breachReached: false, restartModalOk: false, retryRelaunchOk: false, consoleErrors: [], pageExceptions: [], httpErrors: [], steps: [] };
  try {
    await br.setViewport({ width: 390, height: 844, mobile: true, dpr: 2 });
    await br.navigate(srv.baseUrl);
    await br.waitFor(`document.querySelector('[data-title-mode="TRIALS"]')`, 25000, 150);
    await sleep(800);

    // Click Trials on Title -> enters Meridian Hub -> switch to WORLD CIRCUIT tab -> launch ch_1 directly!
    await br.clickSelector('[data-title-mode="TRIALS"]');
    await br.waitFor(`document.querySelector('[data-hub-tab="CAMPAIGN"]')`, 8000, 100);
    await sleep(300);
    await br.clickSelector('[data-hub-tab="CAMPAIGN"]');
    await sleep(400);

    const launchRes = await br.evalJs(`(() => {
      const mBtn = document.querySelector('[data-launch-mission="ch_1"], [data-mission-id="ch_1"], [data-launch-mission]');
      if (mBtn) { mBtn.click(); return 'launched:' + (mBtn.dataset.launchMission || mBtn.dataset.missionId); }
      return Array.from(document.querySelectorAll('button')).map((b) => ({ id: b.id, ds: { ...b.dataset }, txt: b.textContent.trim().slice(0, 40) })).slice(0, 20);
    })()`);
    out.launchRes = launchRes;
    await sleep(600);

    for (let step = 0; step < 30; step++) {
      const st = await br.evalJs(`(() => ({
        hasRetry: Boolean(document.querySelector('#ws-retry-mission')),
        hasVictoryOnly: Boolean(document.querySelector('#ws-summary-continue') && !document.querySelector('#ws-retry-mission')),
        hasSkip: Boolean(document.querySelector('#ws-mc-skip, .ws-mc-btn-skip')),
        hasDialogue: Boolean(document.querySelector('#ws-story-continue, [data-story-choice]')),
        hasNext: Boolean(document.querySelector('#ws-btn-next-q')),
        hasGauntlet: Boolean(document.querySelector('[data-gauntlet]')),
        hasOverclock: Boolean(document.querySelector('#ws-btn-overclock')),
        pts: document.querySelector('#ws-player-pts')?.textContent?.trim() || '',
      }))()`);

      if (st.hasRetry) {
        out.breachReached = true;
        out.steps.push(`step ${step}: CIRCUIT BREACH REACHED`);
        break;
      }
      if (st.hasVictoryOnly) {
        out.steps.push(`step ${step}: won by chance, retrying ch_1`);
        await br.clickSelector('#ws-summary-continue');
        await sleep(500);
        await br.evalJs(`document.querySelector('[data-launch-mission="ch_1"], [data-launch-mission]')?.click()`);
        await sleep(600);
        continue;
      }
      if (st.hasSkip) {
        await br.clickSelector('#ws-mc-skip, .ws-mc-btn-skip');
        await sleep(380);
        continue;
      }
      if (st.hasDialogue) {
        await br.evalJs(`document.querySelector('#ws-story-continue, [data-story-choice]')?.click()`);
        await sleep(380);
        continue;
      }
      if (st.hasNext) {
        await br.clickSelector('#ws-btn-next-q');
        await sleep(380);
        continue;
      }
      if (st.hasGauntlet) {
        await br.clickSelector('[data-gauntlet="DEBUNK"]');
        await sleep(450);
        continue;
      }
      if (st.hasOverclock) {
        // Hold Overclock 560ms on wrong/edge option to shatter shields cleanly -> CIRCUIT BREACH
        await br.evalJs(`(() => {
          const slider = document.querySelector('#ws-calibrator-slider, input[type="range"]');
          if (slider) { slider.value = slider.min; slider.dispatchEvent(new Event('input', { bubbles: true })); }
          const f = document.querySelector('[data-facet-idx="${step % 4}"]') || document.querySelector('[data-facet-idx="0"]');
          if (f && !f.classList.contains('is-sightline')) f.click();
        })()`);
        await sleep(100);
        const pt = await br.evalJs(`(() => { const r = document.querySelector('#ws-btn-overclock').getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2 }; })()`);
        await br.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y });
        await br.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
        await sleep(560);
        await br.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
        await sleep(500);
        continue;
      }
      await sleep(350);
    }

    const breachShot = path.join(OUT_DIR, 'e2e_circuit_breach_live_390x844.png');
    await br.screenshot(breachShot);
    out.breachShot = breachShot;

    if (out.breachReached) {
      out.breachBannerText = await br.evalJs(`document.body.innerText.includes('CIRCUIT BREACH')`);
      await br.clickSelector('#ws-restart-from-start');
      await sleep(320);
      const restartShot = path.join(OUT_DIR, 'e2e_restart_modal_live_390x844.png');
      await br.screenshot(restartShot);
      out.restartShot = restartShot;
      out.restartModalOk = await br.evalJs(`Boolean(document.querySelector('#ws-rfs-city') && document.querySelector('#ws-rfs-campaign'))`);
      await br.evalJs(`document.querySelector('#ws-rfs-cancel')?.click()`);
      await sleep(250);

      await br.clickSelector('#ws-retry-mission');
      await sleep(600);
      for (let i = 0; i < 10; i++) {
        const live = await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock') || document.querySelector('[data-gauntlet]'))`);
        if (live) { out.retryRelaunchOk = true; break; }
        await br.evalJs(`document.querySelector('#ws-mc-skip, #ws-story-continue, [data-story-choice]')?.click()`);
        await sleep(380);
      }
    }

    out.consoleErrors = br.consoleErrors.slice();
    out.pageExceptions = br.pageExceptions.slice();
    out.httpErrors = br.httpErrors.slice();
  } finally {
    await br.close();
    await srv.close();
  }

  out.passed = out.breachReached && out.restartModalOk && out.retryRelaunchOk && out.consoleErrors.length === 0 && out.pageExceptions.length === 0 && out.httpErrors.length === 0;
  console.log(JSON.stringify(out, null, 2));
  if (!out.passed) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
