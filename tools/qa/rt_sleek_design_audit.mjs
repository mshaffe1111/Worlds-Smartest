#!/usr/bin/env node
/**
 * RT-SLEEK-DESIGN-CRITIC — Automated 2026 Mobile-First Sleek Visual,
 * Anti-Boxiness, Typography & Contrast Audit Harness (Headless Edge WebGL2 via CDP).
 *
 * Serves ./dist on an ephemeral 127.0.0.1:0 port (NEVER probes :8088).
 * Captures full-window screenshots across 390x844 Portrait and 1280x800 Desktop
 * and computes rigorous DOM computed-style metrics for every screen.
 *
 * Usage:
 *   node tools/qa/rt_sleek_design_audit.mjs --tag=baseline --out="C:/path/to/screenshots"
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), 'true'];
  })
);

const TAG = args.tag || 'audit';
const ONLY_FLOW = args.only || 'all';
const OUT_DIR =
  args.out ||
  path.join(
    os.homedir(),
    '.gemini',
    'antigravity',
    'brain',
    'd1c805d3-a21a-4bf8-8c6f-449131fb165e',
    'screenshots',
    TAG
  );

fs.mkdirSync(OUT_DIR, { recursive: true });

const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];
const BROWSER_BIN = EDGE_PATHS.find((p) => fs.existsSync(p));
if (!BROWSER_BIN) {
  console.error('FATAL: Could not find msedge.exe or chrome.exe');
  process.exit(1);
}

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
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.ktx2': 'image/ktx2',
};

function startStaticServer(dir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = path.join(dir, urlPath === '/' ? 'index.html' : urlPath);
      if (!filePath.startsWith(dir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(filePath).pipe(res);
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, port: addr.port, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.eventHandlers = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.addEventListener('open', () => resolve());
      this.ws.addEventListener('error', (e) => reject(e));
      this.ws.addEventListener('message', (ev) => {
        const msg = JSON.parse(String(ev.data));
        if (msg.id && this.pending.has(msg.id)) {
          const { res, rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(new Error(`CDP ${msg.error.code}: ${msg.error.message}`));
          else res(msg.result);
        } else if (msg.method) {
          const hs = this.eventHandlers.get(msg.method) || [];
          for (const h of hs) h(msg.params, msg.sessionId);
        }
      });
    });
  }

  on(method, fn) {
    if (!this.eventHandlers.has(method)) this.eventHandlers.set(method, []);
    this.eventHandlers.get(method).push(fn);
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify(payload));
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

function launchBrowser() {
  return new Promise((resolve, reject) => {
    const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-sleek-audit-'));
    const proc = spawn(
      BROWSER_BIN,
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
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    let stderr = '';
    const timer = setTimeout(() => {
      reject(new Error(`Browser launch timeout. stderr:\n${stderr}`));
    }, 20000);

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      const m = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) {
        clearTimeout(timer);
        resolve({ proc, wsUrl: m[1], profileDir });
      }
    });
    proc.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Browser exited early (${code}). stderr:\n${stderr}`));
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const IN_PAGE_AUDIT_FN = `
(function auditSleekDesign(screenName) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  function parseColor(str) {
    if (!str || str === 'transparent' || str === 'none') return { r: 0, g: 0, b: 0, a: 0 };
    const m = str.match(/rgba?\\(\\s*([\\d.]+)[,\\s]+([\\d.]+)[,\\s]+([\\d.]+)(?:[,\\/\\s]+([\\d.]+))?\\s*\\)/i);
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
      ? el.className.trim().split(/\\s+/).filter(Boolean).slice(0, 3).join('.')
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
    // Check NinePatch / border-image
    if (cs.borderImageSource && cs.borderImageSource !== 'none') {
      return { boxed: true, reason: 'border-image:' + cs.borderImageSource.slice(0, 40), ninepatch: true };
    }
    const bt = parseFloat(cs.borderTopWidth) || 0;
    const br = parseFloat(cs.borderRightWidth) || 0;
    const bb = parseFloat(cs.borderBottomWidth) || 0;
    const bl = parseFloat(cs.borderLeftWidth) || 0;

    const ct = parseColor(cs.borderTopColor);
    const cr = parseColor(cs.borderRightColor);
    const cb = parseColor(cs.borderBottomColor);
    const cl = parseColor(cs.borderLeftColor);

    const sidesVisible =
      (bt >= 0.75 && cs.borderTopStyle !== 'none' && ct.a >= 0.08 ? 1 : 0) +
      (br >= 0.75 && cs.borderRightStyle !== 'none' && cr.a >= 0.08 ? 1 : 0) +
      (bb >= 0.75 && cs.borderBottomStyle !== 'none' && cb.a >= 0.08 ? 1 : 0) +
      (bl >= 0.75 && cs.borderLeftStyle !== 'none' && cl.a >= 0.08 ? 1 : 0);

    // Tiny circular icon buttons (<= 44px round) don't count as heavy rectangular card boxes
    const brRad = parseFloat(cs.borderTopLeftRadius) || 0;
    const isTinyCircle = rect.width <= 44 && rect.height <= 44 && Math.abs(rect.width - rect.height) <= 4 && brRad >= rect.width * 0.4;
    if (isTinyCircle) return { boxed: false, reason: '' };

    // Solid primary CTA gold fill buttons (e.g. .ws-btn-gold) count as bordered only if 4-sided visible border
    if (sidesVisible >= 3) {
      return {
        boxed: true,
        reason: sidesVisible + '-side border (' + bt + 'px ' + cs.borderTopColor + ')',
        ninepatch: false,
      };
    }

    // Check inset 1px all-around box-shadow used to fake a 4-sided border
    if (cs.boxShadow && cs.boxShadow !== 'none') {
      const m = cs.boxShadow.match(/rgba?\\([^)]+\\)\\s+0px\\s+0px\\s+0px\\s+([\\d.]+)px\\s+inset/i);
      if (m && parseFloat(m[1]) >= 0.75) {
        const sc = parseColor(cs.boxShadow);
        if (sc.a >= 0.14) {
          return { boxed: true, reason: 'inset-ring-shadow(' + m[1] + 'px)', ninepatch: false };
        }
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
      // Detect dark gradient scrims on elements whose backgroundColor is transparent
      if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
        const gm = cs.backgroundImage.match(/rgba?\\(\\s*\\d+[,\\s]+\\d+[,\\s]+\\d+(?:[,\\s]+([\\d.]+))?\\s*\\)/gi);
        if (gm && gm.length) {
          const last = parseColor(gm[gm.length - 1]);
          if (last.a > 0.3) chain.push(last);
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

  const allEls = Array.from(document.querySelectorAll('#ui-root *, body > div:not(#app) *, body > div:not(#app)'));
  const visibleEls = allEls.filter(isVisible);

  // 1. Border Nesting Depth & NinePatch & Backdrop-filter audit
  const htmlHasNinePatch = document.documentElement.classList.contains('ws-has-ninepatch');
  const ninePatchElements = [];
  const backdropElements = [];
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

  let maxBorderNestingDepth = 0;
  const nestedBoxPairs = [];
  for (const [el, info] of boxedSet.entries()) {
    let depth = 1;
    let nearestBoxParent = null;
    let cur = el.parentElement;
    while (cur) {
      if (boxedSet.has(cur)) {
        depth++;
        if (!nearestBoxParent) nearestBoxParent = cur;
      }
      cur = cur.parentElement;
    }
    if (depth > maxBorderNestingDepth) maxBorderNestingDepth = depth;
    if (depth >= 2 && nestedBoxPairs.length < 18) {
      nestedBoxPairs.push({
        depth,
        parent: describeEl(nearestBoxParent),
        parentBorder: boxedSet.get(nearestBoxParent).reason,
        child: describeEl(el),
        childBorder: info.reason,
        childSize: Math.round(info.rect.width) + 'x' + Math.round(info.rect.height),
      });
    }
  }

  // 2. Topbar & Button-Wall audit
  const topbarEl = document.querySelector('.ws-topbar');
  let topbar = null;
  if (topbarEl && isVisible(topbarEl)) {
    const tr = topbarEl.getBoundingClientRect();
    const btns = Array.from(topbarEl.querySelectorAll('button, [role="button"]')).filter(isVisible);
    topbar = {
      height: Math.round(tr.height),
      width: Math.round(tr.width),
      buttonCount: btns.length,
      buttons: btns.map((b) => (b.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 24)),
      wrapsToMultiRow: tr.height > 54,
    };
  }

  const visibleButtons = visibleEls.filter((el) => el.tagName === 'BUTTON' || el.getAttribute('role') === 'button');
  const borderedButtons = visibleButtons.filter((el) => boxedSet.has(el));
  // Detect multi-row dense button stacks
  const btnRows = new Set(visibleButtons.map((b) => Math.round(b.getBoundingClientRect().top / 24)));

  // 3. Open 3D Canvas Viewport Ratio (full viewport + upper 6%..48% hero window)
  let totalSamples = 0;
  let openSamples = 0;
  let upperSamples = 0;
  let upperOpenSamples = 0;
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
        const hasOpaqueGrad = cs.backgroundImage && cs.backgroundImage !== 'none' && !cs.backgroundImage.includes('rgba(0, 0, 0, 0) 0%');
        const hasBorder = boxedSet.has(el);
        const hasText = (el.childNodes.length > 0 && Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 0));
        if (bg.a >= 0.35 || hasBorder || hasText || (hasOpaqueGrad && el.getBoundingClientRect().height < vh * 0.85)) {
          blocked = true;
          break;
        }
      }
      totalSamples++;
      if (!blocked) openSamples++;
      if (y >= vh * 0.06 && y <= vh * 0.48) {
        upperSamples++;
        if (!blocked) upperOpenSamples++;
      }
    }
  }

  // 4. Gameplay Facets Visibility & Overlap check
  const facetEls = Array.from(document.querySelectorAll('[data-facet-idx]')).filter((el) => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  });
  const actionBlockers = ['#ws-btn-overclock', '#ws-btn-peel', '#ws-btn-bookmark', '#ws-btn-next-q']
    .map((sel) => document.querySelector(sel))
    .filter((el) => el && isVisible(el));

  const facetIssues = [];
  for (const f of facetEls) {
    const fr = f.getBoundingClientRect();
    if (fr.height < 32 || fr.bottom > vh + 1 || fr.top < 0) {
      facetIssues.push({
        idx: f.getAttribute('data-facet-idx'),
        issue: 'clipped-or-offscreen',
        rect: { t: Math.round(fr.top), b: Math.round(fr.bottom), h: Math.round(fr.height) },
      });
    }
    for (const act of actionBlockers) {
      const ar = act.getBoundingClientRect();
      const overlapX = Math.max(0, Math.min(fr.right, ar.right) - Math.max(fr.left, ar.left));
      const overlapY = Math.max(0, Math.min(fr.bottom, ar.bottom) - Math.max(fr.top, ar.top));
      if (overlapX > 2 && overlapY > 2) {
        facetIssues.push({
          idx: f.getAttribute('data-facet-idx'),
          issue: 'overlapped-by-' + act.id,
          overlapPx: Math.round(overlapX * overlapY),
        });
      }
    }
  }

  // 5. Typography, Contrast, Clipping & Chrome-Emoji audit
  const tinyText = [];
  const lowContrast = [];
  const clippedText = [];
  const chromeEmojis = [];
  const EMOJI_RE = /[💾🛂🏅📊💎👥🔦💡🧠🏆📁🔍🎙️🔊🔇⚡🎯🛡️📜🎭🌍🗺️🔥⭐☆]/u;

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

    if (fs < 10) {
      tinyText.push({ el: describeEl(el), fontSize: fs, text: directText.slice(0, 36) });
    }

    // Contrast ratio
    const fg = parseColor(cs.color);
    const bg = effectiveBg(el);
    if (fg.a > 0.1) {
      const fgComp = composite(fg, bg);
      const ratio = contrastRatio(fgComp, bg);
      const isLarge = fs >= 18 || (fs >= 14 && fw >= 700);
      const threshold = isLarge ? 3.0 : 4.5;
      if (ratio < threshold && lowContrast.length < 15) {
        lowContrast.push({
          el: describeEl(el),
          ratio: Number(ratio.toFixed(2)),
          minReq: threshold,
          fg: cs.color,
          bg: 'rgb(' + Math.round(bg.r) + ',' + Math.round(bg.g) + ',' + Math.round(bg.b) + ')',
          fontSize: Math.round(fs),
          text: directText.slice(0, 36),
        });
      }
    }

    // Horizontal/vertical text clipping
    if (
      (cs.overflowX === 'hidden' || cs.overflow === 'hidden') &&
      el.scrollWidth > el.clientWidth + 4 &&
      el.clientWidth > 20 &&
      clippedText.length < 12
    ) {
      clippedText.push({
        el: describeEl(el),
        scrollW: el.scrollWidth,
        clientW: el.clientWidth,
        text: directText.slice(0, 40),
      });
    }

    // Chrome emojis inside buttons/tabs
    if ((el.tagName === 'BUTTON' || el.closest('button')) && EMOJI_RE.test(directText)) {
      if (chromeEmojis.length < 12) {
        chromeEmojis.push({ el: describeEl(el), text: directText.slice(0, 36) });
      }
    }
  }

  // Check tabular-nums on timers/scores
  const tabularIssues = [];
  for (const sel of ['#ws-chrono-text', '#ws-player-pts', '#ws-rival-pts']) {
    const el = document.querySelector(sel);
    if (el && isVisible(el)) {
      const fvn = getComputedStyle(el).fontVariantNumeric || '';
      if (!fvn.includes('tabular-nums')) {
        tabularIssues.push({ sel, fontVariantNumeric: fvn });
      }
    }
  }

  // Loaded font families
  const loadedFonts = Array.from(document.fonts)
    .filter((f) => f.status === 'loaded')
    .map((f) => f.family.replace(/['"]/g, ''));

  return {
    screen: screenName,
    viewport: vw + 'x' + vh,
    htmlHasNinePatch,
    ninePatchCount: ninePatchElements.length,
    ninePatchElements: ninePatchElements.slice(0, 8),
    backdropFilterCount: backdropElements.length,
    backdropElements: backdropElements.slice(0, 8),
    borderedBoxCount: boxedSet.size,
    maxBorderNestingDepth,
    nestedBoxPairCount: nestedBoxPairs.length,
    nestedBoxPairs,
    topbar,
    visibleButtonCount: visibleButtons.length,
    borderedButtonCount: borderedButtons.length,
    buttonRowCount: btnRows.size,
    open3dTotalPct: Math.round((openSamples / Math.max(1, totalSamples)) * 100),
    open3dUpperHalfPct: Math.round((upperOpenSamples / Math.max(1, upperSamples)) * 100),
    facetCount: facetEls.length,
    facetIssues,
    tinyTextCount: tinyText.length,
    tinyText: tinyText.slice(0, 8),
    lowContrastCount: lowContrast.length,
    lowContrast,
    clippedTextCount: clippedText.length,
    clippedText,
    chromeEmojiCount: chromeEmojis.length,
    chromeEmojis,
    tabularIssues,
    loadedFonts: [...new Set(loadedFonts)],
  };
})
`;

async function runAudit() {
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.error('FATAL: dist/index.html not found. Run npm.cmd run build first.');
    process.exit(1);
  }

  const { server, baseUrl } = await startStaticServer(DIST_DIR);
  const { proc, wsUrl, profileDir } = await launchBrowser();
  const cdp = new CDPClient(wsUrl);
  await cdp.connect();

  const consoleErrors = [];
  const failedRequests = [];
  const allReports = [];

  try {
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

    const send = (m, p = {}) => cdp.send(m, p, sessionId);
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    cdp.on('Runtime.exceptionThrown', (params, sid) => {
      if (sid !== sessionId) return;
      consoleErrors.push(params.exceptionDetails?.text || 'Exception');
    });
    cdp.on('Runtime.consoleAPICalled', (params, sid) => {
      if (sid !== sessionId) return;
      if (params.type === 'error') {
        consoleErrors.push((params.args || []).map((a) => a.value || a.description).join(' '));
      }
    });
    cdp.on('Network.responseReceived', (params, sid) => {
      if (sid !== sessionId) return;
      if (params.response.status >= 400 && !params.response.url.includes('fonts.g')) {
        failedRequests.push(`${params.response.status} ${params.response.url}`);
      }
    });

    const evalJs = async (expr) => {
      const r = await send('Runtime.evaluate', {
        expression: expr,
        awaitPromise: true,
        returnByValue: true,
      });
      if (r.exceptionDetails) {
        throw new Error('JS Error: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
      }
      return r.result?.value;
    };

    const clickFirst = async (selectors) => {
      return evalJs(`(() => {
        const sels = ${JSON.stringify(selectors)};
        for (const s of sels) {
          const el = document.querySelector(s);
          if (el) {
            const cs = getComputedStyle(el);
            if (cs.display !== 'none' && cs.visibility !== 'hidden') {
              el.click();
              return s;
            }
          }
        }
        return null;
      })()`);
    };

    const snapAndAudit = async (vp, stepIdx, screenSlug) => {
      await sleep(550);
      await evalJs(`Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))])`);
      await evalJs(`new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`);
      const report = await evalJs(`(${IN_PAGE_AUDIT_FN})(${JSON.stringify(vp.label + ':' + screenSlug)})`);
      const { data } = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: vp.width, height: vp.height, scale: 1 },
      });
      const fileName = `${vp.label}_${String(stepIdx).padStart(2, '0')}_${screenSlug}.png`;
      const absPath = path.join(OUT_DIR, fileName);
      fs.writeFileSync(absPath, Buffer.from(data, 'base64'));
      report.screenshotPath = absPath;
      allReports.push(report);

      const flags = [];
      if (report.htmlHasNinePatch || report.ninePatchCount > 0) flags.push(`9PATCH=${report.ninePatchCount}`);
      if (report.maxBorderNestingDepth >= 2) flags.push(`NEST_DEPTH=${report.maxBorderNestingDepth}(${report.nestedBoxPairCount}pairs)`);
      if (report.topbar && (report.topbar.height > 50 || report.topbar.buttonCount > 4)) {
        flags.push(`TOPBAR=${report.topbar.height}px/${report.topbar.buttonCount}btns`);
      }
      if (report.borderedButtonCount >= 8) flags.push(`BTNWALL=${report.borderedButtonCount}boxBtns`);
      if (report.facetIssues.length > 0) flags.push(`FACET_ISSUES=${report.facetIssues.length}`);
      if (report.lowContrastCount > 0) flags.push(`LOW_CONTRAST=${report.lowContrastCount}`);
      if (report.backdropFilterCount > 0) flags.push(`BACKDROP=${report.backdropFilterCount}`);
      if (report.chromeEmojiCount > 0) flags.push(`EMOJI=${report.chromeEmojiCount}`);

      console.log(
        `[${vp.label} ${String(stepIdx).padStart(2, '0')} ${screenSlug.padEnd(22)}] ` +
          `depth=${report.maxBorderNestingDepth} boxes=${String(report.borderedBoxCount).padStart(2)} ` +
          `3D_top=${String(report.open3dUpperHalfPct).padStart(3)}% ` +
          `btns=${String(report.visibleButtonCount).padStart(2)} ` +
          (flags.length ? '!! ' + flags.join(' | ') : 'OK')
      );
      return report;
    };

    const openVaultAndClick = async (targetSelectors, directSelectors = []) => {
      // First try vault drawer (new sleek layout), then fallback to direct topbar buttons
      let hit = await clickFirst(['#ws-util-vault', '.ws-vault-trigger', '#ws-vault-btn', '[data-vault-trigger]']);
      if (hit) {
        await sleep(320);
        const inside = await clickFirst(targetSelectors);
        if (inside) return `vault(${hit})->${inside}`;
      }
      const direct = await clickFirst([...directSelectors, ...targetSelectors]);
      return direct;
    };

    const VIEWPORTS = [
      { label: 'mobile390', width: 390, height: 844, scale: 1, mobile: true },
      { label: 'desktop1280', width: 1280, height: 800, scale: 1, mobile: false },
    ];

    for (const vp of VIEWPORTS) {
      try {
        const { windowId } = await cdp.send('Browser.getWindowForTarget', { targetId });
        await cdp.send('Browser.setWindowBounds', {
          windowId,
          bounds: { width: vp.width, height: vp.height, windowState: 'normal' },
        });
      } catch {}
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.scale,
        mobile: vp.mobile,
      });

      await send('Page.navigate', { url: baseUrl + '/?audit=' + Date.now() });
      await sleep(2000);

      // Wait until title screen CTA renders
      for (let i = 0; i < 20; i++) {
        const ready = await evalJs(`!!document.querySelector('#ws-title-enter-cta, .ws-title-showcase, .ws-topbar')`);
        if (ready) break;
        await sleep(250);
      }

      let step = 1;
      if (ONLY_FLOW === 'all') {
      // 1. Start Screen
      await snapAndAudit(vp, step++, 'start_screen');

      // 2. Vault Drawer (if present on new sleek UI)
      const vaultOpened = await clickFirst(['#ws-util-vault', '.ws-vault-trigger', '#ws-vault-btn', '[data-vault-trigger]']);
      if (vaultOpened) {
        await snapAndAudit(vp, step++, 'vault_drawer');
        await clickFirst(['#ws-vault-close', '.ws-vault-close', '.ws-vault-backdrop']);
        await sleep(250);
      }

      // 3. 3D Intel Observatory
      const obsHit = await openVaultAndClick(
        ['#ws-util-observatory', '[data-vault-action="observatory"]', '[data-open-observatory]'],
        ['#ws-util-observatory']
      );
      if (obsHit) {
        await sleep(600);
        await snapAndAudit(vp, step++, 'observatory_3d');
        await clickFirst(['#ws-obs-close', '#ws-obs-back', '.ws-obs-back', '[data-obs-close]', '.ws-topbar-back']);
        await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
        await sleep(350);
      }

      // 4. Prism Atelier
      const atHit = await openVaultAndClick(
        ['#ws-util-atelier', '[data-vault-action="atelier"]', '[data-open-atelier]'],
        ['#ws-util-atelier']
      );
      if (atHit) {
        await sleep(600);
        await snapAndAudit(vp, step++, 'prism_atelier');
        await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
        await sleep(350);
      }

      // 5. Career Stats Dashboard
      const statsHit = await openVaultAndClick(
        ['#ws-util-stats', '[data-vault-action="stats"]', '[data-open-stats]'],
        ['#ws-util-stats']
      );
      if (statsHit) {
        await sleep(450);
        await snapAndAudit(vp, step++, 'career_stats');
        await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
        await sleep(300);
      }

      // 6. Hall of Honours (64 Trophies)
      const trHit = await openVaultAndClick(
        ['#ws-util-trophies', '[data-vault-action="trophies"]', '[data-open-trophies]'],
        ['#ws-util-trophies']
      );
      if (trHit) {
        await sleep(450);
        await snapAndAudit(vp, step++, 'hall_of_honours');
        await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
        await sleep(300);
      }

      // 7. Diplomatic Passport Book
      const passHit = await openVaultAndClick(
        ['#ws-util-passport', '[data-vault-action="passport"]', '[data-open-passport]'],
        ['#ws-util-passport']
      );
      if (passHit) {
        await sleep(450);
        await snapAndAudit(vp, step++, 'diplomatic_passport');
        await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
        await sleep(300);
      }

      // 8. Faction League / Council Blocs
      const facHit = await openVaultAndClick(
        ['#ws-util-factions', '[data-vault-action="factions"]'],
        ['#ws-util-factions']
      );
      if (facHit) {
        await sleep(400);
        await snapAndAudit(vp, step++, 'faction_league');
        await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
        await sleep(300);
      }

      // 9. 5-Slot Campaign Saves
      const savesHit = await openVaultAndClick(
        ['#ws-util-saves', '[data-vault-action="saves"]', '#ws-title-saves-cta', '.ws-title-saves-link'],
        ['#ws-util-saves', '#ws-title-saves-cta', '.ws-title-saves-link']
      );
      if (savesHit) {
        await sleep(400);
        await snapAndAudit(vp, step++, 'campaign_saves');
        await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
        await sleep(300);
      }

      // 10. 12-Clue Evidence Dossier
      const dosHit = await openVaultAndClick(
        ['#ws-util-dossier', '[data-vault-action="dossier"]'],
        ['#ws-util-dossier']
      );
      if (dosHit) {
        await sleep(400);
        await snapAndAudit(vp, step++, 'evidence_dossier');
        await evalJs(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
        await sleep(300);
      }
      }

      // Clear any active cinema first helper
      const dismissCinema = async (maxWaitLoops = 6) => {
        for (let i = 0; i < maxWaitLoops; i++) {
          const hit = await clickFirst(['#ws-mc-skip', '.ws-mc-btn-skip', '#ws-cinema-skip', '[data-cinema-skip]']);
          if (hit) {
            await sleep(500);
          } else {
            const hasOverlay = await evalJs(`!!document.querySelector('.ws-mc-overlay, .ws-cinema-overlay')`);
            if (!hasOverlay) break;
            await sleep(350);
          }
        }
      };

      if (ONLY_FLOW === 'all' || ONLY_FLOW === 'match') {
        // 11. Name Gate & Story Dialogue (via Enter Meridian -> Skip Act 0 Cinema)
        const enteredMeridian = await clickFirst(['#ws-title-enter-cta']);
        if (enteredMeridian) {
          await sleep(1100);
          await dismissCinema(10);
          await sleep(500);
          // Wait up to 4s for either Name Gate or Story Dialogue or Hub
          for (let i = 0; i < 12; i++) {
            await dismissCinema(2);
            const state = await evalJs(`(() => {
              if (document.querySelector('#challenger-name-input')) return 'name_gate';
              if (document.querySelector('#ws-story-continue, [data-story-choice]')) return 'story';
              if (document.querySelector('[data-start-prologue="1"]')) return 'hub';
              return null;
            })()`);
            if (state === 'name_gate') break;
            if (state === 'hub') {
              await clickFirst(['[data-start-prologue="1"]']);
              await sleep(600);
              continue;
            }
            if (state === 'story') {
              if (ONLY_FLOW === 'match') {
                await snapAndAudit(vp, step++, 'story_dialogue');
              }
              await clickFirst(['#ws-story-continue', '[data-story-choice]']);
              await sleep(500);
              continue;
            }
            await sleep(350);
          }

          const hasName = await evalJs(`!!document.querySelector('#challenger-name-input')`);
          if (hasName) {
            await snapAndAudit(vp, step++, 'name_gate');
            await evalJs(`(() => {
              const inp = document.querySelector('#challenger-name-input');
              if (inp) { inp.value = 'Elena Rostova'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
            })()`);
            await clickFirst(['#ws-begin-vetting']);
            await sleep(700);
            await dismissCinema(6);
            // Snap first Story Dialogue card if present, then advance into Geneva Vetting Q1
            let snappedStory = false;
            for (let i = 0; i < 6; i++) {
              const hasStory = await evalJs(`!!document.querySelector('#ws-story-continue, [data-story-choice]')`);
              if (!hasStory) break;
              if (!snappedStory) {
                await snapAndAudit(vp, step++, 'story_dialogue');
                snappedStory = true;
              }
              await clickFirst(['#ws-story-continue', '[data-story-choice]']);
              await sleep(550);
            }
          }
        }

        // 12. If in Geneva Vetting Gameplay Live, snap Gameplay Live + Peel + Reveal right here!
        const inVettingGameplay = await evalJs(`document.querySelectorAll('[data-facet-idx]').length >= 2`);
        if (inVettingGameplay) {
          await snapAndAudit(vp, step++, 'gameplay_live');
          const peeled = await clickFirst(['#ws-btn-peel']);
          if (peeled) {
            await sleep(650);
            await snapAndAudit(vp, step++, 'gameplay_peel_t2');
          }
          await clickFirst(['[data-facet-idx="0"]']);
          await sleep(250);
          await clickFirst(['#ws-btn-overclock']);
          await sleep(600);
          const revealedYet = await evalJs(`!!document.querySelector('#ws-btn-next-q, .ws-intel-flash')`);
          if (!revealedYet) {
            await clickFirst(['[data-facet-idx="0"]']);
            await sleep(500);
          }
          await snapAndAudit(vp, step++, 'gameplay_reveal');
        }
      }

      // 13. Navigate to Hub (via fresh reload + CAMPAIGN mode from Title!)
      await send('Page.navigate', { url: baseUrl + '/?hub_audit=' + Date.now() });
      await sleep(1800);
      for (let i = 0; i < 15; i++) {
        const ready = await evalJs(`!!document.querySelector('[data-title-mode="CAMPAIGN"], [data-title-mode="BRIEFING"]')`);
        if (ready) break;
        await sleep(200);
      }
      const hubModeHit = await clickFirst([ONLY_FLOW === 'match' ? '[data-title-mode="BRIEFING"]' : '[data-title-mode="CAMPAIGN"]', '[data-title-mode="BRIEFING"]']);
      if (hubModeHit) {
        await sleep(650);
        await dismissCinema(4);
        if (ONLY_FLOW !== 'match') {
          // Snap World Circuit Hub tab first!
          await clickFirst(['[data-hub-tab="CAMPAIGN"]']);
          await sleep(550);
          await snapAndAudit(vp, step++, 'world_circuit_hub');
          // Now switch to Briefing tab and open Briefing Categories 3-level drill-down modal!
          await clickFirst(['[data-hub-tab="BRIEFING"]']);
          await sleep(450);
          const openModalHit = await clickFirst(['#ws-open-briefing-modal']);
          if (openModalHit) await sleep(500);
          await snapAndAudit(vp, step++, 'briefing_categories');
        } else {
          // In match-only mode, open Briefing Categories directly to test L2 drilldown + launch!
          const openModalHit = await clickFirst(['#ws-open-briefing-modal']);
          if (openModalHit) await sleep(500);
        }
        // Drill into Sports & Games (L0: data-pick-l0="5") -> Sports (L1: data-pick-l1="sports") -> Baseball (L2)
        await clickFirst(['[data-pick-l0="5"]']);
        await sleep(400);
        if (ONLY_FLOW !== 'match') {
          await snapAndAudit(vp, step++, 'briefing_drilldown_l1');
        }
        await clickFirst(['[data-pick-l1="sports"]', '[data-pick-l1]']);
        await sleep(400);
        await snapAndAudit(vp, step++, 'briefing_drilldown_l2');
        // Select Baseball L2 if present & launch Briefing into Live Gameplay!
        await clickFirst(['[data-pick-l2="sports_baseball"]', '[data-pick-l2]']);
        await sleep(300);
        const launched = await clickFirst(['#ws-cat-launch', '.ws-briefing-launch-cta']);
        if (launched) {
          await sleep(800);
          await dismissCinema(4);
          const inBriefingGameplay = await evalJs(`document.querySelectorAll('[data-facet-idx]').length >= 2`);
          if (inBriefingGameplay) {
            await snapAndAudit(vp, step++, 'briefing_gameplay_live');
            const peeled = await clickFirst(['#ws-btn-peel']);
            if (peeled) {
              await sleep(650);
              await snapAndAudit(vp, step++, 'briefing_gameplay_peel_t2');
            }
            await clickFirst(['[data-facet-idx="0"]']);
            await sleep(250);
            await clickFirst(['#ws-btn-overclock']);
            await sleep(650);
            await snapAndAudit(vp, step++, 'briefing_gameplay_reveal');
          }
        }
      }
    }
  } finally {
    const summaryPath = path.join(OUT_DIR, 'audit_report.json');
    fs.writeFileSync(
      summaryPath,
      JSON.stringify({ tag: TAG, consoleErrors, failedRequests, screens: allReports }, null, 2)
    );
    console.log('\nReport saved ->', summaryPath);
    console.log('Console errors:', consoleErrors.length, '| Failed HTTP requests:', failedRequests.length);
    if (consoleErrors.length) console.log('Errors:', consoleErrors.slice(0, 5));
    if (failedRequests.length) console.log('404/500:', failedRequests.slice(0, 5));

    cdp.close();
    try {
      proc.kill();
    } catch {}
    server.close();
    try {
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch {}
  }
}

runAudit().catch((err) => {
  console.error(err);
  process.exit(1);
});
