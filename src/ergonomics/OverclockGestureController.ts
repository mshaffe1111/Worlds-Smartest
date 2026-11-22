// ============================================================================
// WORLD'S SMARTEST — Conviction Overclock & Bluff Echo Gesture State Machine
// PITCH_BIBLE.md §3.1 ("OVERCLOCK — Hold-to-Lock Spatial Confidence Wager")
// ============================================================================
//
// Exact Tactile State Machine:
//  1) Release < 240ms  -> SAFE LOCK (1.0x Overclock multiplier, 0% charge,
//                         zero Backfire risk) — NEVER cancelled by pointer jitter!
//  2) Hold 240ms..1050ms -> Smooth nonlinear Conviction Charge Curve
//                         (+0% -> +100% bonus, turning Tier-1 3.0x into
//                         6.0x MAX OVERCLOCK!), driving real-time audio
//                         pitch/volume, Android cardiac heartbeat vibration
//                         patterns, HUD bar telemetry, and 3D jaw clamping
//  3) While actively charging (>= 260ms): horizontal slide >= 88px OR vertical
//                         exit >= 36px outside button rect (or Escape while holding)
//                         -> BLUFF ECHO VENT & CANCEL SAFELY!
//  4) Window-level pointermove/pointerup/pointercancel capture while holding +
//                         native `click` safety-net listener guarantee 100% submit!
// ============================================================================

export type OverclockGesturePhase =
  | 'IDLE'
  | 'ARMED_TAP_WINDOW'
  | 'CHARGING'
  | 'MAX_OVERCLOCK_READY'
  | 'BLUFF_VENTED'
  | 'COMMITTED_SAFE'
  | 'COMMITTED_OVERCLOCK';

export type OverclockInputSource = 'POINTER' | 'KEYBOARD' | 'GAMEPAD';

export type BluffCancelReason =
  | 'HORIZONTAL_SLIDE'
  | 'HORIZONTAL_FLICK'
  | 'VERTICAL_SLIDE_OUT'
  | 'ESCAPE_KEY'
  | 'GAMEPAD_CANCEL'
  | 'POINTER_CANCEL'
  | 'BLUR_SAFETY';

export interface OverclockAudioDriver {
  startOverclockCharge?: () => void;
  stopOverclockCharge?: () => void;
  playSfx?: (
    cue: 'ui_tap' | 'shutter_peel' | 'vault_thunk' | 'spin_tick',
    options?: { rate?: number; volumeScale?: number },
  ) => void;
  isSfxEnabled?: () => boolean;
}

export interface OverclockHapticsDriver {
  isEnabled?: () => boolean;
  overclockPulse?: (progress01: number) => void;
  lockThunk?: () => void;
  uiTap?: () => void;
}

export interface OverclockStage3DDriver {
  setOverclockState: (active: boolean, charge01: number) => void;
  cancelOverclockBluff: () => void;
}

export interface OverclockHudElements {
  buttonEl: HTMLElement;
  fillEl?: HTMLElement | null;
  labelEl?: HTMLElement | null;
}

export interface OverclockTelemetrySnapshot {
  phase: OverclockGesturePhase;
  source: OverclockInputSource | null;
  /** Elapsed hold duration since press down in milliseconds */
  elapsedMs: number;
  /** Raw linear progress across [240ms .. 1050ms] in [0..1] */
  linearProgress01: number;
  /** Smooth nonlinear Conviction Charge in [0..1] (+0% -> +100% bonus) */
  charge01: number;
  /** Percentage bonus string-ready [0..100] */
  bonusPercent: number;
  /** Overclock multiplier alone: 1.00x (Safe) -> 2.00x (Max Overclock, or higher w/ Maverick perk) */
  overclockMultiplier: number;
  /** Active Peel/Calibrator base tier multiplier (e.g. 3.0x Tier 1, 2.0x Tier 2, 1.2x Tier 3) */
  tierMultiplier: number;
  /** Combined live payout multiplier: e.g. 3.00x -> 6.00x MAX OVERCLOCK on Tier 1! */
  effectiveTotalMultiplier: number;
  /** True once elapsedMs >= 240ms (missing an Overclock triggers crimson Backfire!) */
  backfireRiskActive: boolean;
  /** Real-time audio pitch rate [0.92 .. 1.48] */
  audioPitchRate: number;
  /** Real-time audio gain envelope [0.20 .. 1.00] */
  audioVolume: number;
  /** Haptic intensity envelope [0.20 .. 0.95] per PITCH_BIBLE §3.1 */
  hapticIntensity: number;
  /** 3D brass clamping jaw compression [0..1] */
  jawClamp01: number;
  /** Camera FOV push target [46° -> 36°] */
  cameraFovDeg: number;
  /** Horizontal pointer displacement in CSS px (positive = right, negative = left) */
  horizontalSlidePx: number;
  /** Progress [0..1] toward the 88px Bluff Echo cancel threshold (always 0 while < 260ms) */
  slideCancelProgress01: number;
}

export interface OverclockCommitPayload {
  mode: 'SAFE_LOCK' | 'OVERCLOCK';
  overclocked: boolean;
  /** Exact nonlinear Conviction Charge [0..1] (0 for Safe Lock) */
  charge01: number;
  /** Overclock multiplier [1.0 .. 2.0+] */
  overclockMultiplier: number;
  /** Combined tier * overclock multiplier (up to 6.0x on Tier 1!) */
  effectiveTotalMultiplier: number;
  holdDurationMs: number;
  source: OverclockInputSource;
}

export interface OverclockBluffCancelPayload {
  reason: BluffCancelReason;
  peakCharge01: number;
  holdDurationMs: number;
  horizontalSlidePx: number;
  source: OverclockInputSource;
}

export interface OverclockGestureCallbacks {
  /** Fires on press start (0ms, entering the <240ms Safe Lock window) */
  onPressArmed?: (snapshot: OverclockTelemetrySnapshot) => void;
  /** Fires the instant hold crosses 240ms and Conviction Overclock ignites */
  onOverclockStart?: (snapshot: OverclockTelemetrySnapshot) => void;
  /** Fires every animation frame while holding (drives HUD, audio pitch, 3D jaws) */
  onChargeFrame?: (snapshot: OverclockTelemetrySnapshot) => void;
  /** Fires once when Conviction Charge hits 100% (1050ms -> 6.0x MAX OVERCLOCK!) */
  onMaxChargeReached?: (snapshot: OverclockTelemetrySnapshot) => void;
  /** Fires when released < 240ms -> crisp Safe Lock (1.0x Overclock, zero Backfire) */
  onSafeLock?: (payload: OverclockCommitPayload) => void;
  /** Fires when released >= 240ms -> Firing Pin THUNK Overclock Commit! */
  onOverclockCommit?: (payload: OverclockCommitPayload) => void;
  /** Unified commit hook firing for BOTH Safe Lock (charge01=0) and Overclock (charge01>0) */
  onCommit?: (payload: OverclockCommitPayload) => void;
  /** Fires when horizontal slide >= 88px, vertical exit >= 36px (>=260ms), or Escape vents charge safely */
  onBluffEchoCancel?: (payload: OverclockBluffCancelPayload) => void;
}

export interface OverclockGestureConfig {
  /** Releases strictly below this threshold trigger Safe Lock (default: 240ms) */
  safeTapMaxMs?: number;
  /** Timestamp where full +100% Conviction Overclock locks in (default: 1050ms) */
  fullChargeMs?: number;
  /** Minimum hold duration in ms before pointer slide/exit can trigger Bluff Echo cancel (default: 260ms) */
  bluffCancelMinHoldMs?: number;
  /** Horizontal slide distance in CSS px while actively charging to trigger Bluff Echo cancel (default: 88px) */
  bluffSlideThresholdPx?: number;
  /** Vertical pointer exit distance outside button rect in CSS px while charging to cancel (default: 36px) */
  bluffVerticalExitPx?: number;
  /** Horizontal flick velocity (px/s) used to classify >= 88px slides as HORIZONTAL_FLICK (default: 680) */
  bluffFlickVelocityPxPerSec?: number;
  /** Active question Tier multiplier (default: 3.0 for Tier-1 Cold Instinct -> 6.0x Max Overclock!) */
  initialTierMultiplier?: number;
  /** Optional Maverick's Gambit peak bonus scale (default: 1.0 -> +100% -> 2.0x Overclock) */
  peakBonusScale?: number;
  /** Enables structured Android cardiac lub-dub navigator.vibrate patterns (default: true) */
  enableAndroidHeartbeatPatterns?: boolean;
  /** Optional audio engine driver */
  audio?: OverclockAudioDriver | null;
  /** Optional haptics engine driver */
  haptics?: OverclockHapticsDriver | null;
  /** Optional 3D stage driver */
  stage3d?: OverclockStage3DDriver | null;
}

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

/**
 * Pure nonlinear Conviction Charge Curve mapping linear hold progress u in [0..1]
 * (`240ms -> 1050ms`) onto [0..1] (`+0% -> +100%` Conviction Bonus).
 *
 * Blends a C¹ Hermite smoothstep (62%) with a progressive power surge (38%) so:
 *  • Entry at 240ms feels deliberate rather than twitchy
 *  • Mid-hold (450ms..880ms) accelerates with unmistakable turbine urgency
 *  • Apex at 1050ms locks crisply into 1.000 (6.0x MAX OVERCLOCK on Tier 1!)
 */
export function evaluateConvictionChargeCurve(linearU: number): number {
  const u = clamp(linearU, 0, 1);
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const smoothstep = u * u * (3 - 2 * u);
  const turbinePower = Math.pow(u, 1.28);
  return clamp(0.62 * smoothstep + 0.38 * turbinePower, 0, 1);
}

export class OverclockGestureController {
  public static readonly SAFE_TAP_MAX_MS = 240;
  public static readonly HOLD_START_MS = 240;
  public static readonly HOLD_FULL_MS = 1050;
  public static readonly BLUFF_CANCEL_MIN_HOLD_MS = 260;
  public static readonly BLUFF_SLIDE_CANCEL_PX = 88;
  public static readonly BLUFF_VERTICAL_EXIT_PX = 36;
  public static readonly CLICK_SAFETY_NET_DEBOUNCE_MS = 300;

  private callbacks: OverclockGestureCallbacks;
  private readonly safeTapMaxMs: number;
  private readonly fullChargeMs: number;
  private readonly bluffCancelMinHoldMs: number;
  private readonly bluffSlideThresholdPx: number;
  private readonly bluffVerticalExitPx: number;
  private readonly bluffFlickVelocityPxPerSec: number;
  private readonly enableAndroidHeartbeatPatterns: boolean;

  private tierMultiplier: number;
  private peakBonusScale: number;
  private enabled = true;

  private audio: OverclockAudioDriver | null;
  private haptics: OverclockHapticsDriver | null;
  private stage3d: OverclockStage3DDriver | null;
  private boundHud: OverclockHudElements | null = null;
  private lastBoundButtonEl: HTMLElement | null = null;

  // State machine variables
  private phase: OverclockGesturePhase = 'IDLE';
  private activeSource: OverclockInputSource | null = null;
  private activePointerId: number | null = null;
  private ventedPointerId: number | null = null;
  private activeKeyCode: string | null = null;

  private pressStartMs = 0;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private lastMoveMs = 0;
  private horizontalVelPxPerSec = 0;
  private currentCharge01 = 0;
  private peakCharge01 = 0;
  private maxReachedEmitted = false;
  private lastHeartbeatMs = 0;
  private rafId = 0;
  private roundLockedLatch = false;
  private commitDebounceUntilMs = 0;
  private peelKeyGuardUntilMs = 0;
  private lastHandledReleaseMs = -Infinity;
  private windowPointerListenersAttached = false;
  private lastWindowMoveEvent: PointerEvent | null = null;

  // Bound DOM listeners for button attachment + window pointer tracking + click safety-net
  private readonly onPointerDownBound = (ev: PointerEvent) => this.handlePointerDown(ev);
  private readonly onWindowPointerMoveBound = (ev: PointerEvent) => {
    this.lastWindowMoveEvent = ev;
    this.handlePointerMove(ev);
  };
  private readonly onButtonPointerMoveBound = (ev: PointerEvent) => {
    if (ev === this.lastWindowMoveEvent) {
      this.lastWindowMoveEvent = null;
      return;
    }
    this.handlePointerMove(ev);
  };
  private readonly onPointerUpBound = (ev: PointerEvent) => this.handlePointerUp(ev);
  private readonly onPointerCancelBound = (ev: PointerEvent) => this.handlePointerCancel(ev);
  private readonly onButtonClickSafetyNetBound = (ev: MouseEvent) =>
    this.handleClickSafetyNet(ev);
  private readonly onWindowBlurBound = () => {
    if (this.isHolding()) {
      this.cancelAsBluffEcho('BLUR_SAFETY');
    }
  };
  private readonly onVisibilityChangeBound = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      if (this.isHolding()) {
        this.cancelAsBluffEcho('BLUR_SAFETY');
      }
    }
  };

  constructor(
    callbacks: OverclockGestureCallbacks = {},
    config: OverclockGestureConfig = {},
  ) {
    this.callbacks = callbacks;
    this.safeTapMaxMs = config.safeTapMaxMs ?? OverclockGestureController.SAFE_TAP_MAX_MS;
    this.fullChargeMs = Math.max(
      this.safeTapMaxMs + 100,
      config.fullChargeMs ?? OverclockGestureController.HOLD_FULL_MS,
    );
    this.bluffCancelMinHoldMs = Math.max(
      this.safeTapMaxMs,
      config.bluffCancelMinHoldMs ?? OverclockGestureController.BLUFF_CANCEL_MIN_HOLD_MS,
    );
    this.bluffSlideThresholdPx =
      config.bluffSlideThresholdPx ?? OverclockGestureController.BLUFF_SLIDE_CANCEL_PX;
    this.bluffVerticalExitPx =
      config.bluffVerticalExitPx ?? OverclockGestureController.BLUFF_VERTICAL_EXIT_PX;
    this.bluffFlickVelocityPxPerSec = config.bluffFlickVelocityPxPerSec ?? 680;
    this.tierMultiplier = config.initialTierMultiplier ?? 3.0;
    this.peakBonusScale = config.peakBonusScale ?? 1.0;
    this.enableAndroidHeartbeatPatterns = config.enableAndroidHeartbeatPatterns ?? true;

    this.audio = config.audio ?? null;
    this.haptics = config.haptics ?? null;
    this.stage3d = config.stage3d ?? null;

    if (typeof window !== 'undefined') {
      window.addEventListener('blur', this.onWindowBlurBound);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChangeBound);
    }
  }

  public setCallbacks(callbacks: OverclockGestureCallbacks): void {
    this.callbacks = callbacks;
  }

  public setDrivers(drivers: {
    audio?: OverclockAudioDriver | null;
    haptics?: OverclockHapticsDriver | null;
    stage3d?: OverclockStage3DDriver | null;
  }): void {
    if (drivers.audio !== undefined) this.audio = drivers.audio;
    if (drivers.haptics !== undefined) this.haptics = drivers.haptics;
    if (drivers.stage3d !== undefined) this.stage3d = drivers.stage3d;
  }

  public setTierMultiplier(tierMultiplier: number, peakBonusScale?: number): void {
    this.tierMultiplier = Math.max(0.5, tierMultiplier);
    if (typeof peakBonusScale === 'number') {
      this.peakBonusScale = Math.max(0.1, peakBonusScale);
    }
    if (!this.isHolding()) {
      this.syncIdleHudLabel();
    }
  }

  public getTierMultiplier(): number {
    return this.tierMultiplier;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = Boolean(enabled);
    if (!this.enabled && this.isHolding()) {
      this.reset();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getPhase(): OverclockGesturePhase {
    return this.phase;
  }

  public isHolding(): boolean {
    return (
      this.phase === 'ARMED_TAP_WINDOW' ||
      this.phase === 'CHARGING' ||
      this.phase === 'MAX_OVERCLOCK_READY'
    );
  }

  /**
   * Attaches directly to the Sovereign Broadcast Dock Overclock button (`#ws-btn-overclock`).
   * Automatically updates `.ws-overclock-fill` width, live multiplier copy, window pointer
   * tracking while holding, and native `click` safety-net fallback!
   */
  public bindButton(elements: OverclockHudElements): () => void {
    const isFreshButton =
      this.lastBoundButtonEl !== null && this.lastBoundButtonEl !== elements.buttonEl;
    this.unbindButton();
    if (isFreshButton) {
      // A brand-new DOM button (e.g. next question or Hero Artifact Latch Step 1→2)
      // cannot receive residual browser clicks from the destroyed button — clear stale guards!
      this.lastHandledReleaseMs = -Infinity;
      this.commitDebounceUntilMs = 0;
      this.roundLockedLatch = false;
    }
    this.boundHud = elements;
    this.lastBoundButtonEl = elements.buttonEl;
    const btn = elements.buttonEl;
    btn.style.touchAction = 'none';
    btn.addEventListener('pointerdown', this.onPointerDownBound);
    btn.addEventListener('pointermove', this.onButtonPointerMoveBound);
    btn.addEventListener('pointerup', this.onPointerUpBound);
    btn.addEventListener('pointercancel', this.onPointerCancelBound);
    btn.addEventListener('click', this.onButtonClickSafetyNetBound);
    this.syncIdleHudLabel();
    return () => {
      if (this.boundHud?.buttonEl === btn) {
        this.unbindButton();
      }
    };
  }

  public unbindButton(): void {
    this.detachWindowPointerListeners();
    if (this.activeSource === 'POINTER' && this.isHolding()) {
      this.stopRaf();
      if (this.activePointerId !== null) {
        this.releasePointerCaptureSafe(this.activePointerId);
      }
      this.phase = 'IDLE';
      this.activeSource = null;
      this.activePointerId = null;
      this.currentCharge01 = 0;
    }
    this.ventedPointerId = null;
    if (this.boundHud) {
      const btn = this.boundHud.buttonEl;
      btn.removeEventListener('pointerdown', this.onPointerDownBound);
      btn.removeEventListener('pointermove', this.onButtonPointerMoveBound);
      btn.removeEventListener('pointerup', this.onPointerUpBound);
      btn.removeEventListener('pointercancel', this.onPointerCancelBound);
      btn.removeEventListener('click', this.onButtonClickSafetyNetBound);
      this.boundHud = null;
    }
  }

  public getLastHandledReleaseMs(): number {
    return this.lastHandledReleaseMs;
  }

  // ==========================================================================
  // POINTER INPUT API (1-Thumb Touch & Mouse + Window Fallback + Click Net)
  // ==========================================================================

  public handlePointerDown(
    ev: Pick<PointerEvent, 'pointerId' | 'clientX' | 'button' | 'pointerType'> & {
      clientY?: number;
      preventDefault?: () => void;
    },
  ): void {
    if (!this.enabled || this.isHolding()) return;
    if (ev.pointerType === 'mouse' && typeof ev.button === 'number' && ev.button !== 0) {
      return;
    }
    this.ventedPointerId = null;
    ev.preventDefault?.();

    if (this.boundHud?.buttonEl && 'setPointerCapture' in this.boundHud.buttonEl) {
      try {
        this.boundHud.buttonEl.setPointerCapture(ev.pointerId);
      } catch {
        // Ignore in synthetic environments; window pointer listeners catch off-element releases
      }
    }

    const startY = typeof ev.clientY === 'number' && Number.isFinite(ev.clientY) ? ev.clientY : 0;
    this.startHoldInternal('POINTER', ev.clientX, startY, ev.pointerId, null);
  }

  public handlePointerMove(
    ev: Pick<PointerEvent, 'pointerId' | 'clientX'> & { clientY?: number },
  ): void {
    if (this.activeSource !== 'POINTER' || this.activePointerId !== ev.pointerId) return;
    if (!this.isHolding()) return;

    const t = nowMs();
    const elapsedMs = Math.max(0, t - this.pressStartMs);
    const dtSec = Math.max(0.002, (t - this.lastMoveMs) / 1000);
    const stepDx = ev.clientX - this.lastX;
    this.horizontalVelPxPerSec = stepDx / dtSec;
    this.lastX = ev.clientX;
    if (typeof ev.clientY === 'number' && Number.isFinite(ev.clientY)) {
      this.lastY = ev.clientY;
    }
    this.lastMoveMs = t;

    // HARD INVARIANT: NEVER trigger Bluff Echo Cancel during < 240ms Safe Tap window,
    // nor before Overclock is actively charging (>= 260ms)!
    if (elapsedMs < this.safeTapMaxMs || elapsedMs < this.bluffCancelMinHoldMs) {
      return;
    }

    const netDx = ev.clientX - this.startX;
    const absSlide = Math.abs(netDx);
    const isSlideCancel = absSlide >= this.bluffSlideThresholdPx;

    let isVerticalExitCancel = false;
    if (typeof ev.clientY === 'number' && Number.isFinite(ev.clientY)) {
      const btnRect = this.boundHud?.buttonEl?.getBoundingClientRect?.();
      if (btnRect && btnRect.height > 0) {
        const aboveBy = btnRect.top - ev.clientY;
        const belowBy = ev.clientY - btnRect.bottom;
        isVerticalExitCancel =
          aboveBy >= this.bluffVerticalExitPx || belowBy >= this.bluffVerticalExitPx;
      }
    }

    if (isSlideCancel) {
      const isFastFlick =
        Math.abs(this.horizontalVelPxPerSec) >= this.bluffFlickVelocityPxPerSec;
      this.cancelAsBluffEcho(isFastFlick ? 'HORIZONTAL_FLICK' : 'HORIZONTAL_SLIDE');
    } else if (isVerticalExitCancel) {
      this.cancelAsBluffEcho('VERTICAL_SLIDE_OUT');
    }
  }

  public handlePointerUp(ev: Pick<PointerEvent, 'pointerId'>): void {
    if (this.ventedPointerId !== null && ev.pointerId === this.ventedPointerId) {
      this.ventedPointerId = null;
      this.lastHandledReleaseMs = nowMs();
      this.phase = 'IDLE';
      return;
    }
    if (this.activePointerId !== ev.pointerId) return;
    this.releasePointerCaptureSafe(ev.pointerId);
    this.commitOrFinishRelease();
  }

  public handlePointerCancel(ev: Pick<PointerEvent, 'pointerId'>): void {
    if (this.ventedPointerId !== null && ev.pointerId === this.ventedPointerId) {
      this.ventedPointerId = null;
      this.lastHandledReleaseMs = nowMs();
      this.phase = 'IDLE';
      return;
    }
    if (this.activePointerId !== ev.pointerId) return;
    this.releasePointerCaptureSafe(ev.pointerId);
    if (this.isHolding()) {
      this.cancelAsBluffEcho('POINTER_CANCEL');
    } else {
      this.reset();
    }
  }

  /**
   * Native `click` safety-net on `#ws-btn-overclock`: guarantees SAFE_LOCK commits even if
   * pointerup was lost, synthetic `.click()` was dispatched, or an assistive tap fired directly.
   */
  public handleClickSafetyNet(ev?: Pick<MouseEvent, 'detail'>): void {
    const t = nowMs();
    if (!this.enabled || this.roundLockedLatch) return;
    if (t - this.lastHandledReleaseMs <= OverclockGestureController.CLICK_SAFETY_NET_DEBOUNCE_MS) {
      return;
    }
    if (t < this.commitDebounceUntilMs) {
      return;
    }

    this.ventedPointerId = null;

    if (this.isHolding()) {
      if (this.activePointerId !== null) {
        this.releasePointerCaptureSafe(this.activePointerId);
      }
      this.stopRaf();
      this.detachWindowPointerListeners();
      this.activePointerId = null;
      this.activeKeyCode = null;
      this.activeSource = null;
    }

    const source: OverclockInputSource = ev && ev.detail === 0 ? 'KEYBOARD' : 'POINTER';
    this.commitSafeLockImmediate(t, 0, source);
  }

  // ==========================================================================
  // KEYBOARD & GAMEPAD BRIDGE API (Space/Enter Hold + Escape Bluff Cancel!)
  // ==========================================================================

  public beginKeyHold(keyCode = 'Space', source: OverclockInputSource = 'KEYBOARD'): void {
    if (!this.enabled || this.isHolding()) return;
    this.startHoldInternal(source, 0, 0, null, keyCode);
  }

  public releaseKeyHold(keyCode?: string): void {
    if (
      this.activeSource !== 'KEYBOARD' &&
      this.activeSource !== 'GAMEPAD'
    ) {
      return;
    }
    if (keyCode && this.activeKeyCode && keyCode !== this.activeKeyCode) {
      return;
    }
    this.commitOrFinishRelease();
  }

  /**
   * Immediately vents an active hold without locking an answer (*Bluff Echo*).
   * Pointer slide/exit cancels only activate once Overclock is charging (>= 260ms).
   */
  public cancelAsBluffEcho(reason: BluffCancelReason = 'HORIZONTAL_SLIDE'): boolean {
    if (!this.isHolding()) return false;

    const t = nowMs();
    const holdDurationMs = Math.max(0, t - this.pressStartMs);
    if (
      (reason === 'HORIZONTAL_SLIDE' ||
        reason === 'HORIZONTAL_FLICK' ||
        reason === 'VERTICAL_SLIDE_OUT') &&
      (holdDurationMs < this.safeTapMaxMs || holdDurationMs < this.bluffCancelMinHoldMs)
    ) {
      return false;
    }

    const horizontalSlidePx = this.lastX - this.startX;
    const source = this.activeSource ?? 'POINTER';
    const peak = this.peakCharge01;

    this.stopRaf();
    this.detachWindowPointerListeners();
    if (this.activePointerId !== null) {
      this.releasePointerCaptureSafe(this.activePointerId);
      this.ventedPointerId = reason === 'POINTER_CANCEL' ? null : this.activePointerId;
      this.activePointerId = null;
    }
    this.phase = 'BLUFF_VENTED';
    this.currentCharge01 = 0;
    this.activeKeyCode = null;
    this.activeSource = null;
    this.lastHandledReleaseMs = t;

    // Stop turbine swell & trigger crisp pneumatic steam-vent cue + subtle vent haptic
    this.audio?.stopOverclockCharge?.();
    this.audio?.playSfx?.('shutter_peel', { rate: 1.28, volumeScale: 0.62 });
    this.vibrateAndroidPattern([10, 22, 8]);
    this.haptics?.uiTap?.();
    this.stage3d?.cancelOverclockBluff();

    // Update HUD to confirm safe Bluff Echo vent (single-line safe on narrow viewports)
    if (this.boundHud) {
      if (this.boundHud.fillEl) {
        this.boundHud.fillEl.style.width = '0%';
      }
      if (this.boundHud.labelEl) {
        const tier = this.tierMultiplier.toFixed(1);
        const isNarrow = this.isNarrowViewport();
        this.boundHud.labelEl.textContent = isNarrow
          ? `VENTED · TAP LOCK ${tier}x`
          : `BLUFF VENTED — TAP: LOCK (${tier}x)`;
      }
    }

    this.callbacks.onBluffEchoCancel?.({
      reason,
      peakCharge01: peak,
      holdDurationMs,
      horizontalSlidePx,
      source,
    });
    return true;
  }

  /**
   * Hard reset (e.g. when advancing to the next Prism question or leaving Gameplay).
   */
  public reset(): void {
    this.stopRaf();
    this.detachWindowPointerListeners();
    if (this.activePointerId !== null) {
      this.releasePointerCaptureSafe(this.activePointerId);
    }
    this.audio?.stopOverclockCharge?.();
    if (this.currentCharge01 > 0) {
      this.stage3d?.setOverclockState(false, 0);
    }

    this.phase = 'IDLE';
    this.roundLockedLatch = false;
    this.commitDebounceUntilMs = 0;
    this.peelKeyGuardUntilMs = 0;
    this.activeSource = null;
    this.activePointerId = null;
    this.ventedPointerId = null;
    this.activeKeyCode = null;
    this.startY = 0;
    this.lastY = 0;
    this.currentCharge01 = 0;
    this.peakCharge01 = 0;
    this.horizontalVelPxPerSec = 0;
    this.maxReachedEmitted = false;
    this.syncIdleHudLabel();
  }

  /**
   * Prepares the state machine for a fresh Prism question with its opening Tier multiplier.
   */
  public armForNewQuestion(tierMultiplier = 3.0, peakBonusScale?: number): void {
    this.setTierMultiplier(tierMultiplier, peakBonusScale);
    this.reset();
  }

  /**
   * Aborts any in-flight Overclock hold immediately when the Chrono-Ring hits 0.0s
   * or a modal interrupts the round, latching so late pointerup/keyup cannot double-submit!
   */
  public abortOnTimerExpiry(): void {
    this.reset();
    this.roundLockedLatch = true;
  }

  /**
   * Aborts any dangling Overclock hold during a Peel shutter/shatter transition and applies
   * a brief keyboard-chord guard without ever swallowing explicit `#ws-btn-overclock` clicks!
   */
  public notifyPeelTransition(guardDurationMs = 220): void {
    if (this.isHolding()) {
      this.reset();
    }
    this.peelKeyGuardUntilMs = Math.max(
      this.peelKeyGuardUntilMs,
      nowMs() + Math.min(Math.max(0, guardDurationMs), 40),
    );
  }

  /**
   * Deterministic step evaluation at `elapsedMs` (exposed publicly so unit tests or
   * deterministic replay ghosts can advance without real-time wall clocks!).
   */
  public evaluateAtElapsedMs(elapsedMs: number): OverclockTelemetrySnapshot {
    const cleanElapsed = Math.max(0, elapsedMs);
    const overThreshold = cleanElapsed >= this.safeTapMaxMs;
    const chargeWindowMs = Math.max(1, this.fullChargeMs - this.safeTapMaxMs);
    const linearU = overThreshold
      ? clamp((cleanElapsed - this.safeTapMaxMs) / chargeWindowMs, 0, 1)
      : 0;
    const charge01 = overThreshold ? evaluateConvictionChargeCurve(linearU) : 0;

    const overclockMult = overThreshold ? round2(1.0 + charge01 * this.peakBonusScale) : 1.0;
    const effectiveMult = round2(this.tierMultiplier * overclockMult);

    const horizontalSlidePx = this.lastX - this.startX;
    const canSlideCancel =
      cleanElapsed >= this.safeTapMaxMs && cleanElapsed >= this.bluffCancelMinHoldMs;
    const slideCancelProgress01 = canSlideCancel
      ? clamp(Math.abs(horizontalSlidePx) / this.bluffSlideThresholdPx, 0, 1)
      : 0;

    return {
      phase: this.phase,
      source: this.activeSource,
      elapsedMs: cleanElapsed,
      linearProgress01: linearU,
      charge01,
      bonusPercent: Math.round(charge01 * 100),
      overclockMultiplier: overclockMult,
      tierMultiplier: this.tierMultiplier,
      effectiveTotalMultiplier: effectiveMult,
      backfireRiskActive: overThreshold,
      audioPitchRate: round2(0.92 + charge01 * 0.56),
      audioVolume: round2(0.2 + charge01 * 0.8),
      hapticIntensity: round2(0.2 + charge01 * 0.75),
      jawClamp01: overThreshold ? clamp(Math.pow(charge01, 0.84), 0, 1) : 0,
      cameraFovDeg: round2(46 - charge01 * 10),
      horizontalSlidePx,
      slideCancelProgress01,
    };
  }

  public getSnapshot(): OverclockTelemetrySnapshot {
    const elapsed = this.isHolding() ? Math.max(0, nowMs() - this.pressStartMs) : 0;
    return this.evaluateAtElapsedMs(elapsed);
  }

  public dispose(): void {
    this.reset();
    this.unbindButton();
    if (typeof window !== 'undefined') {
      window.removeEventListener('blur', this.onWindowBlurBound);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChangeBound);
    }
  }

  // ==========================================================================
  // INTERNAL STATE MACHINE & MULTI-SENSORY HEARTBEAT RAMP
  // ==========================================================================

  private startHoldInternal(
    source: OverclockInputSource,
    startX: number,
    startY: number,
    pointerId: number | null,
    keyCode: string | null,
  ): void {
    const t = nowMs();
    const blockedByPeelChord = source !== 'POINTER' && t < this.peelKeyGuardUntilMs;
    if (this.roundLockedLatch || t < this.commitDebounceUntilMs || blockedByPeelChord) {
      if (pointerId !== null) {
        this.releasePointerCaptureSafe(pointerId);
      }
      return;
    }
    this.phase = 'ARMED_TAP_WINDOW';
    this.activeSource = source;
    this.activePointerId = pointerId;
    this.activeKeyCode = keyCode;
    this.pressStartMs = t;
    this.startX = startX;
    this.startY = startY;
    this.lastX = startX;
    this.lastY = startY;
    this.lastMoveMs = t;
    this.horizontalVelPxPerSec = 0;
    this.currentCharge01 = 0;
    this.peakCharge01 = 0;
    this.maxReachedEmitted = false;
    this.lastHeartbeatMs = 0;

    if (source === 'POINTER') {
      this.attachWindowPointerListeners();
    }

    const initialSnap = this.evaluateAtElapsedMs(0);
    this.callbacks.onPressArmed?.(initialSnap);

    this.stopRaf();
    const tick = () => {
      if (!this.isHolding()) return;
      this.tickHoldAt(nowMs());
      if (this.isHolding() && typeof requestAnimationFrame === 'function') {
        this.rafId = requestAnimationFrame(tick);
      }
    };
    if (typeof requestAnimationFrame === 'function') {
      this.rafId = requestAnimationFrame(tick);
    }
  }

  public tickHoldAt(timestampMs: number): OverclockTelemetrySnapshot {
    const elapsedMs = Math.max(0, timestampMs - this.pressStartMs);
    const wasTapWindow = this.phase === 'ARMED_TAP_WINDOW';

    if (elapsedMs >= this.fullChargeMs) {
      this.phase = 'MAX_OVERCLOCK_READY';
    } else if (elapsedMs >= this.safeTapMaxMs) {
      this.phase = 'CHARGING';
    } else {
      this.phase = 'ARMED_TAP_WINDOW';
    }

    const snap = this.evaluateAtElapsedMs(elapsedMs);
    this.currentCharge01 = snap.charge01;
    if (snap.charge01 > this.peakCharge01) {
      this.peakCharge01 = snap.charge01;
    }

    // 1. Transition across 240ms: Ignite Conviction Overclock!
    if (wasTapWindow && elapsedMs >= this.safeTapMaxMs) {
      this.audio?.startOverclockCharge?.();
      this.callbacks.onOverclockStart?.(snap);
    }

    // 2. Drive real-time 3D jaw clamping, audio pitch/volume, haptics, and HUD bar
    if (elapsedMs >= this.safeTapMaxMs) {
      this.stage3d?.setOverclockState(true, snap.charge01);
      this.driveCardiacHeartbeatHaptics(timestampMs, snap.charge01);
      this.syncChargingHud(snap);

      if (snap.charge01 >= 1.0 && !this.maxReachedEmitted) {
        this.maxReachedEmitted = true;
        this.callbacks.onMaxChargeReached?.(snap);
      }
    }

    this.callbacks.onChargeFrame?.(snap);
    return snap;
  }

  private commitOrFinishRelease(): void {
    const releaseMs = nowMs();
    const currentPhase = this.phase;
    const source = this.activeSource ?? 'POINTER';

    this.stopRaf();
    this.detachWindowPointerListeners();
    this.activePointerId = null;
    this.activeKeyCode = null;
    this.activeSource = null;
    this.lastHandledReleaseMs = releaseMs;

    // If already vented via Bluff Echo or round timed out, pointerup/keyup must NEVER submit!
    if (this.roundLockedLatch || currentPhase === 'BLUFF_VENTED' || currentPhase === 'IDLE') {
      this.phase = 'IDLE';
      return;
    }

    const holdDurationMs = Math.max(0, releaseMs - this.pressStartMs);

    // CASE A: Released strictly < 240ms -> SAFE LOCK (1.0x Overclock, zero Backfire risk!)
    if (holdDurationMs < this.safeTapMaxMs) {
      this.commitSafeLockImmediate(releaseMs, holdDurationMs, source);
      return;
    }

    // Debounce immediate accidental double-tap within 240ms of a valid commit
    this.commitDebounceUntilMs = Math.max(this.commitDebounceUntilMs, releaseMs + 240);

    // CASE B: Held >= 240ms -> Slam Firing Pin Home (THUNK!) with nonlinear Conviction Charge!
    const finalSnap = this.evaluateAtElapsedMs(holdDurationMs);
    // Guarantee >= 0.15 floor once across 240ms so ScoringEngine registers Overclock cleanly
    const committedCharge = clamp(Math.max(0.15, finalSnap.charge01), 0.15, 1.0);
    const overclockMult = round2(1.0 + committedCharge * this.peakBonusScale);
    const effectiveMult = round2(this.tierMultiplier * overclockMult);

    this.phase = 'COMMITTED_OVERCLOCK';
    this.currentCharge01 = 0;

    this.audio?.stopOverclockCharge?.();
    this.audio?.playSfx?.('vault_thunk', {
      rate: round2(0.92 + committedCharge * 0.22),
      volumeScale: round2(0.85 + committedCharge * 0.15),
    });
    this.vibrateAndroidPattern([28, 14, 46]);
    this.haptics?.lockThunk?.();
    this.stage3d?.setOverclockState(false, 0);
    this.syncIdleHudLabel();

    const payload: OverclockCommitPayload = {
      mode: 'OVERCLOCK',
      overclocked: true,
      charge01: committedCharge,
      overclockMultiplier: overclockMult,
      effectiveTotalMultiplier: effectiveMult,
      holdDurationMs,
      source,
    };
    this.callbacks.onOverclockCommit?.(payload);
    this.callbacks.onCommit?.(payload);
  }

  private commitSafeLockImmediate(
    releaseMs: number,
    holdDurationMs: number,
    source: OverclockInputSource,
  ): void {
    this.lastHandledReleaseMs = releaseMs;
    this.commitDebounceUntilMs = Math.max(this.commitDebounceUntilMs, releaseMs + 240);
    this.phase = 'COMMITTED_SAFE';
    this.currentCharge01 = 0;
    this.audio?.stopOverclockCharge?.();
    this.audio?.playSfx?.('vault_thunk', { rate: 1.04, volumeScale: 0.78 });
    this.haptics?.lockThunk?.();
    this.stage3d?.setOverclockState(false, 0);
    this.syncIdleHudLabel();

    const payload: OverclockCommitPayload = {
      mode: 'SAFE_LOCK',
      overclocked: false,
      charge01: 0,
      overclockMultiplier: 1.0,
      effectiveTotalMultiplier: round2(this.tierMultiplier),
      holdDurationMs,
      source,
    };
    this.callbacks.onSafeLock?.(payload);
    this.callbacks.onCommit?.(payload);
  }

  /**
   * Escalating cardiac lub-dub + turbine vibration ramp (`0.2 -> 0.95` feel):
   *  • Cadence tightens from 148ms (~95 BPM) at 240ms down to 68ms (~185 BPM) at 1050ms
   *  • Android `navigator.vibrate([lub, gap, dub])` delivers unmistakable double-beat tension
   *  • Also drives `HapticsEngine.overclockPulse(charge01)` for Capacitor native engines
   */
  private driveCardiacHeartbeatHaptics(timestampMs: number, charge01: number): void {
    if (this.haptics?.isEnabled && !this.haptics.isEnabled()) {
      return;
    }

    const intervalMs = 148 - charge01 * 80; // 148ms -> 68ms
    if (timestampMs - this.lastHeartbeatMs < intervalMs) {
      return;
    }
    this.lastHeartbeatMs = timestampMs;

    // Subtle rising mechanical turbine micro-pulse in StudioAudioEngine (real Foley sample!)
    this.audio?.playSfx?.('spin_tick', {
      rate: round2(0.92 + charge01 * 0.56),
      volumeScale: round2(0.22 + charge01 * 0.48),
    });

    if (this.enableAndroidHeartbeatPatterns && !this.hasCapacitorNativeHaptics()) {
      const lubMs = Math.round(8 + charge01 * 10); // 8ms -> 18ms
      const gapMs = Math.round(24 - charge01 * 8); // 24ms -> 16ms
      const dubMs = Math.round(12 + charge01 * 18); // 12ms -> 30ms
      this.vibrateAndroidPattern([lubMs, gapMs, dubMs]);
    } else {
      this.haptics?.overclockPulse?.(charge01);
    }
  }

  private hasCapacitorNativeHaptics(): boolean {
    if (typeof window === 'undefined') return false;
    const cap = (window as unknown as { Capacitor?: { Plugins?: { Haptics?: unknown } } })
      .Capacitor;
    return Boolean(cap?.Plugins?.Haptics);
  }

  private vibrateAndroidPattern(pattern: number | number[]): void {
    if (this.haptics?.isEnabled && !this.haptics.isEnabled()) return;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore blocked web vibrate calls
    }
  }

  private isNarrowViewport(): boolean {
    if (typeof window === 'undefined') return false;
    const vw = window.visualViewport?.width ?? window.innerWidth ?? 1280;
    return vw < 460;
  }

  private syncChargingHud(snap: OverclockTelemetrySnapshot): void {
    if (!this.boundHud) return;
    if (this.boundHud.fillEl) {
      this.boundHud.fillEl.style.width = `${(snap.charge01 * 100).toFixed(1)}%`;
    }
    if (this.boundHud.labelEl) {
      const multText = snap.effectiveTotalMultiplier.toFixed(2);
      const isNarrow = this.isNarrowViewport();
      const cancelCue =
        this.activeSource === 'POINTER' ? 'SLIDE ↔ CANCEL' : 'ESC CANCEL';
      if (snap.charge01 >= 1.0) {
        this.boundHud.labelEl.textContent = isNarrow
          ? `🔥 MAX ${multText}x · RELEASE`
          : `🔥 MAX ${multText}x — RELEASE · ${cancelCue}`;
      } else {
        this.boundHud.labelEl.textContent = isNarrow
          ? `⚡ ${multText}x · RELEASE / SLIDE`
          : `⚡ OVERCLOCK ${multText}x — RELEASE · ${cancelCue}`;
      }
    }
  }

  private syncIdleHudLabel(): void {
    if (!this.boundHud) return;
    if (this.boundHud.fillEl) {
      this.boundHud.fillEl.style.width = '0%';
    }
    if (this.boundHud.labelEl) {
      const tier = this.tierMultiplier.toFixed(1);
      const maxOverclock = (this.tierMultiplier * (1 + this.peakBonusScale)).toFixed(1);
      this.boundHud.labelEl.textContent = this.isNarrowViewport()
        ? `LOCK ${tier}x · HOLD ${maxOverclock}x`
        : `TAP: LOCK (${tier}x) · HOLD: OVERCLOCK`;
    }
  }

  private attachWindowPointerListeners(): void {
    if (this.windowPointerListenersAttached || typeof window === 'undefined') return;
    if (typeof window.addEventListener !== 'function') return;
    this.windowPointerListenersAttached = true;
    window.addEventListener('pointermove', this.onWindowPointerMoveBound, true);
    window.addEventListener('pointerup', this.onPointerUpBound, true);
    window.addEventListener('pointercancel', this.onPointerCancelBound, true);
  }

  private detachWindowPointerListeners(): void {
    if (!this.windowPointerListenersAttached || typeof window === 'undefined') return;
    this.windowPointerListenersAttached = false;
    if (typeof window.removeEventListener === 'function') {
      window.removeEventListener('pointermove', this.onWindowPointerMoveBound, true);
      window.removeEventListener('pointerup', this.onPointerUpBound, true);
      window.removeEventListener('pointercancel', this.onPointerCancelBound, true);
    }
    this.lastWindowMoveEvent = null;
  }

  private stopRaf(): void {
    if (this.rafId !== 0 && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private releasePointerCaptureSafe(pointerId: number): void {
    if (this.boundHud?.buttonEl && 'releasePointerCapture' in this.boundHud.buttonEl) {
      try {
        this.boundHud.buttonEl.releasePointerCapture(pointerId);
      } catch {
        // Ignore
      }
    }
  }
}
