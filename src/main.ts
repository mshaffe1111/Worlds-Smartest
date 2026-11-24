/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST v5.0 — Master Theatrical Showtime Entry Point (`src/main.ts`)
// Diegetic Green Room · 14-Twist Octagonal Boards · 88-Node Voiced Story ·
// Real MusyngKite Symphony Orchestra + 8 Stage Symphonies · 1.27M+ Questions
// ============================================================================

import './styles/sovereign.css';
import './styles/showtime_v5.css';
import { ShowtimeMasterControllerV5 } from './v5/ShowtimeMasterControllerV5';

interface OfflineSwClientModule {
  registerOfflineServiceWorker?: () => Promise<unknown>;
}

const offlineSwClientLoaders = import.meta.glob<OfflineSwClientModule>(
  './pwa/OfflineServiceWorkerClient.ts',
);

function scheduleOfflineServiceWorkerRegistration(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('nosw') === '1') {
      return;
    }
  } catch {
    // Ignore malformed search strings
  }

  const registerNonBlocking = (): void => {
    const loader = offlineSwClientLoaders['./pwa/OfflineServiceWorkerClient.ts'];
    if (typeof loader === 'function') {
      void loader()
        .then((mod) => mod.registerOfflineServiceWorker?.())
        .catch(() => {
          // Graceful fallback if OfflineServiceWorkerClient is unavailable or SW unsupported
        });
      return;
    }
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {
        // Ignore when sw.js is not yet staged or blocked by browser context
      });
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

  if (!canvasRoot || !vfxCanvas || !uiRoot) {
    throw new Error('Missing #canvas-root, #vfx-canvas, or #ui-root mount elements in index.html.');
  }

  const master = new ShowtimeMasterControllerV5(canvasRoot, vfxCanvas, uiRoot);

  window.addEventListener('beforeunload', () => {
    master.dispose();
  });

  scheduleOfflineServiceWorkerRegistration();
}

bootstrap();
