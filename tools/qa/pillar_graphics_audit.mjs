#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST — PILLAR-GRAPHICS-CRITIC
// Comprehensive Multi-Viewport Real WebGL2 Visual, 3D Framing, Material,
// Lighting & Anti-Boxiness UI Audit (`tools/qa/pillar_graphics_audit.mjs`)
//
// Starts an ephemeral local Vite server (127.0.0.1:0 — NEVER touches :8088,
// ALWAYS serves live latest `src/**` + `public/**`) and drives real Headless
// Edge WebGL2 via native CDP (`rt_e2e_cdp.mjs`).
//
// Usage:
//   node tools/qa/pillar_graphics_audit.mjs [--suite=all|live|stage3d]
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { launchCdpBrowser, sleep } from './rt_e2e_cdp.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const OUT_DIR =
  'C:/Users/mshaf/.gemini/antigravity/brain/f3193b7c-d0ef-4b72-9697-8ad8f5d5d3b3/pillar_graphics';
fs.mkdirSync(OUT_DIR, { recursive: true });

const CLI = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const i = a.indexOf('=');
      return i === -1 ? [a.slice(2), 'true'] : [a.slice(2, i), a.slice(i + 1)];
    })
);
const SUITE = CLI.suite || 'all';
const SOFTWARE_GL = CLI['software-gl'] === 'true';
const FILTER_VPS = CLI.viewports ? new Set(CLI.viewports.split(',').map((s) => s.trim())) : null;

const ALL_LIVE_VIEWPORTS = [
  { id: '360x640', label: 'Small Portrait (Android)', width: 360, height: 640, mobile: true, dpr: 2, isPortrait: true },
  { id: '375x667', label: 'Small Portrait (iPhone SE)', width: 375, height: 667, mobile: true, dpr: 2, isPortrait: true },
  { id: '390x844', label: 'Mobile Portrait (iPhone 15)', width: 390, height: 844, mobile: true, dpr: 2, isPortrait: true },
  { id: '768x1024', label: 'Tablet Portrait (iPad)', width: 768, height: 1024, mobile: true, dpr: 2, isPortrait: true },
  { id: '844x390', label: 'Mobile Landscape', width: 844, height: 390, mobile: true, dpr: 2, isPortrait: false },
  { id: '1280x800', label: 'Desktop', width: 1280, height: 800, mobile: false, dpr: 1, isPortrait: false },
];
const LIVE_VIEWPORTS = FILTER_VPS
  ? ALL_LIVE_VIEWPORTS.filter((v) => FILTER_VPS.has(v.id))
  : ALL_LIVE_VIEWPORTS;

const VIRTUAL_STAGE3D_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>Pillar Graphics 3D Stage Harness</title>
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #050811; }
    #stage-host { position: fixed; inset: 0; width: 100vw; height: 100vh; }
    #guide-overlay { position: fixed; inset: 0; pointer-events: none; z-index: 10; display: none; }
    #guide-overlay.active { display: block; }
    .guide-line { position: absolute; left: 0; right: 0; height: 1px; background: rgba(255, 70, 120, 0.72); }
    .guide-band { position: absolute; left: 0; right: 0; background: rgba(255, 70, 120, 0.08); border-top: 1px dashed rgba(255,215,120,0.65); }
  </style>
</head>
<body>
  <div id="stage-host"></div>
  <div id="guide-overlay"></div>
  <script type="module">
    import { Stage3DDirector } from '/src/stage3d/Stage3DDirector.ts';
    import { PRISM_ATELIER_FINISHES, applyPrismFinishToStage3D } from '/src/meta/PrismAtelierView.ts';
    import { formatCalibratorDialNumber } from '/src/stage3d/VeritasPrismRig.ts';

    window.__pillarReady = false;
    window.__pillarError = null;
    window.__PRISM_ATELIER_FINISHES = PRISM_ATELIER_FINISHES;
    window.__formatCalibratorDialNumber = formatCalibratorDialNumber;

    async function boot() {
      try {
        const host = document.getElementById('stage-host');
        const dir = new Stage3DDirector({ baseUrl: '/', qualityTier: 'HIGH', initialVenue: 'ch' });
        await dir.mount(host, 'ch');
        window.__stage3d = dir;
        window.__applyFinish = (idx) => {
          const spec = PRISM_ATELIER_FINISHES[idx];
          if (!spec) return null;
          applyPrismFinishToStage3D(dir, spec, { updateDomainPalette: false });
          return spec.id;
        };
        window.__setGuide = (mode) => {
          const ov = document.getElementById('guide-overlay');
          ov.innerHTML = '';
          if (!mode) { ov.className = ''; return; }
          ov.className = 'active';
          if (mode === 'PORTRAIT_50') {
            ov.innerHTML = '<div class="guide-band" style="top:50%;bottom:0;"></div>';
          } else if (mode === 'PORTRAIT_46') {
            ov.innerHTML = '<div class="guide-band" style="top:46%;bottom:0;"></div>';
          }
        };
        window.__waitFrames = (n = 15) => new Promise((resolve) => {
          let count = 0;
          function tick() {
            count++;
            if (count >= n) resolve(true);
            else requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
        window.__projectHeroBounds = () => {
          const cam = dir.cameraChoreographer.camera;
          const root = dir.prismRig.root;
          root.updateMatrixWorld(true);
          cam.updateMatrixWorld(true);
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          let count = 0;
          const box = new (dir.scene.position.constructor)();
          const corners = [];
          root.traverse((obj) => {
            if (!obj.visible) return;
            // Walk up visibility
            let p = obj;
            while (p) { if (!p.visible) return; p = p.parent; }
            if (obj.isMesh && obj.geometry && obj.material && obj.material.visible !== false) {
              // Skip huge invisible hitboxes or floor contact shadows
              if (obj.material.opacity === 0 || (obj.name && /hitbox|shadow|floor/i.test(obj.name))) return;
              if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
              const bb = obj.geometry.boundingBox;
              if (!bb) return;
              const xs = [bb.min.x, bb.max.x];
              const ys = [bb.min.y, bb.max.y];
              const zs = [bb.min.z, bb.max.z];
              for (const x of xs) for (const y of ys) for (const z of zs) {
                box.set(x, y, z).applyMatrix4(obj.matrixWorld).project(cam);
                if (Math.abs(box.z) <= 1.2) {
                  const sx = (box.x + 1) * 0.5;
                  const sy = (1 - box.y) * 0.5;
                  if (sx < minX) minX = sx;
                  if (sx > maxX) maxX = sx;
                  if (sy < minY) minY = sy;
                  if (sy > maxY) maxY = sy;
                  count++;
                }
              }
            }
          });
          if (!count) return null;
          return {
            leftPct: Number((minX * 100).toFixed(1)),
            rightPct: Number((maxX * 100).toFixed(1)),
            topPct: Number((minY * 100).toFixed(1)),
            bottomPct: Number((maxY * 100).toFixed(1)),
            widthPct: Number(((maxX - minX) * 100).toFixed(1)),
            heightPct: Number(((maxY - minY) * 100).toFixed(1)),
            shot: dir.cameraChoreographer.getShot(),
          };
        };
        window.__pillarReady = true;
      } catch (e) {
        window.__pillarError = String(e?.stack || e);
      }
    }
    boot();
  </script>
</body>
</html>`;

async function startViteServer() {
  const server = await createServer({
    root: REPO_ROOT,
    server: {
      host: '127.0.0.1',
      port: 0,
      strictPort: false,
      hmr: false,
    },
    logLevel: 'error',
    plugins: [
      {
        name: 'pillar-graphics-virtual-stage',
        configureServer(srv) {
          srv.middlewares.use((req, res, next) => {
            if (req.url && req.url.split('?')[0] === '/__pillar_3d_stage.html') {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(VIRTUAL_STAGE3D_HTML);
              return;
            }
            next();
          });
        },
      },
    ],
  });
  await server.listen();
  const addr = server.httpServer.address();
  return {
    server,
    port: addr.port,
    baseUrl: `http://127.0.0.1:${addr.port}`,
    close: () => server.close(),
  };
}

function analyzeImagePixels(imgPath, cropNorm = null) {
  const pyCode = `
import json, sys
import numpy as np
from PIL import Image
arr = np.asarray(Image.open(sys.argv[1]).convert('RGB'), dtype=np.uint8)
h, w, _ = arr.shape
crop = json.loads(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] != 'null' else None
sub = arr
if crop:
    x0, y0 = max(0, int(crop[0]*w)), max(0, int(crop[1]*h))
    x1, y1 = min(w, max(x0+1, int(crop[2]*w))), min(h, max(y0+1, int(crop[3]*h)))
    sub = arr[y0:y1, x0:x1]
luma = 0.2126*sub[:,:,0] + 0.7152*sub[:,:,1] + 0.0722*sub[:,:,2]
total = max(1, luma.size)
whiteout = np.all(sub >= 250, axis=-1)
nearblack = luma < 8.0
r, g, b = sub[:,:,0].astype(np.int16), sub[:,:,1].astype(np.int16), sub[:,:,2].astype(np.int16)
gold_mask = (r >= 125) & (g >= 95) & ((r - b) >= 24) & ((g - b) >= 12)
ys, xs = np.where(gold_mask)
sh, sw, _ = sub.shape
gold_info = {'detected': False, 'px': int(len(ys))}
if len(ys) >= 25:
    gold_info = {
        'detected': True,
        'px': int(len(ys)),
        'topPct': round(float(np.percentile(ys, 2)) / sh * 100.0, 1),
        'botPct': round(float(np.percentile(ys, 98)) / sh * 100.0, 1),
        'leftPct': round(float(np.percentile(xs, 2)) / sw * 100.0, 1),
        'rightPct': round(float(np.percentile(xs, 98)) / sw * 100.0, 1),
        'bottomEdgePx': int(np.sum(gold_mask[max(0, sh-4):sh, :])),
    }
print(json.dumps({
    'w': int(w), 'h': int(h),
    'meanLuma': round(float(np.mean(luma)), 1),
    'p95Luma': round(float(np.percentile(luma, 95)), 1),
    'p10Luma': round(float(np.percentile(luma, 10)), 1),
    'whiteout250Pct': round(float(np.sum(whiteout)) / total * 100.0, 3),
    'nearBlackPct': round(float(np.sum(nearblack)) / total * 100.0, 1),
    'goldHero': gold_info,
}))
`;
  const out = execFileSync('python', ['-c', pyCode, imgPath, JSON.stringify(cropNorm)], {
    encoding: 'utf8',
  });
  return JSON.parse(out);
}

function makeContactSheet(items, outPath, cols, tileW, tileH) {
  const pyCode = `
import json, sys
from PIL import Image, ImageDraw
items = json.loads(sys.argv[1])
out_path = sys.argv[2]
cols = int(sys.argv[3])
tw, th = int(sys.argv[4]), int(sys.argv[5])
rows = (len(items) + cols - 1) // cols
bar = 28
sheet = Image.new('RGB', (cols * tw, rows * (th + bar)), (10, 14, 24))
draw = ImageDraw.Draw(sheet)
for i, it in enumerate(items):
    r, c = divmod(i, cols)
    x0, y0 = c * tw, r * (th + bar)
    im = Image.open(it['path']).convert('RGB').resize((tw, th), Image.Resampling.LANCZOS)
    sheet.paste(im, (x0, y0 + bar))
    draw.rectangle([x0, y0, x0 + tw, y0 + bar], fill=(14, 20, 34))
    draw.text((x0 + 8, y0 + 7), it['label'], fill=(242, 207, 126))
    draw.rectangle([x0, y0, x0 + tw - 1, y0 + th + bar - 1], outline=(55, 68, 92), width=1)
sheet.save(out_path)
print(out_path)
`;
  execFileSync('python', ['-c', pyCode, JSON.stringify(items), outPath, String(cols), String(tileW), String(tileH)], {
    encoding: 'utf8',
  });
}

function emitScreenshot(absPath, desc) {
  const norm = absPath.replace(/\\/g, '/');
  console.log(`Screenshot: ${norm} | ${desc}`);
}

// Inject DOM audit helper for live app screens
const LIVE_DOM_AUDIT_JS = `(() => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const overflowX = document.documentElement.scrollWidth - vw;
  const topbar = document.querySelector('.ws-topbar');
  const topbarRect = topbar ? topbar.getBoundingClientRect() : null;

  // Detect nested bordered boxes (>=1px across >=3 sides or border-image)
  const isBorderedBox = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 20) return false;
    if (cs.borderImageSource && cs.borderImageSource !== 'none') return true;
    const sides = [
      [parseFloat(cs.borderTopWidth), cs.borderTopStyle, cs.borderTopColor],
      [parseFloat(cs.borderRightWidth), cs.borderRightStyle, cs.borderRightColor],
      [parseFloat(cs.borderBottomWidth), cs.borderBottomStyle, cs.borderBottomColor],
      [parseFloat(cs.borderLeftWidth), cs.borderLeftStyle, cs.borderLeftColor],
    ];
    let visibleSides = 0;
    for (const [w, st, col] of sides) {
      if (w >= 0.75 && st !== 'none' && st !== 'hidden' && col !== 'rgba(0, 0, 0, 0)' && col !== 'transparent') {
        visibleSides++;
      }
    }
    return visibleSides >= 3;
  };

  const nestedBoxDetails = [];
  const allEls = Array.from(document.querySelectorAll('#ui-root *, .ws-meta-backdrop *, .ws-modal-backdrop *, .ws-velvet-sheet *'));
  for (const el of allEls) {
    if (!isBorderedBox(el)) continue;
    let p = el.parentElement;
    while (p && p !== document.body) {
      if (isBorderedBox(p)) {
        nestedBoxDetails.push({
          child: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + String(el.className).trim().split(/\\s+/).slice(0,2).join('.') : ''),
          parent: p.tagName.toLowerCase() + (p.id ? '#' + p.id : '') + (p.className ? '.' + String(p.className).trim().split(/\\s+/).slice(0,2).join('.') : ''),
        });
        break;
      }
      p = p.parentElement;
    }
  }

  // Check backdrop-filter over WebGL
  let blurCount = 0;
  for (const el of allEls) {
    const cs = getComputedStyle(el);
    if (cs.backdropFilter && cs.backdropFilter !== 'none' && cs.display !== 'none') {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) blurCount++;
    }
  }

  // Facets visibility & overlap against actions
  const facets = Array.from(document.querySelectorAll('[data-facet-idx]')).filter((b) => {
    const r = b.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(b).visibility !== 'hidden';
  });
  const actionEls = ['#ws-btn-overclock', '#ws-btn-peel', '#ws-btn-bookmark', '#ws-btn-next-q']
    .map((sel) => document.querySelector(sel))
    .filter((el) => el && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0);
  const facetViolations = [];
  for (const f of facets) {
    const fr = f.getBoundingClientRect();
    if (fr.top < 0 || fr.bottom > vh + 1 || fr.height < 32) {
      facetViolations.push({ idx: f.dataset.facetIdx, reason: 'clipped_or_tiny', rect: { t: Math.round(fr.top), b: Math.round(fr.bottom), h: Math.round(fr.height) } });
    }
    // Check parent scroll clipping
    const dock = f.closest('.ws-broadcast-dock');
    if (dock) {
      const dr = dock.getBoundingClientRect();
      if (fr.bottom > dr.bottom + 2 || fr.top < dr.top - 2) {
        facetViolations.push({ idx: f.dataset.facetIdx, reason: 'scrolled_outside_dock', rect: { t: Math.round(fr.top), b: Math.round(fr.bottom) }, dock: { t: Math.round(dr.top), b: Math.round(dr.bottom) } });
      }
    }
    for (const a of actionEls) {
      const ar = a.getBoundingClientRect();
      const ix = Math.max(0, Math.min(fr.right, ar.right) - Math.max(fr.left, ar.left));
      const iy = Math.max(0, Math.min(fr.bottom, ar.bottom) - Math.max(fr.top, ar.top));
      if (ix > 1 && iy > 1) {
        facetViolations.push({ idx: f.dataset.facetIdx, reason: 'overlap_' + a.id, overlapPx: Math.round(ix * iy) });
      }
    }
  }

  // Title / Dock / Meta Sheet geometry
  const titleHero = document.querySelector('.ws-title-hero');
  const titleDock = document.querySelector('.ws-title-dock, .ws-title-pedestal');
  const broadcastDock = document.querySelector('.ws-broadcast-dock');
  const metaSheet = document.querySelector('.ws-meta-sheet');
  const metaBackdrop = document.querySelector('.ws-meta-backdrop');

  const rectOf = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null;
    return {
      l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom),
      w: Math.round(r.width), h: Math.round(r.height),
      tPct: Number(((r.top / vh) * 100).toFixed(1)),
      hPct: Number(((r.height / vh) * 100).toFixed(1)),
    };
  };

  // Element-from-point check on upper open 3D stage (50% W, 28% H in portrait; 24% W, 50% H in landscape)
  const isLandMob = vw > vh && vh <= 520;
  const probeX = isLandMob ? Math.round(vw * 0.24) : Math.round(vw * 0.5);
  const probeY = isLandMob ? Math.round(vh * 0.5) : Math.round(vh * 0.28);
  const hitEl = document.elementFromPoint(probeX, probeY);
  const hitLabel = hitEl ? (hitEl.tagName.toLowerCase() + (hitEl.id ? '#' + hitEl.id : '') + (hitEl.className ? '.' + String(hitEl.className).trim().split(/\\s+/)[0] : '')) : null;

  return {
    vw, vh, overflowX,
    topbar: rectOf(topbar),
    titleHero: rectOf(titleHero),
    titleDock: rectOf(titleDock),
    broadcastDock: rectOf(broadcastDock),
    metaSheet: rectOf(metaSheet),
    metaBackdropClass: metaBackdrop ? metaBackdrop.className : null,
    stageProbePoint: [probeX, probeY],
    stageProbeHit: hitLabel,
    facetCount: facets.length,
    facetViolations,
    nestedBoxCount: nestedBoxDetails.length,
    nestedBoxSample: nestedBoxDetails.slice(0, 6),
    blurCount,
  };
})()`;

async function waitForAppBoot(br) {
  const ok = await br.waitFor(
    `document.querySelector('#canvas-root canvas') && document.querySelector('#ws-title-enter-cta')`,
    30000,
    150
  );
  if (!ok) {
    throw new Error(
      `App boot timeout. console=${JSON.stringify(br.consoleErrors)} exc=${JSON.stringify(br.pageExceptions)} http=${JSON.stringify(br.httpErrors)}`
    );
  }
  await sleep(1600);
}

async function openVaultAndClick(br, id) {
  const drawerOpen = await br.evalJs(`Boolean(document.querySelector('#ws-vault-drawer.is-open'))`);
  if (!drawerOpen) {
    await br.clickSelector('#ws-util-vault');
    await br.waitFor(`document.querySelector('#ws-vault-drawer.is-open')`, 5000, 80);
    await sleep(250);
  }
  await br.clickSelector(id);
  await sleep(800);
}

async function runLiveSuite(baseUrl, report) {
  console.log('\n=== SUITE A: MULTI-VIEWPORT LIVE APP WEBGL2 AUDIT (6 VIEWPORTS) ===');
  report.live = {};

  for (const vp of LIVE_VIEWPORTS) {
    console.log(`\n--- Viewport ${vp.id} (${vp.label}) ---`);
    const br = await launchCdpBrowser({ width: vp.width, height: vp.height, softwareGl: SOFTWARE_GL });
    const vpRes = { screens: {}, consoleErrors: [], pageExceptions: [], httpErrors: [] };

    try {
      await br.setViewport({ width: vp.width, height: vp.height, mobile: vp.mobile, dpr: vp.dpr });
      await br.navigate(baseUrl + '/');
      await waitForAppBoot(br);

      // 1. START SCREEN
      const perfStart = await br.measurePerf(900);
      const startDom = await br.evalJs(LIVE_DOM_AUDIT_JS);
      const startPng = path.join(OUT_DIR, `live_${vp.id}_01_start.png`);
      await br.screenshot(startPng);
      const openCrop = vp.isPortrait ? [0.05, 0.12, 0.95, 0.62] : [0.02, 0.08, 0.52, 0.92];
      const startPx = analyzeImagePixels(startPng, openCrop);
      vpRes.screens.start = { dom: startDom, px: startPx, perf: perfStart, png: startPng };
      emitScreenshot(startPng, `${vp.id} Start Screen (3D Prism + open stage)`);

      // 2. 3D INTEL OBSERVATORY (via Vault)
      await openVaultAndClick(br, '#ws-util-observatory');
      await br.waitFor(`document.querySelector('.ws-meta-backdrop')`, 6000, 100);
      await sleep(1100);
      const obsDom = await br.evalJs(LIVE_DOM_AUDIT_JS);
      const obsPng = path.join(OUT_DIR, `live_${vp.id}_02_observatory.png`);
      await br.screenshot(obsPng);
      const obsCrop = vp.isPortrait ? [0.04, 0.02, 0.96, 0.50] : [0.02, 0.04, 0.50, 0.96];
      const obsPx = analyzeImagePixels(obsPng, obsCrop);

      // Test 1-finger touch orbit drag on Observatory 3D zone (on 390x844 & 844x390)
      let orbitDiff = null;
      if (vp.id === '390x844' || vp.id === '844x390') {
        const dragY = vp.isPortrait ? Math.round(vp.height * 0.25) : Math.round(vp.height * 0.5);
        const dragX1 = vp.isPortrait ? Math.round(vp.width * 0.30) : Math.round(vp.width * 0.14);
        const dragX2 = vp.isPortrait ? Math.round(vp.width * 0.72) : Math.round(vp.width * 0.38);
        await br.touchDrag(dragX1, dragY, dragX2, dragY, 10, 22);
        await sleep(300);
        const afterOrbitPng = path.join(OUT_DIR, `live_${vp.id}_02b_obs_after_orbit.png`);
        await br.screenshot(afterOrbitPng);
        const pyDiff = execFileSync(
          'python',
          [path.join(__dirname, 'rt_pixel_metrics.py'), 'diff', obsPng, afterOrbitPng, JSON.stringify(obsCrop)],
          { encoding: 'utf8' }
        );
        orbitDiff = JSON.parse(pyDiff);
        fs.unlinkSync(afterOrbitPng);
      }
      vpRes.screens.observatory = { dom: obsDom, px: obsPx, orbitDiff, png: obsPng };
      emitScreenshot(obsPng, `${vp.id} 3D Intel Observatory (Crown top 50dvh)`);

      // 3. PRISM ATELIER (jump via Vault ▾ inside Observatory!)
      const hasJumper = await br.evalJs(`Boolean(document.querySelector('.ws-meta-backdrop [data-vault-trigger]'))`);
      if (hasJumper) {
        await br.clickSelector('.ws-meta-backdrop [data-vault-trigger]');
        await sleep(220);
        await br.clickSelector('.ws-meta-backdrop [data-suite-nav="ATELIER"]');
        await sleep(1100);
      }
      // Click a colorful finish swatch (e.g. KYOTO or AURORA) on 390x844 & 1280x800 to inspect PBR swap
      if (vp.id === '390x844' || vp.id === '1280x800') {
        const hasAurora = await br.evalJs(`Boolean(document.querySelector('[data-atelier-select="AURORA_DICHROIC_TITANIUM"]'))`);
        if (hasAurora) {
          await br.clickSelector('[data-atelier-select="AURORA_DICHROIC_TITANIUM"]');
          await sleep(600);
        }
      }
      const atDom = await br.evalJs(LIVE_DOM_AUDIT_JS);
      const atPng = path.join(OUT_DIR, `live_${vp.id}_03_atelier.png`);
      await br.screenshot(atPng);
      const atPx = analyzeImagePixels(atPng, obsCrop);
      vpRes.screens.atelier = { dom: atDom, px: atPx, png: atPng };
      emitScreenshot(atPng, `${vp.id} Prism Atelier (3D Prism + finish swatches)`);

      // On 390x844 & 1280x800, also inspect Passport UI, Stats, Trophies before returning to Title
      if (vp.id === '390x844' || vp.id === '1280x800') {
        for (const [sec, tag] of [
          ['PASSPORT', '04_passport'],
          ['ANALYTICS', '05_stats'],
          ['HONOURS', '06_trophies'],
        ]) {
          await br.clickSelector('.ws-meta-backdrop [data-vault-trigger]');
          await sleep(200);
          await br.clickSelector(`.ws-meta-backdrop [data-suite-nav="${sec}"]`);
          await sleep(650);
          const secDom = await br.evalJs(LIVE_DOM_AUDIT_JS);
          const secPng = path.join(OUT_DIR, `live_${vp.id}_${tag}.png`);
          await br.screenshot(secPng);
          vpRes.screens[sec.toLowerCase()] = { dom: secDom, png: secPng };
          emitScreenshot(secPng, `${vp.id} ${sec} Sheet`);
        }
      }

      // Close Meta Suite via Escape until back on Title
      for (let k = 0; k < 6; k++) {
        const stillOpen = await br.evalJs(`Boolean(document.querySelector('.ws-meta-backdrop'))`);
        if (!stillOpen) break;
        await br.pressKey('Escape');
        await sleep(280);
      }

      // 4. LIVE GAMEPLAY (Launch Daily Broadcast from Title quick-mode strip!)
      const hasDailyModeBtn = await br.evalJs(`Boolean(document.querySelector('[data-title-mode="DAILY"]'))`);
      if (hasDailyModeBtn) {
        await br.clickSelector('[data-title-mode="DAILY"]');
        await br.waitFor(`document.querySelector('#ws-launch-daily')`, 8000, 100);
        await sleep(500);
        // Also capture Campaign Hub / Globe on 390x844 & 1280x800
        if (vp.id === '390x844' || vp.id === '1280x800') {
          const hasCampTab = await br.evalJs(`Boolean(document.querySelector('[data-hub-tab="CAMPAIGN"]'))`);
          if (hasCampTab) {
            await br.clickSelector('[data-hub-tab="CAMPAIGN"]');
            await sleep(950);
            const hubDom = await br.evalJs(LIVE_DOM_AUDIT_JS);
            const hubPng = path.join(OUT_DIR, `live_${vp.id}_07_campaign_globe.png`);
            await br.screenshot(hubPng);
            vpRes.screens.campaignGlobe = { dom: hubDom, png: hubPng };
            emitScreenshot(hubPng, `${vp.id} Campaign Hub + 3D World Globe`);
            await br.clickSelector('[data-hub-tab="DAILY"]');
            await br.waitFor(`document.querySelector('#ws-launch-daily')`, 5000, 100);
            await sleep(300);
          }
        }
        await br.clickSelector('#ws-launch-daily');
        await br.waitFor(`document.querySelector('#ws-btn-overclock') && document.querySelectorAll('[data-facet-idx]').length >= 2`, 15000, 120);
        await sleep(550);

        const gpDom = await br.evalJs(LIVE_DOM_AUDIT_JS);
        const gpPng = path.join(OUT_DIR, `live_${vp.id}_08_gameplay_live.png`);
        await br.screenshot(gpPng);
        const gpCrop = vp.isPortrait ? [0.04, 0.06, 0.96, 0.46] : [0.02, 0.08, 0.46, 0.92];
        emitScreenshot(gpPng, `${vp.id} Live Gameplay (3D Prism + A-D dock)`);

        // Peel Tier 2 + Reveal on key mobile & desktop viewports (BEFORE timer expires!)
        let peelDom = null, peelPng = null, revDom = null, revPng = null;
        if (vp.id === '360x640' || vp.id === '375x667' || vp.id === '390x844' || vp.id === '768x1024' || vp.id === '844x390' || vp.id === '1280x800') {
          const canPeel = await br.evalJs(`(() => { const b = document.querySelector('#ws-btn-peel'); return Boolean(b && !b.disabled); })()`);
          if (canPeel && (vp.id === '360x640' || vp.id === '390x844' || vp.id === '844x390' || vp.id === '1280x800')) {
            await br.clickSelector('#ws-btn-peel');
            await sleep(450);
            peelDom = await br.evalJs(LIVE_DOM_AUDIT_JS);
            peelPng = path.join(OUT_DIR, `live_${vp.id}_09_gameplay_peel2.png`);
            await br.screenshot(peelPng);
            emitScreenshot(peelPng, `${vp.id} Gameplay Tier-2 Peel + Clue Drawer`);
          }
          const hasOverclock = await br.evalJs(`Boolean(document.querySelector('#ws-btn-overclock'))`);
          if (hasOverclock) {
            await br.clickSelector('#ws-btn-overclock');
          }
          await br.waitFor(`document.querySelector('#ws-btn-next-q')`, 8000, 100);
          await sleep(550);
          revDom = await br.evalJs(LIVE_DOM_AUDIT_JS);
          revPng = path.join(OUT_DIR, `live_${vp.id}_10_gameplay_reveal.png`);
          await br.screenshot(revPng);
          emitScreenshot(revPng, `${vp.id} Gameplay Reveal (Intel Flash + Save/Next)`);
        }

        const gpPerf = await br.measurePerf(700);
        const gpPx = analyzeImagePixels(gpPng, gpCrop);
        vpRes.screens.gameplayLive = { dom: gpDom, px: gpPx, perf: gpPerf, png: gpPng };
        if (peelPng) vpRes.screens.gameplayPeel2 = { dom: peelDom, png: peelPng };
        if (revPng) vpRes.screens.gameplayReveal = { dom: revDom, png: revPng };
      }

      vpRes.consoleErrors = br.consoleErrors.slice();
      vpRes.pageExceptions = br.pageExceptions.slice();
      vpRes.httpErrors = br.httpErrors.slice();
    } finally {
      await br.close();
    }

    report.live[vp.id] = vpRes;
  }
}

async function runStage3DExhaustiveSuite(baseUrl, report) {
  console.log('\n=== SUITE B: EXHAUSTIVE 3D PBR VENUES, 5 MORPHS, 7 RELICS, 12 SKINS, GLOBE & PASSPORT ===');
  report.stage3d = { venues: {}, morphs: {}, relics: {}, skins: {}, globePassport: {}, calibratorDateCheck: {} };

  const br = await launchCdpBrowser({ width: 1280, height: 800, softwareGl: SOFTWARE_GL });
  try {
    await br.setViewport({ width: 1280, height: 800, mobile: false, dpr: 1 });
    await br.navigate(baseUrl + '/__pillar_3d_stage.html');
    const ready = await br.waitFor(`window.__pillarReady || window.__pillarError`, 25000, 150);
    if (!ready) throw new Error('Virtual 3D harness timed out');
    const err = await br.evalJs(`window.__pillarError`);
    if (err) throw new Error(`Virtual 3D harness error: ${err}`);

    // ------------------------------------------------------------------
    // 1. ALL 8 REAL 3D CITY VENUES (Desktop 1280x800, Broadcast lighting)
    // ------------------------------------------------------------------
    const VENUES = [
      { code: 'ch', name: 'Geneva · Vetting Chamber', domain: 0 },
      { code: 'gb', name: 'London · Sovereign Rotunda', domain: 0 },
      { code: 'jp', name: 'Tokyo · Shinkansen Pavilion', domain: 6 },
      { code: 'br', name: 'Rio · Botanical Canopy', domain: 7 },
      { code: 'eg', name: 'Cairo · Solar Acoustic Hall', domain: 3 },
      { code: 'is', name: 'Reykjavik · Basalt Caldera', domain: 1 },
      { code: 'sg', name: 'Singapore · Sky-Bridge', domain: 8 },
      { code: 'global', name: 'Intl Waters · Apex Forum', domain: 11 },
    ];
    const venueTiles = [];
    for (const v of VENUES) {
      await br.evalJs(`(async () => {
        const d = window.__stage3d;
        await d.setVenue(${JSON.stringify(v.code)});
        d.setLightingMode('BROADCAST', true);
        await d.setMorph('SIGHTLINE_LOCK', {
          options: ['NORTH', 'EAST', 'SOUTH', 'WEST'],
          domainId: ${v.domain},
          initialIndex: 0,
          peelTier: 1,
        });
        d.setCameraShot('TITLE_ESTABLISHING', true);
        await window.__waitFrames(24);
      })()`);
      await sleep(500);
      const perf = await br.measurePerf(600);
      const png = path.join(OUT_DIR, `s3d_venue_${v.code}.png`);
      await br.screenshot(png);
      const px = analyzeImagePixels(png, null);
      report.stage3d.venues[v.code] = { name: v.name, px, perf, png };
      venueTiles.push({ path: png, label: `${v.code.toUpperCase()} — ${v.name} (luma ${px.meanLuma}, bloom ${px.whiteout250Pct}%, ${perf.avgDrawCalls} dc)` });
      console.log(`  Venue ${v.code}: luma=${px.meanLuma} p95=${px.p95Luma} whiteout=${px.whiteout250Pct}% dark=${px.nearBlackPct}% dc=${perf.avgDrawCalls} fps=${perf.avgFps}`);
    }
    const venueSheet = path.join(OUT_DIR, 'sheet_01_all_8_venues.png');
    makeContactSheet(venueTiles, venueSheet, 4, 480, 300);
    emitScreenshot(venueSheet, 'All 8 3D City Venues PBR contact sheet');

    // ------------------------------------------------------------------
    // 2. ALL 5 3D MORPHS (Desktop 1280x800 AND Portrait 390x844 w/ 46dvh guide!)
    // ------------------------------------------------------------------
    await br.evalJs(`window.__stage3d.setVenue('ch')`);
    // Also verify Calibrator date-comma formatter directly
    report.stage3d.calibratorDateCheck = await br.evalJs(`({
      year1969_CE: window.__formatCalibratorDialNumber(1969, 'CE', 1900, 2020),
      year1864_CE: window.__formatCalibratorDialNumber(1864, 'CE', 1800, 1920),
      year1984_empty: window.__formatCalibratorDialNumber(1984, '', 1900, 2020),
      year1492_BCE: window.__formatCalibratorDialNumber(1492, 'BCE', 1000, 2000),
      nonYear_8849m: window.__formatCalibratorDialNumber(8849, 'm', 1000, 10000),
    })`);

    const MORPHS = [
      {
        id: 'sightline_t1',
        label: '1a. Sightline Lock (Tier 1)',
        fn: `async () => {
          const d = window.__stage3d;
          d.setLightingMode('BROADCAST', true);
          await d.setMorph('SIGHTLINE_LOCK', {
            options: ['Detroit Tigers', 'Chicago Cubs', 'Boston Red Sox', 'New York Mets'],
            domainId: 5, initialIndex: 0, peelTier: 1,
          });
          d.setCameraShot('PRISM_STANDARD', true);
        }`,
      },
      {
        id: 'sightline_t2',
        label: '1b. Sightline Peel Tier 2 (Dual Lenses)',
        fn: `async () => {
          const d = window.__stage3d;
          d.setLightingMode('BROADCAST', true);
          await d.setMorph('SIGHTLINE_LOCK', {
            options: ['Marie Curie', 'Rosalind Franklin', 'Ada Lovelace', 'Lise Meitner'],
            domainId: 1, initialIndex: 0, peelTier: 2,
          });
          d.setCameraShot('PRISM_PEEL_INSPECT', true);
        }`,
      },
      {
        id: 'sightline_t3',
        label: '1c. Sightline Peel Tier 3 (Shatter + Core Glyph)',
        fn: `async () => {
          const d = window.__stage3d;
          d.setLightingMode('BROADCAST', true);
          await d.setMorph('SIGHTLINE_LOCK', {
            options: ['Archimedes', 'Eratosthenes', 'Euclid', 'Ptolemy'],
            domainId: 10, initialIndex: 0, peelTier: 3, eliminatedIndices: [1, 3],
          });
          d.setCameraShot('PRISM_STANDARD', true);
        }`,
      },
      {
        id: 'codex',
        label: '2. Codex Dual-Ring Cryptex',
        fn: `async () => {
          const d = window.__stage3d;
          d.setLightingMode('BROADCAST', true);
          await d.setMorph('CODEX_DUAL_RING', {
            subjects: ['Ada Lovelace', 'Alan Turing', 'Grace Hopper'],
            targets: ['Analytical Engine', 'Enigma', 'COBOL', 'Transistor'],
            domainId: 6, initialTopIndex: 0, initialBottomIndex: 0, lockedConduits: 1,
          });
          d.setCameraShot('CODEX_FOCUS', true);
        }`,
      },
      {
        id: 'calibrator_year',
        label: '3. Calibrator Dial (Year 1969 CE — ZERO Commas!)',
        fn: `async () => {
          const d = window.__stage3d;
          d.setLightingMode('BROADCAST', true);
          await d.setMorph('CALIBRATOR_DIAL', {
            minVal: 1900, maxVal: 2020, step: 1, unit: 'CE',
            initialVal: 1969, toleranceFraction: 0.14, multiplierLabel: '2.5x', domainId: 0,
          });
          d.setCameraShot('CALIBRATOR_FOCUS', true);
        }`,
      },
      {
        id: 'gauntlet',
        label: '4. Gauntlet Shatter Crystal Plate',
        fn: `async () => {
          const d = window.__stage3d;
          d.setLightingMode('BROADCAST', true);
          await d.setMorph('GAUNTLET_SHATTER', {
            statement: 'The Treaty of Westphalia was signed in 1648 ending the Thirty Years War.',
            domainId: 8,
          });
          d.setCameraShot('GAUNTLET_FOCUS', true);
        }`,
      },
      {
        id: 'hero_synthesis',
        label: '5. Hero Artifact Synthesis (Boss Relic + 4 Facets)',
        fn: `async () => {
          const d = window.__stage3d;
          d.setLightingMode('BROADCAST', true);
          await d.setMorph('HERO_ARTIFACT_SYNTHESIS', {
            relicId: 'meridian_astrolabe',
            domainId: 9,
            options: ['Geneva 1864', 'Vienna 1815', 'Paris 1919', 'Bretton Woods'],
            initialIndex: 0,
            openLatchCount: 2,
          });
          d.setCameraShot('PRISM_STANDARD', true);
        }`,
      },
    ];

    const morphDeskTiles = [];
    const morphPortTiles = [];
    // Desktop pass
    for (const m of MORPHS) {
      await br.evalJs(`(async () => { await (${m.fn})(); await window.__waitFrames(24); })()`);
      await sleep(450);
      const png = path.join(OUT_DIR, `s3d_morph_desk_${m.id}.png`);
      await br.screenshot(png);
      const bounds = await br.evalJs(`window.__projectHeroBounds()`);
      const px = analyzeImagePixels(png, null);
      report.stage3d.morphs[`desk_${m.id}`] = { bounds, px, png };
      morphDeskTiles.push({ path: png, label: `DESKTOP · ${m.label}` });
      if (m.id === 'calibrator_year' || m.id === 'sightline_t2' || m.id === 'codex') {
        emitScreenshot(png, `Desktop 3D Morph ${m.label}`);
      }
    }
    const morphDeskSheet = path.join(OUT_DIR, 'sheet_02_morphs_desktop.png');
    makeContactSheet(morphDeskTiles, morphDeskSheet, 4, 480, 300);
    emitScreenshot(morphDeskSheet, 'All 5 3D Morphs Desktop contact sheet');

    // Portrait 390x844 pass with 46dvh dock-boundary guide line!
    await br.setViewport({ width: 390, height: 844, mobile: true, dpr: 2 });
    await br.evalJs(`window.__stage3d.resize(); window.__setGuide('PORTRAIT_46');`);
    await sleep(350);
    for (const m of MORPHS) {
      await br.evalJs(`(async () => { await (${m.fn})(); await window.__waitFrames(24); })()`);
      await sleep(450);
      const png = path.join(OUT_DIR, `s3d_morph_port_${m.id}.png`);
      await br.screenshot(png);
      const bounds = await br.evalJs(`window.__projectHeroBounds()`);
      const px = analyzeImagePixels(png, [0, 0, 1, 0.46]);
      report.stage3d.morphs[`port_${m.id}`] = { bounds, px, png };
      morphPortTiles.push({ path: png, label: `390x844 · ${m.id} (Y:${bounds?.topPct}..${bounds?.bottomPct}%)` });
      console.log(`  Portrait Morph ${m.id}: bounds Y=${bounds?.topPct}..${bounds?.bottomPct}% X=${bounds?.leftPct}..${bounds?.rightPct}%`);
    }
    const morphPortSheet = path.join(OUT_DIR, 'sheet_03_morphs_portrait_390x844.png');
    makeContactSheet(morphPortTiles, morphPortSheet, 4, 260, 560);
    emitScreenshot(morphPortSheet, 'All 5 3D Morphs Portrait 390x844 w/ 46dvh guide');

    // ------------------------------------------------------------------
    // 3. 3D CROWN + ALL 7 COUNTRY BOSS RELICS + MASTER LEDGER (Portrait 390x844 w/ 50dvh guide + Desktop)
    // ------------------------------------------------------------------
    await br.evalJs(`window.__setGuide('PORTRAIT_50');`);
    const RELICS = [
      { id: 'championship_trophy', name: 'Championship Crown', domain: 0 },
      { id: 'meridian_astrolabe', name: 'CH · Meridian Astrolabe', domain: 1 },
      { id: 'armillary_orrery', name: 'GB · Armillary Orrery', domain: 0 },
      { id: 'origami_prism', name: 'JP · Origami Prism', domain: 6 },
      { id: 'emerald_sphere', name: 'BR · Emerald Sphere', domain: 7 },
      { id: 'cipher_box', name: 'EG · Solar Cipher Box', domain: 3 },
      { id: 'cryo_relay', name: 'IS · Cryo Relay', domain: 1 },
      { id: 'council_seal', name: 'SG · Council Seal', domain: 8 },
      { id: 'master_ledger', name: 'GLOBAL · Master Ledger', domain: 11 },
    ];
    const relicPortTiles = [];
    for (const r of RELICS) {
      await br.evalJs(`(async () => {
        const d = window.__stage3d;
        await d.showHeroRelic(${JSON.stringify(r.id)}, ${r.domain});
        d.actuateRelicLatches(3);
        d.setCameraShot(${JSON.stringify(r.id === 'championship_trophy' ? 'TROPHY_HERO' : 'RELIC_OBSERVATORY')}, true);
        await window.__waitFrames(24);
      })()`);
      await sleep(450);
      const png = path.join(OUT_DIR, `s3d_relic_port_${r.id}.png`);
      await br.screenshot(png);
      const bounds = await br.evalJs(`window.__projectHeroBounds()`);
      const px = analyzeImagePixels(png, [0, 0, 1, 0.50]);
      report.stage3d.relics[r.id] = { name: r.name, portBounds: bounds, px, png };
      relicPortTiles.push({ path: png, label: `${r.name} (Y:${bounds?.topPct}..${bounds?.bottomPct}%)` });
      console.log(`  Portrait Relic ${r.id}: Y=${bounds?.topPct}..${bounds?.bottomPct}% X=${bounds?.leftPct}..${bounds?.rightPct}% luma=${px.meanLuma}`);
    }
    const relicPortSheet = path.join(OUT_DIR, 'sheet_04_crown_and_relics_portrait.png');
    makeContactSheet(relicPortTiles, relicPortSheet, 3, 280, 600);
    emitScreenshot(relicPortSheet, '3D Crown + all 8 Boss Relics Portrait 50dvh sheet');

    // ------------------------------------------------------------------
    // 4. 3D WORLD GLOBE FLIGHT FORK & 3D DIPLOMATIC PASSPORT (Portrait 390x844 & Desktop 1280x800)
    // ------------------------------------------------------------------
    const gpTiles = [];
    for (const mode of [
      { id: 'port', w: 390, h: 844, mob: true, dpr: 2, guide: 'PORTRAIT_50' },
      { id: 'desk', w: 1280, h: 800, mob: false, dpr: 1, guide: '' },
    ]) {
      await br.setViewport({ width: mode.w, height: mode.h, mobile: mode.mob, dpr: mode.dpr });
      await br.evalJs(`window.__stage3d.resize(); window.__setGuide(${JSON.stringify(mode.guide)});`);
      await sleep(250);

      // World Globe Flight Fork
      await br.evalJs(`(async () => {
        const d = window.__stage3d;
        d.setLightingMode('BROADCAST', true);
        await d.showWorldGlobe({
          focusedVenue: 'ch',
          unlockedVenues: ['ch', 'gb', 'jp'],
          completedVenues: ['ch'],
          showAct1FlightFork: true,
        });
        d.setCameraShot('GLOBE_OVERWATCH', true);
        await window.__waitFrames(24);
      })()`);
      await sleep(500);
      const globePng = path.join(OUT_DIR, `s3d_globe_${mode.id}.png`);
      await br.screenshot(globePng);
      const globeBounds = await br.evalJs(`window.__projectHeroBounds()`);
      const globePx = analyzeImagePixels(globePng, null);
      report.stage3d.globePassport[`globe_${mode.id}`] = { bounds: globeBounds, px: globePx, png: globePng };
      emitScreenshot(globePng, `3D World Globe Flight Fork (${mode.id} ${mode.w}x${mode.h})`);

      // 3D Diplomatic Passport
      await br.evalJs(`(async () => {
        const d = window.__stage3d;
        d.setLightingMode('BROADCAST', true);
        await d.showDiplomaticPassport(true);
        d.setCameraShot('RELIC_OBSERVATORY', true);
        await window.__waitFrames(24);
      })()`);
      await sleep(500);
      const passPng = path.join(OUT_DIR, `s3d_passport3d_${mode.id}.png`);
      await br.screenshot(passPng);
      const passBounds = await br.evalJs(`window.__projectHeroBounds()`);
      const passPx = analyzeImagePixels(passPng, null);
      report.stage3d.globePassport[`passport_${mode.id}`] = { bounds: passBounds, px: passPx, png: passPng };
      emitScreenshot(passPng, `3D Diplomatic Passport (${mode.id} ${mode.w}x${mode.h})`);
      gpTiles.push({ path: globePng, label: `Globe ${mode.id}` }, { path: passPng, label: `Passport3D ${mode.id}` });
    }

    // ------------------------------------------------------------------
    // 5. ALL 12 PRISM ATELIER PBR SKINS (Desktop 1280x800)
    // ------------------------------------------------------------------
    await br.setViewport({ width: 1280, height: 800, mobile: false, dpr: 1 });
    await br.evalJs(`(async () => {
      window.__setGuide('');
      const d = window.__stage3d;
      d.resize();
      d.setLightingMode('BROADCAST', true);
      await d.setMorph('SIGHTLINE_LOCK', {
        options: ['SPIN', 'PEEL', 'OVERCLOCK', 'ATELIER'],
        domainId: 0, initialIndex: 0, peelTier: 2,
      });
      d.setCameraShot('PRISM_PEEL_INSPECT', true);
      await window.__waitFrames(18);
    })()`);
    const skinCount = await br.evalJs(`window.__PRISM_ATELIER_FINISHES.length`);
    const skinTiles = [];
    for (let i = 0; i < skinCount; i++) {
      const skinMeta = await br.evalJs(`(async () => {
        const spec = window.__PRISM_ATELIER_FINISHES[${i}];
        window.__applyFinish(${i});
        await window.__waitFrames(14);
        return { id: spec.id, name: spec.name, badge: spec.shortBadge };
      })()`);
      await sleep(220);
      const png = path.join(OUT_DIR, `s3d_skin_${String(i + 1).padStart(2, '0')}_${skinMeta.id}.png`);
      await br.screenshot(png);
      const px = analyzeImagePixels(png, [0.25, 0.10, 0.75, 0.90]);
      report.stage3d.skins[skinMeta.id] = { index: i + 1, name: skinMeta.name, px, png };
      skinTiles.push({ path: png, label: `#${i + 1} ${skinMeta.badge} (luma ${px.meanLuma}, bloom ${px.whiteout250Pct}%)` });
    }
    const skinsSheet = path.join(OUT_DIR, 'sheet_05_all_12_atelier_skins.png');
    makeContactSheet(skinTiles, skinsSheet, 4, 420, 260);
    emitScreenshot(skinsSheet, 'All 12 Prism Atelier PBR skins contact sheet');

    report.stage3d.consoleErrors = br.consoleErrors.slice();
    report.stage3d.pageExceptions = br.pageExceptions.slice();
    report.stage3d.httpErrors = br.httpErrors.slice();
  } finally {
    await br.close();
  }
}

async function main() {
  const vite = await startViteServer();
  console.log(`Started ephemeral Vite audit server at ${vite.baseUrl}`);
  const report = {
    timestamp: new Date().toISOString(),
    suite: SUITE,
    outDir: OUT_DIR,
  };
  try {
    if (SUITE === 'all' || SUITE === 'live') {
      await runLiveSuite(vite.baseUrl, report);
    }
    if (SUITE === 'all' || SUITE === 'stage3d') {
      await runStage3DExhaustiveSuite(vite.baseUrl, report);
    }
    const reportFile = SUITE === 'live' ? 'pillar_graphics_live_report.json' : 'pillar_graphics_report.json';
    const reportPath = path.join(OUT_DIR, reportFile);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nReport written to ${reportPath}`);
  } finally {
    await vite.close();
  }
}

main().catch((err) => {
  console.error('PILLAR-GRAPHICS-AUDIT FAILED:', err);
  process.exit(1);
});
