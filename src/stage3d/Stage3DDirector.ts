import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraChoreographer, type CameraShotId } from './CameraChoreographer';
import {
  disposeObject3D,
  type DomainId,
  type HeroRelicKey,
  type LightingMode,
  type PrismArchetype,
  type PrismAtelierSkinId,
  type PrismAtelierSkinSpec,
  type VenueCode,
} from './DomainShaderKits';
import { PostFXPipeline, type QualityTier } from './PostFXPipeline';
import { VenueArenaLoader } from './VenueArenaLoader';
import {
  VeritasPrismRig,
  type CalibratorDialSpec,
  type CodexDualRingSpec,
  type GauntletShatterSpec,
  type GlobeFlightArcSpec,
  type GlobePinDropVisualSpec,
  type HeroArtifactSpec,
  type MorphSpecMap,
  type SightlineLockSpec,
  type VisualBlueprintPlateSpec,
  type WorldGlobeSpec,
} from './VeritasPrismRig';

export interface Stage3DConfig {
  baseUrl?: string;
  qualityTier?: QualityTier;
  initialVenue?: VenueCode;
  initialLighting?: LightingMode;
  interactionEnabled?: boolean;
}

export interface Stage3DEvents {
  /** Fires on every 90° Prism/Codex detent snap (`8ms` haptics + `sfx_spin_tick` / `sfx_sightline_snap`). */
  onSpinDetent?: (facetIndex: number, speed01: number) => void;
  /** Fires whenever the active front Sightline facet changes (`0..3`). */
  onFacetSelected?: (facetIndex: number) => void;
  /** Fires when the player physically drags `Brass_Crown` downward to crack open Tier 2 or Tier 3. */
  onPeelTriggered?: (newTier: 2 | 3) => void;
  /** Fires on a short tap (`< 250ms`) on the front Sightline-locked facet. */
  onSafeLock?: (facetIndex: number) => void;
  /** Fires continuously while press-and-holding (`0.25s..1.0s`) on the 3D Prism (`charge01` in `0..1`). */
  onOverclockProgress?: (charge01: number, active: boolean) => void;
  /** Fires on releasing an active 3D Overclock hold (`THUNK!`). */
  onOverclockCommit?: (facetIndex: number, finalCharge01: number) => void;
  /** Fires when flicking horizontally mid-hold to safely vent/cancel an Overclock (`Bluff Echo`). */
  onOverclockCancelBluff?: () => void;
  /** Fires when spinning Top (`0..2`) or Bottom (`0..3`) rings on `codex_cryptex.glb`. */
  onCodexChanged?: (
    topSubjectIndex: number,
    bottomTargetIndex: number,
    changedRing: 'TOP' | 'BOTTOM'
  ) => void;
  /** Fires when dragging estimate needle or vertical tolerance cone on `calibrator_chronometer.glb`. */
  onCalibratorChanged?: (
    value: number,
    toleranceFraction: number,
    coneId?: 'WIDE' | 'SHARP' | 'PINHOLE'
  ) => void;
  /** Fires when vertical Calibrator drag snaps to a different discrete tolerance cone (`WIDE / SHARP / PINHOLE`). */
  onCalibratorConeChanged?: (
    coneId: 'WIDE' | 'SHARP' | 'PINHOLE',
    toleranceFraction: number
  ) => void;
  /** Fires when swiping Right (`VERIFY`), Left (`DEBUNK`), or Up (`CHALLENGE`) on a 3D Gauntlet Plate. */
  onGauntletSwipe?: (verdict: 'VERIFY' | 'DEBUNK' | 'CHALLENGE') => void;
  /** Fires when clicking one of the 8 glowing 3D City Pins on `meridian_world_globe.glb` v2. */
  onGlobeCitySelected?: (venue: VenueCode) => void;
  /** Fires when tapping the 3D Globe surface in `GLOBE_PIN_DROP` mode (`lat` in `-90..90`, `lon` in `-180..180`). */
  onGlobePinSelected?: (lat: number, lon: number) => void;
}

/**
 * Structural subset matching `ForgeEngine`'s `PrismQuestion` 1:1 (zero circular imports).
 */
export interface StageQuestionInput {
  qid?: number;
  l0Domain: number;
  glyphId?: string;
  glyphHint?: string;
  archetype:
    | 'SIGHTLINE_LOCK'
    | 'CODEX_DUAL_RING'
    | 'CALIBRATOR_DIAL'
    | 'GAUNTLET_SHATTER'
    | 'HERO_ARTIFACT_SYNTHESIS'
    | 'GLOBE_PIN_DROP';
  prompt: string;
  facets?: ReadonlyArray<{
    index: number;
    text: string;
    isCorrect?: boolean;
    plausibility?: number;
    crowdSharePct?: number;
    shattersOnTier3?: boolean;
  }>;
  correctFacetIndex?: number;
  clueTiers?: readonly [
    unknown,
    unknown,
    { shatteredFacetIndices?: readonly number[] }
  ];
  codex?: {
    subjects: readonly string[];
    targets: readonly string[];
  };
  calibrator?: {
    exactVal: number;
    minVal: number;
    maxVal: number;
    step?: number;
    unit?: string;
    initialEstimate?: number;
    toleranceCones?: ReadonlyArray<{ pctOfSpan: number; multiplier: number }>;
  };
  gauntlet?: {
    statement: string;
  };
  globePin?: {
    readonly targetLat: number;
    readonly targetLon: number;
    readonly targetLabel: string;
    readonly bullseyeKm?: number;
    readonly goldKm?: number;
    readonly grazeKm?: number;
    readonly regionHint?: string;
    readonly coordHint?: string;
    readonly quickAnchors?: ReadonlyArray<{
      readonly label: string;
      readonly lat: number;
      readonly lon: number;
    }>;
  };
  visualPlate?: VisualBlueprintPlateSpec;
  heroRelicId?: HeroRelicKey;
  heroSynthesis?: {
    relicId: HeroRelicKey;
    steps: ReadonlyArray<{
      facets: ReadonlyArray<{ text: string; shattersOnTier3?: boolean }>;
      correctFacetIndex: number;
      clueTiers?: readonly [unknown, unknown, { shatteredFacetIndices?: readonly number[] }];
    }>;
  };
}

export interface PresentQuestionOptions {
  initialFacetIndex?: number;
  /** Tokyo Blackmail perk: marks weak distractor with subtle glass hairline stress-fracture */
  horizonLens?: boolean;
  /** Cairo Whistleblower perk: illuminates crowd consensus warm aura */
  peoplesLens?: boolean;
  /** Step `0..2` when presenting a chained 3-step `HERO_ARTIFACT_SYNTHESIS` Boss relic round */
  synthesisStepIndex?: 0 | 1 | 2;
  /** Tokyo Live Signal Jammer: locks Peel shut & engages `TWIST_FRACTURE` lighting */
  peelLocked?: boolean;
}

type PointerGestureMode =
  | 'NONE'
  | 'PRISM_SPIN_OR_HOLD'
  | 'PRISM_OVERCLOCK_HOLD'
  | 'CROWN_PULL'
  | 'CODEX_TOP_DRAG'
  | 'CODEX_BOTTOM_DRAG'
  | 'CALIBRATOR_DRAG'
  | 'GAUNTLET_SWIPE'
  | 'GLOBE_DRAG'
  | 'INSPECT_DRAG';

/**
 * Master 3D PBR Stage & Veritas Prism Hardware Director (`src/stage3d/Stage3DDirector.ts`).
 *
 * Orchestrates:
 * - Real Blender 5.3.0 `.glb` Venues (`VenueArenaLoader`) + Poly Haven `.hdr` PMREM IBL
 * - Real Blender 5.3.0 `.glb` Veritas Prism & 5 Morphs (`VeritasPrismRig`) + `troika-three-text` curved MSDF
 * - Portrait & Widescreen `CameraChoreographer` (`46° -> 36°` Overclock push + trauma shake)
 * - HalfFloat MSAA `PostFXPipeline` (`RenderPass` + `UnrealBloomPass` 0.82/0.42 + ACES Filmic `OutputPass`)
 */
export class Stage3DDirector {
  public events: Stage3DEvents = {};

  public readonly scene: THREE.Scene;
  public readonly cameraChoreographer: CameraChoreographer;
  public readonly venueLoader: VenueArenaLoader;
  public readonly prismRig: VeritasPrismRig;

  private renderer: THREE.WebGLRenderer | null = null;
  private postFX: PostFXPipeline | null = null;
  private container: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private readonly baseUrl: string;
  private qualityTier: QualityTier;
  private interactionEnabled: boolean;
  private peelLocked = false;
  private pendingTier3Eliminations: number[] = [];
  private activeCorrectFacetIndex = 0;

  private rafId: number | null = null;
  private resizeRafId: number | null = null;
  private lastTimeMs = 0;
  private paused = false;
  private disposed = false;
  private hasShownInitialShowcase = false;

  // Pointer & Hold-to-Overclock gesture state
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerNdc = new THREE.Vector2();
  private activePointerId: number | null = null;
  private gestureMode: PointerGestureMode = 'NONE';
  private downX = 0;
  private downY = 0;
  private lastX = 0;
  private lastY = 0;
  private lastMoveTimeMs = 0;
  private downTimeMs = 0;
  private totalDragPx = 0;
  private downHitFacetIndex: number | null = null;
  private downStartFacetIndex = 0;
  private downHitGlobeVenue: VenueCode | null = null;
  private downHitGlobeCoords: { lat: number; lon: number } | null = null;
  private codexAccumPx = 0;
  private holdOverclockArmed = false;
  private holdOverclockCancelled = false;
  private holdCharge01 = 0;
  private lastCalibratorConeId: 'WIDE' | 'SHARP' | 'PINHOLE' = 'SHARP';

  // Bound DOM listeners
  private readonly onWindowPointerDownBound = (e: PointerEvent) =>
    this.handleWindowPointerDown(e);
  private readonly onPointerDownBound = (e: PointerEvent) => this.handlePointerDown(e);
  private readonly onPointerMoveBound = (e: PointerEvent) => this.handlePointerMove(e);
  private readonly onPointerUpBound = (e: PointerEvent) => this.handlePointerUp(e);
  private readonly onPointerCancelBound = (e: PointerEvent) => this.handlePointerCancel(e);
  private readonly onViewportReflowBound = () => this.scheduleViewportReflow();

  constructor(config: Stage3DConfig = {}) {
    const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } }).env;
    this.baseUrl = config.baseUrl ?? metaEnv?.BASE_URL ?? '/';
    this.qualityTier = config.qualityTier ?? 'HIGH';
    this.interactionEnabled = config.interactionEnabled ?? true;

    this.scene = new THREE.Scene();
    this.cameraChoreographer = new CameraChoreographer(16 / 9);
    this.venueLoader = new VenueArenaLoader(this.scene, this.baseUrl);
    this.prismRig = new VeritasPrismRig(this.venueLoader, this.baseUrl);

    this.scene.add(this.venueLoader.root, this.prismRig.root);

    this.prismRig.callbacks = {
      onSpinDetent: (idx, spd) => this.events.onSpinDetent?.(idx, spd),
      onFacetSelected: (idx) => this.events.onFacetSelected?.(idx),
      onCodexChanged: (t, b, ring) => this.events.onCodexChanged?.(t, b, ring),
      onCalibratorChanged: (v, tol) => {
        const coneId: 'WIDE' | 'SHARP' | 'PINHOLE' =
          tol <= 0.055 ? 'PINHOLE' : tol <= 0.145 ? 'SHARP' : 'WIDE';
        this.events.onCalibratorChanged?.(v, tol, coneId);
      },
    };

    if (config.initialLighting) {
      this.venueLoader.setLightingMode(config.initialLighting, true);
    }
  }

  /**
   * Mounts the WebGL2 PBR `<canvas>` inside `container`, compiles Poly Haven `.hdr` PMREM IBL,
   * loads the initial 3D venue & `veritas_prism.glb`, and starts the 60 FPS render loop.
   */
  public async mount(
    container: HTMLElement,
    initialVenue: VenueCode = 'ch'
  ): Promise<void> {
    this.container = container;
    const rect = container.getBoundingClientRect();
    const w = Math.max(240, rect.width || window.innerWidth || 1280);
    const h = Math.max(240, rect.height || window.innerHeight || 720);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    renderer.setClearColor(0x070a12, 1);
    container.style.touchAction = 'none';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.userSelect = 'none';
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    this.venueLoader.initPMREM(renderer);

    this.cameraChoreographer.setAspect(w, h);
    this.postFX = new PostFXPipeline(renderer, this.scene, this.cameraChoreographer.camera, w, h);
    this.postFX.setQualityTier(this.qualityTier);
    this.postFX.setSize(w, h, window.devicePixelRatio || 1);

    const preset = this.venueLoader.setLightingMode(this.venueLoader.getLightingMode(), true);
    this.postFX.setLightingTargets(preset.bloomStrength, preset.exposure, true);

    // Bind responsive ResizeObserver + live orientationchange/visualViewport listeners (#168, #169)
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    window.addEventListener('resize', this.onViewportReflowBound);
    window.addEventListener('orientationchange', this.onViewportReflowBound);
    window.addEventListener('ws:viewport-fit', this.onViewportReflowBound);
    window.visualViewport?.addEventListener('resize', this.onViewportReflowBound);

    // Bind 3D tactile pointer gestures on canvas AND window so drags starting in any transparent
    // spotlight zone or crossing DOM bounds stay 100% deterministic (#203 §2.3)
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDownBound);
    window.addEventListener('pointerdown', this.onWindowPointerDownBound);
    window.addEventListener('pointermove', this.onPointerMoveBound);
    window.addEventListener('pointerup', this.onPointerUpBound);
    window.addEventListener('pointercancel', this.onPointerCancelBound);

    this.lastTimeMs = performance.now();
    this.startLoop();

    // Load initial venue + Veritas Prism concurrently
    await Promise.all([
      this.venueLoader.loadVenue(initialVenue),
      this.prismRig.preloadCoreRig(),
    ]);
  }

  public getCanvas(): HTMLCanvasElement | null {
    return this.renderer?.domElement ?? null;
  }

  public setInteractionEnabled(enabled: boolean): void {
    this.interactionEnabled = enabled;
    if (!enabled) {
      this.cancelActiveGesture();
    }
  }

  public setPaused(paused: boolean): void {
    this.paused = paused;
    if (!paused) {
      this.lastTimeMs = performance.now();
    }
  }

  public setQualityTier(tier: QualityTier): void {
    this.qualityTier = tier;
    this.postFX?.setQualityTier(tier);
    this.resize();
  }

  public resize(): void {
    if (!this.container || !this.postFX || this.disposed) return;
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(1, rect.width || window.innerWidth || 1);
    const h = Math.max(1, rect.height || window.innerHeight || 1);
    this.cameraChoreographer.setAspect(w, h);
    this.postFX.setSize(w, h, window.devicePixelRatio || 1);
  }

  private scheduleViewportReflow(): void {
    this.resize();
    if (this.resizeRafId !== null) {
      cancelAnimationFrame(this.resizeRafId);
    }
    this.resizeRafId = requestAnimationFrame(() => {
      this.resizeRafId = null;
      this.resize();
    });
  }

  // ============================================================================
  // VENUE, LIGHTING & CAMERA API
  // ============================================================================

  public async setVenue(venue: VenueCode): Promise<void> {
    await this.venueLoader.loadVenue(venue);
  }

  public getVenue(): VenueCode {
    return this.venueLoader.getVenue();
  }

  public setLightingMode(mode: LightingMode, instant = false): void {
    const preset = this.venueLoader.setLightingMode(mode, instant);
    this.postFX?.setLightingTargets(preset.bloomStrength, preset.exposure, instant);
  }

  /** Alias matching `#171` §3.2 (`setLightingMood('MISSION_FAILED' | ...)`). */
  public setLightingMood(mode: LightingMode, instant = false): void {
    this.setLightingMode(mode, instant);
  }

  /**
   * Triggers the unmistakable Crimson Chiaroscuro Circuit-Breach 3D Stage State (#171 §2.1 & §3.2)
   * whenever a player fails a level (`won === false` via Rival outscoring, `0` Shields, or Phase III Backfire).
   */
  public triggerMissionFailedState(): void {
    this.cameraChoreographer.setOverclockCharge(0);
    this.setLightingMode('MISSION_FAILED');
    this.prismRig.triggerMissionFailedPulse();
    this.postFX?.pulseBloom(0.05);
    this.cameraChoreographer.triggerShake(0.68);
  }

  public getLightingMode(): LightingMode {
    return this.venueLoader.getLightingMode();
  }

  public setCameraShot(shot: CameraShotId, instant = false): void {
    this.prismRig.setTitleShowcaseOrbit(shot === 'TITLE_ESTABLISHING');
    this.cameraChoreographer.setShot(shot, instant);
  }

  public triggerCameraShake(intensity = 0.45): void {
    this.cameraChoreographer.triggerShake(intensity);
  }

  public setDomain(domainId: DomainId | number): void {
    this.prismRig.setDomainPalette(domainId);
  }

  // ============================================================================
  // HIGH-LEVEL QUESTION & MORPH PRESENTATION API
  // ============================================================================

  public async setMorph<K extends PrismArchetype>(
    archetype: K,
    spec: MorphSpecMap[K]
  ): Promise<void> {
    await this.prismRig.setMorph(archetype, spec);

    switch (archetype) {
      case 'SIGHTLINE_LOCK':
        this.setCameraShot('PRISM_STANDARD');
        break;
      case 'CODEX_DUAL_RING':
        this.setCameraShot('CODEX_FOCUS');
        break;
      case 'CALIBRATOR_DIAL':
        this.setCameraShot('CALIBRATOR_FOCUS');
        break;
      case 'GAUNTLET_SHATTER':
        this.setCameraShot('GAUNTLET_FOCUS');
        break;
      case 'HERO_ARTIFACT_SYNTHESIS':
        this.setCameraShot(
          (spec as HeroArtifactSpec).options ? 'PRISM_STANDARD' : 'RELIC_OBSERVATORY'
        );
        break;
      case 'WORLD_GLOBE':
        this.setCameraShot('GLOBE_OVERWATCH');
        break;
      case 'CHAMPIONSHIP_TROPHY':
        this.setCameraShot('TROPHY_HERO');
        break;
      case 'IDLE_ORB':
        this.setCameraShot('TITLE_ESTABLISHING');
        break;
      case 'DIPLOMATIC_PASSPORT':
        this.setCameraShot('RELIC_OBSERVATORY');
        break;
    }
  }

  public equipPrismSkin(
    skinIdOrSpec: PrismAtelierSkinId | string | Partial<PrismAtelierSkinSpec>
  ): void {
    this.prismRig.equipPrismSkin(skinIdOrSpec);
  }

  public actuateRelicLatches(openCount: number): void {
    this.prismRig.actuateRelicLatches(openCount);
  }

  public async showDiplomaticPassport(openCover = true): Promise<void> {
    await this.setMorph('DIPLOMATIC_PASSPORT', { openCover });
  }

  /**
   * One-call bridge for `ForgeEngine`'s normalized `PrismQuestion`.
   * Configures the exact 3D morph, curved MSDF text, Domain PBR Shader Kit,
   * camera framing, and perk overlays (`horizonLens`, `peoplesLens`, `peelLocked`).
   */
  public async presentQuestion(
    question: StageQuestionInput,
    options: PresentQuestionOptions = {}
  ): Promise<void> {
    this.peelLocked = Boolean(options.peelLocked);
    this.cameraChoreographer.setOverclockCharge(0);

    if (options.peelLocked) {
      this.setLightingMode('TWIST_FRACTURE');
    } else if (
      this.getLightingMode() === 'GOLD_RESONANCE' ||
      this.getLightingMode() === 'MISSION_FAILED'
    ) {
      this.setLightingMode('BROADCAST');
    }

    const domainId = question.l0Domain ?? 0;

    if (question.archetype === 'GLOBE_PIN_DROP' || question.globePin) {
      this.pendingTier3Eliminations = [];
      const gp = question.globePin;
      await this.setMorph('WORLD_GLOBE', {
        pinDropMode: true,
        showAct1FlightFork: false,
        pinDrop: {
          targetLat: gp?.targetLat ?? 0,
          targetLon: gp?.targetLon ?? 0,
          targetLabel: gp?.targetLabel ?? question.prompt.slice(0, 32),
          bullseyeKm: gp?.bullseyeKm ?? 300,
          goldKm: gp?.goldKm ?? 1000,
          grazeKm: gp?.grazeKm ?? 2200,
          domainId,
        },
      });
      return;
    }

    if (question.archetype === 'CODEX_DUAL_RING' && question.codex) {
      this.pendingTier3Eliminations = [];
      await this.setMorph('CODEX_DUAL_RING', {
        subjects: [...question.codex.subjects],
        targets: [...question.codex.targets],
        domainId,
        lockedConduits: 0,
      });
      return;
    }

    if (question.archetype === 'CALIBRATOR_DIAL' && question.calibrator) {
      this.pendingTier3Eliminations = [];
      const cal = question.calibrator;
      const defaultCone = cal.toleranceCones?.[1];
      // #190 [P0]: ShardDecoder already stores pctOfSpan as a [0.008..0.32] fraction!
      const frac = defaultCone
        ? defaultCone.pctOfSpan > 1
          ? defaultCone.pctOfSpan / 100
          : defaultCone.pctOfSpan
        : 0.1;
      const mult = defaultCone ? `${defaultCone.multiplier.toFixed(1)}x` : '2.5x';
      await this.setMorph('CALIBRATOR_DIAL', {
        minVal: cal.minVal,
        maxVal: cal.maxVal,
        step: cal.step ?? 1,
        unit: cal.unit ?? '',
        initialVal: cal.initialEstimate ?? (cal.minVal + cal.maxVal) * 0.5,
        toleranceFraction: frac,
        multiplierLabel: mult,
        domainId,
      });
      return;
    }

    if (question.archetype === 'GAUNTLET_SHATTER') {
      this.pendingTier3Eliminations = [];
      await this.setMorph('GAUNTLET_SHATTER', {
        statement: question.gauntlet?.statement ?? question.prompt,
        domainId,
      });
      return;
    }

    if (question.archetype === 'HERO_ARTIFACT_SYNTHESIS') {
      const stepIdx = options.synthesisStepIndex ?? 0;
      const step = question.heroSynthesis?.steps?.[stepIdx];
      const relicId =
        question.heroSynthesis?.relicId ?? question.heroRelicId ?? 'meridian_astrolabe';
      const facets = step?.facets ?? question.facets ?? [];
      this.activeCorrectFacetIndex =
        step?.correctFacetIndex ?? question.correctFacetIndex ?? 0;
      this.pendingTier3Eliminations = step?.clueTiers?.[2]?.shatteredFacetIndices
        ? [...step.clueTiers[2].shatteredFacetIndices]
        : facets
            .map((f, idx) => (f.shattersOnTier3 ? idx : -1))
            .filter((idx) => idx >= 0);

      let stressIndices: number[] | undefined;
      if (options.horizonLens && facets.length > 0) {
        const candidateIdx = facets.findIndex(
          (f, idx) => idx !== this.activeCorrectFacetIndex && Boolean(f.shattersOnTier3)
        );
        const fallbackIdx = facets.findIndex((_, idx) => idx !== this.activeCorrectFacetIndex);
        const chosen = candidateIdx >= 0 ? candidateIdx : fallbackIdx;
        if (chosen >= 0) stressIndices = [chosen];
      }
      const heatmap = options.peoplesLens
        ? facets.map((f, idx) =>
            idx === this.activeCorrectFacetIndex
              ? 0.85
              : THREE.MathUtils.clamp(((f as { crowdSharePct?: number }).crowdSharePct ?? 20) / 65, 0, 1)
          )
        : undefined;

      await this.setMorph('HERO_ARTIFACT_SYNTHESIS', {
        relicId,
        domainId,
        glyphId: question.glyphId ?? question.glyphHint,
        options: facets.length > 0 ? facets.map((f) => f.text) : undefined,
        initialIndex: options.initialFacetIndex ?? 0,
        stressFractureIndices: stressIndices,
        peopleHeatmapWeights: heatmap,
        openLatchCount: stepIdx,
      });
      return;
    }

    // Default: SIGHTLINE_LOCK (4-facet Veritas Prism)
    const facets = question.facets ?? [];
    this.activeCorrectFacetIndex = question.correctFacetIndex ?? 0;
    this.pendingTier3Eliminations = question.clueTiers?.[2]?.shatteredFacetIndices
      ? [...question.clueTiers[2].shatteredFacetIndices]
      : facets
          .map((f, idx) => (f.shattersOnTier3 ? idx : -1))
          .filter((idx) => idx >= 0);

    let stressIndices: number[] | undefined;
    if (options.horizonLens && facets.length > 0) {
      // Mark lowest-plausibility distractor with subtle glass stress hairline
      let weakestIdx = -1;
      let minPlaus = Infinity;
      facets.forEach((f, idx) => {
        if (!f.isCorrect && idx !== this.activeCorrectFacetIndex) {
          const p = f.plausibility ?? 0.5;
          if (p < minPlaus) {
            minPlaus = p;
            weakestIdx = idx;
          }
        }
      });
      if (weakestIdx >= 0) stressIndices = [weakestIdx];
    }

    const heatmap = options.peoplesLens
      ? facets.map((f) => THREE.MathUtils.clamp((f.crowdSharePct ?? 25) / 65, 0, 1))
      : undefined;

    await this.setMorph('SIGHTLINE_LOCK', {
      options: facets.map((f) => f.text),
      domainId,
      glyphId: question.glyphId ?? question.glyphHint,
      initialIndex: options.initialFacetIndex ?? 0,
      stressFractureIndices: stressIndices,
      peopleHeatmapWeights: heatmap,
      visualPlate: question.visualPlate,
    });
  }

  // ============================================================================
  // SYNCED TACTILE VERBS (SPIN · PEEL · OVERCLOCK · CODEX · CALIBRATOR · GAUNTLET)
  // ============================================================================

  public spinToFacet(index: number, fireCallback = false): void {
    this.prismRig.spinToFacet(index, fireCallback);
  }

  public stepFacet(delta: -1 | 1): number {
    return this.prismRig.stepFacet(delta);
  }

  public getSelectedFacetIndex(): number {
    return this.prismRig.getSelectedFacetIndex();
  }

  public getPeelTier(): 1 | 2 | 3 {
    return this.prismRig.getPeelTier();
  }

  /**
   * Triggers the next Depth Peel tier (`3.0x -> 2.0x Clue Core` or `2.0x -> 1.2x Blueprint Core`
   * shattering 2 false crystal facets!).
   */
  public triggerPeel(customEliminatedIndices?: number[]): 1 | 2 | 3 {
    if (this.peelLocked) {
      this.cameraChoreographer.triggerShake(0.18);
      return this.prismRig.getPeelTier();
    }
    const curr = this.prismRig.getPeelTier();
    if (curr >= 3) return 3;

    const nextTier: 2 | 3 = curr === 1 ? 2 : 3;

    // On GLOBE_PIN_DROP, Peel Tier 2 / Tier 3 highlights a glowing latitude band around targetLat!
    if (this.prismRig.isGlobePinDropMode()) {
      const result = this.prismRig.pullGlobePeel(nextTier, true);
      if (nextTier === 3) {
        this.cameraChoreographer.triggerShake(0.18);
      }
      return result;
    }

    const elim =
      nextTier === 3
        ? customEliminatedIndices ?? this.computeTier3Eliminations()
        : undefined;

    const result = this.prismRig.pullCrownPeel(nextTier, elim, true);
    if (nextTier === 2) {
      this.cameraChoreographer.setShot('PRISM_PEEL_INSPECT');
    } else {
      this.cameraChoreographer.setShot('PRISM_STANDARD');
      this.cameraChoreographer.triggerShake(0.32);
    }
    return result;
  }

  private computeTier3Eliminations(): number[] {
    if (this.pendingTier3Eliminations.length > 0) {
      return this.pendingTier3Eliminations;
    }
    const fallback: number[] = [];
    for (let i = 0; i < 4 && fallback.length < 2; i++) {
      if (i !== this.activeCorrectFacetIndex) {
        fallback.push(i);
      }
    }
    return fallback;
  }

  public redactFacet(facetIndex: number): void {
    this.prismRig.redactFacet(facetIndex);
    this.cameraChoreographer.triggerShake(0.24);
  }

  /**
   * Syncs external Hold-to-Overclock bar (`charge01` `0..1`) with the 3D clamping jaws,
   * molten-gold vertical crystal shader surge, and `46° -> 36°` camera FOV push.
   */
  public setOverclockState(active: boolean, charge01: number): void {
    const clamped = active ? THREE.MathUtils.clamp(charge01, 0, 1) : 0;
    this.prismRig.setOverclockState(active, clamped);
    this.cameraChoreographer.setOverclockCharge(clamped);
  }

  public cancelOverclockBluff(): void {
    this.prismRig.cancelOverclockBluff();
    this.cameraChoreographer.setOverclockCharge(0);
  }

  /**
   * Unified Reveal Payoff (`GOLD RESONANCE` vs `BACKFIRE` / Miss).
   */
  public resolveOutcome(opts: {
    correct: boolean;
    correctIndex?: number;
    selectedIndex?: number;
    wasOverclocked?: boolean;
    exactCalibratorVal?: number;
    gauntletVerdict?: 'VERIFY' | 'DEBUNK' | 'CHALLENGE';
    globeReveal?: {
      targetLat: number;
      targetLon: number;
      candidateLat?: number;
      candidateLon?: number;
      distanceKm?: number;
      targetLabel?: string;
    };
  }): void {
    this.cameraChoreographer.setOverclockCharge(0);

    if (this.prismRig.isGlobePinDropMode()) {
      if (opts.globeReveal) {
        const g = opts.globeReveal;
        this.prismRig.revealGlobeTarget(
          g.targetLat,
          g.targetLon,
          g.candidateLat,
          g.candidateLon,
          g.distanceKm,
          g.targetLabel
        );
      }
    } else if (this.prismRig.getArchetype() === 'CALIBRATOR_DIAL' && opts.exactCalibratorVal !== undefined) {
      this.prismRig.revealCalibratorTarget(opts.exactCalibratorVal, opts.correct);
    } else if (this.prismRig.getArchetype() === 'GAUNTLET_SHATTER' && opts.gauntletVerdict) {
      this.prismRig.shatterGauntletPlate(opts.gauntletVerdict);
    } else {
      this.prismRig.playRevealOutcome({
        correct: opts.correct,
        correctIndex: opts.correctIndex ?? this.activeCorrectFacetIndex,
        selectedIndex: opts.selectedIndex ?? this.prismRig.getSelectedFacetIndex(),
        wasOverclocked: opts.wasOverclocked,
      });
    }

    if (opts.correct) {
      this.setLightingMode('GOLD_RESONANCE');
      this.postFX?.pulseBloom(opts.wasOverclocked ? 0.06 : 0.04);
      this.cameraChoreographer.triggerShake(0.22);
    } else {
      this.setLightingMode('TWIST_FRACTURE');
      this.postFX?.pulseBloom(0.05);
      this.cameraChoreographer.triggerShake(opts.wasOverclocked ? 0.85 : 0.38);
    }
  }

  public spinCodexRing(
    ring: 'TOP' | 'BOTTOM',
    indexOrDelta: number,
    relative = false
  ): void {
    this.prismRig.spinCodexRing(ring, indexOrDelta, relative, true);
  }

  public setCodexConduits(lockedCount: number): void {
    this.prismRig.setCodexConduits(lockedCount);
  }

  public setCalibratorValue(value: number): void {
    this.prismRig.setCalibratorValue(value, false);
  }

  public setCalibratorTolerance(fraction: number, multiplierLabel?: string): void {
    this.prismRig.setCalibratorTolerance(fraction, multiplierLabel);
  }

  public shatterGauntletPlate(verdict: 'VERIFY' | 'DEBUNK' | 'CHALLENGE'): void {
    this.prismRig.shatterGauntletPlate(verdict);
    this.cameraChoreographer.triggerShake(0.26);
  }

  // ============================================================================
  // GLOBE v2, TROPHY, RELIC & TITLE SHOWCASES
  // ============================================================================

  public async showWorldGlobe(spec: WorldGlobeSpec = {}): Promise<void> {
    await this.setMorph('WORLD_GLOBE', { pinDropMode: false, ...spec });
  }

  public focusGlobeCity(venue: VenueCode): void {
    this.prismRig.focusGlobeCity(venue);
  }

  public setGlobeFlightArcs(arcs: GlobeFlightArcSpec[]): void {
    this.prismRig.setGlobeFlightArcs(arcs);
  }

  /**
   * Drops the glowing 24K Gold Candidate Beacon Pin + pulsing target ring at `(lat, lon)` on the
   * 3D Globe surface, optionally rotating that point smoothly to face the camera (e.g. from HUD quick-anchors).
   */
  public setGlobeCandidatePin(lat: number, lon: number, rotateToFace = false): void {
    this.prismRig.setGlobeCandidatePin(lat, lon, rotateToFace);
  }

  /**
   * Drops the Emerald Sovereign Target Pin, animates the glowing 3D Great-Circle Geodesic Arc
   * connecting Candidate Pin -> Target Pin above the sphere, and displays a comma-safe Troika readout.
   */
  public revealGlobeTarget(
    targetLat: number,
    targetLon: number,
    candidateLat?: number,
    candidateLon?: number,
    distanceKm?: number,
    targetLabel?: string
  ): void {
    this.prismRig.revealGlobeTarget(
      targetLat,
      targetLon,
      candidateLat,
      candidateLon,
      distanceKm,
      targetLabel
    );
  }

  /**
   * Mounts or clears a `.svg`/`.png` blueprint onto the floating Sapphire Hologram Medallion Plate.
   */
  public setVisualBlueprintPlate(plate?: VisualBlueprintPlateSpec): void {
    this.prismRig.setVisualBlueprintPlate(plate);
  }

  public clearVisualBlueprintPlate(): void {
    this.prismRig.clearVisualBlueprintPlate();
  }

  public async showChampionshipTrophy(domainId = 0): Promise<void> {
    this.setLightingMode('GOLD_RESONANCE');
    await this.setMorph('CHAMPIONSHIP_TROPHY', { domainId });
  }

  public async showHeroRelic(relicId: HeroRelicKey, domainId = 0): Promise<void> {
    if (relicId === 'championship_trophy') {
      await this.showChampionshipTrophy(domainId);
      return;
    }
    this.setLightingMode('BROADCAST');
    await this.setMorph('HERO_ARTIFACT_SYNTHESIS', { relicId, domainId });
  }

  public async showTitleShowcase(venue?: VenueCode): Promise<void> {
    if (venue) {
      await this.setVenue(venue);
    }
    this.setLightingMode('BROADCAST');
    const snapImmediate =
      !this.hasShownInitialShowcase ||
      this.cameraChoreographer.getShot() === 'TITLE_ESTABLISHING';
    this.hasShownInitialShowcase = true;
    await this.setMorph('SIGHTLINE_LOCK', {
      options: ['SPIN', 'PEEL', 'OVERCLOCK', 'VERITAS'],
      domainId: 0,
      initialIndex: 0,
      peelTier: 2,
    });
    this.setCameraShot('TITLE_ESTABLISHING', snapImmediate);
  }

  // ============================================================================
  // 3D POINTER GESTURE HANDLERS (SPIN · CROWN PEEL · HOLD OVERCLOCK · BLUFF FLICK)
  // ============================================================================

  private updateRaycasterFromEvent(e: PointerEvent): void {
    const canvas = this.renderer?.domElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    this.pointerNdc.x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    this.pointerNdc.y = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
    this.raycaster.setFromCamera(this.pointerNdc, this.cameraChoreographer.camera);
  }

  private handleWindowPointerDown(e: PointerEvent): void {
    if (!this.interactionEnabled || this.activePointerId !== null) return;
    const canvas = this.renderer?.domElement;
    if (!canvas) return;
    // Already handled directly by canvas listener
    if (e.target === canvas) return;

    // Never intercept interactive HUD cards, buttons, drawers, inputs, opaque modals, or bottom sheets,
    // while keeping transparent open 3D stage regions (including `.ws-meta-backdrop.is-stage-dock`) draggable!
    const targetEl = e.target instanceof Element ? e.target : null;
    if (
      targetEl?.closest(
        'button, a, input, select, textarea, label, [role="button"], ' +
          '.ws-frame-tableau, .ws-modal-panel, .ws-meta-shell, .ws-meta-sheet, ' +
          '.ws-meta-backdrop:not(.is-stage-dock), [role="dialog"]:not(.is-stage-dock), ' +
          '.ws-topbar, .ws-hud-top-bar, .ws-top-bar, .ws-vault-drawer, .ws-vault-backdrop, ' +
          '.ws-broadcast-dock, .ws-bottom-dock, .ws-hub-container, .ws-hub-shell, ' +
          '.ws-title-dock, .ws-title-pedestal, .ws-title-card, .ws-summary-card, ' +
          '.ws-end-crown-sheet, .ws-dialogue-card, .ws-coach-pill, ' +
          '.ws-globe-pin-controls, .ws-visual-plate-frame, .ws-duel-banner, .ws-duel-live-split-bar, ' +
          '.ws-honour-toast, .ws-save-modal, .ws-briefing-modal'
      )
    ) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      return;
    }

    this.handlePointerDown(e);
  }

  private handlePointerDown(e: PointerEvent): void {
    if (!this.interactionEnabled || this.activePointerId !== null) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const canvas = this.renderer?.domElement;
    if (canvas && e.target === canvas) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Ignore synthetic / uncapturable pointer events
      }
    }

    this.activePointerId = e.pointerId;
    this.downX = e.clientX;
    this.downY = e.clientY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.downTimeMs = performance.now();
    this.lastMoveTimeMs = this.downTimeMs;
    this.totalDragPx = 0;
    this.codexAccumPx = 0;
    this.downHitFacetIndex = null;
    this.downHitGlobeVenue = null;
    this.downHitGlobeCoords = null;
    this.holdOverclockArmed = false;
    this.holdOverclockCancelled = false;
    this.holdCharge01 = 0;

    this.updateRaycasterFromEvent(e);
    const hit = this.prismRig.raycastAction(this.raycaster);
    const arch = this.prismRig.getArchetype();
    const activeShot = this.cameraChoreographer.getShot();

    // Direct 1-finger touch/mouse 360° orbit & spin on Title Screen, 3D Observatory, and Trophy Showcase
    if (
      activeShot === 'TITLE_ESTABLISHING' ||
      activeShot === 'RELIC_OBSERVATORY' ||
      activeShot === 'TROPHY_HERO'
    ) {
      this.gestureMode = 'INSPECT_DRAG';
    } else if (hit?.kind === 'CROWN' && !this.peelLocked) {
      this.gestureMode = 'CROWN_PULL';
    } else if (arch === 'SIGHTLINE_LOCK') {
      this.gestureMode = 'PRISM_SPIN_OR_HOLD';
      this.downStartFacetIndex = this.prismRig.getSelectedFacetIndex();
      this.downHitFacetIndex = hit?.kind === 'FACET' ? (hit.facetIndex ?? null) : null;
      // Arm Hold-to-Overclock if pressing directly on the front Sightline-locked facet
      if (this.downHitFacetIndex === this.downStartFacetIndex) {
        this.holdOverclockArmed = true;
      }
    } else if (arch === 'CODEX_DUAL_RING') {
      this.gestureMode =
        hit?.kind === 'CODEX_BOTTOM' ? 'CODEX_BOTTOM_DRAG' : 'CODEX_TOP_DRAG';
    } else if (arch === 'CALIBRATOR_DIAL') {
      this.gestureMode = 'CALIBRATOR_DRAG';
    } else if (arch === 'GAUNTLET_SHATTER') {
      this.gestureMode = 'GAUNTLET_SWIPE';
    } else if (arch === 'WORLD_GLOBE') {
      this.gestureMode = 'GLOBE_DRAG';
      if (this.prismRig.isGlobePinDropMode()) {
        if (hit?.kind === 'GLOBE_BODY' && hit.globeCoords) {
          this.downHitGlobeCoords = hit.globeCoords;
        }
      } else if (hit?.kind === 'GLOBE_PIN' && hit.venueCode) {
        this.downHitGlobeVenue = hit.venueCode;
      }
    } else {
      this.gestureMode = 'INSPECT_DRAG';
    }
  }

  private handlePointerMove(e: PointerEvent): void {
    const canvas = this.renderer?.domElement;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      this.cameraChoreographer.setPointerParallax(nx, ny);
    }

    if (this.activePointerId !== e.pointerId || !this.interactionEnabled) return;

    const now = performance.now();
    const dtSec = Math.max(0.004, (now - this.lastMoveTimeMs) / 1000);
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.lastMoveTimeMs = now;
    this.totalDragPx += Math.hypot(dx, dy);

    const viewW = Math.max(320, canvas?.clientWidth ?? 420);
    const viewH = Math.max(240, canvas?.clientHeight ?? 720);
    const peelThresholdPx = viewH <= 520 ? 36 : 52;

    switch (this.gestureMode) {
      case 'CROWN_PULL': {
        const pullPx = Math.max(0, e.clientY - this.downY);
        const progress = THREE.MathUtils.clamp(pullPx / (peelThresholdPx + 2), 0, 1);
        this.prismRig.setCrownPullProgress(progress);
        if (pullPx >= peelThresholdPx && this.prismRig.getPeelTier() < 3) {
          const newTier = this.triggerPeel();
          if (newTier > 1) {
            this.events.onPeelTriggered?.(newTier as 2 | 3);
          }
          this.gestureMode = 'NONE';
        }
        break;
      }

      case 'PRISM_OVERCLOCK_HOLD': {
        // Sideways flick during Overclock hold safely vents & cancels (`Bluff Echo` #111)!
        if (Math.abs(e.clientX - this.downX) > 42) {
          this.holdOverclockCancelled = true;
          this.holdOverclockArmed = false;
          this.holdCharge01 = 0;
          this.cancelOverclockBluff();
          this.events.onOverclockProgress?.(0, false);
          this.events.onOverclockCancelBluff?.();
          this.gestureMode = 'NONE';
        }
        break;
      }

      case 'PRISM_SPIN_OR_HOLD': {
        if (Math.abs(e.clientX - this.downX) > 10) {
          this.holdOverclockArmed = false;
          // Calibrated horizontal drag gain (#137 P0 #4): ~175px on desktop / ~115px on mobile = 90° facet advance
          const pxPer90Deg = Math.max(115, Math.min(200, viewW * 0.168));
          const dRad = dx * ((Math.PI * 0.5) / pxPer90Deg);
          const vel = dRad / dtSec;
          this.prismRig.applyCarouselDrag(dRad, vel);
        } else if (
          e.clientY - this.downY > (viewH <= 520 ? 26 : 36) &&
          !this.peelLocked &&
          Math.abs(e.clientX - this.downX) < 18
        ) {
          // Convenient downward swipe anywhere on the upper Prism also initiates Crown Peel
          this.holdOverclockArmed = false;
          this.gestureMode = 'CROWN_PULL';
        }
        break;
      }

      case 'CODEX_TOP_DRAG':
      case 'CODEX_BOTTOM_DRAG': {
        this.codexAccumPx += dx;
        if (Math.abs(this.codexAccumPx) >= 48) {
          const step = this.codexAccumPx > 0 ? -1 : 1;
          this.codexAccumPx = 0;
          this.prismRig.spinCodexRing(
            this.gestureMode === 'CODEX_TOP_DRAG' ? 'TOP' : 'BOTTOM',
            step,
            true,
            true
          );
        }
        break;
      }

      case 'CALIBRATOR_DRAG': {
        if (Math.abs(dx) >= Math.abs(dy)) {
          this.prismRig.nudgeCalibratorByRatio(dx / (viewW * 0.78));
        } else {
          // Vertical drag pinches/widens the 3D Golden Tolerance Sector Cone & snaps to canonical cone (#284 #16)
          const vertSpanPx = Math.max(200, viewH * 0.55);
          const curTol = THREE.MathUtils.clamp(
            0.1 + (e.clientY - this.downY) / vertSpanPx,
            0.02,
            0.22
          );
          const coneId: 'WIDE' | 'SHARP' | 'PINHOLE' =
            curTol <= 0.055 ? 'PINHOLE' : curTol <= 0.145 ? 'SHARP' : 'WIDE';
          const snappedTol = coneId === 'PINHOLE' ? 0.025 : coneId === 'SHARP' ? 0.1 : 0.2;
          const multLabel = coneId === 'PINHOLE' ? '3.5x' : coneId === 'SHARP' ? '2.5x' : '1.5x';
          this.prismRig.setCalibratorTolerance(snappedTol, multLabel);
          if (coneId !== this.lastCalibratorConeId) {
            this.lastCalibratorConeId = coneId;
            this.events.onCalibratorConeChanged?.(coneId, snappedTol);
          }
        }
        break;
      }

      case 'GLOBE_DRAG': {
        if (this.prismRig.isGlobePinDropMode()) {
          // Strict > 9px drag vs <= 9px tap-to-pin threshold so micro-jitter never shifts the globe on tap!
          if (this.totalDragPx > 9) {
            const dYaw = (dx / viewW) * 4.4;
            const dPitch = (dy / viewH) * 3.4;
            this.prismRig.applyGlobeDrag(dYaw, dYaw / dtSec, dPitch, dPitch / dtSec);
          }
        } else {
          const dYaw = (dx / viewW) * 4.4;
          this.prismRig.applyGlobeDrag(dYaw, dYaw / dtSec);
        }
        break;
      }

      case 'INSPECT_DRAG': {
        const dYaw = (dx / viewW) * 4.8;
        this.prismRig.applyInspectDrag(dYaw, dYaw / dtSec);
        if (Math.abs(dy) > 0.25) {
          const dPitch = (dy / viewH) * 1.15;
          this.cameraChoreographer.applyUserOrbitPitch(dPitch);
        }
        break;
      }
    }
  }

  private handlePointerUp(e: PointerEvent): void {
    if (this.activePointerId !== e.pointerId) return;
    const canvas = this.renderer?.domElement;
    if (canvas) {
      try {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore release errors for window-bound pointer drags
      }
    }

    const elapsedMs = performance.now() - this.downTimeMs;
    const netDx = e.clientX - this.downX;
    const netDy = e.clientY - this.downY;
    const netDistPx = Math.hypot(netDx, netDy);
    const totalSpanPx = Math.max(this.totalDragPx, netDistPx);

    switch (this.gestureMode) {
      case 'CROWN_PULL':
        this.prismRig.setCrownPullProgress(0);
        break;

      case 'PRISM_OVERCLOCK_HOLD': {
        if (!this.holdOverclockCancelled) {
          const idx = this.prismRig.getSelectedFacetIndex();
          const committedCharge = this.holdCharge01;
          this.holdCharge01 = 0;
          this.setOverclockState(false, 0);
          this.events.onOverclockProgress?.(0, false);
          // #284 #16: Exact >= 0.08 threshold aligned 1:1 with SovereignMasterController.commitCurrentAnswer()
          if (committedCharge >= 0.08) {
            this.events.onOverclockCommit?.(idx, committedCharge);
          } else {
            this.events.onSafeLock?.(idx);
          }
        }
        break;
      }

      case 'PRISM_SPIN_OR_HOLD': {
        if (totalSpanPx < 10 && elapsedMs < 260) {
          // Crisp short tap!
          if (
            this.downHitFacetIndex !== null &&
            this.downHitFacetIndex !== this.prismRig.getSelectedFacetIndex()
          ) {
            // Tapped a left/right flanking facet -> smoothly spin it into the Gold Sightline Beam!
            this.prismRig.spinToFacet(this.downHitFacetIndex, true);
          } else if (this.downHitFacetIndex === this.prismRig.getSelectedFacetIndex()) {
            // Short tap (< 0.25s) on the front Sightline-locked facet -> Safe Lock!
            this.events.onSafeLock?.(this.downHitFacetIndex);
          }
        } else {
          const snappedIdx = this.prismRig.releaseCarouselDrag();
          const vxPxPerMs = Math.abs(netDx) / Math.max(16, elapsedMs);
          // Exact #203 §2.3 guarantee: any horizontal drag >= 40px (even with 0..2 pointermove events!)
          // synchronously advances ±1 facet AND notifies onFacetSelected so 3D carousel & 2D HUD stay 100% locked!
          if (
            snappedIdx === this.downStartFacetIndex &&
            (Math.abs(netDx) >= 40 || (Math.abs(netDx) >= 24 && vxPxPerMs > 0.25)) &&
            Math.abs(netDx) >= Math.abs(netDy) * 0.85
          ) {
            // Drag left (netDx < 0, e.g. 525 -> 340) spins +X right-flank Facet B into +Z front Sightline (+1)
            const newFacetIndex = this.prismRig.stepFacet(netDx < 0 ? 1 : -1);
            this.events.onFacetSelected?.(newFacetIndex);
          } else if (snappedIdx !== this.downStartFacetIndex) {
            this.events.onFacetSelected?.(snappedIdx);
          }
        }
        break;
      }

      case 'GAUNTLET_SWIPE': {
        const viewH = Math.max(240, this.renderer?.domElement.clientHeight ?? 720);
        const upThresholdPx = viewH <= 520 ? -26 : -38;
        if (Math.hypot(netDx, netDy) > (viewH <= 520 ? 24 : 32)) {
          let verdict: 'VERIFY' | 'DEBUNK' | 'CHALLENGE';
          if (netDy < upThresholdPx && Math.abs(netDy) > Math.abs(netDx)) {
            verdict = 'CHALLENGE';
          } else {
            verdict = netDx >= 0 ? 'VERIFY' : 'DEBUNK';
          }
          this.shatterGauntletPlate(verdict);
          this.events.onGauntletSwipe?.(verdict);
        }
        break;
      }

      case 'GLOBE_DRAG': {
        this.prismRig.releaseGlobeDrag();
        if (this.prismRig.isGlobePinDropMode()) {
          if (totalSpanPx <= 9) {
            this.updateRaycasterFromEvent(e);
            const coords =
              this.prismRig.raycastGlobeSurface(this.raycaster) ?? this.downHitGlobeCoords;
            if (coords) {
              this.prismRig.setGlobeCandidatePin(coords.lat, coords.lon, false);
              this.events.onGlobePinSelected?.(coords.lat, coords.lon);
            }
          }
        } else if (this.totalDragPx < 10 && this.downHitGlobeVenue) {
          this.prismRig.focusGlobeCity(this.downHitGlobeVenue);
          this.events.onGlobeCitySelected?.(this.downHitGlobeVenue);
        }
        break;
      }

      case 'INSPECT_DRAG':
        this.prismRig.releaseInspectDrag();
        this.cameraChoreographer.releaseUserOrbitPitch();
        break;
    }

    this.activePointerId = null;
    this.gestureMode = 'NONE';
    this.holdOverclockArmed = false;
  }

  private handlePointerCancel(e: PointerEvent): void {
    if (this.activePointerId !== e.pointerId) return;
    this.cancelActiveGesture();
  }

  private cancelActiveGesture(): void {
    if (this.gestureMode === 'PRISM_OVERCLOCK_HOLD') {
      this.cancelOverclockBluff();
      this.events.onOverclockProgress?.(0, false);
    } else if (this.gestureMode === 'PRISM_SPIN_OR_HOLD') {
      this.prismRig.releaseCarouselDrag();
    } else if (this.gestureMode === 'GLOBE_DRAG') {
      this.prismRig.releaseGlobeDrag();
    } else if (this.gestureMode === 'INSPECT_DRAG') {
      this.prismRig.releaseInspectDrag();
      this.cameraChoreographer.releaseUserOrbitPitch();
    }
    this.activePointerId = null;
    this.gestureMode = 'NONE';
    this.holdOverclockArmed = false;
    this.holdCharge01 = 0;
  }

  // ============================================================================
  // MAIN RENDER LOOP
  // ============================================================================

  private startLoop(): void {
    const tick = (nowMs: number) => {
      if (this.disposed) return;
      this.rafId = requestAnimationFrame(tick);
      if (this.paused) return;

      const dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastTimeMs) / 1000));
      this.lastTimeMs = nowMs;

      // Advance Hold-to-Overclock (`0.26s -> 1.00s` ramps charge `0.0 -> 1.0` per #111)
      if (
        this.activePointerId !== null &&
        (this.holdOverclockArmed || this.gestureMode === 'PRISM_OVERCLOCK_HOLD') &&
        !this.holdOverclockCancelled
      ) {
        const heldSec = (nowMs - this.downTimeMs) / 1000;
        if (heldSec >= 0.26) {
          this.gestureMode = 'PRISM_OVERCLOCK_HOLD';
          this.holdCharge01 = THREE.MathUtils.clamp((heldSec - 0.26) / 0.74, 0, 1);
          this.setOverclockState(true, this.holdCharge01);
          this.events.onOverclockProgress?.(this.holdCharge01, true);
        }
      }

      this.venueLoader.update(dt);
      this.prismRig.update(dt, this.cameraChoreographer.camera);
      this.cameraChoreographer.update(dt);
      this.postFX?.update(dt);
      this.postFX?.render();
    };

    this.rafId = requestAnimationFrame(tick);
  }

  public dispose(): void {
    this.disposed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.resizeRafId !== null) {
      cancelAnimationFrame(this.resizeRafId);
      this.resizeRafId = null;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    window.removeEventListener('resize', this.onViewportReflowBound);
    window.removeEventListener('orientationchange', this.onViewportReflowBound);
    window.removeEventListener('ws:viewport-fit', this.onViewportReflowBound);
    window.visualViewport?.removeEventListener('resize', this.onViewportReflowBound);

    window.removeEventListener('pointerdown', this.onWindowPointerDownBound);
    window.removeEventListener('pointermove', this.onPointerMoveBound);
    window.removeEventListener('pointerup', this.onPointerUpBound);
    window.removeEventListener('pointercancel', this.onPointerCancelBound);

    const canvas = this.renderer?.domElement;
    if (canvas) {
      canvas.removeEventListener('pointerdown', this.onPointerDownBound);
      canvas.parentElement?.removeChild(canvas);
    }

    this.prismRig.dispose();
    this.venueLoader.dispose();
    this.postFX?.dispose();
    this.renderer?.dispose();
    this.renderer = null;
  }
}

/**
 * Optional self-contained 3D Championship Trophy Observatory widget for embedding directly inside
 * the Meridian Passport modal (`#113` item 4). Returns a clean `dispose()` teardown function.
 */
export function mountStandaloneTrophyPreview(
  container: HTMLElement,
  baseUrl = '/'
): () => void {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const rect = container.getBoundingClientRect();
  const w = Math.max(160, rect.width || 260);
  const h = Math.max(160, rect.height || 260);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.88;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(w, h, false);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  const envRT = pmrem.fromScene(roomEnv, 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.96;
  roomEnv.dispose();

  const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 20);
  camera.position.set(0, 0.56, 1.52);
  camera.lookAt(0, 0.42, 0);

  const keyLight = new THREE.DirectionalLight(0xffe9a8, 1.85);
  keyLight.position.set(1.5, 2.5, 2.2);
  const rimLight = new THREE.DirectionalLight(0x64b5ff, 1.05);
  rimLight.position.set(-1.8, 1.4, -1.5);
  scene.add(keyLight, rimLight);

  const holder = new THREE.Group();
  scene.add(holder);

  let disposed = false;
  const loader = new GLTFLoader();
  loader.load(`${cleanBase}assets/aaa_models/championship_trophy.glb`, (gltf) => {
    if (disposed) return;
    holder.add(gltf.scene);
  });

  const ro = new ResizeObserver(() => {
    if (disposed) return;
    const r = container.getBoundingClientRect();
    const nw = Math.max(1, r.width);
    const nh = Math.max(1, r.height);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh, false);
  });
  ro.observe(container);

  let raf = 0;
  let prev = performance.now();
  const animate = (now: number) => {
    if (disposed) return;
    raf = requestAnimationFrame(animate);
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    holder.rotation.y += dt * 0.65;
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(animate);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    disposeObject3D(holder);
    envRT.dispose();
    pmrem.dispose();
    renderer.forceContextLoss();
    renderer.dispose();
    renderer.domElement.parentElement?.removeChild(renderer.domElement);
  };
}

export type {
  CalibratorDialSpec,
  CameraShotId,
  CodexDualRingSpec,
  DomainId,
  GauntletShatterSpec,
  GlobeFlightArcSpec,
  GlobePinDropVisualSpec,
  HeroArtifactSpec,
  HeroRelicKey,
  LightingMode,
  MorphSpecMap,
  PrismArchetype,
  QualityTier,
  SightlineLockSpec,
  VenueCode,
  VisualBlueprintPlateSpec,
  WorldGlobeSpec,
};
