// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// `src/v7/toys/ReliefGlobeContraptionV7.ts`
//
// Label-Free 4K 3D Shaded-Relief & Bathymetry Globe (`TOY_05_RELIEF_GLOBE_3D`).
// Upgrades & wraps the `AtlasReliefGlobe3DV6` cartographic foundation:
//  - Streams `./assets/textures/v6/earth_relief_albedo_4k.webp`,
//    `earth_elevation_bump_2k.webp`, `earth_ocean_specular_2k.webp`
//  - ZERO text country labels or political borders!
//  - Binds studio `PMREMGenerator` warm-tungsten reflections onto its
//    C1-filleted brushed-brass meridian cradle (zero raw BoxGeometry props!)
//  - Smooth 1-finger touch orbit + 2-finger pinch/wheel zoom on mobile phones
//  - Tapping/planting the ivory-topped brass pushpin locks after a crisp
//    `280ms` confirmation ring fill (ZERO separate Submit button!)
//  - Reveals `fwidth()`-smooth Dashed Gold `350 KM` (`1.0x` Bullseye accuracy /
//    `1.25x` Chips) and Ticked Sky-Cyan `900 KM` (`0.65x` Near-Hit accuracy /
//    `0.85x` Chips) geodesic rings + luminous great-circle arc to true landmark!
// ============================================================================

import * as THREE from 'three';
import {
  AtlasReliefGlobe3DV6,
  formatCoordShort,
  haversineDistanceKm,
  latLngToVector3,
  vector3ToLatLng,
  type GeoPointV6,
} from '../../v6/toys/AtlasReliefGlobe3DV6';

// Re-export V6 cartographic lineage & geodesic math cleanly
export { AtlasReliefGlobe3DV6, formatCoordShort, haversineDistanceKm, latLngToVector3, vector3ToLatLng };

export interface ReliefGlobeLockResultV7 {
  readonly plantedCoord: GeoPointV6;
  readonly targetCoord: GeoPointV6;
  readonly distanceKm: number;
  /** 1.0 (<=350km Bullseye), 0.65 (<=900km Near-Hit), 0.50 (<=1600km Partial), 0.0 (>1600km). */
  readonly accuracyRatio: number;
  /** 1.25x (<=350km), 0.85x (<=900km), 0.50x (<=1600km), 0.0x (>1600km). */
  readonly chipMultiplier: number;
  readonly tierLabel: 'BULLSEYE_350KM' | 'NEAR_HIT_900KM' | 'REGIONAL_1600KM' | 'OFF_COURSE';
}

export interface ReliefGlobeOptionsV7 {
  readonly targetLat: number;
  readonly targetLng: number;
  readonly landmarkLabel: string;
  readonly regionHint?: string;
  readonly textureBasePath?: string;
  readonly initialFocus?: GeoPointV6;
  readonly reducedMotion?: boolean;
  /** Confirmation ring fill duration after planting ivory pushpin (default 280ms). */
  readonly confirmLockMs?: number;
  /** Post-lock geodesic reveal dwell before firing `onLock` (default 380ms). */
  readonly revealDwellMs?: number;
  readonly onPinPlanted?: (coord: GeoPointV6) => void;
  readonly onLock?: (result: ReliefGlobeLockResultV7) => void;
}

const EARTH_RADIUS_KM_V7 = 6371.0088;
const DEG2RAD_V7 = Math.PI / 180;
const RAD2DEG_V7 = 180 / Math.PI;

/** Shared texture cache across rapid matches so 4K Earth WebP maps decode once. */
interface SharedEarthTextureSet {
  fallback: THREE.CanvasTexture | null;
  albedo: THREE.Texture | null;
  bump: THREE.Texture | null;
  specular: THREE.Texture | null;
  loadingStarted: boolean;
  listeners: Array<() => void>;
}

const SHARED_EARTH_TEXTURES: SharedEarthTextureSet = {
  fallback: null,
  albedo: null,
  bump: null,
  specular: null,
  loadingStarted: false,
  listeners: [],
};

function getFallbackBathymetryTexture(): THREE.CanvasTexture {
  if (SHARED_EARTH_TEXTURES.fallback) {
    return SHARED_EARTH_TEXTURES.fallback;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#007799');
    grad.addColorStop(0.5, '#0096A6');
    grad.addColorStop(1, '#12467e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  SHARED_EARTH_TEXTURES.fallback = tex;
  return tex;
}

function resolveV6TextureUrl(filename: string, customBase?: string): string {
  if (customBase) {
    return `${customBase.replace(/\/$/, '')}/${filename}`;
  }
  const base =
    (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}assets/textures/v6/${filename}`;
}

function ensureSharedEarthTextures(maxAniso: number, customBase?: string, onUpdate?: () => void): void {
  if (onUpdate) {
    SHARED_EARTH_TEXTURES.listeners.push(onUpdate);
  }
  if (SHARED_EARTH_TEXTURES.loadingStarted) {
    if (onUpdate && (SHARED_EARTH_TEXTURES.albedo || SHARED_EARTH_TEXTURES.bump)) {
      onUpdate();
    }
    return;
  }
  SHARED_EARTH_TEXTURES.loadingStarted = true;
  const notify = (): void => {
    for (const fn of SHARED_EARTH_TEXTURES.listeners) fn();
  };

  const loader = new THREE.TextureLoader();
  loader.load(
    resolveV6TextureUrl('earth_relief_albedo_4k.webp', customBase),
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      SHARED_EARTH_TEXTURES.albedo = tex;
      notify();
    },
    undefined,
    () => {},
  );

  loader.load(
    resolveV6TextureUrl('earth_elevation_bump_2k.webp', customBase),
    (tex) => {
      tex.anisotropy = Math.min(4, maxAniso);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      SHARED_EARTH_TEXTURES.bump = tex;
      notify();
    },
    undefined,
    () => {},
  );

  loader.load(
    resolveV6TextureUrl('earth_ocean_specular_2k.webp', customBase),
    (tex) => {
      tex.anisotropy = Math.min(4, maxAniso);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      SHARED_EARTH_TEXTURES.specular = tex;
      notify();
    },
    undefined,
    () => {},
  );
}

/**
 * Evaluates exact V7 geodesic distance tiers:
 *  - <= 350 km: Bullseye (1.0x accuracyRatio, 1.25x chipMultiplier)
 *  - <= 900 km: Near-Hit (0.65x accuracyRatio, 0.85x chipMultiplier)
 *  - <= 1600 km: Regional Partial Credit (0.50x accuracyRatio, 0.50x chipMultiplier)
 *  - > 1600 km: Off-Course (0.0x)
 */
export function evaluateReliefGlobeDistanceV7(
  plantedCoord: GeoPointV6,
  targetCoord: GeoPointV6,
): ReliefGlobeLockResultV7 {
  const rawKm = haversineDistanceKm(
    plantedCoord.lat,
    plantedCoord.lng,
    targetCoord.lat,
    targetCoord.lng,
  );
  const distanceKm = Math.round(rawKm);
  if (rawKm <= 350) {
    return {
      plantedCoord,
      targetCoord,
      distanceKm,
      accuracyRatio: 1.0,
      chipMultiplier: 1.25,
      tierLabel: 'BULLSEYE_350KM',
    };
  }
  if (rawKm <= 900) {
    return {
      plantedCoord,
      targetCoord,
      distanceKm,
      accuracyRatio: 0.65,
      chipMultiplier: 0.85,
      tierLabel: 'NEAR_HIT_900KM',
    };
  }
  if (rawKm <= 1600) {
    return {
      plantedCoord,
      targetCoord,
      distanceKm,
      accuracyRatio: 0.5,
      chipMultiplier: 0.5,
      tierLabel: 'REGIONAL_1600KM',
    };
  }
  return {
    plantedCoord,
    targetCoord,
    distanceKm,
    accuracyRatio: 0.0,
    chipMultiplier: 0.0,
    tierLabel: 'OFF_COURSE',
  };
}

/**
 * Builds a warm-tungsten broadcast studio scene for `THREE.PMREMGenerator` so
 * the C1-filleted brass meridian cradle catches authentic warm studio softboxes.
 */
function buildWarmTungstenPMREM(renderer: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  // 1966 Living Color Peacock Navy studio surround (ZERO muddy dark brown!)
  envScene.background = new THREE.Color(0x0b1e33);

  // Warm 3100K quartz-tungsten overhead softbox dome
  const keyGeo = new THREE.SphereGeometry(6, 24, 16);
  const keyMat = new THREE.MeshBasicMaterial({ color: 0xffe8b8, side: THREE.BackSide });
  const keyDome = new THREE.Mesh(keyGeo, keyMat);
  keyDome.scale.set(1, 0.35, 1);
  keyDome.position.set(3.5, 6.5, 4.0);
  envScene.add(keyDome);

  // Harvest Gold studio brass reflector band
  const fillGeo = new THREE.TorusGeometry(8.5, 0.9, 12, 36);
  const fillMat = new THREE.MeshBasicMaterial({ color: 0xf4b644 });
  const fillRing = new THREE.Mesh(fillGeo, fillMat);
  fillRing.rotation.x = Math.PI * 0.42;
  envScene.add(fillRing);

  // Living Color Peacock Teal & CBS Cobalt cyclorama rim accent
  const rimGeo = new THREE.CylinderGeometry(9.5, 9.5, 2.6, 24, 1, true);
  const rimMat = new THREE.MeshBasicMaterial({ color: 0x009bb0, side: THREE.DoubleSide });
  const rimCyl = new THREE.Mesh(rimGeo, rimMat);
  rimCyl.position.y = -2.8;
  envScene.add(rimCyl);

  const envRT = pmrem.fromScene(envScene, 0.032);
  keyGeo.dispose();
  keyMat.dispose();
  fillGeo.dispose();
  fillMat.dispose();
  rimGeo.dispose();
  rimMat.dispose();
  pmrem.dispose();
  return envRT;
}

/** 1x1 neutral fallback mask DataTexture so custom GLSL uniforms are always valid WebGL2 samplers. */
function createNeutral1x1DataTexture(r: number, g: number, b: number): THREE.DataTexture {
  const tex = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

const GLOBE_FOV_DEG_V7 = 38;
const GLOBE_FRAMED_BOUND_RADIUS_V7 = 1.19; // Earth (1.0) + Rand McNally brass meridian ring & polar bushings (1.185)

function computeGlobeFramedDistanceV7(aspect: number): number {
  const halfVertTan = Math.tan(GLOBE_FOV_DEG_V7 * 0.5 * DEG2RAD_V7);
  const safeAspect = THREE.MathUtils.clamp(Number.isFinite(aspect) ? aspect : 1.35, 0.48, 3.2);
  const limitingTan = Math.min(halfVertTan, halfVertTan * safeAspect);
  // Target ~84% framing of the full brass meridian + polar finials -> generous margin, 0px pole clipping!
  const targetTan = limitingTan * 0.84;
  const dist = GLOBE_FRAMED_BOUND_RADIUS_V7 * Math.sqrt(1 + 1 / (targetTan * targetTan));
  return THREE.MathUtils.clamp(dist, 3.75, 5.6);
}

export class ReliefGlobeContraptionV7 {
  private readonly hostEl: HTMLElement;
  private readonly stageEl: HTMLDivElement;
  private readonly coordBadgeEl: HTMLDivElement;
  private readonly statusBadgeEl: HTMLDivElement;
  private readonly options: ReliefGlobeOptionsV7;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly pmremTarget: THREE.WebGLRenderTarget;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly globeRoot: THREE.Group;
  private readonly earthMesh: THREE.Mesh;
  private readonly earthMaterial: THREE.MeshPhysicalMaterial;
  private readonly overlayGroup: THREE.Group;
  private readonly cradleGroup: THREE.Group;
  private readonly keyLight: THREE.DirectionalLight;
  private readonly raycaster = new THREE.Raycaster();
  private readonly resizeObserver: ResizeObserver;

  private readonly disposableGeometries: THREE.BufferGeometry[] = [];
  private readonly disposableMaterials: THREE.Material[] = [];
  private readonly disposableTextures: THREE.Texture[] = [];
  private readonly textureListener: () => void;
  private readonly livingColorUniforms: {
    uOceanMaskMap: { value: THREE.Texture };
    uElevBumpMap: { value: THREE.Texture };
    uHasLivingColorMap: { value: number };
    uHasOceanMask: { value: number };
    uHasElevBump: { value: number };
  };

  // Orbital camera state
  private camLatDeg = 20;
  private camLngDeg = 10;
  private camDistance = 4.28;
  private targetDistance = 4.28;
  private maxZoomDistance = 5.6;
  private velLat = 0;
  private velLng = 0;
  private userHasInteracted = false;

  private flyTween: {
    startLat: number;
    startLng: number;
    startDist: number;
    endLat: number;
    endLng: number;
    endDist: number;
    elapsed: number;
    duration: number;
  } | null = null;

  // Touch / Pinch / Tap tracking
  private readonly activePointers = new Map<number, { x: number; y: number }>();
  private primaryPointerId: number | null = null;
  private pointerDownX = 0;
  private pointerDownY = 0;
  private pointerDownMs = 0;
  private pointerMovedPx = 0;
  private lastDragX = 0;
  private lastDragY = 0;
  private lastPinchDist = 0;

  // Ivory Pushpin + 280ms Confirmation Ring Fill + fwidth() Geodesic Reveal
  private plantedCoord: GeoPointV6 | null = null;
  private ivoryPinGroup: THREE.Group | null = null;
  private ivoryPinDropProgress = 1;
  private confirmRingShaderMat: THREE.ShaderMaterial | null = null;
  private confirmElapsedMs = 0;
  private readonly confirmLockMs: number;
  private isConfirming = false;
  private isLocked = false;
  private lockResolvedSent = false;
  private postLockElapsedMs = 0;
  private readonly revealDwellMs: number;
  private pendingResult: ReliefGlobeLockResultV7 | null = null;

  private geodesicRingsMat: THREE.ShaderMaterial | null = null;
  private geodesicArcMesh: THREE.Mesh | null = null;
  private geodesicArcTotalIndices = 0;
  private geodesicArcProgress = 0;

  private rafId = 0;
  private lastFrameMs = 0;
  private elapsedSec = 0;
  private disposed = false;

  constructor(container: HTMLElement, options: ReliefGlobeOptionsV7) {
    this.hostEl = container;
    this.options = options;
    this.confirmLockMs = Math.max(80, options.confirmLockMs ?? 280);
    this.revealDwellMs = Math.max(120, options.revealDwellMs ?? 380);

    // Frame gentle initial view offset from target region without giving away bullseye
    if (options.initialFocus) {
      this.camLatDeg = THREE.MathUtils.clamp(options.initialFocus.lat, -75, 75);
      this.camLngDeg = options.initialFocus.lng;
    } else {
      // Deterministic broad continental framing (~32 deg offset so landmark is reachable on hemisphere)
      this.camLatDeg = THREE.MathUtils.clamp(options.targetLat * 0.55 + 10, -68, 68);
      this.camLngDeg = (((options.targetLng + 26 + 180) % 360) + 360) % 360 - 180;
    }

    // 1. Responsive Label-Free 1966 Rand McNally Peacock-Navy Studio Monitor Wrapper
    //    (Opaque Peacock Navy #0B1E33 radial studio backdrop — ZERO muddy brown bleed-through!)
    this.stageEl = document.createElement('div');
    this.stageEl.className = 'ws7-relief-globe-stage';
    this.stageEl.style.cssText = [
      'position:relative',
      'width:100%',
      'height:100%',
      'min-height:192px',
      'max-height:100%',
      'border-radius:14px',
      'overflow:hidden',
      'background:radial-gradient(ellipse at 50% 48%, #153c61 0%, #0d2540 56%, #08182b 100%)',
      'box-shadow:inset 0 0 26px rgba(0,168,184,0.22), 0 6px 18px rgba(5,14,26,0.42)',
      'border:2px solid rgba(242,169,34,0.52)',
      'box-sizing:border-box',
      'touch-action:none',
      'user-select:none',
    ].join(';');
    this.hostEl.appendChild(this.stageEl);

    // Sleek 1966 Broadcast Coordinate Ribbon (>= 14px floor, zero monospace, zero country labels!)
    this.coordBadgeEl = document.createElement('div');
    this.coordBadgeEl.className = 'ws7-globe-coord-pill';
    this.coordBadgeEl.style.cssText = [
      'position:absolute',
      'top:8px',
      'left:8px',
      'padding:3px 9px',
      'border-radius:999px',
      'background:rgba(10,27,46,0.9)',
      'border:1px solid rgba(242,169,34,0.45)',
      'color:#FFF6E3',
      "font:700 14px/1.2 'Jost', 'Plus Jakarta Sans', system-ui, sans-serif",
      'font-variant-numeric:tabular-nums',
      'letter-spacing:0.02em',
      'box-shadow:0 2px 8px rgba(0,0,0,0.34)',
      'pointer-events:none',
      'z-index:2',
    ].join(';');
    this.coordBadgeEl.textContent = formatCoordShort(this.camLatDeg, this.camLngDeg);
    this.stageEl.appendChild(this.coordBadgeEl);

    this.statusBadgeEl = document.createElement('div');
    this.statusBadgeEl.className = 'ws7-globe-status-pill';
    this.statusBadgeEl.style.cssText = [
      'position:absolute',
      'top:8px',
      'right:8px',
      'max-width:54%',
      'padding:3px 9px',
      'border-radius:999px',
      'background:linear-gradient(180deg, #00B2C4 0%, #007E8C 100%)',
      'color:#FFFDF7',
      "font:800 14px/1.2 'Jost', 'Plus Jakarta Sans', system-ui, sans-serif",
      'letter-spacing:0.015em',
      'text-align:center',
      'box-shadow:0 2px 0 #00525E, 0 4px 10px rgba(0,0,0,0.32)',
      'pointer-events:none',
      'z-index:2',
    ].join(';');
    this.statusBadgeEl.textContent = 'DRAG · TAP';
    this.stageEl.appendChild(this.statusBadgeEl);

    // 2. Hardware WebGL 2.0 Renderer (alpha: true composites over opaque Peacock Navy radial stage!)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.25));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.16;
    this.renderer.setClearColor(0x0b1e33, 0.0);
    this.renderer.domElement.style.cssText =
      'width:100%;height:100%;display:block;touch-action:none;cursor:grab;';
    this.stageEl.appendChild(this.renderer.domElement);

    // 3. Studio Warm-Tungsten & Peacock PMREM Environment Reflections
    this.pmremTarget = buildWarmTungstenPMREM(this.renderer);
    this.scene = new THREE.Scene();
    this.scene.environment = this.pmremTarget.texture;

    const initW = Math.max(160, this.stageEl.clientWidth || 340);
    const initH = Math.max(160, this.stageEl.clientHeight || 220);
    const initAspect = initW / initH;
    this.camera = new THREE.PerspectiveCamera(GLOBE_FOV_DEG_V7, initAspect, 0.1, 36);
    this.renderer.setSize(initW, initH, false);

    // Frame full Earth + Rand McNally brass meridian ring & polar bushings cleanly (0px pole clipping!)
    const initialDist = computeGlobeFramedDistanceV7(initAspect);
    this.camDistance = initialDist;
    this.targetDistance = initialDist;
    this.maxZoomDistance = Math.max(5.6, initialDist * 1.35);

    // 4. Radiant 300-Footcandle 1966 Studio Cartographic Key + Rim Lighting
    const hemi = new THREE.HemisphereLight(0xfff7e6, 0x103658, 1.05);
    this.scene.add(hemi);

    this.keyLight = new THREE.DirectionalLight(0xfff4de, 2.35);
    this.keyLight.position.set(4.5, 3.2, 5.2);
    this.scene.add(this.keyLight);

    const rim = new THREE.DirectionalLight(0x3ad8ee, 1.3);
    rim.position.set(-4.5, -1.5, -3.8);
    this.scene.add(rim);

    // 5. Label-Free 4K 1966 Rand McNally Living Color Shaded-Relief Earth Sphere
    this.globeRoot = new THREE.Group();
    this.scene.add(this.globeRoot);

    this.overlayGroup = new THREE.Group();
    this.globeRoot.add(this.overlayGroup);

    const fallbackOceanTex = createNeutral1x1DataTexture(255, 255, 255);
    const fallbackElevTex = createNeutral1x1DataTexture(90, 90, 90);
    this.disposableTextures.push(fallbackOceanTex, fallbackElevTex);
    this.livingColorUniforms = {
      uOceanMaskMap: { value: SHARED_EARTH_TEXTURES.specular ?? fallbackOceanTex },
      uElevBumpMap: { value: SHARED_EARTH_TEXTURES.bump ?? fallbackElevTex },
      uHasLivingColorMap: { value: SHARED_EARTH_TEXTURES.albedo ? 1.0 : 0.0 },
      uHasOceanMask: { value: SHARED_EARTH_TEXTURES.specular ? 1.0 : 0.0 },
      uHasElevBump: { value: SHARED_EARTH_TEXTURES.bump ? 1.0 : 0.0 },
    };

    const earthGeo = new THREE.SphereGeometry(1, 112, 84);
    this.disposableGeometries.push(earthGeo);
    this.earthMaterial = new THREE.MeshPhysicalMaterial({
      map: SHARED_EARTH_TEXTURES.albedo ?? getFallbackBathymetryTexture(),
      bumpMap: SHARED_EARTH_TEXTURES.bump ?? null,
      bumpScale: 0.042,
      specularIntensityMap: SHARED_EARTH_TEXTURES.specular ?? null,
      clearcoatMap: SHARED_EARTH_TEXTURES.specular ?? null,
      roughness: 0.66,
      metalness: 0.04,
      clearcoat: 0.5,
      clearcoatRoughness: 0.22,
      envMapIntensity: 0.48,
      specularIntensity: 0.85,
      specularColor: new THREE.Color(0x9be5ff),
    });

    // 1966 Rand McNally Mid-Century Classroom Relief-Globe Color Grading Shader
    // Transforms dark satellite imagery into radiant Peacock Teal oceans + sunlit
    // Harvest Gold / Vintage Parchment continents + terracotta mountain relief (zero labels!).
    this.earthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uOceanMaskMap = this.livingColorUniforms.uOceanMaskMap;
      shader.uniforms.uElevBumpMap = this.livingColorUniforms.uElevBumpMap;
      shader.uniforms.uHasLivingColorMap = this.livingColorUniforms.uHasLivingColorMap;
      shader.uniforms.uHasOceanMask = this.livingColorUniforms.uHasOceanMask;
      shader.uniforms.uHasElevBump = this.livingColorUniforms.uHasElevBump;

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <map_pars_fragment>',
          `#include <map_pars_fragment>
          uniform sampler2D uOceanMaskMap;
          uniform sampler2D uElevBumpMap;
          uniform float uHasLivingColorMap;
          uniform float uHasOceanMask;
          uniform float uHasElevBump;`,
        )
        .replace(
          '#include <map_fragment>',
          `#ifdef USE_MAP
            vec4 sampledDiffuseColor = texture2D( map, vMapUv );
            if (uHasLivingColorMap > 0.5) {
              vec3 sat = pow(max(sampledDiffuseColor.rgb, vec3(0.0001)), vec3(1.0 / 2.2));
              float oceanSample = uHasOceanMask > 0.5
                ? texture2D(uOceanMaskMap, vMapUv).r
                : clamp((sat.b - sat.r) * 3.5, 0.0, 1.0);
              float oceanMask = smoothstep(0.32, 0.62, oceanSample);
              float elev = uHasElevBump > 0.5
                ? texture2D(uElevBumpMap, vMapUv).r
                : clamp((sat.r + sat.g) * 0.5, 0.0, 1.0);
              float satLum = dot(sat, vec3(0.299, 0.587, 0.114));
              float satMax = max(sat.r, max(sat.g, sat.b));
              float satMin = min(sat.r, min(sat.g, sat.b));
              float chroma = satMax - satMin;

              // Peacock Teal & Mid-Century Turquoise Bathymetry Oceans
              float shelf = clamp((satLum - 0.11) * 3.2, 0.0, 1.0);
              vec3 deepPeacock = vec3(0.04, 0.43, 0.58);
              vec3 midTurquoise = vec3(0.11, 0.67, 0.77);
              vec3 shallowAqua = vec3(0.34, 0.85, 0.89);
              vec3 oceanRgb = mix(deepPeacock, midTurquoise, smoothstep(0.05, 0.62, shelf));
              oceanRgb = mix(oceanRgb, shallowAqua, smoothstep(0.55, 1.0, shelf) * 0.62);

              float coastHalo = smoothstep(0.0, 0.45, oceanMask) * (1.0 - smoothstep(0.55, 1.0, oceanMask));

              // Sunlit 1966 Rand McNally Classroom Relief Continents (Harvest Gold, Sage Cream & Terracotta Peaks)
              float dryness = clamp((sat.r - sat.g) * 3.6 + 0.44, 0.0, 1.0);
              float iceMask = smoothstep(0.68, 0.86, satLum) * (1.0 - smoothstep(0.08, 0.22, chroma));
              vec3 sageLowland = vec3(0.80, 0.85, 0.58);
              vec3 warmParchment = vec3(0.94, 0.85, 0.59);
              vec3 harvestGold = vec3(0.96, 0.74, 0.35);
              vec3 sierraRelief = vec3(0.85, 0.53, 0.26);
              vec3 polarIvory = vec3(0.97, 0.95, 0.89);

              vec3 landRgb = mix(sageLowland, warmParchment, smoothstep(0.18, 0.60, dryness));
              landRgb = mix(landRgb, harvestGold, smoothstep(0.55, 0.92, dryness));
              landRgb = mix(landRgb, sierraRelief, smoothstep(0.36, 0.80, elev) * 0.76);
              landRgb = mix(landRgb, polarIvory, iceMask);
              landRgb = mix(landRgb, vec3(0.45, 0.33, 0.16), coastHalo * 0.34);

              vec3 gradedSrgb = mix(landRgb, oceanRgb + vec3(0.16, 0.22, 0.20) * coastHalo * 0.55, oceanMask);
              sampledDiffuseColor.rgb = pow(clamp(gradedSrgb, vec3(0.0), vec3(1.0)), vec3(2.2));
            }
            diffuseColor *= sampledDiffuseColor;
          #endif`,
        );
    };
    this.earthMaterial.customProgramCacheKey = () => 'rand-mcnally-1966-living-color-v1';
    this.disposableMaterials.push(this.earthMaterial);

    this.earthMesh = new THREE.Mesh(earthGeo, this.earthMaterial);
    this.earthMesh.name = 'ReliefGlobeEarthV7';
    this.globeRoot.add(this.earthMesh);

    this.buildRayleighAtmosphere();
    this.buildSubtleGraticule();

    // 6. C1-Filleted Spun-Brass Rand McNally Calibrated Meridian Cradle
    this.cradleGroup = this.buildC1FilletedBrassCradle();
    this.scene.add(this.cradleGroup);

    // 7. Stream / Bind Shared 4K Relief + 2K Bump + 2K Specular Textures
    const maxAniso = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.textureListener = () => {
      if (this.disposed) return;
      if (SHARED_EARTH_TEXTURES.albedo) {
        this.earthMaterial.map = SHARED_EARTH_TEXTURES.albedo;
        this.livingColorUniforms.uHasLivingColorMap.value = 1.0;
      }
      if (SHARED_EARTH_TEXTURES.bump) {
        this.earthMaterial.bumpMap = SHARED_EARTH_TEXTURES.bump;
        this.livingColorUniforms.uElevBumpMap.value = SHARED_EARTH_TEXTURES.bump;
        this.livingColorUniforms.uHasElevBump.value = 1.0;
      }
      if (SHARED_EARTH_TEXTURES.specular) {
        this.earthMaterial.specularIntensityMap = SHARED_EARTH_TEXTURES.specular;
        this.earthMaterial.clearcoatMap = SHARED_EARTH_TEXTURES.specular;
        this.livingColorUniforms.uOceanMaskMap.value = SHARED_EARTH_TEXTURES.specular;
        this.livingColorUniforms.uHasOceanMask.value = 1.0;
      }
      this.earthMaterial.needsUpdate = true;
    };
    ensureSharedEarthTextures(maxAniso, options.textureBasePath, this.textureListener);

    // 8. Bind Touch / Pointer / Wheel / Resize Events
    this.bindEvents();
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.stageEl);
    this.updateCameraTransform();

    this.lastFrameMs = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private buildRayleighAtmosphere(): void {
    const haloGeo = new THREE.SphereGeometry(1.058, 56, 40);
    this.disposableGeometries.push(haloGeo);
    const haloMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x4db5ff) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float rim = clamp(0.65 - dot(vNormal, vViewDir), 0.0, 1.0);
          float glow = pow(rim, 2.7) * 1.1;
          gl_FragColor = vec4(uColor * 1.12, glow * 0.65);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.disposableMaterials.push(haloMat);
    this.globeRoot.add(new THREE.Mesh(haloGeo, haloMat));
  }

  private buildSubtleGraticule(): void {
    const r = 1.003;
    const majorPts: number[] = [];
    const minorPts: number[] = [];

    // Major Rand McNally reference circles: Equator (0°), Tropics (±23.5°), Arctic/Antarctic (±66.5°)
    for (const lat of [-66.5, -23.5, 0, 23.5, 66.5]) {
      const steps = 96;
      const target = lat === 0 ? majorPts : minorPts;
      for (let i = 0; i < steps; i++) {
        const a = latLngToVector3(lat, -180 + (i / steps) * 360, r);
        const b = latLngToVector3(lat, -180 + ((i + 1) / steps) * 360, r);
        target.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    // Standard 30° latitude parallels
    for (let lat = -60; lat <= 60; lat += 30) {
      if (lat === 0) continue;
      const steps = 84;
      for (let i = 0; i < steps; i++) {
        const a = latLngToVector3(lat, -180 + (i / steps) * 360, r);
        const b = latLngToVector3(lat, -180 + ((i + 1) / steps) * 360, r);
        minorPts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    // 15°/30° longitude meridians (Prime Meridian 0° & 180° emphasized)
    for (let lng = -180; lng < 180; lng += 30) {
      const steps = 56;
      const target = lng === 0 || lng === -180 ? majorPts : minorPts;
      for (let i = 0; i < steps; i++) {
        const a = latLngToVector3(-80 + (i / steps) * 160, lng, r);
        const b = latLngToVector3(-80 + ((i + 1) / steps) * 160, lng, r);
        target.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    const minorGeo = new THREE.BufferGeometry();
    minorGeo.setAttribute('position', new THREE.Float32BufferAttribute(minorPts, 3));
    const majorGeo = new THREE.BufferGeometry();
    majorGeo.setAttribute('position', new THREE.Float32BufferAttribute(majorPts, 3));
    this.disposableGeometries.push(minorGeo, majorGeo);

    const minorMat = new THREE.LineBasicMaterial({
      color: 0xfff1c9,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });
    const majorMat = new THREE.LineBasicMaterial({
      color: 0xffd56b,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    });
    this.disposableMaterials.push(minorMat, majorMat);
    this.globeRoot.add(
      new THREE.LineSegments(minorGeo, minorMat),
      new THREE.LineSegments(majorGeo, majorMat),
    );
  }

  /**
   * Sculpted C1-filleted spun-brass 1966 Rand McNally Calibrated Meridian Cradle
   * (zero raw BoxGeometry props!) w/ 72 radial degree vernier ticks & compact polar bushings
   * (max vertical radius 1.185 so the entire cradle fits inside the viewport with zero pole clipping!).
   */
  private buildC1FilletedBrassCradle(): THREE.Group {
    const group = new THREE.Group();

    const giltBrassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4c654,
      metalness: 0.94,
      roughness: 0.18,
      clearcoat: 0.62,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.55,
    });
    const antiqueBrassMat = new THREE.MeshPhysicalMaterial({
      color: 0xb6862e,
      metalness: 0.9,
      roughness: 0.28,
      clearcoat: 0.4,
      envMapIntensity: 1.25,
    });
    this.disposableMaterials.push(giltBrassMat, antiqueBrassMat);

    // C1-filleted twin-bezel spun-brass meridian ring
    const mainRingGeo = new THREE.TorusGeometry(1.112, 0.02, 24, 144);
    const innerFilletGeo = new THREE.TorusGeometry(1.09, 0.0075, 16, 144);
    const outerFilletGeo = new THREE.TorusGeometry(1.132, 0.007, 16, 144);
    this.disposableGeometries.push(mainRingGeo, innerFilletGeo, outerFilletGeo);

    group.add(new THREE.Mesh(mainRingGeo, giltBrassMat));
    group.add(new THREE.Mesh(innerFilletGeo, antiqueBrassMat));
    group.add(new THREE.Mesh(outerFilletGeo, antiqueBrassMat));

    // 72 precision calibrated degree vernier ticks (every 5° fine, 15° medium, 30° bold, 90° cardinal)
    const fineTickGeo = new THREE.CapsuleGeometry(0.0038, 0.015, 4, 8);
    const medTickGeo = new THREE.CapsuleGeometry(0.006, 0.024, 6, 12);
    const majorTickGeo = new THREE.CapsuleGeometry(0.0088, 0.034, 8, 14);
    this.disposableGeometries.push(fineTickGeo, medTickGeo, majorTickGeo);
    for (let deg = 0; deg < 360; deg += 5) {
      const rad = deg * DEG2RAD_V7;
      const isMajor = deg % 30 === 0;
      const isMed = !isMajor && deg % 15 === 0;
      const tick = new THREE.Mesh(
        isMajor ? majorTickGeo : isMed ? medTickGeo : fineTickGeo,
        isMajor ? giltBrassMat : antiqueBrassMat,
      );
      const rTick = isMajor ? 1.118 : 1.112;
      tick.position.set(Math.cos(rad) * rTick, Math.sin(rad) * rTick, 0);
      tick.rotation.z = rad + Math.PI * 0.5;
      group.add(tick);
    }

    // Compact lathe-turned C1-filleted polar spindle bushings (max tip y = ±1.182 — zero clipping!)
    const lathePts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.018, 0.006),
      new THREE.Vector2(0.019, 0.075),
      new THREE.Vector2(0.032, 0.098),
      new THREE.Vector2(0.022, 0.122),
      new THREE.Vector2(0.034, 0.145),
      new THREE.Vector2(0.02, 0.166),
      new THREE.Vector2(0.0, 0.176),
    ];
    const finialLatheGeo = new THREE.LatheGeometry(lathePts, 24);
    this.disposableGeometries.push(finialLatheGeo);

    for (const sign of [1, -1]) {
      const finial = new THREE.Mesh(finialLatheGeo, giltBrassMat);
      finial.position.set(0, sign * 1.006, 0);
      if (sign < 0) finial.rotation.z = Math.PI;
      group.add(finial);
    }

    // Lower cradling brass yoke arc (fits cleanly within 1.178 radius)
    const yokeGeo = new THREE.TorusGeometry(1.164, 0.013, 18, 72, Math.PI * 0.62);
    this.disposableGeometries.push(yokeGeo);
    const yoke = new THREE.Mesh(yokeGeo, antiqueBrassMat);
    yoke.rotation.z = -Math.PI * 0.81;
    group.add(yoke);

    return group;
  }

  /**
   * Builds an authentic Ivory-Topped Turned-Brass Pushpin + 280ms Confirmation Ring!
   */
  private createIvoryBrassPushpin(isGoldTarget = false): THREE.Group {
    const group = new THREE.Group();

    const brassMat = new THREE.MeshPhysicalMaterial({
      color: isGoldTarget ? 0xffd55a : 0xdfb860,
      metalness: 0.92,
      roughness: 0.2,
      clearcoat: 0.5,
      envMapIntensity: 1.3,
    });
    const capMat = new THREE.MeshPhysicalMaterial({
      color: isGoldTarget ? 0xffe47a : 0xfaf3e3, // Cream-Ivory cabochon head!
      emissive: isGoldTarget ? 0x9c6b0c : 0x3b3222,
      emissiveIntensity: isGoldTarget ? 0.45 : 0.22,
      roughness: 0.18,
      metalness: isGoldTarget ? 0.55 : 0.04,
      clearcoat: 0.92,
      clearcoatRoughness: 0.1,
    });
    this.disposableMaterials.push(brassMat, capMat);

    // Tapered brass needle
    const needleGeo = new THREE.ConeGeometry(0.011, 0.082, 16);
    // Turned C1-filleted brass ferrule waist
    const ferruleGeo = new THREE.TorusGeometry(0.019, 0.006, 12, 24);
    // Lathe-turned smooth ivory cabochon dome
    const capGeo = new THREE.CapsuleGeometry(0.028, 0.012, 10, 20);
    this.disposableGeometries.push(needleGeo, ferruleGeo, capGeo);

    const needle = new THREE.Mesh(needleGeo, brassMat);
    needle.rotation.x = Math.PI;
    needle.position.y = 0.041;
    group.add(needle);

    const ferrule = new THREE.Mesh(ferruleGeo, brassMat);
    ferrule.rotation.x = Math.PI * 0.5;
    ferrule.position.y = 0.084;
    group.add(ferrule);

    const ivoryCap = new THREE.Mesh(capGeo, capMat);
    ivoryCap.scale.set(1.12, 0.78, 1.12);
    ivoryCap.position.y = 0.112;
    group.add(ivoryCap);

    if (!isGoldTarget) {
      // Crisp 280ms radial confirmation ring shader flat on Earth's surface around needle
      const ringGeo = new THREE.PlaneGeometry(0.16, 0.16);
      this.disposableGeometries.push(ringGeo);
      const ringMat = new THREE.ShaderMaterial({
        uniforms: {
          uProgress: { value: 0.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv * 2.0 - 1.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uProgress;
          varying vec2 vUv;
          void main() {
            float r = length(vUv);
            float aa = fwidth(r);
            float band = smoothstep(0.56 - aa, 0.56 + aa, r) * (1.0 - smoothstep(0.86 - aa, 0.86 + aa, r));
            if (band <= 0.001) discard;
            float ang = atan(vUv.x, vUv.y); // -PI..PI, 0 at top
            float normAng = fract(ang / 6.2831853 + 1.0);
            float filled = 1.0 - smoothstep(uProgress - 0.02, uProgress + 0.02, normAng);
            vec3 trackCol = vec3(0.96, 0.93, 0.86);
            vec3 fillCol = vec3(0.98, 0.82, 0.32);
            vec3 col = mix(trackCol * 0.35, fillCol, filled);
            float alpha = band * mix(0.32, 0.98, filled);
            gl_FragColor = vec4(col, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      this.disposableMaterials.push(ringMat);
      this.confirmRingShaderMat = ringMat;

      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI * 0.5;
      ringMesh.position.y = 0.005;
      group.add(ringMesh);
    }

    return group;
  }

  private orientToSurface(obj: THREE.Object3D, dir: THREE.Vector3, radius: number): void {
    obj.position.copy(dir).multiplyScalar(radius);
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  }

  /**
   * Plants the player's Ivory-Topped Brass Pushpin and initiates the crisp
   * 280ms confirmation ring fill (no separate Submit button!).
   */
  public plantPin(lat: number, lng: number): void {
    if (this.isLocked || this.disposed) return;

    this.plantedCoord = { lat, lng };
    const dir = latLngToVector3(lat, lng, 1.0).normalize();

    if (!this.ivoryPinGroup) {
      this.ivoryPinGroup = this.createIvoryBrassPushpin(false);
      this.overlayGroup.add(this.ivoryPinGroup);
    }
    this.orientToSurface(this.ivoryPinGroup, dir, 1.13);
    this.ivoryPinDropProgress = 0;
    this.confirmElapsedMs = 0;
    this.isConfirming = true;

    if (this.confirmRingShaderMat) {
      this.confirmRingShaderMat.uniforms.uProgress.value = 0;
    }

    this.coordBadgeEl.textContent = `PIN ${formatCoordShort(lat, lng)}`;
    this.statusBadgeEl.textContent = 'LOCKING STUDIO PIN!';
    this.statusBadgeEl.style.background = 'linear-gradient(180deg, #F4A91F 0%, #D48806 100%)';
    this.statusBadgeEl.style.color = '#141B29';

    if (this.options.onPinPlanted) {
      this.options.onPinPlanted({ lat, lng });
    }
  }

  /**
   * Completes the 280ms lock and reveals:
   *  1. `fwidth()`-smooth Dashed Gold `350 KM` (`1.0x` Bullseye) geodesic ring
   *  2. `fwidth()`-smooth Ticked Sky-Cyan `900 KM` (`0.65x` Near-Hit) geodesic ring
   *  3. Luminous elevated great-circle geodesic arc from planted pin -> true landmark!
   */
  private finalizeLockAndReveal(): void {
    if (this.isLocked || !this.plantedCoord) return;
    this.isLocked = true;
    this.isConfirming = false;

    const targetLat = this.options.targetLat;
    const targetLng = this.options.targetLng;
    const targetDir = latLngToVector3(targetLat, targetLng, 1.0).normalize();

    // 1. True Landmark Gold Beacon Pin
    const targetPin = this.createIvoryBrassPushpin(true);
    targetPin.scale.setScalar(1.12);
    this.orientToSurface(targetPin, targetDir, 1.002);
    this.overlayGroup.add(targetPin);

    // 2. fwidth()-Smooth Spherical Geodesic Rings Shader (Dashed Gold 350 KM + Ticked Sky-Cyan 900 KM)
    const tangentRef = Math.abs(targetDir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const tangentU = new THREE.Vector3().crossVectors(tangentRef, targetDir).normalize();
    const tangentV = new THREE.Vector3().crossVectors(targetDir, tangentU).normalize();

    const ringsSphereGeo = new THREE.SphereGeometry(1.0055, 112, 84);
    this.disposableGeometries.push(ringsSphereGeo);
    this.geodesicRingsMat = new THREE.ShaderMaterial({
      uniforms: {
        uTargetDir: { value: targetDir.clone() },
        uTangentU: { value: tangentU },
        uTangentV: { value: tangentV },
        uEarthRadiusKm: { value: EARTH_RADIUS_KM_V7 },
        uTime: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vUnitPos;
        void main() {
          vUnitPos = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTargetDir;
        uniform vec3 uTangentU;
        uniform vec3 uTangentV;
        uniform float uEarthRadiusKm;
        uniform float uTime;
        varying vec3 vUnitPos;

        void main() {
          float cosTheta = clamp(dot(normalize(vUnitPos), uTargetDir), -1.0, 1.0);
          float km = acos(cosTheta) * uEarthRadiusKm;
          if (km > 1750.0) discard;

          float dKm = max(fwidth(km), 3.5);
          float az = atan(dot(vUnitPos, uTangentV), dot(vUnitPos, uTangentU));
          float dAz = max(fwidth(az), 0.008);

          // A) Dashed Gold 350 KM (1.0x Bullseye) Geodesic Ring — 20 crisp dashes
          float dist350 = abs(km - 350.0);
          float ring350 = 1.0 - smoothstep(dKm * 0.95, dKm * 2.15, dist350);
          float dashWave = cos(az * 20.0 - uTime * 1.6);
          float dashMask = smoothstep(-0.15 - dAz * 6.0, 0.15 + dAz * 6.0, dashWave);
          float goldAlpha = ring350 * dashMask;
          float goldFill = (1.0 - smoothstep(350.0 - dKm, 350.0 + dKm, km)) * 0.14;

          // B) Ticked Sky-Cyan 900 KM (0.65x Near-Hit) Geodesic Ring — hairline + 36 compass ticks
          float dist900 = abs(km - 900.0);
          float base900 = 1.0 - smoothstep(dKm * 0.8, dKm * 1.9, dist900);
          float tickWave = cos(az * 36.0);
          float tickAngular = smoothstep(0.82 - dAz * 10.0, 0.92 + dAz * 10.0, tickWave);
          float tickRadial = 1.0 - smoothstep(dKm * 3.2, dKm * 4.8, abs(km - 900.0));
          float cyanAlpha = clamp(base900 * 0.88 + tickAngular * tickRadial * 0.95, 0.0, 1.0);

          // C) Subtle 1600 KM Partial-Credit Outer Horizon Hairline
          float ring1600 = (1.0 - smoothstep(dKm * 0.7, dKm * 1.7, abs(km - 1600.0))) * 0.42;

          vec3 goldCol = vec3(1.0, 0.835, 0.32);   // #FFD552 Dashed Gold
          vec3 cyanCol = vec3(0.28, 0.86, 1.0);    // #47DCFF Ticked Sky-Cyan
          vec3 amberCol = vec3(0.92, 0.62, 0.24);

          float outAlpha = max(max(goldAlpha, goldFill), max(cyanAlpha, ring1600));
          if (outAlpha < 0.01) discard;

          vec3 outCol = goldCol * max(goldAlpha, goldFill);
          outCol = mix(outCol, cyanCol, cyanAlpha * (1.0 - goldAlpha));
          outCol = mix(outCol, amberCol, ring1600 * (1.0 - max(goldAlpha, cyanAlpha)));

          gl_FragColor = vec4(outCol, clamp(outAlpha, 0.0, 0.96));
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    this.disposableMaterials.push(this.geodesicRingsMat);
    this.overlayGroup.add(new THREE.Mesh(ringsSphereGeo, this.geodesicRingsMat));

    // 3. Great-Circle Geodesic Arc from Planted Pin -> True Landmark
    this.buildGreatCircleArc(
      this.plantedCoord.lat,
      this.plantedCoord.lng,
      targetLat,
      targetLng,
    );

    // 4. Evaluate Distance & Fly Camera Smoothly to Frame Both Pins
    const result = evaluateReliefGlobeDistanceV7(this.plantedCoord, {
      lat: targetLat,
      lng: targetLng,
    });
    this.pendingResult = result;
    this.postLockElapsedMs = 0;

    const fromDir = latLngToVector3(this.plantedCoord.lat, this.plantedCoord.lng, 1.0).normalize();
    const mid = fromDir.clone().add(targetDir);
    const focus =
      mid.lengthSq() > 0.001
        ? vector3ToLatLng(mid.normalize())
        : { lat: targetLat, lng: targetLng };
    const baseFramed = computeGlobeFramedDistanceV7(this.camera.aspect);
    const dist = THREE.MathUtils.clamp(
      baseFramed * 0.86 + (result.distanceKm / 9500) * 1.15,
      2.65,
      this.maxZoomDistance,
    );
    this.flyTo(focus.lat, focus.lng, dist, this.options.reducedMotion ? 0.15 : 0.34);

    // Update 1966 Studio HUD status ribbon
    if (result.tierLabel === 'BULLSEYE_350KM') {
      this.statusBadgeEl.textContent = `${result.distanceKm} KM · BULLSEYE! (1.25×)`;
      this.statusBadgeEl.style.background = 'linear-gradient(180deg, #16A34A 0%, #117A37 100%)';
      this.statusBadgeEl.style.color = '#FFFDF7';
    } else if (result.tierLabel === 'NEAR_HIT_900KM') {
      this.statusBadgeEl.textContent = `${result.distanceKm} KM · CLOSE HIT! (0.85×)`;
      this.statusBadgeEl.style.background = 'linear-gradient(180deg, #0096A6 0%, #006E7A 100%)';
      this.statusBadgeEl.style.color = '#FFFDF7';
    } else if (result.tierLabel === 'REGIONAL_1600KM') {
      this.statusBadgeEl.textContent = `${result.distanceKm} KM · REGIONAL HIT (0.50×)`;
      this.statusBadgeEl.style.background = 'linear-gradient(180deg, #F4A91F 0%, #C9820A 100%)';
      this.statusBadgeEl.style.color = '#141B29';
    } else {
      this.statusBadgeEl.textContent = `${result.distanceKm} KM OFF TARGET`;
      this.statusBadgeEl.style.background = 'linear-gradient(180deg, #E03E36 0%, #A8251E 100%)';
      this.statusBadgeEl.style.color = '#FFFDF7';
    }
  }

  private buildGreatCircleArc(lat1: number, lng1: number, lat2: number, lng2: number): void {
    const vStart = latLngToVector3(lat1, lng1, 1.0).normalize();
    const vEnd = latLngToVector3(lat2, lng2, 1.0).normalize();
    const angle = Math.acos(THREE.MathUtils.clamp(vStart.dot(vEnd), -1, 1));
    const liftMax = Math.min(0.28, 0.04 + (angle / Math.PI) * 0.25);

    const pts: THREE.Vector3[] = [];
    const segs = 56;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      let p: THREE.Vector3;
      if (angle < 0.001) {
        p = vStart.clone();
      } else if (Math.PI - angle < 0.01) {
        const axis = Math.abs(vStart.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const ortho = new THREE.Vector3().crossVectors(vStart, axis).normalize();
        p = vStart
          .clone()
          .multiplyScalar(Math.cos(Math.PI * t))
          .add(ortho.multiplyScalar(Math.sin(Math.PI * t)));
      } else {
        const sinA = Math.sin(angle);
        p = vStart
          .clone()
          .multiplyScalar(Math.sin((1 - t) * angle) / sinA)
          .add(vEnd.clone().multiplyScalar(Math.sin(t * angle) / sinA))
          .normalize();
      }
      pts.push(p.multiplyScalar(1.008 + Math.sin(Math.PI * t) * liftMax));
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(curve, 56, 0.0085, 8, false);
    this.disposableGeometries.push(tubeGeo);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0xffe07d,
      transparent: true,
      opacity: 0.96,
    });
    this.disposableMaterials.push(tubeMat);
    this.geodesicArcMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.geodesicArcTotalIndices = tubeGeo.index ? tubeGeo.index.count : 0;
    this.geodesicArcProgress = 0;
    if (this.geodesicArcTotalIndices > 0) {
      tubeGeo.setDrawRange(0, 0);
    }
    this.overlayGroup.add(this.geodesicArcMesh);
  }

  public flyTo(lat: number, lng: number, distance = this.camDistance, durationSec = 0.5): void {
    const startLng = this.camLngDeg;
    const deltaLng = ((lng - startLng + 540) % 360) - 180;
    this.velLat = 0;
    this.velLng = 0;
    this.flyTween = {
      startLat: this.camLatDeg,
      startLng,
      startDist: this.camDistance,
      endLat: THREE.MathUtils.clamp(lat, -76, 76),
      endLng: startLng + deltaLng,
      endDist: THREE.MathUtils.clamp(distance, 2.15, this.maxZoomDistance),
      elapsed: 0,
      duration: Math.max(0.1, durationSec),
    };
    this.targetDistance = this.flyTween.endDist;
  }

  private bindEvents(): void {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('pointerup', this.onPointerUp);
    dom.addEventListener('pointercancel', this.onPointerUp);
    dom.addEventListener('wheel', this.onWheel, { passive: false });
  }

  private readonly onPointerDown = (e: PointerEvent): void => {
    if (this.isLocked || this.disposed) return;
    const dom = this.renderer.domElement;
    try {
      dom.setPointerCapture(e.pointerId);
    } catch {
      // Synthetic test pointer events may omit active pointerId capture
    }
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.userHasInteracted = true;
    this.flyTween = null;

    if (this.activePointers.size === 1) {
      this.primaryPointerId = e.pointerId;
      this.pointerDownX = e.clientX;
      this.pointerDownY = e.clientY;
      this.pointerDownMs = performance.now();
      this.pointerMovedPx = 0;
      this.lastDragX = e.clientX;
      this.lastDragY = e.clientY;
      this.velLat = 0;
      this.velLng = 0;
      dom.style.cursor = 'grabbing';
    } else if (this.activePointers.size === 2) {
      this.primaryPointerId = null;
      this.lastPinchDist = this.getPinchDistance();
    }
  };

  private readonly onPointerMove = (e: PointerEvent): void => {
    if (!this.activePointers.has(e.pointerId) || this.isLocked) return;
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.activePointers.size === 2) {
      const dist = this.getPinchDistance();
      if (this.lastPinchDist > 1 && dist > 1) {
        const ratio = this.lastPinchDist / dist;
        this.targetDistance = THREE.MathUtils.clamp(
          this.targetDistance * Math.pow(ratio, 0.9),
          2.15,
          this.maxZoomDistance,
        );
      }
      this.lastPinchDist = dist;
      this.pointerMovedPx = 999;
      return;
    }

    if (e.pointerId === this.primaryPointerId) {
      const dx = e.clientX - this.lastDragX;
      const dy = e.clientY - this.lastDragY;
      this.lastDragX = e.clientX;
      this.lastDragY = e.clientY;
      this.pointerMovedPx += Math.hypot(dx, dy);

      const zoomFactor = (this.camDistance - 1.0) / 1.85;
      const degPerPx = 0.28 * zoomFactor;
      const dLng = -dx * degPerPx;
      const dLat = dy * degPerPx;

      this.camLngDeg = this.normalizeLng(this.camLngDeg + dLng);
      this.camLatDeg = THREE.MathUtils.clamp(this.camLatDeg + dLat, -76, 76);
      this.velLng = dLng * 0.84;
      this.velLat = dLat * 0.84;
      this.updateCameraTransform();
    }
  };

  private readonly onPointerUp = (e: PointerEvent): void => {
    const dom = this.renderer.domElement;
    try {
      if (dom.hasPointerCapture(e.pointerId)) {
        dom.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Safe synthetic pointer release
    }
    const wasPrimary = e.pointerId === this.primaryPointerId;
    this.activePointers.delete(e.pointerId);

    if (this.activePointers.size === 0) {
      this.primaryPointerId = null;
      dom.style.cursor = this.isLocked ? 'default' : 'grab';

      const elapsed = performance.now() - this.pointerDownMs;
      const moveDist = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
      if (
        wasPrimary &&
        !this.isLocked &&
        moveDist < 12 &&
        this.pointerMovedPx < 16 &&
        elapsed < 450
      ) {
        const hit = this.raycastSphere(e.clientX, e.clientY);
        if (hit) {
          this.velLat = 0;
          this.velLng = 0;
          this.plantPin(hit.lat, hit.lng);
        }
      }
    } else if (this.activePointers.size === 1) {
      const [remId, pos] = Array.from(this.activePointers.entries())[0];
      this.primaryPointerId = remId;
      this.lastDragX = pos.x;
      this.lastDragY = pos.y;
    }
  };

  private readonly onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    if (this.isLocked) return;
    this.userHasInteracted = true;
    this.flyTween = null;
    const factor = e.deltaY > 0 ? 1.09 : 0.92;
    this.targetDistance = THREE.MathUtils.clamp(
      this.targetDistance * factor,
      2.15,
      this.maxZoomDistance,
    );
  };

  private getPinchDistance(): number {
    const pts = Array.from(this.activePointers.values());
    if (pts.length < 2) return 0;
    return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
  }

  private raycastSphere(clientX: number, clientY: number): GeoPointV6 | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -(((clientY - rect.top) / rect.height) * 2 - 1),
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObject(this.earthMesh, false);
    if (hits.length === 0) return null;
    const localPt = this.earthMesh.worldToLocal(hits[0].point.clone());
    return vector3ToLatLng(localPt);
  }

  private normalizeLng(lng: number): number {
    let v = (((lng + 180) % 360) + 360) % 360 - 180;
    if (v === -180 && lng > 0) v = 180;
    return v;
  }

  private updateCameraTransform(): void {
    const camPos = latLngToVector3(this.camLatDeg, this.camLngDeg, this.camDistance);
    this.camera.position.copy(camPos);
    this.camera.lookAt(0, 0, 0);

    // Silhouette the C1-filleted spun-brass Rand McNally calibrated meridian ring cleanly around ALL 360° of Earth
    // (zero Southern/Northern hemisphere occlusion when pitched to high latitudes!)
    this.cradleGroup.quaternion.copy(this.camera.quaternion);

    const sunPos = latLngToVector3(
      THREE.MathUtils.clamp(this.camLatDeg + 25, -75, 75),
      this.normalizeLng(this.camLngDeg + 36),
      6.5,
    );
    this.keyLight.position.copy(sunPos);

    if (!this.plantedCoord) {
      this.coordBadgeEl.textContent = formatCoordShort(this.camLatDeg, this.camLngDeg);
    }
  }

  private handleResize(): void {
    if (this.disposed) return;
    const w = Math.max(120, this.stageEl.clientWidth);
    const h = Math.max(120, this.stageEl.clientHeight);
    const aspect = w / h;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);

    const framedDist = computeGlobeFramedDistanceV7(aspect);
    this.maxZoomDistance = Math.max(5.6, framedDist * 1.35);
    if (!this.userHasInteracted && !this.isLocked) {
      this.camDistance = framedDist;
      this.targetDistance = framedDist;
      this.updateCameraTransform();
    }
  }

  private readonly tick = (nowMs: number): void => {
    if (this.disposed) return;
    // Auto-dispose if host stage was detached via innerHTML clear
    if (this.elapsedSec > 0.1 && !this.stageEl.isConnected) {
      this.dispose();
      return;
    }

    const dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastFrameMs) / 1000));
    this.lastFrameMs = nowMs;
    this.elapsedSec += dt;

    let camDirty = false;
    if (this.flyTween) {
      this.flyTween.elapsed += dt;
      const t = Math.min(1, this.flyTween.elapsed / this.flyTween.duration);
      const ease = 1 - Math.pow(1 - t, 3);
      this.camLatDeg = THREE.MathUtils.lerp(this.flyTween.startLat, this.flyTween.endLat, ease);
      this.camLngDeg = this.normalizeLng(
        THREE.MathUtils.lerp(this.flyTween.startLng, this.flyTween.endLng, ease),
      );
      this.camDistance = THREE.MathUtils.lerp(this.flyTween.startDist, this.flyTween.endDist, ease);
      this.targetDistance = this.camDistance;
      if (t >= 1) this.flyTween = null;
      camDirty = true;
    } else if (this.activePointers.size === 0) {
      if (Math.abs(this.velLng) > 0.004 || Math.abs(this.velLat) > 0.004) {
        const decay = Math.pow(0.9, dt * 60);
        this.camLngDeg = this.normalizeLng(this.camLngDeg + this.velLng);
        this.camLatDeg = THREE.MathUtils.clamp(this.camLatDeg + this.velLat, -76, 76);
        this.velLng *= decay;
        this.velLat *= decay;
        camDirty = true;
      } else if (!this.userHasInteracted && !this.isConfirming && !this.isLocked && !this.options.reducedMotion) {
        this.camLngDeg = this.normalizeLng(this.camLngDeg + 0.035 * RAD2DEG_V7 * dt);
        camDirty = true;
      }
    }

    if (Math.abs(this.camDistance - this.targetDistance) > 0.001) {
      this.camDistance = THREE.MathUtils.lerp(
        this.camDistance,
        this.targetDistance,
        Math.min(1, dt * 10),
      );
      camDirty = true;
    }

    if (camDirty) {
      this.updateCameraTransform();
    }

    // Ivory pushpin spring landing
    if (this.ivoryPinGroup && this.plantedCoord && this.ivoryPinDropProgress < 1) {
      this.ivoryPinDropProgress = Math.min(1, this.ivoryPinDropProgress + dt * 6.0);
      const dir = latLngToVector3(this.plantedCoord.lat, this.plantedCoord.lng, 1.0).normalize();
      const alt = 1.001 + (1 - this.ivoryPinDropProgress) * 0.12;
      this.orientToSurface(this.ivoryPinGroup, dir, alt);
    }

    // Crisp 280ms Confirmation Ring Fill -> Auto-Lock!
    if (this.isConfirming && !this.isLocked) {
      this.confirmElapsedMs += dt * 1000;
      const p = Math.min(1, this.confirmElapsedMs / this.confirmLockMs);
      if (this.confirmRingShaderMat) {
        this.confirmRingShaderMat.uniforms.uProgress.value = p;
      }
      if (p >= 1) {
        this.finalizeLockAndReveal();
      }
    }

    // Geodesic rings dash shimmer + Great-circle arc draw-in + Post-lock callback
    if (this.isLocked) {
      if (this.geodesicRingsMat) {
        this.geodesicRingsMat.uniforms.uTime.value = this.elapsedSec;
      }
      if (this.geodesicArcMesh && this.geodesicArcTotalIndices > 0 && this.geodesicArcProgress < 1) {
        this.geodesicArcProgress = Math.min(1, this.geodesicArcProgress + dt * 3.4);
        this.geodesicArcMesh.geometry.setDrawRange(
          0,
          Math.floor(this.geodesicArcProgress * this.geodesicArcTotalIndices),
        );
      }
      if (!this.lockResolvedSent && this.pendingResult) {
        this.postLockElapsedMs += dt * 1000;
        if (this.postLockElapsedMs >= this.revealDwellMs) {
          this.lockResolvedSent = true;
          this.options.onLock?.(this.pendingResult);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.tick);
  };

  public renderFrameNow(): void {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();

    const idx = SHARED_EARTH_TEXTURES.listeners.indexOf(this.textureListener);
    if (idx >= 0) {
      SHARED_EARTH_TEXTURES.listeners.splice(idx, 1);
    }

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    dom.removeEventListener('pointermove', this.onPointerMove);
    dom.removeEventListener('pointerup', this.onPointerUp);
    dom.removeEventListener('pointercancel', this.onPointerUp);
    dom.removeEventListener('wheel', this.onWheel);

    for (const geo of this.disposableGeometries) geo.dispose();
    for (const mat of this.disposableMaterials) mat.dispose();
    for (const tex of this.disposableTextures) tex.dispose();
    this.pmremTarget.dispose();
    this.renderer.dispose();
    try {
      this.renderer.forceContextLoss();
    } catch {
      // Context may already be lost in headless/unmounted teardown
    }
    if (this.stageEl.parentElement === this.hostEl) {
      this.hostEl.removeChild(this.stageEl);
    }
  }
}

export function mountReliefGlobeContraptionV7(
  container: HTMLElement,
  options: ReliefGlobeOptionsV7,
): ReliefGlobeContraptionV7 {
  return new ReliefGlobeContraptionV7(container, options);
}
