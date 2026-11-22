// ============================================================================
// WORLD'S SMARTEST — Machined-Luxury Horological Haptics Engine
// Supports Capacitor Native Core Haptics (iOS) / Android Haptics + Web Vibrate
// Zero build-time Capacitor npm dependency (clean ambient bridge typing)
// ============================================================================

export type HapticPeelTier = 1 | 2 | 3;
export type HapticsBackendKind = 'CAPACITOR_NATIVE' | 'WEB_VIBRATE' | 'NONE';

export interface CapacitorHapticsPlugin {
  impact?: (options: { style: 'HEAVY' | 'MEDIUM' | 'LIGHT' }) => Promise<void> | void;
  notification?: (options: { type: 'SUCCESS' | 'WARNING' | 'ERROR' }) => Promise<void> | void;
  vibrate?: (options: { duration: number }) => Promise<void> | void;
  selectionStart?: () => Promise<void> | void;
  selectionChanged?: () => Promise<void> | void;
  selectionEnd?: () => Promise<void> | void;
}

export interface CapacitorGlobalBridge {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: {
    Haptics?: CapacitorHapticsPlugin;
    [pluginName: string]: unknown;
  };
}

declare global {
  interface Window {
    Capacitor?: CapacitorGlobalBridge;
  }
}

export interface IHapticsEngine {
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
  isNativePlatform(): boolean;
  getBackend(): HapticsBackendKind;
  spinTick(): void;
  sightlineSnap(): void;
  peel(tier: HapticPeelTier): void;
  peelSnap(tier?: HapticPeelTier): void;
  overclockPulse(progress: number): void;
  lockThunk(): void;
  correctBloom(): void;
  goldResonance(): void;
  wrongThud(backfired: boolean): void;
  backfireFracture(): void;
  passportStamp(): void;
  shatterPlate(): void;
  uiTap(): void;
  tap(): void;
}

const STORAGE_KEY = 'ws_haptics_enabled_v2';

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

export class HapticsEngine implements IHapticsEngine {
  private enabled: boolean;
  private lastSpinTickMs = 0;
  private lastOverclockPulseMs = 0;
  private lastUiTapMs = 0;
  private lastLockThunkMs = 0;
  private scheduledTimers: Set<ReturnType<typeof setTimeout>> = new Set();

  constructor() {
    this.enabled = this.loadPersistedEnabled();
  }

  private loadPersistedEnabled(): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === 'false') return false;
        if (stored === 'true') return true;
      }
    } catch {
      // Ignore storage errors in private contexts
    }
    return true;
  }

  private persistEnabled(value: boolean): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
      }
    } catch {
      // Ignore write errors
    }
  }

  /**
   * Detects whether we are executing inside a native Capacitor iOS/Android shell.
   */
  public isNativePlatform(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const cap = window.Capacitor;
      if (!cap) return false;
      if (typeof cap.isNativePlatform === 'function') {
        return Boolean(cap.isNativePlatform());
      }
      if (typeof cap.getPlatform === 'function') {
        const platform = String(cap.getPlatform() || '').toLowerCase();
        return platform === 'ios' || platform === 'android';
      }
      return Boolean(cap.Plugins?.Haptics);
    } catch {
      return false;
    }
  }

  /**
   * Reports the active haptics transport backend.
   */
  public getBackend(): HapticsBackendKind {
    if (this.getCapacitorHaptics()) {
      return 'CAPACITOR_NATIVE';
    }
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      return 'WEB_VIBRATE';
    }
    return 'NONE';
  }

  private getCapacitorHaptics(): CapacitorHapticsPlugin | null {
    try {
      if (typeof window === 'undefined') return null;
      const cap = window.Capacitor;
      if (!cap?.Plugins?.Haptics) return null;
      if (typeof cap.isNativePlatform === 'function' && !cap.isNativePlatform()) {
        return null;
      }
      if (typeof cap.isNativePlatform !== 'function' && typeof cap.getPlatform === 'function') {
        const platform = String(cap.getPlatform() || '').toLowerCase();
        if (platform !== 'ios' && platform !== 'android') {
          return null;
        }
      }
      return cap.Plugins.Haptics;
    } catch {
      return null;
    }
  }

  private clearPendingTimers(): void {
    for (const timer of this.scheduledTimers) {
      clearTimeout(timer);
    }
    this.scheduledTimers.clear();
  }

  private scheduleStep(delayMs: number, fn: () => void): void {
    const timer = setTimeout(() => {
      this.scheduledTimers.delete(timer);
      if (this.enabled) {
        fn();
      }
    }, delayMs);
    this.scheduledTimers.add(timer);
  }

  private callNativeSafe(fn: () => Promise<void> | void | undefined): boolean {
    try {
      const maybePromise = fn();
      if (maybePromise && typeof (maybePromise as Promise<void>).catch === 'function') {
        (maybePromise as Promise<void>).catch(() => {
          // Ignore async native bridge rejections
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  private vibrateWeb(pattern: number | number[]): void {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore blocked vibration calls
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = Boolean(enabled);
    this.persistEnabled(this.enabled);

    if (!this.enabled) {
      this.clearPendingTimers();
      this.vibrateWeb(0);
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /** 8ms watch-escapement micro-click on Prism facet rotation */
  public spinTick(): void {
    if (!this.enabled) return;
    const t = nowMs();
    if (t - this.lastSpinTickMs < 32) return;
    this.lastSpinTickMs = t;

    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (typeof cap.selectionChanged === 'function') {
        if (this.callNativeSafe(() => cap.selectionChanged?.())) return;
      }
      if (typeof cap.impact === 'function') {
        if (this.callNativeSafe(() => cap.impact?.({ style: 'LIGHT' }))) return;
      }
      if (typeof cap.vibrate === 'function') {
        if (this.callNativeSafe(() => cap.vibrate?.({ duration: 8 }))) return;
      }
    }
    this.vibrateWeb(8);
  }

  /** Magnetic glass-on-brass clack when a facet aligns into the Gold Sightline Beam */
  public sightlineSnap(): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap && typeof cap.impact === 'function') {
      if (this.callNativeSafe(() => cap.impact?.({ style: 'LIGHT' }))) {
        this.scheduleStep(26, () => {
          this.callNativeSafe(() => cap.impact?.({ style: 'MEDIUM' }));
        });
        return;
      }
    }
    this.vibrateWeb([10, 16, 12]);
  }

  /** Pneumatic Brass Crown pull & iris shutter bloom */
  public peel(tier: HapticPeelTier): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap && typeof cap.impact === 'function') {
      if (tier === 3) {
        if (this.callNativeSafe(() => cap.impact?.({ style: 'MEDIUM' }))) {
          this.scheduleStep(36, () => {
            this.callNativeSafe(() => cap.impact?.({ style: 'HEAVY' }));
          });
          this.scheduleStep(82, () => {
            this.callNativeSafe(() => cap.impact?.({ style: 'LIGHT' }));
          });
          return;
        }
      } else if (tier === 2) {
        if (this.callNativeSafe(() => cap.impact?.({ style: 'MEDIUM' }))) {
          this.scheduleStep(40, () => {
            this.callNativeSafe(() => cap.impact?.({ style: 'MEDIUM' }));
          });
          return;
        }
      } else {
        if (this.callNativeSafe(() => cap.impact?.({ style: 'LIGHT' }))) {
          return;
        }
      }
    }

    if (tier === 3) {
      this.vibrateWeb([18, 18, 34, 14, 10]);
    } else if (tier === 2) {
      this.vibrateWeb([15, 24, 20]);
    } else {
      this.vibrateWeb(10);
    }
  }

  /** Semantic alias for shutter peel snap (defaults to Tier 2 MEDIUM impact) */
  public peelSnap(tier: HapticPeelTier = 2): void {
    this.peel(tier);
  }

  /** Rising turbine/heartbeat ramp (0.2 -> 0.9) during Hold-to-Overclock */
  public overclockPulse(progress: number): void {
    if (!this.enabled) return;
    const p = clamp01(progress);
    const t = nowMs();
    const minIntervalMs = 94 - p * 44;
    if (t - this.lastOverclockPulseMs < minIntervalMs) return;
    this.lastOverclockPulseMs = t;

    const duration = Math.round(10 + p * 16);
    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (typeof cap.impact === 'function') {
        const style: 'LIGHT' | 'MEDIUM' | 'HEAVY' = p >= 0.7 ? 'HEAVY' : p >= 0.35 ? 'MEDIUM' : 'LIGHT';
        if (this.callNativeSafe(() => cap.impact?.({ style }))) return;
      }
      if (typeof cap.vibrate === 'function') {
        if (this.callNativeSafe(() => cap.vibrate?.({ duration }))) return;
      }
    }
    this.vibrateWeb(duration);
  }

  /** Heavy vault-bolt PRIMITIVE_THUD when Overclock firing pin slams home (75ms dedupe) */
  public lockThunk(): void {
    if (!this.enabled) return;
    const t = nowMs();
    if (t - this.lastLockThunkMs < 75) return;
    this.lastLockThunkMs = t;

    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (typeof cap.impact === 'function') {
        if (this.callNativeSafe(() => cap.impact?.({ style: 'HEAVY' }))) return;
      }
      if (typeof cap.vibrate === 'function') {
        if (this.callNativeSafe(() => cap.vibrate?.({ duration: 45 }))) return;
      }
    }
    this.vibrateWeb(45);
  }

  /** Gold Resonance bloom on solved Prism */
  public correctBloom(): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (typeof cap.notification === 'function') {
        if (this.callNativeSafe(() => cap.notification?.({ type: 'SUCCESS' }))) {
          if (typeof cap.impact === 'function') {
            this.scheduleStep(75, () => {
              this.callNativeSafe(() => cap.impact?.({ style: 'MEDIUM' }));
            });
          }
          return;
        }
      }
      if (typeof cap.impact === 'function') {
        if (this.callNativeSafe(() => cap.impact?.({ style: 'LIGHT' }))) {
          this.scheduleStep(46, () => {
            this.callNativeSafe(() => cap.impact?.({ style: 'MEDIUM' }));
          });
          this.scheduleStep(96, () => {
            this.callNativeSafe(() => cap.impact?.({ style: 'HEAVY' }));
          });
          return;
        }
      }
    }
    this.vibrateWeb([18, 28, 22, 28, 36]);
  }

  /** Semantic alias for Gold Resonance Core Haptics SUCCESS notification */
  public goldResonance(): void {
    this.correctBloom();
  }

  /** Restrained crimson fracture thud on wrong answer or Overclock Backfire */
  public wrongThud(backfired: boolean): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (typeof cap.notification === 'function') {
        if (this.callNativeSafe(() => cap.notification?.({ type: backfired ? 'ERROR' : 'WARNING' }))) {
          if (backfired && typeof cap.impact === 'function') {
            this.scheduleStep(65, () => {
              this.callNativeSafe(() => cap.impact?.({ style: 'HEAVY' }));
            });
          }
          return;
        }
      }
      if (typeof cap.impact === 'function') {
        if (this.callNativeSafe(() => cap.impact?.({ style: 'HEAVY' }))) {
          if (backfired) {
            this.scheduleStep(60, () => {
              this.callNativeSafe(() => cap.impact?.({ style: 'HEAVY' }));
            });
            this.scheduleStep(140, () => {
              this.callNativeSafe(() => cap.impact?.({ style: 'MEDIUM' }));
            });
          }
          return;
        }
      }
    }
    this.vibrateWeb(backfired ? [35, 25, 70, 20, 40] : [50]);
  }

  /** Semantic alias for Overclock Backfire Core Haptics ERROR notification */
  public backfireFracture(): void {
    this.wrongThud(true);
  }

  /** Heavy diplomatic seal emboss when Julian Vance stamps your Meridian Passport */
  public passportStamp(): void {
    if (!this.enabled) return;
    const cap = this.getCapacitorHaptics();
    if (cap && typeof cap.impact === 'function') {
      if (this.callNativeSafe(() => cap.impact?.({ style: 'HEAVY' }))) {
        this.scheduleStep(55, () => {
          this.callNativeSafe(() => cap.impact?.({ style: 'MEDIUM' }));
        });
        return;
      }
    }
    this.vibrateWeb([48, 24, 24]);
  }

  /** Crisp glass fracture burst for Gauntlet Shatter & Tier-3 false facet elimination */
  public shatterPlate(): void {
    if (!this.enabled) return;
    const cap = this.getCapacitorHaptics();
    if (cap && typeof cap.impact === 'function') {
      if (this.callNativeSafe(() => cap.impact?.({ style: 'MEDIUM' }))) {
        this.scheduleStep(30, () => {
          this.callNativeSafe(() => cap.impact?.({ style: 'LIGHT' }));
        });
        return;
      }
    }
    this.vibrateWeb([16, 14, 12]);
  }

  /** Crisp tactile LIGHT tap for HUD controls and 3D Globe pin placement */
  public uiTap(): void {
    if (!this.enabled) return;
    const t = nowMs();
    if (t - this.lastUiTapMs < 24) return;
    this.lastUiTapMs = t;

    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (typeof cap.impact === 'function') {
        if (this.callNativeSafe(() => cap.impact?.({ style: 'LIGHT' }))) return;
      }
      if (typeof cap.vibrate === 'function') {
        if (this.callNativeSafe(() => cap.vibrate?.({ duration: 6 }))) return;
      }
    }
    this.vibrateWeb(6);
  }

  /** Semantic alias for `uiTap()` (LIGHT tactile click) */
  public tap(): void {
    this.uiTap();
  }
}
