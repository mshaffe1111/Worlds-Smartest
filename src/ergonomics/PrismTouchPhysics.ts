// ============================================================================
// WORLD'S SMARTEST — Horological Veritas Prism Touch & Spin Physics Engine
// PITCH_BIBLE.md §3.1 ("Spin. Peel. Overclock.") & §5.4 (8ms Escapement Ticks)
// ============================================================================
//
// Precision horological rotational spring-damper & gesture disambiguator for
// the 3D Spotlight Plane:
//  • 1-thumb horizontal swipe -> weighted angular momentum + viscous jewel drag
//  • Subtle sinusoidal magnetic detent wells + crisp spring-damper snap at 90°
//  • 8ms watch-escapement micro-click trigger points across gear teeth & detents
//  • Exact 3-way disambiguation between:
//      1) < 180ms crisp Tap (Sightline Safe Lock or flanking-facet quick spin)
//      2) Horizontal Spin swipe (continuous angular velocity + momentum flick)
//      3) Downward Brass Crown Peel drag (progressive shutter pull + tier snap)
// ============================================================================

export type SpotlightGestureIntent =
  | 'IDLE'
  | 'PENDING'
  | 'SPIN'
  | 'CROWN_PEEL'
  | 'HOLD_CANDIDATE';

export type SpotlightHitZone =
  | 'CROWN'
  | 'CENTER_SIGHTLINE'
  | 'FLANK_LEFT'
  | 'FLANK_RIGHT';

export interface PrismEscapementTickEvent {
  /** Monotonic gear-tooth index crossed during rotation */
  toothIndex: number;
  /** Current active 90° (or 360°/N) facet sector index [0 .. facetCount-1] */
  facetIndex: number;
  /** Continuous unbounded carousel angle in radians */
  angleRad: number;
  /** Instantaneous angular speed in rad/s */
  angularSpeedRadPerSec: number;
  /** Normalized speed [0..1] for audio pitch/gain micro-variation */
  speed01: number;
  /** Recommended hardware pulse duration in milliseconds (8ms per PITCH_BIBLE §3.1) */
  pulseDurationMs: 8;
  /** True when this tick coincides with a major 90° Sightline detent alignment */
  isMajorDetent: boolean;
}

export interface PrismDetentSnapEvent {
  facetIndex: number;
  previousFacetIndex: number;
  angleRad: number;
  impactSpeed01: number;
  changedFacet: boolean;
}

export interface PrismQuickTapEvent {
  clientX: number;
  clientY: number;
  /** Normalized horizontal coordinate across Spotlight element [-1 .. +1] */
  normalizedX: number;
  /** Normalized vertical coordinate across Spotlight element [-1 (bottom) .. +1 (top)] */
  normalizedY: number;
  durationMs: number;
  hitZone: SpotlightHitZone;
  activeFacetIndex: number;
}

export interface PrismCrownPeelProgressEvent {
  /** Normalized pull progress [0..1] toward cracking the next Depth Peel tier */
  progress01: number;
  /** Raw downward pull distance in CSS pixels */
  pullDistancePx: number;
  /** Current velocity in px/s */
  pullVelocityPxPerSec: number;
}

export interface PrismHoldCandidateEvent {
  pointerId: number;
  clientX: number;
  clientY: number;
  activeFacetIndex: number;
  elapsedMs: number;
}

export interface PrismTouchPhysicsCallbacks {
  /** Fires on every continuous physics step while carousel angle or crown pull moves */
  onFrame?: (snapshot: PrismPhysicsSnapshot) => void;
  /** Fires at 8ms-throttled horological escapement tooth crossings during SPIN */
  onEscapementTick?: (event: PrismEscapementTickEvent) => void;
  /** Fires when a facet settles or snaps into the front Volumetric Gold Sightline Beam */
  onDetentSnap?: (event: PrismDetentSnapEvent) => void;
  /** Fires on a crisp < 180ms tap with minimal pointer travel (< 10px) */
  onQuickTap?: (event: PrismQuickTapEvent) => void;
  /** Fires continuously while dragging downward on the Brass Crown / upper Prism */
  onCrownPeelProgress?: (event: PrismCrownPeelProgressEvent) => void;
  /** Fires when downward Brass Crown drag reaches full detent travel and cracks a Peel tier */
  onCrownPeelCommit?: () => void;
  /** Fires when downward Brass Crown drag is released early and springs back shut */
  onCrownPeelCancel?: () => void;
  /** Fires if thumb holds stationary >= 180ms on the center Sightline facet (handoff to Overclock) */
  onHoldCandidate?: (event: PrismHoldCandidateEvent) => void;
}

export interface PrismTouchPhysicsConfig {
  /** Number of evenly spaced facets around 360° (default: 4 -> exact 90° detents) */
  facetCount?: number;
  /** Maximum duration in ms for a touch release to qualify as a crisp Tap (default: 180ms) */
  maxTapDurationMs?: number;
  /** Maximum pointer travel in CSS px for a touch to remain a Tap/Hold candidate (default: 10px) */
  tapSlopPx?: number;
  /** Horizontal threshold in CSS px to lock into horizontal SPIN (default: 9px) */
  spinLockThresholdPx?: number;
  /** Downward travel in CSS px in the upper Crown zone to lock into PEEL (default: 14px) */
  crownZonePeelThresholdPx?: number;
  /** Downward travel in CSS px anywhere on the Spotlight Plane to lock into PEEL (default: 26px) */
  globalPeelThresholdPx?: number;
  /** Full downward pull distance in CSS px required to commit a Brass Crown Peel (default: 54px) */
  crownPeelCommitDistancePx?: number;
  /** Horizontal swipe radians across full viewport width (default: 5.2 rad ≈ 298°) */
  swipeRadiansPerViewportWidth?: number;
  /** Net horizontal swipe distance in CSS px guaranteed to advance ±1 facet (#137 P0: 48px) */
  swipeAdvanceDistancePx?: number;
  /** Horizontal swipe speed in px/ms guaranteed to advance ±1 facet (#137 P0: 0.25 px/ms) */
  swipeAdvanceVelocityPxPerMs?: number;
  /** Minimum angular flick velocity (rad/s) to advance at least 1 full 90° detent (default: 1.6) */
  minFlickAdvanceVelRadPerSec?: number;
  /** Maximum angular velocity clamp (rad/s) to keep MSDF text readable (default: 22.0) */
  maxAngularVelocityRadPerSec?: number;
  /** Viscous jewel-bearing damping during high-speed free inertia (default: 4.4 s⁻¹) */
  freeSpinViscousDrag?: number;
  /** Subtle sinusoidal magnetic detent torque amplitude during glide (default: 9.5 rad/s²) */
  magneticWellStrength?: number;
  /** Speed threshold below which the horological detent spring-damper engages (default: 4.8 rad/s) */
  detentCaptureSpeedRadPerSec?: number;
  /** Detent spring stiffness k (default: 172 s⁻² -> crisp Swiss watch snap) */
  detentSpringStiffness?: number;
  /** Detent spring damping c (default: 24.2 s⁻¹ -> ζ ≈ 0.92, zero mushy bounce) */
  detentSpringDamping?: number;
  /** Escapement sub-teeth per 90° quadrant for subtle watch-escapement ticks (default: 3 -> every 30°) */
  escapementTeethPerDetent?: number;
  /** Minimum interval in ms between escapement tick callbacks (default: 8ms hardware pulse floor) */
  minTickIntervalMs?: number;
  /** Auto-spin flanking facet taps into the front Sightline Beam (default: true) */
  autoSpinOnFlankTap?: boolean;
}

export interface PrismPhysicsSnapshot {
  angleRad: number;
  angleDeg: number;
  angularVelocityRadPerSec: number;
  activeFacetIndex: number;
  targetDetentIndex: number;
  crownPullProgress01: number;
  gestureIntent: SpotlightGestureIntent;
  isSpinning: boolean;
  isDragging: boolean;
}

interface VelocitySample {
  dAngleRad: number;
  dtSec: number;
  timeMs: number;
}

const TWO_PI = Math.PI * 2;
const FIXED_SUBSTEP_SEC = 1 / 240; // 240Hz internal symplectic integration

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function positiveMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export class PrismTouchPhysics {
  public static readonly DEFAULT_DETENT_DEG = 90;
  public static readonly ESCAPEMENT_PULSE_MS = 8 as const;
  public static readonly MAX_TAP_MS = 180;

  private callbacks: PrismTouchPhysicsCallbacks;
  private readonly cfg: Required<PrismTouchPhysicsConfig>;

  private facetCount: number;
  private detentStepRad: number;
  private toothStepRad: number;
  private eliminatedFacets = new Set<number>();
  private peelLocked = false;
  private enabled = true;

  // Continuous rotational state
  // Convention aligned with VeritasPrismRig: facetIndex i sits at targetAngle = -i * detentStepRad
  private angleRad = 0;
  private angularVel = 0;
  private targetDetentSlot = 0; // integer unbounded slot (angle = -slot * detentStepRad)
  private activeFacetIndex = 0;
  private lastToothIndex = 0;
  private lastDetentSlot = 0;
  private lastTickEmitMs = -1000;
  private freeCoasting = false;

  // Crown Peel spring-back state
  private crownPullProgress01 = 0;
  private crownPullVel = 0;

  // Active pointer gesture tracking
  private gestureIntent: SpotlightGestureIntent = 'IDLE';
  private activePointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private startTimeMs = 0;
  private lastMoveTimeMs = 0;
  private totalTravelPx = 0;
  private dragStartDetentSlot = 0;
  private peakHorizontalSpeedPxPerMs = 0;
  private startHitZone: SpotlightHitZone = 'CENTER_SIGHTLINE';
  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  private holdFiredForPointer = false;
  private velocityRing: VelocitySample[] = [];

  // Optional DOM attachment & self-managed RAF loop
  private attachedElement: HTMLElement | null = null;
  private rafId = 0;
  private lastRafMs = 0;
  private peelGuardUntilMs = 0;

  private readonly onPointerDownBound = (ev: PointerEvent) => this.handlePointerDown(ev);
  private readonly onPointerMoveBound = (ev: PointerEvent) => this.handlePointerMove(ev);
  private readonly onPointerUpBound = (ev: PointerEvent) => this.handlePointerUp(ev);
  private readonly onPointerCancelBound = (ev: PointerEvent) => this.handlePointerCancel(ev);
  private readonly onWindowBlurBound = () => this.cancelActivePointer();
  private readonly onVisibilityChangeBound = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      this.cancelActivePointer();
    }
  };

  constructor(
    callbacks: PrismTouchPhysicsCallbacks = {},
    config: PrismTouchPhysicsConfig = {},
  ) {
    this.callbacks = callbacks;
    this.cfg = {
      facetCount: config.facetCount ?? 4,
      maxTapDurationMs: config.maxTapDurationMs ?? PrismTouchPhysics.MAX_TAP_MS,
      tapSlopPx: config.tapSlopPx ?? 10,
      spinLockThresholdPx: config.spinLockThresholdPx ?? 9,
      crownZonePeelThresholdPx: config.crownZonePeelThresholdPx ?? 14,
      globalPeelThresholdPx: config.globalPeelThresholdPx ?? 26,
      crownPeelCommitDistancePx: config.crownPeelCommitDistancePx ?? 54,
      swipeRadiansPerViewportWidth: config.swipeRadiansPerViewportWidth ?? 5.2,
      swipeAdvanceDistancePx: config.swipeAdvanceDistancePx ?? 48,
      swipeAdvanceVelocityPxPerMs: config.swipeAdvanceVelocityPxPerMs ?? 0.25,
      minFlickAdvanceVelRadPerSec: config.minFlickAdvanceVelRadPerSec ?? 1.6,
      maxAngularVelocityRadPerSec: config.maxAngularVelocityRadPerSec ?? 22.0,
      freeSpinViscousDrag: config.freeSpinViscousDrag ?? 4.4,
      magneticWellStrength: config.magneticWellStrength ?? 9.5,
      detentCaptureSpeedRadPerSec: config.detentCaptureSpeedRadPerSec ?? 4.8,
      detentSpringStiffness: config.detentSpringStiffness ?? 172,
      detentSpringDamping: config.detentSpringDamping ?? 24.2,
      escapementTeethPerDetent: config.escapementTeethPerDetent ?? 3,
      minTickIntervalMs: config.minTickIntervalMs ?? PrismTouchPhysics.ESCAPEMENT_PULSE_MS,
      autoSpinOnFlankTap: config.autoSpinOnFlankTap ?? true,
    };

    this.facetCount = Math.max(2, Math.round(this.cfg.facetCount));
    this.detentStepRad = TWO_PI / this.facetCount; // Exact 90° (π/2) when facetCount === 4
    this.toothStepRad = this.detentStepRad / Math.max(1, this.cfg.escapementTeethPerDetent);
  }

  public setCallbacks(callbacks: PrismTouchPhysicsCallbacks): void {
    this.callbacks = callbacks;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = Boolean(enabled);
    if (!this.enabled) {
      this.cancelActivePointer();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setPeelLocked(locked: boolean): void {
    this.peelLocked = Boolean(locked);
  }

  public isPeelLocked(): boolean {
    return this.peelLocked;
  }

  /**
   * Guards center-Sightline quick-taps during an active Peel shutter/shatter animation
   * so rapid double-taps mid-Peel cannot accidentally Safe-Lock a shifting facet.
   */
  public notifyPeelTransition(guardDurationMs = 220): void {
    this.peelGuardUntilMs = Math.max(this.peelGuardUntilMs, nowMs() + Math.max(0, guardDurationMs));
  }

  public setFacetCount(count: number, initialFacetIndex = 0): void {
    this.facetCount = Math.max(2, Math.round(count));
    this.detentStepRad = TWO_PI / this.facetCount;
    this.toothStepRad = this.detentStepRad / Math.max(1, this.cfg.escapementTeethPerDetent);
    this.eliminatedFacets.clear();
    this.snapImmediatelyToFacet(initialFacetIndex);
  }

  public setEliminatedFacets(indices: Iterable<number>): void {
    this.eliminatedFacets = new Set(indices);
    if (this.eliminatedFacets.has(this.activeFacetIndex)) {
      const nextValid = this.findNearestValidSlot(this.targetDetentSlot, 1);
      this.targetDetentSlot = nextValid;
      this.activeFacetIndex = this.slotToFacetIndex(nextValid);
    }
  }

  /**
   * Attaches non-passive pointer listeners to a Spotlight Plane overlay or WebGL `<canvas>`
   * and starts the 60/120Hz internal physics loop.
   */
  public attachToElement(element: HTMLElement, autoStartRaf = true): () => void {
    this.detachFromElement();
    this.attachedElement = element;
    element.style.touchAction = 'none';
    element.addEventListener('pointerdown', this.onPointerDownBound);
    element.addEventListener('pointermove', this.onPointerMoveBound);
    element.addEventListener('pointerup', this.onPointerUpBound);
    element.addEventListener('pointercancel', this.onPointerCancelBound);
    if (typeof window !== 'undefined') {
      window.addEventListener('blur', this.onWindowBlurBound);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChangeBound);
    }

    if (autoStartRaf) {
      this.startRafLoop();
    }

    return () => this.detachFromElement();
  }

  public detachFromElement(): void {
    this.stopRafLoop();
    this.cancelActivePointer();
    if (typeof window !== 'undefined') {
      window.removeEventListener('blur', this.onWindowBlurBound);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChangeBound);
    }
    if (this.attachedElement) {
      this.attachedElement.removeEventListener('pointerdown', this.onPointerDownBound);
      this.attachedElement.removeEventListener('pointermove', this.onPointerMoveBound);
      this.attachedElement.removeEventListener('pointerup', this.onPointerUpBound);
      this.attachedElement.removeEventListener('pointercancel', this.onPointerCancelBound);
      this.attachedElement = null;
    }
  }

  public startRafLoop(): void {
    if (this.rafId !== 0 || typeof requestAnimationFrame !== 'function') return;
    this.lastRafMs = nowMs();
    const tick = () => {
      const t = nowMs();
      const dtSec = clamp((t - this.lastRafMs) / 1000, 0.001, 0.05);
      this.lastRafMs = t;
      this.step(dtSec);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public stopRafLoop(): void {
    if (this.rafId !== 0 && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  // ==========================================================================
  // PROGRAMMATIC HOROLOGICAL SPIN API (Syncs Keyboard / HUD Pills / 3D Rig)
  // ==========================================================================

  public snapImmediatelyToFacet(facetIndex: number): void {
    const cleanIdx = positiveMod(Math.round(facetIndex), this.facetCount);
    this.targetDetentSlot = cleanIdx;
    this.lastDetentSlot = cleanIdx;
    this.activeFacetIndex = cleanIdx;
    this.angleRad = -cleanIdx * this.detentStepRad;
    this.angularVel = 0;
    this.freeCoasting = false;
    this.lastToothIndex = Math.round(this.angleRad / this.toothStepRad);
    this.crownPullProgress01 = 0;
    this.crownPullVel = 0;
  }

  /**
   * Rotates along the shortest angular arc to `facetIndex` using the horological spring-damper.
   */
  public spinToFacet(facetIndex: number, emitSnapCallback = true): number {
    const desiredIdx = positiveMod(Math.round(facetIndex), this.facetCount);
    const currentContinuousSlot = -this.angleRad / this.detentStepRad;
    const baseSlot = Math.round(currentContinuousSlot);
    const currentIdxAtBase = positiveMod(baseSlot, this.facetCount);

    let deltaSlots = desiredIdx - currentIdxAtBase;
    const half = this.facetCount / 2;
    if (deltaSlots > half) deltaSlots -= this.facetCount;
    if (deltaSlots < -half) deltaSlots += this.facetCount;

    const prevFacet = this.activeFacetIndex;
    this.targetDetentSlot = baseSlot + deltaSlots;
    this.activeFacetIndex = desiredIdx;
    this.freeCoasting = false;

    // Impart a crisp initial angular kick toward the target detent
    const targetAngle = -this.targetDetentSlot * this.detentStepRad;
    const angleErr = targetAngle - this.angleRad;
    this.angularVel = clamp(angleErr * 4.2, -12, 12);

    if (emitSnapCallback) {
      this.callbacks.onDetentSnap?.({
        facetIndex: desiredIdx,
        previousFacetIndex: prevFacet,
        angleRad: targetAngle,
        impactSpeed01: clamp(Math.abs(deltaSlots) * 0.45, 0.25, 1),
        changedFacet: desiredIdx !== prevFacet,
      });
    }
    return desiredIdx;
  }

  /**
   * Steps ±1 facet (automatically skipping shattered Tier-3 facets if any exist).
   */
  public stepFacet(delta: -1 | 1, emitSnapCallback = true): number {
    const nextSlot = this.findNearestValidSlot(this.targetDetentSlot + delta, delta);
    const prevFacet = this.activeFacetIndex;
    this.targetDetentSlot = nextSlot;
    this.activeFacetIndex = this.slotToFacetIndex(nextSlot);
    this.freeCoasting = false;

    const targetAngle = -this.targetDetentSlot * this.detentStepRad;
    const angleErr = targetAngle - this.angleRad;
    this.angularVel = clamp(angleErr * 4.4, -12, 12);

    if (emitSnapCallback) {
      this.callbacks.onDetentSnap?.({
        facetIndex: this.activeFacetIndex,
        previousFacetIndex: prevFacet,
        angleRad: targetAngle,
        impactSpeed01: 0.48,
        changedFacet: this.activeFacetIndex !== prevFacet,
      });
    }
    return this.activeFacetIndex;
  }

  public applyImpulse(angularImpulseRadPerSec: number): void {
    this.angularVel = clamp(
      this.angularVel + angularImpulseRadPerSec,
      -this.cfg.maxAngularVelocityRadPerSec,
      this.cfg.maxAngularVelocityRadPerSec,
    );
    this.engageReleaseTrajectory(this.angularVel);
  }

  public getSnapshot(): PrismPhysicsSnapshot {
    const moving =
      Math.abs(this.angularVel) > 0.015 ||
      Math.abs(-this.targetDetentSlot * this.detentStepRad - this.angleRad) > 0.002;
    return {
      angleRad: this.angleRad,
      angleDeg: (this.angleRad * 180) / Math.PI,
      angularVelocityRadPerSec: this.angularVel,
      activeFacetIndex: this.activeFacetIndex,
      targetDetentIndex: this.slotToFacetIndex(this.targetDetentSlot),
      crownPullProgress01: this.crownPullProgress01,
      gestureIntent: this.gestureIntent,
      isSpinning: moving || this.gestureIntent === 'SPIN',
      isDragging: this.activePointerId !== null,
    };
  }

  // ==========================================================================
  // 3-WAY GESTURE DISAMBIGUATION (TAP <180ms vs HORIZONTAL SPIN vs CROWN PEEL)
  // ==========================================================================

  public handlePointerDown(
    ev: Pick<PointerEvent, 'pointerId' | 'clientX' | 'clientY' | 'button' | 'pointerType'>,
    explicitHitZone?: SpotlightHitZone,
    viewportBounds?: { left: number; top: number; width: number; height: number },
  ): void {
    if (!this.enabled || this.activePointerId !== null) return;
    if (ev.pointerType === 'mouse' && typeof ev.button === 'number' && ev.button !== 0) {
      return;
    }

    if (this.attachedElement && 'setPointerCapture' in this.attachedElement) {
      try {
        this.attachedElement.setPointerCapture(ev.pointerId);
      } catch {
        // Synthetic events in unit/headless tests may not have active pointerId
      }
    }

    const bounds = viewportBounds ?? this.measureBounds();
    const hitZone = explicitHitZone ?? this.classifyHitZone(ev.clientX, ev.clientY, bounds);

    this.activePointerId = ev.pointerId;
    this.startX = ev.clientX;
    this.startY = ev.clientY;
    this.lastX = ev.clientX;
    this.lastY = ev.clientY;
    this.startTimeMs = nowMs();
    this.lastMoveTimeMs = this.startTimeMs;
    this.totalTravelPx = 0;
    this.dragStartDetentSlot = Math.round(-this.angleRad / this.detentStepRad);
    this.peakHorizontalSpeedPxPerMs = 0;
    this.startHitZone = hitZone;
    this.gestureIntent = 'PENDING';
    this.holdFiredForPointer = false;
    this.velocityRing = [];

    // Catching a spinning Prism with the thumb gently damps momentum like touching a watch bezel
    if (Math.abs(this.angularVel) > 0.5) {
      this.angularVel *= 0.25;
    }

    this.clearHoldTimer();
    if (hitZone === 'CENTER_SIGHTLINE') {
      this.holdTimer = setTimeout(() => {
        if (
          this.activePointerId === ev.pointerId &&
          this.gestureIntent === 'PENDING' &&
          this.totalTravelPx < this.cfg.tapSlopPx
        ) {
          this.gestureIntent = 'HOLD_CANDIDATE';
          this.holdFiredForPointer = true;
          this.callbacks.onHoldCandidate?.({
            pointerId: ev.pointerId,
            clientX: this.lastX,
            clientY: this.lastY,
            activeFacetIndex: this.activeFacetIndex,
            elapsedMs: nowMs() - this.startTimeMs,
          });
        }
      }, this.cfg.maxTapDurationMs);
    }
  }

  public handlePointerMove(
    ev: Pick<PointerEvent, 'pointerId' | 'clientX' | 'clientY'>,
    viewportWidthOverride?: number,
  ): void {
    if (!this.enabled || this.activePointerId !== ev.pointerId) return;

    const t = nowMs();
    const dtSec = clamp((t - this.lastMoveTimeMs) / 1000, 0.002, 0.08);
    const stepDx = ev.clientX - this.lastX;
    const stepDy = ev.clientY - this.lastY;
    const netDx = ev.clientX - this.startX;
    const netDy = ev.clientY - this.startY;

    this.lastX = ev.clientX;
    this.lastY = ev.clientY;
    this.lastMoveTimeMs = t;
    this.totalTravelPx += Math.hypot(stepDx, stepDy);

    const bounds = this.measureBounds();
    const viewW = Math.max(280, viewportWidthOverride ?? bounds.width);

    // 1. Disambiguate PENDING / HOLD_CANDIDATE into SPIN vs CROWN_PEEL
    if (this.gestureIntent === 'PENDING' || this.gestureIntent === 'HOLD_CANDIDATE') {
      const absDx = Math.abs(netDx);
      const absDy = Math.abs(netDy);
      const peelThreshold =
        this.startHitZone === 'CROWN'
          ? this.cfg.crownZonePeelThresholdPx
          : this.cfg.globalPeelThresholdPx;

      if (absDx >= this.cfg.spinLockThresholdPx && absDx >= absDy * 1.1) {
        this.clearHoldTimer();
        this.gestureIntent = 'SPIN';
      } else if (
        !this.peelLocked &&
        netDy >= peelThreshold &&
        netDy > absDx * 1.2 &&
        this.gestureIntent === 'PENDING'
      ) {
        this.clearHoldTimer();
        this.gestureIntent = 'CROWN_PEEL';
      }
    }

    // 2. Execute active physical gesture
    if (this.gestureIntent === 'SPIN') {
      const stepSpeedPxPerMs = Math.abs(stepDx) / Math.max(1, dtSec * 1000);
      if (stepSpeedPxPerMs > this.peakHorizontalSpeedPxPerMs) {
        this.peakHorizontalSpeedPxPerMs = stepSpeedPxPerMs;
      }
      const dAngleRad = (stepDx / viewW) * this.cfg.swipeRadiansPerViewportWidth;
      this.angleRad += dAngleRad;

      this.velocityRing.push({ dAngleRad, dtSec, timeMs: t });
      while (this.velocityRing.length > 5 || t - this.velocityRing[0].timeMs > 95) {
        if (this.velocityRing.length <= 1) break;
        this.velocityRing.shift();
      }

      const estVel = this.computeWeightedDragVelocity();
      this.angularVel = clamp(
        estVel,
        -this.cfg.maxAngularVelocityRadPerSec,
        this.cfg.maxAngularVelocityRadPerSec,
      );

      this.checkEscapementAndDetentCrossings(t);
      this.callbacks.onFrame?.(this.getSnapshot());
    } else if (this.gestureIntent === 'CROWN_PEEL') {
      const pullPx = Math.max(0, netDy);
      const progress01 = clamp(pullPx / this.cfg.crownPeelCommitDistancePx, 0, 1);
      this.crownPullProgress01 = progress01;
      this.crownPullVel = stepDy / dtSec;

      this.callbacks.onCrownPeelProgress?.({
        progress01,
        pullDistancePx: pullPx,
        pullVelocityPxPerSec: this.crownPullVel,
      });
      this.callbacks.onFrame?.(this.getSnapshot());

      if (progress01 >= 1.0) {
        // Detent cracked! Commit Peel immediately under the thumb for crisp tactile payoff
        this.crownPullProgress01 = 0;
        this.crownPullVel = 0;
        this.gestureIntent = 'IDLE';
        this.releasePointerCaptureSafe(ev.pointerId);
        this.activePointerId = null;
        this.notifyPeelTransition(220);
        this.callbacks.onCrownPeelCommit?.();
      }
    }
  }

  public handlePointerUp(
    ev: Pick<PointerEvent, 'pointerId' | 'clientX' | 'clientY'>,
  ): void {
    if (this.activePointerId !== ev.pointerId) return;
    this.clearHoldTimer();
    this.releasePointerCaptureSafe(ev.pointerId);

    const t = nowMs();
    const durationMs = t - this.startTimeMs;
    const intentAtRelease = this.gestureIntent;

    this.activePointerId = null;
    this.gestureIntent = 'IDLE';

    if (intentAtRelease === 'SPIN') {
      const netDx = ev.clientX - this.startX;
      const absDx = Math.abs(netDx);
      const overallVelPxPerMs = absDx / Math.max(12, durationMs);
      const maxSpeedPxPerMs =
        this.velocityRing.length >= 2
          ? Math.max(overallVelPxPerMs, this.peakHorizontalSpeedPxPerMs)
          : overallVelPxPerMs;

      const idleBeforeLiftMs = t - this.lastMoveTimeMs;
      const rawVel =
        this.velocityRing.length >= 2
          ? this.computeWeightedDragVelocity()
          : ((netDx / Math.max(280, this.measureBounds().width)) *
              this.cfg.swipeRadiansPerViewportWidth) /
            Math.max(0.12, durationMs / 1000);
      const releaseVel = idleBeforeLiftMs > 65 ? rawVel * 0.2 : rawVel;

      const isWideMultiFrameWhip = this.velocityRing.length >= 3 && absDx >= 260;

      if (isWideMultiFrameWhip) {
        this.angularVel = clamp(
          releaseVel,
          -this.cfg.maxAngularVelocityRadPerSec,
          this.cfg.maxAngularVelocityRadPerSec,
        );
        this.engageReleaseTrajectory(this.angularVel);
      } else {
        // Precision 1-thumb Watch-Bezel Step: swipes < 260px advance ±1 facet cleanly!
        this.freeCoasting = false;
        this.angularVel = clamp(releaseVel, -8.5, 8.5);
        this.recomputeProjectedDetentSlot(this.angularVel);

        // #137 P0 Guarantee: Any horizontal drag >= 48px (e.g. (525,490)->(340,490)) OR
        // velocity > 0.25 px/ms MUST advance ±1 facet instead of snapping back!
        const advanceDir: -1 | 1 = netDx < 0 ? 1 : -1;
        if (
          absDx >= this.cfg.swipeAdvanceDistancePx ||
          (maxSpeedPxPerMs > this.cfg.swipeAdvanceVelocityPxPerMs && absDx >= 16)
        ) {
          const minTarget = this.dragStartDetentSlot + advanceDir;
          const maxTarget = this.dragStartDetentSlot + advanceDir; // exact 1-detent watch step
          const clampedSlot =
            advanceDir > 0
              ? clamp(this.targetDetentSlot, minTarget, maxTarget)
              : clamp(this.targetDetentSlot, maxTarget, minTarget);
          this.targetDetentSlot = this.findNearestValidSlot(clampedSlot, advanceDir);
        }
      }
      return;
    }

    if (intentAtRelease === 'CROWN_PEEL') {
      // Released before cracking the 54px Crown detent -> spring back shut
      this.callbacks.onCrownPeelCancel?.();
      return;
    }

    // Crisp Tap check: strictly < 180ms (configurable) and travel < tapSlopPx!
    if (
      !this.holdFiredForPointer &&
      durationMs < this.cfg.maxTapDurationMs &&
      this.totalTravelPx < this.cfg.tapSlopPx
    ) {
      if (this.startHitZone === 'CENTER_SIGHTLINE' && t < this.peelGuardUntilMs) {
        this.recomputeProjectedDetentSlot(0);
        return;
      }
      const bounds = this.measureBounds();
      const nx = clamp(((ev.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1, -1, 1);
      const ny = clamp(
        -(((ev.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1),
        -1,
        1,
      );

      if (this.cfg.autoSpinOnFlankTap && this.startHitZone === 'FLANK_LEFT') {
        this.stepFacet(-1, true);
      } else if (this.cfg.autoSpinOnFlankTap && this.startHitZone === 'FLANK_RIGHT') {
        this.stepFacet(1, true);
      }

      this.callbacks.onQuickTap?.({
        clientX: ev.clientX,
        clientY: ev.clientY,
        normalizedX: nx,
        normalizedY: ny,
        durationMs,
        hitZone: this.startHitZone,
        activeFacetIndex: this.activeFacetIndex,
      });
    } else {
      // Settle cleanly onto nearest valid detent if nudged slightly without full spin
      this.recomputeProjectedDetentSlot(0);
    }
  }

  public handlePointerCancel(ev: Pick<PointerEvent, 'pointerId'>): void {
    if (this.activePointerId !== ev.pointerId) return;
    this.cancelActivePointer();
  }

  public cancelActivePointer(): void {
    this.clearHoldTimer();
    if (this.activePointerId !== null) {
      this.releasePointerCaptureSafe(this.activePointerId);
    }
    const wasPeeling = this.gestureIntent === 'CROWN_PEEL';
    this.activePointerId = null;
    this.gestureIntent = 'IDLE';
    this.velocityRing = [];
    this.recomputeProjectedDetentSlot(0);
    if (wasPeeling) {
      this.callbacks.onCrownPeelCancel?.();
    }
  }

  // ==========================================================================
  // 240Hz SUB-STEPPED HOROLOGICAL SPRING-DAMPER & MAGNETIC DETENT INTEGRATOR
  // ==========================================================================

  public step(dtSec: number): PrismPhysicsSnapshot {
    const clampedDt = clamp(dtSec, 0, 0.1);
    if (clampedDt <= 0) {
      return this.getSnapshot();
    }

    const tNow = nowMs();
    let hadMotion = false;

    // 1. Crown spring-back when not actively pulling
    if (this.gestureIntent !== 'CROWN_PEEL' && this.crownPullProgress01 > 0.0005) {
      const springForce = -220 * this.crownPullProgress01 - 26 * this.crownPullVel;
      this.crownPullVel += springForce * clampedDt;
      this.crownPullProgress01 = Math.max(0, this.crownPullProgress01 + this.crownPullVel * clampedDt);
      if (this.crownPullProgress01 < 0.002 && Math.abs(this.crownPullVel) < 0.02) {
        this.crownPullProgress01 = 0;
        this.crownPullVel = 0;
      }
      this.callbacks.onCrownPeelProgress?.({
        progress01: this.crownPullProgress01,
        pullDistancePx: this.crownPullProgress01 * this.cfg.crownPeelCommitDistancePx,
        pullVelocityPxPerSec: 0,
      });
      hadMotion = true;
    }

    // 2. Rotational dynamics when thumb is NOT directly dragging SPIN
    if (this.gestureIntent !== 'SPIN') {
      const targetAngle = -this.targetDetentSlot * this.detentStepRad;
      const initialErr = targetAngle - this.angleRad;

      if (Math.abs(initialErr) > 1e-4 || Math.abs(this.angularVel) > 1e-3) {
        hadMotion = true;
        let remaining = clampedDt;

        while (remaining > 1e-6) {
          const h = Math.min(remaining, FIXED_SUBSTEP_SEC);
          remaining -= h;

          if (this.freeCoasting) {
            // High-velocity free-spin regime: viscous bearing drag + subtle sinusoidal 90° magnetic wells
            const viscousAccel = -this.cfg.freeSpinViscousDrag * this.angularVel;
            const magneticTorque =
              -this.cfg.magneticWellStrength * Math.sin(this.facetCount * this.angleRad);
            this.angularVel += (viscousAccel + magneticTorque) * h;
            this.angleRad += this.angularVel * h;

            if (Math.abs(this.angularVel) <= this.cfg.detentCaptureSpeedRadPerSec) {
              // Hand off smoothly into horological spring-damper capture on nearest valid 90° detent!
              this.freeCoasting = false;
              const preferDir: -1 | 1 = this.angularVel <= 0 ? 1 : -1;
              const nearest = Math.round(-this.angleRad / this.detentStepRad);
              this.targetDetentSlot = this.findNearestValidSlot(nearest, preferDir);
            }
          } else {
            // Precision horological spring-damper snap onto exact 90° Sightline detent
            const snapTarget = -this.targetDetentSlot * this.detentStepRad;
            const disp = this.angleRad - snapTarget;
            const accel =
              -this.cfg.detentSpringStiffness * disp -
              this.cfg.detentSpringDamping * this.angularVel;
            this.angularVel += accel * h;
            this.angleRad += this.angularVel * h;
          }
        }

        // Clean magnetic lock settle check
        const finalTarget = -this.targetDetentSlot * this.detentStepRad;
        if (
          Math.abs(finalTarget - this.angleRad) < 0.0008 &&
          Math.abs(this.angularVel) < 0.012
        ) {
          this.angleRad = finalTarget;
          this.angularVel = 0;
        }

        this.checkEscapementAndDetentCrossings(tNow);
      }
    }

    const snap = this.getSnapshot();
    if (hadMotion) {
      this.callbacks.onFrame?.(snap);
    }
    return snap;
  }

  public dispose(): void {
    this.detachFromElement();
  }

  // ==========================================================================
  // INTERNAL HELPERS
  // ==========================================================================

  private computeWeightedDragVelocity(): number {
    if (this.velocityRing.length === 0) return 0;
    let weightedAngleSum = 0;
    let weightedTimeSum = 0;
    const len = this.velocityRing.length;

    for (let i = 0; i < len; i++) {
      // Newer samples carry higher weight (1, 2, 3, 4, 5)
      const w = i + 1;
      weightedAngleSum += this.velocityRing[i].dAngleRad * w;
      weightedTimeSum += this.velocityRing[i].dtSec * w;
    }

    if (weightedTimeSum <= 1e-5) return 0;
    return weightedAngleSum / weightedTimeSum;
  }

  private engageReleaseTrajectory(velRadPerSec: number): void {
    if (Math.abs(velRadPerSec) > this.cfg.detentCaptureSpeedRadPerSec) {
      this.freeCoasting = true;
      this.recomputeProjectedDetentSlot(velRadPerSec);
    } else {
      this.freeCoasting = false;
      this.recomputeProjectedDetentSlot(velRadPerSec);
    }
  }

  private recomputeProjectedDetentSlot(velRadPerSec: number): void {
    const currentContinuousSlot = -this.angleRad / this.detentStepRad;
    let candidateSlot: number;

    if (Math.abs(velRadPerSec) >= this.cfg.minFlickAdvanceVelRadPerSec) {
      // Project natural coasting distance over viscous jewel bearing
      const projectedAngle = this.angleRad + velRadPerSec / (this.cfg.freeSpinViscousDrag * 1.35);
      candidateSlot = Math.round(-projectedAngle / this.detentStepRad);

      // Guarantee a decisive thumb flick advances at least 1 facet in flick direction
      const nearestCurrent = Math.round(currentContinuousSlot);
      if (candidateSlot === nearestCurrent) {
        candidateSlot = nearestCurrent + (velRadPerSec > 0 ? -1 : 1);
      }
    } else {
      candidateSlot = Math.round(currentContinuousSlot);
    }

    const preferDir: -1 | 1 = velRadPerSec <= 0 ? 1 : -1;
    this.targetDetentSlot = this.findNearestValidSlot(candidateSlot, preferDir);
  }

  private checkEscapementAndDetentCrossings(timeMs: number): void {
    const currentTooth = Math.round(this.angleRad / this.toothStepRad);
    const currentNearestSlot = Math.round(-this.angleRad / this.detentStepRad);
    const currentFacet = this.slotToFacetIndex(currentNearestSlot);

    // 1. 8ms watch-escapement micro-click ticks
    if (currentTooth !== this.lastToothIndex) {
      this.lastToothIndex = currentTooth;
      if (timeMs - this.lastTickEmitMs >= this.cfg.minTickIntervalMs) {
        this.lastTickEmitMs = timeMs;
        const speedAbs = Math.abs(this.angularVel);
        const speed01 = clamp(speedAbs / 14.0, 0.08, 1.0);
        const isMajor =
          Math.abs(currentTooth % Math.max(1, this.cfg.escapementTeethPerDetent)) === 0;

        this.callbacks.onEscapementTick?.({
          toothIndex: currentTooth,
          facetIndex: currentFacet,
          angleRad: this.angleRad,
          angularSpeedRadPerSec: speedAbs,
          speed01,
          pulseDurationMs: PrismTouchPhysics.ESCAPEMENT_PULSE_MS,
          isMajorDetent: isMajor,
        });
      }
    }

    // 2. Major 90° Sightline Detent sector crossing
    if (currentNearestSlot !== this.lastDetentSlot) {
      const prevFacet = this.activeFacetIndex;
      this.lastDetentSlot = currentNearestSlot;
      if (!this.eliminatedFacets.has(currentFacet)) {
        this.activeFacetIndex = currentFacet;
        const speed01 = clamp(Math.abs(this.angularVel) / 12.0, 0.15, 1.0);
        this.callbacks.onDetentSnap?.({
          facetIndex: currentFacet,
          previousFacetIndex: prevFacet,
          angleRad: this.angleRad,
          impactSpeed01: speed01,
          changedFacet: currentFacet !== prevFacet,
        });
      }
    }
  }

  private slotToFacetIndex(slot: number): number {
    return positiveMod(slot, this.facetCount);
  }

  private findNearestValidSlot(startSlot: number, preferredDir: -1 | 1): number {
    if (this.eliminatedFacets.size === 0 || this.eliminatedFacets.size >= this.facetCount) {
      return startSlot;
    }
    if (!this.eliminatedFacets.has(this.slotToFacetIndex(startSlot))) {
      return startSlot;
    }
    for (let offset = 1; offset < this.facetCount; offset++) {
      const forward = startSlot + offset * preferredDir;
      if (!this.eliminatedFacets.has(this.slotToFacetIndex(forward))) {
        return forward;
      }
      const backward = startSlot - offset * preferredDir;
      if (!this.eliminatedFacets.has(this.slotToFacetIndex(backward))) {
        return backward;
      }
    }
    return startSlot;
  }

  private classifyHitZone(
    clientX: number,
    clientY: number,
    bounds: { left: number; top: number; width: number; height: number },
  ): SpotlightHitZone {
    const relX = (clientX - bounds.left) / Math.max(1, bounds.width);
    const relY = (clientY - bounds.top) / Math.max(1, bounds.height);

    // Upper 26% of the Spotlight Plane corresponds to the Brass Crown Ring
    if (relY <= 0.26 && relX >= 0.28 && relX <= 0.72) {
      return 'CROWN';
    }
    if (relX < 0.31) {
      return 'FLANK_LEFT';
    }
    if (relX > 0.69) {
      return 'FLANK_RIGHT';
    }
    return 'CENTER_SIGHTLINE';
  }

  private measureBounds(): { left: number; top: number; width: number; height: number } {
    if (this.attachedElement) {
      const r = this.attachedElement.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        return { left: r.left, top: r.top, width: r.width, height: r.height };
      }
    }
    const vw = typeof window !== 'undefined' ? window.innerWidth || 1280 : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight || 720 : 720;
    return { left: 0, top: 0, width: vw, height: vh };
  }

  private clearHoldTimer(): void {
    if (this.holdTimer !== null) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
  }

  private releasePointerCaptureSafe(pointerId: number): void {
    if (this.attachedElement && 'releasePointerCapture' in this.attachedElement) {
      try {
        this.attachedElement.releasePointerCapture(pointerId);
      } catch {
        // Ignore if not captured
      }
    }
  }
}
