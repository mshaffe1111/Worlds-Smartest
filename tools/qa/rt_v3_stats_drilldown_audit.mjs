#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST v3.0 — RT-V3-STATS-GATE
// Interactive Analytics Drill-Down, Cross-Suite Deep-Link & Gold-Master Gate
//
// Proves live against compiled `dist/` (ephemeral 127.0.0.1:0 — NEVER :8088!)
// using REAL CDP pointer clicks (`Input.dispatchMouseEvent`) across BOTH
// Mobile Portrait (`390x844`) & Desktop (`1280x800`):
//   1. Seed 18 rich varied QuestionAnalyticsEvents across 3 Domains
//      (History=0, Science=1, Sports=5), 3 Morphs (SIGHTLINE_LOCK,
//      CALIBRATOR_DIAL, GAUNTLET_SHATTER), Right & Wrong, Double-Down wagers,
//      Hint/Peel tiers 1-3, 5 Speed buckets, 6 Subcategories, and 3 UTC dates,
//      plus matching Due SRS Missed Cards across those domains!
//   2. Click Domain Row AND Polar Radar Spoke (`Science`, domainId=1):
//      - `#ws-stats-filter-bar` shows Science active chip
//      - Top KPI Right+Wrong == ONLY Science (4R·3W = 7, NOT 11R·7W = 18)
//      - Graph 1 bars sum to Science events (4R + 3W = 7)
//      - Subcategory Breakdown renders for Science (Astronomy & Space, Physics & Chemistry)
//      - Graph 4A Morph counts sum to Science events (4R + 3W = 7)
//      - Graph 4B Speed Histogram bars sum to Science events (7)
//      - Section 5 Question Ledger lists ONLY Science events (7 rows, 0 other domains)
//   3. Click Outcome Filter (`Wrong Only`):
//      - Top KPI `Right === 0` (`0R · 7W`)
//      - Graph 1, Domain bars, Morph rows, Speed histogram, and Ledger ALL reflect
//        ONLY missed questions (`0` right anywhere!)
//   4. Stacked Multi-Filter (`Science` + `Calibrator Dial` + Speed Bucket `3–6s`):
//      - Every section recalculates cleanly (`Science` 4R·3W -> +`CALIBRATOR_DIAL` 1R·2W
//        -> +`Speed 3–6s` 1R·1W = 2 events)
//      - Clicking `[Reset All]` restores exact unfiltered 11R·7W (18 events)!
//   5. All Cross-Suite Deep Links:
//      - `▶ Practice This Slice` (filtered to Science) -> launches live 5-Q Briefing in Science
//      - `✦ Review Missed Cards` (filtered to Science) -> opens Observatory Mastery Deck pre-filtered to Science
//      - `◆ Related Trophies` -> opens Hall of Honours (verifying 88 Honours & 44 Unlockables)
//      - Passport -> click Domain Visa row (`[data-passport-domain-stats]`) -> opens Career Stats pre-filtered to that exact domain!
//   6. Sleek & Zero-Regression Checks on every rendered Career Stats / Meta screen:
//      - 0 nested 4-sided boxes, 0 backdrop-filter, 0 OS color emojis, 0 year commas,
//        0px horizontal overflow, 0 console/page/HTTP-404 errors, < 350 kB entry JS!
// ============================================================================

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const DIST_DIR = path.join(ROOT, 'dist');

const CLI_ARGS = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const idx = a.indexOf('=');
      return idx === -1 ? [a.slice(2), 'true'] : [a.slice(2, idx), a.slice(idx + 1)];
    }),
);

const SHOT_DIR =
  CLI_ARGS.out ||
  'C:/Users/mshaf/.gemini/antigravity/brain/a15a1907-a6e0-4eae-9423-161998a0fcd2';

fs.mkdirSync(SHOT_DIR, { recursive: true });
fs.mkdirSync(path.join(SHOT_DIR, 'scratch'), { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.gz': 'application/gzip',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findBrowserBin() {
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
  throw new Error('Could not find msedge.exe or chrome.exe');
}

function startDistServer(rootDir = DIST_DIR) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(rootDir, 'index.html'))) {
      reject(new Error(`dist/index.html missing at ${rootDir}`));
      return;
    }
    const server404s = [];
    const server = http.createServer((req, res) => {
      try {
        const parsed = new URL(req.url || '/', 'http://127.0.0.1');
        let rel = decodeURIComponent(parsed.pathname);
        if (rel === '/' || rel === '') rel = '/index.html';
        const safePath = path.resolve(rootDir, '.' + rel);
        if (!safePath.startsWith(rootDir)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }
        let target = safePath;
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
          target = path.join(target, 'index.html');
        }
        if (!fs.existsSync(target)) {
          server404s.push(rel);
          res.writeHead(404);
          res.end(`Not Found: ${rel}`);
          return;
        }
        const ext = path.extname(target).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
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
        server404s,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

// ============================================================================
// MINIMAL ZERO-DEPENDENCY CDP DRIVER WITH REAL POINTER CLICKS
// ============================================================================
class CdpDriver {
  constructor(proc, ws, profileDir) {
    this.proc = proc;
    this.ws = ws;
    this.profileDir = profileDir;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.sessionId = null;
    this.targetId = null;
    this.consoleErrors = [];
    this.pageErrors = [];
    this.httpErrors = [];
  }

  static async launch() {
    const bin = findBrowserBin();
    const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-v3-stats-gate-'));
    const proc = spawn(
      bin,
      [
        '--headless=new',
        '--remote-debugging-port=0',
        `--user-data-dir=${profileDir}`,
        '--enable-webgl',
        '--ignore-gpu-blocklist',
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--disable-gpu-sandbox',
        '--autoplay-policy=no-user-gesture-required',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        'about:blank',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );

    let stderr = '';
    const wsUrl = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Browser launch timeout:\n${stderr}`)), 25000);
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
        reject(new Error(`Browser exited early (${code}):\n${stderr}`));
      });
    });

    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });

    const driver = new CdpDriver(proc, ws, profileDir);
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.id && driver.pending.has(msg.id)) {
        const { resolve, reject } = driver.pending.get(msg.id);
        driver.pending.delete(msg.id);
        if (msg.error) reject(new Error(`CDP ${msg.error.code}: ${msg.error.message}`));
        else resolve(msg.result);
      } else if (msg.method) {
        const hs = driver.listeners.get(msg.method) || [];
        for (const h of hs) h(msg.params, msg.sessionId);
      }
    });

    driver.on('Runtime.exceptionThrown', (params, sid) => {
      if (sid !== driver.sessionId) return;
      const msg = params.exceptionDetails?.exception?.description || params.exceptionDetails?.text || 'Exception';
      driver.pageErrors.push(msg);
    });
    driver.on('Runtime.consoleAPICalled', (params, sid) => {
      if (sid !== driver.sessionId) return;
      if (params.type === 'error') {
        const txt = (params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
        driver.consoleErrors.push(txt);
      }
    });
    driver.on('Network.responseReceived', (params, sid) => {
      if (sid !== driver.sessionId) return;
      if (params.response.status >= 400 && !/fonts\.g/i.test(params.response.url)) {
        driver.httpErrors.push(`${params.response.status} ${params.response.url}`);
      }
    });

    await driver.openNewPage();
    return driver;
  }

  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
  }

  sendRaw(method, params = {}, sessionId = undefined) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }

  send(method, params = {}) {
    return this.sendRaw(method, params, this.sessionId);
  }

  async openNewPage() {
    if (this.targetId) {
      try {
        await this.sendRaw('Target.closeTarget', { targetId: this.targetId });
      } catch {}
    }
    const { targetId } = await this.sendRaw('Target.createTarget', { url: 'about:blank' });
    this.targetId = targetId;
    const { sessionId } = await this.sendRaw('Target.attachToTarget', { targetId, flatten: true });
    this.sessionId = sessionId;
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Network.enable');
    this.consoleErrors = [];
    this.pageErrors = [];
    this.httpErrors = [];
  }

  async setViewport(width, height, mobile = false, dpr = 1) {
    try {
      const { windowId } = await this.sendRaw('Browser.getWindowForTarget', { targetId: this.targetId });
      await this.sendRaw('Browser.setWindowBounds', {
        windowId,
        bounds: { width, height, windowState: 'normal' },
      });
    } catch {}
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: dpr,
      mobile,
    });
    this.vp = { width, height, mobile, dpr };
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await sleep(1600);
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(
        'Page eval error: ' +
          (res.exceptionDetails.exception?.description || res.exceptionDetails.text),
      );
    }
    return res.result?.value;
  }

  async evalFn(fn, ...args) {
    const serialized = args.map((a) => JSON.stringify(a)).join(', ');
    return this.eval(`(${fn.toString()})(${serialized})`);
  }

  async waitFor(fn, arg = null, timeoutMs = 10000, pollMs = 100) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const ok = await this.evalFn(fn, arg);
      if (ok) return true;
      await sleep(pollMs);
    }
    return false;
  }

  /**
   * Real CDP Pointer Click (`mouseMoved` -> `mousePressed` -> `mouseReleased`)
   * after scrolling the target element cleanly into viewport center!
   */
  async cdpClick(selectorOrPredicate, opts = {}) {
    const { isFn = false, scroll = true, settleMs = 240 } = opts;
    const target = await this.evalFn(
      (sel, fnMode, shouldScroll) => {
        let el = null;
        if (fnMode) {
          el = eval(sel)();
        } else {
          el = document.querySelector(sel);
        }
        if (!el) return { found: false, reason: 'not_found' };
        if (shouldScroll && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
        }
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          return { found: false, reason: 'zero_box' };
        }
        const cx = Math.max(1, Math.min(window.innerWidth - 1, rect.left + rect.width / 2));
        const cy = Math.max(1, Math.min(window.innerHeight - 1, rect.top + rect.height / 2));
        const hit = document.elementFromPoint(cx, cy);
        const hitOk = Boolean(
          hit &&
            (hit === el ||
              el.contains(hit) ||
              (typeof hit.closest === 'function' && hit.closest('[data-g2-dom], [data-arch-filter], [data-speed-bucket], [data-passport-domain-stats], button') === el)),
        );
        return {
          found: true,
          cx,
          cy,
          rect: {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          },
          hitOk,
          hitTag: hit ? `${hit.tagName.toLowerCase()}${hit.id ? '#' + hit.id : ''}` : 'null',
          text: (el.textContent || '').trim().slice(0, 60),
        };
      },
      selectorOrPredicate,
      isFn,
      scroll,
    );

    if (!target.found) return target;
    await sleep(60);

    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: target.cx,
      y: target.cy,
      button: 'none',
    });
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: target.cx,
      y: target.cy,
      button: 'left',
      clickCount: 1,
    });
    await sleep(30);
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: target.cx,
      y: target.cy,
      button: 'left',
      clickCount: 1,
    });
    await sleep(settleMs);
    return target;
  }

  async screenshot(absPath) {
    await this.eval(`new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    const { data } = await this.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: this.vp.width, height: this.vp.height, scale: 1 },
    });
    fs.writeFileSync(absPath, Buffer.from(data, 'base64'));
    return absPath;
  }

  async close() {
    try {
      this.ws.close();
    } catch {}
    try {
      this.proc.kill();
    } catch {}
    try {
      fs.rmSync(this.profileDir, { recursive: true, force: true });
    } catch {}
  }
}

// ============================================================================
// DETERMINISTIC 18-EVENT SEEDED DATASET + MATCHING SRS MISSED CARDS
// ============================================================================
function buildSeededAnalyticsAndSrs() {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const toKey = (ts) => new Date(ts).toISOString().slice(0, 10);
  const dMinus2 = toKey(now - 2 * DAY);
  const dMinus1 = toKey(now - 1 * DAY);
  const dToday = toKey(now);

  // 18 carefully crafted events across:
  //  - Domain 0 (History): 6 events -> 4R, 2W
  //  - Domain 1 (Science): 7 events -> 4R, 3W
  //  - Domain 5 (Sports):  5 events -> 3R, 2W
  // Total = 18 events -> 11R, 7W
  // Science + CALIBRATOR_DIAL = 3 events -> 1R, 2W
  // Science + CALIBRATOR_DIAL + Speed Bucket 1 (3-6s) = 2 events -> 1R, 1W
  const rawEvents = [
    // History (Domain 0): 4R, 2W
    { ts: now - 2 * DAY + 1000, dateKey: dMinus2, qid: 101, domainId: 0, subcatLabel: 'Ancient Empires', mode: 'CAMPAIGN', hubId: 'ch', archetype: 'SIGHTLINE_LOCK', correct: true, peelTier: 1, overclockCharge01: 0.92, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 2200, speedBucketIdx: 0, pointsDelta: 3200, eloAfter: 1220, difficultyTier: 'MIDDLE_SCHOOL', promptSnippet: 'Which ancient wonder stood in Alexandria harbor?' },
    { ts: now - 2 * DAY + 2000, dateKey: dMinus2, qid: 102, domainId: 0, subcatLabel: 'Ancient Empires', mode: 'CAMPAIGN', hubId: 'ch', archetype: 'CALIBRATOR_DIAL', correct: false, peelTier: 2, overclockCharge01: 0.0, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 7400, speedBucketIdx: 2, pointsDelta: 0, eloAfter: 1205, difficultyTier: 'HIGH_SCHOOL', promptSnippet: 'In what year was the Magna Carta sealed at Runnymede?' },
    { ts: now - 1 * DAY + 1000, dateKey: dMinus1, qid: 103, domainId: 0, subcatLabel: 'Modern Wars', mode: 'BRIEFING', hubId: 'gb', archetype: 'GAUNTLET_SHATTER', correct: true, peelTier: 1, overclockCharge01: 0.0, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 4100, speedBucketIdx: 1, pointsDelta: 1800, eloAfter: 1225, difficultyTier: 'HIGH_SCHOOL', promptSnippet: 'Which 1945 conference divided postwar Europe?' },
    { ts: now - 1 * DAY + 2000, dateKey: dMinus1, qid: 104, domainId: 0, subcatLabel: 'Modern Wars', mode: 'BRIEFING', hubId: 'gb', archetype: 'SIGHTLINE_LOCK', correct: true, peelTier: 3, overclockCharge01: 0.0, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 11500, speedBucketIdx: 3, pointsDelta: 900, eloAfter: 1235, difficultyTier: 'COLLEGE', promptSnippet: 'Which treaty ended World War I in 1919?' },
    { ts: now - 3600000 * 5, dateKey: dToday, qid: 105, domainId: 0, subcatLabel: 'Ancient Empires', mode: 'DAILY', hubId: 'ch', archetype: 'CALIBRATOR_DIAL', correct: true, peelTier: 1, overclockCharge01: 0.90, backfired: false, bluffCalled: false, bullseye: true, responseTimeMs: 5100, speedBucketIdx: 1, pointsDelta: 3400, eloAfter: 1255, difficultyTier: 'COLLEGE', promptSnippet: 'In what year did the Western Roman Empire fall?' },
    { ts: now - 3600000 * 4, dateKey: dToday, qid: 106, domainId: 0, subcatLabel: 'Modern Wars', mode: 'DAILY', hubId: 'ch', archetype: 'GAUNTLET_SHATTER', correct: false, peelTier: 2, overclockCharge01: 0.85, backfired: true, bluffCalled: false, bullseye: false, responseTimeMs: 16200, speedBucketIdx: 4, pointsDelta: 0, eloAfter: 1230, difficultyTier: 'GRADUATE', promptSnippet: 'Which naval engagement turned the Pacific theater in 1942?' },

    // Science (Domain 1): 4R, 3W
    { ts: now - 2 * DAY + 3000, dateKey: dMinus2, qid: 201, domainId: 1, subcatLabel: 'Astronomy & Space', mode: 'CAMPAIGN', hubId: 'ch', archetype: 'SIGHTLINE_LOCK', correct: true, peelTier: 1, overclockCharge01: 0.95, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 2400, speedBucketIdx: 0, pointsDelta: 3600, eloAfter: 1258, difficultyTier: 'MIDDLE_SCHOOL', promptSnippet: 'Which ringed planet is sixth from the Sun?' },
    { ts: now - 2 * DAY + 4000, dateKey: dMinus2, qid: 202, domainId: 1, subcatLabel: 'Astronomy & Space', mode: 'BRIEFING', hubId: 'jp', archetype: 'CALIBRATOR_DIAL', correct: true, peelTier: 1, overclockCharge01: 0.0, backfired: false, bluffCalled: false, bullseye: true, responseTimeMs: 4500, speedBucketIdx: 1, pointsDelta: 2100, eloAfter: 1272, difficultyTier: 'MIDDLE_SCHOOL', promptSnippet: 'In what year did Apollo 11 land on the Moon?' },
    { ts: now - 1 * DAY + 3000, dateKey: dMinus1, qid: 203, domainId: 1, subcatLabel: 'Astronomy & Space', mode: 'BRIEFING', hubId: 'jp', archetype: 'CALIBRATOR_DIAL', correct: false, peelTier: 2, overclockCharge01: 0.0, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 4800, speedBucketIdx: 1, pointsDelta: 0, eloAfter: 1255, difficultyTier: 'HIGH_SCHOOL', promptSnippet: 'In what year was the Hubble Space Telescope launched?' },
    { ts: now - 1 * DAY + 4000, dateKey: dMinus1, qid: 204, domainId: 1, subcatLabel: 'Physics & Chemistry', mode: 'CAMPAIGN', hubId: 'jp', archetype: 'GAUNTLET_SHATTER', correct: true, peelTier: 2, overclockCharge01: 0.0, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 8200, speedBucketIdx: 2, pointsDelta: 1500, eloAfter: 1270, difficultyTier: 'COLLEGE', promptSnippet: 'Which noble gas glows orange-red in discharge tubes?' },
    { ts: now - 3600000 * 3, dateKey: dToday, qid: 205, domainId: 1, subcatLabel: 'Physics & Chemistry', mode: 'ENDLESS', hubId: 'ch', archetype: 'SIGHTLINE_LOCK', correct: false, peelTier: 3, overclockCharge01: 0.88, backfired: true, bluffCalled: false, bullseye: false, responseTimeMs: 12100, speedBucketIdx: 3, pointsDelta: 0, eloAfter: 1248, difficultyTier: 'GRADUATE', promptSnippet: 'What SI unit measures magnetic flux?' },
    { ts: now - 3600000 * 2, dateKey: dToday, qid: 206, domainId: 1, subcatLabel: 'Physics & Chemistry', mode: 'DAILY', hubId: 'ch', archetype: 'CALIBRATOR_DIAL', correct: false, peelTier: 1, overclockCharge01: 0.91, backfired: true, bluffCalled: false, bullseye: false, responseTimeMs: 16800, speedBucketIdx: 4, pointsDelta: 0, eloAfter: 1228, difficultyTier: 'MENSA', promptSnippet: 'In what year was the Higgs boson announced at CERN?' },
    { ts: now - 3600000 * 1, dateKey: dToday, qid: 207, domainId: 1, subcatLabel: 'Astronomy & Space', mode: 'BRIEFING', hubId: 'jp', archetype: 'GAUNTLET_SHATTER', correct: true, peelTier: 1, overclockCharge01: 0.0, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 4200, speedBucketIdx: 1, pointsDelta: 2000, eloAfter: 1244, difficultyTier: 'HIGH_SCHOOL', promptSnippet: 'Which Voyager probe crossed the heliopause first?' },

    // Sports & Games (Domain 5): 3R, 2W
    { ts: now - 2 * DAY + 5000, dateKey: dMinus2, qid: 301, domainId: 5, subcatLabel: 'Baseball', mode: 'BRIEFING', hubId: 'ch', archetype: 'SIGHTLINE_LOCK', correct: true, peelTier: 1, overclockCharge01: 0.90, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 2600, speedBucketIdx: 0, pointsDelta: 3300, eloAfter: 1265, difficultyTier: 'HIGH_SCHOOL', promptSnippet: 'Which outfielder broke the MLB color barrier in 1947?' },
    { ts: now - 1 * DAY + 5000, dateKey: dMinus1, qid: 302, domainId: 5, subcatLabel: 'Baseball', mode: 'BRIEFING', hubId: 'ch', archetype: 'GAUNTLET_SHATTER', correct: false, peelTier: 2, overclockCharge01: 0.0, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 8800, speedBucketIdx: 2, pointsDelta: 0, eloAfter: 1250, difficultyTier: 'COLLEGE', promptSnippet: 'Which pitcher threw the only World Series perfect game?' },
    { ts: now - 1 * DAY + 6000, dateKey: dMinus1, qid: 303, domainId: 5, subcatLabel: 'Olympics', mode: 'CAMPAIGN', hubId: 'gb', archetype: 'CALIBRATOR_DIAL', correct: true, peelTier: 2, overclockCharge01: 0.0, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 5300, speedBucketIdx: 1, pointsDelta: 1700, eloAfter: 1268, difficultyTier: 'HIGH_SCHOOL', promptSnippet: 'In what year were the first modern Olympic Games held?' },
    { ts: now - 1800000, dateKey: dToday, qid: 304, domainId: 5, subcatLabel: 'Baseball', mode: 'BRIEFING', hubId: 'ch', archetype: 'SIGHTLINE_LOCK', correct: false, peelTier: 3, overclockCharge01: 0.0, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 13200, speedBucketIdx: 3, pointsDelta: 0, eloAfter: 1252, difficultyTier: 'GRADUATE', promptSnippet: 'Which ballpark features the Green Monster left-field wall?' },
    { ts: now - 600000, dateKey: dToday, qid: 305, domainId: 5, subcatLabel: 'Olympics', mode: 'TRIALS', hubId: 'ch', archetype: 'GAUNTLET_SHATTER', correct: true, peelTier: 1, overclockCharge01: 0.94, backfired: false, bluffCalled: false, bullseye: false, responseTimeMs: 2100, speedBucketIdx: 0, pointsDelta: 3500, eloAfter: 1278, difficultyTier: 'COLLEGE', promptSnippet: 'Which sprinter set the 100m world record of 9.58 seconds?' },
  ];

  // Aggregate exact lifetime state matching rawEvents 1-to-1
  const byDomain = Array.from({ length: 12 }, () => ({
    right: 0,
    wrong: 0,
    totalResponseMs: 0,
    peakElo: 1200,
    lastElo: 1200,
  }));
  const byArchetype = {
    SIGHTLINE_LOCK: { right: 0, wrong: 0 },
    CODEX_DUAL_RING: { right: 0, wrong: 0 },
    CALIBRATOR_DIAL: { right: 0, wrong: 0 },
    GAUNTLET_SHATTER: { right: 0, wrong: 0 },
    HERO_ARTIFACT_SYNTHESIS: { right: 0, wrong: 0 },
    GLOBE_PIN_DROP: { right: 0, wrong: 0 },
  };
  const byPeelTier = { '1': { right: 0, wrong: 0 }, '2': { right: 0, wrong: 0 }, '3': { right: 0, wrong: 0 } };
  const byMode = {
    CAMPAIGN: { right: 0, wrong: 0, matchesPlayed: 1, matchesWon: 1, bestScore: 8000 },
    DAILY: { right: 0, wrong: 0, matchesPlayed: 1, matchesWon: 1, bestScore: 6500 },
    BRIEFING: { right: 0, wrong: 0, matchesPlayed: 2, matchesWon: 1, bestScore: 7200 },
    ENDLESS: { right: 0, wrong: 0, matchesPlayed: 1, matchesWon: 0, bestScore: 4200 },
    TRIALS: { right: 0, wrong: 0, matchesPlayed: 1, matchesWon: 1, bestScore: 5500 },
    PROLOGUE: { right: 0, wrong: 0, matchesPlayed: 1, matchesWon: 1, bestScore: 4800 },
  };
  const speedBuckets = Array.from({ length: 5 }, () => ({ right: 0, wrong: 0 }));
  const dailyBuckets = {};
  const overclock = {
    safeLockWins: 0,
    safeLockMisses: 0,
    overclockWins: 0,
    overclockMisses: 0,
    max6xWins: 0,
    backfires: 0,
    consecutiveMax6xWins: 0,
    bestConsecutiveMax6xWins: 0,
    currentMatchMax6xWins: 0,
    currentMatchPeelsUsed: 0,
  };

  let totalRight = 0;
  let totalWrong = 0;
  let totalResponseMs = 0;
  let totalPointsEarned = 0;
  let curStreak = 0;
  let bestStreak = 0;
  const uniqueSolvedQids = [];

  for (const ev of rawEvents) {
    totalResponseMs += ev.responseTimeMs;
    totalPointsEarned += ev.pointsDelta;
    byDomain[ev.domainId].totalResponseMs += ev.responseTimeMs;
    byDomain[ev.domainId].lastElo = ev.eloAfter;
    byDomain[ev.domainId].peakElo = Math.max(byDomain[ev.domainId].peakElo, ev.eloAfter);

    const isOc = ev.overclockCharge01 >= 0.08;
    const isMax6x = ev.overclockCharge01 >= 0.88 && ev.peelTier === 1;
    if (!dailyBuckets[ev.dateKey]) {
      dailyBuckets[ev.dateKey] = {
        dateKey: ev.dateKey,
        right: 0,
        wrong: 0,
        totalResponseMs: 0,
        maxStreak: 0,
        pointsEarned: 0,
        max6xWins: 0,
        backfires: 0,
        eloEnd: ev.eloAfter,
      };
    }
    const db = dailyBuckets[ev.dateKey];
    db.totalResponseMs += ev.responseTimeMs;
    db.pointsEarned += ev.pointsDelta;
    db.eloEnd = ev.eloAfter;

    if (ev.correct) {
      totalRight++;
      curStreak++;
      bestStreak = Math.max(bestStreak, curStreak);
      db.right++;
      db.maxStreak = Math.max(db.maxStreak, curStreak);
      byDomain[ev.domainId].right++;
      byArchetype[ev.archetype].right++;
      byPeelTier[String(ev.peelTier)].right++;
      byMode[ev.mode].right++;
      speedBuckets[ev.speedBucketIdx].right++;
      uniqueSolvedQids.push(ev.qid);
      if (isOc) {
        overclock.overclockWins++;
        if (isMax6x) {
          overclock.max6xWins++;
          db.max6xWins++;
          overclock.consecutiveMax6xWins++;
          overclock.bestConsecutiveMax6xWins = Math.max(
            overclock.bestConsecutiveMax6xWins,
            overclock.consecutiveMax6xWins,
          );
        }
      } else {
        overclock.safeLockWins++;
      }
    } else {
      totalWrong++;
      curStreak = 0;
      db.wrong++;
      byDomain[ev.domainId].wrong++;
      byArchetype[ev.archetype].wrong++;
      byPeelTier[String(ev.peelTier)].wrong++;
      byMode[ev.mode].wrong++;
      speedBuckets[ev.speedBucketIdx].wrong++;
      if (isOc) {
        overclock.overclockMisses++;
        overclock.backfires++;
        db.backfires++;
        overclock.consecutiveMax6xWins = 0;
      } else {
        overclock.safeLockMisses++;
      }
    }
  }

  const analyticsState = {
    schemaVersion: 1,
    backfilledFromLegacy: true,
    totalRight,
    totalWrong,
    totalResponseMs,
    totalPointsEarned,
    currentStreak: curStreak,
    bestStreak,
    fastUnder3sStreak: 1,
    bestFastUnder3sStreak: 1,
    globalEloLatest: 1278,
    globalEloPeak: 1278,
    uniqueSolvedQids,
    uniqueSolvedCount: uniqueSolvedQids.length,
    byDomain,
    byArchetype,
    byPeelTier,
    byMode,
    speedBuckets,
    overclock,
    feats: {
      passportStamped: true,
      prologueCleared: true,
      act1Cleared: false,
      campaignCompleted: false,
      rivalBluffsCaught: 0,
      sorenCoinBluffDefeated: false,
      bluffEchoCancels: 0,
      uvScansCount: 0,
      scannedRelicIds: [],
      openedLatchKeys: [],
      atelierFinishesEquipped: 0,
      backstageInterrogations: 0,
      factionPledged: false,
      flawlessBossWins: 0,
      unpeeledBossWins: 0,
      perfectMatchesCount: 0,
      max3x6xInSingleMatch: false,
      calibratorBullseyes: 2,
      codexFirstTryLocks: 0,
      ghostTrialWins: 0,
      blackSalonWins: 0,
      dailyBroadcastsCompleted: 1,
      completedDailyDates: [dToday],
      maxEndlessDepth: 1,
      achievedEndings: [],
      difficultyRoundsCleared: {
        MIDDLE_SCHOOL: 1,
        HIGH_SCHOOL: 1,
        COLLEGE: 0,
        GRADUATE: 0,
        MENSA: 0,
      },
      difficultyBestAccuracyPct: {
        MIDDLE_SCHOOL: 80,
        HIGH_SCHOOL: 70,
        COLLEGE: 0,
        GRADUATE: 0,
        MENSA: 0,
      },
      globeBullseyes300Km: 0,
      globeNoPeel120Km: 0,
      visualBlueprintsSolved: 0,
      tier1ColdDomains: [0, 1, 5],
      duelChallengesPlayed: 0,
      duelGhostWins: 0,
      srsReviewsCompleted: 0,
      offlinePacksCached: 0,
    },
    dailyBuckets,
    sessions: [
      { ts: now - 2 * DAY + 6000, dateKey: dMinus2, mode: 'CAMPAIGN', hubId: 'ch', won: true, right: 4, wrong: 1, score: 8900, eloAfter: 1265, maxOverclockWinsInMatch: 2, peelsUsedInMatch: 1, shieldsLostInMatch: 0, isBossShowdown: false },
      { ts: now - 1 * DAY + 7000, dateKey: dMinus1, mode: 'BRIEFING', hubId: 'jp', won: true, right: 4, wrong: 2, score: 7100, eloAfter: 1268, maxOverclockWinsInMatch: 0, peelsUsedInMatch: 2, shieldsLostInMatch: 0, isBossShowdown: false },
      { ts: now - 500000, dateKey: dToday, mode: 'DAILY', hubId: 'ch', won: true, right: 3, wrong: 4, score: 8900, eloAfter: 1278, maxOverclockWinsInMatch: 2, peelsUsedInMatch: 2, shieldsLostInMatch: 1, isBossShowdown: false },
    ],
    events: rawEvents,
  };

  // Matching SRS Missed Cards for EVERY wrong question in rawEvents (2 History, 3 Science, 2 Sports)
  const srsCards = rawEvents
    .filter((e) => !e.correct)
    .map((e) => ({
      qid: e.qid,
      prompt: e.promptSnippet,
      correctAnswer:
        e.qid === 102
          ? '1215'
          : e.qid === 106
            ? 'Battle of Midway'
            : e.qid === 203
              ? '1990'
              : e.qid === 205
                ? 'Weber'
                : e.qid === 206
                  ? '2012'
                  : e.qid === 302
                    ? 'Don Larsen'
                    : 'Fenway Park',
      distractors: ['Alpha Option', 'Beta Option', 'Gamma Option'],
      whyExplanation: `Verified reference note for QID ${e.qid} (${e.subcatLabel}).`,
      domainId: e.domainId,
      subcatLabel: e.subcatLabel,
      box: 1,
      source: 'MISSED',
      isBookmarked: false,
      createdAtMs: e.ts,
      lastReviewedAtMs: null,
      nextReviewAtMs: now - 60_000,
      totalReviews: 0,
      correctReviews: 0,
      wrongReviews: 0,
      streakInDeck: 0,
    }));

  const srsState = {
    schemaVersion: 2,
    updatedAtMs: now,
    cards: srsCards,
  };

  return { analyticsState, srsState, rawEvents };
}

// ============================================================================
// IN-PAGE DOM TELEMETRY & SLEEK AUDIT EXTRACTORS
// ============================================================================

/**
 * Extracts exact rendered metrics from CareerAnalyticsDashboardView DOM:
 * - Filter bar text, chips, action buttons
 * - Top KPI Right / Wrong counts
 * - Graph 1 bar count & Right/Wrong sums (from bar data attrs or rendered rect heights)
 * - Graph 2 Domain row counts & Subcategory Breakdown rows
 * - Graph 3 ELO polyline coordinates
 * - Graph 4A Morph row counts & Peel/Hint tier counts
 * - Graph 4B Speed Histogram bar counts (`[data-speed-bucket]`)
 * - Section 5 Question Ledger Tape rows (count, right/wrong, domain names)
 */
function readCareerStatsDomState() {
  const modal = document.querySelector('.ws-meta-backdrop, .ws-meta-shell');
  if (!modal) return { open: false };

  const filterBar = document.querySelector('#ws-stats-filter-bar');
  const filterBarText = filterBar ? filterBar.textContent.replace(/\s+/g, ' ').trim() : '';

  // Parse Top KPI Right / Wrong (`11R · 7W` or `4R · 3W` etc.)
  const kpiCells = [...modal.querySelectorAll('.ws-meta-kpi-strip .ws-meta-kpi-cell')];
  let kpiRight = null;
  let kpiWrong = null;
  let kpiAccuracy = null;
  let kpiRawText = '';
  for (const cell of kpiCells) {
    const txt = (cell.textContent || '').replace(/\s+/g, ' ').trim();
    const m = txt.match(/(\d+)\s*R\s*[·/•-]\s*(\d+)\s*W/i);
    if (m && kpiRight === null) {
      kpiRight = parseInt(m[1], 10);
      kpiWrong = parseInt(m[2], 10);
      kpiRawText = txt;
    }
    if (/accuracy/i.test(txt)) {
      kpiAccuracy = txt;
    }
  }

  // Graph 1: Stacked Right/Wrong bars (`[data-g1-idx]`)
  const g1Groups = [...modal.querySelectorAll('g[data-g1-idx]')];
  let g1RightSum = 0;
  let g1WrongSum = 0;
  let g1HasAttrCounts = false;
  for (const g of g1Groups) {
    const dr = g.getAttribute('data-g1-right') ?? g.getAttribute('data-right');
    const dw = g.getAttribute('data-g1-wrong') ?? g.getAttribute('data-wrong');
    if (dr !== null && dw !== null) {
      g1HasAttrCounts = true;
      g1RightSum += parseInt(dr, 10) || 0;
      g1WrongSum += parseInt(dw, 10) || 0;
    } else {
      const rects = [...g.querySelectorAll('rect')];
      for (const r of rects) {
        const fill = (r.getAttribute('fill') || '').toLowerCase();
        if (fill.includes('39d49a') || fill.includes('emerald')) g1RightSum += 1;
        if (fill.includes('e05263') || fill.includes('crimson')) g1WrongSum += 1;
      }
    }
  }

  // Graph 2: 12 Domain rows (`div[data-g2-dom], button[data-g2-dom]`, excluding SVG `<text>`)
  const domainRows = [...modal.querySelectorAll('[data-g2-dom]')]
    .filter((el) => el.tagName.toLowerCase() !== 'text' && el.tagName.toLowerCase() !== 'g' && el.tagName.toLowerCase() !== 'line' && el.tagName.toLowerCase() !== 'circle')
    .map((el) => {
      const id = parseInt(el.getAttribute('data-g2-dom') || '-1', 10);
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
      const m = txt.match(/(\d+)\s*R\s*[·/•-]\s*(\d+)\s*W/i);
      return {
        domainId: id,
        right: m ? parseInt(m[1], 10) : 0,
        wrong: m ? parseInt(m[2], 10) : 0,
        active: el.classList.contains('is-focused') || el.classList.contains('is-active') || el.getAttribute('aria-pressed') === 'true',
        text: txt,
      };
    });

  // Subcategory Breakdown rows (`[data-subcat-filter]`)
  const subcatRows = [...modal.querySelectorAll('[data-subcat-filter]')].map((el) => {
    const label = el.getAttribute('data-subcat-filter') || '';
    const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const m = txt.match(/(\d+)\s*R\s*[·/•-]\s*(\d+)\s*W/i);
    return {
      label,
      right: m ? parseInt(m[1], 10) : 0,
      wrong: m ? parseInt(m[2], 10) : 0,
      text: txt,
    };
  });

  // Graph 3: ELO SVG polyline points signature
  const eloPolylines = [...modal.querySelectorAll('svg polyline')]
    .map((pl) => pl.getAttribute('points') || '')
    .filter(Boolean);

  // Graph 4A: Morph rows (`[data-arch-filter]`)
  const morphRows = [...modal.querySelectorAll('[data-arch-filter]')].map((el) => {
    const arch = el.getAttribute('data-arch-filter') || '';
    const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const m = txt.match(/(\d+)\s*R\s*[·/•-]\s*(\d+)\s*W/i);
    return {
      arch,
      right: m ? parseInt(m[1], 10) : 0,
      wrong: m ? parseInt(m[2], 10) : 0,
      active: el.classList.contains('is-active') || el.classList.contains('is-focused') || el.getAttribute('aria-pressed') === 'true',
      text: txt,
    };
  });

  // Graph 4A: Peel/Hint tier cells (`[data-peel-filter]`)
  const peelCells = [...modal.querySelectorAll('[data-peel-filter]')].map((el) => {
    const tier = el.getAttribute('data-peel-filter') || '';
    const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const m = txt.match(/(\d+)\s*R\s*[·/•/-]\s*(\d+)\s*W/i);
    return {
      tier,
      right: m ? parseInt(m[1], 10) : 0,
      wrong: m ? parseInt(m[2], 10) : 0,
      text: txt,
    };
  });

  // Graph 4B: Speed Histogram buckets (`[data-speed-bucket]`)
  const speedBuckets = [...modal.querySelectorAll('[data-speed-bucket]')].map((el) => {
    const idx = parseInt(el.getAttribute('data-speed-bucket') || '-1', 10);
    const attrTotal = el.getAttribute('data-count') ?? el.getAttribute('data-total');
    const attrRight = el.getAttribute('data-right');
    const attrWrong = el.getAttribute('data-wrong');
    let total = null;
    if (attrTotal !== null) {
      total = parseInt(attrTotal, 10);
    } else if (attrRight !== null && attrWrong !== null) {
      total = (parseInt(attrRight, 10) || 0) + (parseInt(attrWrong, 10) || 0);
    } else {
      // First numeric <text> inside the SVG <g> is the count label
      const texts = [...el.querySelectorAll('text')].map((t) => (t.textContent || '').trim());
      const numText = texts.find((t) => /^\d+$/.test(t));
      if (numText !== undefined) total = parseInt(numText, 10);
    }
    return {
      idx,
      total: total ?? 0,
      right: attrRight !== null ? parseInt(attrRight, 10) : null,
      wrong: attrWrong !== null ? parseInt(attrWrong, 10) : null,
    };
  });

  // Section 5: Question Ledger Tape rows
  // Find the section whose title contains "Question Ledger"
  const sections = [...modal.querySelectorAll('.ws-meta-section')];
  const ledgerSection = sections.find((s) => /question ledger/i.test(s.textContent || ''));
  const ledgerRowEls = ledgerSection
    ? [...ledgerSection.querySelectorAll('[data-ledger-row], .ws-meta-row')]
    : [];
  const ledgerRows = ledgerRowEls.map((el) => {
    const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
    const domAttr = el.getAttribute('data-domain-id');
    const correctAttr = el.getAttribute('data-correct');
    const isRight =
      correctAttr !== null
        ? correctAttr === 'true' || correctAttr === '1'
        : txt.includes('✓') && !txt.startsWith('✕');
    return {
      domainId: domAttr !== null ? parseInt(domAttr, 10) : null,
      isRight,
      text: txt,
    };
  });

  return {
    open: true,
    filterBarPresent: Boolean(filterBar),
    filterBarText,
    hasPracticeBtn: Boolean(modal.querySelector('#ws-stats-practice-slice')),
    hasSrsBtn: Boolean(modal.querySelector('#ws-stats-open-srs')),
    hasHonoursBtn: Boolean(modal.querySelector('#ws-stats-open-honours')),
    hasResetBtn: Boolean(
      modal.querySelector('#ws-stats-reset-filters, [data-stats-reset], [data-reset-filters]'),
    ),
    kpiRight,
    kpiWrong,
    kpiTotal: (kpiRight ?? 0) + (kpiWrong ?? 0),
    kpiAccuracy,
    kpiRawText,
    g1BarCount: g1Groups.length,
    g1RightSum,
    g1WrongSum,
    g1TotalSum: g1RightSum + g1WrongSum,
    g1HasAttrCounts,
    domainRows,
    domainRightSum: domainRows.reduce((a, d) => a + d.right, 0),
    domainWrongSum: domainRows.reduce((a, d) => a + d.wrong, 0),
    subcatRows,
    eloPolylines,
    morphRows,
    morphRightSum: morphRows.reduce((a, m) => a + m.right, 0),
    morphWrongSum: morphRows.reduce((a, m) => a + m.wrong, 0),
    peelCells,
    speedBuckets,
    speedTotalSum: speedBuckets.reduce((a, b) => a + b.total, 0),
    ledgerCount: ledgerRows.length,
    ledgerRightCount: ledgerRows.filter((r) => r.isRight).length,
    ledgerWrongCount: ledgerRows.filter((r) => !r.isRight).length,
    ledgerRows,
  };
}

/**
 * Checks zero-regression visual invariants on the current rendered DOM:
 * - 0 nested 4-sided boxes (depth >= 2)
 * - 0 backdrop-filter
 * - 0 OS color emojis
 * - 0 year commas (e.g. `1,969` or `2,012`)
 * - 0px horizontal overflow
 */
function runVisualHygieneProbe(label) {
  const vw = window.innerWidth;
  const docOverflowPx = Math.max(0, document.documentElement.scrollWidth - vw);

  // Check OS color emojis (same regex class used by rt_sleek_design_audit.mjs)
  const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{26A1}\u{26A0}\u{2705}\u{274C}\u{1F1E6}-\u{1F1FF}]/gu;
  const YEAR_COMMA_RE = /\b(?:in|from|year|born|died|since|until|before|after|launched|announced|sealed|held)\s+[12],\d{3}\b|\b[12],\d{3}\s*(?:CE|BCE|AD|BC)\b/gi;

  let backdropCount = 0;
  let maxBoxDepth = 0;
  const emojis = [];
  const yearCommas = [];

  function has4SidedBorder(cs) {
    const bw = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map((v) =>
      parseFloat(v) || 0,
    );
    const bs = [cs.borderTopStyle, cs.borderRightStyle, cs.borderBottomStyle, cs.borderLeftStyle];
    const bc = [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor];
    return (
      bw.every((w) => w >= 0.5) &&
      bs.every((s) => s !== 'none' && s !== 'hidden') &&
      bc.every((c) => c !== 'transparent' && !c.endsWith(', 0)'))
    );
  }

  const allEls = [...document.querySelectorAll('*')];
  for (const el of allEls) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;

    const bf = cs.backdropFilter || cs.webkitBackdropFilter || 'none';
    if (bf && bf !== 'none') backdropCount++;

    if (has4SidedBorder(cs) && r.width >= 36 && r.height >= 24) {
      let depth = 1;
      let p = el.parentElement;
      while (p && p !== document.body) {
        const pcs = getComputedStyle(p);
        const pr = p.getBoundingClientRect();
        if (has4SidedBorder(pcs) && pr.width >= 44 && pr.height >= 30) {
          depth++;
        }
        p = p.parentElement;
      }
      if (depth > maxBoxDepth) maxBoxDepth = depth;
    }

    // Scan direct text nodes for OS emojis & year commas
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
        const txt = node.nodeValue;
        const em = txt.match(EMOJI_RE);
        if (em) emojis.push(...em.map((ch) => `${ch} in "${txt.trim().slice(0, 40)}"`));
        const yc = txt.match(YEAR_COMMA_RE);
        if (yc) yearCommas.push(...yc);
      }
    }
  }

  return {
    label,
    vw,
    docOverflowPx,
    backdropCount,
    maxBoxDepth,
    emojiCount: emojis.length,
    emojis: emojis.slice(0, 8),
    yearCommaCount: yearCommas.length,
    yearCommas: yearCommas.slice(0, 8),
  };
}

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================
async function openVaultAndSection(driver, targetIdSelectors) {
  // First try direct visible button
  for (const sel of targetIdSelectors) {
    const hit = await driver.cdpClick(sel, { settleMs: 380 });
    if (hit.found) return sel;
  }
  // Open Vault Drawer via real CDP click
  const vaultOpened = await driver.cdpClick('#ws-util-vault, .ws-vault-trigger, [data-vault-trigger]', {
    settleMs: 360,
  });
  if (!vaultOpened.found) return null;

  await driver.waitFor(
    () => {
      const d = document.querySelector('#ws-vault-drawer.is-open, .ws-vault-drawer.is-open');
      if (!d) return false;
      const r = d.getBoundingClientRect();
      const cs = getComputedStyle(d);
      const settled = cs.transform === 'none' || cs.transform === 'matrix(1, 0, 0, 1, 0, 0)';
      return settled && r.width > 40 && r.right <= window.innerWidth + 2;
    },
    null,
    4000,
    50,
  );
  await sleep(240);

  for (const sel of targetIdSelectors) {
    const hit = await driver.cdpClick(sel, { settleMs: 420 });
    if (hit.found) return `vault->${sel}`;
  }
  return null;
}

// ============================================================================
// MAIN SUITE EXECUTION
// ============================================================================
async function runViewportDrilldownAudit(driver, baseUrl, vp, checks) {
  const tag = `${vp.width}x${vp.height}`;
  const assert = (name, condition, detail = '') => {
    const fullName = `[${tag}] ${name}`;
    checks.push({ name: fullName, pass: Boolean(condition), detail });
    console.log(`  ${condition ? 'PASS' : 'FAIL'} | ${fullName}${detail ? ` — ${detail}` : ''}`);
  };

  console.log(`\n============================================================`);
  console.log(`[RT-V3-STATS-GATE] Running Interactive Drill-Down Audit @ ${tag}`);
  console.log(`============================================================`);

  await driver.openNewPage();
  await driver.setViewport(vp.width, vp.height, vp.mobile, vp.dpr);
  await driver.navigate(`${baseUrl}/?rt_v3_stats=${Date.now()}`);

  // Seed deterministic 18-event Career Analytics + 7 Due SRS Missed Cards into localStorage, then reload!
  const { analyticsState, srsState } = buildSeededAnalyticsAndSrs();
  await driver.evalFn(
    (an, srs) => {
      localStorage.clear();
      localStorage.setItem('ws_career_analytics_v1', JSON.stringify(an));
      localStorage.setItem('ws_spaced_repetition_v2', JSON.stringify(srs));
    },
    analyticsState,
    srsState,
  );
  await driver.navigate(`${baseUrl}/?rt_v3_stats_seeded=${Date.now()}`);

  const appReady = await driver.waitFor(
    () => Boolean(document.querySelector('#ws-title-enter-cta, .ws-topbar')),
    null,
    12000,
  );
  assert('App boots cleanly with seeded analytics & SRS state', appReady);
  if (!appReady) return;

  // -------------------------------------------------------------------------
  // STEP 1: Open Career Stats Dashboard & Verify Unfiltered Baseline (11R · 7W = 18)
  // -------------------------------------------------------------------------
  const openedStats = await openVaultAndSection(driver, [
    '#ws-util-stats',
    '[data-vault-action="ANALYTICS"]',
    '[data-vault-action="stats"]',
  ]);
  const statsReady = await driver.waitFor(
    () => Boolean(document.querySelector('.ws-meta-backdrop, .ws-meta-shell')),
    null,
    5000,
  );
  assert('Open Career Stats via real CDP click', Boolean(openedStats && statsReady), String(openedStats));
  if (!statsReady) return;
  await sleep(350);

  const baseDom = await driver.evalFn(readCareerStatsDomState);
  const baseHygiene = await driver.evalFn(runVisualHygieneProbe, `${tag}:stats_unfiltered`);
  await driver.screenshot(path.join(SHOT_DIR, `v3_stats_01_unfiltered_${tag}.png`));

  assert(
    'Unfiltered KPI equals 11R · 7W (18 events)',
    baseDom.kpiRight === 11 && baseDom.kpiWrong === 7,
    `got ${baseDom.kpiRight}R · ${baseDom.kpiWrong}W (raw: "${baseDom.kpiRawText}")`,
  );
  assert(
    'Unfiltered Graph 1 sums to 18 events (11R · 7W)',
    baseDom.g1TotalSum === 18 && baseDom.g1RightSum === 11 && baseDom.g1WrongSum === 7,
    `bars=${baseDom.g1BarCount}, sum=${baseDom.g1RightSum}R+${baseDom.g1WrongSum}W=${baseDom.g1TotalSum}`,
  );
  assert(
    'Unfiltered Graph 4A Morph counts sum to 18 (11R · 7W)',
    baseDom.morphRightSum === 11 && baseDom.morphWrongSum === 7,
    `morphSum=${baseDom.morphRightSum}R+${baseDom.morphWrongSum}W`,
  );
  assert(
    'Unfiltered Graph 4B Speed Histogram sums to 18',
    baseDom.speedTotalSum === 18,
    `speedSum=${baseDom.speedTotalSum}, buckets=${JSON.stringify(baseDom.speedBuckets)}`,
  );
  assert(
    'Unfiltered Section 5 Ledger lists all 18 events',
    baseDom.ledgerCount === 18 && baseDom.ledgerRightCount === 11 && baseDom.ledgerWrongCount === 7,
    `ledger=${baseDom.ledgerCount} (${baseDom.ledgerRightCount}R/${baseDom.ledgerWrongCount}W)`,
  );
  assert(
    'Unfiltered Career Stats passes Sleek Hygiene (0 nested boxes, 0 backdrop, 0 emoji, 0 year commas, 0px overflow)',
    baseHygiene.maxBoxDepth <= 1 &&
      baseHygiene.backdropCount === 0 &&
      baseHygiene.emojiCount === 0 &&
      baseHygiene.yearCommaCount === 0 &&
      baseHygiene.docOverflowPx <= 1,
    JSON.stringify(baseHygiene),
  );

  // -------------------------------------------------------------------------
  // STEP 2A: Click Domain Row (`Science`, domainId=1) via REAL CDP Click
  // -------------------------------------------------------------------------
  const domRowClick = await driver.cdpClick('div[data-g2-dom="1"], button[data-g2-dom="1"]', {
    settleMs: 360,
  });
  assert('CDP click on Domain Row (Science, domainId=1)', domRowClick.found, JSON.stringify(domRowClick));

  const sciDom = await driver.evalFn(readCareerStatsDomState);
  const sciHygiene = await driver.evalFn(runVisualHygieneProbe, `${tag}:stats_science_row`);
  await driver.screenshot(path.join(SHOT_DIR, `v3_stats_02_science_drilldown_${tag}.png`));

  assert(
    '#ws-stats-filter-bar visible & shows Science chip',
    sciDom.filterBarPresent && /science/i.test(sciDom.filterBarText),
    `filterBar="${sciDom.filterBarText}"`,
  );
  assert(
    'Science Drill-Down: Top KPI Right+Wrong == ONLY Science (4R · 3W = 7, NOT 18)',
    sciDom.kpiRight === 4 && sciDom.kpiWrong === 3,
    `got ${sciDom.kpiRight}R · ${sciDom.kpiWrong}W`,
  );
  assert(
    'Science Drill-Down: Graph 1 bars sum to ONLY Science (4R + 3W = 7)',
    sciDom.g1TotalSum === 7 && sciDom.g1RightSum === 4 && sciDom.g1WrongSum === 3,
    `bars=${sciDom.g1BarCount}, sum=${sciDom.g1RightSum}R+${sciDom.g1WrongSum}W=${sciDom.g1TotalSum}`,
  );
  assert(
    'Science Drill-Down: Subcategory Breakdown appears for Science (Astronomy & Space + Physics & Chemistry)',
    sciDom.subcatRows.length >= 2 &&
      sciDom.subcatRows.some((s) => /astronomy/i.test(s.text)) &&
      sciDom.subcatRows.some((s) => /physics/i.test(s.text)),
    `subcats=${JSON.stringify(sciDom.subcatRows.map((s) => s.text))}`,
  );
  assert(
    'Science Drill-Down: Graph 4A Morph counts sum to ONLY Science (4R + 3W = 7)',
    sciDom.morphRightSum === 4 && sciDom.morphWrongSum === 3,
    `morphSum=${sciDom.morphRightSum}R+${sciDom.morphWrongSum}W`,
  );
  assert(
    'Science Drill-Down: Graph 4B Speed Histogram bars sum to ONLY Science (7)',
    sciDom.speedTotalSum === 7,
    `speedSum=${sciDom.speedTotalSum}, buckets=${JSON.stringify(sciDom.speedBuckets)}`,
  );
  const ledgerOnlyScience =
    sciDom.ledgerCount === 7 &&
    sciDom.ledgerRightCount === 4 &&
    sciDom.ledgerWrongCount === 3 &&
    sciDom.ledgerRows.every(
      (r) =>
        (r.domainId === 1 || /science/i.test(r.text)) &&
        !/history|sports/i.test(r.text),
    );
  assert(
    'Science Drill-Down: Section 5 Question Ledger lists ONLY Science events (7 rows, 0 other domains)',
    ledgerOnlyScience,
    `ledger=${sciDom.ledgerCount} (${sciDom.ledgerRightCount}R/${sciDom.ledgerWrongCount}W)`,
  );
  assert(
    'Science Drill-Down passes Sleek Hygiene (0 nested boxes, 0 backdrop, 0 emoji, 0px overflow)',
    sciHygiene.maxBoxDepth <= 1 &&
      sciHygiene.backdropCount === 0 &&
      sciHygiene.emojiCount === 0 &&
      sciHygiene.docOverflowPx <= 1,
    JSON.stringify(sciHygiene),
  );

  // -------------------------------------------------------------------------
  // STEP 2B: Toggle Off via Polar Radar Spoke & Re-Select via Polar Radar Spoke (`svg [data-g2-dom="1"]`)
  // -------------------------------------------------------------------------
  const radarToggleOff = await driver.cdpClick('svg [data-g2-dom="1"]', { settleMs: 320 });
  const afterRadarOff = await driver.evalFn(readCareerStatsDomState);
  assert(
    'Polar Radar Spoke click toggles Science filter OFF (restores 11R · 7W)',
    radarToggleOff.found && afterRadarOff.kpiRight === 11 && afterRadarOff.kpiWrong === 7,
    `click=${radarToggleOff.found}, kpi=${afterRadarOff.kpiRight}R·${afterRadarOff.kpiWrong}W`,
  );

  const radarSelectSci = await driver.cdpClick('svg [data-g2-dom="1"]', { settleMs: 320 });
  const afterRadarOn = await driver.evalFn(readCareerStatsDomState);
  assert(
    'Polar Radar Spoke click filters EVERY section to Science (4R · 3W, Ledger=7, Morph=7, Speed=7)',
    radarSelectSci.found &&
      afterRadarOn.kpiRight === 4 &&
      afterRadarOn.kpiWrong === 3 &&
      afterRadarOn.g1TotalSum === 7 &&
      afterRadarOn.morphRightSum + afterRadarOn.morphWrongSum === 7 &&
      afterRadarOn.speedTotalSum === 7 &&
      afterRadarOn.ledgerCount === 7,
    `kpi=${afterRadarOn.kpiRight}R·${afterRadarOn.kpiWrong}W, g1=${afterRadarOn.g1TotalSum}, ledger=${afterRadarOn.ledgerCount}`,
  );

  // Reset to All before testing Outcome Filter (Wrong Only)
  await driver.cdpClick('#ws-stats-reset-filters, [data-stats-reset], [data-reset-filters]', {
    settleMs: 300,
  });

  // -------------------------------------------------------------------------
  // STEP 3: Outcome Filter (`Wrong Only`)
  // -------------------------------------------------------------------------
  const wrongClick = await driver.cdpClick('[data-outcome-filter="WRONG"]', { settleMs: 340 });
  const wrongDom = await driver.evalFn(readCareerStatsDomState);
  if (vp.width >= 1000) {
    await driver.screenshot(path.join(SHOT_DIR, `v3_stats_03_wrong_only_${tag}.png`));
  }

  assert(
    'Outcome Filter (Wrong Only): Top KPI Right === 0 & Wrong === 7',
    wrongClick.found && wrongDom.kpiRight === 0 && wrongDom.kpiWrong === 7,
    `click=${wrongClick.found}, kpi=${wrongDom.kpiRight}R·${wrongDom.kpiWrong}W`,
  );
  assert(
    'Outcome Filter (Wrong Only): 100% of Graph 1, Domain bars, Morph rows, Speed & Ledger reflect ONLY misses',
    wrongDom.g1RightSum === 0 &&
      wrongDom.g1WrongSum === 7 &&
      wrongDom.domainRightSum === 0 &&
      wrongDom.domainWrongSum === 7 &&
      wrongDom.morphRightSum === 0 &&
      wrongDom.morphWrongSum === 7 &&
      wrongDom.speedTotalSum === 7 &&
      wrongDom.ledgerCount === 7 &&
      wrongDom.ledgerRightCount === 0 &&
      wrongDom.ledgerWrongCount === 7,
    `g1=${wrongDom.g1RightSum}R/${wrongDom.g1WrongSum}W, dom=${wrongDom.domainRightSum}R/${wrongDom.domainWrongSum}W, morph=${wrongDom.morphRightSum}R/${wrongDom.morphWrongSum}W, speed=${wrongDom.speedTotalSum}, ledger=${wrongDom.ledgerRightCount}R/${wrongDom.ledgerWrongCount}W`,
  );

  // Reset before Stacked Filtering test
  await driver.cdpClick('#ws-stats-reset-filters, [data-stats-reset], [data-reset-filters]', {
    settleMs: 300,
  });

  // -------------------------------------------------------------------------
  // STEP 4: Stacked Multi-Dimensional Filtering:
  //   Science (domainId=1) + Calibrator Dial (`CALIBRATOR_DIAL`) + Speed Bucket 1 (`3–6s`)
  // -------------------------------------------------------------------------
  await driver.cdpClick('div[data-g2-dom="1"], button[data-g2-dom="1"]', { settleMs: 280 });
  const morphClick = await driver.cdpClick('[data-arch-filter="CALIBRATOR_DIAL"]', { settleMs: 320 });
  const sciMorphDom = await driver.evalFn(readCareerStatsDomState);
  assert(
    'Stacked Filter (Science + Calibrator Dial): 1R · 2W (3 events) across KPI, Graph 1, Speed & Ledger',
    morphClick.found &&
      sciMorphDom.kpiRight === 1 &&
      sciMorphDom.kpiWrong === 2 &&
      sciMorphDom.g1TotalSum === 3 &&
      sciMorphDom.speedTotalSum === 3 &&
      sciMorphDom.ledgerCount === 3,
    `kpi=${sciMorphDom.kpiRight}R·${sciMorphDom.kpiWrong}W, g1=${sciMorphDom.g1TotalSum}, speed=${sciMorphDom.speedTotalSum}, ledger=${sciMorphDom.ledgerCount}`,
  );

  const speedClick = await driver.cdpClick('[data-speed-bucket="1"]', { settleMs: 320 });
  const stackedDom = await driver.evalFn(readCareerStatsDomState);
  await driver.screenshot(path.join(SHOT_DIR, `v3_stats_04_stacked_morph_speed_${tag}.png`));

  const calRow = stackedDom.morphRows.find((m) => m.arch === 'CALIBRATOR_DIAL');
  const speedB1 = stackedDom.speedBuckets.find((b) => b.idx === 1);
  assert(
    'Stacked Filter (+ Speed Bucket 1 [3–6s]): KPI/Graph1/Ledger=1R·1W (2), Calibrator=1R·1W, Bucket1=2 (faceted cross-filter)',
    speedClick.found &&
      stackedDom.kpiRight === 1 &&
      stackedDom.kpiWrong === 1 &&
      stackedDom.g1RightSum === 1 &&
      stackedDom.g1WrongSum === 1 &&
      stackedDom.ledgerCount === 2 &&
      stackedDom.ledgerRightCount === 1 &&
      stackedDom.ledgerWrongCount === 1 &&
      calRow?.right === 1 &&
      calRow?.wrong === 1 &&
      stackedDom.morphRightSum === 2 &&
      stackedDom.morphWrongSum === 1 &&
      speedB1?.total === 2 &&
      stackedDom.speedTotalSum === 3,
    `kpi=${stackedDom.kpiRight}R·${stackedDom.kpiWrong}W, g1=${stackedDom.g1RightSum}R+${stackedDom.g1WrongSum}W, cal=${calRow?.right}R·${calRow?.wrong}W (sib=${stackedDom.morphRightSum}+${stackedDom.morphWrongSum}), b1=${speedB1?.total} (sib=${stackedDom.speedTotalSum}), ledger=${stackedDom.ledgerCount}`,
  );

  // Click [Reset All] and verify full unfiltered dataset is restored!
  const resetClick = await driver.cdpClick(
    '#ws-stats-reset-filters, [data-stats-reset], [data-reset-filters]',
    { settleMs: 320 },
  );
  const resetDom = await driver.evalFn(readCareerStatsDomState);
  assert(
    '[Reset All] restores full unfiltered dataset (11R · 7W = 18 across all sections)',
    resetClick.found &&
      resetDom.kpiRight === 11 &&
      resetDom.kpiWrong === 7 &&
      resetDom.g1TotalSum === 18 &&
      resetDom.morphRightSum + resetDom.morphWrongSum === 18 &&
      resetDom.speedTotalSum === 18 &&
      resetDom.ledgerCount === 18,
    `kpi=${resetDom.kpiRight}R·${resetDom.kpiWrong}W, ledger=${resetDom.ledgerCount}`,
  );

  // -------------------------------------------------------------------------
  // STEP 5A: Cross-Suite Deep Link #1 — `✦ Review Missed Cards` (filtered to Science)
  // -------------------------------------------------------------------------
  await driver.cdpClick('div[data-g2-dom="1"], button[data-g2-dom="1"]', { settleMs: 300 });
  const srsBtnClick = await driver.cdpClick('#ws-stats-open-srs', { settleMs: 550 });
  const obsCheck = await driver.evalFn(() => {
    const dialog = document.querySelector('.ws-meta-backdrop, .ws-meta-shell');
    const txt = dialog ? dialog.textContent.replace(/\s+/g, ' ').trim() : '';
    const isObs = /observatory|mastery deck|spaced|review/i.test(txt);
    // Check active domain filter pill or displayed card domains inside Mastery Deck
    const activeDomPill = document.querySelector(
      '[data-srs-domain="1"].is-active, [data-flash-domain="1"].is-active, [data-domain-filter="1"].is-active, [data-obs-domain="1"].is-active',
    );
    const hasScienceCard = /hubble|magnetic flux|higgs/i.test(txt);
    const hasNonScienceCard = /magna carta|pacific theater|world series perfect|green monster/i.test(txt);
    return {
      isObs,
      hasActiveDomPill: Boolean(activeDomPill),
      hasScienceCard,
      hasNonScienceCard,
      snippet: txt.slice(0, 260),
    };
  });
  if (vp.width < 600) {
    await driver.screenshot(path.join(SHOT_DIR, `v3_stats_06_srs_science_deeplink_${tag}.png`));
  }
  assert(
    'Deep Link: `✦ Review Missed Cards` (Science) opens Observatory Mastery Deck pre-filtered to Science',
    srsBtnClick.found && obsCheck.isObs && (obsCheck.hasActiveDomPill || (obsCheck.hasScienceCard && !obsCheck.hasNonScienceCard)),
    JSON.stringify(obsCheck),
  );

  // -------------------------------------------------------------------------
  // STEP 5B: Cross-Suite Deep Link #2 — Passport Domain Visa Row -> Career Stats Pre-Filtered
  // -------------------------------------------------------------------------
  // Jump to Passport via Vault Jumper or Escape + Vault
  await driver.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await sleep(300);
  const openedPass = await openVaultAndSection(driver, [
    '#ws-util-passport',
    '[data-vault-action="PASSPORT"]',
    '[data-vault-action="passport"]',
  ]);
  await sleep(450);
  // Look for [data-passport-domain-stats] (check RADAR / VISAS / current tab)
  let hasPassDomRow = await driver.eval(`Boolean(document.querySelector('[data-passport-domain-stats]'))`);
  if (!hasPassDomRow) {
    await driver.cdpClick('[data-passport-tab="RADAR"], [data-tab="RADAR"]', { settleMs: 320 });
    hasPassDomRow = await driver.eval(`Boolean(document.querySelector('[data-passport-domain-stats]'))`);
  }
  if (!hasPassDomRow) {
    await driver.cdpClick('[data-passport-tab="VISAS"], [data-tab="VISAS"]', { settleMs: 320 });
    hasPassDomRow = await driver.eval(`Boolean(document.querySelector('[data-passport-domain-stats]'))`);
  }

  // Click Domain 5 (`Sports & Games`) row in Passport -> must open Career Stats pre-filtered to Sports (3R · 2W = 5)!
  const passRowClick = await driver.cdpClick('[data-passport-domain-stats="5"]', { settleMs: 450 });
  const afterPassJump = await driver.evalFn(readCareerStatsDomState);
  if (vp.width >= 1000) {
    await driver.screenshot(path.join(SHOT_DIR, `v3_stats_07_passport_to_stats_${tag}.png`));
  }
  assert(
    'Deep Link: Passport `[data-passport-domain-stats="5"]` opens Career Stats pre-filtered to Sports (3R · 2W = 5)',
    Boolean(openedPass) &&
      passRowClick.found &&
      afterPassJump.open &&
      afterPassJump.filterBarPresent &&
      /sport/i.test(afterPassJump.filterBarText) &&
      afterPassJump.kpiRight === 3 &&
      afterPassJump.kpiWrong === 2 &&
      afterPassJump.ledgerCount === 5,
    `passClick=${passRowClick.found}, filter="${afterPassJump.filterBarText}", kpi=${afterPassJump.kpiRight}R·${afterPassJump.kpiWrong}W, ledger=${afterPassJump.ledgerCount}`,
  );

  // -------------------------------------------------------------------------
  // STEP 5C: Cross-Suite Deep Link #3 — `◆ Related Trophies` & 88 Honours / 44 Unlockables Check
  // -------------------------------------------------------------------------
  const honoursClick = await driver.cdpClick('#ws-stats-open-honours', { settleMs: 450 });
  const honoursCheck = await driver.evalFn(() => {
    const dlg = document.querySelector('.ws-meta-backdrop, .ws-meta-shell');
    const txt = dlg ? dlg.textContent.replace(/\s+/g, ' ').trim() : '';
    const aria = document.querySelector('[aria-label*="Hall of Honours"]')?.getAttribute('aria-label') || '';
    const has88 = /\b88\b/.test(txt) || /\b88\b/.test(aria);
    const has44 = /\b44\b/.test(txt) || /\b44\b/.test(aria);
    return { open: /honours|trophies/i.test(txt), has88, has44, aria };
  });
  assert(
    'Deep Link: `◆ Related Trophies` opens Hall of Honours showing 88 dynamic Honours & 44 Unlockables',
    honoursClick.found && honoursCheck.open && honoursCheck.has88 && honoursCheck.has44,
    JSON.stringify(honoursCheck),
  );

  // Return to Career Stats -> Filter to Science -> Test `▶ Practice This Slice`!
  await driver.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await sleep(300);
  await openVaultAndSection(driver, [
    '#ws-util-stats',
    '[data-vault-action="ANALYTICS"]',
    '[data-vault-action="stats"]',
  ]);
  await sleep(350);
  await driver.cdpClick('div[data-g2-dom="1"], button[data-g2-dom="1"]', { settleMs: 300 });

  // -------------------------------------------------------------------------
  // STEP 5D: Cross-Suite Deep Link #4 — `▶ Practice This Slice` (Science) -> Live 5-Q Briefing Match!
  // -------------------------------------------------------------------------
  const practiceClick = await driver.cdpClick('#ws-stats-practice-slice', { settleMs: 850 });
  // In v3.0, launching a Briefing match presents the Round-Ready gate (`#ws-btn-start-round-questions`) OR live gameplay
  const readyCardOrLive = await driver.waitFor(
    () =>
      Boolean(
        document.querySelector('#ws-btn-start-round-questions') ||
          document.querySelector('[data-facet-idx]') ||
          document.querySelector('.ws-question-prompt'),
      ),
    null,
    10000,
  );
  const hadRoundReady = await driver.eval(`Boolean(document.querySelector('#ws-btn-start-round-questions'))`);
  if (hadRoundReady) {
    await driver.cdpClick('#ws-btn-start-round-questions', { settleMs: 700 });
  }
  const liveGameplayReady = await driver.waitFor(
    () =>
      Boolean(
        document.querySelector('.ws-question-prompt') &&
          (document.querySelectorAll('[data-facet-idx]').length >= 2 ||
            document.querySelector('.ws-calibrator-slider, .ws-codex-ring, #ws-btn-overclock')),
      ),
    null,
    10000,
  );
  await sleep(450);

  const practiceLiveState = await driver.evalFn(() => {
    const topTxt = (document.querySelector('.ws-topbar')?.textContent || '').replace(/\s+/g, ' ').trim();
    const dockTxt = (document.querySelector('.ws-broadcast-dock')?.textContent || '').replace(/\s+/g, ' ').trim();
    const combined = `${topTxt} | ${dockTxt}`;
    const prompt = (document.querySelector('.ws-question-prompt')?.textContent || '').trim();
    const hasQ1Of5 = /1\s*\/\s*5|Q1\s*\/\s*5|QUESTION\s*1\s*OF\s*5/i.test(combined);
    const hasScience = /\bscience\b|astronomy|physics|biology|chemistry|space/i.test(dockTxt) || /\bscience\b/i.test(topTxt);
    return {
      prompt: prompt.slice(0, 100),
      hasQ1Of5,
      hasScience,
      topSnippet: topTxt.slice(0, 120),
      dockSnippet: dockTxt.slice(0, 160),
    };
  });
  if (vp.width >= 1000) {
    await driver.screenshot(path.join(SHOT_DIR, `v3_stats_05_practice_slice_live_${tag}.png`));
  }
  assert(
    'Deep Link: `▶ Practice This Slice` (Science) launches live 5-Q Briefing match in Science',
    practiceClick.found &&
      readyCardOrLive &&
      liveGameplayReady &&
      practiceLiveState.prompt.length > 8 &&
      practiceLiveState.hasScience &&
      practiceLiveState.hasQ1Of5,
    `roundReady=${hadRoundReady}, state=${JSON.stringify(practiceLiveState)}`,
  );

  // Runtime & Network error gate for this viewport
  assert(
    'Zero console/page/HTTP errors during full drill-down & deep-link journey',
    driver.consoleErrors.length === 0 && driver.pageErrors.length === 0 && driver.httpErrors.length === 0,
    `console=${driver.consoleErrors.length}, page=${driver.pageErrors.length}, http=${driver.httpErrors.length} ${driver.consoleErrors[0] || driver.pageErrors[0] || driver.httpErrors[0] || ''}`,
  );
}

async function checkEntryBundleSize(checks) {
  const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  const m = indexHtml.match(/src="\.?\/?(assets\/[^"]+\.js)"/);
  if (!m) {
    checks.push({ name: '[BUNDLE] Entry JS script found in dist/index.html', pass: false, detail: 'missing' });
    return;
  }
  const entryPath = path.join(DIST_DIR, m[1]);
  const bytes = fs.statSync(entryPath).size;
  const kb = Number((bytes / 1024).toFixed(1));
  const pass = kb < 350;
  checks.push({ name: '[BUNDLE] Entry JS < 350 kB', pass, detail: `${m[1]} = ${kb} kB` });
  console.log(`  ${pass ? 'PASS' : 'FAIL'} | [BUNDLE] Entry JS < 350 kB — ${m[1]} = ${kb} kB`);
}

async function main() {
  const srv = await startDistServer(DIST_DIR);
  console.log(`[RT-V3-STATS-GATE] Serving compiled dist/ on ${srv.baseUrl}`);

  const checks = [];
  await checkEntryBundleSize(checks);

  let driver = null;
  try {
    driver = await CdpDriver.launch();

    const viewports = [
      { width: 1280, height: 800, mobile: false, dpr: 1 },
      { width: 390, height: 844, mobile: true, dpr: 2 },
    ];

    for (const vp of viewports) {
      await runViewportDrilldownAudit(driver, srv.baseUrl, vp, checks);
    }

    const total = checks.length;
    const passed = checks.filter((c) => c.pass).length;
    const failed = checks.filter((c) => !c.pass);

    const reportPath = path.join(SHOT_DIR, 'scratch', 'rt_v3_stats_drilldown_report.json');
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          passed,
          total,
          server404s: srv.server404s,
          checks,
        },
        null,
        2,
      ),
    );

    console.log(`\n============================================================`);
    console.log(`[RT-V3-STATS-GATE] SCOREBOARD: ${passed} / ${total} GATES PASSED (404s=${srv.server404s.length})`);
    console.log(`Report: ${reportPath}`);
    console.log(`============================================================`);
    if (failed.length > 0 || srv.server404s.length > 0) {
      for (const f of failed) {
        console.log(`  FAIL: ${f.name} — ${f.detail}`);
      }
      if (srv.server404s.length > 0) {
        console.log(`  SERVER 404s: ${srv.server404s.join(', ')}`);
      }
      process.exitCode = 1;
    }
  } finally {
    if (driver) await driver.close();
    await srv.close();
  }
}

main().catch((err) => {
  console.error('[RT-V3-STATS-GATE] FATAL:', err);
  process.exit(2);
});
