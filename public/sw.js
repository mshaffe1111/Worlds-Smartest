/* ============================================================================
 * WORLD'S SMARTEST — True Airplane-Mode Offline Service Worker (`public/sw.js`)
 * 100% Subpath-Safe: works identically on http://localhost:8088/
 * AND https://mshaffe1111.github.io/Worlds-Smartest/
 * Zero hardcoded leading-slash paths — every URL derives from registration.scope
 * ============================================================================ */

const SHELL_CACHE = 'ws-meridian-shell-v6-r3';
const DATA_CACHE = 'ws-meridian-data-v6-r3';
const VALID_CACHES = new Set([SHELL_CACHE, DATA_CACHE]);

const NAVIGATION_TIMEOUT_MS = 2500;
const EXTERNAL_FONT_TIMEOUT_MS = 1500;
const PRECACHE_CONCURRENCY = 16;

const CORE_SHELL_ASSETS = [
  './manifest.json',
  './favicon.ico',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './apple-touch-icon.png',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  // v6 Ultra-HD 4K Natural Earth Relief Globe, Calibrated Index, Witty Clues & Dramedy
  './assets/textures/v6/earth_relief_albedo_4k.webp',
  './assets/textures/v6/earth_elevation_bump_2k.webp',
  './assets/textures/v6/earth_ocean_specular_2k.webp',
  './data/v6/shard_fame_difficulty_index.json',
  './data/v6/prime_time_witty_clues_v6.json',
  './data/v6/backstage_dramedy_script_v6.json',
  // v6 Original Abbey-Road Symphonies & Priority Horological Foley
  './assets/audio/v6/music/curtain_overture.mp3',
  './assets/audio/v6/music/backstage_velvet.mp3',
  './assets/audio/v6/music/trophy_hall_majesty.mp3',
  './assets/audio/v6/music/trapdoor_survival_blitz.mp3',
  './assets/audio/v6/music/crown_victory_fanfare.mp3',
  './assets/audio/v6/sfx/ui_brass_tap.mp3',
  './assets/audio/v6/sfx/brass_gear_detent.mp3',
  './assets/audio/v6/sfx/wire_cutter_snip.mp3',
  './assets/audio/v6/sfx/globe_pin_ruby_click.mp3',
  './assets/audio/v6/sfx/trapdoor_hinge_drop.mp3',
  './assets/audio/v6/sfx/velvet_trunk_clasp.mp3',
  './assets/audio/v6/sfx/streak_fanfare_5.mp3',
  './assets/audio/sfx_crowd_small_hall.mp3',
  './assets/audio/sfx_crowd_tv_studio.mp3',
  './assets/audio/sfx_crowd_global_arena.mp3',
  './assets/audio/sfx_crowd_gasp.mp3',
  './assets/audio/sfx_tile_flip.mp3',
  './assets/audio/sfx_padlock_break.mp3',
  './assets/audio/sfx_wheel_tick.mp3',
  './assets/audio/sfx_power_play.mp3',
  './assets/audio/sfx_wedge_earned.mp3',
  './assets/audio/sfx_rival_trap.mp3',
  './assets/audio/sfx_lock_in.mp3',
  './assets/audio/sfx_wrong_answer.mp3',
  './assets/audio/sfx_ui_tap.mp3',
  './assets/audio/sfx_spin_tick.mp3',
  './assets/audio/sfx_sightline_snap.mp3',
  './assets/audio/sfx_shutter_peel.mp3',
  './assets/audio/sfx_overclock_charge.mp3',
  './assets/audio/sfx_vault_thunk.mp3',
  './assets/audio/sfx_gold_resonance.mp3',
  './assets/audio/sfx_backfire_fracture.mp3',
  './assets/audio/sfx_glass_shatter.mp3',
  './assets/audio/sfx_passport_stamp.mp3',
  './assets/audio/ambience_chamber_room.mp3',
  // Core UI Sprites, Faction Crests & Category Icons
  './assets/ui/spark_glow.png',
  './assets/ui/badge_streak_fire.png',
  './assets/ui/star_empty.png',
  './assets/ui/star_filled.png',
  './assets/ui/cat_0.png',
  './assets/ui/cat_1.png',
  './assets/ui/cat_2.png',
  './assets/ui/cat_3.png',
  './assets/ui/cat_4.png',
  './assets/ui/cat_5.png',
  './assets/ui/cat_6.png',
  './assets/ui/cat_7.png',
  './assets/ui/cat_8.png',
  './assets/ui/cat_9.png',
  './assets/ui/cat_10.png',
  './assets/ui/cat_11.png',
  './assets/factions/faction_sovereign.png',
  './assets/factions/faction_horizon.png',
  './assets/factions/faction_agora.png',
  // All 36 Horological Domain/Topic Glyphs (used across Briefing, Daily & Instant Prism)
  './assets/glyphs/manifest.json',
  './assets/glyphs/alembic_flask.png',
  './assets/glyphs/apollo_lyre.png',
  './assets/glyphs/artisan_amphora.png',
  './assets/glyphs/astrolabe.png',
  './assets/glyphs/atom_orbital.png',
  './assets/glyphs/botanical_frond.png',
  './assets/glyphs/chess_knight.png',
  './assets/glyphs/chronograph_dial.png',
  './assets/glyphs/cinema_reel.png',
  './assets/glyphs/cipher_key.png',
  './assets/glyphs/compass_rose.png',
  './assets/glyphs/diplomatic_olive.png',
  './assets/glyphs/dna_helix.png',
  './assets/glyphs/double_eagle.png',
  './assets/glyphs/fibonacci_spiral.png',
  './assets/glyphs/gavel_charter.png',
  './assets/glyphs/globe_grid.png',
  './assets/glyphs/gothic_rose.png',
  './assets/glyphs/grimoire_quill.png',
  './assets/glyphs/horology_gears.png',
  './assets/glyphs/ionic_column.png',
  './assets/glyphs/mobius_infinity.png',
  './assets/glyphs/nautilus_shell.png',
  './assets/glyphs/neural_network.png',
  './assets/glyphs/olympic_torch.png',
  './assets/glyphs/ouroboros_sun.png',
  './assets/glyphs/painters_palette.png',
  './assets/glyphs/prism_refraction.png',
  './assets/glyphs/quantum_chip.png',
  './assets/glyphs/ringed_planet.png',
  './assets/glyphs/scales_treaty.png',
  './assets/glyphs/trident_crown.png',
  './assets/glyphs/victory_laurel.png',
  './assets/glyphs/vinyl_waveform.png',
  './assets/glyphs/volcano.png',
  './assets/glyphs/wax_seal_scroll.png',
  // Honour & Achievement Medals (for live Citation Unlocked toasts offline)
  './assets/medals/manifest.json',
  './assets/medals/medal_tier1_bronze.png',
  './assets/medals/medal_tier2_sterling.png',
  './assets/medals/medal_tier3_gold.png',
  './assets/medals/medal_tier4_sapphire.png',
  './assets/medals/medal_tier5_mythic.png',
  './assets/medals/trophy_overclock_roulette.png',
  './assets/medals/trophy_polymath_globe.png',
  './assets/medals/trophy_streak_chronometer.png',
  // Character Cutout Portraits (Nadia coach banners, Vance briefings & Rivals)
  './assets/portraits_cutout/vance.png',
  './assets/portraits_cutout/vance_intense.png',
  './assets/portraits_cutout/nadia.png',
  './assets/portraits_cutout/nadia_shocked.png',
  './assets/portraits_cutout/soren.png',
  './assets/portraits_cutout/soren_smirk.png',
  './assets/portraits_cutout/teo.png',
  './assets/portraits_cutout/teo_intense.png',
  './assets/portraits_cutout/tariq.png',
  './assets/portraits_cutout/lindqvist.png',
  // Diplomatic Passport Visa Stamps
  './assets/visas/visa_ch.png',
  './assets/visas/visa_gb.png',
  './assets/visas/visa_jp.png',
  './assets/visas/visa_br.png',
  './assets/visas/visa_eg.png',
  './assets/visas/visa_is.png',
  './assets/visas/visa_sg.png',
  './assets/visas/visa_global.png',
];

const CORE_DATA_ASSETS = [
  './data/v5_story_acts_1_2.json',
  './data/v5_story_acts_3_5.json',
  './data/v5_voice_manifest.json',
  './data/v5_stage_themes_manifest.json',
  './data/world_tour_v4.json',
  './data/curated_v4_witty_pack.json',
  './data/shards/taxonomy_tree.json',
  './data/shards/shard_manifest.json',
  './data/questions.json.gz',
  './data/shards/subcat_baseball.json',
  './data/visual_globe_packs.json',
  './data/jeopardy_signature_packs.json',
  './data/gold_venue_packs.json',
];

const STATIC_EXT_RE = /\.(js|mjs|css|glb|gltf|hdr|mp3|wav|ogg|png|svg|jpe?g|webp|ico|woff2?|ttf|wasm)$/i;
const DATA_EXT_RE = /\.(json|gz)$/i;

/**
 * Resolves any relative path strictly against `self.registration.scope`.
 * Ensures identical resolution on localhost root and GitHub Pages subpaths.
 */
function resolveScopeUrl(relOrAbsPath) {
  return new URL(relOrAbsPath, self.registration.scope).href;
}

/**
 * Returns the path portion relative to `self.registration.scope` if `url`
 * belongs to this Service Worker's origin and scope, otherwise `null`.
 */
function getScopeRelativePath(url) {
  const scopeUrl = new URL(self.registration.scope);
  if (url.origin !== scopeUrl.origin) return null;
  if (!url.pathname.startsWith(scopeUrl.pathname)) return null;
  return url.pathname.slice(scopeUrl.pathname.length);
}

function isGoogleFontsUrl(url) {
  return url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
}

function isDataUrl(url) {
  const relPath = getScopeRelativePath(url);
  if (relPath === null) return false;
  return relPath.startsWith('data/') && DATA_EXT_RE.test(relPath);
}

function isStaticAssetUrl(url) {
  if (isGoogleFontsUrl(url)) return true;
  const relPath = getScopeRelativePath(url);
  if (relPath === null) return false;
  if (relPath === 'sw.js') return false;
  if (relPath === 'manifest.json') return true;
  if (relPath.startsWith('assets/')) return true;
  return STATIC_EXT_RE.test(relPath);
}

function shouldBypassRequest(request, url) {
  if (request.method !== 'GET') return true;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
  if (url.searchParams.get('nosw') === '1') return true;
  if (request.referrer) {
    try {
      const refUrl = new URL(request.referrer);
      if (refUrl.searchParams.get('nosw') === '1') return true;
    } catch {
      // Ignore malformed referrer
    }
  }
  const relPath = getScopeRelativePath(url);
  if (relPath === 'sw.js') return true;
  return false;
}

function isCacheableResponse(response) {
  if (!response) return false;
  if (response.type === 'opaque') return true;
  // Never cache 206 Partial Content — CacheStorage.put rejects 206 responses
  return response.status === 200;
}

async function fetchWithTimeout(input, init, timeoutMs) {
  if (typeof AbortController === 'undefined') {
    return fetch(input, init);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const mergedInit = init ? { ...init, signal: controller.signal } : { signal: controller.signal };
    return await fetch(input, mergedInit);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extracts active script, modulepreload, stylesheet, icon, and manifest URLs
 * from `index.html` HTML text, resolving each against `self.registration.scope`.
 */
function discoverAssetsFromIndexHtml(htmlText) {
  const discovered = new Set();
  const scopeHref = self.registration.scope;

  // 1) <script ... src="...">
  const scriptRe = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match = null;
  while ((match = scriptRe.exec(htmlText)) !== null) {
    const raw = (match[1] || '').trim();
    if (!raw || raw.startsWith('data:') || raw.startsWith('blob:')) continue;
    try {
      discovered.add(new URL(raw, scopeHref).href);
    } catch {
      // Skip malformed URLs
    }
  }

  // 2) <link ... rel="..." href="..."> (attributes in any order)
  const linkTagRe = /<link\b[^>]*>/gi;
  const relAttrRe = /\brel\s*=\s*["']([^"']+)["']/i;
  const hrefAttrRe = /\bhref\s*=\s*["']([^"']+)["']/i;
  const cacheableRels = new Set([
    'stylesheet',
    'modulepreload',
    'preload',
    'manifest',
    'icon',
    'shortcut',
    'apple-touch-icon',
  ]);

  while ((match = linkTagRe.exec(htmlText)) !== null) {
    const tag = match[0];
    const relMatch = relAttrRe.exec(tag);
    const hrefMatch = hrefAttrRe.exec(tag);
    if (!relMatch || !hrefMatch) continue;

    const relTokens = relMatch[1].toLowerCase().split(/\s+/).filter(Boolean);
    if (relTokens.includes('preconnect') || relTokens.includes('dns-prefetch')) continue;
    if (!relTokens.some((token) => cacheableRels.has(token))) continue;

    const rawHref = hrefMatch[1].trim();
    if (!rawHref || rawHref.startsWith('data:') || rawHref.startsWith('blob:')) continue;
    try {
      discovered.add(new URL(rawHref, scopeHref).href);
    } catch {
      // Skip malformed URLs
    }
  }

  return Array.from(discovered);
}

/**
 * Extracts Google Font binary URLs (`https://fonts.gstatic.com/...`) from CSS text.
 */
function discoverFontBinariesFromCss(cssText) {
  const urls = new Set();
  const re = /url\(\s*["']?(https:\/\/fonts\.gstatic\.com\/[^"')]+)["']?\s*\)/gi;
  let match = null;
  while ((match = re.exec(cssText)) !== null) {
    if (match[1]) urls.add(match[1]);
  }
  return Array.from(urls);
}

/**
 * Extracts optional visual SVG URLs from `visual_globe_packs.json` if present.
 */
function discoverVisualUrlsFromPackData(packJson) {
  const urls = new Set();
  const lists = [];
  if (Array.isArray(packJson)) {
    lists.push(packJson);
  } else if (packJson && typeof packJson === 'object') {
    for (const key of ['questions', 'visualQuestions', 'items', 'records', 'packs']) {
      if (Array.isArray(packJson[key])) {
        lists.push(packJson[key]);
      }
    }
  }
  for (const list of lists) {
    for (const entry of list) {
      if (!entry || typeof entry !== 'object') continue;
      const imgUrl =
        (entry.visualPlate && typeof entry.visualPlate.imageUrl === 'string' && entry.visualPlate.imageUrl) ||
        (typeof entry.imageUrl === 'string' && entry.imageUrl) ||
        null;
      if (imgUrl && !imgUrl.startsWith('data:')) {
        try {
          urls.add(resolveScopeUrl(imgUrl));
        } catch {
          // Ignore malformed path
        }
      }
    }
  }
  return Array.from(urls);
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function next() {
    while (cursor < items.length) {
      const idx = cursor++;
      try {
        results[idx] = { status: 'fulfilled', value: await worker(items[idx], idx) };
      } catch (reason) {
        results[idx] = { status: 'rejected', reason };
      }
    }
  }

  const workers = [];
  const count = Math.min(limit, items.length);
  for (let i = 0; i < count; i++) {
    workers.push(next());
  }
  await Promise.all(workers);
  return results;
}

async function cacheSingleUrl(absUrl, cacheName, options) {
  const forceRefresh = Boolean(options && options.forceRefresh);
  const timeoutMs = options && typeof options.timeoutMs === 'number' ? options.timeoutMs : 0;

  let parsed;
  try {
    parsed = new URL(absUrl);
  } catch {
    return { status: 'failed', url: absUrl };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { status: 'skipped', url: absUrl };
  }

  const cache = await caches.open(cacheName);
  if (!forceRefresh) {
    const existing = await cache.match(absUrl);
    if (existing) {
      return { status: 'skipped', url: absUrl };
    }
  }

  const fetchInit = forceRefresh && parsed.origin === self.location.origin ? { cache: 'no-cache' } : undefined;
  const response = timeoutMs > 0
    ? await fetchWithTimeout(absUrl, fetchInit, timeoutMs)
    : await fetch(absUrl, fetchInit);

  if (!isCacheableResponse(response)) {
    return { status: 'failed', url: absUrl };
  }

  await cache.put(absUrl, response.clone());
  return { status: 'cached', url: absUrl, response };
}

async function precacheOnInstall() {
  const shellCache = await caches.open(SHELL_CACHE);
  const indexHref = resolveScopeUrl('./index.html');
  const rootHref = resolveScopeUrl('./');

  const discoveredShellUrls = new Set(CORE_SHELL_ASSETS.map((p) => resolveScopeUrl(p)));
  const externalFontCssUrls = [];

  // Step 1: Fetch index.html and dynamically discover Vite hashed bundles + links
  try {
    const indexResponse = await fetch(indexHref, { cache: 'no-cache' });
    if (isCacheableResponse(indexResponse)) {
      await shellCache.put(indexHref, indexResponse.clone());
      await shellCache.put(rootHref, indexResponse.clone());

      const htmlText = await indexResponse.text();
      const discovered = discoverAssetsFromIndexHtml(htmlText);
      for (const href of discovered) {
        const parsed = new URL(href);
        if (parsed.hostname === 'fonts.googleapis.com') {
          externalFontCssUrls.push(href);
        } else if (parsed.origin === self.location.origin) {
          discoveredShellUrls.add(href);
        }
      }
    }
  } catch {
    // Non-fatal: continue precaching remaining assets
  }

  // Step 2 & 3: Precache core shell/GLBs/Foley/glyphs/medals + core data in parallel
  const visualPackHref = resolveScopeUrl('./data/visual_globe_packs.json');
  let visualSvgUrls = [];
  const dataUrls = CORE_DATA_ASSETS.map((p) => resolveScopeUrl(p));

  await Promise.all([
    runWithConcurrency(Array.from(discoveredShellUrls), PRECACHE_CONCURRENCY, (href) =>
      cacheSingleUrl(href, SHELL_CACHE, { forceRefresh: false }),
    ),
    runWithConcurrency(dataUrls, PRECACHE_CONCURRENCY, async (href) => {
      const res = await cacheSingleUrl(href, DATA_CACHE, { forceRefresh: false });
      if (href === visualPackHref && res.response && res.response.status === 200) {
        try {
          const json = await res.response.json();
          visualSvgUrls = discoverVisualUrlsFromPackData(json);
        } catch {
          // Ignore non-JSON or empty visual pack
        }
      }
      return res;
    }),
  ]);

  // Step 4: Precache discovered visual blueprint SVGs (if visual_globe_packs.json existed)
  if (visualSvgUrls.length > 0) {
    await runWithConcurrency(visualSvgUrls, PRECACHE_CONCURRENCY, (href) =>
      cacheSingleUrl(href, SHELL_CACHE, { forceRefresh: false }),
    );
  }

  // Step 5: Non-blocking background Google Fonts cache (NEVER stalls SW install/activation!)
  if (externalFontCssUrls.length > 0) {
    void precacheExternalFontsBackground(externalFontCssUrls);
  }
}

async function precacheExternalFontsBackground(externalFontCssUrls) {
  try {
    const fontBinaryUrls = new Set();
    await Promise.allSettled(
      externalFontCssUrls.map(async (cssHref) => {
        const res = await cacheSingleUrl(cssHref, SHELL_CACHE, {
          forceRefresh: false,
          timeoutMs: EXTERNAL_FONT_TIMEOUT_MS,
        });
        if (res.response && res.response.status === 200) {
          try {
            const cssText = await res.response.text();
            for (const woff of discoverFontBinariesFromCss(cssText)) {
              fontBinaryUrls.add(woff);
            }
          } catch {
            // Opaque or unreadable CSS — skip binary discovery
          }
        }
      }),
    );

    if (fontBinaryUrls.size > 0) {
      await runWithConcurrency(Array.from(fontBinaryUrls), 8, (woffHref) =>
        cacheSingleUrl(woffHref, SHELL_CACHE, {
          forceRefresh: false,
          timeoutMs: EXTERNAL_FONT_TIMEOUT_MS,
        }),
      );
    }
  } catch {
    // Non-fatal external font warming failure
  }
}

async function countCacheEntries() {
  let shellCount = 0;
  let dataCount = 0;
  try {
    const shell = await caches.open(SHELL_CACHE);
    shellCount = (await shell.keys()).length;
  } catch {
    shellCount = 0;
  }
  try {
    const data = await caches.open(DATA_CACHE);
    dataCount = (await data.keys()).length;
  } catch {
    dataCount = 0;
  }
  return {
    shellCount,
    dataCount,
    cachedEntryCount: shellCount + dataCount,
  };
}

/**
 * Serves a spec-compliant HTTP 206 Partial Content slice from a cached full
 * 200 response so HTML `<audio>` range requests work cleanly in Airplane Mode.
 */
async function buildRangeResponse(fullResponse, rangeHeader) {
  const arrayBuffer = await fullResponse.arrayBuffer();
  const totalBytes = arrayBuffer.byteLength;
  const match = /bytes=(\d*)-(\d*)/i.exec(rangeHeader || '');
  if (!match) {
    return new Response(arrayBuffer, {
      status: 200,
      headers: fullResponse.headers,
    });
  }

  const startStr = match[1];
  const endStr = match[2];
  let start = startStr ? Number.parseInt(startStr, 10) : 0;
  let end = endStr ? Number.parseInt(endStr, 10) : totalBytes - 1;

  if (!startStr && endStr) {
    // Suffix range: bytes=-500
    const suffixLen = Number.parseInt(endStr, 10);
    start = Math.max(0, totalBytes - suffixLen);
    end = totalBytes - 1;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= totalBytes) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${totalBytes}` },
    });
  }

  end = Math.min(end, totalBytes - 1);
  const sliced = arrayBuffer.slice(start, end + 1);
  const headers = new Headers(fullResponse.headers);
  headers.set('Content-Range', `bytes ${start}-${end}/${totalBytes}`);
  headers.set('Content-Length', String(sliced.byteLength));
  headers.set('Accept-Ranges', 'bytes');

  return new Response(sliced, {
    status: 206,
    statusText: 'Partial Content',
    headers,
  });
}

/**
 * Navigation handler: Network-First with 2500ms timeout -> fallback to cached `./index.html`.
 */
async function handleNavigationRequest(request) {
  const shellCache = await caches.open(SHELL_CACHE);
  const indexHref = resolveScopeUrl('./index.html');
  const rootHref = resolveScopeUrl('./');

  try {
    const networkResponse = await fetchWithTimeout(
      request,
      { cache: 'no-store' },
      NAVIGATION_TIMEOUT_MS,
    );
    if (networkResponse && networkResponse.status === 200) {
      const contentType = (networkResponse.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('text/html')) {
        await shellCache.put(indexHref, networkResponse.clone()).catch(() => {});
        await shellCache.put(rootHref, networkResponse.clone()).catch(() => {});
      }
      return networkResponse;
    }
    if (networkResponse && networkResponse.status < 500) {
      return networkResponse;
    }
  } catch {
    // Offline or timeout — fall straight through to cached shell
  }

  const cachedIndex =
    (await shellCache.match(indexHref)) ||
    (await shellCache.match(rootHref)) ||
    (await caches.match(request, { ignoreSearch: true }));

  if (cachedIndex) {
    return cachedIndex;
  }

  return new Response(
    '<!doctype html><html lang="en"><body style="background:#050811;color:#f5f0e6;font-family:sans-serif;padding:2rem;"><h1>World\'s Smartest</h1><p>Offline cache is initializing. Reconnect once to populate the Meridian Vault.</p></body></html>',
    {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    },
  );
}

/**
 * Data handler: Stale-While-Revalidate in `ws-meridian-data-v2`.
 * Instant 0ms cache hit offline + silent background refresh online.
 */
async function handleDataRequest(event, request, url) {
  const dataCache = await caches.open(DATA_CACHE);
  const cached = (await dataCache.match(request)) || (await dataCache.match(url.href));

  const revalidate = (async () => {
    try {
      const networkResponse = await fetch(request);
      if (isCacheableResponse(networkResponse)) {
        await dataCache.put(url.href, networkResponse.clone()).catch(() => {});
      }
      return networkResponse;
    } catch {
      return null;
    }
  })();

  if (cached) {
    event.waitUntil(revalidate);
    return cached;
  }

  const fresh = await revalidate;
  if (fresh) {
    return fresh;
  }

  return new Response(JSON.stringify({ error: 'offline_data_unavailable', url: url.href }), {
    status: 503,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * Static Assets & Google Fonts handler: Cache-First with background populate on first fetch.
 */
async function handleStaticAssetRequest(event, request, url) {
  const shellCache = await caches.open(SHELL_CACHE);
  const rangeHeader = request.headers.get('range');

  if (rangeHeader) {
    const cachedFull = await shellCache.match(url.href);
    if (cachedFull) {
      return buildRangeResponse(cachedFull.clone(), rangeHeader);
    }
    try {
      const netRes = await fetch(request);
      // Populate full 200 cache asynchronously for future offline playback
      if (url.origin === self.location.origin) {
        event.waitUntil(
          fetch(url.href)
            .then((fullRes) => {
              if (isCacheableResponse(fullRes)) {
                return shellCache.put(url.href, fullRes.clone());
              }
              return undefined;
            })
            .catch(() => {}),
        );
      }
      return netRes;
    } catch {
      return new Response(null, { status: 503, statusText: 'Offline' });
    }
  }

  const cached = (await shellCache.match(request)) || (await shellCache.match(url.href));
  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (isCacheableResponse(networkResponse)) {
      const cacheKey = isGoogleFontsUrl(url) ? request : url.href;
      event.waitUntil(shellCache.put(cacheKey, networkResponse.clone()).catch(() => {}));
    }
    return networkResponse;
  } catch {
    if (url.hostname === 'fonts.googleapis.com') {
      return new Response('', {
        status: 200,
        headers: { 'Content-Type': 'text/css; charset=utf-8' },
      });
    }
    return new Response(null, { status: 503, statusText: 'Offline' });
  }
}

/* ----------------------------------------------------------------------------
 * Service Worker Lifecycle Listeners
 * -------------------------------------------------------------------------- */

self.addEventListener('install', (event) => {
  event.waitUntil(
    precacheOnInstall()
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (!VALID_CACHES.has(key)) {
            return caches.delete(key);
          }
          return Promise.resolve(false);
        }),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  const payload = event.data;
  if (!payload || typeof payload !== 'object') return;
  const replyPort = event.ports && event.ports[0] ? event.ports[0] : null;

  if (payload.type === 'SKIP_WAITING') {
    self.skipWaiting();
    if (replyPort) replyPort.postMessage({ ok: true });
    return;
  }

  if (payload.type === 'GET_STATUS') {
    event.waitUntil(
      countCacheEntries().then((counts) => {
        if (replyPort) {
          replyPort.postMessage({
            ok: true,
            swReady: true,
            ...counts,
            cacheNames: [SHELL_CACHE, DATA_CACHE],
          });
        }
      }),
    );
    return;
  }

  if (payload.type === 'CACHE_URLS' && Array.isArray(payload.urls)) {
    const forceRefresh = Boolean(payload.forceRefresh);
    const resolvedUrls = [];
    const seen = new Set();

    for (const raw of payload.urls) {
      if (typeof raw !== 'string' || !raw.trim()) continue;
      try {
        const abs = resolveScopeUrl(raw.trim());
        const parsed = new URL(abs);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') continue;
        if (parsed.searchParams.get('nosw') === '1') continue;
        if (getScopeRelativePath(parsed) === 'sw.js') continue;
        if (!seen.has(abs)) {
          seen.add(abs);
          resolvedUrls.push(abs);
        }
      } catch {
        // Ignore malformed URL
      }
    }

    event.waitUntil(
      (async () => {
        let cachedCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        await runWithConcurrency(resolvedUrls, PRECACHE_CONCURRENCY, async (absUrl) => {
          const parsed = new URL(absUrl);
          const targetCache = isDataUrl(parsed) ? DATA_CACHE : SHELL_CACHE;
          const timeoutMs = isGoogleFontsUrl(parsed) ? EXTERNAL_FONT_TIMEOUT_MS : 0;
          const result = await cacheSingleUrl(absUrl, targetCache, { forceRefresh, timeoutMs });
          if (result.status === 'cached') cachedCount++;
          else if (result.status === 'skipped') skippedCount++;
          else failedCount++;
        });

        const counts = await countCacheEntries();
        if (replyPort) {
          replyPort.postMessage({
            ok: true,
            cachedCount,
            skippedCount,
            failedCount,
            ...counts,
          });
        }
      })(),
    );
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (shouldBypassRequest(request, url)) {
    return;
  }

  // 1) Navigation requests -> Network-First (2500ms timeout) -> Cached ./index.html
  if (request.mode === 'navigate') {
    const scopeUrl = new URL(self.registration.scope);
    const scopeBaseNoSlash = scopeUrl.pathname.replace(/\/$/, '');
    if (
      url.origin === scopeUrl.origin &&
      (url.pathname.startsWith(scopeUrl.pathname) || url.pathname === scopeBaseNoSlash)
    ) {
      event.respondWith(handleNavigationRequest(request));
    }
    return;
  }

  // 2) Data files (data/*.json & data/*.gz) -> Stale-While-Revalidate
  if (isDataUrl(url)) {
    event.respondWith(handleDataRequest(event, request, url));
    return;
  }

  // 3) Static assets & Google Fonts -> Cache-First with background populate
  if (isStaticAssetUrl(url)) {
    event.respondWith(handleStaticAssetRequest(event, request, url));
  }
});
