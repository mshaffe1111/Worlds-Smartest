// ============================================================================
// WORLD'S SMARTEST v6.0 — Spring-Damped 3D Camera Director
// Buttery critically-damped dolly transitions across all 8 `CameraStageZoneV6`
// zones, responsive portrait/landscape framing, pointer parallax, impact
// recoil shakes, and 2-stage physical Trapdoor Clockwork Pit Plunge!
// ============================================================================

import * as THREE from 'three';
import type { CameraMotionModeV6, CameraStageZoneV6 } from '../contracts_v6';
import { SpringDamper1D, SpringDamper3D } from './HorologyCADKit';

export interface CameraZonePoseV6 {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  /** Pullback multiplier applied smoothly as viewport aspect narrows into mobile portrait (< 0.85). */
  portraitPullback: number;
  /** Extra vertical look-at shift on narrow portrait screens to clear top HUD / bottom thumb dock. */
  portraitLookYOffset: number;
  /** Subtle organic studio-crane drift amplitude in `CINEMATIC` mode. */
  driftAmp: [number, number, number];
  stiffness: number;
  dampingRatio: number;
}

const CAMERA_ZONE_POSES: Readonly<Record<CameraStageZoneV6, CameraZonePoseV6>> = {
  LOBBY_PROSCENIUM: {
    position: [0.0, 2.45, 6.85],
    lookAt: [0.0, 2.05, -1.6],
    fov: 45,
    portraitPullback: 1.24,
    portraitLookYOffset: 0.32,
    driftAmp: [0.28, 0.1, 0.16],
    stiffness: 42,
    dampingRatio: 0.94,
  },
  TROPHY_MEDAL_VAULT: {
    position: [0.0, 1.55, 2.75],
    lookAt: [0.0, 0.95, 0.0],
    fov: 38,
    portraitPullback: 1.28,
    portraitLookYOffset: -0.05,
    driftAmp: [0.08, 0.04, 0.04],
    stiffness: 68,
    dampingRatio: 0.96,
  },
  OPTIONS_MIXING_BOOTH: {
    position: [-3.9, 4.15, 5.8],
    lookAt: [0.6, 1.85, -2.4],
    fov: 46,
    portraitPullback: 1.18,
    portraitLookYOffset: 0.15,
    driftAmp: [0.14, 0.06, 0.08],
    stiffness: 52,
    dampingRatio: 0.95,
  },
  BACKSTAGE_PROP_TRUNK: {
    position: [2.25, 2.35, 4.15],
    lookAt: [0.0, 0.88, -0.25],
    fov: 42,
    portraitPullback: 1.26,
    portraitLookYOffset: -0.06,
    driftAmp: [0.12, 0.05, 0.06],
    stiffness: 64,
    dampingRatio: 0.95,
  },
  BOARD_OVERHEAD_ANGLED: {
    position: [0.0, 5.85, 5.45],
    lookAt: [0.0, 0.35, 0.15],
    fov: 43,
    portraitPullback: 1.38,
    portraitLookYOffset: -0.25,
    driftAmp: [0.09, 0.04, 0.05],
    stiffness: 74,
    dampingRatio: 0.96,
  },
  TOY_CLOSEUP_STAGE: {
    position: [0.0, 2.05, 3.35],
    lookAt: [0.0, 0.92, 0.0],
    fov: 40,
    portraitPullback: 1.34,
    portraitLookYOffset: 0.08,
    driftAmp: [0.05, 0.03, 0.03],
    stiffness: 88,
    dampingRatio: 0.97,
  },
  TRAPDOOR_PIT_PLUNGE: {
    position: [0.0, -4.15, 2.85],
    lookAt: [0.0, -6.68, -0.1],
    fov: 46,
    portraitPullback: 1.22,
    portraitLookYOffset: 0.06,
    driftAmp: [0.09, 0.05, 0.05],
    stiffness: 62,
    dampingRatio: 0.88,
  },
  VICTORY_PODIUM_CEREMONY: {
    position: [-1.45, 2.45, 6.2],
    lookAt: [0.0, 1.95, -0.8],
    fov: 44,
    portraitPullback: 1.24,
    portraitLookYOffset: 0.18,
    driftAmp: [0.42, 0.14, 0.22],
    stiffness: 48,
    dampingRatio: 0.92,
  },
};

export interface CameraDirectorHooksV6 {
  onTrapdoorOpenRequested?: (open: boolean) => void;
}

export class CameraDirectorV6 {
  public readonly camera: THREE.PerspectiveCamera;
  private activeZone: CameraStageZoneV6 = 'LOBBY_PROSCENIUM';
  private motionMode: CameraMotionModeV6 = 'CINEMATIC';
  private aspect = 16 / 9;

  private readonly posSpring: SpringDamper3D;
  private readonly lookSpring: SpringDamper3D;
  private readonly fovSpring: SpringDamper1D;
  private readonly rollSpring: SpringDamper1D;

  private readonly pointerNdc = new THREE.Vector2(0, 0);
  private readonly customLookOffset = new THREE.Vector3(0, 0, 0);
  private readonly workPos = new THREE.Vector3();
  private readonly workLook = new THREE.Vector3();

  // Two-phase physical trapdoor plunge choreography state
  private plungeStage: 'IDLE' | 'HOVER_OVER_OPENING' | 'DESCENDING' | 'EXITING_PIT' = 'IDLE';
  private plungeTimerSec = 0;

  // Impact camera shake state
  private shakeTimeRemaining = 0;
  private shakeDuration = 0.25;
  private shakeIntensity = 0;

  private readonly hooks: CameraDirectorHooksV6;

  constructor(camera: THREE.PerspectiveCamera, hooks: CameraDirectorHooksV6 = {}) {
    this.camera = camera;
    this.hooks = hooks;
    this.aspect = camera.aspect || 16 / 9;

    const initial = CAMERA_ZONE_POSES.LOBBY_PROSCENIUM;
    this.posSpring = new SpringDamper3D(initial.position, initial.stiffness, initial.dampingRatio);
    this.lookSpring = new SpringDamper3D(initial.lookAt, initial.stiffness, initial.dampingRatio);
    this.fovSpring = new SpringDamper1D(initial.fov, 60, 0.96);
    this.rollSpring = new SpringDamper1D(0, 75, 0.9);

    this.applyZoneTargets('LOBBY_PROSCENIUM', true);
  }

  public getActiveZone(): CameraStageZoneV6 {
    return this.activeZone;
  }

  public setMotionMode(mode: CameraMotionModeV6): void {
    this.motionMode = mode;
    if (mode === 'REDUCED') {
      this.shakeTimeRemaining = 0;
      this.rollSpring.target = 0;
    }
  }

  public setAspect(aspect: number): void {
    this.aspect = Math.max(0.35, aspect);
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();
    if (this.plungeStage === 'IDLE') {
      this.applyZoneTargets(this.activeZone, false);
    }
  }

  public setPointerParallax(ndcX: number, ndcY: number): void {
    this.pointerNdc.set(
      Math.max(-1, Math.min(1, ndcX)),
      Math.max(-1, Math.min(1, ndcY))
    );
  }

  public addImpactShake(intensity = 0.16, durationSec = 0.28): void {
    if (this.motionMode === 'REDUCED') return;
    const scale = this.motionMode === 'SUBTLE' ? 0.45 : 1.0;
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity * scale);
    this.shakeDuration = Math.max(0.08, durationSec);
    this.shakeTimeRemaining = this.shakeDuration;
  }

  /**
   * Smoothly transitions the 3D stage camera to any of the 8 `CameraStageZoneV6` presets.
   * Entering `TRAPDOOR_PIT_PLUNGE` automatically choreographs opening the physical 3D
   * double-leaf stage trapdoor before plunging down into the clockwork pit shaft!
   */
  public setZone(
    zone: CameraStageZoneV6,
    options?: {
      immediate?: boolean;
      customLookOffset?: [number, number, number];
    }
  ): void {
    const prevZone = this.activeZone;
    this.activeZone = zone;
    if (options?.customLookOffset) {
      this.customLookOffset.set(...options.customLookOffset);
    } else {
      this.customLookOffset.set(0, 0, 0);
    }

    if (options?.immediate) {
      this.plungeStage = 'IDLE';
      this.hooks.onTrapdoorOpenRequested?.(zone === 'TRAPDOOR_PIT_PLUNGE');
      this.applyZoneTargets(zone, true);
      return;
    }

    if (zone === 'TRAPDOOR_PIT_PLUNGE' && prevZone !== 'TRAPDOOR_PIT_PLUNGE') {
      // Phase 1: Snap trapdoor leaves open & crane swiftly above the gaping shaft!
      this.plungeStage = 'HOVER_OVER_OPENING';
      this.plungeTimerSec = 0;
      this.hooks.onTrapdoorOpenRequested?.(true);
      this.posSpring.stiffness = 110;
      this.posSpring.dampingRatio = 0.92;
      this.lookSpring.stiffness = 120;
      this.lookSpring.dampingRatio = 0.92;
      this.posSpring.setTarget(0.0, 2.85, 2.05);
      this.lookSpring.setTarget(0.0, -3.2, 0.0);
      this.fovSpring.target = 54;
      this.rollSpring.target = 0.05;
      this.addImpactShake(0.22, 0.34);
      return;
    }

    if (prevZone === 'TRAPDOOR_PIT_PLUNGE' && zone !== 'TRAPDOOR_PIT_PLUNGE') {
      // Ascend cleanly out of the shaft first, then latch trapdoor leaves shut!
      this.plungeStage = 'EXITING_PIT';
      this.plungeTimerSec = 0;
      this.posSpring.stiffness = 85;
      this.posSpring.dampingRatio = 0.94;
      this.posSpring.setTarget(0.0, 2.9, 3.6);
      this.lookSpring.setTarget(0.0, 0.4, 0.0);
      this.rollSpring.target = 0;
      return;
    }

    this.plungeStage = 'IDLE';
    this.hooks.onTrapdoorOpenRequested?.(zone === 'TRAPDOOR_PIT_PLUNGE');
    this.applyZoneTargets(zone, false);
  }

  private computeAdaptedPose(zone: CameraStageZoneV6): {
    pos: [number, number, number];
    look: [number, number, number];
    fov: number;
    spec: CameraZonePoseV6;
  } {
    const spec = CAMERA_ZONE_POSES[zone];
    // Smooth portrait adaptation curve: 0 on landscape (>= 0.95), 1 on tall phones (<= 0.48)
    const portraitT = Math.max(0, Math.min(1, (0.95 - this.aspect) / 0.47));
    const pull = 1.0 + (spec.portraitPullback - 1.0) * portraitT;

    const lx = spec.lookAt[0] + this.customLookOffset.x;
    const ly = spec.lookAt[1] + spec.portraitLookYOffset * portraitT + this.customLookOffset.y;
    const lz = spec.lookAt[2] + this.customLookOffset.z;

    const dx = spec.position[0] - spec.lookAt[0];
    const dy = spec.position[1] - spec.lookAt[1];
    const dz = spec.position[2] - spec.lookAt[2];

    const px = lx + dx * pull;
    const py = ly + dy * (1.0 + (pull - 1.0) * 0.72);
    const pz = lz + dz * pull;
    const fov = spec.fov + portraitT * 6.0;

    return { pos: [px, py, pz], look: [lx, ly, lz], fov, spec };
  }

  private applyZoneTargets(zone: CameraStageZoneV6, immediate: boolean): void {
    const { pos, look, fov, spec } = this.computeAdaptedPose(zone);
    const stiffMult = this.motionMode === 'REDUCED' ? 1.85 : 1.0;

    this.posSpring.stiffness = spec.stiffness * stiffMult;
    this.posSpring.dampingRatio = this.motionMode === 'REDUCED' ? 1.0 : spec.dampingRatio;
    this.lookSpring.stiffness = spec.stiffness * 1.15 * stiffMult;
    this.lookSpring.dampingRatio = this.motionMode === 'REDUCED' ? 1.0 : spec.dampingRatio;
    this.rollSpring.target = 0;

    if (immediate) {
      this.posSpring.snap(...pos);
      this.lookSpring.snap(...look);
      this.fovSpring.snap(fov);
      this.rollSpring.snap(0);
      this.camera.position.set(...pos);
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.camera.lookAt(...look);
    } else {
      this.posSpring.setTarget(...pos);
      this.lookSpring.setTarget(...look);
      this.fovSpring.target = fov;
    }
  }

  public update(dtSec: number, elapsedSec: number): void {
    const dt = Math.min(0.05, Math.max(0, dtSec));

    // Advance 2-stage physical Trapdoor Plunge / Ascent state machine
    if (this.plungeStage === 'HOVER_OVER_OPENING') {
      this.plungeTimerSec += dt;
      if (this.plungeTimerSec >= 0.34) {
        this.plungeStage = 'DESCENDING';
        this.plungeTimerSec = 0;
        this.applyZoneTargets('TRAPDOOR_PIT_PLUNGE', false);
        this.posSpring.impulse(0, -4.8, 0);
        this.rollSpring.target = 0;
      }
    } else if (this.plungeStage === 'DESCENDING') {
      this.plungeTimerSec += dt;
      if (this.plungeTimerSec >= 0.9) {
        this.plungeStage = 'IDLE';
      }
    } else if (this.plungeStage === 'EXITING_PIT') {
      this.plungeTimerSec += dt;
      if (this.plungeTimerSec >= 0.42) {
        this.plungeStage = 'IDLE';
        this.hooks.onTrapdoorOpenRequested?.(false);
        this.applyZoneTargets(this.activeZone, false);
      }
    }

    const basePos = this.posSpring.update(dt);
    const baseLook = this.lookSpring.update(dt);
    const currentFov = this.fovSpring.update(dt);
    const currentRoll = this.rollSpring.update(dt);

    const poseSpec = CAMERA_ZONE_POSES[this.activeZone];
    const motionMult =
      this.motionMode === 'REDUCED' ? 0.0 : this.motionMode === 'SUBTLE' ? 0.34 : 1.0;

    // Organic dual-harmonic fluid-head crane drift + tactile pointer parallax
    const driftX =
      (Math.sin(elapsedSec * 0.42) * poseSpec.driftAmp[0] +
        this.pointerNdc.x * 0.24) *
      motionMult;
    const driftY =
      (Math.cos(elapsedSec * 0.57) * poseSpec.driftAmp[1] +
        this.pointerNdc.y * 0.14) *
      motionMult;
    const driftZ = Math.sin(elapsedSec * 0.31) * poseSpec.driftAmp[2] * motionMult;

    this.workPos.set(basePos.x + driftX, basePos.y + driftY, basePos.z + driftZ);
    this.workLook.copy(baseLook);

    // Impact shake decay
    if (this.shakeTimeRemaining > 0 && motionMult > 0) {
      this.shakeTimeRemaining = Math.max(0, this.shakeTimeRemaining - dt);
      const decay = this.shakeTimeRemaining / this.shakeDuration;
      const amp = this.shakeIntensity * decay * decay;
      this.workPos.x += Math.sin(elapsedSec * 58.0) * amp;
      this.workPos.y += Math.cos(elapsedSec * 67.0) * amp * 0.85;
      this.workLook.x += Math.sin(elapsedSec * 49.0 + 1.2) * amp * 0.45;
      if (this.shakeTimeRemaining === 0) {
        this.shakeIntensity = 0;
      }
    }

    this.camera.position.copy(this.workPos);
    if (Math.abs(this.camera.fov - currentFov) > 0.01) {
      this.camera.fov = currentFov;
      this.camera.updateProjectionMatrix();
    }
    this.camera.lookAt(this.workLook);
    if (Math.abs(currentRoll) > 0.0005 && motionMult > 0) {
      this.camera.rotateZ(currentRoll * motionMult);
    }
  }
}
