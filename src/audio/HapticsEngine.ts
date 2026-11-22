// ============================================================================
// WORLD'S SMARTEST — Machined-Luxury Horological Haptics Engine
// Supports Capacitor Native CoreHaptics / Android VibrationEffect + Web Vibrate
// ============================================================================

export type HapticPeelTier = 1 | 2 | 3;

export interface IHapticsEngine {
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
  spinTick(): void;
  sightlineSnap(): void;
  peel(tier: HapticPeelTier): void;
  overclockPulse(progress: number): void;
  lockThunk(): void;
  correctBloom(): void;
  wrongThud(backfired: boolean): void;
  passportStamp(): void;
  shatterPlate(): void;
  uiTap(): void;
}

const STORAGE_KEY = 'ws_haptics_enabled_v2';

interface CapacitorHapticsPlugin {
  impact?: (options: { style: 'HEAVY' | 'MEDIUM' | 'LIGHT' }) => Promise<void> | void;
  notification?: (options: { type: 'SUCCESS' | 'WARNING' | 'ERROR' }) => Promise<void> | void;
  vibrate?: (options: { duration: number }) => Promise<void> | void;
  selectionChanged?: () => Promise<void> | void;
}

interface CapacitorWindow {
  Capacitor?: {
    Plugins?: {
      Haptics?: CapacitorHapticsPlugin;
    };
  };
}

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

  private getCapacitorHaptics(): CapacitorHapticsPlugin | null {
    try {
      if (typeof window === 'undefined') return null;
      const cap = (window as unknown as CapacitorWindow).Capacitor;
      return cap?.Plugins?.Haptics ?? null;
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

  private invokeSafe(maybePromise: Promise<void> | void | undefined): void {
    if (maybePromise && typeof (maybePromise as Promise<void>).catch === 'function') {
      (maybePromise as Promise<void>).catch(() => {
        // Ignore bridge errors
      });
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
      if (cap.selectionChanged) {
        this.invokeSafe(cap.selectionChanged());
        return;
      }
      if (cap.impact) {
        this.invokeSafe(cap.impact({ style: 'LIGHT' }));
        return;
      }
      if (cap.vibrate) {
        this.invokeSafe(cap.vibrate({ duration: 8 }));
        return;
      }
    }
    this.vibrateWeb(8);
  }

  /** Magnetic glass-on-brass clack when a facet aligns into the Gold Sightline Beam */
  public sightlineSnap(): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap?.impact) {
      this.invokeSafe(cap.impact({ style: 'LIGHT' }));
      this.scheduleStep(26, () => {
        this.invokeSafe(cap.impact?.({ style: 'MEDIUM' }));
      });
      return;
    }
    this.vibrateWeb([10, 16, 12]);
  }

  /** Pneumatic Brass Crown pull & iris shutter bloom */
  public peel(tier: HapticPeelTier): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap?.impact) {
      if (tier === 3) {
        this.invokeSafe(cap.impact({ style: 'MEDIUM' }));
        this.scheduleStep(36, () => this.invokeSafe(cap.impact?.({ style: 'HEAVY' })));
        this.scheduleStep(82, () => this.invokeSafe(cap.impact?.({ style: 'LIGHT' })));
      } else if (tier === 2) {
        this.invokeSafe(cap.impact({ style: 'MEDIUM' }));
        this.scheduleStep(40, () => this.invokeSafe(cap.impact?.({ style: 'MEDIUM' })));
      } else {
        this.invokeSafe(cap.impact({ style: 'LIGHT' }));
      }
      return;
    }

    if (tier === 3) {
      this.vibrateWeb([18, 18, 34, 14, 10]);
    } else if (tier === 2) {
      this.vibrateWeb([15, 24, 20]);
    } else {
      this.vibrateWeb(10);
    }
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
      if (cap.impact) {
        const style = p >= 0.7 ? 'HEAVY' : p >= 0.35 ? 'MEDIUM' : 'LIGHT';
        this.invokeSafe(cap.impact({ style }));
        return;
      }
      if (cap.vibrate) {
        this.invokeSafe(cap.vibrate({ duration }));
        return;
      }
    }
    this.vibrateWeb(duration);
  }

  /** Heavy vault-bolt PRIMITIVE_THUD when Overclock firing pin slams home */
  public lockThunk(): void {
    if (!this.enabled) return;
    const t = nowMs();
    if (t - this.lastLockThunkMs < 75) return;
    this.lastLockThunkMs = t;

    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (cap.impact) {
        this.invokeSafe(cap.impact({ style: 'HEAVY' }));
        return;
      }
      if (cap.vibrate) {
        this.invokeSafe(cap.vibrate({ duration: 45 }));
        return;
      }
    }
    this.vibrateWeb(45);
  }

  /** Gold Resonance bloom on solved Prism */
  public correctBloom(): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (cap.notification) {
        this.invokeSafe(cap.notification({ type: 'SUCCESS' }));
        this.scheduleStep(75, () => this.invokeSafe(cap.impact?.({ style: 'MEDIUM' })));
        return;
      }
      if (cap.impact) {
        this.invokeSafe(cap.impact({ style: 'LIGHT' }));
        this.scheduleStep(46, () => this.invokeSafe(cap.impact?.({ style: 'MEDIUM' })));
        this.scheduleStep(96, () => this.invokeSafe(cap.impact?.({ style: 'HEAVY' })));
        return;
      }
    }
    this.vibrateWeb([18, 28, 22, 28, 36]);
  }

  /** Restrained crimson fracture thud on wrong answer or Overclock Backfire */
  public wrongThud(backfired: boolean): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (cap.notification) {
        this.invokeSafe(cap.notification({ type: backfired ? 'ERROR' : 'WARNING' }));
        if (backfired && cap.impact) {
          this.scheduleStep(65, () => this.invokeSafe(cap.impact?.({ style: 'HEAVY' })));
        }
        return;
      }
      if (cap.impact) {
        this.invokeSafe(cap.impact({ style: 'HEAVY' }));
        if (backfired) {
          this.scheduleStep(60, () => this.invokeSafe(cap.impact?.({ style: 'HEAVY' })));
          this.scheduleStep(140, () => this.invokeSafe(cap.impact?.({ style: 'MEDIUM' })));
        }
        return;
      }
    }
    this.vibrateWeb(backfired ? [35, 25, 70, 20, 40] : [50]);
  }

  /** Heavy diplomatic seal emboss when Julian Vance stamps your Meridian Passport */
  public passportStamp(): void {
    if (!this.enabled) return;
    const cap = this.getCapacitorHaptics();
    if (cap?.impact) {
      this.invokeSafe(cap.impact({ style: 'HEAVY' }));
      this.scheduleStep(55, () => this.invokeSafe(cap.impact?.({ style: 'MEDIUM' })));
      return;
    }
    this.vibrateWeb([48, 24, 24]);
  }

  /** Crisp glass fracture burst for Gauntlet Shatter & Tier-3 false facet elimination */
  public shatterPlate(): void {
    if (!this.enabled) return;
    const cap = this.getCapacitorHaptics();
    if (cap?.impact) {
      this.invokeSafe(cap.impact({ style: 'MEDIUM' }));
      this.scheduleStep(30, () => this.invokeSafe(cap.impact?.({ style: 'LIGHT' })));
      return;
    }
    this.vibrateWeb([16, 14, 12]);
  }

  public uiTap(): void {
    if (!this.enabled) return;
    const t = nowMs();
    if (t - this.lastUiTapMs < 24) return;
    this.lastUiTapMs = t;

    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (cap.impact) {
        this.invokeSafe(cap.impact({ style: 'LIGHT' }));
        return;
      }
      if (cap.vibrate) {
        this.invokeSafe(cap.vibrate({ duration: 6 }));
        return;
      }
    }
    this.vibrateWeb(6);
  }
}
