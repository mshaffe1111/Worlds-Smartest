import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('/node_modules/')) {
            if (
              normalized.includes('/node_modules/troika-') ||
              normalized.includes('/node_modules/bidi-js/') ||
              normalized.includes('/node_modules/webgl-sdf-generator/') ||
              normalized.includes('/node_modules/three/examples/')
            ) {
              return 'three-addons';
            }
            if (normalized.includes('/node_modules/three/')) {
              return 'three';
            }
            return 'vendor';
          }
          if (normalized.includes('/src/cinema/')) return 'cinema';
          if (normalized.includes('/src/meta/')) return 'meta';
          if (normalized.includes('/src/narrative/')) return 'narrative';
          if (normalized.includes('/src/forge/')) return 'forge';
          if (normalized.includes('/src/stage3d/')) return 'stage3d';
          if (normalized.includes('/src/modes/')) return 'modes';
          if (
            normalized.includes('/src/ui/BriefingCategoriesModal') ||
            normalized.includes('/src/ui/BriefingTaxonomyAdapter') ||
            normalized.includes('/src/ui/CampaignSaveSlotsModal') ||
            normalized.includes('/src/ui/EvidenceDossierModal') ||
            normalized.includes('/src/ui/PassportObservatoryModal') ||
            normalized.includes('/src/ui/CutscenePlayer')
          ) {
            return 'ui-modals';
          }
          if (
            normalized.includes('/src/characters/') ||
            normalized.includes('/src/ergonomics/') ||
            normalized.includes('/src/audio/')
          ) {
            return 'systems';
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
