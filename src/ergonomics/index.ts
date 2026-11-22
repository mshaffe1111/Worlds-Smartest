// ============================================================================
// WORLD'S SMARTEST — Machined-Luxury Tactile Ergonomics & Viewport QA Suite
// PITCH_BIBLE.md §3.1 ("Spin. Peel. Overclock.") & §5.1 (Three-Zone Framing)
// ============================================================================

export {
  PrismTouchPhysics,
  type SpotlightGestureIntent,
  type SpotlightHitZone,
  type PrismEscapementTickEvent,
  type PrismDetentSnapEvent,
  type PrismQuickTapEvent,
  type PrismCrownPeelProgressEvent,
  type PrismHoldCandidateEvent,
  type PrismTouchPhysicsCallbacks,
  type PrismTouchPhysicsConfig,
  type PrismPhysicsSnapshot,
} from './PrismTouchPhysics';

export {
  OverclockGestureController,
  evaluateConvictionChargeCurve,
  type OverclockGesturePhase,
  type OverclockInputSource,
  type BluffCancelReason,
  type OverclockAudioDriver,
  type OverclockHapticsDriver,
  type OverclockStage3DDriver,
  type OverclockHudElements,
  type OverclockTelemetrySnapshot,
  type OverclockCommitPayload,
  type OverclockBluffCancelPayload,
  type OverclockGestureCallbacks,
  type OverclockGestureConfig,
} from './OverclockGestureController';

export {
  ViewportFitGuard,
  MOBILE_FIRST_AUDIT_VIEWPORTS,
  computeViewportMetrics,
  runWorkspaceLayoutAudit,
  type ViewportOrientation,
  type ViewportProfileId,
  type AuditViewportPreset,
  type ComputedViewportMetrics,
  type LayoutClipViolation,
  type TouchTargetViolation,
  type HiddenOrCoveredFacetViolation,
  type NestedBoxViolation,
  type LayoutAuditOptions,
  type LayoutAuditReport,
  type ViewportFitGuardConfig,
} from './ViewportFitGuard';

export {
  KeyboardGamepadBridge,
  isEditableInputFocused,
  type BridgeScreenMode,
  type BridgeActiveArchetype,
  type KeyboardGamepadStateQuery,
  type KeyboardGamepadCallbacks,
  type KeyboardGamepadBridgeConfig,
} from './KeyboardGamepadBridge';

import {
  PrismTouchPhysics,
  type PrismTouchPhysicsCallbacks,
  type PrismTouchPhysicsConfig,
} from './PrismTouchPhysics';
import {
  OverclockGestureController,
  type OverclockAudioDriver,
  type OverclockGestureCallbacks,
  type OverclockHapticsDriver,
  type OverclockStage3DDriver,
} from './OverclockGestureController';
import { ViewportFitGuard, type ViewportFitGuardConfig } from './ViewportFitGuard';
import {
  KeyboardGamepadBridge,
  type KeyboardGamepadCallbacks,
  type KeyboardGamepadStateQuery,
} from './KeyboardGamepadBridge';

export interface TactileErgonomicsSuiteOptions {
  stateQuery: KeyboardGamepadStateQuery;
  audio?: OverclockAudioDriver | null;
  haptics?: OverclockHapticsDriver | null;
  stage3d?: OverclockStage3DDriver | null;
  viewportConfig?: ViewportFitGuardConfig;
  touchPhysicsConfig?: PrismTouchPhysicsConfig;
  touchCallbacks?: PrismTouchPhysicsCallbacks;
  overclockCallbacks?: OverclockGestureCallbacks;
  shortcutCallbacks?: KeyboardGamepadCallbacks;
}

/**
 * Optional turnkey coordinator uniting all 4 `src/ergonomics/**` controllers
 * with shared Overclock state, Peel transition debouncing, and 1-call cleanup.
 */
export class TactileErgonomicsSuite {
  public readonly viewportGuard: ViewportFitGuard;
  public readonly prismPhysics: PrismTouchPhysics;
  public readonly overclock: OverclockGestureController;
  public readonly shortcuts: KeyboardGamepadBridge;

  constructor(options: TactileErgonomicsSuiteOptions) {
    this.viewportGuard = new ViewportFitGuard(options.viewportConfig);
    this.prismPhysics = new PrismTouchPhysics(
      options.touchCallbacks ?? {},
      options.touchPhysicsConfig,
    );
    this.overclock = new OverclockGestureController(options.overclockCallbacks ?? {}, {
      audio: options.audio ?? null,
      haptics: options.haptics ?? null,
      stage3d: options.stage3d ?? null,
    });
    this.shortcuts = new KeyboardGamepadBridge(
      options.stateQuery,
      options.shortcutCallbacks ?? {},
      {
        overclockController: this.overclock,
      },
    );
  }

  public install(): void {
    this.viewportGuard.install();
    this.shortcuts.install();
  }

  public notifyPeelStarted(guardDurationMs = 220): void {
    this.prismPhysics.notifyPeelTransition(guardDurationMs);
    this.overclock.notifyPeelTransition(guardDurationMs);
  }

  public notifyQuestionStarted(
    tierMultiplier = 3.0,
    facetCount = 4,
    initialFacetIndex = 0,
    peelLocked = false,
  ): void {
    this.prismPhysics.setFacetCount(facetCount, initialFacetIndex);
    this.prismPhysics.setPeelLocked(peelLocked);
    this.overclock.armForNewQuestion(tierMultiplier);
  }

  public notifyTimerExpired(): void {
    this.prismPhysics.cancelActivePointer();
    this.overclock.abortOnTimerExpiry();
  }

  public dispose(): void {
    this.shortcuts.dispose();
    this.overclock.dispose();
    this.prismPhysics.dispose();
    this.viewportGuard.dispose();
  }
}
