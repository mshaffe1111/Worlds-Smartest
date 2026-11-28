/* ============================================================================
 * WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.1.0 "Sweeps Week Deluxe")
 * Subpath-Safe Offline Service Worker (`public/sw.js`)
 * Automatically purges legacy pre-v8.1 caches and guarantees network-first
 * `cache: 'no-store'` freshness on `localhost` / `127.0.0.1`!
 * ============================================================================ */

const SHELL_CACHE = 'ws-fifty-million-shell-v9.0.0-living-color';
const DATA_CACHE = 'ws-fifty-million-data-v9.0.0-living-color';
const VALID_CACHES = new Set([SHELL_CACHE, DATA_CACHE]);
const IS_LOCALHOST =
  self.location.hostname === '127.0.0.1' || self.location.hostname === 'localhost';

const CORE_SHELL_ASSETS = [
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
  './assets/textures/v6/earth_relief_albedo_4k.webp',
  './assets/textures/v6/earth_elevation_bump_2k.webp',
  './assets/textures/v6/earth_ocean_specular_2k.webp',
  './assets/v7/portraits/carmen_delgado.jpg',
  './assets/v7/portraits/toby_okafor.jpg',
  './assets/v7/portraits/inez_callahan.jpg',
  './assets/v7/portraits/alastair_kerr.jpg',
  './assets/v7/portraits/seo_yun_kang.jpg',
  './assets/v7/portraits/rex_calloway.jpg',
  './assets/v7/portraits/grant_bellamy.jpg',
  './assets/v7/portraits/roz_korman.jpg',
  './assets/v7/portraits/vera_karp.jpg',
  './assets/v9/atlas_manifest_v9.json',
  './assets/v9/atlas_vip.webp',
  './assets/v9/atlas_prizes.webp',
  './assets/v9/atlas_zonks.webp',
  './assets/v9/atlas_crowd.webp',
  './assets/v9/den_backdrop_lounge.jpg',
  './assets/v9/curtain_backdrop_stage.jpg',
  './data/v7/boot_pack.json.gz',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  if (IS_LOCALHOST) return;
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.allSettled(
        CORE_SHELL_ASSETS.map((rel) =>
          cache.add(new URL(rel, self.registration.scope).href),
        ),
      );
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => IS_LOCALHOST || !VALID_CACHES.has(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (IS_LOCALHOST) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(async () => {
        const cached = await caches.match(req);
        return cached || new Response('Offline', { status: 503 });
      }),
    );
    return;
  }

  const isData = url.pathname.includes('/data/v7/');
  const targetCache = isData ? DATA_CACHE : SHELL_CACHE;

  event.respondWith(
    (async () => {
      try {
        const netResp = await fetch(req);
        if (netResp && netResp.ok) {
          const cache = await caches.open(targetCache);
          cache.put(req, netResp.clone()).catch(() => {});
        }
        return netResp;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === 'navigate') {
          const fallback = await caches.match(
            new URL('./index.html', self.registration.scope).href,
          );
          if (fallback) return fallback;
        }
        return new Response('Offline', { status: 503 });
      }
    })(),
  );
});
