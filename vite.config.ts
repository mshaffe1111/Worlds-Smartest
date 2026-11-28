import { rmSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
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

const ALL_20_CATEGORIES = [
  'MEDICINE',
  'CHEMISTRY',
  'PHYSICS',
  'GADGETS',
  'ENGINES',
  'LITERATURE',
  'LEXICON',
  'FINE ARTS',
  'SCREEN',
  'JUKEBOX',
  'FINANCE',
  'PRICING',
  'ODDS',
  'ATLAS',
  'SPORTS',
  'DYNASTIES',
  'HEADLINES',
  'FOLKLORE',
  'FALLACIES',
  'CUISINE',
] as const;

function buildMissingVowelsForParity(
  answerStr: string,
  seedInt: number,
  answerIdx: number,
): {
  maskedDisplay: string;
  fullAnswer: string;
  vowelChoices: string[];
  correctChoiceIdx: number;
} | undefined {
  const upper = String(answerStr || '').toUpperCase().trim();
  if (!/^[A-Z ]{4,22}$/.test(upper)) return undefined;
  const vowels: string[] = [];
  let masked = '';
  for (const ch of upper) {
    if ('AEIOU'.includes(ch)) {
      vowels.push(ch);
    } else if (ch === ' ') {
      masked += '   ';
    } else {
      masked += (masked && !masked.endsWith(' ') ? ' ' : '') + ch;
    }
  }
  if (vowels.length < 2 || vowels.length > 7) return undefined;
  const consonantsCount = upper.replace(/[^B-DF-HJ-NP-TV-Z]/g, '').length;
  if (consonantsCount < 3) return undefined;

  const trueSeq = vowels.join('-');
  const pool = ['A', 'E', 'I', 'O', 'U'] as const;
  const distractors = new Set<string>();
  let attempt = 0;
  while (distractors.size < 3 && attempt < 40) {
    attempt++;
    const mutated = vowels.map((v, idx) => {
      if ((idx + attempt + seedInt) % 2 === 0) {
        return pool[(pool.indexOf(v as (typeof pool)[number]) + attempt + idx + 1) % 5];
      }
      return v;
    });
    const cand = mutated.join('-');
    if (cand !== trueSeq) distractors.add(cand);
  }
  if (distractors.size < 3) return undefined;
  const correctChoiceIdx = [0, 1, 2, 3].includes(answerIdx) ? answerIdx : Math.abs(seedInt) % 4;
  const distArr = Array.from(distractors);
  const vowelChoices: string[] = [];
  let di = 0;
  for (let i = 0; i < 4; i++) {
    vowelChoices.push(i === correctChoiceIdx ? trueSeq : distArr[di++]);
  }
  return {
    maskedDisplay: masked.trim(),
    fullAnswer: upper,
    vowelChoices,
    correctChoiceIdx,
  };
}

function compactClueRecord(c: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...c };
  delete out.domain;
  if (out.isBlitzLegal === false) delete out.isBlitzLegal;
  if (out.isKlaxonMyth === false) delete out.isKlaxonMyth;
  if (out.cardStyle === 'CLASSIC_CUE') delete out.cardStyle;

  if (
    out.vowels &&
    Array.isArray(out.choices) &&
    typeof out.answerIdx === 'number' &&
    typeof out.qid === 'number'
  ) {
    const reconstructed = buildMissingVowelsForParity(
      String(out.choices[out.answerIdx] ?? ''),
      out.qid,
      out.answerIdx,
    );
    if (reconstructed && JSON.stringify(reconstructed) === JSON.stringify(out.vowels)) {
      delete out.vowels;
    }
  }

  if (Array.isArray(out.supportedToys)) {
    const st = out.supportedToys as string[];
    const hasAllBase = DEFAULT_BASE_TOYS.every((b) => st.includes(b));
    if (hasAllBase) {
      const extra = st.filter((t) => !(DEFAULT_BASE_TOYS as readonly string[]).includes(t));
      delete out.supportedToys;
      if (extra.length > 0) out.extraToys = extra;
    }
  }
  return out;
}

function compactDistCorpusShards(distDir: string): void {
  const dataDir = resolve(distDir, 'data', 'v7');
  if (!existsSync(dataDir)) return;

  // Remove unused legacy corpus_manifest.json from dist/data/v7/
  const legacyManifest = resolve(dataDir, 'corpus_manifest.json');
  if (existsSync(legacyManifest)) {
    rmSync(legacyManifest, { force: true });
  }

  const shardFiles = readdirSync(dataDir).filter(
    (f) => f.endsWith('.json') && f !== 'packs_manifest.json' && f !== 'boot_pack.json',
  );

  const parsedShards = new Map<string, Record<string, unknown>>();
  const allShardClues: Record<string, unknown>[] = [];
  const seenQids = new Set<number>();

  for (const file of shardFiles) {
    const fullPath = resolve(dataDir, file);
    try {
      const parsed = JSON.parse(readFileSync(fullPath, 'utf8')) as Record<string, unknown>;
      if (!parsed || !Array.isArray(parsed.clues)) continue;
      parsedShards.set(file, parsed);
      for (const raw of parsed.clues as Record<string, unknown>[]) {
        const qid = typeof raw.qid === 'number' ? raw.qid : -1;
        if (qid >= 0 && !seenQids.has(qid)) {
          seenQids.add(qid);
          allShardClues.push(raw);
        }
      }
    } catch {
      // Skip malformed shard
    }
  }

  // Build stratified Tier 1/2 boot_pack across ALL 20 categories (8 clues/cat = 160 clues):
  // 2 Showcase + up to 5 New-Format (1 per new style) + Classic backfill
  const NEW_5_STYLES = [
    'HIGHER_OR_LOWER',
    'ODD_ONE_OUT',
    'FINISH_THE_LINE',
    'WHO_WHAT_AM_I',
    'BEFORE_OR_AFTER',
  ] as const;
  const bootClues: Record<string, unknown>[] = [];
  const bootQids = new Set<number>();
  const BOOT_PER_CAT = 8;

  for (const cat of ALL_20_CATEGORIES) {
    const catPool = allShardClues.filter((c) => c.category === cat);
    const tier1 = catPool.filter((c) => c.difficulty === 1);
    const tier2 = catPool.filter((c) => c.difficulty === 2);
    const rest = catPool.filter((c) => c.difficulty !== 1 && c.difficulty !== 2);
    const ordered = [...tier1, ...tier2, ...rest];

    const pickedForCat: Record<string, unknown>[] = [];
    const classicCandidates = ordered.filter(
      (c) => Array.isArray(c.supportedToys) && (c.supportedToys as string[]).includes('TOY_01_KNIFE_SWITCH'),
    );
    const showcaseCandidates = ordered.filter(
      (c) =>
        Array.isArray(c.supportedToys) &&
        (c.supportedToys as string[]).some((t) => t !== 'TOY_01_KNIFE_SWITCH' && t !== 'TOY_02_CONFIDENCE_PNEUMATIC' && t !== 'TOY_06_FUSE_WIRE_SNIPPER'),
    );

    // 1. Up to 2 Showcase clues per category
    for (const c of showcaseCandidates) {
      if (pickedForCat.length >= 2) break;
      const qid = c.qid as number;
      if (!bootQids.has(qid)) {
        bootQids.add(qid);
        pickedForCat.push(c);
      }
    }
    // 2. 1 Tier 1 clue from each of the 5 new formats per category
    for (const style of NEW_5_STYLES) {
      if (pickedForCat.length >= BOOT_PER_CAT - 1) break;
      const match = ordered.find(
        (c) => c.cardStyle === style && !bootQids.has(c.qid as number),
      );
      if (match) {
        bootQids.add(match.qid as number);
        pickedForCat.push(match);
      }
    }
    // 3. Remaining slot(s) from classic Tier 1/2
    for (const c of classicCandidates) {
      if (pickedForCat.length >= BOOT_PER_CAT) break;
      const qid = c.qid as number;
      if (!bootQids.has(qid)) {
        bootQids.add(qid);
        pickedForCat.push(c);
      }
    }
    for (const c of ordered) {
      if (pickedForCat.length >= BOOT_PER_CAT) break;
      const qid = c.qid as number;
      if (!bootQids.has(qid)) {
        bootQids.add(qid);
        pickedForCat.push(c);
      }
    }
    bootClues.push(...pickedForCat);
  }

  // Emit stratified boot_pack.json.gz and remove uncompressed boot_pack.json
  const bootJsonPath = resolve(dataDir, 'boot_pack.json');
  const existingBootDoc = existsSync(bootJsonPath)
    ? (JSON.parse(readFileSync(bootJsonPath, 'utf8')) as Record<string, unknown>)
    : {};
  const finalBootClues = (
    bootClues.length > 0
      ? bootClues
      : Array.isArray(existingBootDoc.clues)
        ? (existingBootDoc.clues as Record<string, unknown>[]).slice(0, 160)
        : []
  ).map(compactClueRecord);

  const bootDoc = {
    schema: 'WS_V7_BOOT_PACK_1',
    stratifiedCategories: ALL_20_CATEGORIES.length,
    totalCorpusCount: allShardClues.length || existingBootDoc.totalCorpusCount || finalBootClues.length,
    clues: finalBootClues,
  };
  writeFileSync(resolve(dataDir, 'boot_pack.json.gz'), gzipSync(Buffer.from(JSON.stringify(bootDoc), 'utf8'), { level: 9 }));
  if (existsSync(bootJsonPath)) {
    rmSync(bootJsonPath, { force: true });
  }

  // Deduplicate bootQids from secondary shards, compact, write .json.gz, and remove raw .json shards
  for (const [file, parsed] of parsedShards.entries()) {
    const rawClues = parsed.clues as Record<string, unknown>[];
    const deduped = rawClues
      .filter((c) => typeof c.qid !== 'number' || !bootQids.has(c.qid))
      .map(compactClueRecord);
    const outDoc = {
      ...parsed,
      clues: deduped,
    };
    const jsonBytes = Buffer.from(JSON.stringify(outDoc), 'utf8');
    writeFileSync(resolve(dataDir, `${file}.gz`), gzipSync(jsonBytes, { level: 9 }));
    rmSync(resolve(dataDir, file), { force: true });
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
