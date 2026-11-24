/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST v6.0 — Master Ultra-HD 3D Showtime Entry Point (`src/main.ts`)
// 10 Architectural 3D Stage Worlds · 100 3D Twist Boards · 100 Zero-Scroll Toys ·
// 4K Natural Earth Relief Globe · 36 3D Trophies & Medals · 4-Bay Neve Desk ·
// 14 Original Abbey-Road Symphonies · 1.28M Calibrated Zero-Repeat Clues
// ============================================================================

import './styles/sovereign.css';
import './styles/ultrahd_v6.css';
import { bootShowtimeV6 } from './v6/bootShowtimeV6';

interface OfflineSwClientModule {
  registerOfflineServiceWorker?: () => Promise<unknown>;
}

const offlineSwClientLoaders = import.meta.glob<OfflineSwClientModule>(
  './pwa/OfflineServiceWorkerClient.ts',
);

const SW_UPGRADE_RELOAD_KEY = 'ws_sw_upgraded_v6_r1';

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

  const app = bootShowtimeV6(canvasRoot, vfxCanvas, uiRoot);

  window.addEventListener('beforeunload', () => {
    app.dispose();
  });

  scheduleOfflineServiceWorkerRegistration();
}

bootstrap();
