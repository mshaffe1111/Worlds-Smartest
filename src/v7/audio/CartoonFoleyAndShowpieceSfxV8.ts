// ============================================================================
// WORLD'S SMARTEST: SWEEPS WEEK DELUXE (v8.0)
// 1966 Cartoon Slapstick Foley, Popular-Myth Klaxon & Showpiece Studio SFX
// `src/v7/audio/CartoonFoleyAndShowpieceSfxV8.ts`
//
// Craft Lineage:
//   Hoyt Curtin & Treg Brown (Hanna-Barbera / Warner Bros. soundstage foley),
//   Bill Carruthers (*Press Your Luck* brass foghorn & cartoon slapstick),
//   *Sale of the Century* Instant Bargain desk bells & NCR cash register,
//   *QI* Popular-Myth Studio Klaxon, and Center-Stage Silver-Dollar Rebound Pot.
//
// Acoustic & Mastering Guarantees:
//   - Real multi-sampled studio instruments (`trombone`, `muted_trumpet`,
//     `brass`, `trumpet`, `baritone_sax`, `upright_bass`, `electric_bass`,
//     `clean_guitar`, `jazz_guitar`, `electric_piano`, `vibraphone`, `marimba`,
//     `strings`, `glockenspiel`, `tubular_bell`, `woodblock`, `timpani`),
//     CC0 Boston Jazz Drums, Wikimedia/VCSL mechanical foley, and live studio
//     crowd reactions layered with physical spring/horn/pneumatic resonators.
//   - Zero 8-bit bleeps or 1980s Casio pure-sine melodies.
//   - Dedicated 28Hz DC-blocking HPF + soft-knee brickwall ceiling strictly
//     bounded <= 0.80 linear (< 0.85 DoD limit), zero-click linear/exponential
//     envelopes down to true 0.0 before `stop()`, and automatic `onended`
//     subgraph disconnection.
// ============================================================================

import {
  ALL_GREMLIN_SKIT_IDS_V8,
  type GremlinSkitIdV8,
} from '../contracts_v7';
import {
  SamplePackLoaderV7,
  type AcousticInstrumentIdV7,
} from './SamplePackLoaderV7';

/** Hard ceiling strictly below the 0.85 linear DoD limit (-1.94 dBFS). */
const FOLEY_MAX_PEAK_LINEAR = 0.80;
const CROWD_MAX_PEAK_LINEAR = 0.74;
const MAX_ACTIVE_FOLEY_VOICES = 76;
const MIDI_C6 = 84;

type CrowdSampleId =
  | 'applause_warm'
  | 'applause_big'
  | 'cheer_hurray'
  | 'studio_laugh'
  | 'studio_clap';

interface ActiveFoleyVoice {
  readonly id: number;
  readonly startTime: number;
  readonly endTime: number;
  readonly envGain: GainNode;
  readonly primarySource: AudioScheduledSourceNode;
  readonly extraSources: readonly AudioScheduledSourceNode[];
  readonly disconnectNodes: readonly AudioNode[];
  cleaned: boolean;
}

interface ActiveSkitGroup {
  readonly skitId: GremlinSkitIdV8;
  readonly ctx: AudioContext;
  readonly groupGain: GainNode;
  readonly crowdGroupGain: GainNode | null;
  readonly endTime: number;
  stopped: boolean;
}

interface SubBusChain {
  readonly ctx: AudioContext;
  sfxTarget: AudioNode | null;
  crowdTarget: AudioNode | null;
  readonly sfxInput: GainNode;
  readonly sfxOut: GainNode;
  readonly crowdInput: GainNode;
  readonly crowdOut: GainNode;
  readonly dispose: () => void;
}

interface CachedPhysicalBuffers {
  readonly pinkAir: AudioBuffer;
  readonly fuseCrackle: AudioBuffer;
  readonly warmTubeCurve: Float32Array<ArrayBuffer>;
  readonly hardBuzzCurve: Float32Array<ArrayBuffer>;
}

const NOMINAL_SKIT_DURATIONS_SEC: Readonly<Record<GremlinSkitIdV8, number>> = {
  REEL_MOWER: 2.40,
  CANISTER_VAC: 2.42,
  JACKHAMMER_SANDBAG: 2.48,
  TNT_PLUNGER: 2.44,
  CABLE_SHEARS: 2.40,
  WATUSI_BROOM: 2.40,
  CATWALK_MAGNET: 2.42,
  TIN_UFO: 2.44,
} satisfies Readonly<Record<GremlinSkitIdV8, number>>;

// ----------------------------------------------------------------------------
// Deterministic DSP & Curve Builders
// ----------------------------------------------------------------------------

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return v < min ? min : v > max ? max : v;
}

function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function createSeededPrng(seed: number): () => number {
  let state = seed >>> 0 || 0x19660808;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x80000000 - 1.0;
  };
}

/**
 * C1-continuous unity-gain soft-knee ceiling shaper:
 * exact 1.0x linear below `kneeStart`, smooth `tanh` asymptote strictly <= `maxOut`.
 */
function createSoftKneeCeilingCurve(
  kneeStart: number,
  maxOut: number,
  samples = 1024,
): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(samples);
  const span = Math.max(0.04, maxOut - kneeStart);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / (samples - 1) - 1;
    const ax = Math.abs(x);
    if (ax <= kneeStart) {
      curve[i] = x;
    } else {
      const sign = x < 0 ? -1 : 1;
      curve[i] = sign * (kneeStart + span * Math.tanh((ax - kneeStart) / span));
    }
  }
  return curve;
}

/** Zero-DC odd/even harmonic warm tube saturation curve (`curve[mid] === 0`). */
function createZeroDcTubeCurve(
  drive = 1.85,
  samples = 512,
): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(samples);
  const norm = 1 / Math.tanh(drive);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / (samples - 1) - 1;
    // Multiply even-harmonic term by |x| window vanishing at x=0 so DC offset at silence is 0.0!
    const shaped = x + 0.08 * x * x * Math.sign(x) * (1 - Math.abs(x));
    curve[i] = Math.tanh(shaped * drive) * norm * 0.94;
  }
  const mid = samples >> 1;
  if (samples % 2 === 1) {
    curve[mid] = 0;
  }
  return curve;
}

function buildCachedPhysicalBuffers(ctx: AudioContext): CachedPhysicalBuffers {
  const sr = ctx.sampleRate;

  // 1. Seamless loopable Paul-Kellet Pink Airflow Buffer (1.6s) for vacuums, whooshes & steam
  const airLen = Math.max(4096, Math.round(sr * 1.6));
  const pinkAir = ctx.createBuffer(1, airLen, sr);
  const airData = pinkAir.getChannelData(0);
  const randAir = createSeededPrng(0x66a1b2c3);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < airLen; i++) {
    const white = randAir();
    b0 = 0.99765 * b0 + white * 0.0990460;
    b1 = 0.96300 * b1 + white * 0.2965164;
    b2 = 0.57000 * b2 + white * 1.0526913;
    const pink = (b0 + b1 + b2 + white * 0.1848) * 0.21;
    airData[i] = clamp(pink, -0.88, 0.88);
  }
  // Smooth 16ms endpoint fade so loop wrap is 100% click-free
  const loopFade = Math.min(Math.round(sr * 0.016), airLen >> 3);
  for (let i = 0; i < loopFade; i++) {
    const w = i / loopFade;
    airData[i] *= w;
    airData[airLen - 1 - i] *= w;
  }

  // 2. Burning Fuse & Coax Spark Crackle Buffer (1.25s)
  const crackleLen = Math.max(4096, Math.round(sr * 1.25));
  const fuseCrackle = ctx.createBuffer(1, crackleLen, sr);
  const crackleData = fuseCrackle.getChannelData(0);
  const randSpark = createSeededPrng(0x5041524b);
  let sparkEnv = 0;
  let hissPrev = 0;
  for (let i = 0; i < crackleLen; i++) {
    const w = randSpark();
    const hpHiss = (w - hissPrev) * 0.26;
    hissPrev = w;
    if (Math.abs(randSpark()) > 0.968) {
      sparkEnv = 0.72 + Math.abs(randSpark()) * 0.22;
    } else {
      sparkEnv *= 0.92;
    }
    crackleData[i] = clamp(hpHiss + w * sparkEnv, -0.90, 0.90);
  }
  for (let i = 0; i < loopFade; i++) {
    const w = i / loopFade;
    crackleData[i] *= w;
    crackleData[crackleLen - 1 - i] *= w;
  }

  return {
    pinkAir,
    fuseCrackle,
    warmTubeCurve: createZeroDcTubeCurve(1.75, 513),
    hardBuzzCurve: createZeroDcTubeCurve(3.45, 513),
  };
}

// ============================================================================
// Main Class: `CartoonFoleyAndShowpieceSfxV8`
// ============================================================================

export class CartoonFoleyAndShowpieceSfxV8 {
  private readonly getContext: () => AudioContext | null;
  private readonly getSfxBus: () => AudioNode | null;
  private readonly getCrowdBus: () => AudioNode | null;
  private samplePack: SamplePackLoaderV7;

  private readonly bufferCache = new WeakMap<AudioContext, CachedPhysicalBuffers>();
  private subChain: SubBusChain | null = null;
  private readonly activeVoices: ActiveFoleyVoice[] = [];
  private activeSkitGroup: ActiveSkitGroup | null = null;
  private voiceSeq = 0;
  private disposed = false;

  constructor(
    getContext: () => AudioContext | null,
    getSfxBus: () => AudioNode | null,
    getCrowdBus: () => AudioNode | null,
    samplePack?: SamplePackLoaderV7,
  ) {
    this.getContext = getContext;
    this.getSfxBus = getSfxBus;
    this.getCrowdBus = getCrowdBus;
    this.samplePack = samplePack ?? new SamplePackLoaderV7();

    // Ensure compile-time touch of canonical skit ID array from contracts_v7
    void ALL_GREMLIN_SKIT_IDS_V8;
  }

  /** Optional runtime attachment if a shared `SamplePackLoaderV7` is wired post-construction. */
  public setSamplePack(samplePack: SamplePackLoaderV7): void {
    this.samplePack = samplePack;
  }

  /** Returns exact scheduled choreography duration (seconds) for a Gremlin skit. */
  public getSkitDurationSec(skitId: GremlinSkitIdV8, reducedMotion = false): number {
    const base = NOMINAL_SKIT_DURATIONS_SEC[skitId] ?? 2.4;
    return reducedMotion ? Number((base * 0.42).toFixed(2)) : base;
  }

  /** Returns number of currently scheduled/playing WebAudio voice handles. */
  public getActiveVoiceCount(): number {
    const ctx = this.getContext();
    if (ctx) {
      this.pruneFinishedVoices(ctx.currentTime);
    }
    return this.activeVoices.length;
  }

  // --------------------------------------------------------------------------
  // 1. Iconic *Press Your Luck* / Studio 6A Gremlin Cut-In & Podium Boing
  // --------------------------------------------------------------------------

  /**
   * 1. `playGremlinBrassFoghornCut()`:
   * The iconic *Press Your Luck* sudden `BRRRR-AWK! BRRRR-AWK!` double low-brass /
   * trombone & bari-sax 26Hz flutter-growl + physical Edwards AC magnetic buzzer
   * bite + startled studio audience gasp!
   */
  public playGremlinBrassFoghornCut(): void {
    const stage = this.prepareStage();
    if (!stage) return;
    const { ctx, sfxDest, crowdDest, phys } = stage;
    const now = ctx.currentTime;

    // Double foghorn blasts: "BRRRR-AWK! (0.00..0.27s) ... BRRRR-AWK! (0.31..0.68s)"
    const blasts = [
      { dt: 0.00, dur: 0.27, trbMidi: 41, trbEnd: 40, bariMidi: 35, brassMidi: 47, trpMidi: 59, flutterHz: 27 },
      { dt: 0.31, dur: 0.38, trbMidi: 40, trbEnd: 37, bariMidi: 34, brassMidi: 46, trpMidi: 58, flutterHz: 24 },
    ];

    for (let i = 0; i < blasts.length; i++) {
      const b = blasts[i];
      const at = now + b.dt;

      // Sub-group with 24..27Hz flutter-tongue brass growl modulation!
      const flutterBus = this.createFlutterGrowlNode(
        ctx,
        sfxDest,
        at,
        b.dur + 0.08,
        b.flutterHz,
        0.28,
      );

      // Real multi-sampled low Trombone + Baritone Sax + Brass + Muted Trumpet tritone bite
      this.playInstrument(ctx, flutterBus, 'trombone', b.trbMidi, at, b.dur, 0.34, {
        bendToMidi: b.trbEnd,
        wahSweep: true,
        pan: -0.16,
        lowpassHz: 2200,
      });
      this.playInstrument(ctx, flutterBus, 'baritone_sax', b.bariMidi, at + 0.004, b.dur, 0.28, {
        bendToMidi: b.bariMidi - 2,
        pan: 0.16,
        lowpassHz: 1950,
      });
      this.playInstrument(ctx, flutterBus, 'brass', b.brassMidi, at + 0.006, b.dur * 0.95, 0.24, {
        bendToMidi: b.brassMidi - 2,
        pan: -0.24,
        lowpassHz: 2350,
      });
      this.playInstrument(ctx, flutterBus, 'muted_trumpet', b.trpMidi, at + 0.008, b.dur * 0.88, 0.20, {
        bendToMidi: b.trpMidi - 2,
        wahSweep: true,
        pan: 0.22,
      });

      // Heavy breaker relay snap + physical Edwards AC 120Hz magnetic buzzer bite
      this.playFoley(ctx, sfxDest, 'mechanical_clack', at, 0.24, {
        playbackRate: i === 0 ? 0.82 : 0.74,
        durationSec: 0.075,
      });
      this.playAcMagneticBuzzer(ctx, sfxDest, phys, at, i === 0 ? 0.21 : 0.26, 0.19);
    }

    // Low timpani gut-thump anchoring the second foghorn cut
    this.playInstrument(ctx, sfxDest, 'timpani', 41, now + 0.31, 0.42, 0.26, {
      bendToMidi: 38,
      lowpassHz: 460,
    });

    // Studio 6A collective startled intake gasp + sympathetic "Ooooh!"
    if (crowdDest) {
      this.playCrowd(ctx, crowdDest, 'cheer_hurray', now + 0.10, 0.23, {
        durationSec: 0.36,
        playbackRate: 0.95,
        lowpassHz: 2150,
        attackSec: 0.024,
        releaseSec: 0.20,
      });
      this.playCrowd(ctx, crowdDest, 'cheer_hurray', now + 0.24, 0.26, {
        durationSec: 0.85,
        playbackRate: 0.69,
        lowpassHz: 1020,
        attackSec: 0.055,
        releaseSec: 0.38,
      });
    }
  }

  /**
   * 2. `playPodiumGremlinBoing(gremlinCount1to4)`:
   * Spring-loaded metal coil jaw-harp `*BOING-oing-oing!*` pitched up slightly
   * across Gremlin #1..#4 as the die-cut wooden podium standee pops up!
   */
  public playPodiumGremlinBoing(gremlinCount1to4: number): void {
    const stage = this.prepareStage();
    if (!stage) return;
    const { ctx, sfxDest, phys } = stage;
    const now = ctx.currentTime;

    const countIdx = clamp(Math.round(gremlinCount1to4 || 1), 1, 4);
    // Ascending tension pitches: #1 D3 (50), #2 F3 (53), #3 A3 (57), #4 C4 (60)!
    const stepMidis = [50, 53, 57, 60] as const;
    const baseMidi = stepMidis[countIdx - 1];
    const baseHz = midiToHz(baseMidi);

    // 1. Crisp wooden standee slot release click + woodblock pop
    this.playFoley(ctx, sfxDest, 'flap_click', now, 0.22, {
      playbackRate: 1.18 + countIdx * 0.09,
      durationSec: 0.036,
    });
    this.playInstrument(ctx, sfxDest, 'woodblock', 71 + countIdx * 2, now + 0.004, 0.055, 0.16, {
      pan: (countIdx - 2.5) * 0.08,
    });

    // 2. Real acoustic plucked twang foundation (jazz guitar + vibraphone upward bend)
    this.playInstrument(ctx, sfxDest, 'jazz_guitar', baseMidi, now + 0.008, 0.46, 0.23, {
      bendToMidi: baseMidi + 4,
      lowpassHz: 3100,
    });
    this.playInstrument(ctx, sfxDest, 'vibraphone', baseMidi + 12, now + 0.014, 0.38, 0.13, {
      bendToMidi: baseMidi + 15,
      highpassHz: 320,
    });

    // 3. Physical Treg Brown Jaw-Harp & Helical Steel Coil Spring Resonator ("BOI-oi-oi-oing!")
    this.playJawHarpCoilSpring(ctx, sfxDest, phys, now + 0.006, baseHz, 0.58, 0.24);

    // 4. Subtle lockout warning bell glint on the 4th Gremlin standee!
    if (countIdx >= 4) {
      this.playFoley(ctx, sfxDest, 'typewriter_bell', now + 0.04, 0.14, {
        playbackRate: 1.28,
        durationSec: 0.34,
      });
    }
  }

  // --------------------------------------------------------------------------
  // 2. 8 Bespoke 1966 Hanna-Barbera / UPA Gremlin Skit Choreographies (~2.4s)
  // --------------------------------------------------------------------------

  /**
   * 3. `playGremlinSkitChoreography(skitId, reducedMotion)`:
   * Schedules `~2.4s` (or `~1.0s` compact summary when `reducedMotion === true`)
   * of frame-accurate 1966 Hanna-Barbera / UPA slapstick soundstage foley!
   */
  public playGremlinSkitChoreography(
    skitId: GremlinSkitIdV8,
    reducedMotion = false,
  ): void {
    const stage = this.prepareStage();
    if (!stage) return;
    const { ctx, sfxDest, crowdDest, phys } = stage;

    // Cleanly fade out any previous skit choreography so rapid replays/skips never clash
    this.stopActiveSkit(0.035);

    const now = ctx.currentTime;
    const ts = reducedMotion ? 0.42 : 1.0;
    const nominalDur = this.getSkitDurationSec(skitId, reducedMotion);

    const groupGain = ctx.createGain();
    groupGain.gain.setValueAtTime(1.0, now);
    groupGain.connect(sfxDest);

    let crowdGroupGain: GainNode | null = null;
    if (crowdDest) {
      crowdGroupGain = ctx.createGain();
      crowdGroupGain.gain.setValueAtTime(1.0, now);
      crowdGroupGain.connect(crowdDest);
    }

    const skitHandle: ActiveSkitGroup = {
      skitId,
      ctx,
      groupGain,
      crowdGroupGain,
      endTime: now + nominalDur + 0.35,
      stopped: false,
    };
    this.activeSkitGroup = skitHandle;

    switch (skitId) {
      case 'REEL_MOWER':
        this.scheduleReelMowerSkit(ctx, groupGain, crowdGroupGain, phys, now, ts);
        break;
      case 'CANISTER_VAC':
        this.scheduleCanisterVacSkit(ctx, groupGain, crowdGroupGain, phys, now, ts);
        break;
      case 'JACKHAMMER_SANDBAG':
        this.scheduleJackhammerSandbagSkit(ctx, groupGain, crowdGroupGain, phys, now, ts);
        break;
      case 'TNT_PLUNGER':
        this.scheduleTntPlungerSkit(ctx, groupGain, crowdGroupGain, phys, now, ts);
        break;
      case 'CABLE_SHEARS':
        this.scheduleCableShearsSkit(ctx, groupGain, crowdGroupGain, phys, now, ts);
        break;
      case 'WATUSI_BROOM':
        this.scheduleWatusiBroomSkit(ctx, groupGain, crowdGroupGain, phys, now, ts);
        break;
      case 'CATWALK_MAGNET':
        this.scheduleCatwalkMagnetSkit(ctx, groupGain, crowdGroupGain, phys, now, ts);
        break;
      case 'TIN_UFO':
        this.scheduleTinUfoSkit(ctx, groupGain, crowdGroupGain, phys, now, ts);
        break;
      default: {
        const _exhaustive: never = skitId;
        void _exhaustive;
        break;
      }
    }
  }

  /**
   * Smoothly hushes any in-flight Gremlin cartoon skit choreography (e.g. when
   * the player taps the `SKIP ⏭` button on the proscenium stage).
   */
  public stopActiveSkit(fadeSec = 0.04): void {
    const active = this.activeSkitGroup;
    if (!active || active.stopped) return;
    active.stopped = true;
    this.activeSkitGroup = null;

    const now = active.ctx.currentTime;
    const dur = clamp(fadeSec, 0.012, 0.25);
    try {
      active.groupGain.gain.cancelScheduledValues(now);
      active.groupGain.gain.setValueAtTime(Math.max(0.0001, active.groupGain.gain.value), now);
      active.groupGain.gain.linearRampToValueAtTime(0.0, now + dur);

      if (active.crowdGroupGain) {
        active.crowdGroupGain.gain.cancelScheduledValues(now);
        active.crowdGroupGain.gain.setValueAtTime(
          Math.max(0.0001, active.crowdGroupGain.gain.value),
          now,
        );
        active.crowdGroupGain.gain.linearRampToValueAtTime(0.0, now + dur);
      }
    } catch {
      // Safe cleanup if AudioContext closed
    }
  }

  // --- Skit 1: `REEL_MOWER` ("LAWN CARE AT EIGHT SHARP!") ---
  private scheduleReelMowerSkit(
    ctx: AudioContext,
    sfx: AudioNode,
    crowd: AudioNode | null,
    phys: CachedPhysicalBuffers,
    now: number,
    ts: number,
  ): void {
    // Beat 1 (0.00..1.45s): Accelerating 5-blade rotary reel mower chattering Stage L -> Stage R
    const bladeStrokes = ts < 0.6 ? 9 : 18;
    let cursor = 0.02 * ts;
    for (let i = 0; i < bladeStrokes; i++) {
      const u = i / Math.max(1, bladeStrokes - 1);
      const stepSec = (0.095 - u * 0.046) * (ts < 0.6 ? 0.82 : 1.0);
      const at = now + cursor;
      const pan = -0.55 + u * 1.10;
      const wbMidi = (i % 2 === 0 ? 74 : 78) + Math.round(u * 4);

      this.playInstrument(ctx, sfx, 'woodblock', wbMidi, at, 0.048, 0.17 + u * 0.05, {
        pan,
        lowpassHz: 3200 + u * 900,
      });
      this.playFoley(ctx, sfx, 'flap_click', at + 0.006, 0.16 + u * 0.04, {
        playbackRate: 1.15 + u * 0.55,
        durationSec: 0.032,
        pan,
      });
      if (i % 2 === 1) {
        this.playDrum(ctx, sfx, 'snare_brush', at + 0.010, 0.11 + u * 0.04, {
          playbackRate: 1.22 + u * 0.25,
          durationSec: 0.055,
          pan,
          highpassHz: 420,
        });
      }
      cursor += stepSec;
    }

    // Beat 2 (0.42..1.52s): Paper-shredding dollar confetti swishes as digits get chopped!
    const shredTimes = [0.44, 0.72, 1.00, 1.28];
    for (let i = 0; i < shredTimes.length; i++) {
      const at = now + shredTimes[i] * ts;
      const pan = -0.30 + i * 0.20;
      this.playFoley(ctx, sfx, 'brush_sweep', at, 0.22, {
        playbackRate: 1.38 + i * 0.09,
        durationSec: 0.16,
        highpassHz: 680,
        lowpassHz: 4200,
        pan,
      });
      this.playDrum(ctx, sfx, 'shaker', at + 0.015, 0.13, {
        playbackRate: 1.32,
        durationSec: 0.09,
        pan: -pan,
      });
      this.playFoley(ctx, sfx, 'mechanical_clack', at, 0.15, {
        playbackRate: 1.24 + i * 0.06,
        durationSec: 0.045,
        pan,
      });
    }

    // Beat 3 (1.48..2.36s): Breathy wooden slide-whistle + tumbling xylophone/marimba confetti scatter!
    const scatterStart = now + 1.48 * ts;
    this.playWoodenSlideWhistle(
      ctx,
      sfx,
      phys,
      scatterStart,
      0.52 * Math.max(0.55, ts),
      560,
      1540,
      920,
      0.16,
    );

    const scatterNotes = [72, 76, 79, 81, 77, 74, 84];
    for (let i = 0; i < scatterNotes.length; i++) {
      const at = scatterStart + i * 0.062 * ts;
      const pan = (i % 2 === 0 ? -1 : 1) * (0.18 + i * 0.05);
      this.playInstrument(ctx, sfx, 'marimba', scatterNotes[i], at, 0.19, 0.22, { pan });
      this.playInstrument(
        ctx,
        sfx,
        'glockenspiel',
        Math.min(MIDI_C6, scatterNotes[i]),
        at + 0.008,
        0.22,
        0.13,
        { pan: -pan * 0.6 },
      );
    }

    // Cheeky muted-trumpet visor-tip wink!
    this.playInstrument(ctx, sfx, 'muted_trumpet', 65, scatterStart + 0.36 * ts, 0.34, 0.20, {
      bendToMidi: 69,
      wahSweep: true,
      pan: 0.20,
    });

    if (crowd) {
      this.playCrowd(ctx, crowd, 'studio_laugh', scatterStart + 0.12 * ts, 0.22, {
        durationSec: 0.85,
        attackSec: 0.06,
      });
    }
  }

  // --- Skit 2: `CANISTER_VAC` ("CLEANING OUT YOUR BANKROLL!") ---
  private scheduleCanisterVacSkit(
    ctx: AudioContext,
    sfx: AudioNode,
    crowd: AudioNode | null,
    phys: CachedPhysicalBuffers,
    now: number,
    ts: number,
  ): void {
    // 0.00s: Hoover canister wheels & power foot-switch click
    this.playFoley(ctx, sfx, 'mechanical_clack', now + 0.02 * ts, 0.22, {
      playbackRate: 1.06,
      durationSec: 0.065,
      pan: -0.35,
    });

    // Beat 1 (0.10..1.58s): Rising filtered turbine suction roar + swelling chrome canister resonance
    const vacDur = 1.48 * ts;
    this.playFilteredNoiseSweep(ctx, sfx, phys.pinkAir, now + 0.10 * ts, vacDur, {
      filterType: 'bandpass',
      startHz: 250,
      endHz: 1720,
      q: 3.2,
      peakGain: 0.28,
      attackSec: 0.09,
      releaseSec: 0.05,
      panStart: -0.30,
      panEnd: 0.10,
    });
    this.playTurbineMotorWhir(ctx, sfx, phys, now + 0.10 * ts, vacDur, 145, 510, 0.14);

    // Beat 2 (0.38..1.50s): Rapid marimba/glockenspiel `$` digits slurped up the corrugated hose!
    const slurpNotes = [60, 62, 65, 67, 69, 72, 76, 79, 83];
    for (let i = 0; i < slurpNotes.length; i++) {
      const u = i / (slurpNotes.length - 1);
      const at = now + (0.38 + u * 1.08) * ts;
      const midi = slurpNotes[i];
      this.playInstrument(ctx, sfx, 'marimba', midi, at, 0.13, 0.21, {
        bendToMidi: Math.min(MIDI_C6, midi + 3),
        pan: -0.22 + u * 0.44,
      });
      if (i % 2 === 0) {
        this.playInstrument(
          ctx,
          sfx,
          'glockenspiel',
          Math.min(MIDI_C6, midi + 12),
          at + 0.006,
          0.14,
          0.12,
          { pan: 0.18 - u * 0.36 },
        );
      }
      this.playFoley(ctx, sfx, 'flap_click', at, 0.14, {
        playbackRate: 1.15 + u * 0.65,
        durationSec: 0.028,
      });
    }

    // Beat 3 (1.60s): Canister lid blows off — muffled timpani *POOF!* soot pop + audience laugh!
    const poofAt = now + 1.60 * ts;
    this.playInstrument(ctx, sfx, 'woodblock', 79, poofAt, 0.06, 0.23, {
      bendToMidi: 84,
    });
    this.playDrum(ctx, sfx, 'snare_rim', poofAt + 0.005, 0.19, { playbackRate: 0.88 });
    this.playInstrument(ctx, sfx, 'timpani', 48, poofAt + 0.012, 0.52, 0.32, {
      bendToMidi: 41,
      lowpassHz: 440,
    });
    this.playDrum(ctx, sfx, 'kick', poofAt + 0.012, 0.26, {
      playbackRate: 0.82,
      lowpassHz: 340,
    });
    // Pillowy soot-cloud puff
    this.playFilteredNoiseSweep(ctx, sfx, phys.pinkAir, poofAt + 0.018, 0.42 * Math.max(0.6, ts), {
      filterType: 'lowpass',
      startHz: 1150,
      endHz: 260,
      q: 1.1,
      peakGain: 0.22,
      attackSec: 0.010,
      releaseSec: 0.28,
    });
    // Soot-smudged muted-trumpet cough ("wah-uh!")
    this.playInstrument(ctx, sfx, 'muted_trumpet', 62, poofAt + 0.18 * ts, 0.22, 0.19, {
      bendToMidi: 58,
      wahSweep: true,
      pan: 0.16,
    });
    this.playInstrument(ctx, sfx, 'trombone', 50, poofAt + 0.20 * ts, 0.30, 0.18, {
      bendToMidi: 46,
      lowpassHz: 1650,
      pan: -0.16,
    });

    if (crowd) {
      this.playCrowd(ctx, crowd, 'studio_laugh', poofAt + 0.10 * ts, 0.28, {
        durationSec: 0.88,
        attackSec: 0.06,
      });
    }
  }

  // --- Skit 3: `JACKHAMMER_SANDBAG` ("STUDIO CONSTRUCTION ZONE!") ---
  private scheduleJackhammerSandbagSkit(
    ctx: AudioContext,
    sfx: AudioNode,
    crowd: AudioNode | null,
    phys: CachedPhysicalBuffers,
    now: number,
    ts: number,
  ): void {
    // Beat 1 (0.00..1.10s): Rapid pneumatic woodblock/rimshot jackhammer burst shattering score digits!
    const hits = ts < 0.6 ? 8 : 15;
    for (let i = 0; i < hits; i++) {
      const at = now + i * (1.08 / hits) * ts;
      const pan = ((i % 3) - 1) * 0.12;
      const accent = i % 2 === 0 ? 1.0 : 0.84;

      this.playInstrument(ctx, sfx, 'woodblock', i % 2 === 0 ? 73 : 76, at, 0.045, 0.20 * accent, {
        pan,
      });
      this.playDrum(ctx, sfx, 'snare_rim', at + 0.003, 0.18 * accent, {
        playbackRate: 1.08 + (i % 3) * 0.05,
        pan: -pan,
      });
      this.playFoley(ctx, sfx, 'mechanical_clack', at + 0.006, 0.17 * accent, {
        playbackRate: 1.28,
        durationSec: 0.038,
        pan,
      });
      if (i % 2 === 0) {
        this.playDrum(ctx, sfx, 'kick', at, 0.15, { playbackRate: 1.12, lowpassHz: 420 });
      }
      if (i % 4 === 3) {
        this.playFoley(ctx, sfx, 'brush_sweep', at + 0.012, 0.11, {
          playbackRate: 1.65,
          durationSec: 0.05,
          highpassHz: 900,
        });
      }
    }

    // Beat 2 (1.16..1.52s): Smug muted-trumpet "WAH!" flex at Camera 1
    const flexAt = now + 1.16 * ts;
    this.playInstrument(ctx, sfx, 'muted_trumpet', 67, flexAt, 0.34 * Math.max(0.55, ts), 0.25, {
      bendToMidi: 70,
      wahSweep: true,
      pan: 0.14,
    });
    this.playInstrument(ctx, sfx, 'trombone', 55, flexAt + 0.01, 0.32 * Math.max(0.55, ts), 0.18, {
      bendToMidi: 58,
      pan: -0.14,
    });

    // Beat 3a (1.54..1.90s): Overhead "STAGE 6A" counterweight sandbag whistling drop!
    const dropAt = now + 1.54 * ts;
    const dropDur = 0.36 * Math.max(0.55, ts);
    this.playWoodenSlideWhistle(ctx, sfx, phys, dropAt, dropDur, 1720, 320, 290, 0.19);
    this.playFoley(ctx, sfx, 'brush_sweep', dropAt + dropDur * 0.35, 0.16, {
      playbackRate: 0.92,
      durationSec: dropDur * 0.65,
      lowpassHz: 2400,
    });

    // Beat 3b (1.90..2.48s): Heavy timpani/kick *THUD!* flatten + dizzy circling vibraphone/glockenspiel birds!
    const thudAt = dropAt + dropDur;
    this.playInstrument(ctx, sfx, 'timpani', 45, thudAt, 0.48, 0.35, {
      bendToMidi: 39,
      lowpassHz: 480,
    });
    this.playDrum(ctx, sfx, 'kick', thudAt, 0.30, { playbackRate: 0.84, lowpassHz: 360 });
    this.playDrum(ctx, sfx, 'snare_brush', thudAt + 0.008, 0.22, {
      playbackRate: 0.78,
      durationSec: 0.14,
      lowpassHz: 1850,
    });
    // Accordion-squashed trombone squeak
    this.playInstrument(ctx, sfx, 'trombone', 53, thudAt + 0.02, 0.18, 0.21, {
      bendToMidi: 46,
      wahSweep: true,
    });

    // Dizzy circling cartoon stars & tweet-birds orbiting in stereo
    const birdMidis = [76, 80, 78, 82, 79, 84];
    for (let i = 0; i < birdMidis.length; i++) {
      const at = thudAt + (0.08 + i * 0.072) * Math.max(0.55, ts);
      const orbitPan = Math.sin((i / birdMidis.length) * Math.PI * 2) * 0.58;
      this.playInstrument(ctx, sfx, 'vibraphone', birdMidis[i] - 12, at, 0.22, 0.17, {
        pan: orbitPan,
      });
      this.playInstrument(ctx, sfx, 'glockenspiel', birdMidis[i], at + 0.008, 0.20, 0.15, {
        bendToMidi: Math.min(MIDI_C6, birdMidis[i] + 1),
        pan: -orbitPan * 0.7,
      });
    }

    if (crowd) {
      this.playCrowd(ctx, crowd, 'studio_laugh', thudAt + 0.08, 0.28, {
        durationSec: 0.85,
        attackSec: 0.05,
      });
    }
  }

  // --- Skit 4: `TNT_PLUNGER` ("SPECIAL EFFECTS DEPARTMENT!") ---
  private scheduleTntPlungerSkit(
    ctx: AudioContext,
    sfx: AudioNode,
    crowd: AudioNode | null,
    phys: CachedPhysicalBuffers,
    now: number,
    ts: number,
  ): void {
    // Beat 1 (0.00..0.40s): Wooden "FX DEPT" ratchet plunger push -> brass T-handle slam!
    const rackClicks = [0.02, 0.09, 0.15, 0.21, 0.27];
    for (let i = 0; i < rackClicks.length; i++) {
      const at = now + rackClicks[i] * ts;
      this.playFoley(ctx, sfx, 'flap_click', at, 0.20, {
        playbackRate: 1.45 - i * 0.08,
        durationSec: 0.032,
        pan: -0.28,
      });
      this.playInstrument(ctx, sfx, 'woodblock', 80 - i * 2, at, 0.045, 0.15, { pan: -0.24 });
    }
    const plungeAt = now + 0.35 * ts;
    this.playFoley(ctx, sfx, 'mechanical_clack', plungeAt, 0.28, {
      playbackRate: 0.76,
      durationSec: 0.085,
      pan: -0.22,
    });
    this.playDrum(ctx, sfx, 'tom_mid', plungeAt + 0.008, 0.20, { playbackRate: 0.88, pan: -0.20 });

    // Beat 2 (0.38..1.08s): Burning red dynamite fuse sizzle racing Stage L -> Center!
    const fuseDur = 0.70 * ts;
    this.playFilteredNoiseSweep(ctx, sfx, phys.fuseCrackle, now + 0.38 * ts, fuseDur, {
      filterType: 'bandpass',
      startHz: 1950,
      endHz: 4100,
      q: 2.4,
      peakGain: 0.24,
      attackSec: 0.02,
      releaseSec: 0.03,
      panStart: -0.42,
      panEnd: 0.12,
    });
    this.playDrum(ctx, sfx, 'shaker', now + 0.55 * ts, 0.12, { playbackRate: 1.55, durationSec: 0.14 });
    this.playDrum(ctx, sfx, 'shaker', now + 0.82 * ts, 0.14, { playbackRate: 1.72, durationSec: 0.14 });

    // Beat 3a (1.10s): Big Studio Timpani + Crash + Thunder *KABOOM!*
    const boomAt = now + 1.10 * ts;
    this.playDrum(ctx, sfx, 'snare_stick', boomAt, 0.26, { playbackRate: 0.84 });
    this.playDrum(ctx, sfx, 'kick', boomAt, 0.32, { playbackRate: 0.78, lowpassHz: 360 });
    this.playInstrument(ctx, sfx, 'timpani', 48, boomAt + 0.004, 0.72, 0.34, {
      bendToMidi: 41,
      lowpassHz: 520,
      pan: -0.14,
    });
    this.playInstrument(ctx, sfx, 'timpani', 41, boomAt + 0.016, 0.76, 0.30, {
      bendToMidi: 36,
      lowpassHz: 380,
      pan: 0.14,
    });
    this.playDrum(ctx, sfx, 'crash', boomAt + 0.008, 0.22, {
      playbackRate: 0.88,
      durationSec: 1.05 * Math.max(0.55, ts),
      lowpassHz: 4200,
      pan: 0.22,
    });
    // Warm studio thunder-sheet low rumble
    this.playFilteredNoiseSweep(ctx, sfx, phys.pinkAir, boomAt + 0.006, 0.62 * Math.max(0.55, ts), {
      filterType: 'lowpass',
      startHz: 680,
      endHz: 155,
      q: 1.4,
      peakGain: 0.27,
      attackSec: 0.006,
      releaseSec: 0.42 * Math.max(0.55, ts),
    });

    // Beat 3b (1.44..2.40s): Singed muted-trumpet + trombone "wah - wah - waaaah"!
    const wahSteps = [
      { dt: 1.44, midi: 65, bend: 64, dur: 0.21 },
      { dt: 1.67, midi: 64, bend: 63, dur: 0.21 },
      { dt: 1.90, midi: 63, bend: 58, dur: 0.48 },
    ];
    for (const w of wahSteps) {
      const at = now + w.dt * ts;
      const d = w.dur * Math.max(0.52, ts);
      this.playInstrument(ctx, sfx, 'muted_trumpet', w.midi, at, d, 0.24, {
        bendToMidi: w.bend,
        wahSweep: true,
        pan: 0.18,
      });
      this.playInstrument(ctx, sfx, 'trombone', w.midi - 12, at + 0.008, d * 1.04, 0.22, {
        bendToMidi: w.bend - 12,
        wahSweep: true,
        pan: -0.18,
      });
    }

    if (crowd) {
      this.playCrowd(ctx, crowd, 'studio_laugh', boomAt + 0.30 * ts, 0.28, {
        durationSec: 0.95,
        attackSec: 0.07,
      });
    }
  }

  // --- Skit 5: `CABLE_SHEARS` ("TECHNICAL DIFFICULTIES!") ---
  private scheduleCableShearsSkit(
    ctx: AudioContext,
    sfx: AudioNode,
    crowd: AudioNode | null,
    phys: CachedPhysicalBuffers,
    now: number,
    ts: number,
  ): void {
    // Beat 1a (0.02..0.42s): Sneaky tiptoe upright-bass pizzicato behind velvet curtain
    const tiptoes = [
      { dt: 0.03, midi: 45 },
      { dt: 0.17, midi: 48 },
      { dt: 0.31, midi: 52 },
    ];
    for (const step of tiptoes) {
      const at = now + step.dt * ts;
      this.playInstrument(ctx, sfx, 'upright_bass', step.midi, at, 0.12, 0.22, { pan: -0.25 });
      this.playInstrument(ctx, sfx, 'woodblock', step.midi + 28, at + 0.004, 0.04, 0.10, { pan: -0.20 });
    }

    // Beat 1b (0.48s): Crisp giant hardened-steel scissor *SNIP!*
    const snipAt = now + 0.48 * ts;
    this.playDrum(ctx, sfx, 'hihat_closed', snipAt, 0.28, {
      playbackRate: 1.34,
      durationSec: 0.055,
      highpassHz: 950,
    });
    this.playFoley(ctx, sfx, 'mechanical_clack', snipAt + 0.005, 0.27, {
      playbackRate: 1.48,
      durationSec: 0.052,
    });
    this.playInstrument(ctx, sfx, 'tubular_bell', 81, snipAt + 0.008, 0.16, 0.16, {
      highpassHz: 1350,
      pan: 0.14,
    });
    this.playInstrument(ctx, sfx, 'glockenspiel', 83, snipAt + 0.010, 0.14, 0.13, {
      pan: -0.14,
    });

    // Beat 2 (0.56..1.24s): Crackling turquoise-and-gold electric coax arc zap + X-ray skeleton buzz!
    const arcAt = now + 0.56 * ts;
    const arcDur = 0.66 * Math.max(0.55, ts);
    this.playElectricArcZap(ctx, sfx, phys, arcAt, arcDur, 0.24);

    const zapJitters = [0.00, 0.15, 0.31, 0.47];
    for (let i = 0; i < zapJitters.length; i++) {
      const at = arcAt + zapJitters[i] * ts;
      this.playInstrument(ctx, sfx, 'clean_guitar', 60 + (i % 2 === 0 ? 6 : 0), at, 0.11, 0.19, {
        bendToMidi: 57,
        pan: i % 2 === 0 ? -0.32 : 0.32,
      });
      this.playInstrument(ctx, sfx, 'vibraphone', 72 + (i % 2) * 6, at + 0.005, 0.10, 0.15, {
        pan: i % 2 === 0 ? 0.28 : -0.28,
      });
      if (i % 2 === 0) {
        this.playDrum(ctx, sfx, 'snare_rim', at, 0.15, { playbackRate: 1.42 });
      }
    }

    // Beat 3 (1.22..2.38s): Descending scoreboard power-down trombone / bari-sax / upright-bass droop!
    const droopAt = now + 1.22 * ts;
    const droopDur = 1.08 * Math.max(0.55, ts);
    this.playInstrument(ctx, sfx, 'trombone', 55, droopAt, droopDur, 0.31, {
      bendToMidi: 41,
      wahSweep: true,
      pan: -0.15,
    });
    this.playInstrument(ctx, sfx, 'baritone_sax', 48, droopAt + 0.015, droopDur * 0.96, 0.25, {
      bendToMidi: 35,
      lowpassHz: 1850,
      pan: 0.15,
    });
    this.playInstrument(ctx, sfx, 'upright_bass', 43, droopAt + 0.02, droopDur * 0.92, 0.28, {
      bendToMidi: 29,
      lowpassHz: 680,
    });
    this.playTurbineMotorWhir(ctx, sfx, phys, droopAt, droopDur * 0.88, 580, 56, 0.16);
    // Frizzed smoke puff at tail
    this.playFoley(ctx, sfx, 'brush_sweep', droopAt + droopDur * 0.65, 0.15, {
      playbackRate: 0.78,
      durationSec: 0.24,
      lowpassHz: 1800,
    });

    if (crowd) {
      this.playCrowd(ctx, crowd, 'studio_laugh', droopAt + 0.18 * ts, 0.25, {
        durationSec: 0.88,
        attackSec: 0.06,
      });
    }
  }

  // --- Skit 6: `WATUSI_BROOM` ("SWEEPING UP IN LIVING COLOR!") ---
  private scheduleWatusiBroomSkit(
    ctx: AudioContext,
    sfx: AudioNode,
    crowd: AudioNode | null,
    _phys: CachedPhysicalBuffers,
    now: number,
    ts: number,
  ): void {
    // 1966 *Hullabaloo / Laugh-In* Go-Go Bongo & Snare Groove (~132 BPM -> 8th = 0.227s)
    const eighth = 0.225 * ts;
    const bassLine = [41, 41, 45, 48, 50, 48, 45, 43]; // F major6 Go-Go walking bass!
    const bongoPat: ReadonlyArray<'bongo_lo' | 'bongo_hi'> = [
      'bongo_lo',
      'bongo_hi',
      'bongo_hi',
      'bongo_lo',
      'bongo_hi',
      'bongo_lo',
      'bongo_hi',
      'bongo_hi',
    ];

    for (let step = 0; step < 8; step++) {
      const at = now + step * eighth;
      // Walking electric bass
      this.playInstrument(ctx, sfx, 'electric_bass', bassLine[step], at, eighth * 0.92, 0.25, {
        lowpassHz: 980,
      });
      // Lively 1966 Go-Go bongos
      this.playDrum(ctx, sfx, bongoPat[step], at, 0.17, {
        playbackRate: step % 3 === 0 ? 1.06 : 0.98,
        pan: step % 2 === 0 ? 0.26 : -0.22,
      });

      if (step % 2 === 0) {
        this.playDrum(ctx, sfx, 'kick', at, 0.21);
      } else {
        // Snappy Hal Blaine backbeat snare + tambourine + mod guitar chop!
        this.playDrum(ctx, sfx, 'snare_stick', at, 0.20, { pan: -0.10 });
        this.playDrum(ctx, sfx, 'tambourine', at + 0.006, 0.14, { pan: 0.30 });
        this.playInstrument(ctx, sfx, 'clean_guitar', 65, at, eighth * 0.55, 0.17, { pan: -0.35 });
        this.playInstrument(ctx, sfx, 'electric_piano', 69, at + 0.005, eighth * 0.60, 0.16, {
          pan: 0.35,
        });
      }
    }

    // Rhythmic push-broom sweeps ("SWISH - SWISH - SWISH - CLINK!") sweeping `$` into brass dustpan!
    const sweepSteps = [1, 3, 5, 7];
    for (let i = 0; i < sweepSteps.length; i++) {
      const at = now + sweepSteps[i] * eighth + 0.02 * ts;
      const pan = -0.36 + i * 0.24;
      this.playFoley(ctx, sfx, 'brush_sweep', at, 0.25, {
        playbackRate: 1.08 + i * 0.08,
        durationSec: 0.19 * Math.max(0.6, ts),
        pan,
      });
      this.playDrum(ctx, sfx, 'snare_brush', at + 0.015, 0.15, {
        playbackRate: 0.96,
        durationSec: 0.14,
        pan,
      });
      // Dollar digit clinking into the brass "IBC" dustpan
      this.playInstrument(ctx, sfx, 'glockenspiel', 74 + i * 2, at + 0.08 * ts, 0.16, 0.13, {
        pan: -pan,
      });
    }

    // Beat 3 (1.84..2.40s): Cheeky Tijuana-Brass / Go-Go 2-chord Horn Hit & Bow!
    const hit1 = now + 1.84 * ts;
    const hit2 = now + 1.98 * ts;
    const holdDur = 0.42 * Math.max(0.55, ts);

    // Pickup chord (Eb6 -> F6!)
    this.playInstrument(ctx, sfx, 'trumpet', 75, hit1, 0.11, 0.22, { pan: 0.22 });
    this.playInstrument(ctx, sfx, 'muted_trumpet', 70, hit1, 0.11, 0.18, { pan: -0.18 });
    this.playInstrument(ctx, sfx, 'trombone', 51, hit1, 0.11, 0.19, { pan: -0.24 });

    // Big cheeky F69 button hit!
    this.playInstrument(ctx, sfx, 'trumpet', 77, hit2, holdDur, 0.25, { pan: 0.22 });
    this.playInstrument(ctx, sfx, 'muted_trumpet', 72, hit2 + 0.006, holdDur * 0.95, 0.20, {
      wahSweep: true,
      pan: -0.18,
    });
    this.playInstrument(ctx, sfx, 'brass', 65, hit2, holdDur, 0.22, { pan: 0.0 });
    this.playInstrument(ctx, sfx, 'trombone', 53, hit2, holdDur, 0.20, { pan: -0.26 });
    this.playDrum(ctx, sfx, 'crash', hit2, 0.17, { durationSec: 0.65, pan: 0.28 });
    this.playFoley(ctx, sfx, 'cash_register_bell', hit2 + 0.02, 0.19, {
      playbackRate: 1.16,
      durationSec: 0.38,
    });

    if (crowd) {
      this.playCrowd(ctx, crowd, 'studio_clap', hit1, 0.20, { durationSec: 0.70, attackSec: 0.05 });
      this.playCrowd(ctx, crowd, 'studio_laugh', hit2 + 0.04, 0.22, {
        durationSec: 0.78,
        attackSec: 0.06,
      });
    }
  }

  // --- Skit 7: `CATWALK_MAGNET` ("STICKY FINGERS FROM GRID B!") ---
  private scheduleCatwalkMagnetSkit(
    ctx: AudioContext,
    sfx: AudioNode,
    crowd: AudioNode | null,
    phys: CachedPhysicalBuffers,
    now: number,
    ts: number,
  ): void {
    // Beat 1 (0.00..0.56s): Creaking hemp rigging pulley rope lowering from Fresnel catwalk
    const creaks = [0.03, 0.17, 0.31, 0.45];
    for (let i = 0; i < creaks.length; i++) {
      const at = now + creaks[i] * ts;
      this.playPulleyRopeCreak(ctx, sfx, phys, at, 0.12 * Math.max(0.65, ts), 340 + i * 38, 0.16);
      this.playFoley(ctx, sfx, 'flap_click', at + 0.02, 0.14, {
        playbackRate: 0.82 + i * 0.05,
        durationSec: 0.035,
      });
    }

    // Beat 2 (0.50..1.78s): Humming crimson-and-silver horseshoe electromagnet thrum!
    const magAt = now + 0.50 * ts;
    const magDur = 1.28 * ts;
    this.playElectromagnetThrum(ctx, sfx, phys, magAt, magDur, 0.22);
    this.playInstrument(ctx, sfx, 'vibraphone', 64, magAt + 0.06 * ts, magDur * 0.85, 0.14, {
      pan: -0.22,
    });
    this.playInstrument(ctx, sfx, 'vibraphone', 71, magAt + 0.14 * ts, magDur * 0.80, 0.13, {
      pan: 0.22,
    });

    // Beat 2b (0.98..1.74s): Rapid metallic *CLANK - CLANK - CLANK - SLAM!* as `$` digits stick!
    const clanks = [0.98, 1.16, 1.31, 1.44, 1.56];
    for (let i = 0; i < clanks.length; i++) {
      const at = now + clanks[i] * ts;
      const pan = (i % 2 === 0 ? -1 : 1) * (0.26 - i * 0.04);
      const isFinal = i === clanks.length - 1;

      this.playFoley(ctx, sfx, 'mechanical_clack', at, isFinal ? 0.28 : 0.23, {
        playbackRate: 0.88 + i * 0.07,
        durationSec: 0.072,
        pan,
      });
      this.playDrum(ctx, sfx, 'cowbell', at + 0.004, isFinal ? 0.22 : 0.17, {
        playbackRate: 0.86 + i * 0.09,
        durationSec: 0.11,
        pan: -pan,
      });
      this.playInstrument(ctx, sfx, 'tubular_bell', 72 + i * 2, at + 0.006, 0.18, 0.14, {
        highpassHz: 780,
        pan,
      });
      if (isFinal) {
        this.playDrum(ctx, sfx, 'snare_rim', at + 0.008, 0.20, { playbackRate: 0.94 });
      }
    }

    // Beat 3 (1.80..2.40s): Rapid pulley zip-up back into the Studio 6A rafters!
    const zipAt = now + 1.80 * ts;
    const zipNotes = [64, 67, 71, 74, 79, 83];
    for (let i = 0; i < zipNotes.length; i++) {
      const at = zipAt + i * 0.046 * ts;
      this.playInstrument(ctx, sfx, 'marimba', zipNotes[i], at, 0.12, 0.19, {
        pan: -0.15 + i * 0.06,
      });
      this.playFoley(ctx, sfx, 'flap_click', at, 0.13, {
        playbackRate: 1.30 + i * 0.10,
        durationSec: 0.026,
      });
    }
    this.playFoley(ctx, sfx, 'brush_sweep', zipAt + 0.04 * ts, 0.20, {
      playbackRate: 1.55,
      durationSec: 0.28 * Math.max(0.6, ts),
      highpassHz: 600,
    });

    if (crowd) {
      this.playCrowd(ctx, crowd, 'studio_laugh', zipAt + 0.05 * ts, 0.24, {
        durationSec: 0.82,
        attackSec: 0.06,
      });
    }
  }

  // --- Skit 8: `TIN_UFO` ("CHANNEL 83 OUTER-SPACE HIJACK!") ---
  private scheduleTinUfoSkit(
    ctx: AudioContext,
    sfx: AudioNode,
    crowd: AudioNode | null,
    phys: CachedPhysicalBuffers,
    now: number,
    ts: number,
  ): void {
    // Beat 1 (0.00..1.18s): Classic 1960s sci-fi warbling vibrato tin-toy saucer hover (Stage L -> Center)
    const hoverDur = 1.18 * ts;
    this.playRetroSaucerWarble(ctx, sfx, phys, now + 0.02 * ts, hoverDur, 640, 810, 8.8, 0.20);

    // Bubble space-helmet dome hatch ping at 0.56s
    this.playFoley(ctx, sfx, 'typewriter_bell', now + 0.56 * ts, 0.20, {
      playbackRate: 1.24,
      durationSec: 0.32,
      pan: -0.12,
    });

    // Beat 2 (0.82..1.86s): Shimmering Peacock-Teal vibraphone & glockenspiel tractor-beam chord!
    const beamAt = now + 0.82 * ts;
    const beamWholeTone = [65, 69, 73, 77, 81, 84]; // F augmented / Lydian tractor-beam shimmer
    for (let i = 0; i < beamWholeTone.length; i++) {
      const at = beamAt + i * 0.075 * ts;
      const midi = beamWholeTone[i];
      const pan = ((i % 2 === 0 ? -1 : 1) * (0.16 + i * 0.05));
      this.playInstrument(ctx, sfx, 'vibraphone', midi - 12, at, 0.62 * Math.max(0.55, ts), 0.19, {
        bendToMidi: midi - 10,
        pan,
      });
      this.playInstrument(ctx, sfx, 'glockenspiel', midi, at + 0.012, 0.54 * Math.max(0.55, ts), 0.14, {
        pan: -pan,
      });
    }
    this.playFoley(ctx, sfx, 'sleigh_sparkle', beamAt + 0.10 * ts, 0.20, {
      playbackRate: 1.08,
      durationSec: 0.78 * Math.max(0.55, ts),
      pan: 0.24,
    });
    this.playInstrument(ctx, sfx, 'strings', 69, beamAt + 0.05 * ts, 0.82 * Math.max(0.55, ts), 0.12, {
      bendToMidi: 73,
      highpassHz: 340,
    });

    // Beat 3 (1.86..2.42s): Zip-away outer-space saucer whoosh & starlight wink!
    const zipAt = now + 1.86 * ts;
    const zipDur = 0.42 * Math.max(0.55, ts);
    this.playSaucerZipAway(ctx, sfx, phys, zipAt, zipDur, 0.22);
    this.playFilteredNoiseSweep(ctx, sfx, phys.pinkAir, zipAt, zipDur, {
      filterType: 'bandpass',
      startHz: 620,
      endHz: 3600,
      q: 2.2,
      peakGain: 0.22,
      attackSec: 0.015,
      releaseSec: 0.12,
      panStart: 0.0,
      panEnd: 0.72,
    });
    this.playInstrument(ctx, sfx, 'glockenspiel', MIDI_C6, zipAt + zipDur * 0.72, 0.28, 0.16, {
      pan: 0.62,
    });

    if (crowd) {
      this.playCrowd(ctx, crowd, 'studio_laugh', zipAt - 0.08 * ts, 0.22, {
        durationSec: 0.80,
        attackSec: 0.06,
      });
    }
  }

  // --------------------------------------------------------------------------
  // 3. Popular-Myth Klaxon, Instant Bargain Desk & Center-Stage Rebound Pot
  // --------------------------------------------------------------------------

  /**
   * 4. `playPopularMythKlaxonSiren()`:
   * Iconic *QI*-style `"WHOOP! WHOOP! KLAXON!"` dual-tone vintage motor-driven
   * studio horn siren + acoustic low-brass stabs + timpani roll + crowd `"Ooooh!"`
   * & knowing studio laughter!
   */
  public playPopularMythKlaxonSiren(): void {
    const stage = this.prepareStage();
    if (!stage) return;
    const { ctx, sfxDest, crowdDest, phys } = stage;
    const now = ctx.currentTime;

    // Relay beacon switch snap
    this.playFoley(ctx, sfxDest, 'mechanical_clack', now, 0.22, {
      playbackRate: 0.90,
      durationSec: 0.065,
    });

    // Twin motor-driven diaphragm klaxon horn blasts ("WHOOP! ... WHOOP!")
    this.playVintageMotorKlaxonBlast(ctx, sfxDest, phys, now + 0.01, 0.44, 0.25, -0.18);
    this.playVintageMotorKlaxonBlast(ctx, sfxDest, phys, now + 0.49, 0.52, 0.27, 0.18);

    // Real studio low-brass & trombone reinforcement on both Klaxon blasts!
    const hornHits = [
      { dt: 0.04, trb: 53, trbEnd: 47, brass: 59, dur: 0.38 },
      { dt: 0.52, trb: 52, trbEnd: 46, brass: 58, dur: 0.46 },
    ];
    for (const h of hornHits) {
      const at = now + h.dt;
      this.playInstrument(ctx, sfxDest, 'trombone', h.trb, at, h.dur, 0.24, {
        bendToMidi: h.trbEnd,
        wahSweep: true,
        pan: -0.20,
      });
      this.playInstrument(ctx, sfxDest, 'brass', h.brass, at + 0.01, h.dur * 0.92, 0.20, {
        bendToMidi: h.brass - 3,
        pan: 0.20,
      });
      this.playInstrument(ctx, sfxDest, 'baritone_sax', h.trb - 12, at + 0.01, h.dur * 0.9, 0.18, {
        lowpassHz: 1750,
      });
    }

    // 6-stroke dramatic studio timpani roll across both siren sweeps (0.02..0.94s)
    const rollCount = 6;
    for (let i = 0; i < rollCount; i++) {
      const u = i / (rollCount - 1);
      const at = now + 0.02 + i * 0.165;
      this.playInstrument(
        ctx,
        sfxDest,
        'timpani',
        i % 2 === 0 ? 43 : 48,
        at,
        0.26,
        0.18 + u * 0.09,
        {
          pan: i % 2 === 0 ? -0.16 : 0.16,
          lowpassHz: 540,
        },
      );
    }

    // Collective Studio 6A "Ooooh!" + hearty knowing laughter!
    if (crowdDest) {
      this.playCrowd(ctx, crowdDest, 'cheer_hurray', now + 0.16, 0.25, {
        durationSec: 0.92,
        playbackRate: 0.72,
        lowpassHz: 1180,
        attackSec: 0.05,
        releaseSec: 0.36,
      });
      this.playCrowd(ctx, crowdDest, 'studio_laugh', now + 0.42, 0.30, {
        durationSec: 1.65,
        attackSec: 0.08,
      });
    }
  }

  /**
   * 5a. `playCurtainCallBargainBell()`:
   * *Sale of the Century* rapid 5-strike solenoid/tubular desk-bell ring +
   * inviting trumpet/vibraphone temptation flourish!
   */
  public playCurtainCallBargainBell(): void {
    const stage = this.prepareStage();
    if (!stage) return;
    const { ctx, sfxDest, crowdDest } = stage;
    const now = ctx.currentTime;

    // Rapid 5-strike brass shopkeeper / solenoid desk-bell ring ("DING-ding-ding-ding-DING!")
    const strikes = [
      { dt: 0.00, rate: 1.02, bellMidi: 72, pan: -0.22 },
      { dt: 0.085, rate: 1.10, bellMidi: 77, pan: 0.18 },
      { dt: 0.17, rate: 1.16, bellMidi: 81, pan: -0.16 },
      { dt: 0.255, rate: 1.22, bellMidi: 77, pan: 0.20 },
      { dt: 0.345, rate: 1.28, bellMidi: 84, pan: 0.0 },
    ];
    for (let i = 0; i < strikes.length; i++) {
      const s = strikes[i];
      const at = now + s.dt;
      const isAccent = i === 0 || i === strikes.length - 1;

      this.playFoley(ctx, sfxDest, 'typewriter_bell', at, isAccent ? 0.25 : 0.19, {
        playbackRate: s.rate,
        durationSec: isAccent ? 0.45 : 0.24,
        pan: s.pan,
      });
      if (isAccent) {
        this.playFoley(ctx, sfxDest, 'cash_register_bell', at + 0.008, 0.22, {
          playbackRate: i === 0 ? 1.0 : 1.12,
          durationSec: 0.48,
        });
      }
      this.playInstrument(ctx, sfxDest, 'tubular_bell', s.bellMidi, at + 0.004, 0.42, 0.16, {
        pan: -s.pan,
      });
      this.playInstrument(ctx, sfxDest, 'glockenspiel', s.bellMidi, at + 0.008, 0.32, 0.13, {
        pan: s.pan,
      });
    }

    // Jaunty 2-chord Grant Bellamy temptation horn & vibes pickup!
    this.playInstrument(ctx, sfxDest, 'trumpet', 72, now + 0.22, 0.14, 0.19, { pan: 0.18 });
    this.playInstrument(ctx, sfxDest, 'trumpet', 77, now + 0.35, 0.48, 0.23, { pan: 0.18 });
    this.playInstrument(ctx, sfxDest, 'brass', 65, now + 0.35, 0.46, 0.19, { pan: -0.20 });
    this.playInstrument(ctx, sfxDest, 'vibraphone', 74, now + 0.35, 0.55, 0.18, { pan: 0.24 });

    if (crowdDest) {
      this.playCrowd(ctx, crowdDest, 'cheer_hurray', now + 0.30, 0.20, {
        durationSec: 1.35,
        attackSec: 0.08,
      });
    }
  }

  /**
   * 5b. `playBargainSoldKaChing()`:
   * `"SOLD!"` gavel stamp + mechanical NCR cash-register drawer *KA-CHING!* +
   * 24k gold glockenspiel/bell-tree sparkle & celebratory brass chord!
   */
  public playBargainSoldKaChing(): void {
    const stage = this.prepareStage();
    if (!stage) return;
    const { ctx, sfxDest, crowdDest } = stage;
    const now = ctx.currentTime;

    // 1. Crisp "SOLD!" rubber-stamp / gavel *KA-* drawer latch release (0.00..0.08s)
    this.playFoley(ctx, sfxDest, 'mechanical_clack', now, 0.28, {
      playbackRate: 0.92,
      durationSec: 0.075,
      pan: -0.16,
    });
    this.playInstrument(ctx, sfxDest, 'woodblock', 72, now + 0.005, 0.06, 0.18, { pan: -0.12 });
    this.playFoley(ctx, sfxDest, 'brush_sweep', now + 0.035, 0.18, {
      playbackRate: 1.42,
      durationSec: 0.085,
      highpassHz: 480,
    });

    // 2. Radiant "-CHING!" brass cash-register bell + carriage bell (0.085s)
    const chingAt = now + 0.085;
    this.playFoley(ctx, sfxDest, 'cash_register_bell', chingAt, 0.31, {
      playbackRate: 1.04,
      pan: 0.10,
    });
    this.playFoley(ctx, sfxDest, 'typewriter_bell', chingAt + 0.015, 0.24, {
      playbackRate: 1.18,
      pan: -0.14,
    });
    this.playFoley(ctx, sfxDest, 'sleigh_sparkle', chingAt + 0.03, 0.23, {
      playbackRate: 1.06,
      durationSec: 0.72,
      pan: 0.28,
    });

    // 3. Ascending glockenspiel & vibraphone gold sparkle + warm showband chord!
    const sparkle = [72, 76, 79, 81, 84];
    for (let i = 0; i < sparkle.length; i++) {
      const at = chingAt + 0.02 + i * 0.045;
      const pan = -0.24 + i * 0.12;
      this.playInstrument(ctx, sfxDest, 'glockenspiel', sparkle[i], at, 0.38, 0.16, { pan });
      this.playInstrument(ctx, sfxDest, 'vibraphone', sparkle[i] - 12, at, 0.44, 0.18, {
        pan: -pan,
      });
    }
    this.playInstrument(ctx, sfxDest, 'trumpet', 76, chingAt + 0.12, 0.46, 0.21, { pan: 0.20 });
    this.playInstrument(ctx, sfxDest, 'brass', 67, chingAt + 0.12, 0.46, 0.19, { pan: -0.20 });

    if (crowdDest) {
      this.playCrowd(ctx, crowdDest, 'applause_warm', chingAt + 0.12, 0.24, {
        durationSec: 1.55,
        attackSec: 0.09,
      });
    }
  }

  /**
   * 5c. `playBargainNoSalePass()`:
   * Polite, classy 1966 game-show muted-brass & vibraphone `"No Sale"` sting
   * when the player smartly protects their live scoreboard lead!
   */
  public playBargainNoSalePass(): void {
    const stage = this.prepareStage();
    if (!stage) return;
    const { ctx, sfxDest } = stage;
    const now = ctx.currentTime;

    // Tactile desk pass-button click + soft brush settle
    this.playFoley(ctx, sfxDest, 'flap_click', now, 0.20, {
      playbackRate: 1.08,
      durationSec: 0.04,
    });
    this.playDrum(ctx, sfxDest, 'snare_brush', now + 0.015, 0.14, {
      playbackRate: 0.96,
      durationSec: 0.16,
      lowpassHz: 2900,
    });

    // Suave 2-note polite muted-brass nod (A4 -> F4 major-3rd -> tonic warm cadence)
    const notes = [
      { dt: 0.03, trp: 69, trb: 57, vibes: 72, dur: 0.15 },
      { dt: 0.19, trp: 65, trb: 53, vibes: 69, dur: 0.34 },
    ];
    for (const n of notes) {
      const at = now + n.dt;
      this.playInstrument(ctx, sfxDest, 'muted_trumpet', n.trp, at, n.dur, 0.21, {
        wahSweep: true,
        pan: 0.16,
        lowpassHz: 2550,
      });
      this.playInstrument(ctx, sfxDest, 'trombone', n.trb, at + 0.005, n.dur * 1.05, 0.18, {
        pan: -0.18,
        lowpassHz: 1950,
      });
      this.playInstrument(ctx, sfxDest, 'vibraphone', n.vibes, at, n.dur * 1.15, 0.16, {
        pan: 0.20,
      });
    }
  }

  /**
   * 6a. `playReboundPotDrop()`:
   * Heavy 90%-silver dollar coin clinking and settling into the illuminated
   * center-stage cut-glass Rebound Pot bowl on a missed clue!
   */
  public playReboundPotDrop(): void {
    const stage = this.prepareStage();
    if (!stage) return;
    const { ctx, sfxDest } = stage;
    const now = ctx.currentTime;

    // 1. Primary heavy silver dollar rim strike against thick cut-glass jackpot bowl
    this.playSilverCoinGlassClink(ctx, sfxDest, now, 1.0, 0.26, 0.0);
    this.playFoley(ctx, sfxDest, 'typewriter_bell', now + 0.003, 0.20, {
      playbackRate: 1.38,
      durationSec: 0.28,
      highpassHz: 1350,
    });
    this.playFoley(ctx, sfxDest, 'flap_click', now, 0.18, {
      playbackRate: 1.55,
      durationSec: 0.03,
    });

    // 2. Accelerating coin-spin wobble bounces settling onto existing coins in the glass bowl!
    const bounces = [
      { dt: 0.115, pitch: 1.08, gain: 0.19, pan: -0.10 },
      { dt: 0.195, pitch: 1.17, gain: 0.15, pan: 0.10 },
      { dt: 0.252, pitch: 1.27, gain: 0.12, pan: -0.07 },
      { dt: 0.292, pitch: 1.38, gain: 0.095, pan: 0.06 },
      { dt: 0.320, pitch: 1.50, gain: 0.075, pan: 0.0 },
    ];
    for (const b of bounces) {
      const at = now + b.dt;
      this.playSilverCoinGlassClink(ctx, sfxDest, at, b.pitch, b.gain, b.pan);
      this.playFoley(ctx, sfxDest, 'flap_click', at, b.gain * 0.72, {
        playbackRate: 1.45 * b.pitch,
        durationSec: 0.024,
        pan: b.pan,
      });
    }

    // 3. Subtle warm golden-bowl vibraphone shimmer signaling "+$100 NEXT HIT!"
    this.playInstrument(ctx, sfxDest, 'vibraphone', 72, now + 0.06, 0.48, 0.15, {
      pan: -0.12,
    });
    this.playInstrument(ctx, sfxDest, 'glockenspiel', 79, now + 0.12, 0.42, 0.12, {
      pan: 0.12,
    });
  }

  /**
   * 6b. `playReboundPotScoop()`:
   * Cascading silver-dollar jackpot coin pour + Solari tote ticks + triumphant
   * 1966 showband brass stab when a contestant scoops the Rebound Pot!
   */
  public playReboundPotScoop(): void {
    const stage = this.prepareStage();
    if (!stage) return;
    const { ctx, sfxDest, crowdDest } = stage;
    const now = ctx.currentTime;

    // 1. Cascading 10-coin silver-dollar jackpot pour across stereo field (0.00..0.54s)
    const pentatonic = [72, 74, 76, 79, 81, 84, 79, 81, 84, 84];
    for (let i = 0; i < pentatonic.length; i++) {
      const u = i / (pentatonic.length - 1);
      const at = now + i * 0.052;
      const pan = -0.38 + u * 0.76;

      this.playSilverCoinGlassClink(ctx, sfxDest, at, 1.04 + (i % 4) * 0.11, 0.16, pan);
      this.playFoley(ctx, sfxDest, 'flap_click', at + 0.004, 0.15, {
        playbackRate: 1.28 + u * 0.42,
        durationSec: 0.030,
        pan: -pan * 0.5,
      });
      this.playInstrument(ctx, sfxDest, 'glockenspiel', pentatonic[i], at + 0.006, 0.24, 0.13, {
        pan,
      });
      if (i % 2 === 0) {
        this.playInstrument(ctx, sfxDest, 'vibraphone', pentatonic[i] - 12, at, 0.28, 0.15, {
          pan: -pan,
        });
      }
    }

    this.playFoley(ctx, sfxDest, 'cash_register_bell', now + 0.04, 0.25, {
      playbackRate: 1.06,
      pan: -0.18,
    });
    this.playFoley(ctx, sfxDest, 'sleigh_sparkle', now + 0.16, 0.23, {
      playbackRate: 1.08,
      durationSec: 0.78,
      pan: 0.26,
    });

    // 2. Triumphant 1966 Tijuana-Brass / Prime-Time Jackpot Horn Stab (0.20..0.95s)!
    const pickupAt = now + 0.18;
    const stabAt = now + 0.30;
    this.playDrum(ctx, sfxDest, 'snare_stick', pickupAt, 0.18, { pan: -0.12 });
    this.playInstrument(ctx, sfxDest, 'trumpet', 72, pickupAt, 0.11, 0.21, { pan: 0.20 });
    this.playInstrument(ctx, sfxDest, 'brass', 65, pickupAt, 0.11, 0.18, { pan: -0.20 });

    this.playInstrument(ctx, sfxDest, 'trumpet', 77, stabAt, 0.62, 0.26, { pan: 0.22 });
    this.playInstrument(ctx, sfxDest, 'trumpet', 72, stabAt + 0.008, 0.58, 0.19, { pan: -0.18 });
    this.playInstrument(ctx, sfxDest, 'brass', 69, stabAt, 0.60, 0.22, { pan: -0.24 });
    this.playInstrument(ctx, sfxDest, 'trombone', 53, stabAt, 0.60, 0.20, { pan: 0.24 });
    this.playInstrument(ctx, sfxDest, 'upright_bass', 41, stabAt, 0.58, 0.24, { lowpassHz: 620 });
    this.playDrum(ctx, sfxDest, 'crash', stabAt, 0.18, { durationSec: 0.92, pan: -0.28 });
    this.playDrum(ctx, sfxDest, 'kick', stabAt, 0.20);

    if (crowdDest) {
      this.playCrowd(ctx, crowdDest, 'cheer_hurray', now + 0.22, 0.26, {
        durationSec: 1.55,
        attackSec: 0.08,
      });
      this.playCrowd(ctx, crowdDest, 'applause_warm', now + 0.32, 0.22, {
        durationSec: 1.65,
        attackSec: 0.10,
      });
    }
  }

  // --------------------------------------------------------------------------
  // 4. Lifecycle, Sub-Bus Mastering & Clean Voice Disposal
  // --------------------------------------------------------------------------

  /** Smoothly fades out and cleans up all active scheduled voices. */
  public stopAll(fadeSec = 0.035): void {
    this.stopActiveSkit(fadeSec);
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const dur = clamp(fadeSec, 0.01, 0.20);
    for (const v of this.activeVoices) {
      if (v.cleaned) continue;
      v.cleaned = true;
      try {
        v.envGain.gain.cancelScheduledValues(now);
        v.envGain.gain.setValueAtTime(Math.max(0.0001, v.envGain.gain.value), now);
        v.envGain.gain.linearRampToValueAtTime(0.0, now + dur);
        v.primarySource.stop(now + dur + 0.012);
        for (const extra of v.extraSources) {
          try {
            extra.stop(now + dur + 0.012);
          } catch {
            // already stopped
          }
        }
      } catch {
        // already ended
      }
    }
    this.activeVoices.length = 0;
  }

  public dispose(): void {
    if (this.disposed) return;
    this.stopAll(0.02);
    this.disposed = true;
    if (this.subChain) {
      this.subChain.dispose();
      this.subChain = null;
    }
  }

  // --------------------------------------------------------------------------
  // 5. Internal Sample & Physical Soundstage Primitives
  // --------------------------------------------------------------------------

  private prepareStage(): {
    ctx: AudioContext;
    sfxDest: AudioNode;
    crowdDest: AudioNode | null;
    phys: CachedPhysicalBuffers;
  } | null {
    if (this.disposed) return null;
    const ctx = this.getContext();
    const sfxTarget = this.getSfxBus();
    if (!ctx || !sfxTarget) return null;

    if (ctx.state === 'suspended' && 'close' in ctx) {
      void ctx.resume().catch(() => {
        // Browser gesture policy will unlock on user interaction
      });
    }

    if (!this.samplePack.isLoaded()) {
      void this.samplePack.loadCoreAndBackgroundAll(ctx);
    }

    const crowdTarget = this.getCrowdBus();
    const chain = this.ensureSubChain(ctx, sfxTarget, crowdTarget);
    let phys = this.bufferCache.get(ctx);
    if (!phys) {
      phys = buildCachedPhysicalBuffers(ctx);
      this.bufferCache.set(ctx, phys);
    }

    this.pruneFinishedVoices(ctx.currentTime);

    return {
      ctx,
      sfxDest: chain.sfxInput,
      crowdDest: crowdTarget ? chain.crowdInput : null,
      phys,
    };
  }

  /**
   * Builds (or re-targets) the dedicated Cartoon Foley & Showpiece Sub-Bus:
   * - 28Hz Butterworth DC-Blocker HPF (guarantees zero DC offset / clicks)
   * - Fast transparent broadcast transient guard compressor
   * - C1-continuous soft-knee WaveShaper strictly capping peaks <= 0.80 linear (< 0.85 DoD!)
   */
  private ensureSubChain(
    ctx: AudioContext,
    sfxTarget: AudioNode,
    crowdTarget: AudioNode | null,
  ): SubBusChain {
    if (this.subChain && this.subChain.ctx === ctx) {
      if (this.subChain.sfxTarget !== sfxTarget) {
        try {
          this.subChain.sfxOut.disconnect();
        } catch {
          // ignore
        }
        this.subChain.sfxOut.connect(sfxTarget);
        this.subChain.sfxTarget = sfxTarget;
      }
      if (this.subChain.crowdTarget !== crowdTarget) {
        try {
          this.subChain.crowdOut.disconnect();
        } catch {
          // ignore
        }
        if (crowdTarget) {
          this.subChain.crowdOut.connect(crowdTarget);
        }
        this.subChain.crowdTarget = crowdTarget;
      }
      return this.subChain;
    }

    if (this.subChain) {
      this.subChain.dispose();
      this.subChain = null;
    }

    // SFX safety sub-chain (bounded <= 0.80 linear)
    const sfxInput = ctx.createGain();
    sfxInput.gain.value = 1.0;

    const sfxDcHp = ctx.createBiquadFilter();
    sfxDcHp.type = 'highpass';
    sfxDcHp.frequency.value = 28;
    sfxDcHp.Q.value = 0.707;

    const sfxGuardComp = ctx.createDynamicsCompressor();
    sfxGuardComp.threshold.value = -5.5;
    sfxGuardComp.knee.value = 4.0;
    sfxGuardComp.ratio.value = 14.0;
    sfxGuardComp.attack.value = 0.001;
    sfxGuardComp.release.value = 0.085;

    const sfxCeiling = ctx.createWaveShaper();
    sfxCeiling.curve = createSoftKneeCeilingCurve(0.50, FOLEY_MAX_PEAK_LINEAR, 1024);
    sfxCeiling.oversample = '2x';

    const sfxOut = ctx.createGain();
    sfxOut.gain.value = 0.96;

    sfxInput.connect(sfxDcHp);
    sfxDcHp.connect(sfxGuardComp);
    sfxGuardComp.connect(sfxCeiling);
    sfxCeiling.connect(sfxOut);
    sfxOut.connect(sfxTarget);

    // Crowd safety sub-chain (bounded <= 0.74 linear)
    const crowdInput = ctx.createGain();
    crowdInput.gain.value = 1.0;

    const crowdDcHp = ctx.createBiquadFilter();
    crowdDcHp.type = 'highpass';
    crowdDcHp.frequency.value = 75;
    crowdDcHp.Q.value = 0.707;

    const crowdCeiling = ctx.createWaveShaper();
    crowdCeiling.curve = createSoftKneeCeilingCurve(0.46, CROWD_MAX_PEAK_LINEAR, 1024);

    const crowdOut = ctx.createGain();
    crowdOut.gain.value = 0.95;

    crowdInput.connect(crowdDcHp);
    crowdDcHp.connect(crowdCeiling);
    crowdCeiling.connect(crowdOut);
    if (crowdTarget) {
      crowdOut.connect(crowdTarget);
    }

    const chain: SubBusChain = {
      ctx,
      sfxTarget,
      crowdTarget,
      sfxInput,
      sfxOut,
      crowdInput,
      crowdOut,
      dispose: () => {
        for (const n of [
          sfxInput,
          sfxDcHp,
          sfxGuardComp,
          sfxCeiling,
          sfxOut,
          crowdInput,
          crowdDcHp,
          crowdCeiling,
          crowdOut,
        ]) {
          try {
            n.disconnect();
          } catch {
            // ignore
          }
        }
      },
    };
    this.subChain = chain;
    return chain;
  }

  private pruneFinishedVoices(now: number): void {
    for (let i = this.activeVoices.length - 1; i >= 0; i--) {
      const v = this.activeVoices[i];
      if (v.cleaned || now > v.endTime + 0.08) {
        this.cleanupVoiceNodes(v);
        this.activeVoices.splice(i, 1);
      }
    }
  }

  private cleanupVoiceNodes(v: ActiveFoleyVoice): void {
    if (v.cleaned) return;
    v.cleaned = true;
    for (const node of v.disconnectNodes) {
      try {
        node.disconnect();
      } catch {
        // ignore
      }
    }
  }

  private allocateVoiceSlot(ctx: AudioContext): boolean {
    const now = ctx.currentTime;
    this.pruneFinishedVoices(now);
    if (this.activeVoices.length < MAX_ACTIVE_FOLEY_VOICES) return true;

    // Steal oldest voice smoothly (8ms linear fade to 0.0) without clicking
    const oldest = this.activeVoices.shift();
    if (oldest && !oldest.cleaned) {
      oldest.cleaned = true;
      try {
        oldest.envGain.gain.cancelScheduledValues(now);
        oldest.envGain.gain.setValueAtTime(Math.max(0.0001, oldest.envGain.gain.value), now);
        oldest.envGain.gain.linearRampToValueAtTime(0.0, now + 0.008);
        oldest.primarySource.stop(now + 0.014);
        for (const extra of oldest.extraSources) {
          try {
            extra.stop(now + 0.014);
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    }
    return true;
  }

  private registerVoice(
    startTime: number,
    endTime: number,
    envGain: GainNode,
    primarySource: AudioScheduledSourceNode,
    extraSources: readonly AudioScheduledSourceNode[],
    disconnectNodes: readonly AudioNode[],
  ): void {
    const voice: ActiveFoleyVoice = {
      id: ++this.voiceSeq,
      startTime,
      endTime,
      envGain,
      primarySource,
      extraSources,
      disconnectNodes,
      cleaned: false,
    };
    this.activeVoices.push(voice);

    primarySource.onended = () => {
      this.cleanupVoiceNodes(voice);
      const idx = this.activeVoices.indexOf(voice);
      if (idx >= 0) {
        this.activeVoices.splice(idx, 1);
      }
    };
  }

  /**
   * Sample-accurate zero-click `AudioBuffer` player with optional pitch-bend,
   * 1966 rubber plunger-mute `wahSweep`, HPF/LPF sculpting, and stereo pan.
   */
  private triggerSampleBuffer(
    ctx: AudioContext,
    dest: AudioNode,
    buf: AudioBuffer | null,
    when: number,
    gain: number,
    opts?: {
      playbackRate?: number;
      endPlaybackRate?: number;
      durationSec?: number;
      attackSec?: number;
      releaseSec?: number;
      lowpassHz?: number;
      highpassHz?: number;
      wahSweep?: boolean;
      pan?: number;
    },
  ): boolean {
    if (!buf || gain <= 0.0002) return false;
    if (!this.allocateVoiceSlot(ctx)) return false;

    const safeGain = clamp(gain, 0.0002, 0.65);
    const rate = clamp(opts?.playbackRate ?? 1.0, 0.25, 4.0);
    const maxBufDur = Math.max(0.018, buf.duration / rate);
    const playDur = opts?.durationSec
      ? Math.min(maxBufDur, Math.max(0.018, opts.durationSec))
      : maxBufDur;

    const startAt = Math.max(ctx.currentTime, when);
    const endAt = startAt + playDur;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.setValueAtTime(rate, startAt);
    if (opts?.endPlaybackRate && Math.abs(opts.endPlaybackRate - rate) > 0.002) {
      src.playbackRate.exponentialRampToValueAtTime(
        clamp(opts.endPlaybackRate, 0.25, 4.0),
        endAt,
      );
    }

    const nodesToClean: AudioNode[] = [src];
    let tail: AudioNode = src;

    if (opts?.highpassHz && opts.highpassHz > 25) {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(opts.highpassHz, startAt);
      tail.connect(hp);
      tail = hp;
      nodesToClean.push(hp);
    }

    if (opts?.lowpassHz && opts.lowpassHz > 120) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(opts.lowpassHz, startAt);
      tail.connect(lp);
      tail = lp;
      nodesToClean.push(lp);
    }

    if (opts?.wahSweep) {
      // Authentic 1966 Studio Rubber Plunger-Mute "WAH-uh!" Formant Sweep
      const openAt = startAt + Math.min(0.095, playDur * 0.35);
      const wahPeak = ctx.createBiquadFilter();
      wahPeak.type = 'peaking';
      wahPeak.Q.setValueAtTime(2.6, startAt);
      wahPeak.gain.setValueAtTime(8.0, startAt);
      wahPeak.frequency.setValueAtTime(460, startAt);
      wahPeak.frequency.exponentialRampToValueAtTime(1800, openAt);
      wahPeak.frequency.exponentialRampToValueAtTime(430, endAt);

      const wahLp = ctx.createBiquadFilter();
      wahLp.type = 'lowpass';
      wahLp.Q.setValueAtTime(1.25, startAt);
      wahLp.frequency.setValueAtTime(840, startAt);
      wahLp.frequency.exponentialRampToValueAtTime(3100, openAt);
      wahLp.frequency.exponentialRampToValueAtTime(640, endAt);

      tail.connect(wahPeak);
      wahPeak.connect(wahLp);
      tail = wahLp;
      nodesToClean.push(wahPeak, wahLp);
    }

    if (
      typeof opts?.pan === 'number' &&
      Math.abs(opts.pan) > 0.01 &&
      typeof ctx.createStereoPanner === 'function'
    ) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(clamp(opts.pan, -1, 1), startAt);
      tail.connect(panner);
      tail = panner;
      nodesToClean.push(panner);
    }

    const env = ctx.createGain();
    const attack = clamp(opts?.attackSec ?? 0.0025, 0.0015, playDur * 0.35);
    const release = clamp(opts?.releaseSec ?? 0.045, 0.008, playDur * 0.65);
    const relStart = Math.max(startAt + attack + 0.002, endAt - release);

    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(safeGain, startAt + attack);
    env.gain.setValueAtTime(safeGain, relStart);
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    tail.connect(env);
    env.connect(dest);
    nodesToClean.push(env);

    src.start(startAt);
    src.stop(endAt + 0.014);

    this.registerVoice(startAt, endAt + 0.014, env, src, [], nodesToClean);
    return true;
  }

  private playInstrument(
    ctx: AudioContext,
    dest: AudioNode,
    instrumentId: AcousticInstrumentIdV7,
    midiNote: number,
    when: number,
    durationSec: number,
    gain: number,
    opts?: {
      pan?: number;
      lowpassHz?: number;
      highpassHz?: number;
      bendToMidi?: number;
      wahSweep?: boolean;
    },
  ): void {
    const pick = this.samplePack.pickZoneWithFallback(instrumentId, midiNote);
    if (!pick) {
      // Cold-stream micro-fallback (<200ms before MP3 manifest finishes decoding):
      // gentle warm band-limited percussive/reed body so unit/cold-boot calls never drop silent
      this.playColdStreamBodyFallback(ctx, dest, instrumentId, midiNote, when, durationSec, gain, opts);
      return;
    }

    const endRate =
      typeof opts?.bendToMidi === 'number'
        ? Math.pow(2, (opts.bendToMidi - pick.rootMidi) / 12)
        : undefined;

    this.triggerSampleBuffer(ctx, dest, pick.buffer, when, gain, {
      playbackRate: pick.playbackRate,
      endPlaybackRate: endRate,
      durationSec,
      attackSec: instrumentId === 'strings' ? 0.045 : 0.0025,
      releaseSec:
        instrumentId === 'timpani' || instrumentId === 'tubular_bell'
          ? 0.14
          : 0.065,
      lowpassHz: opts?.lowpassHz,
      highpassHz: opts?.highpassHz,
      wahSweep: opts?.wahSweep,
      pan: opts?.pan,
    });
  }

  private playDrum(
    ctx: AudioContext,
    dest: AudioNode,
    drumId: string,
    when: number,
    gain: number,
    opts?: {
      playbackRate?: number;
      durationSec?: number;
      pan?: number;
      lowpassHz?: number;
      highpassHz?: number;
    },
  ): void {
    const buf = this.samplePack.getDrum(drumId);
    if (!buf) return;
    this.triggerSampleBuffer(ctx, dest, buf, when, gain, {
      playbackRate: opts?.playbackRate ?? 1.0,
      durationSec: opts?.durationSec,
      attackSec: 0.0015,
      releaseSec: 0.035,
      pan: opts?.pan,
      lowpassHz: opts?.lowpassHz,
      highpassHz: opts?.highpassHz,
    });
  }

  private playFoley(
    ctx: AudioContext,
    dest: AudioNode,
    foleyId: string,
    when: number,
    gain: number,
    opts?: {
      playbackRate?: number;
      durationSec?: number;
      pan?: number;
      lowpassHz?: number;
      highpassHz?: number;
    },
  ): boolean {
    const buf = this.samplePack.getFoley(foleyId);
    if (!buf) return false;
    return this.triggerSampleBuffer(ctx, dest, buf, when, gain, {
      playbackRate: opts?.playbackRate ?? 1.0,
      durationSec: opts?.durationSec,
      attackSec: 0.0015,
      releaseSec: 0.030,
      pan: opts?.pan,
      lowpassHz: opts?.lowpassHz,
      highpassHz: opts?.highpassHz,
    });
  }

  private playCrowd(
    ctx: AudioContext,
    crowdDest: AudioNode,
    crowdId: CrowdSampleId,
    when: number,
    gain: number,
    opts?: {
      durationSec?: number;
      playbackRate?: number;
      lowpassHz?: number;
      attackSec?: number;
      releaseSec?: number;
    },
  ): void {
    const buf =
      this.samplePack.getCrowd(crowdId) ??
      this.samplePack.getCrowd('applause_warm') ??
      this.samplePack.getCrowd('studio_clap');
    if (!buf) return;

    this.triggerSampleBuffer(ctx, crowdDest, buf, when, gain, {
      playbackRate: opts?.playbackRate ?? 1.0,
      durationSec: opts?.durationSec ?? Math.min(2.2, buf.duration),
      attackSec: opts?.attackSec ?? 0.06,
      releaseSec: opts?.releaseSec ?? 0.38,
      lowpassHz: opts?.lowpassHz ?? 7200,
      highpassHz: 110,
    });
  }

  // --------------------------------------------------------------------------
  // 6. Authentic 1966 Mechanical, Pneumatic & Spring Soundstage Contraptions
  // --------------------------------------------------------------------------

  /** Creates a short-lived 24..28Hz flutter-tongue modulator node for brass foghorn blasts. */
  private createFlutterGrowlNode(
    ctx: AudioContext,
    dest: AudioNode,
    when: number,
    durationSec: number,
    flutterHz: number,
    depth: number,
  ): AudioNode {
    if (!this.allocateVoiceSlot(ctx)) return dest;

    const startAt = Math.max(ctx.currentTime, when);
    const endAt = startAt + Math.max(0.08, durationSec);

    const modBus = ctx.createGain();
    modBus.gain.setValueAtTime(1.0 - depth * 0.5, startAt);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(flutterHz, startAt);

    const lfoDepth = ctx.createGain();
    lfoDepth.gain.setValueAtTime(depth, startAt);
    lfoDepth.gain.linearRampToValueAtTime(0.0, endAt);

    const env = ctx.createGain();
    env.gain.setValueAtTime(1.0, startAt);
    env.gain.setValueAtTime(1.0, Math.max(startAt + 0.02, endAt - 0.04));
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    lfo.connect(lfoDepth);
    lfoDepth.connect(modBus.gain);
    modBus.connect(env);
    env.connect(dest);

    lfo.start(startAt);
    lfo.stop(endAt + 0.014);

    this.registerVoice(startAt, endAt + 0.014, env, lfo, [], [lfo, lfoDepth, modBus, env]);
    return modBus;
  }

  /**
   * Physical 1960s Edwards 60Hz/120Hz AC Magnetic Vibrating-Armature Studio Buzzer
   * routed through Bakelite horn cabinet resonance (zero 8-bit square-wave bleeps!).
   */
  private playAcMagneticBuzzer(
    ctx: AudioContext,
    dest: AudioNode,
    phys: CachedPhysicalBuffers,
    when: number,
    durationSec: number,
    peakGain: number,
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const endAt = startAt + Math.max(0.08, durationSec);

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const oscHarm = ctx.createOscillator();
    oscA.type = 'sawtooth';
    oscB.type = 'sawtooth';
    oscHarm.type = 'sawtooth';
    oscA.frequency.setValueAtTime(118.5, startAt);
    oscB.frequency.setValueAtTime(124.4, startAt);
    oscHarm.frequency.setValueAtTime(180.0, startAt);

    const rattleLfo = ctx.createOscillator();
    rattleLfo.type = 'sine';
    rattleLfo.frequency.setValueAtTime(32, startAt);
    const rattleGain = ctx.createGain();
    rattleGain.gain.setValueAtTime(peakGain * 0.28, startAt);
    rattleGain.gain.linearRampToValueAtTime(0.0, endAt);

    const shaper = ctx.createWaveShaper();
    shaper.curve = phys.hardBuzzCurve;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(105, startAt);

    const hornPeak = ctx.createBiquadFilter();
    hornPeak.type = 'peaking';
    hornPeak.frequency.setValueAtTime(550, startAt);
    hornPeak.Q.setValueAtTime(1.4, startAt);
    hornPeak.gain.setValueAtTime(5.5, startAt);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1580, startAt);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(peakGain, startAt + 0.010);
    env.gain.setValueAtTime(peakGain * 0.90, Math.max(startAt + 0.02, endAt - 0.04));
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    oscA.connect(shaper);
    oscB.connect(shaper);
    oscHarm.connect(shaper);
    shaper.connect(hp);
    hp.connect(hornPeak);
    hornPeak.connect(lp);
    lp.connect(env);
    rattleLfo.connect(rattleGain);
    rattleGain.connect(env.gain);
    env.connect(dest);

    oscA.start(startAt);
    oscB.start(startAt);
    oscHarm.start(startAt);
    rattleLfo.start(startAt);

    const stopAt = endAt + 0.014;
    oscA.stop(stopAt);
    oscB.stop(stopAt);
    oscHarm.stop(stopAt);
    rattleLfo.stop(stopAt);

    this.registerVoice(
      startAt,
      stopAt,
      env,
      oscA,
      [oscB, oscHarm, rattleLfo],
      [oscA, oscB, oscHarm, rattleLfo, rattleGain, shaper, hp, hornPeak, lp, env],
    );
  }

  /**
   * Physical Treg Brown / Hanna-Barbera Helical Steel Coil & Jaw-Harp `*BOING-oing-oing!*`:
   * Plucked reed twang through an oscillating vocal-tract formant resonator (`12.5 Hz` bounce).
   */
  private playJawHarpCoilSpring(
    ctx: AudioContext,
    dest: AudioNode,
    phys: CachedPhysicalBuffers,
    when: number,
    baseHz: number,
    durationSec: number,
    peakGain: number,
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = Math.max(0.18, durationSec);
    const endAt = startAt + dur;

    // Plucked spring reed fundamental bending upward ("BOI-") then settling ("-oing-oing!")
    const reedOsc = ctx.createOscillator();
    reedOsc.type = 'sawtooth';
    reedOsc.frequency.setValueAtTime(baseHz * 0.92, startAt);
    reedOsc.frequency.exponentialRampToValueAtTime(baseHz * 1.32, startAt + 0.085);
    reedOsc.frequency.exponentialRampToValueAtTime(baseHz * 1.12, endAt);

    // Elastic coil pitch-wobble LFO (12.5 Hz decaying spring oscillation)
    const springLfo = ctx.createOscillator();
    springLfo.type = 'sine';
    springLfo.frequency.setValueAtTime(12.5, startAt);
    springLfo.frequency.linearRampToValueAtTime(9.5, endAt);

    const pitchWobble = ctx.createGain();
    pitchWobble.gain.setValueAtTime(baseHz * 0.085, startAt);
    pitchWobble.gain.exponentialRampToValueAtTime(0.4, endAt);

    // Jaw-harp mouth-cavity formant filter ("BOI-oi-oi-oing!" vowel bounce)
    const formantBp = ctx.createBiquadFilter();
    formantBp.type = 'peaking';
    formantBp.Q.setValueAtTime(5.2, startAt);
    formantBp.gain.setValueAtTime(11.0, startAt);
    formantBp.frequency.setValueAtTime(420, startAt);
    formantBp.frequency.exponentialRampToValueAtTime(1880, startAt + 0.08);
    formantBp.frequency.exponentialRampToValueAtTime(760, endAt);

    const formantWobble = ctx.createGain();
    formantWobble.gain.setValueAtTime(420, startAt + 0.06);
    formantWobble.gain.exponentialRampToValueAtTime(18, endAt);

    const shaper = ctx.createWaveShaper();
    shaper.curve = phys.warmTubeCurve;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2950, startAt);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(peakGain, startAt + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    springLfo.connect(pitchWobble);
    pitchWobble.connect(reedOsc.frequency);
    springLfo.connect(formantWobble);
    formantWobble.connect(formantBp.frequency);

    reedOsc.connect(formantBp);
    formantBp.connect(shaper);
    shaper.connect(lp);
    lp.connect(env);
    env.connect(dest);

    reedOsc.start(startAt);
    springLfo.start(startAt);
    reedOsc.stop(endAt + 0.014);
    springLfo.stop(endAt + 0.014);

    this.registerVoice(
      startAt,
      endAt + 0.014,
      env,
      reedOsc,
      [springLfo],
      [reedOsc, springLfo, pitchWobble, formantWobble, formantBp, shaper, lp, env],
    );
  }

  /**
   * 1966 Foley-Stage Wooden Piston / Lotus Slide-Whistle:
   * Combines warm wooden-bore triangle fundamental + breathy air-edge chiff noise
   * tracking the exact slide pitch so it sounds like a physical prop whistle!
   */
  private playWoodenSlideWhistle(
    ctx: AudioContext,
    dest: AudioNode,
    phys: CachedPhysicalBuffers,
    when: number,
    durationSec: number,
    startHz: number,
    midHz: number,
    endHz: number,
    peakGain: number,
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = Math.max(0.12, durationSec);
    const midAt = startAt + dur * 0.52;
    const endAt = startAt + dur;

    const boreOsc = ctx.createOscillator();
    boreOsc.type = 'triangle';
    boreOsc.frequency.setValueAtTime(startHz, startAt);
    boreOsc.frequency.exponentialRampToValueAtTime(midHz, midAt);
    boreOsc.frequency.exponentialRampToValueAtTime(endHz, endAt);

    // Subtle breathy fipple air-edge layer tracking the wooden whistle bore
    const breathSrc = ctx.createBufferSource();
    breathSrc.buffer = phys.pinkAir;
    breathSrc.loop = true;

    const breathBp = ctx.createBiquadFilter();
    breathBp.type = 'bandpass';
    breathBp.Q.setValueAtTime(7.5, startAt);
    breathBp.frequency.setValueAtTime(startHz * 2, startAt);
    breathBp.frequency.exponentialRampToValueAtTime(midHz * 2, midAt);
    breathBp.frequency.exponentialRampToValueAtTime(endHz * 2, endAt);

    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(0.32, startAt);

    const boreLp = ctx.createBiquadFilter();
    boreLp.type = 'lowpass';
    boreLp.frequency.setValueAtTime(2600, startAt);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(peakGain, startAt + 0.018);
    env.gain.setValueAtTime(peakGain * 0.88, Math.max(startAt + 0.03, endAt - 0.05));
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    boreOsc.connect(boreLp);
    breathSrc.connect(breathBp);
    breathBp.connect(breathGain);
    breathGain.connect(boreLp);
    boreLp.connect(env);
    env.connect(dest);

    boreOsc.start(startAt);
    breathSrc.start(startAt);
    boreOsc.stop(endAt + 0.014);
    breathSrc.stop(endAt + 0.014);

    this.registerVoice(
      startAt,
      endAt + 0.014,
      env,
      boreOsc,
      [breathSrc],
      [boreOsc, breathSrc, breathBp, breathGain, boreLp, env],
    );
  }

  /** Swept filtered pink-air or fuse-crackle noise for Hoover suction, soot pops & whooshes. */
  private playFilteredNoiseSweep(
    ctx: AudioContext,
    dest: AudioNode,
    buffer: AudioBuffer,
    when: number,
    durationSec: number,
    opts: {
      filterType: 'bandpass' | 'lowpass' | 'highpass';
      startHz: number;
      endHz: number;
      q: number;
      peakGain: number;
      attackSec: number;
      releaseSec: number;
      panStart?: number;
      panEnd?: number;
    },
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = Math.max(0.06, durationSec);
    const endAt = startAt + dur;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = opts.filterType;
    filter.Q.setValueAtTime(opts.q, startAt);
    filter.frequency.setValueAtTime(clamp(opts.startHz, 40, 12000), startAt);
    filter.frequency.exponentialRampToValueAtTime(clamp(opts.endHz, 40, 12000), endAt);

    const nodes: AudioNode[] = [src, filter];
    let tail: AudioNode = filter;
    src.connect(filter);

    if (
      typeof opts.panStart === 'number' &&
      typeof ctx.createStereoPanner === 'function'
    ) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(clamp(opts.panStart, -1, 1), startAt);
      if (typeof opts.panEnd === 'number') {
        panner.pan.linearRampToValueAtTime(clamp(opts.panEnd, -1, 1), endAt);
      }
      tail.connect(panner);
      tail = panner;
      nodes.push(panner);
    }

    const env = ctx.createGain();
    const atk = clamp(opts.attackSec, 0.004, dur * 0.45);
    const rel = clamp(opts.releaseSec, 0.015, dur * 0.65);
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(opts.peakGain, startAt + atk);
    env.gain.setValueAtTime(opts.peakGain * 0.92, Math.max(startAt + atk + 0.004, endAt - rel));
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    tail.connect(env);
    env.connect(dest);
    nodes.push(env);

    src.start(startAt);
    src.stop(endAt + 0.014);

    this.registerVoice(startAt, endAt + 0.014, env, src, [], nodes);
  }

  /** Vacuum turbine spin-up or scoreboard power-down motor whir through warm tube saturation. */
  private playTurbineMotorWhir(
    ctx: AudioContext,
    dest: AudioNode,
    phys: CachedPhysicalBuffers,
    when: number,
    durationSec: number,
    startHz: number,
    endHz: number,
    peakGain: number,
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = Math.max(0.10, durationSec);
    const endAt = startAt + dur;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(startHz, startAt);
    osc1.frequency.exponentialRampToValueAtTime(Math.max(32, endHz), endAt);
    osc2.frequency.setValueAtTime(startHz * 1.5, startAt);
    osc2.frequency.exponentialRampToValueAtTime(Math.max(48, endHz * 1.5), endAt);

    const shaper = ctx.createWaveShaper();
    shaper.curve = phys.warmTubeCurve;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.max(240, startHz * 3.2), startAt);
    lp.frequency.exponentialRampToValueAtTime(Math.max(180, endHz * 3.0), endAt);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(peakGain, startAt + Math.min(0.05, dur * 0.2));
    env.gain.setValueAtTime(peakGain * 0.85, Math.max(startAt + 0.06, endAt - 0.08));
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    osc1.connect(shaper);
    osc2.connect(shaper);
    shaper.connect(lp);
    lp.connect(env);
    env.connect(dest);

    osc1.start(startAt);
    osc2.start(startAt);
    osc1.stop(endAt + 0.014);
    osc2.stop(endAt + 0.014);

    this.registerVoice(
      startAt,
      endAt + 0.014,
      env,
      osc1,
      [osc2],
      [osc1, osc2, shaper, lp, env],
    );
  }

  /** High-voltage studio coax cable arc zap (120Hz/240Hz sputtering plasma + spark crackle). */
  private playElectricArcZap(
    ctx: AudioContext,
    dest: AudioNode,
    phys: CachedPhysicalBuffers,
    when: number,
    durationSec: number,
    peakGain: number,
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = Math.max(0.12, durationSec);
    const endAt = startAt + dur;

    const arcOsc = ctx.createOscillator();
    arcOsc.type = 'sawtooth';
    arcOsc.frequency.setValueAtTime(120, startAt);

    const sputterLfo = ctx.createOscillator();
    sputterLfo.type = 'sawtooth';
    sputterLfo.frequency.setValueAtTime(29, startAt);
    const fmGain = ctx.createGain();
    fmGain.gain.setValueAtTime(85, startAt);

    const sparkNoise = ctx.createBufferSource();
    sparkNoise.buffer = phys.fuseCrackle;
    sparkNoise.loop = true;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.setValueAtTime(2.6, startAt);
    bp.frequency.setValueAtTime(1450, startAt);
    bp.frequency.exponentialRampToValueAtTime(2850, startAt + dur * 0.5);
    bp.frequency.exponentialRampToValueAtTime(920, endAt);

    const shaper = ctx.createWaveShaper();
    shaper.curve = phys.hardBuzzCurve;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(peakGain, startAt + 0.008);
    env.gain.setValueAtTime(peakGain * 0.86, Math.max(startAt + 0.02, endAt - 0.06));
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    sputterLfo.connect(fmGain);
    fmGain.connect(arcOsc.frequency);
    arcOsc.connect(shaper);
    sparkNoise.connect(shaper);
    shaper.connect(bp);
    bp.connect(env);
    env.connect(dest);

    arcOsc.start(startAt);
    sputterLfo.start(startAt);
    sparkNoise.start(startAt);
    arcOsc.stop(endAt + 0.014);
    sputterLfo.stop(endAt + 0.014);
    sparkNoise.stop(endAt + 0.014);

    this.registerVoice(
      startAt,
      endAt + 0.014,
      env,
      arcOsc,
      [sputterLfo, sparkNoise],
      [arcOsc, sputterLfo, fmGain, sparkNoise, shaper, bp, env],
    );
  }

  /** Taut hemp rigging pulley stick-slip creak for `CATWALK_MAGNET`. */
  private playPulleyRopeCreak(
    ctx: AudioContext,
    dest: AudioNode,
    phys: CachedPhysicalBuffers,
    when: number,
    durationSec: number,
    baseHz: number,
    peakGain: number,
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = Math.max(0.06, durationSec);
    const endAt = startAt + dur;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseHz * 0.78, startAt);
    osc.frequency.exponentialRampToValueAtTime(baseHz * 1.18, endAt);

    const woodBp = ctx.createBiquadFilter();
    woodBp.type = 'bandpass';
    woodBp.Q.setValueAtTime(4.8, startAt);
    woodBp.frequency.setValueAtTime(baseHz * 1.6, startAt);
    woodBp.frequency.exponentialRampToValueAtTime(baseHz * 2.2, endAt);

    const shaper = ctx.createWaveShaper();
    shaper.curve = phys.warmTubeCurve;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(peakGain, startAt + 0.014);
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    osc.connect(shaper);
    shaper.connect(woodBp);
    woodBp.connect(env);
    env.connect(dest);

    osc.start(startAt);
    osc.stop(endAt + 0.014);

    this.registerVoice(startAt, endAt + 0.014, env, osc, [], [osc, shaper, woodBp, env]);
  }

  /** Pulsing 1960s stage-prop horseshoe electromagnet thrum (`110Hz + 165Hz` + accelerating magnetic LFO). */
  private playElectromagnetThrum(
    ctx: AudioContext,
    dest: AudioNode,
    phys: CachedPhysicalBuffers,
    when: number,
    durationSec: number,
    peakGain: number,
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = Math.max(0.20, durationSec);
    const endAt = startAt + dur;

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = 'triangle';
    oscB.type = 'sawtooth';
    oscA.frequency.setValueAtTime(110, startAt);
    oscA.frequency.linearRampToValueAtTime(132, endAt);
    oscB.frequency.setValueAtTime(165, startAt);
    oscB.frequency.linearRampToValueAtTime(198, endAt);

    const pulseLfo = ctx.createOscillator();
    pulseLfo.type = 'sine';
    pulseLfo.frequency.setValueAtTime(6.5, startAt);
    pulseLfo.frequency.exponentialRampToValueAtTime(14.5, endAt);

    const pulseDepth = ctx.createGain();
    pulseDepth.gain.setValueAtTime(peakGain * 0.35, startAt);
    pulseDepth.gain.linearRampToValueAtTime(0.0, endAt);

    const shaper = ctx.createWaveShaper();
    shaper.curve = phys.warmTubeCurve;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(780, startAt);
    lp.frequency.exponentialRampToValueAtTime(1350, endAt);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(peakGain * 0.75, startAt + 0.06);
    env.gain.setValueAtTime(peakGain * 0.72, Math.max(startAt + 0.08, endAt - 0.09));
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    oscA.connect(shaper);
    oscB.connect(shaper);
    shaper.connect(lp);
    lp.connect(env);
    pulseLfo.connect(pulseDepth);
    pulseDepth.connect(env.gain);
    env.connect(dest);

    oscA.start(startAt);
    oscB.start(startAt);
    pulseLfo.start(startAt);
    oscA.stop(endAt + 0.014);
    oscB.stop(endAt + 0.014);
    pulseLfo.stop(endAt + 0.014);

    this.registerVoice(
      startAt,
      endAt + 0.014,
      env,
      oscA,
      [oscB, pulseLfo],
      [oscA, oscB, pulseLfo, pulseDepth, shaper, lp, env],
    );
  }

  /** Classic 1966 B-movie / *Jetsons* studio tape-saturated theremin saucer hover warble. */
  private playRetroSaucerWarble(
    ctx: AudioContext,
    dest: AudioNode,
    phys: CachedPhysicalBuffers,
    when: number,
    durationSec: number,
    freqA: number,
    freqB: number,
    vibratoHz: number,
    peakGain: number,
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = Math.max(0.20, durationSec);
    const endAt = startAt + dur;

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = 'triangle';
    oscB.type = 'triangle';
    oscA.frequency.setValueAtTime(freqA, startAt);
    oscB.frequency.setValueAtTime(freqB, startAt);

    const vibLfo = ctx.createOscillator();
    vibLfo.type = 'sine';
    vibLfo.frequency.setValueAtTime(vibratoHz, startAt);

    const vibDepthA = ctx.createGain();
    const vibDepthB = ctx.createGain();
    vibDepthA.gain.setValueAtTime(52, startAt);
    vibDepthB.gain.setValueAtTime(-64, startAt);

    const shaper = ctx.createWaveShaper();
    shaper.curve = phys.warmTubeCurve;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2200, startAt);

    const nodes: AudioNode[] = [oscA, oscB, vibLfo, vibDepthA, vibDepthB, shaper, lp];
    let tail: AudioNode = lp;

    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(-0.62, startAt);
      panner.pan.linearRampToValueAtTime(0.0, endAt);
      tail.connect(panner);
      tail = panner;
      nodes.push(panner);
    }

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(peakGain, startAt + 0.06);
    env.gain.setValueAtTime(peakGain * 0.88, Math.max(startAt + 0.08, endAt - 0.08));
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    vibLfo.connect(vibDepthA);
    vibLfo.connect(vibDepthB);
    vibDepthA.connect(oscA.frequency);
    vibDepthB.connect(oscB.frequency);

    oscA.connect(shaper);
    oscB.connect(shaper);
    shaper.connect(lp);
    tail.connect(env);
    env.connect(dest);
    nodes.push(env);

    oscA.start(startAt);
    oscB.start(startAt);
    vibLfo.start(startAt);
    oscA.stop(endAt + 0.014);
    oscB.stop(endAt + 0.014);
    vibLfo.stop(endAt + 0.014);

    this.registerVoice(startAt, endAt + 0.014, env, oscA, [oscB, vibLfo], nodes);
  }

  /** Rapid upward saucer zoom-off across Stage Right (`TIN_UFO` Beat 3). */
  private playSaucerZipAway(
    ctx: AudioContext,
    dest: AudioNode,
    phys: CachedPhysicalBuffers,
    when: number,
    durationSec: number,
    peakGain: number,
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = Math.max(0.14, durationSec);
    const endAt = startAt + dur;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, startAt);
    osc.frequency.exponentialRampToValueAtTime(2420, endAt);

    const vib = ctx.createOscillator();
    vib.type = 'sine';
    vib.frequency.setValueAtTime(14, startAt);
    const vibGain = ctx.createGain();
    vibGain.gain.setValueAtTime(65, startAt);

    const shaper = ctx.createWaveShaper();
    shaper.curve = phys.warmTubeCurve;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3200, startAt);

    const nodes: AudioNode[] = [osc, vib, vibGain, shaper, lp];
    let tail: AudioNode = lp;

    if (typeof ctx.createStereoPanner === 'function') {
      const pan = ctx.createStereoPanner();
      pan.pan.setValueAtTime(0.0, startAt);
      pan.pan.linearRampToValueAtTime(0.75, endAt);
      tail.connect(pan);
      tail = pan;
      nodes.push(pan);
    }

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(peakGain, startAt + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    vib.connect(vibGain);
    vibGain.connect(osc.frequency);
    osc.connect(shaper);
    shaper.connect(lp);
    tail.connect(env);
    env.connect(dest);
    nodes.push(env);

    osc.start(startAt);
    vib.start(startAt);
    osc.stop(endAt + 0.014);
    vib.stop(endAt + 0.014);

    this.registerVoice(startAt, endAt + 0.014, env, osc, [vib], nodes);
  }

  /**
   * Vintage Gent / Federal Motor-Driven Dual-Tone Diaphragm Studio Klaxon ("WHOOP!"):
   * Rapid motor spin-up glide -> resonant brass horn hold with 28Hz diaphragm rasp -> coast down!
   */
  private playVintageMotorKlaxonBlast(
    ctx: AudioContext,
    dest: AudioNode,
    phys: CachedPhysicalBuffers,
    when: number,
    durationSec: number,
    peakGain: number,
    panPos: number,
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = Math.max(0.24, durationSec);
    const spinUpAt = startAt + dur * 0.26;
    const coastStartAt = startAt + dur * 0.68;
    const endAt = startAt + dur;

    const oscHi = ctx.createOscillator();
    const oscLo = ctx.createOscillator();
    oscHi.type = 'sawtooth';
    oscLo.type = 'sawtooth';

    // Motor spin-up ("whoo-OOP!") -> hold -> spin-down ("-ooop") in classic discordant minor-3rd/tritone horn pair
    oscHi.frequency.setValueAtTime(245, startAt);
    oscHi.frequency.exponentialRampToValueAtTime(493.88, spinUpAt); // B4
    oscHi.frequency.setValueAtTime(488.0, coastStartAt);
    oscHi.frequency.exponentialRampToValueAtTime(311.13, endAt);

    oscLo.frequency.setValueAtTime(196, startAt);
    oscLo.frequency.exponentialRampToValueAtTime(415.30, spinUpAt); // Ab4
    oscLo.frequency.setValueAtTime(411.0, coastStartAt);
    oscLo.frequency.exponentialRampToValueAtTime(261.63, endAt);

    // 28Hz steel toothed-wheel diaphragm rattle
    const diaphragmLfo = ctx.createOscillator();
    diaphragmLfo.type = 'sine';
    diaphragmLfo.frequency.setValueAtTime(28, startAt);
    const diaphragmDepth = ctx.createGain();
    diaphragmDepth.gain.setValueAtTime(peakGain * 0.20, startAt);
    diaphragmDepth.gain.linearRampToValueAtTime(0.0, endAt);

    const shaper = ctx.createWaveShaper();
    shaper.curve = phys.warmTubeCurve;

    const hornFormant = ctx.createBiquadFilter();
    hornFormant.type = 'peaking';
    hornFormant.frequency.setValueAtTime(690, startAt);
    hornFormant.Q.setValueAtTime(1.8, startAt);
    hornFormant.gain.setValueAtTime(6.0, startAt);

    const hornLp = ctx.createBiquadFilter();
    hornLp.type = 'lowpass';
    hornLp.frequency.setValueAtTime(2150, startAt);
    hornLp.Q.setValueAtTime(1.2, startAt);

    const nodes: AudioNode[] = [
      oscHi,
      oscLo,
      diaphragmLfo,
      diaphragmDepth,
      shaper,
      hornFormant,
      hornLp,
    ];
    let tail: AudioNode = hornLp;

    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(clamp(panPos, -1, 1), startAt);
      tail.connect(panner);
      tail = panner;
      nodes.push(panner);
    }

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(peakGain, startAt + 0.022);
    env.gain.setValueAtTime(peakGain * 0.92, coastStartAt);
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    oscHi.connect(shaper);
    oscLo.connect(shaper);
    shaper.connect(hornFormant);
    hornFormant.connect(hornLp);
    tail.connect(env);
    diaphragmLfo.connect(diaphragmDepth);
    diaphragmDepth.connect(env.gain);
    env.connect(dest);
    nodes.push(env);

    oscHi.start(startAt);
    oscLo.start(startAt);
    diaphragmLfo.start(startAt);
    oscHi.stop(endAt + 0.014);
    oscLo.stop(endAt + 0.014);
    diaphragmLfo.stop(endAt + 0.014);

    this.registerVoice(startAt, endAt + 0.014, env, oscHi, [oscLo, diaphragmLfo], nodes);
  }

  /**
   * 90%-Silver Morgan/Peace Dollar Coin against Cut-Glass Bowl Overtones:
   * Pair of non-integer circular-plate radial modes (`f0` & `1.535 * f0`) with
   * crisp crystalline decay — layered under real foley bells & glockenspiel!
   */
  private playSilverCoinGlassClink(
    ctx: AudioContext,
    dest: AudioNode,
    when: number,
    pitchScale: number,
    peakGain: number,
    panPos: number,
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = 0.14;
    const endAt = startAt + dur;

    const modeA = ctx.createOscillator();
    const modeB = ctx.createOscillator();
    modeA.type = 'triangle';
    modeB.type = 'sine';
    // Real silver dollar nodal ring frequencies (~2,410 Hz & inharmonic ~3,695 Hz mode)
    modeA.frequency.setValueAtTime(clamp(2410 * pitchScale, 900, 6200), startAt);
    modeB.frequency.setValueAtTime(clamp(3695 * pitchScale, 1400, 7800), startAt);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(1400, startAt);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(6400, startAt);

    const nodes: AudioNode[] = [modeA, modeB, hp, lp];
    let tail: AudioNode = lp;

    if (Math.abs(panPos) > 0.01 && typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(clamp(panPos, -1, 1), startAt);
      tail.connect(panner);
      tail = panner;
      nodes.push(panner);
    }

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(peakGain * 0.42, startAt + 0.0018);
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.005);

    modeA.connect(hp);
    modeB.connect(hp);
    hp.connect(lp);
    tail.connect(env);
    env.connect(dest);
    nodes.push(env);

    modeA.start(startAt);
    modeB.start(startAt);
    modeA.stop(endAt + 0.012);
    modeB.stop(endAt + 0.012);

    this.registerVoice(startAt, endAt + 0.012, env, modeA, [modeB], nodes);
  }

  /**
   * Emergency cold-boot fallback ONLY if `SamplePackLoaderV7` MP3 fetch is still
   * in flight during the first ~150ms or inside a fetch-less headless unit test.
   */
  private playColdStreamBodyFallback(
    ctx: AudioContext,
    dest: AudioNode,
    instrumentId: AcousticInstrumentIdV7,
    midiNote: number,
    when: number,
    durationSec: number,
    gain: number,
    opts?: {
      bendToMidi?: number;
      lowpassHz?: number;
      pan?: number;
    },
  ): void {
    if (!this.allocateVoiceSlot(ctx)) return;

    const startAt = Math.max(ctx.currentTime, when);
    const dur = clamp(durationSec, 0.03, 0.85);
    const endAt = startAt + dur;
    const hz = midiToHz(midiNote);

    const osc = ctx.createOscillator();
    const isBrass =
      instrumentId === 'trombone' ||
      instrumentId === 'brass' ||
      instrumentId === 'muted_trumpet' ||
      instrumentId === 'trumpet' ||
      instrumentId === 'baritone_sax';
    osc.type = isBrass ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(hz, startAt);
    if (typeof opts?.bendToMidi === 'number') {
      osc.frequency.exponentialRampToValueAtTime(midiToHz(opts.bendToMidi), endAt);
    }

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(opts?.lowpassHz ?? (isBrass ? 1850 : 2400), startAt);

    const nodes: AudioNode[] = [osc, lp];
    let tail: AudioNode = lp;
    if (typeof opts?.pan === 'number' && typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(clamp(opts.pan, -1, 1), startAt);
      tail.connect(panner);
      tail = panner;
      nodes.push(panner);
    }

    const safeGain = clamp(gain * 0.45, 0.001, 0.22);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.linearRampToValueAtTime(safeGain, startAt + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0002, endAt);
    env.gain.linearRampToValueAtTime(0.0, endAt + 0.006);

    osc.connect(lp);
    tail.connect(env);
    env.connect(dest);
    nodes.push(env);

    osc.start(startAt);
    osc.stop(endAt + 0.014);

    this.registerVoice(startAt, endAt + 0.014, env, osc, [], nodes);
  }
}
