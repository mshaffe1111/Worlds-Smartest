#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST v2.0 — RT-V2-OFFLINE-SRS-BASEBALL ADVERSARIAL AUDIT SUITE
// Proves live against compiled `dist/` (ephemeral 127.0.0.1:0 — NEVER :8088!):
//   1. Upgrade #5A — TRUE AIRPLANE-MODE OFFLINE PLAYTEST (CDP offline=true on
//      Page + ALL Service Worker targets + origin TCP gate) + Offline Reload +
//      Live Instant Prism + Live Baseball Briefing + WebGL2 + Foley Audio +
//      capacitor.config.json + HapticsEngine Capacitor Native Mock Bridge!
//   2. Upgrade #5B — 5-Box Leitner Spaced-Repetition Mastery Deck:
//      Miss 2 Qs + Bookmark 1 Q live -> #ws-vault-srs Due badge (>= 2) ->
//      Box 1-5 layout at 390x844 & 360x640 -> Correct promotes Box 1 -> Box 2
//      and decrements dueCount -> Wrong resets to Box 1!
//   3. Upgrade #3 (Expanded #310 + #329) — Jeopardy Narrative Hooks across
//      Baseball (30 live Qs) + ALL 12 Domains (stemVariants + 1,764 Jeopardy
//      Signature Pack across 157/157 L2s + 340 Visual/Globe pack) +
//      #ws-btn-q-upvote / #ws-btn-q-flag single 44px row (0px overlap on
//      360x640 & 390x844) + Quarantine persistence & draw exclusion +
//      Full 1.3M+ QID Corpus Date-Comma / City.ST / Leak Audit!
// ============================================================================

import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build as esbuild } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DIST_DIR = path.join(ROOT, 'dist');
const PUBLIC_DATA = path.join(ROOT, 'public', 'data');
const SHARDS_DIR = path.join(PUBLIC_DATA, 'shards');
const SHOT_DIR =
  'C:/Users/mshaf/.gemini/antigravity/brain/49501205-aa0f-4c47-a0f1-72050e530f12';
const REPORT_JSON = path.join(SHOT_DIR, 'scratch', 'rt_v2_offline_srs_baseball_report.json');

const SKIP_CORPUS_SUBPROC = process.argv.includes('--skip-corpus-subproc');

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
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.hdr': 'application/octet-stream',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.gz': 'application/gzip',
  '.wasm': 'application/wasm',
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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

function findEdgeExecutable() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('Could not find msedge.exe or chrome.exe');
}

// ============================================================================
// EPHEMERAL 127.0.0.1:0 DIST SERVER WITH HARD AIRPLANE-MODE GATE
// ============================================================================
function startDistServer(rootDir = DIST_DIR) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(rootDir, 'index.html'))) {
      reject(new Error(`dist/index.html missing at ${rootDir}`));
      return;
    }
    let offlineGate = false;
    const offlineHits = [];
    const server404s = [];

    const server = http.createServer((req, res) => {
      const reqUrl = req.url || '/';
      if (offlineGate) {
        offlineHits.push({ url: reqUrl, method: req.method, ts: Date.now() });
        try {
          res.socket?.destroy();
        } catch {
          try {
            res.writeHead(503);
            res.end('Offline Gate Active');
          } catch {}
        }
        return;
      }

      try {
        const parsed = new URL(reqUrl, 'http://127.0.0.1');
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
          server404s.push(reqUrl);
          res.writeHead(404);
          res.end(`Not Found: ${rel}`);
          return;
        }
        const stat = fs.statSync(target);
        const ext = path.extname(target).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        const range = req.headers.range;
        if (range && /^bytes=\d*-\d*$/i.test(range)) {
          const m = /^bytes=(\d*)-(\d*)$/i.exec(range);
          const start = m[1] ? Number.parseInt(m[1], 10) : 0;
          const end = m[2] ? Math.min(stat.size - 1, Number.parseInt(m[2], 10)) : stat.size - 1;
          if (start >= 0 && start <= end && end < stat.size) {
            res.writeHead(206, {
              'Content-Type': mime,
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Content-Length': String(end - start + 1),
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'no-cache',
            });
            fs.createReadStream(target, { start, end }).pipe(res);
            return;
          }
        }
        res.writeHead(200, {
          'Content-Type': mime,
          'Content-Length': String(stat.size),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache',
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
        setOfflineGate(flag) {
          offlineGate = Boolean(flag);
        },
        clearOfflineHits() {
          offlineHits.length = 0;
        },
        getOfflineHits: () => [...offlineHits],
        get404s: () => [...server404s],
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

// ============================================================================
// PRELOAD TELEMETRY: WEBGL2 + FOLEY AUDIO + OPTIONAL CAPACITOR HAPTICS MOCK
// ============================================================================
function buildPreloadScript({ injectCapacitorMock = false } = {}) {
  return `
(() => {
  if (window.__rtV2Installed) return;
  window.__rtV2Installed = true;

  const glStats = {
    drawCallsThisFrame: 0,
    drawCallsHistory: [],
    totalDrawCalls: 0,
    shaderErrors: [],
    programErrors: [],
    webglVersion: null,
    webglRenderer: null,
    recording: false,
  };
  const audioStats = {
    contextCreations: 0,
    decodeCalls: 0,
    bufferSourcesStarted: 0,
    oscillatorsStarted: 0,
    mediaPlays: 0,
    playedSrcs: [],
    audioErrors: [],
  };
  const capLog = {
    selectionChanged: 0,
    impact: [],
    notification: [],
    vibrate: [],
  };
  const unhandledRejections = [];
  window.__rtV2 = { glStats, audioStats, capLog, unhandledRejections };

  window.addEventListener('unhandledrejection', (ev) => {
    unhandledRejections.push(String(ev.reason?.message || ev.reason || 'unhandledrejection'));
  });

  ${
    injectCapacitorMock
      ? `
  window.Capacitor = {
    isNativePlatform: () => true,
    getPlatform: () => 'ios',
    Plugins: {
      Haptics: {
        selectionChanged: async () => { capLog.selectionChanged++; },
        impact: async (opts) => { capLog.impact.push(opts?.style || 'UNKNOWN'); },
        notification: async (opts) => { capLog.notification.push(opts?.type || 'UNKNOWN'); },
        vibrate: async (opts) => { capLog.vibrate.push(opts?.duration ?? 0); },
      },
    },
  };
  `
      : ''
  }

  // Hook WebGL2 draw calls & shader compile/link errors
  function hookGL(proto) {
    if (!proto || proto.__rtV2Hooked) return;
    proto.__rtV2Hooked = true;
    for (const m of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced', 'drawRangeElements']) {
      if (typeof proto[m] === 'function') {
        const orig = proto[m];
        proto[m] = function (...args) {
          glStats.drawCallsThisFrame++;
          glStats.totalDrawCalls++;
          return orig.apply(this, args);
        };
      }
    }
    if (typeof proto.compileShader === 'function') {
      const orig = proto.compileShader;
      proto.compileShader = function (s) {
        const r = orig.call(this, s);
        try {
          if (!this.getShaderParameter(s, this.COMPILE_STATUS)) {
            glStats.shaderErrors.push(String(this.getShaderInfoLog(s) || 'shader error').slice(0, 240));
          }
        } catch {}
        return r;
      };
    }
    if (typeof proto.linkProgram === 'function') {
      const orig = proto.linkProgram;
      proto.linkProgram = function (p) {
        const r = orig.call(this, p);
        try {
          if (!this.getProgramParameter(p, this.LINK_STATUS)) {
            glStats.programErrors.push(String(this.getProgramInfoLog(p) || 'link error').slice(0, 240));
          }
        } catch {}
        return r;
      };
    }
  }
  if (typeof WebGL2RenderingContext !== 'undefined') hookGL(WebGL2RenderingContext.prototype);
  if (typeof WebGLRenderingContext !== 'undefined') hookGL(WebGLRenderingContext.prototype);

  const origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    const ctx = origGetContext.call(this, type, attrs);
    if (ctx && (type === 'webgl2' || type === 'webgl')) {
      try {
        const ver = ctx.getParameter(ctx.VERSION);
        if (!glStats.webglVersion || type === 'webgl2') {
          glStats.webglVersion = ver;
          const ext = ctx.getExtension('WEBGL_debug_renderer_info');
          glStats.webglRenderer = ext ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER);
        }
      } catch {}
    }
    return ctx;
  };

  // Hook WebAudio & HTMLMediaElement to verify Foley audio playback offline
  const BaseAC = window.AudioContext || window.webkitAudioContext;
  if (BaseAC && BaseAC.prototype) {
    const origDecode = BaseAC.prototype.decodeAudioData;
    if (typeof origDecode === 'function') {
      BaseAC.prototype.decodeAudioData = function (...args) {
        audioStats.decodeCalls++;
        return origDecode.apply(this, args);
      };
    }
    const origCreateBuf = BaseAC.prototype.createBufferSource;
    if (typeof origCreateBuf === 'function') {
      BaseAC.prototype.createBufferSource = function (...args) {
        const src = origCreateBuf.apply(this, args);
        const origStart = src.start.bind(src);
        src.start = function (...sArgs) {
          audioStats.bufferSourcesStarted++;
          return origStart(...sArgs);
        };
        return src;
      };
    }
    const origCreateOsc = BaseAC.prototype.createOscillator;
    if (typeof origCreateOsc === 'function') {
      BaseAC.prototype.createOscillator = function (...args) {
        const osc = origCreateOsc.apply(this, args);
        const origStart = osc.start.bind(osc);
        osc.start = function (...sArgs) {
          audioStats.oscillatorsStarted++;
          return origStart(...sArgs);
        };
        return osc;
      };
    }
  }
  if (typeof HTMLMediaElement !== 'undefined' && HTMLMediaElement.prototype?.play) {
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      audioStats.mediaPlays++;
      if (this.currentSrc || this.src) {
        audioStats.playedSrcs.push(String(this.currentSrc || this.src).slice(-60));
      }
      const p = origPlay.apply(this, args);
      if (p && typeof p.catch === 'function') {
        p.catch((e) => audioStats.audioErrors.push(String(e?.message || e)));
      }
      return p;
    };
  }

  function rafStep() {
    if (glStats.recording) {
      glStats.drawCallsHistory.push(glStats.drawCallsThisFrame);
    }
    glStats.drawCallsThisFrame = 0;
    requestAnimationFrame(rafStep);
  }
  requestAnimationFrame(rafStep);

  window.__rtV2MeasureGl = async (ms = 900) => {
    glStats.drawCallsHistory = [];
    glStats.recording = true;
    await new Promise((r) => setTimeout(r, ms));
    glStats.recording = false;
    const nonZero = glStats.drawCallsHistory.filter((n) => n > 0);
    const avg = nonZero.length ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
    return {
      frames: glStats.drawCallsHistory.length,
      nonZeroFrames: nonZero.length,
      avgDrawCalls: Number(avg.toFixed(1)),
      totalDrawCalls: glStats.totalDrawCalls,
      shaderErrors: glStats.shaderErrors.slice(),
      programErrors: glStats.programErrors.slice(),
      webglVersion: glStats.webglVersion,
      webglRenderer: glStats.webglRenderer,
    };
  };
})();
`;
}

// ============================================================================
// HEADLESS EDGE CDP HARNESS WITH TRUE SERVICE-WORKER + PAGE OFFLINE EMULATION
// ============================================================================
async function launchCdpSession({ width = 390, height = 844, injectCapacitorMock = false } = {}) {
  const exe = findEdgeExecutable();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-rt-v2-offline-'));
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
    'about:blank',
  ];

  const proc = spawn(exe, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const wsUrl = await new Promise((resolve, reject) => {
    let stderr = '';
    let settled = false;
    const done = (err, val) => {
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
    const timer = setTimeout(() => done(new Error(`Timeout launching Edge. stderr:\n${stderr}`)), 60000);
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      const m = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) done(null, m[1]);
    });
    proc.on('exit', (code) => done(new Error(`Edge exited early (${code}). stderr:\n${stderr}`)));
    const poller = setInterval(async () => {
      try {
        const resp = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
        if (resp.ok) {
          const info = await resp.json();
          if (info.webSocketDebuggerUrl) done(null, info.webSocketDebuggerUrl);
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
  const listeners = new Map();
  const attachedSwSessions = new Set();
  let isOfflineMode = false;

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.code}: ${msg.error.message}`));
      else resolve(msg.result);
    } else if (msg.method) {
      const set = listeners.get(msg.method);
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
    if (!listeners.has(method)) listeners.set(method, new Set());
    listeners.get(method).add(fn);
    return () => listeners.get(method)?.delete(fn);
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
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: buildPreloadScript({ injectCapacitorMock }),
  });

  // Track detached SW sessions cleanly (we attach to SW targets explicitly in setOffline()
  // AFTER SW finishes installing so CDP never stalls SW registration/install!)
  onEvent('Target.detachedFromTarget', (p) => {
    if (p?.sessionId) attachedSwSessions.delete(p.sessionId);
  });

  const consoleErrors = [];
  const pageExceptions = [];
  const failedFetches = [];
  const requestUrlById = new Map();

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
    pageExceptions.push(d.exception?.description || d.text || JSON.stringify(d));
  });
  onEvent('Network.requestWillBeSent', (p, sid) => {
    if (sid !== sessionId) return;
    if (p.requestId && p.request?.url) {
      requestUrlById.set(p.requestId, p.request.url);
    }
  });
  onEvent('Network.responseReceived', (p, sid) => {
    if (sid !== sessionId) return;
    const status = p.response?.status ?? 200;
    const url = p.response?.url ?? '';
    if (status >= 400) {
      failedFetches.push({ kind: 'http', status, url });
    }
  });
  onEvent('Network.loadingFailed', (p, sid) => {
    if (sid !== sessionId) return;
    if (!p.canceled && p.errorText && !p.errorText.includes('ERR_ABORTED')) {
      const url = requestUrlById.get(p.requestId) || p.requestId;
      failedFetches.push({ kind: 'loadingFailed', url, errorText: p.errorText });
    }
  });

  async function setOffline(offline) {
    isOfflineMode = Boolean(offline);
    const cond = {
      offline: isOfflineMode,
      latency: 0,
      downloadThroughput: isOfflineMode ? 0 : -1,
      uploadThroughput: isOfflineMode ? 0 : -1,
    };
    await send('Network.emulateNetworkConditions', cond);
    // Attach to any existing service_worker target not yet in attachedSwSessions
    try {
      const { targetInfos: allTargets } = await sendRaw('Target.getTargets');
      for (const t of allTargets) {
        if (t.type === 'service_worker') {
          try {
            const { sessionId: swSid } = await sendRaw('Target.attachToTarget', {
              targetId: t.targetId,
              flatten: true,
            });
            attachedSwSessions.add(swSid);
            await sendRaw('Network.enable', {}, swSid);
          } catch {}
        }
      }
    } catch {}
    for (const swSid of attachedSwSessions) {
      try {
        await sendRaw('Network.emulateNetworkConditions', cond, swSid);
      } catch {}
    }
  }

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

  async function reload(ignoreCache = false) {
    await send('Page.reload', { ignoreCache });
    await sleep(400);
  }

  async function evalJs(expression, awaitPromise = true) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise,
    });
    if (res.exceptionDetails) {
      throw new Error(
        `Page eval exception: ${res.exceptionDetails.exception?.description || res.exceptionDetails.text}`,
      );
    }
    return res.result?.value;
  }

  async function waitFor(predicateJs, timeoutMs = 20000, pollMs = 150) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const ok = await evalJs(`Boolean(${predicateJs})`, true);
        if (ok) return true;
      } catch {}
      await sleep(pollMs);
    }
    return false;
  }

  async function mouseClick(x, y) {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await sleep(35);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }

  async function clickSelector(selector, { timeoutMs = 10000 } = {}) {
    const found = await waitFor(`document.querySelector(${JSON.stringify(selector)})`, timeoutMs, 100);
    if (!found) throw new Error(`Selector not found: ${selector}`);
    const pt = await evalJs(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
    })()`);
    if (!pt || pt.w <= 0 || pt.h <= 0) {
      throw new Error(`Zero-size element for click: ${selector}`);
    }
    await mouseClick(pt.x, pt.y);
    return pt;
  }

  async function screenshot(fileName) {
    const absPath = path.join(SHOT_DIR, fileName);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    let lastErr = null;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const { data } = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(absPath, Buffer.from(data, 'base64'));
        return absPath;
      } catch (err) {
        lastErr = err;
        await sleep(500 * attempt);
      }
    }
    throw lastErr;
  }

  async function close() {
    try { ws.close(); } catch {}
    try { proc.kill(); } catch {}
    await sleep(250);
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }

  return {
    send,
    setOffline,
    setViewport,
    navigate,
    reload,
    evalJs,
    waitFor,
    clickSelector,
    mouseClick,
    screenshot,
    consoleErrors,
    pageExceptions,
    failedFetches,
    getAttachedSwCount: () => attachedSwSessions.size,
    clearDiagnostics() {
      consoleErrors.length = 0;
      pageExceptions.length = 0;
      failedFetches.length = 0;
    },
    close,
  };
}

// ============================================================================
// HELPER: LAUNCH BASEBALL BRIEFING VIA REAL UI CLICKS
// ============================================================================
async function launchBaseballBriefingLive(br, { roundCount = 10, diff = 'ADAPTIVE' } = {}) {
  // Click Pick a Topic (`data-title-mode="BRIEFING"`) or Hub Briefing tab
  const onTitle = await br.evalJs(`Boolean(document.querySelector('[data-title-mode="BRIEFING"]'))`);
  if (onTitle) {
    await br.clickSelector('[data-title-mode="BRIEFING"]');
  } else {
    const hasHubBriefing = await br.evalJs(`Boolean(document.querySelector('[data-hub-tab="BRIEFING"]'))`);
    if (hasHubBriefing) {
      await br.clickSelector('[data-hub-tab="BRIEFING"]');
      await sleep(250);
    }
    const pickerOpen = await br.evalJs(`Boolean(document.querySelector('.ws-briefing-sheet'))`);
    if (!pickerOpen) {
      await br.clickSelector('#ws-open-briefing-picker, .ws-btn-gold');
    }
  }
  const sheetOk = await br.waitFor(`document.querySelector('.ws-briefing-sheet [data-pick-l0]')`, 10000, 120);
  if (!sheetOk) throw new Error('BriefingCategoriesModal failed to open or load L0 list');
  await sleep(200);

  // Drill: Sports & Games (5) -> Sports -> Baseball
  await br.clickSelector('[data-pick-l0="5"]');
  await sleep(200);
  await br.clickSelector('[data-pick-l1="sports"]');
  await sleep(200);
  await br.clickSelector('[data-pick-l2="sports_baseball"]');
  await sleep(220);

  // Select difficulty & round length
  if (diff) {
    const hasDiff = await br.evalJs(`Boolean(document.querySelector('[data-diff="${diff}"]'))`);
    if (hasDiff) {
      await br.clickSelector(`[data-diff="${diff}"]`);
      await sleep(140);
    }
  }
  const hasLen = await br.evalJs(`Boolean(document.querySelector('[data-len="${roundCount}"]'))`);
  if (hasLen) {
    await br.clickSelector(`[data-len="${roundCount}"]`);
    await sleep(140);
  }

  await br.clickSelector('#ws-cat-launch');
  const started = await br.waitFor(
    `Boolean(document.querySelector('.ws-question-prompt') && (document.querySelector('[data-facet-idx]') || document.querySelector('#ws-cal-slider') || document.querySelector('.ws-codex-grid') || document.querySelector('.ws-gauntlet-row') || document.querySelector('.ws-globe-anchor-btn') || document.querySelector('#ws-btn-overclock')))`,
    15000,
    120,
  );
  if (!started) throw new Error('Baseball Briefing gameplay failed to mount after START BRIEFING click');
  await sleep(500);
}

// Read current gameplay question state from DOM
async function readLiveQuestionDom(br) {
  return br.evalJs(`(() => {
    const prompt = document.querySelector('.ws-question-prompt')?.textContent?.replace(/\\s+/g, ' ').trim() || '';
    const diffBadge = document.querySelector('#ws-question-difficulty-badge')?.textContent?.replace(/\\s+/g, ' ').trim() || '';
    const chyronSub = document.querySelector('.ws-chyron-sub, .ws-question-kicker')?.textContent?.replace(/\\s+/g, ' ').trim() || '';
    const facets = Array.from(document.querySelectorAll('[data-facet-idx]')).map((el) => ({
      idx: Number(el.dataset.facetIdx),
      text: (el.querySelector('.ws-facet-text')?.textContent || el.textContent || '').replace(/\\s+/g, ' ').trim(),
    }));
    const hasCal = Boolean(document.querySelector('#ws-cal-slider'));
    const hasCodex = Boolean(document.querySelector('.ws-codex-grid, [data-codex-subj]'));
    const hasGauntlet = Boolean(document.querySelector('.ws-gauntlet-row, [data-gauntlet]'));
    const hasGlobe = Boolean(document.querySelector('.ws-globe-anchor-btn'));
    const hasVisual = Boolean(document.querySelector('#ws-visual-plate-frame img'));
    const archetype = hasGlobe
      ? 'GLOBE_PIN_DROP'
      : hasCal
        ? 'CALIBRATOR_DIAL'
        : hasCodex
          ? 'CODEX_DUAL_RING'
          : hasGauntlet
            ? 'GAUNTLET_SHATTER'
            : 'SIGHTLINE_LOCK';
    return { prompt, diffBadge, chyronSub, facets, archetype, hasVisual };
  })()`);
}

// Submit current gameplay question cleanly across all 6 morphs
async function submitCurrentQuestionLive(br, preferredFacetIdx = 0) {
  const q = await readLiveQuestionDom(br);
  if (q.archetype === 'GLOBE_PIN_DROP') {
    await br.clickSelector('.ws-globe-anchor-btn');
    await sleep(180);
    await br.clickSelector('#ws-btn-overclock');
  } else if (q.archetype === 'CALIBRATOR_DIAL') {
    await br.clickSelector('#ws-btn-overclock');
  } else if (q.archetype === 'CODEX_DUAL_RING') {
    await br.clickSelector('#ws-btn-overclock');
  } else if (q.archetype === 'GAUNTLET_SHATTER') {
    const choice = preferredFacetIdx % 2 === 0 ? 'DEBUNK' : 'VERIFY';
    await br.clickSelector(`[data-gauntlet="${choice}"]`);
  } else {
    const targetIdx = Math.min(preferredFacetIdx, Math.max(0, q.facets.length - 1));
    // First click selects, second click commits immediately (or click #ws-btn-overclock)
    await br.clickSelector(`[data-facet-idx="${targetIdx}"]`);
    await sleep(180);
    const alreadyRevealed = await br.evalJs(`Boolean(document.querySelector('.ws-intel-flash'))`);
    if (!alreadyRevealed) {
      const hasLockBtn = await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock'))`);
      if (hasLockBtn) {
        await br.clickSelector('#ws-btn-overclock');
      } else {
        await br.clickSelector(`[data-facet-idx="${targetIdx}"]`);
      }
    }
  }
  const revealed = await br.waitFor(`Boolean(document.querySelector('.ws-intel-flash'))`, 8000, 100);
  if (!revealed) throw new Error(`Reveal did not appear after submitting ${q.archetype}: ${q.prompt.slice(0, 60)}`);
  await sleep(260);
  const revInfo = await br.evalJs(`(() => {
    const flash = document.querySelector('.ws-intel-flash');
    const isMiss = flash?.classList.contains('is-miss') || false;
    const title = document.querySelector('.ws-intel-flash-title')?.textContent?.replace(/\\s+/g, ' ').trim() || '';
    const why = document.querySelector('.ws-intel-flash-body')?.textContent?.replace(/\\s+/g, ' ').trim() || '';
    return { correct: !isMiss, title, why };
  })()`);
  return { ...q, reveal: revInfo };
}

// ============================================================================
// COPY & LEAK HYGIENE CHECKER FOR NEW V2.0 PACKS (visual_globe + jeopardy_sig)
// ============================================================================
const RE_YEAR_COMMA =
  /\b(?:in|from|until|since|by|before|after|between|around|circa|born|died|founded|opened|closed|established|inducted|debuted|won|season|series|world\s+series|year)\s+([12]),(\d{3})\b|\b([12]),(\d{3})\s*(?:CE|BCE|AD|BC|season|World\s+Series)\b|\(([12]),(\d{3})\)/gi;
const RE_CITY_DOT_STATE = /\b([A-Z][a-zA-Z'-]{2,})\.\s+(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/g;
const ABBREV_DOT = new Set(['st', 'mt', 'ft', 'dr', 'mr', 'mrs', 'ms', 'jr', 'sr', 'no', 'vs', 'inc', 'co']);

function checkCopyDefectsInPack(records, packName) {
  const defects = [];
  for (const r of records) {
    const qid = r.qid;
    const texts = [
      ['prompt', r.prompt],
      ['answerCorrect', r.answerCorrect],
      ['whyExplanation', r.whyExplanation],
      ...(r.clues || []).map((c, i) => [`clue[${i}]`, c]),
      ...(r.distractors || []).map((d, i) => [`distractor[${i}]`, typeof d === 'string' ? d : d?.text]),
      ...(r.visualPlate ? [['visualPlate.caption', r.visualPlate.caption]] : []),
      ...(r.globePin
        ? [
            ['globePin.targetLabel', r.globePin.targetLabel],
            ['globePin.regionHint', r.globePin.regionHint],
            ['globePin.coordHint', r.globePin.coordHint],
          ]
        : []),
    ];
    for (const [field, val] of texts) {
      if (typeof val !== 'string' || !val) continue;
      RE_YEAR_COMMA.lastIndex = 0;
      const ym = RE_YEAR_COMMA.exec(val);
      if (ym) defects.push({ pack: packName, qid, kind: 'DATE_YEAR_COMMA', field, match: ym[0], text: val.slice(0, 120) });

      RE_CITY_DOT_STATE.lastIndex = 0;
      let cm;
      while ((cm = RE_CITY_DOT_STATE.exec(val)) !== null) {
        if (!ABBREV_DOT.has(cm[1].toLowerCase())) {
          defects.push({ pack: packName, qid, kind: 'CITY_PERIOD_STATE', field, match: cm[0], text: val.slice(0, 120) });
        }
      }
      if (/&(?:quot|amp|apos|lt|gt|nbsp);/i.test(val)) {
        defects.push({ pack: packName, qid, kind: 'HTML_ENTITY', field, text: val.slice(0, 120) });
      }
      if (/(?<![_^A-Za-z])\{[a-zA-Z_][a-zA-Z0-9_]{1,}\}/.test(val)) {
        defects.push({ pack: packName, qid, kind: 'UNRESOLVED_TEMPLATE', field, text: val.slice(0, 120) });
      }
    }

    // Exact answer substring leak in prompt or clues (for SIGHTLINE_LOCK)
    if (r.archetype === 'SIGHTLINE_LOCK') {
      const ansLow = String(r.answerCorrect || '').trim().toLowerCase();
      const promptLow = String(r.prompt || '').toLowerCase();
      if (ansLow.length >= 4 && promptLow.includes(ansLow)) {
        defects.push({ pack: packName, qid, kind: 'STEM_ANSWER_LEAK', ans: r.answerCorrect, prompt: r.prompt.slice(0, 120) });
      }
      for (const [ci, cl] of (r.clues || []).entries()) {
        if (ansLow.length >= 4 && String(cl || '').toLowerCase().includes(ansLow)) {
          defects.push({ pack: packName, qid, kind: 'CLUE_ANSWER_LEAK', clueIdx: ci, ans: r.answerCorrect, clue: String(cl).slice(0, 120) });
        }
      }
      const opts = [
        ansLow,
        ...(r.distractors || []).map((d) => String(typeof d === 'string' ? d : d?.text || '').trim().toLowerCase()),
      ].filter(Boolean);
      if (new Set(opts).size < opts.length) {
        defects.push({ pack: packName, qid, kind: 'DUPLICATE_OPTIONS', opts });
      }
    }
  }
  return defects;
}

// ============================================================================
// MAIN AUDIT ORCHESTRATOR
// ============================================================================
async function main() {
  const report = {
    startedAt: new Date().toISOString(),
    screenshots: [],
    gates: [],
    part1_offlineAndCapacitor: {},
    part2_spacedRepetition: {},
    part3_jeopardyFeedbackCorpus: {},
    passed: true,
    failures: [],
  };

  function gate(name, ok, detail) {
    report.gates.push({ name, ok: Boolean(ok), detail });
    const tag = ok ? 'PASS' : 'FAIL';
    console.log(`  [${tag}] ${name} — ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
    if (!ok) {
      report.passed = false;
      report.failures.push({ name, detail });
    }
  }

  function recordShot(absPath, caption) {
    report.screenshots.push({ path: absPath, caption });
    console.log(`  Screenshot: ${absPath} | ${caption}`);
  }

  // Build quick Baseball prompt -> answerCorrect index from subcat_baseball + jeopardy_signature + visual_globe + questions
  // so Part 2 can deterministically miss 2 questions without touching src/**
  const knownAnswersByPromptPrefix = new Map();
  try {
    for (const f of ['questions.json', 'jeopardy_signature_packs.json', 'visual_globe_packs.json', 'gold_venue_packs.json']) {
      const p = path.join(PUBLIC_DATA, f);
      if (!fs.existsSync(p)) continue;
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      for (const q of j.questions || []) {
        if (q.prompt && q.answerCorrect) {
          knownAnswersByPromptPrefix.set(String(q.prompt).replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 90), String(q.answerCorrect).trim().toLowerCase());
        }
      }
    }
  } catch {}

  const srv = await startDistServer(DIST_DIR);
  console.log(`\n=== EPHEMERAL DIST SERVER READY AT ${srv.baseUrl} (NEVER :8088) ===\n`);

  try {
    // ========================================================================
    // PART 1: UPGRADE #5A — CAPACITOR CONFIG + NATIVE HAPTICS BRIDGE +
    //         TRUE AIRPLANE-MODE OFFLINE PLAYTEST
    // ========================================================================
    console.log('========================================================================');
    console.log('PART 1: UPGRADE #5A — CAPACITOR + HAPTICS BRIDGE + TRUE AIRPLANE-MODE');
    console.log('========================================================================');

    // 1A. capacitor.config.json + dist/sw.js static checks
    const capCfgPath = path.join(ROOT, 'capacitor.config.json');
    const capCfg = JSON.parse(fs.readFileSync(capCfgPath, 'utf8'));
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const capDocExists = fs.existsSync(path.join(ROOT, 'docs', 'CAPACITOR_NATIVE_BUILD.md'));
    const capValid =
      capCfg.appId === 'com.meridian.worldssmartest' &&
      capCfg.appName === "World's Smartest" &&
      capCfg.webDir === 'dist' &&
      capCfg.backgroundColor === '#050811' &&
      capCfg.plugins?.StatusBar?.style === 'DARK' &&
      capCfg.plugins?.StatusBar?.backgroundColor === '#050811' &&
      Boolean(pkg.scripts?.['cap:sync'] && pkg.scripts?.['cap:ios'] && pkg.scripts?.['cap:android']) &&
      capDocExists;
    gate('1A.capacitor_config_and_docs', capValid, {
      appId: capCfg.appId,
      appName: capCfg.appName,
      webDir: capCfg.webDir,
      bg: capCfg.backgroundColor,
      capScripts: Boolean(pkg.scripts?.['cap:sync']),
      docExists: capDocExists,
    });

    const swPath = path.join(DIST_DIR, 'sw.js');
    const swSyntax = spawnSync(process.execPath, ['--check', swPath], { encoding: 'utf8' });
    const swSrc = fs.readFileSync(swPath, 'utf8');
    // Check zero hardcoded root-relative `/assets/` or `/data/` strings in sw.js
    const swHardcodedRoot = swSrc.match(/['"]\/(?:assets|data|index\.html|manifest\.json)/g) || [];
    gate('1A.dist_sw_syntax_and_subpath_safe', swSyntax.status === 0 && swHardcodedRoot.length === 0, {
      syntaxExit: swSyntax.status,
      hardcodedRootPaths: swHardcodedRoot,
      bytes: swSrc.length,
    });

    // 1B. Compiled HapticsEngine native Capacitor mock bridge unit proof
    const hapticsTmp = path.join(os.tmpdir(), `ws_rt_haptics_${process.pid}_${Date.now()}.mjs`);
    await esbuild({
      entryPoints: [path.join(ROOT, 'src', 'audio', 'HapticsEngine.ts')],
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node20',
      outfile: hapticsTmp,
      logLevel: 'silent',
    });
    let hapticsUnitRes = null;
    try {
      const hMod = await import(pathToFileURL(hapticsTmp).href);
      const calls = { selectionChanged: 0, impact: [], notification: [], vibrate: [] };
      globalThis.window = {
        Capacitor: {
          isNativePlatform: () => true,
          getPlatform: () => 'ios',
          Plugins: {
            Haptics: {
              selectionChanged: async () => { calls.selectionChanged++; },
              impact: async (o) => { calls.impact.push(o.style); },
              notification: async (o) => { calls.notification.push(o.type); },
              vibrate: async (o) => { calls.vibrate.push(o.duration); },
            },
          },
        },
      };
      const eng = new hMod.HapticsEngine();
      const nativeDetected = eng.isNativePlatform() && eng.getBackend() === 'CAPACITOR_NATIVE';
      eng.spinTick();
      eng.tap();
      eng.peelSnap(2);
      eng.lockThunk();
      eng.lockThunk(); // Must be deduped within 75ms!
      eng.goldResonance();
      eng.backfireFracture();
      await sleep(120);
      delete globalThis.window;
      const ok =
        nativeDetected &&
        calls.selectionChanged >= 1 &&
        calls.impact.includes('LIGHT') &&
        calls.impact.includes('MEDIUM') &&
        calls.impact.includes('HEAVY') &&
        calls.notification.includes('SUCCESS') &&
        calls.notification.includes('ERROR');
      hapticsUnitRes = { nativeDetected, calls };
      gate('1B.haptics_capacitor_native_unit', ok, hapticsUnitRes);
    } finally {
      try { fs.unlinkSync(hapticsTmp); } catch {}
    }

    // 1C. TRUE AIRPLANE-MODE OFFLINE PLAYTEST + LIVE CAPACITOR MOCK BRIDGE IN BROWSER
    const brOff = await launchCdpSession({ width: 390, height: 844, injectCapacitorMock: true });
    try {
      await brOff.setViewport({ width: 390, height: 844, mobile: true, dpr: 2 });
      await brOff.navigate(srv.baseUrl);
      const booted = await brOff.waitFor(`Boolean(document.querySelector('#ws-title-enter-cta'))`, 25000, 150);
      if (!booted) throw new Error('App failed to boot online for SW registration');
      await sleep(1200);

      // Wait for navigator.serviceWorker.ready + active controller + initial precache!
      const swState = await brOff.evalJs(`(async () => {
        if (!('serviceWorker' in navigator)) return { supported: false };
        const tStart = Date.now();
        const reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((r) => setTimeout(() => r(null), 35000)),
        ]);
        const swReadyMs = Date.now() - tStart;
        if (!reg) return { supported: true, ready: false, swReadyMs };
        // Wait briefly for clients.claim() to set controller
        const t0 = Date.now();
        while (!navigator.serviceWorker.controller && Date.now() - t0 < 6000) {
          await new Promise((r) => setTimeout(r, 100));
        }
        const cacheNames = await caches.keys();
        let entryCount = 0;
        for (const k of cacheNames) {
          const c = await caches.open(k);
          entryCount += (await c.keys()).length;
        }
        return {
          supported: true,
          ready: Boolean(reg.active),
          swReadyMs,
          hasController: Boolean(navigator.serviceWorker.controller),
          scope: reg.scope,
          cacheNames,
          entryCount,
        };
      })()`);
      gate('1C.sw_ready_and_precached', Boolean(swState?.ready && swState?.hasController && swState?.entryCount >= 20), swState);

      // Open Vault & trigger #ws-vault-offline-pack
      await brOff.clickSelector('#ws-util-vault');
      await sleep(300);
      await brOff.clickSelector('#ws-vault-offline-pack');

      // Wait until BASEBALL_PRO pack finishes caching and persists to ws_offline_packs_v2 + badge settles
      const packDone = await brOff.waitFor(
        `(() => {
          try {
            const raw = localStorage.getItem('ws_offline_packs_v2');
            if (!raw || !raw.includes('BASEBALL_PRO')) return false;
            const badge = document.querySelector('#ws-vault-offline-badge')?.textContent?.trim() || '';
            return !badge.includes('%');
          } catch { return false; }
        })()`,
        30000,
        200,
      );
      await sleep(400);
      const packState = await brOff.evalJs(`(async () => {
        const raw = localStorage.getItem('ws_offline_packs_v2');
        const badge = document.querySelector('#ws-vault-offline-badge')?.textContent?.trim() || '';
        const sub = document.querySelector('#ws-vault-offline-sub')?.textContent?.trim() || '';
        const cacheNames = await caches.keys();
        const cachedUrls = [];
        for (const k of cacheNames) {
          const c = await caches.open(k);
          for (const req of await c.keys()) cachedUrls.push(req.url);
        }
        return {
          persisted: raw,
          badge,
          sub,
          totalCached: cachedUrls.length,
          hasBaseballShard: cachedUrls.some((u) => u.includes('subcat_baseball.json')),
          hasJeopardyPack: cachedUrls.some((u) => u.includes('jeopardy_signature_packs.json')),
          hasVisualPack: cachedUrls.some((u) => u.includes('visual_globe_packs.json')),
          hasQuestionsGz: cachedUrls.some((u) => u.includes('questions.json.gz')),
          hasUiModalsChunk: cachedUrls.some((u) => u.includes('ui-modals-')),
        };
      })()`);
      const shot1 = await brOff.screenshot('01_vault_offline_pack_ready_390x844.png');
      recordShot(shot1, 'Vault drawer with Offline Airplane Pack ready (390x844)');
      gate(
        '1C.vault_offline_pack_downloaded',
        Boolean(packDone && packState.hasBaseballShard && packState.hasJeopardyPack && packState.hasVisualPack && packState.hasQuestionsGz),
        packState,
      );

      // Verify live Capacitor Haptics mock was already triggered by UI taps
      const capAfterVault = await brOff.evalJs(`window.__rtV2.capLog`);

      // === SEVER 100% OF NETWORK TRAFFIC (TRUE AIRPLANE MODE!) ===
      await brOff.setOffline(true);
      srv.setOfflineGate(true);
      srv.clearOfflineHits();
      brOff.clearDiagnostics();
      await sleep(250);

      const onlineBeforeReload = await brOff.evalJs(`navigator.onLine`);
      gate('1C.airplane_mode_navigator_offline', onlineBeforeReload === false, {
        navigatorOnLine: onlineBeforeReload,
        swSessionsOfflined: brOff.getAttachedSwCount(),
      });

      // COMPLETELY OFFLINE PAGE RELOAD!
      await brOff.reload(false);
      const offlineReloaded = await brOff.waitFor(`Boolean(document.querySelector('#ws-btn-instant-prism'))`, 20000, 150);
      await sleep(1100);
      const glReload = await brOff.evalJs(`window.__rtV2MeasureGl(900)`);
      const shot2 = await brOff.screenshot('02_offline_reloaded_title_390x844.png');
      recordShot(shot2, 'Start Screen after 100% Offline Airplane-Mode page.reload() (390x844)');
      gate(
        '1C.offline_reload_boot_and_webgl2',
        Boolean(
          offlineReloaded &&
            glReload.avgDrawCalls > 0 &&
            glReload.shaderErrors.length === 0 &&
            glReload.programErrors.length === 0,
        ),
        {
          offlineReloaded,
          glReload,
          offlineServerHits: srv.getOfflineHits().length,
          consoleErrors: brOff.consoleErrors.slice(),
          pageExceptions: brOff.pageExceptions.slice(),
          failedFetches: brOff.failedFetches.slice(),
        },
      );

      // PLAY LIVE INSTANT PRISM COMPLETELY OFFLINE!
      await brOff.clickSelector('#ws-btn-instant-prism');
      const instantMounted = await brOff.waitFor(`Boolean(document.querySelector('.ws-question-prompt'))`, 8000, 100);
      await sleep(450);
      const instantRes = await submitCurrentQuestionLive(brOff, 0);
      await sleep(450);
      const glInstant = await brOff.evalJs(`window.__rtV2MeasureGl(700)`);
      const audioInstant = await brOff.evalJs(`window.__rtV2.audioStats`);
      const shot3 = await brOff.screenshot('03_offline_instant_prism_reveal_390x844.png');
      recordShot(shot3, 'Live Instant Prism solved & revealed in 100% Airplane Mode (390x844)');
      const instantClipCheck = await brOff.evalJs(`(() => {
        const btns = ['#ws-instant-go-campaign', '#ws-instant-go-baseball', '#ws-instant-go-daily']
          .map((sel) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { sel, text: el.textContent?.trim(), w: Math.round(r.width), scrollW: el.scrollWidth, clipped: el.scrollWidth > el.clientWidth + 2 };
          })
          .filter(Boolean);
        return { btns, anyClipped: btns.some((b) => b.clipped) };
      })()`);
      gate(
        '1C.offline_instant_prism_live_webgl_and_foley',
        Boolean(
          instantMounted &&
            instantRes.prompt.length > 10 &&
            glInstant.avgDrawCalls > 0 &&
            glInstant.shaderErrors.length === 0 &&
            !instantClipCheck.anyClipped &&
            (audioInstant.bufferSourcesStarted > 0 || audioInstant.decodeCalls > 0 || audioInstant.mediaPlays > 0),
        ),
        {
          prompt: instantRes.prompt.slice(0, 80),
          archetype: instantRes.archetype,
          glDrawCalls: glInstant.avgDrawCalls,
          audioInstant,
          instantClipCheck,
        },
      );

      // PLAY LIVE BASEBALL BRIEFING COMPLETELY OFFLINE!
      // Return to Title via topbar Back button so we also exercise Pick a Topic -> Sports -> Baseball offline!
      const hasBackBtn = await brOff.evalJs(`Boolean(document.querySelector('#ws-util-back'))`);
      if (hasBackBtn) {
        await brOff.clickSelector('#ws-util-back');
        await sleep(500);
        // If leave-match confirmation modal appeared, confirm leave
        const hasLeaveConfirm = await brOff.evalJs(`Boolean(document.querySelector('#ws-confirm-leave-btn, [data-confirm-leave]'))`);
        if (hasLeaveConfirm) {
          await brOff.clickSelector('#ws-confirm-leave-btn, [data-confirm-leave]');
          await sleep(400);
        }
      }
      // If Instant Prism next bar has Baseball Briefing button OR we're on Title, test Pick Topic -> Baseball offline!
      const onTitleOffline = await brOff.evalJs(`Boolean(document.querySelector('[data-title-mode="BRIEFING"]'))`);
      if (onTitleOffline) {
        await launchBaseballBriefingLive(brOff, { roundCount: 5, diff: 'ADAPTIVE' });
      } else {
        await brOff.clickSelector('#ws-instant-go-baseball');
        await brOff.waitFor(`Boolean(document.querySelector('.ws-question-prompt'))`, 12000, 120);
        await sleep(500);
      }

      const offlineBaseballQs = [];
      for (let i = 0; i < 3; i++) {
        const res = await submitCurrentQuestionLive(brOff, i % 4);
        offlineBaseballQs.push({
          archetype: res.archetype,
          diffBadge: res.diffBadge,
          prompt: res.prompt.slice(0, 95),
          correct: res.reveal.correct,
        });
        if (i === 0) {
          const shot4 = await brOff.screenshot('04_offline_baseball_briefing_live_390x844.png');
          recordShot(shot4, 'Live Baseball Briefing gameplay & Reveal in 100% Airplane Mode (390x844)');
        }
        if (i < 2) {
          await brOff.clickSelector('#ws-btn-next-q');
          await brOff.waitFor(`Boolean(!document.querySelector('.ws-intel-flash') && document.querySelector('.ws-question-prompt'))`, 8000, 100);
          await sleep(300);
        }
      }
      const glBbOffline = await brOff.evalJs(`window.__rtV2MeasureGl(1200)`);
      const audioBbOffline = await brOff.evalJs(`window.__rtV2.audioStats`);
      const capLogLive = await brOff.evalJs(`window.__rtV2.capLog`);
      const unhandledOffline = await brOff.evalJs(`window.__rtV2.unhandledRejections`);

      // Filter out only browser-internal `/sw.js` update checks (which Chromium attempts silently on nav)
      // while strictly requiring ZERO app asset/data server hits & ZERO HTTP 4xx/5xx/loadingFailed fetches!
      const appOfflineHits = srv.getOfflineHits().filter((h) => h.url !== '/sw.js');
      const webglActiveOffline =
        glBbOffline.avgDrawCalls > 0 || glBbOffline.totalDrawCalls > glInstant.totalDrawCalls;
      gate(
        '1C.offline_baseball_match_zero_errors',
        offlineBaseballQs.length === 3 &&
          webglActiveOffline &&
          glBbOffline.shaderErrors.length === 0 &&
          (audioBbOffline.bufferSourcesStarted > 0 || audioBbOffline.decodeCalls > 0 || audioBbOffline.mediaPlays > 0) &&
          brOff.consoleErrors.length === 0 &&
          brOff.pageExceptions.length === 0 &&
          brOff.failedFetches.length === 0 &&
          unhandledOffline.length === 0 &&
          appOfflineHits.length === 0,
        {
          questionsPlayedOffline: offlineBaseballQs.length,
          samplePrompts: offlineBaseballQs.map((x) => x.prompt),
          glAvgDrawCalls: glBbOffline.avgDrawCalls,
          glTotalDrawCalls: glBbOffline.totalDrawCalls,
          webglActiveOffline,
          audio: audioBbOffline,
          consoleErrors: brOff.consoleErrors.slice(),
          pageExceptions: brOff.pageExceptions.slice(),
          failedFetches: brOff.failedFetches.slice(),
          unhandledRejections: unhandledOffline,
          appOfflineHits,
        },
      );

      gate(
        '1B.live_browser_capacitor_haptics_fired',
        capLogLive.impact.length > 0 && capLogLive.notification.length > 0,
        { capAfterVault, capLogLive },
      );

      report.part1_offlineAndCapacitor = {
        swState,
        packState,
        offlineBaseballQs,
        glBbOffline,
        audioBbOffline,
        capLogLive,
        appOfflineHits: appOfflineHits.length,
      };
    } finally {
      srv.setOfflineGate(false);
      await brOff.close();
    }

    // ========================================================================
    // PART 2 & PART 3A/3B: LIVE BROWSER SRS MASTERY DECK + REVEAL ACTION ROW
    //                      + UPVOTE / FLAG QUARANTINE + 30 BASEBALL QUESTIONS
    // ========================================================================
    console.log('\n========================================================================');
    console.log('PART 2: UPGRADE #5B — 5-BOX LEITNER SPACED-REPETITION MASTERY DECK');
    console.log('PART 3A: REVEAL UPVOTE/FLAG GEOMETRY (360x640 & 390x844) + QUARANTINE');
    console.log('========================================================================');

    const br = await launchCdpSession({ width: 390, height: 844, injectCapacitorMock: false });
    try {
      await br.setViewport({ width: 390, height: 844, mobile: true, dpr: 2 });
      await br.navigate(`${srv.baseUrl}/?nosw=1`);
      await br.waitFor(`Boolean(document.querySelector('#ws-title-enter-cta'))`, 25000, 150);
      await br.evalJs(`localStorage.clear()`);
      await br.reload(true);
      await br.waitFor(`Boolean(document.querySelector('#ws-title-enter-cta'))`, 25000, 150);
      await sleep(900);

      // Launch a 20-Q Baseball Briefing so we can:
      //  - Intentionally miss >= 2 questions
      //  - Bookmark 1 question (#ws-btn-bookmark)
      //  - Test Upvote (#ws-btn-q-upvote) & Flag Quarantine (#ws-btn-q-flag) + 0px overlap at 390x844 & 360x640
      //  - Collect 30 live Baseball questions total across 2 rounds!
      await launchBaseballBriefingLive(br, { roundCount: 20, diff: 'ADAPTIVE' });

      let missCount = 0;
      let bookmarkedCount = 0;
      let upvotedQid = null;
      let flaggedQid = null;
      let flaggedPromptText = '';
      let geometry390 = null;
      let geometry360 = null;
      const liveBaseballSamples = [];

      for (let qi = 0; qi < 20; qi++) {
        const q = await readLiveQuestionDom(br);
        // Pick a facet guaranteed to be WRONG if we still need 2 misses!
        let pickIdx = 0;
        if (missCount < 2 && q.facets.length >= 2) {
          const knownAns = knownAnswersByPromptPrefix.get(q.prompt.toLowerCase().slice(0, 90));
          if (knownAns) {
            const wrong = q.facets.find((f) => f.text.toLowerCase() !== knownAns);
            if (wrong) pickIdx = wrong.idx;
          } else {
            // Try option D (index 3) — 75% chance of wrong on 4-choice!
            pickIdx = q.facets.length - 1;
          }
        }

        const res = await submitCurrentQuestionLive(br, pickIdx);
        liveBaseballSamples.push({
          idx: qi + 1,
          archetype: res.archetype,
          diffBadge: res.diffBadge,
          prompt: res.prompt,
          facets: res.facets.map((f) => f.text),
          hasVisual: res.hasVisual,
          correct: res.reveal.correct,
        });

        if (!res.reveal.correct) missCount++;

        // Bookmark 1 question via ☆ SAVE (#ws-btn-bookmark)
        if (bookmarkedCount === 0) {
          await br.clickSelector('#ws-btn-bookmark');
          await sleep(220);
          bookmarkedCount++;
        }

        // Test Upvote & Reveal Row Geometry on 390x844 on first SIGHTLINE_LOCK (4 A-D facets)
        if (!geometry390 && res.archetype === 'SIGHTLINE_LOCK' && res.facets.length === 4) {
          geometry390 = await br.evalJs(`(() => {
            const row = document.querySelector('.ws-reveal-action-row');
            const rr = row ? row.getBoundingClientRect() : null;
            const btns = row ? Array.from(row.querySelectorAll('button')).map((b) => {
              const r = b.getBoundingClientRect();
              return { id: b.id, top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) };
            }) : [];
            const facets = Array.from(document.querySelectorAll('[data-facet-idx]')).map((f) => {
              const r = f.getBoundingClientRect();
              return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) };
            });
            let maxOverlapPx = 0;
            if (rr) {
              for (const f of facets) {
                const ox = Math.max(0, Math.min(rr.right, f.right) - Math.max(rr.left, f.left));
                const oy = Math.max(0, Math.min(rr.bottom, f.bottom) - Math.max(rr.top, f.top));
                if (ox > 0 && oy > 0) maxOverlapPx = Math.max(maxOverlapPx, Math.round(oy));
              }
            }
            const singleRow = btns.length >= 4 && btns.every((b) => Math.abs(b.top - btns[0].top) <= 8);
            const withinViewport = rr ? (rr.right <= window.innerWidth + 1 && rr.bottom <= window.innerHeight + 1) : false;
            return {
              vw: window.innerWidth, vh: window.innerHeight,
              facetCount: facets.length,
              rowHeight: rr ? Math.round(rr.height) : 0,
              singleRow, maxOverlapPx, withinViewport, btns,
            };
          })()`);

          await br.clickSelector('#ws-btn-q-upvote');
          await sleep(220);
          const upState = await br.evalJs(`(() => {
            const btn = document.querySelector('#ws-btn-q-upvote');
            const raw = localStorage.getItem('ws_question_feedback_v1');
            const parsed = raw ? JSON.parse(raw) : null;
            const entries = parsed?.entries ? Object.values(parsed.entries) : [];
            const up = entries.find((e) => e.vote === 'UPVOTE');
            return { pressed: btn?.getAttribute('aria-pressed'), isUpvoted: btn?.classList.contains('is-upvoted'), entry: up };
          })()`);
          upvotedQid = upState?.entry?.qid ?? null;
          const shot11 = await br.screenshot('11_reveal_upvote_390x844.png');
          recordShot(shot11, 'Reveal single 44px action row with Upvote active (390x844)');
          gate(
            '3A.reveal_upvote_and_geometry_390x844',
            Boolean(
              geometry390.singleRow &&
                geometry390.facetCount === 4 &&
                geometry390.rowHeight <= 52 &&
                geometry390.maxOverlapPx === 0 &&
                geometry390.withinViewport &&
                upState.pressed === 'true' &&
                upvotedQid > 0,
            ),
            { geometry390, upState },
          );
        }

        // Test Flag Quarantine & Reveal Row Geometry on 360x640 on second SIGHTLINE_LOCK (4 A-D facets)
        else if (geometry390 && !geometry360 && res.archetype === 'SIGHTLINE_LOCK' && res.facets.length === 4) {
          await br.setViewport({ width: 360, height: 640, mobile: true, dpr: 2 });
          await sleep(300);
          geometry360 = await br.evalJs(`(() => {
            const row = document.querySelector('.ws-reveal-action-row');
            const rr = row ? row.getBoundingClientRect() : null;
            const btns = row ? Array.from(row.querySelectorAll('button')).map((b) => {
              const r = b.getBoundingClientRect();
              return { id: b.id, top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) };
            }) : [];
            const facets = Array.from(document.querySelectorAll('[data-facet-idx]')).map((f) => {
              const r = f.getBoundingClientRect();
              return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) };
            });
            let maxOverlapPx = 0;
            if (rr) {
              for (const f of facets) {
                const ox = Math.max(0, Math.min(rr.right, f.right) - Math.max(rr.left, f.left));
                const oy = Math.max(0, Math.min(rr.bottom, f.bottom) - Math.max(rr.top, f.top));
                if (ox > 0 && oy > 0) maxOverlapPx = Math.max(maxOverlapPx, Math.round(oy));
              }
            }
            const singleRow = btns.length >= 4 && btns.every((b) => Math.abs(b.top - btns[0].top) <= 8);
            const withinViewport = rr ? (rr.right <= window.innerWidth + 1 && rr.bottom <= window.innerHeight + 1) : false;
            return {
              vw: window.innerWidth, vh: window.innerHeight,
              facetCount: facets.length,
              rowHeight: rr ? Math.round(rr.height) : 0,
              singleRow, maxOverlapPx, withinViewport, btns,
            };
          })()`);

          await br.clickSelector('#ws-btn-q-flag');
          await sleep(250);
          const flagState = await br.evalJs(`(() => {
            const btn = document.querySelector('#ws-btn-q-flag');
            const toast = document.querySelector('#ws-q-feedback-toast')?.textContent?.trim() || '';
            const raw = localStorage.getItem('ws_question_feedback_v1');
            const parsed = raw ? JSON.parse(raw) : null;
            const entries = parsed?.entries ? Object.values(parsed.entries) : [];
            const fl = entries.find((e) => e.vote === 'FLAG');
            return { pressed: btn?.getAttribute('aria-pressed'), isFlagged: btn?.classList.contains('is-flagged'), toast, entry: fl };
          })()`);
          flaggedQid = flagState?.entry?.qid ?? null;
          flaggedPromptText = res.prompt;
          const shot10 = await br.screenshot('10_reveal_flag_quarantine_360x640.png');
          recordShot(shot10, 'Reveal single 44px action row with Flag Quarantine active (360x640)');
          gate(
            '3A.reveal_flag_and_geometry_360x640',
            Boolean(
              geometry360.singleRow &&
                geometry360.facetCount === 4 &&
                geometry360.rowHeight <= 52 &&
                geometry360.maxOverlapPx === 0 &&
                geometry360.withinViewport &&
                flagState.pressed === 'true' &&
                flaggedQid > 0,
            ),
            { geometry360, flagState },
          );

          await br.setViewport({ width: 390, height: 844, mobile: true, dpr: 2 });
          await sleep(220);
        }

        // Advance to next question or finish stage
        await br.clickSelector('#ws-btn-next-q');
        if (qi < 19) {
          await br.waitFor(`Boolean(!document.querySelector('.ws-intel-flash') && document.querySelector('.ws-question-prompt'))`, 10000, 100);
          await sleep(160);
        } else {
          await br.waitFor(`Boolean(document.querySelector('#ws-btn-share-duel-link, .ws-summary-card, #ws-util-vault'))`, 10000, 120);
          await sleep(300);
        }
      }

      // Now verify Upgrade #5B (Spaced-Repetition Mastery Deck)!
      // Open Vault -> check #ws-vault-srs live Due count badge (>= 2)
      await br.clickSelector('#ws-util-vault');
      await sleep(350);
      const vaultSrs = await br.evalJs(`(() => {
        const row = document.querySelector('#ws-vault-srs');
        const badge = document.querySelector('#ws-vault-srs-badge')?.textContent?.trim() || '';
        const raw = localStorage.getItem('ws_spaced_repetition_v2');
        const parsed = raw ? JSON.parse(raw) : null;
        const m = badge.match(/(\\d+)\\s*Due/i);
        return {
          exists: Boolean(row),
          badge,
          dueParsed: m ? Number(m[1]) : 0,
          storedCardsCount: parsed?.cards?.length ?? 0,
          storedBoxes: (parsed?.cards || []).map((c) => ({ qid: c.qid, box: c.box, source: c.source, isBookmarked: c.isBookmarked })),
        };
      })()`);
      const shot5 = await br.screenshot('05_vault_srs_due_badge_390x844.png');
      recordShot(shot5, `Vault drawer showing live #ws-vault-srs "${vaultSrs.badge}" badge (390x844)`);
      gate(
        '2A.srs_miss_capture_and_vault_due_badge',
        Boolean(missCount >= 2 && bookmarkedCount >= 1 && vaultSrs.exists && vaultSrs.dueParsed >= 2),
        { missCount, bookmarkedCount, vaultSrs },
      );

      // Open Spaced-Repetition Mastery Deck via #ws-vault-srs!
      await br.clickSelector('#ws-vault-srs');
      const srsOpened = await br.waitFor(`Boolean(document.querySelector('#ws-srs-box-bars') && document.querySelector('#ws-srs-runner'))`, 10000, 120);
      await sleep(500);

      // Measure Box 1-5 layout cleanly on 390x844
      const srsLayout390 = await br.evalJs(`(() => {
        const bars = Array.from(document.querySelectorAll('#ws-srs-box-bars [data-srs-box]')).map((el) => {
          const r = el.getBoundingClientRect();
          return {
            box: Number(el.dataset.srsBox),
            count: Number(el.dataset.srsBoxCount),
            left: Math.round(r.left), right: Math.round(r.right),
            top: Math.round(r.top), bottom: Math.round(r.bottom),
            w: Math.round(r.width), h: Math.round(r.height),
          };
        });
        let overlap = false;
        for (let i = 0; i < bars.length; i++) {
          for (let j = i + 1; j < bars.length; j++) {
            const ox = Math.min(bars[i].right, bars[j].right) - Math.max(bars[i].left, bars[j].left);
            const oy = Math.min(bars[i].bottom, bars[j].bottom) - Math.max(bars[i].top, bars[j].top);
            if (ox > 1 && oy > 1) overlap = true;
          }
        }
        const grid = document.querySelector('#ws-srs-box-bars');
        const gr = grid ? grid.getBoundingClientRect() : null;
        return {
          dueText: document.querySelector('#ws-srs-due-count')?.textContent?.trim(),
          totalText: document.querySelector('#ws-srs-total-count')?.textContent?.trim(),
          barsCount: bars.length,
          allVisible: bars.every((b) => b.w > 20 && b.h > 20),
          overlap,
          overflowX: grid ? grid.scrollWidth > grid.clientWidth + 2 : true,
          withinVw: gr ? gr.right <= window.innerWidth + 2 : false,
          bars,
        };
      })()`);
      const shot6 = await br.screenshot('06_srs_mastery_deck_390x844.png');
      recordShot(shot6, 'Spaced-Repetition Mastery Deck Box 1-5 bars & due card runner (390x844)');
      gate(
        '2B.srs_box_bars_layout_390x844',
        Boolean(srsOpened && srsLayout390.barsCount === 5 && srsLayout390.allVisible && !srsLayout390.overlap && !srsLayout390.overflowX && srsLayout390.withinVw),
        srsLayout390,
      );

      // Resize to 360x640 and verify Box 1-5 bars render cleanly!
      await br.setViewport({ width: 360, height: 640, mobile: true, dpr: 2 });
      await sleep(350);
      const srsLayout360 = await br.evalJs(`(() => {
        const bars = Array.from(document.querySelectorAll('#ws-srs-box-bars [data-srs-box]')).map((el) => {
          const r = el.getBoundingClientRect();
          return {
            box: Number(el.dataset.srsBox),
            left: Math.round(r.left), right: Math.round(r.right),
            top: Math.round(r.top), bottom: Math.round(r.bottom),
            w: Math.round(r.width), h: Math.round(r.height),
          };
        });
        let overlap = false;
        for (let i = 0; i < bars.length; i++) {
          for (let j = i + 1; j < bars.length; j++) {
            const ox = Math.min(bars[i].right, bars[j].right) - Math.max(bars[i].left, bars[j].left);
            const oy = Math.min(bars[i].bottom, bars[j].bottom) - Math.max(bars[i].top, bars[j].top);
            if (ox > 1 && oy > 1) overlap = true;
          }
        }
        const grid = document.querySelector('#ws-srs-box-bars');
        const gr = grid ? grid.getBoundingClientRect() : null;
        const filters = Array.from(document.querySelectorAll('[data-srs-filter]')).map((el) => {
          const r = el.getBoundingClientRect();
          return { text: el.textContent?.trim(), right: Math.round(r.right), clipped: r.right > window.innerWidth + 2 };
        });
        return {
          barsCount: bars.length,
          allVisible: bars.every((b) => b.w > 20 && b.h > 20),
          overlap,
          overflowX: grid ? grid.scrollWidth > grid.clientWidth + 2 : true,
          withinVw: gr ? gr.right <= window.innerWidth + 2 : false,
          filters,
          filtersAllUnclipped: filters.length >= 3 && filters.every((f) => !f.clipped),
        };
      })()`);
      const shot7 = await br.screenshot('07_srs_mastery_deck_360x640.png');
      recordShot(shot7, 'Spaced-Repetition Mastery Deck Box 1-5 bars on compact 360x640');
      gate(
        '2B.srs_box_bars_layout_360x640',
        Boolean(
          srsLayout360.barsCount === 5 &&
            srsLayout360.allVisible &&
            !srsLayout360.overlap &&
            !srsLayout360.overflowX &&
            srsLayout360.withinVw &&
            srsLayout360.filtersAllUnclipped,
        ),
        srsLayout360,
      );

      // Switch back to 390x844 to perform live Correct Promotion (Box 1 -> Box 2) & Wrong Reset (-> Box 1)
      await br.setViewport({ width: 390, height: 844, mobile: true, dpr: 2 });
      await sleep(250);

      const beforeCorrect = await br.evalJs(`(() => {
        const due = Number(document.querySelector('#ws-srs-due-count')?.textContent?.trim() || '0');
        const qid = Number(document.querySelector('#ws-srs-runner')?.dataset?.srsActiveQid || '0');
        const parsed = JSON.parse(localStorage.getItem('ws_spaced_repetition_v2') || '{}');
        const card = (parsed.cards || []).find((c) => c.qid === qid);
        return { due, qid, boxBefore: card?.box ?? null };
      })()`);

      await br.clickSelector('#ws-srs-runner [data-quiz-pick][data-srs-correct="true"]');
      await sleep(300);

      const afterCorrect = await br.evalJs(`(() => {
        const due = Number(document.querySelector('#ws-srs-due-count')?.textContent?.trim() || '0');
        const badgeText = document.querySelector('#ws-srs-promotion-badge')?.textContent?.replace(/\\s+/g, ' ').trim() || '';
        const badgePromoted = document.querySelector('#ws-srs-promotion-badge')?.classList.contains('is-promoted') || false;
        const parsed = JSON.parse(localStorage.getItem('ws_spaced_repetition_v2') || '{}');
        const card = (parsed.cards || []).find((c) => c.qid === ${beforeCorrect.qid});
        const box2Count = Number(document.querySelector('[data-srs-box="2"]')?.dataset?.srsBoxCount || '0');
        return { due, badgeText, badgePromoted, boxAfter: card?.box ?? null, nextReviewFuture: card ? card.nextReviewAtMs > Date.now() : false, box2Count };
      })()`);
      const shot8 = await br.screenshot('08_srs_promotion_box1_to_box2_390x844.png');
      recordShot(shot8, 'SRS due card answered correctly: Box 1 -> Box 2 promotion & dueCount decremented (390x844)');
      gate(
        '2C.srs_correct_promotes_box1_to_box2_and_decrements_due',
        Boolean(
          beforeCorrect.boxBefore === 1 &&
            afterCorrect.boxAfter === 2 &&
            afterCorrect.badgePromoted &&
            afterCorrect.nextReviewFuture &&
            afterCorrect.due === beforeCorrect.due - 1,
        ),
        { beforeCorrect, afterCorrect },
      );

      // Advance to next due card & answer WRONG -> prove reset to Box 1!
      await br.clickSelector('#ws-obs-quiz-next');
      await sleep(300);
      const beforeWrong = await br.evalJs(`(() => {
        const due = Number(document.querySelector('#ws-srs-due-count')?.textContent?.trim() || '0');
        const qid = Number(document.querySelector('#ws-srs-runner')?.dataset?.srsActiveQid || '0');
        return { due, qid };
      })()`);
      await br.clickSelector('#ws-srs-runner [data-quiz-pick][data-srs-correct="false"]');
      await sleep(300);
      const afterWrong = await br.evalJs(`(() => {
        const due = Number(document.querySelector('#ws-srs-due-count')?.textContent?.trim() || '0');
        const badgeText = document.querySelector('#ws-srs-promotion-badge')?.textContent?.replace(/\\s+/g, ' ').trim() || '';
        const badgeReset = document.querySelector('#ws-srs-promotion-badge')?.classList.contains('is-reset') || false;
        const parsed = JSON.parse(localStorage.getItem('ws_spaced_repetition_v2') || '{}');
        const card = (parsed.cards || []).find((c) => c.qid === ${beforeWrong.qid});
        return { due, badgeText, badgeReset, boxAfter: card?.box ?? null, dueNow: card ? card.nextReviewAtMs <= Date.now() + 2000 : false };
      })()`);
      const shot9 = await br.screenshot('09_srs_wrong_reset_box1_390x844.png');
      recordShot(shot9, 'SRS due card answered wrong: reset to Box 1 immediate review (390x844)');

      // Also verify Box 2 -> Box 1 reset explicitly by switching filter to ALL, picking the Box 2 card we just promoted, and answering it wrong!
      await br.clickSelector('[data-srs-filter="ALL"]');
      await sleep(250);
      await br.clickSelector('[data-srs-box="2"]');
      await sleep(250);
      const box2Pre = await br.evalJs(`(() => {
        const qid = Number(document.querySelector('#ws-srs-runner')?.dataset?.srsActiveQid || '0');
        const parsed = JSON.parse(localStorage.getItem('ws_spaced_repetition_v2') || '{}');
        const card = (parsed.cards || []).find((c) => c.qid === qid);
        return { qid, boxBefore: card?.box ?? null };
      })()`);
      let box2ResetOk = false;
      let box2Post = null;
      if (box2Pre.qid > 0 && box2Pre.boxBefore === 2) {
        await br.clickSelector('#ws-srs-runner [data-quiz-pick][data-srs-correct="false"]');
        await sleep(300);
        box2Post = await br.evalJs(`(() => {
          const parsed = JSON.parse(localStorage.getItem('ws_spaced_repetition_v2') || '{}');
          const card = (parsed.cards || []).find((c) => c.qid === ${box2Pre.qid});
          return { boxAfter: card?.box ?? null, dueNow: card ? card.nextReviewAtMs <= Date.now() + 2000 : false };
        })()`);
        box2ResetOk = box2Post.boxAfter === 1 && box2Post.dueNow;
      }
      gate(
        '2C.srs_wrong_resets_to_box1',
        Boolean(afterWrong.boxAfter === 1 && afterWrong.badgeReset && afterWrong.dueNow && box2ResetOk),
        { beforeWrong, afterWrong, box2Pre, box2Post },
      );

      // Reload page to verify quarantine persists in localStorage & collect 10 MORE live Baseball questions (= 30 total!)
      await br.reload(true);
      await br.waitFor(`Boolean(document.querySelector('#ws-title-enter-cta'))`, 25000, 150);
      await sleep(700);
      await launchBaseballBriefingLive(br, { roundCount: 10, diff: 'ADAPTIVE' });
      for (let qi = 0; qi < 10; qi++) {
        const res = await submitCurrentQuestionLive(br, qi % 4);
        liveBaseballSamples.push({
          idx: 20 + qi + 1,
          archetype: res.archetype,
          diffBadge: res.diffBadge,
          prompt: res.prompt,
          facets: res.facets.map((f) => f.text),
          hasVisual: res.hasVisual,
          correct: res.reveal.correct,
        });
        if (qi < 9) {
          await br.clickSelector('#ws-btn-next-q');
          await br.waitFor(`Boolean(!document.querySelector('.ws-intel-flash') && document.querySelector('.ws-question-prompt'))`, 10000, 100);
          await sleep(160);
        }
      }

      // Analyze the 30 live Baseball Briefing questions!
      const uniqueBbPrompts = new Set(liveBaseballSamples.map((s) => s.prompt)).size;
      const dryLegacyCount = liveBaseballSamples.filter((s) =>
        /^Which baseball figure earned the MLB honor:/i.test(s.prompt),
      ).length;
      const yearCommaInLive30 = liveBaseballSamples.filter((s) => {
        RE_YEAR_COMMA.lastIndex = 0;
        return RE_YEAR_COMMA.test(s.prompt) || s.facets.some((f) => { RE_YEAR_COMMA.lastIndex = 0; return RE_YEAR_COMMA.test(f); });
      });
      const dupOptionsInLive30 = liveBaseballSamples.filter((s) => {
        const low = s.facets.map((f) => f.toLowerCase());
        return new Set(low).size < low.length;
      });
      // Check flagged prompt never reappeared in the post-reload 10-Q round
      const flaggedRedrawnInReloadRound = liveBaseballSamples
        .slice(20)
        .some((s) => flaggedPromptText && s.prompt === flaggedPromptText);

      gate(
        '3B.live_30_baseball_briefing_questions_narrative_and_hygiene',
        liveBaseballSamples.length === 30 &&
          uniqueBbPrompts >= 28 &&
          dryLegacyCount === 0 &&
          yearCommaInLive30.length === 0 &&
          dupOptionsInLive30.length === 0 &&
          !flaggedRedrawnInReloadRound,
        {
          totalSampled: liveBaseballSamples.length,
          uniquePrompts: uniqueBbPrompts,
          dryLegacyCount,
          yearCommaDefects: yearCommaInLive30.length,
          dupOptionsDefects: dupOptionsInLive30.length,
          flaggedQid,
          flaggedRedrawnInReloadRound,
          sampleStems: liveBaseballSamples.slice(0, 8).map((s) => `[${s.archetype}|${s.diffBadge}] ${s.prompt.slice(0, 105)}`),
        },
      );

      report.part2_spacedRepetition = {
        missCount,
        bookmarkedCount,
        vaultSrs,
        srsLayout390,
        srsLayout360,
        beforeCorrect,
        afterCorrect,
        beforeWrong,
        afterWrong,
        box2Pre,
        box2Post,
      };
      report.part3_jeopardyFeedbackCorpus.liveBaseball30 = {
        total: liveBaseballSamples.length,
        uniquePrompts: uniqueBbPrompts,
        upvotedQid,
        flaggedQid,
        flaggedRedrawnInReloadRound,
        geometry390,
        geometry360,
        samples: liveBaseballSamples,
      };

      // ======================================================================
      // PART 4: #329 — 5-TIER DIFFICULTY CALIBRATION (MIDDLE SCHOOL vs MENSA)
      //         + 84 MEDALS/TROPHIES & 44 UNLOCKABLES (16 ATELIER FINISHES)
      // ======================================================================
      console.log('\n========================================================================');
      console.log('PART 4: #329 — 5-TIER DIFFICULTY (MID SCHOOL vs MENSA) + 84 HONOURS/16 FINISHES');
      console.log('========================================================================');

      await br.navigate(`${srv.baseUrl}/?nosw=1`);
      await br.waitFor(`Boolean(document.querySelector('#ws-title-enter-cta'))`, 20000, 150);
      await sleep(700);

      // 4A. Check 6 difficulty pills fit 360x640 with 0px overflow & launch MIDDLE_SCHOOL Baseball
      await br.setViewport({ width: 360, height: 640, mobile: true, dpr: 2 });
      await sleep(250);
      await br.clickSelector('[data-title-mode="BRIEFING"]');
      await br.waitFor(`Boolean(document.querySelector('.ws-briefing-diff-strip'))`, 10000, 120);
      await sleep(250);

      const diffStrip360 = await br.evalJs(`(() => {
        const strip = document.querySelector('.ws-briefing-diff-strip');
        const btns = Array.from(document.querySelectorAll('.ws-briefing-diff-strip [data-diff]')).map((b) => ({
          val: b.dataset.diff,
          label: b.textContent?.trim(),
          w: Math.round(b.getBoundingClientRect().width),
          right: Math.round(b.getBoundingClientRect().right),
        }));
        const sr = strip ? strip.getBoundingClientRect() : null;
        return {
          count: btns.length,
          labels: btns.map((b) => b.label),
          overflowX: strip ? strip.scrollWidth > strip.clientWidth + 2 : true,
          withinVw: sr ? sr.right <= window.innerWidth + 2 : false,
        };
      })()`);
      gate(
        '4A.difficulty_6_pills_fit_360x640',
        diffStrip360.count === 6 && !diffStrip360.overflowX && diffStrip360.withinVw,
        diffStrip360,
      );

      // Switch to 390x844, launch MIDDLE_SCHOOL Baseball (5 Qs), verify #ws-question-difficulty-badge
      await br.setViewport({ width: 390, height: 844, mobile: true, dpr: 2 });
      await sleep(200);
      await br.clickSelector('[data-pick-l0="5"]');
      await sleep(180);
      await br.clickSelector('[data-pick-l1="sports"]');
      await sleep(180);
      await br.clickSelector('[data-pick-l2="sports_baseball"]');
      await sleep(180);
      await br.clickSelector('[data-diff="MIDDLE_SCHOOL"]');
      await sleep(140);
      await br.clickSelector('[data-len="5"]');
      await sleep(140);
      const msIndicator = await br.evalJs(`document.querySelector('#ws-briefing-diff-indicator')?.textContent?.replace(/\\s+/g, ' ').trim() || ''`);
      await br.clickSelector('#ws-cat-launch');
      await br.waitFor(`Boolean(document.querySelector('.ws-question-prompt'))`, 12000, 120);
      await sleep(450);

      const msQ = await readLiveQuestionDom(br);
      const shot12 = await br.screenshot('12_difficulty_middle_school_390x844.png');
      recordShot(shot12, `Live MIDDLE_SCHOOL Baseball Briefing with badge "${msQ.diffBadge}" (390x844)`);
      gate(
        '4A.live_middle_school_badge_and_accessible_morph',
        /MIDDLE SCHOOL/i.test(msQ.diffBadge) &&
          msQ.archetype !== 'CODEX_DUAL_RING' &&
          msQ.archetype !== 'CALIBRATOR_DIAL',
        { msIndicator, msBadge: msQ.diffBadge, archetype: msQ.archetype, prompt: msQ.prompt.slice(0, 95) },
      );

      // Now launch MENSA Baseball (5 Qs) and verify MENSA badge!
      await br.navigate(`${srv.baseUrl}/?nosw=1`);
      await br.waitFor(`Boolean(document.querySelector('[data-title-mode="BRIEFING"]'))`, 20000, 150);
      await sleep(600);
      await launchBaseballBriefingLive(br, { roundCount: 5, diff: 'MENSA' });
      const mensaQ = await readLiveQuestionDom(br);
      const shot13 = await br.screenshot('13_difficulty_mensa_390x844.png');
      recordShot(shot13, `Live MENSA Baseball Briefing with badge "${mensaQ.diffBadge}" (390x844)`);
      gate(
        '4A.live_mensa_badge',
        /MENSA|GRADUATE/i.test(mensaQ.diffBadge),
        { mensaBadge: mensaQ.diffBadge, archetype: mensaQ.archetype, prompt: mensaQ.prompt.slice(0, 95) },
      );

      // 4B. Verify 84 Medals & Trophies + 44 Unlockables + 16 Atelier Finishes in live Vault, Honours & Atelier!
      await br.navigate(`${srv.baseUrl}/?nosw=1`);
      await br.waitFor(`Boolean(document.querySelector('#ws-util-vault'))`, 20000, 150);
      await sleep(600);
      await br.clickSelector('#ws-util-vault');
      await sleep(320);

      const vaultCounts = await br.evalJs(`(() => ({
        trophiesTitle: document.querySelector('#ws-vault-trophies-title')?.textContent?.trim() || '',
        atelierSub: document.querySelector('#ws-vault-atelier-sub')?.textContent?.trim() || '',
      }))()`);

      // Open Hall of Honours
      await br.clickSelector('#ws-util-trophies');
      await br.waitFor(`Boolean(document.querySelector('.ws-meta-backdrop'))`, 10000, 120);
      await sleep(500);
      const honoursDom = await br.evalJs(`(() => {
        const host = document.querySelector('.ws-meta-backdrop');
        const txt = host?.textContent?.replace(/\\s+/g, ' ') || '';
        const trophyCards = host ? host.querySelectorAll('[data-honour-id], .ws-honour-card, .ws-trophy-card, .ws-meta-row, .ws-honour-row').length : 0;
        return {
          has84Text: /\\b84\\b/.test(txt),
          has44Text: /\\b44\\b/.test(txt),
          hasMensaLaureate: /Mensa 99th-Percentile Laureate|Honor Roll Foundations|Geodesic Sharpshooter/i.test(txt),
          trophyCards,
          headerSnippet: txt.slice(0, 260),
        };
      })()`);
      const shot14 = await br.screenshot('14_honours_84_trophies_390x844.png');
      recordShot(shot14, 'Hall of Honours displaying 84 Medals & Trophies + 44 Unlockables (390x844)');

      // Switch to Prism Atelier via Vault Jumper inside meta modal
      await br.clickSelector('.ws-meta-backdrop [data-vault-trigger]');
      await sleep(220);
      await br.clickSelector('.ws-meta-backdrop [data-suite-nav="ATELIER"]');
      await sleep(700);
      const atelierDom = await br.evalJs(`(() => {
        const host = document.querySelector('.ws-meta-backdrop');
        const txt = host?.textContent?.replace(/\\s+/g, ' ') || '';
        const finishCards = host ? host.querySelectorAll('[data-finish-id], [data-prism-finish]').length : 0;
        return {
          has16Text: /\\b16\\b/.test(txt),
          finishCards,
          hasV2FinishNames: /Blueprint Cyanotype|Bloodstone Platinum|Neural Engram|Quantum Iridium/i.test(txt),
          snippet: txt.slice(0, 260),
        };
      })()`);
      const shot15 = await br.screenshot('15_atelier_16_finishes_390x844.png');
      recordShot(shot15, 'Prism Atelier displaying 16 3D Finishes (390x844)');

      gate(
        '4B.honours_84_trophies_44_unlockables_16_atelier_finishes',
        Boolean(
          /84/.test(vaultCounts.trophiesTitle) &&
            /16 Finishes/i.test(vaultCounts.atelierSub) &&
            honoursDom.has84Text &&
            honoursDom.has44Text &&
            (atelierDom.finishCards === 16 || (atelierDom.has16Text && atelierDom.hasV2FinishNames)),
        ),
        { vaultCounts, honoursDom, atelierDom },
      );

      report.part4_difficultyAndHonours = { diffStrip360, msIndicator, msQ, mensaQ, vaultCounts, honoursDom, atelierDom };
    } finally {
      await br.close();
    }

    // ========================================================================
    // PART 3C: COMPILED FORGE ENGINE QUARANTINE STRESS + ALL 12 DOMAINS
    //          JEOPARDY STEMVARIANTS + ERA DISTRACTORS + V2.0 PACKS AUDIT
    // ========================================================================
    console.log('\n========================================================================');
    console.log('PART 3C: ALL 12 DOMAINS STEMVARIANTS + V2.0 PACKS + QUARANTINE PROOF');
    console.log('========================================================================');

    // 1. Audit shard_manifest.json & taxonomy_tree.json stemVariants across ALL 12 domains & 157 L2s
    const manifest = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, 'shard_manifest.json'), 'utf8'));
    const taxTree = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, 'taxonomy_tree.json'), 'utf8'));
    const bbShard = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, 'subcat_baseball.json'), 'utf8'));

    function extractPlaceholders(str) {
      return Array.from(String(str || '').matchAll(/\{[a-zA-Z0-9_]+\}/g)).map((m) => m[0]).sort().join(',');
    }

    let manifestAngles = 0;
    let manifestAnglesWithVariants = 0;
    let manifestPlaceholderMismatches = 0;
    for (const [typeName, spec] of Object.entries(manifest.types || {})) {
      for (const ang of spec.angles || []) {
        manifestAngles++;
        if (ang.archetype === 'GAUNTLET_SHATTER') {
          const tv = ang.truePromptVariants || [];
          const fv = ang.falsePromptVariants || [];
          if (tv.length >= 4 && fv.length >= 4) manifestAnglesWithVariants++;
          const baseT = extractPlaceholders(ang.truePrompt);
          const baseF = extractPlaceholders(ang.falsePrompt);
          if (tv.some((v) => extractPlaceholders(v) !== baseT) || fv.some((v) => extractPlaceholders(v) !== baseF)) {
            manifestPlaceholderMismatches++;
          }
        } else {
          const sv = ang.stemVariants || [];
          if (sv.length >= 4) manifestAnglesWithVariants++;
          const base = extractPlaceholders(ang.prompt);
          if (sv.some((v) => extractPlaceholders(v) !== base)) {
            manifestPlaceholderMismatches++;
          }
        }
      }
    }

    let taxAngles = 0;
    let taxAnglesWithVariants = 0;
    let taxPlaceholderMismatches = 0;
    for (const [typeName, spec] of Object.entries(taxTree.types || {})) {
      for (const ang of spec.angles || []) {
        // Skip bespoke passthrough story tables (`prompt: "{prompt}"`, e.g. sub_bb_signature_lore)
        // where every row IS an individually authored narrative story!
        if (ang.prompt === '{prompt}') continue;
        taxAngles++;
        if (ang.archetype === 'GAUNTLET_SHATTER') {
          const tv = ang.truePromptVariants || [];
          const fv = ang.falsePromptVariants || [];
          if (tv.length >= 4 && fv.length >= 4) taxAnglesWithVariants++;
          const baseT = extractPlaceholders(ang.truePrompt);
          const baseF = extractPlaceholders(ang.falsePrompt);
          if (tv.some((v) => extractPlaceholders(v) !== baseT) || fv.some((v) => extractPlaceholders(v) !== baseF)) {
            taxPlaceholderMismatches++;
          }
        } else {
          const sv = ang.stemVariants || [];
          if (sv.length >= 4) taxAnglesWithVariants++;
          const base = extractPlaceholders(ang.prompt);
          if (sv.some((v) => extractPlaceholders(v) !== base)) {
            taxPlaceholderMismatches++;
          }
        }
      }
    }

    const sigLoreTable = (bbShard.t || []).find((t) => t.type === 'sub_bb_signature_lore');
    const sigLoreCount = sigLoreTable?.r?.length ?? 0;

    gate(
      '3C.stemVariants_all_12_domains_and_157_subcats',
      manifestAngles > 0 &&
        manifestAngles === manifestAnglesWithVariants &&
        manifestPlaceholderMismatches === 0 &&
        taxAngles > 0 &&
        taxAngles === taxAnglesWithVariants &&
        taxPlaceholderMismatches === 0 &&
        sigLoreCount >= 250,
      {
        manifestAngles,
        manifestAnglesWithVariants,
        manifestPlaceholderMismatches,
        taxAngles,
        taxAnglesWithVariants,
        taxPlaceholderMismatches,
        subBbSignatureLoreRows: sigLoreCount,
      },
    );

    // 2. Audit visual_globe_packs.json & jeopardy_signature_packs.json (100% of items!)
    const vgPack = JSON.parse(fs.readFileSync(path.join(PUBLIC_DATA, 'visual_globe_packs.json'), 'utf8'));
    const jpPack = JSON.parse(fs.readFileSync(path.join(PUBLIC_DATA, 'jeopardy_signature_packs.json'), 'utf8'));
    const vgDefects = checkCopyDefectsInPack(vgPack.questions || [], 'visual_globe_packs.json');
    const jpDefects = checkCopyDefectsInPack(jpPack.questions || [], 'jeopardy_signature_packs.json');

    // Check every visualPlate SVG exists in dist/assets/visuals/
    const missingSvgs = [];
    for (const q of vgPack.questions || []) {
      const img = q.visualPlate?.imageUrl;
      if (img && !img.startsWith('data:')) {
        const rel = img.replace(/^\.\//, '');
        if (!fs.existsSync(path.join(DIST_DIR, rel))) {
          missingSvgs.push(rel);
        }
      }
    }

    // Check 12/12 domains & 157/157 L2 coverage in jeopardy_signature_packs.json
    const allTaxL2Ids = new Set();
    for (const d of taxTree.domains || []) {
      for (const c1 of d.l1Subcategories || d.subcategories || []) {
        for (const t2 of c1.l2Topics || c1.topics || []) {
          allTaxL2Ids.add(t2.id);
        }
      }
    }
    const jpDomains = new Set();
    const jpL2Counts = new Map();
    const jpQids = new Set();
    for (const q of jpPack.questions || []) {
      jpDomains.add(q.l0Domain ?? q.domainId);
      const l2 = q.subcatId || q.l2Id;
      if (l2) jpL2Counts.set(l2, (jpL2Counts.get(l2) || 0) + 1);
      jpQids.add(q.qid);
    }
    const uncoveredL2s = Array.from(allTaxL2Ids).filter((id) => (jpL2Counts.get(id) || 0) === 0);
    const minL2Count = allTaxL2Ids.size > 0 ? Math.min(...Array.from(allTaxL2Ids).map((id) => jpL2Counts.get(id) || 0)) : 0;

    gate(
      '3C.visual_globe_packs_zero_defects_and_svgs',
      (vgPack.questions || []).length >= 300 && vgDefects.length === 0 && missingSvgs.length === 0,
      {
        totalQuestions: (vgPack.questions || []).length,
        defects: vgDefects.slice(0, 5),
        missingSvgs: missingSvgs.slice(0, 5),
      },
    );

    gate(
      '3C.jeopardy_signature_packs_all_12_domains_157_L2s_zero_defects',
      (jpPack.questions || []).length >= 1600 &&
        allTaxL2Ids.size === 157 &&
        jpDomains.size === 12 &&
        uncoveredL2s.length === 0 &&
        minL2Count >= 8 &&
        jpDefects.length === 0,
      {
        totalQuestions: (jpPack.questions || []).length,
        domainsCovered: jpDomains.size,
        l2Covered: `${allTaxL2Ids.size - uncoveredL2s.length}/${allTaxL2Ids.size}`,
        minPerL2: minL2Count,
        defects: jpDefects.slice(0, 5),
      },
    );

    // 3. Compiled ForgeEngine Quarantine Exclusion Stress + All-12-Domains Stem Rotation + Baseball Era-Matched Distractors!
    const forgeTmp = path.join(os.tmpdir(), `ws_rt_forge_${process.pid}_${Date.now()}.mjs`);
    await esbuild({
      entryPoints: [path.join(ROOT, 'src', 'forge', 'index.ts')],
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node20',
      outfile: forgeTmp,
      logLevel: 'silent',
    });
    try {
      const forgeMod = await import(pathToFileURL(forgeTmp).href);
      const { ForgeEngine, decodeShardRawQuestion, normalizeToPrismQuestion } = forgeMod;

      // Stub local fetch reading from public/data/
      const origFetch = globalThis.fetch;
      globalThis.fetch = async (url) => {
        const s = String(url);
        const m = s.match(/data\/(.+)$/);
        if (!m) return { ok: false, status: 404, headers: new Headers(), json: async () => ({}), text: async () => '' };
        const filePath = path.join(PUBLIC_DATA, m[1]);
        if (!fs.existsSync(filePath)) {
          return { ok: false, status: 404, headers: new Headers(), json: async () => ({}), text: async () => '' };
        }
        const buf = fs.readFileSync(filePath);
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': filePath.endsWith('.json') ? 'application/json' : 'application/octet-stream' }),
          arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
          text: async () => buf.toString('utf8'),
          json: async () => JSON.parse(buf.toString('utf8')),
        };
      };

      try {
        const fe = new ForgeEngine({ dataBaseUrl: './data' });
        await fe.init();

        // Quarantine proof: draw 10 Baseball Qs, quarantine ALL 10, draw 200 more -> 0 collisions!
        const first10 = await fe.queryBriefingRoomAsync({
          domains: [5],
          l1SubcategoryId: 'sports',
          l2TopicId: 'sports_baseball',
          count: 10,
          difficultyPreset: 'ADAPTIVE',
        });
        const quarantinedSet = new Set(first10.map((q) => q.qid));
        fe.setQuarantinedQids(quarantinedSet);
        const next200 = [];
        for (let r = 0; r < 10; r++) {
          const batch = await fe.queryBriefingRoomAsync({
            domains: [5],
            l1SubcategoryId: 'sports',
            l2TopicId: 'sports_baseball',
            count: 20,
            difficultyPreset: 'ADAPTIVE',
            quarantinedQids: quarantinedSet,
          });
          next200.push(...batch);
        }
        const quarantinedLeaks = next200.filter((q) => quarantinedSet.has(q.qid));
        gate(
          '3C.quarantined_qids_strictly_excluded_200_draws',
          quarantinedSet.size === 10 && next200.length >= 180 && quarantinedLeaks.length === 0,
          { quarantinedCount: quarantinedSet.size, drawsTested: next200.length, leaks: quarantinedLeaks.length },
        );

        // Sample all 12 domains (0..11) to prove exact domain targeting + Jeopardy quality + stem variety!
        const domainSamples = {};
        let all12Ok = true;
        for (let d = 0; d < 12; d++) {
          const batch = await fe.queryBriefingRoomAsync({
            domains: [d],
            count: 10,
            difficultyPreset: 'ADAPTIVE',
          });
          const uniq = new Set(batch.map((q) => q.prompt)).size;
          const exactDomainCount = batch.filter((q) => q.l0Domain === d).length;
          const zeroCommas = batch.every((q) => {
            RE_YEAR_COMMA.lastIndex = 0;
            return !RE_YEAR_COMMA.test(q.prompt);
          });
          if (batch.length < 8 || uniq < 8 || exactDomainCount !== batch.length || !zeroCommas) all12Ok = false;
          domainSamples[d] = {
            count: batch.length,
            exactDomainCount,
            uniquePrompts: uniq,
            sample: batch[0]?.prompt?.slice(0, 100),
          };
        }
        gate('3C.all_12_domains_live_forge_sampling', all12Ok, {
          domainsTested: Object.keys(domainSamples).length,
          samples: domainSamples,
        });

        // Verify era-matched distractors on 2010s-2020s Baseball shard rows (`sub_bb_awards_hof` / `sub_bb_batting` / `sub_bb_slugger`)
        const mergedManifest = { ...manifest, types: { ...(manifest.types || {}), ...(taxTree.types || {}) } };
        let modernRowsChecked = 0;
        let modernRowsWithOldLeak = 0;
        for (let ti = 0; ti < bbShard.t.length; ti++) {
          const tbl = bbShard.t[ti];
          if (tbl.type === 'sub_bb_signature_lore' || tbl.type === 'sub_bb_ballpark') continue;
          const spec = bbShard.types?.[tbl.type] ?? mergedManifest.types[tbl.type];
          if (!spec) continue;
          for (let ri = 0; ri < Math.min(tbl.r.length, 60); ri++) {
            const row = tbl.r[ri];
            const rowStr = JSON.stringify(row);
            if (!/\b20[12]\d\b/.test(rowStr)) continue;
            const raw = decodeShardRawQuestion(mergedManifest, bbShard, ti, ri, 0, 3);
            if (!raw) continue;
            const norm = normalizeToPrismQuestion(raw);
            if (norm.archetype !== 'SIGHTLINE_LOCK') continue;
            modernRowsChecked++;
            // Check distractors don't contain 1800s clubs/years
            if ((norm.facets || []).some((f) => /\b18[789]\d\b|Providence Grays|Boston Beaneaters|Louisville Colonels/i.test(f.text))) {
              modernRowsWithOldLeak++;
            }
          }
        }
        gate(
          '3C.baseball_era_matched_distractors',
          modernRowsChecked >= 20 && modernRowsWithOldLeak === 0,
          { modernRowsChecked, modernRowsWithOldLeak },
        );
      } finally {
        globalThis.fetch = origFetch;
      }
    } finally {
      try { fs.unlinkSync(forgeTmp); } catch {}
    }

    // ========================================================================
    // PART 3D: FULL 1.3M+ QID CORPUS DATE-COMMA & COPY AUDIT
    // ========================================================================
    if (!SKIP_CORPUS_SUBPROC) {
      console.log('\n========================================================================');
      console.log('PART 3D: FULL 1.3M+ CORPUS AUDIT (rt_dates_and_copy_audit.mjs)');
      console.log('========================================================================');
      const corpusJson = path.join(SHOT_DIR, 'scratch', 'rt_dates_and_copy_v2_result.json');
      fs.mkdirSync(path.dirname(corpusJson), { recursive: true });
      const res = spawnSync(
        process.execPath,
        [path.join(ROOT, 'tools', 'qa', 'rt_dates_and_copy_audit.mjs'), '--json-out', corpusJson],
        { cwd: ROOT, encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 },
      );
      let corpusData = null;
      if (fs.existsSync(corpusJson)) {
        corpusData = JSON.parse(fs.readFileSync(corpusJson, 'utf8'));
      }
      const defectCounts = corpusData?.counts || {};
      const totalDefects = Object.values(defectCounts).reduce((a, b) => a + b, 0);
      gate(
        '3D.full_corpus_rt_dates_and_copy_audit_zero_defects',
        res.status === 0 && Boolean(corpusData) && totalDefects === 0,
        {
          exitCode: res.status,
          totalQuestionsAudited: corpusData?.stats?.totalQuestionsAudited ?? 0,
          gzParityOk: corpusData?.stats?.gzParityOk ?? false,
          defectCounts,
        },
      );
      report.part3_jeopardyFeedbackCorpus.fullCorpusAudit = {
        exitCode: res.status,
        stats: corpusData?.stats,
        counts: defectCounts,
      };
    }
  } finally {
    await srv.close();
  }

  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), 'utf8');

  const passCount = report.gates.filter((g) => g.ok).length;
  console.log('\n========================================================================');
  console.log(`RT-V2-OFFLINE-SRS-BASEBALL AUDIT: ${passCount}/${report.gates.length} GATES PASSED`);
  console.log(`JSON Report: ${REPORT_JSON}`);
  console.log('========================================================================');
  if (!report.passed) {
    console.error('\nFAILURES:');
    for (const f of report.failures) {
      console.error(`  - ${f.name}: ${JSON.stringify(f.detail)}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('FATAL AUDIT ERROR:', err);
  process.exit(1);
});
