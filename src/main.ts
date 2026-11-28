/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// Master Entry Point (`src/main.ts`)
// 10 Grounded 3-Layer Soundstages · 12 Interactive +22° Contraption Boards ·
// 14 1-Gesture Tactile Contraptions · 4K Relief Globe · 20 Cyanotype Plates ·
// 12-Gate Anti-Slop Corpus · Genre-Honest Showband Score · 90-Ep Campaign ·
// 36 Lit 24K Gold / Blued Steel / Grand-Feu / Platinum Sovereign Trophies
// ============================================================================

import './styles/broadcast_v7.css';
import './styles/showroom_modes_v9.css';
import { bootShowtimeV7 } from './v7/ShowtimeAppV7';

interface OfflineSwClientModule {
  registerOfflineServiceWorker?: () => Promise<unknown>;
}

const offlineSwClientLoaders = import.meta.glob<OfflineSwClientModule>(
  './pwa/OfflineServiceWorkerClient.ts',
);

const SW_UPGRADE_RELOAD_KEY = 'ws_sw_upgraded_v7_r11';

function scheduleOfflineServiceWorkerRegistration(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('nosw') === '1') {
      return;
    }
  } catch {
    // Ignore malformed search strings
  }

  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    try {
      if (sessionStorage.getItem(SW_UPGRADE_RELOAD_KEY) === '1') return;
      sessionStorage.setItem(SW_UPGRADE_RELOAD_KEY, '1');
    } catch {
      // Ignore private browsing sessionStorage restrictions
    }
    window.location.reload();
  });

  const registerNonBlocking = (): void => {
    void navigator.serviceWorker
      .register('./sw.js', { scope: './', updateViaCache: 'none' })
      .then((reg) => {
        void reg.update().catch(() => {});
      })
      .catch(() => {});

    const loader = offlineSwClientLoaders['./pwa/OfflineServiceWorkerClient.ts'];
    if (typeof loader === 'function') {
      void loader()
        .then((mod) => mod.registerOfflineServiceWorker?.())
        .catch(() => {});
    }
  };

  if (document.readyState === 'complete') {
    window.setTimeout(registerNonBlocking, 0);
  } else {
    window.addEventListener(
      'load',
      () => {
        window.setTimeout(registerNonBlocking, 0);
      },
      { once: true },
    );
  }
}

function bootstrap(): void {
  const canvasRoot = document.getElementById('canvas-root');
  const vfxCanvas = document.getElementById('vfx-canvas') as HTMLCanvasElement | null;
  const uiRoot = document.getElementById('ui-root');

  if (!canvasRoot || !uiRoot) {
    throw new Error('Missing #canvas-root or #ui-root mount elements in index.html.');
  }

  // Hide unused 2D vfx-canvas overlay so WebGL2 hardware stage & raycasting are 100% crisp
  if (vfxCanvas) {
    vfxCanvas.style.display = 'none';
    vfxCanvas.style.pointerEvents = 'none';
  }

  const app = bootShowtimeV7(canvasRoot, uiRoot);

  window.addEventListener('beforeunload', () => {
    app.dispose();
  });

  scheduleOfflineServiceWorkerRegistration();
}

bootstrap();
