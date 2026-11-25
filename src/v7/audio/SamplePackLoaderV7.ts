// ============================================================================
// WORLD'S SMARTEST: 1966 Living Color Studio Sample Pack Loader
// `src/v7/audio/SamplePackLoaderV7.ts`
//
// Loads & decodes all 79 real recorded acoustic studio multi-samples
// (MusyngKite real trumpets, brass, trombones, sax, upright bass, Steinway
// grand piano, vibraphone, marimba, strings, jazz guitar, glockenspiel,
// tubular bells, woodblock, timpani + CC0 Boston Jazz Drums + Wikimedia
// Commons live studio crowd & physical mechanical foley) into sample-accurate,
// loudness-calibrated WebAudio `AudioBuffer` zones.
// ============================================================================

export type AcousticInstrumentIdV7 =
  | 'trumpet'
  | 'brass'
  | 'trombone'
  | 'muted_trumpet'
  | 'tenor_sax'
  | 'upright_bass'
  | 'grand_piano'
  | 'vibraphone'
  | 'marimba'
  | 'jazz_guitar'
  | 'strings'
  | 'glockenspiel'
  | 'tubular_bell'
  | 'woodblock'
  | 'timpani';

export interface SampleZoneEntryV7 {
  readonly note: string;
  readonly midi: number;
  readonly file: string;
  readonly bytes: number;
}

export interface SingleSampleEntryV7 {
  readonly file: string;
  readonly bytes: number;
  readonly source?: string;
}

export interface StudioAudioManifestV7 {
  readonly version: string;
  readonly instruments: Partial<Record<AcousticInstrumentIdV7, readonly SampleZoneEntryV7[]>>;
  readonly drums: Record<string, SingleSampleEntryV7>;
  readonly foley: Record<string, SingleSampleEntryV7>;
  readonly crowd: Record<string, SingleSampleEntryV7>;
  readonly totalFiles?: number;
  readonly totalBytes?: number;
}

export interface DecodedInstrumentZoneV7 {
  readonly note: string;
  readonly midi: number;
  readonly buffer: AudioBuffer;
}

export interface SampleZonePickV7 {
  readonly buffer: AudioBuffer;
  readonly playbackRate: number;
  readonly rootMidi: number;
  readonly instrumentId: AcousticInstrumentIdV7;
}

export interface SamplePackStatsV7 {
  readonly loadedFiles: number;
  readonly totalFiles: number;
  readonly decodedBytes: number;
  readonly coreReady: boolean;
  readonly fullyReady: boolean;
  readonly failedFiles: number;
}

type SampleCategory = 'instrument_perc' | 'instrument_sustained' | 'drum' | 'foley' | 'crowd';

const CORE_INSTRUMENTS: ReadonlySet<AcousticInstrumentIdV7> = new Set([
  'trumpet',
  'brass',
  'upright_bass',
  'grand_piano',
  'vibraphone',
  'marimba',
  'jazz_guitar',
  'glockenspiel',
  'woodblock',
]);

const SUSTAINED_INSTRUMENTS: ReadonlySet<AcousticInstrumentIdV7> = new Set([
  'trumpet',
  'brass',
  'trombone',
  'muted_trumpet',
  'tenor_sax',
  'strings',
]);

const INSTRUMENT_FALLBACK_CHAIN: Record<AcousticInstrumentIdV7, readonly AcousticInstrumentIdV7[]> = {
  trumpet: ['brass', 'muted_trumpet', 'vibraphone', 'grand_piano'],
  brass: ['trumpet', 'trombone', 'grand_piano'],
  trombone: ['brass', 'upright_bass', 'grand_piano'],
  muted_trumpet: ['trumpet', 'brass', 'vibraphone'],
  tenor_sax: ['brass', 'trumpet', 'trombone', 'grand_piano'],
  upright_bass: ['grand_piano', 'trombone'],
  grand_piano: ['vibraphone', 'jazz_guitar', 'marimba'],
  vibraphone: ['grand_piano', 'marimba', 'glockenspiel'],
  marimba: ['vibraphone', 'grand_piano', 'woodblock'],
  jazz_guitar: ['grand_piano', 'vibraphone'],
  strings: ['brass', 'vibraphone', 'grand_piano'],
  glockenspiel: ['vibraphone', 'tubular_bell', 'marimba'],
  tubular_bell: ['glockenspiel', 'vibraphone', 'grand_piano'],
  woodblock: ['marimba', 'glockenspiel'],
  timpani: ['upright_bass', 'trombone'],
};

function resolveAudioAssetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, '');
  try {
    const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } })?.env;
    if (metaEnv?.BASE_URL) {
      const base = metaEnv.BASE_URL.endsWith('/') ? metaEnv.BASE_URL : `${metaEnv.BASE_URL}/`;
      if (base !== './') {
        return `${base}assets/v7/audio/${clean}`;
      }
    }
  } catch {
    // Fallback below
  }
  if (typeof document !== 'undefined' && document.baseURI) {
    try {
      return new URL(`./assets/v7/audio/${clean}`, document.baseURI).toString();
    } catch {
      // Fallback below
    }
  }
  return `./assets/v7/audio/${clean}`;
}

/**
 * Strips LAME MP3 leading encoder silence (~25ms) so every studio strike and
 * horn attack locks tightly (< 1ms) onto the swing grid, AND normalizes each
 * sample's peak loudness so soft MusyngKite piano/vibes/snare sit cleanly
 * alongside loud studio kicks and cash bells.
 */
function trimAndNormalizeBuffer(
  ctx: AudioContext,
  decoded: AudioBuffer,
  category: SampleCategory,
  sampleId: string,
): AudioBuffer {
  const numCh = decoded.numberOfChannels;
  const srcLen = decoded.length;
  const sr = decoded.sampleRate;
  if (srcLen <= 32 || numCh <= 0) return decoded;

  // 1. Measure absolute peak across all channels
  let peak = 0;
  for (let c = 0; c < numCh; c++) {
    const data = decoded.getChannelData(c);
    for (let i = 0; i < srcLen; i++) {
      const a = data[i] < 0 ? -data[i] : data[i];
      if (a > peak) peak = a;
    }
  }
  if (peak < 1e-6) return decoded;

  // 2. Find sample-accurate onset (preserve gentle bow/crowd swell on sustained/crowd assets)
  const onsetRatio =
    category === 'crowd'
      ? 0.006
      : category === 'instrument_sustained'
        ? 0.005
        : 0.018;
  const threshold = Math.max(peak * onsetRatio, 0.0012);
  let onsetIdx = 0;
  outer: for (let i = 0; i < srcLen; i++) {
    for (let c = 0; c < numCh; c++) {
      const v = decoded.getChannelData(c)[i];
      if (v >= threshold || v <= -threshold) {
        onsetIdx = i;
        break outer;
      }
    }
  }

  // Keep 1ms pre-roll before transient so attack never clips
  const preRoll = Math.round(sr * 0.001);
  const startIdx = Math.max(0, onsetIdx - preRoll);
  const outLen = Math.max(64, srcLen - startIdx);

  // 3. Target calibrated peak by sample role (caps noise-floor amplification)
  let targetPeak = 0.86;
  let maxBoost = 24;
  if (category === 'instrument_sustained') {
    targetPeak = 0.82;
    maxBoost = 16;
  } else if (category === 'instrument_perc') {
    targetPeak = 0.90;
    maxBoost = 28;
  } else if (category === 'drum') {
    targetPeak = 0.90;
    maxBoost = 26;
  } else if (category === 'foley') {
    targetPeak = 0.88;
    maxBoost = sampleId === 'sleigh_sparkle' ? 64 : 26;
  } else if (category === 'crowd') {
    targetPeak = 0.80;
    maxBoost = 14;
  }

  const gain = Math.min(maxBoost, targetPeak / peak);
  const out = ctx.createBuffer(numCh, outLen, sr);
  const fadeInSamples = Math.min(Math.round(sr * 0.0012), outLen);
  const fadeOutSamples = Math.min(Math.round(sr * 0.004), outLen);

  for (let c = 0; c < numCh; c++) {
    const src = decoded.getChannelData(c);
    const dst = out.getChannelData(c);
    for (let i = 0; i < outLen; i++) {
      let s = src[startIdx + i] * gain;
      if (i < fadeInSamples) {
        s *= i / fadeInSamples;
      } else if (i >= outLen - fadeOutSamples) {
        s *= (outLen - 1 - i) / fadeOutSamples;
      }
      // Gentle safety clip at +-0.96
      if (s > 0.96) s = 0.96;
      else if (s < -0.96) s = -0.96;
      dst[i] = s;
    }
  }

  return out;
}

export class SamplePackLoaderV7 {
  private manifest: StudioAudioManifestV7 | null = null;
  private manifestPromise: Promise<StudioAudioManifestV7 | null> | null = null;
  private loadPromise: Promise<void> | null = null;
  private corePromise: Promise<void> | null = null;

  private readonly instrumentZones = new Map<AcousticInstrumentIdV7, DecodedInstrumentZoneV7[]>();
  private readonly drumBuffers = new Map<string, AudioBuffer>();
  private readonly foleyBuffers = new Map<string, AudioBuffer>();
  private readonly crowdBuffers = new Map<string, AudioBuffer>();

  private loadedFiles = 0;
  private totalFiles = 0;
  private failedFiles = 0;
  private decodedBytes = 0;
  private coreReady = false;
  private fullyReady = false;

  public async loadCoreAndBackgroundAll(ctx: AudioContext): Promise<void> {
    if (this.coreReady) return;
    if (this.corePromise) return this.corePromise;

    this.corePromise = (async () => {
      const manifest = await this.fetchManifest();
      if (!manifest) return;

      const coreJobs: Array<() => Promise<void>> = [];
      const bgJobs: Array<() => Promise<void>> = [];

      // 1. Acoustic Instruments
      const instKeys = Object.keys(manifest.instruments) as AcousticInstrumentIdV7[];
      for (const instId of instKeys) {
        const zones = manifest.instruments[instId] ?? [];
        const isCore = CORE_INSTRUMENTS.has(instId);
        const cat: SampleCategory = SUSTAINED_INSTRUMENTS.has(instId)
          ? 'instrument_sustained'
          : 'instrument_perc';

        for (const z of zones) {
          const job = async () => {
            const buf = await this.fetchAndDecode(ctx, z.file, cat, instId);
            if (!buf) return;
            let arr = this.instrumentZones.get(instId);
            if (!arr) {
              arr = [];
              this.instrumentZones.set(instId, arr);
            }
            arr.push({ note: z.note, midi: z.midi, buffer: buf });
            arr.sort((a, b) => a.midi - b.midi);
          };
          if (isCore) coreJobs.push(job);
          else bgJobs.push(job);
        }
      }

      // 2. Real Boston Jazz Drums (all core!)
      for (const [drumId, entry] of Object.entries(manifest.drums ?? {})) {
        coreJobs.push(async () => {
          const buf = await this.fetchAndDecode(ctx, entry.file, 'drum', drumId);
          if (buf) this.drumBuffers.set(drumId, buf);
        });
      }

      // 3. Physical Studio Foley (all core!)
      for (const [foleyId, entry] of Object.entries(manifest.foley ?? {})) {
        coreJobs.push(async () => {
          const buf = await this.fetchAndDecode(ctx, entry.file, 'foley', foleyId);
          if (buf) this.foleyBuffers.set(foleyId, buf);
        });
      }

      // 4. Live Studio Crowd (all core!)
      for (const [crowdId, entry] of Object.entries(manifest.crowd ?? {})) {
        coreJobs.push(async () => {
          const buf = await this.fetchAndDecode(ctx, entry.file, 'crowd', crowdId);
          if (buf) this.crowdBuffers.set(crowdId, buf);
        });
      }

      this.totalFiles = coreJobs.length + bgJobs.length;

      // Load Tier-1 core studio samples with bounded concurrency (10 parallel fetches)
      await this.runWithConcurrency(coreJobs, 10);
      this.coreReady = true;

      // Immediately decode Tier-2 orchestral color instruments (strings, sax, trombone, muted trumpet, tubular bells, timpani)
      this.loadPromise = this.runWithConcurrency(bgJobs, 8).then(() => {
        this.fullyReady = true;
      });
    })();

    return this.corePromise;
  }

  public async waitForAll(ctx: AudioContext): Promise<void> {
    await this.loadCoreAndBackgroundAll(ctx);
    if (this.loadPromise) {
      await this.loadPromise;
    }
  }

  private async fetchManifest(): Promise<StudioAudioManifestV7 | null> {
    if (this.manifest) return this.manifest;
    if (this.manifestPromise) return this.manifestPromise;

    this.manifestPromise = (async () => {
      if (typeof fetch !== 'function') return null;
      try {
        const res = await fetch(resolveAudioAssetUrl('manifest.json'));
        if (!res.ok) return null;
        const json = (await res.json()) as StudioAudioManifestV7;
        this.manifest = json;
        return json;
      } catch {
        return null;
      }
    })();

    return this.manifestPromise;
  }

  private async fetchAndDecode(
    ctx: AudioContext,
    fileName: string,
    category: SampleCategory,
    sampleId: string,
  ): Promise<AudioBuffer | null> {
    if (typeof fetch !== 'function') return null;
    try {
      const res = await fetch(resolveAudioAssetUrl(fileName));
      if (!res.ok) {
        this.failedFiles++;
        return null;
      }
      const arrBuf = await res.arrayBuffer();
      const rawDecoded = await ctx.decodeAudioData(arrBuf);
      const normalized = trimAndNormalizeBuffer(ctx, rawDecoded, category, sampleId);
      this.loadedFiles++;
      this.decodedBytes += normalized.length * normalized.numberOfChannels * 4;
      return normalized;
    } catch {
      this.failedFiles++;
      return null;
    }
  }

  private async runWithConcurrency(jobs: Array<() => Promise<void>>, limit: number): Promise<void> {
    let cursor = 0;
    const workers: Promise<void>[] = [];
    const n = Math.min(limit, jobs.length);
    for (let i = 0; i < n; i++) {
      workers.push(
        (async () => {
          while (cursor < jobs.length) {
            const idx = cursor++;
            await jobs[idx]();
          }
        })(),
      );
    }
    await Promise.all(workers);
  }

  public pickZone(
    instrumentId: AcousticInstrumentIdV7,
    targetMidi: number,
  ): SampleZonePickV7 | null {
    const zones = this.instrumentZones.get(instrumentId);
    if (!zones || zones.length === 0) return null;

    let best = zones[0];
    let bestDist = Math.abs(targetMidi - best.midi);
    for (let i = 1; i < zones.length; i++) {
      const d = Math.abs(targetMidi - zones[i].midi);
      if (d < bestDist) {
        bestDist = d;
        best = zones[i];
      }
    }

    const playbackRate = Math.pow(2, (targetMidi - best.midi) / 12);
    return {
      buffer: best.buffer,
      playbackRate,
      rootMidi: best.midi,
      instrumentId,
    };
  }

  /**
   * Picks the closest real decoded studio zone for `instrumentId`, falling back
   * gracefully to an acoustically compatible real studio instrument while
   * Tier-2 orchestral assets finish streaming on slow networks.
   */
  public pickZoneWithFallback(
    instrumentId: AcousticInstrumentIdV7,
    targetMidi: number,
  ): SampleZonePickV7 | null {
    const direct = this.pickZone(instrumentId, targetMidi);
    if (direct) return direct;

    const fallbacks = INSTRUMENT_FALLBACK_CHAIN[instrumentId] ?? [];
    for (const alt of fallbacks) {
      const hit = this.pickZone(alt, targetMidi);
      if (hit) return hit;
    }
    return null;
  }

  public hasInstrument(instrumentId: AcousticInstrumentIdV7): boolean {
    const z = this.instrumentZones.get(instrumentId);
    return Boolean(z && z.length > 0);
  }

  public getDrum(drumId: string): AudioBuffer | null {
    return this.drumBuffers.get(drumId) ?? null;
  }

  public getFoley(foleyId: string): AudioBuffer | null {
    return this.foleyBuffers.get(foleyId) ?? null;
  }

  public getCrowd(crowdId: string): AudioBuffer | null {
    return this.crowdBuffers.get(crowdId) ?? null;
  }

  public isLoaded(): boolean {
    return this.coreReady && this.loadedFiles > 0;
  }

  public getStats(): SamplePackStatsV7 {
    return {
      loadedFiles: this.loadedFiles,
      totalFiles: this.totalFiles,
      decodedBytes: this.decodedBytes,
      coreReady: this.coreReady,
      fullyReady: this.fullyReady,
      failedFiles: this.failedFiles,
    };
  }
}
