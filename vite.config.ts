import { rmSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const UNUSED_LEGACY_ASSET_DIRS = [
  'hdris',
  'medals',
  'models',
  'portraits',
  'portraits_cutout',
  'v5',
  'venues',
  'visas',
  'visuals',
] as const;

const DEFAULT_BASE_TOYS = [
  'TOY_01_KNIFE_SWITCH',
  'TOY_02_CONFIDENCE_PNEUMATIC',
  'TOY_06_FUSE_WIRE_SNIPPER',
] as const;

function compactDistCorpusShards(distDir: string): void {
  const dataDir = resolve(distDir, 'data', 'v7');
  if (!existsSync(dataDir)) return;
  for (const file of readdirSync(dataDir)) {
    if (!file.endsWith('.json') || file.includes('manifest')) continue;
    const fullPath = resolve(dataDir, file);
    try {
      const parsed = JSON.parse(readFileSync(fullPath, 'utf8'));
      if (!parsed || !Array.isArray(parsed.clues)) continue;
      const sourceClues =
        file === 'boot_pack.json' ? parsed.clues.slice(0, 120) : parsed.clues;
      parsed.clues = sourceClues.map((c: Record<string, unknown>) => {
        const out: Record<string, unknown> = { ...c };
        delete out.domain;
        if (out.isBlitzLegal === false) delete out.isBlitzLegal;
        if (out.isKlaxonMyth === false) delete out.isKlaxonMyth;
        if (out.cardStyle === 'CLASSIC_CUE') delete out.cardStyle;
        if (Array.isArray(out.supportedToys)) {
          const st = out.supportedToys as string[];
          const hasAllBase = DEFAULT_BASE_TOYS.every((b) => st.includes(b));
          if (hasAllBase) {
            const extra = st.filter(
              (t) => !(DEFAULT_BASE_TOYS as readonly string[]).includes(t),
            );
            delete out.supportedToys;
            if (extra.length > 0) out.extraToys = extra;
          }
        }
        return out;
      });
      writeFileSync(fullPath, JSON.stringify(parsed), 'utf8');
    } catch {
      // Keep original file if unexpected JSON structure
    }
  }
}

function pruneUnusedLegacyPublicAssets(): Plugin {
  return {
    name: 'prune-unused-legacy-public-assets',
    apply: 'build',
    closeBundle() {
      const distDir = resolve(process.cwd(), 'dist');
      const distAssetsDir = resolve(distDir, 'assets');
      if (existsSync(distAssetsDir)) {
        for (const legacyDir of UNUSED_LEGACY_ASSET_DIRS) {
          const target = resolve(distAssetsDir, legacyDir);
          if (existsSync(target)) {
            rmSync(target, { recursive: true, force: true });
          }
        }
      }
      compactDistCorpusShards(distDir);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [pruneUnusedLegacyPublicAssets()],
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
