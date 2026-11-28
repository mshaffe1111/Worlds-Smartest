#!/usr/bin/env node
/**
 * World's Smartest v9 — Static & Bundle Gates (S1–S4)
 * Zero external dependencies (Node v26+ built-ins only).
 *
 * Gates:
 *   S1: TypeScript check (npx.cmd tsc --noEmit) & Vite production build (npm.cmd run build)
 *   S2: Bundle budget (dist/ < 20.00 MB decimal = 20_000_000 B; logs public/assets/v9/ footprint)
 *   S3: Dark-Navy SaaS Purge across src/**\/*.{ts,tsx,css} and index.html
 *   S4: Dynamic 1966 Gouache Atlas Manifest & File Verification (>= 55 Prizes + >= 6 Zonks + 7 VIPs + 2 Backdrops + 2 Crowd Plates = >= 72 sprites, scaling to 107+)
 *   S5: STOP-THE-LINE P0 Gate — Zero `buildMobileStudioCrowdApron`, `buildMobileStageApronCrowd`, or `mobileCrowdApron` anywhere in src/ (always FAIL even under --baseline)
 *   S6: Crowd Plane Aspect Ratio Gate — Verify `VipLogeCrowd` / `RowC_Crowd` uses `trueAspect = (sprite.w * uSpan) / sprite.h`
 *
 * CLI flags:
 *   --skip-build   Skip S1 tsc/vite build
 *   --strict-v9    Fail on any S3 leak or missing S4 atlas (default unless --baseline is passed)
 *   --baseline     Allow unlanded M2 items (S3 leaks / missing public/assets/v9) as PENDING_M2 while still checking dist/ < 20 MB
 *   --json-out=<path>  Write structured JSON report
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const REPO_ROOT = path.resolve(__dirname, '../..');

export const DIST_BUDGET_BYTES = 20_000_000; // Strictly < 20.00 MB decimal (20,000,000 bytes)
export const V9_ASSETS_ADVISORY_BYTES = 4_000_000; // 4.00 MB decimal advisory check for packed sprite atlases
export const MIN_PRIZE_SPRITES = 55;
export const MIN_ZONK_SPRITES = 6;
export const MIN_VIP_SPRITES = 7;
export const MIN_BACKDROP_SPRITES = 2;
export const MIN_CROWD_SPRITES = 2;
export const MIN_TOTAL_ATLAS_SPRITES = 72; // >= 55 prizes + >= 6 zonks + 7 VIPs + 2 backdrops + 2 crowd plates (scales to 107+)

export const CANONICAL_ART_ENTRIES = [
  // 7 VIP Celebrities
  { targetId: 'vip_kitty_fontaine', atlasGroup: 'atlas_vip', category: 'vip_celeb' },
  { targetId: 'vip_barnaby_quail', atlasGroup: 'atlas_vip', category: 'vip_celeb' },
  { targetId: 'vip_frankie_lombardo', atlasGroup: 'atlas_vip', category: 'vip_celeb' },
  { targetId: 'vip_astrid_lindqvist', atlasGroup: 'atlas_vip', category: 'vip_celeb' },
  { targetId: 'vip_action_jackson', atlasGroup: 'atlas_vip', category: 'vip_celeb' },
  { targetId: 'vip_bea_delacroix', atlasGroup: 'atlas_vip', category: 'vip_celeb' },
  { targetId: 'vip_zoltan', atlasGroup: 'atlas_vip', category: 'vip_celeb' },
  // 9 Grand Prizes
  { targetId: 'prize_toaster', atlasGroup: 'atlas_prizes', category: 'prize' },
  { targetId: 'prize_rotary_phone', atlasGroup: 'atlas_prizes', category: 'prize' },
  { targetId: 'prize_fondue_set', atlasGroup: 'atlas_prizes', category: 'prize' },
  { targetId: 'prize_hifi_credenza', atlasGroup: 'atlas_prizes', category: 'prize' },
  { targetId: 'prize_color_tv', atlasGroup: 'atlas_prizes', category: 'prize' },
  { targetId: 'prize_mod_scooter', atlasGroup: 'atlas_prizes', category: 'prize' },
  { targetId: 'prize_convertible', atlasGroup: 'atlas_prizes', category: 'prize' },
  { targetId: 'prize_roman_holiday', atlasGroup: 'atlas_prizes', category: 'prize' },
  { targetId: 'prize_grand_piano', atlasGroup: 'atlas_prizes', category: 'prize' },
  // 6 Zonks
  { targetId: 'zonk_clam_juice', atlasGroup: 'atlas_zonks', category: 'zonk' },
  { targetId: 'zonk_tandem_bike', atlasGroup: 'atlas_zonks', category: 'zonk' },
  { targetId: 'zonk_banjo_badger', atlasGroup: 'atlas_zonks', category: 'zonk' },
  { targetId: 'zonk_olive_loaf', atlasGroup: 'atlas_zonks', category: 'zonk' },
  { targetId: 'zonk_bowling_ball', atlasGroup: 'atlas_zonks', category: 'zonk' },
  { targetId: 'zonk_bow_tie_lobster', atlasGroup: 'atlas_zonks', category: 'zonk' },
  // 2 Scene Backdrops
  { targetId: 'den_backdrop_lounge', atlasGroup: 'scene_backdrops', category: 'den_backdrop' },
  { targetId: 'curtain_backdrop_stage', atlasGroup: 'scene_backdrops', category: 'curtain_backdrop' },
];

export const CANONICAL_CROWD_V9_IDS = ['crowd_row_1', 'crowd_row_2', 'crowd_row_3', 'crowd_vip_pairs'];
export const CANONICAL_CROWD_LEGACY_IDS = ['studio_crowd_front', 'studio_crowd_back'];

const BANNED_DARK_NAVY_COLORS = [
  { hex: '0B1D30', r: 11, g: 29, b: 48 },
  { hex: '0D2238', r: 13, g: 34, b: 56 },
  { hex: '071321', r: 7,  g: 19, b: 33 },
  { hex: '081524', r: 8,  g: 21, b: 36 },
  { hex: '0B1F33', r: 11, g: 31, b: 51 },
  { hex: '0f1d30', r: 15, g: 29, b: 48 },
  { hex: '0d253e', r: 13, g: 37, b: 62 },
  { hex: '13364b', r: 19, g: 54, b: 75 },
  { hex: '122f4d', r: 18, g: 47, b: 77 },
  { hex: '0F172A', r: 15, g: 23, b: 42 },
];

export const BANNED_DARK_NAVY_PATTERNS = BANNED_DARK_NAVY_COLORS.flatMap(({ hex, r, g, b }) => [
  { label: `#${hex}/0x${hex}`, regex: new RegExp(`(?:#|0x)${hex}(?:[0-9a-f]{2})?\\b`, 'gi') },
  {
    label: `rgb(${r},${g},${b})`,
    regex: new RegExp(
      `rgba?\\(\\s*${r}(?:\\s*,\\s*|\\s+)${g}(?:\\s*,\\s*|\\s+)${b}(?:\\s*(?:,|\\/)\\s*[\\d.]+%?)?\\s*\\)`,
      'gi',
    ),
  },
]);

function walkFiles(dirPath, filterFn = () => true) {
  const results = [];
  if (!fs.existsSync(dirPath)) return results;
  const stack = [dirPath];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && filterFn(fullPath)) {
        results.push(fullPath);
      }
    }
  }
  results.sort();
  return results;
}

export function sumDirectoryBytes(dirPath) {
  if (!fs.existsSync(dirPath)) return { exists: false, fileCount: 0, totalBytes: 0 };
  const files = walkFiles(dirPath);
  let totalBytes = 0;
  for (const f of files) {
    totalBytes += fs.statSync(f).size;
  }
  return { exists: true, fileCount: files.length, totalBytes };
}

function runCommand(cmd, args, cwd) {
  const start = Date.now();
  const isWin = process.platform === 'win32';
  const res = spawnSync(cmd, args, {
    cwd,
    shell: isWin,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  return {
    command: `${cmd} ${args.join(' ')}`,
    exitCode: res.status ?? (res.error ? 1 : 0),
    durationMs: Date.now() - start,
    stdout: (res.stdout || '').trim(),
    stderr: (res.stderr || '').trim(),
    error: res.error ? String(res.error) : null,
  };
}

export function runGateS1({ repoRoot = REPO_ROOT, skipBuild = false } = {}) {
  if (skipBuild) {
    return {
      gate: 'S1_BUILD_AND_TYPECHECK',
      status: 'SKIPPED',
      ok: true,
      details: 'Skipped via --skip-build',
    };
  }
  const tscRes = runCommand('npx.cmd', ['tsc', '--noEmit'], repoRoot);
  if (tscRes.exitCode !== 0) {
    return {
      gate: 'S1_BUILD_AND_TYPECHECK',
      status: 'FAIL',
      ok: false,
      details: `tsc --noEmit exited with ${tscRes.exitCode}`,
      tsc: tscRes,
    };
  }
  const buildRes = runCommand('npm.cmd', ['run', 'build'], repoRoot);
  if (buildRes.exitCode !== 0) {
    return {
      gate: 'S1_BUILD_AND_TYPECHECK',
      status: 'FAIL',
      ok: false,
      details: `npm run build exited with ${buildRes.exitCode}`,
      tsc: tscRes,
      build: buildRes,
    };
  }
  return {
    gate: 'S1_BUILD_AND_TYPECHECK',
    status: 'PASS',
    ok: true,
    details: `tsc (${tscRes.durationMs}ms) + vite build (${buildRes.durationMs}ms) passed with exit code 0`,
    tscDurationMs: tscRes.durationMs,
    buildDurationMs: buildRes.durationMs,
  };
}

export function runGateS2({ repoRoot = REPO_ROOT, baseline = false } = {}) {
  const distDir = path.join(repoRoot, 'dist');
  const distStats = sumDirectoryBytes(distDir);
  const v9AssetsDir = path.join(repoRoot, 'public', 'assets', 'v9');
  const v9Stats = sumDirectoryBytes(v9AssetsDir);

  if (!distStats.exists || distStats.fileCount === 0) {
    return {
      gate: 'S2_BUNDLE_SIZE_BUDGET',
      status: 'FAIL',
      ok: false,
      details: 'dist/ directory missing or empty',
      distStats,
      v9Stats,
    };
  }

  const distMB = Number((distStats.totalBytes / 1_000_000).toFixed(3));
  const distOk = distStats.totalBytes < DIST_BUDGET_BYTES;

  let v9Status = 'PASS';
  let v9Ok = true;
  if (!v9Stats.exists) {
    v9Status = baseline ? 'PENDING_M2' : 'FAIL';
    v9Ok = baseline;
  }

  const v9MB = Number((v9Stats.totalBytes / 1_000_000).toFixed(3));
  const status = !distOk || v9Status === 'FAIL' ? 'FAIL' : v9Status === 'PENDING_M2' ? 'PENDING_M2' : 'PASS';

  return {
    gate: 'S2_BUNDLE_SIZE_BUDGET',
    status,
    ok: distOk && v9Ok,
    distBytes: distStats.totalBytes,
    distMB,
    distBudgetBytes: DIST_BUDGET_BYTES,
    distFileCount: distStats.fileCount,
    v9AssetsExists: v9Stats.exists,
    v9AssetsBytes: v9Stats.totalBytes,
    v9AssetsMB: v9MB,
    v9AssetsAdvisoryBytes: V9_ASSETS_ADVISORY_BYTES,
    v9AssetsFileCount: v9Stats.fileCount,
    details: `dist/ = ${distStats.totalBytes} bytes (${distMB} MB ${distOk ? '<' : '>='} 20.00 MB decimal / 20,000,000 B); public/assets/v9/ = ${
      v9Stats.exists ? `${v9Stats.totalBytes} bytes (${v9MB} MB)` : `absent (${v9Status})`
    }`,
  };
}

export function runGateS3({ repoRoot = REPO_ROOT, baseline = false } = {}) {
  const srcFiles = walkFiles(path.join(repoRoot, 'src'), (f) => /\.(ts|tsx|css)$/i.test(f));
  const indexHtml = path.join(repoRoot, 'index.html');
  if (fs.existsSync(indexHtml)) srcFiles.push(indexHtml);

  const violations = [];
  for (const filePath of srcFiles) {
    const rel = path.relative(repoRoot, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pat of BANNED_DARK_NAVY_PATTERNS) {
        pat.regex.lastIndex = 0;
        let m;
        while ((m = pat.regex.exec(line)) !== null) {
          violations.push({
            location: `${rel}:${i + 1}:${m[0]}`,
            file: rel,
            line: i + 1,
            token: m[0],
            pattern: pat.label,
          });
        }
      }
    }
  }

  const status = violations.length === 0 ? 'PASS' : baseline ? 'PENDING_M2' : 'FAIL';
  return {
    gate: 'S3_DARK_NAVY_SAAS_PURGE',
    status,
    ok: violations.length === 0 || baseline,
    scannedFiles: srcFiles.length,
    violationCount: violations.length,
    violations,
    details:
      violations.length === 0
        ? `0 banned dark-navy tokens across ${srcFiles.length} scanned files`
        : `${violations.length} banned dark-navy token(s) found across ${new Set(violations.map((v) => v.file)).size} file(s)`,
  };
}

function validateManifestAtDir(dirPath, label) {
  const manifestPath = path.join(dirPath, 'atlas_manifest_v9.json');
  if (!fs.existsSync(dirPath)) {
    return { exists: false, manifestExists: false, errors: [`${label} directory missing`], presentIds: [] };
  }
  if (!fs.existsSync(manifestPath)) {
    return { exists: true, manifestExists: false, errors: [`${label}/atlas_manifest_v9.json missing`], presentIds: [] };
  }
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    return { exists: true, manifestExists: true, errors: [`Invalid JSON in ${label}/atlas_manifest_v9.json: ${err.message}`], presentIds: [] };
  }

  // Support either { sprites: { id: {...} } }, { entries: { id: {...} } }, array of { targetId, ... }, or direct map { id: {...} }
  let lookup = {};
  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (item && typeof item.targetId === 'string') lookup[item.targetId] = item;
    }
  } else if (parsed && typeof parsed === 'object') {
    const candidate = parsed.sprites || parsed.entries || parsed.items || parsed.targets || parsed;
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (item && typeof item.targetId === 'string') lookup[item.targetId] = item;
      }
    } else if (candidate && typeof candidate === 'object') {
      lookup = candidate;
    }
  }

  const errors = [];
  const presentIds = [];
  const referencedFiles = new Set();

  const validateEntry = (id, entry) => {
    if (!entry || typeof entry !== 'object') {
      errors.push(`${label}: invalid entry for "${id}"`);
      return false;
    }
    const file = entry.file || entry.sheet || entry.src;
    if (typeof file !== 'string' || !/\.(webp|jpe?g|png)$/i.test(file)) {
      errors.push(`${label}: "${id}" invalid file "${file}"`);
    } else {
      const cleanRel = file.replace(/^\/+/, '');
      const fullImg = path.join(dirPath, cleanRel);
      const basenameImg = path.join(dirPath, path.basename(cleanRel));
      const resolved = fs.existsSync(fullImg) ? fullImg : fs.existsSync(basenameImg) ? basenameImg : null;
      if (!resolved) {
        errors.push(`${label}: "${id}" references missing image "${file}"`);
      } else {
        referencedFiles.add(resolved);
      }
    }
    const { x, y, w, h, sheetW, sheetH } = entry;
    const nums = [x, y, w, h, sheetW, sheetH];
    if (nums.some((n) => typeof n !== 'number' || !Number.isFinite(n))) {
      errors.push(`${label}: "${id}" missing numeric {x,y,w,h,sheetW,sheetH}`);
    } else if (x < 0 || y < 0 || w <= 0 || h <= 0 || sheetW <= 0 || sheetH <= 0 || x + w > sheetW || y + h > sheetH) {
      errors.push(`${label}: "${id}" invalid bounds (${x},${y},${w},${h} in ${sheetW}x${sheetH})`);
    }
    return true;
  };

  for (const expected of CANONICAL_ART_ENTRIES) {
    const entry = lookup[expected.targetId];
    if (!entry || typeof entry !== 'object') {
      errors.push(`${label}: missing canonical targetId "${expected.targetId}"`);
      continue;
    }
    presentIds.push(expected.targetId);
  }

  const hasAllV9Crowd = CANONICAL_CROWD_V9_IDS.every((id) => lookup[id] && typeof lookup[id] === 'object');
  const hasAllLegacyCrowd = CANONICAL_CROWD_LEGACY_IDS.every((id) => lookup[id] && typeof lookup[id] === 'object');
  if (!hasAllV9Crowd && !hasAllLegacyCrowd) {
    errors.push(
      `${label}: missing canonical crowd sprites (expected all of [${CANONICAL_CROWD_V9_IDS.join(', ')}] or [${CANONICAL_CROWD_LEGACY_IDS.join(', ')}])`,
    );
  } else {
    for (const id of hasAllV9Crowd ? CANONICAL_CROWD_V9_IDS : CANONICAL_CROWD_LEGACY_IDS) {
      presentIds.push(id);
    }
  }

  // Validate all entries in the manifest (including all 72 Prizes + 24 Zonks + 7 VIPs + 2 backdrops + 2 crowd plates)
  const allKeys = Object.keys(lookup);
  let prizeCount = 0;
  let zonkCount = 0;
  let vipCount = 0;
  let backdropCount = 0;
  let crowdCount = 0;

  for (const id of allKeys) {
    const entry = lookup[id];
    if (!entry || typeof entry !== 'object') continue;
    validateEntry(id, entry);
    const cat = String(entry.category || '').toLowerCase();
    const grp = String(entry.atlasGroup || '').toLowerCase();
    if (id.startsWith('prize_') || cat === 'prize' || grp.includes('prize')) prizeCount++;
    else if (id.startsWith('zonk_') || cat === 'zonk' || grp.includes('zonk')) zonkCount++;
    else if (id.startsWith('vip_') || cat === 'vip_celeb' || grp.includes('vip')) vipCount++;
    else if (id.includes('backdrop') || cat.includes('backdrop') || grp.includes('backdrop')) backdropCount++;
    else if (id.startsWith('studio_crowd') || id.startsWith('crowd_') || cat.includes('crowd') || grp.includes('crowd')) crowdCount++;
  }

  if (prizeCount < MIN_PRIZE_SPRITES) {
    errors.push(`${label}: expected >= ${MIN_PRIZE_SPRITES} prize sprites, found ${prizeCount}`);
  }
  if (zonkCount < MIN_ZONK_SPRITES) {
    errors.push(`${label}: expected >= ${MIN_ZONK_SPRITES} zonk sprites, found ${zonkCount}`);
  }
  if (vipCount < MIN_VIP_SPRITES) {
    errors.push(`${label}: expected >= ${MIN_VIP_SPRITES} VIP sprites, found ${vipCount}`);
  }
  if (backdropCount < MIN_BACKDROP_SPRITES) {
    errors.push(`${label}: expected >= ${MIN_BACKDROP_SPRITES} scene backdrops, found ${backdropCount}`);
  }
  if (crowdCount < MIN_CROWD_SPRITES) {
    errors.push(`${label}: expected >= ${MIN_CROWD_SPRITES} studio crowd plates, found ${crowdCount}`);
  }
  if (allKeys.length < MIN_TOTAL_ATLAS_SPRITES) {
    errors.push(`${label}: expected >= ${MIN_TOTAL_ATLAS_SPRITES} total sprite entries (>=55 prizes + >=6 zonks + 7 VIPs + 2 backdrops + 2 crowd), found ${allKeys.length}`);
  }

  return {
    exists: true,
    manifestExists: true,
    presentCount: presentIds.length,
    totalEntries: allKeys.length,
    counts: { prizeCount, zonkCount, vipCount, backdropCount, crowdCount },
    expectedMinTotal: MIN_TOTAL_ATLAS_SPRITES,
    referencedFiles: [...referencedFiles].map((f) => path.relative(dirPath, f)),
    errors,
  };
}

export function runGateS4({ repoRoot = REPO_ROOT, baseline = false } = {}) {
  const pubDir = path.join(repoRoot, 'public', 'assets', 'v9');
  const distDir = path.join(repoRoot, 'dist', 'assets', 'v9');
  const pubCheck = validateManifestAtDir(pubDir, 'public/assets/v9');
  const distCheck = validateManifestAtDir(distDir, 'dist/assets/v9');

  if (!pubCheck.exists && !distCheck.exists) {
    const status = baseline ? 'PENDING_M2' : 'FAIL';
    return {
      gate: 'S4_GOUACHE_ATLAS_MANIFEST',
      status,
      ok: baseline,
      expectedCount: MIN_TOTAL_ATLAS_SPRITES,
      pubCheck,
      distCheck,
      details: `public/assets/v9 and dist/assets/v9 not yet present (${status}; expects >= ${MIN_TOTAL_ATLAS_SPRITES} sprites: >=55 prizes + >=6 zonks + 7 VIPs + 2 backdrops + 2 crowd)`,
    };
  }

  if (pubCheck.errors.length === 0 && !distCheck.exists && baseline) {
    return {
      gate: 'S4_GOUACHE_ATLAS_MANIFEST',
      status: 'PENDING_M2',
      ok: true,
      expectedCount: MIN_TOTAL_ATLAS_SPRITES,
      pubCheck,
      distCheck,
      details: `public/assets/v9 validated (${pubCheck.totalEntries} sprites: prizes=${pubCheck.counts?.prizeCount}, zonks=${pubCheck.counts?.zonkCount}, vips=${pubCheck.counts?.vipCount}, backdrops=${pubCheck.counts?.backdropCount}, crowd=${pubCheck.counts?.crowdCount}); dist/assets/v9 pending rebuild`,
    };
  }

  const allErrors = [...pubCheck.errors, ...distCheck.errors];
  if (pubCheck.exists && distCheck.exists && pubCheck.totalEntries !== distCheck.totalEntries) {
    allErrors.push(`public/assets/v9 (${pubCheck.totalEntries}) != dist/assets/v9 (${distCheck.totalEntries}) sprite count mismatch`);
  }
  const ok = allErrors.length === 0;
  return {
    gate: 'S4_GOUACHE_ATLAS_MANIFEST',
    status: ok ? 'PASS' : 'FAIL',
    ok,
    expectedCount: MIN_TOTAL_ATLAS_SPRITES,
    pubCheck,
    distCheck,
    errors: allErrors,
    details: ok
      ? `All ${pubCheck.totalEntries} gouache sprites (prizes=${pubCheck.counts?.prizeCount}, zonks=${pubCheck.counts?.zonkCount}, vips=${pubCheck.counts?.vipCount}, backdrops=${pubCheck.counts?.backdropCount}, crowd=${pubCheck.counts?.crowdCount}) validated in public/assets/v9 & dist/assets/v9`
      : `${allErrors.length} atlas manifest/file error(s): ${allErrors.slice(0, 5).join('; ')}`,
  };
}

export function runGateS5({ repoRoot = REPO_ROOT } = {}) {
  const srcFiles = walkFiles(path.join(repoRoot, 'src'), (f) => /\.(ts|tsx|js|jsx|css)$/i.test(f));
  const indexHtml = path.join(repoRoot, 'index.html');
  if (fs.existsSync(indexHtml)) srcFiles.push(indexHtml);

  const bannedPattern = /\b(buildMobileStudioCrowdApron|buildMobileStageApronCrowd|mobileCrowdApron)\b/g;
  const violations = [];
  for (const filePath of srcFiles) {
    const rel = path.relative(repoRoot, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      bannedPattern.lastIndex = 0;
      let m;
      while ((m = bannedPattern.exec(line)) !== null) {
        violations.push({
          location: `${rel}:${i + 1}:${m[0]}`,
          file: rel,
          line: i + 1,
          token: m[0],
        });
      }
    }
  }

  const ok = violations.length === 0;
  return {
    gate: 'S5_NO_MOBILE_CROWD_APRON_P0',
    status: ok ? 'PASS' : 'FAIL',
    ok,
    scannedFiles: srcFiles.length,
    violationCount: violations.length,
    violations,
    details: ok
      ? `0 buildMobileStudioCrowdApron / buildMobileStageApronCrowd / mobileCrowdApron occurrences across ${srcFiles.length} files`
      : `P0 STOP-THE-LINE VIOLATION: ${violations.length} occurrence(s) of banned mobile crowd apron symbols in src/ (${violations.slice(0, 3).map((v) => v.location).join(', ')})`,
  };
}

function stripComments(sourceText) {
  return String(sourceText)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\r\n]*/g, '$1');
}

export function runGateS6({ repoRoot = REPO_ROOT, baseline = false } = {}) {
  const stageWorldsPath = path.join(repoRoot, 'src', 'v7', 'engine', 'StageWorldsV7.ts');
  if (!fs.existsSync(stageWorldsPath)) {
    return {
      gate: 'S6_CROWD_ASPECT_RATIO',
      status: baseline ? 'PENDING_M2' : 'FAIL',
      ok: baseline,
      details: 'StageWorldsV7.ts not found',
    };
  }
  const rawSrc = fs.readFileSync(stageWorldsPath, 'utf8');
  const src = stripComments(rawSrc);
  const hasCrowdBuilders = /VipLogeCrowd|RowC_Crowd/.test(src);
  if (!hasCrowdBuilders) {
    return {
      gate: 'S6_CROWD_ASPECT_RATIO',
      status: baseline ? 'PENDING_M2' : 'FAIL',
      ok: baseline,
      details: 'VipLogeCrowd / RowC_Crowd builders not yet present in StageWorldsV7.ts',
    };
  }
  const hasUSpanSubRange = /\bconst\s+uSpan\b[^;]*sub\s*\[\s*1\s*\]\s*-\s*sub\s*\[\s*0\s*\]/.test(src);
  const hasTrueAspectFormula =
    /\bconst\s+trueAspect\b[^;]*\(\s*[\w.]+\.w\s*\*\s*uSpan\s*\)\s*\/\s*(?:Math\.max\([^,]+,\s*)?[\w.]+\.h\s*\)?/.test(src);
  const hasPlaneWidthUsingTrueAspect =
    /\b(?:targetW|planeWidth|planeW)\s*=[^;]*trueAspect/.test(src) &&
    /new\s+THREE\.PlaneGeometry\s*\(\s*[^,]*\b(?:targetW|planeWidth|planeW|[^,]*trueAspect)\b/.test(src);
  const ok = hasUSpanSubRange && hasTrueAspectFormula && hasPlaneWidthUsingTrueAspect;
  return {
    gate: 'S6_CROWD_ASPECT_RATIO',
    status: ok ? 'PASS' : 'FAIL',
    ok,
    hasUSpanSubRange,
    hasTrueAspectFormula,
    hasPlaneWidthUsingTrueAspect,
    details: ok
      ? 'VipLogeCrowd / RowC_Crowd trueAspect = (sprite.w * uSpan) / sprite.h & PlaneGeometry width lock verified in StageWorldsV7.ts'
      : `VipLogeCrowd / RowC_Crowd failed trueAspect formula/usage check in StageWorldsV7.ts (uSpan=${hasUSpanSubRange}, formula=${hasTrueAspectFormula}, applied=${hasPlaneWidthUsingTrueAspect})`,
  };
}

export function runAllStaticGates(options = {}) {
  const skipBuild = Boolean(options.skipBuild);
  const strictV9 = Boolean(options.strictV9);
  const baseline = Boolean(options.baseline) && !strictV9;
  const repoRoot = options.repoRoot || REPO_ROOT;

  const s1 =
    strictV9 && skipBuild
      ? {
          gate: 'S1_BUILD_AND_TYPECHECK',
          status: 'FAIL',
          ok: false,
          details: '--skip-build is forbidden under --strict-v9',
        }
      : runGateS1({ repoRoot, skipBuild });
  const s2 = runGateS2({ repoRoot, baseline });
  const s3 = runGateS3({ repoRoot, baseline });
  const s4 = runGateS4({ repoRoot, baseline });
  const s5 = runGateS5({ repoRoot });
  const s6 = runGateS6({ repoRoot, baseline });

  const gates = [s1, s2, s3, s4, s5, s6];
  const passed = gates.every((g) => g.ok);

  return {
    timestamp: new Date().toISOString(),
    mode: baseline ? 'baseline' : 'strict-v9',
    passed,
    gates,
  };
}

function parseCliArgs(argv) {
  const opts = { skipBuild: false, strictV9: false, baseline: false, jsonOut: null };
  for (const arg of argv) {
    if (arg === '--skip-build') opts.skipBuild = true;
    else if (arg === '--strict-v9') opts.strictV9 = true;
    else if (arg === '--baseline') opts.baseline = true;
    else if (arg.startsWith('--json-out=')) opts.jsonOut = arg.slice('--json-out='.length);
  }
  return opts;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const opts = parseCliArgs(process.argv.slice(2));
  const report = runAllStaticGates(opts);

  console.log(`\n=== World's Smartest v9 Static Gates (${report.mode}) ===`);
  for (const g of report.gates) {
    console.log(`[${g.status}] ${g.gate}: ${g.details}`);
    if ((g.gate === 'S3_DARK_NAVY_SAAS_PURGE' || g.gate === 'S5_NO_MOBILE_CROWD_APRON_P0') && g.violations?.length) {
      const sample = g.violations.slice(0, 12).map((v) => `    - ${v.location}`);
      console.log(sample.join('\n'));
      if (g.violations.length > 12) {
        console.log(`    ... and ${g.violations.length - 12} more`);
      }
    }
    if (g.gate === 'S4_GOUACHE_ATLAS_MANIFEST' && g.errors?.length) {
      for (const err of g.errors.slice(0, 10)) {
        console.log(`    - ${err}`);
      }
    }
  }
  console.log(`Overall Static Gates: ${report.passed ? 'PASS' : 'FAIL'}\n`);

  if (opts.jsonOut) {
    const outPath = path.resolve(REPO_ROOT, opts.jsonOut);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  }

  process.exit(report.passed ? 0 : 1);
}
