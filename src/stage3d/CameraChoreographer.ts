import * as THREE from 'three';

export type CameraShotId =
  | 'TITLE_ESTABLISHING'
  | 'INTERVIEW_CLOSEUP'
  | 'PRISM_STANDARD'
  | 'PRISM_PEEL_INSPECT'
  | 'CODEX_FOCUS'
  | 'CALIBRATOR_FOCUS'
  | 'GAUNTLET_FOCUS'
  | 'GLOBE_OVERWATCH'
  | 'TROPHY_HERO'
  | 'RELIC_OBSERVATORY';

interface PortraitFrameSpec {
  /** World-space vertical bounds `[objMinY, objMaxY]` of the 3D hero hardware (including levitation bob). */
  objMinY: number;
  objMaxY: number;
  /** World-space horizontal half-width and Z half-depth for exact perspective fitting. */
  objHalfW: number;
  objHalfD: number;
  /** Target screen-space vertical band `[topFrac, botFrac]` in `0..1` from top of viewport. */
  topFrac: number;
  botFrac: number;
  /** Maximum fraction of viewport width (`0..1`) occupied horizontally (reserves clean side margins). */
  maxWidthFrac: number;
}

interface ShotSpec {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  orbitDrift: number;
  minHorizontalSpan: number;
  portrait: PortraitFrameSpec;
}

/**
 * Hero Stage Plane is anchored at Y = 0.78m (exact table/plinth height across all Blender rooms),
 * placing the Veritas Prism core at world (0, 1.24, 0).
 * On Portrait viewports (`aspect < 0.95`), each shot solves exact `THREE.PerspectiveCamera` framing
 * via `PortraitFrameSpec` so 100% of the 3D hardware sits cleanly inside its unobstructed upper viewport
 * window (`12..55dvh` Title, `7..47dvh` Observatory/Trophy/Atelier, `7..45dvh` Gameplay) while keeping
 * camera eye height safely above the `Y = 0.78m` marble tabletop!
 */
const SHOT_SPECS: Record<CameraShotId, ShotSpec> = {
  TITLE_ESTABLISHING: {
    position: [0.22, 1.48, 2.95],
    lookAt: [0, 1.22, 0],
    fov: 46,
    orbitDrift: 0.14,
    minHorizontalSpan: 1.22,
    portrait: {
      objMinY: 0.78,
      objMaxY: 1.751,
      objHalfW: 0.47,
      objHalfD: 0.47,
      topFrac: 0.14,
      botFrac: 0.535,
      maxWidthFrac: 0.82,
    },
  },
  INTERVIEW_CLOSEUP: {
    position: [0, 1.42, 2.38],
    lookAt: [0, 1.21, 0],
    fov: 42,
    orbitDrift: 0.02,
    minHorizontalSpan: 1.08,
    portrait: {
      objMinY: 0.78,
      objMaxY: 1.751,
      objHalfW: 0.47,
      objHalfD: 0.47,
      topFrac: 0.11,
      botFrac: 0.49,
      maxWidthFrac: 0.82,
    },
  },
  PRISM_STANDARD: {
    position: [0, 1.43, 2.48],
    lookAt: [0, 1.2, 0],
    fov: 46,
    orbitDrift: 0.025,
    minHorizontalSpan: 1.12,
    portrait: {
      objMinY: 0.78,
      objMaxY: 1.751,
      objHalfW: 0.47,
      objHalfD: 0.47,
      topFrac: 0.125,
      botFrac: 0.445,
      maxWidthFrac: 0.82,
    },
  },
  PRISM_PEEL_INSPECT: {
    position: [0, 1.56, 2.28],
    lookAt: [0, 1.22, 0],
    fov: 44,
    orbitDrift: 0.03,
    minHorizontalSpan: 1.08,
    portrait: {
      objMinY: 0.78,
      objMaxY: 1.751,
      objHalfW: 0.48,
      objHalfD: 0.48,
      topFrac: 0.125,
      botFrac: 0.445,
      maxWidthFrac: 0.82,
    },
  },
  CODEX_FOCUS: {
    position: [0, 1.4, 2.26],
    lookAt: [0, 1.18, 0],
    fov: 44,
    orbitDrift: 0.02,
    minHorizontalSpan: 1.05,
    portrait: {
      objMinY: 0.78,
      objMaxY: 1.558,
      objHalfW: 0.38,
      objHalfD: 0.38,
      topFrac: 0.11,
      botFrac: 0.445,
      maxWidthFrac: 0.82,
    },
  },
  CALIBRATOR_FOCUS: {
    position: [0, 1.52, 2.22],
    lookAt: [0, 1.22, 0],
    fov: 44,
    orbitDrift: 0.015,
    minHorizontalSpan: 1.1,
    portrait: {
      objMinY: 0.78,
      objMaxY: 1.845,
      objHalfW: 0.525,
      objHalfD: 0.29,
      topFrac: 0.11,
      botFrac: 0.445,
      maxWidthFrac: 0.86,
    },
  },
  GAUNTLET_FOCUS: {
    position: [0, 1.38, 2.52],
    lookAt: [0, 1.22, 0],
    fov: 46,
    orbitDrift: 0.02,
    minHorizontalSpan: 1.18,
    portrait: {
      objMinY: 1.07,
      objMaxY: 1.49,
      objHalfW: 0.41,
      objHalfD: 0.05,
      topFrac: 0.12,
      botFrac: 0.42,
      maxWidthFrac: 0.84,
    },
  },
  GLOBE_OVERWATCH: {
    position: [0, 1.58, 2.68],
    lookAt: [0, 1.24, 0],
    fov: 45,
    orbitDrift: 0.02,
    minHorizontalSpan: 1.38,
    portrait: {
      objMinY: 0.78,
      objMaxY: 1.845,
      objHalfW: 0.47,
      objHalfD: 0.47,
      topFrac: 0.095,
      botFrac: 0.48,
      maxWidthFrac: 0.84,
    },
  },
  TROPHY_HERO: {
    position: [0.14, 1.38, 2.42],
    lookAt: [0, 1.24, 0],
    fov: 44,
    orbitDrift: 0.1,
    minHorizontalSpan: 1.14,
    portrait: {
      objMinY: 0.78,
      objMaxY: 1.666,
      objHalfW: 0.29,
      objHalfD: 0.24,
      topFrac: 0.085,
      botFrac: 0.455,
      maxWidthFrac: 0.8,
    },
  },
  RELIC_OBSERVATORY: {
    position: [0.1, 1.42, 2.38],
    lookAt: [0, 1.24, 0],
    fov: 44,
    orbitDrift: 0.06,
    minHorizontalSpan: 1.16,
    portrait: {
      objMinY: 0.906,
      objMaxY: 1.654,
      objHalfW: 0.36,
      objHalfD: 0.33,
      topFrac: 0.085,
      botFrac: 0.455,
      maxWidthFrac: 0.8,
    },
  },
};

/**
 * Cinema-grade Three.js Camera Choreographer:
 * - Portrait-first (9:16) & responsive desktop framing with automatic narrow-aspect pullback (zero clipping)
 * - Smooth Overclock FOV push (`46° -> 36°` per #111)
 * - Damped trauma shake on Backfire / Vault Lock / Facet Shatter
 */
export class CameraChoreographer {
  public readonly camera: THREE.PerspectiveCamera;

  private activeShot: CameraShotId = 'PRISM_STANDARD';
  private aspect = 16 / 9;
  private viewportWidth = 1280;
  private viewportHeight = 720;
  private elapsed = 0;

  private overclockCharge = 0;
  private targetOverclockCharge = 0;

  private trauma = 0;
  private readonly currentPos = new THREE.Vector3(0, 1.43, 2.48);
  private readonly currentLook = new THREE.Vector3(0, 1.2, 0);
  private readonly targetPos = new THREE.Vector3(0, 1.43, 2.48);
  private readonly targetLook = new THREE.Vector3(0, 1.2, 0);
  private currentFov = 46;
  private baseFov = 46;

  private readonly userParallax = new THREE.Vector2(0, 0);
  private readonly targetParallax = new THREE.Vector2(0, 0);
  private userOrbitPitch = 0;
  private targetOrbitPitch = 0;
  private isDraggingOrbitPitch = false;

  private readonly scratchGoalPos = new THREE.Vector3();
  private readonly scratchRawOffset = new THREE.Vector3();
  private readonly scratchCorner = new THREE.Vector3();
  private readonly scratchOrbitVec = new THREE.Vector3();
  private readonly solverCamera = new THREE.PerspectiveCamera(46, 1, 0.08, 120);

  constructor(aspect = 16 / 9) {
    this.aspect = Math.max(0.3, aspect);
    this.camera = new THREE.PerspectiveCamera(46, this.aspect, 0.08, 120);
    this.setShot('PRISM_STANDARD', true);
  }

  public setAspect(width: number, height: number): void {
    const safeW = Math.max(1, width);
    const safeH = Math.max(1, height);
    const prevAspect = this.aspect;
    const prevHeight = this.viewportHeight;

    this.viewportWidth = safeW;
    this.viewportHeight = safeH;
    this.aspect = Math.max(0.3, safeW / safeH);
    this.camera.aspect = this.aspect;
    this.recomputeShotTargets();

    // On live portrait <-> landscape hot-rotation (e.g. 390x844 <-> 844x390 or 768x1024 <-> 1024x768),
    // snap camera target framing immediately so zero frames clip during orientation flip (#168, #169)
    const crossedPortraitBoundary = (this.aspect < 0.95) !== (prevAspect < 0.95);
    if (
      crossedPortraitBoundary ||
      Math.abs(this.aspect - prevAspect) > 0.25 ||
      Math.abs(safeH - prevHeight) > 120
    ) {
      this.currentPos.copy(this.targetPos);
      this.currentLook.copy(this.targetLook);
      this.camera.position.copy(this.currentPos);
      this.camera.lookAt(this.currentLook);
    }

    this.camera.updateProjectionMatrix();
  }

  public getViewportSize(): { width: number; height: number; aspect: number } {
    return {
      width: this.viewportWidth,
      height: this.viewportHeight,
      aspect: this.aspect,
    };
  }

  public getShot(): CameraShotId {
    return this.activeShot;
  }

  public setShot(shot: CameraShotId, instant = false): void {
    this.activeShot = shot;
    this.isDraggingOrbitPitch = false;
    this.targetOrbitPitch = 0;
    this.recomputeShotTargets();
    if (instant) {
      this.userOrbitPitch = 0;
      this.currentPos.copy(this.targetPos);
      this.currentLook.copy(this.targetLook);
      this.currentFov = this.baseFov;
      this.camera.fov = this.currentFov;
      this.camera.position.copy(this.currentPos);
      this.camera.lookAt(this.currentLook);
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Drives the smooth `46° -> 36°` Overclock spatial wager camera push (#111).
   */
  public setOverclockCharge(charge01: number): void {
    this.targetOverclockCharge = THREE.MathUtils.clamp(charge01, 0, 1);
  }

  /**
   * Adds damped camera trauma (`0..1`) for Backfire (`0.85`), Shatter (`0.35`), or Vault Thunk (`0.22`).
   */
  public triggerShake(intensity = 0.45): void {
    this.trauma = Math.min(1.0, Math.max(this.trauma, THREE.MathUtils.clamp(intensity, 0, 1)));
  }

  /**
   * Subtle pointer parallax offset (`ndcX, ndcY` in `-1..1`) for depth richness.
   */
  public setPointerParallax(ndcX: number, ndcY: number): void {
    this.targetParallax.set(
      THREE.MathUtils.clamp(ndcX, -1, 1) * 0.045,
      THREE.MathUtils.clamp(ndcY, -1, 1) * 0.028
    );
  }

  /**
   * Subtle 1-finger vertical touch/mouse orbit elevation during Observatory / Trophy / Title showcase.
   * Clamped so the camera always stays safely above the `Y = 0.78m` marble tabletop!
   */
  public applyUserOrbitPitch(deltaRad: number): void {
    this.isDraggingOrbitPitch = true;
    this.targetOrbitPitch = THREE.MathUtils.clamp(this.targetOrbitPitch + deltaRad, -0.24, 0.28);
  }

  public releaseUserOrbitPitch(): void {
    this.isDraggingOrbitPitch = false;
  }

  private measureProjectedBounds(
    cam: THREE.PerspectiveCamera,
    pf: PortraitFrameSpec,
    out: { minYFrac: number; maxYFrac: number; maxAbsX: number }
  ): void {
    cam.updateMatrixWorld();
    out.minYFrac = Infinity;
    out.maxYFrac = -Infinity;
    out.maxAbsX = 0;

    for (let ix = -1; ix <= 1; ix++) {
      const x = ix * pf.objHalfW;
      for (let iy = 0; iy < 2; iy++) {
        const y = iy === 0 ? pf.objMinY : pf.objMaxY;
        for (let iz = -1; iz <= 1; iz++) {
          const z = iz * pf.objHalfD;
          this.scratchCorner.set(x, y, z).project(cam);
          const yFrac = (1 - this.scratchCorner.y) * 0.5;
          if (yFrac < out.minYFrac) out.minYFrac = yFrac;
          if (yFrac > out.maxYFrac) out.maxYFrac = yFrac;
          const absX = Math.abs(this.scratchCorner.x);
          if (absX > out.maxAbsX) out.maxAbsX = absX;
        }
      }
    }
  }

  /**
   * Exact zero-allocation Three.js `PerspectiveCamera` portrait framing solver (`aspect < 0.95`).
   * Solves `(targetPos, targetLook.y)` so 100% of the hero 3D object's bounding envelope projects
   * strictly inside `[topFrac, botFrac]` vertically AND `<= maxWidthFrac` horizontally, while
   * keeping camera eye elevation safely above the `Y = 0.78m` Hero Stage Table (`camY >= 1.42m`)
   * and well inside all 8 architectural room chambers (`camZ <= 4.55m`).
   */
  private solvePortraitFraming(spec: ShotSpec, baseDist: number, rawOffset: THREE.Vector3): void {
    const pf = spec.portrait;
    const solver = this.solverCamera;
    solver.fov = spec.fov;
    solver.aspect = this.aspect;
    solver.updateProjectionMatrix();

    const tanHalfV = Math.tan(THREE.MathUtils.degToRad(spec.fov * 0.5));
    const objH = pf.objMaxY - pf.objMinY;
    const objMidY = 0.5 * (pf.objMinY + pf.objMaxY);
    const targetBandH = Math.max(0.18, pf.botFrac - pf.topFrac);
    const targetMidFrac = 0.5 * (pf.topFrac + pf.botFrac);

    // Initial closed-form analytic distance estimate (accounting for front-face foreshortening)
    const dVert = objH / (2 * targetBandH * tanHalfV) + pf.objHalfD * 1.15;
    const dHoriz = (pf.objHalfW * 2) / (2 * pf.maxWidthFrac * tanHalfV * this.aspect) + pf.objHalfD * 1.15;
    let dist = THREE.MathUtils.clamp(Math.max(baseDist, dVert, dHoriz), baseDist, 4.55);

    const bounds = { minYFrac: 0, maxYFrac: 1, maxAbsX: 0 };
    let camX = spec.lookAt[0];
    let camY = Math.max(1.42, spec.position[1]);
    let camZ = dist;
    let lookY = objMidY;

    for (let iter = 0; iter < 6; iter++) {
      // Gently center horizontal camera offset on narrow portrait viewports for crisp symmetry
      camX = spec.lookAt[0] + rawOffset.x * 0.45;
      camY = Math.max(1.42, spec.position[1] + Math.max(0, (dist - baseDist) * 0.08));
      const horizSq = dist * dist - (camX - spec.lookAt[0]) ** 2 - (camY - objMidY) ** 2;
      camZ = spec.lookAt[2] + Math.sqrt(Math.max(0.6, horizSq));

      // Bisect lookAt.y (lowering lookAt.y moves the 3D object UP on screen!)
      let lo = -1.8;
      let hi = 1.65;
      for (let k = 0; k < 14; k++) {
        const mid = 0.5 * (lo + hi);
        solver.position.set(camX, camY, camZ);
        solver.lookAt(spec.lookAt[0], mid, spec.lookAt[2]);
        this.measureProjectedBounds(solver, pf, bounds);
        const curMidFrac = 0.5 * (bounds.minYFrac + bounds.maxYFrac);
        if (curMidFrac > targetMidFrac) {
          hi = mid;
        } else {
          lo = mid;
        }
      }
      lookY = 0.5 * (lo + hi);
      solver.position.set(camX, camY, camZ);
      solver.lookAt(spec.lookAt[0], lookY, spec.lookAt[2]);
      this.measureProjectedBounds(solver, pf, bounds);

      const curSpan = Math.max(0.05, bounds.maxYFrac - bounds.minYFrac);
      const scaleV = curSpan / targetBandH;
      const scaleH = bounds.maxAbsX / pf.maxWidthFrac;
      const reqScale = Math.max(scaleV, scaleH);
      if (Math.abs(reqScale - 1.0) < 0.008) {
        break;
      }
      dist = THREE.MathUtils.clamp(
        dist * THREE.MathUtils.clamp(reqScale, 0.78, 1.42),
        baseDist,
        4.55
      );
    }

    this.targetLook.set(spec.lookAt[0], lookY, spec.lookAt[2]);
    this.targetPos.set(camX, camY, camZ);
  }

  private recomputeShotTargets(): void {
    const spec = SHOT_SPECS[this.activeShot] ?? SHOT_SPECS.PRISM_STANDARD;
    this.baseFov = spec.fov;
    this.targetLook.set(spec.lookAt[0], spec.lookAt[1], spec.lookAt[2]);

    const rawOffset = this.scratchRawOffset.set(
      spec.position[0] - spec.lookAt[0],
      spec.position[1] - spec.lookAt[1],
      spec.position[2] - spec.lookAt[2]
    );
    const baseDist = rawOffset.length();

    // 1. LANDSCAPE_MOBILE (e.g. 844x390, 800x360, 932x430 where height <= 520px && aspect >= 1.35):
    // - Gameplay docks Right 54% (x = 46..100vw) -> shift targetLook.x += 0.58 into Left 46vw pane
    // - Observatory, Trophy & Title dock Right 50% (x = 50..100vw) -> shift targetLook.x += 0.55 into Left 50vw pane
    const isLandscapeMobile = this.viewportHeight <= 520 && this.aspect >= 1.35;
    if (isLandscapeMobile) {
      const isGameplayShot =
        this.activeShot === 'PRISM_STANDARD' ||
        this.activeShot === 'PRISM_PEEL_INSPECT' ||
        this.activeShot === 'CODEX_FOCUS' ||
        this.activeShot === 'CALIBRATOR_FOCUS' ||
        this.activeShot === 'GAUNTLET_FOCUS';
      const isLeftPaneShowcase =
        this.activeShot === 'RELIC_OBSERVATORY' ||
        this.activeShot === 'TROPHY_HERO' ||
        this.activeShot === 'TITLE_ESTABLISHING';

      const halfVertRad = THREE.MathUtils.degToRad(spec.fov * 0.5);
      const horizSpanAtBase = 2 * baseDist * Math.tan(halfVertRad) * this.aspect;
      let pullback =
        horizSpanAtBase < spec.minHorizontalSpan
          ? THREE.MathUtils.clamp(spec.minHorizontalSpan / Math.max(0.25, horizSpanAtBase), 1.0, 1.55)
          : 1.0;

      if (isGameplayShot) {
        const leftPanePullback = THREE.MathUtils.clamp(
          440 / Math.max(320, this.viewportHeight),
          1.06,
          1.22
        );
        pullback = Math.max(pullback, leftPanePullback);
        this.targetLook.x += 0.8;
        this.targetLook.y += 0.02;
      } else if (isLeftPaneShowcase) {
        const showcasePullback = THREE.MathUtils.clamp(
          450 / Math.max(320, this.viewportHeight),
          1.08,
          1.26
        );
        pullback = Math.max(pullback, showcasePullback);
        this.targetLook.x += 0.72;
        this.targetLook.y += 0.02;
      } else {
        const shortHeightPullback = THREE.MathUtils.clamp(
          520 / Math.max(320, this.viewportHeight),
          1.18,
          1.42
        );
        pullback = Math.max(pullback, shortHeightPullback);
        this.targetLook.y += 0.03;
      }

      this.targetPos.copy(this.targetLook).addScaledVector(rawOffset, pullback);
      return;
    }

    // 2. PORTRAIT VIEWPORTS (aspect < 0.95 — 320x568, 360x640, 375x667, 390x844, 430x932, 768x1024):
    // Solve exact Three.js perspective framing inside each shot's unobstructed upper dvh window!
    if (this.aspect < 0.95) {
      this.solvePortraitFraming(spec, baseDist, rawOffset);
      return;
    }

    // 3. DESKTOP / TABLET LANDSCAPE (aspect >= 0.95 && vh > 520):
    // Preserve classic regal studio framing; center Observatory/Trophy inside open left gallery pane (#273 #6)
    const halfVertRad = THREE.MathUtils.degToRad(spec.fov * 0.5);
    const horizSpanAtBase = 2 * baseDist * Math.tan(halfVertRad) * this.aspect;
    const pullback =
      horizSpanAtBase < spec.minHorizontalSpan
        ? THREE.MathUtils.clamp(spec.minHorizontalSpan / Math.max(0.25, horizSpanAtBase), 1.0, 1.55)
        : 1.0;

    if (
      this.viewportWidth >= 900 &&
      (this.activeShot === 'RELIC_OBSERVATORY' || this.activeShot === 'TROPHY_HERO')
    ) {
      this.targetLook.x += 0.36;
    }

    this.targetPos.copy(this.targetLook).addScaledVector(rawOffset, pullback);
  }

  public update(dt: number): void {
    this.elapsed += dt;
    const smooth = 1 - Math.exp(-dt * 7.2);
    const chargeSmooth = 1 - Math.exp(-dt * 9.0);

    this.overclockCharge = THREE.MathUtils.lerp(
      this.overclockCharge,
      this.targetOverclockCharge,
      chargeSmooth
    );

    this.userParallax.lerp(this.targetParallax, 1 - Math.exp(-dt * 4.0));

    if (!this.isDraggingOrbitPitch) {
      this.targetOrbitPitch *= Math.exp(-dt * 3.6);
      if (Math.abs(this.targetOrbitPitch) < 0.0004) {
        this.targetOrbitPitch = 0;
      }
    }
    this.userOrbitPitch = THREE.MathUtils.lerp(this.userOrbitPitch, this.targetOrbitPitch, chargeSmooth);

    // Exact #111 Overclock FOV push: 46° -> 36° (or proportional 10° tightening on other shots)
    const desiredFov =
      this.activeShot === 'PRISM_STANDARD'
        ? THREE.MathUtils.lerp(46, 36, this.overclockCharge)
        : this.baseFov - 9.5 * this.overclockCharge;

    if (Math.abs(this.currentFov - desiredFov) > 0.005) {
      this.currentFov = THREE.MathUtils.lerp(this.currentFov, desiredFov, chargeSmooth);
      this.camera.fov = this.currentFov;
      this.camera.updateProjectionMatrix();
    }

    const spec = SHOT_SPECS[this.activeShot] ?? SHOT_SPECS.PRISM_STANDARD;
    const driftScale = this.aspect < 0.95 ? 0.5 : 1.0;
    const driftX = Math.sin(this.elapsed * 0.42) * spec.orbitDrift * driftScale;
    const driftY = Math.cos(this.elapsed * 0.57) * 0.008;
    const overclockDollyZ = -0.14 * this.overclockCharge;

    const goalPos = this.scratchGoalPos.copy(this.targetPos);
    if (Math.abs(this.userOrbitPitch) > 0.0005) {
      // Smooth vertical elevation arc around hero stage plane (Y = 1.24m), clamped safely above table
      const pivotY = 1.24;
      const dy = goalPos.y - pivotY;
      const dz = goalPos.z - this.targetLook.z;
      const cosP = Math.cos(this.userOrbitPitch);
      const sinP = Math.sin(this.userOrbitPitch);
      this.scratchOrbitVec.set(
        goalPos.x,
        Math.max(1.06, pivotY + dy * cosP + dz * sinP),
        this.targetLook.z + Math.max(0.85, -dy * sinP + dz * cosP)
      );
      goalPos.copy(this.scratchOrbitVec);
    }

    goalPos.x += driftX + this.userParallax.x * driftScale;
    goalPos.y += driftY + this.userParallax.y * driftScale;
    goalPos.z += overclockDollyZ;

    this.currentPos.lerp(goalPos, smooth);
    this.currentLook.lerp(this.targetLook, smooth);

    // Trauma shake (quadratic falloff for crisp cinematic punch)
    let shakeX = 0;
    let shakeY = 0;
    let shakeRoll = 0;
    if (this.trauma > 0.001) {
      const mag = this.trauma * this.trauma;
      shakeX = (Math.sin(this.elapsed * 47.0) + 0.5 * Math.cos(this.elapsed * 83.0)) * 0.042 * mag;
      shakeY = (Math.cos(this.elapsed * 53.0) + 0.5 * Math.sin(this.elapsed * 71.0)) * 0.036 * mag;
      shakeRoll = Math.sin(this.elapsed * 39.0) * 0.018 * mag;
      this.trauma = Math.max(0, this.trauma - dt * 1.85);
    }

    // Subtle high-pressure turbine micro-tremor near peak Overclock charge
    if (this.overclockCharge > 0.35) {
      const ocTremor = (this.overclockCharge - 0.35) * 0.0032;
      shakeX += Math.sin(this.elapsed * 64.0) * ocTremor;
      shakeY += Math.cos(this.elapsed * 78.0) * ocTremor;
    }

    this.camera.position.set(
      this.currentPos.x + shakeX,
      this.currentPos.y + shakeY,
      this.currentPos.z
    );
    this.camera.lookAt(this.currentLook);
    if (Math.abs(shakeRoll) > 0.0001) {
      this.camera.rotateZ(shakeRoll);
    }
  }
}
