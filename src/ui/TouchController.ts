import type { GameActions, GameUIState, GlobeCountryCode } from '../types/game';

const GLOBE_COUNTRY_ORDER: readonly GlobeCountryCode[] = [
  'CH',
  'GB',
  'JP',
  'BR',
  'EG',
  'IS',
  'SG',
  'GLOBAL',
];

const DRAG_CAPTURE_PX = 6;
const PEEL_VERTICAL_THRESHOLD_PX = 58;
const PEEL_MAX_HORIZONTAL_PX = 35;
const PEEL_UPPER_HALF_RATIO = 0.56;
const CODEX_SPLIT_RATIO = 0.48;
const GAUNTLET_SWIPE_THRESHOLD_PX = 48;
const CALIBRATOR_DRAG_POS_DIVISOR = 280;
const CALIBRATOR_DRAG_TOL_DIVISOR = 260;
const CALIBRATOR_KEY_STEP = 0.02;
const CODEX_STEP_PX = 68;
const WHEEL_ACCUM_THRESHOLD = 28;
const WHEEL_COOLDOWN_MS = 110;
const KEY_OVERCLOCK_DELAY_MS = 160;

type SightlineDragMode = 'UNDECIDED' | 'SPIN' | 'PEEL';

export class TouchController {
  private readonly canvasRootEl: HTMLElement;
  private readonly getState: () => GameUIState;
  private readonly actions: GameActions;

  private attached = false;

  // Active pointer gesture state
  private activePointerId: number | null = null;
  private capturedPointer = false;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private startRelY = 0.5;
  private gestureConsumed = false;
  private sightlineMode: SightlineDragMode = 'UNDECIDED';
  private codexRing: 'TOP' | 'BOTTOM' = 'TOP';

  // Wheel smoothing state
  private wheelAccum = 0;
  private lastWheelStepAt = 0;

  // Desktop keyboard hold-to-overclock state
  private keyLockHeld: string | null = null;
  private keyOverclockStarted = false;
  private keyHoldTimerId: number | null = null;

  constructor(canvasRootEl: HTMLElement, getState: () => GameUIState, actions: GameActions) {
    this.canvasRootEl = canvasRootEl;
    this.getState = getState;
    this.actions = actions;
  }

  public attach(): void {
    if (this.attached) return;
    this.attached = true;

    this.canvasRootEl.addEventListener('pointerdown', this.onPointerDown);
    this.canvasRootEl.addEventListener('pointermove', this.onPointerMove);
    this.canvasRootEl.addEventListener('pointerup', this.onPointerUp);
    this.canvasRootEl.addEventListener('pointercancel', this.onPointerCancel);
    this.canvasRootEl.addEventListener('wheel', this.onWheel, { passive: false });

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
  }

  public dispose(): void {
    if (!this.attached) return;
    this.attached = false;

    this.canvasRootEl.removeEventListener('pointerdown', this.onPointerDown);
    this.canvasRootEl.removeEventListener('pointermove', this.onPointerMove);
    this.canvasRootEl.removeEventListener('pointerup', this.onPointerUp);
    this.canvasRootEl.removeEventListener('pointercancel', this.onPointerCancel);
    this.canvasRootEl.removeEventListener('wheel', this.onWheel);

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);

    this.resetPointerState();
    this.clearKeyHoldState(false);
  }

  // --------------------------------------------------------------------------
  // Pointer Gesture Handlers (Android Portrait 9:16 Touch + Desktop Mouse)
  // --------------------------------------------------------------------------
  private readonly onPointerDown = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (this.activePointerId !== null) return;

    const state = this.getState();
    if (!this.isCanvasInteractiveScreen(state)) return;

    const rect = this.canvasRootEl.getBoundingClientRect();
    const relY = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5;

    this.activePointerId = e.pointerId;
    this.capturedPointer = false;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.startRelY = relY;
    this.gestureConsumed = false;
    this.sightlineMode = 'UNDECIDED';
    this.codexRing = relY < CODEX_SPLIT_RATIO ? 'TOP' : 'BOTTOM';
  };

  private readonly onPointerMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointerId) return;

    const state = this.getState();
    if (!this.isCanvasInteractiveScreen(state)) {
      this.resetPointerState();
      return;
    }

    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    const cumDx = e.clientX - this.startX;
    const cumDy = e.clientY - this.startY;
    const totalDist = Math.hypot(cumDx, cumDy);

    // Defer pointer capture past a tiny drag threshold so crisp taps on 3D Globe beacons raycast cleanly
    if (!this.capturedPointer && totalDist >= DRAG_CAPTURE_PX) {
      this.capturedPointer = true;
      try {
        this.canvasRootEl.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture is unavailable
      }
    }

    this.lastX = e.clientX;
    this.lastY = e.clientY;

    if (state.screen === 'WORLD_GLOBE' || state.screen === 'PASSPORT_OBSERVATORY') {
      if (totalDist >= 4) {
        this.actions.dragWorldOrRelic(dx, dy);
      }
      return;
    }

    if (state.screen !== 'ACTIVE_MATCH' || !state.activeQuestion) return;
    if (this.gestureConsumed) return;

    const archetype = state.activeQuestion.question.archetype;

    if (archetype === 'SIGHTLINE_LOCK' || archetype === 'HERO_ARTIFACT_SYNTHESIS') {
      if (this.sightlineMode === 'UNDECIDED') {
        // Upper-half decisive downward swipe triggers Peel Crown
        if (
          this.startRelY < PEEL_UPPER_HALF_RATIO &&
          cumDy > PEEL_VERTICAL_THRESHOLD_PX &&
          Math.abs(cumDx) < PEEL_MAX_HORIZONTAL_PX
        ) {
          this.sightlineMode = 'PEEL';
          this.gestureConsumed = true;
          this.actions.peelPrism();
          return;
        }

        // Enter horizontal spin cleanly as soon as horizontal motion dominates (or anywhere in lower half)
        const horizontalIntent =
          this.startRelY >= PEEL_UPPER_HALF_RATIO
            ? Math.abs(cumDx) >= 4
            : Math.abs(cumDx) >= 10 && Math.abs(cumDx) > Math.abs(cumDy) * 0.72;

        if (horizontalIntent) {
          this.sightlineMode = 'SPIN';
          this.actions.spinPrism(cumDx);
        }
      } else if (this.sightlineMode === 'SPIN') {
        if (dx !== 0) {
          this.actions.spinPrism(dx);
        }
      }
      return;
    }

    if (archetype === 'CODEX_DUAL_RING') {
      if (dx !== 0 && totalDist >= 4) {
        this.actions.spinPrism(dx, this.codexRing);
      }
      return;
    }

    if (archetype === 'CALIBRATOR_DIAL') {
      if (totalDist >= 3 && (dx !== 0 || dy !== 0)) {
        this.actions.adjustCalibrator(
          dx / CALIBRATOR_DRAG_POS_DIVISOR,
          dy / CALIBRATOR_DRAG_TOL_DIVISOR
        );
      }
      return;
    }

    if (archetype === 'GAUNTLET_SHATTER') {
      this.tryTriggerGauntletSwipe(cumDx, cumDy);
    }
  };

  private readonly onPointerUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointerId) return;

    const state = this.getState();
    if (
      !this.gestureConsumed &&
      state.screen === 'ACTIVE_MATCH' &&
      state.activeQuestion &&
      !state.activeQuestion.ethicalInterrupt
    ) {
      const cumDx = e.clientX - this.startX;
      const cumDy = e.clientY - this.startY;
      const archetype = state.activeQuestion.question.archetype;

      if (
        (archetype === 'SIGHTLINE_LOCK' || archetype === 'HERO_ARTIFACT_SYNTHESIS') &&
        this.sightlineMode === 'UNDECIDED' &&
        this.startRelY < PEEL_UPPER_HALF_RATIO &&
        cumDy > PEEL_VERTICAL_THRESHOLD_PX &&
        Math.abs(cumDx) < PEEL_MAX_HORIZONTAL_PX
      ) {
        this.gestureConsumed = true;
        this.actions.peelPrism();
      } else if (archetype === 'GAUNTLET_SHATTER') {
        this.tryTriggerGauntletSwipe(cumDx, cumDy);
      }
    }

    this.releasePointerCaptureIfHeld(e.pointerId);
    this.resetPointerState();
  };

  private readonly onPointerCancel = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointerId) return;
    this.releasePointerCaptureIfHeld(e.pointerId);
    this.resetPointerState();
  };

  private tryTriggerGauntletSwipe(cumDx: number, cumDy: number): void {
    if (this.gestureConsumed) return;
    if (cumDx > GAUNTLET_SWIPE_THRESHOLD_PX && Math.abs(cumDx) >= Math.abs(cumDy)) {
      this.gestureConsumed = true;
      this.actions.swipeGauntlet('TRUE');
    } else if (cumDx < -GAUNTLET_SWIPE_THRESHOLD_PX && Math.abs(cumDx) >= Math.abs(cumDy)) {
      this.gestureConsumed = true;
      this.actions.swipeGauntlet('FALSE');
    } else if (cumDy < -GAUNTLET_SWIPE_THRESHOLD_PX && Math.abs(cumDy) > Math.abs(cumDx)) {
      this.gestureConsumed = true;
      this.actions.swipeGauntlet('CHALLENGE');
    }
  }

  // --------------------------------------------------------------------------
  // Mouse Wheel Handler (Smooth Desktop Facet / Codex / Calibrator Control)
  // --------------------------------------------------------------------------
  private readonly onWheel = (e: WheelEvent): void => {
    const state = this.getState();
    if (state.screen !== 'ACTIVE_MATCH' || !state.activeQuestion) return;
    if (state.activeQuestion.ethicalInterrupt) return;

    const archetype = state.activeQuestion.question.archetype;
    const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (rawDelta === 0) return;

    e.preventDefault();

    if (archetype === 'CALIBRATOR_DIAL') {
      const dir = rawDelta > 0 ? 1 : -1;
      if (e.shiftKey) {
        this.actions.adjustCalibrator(0, dir * 0.015);
      } else {
        this.actions.adjustCalibrator(dir * 0.015, 0);
      }
      return;
    }

    this.wheelAccum += rawDelta;
    const now = performance.now();
    if (Math.abs(this.wheelAccum) < WHEEL_ACCUM_THRESHOLD || now - this.lastWheelStepAt < WHEEL_COOLDOWN_MS) {
      return;
    }

    const dir: -1 | 1 = this.wheelAccum > 0 ? 1 : -1;
    this.wheelAccum = 0;
    this.lastWheelStepAt = now;

    if (archetype === 'SIGHTLINE_LOCK' || archetype === 'HERO_ARTIFACT_SYNTHESIS') {
      this.actions.stepFacet(dir);
    } else if (archetype === 'CODEX_DUAL_RING') {
      const rect = this.canvasRootEl.getBoundingClientRect();
      const relY = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5;
      const ring = relY < CODEX_SPLIT_RATIO ? 'TOP' : 'BOTTOM';
      this.actions.spinPrism(dir * CODEX_STEP_PX, ring);
    }
  };

  // --------------------------------------------------------------------------
  // Desktop Keyboard Shortcuts (Spin / Peel / Hold-to-Overclock / Continue)
  // --------------------------------------------------------------------------
  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }

    const state = this.getState();

    // Dialogue quick continue (when no branching choices are open)
    if (state.screen === 'DIALOGUE') {
      if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
        if (!state.dialogue?.choices || state.dialogue.choices.length === 0) {
          e.preventDefault();
          this.actions.advanceDialogue();
        }
      }
      return;
    }

    // Intel Flash quick continue
    if (state.screen === 'INTEL_FLASH') {
      if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
        e.preventDefault();
        this.actions.continueAfterIntelFlash();
      }
      return;
    }

    // World Globe 8-destination keyboard cycling (including GLOBAL Apex Forum)
    if (state.screen === 'WORLD_GLOBE') {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        const dir = e.code === 'ArrowLeft' || e.code === 'KeyA' ? -1 : 1;
        const currentIdx = GLOBE_COUNTRY_ORDER.indexOf(state.selectedGlobeCountry);
        const safeIdx = currentIdx >= 0 ? currentIdx : 0;
        const nextIdx = (safeIdx + dir + GLOBE_COUNTRY_ORDER.length) % GLOBE_COUNTRY_ORDER.length;
        this.actions.selectGlobeCountry(GLOBE_COUNTRY_ORDER[nextIdx]);
      } else if (e.code === 'Escape' && !e.repeat) {
        e.preventDefault();
        this.actions.goToTitle();
      }
      return;
    }

    // Secondary hub screens Escape back to Title
    if (
      state.screen === 'TRIALS_HUB' ||
      state.screen === 'BRIEFING_PICKER' ||
      state.screen === 'PASSPORT_OBSERVATORY'
    ) {
      if (e.code === 'Escape' && !e.repeat) {
        e.preventDefault();
        this.actions.goToTitle();
      }
      return;
    }

    if (state.screen !== 'ACTIVE_MATCH' || !state.activeQuestion) return;
    if (state.activeQuestion.ethicalInterrupt) return;

    const archetype = state.activeQuestion.question.archetype;

    if (e.code === 'Escape' && this.keyLockHeld) {
      e.preventDefault();
      this.clearKeyHoldState(true);
      return;
    }

    if (archetype === 'SIGHTLINE_LOCK' || archetype === 'HERO_ARTIFACT_SYNTHESIS') {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        this.actions.stepFacet(-1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        this.actions.stepFacet(1);
      } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && !e.repeat) {
        e.preventDefault();
        this.actions.peelPrism();
      } else if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
        e.preventDefault();
        this.beginKeyLockHold(e.code);
      }
      return;
    }

    if (archetype === 'CALIBRATOR_DIAL') {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        this.actions.adjustCalibrator(-CALIBRATOR_KEY_STEP, 0);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        this.actions.adjustCalibrator(CALIBRATOR_KEY_STEP, 0);
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        this.actions.adjustCalibrator(0, -CALIBRATOR_KEY_STEP);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        this.actions.adjustCalibrator(0, CALIBRATOR_KEY_STEP);
      } else if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
        e.preventDefault();
        this.beginKeyLockHold(e.code);
      }
      return;
    }

    if (archetype === 'CODEX_DUAL_RING') {
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.actions.spinPrism(-CODEX_STEP_PX, 'TOP');
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.actions.spinPrism(CODEX_STEP_PX, 'TOP');
      } else if (e.code === 'KeyA') {
        e.preventDefault();
        this.actions.spinPrism(-CODEX_STEP_PX, 'BOTTOM');
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        this.actions.spinPrism(CODEX_STEP_PX, 'BOTTOM');
      } else if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
        e.preventDefault();
        this.actions.commitCodex();
      }
      return;
    }

    if (archetype === 'GAUNTLET_SHATTER' && !e.repeat) {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        this.actions.swipeGauntlet('FALSE');
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        this.actions.swipeGauntlet('CHALLENGE');
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        this.actions.swipeGauntlet('TRUE');
      }
    }
  };

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    if (this.keyLockHeld !== e.code) return;
    e.preventDefault();

    const state = this.getState();
    this.clearKeyHoldState(false);

    if (
      state.screen === 'ACTIVE_MATCH' &&
      state.activeQuestion &&
      !state.activeQuestion.ethicalInterrupt
    ) {
      this.actions.commitLock();
    }
  };

  private readonly onWindowBlur = (): void => {
    this.clearKeyHoldState(true);
    this.resetPointerState();
  };

  private beginKeyLockHold(code: string): void {
    const active = document.activeElement as HTMLElement | null;
    if (active && active.tagName === 'BUTTON') {
      active.blur();
    }
    this.clearKeyHoldState(false);
    this.keyLockHeld = code;
    this.keyOverclockStarted = false;
    this.keyHoldTimerId = window.setTimeout(() => {
      this.keyHoldTimerId = null;
      if (this.keyLockHeld === code) {
        const state = this.getState();
        if (
          state.screen === 'ACTIVE_MATCH' &&
          state.activeQuestion &&
          !state.activeQuestion.ethicalInterrupt
        ) {
          this.keyOverclockStarted = true;
          this.actions.beginOverclock();
        }
      }
    }, KEY_OVERCLOCK_DELAY_MS);
  }

  private clearKeyHoldState(cancelOverclock: boolean): void {
    if (this.keyHoldTimerId !== null) {
      window.clearTimeout(this.keyHoldTimerId);
      this.keyHoldTimerId = null;
    }
    const shouldCancel = cancelOverclock && this.keyOverclockStarted;
    this.keyLockHeld = null;
    this.keyOverclockStarted = false;
    if (shouldCancel) {
      this.actions.cancelOverclock();
    }
  }

  private isCanvasInteractiveScreen(state: GameUIState): boolean {
    if (state.screen === 'WORLD_GLOBE' || state.screen === 'PASSPORT_OBSERVATORY') {
      return true;
    }
    if (state.screen === 'ACTIVE_MATCH' && state.activeQuestion && !state.activeQuestion.ethicalInterrupt) {
      return true;
    }
    return false;
  }

  private releasePointerCaptureIfHeld(pointerId: number): void {
    if (!this.capturedPointer) return;
    try {
      if (this.canvasRootEl.hasPointerCapture(pointerId)) {
        this.canvasRootEl.releasePointerCapture(pointerId);
      }
    } catch {
      // Ignore
    }
  }

  private resetPointerState(): void {
    this.activePointerId = null;
    this.capturedPointer = false;
    this.gestureConsumed = false;
    this.sightlineMode = 'UNDECIDED';
  }
}
