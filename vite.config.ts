import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('/node_modules/')) {
            if (normalized.includes('/node_modules/three/examples/')) {
              return 'three-addons';
            }
            if (normalized.includes('/node_modules/three/')) {
              return 'three';
            }
            return 'vendor';
          }
          if (normalized.includes('/src/v7/engine/') || normalized.includes('/src/v6/engine/')) {
            return 'v7-engine';
          }
          if (normalized.includes('/src/v7/boards/')) {
            return 'v7-boards';
          }
          if (normalized.includes('/src/v7/toys/') || normalized.includes('/src/v6/toys/')) {
            return 'v7-toys';
          }
          if (normalized.includes('/src/v7/audio/')) {
            return 'v7-audio';
          }
          if (normalized.includes('/src/v7/campaign/') || normalized.includes('/src/v7/ui/')) {
            return 'v7-campaign-ui';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
