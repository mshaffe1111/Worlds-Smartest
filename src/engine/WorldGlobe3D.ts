import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GlobeCountryCode } from '../types/game';
import { getBrushedBrassTextures, getEarthTextures, getGlowSpriteTexture } from './ProceduralTextures';

export type { GlobeCountryCode };

interface CountryPinConfig {
  code: GlobeCountryCode;
  lat: number;
  lon: number;
  active: boolean;
  color: number;
  isFinale?: boolean;
}

interface PinRig {
  code: GlobeCountryCode;
  active: boolean;
  group: THREE.Group;
  hitMesh: THREE.Mesh;
  pulseRing: THREE.Mesh;
  pulseMat: THREE.MeshBasicMaterial;
  orbMat: THREE.MeshStandardMaterial;
  selectHalo: THREE.Mesh;
  crownRing?: THREE.Mesh;
  lat: number;
  lon: number;
}

interface AnimatedFlightArc {
  curve: THREE.QuadraticBezierCurve3;
  pulseMesh: THREE.Mesh;
  speed: number;
  phase: number;
}

export const COUNTRY_COORDS: Record<GlobeCountryCode, { lat: number; lon: number }> = {
  CH: { lat: 46.2, lon: 6.1 },
  GB: { lat: 51.5, lon: -0.1 },
  JP: { lat: 35.7, lon: 139.7 },
  BR: { lat: -22.9, lon: -43.2 },
  EG: { lat: 30.0, lon: 31.2 },
  IS: { lat: 64.1, lon: -21.9 },
  SG: { lat: 1.35, lon: 103.8 },
  GLOBAL: { lat: 12.5, lon: -28.0 }, // Apex Forum — International Waters Mid-Atlantic Convergence
};

const COUNTRY_PINS: CountryPinConfig[] = [
  { code: 'CH', ...COUNTRY_COORDS.CH, active: true, color: 0xf7df9c },
  { code: 'GB', ...COUNTRY_COORDS.GB, active: true, color: 0xffe08a },
  { code: 'JP', ...COUNTRY_COORDS.JP, active: true, color: 0x5ce1e6 },
  { code: 'BR', ...COUNTRY_COORDS.BR, active: true, color: 0x38eba2 },
  { code: 'EG', ...COUNTRY_COORDS.EG, active: true, color: 0xf5b841 },
  { code: 'IS', ...COUNTRY_COORDS.IS, active: true, color: 0x7ae8ff },
  { code: 'SG', ...COUNTRY_COORDS.SG, active: true, color: 0xb07cff },
  { code: 'GLOBAL', ...COUNTRY_COORDS.GLOBAL, active: true, color: 0xfff3c4, isFinale: true },
];

function latLonToVec3(latDeg: number, lonDeg: number, radius: number): THREE.Vector3 {
  const phi = ((lonDeg + 180) / 360) * Math.PI * 2;
  const theta = ((90 - latDeg) / 180) * Math.PI;
  return new THREE.Vector3(
    -radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function normalizeAngle(rad: number): number {
  let a = rad % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export class WorldGlobe3D {
  public readonly root = new THREE.Group();

  private readonly radius = 1.34;
  private readonly tiltGroup = new THREE.Group();
  private readonly spinGroup = new THREE.Group();
  private readonly proceduralGimbalGroup = new THREE.Group();
  private readonly glbGimbalGroup = new THREE.Group();
  private readonly glbVernierRings: THREE.Object3D[] = [];
  private readonly gltfLoader = new GLTFLoader();
  private readonly outerRing1: THREE.Mesh;
  private readonly outerRing2: THREE.Mesh;
  private readonly starPoints: THREE.Points;

  private readonly pins: Map<GlobeCountryCode, PinRig> = new Map();
  private readonly hitTargets: THREE.Mesh[] = [];
  private readonly flightArcs: AnimatedFlightArc[] = [];
  private readonly raycaster = new THREE.Raycaster();
  private readonly extraMaterials: THREE.Material[] = [];
  private readonly extraGeometries: THREE.BufferGeometry[] = [];
  private readonly pulseDotGeo = new THREE.SphereGeometry(0.028, 10, 8);

  private yaw = 0;
  private pitch = 0.55;
  private yawVel = 0;
  private pitchVel = 0;
  private autoFocusing = false;
  private targetYaw = 0;
  private targetPitch = 0.55;
  private selectedCountry: GlobeCountryCode = 'CH';
  private elapsed = 0;
  private disposed = false;

  private readonly brassMat: THREE.MeshStandardMaterial;
  private readonly earthMat: THREE.MeshStandardMaterial;
  private readonly atmosphereMat: THREE.ShaderMaterial;

  constructor() {
    const earthTex = getEarthTextures();
    const brassTex = getBrushedBrassTextures();

    this.brassMat = new THREE.MeshStandardMaterial({
      color: 0xe3bf6f,
      map: brassTex.map,
      roughnessMap: brassTex.roughnessMap,
      metalness: 0.92,
      roughness: 0.24,
    });

    this.earthMat = new THREE.MeshStandardMaterial({
      map: earthTex.map,
      roughnessMap: earthTex.roughnessMap,
      emissiveMap: earthTex.emissiveMap,
      emissive: new THREE.Color(0xf7df9c),
      emissiveIntensity: 0.95,
      bumpMap: earthTex.bumpMap,
      bumpScale: 0.025,
      metalness: 0.28,
      roughness: 0.85,
    });

    const earthSphere = new THREE.Mesh(new THREE.SphereGeometry(this.radius, 64, 48), this.earthMat);
    this.spinGroup.add(earthSphere);

    // Subtle Fresnel atmospheric halo shader
    this.atmosphereMat = new THREE.ShaderMaterial({
      uniforms: {
        uRimColor: { value: new THREE.Color(0x63c8f5) },
        uGoldTint: { value: new THREE.Color(0xf7df9c) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uRimColor;
        uniform vec3 uGoldTint;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vec3 viewDir = normalize(vViewPos);
          float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 3.2);
          vec3 col = mix(uRimColor, uGoldTint, fresnel * 0.55);
          gl_FragColor = vec4(col, fresnel * 0.72);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    });
    const atmoMesh = new THREE.Mesh(new THREE.SphereGeometry(this.radius * 1.07, 48, 36), this.atmosphereMat);
    this.tiltGroup.add(atmoMesh);

    // Build ALL 8 active interactive geographic beacons (incl. GLOBAL Apex Forum)
    for (const cfg of COUNTRY_PINS) {
      this.addCountryBeacon(cfg);
    }

    // Animated golden great-circle flight arcs connecting all 8 World Circuit beacons
    this.addFlightArc('CH', 'GB', 0xf7df9c, 0.74, 0.24, 0.0);
    this.addFlightArc('CH', 'JP', 0x5ce1e6, 0.68, 0.19, 0.17);
    this.addFlightArc('GB', 'IS', 0x7ae8ff, 0.62, 0.26, 0.31);
    this.addFlightArc('GB', 'BR', 0xf7df9c, 0.62, 0.18, 0.44);
    this.addFlightArc('CH', 'EG', 0xf5b841, 0.66, 0.25, 0.58);
    this.addFlightArc('EG', 'SG', 0xf7df9c, 0.6, 0.2, 0.72);
    this.addFlightArc('JP', 'SG', 0xb07cff, 0.62, 0.23, 0.85);
    // Sovereign convergence routes into the Mid-Atlantic Apex Forum (GLOBAL)
    this.addFlightArc('CH', 'GLOBAL', 0xfff0be, 0.72, 0.22, 0.12);
    this.addFlightArc('BR', 'GLOBAL', 0x38eba2, 0.68, 0.24, 0.37);
    this.addFlightArc('IS', 'GLOBAL', 0x7ae8ff, 0.64, 0.21, 0.63);
    this.addFlightArc('EG', 'GLOBAL', 0xf5b841, 0.66, 0.19, 0.79);
    this.addFlightArc('SG', 'GLOBAL', 0xf7df9c, 0.54, 0.16, 0.91);

    this.tiltGroup.add(this.spinGroup);
    this.root.add(this.tiltGroup);

    // Procedural brass celestial meridian rings (seamlessly replaced by Blender world_globe_rig.glb!)
    this.outerRing1 = new THREE.Mesh(new THREE.TorusGeometry(this.radius * 1.24, 0.016, 10, 72), this.brassMat);
    this.outerRing1.rotation.x = Math.PI * 0.36;
    const outerRing2Mat = new THREE.MeshBasicMaterial({ color: 0xf7df9c, transparent: true, opacity: 0.34 });
    this.extraMaterials.push(outerRing2Mat);
    this.outerRing2 = new THREE.Mesh(new THREE.TorusGeometry(this.radius * 1.34, 0.01, 8, 72), outerRing2Mat);
    this.outerRing2.rotation.y = Math.PI * 0.28;
    this.outerRing2.rotation.x = -Math.PI * 0.22;
    this.proceduralGimbalGroup.add(this.outerRing1, this.outerRing2);
    this.root.add(this.proceduralGimbalGroup, this.glbGimbalGroup);

    // Ambient celestial dust field surrounding the globe
    const starCount = 140;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 2.1 + Math.random() * 2.8;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(b) * Math.cos(a);
      starPos[i * 3 + 1] = r * Math.cos(b);
      starPos[i * 3 + 2] = r * Math.sin(b) * Math.sin(a);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.starPoints = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        map: getGlowSpriteTexture(),
        color: 0xf7df9c,
        size: 0.08,
        transparent: true,
        opacity: 0.48,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.root.add(this.starPoints);

    // Stream real Blender machined brass celestial gimbal rig around the Earth
    this.loadBlenderGlobeGimbal();

    // Focus initially on Geneva (CH)
    this.focusCountry('CH');
    this.yaw = this.targetYaw;
    this.pitch = this.targetPitch;
    this.autoFocusing = false;
    this.root.visible = false;
  }

  private loadBlenderGlobeGimbal(): void {
    this.gltfLoader.load(
      './assets/models/world_globe_rig.glb',
      (gltf) => {
        if (this.disposed) return;
        const model = gltf.scene;
        model.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(model);
        if (!box.isEmpty()) {
          const size = box.getSize(new THREE.Vector3());
          const horizR = Math.max(size.x, size.z) * 0.5;
          // World_Globe_Rig_Root is already centered at origin (0,0,0) with radius ~1.84 + lower compass base!
          if (horizR > 0.01 && (horizR < 1.46 || horizR > 2.55)) {
            const scale = 1.82 / horizR;
            model.scale.multiplyScalar(scale);
          }
        }

        // Identify inclined equatorial vernier rings so they gently precess while compass base stays grounded!
        model.traverse((child) => {
          if (/vernier|equatorial/i.test(child.name)) {
            this.glbVernierRings.push(child);
          }
        });

        this.glbGimbalGroup.add(model);
        this.proceduralGimbalGroup.visible = false;
      },
      undefined,
      () => {
        // Graceful fallback keeps procedural brass celestial meridian rings visible
      }
    );
  }

  private addCountryBeacon(cfg: CountryPinConfig): void {
    const surfacePos = latLonToVec3(cfg.lat, cfg.lon, this.radius + 0.012);
    const normal = surfacePos.clone().normalize();

    const group = new THREE.Group();
    group.position.copy(surfacePos);
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

    // Base brass mounting collar
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(cfg.isFinale ? 0.062 : 0.048, cfg.isFinale ? 0.078 : 0.062, 0.026, 12),
      this.brassMat
    );
    group.add(base);

    // Vertical luminous spire
    const spireHeight = cfg.isFinale ? 0.28 : 0.22;
    const orbMat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      emissive: cfg.color,
      emissiveIntensity: cfg.isFinale ? 2.4 : 2.0,
      roughness: 0.15,
      metalness: 0.3,
    });
    this.extraMaterials.push(orbMat);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.024, spireHeight, 8), orbMat);
    spire.position.y = spireHeight / 2;
    group.add(spire);

    // Floating beacon jewel atop spire
    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(cfg.isFinale ? 0.068 : 0.052, 0), orbMat);
    orb.position.y = spireHeight + 0.048;
    group.add(orb);

    // Sovereign orbiting crown ring around the Apex Forum (GLOBAL) beacon
    let crownRing: THREE.Mesh | undefined;
    if (cfg.isFinale) {
      crownRing = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.012, 8, 32), this.brassMat);
      crownRing.position.y = spireHeight + 0.048;
      crownRing.rotation.x = Math.PI * 0.35;
      group.add(crownRing);
    }

    // Pulsing surface telemetry ring
    const pulseMat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.extraMaterials.push(pulseMat);
    const pulseRing = new THREE.Mesh(new THREE.RingGeometry(0.055, 0.084, 24), pulseMat);
    pulseRing.rotation.x = -Math.PI / 2;
    pulseRing.position.y = 0.014;
    group.add(pulseRing);

    // Highlight double reticle ring when currently selected
    const selectMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.extraMaterials.push(selectMat);
    const selectHalo = new THREE.Mesh(new THREE.RingGeometry(0.11, 0.148, 32), selectMat);
    selectHalo.rotation.x = -Math.PI / 2;
    selectHalo.position.y = 0.018;
    selectHalo.visible = cfg.code === this.selectedCountry;
    group.add(selectHalo);

    // Generous invisible thumb-friendly hit sphere for tap raycasting
    const hitMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 10, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitMesh.position.y = 0.1;
    hitMesh.userData.countryCode = cfg.code;
    group.add(hitMesh);

    this.spinGroup.add(group);
    this.hitTargets.push(hitMesh);
    this.pins.set(cfg.code, {
      code: cfg.code,
      active: cfg.active,
      group,
      hitMesh,
      pulseRing,
      pulseMat,
      orbMat,
      selectHalo,
      crownRing,
      lat: cfg.lat,
      lon: cfg.lon,
    });
  }

  private addFlightArc(
    from: GlobeCountryCode,
    to: GlobeCountryCode,
    colorHex: number,
    opacity: number,
    speed: number,
    phase: number
  ): void {
    const aCfg = COUNTRY_COORDS[from];
    const bCfg = COUNTRY_COORDS[to];
    if (!aCfg || !bCfg) return;

    const p0 = latLonToVec3(aCfg.lat, aCfg.lon, this.radius + 0.02);
    const p2 = latLonToVec3(bCfg.lat, bCfg.lon, this.radius + 0.02);
    const dist = p0.distanceTo(p2);
    const mid = p0
      .clone()
      .add(p2)
      .normalize()
      .multiplyScalar(this.radius + 0.24 + dist * 0.18);

    const curve = new THREE.QuadraticBezierCurve3(p0, mid, p2);
    const pts = curve.getPoints(40);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    this.extraGeometries.push(geo);
    const mat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
    });
    this.extraMaterials.push(mat);
    const line = new THREE.Line(geo, mat);
    this.spinGroup.add(line);

    // Animated golden telemetry flight pulse gliding smoothly along the great-circle arc
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xfff4cf,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.extraMaterials.push(pulseMat);
    const pulseMesh = new THREE.Mesh(this.pulseDotGeo, pulseMat);
    this.spinGroup.add(pulseMesh);

    this.flightArcs.push({ curve, pulseMesh, speed, phase });
  }

  public rotateBy(dx: number, dy: number): void {
    this.autoFocusing = false;
    this.yaw += dx * 0.0068;
    this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.0056, -1.08, 1.08);
    this.yawVel = THREE.MathUtils.clamp(dx * 0.14, -4.5, 4.5);
    this.pitchVel = THREE.MathUtils.clamp(dy * 0.1, -3.0, 3.0);
  }

  public focusCountry(country: GlobeCountryCode): void {
    const pin = this.pins.get(country);
    if (!pin) return;
    this.selectedCountry = country;

    for (const [code, rig] of this.pins) {
      rig.selectHalo.visible = code === country;
    }

    const vec = latLonToVec3(pin.lat, pin.lon, 1);
    const rXZ = Math.hypot(vec.x, vec.z);
    this.targetYaw = -Math.atan2(vec.x, vec.z);
    this.targetPitch = THREE.MathUtils.clamp(Math.atan2(vec.y, rXZ) - 0.06, -1.05, 1.05);
    this.yawVel = 0;
    this.pitchVel = 0;
    this.autoFocusing = true;
  }

  public raycastPin(ndc: THREE.Vector2, camera: THREE.Camera): GlobeCountryCode | null {
    if (!this.root.visible) return null;
    this.raycaster.setFromCamera(ndc, camera);
    const hits = this.raycaster.intersectObjects(this.hitTargets, false);
    if (hits.length === 0) return null;

    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);
    const globeWorld = new THREE.Vector3();
    this.root.getWorldPosition(globeWorld);

    for (const hit of hits) {
      const worldPt = new THREE.Vector3();
      hit.object.getWorldPosition(worldPt);
      const fromCenter = worldPt.clone().sub(globeWorld).normalize();
      const toCam = camPos.clone().sub(globeWorld).normalize();
      if (fromCenter.dot(toCam) > -0.15) {
        const code = hit.object.userData.countryCode as GlobeCountryCode | undefined;
        if (code) return code;
      }
    }
    return null;
  }

  public update(dt: number): void {
    if (!this.root.visible) return;
    this.elapsed += dt;

    if (this.autoFocusing) {
      const diffYaw = normalizeAngle(this.targetYaw - this.yaw);
      const diffPitch = this.targetPitch - this.pitch;
      const k = Math.min(1, dt * 5.2);
      this.yaw += diffYaw * k;
      this.pitch += diffPitch * k;
      if (Math.abs(diffYaw) < 0.004 && Math.abs(diffPitch) < 0.004) {
        this.autoFocusing = false;
      }
    } else {
      this.yaw += this.yawVel * dt + dt * 0.035;
      this.pitch = THREE.MathUtils.clamp(this.pitch + this.pitchVel * dt, -1.08, 1.08);
      this.yawVel *= Math.exp(-4.8 * dt);
      this.pitchVel *= Math.exp(-5.4 * dt);
    }

    this.spinGroup.rotation.y = this.yaw;
    this.tiltGroup.rotation.x = this.pitch;

    this.outerRing1.rotation.z += dt * 0.14;
    this.outerRing2.rotation.z -= dt * 0.09;
    if (this.glbVernierRings.length > 0) {
      for (const ring of this.glbVernierRings) {
        ring.rotation.y += dt * 0.085;
      }
    } else if (this.glbGimbalGroup.children.length > 0) {
      this.glbGimbalGroup.rotation.y += dt * 0.045;
    }
    this.starPoints.rotation.y += dt * 0.02;

    // Animate traveling golden great-circle flight pulses across all 8 destinations
    for (const arc of this.flightArcs) {
      const t = (this.elapsed * arc.speed + arc.phase) % 1;
      arc.curve.getPoint(t, arc.pulseMesh.position);
      const arcFade = Math.sin(t * Math.PI);
      const scale = 0.65 + arcFade * 0.85;
      arc.pulseMesh.scale.setScalar(scale);
      (arc.pulseMesh.material as THREE.MeshBasicMaterial).opacity = 0.2 + arcFade * 0.8;
    }

    // Animate beacon pulse rings & Apex Forum crown
    let idx = 0;
    for (const rig of this.pins.values()) {
      const cycle = (this.elapsed * 1.15 + idx * 0.37) % 1;
      const scale = 1 + cycle * 1.85;
      rig.pulseRing.scale.setScalar(scale);
      rig.pulseMat.opacity = (1 - cycle) * 0.85;
      if (rig.crownRing) {
        rig.crownRing.rotation.z += dt * 1.1;
        rig.crownRing.rotation.y += dt * 0.7;
      }
      if (rig.selectHalo.visible) {
        rig.selectHalo.rotation.z -= dt * 1.4;
        const s = 1 + Math.sin(this.elapsed * 4.5) * 0.09;
        rig.selectHalo.scale.setScalar(s);
      }
      idx++;
    }
  }

  public dispose(): void {
    this.disposed = true;
    this.brassMat.dispose();
    this.earthMat.dispose();
    this.atmosphereMat.dispose();
    this.pulseDotGeo.dispose();
    this.starPoints.geometry.dispose();
    (this.starPoints.material as THREE.Material).dispose();
    this.extraMaterials.forEach((m) => m.dispose());
    this.extraGeometries.forEach((g) => g.dispose());
  }
}
