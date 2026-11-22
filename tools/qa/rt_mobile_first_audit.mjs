#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST — RT-MOBILE-LAYOUT-PROVER (7-Viewport × 11-State Auditor)
// Serves compiled `dist/` on an ephemeral localhost port (NEVER probes :8088)
// and drives real Headless Edge WebGL2 via native Node CDP (zero npm deps).
//
// Usage:
//   node tools/qa/rt_mobile_first_audit.mjs [--tag=baseline] [--viewports=360x640,390x844]
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
const SCREENSHOT_DIR =
  'C:/Users/mshaf/.gemini/antigravity/brain/eb3f6b04-45f9-447f-a269-bde2ddd66a57';

const CLI_ARGS = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const idx = a.indexOf('=');
      return idx === -1 ? [a.slice(2), 'true'] : [a.slice(2, idx), a.slice(idx + 1)];
    }),
);

const RUN_TAG = CLI_ARGS.tag || 'audit';
const FILTER_VIEWPORTS = CLI_ARGS.viewports
  ? new Set(CLI_ARGS.viewports.split(',').map((s) => s.trim()))
  : null;

const ALL_VIEWPORTS = [
  { id: '360x640', label: 'Compact Android Portrait', width: 360, height: 640, mobile: true, dpr: 2, isPortrait: true },
  { id: '375x667', label: 'iPhone SE Portrait', width: 375, height: 667, mobile: true, dpr: 2, isPortrait: true },
  { id: '390x844', label: 'iPhone 15 Portrait', width: 390, height: 844, mobile: true, dpr: 3, isPortrait: true },
  { id: '430x932', label: 'iPhone Pro Max Portrait', width: 430, height: 932, mobile: true, dpr: 3, isPortrait: true },
  { id: '768x1024', label: 'iPad Portrait', width: 768, height: 1024, mobile: true, dpr: 2, isPortrait: true },
  { id: '844x390', label: 'Phone Landscape', width: 844, height: 390, mobile: true, dpr: 3, isPortrait: false },
  { id: '1280x800', label: 'Desktop', width: 1280, height: 800, mobile: false, dpr: 1, isPortrait: false },
];

const VIEWPORTS = FILTER_VIEWPORTS
  ? ALL_VIEWPORTS.filter((v) => FILTER_VIEWPORTS.has(v.id))
  : ALL_VIEWPORTS;

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
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function findEdgeBinary() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Could not find Microsoft Edge or Chrome binary on Windows.');
}

function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(rootDir, 'index.html'))) {
      reject(new Error(`dist/index.html not found at ${rootDir}`));
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

class CdpBrowser {
  constructor(edgeProc, tmpDir, cdpPort) {
    this.proc = edgeProc;
    this.tmpDir = tmpDir;
    this.cdpPort = cdpPort;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.consoleErrors = [];
    this.httpErrors = [];
  }

  static async launch(attempt = 1) {
    const bin = findEdgeBinary();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-mobile-audit-'));
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
        '--autoplay-policy=no-user-gesture-required',
        '--enable-webgl',
        '--ignore-gpu-blocklist',
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
      try {
        proc.kill();
      } catch {}
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
      if (attempt < 2) {
        await sleep(800);
        return CdpBrowser.launch(attempt + 1);
      }
      throw err;
    }

    const cdpPort = Number(new URL(wsRoot).port);
    const browser = new CdpBrowser(proc, tmpDir, cdpPort);
    await browser.attachFirstPage();
    return browser;
  }

  async openFreshTab() {
    // Close existing WS + old target (if tracked) and open a brand-new clean tab for fresh WebGL2 memory
    const oldTargetId = this.activeTargetId || null;
    try {
      this.ws?.close();
    } catch {}
    this.ws = null;
    this.pending.clear();
    this.listeners.clear();
    this.consoleErrors = [];
    this.httpErrors = [];

    const resp = await fetch(`http://127.0.0.1:${this.cdpPort}/json/new?about:blank`, { method: 'PUT' });
    const target = await resp.json();
    if (!target || !target.webSocketDebuggerUrl) {
      throw new Error('Failed to create fresh CDP page tab');
    }
    this.activeTargetId = target.id;
    if (oldTargetId) {
      fetch(`http://127.0.0.1:${this.cdpPort}/json/close/${oldTargetId}`).catch(() => {});
    }

    this.ws = new WebSocket(target.webSocketDebuggerUrl);
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
        if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
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

  async attachFirstPage() {
    let pageTarget = null;
    for (let i = 0; i < 20; i++) {
      const list = await (await fetch(`http://127.0.0.1:${this.cdpPort}/json/list`)).json();
      pageTarget = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTarget) break;
      await sleep(150);
    }
    if (!pageTarget) throw new Error('No CDP page target found');
    this.activeTargetId = pageTarget.id;

    this.ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
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
        if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
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
      this.consoleErrors.push(desc);
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
    const serializedArgs = args.map((a) => JSON.stringify(a)).join(',');
    return this.eval(`(${fn.toString()})(${serializedArgs})`);
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
  }

  async navigate(url, clearStorage = false) {
    if (clearStorage) {
      try {
        await this.eval('try { localStorage.clear(); sessionStorage.clear(); } catch {}');
      } catch {
        // ignore on about:blank
      }
    }
    const loaded = new Promise((resolve) => {
      const onLoad = () => {
        const set = this.listeners.get('Page.loadEventFired');
        if (set) set.delete(onLoad);
        resolve();
      };
      if (!this.listeners.has('Page.loadEventFired')) {
        this.listeners.set('Page.loadEventFired', new Set());
      }
      this.listeners.get('Page.loadEventFired').add(onLoad);
      setTimeout(() => {
        const set = this.listeners.get('Page.loadEventFired');
        if (set) set.delete(onLoad);
        resolve();
      }, 10000);
    });
    await this.send('Page.navigate', { url });
    await loaded;
  }

  async waitFor(predicateFn, arg = null, timeoutMs = 12000, pollMs = 100) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const val = await this.evalFn(predicateFn, arg);
      if (val) return val;
      await sleep(pollMs);
    }
    return false;
  }

  async dispatchRealClickAt(x, y, holdMs = 45) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: rx,
      y: ry,
      button: 'none',
      clickCount: 0,
    });
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: rx,
      y: ry,
      button: 'left',
      buttons: 1,
      clickCount: 1,
    });
    await sleep(holdMs);
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: rx,
      y: ry,
      button: 'left',
      buttons: 0,
      clickCount: 1,
    });
  }

  async clickSelector(selector, { scroll = true, holdMs = 45, requireInViewport = false } = {}) {
    const pt = await this.evalFn(
      (sel, doScroll, mustInVp) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return null;
        if (doScroll && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ block: 'center', inline: 'center' });
        }
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return null;
        if (mustInVp && (r.right <= 0 || r.left >= window.innerWidth || r.bottom <= 0 || r.top >= window.innerHeight)) {
          return null;
        }
        return {
          x: Math.max(1, Math.min(window.innerWidth - 1, r.left + r.width / 2)),
          y: Math.max(1, Math.min(window.innerHeight - 1, r.top + r.height / 2)),
          rect: { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height },
        };
      },
      selector,
      scroll,
      requireInViewport,
    );
    if (!pt) return false;
    await this.dispatchRealClickAt(pt.x, pt.y, holdMs);
    return true;
  }

  async pressEscape() {
    await this.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27,
    });
    await this.send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Escape',
      code: 'Escape',
      windowsVirtualKeyCode: 27,
    });
  }

  async screenshot(absPath) {
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    const { data } = await this.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
    });
    fs.writeFileSync(absPath, Buffer.from(data, 'base64'));
    return absPath;
  }

  async close() {
    try {
      this.ws?.close();
    } catch {}
    try {
      this.proc?.kill();
    } catch {}
    await sleep(300);
    try {
      fs.rmSync(this.tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

// ============================================================================
// IN-PAGE MATHEMATICAL GEOMETRY PROBE FUNCTIONS
// ============================================================================

function measureTopBarInPage() {
  const bar = document.querySelector('.ws-topbar');
  if (!bar) return { found: false, height: 0, rowCount: 0, pillCount: 0 };
  const r = bar.getBoundingClientRect();
  const cs = getComputedStyle(bar);
  if (cs.display === 'none' || cs.visibility === 'hidden' || r.height === 0) {
    return { found: false, height: 0, rowCount: 0, pillCount: 0 };
  }
  const interactive = [...bar.querySelectorAll('button, a, .ws-util-pill, .ws-chyron')].filter((el) => {
    const ecs = getComputedStyle(el);
    const er = el.getBoundingClientRect();
    return ecs.display !== 'none' && ecs.visibility !== 'hidden' && er.width > 0 && er.height > 0;
  });
  const rows = [];
  for (const el of interactive) {
    const er = el.getBoundingClientRect();
    const cy = er.top + er.height / 2;
    if (!rows.some((ry) => Math.abs(ry - cy) <= 16)) {
      rows.push(cy);
    }
  }
  const pills = bar.querySelectorAll('button').length;
  return {
    found: true,
    top: Math.round(r.top * 10) / 10,
    bottom: Math.round(r.bottom * 10) / 10,
    height: Math.round(r.height * 10) / 10,
    width: Math.round(r.width * 10) / 10,
    right: Math.round(r.right * 10) / 10,
    rowCount: Math.max(1, rows.length),
    buttonCount: pills,
    overflowsRight: r.right > window.innerWidth + 1,
  };
}

/**
 * Exact 2D pixel-grid calculation of unobstructed 3D WebGL stage %!
 * Collects EVERY visible UI rectangle outside `#canvas-root` / `#vfx-canvas` that paints
 * a visible background, gradient scrim, border, image, button, or direct text glyph run.
 */
function measureOpen3DStageInPage() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const canvas = document.querySelector('#canvas-root canvas');
  const canvasRect = canvas ? canvas.getBoundingClientRect() : null;

  function parseAlpha(colorStr) {
    if (!colorStr || colorStr === 'transparent') return 0;
    const m = colorStr.match(/rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*([\d.]+)\s*)?\)/);
    if (!m) return 0;
    return m[1] === undefined ? 1 : parseFloat(m[1]);
  }

  function parseGradientAlphaRange(bgImg) {
    if (!bgImg || bgImg === 'none') return { hasGrad: false, minA: 0, maxA: 0 };
    const matches = [...bgImg.matchAll(/rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/g)];
    if (matches.length === 0) {
      // Solid hex/rgb stops inside gradient -> treat as opaque
      if (/gradient\(/i.test(bgImg)) return { hasGrad: true, minA: 1, maxA: 1 };
      return { hasGrad: false, minA: 0, maxA: 0 };
    }
    const alphas = matches.map((m) => parseFloat(m[1]));
    return {
      hasGrad: true,
      minA: Math.min(...alphas),
      maxA: Math.max(...alphas),
    };
  }

  function hasVisibleBorder(cs) {
    const sides = [
      ['borderTopWidth', 'borderTopStyle', 'borderTopColor'],
      ['borderRightWidth', 'borderRightStyle', 'borderRightColor'],
      ['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor'],
      ['borderLeftWidth', 'borderLeftStyle', 'borderLeftColor'],
    ];
    for (const [wProp, sProp, cProp] of sides) {
      if (cs[sProp] !== 'none' && parseFloat(cs[wProp]) >= 1 && parseAlpha(cs[cProp]) >= 0.15) {
        return true;
      }
    }
    if (cs.borderImageSource && cs.borderImageSource !== 'none') return true;
    return false;
  }

  const blockingRects = [];
  const sheetRects = [];

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  let node = walker.currentNode;
  while ((node = walker.nextNode())) {
    const el = /** @type {HTMLElement} */ (node);
    if (
      el.id === 'canvas-root' ||
      el.id === 'vfx-canvas' ||
      el.id === 'app' ||
      el.id === 'ui-root' ||
      el.closest('#canvas-root') ||
      el.tagName === 'SCRIPT' ||
      el.tagName === 'STYLE' ||
      el.tagName === 'LINK'
    ) {
      continue;
    }
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) {
      continue;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.bottom <= 0 || r.top >= H || r.right <= 0 || r.left >= W) continue;

    const bgAlpha = parseAlpha(cs.backgroundColor);
    const gradInfo = parseGradientAlphaRange(cs.backgroundImage);
    const isFullScreenPassThrough =
      r.width >= W * 0.94 && r.height >= H * 0.94 && cs.pointerEvents === 'none';
    const hasBlockingGrad = isFullScreenPassThrough
      ? gradInfo.hasGrad && gradInfo.minA >= 0.25
      : gradInfo.hasGrad && gradInfo.maxA >= 0.25;
    const bordered = hasVisibleBorder(cs);
    const isMediaOrControl =
      el.tagName === 'BUTTON' ||
      el.tagName === 'INPUT' ||
      el.tagName === 'IMG' ||
      el.tagName === 'SVG' ||
      el.tagName === 'SELECT';

    const paintsSurface = bgAlpha >= 0.12 || hasBlockingGrad || bordered || isMediaOrControl;

    if (paintsSurface) {
      const clamped = {
        left: Math.max(0, r.left),
        right: Math.min(W, r.right),
        top: Math.max(0, r.top),
        bottom: Math.min(H, r.bottom),
        cls: el.className ? String(el.className).slice(0, 60) : el.tagName,
      };
      blockingRects.push(clamped);

      // Track large sheet/panel surfaces (>= 45% viewport width & >= 18% height)
      const wFrac = (clamped.right - clamped.left) / W;
      const hFrac = (clamped.bottom - clamped.top) / H;
      if (wFrac >= 0.45 && hFrac >= 0.18 && clamped.top > H * 0.15) {
        sheetRects.push(clamped);
      }
    } else {
      // Measure direct text nodes via Range so floating borderless typography is accurately counted
      for (const child of el.childNodes) {
        if (child.nodeType === 3 && child.nodeValue && child.nodeValue.trim().length > 0) {
          const range = document.createRange();
          range.selectNodeContents(child);
          const tr = range.getBoundingClientRect();
          if (tr.width > 1 && tr.height > 1) {
            blockingRects.push({
              left: Math.max(0, tr.left),
              right: Math.min(W, tr.right),
              top: Math.max(0, tr.top),
              bottom: Math.min(H, tr.bottom),
              cls: 'text:' + (el.className ? String(el.className).slice(0, 40) : el.tagName),
            });
          }
        }
      }
    }
  }

  // Sample 80×80 grid for exact 2D unobstructed 3D viewport %
  const GX = 80;
  const GY = 80;
  let openPts = 0;
  const rowOpenFracs = [];
  for (let iy = 0; iy < GY; iy++) {
    const y = ((iy + 0.5) / GY) * H;
    let rowOpen = 0;
    for (let ix = 0; ix < GX; ix++) {
      const x = ((ix + 0.5) / GX) * W;
      let hit = false;
      for (let k = 0; k < blockingRects.length; k++) {
        const b = blockingRects[k];
        if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) {
          hit = true;
          break;
        }
      }
      if (!hit) {
        openPts++;
        rowOpen++;
      }
    }
    rowOpenFracs.push(rowOpen / GX);
  }

  // Largest contiguous vertical band where >= 80% of width is open 3D stage
  let maxBandRows = 0;
  let curBandRows = 0;
  let bestStartRow = 0;
  let curStartRow = 0;
  for (let iy = 0; iy < GY; iy++) {
    if (rowOpenFracs[iy] >= 0.8) {
      if (curBandRows === 0) curStartRow = iy;
      curBandRows++;
      if (curBandRows > maxBandRows) {
        maxBandRows = curBandRows;
        bestStartRow = curStartRow;
      }
    } else {
      curBandRows = 0;
    }
  }

  const highestBottomSheetTop =
    sheetRects.length > 0 ? Math.min(...sheetRects.map((s) => s.top)) : H;

  const topBlockers = [...blockingRects]
    .map((b) => ({
      cls: b.cls,
      areaPct: Math.round((((b.right - b.left) * (b.bottom - b.top)) / (W * H)) * 1000) / 10,
      top: Math.round(b.top),
      bottom: Math.round(b.bottom),
      left: Math.round(b.left),
      right: Math.round(b.right),
    }))
    .sort((a, b) => b.areaPct - a.areaPct)
    .slice(0, 4);

  const probeX = W >= H ? W * 0.25 : W * 0.5;
  const probeY = W >= H ? H * 0.5 : H * 0.25;
  const stageHitEl = document.elementFromPoint(probeX, probeY);
  const stageTouchPassthrough = Boolean(
    stageHitEl && (stageHitEl.tagName === 'CANVAS' || stageHitEl.id === 'canvas-root'),
  );

  return {
    viewport: { W, H },
    hasWebGLCanvas: Boolean(canvasRect && canvasRect.width > 0 && canvasRect.height > 0),
    openStagePct: Math.round((openPts / (GX * GY)) * 1000) / 10,
    contiguousVerticalOpenBandPct: Math.round((maxBandRows / GY) * 1000) / 10,
    contiguousVerticalOpenBandRangeDvh: [
      Math.round((bestStartRow / GY) * 1000) / 10,
      Math.round(((bestStartRow + maxBandRows) / GY) * 1000) / 10,
    ],
    highestBottomSheetTopPx: Math.round(highestBottomSheetTop * 10) / 10,
    highestBottomSheetTopPct: Math.round((highestBottomSheetTop / H) * 1000) / 10,
    stageTouchPassthrough,
    topBlockers,
    horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - W),
  };
}

/**
 * Surgical gameplay A–D & action-button geometry prover!
 * Checks EVERY `[data-facet-idx]` for:
 *  1. 100% inside viewport (`top >= 0, bottom <= innerHeight, left >= 0, right <= innerWidth`)
 *  2. `height >= 34`
 *  3. 100% unclipped inside ANY `overflow: hidden|auto|scroll|clip` ancestor!
 *  4. `0px` overlap against `#ws-btn-overclock`, `#ws-btn-peel`, `#ws-btn-bookmark`, `#ws-btn-next-q`, `.ws-dock-pinned-actions`, `.ws-intel-flash`, `.ws-clue-drawer`
 *  5. Real `document.elementFromPoint(cx, cy)` hit-test on non-disabled facets!
 */
function measureGameplayInPage(phase) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const round1 = (n) => Math.round(n * 10) / 10;

  function rectObj(el) {
    if (!el) return null;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.02) {
      return null;
    }
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    return {
      top: round1(r.top),
      bottom: round1(r.bottom),
      left: round1(r.left),
      right: round1(r.right),
      width: round1(r.width),
      height: round1(r.height),
    };
  }

  function overlapPx(a, b) {
    if (!a || !b) return 0;
    const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    if (xOverlap <= 0.5 || yOverlap <= 0.5) return 0;
    return Math.round(xOverlap * yOverlap);
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
            ancestorTop: round1(pr.top),
            ancestorBottom: round1(pr.bottom),
            clippedTopPx: round1(Math.max(0, pr.top - r.top)),
            clippedBottomPx: round1(Math.max(0, r.bottom - pr.bottom)),
          });
        }
      }
      if (ovX === 'hidden' || ovX === 'auto' || ovX === 'scroll' || ovX === 'clip') {
        const pr = p.getBoundingClientRect();
        if (r.left < pr.left - 1.5 || r.right > pr.right + 1.5) {
          clips.push({
            ancestor: p.className ? String(p.className).slice(0, 50) : p.tagName,
            clippedLeftPx: round1(Math.max(0, pr.left - r.left)),
            clippedRightPx: round1(Math.max(0, r.right - pr.right)),
          });
        }
      }
      p = p.parentElement;
    }
    return clips;
  }

  const peelEl = document.querySelector('#ws-btn-peel');
  const overclockEl = document.querySelector('#ws-btn-overclock');
  const bookmarkEl = document.querySelector('#ws-btn-bookmark');
  const nextEl = document.querySelector('#ws-btn-next-q');
  const pinnedEl = document.querySelector('.ws-dock-pinned-actions');
  const intelEl = document.querySelector('.ws-intel-flash');
  const clueEl = document.querySelector('.ws-clue-drawer');
  const promptEl = document.querySelector('.ws-question-prompt');
  const dockEl = document.querySelector('.ws-broadcast-dock');
  const scrollRegionEl = document.querySelector('.ws-dock-scroll-region');
  const tierEl = document.querySelector('#ws-tier-badge');
  const toastEl = document.querySelector('.ws-honour-toast, .ws-honour-toast-card');

  const controls = {
    peel: rectObj(peelEl),
    overclock: rectObj(overclockEl),
    bookmark: rectObj(bookmarkEl),
    nextQ: rectObj(nextEl),
    pinnedActions: rectObj(pinnedEl),
    intelFlash: rectObj(intelEl),
    clueDrawer: rectObj(clueEl),
    prompt: rectObj(promptEl),
    dock: rectObj(dockEl),
    toast: rectObj(toastEl),
  };

  const promptClips =
    promptEl && controls.prompt ? findClipViolations(promptEl, controls.prompt) : [];
  const promptInViewport = Boolean(
    controls.prompt &&
      controls.prompt.top >= -0.5 &&
      controls.prompt.bottom <= H + 0.5 &&
      controls.prompt.left >= -0.5 &&
      controls.prompt.right <= W + 0.5,
  );

  const facetEls = [...document.querySelectorAll('[data-facet-idx]')];
  const facets = facetEls.map((el) => {
    const idx = Number(el.getAttribute('data-facet-idx'));
    const r = rectObj(el);
    const disabled = Boolean(el.disabled);
    const shattered = el.classList.contains('is-shattered');
    if (!r) {
      return { idx, visible: false, disabled, shattered };
    }
    const inViewport = r.top >= -0.5 && r.bottom <= H + 0.5 && r.left >= -0.5 && r.right <= W + 0.5;
    const heightOk = r.height >= 34;
    const clips = findClipViolations(el, r);

    const overlaps = {
      overclock: overlapPx(r, controls.overclock),
      peel: overlapPx(r, controls.peel),
      bookmark: overlapPx(r, controls.bookmark),
      nextQ: overlapPx(r, controls.nextQ),
      pinnedActions: overlapPx(r, controls.pinnedActions),
      intelFlash: overlapPx(r, controls.intelFlash),
      clueDrawer: overlapPx(r, controls.clueDrawer),
      toast: overlapPx(r, controls.toast),
    };

    const cx = Math.max(0, Math.min(W - 1, r.left + r.width / 2));
    const cy = Math.max(0, Math.min(H - 1, r.top + r.height / 2));
    const hitEl = document.elementFromPoint(cx, cy);
    const hitSelf = Boolean(hitEl && (hitEl === el || el.contains(hitEl)));
    const hitDesc = hitEl
      ? `${hitEl.tagName.toLowerCase()}${hitEl.id ? '#' + hitEl.id : ''}${hitEl.className ? '.' + String(hitEl.className).trim().split(/\s+/).slice(0, 2).join('.') : ''}`
      : 'null';

    return {
      idx,
      visible: true,
      disabled,
      shattered,
      rect: r,
      inViewport,
      heightOk,
      clips,
      overlaps,
      hitSelf,
      hitDesc,
      text: (el.textContent || '').trim().slice(0, 48),
    };
  });

  const actionOverlaps = {
    peelVsOverclock: overlapPx(controls.peel, controls.overclock),
    bookmarkVsNextQ: overlapPx(controls.bookmark, controls.nextQ),
    intelVsBookmark: overlapPx(controls.intelFlash, controls.bookmark),
    intelVsNextQ: overlapPx(controls.intelFlash, controls.nextQ),
  };

  const dockScrollOverflowPx = scrollRegionEl
    ? Math.max(0, Math.round(scrollRegionEl.scrollHeight - scrollRegionEl.clientHeight))
    : 0;

  return {
    phase,
    viewport: { W, H },
    tierText: tierEl ? tierEl.textContent.trim() : '',
    promptText: promptEl ? promptEl.textContent.trim().slice(0, 90) : '',
    promptInViewport,
    promptClips,
    facetCount: facets.length,
    facets,
    controls,
    actionOverlaps,
    dockScrollOverflowPx,
    horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - W),
    hasNinePatch: document.documentElement.classList.contains('ws-has-ninepatch'),
  };
}

function measureSheetModalInPage(kind) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const round1 = (n) => Math.round(n * 10) / 10;

  const dialog =
    document.querySelector('[role="dialog"]:not([hidden]):not(#ws-vault-backdrop)') ||
    document.querySelector('.ws-meta-backdrop') ||
    document.querySelector('.ws-modal-backdrop');

  const panel =
    document.querySelector('.ws-meta-shell') ||
    document.querySelector('.ws-modal-panel') ||
    document.querySelector('.ws-sheet-panel') ||
    dialog;

  const panelRect = panel ? panel.getBoundingClientRect() : null;

  // Locate back/close control
  const backCandidates = [
    '#ws-cat-back-btn',
    '#ws-saves-close',
    '#ws-obs-back',
    '#ws-obs-close',
    '#ws-atelier-back',
    '#ws-atelier-close',
    '#ws-analytics-back',
    '#ws-analytics-close',
    '#ws-honours-back',
    '#ws-honours-close',
    '.ws-sheet-back',
    '.ws-sheet-nav-btn',
    '.ws-meta-back',
    '.ws-meta-close',
    '[aria-label="Back"]',
    '[aria-label="Close"]',
  ];
  let backRect = null;
  let backText = '';
  for (const sel of backCandidates) {
    const el = document.querySelector(sel);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        backRect = { top: round1(r.top), bottom: round1(r.bottom), left: round1(r.left), right: round1(r.right), width: round1(r.width), height: round1(r.height) };
        backText = (el.textContent || '').trim();
        break;
      }
    }
  }
  if (!backRect && dialog) {
    const btns = [...dialog.querySelectorAll('button')];
    const match = btns.find((b) => /back|return|close|✕|×|←/i.test(b.textContent || ''));
    if (match) {
      const r = match.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        backRect = { top: round1(r.top), bottom: round1(r.bottom), left: round1(r.left), right: round1(r.right), width: round1(r.width), height: round1(r.height) };
        backText = (match.textContent || '').trim();
      }
    }
  }

  // Check overflow on any inner scrollable containers
  let innerHorizOverflowPx = 0;
  if (dialog) {
    for (const el of dialog.querySelectorAll(
      '.ws-modal-scroll-body, .ws-meta-body, .ws-meta-shell, .ws-meta-sheet, .ws-modal-panel, .ws-velvet-sheet, .ws-briefing-scroll, .ws-saves-scroll, .ws-sheet-body',
    )) {
      const cs = getComputedStyle(el);
      if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') continue; // intentional horizontal strip
      const diff = el.scrollWidth - el.clientWidth;
      if (diff > innerHorizOverflowPx) innerHorizOverflowPx = Math.round(diff);
    }
  }

  const svgs = dialog
    ? [...dialog.querySelectorAll('svg')].map((s) => {
        const r = s.getBoundingClientRect();
        return { width: round1(r.width), height: round1(r.height), left: round1(r.left), right: round1(r.right) };
      }).filter((s) => s.width >= 100 && s.height >= 50)
    : [];

  const imgs = dialog ? [...dialog.querySelectorAll('img')] : [];
  const brokenImgs = imgs.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src);

  const launchEl = document.querySelector('#ws-cat-launch');
  const launchRect = launchEl
    ? (() => {
        const r = launchEl.getBoundingClientRect();
        return { top: round1(r.top), bottom: round1(r.bottom), left: round1(r.left), right: round1(r.right), width: round1(r.width), height: round1(r.height) };
      })()
    : null;

  const slotCount = document.querySelectorAll('[data-slot-load]').length;
  const dialogText = dialog ? (dialog.textContent || '') : '';
  const has64TrophiesRef = /\/?\s*64\b|64\s+troph/i.test(dialogText);
  const hasBaseballRef = /baseball/i.test(dialogText);

  return {
    kind,
    open: Boolean(dialog),
    viewport: { W, H },
    panelRect: panelRect
      ? { top: round1(panelRect.top), bottom: round1(panelRect.bottom), left: round1(panelRect.left), right: round1(panelRect.right), width: round1(panelRect.width), height: round1(panelRect.height) }
      : null,
    backRect,
    backText,
    backInViewport: Boolean(backRect && backRect.top >= -1 && backRect.bottom <= H + 1 && backRect.left >= -1 && backRect.right <= W + 1),
    launchRect,
    launchInViewport: Boolean(launchRect && launchRect.top >= -1 && launchRect.bottom <= H + 1 && launchRect.left >= -1 && launchRect.right <= W + 1),
    chartSvgs: svgs,
    chartFitsWidth: svgs.every((s) => s.left >= -1 && s.right <= W + 1),
    brokenImgCount: brokenImgs.length,
    brokenImgs: brokenImgs.slice(0, 5),
    slotCount,
    has64TrophiesRef,
    hasBaseballRef,
    horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - W),
    innerHorizOverflowPx,
  };
}

// ============================================================================
// NAVIGATION HELPERS (WORKS ON BOTH LEGACY #213 AND NEW 2026 VAULT DRAWER)
// ============================================================================

async function openMetaView(browser, targetKey) {
  // targetKey: 'OBSERVATORY' | 'ATELIER' | 'ANALYTICS' | 'HONOURS' | 'SAVES'
  const spec = {
    OBSERVATORY: {
      directIds: ['#ws-util-observatory', '[data-suite-nav="OBSERVATORY"]', '[data-vault-action="OBSERVATORY"]'],
      textRe: /observatory|3d vault|3d relics/i,
    },
    ATELIER: {
      directIds: ['#ws-util-atelier', '[data-suite-nav="ATELIER"]', '[data-vault-action="ATELIER"]'],
      textRe: /atelier|prism atelier/i,
    },
    ANALYTICS: {
      directIds: ['#ws-util-stats', '[data-suite-nav="ANALYTICS"]', '[data-vault-action="ANALYTICS"]'],
      textRe: /stats|analytics|career/i,
    },
    HONOURS: {
      directIds: ['#ws-util-trophies', '[data-suite-nav="HONOURS"]', '[data-vault-action="HONOURS"]'],
      textRe: /trophies|honours|64 trophies/i,
    },
    SAVES: {
      directIds: ['#ws-util-saves', '#ws-title-saves-cta', '.ws-title-saves-link', '[data-open-saves]', '[data-vault-action="SAVES"]'],
      textRe: /saves|save slots|5-slot/i,
    },
  }[targetKey];

  // Step 1: Try any currently visible direct button inside viewport
  for (const sel of spec.directIds) {
    const clicked = await browser.clickSelector(sel, { scroll: false, requireInViewport: true });
    if (clicked) return true;
  }

  // Step 2: Try Vault Drawer trigger (.ws-vault-trigger, #ws-util-vault, [data-vault-trigger])
  const openedVault = await browser.evalFn(() => {
    const trig =
      document.querySelector('.ws-vault-trigger') ||
      document.querySelector('#ws-util-vault') ||
      document.querySelector('[data-vault-trigger]') ||
      [...document.querySelectorAll('.ws-topbar button, [role="dialog"]:not([hidden]) button')].find((b) =>
        /vault|menu|☰/i.test(b.textContent || ''),
      );
    if (!trig) return false;
    trig.click();
    return true;
  });

  if (openedVault) {
    // Wait until slide-over vault drawer finishes CSS transform animation completely
    await browser.waitFor(() => {
      const d = document.querySelector('#ws-vault-drawer.is-open, .ws-vault-drawer.is-open, [data-vault-menu]:not([hidden])');
      if (!d) return false;
      const r = d.getBoundingClientRect();
      const cs = getComputedStyle(d);
      const settled = cs.transform === 'none' || cs.transform === 'matrix(1, 0, 0, 1, 0, 0)';
      return settled && r.width > 40 && r.right <= window.innerWidth + 2;
    }, null, 3500, 60);
    await sleep(250);
    for (const sel of spec.directIds) {
      const existsInDrawer = await browser.evalFn((s) => {
        const el = document.querySelector(s);
        if (!el) return false;
        el.scrollIntoView({ block: 'center', inline: 'nearest' });
        el.click();
        return true;
      }, sel);
      if (existsInDrawer) {
        await sleep(260);
        return true;
      }
    }
    const byText = await browser.evalFn((reSrc) => {
      const re = new RegExp(reSrc, 'i');
      const containers = [
        document.querySelector('.ws-vault-drawer'),
        document.querySelector('.ws-vault-menu'),
        document.querySelector('[data-vault-menu]:not([hidden])'),
        document.querySelector('[role="menu"]:not([hidden])'),
        document.body,
      ].filter(Boolean);
      for (const c of containers) {
        const btns = [...c.querySelectorAll('button, [role="menuitem"]')];
        const hit = btns.find((b) => {
          const r = b.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && re.test(b.textContent || '');
        });
        if (hit) {
          hit.click();
          return true;
        }
      }
      return false;
    }, spec.textRe.source);
    if (byText) return true;
  }

  return false;
}

async function closeAllOverlays(browser) {
  for (let i = 0; i < 4; i++) {
    const hasDialog = await browser.eval(
      'Boolean(document.querySelector("[role=dialog]:not([hidden]):not(#ws-vault-backdrop), .ws-meta-backdrop, .ws-modal-backdrop, .ws-vault-drawer.is-open, #ws-vault-backdrop.is-open"))',
    );
    if (!hasDialog) break;
    await browser.pressEscape();
    await sleep(220);
  }
}

// ============================================================================
// ASSERTION EVALUATORS
// ============================================================================

function evaluateGameplayChecks(gm, topBar, label) {
  const failures = [];
  if (!topBar.found) {
    failures.push(`[P1] ${label}: Top bar (.ws-topbar) missing`);
  } else {
    if (topBar.height > 50) {
      failures.push(`[P0] ${label}: Top bar height ${topBar.height}px > 50px (rows=${topBar.rowCount}, btns=${topBar.buttonCount})`);
    }
    if (topBar.rowCount > 1) {
      failures.push(`[P1] ${label}: Top bar wrapped onto ${topBar.rowCount} rows`);
    }
  }

  if (gm.facetCount !== 4) {
    failures.push(`[P0] ${label}: Expected 4 [data-facet-idx] options, found ${gm.facetCount}`);
  }

  for (const f of gm.facets) {
    const tag = `Facet[${f.idx}]`;
    if (!f.visible) {
      failures.push(`[P0] ${label}: ${tag} not visible!`);
      continue;
    }
    if (!f.inViewport) {
      failures.push(
        `[P0] ${label}: ${tag} outside viewport (top=${f.rect.top}, bottom=${f.rect.bottom}, vh=${gm.viewport.H})`,
      );
    }
    if (!f.heightOk) {
      failures.push(`[P0] ${label}: ${tag} height ${f.rect.height}px < 34px`);
    }
    if (f.clips.length > 0) {
      const c = f.clips[0];
      failures.push(
        `[P0] ${label}: ${tag} SCROLLED OUT / CLIPPED by ${c.ancestor} (clippedBottom=${c.clippedBottomPx ?? 0}px, clippedTop=${c.clippedTopPx ?? 0}px)`,
      );
    }
    const overlapKeys = ['overclock', 'peel', 'bookmark', 'nextQ', 'pinnedActions', 'intelFlash', 'clueDrawer', 'toast'];
    for (const k of overlapKeys) {
      if (f.overlaps[k] > 0) {
        failures.push(`[P0] ${label}: ${tag} OVERLAPS ${k} by ${f.overlaps[k]}px²`);
      }
    }
    if (!f.disabled && !f.shattered && !f.hitSelf) {
      failures.push(`[P0] ${label}: ${tag} hit-test BLOCKED by <${f.hitDesc}>`);
    }
  }

  if (!gm.controls.prompt || !gm.promptInViewport || (gm.promptClips && gm.promptClips.length > 0)) {
    failures.push(`[P0] ${label}: .ws-question-prompt clipped or outside viewport`);
  }

  if (gm.phase === 'reveal') {
    if (!gm.controls.bookmark) {
      failures.push(`[P0] ${label}: #ws-btn-bookmark (SAVE INTEL) missing`);
    } else if (gm.controls.bookmark.top < 0 || gm.controls.bookmark.bottom > gm.viewport.H + 1) {
      failures.push(`[P0] ${label}: #ws-btn-bookmark outside viewport (${gm.controls.bookmark.top}..${gm.controls.bookmark.bottom})`);
    }
    if (!gm.controls.nextQ) {
      failures.push(`[P0] ${label}: #ws-btn-next-q (NEXT PRISM) missing`);
    } else if (gm.controls.nextQ.top < 0 || gm.controls.nextQ.bottom > gm.viewport.H + 1) {
      failures.push(`[P0] ${label}: #ws-btn-next-q outside viewport (${gm.controls.nextQ.top}..${gm.controls.nextQ.bottom})`);
    }
    if (gm.actionOverlaps.bookmarkVsNextQ > 0) {
      failures.push(`[P0] ${label}: SAVE INTEL overlaps NEXT PRISM (${gm.actionOverlaps.bookmarkVsNextQ}px²)`);
    }
    if (gm.actionOverlaps.intelVsBookmark > 0 || gm.actionOverlaps.intelVsNextQ > 0) {
      failures.push(`[P0] ${label}: .ws-intel-flash overlaps Reveal buttons`);
    }
  } else {
    if (!gm.controls.overclock) {
      failures.push(`[P0] ${label}: #ws-btn-overclock missing`);
    } else if (gm.controls.overclock.top < 0 || gm.controls.overclock.bottom > gm.viewport.H + 1) {
      failures.push(`[P0] ${label}: #ws-btn-overclock outside viewport`);
    }
    if (!gm.controls.peel) {
      failures.push(`[P0] ${label}: #ws-btn-peel missing`);
    } else if (gm.controls.peel.top < 0 || gm.controls.peel.bottom > gm.viewport.H + 1) {
      failures.push(`[P0] ${label}: #ws-btn-peel outside viewport`);
    }
    if (gm.actionOverlaps.peelVsOverclock > 0) {
      failures.push(`[P0] ${label}: #ws-btn-peel overlaps #ws-btn-overclock (${gm.actionOverlaps.peelVsOverclock}px²)`);
    }
  }

  if (gm.horizontalOverflowPx > 1) {
    failures.push(`[P1] ${label}: Horizontal overflow ${gm.horizontalOverflowPx}px`);
  }

  return failures;
}

// ============================================================================
// MAIN AUDIT RUNNER PER VIEWPORT
// ============================================================================

async function auditViewport(browser, baseUrl, vp) {
  const result = {
    viewport: vp,
    states: {},
    failures: [],
    screenshots: {},
  };

  const shotPath = (stateName) =>
    path.join(SCREENSHOT_DIR, `audit_${RUN_TAG}_${vp.id}_${stateName}.png`);

  await browser.setViewport(vp);

  // -------------------------------------------------------------------------
  // 1. START SCREEN
  // -------------------------------------------------------------------------
  const startUrl = `${baseUrl}/?v=audit_${RUN_TAG}_${vp.id}`;
  await browser.navigate(startUrl, true);
  await browser.waitFor(
    () => Boolean(document.querySelector('#ws-title-enter-cta') && document.querySelector('#canvas-root canvas')),
    null,
    14000,
  );
  await sleep(950);

  const startTopBar = await browser.evalFn(measureTopBarInPage);
  const startStage = await browser.evalFn(measureOpen3DStageInPage);
  const startCta = await browser.evalFn(() => {
    const el = document.querySelector('#ws-title-enter-cta');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: Math.round(r.top * 10) / 10,
      bottom: Math.round(r.bottom * 10) / 10,
      left: Math.round(r.left * 10) / 10,
      right: Math.round(r.right * 10) / 10,
      inViewport: r.top >= -1 && r.bottom <= window.innerHeight + 1 && r.left >= -1 && r.right <= window.innerWidth + 1,
    };
  });

  const startShot = shotPath('01_start');
  await browser.screenshot(startShot);
  result.screenshots.start = startShot;
  result.states.start = { topBar: startTopBar, stage: startStage, cta: startCta };

  if (!startTopBar.found || startTopBar.height > 50 || startTopBar.rowCount > 1) {
    result.failures.push(
      `[P0] Start Screen: Top bar height=${startTopBar.height}px rows=${startTopBar.rowCount} btns=${startTopBar.buttonCount} (must be single-row <= 50px)`,
    );
  }
  if (vp.isPortrait && startStage.openStagePct < 48.0) {
    result.failures.push(
      `[P0] Start Screen: Open unobstructed 3D stage = ${startStage.openStagePct}% < 48% (clearBand=${startStage.contiguousVerticalOpenBandPct}%, bottomSheetTop=${startStage.highestBottomSheetTopPct}%)`,
    );
  }
  if (!startCta || !startCta.inViewport) {
    result.failures.push(`[P0] Start Screen: Primary CTA #ws-title-enter-cta clipped or off-screen`);
  }
  if (startStage.horizontalOverflowPx > 1) {
    result.failures.push(`[P1] Start Screen: Horizontal overflow ${startStage.horizontalOverflowPx}px`);
  }

  // -------------------------------------------------------------------------
  // 2. BASEBALL DRILL-DOWN (Sports & Games -> Sports -> Baseball)
  // -------------------------------------------------------------------------
  const clickedBriefingMode = await browser.clickSelector('[data-title-mode="BRIEFING"]', { scroll: false });
  if (!clickedBriefingMode) {
    result.failures.push(`[P0] Baseball Drill-Down: Could not click [data-title-mode="BRIEFING"] on Start Screen`);
  } else {
    await browser.waitFor(
      () => Boolean(document.querySelector('#ws-open-briefing-modal') || document.querySelector('[data-pick-l0="5"]')),
      null,
      6000,
    );
    await sleep(250);
    // If on Hub Briefing tab, open the 3-Level Drill-Down Modal
    if (await browser.eval('Boolean(document.querySelector("#ws-open-briefing-modal"))')) {
      await browser.clickSelector('#ws-open-briefing-modal', { scroll: true });
      const openedModal = await browser.waitFor(() => Boolean(document.querySelector('[data-pick-l0="5"]')), null, 3500);
      if (!openedModal) {
        await browser.eval('document.querySelector("#ws-open-briefing-modal")?.click()');
      }
    }
    await browser.waitFor(() => Boolean(document.querySelector('[data-pick-l0="5"]')), null, 6000);
    await sleep(200);
    await browser.clickSelector('[data-pick-l0="5"]', { scroll: true });
    await browser.waitFor(
      () => Boolean(document.querySelector('[data-pick-l1="sports"], [data-pick-l1="sports_main"], [data-pick-l1]')),
      null,
      5000,
    );
    await sleep(200);
    const clickedL1 =
      (await browser.clickSelector('[data-pick-l1="sports"]', { scroll: true })) ||
      (await browser.clickSelector('[data-pick-l1="sports_main"]', { scroll: true })) ||
      (await browser.clickSelector('[data-pick-l1]', { scroll: true }));
    if (clickedL1) {
      await browser.waitFor(
        () => Boolean(document.querySelector('[data-pick-l2="sports_baseball"], [data-pick-l2]')),
        null,
        5000,
      );
      await sleep(200);
      await browser.clickSelector('[data-pick-l2="sports_baseball"]', { scroll: true });
      await sleep(300);
    }

    const drillMetrics = await browser.evalFn(measureSheetModalInPage, 'baseball_drilldown');
    const drillShot = shotPath('02_baseball_drilldown');
    await browser.screenshot(drillShot);
    result.screenshots.baseball_drilldown = drillShot;
    result.states.baseball_drilldown = drillMetrics;

    if (!drillMetrics.open) {
      result.failures.push(`[P0] Baseball Drill-Down: Modal failed to open`);
    } else {
      if (!drillMetrics.hasBaseballRef) {
        result.failures.push(`[P1] Baseball Drill-Down: Baseball topic not rendered`);
      }
      if (!drillMetrics.backInViewport) {
        result.failures.push(`[P1] Baseball Drill-Down: Sticky Back button clipped/missing`);
      }
      if (!drillMetrics.launchInViewport) {
        result.failures.push(`[P1] Baseball Drill-Down: Pinned Launch CTA #ws-cat-launch outside viewport`);
      }
      if (drillMetrics.horizontalOverflowPx > 1 || drillMetrics.innerHorizOverflowPx > 2) {
        result.failures.push(
          `[P1] Baseball Drill-Down: Horizontal overflow doc=${drillMetrics.horizontalOverflowPx}px inner=${drillMetrics.innerHorizOverflowPx}px`,
        );
      }
    }

    // -----------------------------------------------------------------------
    // 3. GAMEPLAY LIVE (Launched straight from Baseball Drill-Down!)
    // -----------------------------------------------------------------------
    const launchedBaseball = await browser.clickSelector('#ws-cat-launch', { scroll: true });
    if (!launchedBaseball) {
      result.failures.push(`[P0] Gameplay Live: Could not click #ws-cat-launch`);
    } else {
      const gotGameplay = await browser.waitFor(
        () =>
          document.querySelectorAll('[data-facet-idx]').length === 4 &&
          Boolean(document.querySelector('#ws-btn-overclock')),
        null,
        14000,
      );
      await sleep(700);

      if (!gotGameplay) {
        result.failures.push(`[P0] Gameplay Live: 4-facet Sightline question did not render after Baseball launch`);
      } else {
        const liveTopBar = await browser.evalFn(measureTopBarInPage);
        const liveGm = await browser.evalFn(measureGameplayInPage, 'live');
        const liveShot = shotPath('03_gameplay_live');
        await browser.screenshot(liveShot);
        result.screenshots.gameplay_live = liveShot;
        result.states.gameplay_live = { topBar: liveTopBar, gameplay: liveGm };
        result.failures.push(...evaluateGameplayChecks(liveGm, liveTopBar, 'Gameplay Live'));

        // -------------------------------------------------------------------
        // 4. GAMEPLAY TIER-2 PEEL (Clue Core)
        // -------------------------------------------------------------------
        await browser.clickSelector('#ws-btn-peel', { scroll: false });
        await sleep(550);
        const t2TopBar = await browser.evalFn(measureTopBarInPage);
        const t2Gm = await browser.evalFn(measureGameplayInPage, 'peel_t2');
        const t2Shot = shotPath('04_gameplay_peel_t2');
        await browser.screenshot(t2Shot);
        result.screenshots.gameplay_peel_t2 = t2Shot;
        result.states.gameplay_peel_t2 = { topBar: t2TopBar, gameplay: t2Gm };
        result.failures.push(...evaluateGameplayChecks(t2Gm, t2TopBar, 'Gameplay Peel Tier-2'));
        if (!t2Gm.controls.clueDrawer) {
          result.failures.push(`[P1] Gameplay Peel Tier-2: .ws-clue-drawer did not appear`);
        }

        // -------------------------------------------------------------------
        // 5. GAMEPLAY TIER-3 PEEL (Blueprint Pinpoint + 2 Shattered Facets)
        // -------------------------------------------------------------------
        await browser.clickSelector('#ws-btn-peel', { scroll: false });
        await sleep(550);
        const t3TopBar = await browser.evalFn(measureTopBarInPage);
        const t3Gm = await browser.evalFn(measureGameplayInPage, 'peel_t3');
        const t3Shot = shotPath('05_gameplay_peel_t3');
        await browser.screenshot(t3Shot);
        result.screenshots.gameplay_peel_t3 = t3Shot;
        result.states.gameplay_peel_t3 = { topBar: t3TopBar, gameplay: t3Gm };
        result.failures.push(...evaluateGameplayChecks(t3Gm, t3TopBar, 'Gameplay Peel Tier-3'));

        // -------------------------------------------------------------------
        // 6. GAMEPLAY REVEAL (SAVE INTEL + NEXT PRISM)
        // -------------------------------------------------------------------
        await browser.clickSelector('#ws-btn-overclock', { scroll: false, holdMs: 55 });
        let reachedReveal = await browser.waitFor(
          () => Boolean(document.querySelector('#ws-btn-next-q') && document.querySelector('#ws-btn-bookmark')),
          null,
          2500,
        );
        if (!reachedReveal) {
          result.failures.push(`[P0] Gameplay Reveal: Clicking #ws-btn-overclock FAILED to submit answer!`);
          // Fallback: double-click an active unshattered facet so we can still measure Reveal geometry
          await browser.evalFn(() => {
            const active = [...document.querySelectorAll('[data-facet-idx]')].find((b) => !b.disabled);
            if (active) {
              active.click();
              setTimeout(() => active.click(), 80);
            }
          });
          reachedReveal = await browser.waitFor(
            () => Boolean(document.querySelector('#ws-btn-next-q') && document.querySelector('#ws-btn-bookmark')),
            null,
            3000,
          );
        }
        await sleep(450);

        if (!reachedReveal) {
          result.failures.push(`[P0] Gameplay Reveal: Could not enter Reveal state even via fallback`);
        } else {
          const revTopBar = await browser.evalFn(measureTopBarInPage);
          const revGm = await browser.evalFn(measureGameplayInPage, 'reveal');
          const revShot = shotPath('06_gameplay_reveal');
          await browser.screenshot(revShot);
          result.screenshots.gameplay_reveal = revShot;
          result.states.gameplay_reveal = { topBar: revTopBar, gameplay: revGm };
          result.failures.push(...evaluateGameplayChecks(revGm, revTopBar, 'Gameplay Reveal'));
        }
      }
    }
  }

  // Reload cleanly back to Start Screen for Meta Suite & 5-Slot Saves audits
  await browser.navigate(`${baseUrl}/?v=audit_meta_${RUN_TAG}_${vp.id}`, false);
  await browser.waitFor(() => Boolean(document.querySelector('#ws-title-enter-cta')), null, 12000);
  await sleep(650);

  // -------------------------------------------------------------------------
  // 7. 3D INTEL OBSERVATORY (Screenshot #4 Acid Test!)
  // -------------------------------------------------------------------------
  const openedObs = await openMetaView(browser, 'OBSERVATORY');
  if (!openedObs) {
    result.failures.push(`[P0] 3D Intel Observatory: Could not open Observatory from Start Screen / Vault`);
  } else {
    await browser.waitFor(
      () => Boolean(document.querySelector('[aria-label*="Observatory"], .ws-meta-backdrop')),
      null,
      5000,
    );
    await sleep(750);
    const obsStage = await browser.evalFn(measureOpen3DStageInPage);
    const obsSheet = await browser.evalFn(measureSheetModalInPage, 'observatory_3d');
    const obsShot = shotPath('07_observatory_3d');
    await browser.screenshot(obsShot);
    result.screenshots.observatory_3d = obsShot;
    result.states.observatory_3d = { stage: obsStage, sheet: obsSheet };

    if (vp.isPortrait && obsStage.openStagePct < 48.0) {
      result.failures.push(
        `[P0] 3D Intel Observatory: Open unobstructed 3D stage = ${obsStage.openStagePct}% < 48% (sheetTop=${obsStage.highestBottomSheetTopPct}%, clearBand=${obsStage.contiguousVerticalOpenBandPct}%, blockers=${JSON.stringify(obsStage.topBlockers?.slice(0, 2))})`,
      );
    }
    if (!obsStage.stageTouchPassthrough) {
      result.failures.push(`[P1] 3D Intel Observatory: Top/Left 3D stage blocked from direct pointer drag orbit`);
    }
    if (!obsSheet.backInViewport) {
      result.failures.push(`[P1] 3D Intel Observatory: Back/Return control clipped or missing`);
    }
    if (obsStage.horizontalOverflowPx > 1 || obsSheet.innerHorizOverflowPx > 2) {
      result.failures.push(
        `[P1] 3D Intel Observatory: Horizontal overflow doc=${obsStage.horizontalOverflowPx}px inner=${obsSheet.innerHorizOverflowPx}px`,
      );
    }
    await closeAllOverlays(browser);
    await sleep(300);
  }

  // -------------------------------------------------------------------------
  // 8. PRISM ATELIER
  // -------------------------------------------------------------------------
  const openedAtelier = await openMetaView(browser, 'ATELIER');
  if (!openedAtelier) {
    result.failures.push(`[P0] Prism Atelier: Could not open Atelier from Start Screen / Vault`);
  } else {
    await browser.waitFor(
      () => Boolean(document.querySelector('[aria-label*="Atelier"], .ws-meta-backdrop')),
      null,
      5000,
    );
    await sleep(750);
    const atStage = await browser.evalFn(measureOpen3DStageInPage);
    const atSheet = await browser.evalFn(measureSheetModalInPage, 'prism_atelier');
    const atShot = shotPath('08_prism_atelier');
    await browser.screenshot(atShot);
    result.screenshots.prism_atelier = atShot;
    result.states.prism_atelier = { stage: atStage, sheet: atSheet };

    if (vp.isPortrait && atStage.openStagePct < 48.0) {
      result.failures.push(
        `[P0] Prism Atelier: Open unobstructed 3D stage = ${atStage.openStagePct}% < 48% (sheetTop=${atStage.highestBottomSheetTopPct}%, clearBand=${atStage.contiguousVerticalOpenBandPct}%, blockers=${JSON.stringify(atStage.topBlockers?.slice(0, 2))})`,
      );
    }
    if (!atStage.stageTouchPassthrough) {
      result.failures.push(`[P1] Prism Atelier: Top/Left 3D stage blocked from direct pointer drag orbit`);
    }
    if (!atSheet.backInViewport) {
      result.failures.push(`[P1] Prism Atelier: Back/Return control clipped or missing`);
    }
    if (atStage.horizontalOverflowPx > 1 || atSheet.innerHorizOverflowPx > 2) {
      result.failures.push(
        `[P1] Prism Atelier: Horizontal overflow doc=${atStage.horizontalOverflowPx}px inner=${atSheet.innerHorizOverflowPx}px`,
      );
    }
    await closeAllOverlays(browser);
    await sleep(300);
  }

  // -------------------------------------------------------------------------
  // 9. STATS GRAPHS (Career Analytics)
  // -------------------------------------------------------------------------
  const openedStats = await openMetaView(browser, 'ANALYTICS');
  if (!openedStats) {
    result.failures.push(`[P0] Stats Graphs: Could not open Stats from Start Screen / Vault`);
  } else {
    await browser.waitFor(
      () => Boolean(document.querySelector('[role="dialog"]:not([hidden]):not(#ws-vault-backdrop), .ws-meta-backdrop')),
      null,
      5000,
    );
    await sleep(500);
    const statsSheet = await browser.evalFn(measureSheetModalInPage, 'stats_graphs');
    const statsShot = shotPath('09_stats_graphs');
    await browser.screenshot(statsShot);
    result.screenshots.stats_graphs = statsShot;
    result.states.stats_graphs = statsSheet;

    if (!statsSheet.open) {
      result.failures.push(`[P0] Stats Graphs: Dashboard failed to open`);
    } else {
      if (statsSheet.chartSvgs.length === 0) {
        result.failures.push(`[P1] Stats Graphs: No SVG analytics chart rendered`);
      }
      if (!statsSheet.chartFitsWidth) {
        result.failures.push(`[P1] Stats Graphs: SVG graph overflows viewport width`);
      }
      if (!statsSheet.backInViewport) {
        result.failures.push(`[P1] Stats Graphs: Back/Return control clipped or missing`);
      }
      if (statsSheet.horizontalOverflowPx > 1 || statsSheet.innerHorizOverflowPx > 2) {
        result.failures.push(
          `[P1] Stats Graphs: Horizontal overflow doc=${statsSheet.horizontalOverflowPx}px inner=${statsSheet.innerHorizOverflowPx}px`,
        );
      }
    }
    await closeAllOverlays(browser);
    await sleep(300);
  }

  // -------------------------------------------------------------------------
  // 10. 64 TROPHIES (Hall of Honours)
  // -------------------------------------------------------------------------
  const openedHonours = await openMetaView(browser, 'HONOURS');
  if (!openedHonours) {
    result.failures.push(`[P0] 64 Trophies: Could not open Hall of Honours from Start Screen / Vault`);
  } else {
    await browser.waitFor(
      () => Boolean(document.querySelector('[role="dialog"]:not([hidden]):not(#ws-vault-backdrop), .ws-meta-backdrop')),
      null,
      5000,
    );
    await sleep(500);
    const trSheet = await browser.evalFn(measureSheetModalInPage, 'trophies_64');
    const trShot = shotPath('10_trophies_64');
    await browser.screenshot(trShot);
    result.screenshots.trophies_64 = trShot;
    result.states.trophies_64 = trSheet;

    if (!trSheet.open) {
      result.failures.push(`[P0] 64 Trophies: Hall of Honours failed to open`);
    } else {
      if (!trSheet.has64TrophiesRef) {
        result.failures.push(`[P1] 64 Trophies: 64-trophy catalog indicator missing`);
      }
      if (trSheet.brokenImgCount > 0) {
        result.failures.push(`[P1] 64 Trophies: ${trSheet.brokenImgCount} broken medal images (${trSheet.brokenImgs.join(', ')})`);
      }
      if (!trSheet.backInViewport) {
        result.failures.push(`[P1] 64 Trophies: Back/Return control clipped or missing`);
      }
      if (trSheet.horizontalOverflowPx > 1 || trSheet.innerHorizOverflowPx > 2) {
        result.failures.push(
          `[P1] 64 Trophies: Horizontal overflow doc=${trSheet.horizontalOverflowPx}px inner=${trSheet.innerHorizOverflowPx}px`,
        );
      }
    }
    await closeAllOverlays(browser);
    await sleep(300);
  }

  // -------------------------------------------------------------------------
  // 11. 5-SLOT CAMPAIGN SAVES
  // -------------------------------------------------------------------------
  const openedSaves = await openMetaView(browser, 'SAVES');
  if (!openedSaves) {
    result.failures.push(`[P0] 5-Slot Saves: Could not open Saves modal from Start Screen / Vault`);
  } else {
    await browser.waitFor(() => document.querySelectorAll('[data-slot-load]').length === 5, null, 5000);
    await sleep(450);
    const svSheet = await browser.evalFn(measureSheetModalInPage, 'saves_5slot');
    const svShot = shotPath('11_saves_5slot');
    await browser.screenshot(svShot);
    result.screenshots.saves_5slot = svShot;
    result.states.saves_5slot = svSheet;

    if (!svSheet.open || svSheet.slotCount !== 5) {
      result.failures.push(`[P0] 5-Slot Saves: Expected 5 save slots, found ${svSheet.slotCount}`);
    }
    if (!svSheet.backInViewport) {
      result.failures.push(`[P1] 5-Slot Saves: Back/Return control clipped or missing`);
    }
    if (svSheet.horizontalOverflowPx > 1 || svSheet.innerHorizOverflowPx > 2) {
      result.failures.push(
        `[P1] 5-Slot Saves: Horizontal overflow doc=${svSheet.horizontalOverflowPx}px inner=${svSheet.innerHorizOverflowPx}px`,
      );
    }
    await closeAllOverlays(browser);
  }

  return result;
}

// ============================================================================
// ENTRYPOINT
// ============================================================================

async function main() {
  const { server, port, baseUrl } = await startStaticServer(DIST_DIR);
  console.log(`[RT-MOBILE-AUDIT] Serving dist/ on ephemeral ${baseUrl} (tag=${RUN_TAG})`);

  let browser = null;
  const allResults = [];

  try {
    browser = await CdpBrowser.launch();

    for (let vi = 0; vi < VIEWPORTS.length; vi++) {
      const vp = VIEWPORTS[vi];
      console.log(`\n=== AUDITING VIEWPORT ${vp.id} (${vp.label}) ===`);
      if (vi > 0) {
        await browser.openFreshTab();
      } else {
        browser.consoleErrors = [];
        browser.httpErrors = [];
      }

      const res = await auditViewport(browser, baseUrl, vp);
      const vpConsoleErrs = [...browser.consoleErrors];
      const vpHttpErrs = [...browser.httpErrors];
      res.consoleErrors = vpConsoleErrs;
      res.httpErrors = vpHttpErrs;
      if (vpConsoleErrs.length > 0) {
        res.failures.push(`[P0] Console/Runtime errors (${vpConsoleErrs.length}): ${vpConsoleErrs[0].slice(0, 140)}`);
      }
      if (vpHttpErrs.length > 0) {
        res.failures.push(`[P0] HTTP 4xx/5xx errors (${vpHttpErrs.length}): ${vpHttpErrs[0]}`);
      }

      allResults.push(res);

      const st = res.states;
      const start3d = st.start?.stage?.openStagePct ?? 'n/a';
      const topH = st.start?.topBar?.height ?? 'n/a';
      const obs3d = st.observatory_3d?.stage?.openStagePct ?? 'n/a';
      const at3d = st.prism_atelier?.stage?.openStagePct ?? 'n/a';
      const liveF = st.gameplay_live?.gameplay?.facets ?? [];
      const liveClipped = liveF.filter((f) => !f.inViewport || f.clips?.length > 0).length;
      const revF = st.gameplay_reveal?.gameplay?.facets ?? [];
      const revClipped = revF.filter((f) => !f.inViewport || f.clips?.length > 0).length;

      console.log(
        `  Summary: topBar=${topH}px | Start3D=${start3d}% | Obs3D=${obs3d}% | Atelier3D=${at3d}% | LiveClipped=${liveClipped}/4 | RevealClipped=${revClipped}/4 | Failures=${res.failures.length}`,
      );
      for (const f of res.failures) {
        console.log(`    FAIL: ${f}`);
      }
    }

    const reportPath = path.join(SCREENSHOT_DIR, `audit_${RUN_TAG}_report.json`);
    fs.writeFileSync(reportPath, JSON.stringify({ tag: RUN_TAG, timestamp: new Date().toISOString(), results: allResults }, null, 2));

    const passedCount = allResults.filter((r) => r.failures.length === 0).length;
    console.log(`\n=============================================================`);
    console.log(`[RT-MOBILE-AUDIT] SCOREBOARD (${RUN_TAG}): ${passedCount} / ${allResults.length} VIEWPORTS PASSED 100%`);
    console.log(`Report JSON: ${reportPath}`);
    console.log(`=============================================================`);

    if (passedCount < allResults.length) {
      process.exitCode = 1;
    }
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error('[RT-MOBILE-AUDIT] FATAL:', err);
  process.exit(2);
});
