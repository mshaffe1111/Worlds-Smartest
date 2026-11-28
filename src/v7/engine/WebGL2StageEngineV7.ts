// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// `src/v7/engine/WebGL2StageEngineV7.ts`
// Ultra-HD 1966 "IN LIVING COLOR" Hardware WebGL2 Soundstage & Mobile-First Camera
//  - Direct hardware-antialiased `this.renderer.render(this.scene, this.camera)`
//    (ZERO multisampled EffectComposer FBO black-frame drops on Windows D3D11!)
//  - High-DPI `Math.min(window.devicePixelRatio, 2.5)` crispness + AgX tone mapping
//  - Live OBB-based `fitBoardToViewport(vw, vh)` across Phone Portrait, Tablet
//    Portrait, Tablet Landscape & Desktop making THE GAME BOARD the 80% focal star!
//  - Split-Uniform Card Dimming `setCardApertureOpen(open)` (-55% / 0.45 in 150ms,
//    0px CSS blur, Row-C Glint / Solenoid Spark / Fresnel Lamp stay at 100% HDR!)
// ============================================================================

import * as THREE from 'three';
import type {
  BroadcastSettingsV7,
  CoupRegimeIdV7,
  CrowdMoodV9,
  ReactiveSignIdV9,
  SeasonIdV7,
  StageEngineContract,
  StageWorldIdV7,
  StageWorldSpecV7,
} from '../contracts_v7';
import {
  createLivingColorBroadcastIbl,
  disposeObject3DTree,
  HdrSolenoidSparkBurst,
} from './HorologicalCAD';
import {
  type BuiltStageWorldV7,
  buildStageWorldV7,
  SEASON_STAGE_OVERRIDES_V9,
  STAGE_WORLD_SPECS_V7,
} from './StageWorldsV7';

// ----------------------------------------------------------------------------
// 1. Public Engine Interfaces & Telemetry Contracts
// ----------------------------------------------------------------------------

export interface WebGL2StageEngineConfigV7 {
  container: HTMLElement;
  initialStageId?: StageWorldIdV7;
  preserveDrawingBuffer?: boolean;
  reducedMotion?: boolean;
}

export type StageInteractiveHitV7 = { kind: 'ROW_C_GLINT' };

export interface FrustumFitResultV7 {
  readonly width: number;
  readonly height: number;
  readonly aspect: number;
  readonly fovDeg: number;
  readonly pitchDeg: number;
  readonly cameraPos: readonly [number, number, number];
  readonly lookAtTarget: readonly [number, number, number];
  readonly boardScreenBoundsPct: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export interface StageEngineTelemetryV7 {
  readonly fps: number;
  readonly effectiveDpr: number;
  readonly isWebGL2: boolean;
  readonly activeStageId: StageWorldIdV7;
  readonly activeSeason: SeasonIdV7;
  readonly activeCoupRegime: CoupRegimeIdV7;
  readonly cameraPitchDeg: number;
  readonly cameraY: number;
  readonly apertureDimFactor: number;
  readonly cardApertureOpen: boolean;
  readonly bloomThreshold: number;
  readonly bloomStrength: number;
  readonly userZoom: number;
  readonly drawCalls: number;
  readonly triangles: number;
}

export type StageFrameListenerV7 = (dtSec: number, elapsedSec: number) => void;

// Helper to construct oriented raked board fallback hull points (zero phantom AABB air corners!)
function buildRakedFallbackHull(
  halfW: number,
  halfD: number,
  yMin: number,
  yMax: number,
  pivotY: number,
  rakeRad: number,
): ReadonlyArray<readonly [number, number, number]> {
  const cosR = Math.cos(rakeRad);
  const sinR = Math.sin(rakeRad);
  const pts: Array<[number, number, number]> = [];
  for (const lx of [-halfW, 0, halfW]) {
    for (const ly of [yMin, yMax]) {
      for (const lz of [-halfD, 0, halfD]) {
        const wy = pivotY + ly * cosR - lz * sinR;
        const wz = ly * sinR + lz * cosR;
        pts.push([lx, wy, wz]);
      }
    }
  }
  return pts;
}

const CANONICAL_BOARD_HULL_POINTS = buildRakedFallbackHull(2.15, 1.28, -0.05, 0.28, 0.88, 0.54);
const PORTRAIT_TILE_PLAYFIELD_HULL_POINTS = buildRakedFallbackHull(
  1.22,
  1.42,
  -0.05,
  0.24,
  0.96,
  0.66,
);

// ----------------------------------------------------------------------------
// 2. `WebGL2StageEngineV7` Implementation
// ----------------------------------------------------------------------------

export class WebGL2StageEngineV7 implements StageEngineContract {
  public readonly container: HTMLElement;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly raycaster: THREE.Raycaster;
  public readonly boardMount: THREE.Group;
  public readonly toyMount: THREE.Group;
  public readonly trophyMount: THREE.Group;
  public sharedEnvMap: THREE.Texture;

  private readonly sharedEnvRT: THREE.WebGLRenderTarget;
  private readonly solenoidSparks: HdrSolenoidSparkBurst;

  // Authentic 300-Footcandle 1966 Living Color Studio Lighting Rig (Warm Key + Cool/Warm Dual Rim Separation!)
  private readonly keyLight: THREE.DirectionalLight;
  private readonly rimLight: THREE.DirectionalLight;
  private readonly warmRimLight: THREE.DirectionalLight;
  private readonly fillLight: THREE.DirectionalLight;
  private readonly hemiLight: THREE.HemisphereLight;
  private readonly ambientLight: THREE.AmbientLight;

  private baseKeyIntensity = 1.78;
  private baseRimIntensity = 1.22;
  private baseWarmRimIntensity = 0.85;
  private baseFillIntensity = 0.52;
  private baseHemiIntensity = 0.46;
  private baseAmbientIntensity = 0.2;
  private baseEnvIntensity = 0.86;

  // Split-Uniform Card Aperture State (150ms ramp: 1.0 <-> 0.45)
  private cardApertureOpen = false;
  private currentApertureDim = 1.0;
  private targetApertureDim = 1.0;

  private activeStageId: StageWorldIdV7;
  private activeSeason: SeasonIdV7 = 1;
  private activeStageWorld: BuiltStageWorldV7 | null = null;
  private lastFitResult: FrustumFitResultV7 | null = null;
  private baseCameraPos = new THREE.Vector3(0, 3.6, 4.4);
  private baseLookAt = new THREE.Vector3(0, 0.82, -0.06);
  private solvedDistance = 4.5;
  private currentPitchDeg = 29.0;
  private reducedMotion = false;

  // Interactive User Camera Zoom (0.75x .. 2.40x) & Smooth Drag-to-Pan Offsets
  private targetUserZoom = 1.0;
  private currentUserZoom = 1.0;
  private targetPanX = 0.0;
  private targetPanZ = 0.0;
  private currentPanX = 0.0;
  private currentPanZ = 0.0;

  // Seasickness-Free 1966 RCA TK-41 Studio Pedestal Motion (±0.03m 0.18Hz idle breathe + ~4% damped focus push-in)
  private isPhonePortraitViewport = false;
  private targetFocusX = 0.0;
  private targetFocusZ = 0.0;
  private targetFocusZoomBoost = 0.0;
  private currentFocusX = 0.0;
  private currentFocusZ = 0.0;
  private currentFocusZoomBoost = 0.0;

  private readonly pointerNdc = new THREE.Vector2();
  private readonly frameListeners = new Set<StageFrameListenerV7>();
  private readonly resizeObserver: ResizeObserver | null = null;
  private readonly onWindowResizeBound: () => void;
  private readonly onContextLostBound: (ev: Event) => void;

  private rafId: number | null = null;
  private lastNowMs = 0;
  private elapsedSec = 0;
  private fpsAccumSec = 0;
  private fpsFrames = 0;
  private currentFps = 60;
  private lastCanvasCssW = 0;
  private lastCanvasCssH = 0;
  private lastAppliedDpr = 0;
  private isDisposed = false;

  constructor(config: WebGL2StageEngineConfigV7) {
    this.container = config.container;
    this.activeStageId = config.initialStageId ?? 'STAGE_01_IBC_DAYTIME_FUNK';
    this.reducedMotion = config.reducedMotion ?? false;

    // 1. Hardware WebGL2 Renderer w/ Ultra-HD DPR <= 2.5 Cap, AgX Living Color & 2048px Shadows
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: config.preserveDrawingBuffer ?? false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.AgXToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initialDpr = this.computeSafeDpr();
    this.renderer.setPixelRatio(initialDpr);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.touchAction = 'none';
    this.renderer.domElement.style.filter = 'none';
    this.container.appendChild(this.renderer.domElement);

    this.onContextLostBound = (ev: Event) => {
      ev.preventDefault();
      this.stop();
    };
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLostBound);

    // 2. Scene, PerspectiveCamera & Raycaster
    this.scene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();

    const initW = Math.max(
      1,
      this.container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1280),
    );
    const initH = Math.max(
      1,
      this.container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 800),
    );
    this.camera = new THREE.PerspectiveCamera(44, initW / initH, 0.15, 65);

    // 3. Shared 256px 1966 Living Color Broadcast PMREM IBL (ZERO dark muddy brown!)
    this.sharedEnvRT = createLivingColorBroadcastIbl(this.renderer);
    this.sharedEnvMap = this.sharedEnvRT.texture;
    this.scene.environment = this.sharedEnvMap;
    this.scene.environmentIntensity = this.baseEnvIntensity;

    // 4. Table-Fitted 2048x2048 Key Shadow Light + 1966 Living Color Studio Fill/Rim Rig
    this.keyLight = new THREE.DirectionalLight(0xfff0d6, this.baseKeyIntensity);
    this.keyLight.position.set(2.8, 7.8, 4.6);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.camera.near = 1.2;
    this.keyLight.shadow.camera.far = 18.0;
    this.keyLight.shadow.camera.left = -3.6;
    this.keyLight.shadow.camera.right = 3.6;
    this.keyLight.shadow.camera.top = 3.6;
    this.keyLight.shadow.camera.bottom = -3.6;
    this.keyLight.shadow.bias = -0.0003;
    this.keyLight.shadow.normalBias = 0.032;
    this.scene.add(this.keyLight, this.keyLight.target);
    this.keyLight.target.position.set(0, 0.6, 0);

    this.rimLight = new THREE.DirectionalLight(0x00bcd0, this.baseRimIntensity);
    this.rimLight.position.set(-4.6, 5.4, -5.8);
    this.scene.add(this.rimLight);

    // Opposite warm golden studio kicker rim (Pixar warm/cool cross-key studio contrast!)
    this.warmRimLight = new THREE.DirectionalLight(0xffb84d, this.baseWarmRimIntensity);
    this.warmRimLight.position.set(4.8, 4.9, -5.4);
    this.scene.add(this.warmRimLight);

    this.fillLight = new THREE.DirectionalLight(0xb8e0ff, this.baseFillIntensity);
    this.fillLight.position.set(-4.2, 4.4, 4.6);
    this.scene.add(this.fillLight);

    // Warm studio overhead over warm American Walnut bounce (ZERO dark-navy mud!)
    this.hemiLight = new THREE.HemisphereLight(0xfff6e5, 0x6b442a, this.baseHemiIntensity);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0x66503c, this.baseAmbientIntensity);
    this.scene.add(this.ambientLight);

    // 5. Canonical Subsystem Mounts + Exempt HDR Solenoid Spark Emitter
    this.boardMount = new THREE.Group();
    this.boardMount.name = 'V7_BoardMount';
    this.toyMount = new THREE.Group();
    this.toyMount.name = 'V7_ToyMount';
    this.trophyMount = new THREE.Group();
    this.trophyMount.name = 'V7_TrophyMount';
    this.scene.add(this.boardMount, this.toyMount, this.trophyMount);

    this.solenoidSparks = new HdrSolenoidSparkBurst(240);
    this.solenoidSparks.setPixelRatio(initialDpr);
    this.scene.add(this.solenoidSparks.points);

    // 6. Build Initial Grounded Soundstage & Auto-Fit Frustum
    //    (Zero EffectComposer / UnrealBloomPass FBO allocations — pure rock-solid 4x MSAA direct render!)
    this.setStageWorld(this.activeStageId);
    this.resize(initW, initH);

    // 8. Responsive Resize Listeners
    this.onWindowResizeBound = () => {
      if (this.isDisposed) return;
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.resize(w, h);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onWindowResizeBound);
    }
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.onWindowResizeBound());
      this.resizeObserver.observe(this.container);
    }
  }

  private computeSafeDpr(): number {
    const raw = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    return Math.min(2.5, Math.max(1.0, raw));
  }

  // --------------------------------------------------------------------------
  // Live Oriented Bounding Box Extraction (Zero Phantom AABB Air Corners!)
  // --------------------------------------------------------------------------

  private collectBoardHullPoints(isPortrait: boolean): {
    points: Array<[number, number, number]>;
    centerY: number;
    centerZ: number;
  } {
    const fallback = isPortrait
      ? PORTRAIT_TILE_PLAYFIELD_HULL_POINTS
      : CANONICAL_BOARD_HULL_POINTS;

    if (this.boardMount.children.length === 0) {
      return {
        points: fallback.map((p) => [p[0], p[1], p[2]]),
        centerY: isPortrait ? 0.9 : 0.84,
        centerZ: -0.04,
      };
    }

    this.boardMount.updateWorldMatrix(true, true);

    const chassis =
      this.boardMount.getObjectByName('RakedContraptionChassis_22Deg') ??
      this.boardMount.children[0];
    const playfield =
      this.boardMount.getObjectByName('TilePlayfieldOrBalanceBeam') ?? chassis;

    const invChassis = new THREE.Matrix4().copy(chassis.matrixWorld).invert();
    const localBox = new THREE.Box3();
    const tempMeshBox = new THREE.Box3();
    const meshToChassis = new THREE.Matrix4();
    let meshCount = 0;

    playfield.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return;
      if (!mesh.geometry.boundingBox) {
        mesh.geometry.computeBoundingBox();
      }
      if (!mesh.geometry.boundingBox || mesh.geometry.boundingBox.isEmpty()) return;
      meshToChassis.multiplyMatrices(invChassis, mesh.matrixWorld);
      tempMeshBox.copy(mesh.geometry.boundingBox).applyMatrix4(meshToChassis);
      localBox.union(tempMeshBox);
      meshCount++;
    });

    if (meshCount === 0 || localBox.isEmpty()) {
      return {
        points: fallback.map((p) => [p[0], p[1], p[2]]),
        centerY: isPortrait ? 0.9 : 0.84,
        centerZ: -0.04,
      };
    }

    // Clamp tightly around the actual playable tile deck!
    // In Portrait, zero extra horizontal pad lets the decorative cabinet rails kiss the viewport edges
    // while ALL playable tile faces fill ~90% of phone width (>= 108px per tile on 390px phones!)
    const padX = isPortrait ? 0.0 : 0.12;
    const padZ = isPortrait ? 0.135 : 0.18;
    const minX = THREE.MathUtils.clamp(localBox.min.x - padX, isPortrait ? -1.52 : -2.42, -0.65);
    const maxX = THREE.MathUtils.clamp(localBox.max.x + padX, 0.65, isPortrait ? 1.52 : 2.42);
    const minY = THREE.MathUtils.clamp(localBox.min.y - 0.04, -0.14, 0.12);
    const maxY = THREE.MathUtils.clamp(localBox.max.y + 0.02, 0.18, 0.48);
    const minZ = THREE.MathUtils.clamp(localBox.min.z - padZ, isPortrait ? -2.05 : -1.58, -0.5);
    const maxZ = THREE.MathUtils.clamp(localBox.max.z + padZ, 0.5, isPortrait ? 2.05 : 1.58);

    const midX = (minX + maxX) * 0.5;
    const midZ = (minZ + maxZ) * 0.5;
    const v = new THREE.Vector3();
    const points: Array<[number, number, number]> = [];
    for (const lx of [minX, midX, maxX]) {
      for (const ly of [minY, maxY]) {
        for (const lz of [minZ, midZ, maxZ]) {
          v.set(lx, ly, lz).applyMatrix4(chassis.matrixWorld);
          points.push([v.x, v.y, v.z]);
        }
      }
    }

    const centerWorld = new THREE.Vector3(midX, (minY + maxY) * 0.5, midZ).applyMatrix4(
      chassis.matrixWorld,
    );
    return { points, centerY: centerWorld.y, centerZ: centerWorld.z };
  }

  // --------------------------------------------------------------------------
  // Mobile, Tablet & Desktop Board-as-Star Frustum Auto-Fitter
  // --------------------------------------------------------------------------

  /**
   * Frames the raked 3D Tote Board as the giant 80% focal star across:
   *  - Phone Portrait (`aspect < 0.72`: 390x844, 390x660, 430x932)
   *  - Tablet Portrait (`0.72 <= aspect < 1.0`: 768x1024, 820x1180)
   *  - Tablet Landscape (`1.0 <= aspect < 1.45`: 1024x768)
   *  - Desktop & Mobile Landscape (`aspect >= 1.45`: 1440x900, 1920x1080, 844x390)
   * while cleanly crowning the upper edge with the glowing 1966 marquee & pillars!
   */
  public fitBoardToViewport(width: number, height: number): FrustumFitResultV7 {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    const aspect = w / h;

    const isPortrait = aspect < 1.0;
    const isPhonePortrait = aspect < 0.72;
    const isTabletPortrait = aspect >= 0.72 && aspect < 1.0;
    const isTabletLandscape = aspect >= 1.0 && aspect < 1.45;
    const isWidePhoneLandscape = aspect > 1.85 && h <= 500;

    const hull = this.collectBoardHullPoints(isPortrait);
    const points = hull.points;

    let pitchDeg: number;
    let fovDeg: number;
    let maxAllowedNdcX: number;
    let topReservedPx: number;
    let bottomReservedPx: number;
    let topSafePct: number;
    let bottomSafePct: number;
    let targetCenterYPct: number;

    if (isPhonePortrait) {
      // Phone Portrait (`375x667`, `390x844`, `390x660`, `430x932`):
      // Razor-tight tile playfield framing -> tiles fill ~90-96% screen width (>= 108px/tile on 390px!)
      // Explicit bottom HUD clearance guarantees 5-row boards on compact `390x660` never clip the mode banner!
      const isCompactPortrait = h <= 710;
      pitchDeg = 31.4;
      fovDeg = THREE.MathUtils.clamp(38.0 - (aspect - 0.46) * 5.0, 36.0, 39.0);
      maxAllowedNdcX = 0.968;
      topReservedPx = 56;
      bottomReservedPx = isCompactPortrait ? 98 : 106;
      topSafePct = Math.max(isCompactPortrait ? 0.148 : 0.125, (topReservedPx + 40) / h);
      bottomSafePct = Math.max(isCompactPortrait ? 0.148 : 0.125, bottomReservedPx / h);
      targetCenterYPct = (topSafePct + (1 - bottomSafePct)) * 0.5 + 0.008;
    } else if (isTabletPortrait) {
      // Tablet Portrait (`768x1024`, `820x1180`):
      // Heroic 92-95% width & clean clearance above bottom rule banner!
      pitchDeg = 30.2;
      fovDeg = 39.5;
      maxAllowedNdcX = 0.948;
      topReservedPx = 62;
      bottomReservedPx = 98;
      topSafePct = Math.max(0.155, (topReservedPx + 104) / h);
      bottomSafePct = Math.max(0.096, bottomReservedPx / h);
      targetCenterYPct = 0.532;
    } else if (isTabletLandscape) {
      // Tablet Landscape (`1024x768`, `1180x820`):
      pitchDeg = 28.2;
      fovDeg = 43.5;
      maxAllowedNdcX = 0.925;
      topReservedPx = 60;
      bottomReservedPx = 42;
      topSafePct = Math.max(0.19, (topReservedPx + 88) / h);
      bottomSafePct = Math.max(0.055, bottomReservedPx / h);
      targetCenterYPct = 0.575;
    } else if (isWidePhoneLandscape) {
      // Mobile Phone Landscape (`844x390`, `932x430`): Zoom close while clearing top 48px bar & bottom 36px announcer strip!
      pitchDeg = 31.6;
      fovDeg = 39.5;
      maxAllowedNdcX = 0.935;
      topReservedPx = 46;
      bottomReservedPx = 42;
      topSafePct = Math.max(0.138, (topReservedPx + 6) / h);
      bottomSafePct = Math.max(0.112, bottomReservedPx / h);
      targetCenterYPct = 0.514;
    } else {
      // Desktop Widescreen (`1440x900`, `1920x1080`):
      pitchDeg = 27.2;
      fovDeg = THREE.MathUtils.clamp(46.0 - (aspect - 1.6) * 2.5, 43.5, 47.0);
      maxAllowedNdcX = 0.875;
      topReservedPx = 64;
      bottomReservedPx = 44;
      topSafePct = Math.max(0.21, (topReservedPx + 120) / h);
      bottomSafePct = Math.max(0.055, bottomReservedPx / h);
      targetCenterYPct = 0.58;
    }

    const maxAllowedNdcY = 1 - 2 * topSafePct;
    const minAllowedNdcY = -1 + 2 * bottomSafePct;

    const theta = THREE.MathUtils.degToRad(pitchDeg);
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(fovDeg * 0.5));

    const projectHull = (camY: number, camZ: number) => {
      let minNdcX = Infinity;
      let maxNdcX = -Infinity;
      let minNdcY = Infinity;
      let maxNdcY = -Infinity;

      for (let i = 0; i < points.length; i++) {
        const [px, py, pz] = points[i];
        const d = camZ - pz;
        const hDiff = camY - py;
        const zEye = Math.max(0.35, d * cosT + hDiff * sinT);
        const yEye = d * sinT - hDiff * cosT;
        const ndcX = px / (zEye * tanHalfFov * aspect);
        const ndcY = yEye / (zEye * tanHalfFov);
        if (ndcX < minNdcX) minNdcX = ndcX;
        if (ndcX > maxNdcX) maxNdcX = ndcX;
        if (ndcY < minNdcY) minNdcY = ndcY;
        if (ndcY > maxNdcY) maxNdcY = ndcY;
      }
      return { minNdcX, maxNdcX, minNdcY, maxNdcY };
    };

    const anchorY = hull.centerY;
    const anchorZ = hull.centerZ;

    let loDist = 1.85;
    let hiDist = 14.0;
    for (let iter = 0; iter < 30; iter++) {
      const midDist = (loDist + hiDist) * 0.5;
      const testCamY = Math.max(0.85, anchorY + midDist * sinT);
      const testCamZ = anchorZ + midDist * cosT;
      const b = projectHull(testCamY, testCamZ);

      const fitsWidth = Math.max(Math.abs(b.minNdcX), Math.abs(b.maxNdcX)) <= maxAllowedNdcX;
      const fitsTop = b.maxNdcY <= maxAllowedNdcY;
      const fitsBottom = b.minNdcY >= minAllowedNdcY;

      if (fitsWidth && fitsTop && fitsBottom) {
        hiDist = midDist;
      } else {
        loDist = midDist;
      }
    }

    const dist = hiDist;
    let finalCamY = Math.max(0.85, anchorY + dist * sinT);
    let finalCamZ = anchorZ + dist * cosT;
    let bounds = projectHull(finalCamY, finalCamZ);

    // Clean perpendicular screen-Y shift to center the Tote Board smoothly inside the safe aperture
    const desiredCenterNdcY = 1 - 2 * targetCenterYPct;
    for (let pass = 0; pass < 4; pass++) {
      const currentCenterNdcY = (bounds.maxNdcY + bounds.minNdcY) * 0.5;
      const deltaNdcY = desiredCenterNdcY - currentCenterNdcY;
      if (Math.abs(deltaNdcY) < 0.01) break;
      const shiftPerp = -deltaNdcY * dist * tanHalfFov * 0.62;
      const candY = Math.max(0.85, finalCamY + shiftPerp * cosT);
      const candZ = finalCamZ - shiftPerp * sinT;
      const candBounds = projectHull(candY, candZ);
      if (
        candBounds.maxNdcY <= maxAllowedNdcY + 0.008 &&
        candBounds.minNdcY >= minAllowedNdcY - 0.008 &&
        Math.max(Math.abs(candBounds.minNdcX), Math.abs(candBounds.maxNdcX)) <= maxAllowedNdcX + 0.008
      ) {
        finalCamY = candY;
        finalCamZ = candZ;
        bounds = candBounds;
      }
    }

    this.currentPitchDeg = pitchDeg;
    this.solvedDistance = dist;
    this.isPhonePortraitViewport = isPhonePortrait;
    this.baseCameraPos.set(0, finalCamY, finalCamZ);
    this.baseLookAt.set(0, finalCamY - dist * sinT, finalCamZ - dist * cosT);

    this.camera.fov = fovDeg;
    this.camera.aspect = aspect;
    this.applyZoomAndPanToCamera();

    // Auto-position Layer 1 Lateral Wing Trusses & "ON THE AIR · IN LIVING COLOR" Crown Sign!
    const wingZ = -5.2;
    const wingEyeZ = Math.max(2.0, (finalCamZ - wingZ) * cosT + (finalCamY - 1.8) * sinT);
    const wingHalfSpanX = wingEyeZ * tanHalfFov * aspect * 0.985;
    this.activeStageWorld?.setWingSpanX(wingHalfSpanX, wingZ);
    this.activeStageWorld?.setPortraitFraming?.(isPortrait, aspect, h);

    // Solve exact world Y at z = -4.46 so the glowing "ON THE AIR · IN LIVING COLOR" sign sits
    // cleanly right beneath the top score strip and just above the Tote Board top edge!
    const boardMinYPct = (0.5 - bounds.maxNdcY * 0.5) * 100;
    const topHudPct = (topReservedPx / h) * 100;
    const idealSignYPct = THREE.MathUtils.clamp(
      topHudPct + Math.max(4.5, (boardMinYPct - topHudPct) * 0.46),
      topHudPct + 3.2,
      Math.max(topHudPct + 4.0, boardMinYPct - 3.0),
    );
    const targetSignNdcY = 1 - 2 * (idealSignYPct / 100);
    const signZ = -4.46;
    const dSign = finalCamZ - signZ;
    // Solve yEye / (zEye * tanHalfFov) = targetSignNdcY for hDiff = finalCamY - signY:
    // dSign*sinT - hDiff*cosT = k * (dSign*cosT + hDiff*sinT) => hDiff = dSign*(sinT - k*cosT)/(cosT + k*sinT)
    const kSign = targetSignNdcY * tanHalfFov;
    const denom = Math.max(0.25, cosT + kSign * sinT);
    const hDiffSign = (dSign * (sinT - kSign * cosT)) / denom;
    const solvedSignY = finalCamY - hDiffSign;
    this.activeStageWorld?.setMarqueeCrownY?.(solvedSignY);

    const fitResult: FrustumFitResultV7 = {
      width: w,
      height: h,
      aspect,
      fovDeg,
      pitchDeg,
      cameraPos: [0, finalCamY, finalCamZ],
      lookAtTarget: [this.baseLookAt.x, this.baseLookAt.y, this.baseLookAt.z],
      boardScreenBoundsPct: {
        minX: Number(((bounds.minNdcX * 0.5 + 0.5) * 100).toFixed(1)),
        maxX: Number(((bounds.maxNdcX * 0.5 + 0.5) * 100).toFixed(1)),
        minY: Number(((0.5 - bounds.maxNdcY * 0.5) * 100).toFixed(1)),
        maxY: Number(((0.5 - bounds.minNdcY * 0.5) * 100).toFixed(1)),
      },
    };
    this.lastFitResult = fitResult;
    return fitResult;
  }

  public getLastFrustumFit(): FrustumFitResultV7 | null {
    return this.lastFitResult;
  }

  // --------------------------------------------------------------------------
  // Interactive User Camera Zoom (`0.75x .. 2.40x`) & Smooth Drag-to-Pan
  // --------------------------------------------------------------------------

  public setUserZoom(zoom: number): number {
    this.targetUserZoom = THREE.MathUtils.clamp(zoom, 0.75, 2.4);
    if (this.targetUserZoom <= 1.01 && this.targetUserZoom >= 0.99) {
      this.targetPanX = 0;
      this.targetPanZ = 0;
    } else {
      this.clampPanTargets();
    }
    return this.targetUserZoom;
  }

  public adjustUserZoom(delta: number): number {
    return this.setUserZoom(Number((this.targetUserZoom + delta).toFixed(2)));
  }

  public getUserZoom(): number {
    return this.targetUserZoom;
  }

  public resetCameraZoomAndPan(): number {
    this.targetUserZoom = 1.0;
    this.targetPanX = 0;
    this.targetPanZ = 0;
    return 1.0;
  }

  /**
   * Subtle, seasickness-free RCA TK-41 Studio Pedestal Camera Push-In (~4% default)
   * toward an active clue tile, TV twist, or Rival turn. Bypassed when `reducedMotion === true`.
   */
  public focusBoardPoint(worldX = 0, worldZ = 0, zoomBoost = 0.04): void {
    if (this.reducedMotion) {
      this.targetFocusX = 0;
      this.targetFocusZ = 0;
      this.targetFocusZoomBoost = 0;
      return;
    }
    const maxShiftX = this.isPhonePortraitViewport ? 0.08 : 0.24;
    const maxShiftZ = this.isPhonePortraitViewport ? 0.08 : 0.2;
    this.targetFocusX = THREE.MathUtils.clamp(worldX * 0.16, -maxShiftX, maxShiftX);
    this.targetFocusZ = THREE.MathUtils.clamp(worldZ * 0.14, -maxShiftZ, maxShiftZ);
    this.targetFocusZoomBoost = THREE.MathUtils.clamp(zoomBoost, -0.04, 0.08);
  }

  public clearBoardFocus(): void {
    this.targetFocusX = 0;
    this.targetFocusZ = 0;
    this.targetFocusZoomBoost = 0;
  }

  public resetBoardFocus(): void {
    this.clearBoardFocus();
  }

  public panBoardCameraByPixels(deltaPxX: number, deltaPxY: number): void {
    const w = Math.max(1, this.container.clientWidth || 390);
    const h = Math.max(1, this.container.clientHeight || 660);
    const effectiveDist = this.solvedDistance / Math.max(0.75, this.currentUserZoom);
    const fovRad = THREE.MathUtils.degToRad(this.camera.fov);
    const worldHeight = 2 * effectiveDist * Math.tan(fovRad * 0.5);
    const worldWidth = worldHeight * (w / h);

    this.targetPanX -= (deltaPxX / w) * worldWidth * 0.95;
    this.targetPanZ -= (deltaPxY / h) * worldHeight * 1.15;
    this.clampPanTargets();
  }

  private clampPanTargets(): void {
    const maxPanX = this.targetUserZoom < 1.0 ? 0.65 : 1.85;
    const maxPanZ = this.targetUserZoom < 1.0 ? 0.45 : 1.12;
    this.targetPanX = THREE.MathUtils.clamp(this.targetPanX, -maxPanX, maxPanX);
    this.targetPanZ = THREE.MathUtils.clamp(this.targetPanZ, -maxPanZ, maxPanZ);
  }

  private applyZoomAndPanToCamera(): void {
    const effectiveZoom = Math.max(
      0.75,
      this.currentUserZoom * (1 + (this.reducedMotion ? 0 : this.currentFocusZoomBoost)),
    );
    const dir = new THREE.Vector3().subVectors(this.baseCameraPos, this.baseLookAt);
    const scaledDir = dir.multiplyScalar(1 / effectiveZoom);

    // Subtle 1966 RCA TK-41 hydraulic pedestal idle breathing (±0.03m at 0.18Hz, zero seasickness!)
    let breatheX = 0;
    let breatheY = 0;
    if (!this.reducedMotion && this.elapsedSec > 0) {
      const amp = this.isPhonePortraitViewport ? 0.012 : 0.028;
      const omega = Math.PI * 2 * 0.18;
      breatheX = Math.sin(this.elapsedSec * omega) * amp;
      breatheY = Math.cos(this.elapsedSec * omega * 0.86) * (amp * 0.65);
    }

    const focusX = this.reducedMotion ? 0 : this.currentFocusX;
    const focusZ = this.reducedMotion ? 0 : this.currentFocusZ;

    const lookX = this.baseLookAt.x + this.currentPanX + focusX;
    const lookY = this.baseLookAt.y;
    const lookZ = this.baseLookAt.z + this.currentPanZ + focusZ;

    this.camera.position.set(
      lookX + scaledDir.x + breatheX,
      Math.max(0.85, lookY + scaledDir.y + breatheY),
      lookZ + scaledDir.z,
    );
    this.camera.lookAt(lookX + breatheX * 0.35, lookY, lookZ);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }

  // --------------------------------------------------------------------------
  // Stage Switching, Coup Regimes & Split-Uniform Card Dimming
  // --------------------------------------------------------------------------

  public setStageWorld(stageId: StageWorldIdV7, season: SeasonIdV7 = 1): StageWorldSpecV7 {
    const prevRegime = this.activeStageWorld?.getActiveCoupRegime() ?? 'NONE';
    if (this.activeStageWorld) {
      this.scene.remove(this.activeStageWorld.root);
      this.activeStageWorld.dispose();
      this.activeStageWorld = null;
    }

    this.activeStageId = stageId;
    this.activeSeason = season === 2 || season === 3 || season === 4 ? season : 1;
    const built = buildStageWorldV7(stageId, this.sharedEnvMap, this.activeSeason);
    const spec = built.spec;
    built.setReducedMotion?.(this.reducedMotion);
    this.activeStageWorld = built;
    this.scene.add(built.root);

    // Sync scene backdrop & 1966 Living Color warm/cool dual-rim lighting rig cleanly!
    this.scene.background = new THREE.Color(spec.cycBaseHex);
    this.keyLight.color.setHex(spec.keyLightHex);
    this.rimLight.color.setHex(spec.coveLightHex);
    this.warmRimLight.color.set(spec.trimAccentHex);
    this.hemiLight.groundColor.setHex(spec.floorBaseHex).lerp(new THREE.Color(spec.cycBaseHex), 0.35);
    this.ambientLight.color.setHex(spec.cycBaseHex).lerp(new THREE.Color(0xfff0d4), 0.35);

    built.setApertureDimFactor(this.currentApertureDim);
    if (prevRegime !== 'NONE') {
      built.setCoupRegime(prevRegime);
    }

    if (this.lastFitResult) {
      this.fitBoardToViewport(this.lastFitResult.width, this.lastFitResult.height);
    }

    this.applySceneLightDimming();
    return spec;
  }

  public getSeasonId(): SeasonIdV7 {
    return this.activeSeason;
  }

  public getActiveStageWorld(): BuiltStageWorldV7 | null {
    return this.activeStageWorld;
  }

  public setCoupRegime(regime: CoupRegimeIdV7): void {
    this.activeStageWorld?.setCoupRegime(regime);
    if (regime === 'REGIME_B_BELLAMY_UHF') {
      this.scene.background = new THREE.Color(0x4a2440);
    } else if (regime === 'REGIME_C_VERA_FORENSIC') {
      this.scene.background = new THREE.Color(0x544434);
    } else if (regime === 'REGIME_A_ROZ_PHARMA') {
      this.scene.background = new THREE.Color(0x006c78);
    } else {
      const cycHex =
        this.activeSeason === 1
          ? STAGE_WORLD_SPECS_V7[this.activeStageId].cycBaseHex
          : SEASON_STAGE_OVERRIDES_V9[this.activeSeason].cycBaseHex;
      this.scene.background = new THREE.Color(cycHex);
    }
  }

  /**
   * Split-Uniform Card Dimming:
   * Smoothly tweens stage & board lighting exposure `-55%` (`0.45`) in `150ms`
   * (`0px` CSS blur!) while keeping Row-C Glint, Solenoid Spark, and Fresnel Lamp
   * at `100%` HDR luminance!
   */
  public setCardApertureOpen(open: boolean): void {
    this.cardApertureOpen = open;
    this.targetApertureDim = open ? 0.45 : 1.0;
    if (open && !this.reducedMotion && this.targetFocusZoomBoost < 0.01) {
      this.targetFocusZoomBoost = 0.038;
    } else if (!open) {
      this.clearBoardFocus();
    }
  }

  private applySceneLightDimming(): void {
    const d = this.currentApertureDim;
    this.keyLight.intensity = this.baseKeyIntensity * d;
    this.rimLight.intensity = this.baseRimIntensity * d;
    this.warmRimLight.intensity = this.baseWarmRimIntensity * d;
    this.fillLight.intensity = this.baseFillIntensity * d;
    this.hemiLight.intensity = this.baseHemiIntensity * d;
    this.ambientLight.intensity = this.baseAmbientIntensity * d;
    this.scene.environmentIntensity = this.baseEnvIntensity * d;
    this.activeStageWorld?.setApertureDimFactor(d);
  }

  // --------------------------------------------------------------------------
  // Live Booth Cheat Tells & VIP Jury Controls
  // --------------------------------------------------------------------------

  public triggerRowCGlint(active: boolean): void {
    this.activeStageWorld?.triggerRowCGlint(active);
  }

  public triggerFresnelTell(isRubySpite = false): void {
    this.activeStageWorld?.triggerFresnelTell(isRubySpite);
  }

  public setVipJuryState(boonActive: boolean, baneActive: boolean): void {
    this.activeStageWorld?.setVipJuryState(boonActive, baneActive);
  }

  public triggerSolenoidSpark(
    origin: THREE.Vector3 | [number, number, number],
    count = 28,
  ): void {
    this.solenoidSparks.emit(origin, count);
  }

  /**
   * Blinks the upper-proscenium 3D backlit `APPLAUSE` studio lightbox sign in warm
   * neon amber & crimson on streaks, cheers, Secret Squares, and jackpots!
   */
  public triggerStudioApplauseSign(durationSec = 2.4): void {
    this.setReactiveSignState('APPLAUSE', true, Math.max(0.6, durationSec) * 1000);
  }

  public setReactiveSignState(
    signId: ReactiveSignIdV9,
    active: boolean,
    durationMs?: number,
  ): void {
    this.activeStageWorld?.setReactiveSignState(signId, active, durationMs);
  }

  public getStudioSignStates(): Partial<Record<ReactiveSignIdV9, boolean>> {
    return (
      this.activeStageWorld?.getStudioSignStates() ?? {
        ON_THE_AIR: true,
        APPLAUSE: false,
        LAUGH: false,
        JACKPOT: false,
      }
    );
  }

  public setCrowdMood(mood: CrowdMoodV9, durationMs?: number): void {
    this.activeStageWorld?.setCrowdMood(mood, durationMs);
  }

  public getCrowdMood(): CrowdMoodV9 {
    return this.activeStageWorld?.getCrowdMood() ?? 'IDLE';
  }

  // --------------------------------------------------------------------------
  // Pointer Raycasting (`pickInteractiveTarget`)
  // --------------------------------------------------------------------------

  public pickInteractiveTarget(
    clientX: number,
    clientY: number,
  ): StageInteractiveHitV7 | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    this.pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);

    const rowCCollider = this.activeStageWorld?.getRowCColliderMesh();
    if (rowCCollider) {
      const hits = this.raycaster.intersectObject(rowCCollider, false);
      if (hits.length > 0) {
        return { kind: 'ROW_C_GLINT' };
      }
    }
    return null;
  }

  public raycastObjects(
    clientX: number,
    clientY: number,
    targets: THREE.Object3D[],
    recursive = true,
  ): THREE.Intersection[] {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return [];
    this.pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    return this.raycaster.intersectObjects(targets, recursive);
  }

  // --------------------------------------------------------------------------
  // Resize, Settings, Frame Loop & Telemetry
  // --------------------------------------------------------------------------

  public applySettings(settings: Partial<BroadcastSettingsV7>): void {
    if (typeof settings.reducedMotion === 'boolean') {
      this.reducedMotion = settings.reducedMotion;
      this.activeStageWorld?.setReducedMotion?.(this.reducedMotion);
      if (this.reducedMotion) {
        this.clearBoardFocus();
        this.currentFocusX = 0;
        this.currentFocusZ = 0;
        this.currentFocusZoomBoost = 0;
        this.applyZoomAndPanToCamera();
      }
    }
  }

  public resize(width: number, height: number): void {
    if (this.isDisposed || this.renderer.getContext()?.isContextLost?.()) return;
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    const dpr = this.computeSafeDpr();

    this.lastCanvasCssW = w;
    this.lastCanvasCssH = h;
    this.lastAppliedDpr = dpr;

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.renderer.setViewport(0, 0, w, h);
    this.renderer.setScissorTest(false);
    this.solenoidSparks.setPixelRatio(dpr);

    this.fitBoardToViewport(w, h);
  }

  public addFrameListener(listener: StageFrameListenerV7): () => void {
    this.frameListeners.add(listener);
    return () => {
      this.frameListeners.delete(listener);
    };
  }

  public start(): void {
    if (this.isDisposed || this.rafId !== null) return;
    this.lastNowMs = performance.now();
    const loop = (nowMs: number) => {
      if (this.isDisposed) return;
      this.rafId = requestAnimationFrame(loop);
      const dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastNowMs) * 0.001));
      this.lastNowMs = nowMs;
      this.renderFrameNow(dt);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  public stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public renderFrameNow(dtSec = 1 / 60): void {
    if (this.isDisposed || this.renderer.getContext()?.isContextLost?.()) return;

    // Synchronous pre-render DPR & viewport guard prevents any `3x3` tiled frame across DPR / resize switches!
    const curW = Math.max(
      1,
      Math.floor(
        this.container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : this.lastCanvasCssW || 1),
      ),
    );
    const curH = Math.max(
      1,
      Math.floor(
        this.container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : this.lastCanvasCssH || 1),
      ),
    );
    const curDpr = this.computeSafeDpr();
    if (
      curW !== this.lastCanvasCssW ||
      curH !== this.lastCanvasCssH ||
      Math.abs(curDpr - this.lastAppliedDpr) > 0.001
    ) {
      this.resize(curW, curH);
    }

    const dt = Math.min(0.05, Math.max(0, dtSec));
    this.elapsedSec += dt;

    this.fpsAccumSec += dt;
    this.fpsFrames++;
    if (this.fpsAccumSec >= 0.5) {
      this.currentFps = Math.round(this.fpsFrames / this.fpsAccumSec);
      this.fpsAccumSec = 0;
      this.fpsFrames = 0;
    }

    if (Math.abs(this.currentApertureDim - this.targetApertureDim) > 0.0005) {
      const maxStep = (0.55 / 0.15) * (dt > 0 ? dt : 1 / 60);
      if (this.currentApertureDim < this.targetApertureDim) {
        this.currentApertureDim = Math.min(this.targetApertureDim, this.currentApertureDim + maxStep);
      } else {
        this.currentApertureDim = Math.max(this.targetApertureDim, this.currentApertureDim - maxStep);
      }
      this.applySceneLightDimming();
    }

    // Auto-bridge celebration & focus cues emitted by InteractiveBoard3DControllerV7 on boardMount.userData
    const boardUd = this.boardMount.userData as {
      __wsApplausePulseSec?: number;
      __wsFocusHint?: { x: number; z: number; zoomBoost: number; clear?: boolean } | null;
    };
    if (boardUd.__wsApplausePulseSec && boardUd.__wsApplausePulseSec > 0) {
      const dur = boardUd.__wsApplausePulseSec;
      boardUd.__wsApplausePulseSec = 0;
      this.triggerStudioApplauseSign(dur);
    }
    if (boardUd.__wsFocusHint) {
      const hint = boardUd.__wsFocusHint;
      boardUd.__wsFocusHint = null;
      if (hint.clear) {
        if (!this.cardApertureOpen) this.clearBoardFocus();
      } else {
        this.focusBoardPoint(hint.x, hint.z, hint.zoomBoost);
      }
    }

    const lerpAlpha = Math.min(1, (dt > 0 ? dt : 1 / 60) * 14);
    const focusAlpha = 1 - Math.exp(-(dt > 0 ? dt : 1 / 60) * 5.8);
    this.currentUserZoom += (this.targetUserZoom - this.currentUserZoom) * lerpAlpha;
    this.currentPanX += (this.targetPanX - this.currentPanX) * lerpAlpha;
    this.currentPanZ += (this.targetPanZ - this.currentPanZ) * lerpAlpha;
    this.currentFocusX += (this.targetFocusX - this.currentFocusX) * focusAlpha;
    this.currentFocusZ += (this.targetFocusZ - this.currentFocusZ) * focusAlpha;
    this.currentFocusZoomBoost +=
      (this.targetFocusZoomBoost - this.currentFocusZoomBoost) * focusAlpha;

    if (
      !this.reducedMotion ||
      Math.abs(this.currentUserZoom - this.targetUserZoom) > 0.0002 ||
      Math.abs(this.currentPanX - this.targetPanX) > 0.0002 ||
      Math.abs(this.currentPanZ - this.targetPanZ) > 0.0002 ||
      Math.abs(this.currentFocusZoomBoost) > 0.0002
    ) {
      this.applyZoomAndPanToCamera();
    }

    this.activeStageWorld?.update(dt, this.elapsedSec);
    this.solenoidSparks.update(dt);

    for (const listener of this.frameListeners) {
      listener(dt, this.elapsedSec);
    }

    if (this.isDisposed || this.renderer.getContext()?.isContextLost?.()) return;

    // Direct hardware WebGL2 4x MSAA render -> zero EffectComposer FBO [0,0,0] drops or bloom strobes!
    this.renderer.render(this.scene, this.camera);
  }

  public getTelemetry(): StageEngineTelemetryV7 {
    return {
      fps: this.currentFps,
      effectiveDpr: this.renderer.getPixelRatio(),
      isWebGL2: this.renderer.capabilities.isWebGL2,
      activeStageId: this.activeStageId,
      activeSeason: this.activeSeason,
      activeCoupRegime: this.activeStageWorld?.getActiveCoupRegime() ?? 'NONE',
      cameraPitchDeg: this.currentPitchDeg,
      cameraY: Number(this.camera.position.y.toFixed(3)),
      apertureDimFactor: Number(this.currentApertureDim.toFixed(3)),
      cardApertureOpen: this.cardApertureOpen,
      bloomThreshold: 1.15,
      bloomStrength: 0.4,
      userZoom: Number(this.currentUserZoom.toFixed(2)),
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
    };
  }

  public getMemoryTelemetry(): { geometries: number; textures: number; programs: number } {
    return {
      geometries: this.renderer.info.memory.geometries,
      textures: this.renderer.info.memory.textures,
      programs: this.renderer.info.programs?.length ?? 0,
    };
  }

  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.stop();

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onWindowResizeBound);
    }
    this.resizeObserver?.disconnect();
    this.frameListeners.clear();
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLostBound);

    if (this.activeStageWorld) {
      this.scene.remove(this.activeStageWorld.root);
      this.activeStageWorld.dispose();
      this.activeStageWorld = null;
    }

    this.solenoidSparks.dispose();
    disposeObject3DTree(this.boardMount);
    disposeObject3DTree(this.toyMount);
    disposeObject3DTree(this.trophyMount);

    this.sharedEnvRT.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
