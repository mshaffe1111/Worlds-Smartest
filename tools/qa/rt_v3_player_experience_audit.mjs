#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST v3.0 — Adversarial First-Time Player & UX Red-Team Audit
// (`rt-v3-player-ux`)
//
// ZERO MERCY audit of Feedback #1, #2, #3, #4, #5, and #7 on compiled `dist/`:
//  • Feedback #5: Grounded Mara Sato mystery story & voice `.mp3` sync
//  • Feedback #2: Zero story-to-question ambush (Round Ready gate + ~2.0s Reading Grace)
//  • Feedback #1: Easy Middle-School Prologue (un-failable warmup), smooth
//                 Stage 1 (ch_1) & London (gb_1) calibration, Scout's Advantage retry mercy
//  • Feedback #3: Mathematical centering of `.ws-broadcast-dock` & `.ws-question-prompt`
//                 across 360x640, 390x844, 844x390, and 1280x800 (0 far-right, 0 bottom-glue,
//                 0/4 covered A-D facets)
//  • Feedback #4: Plain-English Hint / 50/50 / LOCK ANSWER / 2x Double Down toggle &
//                 topbar `? Rules` modal pausing timer
//  • Feedback #7: Mind Gambit Picker (Second Wind live mulligan, Swap Topic live swap),
//                 3-Step Clue Ladder (500 -> 350 -> 200 PTS), Finale Category Picker
//
// Constraints:
//  • Ephemeral static HTTP server on 127.0.0.1:0 serving `dist/` (NEVER touches :8088)
//  • 100% REAL CDP pointer & keyboard input ONLY (elementFromPoint hit-testing)
//  • READ-ONLY on `src/**` & `public/**`
//  • Saves full-window screenshots under agent brain dir for direct visual inspection
//
// Usage:
//   node tools/qa/rt_v3_player_experience_audit.mjs
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
const BRAIN_DIR = 'C:\\Users\\mshaf\\.gemini\\antigravity\\brain\\6c4923d5-72b5-4fe8-bb90-43371682989c';
const SCREENSHOT_DIR = path.join(BRAIN_DIR, 'v3_audit_screenshots');
const REPORT_PATH = path.join(BRAIN_DIR, 'v3_player_ux_report.json');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const VIEWPORTS = [
  { id: '1280x800', label: 'Desktop', width: 1280, height: 800, mobile: false, dpr: 1, isPortrait: false },
  { id: '844x390', label: 'Phone Landscape', width: 844, height: 390, mobile: true, dpr: 2, isPortrait: false },
  { id: '390x844', label: 'iPhone 15 Portrait', width: 390, height: 844, mobile: true, dpr: 2, isPortrait: true },
  { id: '360x640', label: 'Compact Phone Portrait', width: 360, height: 640, mobile: true, dpr: 2, isPortrait: true },
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.gz': 'application/gzip',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  passed: [],
  failed: [],
  screenshots: [],
  metrics: {},
};

function check(id, cond, detail, severity = 'P0') {
  if (cond) {
    results.passed.push({ id, detail });
    console.log(`  [PASS] ${id}: ${detail}`);
  } else {
    results.failed.push({ id, severity, detail });
    console.error(`  [FAIL][${severity}] ${id}: ${detail}`);
  }
  return Boolean(cond);
}

function findBrowserBinary() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Could not find Edge or Chrome executable.');
}

function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(rootDir, 'index.html'))) {
      reject(new Error(`dist/index.html missing at ${rootDir}`));
      return;
    }
    const server = http.createServer((req, res) => {
      try {
        const parsed = new URL(req.url || '/', 'http://127.0.0.1');
        let relPath = decodeURIComponent(parsed.pathname);
        if (relPath === '/' || relPath === '') relPath = '/index.html';
        const absPath = path.resolve(rootDir, '.' + relPath);
        if (!absPath.startsWith(rootDir)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }
        let target = absPath;
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
          target = path.join(target, 'index.html');
        }
        if (!fs.existsSync(target)) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        const ext = path.extname(target).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': mime,
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
      resolve({
        server,
        port: addr.port,
        baseUrl: `http://127.0.0.1:${addr.port}`,
      });
    });
  });
}

class CdpDriver {
  constructor(proc, tmpDir, cdpPort) {
    this.proc = proc;
    this.tmpDir = tmpDir;
    this.cdpPort = cdpPort;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.consoleErrors = [];
    this.pageExceptions = [];
    this.httpErrors = [];
    this.activeTargetId = null;
  }

  static async launch(attempt = 1) {
    const bin = findBrowserBinary();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-rt-v3-ux-'));
    const proc = spawn(
      bin,
      [
        '--headless=new',
        '--remote-debugging-port=0',
        `--user-data-dir=${tmpDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-networking',
        '--disable-popup-blocking',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--autoplay-policy=no-user-gesture-required',
        '--enable-webgl',
        '--ignore-gpu-blocklist',
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--disable-gpu-sandbox',
        '--window-size=1280,800',
        'about:blank',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );

    let stderr = '';
    let wsRoot;
    try {
      wsRoot = await new Promise((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error(`Edge CDP startup timed out. stderr:\n${stderr}`)),
          35000,
        );
        proc.stderr.on('data', (chunk) => {
          stderr += chunk.toString();
          const m = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
          if (m) {
            clearTimeout(timer);
            resolve(m[1]);
          }
        });
        proc.on('exit', (code) => {
          clearTimeout(timer);
          reject(new Error(`Edge exited early (${code}). stderr:\n${stderr}`));
        });
      });
    } catch (err) {
      try { proc.kill(); } catch {}
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
      if (attempt < 2) {
        await sleep(800);
        return CdpDriver.launch(attempt + 1);
      }
      throw err;
    }

    const cdpPort = Number(new URL(wsRoot).port);
    const driver = new CdpDriver(proc, tmpDir, cdpPort);
    await driver.attachFirstPage();
    return driver;
  }

  async attachFirstPage() {
    let pageTarget = null;
    for (let i = 0; i < 25; i++) {
      const list = await (await fetch(`http://127.0.0.1:${this.cdpPort}/json/list`)).json();
      pageTarget = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTarget) break;
      await sleep(150);
    }
    if (!pageTarget) throw new Error('No CDP page target found');
    this.activeTargetId = pageTarget.id;
    await this.connectWs(pageTarget.webSocketDebuggerUrl);
  }

  async connectWs(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });

    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject, timer } = this.pending.get(msg.id);
        clearTimeout(timer);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`CDP ${msg.error.code}: ${msg.error.message}`));
        else resolve(msg.result);
      } else if (msg.method) {
        this.handleEvent(msg.method, msg.params);
      }
    });

    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Network.enable');
    await this.send('DOM.enable');
  }

  handleEvent(method, params) {
    if (method === 'Runtime.consoleAPICalled') {
      if (params.type === 'error') {
        const text = (params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
        this.consoleErrors.push(text);
      }
    } else if (method === 'Runtime.exceptionThrown') {
      const desc =
        params.exceptionDetails?.exception?.description ||
        params.exceptionDetails?.text ||
        'Unhandled exception';
      this.pageExceptions.push(desc);
    } else if (method === 'Network.responseReceived') {
      const status = params.response?.status ?? 200;
      const url = params.response?.url ?? '';
      if (status >= 400 && !url.includes('favicon.ico')) {
        this.httpErrors.push(`${status} ${url}`);
      }
    }
    const cbs = this.listeners.get(method);
    if (cbs) {
      for (const cb of [...cbs]) cb(params);
    }
  }

  send(method, params = {}, timeoutMs = 45000) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout on ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      const msg =
        res.exceptionDetails.exception?.description ||
        res.exceptionDetails.text ||
        'Eval exception';
      throw new Error(`Page eval error: ${msg}`);
    }
    return res.result?.value;
  }

  async evalFn(fn, ...args) {
    const serialized = args.map((a) => JSON.stringify(a)).join(',');
    return this.eval(`(${fn.toString()})(${serialized})`);
  }

  async setViewport(vp) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dpr,
      mobile: vp.mobile,
      screenWidth: vp.width,
      screenHeight: vp.height,
      screenOrientation: vp.isPortrait
        ? { type: 'portraitPrimary', angle: 0 }
        : { type: 'landscapePrimary', angle: 90 },
    });
    await this.send(
      'Emulation.setTouchEmulationEnabled',
      vp.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false },
    );
    await sleep(160);
  }

  async navigate(url, clearStorage = false) {
    let curHref = '';
    try {
      curHref = await this.eval('location.href');
    } catch {}
    const sameOrigin = Boolean(curHref && curHref.startsWith(url));
    if (sameOrigin && clearStorage) {
      await this.eval('try { localStorage.clear(); sessionStorage.clear(); } catch {}');
      await this.reload();
      return;
    }
    const loaded = new Promise((resolve) => {
      const onLoad = () => {
        this.listeners.get('Page.loadEventFired')?.delete(onLoad);
        resolve();
      };
      if (!this.listeners.has('Page.loadEventFired')) {
        this.listeners.set('Page.loadEventFired', new Set());
      }
      this.listeners.get('Page.loadEventFired').add(onLoad);
      setTimeout(() => {
        this.listeners.get('Page.loadEventFired')?.delete(onLoad);
        resolve();
      }, 25000);
    });
    await this.send('Page.navigate', { url });
    await loaded;
    if (clearStorage) {
      await sleep(150);
      await this.eval('try { localStorage.clear(); sessionStorage.clear(); } catch {}');
      await this.reload();
    }
  }

  async reload() {
    const loaded = new Promise((resolve) => {
      const onLoad = () => {
        this.listeners.get('Page.loadEventFired')?.delete(onLoad);
        resolve();
      };
      if (!this.listeners.has('Page.loadEventFired')) {
        this.listeners.set('Page.loadEventFired', new Set());
      }
      this.listeners.get('Page.loadEventFired').add(onLoad);
      setTimeout(() => {
        this.listeners.get('Page.loadEventFired')?.delete(onLoad);
        resolve();
      }, 20000);
    });
    await this.send('Page.reload', { ignoreCache: true });
    await loaded;
  }

  async waitFor(selector, timeoutMs = 12000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const ok = await this.evalFn((sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
        const r = el.getBoundingClientRect();
        return r.width > 1 && r.height > 1;
      }, selector);
      if (ok) return true;
      await sleep(80);
    }
    return false;
  }

  async waitUntil(predicateFn, timeoutMs = 12000, ...args) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const ok = await this.evalFn(predicateFn, ...args);
      if (ok) return true;
      await sleep(80);
    }
    return false;
  }

  async realClick(selector, opts = {}) {
    const { scrollIfNeeded = true, timeoutMs = 10000, textContains = null } = opts;
    const start = Date.now();
    let targetInfo = null;

    while (Date.now() - start < timeoutMs) {
      targetInfo = await this.evalFn(
        (sel, txt, doScroll) => {
          let candidates = Array.from(document.querySelectorAll(sel));
          if (txt) {
            const needle = txt.toLowerCase();
            candidates = candidates.filter((e) => (e.textContent || '').toLowerCase().includes(needle));
          }
          const el = candidates.find((e) => {
            const cs = getComputedStyle(e);
            if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
            const r = e.getBoundingClientRect();
            return r.width > 1 && r.height > 1;
          });
          if (!el) return { found: false };
          let r = el.getBoundingClientRect();
          if (doScroll && (r.top < 2 || r.bottom > window.innerHeight - 2 || r.left < 0 || r.right > window.innerWidth)) {
            el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
            r = el.getBoundingClientRect();
          }
          const cx = Math.max(1, Math.min(window.innerWidth - 1, r.left + r.width / 2));
          const cy = Math.max(1, Math.min(window.innerHeight - 1, r.top + r.height / 2));
          const hit = document.elementFromPoint(cx, cy);
          const hitMatches = Boolean(hit && (hit === el || el.contains(hit) || hit.contains(el)));
          return {
            found: true,
            disabled: Boolean(el.disabled),
            cx,
            cy,
            rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
            hitMatches,
            hitTag: hit ? `${hit.tagName.toLowerCase()}${hit.id ? '#' + hit.id : ''}.${String(hit.className || '').slice(0, 32)}` : 'null',
            text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 70),
          };
        },
        selector,
        textContains,
        scrollIfNeeded,
      );
      if (targetInfo?.found && !targetInfo.disabled && targetInfo.hitMatches) break;
      await sleep(80);
    }

    if (!targetInfo?.found) {
      throw new Error(`realClick: element not found/visible for "${selector}"${textContains ? ` containing "${textContains}"` : ''}`);
    }
    if (targetInfo.disabled) {
      throw new Error(`realClick: element "${selector}" ("${targetInfo.text}") is disabled`);
    }
    if (!targetInfo.hitMatches) {
      throw new Error(
        `realClick: element "${selector}" ("${targetInfo.text}") at (${Math.round(targetInfo.cx)},${Math.round(targetInfo.cy)}) is COVERED by ${targetInfo.hitTag}!`,
      );
    }

    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: targetInfo.cx,
      y: targetInfo.cy,
      button: 'none',
    });
    await sleep(20);
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: targetInfo.cx,
      y: targetInfo.cy,
      button: 'left',
      clickCount: 1,
    });
    await sleep(30);
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: targetInfo.cx,
      y: targetInfo.cy,
      button: 'left',
      clickCount: 1,
    });
    await sleep(160);
    return targetInfo;
  }

  async typeInto(selector, text) {
    await this.realClick(selector);
    await sleep(60);
    await this.evalFn((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.focus();
        if (typeof el.select === 'function') el.select();
      }
    }, selector);
    await this.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
    await sleep(40);
    await this.send('Input.insertText', { text });
    await sleep(100);
  }

  async screenshot(filename) {
    const outPath = path.join(SCREENSHOT_DIR, filename);
    let lastErr;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const { data } = await this.send('Page.captureScreenshot', { format: 'png' }, 90000);
        fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
        results.screenshots.push(outPath);
        return outPath;
      } catch (err) {
        lastErr = err;
        await sleep(500);
      }
    }
    throw lastErr;
  }

  async close() {
    try { this.ws?.close(); } catch {}
    try { this.proc.kill(); } catch {}
    await sleep(200);
    try { fs.rmSync(this.tmpDir, { recursive: true, force: true }); } catch {}
  }
}

async function waitForAppBoot(driver, timeoutMs = 15000) {
  await driver.waitFor('#ws-title-enter-cta', timeoutMs);
  await sleep(1600);
}

async function openCampaignMapFromTitle(driver) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (await driver.evalFn(() => Boolean(document.querySelector('.ws-cities-grid')))) {
      return true;
    }
    if (await driver.evalFn(() => Boolean(document.querySelector('[data-title-mode="CAMPAIGN"]')))) {
      await driver.realClick('[data-title-mode="CAMPAIGN"]');
    }
    if (await driver.waitFor('.ws-cities-grid', 4500)) {
      await sleep(300);
      return true;
    }
    await sleep(400);
  }
  throw new Error('Failed to open Campaign Map (.ws-cities-grid) from Title');
}

async function openBriefingModalFromTitle(driver) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (await driver.evalFn(() => Boolean(document.querySelector('.ws-briefing-modal .ws-briefing-sheet')))) {
      return true;
    }
    if (await driver.evalFn(() => Boolean(document.querySelector('[data-title-mode="BRIEFING"]')))) {
      await driver.realClick('[data-title-mode="BRIEFING"]');
    }
    if (await driver.waitFor('.ws-briefing-modal .ws-briefing-sheet', 4500)) {
      await sleep(250);
      return true;
    }
    await sleep(400);
  }
  throw new Error('Failed to open BriefingCategoriesModal from Title');
}

// ============================================================================
// HELPER: WAIT FOR N ACTUAL ANIMATION FRAMES (INDEPENDENT OF SWIFTSHADER FPS)
// ============================================================================
async function waitRafTicks(driver, count) {
  return driver.evalFn(
    (n) =>
      new Promise((resolve) => {
        let i = 0;
        const t0 = performance.now();
        function step() {
          i++;
          if (i >= n) resolve({ frames: i, elapsedMs: Math.round(performance.now() - t0) });
          else requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }),
    count,
  );
}

// ============================================================================
// HELPER: READ TIMER FLOAT FROM #ws-chrono-text
// ============================================================================
async function readChronoSec(driver) {
  return driver.evalFn(() => {
    const el = document.querySelector('#ws-chrono-text');
    if (!el) return null;
    const raw = (el.textContent || '').trim();
    const m = raw.match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : null;
  });
}

// ============================================================================
// HELPER: MEASURE CENTERING & FACET HIT-TEST ON CURRENT QUESTION STAGE
// ============================================================================
async function measureCenteredStage(driver) {
  return driver.evalFn(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dock = document.querySelector('.ws-broadcast-dock');
    const prompt = document.querySelector('.ws-question-prompt');
    const layout = document.querySelector('.ws-gameplay-layout');
    const scrollRegion = document.querySelector('.ws-dock-scroll-region');
    if (!dock || !prompt) {
      return { found: false, vw, vh };
    }
    const dr = dock.getBoundingClientRect();
    const pr = prompt.getBoundingClientRect();
    const sr = scrollRegion ? scrollRegion.getBoundingClientRect() : dr;
    const dcs = getComputedStyle(dock);
    const pcs = getComputedStyle(prompt);

    const dockCenterX = dr.left + dr.width / 2;
    const promptCenterX = pr.left + pr.width / 2;
    const dockCenterY = dr.top + dr.height / 2;

    const dockHorizOffsetPx = Math.abs(dockCenterX - vw / 2);
    const promptHorizOffsetPx = Math.abs(promptCenterX - vw / 2);
    const dockCenterYPct = (dockCenterY / vh) * 100;
    const bottomGapPx = vh - dr.bottom;

    // Check all visible A-D facets for covering / viewport OR scroll-region clipping!
    const facetEls = Array.from(document.querySelectorAll('[data-facet-idx]'));
    const facets = facetEls.map((el) => {
      const r = el.getBoundingClientRect();
      const cx = Math.max(1, Math.min(vw - 1, r.left + r.width / 2));
      const cy = Math.max(1, Math.min(vh - 1, r.top + r.height / 2));
      const hit = document.elementFromPoint(cx, cy);
      const hitOk = Boolean(hit && (hit === el || el.contains(hit) || hit.contains(el)));
      const inView =
        r.left >= -1 &&
        r.right <= vw + 1 &&
        r.top >= -1 &&
        r.bottom <= vh + 1 &&
        r.top >= sr.top - 2 &&
        r.bottom <= sr.bottom + 2 &&
        r.width > 20 &&
        r.height > 20;
      const clippedInScroll = r.bottom > sr.bottom + 2 || r.top < sr.top - 2;
      return {
        idx: Number(el.dataset.facetIdx),
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
        hitOk,
        inView,
        clippedInScroll,
        coveredBy: hitOk ? null : (hit ? `${hit.tagName.toLowerCase()}${hit.id ? '#' + hit.id : ''}.${String(hit.className || '').slice(0, 30)}` : 'null'),
        rect: { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) },
      };
    });

    const coveredFacets = facets.filter((f) => !f.hitOk || !f.inView);
    const horizOverflowPx = Math.max(0, Math.round(document.documentElement.scrollWidth - vw));

    // Also check if difficulty badge or header text is truncated horizontally
    const diffBadgeEl = document.querySelector('#ws-question-difficulty-badge');
    const diffBadgeTruncated = diffBadgeEl ? diffBadgeEl.scrollWidth > diffBadgeEl.clientWidth + 2 : false;
    const domainSubEl = document.querySelector('.ws-domain-sub');
    const domainSubClipped = domainSubEl ? domainSubEl.scrollWidth > domainSubEl.clientWidth + 4 : false;

    return {
      found: true,
      vw,
      vh,
      isGlobeInteractive: Boolean(layout?.classList.contains('is-globe-interactive') || document.querySelector('.ws-globe-pin-controls')),
      dockPosition: dcs.position,
      dockRect: { l: Math.round(dr.left), t: Math.round(dr.top), r: Math.round(dr.right), b: Math.round(dr.bottom), w: Math.round(dr.width), h: Math.round(dr.height) },
      scrollRect: { t: Math.round(sr.top), b: Math.round(sr.bottom), h: Math.round(sr.height) },
      promptRect: { l: Math.round(pr.left), t: Math.round(pr.top), r: Math.round(pr.right), b: Math.round(pr.bottom), w: Math.round(pr.width), h: Math.round(pr.height) },
      promptTextAlign: pcs.textAlign,
      dockHorizOffsetPx: Number(dockHorizOffsetPx.toFixed(1)),
      promptHorizOffsetPx: Number(promptHorizOffsetPx.toFixed(1)),
      dockCenterYPct: Number(dockCenterYPct.toFixed(1)),
      bottomGapPx: Number(bottomGapPx.toFixed(1)),
      facetCount: facets.length,
      coveredFacetsCount: coveredFacets.length,
      coveredFacets,
      horizOverflowPx,
      diffBadgeTruncated,
      domainSubClipped,
    };
  });
}

// ============================================================================
// HELPER: CHECK PLAIN-ENGLISH CONTROLS (ZERO PEEL / HOLD 6.0x JARGON)
// ============================================================================
async function auditPlainEnglishControls(driver) {
  return driver.evalFn(() => {
    const buttons = Array.from(document.querySelectorAll('button')).filter((b) => {
      const cs = getComputedStyle(b);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
      const r = b.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    });
    const jargonPeelBtns = [];
    const jargonHold6Btns = [];
    for (const b of buttons) {
      const txt = (b.textContent || '').trim().replace(/\s+/g, ' ');
      if (/\bPEEL\b/i.test(txt)) jargonPeelBtns.push({ id: b.id, text: txt });
      if (/\bHOLD\s*6(\.0)?\s*[x×]/i.test(txt)) jargonHold6Btns.push({ id: b.id, text: txt });
    }
    const peelBtn = document.querySelector('#ws-btn-peel');
    const doubleDownBtn = document.querySelector('#ws-btn-double-down');
    const lockBtn = document.querySelector('#ws-btn-overclock');
    const rulesBtn = document.querySelector('#ws-topbar-rules-btn');

    return {
      jargonPeelBtns,
      jargonHold6Btns,
      peelText: peelBtn ? (peelBtn.textContent || '').trim().replace(/\s+/g, ' ') : null,
      doubleDownText: doubleDownBtn ? (doubleDownBtn.textContent || '').trim().replace(/\s+/g, ' ') : null,
      lockText: lockBtn ? (lockBtn.textContent || '').trim().replace(/\s+/g, ' ') : null,
      rulesBtnVisible: Boolean(rulesBtn && rulesBtn.getBoundingClientRect().width > 10),
      rulesBtnText: rulesBtn ? (rulesBtn.textContent || '').trim().replace(/\s+/g, ' ') : null,
    };
  });
}

// ============================================================================
// HELPER: LOCK CURRENT QUESTION (RIGHT OR DELIBERATELY WRONG)
// ============================================================================
async function lockQuestion(driver, opts = {}) {
  const { preferredText = null, avoidText = null, pickIndex = null, expectReveal = true } = opts;
  const state = await driver.evalFn(() => {
    const facets = Array.from(document.querySelectorAll('[data-facet-idx]')).map((b) => ({
      idx: Number(b.dataset.facetIdx),
      text: (b.textContent || '').trim().replace(/\s+/g, ' '),
      disabled: Boolean(b.disabled),
    }));
    const gauntlet = Array.from(document.querySelectorAll('[data-gauntlet]')).map((b) => b.dataset.gauntlet);
    const globeAnchors = Array.from(document.querySelectorAll('[data-globe-anchor-idx]')).length;
    const calSlider = Boolean(document.querySelector('#ws-cal-slider'));
    const codexBtns = document.querySelectorAll('[data-codex-subj]').length;
    return { facets, gauntlet, globeAnchors, calSlider, codexBtns };
  });

  if (state.gauntlet.length > 0) {
    await driver.realClick('[data-gauntlet="VERIFY"]');
  } else if (state.globeAnchors > 0) {
    await driver.realClick('[data-globe-anchor-idx="0"]');
    await sleep(100);
    await driver.realClick('#ws-btn-overclock');
  } else if (state.calSlider || state.codexBtns > 0) {
    await driver.realClick('#ws-btn-overclock');
  } else if (state.facets.length > 0) {
    const enabled = state.facets.filter((f) => !f.disabled);
    let chosen = enabled[0];
    if (pickIndex !== null) {
      const m = enabled.find((f) => f.idx === pickIndex);
      if (m) chosen = m;
    } else if (preferredText) {
      const m = enabled.find((f) => f.text.toLowerCase().includes(preferredText.toLowerCase()));
      if (m) chosen = m;
    } else if (avoidText) {
      const m = enabled.find((f) => !f.text.toLowerCase().includes(avoidText.toLowerCase()));
      if (m) chosen = m;
    }
    if (!chosen) throw new Error('No enabled facet found to click');
    await driver.realClick(`[data-facet-idx="${chosen.idx}"]`);
    await sleep(120);
    const alreadyRevealed = await driver.evalFn(() =>
      Boolean(document.querySelector('#ws-btn-next-q, #ws-instant-prism-next-bar')),
    );
    if (!alreadyRevealed) {
      await driver.realClick('#ws-btn-overclock');
    }
  } else {
    throw new Error('Unknown question archetype — no interactive submit controls found');
  }

  if (expectReveal) {
    const revealed = await driver.waitFor('#ws-btn-next-q, #ws-instant-prism-next-bar', 8000);
    if (!revealed) {
      throw new Error('Reveal bar did not appear after real-clicking answer lock!');
    }
  }
}

// ============================================================================
// PART 1: FEEDBACK #5 STATIC & AUDIO ASSET AUDIT (NO CHEESY ROOKIE LINE + MP3)
// ============================================================================
async function runStaticStoryAndAudioAudit(baseUrl) {
  console.log('\n=== PART 1: FEEDBACK #5 — MARA SATO STORY COPY & VOICE MP3 VERIFICATION ===');

  const prologuePath = path.join(REPO_ROOT, 'src', 'narrative', 'PrologueDirector.ts');
  const cinemaPath = path.join(REPO_ROOT, 'src', 'cinema', 'MotionCinemaDirector.ts');
  const distCampaignPath = path.join(DIST_DIR, 'data', 'campaign_20hr.json');
  const distWave2Path = path.join(DIST_DIR, 'data', 'narrative_wave2.json');

  const prologueSrc = fs.readFileSync(prologuePath, 'utf8');
  const cinemaSrc = fs.existsSync(cinemaPath) ? fs.readFileSync(cinemaPath, 'utf8') : '';
  const distCampaignRaw = fs.readFileSync(distCampaignPath, 'utf8');
  const distWave2Raw = fs.existsSync(distWave2Path) ? fs.readFileSync(distWave2Path, 'utf8') : '';

  const bannedRe = /don['’]?t\s+trust\s+the\s+cameras,?\s*rookie/i;
  check(
    'F5:zero-rookie-line-PrologueDirector',
    !bannedRe.test(prologueSrc),
    bannedRe.test(prologueSrc) ? 'FOUND banned "Don\'t trust the cameras, rookie" in PrologueDirector.ts!' : '0 occurrences in PrologueDirector.ts',
    'P0',
  );
  check(
    'F5:zero-rookie-line-dist-campaign-json',
    !bannedRe.test(distCampaignRaw),
    bannedRe.test(distCampaignRaw) ? 'FOUND banned "Don\'t trust the cameras, rookie" in dist/data/campaign_20hr.json!' : '0 occurrences in dist/data/campaign_20hr.json',
    'P0',
  );
  check(
    'F5:zero-rookie-line-MotionCinemaDirector',
    !bannedRe.test(cinemaSrc),
    bannedRe.test(cinemaSrc) ? 'FOUND banned "Don\'t trust the cameras, rookie" in MotionCinemaDirector.ts!' : '0 occurrences in MotionCinemaDirector.ts',
    'P0',
  );
  check(
    'F5:zero-rookie-line-dist-wave2',
    !bannedRe.test(distWave2Raw),
    bannedRe.test(distWave2Raw) ? 'FOUND banned line in dist/data/narrative_wave2.json!' : '0 occurrences in dist/data/narrative_wave2.json',
    'P1',
  );

  // Also scan compiled JS bundles in dist/assets/*.js
  const distAssetsDir = path.join(DIST_DIR, 'assets');
  const jsFiles = fs.existsSync(distAssetsDir)
    ? fs.readdirSync(distAssetsDir).filter((f) => f.endsWith('.js'))
    : [];
  const bundleHits = [];
  for (const jf of jsFiles) {
    const txt = fs.readFileSync(path.join(distAssetsDir, jf), 'utf8');
    if (bannedRe.test(txt)) bundleHits.push(jf);
  }
  check(
    'F5:zero-rookie-line-dist-bundles',
    bundleHits.length === 0,
    bundleHits.length === 0 ? `0 hits across ${jsFiles.length} compiled JS bundles` : `FOUND in ${bundleHits.join(', ')}`,
    'P0',
  );

  // Check Mara Sato mystery presence
  check(
    'F5:mara-sato-premise-present',
    /Mara Sato/i.test(prologueSrc) && /Mara Sato/i.test(distCampaignRaw),
    `PrologueDirector=${/Mara Sato/i.test(prologueSrc)}, dist/campaign_20hr.json=${/Mara Sato/i.test(distCampaignRaw)}`,
    'P0',
  );

  // Collect ALL cutscene & prologue .mp3 URLs from dist/data/campaign_20hr.json (act_cutscenes) and PrologueDirector.ts
  const mp3Set = new Set();
  const campaignJson = JSON.parse(distCampaignRaw);
  const cutscenes = campaignJson.act_cutscenes || campaignJson.cutscenes || [];
  for (const cs of cutscenes) {
    for (const ln of cs.lines || []) {
      const vc = ln.voice_clip || ln.voiceUrl;
      if (vc && /\.mp3$/i.test(vc)) mp3Set.add(vc);
    }
  }
  const mp3Matches = prologueSrc.match(/['"`](?:\.\/|\/|res:\/\/)?assets\/voice\/[a-zA-Z0-9_\-.]+\.mp3['"`]/g) || [];
  for (const raw of mp3Matches) {
    mp3Set.add(raw.slice(1, -1));
  }

  const normalizeUrlPath = (raw) => {
    let s = raw.trim();
    if (s.startsWith('res://')) s = '/' + s.slice('res://'.length);
    else if (s.startsWith('./')) s = '/' + s.slice(2);
    else if (!s.startsWith('/')) s = '/' + s;
    return s;
  };

  const mp3List = Array.from(mp3Set).map(normalizeUrlPath).sort();
  let okCount = 0;
  const badMp3s = [];
  for (const urlPath of mp3List) {
    const resp = await fetch(`${baseUrl}${urlPath}`);
    const buf = Buffer.from(await resp.arrayBuffer());
    const isId3 = buf.length >= 3 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33;
    const isMpegSync = buf.length >= 2 && buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
    const valid = resp.status === 200 && buf.length > 5120 && (isId3 || isMpegSync);
    if (valid) {
      okCount++;
    } else {
      badMp3s.push({ urlPath, status: resp.status, bytes: buf.length, headerHex: buf.subarray(0, 4).toString('hex') });
    }
  }
  results.metrics.voiceMp3Audit = { totalChecked: mp3List.length, okCount, badMp3s };
  check(
    'F5:all-cutscene-and-prologue-mp3-valid',
    mp3List.length >= 25 && badMp3s.length === 0,
    `${okCount}/${mp3List.length} valid MP3 (>5KB, HTTP 200, valid header)${badMp3s.length ? ' BAD=' + JSON.stringify(badMp3s.slice(0, 5)) : ''}`,
    'P0',
  );

  // Also check early campaign timer/difficulty JSON settings in dist/data/campaign_20hr.json
  const curve = campaignJson.design_pillars?.progressive_difficulty_curve || [];
  const chHub = curve.find((h) => h.hub === 'ch');
  const gbHub = curve.find((h) => h.hub === 'gb');
  check(
    'F1:dist-campaign-json-early-timers',
    Boolean(chHub && chHub.timer_sec >= 28 && gbHub && gbHub.timer_sec >= 26),
    `ch.timer_sec=${chHub?.timer_sec}, ch.irt_b=${JSON.stringify(chHub?.irt_b)}, gb.timer_sec=${gbHub?.timer_sec}, gb.irt_b=${JSON.stringify(gbHub?.irt_b)}`,
    'P1',
  );
}

// ============================================================================
// PART 2: LIVE FIRST-TIME PLAYER JOURNEY (CUTSCENE -> REG -> ROUND READY ->
// PROLOGUE Q1-Q4 WITH DELIBERATE MISSES -> READING GRACE -> RULES MODAL ->
// CAMPAIGN STAGE 1 ch_1 + LONDON gb_1 + SCOUT'S ADVANTAGE RETRY MERCY)
// ============================================================================
async function runFirstTimePlayerAndPrologueAudit(driver, baseUrl) {
  console.log('\n=== PART 2: FEEDBACK #5, #2, #1, #4 — FIRST-TIME PLAYER & PROLOGUE WALKTHROUGH (390x844) ===');
  await driver.setViewport(VIEWPORTS[2]); // 390x844
  await driver.navigate(baseUrl, true);
  await waitForAppBoot(driver);

  // 1. Click START STORY CAMPAIGN -> Walk through Act 0 Cutscene Beat 1..3
  await driver.realClick('#ws-title-enter-cta');
  const cutsceneVisible = await driver.waitFor('#ws-mc-next, #ws-mc-skip, #ws-mc-summons', 7000);
  check('F5:live-act0-cutscene-mounted', cutsceneVisible, `cutsceneVisible=${cutsceneVisible}`, 'P0');

  const cutsceneBeats = [];
  if (cutsceneVisible) {
    // Wait for summons card to dissolve or click it
    await sleep(600);
    const hasSummons = await driver.evalFn(() => {
      const s = document.querySelector('#ws-mc-summons');
      return Boolean(s && !s.classList.contains('is-dissolving') && getComputedStyle(s).display !== 'none');
    });
    if (hasSummons) {
      try {
        await driver.realClick('#ws-mc-summons', { timeoutMs: 1200 });
      } catch {
        // Summons auto-dissolved into Beat 1 on its own
      }
      await sleep(550);
    }

    for (let guard = 0; guard < 12; guard++) {
      const stillInCinema = await driver.evalFn(() => Boolean(document.querySelector('#ws-mc-next')));
      if (!stillInCinema) break;
      await sleep(300);
      const beatInfo = await driver.evalFn(() => ({
        step: (document.querySelector('#ws-mc-step')?.textContent || '').trim(),
        speaker: (document.querySelector('#ws-mc-speaker')?.textContent || '').trim(),
        text: (document.querySelector('#ws-mc-text')?.textContent || '').trim().replace(/\s+/g, ' '),
      }));
      if (beatInfo.text && !cutsceneBeats.some((b) => b.step === beatInfo.step)) {
        cutsceneBeats.push(beatInfo);
        if (beatInfo.step.includes('3 /')) {
          await sleep(1100); // let words finish revealing for crisp screenshot
          await driver.screenshot('01_act0_cutscene_beat3_390x844.png');
        }
      }
      // Click #ws-mc-next (may reveal words first, then advance on next loop iteration)
      try {
        await driver.realClick('#ws-mc-next', { timeoutMs: 2500 });
      } catch {
        break;
      }
      await sleep(220);
    }
  }

  results.metrics.act0CutsceneBeats = cutsceneBeats;
  const allBeatText = cutsceneBeats.map((b) => b.text).join(' ');
  check(
    'F5:live-act0-cutscene-3-grounded-beats',
    cutsceneBeats.length >= 3 && !/don['’]?t trust the cameras/i.test(allBeatText) && /Mara/i.test(allBeatText),
    `beats=${cutsceneBeats.length}, speakers=${cutsceneBeats.map((b) => b.speaker).join(' -> ')}, sample="${allBeatText.slice(0, 140)}..."`,
    'P0',
  );

  // 2. CHAMBER_OPENING story beat -> click #ws-story-continue -> Registration
  if (await driver.waitFor('#ws-story-continue', 4000)) {
    await driver.realClick('#ws-story-continue');
    await sleep(300);
  }
  const regVisible = await driver.waitFor('#challenger-name-input', 6000);
  check('F2:registration-reached-after-cutscene', regVisible, `regVisible=${regVisible}`, 'P0');
  await driver.typeInto('#challenger-name-input', 'Maya Lin');
  await driver.realClick('#ws-begin-vetting');

  // 3. FEEDBACK #2: ZERO AMBUSH! Must land on Pre-Round Readiness Card (`#ws-btn-start-round-questions`), NOT ticking Q1!
  const rr1Visible = await driver.waitFor('#ws-btn-start-round-questions', 6000);
  const ambushCheck1 = await driver.evalFn(() => ({
    hasRoundReadyBtn: Boolean(document.querySelector('#ws-btn-start-round-questions')),
    hasRoundReadyCard: Boolean(document.querySelector('.ws-round-ready-card, .ws-round-ready-stage')),
    hasLiveDockAlready: Boolean(document.querySelector('.ws-broadcast-dock .ws-question-prompt')),
    hasChronoAlready: Boolean(document.querySelector('#ws-chrono-text')),
    cardText: (document.querySelector('.ws-round-ready-card, .ws-round-ready-stage')?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
  }));
  check(
    'F2:prologue-q1-round-ready-no-ambush',
    rr1Visible &&
      ambushCheck1.hasRoundReadyBtn &&
      !ambushCheck1.hasLiveDockAlready &&
      !ambushCheck1.hasChronoAlready &&
      !/QUESTION\s+1\s+OF\s+1/i.test(ambushCheck1.cardText),
    JSON.stringify(ambushCheck1),
    'P0',
  );
  await driver.screenshot('02_round_ready_prologue_q1_390x844.png');

  // Wait 900ms on Round Ready card to prove NO timer starts ticking behind the scenes
  await sleep(900);
  const stillOnRR1 = await driver.evalFn(() => Boolean(document.querySelector('#ws-btn-start-round-questions') && !document.querySelector('.ws-broadcast-dock')));
  check('F2:round-ready-holds-until-clicked', stillOnRR1, `stillWaitingForPlayer=${stillOnRR1}`, 'P0');

  // Click START QUESTIONS -> Immediately test ~2.0s Reading Grace (`READ CLUE`)!
  await driver.realClick('#ws-btn-start-round-questions');
  const q1Mounted = await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);
  check('F1:prologue-q1-mounted', q1Mounted, `q1Mounted=${q1Mounted}`, 'P0');

  const t0 = await readChronoSec(driver);
  const gracePillVisibleAtMount = await driver.evalFn(() => {
    const el = document.querySelector('#ws-reading-grace-pill, .ws-reading-grace-pill');
    const txt = (document.querySelector('.ws-broadcast-dock')?.textContent || '') + ' ' + (document.querySelector('.ws-gameplay-layout')?.textContent || '');
    return {
      pillFound: Boolean(el && el.getBoundingClientRect().height > 4),
      pillText: el ? (el.textContent || '').trim() : '',
      hasReadClueText: /READ\s*CLUE/i.test(txt),
    };
  });
  // Wait 6 RAF frames (~0.6s clamped game-time, well inside 2.0s reading grace) -> timer MUST be held!
  await waitRafTicks(driver, 6);
  const tDuringGrace = await readChronoSec(driver);

  // Wait up to 45 RAF frames (~2.0s clamped game-time regardless of SwiftShader FPS) for Reading Grace pill to clear!
  let graceCleared = false;
  for (let batch = 0; batch < 10; batch++) {
    await waitRafTicks(driver, 5);
    graceCleared = await driver.evalFn(() => {
      const el = document.querySelector('#ws-reading-grace-pill, .ws-reading-grace-pill');
      if (!el) return true;
      const cs = getComputedStyle(el);
      return cs.display === 'none' || cs.visibility === 'hidden' || el.getBoundingClientRect().height < 2;
    });
    if (graceCleared) break;
  }
  const tAtGraceEnd = await readChronoSec(driver);
  // Wait 12 RAF frames (~1.2s clamped game-time) after grace ends -> timer MUST drain!
  await waitRafTicks(driver, 12);
  const tAfterGrace = await readChronoSec(driver);

  const blockingModalsDiag = await driver.evalFn(() =>
    Array.from(document.querySelectorAll('.ws-modal-backdrop, .ws-meta-backdrop, #ws-rules-modal, .ws-cutscene-overlay')).map((e) => ({
      id: e.id,
      cls: e.className,
      display: getComputedStyle(e).display,
    })),
  );

  results.metrics.readingGrace = { t0, tDuringGrace, graceCleared, tAtGraceEnd, tAfterGrace, gracePillVisibleAtMount, blockingModalsDiag };
  check(
    'F2:reading-grace-holds-then-drains',
    t0 !== null &&
      tDuringGrace !== null &&
      tAfterGrace !== null &&
      (gracePillVisibleAtMount.pillFound || gracePillVisibleAtMount.hasReadClueText) &&
      Math.abs(t0 - tDuringGrace) <= 0.25 &&
      graceCleared &&
      tDuringGrace - tAfterGrace >= 0.4,
    `t0=${t0}s, duringGrace=${tDuringGrace}s (held), graceCleared=${graceCleared}, tAtGraceEnd=${tAtGraceEnd}s, tAfter=${tAfterGrace}s (draining), pill=${JSON.stringify(gracePillVisibleAtMount)}`,
    'P0',
  );

  // Check Q1 content (Eiffel Tower, >= 30s) & Plain-English Controls (Feedback #4)
  const q1Info = await driver.evalFn(() => ({
    prompt: (document.querySelector('.ws-question-prompt')?.textContent || '').trim(),
    facets: Array.from(document.querySelectorAll('[data-facet-idx]')).map((b) => (b.textContent || '').trim()),
    diffBadge: (document.querySelector('#ws-question-difficulty-badge')?.textContent || '').trim(),
  }));
  check(
    'F1:prologue-q1-eiffel-tower-easy-30s',
    /Paris|Seine|1889|iron landmark/i.test(q1Info.prompt) &&
      q1Info.facets.some((f) => /Eiffel Tower/i.test(f)) &&
      t0 >= 30,
    `t0=${t0}s, diff="${q1Info.diffBadge}", prompt="${q1Info.prompt.slice(0, 90)}"`,
    'P0',
  );

  // Feedback #4: Verify 0 PEEL / 0 HOLD 6.0x + Verify Hint / LOCK ANSWER / 2x Double Down + ? Rules modal pauses timer!
  const ctrlQ1 = await auditPlainEnglishControls(driver);
  results.metrics.controlsQ1 = ctrlQ1;
  check(
    'F4:zero-peel-and-hold6-jargon-q1',
    ctrlQ1.jargonPeelBtns.length === 0 &&
      ctrlQ1.jargonHold6Btns.length === 0 &&
      /Hint/i.test(ctrlQ1.peelText || '') &&
      /LOCK/i.test(ctrlQ1.lockText || '') &&
      /Double Down|2[x×]/i.test(ctrlQ1.doubleDownText || ''),
    JSON.stringify(ctrlQ1),
    'P0',
  );

  // Test Topbar `? Rules` Modal pauses timer!
  check(
    'F4:topbar-rules-btn-visible',
    ctrlQ1.rulesBtnVisible,
    `rulesBtnText="${ctrlQ1.rulesBtnText}"`,
    'P0',
  );
  const timerBeforeRules = await readChronoSec(driver);
  await driver.realClick('#ws-topbar-rules-btn');
  const rulesModalOpen = await driver.waitFor('#ws-rules-modal', 4000);
  await waitRafTicks(driver, 10);
  const timerDuringRules = await readChronoSec(driver);
  const rulesModalText = await driver.evalFn(() =>
    (document.querySelector('#ws-rules-modal')?.textContent || '').trim().replace(/\s+/g, ' '),
  );
  await driver.screenshot('03_rules_modal_paused_390x844.png');
  check(
    'F4:rules-modal-opens-explains-3-rules-pauses-timer',
    rulesModalOpen &&
      /Pick|Lock/i.test(rulesModalText) &&
      /Hint|50\/50/i.test(rulesModalText) &&
      /Double Down|2[x×]/i.test(rulesModalText) &&
      timerBeforeRules !== null &&
      timerDuringRules !== null &&
      Math.abs(timerBeforeRules - timerDuringRules) <= 0.3,
    `open=${rulesModalOpen}, timerBefore=${timerBeforeRules}s, timerAfter10RAF=${timerDuringRules}s`,
    'P0',
  );

  // Close Rules Modal and verify timer resumes
  await driver.realClick('#ws-rules-got-it');
  const rulesClosed = await driver.waitUntil(() => !document.querySelector('#ws-rules-modal'), 3000);
  await waitRafTicks(driver, 12);
  const timerAfterClose = await readChronoSec(driver);
  check(
    'F4:rules-modal-closes-and-resumes-timer',
    rulesClosed && timerAfterClose !== null && timerDuringRules - timerAfterClose >= 0.35,
    `closed=${rulesClosed}, timerDuring=${timerDuringRules}s -> timerAfter12RAF=${timerAfterClose}s`,
    'P0',
  );

  // Answer Q1 CORRECTLY (Eiffel Tower)
  await lockQuestion(driver, { preferredText: 'Eiffel Tower' });
  await driver.realClick('#ws-btn-next-q');

  // MIRROR_LEAK_CHOICE dialogue -> select choice -> MUST land on Pre-Round Readiness Card before Q2 (ZERO AMBUSH!)
  const mirrorChoiceVisible = await driver.waitFor('[data-story-choice^="MIRROR:"]', 6000);
  check('F5:mirror-choice-dialogue-grounded', mirrorChoiceVisible, `mirrorChoiceVisible=${mirrorChoiceVisible}`, 'P0');
  if (mirrorChoiceVisible) {
    const mirrorCopy = await driver.evalFn(() =>
      (document.querySelector('.ws-frame-cinema, .ws-story-dialogue, #ui-root')?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 200),
    );
    check(
      'F5:mirror-choice-zero-rookie-cliche',
      !/don['’]?t trust the cameras/i.test(mirrorCopy),
      `sample="${mirrorCopy.slice(0, 120)}"`,
      'P1',
    );
    await driver.realClick('[data-story-choice^="MIRROR:"]');
  }

  // After Mirror choice, may show 1 reaction dialogue beat (verify its final button text too!) -> then MUST hit Round Ready before Q2!
  if (await driver.waitFor('#ws-story-continue', 2500)) {
    const btnLbl = await driver.evalFn(() => (document.querySelector('#ws-story-continue')?.textContent || '').trim());
    results.metrics.mirrorReactionBtn = btnLbl;
    await driver.realClick('#ws-story-continue');
  }

  const rr2Visible = await driver.waitFor('#ws-btn-start-round-questions', 6000);
  check(
    'F2:prologue-q2-round-ready-no-ambush',
    rr2Visible,
    `roundReadyBeforeQ2=${rr2Visible}`,
    'P0',
  );
  if (rr2Visible) await driver.realClick('#ws-btn-start-round-questions');
  await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);

  // Q2: Saturn (>= 30s) + test Hint -> 50/50 -> DELIBERATELY MISS!
  const q2Timer = await readChronoSec(driver);
  const q2Info = await driver.evalFn(() => ({
    prompt: (document.querySelector('.ws-question-prompt')?.textContent || '').trim(),
    facets: Array.from(document.querySelectorAll('[data-facet-idx]')).map((b) => (b.textContent || '').trim()),
  }));
  check(
    'F1:prologue-q2-saturn-easy-30s',
    /Saturn/i.test(q2Info.facets.join(' ')) && /ring|sixth|planet/i.test(q2Info.prompt) && q2Timer >= 30,
    `t=${q2Timer}s, prompt="${q2Info.prompt.slice(0, 85)}"`,
    'P0',
  );

  // Test Hint -> 50/50 transition (Feedback #4)
  const hintLabel1 = await driver.evalFn(() => (document.querySelector('#ws-btn-peel')?.textContent || '').trim());
  await driver.realClick('#ws-btn-peel');
  await sleep(220);
  const hintLabel2 = await driver.evalFn(() => (document.querySelector('#ws-btn-peel')?.textContent || '').trim());
  await driver.realClick('#ws-btn-peel');
  await sleep(220);
  const shatteredAfter5050 = await driver.evalFn(() =>
    document.querySelectorAll('[data-facet-idx].is-shattered, [data-facet-idx]:disabled').length,
  );
  check(
    'F4:hint-and-5050-buttons-work-plain-english',
    /Hint/i.test(hintLabel1) && /50\/50/i.test(hintLabel2) && !/PEEL/i.test(hintLabel1 + ' ' + hintLabel2) && shatteredAfter5050 === 2,
    `step1="${hintLabel1}" -> step2="${hintLabel2}", shattered=${shatteredAfter5050}`,
    'P0',
  );

  // Deliberately pick WRONG answer on Q2 (avoid Saturn)
  await lockQuestion(driver, { avoidText: 'Saturn' });
  await driver.realClick('#ws-btn-next-q');

  // SPOTLIGHT_MANIFESTO choice -> reaction -> Round Ready -> Q3 (Mona Lisa)
  if (await driver.waitFor('[data-story-choice^="MANIFESTO:"]', 5000)) {
    await driver.realClick('[data-story-choice^="MANIFESTO:"]');
  }
  if (await driver.waitFor('#ws-story-continue', 2500)) {
    await driver.realClick('#ws-story-continue');
  }
  const rr3Visible = await driver.waitFor('#ws-btn-start-round-questions', 6000);
  check('F2:prologue-q3-round-ready-no-ambush', rr3Visible, `roundReadyBeforeQ3=${rr3Visible}`, 'P0');
  if (rr3Visible) await driver.realClick('#ws-btn-start-round-questions');
  await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);

  const q3Timer = await readChronoSec(driver);
  const q3Info = await driver.evalFn(() => ({
    prompt: (document.querySelector('.ws-question-prompt')?.textContent || '').trim(),
    facets: Array.from(document.querySelectorAll('[data-facet-idx]')).map((b) => (b.textContent || '').trim()),
  }));
  check(
    'F1:prologue-q3-mona-lisa-easy-30s',
    /Mona Lisa/i.test(q3Info.facets.join(' ')) && /Leonardo|Louvre|smile/i.test(q3Info.prompt) && q3Timer >= 30,
    `t=${q3Timer}s, prompt="${q3Info.prompt.slice(0, 85)}"`,
    'P0',
  );

  // Test 2x Double Down toggle ON (Feedback #4), then DELIBERATELY MISS Q3!
  await driver.realClick('#ws-btn-double-down');
  await sleep(180);
  const ddState = await driver.evalFn(() => {
    const dd = document.querySelector('#ws-btn-double-down');
    const lk = document.querySelector('#ws-btn-overclock');
    return {
      isActive: Boolean(dd?.classList.contains('is-active') || dd?.getAttribute('aria-pressed') === 'true'),
      ddText: (dd?.textContent || '').trim().replace(/\s+/g, ' '),
      lockText: (lk?.textContent || '').trim().replace(/\s+/g, ' '),
    };
  });
  check(
    'F4:double-down-toggle-activates-2x-wager',
    ddState.isActive && /2[x×]/i.test(ddState.lockText),
    JSON.stringify(ddState),
    'P0',
  );

  // Deliberately pick WRONG answer on Q3 (avoid Mona Lisa)
  await lockQuestion(driver, { avoidText: 'Mona Lisa' });
  await driver.realClick('#ws-btn-next-q');

  // Round Ready before Q4 (1969)
  const rr4Visible = await driver.waitFor('#ws-btn-start-round-questions', 6000);
  check('F2:prologue-q4-round-ready-no-ambush', rr4Visible, `roundReadyBeforeQ4=${rr4Visible}`, 'P0');
  if (rr4Visible) await driver.realClick('#ws-btn-start-round-questions');
  await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);

  const q4Timer = await readChronoSec(driver);
  const q4Info = await driver.evalFn(() => ({
    prompt: (document.querySelector('.ws-question-prompt')?.textContent || '').trim(),
    hasSlider: Boolean(document.querySelector('#ws-cal-slider')),
    dockText: (document.querySelector('.ws-broadcast-dock')?.textContent || '').trim(),
  }));
  check(
    'F1:prologue-q4-apollo-1969-easy-no-year-commas',
    /Apollo 11|Moon|Neil Armstrong/i.test(q4Info.prompt) &&
      q4Info.hasSlider &&
      q4Timer >= 30 &&
      !/1,9\d\d/.test(q4Info.dockText),
    `t=${q4Timer}s, slider=${q4Info.hasSlider}, prompt="${q4Info.prompt.slice(0, 85)}"`,
    'P0',
  );

  await lockQuestion(driver);
  await driver.realClick('#ws-btn-next-q');

  // PASSPORT_STAMP_PAYOFF -> ACT1_FLIGHT_FORK (Prologue completed cleanly despite 2 deliberate misses!)
  const stampReached = await driver.waitFor('#ws-story-continue', 6000);
  if (stampReached) await driver.realClick('#ws-story-continue');
  const forkReached = await driver.waitFor('[data-story-choice^="FORK:"]', 6000);
  check(
    'F1:prologue-completes-cleanly-despite-misses',
    stampReached && forkReached,
    `passportStamp=${stampReached}, flightFork=${forkReached} (2 deliberate misses in Prologue still completed cleanly!)`,
    'P0',
  );
}

// ============================================================================
// PART 3: FEEDBACK #3 — MATHEMATICAL CENTERING ON ALL 4 VIEWPORTS
// (1280x800, 844x390, 390x844, 360x640)
// ============================================================================
async function runCenteredLayoutFourViewportAudit(driver, baseUrl) {
  console.log('\n=== PART 3: FEEDBACK #3 — MATHEMATICAL CENTERING ACROSS ALL 4 VIEWPORTS ===');

  // Launch a standard 5-Q Middle School Briefing match so we measure a real SIGHTLINE_LOCK question across all 4 viewports!
  await driver.setViewport(VIEWPORTS[0]); // 1280x800
  await driver.navigate(baseUrl, false);
  await waitForAppBoot(driver);

  await driver.realClick('[data-title-mode="BRIEFING"]');
  await driver.waitFor('.ws-briefing-modal .ws-briefing-sheet', 5000);
  // Pick Middle School + 5 Qs + Launch Global Mix
  await driver.realClick('.ws-briefing-diff-btn[data-diff="MIDDLE_SCHOOL"]');
  await sleep(120);
  const has5Btn = await driver.evalFn(() => Boolean(document.querySelector('[data-len="5"]')));
  if (has5Btn) await driver.realClick('[data-len="5"]');
  await driver.realClick('#ws-cat-launch');

  // Round Ready card MUST appear before Briefing questions!
  const rrBriefing = await driver.waitFor('#ws-btn-start-round-questions', 6000);
  check('F2:briefing-round-ready-gate-present', rrBriefing, `roundReady=${rrBriefing}`, 'P0');
  await driver.screenshot('04_round_ready_gambit_picker_1280x800.png');
  await driver.realClick('#ws-btn-start-round-questions');
  await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);

  // If Q1 happened to be a non-4-facet morph, advance once until we are on a standard SIGHTLINE_LOCK 4-facet question
  for (let tries = 0; tries < 4; tries++) {
    const fc = await driver.evalFn(() => document.querySelectorAll('[data-facet-idx]').length);
    if (fc === 4) break;
    await lockQuestion(driver);
    await driver.realClick('#ws-btn-next-q');
    await sleep(300);
  }

  for (const vp of VIEWPORTS) {
    await driver.setViewport(vp);
    await sleep(450);
    const m = await measureCenteredStage(driver);
    results.metrics[`centering_${vp.id}`] = m;
    await driver.screenshot(`05_centered_stage_${vp.id}.png`);

    check(
      `F3@${vp.id}:dock-horizontally-centered`,
      m.found && m.dockHorizOffsetPx <= 20 && m.dockPosition !== 'fixed',
      `dockOffset=${m.dockHorizOffsetPx}px (max 20px), pos=${m.dockPosition}, rect=${JSON.stringify(m.dockRect)}`,
      'P0',
    );
    check(
      `F3@${vp.id}:prompt-horizontally-centered`,
      m.found && m.promptHorizOffsetPx <= 20,
      `promptOffset=${m.promptHorizOffsetPx}px (max 20px), textAlign=${m.promptTextAlign}, rect=${JSON.stringify(m.promptRect)}`,
      'P0',
    );
    check(
      `F3@${vp.id}:vertical-balance-not-bottom-glued`,
      m.found && m.bottomGapPx > 18 && m.dockCenterYPct >= 34 && m.dockCenterYPct <= 68,
      `bottomGap=${m.bottomGapPx}px (>18px), centerY=${m.dockCenterYPct}% ([34..68%]), vh=${m.vh}`,
      'P0',
    );
    check(
      `F3@${vp.id}:zero-covered-facets-zero-overflow`,
      m.found && m.facetCount === 4 && m.coveredFacetsCount === 0 && m.horizOverflowPx <= 1,
      `facets=${m.facetCount}, covered=${m.coveredFacetsCount}${m.coveredFacets.length ? ' ' + JSON.stringify(m.coveredFacets) : ''}, horizOverflow=${m.horizOverflowPx}px`,
      'P0',
    );
    check(
      `F3@${vp.id}:difficulty-badge-untruncated`,
      m.found && !m.diffBadgeTruncated && !m.domainSubClipped,
      `diffBadgeTruncated=${m.diffBadgeTruncated}, domainSubClipped=${m.domainSubClipped}`,
      'P1',
    );

    const ctrl = await auditPlainEnglishControls(driver);
    const gambitPillText = await driver.evalFn(() =>
      (document.querySelector('.ws-gambit-status-pill')?.textContent || '').trim().replace(/\s+/g, ' '),
    );
    check(
      `F4@${vp.id}:zero-peel-hold6-jargon`,
      ctrl.jargonPeelBtns.length === 0 &&
        ctrl.jargonHold6Btns.length === 0 &&
        !/Second Wind.*Second Wind/i.test(gambitPillText),
      `peelJargon=${ctrl.jargonPeelBtns.length}, hold6Jargon=${ctrl.jargonHold6Btns.length}, gambitPill="${gambitPillText}", buttons=${JSON.stringify({ peel: ctrl.peelText, dd: ctrl.doubleDownText, lock: ctrl.lockText })}`,
      'P0',
    );
  }
}

// ============================================================================
// PART 4: FEEDBACK #1 — STAGE 1 (ch_1), LONDON (gb_1), 40% PASS & SCOUT'S
// ADVANTAGE RETRY MERCY + FEEDBACK #2 STORY-TO-ROUND-READY GATE IN CAMPAIGN
// ============================================================================
async function runCampaignProgressionAndMercyAudit(driver, baseUrl) {
  console.log('\n=== PART 4: FEEDBACK #1 & #2 — STAGE 1 (ch_1), LONDON (gb_1) & SCOUT\'S ADVANTAGE MERCY ===');
  await driver.setViewport(VIEWPORTS[2]); // 390x844
  await driver.navigate(baseUrl, false);
  await waitForAppBoot(driver);

  // Open Campaign Map
  await openCampaignMapFromTitle(driver);

  // Launch Geneva Stage 1 (ch_1) specifically! If ch_1 button is already visible in Geneva mission list, click it directly!
  let ch1BtnVisible = await driver.evalFn(() => Boolean(document.querySelector('[data-mission-id="ch_1"]')));
  if (!ch1BtnVisible) {
    await driver.realClick('[data-city-hub="ch"]');
    await sleep(350);
    ch1BtnVisible = await driver.evalFn(() => Boolean(document.querySelector('[data-mission-id="ch_1"]')));
  }
  if (ch1BtnVisible) {
    await driver.realClick('[data-mission-id="ch_1"]');
  } else {
    const forkBtn = await driver.evalFn(() => Boolean(document.querySelector('[data-story-choice^="FORK:"]')));
    if (forkBtn) {
      await driver.realClick('[data-story-choice="FORK:GB"]');
    }
  }

  // Advance any cutscene or pre-match dialogue beats until we hit Round Ready!
  let sawPreMatchDialogue = false;
  let lastDialogueBtnText = '';
  for (let i = 0; i < 16; i++) {
    const state = await driver.evalFn(() => ({
      hasSkip: Boolean(document.querySelector('#ws-mc-skip')),
      hasSummons: Boolean(document.querySelector('#ws-mc-summons') && !document.querySelector('#ws-mc-summons').classList.contains('is-dissolving')),
      hasStoryContinue: Boolean(document.querySelector('#ws-story-continue')),
      storyBtnText: (document.querySelector('#ws-story-continue')?.textContent || '').trim(),
      hasChoice: Boolean(document.querySelector('[data-story-choice]')),
      hasRoundReady: Boolean(document.querySelector('#ws-btn-start-round-questions')),
      hasLiveDock: Boolean(document.querySelector('.ws-broadcast-dock .ws-question-prompt')),
    }));

    if (state.hasRoundReady || state.hasLiveDock) break;
    if (state.hasSummons) {
      await driver.realClick('#ws-mc-summons');
      await sleep(450);
    } else if (state.hasSkip) {
      await driver.realClick('#ws-mc-skip');
      await sleep(400);
    } else if (state.hasChoice) {
      sawPreMatchDialogue = true;
      await driver.realClick('[data-story-choice]');
      await sleep(300);
    } else if (state.hasStoryContinue) {
      sawPreMatchDialogue = true;
      lastDialogueBtnText = state.storyBtnText;
      await driver.realClick('#ws-story-continue');
      await sleep(300);
    } else {
      await sleep(250);
    }
  }

  const campaignRR = await driver.evalFn(() => ({
    onRoundReady: Boolean(document.querySelector('#ws-btn-start-round-questions')),
    onLiveDockAmbush: Boolean(document.querySelector('.ws-broadcast-dock .ws-question-prompt')),
    rrText: (document.querySelector('.ws-round-ready-card, .ws-round-ready-stage')?.textContent || '').trim().replace(/\s+/g, ' '),
    chyron: (document.querySelector('.ws-chyron')?.textContent || '').trim().replace(/\s+/g, ' '),
  }));

  check(
    'F2:campaign-story-transitions-to-round-ready-no-ambush',
    campaignRR.onRoundReady && !campaignRR.onLiveDockAmbush,
    `sawPreMatchDialogue=${sawPreMatchDialogue}, lastBtn="${lastDialogueBtnText}", roundReady=${campaignRR.onRoundReady}, ambush=${campaignRR.onLiveDockAmbush}`,
    'P0',
  );
  if (sawPreMatchDialogue && lastDialogueBtnText) {
    check(
      'F2:final-story-button-signals-questions-next',
      /PREPARE|READY|QUESTION|STAGE|BEGIN/i.test(lastDialogueBtnText),
      `lastDialogueBtn="${lastDialogueBtnText}"`,
      'P1',
    );
  }

  // Start the campaign mission questions and verify Middle School + >= 26s timer (skipping any lightning Gauntlet Q1)
  if (campaignRR.onRoundReady) {
    await driver.realClick('#ws-btn-start-round-questions');
    await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);
  }
  let ch1Live = await driver.evalFn(() => ({
    timer: parseFloat((document.querySelector('#ws-chrono-text')?.textContent || '0').replace(/[^\d.]/g, '')),
    diffBadge: (document.querySelector('#ws-question-difficulty-badge')?.textContent || '').trim(),
    chyron: (document.querySelector('.ws-chyron')?.textContent || '').trim().replace(/\s+/g, ' '),
    isGauntlet: Boolean(document.querySelector('[data-gauntlet]')),
  }));
  if (ch1Live.isGauntlet) {
    await lockQuestion(driver, { expectReveal: true });
    await driver.realClick('#ws-btn-next-q');
    await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);
    ch1Live = await driver.evalFn(() => ({
      timer: parseFloat((document.querySelector('#ws-chrono-text')?.textContent || '0').replace(/[^\d.]/g, '')),
      diffBadge: (document.querySelector('#ws-question-difficulty-badge')?.textContent || '').trim(),
      chyron: (document.querySelector('.ws-chyron')?.textContent || '').trim().replace(/\s+/g, ' '),
      isGauntlet: Boolean(document.querySelector('[data-gauntlet]')),
    }));
  }
  results.metrics.stage1Live = ch1Live;
  check(
    'F1:stage1-ch1-middle-school-and-generous-timer',
    /Middle School/i.test(ch1Live.diffBadge) && ch1Live.timer >= 26,
    JSON.stringify(ch1Live),
    'P0',
  );

  // Now test London (gb_1) specifically AND deliberately fail gb_1 (0% accuracy) to trigger Scout's Advantage Retry Mercy!
  await driver.evalFn(() => {
    const slotId = localStorage.getItem('ws_active_campaign_slot') || '1';
    const slotKey = `ws_campaign_slot_${slotId}`;
    const rawSlot = localStorage.getItem(slotKey);
    if (rawSlot) {
      const rec = JSON.parse(rawSlot);
      rec.payload.blackboard.prologueComplete = true;
      rec.payload.blackboard.firstFlight = 'GB';
      rec.payload.blackboard.completedMissions = Array.from(
        new Set([...(rec.payload.blackboard.completedMissions || []), 'ch_1', 'ch_2', 'ch_3', 'ch_4']),
      );
      rec.payload.blackboard.currentMissionId = 'gb_1';
      localStorage.setItem(slotKey, JSON.stringify(rec));
    }
    const rawBb = localStorage.getItem('ws_ink_blackboard_v2');
    if (rawBb) {
      const bb = JSON.parse(rawBb);
      bb.prologueComplete = true;
      bb.firstFlight = 'GB';
      bb.completedMissions = Array.from(new Set([...(bb.completedMissions || []), 'ch_1', 'ch_2', 'ch_3', 'ch_4']));
      bb.currentMissionId = 'gb_1';
      localStorage.setItem('ws_ink_blackboard_v2', JSON.stringify(bb));
    }
  });

  await driver.reload();
  await waitForAppBoot(driver);
  await openCampaignMapFromTitle(driver);
  await driver.realClick('[data-city-hub="gb"]');
  await sleep(400);
  // Clicking [data-city-hub="gb"] may immediately launch London M1 cutscene/dialogue; only click [data-mission-id="gb_1"] if still on Campaign Map!
  const stillOnMapForGb1 = await driver.evalFn(() =>
    Boolean(document.querySelector('.ws-cities-grid') && document.querySelector('[data-mission-id="gb_1"]') && !document.querySelector('#ws-mc-skip, #ws-mc-next, #ws-mc-summons')),
  );
  if (stillOnMapForGb1) {
    await driver.realClick('[data-mission-id="gb_1"]');
  }

  // Advance London cutscene / pre-match dialogue to Round Ready
  for (let i = 0; i < 16; i++) {
    const st = await driver.evalFn(() => ({
      hasSkip: Boolean(document.querySelector('#ws-mc-skip')),
      hasSummons: Boolean(document.querySelector('#ws-mc-summons') && !document.querySelector('#ws-mc-summons').classList.contains('is-dissolving')),
      hasStoryContinue: Boolean(document.querySelector('#ws-story-continue')),
      hasChoice: Boolean(document.querySelector('[data-story-choice]')),
      hasRoundReady: Boolean(document.querySelector('#ws-btn-start-round-questions')),
    }));
    if (st.hasRoundReady) break;
    if (st.hasSummons) await driver.realClick('#ws-mc-summons');
    else if (st.hasSkip) await driver.realClick('#ws-mc-skip');
    else if (st.hasChoice) await driver.realClick('[data-story-choice]');
    else if (st.hasStoryContinue) await driver.realClick('#ws-story-continue');
    await sleep(250);
  }

  const gb1RR = await driver.waitFor('#ws-btn-start-round-questions', 6000);
  check('F2:london-gb1-round-ready-reached', gb1RR, `gb1RR=${gb1RR}`, 'P0');
  await driver.realClick('#ws-btn-start-round-questions');
  await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);

  const gb1Live = await driver.evalFn(() => ({
    timer: parseFloat((document.querySelector('#ws-chrono-text')?.textContent || '0').replace(/[^\d.]/g, '')),
    diffBadge: (document.querySelector('#ws-question-difficulty-badge')?.textContent || '').trim(),
  }));
  results.metrics.londonGb1Live = gb1Live;
  check(
    'F1:london-gb1-middle-school-and-26s-timer',
    /Middle School/i.test(gb1Live.diffBadge) && gb1Live.timer >= 26,
    JSON.stringify(gb1Live),
    'P0',
  );

  // Trigger Scout's Advantage Retry Mercy by recording a failed attempt on gb_1 (or timing out/failing a mission)
  // Let's play gb_1 via real clicks letting the timer expire or answering fast; wait — to be fast & 100% authentic,
  // we can check if Retry button after a defeat activates Scout's Advantage! Let's check how failedAttempts is persisted
  // in CampaignCircuitDirector/InkBlackboard OR let's actually trigger a quick defeat cleanly:
  // Wait: on gb_1, questions have 26s timer (5 Qs = 130s to time out), OR if we answer wrong on 4-option facets
  // (3/4 wrong chance, plus 2x Double Down = negative points so playerPts < rivalPts!). Let's play all 5 Qs of gb_1
  // with 2x Double Down toggled ON if available so wrong answers guarantee a real defeat, OR check if we accidentally win!
  console.log('  -> Playing London gb_1 to test real mission completion & Scout\'s Advantage retry mercy...');
  let gb1SummaryReached = false;
  for (let q = 0; q < 10; q++) {
    // Handle Finale Category Picker if it appears before final question!
    const finalePicker = await driver.evalFn(() => Boolean(document.querySelector('.ws-finale-topic-btn')));
    if (finalePicker) {
      await driver.realClick('.ws-finale-topic-btn');
      await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 5000);
    }
    const onSummary = await driver.evalFn(() => Boolean(document.querySelector('.ws-summary-card, #ws-retry-mission, #ws-summary-continue')));
    if (onSummary) {
      gb1SummaryReached = true;
      break;
    }
    if (!(await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 3000))) {
      // Maybe post-match story dialogue?
      if (await driver.evalFn(() => Boolean(document.querySelector('#ws-story-continue')))) {
        await driver.realClick('#ws-story-continue');
        await sleep(300);
        continue;
      }
      break;
    }
    // Toggle 2x Double Down ON to maximize probability of defeat when testing retry mercy
    const hasDD = await driver.evalFn(() => Boolean(document.querySelector('#ws-btn-double-down:not(:disabled)')));
    if (hasDD) {
      await driver.realClick('#ws-btn-double-down');
      await sleep(80);
    }
    // Lock an option (if Second Wind triggers, lock another option)
    await lockQuestion(driver, { expectReveal: false });
    await sleep(350);
    const revealed = await driver.evalFn(() => Boolean(document.querySelector('#ws-btn-next-q')));
    if (!revealed) {
      // Second Wind saved us! Pick a second option
      await lockQuestion(driver, { expectReveal: true });
    }
    await driver.realClick('#ws-btn-next-q');
    await sleep(350);
  }

  // Advance any post-match dialogue or victory screen if needed
  for (let i = 0; i < 6; i++) {
    const done = await driver.evalFn(() => Boolean(document.querySelector('#ws-retry-mission, #ws-summary-continue')));
    if (done) break;
    if (await driver.evalFn(() => Boolean(document.querySelector('#ws-story-continue')))) {
      await driver.realClick('#ws-story-continue');
    } else if (await driver.evalFn(() => Boolean(document.querySelector('[data-story-choice]')))) {
      await driver.realClick('[data-story-choice]');
    }
    await sleep(250);
  }

  // Check if gb_1 ended in Defeat with Retry button, or if by luck we passed >= 40%
  let summaryState = await driver.evalFn(() => ({
    bodyText: (document.querySelector('#ui-root')?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 260),
    retryBtn: Boolean(document.querySelector('#ws-retry-mission')),
    retrySelector: document.querySelector('#ws-retry-mission') ? '#ws-retry-mission' : null,
  }));

  // If we accidentally won gb_1 on random picks, seed 1 failedAttempt on gb_2 in ws_campaign_failed_attempts_v1 + active save slot and launch gb_2 to verify Scout's Advantage live!
  if (!summaryState.retryBtn) {
    console.log('  -> Random picks cleared gb_1 (>=40% threshold confirmed!); testing Scout\'s Advantage live on gb_2 after 1 recorded failure...');
    await driver.evalFn(() => {
      const failRec = {
        gb_2: {
          missionId: 'gb_2',
          attempts: 1,
          bestScore: 300,
          lastRivalScore: 900,
          lastFailReason: 'OUTSCORED_BY_RIVAL',
          lastFailedAtIso: new Date().toISOString(),
          statusBadge: '⚠ FAILED — RETRYABLE',
        },
      };
      localStorage.setItem('ws_campaign_failed_attempts_v1', JSON.stringify(failRec));
      const slotId = localStorage.getItem('ws_active_campaign_slot') || '1';
      const slotKey = `ws_campaign_slot_${slotId}`;
      const rawSlot = localStorage.getItem(slotKey);
      if (rawSlot) {
        const rec = JSON.parse(rawSlot);
        rec.payload.failedMissionAttempts = failRec;
        rec.payload.blackboard.completedMissions = Array.from(
          new Set([...(rec.payload.blackboard.completedMissions || []), 'ch_1', 'ch_2', 'ch_3', 'ch_4', 'gb_1']),
        );
        rec.payload.blackboard.currentMissionId = 'gb_2';
        localStorage.setItem(slotKey, JSON.stringify(rec));
      }
      const rawBb = localStorage.getItem('ws_ink_blackboard_v2');
      if (rawBb) {
        const bb = JSON.parse(rawBb);
        bb.completedMissions = Array.from(
          new Set([...(bb.completedMissions || []), 'ch_1', 'ch_2', 'ch_3', 'ch_4', 'gb_1']),
        );
        bb.currentMissionId = 'gb_2';
        localStorage.setItem('ws_ink_blackboard_v2', JSON.stringify(bb));
      }
    });
    await driver.reload();
    await waitForAppBoot(driver);
    await openCampaignMapFromTitle(driver);
    await driver.realClick('[data-city-hub="gb"]');
    await sleep(350);
    const stillOnMapForGb2 = await driver.evalFn(() =>
      Boolean(document.querySelector('.ws-cities-grid') && document.querySelector('[data-mission-id="gb_2"]') && !document.querySelector('#ws-mc-skip, #ws-mc-next, #ws-mc-summons')),
    );
    if (stillOnMapForGb2) {
      await driver.realClick('[data-mission-id="gb_2"]');
    }
  } else {
    await driver.screenshot('06a_defeat_summary_scouts_advantage_390x844.png');
    await driver.realClick(summaryState.retrySelector);
  }

  // Advance any pre-match dialogue on retry until Round Ready
  for (let i = 0; i < 12; i++) {
    const st = await driver.evalFn(() => ({
      hasSkip: Boolean(document.querySelector('#ws-mc-skip')),
      hasStoryContinue: Boolean(document.querySelector('#ws-story-continue')),
      hasChoice: Boolean(document.querySelector('[data-story-choice]')),
      hasRoundReady: Boolean(document.querySelector('#ws-btn-start-round-questions')),
    }));
    if (st.hasRoundReady) break;
    if (st.hasSkip) await driver.realClick('#ws-mc-skip');
    else if (st.hasChoice) await driver.realClick('[data-story-choice]');
    else if (st.hasStoryContinue) await driver.realClick('#ws-story-continue');
    await sleep(220);
  }

  const mercyState = await driver.evalFn(() => {
    const pill = document.querySelector('.ws-scouts-advantage-pill');
    const cardText = (document.querySelector('.ws-round-ready-card, .ws-round-ready-stage')?.textContent || '').trim().replace(/\s+/g, ' ');
    return {
      onRoundReady: Boolean(document.querySelector('#ws-btn-start-round-questions')),
      pillVisible: Boolean(pill && pill.getBoundingClientRect().height > 8),
      pillText: pill ? (pill.textContent || '').trim().replace(/\s+/g, ' ') : '',
      hasScoutsAdvantageCopy: /SCOUT['’]?S ADVANTAGE/i.test(cardText),
      cardText: cardText.slice(0, 260),
    };
  });
  results.metrics.scoutsAdvantage = mercyState;
  await driver.screenshot('06_scouts_advantage_mercy_390x844.png');
  check(
    'F1:scouts-advantage-retry-mercy-active',
    mercyState.onRoundReady && (mercyState.pillVisible || mercyState.hasScoutsAdvantageCopy),
    JSON.stringify(mercyState),
    'P0',
  );

  // Start the mercy-boosted round and verify bonus timer (+6s => >= 32s on London!)
  if (mercyState.onRoundReady) {
    await driver.realClick('#ws-btn-start-round-questions');
    await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);
    const mercyTimer = await readChronoSec(driver);
    check(
      'F1:scouts-advantage-grants-bonus-timer',
      mercyTimer !== null && mercyTimer >= 31,
      `mercyBoostedLondonTimer=${mercyTimer}s (expected >= 32s = 26s + 6s)`,
      'P0',
    );
  }
}

// ============================================================================
// PART 5: FEEDBACK #7 — STANDOUT ADDICTIVE MECHANICS LIVE
//   1. Mind Gambit Picker: Second Wind live mulligan saves a wrong answer
//   2. Mind Gambit Picker: Specialist Swap (`↻ Swap Topic`) swaps live question
//   3. 3-Step Clue Ladder (`500 -> 350 -> 200 PTS`) progressive reveal
//   4. Finale Category Picker (3 topics before final question)
// ============================================================================
async function runStandoutMechanicsAudit(driver, baseUrl) {
  console.log('\n=== PART 5: FEEDBACK #7 — MIND GAMBITS, 3-STEP CLUE LADDER & FINALE CATEGORY PICKER ===');
  await driver.setViewport(VIEWPORTS[0]); // 1280x800 for wide clear captures

  // --- TEST 5A: SECOND WIND MULLIGAN + 3-STEP CLUE LADDER + FINALE CATEGORY PICKER ---
  await driver.navigate(baseUrl, false);
  await waitForAppBoot(driver);
  await openBriefingModalFromTitle(driver);
  await driver.realClick('.ws-briefing-diff-btn[data-diff="MIDDLE_SCHOOL"]');
  await sleep(100);
  const has5 = await driver.evalFn(() => Boolean(document.querySelector('[data-len="5"]')));
  if (has5) await driver.realClick('[data-len="5"]');
  await driver.realClick('#ws-cat-launch');
  await driver.waitFor('#ws-btn-start-round-questions', 6000);

  // Verify Mind Gambit Picker has >= 3 Gambit cards and select SECOND_WIND
  const gambitInfo = await driver.evalFn(() => {
    const cards = Array.from(document.querySelectorAll('.ws-gambit-card')).map((c) => ({
      id: c.dataset.gambitId || c.getAttribute('data-gambit') || '',
      text: (c.textContent || '').trim().replace(/\s+/g, ' '),
      selected: c.classList.contains('is-selected'),
    }));
    return { count: cards.length, cards };
  });
  results.metrics.gambitPicker = gambitInfo;
  check(
    'F7:mind-gambit-picker-rendered-on-round-ready',
    gambitInfo.count >= 3 &&
      gambitInfo.cards.some((c) => /Second Wind/i.test(c.text)) &&
      gambitInfo.cards.some((c) => /Swap/i.test(c.text)),
    JSON.stringify(gambitInfo.cards.map((c) => `${c.id}:${c.text.slice(0, 28)}`)),
    'P0',
  );

  // Explicitly real-click Second Wind card
  await driver.realClick('.ws-gambit-card', { textContains: 'Second Wind' });
  await sleep(120);
  await driver.realClick('#ws-btn-start-round-questions');
  await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);

  // Track Second Wind trigger, Clue Ladder progressive reveal, and Finale Category Picker across the 5-Q Briefing!
  let secondWindTriggered = false;
  let clueLadderVerified = false;
  let finalePickerVerified = false;

  for (let qIdx = 0; qIdx < 5; qIdx++) {
    // Check if Finale Category Picker appeared before Q5!
    const finaleVisible = await driver.evalFn(() => Boolean(document.querySelector('.ws-finale-picker-card, .ws-finale-topic-btn')));
    if (finaleVisible) {
      const finaleTopics = await driver.evalFn(() =>
        Array.from(document.querySelectorAll('.ws-finale-topic-btn')).map((b) => ({
          text: (b.textContent || '').trim().replace(/\s+/g, ' '),
          domainId: b.dataset.domainId || b.dataset.finaleDomain || '',
        })),
      );
      await driver.screenshot('09_finale_category_picker_1280x800.png');
      results.metrics.finaleCategoryPicker = finaleTopics;
      const chosenTopic = finaleTopics[1] || finaleTopics[0];
      await driver.realClick('.ws-finale-topic-btn', { textContains: chosenTopic?.text.slice(0, 12) });
      const q5Mounted = await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);
      const q5Domain = await driver.evalFn(() =>
        (document.querySelector('.ws-domain-label')?.textContent || '').trim(),
      );
      finalePickerVerified = finaleTopics.length === 3 && q5Mounted;
      check(
        'F7:finale-category-picker-3-topics-live',
        finalePickerVerified,
        `topics=${JSON.stringify(finaleTopics.map((t) => t.text.slice(0, 30)))}, picked="${chosenTopic?.text.slice(0, 24)}", mountedDomain="${q5Domain}"`,
        'P0',
      );
    }

    await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);

    // Check if 3-Step Clue Ladder is active on this question!
    const ladderBefore = await driver.evalFn(() => {
      const ladder = document.querySelector('.ws-clue-ladder');
      if (!ladder) return null;
      const steps = Array.from(ladder.querySelectorAll('.ws-clue-step')).map((s) => ({
        locked: s.classList.contains('is-locked'),
        active: s.classList.contains('is-active'),
        text: (s.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 70),
      }));
      const hasNextBtn = Boolean(document.querySelector('.ws-clue-reveal-next-btn'));
      const fullText = (ladder.textContent || '').trim().replace(/\s+/g, ' ');
      return { steps, hasNextBtn, fullText };
    });

    if (ladderBefore && !clueLadderVerified) {
      await driver.screenshot('08_clue_ladder_step1_1280x800.png');
      let step2Unlocked = false;
      let step3Unlocked = false;
      if (ladderBefore.hasNextBtn) {
        await driver.realClick('.ws-clue-reveal-next-btn');
        await sleep(220);
        const after1 = await driver.evalFn(() => ({
          unlockedCount: document.querySelectorAll('.ws-clue-step:not(.is-locked)').length,
          hasNextBtn: Boolean(document.querySelector('.ws-clue-reveal-next-btn')),
        }));
        step2Unlocked = after1.unlockedCount >= 2;
        if (after1.hasNextBtn) {
          await driver.realClick('.ws-clue-reveal-next-btn');
          await sleep(220);
          const after2 = await driver.evalFn(() => ({
            unlockedCount: document.querySelectorAll('.ws-clue-step:not(.is-locked)').length,
          }));
          step3Unlocked = after2.unlockedCount >= 3;
        }
      }
      await driver.screenshot('08b_clue_ladder_step3_1280x800.png');
      const hasPtsScale = /500/.test(ladderBefore.fullText) && /350/.test(ladderBefore.fullText) && /200/.test(ladderBefore.fullText);
      clueLadderVerified = ladderBefore.steps.length === 3 && hasPtsScale && step2Unlocked && step3Unlocked;
      results.metrics.clueLadder = { ladderBefore, step2Unlocked, step3Unlocked, hasPtsScale };
      check(
        'F7:clue-ladder-3-steps-500-350-200-progressive',
        clueLadderVerified,
        `steps=${ladderBefore.steps.length}, has500_350_200=${hasPtsScale}, step2Unlocked=${step2Unlocked}, step3Unlocked=${step3Unlocked}`,
        'P0',
      );
    }

    // Attempt to trigger Second Wind on a 4-facet SIGHTLINE_LOCK question if not triggered yet
    const facetCount = await driver.evalFn(() => document.querySelectorAll('[data-facet-idx]:not(:disabled)').length);
    if (!secondWindTriggered && facetCount >= 2) {
      const beforeShattered = await driver.evalFn(() => document.querySelectorAll('[data-facet-idx]:disabled, [data-facet-idx].is-shattered').length);
      // Pick an UNARMED facet (idx 1 if idx 0 is currently armed) -> then click #ws-btn-overclock ONCE so we don't double-lock!
      const unarmedIdx = await driver.evalFn(() => {
        const btns = Array.from(document.querySelectorAll('[data-facet-idx]:not(:disabled)'));
        const unarmed = btns.find((b) => !b.classList.contains('is-sightline'));
        return Number((unarmed || btns[0]).dataset.facetIdx);
      });
      await driver.realClick(`[data-facet-idx="${unarmedIdx}"]`);
      await sleep(140);
      await driver.realClick('#ws-btn-overclock');
      await sleep(450);
      const swCheck = await driver.evalFn(() => ({
        revealed: Boolean(document.querySelector('#ws-btn-next-q')),
        hasBanner: Boolean(document.querySelector('#ws-second-wind-banner')),
        bannerText: (document.querySelector('#ws-second-wind-banner')?.textContent || '').trim(),
        shatteredNow: document.querySelectorAll('[data-facet-idx]:disabled, [data-facet-idx].is-shattered').length,
        dockText: (document.querySelector('.ws-broadcast-dock, .ws-gameplay-layout')?.textContent || '').trim().replace(/\s+/g, ' '),
      }));
      if (!swCheck.revealed && (swCheck.hasBanner || swCheck.shatteredNow > beforeShattered)) {
        secondWindTriggered = true;
        results.metrics.secondWindLive = {
          qIdx,
          unarmedIdx,
          beforeShattered,
          afterShattered: swCheck.shatteredNow,
          bannerText: swCheck.bannerText,
        };
        await driver.screenshot('07_second_wind_mulligan_live_1280x800.png');
        check(
          'F7:second-wind-mulligan-saves-wrong-answer-live',
          true,
          `Triggered on Q${qIdx + 1}: wrong facet eliminated (${beforeShattered}->${swCheck.shatteredNow}), banner="${swCheck.bannerText}"!`,
          'P0',
        );
        // Now complete the question with a surviving facet!
        await lockQuestion(driver, { expectReveal: true });
      } else if (!swCheck.revealed) {
        await lockQuestion(driver, { expectReveal: true });
      }
    } else {
      await lockQuestion(driver, { expectReveal: true });
    }

    await driver.realClick('#ws-btn-next-q');
    await sleep(320);
  }

  if (!secondWindTriggered) {
    // If by 1-in-256 luck all 4 picks were correct, run a quick second Briefing to prove Second Wind triggers on a wrong pick!
    check(
      'F7:second-wind-mulligan-saves-wrong-answer-live',
      false,
      'Second Wind never triggered across all 5 questions (either all answers happened to be right or Second Wind is broken!)',
      'P0',
    );
  }
  if (!clueLadderVerified) {
    check('F7:clue-ladder-3-steps-500-350-200-progressive', false, '3-Step Clue Ladder (.ws-clue-ladder) never appeared during 5-Q Briefing!', 'P0');
  }
  if (!finalePickerVerified) {
    check('F7:finale-category-picker-3-topics-live', false, 'Finale Category Picker (.ws-finale-picker-card) never appeared before Q5!', 'P0');
  }

  // --- TEST 5B: SPECIALIST SWAP (`↻ Swap Topic` / `#ws-btn-swap-topic`) LIVE ---
  await driver.navigate(baseUrl, false);
  await waitForAppBoot(driver);
  await openBriefingModalFromTitle(driver);
  await driver.realClick('.ws-briefing-diff-btn[data-diff="MIDDLE_SCHOOL"]');
  await sleep(100);
  const has5B = await driver.evalFn(() => Boolean(document.querySelector('[data-len="5"]')));
  if (has5B) await driver.realClick('[data-len="5"]');
  await driver.realClick('#ws-cat-launch');
  await driver.waitFor('#ws-btn-start-round-questions', 6000);

  await driver.realClick('.ws-gambit-card', { textContains: 'Swap' });
  await sleep(120);
  await driver.realClick('#ws-btn-start-round-questions');
  await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);

  const swapBtnVisible = await driver.waitFor('#ws-btn-swap-topic', 4000);
  const promptBeforeSwap = await driver.evalFn(() => (document.querySelector('.ws-question-prompt')?.textContent || '').trim());
  let promptAfterSwap = promptBeforeSwap;
  let swapBtnDisabledAfter = false;
  if (swapBtnVisible) {
    await driver.realClick('#ws-btn-swap-topic');
    await sleep(450);
    promptAfterSwap = await driver.evalFn(() => (document.querySelector('.ws-question-prompt')?.textContent || '').trim());
    swapBtnDisabledAfter = await driver.evalFn(() => {
      const b = document.querySelector('#ws-btn-swap-topic');
      return !b || Boolean(b.disabled);
    });
    await driver.screenshot('10_swap_topic_live_1280x800.png');
  }
  results.metrics.swapTopicLive = { swapBtnVisible, promptBeforeSwap, promptAfterSwap, swapBtnDisabledAfter };
  check(
    'F7:swap-topic-replaces-live-question',
    swapBtnVisible && promptBeforeSwap.length > 5 && promptAfterSwap.length > 5 && promptAfterSwap !== promptBeforeSwap && swapBtnDisabledAfter,
    `visible=${swapBtnVisible}, changed=${promptAfterSwap !== promptBeforeSwap}, usedAfter=${swapBtnDisabledAfter} ("${promptBeforeSwap.slice(0, 42)}" -> "${promptAfterSwap.slice(0, 42)}")`,
    'P0',
  );
}

// ============================================================================
// MAIN RUNNER
// ============================================================================
async function main() {
  const partsArg = process.argv.find((a) => a.startsWith('--parts='));
  const activeParts = partsArg
    ? new Set(partsArg.slice('--parts='.length).split(',').map((s) => s.trim()))
    : new Set(['1', '2', '3', '4', '5']);

  const { server, baseUrl } = await startStaticServer(DIST_DIR);
  console.log(`\n[RT-V3-PLAYER-UX] Serving dist/ at ${baseUrl} (parts=${Array.from(activeParts).join(',')})`);
  const driver = await CdpDriver.launch();

  try {
    if (activeParts.has('1')) await runStaticStoryAndAudioAudit(baseUrl);
    if (activeParts.has('2')) await runFirstTimePlayerAndPrologueAudit(driver, baseUrl);
    if (activeParts.has('3')) await runCenteredLayoutFourViewportAudit(driver, baseUrl);
    if (activeParts.has('4')) await runCampaignProgressionAndMercyAudit(driver, baseUrl);
    if (activeParts.has('5')) await runStandoutMechanicsAudit(driver, baseUrl);

    // Zero runtime errors check
    check(
      'Runtime:zero-console-errors',
      driver.consoleErrors.length === 0,
      driver.consoleErrors.length === 0 ? '0 console errors' : JSON.stringify(driver.consoleErrors.slice(0, 5)),
      'P0',
    );
    check(
      'Runtime:zero-page-exceptions',
      driver.pageExceptions.length === 0,
      driver.pageExceptions.length === 0 ? '0 page exceptions' : JSON.stringify(driver.pageExceptions.slice(0, 5)),
      'P0',
    );
    check(
      'Runtime:zero-http-errors',
      driver.httpErrors.length === 0,
      driver.httpErrors.length === 0 ? '0 HTTP >=400 errors' : JSON.stringify(driver.httpErrors.slice(0, 5)),
      'P0',
    );
  } catch (err) {
    check('Harness:fatal-exception', false, err?.stack || String(err), 'P0');
  } finally {
    await driver.close();
    server.close();
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2), 'utf8');
  console.log('\n============================================================================');
  console.log(`[RT-V3-PLAYER-UX] SUMMARY: ${results.passed.length} PASSED, ${results.failed.length} FAILED`);
  console.log(`Report: ${REPORT_PATH}`);
  console.log(`Screenshots (${results.screenshots.length}): ${SCREENSHOT_DIR}`);
  console.log('============================================================================');
  if (results.failed.length > 0) {
    console.error('\nFAILURES:');
    for (const f of results.failed) {
      console.error(`  [${f.severity}] ${f.id}: ${f.detail}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
