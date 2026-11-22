#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST v2.0 — Adversarial Red-Team Menu, Continue-Game UX &
// Holistic Visual Presentation Audit (`rt-v2-menu-presentation`)
//
// Zero mercy, real CDP mouse/keyboard clicks ONLY (never synthetic el.click()),
// verifies elementFromPoint hit-testing on every click, spins up its own
// ephemeral 127.0.0.1:0 static server on `dist/` (NEVER touches :8088!).
//
// Usage:
//   node tools/qa/rt_v2_menu_and_presentation_audit.mjs
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
  'C:\\Users\\mshaf\\.gemini\\antigravity\\brain\\229d9453-93d6-4c7e-8434-15f1ca63997b\\scratch\\rt_v2_menu_presentation';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const VIEWPORTS = [
  { id: '360x640', label: 'Compact Phone Portrait', width: 360, height: 640, mobile: true, dpr: 2, isPortrait: true },
  { id: '390x844', label: 'iPhone 15 Portrait', width: 390, height: 844, mobile: true, dpr: 2, isPortrait: true },
  { id: '430x932', label: 'Pro Max Portrait', width: 430, height: 932, mobile: true, dpr: 2, isPortrait: true },
  { id: '844x390', label: 'Phone Landscape', width: 844, height: 390, mobile: true, dpr: 2, isPortrait: false },
  { id: '1280x800', label: 'Desktop', width: 1280, height: 800, mobile: false, dpr: 1, isPortrait: false },
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
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-rt-v2-menu-'));
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

  async openFreshTab() {
    const oldTargetId = this.activeTargetId;
    try { this.ws?.close(); } catch {}
    this.ws = null;
    this.pending.clear();
    this.listeners.clear();

    const resp = await fetch(`http://127.0.0.1:${this.cdpPort}/json/new?about:blank`, { method: 'PUT' });
    const target = await resp.json();
    if (!target || !target.webSocketDebuggerUrl) {
      throw new Error('Failed to create fresh CDP tab');
    }
    this.activeTargetId = target.id;
    if (oldTargetId) {
      fetch(`http://127.0.0.1:${this.cdpPort}/json/close/${oldTargetId}`).catch(() => {});
    }
    await this.connectWs(target.webSocketDebuggerUrl);
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
    await sleep(120);
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

  async waitFor(selector, timeoutMs = 15000) {
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

  async waitUntil(predicateFn, timeoutMs = 15000, ...args) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const ok = await this.evalFn(predicateFn, ...args);
      if (ok) return true;
      await sleep(90);
    }
    return false;
  }

  /**
   * 100% REAL CDP pointer click — verifies visibility & elementFromPoint hit-test!
   * Zero synthetic el.click() shortcuts!
   */
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
            text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
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
      throw new Error(`realClick: element "${selector}" is disabled`);
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
    await sleep(25);
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: targetInfo.cx,
      y: targetInfo.cy,
      button: 'left',
      clickCount: 1,
    });
    await sleep(35);
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
    await sleep(80);
    // Select all and clear via keyboard
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

// ============================================================================
// IN-PAGE HOLISTIC VISUAL PRESENTATION & BEAUTY AUDITOR
// ============================================================================
function auditPresentationInPage(screenLabel) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  function parseColor(str) {
    if (!str || str === 'transparent' || str === 'none') return { r: 0, g: 0, b: 0, a: 0 };
    const m = str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)/i);
    if (!m) return { r: 0, g: 0, b: 0, a: 0 };
    return {
      r: parseFloat(m[1]),
      g: parseFloat(m[2]),
      b: parseFloat(m[3]),
      a: m[4] !== undefined ? parseFloat(m[4]) : 1,
    };
  }

  function composite(fg, bg) {
    const a = fg.a + bg.a * (1 - fg.a);
    if (a <= 0.001) return { r: 8, g: 11, b: 17, a: 1 };
    return {
      r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
      g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
      b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
      a,
    };
  }

  function luminance(c) {
    const ch = [c.r, c.g, c.b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }

  function contrastRatio(fg, bg) {
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  function describeEl(el) {
    if (!el || !el.tagName) return 'null';
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    const cls = typeof el.className === 'string'
      ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.')
      : '';
    if (cls) s += '.' + cls;
    return s;
  }

  function isVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return false;
    return true;
  }

  function has4SideBorder(el, cs, rect) {
    const tag = el.tagName.toLowerCase();
    if (['svg', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'input', 'textarea', 'select', 'canvas', 'hr', 'img'].includes(tag)) {
      return { boxed: false, reason: '' };
    }
    if (cs.borderImageSource && cs.borderImageSource !== 'none') {
      return { boxed: true, reason: 'border-image', ninepatch: true };
    }
    const bt = parseFloat(cs.borderTopWidth) || 0;
    const br = parseFloat(cs.borderRightWidth) || 0;
    const bb = parseFloat(cs.borderBottomWidth) || 0;
    const bl = parseFloat(cs.borderLeftWidth) || 0;
    const ct = parseColor(cs.borderTopColor);
    const cr = parseColor(cs.borderRightColor);
    const cb = parseColor(cs.borderBottomColor);
    const cl = parseColor(cs.borderLeftColor);
    const sides =
      (bt >= 0.75 && cs.borderTopStyle !== 'none' && ct.a >= 0.08 ? 1 : 0) +
      (br >= 0.75 && cs.borderRightStyle !== 'none' && cr.a >= 0.08 ? 1 : 0) +
      (bb >= 0.75 && cs.borderBottomStyle !== 'none' && cb.a >= 0.08 ? 1 : 0) +
      (bl >= 0.75 && cs.borderLeftStyle !== 'none' && cl.a >= 0.08 ? 1 : 0);

    const brRad = parseFloat(cs.borderTopLeftRadius) || 0;
    const isTinyCircle = rect.width <= 44 && rect.height <= 44 && Math.abs(rect.width - rect.height) <= 4 && brRad >= rect.width * 0.4;
    if (isTinyCircle) return { boxed: false, reason: '' };
    if (sides >= 3) return { boxed: true, reason: `${sides}-side border`, ninepatch: false };
    if (cs.boxShadow && cs.boxShadow !== 'none') {
      const m = cs.boxShadow.match(/rgba?\([^)]+\)\s+0px\s+0px\s+0px\s+([\d.]+)px\s+inset/i);
      if (m && parseFloat(m[1]) >= 0.75) {
        const sc = parseColor(cs.boxShadow);
        if (sc.a >= 0.14) return { boxed: true, reason: `inset-ring(${m[1]}px)`, ninepatch: false };
      }
    }
    return { boxed: false, reason: '' };
  }

  function effectiveBg(el) {
    const chain = [];
    let cur = el;
    while (cur && cur.nodeType === 1) {
      const cs = getComputedStyle(cur);
      const bg = parseColor(cs.backgroundColor);
      if (bg.a > 0.01) chain.push(bg);
      if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
        const gm = cs.backgroundImage.match(/rgba?\(\s*\d+[,\s]+\d+[,\s]+\d+(?:[,\s]+([\d.]+))?\s*\)/gi);
        if (gm && gm.length) {
          // For solid gold buttons, sample mid gradient stop
          const pick = gm[Math.floor(gm.length / 2)];
          const parsed = parseColor(pick);
          if (parsed.a > 0.3) chain.push(parsed);
        }
      }
      cur = cur.parentElement;
    }
    let acc = { r: 8, g: 11, b: 17, a: 1 };
    for (let i = chain.length - 1; i >= 0; i--) {
      acc = composite(chain[i], acc);
    }
    return acc;
  }

  // Scope visible elements (ignore hidden #ui-root when modal/cutscene hides it, or focus active overlay if present)
  const activeModal = Array.from(document.querySelectorAll('body > div:not(#app)')).find(isVisible);
  const allEls = activeModal
    ? [activeModal, ...Array.from(activeModal.querySelectorAll('*'))]
    : Array.from(document.querySelectorAll('#ui-root *'));
  const visibleEls = allEls.filter(isVisible);

  const backdropElements = [];
  const ninePatchElements = [];
  const boxedSet = new Map();
  for (const el of visibleEls) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const bInfo = has4SideBorder(el, cs, rect);
    if (bInfo.boxed) {
      boxedSet.set(el, { ...bInfo, rect });
      if (bInfo.ninepatch) ninePatchElements.push(describeEl(el));
    }
    const bf = cs.backdropFilter || cs.webkitBackdropFilter || 'none';
    if (bf !== 'none') {
      backdropElements.push({ el: describeEl(el), filter: bf });
    }
  }

  let maxBorderDepth = 0;
  const nestedBoxes = [];
  for (const [el, info] of boxedSet.entries()) {
    let depth = 1;
    let nearestParent = null;
    let cur = el.parentElement;
    while (cur) {
      if (boxedSet.has(cur)) {
        depth++;
        if (!nearestParent) nearestParent = cur;
      }
      cur = cur.parentElement;
    }
    if (depth > maxBorderDepth) maxBorderDepth = depth;
    if (depth >= 2 && nestedBoxes.length < 15) {
      nestedBoxes.push({
        depth,
        parent: describeEl(nearestParent),
        parentReason: boxedSet.get(nearestParent).reason,
        child: describeEl(el),
        childReason: info.reason,
      });
    }
  }

  // Open 3D Stage Viewport Ratio (10x16 grid)
  let totalSamples = 0;
  let openSamples = 0;
  for (let gx = 0; gx < 10; gx++) {
    for (let gy = 0; gy < 16; gy++) {
      const x = ((gx + 0.5) / 10) * vw;
      const y = ((gy + 0.5) / 16) * vh;
      const stack = document.elementsFromPoint(x, y);
      let blocked = false;
      for (const el of stack) {
        if (el.id === 'canvas-root' || el.tagName === 'CANVAS') break;
        if (el.id === 'ui-root' || el.id === 'app' || el === document.body || el === document.documentElement) continue;
        const cs = getComputedStyle(el);
        const bg = parseColor(cs.backgroundColor);
        const hasOpaqueGrad = cs.backgroundImage && cs.backgroundImage !== 'none' && !cs.backgroundImage.includes('rgba(0, 0, 0, 0) 0%') && !cs.backgroundImage.includes('rgba(4, 7, 14, 0) 0%');
        const hasBorder = boxedSet.has(el);
        const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
        if (bg.a >= 0.35 || hasBorder || hasText || (hasOpaqueGrad && el.getBoundingClientRect().height < vh * 0.85)) {
          blocked = true;
          break;
        }
      }
      totalSamples++;
      if (!blocked) openSamples++;
    }
  }

  // Exact Title Stage Vertical Open Ratio (topbar bottom -> title dock top)
  let titleOpenStagePct = null;
  const titleDock = document.querySelector('.ws-title-dock');
  const titleHero = document.querySelector('.ws-title-hero');
  const topbar = document.querySelector('.ws-topbar');
  if (titleDock && isVisible(titleDock)) {
    const dockRect = titleDock.getBoundingClientRect();
    const topEnd = titleHero && isVisible(titleHero)
      ? Math.max(topbar ? topbar.getBoundingClientRect().bottom : 0, titleHero.getBoundingClientRect().bottom)
      : (topbar ? topbar.getBoundingClientRect().bottom : 0);
    const openH = Math.max(0, dockRect.top - topEnd);
    const totalFreeH = Math.max(0, dockRect.top - (topbar ? topbar.getBoundingClientRect().bottom : 0));
    titleOpenStagePct = {
      betweenHeroAndDockPct: Number(((openH / vh) * 100).toFixed(1)),
      aboveDockPct: Number(((totalFreeH / vh) * 100).toFixed(1)),
      dockHeightPx: Math.round(dockRect.height),
      dockTopPx: Math.round(dockRect.top),
      heroBottomPx: titleHero ? Math.round(titleHero.getBoundingClientRect().bottom) : 0,
    };
  }

  // Gameplay A-D Facet Overlap & Visibility
  const facetEls = Array.from(document.querySelectorAll('[data-facet-idx]')).filter(isVisible);
  const actionBlockers = ['#ws-btn-overclock', '#ws-btn-peel', '#ws-btn-bookmark', '#ws-btn-next-q']
    .map((sel) => document.querySelector(sel))
    .filter((el) => el && isVisible(el));
  const coveredFacets = [];
  for (const f of facetEls) {
    const fr = f.getBoundingClientRect();
    if (fr.height < 32 || fr.bottom > vh + 1 || fr.top < 0 || fr.left < -1 || fr.right > vw + 1) {
      coveredFacets.push({ idx: f.dataset.facetIdx, issue: 'clipped-or-offscreen', rect: { t: Math.round(fr.top), b: Math.round(fr.bottom), h: Math.round(fr.height) } });
    }
    const cx = fr.left + fr.width / 2;
    const cy = fr.top + fr.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    if (hit && hit !== f && !f.contains(hit) && !hit.contains(f)) {
      coveredFacets.push({ idx: f.dataset.facetIdx, issue: 'hit-test-covered', coveredBy: describeEl(hit) });
    }
    for (const act of actionBlockers) {
      const ar = act.getBoundingClientRect();
      const ox = Math.max(0, Math.min(fr.right, ar.right) - Math.max(fr.left, ar.left));
      const oy = Math.max(0, Math.min(fr.bottom, ar.bottom) - Math.max(fr.top, ar.top));
      if (ox > 2 && oy > 2) {
        coveredFacets.push({ idx: f.dataset.facetIdx, issue: `overlapped-by-${act.id}`, overlapPx: Math.round(ox * oy) });
      }
    }
  }

  // Typography, Contrast, Clipping, Horizontal Overflow
  const tinyText = [];
  const lowContrast = [];
  const clippedLabels = [];
  for (const el of visibleEls) {
    const directText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(' ')
      .trim();
    if (!directText) continue;

    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize) || 14;
    const fw = parseInt(cs.fontWeight, 10) || 400;
    if (fs < 9.95) {
      tinyText.push({ el: describeEl(el), fontSize: Number(fs.toFixed(2)), text: directText.slice(0, 40) });
    }

    const fg = parseColor(cs.color);
    const bg = effectiveBg(el);
    if (fg.a > 0.1) {
      const fgComp = composite(fg, bg);
      const ratio = contrastRatio(fgComp, bg);
      const isLarge = fs >= 18 || (fs >= 14 && fw >= 700);
      const req = isLarge ? 3.0 : 4.5;
      if (ratio < req && lowContrast.length < 15) {
        lowContrast.push({
          el: describeEl(el),
          ratio: Number(ratio.toFixed(2)),
          req,
          fg: cs.color,
          bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
          fs: Math.round(fs),
          text: directText.slice(0, 36),
        });
      }
    }

    // Check clipping on buttons, labels, titles, badges, pills
    // (For .ws-btn-gold, measure actual text Range width because animated ::after sheen temporarily expands scrollWidth)
    const isInteractiveOrLabel =
      el.tagName === 'BUTTON' ||
      el.closest('button') ||
      el.className?.toString().includes('label') ||
      el.className?.toString().includes('title') ||
      el.className?.toString().includes('badge') ||
      el.className?.toString().includes('pill') ||
      el.id === 'ws-mc-text';
    let effScrollW = el.scrollWidth;
    if (el.classList?.contains('ws-btn-gold') && el.clientWidth > 16) {
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        const tr = range.getBoundingClientRect();
        effScrollW = Math.ceil(tr.width);
      } catch {}
    }
    if (
      isInteractiveOrLabel &&
      (cs.overflowX === 'hidden' || cs.overflow === 'hidden') &&
      effScrollW > el.clientWidth + 3 &&
      el.clientWidth > 16 &&
      !el.className?.toString().includes('ws-chyron-sub') &&
      !el.className?.toString().includes('ws-chyron-title') &&
      !el.className?.toString().includes('ws-city-venue') &&
      !el.className?.toString().includes('ws-briefing-row-sub') &&
      !el.className?.toString().includes('ws-hub-continue-sub') &&
      clippedLabels.length < 15
    ) {
      clippedLabels.push({
        el: describeEl(el),
        scrollW: Math.round(effScrollW),
        clientW: Math.round(el.clientWidth),
        text: directText.slice(0, 44),
      });
    }
  }

  const horizOverflowPx = Math.max(0, Math.round(document.documentElement.scrollWidth - vw));

  return {
    screen: screenLabel,
    viewport: `${vw}x${vh}`,
    horizOverflowPx,
    open3dGridPct: Number(((openSamples / Math.max(1, totalSamples)) * 100).toFixed(1)),
    titleOpenStagePct,
    maxBorderDepth,
    nestedBoxCount: nestedBoxes.length,
    nestedBoxes,
    ninePatchCount: ninePatchElements.length,
    backdropFilterCount: backdropElements.length,
    backdropElements,
    coveredFacetsCount: coveredFacets.length,
    coveredFacets,
    tinyTextCount: tinyText.length,
    tinyText,
    lowContrastCount: lowContrast.length,
    lowContrast,
    clippedLabelsCount: clippedLabels.length,
    clippedLabels,
  };
}

// ============================================================================
// REPORT COLLECTOR
// ============================================================================
const results = {
  passed: [],
  failed: [],
  warnings: [],
  screenshots: [],
  presentationAudits: [],
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
  return cond;
}

function recordAudit(audit, screenId, strict3dMin = null) {
  results.presentationAudits.push(audit);
  const tag = `UI:${screenId}@${audit.viewport}`;
  check(`${tag}:nested-boxes`, audit.nestedBoxCount === 0, `nested=${audit.nestedBoxCount}${audit.nestedBoxes.length ? ' ' + JSON.stringify(audit.nestedBoxes.slice(0, 2)) : ''}`, 'P1');
  check(`${tag}:backdrop-filter`, audit.backdropFilterCount === 0, `backdropFilters=${audit.backdropFilterCount}`, 'P0');
  check(`${tag}:ninepatch`, audit.ninePatchCount === 0, `ninePatch=${audit.ninePatchCount}`, 'P1');
  check(`${tag}:sub-10px`, audit.tinyTextCount === 0, `tinyText=${audit.tinyTextCount}${audit.tinyText.length ? ' ' + JSON.stringify(audit.tinyText.slice(0, 2)) : ''}`, 'P1');
  check(`${tag}:horiz-overflow`, audit.horizOverflowPx <= 1, `horizOverflowPx=${audit.horizOverflowPx}`, 'P0');
  check(`${tag}:covered-facets`, audit.coveredFacetsCount === 0, `coveredFacets=${audit.coveredFacetsCount}${audit.coveredFacets.length ? ' ' + JSON.stringify(audit.coveredFacets) : ''}`, 'P0');
  check(`${tag}:clipped-labels`, audit.clippedLabelsCount === 0, `clippedLabels=${audit.clippedLabelsCount}${audit.clippedLabels.length ? ' ' + JSON.stringify(audit.clippedLabels.slice(0, 3)) : ''}`, 'P1');
  check(`${tag}:contrast-wcag-aa`, audit.lowContrastCount === 0, `lowContrast=${audit.lowContrastCount}${audit.lowContrast.length ? ' ' + JSON.stringify(audit.lowContrast.slice(0, 3)) : ''}`, 'P1');
  if (strict3dMin !== null) {
    const bestOpen = Math.max(
      audit.open3dGridPct,
      audit.titleOpenStagePct?.aboveDockPct ?? 0,
    );
    check(
      `${tag}:open-3d-stage`,
      bestOpen >= strict3dMin,
      `gridOpen=${audit.open3dGridPct}%, aboveDock=${audit.titleOpenStagePct?.aboveDockPct ?? 'n/a'}%, betweenHeroDock=${audit.titleOpenStagePct?.betweenHeroAndDockPct ?? 'n/a'}% (min ${strict3dMin}%)`,
      'P0',
    );
  }
}

async function waitForAppBoot(driver, timeoutMs = 15000) {
  await driver.waitFor('#ws-title-enter-cta', timeoutMs);
  // Wait for async campaign/forge boot re-render to settle
  await sleep(1600);
}

async function openCampaignMapFromTitle(driver) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    await driver.realClick('[data-title-mode="CAMPAIGN"]');
    if (await driver.waitFor('.ws-cities-grid', 5000)) {
      await sleep(300);
      return true;
    }
    await sleep(400);
  }
  throw new Error('Failed to open Campaign Map (.ws-cities-grid) from Title');
}

async function lockCurrentQuestionByRealClick(driver, preferredText = null) {
  const state = await driver.evalFn(() => {
    const facets = Array.from(document.querySelectorAll('[data-facet-idx]')).map((b) => ({
      idx: Number(b.dataset.facetIdx),
      text: (b.textContent || '').trim(),
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
    await sleep(120);
    await driver.realClick('#ws-btn-overclock');
  } else if (state.calSlider || state.codexBtns > 0) {
    await driver.realClick('#ws-btn-overclock');
  } else if (state.facets.length > 0) {
    let pickIdx = state.facets.find((f) => !f.disabled)?.idx ?? 0;
    if (preferredText) {
      const match = state.facets.find(
        (f) => !f.disabled && f.text.toLowerCase().includes(preferredText.toLowerCase()),
      );
      if (match) pickIdx = match.idx;
    }
    // Tap facet once to arm, then tap overclock lock (safe 1-tap lock)
    await driver.realClick(`[data-facet-idx="${pickIdx}"]`);
    await sleep(120);
    const alreadyRevealed = await driver.evalFn(() => Boolean(document.querySelector('#ws-btn-next-q, #ws-instant-prism-next-bar')));
    if (!alreadyRevealed) {
      await driver.realClick('#ws-btn-overclock');
    }
  } else {
    throw new Error('Unknown gameplay archetype — no interactive submit controls found');
  }

  const revealed = await driver.waitFor('#ws-btn-next-q, #ws-instant-prism-next-bar', 8000);
  if (!revealed) {
    throw new Error('Reveal bar did not appear after real-clicking answer lock!');
  }
}

async function runAudit() {
  const { server, baseUrl } = await startStaticServer(DIST_DIR);
  console.log(`\n[RT-V2-MENU-PRESENTATION] Serving dist/ at ${baseUrl}`);
  const driver = await CdpDriver.launch();

  try {
    // ========================================================================
    // PART A: MULTI-VIEWPORT START SCREEN + 1-CLICK PICK A TOPIC SWEEP
    // Viewports: 360x640, 390x844, 430x932, 844x390, 1280x800
    // ========================================================================
    console.log('\n=== PART A: 5-VIEWPORT START SCREEN (STATE 1) & TOPIC PICKER (STATE 2A) ===');
    await driver.setViewport(VIEWPORTS[0]);
    await driver.navigate(baseUrl, true);
    await waitForAppBoot(driver);

    for (let vi = 0; vi < VIEWPORTS.length; vi++) {
      const vp = VIEWPORTS[vi];
      console.log(`\n--- Viewport ${vp.id} (${vp.label}) ---`);
      if (vi > 0) {
        await driver.setViewport(vp);
        await sleep(350);
      }

      // Capture Fresh Start Screen
      const startShot = `01_start_${vp.id}.png`;
      await driver.screenshot(startShot);
      results.screenshots.push(startShot);

      // Audit Start Screen State 1 Contract
      const startMetrics = await driver.evalFn(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cta = document.querySelector('#ws-title-enter-cta');
        const modeBtns = Array.from(document.querySelectorAll('[data-title-mode]'));
        const quickBtn = document.querySelector('#ws-btn-instant-prism');
        const savesBtn = document.querySelector('#ws-title-saves-cta');
        const fullTitleText = (document.querySelector('.ws-title-showcase')?.textContent || '');
        const modeInfo = modeBtns.map((b) => {
          const r = b.getBoundingClientRect();
          const cs = getComputedStyle(b);
          return {
            mode: b.dataset.titleMode,
            text: (b.textContent || '').trim(),
            width: Math.round(r.width),
            height: Math.round(r.height),
            top: Math.round(r.top),
            right: Math.round(r.right),
            scrollW: Math.round(b.scrollWidth),
            clientW: Math.round(b.clientWidth),
            clipped: b.scrollWidth > b.clientWidth + 2,
            fontSize: parseFloat(cs.fontSize),
          };
        });
        const metaRow = document.querySelector('.ws-title-meta-row');
        const metaRect = metaRow ? metaRow.getBoundingClientRect() : null;
        return {
          vw,
          vh,
          ctaText: cta ? (cta.textContent || '').trim().replace(/\s+/g, ' ') : '',
          ctaRect: cta ? { w: Math.round(cta.getBoundingClientRect().width), h: Math.round(cta.getBoundingClientRect().height) } : null,
          modeInfo,
          modeRowsCount: new Set(modeInfo.map((m) => Math.round(m.top / 16))).size,
          quickText: quickBtn ? (quickBtn.textContent || '').trim() : '',
          savesText: savesBtn ? (savesBtn.textContent || '').trim() : '',
          metaFits: metaRect ? metaRect.right <= vw + 1 : false,
          hasJargonBriefing: /\bBriefing\b/i.test(fullTitleText),
          hasJargonCircuit: /\bCircuit\b/i.test(fullTitleText),
          hasJargonTrials: /\bTrials\b/i.test(fullTitleText),
        };
      });

      results.metrics[`start_${vp.id}`] = startMetrics;
      check(
        `State1@${vp.id}:cta-start-story`,
        /START STORY CAMPAIGN/i.test(startMetrics.ctaText),
        `CTA="${startMetrics.ctaText}" (${startMetrics.ctaRect?.w}x${startMetrics.ctaRect?.h})`,
        'P0',
      );
      const expectedLabels = ['Campaign Map', 'Pick a Topic', 'Daily 10', 'Endless', '1v1 Duels'];
      const actualLabels = startMetrics.modeInfo.map((m) => m.text);
      check(
        `State1@${vp.id}:plain-english-5-buttons`,
        expectedLabels.every((lbl, i) => actualLabels[i] === lbl),
        `labels=${JSON.stringify(actualLabels)}`,
        'P0',
      );
      check(
        `State1@${vp.id}:zero-jargon`,
        !startMetrics.hasJargonBriefing && !startMetrics.hasJargonCircuit && !startMetrics.hasJargonTrials,
        `Briefing=${startMetrics.hasJargonBriefing}, Circuit=${startMetrics.hasJargonCircuit}, Trials=${startMetrics.hasJargonTrials}`,
        'P0',
      );
      const anyModeClipped = startMetrics.modeInfo.some((m) => m.clipped || m.right > vp.width + 1);
      check(
        `State1@${vp.id}:mode-strip-no-clip-overflow`,
        !anyModeClipped && startMetrics.modeRowsCount === 1,
        `rows=${startMetrics.modeRowsCount}, items=${JSON.stringify(startMetrics.modeInfo.map((m) => `${m.text}(${m.clientW}/${m.scrollW})`))}`,
        'P0',
      );
      check(
        `State1@${vp.id}:compact-meta-strip`,
        /Quick 1-Q/i.test(startMetrics.quickText) && /Saves/i.test(startMetrics.savesText) && startMetrics.metaFits,
        `quick="${startMetrics.quickText}", saves="${startMetrics.savesText}", metaFits=${startMetrics.metaFits}`,
        'P1',
      );

      const startAudit = await driver.evalFn(auditPresentationInPage, `StartScreen_${vp.id}`);
      recordAudit(startAudit, `StartScreen`, vp.isPortrait ? 48 : 35);

      // Real-click "Pick a Topic" on Start Screen -> MUST open BriefingCategoriesModal in 1 single click!
      await driver.realClick('[data-title-mode="BRIEFING"]');
      const modalOpened = await driver.waitFor('.ws-briefing-modal .ws-briefing-sheet', 4000);
      check(
        `State2A@${vp.id}:pick-topic-1-click-modal`,
        modalOpened,
        modalOpened ? 'BriefingCategoriesModal opened directly in 1 click' : 'Did NOT open modal in 1 click!',
        'P0',
      );

      if (modalOpened) {
        await sleep(300);
        if (vp.id === '360x640' || vp.id === '844x390' || vp.id === '1280x800') {
          const shot = `02_topic_picker_${vp.id}.png`;
          await driver.screenshot(shot);
          results.screenshots.push(shot);
        }

        const diffAudit = await driver.evalFn(() => {
          const vw = window.innerWidth;
          const strip = document.querySelector('.ws-briefing-diff-strip');
          const stripCs = strip ? getComputedStyle(strip) : null;
          const stripRect = strip ? strip.getBoundingClientRect() : null;
          const btns = Array.from(document.querySelectorAll('.ws-briefing-diff-btn')).map((b) => {
            const r = b.getBoundingClientRect();
            const cs = getComputedStyle(b);
            return {
              diff: b.dataset.diff,
              text: (b.textContent || '').trim(),
              visible: r.width > 1 && r.height > 1 && cs.display !== 'none' && cs.visibility !== 'hidden',
              width: Math.round(r.width),
              height: Math.round(r.height),
              right: Math.round(r.right),
              clipped: b.scrollWidth > b.clientWidth + 2,
              scrollW: Math.round(b.scrollWidth),
              clientW: Math.round(b.clientWidth),
              fontSize: parseFloat(cs.fontSize),
            };
          });
          return {
            stripVisible: Boolean(strip && stripRect && stripRect.width > 0 && stripRect.height > 0 && stripCs.display !== 'none'),
            stripOverflowPx: strip ? Math.max(0, Math.round(strip.scrollWidth - strip.clientWidth)) : -1,
            stripRight: stripRect ? Math.round(stripRect.right) : -1,
            vw,
            btns,
          };
        });
        results.metrics[`topic_picker_diff_${vp.id}`] = diffAudit;

        const expectedDiffs = ['Auto', 'Mid School', 'High School', 'College', 'Graduate', 'Mensa'];
        const allDiffVisible =
          diffAudit.stripVisible &&
          diffAudit.btns.length === 6 &&
          diffAudit.btns.every((b, idx) => b.visible && b.text === expectedDiffs[idx] && !b.clipped && b.right <= vp.width + 1);
        check(
          `State2A@${vp.id}:5-academic-tiers-fit`,
          allDiffVisible && diffAudit.stripOverflowPx === 0,
          `stripVisible=${diffAudit.stripVisible}, overflowPx=${diffAudit.stripOverflowPx}, btns=${JSON.stringify(diffAudit.btns.map((b) => `${b.text}:${b.visible ? `${b.clientW}/${b.scrollW}` : 'HIDDEN'}`))}`,
          'P0',
        );

        const pickerAudit = await driver.evalFn(auditPresentationInPage, `TopicPicker_${vp.id}`);
        recordAudit(pickerAudit, `TopicPicker`);

        // Verify <- Back returns cleanly to Start Screen
        await driver.realClick('#ws-cat-back-btn');
        await sleep(220);
        const backToStart = await driver.evalFn(() => Boolean(document.querySelector('.ws-title-showcase') && !document.querySelector('.ws-briefing-modal')));
        check(`State2A@${vp.id}:back-returns-to-start`, backToStart, `returnedToStart=${backToStart}`, 'P0');
      }
    }

    // ========================================================================
    // PART B: FULL 6-STATE TORTURE TEST + HOLISTIC PRESENTATION ON 390x844
    // ========================================================================
    console.log('\n=== PART B: 6-STATE MENU & CONTINUE TORTURE TEST (390x844 MOBILE) ===');
    const mobileVp = VIEWPORTS.find((v) => v.id === '390x844');
    await driver.setViewport(mobileVp);
    await driver.navigate(baseUrl, true);
    await waitForAppBoot(driver);

    // --- STATE 2A: Pick a Topic -> Close with X -> Reopen -> Mid School 5-Q Round ---
    console.log('\n--- State 2A: Pick a Topic (X Close + Mid School 5-Q Round + Reveal Bar + Summary) ---');
    await driver.realClick('[data-title-mode="BRIEFING"]');
    await driver.waitFor('.ws-briefing-modal');
    await driver.realClick('#ws-cat-close-btn');
    await sleep(200);
    const closedToStart = await driver.evalFn(() => Boolean(document.querySelector('.ws-title-showcase') && !document.querySelector('.ws-briefing-modal')));
    check('State2A:close-x-returns-to-start', closedToStart, `closedToStart=${closedToStart}`, 'P0');

    await driver.realClick('[data-title-mode="BRIEFING"]');
    await driver.waitFor('[data-diff="MIDDLE_SCHOOL"]');
    await driver.realClick('[data-diff="MIDDLE_SCHOOL"]');
    await sleep(120);
    await driver.realClick('[data-len="5"]');
    await sleep(120);
    await driver.realClick('#ws-cat-launch');
    await driver.waitFor('.ws-broadcast-dock', 10000);
    await sleep(500);

    const midSchoolBadges = [];
    for (let qIdx = 0; qIdx < 5; qIdx++) {
      const qInfo = await driver.evalFn(() => {
        const badge = document.querySelector('#ws-question-difficulty-badge');
        const prompt = document.querySelector('.ws-question-prompt');
        const chyronSub = document.querySelector('.ws-chyron-sub');
        return {
          badge: badge ? (badge.textContent || '').trim() : null,
          prompt: prompt ? (prompt.textContent || '').trim().slice(0, 90) : '',
          chyronSub: chyronSub ? (chyronSub.textContent || '').trim() : '',
        };
      });
      midSchoolBadges.push(qInfo.badge);

      if (qIdx === 0) {
        await driver.screenshot('03_gameplay_midschool_390x844.png');
        results.screenshots.push('03_gameplay_midschool_390x844.png');
        const liveAudit = await driver.evalFn(auditPresentationInPage, 'LiveGameplay_MidSchool_390x844');
        recordAudit(liveAudit, 'LiveGameplay_MidSchool');
      }

      await lockCurrentQuestionByRealClick(driver);
      await sleep(250);

      if (qIdx === 0) {
        // Test Reveal Bar: Difficulty Badge + 👍 / ⚑ buttons!
        const revInfo = await driver.evalFn(() => ({
          badge: document.querySelector('#ws-question-difficulty-badge')?.textContent?.trim() || null,
          hasUpvote: Boolean(document.querySelector('#ws-btn-q-upvote')),
          hasFlag: Boolean(document.querySelector('#ws-btn-q-flag')),
          hasBookmark: Boolean(document.querySelector('#ws-btn-bookmark')),
          hasNext: Boolean(document.querySelector('#ws-btn-next-q')),
        }));
        check(
          'State2A:reveal-bar-badge-and-feedback',
          revInfo.badge === 'MIDDLE SCHOOL' && revInfo.hasUpvote && revInfo.hasFlag && revInfo.hasNext,
          JSON.stringify(revInfo),
          'P0',
        );
        await driver.realClick('#ws-btn-q-upvote');
        await sleep(160);
        const upvoted = await driver.evalFn(() => Boolean(document.querySelector('#ws-btn-q-upvote.is-upvoted')));
        check('State2A:reveal-upvote-toggles', upvoted, `is-upvoted=${upvoted}`, 'P1');

        await driver.screenshot('04_reveal_bar_390x844.png');
        results.screenshots.push('04_reveal_bar_390x844.png');
        const revAudit = await driver.evalFn(auditPresentationInPage, 'RevealBar_390x844');
        recordAudit(revAudit, 'RevealBar');
      }

      await driver.realClick('#ws-btn-next-q');
      await sleep(420);
    }

    check(
      'State2A:midschool-all-5-badges',
      midSchoolBadges.length === 5 && midSchoolBadges.every((b) => b === 'MIDDLE SCHOOL'),
      `badges=${JSON.stringify(midSchoolBadges)}`,
      'P0',
    );

    const summaryReached = await driver.waitFor('#ws-summary-continue', 6000);
    check('State2A:match-summary-reached', summaryReached, `summaryReached=${summaryReached}`, 'P0');
    if (summaryReached) {
      await sleep(250);
      await driver.screenshot('05_match_summary_390x844.png');
      results.screenshots.push('05_match_summary_390x844.png');
      const sumAudit = await driver.evalFn(auditPresentationInPage, 'MatchSummary_390x844');
      recordAudit(sumAudit, 'MatchSummary');
      // Return to Title via Vault -> Start Screen
      await driver.realClick('#ws-util-vault');
      await driver.waitFor('#ws-util-title');
      await driver.realClick('#ws-util-title');
      await driver.waitFor('#ws-title-enter-cta');
    }

    // --- STATE 2B: Daily 10 in 1 Click ---
    console.log('\n--- State 2B: Daily 10 in 1 Click ---');
    await driver.realClick('[data-title-mode="DAILY"]');
    const dailyLive = await driver.waitFor('.ws-broadcast-dock', 6000);
    const dailyInfo = await driver.evalFn(() => ({
      chyronTitle: document.querySelector('.ws-chyron-title')?.textContent?.trim() || '',
      chyronSub: document.querySelector('.ws-chyron-sub')?.textContent?.trim() || '',
      hasPrompt: Boolean(document.querySelector('.ws-question-prompt')),
    }));
    check(
      'State2B:daily10-1-click-launch',
      dailyLive && dailyInfo.hasPrompt && /Q1\/10/i.test(dailyInfo.chyronSub),
      JSON.stringify(dailyInfo),
      'P0',
    );
    // Test Leave-Match confirmation modal (also exercises part of State 6!)
    await driver.realClick('#ws-topbar-back');
    const leaveModalOpen = await driver.waitFor('#ws-leave-confirm-hub', 3000);
    check('State6:leave-match-modal-opens', leaveModalOpen, `leaveModalOpen=${leaveModalOpen}`, 'P0');
    if (leaveModalOpen) {
      await driver.realClick('#ws-leave-resume-btn');
      await sleep(180);
      const stillInMatch = await driver.evalFn(() => Boolean(document.querySelector('.ws-broadcast-dock') && !document.querySelector('#ws-leave-confirm-hub')));
      check('State6:leave-match-resume-works', stillInMatch, `stillInMatch=${stillInMatch}`, 'P0');
      await driver.realClick('#ws-topbar-back');
      await driver.waitFor('#ws-leave-confirm-hub', 3000);
      await driver.realClick('#ws-leave-confirm-hub');
      await driver.waitFor('.ws-mode-tabs', 4000);
      // Go back to Start Screen via topbar <-
      await driver.realClick('#ws-topbar-back');
      await driver.waitFor('#ws-title-enter-cta', 4000);
    }

    // --- STATE 2C: Quick 1-Q (#ws-btn-instant-prism) < 150ms ---
    console.log('\n--- State 2C: Quick 1-Q (#ws-btn-instant-prism) Latency < 150ms ---');
    // Install an in-page high-res timer observer right before firing the real CDP click!
    await driver.eval(`(() => {
      window.__wsInstantMetrics = { clickAt: 0, dockAt: 0, deltaMs: -1 };
      const btn = document.querySelector('#ws-btn-instant-prism');
      if (btn) {
        btn.addEventListener('click', () => { window.__wsInstantMetrics.clickAt = performance.now(); }, { capture: true, once: true });
      }
      const mo = new MutationObserver(() => {
        if (document.querySelector('.ws-broadcast-dock .ws-question-prompt') && window.__wsInstantMetrics.clickAt > 0 && window.__wsInstantMetrics.dockAt === 0) {
          window.__wsInstantMetrics.dockAt = performance.now();
          window.__wsInstantMetrics.deltaMs = Number((window.__wsInstantMetrics.dockAt - window.__wsInstantMetrics.clickAt).toFixed(2));
          mo.disconnect();
        }
      });
      mo.observe(document.getElementById('ui-root'), { childList: true, subtree: true });
    })()`);
    await driver.realClick('#ws-btn-instant-prism');
    const instantDocked = await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 3000);
    const instantDelta = await driver.eval('window.__wsInstantMetrics?.deltaMs ?? -1');
    results.metrics.instantPrismDeltaMs = instantDelta;
    check(
      'State2C:quick-1q-under-150ms',
      instantDocked && instantDelta >= 0 && instantDelta < 150,
      `docked=${instantDocked}, inPageLatencyMs=${instantDelta}ms (target < 150ms)`,
      'P0',
    );
    if (instantDocked) {
      await lockCurrentQuestionByRealClick(driver);
      const instantBar = await driver.waitFor('#ws-instant-prism-next-bar', 3000);
      check('State2C:quick-1q-reveal-next-bar', instantBar, `nextBar=${instantBar}`, 'P1');
    }

    // --- STATE 3: Mid-Geneva Reload (EXACT USER BUG!) ---
    console.log('\n--- State 3: Mid-Geneva Reload Torture Test (Exact User Bug!) ---');
    await driver.navigate(baseUrl, true);
    await waitForAppBoot(driver);

    // 1. Click Start Story Campaign
    await driver.realClick('#ws-title-enter-cta');
    const cutsceneVisible = await driver.waitFor('#ws-mc-skip, #ws-mc-next', 6000);
    check('State3:act0-cutscene-starts', cutsceneVisible, `cutsceneVisible=${cutsceneVisible}`, 'P0');
    if (cutsceneVisible) {
      // Wait for summons cold-open -> Beat 1 portrait + subtitle
      await sleep(2300);
      await driver.screenshot('06_story_cutscene_390x844.png');
      results.screenshots.push('06_story_cutscene_390x844.png');
      const cutsceneMetrics = await driver.evalFn(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const portrait = document.querySelector('#ws-mc-portrait-wrap');
        const text = document.querySelector('#ws-mc-text');
        const pr = portrait ? portrait.getBoundingClientRect() : null;
        const tr = text ? text.getBoundingClientRect() : null;
        return {
          portraitRect: pr ? { l: Math.round(pr.left), t: Math.round(pr.top), w: Math.round(pr.width), h: Math.round(pr.height), inView: pr.left >= 0 && pr.right <= vw && pr.top >= 0 && pr.bottom <= vh } : null,
          subtitleRect: tr ? { t: Math.round(tr.top), b: Math.round(tr.bottom), h: Math.round(tr.height), scrollH: Math.round(text.scrollHeight), clippedY: text.scrollHeight > text.clientHeight + 4 } : null,
          subtitleText: text ? (text.textContent || '').trim().slice(0, 90) : '',
        };
      });
      results.metrics.storyCutscene = cutsceneMetrics;
      check(
        'Presentation:cutscene-portrait-and-subtitles',
        Boolean(cutsceneMetrics.portraitRect?.inView && cutsceneMetrics.subtitleRect && !cutsceneMetrics.subtitleRect.clippedY),
        JSON.stringify(cutsceneMetrics),
        'P1',
      );
      const cutAudit = await driver.evalFn(auditPresentationInPage, 'StoryCutscene_390x844');
      recordAudit(cutAudit, 'StoryCutscene');

      await driver.realClick('#ws-mc-skip');
      await sleep(400);
    }

    // Advance past CHAMBER_OPENING story beat if present before Identity Registration
    if (await driver.waitFor('#ws-story-continue', 3000)) {
      await driver.realClick('#ws-story-continue');
      await sleep(300);
    }

    // 2. Enter Challenger Name -> Begin Vetting
    const regVisible = await driver.waitFor('#challenger-name-input', 6000);
    check('State3:registration-screen-reached', regVisible, `regVisible=${regVisible}`, 'P0');
    await driver.typeInto('#challenger-name-input', 'Elena Vance');
    await driver.realClick('#ws-begin-vetting');

    // 3. Complete Geneva Q1 (Red Cross)
    const q1Visible = await driver.waitFor('.ws-broadcast-dock .ws-question-prompt', 6000);
    check('State3:geneva-q1-reached', q1Visible, `q1Visible=${q1Visible}`, 'P0');
    await lockCurrentQuestionByRealClick(driver, 'Red Cross');
    await driver.realClick('#ws-btn-next-q');

    // Should now be on MIRROR_LEAK_CHOICE Story Dialogue!
    const mirrorVisible = await driver.waitFor('[data-story-choice^="MIRROR:"]', 6000);
    check('State3:mirror-leak-dialogue-reached', mirrorVisible, `mirrorVisible=${mirrorVisible}`, 'P0');
    if (mirrorVisible) {
      await sleep(350);
      await driver.screenshot('07_story_dialogue_390x844.png');
      results.screenshots.push('07_story_dialogue_390x844.png');
      const dlgAudit = await driver.evalFn(auditPresentationInPage, 'StoryDialogue_390x844');
      recordAudit(dlgAudit, 'StoryDialogue');
    }

    // 4. RELOAD PAGE!
    await driver.reload();
    await waitForAppBoot(driver);

    await driver.screenshot('08_state3_mid_geneva_start_390x844.png');
    results.screenshots.push('08_state3_mid_geneva_start_390x844.png');
    const s3StartCta = await driver.evalFn(() => (document.querySelector('#ws-title-enter-cta')?.textContent || '').trim().replace(/\s+/g, ' '));
    check(
      'State3:reload-cta-says-continue-geneva',
      /CONTINUE/i.test(s3StartCta) && /GENEVA/i.test(s3StartCta),
      `CTA="${s3StartCta}"`,
      'P0',
    );

    // 5. Click Continue CTA -> MUST resume Geneva directly (NEVER Hub, NEVER Q1/Registration!)
    await driver.realClick('#ws-title-enter-cta');
    await sleep(600);
    const s3ResumeState = await driver.evalFn(() => ({
      onHub: Boolean(document.querySelector('.ws-cities-grid')),
      onReg: Boolean(document.querySelector('#challenger-name-input')),
      onMirrorChoice: Boolean(document.querySelector('[data-story-choice^="MIRROR:"]')),
      onGameplay: Boolean(document.querySelector('.ws-broadcast-dock')),
      chyron: document.querySelector('.ws-chyron')?.textContent?.trim().replace(/\s+/g, ' ') || '',
    }));
    check(
      'State3:continue-1-click-resumes-geneva-directly',
      !s3ResumeState.onHub && !s3ResumeState.onReg && (s3ResumeState.onMirrorChoice || (s3ResumeState.onGameplay && !/Q1\/4/.test(s3ResumeState.chyron))),
      JSON.stringify(s3ResumeState),
      'P0',
    );

    // 6. Reload -> Open Campaign Map -> Verify Continue Banner ABOVE 8 cities + Geneva active pill + clicking 1. GENEVA card launches Geneva immediately!
    await driver.reload();
    await waitForAppBoot(driver);
    await driver.realClick('[data-title-mode="CAMPAIGN"]');
    await driver.waitFor('.ws-cities-grid', 6000);
    await sleep(350);

    await driver.screenshot('09_state3_mid_geneva_map_390x844.png');
    results.screenshots.push('09_state3_mid_geneva_map_390x844.png');
    const s3MapMetrics = await driver.evalFn(() => {
      const banner = document.querySelector('#ws-hub-continue-banner');
      const grid = document.querySelector('.ws-cities-grid');
      const chCard = document.querySelector('[data-city-hub="ch"]');
      const chPill = chCard ? chCard.querySelector('.ws-city-active-pill') : null;
      return {
        bannerVisible: Boolean(banner && banner.getBoundingClientRect().height > 20),
        bannerBottom: banner ? Math.round(banner.getBoundingClientRect().bottom) : -1,
        gridTop: grid ? Math.round(grid.getBoundingClientRect().top) : -1,
        bannerAboveGrid: Boolean(banner && grid && banner.getBoundingClientRect().bottom <= grid.getBoundingClientRect().top + 4),
        chHasActivePill: Boolean(chPill && chPill.getBoundingClientRect().height > 10),
        chPillText: chPill ? (chPill.textContent || '').trim() : '',
      };
    });
    check(
      'State3:map-continue-banner-above-cities',
      s3MapMetrics.bannerVisible && s3MapMetrics.bannerAboveGrid,
      JSON.stringify(s3MapMetrics),
      'P0',
    );
    check(
      'State3:map-geneva-has-active-pill',
      s3MapMetrics.chHasActivePill,
      `pill="${s3MapMetrics.chPillText}"`,
      'P0',
    );

    const s3MapAudit = await driver.evalFn(auditPresentationInPage, 'CampaignMap_State3_390x844');
    recordAudit(s3MapAudit, 'CampaignMap_State3');

    // Click 1. GENEVA card directly -> MUST launch Geneva Vetting immediately (NEVER dead no-op!)
    await driver.realClick('[data-city-hub="ch"]');
    await sleep(600);
    const s3CardClickResult = await driver.evalFn(() => ({
      stillOnHub: Boolean(document.querySelector('.ws-cities-grid')),
      onMirrorChoice: Boolean(document.querySelector('[data-story-choice^="MIRROR:"]')),
      onGameplay: Boolean(document.querySelector('.ws-broadcast-dock')),
      chyron: document.querySelector('.ws-chyron')?.textContent?.trim().replace(/\s+/g, ' ') || '',
    }));
    check(
      'State3:clicking-geneva-card-launches-vetting',
      !s3CardClickResult.stillOnHub && (s3CardClickResult.onMirrorChoice || s3CardClickResult.onGameplay),
      JSON.stringify(s3CardClickResult),
      'P0',
    );

    // --- STATE 4: Act I Flight Fork Reload ---
    console.log('\n--- State 4: Advance Geneva -> Act I Flight Fork Reload ---');
    // Finish Geneva Q2 -> Manifesto -> Q3 -> Q4 -> Passport Stamp -> Flight Fork using REAL CLICKS!
    if (s3CardClickResult.onMirrorChoice) {
      await driver.realClick('[data-story-choice="MIRROR:SOLVE_CLEAN"]');
      await driver.waitFor('.ws-broadcast-dock', 6000);
    }
    // Q2: Rosetta Stone
    await lockCurrentQuestionByRealClick(driver, 'Rosetta');
    await driver.realClick('#ws-btn-next-q');
    // Manifesto choice
    if (await driver.waitFor('[data-story-choice^="MANIFESTO:"]', 5000)) {
      await driver.realClick('[data-story-choice="MANIFESTO:MANIFESTO_PUBLIC"]');
      await driver.waitFor('.ws-broadcast-dock', 6000);
    }
    // Q3: Mercury
    await lockCurrentQuestionByRealClick(driver, 'Mercury');
    await driver.realClick('#ws-btn-next-q');
    await driver.waitFor('.ws-broadcast-dock', 6000);
    // Q4: Calibrator (1969)
    await lockCurrentQuestionByRealClick(driver);
    await driver.realClick('#ws-btn-next-q');
    // Passport Stamp Payoff -> UNLOCK WORLD GLOBE
    const stampVisible = await driver.waitFor('#ws-story-continue', 6000);
    check('State4:passport-stamp-payoff-reached', stampVisible, `stampVisible=${stampVisible}`, 'P0');
    if (stampVisible) {
      await driver.realClick('#ws-story-continue');
    }
    const forkReached = await driver.waitFor('[data-story-choice="FORK:GB"]', 6000);
    check('State4:flight-fork-reached', forkReached, `forkReached=${forkReached}`, 'P0');
    if (forkReached) {
      await sleep(300);
      await driver.screenshot('10_state4_flight_fork_390x844.png');
      results.screenshots.push('10_state4_flight_fork_390x844.png');
    }

    // RELOAD at Flight Fork!
    await driver.reload();
    await waitForAppBoot(driver);
    const s4Cta = await driver.evalFn(() => (document.querySelector('#ws-title-enter-cta')?.textContent || '').trim().replace(/\s+/g, ' '));
    check(
      'State4:reload-cta-mentions-flight-fork',
      /CONTINUE/i.test(s4Cta) && (/LONDON/i.test(s4Cta) || /TOKYO/i.test(s4Cta) || /FLIGHT/i.test(s4Cta)),
      `CTA="${s4Cta}"`,
      'P0',
    );
    await driver.realClick('#ws-title-enter-cta');
    const forkOpenedIn1Click = await driver.waitFor('[data-story-choice="FORK:GB"]', 5000);
    check('State4:continue-opens-flight-fork-1-click', forkOpenedIn1Click, `forkOpenedIn1Click=${forkOpenedIn1Click}`, 'P0');

    // Reload -> Campaign Map -> Click 2. LONDON card -> launches London Mission 1!
    await driver.reload();
    await waitForAppBoot(driver);
    await openCampaignMapFromTitle(driver);
    await driver.realClick('[data-city-hub="gb"]');
    await driver.waitUntil(
      () => Boolean(document.querySelector('#ws-mc-skip, #ws-mc-next, #ws-story-continue, [data-story-choice], .ws-broadcast-dock')) || !document.querySelector('.ws-cities-grid'),
      4000,
    );
    const s4LondonLaunch = await driver.evalFn(() => ({
      stillOnHub: Boolean(document.querySelector('.ws-cities-grid')),
      onCutscene: Boolean(document.querySelector('#ws-mc-skip, #ws-mc-next')),
      onDialogue: Boolean(document.querySelector('#ws-story-continue, [data-story-choice]')),
      onGameplay: Boolean(document.querySelector('.ws-broadcast-dock')),
      chyron: document.querySelector('.ws-chyron')?.textContent?.trim().replace(/\s+/g, ' ') || '',
    }));
    check(
      'State4:map-click-london-launches-m1',
      s4LondonLaunch.onCutscene || (!s4LondonLaunch.stillOnHub && (s4LondonLaunch.onDialogue || s4LondonLaunch.onGameplay)),
      JSON.stringify(s4LondonLaunch),
      'P0',
    );

    // --- STATE 5: Mid-City World Circuit Resume (gb_1 done, gb_2 next) ---
    console.log('\n--- State 5: Mid-City World Circuit Resume (gb_1 done -> gb_2 next) ---');
    // Persist gb_1 completed + gb_2 next into the active persisted save slot & blackboard, then cold RELOAD!
    await driver.evalFn(() => {
      const slotId = localStorage.getItem('ws_active_campaign_slot') || '1';
      const slotKey = `ws_campaign_slot_${slotId}`;
      const rawSlot = localStorage.getItem(slotKey);
      if (rawSlot) {
        const rec = JSON.parse(rawSlot);
        const bb = rec.payload.blackboard;
        bb.prologueComplete = true;
        bb.firstFlight = 'GB';
        bb.completedMissions = Array.from(new Set([...(bb.completedMissions || []), 'ch_1', 'ch_2', 'ch_3', 'ch_4', 'gb_1']));
        bb.currentMissionId = 'gb_2';
        rec.meta.currentMissionId = 'gb_2';
        rec.meta.currentCity = 'London';
        rec.meta.completedMissionsCount = bb.completedMissions.length;
        localStorage.setItem(slotKey, JSON.stringify(rec));
      }
      const rawBb = localStorage.getItem('ws_ink_blackboard_v2');
      if (rawBb) {
        const bb = JSON.parse(rawBb);
        bb.prologueComplete = true;
        bb.firstFlight = 'GB';
        bb.completedMissions = Array.from(new Set([...(bb.completedMissions || []), 'ch_1', 'ch_2', 'ch_3', 'ch_4', 'gb_1']));
        bb.currentMissionId = 'gb_2';
        localStorage.setItem('ws_ink_blackboard_v2', JSON.stringify(bb));
      }
    });

    await driver.reload();
    await waitForAppBoot(driver);

    await driver.screenshot('11_state5_london_m2_start_390x844.png');
    results.screenshots.push('11_state5_london_m2_start_390x844.png');
    const s5Cta = await driver.evalFn(() => (document.querySelector('#ws-title-enter-cta')?.textContent || '').trim().replace(/\s+/g, ' '));
    check(
      'State5:reload-cta-names-london-m2',
      /CONTINUE/i.test(s5Cta) && /LONDON/i.test(s5Cta) && /M2|2/i.test(s5Cta),
      `CTA="${s5Cta}"`,
      'P0',
    );

    // 5A: 1 click on Start Screen CTA launches gb_2 directly!
    const tS5Click = Date.now();
    await driver.realClick('#ws-title-enter-cta');
    const s5Transitioned = await driver.waitUntil(
      () => !document.querySelector('.ws-title-showcase') && Boolean(document.querySelector('#ws-mc-skip, #ws-story-continue, [data-story-choice], .ws-broadcast-dock')),
      3500,
    );
    const s5ClickLatencyMs = Date.now() - tS5Click;
    const s5TitleLaunch = await driver.evalFn(() => ({
      stillOnTitle: Boolean(document.querySelector('.ws-title-showcase')),
      onHub: Boolean(document.querySelector('.ws-cities-grid')),
      onStage: Boolean(document.querySelector('#ws-mc-skip, #ws-story-continue, [data-story-choice], .ws-broadcast-dock')),
      chyron: document.querySelector('.ws-chyron')?.textContent?.trim().replace(/\s+/g, ' ') || '',
      bodySnippet: (document.querySelector('#ui-root')?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 140),
    }));
    check(
      'State5:start-cta-1-click-launches-gb2',
      s5Transitioned && !s5TitleLaunch.stillOnTitle && !s5TitleLaunch.onHub && s5TitleLaunch.onStage && /LONDON|GLASS FLOOR|M2/i.test(s5TitleLaunch.chyron + ' ' + s5TitleLaunch.bodySnippet),
      `latencyMs=${s5ClickLatencyMs} ${JSON.stringify(s5TitleLaunch)}`,
      'P0',
    );

    // 5B: Reload -> Open Campaign Map -> Verify 2. LONDON auto-selected (NOT stuck on Geneva!)
    await driver.reload();
    await waitForAppBoot(driver);
    await driver.realClick('[data-title-mode="CAMPAIGN"]');
    await driver.waitFor('.ws-cities-grid', 6000);
    await sleep(350);

    await driver.screenshot('12_state5_london_m2_map_390x844.png');
    results.screenshots.push('12_state5_london_m2_map_390x844.png');
    const s5MapState = await driver.evalFn(() => {
      const gb = document.querySelector('[data-city-hub="gb"]');
      const ch = document.querySelector('[data-city-hub="ch"]');
      const panelHead = document.querySelector('#ws-hub-missions-panel')?.textContent?.slice(0, 120) || '';
      return {
        gbSelected: Boolean(gb?.classList.contains('is-selected')),
        gbActiveResume: Boolean(gb?.classList.contains('is-active-resume') && gb?.querySelector('.ws-city-active-pill')),
        chSelected: Boolean(ch?.classList.contains('is-selected')),
        panelHead: panelHead.trim().replace(/\s+/g, ' '),
      };
    });
    check(
      'State5:map-auto-selects-london',
      s5MapState.gbSelected && s5MapState.gbActiveResume && !s5MapState.chSelected && /LONDON/i.test(s5MapState.panelHead),
      JSON.stringify(s5MapState),
      'P0',
    );

    // Test #ws-hub-continue-now launches gb_2 in 1 click!
    await driver.realClick('#ws-hub-continue-now');
    await sleep(650);
    const s5HubContinue = await driver.evalFn(() => ({
      leftHub: !document.querySelector('.ws-cities-grid'),
      onStage: Boolean(document.querySelector('#ws-mc-skip, #ws-story-continue, [data-story-choice], .ws-broadcast-dock')),
      chyron: document.querySelector('.ws-chyron')?.textContent?.trim().replace(/\s+/g, ' ') || '',
    }));
    check('State5:hub-continue-now-launches-gb2', s5HubContinue.leftHub && s5HubContinue.onStage, JSON.stringify(s5HubContinue), 'P0');

    // 5C: Reload -> Campaign Map -> Clicking 2. LONDON card launches gb_2 immediately!
    await driver.reload();
    await waitForAppBoot(driver);
    await openCampaignMapFromTitle(driver);
    await driver.realClick('[data-city-hub="gb"]');
    await driver.waitUntil(() => !document.querySelector('.ws-cities-grid'), 4000);
    const s5LondonCardLaunch = await driver.evalFn(() => ({
      leftHub: !document.querySelector('.ws-cities-grid'),
      onStage: Boolean(document.querySelector('#ws-mc-skip, #ws-story-continue, [data-story-choice], .ws-broadcast-dock')),
      chyron: document.querySelector('.ws-chyron')?.textContent?.trim().replace(/\s+/g, ' ') || '',
    }));
    check('State5:clicking-london-card-launches-gb2', s5LondonCardLaunch.leftHub && s5LondonCardLaunch.onStage, JSON.stringify(s5LondonCardLaunch), 'P0');

    // 5D: Reload -> Campaign Map -> Click 1. GENEVA -> switches city & scrolls #ws-hub-missions-panel into view with #ws-hub-play-next-in-city visible!
    await driver.reload();
    await waitForAppBoot(driver);
    await openCampaignMapFromTitle(driver);
    await driver.realClick('[data-city-hub="ch"]');
    await sleep(550);
    const s5GenevaSwitch = await driver.evalFn(() => {
      const vh = window.innerHeight;
      const ch = document.querySelector('[data-city-hub="ch"]');
      const panel = document.querySelector('#ws-hub-missions-panel');
      const playNext = document.querySelector('#ws-hub-play-next-in-city');
      const pr = panel ? panel.getBoundingClientRect() : null;
      const btr = playNext ? playNext.getBoundingClientRect() : null;
      return {
        chSelected: Boolean(ch?.classList.contains('is-selected')),
        panelVisibleInViewport: Boolean(pr && pr.top < vh - 20 && pr.bottom > 40),
        panelTop: pr ? Math.round(pr.top) : -1,
        playNextVisible: Boolean(btr && btr.width > 40 && btr.height > 24 && btr.top < vh && btr.bottom > 0),
        playNextText: playNext ? (playNext.textContent || '').trim() : '',
      };
    });
    check(
      'State5:click-geneva-switches-and-scrolls-missions-panel',
      s5GenevaSwitch.chSelected && s5GenevaSwitch.panelVisibleInViewport && s5GenevaSwitch.playNextVisible,
      JSON.stringify(s5GenevaSwitch),
      'P0',
    );

    // 5E: Click LOCKED city (4. RIO) -> renders #ws-hub-lock-notice visibly INSIDE viewport with unlock instructions + play-current CTA!
    await driver.realClick('[data-city-hub="br"]');
    await sleep(450);
    const s5LockNotice = await driver.evalFn(() => {
      const vh = window.innerHeight;
      const notice = document.querySelector('#ws-hub-lock-notice');
      const cta = document.querySelector('#ws-hub-lock-play-current');
      const r = notice ? notice.getBoundingClientRect() : null;
      const tabs = Array.from(document.querySelectorAll('.ws-mode-tabs .ws-mode-tab')).map((b) => {
        const br = b.getBoundingClientRect();
        return { text: (b.textContent || '').trim(), right: Math.round(br.right), vw: window.innerWidth, clipped: br.right > window.innerWidth + 1 || b.scrollWidth > b.clientWidth + 2 };
      });
      return {
        visible: Boolean(notice && r && r.height > 20),
        inViewport: Boolean(r && r.top >= 0 && r.bottom <= vh + 2),
        top: r ? Math.round(r.top) : -999,
        text: notice ? (notice.textContent || '').trim().replace(/\s+/g, ' ') : '',
        hasPlayCurrentCta: Boolean(cta && cta.getBoundingClientRect().height > 20),
        hubTabsClipped: tabs.filter((t) => t.clipped),
      };
    });
    check(
      'State5:locked-rio-renders-notice-and-cta',
      s5LockNotice.visible && s5LockNotice.inViewport && s5LockNotice.hasPlayCurrentCta && /Rio/i.test(s5LockNotice.text),
      JSON.stringify(s5LockNotice),
      'P0',
    );
    check(
      'Presentation:hub-mode-tabs-no-right-clip',
      s5LockNotice.hubTabsClipped.length === 0,
      `clippedTabs=${JSON.stringify(s5LockNotice.hubTabsClipped)}`,
      'P1',
    );
    await driver.screenshot('13_state5_locked_rio_notice_390x844.png');
    results.screenshots.push('13_state5_locked_rio_notice_390x844.png');

    await driver.realClick('#ws-hub-lock-play-current');
    await sleep(650);
    const s5LockPlay = await driver.evalFn(() => !document.querySelector('.ws-cities-grid'));
    check('State5:lock-notice-play-current-launches-gb2', s5LockPlay, `leftHub=${s5LockPlay}`, 'P0');

    // --- STATE 6 + HOLISTIC PRESENTATION: Vault Drawer (Honours 84/44, Atelier 16, Saves) + Visual Blueprint SVG + Globe Pin-Drop ---
    console.log('\n--- State 6 & Visual Showcase: Honours (84/44), Atelier (16), Saves, Visual Blueprint SVG, Globe Pin-Drop ---');
    await driver.reload();
    await waitForAppBoot(driver);

    // 6A: Vault -> Honours (84 Trophies / 44 Unlockables)
    await driver.realClick('#ws-util-vault');
    await driver.waitFor('#ws-util-trophies', 3000);
    const vaultLabels = await driver.evalFn(() => ({
      trophiesItem: document.querySelector('#ws-vault-trophies-title')?.textContent?.trim() || '',
      atelierSub: document.querySelector('#ws-vault-atelier-sub')?.textContent?.trim() || '',
    }));
    check(
      'State6:vault-drawer-84-honours-16-finishes',
      /84/.test(vaultLabels.trophiesItem) && /16/.test(vaultLabels.atelierSub),
      JSON.stringify(vaultLabels),
      'P0',
    );
    await driver.realClick('#ws-util-trophies');
    await driver.waitFor('.ws-meta-shell', 4000);
    await sleep(300);
    const honoursMetrics = await driver.evalFn(() => {
      const shell = document.querySelector('.ws-meta-shell');
      const text = shell ? shell.textContent || '' : '';
      const tabs = Array.from(document.querySelectorAll('[data-honours-tab]')).map((b) => (b.textContent || '').trim());
      return { textHead: text.trim().replace(/\s+/g, ' ').slice(0, 140), tabs };
    });
    check(
      'State6:honours-shows-84-trophies-44-unlockables',
      honoursMetrics.tabs.some((t) => /84/.test(t)) && honoursMetrics.tabs.some((t) => /44/.test(t)),
      JSON.stringify(honoursMetrics),
      'P0',
    );
    await driver.screenshot('14_honours_84_390x844.png');
    results.screenshots.push('14_honours_84_390x844.png');
    const honoursAudit = await driver.evalFn(auditPresentationInPage, 'Honours_84_390x844');
    recordAudit(honoursAudit, 'Honours_84');
    await driver.realClick('#ws-honours-back, #ws-honours-close, [data-meta-back="true"]');
    await sleep(250);

    // 6B: Vault -> Atelier (16 Finishes)
    await driver.realClick('#ws-util-vault');
    await driver.waitFor('#ws-util-atelier', 3000);
    await driver.realClick('#ws-util-atelier');
    await driver.waitFor('.ws-meta-shell, .ws-meta-sheet', 4000);
    await sleep(350);
    const atelierMetrics = await driver.evalFn(() => {
      const txt = (document.querySelector('.ws-meta-backdrop')?.textContent || '').trim().replace(/\s+/g, ' ');
      const finishCards = document.querySelectorAll('[data-finish-id], .ws-atelier-card, .ws-atelier-finish-row').length;
      return { has16: /\b16\b/.test(txt), finishCards, snippet: txt.slice(0, 160) };
    });
    check(
      'State6:atelier-shows-16-finishes',
      atelierMetrics.has16 || atelierMetrics.finishCards >= 16,
      JSON.stringify(atelierMetrics),
      'P0',
    );
    await driver.screenshot('15_atelier_16_390x844.png');
    results.screenshots.push('15_atelier_16_390x844.png');
    await driver.realClick('[data-meta-back="true"], [id$="-close"], .ws-meta-close-btn, [aria-label="Close"]');
    await sleep(250);

    // 6C: Vault -> Saves (5 slots)
    await driver.realClick('#ws-util-vault');
    await driver.waitFor('#ws-util-saves', 3000);
    await driver.realClick('#ws-util-saves');
    await driver.waitFor('.ws-saves-sheet', 4000);
    await sleep(250);
    const savesMetrics = await driver.evalFn(() => ({
      slotsCount: document.querySelectorAll('[data-slot-id], .ws-save-slot-row, .ws-saves-slot').length,
      hasActiveName: /Elena Vance/i.test(document.querySelector('.ws-saves-sheet')?.textContent || ''),
      hasYearComma: /\b2,02\d\b/.test(document.querySelector('.ws-saves-sheet')?.textContent || ''),
    }));
    check(
      'State6:saves-sheet-clean',
      savesMetrics.hasActiveName && !savesMetrics.hasYearComma,
      JSON.stringify(savesMetrics),
      'P1',
    );
    await driver.realClick('#ws-saves-close-btn, .ws-saves-sheet .ws-sheet-icon-btn');
    await sleep(220);

    // 6D: Visual Blueprint (SVG) Showcase & 3D Globe Pin-Drop Showcase
    await driver.realClick('[data-title-mode="CAMPAIGN"]');
    await driver.waitFor('.ws-mode-tabs', 5000);
    await driver.realClick('[data-hub-tab="BRIEFING"]');
    await driver.waitFor('#ws-quick-visual-showcase', 4000);

    // Launch Visual Blueprint SVG
    await driver.realClick('#ws-quick-visual-showcase');
    const visualLoaded = await driver.waitFor('#ws-visual-plate-frame img', 6000);
    await sleep(450);
    const visualMetrics = await driver.evalFn(() => {
      const img = document.querySelector('#ws-visual-plate-frame img');
      return {
        exists: Boolean(img),
        src: img?.getAttribute('src') || '',
        complete: Boolean(img?.complete),
        naturalW: img?.naturalWidth || 0,
        naturalH: img?.naturalHeight || 0,
        facetCount: document.querySelectorAll('[data-facet-idx]').length,
      };
    });
    check(
      'Presentation:visual-blueprint-svg-loads',
      visualLoaded && visualMetrics.complete && visualMetrics.naturalW > 0 && /\.svg(\?|$)/i.test(visualMetrics.src),
      JSON.stringify(visualMetrics),
      'P0',
    );
    await driver.screenshot('16_visual_blueprint_svg_390x844.png');
    results.screenshots.push('16_visual_blueprint_svg_390x844.png');
    const visAudit = await driver.evalFn(auditPresentationInPage, 'VisualBlueprint_SVG_390x844');
    recordAudit(visAudit, 'VisualBlueprint_SVG');

    // Leave Visual match cleanly back to Hub -> Pick Topic
    await driver.realClick('#ws-topbar-back');
    if (await driver.waitFor('#ws-leave-confirm-hub', 2500)) {
      await driver.realClick('#ws-leave-confirm-hub');
    }
    await driver.waitFor('[data-hub-tab="BRIEFING"]', 4000);
    await driver.realClick('[data-hub-tab="BRIEFING"]');
    await driver.waitFor('#ws-quick-globe-showcase', 4000);

    // Launch 3D Globe Pin-Drop
    await driver.realClick('#ws-quick-globe-showcase');
    const globeLoaded = await driver.waitFor('#ws-globe-pin-controls', 6000);
    await sleep(450);
    if (globeLoaded) {
      await driver.realClick('[data-globe-anchor-idx="0"]');
      await sleep(220);
    }
    const globeMetrics = await driver.evalFn(() => ({
      hasControls: Boolean(document.querySelector('#ws-globe-pin-controls')),
      anchorCount: document.querySelectorAll('[data-globe-anchor-idx]').length,
      coordText: document.querySelector('#ws-globe-coord-val')?.textContent?.trim() || '',
      overclockEnabled: !document.querySelector('#ws-btn-overclock')?.disabled,
    }));
    check(
      'Presentation:globe-pin-drop-live',
      globeLoaded && globeMetrics.anchorCount >= 4 && globeMetrics.overclockEnabled,
      JSON.stringify(globeMetrics),
      'P0',
    );
    await driver.screenshot('17_globe_pin_drop_390x844.png');
    results.screenshots.push('17_globe_pin_drop_390x844.png');
    const globeAudit = await driver.evalFn(auditPresentationInPage, 'GlobePinDrop_390x844');
    recordAudit(globeAudit, 'GlobePinDrop');

    // Desktop Campaign Map screenshot (1280x800) with State 5 active progress!
    const desktopVp = VIEWPORTS.find((v) => v.id === '1280x800');
    await driver.setViewport(desktopVp);
    await driver.reload();
    await waitForAppBoot(driver);
    await driver.realClick('[data-title-mode="CAMPAIGN"]');
    await driver.waitFor('.ws-cities-grid', 6000);
    await sleep(350);
    await driver.screenshot('18_campaign_map_1280x800.png');
    results.screenshots.push('18_campaign_map_1280x800.png');
    const deskMapAudit = await driver.evalFn(auditPresentationInPage, 'CampaignMap_1280x800');
    recordAudit(deskMapAudit, 'CampaignMap_Desktop');

    // ========================================================================
    // RUNTIME ERROR GATE: 0 CONSOLE ERRORS, 0 PAGE EXCEPTIONS, 0 404/HTTP ERRORS
    // ========================================================================
    console.log('\n=== PART C: ZERO RUNTIME / CONSOLE / HTTP 404 ERRORS GATE ===');
    check('Runtime:zero-console-errors', driver.consoleErrors.length === 0, `count=${driver.consoleErrors.length} ${JSON.stringify(driver.consoleErrors.slice(0, 5))}`, 'P0');
    check('Runtime:zero-page-exceptions', driver.pageExceptions.length === 0, `count=${driver.pageExceptions.length} ${JSON.stringify(driver.pageExceptions.slice(0, 5))}`, 'P0');
    check('Runtime:zero-http-404-errors', driver.httpErrors.length === 0, `count=${driver.httpErrors.length} ${JSON.stringify(driver.httpErrors.slice(0, 5))}`, 'P0');
  } finally {
    await driver.close();
    server.close();
  }

  const reportPath = path.join(SCREENSHOT_DIR, 'audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log('\n====================================================================');
  console.log(`RT-V2-MENU-PRESENTATION SUMMARY: ${results.passed.length} PASS / ${results.failed.length} FAIL`);
  console.log(`Screenshots captured (${results.screenshots.length}): ${SCREENSHOT_DIR}`);
  console.log(`Report JSON: ${reportPath}`);
  console.log('====================================================================');
  if (results.failed.length > 0) {
    console.error('\nFAILURES:');
    for (const f of results.failed) {
      console.error(`  - [${f.severity}] ${f.id}: ${f.detail}`);
    }
    process.exitCode = 1;
  }
}

runAudit().catch((err) => {
  console.error('FATAL AUDIT CRASH:', err);
  process.exit(1);
});
