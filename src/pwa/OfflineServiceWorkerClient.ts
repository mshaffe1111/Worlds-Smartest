// ============================================================================
// WORLD'S SMARTEST — Offline-First PWA Service Worker Client & Pack Vault
// 100% Subpath-Safe (localhost root & GitHub Pages subpath deployments)
// ============================================================================

export type OfflinePackId = 'ESSENTIAL' | 'BASEBALL_PRO' | 'FULL_WORLD_CIRCUIT';

export interface OfflineVaultStatus {
  swReady: boolean;
  isOnline: boolean;
  cachedEntryCount: number;
  packsReady: string[];
}

export type OfflineStatusListener = (status: OfflineVaultStatus) => void;

export interface OfflinePackInfo {
  readonly id: OfflinePackId;
  readonly title: string;
  readonly description: string;
  readonly estimatedMb: number;
  readonly assetCount: number;
}

export const OFFLINE_SHELL_CACHE = 'ws-meridian-shell-v5-r2';
export const OFFLINE_DATA_CACHE = 'ws-meridian-data-v5-r2';
export const OFFLINE_PACKS_STORAGE_KEY = 'ws_offline_packs_v2';

const SW_READY_TIMEOUT_MS = 20000;
const SW_MESSAGE_TIMEOUT_MS = 15000;
const DOWNLOAD_CONCURRENCY = 12;

const ALL_HOROLOGICAL_GLYPHS: ReadonlyArray<string> = [
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
];

const ALL_MEDAL_ASSETS: ReadonlyArray<string> = [
  './assets/medals/manifest.json',
  './assets/medals/medal_tier1_bronze.png',
  './assets/medals/medal_tier2_sterling.png',
  './assets/medals/medal_tier3_gold.png',
  './assets/medals/medal_tier4_sapphire.png',
  './assets/medals/medal_tier5_mythic.png',
  './assets/medals/trophy_overclock_roulette.png',
  './assets/medals/trophy_polymath_globe.png',
  './assets/medals/trophy_streak_chronometer.png',
];

const ALL_PORTRAIT_CUTOUT_ASSETS: ReadonlyArray<string> = [
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
];

const ALL_VISA_ASSETS: ReadonlyArray<string> = [
  './assets/visas/visa_ch.png',
  './assets/visas/visa_gb.png',
  './assets/visas/visa_jp.png',
  './assets/visas/visa_br.png',
  './assets/visas/visa_eg.png',
  './assets/visas/visa_is.png',
  './assets/visas/visa_sg.png',
  './assets/visas/visa_global.png',
];

const ESSENTIAL_ASSETS: ReadonlyArray<string> = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './apple-touch-icon.png',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  // Core 3D Hardware, Briefing Studio Stage & Default Geneva Chamber
  './assets/aaa_models/veritas_prism.glb',
  './assets/aaa_models/calibrator_chronometer.glb',
  './assets/aaa_models/codex_cryptex.glb',
  './assets/aaa_models/meridian_world_globe.glb',
  './assets/aaa_models/championship_trophy.glb',
  './assets/aaa_models/vetting_chamber_room.glb',
  './assets/models/stage_plinth.glb',
  './assets/models/stage_monolith.glb',
  './assets/models/relic_meridian_astrolabe.glb',
  './assets/hdris/studio_small_09.hdr',
  './assets/venues/ch.jpg',
  './assets/venues/studio.jpg',
  // Core Horological Foley & Room Ambience
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
  ...ALL_HOROLOGICAL_GLYPHS,
  ...ALL_MEDAL_ASSETS,
  ...ALL_PORTRAIT_CUTOUT_ASSETS,
  ...ALL_VISA_ASSETS,
  // Core Data Corpus
  './data/shards/taxonomy_tree.json',
  './data/shards/shard_manifest.json',
  './data/questions.json.gz',
  './data/visual_globe_packs.json',
  './data/jeopardy_signature_packs.json',
  './data/campaign_20hr.json',
  './data/narrative_wave2.json',
  './data/gold_venue_packs.json',
];

const BASEBALL_PRO_EXTRA_ASSETS: ReadonlyArray<string> = [
  './data/shards/subcat_baseball.json',
  './data/shards/domain_5.json',
  './data/shards/domain_subcats_5.json',
  './data/shards/taxonomy_tree.json',
  './data/shards/shard_manifest.json',
  './data/visual_globe_packs.json',
  './data/jeopardy_signature_packs.json',
  './assets/aaa_models/veritas_prism.glb',
  './assets/aaa_models/calibrator_chronometer.glb',
  './assets/aaa_models/codex_cryptex.glb',
  './assets/aaa_models/meridian_world_globe.glb',
  './assets/aaa_models/vetting_chamber_room.glb',
  './assets/models/stage_plinth.glb',
  './assets/models/stage_monolith.glb',
  './assets/models/relic_meridian_astrolabe.glb',
  './assets/hdris/studio_small_09.hdr',
  './assets/venues/ch.jpg',
  './assets/venues/studio.jpg',
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
  ...ALL_HOROLOGICAL_GLYPHS,
  ...ALL_MEDAL_ASSETS,
  ...ALL_PORTRAIT_CUTOUT_ASSETS,
  ...ALL_VISA_ASSETS,
];

const WORLD_CIRCUIT_EXTRA_ASSETS: ReadonlyArray<string> = [
  // All 8 City 3D Venue Rooms
  './assets/aaa_models/vetting_chamber_room.glb',
  './assets/aaa_models/london_rotunda_room.glb',
  './assets/aaa_models/tokyo_pavilion_room.glb',
  './assets/aaa_models/cairo_solar_hall.glb',
  './assets/aaa_models/rio_canopy_room.glb',
  './assets/aaa_models/reykjavik_caldera_room.glb',
  './assets/aaa_models/singapore_skybridge_room.glb',
  './assets/aaa_models/apex_forum_room.glb',
  // Passport, Astrolabe Orb & All 8 City Relics
  './assets/aaa_models/meridian_passport_3d.glb',
  './assets/aaa_models/veritas_astrolabe_orb.glb',
  './assets/models/relic_meridian_astrolabe.glb',
  './assets/aaa_models/relic_london_orrery.glb',
  './assets/aaa_models/relic_tokyo_origami.glb',
  './assets/aaa_models/relic_cairo_cipher.glb',
  './assets/aaa_models/relic_rio_sphere.glb',
  './assets/aaa_models/relic_reykjavik_cryo.glb',
  './assets/aaa_models/relic_singapore_seal.glb',
  './assets/aaa_models/relic_apex_ledger.glb',
  // All 5 HDRI Lighting Environments
  './assets/hdris/studio_small_09.hdr',
  './assets/hdris/entrance_hall.hdr',
  './assets/hdris/dresden_station_night.hdr',
  './assets/hdris/evening_museum_courtyard.hdr',
  './assets/hdris/blue_lagoon_night.hdr',
  // All 10 Venue Vistas
  './assets/venues/ch.jpg',
  './assets/venues/gb.jpg',
  './assets/venues/jp.jpg',
  './assets/venues/eg.jpg',
  './assets/venues/br.jpg',
  './assets/venues/is.jpg',
  './assets/venues/sg.jpg',
  './assets/venues/global.jpg',
  './assets/venues/ledger.jpg',
  './assets/venues/studio.jpg',
  // Ambient Soundscapes
  './assets/audio/ambience_chamber_room.mp3',
  './assets/audio/ambience_london_rain.mp3',
  './assets/audio/ambience_tokyo_neon_rain.mp3',
  './assets/audio/ambience_cairo_vault_air.mp3',
  './assets/audio/ambience_ocean_storm_air.mp3',
  // Campaign, Gold Venue, Baseball & Visual/Jeopardy Data Packs
  './data/campaign_20hr.json',
  './data/gold_venue_packs.json',
  './data/narrative_wave2.json',
  './data/shards/subcat_baseball.json',
  './data/visual_globe_packs.json',
  './data/jeopardy_signature_packs.json',
  './data/shards/taxonomy_tree.json',
  './data/shards/shard_manifest.json',
  './data/questions.json.gz',
];

const DATA_PATH_RE = /(?:^|\/)data\/.+\.(?:json|gz)(?:\?.*)?$/i;

let swReadyState = false;
let cachedEntryCountState = 0;
let storageWriteFailed = false;
let packsReadyState: string[] = loadPersistedPacks();
let windowListenersAttached = false;
let activeRegistrationPromise: Promise<OfflineVaultStatus> | null = null;

const subscribers = new Set<OfflineStatusListener>();

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getBaseHref(): string {
  if (typeof window !== 'undefined' && window.location && window.location.href) {
    return window.location.href;
  }
  return 'http://localhost/';
}

function resolveRelativeUrl(relOrAbs: string): string {
  return new URL(relOrAbs, getBaseHref()).href;
}

function isSwBypassEnabled(): boolean {
  if (typeof window === 'undefined' || !window.location) return false;
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('nosw') === '1';
  } catch {
    return false;
  }
}

function getOnlineFlag(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
}

function loadPersistedPacks(): string[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(OFFLINE_PACKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return Array.from(new Set(parsed.filter((v): v is string => typeof v === 'string' && v.length > 0)));
    }
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { packs?: unknown }).packs)) {
      const list = (parsed as { packs: unknown[] }).packs;
      return Array.from(new Set(list.filter((v): v is string => typeof v === 'string' && v.length > 0)));
    }
  } catch {
    // Ignore storage read/parse errors in private browsing modes
  }
  return [];
}

function persistPacks(packs: ReadonlyArray<string>): void {
  const unique = Array.from(new Set(packs));
  packsReadyState = unique;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        OFFLINE_PACKS_STORAGE_KEY,
        JSON.stringify({
          packs: unique,
          updatedAt: Date.now(),
        }),
      );
      storageWriteFailed = false;
    }
  } catch {
    storageWriteFailed = true;
    // Ignore storage quota / private-mode write failures
  }
}

function getCurrentPacksReady(): string[] {
  if (!storageWriteFailed && typeof window !== 'undefined' && window.localStorage) {
    try {
      const persisted = loadPersistedPacks();
      packsReadyState = persisted;
      return [...persisted];
    } catch {
      // Fall back to in-memory state
    }
  }
  return [...packsReadyState];
}

function notifySubscribers(): void {
  const snapshot = getOfflineVaultStatus();
  for (const listener of subscribers) {
    try {
      listener(snapshot);
    } catch {
      // Isolate listener exceptions
    }
  }
}

function ensureGlobalListeners(): void {
  if (!isBrowser() || windowListenersAttached) return;
  windowListenersAttached = true;

  window.addEventListener('online', () => {
    notifySubscribers();
  });

  window.addEventListener('offline', () => {
    notifySubscribers();
  });

  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        swReadyState = Boolean(navigator.serviceWorker.controller);
        void refreshOfflineVaultStatus();
      });
    } catch {
      // Ignore in restricted webviews
    }
  }
}

function isDataAssetHref(absUrl: string): boolean {
  try {
    const parsed = new URL(absUrl);
    return DATA_PATH_RE.test(parsed.pathname);
  } catch {
    return false;
  }
}

function dedupeAssetList(paths: ReadonlyArray<string>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of paths) {
    if (!p) continue;
    try {
      const abs = resolveRelativeUrl(p);
      if (!seen.has(abs)) {
        seen.add(abs);
        out.push(abs);
      }
    } catch {
      // Skip invalid URL
    }
  }
  return out;
}

/**
 * Collects all currently loaded active Vite JS/CSS bundles, modulepreloads,
 * stylesheets, and loaded runtime resources from the DOM & Performance API.
 */
function collectActivePageUrls(): string[] {
  if (!isBrowser()) return [];
  const collected = new Set<string>();

  try {
    const baseHref = getBaseHref();
    collected.add(new URL('./', baseHref).href);
    collected.add(new URL('./index.html', baseHref).href);
    collected.add(new URL('./manifest.json', baseHref).href);

    const nodes = document.querySelectorAll(
      'script[src], link[rel="stylesheet"], link[rel="modulepreload"], link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]',
    );

    nodes.forEach((node) => {
      const raw = node.getAttribute('src') || node.getAttribute('href');
      if (!raw || raw.startsWith('data:') || raw.startsWith('blob:')) return;
      try {
        const abs = new URL(raw, baseHref).href;
        const parsed = new URL(abs);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          collected.add(abs);
        }
      } catch {
        // Ignore malformed URLs
      }
    });

    // Also capture dynamically imported ES chunks & Google Font binaries already fetched
    if (typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function') {
      const origin = window.location.origin;
      const entries = performance.getEntriesByType('resource');
      for (const entry of entries) {
        const name = entry.name;
        if (!name || name.startsWith('data:') || name.startsWith('blob:')) continue;
        try {
          const parsed = new URL(name);
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') continue;
          if (parsed.searchParams.get('nosw') === '1') continue;
          if (parsed.pathname.split('/').pop() === 'sw.js') continue;

          const isGoogleFont =
            parsed.hostname === 'fonts.googleapis.com' || parsed.hostname === 'fonts.gstatic.com';
          const isSameOriginAsset =
            parsed.origin === origin &&
            /\.(?:js|mjs|css|glb|hdr|mp3|png|svg|jpe?g|webp|ico|woff2?|json|gz)$/i.test(parsed.pathname);

          if (isGoogleFont || isSameOriginAsset) {
            collected.add(parsed.href);
          }
        } catch {
          // Ignore malformed performance entry URL
        }
      }
    }
  } catch {
    // Non-fatal
  }

  return Array.from(collected);
}

async function countCacheStorageEntries(): Promise<number> {
  if (typeof caches === 'undefined') return cachedEntryCountState;
  let total = 0;
  for (const cacheName of [OFFLINE_SHELL_CACHE, OFFLINE_DATA_CACHE]) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      total += keys.length;
    } catch {
      // Ignore individual cache read errors
    }
  }
  return total;
}

function sendSwMessage<T>(worker: ServiceWorker, message: Record<string, unknown>): Promise<T | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (val: T | null): void => {
      if (settled) return;
      settled = true;
      resolve(val);
    };

    const timer = setTimeout(() => finish(null), SW_MESSAGE_TIMEOUT_MS);

    try {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event: MessageEvent) => {
        clearTimeout(timer);
        finish((event.data as T) ?? null);
      };
      worker.postMessage(message, [channel.port2]);
    } catch {
      clearTimeout(timer);
      finish(null);
    }
  });
}

function waitForSwReadyWithTimeout(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, SW_READY_TIMEOUT_MS);

    navigator.serviceWorker.ready
      .then((reg) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(reg);
        }
      })
      .catch(() => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(null);
        }
      });
  });
}

async function extractVisualSvgUrls(onlyBaseball: boolean): Promise<string[]> {
  const urls: string[] = [];
  try {
    const packHref = resolveRelativeUrl('./data/visual_globe_packs.json');
    let response: Response | undefined;
    if (typeof caches !== 'undefined') {
      const dataCache = await caches.open(OFFLINE_DATA_CACHE);
      response = await dataCache.match(packHref);
    }
    if (!response) {
      response = await fetch(packHref);
    }
    if (!response || response.status !== 200) return urls;
    const json: unknown = await response.clone().json();
    const lists: unknown[][] = [];
    if (Array.isArray(json)) {
      lists.push(json);
    } else if (json && typeof json === 'object') {
      const obj = json as Record<string, unknown>;
      for (const key of ['questions', 'visualQuestions', 'items', 'records', 'packs']) {
        if (Array.isArray(obj[key])) {
          lists.push(obj[key] as unknown[]);
        }
      }
    }
    for (const list of lists) {
      for (const raw of list) {
        if (!raw || typeof raw !== 'object') continue;
        const item = raw as Record<string, unknown>;
        if (onlyBaseball) {
          const l2 = String(item.l2Id ?? item.l2Category ?? item.subcatId ?? '').toLowerCase();
          if (!l2.includes('baseball') && !l2.includes('sub_bb')) continue;
        }
        const plate = item.visualPlate as Record<string, unknown> | undefined;
        const img =
          (plate && typeof plate.imageUrl === 'string' && plate.imageUrl) ||
          (typeof item.imageUrl === 'string' && item.imageUrl) ||
          null;
        if (img && !img.startsWith('data:')) {
          urls.push(resolveRelativeUrl(img));
        }
      }
    }
  } catch {
    // Visual pack is optional — ignore missing or malformed data
  }
  return Array.from(new Set(urls));
}

function getPackRawPaths(pack: OfflinePackId): string[] {
  const activeDomUrls = collectActivePageUrls();
  switch (pack) {
    case 'ESSENTIAL':
      return [...activeDomUrls, ...ESSENTIAL_ASSETS];
    case 'BASEBALL_PRO':
      return [...activeDomUrls, ...BASEBALL_PRO_EXTRA_ASSETS];
    case 'FULL_WORLD_CIRCUIT':
      return [
        ...activeDomUrls,
        ...ESSENTIAL_ASSETS,
        ...BASEBALL_PRO_EXTRA_ASSETS,
        ...WORLD_CIRCUIT_EXTRA_ASSETS,
      ];
  }
}

/**
 * Returns static display metadata for the 3 downloadable Offline Vault packs.
 */
export function getOfflinePackCatalog(): ReadonlyArray<OfflinePackInfo> {
  return [
    {
      id: 'ESSENTIAL',
      title: 'Essential Airplane Pack',
      description: 'Core 3D Prism hardware, Geneva chamber, Foley SFX, 20K corpus & Jeopardy packs.',
      estimatedMb: 21,
      assetCount: ESSENTIAL_ASSETS.length,
    },
    {
      id: 'BASEBALL_PRO',
      title: 'Baseball Pro Pack',
      description: 'Full Baseball subcategory shard, Sports domain, visual blueprints & core 3D rig.',
      estimatedMb: 14,
      assetCount: BASEBALL_PRO_EXTRA_ASSETS.length,
    },
    {
      id: 'FULL_WORLD_CIRCUIT',
      title: 'Full World Circuit Vault',
      description: 'All 8 city 3D venues, 7 relics, HDRIs, 20-hr Campaign, Gold Packs & Baseball.',
      estimatedMb: 56,
      assetCount: dedupeAssetList([
        ...ESSENTIAL_ASSETS,
        ...BASEBALL_PRO_EXTRA_ASSETS,
        ...WORLD_CIRCUIT_EXTRA_ASSETS,
      ]).length,
    },
  ];
}

/**
 * Synchronously returns the current Offline Vault status snapshot.
 */
export function getOfflineVaultStatus(): OfflineVaultStatus {
  if (!swReadyState && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      if (navigator.serviceWorker.controller) {
        swReadyState = true;
      }
    } catch {
      // Ignore
    }
  }

  return {
    swReady: swReadyState,
    isOnline: getOnlineFlag(),
    cachedEntryCount: cachedEntryCountState,
    packsReady: getCurrentPacksReady(),
  };
}

/**
 * Refreshes cached entry count from CacheStorage and notifies listeners.
 */
export async function refreshOfflineVaultStatus(): Promise<OfflineVaultStatus> {
  cachedEntryCountState = await countCacheStorageEntries();
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration(resolveRelativeUrl('./'));
      if (reg && (reg.active || navigator.serviceWorker.controller)) {
        swReadyState = true;
      }
    } catch {
      // Ignore
    }
  }
  notifySubscribers();
  return getOfflineVaultStatus();
}

/**
 * Registers `./sw.js` subpath-safely (skipping if `?nosw=1`), waits for ready,
 * and pushes all active JS/CSS/modulepreload bundle URLs to the Service Worker.
 */
export function registerOfflineServiceWorker(): Promise<OfflineVaultStatus> {
  ensureGlobalListeners();

  if (!isBrowser() || isSwBypassEnabled() || !('serviceWorker' in navigator)) {
    return Promise.resolve(getOfflineVaultStatus());
  }

  if (activeRegistrationPromise) {
    return activeRegistrationPromise;
  }

  activeRegistrationPromise = (async () => {
    try {
      const swUrl = resolveRelativeUrl('./sw.js');
      const scopeUrl = resolveRelativeUrl('./');

      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: scopeUrl,
        updateViaCache: 'none',
      });

      const readyReg = (await waitForSwReadyWithTimeout()) ?? registration;
      const activeWorker = readyReg.active ?? navigator.serviceWorker.controller;

      if (activeWorker) {
        swReadyState = true;
        const pageUrls = collectActivePageUrls();
        if (pageUrls.length > 0) {
          const reply = await sendSwMessage<{ cachedEntryCount?: number }>(activeWorker, {
            type: 'CACHE_URLS',
            urls: pageUrls,
          });
          if (reply && typeof reply.cachedEntryCount === 'number') {
            cachedEntryCountState = reply.cachedEntryCount;
          }
        }
      }

      if (cachedEntryCountState === 0) {
        cachedEntryCountState = await countCacheStorageEntries();
      }
    } catch {
      // Never throw on SW registration failures (e.g. restricted private iframe)
      cachedEntryCountState = await countCacheStorageEntries();
    }

    notifySubscribers();
    return getOfflineVaultStatus();
  })();

  return activeRegistrationPromise;
}

/**
 * Downloads and caches a complete Offline Pack into CacheStorage with live
 * per-file progress reporting, persisting ready packs in `ws_offline_packs_v2`.
 */
export async function downloadOfflinePack(
  pack: OfflinePackId,
  onProgress?: (done: number, total: number) => void,
): Promise<OfflineVaultStatus> {
  ensureGlobalListeners();

  // Ensure SW is registered when allowed
  if (!swReadyState && !isSwBypassEnabled()) {
    await registerOfflineServiceWorker().catch(() => {});
  }

  const baseUrls = dedupeAssetList(getPackRawPaths(pack));
  const extraVisualSvgs = await extractVisualSvgUrls(pack === 'BASEBALL_PRO');
  const allUrls = dedupeAssetList([...baseUrls, ...extraVisualSvgs]);

  const total = allUrls.length;
  let done = 0;
  let succeeded = 0;

  const reportProgress = (): void => {
    if (onProgress) {
      try {
        onProgress(done, total);
      } catch {
        // Isolate callback errors
      }
    }
  };

  reportProgress();

  const canUseCacheApi = typeof caches !== 'undefined';
  const shellCache = canUseCacheApi ? await caches.open(OFFLINE_SHELL_CACHE) : null;
  const dataCache = canUseCacheApi ? await caches.open(OFFLINE_DATA_CACHE) : null;

  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (cursor < allUrls.length) {
      const url = allUrls[cursor++];
      const targetCache = isDataAssetHref(url) ? dataCache : shellCache;

      try {
        if (targetCache) {
          const existing = await targetCache.match(url);
          if (existing) {
            succeeded++;
          } else {
            const response = await fetch(url);
            if (response.status === 200 || response.type === 'opaque') {
              await targetCache.put(url, response.clone());
              succeeded++;
            }
          }
        } else {
          const response = await fetch(url);
          if (response.ok) {
            succeeded++;
          }
        }
      } catch {
        // Individual optional/missing assets never abort the entire pack download
      } finally {
        done++;
        reportProgress();
      }
    }
  };

  const workers: Promise<void>[] = [];
  const workerCount = Math.min(DOWNLOAD_CONCURRENCY, Math.max(1, total));
  for (let i = 0; i < workerCount; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  // Persist pack status if at least half of assets are cached/verified
  if (total === 0 || succeeded >= Math.ceil(total * 0.5)) {
    const nextPacks = new Set(packsReadyState);
    nextPacks.add(pack);
    if (pack === 'FULL_WORLD_CIRCUIT') {
      nextPacks.add('ESSENTIAL');
      nextPacks.add('BASEBALL_PRO');
    }
    persistPacks(Array.from(nextPacks));
  }

  cachedEntryCountState = await countCacheStorageEntries();
  notifySubscribers();
  return getOfflineVaultStatus();
}

/**
 * Subscribes to online/offline & offline-vault status transitions.
 * Immediately delivers the current snapshot and returns an unsubscribe handle.
 */
export function subscribeOfflineStatus(cb: OfflineStatusListener): () => void {
  ensureGlobalListeners();
  subscribers.add(cb);

  try {
    cb(getOfflineVaultStatus());
  } catch {
    // Isolate initial subscriber error
  }

  if (cachedEntryCountState === 0 && typeof caches !== 'undefined') {
    void refreshOfflineVaultStatus();
  }

  return () => {
    subscribers.delete(cb);
  };
}
