import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { CharacterId, CharacterMood, RivalPrismStatus } from '../types/game';
import { getBrushedBrassTextures, getObsidianTextures } from './ProceduralTextures';

type ActiveCharId = Exclude<CharacterId, 'none'>;

interface CharacterStyle {
  portraitPath: string;
  accentHex: number;
  rimHex: number;
  titleCode: string;
}

const CHARACTER_STYLES: Record<ActiveCharId, CharacterStyle> = {
  vance: {
    portraitPath: './assets/portraits/vance.jpg',
    accentHex: 0xf7df9c,
    rimHex: 0x62b4f5,
    titleCode: 'MAESTRO',
  },
  nadia: {
    portraitPath: './assets/portraits/nadia.jpg',
    accentHex: 0xe6b85c,
    rimHex: 0x4fd1e8,
    titleCode: 'POLYMATH',
  },
  soren: {
    portraitPath: './assets/portraits/soren.jpg',
    accentHex: 0xffa94d,
    rimHex: 0xb85cff,
    titleCode: 'ECHO',
  },
  teo: {
    portraitPath: './assets/portraits/teo.jpg',
    accentHex: 0x5ce1e6,
    rimHex: 0x3dd68c,
    titleCode: 'FIXER',
  },
  lindqvist: {
    portraitPath: './assets/portraits/lindqvist.jpg',
    accentHex: 0xe8edf5,
    rimHex: 0xd4a853,
    titleCode: 'CHANCELLOR',
  },
  tariq: {
    portraitPath: './assets/portraits/tariq.jpg',
    accentHex: 0x38eba2,
    rimHex: 0xf5a623,
    titleCode: 'ARCHIVIST',
  },
};

interface RivalSteamRing {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  age: number;
  life: number;
}

/**
 * AAA "Sovereign Modernism" 3D Holographic Cinema Monolith stage presence.
 * Displays studio-painted Fortiche/Arcane-grade character portraits inside a
 * REAL Blender sculpted obsidian-and-brushed-brass monument (`stage_monolith.glb`)
 * with live mood rim lighting, breathing levitation, signature 3D character props
 * (including Soren's freezing knuckle coin & Tariq's floating basalt cryo-prism),
 * and the floating miniature Rival Prism.
 */
export class Characters3D {
  public readonly root = new THREE.Group();

  private readonly monolithGroup = new THREE.Group();
  private readonly framePivot = new THREE.Group();
  private readonly proceduralFrameGroup = new THREE.Group();
  private readonly glbMonolithGroup = new THREE.Group();
  private readonly gltfLoader = new GLTFLoader();
  private readonly monolithGlbGlowMats: THREE.MeshStandardMaterial[] = [];

  private readonly portraitPlane: THREE.Mesh;
  private readonly portraitMat: THREE.ShaderMaterial;
  private readonly rimGlowMat: THREE.MeshStandardMaterial;
  private readonly moodLight: THREE.PointLight;
  private readonly haloRing: THREE.Mesh;

  // Signature 3D character props orbiting beside the monolith
  private readonly propGroup = new THREE.Group();
  private readonly vanceAstrolabe: THREE.Group;
  private readonly sorenCoin: THREE.Mesh;
  private readonly sorenCoinMat: THREE.MeshStandardMaterial;
  private readonly nadiaEarRing: THREE.Group;
  private readonly teoTelemetry: THREE.Group;
  private readonly lindqvistCrest: THREE.Group;
  private readonly tariqCryoPrism: THREE.Group;
  private readonly tariqAmberOrbit: THREE.Group;

  // Floating Miniature Rival Prism
  private readonly rivalPrismGroup = new THREE.Group();
  private readonly rivalCore: THREE.Mesh;
  private readonly rivalUpperRing: THREE.Mesh;
  private readonly rivalLowerRing: THREE.Mesh;
  private readonly rivalGlowMat: THREE.MeshStandardMaterial;
  private readonly rivalLight: THREE.PointLight;
  private readonly rivalSteamGroup = new THREE.Group();
  private steamRings: RivalSteamRing[] = [];
  private steamSpawnTimer = 0;
  private rivalStatus: RivalPrismStatus = 'HIDDEN';
  private rivalScale = 0.001;

  // Textures & materials
  private readonly textureLoader = new THREE.TextureLoader();
  private readonly portraitTextures: Partial<Record<ActiveCharId, THREE.Texture>> = {};
  private readonly brassMat: THREE.MeshStandardMaterial;
  private readonly obsidianMat: THREE.MeshStandardMaterial;
  private readonly extraMaterials: THREE.Material[] = [];

  private activeChar: CharacterId = 'none';
  private mood: CharacterMood = 'NEUTRAL';
  private monolithScale = 0.001;
  private elapsed = 0;
  private disposed = false;

  private readonly targetRimColor = new THREE.Color(0xf7df9c);
  private readonly currentRimColor = new THREE.Color(0xf7df9c);

  constructor() {
    const brassTex = getBrushedBrassTextures();
    const obsidianTex = getObsidianTextures();

    this.brassMat = new THREE.MeshStandardMaterial({
      color: 0xe8c474,
      map: brassTex.map,
      roughnessMap: brassTex.roughnessMap,
      metalness: 0.92,
      roughness: 0.22,
    });

    this.obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x0b101b,
      map: obsidianTex.map,
      roughnessMap: obsidianTex.roughnessMap,
      metalness: 0.38,
      roughness: 0.22,
    });

    this.rimGlowMat = new THREE.MeshStandardMaterial({
      color: 0xe8c474,
      emissive: 0xd4a853,
      emissiveIntensity: 0.55,
      metalness: 0.85,
      roughness: 0.24,
    });

    // Positioned cleanly in the Top 28% Stage Plane above the Veritas Prism
    this.root.position.set(0, 1.82, -2.85);

    // Preload all 6 painted portraits asynchronously (incl. tariq)
    for (const id of Object.keys(CHARACTER_STYLES) as ActiveCharId[]) {
      const tex = this.textureLoader.load(CHARACTER_STYLES[id].portraitPath);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      this.portraitTextures[id] = tex;
    }

    // Custom soft-vignette glass portrait shader so painted portraits blend seamlessly into 3D space
    this.portraitMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uMap: { value: this.portraitTextures.vance ?? null },
        uTint: { value: new THREE.Color(0xffffff) },
        uRimColor: { value: new THREE.Color(0xf7df9c) },
        uRimBoost: { value: 0.22 },
        uTime: { value: 0 },
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform vec3 uTint;
        uniform vec3 uRimColor;
        uniform float uRimBoost;
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          vec4 tex = texture2D(uMap, vUv);
          vec2 p = vUv * 2.0 - 1.0;

          // Subtle luxury rounded-rect vignette & bottom fade into the obsidian plinth
          float edgeX = smoothstep(1.0, 0.82, abs(p.x));
          float edgeTop = smoothstep(1.0, 0.84, p.y);
          float edgeBot = smoothstep(-1.0, -0.58, p.y);
          float mask = edgeX * edgeTop * edgeBot;

          // Subtle architectural glass sheen sweep
          float sheen = smoothstep(0.92, 1.0, sin((vUv.x * 2.2 - vUv.y * 0.9) + uTime * 0.65) * 0.5 + 0.5);
          float borderRim = (1.0 - smoothstep(0.76, 0.96, max(abs(p.x), abs(p.y)))) ;
          float rimLine = smoothstep(0.82, 0.96, max(abs(p.x), abs(p.y))) * mask;

          vec3 col = tex.rgb * uTint;
          col += uRimColor * (rimLine * uRimBoost + sheen * 0.055);
          col = mix(col * 0.96, col, borderRim);

          gl_FragColor = vec4(col, mask * uOpacity);
        }
      `,
    });

    // Portrait plane (3:4 portrait aspect ratio — 1.42w x 1.88h)
    this.portraitPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 1.88, 1, 1), this.portraitMat);
    this.portraitPlane.position.set(0, 0.12, 0.06);

    // Procedural fallback obsidian backing & brass rails (replaced seamlessly by stage_monolith.glb!)
    const backing = new THREE.Mesh(new THREE.BoxGeometry(1.52, 1.98, 0.08), this.obsidianMat);
    backing.position.set(0, 0.12, -0.02);

    const railGeo = new THREE.BoxGeometry(0.036, 1.92, 0.11);
    const leftRail = new THREE.Mesh(railGeo, this.brassMat);
    leftRail.position.set(-0.77, 0.12, 0.0);
    const rightRail = new THREE.Mesh(railGeo, this.brassMat);
    rightRail.position.set(0.77, 0.12, 0.0);

    const topBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.12), this.brassMat);
    topBar.position.set(0, 1.11, 0.0);
    const botBar = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.055, 0.14), this.brassMat);
    botBar.position.set(0, -0.87, 0.01);

    const glowStripGeo = new THREE.BoxGeometry(0.016, 1.72, 0.02);
    const glowL = new THREE.Mesh(glowStripGeo, this.rimGlowMat);
    glowL.position.set(-0.735, 0.12, 0.055);
    const glowR = new THREE.Mesh(glowStripGeo, this.rimGlowMat);
    glowR.position.set(0.735, 0.12, 0.055);

    this.proceduralFrameGroup.add(backing, leftRail, rightRail, topBar, botBar, glowL, glowR);

    // Subtle floating brass architectural halo behind the monolith
    this.haloRing = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.016, 10, 64), this.rimGlowMat);
    this.haloRing.position.set(0, 0.25, -0.18);

    this.moodLight = new THREE.PointLight(0xf7df9c, 1.35, 4.5, 1.4);
    this.moodLight.position.set(0, 0.3, 0.9);

    this.framePivot.add(
      this.proceduralFrameGroup,
      this.glbMonolithGroup,
      this.portraitPlane,
      this.haloRing,
      this.moodLight
    );

    // Build signature 3D character props hovering cleanly at the left shoulder of the monolith
    this.propGroup.position.set(-1.05, 0.18, 0.25);

    // Vance: miniature rotating brass astrolabe
    this.vanceAstrolabe = new THREE.Group();
    const va1 = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.014, 8, 32), this.brassMat);
    const va2 = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 8, 28), this.brassMat);
    va2.rotation.x = Math.PI / 2.4;
    const vaCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), this.rimGlowMat);
    this.vanceAstrolabe.add(va1, va2, vaCore);

    // Soren: iconic spinning/freezing brushed-gold knuckle coin
    this.sorenCoinMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xffa230,
      emissiveIntensity: 0.95,
      metalness: 0.96,
      roughness: 0.15,
    });
    this.sorenCoin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.026, 28), this.sorenCoinMat);
    this.sorenCoin.rotation.x = Math.PI / 2;

    // Nadia: geometric acoustic resonance diamond
    this.nadiaEarRing = new THREE.Group();
    const nOuter = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), this.brassMat);
    nOuter.scale.set(0.65, 1.35, 0.65);
    const nWireMat = new THREE.MeshBasicMaterial({ color: 0x4fd1e8, wireframe: true, transparent: true, opacity: 0.65 });
    this.extraMaterials.push(nWireMat);
    const nWire = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), nWireMat);
    this.nadiaEarRing.add(nOuter, nWire);

    // Teo: cyan telemetry wireframe cube
    this.teoTelemetry = new THREE.Group();
    const teoWireMat = new THREE.MeshBasicMaterial({ color: 0x5ce1e6, wireframe: true, transparent: true, opacity: 0.85 });
    this.extraMaterials.push(teoWireMat);
    const teoBox = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), teoWireMat);
    const teoCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), this.rimGlowMat);
    this.teoTelemetry.add(teoBox, teoCore);

    // Lindqvist: Sovereign platinum laurel ring
    this.lindqvistCrest = new THREE.Group();
    const lRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 10, 6), this.brassMat);
    const lInner = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), this.rimGlowMat);
    this.lindqvistCrest.add(lRing, lInner);

    // Tariq: floating hexagonal volcanic basalt cryo-prism with emerald-aurora core & orbiting amber shards
    this.tariqCryoPrism = new THREE.Group();
    const basaltCore = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.11, 0.34, 6), this.obsidianMat);
    const auroraCageMat = new THREE.MeshBasicMaterial({
      color: 0x38eba2,
      wireframe: true,
      transparent: true,
      opacity: 0.82,
    });
    const amberShardMat = new THREE.MeshStandardMaterial({
      color: 0xffb84d,
      emissive: 0xf5a623,
      emissiveIntensity: 1.35,
      metalness: 0.72,
      roughness: 0.2,
    });
    this.extraMaterials.push(auroraCageMat, amberShardMat);

    const auroraCage = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), auroraCageMat);
    auroraCage.scale.set(0.85, 1.35, 0.85);
    this.tariqAmberOrbit = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.042, 0), amberShardMat);
      shard.position.set(Math.cos(a) * 0.23, (i - 1) * 0.06, Math.sin(a) * 0.23);
      this.tariqAmberOrbit.add(shard);
    }
    this.tariqCryoPrism.add(basaltCore, auroraCage, this.tariqAmberOrbit);
    this.tariqCryoPrism.visible = false;

    this.propGroup.add(
      this.vanceAstrolabe,
      this.sorenCoin,
      this.nadiaEarRing,
      this.teoTelemetry,
      this.lindqvistCrest,
      this.tariqCryoPrism
    );

    this.monolithGroup.add(this.framePivot, this.propGroup);
    this.monolithGroup.scale.setScalar(0.001);
    this.root.add(this.monolithGroup);

    // Build Floating Miniature Rival Prism hovering to the right of the monolith
    this.rivalGlowMat = new THREE.MeshStandardMaterial({
      color: 0xf7df9c,
      emissive: 0xf7df9c,
      emissiveIntensity: 1.4,
      roughness: 0.2,
      metalness: 0.5,
    });

    this.rivalCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), this.obsidianMat);
    const coreWireMat = new THREE.MeshBasicMaterial({ color: 0xf7df9c, wireframe: true, transparent: true, opacity: 0.65 });
    this.extraMaterials.push(coreWireMat);
    const coreWire = new THREE.Mesh(new THREE.OctahedronGeometry(0.25, 0), coreWireMat);
    this.rivalCore.add(coreWire);

    this.rivalUpperRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.022, 10, 32), this.brassMat);
    this.rivalUpperRing.rotation.x = Math.PI / 2;
    this.rivalUpperRing.position.y = 0.13;

    this.rivalLowerRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.022, 10, 32), this.rivalGlowMat);
    this.rivalLowerRing.rotation.x = Math.PI / 2;
    this.rivalLowerRing.position.y = -0.13;

    this.rivalLight = new THREE.PointLight(0xf7df9c, 0, 3.2, 1.5);

    this.rivalPrismGroup.add(
      this.rivalCore,
      this.rivalUpperRing,
      this.rivalLowerRing,
      this.rivalLight,
      this.rivalSteamGroup
    );
    this.rivalPrismGroup.position.set(1.18, 0.14, 0.35);
    this.rivalPrismGroup.scale.setScalar(0.001);
    this.root.add(this.rivalPrismGroup);

    // Load real Blender sculpted beveled obsidian-and-brass stage monolith frame
    this.loadBlenderStageMonolith();
  }

  private loadBlenderStageMonolith(): void {
    this.gltfLoader.load(
      './assets/models/stage_monolith.glb',
      (gltf) => {
        if (this.disposed) return;
        const model = gltf.scene;
        model.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(model);
        if (!box.isEmpty()) {
          const size = box.getSize(new THREE.Vector3());
          // Stage_Monolith_Root is already modeled around aperture y=0.12, z=0; only scale if outside expected bounds
          if (size.y > 0.01 && (size.y < 1.35 || size.y > 3.6)) {
            const scale = 2.35 / size.y;
            model.scale.multiplyScalar(scale);
          }
        }

        // Capture any recessed emissive light-strip materials so live character moods illuminate them!
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            for (const m of mats) {
              if (m instanceof THREE.MeshStandardMaterial) {
                const lower = (m.name || '').toLowerCase();
                const emLum = m.emissive.r * 0.3 + m.emissive.g * 0.59 + m.emissive.b * 0.11;
                if (emLum * m.emissiveIntensity > 0.15 || /glow|strip|light|emissive|rim|led|neon/.test(lower)) {
                  this.monolithGlbGlowMats.push(m);
                }
              }
            }
          }
        });

        this.glbMonolithGroup.add(model);
        this.proceduralFrameGroup.visible = false;
        this.haloRing.visible = false; // Blender monolith includes sculpted Monolith_Rear_Halo
        this.portraitPlane.position.z = 0.088;
      },
      undefined,
      () => {
        // Graceful fallback keeps procedural brass/obsidian monolith frame visible
      }
    );
  }

  public setCharacter(charId: CharacterId, mood: CharacterMood = 'NEUTRAL'): void {
    this.activeChar = charId;
    this.mood = mood;

    if (charId === 'none') {
      return;
    }

    const style = CHARACTER_STYLES[charId];
    const tex = this.portraitTextures[charId];
    if (tex) {
      this.portraitMat.uniforms.uMap.value = tex;
    }
    this.targetRimColor.setHex(style.accentHex);

    this.vanceAstrolabe.visible = charId === 'vance';
    this.sorenCoin.visible = charId === 'soren';
    this.nadiaEarRing.visible = charId === 'nadia';
    this.teoTelemetry.visible = charId === 'teo';
    this.lindqvistCrest.visible = charId === 'lindqvist';
    this.tariqCryoPrism.visible = charId === 'tariq';
  }

  public setRivalPrismStatus(status: RivalPrismStatus): void {
    this.rivalStatus = status;
  }

  private spawnRivalSteamRing(): void {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xf7df9c,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.21, 24), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.15;
    this.rivalSteamGroup.add(mesh);
    this.steamRings.push({ mesh, mat, age: 0, life: 1.05 });
  }

  public update(dt: number): void {
    this.elapsed += dt;
    this.portraitMat.uniforms.uTime.value = this.elapsed;

    // Smoothly scale character monolith in/out
    const targetMonolithScale = this.activeChar === 'none' ? 0.001 : 1.0;
    this.monolithScale = THREE.MathUtils.lerp(this.monolithScale, targetMonolithScale, Math.min(1, dt * 7));
    this.monolithGroup.scale.setScalar(this.monolithScale);
    this.monolithGroup.visible = this.monolithScale > 0.015;

    if (this.monolithGroup.visible && this.activeChar !== 'none') {
      const style = CHARACTER_STYLES[this.activeChar];
      const breatheY = Math.sin(this.elapsed * 1.4) * 0.04;
      let targetYaw = Math.sin(this.elapsed * 0.55) * 0.045;
      let targetRoll = 0;
      let targetPitch = 0;
      let rimBoost = 0.25;
      let rimEmissive = 1.1;
      let desiredRimHex = style.accentHex;

      switch (this.mood) {
        case 'IMPRESSED':
          targetPitch = 0.04;
          rimBoost = 0.45;
          rimEmissive = 1.65;
          desiredRimHex = 0xf7df9c;
          break;
        case 'TENSE':
          targetPitch = 0.06;
          rimBoost = 0.4;
          rimEmissive = 1.45;
          desiredRimHex = 0xff9f43;
          break;
        case 'SMIRK':
          targetRoll = 0.045;
          targetYaw = -0.09;
          rimBoost = 0.35;
          rimEmissive = 1.35;
          break;
        case 'RATTLED':
          targetYaw = Math.sin(this.elapsed * 9) * 0.06;
          targetRoll = Math.cos(this.elapsed * 8) * 0.03;
          rimBoost = 0.5;
          rimEmissive = 1.75;
          desiredRimHex = 0xff4658;
          break;
        case 'TELL':
          targetYaw = 0.08;
          rimBoost = 0.65;
          rimEmissive = 2.1 + Math.sin(this.elapsed * 8) * 0.45;
          desiredRimHex = 0x5ce1e6;
          break;
        case 'NEUTRAL':
        default:
          break;
      }

      const k = Math.min(1, dt * 6);
      this.targetRimColor.setHex(desiredRimHex);
      this.currentRimColor.lerp(this.targetRimColor, k);

      this.rimGlowMat.color.copy(this.currentRimColor);
      this.rimGlowMat.emissive.copy(this.currentRimColor);
      this.rimGlowMat.emissiveIntensity = THREE.MathUtils.lerp(this.rimGlowMat.emissiveIntensity, rimEmissive, k);
      for (const m of this.monolithGlbGlowMats) {
        m.emissive.copy(this.currentRimColor);
        m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, rimEmissive, k);
      }

      this.moodLight.color.copy(this.currentRimColor);
      this.moodLight.intensity = THREE.MathUtils.lerp(this.moodLight.intensity, 1.1 + rimBoost * 1.4, k);
      (this.portraitMat.uniforms.uRimColor.value as THREE.Color).copy(this.currentRimColor);
      this.portraitMat.uniforms.uRimBoost.value = THREE.MathUtils.lerp(
        this.portraitMat.uniforms.uRimBoost.value as number,
        rimBoost,
        k
      );

      this.framePivot.position.y = breatheY;
      this.framePivot.rotation.y = THREE.MathUtils.lerp(this.framePivot.rotation.y, targetYaw, k);
      this.framePivot.rotation.x = THREE.MathUtils.lerp(this.framePivot.rotation.x, targetPitch, k);
      this.framePivot.rotation.z = THREE.MathUtils.lerp(this.framePivot.rotation.z, targetRoll, k);

      this.haloRing.rotation.z += dt * 0.16;

      // Signature 3D character props
      this.propGroup.position.y = 0.18 + Math.sin(this.elapsed * 2.1) * 0.04;
      if (this.vanceAstrolabe.visible) {
        this.vanceAstrolabe.rotation.y += dt * 0.9;
        this.vanceAstrolabe.rotation.z += dt * 0.35;
      }
      if (this.sorenCoin.visible) {
        if (this.mood === 'TELL') {
          this.sorenCoin.rotation.z = THREE.MathUtils.lerp(this.sorenCoin.rotation.z, 0, Math.min(1, dt * 16));
          this.sorenCoin.rotation.y = THREE.MathUtils.lerp(this.sorenCoin.rotation.y, 0, Math.min(1, dt * 16));
          this.sorenCoinMat.emissiveIntensity = 2.4 + Math.sin(this.elapsed * 12) * 0.5;
        } else {
          this.sorenCoin.rotation.z += dt * 6.8;
          this.sorenCoin.rotation.y += dt * 2.8;
          this.sorenCoinMat.emissiveIntensity = 0.95;
        }
      }
      if (this.nadiaEarRing.visible) {
        this.nadiaEarRing.rotation.y += dt * 1.25;
      }
      if (this.teoTelemetry.visible) {
        this.teoTelemetry.rotation.x += dt * 0.9;
        this.teoTelemetry.rotation.y += dt * 1.4;
      }
      if (this.lindqvistCrest.visible) {
        this.lindqvistCrest.rotation.y += dt * 0.65;
      }
      if (this.tariqCryoPrism.visible) {
        this.tariqCryoPrism.rotation.y += dt * 0.85;
        this.tariqCryoPrism.rotation.z = Math.sin(this.elapsed * 1.3) * 0.14;
        this.tariqAmberOrbit.rotation.y -= dt * 1.9;
        this.tariqAmberOrbit.rotation.x += dt * 0.65;
      }
    }

    // Floating Miniature Rival Prism behavior
    const visibleTarget = this.rivalStatus === 'HIDDEN' ? 0.001 : 1.0;
    this.rivalScale = THREE.MathUtils.lerp(this.rivalScale, visibleTarget, Math.min(1, dt * 7));
    this.rivalPrismGroup.scale.setScalar(this.rivalScale);
    this.rivalPrismGroup.visible = this.rivalScale > 0.015;

    if (this.rivalPrismGroup.visible) {
      const baseY = 0.14 + Math.sin(this.elapsed * 2.2) * 0.06;
      let shakeX = 0;

      if (this.rivalStatus === 'THINKING') {
        this.rivalCore.rotation.y += dt * 0.9;
        this.rivalUpperRing.rotation.z += dt * 0.8;
        this.rivalLowerRing.rotation.z -= dt * 0.7;
        this.rivalUpperRing.position.y = THREE.MathUtils.lerp(this.rivalUpperRing.position.y, 0.13, dt * 6);
        this.rivalGlowMat.color.setHex(0x5ce1e6);
        this.rivalGlowMat.emissive.setHex(0x5ce1e6);
        this.rivalGlowMat.emissiveIntensity = 1.25;
        this.rivalLight.color.setHex(0x5ce1e6);
        this.rivalLight.intensity = 1.2;
      } else if (this.rivalStatus === 'PEELING') {
        this.rivalCore.rotation.y += dt * 2.4;
        this.rivalUpperRing.position.y = THREE.MathUtils.lerp(this.rivalUpperRing.position.y, 0.27, dt * 6);
        this.rivalGlowMat.color.setHex(0xf7df9c);
        this.rivalGlowMat.emissive.setHex(0xf7df9c);
        this.rivalGlowMat.emissiveIntensity = 1.85;
        this.rivalLight.color.setHex(0xf7df9c);
        this.rivalLight.intensity = 2.0;

        this.steamSpawnTimer += dt;
        if (this.steamSpawnTimer >= 0.28) {
          this.steamSpawnTimer = 0;
          this.spawnRivalSteamRing();
        }
      } else if (this.rivalStatus === 'OVERCLOCKING') {
        const pulse = 0.5 + 0.5 * Math.sin(this.elapsed * 16);
        this.rivalCore.rotation.y += dt * 5.8;
        this.rivalUpperRing.rotation.z += dt * 4.5;
        this.rivalLowerRing.rotation.z -= dt * 4.5;
        this.rivalGlowMat.color.setHex(0xff384d);
        this.rivalGlowMat.emissive.setHex(0xff2942);
        this.rivalGlowMat.emissiveIntensity = 2.1 + pulse * 1.4;
        this.rivalLight.color.setHex(0xff2942);
        this.rivalLight.intensity = 2.2 + pulse * 1.4;
        shakeX = (Math.random() - 0.5) * 0.035;
      } else if (this.rivalStatus === 'LOCKED') {
        this.rivalUpperRing.position.y = THREE.MathUtils.lerp(this.rivalUpperRing.position.y, 0.13, dt * 8);
        this.rivalGlowMat.color.setHex(0x57f2a8);
        this.rivalGlowMat.emissive.setHex(0x57f2a8);
        this.rivalGlowMat.emissiveIntensity = 1.5;
        this.rivalLight.color.setHex(0x57f2a8);
        this.rivalLight.intensity = 1.4;
      }

      this.rivalPrismGroup.position.set(1.18 + shakeX, baseY, 0.35);
    }

    // Update rising golden steam rings on Rival PEELING
    for (let i = this.steamRings.length - 1; i >= 0; i--) {
      const sr = this.steamRings[i];
      sr.age += dt;
      if (sr.age >= sr.life) {
        this.rivalSteamGroup.remove(sr.mesh);
        sr.mesh.geometry.dispose();
        sr.mat.dispose();
        this.steamRings.splice(i, 1);
        continue;
      }
      const p = sr.age / sr.life;
      sr.mesh.position.y = 0.15 + p * 0.72;
      sr.mesh.scale.setScalar(1 + p * 1.45);
      sr.mat.opacity = (1 - p) * 0.75;
    }
  }

  public dispose(): void {
    this.disposed = true;
    this.brassMat.dispose();
    this.obsidianMat.dispose();
    this.rimGlowMat.dispose();
    this.portraitMat.dispose();
    this.sorenCoinMat.dispose();
    this.rivalGlowMat.dispose();
    this.extraMaterials.forEach((m) => m.dispose());
    for (const tex of Object.values(this.portraitTextures)) {
      tex?.dispose();
    }
    for (const sr of this.steamRings) {
      sr.mesh.geometry.dispose();
      sr.mat.dispose();
    }
    this.steamRings = [];
  }
}
