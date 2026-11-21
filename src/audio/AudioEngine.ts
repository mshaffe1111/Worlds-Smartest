import type { IAudioEngine, MusicLayer, PeelTier, VenueId } from '../types/game';

const STORAGE_MUTE_KEY = 'ws_audio_muted';

type SoloistVoice =
  | 'glass'
  | 'cello'
  | 'koto'
  | 'sonar'
  | 'broadcast'
  | 'nylon'
  | 'oud'
  | 'marimba'
  | 'guzheng'
  | 'brass';
type SfxSendTier = 'tight' | 'medium' | 'lush' | 'hall';

interface VenueProfile {
  id: VenueId;
  /** Tonic pitch in register 3 (Hz); bass uses rootHz / 2 */
  rootHz: number;
  /** Scale intervals in semitones relative to root */
  scale: number[];
  /** 4-bar harmonic chord voicings (semitones relative to root) */
  chords: [number, number, number, number][];
  bpm: number;
  padWave: OscillatorType;
  padCutoffHz: number;
  padLevelTrim: number;
  celloVibratoCents: number;
  reverbSend: number;
  baseMix: number;
  soloist: SoloistVoice;
}

const VENUE_PROFILES: Record<VenueId, VenueProfile> = {
  CH: {
    // Geneva — D minor: cold glass harmonic shimmer pad + minimalist deep sub pulse
    id: 'CH',
    rootHz: 146.83, // D3
    scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [
      [0, 3, 7, 14], // Dm9
      [-4, 0, 3, 10], // Bbmaj7
      [-2, 2, 5, 12], // Csus2/add6
      [0, 3, 7, 10], // Dm7
    ],
    bpm: 78,
    padWave: 'triangle',
    padCutoffHz: 1220,
    padLevelTrim: 1.0,
    celloVibratoCents: 0,
    reverbSend: 0.44,
    baseMix: 0.18,
    soloist: 'glass',
  },
  GB: {
    // London — G minor: warm bowed cello-style lowpass sawtooth pad + aristocratic chamber pulse
    id: 'GB',
    rootHz: 196.0, // G3
    scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [
      [0, 3, 7, 10], // Gm7
      [-4, 0, 3, 7], // Ebmaj7
      [-7, -4, 0, 5], // Cm11
      [-5, -2, 2, 7], // Dm7add4
    ],
    bpm: 82,
    padWave: 'sawtooth',
    padCutoffHz: 540,
    padLevelTrim: 0.7,
    celloVibratoCents: 7,
    reverbSend: 0.5,
    baseMix: 0.19,
    soloist: 'cello',
  },
  JP: {
    // Tokyo — E Hirajoshi pentatonic: crisp koto-like plucked FM notes over indigo night pad
    id: 'JP',
    rootHz: 164.81, // E3
    scale: [0, 2, 3, 7, 8], // E, F#, G, B, C
    chords: [
      [0, 7, 12, 14], // E5add9
      [0, 3, 7, 12], // Em
      [-4, 0, 7, 12], // Cmaj7(no3)
      [-5, 0, 2, 7], // Bsus4/E
    ],
    bpm: 88,
    padWave: 'triangle',
    padCutoffHz: 960,
    padLevelTrim: 1.0,
    celloVibratoCents: 0,
    reverbSend: 0.46,
    baseMix: 0.19,
    soloist: 'koto',
  },
  BR: {
    // Rio Botanical Glass Canopy — B minor: warm nylon-guitar & syncopated samba-bossa pulse
    id: 'BR',
    rootHz: 123.47, // B2
    scale: [0, 2, 3, 5, 7, 9, 10], // B Dorian / warm bossa minor
    chords: [
      [0, 3, 7, 14], // Bm9
      [-4, 0, 3, 11], // Gmaj7
      [-7, -4, 0, 7], // Em9
      [-5, -2, 2, 10], // F#m7add11
    ],
    bpm: 94,
    padWave: 'triangle',
    padCutoffHz: 980,
    padLevelTrim: 0.94,
    celloVibratoCents: 3,
    reverbSend: 0.42,
    baseMix: 0.19,
    soloist: 'nylon',
  },
  EG: {
    // Cairo Solar Acoustic Hall — D Phrygian Dominant (Hijaz): hypnotic oud plucked drone
    id: 'EG',
    rootHz: 146.83, // D3
    scale: [0, 1, 4, 5, 7, 8, 10], // D, Eb, F#, G, A, Bb, C
    chords: [
      [0, 4, 7, 13], // D Hijaz (b9)
      [1, 5, 8, 12], // Ebmaj7/D
      [0, 3, 7, 10], // Dm7 shadow
      [0, 4, 7, 10], // D7 Phrygian tension
    ],
    bpm: 80,
    padWave: 'sawtooth',
    padCutoffHz: 580,
    padLevelTrim: 0.68,
    celloVibratoCents: 5,
    reverbSend: 0.54,
    baseMix: 0.19,
    soloist: 'oud',
  },
  IS: {
    // Reykjavik Geothermal Basalt Caldera — F# minor: crystalline glass marimba & aurora shimmer
    id: 'IS',
    rootHz: 185.0, // F#3
    scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [
      [0, 3, 7, 14], // F#m9
      [-4, 0, 3, 10], // Dmaj7
      [-7, -4, 0, 5], // Bm11
      [-5, -2, 2, 7], // C#m7
    ],
    bpm: 76,
    padWave: 'triangle',
    padCutoffHz: 1420,
    padLevelTrim: 1.0,
    celloVibratoCents: 0,
    reverbSend: 0.62,
    baseMix: 0.18,
    soloist: 'marimba',
  },
  SG: {
    // Singapore Diplomatic Sky-Bridge — C# minor: crisp guzheng & sleek modular pulse
    id: 'SG',
    rootHz: 138.59, // C#3
    scale: [0, 2, 3, 7, 8, 10],
    chords: [
      [0, 3, 7, 14], // C#m9
      [-4, 0, 3, 11], // Amaj7
      [-2, 2, 5, 12], // B6
      [-5, -2, 2, 7], // G#m7
    ],
    bpm: 94,
    padWave: 'triangle',
    padCutoffHz: 1120,
    padLevelTrim: 0.96,
    celloVibratoCents: 0,
    reverbSend: 0.44,
    baseMix: 0.19,
    soloist: 'guzheng',
  },
  GLOBAL: {
    // Apex Forum Grand Finale — E minor: monumental sovereign orchestral brass & strings
    id: 'GLOBAL',
    rootHz: 164.81, // E3
    scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [
      [0, 3, 7, 14], // Em9
      [-4, 0, 3, 11], // Cmaj7
      [-2, 2, 5, 14], // Dadd9
      [-5, 0, 2, 7], // Bsus4/E sovereign cadence
    ],
    bpm: 86,
    padWave: 'sawtooth',
    padCutoffHz: 760,
    padLevelTrim: 0.74,
    celloVibratoCents: 6,
    reverbSend: 0.58,
    baseMix: 0.2,
    soloist: 'brass',
  },
  LEDGER: {
    // Archive Descent — C minor: deep subterranean resonant drone + sonar telemetry pings
    id: 'LEDGER',
    rootHz: 130.81, // C3
    scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [
      [0, 7, 10, 15], // Cm7 open
      [0, 3, 7, 14], // Cm9
      [-4, 0, 7, 10], // Abmaj9(no3)
      [-1, 3, 7, 12], // Bdim/C vault tension
    ],
    bpm: 72,
    padWave: 'sawtooth',
    padCutoffHz: 420,
    padLevelTrim: 0.68,
    celloVibratoCents: 0,
    reverbSend: 0.56,
    baseMix: 0.19,
    soloist: 'sonar',
  },
  STUDIO: {
    // Global Feed / Briefing — A minor: crisp modern newsroom rhythmic elegance
    id: 'STUDIO',
    rootHz: 220.0, // A3
    scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [
      [0, 3, 7, 14], // Am9
      [-4, 0, 3, 10], // Fmaj7
      [-2, 2, 5, 12], // G6
      [-5, -2, 2, 7], // Em7
    ],
    bpm: 96,
    padWave: 'triangle',
    padCutoffHz: 1360,
    padLevelTrim: 0.96,
    celloVibratoCents: 0,
    reverbSend: 0.34,
    baseMix: 0.18,
    soloist: 'broadcast',
  },
};

interface LayerMix {
  musicGainScale: number;
  padGain: number;
  subGain: number;
  tensionGain: number;
  streakGain: number;
  fractureGain: number;
  staticGain: number;
  padCutoffMult: number;
}

const LAYER_MIXES: Record<MusicLayer, LayerMix> = {
  IDLE: {
    musicGainScale: 0.88,
    padGain: 0.34,
    subGain: 0.22,
    tensionGain: 0.0,
    streakGain: 0.0,
    fractureGain: 0.0,
    staticGain: 0.0,
    padCutoffMult: 0.85,
  },
  INTERVIEW: {
    musicGainScale: 0.9,
    padGain: 0.24,
    subGain: 0.26,
    tensionGain: 0.16,
    streakGain: 0.0,
    fractureGain: 0.0,
    staticGain: 0.0,
    padCutoffMult: 0.72,
  },
  DEDUCTION: {
    musicGainScale: 1.05,
    padGain: 0.3,
    subGain: 0.26,
    tensionGain: 0.08,
    streakGain: 0.0,
    fractureGain: 0.0,
    staticGain: 0.0,
    padCutoffMult: 1.0,
  },
  COUNTDOWN: {
    musicGainScale: 1.18,
    padGain: 0.26,
    subGain: 0.3,
    tensionGain: 0.22,
    streakGain: 0.04,
    fractureGain: 0.0,
    staticGain: 0.0,
    padCutoffMult: 1.38,
  },
  STREAK: {
    musicGainScale: 1.24,
    padGain: 0.32,
    subGain: 0.28,
    tensionGain: 0.0,
    streakGain: 0.24,
    fractureGain: 0.0,
    staticGain: 0.0,
    padCutoffMult: 1.28,
  },
  FRACTURE: {
    musicGainScale: 1.2,
    padGain: 0.14,
    subGain: 0.34,
    tensionGain: 0.2,
    streakGain: 0.0,
    fractureGain: 0.22,
    staticGain: 0.065,
    padCutoffMult: 0.58,
  },
};

interface ContinuousMusicRig {
  subOsc: OscillatorNode;
  subFilter: BiquadFilterNode;
  subGain: GainNode;
  padOscA: OscillatorNode;
  padOscB: OscillatorNode;
  padOscUpper: OscillatorNode;
  padFilter: BiquadFilterNode;
  padGain: GainNode;
  padLfo: OscillatorNode;
  padLfoDepth: GainNode;
  vibratoLfo: OscillatorNode;
  vibratoDepth: GainNode;
  tensionOsc: OscillatorNode;
  tensionFilter: BiquadFilterNode;
  tensionGain: GainNode;
  streakOscA: OscillatorNode;
  streakOscB: OscillatorNode;
  streakFilter: BiquadFilterNode;
  streakGain: GainNode;
  fractureOscA: OscillatorNode;
  fractureOscB: OscillatorNode;
  fractureFilter: BiquadFilterNode;
  fractureGain: GainNode;
  fractureLfo: OscillatorNode;
  fractureLfoDepth: GainNode;
  staticSource: AudioBufferSourceNode;
  staticFilter: BiquadFilterNode;
  staticGain: GainNode;
}

interface OverclockChargeNodes {
  turbineA: OscillatorNode;
  turbineB: OscillatorNode;
  turbineFilter: BiquadFilterNode;
  turbineGain: GainNode;
  subOsc: OscillatorNode;
  subAmp: GainNode;
  subLfo: OscillatorNode;
  subLfoDepth: GainNode;
  masterGain: GainNode;
  watchdogTimer: ReturnType<typeof setTimeout> | null;
}

interface WebkitWindow {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, val));
}

function clampFreq(hz: number): number {
  return clamp(hz, 24, 18000);
}

function semitoneHz(baseHz: number, semitones: number): number {
  return clampFreq(baseHz * Math.pow(2, semitones / 12));
}

function nowPerfMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

export class AudioEngine implements IAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private musicReverbSend: GainNode | null = null;
  private sfxBuses: Record<SfxSendTier, GainNode> | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private musicRig: ContinuousMusicRig | null = null;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextStepTime = 0;
  private stepIndex = 0;
  private chordIndex = 0;
  private countdownStartTime = 0;

  private currentVenue: VenueId = 'STUDIO';
  private currentLayer: MusicLayer = 'IDLE';
  private muted: boolean;
  private unlocked = false;
  private tabHidden = false;

  // Rate limiters (ms)
  private lastSpinTickMs = 0;
  private lastSightlineSnapMs = 0;
  private lastCalibratorTickMs = 0;
  private lastUiTapMs = 0;

  // Stateful Overclock Charge rig
  private overclockNodes: OverclockChargeNodes | null = null;
  private lastOverclockProgress = 0;

  // Passive gesture unlock & tab visibility listeners
  private gestureListenersAttached = false;
  private readonly handleAutoUnlock = (): void => {
    this.unlock();
  };
  private readonly handleVisibilityChange = (): void => {
    if (typeof document === 'undefined') return;
    this.tabHidden = document.hidden;
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    if (this.tabHidden) {
      this.masterGain.gain.setTargetAtTime(0, now, 0.04);
      this.stopOverclockCharge(false);
    } else if (!this.muted) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.nextStepTime = now + 0.06;
      this.masterGain.gain.setTargetAtTime(1.0, now, 0.08);
    }
  };

  constructor() {
    this.muted = this.loadMutedState();
    this.attachBrowserLifecycleListeners();
  }

  private loadMutedState(): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(STORAGE_MUTE_KEY) === 'true';
      }
    } catch {
      // Ignore restricted storage environments
    }
    return false;
  }

  private persistMutedState(muted: boolean): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_MUTE_KEY, muted ? 'true' : 'false');
      }
    } catch {
      // Ignore storage write errors
    }
  }

  private attachBrowserLifecycleListeners(): void {
    if (typeof window === 'undefined' || this.gestureListenersAttached) return;
    try {
      this.gestureListenersAttached = true;
      window.addEventListener('pointerdown', this.handleAutoUnlock, { capture: true, passive: true });
      window.addEventListener('keydown', this.handleAutoUnlock, { capture: true, passive: true });
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
      }
    } catch {
      // Non-browser environment
    }
  }

  private detachGestureListeners(): void {
    if (typeof window === 'undefined' || !this.gestureListenersAttached) return;
    try {
      window.removeEventListener('pointerdown', this.handleAutoUnlock, { capture: true });
      window.removeEventListener('keydown', this.handleAutoUnlock, { capture: true });
      this.gestureListenersAttached = false;
    } catch {
      // Ignore
    }
  }

  // --------------------------------------------------------------------------
  // Lazy AudioContext Initialization & Signal Graph
  // --------------------------------------------------------------------------

  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;

    const win = window as unknown as WebkitWindow;
    const AudioCtxCtor = win.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtxCtor) return null;

    try {
      const ctx = new AudioCtxCtor({ latencyHint: 'interactive' });
      this.ctx = ctx;

      // Master DynamicsCompressor prevents mobile speaker clipping & glues music + Foley
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      compressor.knee.setValueAtTime(18, ctx.currentTime);
      compressor.ratio.setValueAtTime(4, ctx.currentTime);
      compressor.attack.setValueAtTime(0.004, ctx.currentTime);
      compressor.release.setValueAtTime(0.18, ctx.currentTime);

      // Gentle master subsonic protection (highpass @ 28 Hz)
      const subGuard = ctx.createBiquadFilter();
      subGuard.type = 'highpass';
      subGuard.frequency.setValueAtTime(28, ctx.currentTime);

      const masterGain = ctx.createGain();
      const initialMaster = this.muted || this.tabHidden ? 0 : 1.0;
      masterGain.gain.setValueAtTime(initialMaster, ctx.currentTime);

      compressor.connect(subGuard);
      subGuard.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Algorithmic Stereo Convolution Reverb
      const convolver = ctx.createConvolver();
      convolver.buffer = this.buildAlgorithmicReverbIR(ctx, 2.15, 2.75);

      const reverbHp = ctx.createBiquadFilter();
      reverbHp.type = 'highpass';
      reverbHp.frequency.setValueAtTime(145, ctx.currentTime);

      const reverbLp = ctx.createBiquadFilter();
      reverbLp.type = 'lowpass';
      reverbLp.frequency.setValueAtTime(6800, ctx.currentTime);

      const reverbReturn = ctx.createGain();
      reverbReturn.gain.setValueAtTime(0.68, ctx.currentTime);

      convolver.connect(reverbHp);
      reverbHp.connect(reverbLp);
      reverbLp.connect(reverbReturn);
      reverbReturn.connect(compressor);

      // Music sub-bus (mixed gracefully ~0.16-0.24 so Foley pops crisply on phone speakers)
      const musicBus = ctx.createGain();
      const profile = VENUE_PROFILES[this.currentVenue];
      const layerMix = LAYER_MIXES[this.currentLayer];
      musicBus.gain.setValueAtTime(profile.baseMix * layerMix.musicGainScale, ctx.currentTime);

      const musicReverbSend = ctx.createGain();
      musicReverbSend.gain.setValueAtTime(profile.reverbSend, ctx.currentTime);

      musicBus.connect(compressor);
      musicBus.connect(musicReverbSend);
      musicReverbSend.connect(convolver);

      // 4 Pre-wired SFX Send Buses (zero per-SFX wet GainNode allocations, zero graph leaks)
      const makeSfxTierBus = (wetLevel: number): GainNode => {
        const input = ctx.createGain();
        input.gain.setValueAtTime(0.95, ctx.currentTime);
        input.connect(compressor);

        const wet = ctx.createGain();
        wet.gain.setValueAtTime(wetLevel, ctx.currentTime);
        input.connect(wet);
        wet.connect(convolver);
        return input;
      };

      this.sfxBuses = {
        tight: makeSfxTierBus(0.08),
        medium: makeSfxTierBus(0.2),
        lush: makeSfxTierBus(0.38),
        hall: makeSfxTierBus(0.58),
      };

      this.masterGain = masterGain;
      this.musicBus = musicBus;
      this.musicReverbSend = musicReverbSend;

      // Pre-allocate cached stereo white noise buffer (2.0s) for zero-GC Foley
      this.noiseBuffer = this.buildNoiseBuffer(ctx, 2.0);

      if (this.currentLayer === 'COUNTDOWN') {
        this.countdownStartTime = ctx.currentTime;
      }

      // Build continuous adaptive vertical-remix pad/drone stems
      this.buildContinuousMusicRig(ctx);
      this.applyVenueAndLayerParams(true);
      this.startMusicScheduler();

      return ctx;
    } catch {
      return null;
    }
  }

  /**
   * Synthesizes a lush stereo Algorithmic Convolution Reverb IR:
   * - Architectural early reflections (distinct L/R stone & glass bounce taps in first 58ms)
   * - Decorrelated exponentially decaying diffuse stereo tail with progressive high-frequency air damping
   */
  private buildAlgorithmicReverbIR(ctx: AudioContext, durationSec: number, decayCurve: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * durationSec));
    const buffer = ctx.createBuffer(2, length, sampleRate);

    const earlyTapsL = [
      { ms: 11, amp: 0.42 },
      { ms: 19, amp: 0.34 },
      { ms: 29, amp: 0.28 },
      { ms: 41, amp: 0.22 },
      { ms: 54, amp: 0.17 },
    ];
    const earlyTapsR = [
      { ms: 14, amp: 0.4 },
      { ms: 23, amp: 0.33 },
      { ms: 34, amp: 0.26 },
      { ms: 46, amp: 0.2 },
      { ms: 58, amp: 0.16 },
    ];

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      const taps = ch === 0 ? earlyTapsL : earlyTapsR;

      for (const tap of taps) {
        const idx = Math.floor((tap.ms / 1000) * sampleRate);
        if (idx >= 0 && idx < length) {
          data[idx] += tap.amp * (ch === 0 ? 1 : -1) * 0.55;
        }
      }

      let lpState = 0;
      const preDelaySamples = Math.floor(0.016 * sampleRate);
      for (let i = preDelaySamples; i < length; i++) {
        const t = (i - preDelaySamples) / (length - preDelaySamples);
        const env = Math.pow(1 - t, decayCurve);
        const onset = i - preDelaySamples < sampleRate * 0.02 ? (i - preDelaySamples) / (sampleRate * 0.02) : 1;
        const white = Math.random() * 2 - 1;
        const alpha = 0.65 * (1 - t * 0.82);
        lpState = lpState + alpha * (white - lpState);
        data[i] += lpState * env * onset * 0.42;
      }
    }

    return buffer;
  }

  private buildNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
    const length = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return buffer;
  }

  private createPanner(ctx: AudioContext, pan: number): AudioNode {
    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(clamp(pan, -1, 1), ctx.currentTime);
      return panner;
    }
    return ctx.createGain();
  }

  private getReadyContext(): AudioContext | null {
    if (this.muted || this.tabHidden) return null;
    const ctx = this.ensureContext();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
      return null;
    }
    return ctx;
  }

  private connectSfx(sourceNode: AudioNode, tier: SfxSendTier): void {
    if (!this.sfxBuses) return;
    sourceNode.connect(this.sfxBuses[tier]);
  }

  // --------------------------------------------------------------------------
  // Public Lifecycle & Mute Controls
  // --------------------------------------------------------------------------

  public unlock(): void {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx
          .resume()
          .then(() => {
            if (ctx.state === 'running') {
              this.unlocked = true;
              this.detachGestureListeners();
              this.nextStepTime = ctx.currentTime + 0.05;
              this.applyVenueAndLayerParams(false);
            }
          })
          .catch(() => {
            // Browser still awaiting valid gesture; stay gracefully quiet
          });
      } else if (ctx.state === 'running') {
        this.unlocked = true;
        this.detachGestureListeners();
      }

      if (!this.unlocked) {
        const silentBuf = ctx.createBuffer(1, 1, ctx.sampleRate);
        const src = ctx.createBufferSource();
        src.buffer = silentBuf;
        src.connect(ctx.destination);
        src.start(0);
        src.onended = () => {
          src.disconnect();
        };
      }
    } catch {
      // Never throw if browser blocks audio before interaction
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = Boolean(muted);
    this.persistMutedState(this.muted);

    if (this.muted) {
      this.stopOverclockCharge(false);
    }

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      const target = this.muted || this.tabHidden ? 0 : 1.0;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(target, now, 0.03);
      if (!this.muted && !this.tabHidden && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  // --------------------------------------------------------------------------
  // 6-Layer Adaptive Vertical-Remix Synthesizer
  // --------------------------------------------------------------------------

  private buildContinuousMusicRig(ctx: AudioContext): void {
    if (!this.musicBus || !this.noiseBuffer) return;
    const now = ctx.currentTime;
    const profile = VENUE_PROFILES[this.currentVenue];

    // 1. Sub Root Foundation
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(profile.rootHz / 2, now);
    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(160, now);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.0001, now);
    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.musicBus);
    subOsc.start(now);

    // 2. Venue Atmospheric Pad (Detuned Pair + Upper Harmonic Voice + Breathing Filter LFO + Cello Vibrato LFO)
    const padOscA = ctx.createOscillator();
    const padOscB = ctx.createOscillator();
    const padOscUpper = ctx.createOscillator();
    padOscA.type = profile.padWave;
    padOscB.type = profile.padWave;
    padOscUpper.type = 'sine';
    padOscA.detune.setValueAtTime(-6, now);
    padOscB.detune.setValueAtTime(6, now);

    // Subtle bowed-cello vibrato LFO (active on GB London, 0 cents elsewhere)
    const vibratoLfo = ctx.createOscillator();
    vibratoLfo.type = 'sine';
    vibratoLfo.frequency.setValueAtTime(5.1, now);
    const vibratoDepth = ctx.createGain();
    vibratoDepth.gain.setValueAtTime(profile.celloVibratoCents, now);
    vibratoLfo.connect(vibratoDepth);
    vibratoDepth.connect(padOscA.detune);
    vibratoDepth.connect(padOscB.detune);

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(profile.padCutoffHz, now);
    padFilter.Q.setValueAtTime(1.3, now);

    const padLfo = ctx.createOscillator();
    padLfo.type = 'sine';
    padLfo.frequency.setValueAtTime(0.16, now);
    const padLfoDepth = ctx.createGain();
    padLfoDepth.gain.setValueAtTime(135, now);
    padLfo.connect(padLfoDepth);
    padLfoDepth.connect(padFilter.frequency);

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.0001, now);

    const upperLevel = ctx.createGain();
    upperLevel.gain.setValueAtTime(0.52, now);

    padOscA.connect(padFilter);
    padOscB.connect(padFilter);
    padOscUpper.connect(upperLevel);
    upperLevel.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(this.musicBus);

    padOscA.start(now);
    padOscB.start(now);
    padOscUpper.start(now);
    padLfo.start(now);
    vibratoLfo.start(now);

    // 3. Interview / Countdown Tight Tension Resonance Stem
    const tensionOsc = ctx.createOscillator();
    tensionOsc.type = 'triangle';
    tensionOsc.frequency.setValueAtTime(semitoneHz(profile.rootHz, 7), now);
    const tensionFilter = ctx.createBiquadFilter();
    tensionFilter.type = 'bandpass';
    tensionFilter.frequency.setValueAtTime(520, now);
    tensionFilter.Q.setValueAtTime(2.6, now);
    const tensionGain = ctx.createGain();
    tensionGain.gain.setValueAtTime(0.0001, now);
    tensionOsc.connect(tensionFilter);
    tensionFilter.connect(tensionGain);
    tensionGain.connect(this.musicBus);
    tensionOsc.start(now);

    // 4. Streak Euphoria Crystalline Fifth + Ninth Shimmer Pad
    const streakOscA = ctx.createOscillator();
    const streakOscB = ctx.createOscillator();
    streakOscA.type = 'sine';
    streakOscB.type = 'triangle';
    streakOscA.frequency.setValueAtTime(semitoneHz(profile.rootHz, 19), now); // +oct+5th
    streakOscB.frequency.setValueAtTime(semitoneHz(profile.rootHz, 26), now); // +2oct+9th
    const streakFilter = ctx.createBiquadFilter();
    streakFilter.type = 'lowpass';
    streakFilter.frequency.setValueAtTime(3400, now);
    const streakGain = ctx.createGain();
    streakGain.gain.setValueAtTime(0.0001, now);
    streakOscA.connect(streakFilter);
    streakOscB.connect(streakFilter);
    streakFilter.connect(streakGain);
    streakGain.connect(this.musicBus);
    streakOscA.start(now);
    streakOscB.start(now);

    // 5. Fracture Dissonant Metallic Pulse + Filtered Static Bed
    const fractureOscA = ctx.createOscillator();
    const fractureOscB = ctx.createOscillator();
    fractureOscA.type = 'sawtooth';
    fractureOscB.type = 'sawtooth';
    fractureOscA.frequency.setValueAtTime(profile.rootHz, now);
    fractureOscB.frequency.setValueAtTime(semitoneHz(profile.rootHz, 6), now); // tritone tension
    const fractureFilter = ctx.createBiquadFilter();
    fractureFilter.type = 'bandpass';
    fractureFilter.frequency.setValueAtTime(640, now);
    fractureFilter.Q.setValueAtTime(3.4, now);
    const fractureLfo = ctx.createOscillator();
    fractureLfo.type = 'sine';
    fractureLfo.frequency.setValueAtTime(2.4, now);
    const fractureLfoDepth = ctx.createGain();
    fractureLfoDepth.gain.setValueAtTime(220, now);
    fractureLfo.connect(fractureLfoDepth);
    fractureLfoDepth.connect(fractureFilter.frequency);
    const fractureGain = ctx.createGain();
    fractureGain.gain.setValueAtTime(0.0001, now);
    fractureOscA.connect(fractureFilter);
    fractureOscB.connect(fractureFilter);
    fractureFilter.connect(fractureGain);
    fractureGain.connect(this.musicBus);
    fractureOscA.start(now);
    fractureOscB.start(now);
    fractureLfo.start(now);

    const staticSource = ctx.createBufferSource();
    staticSource.buffer = this.noiseBuffer;
    staticSource.loop = true;
    const staticFilter = ctx.createBiquadFilter();
    staticFilter.type = 'bandpass';
    staticFilter.frequency.setValueAtTime(2100, now);
    staticFilter.Q.setValueAtTime(2.8, now);
    const staticGain = ctx.createGain();
    staticGain.gain.setValueAtTime(0.0001, now);
    staticSource.connect(staticFilter);
    staticFilter.connect(staticGain);
    staticGain.connect(this.musicBus);
    staticSource.start(now);

    this.musicRig = {
      subOsc,
      subFilter,
      subGain,
      padOscA,
      padOscB,
      padOscUpper,
      padFilter,
      padGain,
      padLfo,
      padLfoDepth,
      vibratoLfo,
      vibratoDepth,
      tensionOsc,
      tensionFilter,
      tensionGain,
      streakOscA,
      streakOscB,
      streakFilter,
      streakGain,
      fractureOscA,
      fractureOscB,
      fractureFilter,
      fractureGain,
      fractureLfo,
      fractureLfoDepth,
      staticSource,
      staticFilter,
      staticGain,
    };
  }

  private applyVenueAndLayerParams(immediate: boolean): void {
    if (!this.ctx || !this.musicRig || !this.musicBus || !this.musicReverbSend) return;
    const now = this.ctx.currentTime;
    const tau = immediate ? 0.05 : 0.45;
    const profile = VENUE_PROFILES[this.currentVenue];
    const mix = LAYER_MIXES[this.currentLayer];
    const rig = this.musicRig;

    if (rig.padOscA.type !== profile.padWave) {
      rig.padOscA.type = profile.padWave;
      rig.padOscB.type = profile.padWave;
    }

    const chord = profile.chords[this.chordIndex % profile.chords.length];
    const subHz = semitoneHz(profile.rootHz / 2, chord[0]);
    const padRootHz = semitoneHz(profile.rootHz, chord[0]);
    const padColorHz = semitoneHz(profile.rootHz, chord[2]);
    const padUpperHz = semitoneHz(profile.rootHz, chord[3]);

    rig.subOsc.frequency.setTargetAtTime(subHz, now, tau * 0.7);
    rig.padOscA.frequency.setTargetAtTime(padRootHz, now, tau * 0.7);
    rig.padOscB.frequency.setTargetAtTime(padColorHz, now, tau * 0.7);
    rig.padOscUpper.frequency.setTargetAtTime(padUpperHz, now, tau * 0.7);

    rig.padFilter.frequency.setTargetAtTime(
      clampFreq(profile.padCutoffHz * mix.padCutoffMult),
      now,
      tau
    );
    rig.vibratoDepth.gain.setTargetAtTime(profile.celloVibratoCents, now, tau);

    // Key-locked adaptive stems
    rig.tensionOsc.frequency.setTargetAtTime(semitoneHz(profile.rootHz, 7), now, tau);
    rig.streakOscA.frequency.setTargetAtTime(semitoneHz(profile.rootHz, 19), now, tau);
    rig.streakOscB.frequency.setTargetAtTime(semitoneHz(profile.rootHz, 26), now, tau);
    rig.fractureOscA.frequency.setTargetAtTime(profile.rootHz, now, tau);
    rig.fractureOscB.frequency.setTargetAtTime(semitoneHz(profile.rootHz, 6), now, tau);

    // Smooth vertical crossfades
    rig.subGain.gain.setTargetAtTime(mix.subGain, now, tau);
    rig.padGain.gain.setTargetAtTime(mix.padGain * profile.padLevelTrim, now, tau);
    rig.tensionGain.gain.setTargetAtTime(mix.tensionGain, now, tau);
    rig.streakGain.gain.setTargetAtTime(mix.streakGain, now, tau * 1.15);
    rig.fractureGain.gain.setTargetAtTime(mix.fractureGain, now, tau * 0.8);
    rig.staticGain.gain.setTargetAtTime(mix.staticGain, now, tau * 0.8);

    // Keep music gracefully mixed (~0.16-0.24) so Foley pops crisply on phone speakers
    const targetMusicBus = clamp(profile.baseMix * mix.musicGainScale, 0.15, 0.24);
    this.musicBus.gain.setTargetAtTime(targetMusicBus, now, tau);
    this.musicReverbSend.gain.setTargetAtTime(profile.reverbSend, now, tau);
  }

  private startMusicScheduler(): void {
    if (this.schedulerTimer !== null || !this.ctx) return;
    this.nextStepTime = this.ctx.currentTime + 0.08;
    this.schedulerTimer = setInterval(() => {
      this.runSchedulerTick();
    }, 25);
  }

  private runSchedulerTick(): void {
    if (!this.ctx || this.ctx.state !== 'running' || this.muted || this.tabHidden) return;
    const now = this.ctx.currentTime;

    if (this.nextStepTime < now - 0.16) {
      this.nextStepTime = now + 0.04;
    }

    const lookaheadSec = 0.12;
    while (this.nextStepTime < now + lookaheadSec) {
      const profile = VENUE_PROFILES[this.currentVenue];
      const stepDur = 60 / profile.bpm / 4; // 16th-note grid
      this.scheduleMusicStep(this.ctx, this.stepIndex, this.nextStepTime, stepDur, profile);
      this.nextStepTime += stepDur;
      this.stepIndex = (this.stepIndex + 1) % 64;
    }
  }

  private scheduleMusicStep(
    ctx: AudioContext,
    step: number,
    time: number,
    stepDur: number,
    profile: VenueProfile
  ): void {
    if (!this.musicBus) return;
    const stepInBar = step % 16;

    // Gentle 2-bar chord progression movement
    if (step % 32 === 0) {
      this.chordIndex = (this.chordIndex + 1) % profile.chords.length;
      this.applyVenueAndLayerParams(false);
    }

    const layer = this.currentLayer;

    // --- LAYER: IDLE ---
    if (layer === 'IDLE') {
      if (stepInBar === 0) {
        this.scheduleSubPulse(ctx, time, profile.rootHz / 2, 0.22, 0.55);
      }
      if (stepInBar === 0 || stepInBar === 10) {
        const degree = profile.scale[(Math.floor(step / 2) + this.chordIndex) % profile.scale.length];
        this.scheduleVenueSoloistNote(ctx, time, profile, semitoneHz(profile.rootHz * 2, degree), 0.16, 0.65);
      }
      return;
    }

    // --- LAYER: INTERVIEW ---
    if (layer === 'INTERVIEW') {
      // Minimalist interrogation heartbeat sub-pulse (lub-dub)
      if (stepInBar === 0) {
        this.scheduleSubPulse(ctx, time, profile.rootHz / 2, 0.34, 0.24);
      } else if (stepInBar === 3) {
        this.scheduleSubPulse(ctx, time, profile.rootHz / 2, 0.2, 0.18);
      }
      if (stepInBar === 8 || (step >= 32 && stepInBar === 14)) {
        const deg = profile.scale[(this.chordIndex + (stepInBar === 8 ? 2 : 4)) % profile.scale.length];
        this.scheduleVenueSoloistNote(ctx, time, profile, semitoneHz(profile.rootHz, deg + 12), 0.14, 0.45);
      }
      return;
    }

    // --- LAYER: FRACTURE ---
    if (layer === 'FRACTURE') {
      if (stepInBar === 0 || stepInBar === 8) {
        this.scheduleSubPulse(ctx, time, profile.rootHz / 2, 0.36, 0.32);
      }
      // Dissonant metallic pulse on uneasy offbeats
      if (stepInBar === 2 || stepInBar === 7 || stepInBar === 10 || stepInBar === 15) {
        const dissonance = stepInBar === 7 ? 6 : stepInBar === 15 ? 1 : 0;
        this.scheduleMetallicFractureHit(ctx, time, semitoneHz(profile.rootHz * 2, dissonance), 0.18);
      }
      // Filtered telemetry static micro-bursts
      if (stepInBar === 3 || stepInBar === 11 || stepInBar === 14) {
        this.scheduleStaticBurst(ctx, time, 0.045, 1800 + (step % 5) * 450, 0.13);
      }
      return;
    }

    // --- LAYERS: DEDUCTION, COUNTDOWN, STREAK ---
    if (
      stepInBar === 0 ||
      (profile.id === 'STUDIO' && (stepInBar === 6 || stepInBar === 10)) ||
      (profile.id === 'BR' && (stepInBar === 3 || stepInBar === 6 || stepInBar === 10 || stepInBar === 14)) ||
      stepInBar === 8
    ) {
      const bassShift = stepInBar === 8 ? profile.chords[this.chordIndex][0] : 0;
      const amp = stepInBar === 0 ? 0.3 : 0.2;
      this.scheduleSubPulse(ctx, time, semitoneHz(profile.rootHz / 2, bassShift), amp, 0.28);
    }

    if (layer === 'COUNTDOWN') {
      const elapsed = Math.max(0, time - this.countdownStartTime);
      const urgency = clamp(elapsed / 9.5, 0, 1);
      const tickCutoff = 1150 + urgency * 3100; // Rising bandpass tension
      const isStrong = stepInBar % 4 === 0;
      const playTick = urgency > 0.32 ? true : stepInBar % 2 === 0;
      if (playTick) {
        this.scheduleHorologicalPulseTick(ctx, time, tickCutoff, isStrong ? 0.24 : 0.14);
      }
      // Accelerating double-time 32nd ghost tick in final urgency window
      if (urgency > 0.68) {
        this.scheduleHorologicalPulseTick(ctx, time + stepDur * 0.5, tickCutoff * 1.18, 0.12);
      }
      if (stepInBar % 2 === 0) {
        const climbIdx = (Math.floor(stepInBar / 2) + Math.floor(urgency * 4)) % profile.scale.length;
        const octaveLift = urgency > 0.6 && stepInBar >= 8 ? 24 : 12;
        const freq = semitoneHz(profile.rootHz, profile.scale[climbIdx] + octaveLift);
        this.scheduleVenueSoloistNote(ctx, time, profile, freq, 0.15 + urgency * 0.07, 0.22);
      }
    } else {
      if (stepInBar % 2 === 0) {
        const accent = stepInBar % 4 === 0 ? 0.15 : 0.08;
        this.scheduleHorologicalPulseTick(ctx, time, 2200, accent);
      }
      this.scheduleDeductionPattern(ctx, time, step, stepInBar, profile, layer === 'STREAK');
    }

    // Streak Euphoria crystalline fifth/ninth upper counter-melody
    if (layer === 'STREAK') {
      if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6 || stepInBar === 10 || stepInBar === 12) {
        const streakIntervals = [12, 19, 24, 26, 19];
        const semi = streakIntervals[(stepInBar + this.chordIndex) % streakIntervals.length];
        const pan = stepInBar % 2 === 0 ? -0.35 : 0.35;
        this.scheduleCrystalBell(ctx, time, semitoneHz(profile.rootHz, semi), 0.12, 0.55, pan);
      }
    }
  }

  private scheduleDeductionPattern(
    ctx: AudioContext,
    time: number,
    step: number,
    stepInBar: number,
    profile: VenueProfile,
    isStreak: boolean
  ): void {
    const scale = profile.scale;
    const gainBoost = isStreak ? 1.18 : 1.0;

    switch (profile.soloist) {
      case 'glass': {
        if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6 || stepInBar === 10 || stepInBar === 14) {
          const idx = (stepInBar + this.chordIndex * 2) % scale.length;
          const oct = stepInBar === 10 ? 24 : 12;
          this.scheduleVenueSoloistNote(
            ctx,
            time,
            profile,
            semitoneHz(profile.rootHz, scale[idx] + oct),
            0.17 * gainBoost,
            0.45
          );
        }
        break;
      }
      case 'cello': {
        if (
          stepInBar === 0 ||
          stepInBar === 2 ||
          stepInBar === 6 ||
          stepInBar === 8 ||
          stepInBar === 12 ||
          stepInBar === 14
        ) {
          const motif = [0, 2, 4, 2, 3, 1];
          const deg = scale[motif[Math.floor(stepInBar / 2) % motif.length] % scale.length];
          this.scheduleVenueSoloistNote(ctx, time, profile, semitoneHz(profile.rootHz, deg), 0.2 * gainBoost, 0.32);
        }
        break;
      }
      case 'koto': {
        if (
          stepInBar === 0 ||
          stepInBar === 3 ||
          stepInBar === 5 ||
          stepInBar === 8 ||
          stepInBar === 10 ||
          stepInBar === 13
        ) {
          const motif = [0, 3, 4, 2, 1, 3];
          const deg = scale[motif[(step + this.chordIndex) % motif.length] % scale.length];
          const oct = stepInBar === 5 || stepInBar === 13 ? 24 : 12;
          this.scheduleVenueSoloistNote(
            ctx,
            time,
            profile,
            semitoneHz(profile.rootHz, deg + oct),
            0.2 * gainBoost,
            0.38
          );
        }
        break;
      }
      case 'sonar': {
        if (stepInBar === 0 || stepInBar === 6 || stepInBar === 11) {
          const deg = scale[(this.chordIndex + (stepInBar === 11 ? 4 : 0)) % scale.length];
          this.scheduleVenueSoloistNote(
            ctx,
            time,
            profile,
            semitoneHz(profile.rootHz, deg + 24),
            0.17 * gainBoost,
            0.6
          );
        }
        break;
      }
      case 'broadcast': {
        if (stepInBar % 2 === 0) {
          const motif = [0, 4, 2, 4, 0, 5, 4, 2];
          const deg = scale[motif[Math.floor(stepInBar / 2) % motif.length] % scale.length];
          const amp = stepInBar % 4 === 0 ? 0.18 : 0.11;
          this.scheduleVenueSoloistNote(
            ctx,
            time,
            profile,
            semitoneHz(profile.rootHz, deg + 12),
            amp * gainBoost,
            0.24
          );
        }
        break;
      }
      case 'nylon': {
        // Warm syncopated Brazilian samba-bossa nylon guitar arpeggio
        if (
          stepInBar === 0 ||
          stepInBar === 3 ||
          stepInBar === 6 ||
          stepInBar === 10 ||
          stepInBar === 12 ||
          stepInBar === 15
        ) {
          const motif = [0, 2, 4, 5, 4, 2];
          const deg = scale[motif[(step + this.chordIndex) % motif.length] % scale.length];
          const oct = stepInBar === 6 || stepInBar === 15 ? 24 : 12;
          this.scheduleVenueSoloistNote(
            ctx,
            time,
            profile,
            semitoneHz(profile.rootHz, deg + oct),
            0.19 * gainBoost,
            0.34
          );
        }
        break;
      }
      case 'oud': {
        // Hypnotic Cairo Hijaz plucked oud phrasing
        if (
          stepInBar === 0 ||
          stepInBar === 3 ||
          stepInBar === 6 ||
          stepInBar === 8 ||
          stepInBar === 11 ||
          stepInBar === 14
        ) {
          const motif = [0, 1, 2, 4, 2, 1];
          const deg = scale[motif[(Math.floor(step / 2) + this.chordIndex) % motif.length] % scale.length];
          this.scheduleVenueSoloistNote(
            ctx,
            time,
            profile,
            semitoneHz(profile.rootHz, deg + 12),
            0.19 * gainBoost,
            0.42
          );
        }
        break;
      }
      case 'marimba': {
        // Crystalline Icelandic glass marimba shimmer
        if (stepInBar === 0 || stepInBar === 4 || stepInBar === 6 || stepInBar === 10 || stepInBar === 14) {
          const motif = [0, 4, 2, 5, 4];
          const deg = scale[motif[(stepInBar + this.chordIndex) % motif.length] % scale.length];
          const oct = stepInBar === 6 || stepInBar === 14 ? 24 : 12;
          this.scheduleVenueSoloistNote(
            ctx,
            time,
            profile,
            semitoneHz(profile.rootHz, deg + oct),
            0.17 * gainBoost,
            0.52
          );
        }
        break;
      }
      case 'guzheng': {
        // Crisp Singapore guzheng + modular pulse sequence
        if (stepInBar % 2 === 0 || stepInBar === 7 || stepInBar === 15) {
          const motif = [0, 3, 2, 4, 5, 3, 1, 4];
          const deg = scale[motif[(step + this.chordIndex) % motif.length] % scale.length];
          const oct = stepInBar === 7 || stepInBar === 15 ? 24 : 12;
          const amp = stepInBar % 4 === 0 ? 0.19 : 0.12;
          this.scheduleVenueSoloistNote(
            ctx,
            time,
            profile,
            semitoneHz(profile.rootHz, deg + oct),
            amp * gainBoost,
            0.3
          );
        }
        break;
      }
      case 'brass': {
        // Monumental Apex Forum sovereign orchestral horn & brass cadence
        if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
          const motif = [0, 4, 2, 5];
          const deg = scale[motif[(this.chordIndex + (stepInBar === 6 ? 1 : stepInBar === 10 ? 2 : 0)) % motif.length] % scale.length];
          this.scheduleVenueSoloistNote(
            ctx,
            time,
            profile,
            semitoneHz(profile.rootHz, deg + (stepInBar === 10 ? 12 : 0)),
            0.2 * gainBoost,
            0.64
          );
        }
        break;
      }
    }
  }

  private scheduleSubPulse(ctx: AudioContext, time: number, freq: number, amp: number, dur: number): void {
    if (!this.musicBus) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(clampFreq(freq), time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(amp, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(gain);
    gain.connect(this.musicBus);
    osc.start(time);
    osc.stop(time + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  private scheduleHorologicalPulseTick(ctx: AudioContext, time: number, filterHz: number, amp: number): void {
    if (!this.musicBus || !this.noiseBuffer) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(clampFreq(filterHz), time);
    bp.Q.setValueAtTime(6.0, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(amp, time + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.018);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(this.musicBus);

    src.start(time, Math.random() * 1.2, 0.025);
    src.onended = () => {
      src.disconnect();
      bp.disconnect();
      gain.disconnect();
    };
  }

  private scheduleVenueSoloistNote(
    ctx: AudioContext,
    time: number,
    profile: VenueProfile,
    freq: number,
    amp: number,
    dur: number
  ): void {
    if (!this.musicBus) return;

    switch (profile.soloist) {
      case 'glass': {
        this.scheduleCrystalBell(ctx, time, freq, amp, dur, (Math.random() - 0.5) * 0.45);
        break;
      }
      case 'cello': {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(clampFreq(freq), time);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(clampFreq(freq * 4.2), time);
        filter.frequency.exponentialRampToValueAtTime(clampFreq(freq * 1.4), time + dur);
        filter.Q.setValueAtTime(1.5, time);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(amp, time + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicBus);
        osc.start(time);
        osc.stop(time + dur + 0.02);
        osc.onended = () => {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
        break;
      }
      case 'koto': {
        // Plucked FM Koto voice: bright decaying FM index + subtle silk string tension settle
        const carrier = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const env = ctx.createGain();
        const panner = this.createPanner(ctx, (Math.random() - 0.5) * 0.5);

        carrier.type = 'triangle';
        carrier.frequency.setValueAtTime(clampFreq(freq * 1.012), time);
        carrier.frequency.exponentialRampToValueAtTime(clampFreq(freq), time + 0.04);

        mod.type = 'sine';
        mod.frequency.setValueAtTime(clampFreq(freq * 2.0), time);
        modGain.gain.setValueAtTime(freq * 1.45, time);
        modGain.gain.exponentialRampToValueAtTime(0.5, time + 0.085);

        env.gain.setValueAtTime(0.0001, time);
        env.gain.linearRampToValueAtTime(amp, time + 0.004);
        env.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        mod.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(env);
        env.connect(panner);
        panner.connect(this.musicBus);

        carrier.start(time);
        mod.start(time);
        carrier.stop(time + dur + 0.02);
        mod.stop(time + dur + 0.02);
        carrier.onended = () => {
          carrier.disconnect();
          mod.disconnect();
          modGain.disconnect();
          env.disconnect();
          panner.disconnect();
        };
        break;
      }
      case 'sonar': {
        const taps = [
          { delay: 0, gain: amp, pan: 0 },
          { delay: 0.21, gain: amp * 0.42, pan: -0.45 },
          { delay: 0.42, gain: amp * 0.2, pan: 0.45 },
        ];
        for (const tap of taps) {
          const t = time + tap.delay;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const pan = this.createPanner(ctx, tap.pan);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(clampFreq(freq), t);
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(tap.gain, t + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.75);
          osc.connect(gain);
          gain.connect(pan);
          pan.connect(this.musicBus);
          osc.start(t);
          osc.stop(t + dur * 0.75 + 0.02);
          osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
            pan.disconnect();
          };
        }
        break;
      }
      case 'broadcast': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g1 = ctx.createGain();
        const g2 = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(clampFreq(freq), time);
        osc2.frequency.setValueAtTime(clampFreq(freq * 3.0), time);

        g1.gain.setValueAtTime(0.0001, time);
        g1.gain.linearRampToValueAtTime(amp, time + 0.005);
        g1.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        g2.gain.setValueAtTime(0.0001, time);
        g2.gain.linearRampToValueAtTime(amp * 0.22, time + 0.003);
        g2.gain.exponentialRampToValueAtTime(0.0001, time + dur * 0.35);

        osc1.connect(g1);
        osc2.connect(g2);
        g1.connect(this.musicBus);
        g2.connect(this.musicBus);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + dur + 0.02);
        osc2.stop(time + dur * 0.38);
        osc1.onended = () => {
          osc1.disconnect();
          osc2.disconnect();
          g1.disconnect();
          g2.disconnect();
        };
        break;
      }
      case 'nylon': {
        // Warm plucked nylon-string guitar (filtered triangle + warm body fundamental)
        const osc = ctx.createOscillator();
        const body = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const env = ctx.createGain();
        const bodyGain = ctx.createGain();
        const panner = this.createPanner(ctx, (Math.random() - 0.5) * 0.42);

        osc.type = 'triangle';
        body.type = 'sine';
        osc.frequency.setValueAtTime(clampFreq(freq), time);
        body.frequency.setValueAtTime(clampFreq(freq * 0.5), time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(clampFreq(freq * 5.2), time);
        filter.frequency.exponentialRampToValueAtTime(clampFreq(freq * 1.35), time + dur * 0.85);
        filter.Q.setValueAtTime(1.2, time);

        bodyGain.gain.setValueAtTime(0.32, time);
        env.gain.setValueAtTime(0.0001, time);
        env.gain.linearRampToValueAtTime(amp, time + 0.005);
        env.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        osc.connect(filter);
        body.connect(bodyGain);
        bodyGain.connect(filter);
        filter.connect(env);
        env.connect(panner);
        panner.connect(this.musicBus);

        osc.start(time);
        body.start(time);
        osc.stop(time + dur + 0.02);
        body.stop(time + dur + 0.02);
        osc.onended = () => {
          osc.disconnect();
          body.disconnect();
          bodyGain.disconnect();
          filter.disconnect();
          env.disconnect();
          panner.disconnect();
        };
        break;
      }
      case 'oud': {
        // Cairo plucked oud with subtle quarter-tone ornament glide + woody bandpass resonance
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const env = ctx.createGain();
        const panner = this.createPanner(ctx, (Math.random() - 0.5) * 0.4);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(clampFreq(freq * 0.972), time);
        osc.frequency.exponentialRampToValueAtTime(clampFreq(freq), time + 0.032);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(clampFreq(freq * 4.8), time);
        filter.frequency.exponentialRampToValueAtTime(clampFreq(freq * 1.45), time + dur);
        filter.Q.setValueAtTime(2.6, time);

        env.gain.setValueAtTime(0.0001, time);
        env.gain.linearRampToValueAtTime(amp * 0.9, time + 0.004);
        env.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        osc.connect(filter);
        filter.connect(env);
        env.connect(panner);
        panner.connect(this.musicBus);

        osc.start(time);
        osc.stop(time + dur + 0.02);
        osc.onended = () => {
          osc.disconnect();
          filter.disconnect();
          env.disconnect();
          panner.disconnect();
        };
        break;
      }
      case 'marimba': {
        // Reykjavik crystalline glass marimba (fundamental + 3.98x resonant bar overtone)
        const fund = ctx.createOscillator();
        const barOvertone = ctx.createOscillator();
        const ovGain = ctx.createGain();
        const env = ctx.createGain();
        const panner = this.createPanner(ctx, (Math.random() - 0.5) * 0.65);

        fund.type = 'sine';
        barOvertone.type = 'sine';
        fund.frequency.setValueAtTime(clampFreq(freq), time);
        barOvertone.frequency.setValueAtTime(clampFreq(freq * 3.98), time);

        ovGain.gain.setValueAtTime(0.24, time);
        ovGain.gain.exponentialRampToValueAtTime(0.001, time + Math.min(0.14, dur * 0.4));

        env.gain.setValueAtTime(0.0001, time);
        env.gain.linearRampToValueAtTime(amp, time + 0.003);
        env.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        fund.connect(env);
        barOvertone.connect(ovGain);
        ovGain.connect(env);
        env.connect(panner);
        panner.connect(this.musicBus);

        fund.start(time);
        barOvertone.start(time);
        fund.stop(time + dur + 0.02);
        barOvertone.stop(time + Math.min(0.18, dur * 0.5));
        fund.onended = () => {
          fund.disconnect();
          barOvertone.disconnect();
          ovGain.disconnect();
          env.disconnect();
          panner.disconnect();
        };
        break;
      }
      case 'guzheng': {
        // Singapore guzheng + sleek modular FM pluck
        const carrier = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const env = ctx.createGain();
        const panner = this.createPanner(ctx, (Math.random() - 0.5) * 0.55);

        carrier.type = 'sawtooth';
        carrier.frequency.setValueAtTime(clampFreq(freq * 1.008), time);
        carrier.frequency.exponentialRampToValueAtTime(clampFreq(freq), time + 0.028);

        mod.type = 'sine';
        mod.frequency.setValueAtTime(clampFreq(freq * 3.0), time);
        modGain.gain.setValueAtTime(freq * 1.1, time);
        modGain.gain.exponentialRampToValueAtTime(0.5, time + 0.075);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(clampFreq(freq * 6.0), time);
        filter.frequency.exponentialRampToValueAtTime(clampFreq(freq * 1.6), time + dur);
        filter.Q.setValueAtTime(1.8, time);

        env.gain.setValueAtTime(0.0001, time);
        env.gain.linearRampToValueAtTime(amp * 0.85, time + 0.003);
        env.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        mod.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(filter);
        filter.connect(env);
        env.connect(panner);
        panner.connect(this.musicBus);

        carrier.start(time);
        mod.start(time);
        carrier.stop(time + dur + 0.02);
        mod.stop(time + dur + 0.02);
        carrier.onended = () => {
          carrier.disconnect();
          mod.disconnect();
          modGain.disconnect();
          filter.disconnect();
          env.disconnect();
          panner.disconnect();
        };
        break;
      }
      case 'brass': {
        // Apex Forum monumental sovereign orchestral brass / French-horn swell
        const oscA = ctx.createOscillator();
        const oscB = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const env = ctx.createGain();

        oscA.type = 'sawtooth';
        oscB.type = 'sawtooth';
        oscA.frequency.setValueAtTime(clampFreq(freq), time);
        oscB.frequency.setValueAtTime(clampFreq(freq), time);
        oscA.detune.setValueAtTime(-5.5, time);
        oscB.detune.setValueAtTime(5.5, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(clampFreq(freq * 1.4), time);
        filter.frequency.linearRampToValueAtTime(clampFreq(freq * 4.4), time + dur * 0.28);
        filter.frequency.exponentialRampToValueAtTime(clampFreq(freq * 1.5), time + dur);
        filter.Q.setValueAtTime(1.4, time);

        env.gain.setValueAtTime(0.0001, time);
        env.gain.linearRampToValueAtTime(amp * 0.78, time + Math.min(0.09, dur * 0.25));
        env.gain.exponentialRampToValueAtTime(0.0001, time + dur);

        oscA.connect(filter);
        oscB.connect(filter);
        filter.connect(env);
        env.connect(this.musicBus);

        oscA.start(time);
        oscB.start(time);
        oscA.stop(time + dur + 0.03);
        oscB.stop(time + dur + 0.03);
        oscA.onended = () => {
          oscA.disconnect();
          oscB.disconnect();
          filter.disconnect();
          env.disconnect();
        };
        break;
      }
    }
  }

  private scheduleCrystalBell(
    ctx: AudioContext,
    time: number,
    freq: number,
    amp: number,
    dur: number,
    pan: number
  ): void {
    if (!this.musicBus) return;
    const fundamental = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    const env = ctx.createGain();
    const panner = this.createPanner(ctx, pan);

    fundamental.type = 'sine';
    overtone.type = 'sine';
    fundamental.frequency.setValueAtTime(clampFreq(freq), time);
    overtone.frequency.setValueAtTime(clampFreq(freq * 2.756), time);
    overtoneGain.gain.setValueAtTime(0.18, time);

    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(amp, time + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    fundamental.connect(env);
    overtone.connect(overtoneGain);
    overtoneGain.connect(env);
    env.connect(panner);
    panner.connect(this.musicBus);

    fundamental.start(time);
    overtone.start(time);
    fundamental.stop(time + dur + 0.02);
    overtone.stop(time + dur * 0.65);
    fundamental.onended = () => {
      fundamental.disconnect();
      overtone.disconnect();
      overtoneGain.disconnect();
      env.disconnect();
      panner.disconnect();
    };
  }

  private scheduleMetallicFractureHit(ctx: AudioContext, time: number, freq: number, amp: number): void {
    if (!this.musicBus) return;
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const bp = ctx.createBiquadFilter();
    const env = ctx.createGain();

    oscA.type = 'sawtooth';
    oscB.type = 'square';
    oscA.frequency.setValueAtTime(clampFreq(freq), time);
    oscB.frequency.setValueAtTime(clampFreq(freq * 1.414), time);

    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(clampFreq(freq * 2.4), time);
    bp.Q.setValueAtTime(4.5, time);

    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(amp, time + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);

    oscA.connect(bp);
    oscB.connect(bp);
    bp.connect(env);
    env.connect(this.musicBus);

    oscA.start(time);
    oscB.start(time);
    oscA.stop(time + 0.26);
    oscB.stop(time + 0.26);
    oscA.onended = () => {
      oscA.disconnect();
      oscB.disconnect();
      bp.disconnect();
      env.disconnect();
    };
  }

  private scheduleStaticBurst(
    ctx: AudioContext,
    time: number,
    dur: number,
    centerHz: number,
    amp: number
  ): void {
    if (!this.musicBus || !this.noiseBuffer) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(clampFreq(centerHz), time);
    bp.Q.setValueAtTime(3.2, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(amp, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(this.musicBus);
    src.start(time, Math.random() * 1.2, dur + 0.01);
    src.onended = () => {
      src.disconnect();
      bp.disconnect();
      gain.disconnect();
    };
  }

  private triggerFractureSubDrop(): void {
    const ctx = this.getReadyContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const sub = ctx.createOscillator();
    const subHarm = ctx.createOscillator();
    const env = ctx.createGain();
    const harmGain = ctx.createGain();

    sub.type = 'sine';
    subHarm.type = 'triangle';
    sub.frequency.setValueAtTime(98, now);
    sub.frequency.exponentialRampToValueAtTime(30, now + 0.72);
    subHarm.frequency.setValueAtTime(196, now);
    subHarm.frequency.exponentialRampToValueAtTime(60, now + 0.55);

    harmGain.gain.setValueAtTime(0.24, now);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.45, now + 0.016);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    sub.connect(env);
    subHarm.connect(harmGain);
    harmGain.connect(env);
    this.connectSfx(env, 'lush');

    sub.start(now);
    subHarm.start(now);
    sub.stop(now + 0.88);
    subHarm.stop(now + 0.6);
    sub.onended = () => {
      sub.disconnect();
      subHarm.disconnect();
      harmGain.disconnect();
      env.disconnect();
    };
  }

  public setVenueMusic(venue: VenueId, layer?: MusicLayer): void {
    const prevLayer = this.currentLayer;
    this.currentVenue = venue;
    if (layer !== undefined) {
      this.currentLayer = layer;
    }

    if (this.ctx) {
      if (this.currentLayer === 'COUNTDOWN' && prevLayer !== 'COUNTDOWN') {
        this.countdownStartTime = this.ctx.currentTime;
      }
      if (this.currentLayer === 'FRACTURE' && prevLayer !== 'FRACTURE') {
        this.triggerFractureSubDrop();
      }
      this.applyVenueAndLayerParams(false);
    }
  }

  public setMusicLayer(layer: MusicLayer): void {
    const prevLayer = this.currentLayer;
    this.currentLayer = layer;

    if (this.ctx) {
      if (layer === 'COUNTDOWN' && prevLayer !== 'COUNTDOWN') {
        this.countdownStartTime = this.ctx.currentTime;
      }
      if (layer === 'FRACTURE' && prevLayer !== 'FRACTURE') {
        this.triggerFractureSubDrop();
      }
      this.applyVenueAndLayerParams(false);
    }
  }

  // --------------------------------------------------------------------------
  // Tactile "Machined Luxury" Foley Suite
  // --------------------------------------------------------------------------

  public playSpinTick(velocity = 1): void {
    const tMs = nowPerfMs();
    if (tMs - this.lastSpinTickMs < 35) return;
    this.lastSpinTickMs = tMs;

    const ctx = this.getReadyContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;
    const v = clamp(Math.abs(velocity || 0.85), 0.2, 3.0);
    const jitter = 0.975 + Math.random() * 0.05;

    // 1. Crisp 10ms bandpass impulse (physical brushed-metal & glass micro-click)
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(clampFreq((3200 + v * 720) * jitter), now);
    bp.Q.setValueAtTime(7.8, now);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.0001, now);
    nGain.gain.linearRampToValueAtTime(0.24 + v * 0.05, now + 0.0012);
    nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.011);

    noise.connect(bp);
    bp.connect(nGain);
    this.connectSfx(nGain, 'tight');
    noise.start(now, Math.random() * 1.2, 0.016);
    noise.onended = () => {
      noise.disconnect();
      bp.disconnect();
      nGain.disconnect();
    };

    // 2. High-Q Swiss watch escapement metallic tick (paired inharmonic micro-partials)
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const mGain = ctx.createGain();
    oscA.type = 'sine';
    oscB.type = 'triangle';
    oscA.frequency.setValueAtTime(clampFreq((2450 + v * 380) * jitter), now);
    oscB.frequency.setValueAtTime(clampFreq((4320 + v * 520) * jitter), now);

    mGain.gain.setValueAtTime(0.0001, now);
    mGain.gain.linearRampToValueAtTime(0.11 + v * 0.025, now + 0.001);
    mGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    oscA.connect(mGain);
    oscB.connect(mGain);
    this.connectSfx(mGain, 'tight');

    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + 0.018);
    oscB.stop(now + 0.018);
    oscA.onended = () => {
      oscA.disconnect();
      oscB.disconnect();
      mGain.disconnect();
    };
  }

  private fireGlassBrassDetent(ctx: AudioContext, now: number): void {
    if (!this.noiseBuffer) return;

    // Detent 1 (t=0): Optical glass contact tap
    const n1 = ctx.createBufferSource();
    n1.buffer = this.noiseBuffer;
    const bp1 = ctx.createBiquadFilter();
    bp1.type = 'bandpass';
    bp1.frequency.setValueAtTime(2850, now);
    bp1.Q.setValueAtTime(5.2, now);
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.0001, now);
    g1.gain.linearRampToValueAtTime(0.28, now + 0.0015);
    g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);
    n1.connect(bp1);
    bp1.connect(g1);
    this.connectSfx(g1, 'medium');
    n1.start(now, Math.random() * 1.1, 0.022);
    n1.onended = () => {
      n1.disconnect();
      bp1.disconnect();
      g1.disconnect();
    };

    const ring1 = ctx.createOscillator();
    const rg1 = ctx.createGain();
    ring1.type = 'sine';
    ring1.frequency.setValueAtTime(1760, now);
    rg1.gain.setValueAtTime(0.0001, now);
    rg1.gain.linearRampToValueAtTime(0.12, now + 0.0015);
    rg1.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
    ring1.connect(rg1);
    this.connectSfx(rg1, 'medium');
    ring1.start(now);
    ring1.stop(now + 0.032);
    ring1.onended = () => {
      ring1.disconnect();
      rg1.disconnect();
    };

    // Detent 2 (t+26ms): Magnetic brass seat CLACK
    const t2 = now + 0.026;
    const n2 = ctx.createBufferSource();
    n2.buffer = this.noiseBuffer;
    const bp2 = ctx.createBiquadFilter();
    bp2.type = 'bandpass';
    bp2.frequency.setValueAtTime(1480, t2);
    bp2.Q.setValueAtTime(4.0, t2);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t2);
    g2.gain.linearRampToValueAtTime(0.32, t2 + 0.0015);
    g2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.02);
    n2.connect(bp2);
    bp2.connect(g2);
    this.connectSfx(g2, 'medium');
    n2.start(t2, Math.random() * 1.1, 0.025);
    n2.onended = () => {
      n2.disconnect();
      bp2.disconnect();
      g2.disconnect();
    };

    const brass = ctx.createOscillator();
    const brassOver = ctx.createOscillator();
    const bg = ctx.createGain();
    brass.type = 'triangle';
    brassOver.type = 'sine';
    brass.frequency.setValueAtTime(680, t2);
    brass.frequency.exponentialRampToValueAtTime(440, t2 + 0.042);
    brassOver.frequency.setValueAtTime(1320, t2);

    bg.gain.setValueAtTime(0.0001, t2);
    bg.gain.linearRampToValueAtTime(0.18, t2 + 0.002);
    bg.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.048);

    brass.connect(bg);
    brassOver.connect(bg);
    this.connectSfx(bg, 'medium');
    brass.start(t2);
    brassOver.start(t2);
    brass.stop(t2 + 0.052);
    brassOver.stop(t2 + 0.052);
    brass.onended = () => {
      brass.disconnect();
      brassOver.disconnect();
      bg.disconnect();
    };
  }

  public playSightlineSnap(): void {
    const tMs = nowPerfMs();
    if (tMs - this.lastSightlineSnapMs < 24) return;
    this.lastSightlineSnapMs = tMs;

    const ctx = this.getReadyContext();
    if (!ctx) return;
    this.fireGlassBrassDetent(ctx, ctx.currentTime);
  }

  public playPeelShutter(tier: PeelTier): void {
    const ctx = this.getReadyContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;
    const profile = VENUE_PROFILES[this.currentVenue];

    if (tier === 1) {
      this.fireGlassBrassDetent(ctx, now);
      return;
    }

    const isTier3 = tier === 3;

    // 1. Pneumatic filtered white-noise iris hiss
    const hiss = ctx.createBufferSource();
    hiss.buffer = this.noiseBuffer;
    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = 'bandpass';
    hissFilter.Q.setValueAtTime(isTier3 ? 2.4 : 3.2, now);
    hissFilter.frequency.setValueAtTime(isTier3 ? 620 : 950, now);
    hissFilter.frequency.exponentialRampToValueAtTime(isTier3 ? 5200 : 4100, now + (isTier3 ? 0.16 : 0.12));
    hissFilter.frequency.exponentialRampToValueAtTime(1350, now + (isTier3 ? 0.36 : 0.27));

    const hissGain = ctx.createGain();
    hissGain.gain.setValueAtTime(0.0001, now);
    hissGain.gain.linearRampToValueAtTime(isTier3 ? 0.32 : 0.24, now + 0.025);
    hissGain.gain.exponentialRampToValueAtTime(0.0001, now + (isTier3 ? 0.38 : 0.28));

    hiss.connect(hissFilter);
    hissFilter.connect(hissGain);
    this.connectSfx(hissGain, 'lush');
    hiss.start(now, Math.random() * 0.8, isTier3 ? 0.42 : 0.32);
    hiss.onended = () => {
      hiss.disconnect();
      hissFilter.disconnect();
      hissGain.disconnect();
    };

    if (isTier3) {
      // Tier 3: Deeper mechanical unfold + bright metallic-glass shard scatter
      const mech = ctx.createOscillator();
      const mechFilter = ctx.createBiquadFilter();
      const mechGain = ctx.createGain();
      mech.type = 'sawtooth';
      mech.frequency.setValueAtTime(168, now);
      mech.frequency.exponentialRampToValueAtTime(86, now + 0.24);
      mechFilter.type = 'lowpass';
      mechFilter.frequency.setValueAtTime(520, now);
      mechGain.gain.setValueAtTime(0.0001, now);
      mechGain.gain.linearRampToValueAtTime(0.28, now + 0.015);
      mechGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      mech.connect(mechFilter);
      mechFilter.connect(mechGain);
      this.connectSfx(mechGain, 'medium');
      mech.start(now);
      mech.stop(now + 0.3);
      mech.onended = () => {
        mech.disconnect();
        mechFilter.disconnect();
        mechGain.disconnect();
      };

      const shardDelays = [0.05, 0.095, 0.135, 0.19, 0.25];
      const shardSemis = [19, 24, 26, 31, 36];
      const shardPans = [-0.65, 0.55, -0.3, 0.72, 0.1];
      shardDelays.forEach((delay, idx) => {
        const t = now + delay;
        const baseFreq = semitoneHz(profile.rootHz, shardSemis[idx]);
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        const g = ctx.createGain();
        const pan = this.createPanner(ctx, shardPans[idx]);
        o1.type = 'sine';
        o2.type = 'triangle';
        o1.frequency.setValueAtTime(baseFreq, t);
        o2.frequency.setValueAtTime(clampFreq(baseFreq * 2.756), t);

        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.14 - idx * 0.014, t + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

        o1.connect(g);
        o2.connect(g);
        g.connect(pan);
        this.connectSfx(pan, 'hall');

        o1.start(t);
        o2.start(t);
        o1.stop(t + 0.45);
        o2.stop(t + 0.28);
        o1.onended = () => {
          o1.disconnect();
          o2.disconnect();
          g.disconnect();
          pan.disconnect();
        };
      });
    } else {
      // Tier 2: Pneumatic iris hiss + shimmering crystal chord
      const chordSemis = [12, 19, 26];
      chordSemis.forEach((semi, idx) => {
        const t = now + 0.04 + idx * 0.028;
        const freq = semitoneHz(profile.rootHz, semi);
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const pan = this.createPanner(ctx, (idx - 1) * 0.4);
        osc.type = idx === 2 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, t);

        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.14, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);

        osc.connect(g);
        g.connect(pan);
        this.connectSfx(pan, 'hall');

        osc.start(t);
        osc.stop(t + 0.65);
        osc.onended = () => {
          osc.disconnect();
          g.disconnect();
          pan.disconnect();
        };
      });
    }
  }

  // --------------------------------------------------------------------------
  // Overclock Hold-to-Lock Charge & Vault-Bolt Thunk / Pressure Vent
  // --------------------------------------------------------------------------

  public startOverclockCharge(): void {
    if (this.overclockNodes) {
      this.cleanupOverclockNodes(false);
    }

    const ctx = this.getReadyContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.lastOverclockProgress = 0;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(1.0, now + 0.04);
    this.connectSfx(masterGain, 'medium');

    // Rising dual-oscillator precision turbine
    const turbineA = ctx.createOscillator();
    const turbineB = ctx.createOscillator();
    turbineA.type = 'sawtooth';
    turbineB.type = 'triangle';
    turbineA.frequency.setValueAtTime(118, now);
    turbineB.frequency.setValueAtTime(236.8, now);

    const turbineFilter = ctx.createBiquadFilter();
    turbineFilter.type = 'bandpass';
    turbineFilter.frequency.setValueAtTime(420, now);
    turbineFilter.Q.setValueAtTime(2.6, now);

    const turbineGain = ctx.createGain();
    turbineGain.gain.setValueAtTime(0.11, now);

    turbineA.connect(turbineFilter);
    turbineB.connect(turbineFilter);
    turbineFilter.connect(turbineGain);
    turbineGain.connect(masterGain);

    // Muffled accelerating heartbeat sub
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(54, now);

    const subAmp = ctx.createGain();
    subAmp.gain.setValueAtTime(0.18, now);

    const subLfo = ctx.createOscillator();
    subLfo.type = 'sine';
    subLfo.frequency.setValueAtTime(2.4, now);
    const subLfoDepth = ctx.createGain();
    subLfoDepth.gain.setValueAtTime(0.14, now);

    subLfo.connect(subLfoDepth);
    subLfoDepth.connect(subAmp.gain);
    subOsc.connect(subAmp);
    subAmp.connect(masterGain);

    turbineA.start(now);
    turbineB.start(now);
    subOsc.start(now);
    subLfo.start(now);

    // Safety watchdog so a dropped pointer event never leaves a stuck oscillator
    const watchdogTimer = setTimeout(() => {
      if (this.overclockNodes) {
        this.cleanupOverclockNodes(false);
      }
    }, 12000);

    this.overclockNodes = {
      turbineA,
      turbineB,
      turbineFilter,
      turbineGain,
      subOsc,
      subAmp,
      subLfo,
      subLfoDepth,
      masterGain,
      watchdogTimer,
    };
  }

  public updateOverclockCharge(progress: number): void {
    const p = clamp(progress, 0, 1);
    this.lastOverclockProgress = p;
    if (!this.overclockNodes || !this.ctx) return;

    const now = this.ctx.currentTime;
    const nodes = this.overclockNodes;
    const eased = p * p * 0.4 + p * 0.6;

    nodes.turbineA.frequency.setTargetAtTime(118 + eased * 350, now, 0.035);
    nodes.turbineB.frequency.setTargetAtTime(237 + eased * 940, now, 0.035);
    nodes.turbineFilter.frequency.setTargetAtTime(420 + eased * 3100, now, 0.04);
    nodes.turbineGain.gain.setTargetAtTime(0.11 + eased * 0.14, now, 0.04);

    nodes.subOsc.frequency.setTargetAtTime(54 + eased * 24, now, 0.04);
    nodes.subLfo.frequency.setTargetAtTime(2.4 + eased * 5.6, now, 0.05);
    nodes.subAmp.gain.setTargetAtTime(0.18 + eased * 0.12, now, 0.04);
  }

  public stopOverclockCharge(committed: boolean): void {
    const wasCharging = this.overclockNodes !== null;
    const progressAtStop = this.lastOverclockProgress;
    this.lastOverclockProgress = 0;

    if (wasCharging) {
      this.cleanupOverclockNodes(true);
    }

    if (committed) {
      this.playVaultBoltThunk(progressAtStop);
    } else if (wasCharging) {
      this.playPneumaticVentWhoosh();
    }
  }

  private cleanupOverclockNodes(smoothFade: boolean): void {
    const nodes = this.overclockNodes;
    this.overclockNodes = null;
    this.lastOverclockProgress = 0;
    if (!nodes) return;

    if (nodes.watchdogTimer !== null) {
      clearTimeout(nodes.watchdogTimer);
      nodes.watchdogTimer = null;
    }

    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;
    const stopDelay = smoothFade ? 0.045 : 0.015;
    try {
      nodes.masterGain.gain.cancelScheduledValues(now);
      nodes.masterGain.gain.setTargetAtTime(0.0001, now, stopDelay * 0.35);
      const stopAt = now + stopDelay + 0.02;
      nodes.turbineA.stop(stopAt);
      nodes.turbineB.stop(stopAt);
      nodes.subOsc.stop(stopAt);
      nodes.subLfo.stop(stopAt);
      nodes.turbineA.onended = () => {
        nodes.turbineA.disconnect();
        nodes.turbineB.disconnect();
        nodes.turbineFilter.disconnect();
        nodes.turbineGain.disconnect();
        nodes.subOsc.disconnect();
        nodes.subAmp.disconnect();
        nodes.subLfo.disconnect();
        nodes.subLfoDepth.disconnect();
        nodes.masterGain.disconnect();
      };
    } catch {
      // Ignore already-stopped nodes
    }
  }

  private playVaultBoltThunk(chargeRatio: number): void {
    const ctx = this.getReadyContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;
    const weight = 0.85 + clamp(chargeRatio, 0, 1) * 0.35;

    // 1. Heavy sub punch + warm 2nd harmonic
    const sub = ctx.createOscillator();
    const subWarm = ctx.createOscillator();
    const subEnv = ctx.createGain();
    sub.type = 'sine';
    subWarm.type = 'triangle';
    sub.frequency.setValueAtTime(142, now);
    sub.frequency.exponentialRampToValueAtTime(38, now + 0.16);
    subWarm.frequency.setValueAtTime(284, now);
    subWarm.frequency.exponentialRampToValueAtTime(76, now + 0.12);

    subEnv.gain.setValueAtTime(0.0001, now);
    subEnv.gain.linearRampToValueAtTime(0.48 * weight, now + 0.005);
    subEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    sub.connect(subEnv);
    subWarm.connect(subEnv);
    this.connectSfx(subEnv, 'medium');
    sub.start(now);
    subWarm.start(now);
    sub.stop(now + 0.26);
    subWarm.stop(now + 0.2);
    sub.onended = () => {
      sub.disconnect();
      subWarm.disconnect();
      subEnv.disconnect();
    };

    // 2. Machined steel bolt impact transient
    const boltNoise = ctx.createBufferSource();
    boltNoise.buffer = this.noiseBuffer;
    const boltBp = ctx.createBiquadFilter();
    boltBp.type = 'bandpass';
    boltBp.frequency.setValueAtTime(1250, now);
    boltBp.Q.setValueAtTime(2.6, now);
    const boltGain = ctx.createGain();
    boltGain.gain.setValueAtTime(0.0001, now);
    boltGain.gain.linearRampToValueAtTime(0.42, now + 0.002);
    boltGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);
    boltNoise.connect(boltBp);
    boltBp.connect(boltGain);
    this.connectSfx(boltGain, 'medium');
    boltNoise.start(now, Math.random() * 1.1, 0.04);
    boltNoise.onended = () => {
      boltNoise.disconnect();
      boltBp.disconnect();
      boltGain.disconnect();
    };

    // 3. Secondary mechanical latch seat (22ms later) + brass resonance
    const tLatch = now + 0.022;
    const latch = ctx.createOscillator();
    const latchOver = ctx.createOscillator();
    const latchGain = ctx.createGain();
    latch.type = 'triangle';
    latchOver.type = 'sine';
    latch.frequency.setValueAtTime(320, tLatch);
    latchOver.frequency.setValueAtTime(1180, tLatch);
    latchGain.gain.setValueAtTime(0.0001, tLatch);
    latchGain.gain.linearRampToValueAtTime(0.2, tLatch + 0.003);
    latchGain.gain.exponentialRampToValueAtTime(0.0001, tLatch + 0.14);

    latch.connect(latchGain);
    latchOver.connect(latchGain);
    this.connectSfx(latchGain, 'medium');
    latch.start(tLatch);
    latchOver.start(tLatch);
    latch.stop(tLatch + 0.16);
    latchOver.stop(tLatch + 0.12);
    latch.onended = () => {
      latch.disconnect();
      latchOver.disconnect();
      latchGain.disconnect();
    };
  }

  private playPneumaticVentWhoosh(): void {
    const ctx = this.getReadyContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(3400, now);
    bp.frequency.exponentialRampToValueAtTime(420, now + 0.24);
    bp.Q.setValueAtTime(2.0, now);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.24, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    src.connect(bp);
    bp.connect(g);
    this.connectSfx(g, 'medium');
    src.start(now, Math.random() * 1.0, 0.28);
    src.onended = () => {
      src.disconnect();
      bp.disconnect();
      g.disconnect();
    };

    const spin = ctx.createOscillator();
    const sg = ctx.createGain();
    spin.type = 'sine';
    spin.frequency.setValueAtTime(270, now);
    spin.frequency.exponentialRampToValueAtTime(88, now + 0.2);
    sg.gain.setValueAtTime(0.08, now);
    sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.21);
    spin.connect(sg);
    this.connectSfx(sg, 'medium');
    spin.start(now);
    spin.stop(now + 0.22);
    spin.onended = () => {
      spin.disconnect();
      sg.disconnect();
    };
  }

  // --------------------------------------------------------------------------
  // Calibrator Dial, Reveals, Gauntlet, Story Stings & UI Tap
  // --------------------------------------------------------------------------

  public playCalibratorTick(tightness: number): void {
    const tMs = nowPerfMs();
    if (tMs - this.lastCalibratorTickMs < 32) return;
    this.lastCalibratorTickMs = tMs;

    const ctx = this.getReadyContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;
    const t = clamp(tightness, 0, 1);

    // Pitch-ascending precision brass astrolabe detent
    const baseHz = 560 * Math.pow(3.1, t); // 560 Hz -> ~1736 Hz
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = 'triangle';
    overtone.type = 'sine';
    osc.frequency.setValueAtTime(clampFreq(baseHz), now);
    overtone.frequency.setValueAtTime(clampFreq(baseHz * 2.0), now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.15 + t * 0.05, now + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.042 + t * 0.025);

    osc.connect(g);
    overtone.connect(g);
    this.connectSfx(g, t > 0.72 ? 'lush' : 'medium');

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 0.075);
    overtone.stop(now + 0.075);
    osc.onended = () => {
      osc.disconnect();
      overtone.disconnect();
      g.disconnect();
    };

    const n = ctx.createBufferSource();
    n.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(clampFreq(2600 + t * 2400), now);
    bp.Q.setValueAtTime(7.0, now);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, now);
    ng.gain.linearRampToValueAtTime(0.16, now + 0.001);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.009);
    n.connect(bp);
    bp.connect(ng);
    this.connectSfx(ng, 'tight');
    n.start(now, Math.random() * 1.2, 0.014);
    n.onended = () => {
      n.disconnect();
      bp.disconnect();
      ng.disconnect();
    };
  }

  public playCorrectReveal(streak: number, overclocked: boolean): void {
    const ctx = this.getReadyContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const profile = VENUE_PROFILES[this.currentVenue];
    const safeStreak = clamp(streak, 0, 20);
    const radiant = overclocked || safeStreak >= 3;

    // Venue key-matched lush Major-9th / Quintal harmonic bloom
    const intervals =
      profile.id === 'JP'
        ? [0, 7, 12, 14, 19, 24]
        : [0, 7, 12, 16, 19, 26];

    intervals.forEach((semi, idx) => {
      const t = now + idx * 0.042;
      const freq = semitoneHz(profile.rootHz, semi);
      const pan = this.createPanner(ctx, (idx % 2 === 0 ? -1 : 1) * (idx * 0.14));

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const env = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(clampFreq(freq * 2.0), t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(radiant ? 4200 : 2800, t);
      filter.frequency.exponentialRampToValueAtTime(1100, t + 1.15);

      const peak = (idx === 0 ? 0.18 : 0.13) * (radiant ? 1.12 : 1.0);
      env.gain.setValueAtTime(0.0001, t);
      env.gain.linearRampToValueAtTime(peak, t + 0.025);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(env);
      env.connect(pan);
      this.connectSfx(pan, 'hall');

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 1.3);
      osc2.stop(t + 0.95);
      osc1.onended = () => {
        osc1.disconnect();
        osc2.disconnect();
        filter.disconnect();
        env.disconnect();
        pan.disconnect();
      };
    });

    // Extra radiant brass shimmer when Overclocked or Streak >= 3
    if (radiant) {
      const brassIntervals = [-12, -5, 4];
      brassIntervals.forEach((semi) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const env = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(semitoneHz(profile.rootHz, semi), now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(340, now);
        filter.frequency.exponentialRampToValueAtTime(1950, now + 0.16);
        filter.frequency.exponentialRampToValueAtTime(520, now + 1.1);
        filter.Q.setValueAtTime(1.4, now);

        env.gain.setValueAtTime(0.0001, now);
        env.gain.linearRampToValueAtTime(0.11, now + 0.08);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(filter);
        filter.connect(env);
        this.connectSfx(env, 'hall');

        osc.start(now);
        osc.stop(now + 1.24);
        osc.onended = () => {
          osc.disconnect();
          filter.disconnect();
          env.disconnect();
        };
      });

      const sparkleSemis = safeStreak >= 5 || overclocked ? [28, 31, 36] : [26, 31];
      sparkleSemis.forEach((semi, idx) => {
        const t = now + 0.14 + idx * 0.055;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const pan = this.createPanner(ctx, (idx - 1) * 0.5);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(semitoneHz(profile.rootHz, semi), t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.09, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

        osc.connect(g);
        g.connect(pan);
        this.connectSfx(pan, 'hall');

        osc.start(t);
        osc.stop(t + 0.88);
        osc.onended = () => {
          osc.disconnect();
          g.disconnect();
          pan.disconnect();
        };
      });
    }
  }

  public playWrongReveal(backfired: boolean): void {
    const ctx = this.getReadyContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;

    // 1. Damped ceramic thud
    const body = ctx.createOscillator();
    const form = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = 'triangle';
    form.type = 'sine';
    body.frequency.setValueAtTime(235, now);
    body.frequency.exponentialRampToValueAtTime(98, now + 0.14);
    form.frequency.setValueAtTime(490, now);
    form.frequency.exponentialRampToValueAtTime(260, now + 0.09);

    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(0.32, now + 0.005);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);

    body.connect(bodyGain);
    form.connect(bodyGain);
    this.connectSfx(bodyGain, 'medium');
    body.start(now);
    form.start(now);
    body.stop(now + 0.22);
    form.stop(now + 0.15);
    body.onended = () => {
      body.disconnect();
      form.disconnect();
      bodyGain.disconnect();
    };

    const knock = ctx.createBufferSource();
    knock.buffer = this.noiseBuffer;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(680, now);
    const kg = ctx.createGain();
    kg.gain.setValueAtTime(0.0001, now);
    kg.gain.linearRampToValueAtTime(0.28, now + 0.003);
    kg.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    knock.connect(lp);
    lp.connect(kg);
    this.connectSfx(kg, 'medium');
    knock.start(now, Math.random() * 1.1, 0.06);
    knock.onended = () => {
      knock.disconnect();
      lp.disconnect();
      kg.disconnect();
    };

    if (!backfired) return;

    // 2. Heavy Crimson Sub Drop
    const sub = ctx.createOscillator();
    const subWarm = ctx.createOscillator();
    const subEnv = ctx.createGain();
    sub.type = 'sine';
    subWarm.type = 'sawtooth';
    sub.frequency.setValueAtTime(112, now);
    sub.frequency.exponentialRampToValueAtTime(29, now + 0.65);
    subWarm.frequency.setValueAtTime(224, now);
    subWarm.frequency.exponentialRampToValueAtTime(58, now + 0.5);

    const subWarmFilter = ctx.createBiquadFilter();
    subWarmFilter.type = 'lowpass';
    subWarmFilter.frequency.setValueAtTime(340, now);
    const subWarmGain = ctx.createGain();
    subWarmGain.gain.setValueAtTime(0.22, now);

    subEnv.gain.setValueAtTime(0.0001, now);
    subEnv.gain.linearRampToValueAtTime(0.5, now + 0.01);
    subEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);

    sub.connect(subEnv);
    subWarm.connect(subWarmFilter);
    subWarmFilter.connect(subWarmGain);
    subWarmGain.connect(subEnv);
    this.connectSfx(subEnv, 'lush');

    sub.start(now);
    subWarm.start(now);
    sub.stop(now + 0.75);
    subWarm.stop(now + 0.55);
    sub.onended = () => {
      sub.disconnect();
      subWarm.disconnect();
      subWarmFilter.disconnect();
      subWarmGain.disconnect();
      subEnv.disconnect();
    };

    // 3. Dramatic Descending Glass-Fracture Crackle Cascade
    const shardCount = 9;
    for (let i = 0; i < shardCount; i++) {
      const t = now + 0.018 + i * 0.042 + Math.random() * 0.012;
      const frac = i / (shardCount - 1);
      const centerHz = clampFreq(4800 * Math.pow(0.28, frac) * (0.9 + Math.random() * 0.2));
      const pan = this.createPanner(ctx, (i % 2 === 0 ? -1 : 1) * (0.25 + frac * 0.55));

      const crack = ctx.createBufferSource();
      crack.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(centerHz, t);
      bp.Q.setValueAtTime(6.5, t);
      const cg = ctx.createGain();
      cg.gain.setValueAtTime(0.0001, t);
      cg.gain.linearRampToValueAtTime(0.24 * (1 - frac * 0.35), t + 0.0015);
      cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

      crack.connect(bp);
      bp.connect(cg);
      cg.connect(pan);
      this.connectSfx(pan, 'lush');
      crack.start(t, Math.random() * 1.1, 0.055);
      crack.onended = () => {
        crack.disconnect();
        bp.disconnect();
        cg.disconnect();
        pan.disconnect();
      };

      const shardOsc = ctx.createOscillator();
      const sg = ctx.createGain();
      shardOsc.type = 'sine';
      shardOsc.frequency.setValueAtTime(clampFreq(centerHz * 0.72), t);
      sg.gain.setValueAtTime(0.0001, t);
      sg.gain.linearRampToValueAtTime(0.09 * (1 - frac * 0.3), t + 0.002);
      sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      shardOsc.connect(sg);
      this.connectSfx(sg, 'hall');
      shardOsc.start(t);
      shardOsc.stop(t + 0.18);
      shardOsc.onended = () => {
        shardOsc.disconnect();
        sg.disconnect();
      };
    }
  }

  public playGauntletSwipe(action: 'TRUE' | 'FALSE' | 'CHALLENGE'): void {
    const ctx = this.getReadyContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;
    const profile = VENUE_PROFILES[this.currentVenue];

    if (action === 'TRUE') {
      // Gold chime slice
      const swoosh = ctx.createBufferSource();
      swoosh.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1100, now);
      bp.frequency.exponentialRampToValueAtTime(4900, now + 0.13);
      bp.Q.setValueAtTime(2.4, now);
      const sg = ctx.createGain();
      sg.gain.setValueAtTime(0.0001, now);
      sg.gain.linearRampToValueAtTime(0.24, now + 0.02);
      sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      swoosh.connect(bp);
      bp.connect(sg);
      this.connectSfx(sg, 'lush');
      swoosh.start(now, Math.random() * 1.0, 0.19);
      swoosh.onended = () => {
        swoosh.disconnect();
        bp.disconnect();
        sg.disconnect();
      };

      const chimeSemis = [12, 19, 26];
      chimeSemis.forEach((semi, idx) => {
        const t = now + idx * 0.024;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(semitoneHz(profile.rootHz, semi), t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        osc.connect(g);
        this.connectSfx(g, 'hall');
        osc.start(t);
        osc.stop(t + 0.45);
        osc.onended = () => {
          osc.disconnect();
          g.disconnect();
        };
      });
      return;
    }

    if (action === 'FALSE') {
      // Obsidian low shear
      const shear = ctx.createBufferSource();
      shear.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2400, now);
      bp.frequency.exponentialRampToValueAtTime(420, now + 0.14);
      bp.Q.setValueAtTime(2.6, now);
      const sg = ctx.createGain();
      sg.gain.setValueAtTime(0.0001, now);
      sg.gain.linearRampToValueAtTime(0.28, now + 0.012);
      sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      shear.connect(bp);
      bp.connect(sg);
      this.connectSfx(sg, 'medium');
      shear.start(now, Math.random() * 1.0, 0.18);
      shear.onended = () => {
        shear.disconnect();
        bp.disconnect();
        sg.disconnect();
      };

      const chop = ctx.createOscillator();
      const cg = ctx.createGain();
      chop.type = 'triangle';
      chop.frequency.setValueAtTime(195, now);
      chop.frequency.exponentialRampToValueAtTime(68, now + 0.13);
      cg.gain.setValueAtTime(0.0001, now);
      cg.gain.linearRampToValueAtTime(0.32, now + 0.005);
      cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      chop.connect(cg);
      this.connectSfx(cg, 'medium');
      chop.start(now);
      chop.stop(now + 0.18);
      chop.onended = () => {
        chop.disconnect();
        cg.disconnect();
      };
      return;
    }

    // 'CHALLENGE': Dual-octave crystalline burst
    const burst = ctx.createBufferSource();
    burst.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(900, now);
    bp.frequency.exponentialRampToValueAtTime(6800, now + 0.2);
    bp.Q.setValueAtTime(2.2, now);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.0001, now);
    bg.gain.linearRampToValueAtTime(0.26, now + 0.02);
    bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    burst.connect(bp);
    bp.connect(bg);
    this.connectSfx(bg, 'lush');
    burst.start(now, Math.random() * 1.0, 0.26);
    burst.onended = () => {
      burst.disconnect();
      bp.disconnect();
      bg.disconnect();
    };

    const crystalSemis = [12, 19, 24, 31, 36];
    crystalSemis.forEach((semi, idx) => {
      const t = now + idx * 0.028;
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const g = ctx.createGain();
      const pan = this.createPanner(ctx, (idx - 2) * 0.32);
      o1.type = 'sine';
      o2.type = 'triangle';
      const hz = semitoneHz(profile.rootHz, semi);
      o1.frequency.setValueAtTime(hz, t);
      o2.frequency.setValueAtTime(clampFreq(hz * 2.0), t);

      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.15, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.56);

      o1.connect(g);
      o2.connect(g);
      g.connect(pan);
      this.connectSfx(pan, 'hall');

      o1.start(t);
      o2.start(t);
      o1.stop(t + 0.6);
      o2.stop(t + 0.4);
      o1.onended = () => {
        o1.disconnect();
        o2.disconnect();
        g.disconnect();
        pan.disconnect();
      };
    });
  }

  public playStorySting(kind: 'SUMMONS' | 'CHOICE' | 'TWIST' | 'STAMP' | 'VICTORY'): void {
    const ctx = this.getReadyContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;
    const profile = VENUE_PROFILES[this.currentVenue];

    switch (kind) {
      case 'SUMMONS': {
        const notes = [-12, 0, 7, 14, 15];
        notes.forEach((semi, idx) => {
          const t = now + idx * 0.075;
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const g = ctx.createGain();
          const pan = this.createPanner(ctx, (idx - 2) * 0.25);

          osc.type = idx < 2 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(semitoneHz(profile.rootHz, semi), t);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2400, t);

          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(idx === 0 ? 0.24 : 0.14, t + 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.55);

          osc.connect(filter);
          filter.connect(g);
          g.connect(pan);
          this.connectSfx(pan, 'hall');

          osc.start(t);
          osc.stop(t + 1.6);
          osc.onended = () => {
            osc.disconnect();
            filter.disconnect();
            g.disconnect();
            pan.disconnect();
          };
        });
        break;
      }

      case 'CHOICE': {
        this.fireGlassBrassDetent(ctx, now);
        const steps = [0, 7];
        steps.forEach((semi, idx) => {
          const t = now + 0.02 + idx * 0.065;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(semitoneHz(profile.rootHz, semi + 12), t);
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.14, t + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.52);
          osc.connect(g);
          this.connectSfx(g, 'lush');
          osc.start(t);
          osc.stop(t + 0.55);
          osc.onended = () => {
            osc.disconnect();
            g.disconnect();
          };
        });
        break;
      }

      case 'TWIST': {
        this.triggerFractureSubDrop();
        const cluster = [0, 1, 6, 13];
        cluster.forEach((semi, idx) => {
          const t = now + 0.02 + idx * 0.025;
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const g = ctx.createGain();
          const pan = this.createPanner(ctx, (idx - 1.5) * 0.35);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(semitoneHz(profile.rootHz, semi + 12), t);
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(650, t);
          filter.frequency.exponentialRampToValueAtTime(2800, t + 0.25);
          filter.frequency.exponentialRampToValueAtTime(480, t + 1.35);
          filter.Q.setValueAtTime(2.8, t);

          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.12, t + 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.45);

          osc.connect(filter);
          filter.connect(g);
          g.connect(pan);
          this.connectSfx(pan, 'hall');

          osc.start(t);
          osc.stop(t + 1.5);
          osc.onended = () => {
            osc.disconnect();
            filter.disconnect();
            g.disconnect();
            pan.disconnect();
          };
        });
        break;
      }

      case 'STAMP': {
        const thud = ctx.createOscillator();
        const tg = ctx.createGain();
        thud.type = 'sine';
        thud.frequency.setValueAtTime(148, now);
        thud.frequency.exponentialRampToValueAtTime(48, now + 0.14);
        tg.gain.setValueAtTime(0.0001, now);
        tg.gain.linearRampToValueAtTime(0.45, now + 0.004);
        tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        thud.connect(tg);
        this.connectSfx(tg, 'medium');
        thud.start(now);
        thud.stop(now + 0.25);
        thud.onended = () => {
          thud.disconnect();
          tg.disconnect();
        };

        const slap = ctx.createBufferSource();
        slap.buffer = this.noiseBuffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(1100, now);
        bp.Q.setValueAtTime(1.8, now);
        const sg = ctx.createGain();
        sg.gain.setValueAtTime(0.0001, now);
        sg.gain.linearRampToValueAtTime(0.36, now + 0.002);
        sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
        slap.connect(bp);
        bp.connect(sg);
        this.connectSfx(sg, 'medium');
        slap.start(now, Math.random() * 1.0, 0.045);
        slap.onended = () => {
          slap.disconnect();
          bp.disconnect();
          sg.disconnect();
        };

        const ring = ctx.createOscillator();
        const rg = ctx.createGain();
        ring.type = 'triangle';
        ring.frequency.setValueAtTime(semitoneHz(profile.rootHz, 12), now + 0.015);
        rg.gain.setValueAtTime(0.0001, now + 0.015);
        rg.gain.linearRampToValueAtTime(0.14, now + 0.025);
        rg.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        ring.connect(rg);
        this.connectSfx(rg, 'lush');
        ring.start(now + 0.015);
        ring.stop(now + 0.58);
        ring.onended = () => {
          ring.disconnect();
          rg.disconnect();
        };
        break;
      }

      case 'VICTORY': {
        const progression = [
          { delay: 0.0, dur: 0.48, notes: [-7, 0, 5, 9] },
          { delay: 0.28, dur: 0.5, notes: [-5, 2, 7, 11] },
          { delay: 0.58, dur: 1.85, notes: [-12, 0, 7, 16, 19, 26] },
        ];

        for (const step of progression) {
          step.notes.forEach((semi, idx) => {
            const t = now + step.delay + idx * 0.018;
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const g = ctx.createGain();
            const pan = this.createPanner(ctx, (idx - (step.notes.length - 1) / 2) * 0.22);

            const isUpperChime = idx >= 4;
            osc.type = isUpperChime ? 'sine' : 'sawtooth';
            osc.frequency.setValueAtTime(semitoneHz(profile.rootHz, semi), t);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(isUpperChime ? 5200 : 1850, t);
            filter.frequency.exponentialRampToValueAtTime(isUpperChime ? 2600 : 620, t + step.dur);

            const peak = isUpperChime ? 0.13 : 0.11;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(peak, t + 0.045);
            g.gain.exponentialRampToValueAtTime(0.0001, t + step.dur);

            osc.connect(filter);
            filter.connect(g);
            g.connect(pan);
            this.connectSfx(pan, 'hall');

            osc.start(t);
            osc.stop(t + step.dur + 0.04);
            osc.onended = () => {
              osc.disconnect();
              filter.disconnect();
              g.disconnect();
              pan.disconnect();
            };
          });
        }
        break;
      }
    }
  }

  public playUiTap(): void {
    const tMs = nowPerfMs();
    if (tMs - this.lastUiTapMs < 24) return;
    this.lastUiTapMs = tMs;

    const ctx = this.getReadyContext();
    if (!ctx || !this.noiseBuffer) return;
    const now = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(3650, now);
    bp.Q.setValueAtTime(6.2, now);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, now);
    ng.gain.linearRampToValueAtTime(0.16, now + 0.001);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

    src.connect(bp);
    bp.connect(ng);
    this.connectSfx(ng, 'tight');
    src.start(now, Math.random() * 1.2, 0.012);
    src.onended = () => {
      src.disconnect();
      bp.disconnect();
      ng.disconnect();
    };

    const tick = ctx.createOscillator();
    const tg = ctx.createGain();
    tick.type = 'sine';
    tick.frequency.setValueAtTime(1480, now);
    tg.gain.setValueAtTime(0.0001, now);
    tg.gain.linearRampToValueAtTime(0.08, now + 0.001);
    tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.011);
    tick.connect(tg);
    this.connectSfx(tg, 'tight');
    tick.start(now);
    tick.stop(now + 0.014);
    tick.onended = () => {
      tick.disconnect();
      tg.disconnect();
    };
  }
}
