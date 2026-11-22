#!/usr/bin/env node
/**
 * RT-E2E-SYSTEMS-AUDITOR — Zero-dependency Headless Edge WebGL2 CDP Harness
 * Serves `dist/` on an ephemeral 127.0.0.1:0 port, drives msedge.exe via Chrome DevTools Protocol,
 * counts real WebGL2 draw calls & shader errors per frame, dispatches real touch & keyboard events,
 * captures full-window screenshots, and measures bloom whiteout percentage.
 */
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function findFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.on('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const p = s.address().port;
      s.close(() => resolve(p));
    });
  });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../..');
export const DIST_DIR = path.join(ROOT, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
  '.hdr': 'application/octet-stream',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.gz': 'application/gzip',
};

export function startDistServer(rootDir = DIST_DIR) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const rawUrl = (req.url || '/').split('?')[0];
        let rel = decodeURIComponent(rawUrl);
        if (rel === '/' || rel === '') rel = '/index.html';
        const safePath = path.normalize(path.join(rootDir, rel));
        if (!safePath.startsWith(rootDir)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }
        if (!fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
          res.writeHead(404);
          res.end(`Not Found: ${rel}`);
          return;
        }
        const ext = path.extname(safePath).toLowerCase();
        const headers = {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Cache-Control': 'no-store',
        };
        res.writeHead(200, headers);
        fs.createReadStream(safePath).pipe(res);
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
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

function findEdgeExecutable() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('Could not find msedge.exe or chrome.exe');
}

/**
 * Injected before page scripts run:
 * 1) Wraps WebGL2 draw calls & shader compile/link checks for exact per-frame draw calls & 0 shader errors
 * 2) Tracks rAF FPS window cleanly
 * 3) Captures Blob/Anchor file download exports (`window.__rtLastDownload`) for 5-Slot Save Export verification
 */
export const TELEMETRY_PRELOAD_SCRIPT = `
(() => {
  if (window.__rtTelemetryInstalled) return;
  window.__rtTelemetryInstalled = true;
  const stats = {
    drawCallsCurrentFrame: 0,
    drawCallsHistory: [],
    fboSwitchesCurrentFrame: 0,
    fboSwitchesHistory: [],
    maxDrawCalls: 0,
    shaderErrors: [],
    programErrors: [],
    webglContexts: 0,
    webglRenderer: null,
    webglVendor: null,
    webglVersion: null,
    rafDeltas: [],
    lastRafMs: 0,
    recordingPerf: false,
    downloads: [],
    canvasPointerEvents: { down: 0, move: 0, up: 0, lastTarget: null },
  };
  window.__rtStats = stats;

  window.addEventListener('pointerdown', (e) => {
    stats.canvasPointerEvents.down++;
    stats.canvasPointerEvents.lastTarget = e.target?.tagName || null;
  }, { capture: true, passive: true });
  window.addEventListener('pointermove', () => {
    stats.canvasPointerEvents.move++;
  }, { capture: true, passive: true });
  window.addEventListener('pointerup', () => {
    stats.canvasPointerEvents.up++;
  }, { capture: true, passive: true });

  // Hook WebGL2 / WebGL1 draw & shader APIs
  function hookProto(proto) {
    if (!proto || proto.__rtHooked) return;
    proto.__rtHooked = true;
    const drawMethods = ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced', 'drawRangeElements'];
    for (const m of drawMethods) {
      if (typeof proto[m] === 'function') {
        const orig = proto[m];
        proto[m] = function(...args) {
          stats.drawCallsCurrentFrame++;
          return orig.apply(this, args);
        };
      }
    }
    if (typeof proto.bindFramebuffer === 'function') {
      const origFbo = proto.bindFramebuffer;
      proto.bindFramebuffer = function(...args) {
        stats.fboSwitchesCurrentFrame++;
        return origFbo.apply(this, args);
      };
    }
    if (typeof proto.compileShader === 'function') {
      const origCompile = proto.compileShader;
      proto.compileShader = function(shader) {
        const res = origCompile.call(this, shader);
        try {
          if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
            const log = this.getShaderInfoLog(shader) || 'Unknown shader error';
            stats.shaderErrors.push(log.slice(0, 300));
          }
        } catch {}
        return res;
      };
    }
    if (typeof proto.linkProgram === 'function') {
      const origLink = proto.linkProgram;
      proto.linkProgram = function(prog) {
        const res = origLink.call(this, prog);
        try {
          if (!this.getProgramParameter(prog, this.LINK_STATUS)) {
            const log = this.getProgramInfoLog(prog) || 'Unknown program link error';
            stats.programErrors.push(log.slice(0, 300));
          }
        } catch {}
        return res;
      };
    }
  }
  if (typeof WebGL2RenderingContext !== 'undefined') hookProto(WebGL2RenderingContext.prototype);
  if (typeof WebGLRenderingContext !== 'undefined') hookProto(WebGLRenderingContext.prototype);

  const origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, attrs) {
    const ctx = origGetContext.call(this, type, attrs);
    if (ctx && (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl')) {
      stats.webglContexts++;
      try {
        const ver = ctx.getParameter(ctx.VERSION);
        const isWebGL2 = type === 'webgl2' || /WebGL 2/i.test(String(ver));
        if (!stats.webglVersion || isWebGL2) {
          stats.webglVersion = ver;
          const ext = ctx.getExtension('WEBGL_debug_renderer_info');
          stats.webglVendor = ext ? ctx.getParameter(ext.UNMASKED_VENDOR_WEBGL) : ctx.getParameter(ctx.VENDOR);
          stats.webglRenderer = ext ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER);
        }
      } catch {}
    }
    return ctx;
  };

  // Frame boundary tracker (runs every animation frame)
  function rafProbe(now) {
    if (stats.recordingPerf) {
      if (stats.lastRafMs > 0) {
        const dt = now - stats.lastRafMs;
        if (dt > 0 && dt < 2000) stats.rafDeltas.push(dt);
      }
      stats.drawCallsHistory.push(stats.drawCallsCurrentFrame);
      stats.fboSwitchesHistory.push(stats.fboSwitchesCurrentFrame);
      if (stats.drawCallsCurrentFrame > stats.maxDrawCalls) {
        stats.maxDrawCalls = stats.drawCallsCurrentFrame;
      }
    }
    stats.drawCallsCurrentFrame = 0;
    stats.fboSwitchesCurrentFrame = 0;
    stats.lastRafMs = now;
    requestAnimationFrame(rafProbe);
  }
  requestAnimationFrame(rafProbe);

  window.__rtStartPerfWindow = () => {
    stats.rafDeltas = [];
    stats.drawCallsHistory = [];
    stats.fboSwitchesHistory = [];
    stats.maxDrawCalls = 0;
    stats.lastRafMs = 0;
    stats.drawCallsCurrentFrame = 0;
    stats.fboSwitchesCurrentFrame = 0;
    stats.recordingPerf = true;
  };

  window.__rtEndPerfWindow = () => {
    stats.recordingPerf = false;
    const dts = stats.rafDeltas.slice();
    const calls = stats.drawCallsHistory.filter((c) => c > 0);
    const fbos = stats.fboSwitchesHistory.filter((c) => c > 0);
    dts.sort((a, b) => a - b);
    const avgDt = dts.length ? dts.reduce((a, b) => a + b, 0) / dts.length : 0;
    const p50Dt = dts.length ? dts[Math.floor(dts.length * 0.5)] : 0;
    const p95Dt = dts.length ? dts[Math.floor(dts.length * 0.95)] : 0;
    const avgFps = avgDt > 0 ? 1000 / avgDt : 0;
    const medianFps = p50Dt > 0 ? 1000 / p50Dt : 0;
    const avgDrawCalls = calls.length ? calls.reduce((a, b) => a + b, 0) / calls.length : 0;
    const maxDrawCalls = calls.length ? Math.max(...calls) : stats.maxDrawCalls;
    const avgFboSwitches = fbos.length ? fbos.reduce((a, b) => a + b, 0) / fbos.length : 0;
    return {
      frames: dts.length,
      avgFps: Number(avgFps.toFixed(1)),
      medianFps: Number(medianFps.toFixed(1)),
      p50Ms: Number(p50Dt.toFixed(2)),
      p95Ms: Number(p95Dt.toFixed(2)),
      avgDrawCalls: Number(avgDrawCalls.toFixed(1)),
      maxDrawCalls,
      avgFboSwitches: Number(avgFboSwitches.toFixed(1)),
      shaderErrors: stats.shaderErrors.slice(),
      programErrors: stats.programErrors.slice(),
      webglVersion: stats.webglVersion,
      webglRenderer: stats.webglRenderer,
    };
  };

  // Capture Blob exports triggered by 5-Slot Save Export
  const blobStore = new Map();
  const origCreateObjUrl = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (blob) => {
    const u = origCreateObjUrl(blob);
    try {
      if (blob instanceof Blob) {
        blob.text().then((txt) => blobStore.set(u, txt)).catch(() => {});
      }
    } catch {}
    return u;
  };
  const origAnchorClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function() {
    if (this.download) {
      const rec = {
        filename: this.download,
        href: this.href,
        text: blobStore.get(this.href) || null,
        ts: Date.now(),
      };
      stats.downloads.push(rec);
      if (!rec.text && this.href && this.href.startsWith('blob:')) {
        fetch(this.href).then((r) => r.text()).then((t) => { rec.text = t; }).catch(() => {});
      }
      return; // prevent headless download dialog interruption
    }
    return origAnchorClick.apply(this, arguments);
  };
})();
`;

export async function launchCdpBrowser({ width = 1280, height = 800, softwareGl = false } = {}) {
  const exe = findEdgeExecutable();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-rt-e2e-'));
  const cdpPort = await findFreePort();
  const args = [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tmpDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-sync',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--autoplay-policy=no-user-gesture-required',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    `--window-size=${width},${height}`,
  ];
  if (softwareGl) {
    args.push('--use-gl=angle', '--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader');
  }
  args.push('about:blank');

  const proc = spawn(exe, args, { stdio: ['ignore', 'pipe', 'pipe'] });

  const wsUrl = await new Promise((resolve, reject) => {
    let stderr = '';
    let settled = false;
    const finish = (err, val) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearInterval(poller);
      if (err) {
        try { proc.kill(); } catch {}
        reject(err);
      } else {
        resolve(val);
      }
    };
    const timer = setTimeout(() => {
      finish(new Error(`Timeout launching Edge on port ${cdpPort}. stderr:\n${stderr}`));
    }, 60000);
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      const m = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) finish(null, m[1]);
    });
    proc.on('exit', (code) => {
      finish(new Error(`Edge exited early (${code}). stderr:\n${stderr}`));
    });
    const poller = setInterval(async () => {
      try {
        const resp = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
        if (resp.ok) {
          const info = await resp.json();
          if (info.webSocketDebuggerUrl) finish(null, info.webSocketDebuggerUrl);
        }
      } catch {}
    }, 250);
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  const eventListeners = new Map();

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.code}: ${msg.error.message}`));
      else resolve(msg.result);
    } else if (msg.method) {
      const set = eventListeners.get(msg.method);
      if (set) {
        for (const fn of set) fn(msg.params, msg.sessionId);
      }
    }
  });

  function sendRaw(method, params = {}, sessionId = undefined) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      const payload = sessionId ? { id, sessionId, method, params } : { id, method, params };
      ws.send(JSON.stringify(payload));
    });
  }

  function onEvent(method, fn) {
    if (!eventListeners.has(method)) eventListeners.set(method, new Set());
    eventListeners.get(method).add(fn);
    return () => eventListeners.get(method)?.delete(fn);
  }

  const { targetInfos } = await sendRaw('Target.getTargets');
  const pageTarget = targetInfos.find((t) => t.type === 'page') || targetInfos[0];
  const { sessionId } = await sendRaw('Target.attachToTarget', {
    targetId: pageTarget.targetId,
    flatten: true,
  });

  const send = (method, params = {}) => sendRaw(method, params, sessionId);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('DOM.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: TELEMETRY_PRELOAD_SCRIPT });

  const consoleErrors = [];
  const pageExceptions = [];
  const httpErrors = [];

  onEvent('Runtime.consoleAPICalled', (p, sid) => {
    if (sid !== sessionId) return;
    if (p.type === 'error') {
      const text = (p.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
      consoleErrors.push(text);
    }
  });
  onEvent('Runtime.exceptionThrown', (p, sid) => {
    if (sid !== sessionId) return;
    const d = p.exceptionDetails || {};
    const msg = d.exception?.description || d.text || JSON.stringify(d);
    pageExceptions.push(msg);
  });
  onEvent('Network.responseReceived', (p, sid) => {
    if (sid !== sessionId) return;
    const status = p.response?.status ?? 200;
    const url = p.response?.url ?? '';
    if (status >= 400) {
      httpErrors.push({ status, url });
    }
  });
  onEvent('Network.loadingFailed', (p, sid) => {
    if (sid !== sessionId) return;
    if (!p.canceled && p.errorText && !p.errorText.includes('ERR_ABORTED')) {
      httpErrors.push({ status: 0, url: p.requestId, errorText: p.errorText });
    }
  });

  async function setViewport({ width: w, height: h, mobile = true, dpr = 2 }) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: dpr,
      mobile,
      screenWidth: w,
      screenHeight: h,
    });
    await send('Emulation.setTouchEmulationEnabled', {
      enabled: mobile,
      maxTouchPoints: mobile ? 5 : 1,
    });
  }

  async function navigate(url) {
    await send('Page.navigate', { url });
    await sleep(300);
  }

  async function evalJs(expression, awaitPromise = true) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise,
    });
    if (res.exceptionDetails) {
      throw new Error(
        `Page eval exception: ${res.exceptionDetails.exception?.description || res.exceptionDetails.text}`
      );
    }
    return res.result?.value;
  }

  async function waitFor(predicateJs, timeoutMs = 20000, pollMs = 150) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const ok = await evalJs(`Boolean(${predicateJs})`, true);
      if (ok) return true;
      await sleep(pollMs);
    }
    return false;
  }

  async function clickSelector(selector, { timeoutMs = 8000 } = {}) {
    const found = await waitFor(`document.querySelector(${JSON.stringify(selector)})`, timeoutMs, 100);
    if (!found) throw new Error(`Selector not found for click: ${selector}`);
    const pt = await evalJs(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
    })()`);
    if (!pt || pt.w <= 0 || pt.h <= 0) {
      throw new Error(`Element has zero size: ${selector}`);
    }
    await mouseClick(pt.x, pt.y);
    return pt;
  }

  async function mouseClick(x, y) {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await sleep(35);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }

  async function touchTap(x, y) {
    await send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y, radiusX: 12, radiusY: 12, force: 1, id: 1 }],
    });
    await sleep(40);
    await send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
  }

  async function touchDrag(x1, y1, x2, y2, steps = 12, stepDelayMs = 24) {
    await send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: x1, y: y1, radiusX: 12, radiusY: 12, force: 1, id: 1 }],
    });
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const cx = x1 + (x2 - x1) * t;
      const cy = y1 + (y2 - y1) * t;
      await sleep(stepDelayMs);
      await send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: cx, y: cy, radiusX: 12, radiusY: 12, force: 1, id: 1 }],
      });
    }
    await sleep(30);
    await send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
  }

  async function pressKey(key, code = key, keyCode = 0) {
    const map = {
      Escape: { code: 'Escape', keyCode: 27 },
      Space: { key: ' ', code: 'Space', keyCode: 32 },
      Enter: { code: 'Enter', keyCode: 13 },
    };
    const info = map[key] || { key, code, keyCode };
    await send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: info.key ?? key,
      code: info.code ?? code,
      windowsVirtualKeyCode: info.keyCode ?? keyCode,
      nativeVirtualKeyCode: info.keyCode ?? keyCode,
    });
    await sleep(25);
    await send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: info.key ?? key,
      code: info.code ?? code,
      windowsVirtualKeyCode: info.keyCode ?? keyCode,
      nativeVirtualKeyCode: info.keyCode ?? keyCode,
    });
  }

  async function screenshot(outPath) {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
    return outPath;
  }

  async function measurePerf(durationMs = 1500) {
    await evalJs('window.__rtStartPerfWindow()');
    await sleep(durationMs);
    return evalJs('window.__rtEndPerfWindow()');
  }

  async function close() {
    try { ws.close(); } catch {}
    try { proc.kill(); } catch {}
    await sleep(250);
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }

  return {
    send,
    setViewport,
    navigate,
    evalJs,
    waitFor,
    clickSelector,
    mouseClick,
    touchTap,
    touchDrag,
    pressKey,
    screenshot,
    measurePerf,
    consoleErrors,
    pageExceptions,
    httpErrors,
    clearDiagnostics: () => {
      consoleErrors.length = 0;
      pageExceptions.length = 0;
      httpErrors.length = 0;
    },
    close,
  };
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
