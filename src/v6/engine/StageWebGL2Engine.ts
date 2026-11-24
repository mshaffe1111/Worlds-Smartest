// ============================================================================
// WORLD'S SMARTEST v6.0 — Ultra-HD Three.js 0.172 WebGL2 PBR Stage Engine
// True Ultra-HD `devicePixelRatio` up to 3.0 (`ResolutionTierV6`), Per-Stage
// Procedural HDRI Studio Lightbox (`PMREMGenerator`), `PCFSoftShadowMap`
// (up to 2048x2048), ACESFilmic Tone Mapping, 10 Living Stage Worlds,
// Spring-Damped 8-Zone Camera Director & Shared GPU Spark Emitter!
// ============================================================================

import * as THREE from 'three';
import type {
  BroadcastOptionsStateV6,
  CameraMotionModeV6,
  CameraStageZoneV6,
  ResolutionTierV6,
  ShadowQualityV6,
  StageAtmosphereThemeV6,
  StageWorldIdV6,
} from '../contracts_v6';
import { CameraDirectorV6 } from './CameraDirectorV6';
import {
  createPresenterPodiumMesh,
  disposeObject3DTree,
  GpuSparkBurst,
  type PresenterPodiumHandleV6,
} from './HorologyCADKit';
import {
  applyStageHudThemeCssVars,
  getStageThemeV6,
  getStageVisualRecipeV6,
  type StageEngineVisualRecipeV6,
} from './StageThemesCatalogV6';
import {
  buildStageWorldArchitectureV6,
  type BuiltStageWorldV6,
} from './StageWorldArchitecturesV6';

export interface StageWebGL2EngineConfigV6 {
  container: HTMLElement;
  initialStage?: StageWorldIdV6;
  initialZone?: CameraStageZoneV6;
  resolutionTier?: ResolutionTierV6;
  shadowQuality?: ShadowQualityV6;
  cameraMotion?: CameraMotionModeV6;
  /** Whether to automatically mirror active `StageAtmosphereThemeV6.hudTheme` to CSS vars. */
  syncHudThemeVars?: boolean;
  /** Optional WebGL preserveDrawingBuffer (default false for optimal mobile perf). */
  preserveDrawingBuffer?: boolean;
}

export interface StageEngineTelemetryV6 {
  fps: number;
  effectiveDpr: number;
  resolutionTier: ResolutionTierV6;
  shadowQuality: ShadowQualityV6;
  activeStage: StageWorldIdV6;
  activeZone: CameraStageZoneV6;
  drawCalls: number;
  triangles: number;
  isWebGL2: boolean;
}

export type StageFrameListenerV6 = (dtSec: number, elapsedSec: number) => void;

export class StageWebGL2Engine {
  public readonly container: HTMLElement;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly cameraDirector: CameraDirectorV6;
  public readonly sparks: GpuSparkBurst;

  // Clean isolated mount anchors for peer v6 subsystems (Boards, Toys, Trophies, Relics)
  public readonly boardMount: THREE.Group;
  public readonly toyMount: THREE.Group;
  public readonly trophyMount: THREE.Group;
  public readonly relicMount: THREE.Group;
  public readonly presenterPodium: PresenterPodiumHandleV6;
  private podiumManualOverride: boolean | null = null;

  private readonly pmremGenerator: THREE.PMREMGenerator;
  private readonly envCache = new Map<StageWorldIdV6, THREE.WebGLRenderTarget>();

  // Core studio light rig re-tuned seamlessly per Stage World
  private readonly keyLight: THREE.DirectionalLight;
  private readonly rimLight: THREE.DirectionalLight;
  private readonly fillLight: THREE.DirectionalLight;
  private readonly hemiLight: THREE.HemisphereLight;
  private readonly ambientLight: THREE.AmbientLight;

  private activeStageWorld: BuiltStageWorldV6 | null = null;
  private activeStageId: StageWorldIdV6;
  private activeTheme: StageAtmosphereThemeV6;
  private resolutionTier: ResolutionTierV6;
  private shadowQuality: ShadowQualityV6;
  private syncHudThemeVars: boolean;

  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerVec = new THREE.Vector2();
  private readonly frameListeners = new Set<StageFrameListenerV6>();

  private rafId: number | null = null;
  private lastTimestampMs = 0;
  private elapsedSec = 0;
  private fpsAccumSec = 0;
  private fpsFrames = 0;
  private currentFps = 60;
  private isDisposed = false;

  private readonly resizeObserver: ResizeObserver | null = null;
  private readonly onWindowResizeBound: () => void;
  private readonly onPointerMoveBound: (e: PointerEvent) => void;

  constructor(config: StageWebGL2EngineConfigV6) {
    this.container = config.container;
    this.activeStageId = config.initialStage ?? 'STAGE_01_VAUDEVILLE_PALACE';
    this.activeTheme = getStageThemeV6(this.activeStageId);
    this.resolutionTier = config.resolutionTier ?? 'ULTRA_3X';
    this.shadowQuality = config.shadowQuality ?? 'ULTRA_2048';
    this.syncHudThemeVars = config.syncHudThemeVars ?? true;

    // 1. Initialize Ultra-HD WebGL2 Renderer with ACESFilmic Tone Mapping & PCFSoft Shadows
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: config.preserveDrawingBuffer ?? false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = this.shadowQuality !== 'OFF';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.touchAction = 'none';
    this.container.appendChild(this.renderer.domElement);

    // 2. Scene, Camera & Spring-Damped CameraDirectorV6
    this.scene = new THREE.Scene();
    const width = Math.max(1, this.container.clientWidth || window.innerWidth);
    const height = Math.max(1, this.container.clientHeight || window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 120);
    this.cameraDirector = new CameraDirectorV6(this.camera, {
      onTrapdoorOpenRequested: (open) => {
        this.activeStageWorld?.setTrapdoorOpen(open);
      },
    });
    if (config.cameraMotion) {
      this.cameraDirector.setMotionMode(config.cameraMotion);
    }

    // 3. Dedicated PMREMGenerator for Per-Stage Procedural Studio HDRI Environments
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    // 4. Calibrated 5-Light Theatrical PBR Rig
    this.keyLight = new THREE.DirectionalLight(0xffe0b2, 3.0);
    this.keyLight.castShadow = this.shadowQuality !== 'OFF';
    this.keyLight.shadow.camera.near = 0.8;
    this.keyLight.shadow.camera.far = 28;
    this.keyLight.shadow.camera.left = -7.8;
    this.keyLight.shadow.camera.right = 7.8;
    this.keyLight.shadow.camera.top = 7.8;
    this.keyLight.shadow.camera.bottom = -7.8;
    this.keyLight.shadow.bias = -0.00045;
    this.keyLight.shadow.normalBias = 0.025;
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0xff8a54, 1.5);
    this.scene.add(this.rimLight);

    this.fillLight = new THREE.DirectionalLight(0x7aa4d6, 0.9);
    this.scene.add(this.fillLight);

    this.hemiLight = new THREE.HemisphereLight(0xfff0dd, 0x2b1b16, 0.75);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0x2d1a1c, 0.35);
    this.scene.add(this.ambientLight);

    // 5. Subsystem Mount Groups positioned strictly inside the Sacred Gameplay Clear-Zone
    this.boardMount = new THREE.Group();
    this.boardMount.name = 'V6_BoardMount';
    this.boardMount.position.set(0, 0.04, 0);

    this.toyMount = new THREE.Group();
    this.toyMount.name = 'V6_ToyMount';
    this.toyMount.position.set(0, 0.45, 0);

    this.trophyMount = new THREE.Group();
    this.trophyMount.name = 'V6_TrophyMount';
    this.trophyMount.position.set(0, 0.16, 0);

    this.relicMount = new THREE.Group();
    this.relicMount.name = 'V6_RelicMount';
    this.relicMount.position.set(0, 0.32, 0);

    this.scene.add(this.boardMount, this.toyMount, this.trophyMount, this.relicMount);

    // 5b. Built-in Sculpted Brushed-Brass & Obsidian Presenter Podium (Hero in Lobby & Victory zones)
    this.presenterPodium = createPresenterPodiumMesh({
      trimMetalHex: this.activeTheme.materials.trimMetalHex,
      accentJewelHex: this.activeTheme.materials.jewelPrimaryHex,
      scale: 1.05,
    });
    this.presenterPodium.group.position.set(0, 0.01, 0.35);
    this.scene.add(this.presenterPodium.group);

    // 6. Shared GPU Ballistic Spark Emitter
    this.sparks = new GpuSparkBurst(360);
    this.scene.add(this.sparks.points);

    // 7. Apply Resolution, Shadow Tier, Initial Stage World & Camera Zone
    this.applyResolutionTier(this.resolutionTier);
    this.applyShadowQuality(this.shadowQuality);
    this.resize(width, height);
    this.setStageWorld(this.activeStageId);
    const startZone = config.initialZone ?? 'LOBBY_PROSCENIUM';
    this.cameraDirector.setZone(startZone, { immediate: true });
    this.syncPodiumVisibility(startZone);

    // 8. Responsive Resize & Pointer Parallax Listeners
    this.onWindowResizeBound = () => this.handleResize();
    this.onPointerMoveBound = (e: PointerEvent) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      this.cameraDirector.setPointerParallax(nx, ny);
    };

    window.addEventListener('resize', this.onWindowResizeBound);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMoveBound, {
      passive: true,
    });
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.container);
    }
  }

  // --------------------------------------------------------------------------
  // Procedural Per-Stage Studio HDRI Environment Generator (`PMREMGenerator`)
  // --------------------------------------------------------------------------

  private getOrBakeStageHdri(stageId: StageWorldIdV6): THREE.Texture {
    const cached = this.envCache.get(stageId);
    if (cached) return cached.texture;

    const recipe = getStageVisualRecipeV6(stageId);
    const hdriScene = new THREE.Scene();

    // Matte architectural shell wall absorbs grazing bounce so specular strips pop!
    const shellGeom = new THREE.BoxGeometry(22, 16, 22);
    const shellMat = new THREE.MeshBasicMaterial({
      color: recipe.hdriWallColorHex,
      side: THREE.BackSide,
      toneMapped: false,
    });
    const shell = new THREE.Mesh(shellGeom, shellMat);
    shell.position.y = 4.5;
    hdriScene.add(shell);

    // Tinted floor bounce reflector card so underside metal chamfers pick up venue warmth
    const bounceGeom = new THREE.PlaneGeometry(20, 20);
    bounceGeom.rotateX(-Math.PI * 0.5);
    const bounceMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(recipe.hdriFloorBounceHex).multiplyScalar(1.35),
      toneMapped: false,
    });
    const bounceFloor = new THREE.Mesh(bounceGeom, bounceMat);
    bounceFloor.position.y = -3.4;
    hdriScene.add(bounceFloor);

    // High-HDR Emissive Studio Softboxes & Architectural Light Strips tailored uniquely per venue
    for (const em of recipe.hdriEmitters) {
      let geom: THREE.BufferGeometry;
      if (em.shape === 'DISC') {
        geom = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 24);
      } else if (em.shape === 'RING') {
        geom = new THREE.TorusGeometry(0.45, 0.08, 12, 32);
        geom.rotateX(Math.PI * 0.5);
      } else {
        geom = new THREE.BoxGeometry(1, 1, 1);
      }
      const hdrColor = new THREE.Color(em.colorHex).multiplyScalar(em.intensity);
      const mat = new THREE.MeshBasicMaterial({
        color: hdrColor,
        toneMapped: false,
      });
      const emitterMesh = new THREE.Mesh(geom, mat);
      emitterMesh.position.set(...em.position);
      if (em.rotation) emitterMesh.rotation.set(...em.rotation);
      emitterMesh.scale.set(...em.scale);
      hdriScene.add(emitterMesh);
    }

    const envRT = this.pmremGenerator.fromScene(hdriScene, 0.035);
    disposeObject3DTree(hdriScene);
    this.envCache.set(stageId, envRT);
    return envRT.texture;
  }

  // --------------------------------------------------------------------------
  // Stage Switching, Lighting, Options & Trapdoor Controls
  // --------------------------------------------------------------------------

  public setStageWorld(stageId: StageWorldIdV6): StageAtmosphereThemeV6 {
    const theme = getStageThemeV6(stageId);
    const recipe: StageEngineVisualRecipeV6 = getStageVisualRecipeV6(stageId);
    const prevTrapdoorOpen = this.activeStageWorld?.getTrapdoorOpenProgress() ?? 0;

    if (this.activeStageWorld) {
      this.scene.remove(this.activeStageWorld.root);
      this.activeStageWorld.dispose();
      this.activeStageWorld = null;
    }

    this.activeStageId = stageId;
    this.activeTheme = theme;

    // 1. Apply Stage-Specific Procedural HDRI IBL + Exposure + Exponential Fog
    this.scene.environment = this.getOrBakeStageHdri(stageId);
    this.scene.environmentIntensity = recipe.envMapIntensity;
    this.renderer.toneMappingExposure = recipe.exposure;
    this.scene.background = new THREE.Color(theme.lighting.skyTopHex);
    this.scene.fog = new THREE.FogExp2(theme.lighting.fogHex, theme.lighting.fogDensity);

    // 2. Re-tune 5-Light Theatrical Rig to Stage's Unique Mood & Color Temperature
    this.keyLight.color.setHex(theme.lighting.keyLightHex);
    this.keyLight.intensity = theme.lighting.keyIntensity;
    this.keyLight.position.set(...recipe.keyPosition);

    this.rimLight.color.setHex(theme.lighting.rimLightHex);
    this.rimLight.intensity = theme.lighting.rimIntensity;
    this.rimLight.position.set(...recipe.rimPosition);

    this.fillLight.color.setHex(recipe.fillLightHex);
    this.fillLight.intensity = recipe.fillIntensity;
    this.fillLight.position.set(...recipe.fillPosition);

    this.hemiLight.color.setHex(recipe.hemisphereSkyHex);
    this.hemiLight.groundColor.setHex(recipe.hemisphereGroundHex);
    this.hemiLight.intensity = recipe.hemisphereIntensity;

    this.ambientLight.color.setHex(theme.lighting.ambientHex);
    this.ambientLight.intensity = 0.42;

    // 3. Build & Mount the Monumental 3D Stage Architecture Set
    const built = buildStageWorldArchitectureV6(theme);
    this.activeStageWorld = built;
    this.scene.add(built.root);
    if (prevTrapdoorOpen > 0.5) {
      built.setTrapdoorOpen(true);
    }
    this.presenterPodium.setPalette(theme.materials.trimMetalHex, theme.materials.jewelPrimaryHex);

    if (this.syncHudThemeVars) {
      applyStageHudThemeCssVars(theme);
    }

    return theme;
  }

  public getActiveStageTheme(): StageAtmosphereThemeV6 {
    return this.activeTheme;
  }

  public getTrapdoorPitMount(): THREE.Group | null {
    return this.activeStageWorld?.trapdoorPitMount ?? null;
  }

  public setTrapdoorOpen(open: boolean): void {
    this.activeStageWorld?.setTrapdoorOpen(open);
  }

  public setCameraZone(
    zone: CameraStageZoneV6,
    options?: { immediate?: boolean; customLookOffset?: [number, number, number] }
  ): void {
    this.cameraDirector.setZone(zone, options);
    this.syncPodiumVisibility(zone);
  }

  /**
   * Explicitly overrides Presenter Podium visibility (pass `null` to restore automatic zone logic,
   * where the podium shines in `LOBBY_PROSCENIUM` and `VICTORY_PODIUM_CEREMONY`).
   */
  public setPresenterPodiumVisible(visible: boolean | null): void {
    this.podiumManualOverride = visible;
    this.syncPodiumVisibility(this.cameraDirector.getActiveZone());
  }

  private syncPodiumVisibility(zone: CameraStageZoneV6): void {
    if (this.podiumManualOverride !== null) {
      this.presenterPodium.group.visible = this.podiumManualOverride;
      return;
    }
    this.presenterPodium.group.visible =
      zone === 'LOBBY_PROSCENIUM' || zone === 'VICTORY_PODIUM_CEREMONY';
  }

  public emitSparks(
    origin: THREE.Vector3 | [number, number, number],
    count = 40,
    speed = 4.6
  ): void {
    this.sparks.emit(origin, count, speed);
  }

  public applyResolutionTier(tier: ResolutionTierV6): void {
    this.resolutionTier = tier;
    const nativeDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const cap = tier === 'ULTRA_3X' ? 3.0 : tier === 'HIGH_2X' ? 2.0 : 1.0;
    const effective = Math.min(nativeDpr, cap);
    this.renderer.setPixelRatio(effective);
    this.handleResize();
  }

  public applyShadowQuality(quality: ShadowQualityV6): void {
    this.shadowQuality = quality;
    const enabled = quality !== 'OFF';
    this.renderer.shadowMap.enabled = enabled;
    this.keyLight.castShadow = enabled;

    if (enabled) {
      const targetSize = quality === 'ULTRA_2048' ? 2048 : 1024;
      if (this.keyLight.shadow.mapSize.width !== targetSize) {
        this.keyLight.shadow.mapSize.set(targetSize, targetSize);
        if (this.keyLight.shadow.map) {
          this.keyLight.shadow.map.dispose();
          this.keyLight.shadow.map = null;
        }
      }
    }
    this.renderer.shadowMap.needsUpdate = true;
  }

  public applyBroadcastOptions(
    opts: Pick<BroadcastOptionsStateV6, 'resolutionTier' | 'shadowQuality' | 'cameraMotion'>
  ): void {
    this.applyResolutionTier(opts.resolutionTier);
    this.applyShadowQuality(opts.shadowQuality);
    this.cameraDirector.setMotionMode(opts.cameraMotion);
  }

  // --------------------------------------------------------------------------
  // Pointer Raycasting, Resize, Frame Loop & Telemetry
  // --------------------------------------------------------------------------

  public raycastClientPoint(
    clientX: number,
    clientY: number,
    targets: THREE.Object3D[]
  ): THREE.Intersection[] {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return [];
    this.pointerVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerVec.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    this.raycaster.setFromCamera(this.pointerVec, this.camera);
    return this.raycaster.intersectObjects(targets, true);
  }

  public addFrameListener(listener: StageFrameListenerV6): () => void {
    this.frameListeners.add(listener);
    return () => {
      this.frameListeners.delete(listener);
    };
  }

  public resize(width: number, height: number): void {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    this.renderer.setSize(w, h, false);
    this.cameraDirector.setAspect(w / h);
  }

  private handleResize(): void {
    if (this.isDisposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.resize(w, h);
  }

  public start(): void {
    if (this.isDisposed || this.rafId !== null) return;
    this.lastTimestampMs = performance.now();
    const tick = (nowMs: number) => {
      if (this.isDisposed) return;
      this.rafId = requestAnimationFrame(tick);
      const dtSec = Math.min(0.05, Math.max(0.001, (nowMs - this.lastTimestampMs) * 0.001));
      this.lastTimestampMs = nowMs;
      this.renderFrameNow(dtSec);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Advances physics, stage architecture, shaders, camera, and renders 1 Ultra-HD frame.
   * Also callable synchronously for deterministic verification or pause-frame rendering.
   */
  public renderFrameNow(dtSec = 1 / 60): void {
    if (this.isDisposed) return;
    const clampedDt = Math.min(0.05, Math.max(0, dtSec));
    this.elapsedSec += clampedDt;

    this.fpsAccumSec += clampedDt;
    this.fpsFrames++;
    if (this.fpsAccumSec >= 0.5) {
      this.currentFps = Math.round(this.fpsFrames / this.fpsAccumSec);
      this.fpsAccumSec = 0;
      this.fpsFrames = 0;
    }

    this.activeStageWorld?.update(clampedDt, this.elapsedSec);
    this.cameraDirector.update(clampedDt, this.elapsedSec);
    this.sparks.update(clampedDt);

    for (const listener of this.frameListeners) {
      listener(clampedDt, this.elapsedSec);
    }

    this.renderer.render(this.scene, this.camera);
  }

  public getTelemetry(): StageEngineTelemetryV6 {
    return {
      fps: this.currentFps,
      effectiveDpr: this.renderer.getPixelRatio(),
      resolutionTier: this.resolutionTier,
      shadowQuality: this.shadowQuality,
      activeStage: this.activeStageId,
      activeZone: this.cameraDirector.getActiveZone(),
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      isWebGL2: this.renderer.capabilities.isWebGL2,
    };
  }

  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.stop();

    window.removeEventListener('resize', this.onWindowResizeBound);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMoveBound);
    this.resizeObserver?.disconnect();
    this.frameListeners.clear();

    if (this.activeStageWorld) {
      this.scene.remove(this.activeStageWorld.root);
      this.activeStageWorld.dispose();
      this.activeStageWorld = null;
    }

    this.sparks.dispose();
    disposeObject3DTree(this.presenterPodium.group);
    disposeObject3DTree(this.boardMount);
    disposeObject3DTree(this.toyMount);
    disposeObject3DTree(this.trophyMount);
    disposeObject3DTree(this.relicMount);

    for (const rt of this.envCache.values()) {
      rt.dispose();
    }
    this.envCache.clear();
    this.pmremGenerator.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
