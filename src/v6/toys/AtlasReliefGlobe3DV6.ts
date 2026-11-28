// ============================================================================
// WORLD'S SMARTEST v6.0 — Ultra-HD 3D Shaded-Relief World Atlas Globe
// Powered by baked 4K Natural Earth II + Hypsometric Shaded Relief + Bathymetry
// (earth_relief_albedo_4k.webp, earth_elevation_bump_2k.webp, earth_ocean_specular_2k.webp)
//
// Features:
//  - SphereGeometry(1, 128, 96) with MeshPhysicalMaterial (bumpMap + ocean specular/clearcoat)
//  - Custom GLSL Rayleigh Atmospheric Fresnel rim halo + front horizon scatter
//  - Subtle antique-gold 15° lat/lng graticule + Equator/Prime Meridian highlights
//  - Sculpted brushed-brass armillary meridian cradle with vernier degree pips & finials
//  - Smooth 1-finger inertial orbit, 2-finger pinch-zoom & wheel zoom
//  - Raycaster 3D ruby-topped brass pushpin drop with spring bounce animation
//  - Exact Haversine geodesic distance (km -> 0..1000 GeoGuessr-calibrated score)
//  - Animated golden great-circle flight arc & concentric shockwave target ring reveal
//  - Multi-mode spatial overlays powering ALL 10 Family II Atlas Toys (Toys 011–020)
// ============================================================================

import * as THREE from 'three';

export interface GeoPointV6 {
  lat: number;
  lng: number;
}

export interface GlobeMarkerSpecV6 {
  id: string;
  lat: number;
  lng: number;
  colorHex?: number;
  label?: string;
  pulsing?: boolean;
}

export interface GlobePinScoreV6 {
  distanceKm: number;
  distanceMiles: number;
  points: number;          // 0 .. 1000
  accuracyRatio: number;   // 0.0 .. 1.0
  tierLabel: 'BULLSEYE' | 'PINPOINT' | 'CLOSE' | 'REGIONAL' | 'DISTANT';
}

export interface AtlasReliefGlobeOptionsV6 {
  /** Override base path to textures folder (defaults to `${BASE_URL}assets/textures/v6`). */
  textureBasePath?: string;
  /** Initial center focus on mount. */
  initialFocus?: GeoPointV6;
  /** Initial camera distance (2.05 .. 4.10; default 2.85). */
  initialDistance?: number;
  /** Allow tapping the globe surface to plant/move the 3D ruby pushpin. */
  allowPinDrop?: boolean;
  /** Gentle idle ambient rotation speed (rad/sec) before first interaction. */
  idleSpinSpeed?: number;
  /** Optional stage-specific metallic trim tint (e.g. from StageAtmosphereThemeV6). */
  brassTrimHex?: number;
  /** Optional atmosphere glow tint. */
  atmosphereHex?: number;
  /** Fired whenever the user plants or moves their ruby brass pushpin via Raycaster. */
  onPinDrop?: (coord: GeoPointV6) => void;
  /** Fired whenever the user rotates or zooms (useful for live bearing/coordinate readouts). */
  onViewChange?: (center: GeoPointV6, distance: number) => void;
}

const EARTH_RADIUS_KM = 6371.0088;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Exact Three.js SphereGeometry equirectangular UV <-> Lat/Lng conversion.
 * Matches SphereGeometry's default UV mapping (u=0 -> -180°W, u=0.5 -> 0° Prime Meridian, u=1 -> +180°E).
 */
export function latLngToVector3(lat: number, lng: number, radius = 1.0): THREE.Vector3 {
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lng + 180) * DEG2RAD;
  const sinPhi = Math.sin(phi);
  const x = -radius * sinPhi * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * sinPhi * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

/**
 * Inverse of `latLngToVector3` — converts a surface point in Earth's local space to `{ lat, lng }`.
 */
export function vector3ToLatLng(localPoint: THREE.Vector3): GeoPointV6 {
  const n = localPoint.clone().normalize();
  const lat = Math.asin(THREE.MathUtils.clamp(n.y, -1, 1)) * RAD2DEG;
  // Since x = -sinPhi * cos(theta), z = sinPhi * sin(theta),
  // theta = atan2(z, -x) in [-pi, pi] -> normalize to [0, 2pi] -> lng = thetaDeg - 180
  let theta = Math.atan2(n.z, -n.x);
  if (theta < 0) theta += Math.PI * 2;
  let lng = theta * RAD2DEG - 180;
  if (lng > 180) lng -= 360;
  if (lng < -180) lng += 360;
  return { lat, lng };
}

/**
 * Exact spherical Haversine great-circle distance in kilometers.
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = (lat2 - lat1) * DEG2RAD;
  const dLng = (lng2 - lng1) * DEG2RAD;
  const rLat1 = lat1 * DEG2RAD;
  const rLat2 = lat2 * DEG2RAD;
  const sinDLat = Math.sin(dLat * 0.5);
  const sinDLng = Math.sin(dLng * 0.5);
  const h =
    sinDLat * sinDLat + Math.cos(rLat1) * Math.cos(rLat2) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(Math.max(0, h))));
}

/**
 * Computes initial great-circle compass bearing (0° = North, 90° = East, 180° = South, 270° = West).
 */
export function computeBearingDeg(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const phi1 = lat1 * DEG2RAD;
  const phi2 = lat2 * DEG2RAD;
  const dLambda = (lng2 - lng1) * DEG2RAD;
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return ((Math.atan2(y, x) * RAD2DEG) + 360) % 360;
}

/**
 * Computes the exact opposite point on Earth (antipode).
 */
export function computeAntipode(lat: number, lng: number): GeoPointV6 {
  const antiLat = -lat;
  let antiLng = lng >= 0 ? lng - 180 : lng + 180;
  if (antiLng > 180) antiLng -= 360;
  if (antiLng < -180) antiLng += 360;
  return { lat: antiLat, lng: antiLng };
}

/**
 * GeoGuessr-calibrated exponential accuracy scoring (0..1000 points).
 *  <= 120 km -> 1000 pts (BULLSEYE)
 *  Exponential decay beyond 120 km with configurable decay constant (default 1850 km).
 */
export function computeGlobePinScore(
  distanceKm: number,
  bullseyeKm = 120,
  decayScaleKm = 1850,
): GlobePinScoreV6 {
  const safeKm = Math.max(0, Number.isFinite(distanceKm) ? distanceKm : 20000);
  const rawPts =
    safeKm <= bullseyeKm
      ? 1000
      : Math.round(1000 * Math.exp(-(safeKm - bullseyeKm) / decayScaleKm));
  const points = Math.max(0, Math.min(1000, rawPts));
  const accuracyRatio = points / 1000;
  let tierLabel: GlobePinScoreV6['tierLabel'] = 'DISTANT';
  if (safeKm <= 180 || points >= 960) tierLabel = 'BULLSEYE';
  else if (safeKm <= 650 || points >= 740) tierLabel = 'PINPOINT';
  else if (safeKm <= 1650 || points >= 440) tierLabel = 'CLOSE';
  else if (safeKm <= 3400 || points >= 180) tierLabel = 'REGIONAL';

  return {
    distanceKm: Math.round(safeKm),
    distanceMiles: Math.round(safeKm * 0.621371),
    points,
    accuracyRatio,
    tierLabel,
  };
}

export function formatCoordShort(lat: number, lng: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(1)}°${ns} ${Math.abs(lng).toFixed(1)}°${ew}`;
}

/**
 * Builds an instant zero-latency fallback canvas texture while the 4K WebP streams in
 * (typically < 30ms local load), preventing any black flash on frame 0.
 */
function createInstantFallbackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#0a2b52');
    grad.addColorStop(0.5, '#0e3c70');
    grad.addColorStop(1, '#082040');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface ShockwaveRingState {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  phase: number;
}

interface AnimatedPinState {
  group: THREE.Group;
  surfaceDir: THREE.Vector3;
  dropProgress: number;
  baseScale: number;
}

export class AtlasReliefGlobe3DV6 {
  private readonly container: HTMLElement;
  private readonly options: AtlasReliefGlobeOptionsV6;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly globeRoot: THREE.Group;
  private readonly earthMesh: THREE.Mesh;
  private readonly earthMaterial: THREE.MeshPhysicalMaterial;
  private readonly overlayGroup: THREE.Group;
  private readonly armillaryGroup: THREE.Group;
  private readonly keyLight: THREE.DirectionalLight;
  private readonly rimLight: THREE.DirectionalLight;
  private readonly ambientLight: THREE.HemisphereLight;
  private readonly raycaster = new THREE.Raycaster();
  private readonly resizeObserver: ResizeObserver;

  private readonly loadedTextures: THREE.Texture[] = [];
  private readonly disposableGeometries: THREE.BufferGeometry[] = [];
  private readonly disposableMaterials: THREE.Material[] = [];

  // Interactive orbital state (camera orbits around origin; globe stays in world axes
  // so latLngToVector3 & armillary meridian align cleanly!)
  private camLatDeg = 22;
  private camLngDeg = 12;
  private camDistance = 2.85;
  private targetDistance = 2.85;
  private velLat = 0;
  private velLng = 0;
  private idleSpinSpeed = 0.045;
  private userHasInteracted = false;

  // Smooth camera flight tween
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

  // Orbit landmark mode (Toy 20)
  private orbitLandmarkState: {
    centerLat: number;
    centerLng: number;
    angle: number;
    radiusDeg: number;
    distance: number;
  } | null = null;

  // Pointer & pinch tracking
  private readonly activePointers = new Map<number, { x: number; y: number }>();
  private primaryPointerId: number | null = null;
  private pointerDownX = 0;
  private pointerDownY = 0;
  private pointerDownTime = 0;
  private pointerMovedPx = 0;
  private lastDragX = 0;
  private lastDragY = 0;
  private lastPinchDist = 0;
  private allowPinDrop = true;
  private locked = false;

  // Pin & spatial overlay objects
  private guessPinCoord: GeoPointV6 | null = null;
  private guessPinState: AnimatedPinState | null = null;
  private targetPinState: AnimatedPinState | null = null;
  private shockwaveRings: ShockwaveRingState[] = [];
  private shockwaveRoot: THREE.Group | null = null;
  private geodesicArcMesh: THREE.Mesh | null = null;
  private geodesicArcTotalIndices = 0;
  private geodesicArcProgress = 0;
  private latitudeRingMesh: THREE.Mesh | null = null;
  private solarMeridianGroup: THREE.Group | null = null;
  private hemisphereGroup: THREE.Group | null = null;
  private antipodeGroup: THREE.Group | null = null;
  private referenceMarkersGroup: THREE.Group | null = null;
  private pulsingMeshes: THREE.Mesh[] = [];

  private rafId = 0;
  private lastFrameMs = 0;
  private elapsedTotal = 0;
  private disposed = false;

  constructor(container: HTMLElement, options: AtlasReliefGlobeOptionsV6 = {}) {
    this.container = container;
    this.options = options;
    this.allowPinDrop = options.allowPinDrop ?? true;
    this.idleSpinSpeed = options.idleSpinSpeed ?? 0.04;
    this.camDistance = THREE.MathUtils.clamp(options.initialDistance ?? 2.85, 2.05, 4.1);
    this.targetDistance = this.camDistance;
    if (options.initialFocus) {
      this.camLatDeg = THREE.MathUtils.clamp(options.initialFocus.lat, -78, 78);
      this.camLngDeg = options.initialFocus.lng;
    }

    // 1. WebGL2 Renderer (Retina-sharp, alpha-composited into tactile toy stage)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.renderer.setPixelRatio(dpr);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.domElement.style.cssText =
      'width:100%;height:100%;display:block;touch-action:none;cursor:grab;user-select:none;';
    this.container.appendChild(this.renderer.domElement);

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    const initW = Math.max(120, container.clientWidth || 360);
    const initH = Math.max(120, container.clientHeight || 360);
    this.camera = new THREE.PerspectiveCamera(40, initW / initH, 0.1, 40);
    this.renderer.setSize(initW, initH, false);

    // 3. Studio 3-Point Cartographic Lighting
    this.ambientLight = new THREE.HemisphereLight(0xd9eaff, 0x1a2844, 0.78);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xfff5e2, 2.35);
    this.keyLight.position.set(4.5, 3.0, 5.0);
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x64b8ff, 1.15);
    this.rimLight.position.set(-4.5, -1.6, -3.8);
    this.scene.add(this.rimLight);

    const warmFill = new THREE.PointLight(0xf3c66c, 0.85, 16);
    warmFill.position.set(-2.5, 2.8, 3.2);
    this.scene.add(warmFill);

    // 4. Globe Root Hierarchy
    this.globeRoot = new THREE.Group();
    this.scene.add(this.globeRoot);

    this.overlayGroup = new THREE.Group();
    this.globeRoot.add(this.overlayGroup);

    // 5. High-Density 3D Relief Earth Sphere (128 x 96 segments)
    const fallbackTex = createInstantFallbackTexture();
    this.loadedTextures.push(fallbackTex);

    const earthGeo = new THREE.SphereGeometry(1, 128, 96);
    this.disposableGeometries.push(earthGeo);
    this.earthMaterial = new THREE.MeshPhysicalMaterial({
      map: fallbackTex,
      roughness: 0.72,
      metalness: 0.05,
      bumpScale: 0.036,
      clearcoat: 0.55,
      clearcoatRoughness: 0.24,
      reflectivity: 0.72,
      specularIntensity: 0.9,
      specularColor: new THREE.Color(0x9bd7ff),
    });
    this.disposableMaterials.push(this.earthMaterial);

    this.earthMesh = new THREE.Mesh(earthGeo, this.earthMaterial);
    this.earthMesh.name = 'AtlasReliefEarth';
    this.globeRoot.add(this.earthMesh);

    // 6. Custom GLSL Atmospheric Fresnel Rim & Horizon Scatter
    this.buildAtmosphere(options.atmosphereHex ?? 0x4db5ff);

    // 7. Subtle Gold 15° Latitude / Longitude Graticule
    this.buildGoldGraticule();

    // 8. Brushed-Brass Armillary Meridian Cradle
    this.armillaryGroup = this.buildBrassArmillaryCradle(
      options.brassTrimHex ?? 0xdcb563,
    );
    this.scene.add(this.armillaryGroup);

    // 9. Stream Baked Ultra-HD 4K Relief + 2K Elevation Bump + 2K Ocean Specular WebP Maps
    this.loadBakedEarthTextures();

    // 10. Pointer / Wheel / Resize Bindings
    this.bindEvents();
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);
    this.updateCameraTransform();

    // 11. Kick off 60fps loop
    this.lastFrameMs = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  // --------------------------------------------------------------------------
  // TEXTURE LOADING (4K Natural Earth Relief + 2K Elevation Bump + 2K Specular)
  // --------------------------------------------------------------------------
  private resolveTextureUrl(filename: string): string {
    if (this.options.textureBasePath) {
      return `${this.options.textureBasePath.replace(/\/$/, '')}/${filename}`;
    }
    const base =
      (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? './';
    const prefix = base.endsWith('/') ? base : `${base}/`;
    return `${prefix}assets/textures/v6/${filename}`;
  }

  private loadBakedEarthTextures(): void {
    const loader = new THREE.TextureLoader();
    const maxAniso = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());

    loader.load(
      this.resolveTextureUrl('earth_relief_albedo_4k.webp'),
      (tex) => {
        if (this.disposed || this.renderer.getContext()?.isContextLost?.()) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.needsUpdate = true;
        this.loadedTextures.push(tex);
        this.earthMaterial.map = tex;
        this.earthMaterial.needsUpdate = true;
      },
      undefined,
      () => {
        // Fallback already active if offline preview missing texture
      },
    );

    loader.load(
      this.resolveTextureUrl('earth_elevation_bump_2k.webp'),
      (tex) => {
        if (this.disposed || this.renderer.getContext()?.isContextLost?.()) {
          tex.dispose();
          return;
        }
        tex.anisotropy = Math.min(4, maxAniso);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        this.loadedTextures.push(tex);
        this.earthMaterial.bumpMap = tex;
        this.earthMaterial.bumpScale = 0.038;
        this.earthMaterial.needsUpdate = true;
      },
      undefined,
      () => {},
    );

    loader.load(
      this.resolveTextureUrl('earth_ocean_specular_2k.webp'),
      (tex) => {
        if (this.disposed || this.renderer.getContext()?.isContextLost?.()) {
          tex.dispose();
          return;
        }
        tex.anisotropy = Math.min(4, maxAniso);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        this.loadedTextures.push(tex);
        this.earthMaterial.specularIntensityMap = tex;
        this.earthMaterial.clearcoatMap = tex;
        this.earthMaterial.needsUpdate = true;
      },
      undefined,
      () => {},
    );
  }

  // --------------------------------------------------------------------------
  // ATMOSPHERIC FRESNEL RIM SHADER + GOLD GRATICULE + BRASS ARMILLARY CRADLE
  // --------------------------------------------------------------------------
  private buildAtmosphere(atmosphereHex: number): void {
    const color = new THREE.Color(atmosphereHex);

    // Outer BackSide Rayleigh limb halo
    const outerGeo = new THREE.SphereGeometry(1.062, 64, 48);
    this.disposableGeometries.push(outerGeo);
    const outerMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: color },
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
          float rim = clamp(0.66 - dot(vNormal, vViewDir), 0.0, 1.0);
          float glow = pow(rim, 2.75) * 1.15;
          gl_FragColor = vec4(uColor * 1.15, glow * 0.68);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.disposableMaterials.push(outerMat);
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    this.globeRoot.add(outerMesh);

    // Subtle FrontSide orbital horizon scatter
    const innerGeo = new THREE.SphereGeometry(1.012, 64, 48);
    this.disposableGeometries.push(innerGeo);
    const innerMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: color.clone().lerp(new THREE.Color(0x9be2ff), 0.35) },
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
          float ndv = clamp(dot(vNormal, vViewDir), 0.0, 1.0);
          float fresnel = pow(1.0 - ndv, 3.8);
          gl_FragColor = vec4(uColor, fresnel * 0.34);
        }
      `,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.disposableMaterials.push(innerMat);
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    this.globeRoot.add(innerMesh);
  }

  private buildGoldGraticule(): void {
    const r = 1.003;
    const finePts: number[] = [];
    const majorPts: number[] = [];

    // Parallels every 15 deg (-75..75)
    for (let lat = -75; lat <= 75; lat += 15) {
      const target = lat === 0 ? majorPts : finePts;
      const steps = 96;
      for (let i = 0; i < steps; i++) {
        const lngA = -180 + (i / steps) * 360;
        const lngB = -180 + ((i + 1) / steps) * 360;
        const a = latLngToVector3(lat, lngA, r);
        const b = latLngToVector3(lat, lngB, r);
        target.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    // Meridians every 15 deg (-180..165)
    for (let lng = -180; lng < 180; lng += 15) {
      const target = lng === 0 ? majorPts : finePts;
      const steps = 64;
      for (let i = 0; i < steps; i++) {
        const latA = -82 + (i / steps) * 164;
        const latB = -82 + ((i + 1) / steps) * 164;
        const a = latLngToVector3(latA, lng, r);
        const b = latLngToVector3(latB, lng, r);
        target.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    const fineGeo = new THREE.BufferGeometry();
    fineGeo.setAttribute('position', new THREE.Float32BufferAttribute(finePts, 3));
    this.disposableGeometries.push(fineGeo);
    const fineMat = new THREE.LineBasicMaterial({
      color: 0xe7c574,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    this.disposableMaterials.push(fineMat);
    this.globeRoot.add(new THREE.LineSegments(fineGeo, fineMat));

    const majorGeo = new THREE.BufferGeometry();
    majorGeo.setAttribute('position', new THREE.Float32BufferAttribute(majorPts, 3));
    this.disposableGeometries.push(majorGeo);
    const majorMat = new THREE.LineBasicMaterial({
      color: 0xf4d27d,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    });
    this.disposableMaterials.push(majorMat);
    this.globeRoot.add(new THREE.LineSegments(majorGeo, majorMat));
  }

  private buildBrassArmillaryCradle(brassHex: number): THREE.Group {
    const group = new THREE.Group();

    const brassMat = new THREE.MeshPhysicalMaterial({
      color: brassHex,
      metalness: 0.9,
      roughness: 0.25,
      clearcoat: 0.45,
      clearcoatRoughness: 0.2,
    });
    const darkBrassMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(brassHex).multiplyScalar(0.58),
      metalness: 0.88,
      roughness: 0.36,
    });
    this.disposableMaterials.push(brassMat, darkBrassMat);

    // Outer Meridian Brass Ring (positioned on the YZ plane perpendicular to camera so it frames Earth like a museum globe!)
    const outerRingGeo = new THREE.TorusGeometry(1.135, 0.017, 18, 128);
    this.disposableGeometries.push(outerRingGeo);
    const outerRing = new THREE.Mesh(outerRingGeo, brassMat);
    group.add(outerRing);

    // Inner chamfered accent bezel
    const innerRingGeo = new THREE.TorusGeometry(1.112, 0.006, 12, 128);
    this.disposableGeometries.push(innerRingGeo);
    const innerRing = new THREE.Mesh(innerRingGeo, darkBrassMat);
    group.add(innerRing);

    // Degree tick pips every 15 deg around the armillary meridian ring
    const pipGeo = new THREE.BoxGeometry(0.011, 0.032, 0.024);
    this.disposableGeometries.push(pipGeo);
    for (let deg = 0; deg < 360; deg += 15) {
      const rad = deg * DEG2RAD;
      const pip = new THREE.Mesh(pipGeo, deg % 90 === 0 ? brassMat : darkBrassMat);
      pip.position.set(Math.cos(rad) * 1.135, Math.sin(rad) * 1.135, 0);
      pip.rotation.z = rad + Math.PI * 0.5;
      if (deg % 90 === 0) pip.scale.set(1.4, 1.35, 1.25);
      group.add(pip);
    }

    // North & South Brass Polar Spindles + Finial Caps
    const spindleGeo = new THREE.CylinderGeometry(0.014, 0.018, 0.14, 16);
    const finialGeo = new THREE.SphereGeometry(0.032, 16, 12);
    const collarGeo = new THREE.TorusGeometry(0.028, 0.008, 10, 24);
    this.disposableGeometries.push(spindleGeo, finialGeo, collarGeo);

    for (const sign of [1, -1]) {
      const spindle = new THREE.Mesh(spindleGeo, brassMat);
      spindle.position.set(0, sign * 1.07, 0);
      group.add(spindle);

      const collar = new THREE.Mesh(collarGeo, darkBrassMat);
      collar.position.set(0, sign * 1.135, 0);
      collar.rotation.x = Math.PI * 0.5;
      group.add(collar);

      const finial = new THREE.Mesh(finialGeo, brassMat);
      finial.position.set(0, sign * 1.185, 0);
      group.add(finial);
    }

    // Lower Cradle Pedestal Arc (bottom 110° cradling arc)
    const cradleArcGeo = new THREE.TorusGeometry(1.195, 0.013, 14, 64, Math.PI * 0.62);
    this.disposableGeometries.push(cradleArcGeo);
    const cradleArc = new THREE.Mesh(cradleArcGeo, darkBrassMat);
    cradleArc.rotation.z = -Math.PI * 0.81;
    group.add(cradleArc);

    return group;
  }

  // --------------------------------------------------------------------------
  // 3D RUBY-TOPPED BRASS PUSHPIN & GOLD TARGET BEACON
  // --------------------------------------------------------------------------
  private createPushpinMesh(kind: 'RUBY' | 'GOLD' | 'CYAN' | 'AMETHYST'): THREE.Group {
    const pin = new THREE.Group();

    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0xe6c373,
      metalness: 0.92,
      roughness: 0.22,
    });
    const headPalette: Record<typeof kind, { color: number; emissive: number }> = {
      RUBY: { color: 0xff2146, emissive: 0x990b22 },
      GOLD: { color: 0xffd75e, emissive: 0xb87e12 },
      CYAN: { color: 0x45e4ff, emissive: 0x0e7ca0 },
      AMETHYST: { color: 0xb57bff, emissive: 0x5c20a8 },
    };
    const headSpec = headPalette[kind];
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: headSpec.color,
      emissive: headSpec.emissive,
      emissiveIntensity: 0.55,
      roughness: 0.14,
      metalness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });
    this.disposableMaterials.push(shaftMat, gemMat);

    // Tapered brass needle pointing down into globe surface (y=0 at surface contact)
    const needleGeo = new THREE.ConeGeometry(0.011, 0.085, 14);
    this.disposableGeometries.push(needleGeo);
    const needle = new THREE.Mesh(needleGeo, shaftMat);
    needle.rotation.x = Math.PI;
    needle.position.y = 0.042;
    pin.add(needle);

    // Turned brass bezel collar
    const collarGeo = new THREE.CylinderGeometry(0.024, 0.015, 0.02, 16);
    this.disposableGeometries.push(collarGeo);
    const collar = new THREE.Mesh(collarGeo, shaftMat);
    collar.position.y = 0.088;
    pin.add(collar);

    // Faceted jewel head (ruby/gold/cyan)
    const gemGeo = new THREE.OctahedronGeometry(0.032, 2);
    this.disposableGeometries.push(gemGeo);
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.y = 0.118;
    gem.scale.set(1.0, 0.88, 1.0);
    pin.add(gem);

    // Base brass halo ring flat against Earth's surface
    const haloGeo = new THREE.RingGeometry(0.016, 0.034, 24);
    this.disposableGeometries.push(haloGeo);
    const haloMat = new THREE.MeshBasicMaterial({
      color: headSpec.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    this.disposableMaterials.push(haloMat);
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = -Math.PI * 0.5;
    halo.position.y = 0.004;
    pin.add(halo);

    return pin;
  }

  private orientObjectToSurface(obj: THREE.Object3D, dir: THREE.Vector3, radius: number): void {
    obj.position.copy(dir).multiplyScalar(radius);
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  }

  /**
   * Plants or relocates the player's 3D ruby-topped brass pushpin on the globe.
   */
  public dropGuessPin(lat: number, lng: number, emitCallback = false): void {
    this.guessPinCoord = { lat, lng };
    const dir = latLngToVector3(lat, lng, 1.0).normalize();

    if (!this.guessPinState) {
      const group = this.createPushpinMesh('RUBY');
      this.overlayGroup.add(group);
      this.guessPinState = {
        group,
        surfaceDir: dir,
        dropProgress: 0,
        baseScale: 1.0,
      };
    } else {
      this.guessPinState.surfaceDir.copy(dir);
      this.guessPinState.dropProgress = 0;
    }
    this.orientObjectToSurface(this.guessPinState.group, dir, 1.14);

    if (emitCallback && this.options.onPinDrop) {
      this.options.onPinDrop({ lat, lng });
    }
  }

  public getGuessPin(): GeoPointV6 | null {
    return this.guessPinCoord ? { ...this.guessPinCoord } : null;
  }

  public setPinDropEnabled(enabled: boolean): void {
    this.allowPinDrop = enabled;
  }

  public setLocked(locked: boolean): void {
    this.locked = locked;
    this.allowPinDrop = !locked;
  }

  /**
   * Reveals the true target with a 24K Gold Crown Pin, concentric expanding
   * golden shockwave target rings, an animated 3D great-circle geodesic arc
   * connecting guess -> target, and smooth camera framing!
   */
  public revealTarget(
    targetLat: number,
    targetLng: number,
    options?: {
      fromCoord?: GeoPointV6 | null;
      bullseyeKm?: number;
      decayScaleKm?: number;
      autoFly?: boolean;
    },
  ): GlobePinScoreV6 {
    this.locked = true;
    this.allowPinDrop = false;
    this.orbitLandmarkState = null;

    const targetDir = latLngToVector3(targetLat, targetLng, 1.0).normalize();

    // 1. Gold Target Pin
    if (this.targetPinState) {
      this.overlayGroup.remove(this.targetPinState.group);
    }
    const targetPinGroup = this.createPushpinMesh('GOLD');
    targetPinGroup.scale.setScalar(1.15);
    this.overlayGroup.add(targetPinGroup);
    this.targetPinState = {
      group: targetPinGroup,
      surfaceDir: targetDir,
      dropProgress: 0,
      baseScale: 1.15,
    };
    this.orientObjectToSurface(targetPinGroup, targetDir, 1.18);

    // 2. Concentric Golden Shockwave Target Rings
    if (this.shockwaveRoot) {
      this.overlayGroup.remove(this.shockwaveRoot);
    }
    this.shockwaveRings = [];
    this.shockwaveRoot = new THREE.Group();
    this.orientObjectToSurface(this.shockwaveRoot, targetDir, 1.006);
    this.overlayGroup.add(this.shockwaveRoot);

    for (let i = 0; i < 3; i++) {
      const rGeo = new THREE.RingGeometry(0.035, 0.052, 48);
      this.disposableGeometries.push(rGeo);
      const rMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xffe484 : 0xf4b942,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      this.disposableMaterials.push(rMat);
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.rotation.x = -Math.PI * 0.5;
      this.shockwaveRoot.add(rMesh);
      this.shockwaveRings.push({ mesh: rMesh, mat: rMat, phase: i * 0.33 });
    }

    // 3. Animated Great-Circle Geodesic Arc + Haversine Distance Score
    const fromCoord = options?.fromCoord !== undefined ? options.fromCoord : this.guessPinCoord;
    let distKm = 20000;
    if (fromCoord) {
      distKm = haversineDistanceKm(fromCoord.lat, fromCoord.lng, targetLat, targetLng);
      this.buildGeodesicArc(fromCoord.lat, fromCoord.lng, targetLat, targetLng, 0xffd766);

      if (options?.autoFly !== false) {
        const fromDir = latLngToVector3(fromCoord.lat, fromCoord.lng, 1.0).normalize();
        const midVec = fromDir.clone().add(targetDir);
        const focusCoord =
          midVec.lengthSq() > 0.001
            ? vector3ToLatLng(midVec.normalize())
            : { lat: targetLat, lng: targetLng };
        const spanDistance = THREE.MathUtils.clamp(2.55 + (distKm / 9500) * 1.15, 2.5, 3.85);
        this.flyTo(focusCoord.lat, focusCoord.lng, spanDistance, 0.95);
      }
    } else if (options?.autoFly !== false) {
      this.flyTo(targetLat, targetLng, 2.55, 0.85);
    }

    return computeGlobePinScore(
      distKm,
      options?.bullseyeKm ?? 120,
      options?.decayScaleKm ?? 1850,
    );
  }

  /**
   * Draws a luminous elevated 3D great-circle geodesic arc between two Earth coordinates.
   */
  public buildGeodesicArc(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    colorHex = 0xffd766,
    replacePrimary = true,
  ): THREE.Mesh {
    if (replacePrimary && this.geodesicArcMesh) {
      this.overlayGroup.remove(this.geodesicArcMesh);
      this.geodesicArcMesh = null;
    }

    const vStart = latLngToVector3(lat1, lng1, 1.0).normalize();
    const vEnd = latLngToVector3(lat2, lng2, 1.0).normalize();
    const angle = Math.acos(THREE.MathUtils.clamp(vStart.dot(vEnd), -1, 1));
    const liftMax = Math.min(0.32, 0.05 + (angle / Math.PI) * 0.28);

    const points: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let p: THREE.Vector3;
      if (angle < 0.001) {
        p = vStart.clone();
      } else if (Math.PI - angle < 0.01) {
        // Near-antipodal safe slerp via orthogonal axis
        const axis = new THREE.Vector3(0, 1, 0);
        if (Math.abs(vStart.dot(axis)) > 0.9) axis.set(1, 0, 0);
        const ortho = new THREE.Vector3().crossVectors(vStart, axis).normalize();
        p = vStart
          .clone()
          .multiplyScalar(Math.cos(Math.PI * t))
          .add(ortho.multiplyScalar(Math.sin(Math.PI * t)));
      } else {
        const sinA = Math.sin(angle);
        const w1 = Math.sin((1 - t) * angle) / sinA;
        const w2 = Math.sin(t * angle) / sinA;
        p = vStart.clone().multiplyScalar(w1).add(vEnd.clone().multiplyScalar(w2)).normalize();
      }
      const elev = 1.008 + Math.sin(Math.PI * t) * liftMax;
      points.push(p.multiplyScalar(elev));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.009, 10, false);
    this.disposableGeometries.push(tubeGeo);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.95,
    });
    this.disposableMaterials.push(tubeMat);
    const mesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.overlayGroup.add(mesh);

    if (replacePrimary) {
      this.geodesicArcMesh = mesh;
      this.geodesicArcTotalIndices = tubeGeo.index ? tubeGeo.index.count : 0;
      this.geodesicArcProgress = 0;
      if (this.geodesicArcTotalIndices > 0) {
        tubeGeo.setDrawRange(0, 0);
      }
    }
    return mesh;
  }

  // --------------------------------------------------------------------------
  // SPECIALIZED SPATIAL MODES FOR FAMILY II TOYS (012–020)
  // --------------------------------------------------------------------------

  /** Toy 13: Glowing 3D Latitude Ring sweeping North/South across Earth. */
  public setLatitudeRing(latDeg: number | null): void {
    if (this.latitudeRingMesh) {
      this.overlayGroup.remove(this.latitudeRingMesh);
      this.latitudeRingMesh = null;
    }
    if (latDeg === null) return;
    const clampedLat = THREE.MathUtils.clamp(latDeg, -82, 82);
    const phi = clampedLat * DEG2RAD;
    const ringRadius = Math.cos(phi) * 1.009;
    const y = Math.sin(phi) * 1.009;

    const geo = new THREE.TorusGeometry(ringRadius, 0.01, 14, 128);
    this.disposableGeometries.push(geo);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffd564,
      transparent: true,
      opacity: 0.94,
    });
    this.disposableMaterials.push(mat);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI * 0.5;
    mesh.position.y = y;
    this.overlayGroup.add(mesh);
    this.latitudeRingMesh = mesh;
  }

  /** Toy 17: Sweeping Golden Solar Meridian + Dynamic Sun Key Lighting. */
  public setSolarMeridian(lngDeg: number | null): void {
    if (this.solarMeridianGroup) {
      this.overlayGroup.remove(this.solarMeridianGroup);
      this.solarMeridianGroup = null;
    }
    if (lngDeg === null) {
      this.ambientLight.intensity = 0.78;
      this.keyLight.intensity = 2.35;
      return;
    }
    const group = new THREE.Group();
    const pts: THREE.Vector3[] = [];
    for (let lat = -85; lat <= 85; lat += 5) {
      pts.push(latLngToVector3(lat, lngDeg, 1.011));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const geo = new THREE.TubeGeometry(curve, 48, 0.011, 10, false);
    this.disposableGeometries.push(geo);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffbd42,
      transparent: true,
      opacity: 0.95,
    });
    this.disposableMaterials.push(mat);
    group.add(new THREE.Mesh(geo, mat));
    this.overlayGroup.add(group);
    this.solarMeridianGroup = group;

    // Position directional sun over this solar noon meridian for dramatic day/night twilight!
    const sunDir = latLngToVector3(12, lngDeg, 6.0);
    this.keyLight.position.copy(sunDir);
    this.keyLight.intensity = 3.1;
    this.ambientLight.intensity = 0.36;
  }

  /** Toys 12, 14, 15, 16: Reference Pins + Optional Great-Circle Arcs. */
  public setReferenceMarkers(
    markers: GlobeMarkerSpecV6[],
    connectFrom?: GeoPointV6 | null,
  ): void {
    if (this.referenceMarkersGroup) {
      this.overlayGroup.remove(this.referenceMarkersGroup);
      this.referenceMarkersGroup = null;
    }
    this.pulsingMeshes = [];
    if (markers.length === 0) return;

    const group = new THREE.Group();
    for (let i = 0; i < markers.length; i++) {
      const m = markers[i];
      const dir = latLngToVector3(m.lat, m.lng, 1.0).normalize();
      const pinKind = i === 0 ? 'CYAN' : i === 1 ? 'GOLD' : 'AMETHYST';
      const pin = this.createPushpinMesh(pinKind);
      pin.scale.setScalar(0.95);
      this.orientObjectToSurface(pin, dir, 1.002);
      group.add(pin);

      if (m.pulsing !== false) {
        const ringGeo = new THREE.RingGeometry(0.032, 0.048, 32);
        this.disposableGeometries.push(ringGeo);
        const ringMat = new THREE.MeshBasicMaterial({
          color: m.colorHex ?? 0x56d8ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.78,
          depthWrite: false,
        });
        this.disposableMaterials.push(ringMat);
        const ring = new THREE.Mesh(ringGeo, ringMat);
        const ringHolder = new THREE.Group();
        ring.rotation.x = -Math.PI * 0.5;
        ringHolder.add(ring);
        this.orientObjectToSurface(ringHolder, dir, 1.006);
        group.add(ringHolder);
        this.pulsingMeshes.push(ring);
      }

      if (connectFrom) {
        const arc = this.buildGeodesicArc(
          connectFrom.lat,
          connectFrom.lng,
          m.lat,
          m.lng,
          m.colorHex ?? (i === 0 ? 0x56d8ff : 0xffd260),
          false,
        );
        this.overlayGroup.remove(arc);
        group.add(arc);
      }
    }

    this.overlayGroup.add(group);
    this.referenceMarkersGroup = group;
  }

  /** Toy 18: Hemisphere Quadrant Divider & Highlight Beacon. */
  public setHemisphereHighlight(quadrant: 'NW' | 'NE' | 'SW' | 'SE' | null): void {
    if (this.hemisphereGroup) {
      this.overlayGroup.remove(this.hemisphereGroup);
      this.hemisphereGroup = null;
    }
    const group = new THREE.Group();

    // Illuminated Equator & Prime Meridian dividers
    const eqGeo = new THREE.TorusGeometry(1.008, 0.007, 10, 128);
    const pmGeo = new THREE.TorusGeometry(1.008, 0.007, 10, 128);
    this.disposableGeometries.push(eqGeo, pmGeo);
    const divMat = new THREE.MeshBasicMaterial({
      color: 0xffd66e,
      transparent: true,
      opacity: 0.85,
    });
    this.disposableMaterials.push(divMat);
    const eq = new THREE.Mesh(eqGeo, divMat);
    eq.rotation.x = Math.PI * 0.5;
    group.add(eq);

    const pm = new THREE.Mesh(pmGeo, divMat);
    group.add(pm);

    if (quadrant) {
      const centerMap: Record<'NW' | 'NE' | 'SW' | 'SE', GeoPointV6> = {
        NW: { lat: 36, lng: -85 },
        NE: { lat: 36, lng: 65 },
        SW: { lat: -28, lng: -68 },
        SE: { lat: -26, lng: 112 },
      };
      const pt = centerMap[quadrant];
      const beacon = this.createPushpinMesh('GOLD');
      this.orientObjectToSurface(beacon, latLngToVector3(pt.lat, pt.lng, 1.0).normalize(), 1.003);
      group.add(beacon);
      this.flyTo(pt.lat, pt.lng, 3.05, 0.65);
    }

    this.overlayGroup.add(group);
    this.hemisphereGroup = group;
  }

  /** Toy 19: Antipode Origin Pin + Through-Earth Core Laser Beam. */
  public setAntipodeOrigin(lat: number, lng: number): void {
    if (this.antipodeGroup) {
      this.overlayGroup.remove(this.antipodeGroup);
      this.antipodeGroup = null;
    }
    const group = new THREE.Group();
    const originDir = latLngToVector3(lat, lng, 1.0).normalize();
    const pin = this.createPushpinMesh('AMETHYST');
    this.orientObjectToSurface(pin, originDir, 1.002);
    group.add(pin);

    // Subtle protruding opposite-axis nubs hinting the diameter axis
    const axisGeo = new THREE.CylinderGeometry(0.008, 0.008, 2.26, 12);
    this.disposableGeometries.push(axisGeo);
    const axisMat = new THREE.MeshBasicMaterial({
      color: 0xb57bff,
      transparent: true,
      opacity: 0.48,
    });
    this.disposableMaterials.push(axisMat);
    const axisMesh = new THREE.Mesh(axisGeo, axisMat);
    axisMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), originDir);
    group.add(axisMesh);

    this.overlayGroup.add(group);
    this.antipodeGroup = group;
  }

  /** Toy 20: Smooth Low-Orbit Satellite Camera Circling a Mystery Region. */
  public setOrbitLandmark(lat: number, lng: number): void {
    this.orbitLandmarkState = {
      centerLat: lat,
      centerLng: lng,
      angle: 0,
      radiusDeg: 14,
      distance: 2.25,
    };
    this.idleSpinSpeed = 0;
    this.flyTo(lat, lng, 2.25, 0.85);
  }

  /** Smoothly rotates & zooms the camera to frame `{ lat, lng }`. */
  public flyTo(lat: number, lng: number, distance = this.camDistance, durationSec = 0.8): void {
    const startLng = this.camLngDeg;
    let deltaLng = ((lng - startLng + 540) % 360) - 180;
    const endLng = startLng + deltaLng;
    this.velLat = 0;
    this.velLng = 0;
    this.flyTween = {
      startLat: this.camLatDeg,
      startLng,
      startDist: this.camDistance,
      endLat: THREE.MathUtils.clamp(lat, -78, 78),
      endLng,
      endDist: THREE.MathUtils.clamp(distance, 2.05, 4.1),
      elapsed: 0,
      duration: Math.max(0.15, durationSec),
    };
    this.targetDistance = this.flyTween.endDist;
  }

  public getViewCenter(): GeoPointV6 {
    return { lat: this.camLatDeg, lng: this.camLngDeg };
  }

  // --------------------------------------------------------------------------
  // POINTER / PINCH-ZOOM / RAYCASTER INTERACTION
  // --------------------------------------------------------------------------
  private bindEvents(): void {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('pointerup', this.onPointerUp);
    dom.addEventListener('pointercancel', this.onPointerUp);
    dom.addEventListener('wheel', this.onWheel, { passive: false });
  }

  private readonly onPointerDown = (e: PointerEvent): void => {
    const dom = this.renderer.domElement;
    dom.setPointerCapture(e.pointerId);
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.userHasInteracted = true;
    this.flyTween = null;

    if (this.activePointers.size === 1) {
      this.primaryPointerId = e.pointerId;
      this.pointerDownX = e.clientX;
      this.pointerDownY = e.clientY;
      this.pointerDownTime = performance.now();
      this.pointerMovedPx = 0;
      this.lastDragX = e.clientX;
      this.lastDragY = e.clientY;
      this.velLat = 0;
      this.velLng = 0;
      dom.style.cursor = 'grabbing';
    } else if (this.activePointers.size === 2) {
      this.primaryPointerId = null;
      this.lastPinchDist = this.getTwoPointerDistance();
    }
  };

  private readonly onPointerMove = (e: PointerEvent): void => {
    if (!this.activePointers.has(e.pointerId)) return;
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.activePointers.size === 2) {
      const dist = this.getTwoPointerDistance();
      if (this.lastPinchDist > 1 && dist > 1) {
        const ratio = this.lastPinchDist / dist;
        this.targetDistance = THREE.MathUtils.clamp(
          this.targetDistance * Math.pow(ratio, 0.9),
          2.05,
          4.1,
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

      const zoomFactor = (this.camDistance - 1.0) / 1.9;
      const degPerPx = 0.27 * zoomFactor;
      const dLng = -dx * degPerPx;
      const dLat = dy * degPerPx;

      this.camLngDeg = this.normalizeLng(this.camLngDeg + dLng);
      this.camLatDeg = THREE.MathUtils.clamp(this.camLatDeg + dLat, -78, 78);
      this.velLng = dLng * 0.85;
      this.velLat = dLat * 0.85;
      this.orbitLandmarkState = null;
      this.updateCameraTransform();
    }
  };

  private readonly onPointerUp = (e: PointerEvent): void => {
    const dom = this.renderer.domElement;
    if (dom.hasPointerCapture(e.pointerId)) {
      dom.releasePointerCapture(e.pointerId);
    }
    const wasPrimary = e.pointerId === this.primaryPointerId;
    this.activePointers.delete(e.pointerId);

    if (this.activePointers.size === 0) {
      this.primaryPointerId = null;
      dom.style.cursor = 'grab';

      const elapsed = performance.now() - this.pointerDownTime;
      const totalMove = Math.hypot(
        e.clientX - this.pointerDownX,
        e.clientY - this.pointerDownY,
      );
      // Clean Tap -> Raycast Ruby Brass Pushpin Drop!
      if (
        wasPrimary &&
        this.allowPinDrop &&
        !this.locked &&
        totalMove < 10 &&
        this.pointerMovedPx < 14 &&
        elapsed < 340
      ) {
        const hit = this.raycastEarth(e.clientX, e.clientY);
        if (hit) {
          this.velLat = 0;
          this.velLng = 0;
          this.dropGuessPin(hit.lat, hit.lng, true);
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
    this.userHasInteracted = true;
    this.flyTween = null;
    const factor = e.deltaY > 0 ? 1.09 : 0.92;
    this.targetDistance = THREE.MathUtils.clamp(this.targetDistance * factor, 2.05, 4.1);
  };

  private getTwoPointerDistance(): number {
    const pts = Array.from(this.activePointers.values());
    if (pts.length < 2) return 0;
    return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
  }

  private raycastEarth(clientX: number, clientY: number): GeoPointV6 | null {
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
    let v = ((lng + 180) % 360 + 360) % 360 - 180;
    if (v === -180 && lng > 0) v = 180;
    return v;
  }

  private updateCameraTransform(): void {
    const camPos = latLngToVector3(this.camLatDeg, this.camLngDeg, this.camDistance);
    this.camera.position.copy(camPos);
    this.camera.lookAt(0, 0, 0);

    // Orient the brass armillary meridian frame smoothly perpendicular to camera view
    // so it majestically silhouettes the Earth without ever slicing across the front!
    const camHorizAngle = Math.atan2(camPos.x, camPos.z);
    this.armillaryGroup.rotation.y = camHorizAngle;

    // Keep raking directional studio sun slightly offset upper-right of camera unless Solar Mode active
    if (!this.solarMeridianGroup) {
      const sunPos = latLngToVector3(
        THREE.MathUtils.clamp(this.camLatDeg + 26, -75, 75),
        this.normalizeLng(this.camLngDeg + 38),
        6.5,
      );
      this.keyLight.position.copy(sunPos);
    }

    if (this.options.onViewChange) {
      this.options.onViewChange(
        { lat: this.camLatDeg, lng: this.camLngDeg },
        this.camDistance,
      );
    }
  }

  private handleResize(): void {
    if (this.disposed || !this.container.isConnected) return;
    const glCtx = this.renderer.getContext();
    if (!glCtx || glCtx.isContextLost()) return;
    const w = Math.max(100, this.container.clientWidth);
    const h = Math.max(100, this.container.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  // --------------------------------------------------------------------------
  // 60FPS ANIMATION LOOP
  // --------------------------------------------------------------------------
  private readonly tick = (nowMs: number): void => {
    if (this.disposed || !this.container.isConnected) return;
    const glCtx = this.renderer.getContext();
    if (!glCtx || glCtx.isContextLost()) {
      this.dispose();
      return;
    }
    if (this.elapsedTotal > 0.1 && !this.renderer.domElement.isConnected) {
      this.dispose();
      return;
    }
    const dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastFrameMs) / 1000));
    this.lastFrameMs = nowMs;
    this.elapsedTotal += dt;

    // 1. Camera smooth flight / Orbit Landmark / Inertia / Idle spin
    let cameraDirty = false;
    if (this.flyTween) {
      this.flyTween.elapsed += dt;
      const t = Math.min(1, this.flyTween.elapsed / this.flyTween.duration);
      const ease = 1 - Math.pow(1 - t, 3);
      this.camLatDeg = THREE.MathUtils.lerp(this.flyTween.startLat, this.flyTween.endLat, ease);
      this.camLngDeg = this.normalizeLng(
        THREE.MathUtils.lerp(this.flyTween.startLng, this.flyTween.endLng, ease),
      );
      this.camDistance = THREE.MathUtils.lerp(
        this.flyTween.startDist,
        this.flyTween.endDist,
        ease,
      );
      this.targetDistance = this.camDistance;
      if (t >= 1) this.flyTween = null;
      cameraDirty = true;
    } else if (this.orbitLandmarkState && this.activePointers.size === 0) {
      this.orbitLandmarkState.angle += dt * 0.55;
      this.camLatDeg = THREE.MathUtils.clamp(
        this.orbitLandmarkState.centerLat +
          Math.sin(this.orbitLandmarkState.angle) * this.orbitLandmarkState.radiusDeg * 0.6,
        -76,
        76,
      );
      this.camLngDeg = this.normalizeLng(
        this.orbitLandmarkState.centerLng +
          Math.cos(this.orbitLandmarkState.angle) * this.orbitLandmarkState.radiusDeg,
      );
      this.targetDistance = this.orbitLandmarkState.distance;
      cameraDirty = true;
    } else if (this.activePointers.size === 0) {
      if (Math.abs(this.velLng) > 0.005 || Math.abs(this.velLat) > 0.005) {
        const decay = Math.pow(0.91, dt * 60);
        this.camLngDeg = this.normalizeLng(this.camLngDeg + this.velLng);
        this.camLatDeg = THREE.MathUtils.clamp(this.camLatDeg + this.velLat, -78, 78);
        this.velLng *= decay;
        this.velLat *= decay;
        cameraDirty = true;
      } else if (!this.userHasInteracted && !this.locked && this.idleSpinSpeed !== 0) {
        this.camLngDeg = this.normalizeLng(
          this.camLngDeg + this.idleSpinSpeed * RAD2DEG * dt,
        );
        cameraDirty = true;
      }
    }

    if (Math.abs(this.camDistance - this.targetDistance) > 0.001) {
      this.camDistance = THREE.MathUtils.lerp(
        this.camDistance,
        this.targetDistance,
        Math.min(1, dt * 10),
      );
      cameraDirty = true;
    }

    if (cameraDirty) {
      this.updateCameraTransform();
    }

    // 2. Spring-Drop Bounce Animation on Ruby Guess Pin & Gold Target Pin
    this.animatePinDrop(this.guessPinState, dt);
    this.animatePinDrop(this.targetPinState, dt);

    // 3. Animated Great-Circle Geodesic Arc draw-in
    if (this.geodesicArcMesh && this.geodesicArcTotalIndices > 0 && this.geodesicArcProgress < 1) {
      this.geodesicArcProgress = Math.min(1, this.geodesicArcProgress + dt * 1.45);
      const eased = 1 - Math.pow(1 - this.geodesicArcProgress, 2.5);
      this.geodesicArcMesh.geometry.setDrawRange(
        0,
        Math.floor(eased * this.geodesicArcTotalIndices),
      );
    }

    // 4. Concentric Golden Shockwave Target Ring Reveal
    for (const ring of this.shockwaveRings) {
      ring.phase = (ring.phase + dt * 0.72) % 1.0;
      const scale = 0.65 + ring.phase * 4.4;
      ring.mesh.scale.setScalar(scale);
      ring.mat.opacity = Math.pow(1 - ring.phase, 1.55) * 0.92;
    }

    // 5. Reference pulsing beacons
    for (let i = 0; i < this.pulsingMeshes.length; i++) {
      const m = this.pulsingMeshes[i];
      const p = (this.elapsedTotal * 0.85 + i * 0.27) % 1;
      m.scale.setScalar(0.8 + p * 2.1);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.82;
    }

    if (this.disposed || !this.container.isConnected) return;
    const postGlCtx = this.renderer.getContext();
    if (!postGlCtx || postGlCtx.isContextLost()) {
      this.dispose();
      return;
    }
    try {
      this.renderer.render(this.scene, this.camera);
    } catch {
      this.dispose();
      return;
    }
    if (!this.disposed) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  private animatePinDrop(pin: AnimatedPinState | null, dt: number): void {
    if (!pin || pin.dropProgress >= 1) return;
    pin.dropProgress = Math.min(1, pin.dropProgress + dt * 4.2);
    const p = pin.dropProgress;
    // Elastic landing bounce onto globe radius 1.001
    const overshoot = p < 0.7 ? 1 - Math.pow(1 - p / 0.7, 2) : 1 + Math.sin(((p - 0.7) / 0.3) * Math.PI) * 0.08;
    const alt = 1.001 + (1 - Math.min(1, overshoot)) * 0.16;
    this.orientObjectToSurface(pin.group, pin.surfaceDir, alt);
    const squash = p > 0.7 && p < 0.95 ? 1 - Math.sin(((p - 0.7) / 0.25) * Math.PI) * 0.14 : 1;
    pin.group.scale.set(
      pin.baseScale * (2 - squash),
      pin.baseScale * squash,
      pin.baseScale * (2 - squash),
    );
    if (pin.dropProgress >= 1) {
      this.orientObjectToSurface(pin.group, pin.surfaceDir, 1.001);
      pin.group.scale.setScalar(pin.baseScale);
    }
  }

  // --------------------------------------------------------------------------
  // CLEANUP & ZERO-LEAK DISPOSAL
  // --------------------------------------------------------------------------
  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    dom.removeEventListener('pointermove', this.onPointerMove);
    dom.removeEventListener('pointerup', this.onPointerUp);
    dom.removeEventListener('pointercancel', this.onPointerUp);
    dom.removeEventListener('wheel', this.onWheel);

    for (const tex of this.loadedTextures) tex.dispose();
    for (const geo of this.disposableGeometries) geo.dispose();
    for (const mat of this.disposableMaterials) mat.dispose();
    this.renderer.dispose();
    try {
      this.renderer.forceContextLoss();
    } catch {
      // Context may already be lost in headless/unmounted teardown
    }
    if (dom.parentElement === this.container) {
      this.container.removeChild(dom);
    }
  }
}
