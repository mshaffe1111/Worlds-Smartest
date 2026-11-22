// ============================================================================
// WORLD'S SMARTEST — Crisp Desktop Keyboard & Dual-Rumble Gamepad Bridge
// PITCH_BIBLE.md §3.1 ("Spin. Peel. Overclock.") & Multi-Platform Ergonomics
// ============================================================================
//
// Desktop Shortcuts (Automatically suppressed inside native <input>/<textarea>):
//  • ArrowLeft / ArrowRight or A / D -> Spin Prism (±1 90° Sightline step)
//  • 1 .. 4 (and Numpad 1..4)        -> Direct Facet Spin into Sightline Beam
//  • ArrowDown or P                  -> Peel Brass Crown (Tier 1 -> 2 -> 3)
//  • Space / Enter (Tap < 240ms)     -> Safe Lock (1.0x Overclock, 0 Backfire)
//  • Space / Enter (Hold 240..1050ms)-> Conviction Overclock (up to 6.0x!)
//  • Escape (while holding Overclock)-> Bluff Echo Safe Vent & Cancel!
//
// Standard HTML5 Gamepad Support (Xbox / DualSense / Switch Pro):
//  • D-Pad Left/Right or Left Stick X -> Spin Prism
//  • D-Pad Down / Y / LB              -> Peel Brass Crown
//  • A (Cross) or RT                  -> Tap = Safe Lock, Hold = Overclock
//  • B (Circle) or Right Stick Flick  -> Bluff Echo Cancel while holding
//  • Dual-Rumble motor haptics synced to Overclock Heartbeat & Vault Thunk!
// ============================================================================

import {
  OverclockGestureController,
  type OverclockCommitPayload,
} from './OverclockGestureController';

export type BridgeScreenMode =
  | 'GAMEPLAY_LIVE'
  | 'GAMEPLAY_REVEALED'
  | 'STORY_DIALOGUE'
  | 'MODAL_OPEN'
  | 'CUTSCENE'
  | 'HUB'
  | 'REGISTRATION'
  | 'SUMMARY';

export type BridgeActiveArchetype =
  | 'SIGHTLINE_LOCK'
  | 'CODEX_DUAL_RING'
  | 'CALIBRATOR_DIAL'
  | 'GAUNTLET_SHATTER'
  | 'HERO_ARTIFACT_SYNTHESIS';

export interface KeyboardGamepadStateQuery {
  /** Returns current screen state so shortcuts route cleanly without misfires */
  getScreenMode: () => BridgeScreenMode;
  /** Returns current 3D Prism morph when in GAMEPLAY_LIVE (default: 'SIGHTLINE_LOCK') */
  getActiveArchetype?: () => BridgeActiveArchetype;
  /** Optional hook returning true when mandatory branching story choices are displayed */
  hasActiveStoryChoices?: () => boolean;
}

export interface KeyboardGamepadCallbacks {
  /** ArrowLeft / A (-1) or ArrowRight / D (+1) in SIGHTLINE_LOCK / HERO_ARTIFACT_SYNTHESIS */
  onSpinStep?: (delta: -1 | 1) => void;
  /** Direct 1..4 (or 1..6) facet spin into the Gold Sightline Beam */
  onDirectFacetSpin?: (facetIndex: number) => void;
  /** ArrowDown / P to crack open the next Brass Crown Peel tier */
  onPeelCrown?: () => void;
  /** Safe Lock (< 240ms tap on Space / Enter / Gamepad A) */
  onSafeLock?: (payload: OverclockCommitPayload) => void;
  /** Conviction Overclock Commit (240ms..1050ms hold on Space / Enter / Gamepad A) */
  onOverclockCommit?: (payload: OverclockCommitPayload) => void;
  /** Unified Lock callback (charge01 === 0 for Safe Lock, > 0 for Overclock) */
  onCommitLock?: (overclockCharge01: number, payload: OverclockCommitPayload) => void;
  /** Continuous Overclock charge progress [0..1] when driven via Space/Enter/Gamepad */
  onOverclockProgress?: (charge01: number, active: boolean) => void;
  /** Escape (or Gamepad B) pressed while holding Overclock -> Bluff Echo Safe Cancel! */
  onBluffCancel?: () => void;

  // Optional Morph-Specific Shortcuts
  /** Gauntlet Shatter: ArrowLeft/A = DEBUNK, ArrowUp/W = CHALLENGE, ArrowRight/D = VERIFY */
  onGauntletVerdict?: (verdict: 'DEBUNK' | 'CHALLENGE' | 'VERIFY') => void;
  /** Calibrator Dial: ArrowLeft/A or ArrowRight/D nudges estimate by ±steps */
  onCalibratorNudge?: (stepMultiplier: number) => void;
  /** Calibrator Dial: 1/2/3 selects WIDE / SHARP / PINHOLE Tolerance Cone */
  onCalibratorSelectCone?: (coneIndex: 0 | 1 | 2) => void;
  /** Codex Dual-Ring: cycle active top subject or spin target ring */
  onCodexStep?: (subjectIndex: 0 | 1 | 2, targetDelta: -1 | 1) => void;

  // Non-live-gameplay navigation shortcuts
  /** Space / Enter when question is already revealed, or in Story Dialogue / Summary */
  onAdvanceOrContinue?: () => void;
  /** 1..4 in Story Dialogue to pick a branching narrative choice */
  onSelectDialogueChoiceByIndex?: (choiceIndex: number) => void;
  /** Escape when NOT holding Overclock (e.g. close Passport/Dossier modal) */
  onEscapeDismiss?: () => void;
}

export interface KeyboardGamepadBridgeConfig {
  /** Shared OverclockGestureController (if omitted, Bridge creates & manages an internal one!) */
  overclockController?: OverclockGestureController;
  /** Enables 60fps W3C Gamepad polling & Dual-Rumble haptics (default: true) */
  enableGamepad?: boolean;
  /** Analog stick deadzone [0.15 .. 0.85] (default: 0.46) */
  stickDeadzone?: number;
}

interface DualRumbleActuator {
  playEffect?: (
    type: 'dual-rumble',
    params: {
      startDelay?: number;
      duration: number;
      weakMagnitude: number;
      strongMagnitude: number;
    },
  ) => Promise<unknown> | void;
}

type GamepadWithRumble = Omit<Gamepad, 'vibrationActuator'> & {
  vibrationActuator?: DualRumbleActuator | null;
};

/**
 * Returns true whenever the user is typing in a native text input, textarea,
 * select, or contentEditable field (e.g. `#challenger-name-input` in Geneva!).
 */
export function isEditableInputFocused(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toUpperCase();
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') {
    const type = ((el as HTMLInputElement).type || 'text').toLowerCase();
    // Range sliders shouldn't block Space/Enter lock or Escape, but text inputs MUST block all game hotkeys!
    return type !== 'range' && type !== 'button' && type !== 'submit';
  }
  return Boolean((el as HTMLElement).isContentEditable);
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

export class KeyboardGamepadBridge {
  private stateQuery: KeyboardGamepadStateQuery;
  private callbacks: KeyboardGamepadCallbacks;
  private readonly overclock: OverclockGestureController;
  private readonly ownsOverclockInstance: boolean;
  private readonly enableGamepad: boolean;
  private readonly stickDeadzone: number;

  private installed = false;
  private enabled = true;
  private activeCodexSubject: 0 | 1 | 2 = 0;

  // Held key tracking so Space/Enter hold cleanly ignores OS key-repeat
  private heldLockKeyCode: string | null = null;
  private suppressClickUntilMs = 0;

  // Gamepad polling edge-trigger state
  private gamepadRafId = 0;
  private prevGpSpinDir: -1 | 0 | 1 = 0;
  private lastGpSpinStepMs = 0;
  private prevGpPeelPressed = false;
  private prevGpChallengePressed = false;
  private prevGpLockPressed = false;
  private prevGpCancelPressed = false;
  private prevGpStartPressed = false;
  private lastRumbleMs = 0;

  private readonly onKeyDownBound = (ev: KeyboardEvent) => this.handleKeyDown(ev);
  private readonly onKeyUpBound = (ev: KeyboardEvent) => this.handleKeyUp(ev);
  private readonly onClickCaptureBound = (ev: MouseEvent) => this.handleSyntheticClickGuard(ev);
  private readonly onWindowBlurBound = () => this.handleWindowBlur();
  private readonly onGamepadConnectedBound = () => this.ensureGamepadLoop();

  constructor(
    stateQuery: KeyboardGamepadStateQuery,
    callbacks: KeyboardGamepadCallbacks,
    config: KeyboardGamepadBridgeConfig = {},
  ) {
    this.stateQuery = stateQuery;
    this.callbacks = callbacks;
    this.enableGamepad = config.enableGamepad ?? true;
    this.stickDeadzone = config.stickDeadzone ?? 0.46;

    if (config.overclockController) {
      this.overclock = config.overclockController;
      this.ownsOverclockInstance = false;
    } else {
      this.ownsOverclockInstance = true;
      this.overclock = new OverclockGestureController({
        onChargeFrame: (snap) => {
          const active = snap.elapsedMs >= OverclockGestureController.SAFE_TAP_MAX_MS;
          this.callbacks.onOverclockProgress?.(snap.charge01, active);
          if (active && snap.source === 'GAMEPAD') {
            this.pulseGamepadRumble(snap.charge01);
          }
        },
        onSafeLock: (payload) => {
          this.callbacks.onSafeLock?.(payload);
          this.callbacks.onCommitLock?.(0, payload);
        },
        onOverclockCommit: (payload) => {
          if (payload.source === 'GAMEPAD') {
            this.triggerGamepadVaultThunk();
          }
          this.callbacks.onOverclockCommit?.(payload);
          this.callbacks.onCommitLock?.(payload.charge01, payload);
        },
        onBluffEchoCancel: () => {
          this.callbacks.onOverclockProgress?.(0, false);
          this.callbacks.onBluffCancel?.();
        },
      });
    }
  }

  public getOverclockController(): OverclockGestureController {
    return this.overclock;
  }

  public setCallbacks(callbacks: KeyboardGamepadCallbacks): void {
    this.callbacks = callbacks;
  }

  public setStateQuery(stateQuery: KeyboardGamepadStateQuery): void {
    this.stateQuery = stateQuery;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = Boolean(enabled);
    if (!this.enabled) {
      this.handleWindowBlur();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Attaches global keyboard & gamepad listeners. Returns an unsubscribe cleanup function.
   */
  public install(): () => void {
    if (this.installed || typeof window === 'undefined') {
      return () => this.dispose();
    }
    this.installed = true;

    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
    // Capture-phase guard prevents Space/Enter keyup on a focused <button> from firing a duplicate click!
    window.addEventListener('click', this.onClickCaptureBound, true);
    window.addEventListener('blur', this.onWindowBlurBound);

    if (this.enableGamepad) {
      window.addEventListener('gamepadconnected', this.onGamepadConnectedBound);
      this.ensureGamepadLoop();
    }

    return () => this.dispose();
  }

  public dispose(): void {
    if (!this.installed) return;
    this.installed = false;

    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.onKeyDownBound);
      window.removeEventListener('keyup', this.onKeyUpBound);
      window.removeEventListener('click', this.onClickCaptureBound, true);
      window.removeEventListener('blur', this.onWindowBlurBound);
      window.removeEventListener('gamepadconnected', this.onGamepadConnectedBound);
    }

    if (this.gamepadRafId !== 0 && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.gamepadRafId);
      this.gamepadRafId = 0;
    }

    if (this.ownsOverclockInstance) {
      this.overclock.dispose();
    }
  }

  // ==========================================================================
  // DESKTOP KEYBOARD ROUTER
  // ==========================================================================

  public handleKeyDown(ev: KeyboardEvent): void {
    if (!this.enabled) return;
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;

    // 1. NEVER hijack typing inside Challenger Name or Passport <input> fields!
    if (isEditableInputFocused()) {
      return;
    }

    const mode = this.stateQuery.getScreenMode();
    const key = ev.key;
    const lower = key.toLowerCase();

    // 2. ESCAPE: Priority #1 — Bluff Echo Safe Cancel if Overclock is currently held!
    if (key === 'Escape') {
      if (this.overclock.isHolding()) {
        ev.preventDefault();
        ev.stopPropagation();
        this.heldLockKeyCode = null;
        const cancelledByShared = this.overclock.cancelAsBluffEcho('ESCAPE_KEY');
        if (cancelledByShared && !this.ownsOverclockInstance) {
          // Notify bridge listener if external controller doesn't already route back
          this.callbacks.onBluffCancel?.();
        }
        return;
      }
      if (!ev.repeat) {
        this.callbacks.onEscapeDismiss?.();
      }
      return;
    }

    // 3. Abort any in-flight Overclock hold immediately if round left GAMEPLAY_LIVE (e.g. 0.0s timeout!)
    if (mode !== 'GAMEPLAY_LIVE' && this.overclock.isHolding()) {
      this.overclock.abortOnTimerExpiry();
      this.heldLockKeyCode = null;
    }

    // 4. Non-live-gameplay screens (Modal, Cutscene, Reveal, Dialogue, Summary)
    if (mode === 'MODAL_OPEN' || mode === 'CUTSCENE' || mode === 'REGISTRATION' || mode === 'HUB') {
      return;
    }

    if (mode === 'GAMEPLAY_REVEALED' || mode === 'SUMMARY') {
      if ((key === 'Enter' || key === ' ') && !ev.repeat) {
        ev.preventDefault();
        this.suppressClickUntilMs = nowMs() + 120;
        this.callbacks.onAdvanceOrContinue?.();
      }
      return;
    }

    if (mode === 'STORY_DIALOGUE') {
      const choicesRendered = this.hasStoryChoicesOnScreen();
      if ((key === 'Enter' || key === ' ') && !ev.repeat) {
        // NEVER bypass mandatory branching narrative or ending choices (#145 P0)!
        if (choicesRendered) {
          return;
        }
        ev.preventDefault();
        this.suppressClickUntilMs = nowMs() + 120;
        this.callbacks.onAdvanceOrContinue?.();
        return;
      }
      const choiceIdx = this.parseDirectNumberIndex(ev);
      if (choiceIdx !== null && choiceIdx < 4 && !ev.repeat) {
        ev.preventDefault();
        if (this.callbacks.onSelectDialogueChoiceByIndex) {
          this.callbacks.onSelectDialogueChoiceByIndex(choiceIdx);
        } else if (choicesRendered && typeof document !== 'undefined') {
          const btns = document.querySelectorAll<HTMLButtonElement>('[data-story-choice]');
          btns[choiceIdx]?.click();
        }
      }
      return;
    }

    // 4. GAMEPLAY_LIVE — Full Tactile Verbs ("Spin. Peel. Overclock.")
    const archetype = this.stateQuery.getActiveArchetype?.() ?? 'SIGHTLINE_LOCK';

    // SPACE / ENTER -> Tap (<240ms) = Safe Lock, Hold (240..1050ms) = Overclock!
    if (key === ' ' || key === 'Enter') {
      ev.preventDefault();
      this.suppressClickUntilMs = nowMs() + 350;
      if (ev.repeat || this.heldLockKeyCode !== null) {
        return;
      }
      if (archetype === 'GAUNTLET_SHATTER') {
        // Gauntlet uses directional swipes rather than Overclock lock bar
        return;
      }
      this.heldLockKeyCode = ev.code || key;
      this.overclock.beginKeyHold(this.heldLockKeyCode, 'KEYBOARD');
      return;
    }

    // PEEL BRASS CROWN: ArrowDown or P
    if (key === 'ArrowDown' || lower === 'p') {
      if (archetype === 'CODEX_DUAL_RING' && key === 'ArrowDown') {
        if (!ev.repeat) {
          ev.preventDefault();
          this.activeCodexSubject = ((this.activeCodexSubject + 1) % 3) as 0 | 1 | 2;
        }
        return;
      }
      ev.preventDefault();
      if (!ev.repeat) {
        this.overclock.notifyPeelTransition(220);
        this.callbacks.onPeelCrown?.();
      }
      return;
    }

    // Morph-aware directional & numeric controls
    if (archetype === 'GAUNTLET_SHATTER') {
      if (ev.repeat) return;
      if (key === 'ArrowLeft' || lower === 'a') {
        ev.preventDefault();
        this.callbacks.onGauntletVerdict?.('DEBUNK');
      } else if (key === 'ArrowRight' || lower === 'd') {
        ev.preventDefault();
        this.callbacks.onGauntletVerdict?.('VERIFY');
      } else if (key === 'ArrowUp' || lower === 'w') {
        ev.preventDefault();
        this.callbacks.onGauntletVerdict?.('CHALLENGE');
      }
      return;
    }

    if (archetype === 'CALIBRATOR_DIAL') {
      const mult = ev.shiftKey ? 5 : 1;
      if (key === 'ArrowLeft' || lower === 'a') {
        ev.preventDefault();
        this.callbacks.onCalibratorNudge?.(-mult);
        return;
      }
      if (key === 'ArrowRight' || lower === 'd') {
        ev.preventDefault();
        this.callbacks.onCalibratorNudge?.(mult);
        return;
      }
      const coneIdx = this.parseDirectNumberIndex(ev);
      if (coneIdx !== null && coneIdx <= 2 && !ev.repeat) {
        ev.preventDefault();
        this.callbacks.onCalibratorSelectCone?.(coneIdx as 0 | 1 | 2);
      }
      return;
    }

    if (archetype === 'CODEX_DUAL_RING') {
      if (key === 'ArrowUp' || lower === 'w') {
        if (!ev.repeat) {
          ev.preventDefault();
          this.activeCodexSubject = ((this.activeCodexSubject + 2) % 3) as 0 | 1 | 2;
        }
        return;
      }
      const subjIdx = this.parseDirectNumberIndex(ev);
      if (subjIdx !== null && subjIdx <= 2 && !ev.repeat) {
        ev.preventDefault();
        this.activeCodexSubject = subjIdx as 0 | 1 | 2;
        return;
      }
      if ((key === 'ArrowLeft' || lower === 'a') && !ev.repeat) {
        ev.preventDefault();
        this.callbacks.onCodexStep?.(this.activeCodexSubject, -1);
      } else if ((key === 'ArrowRight' || lower === 'd') && !ev.repeat) {
        ev.preventDefault();
        this.callbacks.onCodexStep?.(this.activeCodexSubject, 1);
      }
      return;
    }

    // Default Star Morphs: SIGHTLINE_LOCK & HERO_ARTIFACT_SYNTHESIS
    // 1. ArrowLeft / ArrowRight or A / D -> Spin Prism (±1 90° facet)
    if (key === 'ArrowLeft' || lower === 'a') {
      ev.preventDefault();
      if (!ev.repeat) {
        this.callbacks.onSpinStep?.(-1);
      }
      return;
    }
    if (key === 'ArrowRight' || lower === 'd') {
      ev.preventDefault();
      if (!ev.repeat) {
        this.callbacks.onSpinStep?.(1);
      }
      return;
    }

    // 2. Direct Facet Spin: 1..4 (and 5..6 for 6-facet Prisms)
    const directFacet = this.parseDirectNumberIndex(ev);
    if (directFacet !== null && directFacet < 6 && !ev.repeat) {
      ev.preventDefault();
      this.callbacks.onDirectFacetSpin?.(directFacet);
    }
  }

  public handleKeyUp(ev: KeyboardEvent): void {
    if (!this.enabled) return;
    const matchCode = ev.code || ev.key;

    if (
      this.heldLockKeyCode !== null &&
      (matchCode === this.heldLockKeyCode || ev.key === ' ' || ev.key === 'Enter')
    ) {
      ev.preventDefault();
      const releasedCode = this.heldLockKeyCode;
      this.heldLockKeyCode = null;
      this.suppressClickUntilMs = nowMs() + 140;

      if (this.stateQuery.getScreenMode() !== 'GAMEPLAY_LIVE') {
        this.overclock.cancelAsBluffEcho('BLUR_SAFETY');
        return;
      }
      this.overclock.releaseKeyHold(releasedCode);
    }
  }

  // ==========================================================================
  // STANDARD W3C GAMEPAD POLLING & DUAL-RUMBLE HAPTICS
  // ==========================================================================

  private ensureGamepadLoop(): void {
    if (this.gamepadRafId !== 0 || typeof requestAnimationFrame !== 'function') return;
    const poll = () => {
      if (!this.installed) {
        this.gamepadRafId = 0;
        return;
      }
      this.pollGamepadsOnce();
      this.gamepadRafId = requestAnimationFrame(poll);
    };
    this.gamepadRafId = requestAnimationFrame(poll);
  }

  private pollGamepadsOnce(): void {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.getGamepads) {
      return;
    }

    let gp: GamepadWithRumble | null = null;
    try {
      const pads = navigator.getGamepads();
      for (const candidate of pads) {
        if (candidate && candidate.connected) {
          gp = candidate as GamepadWithRumble;
          break;
        }
      }
    } catch {
      return;
    }

    if (!gp) return;

    const t = nowMs();
    const mode = this.stateQuery.getScreenMode();
    const archetype = this.stateQuery.getActiveArchetype?.() ?? 'SIGHTLINE_LOCK';

    const btnPressed = (idx: number, threshold = 0.45): boolean => {
      const b = gp?.buttons?.[idx];
      if (!b) return false;
      return Boolean(b.pressed || b.value >= threshold);
    };

    const dpadLeft = btnPressed(14);
    const dpadRight = btnPressed(15);
    const dpadUp = btnPressed(12);
    const dpadDown = btnPressed(13);
    const stickX = gp.axes?.[0] ?? 0;
    const rightStickX = gp.axes?.[2] ?? 0;

    const spinDir: -1 | 0 | 1 =
      dpadLeft || stickX <= -this.stickDeadzone
        ? -1
        : dpadRight || stickX >= this.stickDeadzone
          ? 1
          : 0;

    const lockHeld = btnPressed(0) || btnPressed(7, 0.45); // A/Cross or Right Trigger
    const cancelPressed = btnPressed(1) || Math.abs(rightStickX) >= 0.72; // B/Circle or R-Stick flick
    const peelPressed = dpadDown || btnPressed(3) || btnPressed(4); // D-Down, Y/Triangle, or LB
    const startPressed = btnPressed(9);

    // 1. Bluff Echo Cancel while holding Overclock
    if (cancelPressed && !this.prevGpCancelPressed) {
      if (this.overclock.isHolding()) {
        this.overclock.cancelAsBluffEcho('GAMEPAD_CANCEL');
        if (!this.ownsOverclockInstance) {
          this.callbacks.onBluffCancel?.();
        }
      } else if (mode === 'MODAL_OPEN') {
        this.callbacks.onEscapeDismiss?.();
      }
    }
    this.prevGpCancelPressed = cancelPressed;

    if (startPressed && !this.prevGpStartPressed && !this.overclock.isHolding()) {
      this.callbacks.onEscapeDismiss?.();
    }
    this.prevGpStartPressed = startPressed;

    // 2. Abort any active Overclock hold & rumble BEFORE checking GAMEPLAY_REVEALED (#145 P1)!
    if (mode !== 'GAMEPLAY_LIVE' && this.overclock.isHolding()) {
      this.overclock.abortOnTimerExpiry();
      this.heldLockKeyCode = null;
    }

    // 3. Non-live-gameplay advance on fresh A press (guarded against mandatory [data-story-choice]!)
    if (mode === 'GAMEPLAY_REVEALED' || mode === 'STORY_DIALOGUE' || mode === 'SUMMARY') {
      if (lockHeld && !this.prevGpLockPressed) {
        if (mode !== 'STORY_DIALOGUE' || !this.hasStoryChoicesOnScreen()) {
          this.callbacks.onAdvanceOrContinue?.();
        }
      }
      this.prevGpLockPressed = lockHeld;
      return;
    }

    if (mode !== 'GAMEPLAY_LIVE') {
      this.prevGpLockPressed = lockHeld;
      return;
    }

    // 3. Live Gameplay Spin / Peel / Overclock
    if (spinDir !== 0) {
      const repeatInterval = this.prevGpSpinDir === spinDir ? 145 : 0;
      if (this.prevGpSpinDir !== spinDir || t - this.lastGpSpinStepMs >= repeatInterval) {
        this.lastGpSpinStepMs = t;
        if (archetype === 'GAUNTLET_SHATTER') {
          this.callbacks.onGauntletVerdict?.(spinDir < 0 ? 'DEBUNK' : 'VERIFY');
        } else if (archetype === 'CALIBRATOR_DIAL') {
          this.callbacks.onCalibratorNudge?.(spinDir);
        } else if (archetype === 'CODEX_DUAL_RING') {
          this.callbacks.onCodexStep?.(this.activeCodexSubject, spinDir);
        } else {
          this.callbacks.onSpinStep?.(spinDir);
        }
      }
    }
    this.prevGpSpinDir = spinDir;

    if (dpadUp && !this.prevGpChallengePressed && archetype === 'GAUNTLET_SHATTER') {
      this.callbacks.onGauntletVerdict?.('CHALLENGE');
    }
    this.prevGpChallengePressed = dpadUp;

    if (peelPressed && !this.prevGpPeelPressed) {
      this.callbacks.onPeelCrown?.();
    }
    this.prevGpPeelPressed = peelPressed;

    if (lockHeld && !this.prevGpLockPressed && archetype !== 'GAUNTLET_SHATTER') {
      this.overclock.beginKeyHold('GAMEPAD_A', 'GAMEPAD');
    } else if (!lockHeld && this.prevGpLockPressed) {
      this.overclock.releaseKeyHold('GAMEPAD_A');
    }
    this.prevGpLockPressed = lockHeld;
  }

  private pulseGamepadRumble(charge01: number): void {
    const t = nowMs();
    if (t - this.lastRumbleMs < 85) return;
    this.lastRumbleMs = t;
    this.playDualRumble(65, 0.15 + charge01 * 0.65, 0.08 + charge01 * 0.72);
  }

  private triggerGamepadVaultThunk(): void {
    this.playDualRumble(95, 0.85, 0.95);
  }

  private playDualRumble(duration: number, weak: number, strong: number): void {
    try {
      if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
      for (const pad of navigator.getGamepads()) {
        const rumblePad = pad as GamepadWithRumble | null;
        if (rumblePad?.connected && rumblePad.vibrationActuator?.playEffect) {
          void Promise.resolve(
            rumblePad.vibrationActuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration,
              weakMagnitude: Math.max(0, Math.min(1, weak)),
              strongMagnitude: Math.max(0, Math.min(1, strong)),
            }),
          ).catch(() => {});
          break;
        }
      }
    } catch {
      // Ignore unsupported controller vibration APIs
    }
  }

  private hasStoryChoicesOnScreen(): boolean {
    if (this.stateQuery.hasActiveStoryChoices?.()) {
      return true;
    }
    if (typeof document !== 'undefined') {
      const btn = document.querySelector('[data-story-choice]');
      if (btn instanceof HTMLElement && !btn.hasAttribute('disabled')) {
        return true;
      }
    }
    return false;
  }

  private parseDirectNumberIndex(ev: KeyboardEvent): number | null {
    if (ev.key >= '1' && ev.key <= '6') {
      return Number(ev.key) - 1;
    }
    if (ev.code && ev.code.startsWith('Numpad')) {
      const n = Number(ev.code.slice('Numpad'.length));
      if (n >= 1 && n <= 6) return n - 1;
    }
    return null;
  }

  private handleSyntheticClickGuard(ev: MouseEvent): void {
    // Keyboard-synthesized button clicks have detail === 0
    if (ev.detail === 0 && nowMs() < this.suppressClickUntilMs) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  }

  private handleWindowBlur(): void {
    if (this.heldLockKeyCode !== null || this.overclock.isHolding()) {
      this.heldLockKeyCode = null;
      this.overclock.cancelAsBluffEcho('BLUR_SAFETY');
    }
  }
}
