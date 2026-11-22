#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST — RT-SUBMIT-INPUT-BREAKER Adversarial Submission Fuzzer
// Drives real Headless Edge/Chromium (CDP + WebGL2) against compiled `dist/`
// on an ephemeral port (never touching :8088) across Portrait (390x844, 360x640)
// and Desktop (1280x800), executing 200+ adversarial submission trials across
// all 5 Prism morphs (SIGHTLINE_LOCK, CALIBRATOR_DIAL, CODEX_DUAL_RING,
// GAUNTLET_SHATTER, and 3-step HERO_ARTIFACT_SYNTHESIS).
// ============================================================================

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DIST_DIR = path.join(REPO_ROOT, 'dist');
const GOLD_PACKS_PATH = path.join(REPO_ROOT, 'public', 'data', 'gold_venue_packs.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.hdr': 'application/octet-stream',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findBrowserExecutable() {
  const candidates = [
    process.env.EDGE_PATH,
    process.env.CHROME_PATH,
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Could not locate Microsoft Edge or Google Chrome executable.');
}

function startStaticDistServer() {
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    throw new Error(`dist/index.html not found at ${DIST_DIR}. Run npm run build first.`);
  }
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const urlObj = new URL(req.url || '/', 'http://127.0.0.1');
        let reqPath = decodeURIComponent(urlObj.pathname);
        if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
        const resolved = path.resolve(DIST_DIR, '.' + reqPath);
        if (!resolved.startsWith(DIST_DIR)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }
        let target = resolved;
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
          target = path.join(target, 'index.html');
        }
        if (!fs.existsSync(target)) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        const ext = path.extname(target).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Cache-Control': 'no-store',
        });
        fs.createReadStream(target).pipe(res);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, port: addr.port, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);
      this.ws = ws;
      ws.addEventListener('open', () => resolve());
      ws.addEventListener('error', (err) => reject(err));
      ws.addEventListener('message', (ev) => {
        const msg = JSON.parse(String(ev.data));
        if (msg.id !== undefined) {
          const slot = this.pending.get(msg.id);
          if (slot) {
            this.pending.delete(msg.id);
            if (msg.error) {
              slot.reject(new Error(`CDP ${slot.method} error: ${JSON.stringify(msg.error)}`));
            } else {
              slot.resolve(msg.result);
            }
          }
        } else if (msg.method) {
          const handlers = this.eventListeners.get(msg.method);
          if (handlers) {
            for (const fn of handlers) fn(msg.params);
          }
        }
      });
      ws.addEventListener('close', () => {
        for (const [, slot] of this.pending) {
          slot.reject(new Error('CDP WebSocket closed'));
        }
        this.pending.clear();
      });
    });
  }

  on(method, fn) {
    if (!this.eventListeners.has(method)) this.eventListeners.set(method, []);
    this.eventListeners.get(method).push(fn);
  }

  send(method, params = {}, sessionId = undefined, timeoutMs = 25000) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP ${method} timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
        method,
      });
      this.ws.send(JSON.stringify(payload));
    });
  }

  close() {
    try {
      this.ws?.close();
    } catch {
      // ignore
    }
  }
}

async function launchHeadlessBrowser() {
  const exe = findBrowserExecutable();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-rt-submit-'));
  const args = [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--disable-sync',
    '--mute-audio',
    '--autoplay-policy=no-user-gesture-required',
    '--use-gl=angle',
    '--use-angle=d3d11',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--window-size=1280,800',
    'about:blank',
  ];

  const proc = spawn(exe, args, { stdio: ['ignore', 'pipe', 'pipe'] });

  const wsUrl = await new Promise((resolve, reject) => {
    let stderrBuf = '';
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for DevTools WebSocket. stderr:\n${stderrBuf}`));
    }, 15000);

    proc.stderr.on('data', (chunk) => {
      const s = chunk.toString('utf8');
      stderrBuf += s;
      const m = stderrBuf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    proc.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Browser exited early with code ${code}. stderr:\n${stderrBuf}`));
    });
  });

  const browserCdp = new CdpClient(wsUrl);
  await browserCdp.connect();

  const cleanup = async () => {
    browserCdp.close();
    try {
      proc.kill('SIGKILL');
    } catch {
      // ignore
    }
    await sleep(200);
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  };

  return { proc, browserCdp, cleanup };
}

class PageDriver {
  constructor(cdp, pageTargetId) {
    this.cdp = cdp;
    this.pageTargetId = pageTargetId;
    this.consoleErrors = [];
    this.pageErrors = [];
  }

  async init(viewport) {
    await this.cdp.send('Page.enable');
    await this.cdp.send('Network.enable');
    await this.cdp.send('Network.setBlockedURLs', {
      urls: ['*fonts.googleapis.com*', '*fonts.gstatic.com*'],
    });
    await this.cdp.send('Runtime.enable');
    await this.cdp.send('DOM.enable');
    await this.cdp.send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.dpr ?? 2,
      mobile: viewport.mobile,
      screenWidth: viewport.width,
      screenHeight: viewport.height,
    });
    await this.cdp.send('Emulation.setTouchEmulationEnabled', {
      enabled: viewport.touchEnabled,
      maxTouchPoints: viewport.touchEnabled ? 5 : 1,
    });
    await this.cdp.send('Emulation.setEmitTouchEventsForMouse', {
      enabled: false,
    });

    this.cdp.on('Runtime.exceptionThrown', (params) => {
      const desc = params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'Uncaught exception';
      this.pageErrors.push(desc);
    });
    this.cdp.on('Runtime.consoleAPICalled', (params) => {
      if (params.type === 'error') {
        const msg = (params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
        this.consoleErrors.push(msg);
      }
    });
  }

  async eval(expression) {
    const res = await this.cdp.send('Runtime.evaluate', {
      expression: `(async () => { return (${expression}); })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(
        `Page eval error: ${res.exceptionDetails.text} ${res.exceptionDetails.exception?.description || ''}`,
      );
    }
    return res.result?.value;
  }

  async navigate(url) {
    await this.cdp.send('Page.navigate', { url });
    await this.waitFor(
      () => document.readyState === 'interactive' || document.readyState === 'complete',
      15000,
      'document interactive/complete',
    );
  }

  async waitFor(fnOrExpr, timeoutMs = 15000, label = 'condition') {
    const expr = typeof fnOrExpr === 'function' ? `(${fnOrExpr.toString()})()` : fnOrExpr;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const val = await this.eval(expr);
        if (val) return val;
      } catch {
        // ignore transient during navigation
      }
      await sleep(30);
    }
    const diag = await this.eval(`({
      readyState: document.readyState,
      uiLen: document.getElementById('ui-root')?.innerHTML.length || 0,
      uiHead: (document.getElementById('ui-root')?.innerHTML || '').slice(0, 320),
    })`).catch(() => null);
    throw new Error(
      `Timed out after ${timeoutMs}ms waiting for ${label}. pageErrors=${JSON.stringify(this.pageErrors)} consoleErrors=${JSON.stringify(this.consoleErrors)} diag=${JSON.stringify(diag)}`,
    );
  }

  async getRect(selector) {
    return this.eval(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const visible = cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
      const cx = Math.max(0, Math.min(window.innerWidth - 1, r.left + r.width / 2));
      const cy = Math.max(0, Math.min(window.innerHeight - 1, r.top + r.height / 2));
      const hitEl = document.elementFromPoint(cx, cy);
      const hitMatches = Boolean(hitEl && (hitEl === el || el.contains(hitEl)));
      return {
        left: r.left, top: r.top, right: r.right, bottom: r.bottom,
        width: r.width, height: r.height, cx, cy,
        visible,
        disabled: Boolean(el.disabled),
        hitMatches,
        hitTag: hitEl ? (hitEl.tagName.toLowerCase() + (hitEl.id ? '#' + hitEl.id : '') + (typeof hitEl.className === 'string' && hitEl.className ? '.' + hitEl.className.trim().split(/\\s+/).slice(0,2).join('.') : '')) : null,
        text: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 80),
        inViewport: r.left >= -1 && r.top >= -1 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1,
      };
    })()`);
  }

  // Real CDP Mouse Click (configurable hold duration, jitter dx, and outside-box pointerup!)
  async mousePressMoveRelease({
    startX,
    startY,
    endX = startX,
    endY = startY,
    durationMs = 25,
    steps = 1,
    midCallback = null,
    midCallbackAtMs = null,
  }) {
    const x0 = Math.round(startX);
    const y0 = Math.round(startY);
    const x1 = Math.round(endX);
    const y1 = Math.round(endY);

    await this.cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: x0,
      y: y0,
      button: 'none',
      buttons: 0,
    });
    await this.cdp.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: x0,
      y: y0,
      button: 'left',
      buttons: 1,
      clickCount: 1,
    });

    const t0 = Date.now();
    let midCalled = false;
    const totalSteps = Math.max(1, steps);
    for (let i = 1; i <= totalSteps; i++) {
      const targetElapsed = Math.round((durationMs * i) / totalSteps);
      const wait = targetElapsed - (Date.now() - t0);
      if (wait > 0) await sleep(wait);
      const frac = i / totalSteps;
      const mx = Math.round(x0 + (x1 - x0) * frac);
      const my = Math.round(y0 + (y1 - y0) * frac);
      if (x1 !== x0 || y1 !== y0) {
        await this.cdp.send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: mx,
          y: my,
          button: 'left',
          buttons: 1,
        });
      }
      if (midCallback && !midCalled && midCallbackAtMs !== null && Date.now() - t0 >= midCallbackAtMs) {
        midCalled = true;
        await midCallback();
      }
    }

    const rem = durationMs - (Date.now() - t0);
    if (rem > 0) await sleep(rem);
    if (midCallback && !midCalled) {
      midCalled = true;
      await midCallback();
    }

    await this.cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: x1,
      y: y1,
      button: 'left',
      buttons: 0,
      clickCount: 1,
    });
  }

  // Real CDP Touch Gesture (touchStart -> touchMove* -> touchEnd)
  async touchPressMoveRelease({
    startX,
    startY,
    endX = startX,
    endY = startY,
    durationMs = 25,
    steps = 1,
    midCallback = null,
    midCallbackAtMs = null,
  }) {
    const x0 = Math.round(startX);
    const y0 = Math.round(startY);
    const x1 = Math.round(endX);
    const y1 = Math.round(endY);

    await this.cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: x0, y: y0, id: 1, radiusX: 8, radiusY: 8, force: 1 }],
    });

    const t0 = Date.now();
    let midCalled = false;
    const totalSteps = Math.max(1, steps);
    for (let i = 1; i <= totalSteps; i++) {
      const targetElapsed = Math.round((durationMs * i) / totalSteps);
      const wait = targetElapsed - (Date.now() - t0);
      if (wait > 0) await sleep(wait);
      const frac = i / totalSteps;
      const mx = Math.round(x0 + (x1 - x0) * frac);
      const my = Math.round(y0 + (y1 - y0) * frac);
      if (x1 !== x0 || y1 !== y0) {
        await this.cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: mx, y: my, id: 1, radiusX: 8, radiusY: 8, force: 1 }],
        });
      }
      if (midCallback && !midCalled && midCallbackAtMs !== null && Date.now() - t0 >= midCallbackAtMs) {
        midCalled = true;
        await midCallback();
      }
    }

    const rem = durationMs - (Date.now() - t0);
    if (rem > 0) await sleep(rem);
    if (midCallback && !midCalled) {
      midCalled = true;
      await midCallback();
    }

    await this.cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
  }

  async keyTap(keyName, holdMs = 30) {
    const map = {
      Enter: { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 },
      Space: { key: ' ', code: 'Space', windowsVirtualKeyCode: 32 },
      ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 },
      ArrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft', windowsVirtualKeyCode: 37 },
      ArrowUp: { key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 },
      Escape: { key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 },
    };
    const spec = map[keyName];
    await this.cdp.send('Input.dispatchKeyEvent', {
      type: 'rawKeyDown',
      key: spec.key,
      code: spec.code,
      windowsVirtualKeyCode: spec.windowsVirtualKeyCode,
      nativeVirtualKeyCode: spec.windowsVirtualKeyCode,
    });
    await sleep(holdMs);
    await this.cdp.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: spec.key,
      code: spec.code,
      windowsVirtualKeyCode: spec.windowsVirtualKeyCode,
      nativeVirtualKeyCode: spec.windowsVirtualKeyCode,
    });
  }

  async clickSelectorSafe(selector, timeoutMs = 8000) {
    await this.waitFor(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el || el.disabled) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    })()`, timeoutMs, `clickable ${selector}`);
    await this.eval(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (el) el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
    })()`);
    await sleep(60);
    const rect = await this.getRect(selector);
    if (!rect || !rect.hitMatches) {
      // Fallback to direct DOM click for modal navigation controls if a sticky header overlapped
      await this.eval(`document.querySelector(${JSON.stringify(selector)})?.click()`);
      return;
    }
    await this.mousePressMoveRelease({ startX: rect.cx, startY: rect.cy, durationMs: 25 });
  }
}

async function createPage(browserCdp, viewport) {
  const { targetId } = await browserCdp.send('Target.createTarget', { url: 'about:blank' });
  const wsOrigin = browserCdp.wsUrl.replace(/\/devtools\/browser\/.*$/, '');
  const pageWsUrl = `${wsOrigin}/devtools/page/${targetId}`;
  const pageCdp = new CdpClient(pageWsUrl);
  await pageCdp.connect();
  const page = new PageDriver(pageCdp, targetId);
  await page.init(viewport);
  return {
    page,
    close: async () => {
      pageCdp.close();
      try {
        await browserCdp.send('Target.closeTarget', { targetId });
      } catch {
        // ignore
      }
    },
  };
}

function normKey(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function loadBossChainLookup() {
  const map = new Map();
  try {
    const raw = JSON.parse(fs.readFileSync(GOLD_PACKS_PATH, 'utf8'));
    for (const chain of raw.bossChains || []) {
      for (const st of chain.steps || []) {
        if (st.prompt && st.answerCorrect) {
          map.set(normKey(st.prompt), normKey(st.answerCorrect));
        }
      }
    }
    for (const q of raw.questions || []) {
      if (q.prompt && q.answerCorrect) {
        map.set(normKey(q.prompt), normKey(q.answerCorrect));
      }
    }
  } catch (err) {
    console.warn('Warning: could not parse gold_venue_packs.json:', err.message);
  }
  return map;
}

async function inspectQuestionState(page) {
  return page.eval(`(() => {
    const promptEl = document.querySelector('.ws-question-prompt');
    const overclockEl = document.querySelector('#ws-btn-overclock');
    const peelEl = document.querySelector('#ws-btn-peel');
    const nextBtn = document.querySelector('#ws-btn-next-q');
    const intelFlash = document.querySelector('.ws-intel-flash');
    const facets = Array.from(document.querySelectorAll('[data-facet-idx]')).map((el) => ({
      idx: Number(el.dataset.facetIdx),
      text: (el.querySelector('.ws-facet-text')?.textContent || el.textContent || '').replace(/\\s+/g, ' ').trim(),
      sightline: el.classList.contains('is-sightline'),
      shattered: el.classList.contains('is-shattered'),
      disabled: Boolean(el.disabled),
    }));
    const hasCal = Boolean(document.querySelector('#ws-cal-slider'));
    const hasCodex = Boolean(document.querySelector('[data-codex-subj]'));
    const hasGauntlet = Boolean(document.querySelector('[data-gauntlet]'));
    const hasGlobe = Boolean(document.querySelector('.ws-globe-pin-controls, .ws-globe-anchor-btn'));
    const domainLabel = (document.querySelector('.ws-domain-label')?.textContent || '').replace(/\\s+/g, ' ').trim();
    const isHeroStep = /LATCH|STEP|SYNTHESIS/i.test(domainLabel);
    let morph = 'UNKNOWN';
    if (hasGauntlet) morph = 'GAUNTLET_SHATTER';
    else if (hasGlobe) morph = 'GLOBE_PIN_DROP';
    else if (hasCal) morph = 'CALIBRATOR_DIAL';
    else if (hasCodex) morph = 'CODEX_DUAL_RING';
    else if (facets.length > 0) morph = isHeroStep ? 'HERO_ARTIFACT_SYNTHESIS' : 'SIGHTLINE_LOCK';

    const fillEl = document.querySelector('#ws-overclock-fill');
    const labelEl = document.querySelector('#ws-overclock-label');
    const tierEl = document.querySelector('#ws-tier-badge');
    const chronoEl = document.querySelector('#ws-chrono-text');
    const selectedFacet = facets.find((f) => f.sightline)?.idx ?? null;

    return {
      hasQuestion: Boolean(promptEl),
      prompt: (promptEl?.textContent || '').replace(/\\s+/g, ' ').trim(),
      domainLabel,
      morph,
      revealed: Boolean(intelFlash || nextBtn),
      intelFlashText: (intelFlash?.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 140),
      hasOverclockBtn: Boolean(overclockEl && !overclockEl.disabled),
      hasPeelBtn: Boolean(peelEl && !peelEl.disabled),
      peelLabel: (peelEl?.textContent || '').replace(/\\s+/g, ' ').trim(),
      tierText: (tierEl?.textContent || '').replace(/\\s+/g, ' ').trim(),
      chronoText: (chronoEl?.textContent || '').replace(/\\s+/g, ' ').trim(),
      overclockFillWidth: fillEl ? fillEl.style.width || '0%' : null,
      overclockLabel: (labelEl?.textContent || '').replace(/\\s+/g, ' ').trim(),
      selectedFacet,
      facets,
      hasSummary: Boolean(document.querySelector('#ws-summary-continue, #ws-retry-mission, #ws-endless-deeper')),
      hasBossBanner: Boolean(document.querySelector('#ws-boss-engage')),
      hasCutscene: Boolean(document.querySelector('#ws-mc-skip')),
      hasStoryContinue: Boolean(document.querySelector('#ws-story-continue')),
      hasStoryChoices: Boolean(document.querySelector('[data-story-choice]')),
    };
  })()`);
}

async function dismissInterstitials(page) {
  for (let i = 0; i < 20; i++) {
    const st = await inspectQuestionState(page);
    if (st.hasQuestion && !st.hasBossBanner && !st.hasCutscene) return st;
    if (st.hasCutscene) {
      await page.eval(`document.querySelector('#ws-mc-skip')?.click()`);
      await sleep(120);
      continue;
    }
    if (st.hasBossBanner) {
      await page.eval(`document.querySelector('#ws-boss-engage')?.click()`);
      await sleep(150);
      continue;
    }
    if (st.hasStoryChoices) {
      await page.eval(`document.querySelector('[data-story-choice]')?.click()`);
      await sleep(120);
      continue;
    }
    if (st.hasStoryContinue) {
      await page.eval(`document.querySelector('#ws-story-continue')?.click()`);
      await sleep(120);
      continue;
    }
    await sleep(120);
  }
  return inspectQuestionState(page);
}

async function waitForSubmissionOutcome(page, beforePrompt, beforeDomainLabel, timeoutMs = 900) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const st = await inspectQuestionState(page);
    if (st.revealed) {
      return { submitted: true, reason: 'REVEALED', state: st };
    }
    if (st.hasQuestion && (st.prompt !== beforePrompt || st.domainLabel !== beforeDomainLabel)) {
      return { submitted: true, reason: 'ADVANCED_STEP', state: st };
    }
    await sleep(25);
  }
  const finalState = await inspectQuestionState(page);
  return { submitted: false, reason: 'NO_RESPONSE_TIMEOUT', state: finalState };
}

async function advancePastRevealAndWait(page, prevPrompt, prevDomainLabel) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const st = await inspectQuestionState(page);
    if (!st.revealed) return;
    if (st.hasSummary) return;
    const nextRect = await page.getRect('#ws-btn-next-q');
    if (nextRect && nextRect.visible && nextRect.hitMatches) {
      await page.mousePressMoveRelease({ startX: nextRect.cx, startY: nextRect.cy, durationMs: 22 });
    } else {
      await sleep(160); // clear KeyboardGamepadBridge 140ms detail===0 guard
      await page.eval(`document.querySelector('#ws-btn-next-q')?.click()`);
    }
    const deadline = Date.now() + 2500;
    while (Date.now() < deadline) {
      await sleep(40);
      const cur = await inspectQuestionState(page);
      if (cur.hasSummary || cur.hasBossBanner || cur.hasCutscene || cur.hasStoryContinue) {
        await dismissInterstitials(page);
        return;
      }
      if (cur.hasQuestion && !cur.revealed && (cur.prompt !== prevPrompt || cur.domainLabel !== prevDomainLabel || attempt > 0)) {
        return;
      }
    }
  }
}

async function forceRecoverAndAdvance(page, prevPrompt = '', prevDomainLabel = '') {
  // If a trial failed to submit, use a clean fallback to unlock the next question so the fuzzer keeps going
  let st = await inspectQuestionState(page);
  if (st.hasQuestion && !st.revealed) {
    if (st.morph === 'GAUNTLET_SHATTER') {
      await page.eval(`document.querySelector('[data-gauntlet="VERIFY"]')?.click()`);
    } else if (st.facets.length > 0 && st.selectedFacet !== null) {
      await page.eval(`document.querySelector('[data-facet-idx="${st.selectedFacet}"]')?.click()`);
    } else {
      await page.keyTap('Space', 30);
    }
    await sleep(300);
    st = await inspectQuestionState(page);
    if (st.hasQuestion && !st.revealed) {
      await sleep(320);
      await page.keyTap('Space', 30);
      await sleep(300);
    }
  }
  await advancePastRevealAndWait(page, prevPrompt, prevDomainLabel);
  await dismissInterstitials(page);
}

// ============================================================================
// ADVERSARIAL SUBMISSION SCENARIO EXECUTOR
// ============================================================================
async function runSubmissionTrial(page, viewport, scenario, ctx = {}) {
  const before = await inspectQuestionState(page);
  const morph = before.morph;
  const record = {
    viewport: viewport.name,
    morph,
    scenario,
    passed: false,
    detail: '',
    diag: {},
  };

  if (!before.hasQuestion || before.revealed) {
    record.detail = `Precondition invalid: hasQuestion=${before.hasQuestion} revealed=${before.revealed}`;
    return record;
  }

  // Ensure no leftover focus/timer debounce from previous question advance
  await sleep(ctx.skipSettle ? 0 : 90);

  const ocRect = await page.getRect('#ws-btn-overclock');

  const checkOcRect = () => {
    if (!ocRect || !ocRect.visible) {
      record.detail = `#ws-btn-overclock missing or invisible`;
      record.diag.ocRect = ocRect;
      return false;
    }
    record.diag.ocRect = {
      w: Math.round(ocRect.width),
      h: Math.round(ocRect.height),
      top: Math.round(ocRect.top),
      bottom: Math.round(ocRect.bottom),
      inViewport: ocRect.inViewport,
      hitMatches: ocRect.hitMatches,
      hitTag: ocRect.hitTag,
    };
    if (!ocRect.hitMatches) {
      record.detail = `#ws-btn-overclock occluded at center (${Math.round(ocRect.cx)},${Math.round(ocRect.cy)}) by ${ocRect.hitTag}`;
      return false;
    }
    return true;
  };

  // Pre-interaction for CALIBRATOR / CODEX so real controls are exercised before submit
  if (morph === 'CALIBRATOR_DIAL' && !scenario.startsWith('PEEL_')) {
    const plusBtn = await page.getRect('[data-cal-delta]');
    if (plusBtn && plusBtn.visible && plusBtn.hitMatches) {
      await page.mousePressMoveRelease({ startX: plusBtn.cx, startY: plusBtn.cy, durationMs: 20 });
      await sleep(30);
    }
    const coneBtn = await page.getRect('[data-cone-id="WIDE"]');
    if (coneBtn && coneBtn.visible && coneBtn.hitMatches) {
      await page.mousePressMoveRelease({ startX: coneBtn.cx, startY: coneBtn.cy, durationMs: 20 });
      await sleep(40);
    }
  } else if (morph === 'CODEX_DUAL_RING' && !scenario.startsWith('PEEL_')) {
    for (const sIdx of [0, 1, 2]) {
      const btn = await page.getRect(`[data-codex-subj="${sIdx}"][data-codex-dir="1"]`);
      if (btn && btn.visible && btn.hitMatches) {
        await page.mousePressMoveRelease({ startX: btn.cx, startY: btn.cy, durationMs: 20 });
        await sleep(35);
      }
    }
  } else if (morph === 'GLOBE_PIN_DROP') {
    const anchorBtn = await page.getRect('.ws-globe-anchor-btn');
    if (anchorBtn && anchorBtn.visible && anchorBtn.hitMatches) {
      await page.mousePressMoveRelease({ startX: anchorBtn.cx, startY: anchorBtn.cy, durationMs: 20 });
      await sleep(45);
    }
  }

  // Re-measure #ws-btn-overclock after any Calibrator/Codex re-render
  const liveOc = await page.getRect('#ws-btn-overclock');

  // --------------------------------------------------------------------------
  // GAUNTLET_SHATTER dedicated scenarios
  // --------------------------------------------------------------------------
  if (morph === 'GAUNTLET_SHATTER') {
    if (scenario === 'GAUNTLET_KEY_ARROW') {
      const key = ctx.gauntletKey || 'ArrowRight';
      await page.keyTap(key, 30);
    } else if (scenario === 'GAUNTLET_TOUCH_TAP' && viewport.touchEnabled) {
      const act = ctx.gauntletAction || 'VERIFY';
      const r = await page.getRect(`[data-gauntlet="${act}"]`);
      if (!r || !r.visible || !r.hitMatches) {
        record.detail = `[data-gauntlet="${act}"] missing or occluded (${r?.hitTag})`;
        return record;
      }
      await page.touchPressMoveRelease({ startX: r.cx, startY: r.cy, durationMs: 25 });
    } else {
      const act = ctx.gauntletAction || 'VERIFY';
      const r = await page.getRect(`[data-gauntlet="${act}"]`);
      if (!r || !r.visible || !r.hitMatches) {
        record.detail = `[data-gauntlet="${act}"] missing or occluded (${r?.hitTag})`;
        return record;
      }
      await page.mousePressMoveRelease({ startX: r.cx, startY: r.cy, durationMs: 25 });
    }
    const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel, 900);
    record.passed = out.submitted;
    record.detail = out.submitted ? `Gauntlet submitted (${out.reason})` : `Gauntlet FAILED (${out.reason})`;
    return record;
  }

  // --------------------------------------------------------------------------
  // SCENARIO SWITCH FOR SIGHTLINE_LOCK, CALIBRATOR_DIAL, CODEX_DUAL_RING, HERO_ARTIFACT_SYNTHESIS
  // --------------------------------------------------------------------------
  switch (scenario) {
    case 'RAPID_MOUSE_CLICK_LT40MS': {
      if (!checkOcRect()) return record;
      await page.mousePressMoveRelease({
        startX: liveOc.cx,
        startY: liveOc.cy,
        durationMs: 22,
      });
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted ? `Rapid 22ms mouse click committed` : `FAILED: label="${out.state.overclockLabel}"`;
      return record;
    }

    case 'RAPID_TOUCH_TAP_LT40MS': {
      if (!checkOcRect()) return record;
      if (viewport.touchEnabled) {
        await page.touchPressMoveRelease({
          startX: liveOc.cx,
          startY: liveOc.cy,
          durationMs: 22,
        });
      } else {
        await page.mousePressMoveRelease({
          startX: liveOc.cx,
          startY: liveOc.cy,
          durationMs: 22,
        });
      }
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted ? `Rapid 22ms touch tap committed` : `FAILED: label="${out.state.overclockLabel}"`;
      return record;
    }

    case 'JITTERY_HUMAN_MOUSE_CLICK_35_65PX': {
      if (!checkOcRect()) return record;
      const dx = ctx.jitterPx ?? 52;
      const startX = Math.max(liveOc.left + 12, liveOc.cx - dx / 2);
      const endX = Math.min(liveOc.right - 8, startX + dx);
      const actualDx = Math.round(endX - startX);
      await page.mousePressMoveRelease({
        startX,
        startY: liveOc.cy,
        endX,
        endY: liveOc.cy + 2,
        durationMs: 110,
        steps: 5,
      });
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted
        ? `Jittery 110ms mouse click (dx=${actualDx}px) committed`
        : `FAILED jittery mouse click (dx=${actualDx}px, 110ms): label="${out.state.overclockLabel}"`;
      record.diag.actualDx = actualDx;
      return record;
    }

    case 'JITTERY_HUMAN_TOUCH_TAP_35_65PX': {
      if (!checkOcRect()) return record;
      const dx = ctx.jitterPx ?? 48;
      const startX = Math.max(liveOc.left + 12, liveOc.cx - dx / 2);
      const endX = Math.min(liveOc.right - 8, startX + dx);
      const actualDx = Math.round(endX - startX);
      if (viewport.touchEnabled) {
        await page.touchPressMoveRelease({
          startX,
          startY: liveOc.cy,
          endX,
          endY: liveOc.cy - 2,
          durationMs: 110,
          steps: 5,
        });
      } else {
        await page.mousePressMoveRelease({
          startX,
          startY: liveOc.cy,
          endX,
          endY: liveOc.cy - 2,
          durationMs: 110,
          steps: 5,
        });
      }
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted
        ? `Jittery 110ms touch tap (dx=${actualDx}px) committed`
        : `FAILED jittery touch tap (dx=${actualDx}px, 110ms): label="${out.state.overclockLabel}"`;
      record.diag.actualDx = actualDx;
      return record;
    }

    case 'POINTERUP_4PX_OUTSIDE_BOX': {
      if (!checkOcRect()) return record;
      // Press near top edge inside button, release 4px above top edge (or right edge) outside button box
      const startX = liveOc.cx;
      const startY = liveOc.top + 6;
      const endX = liveOc.cx + 4;
      const endY = Math.max(2, liveOc.top - 4);
      if (viewport.touchEnabled && ctx.useTouch) {
        await page.touchPressMoveRelease({
          startX,
          startY,
          endX,
          endY,
          durationMs: 85,
          steps: 3,
        });
      } else {
        await page.mousePressMoveRelease({
          startX,
          startY,
          endX,
          endY,
          durationMs: 85,
          steps: 3,
        });
      }
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted
        ? `Pointerup 4px outside box committed`
        : `FAILED pointerup 4px outside box: label="${out.state.overclockLabel}"`;
      return record;
    }

    case 'SYNTHETIC_DOM_CLICK': {
      if (!checkOcRect()) return record;
      await page.eval(`document.querySelector('#ws-btn-overclock')?.click()`);
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted
        ? `Synthetic .click() committed`
        : `FAILED synthetic .click(): label="${out.state.overclockLabel}"`;
      return record;
    }

    case 'KEYBOARD_ENTER_TAP': {
      await page.keyTap('Enter', 35);
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted
        ? `Keyboard Enter tap committed`
        : `FAILED Keyboard Enter tap: label="${out.state.overclockLabel}"`;
      return record;
    }

    case 'KEYBOARD_SPACE_TAP': {
      await page.keyTap('Space', 35);
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted
        ? `Keyboard Space tap committed`
        : `FAILED Keyboard Space tap: label="${out.state.overclockLabel}"`;
      return record;
    }

    case 'FACET_B_DOUBLE_TAP_LOCK': {
      // Pick Facet B (idx 1) or first non-selected non-shattered facet
      const targetIdx =
        before.facets.find((f) => f.idx === 1 && !f.shattered && !f.sightline)?.idx ??
        before.facets.find((f) => !f.shattered && !f.sightline)?.idx ??
        1;
      const fRect = await page.getRect(`[data-facet-idx="${targetIdx}"]`);
      if (!fRect || !fRect.visible || !fRect.hitMatches) {
        record.detail = `[data-facet-idx="${targetIdx}"] missing/occluded (${fRect?.hitTag}) inViewport=${fRect?.inViewport}`;
        record.diag.fRect = fRect;
        return record;
      }
      // 1st tap -> select Facet B
      await page.eval(`(() => {
        window.__rtFacetDebug = [];
        const b = document.querySelector('[data-facet-idx="${targetIdx}"]');
        if (b) {
          ['pointerdown','pointerup','mousedown','mouseup','click'].forEach((t) =>
            b.addEventListener(t, (e) => window.__rtFacetDebug.push(t + ':d' + (e.detail ?? '') + ':def' + (e.defaultPrevented ? 1 : 0)), { once: true })
          );
        }
      })()`);
      await page.mousePressMoveRelease({ startX: fRect.cx, startY: fRect.cy, durationMs: 25 });
      let after1 = await inspectQuestionState(page);
      const armDeadline1 = Date.now() + 350;
      while (Date.now() < armDeadline1 && !after1.revealed && after1.selectedFacet !== targetIdx) {
        await sleep(25);
        after1 = await inspectQuestionState(page);
      }
      if (after1.revealed) {
        record.detail = `1st tap on unselected Facet ${targetIdx} prematurely locked!`;
        return record;
      }
      if (after1.selectedFacet !== targetIdx) {
        const dbg = await page.eval(`({ evs: window.__rtFacetDebug, fRectNow: document.querySelector('[data-facet-idx="${targetIdx}"]')?.getBoundingClientRect()?.toJSON?.(), activeTag: document.activeElement?.tagName + '#' + document.activeElement?.id })`);
        record.diag.facetDebug = dbg;
        record.diag.fRectBefore = fRect;
        record.detail = `1st tap on Facet ${targetIdx} failed to arm it (selectedFacet=${after1.selectedFacet}) dbg=${JSON.stringify(dbg)}`;
        return record;
      }
      // 2nd tap -> lock Facet B
      const fRect2 = await page.getRect(`[data-facet-idx="${targetIdx}"]`);
      await page.mousePressMoveRelease({ startX: fRect2.cx, startY: fRect2.cy, durationMs: 25 });
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted
        ? `Facet ${targetIdx} 1st-tap select + 2nd-tap lock committed`
        : `FAILED Facet ${targetIdx} 2nd-tap lock`;
      return record;
    }

    case 'FACET_B_SELECT_THEN_OVERCLOCK': {
      const targetIdx =
        before.facets.find((f) => f.idx === 1 && !f.shattered && !f.sightline)?.idx ??
        before.facets.find((f) => !f.shattered && !f.sightline)?.idx ??
        1;
      const fRect = await page.getRect(`[data-facet-idx="${targetIdx}"]`);
      if (!fRect || !fRect.visible || !fRect.hitMatches) {
        record.detail = `[data-facet-idx="${targetIdx}"] missing/occluded (${fRect?.hitTag}) inViewport=${fRect?.inViewport}`;
        record.diag.fRect = fRect;
        return record;
      }
      await page.eval(`(() => {
        window.__rtFacetDebug = [];
        const b = document.querySelector('[data-facet-idx="${targetIdx}"]');
        if (b) {
          ['pointerdown','pointerup','mousedown','mouseup','click'].forEach((t) =>
            b.addEventListener(t, (e) => window.__rtFacetDebug.push(t + ':d' + (e.detail ?? '') + ':def' + (e.defaultPrevented ? 1 : 0)), { once: true })
          );
        }
      })()`);
      await page.mousePressMoveRelease({ startX: fRect.cx, startY: fRect.cy, durationMs: 25 });
      let after1 = await inspectQuestionState(page);
      const armDeadline2 = Date.now() + 350;
      while (Date.now() < armDeadline2 && !after1.revealed && after1.selectedFacet !== targetIdx) {
        await sleep(25);
        after1 = await inspectQuestionState(page);
      }
      if (after1.revealed || after1.selectedFacet !== targetIdx) {
        const dbg = await page.eval(`({ evs: window.__rtFacetDebug, fRectNow: document.querySelector('[data-facet-idx="${targetIdx}"]')?.getBoundingClientRect()?.toJSON?.(), activeTag: document.activeElement?.tagName + '#' + document.activeElement?.id })`);
        record.diag.facetDebug = dbg;
        record.diag.fRectBefore = fRect;
        record.detail = `1st tap on Facet ${targetIdx} unexpected state: revealed=${after1.revealed} selected=${after1.selectedFacet} dbg=${JSON.stringify(dbg)}`;
        return record;
      }
      const ocAfter = await page.getRect('#ws-btn-overclock');
      if (!ocAfter || !ocAfter.visible || !ocAfter.hitMatches) {
        record.detail = `#ws-btn-overclock occluded after selecting Facet ${targetIdx} (${ocAfter?.hitTag})`;
        return record;
      }
      await page.mousePressMoveRelease({ startX: ocAfter.cx, startY: ocAfter.cy, durationMs: 25 });
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted
        ? `Facet ${targetIdx} select -> #ws-btn-overclock committed`
        : `FAILED Facet ${targetIdx} select -> #ws-btn-overclock`;
      return record;
    }

    case 'PEEL_TIER2_IMMEDIATE_SUBMIT':
    case 'PEEL_TIER3_IMMEDIATE_SUBMIT': {
      const wantTier3 = scenario === 'PEEL_TIER3_IMMEDIATE_SUBMIT';
      const peelClicks = wantTier3 ? 2 : 1;
      for (let p = 0; p < peelClicks; p++) {
        const pRect = await page.getRect('#ws-btn-peel');
        if (!pRect || !pRect.visible || pRect.disabled || !pRect.hitMatches) {
          record.detail = `#ws-btn-peel unavailable on click ${p + 1} (disabled=${pRect?.disabled}, hit=${pRect?.hitTag})`;
          return record;
        }
        await page.mousePressMoveRelease({ startX: pRect.cx, startY: pRect.cy, durationMs: 22 });
        if (p < peelClicks - 1) await sleep(65);
      }
      // Click #ws-btn-overclock RIGHT AFTER Peel (~55ms later — realistic fast player tap!)
      await sleep(55);
      const ocAfterPeel = await page.getRect('#ws-btn-overclock');
      if (!ocAfterPeel || !ocAfterPeel.visible || !ocAfterPeel.hitMatches) {
        record.detail = `#ws-btn-overclock missing/occluded right after Peel Tier ${wantTier3 ? 3 : 2} (${ocAfterPeel?.hitTag})`;
        return record;
      }
      await page.mousePressMoveRelease({
        startX: ocAfterPeel.cx,
        startY: ocAfterPeel.cy,
        durationMs: 25,
      });
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted
        ? `Immediate submit 55ms after Peel Tier ${wantTier3 ? 3 : 2} committed`
        : `FAILED immediate submit 55ms after Peel Tier ${wantTier3 ? 3 : 2} (tier="${out.state.tierText}", label="${out.state.overclockLabel}")`;
      return record;
    }

    case 'PEEL_TIER2_SETTLED_SUBMIT':
    case 'PEEL_TIER3_SETTLED_SUBMIT': {
      const wantTier3 = scenario === 'PEEL_TIER3_SETTLED_SUBMIT';
      const peelClicks = wantTier3 ? 2 : 1;
      for (let p = 0; p < peelClicks; p++) {
        const pRect = await page.getRect('#ws-btn-peel');
        if (!pRect || !pRect.visible || pRect.disabled || !pRect.hitMatches) {
          record.detail = `#ws-btn-peel unavailable on click ${p + 1}`;
          return record;
        }
        await page.mousePressMoveRelease({ startX: pRect.cx, startY: pRect.cy, durationMs: 22 });
        await sleep(80);
      }
      await sleep(260);
      const ocAfterPeel = await page.getRect('#ws-btn-overclock');
      if (!ocAfterPeel || !ocAfterPeel.visible || !ocAfterPeel.hitMatches) {
        record.detail = `#ws-btn-overclock occluded after settled Peel Tier ${wantTier3 ? 3 : 2}`;
        return record;
      }
      await page.mousePressMoveRelease({
        startX: ocAfterPeel.cx,
        startY: ocAfterPeel.cy,
        durationMs: 25,
      });
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = out.submitted;
      record.detail = out.submitted
        ? `Settled submit after Peel Tier ${wantTier3 ? 3 : 2} committed`
        : `FAILED settled submit after Peel Tier ${wantTier3 ? 3 : 2}`;
      return record;
    }

    case 'OVERCLOCK_HOLD_600MS': {
      if (!checkOcRect()) return record;
      let midSnap = null;
      await page.mousePressMoveRelease({
        startX: liveOc.cx,
        startY: liveOc.cy,
        durationMs: 600,
        steps: 6,
        midCallbackAtMs: 480,
        midCallback: async () => {
          await page.eval(`new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
          midSnap = await inspectQuestionState(page);
        },
      });
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      const midWidthPct = parseFloat(midSnap?.overclockFillWidth || '0');
      const charged = midWidthPct > 5 || /OVERCLOCK|MAX|RELEASE/i.test(midSnap?.overclockLabel || '');
      record.passed = out.submitted && charged;
      record.diag.midFill = midSnap?.overclockFillWidth;
      record.diag.midLabel = midSnap?.overclockLabel;
      record.detail = record.passed
        ? `600ms Overclock charged (${midSnap?.overclockFillWidth}) & committed`
        : `FAILED 600ms Overclock: submitted=${out.submitted} charged=${charged} midFill=${midSnap?.overclockFillWidth} midLabel="${midSnap?.overclockLabel}"`;
      return record;
    }

    case 'OVERCLOCK_MAX_6X_HOLD_1100MS': {
      if (!checkOcRect()) return record;
      let peakSnap = null;
      await page.mousePressMoveRelease({
        startX: liveOc.cx,
        startY: liveOc.cy,
        durationMs: 1120,
        steps: 8,
        midCallbackAtMs: 1060,
        midCallback: async () => {
          await page.eval(`new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
          peakSnap = await inspectQuestionState(page);
        },
      });
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      const peakWidthPct = parseFloat(peakSnap?.overclockFillWidth || '0');
      const reachedMax = peakWidthPct >= 95 || /MAX|6\.00x/i.test(peakSnap?.overclockLabel || '');
      record.passed = out.submitted && reachedMax;
      record.diag.peakFill = peakSnap?.overclockFillWidth;
      record.diag.peakLabel = peakSnap?.overclockLabel;
      record.detail = record.passed
        ? `1100ms 6.0x Max Overclock reached (${peakSnap?.overclockFillWidth}) & committed`
        : `FAILED 1100ms Max Overclock: submitted=${out.submitted} reachedMax=${reachedMax} peakFill=${peakSnap?.overclockFillWidth} peakLabel="${peakSnap?.overclockLabel}"`;
      return record;
    }

    case 'BLUFF_ECHO_95PX_CANCEL_THEN_FRESH_CLICK':
    case 'BLUFF_ECHO_95PX_DELAYED_RELEASE_THEN_FRESH_CLICK': {
      if (!checkOcRect()) return record;
      const delayedRelease = scenario === 'BLUFF_ECHO_95PX_DELAYED_RELEASE_THEN_FRESH_CLICK';
      // Hold >= 340ms (actively charging Overclock) then deliberately slide >= 95px horizontally to vent Bluff Echo!
      const slideDir = liveOc.left + 125 <= viewport.width - 8 ? 1 : -1;
      const slideStartX = slideDir > 0 ? liveOc.left + 16 : liveOc.right - 16;
      const slideDist = 105 * slideDir;
      const slideEndX = slideStartX + slideDist;
      // Step 1: press & hold stationary for 340ms to enter CHARGING
      await page.cdp.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: Math.round(slideStartX),
        y: Math.round(liveOc.cy),
        button: 'none',
        buttons: 0,
      });
      await page.cdp.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: Math.round(slideStartX),
        y: Math.round(liveOc.cy),
        button: 'left',
        buttons: 1,
        clickCount: 1,
      });
      await sleep(340);
      // Step 2: slide 105px horizontally in 5 steps over 80ms
      for (let i = 1; i <= 5; i++) {
        const mx = Math.round(slideStartX + (slideDist * i) / 5);
        await page.cdp.send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: mx,
          y: Math.round(liveOc.cy),
          button: 'left',
          buttons: 1,
        });
        await sleep(16);
      }
      if (delayedRelease) {
        // Hold mouse down 360ms after venting before releasing INSIDE button box!
        await sleep(360);
      }
      await page.cdp.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: Math.round(slideEndX),
        y: Math.round(liveOc.cy),
        button: 'left',
        buttons: 0,
        clickCount: 1,
      });
      await sleep(140);

      const afterBluff = await inspectQuestionState(page);
      if (afterBluff.revealed || afterBluff.prompt !== before.prompt) {
        record.detail = `Bluff Echo >=95px slide${delayedRelease ? ' (360ms delayed release)' : ''} accidentally SUBMITTED instead of venting!`;
        return record;
      }
      const ventedCleanly = /BLUFF|VENTED|SAFE LOCK|LOCK/i.test(afterBluff.overclockLabel) && parseFloat(afterBluff.overclockFillWidth || '0') <= 1;

      // Step 3: Immediately perform a fresh click on #ws-btn-overclock!
      const freshOc = await page.getRect('#ws-btn-overclock');
      await page.mousePressMoveRelease({
        startX: freshOc.cx,
        startY: freshOc.cy,
        durationMs: 28,
      });
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      record.passed = ventedCleanly && out.submitted;
      record.diag.afterBluffLabel = afterBluff.overclockLabel;
      record.diag.afterBluffFill = afterBluff.overclockFillWidth;
      record.detail = record.passed
        ? `Bluff Echo 105px${delayedRelease ? ' (delayed release)' : ''} vented cleanly & fresh click committed`
        : `FAILED Bluff Echo -> fresh click: vented=${ventedCleanly} freshSubmitted=${out.submitted} afterBluffLabel="${afterBluff.overclockLabel}"`;
      return record;
    }

    case 'MODAL_CLOSE_THEN_OVERCLOCK_SUBMIT': {
      // Open Vault drawer mid-question (or Dossier/Leave), close it via Escape, then verify Overclock STILL binds & charges!
      const vaultBtn = await page.getRect('#ws-util-vault');
      if (vaultBtn && vaultBtn.visible && vaultBtn.hitMatches) {
        await page.mousePressMoveRelease({ startX: vaultBtn.cx, startY: vaultBtn.cy, durationMs: 25 });
        await sleep(120);
        await page.keyTap('Escape', 30);
        await sleep(120);
      }
      const ocAfterModal = await page.getRect('#ws-btn-overclock');
      if (!ocAfterModal || !ocAfterModal.visible || !ocAfterModal.hitMatches) {
        record.detail = `#ws-btn-overclock missing/occluded after closing Vault drawer (${ocAfterModal?.hitTag})`;
        return record;
      }
      let midSnap = null;
      await page.mousePressMoveRelease({
        startX: ocAfterModal.cx,
        startY: ocAfterModal.cy,
        durationMs: 600,
        steps: 6,
        midCallbackAtMs: 480,
        midCallback: async () => {
          await page.eval(`new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
          midSnap = await inspectQuestionState(page);
        },
      });
      const out = await waitForSubmissionOutcome(page, before.prompt, before.domainLabel);
      const midWidthPct = parseFloat(midSnap?.overclockFillWidth || '0');
      const charged = midWidthPct > 5 || /OVERCLOCK|MAX|RELEASE/i.test(midSnap?.overclockLabel || '');
      record.passed = out.submitted && charged;
      record.diag.midFill = midSnap?.overclockFillWidth;
      record.diag.midLabel = midSnap?.overclockLabel;
      record.detail = record.passed
        ? `Mid-question Vault open/close -> 600ms Overclock charged (${midSnap?.overclockFillWidth}) & committed`
        : `FAILED post-modal Overclock: submitted=${out.submitted} charged=${charged} midFill=${midSnap?.overclockFillWidth} midLabel="${midSnap?.overclockLabel}"`;
      return record;
    }

    default:
      record.detail = `Unknown scenario ${scenario}`;
      return record;
  }
}

// ============================================================================
// MODE LAUNCHERS & TRIAL ORCHESTRATION
// ============================================================================

async function waitForAppBoot(page) {
  await page.waitFor(
    `(() => {
      const btn = document.querySelector('#ws-title-enter-cta, [data-title-mode="BRIEFING"], [data-title-mode="DAILY"]');
      return Boolean(btn && btn.getBoundingClientRect().width > 0);
    })()`,
    20000,
    'Title screen ready',
  );
  // Wait until Forge catalog + campaign JSON finish async bootAsync() hydration (avoids mid-click title re-render!)
  await page
    .waitFor(
      `(() => {
        const txt = document.querySelector('.ws-title-verified-count, .ws-title-pedestal')?.textContent || '';
        const m = txt.match(/([0-9,]+)\\s+Verified/i);
        if (!m) return false;
        const n = Number(m[1].replace(/,/g, ''));
        return n > 1_000_000;
      })()`,
      8000,
      'Forge catalog hydration',
    )
    .catch(() => {});
  await sleep(300);
}

async function clickUntilTargetAppears(page, triggerSel, targetSel, timeoutMs = 12000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const hasTarget = await page.eval(`Boolean(document.querySelector(${JSON.stringify(targetSel)}))`);
    if (hasTarget) return;
    await page.clickSelectorSafe(triggerSel, 5000);
    await sleep(250);
  }
  await page.waitFor(`Boolean(document.querySelector(${JSON.stringify(targetSel)}))`, 2000, targetSel);
}

async function launchBriefingMarathon(page, count = 50) {
  await clickUntilTargetAppears(page, '[data-title-mode="BRIEFING"]', '#ws-cat-launch, #ws-open-briefing-modal');
  const hasCatLaunch = await page.eval(`Boolean(document.querySelector('#ws-cat-launch'))`);
  if (!hasCatLaunch) {
    await clickUntilTargetAppears(page, '#ws-open-briefing-modal', '#ws-cat-launch');
  }
  await page.clickSelectorSafe(`[data-len="${count}"]`, 10000);
  await sleep(100);
  await page.clickSelectorSafe('#ws-cat-launch', 10000);
  await page.waitFor(
    `Boolean(document.querySelector('.ws-question-prompt'))`,
    15000,
    `Briefing ${count}-Q start`,
  );
}

async function launchDailyBroadcast(page) {
  await clickUntilTargetAppears(page, '[data-title-mode="DAILY"]', '.ws-question-prompt, #ws-launch-daily');
  const alreadyPlaying = await page.eval(`Boolean(document.querySelector('.ws-question-prompt'))`);
  if (!alreadyPlaying) {
    await page.clickSelectorSafe('#ws-launch-daily', 10000);
  }
  await page.waitFor(
    `Boolean(document.querySelector('.ws-question-prompt'))`,
    15000,
    'Daily Broadcast start',
  );
}

async function seedSaveForGenevaBossAndLaunch(page, baseUrl) {
  await page.eval(`(() => {
    localStorage.clear();
    const bb = {
      schemaVersion: 2,
      prologueComplete: true,
      firstFlight: 'GB',
      completedMissions: ['ch_1', 'ch_2', 'ch_3', 'ch_4'],
      branchFlags: { unlocked_hub_ch: true },
      perks: [],
      unlockedClues: [],
      unlockedRelics: [],
      newCircuitPlusCount: 0,
      bonds: { vance: 10, nadia: 10, soren: 0, teo: 10, lindqvist: 0, tariq: 0 },
      failedMissions: {},
    };
    localStorage.setItem('ws_ink_blackboard_v2', JSON.stringify(bb));
    localStorage.setItem('ws_challenger_name', 'RedTeam');
    const passport = {
      schemaVersion: 2,
      challengerName: 'RedTeam',
      origin: 'STRATEGIST',
      persona: 'SYNTHESIST',
      bookmarks: [],
      domainMastery: {},
    };
    localStorage.setItem('ws_meridian_passport_v2', JSON.stringify(passport));
  })()`);
  await page.navigate(baseUrl);
  await waitForAppBoot(page);

  await clickUntilTargetAppears(page, '[data-title-mode="CAMPAIGN"]', '[data-mission-id="ch_5"], [data-city-hub="ch"]', 15000);
  const hasCh5 = await page.eval(`Boolean(document.querySelector('[data-mission-id="ch_5"]'))`);
  if (!hasCh5) {
    await clickUntilTargetAppears(page, '[data-city-hub="ch"]', '[data-mission-id="ch_5"], .ws-question-prompt, #ws-boss-engage', 10000);
  }
  const hasCh5Now = await page.eval(`Boolean(document.querySelector('[data-mission-id="ch_5"]'))`);
  if (hasCh5Now) {
    await page.clickSelectorSafe('[data-mission-id="ch_5"]', 10000);
  }
  await sleep(250);
  await dismissInterstitials(page);
  await page.waitFor(
    `Boolean(document.querySelector('.ws-question-prompt'))`,
    15000,
    'ch_5 Boss gameplay start',
  );
}

function buildScenarioQueueForMorph(morph, viewport, counter) {
  if (morph === 'GAUNTLET_SHATTER') {
    const seq = viewport.touchEnabled
      ? ['GAUNTLET_TOUCH_TAP', 'GAUNTLET_MOUSE', 'GAUNTLET_KEY_ARROW']
      : ['GAUNTLET_MOUSE', 'GAUNTLET_KEY_ARROW'];
    return seq[counter % seq.length];
  }
  if (morph === 'GLOBE_PIN_DROP') {
    const seq = [
      'RAPID_MOUSE_CLICK_LT40MS',
      'JITTERY_HUMAN_MOUSE_CLICK_35_65PX',
      'POINTERUP_4PX_OUTSIDE_BOX',
      'SYNTHETIC_DOM_CLICK',
      'KEYBOARD_SPACE_TAP',
      'PEEL_TIER2_IMMEDIATE_SUBMIT',
      'OVERCLOCK_HOLD_600MS',
      'BLUFF_ECHO_95PX_CANCEL_THEN_FRESH_CLICK',
    ];
    return seq[counter % seq.length];
  }
  if (morph === 'CALIBRATOR_DIAL') {
    const seq = [
      'RAPID_MOUSE_CLICK_LT40MS',
      'JITTERY_HUMAN_MOUSE_CLICK_35_65PX',
      'POINTERUP_4PX_OUTSIDE_BOX',
      'SYNTHETIC_DOM_CLICK',
      'KEYBOARD_SPACE_TAP',
      'PEEL_TIER2_IMMEDIATE_SUBMIT',
      'OVERCLOCK_HOLD_600MS',
      'BLUFF_ECHO_95PX_CANCEL_THEN_FRESH_CLICK',
    ];
    return seq[counter % seq.length];
  }
  if (morph === 'CODEX_DUAL_RING') {
    const seq = [
      'RAPID_MOUSE_CLICK_LT40MS',
      'JITTERY_HUMAN_MOUSE_CLICK_35_65PX',
      'POINTERUP_4PX_OUTSIDE_BOX',
      'SYNTHETIC_DOM_CLICK',
      'KEYBOARD_ENTER_TAP',
      'PEEL_TIER2_IMMEDIATE_SUBMIT',
      'OVERCLOCK_HOLD_600MS',
    ];
    return seq[counter % seq.length];
  }
  // SIGHTLINE_LOCK — hit EVERY single adversarial scenario repeatedly!
  const seq = [
    'RAPID_MOUSE_CLICK_LT40MS',
    'RAPID_TOUCH_TAP_LT40MS',
    'JITTERY_HUMAN_MOUSE_CLICK_35_65PX',
    'JITTERY_HUMAN_TOUCH_TAP_35_65PX',
    'POINTERUP_4PX_OUTSIDE_BOX',
    'SYNTHETIC_DOM_CLICK',
    'KEYBOARD_ENTER_TAP',
    'KEYBOARD_SPACE_TAP',
    'FACET_B_DOUBLE_TAP_LOCK',
    'FACET_B_SELECT_THEN_OVERCLOCK',
    'PEEL_TIER2_IMMEDIATE_SUBMIT',
    'PEEL_TIER3_IMMEDIATE_SUBMIT',
    'PEEL_TIER2_SETTLED_SUBMIT',
    'PEEL_TIER3_SETTLED_SUBMIT',
    'OVERCLOCK_HOLD_600MS',
    'OVERCLOCK_MAX_6X_HOLD_1100MS',
    'BLUFF_ECHO_95PX_CANCEL_THEN_FRESH_CLICK',
    'BLUFF_ECHO_95PX_DELAYED_RELEASE_THEN_FRESH_CLICK',
    'MODAL_CLOSE_THEN_OVERCLOCK_SUBMIT',
  ];
  return seq[counter % seq.length];
}

async function runBriefingOrDailyRun(page, viewport, results, morphCounters, maxQuestions = 50) {
  const jitterDistances = [35, 45, 52, 60, 65];
  const gauntletActions = ['VERIFY', 'DEBUNK', 'CHALLENGE'];
  const gauntletKeys = ['ArrowRight', 'ArrowLeft', 'ArrowUp'];

  for (let q = 0; q < maxQuestions; q++) {
    const st = await dismissInterstitials(page);
    if (st.hasSummary || !st.hasQuestion) break;

    const morph = st.morph;
    const idx = morphCounters[morph] || 0;
    morphCounters[morph] = idx + 1;

    const scenario = buildScenarioQueueForMorph(morph, viewport, idx);
    const res = await runSubmissionTrial(page, viewport, scenario, {
      jitterPx: jitterDistances[idx % jitterDistances.length],
      useTouch: idx % 2 === 1,
      gauntletAction: gauntletActions[idx % gauntletActions.length],
      gauntletKey: gauntletKeys[idx % gauntletKeys.length],
    });
    results.push(res);
    if (!res.passed) {
      console.log(`    [FAIL] ${viewport.name} | Q${q + 1} | ${res.morph} | ${res.scenario} -> ${res.detail}`);
    } else if ((q + 1) % 10 === 0) {
      const slicePass = results.slice(-10).filter((r) => r.passed).length;
      console.log(`    [OK]   ${viewport.name} | progress Q${q + 1}/${maxQuestions} (last 10: ${slicePass}/10)`);
    }

    if (!res.passed) {
      await forceRecoverAndAdvance(page, st.prompt, st.domainLabel);
    } else {
      await advancePastRevealAndWait(page, st.prompt, st.domainLabel);
    }
  }
}

async function runHeroSynthesisBossTest(page, viewport, baseUrl, results, bossLookup) {
  await seedSaveForGenevaBossAndLaunch(page, baseUrl);
  let heroTested = false;
  let guard = 0;

  while (guard < 16) {
    guard++;
    const st = await dismissInterstitials(page);
    if (st.hasSummary || !st.hasQuestion) break;

    if (st.morph === 'HERO_ARTIFACT_SYNTHESIS') {
      heroTested = true;
      // Execute ALL 3 steps of HERO_ARTIFACT_SYNTHESIS!
      const stepScenarios = [
        'JITTERY_HUMAN_MOUSE_CLICK_35_65PX',
        'RAPID_TOUCH_TAP_LT40MS',
        'OVERCLOCK_HOLD_600MS',
      ];
      for (let stepIdx = 0; stepIdx < 3; stepIdx++) {
        const stepSt = await inspectQuestionState(page);
        if (!stepSt.hasQuestion || stepSt.revealed) break;

        // Look up the correct answer in gold_venue_packs.json so Steps 1 & 2 unlock the next mechanical latch!
        const wantAns = bossLookup.get(normKey(stepSt.prompt));
        if (wantAns) {
          const matchFacet = stepSt.facets.find(
            (f) => normKey(f.text).includes(wantAns) || wantAns.includes(normKey(f.text)),
          );
          if (matchFacet && !matchFacet.sightline) {
            const fRect = await page.getRect(`[data-facet-idx="${matchFacet.idx}"]`);
            if (fRect && fRect.visible && fRect.hitMatches) {
              await page.mousePressMoveRelease({ startX: fRect.cx, startY: fRect.cy, durationMs: 25 });
              await sleep(60);
            }
          }
        }

        const scenario = stepScenarios[stepIdx];
        const res = await runSubmissionTrial(page, viewport, scenario, {
          jitterPx: 50,
          skipSettle: stepIdx === 1, // Deliberately test rapid click right after Step 1 advances to Step 2!
        });
        res.morph = `HERO_ARTIFACT_SYNTHESIS_STEP_${stepIdx + 1}`;
        results.push(res);
        if (!res.passed) {
          console.log(`    [FAIL] ${viewport.name} | ${res.morph} | ${res.scenario} -> ${res.detail}`);
          await forceRecoverAndAdvance(page, stepSt.prompt, stepSt.domainLabel);
          break;
        }
        // Small frame settle so Step 2 DOM is mounted, then immediately submit!
        if (stepIdx < 2) {
          await sleep(45);
        }
      }
      // Advance past Boss Relic reveal if revealed
      const afterHero = await inspectQuestionState(page);
      if (afterHero.revealed) {
        await advancePastRevealAndWait(page, afterHero.prompt, afterHero.domainLabel);
      }
      continue;
    }

    // Play Phase I & Phase III normally (picking correct answer if known so shields survive into Phase II!)
    if (st.morph === 'GAUNTLET_SHATTER') {
      const res = await runSubmissionTrial(page, viewport, 'GAUNTLET_MOUSE', {
        gauntletAction: 'VERIFY',
      });
      results.push(res);
      if (!res.passed) {
        console.log(`    [FAIL] ${viewport.name} | ${res.morph} | ${res.scenario} -> ${res.detail}`);
        await forceRecoverAndAdvance(page, st.prompt, st.domainLabel);
      } else {
        await advancePastRevealAndWait(page, st.prompt, st.domainLabel);
      }
    } else {
      const wantAns = bossLookup.get(normKey(st.prompt));
      if (wantAns && st.facets.length > 0) {
        const matchFacet = st.facets.find(
          (f) => normKey(f.text).includes(wantAns) || wantAns.includes(normKey(f.text)),
        );
        if (matchFacet && !matchFacet.sightline) {
          const fRect = await page.getRect(`[data-facet-idx="${matchFacet.idx}"]`);
          if (fRect && fRect.visible) {
            await page.mousePressMoveRelease({ startX: fRect.cx, startY: fRect.cy, durationMs: 22 });
            await sleep(50);
          }
        }
      }
      const res = await runSubmissionTrial(page, viewport, 'RAPID_MOUSE_CLICK_LT40MS');
      results.push(res);
      if (!res.passed) {
        console.log(`    [FAIL] ${viewport.name} | ${res.morph} | ${res.scenario} -> ${res.detail}`);
        await forceRecoverAndAdvance(page, st.prompt, st.domainLabel);
      } else {
        await advancePastRevealAndWait(page, st.prompt, st.domainLabel);
      }
    }
  }

  if (!heroTested) {
    results.push({
      viewport: viewport.name,
      morph: 'HERO_ARTIFACT_SYNTHESIS',
      scenario: 'REACH_BOSS_PHASE_2',
      passed: false,
      detail: 'Did not reach HERO_ARTIFACT_SYNTHESIS in ch_5 Boss Showdown!',
      diag: {},
    });
  }
}

function summarizeResults(results) {
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const byScenario = {};
  const byViewport = {};
  const byMorph = {};
  const failures = [];

  for (const r of results) {
    for (const [bucket, key] of [
      [byScenario, r.scenario],
      [byViewport, r.viewport],
      [byMorph, r.morph],
    ]) {
      if (!bucket[key]) bucket[key] = { passed: 0, total: 0, pct: 0 };
      bucket[key].total++;
      if (r.passed) bucket[key].passed++;
    }
    if (!r.passed) failures.push(r);
  }
  for (const bucket of [byScenario, byViewport, byMorph]) {
    for (const k of Object.keys(bucket)) {
      bucket[k].pct = Number(((bucket[k].passed / bucket[k].total) * 100).toFixed(1));
    }
  }
  return {
    total,
    passed,
    failed: total - passed,
    passRatePct: Number(((passed / Math.max(1, total)) * 100).toFixed(1)),
    byViewport,
    byMorph,
    byScenario,
    failures,
  };
}

async function main() {
  const outArg = process.argv.find((a) => a.startsWith('--out='));
  const outPath = outArg ? outArg.slice('--out='.length) : null;
  const vpFilterArg = process.argv.find((a) => a.startsWith('--viewport='));
  const vpFilter = vpFilterArg ? vpFilterArg.slice('--viewport='.length) : null;
  const dailyOnly = process.argv.includes('--daily-only');
  const startCounterArg = process.argv.find((a) => a.startsWith('--start-counter='));
  const startCounter = startCounterArg ? Number(startCounterArg.slice('--start-counter='.length)) || 0 : 0;

  const bossLookup = loadBossChainLookup();
  const { server, port, baseUrl } = await startStaticDistServer();
  console.log(`[RT-SUBMIT] Serving dist/ on ephemeral ${baseUrl} (port ${port})`);

  const { browserCdp, cleanup } = await launchHeadlessBrowser();
  const results = [];
  const allConsoleErrors = [];
  const allPageErrors = [];

  const allViewports = [
    { name: 'PORTRAIT_390x844', width: 390, height: 844, dpr: 2, mobile: true, touchEnabled: true, briefingCount: 50, extraBriefing: 10, runDaily: true, runBoss: true },
    { name: 'PORTRAIT_360x640', width: 360, height: 640, dpr: 2, mobile: true, touchEnabled: true, briefingCount: 50, extraBriefing: 10, runDaily: true, runBoss: true },
    { name: 'DESKTOP_1280x800', width: 1280, height: 800, dpr: 1, mobile: false, touchEnabled: false, briefingCount: 50, extraBriefing: 10, runDaily: true, runBoss: true },
  ];
  const viewports = vpFilter ? allViewports.filter((v) => v.name === vpFilter) : allViewports;

  const tStart = Date.now();
  try {
    for (const vp of viewports) {
      console.log(`\n[RT-SUBMIT] === Viewport ${vp.name} (${vp.width}x${vp.height}, touch=${vp.touchEnabled}) ===`);
      const morphCounters = startCounter ? { SIGHTLINE_LOCK: startCounter } : {};

      // 1. Briefing 50-Q Marathon
      if (!dailyOnly) {
        const { page, close } = await createPage(browserCdp, vp);
        try {
          await page.navigate(baseUrl);
          await waitForAppBoot(page);
          await launchBriefingMarathon(page, vp.briefingCount);
          const beforeLen = results.length;
          await runBriefingOrDailyRun(page, vp, results, morphCounters, vp.briefingCount);
          const runSlice = results.slice(beforeLen);
          const runPass = runSlice.filter((r) => r.passed).length;
          console.log(`  Briefing ${vp.briefingCount}-Q: ${runPass}/${runSlice.length} passed`);
          allConsoleErrors.push(...page.consoleErrors);
          allPageErrors.push(...page.pageErrors);
        } finally {
          await close();
        }
      }

      // 1b. Extra 10-Q Briefing (ensures >= 220 total trials across all 3 viewports!)
      if (!dailyOnly && vp.extraBriefing) {
        const { page, close } = await createPage(browserCdp, vp);
        try {
          await page.navigate(baseUrl);
          await waitForAppBoot(page);
          await launchBriefingMarathon(page, vp.extraBriefing);
          const beforeLen = results.length;
          await runBriefingOrDailyRun(page, vp, results, morphCounters, vp.extraBriefing);
          const runSlice = results.slice(beforeLen);
          const runPass = runSlice.filter((r) => r.passed).length;
          console.log(`  Briefing Extra ${vp.extraBriefing}-Q: ${runPass}/${runSlice.length} passed`);
          allConsoleErrors.push(...page.consoleErrors);
          allPageErrors.push(...page.pageErrors);
        } finally {
          await close();
        }
      }

      // 2. Daily 10-Q Broadcast (guaranteed Sightline, Gauntlet, Calibrator, Codex!)
      if (vp.runDaily) {
        const { page, close } = await createPage(browserCdp, vp);
        try {
          await page.navigate(baseUrl);
          await waitForAppBoot(page);
          await launchDailyBroadcast(page);
          const beforeLen = results.length;
          await runBriefingOrDailyRun(page, vp, results, morphCounters, 10);
          const runSlice = results.slice(beforeLen);
          const runPass = runSlice.filter((r) => r.passed).length;
          console.log(`  Daily 10-Q: ${runPass}/${runSlice.length} passed`);
          allConsoleErrors.push(...page.consoleErrors);
          allPageErrors.push(...page.pageErrors);
        } finally {
          await close();
        }
      }

      // 3. Geneva Boss Showdown ch_5 (3-step HERO_ARTIFACT_SYNTHESIS + Boss Phase I/II/III!)
      if (!dailyOnly && vp.runBoss) {
        const { page, close } = await createPage(browserCdp, vp);
        try {
          await page.navigate(baseUrl);
          await waitForAppBoot(page);
          const beforeLen = results.length;
          await runHeroSynthesisBossTest(page, vp, baseUrl, results, bossLookup);
          const runSlice = results.slice(beforeLen);
          const runPass = runSlice.filter((r) => r.passed).length;
          console.log(`  Boss ch_5 (3-step HERO_ARTIFACT_SYNTHESIS): ${runPass}/${runSlice.length} passed`);
          allConsoleErrors.push(...page.consoleErrors);
          allPageErrors.push(...page.pageErrors);
        } finally {
          await close();
        }
      }
    }
  } finally {
    await cleanup();
    server.close();
  }

  const elapsedSec = ((Date.now() - tStart) / 1000).toFixed(1);
  const summary = summarizeResults(results);
  summary.elapsedSec = Number(elapsedSec);
  summary.consoleErrorCount = allConsoleErrors.length;
  summary.pageErrorCount = allPageErrors.length;

  console.log('\n============================================================================');
  console.log(`RT-SUBMIT-INPUT-BREAKER SUMMARY (${elapsedSec}s): ${summary.passed} / ${summary.total} (${summary.passRatePct}%)`);
  console.log('============================================================================');
  console.log('\nBy Viewport:');
  for (const [k, v] of Object.entries(summary.byViewport)) {
    console.log(`  ${k.padEnd(20)} ${v.passed}/${v.total} (${v.pct}%)`);
  }
  console.log('\nBy Morph:');
  for (const [k, v] of Object.entries(summary.byMorph)) {
    console.log(`  ${k.padEnd(32)} ${v.passed}/${v.total} (${v.pct}%)`);
  }
  console.log('\nBy Scenario:');
  for (const [k, v] of Object.entries(summary.byScenario)) {
    console.log(`  ${k.padEnd(42)} ${v.passed}/${v.total} (${v.pct}%)`);
  }

  if (summary.failures.length > 0) {
    console.log(`\nSample Failures (${summary.failures.length} total, showing first 25):`);
    for (const f of summary.failures.slice(0, 25)) {
      console.log(`  [FAIL] ${f.viewport} | ${f.morph} | ${f.scenario} -> ${f.detail}`);
    }
  }
  if (allPageErrors.length > 0) {
    console.log(`\nPage Exceptions (${allPageErrors.length}):`, allPageErrors.slice(0, 5));
  }

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
    console.log(`\nWrote JSON report to ${outPath}`);
  }

  process.exit(summary.failed === 0 && summary.total >= 200 ? 0 : 1);
}

main().catch((err) => {
  console.error('[RT-SUBMIT] FATAL:', err);
  process.exit(2);
});
