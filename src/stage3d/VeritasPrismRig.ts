import * as THREE from 'three';
import { Text as TroikaText } from 'troika-three-text';
import {
  buildHologramCoreGlyph,
  createCrystalFacetMaterial,
  createVolumetricBeamMaterial,
  disposeObject3D,
  getContactShadowTexture,
  getDomainPalette,
  getRadialSparkTexture,
  PRISM_ATELIER_SKINS,
  upgradeToHorologicalPhysicalMaterial,
  type CrystalFacetMaterialHandle,
  type DomainShaderPalette,
  type HeroRelicKey,
  type PrismArchetype,
  type PrismAtelierSkinId,
  type PrismAtelierSkinSpec,
  type VenueCode,
} from './DomainShaderKits';
import { VenueArenaLoader } from './VenueArenaLoader';

/**
 * Strongly typed wrapper around `troika-three-text` `Text` (which extends `THREE.Mesh` at runtime).
 */
export type TroikaTextMesh = THREE.Mesh & {
  text: string;
  anchorX: number | 'left' | 'center' | 'right' | string;
  anchorY: number | 'top' | 'middle' | 'bottom' | string;
  curveRadius: number;
  font: string | null;
  fontSize: number;
  fontWeight: number | 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  letterSpacing: number;
  lineHeight: number | 'normal';
  maxWidth: number;
  overflowWrap: 'normal' | 'break-word';
  textAlign: 'left' | 'right' | 'center' | 'justify';
  whiteSpace: 'normal' | 'nowrap';
  color: number | string | THREE.Color;
  fillOpacity: number;
  outlineWidth: number | string;
  outlineColor: number | string | THREE.Color;
  outlineOpacity: number;
  depthOffset: number;
  glyphGeometryDetail: number;
  sync: (callback?: () => void) => void;
  dispose: () => void;
};

function createTroikaMesh(): TroikaTextMesh {
  const instance = new TroikaText() as unknown as TroikaTextMesh;
  instance.renderOrder = 12;
  return instance;
}

export interface VisualBlueprintPlateSpec {
  readonly imageUrl: string;
  readonly caption?: string;
  readonly aspect?: 'SQUARE' | 'WIDE';
}

export interface SightlineLockSpec {
  options: string[];
  domainId?: number;
  glyphId?: string;
  initialIndex?: number;
  peelTier?: 1 | 2 | 3;
  eliminatedIndices?: number[];
  stressFractureIndices?: number[];
  peopleHeatmapWeights?: number[];
  visualPlate?: VisualBlueprintPlateSpec;
}

export interface CodexDualRingSpec {
  subjects: string[];
  targets: string[];
  domainId?: number;
  initialTopIndex?: number;
  initialBottomIndex?: number;
  lockedConduits?: number;
}

export interface CalibratorDialSpec {
  minVal: number;
  maxVal: number;
  step?: number;
  unit?: string;
  initialVal?: number;
  toleranceFraction?: number;
  multiplierLabel?: string;
  domainId?: number;
}

export interface GauntletShatterSpec {
  statement: string;
  domainId?: number;
}

export interface HeroArtifactSpec {
  relicId: HeroRelicKey;
  domainId?: number;
  glyphId?: string;
  /** Optional 4 answer facets for 3-step Boss Hero Artifact Synthesis rounds */
  options?: string[];
  initialIndex?: number;
  peelTier?: 1 | 2 | 3;
  eliminatedIndices?: number[];
  stressFractureIndices?: number[];
  peopleHeatmapWeights?: number[];
  openLatchCount?: number;
}

export interface GlobeFlightArcSpec {
  from: VenueCode;
  to: VenueCode;
  colorHex?: number;
  highlight?: boolean;
}

export interface GlobePinDropVisualSpec {
  readonly targetLat: number;
  readonly targetLon: number;
  readonly targetLabel: string;
  readonly bullseyeKm?: number;
  readonly goldKm?: number;
  readonly grazeKm?: number;
  readonly domainId?: number;
  readonly peelTier?: 1 | 2 | 3;
}

export interface WorldGlobeSpec {
  focusedVenue?: VenueCode;
  unlockedVenues?: VenueCode[];
  completedVenues?: VenueCode[];
  showAct1FlightFork?: boolean;
  customArcs?: GlobeFlightArcSpec[];
  /** Activates 6th morph interactive `GLOBE_PIN_DROP` mode on `meridian_world_globe.glb`. */
  pinDropMode?: boolean;
  pinDrop?: GlobePinDropVisualSpec;
}

export type MorphSpecMap = {
  SIGHTLINE_LOCK: SightlineLockSpec;
  CODEX_DUAL_RING: CodexDualRingSpec;
  CALIBRATOR_DIAL: CalibratorDialSpec;
  GAUNTLET_SHATTER: GauntletShatterSpec;
  HERO_ARTIFACT_SYNTHESIS: HeroArtifactSpec;
  WORLD_GLOBE: WorldGlobeSpec;
  CHAMPIONSHIP_TROPHY: { domainId?: number };
  IDLE_ORB: { domainId?: number };
  DIPLOMATIC_PASSPORT: { openCover?: boolean };
};

export interface PrismRigCallbacks {
  onSpinDetent?: (facetIndex: number, angularSpeed: number) => void;
  onFacetSelected?: (facetIndex: number) => void;
  onCodexChanged?: (
    topIndex: number,
    bottomIndex: number,
    changedRing: 'TOP' | 'BOTTOM'
  ) => void;
  onCalibratorChanged?: (value: number, toleranceFraction: number) => void;
}

export interface RaycastHitResult {
  kind:
    | 'FACET'
    | 'CROWN'
    | 'CODEX_TOP'
    | 'CODEX_BOTTOM'
    | 'CALIBRATOR'
    | 'GAUNTLET'
    | 'GLOBE_PIN'
    | 'GLOBE_BODY'
    | 'ARTIFACT';
  facetIndex?: number;
  venueCode?: VenueCode;
  globeCoords?: { lat: number; lon: number };
}

interface FacetEntry {
  index: number;
  baseAngle: number;
  node: THREE.Object3D;
  basePos: THREE.Vector3;
  baseQuat: THREE.Quaternion;
  hitbox: THREE.Mesh;
  crystalHandle: CrystalFacetMaterialHandle;
  badgeText: TroikaTextMesh;
  answerText: TroikaTextMesh;
  eliminated: boolean;
}

interface ShutterEntry {
  node: THREE.Object3D;
  basePos: THREE.Vector3;
  baseQuat: THREE.Quaternion;
}

interface JawEntry {
  node: THREE.Object3D;
  basePos: THREE.Vector3;
  baseQuat: THREE.Quaternion;
}

interface ActiveShard {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  rotVel: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface BurstParticleSet {
  points: THREE.Points;
  velocities: Float32Array;
  life: number;
  maxLife: number;
}

const CITY_GLOBE_COORDS: Array<{
  code: VenueCode;
  label: string;
  lat: number;
  lon: number;
}> = [
  { code: 'ch', label: 'GENEVA', lat: 46.2, lon: 6.14 },
  { code: 'gb', label: 'LONDON', lat: 51.51, lon: -0.13 },
  { code: 'jp', label: 'TOKYO', lat: 35.68, lon: 139.65 },
  { code: 'br', label: 'RIO', lat: -22.91, lon: -43.17 },
  { code: 'eg', label: 'CAIRO', lat: 30.04, lon: 31.24 },
  { code: 'is', label: 'REYKJAVIK', lat: 64.15, lon: -21.94 },
  { code: 'sg', label: 'SINGAPORE', lat: 1.35, lon: 103.82 },
  { code: 'global', label: 'APEX FORUM', lat: 14.5, lon: -38.0 },
];

const RELIC_GLB_PATHS: Record<HeroRelicKey, string> = {
  meridian_astrolabe: 'assets/models/relic_meridian_astrolabe.glb',
  armillary_orrery: 'assets/aaa_models/relic_london_orrery.glb',
  origami_prism: 'assets/aaa_models/relic_tokyo_origami.glb',
  emerald_sphere: 'assets/aaa_models/relic_rio_sphere.glb',
  cipher_box: 'assets/aaa_models/relic_cairo_cipher.glb',
  cryo_relay: 'assets/aaa_models/relic_reykjavik_cryo.glb',
  council_seal: 'assets/aaa_models/relic_singapore_seal.glb',
  master_ledger: 'assets/aaa_models/relic_apex_ledger.glb',
  championship_trophy: 'assets/aaa_models/championship_trophy.glb',
  meridian_passport_3d: 'assets/aaa_models/meridian_passport_3d.glb',
};

const GLYPH_HINT_TO_FILE: Record<string, string> = {
  crown: 'double_eagle',
  scroll: 'wax_seal_scroll',
  atom: 'atom_orbital',
  prism: 'prism_refraction',
  rocket: 'ringed_planet',
  globe: 'globe_grid',
  compass: 'compass_rose',
  wave: 'volcano',
  column: 'ionic_column',
  mask: 'apollo_lyre',
  star: 'cinema_reel',
  flame: 'olympic_torch',
  gear: 'horology_gears',
  dna: 'dna_helix',
  scales: 'scales_treaty',
  eye: 'ouroboros_sun',
};

const FACET_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const YEAR_UNIT_RE = /^(ce|bce|ad|bc|a\.d\.|b\.c\.|yr|yrs|year|years)$/i;
const DATE_COMMA_CONTEXT_RE =
  /\b(in|on|by|from|to|until|since|circa|c\.|year|born|died|founded|opened|established|inducted|debuted|season|series|january|february|march|april|may|june|july|august|september|october|november|december)\s+([12]),(\d{3})\b/gi;
const DATE_COMMA_ERA_RE = /\b([12]),(\d{3})(\s*(?:CE|BCE|AD|BC|s))\b/g;
const DATE_COMMA_RANGE_RE = /\b([12]),(\d{3})([–-])([12]),?(\d{3})\b/g;
const DATE_COMMA_PAREN_RE = /\(([b.\s]*)([12]),(\d{3})\)/g;
const STANDALONE_YEAR_COMMA_RE = /^([12]),(\d{3})$/;

/**
 * Formats a 3D Calibrator Chronometer number with luxury horological typography:
 * NEVER inserts commas into 4-digit calendar years (`1000..2150` / `CE` / `BCE` / `AD` / `BC` / `year`
 * -> `1969`, NEVER `1,969`), while formatting large non-year quantities cleanly.
 */
export function formatCalibratorDialNumber(
  value: number,
  unit = '',
  minVal?: number,
  maxVal?: number
): string {
  if (!Number.isFinite(value)) return '0';
  const cleanUnit = unit.trim();
  const isYearUnit = YEAR_UNIT_RE.test(cleanUnit);
  const absVal = Math.abs(value);
  const isInteger = Math.abs(value - Math.round(value)) < 1e-6;
  const isCalendarYearRange =
    minVal !== undefined &&
    maxVal !== undefined &&
    minVal >= -4000 &&
    maxVal <= 2150 &&
    (maxVal >= 1000 || minVal >= 1000);
  const isLikelyYear =
    isYearUnit ||
    (cleanUnit === '' &&
      isInteger &&
      ((value >= 1000 && value <= 2150) || (isCalendarYearRange && value >= -4000 && value <= 2150)));

  if (isLikelyYear) {
    return isInteger ? String(Math.round(value)) : String(Number(value.toFixed(2)));
  }

  if (isInteger) {
    const rounded = Math.round(value);
    if (absVal >= 10000 || (cleanUnit !== '' && absVal >= 1000)) {
      return rounded.toLocaleString('en-US');
    }
    return String(rounded);
  }

  const fixed = Number(value.toFixed(2));
  return String(fixed);
}

/**
 * Defense-in-depth sanitizer ensuring 3D MSDF facet/codex/gauntlet labels NEVER display commas in 4-digit years.
 */
export function sanitize3DYearCommas(text: string): string {
  if (!text || !text.includes(',')) return text;
  const trimmed = text.trim();
  if (STANDALONE_YEAR_COMMA_RE.test(trimmed)) {
    return trimmed.replace(STANDALONE_YEAR_COMMA_RE, '$1$2');
  }
  return text
    .replace(DATE_COMMA_CONTEXT_RE, '$1 $2$3')
    .replace(DATE_COMMA_ERA_RE, '$1$2$3')
    .replace(DATE_COMMA_RANGE_RE, '$1$2$3$4$5')
    .replace(DATE_COMMA_PAREN_RE, '($1$2$3)');
}

function normalizeAngleSigned(rad: number): number {
  let a = ((rad + Math.PI) % (Math.PI * 2));
  if (a < 0) a += Math.PI * 2;
  return a - Math.PI;
}

export const GLOBE_SURFACE_RADIUS = 0.55;
export const EARTH_MEAN_RADIUS_KM = 6371.0088;
const GLOBE_MAX_PITCH_RAD = THREE.MathUtils.degToRad(55);
const MAX_VISUAL_PLATE_CACHE = 24;

/**
 * Exact spherical projection aligned 1:1 with `meridian_world_globe.glb`'s `Globe_Sphere` geometry
 * (`lat` in `-90..90`, `lon` in `-180..180`, `+Z` = Prime Meridian Equator `(0, 0)`, `+Y` = North Pole,
 * `+X` = `(0, +90°E)`).
 */
export function latLonToSphereVec(
  latDeg: number,
  lonDeg: number,
  radius = GLOBE_SURFACE_RADIUS,
  out?: THREE.Vector3
): THREE.Vector3 {
  const lat = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(latDeg, -90, 90));
  const lon = THREE.MathUtils.degToRad(lonDeg);
  const cosLat = Math.cos(lat);
  const v = out ?? new THREE.Vector3();
  return v.set(
    cosLat * Math.sin(lon) * radius,
    Math.sin(lat) * radius,
    cosLat * Math.cos(lon) * radius
  );
}

/**
 * Exact inverse spherical projection from a `Globe_Spin_Pivot`-local surface vector back to
 * WGS84 degrees (`lat` in `-90..90`, `lon` in `-180..180`). Round-trip error `< 1e-12°`.
 */
export function sphereVecToLatLon(localPoint: THREE.Vector3): { lat: number; lon: number } {
  const len = localPoint.length();
  if (len < 1e-8) {
    return { lat: 0, lon: 0 };
  }
  const ny = THREE.MathUtils.clamp(localPoint.y / len, -1, 1);
  const lat = THREE.MathUtils.radToDeg(Math.asin(ny));
  const lon = THREE.MathUtils.radToDeg(Math.atan2(localPoint.x, localPoint.z));
  return { lat, lon };
}

/**
 * Great-circle Haversine distance in kilometers (`R = 6,371.0088 km`).
 */
export function computeGreatCircleDistanceKm(
  lat1Deg: number,
  lon1Deg: number,
  lat2Deg: number,
  lon2Deg: number
): number {
  const lat1 = THREE.MathUtils.degToRad(lat1Deg);
  const lat2 = THREE.MathUtils.degToRad(lat2Deg);
  const dLat = lat2 - lat1;
  const dLon = THREE.MathUtils.degToRad(lon2Deg - lon1Deg);
  const sinLat = Math.sin(dLat * 0.5);
  const sinLon = Math.sin(dLon * 0.5);
  const a =
    sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const c = 2 * Math.atan2(Math.sqrt(Math.max(0, a)), Math.sqrt(Math.max(0, 1 - a)));
  return EARTH_MEAN_RADIUS_KM * c;
}

/**
 * Formats a comma-safe Troika 3D Globe Pin-Drop reveal label (`"FENWAY PARK\n142 km · BULLSEYE"`).
 */
export function formatGlobeRevealReadout(
  targetLabel: string,
  distanceKm?: number,
  bullseyeKm = 300,
  goldKm = 1000,
  grazeKm = 2200
): string {
  const cleanLabel = sanitize3DYearCommas(targetLabel || 'TARGET').toUpperCase();
  if (distanceKm === undefined || !Number.isFinite(distanceKm)) {
    return cleanLabel;
  }
  const kmRounded = Math.max(0, Math.round(distanceKm));
  const tier =
    kmRounded <= bullseyeKm
      ? 'BULLSEYE'
      : kmRounded <= goldKm
        ? 'GOLD LOCK'
        : kmRounded <= grazeKm
          ? 'GRAZE'
          : 'MISS';
  const kmText =
    kmRounded >= 1000 ? kmRounded.toLocaleString('en-US') : String(kmRounded);
  return `${cleanLabel}\n${kmText} km · ${tier}`;
}

interface GlobeTactileUniforms {
  uTime: { value: number };
  uModeMix: { value: number };
  uHintBandActive: { value: number };
  uHintLatDeg: { value: number };
  uHintBandHalfDeg: { value: number };
  uRevealActive: { value: number };
  uTargetDir: { value: THREE.Vector3 };
  uBullseyeRad: { value: number };
  uGoldRad: { value: number };
  uGrazeRad: { value: number };
}

/**
 * Analytical WebGL2-safe spherical graticule, Equator/Prime Meridian 24K gold hairlines,
 * Peel Tier 2/3 glowing latitude band, and post-reveal concentric geodesic target rings.
 * Evaluates `(lat, lon)` directly from normalized local sphere coordinates -> 0% UV seam error!
 */
function createGlobeTactileOverlayMaterial(): {
  material: THREE.ShaderMaterial;
  uniforms: GlobeTactileUniforms;
} {
  const uniforms: GlobeTactileUniforms = {
    uTime: { value: 0 },
    uModeMix: { value: 0 },
    uHintBandActive: { value: 0 },
    uHintLatDeg: { value: 0 },
    uHintBandHalfDeg: { value: 14 },
    uRevealActive: { value: 0 },
    uTargetDir: { value: new THREE.Vector3(0, 0, 1) },
    uBullseyeRad: { value: 300 / EARTH_MEAN_RADIUS_KM },
    uGoldRad: { value: 1000 / EARTH_MEAN_RADIUS_KM },
    uGrazeRad: { value: 2200 / EARTH_MEAN_RADIUS_KM },
  };

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    vertexShader: `
      varying vec3 vLocalPos;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;
      void main() {
        vLocalPos = position;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uModeMix;
      uniform float uHintBandActive;
      uniform float uHintLatDeg;
      uniform float uHintBandHalfDeg;
      uniform float uRevealActive;
      uniform vec3 uTargetDir;
      uniform float uBullseyeRad;
      uniform float uGoldRad;
      uniform float uGrazeRad;

      varying vec3 vLocalPos;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;

      void main() {
        if (uModeMix < 0.005) discard;

        vec3 n = normalize(vLocalPos);
        float latRad = asin(clamp(n.y, -1.0, 1.0));
        float latDeg = degrees(latRad);
        float lonDeg = (length(n.xz) > 0.0002) ? degrees(atan(n.x, n.z)) : 0.0;
        float cosLat = max(0.18, cos(latRad));

        // 15-degree analytical lat/lon cartographic graticule (pole-softened)
        float latMod = abs(mod(latDeg + 7.5, 15.0) - 7.5);
        float lonMod = abs(mod(lonDeg + 187.5, 15.0) - 7.5) * cosLat;
        float poleFade = 1.0 - smoothstep(72.0, 84.0, abs(latDeg));
        float latLine = 1.0 - smoothstep(0.14, 0.44, latMod);
        float lonLine = (1.0 - smoothstep(0.14, 0.44, lonMod)) * poleFade;
        float gridMask = max(latLine, lonLine);

        // Luminous 24K gold Equator (0°) & Prime Meridian (0°) hairlines
        float eqLine = 1.0 - smoothstep(0.24, 0.72, abs(latDeg));
        float pmFade = 1.0 - smoothstep(76.0, 86.0, abs(latDeg));
        float pmLine = (1.0 - smoothstep(0.24, 0.72, abs(lonDeg) * cosLat)) * pmFade;
        float primaryMask = max(eqLine, pmLine);

        // Dashed Tropics (±23.44°) & Polar Circles (±66.56°)
        float tropicDist = min(abs(abs(latDeg) - 23.44), abs(abs(latDeg) - 66.56));
        float dash = step(0.45, fract(lonDeg / 6.0));
        float tropicLine = (1.0 - smoothstep(0.16, 0.48, tropicDist)) * dash;

        // Subtle tactile Fresnel atmospheric rim in Pin-Drop mode
        float ndv = clamp(dot(normalize(vWorldNormal), normalize(vViewDir)), 0.0, 1.0);
        float fresnel = pow(max(0.0001, 1.0 - ndv), 2.8);

        vec3 col = vec3(0.0);
        float alpha = 0.0;

        vec3 cyanGrid = vec3(0.32, 0.82, 1.0);
        vec3 goldLine = vec3(1.0, 0.87, 0.48);

        col += cyanGrid * (gridMask * 0.16 + fresnel * 0.22);
        alpha = max(alpha, gridMask * 0.20 + fresnel * 0.24);

        col += goldLine * (primaryMask * 0.78 + tropicLine * 0.28);
        alpha = max(alpha, primaryMask * 0.64 + tropicLine * 0.24);

        // Peel Tier 2 / Tier 3 glowing latitude band around targetLat
        if (uHintBandActive > 0.01) {
          float dLat = abs(latDeg - uHintLatDeg);
          float halfW = max(2.5, uHintBandHalfDeg);
          float inside = 1.0 - smoothstep(halfW - 1.4, halfW + 0.6, dLat);
          float edgeArg = (dLat - halfW) / 0.85;
          float edge = exp(-(edgeArg * edgeArg));
          float scan = 0.76 + 0.24 * sin(radians(lonDeg * 3.0) - uTime * 2.8);
          vec3 bandCol = mix(vec3(0.30, 0.86, 1.0), vec3(1.0, 0.85, 0.42), clamp(uHintBandActive - 0.35, 0.0, 1.0));
          float bandStrength = (inside * 0.26 + edge * 0.78) * scan * uHintBandActive;
          col += bandCol * bandStrength;
          alpha = max(alpha, clamp(bandStrength * 0.85, 0.0, 0.82));
        }

        // Post-Reveal concentric geodesic Bullseye & Gold Lock radar rings
        if (uRevealActive > 0.01) {
          vec3 tDir = normalize(uTargetDir);
          float ang = acos(clamp(dot(n, tDir), -1.0, 1.0));
          float pulse = 0.82 + 0.18 * sin(uTime * 4.2);
          float bullArg = (ang - uBullseyeRad) / 0.0085;
          float bullRing = exp(-(bullArg * bullArg));
          float bullFill = (1.0 - smoothstep(0.0, max(0.002, uBullseyeRad), ang)) * 0.22;
          float goldArg = (ang - uGoldRad) / 0.0095;
          float goldRing = exp(-(goldArg * goldArg));
          float grazeArg = (ang - uGrazeRad) / 0.011;
          float grazeRing = exp(-(grazeArg * grazeArg));

          vec3 emerald = vec3(0.24, 0.96, 0.66);
          col += emerald * (bullRing * 0.92 + bullFill) * pulse * uRevealActive;
          col += goldLine * (goldRing * 0.68 + grazeRing * 0.30) * uRevealActive;
          alpha = max(alpha, clamp((bullRing * 0.85 + bullFill + goldRing * 0.58 + grazeRing * 0.26) * uRevealActive, 0.0, 0.88));
        }

        gl_FragColor = vec4(col, clamp(alpha * uModeMix, 0.0, 0.92));
      }
    `,
  });

  return { material, uniforms };
}

/**
 * Fallback procedural equirectangular landmass silhouette texture (`flipY = false`, aligned 1:1
 * with `u = (lon + 180) / 360`, `v = (90 - lat) / 180`) used only if `meridian_world_globe.glb`
 * fails to load.
 */
function createProceduralGlobeEarthTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Deep midnight sapphire ocean
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#07142e');
  grad.addColorStop(0.5, '#091c3e');
  grad.addColorStop(1, '#07142e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const toXY = (lat: number, lon: number): [number, number] => [
    ((lon + 180) / 360) * w,
    ((90 - lat) / 180) * h,
  ];

  const drawPoly = (coords: Array<[number, number]>) => {
    if (coords.length < 3) return;
    ctx.beginPath();
    coords.forEach(([lat, lon], idx) => {
      const [px, py] = toXY(lat, lon);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  // Accurate simplified WGS84 continental silhouettes ([lat, lon])
  ctx.fillStyle = '#cca24c';
  ctx.strokeStyle = '#f2d382';
  ctx.lineWidth = 2;

  // North America
  drawPoly([
    [70, -162], [71, -135], [68, -95], [60, -64], [47, -53], [42, -70],
    [35, -75], [25, -80], [29, -90], [20, -87], [15, -84], [8, -78],
    [16, -98], [23, -106], [32, -117], [40, -124], [49, -125], [60, -145],
    [60, -165],
  ]);
  // Greenland & Iceland
  drawPoly([[82, -35], [76, -18], [60, -44], [68, -54], [78, -68]]);
  drawPoly([[66, -24], [66, -14], [63.5, -14], [63.5, -23]]);
  // South America
  drawPoly([
    [11, -74], [10, -62], [0, -50], [-6, -35], [-23, -43], [-35, -54],
    [-55, -67], [-46, -75], [-18, -71], [-5, -81], [7, -78],
  ]);
  // Europe + UK
  drawPoly([
    [36, -9], [43, -9], [48, -5], [51, 2], [54, 9], [60, 5], [70, 20],
    [70, 40], [55, 40], [45, 38], [41, 29], [37, 23], [40, 18], [44, 12],
    [43, 5], [36, -5],
  ]);
  drawPoly([[58.5, -6], [58.5, -2], [51, 1.5], [50, -5.5]]);
  // Africa + Madagascar
  drawPoly([
    [35, -6], [37, 10], [31, 32], [12, 44], [11, 51], [-1, 41], [-26, 33],
    [-34, 20], [-20, 13], [4, 9], [5, -8], [15, -17], [28, -13],
  ]);
  drawPoly([[-12, 49], [-25, 47], [-25, 44], [-15, 46]]);
  // Asia + Japan + SE Asia
  drawPoly([
    [70, 40], [74, 105], [68, 170], [60, 165], [44, 136], [38, 128],
    [31, 122], [22, 114], [10, 106], [1, 104], [16, 97], [22, 88],
    [8, 77], [23, 68], [25, 57], [13, 45], [31, 35], [41, 29], [55, 40],
  ]);
  drawPoly([[44, 145], [40, 141], [35, 140], [31, 131], [34, 130], [39, 139]]);
  drawPoly([[-6, 106], [-8, 115], [-2, 117], [5, 118], [0, 109]]);
  // Australia & New Zealand
  drawPoly([
    [-12, 131], [-12, 142], [-25, 153], [-38, 148], [-35, 135], [-34, 115],
    [-21, 114],
  ]);
  drawPoly([[-35, 173], [-41, 175], [-46, 167], [-41, 171]]);
  // Antarctica
  drawPoly([[-68, -180], [-72, -90], [-66, 0], [-70, 90], [-72, 180], [-90, 180], [-90, -180]]);

  // Equator & Prime Meridian gold hairlines
  ctx.strokeStyle = 'rgba(255, 224, 132, 0.72)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.lineTo(w, h * 0.5);
  ctx.moveTo(w * 0.5, 0);
  ctx.lineTo(w * 0.5, h);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds a sphere BufferGeometry whose exact vertex positions & UVs match `meridian_world_globe.glb`
 * (`x = R cos(lat) sin(lon)`, `y = R sin(lat)`, `z = R cos(lat) cos(lon)`,
 * `u = (lon + 180) / 360`, `v = (90 - lat) / 180`).
 */
function createAlignedGlobeSphereGeometry(
  radius: number,
  lonSegments = 64,
  latSegments = 32
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iy = 0; iy <= latSegments; iy++) {
    const v = iy / latSegments; // 0 = North Pole (+90°), 1 = South Pole (-90°)
    const latDeg = 90 - v * 180;
    const latRad = THREE.MathUtils.degToRad(latDeg);
    const cosLat = Math.cos(latRad);
    const sinLat = Math.sin(latRad);

    for (let ix = 0; ix <= lonSegments; ix++) {
      const u = ix / lonSegments; // 0 = -180°, 0.5 = 0° (+Z), 1 = +180°
      const lonDeg = u * 360 - 180;
      const lonRad = THREE.MathUtils.degToRad(lonDeg);
      const nx = cosLat * Math.sin(lonRad);
      const ny = sinLat;
      const nz = cosLat * Math.cos(lonRad);

      positions.push(nx * radius, ny * radius, nz * radius);
      normals.push(nx, ny, nz);
      uvs.push(u, v);
    }
  }

  const stride = lonSegments + 1;
  for (let iy = 0; iy < latSegments; iy++) {
    for (let ix = 0; ix < lonSegments; ix++) {
      const a = iy * stride + ix;
      const b = a + 1;
      const c = (iy + 1) * stride + ix;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

/**
 * Principal 3D Hardware Rig for World's Smartest:
 * Drives `veritas_prism.glb` ("Spin. Peel. Overclock."), `codex_cryptex.glb`,
 * `calibrator_chronometer.glb`, `GAUNTLET_SHATTER` crystal plates, `meridian_world_globe.glb` v2,
 * `championship_trophy.glb`, and all 8 bespoke Campaign Hero Relics.
 */
export class VeritasPrismRig {
  public readonly root = new THREE.Group();
  public callbacks: PrismRigCallbacks = {};

  private readonly venueLoader: VenueArenaLoader;
  private readonly baseUrl: string;

  // Grounding & Sightline Beam
  private readonly contactShadow: THREE.Mesh;
  private readonly sightlineBeam: THREE.Mesh;
  private readonly sightlineBeamMat: THREE.ShaderMaterial;
  private readonly sightlineFloorRing: THREE.Mesh;

  // Sub-roots per physical morph
  private readonly prismGroup = new THREE.Group();
  private readonly codexGroup = new THREE.Group();
  private readonly calibratorGroup = new THREE.Group();
  private readonly gauntletGroup = new THREE.Group();
  private readonly relicGroup = new THREE.Group();
  private readonly globeGroup = new THREE.Group();
  private readonly trophyGroup = new THREE.Group();
  private readonly orbGroup = new THREE.Group();
  private readonly passportGroup = new THREE.Group();
  private readonly vfxGroup = new THREE.Group();

  private activeArchetype: PrismArchetype = 'SIGHTLINE_LOCK';
  private activePalette: DomainShaderPalette = getDomainPalette(0);
  private equippedSkin: PrismAtelierSkinSpec = PRISM_ATELIER_SKINS.SOVEREIGN_OBSIDIAN;
  private morphTransitionScale = 1.0;

  // === 1. VERITAS PRISM (`veritas_prism.glb`) STATE ===
  private prismLoaded = false;
  private prismFloatBody = new THREE.Group();
  private prismPrimaryMetalMats: THREE.MeshStandardMaterial[] = [];
  private prismSecondaryMetalMats: THREE.MeshStandardMaterial[] = [];
  private prismShutterMats: THREE.MeshStandardMaterial[] = [];
  private readonly glyphTexLoader = new THREE.TextureLoader();
  private readonly glyphTexCache = new Map<string, Promise<THREE.Texture | null>>();
  private readonly visualPlateTexCache = new Map<string, THREE.Texture>();
  private readonly visualPlatePending = new Map<string, Promise<THREE.Texture | null>>();
  private visualPlateLoadToken = 0;
  private visualPlateGroup: THREE.Group | null = null;
  private visualPlateBackingMesh: THREE.Mesh | null = null;
  private visualPlateFrameMesh: THREE.Mesh | null = null;
  private visualPlateScreenMesh: THREE.Mesh | null = null;
  private visualPlateScreenMat: THREE.MeshBasicMaterial | null = null;
  private visualPlateCaptionText: TroikaTextMesh | null = null;
  private visualPlateAspect: 'SQUARE' | 'WIDE' = 'WIDE';
  private visualPlateActiveUrl: string | null = null;
  private visualPlateRevealAnim = 0;
  private facetCarousel: THREE.Object3D | null = null;
  private gimbalOuter: THREE.Object3D | null = null;
  private gimbalEquatorial: THREE.Object3D | null = null;
  private brassCrown: THREE.Object3D | null = null;
  private brassCrownBaseY = 0.855;
  private crownHitbox: THREE.Mesh | null = null;
  private firingPin: THREE.Object3D | null = null;
  private firingPinBaseY = 0.5;
  private hologramCoreAnchor: THREE.Object3D | null = null;
  private activeHologramGlyph: THREE.Group | null = null;
  private corePointLight: THREE.PointLight;

  private facets: FacetEntry[] = [];
  private shutters: ShutterEntry[] = [];
  private jaws: JawEntry[] = [];

  private carouselYaw = 0;
  private targetCarouselYaw = 0;
  private carouselVel = 0;
  private isDraggingCarousel = false;
  private selectedFacetIndex = 0;
  private lastDetentSector = 0;

  private peelTier: 1 | 2 | 3 = 1;
  private shutterOpenAnim = 0;
  private targetShutterOpen = 0;
  private crownPullOffset = 0;
  private targetCrownPullOffset = 0;
  private blueprintExpandAnim = 0;
  private targetBlueprintExpand = 0;

  private overclockActive = false;
  private overclockCharge = 0;
  private targetOverclockCharge = 0;
  private firingPinSlamAnim = 0;

  // === 2. CODEX DUAL RING (`codex_cryptex.glb`) STATE ===
  private codexLoaded = false;
  private codexTopRing: THREE.Object3D | null = null;
  private codexMidRing: THREE.Object3D | null = null;
  private codexBottomRing: THREE.Object3D | null = null;
  private codexTopTexts: TroikaTextMesh[] = [];
  private codexBottomTexts: TroikaTextMesh[] = [];
  private codexConduitBeams: THREE.Mesh[] = [];
  private codexTopHitbox: THREE.Mesh | null = null;
  private codexBottomHitbox: THREE.Mesh | null = null;
  private codexTopIndex = 0;
  private codexBottomIndex = 0;
  private codexTopYaw = 0;
  private codexTargetTopYaw = 0;
  private codexBottomYaw = 0;
  private codexTargetBottomYaw = 0;

  // === 3. CALIBRATOR DIAL (`calibrator_chronometer.glb`) STATE ===
  private calibratorLoaded = false;
  private calibratorBezel: THREE.Object3D | null = null;
  private calibratorNeedle: THREE.Object3D | null = null;
  private calibratorSectorMesh: THREE.Mesh | null = null;
  private calibratorReadoutText: TroikaTextMesh | null = null;
  private calibratorMinText: TroikaTextMesh | null = null;
  private calibratorMaxText: TroikaTextMesh | null = null;
  private calibratorTruthPin: THREE.Group | null = null;
  private calibratorHitbox: THREE.Mesh | null = null;
  private calMin = 1800;
  private calMax = 2000;
  private calStep = 1;
  private calUnit = '';
  private calValue = 1900;
  private calToleranceFrac = 0.1;
  private calMultLabel = '2.5x';
  private calNeedleAngle = 0;
  private calTargetNeedleAngle = 0;

  // === 4. GAUNTLET SHATTER STATE ===
  private gauntletPlateHolder = new THREE.Group();
  private gauntletPlateCrystal: CrystalFacetMaterialHandle | null = null;
  private gauntletStatementText: TroikaTextMesh | null = null;
  private gauntletHintText: TroikaTextMesh | null = null;
  private gauntletHitbox: THREE.Mesh | null = null;
  private gauntletDropY = 0;

  // === 5. HERO RELIC, GLOBE v2 & TROPHY STATE ===
  private currentRelicId: HeroRelicKey | null = null;
  private relicSpinHolder = new THREE.Group();
  private relicLatchNodes: Array<{
    node: THREE.Object3D;
    basePos: THREE.Vector3;
    baseQuat: THREE.Quaternion;
  }> = [];
  private relicLatchOpenCount = 0;
  private relicLatchAnim = [0, 0, 0];
  private freeInspectYaw = 0;
  private freeInspectVel = 0;
  private isDraggingInspect = false;
  private titleShowcaseOrbit = false;

  private globeLoaded = false;
  private globeAxisTiltNode: THREE.Object3D | null = null;
  private globeAxisBaseZ = -0.409;
  private globeSpinPivot: THREE.Object3D | null = null;
  private globeSphereMesh: THREE.Mesh | null = null;
  private globeFallbackEarthTex: THREE.CanvasTexture | null = null;
  private globeTactileOverlayMesh: THREE.Mesh | null = null;
  private globeTactileUniforms: GlobeTactileUniforms | null = null;
  private globePins = new Map<VenueCode, THREE.Mesh>();
  private globeCityTexts: TroikaTextMesh[] = [];
  private globeArcsGroup = new THREE.Group();
  private globeHitSphere: THREE.Mesh | null = null;
  private globeYaw = -THREE.MathUtils.degToRad(6.14);
  private globeTargetYaw = -THREE.MathUtils.degToRad(6.14);
  private globeYawVel = 0;
  private globePitch = 0;
  private globeTargetPitch = 0;
  private globePitchVel = 0;
  private isDraggingGlobe = false;
  private focusedGlobeVenue: VenueCode = 'ch';
  private globePinDropMode = false;
  private globePinDropSpec: GlobePinDropVisualSpec | null = null;
  private globeCandidateGroup: THREE.Group | null = null;
  private globeCandidatePulseRing: THREE.Mesh | null = null;
  private globeCandidateCoords: { lat: number; lon: number } | null = null;
  private globeTargetGroup: THREE.Group | null = null;
  private globeTargetPulseRing: THREE.Mesh | null = null;
  private globeRevealArcGroup = new THREE.Group();
  private globeRevealArcMesh: THREE.Mesh | null = null;
  private globeRevealArcTotalIndices = 0;
  private globeRevealArcAnim = 0;
  private globeRevealReadout: TroikaTextMesh | null = null;
  private readonly globeRevealReadoutOutward = new THREE.Vector3(0, 0, 1);
  private readonly _axisY = new THREE.Vector3(0, 1, 0);

  private trophyLoaded = false;
  private trophyCrown: THREE.Object3D | null = null;
  private trophyRingOuter: THREE.Object3D | null = null;
  private trophyRingInner: THREE.Object3D | null = null;
  private trophyStarCore: THREE.Object3D | null = null;

  private orbLoaded = false;
  private orbRingOuter: THREE.Object3D | null = null;
  private orbRingMid: THREE.Object3D | null = null;
  private orbRingInner: THREE.Object3D | null = null;
  private orbCrystalCore: THREE.Object3D | null = null;

  private passportLoaded = false;
  private passportCoverNode: THREE.Object3D | null = null;
  private passportInnerCharterText: TroikaTextMesh | null = null;
  private passportCoverTargetOpen = 0;
  private passportCoverAnim = 0;

  // === 3D CRYSTAL SHARD & PARTICLE POOL + ZERO-ALLOCATION SCRATCH MATH (#158) ===
  private readonly shardGeometry: THREE.BufferGeometry;
  private readonly activeShards: ActiveShard[] = [];
  private readonly activeBursts: BurstParticleSet[] = [];
  private readonly _axisX = new THREE.Vector3(1, 0, 0);
  private readonly _axisZ = new THREE.Vector3(0, 0, 1);
  private readonly _qTmpA = new THREE.Quaternion();
  private readonly _qTmpB = new THREE.Quaternion();
  private readonly _vTmpA = new THREE.Vector3();
  private readonly _vTmpB = new THREE.Vector3();
  private readonly _vTmpC = new THREE.Vector3();
  private readonly _eulerTmp = new THREE.Euler();
  private readonly _colorTmp = new THREE.Color();
  private elapsed = 0;

  constructor(venueLoader: VenueArenaLoader, baseUrl = '/') {
    this.venueLoader = venueLoader;
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    // Positioned directly on the Hero Stage Surface (Y = 0.78m across all venues)
    this.root.name = 'VeritasPrismRigRoot';
    this.root.position.set(0, VenueArenaLoader.HERO_STAGE_SURFACE_Y, 0);

    // Dual-ring Horological Ambient-Occlusion Contact Shadow on marble plinth/table (#171 §3.2)
    this.contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.06, 1.06),
      new THREE.MeshBasicMaterial({
        map: getContactShadowTexture(),
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
      })
    );
    this.contactShadow.rotation.x = -Math.PI * 0.5;
    this.contactShadow.position.set(0, 0.006, 0);
    this.root.add(this.contactShadow);

    const innerUmbraShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.62),
      new THREE.MeshBasicMaterial({
        map: getContactShadowTexture(),
        transparent: true,
        opacity: 0.66,
        depthWrite: false,
      })
    );
    innerUmbraShadow.rotation.x = -Math.PI * 0.5;
    innerUmbraShadow.position.set(0, 0.009, 0);
    this.root.add(innerUmbraShadow);

    // Forward-pointing Gold Volumetric Sightline Beam cone (+Z)
    this.sightlineBeamMat = createVolumetricBeamMaterial(0xffd875, 0.11);
    const beamConeGeo = new THREE.CylinderGeometry(0.11, 0.26, 0.68, 32, 1, true);
    beamConeGeo.rotateX(Math.PI * 0.5);
    this.sightlineBeam = new THREE.Mesh(beamConeGeo, this.sightlineBeamMat);
    this.sightlineBeam.position.set(0, 0.48, 0.62);
    this.sightlineBeam.renderOrder = 3;
    this.root.add(this.sightlineBeam);

    // Crisp gold Sightline alignment ring on plinth (4mm above contactShadow -> zero z-fighting!)
    this.sightlineFloorRing = new THREE.Mesh(
      new THREE.RingGeometry(0.36, 0.374, 64),
      new THREE.MeshBasicMaterial({
        color: 0xdcb45c,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    this.sightlineFloorRing.rotation.x = -Math.PI * 0.5;
    this.sightlineFloorRing.position.set(0, 0.012, 0);
    this.root.add(this.sightlineFloorRing);

    this.corePointLight = new THREE.PointLight(0xffd97d, 0.35, 1.9, 1.5);
    this.corePointLight.position.set(0, 0.5, 0);
    this.prismFloatBody.add(this.corePointLight);

    this.relicGroup.add(this.relicSpinHolder);

    this.root.add(
      this.prismGroup,
      this.codexGroup,
      this.calibratorGroup,
      this.gauntletGroup,
      this.relicGroup,
      this.globeGroup,
      this.trophyGroup,
      this.orbGroup,
      this.passportGroup,
      this.vfxGroup
    );

    // Reusable jewel-cut crystal shard geometry (#203 §2.1: fine 0.014m..0.022m horological shards — zero chunky confetti!)
    this.shardGeometry = new THREE.OctahedronGeometry(0.011, 0);
    this.shardGeometry.scale(1.25, 0.76, 0.42);

    this.buildGauntletRig();
    this.updateMorphVisibility('SIGHTLINE_LOCK');
  }

  /**
   * Preloads the primary `veritas_prism.glb` + core morph hardware so transitions are instantaneous.
   */
  public async preloadCoreRig(): Promise<void> {
    await this.ensureVeritasPrismLoaded();
  }

  public getArchetype(): PrismArchetype {
    return this.activeArchetype;
  }

  public getSelectedFacetIndex(): number {
    return this.selectedFacetIndex;
  }

  public getPeelTier(): 1 | 2 | 3 {
    return this.peelTier;
  }

  /**
   * Unified Morph Controller (`PITCH_BIBLE.md` §3.2 & #111).
   */
  public async setMorph<K extends PrismArchetype>(
    archetype: K,
    spec: MorphSpecMap[K]
  ): Promise<void> {
    const switching = this.activeArchetype !== archetype;
    this.activeArchetype = archetype;
    this.updateMorphVisibility(archetype);

    if (switching) {
      this.morphTransitionScale = 0.88;
    }

    if (archetype !== 'SIGHTLINE_LOCK') {
      this.clearVisualBlueprintPlate();
    }
    if (archetype !== 'WORLD_GLOBE') {
      this.globePinDropMode = false;
    }

    switch (archetype) {
      case 'SIGHTLINE_LOCK':
        await this.configureSightlineLock(spec as SightlineLockSpec);
        break;
      case 'CODEX_DUAL_RING':
        await this.configureCodexDualRing(spec as CodexDualRingSpec);
        break;
      case 'CALIBRATOR_DIAL':
        await this.configureCalibratorDial(spec as CalibratorDialSpec);
        break;
      case 'GAUNTLET_SHATTER':
        this.configureGauntletShatter(spec as GauntletShatterSpec);
        break;
      case 'HERO_ARTIFACT_SYNTHESIS': {
        const hSpec = spec as HeroArtifactSpec;
        if (hSpec.options && hSpec.options.length > 0) {
          // Chained Boss Synthesis step: 4-facet Veritas Prism orbiting the glowing 3D Hero Relic core!
          // #190 [P1]: Keep peelTier = 1 (matching 2D HUD 3.0x start) while parting shutters slightly around Relic!
          this.activeArchetype = 'SIGHTLINE_LOCK';
          this.updateMorphVisibility('SIGHTLINE_LOCK');
          await this.configureSightlineLock({
            options: hSpec.options,
            domainId: hSpec.domainId,
            glyphId: hSpec.glyphId,
            initialIndex: hSpec.initialIndex,
            peelTier: hSpec.peelTier ?? 1,
            eliminatedIndices: hSpec.eliminatedIndices,
            stressFractureIndices: hSpec.stressFractureIndices,
            peopleHeatmapWeights: hSpec.peopleHeatmapWeights,
          });
          await this.mountMiniatureRelicInCore(hSpec.relicId);
          if (hSpec.openLatchCount !== undefined) {
            this.actuateRelicLatches(hSpec.openLatchCount);
          }
        } else {
          await this.configureHeroArtifact(hSpec);
        }
        break;
      }
      case 'WORLD_GLOBE':
        await this.configureWorldGlobe(spec as WorldGlobeSpec);
        break;
      case 'CHAMPIONSHIP_TROPHY':
        await this.configureTrophy((spec as { domainId?: number })?.domainId ?? 0);
        break;
      case 'IDLE_ORB':
        await this.configureIdleOrb((spec as { domainId?: number })?.domainId ?? 0);
        break;
      case 'DIPLOMATIC_PASSPORT':
        await this.configureDiplomaticPassport((spec as { openCover?: boolean })?.openCover ?? true);
        break;
    }
  }

  private updateMorphVisibility(archetype: PrismArchetype): void {
    this.prismGroup.visible = archetype === 'SIGHTLINE_LOCK';
    this.codexGroup.visible = archetype === 'CODEX_DUAL_RING';
    this.calibratorGroup.visible = archetype === 'CALIBRATOR_DIAL';
    this.gauntletGroup.visible = archetype === 'GAUNTLET_SHATTER';
    this.relicGroup.visible = archetype === 'HERO_ARTIFACT_SYNTHESIS';
    this.globeGroup.visible = archetype === 'WORLD_GLOBE';
    this.trophyGroup.visible = archetype === 'CHAMPIONSHIP_TROPHY';
    this.orbGroup.visible = archetype === 'IDLE_ORB';
    this.passportGroup.visible = archetype === 'DIPLOMATIC_PASSPORT';

    this.sightlineBeam.visible =
      archetype === 'SIGHTLINE_LOCK' || archetype === 'CODEX_DUAL_RING';
    this.sightlineFloorRing.visible = archetype !== 'WORLD_GLOBE';
  }

  public registerRelicGlb(relicId: HeroRelicKey, relativeGlbPath: string): void {
    RELIC_GLB_PATHS[relicId] = relativeGlbPath;
  }

  /**
   * Equips any of the 6 Prestige Veritas Prism Cosmetic Finishes (#127/#136 Prism Atelier).
   * Accepts skin ID strings, `PrismAtelierSkinSpec`, OR `PrismMaterialFinishSpec` from `src/meta`.
   */
  public equipPrismSkin(
    skinIdOrSpec:
      | PrismAtelierSkinId
      | string
      | (Partial<PrismAtelierSkinSpec> & {
          primaryMetalHex?: number;
          crystalColorHex?: number;
          sightlineBeamHex?: number;
        })
  ): void {
    if (typeof skinIdOrSpec === 'string') {
      const upper = skinIdOrSpec.toUpperCase();
      const aliasMap: Record<string, PrismAtelierSkinId> = {
        SOVEREIGN_OBSIDIAN_24K: 'SOVEREIGN_OBSIDIAN',
        OBSIDIAN_BRASS: 'SOVEREIGN_OBSIDIAN',
        DAMASCUS_STEEL_AMBER: 'DAMASCUS_STEEL',
        DAMASCUS_TITANIUM: 'DAMASCUS_STEEL',
        KYOTO_URUSHI_KINTSUGI: 'KYOTO_KINTSUGI',
        IMPERIAL_EMERALD_BRASS: 'IMPERIAL_EMERALD',
        EMERALD_SOVEREIGN: 'IMPERIAL_EMERALD',
        PHARAONIC_LAPIS_ELECTRUM: 'PHARAONIC_LAPIS',
        AURORA_DICHROIC_TITANIUM: 'AURORA_DICHROIC',
      };
      const resolvedKey = (aliasMap[upper] ?? upper) as PrismAtelierSkinId;
      this.equippedSkin =
        PRISM_ATELIER_SKINS[resolvedKey] ?? PRISM_ATELIER_SKINS.SOVEREIGN_OBSIDIAN;
    } else {
      this.equippedSkin = {
        ...PRISM_ATELIER_SKINS.SOVEREIGN_OBSIDIAN,
        ...skinIdOrSpec,
        metalHex:
          skinIdOrSpec.metalHex ??
          skinIdOrSpec.primaryMetalHex ??
          PRISM_ATELIER_SKINS.SOVEREIGN_OBSIDIAN.metalHex,
        crystalHex:
          skinIdOrSpec.crystalHex ??
          skinIdOrSpec.crystalColorHex ??
          PRISM_ATELIER_SKINS.SOVEREIGN_OBSIDIAN.crystalHex,
        accentHex:
          skinIdOrSpec.accentHex ?? skinIdOrSpec.sightlineBeamHex,
        useDomainAccent:
          skinIdOrSpec.useDomainAccent ??
          (skinIdOrSpec.id === 'SOVEREIGN_OBSIDIAN_24K' || skinIdOrSpec.id === 'SOVEREIGN_OBSIDIAN'),
      };
    }
    this.applyPrismSkinToMaterials();
  }

  private applyPrismSkinToMaterials(): void {
    const sk = this.equippedSkin;
    for (const m of this.prismPrimaryMetalMats) {
      m.color.setHex(sk.metalHex);
      m.roughness = sk.metalRoughness;
    }
    for (const m of this.prismSecondaryMetalMats) {
      m.color.setHex(sk.secondaryMetalHex);
      m.roughness = Math.min(0.42, sk.metalRoughness + 0.04);
    }
    for (const m of this.prismShutterMats) {
      m.color.setHex(sk.shutterHex);
    }

    const accentHex =
      sk.useDomainAccent !== false || !sk.accentHex
        ? this.activePalette.accentHex
        : sk.accentHex;
    const crystalHex =
      sk.useDomainAccent !== false
        ? this.activePalette.crystalColorHex
        : sk.crystalHex;

    for (const f of this.facets) {
      f.crystalHandle.material.color.setHex(crystalHex);
      f.crystalHandle.material.attenuationColor
        .setHex(0x0b1c3d)
        .lerp(this._colorTmp.setHex(this.activePalette.attenuationHex), 0.52);
      f.crystalHandle.material.iridescence = Math.max(
        0.2,
        this.activePalette.iridescence,
        sk.iridescence
      );
      f.crystalHandle.uniforms.uDomainAccent.value.setHex(accentHex);
    }
    this.sightlineBeamMat.uniforms.uColor.value.setHex(accentHex);
    if (this.sightlineFloorRing.material instanceof THREE.MeshBasicMaterial) {
      this.sightlineFloorRing.material.color.setHex(accentHex);
    }
  }

  // ============================================================================
  // 1. SIGHTLINE_LOCK — `veritas_prism.glb` ("Spin. Peel. Overclock.")
  // ============================================================================

  private async ensureVeritasPrismLoaded(): Promise<void> {
    if (this.prismLoaded) {
      return;
    }

    let glbTemplate = await this.venueLoader.loadGlbTemplate(
      'assets/aaa_models/veritas_prism.glb'
    );
    let usingFallbackOrb = false;
    if (!glbTemplate) {
      glbTemplate = await this.venueLoader.loadGlbTemplate(
        'assets/aaa_models/veritas_astrolabe_orb.glb'
      );
      usingFallbackOrb = true;
    }
    if (this.prismLoaded) {
      return;
    }
    this.prismLoaded = true;

    this.prismGroup.add(this.prismFloatBody);

    if (glbTemplate && !usingFallbackOrb) {
      const inst = glbTemplate.clone(true);
      const clonedMatMap = new Map<THREE.Material, THREE.Material>();
      inst.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          // #255/#273 (<120 draw calls): dual-ring contactShadow grounds Prism; only Pedestal casts dynamic shadow
          obj.castShadow = obj.name.includes('Pedestal');
          obj.receiveShadow = true;
          const remap = (orig: THREE.Material): THREE.Material => {
            if (!(orig instanceof THREE.MeshStandardMaterial)) return orig;
            let cloned = clonedMatMap.get(orig) as THREE.MeshStandardMaterial | undefined;
            if (!cloned) {
              // #171 §3.2 Horological PBR Upgrade: 24K Brass (metalness=0.96, roughness=0.19, clearcoat=0.35),
              // Obsidian Shutters (clearcoat=0.68), and Nero Marquina Pedestal Stone (clearcoat=0.65)
              if (
                orig.name === 'Mat_Brushed_Gold' ||
                orig.name === 'Mat_Liquid_Gold_24K'
              ) {
                cloned = upgradeToHorologicalPhysicalMaterial(orig, 'METAL', 0.94, 0.48);
                this.prismPrimaryMetalMats.push(cloned);
              } else if (
                orig.name === 'Mat_Antique_Brass' ||
                orig.name === 'Mat_Rose_Gold' ||
                orig.name === 'Mat_Gunmetal_Steel'
              ) {
                cloned = upgradeToHorologicalPhysicalMaterial(orig, 'METAL', 0.92, 0.48);
                this.prismSecondaryMetalMats.push(cloned);
              } else if (orig.name === 'Mat_Obsidian_Onyx') {
                cloned = upgradeToHorologicalPhysicalMaterial(orig, 'OBSIDIAN', 0.92, 0.42);
                this.prismShutterMats.push(cloned);
              } else {
                cloned = upgradeToHorologicalPhysicalMaterial(orig, 'AUTO', 0.92, 0.48);
              }
              clonedMatMap.set(orig, cloned);
            }
            return cloned;
          };
          if (Array.isArray(obj.material)) {
            obj.material = obj.material.map(remap);
          } else if (obj.material) {
            obj.material = remap(obj.material);
          }
        }
      });

      // Pedestal stays grounded flush on Y = 0 while upper horological assembly levitates gently
      const pedestal = inst.getObjectByName('Prism_Pedestal');
      if (pedestal) {
        inst.remove(pedestal);
        this.prismGroup.add(pedestal);
      }

      this.prismFloatBody.add(inst);

      this.facetCarousel = inst.getObjectByName('Facet_Carousel') ?? null;
      this.gimbalOuter = inst.getObjectByName('Gimbal_Outer') ?? null;
      this.gimbalEquatorial = inst.getObjectByName('Gimbal_Equatorial') ?? null;
      this.brassCrown = inst.getObjectByName('Brass_Crown') ?? null;
      if (this.brassCrown) {
        this.brassCrownBaseY = this.brassCrown.position.y;
      }
      this.firingPin = inst.getObjectByName('Firing_Pin') ?? null;
      if (this.firingPin) {
        this.firingPinBaseY = this.firingPin.position.y;
      }
      this.hologramCoreAnchor = inst.getObjectByName('Hologram_Core') ?? null;

      // Bind Shutters 0..5 with exact base transforms for quaternion-safe radial spiral bloom
      this.shutters = [];
      for (let i = 0; i < 6; i++) {
        const sh = inst.getObjectByName(`Shutter_${i}`);
        if (sh) {
          this.shutters.push({
            node: sh,
            basePos: sh.position.clone(),
            baseQuat: sh.quaternion.clone(),
          });
        }
      }

      // Bind Overclock Clamping Jaws 0..3
      this.jaws = [];
      for (let i = 0; i < 4; i++) {
        const jw = inst.getObjectByName(`Overclock_Jaw_${i}`);
        if (jw) {
          this.jaws.push({
            node: jw,
            basePos: jw.position.clone(),
            baseQuat: jw.quaternion.clone(),
          });
        }
      }

      // Bind sculpted curved Answer Facets 0..3
      this.facets = [];
      for (let i = 0; i < 4; i++) {
        const fNode = inst.getObjectByName(`Facet_${i}`);
        if (fNode) {
          this.facets.push(this.bindPrismFacetNode(fNode, i));
        }
      }
    } else if (glbTemplate && usingFallbackOrb) {
      // Clean fallback to `veritas_astrolabe_orb.glb` + 4 curved sapphire lenses
      const inst = glbTemplate.clone(true);
      const base = inst.getObjectByName('Orb_Base');
      if (base) {
        inst.remove(base);
        this.prismGroup.add(base);
      }
      this.prismFloatBody.add(inst);
      this.gimbalOuter = inst.getObjectByName('Ring_Outer') ?? null;
      this.gimbalEquatorial = inst.getObjectByName('Ring_Mid') ?? null;
      this.hologramCoreAnchor = inst.getObjectByName('Crystal_Core') ?? null;

      for (let i = 0; i < 6; i++) {
        const petal = inst.getObjectByName(`Petal_${i}`);
        if (petal) {
          this.shutters.push({
            node: petal,
            basePos: petal.position.clone(),
            baseQuat: petal.quaternion.clone(),
          });
        }
      }
      for (let i = 0; i < 4; i++) {
        const cal = inst.getObjectByName(`Caliper_${i}`);
        if (cal) {
          this.jaws.push({
            node: cal,
            basePos: cal.position.clone(),
            baseQuat: cal.quaternion.clone(),
          });
        }
      }

      const carousel = new THREE.Group();
      carousel.name = 'Facet_Carousel';
      carousel.position.set(0, 0.46, 0);
      this.prismFloatBody.add(carousel);
      this.facetCarousel = carousel;

      const lensGeo = new THREE.CylinderGeometry(
        0.345,
        0.345,
        0.195,
        24,
        1,
        true,
        -0.56,
        1.12
      );
      for (let i = 0; i < 4; i++) {
        const holder = new THREE.Group();
        const ang = i * Math.PI * 0.5;
        holder.position.set(Math.sin(ang) * 0.34, 0, Math.cos(ang) * 0.34);
        holder.rotation.y = ang;
        const lensMesh = new THREE.Mesh(
          lensGeo,
          new THREE.MeshStandardMaterial({ name: 'Mat_Facet_Crystal' })
        );
        lensMesh.position.set(0, 0, -0.34);
        holder.add(lensMesh);
        carousel.add(holder);
        this.facets.push(this.bindPrismFacetNode(holder, i));
      }
    }

    // Invisible generous touch hitbox around Brass_Crown for effortless downward Peel drag
    const crownHit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.19, 0.24, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    crownHit.position.set(0, this.brassCrownBaseY, 0);
    crownHit.userData = { hitKind: 'CROWN' };
    this.prismFloatBody.add(crownHit);
    this.crownHitbox = crownHit;
  }

  private bindPrismFacetNode(fNode: THREE.Object3D, index: number): FacetEntry {
    const basePos = fNode.position.clone();
    const baseQuat = fNode.quaternion.clone();
    const baseAngle = Math.atan2(basePos.x, basePos.z);

    const crystalHandle = createCrystalFacetMaterial(this.activePalette, 0.105);

    // Replace ONLY `Mat_Facet_Crystal` so 24K gold bevels, ruby/sapphire jewels, & clasps keep native PBR
    fNode.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.renderOrder = 4;
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m) =>
            m?.name === 'Mat_Facet_Crystal' ? crystalHandle.material : m
          );
        } else if (child.material?.name === 'Mat_Facet_Crystal') {
          child.material = crystalHandle.material;
        }
      }
    });

    // Deep smoked obsidian backing veil inside crystal (#132: >= 16:1 luxury horology contrast!)
    const readabilityVeil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.351, 0.351, 0.18, 24, 1, true, -0.5, 1.0),
      new THREE.MeshBasicMaterial({
        color: 0x030711,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    readabilityVeil.position.set(0, 0, -0.34);
    readabilityVeil.renderOrder = 5;
    fNode.add(readabilityVeil);

    // 24K Gold Diamond Letter Emblem (`◆ A`, `◆ B`, `◆ C`, `◆ D`)
    const badgeText = createTroikaMesh();
    badgeText.text = `◆ ${FACET_LETTERS[index] ?? String(index + 1)}`;
    badgeText.fontSize = 0.0175;
    badgeText.fontWeight = 'bold';
    badgeText.letterSpacing = 0.08;
    badgeText.color = 0xffe288;
    badgeText.anchorX = 'center';
    badgeText.anchorY = 'middle';
    badgeText.textAlign = 'center';
    badgeText.curveRadius = -0.356;
    badgeText.glyphGeometryDetail = 2;
    badgeText.outlineWidth = '14%';
    badgeText.outlineColor = 0x02040a;
    badgeText.outlineOpacity = 0.98;
    badgeText.position.set(0, 0.064, 0.017);
    badgeText.sync();
    fNode.add(badgeText);

    // Curved World-Space MSDF Answer Text (`troika-three-text`, #137 P0 #2 calibrated maxWidth=0.285!)
    // #273 Fix #1: Pre-populate default Start Screen labels so cold boot never shows a blank black front facet
    const TITLE_DEFAULTS = ['SPIN', 'PEEL', 'OVERCLOCK', 'VERITAS'];
    const answerText = createTroikaMesh();
    answerText.text = TITLE_DEFAULTS[index] ?? '';
    answerText.fontSize = 0.021;
    answerText.fontWeight = 'bold';
    answerText.lineHeight = 1.18;
    answerText.maxWidth = 0.285;
    answerText.overflowWrap = 'break-word';
    answerText.color = 0xfffef9;
    answerText.anchorX = 'center';
    answerText.anchorY = 'middle';
    answerText.textAlign = 'center';
    answerText.curveRadius = -0.356;
    answerText.glyphGeometryDetail = 3;
    answerText.outlineWidth = '14%';
    answerText.outlineColor = 0x02040a;
    answerText.outlineOpacity = 0.98;
    answerText.position.set(0, -0.012, 0.018);
    answerText.sync();
    fNode.add(answerText);

    // Raycast hitbox per facet for crisp flanking-facet click-to-spin & front-facet tap/hold
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.41, 0.21, 0.08),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.set(0, 0, -0.02);
    hitbox.userData = { hitKind: 'FACET', facetIndex: index };
    fNode.add(hitbox);

    return {
      index,
      baseAngle,
      node: fNode,
      basePos,
      baseQuat,
      hitbox,
      crystalHandle,
      badgeText,
      answerText,
      eliminated: false,
    };
  }

  public async configureSightlineLock(spec: SightlineLockSpec): Promise<void> {
    await this.ensureVeritasPrismLoaded();
    this.setDomainPalette(spec.domainId ?? 0);

    // Reset Peel / Overclock / Facet states cleanly
    this.overclockActive = false;
    this.overclockCharge = 0;
    this.targetOverclockCharge = 0;
    this.firingPinSlamAnim = 0;
    this.peelTier = 1;
    this.targetShutterOpen = 0;
    this.targetCrownPullOffset = 0;
    this.targetBlueprintExpand = 0;

    const opts = spec.options.slice(0, 4);
    while (opts.length < 4) {
      opts.push('—');
    }

    for (let i = 0; i < this.facets.length; i++) {
      const f = this.facets[i];
      const label = sanitize3DYearCommas(opts[i] ?? '');
      f.eliminated = false;
      f.node.visible = true;
      f.node.position.copy(f.basePos);
      f.node.quaternion.copy(f.baseQuat);
      f.node.scale.setScalar(1);

      f.crystalHandle.uniforms.uOverclockCharge.value = 0;
      f.crystalHandle.uniforms.uBackfirePulse.value = 0;
      f.crystalHandle.uniforms.uResonanceFlash.value = 0;
      f.crystalHandle.uniforms.uStressHairline.value =
        spec.stressFractureIndices?.includes(i) ? 1.0 : 0.0;
      f.crystalHandle.uniforms.uPeopleHeatmap.value =
        spec.peopleHeatmapWeights?.[i] ?? 0.0;

      f.badgeText.text = `◆ ${FACET_LETTERS[i]}`;
      f.badgeText.color = 0xffe082;
      f.badgeText.sync();

      // Exact #137 P0 #2 dynamic font size so "International Red Cross" & "Amnesty International" fit inside gold clasps!
      const len = label.length;
      f.answerText.fontSize =
        len <= 16 ? 0.021 : len <= 28 ? 0.0175 : len <= 44 ? 0.015 : 0.013;
      f.answerText.text = label;
      f.answerText.sync();
    }

    if (spec.glyphId) {
      const mapped = GLYPH_HINT_TO_FILE[spec.glyphId] ?? spec.glyphId;
      void this.setHologramGlyphId(mapped, spec.domainId ?? 0);
    }

    // Apply initial selection & optional Peel/Elimination state
    const startIdx = THREE.MathUtils.clamp(spec.initialIndex ?? 0, 0, this.facets.length - 1);
    this.spinToFacet(startIdx, false, true);

    if (spec.eliminatedIndices && spec.eliminatedIndices.length > 0) {
      for (const elimIdx of spec.eliminatedIndices) {
        this.eliminateFacetSilent(elimIdx);
      }
    }
    if (spec.peelTier === 2 || spec.peelTier === 3) {
      this.pullCrownPeel(spec.peelTier, spec.eliminatedIndices, false);
    }

    if (spec.visualPlate?.imageUrl) {
      this.setVisualBlueprintPlate(spec.visualPlate);
    } else {
      this.clearVisualBlueprintPlate();
    }
  }

  public setDomainPalette(domainId: number): void {
    this.activePalette = getDomainPalette(domainId);

    for (const f of this.facets) {
      f.crystalHandle.material.color.setHex(this.activePalette.crystalColorHex);
      f.crystalHandle.material.attenuationColor
        .setHex(0x0b1c3d)
        .lerp(this._colorTmp.setHex(this.activePalette.attenuationHex), 0.52);
      f.crystalHandle.material.roughness = Math.min(0.14, this.activePalette.crystalRoughness);
      f.crystalHandle.material.iridescence = Math.max(0.2, this.activePalette.iridescence);
      f.crystalHandle.material.emissive.setHex(this.activePalette.emissiveHex);
      f.crystalHandle.uniforms.uDomainAccent.value.setHex(this.activePalette.accentHex);
    }

    this.sightlineBeamMat.uniforms.uColor.value.setHex(this.activePalette.accentHex);
    this.corePointLight.color.setHex(this.activePalette.emissiveHex);

    // Swap 3D Holographic Domain Core Glyph inside `Hologram_Core`
    if (this.activeHologramGlyph) {
      if (this.activeHologramGlyph.parent) {
        this.activeHologramGlyph.parent.remove(this.activeHologramGlyph);
      }
      disposeObject3D(this.activeHologramGlyph);
      this.activeHologramGlyph = null;
    }

    const glyph = buildHologramCoreGlyph(domainId);
    glyph.visible = this.peelTier >= 2;
    const parent = this.hologramCoreAnchor ?? this.prismFloatBody;
    if (parent === this.prismFloatBody) {
      glyph.position.set(0, 0.5, 0);
    }
    parent.add(glyph);
    this.activeHologramGlyph = glyph;

    this.applyPrismSkinToMaterials();
  }

  public async setHologramGlyphId(glyphId: string, domainId = 0): Promise<void> {
    const cleanId = glyphId.replace(/\.png$/i, '');
    let cached = this.glyphTexCache.get(cleanId);
    if (!cached) {
      cached = new Promise<THREE.Texture | null>((resolve) => {
        this.glyphTexLoader.load(
          `${this.baseUrl}assets/glyphs/${cleanId}.png`,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            resolve(tex);
          },
          undefined,
          () => resolve(null)
        );
      });
      this.glyphTexCache.set(cleanId, cached);
    }
    const tex = await cached;
    if (!tex) return;

    if (this.activeHologramGlyph) {
      if (this.activeHologramGlyph.parent) {
        this.activeHologramGlyph.parent.remove(this.activeHologramGlyph);
      }
      disposeObject3D(this.activeHologramGlyph);
    }
    const glyph = buildHologramCoreGlyph(domainId, tex);
    glyph.visible = this.peelTier >= 2;
    const parent = this.hologramCoreAnchor ?? this.prismFloatBody;
    if (parent === this.prismFloatBody) {
      glyph.position.set(0, 0.5, 0);
    }
    parent.add(glyph);
    this.activeHologramGlyph = glyph;
  }

  private resolveVisualAssetUrl(url: string): string {
    const trimmed = url.trim();
    if (/^(https?:|data:|blob:)/i.test(trimmed)) {
      return trimmed;
    }
    const stripped = trimmed.replace(/^\.?\//, '');
    return `${this.baseUrl}${stripped}`;
  }

  private buildVisualPlateFrameGeometry(width: number, height: number): THREE.ExtrudeGeometry {
    const hw = width * 0.5;
    const hh = height * 0.5;
    const border = 0.011;
    const ch = 0.022;
    const outer = new THREE.Shape();
    outer.moveTo(-(hw + border) + ch, -(hh + border));
    outer.lineTo(hw + border - ch, -(hh + border));
    outer.lineTo(hw + border, -(hh + border) + ch);
    outer.lineTo(hw + border, hh + border - ch);
    outer.lineTo(hw + border - ch, hh + border);
    outer.lineTo(-(hw + border) + ch, hh + border);
    outer.lineTo(-(hw + border), hh + border - ch);
    outer.lineTo(-(hw + border), -(hh + border) + ch);
    outer.closePath();

    const hole = new THREE.Path();
    const ihw = hw - 0.002;
    const ihh = hh - 0.002;
    const ich = ch * 0.72;
    hole.moveTo(-ihw + ich, -ihh);
    hole.lineTo(ihw - ich, -ihh);
    hole.lineTo(ihw, -ihh + ich);
    hole.lineTo(ihw, ihh - ich);
    hole.lineTo(ihw - ich, ihh);
    hole.lineTo(-ihw + ich, ihh);
    hole.lineTo(-ihw, ihh - ich);
    hole.lineTo(-ihw, -ihh + ich);
    hole.closePath();
    outer.holes.push(hole);

    const geo = new THREE.ExtrudeGeometry(outer, {
      depth: 0.012,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.0025,
      bevelThickness: 0.0025,
    });
    geo.center();
    return geo;
  }

  private ensureVisualPlateRig(): void {
    if (this.visualPlateGroup) return;

    const group = new THREE.Group();
    group.name = 'SapphireVisualBlueprintPlate';
    // Suspended cleanly above the front Sightline answer facet & strictly inside Portrait `12.5..44.5 dvh`
    group.position.set(0, 0.77, 0.25);
    group.rotation.x = 0.08;
    group.visible = false;

    const w = 0.44;
    const h = 0.275;

    // Deep smoked-sapphire backing slab (transmission: 0 -> zero extra render pass!)
    const backing = new THREE.Mesh(
      new THREE.PlaneGeometry(w + 0.018, h + 0.018),
      new THREE.MeshBasicMaterial({
        color: 0x050b18,
        transparent: true,
        opacity: 0.94,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    backing.position.z = -0.004;
    backing.renderOrder = 6;
    group.add(backing);
    this.visualPlateBackingMesh = backing;

    // Sculpted chamfered 24K gold bevel frame
    const frameMat = new THREE.MeshPhysicalMaterial({
      color: 0xe5be64,
      metalness: 0.96,
      roughness: 0.18,
      clearcoat: 0.35,
      clearcoatRoughness: 0.14,
      transmission: 0,
      envMapIntensity: 0.94,
    });
    const frame = new THREE.Mesh(this.buildVisualPlateFrameGeometry(w, h), frameMat);
    frame.renderOrder = 7;
    group.add(frame);
    this.visualPlateFrameMesh = frame;

    // Blueprint SVG/PNG screen plane (SRGBColorSpace, toneMapped: false for razor-crisp cyan/gold lines)
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.98,
      toneMapped: false,
      depthWrite: false,
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), screenMat);
    screen.position.z = 0.008;
    screen.renderOrder = 8;
    group.add(screen);
    this.visualPlateScreenMesh = screen;
    this.visualPlateScreenMat = screenMat;

    // Subtle comma-safe gold blueprint caption underneath the frame
    const caption = createTroikaMesh();
    caption.fontSize = 0.0145;
    caption.fontWeight = 'bold';
    caption.letterSpacing = 0.04;
    caption.maxWidth = 0.44;
    caption.color = 0xffe494;
    caption.anchorX = 'center';
    caption.anchorY = 'top';
    caption.textAlign = 'center';
    caption.outlineWidth = '14%';
    caption.outlineColor = 0x02040a;
    caption.outlineOpacity = 0.96;
    caption.position.set(0, -(h * 0.5 + 0.018), 0.01);
    caption.visible = false;
    group.add(caption);
    this.visualPlateCaptionText = caption;

    this.prismFloatBody.add(group);
    this.visualPlateGroup = group;
  }

  private resizeVisualPlateAspect(aspect: 'SQUARE' | 'WIDE'): void {
    if (!this.visualPlateGroup || this.visualPlateAspect === aspect) return;
    this.visualPlateAspect = aspect;
    const w = aspect === 'SQUARE' ? 0.34 : 0.44;
    const h = aspect === 'SQUARE' ? 0.285 : 0.275;

    if (this.visualPlateBackingMesh) {
      this.visualPlateBackingMesh.geometry.dispose();
      this.visualPlateBackingMesh.geometry = new THREE.PlaneGeometry(w + 0.018, h + 0.018);
    }
    if (this.visualPlateFrameMesh) {
      this.visualPlateFrameMesh.geometry.dispose();
      this.visualPlateFrameMesh.geometry = this.buildVisualPlateFrameGeometry(w, h);
    }
    if (this.visualPlateScreenMesh) {
      this.visualPlateScreenMesh.geometry.dispose();
      this.visualPlateScreenMesh.geometry = new THREE.PlaneGeometry(w, h);
    }
    if (this.visualPlateCaptionText) {
      this.visualPlateCaptionText.maxWidth = w;
      this.visualPlateCaptionText.position.y = -(h * 0.5 + 0.018);
    }
  }

  private loadVisualPlateTextureCached(resolvedUrl: string): Promise<THREE.Texture | null> {
    const hit = this.visualPlateTexCache.get(resolvedUrl);
    if (hit) {
      // Refresh LRU recency
      this.visualPlateTexCache.delete(resolvedUrl);
      this.visualPlateTexCache.set(resolvedUrl, hit);
      return Promise.resolve(hit);
    }

    const inflight = this.visualPlatePending.get(resolvedUrl);
    if (inflight) return inflight;

    const promise = new Promise<THREE.Texture | null>((resolve) => {
      this.glyphTexLoader.load(
        resolvedUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          tex.needsUpdate = true;

          // Evict oldest LRU entry if over bounded cap
          this.visualPlateTexCache.set(resolvedUrl, tex);
          if (this.visualPlateTexCache.size > MAX_VISUAL_PLATE_CACHE) {
            const oldestKey = this.visualPlateTexCache.keys().next().value;
            if (oldestKey && oldestKey !== resolvedUrl && oldestKey !== this.visualPlateActiveUrl) {
              const evicted = this.visualPlateTexCache.get(oldestKey);
              this.visualPlateTexCache.delete(oldestKey);
              evicted?.dispose();
            }
          }
          this.visualPlatePending.delete(resolvedUrl);
          resolve(tex);
        },
        undefined,
        () => {
          this.visualPlatePending.delete(resolvedUrl);
          resolve(null);
        }
      );
    });

    this.visualPlatePending.set(resolvedUrl, promise);
    return promise;
  }

  /**
   * Mounts a `.svg`/`.png` blueprint onto the floating 24K gold-beveled Sapphire Hologram Plate
   * above the Veritas Prism core (cached via bounded LRU map, zero `transmission > 0` pass).
   */
  public setVisualBlueprintPlate(spec?: VisualBlueprintPlateSpec): void {
    if (!spec?.imageUrl) {
      this.clearVisualBlueprintPlate();
      return;
    }

    this.ensureVisualPlateRig();
    const resolvedUrl = this.resolveVisualAssetUrl(spec.imageUrl);
    const token = ++this.visualPlateLoadToken;
    this.visualPlateActiveUrl = resolvedUrl;
    this.resizeVisualPlateAspect(spec.aspect ?? 'WIDE');

    if (this.visualPlateCaptionText) {
      const cleanCap = spec.caption ? sanitize3DYearCommas(spec.caption.trim()) : '';
      if (cleanCap) {
        this.visualPlateCaptionText.text = cleanCap;
        this.visualPlateCaptionText.visible = true;
        this.visualPlateCaptionText.sync();
      } else {
        this.visualPlateCaptionText.visible = false;
      }
    }

    void this.loadVisualPlateTextureCached(resolvedUrl).then((tex) => {
      if (token !== this.visualPlateLoadToken || !this.visualPlateGroup || !this.visualPlateScreenMat) {
        return;
      }
      if (!tex) {
        this.visualPlateGroup.visible = false;
        return;
      }
      this.visualPlateScreenMat.map = tex;
      this.visualPlateScreenMat.needsUpdate = true;
      this.visualPlateRevealAnim = 0.01;
      this.visualPlateGroup.scale.setScalar(0.86);
      this.visualPlateGroup.visible = this.prismGroup.visible;
    });
  }

  /**
   * Immediately hides & detaches the Sapphire Hologram Plate when transitioning to a non-visual question.
   */
  public clearVisualBlueprintPlate(): void {
    this.visualPlateLoadToken++;
    this.visualPlateActiveUrl = null;
    this.visualPlateRevealAnim = 0;
    if (this.visualPlateGroup) {
      this.visualPlateGroup.visible = false;
    }
    if (this.visualPlateScreenMat) {
      this.visualPlateScreenMat.map = null;
      this.visualPlateScreenMat.needsUpdate = true;
    }
    if (this.visualPlateCaptionText) {
      this.visualPlateCaptionText.visible = false;
    }
  }

  /**
   * Smoothly rotates `Facet_Carousel` via shortest angular path so `facetIndex` locks into the front
   * `+Z` Gold Sightline Beam.
   */
  public spinToFacet(facetIndex: number, fireCallback = true, instant = false): void {
    if (this.facets.length === 0) {
      this.selectedFacetIndex = Math.max(0, Math.min(3, facetIndex));
      return;
    }
    const idx = ((facetIndex % this.facets.length) + this.facets.length) % this.facets.length;
    const facet = this.facets[idx];
    const desiredYaw = -facet.baseAngle;
    const delta = normalizeAngleSigned(desiredYaw - this.carouselYaw);
    this.targetCarouselYaw = this.carouselYaw + delta;
    this.carouselVel = 0;

    const changed = this.selectedFacetIndex !== idx;
    this.selectedFacetIndex = idx;

    if (instant) {
      this.carouselYaw = this.targetCarouselYaw;
      if (this.facetCarousel) {
        this.facetCarousel.rotation.y = this.carouselYaw;
      }
    }

    if (fireCallback && changed) {
      this.callbacks.onSpinDetent?.(idx, 1.0);
      this.callbacks.onFacetSelected?.(idx);
    }
  }

  /**
   * Steps `-1` (left) or `+1` (right) to the next surviving non-eliminated crystal facet.
   */
  public stepFacet(stepDelta: -1 | 1): number {
    if (this.facets.length === 0) return 0;
    let next = this.selectedFacetIndex;
    for (let tries = 0; tries < this.facets.length; tries++) {
      next = (next + stepDelta + this.facets.length) % this.facets.length;
      if (!this.facets[next].eliminated) {
        break;
      }
    }
    this.spinToFacet(next, true);
    return next;
  }

  public applyCarouselDrag(deltaRadians: number, velocityRadPerSec: number): void {
    this.isDraggingCarousel = true;
    this.carouselYaw += deltaRadians;
    this.targetCarouselYaw = this.carouselYaw;
    this.carouselVel = velocityRadPerSec;
    this.checkCarouselDetentTick(Math.abs(velocityRadPerSec));
  }

  public releaseCarouselDrag(): number {
    this.isDraggingCarousel = false;
    // Project inertia slightly forward, then snap to nearest surviving facet
    const projectedYaw = this.carouselYaw + THREE.MathUtils.clamp(this.carouselVel * 0.14, -1.2, 1.2);
    const nearest = this.findNearestSurvivingFacet(projectedYaw);
    const desiredYaw = -this.facets[nearest].baseAngle;
    const delta = normalizeAngleSigned(desiredYaw - this.carouselYaw);
    this.targetCarouselYaw = this.carouselYaw + delta;
    this.carouselVel = 0;

    if (nearest !== this.selectedFacetIndex) {
      this.selectedFacetIndex = nearest;
      this.callbacks.onSpinDetent?.(nearest, 1.0);
      this.callbacks.onFacetSelected?.(nearest);
    }
    return nearest;
  }

  private findNearestSurvivingFacet(yaw: number): number {
    if (this.facets.length === 0) return 0;
    let bestIdx = 0;
    let bestCos = -2;
    for (const f of this.facets) {
      if (f.eliminated) continue;
      const c = Math.cos(yaw + f.baseAngle);
      if (c > bestCos) {
        bestCos = c;
        bestIdx = f.index;
      }
    }
    return bestIdx;
  }

  private checkCarouselDetentTick(speed: number): void {
    const sector = Math.round(-this.carouselYaw / (Math.PI * 0.5));
    if (sector !== this.lastDetentSector) {
      this.lastDetentSector = sector;
      const nearest = this.findNearestSurvivingFacet(this.carouselYaw);
      this.selectedFacetIndex = nearest;
      this.callbacks.onSpinDetent?.(nearest, THREE.MathUtils.clamp(speed / 8.0, 0.25, 1.0));
      this.callbacks.onFacetSelected?.(nearest);
    }
  }

  /**
   * Live visual feedback while dragging `Brass_Crown` downward (`progress01` in `0..1`).
   */
  public setCrownPullProgress(progress01: number): void {
    const p = THREE.MathUtils.clamp(progress01, 0, 1);
    const baseOffset = this.peelTier === 1 ? 0 : this.peelTier === 2 ? -0.045 : -0.08;
    const extraPull = this.peelTier === 1 ? -0.045 * p : this.peelTier === 2 ? -0.035 * p : 0;
    this.targetCrownPullOffset = baseOffset + extraPull;
  }

  /**
   * Executes Depth Peel (`Tier 2 = 2.0x Clue Core` spiral shutter bloom; `Tier 3 = 1.2x Blueprint Core`
   * exploded state + physical 3D shatter of eliminated false facets!).
   */
  public pullCrownPeel(
    targetTier?: 2 | 3,
    eliminatedIndices?: number[],
    withShatterVfx = true
  ): 1 | 2 | 3 {
    const nextTier: 2 | 3 =
      targetTier ?? (this.peelTier === 1 ? 2 : 3);
    this.peelTier = nextTier;

    if (nextTier === 2) {
      this.targetCrownPullOffset = -0.045;
      this.targetShutterOpen = 0.38;
      this.targetBlueprintExpand = 0.0;
      if (this.activeHologramGlyph) {
        this.activeHologramGlyph.visible = true;
      }
      if (withShatterVfx) {
        this.spawnSparkBurst(new THREE.Vector3(0, 0.5, 0), this.activePalette.emissiveHex, 28);
      }
    } else if (nextTier === 3) {
      this.targetCrownPullOffset = -0.08;
      this.targetShutterOpen = 0.68;
      this.targetBlueprintExpand = 1.0;
      if (this.activeHologramGlyph) {
        this.activeHologramGlyph.visible = true;
      }

      const toShatter = eliminatedIndices ?? [];
      for (const idx of toShatter) {
        if (withShatterVfx) {
          this.shatterSingleFacet(idx, 0x9ad8ff);
        } else {
          this.eliminateFacetSilent(idx);
        }
      }

      // If the active front facet was eliminated, spin smoothly to a surviving facet
      if (this.facets[this.selectedFacetIndex]?.eliminated) {
        const survivor = this.findNearestSurvivingFacet(this.carouselYaw);
        this.spinToFacet(survivor, true);
      }
    }

    return this.peelTier;
  }

  /**
   * Used by London's *Diplomatic Redaction* perk to shatter a single decoy facet on Q1.
   */
  public redactFacet(facetIndex: number): void {
    this.shatterSingleFacet(facetIndex, 0xffb85c);
    if (this.facets[this.selectedFacetIndex]?.eliminated) {
      const survivor = this.findNearestSurvivingFacet(this.carouselYaw);
      this.spinToFacet(survivor, true);
    }
  }

  private eliminateFacetSilent(facetIndex: number): void {
    const f = this.facets[facetIndex];
    if (!f) return;
    f.eliminated = true;
    f.node.visible = false;
  }

  private shatterSingleFacet(facetIndex: number, shardColorHex: number): void {
    const f = this.facets[facetIndex];
    if (!f || f.eliminated) return;
    f.eliminated = true;

    const worldPos = new THREE.Vector3();
    f.node.getWorldPosition(worldPos);
    const localBurstOrigin = this.vfxGroup.worldToLocal(worldPos.clone());
    const outDir = localBurstOrigin.clone().setY(0).normalize();
    if (outDir.lengthSq() < 0.01) outDir.set(0, 0, 1);

    this.spawnCrystalShards(localBurstOrigin, outDir, shardColorHex, 26);
    this.spawnSparkBurst(localBurstOrigin, shardColorHex, 24);
    f.node.visible = false;
  }

  /**
   * Drives Hold-to-Overclock physical clamping jaws + vertical molten-gold crystal shader surge.
   */
  public setOverclockState(active: boolean, charge01: number): void {
    this.overclockActive = active;
    this.targetOverclockCharge = active ? THREE.MathUtils.clamp(charge01, 0, 1) : 0;
  }

  /**
   * Sideways flick-to-cancel (`Bluff Echo`): unclamps jaws & vents cool silver-gold steam burst.
   */
  public cancelOverclockBluff(): void {
    this.overclockActive = false;
    this.targetOverclockCharge = 0;
    this.spawnSparkBurst(new THREE.Vector3(0, 0.5, 0.34), 0xd8ecff, 22);
  }

  /**
   * Plays the physical Lock & Reveal payoff:
   * - Firing Pin slams downward (`THUNK!`)
   * - On Correct (`GOLD RESONANCE`): false facets shatter into golden-emerald shards & dust; winning facet gleams!
   * - On Wrong (`BACKFIRE` / Miss): crimson radial fracture wave surges across selected facet, then rotates to show `correctIndex`.
   */
  public playRevealOutcome(opts: {
    correct: boolean;
    correctIndex: number;
    selectedIndex?: number;
    wasOverclocked?: boolean;
  }): void {
    this.overclockActive = false;
    this.targetOverclockCharge = 0;
    this.firingPinSlamAnim = 1.0;

    if (this.activeArchetype !== 'SIGHTLINE_LOCK') {
      const origin = new THREE.Vector3(0, 0.46, 0.16);
      this.spawnSparkBurst(
        origin,
        opts.correct ? 0xffdf72 : 0xff2a44,
        opts.correct ? 48 : 32
      );
      return;
    }

    const selIdx = opts.selectedIndex ?? this.selectedFacetIndex;
    if (opts.correct) {
      const winFacet = this.facets[opts.correctIndex];
      if (winFacet) {
        // Cap GOLD_RESONANCE emissive boost <= 0.42 (#137 P0 #3 — zero white-yellow washout!)
        winFacet.crystalHandle.uniforms.uResonanceFlash.value = 0.42;
        winFacet.badgeText.color = 0x5ef7b4;
        winFacet.badgeText.sync();
      }
      // Shatter remaining false facets into golden-emerald dust
      for (const f of this.facets) {
        if (f.index !== opts.correctIndex && !f.eliminated) {
          this.shatterSingleFacet(f.index, 0xf2cf7e);
        }
      }
      this.spawnSparkBurst(new THREE.Vector3(0, 0.5, 0.36), 0x5ef7b4, 34);
    } else {
      const chosenFacet = this.facets[selIdx];
      if (chosenFacet) {
        chosenFacet.crystalHandle.uniforms.uBackfirePulse.value = opts.wasOverclocked ? 0.88 : 0.65;
        chosenFacet.badgeText.color = 0xff3b52;
        chosenFacet.badgeText.sync();
      }
      this.spawnSparkBurst(
        new THREE.Vector3(0, 0.5, 0.36),
        0xff2442,
        opts.wasOverclocked ? 36 : 22
      );

      // Highlight & rotate to reveal true answer cleanly for the Intel Flash "Aha!" moment
      const trueFacet = this.facets[opts.correctIndex];
      if (trueFacet) {
        trueFacet.eliminated = false;
        trueFacet.node.visible = true;
        trueFacet.crystalHandle.uniforms.uResonanceFlash.value = 0.38;
        trueFacet.badgeText.color = 0x5ef7b4;
        trueFacet.badgeText.sync();
        if (opts.correctIndex !== selIdx) {
          this.spinToFacet(opts.correctIndex, false);
        }
      }
    }
  }

  /**
   * Explicit Crimson Circuit-Breach Failure Payoff (#171 §2.1 & §3.2 `won === false`):
   * Surges a crimson radial fracture pulse across all visible sapphire facets, locks the shutters,
   * tints the Sightline beam & plinth alignment ring deep breach-crimson, and bursts crimson fracture sparks.
   */
  public triggerMissionFailedPulse(): void {
    this.overclockActive = false;
    this.targetOverclockCharge = 0;
    this.firingPinSlamAnim = 1.0;
    this.targetShutterOpen = 0.0;

    for (const f of this.facets) {
      if (!f.eliminated) {
        f.crystalHandle.uniforms.uBackfirePulse.value = 1.0;
        f.crystalHandle.uniforms.uResonanceFlash.value = 0.0;
      }
    }
    this.sightlineBeamMat.uniforms.uColor.value.setHex(0xff243e);
    if (this.sightlineFloorRing.material instanceof THREE.MeshBasicMaterial) {
      this.sightlineFloorRing.material.color.setHex(0xff243e);
    }
    this.corePointLight.color.setHex(0xff1e3c);
    this.spawnSparkBurst(new THREE.Vector3(0, 0.48, 0.28), 0xff243e, 38);
  }

  // ============================================================================
  // 2. CODEX_DUAL_RING — `codex_cryptex.glb`
  // ============================================================================

  private async ensureCodexLoaded(): Promise<void> {
    if (this.codexLoaded) return;
    const tpl = await this.venueLoader.loadGlbTemplate('assets/aaa_models/codex_cryptex.glb');
    if (this.codexLoaded) return;
    this.codexLoaded = true;

    const holder = new THREE.Group();
    holder.scale.setScalar(1.62);
    this.codexGroup.add(holder);

    if (tpl) {
      const inst = tpl.clone(true);
      inst.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          // #255/#273 (<120 draw calls): dual-ring contactShadow grounds Prism; only Pedestal casts dynamic shadow
          obj.castShadow = obj.name.includes('Pedestal');
          obj.receiveShadow = true;
          if (obj.material instanceof THREE.MeshStandardMaterial) {
            obj.material = upgradeToHorologicalPhysicalMaterial(obj.material, 'AUTO', 0.94, 0.48);
          }
        }
      });
      holder.add(inst);
      this.codexTopRing = inst.getObjectByName('Cryptex_Ring_2') ?? null;
      this.codexMidRing = inst.getObjectByName('Cryptex_Ring_1') ?? null;
      this.codexBottomRing = inst.getObjectByName('Cryptex_Ring_0') ?? null;
    }

    if (!this.codexTopRing) {
      this.codexTopRing = new THREE.Group();
      this.codexTopRing.position.set(0, 0.325, 0);
      holder.add(this.codexTopRing);
    }
    if (!this.codexBottomRing) {
      this.codexBottomRing = new THREE.Group();
      this.codexBottomRing.position.set(0, 0.165, 0);
      holder.add(this.codexBottomRing);
    }

    // Reset initial baked yaw on Cryptex rings so index 0 aligns cleanly at +Z
    this.codexTopRing.rotation.set(0, 0, 0);
    this.codexBottomRing.rotation.set(0, 0, 0);

    // Curved dark obsidian-enamel collar bands mounted OUTSIDE Cryptex_Body's r=0.205m struts (#132 fix!)
    const collarMat = new THREE.MeshPhysicalMaterial({
      color: 0x060b16,
      metalness: 0.3,
      roughness: 0.18,
      clearcoat: 0.92,
      clearcoatRoughness: 0.08,
      envMapIntensity: 0.92,
      side: THREE.DoubleSide,
    });
    const goldRimMat = new THREE.MeshStandardMaterial({
      color: 0xe2b85c,
      metalness: 0.92,
      roughness: 0.22,
      envMapIntensity: 0.98,
    });
    const addCollarBand = (ringParent: THREE.Object3D) => {
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.218, 0.218, 0.056, 48, 1, true),
        collarMat
      );
      const topTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.219, 0.0028, 10, 48),
        goldRimMat
      );
      topTrim.rotation.x = Math.PI * 0.5;
      topTrim.position.y = 0.028;
      const botTrim = topTrim.clone();
      botTrim.position.y = -0.028;
      ringParent.add(band, topTrim, botTrim);
    };
    addCollarBand(this.codexTopRing);
    addCollarBand(this.codexBottomRing);

    // 3 Subject plaques on Top Ring (0°, 120°, 240°) mounted cleanly at r=0.223m outside brass struts
    this.codexTopTexts = [];
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3;
      const pivot = new THREE.Group();
      pivot.rotation.y = ang;
      const txt = createTroikaMesh();
      txt.fontSize = 0.0195;
      txt.fontWeight = 'bold';
      txt.maxWidth = 0.21;
      txt.color = 0xfff8e4;
      txt.anchorX = 'center';
      txt.anchorY = 'middle';
      txt.textAlign = 'center';
      txt.curveRadius = -0.223;
      txt.outlineWidth = '14%';
      txt.outlineColor = 0x02040a;
      txt.position.set(0, 0, 0.223);
      pivot.add(txt);
      this.codexTopRing.add(pivot);
      this.codexTopTexts.push(txt);
    }

    // 4 Target plaques on Bottom Ring (0°, 90°, 180°, 270°) mounted cleanly at r=0.223m outside brass struts
    this.codexBottomTexts = [];
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      const pivot = new THREE.Group();
      pivot.rotation.y = ang;
      const txt = createTroikaMesh();
      txt.fontSize = 0.019;
      txt.fontWeight = 'bold';
      txt.maxWidth = 0.195;
      txt.color = 0xe3efff;
      txt.anchorX = 'center';
      txt.anchorY = 'middle';
      txt.textAlign = 'center';
      txt.curveRadius = -0.223;
      txt.outlineWidth = '14%';
      txt.outlineColor = 0x02040a;
      txt.position.set(0, 0, 0.223);
      pivot.add(txt);
      this.codexBottomRing.add(pivot);
      this.codexBottomTexts.push(txt);
    }

    // 3 Golden Laser Conduits strictly spanning the central gap between Top & Bottom collars (#273 Fix #2)
    this.codexConduitBeams = [];
    const conduitGapGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.088, 12);
    const conduitSpecs = [
      { x: -0.1, geo: conduitGapGeo },
      { x: 0, geo: conduitGapGeo },
      { x: 0.1, geo: conduitGapGeo },
    ];
    for (const cs of conduitSpecs) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffe07d,
        transparent: true,
        opacity: 0.28,
      });
      const beam = new THREE.Mesh(cs.geo, mat);
      beam.position.set(cs.x, 0.245, 0.214);
      holder.add(beam);
      this.codexConduitBeams.push(beam);
    }

    // Separate touch hitboxes for Top vs Bottom ring
    this.codexTopHitbox = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.14, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.codexTopHitbox.position.set(0, 0.325, 0);
    this.codexTopHitbox.userData = { hitKind: 'CODEX_TOP' };
    holder.add(this.codexTopHitbox);

    this.codexBottomHitbox = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.14, 16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.codexBottomHitbox.position.set(0, 0.165, 0);
    this.codexBottomHitbox.userData = { hitKind: 'CODEX_BOTTOM' };
    holder.add(this.codexBottomHitbox);
  }

  public async configureCodexDualRing(spec: CodexDualRingSpec): Promise<void> {
    await this.ensureCodexLoaded();
    this.setDomainPalette(spec.domainId ?? 0);

    for (let i = 0; i < 3; i++) {
      const txt = this.codexTopTexts[i];
      if (txt) {
        txt.text = sanitize3DYearCommas(spec.subjects[i] ?? `Subject ${i + 1}`);
        txt.sync();
      }
    }
    for (let i = 0; i < 4; i++) {
      const txt = this.codexBottomTexts[i];
      if (txt) {
        txt.text = sanitize3DYearCommas(spec.targets[i] ?? `Target ${i + 1}`);
        txt.sync();
      }
    }

    this.spinCodexRing('TOP', spec.initialTopIndex ?? 0, false, false);
    this.spinCodexRing('BOTTOM', spec.initialBottomIndex ?? 0, false, false);
    this.setCodexConduits(spec.lockedConduits ?? 0);
  }

  public spinCodexRing(
    ring: 'TOP' | 'BOTTOM',
    indexOrDelta: number,
    relative = false,
    fireCallback = true
  ): void {
    if (ring === 'TOP') {
      const next = relative
        ? (this.codexTopIndex + indexOrDelta + 3) % 3
        : ((indexOrDelta % 3) + 3) % 3;
      this.codexTopIndex = next;
      const desired = -(next * Math.PI * 2) / 3;
      this.codexTargetTopYaw = this.codexTopYaw + normalizeAngleSigned(desired - this.codexTopYaw);
    } else {
      const next = relative
        ? (this.codexBottomIndex + indexOrDelta + 4) % 4
        : ((indexOrDelta % 4) + 4) % 4;
      this.codexBottomIndex = next;
      const desired = -(next * Math.PI) / 2;
      this.codexTargetBottomYaw =
        this.codexBottomYaw + normalizeAngleSigned(desired - this.codexBottomYaw);
    }
    if (fireCallback) {
      this.callbacks.onSpinDetent?.(
        ring === 'TOP' ? this.codexTopIndex : this.codexBottomIndex,
        0.8
      );
      this.callbacks.onCodexChanged?.(this.codexTopIndex, this.codexBottomIndex, ring);
    }
  }

  public setCodexConduits(lockedCount: number): void {
    for (let i = 0; i < this.codexConduitBeams.length; i++) {
      const lit = i < lockedCount;
      const mat = this.codexConduitBeams[i].material as THREE.MeshBasicMaterial;
      mat.color.setHex(lit ? 0x5ef7b4 : 0xffe07d);
      mat.opacity = lit ? 0.96 : 0.22;
      this.codexConduitBeams[i].scale.set(lit ? 1.65 : 1.0, 1.0, lit ? 1.65 : 1.0);
    }
  }

  // ============================================================================
  // 3. CALIBRATOR_DIAL — `calibrator_chronometer.glb`
  // ============================================================================

  private async ensureCalibratorLoaded(): Promise<void> {
    if (this.calibratorLoaded) return;
    const tpl = await this.venueLoader.loadGlbTemplate(
      'assets/aaa_models/calibrator_chronometer.glb'
    );
    if (this.calibratorLoaded) return;
    this.calibratorLoaded = true;

    const holder = new THREE.Group();
    holder.scale.setScalar(1.36);
    this.calibratorGroup.add(holder);

    if (tpl) {
      const inst = tpl.clone(true);
      inst.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          // #255/#273 (<120 draw calls): dual-ring contactShadow grounds Prism; only Pedestal casts dynamic shadow
          obj.castShadow = obj.name.includes('Pedestal');
          obj.receiveShadow = true;
          if (obj.name === 'Chronometer_Glass' || obj.material?.name === 'Mat_Sapphire_Glass') {
            // #273 Fix #3: Anti-reflective museum sapphire glass — eliminates blinding white specular glare dot
            obj.material = new THREE.MeshPhysicalMaterial({
              color: 0x0a1424,
              metalness: 0.04,
              roughness: 0.14,
              ior: 1.52,
              transparent: true,
              opacity: 0.1,
              clearcoat: 0.25,
              clearcoatRoughness: 0.24,
              specularIntensity: 0.35,
              envMapIntensity: 0.45,
              depthWrite: false,
            });
            obj.renderOrder = 8;
          } else if (obj.material instanceof THREE.MeshStandardMaterial) {
            obj.material = upgradeToHorologicalPhysicalMaterial(obj.material, 'AUTO', 0.94, 0.48);
          }
        }
      });
      holder.add(inst);
      this.calibratorBezel = inst.getObjectByName('Chronometer_Bezel') ?? null;
      this.calibratorNeedle = inst.getObjectByName('Chronometer_Needle') ?? null;
    }

    if (!this.calibratorBezel) {
      this.calibratorBezel = new THREE.Group();
      this.calibratorBezel.position.set(0, 0.365, 0);
      this.calibratorBezel.rotation.x = -0.48;
      holder.add(this.calibratorBezel);
    }

    // Volumetric Golden Tolerance Sector Fan mounted directly on Chronometer_Bezel face
    const sectorMat = new THREE.MeshBasicMaterial({
      color: 0xffd86b,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.calibratorSectorMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.265, 48, 0, Math.PI * 0.25),
      sectorMat
    );
    this.calibratorSectorMesh.position.set(0, 0, 0.015);
    this.calibratorSectorMesh.renderOrder = 6;
    this.calibratorBezel.add(this.calibratorSectorMesh);

    // Floating 3D MSDF Chronometer Estimate & Multiplier Readout (#273 Fix #3: lifted cleanly above brass finial)
    const readout = createTroikaMesh();
    readout.fontSize = 0.032;
    readout.fontWeight = 'bold';
    readout.color = 0xffe694;
    readout.anchorX = 'center';
    readout.anchorY = 'middle';
    readout.outlineWidth = '12%';
    readout.outlineColor = 0x050811;
    readout.position.set(0, 0.435, 0.065);
    this.calibratorBezel.add(readout);
    this.calibratorReadoutText = readout;

    const minTxt = createTroikaMesh();
    minTxt.fontSize = 0.025;
    minTxt.fontWeight = 'bold';
    minTxt.color = 0xf3f7ff;
    minTxt.anchorX = 'center';
    minTxt.anchorY = 'middle';
    minTxt.outlineWidth = '14%';
    minTxt.outlineColor = 0x050811;
    minTxt.position.set(-0.185, -0.185, 0.062);
    this.calibratorBezel.add(minTxt);
    this.calibratorMinText = minTxt;

    const maxTxt = createTroikaMesh();
    maxTxt.fontSize = 0.025;
    maxTxt.fontWeight = 'bold';
    maxTxt.color = 0xf3f7ff;
    maxTxt.anchorX = 'center';
    maxTxt.anchorY = 'middle';
    maxTxt.outlineWidth = '14%';
    maxTxt.outlineColor = 0x050811;
    maxTxt.position.set(0.185, -0.185, 0.062);
    this.calibratorBezel.add(maxTxt);
    this.calibratorMaxText = maxTxt;

    // Truth marker revealed on submit
    const truthPin = new THREE.Group();
    const pinShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.002, 0.25, 10),
      new THREE.MeshBasicMaterial({ color: 0x4ef7b2 })
    );
    pinShaft.position.set(0, 0.125, 0.024);
    truthPin.add(pinShaft);
    truthPin.visible = false;
    this.calibratorBezel.add(truthPin);
    this.calibratorTruthPin = truthPin;

    this.calibratorHitbox = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.14, 24),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.calibratorHitbox.rotation.x = Math.PI * 0.5;
    this.calibratorHitbox.userData = { hitKind: 'CALIBRATOR' };
    this.calibratorBezel.add(this.calibratorHitbox);
  }

  public async configureCalibratorDial(spec: CalibratorDialSpec): Promise<void> {
    await this.ensureCalibratorLoaded();
    this.setDomainPalette(spec.domainId ?? 0);

    this.calMin = spec.minVal;
    this.calMax = Math.max(spec.minVal + 1e-6, spec.maxVal);
    this.calStep = spec.step ?? 1;
    this.calUnit = spec.unit ?? '';
    this.calToleranceFrac = THREE.MathUtils.clamp(spec.toleranceFraction ?? 0.1, 0.015, 0.3);
    this.calMultLabel = spec.multiplierLabel ?? '2.5x';

    if (this.calibratorTruthPin) {
      this.calibratorTruthPin.visible = false;
    }

    if (this.calibratorMinText) {
      this.calibratorMinText.text = formatCalibratorDialNumber(
        this.calMin,
        this.calUnit,
        this.calMin,
        this.calMax
      );
      this.calibratorMinText.sync();
    }
    if (this.calibratorMaxText) {
      this.calibratorMaxText.text = formatCalibratorDialNumber(
        this.calMax,
        this.calUnit,
        this.calMin,
        this.calMax
      );
      this.calibratorMaxText.sync();
    }

    const startVal = spec.initialVal ?? (this.calMin + this.calMax) * 0.5;
    this.setCalibratorValue(startVal, false);
    this.rebuildCalibratorSectorGeometry();
  }

  private valueToChronometerAngle(val: number): number {
    // Sweep 270° clockwise from +135° (bottom-left min) through 0° (12 o'clock mid) to -135° (bottom-right max)
    const t = THREE.MathUtils.clamp((val - this.calMin) / (this.calMax - this.calMin), 0, 1);
    return THREE.MathUtils.lerp(Math.PI * 0.75, -Math.PI * 0.75, t);
  }

  public setCalibratorValue(value: number, fireCallback = true): void {
    const snapped =
      Math.round((THREE.MathUtils.clamp(value, this.calMin, this.calMax) - this.calMin) / this.calStep) *
        this.calStep +
      this.calMin;
    this.calValue = THREE.MathUtils.clamp(
      Number(snapped.toFixed(4)),
      this.calMin,
      this.calMax
    );
    this.calTargetNeedleAngle = this.valueToChronometerAngle(this.calValue);
    this.updateCalibratorReadout();

    if (fireCallback) {
      this.callbacks.onCalibratorChanged?.(this.calValue, this.calToleranceFrac);
    }
  }

  public nudgeCalibratorByRatio(deltaRatio: number): void {
    const span = this.calMax - this.calMin;
    this.setCalibratorValue(this.calValue + span * deltaRatio, true);
  }

  public setCalibratorTolerance(fraction: number, multiplierLabel?: string): void {
    this.calToleranceFrac = THREE.MathUtils.clamp(fraction, 0.015, 0.3);
    if (multiplierLabel) {
      this.calMultLabel = multiplierLabel;
    } else {
      this.calMultLabel =
        this.calToleranceFrac <= 0.035
          ? '3.5x'
          : this.calToleranceFrac <= 0.11
            ? '2.5x'
            : '1.5x';
    }
    this.rebuildCalibratorSectorGeometry();
    this.updateCalibratorReadout();
    this.callbacks.onCalibratorChanged?.(this.calValue, this.calToleranceFrac);
  }

  private rebuildCalibratorSectorGeometry(): void {
    if (!this.calibratorSectorMesh) return;
    // Total sweep is 270° (1.5 * PI); toleranceFraction is ±fraction of range -> total arc = 2 * fraction * 1.5 * PI
    const arcSpan = THREE.MathUtils.clamp(this.calToleranceFrac * 2 * Math.PI * 1.5, 0.06, Math.PI * 1.2);
    // In Three.js CircleGeometry, angle 0 is +X; our needle's 0 angle points along +Y (which is +PI/2 from +X)
    const thetaStart = Math.PI * 0.5 - arcSpan * 0.5;
    this.calibratorSectorMesh.geometry.dispose();
    this.calibratorSectorMesh.geometry = new THREE.CircleGeometry(0.264, 48, thetaStart, arcSpan);

    const mat = this.calibratorSectorMesh.material as THREE.MeshBasicMaterial;
    if (this.calToleranceFrac <= 0.035) {
      mat.color.setHex(0xfff6c4);
      mat.opacity = 0.72;
    } else if (this.calToleranceFrac <= 0.11) {
      mat.color.setHex(0xffd86b);
      mat.opacity = 0.48;
    } else {
      mat.color.setHex(0xe5a94c);
      mat.opacity = 0.34;
    }
  }

  private updateCalibratorReadout(): void {
    if (!this.calibratorReadoutText) return;
    const formattedVal = formatCalibratorDialNumber(
      this.calValue,
      this.calUnit,
      this.calMin,
      this.calMax
    );
    const suffix = this.calUnit ? ` ${this.calUnit}` : '';
    this.calibratorReadoutText.text = `${formattedVal}${suffix}  ·  ${this.calMultLabel}`;
    this.calibratorReadoutText.sync();
  }

  public revealCalibratorTarget(exactVal: number, withinCone: boolean): void {
    if (this.calibratorTruthPin) {
      this.calibratorTruthPin.visible = true;
      this.calibratorTruthPin.rotation.z = this.valueToChronometerAngle(exactVal);
    }
    this.spawnSparkBurst(
      new THREE.Vector3(0, 0.52, 0.12),
      withinCone ? 0x5ef7b4 : 0xff2e4d,
      withinCone ? 46 : 26
    );
  }

  // ============================================================================
  // 4. GAUNTLET_SHATTER — Dropping 3D Frosted-Crystal Veritas Plates
  // ============================================================================

  private buildGauntletRig(): void {
    this.gauntletPlateHolder.position.set(0, 0.5, 0);
    this.gauntletGroup.add(this.gauntletPlateHolder);

    // Chamfered dark smoked-obsidian crystal Veritas Plate (#132: #0a1220, 0.92 opacity + 1.8x larger ivory MSDF text!)
    const shape = new THREE.Shape();
    const hw = 0.39;
    const hh = 0.195;
    const ch = 0.036;
    shape.moveTo(-hw + ch, -hh);
    shape.lineTo(hw - ch, -hh);
    shape.lineTo(hw, -hh + ch);
    shape.lineTo(hw, hh - ch);
    shape.lineTo(hw - ch, hh);
    shape.lineTo(-hw + ch, hh);
    shape.lineTo(-hw, hh - ch);
    shape.lineTo(-hw, -hh + ch);
    shape.closePath();

    const plateGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.024,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.009,
      bevelThickness: 0.009,
    });
    plateGeo.center();

    // #185 #2b: Entire chamfered Gauntlet plate face in uniform deep smoked obsidian (#070e1b, opacity 0.93)
    // framed by a sculpted chamfered 24K gold bevel rim (#e2b857) — zero pastel domain margin wash!
    const obsidianSlabMat = new THREE.MeshPhysicalMaterial({
      color: 0x070e1b,
      metalness: 0.14,
      roughness: 0.14,
      ior: 1.77,
      transparent: true,
      opacity: 0.93,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      iridescence: 0.22,
      specularIntensity: 1.0,
      envMapIntensity: 0.92,
    });
    const plateMesh = new THREE.Mesh(plateGeo, obsidianSlabMat);
    plateMesh.renderOrder = 4;
    this.gauntletPlateHolder.add(plateMesh);

    // Sculpted Chamfer-Hugging 24K Gold Bevel Rim around the smoked-obsidian Veritas Plate
    const rimOuter = new THREE.Shape();
    const rhw = hw + 0.011;
    const rhh = hh + 0.011;
    const rch = ch + 0.004;
    rimOuter.moveTo(-rhw + rch, -rhh);
    rimOuter.lineTo(rhw - rch, -rhh);
    rimOuter.lineTo(rhw, -rhh + rch);
    rimOuter.lineTo(rhw, rhh - rch);
    rimOuter.lineTo(rhw - rch, rhh);
    rimOuter.lineTo(-rhw + rch, rhh);
    rimOuter.lineTo(-rhw, rhh - rch);
    rimOuter.lineTo(-rhw, -rhh + rch);
    rimOuter.closePath();

    const rimInner = new THREE.Path();
    const ihw = hw - 0.002;
    const ihh = hh - 0.002;
    rimInner.moveTo(-ihw + ch, -ihh);
    rimInner.lineTo(ihw - ch, -ihh);
    rimInner.lineTo(ihw, -ihh + ch);
    rimInner.lineTo(ihw, ihh - ch);
    rimInner.lineTo(ihw - ch, ihh);
    rimInner.lineTo(-ihw + ch, ihh);
    rimInner.lineTo(-ihw, ihh - ch);
    rimInner.lineTo(-ihw, -ihh + ch);
    rimInner.closePath();
    rimOuter.holes.push(rimInner);

    const goldRimGeo = new THREE.ExtrudeGeometry(rimOuter, {
      depth: 0.032,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.003,
      bevelThickness: 0.003,
    });
    goldRimGeo.center();

    const goldBevelMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2b857,
      metalness: 0.96,
      roughness: 0.18,
      clearcoat: 0.35,
      clearcoatRoughness: 0.14,
      specularIntensity: 1.0,
      envMapIntensity: 0.94,
    });
    const goldRimMesh = new THREE.Mesh(goldRimGeo, goldBevelMat);
    goldRimMesh.renderOrder = 4;
    this.gauntletPlateHolder.add(goldRimMesh);

    // Chamfer-matched smoked-obsidian readability backing flush behind MSDF text (>= 18:1 ivory contrast!)
    const veil = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({
        color: 0x050b16,
        transparent: true,
        opacity: 0.94,
        depthWrite: false,
      })
    );
    veil.position.z = 0.022;
    veil.renderOrder = 5;
    this.gauntletPlateHolder.add(veil);

    const stmt = createTroikaMesh();
    stmt.fontSize = 0.042;
    stmt.fontWeight = 'bold';
    stmt.maxWidth = 0.68;
    stmt.lineHeight = 1.18;
    stmt.color = 0xfffdf5;
    stmt.anchorX = 'center';
    stmt.anchorY = 'middle';
    stmt.textAlign = 'center';
    stmt.outlineWidth = '14%';
    stmt.outlineColor = 0x02040a;
    stmt.outlineOpacity = 0.98;
    stmt.position.set(0, 0.022, 0.026);
    this.gauntletPlateHolder.add(stmt);
    this.gauntletStatementText = stmt;

    const hint = createTroikaMesh();
    hint.text = '◄ DEBUNK     ·     ▲ CHALLENGE 2.5x     ·     VERIFY ►';
    hint.fontSize = 0.019;
    hint.fontWeight = 'bold';
    hint.letterSpacing = 0.04;
    hint.color = 0xffe285;
    hint.anchorX = 'center';
    hint.anchorY = 'middle';
    hint.textAlign = 'center';
    hint.outlineWidth = '14%';
    hint.outlineColor = 0x02040a;
    hint.position.set(0, -0.142, 0.026);
    hint.sync();
    this.gauntletPlateHolder.add(hint);
    this.gauntletHintText = hint;

    this.gauntletHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.42, 0.08),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.gauntletHitbox.userData = { hitKind: 'GAUNTLET' };
    this.gauntletPlateHolder.add(this.gauntletHitbox);
  }

  public configureGauntletShatter(spec: GauntletShatterSpec): void {
    this.setDomainPalette(spec.domainId ?? 0);
    if (this.gauntletPlateCrystal) {
      this.gauntletPlateCrystal.material.color.setHex(0x091220);
      this.gauntletPlateCrystal.uniforms.uDomainAccent.value.setHex(this.activePalette.accentHex);
    }
    this.spawnGauntletPlate(spec.statement);
  }

  public spawnGauntletPlate(statement: string): void {
    this.gauntletPlateHolder.visible = true;
    this.gauntletDropY = 0.55;
    this.gauntletPlateHolder.position.set(0, 0.5 + this.gauntletDropY, 0);
    this.gauntletPlateHolder.rotation.set(0, 0, 0);
    if (this.gauntletStatementText) {
      const cleanStatement = sanitize3DYearCommas(statement);
      const len = cleanStatement.length;
      // 1.8x larger bold ivory typography (#132)
      this.gauntletStatementText.fontSize =
        len <= 48 ? 0.044 : len <= 85 ? 0.036 : len <= 125 ? 0.030 : 0.025;
      this.gauntletStatementText.text = cleanStatement;
      this.gauntletStatementText.sync();
    }
  }

  /**
   * Violently shatters the active 3D frosted-crystal Veritas Plate rightward (emerald VERIFY),
   * leftward (amber DEBUNK), or upward (24K gold CHALLENGE! 2.0x) (#111).
   */
  public shatterGauntletPlate(verdict: 'VERIFY' | 'DEBUNK' | 'CHALLENGE'): void {
    const dir =
      verdict === 'VERIFY'
        ? new THREE.Vector3(1.25, 0.18, 0.2)
        : verdict === 'DEBUNK'
          ? new THREE.Vector3(-1.25, 0.18, 0.2)
          : new THREE.Vector3(0, 1.35, 0.25);

    const colorHex =
      verdict === 'VERIFY'
        ? 0x3ef59e
        : verdict === 'DEBUNK'
          ? 0xff9d3b
          : 0xffe268;

    const origin = new THREE.Vector3(0, 0.5, 0);
    this.spawnCrystalShards(origin, dir, colorHex, 36);
    this.spawnSparkBurst(origin, colorHex, 42);
    this.gauntletPlateHolder.visible = false;
  }

  // ============================================================================
  // 5. HERO RELICS, MERIDIAN WORLD GLOBE v2 & CHAMPIONSHIP TROPHY
  // ============================================================================

  private async mountMiniatureRelicInCore(relicId: HeroRelicKey): Promise<void> {
    const relPath = RELIC_GLB_PATHS[relicId] ?? RELIC_GLB_PATHS.meridian_astrolabe;
    const tpl = await this.venueLoader.loadGlbTemplate(relPath);
    if (!tpl) return;

    if (this.activeHologramGlyph) {
      if (this.activeHologramGlyph.parent) {
        this.activeHologramGlyph.parent.remove(this.activeHologramGlyph);
      }
      disposeObject3D(this.activeHologramGlyph);
      this.activeHologramGlyph = null;
    }

    const holder = new THREE.Group();
    const inst = tpl.clone(true);
    const box = new THREE.Box3().setFromObject(inst);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(0.01, size.x, size.y, size.z);
    const scale = 0.23 / maxDim;
    inst.scale.setScalar(scale);
    inst.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    inst.traverse((n) => {
      if (n instanceof THREE.Mesh && n.material instanceof THREE.MeshStandardMaterial) {
        n.material = upgradeToHorologicalPhysicalMaterial(n.material, 'AUTO', 0.94, 0.45);
      }
    });
    holder.add(inst);
    holder.visible = true;
    this.bindRelicLatches(inst);

    const parent = this.hologramCoreAnchor ?? this.prismFloatBody;
    if (parent === this.prismFloatBody) {
      holder.position.set(0, 0.5, 0);
    }
    parent.add(holder);
    this.activeHologramGlyph = holder;
    this.targetShutterOpen = Math.max(this.targetShutterOpen, 0.34);
  }

  public async configureHeroArtifact(spec: HeroArtifactSpec): Promise<void> {
    this.setDomainPalette(spec.domainId ?? 0);
    if (this.currentRelicId === spec.relicId && this.relicSpinHolder.children.length > 0) {
      return;
    }
    this.currentRelicId = spec.relicId;

    disposeObject3D(this.relicSpinHolder);
    while (this.relicSpinHolder.children.length > 0) {
      this.relicSpinHolder.remove(this.relicSpinHolder.children[0]);
    }

    const relPath = RELIC_GLB_PATHS[spec.relicId] ?? RELIC_GLB_PATHS.meridian_astrolabe;
    const tpl = await this.venueLoader.loadGlbTemplate(relPath);
    if (!tpl || this.currentRelicId !== spec.relicId) return;

    const inst = tpl.clone(true);
    const box = new THREE.Box3().setFromObject(inst);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(0.01, size.x, size.y, size.z);
    const scale = 0.72 / maxDim;
    inst.scale.setScalar(scale);
    inst.position.set(-center.x * scale, 0.5 - center.y * scale, -center.z * scale);

    inst.traverse((n) => {
      if (n instanceof THREE.Mesh) {
        n.castShadow = false;
        n.userData = { hitKind: 'ARTIFACT' };
        if (n.material instanceof THREE.MeshStandardMaterial) {
          n.material = upgradeToHorologicalPhysicalMaterial(n.material, 'AUTO', 0.94, 0.45);
        }
      }
    });

    this.relicSpinHolder.add(inst);
    this.bindRelicLatches(inst);
  }

  private bindRelicLatches(root: THREE.Object3D): void {
    this.relicLatchNodes = [];
    const candidateSets = [
      ['Latch_0', 'Latch_1', 'Latch_2'],
      ['Cryo_Latch_Ring_0', 'Cryo_Latch_Ring_1', 'Cryo_Latch_Ring_2'],
      ['Seal_Segment_Sovereign', 'Seal_Segment_Horizon', 'Seal_Segment_Agora'],
      ['Ledger_Orbital_0', 'Ledger_Orbital_1', 'Ledger_Orbital_2'],
    ];
    for (const set of candidateSets) {
      const found = set
        .map((nm) => root.getObjectByName(nm))
        .filter((n): n is THREE.Object3D => Boolean(n));
      if (found.length > 0) {
        this.relicLatchNodes = found.map((node) => ({
          node,
          basePos: node.position.clone(),
          baseQuat: node.quaternion.clone(),
        }));
        break;
      }
    }
  }

  /**
   * Actuates `0..3` engraved mechanical `Latch_0..2` nodes on Wave-2 Tier-3 Boss Relics (#139/#141/#143).
   */
  public actuateRelicLatches(openCount: number): void {
    this.relicLatchOpenCount = THREE.MathUtils.clamp(Math.round(openCount), 0, 3);
  }

  private buildGlobeBeaconPin(
    spireHex: number,
    emissiveHex: number,
    ringHex: number,
    heightScale = 1.0
  ): { group: THREE.Group; pulseRing: THREE.Mesh } {
    const group = new THREE.Group();
    const h = 0.072 * heightScale;

    // Tapered metallic beacon spire pointing strictly along local +Y (surface normal)
    const spireMat = new THREE.MeshStandardMaterial({
      color: spireHex,
      emissive: emissiveHex,
      emissiveIntensity: 0.72,
      metalness: 0.88,
      roughness: 0.18,
    });
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0045, 0.013, h, 12),
      spireMat
    );
    spire.position.y = h * 0.5;
    group.add(spire);

    // Faceted radiant beacon gem crowning the spire
    const gemMat = new THREE.MeshStandardMaterial({
      color: spireHex,
      emissive: emissiveHex,
      emissiveIntensity: 2.2,
      metalness: 0.35,
      roughness: 0.12,
    });
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.023 * heightScale, 1),
      gemMat
    );
    gem.position.y = h + 0.008 * heightScale;
    group.add(gem);

    // Inner surface lock collar ring
    const baseRing = new THREE.Mesh(
      new THREE.RingGeometry(0.013, 0.02, 24),
      new THREE.MeshBasicMaterial({
        color: ringHex,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    baseRing.rotation.x = -Math.PI * 0.5;
    baseRing.position.y = 0.004;
    baseRing.renderOrder = 8;
    group.add(baseRing);

    // Outer animated pulsing target halo ring
    const pulseRing = new THREE.Mesh(
      new THREE.RingGeometry(0.024, 0.035, 32),
      new THREE.MeshBasicMaterial({
        color: ringHex,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    pulseRing.rotation.x = -Math.PI * 0.5;
    pulseRing.position.y = 0.006;
    pulseRing.renderOrder = 9;
    group.add(pulseRing);

    group.visible = false;
    return { group, pulseRing };
  }

  private async ensureGlobeLoaded(): Promise<void> {
    if (this.globeLoaded) return;
    const tpl = await this.venueLoader.loadGlbTemplate(
      'assets/aaa_models/meridian_world_globe.glb'
    );
    if (this.globeLoaded) return;
    this.globeLoaded = true;

    const wrapper = new THREE.Group();
    // Scale 1.766m War-Room Globe by 0.58x so pedestal sits flush at Y=0 (table 0.78m)
    // and Earth sphere center sits right at Spotlight eye-line (0.78 + 0.615 = 1.395m)
    wrapper.scale.setScalar(0.58);
    this.globeGroup.add(wrapper);

    if (tpl) {
      const inst = tpl.clone(true);
      // Preserve all 7 native PBR materials per @blender-world-artist #106, clamped <= 1.0 envMapIntensity (#132)
      inst.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          // #255/#273 (<120 draw calls): dual-ring contactShadow grounds Prism; only Pedestal casts dynamic shadow
          obj.castShadow = obj.name.includes('Pedestal');
          obj.receiveShadow = true;
          const remap = (m: THREE.Material) => {
            if (m instanceof THREE.MeshStandardMaterial) {
              const gm = m.clone();
              gm.envMapIntensity = 0.98;
              return gm;
            }
            return m;
          };
          obj.material = Array.isArray(obj.material)
            ? obj.material.map(remap)
            : remap(obj.material);
          if (obj.name === 'Globe_Sphere') {
            this.globeSphereMesh = obj;
          }
        }
      });
      wrapper.add(inst);
      this.globeAxisTiltNode = inst.getObjectByName('Globe_Axis_Tilt') ?? null;
      if (this.globeAxisTiltNode) {
        this.globeAxisBaseZ = this.globeAxisTiltNode.rotation.z;
      }
      this.globeSpinPivot =
        inst.getObjectByName('Globe_Spin_Pivot') ??
        inst.getObjectByName('Globe_Sphere') ??
        inst;
    } else {
      const fallbackTilt = new THREE.Group();
      fallbackTilt.name = 'Globe_Axis_Tilt';
      fallbackTilt.position.set(0, 1.06, 0);
      fallbackTilt.rotation.z = -0.409;
      wrapper.add(fallbackTilt);
      this.globeAxisTiltNode = fallbackTilt;
      this.globeAxisBaseZ = -0.409;

      const fallbackPivot = new THREE.Group();
      fallbackPivot.name = 'Globe_Spin_Pivot';
      fallbackTilt.add(fallbackPivot);
      this.globeSpinPivot = fallbackPivot;

      // Complete fallback equirectangular gold-on-sapphire Earth sphere aligned 1:1 with latLonToSphereVec
      const earthTex = createProceduralGlobeEarthTexture();
      this.globeFallbackEarthTex = earthTex;
      const fallbackSphere = new THREE.Mesh(
        createAlignedGlobeSphereGeometry(GLOBE_SURFACE_RADIUS, 64, 32),
        new THREE.MeshStandardMaterial({
          map: earthTex,
          color: 0xffffff,
          metalness: 0.28,
          roughness: 0.36,
          envMapIntensity: 0.92,
        })
      );
      fallbackSphere.name = 'Globe_Sphere';
      fallbackPivot.add(fallbackSphere);
      this.globeSphereMesh = fallbackSphere;
    }

    // Use 'XYZ' rotation order so Ry(yaw) spins geographic longitude first, then Rx(pitch) tilts toward camera!
    this.globeSpinPivot.rotation.order = 'XYZ';

    // Analytical WebGL2 Tactile Graticule + Peel Latitude Band + Geodesic Target-Ring Overlay (1 mesh, transmission: 0!)
    const { material: tactileMat, uniforms: tactileUniforms } = createGlobeTactileOverlayMaterial();
    const tactileGeo = createAlignedGlobeSphereGeometry(GLOBE_SURFACE_RADIUS + 0.0036, 64, 32);
    const tactileMesh = new THREE.Mesh(tactileGeo, tactileMat);
    tactileMesh.name = 'Globe_Tactile_Graticule_Overlay';
    tactileMesh.renderOrder = 6;
    tactileMesh.visible = false;
    this.globeSpinPivot.add(tactileMesh);
    this.globeTactileOverlayMesh = tactileMesh;
    this.globeTactileUniforms = tactileUniforms;

    // 24K Gold Candidate Beacon Pin + Pulsing Target Ring (GLOBE_PIN_DROP)
    const cand = this.buildGlobeBeaconPin(0xffe488, 0xffbe3b, 0xffdf78, 1.0);
    cand.group.name = 'Globe_Candidate_Beacon';
    this.globeSpinPivot.add(cand.group);
    this.globeCandidateGroup = cand.group;
    this.globeCandidatePulseRing = cand.pulseRing;

    // Emerald Sovereign Target Pin + Pulsing Halo Ring (GLOBE_PIN_DROP Reveal)
    const targ = this.buildGlobeBeaconPin(0x6effc4, 0x22e894, 0x4ef7b2, 1.18);
    targ.group.name = 'Globe_Target_Beacon';
    this.globeSpinPivot.add(targ.group);
    this.globeTargetGroup = targ.group;
    this.globeTargetPulseRing = targ.pulseRing;

    // 3D Great-Circle Geodesic Reveal Arc group
    this.globeRevealArcGroup.name = 'Globe_Reveal_Geodesic_Arc';
    this.globeSpinPivot.add(this.globeRevealArcGroup);

    // Comma-safe Billboarded Troika Reveal Readout (`"FENWAY PARK\n142 km · BULLSEYE"`)
    const revealLbl = createTroikaMesh();
    revealLbl.fontSize = 0.038;
    revealLbl.fontWeight = 'bold';
    revealLbl.lineHeight = 1.24;
    revealLbl.color = 0xfff8dc;
    revealLbl.anchorX = 'center';
    revealLbl.anchorY = 'middle';
    revealLbl.textAlign = 'center';
    revealLbl.outlineWidth = '18%';
    revealLbl.outlineColor = 0x040812;
    revealLbl.outlineOpacity = 0.98;
    revealLbl.visible = false;
    revealLbl.renderOrder = 14;
    this.globeSpinPivot.add(revealLbl);
    this.globeRevealReadout = revealLbl;

    // Attach 8 glowing 3D City Pins + world-space MSDF labels directly onto Globe_Spin_Pivot (r = 0.55m)
    const pinGeo = new THREE.OctahedronGeometry(0.026, 1);
    for (const c of CITY_GLOBE_COORDS) {
      const surfPos = latLonToSphereVec(c.lat, c.lon, 0.566);
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0xffe28a,
        emissive: 0xffb838,
        emissiveIntensity: 2.1,
        metalness: 0.4,
        roughness: 0.15,
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(surfPos);
      pin.lookAt(surfPos.clone().multiplyScalar(2));
      pin.userData = { hitKind: 'GLOBE_PIN', venueCode: c.code };
      this.globeSpinPivot.add(pin);
      this.globePins.set(c.code, pin);

      // #273 Fix #5: Mount city label on radially lifted anchor (r = 0.628) & billboard toward camera in update()
      const lblPos = latLonToSphereVec(c.lat, c.lon, 0.628);
      const cityLbl = createTroikaMesh();
      cityLbl.text = c.label;
      cityLbl.fontSize = 0.032;
      cityLbl.fontWeight = 'bold';
      cityLbl.color = 0xfff5d6;
      cityLbl.anchorX = 'center';
      cityLbl.anchorY = 'middle';
      cityLbl.outlineWidth = '16%';
      cityLbl.outlineColor = 0x050914;
      cityLbl.position.copy(lblPos);
      cityLbl.userData = { outwardDir: lblPos.clone().normalize() };
      cityLbl.sync();
      this.globeSpinPivot.add(cityLbl);
      this.globeCityTexts.push(cityLbl);
    }

    this.globeSpinPivot.add(this.globeArcsGroup);

    // Exact surface-matched invisible raycast sphere (`r = 0.554`) for sub-degree `(lat, lon)` pin drops!
    this.globeHitSphere = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_SURFACE_RADIUS + 0.004, 48, 32),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.globeHitSphere.userData = { hitKind: 'GLOBE_BODY' };
    this.globeSpinPivot.add(this.globeHitSphere);
  }

  public isGlobePinDropMode(): boolean {
    return this.activeArchetype === 'WORLD_GLOBE' && this.globePinDropMode;
  }

  public getGlobeCandidateCoords(): { lat: number; lon: number } | null {
    return this.globeCandidateCoords ? { ...this.globeCandidateCoords } : null;
  }

  private setCampaignGlobeElementsVisible(visible: boolean): void {
    for (const pin of this.globePins.values()) {
      pin.visible = visible;
    }
    for (const lbl of this.globeCityTexts) {
      lbl.visible = visible;
    }
    this.globeArcsGroup.visible = visible;
  }

  public clearGlobePinDropState(): void {
    this.globeCandidateCoords = null;
    if (this.globeCandidateGroup) {
      this.globeCandidateGroup.visible = false;
    }
    if (this.globeTargetGroup) {
      this.globeTargetGroup.visible = false;
    }
    if (this.globeRevealReadout) {
      this.globeRevealReadout.visible = false;
    }
    if (this.globeRevealArcMesh) {
      this.globeRevealArcGroup.remove(this.globeRevealArcMesh);
      this.globeRevealArcMesh.geometry.dispose();
      (this.globeRevealArcMesh.material as THREE.Material).dispose();
      this.globeRevealArcMesh = null;
      this.globeRevealArcTotalIndices = 0;
      this.globeRevealArcAnim = 0;
    }
    if (this.globeTactileUniforms) {
      this.globeTactileUniforms.uHintBandActive.value = 0;
      this.globeTactileUniforms.uRevealActive.value = 0;
    }
  }

  public async configureWorldGlobe(spec: WorldGlobeSpec): Promise<void> {
    await this.ensureGlobeLoaded();

    const isPinDrop = Boolean(spec.pinDropMode || spec.pinDrop);
    this.globePinDropMode = isPinDrop;
    this.globePinDropSpec = spec.pinDrop ?? null;
    this.peelTier = 1;

    if (isPinDrop) {
      if (spec.pinDrop?.domainId !== undefined) {
        this.setDomainPalette(spec.pinDrop.domainId);
      }
      this.setCampaignGlobeElementsVisible(false);
      this.clearGlobePinDropState();

      if (this.globeTactileOverlayMesh && this.globeTactileUniforms) {
        this.globeTactileOverlayMesh.visible = true;
        this.globeTactileUniforms.uModeMix.value = 1.0;
        const pSpec = spec.pinDrop;
        this.globeTactileUniforms.uHintLatDeg.value = pSpec?.targetLat ?? 0;
        this.globeTactileUniforms.uHintBandActive.value = 0;
        this.globeTactileUniforms.uRevealActive.value = 0;
        this.globeTactileUniforms.uBullseyeRad.value =
          (pSpec?.bullseyeKm ?? 300) / EARTH_MEAN_RADIUS_KM;
        this.globeTactileUniforms.uGoldRad.value =
          (pSpec?.goldKm ?? 1000) / EARTH_MEAN_RADIUS_KM;
        this.globeTactileUniforms.uGrazeRad.value =
          (pSpec?.grazeKm ?? 2200) / EARTH_MEAN_RADIUS_KM;
      }

      // Present an inviting neutral Atlantic/Americas/Europe/Africa panorama (never spoiling targetLon!)
      this.globeYawVel = 0;
      this.globePitchVel = 0;
      this.rotateGlobeToLatLon(20, -18, false);

      if (spec.pinDrop?.peelTier === 2 || spec.pinDrop?.peelTier === 3) {
        this.pullGlobePeel(spec.pinDrop.peelTier, false);
      }
      return;
    }

    // Standard Campaign Hub WORLD_GLOBE showcase
    this.clearGlobePinDropState();
    this.setCampaignGlobeElementsVisible(true);
    if (this.globeTactileOverlayMesh && this.globeTactileUniforms) {
      this.globeTactileOverlayMesh.visible = false;
      this.globeTactileUniforms.uModeMix.value = 0;
    }
    this.globePitchVel = 0;
    this.globeTargetPitch = 0;

    if (spec.focusedVenue) {
      this.focusGlobeCity(spec.focusedVenue);
    }

    const arcs: GlobeFlightArcSpec[] =
      spec.customArcs ??
      (spec.showAct1FlightFork !== false
        ? [
            // Signature Act I Flight Fork: Geneva -> London (Sovereign 24K Gold) vs Geneva -> Tokyo (Horizon Cyan-Gold)
            { from: 'ch', to: 'gb', colorHex: 0xffd86b, highlight: true },
            { from: 'ch', to: 'jp', colorHex: 0x5ce8f2, highlight: true },
            { from: 'gb', to: 'br', colorHex: 0xd4a853 },
            { from: 'jp', to: 'br', colorHex: 0xd4a853 },
            { from: 'br', to: 'eg', colorHex: 0xd4a853 },
            { from: 'eg', to: 'is', colorHex: 0x8ef5dc },
            { from: 'is', to: 'sg', colorHex: 0x8ef5dc },
            { from: 'sg', to: 'global', colorHex: 0xffe278 },
          ]
        : []);

    this.setGlobeFlightArcs(arcs);
  }

  /**
   * Smoothly rotates the 3D Globe (`yaw` + clamped `±55°` `pitch`) so `(lat, lon)` faces the camera.
   */
  public rotateGlobeToLatLon(latDeg: number, lonDeg: number, instant = false): void {
    const desiredYaw = -THREE.MathUtils.degToRad(lonDeg);
    this.globeTargetYaw = this.globeYaw + normalizeAngleSigned(desiredYaw - this.globeYaw);
    this.globeTargetPitch = THREE.MathUtils.clamp(
      THREE.MathUtils.degToRad(latDeg),
      -GLOBE_MAX_PITCH_RAD,
      GLOBE_MAX_PITCH_RAD
    );
    this.globeYawVel = 0;
    this.globePitchVel = 0;

    if (instant) {
      this.globeYaw = this.globeTargetYaw;
      this.globePitch = this.globeTargetPitch;
      if (this.globeSpinPivot) {
        this.globeSpinPivot.rotation.set(this.globePitch, this.globeYaw, 0, 'XYZ');
      }
    }
  }

  /**
   * Drops the glowing 24K Gold Candidate Beacon Pin + pulsing target ring at exact `(lat, lon)`
   * on the 3D Globe surface, optionally rotating the globe so that point faces the camera.
   */
  public setGlobeCandidatePin(lat: number, lon: number, rotateToFace = false): void {
    const clampedLat = THREE.MathUtils.clamp(lat, -90, 90);
    const normLon = ((((lon + 180) % 360) + 360) % 360) - 180;
    this.globeCandidateCoords = { lat: clampedLat, lon: normLon };

    if (this.globeCandidateGroup) {
      const unitDir = latLonToSphereVec(clampedLat, normLon, 1.0);
      this.globeCandidateGroup.position.copy(unitDir).multiplyScalar(GLOBE_SURFACE_RADIUS + 0.002);
      this.globeCandidateGroup.quaternion.setFromUnitVectors(this._axisY, unitDir);
      this.globeCandidateGroup.visible = true;
    }

    if (rotateToFace) {
      this.rotateGlobeToLatLon(clampedLat, normLon, false);
    }

    // Crisp miniature gold surface spark where the beacon locks into the globe
    if (this.globeSpinPivot) {
      const localPt = latLonToSphereVec(clampedLat, normLon, GLOBE_SURFACE_RADIUS + 0.04);
      this.globeSpinPivot.updateWorldMatrix(true, false);
      const worldPt = this.globeSpinPivot.localToWorld(localPt);
      const vfxPt = this.vfxGroup.worldToLocal(worldPt);
      this.spawnSparkBurst(vfxPt, 0xffdf78, 16);
    }
  }

  /**
   * Peel Tier 2 / Tier 3 in `GLOBE_PIN_DROP`: illuminates a subtle glowing latitude corridor
   * around `targetLat` (`Tier 2 = ±14° sapphire-gold band`, `Tier 3 = ±5.5° precision gold band`).
   */
  public pullGlobePeel(targetTier?: 2 | 3, withVfx = true): 1 | 2 | 3 {
    const nextTier: 2 | 3 = targetTier ?? (this.peelTier === 1 ? 2 : 3);
    this.peelTier = nextTier;

    if (this.globeTactileUniforms && this.globePinDropSpec) {
      this.globeTactileUniforms.uHintLatDeg.value = this.globePinDropSpec.targetLat;
      if (nextTier === 2) {
        this.globeTactileUniforms.uHintBandActive.value = 0.65;
        this.globeTactileUniforms.uHintBandHalfDeg.value = 14.0;
      } else {
        this.globeTactileUniforms.uHintBandActive.value = 1.0;
        this.globeTactileUniforms.uHintBandHalfDeg.value = 5.5;
        // Gently tilt latitude into view without revealing longitude
        this.globeTargetPitch = THREE.MathUtils.clamp(
          THREE.MathUtils.degToRad(this.globePinDropSpec.targetLat),
          -GLOBE_MAX_PITCH_RAD,
          GLOBE_MAX_PITCH_RAD
        );
      }
    }

    if (withVfx) {
      this.spawnSparkBurst(new THREE.Vector3(0, 0.62, 0.25), 0x62d8ff, 22);
    }
    return this.peelTier;
  }

  /**
   * Reveals the Emerald Sovereign Target Pin, animates a glowing 3D Great-Circle Geodesic Arc
   * from Candidate Pin -> Target Pin above the sphere, pulses Bullseye/Gold radar rings,
   * and shows a comma-safe Troika distance/label readout!
   */
  public revealGlobeTarget(
    targetLat: number,
    targetLon: number,
    candidateLat?: number,
    candidateLon?: number,
    distanceKm?: number,
    targetLabel?: string
  ): void {
    const tLat = THREE.MathUtils.clamp(targetLat, -90, 90);
    const tLon = ((((targetLon + 180) % 360) + 360) % 360) - 180;
    const tDir = latLonToSphereVec(tLat, tLon, 1.0);

    // 1. Place Emerald Sovereign Target Pin
    if (this.globeTargetGroup) {
      this.globeTargetGroup.position.copy(tDir).multiplyScalar(GLOBE_SURFACE_RADIUS + 0.002);
      this.globeTargetGroup.quaternion.setFromUnitVectors(this._axisY, tDir);
      this.globeTargetGroup.visible = true;
    }

    // 2. Sync Candidate Pin if coordinates provided (or reuse tapped candidate pin)
    const cLat = candidateLat ?? this.globeCandidateCoords?.lat;
    const cLon = candidateLon ?? this.globeCandidateCoords?.lon;
    const hasCandidate = cLat !== undefined && cLon !== undefined;
    if (hasCandidate && candidateLat !== undefined && candidateLon !== undefined) {
      this.globeCandidateCoords = { lat: cLat, lon: cLon };
      if (this.globeCandidateGroup) {
        const cDir = latLonToSphereVec(cLat, cLon, 1.0);
        this.globeCandidateGroup.position.copy(cDir).multiplyScalar(GLOBE_SURFACE_RADIUS + 0.002);
        this.globeCandidateGroup.quaternion.setFromUnitVectors(this._axisY, cDir);
        this.globeCandidateGroup.visible = true;
      }
    }

    // 3. Compute Haversine distance if omitted
    const resolvedKm =
      distanceKm !== undefined
        ? distanceKm
        : hasCandidate
          ? computeGreatCircleDistanceKm(cLat, cLon, tLat, tLon)
          : undefined;

    // 4. Activate concentric geodesic tolerance rings on tactile shader overlay
    const bullKm = this.globePinDropSpec?.bullseyeKm ?? 300;
    const goldKm = this.globePinDropSpec?.goldKm ?? 1000;
    const grazeKm = this.globePinDropSpec?.grazeKm ?? 2200;
    if (this.globeTactileUniforms) {
      this.globeTactileUniforms.uTargetDir.value.copy(tDir);
      this.globeTactileUniforms.uBullseyeRad.value = bullKm / EARTH_MEAN_RADIUS_KM;
      this.globeTactileUniforms.uGoldRad.value = goldKm / EARTH_MEAN_RADIUS_KM;
      this.globeTactileUniforms.uGrazeRad.value = grazeKm / EARTH_MEAN_RADIUS_KM;
      this.globeTactileUniforms.uRevealActive.value = 1.0;
    }

    // 5. Build glowing 3D Great-Circle SLERP Geodesic Arc connecting Candidate -> Target
    if (this.globeRevealArcMesh) {
      this.globeRevealArcGroup.remove(this.globeRevealArcMesh);
      this.globeRevealArcMesh.geometry.dispose();
      (this.globeRevealArcMesh.material as THREE.Material).dispose();
      this.globeRevealArcMesh = null;
      this.globeRevealArcTotalIndices = 0;
    }

    if (hasCandidate) {
      const cDir = latLonToSphereVec(cLat, cLon, 1.0);
      const dot = THREE.MathUtils.clamp(cDir.dot(tDir), -1, 1);
      const omega = Math.acos(dot);

      if (omega > 0.002) {
        const samples = 40;
        const pts: THREE.Vector3[] = [];
        const lift = THREE.MathUtils.clamp(omega * 0.145, 0.048, 0.25);

        // Handle near-antipodal points cleanly with deterministic orthogonal great-circle plane
        let ortho: THREE.Vector3 | null = null;
        if (Math.sin(omega) < 1e-4) {
          const ref = Math.abs(cDir.y) < 0.9 ? this._axisY : this._axisX;
          ortho = new THREE.Vector3().crossVectors(cDir, ref).normalize();
        }

        const sinOmega = Math.sin(omega);
        for (let i = 0; i <= samples; i++) {
          const t = i / samples;
          const dir = new THREE.Vector3();
          if (ortho) {
            dir
              .copy(cDir)
              .multiplyScalar(Math.cos(omega * t))
              .addScaledVector(ortho, Math.sin(omega * t))
              .normalize();
          } else {
            const w0 = Math.sin((1 - t) * omega) / sinOmega;
            const w1 = Math.sin(t * omega) / sinOmega;
            dir.copy(cDir).multiplyScalar(w0).addScaledVector(tDir, w1).normalize();
          }
          const r = GLOBE_SURFACE_RADIUS + 0.006 + Math.sin(Math.PI * t) * lift;
          pts.push(dir.multiplyScalar(r));
        }

        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.0076, 8, false);
        const isHit = resolvedKm === undefined || resolvedKm <= grazeKm;
        const tubeMat = new THREE.MeshBasicMaterial({
          color: isHit ? 0x5ef7b4 : 0xffbe55,
          transparent: true,
          opacity: 0.94,
        });
        const arcMesh = new THREE.Mesh(tubeGeo, tubeMat);
        arcMesh.renderOrder = 10;
        const idxAttr = tubeGeo.getIndex();
        this.globeRevealArcTotalIndices = idxAttr ? idxAttr.count : 0;
        if (this.globeRevealArcTotalIndices > 0) {
          tubeGeo.setDrawRange(0, 0);
        }
        this.globeRevealArcAnim = 0.01;
        this.globeRevealArcGroup.add(arcMesh);
        this.globeRevealArcMesh = arcMesh;
      }

      // Smoothly orient globe toward weighted midpoint (68% target, 32% candidate) so both pins + arc frame cleanly
      const focusVec = tDir.clone().multiplyScalar(0.68).addScaledVector(cDir, 0.32);
      if (focusVec.lengthSq() > 0.04) {
        const focusLL = sphereVecToLatLon(focusVec);
        this.rotateGlobeToLatLon(focusLL.lat, focusLL.lon, false);
      } else {
        this.rotateGlobeToLatLon(tLat, tLon, false);
      }
    } else {
      this.rotateGlobeToLatLon(tLat, tLon, false);
    }

    // 6. Position & sync comma-safe Troika distance/label readout floating cleanly above the target pin
    if (this.globeRevealReadout) {
      const labelStr = formatGlobeRevealReadout(
        targetLabel ?? this.globePinDropSpec?.targetLabel ?? 'TARGET',
        resolvedKm,
        bullKm,
        goldKm,
        grazeKm
      );
      this.globeRevealReadout.text = labelStr;
      this.globeRevealReadout.color =
        resolvedKm !== undefined && resolvedKm > grazeKm ? 0xffc87a : 0x8cffd2;
      this.globeRevealReadout.position.copy(tDir).multiplyScalar(GLOBE_SURFACE_RADIUS + 0.165);
      this.globeRevealReadoutOutward.copy(tDir);
      this.globeRevealReadout.visible = true;
      this.globeRevealReadout.sync();
    }

    // 7. Emerald / Gold burst right at target pin
    if (this.globeSpinPivot) {
      this.globeSpinPivot.updateWorldMatrix(true, false);
      const worldPt = this.globeSpinPivot.localToWorld(
        tDir.clone().multiplyScalar(GLOBE_SURFACE_RADIUS + 0.06)
      );
      const vfxPt = this.vfxGroup.worldToLocal(worldPt);
      const burstColor =
        resolvedKm !== undefined && resolvedKm > grazeKm ? 0xff5a52 : 0x4ef7b2;
      this.spawnSparkBurst(vfxPt, burstColor, 34);
    }
  }

  /**
   * Direct surface raycast against the 3D Globe sphere mesh returning exact `(lat, lon)` degrees
   * (`-90..90`, `-180..180`) in `Globe_Spin_Pivot` local space.
   */
  public raycastGlobeSurface(raycaster: THREE.Raycaster): { lat: number; lon: number } | null {
    if (!this.globeSpinPivot || !this.globeGroup.visible) return null;
    this.globeSpinPivot.updateWorldMatrix(true, true);
    const targetMesh = this.globeHitSphere ?? this.globeSphereMesh;
    if (!targetMesh) return null;

    const hits = raycaster.intersectObject(targetMesh, false);
    if (hits.length === 0) return null;

    const localPoint = this.globeSpinPivot.worldToLocal(hits[0].point.clone());
    return sphereVecToLatLon(localPoint);
  }

  public focusGlobeCity(venue: VenueCode): void {
    this.focusedGlobeVenue = venue;
    const entry = CITY_GLOBE_COORDS.find((c) => c.code === venue);
    if (entry) {
      const desired = -THREE.MathUtils.degToRad(entry.lon);
      this.globeTargetYaw = this.globeYaw + normalizeAngleSigned(desired - this.globeYaw);
    }

    for (const [code, pin] of this.globePins.entries()) {
      const active = code === venue;
      pin.scale.setScalar(active ? 1.48 : 0.95);
      const mat = pin.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(active ? 0x5ef7b4 : 0xffb838);
      mat.emissiveIntensity = active ? 3.2 : 1.7;
    }
  }

  public setGlobeFlightArcs(arcs: GlobeFlightArcSpec[]): void {
    disposeObject3D(this.globeArcsGroup);
    while (this.globeArcsGroup.children.length > 0) {
      this.globeArcsGroup.remove(this.globeArcsGroup.children[0]);
    }

    for (const arc of arcs) {
      const a = CITY_GLOBE_COORDS.find((c) => c.code === arc.from);
      const b = CITY_GLOBE_COORDS.find((c) => c.code === arc.to);
      if (!a || !b) continue;

      const pStart = latLonToSphereVec(a.lat, a.lon, 0.562);
      const pEnd = latLonToSphereVec(b.lat, b.lon, 0.562);
      const chordDist = pStart.distanceTo(pEnd);
      const mid = pStart
        .clone()
        .add(pEnd)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(0.57 + chordDist * 0.26);

      const curve = new THREE.QuadraticBezierCurve3(pStart, mid, pEnd);
      const tubeGeo = new THREE.TubeGeometry(
        curve,
        36,
        arc.highlight ? 0.0075 : 0.0045,
        8,
        false
      );
      const tubeMat = new THREE.MeshBasicMaterial({
        color: arc.colorHex ?? 0xffd86b,
        transparent: true,
        opacity: arc.highlight ? 0.92 : 0.45,
      });
      this.globeArcsGroup.add(new THREE.Mesh(tubeGeo, tubeMat));
    }
  }

  public applyGlobeDrag(
    deltaYaw: number,
    velYaw: number,
    deltaPitch = 0,
    velPitch = 0
  ): void {
    this.isDraggingGlobe = true;
    this.globeYaw += deltaYaw;
    this.globeTargetYaw = this.globeYaw;
    this.globeYawVel = velYaw;
    if (this.globePinDropMode) {
      this.globePitch = THREE.MathUtils.clamp(
        this.globePitch + deltaPitch,
        -GLOBE_MAX_PITCH_RAD,
        GLOBE_MAX_PITCH_RAD
      );
      this.globeTargetPitch = this.globePitch;
      this.globePitchVel = velPitch;
    }
  }

  public releaseGlobeDrag(): void {
    this.isDraggingGlobe = false;
  }

  public applyInspectDrag(deltaYaw: number, vel: number): void {
    this.isDraggingInspect = true;
    this.freeInspectYaw += deltaYaw;
    this.freeInspectVel = vel;
  }

  public releaseInspectDrag(): void {
    this.isDraggingInspect = false;
  }

  public getFreeInspectYaw(): number {
    return this.freeInspectYaw;
  }

  /**
   * Enables smooth continuous turntable revolution + direct 1-finger touch/mouse drag spin
   * on the Start Screen (`TITLE_ESTABLISHING`). Disabling immediately resets `prismFloatBody.rotation.y`
   * to `0` so live gameplay Sightline Lock alignment remains exact.
   */
  public setTitleShowcaseOrbit(enabled: boolean): void {
    this.titleShowcaseOrbit = enabled;
    if (!enabled) {
      this.prismFloatBody.rotation.y = 0;
    }
  }

  private async configureTrophy(domainId: number): Promise<void> {
    this.setDomainPalette(domainId);
    if (this.trophyLoaded) return;
    const tpl = await this.venueLoader.loadGlbTemplate(
      'assets/aaa_models/championship_trophy.glb'
    );
    if (this.trophyLoaded || !tpl) return;
    this.trophyLoaded = true;

    const inst = tpl.clone(true);
    inst.scale.setScalar(0.95);
    inst.traverse((n) => {
      if (n instanceof THREE.Mesh) {
        n.castShadow = false;
        n.userData = { hitKind: 'ARTIFACT' };
        const remap = (m: THREE.Material) => {
          if (m instanceof THREE.MeshStandardMaterial) {
            return upgradeToHorologicalPhysicalMaterial(m, 'AUTO', 0.94, 0.42);
          }
          return m;
        };
        n.material = Array.isArray(n.material) ? n.material.map(remap) : remap(n.material);
      }
    });
    this.trophyGroup.add(inst);
    this.trophyCrown = inst.getObjectByName('Trophy_Crown_Ring') ?? null;
    this.trophyRingOuter = inst.getObjectByName('Trophy_Astrolabe_Ring_Outer') ?? null;
    this.trophyRingInner = inst.getObjectByName('Trophy_Astrolabe_Ring_Inner') ?? null;
    this.trophyStarCore = inst.getObjectByName('Trophy_Star_Core') ?? null;
  }

  private async configureIdleOrb(domainId: number): Promise<void> {
    this.setDomainPalette(domainId);
    if (this.orbLoaded) return;
    const tpl = await this.venueLoader.loadGlbTemplate(
      'assets/aaa_models/veritas_astrolabe_orb.glb'
    );
    if (this.orbLoaded || !tpl) return;
    this.orbLoaded = true;

    const inst = tpl.clone(true);
    inst.traverse((n) => {
      if (n instanceof THREE.Mesh) {
        n.castShadow = false;
        n.userData = { hitKind: 'ARTIFACT' };
        const remap = (m: THREE.Material) => {
          if (m instanceof THREE.MeshStandardMaterial) {
            return upgradeToHorologicalPhysicalMaterial(m, 'AUTO', 0.94, 0.45);
          }
          return m;
        };
        n.material = Array.isArray(n.material) ? n.material.map(remap) : remap(n.material);
      }
    });
    this.orbGroup.add(inst);
    this.orbRingOuter = inst.getObjectByName('Ring_Outer') ?? null;
    this.orbRingMid = inst.getObjectByName('Ring_Mid') ?? null;
    this.orbRingInner = inst.getObjectByName('Ring_Inner') ?? null;
    this.orbCrystalCore = inst.getObjectByName('Crystal_Core') ?? null;
  }

  private async configureDiplomaticPassport(openCover = true): Promise<void> {
    this.passportCoverTargetOpen = openCover ? 1.0 : 0.0;
    if (this.passportLoaded) return;
    const tpl = await this.venueLoader.loadGlbTemplate(
      RELIC_GLB_PATHS.meridian_passport_3d
    );
    if (this.passportLoaded || !tpl) return;
    this.passportLoaded = true;

    const inst = tpl.clone(true);
    // #273 Fix #5: Heroic presentation showcasing the 24K embossed Meridian Crest front cover + subtly ajar parchment
    inst.position.set(0, 0.42, 0);
    inst.rotation.x = 0.62;
    inst.scale.setScalar(1.36);
    inst.traverse((n) => {
      if (n instanceof THREE.Mesh) {
        n.castShadow = false;
        n.userData = { hitKind: 'ARTIFACT' };
        if (n.material instanceof THREE.MeshStandardMaterial) {
          n.material = upgradeToHorologicalPhysicalMaterial(n.material, 'AUTO', 0.94, 0.45);
        }
      }
    });

    // Crisp engraved gold charter inscription on inner parchment spread (so peeking inside is never blank white)
    const innerCharter = createTroikaMesh();
    innerCharter.text = 'THE MERIDIAN\nDIPLOMATIC CREDENTIAL\nGENEVA CHARTER · ART. I';
    innerCharter.fontSize = 0.014;
    innerCharter.fontWeight = 'bold';
    innerCharter.lineHeight = 1.4;
    innerCharter.textAlign = 'center';
    innerCharter.anchorX = 'center';
    innerCharter.anchorY = 'middle';
    innerCharter.color = 0x8b6724;
    innerCharter.rotation.x = -Math.PI * 0.5;
    innerCharter.position.set(0, 0.044, 0.01);
    innerCharter.sync();
    inst.add(innerCharter);
    this.passportInnerCharterText = innerCharter;

    this.passportGroup.add(inst);
    this.passportCoverNode = inst.getObjectByName('Passport_Cover') ?? null;
  }

  // ============================================================================
  // RAYCASTING & 3D CRYSTAL SHARD / SPARK VFX
  // ============================================================================

  public raycastAction(raycaster: THREE.Raycaster): RaycastHitResult | null {
    if (this.activeArchetype === 'SIGHTLINE_LOCK') {
      const targets: THREE.Object3D[] = [];
      if (this.crownHitbox) targets.push(this.crownHitbox);
      for (const f of this.facets) {
        if (!f.eliminated) targets.push(f.hitbox);
      }
      const hits = raycaster.intersectObjects(targets, false);
      if (hits.length > 0) {
        const ud = hits[0].object.userData;
        if (ud.hitKind === 'CROWN') return { kind: 'CROWN' };
        if (ud.hitKind === 'FACET') return { kind: 'FACET', facetIndex: ud.facetIndex };
      }
    } else if (this.activeArchetype === 'CODEX_DUAL_RING') {
      const targets: THREE.Object3D[] = [];
      if (this.codexTopHitbox) targets.push(this.codexTopHitbox);
      if (this.codexBottomHitbox) targets.push(this.codexBottomHitbox);
      const hits = raycaster.intersectObjects(targets, false);
      if (hits.length > 0) {
        return { kind: hits[0].object.userData.hitKind };
      }
    } else if (this.activeArchetype === 'CALIBRATOR_DIAL' && this.calibratorHitbox) {
      if (raycaster.intersectObject(this.calibratorHitbox, false).length > 0) {
        return { kind: 'CALIBRATOR' };
      }
    } else if (this.activeArchetype === 'GAUNTLET_SHATTER' && this.gauntletHitbox) {
      if (raycaster.intersectObject(this.gauntletHitbox, false).length > 0) {
        return { kind: 'GAUNTLET' };
      }
    } else if (this.activeArchetype === 'WORLD_GLOBE') {
      if (this.globePinDropMode) {
        const coords = this.raycastGlobeSurface(raycaster);
        if (coords) {
          return { kind: 'GLOBE_BODY', globeCoords: coords };
        }
        return null;
      }
      const pinList = Array.from(this.globePins.values());
      const pinHits = raycaster.intersectObjects(pinList, false);
      if (pinHits.length > 0) {
        return { kind: 'GLOBE_PIN', venueCode: pinHits[0].object.userData.venueCode };
      }
      if (this.globeHitSphere && raycaster.intersectObject(this.globeHitSphere, false).length > 0) {
        return { kind: 'GLOBE_BODY' };
      }
    }
    return null;
  }

  private spawnCrystalShards(
    origin: THREE.Vector3,
    impulseDir: THREE.Vector3,
    colorHex: number,
    count = 26
  ): void {
    const dirNorm = impulseDir.clone().normalize();
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.55,
        metalness: 0.18,
        roughness: 0.1,
        transmission: 0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.06,
        ior: 1.52,
        transparent: true,
        opacity: 0.88,
      });
      const shard = new THREE.Mesh(this.shardGeometry, mat);
      shard.position.set(
        origin.x + (Math.random() - 0.5) * 0.24,
        origin.y + (Math.random() - 0.5) * 0.14,
        origin.z + (Math.random() - 0.5) * 0.08
      );
      shard.scale.setScalar(0.55 + Math.random() * 0.55);
      shard.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      this.vfxGroup.add(shard);

      const speed = 1.15 + Math.random() * 1.95;
      const vel = new THREE.Vector3(
        dirNorm.x * speed + (Math.random() - 0.5) * 1.1,
        dirNorm.y * speed + 0.55 + Math.random() * 0.9,
        dirNorm.z * speed + (Math.random() - 0.5) * 0.9
      );
      const rotVel = new THREE.Vector3(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 14
      );
      this.activeShards.push({
        mesh: shard,
        vel,
        rotVel,
        life: 0,
        maxLife: 0.95 + Math.random() * 0.45,
      });
    }
  }

  public spawnSparkBurst(origin: THREE.Vector3, colorHex: number, count = 32): void {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = origin.x;
      positions[i3 + 1] = origin.y;
      positions[i3 + 2] = origin.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const spd = 0.65 + Math.random() * 1.85;
      velocities[i3] = Math.sin(phi) * Math.cos(theta) * spd;
      velocities[i3 + 1] = Math.abs(Math.cos(phi)) * spd + 0.35;
      velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * spd;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: colorHex,
      map: getRadialSparkTexture(this.baseUrl),
      size: 0.022,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    this.vfxGroup.add(points);
    this.activeBursts.push({ points, velocities, life: 0, maxLife: 0.85 });
  }

  // ============================================================================
  // FRAME UPDATE
  // ============================================================================

  public update(dt: number, camera?: THREE.Camera): void {
    this.elapsed += dt;
    const smoothFast = 1 - Math.exp(-dt * 11.0);
    const smoothMed = 1 - Math.exp(-dt * 6.5);

    if (Math.abs(this.morphTransitionScale - 1.0) > 0.001) {
      this.morphTransitionScale = THREE.MathUtils.lerp(
        this.morphTransitionScale,
        1.0,
        smoothFast
      );
      this.root.scale.setScalar(this.morphTransitionScale);
    }

    this.sightlineBeamMat.uniforms.uTime.value = this.elapsed;

    // Gentle horological magnetic levitation
    const floatY = Math.sin(this.elapsed * 1.45) * 0.014;
    const shadowScale = 1.0 - floatY * 1.8;
    this.contactShadow.scale.setScalar(shadowScale);

    // 1. Update SIGHTLINE_LOCK Veritas Prism
    if (this.prismGroup.visible) {
      this.prismFloatBody.position.y = floatY;

      if (this.titleShowcaseOrbit) {
        if (!this.isDraggingInspect) {
          this.freeInspectYaw += (this.freeInspectVel + 0.28) * dt;
          this.freeInspectVel *= Math.exp(-dt * 4.0);
        }
        this.prismFloatBody.rotation.y = this.freeInspectYaw;
      } else if (this.prismFloatBody.rotation.y !== 0) {
        this.prismFloatBody.rotation.y = 0;
      }

      if (!this.isDraggingCarousel) {
        const prevYaw = this.carouselYaw;
        this.carouselYaw = THREE.MathUtils.lerp(
          this.carouselYaw,
          this.targetCarouselYaw,
          smoothFast
        );
        if (Math.abs(this.carouselYaw - prevYaw) > 0.0005) {
          this.checkCarouselDetentTick(Math.abs(this.carouselYaw - prevYaw) / Math.max(0.001, dt));
        }
      }
      if (this.facetCarousel) {
        this.facetCarousel.rotation.y = this.carouselYaw;
      }

      // Tourbillon gimbals (#132 fix):
      // - Gimbal_Outer stays strictly near XY silhouette plane (±0.08 rad) framing left/right
      // - Gimbal_Equatorial tilts front arc permanently BELOW the Sightline window (y=0.32m) and spins ONLY
      //   around its own normal axis (local Z), so it NEVER crosses (0, 0.50, +0.34) front text!
      if (this.gimbalOuter) {
        this.gimbalOuter.rotation.set(0, Math.sin(this.elapsed * 0.42) * 0.08, 0);
      }
      if (this.gimbalEquatorial) {
        const expandScale = 1 + 0.12 * this.blueprintExpandAnim;
        this.gimbalEquatorial.scale.setScalar(expandScale);
        this._qTmpA.setFromAxisAngle(this._axisX, Math.PI * 0.5 + 0.46);
        this._qTmpB.setFromAxisAngle(
          this._axisZ,
          -this.carouselYaw * 0.35 + this.elapsed * 0.24
        );
        this.gimbalEquatorial.quaternion.copy(this._qTmpA).multiply(this._qTmpB);
      }

      // Brass Crown Peel pneumatic slide
      this.crownPullOffset = THREE.MathUtils.lerp(
        this.crownPullOffset,
        this.targetCrownPullOffset,
        smoothFast
      );
      if (this.brassCrown) {
        this.brassCrown.position.y = this.brassCrownBaseY + this.crownPullOffset;
      }

      // 6 Obsidian Shutters spiral/bloom open using quaternion-safe local X tilt
      this.shutterOpenAnim = THREE.MathUtils.lerp(
        this.shutterOpenAnim,
        this.targetShutterOpen,
        smoothMed
      );
      this.blueprintExpandAnim = THREE.MathUtils.lerp(
        this.blueprintExpandAnim,
        this.targetBlueprintExpand,
        smoothMed
      );

      for (const sh of this.shutters) {
        this._qTmpA.setFromAxisAngle(this._axisX, -this.shutterOpenAnim);
        sh.node.quaternion.copy(sh.baseQuat).multiply(this._qTmpA);
        this._vTmpA
          .set(0, 0, 0.042 * this.shutterOpenAnim + 0.035 * this.blueprintExpandAnim)
          .applyQuaternion(sh.baseQuat);
        sh.node.position.copy(sh.basePos).add(this._vTmpA);
      }

      // Hologram Core rotation & core luminescence
      if (this.activeHologramGlyph && this.activeHologramGlyph.visible) {
        this.activeHologramGlyph.rotation.y = this.elapsed * 0.95;
        this.activeHologramGlyph.rotation.z = Math.sin(this.elapsed * 0.8) * 0.12;
      }
      if (this.hologramCoreAnchor) {
        this.hologramCoreAnchor.rotation.y = -this.elapsed * 0.55;
      }
      this.corePointLight.intensity =
        this.peelTier >= 2 ? 1.05 + 0.2 * Math.sin(this.elapsed * 3.2) : 0.25;

      // Overclock Jaw compression + Firing Pin slam
      this.overclockCharge = THREE.MathUtils.lerp(
        this.overclockCharge,
        this.targetOverclockCharge,
        smoothFast
      );
      const jawVibration =
        this.overclockCharge > 0.25
          ? Math.sin(this.elapsed * 52.0) * 0.0022 * this.overclockCharge
          : 0;
      for (const jw of this.jaws) {
        this._vTmpA
          .set(0, 0, -(0.048 * this.overclockCharge) + jawVibration)
          .applyQuaternion(jw.baseQuat);
        jw.node.position.copy(jw.basePos).add(this._vTmpA);
      }

      if (this.firingPin) {
        if (this.firingPinSlamAnim > 0.001) {
          this.firingPinSlamAnim *= Math.exp(-dt * 9.0);
          this.firingPin.position.y = this.firingPinBaseY - 0.062 * this.firingPinSlamAnim;
        } else {
          this.firingPin.position.y = this.firingPinBaseY + 0.045 * this.overclockCharge;
        }
      }

      // Update per-facet Sightline focus, oblique dimming (45-60%), & shader uniforms
      const effectivePrismYaw = this.carouselYaw + this.prismFloatBody.rotation.y;
      for (const f of this.facets) {
        if (f.eliminated) continue;
        const u = f.crystalHandle.uniforms;
        u.uTime.value = this.elapsed;

        const alignCos = Math.cos(effectivePrismYaw + f.baseAngle);
        const sightlineFocus = THREE.MathUtils.smoothstep(alignCos, 0.35, 0.96);
        u.uSightlineFocus.value = sightlineFocus;
        u.uOverclockCharge.value = sightlineFocus > 0.7 ? this.overclockCharge : 0;

        if (u.uBackfirePulse.value > 0.002) {
          u.uBackfirePulse.value *= Math.exp(-dt * 2.6);
        } else {
          u.uBackfirePulse.value = 0;
        }
        if (u.uResonanceFlash.value > 0.002) {
          u.uResonanceFlash.value = Math.max(0.28, u.uResonanceFlash.value * Math.exp(-dt * 1.8));
        }

        // Exact #111 spec: front Sightline facet sharp & bright (100%), flanking facets at ~52% dimness, rear dim
        const textAlpha =
          alignCos >= 0
            ? THREE.MathUtils.lerp(0.52, 1.0, sightlineFocus)
            : THREE.MathUtils.lerp(0.52, 0.18, Math.min(1, -alignCos));
        f.answerText.fillOpacity = textAlpha;
        f.answerText.outlineOpacity = textAlpha * 0.95;
        f.badgeText.fillOpacity = THREE.MathUtils.lerp(0.48, 1.0, sightlineFocus);

        const popScale = 1.0 + 0.038 * sightlineFocus;
        f.node.scale.setScalar(popScale);
      }

      // Gently levitate & pop-in the floating Sapphire Hologram Blueprint Plate
      if (this.visualPlateGroup && this.visualPlateGroup.visible) {
        if (this.visualPlateRevealAnim > 0 && this.visualPlateRevealAnim < 1) {
          this.visualPlateRevealAnim = Math.min(1, this.visualPlateRevealAnim + dt * 5.2);
          const eased = 1 - Math.pow(1 - this.visualPlateRevealAnim, 3);
          this.visualPlateGroup.scale.setScalar(THREE.MathUtils.lerp(0.86, 1.0, eased));
        }
        this.visualPlateGroup.position.y = 0.77 + Math.sin(this.elapsed * 2.1) * 0.006;
      }
    }

    // 2. Update CODEX_DUAL_RING
    if (this.codexGroup.visible) {
      this.codexGroup.position.y = floatY * 0.6;
      this.codexTopYaw = THREE.MathUtils.lerp(this.codexTopYaw, this.codexTargetTopYaw, smoothFast);
      this.codexBottomYaw = THREE.MathUtils.lerp(
        this.codexBottomYaw,
        this.codexTargetBottomYaw,
        smoothFast
      );
      if (this.codexTopRing) this.codexTopRing.rotation.y = this.codexTopYaw;
      if (this.codexBottomRing) this.codexBottomRing.rotation.y = this.codexBottomYaw;
      if (this.codexMidRing) {
        this.codexMidRing.rotation.y = -0.5 * (this.codexTopYaw + this.codexBottomYaw);
      }
    }

    // 3. Update CALIBRATOR_DIAL
    if (this.calibratorGroup.visible) {
      this.calNeedleAngle = THREE.MathUtils.lerp(
        this.calNeedleAngle,
        this.calTargetNeedleAngle,
        smoothFast
      );
      if (this.calibratorNeedle) {
        this.calibratorNeedle.rotation.z = this.calNeedleAngle;
      }
      if (this.calibratorSectorMesh) {
        this.calibratorSectorMesh.rotation.z = this.calNeedleAngle;
      }
    }

    // 4. Update GAUNTLET_SHATTER drop physics
    if (this.gauntletGroup.visible && this.gauntletPlateHolder.visible) {
      this.gauntletDropY = THREE.MathUtils.lerp(this.gauntletDropY, 0, smoothFast);
      this.gauntletPlateHolder.position.y = 0.5 + this.gauntletDropY + floatY * 0.7;
      if (this.gauntletPlateCrystal) {
        this.gauntletPlateCrystal.uniforms.uTime.value = this.elapsed;
      }
    }

    // 5. Update HERO RELIC / GLOBE / TROPHY / ORB + Live Latch_0..2 Actuation (#190 [P1])
    if (this.relicGroup.visible) {
      if (!this.isDraggingInspect) {
        this.freeInspectYaw += (this.freeInspectVel + 0.38) * dt;
        this.freeInspectVel *= Math.exp(-dt * 4.0);
      }
      this.relicSpinHolder.rotation.y = this.freeInspectYaw;
      this.relicSpinHolder.position.y = floatY;
    }

    if (this.relicLatchNodes.length > 0 && (this.relicGroup.visible || this.prismGroup.visible)) {
      for (let i = 0; i < this.relicLatchNodes.length && i < 3; i++) {
        const entry = this.relicLatchNodes[i];
        const targetOpen = i < this.relicLatchOpenCount ? 1.0 : 0.0;
        this.relicLatchAnim[i] = THREE.MathUtils.lerp(
          this.relicLatchAnim[i],
          targetOpen,
          smoothMed
        );
        const amt = this.relicLatchAnim[i];
        this._eulerTmp.set(amt * 0.42, amt * 0.65, 0);
        this._qTmpA.setFromEuler(this._eulerTmp);
        entry.node.quaternion.copy(entry.baseQuat).multiply(this._qTmpA);
      }
    }

    if (this.globeGroup.visible && this.globeSpinPivot) {
      // Smoothly upright Globe_Axis_Tilt in GLOBE_PIN_DROP mode vs regal -23.4° axial tilt in Campaign Hub
      if (this.globeAxisTiltNode) {
        const desiredTiltZ = this.globePinDropMode ? 0 : this.globeAxisBaseZ;
        this.globeAxisTiltNode.rotation.z = THREE.MathUtils.lerp(
          this.globeAxisTiltNode.rotation.z,
          desiredTiltZ,
          smoothMed
        );
      }

      if (!this.isDraggingGlobe) {
        if (Math.abs(this.globeYawVel) > 0.04) {
          this.globeYaw += this.globeYawVel * dt;
          this.globeYawVel *= Math.exp(-dt * 3.6);
          this.globeTargetYaw = this.globeYaw;
        } else {
          this.globeYaw = THREE.MathUtils.lerp(this.globeYaw, this.globeTargetYaw, smoothMed);
        }

        if (this.globePinDropMode) {
          if (Math.abs(this.globePitchVel) > 0.04) {
            this.globePitch = THREE.MathUtils.clamp(
              this.globePitch + this.globePitchVel * dt,
              -GLOBE_MAX_PITCH_RAD,
              GLOBE_MAX_PITCH_RAD
            );
            this.globePitchVel *= Math.exp(-dt * 4.4);
            this.globeTargetPitch = this.globePitch;
          } else {
            this.globePitch = THREE.MathUtils.lerp(this.globePitch, this.globeTargetPitch, smoothMed);
          }
        } else {
          this.globePitchVel = 0;
          this.globePitch = THREE.MathUtils.lerp(this.globePitch, 0, smoothMed);
        }
      }
      this.globeSpinPivot.rotation.set(this.globePitch, this.globeYaw, 0, 'XYZ');

      if (this.globeTactileUniforms && this.globeTactileOverlayMesh?.visible) {
        this.globeTactileUniforms.uTime.value = this.elapsed;
      }

      // Pulse Candidate & Target Beacon Rings in GLOBE_PIN_DROP mode
      if (this.globeCandidateGroup?.visible && this.globeCandidatePulseRing) {
        const phase = (this.elapsed * 1.45) % 1.0;
        const ringScale = 1.0 + phase * 0.85;
        this.globeCandidatePulseRing.scale.setScalar(ringScale);
        (this.globeCandidatePulseRing.material as THREE.MeshBasicMaterial).opacity =
          (1.0 - phase) * 0.82;
      }
      if (this.globeTargetGroup?.visible && this.globeTargetPulseRing) {
        const phase = (this.elapsed * 1.6 + 0.45) % 1.0;
        const ringScale = 1.0 + phase * 1.05;
        this.globeTargetPulseRing.scale.setScalar(ringScale);
        (this.globeTargetPulseRing.material as THREE.MeshBasicMaterial).opacity =
          (1.0 - phase) * 0.88;
      }

      // Animate glowing 3D Great-Circle Geodesic Reveal Arc draw progress (0 -> 1 over ~0.45s)
      if (
        this.globeRevealArcMesh &&
        this.globeRevealArcTotalIndices > 0 &&
        this.globeRevealArcAnim > 0 &&
        this.globeRevealArcAnim < 1
      ) {
        this.globeRevealArcAnim = Math.min(1, this.globeRevealArcAnim + dt * 2.35);
        const eased = 1 - Math.pow(1 - this.globeRevealArcAnim, 3);
        const drawCount = Math.floor(eased * this.globeRevealArcTotalIndices);
        this.globeRevealArcMesh.geometry.setDrawRange(0, drawCount - (drawCount % 3));
      }

      // Billboard camera-facing Troika labels (Campaign Hub cities OR Pin-Drop Reveal readout)
      if (camera) {
        this.globeSpinPivot.updateWorldMatrix(true, false);
        this.globeSpinPivot.getWorldQuaternion(this._qTmpA);
        this._qTmpB.copy(this._qTmpA).invert().multiply(camera.quaternion);
        camera.getWorldPosition(this._vTmpC);

        if (!this.globePinDropMode && this.globeCityTexts.length > 0) {
          for (const lbl of this.globeCityTexts) {
            lbl.quaternion.copy(this._qTmpB);
            const outward = lbl.userData.outwardDir as THREE.Vector3 | undefined;
            if (outward) {
              this._vTmpA.copy(outward).applyQuaternion(this._qTmpA).normalize();
              lbl.getWorldPosition(this._vTmpB);
              this._vTmpB.subVectors(this._vTmpC, this._vTmpB).normalize();
              const facing = this._vTmpA.dot(this._vTmpB);
              if (facing > 0.08) {
                lbl.visible = true;
                const alpha = THREE.MathUtils.smoothstep(facing, 0.08, 0.34);
                lbl.fillOpacity = alpha;
                lbl.outlineOpacity = alpha * 0.95;
              } else {
                lbl.visible = false;
              }
            }
          }
        }

        if (this.globeRevealReadout && this.globeRevealReadout.visible) {
          this.globeRevealReadout.quaternion.copy(this._qTmpB);
          this._vTmpA.copy(this.globeRevealReadoutOutward).applyQuaternion(this._qTmpA).normalize();
          this.globeRevealReadout.getWorldPosition(this._vTmpB);
          this._vTmpB.subVectors(this._vTmpC, this._vTmpB).normalize();
          const facing = this._vTmpA.dot(this._vTmpB);
          const alpha = THREE.MathUtils.smoothstep(facing, -0.25, 0.12);
          this.globeRevealReadout.fillOpacity = alpha;
          this.globeRevealReadout.outlineOpacity = alpha * 0.98;
        }
      }
    }

    if (this.trophyGroup.visible) {
      if (!this.isDraggingInspect) {
        this.freeInspectYaw += (this.freeInspectVel + 0.45) * dt;
        this.freeInspectVel *= Math.exp(-dt * 4.0);
      }
      this.trophyGroup.rotation.y = this.freeInspectYaw;
      this.trophyGroup.position.y = floatY;
      if (this.trophyCrown) this.trophyCrown.rotation.y = this.elapsed * 0.35;
      if (this.trophyRingOuter) this.trophyRingOuter.rotation.y = -this.elapsed * 0.68;
      if (this.trophyRingInner) this.trophyRingInner.rotation.z = Math.cos(this.elapsed * 1.1) * 0.2;
      if (this.trophyStarCore) {
        this.trophyStarCore.rotation.y = this.elapsed * 1.4;
      }
    }

    if (this.orbGroup.visible) {
      if (!this.isDraggingInspect) {
        this.freeInspectYaw += (this.freeInspectVel + 0.25) * dt;
        this.freeInspectVel *= Math.exp(-dt * 4.0);
      }
      this.orbGroup.rotation.y = this.freeInspectYaw;
      this.orbGroup.position.y = floatY;
      if (this.orbRingOuter) this.orbRingOuter.rotation.y = this.elapsed * 0.32;
      if (this.orbRingMid) this.orbRingMid.rotation.z = Math.cos(this.elapsed * 0.8) * 0.22;
      if (this.orbRingInner) this.orbRingInner.rotation.x = Math.sin(this.elapsed * 1.1) * 0.25;
      if (this.orbCrystalCore) this.orbCrystalCore.rotation.y = this.elapsed * 0.9;
    }

    if (this.passportGroup.visible) {
      // #273 Fix #5: Gentle ±21° front-cover showcase sway (never spinning backwards to show blank spine),
      // while still supporting direct 1-finger touch/mouse inspect drag!
      if (!this.isDraggingInspect) {
        this.freeInspectYaw += this.freeInspectVel * dt;
        this.freeInspectVel *= Math.exp(-dt * 4.5);
        this.freeInspectYaw *= Math.exp(-dt * 2.2);
      }
      this.passportGroup.rotation.y = this.freeInspectYaw + Math.sin(this.elapsed * 0.65) * 0.36;
      this.passportGroup.position.y = floatY;
      this.passportCoverAnim = THREE.MathUtils.lerp(
        this.passportCoverAnim,
        this.passportCoverTargetOpen,
        smoothMed
      );
      if (this.passportCoverNode) {
        // Subtly ajar (~16°) so the 24K embossed Meridian Crest front cover shines prominently
        this.passportCoverNode.rotation.z = this.passportCoverAnim * 0.28;
      }
    }

    // Update 3D Crystal Fracture Shards
    for (let i = this.activeShards.length - 1; i >= 0; i--) {
      const s = this.activeShards[i];
      s.life += dt;
      if (s.life >= s.maxLife) {
        this.vfxGroup.remove(s.mesh);
        (s.mesh.material as THREE.Material).dispose();
        this.activeShards.splice(i, 1);
        continue;
      }
      s.vel.y -= 5.8 * dt;
      s.mesh.position.addScaledVector(s.vel, dt);
      if (s.mesh.position.y < 0.02) {
        s.mesh.position.y = 0.02;
        s.vel.y = Math.abs(s.vel.y) * 0.32;
        s.vel.x *= 0.72;
        s.vel.z *= 0.72;
      }
      s.mesh.rotation.x += s.rotVel.x * dt;
      s.mesh.rotation.y += s.rotVel.y * dt;
      s.mesh.rotation.z += s.rotVel.z * dt;
      const mat = s.mesh.material as THREE.MeshPhysicalMaterial;
      mat.opacity = 1 - Math.pow(s.life / s.maxLife, 1.8);
    }

    // Update Radial Spark Bursts
    for (let i = this.activeBursts.length - 1; i >= 0; i--) {
      const b = this.activeBursts[i];
      b.life += dt;
      if (b.life >= b.maxLife) {
        this.vfxGroup.remove(b.points);
        b.points.geometry.dispose();
        (b.points.material as THREE.Material).dispose();
        this.activeBursts.splice(i, 1);
        continue;
      }
      const attr = b.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let k = 0; k < attr.count; k++) {
        const k3 = k * 3;
        b.velocities[k3 + 1] -= 2.2 * dt;
        arr[k3] += b.velocities[k3] * dt;
        arr[k3 + 1] += b.velocities[k3 + 1] * dt;
        arr[k3 + 2] += b.velocities[k3 + 2] * dt;
      }
      attr.needsUpdate = true;
      (b.points.material as THREE.PointsMaterial).opacity = 1 - b.life / b.maxLife;
    }
  }

  public dispose(): void {
    for (const f of this.facets) {
      f.badgeText.dispose();
      f.answerText.dispose();
    }
    for (const t of this.codexTopTexts) t.dispose();
    for (const t of this.codexBottomTexts) t.dispose();
    for (const t of this.globeCityTexts) t.dispose();
    this.calibratorReadoutText?.dispose();
    this.calibratorMinText?.dispose();
    this.calibratorMaxText?.dispose();
    this.gauntletStatementText?.dispose();
    this.gauntletHintText?.dispose();
    this.passportInnerCharterText?.dispose();
    this.globeRevealReadout?.dispose();
    this.visualPlateCaptionText?.dispose();
    for (const tex of this.visualPlateTexCache.values()) {
      tex.dispose();
    }
    this.visualPlateTexCache.clear();
    this.visualPlatePending.clear();
    this.globeFallbackEarthTex?.dispose();
    this.globeFallbackEarthTex = null;
    this.shardGeometry.dispose();
    disposeObject3D(this.root);
  }
}
