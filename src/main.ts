// ============================================================================
// WORLD'S SMARTEST — Master Entry Point (`src/main.ts`)
// Sovereign Modernism Three.js r172 PBR + Million-Scale Forge + 20hr Thriller
// ============================================================================

import './styles/sovereign.css';
import { SovereignMasterController } from './ui/SovereignMasterController';

function bootstrap(): void {
  const canvasRoot = document.getElementById('canvas-root');
  const vfxCanvas = document.getElementById('vfx-canvas') as HTMLCanvasElement | null;
  const uiRoot = document.getElementById('ui-root');

  if (!canvasRoot || !vfxCanvas || !uiRoot) {
    throw new Error('Missing #canvas-root, #vfx-canvas, or #ui-root mount elements in index.html.');
  }

  const master = new SovereignMasterController(canvasRoot, vfxCanvas, uiRoot);

  window.addEventListener('beforeunload', () => {
    master.dispose();
  });
}

bootstrap();
