import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import type {
  CharacterId,
  CharacterMood,
  GlobeCountryCode,
  HeroRelicId,
  ISceneManager,
  LightingState,
  PeelTier,
  PrismLoadOptions,
  PrismSkinId,
  QuestionRecord,
  RivalPrismStatus,
  VenueId,
} from '../types/game';

import { VeritasPrism, buildHeroRelicMesh, disposeSubtree } from './VeritasPrism';
import { Venues3D } from './Venues3D';
import { Characters3D } from './Characters3D';
import { WorldGlobe3D } from './WorldGlobe3D';
import { getBrushedBrassTextures, getObsidianTextures } from './ProceduralTextures';

type ModeView = 'TITLE' | 'VENUE_STAGE' | 'PRISM_ACTIVE' | 'GLOBE' | 'OBSERVATORY';

export class SceneManager implements ISceneManager {
  public onFacetChanged?: (index: number) => void;
  public onGlobePinClicked?: (country: GlobeCountryCode) => void;
  public onCodexChanged?: (alignedIndices: number[]) => void;

  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private pmremGenerator: THREE.PMREMGenerator | null = null;
  private envRenderTarget: THREE.WebGLRenderTarget | null = null;

  private readonly prism: VeritasPrism;
  private readonly venues: Venues3D;
  private readonly characters: Characters3D;
  private readonly globe: WorldGlobe3D;

  // Observatory Relic showcase stage
  private readonly observatoryGroup = new THREE.Group();
  private readonly relicHolder = new THREE.Group();
  private readonly observatorySpot = new THREE.SpotLight(0xfff0cc, 3.6, 12, Math.PI * 0.28, 0.55, 1.2);
  private currentRelicId: HeroRelicId = 'meridian_astrolabe';
  private relicYaw = 0;
  private relicPitch = 0.15;
  private relicYawVel = 0;
  private relicPitchVel = 0;

  private modeView: ModeView = 'TITLE';
  private aspect = 9 / 16;
  private portraitFactor = 0.8;

  // Camera smooth choreography state
  private readonly camPosCurrent = new THREE.Vector3(0, 0.6, 6.2);
  private readonly camLookCurrent = new THREE.Vector3(0, 0, 0);
  private readonly camPosTarget = new THREE.Vector3(0, 0.6, 6.2);
  private readonly camLookTarget = new THREE.Vector3(0, 0, 0);

  // Runtime loop & resize handling
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private elapsed = 0;
  private disposed = false;
  private resizeObserver: ResizeObserver | null = null;
  private useComposer = false;

  // Pointer tap tracking for Globe pin clicks (non-intrusive with TouchController)
  private pointerDownX = 0;
  private pointerDownY = 0;
  private pointerDownTime = 0;
  private readonly ndc = new THREE.Vector2();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070b14);
    this.scene.fog = new THREE.FogExp2(0x09101f, 0.048);

    this.camera = new THREE.PerspectiveCamera(48, 9 / 16, 0.1, 80);
    this.camera.position.copy(this.camPosCurrent);

    this.venues = new Venues3D();
    this.prism = new VeritasPrism();
    this.characters = new Characters3D();
    this.globe = new WorldGlobe3D();

    this.prism.onFacetChanged = (idx) => this.onFacetChanged?.(idx);
    this.prism.onCodexChanged = (aligned) => this.onCodexChanged?.(aligned);

    this.globe.root.position.set(0, 0.42, 0);

    this.buildObservatoryStage();

    this.scene.add(
      this.venues.root,
      this.prism.root,
      this.characters.root,
      this.globe.root,
      this.observatoryGroup
    );

    this.setModeView('TITLE');
  }

  private buildObservatoryStage(): void {
    const obsidianTex = getObsidianTextures();
    const brassTex = getBrushedBrassTextures();

    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x0c111d,
      map: obsidianTex.map,
      roughnessMap: obsidianTex.roughnessMap,
      metalness: 0.35,
      roughness: 0.22,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xe6c373,
      map: brassTex.map,
      roughnessMap: brassTex.roughnessMap,
      metalness: 0.92,
      roughness: 0.22,
    });

    // Museum showcase pedestal sitting cleanly below the floating Hero Relic
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.18, 0.38, 12), pedMat);
    pedestal.position.set(0, -0.78, 0);
    const pedRing = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.025, 10, 48), brassMat);
    pedRing.rotation.x = Math.PI / 2;
    pedRing.position.set(0, -0.59, 0);
    const glowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.76, 36),
      new THREE.MeshBasicMaterial({
        color: 0xf7df9c,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
      })
    );
    glowDisc.rotation.x = -Math.PI / 2;
    glowDisc.position.set(0, -0.585, 0);

    this.relicHolder.position.set(0, 0.56, 0);

    this.observatorySpot.position.set(1.6, 4.2, 2.8);
    this.observatorySpot.target.position.set(0, 0.5, 0);

    const museumRim = new THREE.PointLight(0x66c9f5, 2.0, 8, 1.5);
    museumRim.position.set(-2.2, 1.4, -1.6);

    this.observatoryGroup.add(
      pedestal,
      pedRing,
      glowDisc,
      this.relicHolder,
      this.observatorySpot,
      this.observatorySpot.target,
      museumRim
    );
    this.observatoryGroup.visible = false;
    this.inspectHeroRelic('meridian_astrolabe');
  }

  public mount(container: HTMLElement): void {
    if (this.renderer) {
      this.dispose();
    }
    this.disposed = false;
    this.container = container;

    const width = Math.max(1, container.clientWidth || window.innerWidth);
    const height = Math.max(1, container.clientHeight || window.innerHeight);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Rich studio reflections via PMREMGenerator + RoomEnvironment
    try {
      this.pmremGenerator = new THREE.PMREMGenerator(renderer);
      this.pmremGenerator.compileEquirectangularShader();
      const roomEnv = new RoomEnvironment();
      this.envRenderTarget = this.pmremGenerator.fromScene(roomEnv, 0.04);
      this.scene.environment = this.envRenderTarget.texture;
      this.scene.environmentIntensity = 0.48;
      roomEnv.dispose();
    } catch {
      // Proceed gracefully with direct stage lights if PMREM fails on restricted GPU
    }

    // Crisp selective UnrealBloomPass (sparkles pure emissives without washing out brass/portraits)
    try {
      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(this.scene, this.camera);
      const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.15, 0.35, 0.95);
      const outputPass = new OutputPass();
      composer.addPass(renderPass);
      composer.addPass(bloomPass);
      composer.addPass(outputPass);
      this.composer = composer;
      this.bloomPass = bloomPass;
      this.useComposer = true;
    } catch {
      this.composer = null;
      this.bloomPass = null;
      this.useComposer = false;
    }

    this.handleResize(width, height);

    // Observe container size changes cleanly
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (!this.container) return;
        this.handleResize(
          Math.max(1, this.container.clientWidth),
          Math.max(1, this.container.clientHeight)
        );
      });
      this.resizeObserver.observe(container);
    }
    window.addEventListener('resize', this.onWindowResize);

    // Non-blocking click/tap detection for 3D Globe country pin raycasting
    renderer.domElement.addEventListener('pointerdown', this.onCanvasPointerDown, { passive: true });
    renderer.domElement.addEventListener('pointerup', this.onCanvasPointerUp, { passive: true });
    renderer.domElement.addEventListener('webglcontextlost', this.onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored, false);

    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private readonly onWindowResize = (): void => {
    if (!this.container) return;
    this.handleResize(
      Math.max(1, this.container.clientWidth || window.innerWidth),
      Math.max(1, this.container.clientHeight || window.innerHeight)
    );
  };

  private readonly onContextLost = (e: Event): void => {
    e.preventDefault();
    this.useComposer = false;
  };

  private readonly onContextRestored = (): void => {
    if (!this.container) return;
    this.handleResize(
      Math.max(1, this.container.clientWidth),
      Math.max(1, this.container.clientHeight)
    );
  };

  private readonly onCanvasPointerDown = (e: PointerEvent): void => {
    this.pointerDownX = e.clientX;
    this.pointerDownY = e.clientY;
    this.pointerDownTime = performance.now();
  };

  private readonly onCanvasPointerUp = (e: PointerEvent): void => {
    if (this.modeView !== 'GLOBE' || !this.renderer) return;
    const dist = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
    const dtMs = performance.now() - this.pointerDownTime;
    if (dist > 14 || dtMs > 450) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    this.ndc.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const hit = this.globe.raycastPin(this.ndc, this.camera);
    if (hit) {
      this.globe.focusCountry(hit);
      this.onGlobePinClicked?.(hit);
    }
  };

  private handleResize(width: number, height: number): void {
    this.aspect = width / Math.max(1, height);
    this.portraitFactor = THREE.MathUtils.clamp((0.88 - this.aspect) / 0.42, 0, 1);

    // Adaptive vertical FOV keeps 3D centerpiece crisp & unclipped on 9:16 mobile AND 16:9 desktop
    this.camera.fov = THREE.MathUtils.lerp(42, 53, this.portraitFactor);
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();

    if (this.renderer) {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(width, height, false);
    }
    if (this.composer) {
      this.composer.setSize(width, height);
    }
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
  }

  public setModeView(view: ModeView): void {
    this.modeView = view;

    const showPrism = view === 'TITLE' || view === 'PRISM_ACTIVE';
    const showGlobe = view === 'GLOBE';
    const showObservatory = view === 'OBSERVATORY';
    const showVenue = view === 'TITLE' || view === 'VENUE_STAGE' || view === 'PRISM_ACTIVE';
    const showCharacters = view === 'VENUE_STAGE' || view === 'PRISM_ACTIVE';

    this.prism.root.visible = showPrism;
    this.globe.root.visible = showGlobe;
    this.observatoryGroup.visible = showObservatory;
    this.venues.root.visible = showVenue || showObservatory;
    this.characters.root.visible = showCharacters;

    if (view === 'TITLE') {
      this.prism.loadTitleShowcase();
    }
  }

  public setVenue(venue: VenueId, lighting?: LightingState): void {
    this.venues.setVenue(venue, lighting);
  }

  public setLightingState(state: LightingState): void {
    this.venues.setLightingState(state);
  }

  public setCharacter(charId: CharacterId, mood?: CharacterMood): void {
    this.characters.setCharacter(charId, mood ?? 'NEUTRAL');
  }

  public setRivalPrismStatus(status: RivalPrismStatus): void {
    this.characters.setRivalPrismStatus(status);
  }

  public loadQuestionOnPrism(question: QuestionRecord, options?: PrismLoadOptions): void {
    this.prism.loadQuestion(question, options);
  }

  public spinPrismBy(deltaX: number, ring?: 'TOP' | 'BOTTOM'): void {
    this.prism.spinBy(deltaX, ring);
  }

  public stepFacet(direction: -1 | 1): void {
    this.prism.stepFacet(direction);
  }

  public getActiveFacetIndex(): number {
    return this.prism.getActiveFacetIndex();
  }

  public peelPrismTo(tier: PeelTier, shatterIndices?: number[]): void {
    this.prism.peelTo(tier, shatterIndices);
  }

  public markFacetRedacted(index: number): void {
    this.prism.markFacetRedacted(index);
  }

  public setOverclockVisual(progress: number, active: boolean): void {
    this.prism.setOverclockVisual(progress, active);
  }

  public cancelOverclockVisual(): void {
    this.prism.cancelOverclockVisual();
  }

  public setCalibratorState(normalizedPos: number, toleranceRatio: number): void {
    this.prism.setCalibratorState(normalizedPos, toleranceRatio);
  }

  public getCalibratorState(): { normalizedPos: number; toleranceRatio: number } {
    return this.prism.getCalibratorState();
  }

  public getCodexAlignment(): number[] {
    return this.prism.getCodexAlignment();
  }

  public triggerGauntletSwipe(action: 'TRUE' | 'FALSE' | 'CHALLENGE', correct: boolean): void {
    this.prism.triggerGauntletSwipe(action, correct);
  }

  public playRevealAnimation(result: {
    correct: boolean;
    backfired: boolean;
    correctIndex?: number;
    streak?: number;
  }): void {
    this.prism.playRevealAnimation(result);
  }

  public setChronoProgress(ratio: number): void {
    this.prism.setChronoProgress(ratio);
    this.venues.setChronoProgress(ratio);
  }

  public inspectHeroRelic(relicId: HeroRelicId): void {
    this.currentRelicId = relicId;
    while (this.relicHolder.children.length > 0) {
      const child = this.relicHolder.children[0];
      this.relicHolder.remove(child);
      disposeSubtree(child);
    }
    const mesh = buildHeroRelicMesh(relicId);
    mesh.scale.setScalar(1.06);
    this.relicHolder.add(mesh);
    this.relicYawVel = 1.4; // graceful introductory showcase spin
  }

  public setPrismSkin(skinId: PrismSkinId): void {
    this.prism.setPrismSkin(skinId);
  }

  public rotateRelicBy(dx: number, dy: number): void {
    this.relicYaw += dx * 0.008;
    this.relicPitch = THREE.MathUtils.clamp(this.relicPitch + dy * 0.0065, -0.95, 0.95);
    this.relicYawVel = THREE.MathUtils.clamp(dx * 0.16, -5.5, 5.5);
    this.relicPitchVel = THREE.MathUtils.clamp(dy * 0.12, -3.5, 3.5);
  }

  public rotateGlobeBy(dx: number, dy: number): void {
    this.globe.rotateBy(dx, dy);
  }

  public focusGlobeCountry(country: GlobeCountryCode): void {
    this.globe.focusCountry(country);
  }

  private updateCameraChoreography(dt: number): void {
    const pf = this.portraitFactor;
    const ocZoom = this.modeView === 'PRISM_ACTIVE' ? this.prism.overclockZoom : 0;

    switch (this.modeView) {
      case 'TITLE': {
        // Regal slow-orbit hero showcase framing Veritas Prism cleanly in center window
        const swayX = Math.sin(this.elapsed * 0.34) * 0.58;
        const swayY = Math.cos(this.elapsed * 0.28) * 0.14;
        this.camPosTarget.set(swayX, 0.52 + swayY, 4.75 + pf * 1.15);
        this.camLookTarget.set(0, -0.04, 0);
        break;
      }
      case 'VENUE_STAGE': {
        // Dialogue framing showcasing Character Bust & grand Venue in top 64% above drawer
        const swayX = Math.sin(this.elapsed * 0.25) * 0.24;
        this.camPosTarget.set(swayX, 1.72, 2.15 + pf * 0.95);
        this.camLookTarget.set(0, 1.24, -2.7);
        break;
      }
      case 'PRISM_ACTIVE': {
        // Precision 3-zone 9:16 portrait framing: Top 28% Character+Rival, Center 42% Prism, Bottom 30% Controls
        this.camPosTarget.set(0, 0.72 - ocZoom * 0.16, 4.65 + pf * 1.32 - ocZoom * 1.15);
        this.camLookTarget.set(0, 0.14 - ocZoom * 0.06, 0);
        break;
      }
      case 'GLOBE': {
        // Unobstructed centered 3D Earth above bottom Destination Boarding Pass
        this.camPosTarget.set(0, 0.32, 4.75 + pf * 1.48);
        this.camLookTarget.set(0, 0.06, 0);
        break;
      }
      case 'OBSERVATORY': {
        // Museum pedestal spotlight on rotatable 3D Hero Relic above Passport/Vault drawer
        this.camPosTarget.set(0, 0.58, 3.95 + pf * 1.18);
        this.camLookTarget.set(0, 0.14, 0);
        break;
      }
    }

    const lerpRate = Math.min(1, dt * 4.8);
    this.camPosCurrent.lerp(this.camPosTarget, lerpRate);
    this.camLookCurrent.lerp(this.camLookTarget, lerpRate);

    // Trauma-based damped camera shake (Backfire / Miss / Gauntlet punch)
    let shakeX = 0;
    let shakeY = 0;
    if (this.prism.cameraTrauma > 0.01) {
      const sq = this.prism.cameraTrauma * this.prism.cameraTrauma;
      shakeX = (Math.random() - 0.5) * 0.24 * sq;
      shakeY = (Math.random() - 0.5) * 0.24 * sq;
    }

    this.camera.position.set(
      this.camPosCurrent.x + shakeX,
      this.camPosCurrent.y + shakeY,
      this.camPosCurrent.z
    );
    this.camera.lookAt(this.camLookCurrent);
  }

  private updateObservatory(dt: number): void {
    if (!this.observatoryGroup.visible) return;

    this.relicYaw += this.relicYawVel * dt + dt * 0.28;
    this.relicPitch = THREE.MathUtils.clamp(this.relicPitch + this.relicPitchVel * dt, -0.95, 0.95);
    this.relicYawVel *= Math.exp(-4.2 * dt);
    this.relicPitchVel *= Math.exp(-5.0 * dt);

    this.relicHolder.rotation.y = this.relicYaw;
    this.relicHolder.rotation.x = this.relicPitch;
    this.relicHolder.position.y = 0.56 + Math.sin(this.elapsed * 1.5) * 0.055;

    // Kinetic internal mechanisms inside each Hero Relic
    this.relicHolder.traverse((obj) => {
      const axis = obj.userData.spinAxis as THREE.Vector3 | undefined;
      if (axis) {
        obj.rotation.x += axis.x * dt;
        obj.rotation.y += axis.y * dt;
        obj.rotation.z += axis.z * dt;
      }
    });
  }

  private readonly tick = (now: number): void => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.tick);

    const rawDt = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
    this.elapsed += dt;

    this.venues.update(dt, this.scene);
    if (this.prism.root.visible) {
      this.prism.update(dt);
    }
    if (this.characters.root.visible) {
      this.characters.update(dt);
    }
    if (this.globe.root.visible) {
      this.globe.update(dt);
    }
    this.updateObservatory(dt);
    this.updateCameraChoreography(dt);

    if (this.renderer) {
      if (this.useComposer && this.composer) {
        try {
          this.composer.render(dt);
        } catch {
          this.useComposer = false;
          this.renderer.render(this.scene, this.camera);
        }
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    }
  };

  public dispose(): void {
    this.disposed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    window.removeEventListener('resize', this.onWindowResize);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.renderer) {
      const dom = this.renderer.domElement;
      dom.removeEventListener('pointerdown', this.onCanvasPointerDown);
      dom.removeEventListener('pointerup', this.onCanvasPointerUp);
      dom.removeEventListener('webglcontextlost', this.onContextLost);
      dom.removeEventListener('webglcontextrestored', this.onContextRestored);
    }

    this.prism.dispose();
    this.venues.dispose();
    this.characters.dispose();
    this.globe.dispose();

    this.composer?.dispose();
    this.composer = null;
    this.bloomPass = null;
    this.envRenderTarget?.dispose();
    this.envRenderTarget = null;
    this.pmremGenerator?.dispose();
    this.pmremGenerator = null;

    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
    this.container = null;
  }
}
