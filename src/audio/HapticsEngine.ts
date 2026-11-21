import type { IHapticsEngine, PeelTier } from '../types/game';

const STORAGE_KEY = 'ws_haptics_enabled';

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
      // Ignore storage access errors in restricted/private contexts
    }
    return true;
  }

  private persistEnabled(value: boolean): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
      }
    } catch {
      // Ignore storage write errors
    }
  }

  private getCapacitorHaptics(): CapacitorHapticsPlugin | null {
    try {
      if (typeof window === 'undefined') return null;
      const cap = (window as unknown as CapacitorWindow).Capacitor;
      const plugin = cap?.Plugins?.Haptics;
      return plugin ?? null;
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
        // Silently swallow native bridge rejections
      });
    }
  }

  private vibrateWeb(pattern: number | number[]): void {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore unsupported or blocked vibration calls
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

  public spinTick(): void {
    if (!this.enabled) return;
    const t = nowMs();
    if (t - this.lastSpinTickMs < 36) return;
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

  public sightlineSnap(): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap && cap.impact) {
      this.invokeSafe(cap.impact({ style: 'LIGHT' }));
      this.scheduleStep(28, () => {
        this.invokeSafe(cap.impact?.({ style: 'MEDIUM' }));
      });
      return;
    }

    this.vibrateWeb([10, 18, 12]);
  }

  public peel(tier: PeelTier): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap && cap.impact) {
      if (tier === 3) {
        this.invokeSafe(cap.impact({ style: 'MEDIUM' }));
        this.scheduleStep(36, () => {
          this.invokeSafe(cap.impact?.({ style: 'HEAVY' }));
        });
        this.scheduleStep(84, () => {
          this.invokeSafe(cap.impact?.({ style: 'LIGHT' }));
        });
      } else if (tier === 2) {
        this.invokeSafe(cap.impact({ style: 'MEDIUM' }));
        this.scheduleStep(40, () => {
          this.invokeSafe(cap.impact?.({ style: 'MEDIUM' }));
        });
      } else {
        this.invokeSafe(cap.impact({ style: 'LIGHT' }));
      }
      return;
    }

    if (tier === 3) {
      this.vibrateWeb([18, 18, 34, 14, 10]);
    } else if (tier === 2) {
      this.vibrateWeb([15, 25, 20]);
    } else {
      this.vibrateWeb(10);
    }
  }

  public overclockPulse(progress: number): void {
    if (!this.enabled) return;
    const p = clamp01(progress);
    const t = nowMs();
    // Accelerating heartbeat cadence: ~95ms at start down to ~52ms at full charge
    const minIntervalMs = 95 - p * 43;
    if (t - this.lastOverclockPulseMs < minIntervalMs) return;
    this.lastOverclockPulseMs = t;

    const duration = Math.round(10 + p * 16); // Rising 10ms -> 26ms

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

  public lockThunk(): void {
    if (!this.enabled) return;

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

  public correctBloom(): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (cap.notification) {
        this.invokeSafe(cap.notification({ type: 'SUCCESS' }));
        this.scheduleStep(75, () => {
          this.invokeSafe(cap.impact?.({ style: 'MEDIUM' }));
        });
        return;
      }
      if (cap.impact) {
        this.invokeSafe(cap.impact({ style: 'LIGHT' }));
        this.scheduleStep(46, () => {
          this.invokeSafe(cap.impact?.({ style: 'MEDIUM' }));
        });
        this.scheduleStep(96, () => {
          this.invokeSafe(cap.impact?.({ style: 'HEAVY' }));
        });
        return;
      }
    }

    this.vibrateWeb([18, 28, 22, 28, 36]);
  }

  public wrongThud(backfired: boolean): void {
    if (!this.enabled) return;

    const cap = this.getCapacitorHaptics();
    if (cap) {
      if (cap.notification) {
        this.invokeSafe(cap.notification({ type: backfired ? 'ERROR' : 'WARNING' }));
        if (backfired && cap.impact) {
          this.scheduleStep(65, () => {
            this.invokeSafe(cap.impact?.({ style: 'HEAVY' }));
          });
        }
        return;
      }
      if (cap.impact) {
        this.invokeSafe(cap.impact({ style: 'HEAVY' }));
        if (backfired) {
          this.scheduleStep(60, () => {
            this.invokeSafe(cap.impact?.({ style: 'HEAVY' }));
          });
          this.scheduleStep(140, () => {
            this.invokeSafe(cap.impact?.({ style: 'MEDIUM' }));
          });
        }
        return;
      }
    }

    this.vibrateWeb(backfired ? [35, 25, 70, 20, 40] : [55]);
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
