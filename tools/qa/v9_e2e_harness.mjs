#!/usr/bin/env node
/**
 * World's Smartest v9 — Reusable Hardware-WebGL2 CDP & Local Dist Harness
 * Zero external dependencies (Node v26.13.1 built-ins only).
 *
 * Exports:
 *   - ensureDistServer8999(repoRoot)
 *   - launchV9Browser({ tmpRoot, width, height, screenshotsDir })
 *   - TELEMETRY_PRELOAD_SCRIPT
 *   - sleep(ms)
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const REPO_ROOT = path.resolve(__dirname, '../..');
export const BASE_URL_DEFAULT = 'http://127.0.0.1:8999/Worlds-Smartest/';
export const SCREENSHOTS_DIR_DEFAULT = path.join(REPO_ROOT, '.agents', 'v9_qa_screenshots');
export const TMP_ROOT_DEFAULT = path.join(REPO_ROOT, '.agents', 'v9_qa_tmp');
export const EDGE_EXE_DEFAULT = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const ASSET_EXTENSIONS_RE = /\.(webp|jpe?g|png|json|js|mjs|css|gz|woff2?|ttf|wav|mp3|ogg|svg)$/i;

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findEdgeExecutable() {
  const candidates = [
    EDGE_EXE_DEFAULT,
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('Could not locate msedge.exe or chrome.exe');
}

async function probeServer8999(url = BASE_URL_DEFAULT, timeoutMs = 2500) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) return false;
    const html = await res.text();
    return /WORLD'S SMARTEST|canvas-root/i.test(html);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function ensureDistServer8999(repoRoot = REPO_ROOT) {
  if (await probeServer8999(BASE_URL_DEFAULT)) {
    return {
      baseUrl: BASE_URL_DEFAULT,
      owned: false,
      pid: null,
      close: async () => {},
    };
  }

  const distIndex = path.join(repoRoot, 'dist', 'index.html');
  if (!fs.existsSync(distIndex)) {
    throw new Error(`dist/index.html missing at ${distIndex}. Run npm.cmd run build first.`);
  }

  const serverScript = path.join(repoRoot, 'scripts', 'serve_dist_8999.mjs');
  const proc = spawn(process.execPath, [serverScript], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';
  let exited = false;
  let exitCode = null;
  proc.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });
  proc.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  proc.on('exit', (code) => {
    exited = true;
    exitCode = code;
  });

  const deadline = Date.now() + 20_000;
  let ready = false;
  while (Date.now() < deadline) {
    if (/ready at http/i.test(stdout) || await probeServer8999(BASE_URL_DEFAULT, 1500)) {
      ready = true;
      break;
    }
    if (exited && exitCode !== 0) {
      break;
    }
    await sleep(200);
  }

  if (!ready) {
    if (!exited) {
      if (process.platform === 'win32' && proc.pid) {
        try { spawnSync('taskkill', ['/F', '/T', '/PID', String(proc.pid)], { stdio: 'ignore' }); } catch {}
      }
      try { proc.kill(); } catch {}
    }
    // Ephemeral local dist/ fallback server with exact /Worlds-Smartest/ + SPA fallback MIME behavior
    const distDir = path.join(repoRoot, 'dist');
    const MIME = {
      '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
      '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8', '.gz': 'application/gzip',
      '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
      '.wav': 'audio/wav', '.webm': 'audio/webm', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
    };
    const ephServer = http.createServer((req, res) => {
      if (req.url === '/Worlds-Smartest') {
        res.writeHead(302, { Location: '/Worlds-Smartest/', 'Cache-Control': 'no-store' });
        res.end();
        return;
      }
      let clean = decodeURIComponent((req.url || '/').split('?')[0] || '/');
      if (clean.startsWith('/Worlds-Smartest/')) clean = '/' + clean.slice('/Worlds-Smartest/'.length);
      if (clean === '/' || clean === '') clean = '/index.html';
      let filePath = path.resolve(distDir, '.' + clean);
      if (!filePath.startsWith(distDir) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        filePath = path.resolve(distDir, 'index.html');
      }
      if (!fs.existsSync(filePath)) {
        res.writeHead(404); res.end('Not Found'); return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
      fs.createReadStream(filePath).pipe(res);
    });
    await new Promise((resolve, reject) => {
      ephServer.on('error', reject);
      ephServer.listen(0, '127.0.0.1', resolve);
    });
    const port = ephServer.address().port;
    return {
      baseUrl: `http://127.0.0.1:${port}/Worlds-Smartest/`,
      owned: true,
      pid: null,
      close: async () => {
        try { ephServer.closeAllConnections?.(); } catch {}
        await new Promise((r) => ephServer.close(() => r()));
      },
    };
  }

  // If another process bound 8999 right as we spawned, serve_dist_8999 exits 0 on EADDRINUSE
  const owned = !exited;
  return {
    baseUrl: BASE_URL_DEFAULT,
    owned,
    pid: owned ? proc.pid : null,
    close: async () => {
      if (!owned || exited) return;
      if (process.platform === 'win32' && proc.pid) {
        try {
          spawnSync('taskkill', ['/F', '/T', '/PID', String(proc.pid)], { stdio: 'ignore' });
        } catch {}
      }
      try {
        proc.kill();
      } catch {}
      await sleep(150);
    },
  };
}

export const TELEMETRY_PRELOAD_SCRIPT = `
(() => {
  if (window.__wsV9TelemetryInstalled) return;
  window.__wsV9TelemetryInstalled = true;
  const stats = {
    webglContexts: 0,
    isWebGL2: false,
    webglVersion: null,
    webglVendor: null,
    webglRenderer: null,
    shaderErrors: [],
    programErrors: [],
    drawCallsCurrentFrame: 0,
    drawCallsHistory: [],
    maxDrawCalls: 0,
    rafDeltas: [],
    lastRafMs: 0,
    recordingPerf: false,
    downloads: [],
  };
  window.__wsV9Stats = stats;

  function hookProto(proto) {
    if (!proto || proto.__wsV9Hooked) return;
    proto.__wsV9Hooked = true;
    for (const m of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced', 'drawRangeElements']) {
      if (typeof proto[m] === 'function') {
        const orig = proto[m];
        proto[m] = function(...args) {
          stats.drawCallsCurrentFrame++;
          return orig.apply(this, args);
        };
      }
    }
    if (typeof proto.compileShader === 'function') {
      const origCompile = proto.compileShader;
      proto.compileShader = function(shader) {
        const res = origCompile.call(this, shader);
        try {
          if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
            const log = this.getShaderInfoLog(shader) || 'Unknown shader compile error';
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
        const isW2 = type === 'webgl2' || /WebGL 2/i.test(String(ver));
        if (isW2) stats.isWebGL2 = true;
        if (!stats.webglVersion || isW2) {
          stats.webglVersion = ver;
          const ext = ctx.getExtension('WEBGL_debug_renderer_info');
          stats.webglVendor = ext ? ctx.getParameter(ext.UNMASKED_VENDOR_WEBGL) : ctx.getParameter(ctx.VENDOR);
          stats.webglRenderer = ext ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER);
        }
      } catch {}
    }
    return ctx;
  };

  function rafTick(now) {
    if (stats.recordingPerf) {
      if (stats.lastRafMs > 0) {
        const dt = now - stats.lastRafMs;
        if (dt > 0 && dt < 2000) stats.rafDeltas.push(dt);
      }
      stats.drawCallsHistory.push(stats.drawCallsCurrentFrame);
      if (stats.drawCallsCurrentFrame > stats.maxDrawCalls) stats.maxDrawCalls = stats.drawCallsCurrentFrame;
    }
    stats.drawCallsCurrentFrame = 0;
    stats.lastRafMs = now;
    requestAnimationFrame(rafTick);
  }
  requestAnimationFrame(rafTick);
})();
`;

export async function launchV9Browser({
  tmpRoot = TMP_ROOT_DEFAULT,
  width = 1440,
  height = 900,
  screenshotsDir = SCREENSHOTS_DIR_DEFAULT,
  cdpTimeoutMs = 45_000,
} = {}) {
  const exe = findEdgeExecutable();
  const createdUserDataDirs = [];
  let userDataDir = '';
  fs.mkdirSync(screenshotsDir, { recursive: true });

  let proc = null;
  let cdpPort = 0;
  let browserWsUrl = '';
  let ws = null;
  let activeTargetId = null;
  let activeSessionId = null;
  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  function rejectAllPending(reason) {
    for (const [id, entry] of [...pending.entries()]) {
      clearTimeout(entry.timer);
      pending.delete(id);
      entry.reject(new Error(reason));
    }
  }

  async function killEdgeProc(targetProc) {
    if (!targetProc) return;
    if (process.platform === 'win32' && targetProc.pid) {
      try {
        spawnSync('taskkill', ['/F', '/T', '/PID', String(targetProc.pid)], { stdio: 'ignore' });
      } catch {}
    }
    try { targetProc.kill('SIGKILL'); } catch {}
    await sleep(300);
  }

  async function cleanupUserDataDir(dirPath) {
    if (!dirPath) return;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
        const idx = createdUserDataDirs.indexOf(dirPath);
        if (idx >= 0) createdUserDataDirs.splice(idx, 1);
        return true;
      } catch {
        await sleep(80);
      }
    }
    return false;
  }

  async function spawnEdge() {
    const attemptDir = path.join(tmpRoot, `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
    userDataDir = attemptDir;
    fs.mkdirSync(attemptDir, { recursive: true });
    createdUserDataDirs.push(attemptDir);
    const args = [
      '--headless=new',
      '--no-sandbox',
      '--remote-debugging-port=0',
      `--user-data-dir=${attemptDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-sync',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--autoplay-policy=no-user-gesture-required',
      `--window-size=${width},${height}`,
      'about:blank',
    ];
    const spawned = spawn(exe, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    const wsUrl = await new Promise((resolve, reject) => {
      let stderr = '';
      let settled = false;
      const finish = (err, url) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (err) {
          try { spawned.kill('SIGKILL'); } catch {}
          reject(err);
        } else {
          resolve(url);
        }
      };
      const timer = setTimeout(() => {
        finish(new Error(`Timeout waiting for Edge CDP endpoint. stderr:\n${stderr}`));
      }, 30_000);

      spawned.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
        const m = stderr.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/[^\s]+)/);
        if (m) finish(null, m[1]);
      });

      spawned.on('exit', (code) => {
        finish(new Error(`Edge exited early (${code}). stderr:\n${stderr}`));
      });
    });
    proc = spawned;
    browserWsUrl = wsUrl;
    cdpPort = Number(new URL(wsUrl).port);
    return attemptDir;
  }

  const consoleErrors = [];
  const pageExceptions = [];
  const httpErrors = [];
  const assetMimeErrors = [];
  const loadingFailedErrors = [];
  const externalNetworkWarnings = [];
  const logErrors = [];
  const requestUrlMap = new Map();

  function isExternalOfflineFontWarning(url, errorText) {
    return (
      /^https:\/\/fonts\.(googleapis|gstatic)\.com\//i.test(String(url || '')) &&
      /ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_TIMED_OUT/i.test(String(errorText || ''))
    );
  }

  function clearDiagnostics() {
    consoleErrors.length = 0;
    pageExceptions.length = 0;
    httpErrors.length = 0;
    assetMimeErrors.length = 0;
    loadingFailedErrors.length = 0;
    externalNetworkWarnings.length = 0;
    logErrors.length = 0;
    requestUrlMap.clear();
  }

  function handleCdpEvent(method, params) {
    if (method === 'Runtime.consoleAPICalled') {
      if (params.type === 'error') {
        const text = (params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
        consoleErrors.push(text);
      }
    } else if (method === 'Runtime.exceptionThrown') {
      const d = params.exceptionDetails || {};
      const msg = d.exception?.description || d.text || JSON.stringify(d);
      pageExceptions.push(msg);
    } else if (method === 'Network.requestWillBeSent') {
      if (params.requestId && params.request?.url) {
        requestUrlMap.set(params.requestId, params.request.url);
      }
    } else if (method === 'Network.responseReceived') {
      const status = params.response?.status ?? 200;
      const url = params.response?.url ?? '';
      const cleanPath = url.split(/[?#]/)[0];
      const mimeType = String(
        params.response?.mimeType ||
        params.response?.headers?.['content-type'] ||
        params.response?.headers?.['Content-Type'] ||
        ''
      ).toLowerCase();

      if (status >= 400 && !/favicon\.ico$/i.test(cleanPath)) {
        httpErrors.push({ status, url, mimeType });
      }
      if (ASSET_EXTENSIONS_RE.test(cleanPath) && mimeType.includes('text/html')) {
        assetMimeErrors.push({
          code: 'ASSET_MIME_MISMATCH',
          url,
          status,
          mimeType,
        });
      }
    } else if (method === 'Network.loadingFailed') {
      const url = requestUrlMap.get(params.requestId) || params.requestId;
      const cleanPath = String(url).split(/[?#]/)[0];
      if (!params.canceled && params.errorText && !params.errorText.includes('ERR_ABORTED') && !/favicon\.ico$/i.test(cleanPath)) {
        if (isExternalOfflineFontWarning(url, params.errorText)) {
          externalNetworkWarnings.push({ url, errorText: params.errorText });
        } else {
          loadingFailedErrors.push({ url, errorText: params.errorText });
        }
      }
    } else if (method === 'Log.entryAdded') {
      const entry = params.entry || {};
      if (entry.level === 'error') {
        const url = entry.url || '';
        if (!/favicon\.ico$/i.test(url) && !isExternalOfflineFontWarning(url, entry.text)) {
          logErrors.push({ source: entry.source, text: entry.text, url });
        }
      }
    }

    const cbs = listeners.get(method);
    if (cbs) {
      for (const cb of [...cbs]) cb(params);
    }
  }

  function send(method, params = {}, timeoutMs = cdpTimeoutMs) {
    return new Promise((resolve, reject) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new Error(`CDP socket not open for ${method}`));
        return;
      }
      const id = nextId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`CDP command timed out after ${timeoutMs}ms: ${method}`));
      }, timeoutMs);
      pending.set(id, { resolve, reject, timer });
      try {
        ws.send(JSON.stringify({ id, method, params }));
      } catch (err) {
        clearTimeout(timer);
        pending.delete(id);
        reject(err);
      }
    });
  }

  function onEvent(method, fn) {
    if (!listeners.has(method)) listeners.set(method, new Set());
    listeners.get(method).add(fn);
    return () => listeners.get(method)?.delete(fn);
  }

  async function attachToPageTarget(target) {
    activeTargetId = target.id;
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    ws = socket;
    await new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error('Timed out opening CDP WebSocket (5000ms)'));
      }, 5_000);
      socket.addEventListener('open', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve();
      }, { once: true });
      socket.addEventListener('error', (ev) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(new Error(`CDP WebSocket open error: ${ev?.message || 'connection failed'}`));
      }, { once: true });
    });

    socket.addEventListener('close', (ev) => {
      if (ws === socket) ws = null;
      rejectAllPending(`CDP WebSocket closed (code=${ev.code ?? 'unknown'}, reason=${ev.reason || 'none'})`);
    });
    socket.addEventListener('error', () => {
      if (ws === socket) ws = null;
      rejectAllPending('CDP WebSocket error');
    });

    socket.addEventListener('message', (ev) => {
      let msg;
      try {
        msg = JSON.parse(String(ev.data));
      } catch {
        return;
      }
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject, timer } = pending.get(msg.id);
        clearTimeout(timer);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
        else resolve(msg.result);
      } else if (msg.method) {
        handleCdpEvent(msg.method, msg.params);
      }
    });

    try {
      await send('Page.enable', {}, 6_000);
      await send('Runtime.enable', {}, 8_000);
      await send('DOM.enable', {}, 8_000);
      await send('Network.enable', {}, 8_000);
      await send('Log.enable', {}, 8_000);
      await send('Page.addScriptToEvaluateOnNewDocument', { source: TELEMETRY_PRELOAD_SCRIPT }, 8_000);
    } catch (err) {
      try { socket.close(); } catch {}
      if (ws === socket) ws = null;
      throw err;
    }
  }

  async function attachFirstAvailableTarget() {
    await sleep(200);
    let initialTarget = null;
    for (let i = 0; i < 30; i++) {
      const list = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`, { signal: AbortSignal.timeout(3_000) })).json();
      initialTarget =
        list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl && !String(t.url || '').startsWith('edge://')) ||
        list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (initialTarget) break;
      await sleep(100);
    }
    if (!initialTarget) throw new Error('No initial CDP page target found');
    await attachToPageTarget(initialTarget);
  }

  async function bootEdgeWithRetries(maxAttempts = 3) {
    for (let bootAttempt = 1; bootAttempt <= maxAttempts; bootAttempt++) {
      let attemptDir = null;
      try {
        attemptDir = await spawnEdge();
        await attachFirstAvailableTarget();
        return;
      } catch (err) {
        rejectAllPending(`Edge boot attempt ${bootAttempt} failed: ${err.message}`);
        try { ws?.close(); } catch {}
        ws = null;
        await killEdgeProc(proc);
        proc = null;
        if (attemptDir) await cleanupUserDataDir(attemptDir);
        if (bootAttempt === maxAttempts) {
          for (const d of [...createdUserDataDirs]) {
            await cleanupUserDataDir(d);
          }
          throw err;
        }
        await sleep(350);
      }
    }
  }

  await bootEdgeWithRetries(3);

  let lastViewportArgs = null;

  async function relaunchBrowser() {
    rejectAllPending('Browser relaunched');
    listeners.clear();
    try { ws?.close(); } catch {}
    ws = null;
    clearDiagnostics();
    await killEdgeProc(proc);
    proc = null;
    for (const d of [...createdUserDataDirs]) {
      await cleanupUserDataDir(d);
    }
    await sleep(200);
    await bootEdgeWithRetries(3);
    if (lastViewportArgs) {
      await setViewport(lastViewportArgs.w, lastViewportArgs.h, lastViewportArgs.opts);
    }
  }

  async function openFreshTab() {
    const oldTargetId = activeTargetId;
    rejectAllPending('Tab recycled via openFreshTab()');
    listeners.clear();
    try { ws?.close(); } catch {}
    ws = null;
    clearDiagnostics();

    try {
      const resp = await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`, {
        method: 'PUT',
        signal: AbortSignal.timeout(5_000),
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} creating fresh CDP tab`);
      }
      const target = await resp.json();
      if (!target || !target.webSocketDebuggerUrl) {
        throw new Error('Failed to open fresh CDP page tab');
      }
      if (oldTargetId) {
        await fetch(`http://127.0.0.1:${cdpPort}/json/close/${oldTargetId}`, {
          signal: AbortSignal.timeout(3_000),
        }).catch(() => {});
        await sleep(100);
      }
      await attachToPageTarget(target);
      if (lastViewportArgs) {
        await setViewport(lastViewportArgs.w, lastViewportArgs.h, lastViewportArgs.opts);
      }
    } catch {
      await relaunchBrowser();
    }
  }

  async function evalJs(expression, awaitPromise = true, timeoutMs = cdpTimeoutMs) {
    let res;
    try {
      res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise,
      }, timeoutMs);
    } catch (err) {
      if (/timed out/i.test(String(err?.message || ''))) {
        try { ws?.close(); } catch {}
        ws = null;
      }
      throw err;
    }
    if (res.exceptionDetails) {
      throw new Error(
        `Page eval exception: ${res.exceptionDetails.exception?.description || res.exceptionDetails.text}`
      );
    }
    return res.result?.value;
  }

  async function evalFn(fn, ...args) {
    const serializedArgs = args.map((a) => JSON.stringify(a)).join(',');
    return evalJs(`(${fn.toString()})(${serializedArgs})`, true);
  }

  async function waitFor(predicateJsOrFn, argOrTimeout = 15_000, maybeTimeoutMs = 15_000, maybePollMs = 120) {
    const isFn = typeof predicateJsOrFn === 'function';
    const timeoutMs = isFn ? maybeTimeoutMs : argOrTimeout;
    const pollMs = isFn ? maybePollMs : 120;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const val = isFn
        ? await evalFn(predicateJsOrFn, argOrTimeout)
        : await evalJs(`Boolean(${predicateJsOrFn})`, true);
      if (val) return val;
      await sleep(pollMs);
    }
    return false;
  }

  async function setViewport(w, h, opts = {}) {
    const { mobile = w <= 500, dpr = 1 } = opts;
    lastViewportArgs = { w, h, opts: { mobile, dpr } };
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: dpr,
      mobile,
      screenWidth: w,
      screenHeight: h,
      screenOrientation: h >= w
        ? { type: 'portraitPrimary', angle: 0 }
        : { type: 'landscapePrimary', angle: 90 },
    });
    await send('Emulation.setTouchEmulationEnabled', {
      enabled: mobile,
      maxTouchPoints: mobile ? 5 : 1,
    });
  }

  function appendQueryFlag(rawUrl, key, value) {
    const u = new URL(rawUrl);
    if (!u.searchParams.has(key)) u.searchParams.set(key, value);
    return u.toString();
  }

  async function loadPageAndWait(targetUrl) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const domReadyPromise = new Promise((resolve) => {
        const off = onEvent('Page.domContentEventFired', () => {
          off();
          resolve();
        });
        setTimeout(() => {
          off();
          resolve();
        }, 4_000);
      });
      try {
        await send('Page.navigate', { url: targetUrl }, 45_000);
        await domReadyPromise;
        return;
      } catch (err) {
        if (attempt === 1 && /timed out|socket not open/i.test(String(err?.message || ''))) {
          await relaunchBrowser();
          continue;
        }
        try { ws?.close(); } catch {}
        ws = null;
        throw err;
      }
    }
  }

  async function navigate(url = BASE_URL_DEFAULT, { clearStorage = true, nosw = true } = {}) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      await openFreshTab();
    }
    const targetUrl = nosw ? appendQueryFlag(url, 'nosw', '1') : url;
    clearDiagnostics();

    let currentHref = 'about:blank';
    try {
      currentHref = await evalJs('window.location.href', false, 5_000);
    } catch {
      await relaunchBrowser();
    }
    let sameOrigin = false;
    try {
      sameOrigin = new URL(currentHref).origin === new URL(targetUrl).origin;
    } catch {}

    if (clearStorage && sameOrigin) {
      await evalJs('try { localStorage.clear(); sessionStorage.clear(); } catch {}', false);
    }

    await loadPageAndWait(targetUrl);

    if (clearStorage && !sameOrigin) {
      await evalJs('try { localStorage.clear(); sessionStorage.clear(); } catch {}', false);
      clearDiagnostics();
      const reloadReady = new Promise((resolve) => {
        const off = onEvent('Page.domContentEventFired', () => {
          off();
          resolve();
        });
        setTimeout(() => {
          off();
          resolve();
        }, 4_000);
      });
      await send('Page.reload', { ignoreCache: true }, 45_000);
      await reloadReady;
    }

    let ready = await waitFor(
      'location.href.startsWith("chrome-error://") ? "CHROME_ERROR" : Boolean(document.querySelector("#canvas-root canvas") && window.__WS_V7__ && typeof window.__WS_V7__.getTelemetry === "function")',
      25_000,
    );
    if (ready === 'CHROME_ERROR' || !ready) {
      if (ready === 'CHROME_ERROR') {
        await sleep(1_500);
        clearDiagnostics();
      } else {
        await relaunchBrowser();
      }
      await loadPageAndWait(targetUrl);
      if (clearStorage) {
        await evalJs('try { localStorage.clear(); sessionStorage.clear(); } catch {}', false);
        clearDiagnostics();
        const reloadReady2 = new Promise((resolve) => {
          const off = onEvent('Page.domContentEventFired', () => {
            off();
            resolve();
          });
          setTimeout(() => {
            off();
            resolve();
          }, 4_000);
        });
        await send('Page.reload', { ignoreCache: true }, 45_000);
        await reloadReady2;
      }
      ready = await waitFor(
        'Boolean(document.querySelector("#canvas-root canvas") && window.__WS_V7__ && typeof window.__WS_V7__.getTelemetry === "function")',
        30_000,
      );
    }
    if (!ready) {
      let domSnap = null;
      try {
        domSnap = await evalJs('({href:location.href, readyState:document.readyState, hasRoot:!!document.querySelector("#canvas-root"), hasCanvas:!!document.querySelector("#canvas-root canvas"), hasWS:!!window.__WS_V7__, bodyLen:(document.body?.innerText||"").length})', false, 5_000);
      } catch {}
      throw new Error(`Timed out waiting for #canvas-root canvas and window.__WS_V7__ on ${targetUrl} (dom=${JSON.stringify(domSnap)}, diag=${JSON.stringify(getDiagnostics())})`);
    }
    await sleep(180);
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

  async function touchDrag(x1, y1, x2, y2, steps = 10, stepDelayMs = 20) {
    await send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: x1, y: y1, radiusX: 12, radiusY: 12, force: 1, id: 1 }],
    });
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      await sleep(stepDelayMs);
      await send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, radiusX: 12, radiusY: 12, force: 1, id: 1 }],
      });
    }
    await sleep(30);
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }

  async function pressKey(key) {
    const map = {
      Escape: { code: 'Escape', keyCode: 27 },
      Space: { key: ' ', code: 'Space', keyCode: 32 },
      Enter: { code: 'Enter', keyCode: 13 },
    };
    const info = map[key] || { key, code: key, keyCode: key.charCodeAt(0) };
    await send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: info.key ?? key,
      code: info.code ?? key,
      windowsVirtualKeyCode: info.keyCode ?? 0,
      nativeVirtualKeyCode: info.keyCode ?? 0,
    });
    await sleep(25);
    await send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: info.key ?? key,
      code: info.code ?? key,
      windowsVirtualKeyCode: info.keyCode ?? 0,
      nativeVirtualKeyCode: info.keyCode ?? 0,
    });
  }

  async function clickSelector(selector, { timeoutMs = 8000 } = {}) {
    const found = await waitFor(
      `(function(sel){
        const el = document.querySelector(sel);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        const st = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none';
      })(${JSON.stringify(selector)})`,
      timeoutMs,
    );
    if (!found) throw new Error(`Visible selector not found for click: ${selector}`);
    const pt = await evalJs(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
    })()`);
    if (!pt || pt.w <= 0 || pt.h <= 0) {
      throw new Error(`Selector has zero bounding box: ${selector}`);
    }
    await mouseClick(pt.x, pt.y);
    return pt;
  }

  async function clickByText(regex, { selector = 'button, [role="button"]', timeoutMs = 8000 } = {}) {
    const source = regex instanceof RegExp ? regex.source : String(regex);
    const flags = regex instanceof RegExp ? regex.flags.replace('g', '') : 'i';
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const pt = await evalJs(`(() => {
        const re = new RegExp(${JSON.stringify(source)}, ${JSON.stringify(flags)});
        const nodes = Array.from(document.querySelectorAll(${JSON.stringify(selector)}));
        for (const el of nodes) {
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) continue;
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          const txt = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim();
          if (re.test(txt)) {
            el.scrollIntoView({ block: 'center', inline: 'center' });
            const r2 = el.getBoundingClientRect();
            return { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2, text: txt };
          }
        }
        return null;
      })()`);
      if (pt) {
        await mouseClick(pt.x, pt.y);
        return pt;
      }
      await sleep(120);
    }
    throw new Error(`No visible element matching ${regex} under selector "${selector}"`);
  }

  async function dismissPreBoardOverlays({ maxSteps = 12 } = {}) {
    for (let i = 0; i < maxSteps; i++) {
      const action = await evalJs(`(() => {
        const vis = (el) => {
          if (!el) return false;
          const r = el.getBoundingClientRect();
          const st = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && st.display !== 'none' && st.visibility !== 'hidden' && Number(st.opacity) > 0;
        };
        const tunein = document.querySelector('.ws66-tunein-curtain');
        if (vis(tunein)) return { type: 'tunein' };
        const coldSkip = document.querySelector('button[data-action="skip-cold-open"]');
        if (vis(coldSkip)) return { type: 'selector', selector: 'button[data-action="skip-cold-open"]' };
        const introSkip = document.querySelector('button[data-action="skip-show-intro"]');
        if (vis(introSkip)) return { type: 'selector', selector: 'button[data-action="skip-show-intro"]' };
        const curtain = document.querySelector('.ws7-curtain-raiser');
        if (vis(curtain)) return { type: 'curtain' };
        const coach = document.querySelector('.ws8-coach-backdrop button[data-coach-confirm="true"]');
        if (vis(coach)) return { type: 'selector', selector: '.ws8-coach-backdrop button[data-coach-confirm="true"]' };
        return null;
      })()`);

      if (!action) break;
      if (action.type === 'tunein') {
        await pressKey('Space');
        await sleep(180);
      } else if (action.type === 'curtain') {
        await sleep(240);
        await clickSelector('.ws7-curtain-raiser').catch(() => {});
        await sleep(250);
      } else if (action.type === 'selector') {
        await clickSelector(action.selector).catch(() => {});
        await sleep(200);
      }
    }
  }

  async function clickBoardTileFromTelemetry() {
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      await dismissPreBoardOverlays({ maxSteps: 4 });
      const info = await evalJs(`(() => {
        const t = window.__WS_V7__?.getTelemetry?.();
        if (!t) return null;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const pts = (t.tileScreenPoints || []).filter(p =>
          (p.state === 'OPEN' || p.state === 'BLITZ_SURVIVOR') &&
          p.clientX > 4 && p.clientX < vw - 4 && p.clientY > 4 && p.clientY < vh - 4
        );
        return { phase: t.phase, pts };
      })()`);

      if (info && (info.phase === 'QUESTION_OPEN' || info.phase === 'CEREMONY')) {
        return { clickedIndex: null, phase: info.phase, skipped: true };
      }
      if (!info || info.phase !== 'BOARD_SELECT') {
        await sleep(200);
        continue;
      }

      if (info && info.pts.length > 0) {
        for (const pt of info.pts) {
          await mouseClick(pt.clientX, pt.clientY);
          await sleep(160);
          await dismissPreBoardOverlays({ maxSteps: 3 });
          const nextPhase = await evalJs('window.__WS_V7__?.getTelemetry?.()?.phase');
          if (nextPhase && nextPhase !== 'BOARD_SELECT') {
            return { clickedIndex: pt.index, phase: nextPhase, point: pt };
          }
        }
      }
      await sleep(180);
    }
    throw new Error('clickBoardTileFromTelemetry could not transition out of BOARD_SELECT');
  }

  async function answerCurrentClue({
    waitMs = 420,
    choiceIdx = 0,
    oracle = null,
    wantCorrect = true,
    vipAction = 'CALL_BLUFF',
  } = {}) {
    await dismissPreBoardOverlays({ maxSteps: 4 });
    let clearedGate = false;
    let lastToyId = null;
    let lastChoiceIdx = null;
    let lastMode = null;

    for (let step = 0; step < 16; step++) {
      // Wait up to 4.5s on initial step (or 2.5s between sub-steps) for an active prompt or phase exit
      const waitDeadline = Date.now() + (step === 0 ? 6_000 : 2_800);
      let state = null;
      while (Date.now() < waitDeadline) {
        state = await evalJs(`(() => {
          const tel = window.__WS_V7__?.getTelemetry?.() || {};
          const vis = (el) => {
            if (!el) return false;
            const st = getComputedStyle(el);
            if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          };
          const vipCard = document.querySelector('.ws9-vip-bluff-card');
          if (vis(vipCard)) return { kind: 'VIP_BLUFF', phase: tel.phase };
          const curtain = document.querySelector('.wst7-curtain-backdrop');
          if (vis(curtain)) return { kind: 'MYSTERY_CURTAIN', phase: tel.phase };
          const wheel = document.querySelector('.wst7-wheel-stage');
          if (vis(wheel)) return { kind: 'BIG_WHEEL', phase: tel.phase };
          const hotMic = document.querySelector('[data-modal="hot-mic-privacy-handoff-v9"]');
          if (vis(hotMic)) return { kind: 'HOT_MIC_HANDOFF', phase: tel.phase };
          const stage = document.querySelector('.ws7-question-stage:not(.ws7-hidden)');
          const mount = stage ? stage.querySelector('#ws7-toy-mount') : null;
          if (vis(stage) && mount) {
            const toyRoot = mount.querySelector('[data-toy-id]');
            const stemEl = stage.querySelector('.ws7-balanced-copy, .ws7-clue-stem');
            const choiceNodes = Array.from(mount.querySelectorAll('[data-choice-idx]'));
            const choices = choiceNodes.map(n => ({
              idx: Number(n.getAttribute('data-choice-idx')),
              text: (n.querySelector('.ws7-pad-label, .ws7-choice-copy')?.innerText || n.innerText || '').trim(),
              disabled: Boolean(n.disabled),
            }));
            return {
              kind: 'TOY',
              phase: tel.phase,
              toyId: toyRoot?.getAttribute('data-toy-id') || null,
              stem: stemEl ? (stemEl.innerText || '').trim() : '',
              choices,
            };
          }
          return { kind: 'NONE', phase: tel.phase };
        })()`);
        if (state && (state.kind !== 'NONE' || (step > 0 && state.phase !== 'QUESTION_OPEN'))) {
          break;
        }
        await sleep(120);
      }

      if (!state || state.kind === 'NONE') {
        if (step > 0 && state?.phase !== 'QUESTION_OPEN') {
          return { mode: lastMode || 'RESOLVED', toyId: lastToyId, choiceIdx: lastChoiceIdx, phase: state?.phase };
        }
        const diag = await evalJs(`(() => ({
          phase: window.__WS_V7__?.getTelemetry?.()?.phase,
          visibleBtns: Array.from(document.querySelectorAll('#ui-root button:not([disabled])')).map(b => (b.innerText || '').trim()).slice(0, 8),
          qStage: Boolean(document.querySelector('.ws7-question-stage')),
          qStageHidden: document.querySelector('.ws7-question-stage')?.classList?.contains('ws7-hidden') ?? null,
        }))()`).catch(() => null);
        throw new Error(`Question stage did not become visible within 6s (diag=${JSON.stringify(diag)})`);
      }

      if (state.kind === 'VIP_BLUFF') {
        lastMode = 'VIP_BLUFF';
        const btnSel = vipAction === 'TRUST'
          ? '.ws9-vip-bluff-card button.ws9-btn-peacock:not([disabled])'
          : '.ws9-vip-bluff-card button.ws9-btn-cerise:not([disabled])';
        await clickSelector(btnSel, { timeoutMs: 3_000 }).catch(async () => {
          await clickByText(vipAction === 'TRUST' ? /TRUST/i : /CALL BLUFF/i, { timeoutMs: 3_000 });
        });
        await waitFor('!document.querySelector(".ws9-vip-bluff-card") || window.__WS_V7__?.getTelemetry?.()?.phase !== "QUESTION_OPEN"', 6_000);
        return { mode: 'VIP_BLUFF', vipAction };
      }

      if (state.kind === 'HOT_MIC_HANDOFF') {
        await clickSelector('button[data-action="hotmic-handoff-ready"]', { timeoutMs: 4_000 }).catch(async () => {
          await clickByText(/READY|GO|START/i, { timeoutMs: 3_000 });
        });
        await sleep(250);
        continue;
      }

      if (state.kind === 'MYSTERY_CURTAIN') {
        await sleep(240);
        await clickSelector('.wst7-curtain-arch-btn[data-curtain="1"]:not([disabled])', { timeoutMs: 3_000 }).catch(async () => {
          await clickSelector('.wst7-curtain-arch-btn:not([disabled])', { timeoutMs: 3_000 });
        });
        await waitFor('!document.querySelector(".wst7-curtain-backdrop")', 5_000);
        await sleep(200);
        continue;
      }

      if (state.kind === 'BIG_WHEEL') {
        await sleep(240);
        await clickSelector('button[data-action="spin-big-wheel"]:not([disabled])', { timeoutMs: 3_000 }).catch(async () => {
          await clickSelector('.wst7-wheel-stage', { timeoutMs: 3_000 });
        });
        await waitFor('!document.querySelector(".wst7-wheel-stage")', 8_000);
        await sleep(200);
        continue;
      }

      // state.kind === 'TOY'
      if (!clearedGate) {
        // Clear both 220ms toy-mount arming gate and 340ms trailing-tap click gate
        await sleep(Math.max(420, waitMs));
        clearedGate = true;
      }

      const toyId = state.toyId || 'TOY_01_KNIFE_SWITCH';
      lastToyId = toyId;

      let resolvedChoiceIdx = choiceIdx;
      if (oracle && typeof oracle.pickChoiceIdx === 'function' && state.choices.length > 0) {
        const picked = oracle.pickChoiceIdx(state.stem, state.choices.map((c) => c.text), wantCorrect);
        if (typeof picked === 'number' && picked >= 0) {
          resolvedChoiceIdx = picked;
        }
      }
      lastChoiceIdx = resolvedChoiceIdx;

      if (toyId === 'TOY_06_FUSE_WIRE_SNIPPER') {
        lastMode = 'TOY_06_FUSE';
        // If we want wrong answer and oracle picked right wire, cut it immediately to blow fuse!
        if (!wantCorrect && oracle && typeof oracle.pickChoiceIdx === 'function') {
          const rightIdx = oracle.pickChoiceIdx(state.stem, state.choices.map((c) => c.text), true);
          const rightWireSel = `#ws7-toy-mount button.ws7-fuse-wire-btn[data-choice-idx="${rightIdx}"]:not([disabled])`;
          if (await evalJs(`Boolean(document.querySelector(${JSON.stringify(rightWireSel)}))`)) {
            await clickSelector(rightWireSel);
            await sleep(450);
            continue;
          }
        }
        // Check if BANK CASH! is already armed and we want to bank safely
        const bankArmed = await evalJs('Boolean(document.querySelector("#ws7-toy-mount button.ws7-bailout-latch.is-armed:not([disabled])"))');
        if (bankArmed) {
          await clickSelector('#ws7-toy-mount button.ws7-bailout-latch.is-armed:not([disabled])');
          await sleep(500);
          continue;
        }
        // Cut a safe (wrong) wire if oracle knows rightIdx, else first un-snipped wire
        const wireTarget = await evalJs(`(() => {
          const btns = Array.from(document.querySelectorAll('#ws7-toy-mount button.ws7-fuse-wire-btn:not([disabled]):not(.is-snipped)'));
          if (btns.length === 0) return null;
          const avoid = ${JSON.stringify(wantCorrect && oracle ? oracle.pickChoiceIdx(state.stem, state.choices.map((c) => c.text), true) : -1)};
          const safe = btns.find(b => Number(b.dataset.choiceIdx) !== avoid) || btns[0];
          return Number(safe.dataset.choiceIdx);
        })()`);
        if (wireTarget !== null) {
          await clickSelector(`#ws7-toy-mount button.ws7-fuse-wire-btn[data-choice-idx="${wireTarget}"]:not([disabled])`);
          await sleep(320);
          continue;
        }
      } else if (toyId === 'TOY_04_BALANCE_SCALE') {
        lastMode = 'TOY_04_SCALE';
        const lockPt = await evalJs(`(() => {
          const lockBtn = document.querySelector('#ws7-toy-mount button[data-action="balance-lock"]:not([disabled])');
          if (!lockBtn) return null;
          lockBtn.scrollIntoView({ block: 'center', inline: 'center' });
          const r = lockBtn.getBoundingClientRect();
          return r.width > 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
        })()`);
        if (lockPt) {
          await mouseClick(lockPt.x, lockPt.y);
          await sleep(480);
          continue;
        }
        const weightPt = await evalJs(`(() => {
          const btn = document.querySelector('#ws7-toy-mount button.ws7-brass-weight:not([disabled]):not(.is-on-pan)');
          if (!btn) return null;
          btn.scrollIntoView({ block: 'center', inline: 'center' });
          const r = btn.getBoundingClientRect();
          return r.width > 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
        })()`);
        if (weightPt) {
          await mouseClick(weightPt.x, weightPt.y);
          await sleep(320);
          continue;
        }
      } else if (toyId === 'TOY_05_RELIEF_GLOBE_3D') {
        lastMode = 'TOY_05_GLOBE';
        const globePt = await evalJs(`(() => {
          const status = (document.querySelector('#ws7-toy-mount .ws7-globe-status-pill')?.innerText || '').trim();
          const c = document.querySelector('#ws7-toy-mount .ws7-globe-cradle-frame canvas') || document.querySelector('#ws7-toy-mount canvas');
          if (!c) return null;
          if (c.style.cursor === 'default' || /LOCKING|BULLSEYE|CLOSE HIT|REGIONAL HIT|OFF TARGET/i.test(status)) {
            return null;
          }
          c.scrollIntoView({ block: 'center', inline: 'center' });
          const r = c.getBoundingClientRect();
          return r.width > 0 ? { x: r.left + r.width * 0.52, y: r.top + r.height * 0.48 } : null;
        })()`);
        if (globePt) {
          await mouseClick(globePt.x, globePt.y);
          await sleep(850);
          continue;
        }
      } else if (toyId === 'TOY_07_MAIL_SORTER') {
        lastMode = 'TOY_07_SORTER';
        const hasChute0 = await evalJs('Boolean(document.querySelector("#ws7-toy-mount button.ws7-chute-btn[data-chute=\\"0\\"]:not([disabled])"))');
        const hasAnyChute = hasChute0 || await evalJs('Boolean(document.querySelector("#ws7-toy-mount button.ws7-chute-btn:not([disabled])"))');
        if (hasChute0) {
          await clickSelector('#ws7-toy-mount button.ws7-chute-btn[data-chute="0"]:not([disabled])', { timeoutMs: 2_000 });
          await sleep(320);
          continue;
        } else if (hasAnyChute) {
          await clickSelector('#ws7-toy-mount button.ws7-chute-btn:not([disabled])', { timeoutMs: 2_000 });
          await sleep(320);
          continue;
        }
      } else if (toyId === 'TOY_08_CHRONOLOGY_RAIL') {
        lastMode = 'TOY_08_CHRONOLOGY';
        const hasPlaque = await evalJs('Boolean(document.querySelector("#ws7-toy-mount button.ws7-plaque-btn:not([disabled]):not(.is-placed)"))');
        if (hasPlaque) {
          await clickSelector('#ws7-toy-mount button.ws7-plaque-btn:not([disabled]):not(.is-placed)', { timeoutMs: 2_000 });
          await sleep(500);
          continue;
        }
      } else if (toyId === 'TOY_09_SWITCHBOARD_PATCHBAY') {
        lastMode = 'TOY_09_PATCHBAY';
        const jackIdx = step % 4;
        const jackSel = `#ws7-toy-mount button.ws7-jack-socket[data-jack-idx="${jackIdx}"]:not([disabled])`;
        const hasJack = await evalJs(`Boolean(document.querySelector(${JSON.stringify(jackSel)}))`);
        if (hasJack) {
          await clickSelector(jackSel, { timeoutMs: 2_000 });
          await sleep(320);
          continue;
        }
        const anyJack = await evalJs('Boolean(document.querySelector("#ws7-toy-mount button.ws7-jack-socket:not([disabled])"))');
        if (anyJack) {
          await clickSelector('#ws7-toy-mount button.ws7-jack-socket:not([disabled])', { timeoutMs: 2_000 });
          await sleep(320);
          continue;
        }
      } else if (toyId === 'TOY_12_CONSPIRACY_LASSO') {
        lastMode = 'TOY_12_LASSO';
        const hasPin = await evalJs('Boolean(document.querySelector("#ws7-toy-mount .ws7-pin-card:not([disabled]):not(.is-lassoed)"))');
        if (hasPin) {
          await clickSelector('#ws7-toy-mount .ws7-pin-card:not([disabled]):not(.is-lassoed)', { timeoutMs: 2_000 });
          await sleep(480);
          continue;
        }
      } else if (toyId === 'TOY_13_CYANOTYPE_LOUPE') {
        const legendSel = `#ws7-toy-mount button.ws7-cyano-legend-btn[data-choice-idx="${resolvedChoiceIdx}"]:not([disabled])`;
        const hasLegend = await evalJs(`Boolean(document.querySelector(${JSON.stringify(legendSel)}))`);
        if (hasLegend) {
          lastMode = 'TOY_13_LEGEND';
          await clickSelector(legendSel);
          await sleep(500);
          continue;
        }
        const zonePt = await evalJs(`(() => {
          const z = document.querySelector('#ws7-toy-mount [data-zone-idx]');
          if (!z) return null;
          const r = z.getBoundingClientRect();
          return r.width > 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
        })()`);
        if (zonePt) {
          lastMode = 'TOY_13_ZONE';
          await mouseClick(zonePt.x, zonePt.y);
          await sleep(500);
          continue;
        }
      }

      // Classic 4-choice & single-step toys (TOY_01, TOY_02, TOY_11, etc.)
      const isSingleClickToy =
        toyId === 'TOY_01_KNIFE_SWITCH' ||
        toyId === 'TOY_02_CONFIDENCE_PNEUMATIC' ||
        toyId === 'TOY_11_MISSING_VOWELS_WHEEL';
      const btnChoiceSelector = `#ws7-toy-mount button[data-choice-idx="${resolvedChoiceIdx}"]:not([disabled])`;
      const anyBtnChoiceSelector = `#ws7-toy-mount [data-choice-idx="${resolvedChoiceIdx}"]:not([disabled])`;
      const hasBtnChoice = await evalJs(`Boolean(document.querySelector(${JSON.stringify(btnChoiceSelector)}))`);
      const choiceSelector = hasBtnChoice ? btnChoiceSelector : anyBtnChoiceSelector;
      const hasChoice = hasBtnChoice || (await evalJs(`Boolean(document.querySelector(${JSON.stringify(anyBtnChoiceSelector)}))`));
      if (hasChoice) {
        lastMode = 'CHOICE_BUTTON';
        await clickSelector(choiceSelector);
        if (isSingleClickToy) {
          await waitFor(
            `window.__WS_V7__?.getTelemetry?.()?.phase !== "QUESTION_OPEN" || (document.querySelector(".ws7-question-stage .ws7-balanced-copy")?.innerText || "").trim() !== ${JSON.stringify(state.stem)}`,
            2_000,
          );
          return { mode: 'CHOICE_BUTTON', toyId, choiceIdx: resolvedChoiceIdx };
        }
        await sleep(520);
        const nowPhase = await evalJs('window.__WS_V7__?.getTelemetry?.()?.phase');
        if (nowPhase && nowPhase !== 'QUESTION_OPEN') {
          return { mode: 'CHOICE_BUTTON', toyId, choiceIdx: resolvedChoiceIdx };
        }
        continue;
      }

      const anyButtonChoice = await evalJs('Boolean(document.querySelector("#ws7-toy-mount button[data-choice-idx]:not([disabled])"))');
      const fallbackChoiceSel = anyButtonChoice
        ? '#ws7-toy-mount button[data-choice-idx]:not([disabled])'
        : '#ws7-toy-mount [data-choice-idx]:not([disabled])';
      const anyChoice = anyButtonChoice || (await evalJs('Boolean(document.querySelector("#ws7-toy-mount [data-choice-idx]:not([disabled])"))'));
      if (anyChoice) {
        lastMode = 'CHOICE_BUTTON_FALLBACK';
        await clickSelector(fallbackChoiceSel);
        if (isSingleClickToy) {
          await waitFor(
            `window.__WS_V7__?.getTelemetry?.()?.phase !== "QUESTION_OPEN" || (document.querySelector(".ws7-question-stage .ws7-balanced-copy")?.innerText || "").trim() !== ${JSON.stringify(state.stem)}`,
            2_000,
          );
          return { mode: 'CHOICE_BUTTON_FALLBACK', toyId, choiceIdx: resolvedChoiceIdx };
        }
        await sleep(520);
        const nowPhase = await evalJs('window.__WS_V7__?.getTelemetry?.()?.phase');
        if (nowPhase && nowPhase !== 'QUESTION_OPEN') {
          return { mode: 'CHOICE_BUTTON_FALLBACK', toyId, choiceIdx: resolvedChoiceIdx };
        }
        continue;
      }

      const lockState = await evalJs(`(() => {
        const anyEnabled = Boolean(document.querySelector('#ws7-toy-mount button:not([disabled]), #ws7-toy-mount [data-choice-idx]:not([disabled]), #ws7-toy-mount [data-zone-idx]'));
        const chronoLocked = Boolean(document.querySelector('#ws7-toy-mount .ws7-sleeper-slot.is-reveal-correct, #ws7-toy-mount .ws7-sleeper-slot.is-reveal-wrong')) ||
          (document.querySelectorAll('#ws7-toy-mount button.ws7-plaque-btn').length > 0 &&
           !document.querySelector('#ws7-toy-mount button.ws7-plaque-btn:not([disabled]):not(.is-placed)'));
        const globeStatus = (document.querySelector('#ws7-toy-mount .ws7-globe-status-pill')?.innerText || '').trim();
        const globeCanvas = document.querySelector('#ws7-toy-mount .ws7-globe-cradle-frame canvas') || document.querySelector('#ws7-toy-mount canvas');
        const globeLocked = Boolean(globeCanvas && (globeCanvas.style.cursor === 'default' || /LOCKING|BULLSEYE|CLOSE HIT|REGIONAL HIT|OFF TARGET/i.test(globeStatus)));
        const lassoLocked = document.querySelectorAll('#ws7-toy-mount .ws7-pin-card').length > 0 &&
          !document.querySelector('#ws7-toy-mount .ws7-pin-card:not([disabled]):not(.is-lassoed)');
        return { anyEnabled, revealLocked: chronoLocked || globeLocked || lassoLocked };
      })()`);
      if ((!lockState.anyEnabled || lockState.revealLocked) && lastMode) {
        // Multi-step contraption already locked in for its 440ms–900ms reveal dwell
        await waitFor('window.__WS_V7__?.getTelemetry?.()?.phase !== "QUESTION_OPEN"', 3_500);
        return { mode: lastMode, toyId, choiceIdx: lastChoiceIdx };
      }

      // Showcase non-choice contraption fallback: click lock/submit/confirm button inside toy mount
      const showcasePt = await evalJs(`(() => {
        const mount = document.querySelector('#ws7-toy-mount');
        if (!mount) return null;
        const btns = Array.from(mount.querySelectorAll('button:not([disabled])'));
        const preferred = btns.find(b => /LOCK|SUBMIT|CONFIRM|DROP|WEIGH|SPIN|DIAL|FIRE|SEND|CHECK|ANSWER|BANK/i.test(b.innerText || '')) || btns[btns.length - 1];
        if (!preferred) return null;
        preferred.scrollIntoView({ block: 'center', inline: 'center' });
        const r = preferred.getBoundingClientRect();
        return r.width > 0 && r.height > 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2, text: preferred.innerText } : null;
      })()`);
      if (showcasePt) {
        lastMode = 'SHOWCASE_ACTION';
        await mouseClick(showcasePt.x, showcasePt.y);
        await sleep(550);
        const nowPhase = await evalJs('window.__WS_V7__?.getTelemetry?.()?.phase');
        if (nowPhase && nowPhase !== 'QUESTION_OPEN') {
          return { mode: 'SHOWCASE_ACTION', toyId, label: showcasePt.text };
        }
        continue;
      }

      throw new Error(`No interactive answer control found inside #ws7-toy-mount (toyId=${toyId})`);
    }

    return { mode: lastMode || 'MULTI_STEP_TOY', toyId: lastToyId, choiceIdx: lastChoiceIdx };
  }

  async function assertWebGL2() {
    const info = await evalJs(`(() => {
      const canvas = document.querySelector('#canvas-root canvas');
      const rect = canvas ? canvas.getBoundingClientRect() : null;
      const tel = window.__WS_V7__?.getTelemetry?.();
      const s = window.__wsV9Stats || {};
      return {
        hasCanvas: Boolean(canvas),
        canvasW: rect ? rect.width : 0,
        canvasH: rect ? rect.height : 0,
        telIsWebGL2: Boolean(tel?.engine?.isWebGL2),
        hookIsWebGL2: Boolean(s.isWebGL2),
        webglVersion: s.webglVersion || null,
        webglRenderer: s.webglRenderer || null,
        shaderErrors: s.shaderErrors || [],
        programErrors: s.programErrors || [],
      };
    })()`);

    const ok =
      info.hasCanvas &&
      info.canvasW > 0 &&
      info.canvasH > 0 &&
      (info.telIsWebGL2 || info.hookIsWebGL2) &&
      info.shaderErrors.length === 0 &&
      info.programErrors.length === 0;

    if (!ok) {
      throw new Error(`WebGL2 assertion failed: ${JSON.stringify(info)}`);
    }
    return info;
  }

  async function assertTitleHubLayoutIntegrity() {
    const res = await evalJs(`(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const hubStages = document.querySelectorAll('.ws66-title-stage.ws9-hub-3tier, .ws9-hub-stage');
      const hubHeaders = document.querySelectorAll('.ws9-hub-top-bar, .ws9-hub-header, .ws66-title-stage .ws66-title-top');
      const showroomCard = document.querySelector('.ws9-card-showroom');
      const cardTag = showroomCard ? showroomCard.querySelector('.ws9-card-tag') : null;
      const scPill = showroomCard ? showroomCard.querySelector('.ws9-sc-pill') : null;
      let tagPillOverlap = null;
      if (cardTag && scPill) {
        const ra = cardTag.getBoundingClientRect();
        const rb = scPill.getBoundingClientRect();
        if (ra.width > 0 && rb.width > 0) {
          const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (ox > 0 && oy > 0) {
            tagPillOverlap = { ox: Math.round(ox), oy: Math.round(oy), tagRight: Math.round(ra.right), pillLeft: Math.round(rb.left) };
          }
        }
      }
      const floorBtns = Array.from(document.querySelectorAll('.ws9-floor-btn')).map(b => {
        const r = b.getBoundingClientRect();
        return {
          text: (b.innerText || '').trim(),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          vh,
          inViewport: r.width > 0 && r.height > 0 && r.top >= -1 && r.bottom <= vh + 1,
        };
      });
      const topBarEl = document.querySelector('.ws9-hub-top-bar');
      const floorStripEl = document.querySelector('.ws9-hub-floor-strip');
      const stageEl = hubStages[0] || null;
      const topBarRect = topBarEl ? topBarEl.getBoundingClientRect() : null;
      const floorStripRect = floorStripEl ? floorStripEl.getBoundingClientRect() : null;
      const stageRect = stageEl ? stageEl.getBoundingClientRect() : null;
      const stackHeight = topBarRect && floorStripRect
        ? Math.round(floorStripRect.bottom - topBarRect.top)
        : (stageRect ? Math.round(stageRect.height) : null);
      const desktopVertOverflow = vw >= 1000 ? document.documentElement.scrollHeight > vh + 1 : false;
      const desktopStackTooTall = vw >= 1000 && stackHeight !== null ? stackHeight > 720 : false;
      const marqueeEl = document.querySelector('.ws9-hub-marquee');
      const wordmarkEl = marqueeEl ? marqueeEl.querySelector('.ws66-wordmark') : null;
      const tier1El = document.querySelector('.ws9-hub-tier1');
      const marqueeRect = marqueeEl ? marqueeEl.getBoundingClientRect() : null;
      const tier1Rect = tier1El ? tier1El.getBoundingClientRect() : null;
      const rectOverlap = (a, b) => {
        if (!a || !b || a.width <= 0 || b.width <= 0) return null;
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        return ox > 0 && oy > 0 ? { ox: Math.round(ox), oy: Math.round(oy) } : null;
      };
      const stageWidth = stageRect ? stageRect.width : vw;
      const marqueeMetrics = marqueeEl && marqueeRect ? {
        width: Math.round(marqueeRect.width),
        height: Math.round(marqueeRect.height),
        stageWidth: Math.round(stageWidth),
        widthPctOfHub: Number((marqueeRect.width / Math.max(1, stageWidth)).toFixed(3)),
        scrollWidth: marqueeEl.scrollWidth,
        clientWidth: marqueeEl.clientWidth,
        wordmarkScrollW: wordmarkEl ? wordmarkEl.scrollWidth : null,
        wordmarkClientW: wordmarkEl ? wordmarkEl.clientWidth : null,
        clipped: marqueeEl.scrollWidth > marqueeEl.clientWidth + 1 || (wordmarkEl ? wordmarkEl.scrollWidth > wordmarkEl.clientWidth + 1 : false),
        overlapTopBar: rectOverlap(marqueeRect, topBarRect),
        overlapTier1: rectOverlap(marqueeRect, tier1Rect),
      } : null;
      const marqueeMobileTooNarrow = marqueeMetrics && vw <= 500
        ? (marqueeMetrics.width < 300 || marqueeMetrics.width < stageWidth * 0.82)
        : false;
      const marqueeDesktopTooNarrow = marqueeMetrics && vw >= 1000
        ? marqueeMetrics.width < 560
        : false;
      const minMarqueeHeight =
        vw >= 1400 || (vw <= 500 && vh >= 800) ? 145
        : vw >= 1000 ? 135
        : vw <= 500 ? 90
        : 0;
      const marqueeTooShort = marqueeMetrics && minMarqueeHeight > 0
        ? marqueeMetrics.height < minMarqueeHeight
        : false;
      return {
        vw,
        vh,
        scrollHeight: document.documentElement.scrollHeight,
        stackHeight,
        desktopVertOverflow,
        desktopStackTooTall,
        marqueeMetrics,
        marqueeMobileTooNarrow,
        marqueeDesktopTooNarrow,
        marqueeTooShort,
        hubStageCount: hubStages.length,
        hubHeaderCount: hubHeaders.length,
        hasShowroomCard: Boolean(showroomCard),
        hasTagAndPill: Boolean(cardTag && scPill),
        tagPillOverlap,
        floorBtns,
      };
    })()`);
    const badFloor = res.floorBtns.filter((b) => !b.inViewport);
    if (
      res.hubStageCount !== 1 ||
      res.hubHeaderCount > 1 ||
      res.tagPillOverlap !== null ||
      res.floorBtns.length < 2 ||
      badFloor.length > 0 ||
      res.desktopVertOverflow ||
      res.desktopStackTooTall ||
      !res.marqueeMetrics ||
      res.marqueeMetrics.clipped ||
      res.marqueeMetrics.overlapTopBar !== null ||
      res.marqueeMetrics.overlapTier1 !== null ||
      res.marqueeMobileTooNarrow ||
      res.marqueeDesktopTooNarrow ||
      res.marqueeTooShort
    ) {
      throw new Error(`Title Hub layout integrity violation at ${res.vw}x${res.vh}: ${JSON.stringify(res)}`);
    }
    return res;
  }

  async function assertTopHudZeroOverlap() {
    const res = await evalJs(`(() => {
      const vw = window.innerWidth;
      const wrap = document.querySelector('.ws7-top-bug-wrap');
      if (!wrap) return { missing: true };
      const stWrap = getComputedStyle(wrap);
      if (stWrap.display === 'none' || wrap.classList.contains('ws7-hidden')) {
        return { hidden: true };
      }
      const items = [];
      const addItem = (el, name) => {
        if (!el) return;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        items.push({
          name,
          left: r.left,
          top: r.top,
          right: r.right,
          bottom: r.bottom,
          width: r.width,
          height: r.height,
        });
      };
      addItem(document.querySelector('.ws7-solari-box[data-side="player"]'), 'YOU');
      addItem(document.querySelector('.ws7-turn-pill'), 'ACT/TURN');
      addItem(document.querySelector('.ws7-solari-box[data-side="rival"]'), 'RIVAL');
      addItem(document.querySelector('.ws7-vu-meter'), 'VU_METER');
      for (const btn of document.querySelectorAll('.ws7-bug-actions > button')) {
        const lbl = btn.getAttribute('data-action') || (btn.innerText || '').trim() || 'btn';
        addItem(btn, lbl);
      }

      const clipped = items.filter(it => it.left < -1 || it.right > vw + 1);
      const overlaps = [];
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i];
          const b = items[j];
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 0 && oy > 0) {
            overlaps.push({ a: a.name, b: b.name, overlapX: Number(ox.toFixed(2)), overlapY: Number(oy.toFixed(2)) });
          }
        }
      }

      // Also check medallion vs rival tag inside rival box
      const rivalTag = document.querySelector('.ws7-solari-box[data-side="rival"] .ws7-solari-tag');
      const med = document.querySelector('.ws7-gouache-medallion');
      if (rivalTag && med) {
        const ra = rivalTag.getBoundingClientRect();
        const rb = med.getBoundingClientRect();
        if (ra.width > 0 && rb.width > 0) {
          const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (ox > 0 && oy > 0) {
            overlaps.push({ a: 'RIVAL_TAG', b: 'PORTRAIT_MEDALLION', overlapX: Number(ox.toFixed(2)), overlapY: Number(oy.toFixed(2)) });
          }
        }
      }

      return { vw, itemCount: items.length, clipped, overlaps };
    })()`);
    if (res.missing || res.hidden) {
      throw new Error(`Top HUD not visible for overlap check: ${JSON.stringify(res)}`);
    }
    if (res.clipped.length > 0 || res.overlaps.length > 0) {
      throw new Error(`Top HUD overlap/clipping detected at vw=${res.vw}: ${JSON.stringify(res)}`);
    }
    return res;
  }

  async function assertSignsAndCrowdPlacement({ mobileMode = false } = {}) {
    const res = await evalJs(`(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const tel = window.__WS_V7__?.getTelemetry?.() || {};
      const signsState = window.__WS_V7__?.getStudioSignStates?.() || {};
      const crowdMood = window.__WS_V7__?.getCrowdMood?.() || null;
      const pts = (tel.tileScreenPoints || []).filter(p => p.state !== 'RETRACTED');
      const boardBox = pts.length > 0 ? {
        minX: Math.min(...pts.map(p => p.clientX)),
        maxX: Math.max(...pts.map(p => p.clientX)),
        minY: Math.min(...pts.map(p => p.clientY)),
        maxY: Math.max(...pts.map(p => p.clientY)),
      } : null;

      // Check DOM sign / header / HUD elements vs Tote tile centers
      const topHud = document.querySelector('.ws7-top-bug-wrap');
      const headerOccludingTiles = [];
      if (topHud && getComputedStyle(topHud).display !== 'none' && !topHud.classList.contains('ws7-hidden')) {
        const hr = topHud.getBoundingClientRect();
        for (const p of pts) {
          if (p.clientX >= hr.left && p.clientX <= hr.right && p.clientY >= hr.top && p.clientY <= hr.bottom) {
            headerOccludingTiles.push({ tileIndex: p.index, clientY: p.clientY, hudBottom: Math.round(hr.bottom) });
          }
        }
      }

      // Check optional projected 3D signScreenRects / crowdScreenRects if exposed on telemetry
      const signOverlaps = [];
      const signRects = tel.signScreenRects || tel.studioSignRects || [];
      for (let i = 0; i < signRects.length; i++) {
        for (let j = i + 1; j < signRects.length; j++) {
          const a = signRects[i], b = signRects[j];
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 2 && oy > 2) signOverlaps.push({ a: a.id, b: b.id, ox, oy });
        }
        if (boardBox) {
          const a = signRects[i];
          if (a.bottom > boardBox.minY + 4 && a.right > boardBox.minX && a.left < boardBox.maxX) {
            signOverlaps.push({ sign: a.id, occludesBoard: true, signBottom: a.bottom, boardTop: boardBox.minY });
          }
        }
      }

      const crowdBelowBoard = [];
      const crowdDomEls = Array.from(document.querySelectorAll('[class*="crowd"], [data-crowd]')).filter(el => {
        const st = getComputedStyle(el);
        return st.display !== 'none' && st.visibility !== 'hidden' && el.getBoundingClientRect().height > 0;
      });
      for (const el of crowdDomEls) {
        const r = el.getBoundingClientRect();
        if (${mobileMode ? 'true' : 'false'} && boardBox && r.bottom > boardBox.maxY + 40) {
          crowdBelowBoard.push({ cls: el.className, bottom: Math.round(r.bottom), boardMaxY: boardBox.maxY });
        }
      }
      const crowd3D = tel.crowdScreenRects || [];
      for (const cr of crowd3D) {
        if (${mobileMode ? 'true' : 'false'} && boardBox && cr.bottom > boardBox.maxY + 40) {
          crowdBelowBoard.push({ id: cr.id, bottom: cr.bottom, boardMaxY: boardBox.maxY });
        }
      }

      return { vw, vh, boardBox, signsState, crowdMood, headerOccludingTiles, signOverlaps, crowdBelowBoard };
    })()`);
    if (res.headerOccludingTiles.length > 0 || res.signOverlaps.length > 0 || res.crowdBelowBoard.length > 0) {
      throw new Error(`Sign/Crowd placement violation: ${JSON.stringify(res)}`);
    }
    return res;
  }

  async function assertStageLayoutDiagnostics() {
    const diag = await evalJs(`(() => {
      const fn = window.__WS_V7__?.getStageLayoutDiagnostics;
      if (typeof fn !== 'function') return { missingHook: true };
      const d = fn() || {};
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const normRect = (r, name) => {
        if (!r || typeof r !== 'object') return null;
        const left = Number(r.left ?? r.x ?? 0);
        const top = Number(r.top ?? r.y ?? 0);
        const right = Number(r.right ?? (left + Number(r.width ?? r.w ?? 0)));
        const bottom = Number(r.bottom ?? (top + Number(r.height ?? r.h ?? 0)));
        return { name, left, top, right, bottom };
      };

      const boardRect = normRect(d.boardScreenRect || d.boardRect, 'BOARD');
      const boardCenterY = Number(
        d.boardCenterY ??
        (boardRect ? (boardRect.top + boardRect.bottom) / 2 : vh * 0.5)
      );

      // Collect all crowd entries across d.crowd, d.crowdMeshes, d.meshes, or any array matching /crowd/i
      const crowdList = [];
      const pushCrowd = (item, idx) => {
        if (!item || typeof item !== 'object') return;
        const label = String(item.name || item.id || item.meshName || ('crowd_' + idx));
        const wp = item.worldPos || item.worldPosition || item.position || {};
        const wz = Number(wp.z ?? item.worldZ ?? item.z);
        const sy = Number(item.screenY ?? item.clientY ?? item.screenRect?.bottom ?? item.y);
        crowdList.push({ label, worldZ: wz, screenY: sy });
      };
      if (Array.isArray(d.crowd)) d.crowd.forEach(pushCrowd);
      if (Array.isArray(d.crowdMeshes)) d.crowdMeshes.forEach(pushCrowd);
      if (Array.isArray(d.meshes)) {
        d.meshes.filter((m) => /crowd/i.test(String(m?.name || m?.id || ''))).forEach(pushCrowd);
      }

      const crowdViolations = [];
      for (const c of crowdList) {
        if (Number.isFinite(c.worldZ) && c.worldZ > -1.5) {
          crowdViolations.push({ ...c, reason: 'worldPos.z > -1.5 (in front of/under board)' });
        }
        if (Number.isFinite(c.screenY) && Number.isFinite(boardCenterY) && c.screenY > boardCenterY) {
          crowdViolations.push({ ...c, boardCenterY, reason: 'screenY > boardCenterY (below board center)' });
        }
      }

      // Collect studio signs
      const signList = [];
      const rawSigns = d.signs || d.studioSigns || d.signRects || [];
      if (Array.isArray(rawSigns)) {
        rawSigns.forEach((s, i) => {
          const r = normRect(s?.screenRect || s?.rect || s, s?.id || s?.name || ('sign_' + i));
          if (r && (r.right - r.left) > 0 && (r.bottom - r.top) > 0) signList.push(r);
        });
      } else if (rawSigns && typeof rawSigns === 'object') {
        for (const [k, v] of Object.entries(rawSigns)) {
          const r = normRect(v?.screenRect || v?.rect || v, k);
          if (r && (r.right - r.left) > 0 && (r.bottom - r.top) > 0) signList.push(r);
        }
      }

      const signViolations = [];
      for (let i = 0; i < signList.length; i++) {
        for (let j = i + 1; j < signList.length; j++) {
          const a = signList[i], b = signList[j];
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (ox > 2 && oy > 2) {
            signViolations.push({ a: a.name, b: b.name, ox: Math.round(ox), oy: Math.round(oy), reason: 'sign-to-sign overlap' });
          }
        }
        if (boardRect) {
          const a = signList[i];
          const ox = Math.min(a.right, boardRect.right) - Math.max(a.left, boardRect.left);
          const oy = Math.min(a.bottom, boardRect.bottom) - Math.max(a.top, boardRect.top);
          if (ox > 4 && oy > 4) {
            signViolations.push({ sign: a.name, ox: Math.round(ox), oy: Math.round(oy), reason: 'sign occludes boardScreenRect' });
          }
        }
      }

      const topHud = document.querySelector('.ws7-top-bug-wrap');
      if (topHud && getComputedStyle(topHud).display !== 'none' && !topHud.classList.contains('ws7-hidden')) {
        const hr = topHud.getBoundingClientRect();
        for (const a of signList) {
          const ox = Math.min(a.right, hr.right) - Math.max(a.left, hr.left);
          const oy = Math.min(a.bottom, hr.bottom) - Math.max(a.top, hr.top);
          if (ox > 4 && oy > 4) {
            signViolations.push({ sign: a.name, ox: Math.round(ox), oy: Math.round(oy), reason: 'sign overlaps top HUD header' });
          }
        }
      }

      return {
        missingHook: false,
        vw,
        vh,
        boardCenterY,
        boardRect,
        crowdCount: crowdList.length,
        signCount: signList.length,
        crowdViolations,
        signViolations,
      };
    })()`);
    if (diag.missingHook) {
      throw new Error('P0 Stage Layout Diagnostics FAILED: window.__WS_V7__.getStageLayoutDiagnostics() hook is missing');
    }
    if (diag.crowdCount === 0) {
      throw new Error('P0 Stage Layout Diagnostics FAILED: crowdCount === 0 (no crowd meshes found in scene)');
    }
    if (diag.crowdViolations.length > 0 || diag.signViolations.length > 0) {
      throw new Error(`P0 Stage Layout Diagnostics FAILED: ${JSON.stringify(diag)}`);
    }
    return diag;
  }

  async function assertNoBrokenImages() {
    const broken = await evalJs(`(() => {
      return Array.from(document.querySelectorAll('img')).filter(img => {
        const st = getComputedStyle(img);
        if (st.display === 'none') return false;
        return !img.complete || img.naturalWidth === 0;
      }).map(img => ({ src: img.currentSrc || img.getAttribute('src'), alt: img.alt }));
    })()`);
    if (broken.length > 0) {
      throw new Error(`Broken <img> elements detected: ${JSON.stringify(broken)}`);
    }
    return { checked: true, brokenCount: 0 };
  }

  async function assertNoCanvasOrSvgPlaceholders(rootSelector = '#ui-root') {
    const violations = await evalJs(`(() => {
      const root = document.querySelector(${JSON.stringify(rootSelector)}) || document.body;
      if (!root) return [];
      const slotRe = /item|prize|zonk|portrait|backdrop|avatar|card-art|sprite|curtain|den|trophy|vip/i;
      const out = [];
      const candidates = root.querySelectorAll('canvas, svg');
      for (const el of candidates) {
        if (el.closest('#canvas-root') || el.id === 'vfx-canvas') continue;
        // Skip Starburst Plinko interactive drop board (legitimate pegboard geometry)
        if (el.closest('[class*="plinko"], [data-view="plinko"], [data-plinko-board]')) continue;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 32 || r.height < 32) continue;
        const clsChain = [
          el.className?.baseVal || el.className || '',
          el.parentElement?.className || '',
          el.parentElement?.parentElement?.className || '',
          el.getAttribute('data-target-id') || '',
          el.parentElement?.getAttribute('data-target-id') || '',
          el.getAttribute('data-sprite-id') || '',
          el.parentElement?.getAttribute('data-sprite-id') || '',
        ].join(' ');
        if (slotRe.test(clsChain) || el.tagName.toLowerCase() === 'canvas') {
          out.push({
            tag: el.tagName.toLowerCase(),
            w: Math.round(r.width),
            h: Math.round(r.height),
            cls: String(el.className?.baseVal || el.className || '').slice(0, 60),
            parentCls: String(el.parentElement?.className || '').slice(0, 60),
          });
        }
      }
      return out;
    })()`);
    if (violations.length > 0) {
      throw new Error(`Zero-<canvas>-fallback violation in item/portrait/backdrop slots: ${JSON.stringify(violations)}`);
    }
    return { checked: true, placeholderCount: 0 };
  }

  async function verifyLiveAtlasBindings(manifestRelUrl = 'assets/v9/atlas_manifest_v9.json') {
    const res = await evalJs(`(async () => {
      const mUrl = new URL(${JSON.stringify(manifestRelUrl)}, document.baseURI).toString();
      const resp = await fetch(mUrl, { cache: 'no-store' });
      const ct = resp.headers.get('content-type') || '';
      if (!resp.ok || ct.includes('text/html')) {
        return { error: 'Failed to load atlas_manifest_v9.json: status=' + resp.status + ' ct=' + ct };
      }
      const manifest = await resp.json();
      const sprites = manifest.sprites || manifest.entries || manifest;
      const validIds = new Set(Object.keys(sprites));
      const domIds = [];
      for (const el of document.querySelectorAll('[data-target-id], [data-sprite-id], [data-item-id], [data-prize-id], [data-zonk-id], [data-vip-id]')) {
        for (const attr of ['data-target-id', 'data-sprite-id', 'data-item-id', 'data-prize-id', 'data-zonk-id', 'data-vip-id']) {
          const v = el.getAttribute(attr);
          if (v && v.trim()) domIds.push(v.trim());
        }
      }
      const unknownIds = domIds.filter(id => !validIds.has(id));
      const bgUrls = new Set();
      for (const el of document.querySelectorAll('#ui-root *')) {
        const bg = getComputedStyle(el).backgroundImage;
        if (!bg || bg === 'none') continue;
        const matches = bg.matchAll(/url\\(["']?([^"')]+)["']?\\)/g);
        for (const m of matches) {
          if (m[1] && m[1].includes('assets/v9/')) bgUrls.add(m[1]);
        }
      }
      const brokenBgUrls = [];
      for (const u of bgUrls) {
        const r = await fetch(u, { cache: 'no-store' });
        const rct = (r.headers.get('content-type') || '').toLowerCase();
        if (!r.ok || rct.includes('text/html')) {
          brokenBgUrls.push({ url: u, status: r.status, contentType: rct });
        }
      }
      return {
        manifestSpriteCount: validIds.size,
        checkedDomIds: domIds.length,
        unknownIds,
        checkedBgUrls: bgUrls.size,
        brokenBgUrls,
      };
    })()`);
    if (res.error) throw new Error(res.error);
    if (res.unknownIds.length > 0 || res.brokenBgUrls.length > 0) {
      throw new Error(`Atlas binding violation: ${JSON.stringify(res)}`);
    }
    return res;
  }

  async function assertNoOverflowOrEllipsis({ allowScroll = false } = {}) {
    const res = await evalJs(`(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sw = document.documentElement.scrollWidth;
      const sh = document.documentElement.scrollHeight;
      const horizOverflow = sw > vw + 1;
      const vertOverflow = ${allowScroll ? 'false' : 'sh > vh + 1'};
      const ellipsisViolations = [];
      const clippedElements = [];
      const nodes = document.querySelectorAll('#ui-root button, #ui-root h1, #ui-root h2, #ui-root h3, #ui-root [role="button"], #ui-root span, #ui-root p');
      for (const el of nodes) {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        if (st.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 2) {
          ellipsisViolations.push({
            tag: el.tagName,
            cls: String(el.className || '').slice(0, 60),
            text: (el.innerText || '').trim().slice(0, 40),
            scrollW: el.scrollWidth,
            clientW: el.clientWidth,
          });
        }
        if (r.right > vw + 2 || r.left < -2) {
          // Ignore elements intentionally inside a horizontally scrolling container
          let p = el.parentElement;
          let inScroll = false;
          while (p && p !== document.body) {
            const ps = getComputedStyle(p);
            if (ps.overflowX === 'auto' || ps.overflowX === 'scroll') { inScroll = true; break; }
            p = p.parentElement;
          }
          if (!inScroll) {
            clippedElements.push({
              tag: el.tagName,
              cls: String(el.className || '').slice(0, 60),
              text: (el.innerText || '').trim().slice(0, 40),
              left: Math.round(r.left),
              right: Math.round(r.right),
              vw,
            });
          }
        }
      }
      return { vw, vh, sw, sh, horizOverflow, vertOverflow, ellipsisViolations, clippedElements };
    })()`);

    if (res.horizOverflow || res.vertOverflow || res.ellipsisViolations.length > 0 || res.clippedElements.length > 0) {
      throw new Error(`Layout/Overflow/Ellipsis failure: ${JSON.stringify(res)}`);
    }
    return res;
  }

  async function scanComputedDarkNavyLeaks() {
    const leaks = await evalJs(`(() => {
      const bannedRgb = [
        [11, 29, 48],   // #0B1D30
        [13, 34, 56],   // #0D2238
        [7, 19, 33],    // #071321
        [8, 21, 36],    // #081524
        [11, 31, 51],   // #0B1F33
        [15, 29, 48],   // #0f1d30
        [13, 37, 62],   // #0d253e
        [19, 54, 75],   // #13364b
        [18, 47, 77],   // #122f4d
        [15, 23, 42],   // #0F172A
      ];
      const matchesBanned = (cssVal) => {
        if (!cssVal) return null;
        const m = String(cssVal).match(/rgba?\\([^)]+\\)/gi);
        if (!m) return null;
        for (const token of m) {
          const parts = token.match(/rgba?\\(\\s*(\\d+)(?:\\s*,\\s*|\\s+)(\\d+)(?:\\s*,\\s*|\\s+)(\\d+)(?:\\s*(?:,|\\/)\\s*([\\d.]+%?))?\\s*\\)/i);
          if (!parts) continue;
          const r = Number(parts[1]), g = Number(parts[2]), b = Number(parts[3]);
          let a = 1;
          if (parts[4] !== undefined) {
            a = parts[4].endsWith('%') ? parseFloat(parts[4]) / 100 : Number(parts[4]);
          }
          if (a <= 0.05) continue;
          for (const [br, bg, bb] of bannedRgb) {
            if (r === br && g === bg && b === bb) return token;
          }
        }
        return null;
      };
      const found = [];
      for (const el of document.querySelectorAll('body, #app, #ui-root, #ui-root *')) {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        for (const prop of ['backgroundColor', 'backgroundImage', 'borderColor', 'boxShadow']) {
          const hit = matchesBanned(st[prop]);
          if (hit) {
            found.push({
              tag: el.tagName,
              cls: String(el.className || '').slice(0, 60),
              prop,
              value: hit,
            });
            if (found.length >= 25) return found;
          }
        }
      }
      return found;
    })()`);
    return leaks;
  }

  async function screenshot(fileName) {
    const safeName = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    const outPath = path.join(screenshotsDir, safeName);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const { data } = await send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
    });
    fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
    return outPath;
  }

  function getDiagnostics() {
    return {
      consoleErrors: consoleErrors.slice(),
      pageExceptions: pageExceptions.slice(),
      httpErrors: httpErrors.slice(),
      assetMimeErrors: assetMimeErrors.slice(),
      loadingFailedErrors: loadingFailedErrors.slice(),
      externalNetworkWarnings: externalNetworkWarnings.slice(),
      logErrors: logErrors.slice(),
    };
  }

  function assertCleanRuntime() {
    const d = getDiagnostics();
    const total =
      d.consoleErrors.length +
      d.pageExceptions.length +
      d.httpErrors.length +
      d.assetMimeErrors.length +
      d.loadingFailedErrors.length;
    if (total > 0) {
      throw new Error(`Runtime/Network diagnostics non-zero: ${JSON.stringify(d)}`);
    }
    return d;
  }

  async function close() {
    rejectAllPending('Browser closed');
    listeners.clear();
    try { ws?.close(); } catch {}
    ws = null;
    await killEdgeProc(proc);
    proc = null;
    await sleep(250);
    for (let attempt = 0; attempt < 8; attempt++) {
      let remaining = 0;
      for (const dir of [...createdUserDataDirs]) {
        const ok = await cleanupUserDataDir(dir);
        if (!ok) remaining++;
      }
      if (remaining === 0) break;
      await sleep(150);
    }
  }

  async function assertPlinkoLayoutBounds() {
    const res = await evalJs(`(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const board = document.querySelector('.ws9-plinko-board');
      const buckets = Array.from(document.querySelectorAll('.ws9-plinko-bucket'));
      const thumb = document.querySelector('.ws9-plinko-carriage');
      const railTrack = document.querySelector('.ws9-plinko-rail-track');
      const chuteLabel =
        document.querySelector('.ws9-plinko-chute-label') ||
        (railTrack ? railTrack.querySelector('span') : null);
      if (!board) return { missingBoard: true, vw, vh };
      const br = board.getBoundingClientRect();
      const bucketInfo = buckets.map((b, i) => {
        const r = b.getBoundingClientRect();
        return {
          idx: i,
          text: (b.innerText || '').trim(),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          boardBottom: Math.round(br.bottom),
          insideBoard: r.bottom <= br.bottom - 4 && r.top >= br.top,
          clipped: b.scrollHeight > b.clientHeight + 2,
        };
      });
      let labelThumbOverlap = null;
      if (chuteLabel && thumb) {
        const ra = chuteLabel.getBoundingClientRect();
        const rb = thumb.getBoundingClientRect();
        if (ra.width > 0 && rb.width > 0) {
          const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
          const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
          if (ox > 0 && oy > 0) {
            labelThumbOverlap = {
              ox: Math.round(ox),
              oy: Math.round(oy),
              labelText: (chuteLabel.innerText || '').trim(),
            };
          }
        }
      }
      return {
        vw,
        vh,
        bucketCount: buckets.length,
        badBuckets: bucketInfo.filter((x) => !x.insideBoard || x.clipped),
        hasChuteLabel: Boolean(chuteLabel),
        hasThumb: Boolean(thumb),
        labelThumbOverlap,
      };
    })()`);
    if (
      res.missingBoard ||
      res.bucketCount !== 5 ||
      res.badBuckets.length > 0 ||
      res.labelThumbOverlap !== null
    ) {
      throw new Error(`Starburst Plinko bounds/overlap failure at ${res.vw}x${res.vh}: ${JSON.stringify(res)}`);
    }
    return res;
  }

  return {
    cdpPort,
    userDataDir,
    screenshotsDir,
    isConnected: () => Boolean(ws && ws.readyState === WebSocket.OPEN),
    send,
    onEvent,
    openFreshTab,
    relaunchBrowser,
    setViewport,
    navigate,
    evalJs,
    evalFn,
    waitFor,
    mouseClick,
    touchTap,
    touchDrag,
    pressKey,
    clickSelector,
    clickByText,
    dismissPreBoardOverlays,
    clickBoardTileFromTelemetry,
    answerCurrentClue,
    assertWebGL2,
    assertTitleHubLayoutIntegrity,
    assertTopHudZeroOverlap,
    assertSignsAndCrowdPlacement,
    assertStageLayoutDiagnostics,
    assertPlinkoLayoutBounds,
    assertNoBrokenImages,
    assertNoCanvasOrSvgPlaceholders,
    verifyLiveAtlasBindings,
    assertNoOverflowOrEllipsis,
    scanComputedDarkNavyLeaks,
    screenshot,
    getDiagnostics,
    assertCleanRuntime,
    clearDiagnostics,
    close,
  };
}
