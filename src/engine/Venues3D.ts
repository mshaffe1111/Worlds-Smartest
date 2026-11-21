import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { LightingState, VenueId } from '../types/game';
import {
  getBrushedBrassTextures,
  getGlowSpriteTexture,
  getObsidianTextures,
  getTravertineTextures,
} from './ProceduralTextures';

interface LightingRigPreset {
  bg: number;
  fog: number;
  fogDensity: number;
  keyColor: number;
  keyIntensity: number;
  rimColor: number;
  rimIntensity: number;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  spotColor: number;
  spotIntensity: number;
}

const LIGHTING_PRESETS: Record<LightingState, LightingRigPreset> = {
  BROADCAST: {
    bg: 0x070b14,
    fog: 0x09101f,
    fogDensity: 0.048,
    keyColor: 0xfff0d4,
    keyIntensity: 2.3,
    rimColor: 0x62b4f5,
    rimIntensity: 1.65,
    hemiSky: 0x8ea8d6,
    hemiGround: 0x1b150e,
    hemiIntensity: 0.85,
    spotColor: 0xf7df9c,
    spotIntensity: 2.8,
  },
  FRACTURE: {
    bg: 0x120509,
    fog: 0x1a070d,
    fogDensity: 0.062,
    keyColor: 0xffb38a,
    keyIntensity: 1.55,
    rimColor: 0xff2b45,
    rimIntensity: 3.1,
    hemiSky: 0x6b2030,
    hemiGround: 0x1a060a,
    hemiIntensity: 0.55,
    spotColor: 0xff4658,
    spotIntensity: 3.4,
  },
  INTIMATE: {
    bg: 0x05080f,
    fog: 0x060a14,
    fogDensity: 0.068,
    keyColor: 0xffe4b8,
    keyIntensity: 1.65,
    rimColor: 0x7cb8e8,
    rimIntensity: 1.35,
    hemiSky: 0x4b5f80,
    hemiGround: 0x110e0a,
    hemiIntensity: 0.45,
    spotColor: 0xfff2d6,
    spotIntensity: 3.9,
  },
  ARCHIVE: {
    bg: 0x040914,
    fog: 0x050d1d,
    fogDensity: 0.058,
    keyColor: 0xb8dcff,
    keyIntensity: 1.8,
    rimColor: 0x3de2f0,
    rimIntensity: 2.4,
    hemiSky: 0x3b6f9c,
    hemiGround: 0x081321,
    hemiIntensity: 0.72,
    spotColor: 0x5ce1e6,
    spotIntensity: 2.6,
  },
};

export class Venues3D {
  public readonly root = new THREE.Group();

  // Stage Lights owned & smoothly driven by Venues3D
  private readonly keyLight: THREE.DirectionalLight;
  private readonly rimLight: THREE.DirectionalLight;
  private readonly hemiLight: THREE.HemisphereLight;
  private readonly zenithSpot: THREE.SpotLight;
  private readonly fracturePulseLight: THREE.PointLight;

  // Venue groups & AAA Curved Panoramic Architectural Backdrop
  private readonly venueGroups: Record<VenueId, THREE.Group>;
  private readonly plinthGroup = new THREE.Group();
  private readonly proceduralDaisGroup = new THREE.Group();
  private readonly glbPlinthGroup = new THREE.Group();
  private readonly gltfLoader = new GLTFLoader();
  private readonly backdropLoader = new THREE.TextureLoader();
  private readonly backdropTextures: Partial<Record<VenueId, THREE.Texture>> = {};
  private readonly backdropMesh: THREE.Mesh;
  private readonly backdropMat: THREE.MeshBasicMaterial;
  private readonly backdropTintTarget = new THREE.Color(0xcfd8e8);

  // Shared materials
  private readonly obsidianMat: THREE.MeshStandardMaterial;
  private readonly brassMat: THREE.MeshStandardMaterial;
  private readonly travertineMat: THREE.MeshStandardMaterial;
  private readonly slateMat: THREE.MeshStandardMaterial;
  private readonly ceramicMat: THREE.MeshStandardMaterial;
  private readonly titaniumMat: THREE.MeshStandardMaterial;
  private readonly basaltMat: THREE.MeshStandardMaterial;

  // Animated venue props — Original 5 Venues
  private chDustPoints!: THREE.Points;
  private chDustBaseY!: Float32Array;
  private chVolumetricMat!: THREE.MeshBasicMaterial;
  private chRimStripMats: THREE.MeshBasicMaterial[] = [];

  private gbArmillaryRings: THREE.Mesh[] = [];
  private gbUplightMats: THREE.MeshBasicMaterial[] = [];

  private jpLeftBaffles: THREE.Mesh[] = [];
  private jpRightBaffles: THREE.Mesh[] = [];
  private jpBokehBars: Array<{ mesh: THREE.Mesh; baseOp: number; phase: number }> = [];

  private ledgerDataStrips: Array<{ mesh: THREE.Mesh; speed: number; baseY: number }> = [];
  private studioHorizonRings: THREE.Mesh[] = [];

  // Animated venue props — 5 Newly Unlocked Global Venues
  private brMistPoints!: THREE.Points;
  private brMistPhases!: Float32Array;
  private brBeamMats: THREE.MeshBasicMaterial[] = [];

  private egOculusOuter!: THREE.Group;
  private egOculusInner!: THREE.Group;
  private egSunbeamMat!: THREE.MeshBasicMaterial;
  private egDustPoints!: THREE.Points;
  private egDustPhases!: Float32Array;

  private isAuroraMats: THREE.ShaderMaterial[] = [];
  private isSteamPoints!: THREE.Points;
  private isSteamPhases!: Float32Array;

  private sgFilaments: Array<{ mesh: THREE.Mesh; speed: number; minY: number; maxY: number }> = [];
  private sgCantileverMats: THREE.MeshBasicMaterial[] = [];

  private globalAmpRings: THREE.Mesh[] = [];
  private globalMoonbeamMat!: THREE.MeshBasicMaterial;
  private globalStarPoints!: THREE.Points;
  private globalEmberPoints!: THREE.Points;
  private globalEmberPhases!: Float32Array;

  private readonly extraMaterials: THREE.Material[] = [];
  private readonly extraGeometries: THREE.BufferGeometry[] = [];
  private disposed = false;

  // Target states
  private currentVenue: VenueId = 'CH';
  private lightingState: LightingState = 'BROADCAST';
  private chronoRatio = 1;
  private elapsed = 0;

  // Live interpolated colors
  private readonly liveBg = new THREE.Color(0x070b14);
  private readonly liveFogColor = new THREE.Color(0x09101f);
  private readonly targetBg = new THREE.Color(0x070b14);
  private readonly targetFogColor = new THREE.Color(0x09101f);
  private readonly targetKeyCol = new THREE.Color(0xfff0d4);
  private readonly targetRimCol = new THREE.Color(0x62b4f5);
  private readonly targetHemiSky = new THREE.Color(0x8ea8d6);
  private readonly targetHemiGround = new THREE.Color(0x1b150e);
  private readonly targetSpotCol = new THREE.Color(0xf7df9c);
  private readonly scratchColor = new THREE.Color();

  constructor() {
    const obsidianTex = getObsidianTextures();
    const brassTex = getBrushedBrassTextures();
    const travTex = getTravertineTextures();

    this.obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x0c111d,
      map: obsidianTex.map,
      roughnessMap: obsidianTex.roughnessMap,
      bumpMap: obsidianTex.bumpMap,
      bumpScale: 0.015,
      metalness: 0.32,
      roughness: 0.24,
    });

    this.slateMat = new THREE.MeshStandardMaterial({
      color: 0x161e2e,
      map: obsidianTex.map,
      roughnessMap: obsidianTex.roughnessMap,
      metalness: 0.22,
      roughness: 0.52,
    });

    this.brassMat = new THREE.MeshStandardMaterial({
      color: 0xdfb968,
      map: brassTex.map,
      roughnessMap: brassTex.roughnessMap,
      bumpMap: brassTex.bumpMap,
      bumpScale: 0.016,
      metalness: 0.9,
      roughness: 0.26,
    });

    this.travertineMat = new THREE.MeshStandardMaterial({
      color: 0x4c4338,
      map: travTex.map,
      roughnessMap: travTex.roughnessMap,
      bumpMap: travTex.bumpMap,
      bumpScale: 0.025,
      metalness: 0.08,
      roughness: 0.72,
    });

    this.ceramicMat = new THREE.MeshStandardMaterial({
      color: 0xe6ece9,
      roughness: 0.28,
      metalness: 0.14,
    });

    this.titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x8ea0b5,
      map: brassTex.map,
      roughnessMap: brassTex.roughnessMap,
      metalness: 0.92,
      roughness: 0.24,
    });

    this.basaltMat = new THREE.MeshStandardMaterial({
      color: 0x111722,
      map: travTex.map,
      roughnessMap: travTex.roughnessMap,
      bumpMap: travTex.bumpMap,
      bumpScale: 0.032,
      metalness: 0.22,
      roughness: 0.68,
    });

    // Stage lighting rig
    this.hemiLight = new THREE.HemisphereLight(0x8ea8d6, 0x1b150e, 0.85);
    this.keyLight = new THREE.DirectionalLight(0xfff0d4, 2.3);
    this.keyLight.position.set(3.8, 6.2, 5.2);

    this.rimLight = new THREE.DirectionalLight(0x62b4f5, 1.65);
    this.rimLight.position.set(-4.5, 4.8, -5.5);

    this.zenithSpot = new THREE.SpotLight(0xf7df9c, 2.8, 22, Math.PI * 0.24, 0.65, 1.1);
    this.zenithSpot.position.set(0, 7.6, 0.6);
    this.zenithSpot.target.position.set(0, 0, -0.5);

    this.fracturePulseLight = new THREE.PointLight(0xff2b45, 0, 14, 1.4);
    this.fracturePulseLight.position.set(0, 2.5, -1.5);

    this.root.add(
      this.hemiLight,
      this.keyLight,
      this.rimLight,
      this.zenithSpot,
      this.zenithSpot.target,
      this.fracturePulseLight
    );

    this.buildSharedStagePlinth();
    this.loadBlenderStagePlinth();

    // Preload ALL 10 AAA painted architectural venue backdrops onto the curved 3D panorama dome
    const backdropPaths: Record<VenueId, string> = {
      CH: './assets/venues/ch.jpg',
      GB: './assets/venues/gb.jpg',
      JP: './assets/venues/jp.jpg',
      BR: './assets/venues/br.jpg',
      EG: './assets/venues/eg.jpg',
      IS: './assets/venues/is.jpg',
      SG: './assets/venues/sg.jpg',
      GLOBAL: './assets/venues/global.jpg',
      LEDGER: './assets/venues/ledger.jpg',
      STUDIO: './assets/venues/studio.jpg',
    };
    for (const id of Object.keys(backdropPaths) as VenueId[]) {
      const tex = this.backdropLoader.load(
        backdropPaths[id],
        () => {
          if (this.currentVenue === id) {
            this.backdropMat.map = tex;
            this.backdropMat.needsUpdate = true;
          }
        },
        undefined,
        () => {
          // Graceful fallback if an optional venue backdrop is still syncing
          if (this.backdropTextures[id] === tex) {
            delete this.backdropTextures[id];
          }
        }
      );
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      this.backdropTextures[id] = tex;
    }

    // Curved 150-degree cyclorama panorama wrapping cleanly behind the 3D stage architecture
    this.backdropMat = new THREE.MeshBasicMaterial({
      map: this.backdropTextures.CH ?? null,
      color: 0xcfd8e8,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    });
    const backdropGeo = new THREE.CylinderGeometry(12.2, 12.2, 13.8, 48, 1, true, Math.PI * 0.58, Math.PI * 0.84);
    this.backdropMesh = new THREE.Mesh(backdropGeo, this.backdropMat);
    this.backdropMesh.position.set(0, 2.55, 0.2);
    this.backdropMesh.renderOrder = -10;
    this.root.add(this.backdropMesh);

    this.venueGroups = {
      CH: this.buildGenevaVettingChamber(),
      GB: this.buildLondonSovereignRotunda(),
      JP: this.buildTokyoSkyPavilion(),
      BR: this.buildRioBotanicalCanopy(),
      EG: this.buildCairoSolarAcousticHall(),
      IS: this.buildReykjavikBasaltCaldera(),
      SG: this.buildSingaporeSkyBridge(),
      GLOBAL: this.buildApexForumFinale(),
      LEDGER: this.buildLedgerArchiveDescent(),
      STUDIO: this.buildMeridianStudio(),
    };

    for (const id of Object.keys(this.venueGroups) as VenueId[]) {
      this.root.add(this.venueGroups[id]);
    }
    this.root.add(this.plinthGroup);

    this.setVenue('CH', 'BROADCAST');
  }

  private buildSharedStagePlinth(): void {
    // Broad honed-obsidian grounding floor disc
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 8.2, 0.4, 32), this.obsidianMat);
    floor.position.y = -1.66;
    this.plinthGroup.add(floor);

    // Subtle brass radial floor meridian lines
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0xd4a853,
      transparent: true,
      opacity: 0.24,
    });
    this.extraMaterials.push(lineMat);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const ray = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.008, 4.8), lineMat);
      ray.position.set(Math.sin(a) * 4.8, -1.45, Math.cos(a) * 4.8);
      ray.rotation.y = a;
      this.plinthGroup.add(ray);
    }

    // Procedural central dais & trim (seamlessly replaced when Blender stage_plinth.glb finishes loading!)
    const centralDais = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.65, 0.22, 8), this.obsidianMat);
    centralDais.position.set(0, -1.32, 0);
    this.proceduralDaisGroup.add(centralDais);

    const daisTrim = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.028, 10, 8), this.brassMat);
    daisTrim.rotation.x = Math.PI / 2;
    daisTrim.rotation.z = Math.PI / 8;
    daisTrim.position.y = -1.21;
    this.proceduralDaisGroup.add(daisTrim);

    // Back elevated Character presentation console/podium
    const backDesk = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.75, 1.35, 12), this.obsidianMat);
    backDesk.position.set(0, -0.78, -2.75);
    const deskRim = new THREE.Mesh(new THREE.TorusGeometry(1.56, 0.026, 10, 36), this.brassMat);
    deskRim.rotation.x = Math.PI / 2;
    deskRim.position.set(0, -0.1, -2.75);
    this.plinthGroup.add(backDesk, deskRim, this.proceduralDaisGroup, this.glbPlinthGroup);
  }

  private loadBlenderStagePlinth(): void {
    this.gltfLoader.load(
      './assets/models/stage_plinth.glb',
      (gltf) => {
        if (this.disposed) return;
        const model = gltf.scene;
        model.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(model);
        if (!box.isEmpty()) {
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const horizRadius = Math.max(size.x, size.z) * 0.5;
          let scale = 1.0;
          if (horizRadius > 0.01 && (horizRadius < 1.3 || horizRadius > 4.6)) {
            scale = 2.7 / horizRadius;
            model.scale.multiplyScalar(scale);
          }

          // Center horizontally on X; keep Blender Z offset if rear rail extends behind center
          model.position.x -= center.x * scale;

          // Spec: top surface at y=0 so placing at y=-1.2 seats the sculpted dais cleanly under the Prism
          const scaledMinY = box.min.y * scale;
          const scaledMaxY = box.max.y * scale;
          if (scaledMinY >= -1.25 && scaledMaxY <= 1.6) {
            model.position.y = -1.2;
          } else {
            // Auto-seat bottom cleanly onto stage floor at y=-1.46
            model.position.y = -1.46 - scaledMinY;
          }
        } else {
          model.position.set(0, -1.2, 0);
        }

        this.glbPlinthGroup.add(model);
        this.proceduralDaisGroup.visible = false;
      },
      undefined,
      () => {
        // Graceful fallback keeps procedural octagonal dais visible
      }
    );
  }

  private buildGenevaVettingChamber(): THREE.Group {
    const g = new THREE.Group();

    const pillarAngles = [-0.54, -0.37, 0.37, 0.54];
    for (const frac of pillarAngles) {
      const angle = frac * Math.PI;
      const dist = 7.4;
      const x = Math.sin(angle) * dist;
      const z = -Math.cos(angle) * dist - 0.6;

      const monolith = new THREE.Mesh(new THREE.BoxGeometry(1.05, 10.5, 0.85), this.slateMat);
      monolith.position.set(x, 3.4, z);
      monolith.rotation.y = -angle;
      g.add(monolith);

      const stripMat = new THREE.MeshBasicMaterial({
        color: 0x7fd4ff,
        transparent: true,
        opacity: 0.55,
      });
      this.chRimStripMats.push(stripMat);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.055, 9.2, 0.055), stripMat);
      strip.position.set(0, 0, 0.44);
      monolith.add(strip);

      const collar = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.14, 0.94), this.brassMat);
      collar.position.set(0, -4.4, 0);
      monolith.add(collar);
    }

    const oculus = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.14, 12, 48), this.brassMat);
    oculus.rotation.x = Math.PI / 2;
    oculus.position.set(0, 6.4, -1.2);
    g.add(oculus);

    this.chVolumetricMat = new THREE.MeshBasicMaterial({
      color: 0xaad8ff,
      transparent: true,
      opacity: 0.014,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const volCone = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 4.4, 8.2, 32, 1, true), this.chVolumetricMat);
    volCone.position.set(0, 2.4, -0.8);
    g.add(volCone);

    const count = 120;
    const positions = new Float32Array(count * 3);
    this.chDustBaseY = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(Math.random()) * 4.5;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      const y = -0.8 + Math.random() * 6.5;
      positions[i * 3 + 1] = y;
      this.chDustBaseY[i] = y;
      positions[i * 3 + 2] = Math.sin(a) * r - 1.2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustMat = new THREE.PointsMaterial({
      map: getGlowSpriteTexture(),
      color: 0xdbeeff,
      size: 0.11,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.chDustPoints = new THREE.Points(dustGeo, dustMat);
    g.add(this.chDustPoints);

    return g;
  }

  private buildLondonSovereignRotunda(): THREE.Group {
    const g = new THREE.Group();

    const radius = 7.2;
    const londonFracs = [-0.52, -0.34, 0.34, 0.52];
    for (let i = 0; i < londonFracs.length; i++) {
      const angle = londonFracs[i] * Math.PI;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius - 0.4;

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 7.6, 14), this.travertineMat);
      shaft.position.set(x, 2.4, z);
      g.add(shaft);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.34, 1.18), this.travertineMat);
      cap.position.set(x, 6.3, z);
      cap.rotation.y = -angle;
      const brassBand = new THREE.Mesh(new THREE.CylinderGeometry(0.49, 0.49, 0.12, 16), this.brassMat);
      brassBand.position.set(x, 5.95, z);
      g.add(cap, brassBand);

      const upMat = new THREE.MeshBasicMaterial({
        color: 0xf7cf7c,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      this.gbUplightMats.push(upMat);
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.38, 4.4, 16, 1, true), upMat);
      cone.position.set(x * 0.92, 0.9, z * 0.92);
      g.add(cone);

      if (i === 0 || i === 2) {
        const nextA = londonFracs[i + 1] * Math.PI;
        const midA = (angle + nextA) / 2;
        const arch = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.22, 10, 20, Math.PI), this.travertineMat);
        arch.position.set(Math.sin(midA) * radius, 6.2, -Math.cos(midA) * radius - 0.4);
        arch.rotation.y = -midA;
        g.add(arch);
      }
    }

    const ringConfigs = [
      { r: 4.1, tube: 0.09, tiltX: Math.PI * 0.42, tiltZ: 0.14 },
      { r: 3.3, tube: 0.065, tiltX: Math.PI * 0.56, tiltZ: -0.22 },
      { r: 2.4, tube: 0.048, tiltX: Math.PI * 0.36, tiltZ: 0.3 },
    ];
    for (const cfg of ringConfigs) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(cfg.r, cfg.tube, 12, 64), this.brassMat);
      ring.position.set(0, 4.6, -3.4);
      ring.rotation.x = cfg.tiltX;
      ring.rotation.z = cfg.tiltZ;
      this.gbArmillaryRings.push(ring);
      g.add(ring);
    }

    const gridMat = new THREE.MeshBasicMaterial({
      color: 0xd4a853,
      transparent: true,
      opacity: 0.18,
    });
    this.extraMaterials.push(gridMat);
    for (let gx = -3; gx <= 3; gx++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.01, 7.5), gridMat);
      bar.position.set(gx * 1.15, -1.39, -2.5);
      g.add(bar);
    }

    return g;
  }

  private buildTokyoSkyPavilion(): THREE.Group {
    const g = new THREE.Group();

    const hinokiMat = new THREE.MeshStandardMaterial({
      color: 0x261c17,
      roughness: 0.58,
      metalness: 0.15,
    });
    this.extraMaterials.push(hinokiMat);

    const vermilionMat = new THREE.MeshBasicMaterial({ color: 0xe64553 });
    this.extraMaterials.push(vermilionMat);

    for (const side of [-1, 1]) {
      const frameGroup = new THREE.Group();
      frameGroup.position.set(side * 4.4, 2.2, -5.6);
      frameGroup.rotation.y = -side * 0.36;

      for (let v = -3; v <= 3; v++) {
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, 7.2, 0.12), hinokiMat);
        rib.position.x = v * 0.52;
        frameGroup.add(rib);
      }
      for (let h = -3; h <= 3; h++) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.065, 0.1), hinokiMat);
        rail.position.y = h * 1.05;
        frameGroup.add(rail);
      }
      const vermilionEdge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 7.2, 0.08), vermilionMat);
      vermilionEdge.position.x = -side * 1.72;
      frameGroup.add(vermilionEdge);
      g.add(frameGroup);
    }

    const bokehColors = [0x3b6dff, 0x5ce1e6, 0xe84d7a, 0xff5a4f, 0x7c5cff, 0xf7df9c];
    for (let i = 0; i < 34; i++) {
      const bx = (i - 16.5) * 0.62 + Math.sin(i * 3.1) * 0.25;
      const bh = 1.4 + Math.abs(Math.sin(i * 1.7)) * 4.6;
      const bw = 0.09 + (i % 3) * 0.06;
      const col = bokehColors[i % bokehColors.length];
      const baseOp = 0.22 + (i % 4) * 0.08;
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: baseOp,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      this.extraMaterials.push(mat);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.04), mat);
      bar.position.set(bx, -0.6 + bh * 0.5, -10.4 - (i % 3) * 1.1);
      this.jpBokehBars.push({ mesh: bar, baseOp, phase: i * 0.65 });
      g.add(bar);
    }

    const trimCyanMat = new THREE.MeshBasicMaterial({ color: 0x5ce1e6 });
    const trimRedMat = new THREE.MeshBasicMaterial({ color: 0xff5263 });
    this.extraMaterials.push(trimCyanMat, trimRedMat);

    for (let i = 0; i < 4; i++) {
      const y = 0.3 + i * 1.15;
      const leftBaffle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 2.2), this.obsidianMat);
      leftBaffle.position.set(-4.2, y, -2.5 - i * 0.3);
      leftBaffle.rotation.y = 0.35;
      leftBaffle.userData.baseX = -4.2;
      const trimL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.82, 2.22), trimCyanMat);
      trimL.position.x = 0.095;
      leftBaffle.add(trimL);
      this.jpLeftBaffles.push(leftBaffle);

      const rightBaffle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 2.2), this.obsidianMat);
      rightBaffle.position.set(4.2, y, -2.5 - i * 0.3);
      rightBaffle.rotation.y = -0.35;
      rightBaffle.userData.baseX = 4.2;
      const trimR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.82, 2.22), trimRedMat);
      trimR.position.x = -0.095;
      rightBaffle.add(trimR);
      this.jpRightBaffles.push(rightBaffle);

      g.add(leftBaffle, rightBaffle);
    }

    return g;
  }

  /**
   * BR — Rio Botanical Glass Canopy:
   * Sculpted white Niemeyer curved side arch ribs + glowing emerald/coral rainforest mist particles.
   */
  private buildRioBotanicalCanopy(): THREE.Group {
    const g = new THREE.Group();

    // Sweeping Niemeyer curved white-ceramic structural side arches (center vista unobstructed!)
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const zOff = -1.8 - i * 2.25;
        const xBase = side * (5.6 + i * 0.55);
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(xBase, -1.6, zOff),
          new THREE.Vector3(xBase - side * 0.55, 2.1, zOff - 0.15),
          new THREE.Vector3(xBase - side * 1.85, 5.4, zOff - 0.4),
          new THREE.Vector3(xBase - side * 3.1, 6.85, zOff - 0.55),
        ]);
        const ribGeo = new THREE.TubeGeometry(curve, 28, 0.19 - i * 0.025, 10, false);
        this.extraGeometries.push(ribGeo);
        const rib = new THREE.Mesh(ribGeo, this.ceramicMat);
        g.add(rib);

        // Brushed-gold tension spine hugging inner edge of each Niemeyer rib
        const goldSpineGeo = new THREE.TubeGeometry(curve, 24, 0.042, 8, false);
        this.extraGeometries.push(goldSpineGeo);
        const goldSpine = new THREE.Mesh(goldSpineGeo, this.brassMat);
        goldSpine.position.x = -side * 0.19;
        g.add(goldSpine);
      }

      // Soft botanical emerald canopy light shafts grazing outer wings
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x34e89e,
        transparent: true,
        opacity: 0.065,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      this.brBeamMats.push(beamMat);
      this.extraMaterials.push(beamMat);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 2.35, 8.4, 20, 1, true), beamMat);
      beam.position.set(side * 4.5, 2.4, -3.8);
      beam.rotation.z = side * 0.22;
      g.add(beam);
    }

    // Rising glowing emerald & warm coral rainforest mist / pollen particles
    const count = 150;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.brMistPhases = new Float32Array(count);
    const emerald = new THREE.Color(0x38f2a6);
    const coral = new THREE.Color(0xff7d6b);
    const gold = new THREE.Color(0xf7df9c);

    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.6 + Math.random() * 5.2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = -1.2 + Math.random() * 7.6;
      positions[i * 3 + 2] = Math.sin(a) * r - 2.2;
      this.brMistPhases[i] = Math.random() * Math.PI * 2;

      const c = i % 5 === 0 ? coral : i % 7 === 0 ? gold : emerald;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const mistGeo = new THREE.BufferGeometry();
    mistGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    mistGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.extraGeometries.push(mistGeo);

    const mistMat = new THREE.PointsMaterial({
      map: getGlowSpriteTexture(),
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.extraMaterials.push(mistMat);

    this.brMistPoints = new THREE.Points(mistGeo, mistMat);
    g.add(this.brMistPoints);

    return g;
  }

  /**
   * EG — Cairo Solar Acoustic Hall:
   * Sweeping golden mechanical overhead brass oculus + dramatic slanted volumetric ochre sunbeam
   * + drifting desert gold dust + outer travertine acoustic pylons.
   */
  private buildCairoSolarAcousticHall(): THREE.Group {
    const g = new THREE.Group();

    // Flanking stepped sandstone/travertine solar pylons on outer margins
    const pylonAngles = [-0.52, -0.36, 0.36, 0.52];
    for (const frac of pylonAngles) {
      const angle = frac * Math.PI;
      const dist = 7.4;
      const x = Math.sin(angle) * dist;
      const z = -Math.cos(angle) * dist - 0.5;

      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.78, 9.6, 4), this.travertineMat);
      pylon.position.set(x, 3.0, z);
      pylon.rotation.y = -angle + Math.PI / 4;
      g.add(pylon);

      const goldInlay = new THREE.Mesh(new THREE.BoxGeometry(0.06, 8.2, 0.06), this.brassMat);
      goldInlay.position.set(x * 0.92, 3.0, z * 0.92);
      goldInlay.rotation.y = -angle;
      g.add(goldInlay);
    }

    // Sweeping mechanical overhead brass solar oculus (outer & inner counter-rotating gear rings)
    this.egOculusOuter = new THREE.Group();
    this.egOculusOuter.position.set(0.35, 5.95, -1.5);
    this.egOculusOuter.rotation.x = 0.22;
    this.egOculusOuter.rotation.z = -0.18;

    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.12, 12, 64), this.brassMat);
    outerRing.rotation.x = Math.PI / 2;
    this.egOculusOuter.add(outerRing);

    // 12 radial brass sun-vane blades around the oculus aperture
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12;
      const vane = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 1.05), this.brassMat);
      vane.position.set(Math.cos(a) * 2.75, 0, Math.sin(a) * 2.75);
      vane.rotation.y = -a + 0.42;
      this.egOculusOuter.add(vane);
    }

    this.egOculusInner = new THREE.Group();
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.075, 12, 48), this.brassMat);
    innerRing.rotation.x = Math.PI / 2;
    this.egOculusInner.add(innerRing);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8;
      const tick = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), this.brassMat);
      tick.position.set(Math.cos(a) * 2.15, 0, Math.sin(a) * 2.15);
      this.egOculusInner.add(tick);
    }
    this.egOculusOuter.add(this.egOculusInner);
    g.add(this.egOculusOuter);

    // Dramatic slanted volumetric ochre sunbeam cutting diagonally across the hall
    this.egSunbeamMat = new THREE.MeshBasicMaterial({
      color: 0xf7b955,
      transparent: true,
      opacity: 0.088,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.extraMaterials.push(this.egSunbeamMat);
    const sunbeamGeo = new THREE.CylinderGeometry(1.15, 3.85, 11.2, 32, 1, true);
    this.extraGeometries.push(sunbeamGeo);
    const sunbeam = new THREE.Mesh(sunbeamGeo, this.egSunbeamMat);
    sunbeam.position.set(-0.35, 1.85, -1.2);
    sunbeam.rotation.z = -0.34;
    sunbeam.rotation.x = 0.14;
    g.add(sunbeam);

    // Drifting golden desert dust particles catching the sunbeam
    const dustCount = 150;
    const dustPos = new Float32Array(dustCount * 3);
    this.egDustPhases = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 9.5;
      dustPos[i * 3 + 1] = -1.0 + Math.random() * 7.2;
      dustPos[i * 3 + 2] = -5.5 + Math.random() * 6.5;
      this.egDustPhases[i] = Math.random() * Math.PI * 2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    this.extraGeometries.push(dustGeo);

    const dustMat = new THREE.PointsMaterial({
      map: getGlowSpriteTexture(),
      color: 0xfad27a,
      size: 0.125,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.extraMaterials.push(dustMat);
    this.egDustPoints = new THREE.Points(dustGeo, dustMat);
    g.add(this.egDustPoints);

    return g;
  }

  /**
   * IS — Reykjavik Geothermal Basalt Caldera:
   * Undulating translucent 3D Aurora Borealis ribbons (emerald/violet vertex-animated waves!)
   * + rising geothermal steam particles + hexagonal basalt flank formations.
   */
  private buildReykjavikBasaltCaldera(): THREE.Group {
    const g = new THREE.Group();

    // Flanking stepped hexagonal volcanic basalt column clusters (keeping center caldera vista open!)
    for (const side of [-1, 1]) {
      const clusterOffsets = [
        { dx: 0, dz: 0, h: 7.4, r: 0.52 },
        { dx: 0.72, dz: -0.5, h: 5.8, r: 0.44 },
        { dx: -0.58, dz: -0.65, h: 8.8, r: 0.48 },
        { dx: 0.22, dz: 0.78, h: 4.2, r: 0.38 },
      ];
      for (const c of clusterOffsets) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(c.r, c.r * 1.06, c.h, 6), this.basaltMat);
        col.position.set(side * (5.6 + c.dx), -1.6 + c.h * 0.5, -4.4 + c.dz);
        g.add(col);
      }
    }

    // 3 Undulating translucent 3D Aurora Borealis ribbons with vertex-animated wave shaders!
    const ribbonConfigs = [
      { y: 5.4, z: -7.8, width: 17.5, height: 2.8, phase: 0.0, rotY: 0.06, colA: 0x26f5a8, colB: 0x8f5cff },
      { y: 4.5, z: -6.2, width: 15.0, height: 2.3, phase: 2.1, rotY: -0.1, colA: 0x3ae2f2, colB: 0x2df598 },
      { y: 6.2, z: -9.2, width: 19.0, height: 3.1, phase: 4.2, rotY: 0.04, colA: 0x9b5cff, colB: 0x2ef0b4 },
    ];

    for (const cfg of ribbonConfigs) {
      const geo = new THREE.PlaneGeometry(cfg.width, cfg.height, 56, 8);
      this.extraGeometries.push(geo);

      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uPhase: { value: cfg.phase },
          uColorA: { value: new THREE.Color(cfg.colA) },
          uColorB: { value: new THREE.Color(cfg.colB) },
          uFractureMix: { value: 0 },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uPhase;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vUv = uv;
            vec3 pos = position;
            // Arch smoothly across overhead sky + organic traveling aurora undulations
            float xNorm = (uv.x - 0.5) * 2.0;
            pos.y -= xNorm * xNorm * 0.85;
            float wave1 = sin(pos.x * 0.45 + uTime * 0.72 + uPhase) * 0.65;
            float wave2 = cos(pos.x * 0.92 - uTime * 0.48 + uPhase * 1.4) * 0.35;
            pos.z += wave1 + wave2;
            pos.y += sin(pos.x * 0.6 + uTime * 0.55 + uPhase) * 0.28 * uv.y;
            vWave = 0.5 + 0.5 * sin(pos.x * 0.8 + uTime * 0.9 + uPhase);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uPhase;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          uniform float uFractureMix;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            // Silky vertical aurora curtain rays fading softly at top, bottom, and side ends
            float edgeX = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
            float edgeY = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.15, vUv.y);
            float rays = 0.55 + 0.45 * sin(vUv.x * 38.0 + uTime * 1.4 + uPhase + sin(vUv.x * 11.0 - uTime * 0.7));
            float shimmer = 0.72 + 0.28 * vWave;

            vec3 baseCol = mix(uColorA, uColorB, clamp(vUv.y * 0.85 + vWave * 0.3, 0.0, 1.0));
            vec3 fractureCol = vec3(1.0, 0.22, 0.38);
            vec3 col = mix(baseCol, fractureCol, uFractureMix * 0.65);

            float alpha = edgeX * edgeY * rays * shimmer * 0.42;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      });
      this.isAuroraMats.push(mat);
      this.extraMaterials.push(mat);

      const ribbon = new THREE.Mesh(geo, mat);
      ribbon.position.set(0, cfg.y, cfg.z);
      ribbon.rotation.y = cfg.rotY;
      ribbon.rotation.x = 0.18;
      g.add(ribbon);
    }

    // Rising geothermal steam particles drifting from outer volcanic vents
    const steamCount = 130;
    const steamPos = new Float32Array(steamCount * 3);
    this.isSteamPhases = new Float32Array(steamCount);
    for (let i = 0; i < steamCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      steamPos[i * 3] = side * (2.4 + Math.random() * 4.2);
      steamPos[i * 3 + 1] = -1.5 + Math.random() * 6.8;
      steamPos[i * 3 + 2] = -6.2 + Math.random() * 6.4;
      this.isSteamPhases[i] = Math.random() * Math.PI * 2;
    }
    const steamGeo = new THREE.BufferGeometry();
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
    this.extraGeometries.push(steamGeo);

    const steamMat = new THREE.PointsMaterial({
      map: getGlowSpriteTexture(),
      color: 0xc2f2f0,
      size: 0.34,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.extraMaterials.push(steamMat);
    this.isSteamPoints = new THREE.Points(steamGeo, steamMat);
    g.add(this.isSteamPoints);

    return g;
  }

  /**
   * SG — Singapore Diplomatic Sky-Bridge & Core:
   * Flanking cantilevered brushed silver-platinum ribs + vertical cyan/ultraviolet Ledger server filaments.
   */
  private buildSingaporeSkyBridge(): THREE.Group {
    const g = new THREE.Group();

    const cyanMat = new THREE.MeshBasicMaterial({
      color: 0x3de2f0,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
    });
    const uvMat = new THREE.MeshBasicMaterial({
      color: 0x9e6bff,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
    });
    this.sgCantileverMats.push(cyanMat, uvMat);
    this.extraMaterials.push(cyanMat, uvMat);

    // Flanking cantilevered silver-platinum sky-bridge structural ribs
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const y = 0.2 + i * 1.65;
        const z = -2.4 - i * 1.15;

        const ribCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 7.2, y - 1.1, z),
          new THREE.Vector3(side * 5.2, y + 0.15, z + 0.15),
          new THREE.Vector3(side * 3.85, y + 0.45, z + 0.2),
        ]);
        const ribGeo = new THREE.TubeGeometry(ribCurve, 18, 0.11, 8, false);
        this.extraGeometries.push(ribGeo);
        const rib = new THREE.Mesh(ribGeo, this.titaniumMat);
        g.add(rib);

        const edgeRailGeo = new THREE.TubeGeometry(ribCurve, 16, 0.025, 6, false);
        this.extraGeometries.push(edgeRailGeo);
        const edgeRail = new THREE.Mesh(edgeRailGeo, i % 2 === 0 ? cyanMat : uvMat);
        edgeRail.position.y = -0.1;
        g.add(edgeRail);
      }

      // Vertical cyan/ultraviolet Ledger server light filaments scrolling upward along outer fins
      for (let k = 0; k < 6; k++) {
        const x = side * (4.4 + (k % 3) * 0.95);
        const z = -3.6 - k * 0.85;
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.16, 9.6, 0.42), this.obsidianMat);
        fin.position.set(x, 3.0, z);
        fin.rotation.y = -side * 0.28;
        g.add(fin);

        const isCyan = (k + (side > 0 ? 1 : 0)) % 2 === 0;
        const filMat = new THREE.MeshBasicMaterial({
          color: isCyan ? 0x3de2f0 : 0xa56bff,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });
        this.extraMaterials.push(filMat);

        const filament = new THREE.Mesh(new THREE.BoxGeometry(0.045, 2.1, 0.045), filMat);
        const minY = -1.2;
        const maxY = 7.4;
        filament.position.set(x - side * 0.12, minY + ((k * 1.45) % (maxY - minY)), z + 0.18);
        this.sgFilaments.push({
          mesh: filament,
          speed: 1.5 + (k % 3) * 0.72,
          minY,
          maxY,
        });
        g.add(filament);
      }
    }

    return g;
  }

  /**
   * GLOBAL — Apex Forum Grand Finale:
   * Monumental counter-rotating brushed-titanium sovereign amphitheater rings
   * + starry storm-lit moonlight shaft + radiant gold floating embers!
   */
  private buildApexForumFinale(): THREE.Group {
    const g = new THREE.Group();

    // Monumental counter-rotating brushed-titanium & gold sovereign amphitheater rings
    const ringDefs = [
      { r: 5.8, tube: 0.12, y: 4.8, z: -3.2, tiltX: Math.PI * 0.44, tiltZ: 0.12, mat: this.titaniumMat },
      { r: 4.85, tube: 0.085, y: 4.4, z: -3.0, tiltX: Math.PI * 0.52, tiltZ: -0.16, mat: this.brassMat },
      { r: 3.7, tube: 0.065, y: 3.9, z: -2.6, tiltX: Math.PI * 0.41, tiltZ: 0.22, mat: this.titaniumMat },
      { r: 6.4, tube: 0.055, y: 1.4, z: -2.4, tiltX: Math.PI * 0.49, tiltZ: -0.05, mat: this.brassMat },
    ];
    for (const def of ringDefs) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(def.r, def.tube, 14, 72), def.mat);
      ring.position.set(0, def.y, def.z);
      ring.rotation.x = def.tiltX;
      ring.rotation.z = def.tiltZ;

      // Sculpted cardinal brass lugs along each monumental ring
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI * 2) / 8;
        const lug = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.18), this.brassMat);
        lug.position.set(Math.cos(a) * def.r, Math.sin(a) * def.r, 0);
        lug.rotation.z = a;
        ring.add(lug);
      }
      this.globalAmpRings.push(ring);
      g.add(ring);
    }

    // Starry storm-lit moonlight shaft pouring from zenith onto the grand stage
    this.globalMoonbeamMat = new THREE.MeshBasicMaterial({
      color: 0xd9e8ff,
      transparent: true,
      opacity: 0.075,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.extraMaterials.push(this.globalMoonbeamMat);
    const moonGeo = new THREE.CylinderGeometry(1.5, 4.9, 10.2, 36, 1, true);
    this.extraGeometries.push(moonGeo);
    const moonShaft = new THREE.Mesh(moonGeo, this.globalMoonbeamMat);
    moonShaft.position.set(0, 3.2, -1.2);
    g.add(moonShaft);

    // High-altitude celestial starfield halo
    const starCount = 160;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 4.5 + Math.random() * 6.5;
      starPos[i * 3] = Math.cos(a) * r;
      starPos[i * 3 + 1] = 1.6 + Math.random() * 6.8;
      starPos[i * 3 + 2] = -Math.abs(Math.sin(a) * r) - 2.2;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.extraGeometries.push(starGeo);

    const starMat = new THREE.PointsMaterial({
      map: getGlowSpriteTexture(),
      color: 0xe6f0ff,
      size: 0.095,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.extraMaterials.push(starMat);
    this.globalStarPoints = new THREE.Points(starGeo, starMat);
    g.add(this.globalStarPoints);

    // Radiant rising sovereign gold floating embers
    const emberCount = 140;
    const emberPos = new Float32Array(emberCount * 3);
    this.globalEmberPhases = new Float32Array(emberCount);
    for (let i = 0; i < emberCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * 4.8;
      emberPos[i * 3] = Math.cos(a) * r;
      emberPos[i * 3 + 1] = -1.2 + Math.random() * 7.8;
      emberPos[i * 3 + 2] = Math.sin(a) * r - 1.5;
      this.globalEmberPhases[i] = Math.random() * Math.PI * 2;
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    this.extraGeometries.push(emberGeo);

    const emberMat = new THREE.PointsMaterial({
      map: getGlowSpriteTexture(),
      color: 0xffd778,
      size: 0.145,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.extraMaterials.push(emberMat);
    this.globalEmberPoints = new THREE.Points(emberGeo, emberMat);
    g.add(this.globalEmberPoints);

    return g;
  }

  private buildLedgerArchiveDescent(): THREE.Group {
    const g = new THREE.Group();

    const glassColMat = new THREE.MeshStandardMaterial({
      color: 0x0a1c30,
      emissive: 0x0b2640,
      emissiveIntensity: 0.45,
      roughness: 0.14,
      metalness: 0.55,
      transparent: true,
      opacity: 0.78,
    });
    this.extraMaterials.push(glassColMat);

    const cols = 10;
    for (let i = 0; i < cols; i++) {
      const a = (i / cols) * Math.PI * 2;
      const r = 6.4 + (i % 2) * 2.1;
      const x = Math.sin(a) * r;
      const z = -Math.cos(a) * r - 1.0;

      const col = new THREE.Mesh(new THREE.BoxGeometry(0.85, 18, 0.85), glassColMat);
      col.position.set(x, 2, z);
      col.rotation.y = a;
      g.add(col);

      const isGold = i % 3 === 0;
      const stripMat = new THREE.MeshBasicMaterial({
        color: isGold ? 0xf7df9c : 0x4fd1e8,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      this.extraMaterials.push(stripMat);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.2, 0.06), stripMat);
      strip.position.set(x * 0.92, -3 + (i % 4) * 2.4, z * 0.92);
      this.ledgerDataStrips.push({
        mesh: strip,
        speed: 1.4 + (i % 3) * 0.75,
        baseY: -4 + (i % 5) * 2.2,
      });
      g.add(strip);
    }

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4fd1e8, transparent: true, opacity: 0.35 });
    this.extraMaterials.push(ringMat);
    for (const y of [-1.2, 2.8, 6.2]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.04, 8, 64), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, y, -1.2);
      g.add(ring);
    }

    return g;
  }

  private buildMeridianStudio(): THREE.Group {
    const g = new THREE.Group();

    const horizonCfg = [
      { r: 4.8, y: 2.2, tube: 0.055, color: 0xf7df9c },
      { r: 5.5, y: 2.5, tube: 0.032, color: 0x5ce1e6 },
      { r: 3.9, y: 1.85, tube: 0.028, color: 0xd4a853 },
    ];
    for (const c of horizonCfg) {
      const mat = new THREE.MeshStandardMaterial({
        color: c.color,
        emissive: c.color,
        emissiveIntensity: 0.65,
        metalness: 0.85,
        roughness: 0.22,
      });
      this.extraMaterials.push(mat);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(c.r, c.tube, 12, 72), mat);
      ring.position.set(0, c.y, -4.4);
      ring.rotation.x = Math.PI * 0.44;
      this.studioHorizonRings.push(ring);
      g.add(ring);
    }

    return g;
  }

  public setVenue(venue: VenueId, lighting?: LightingState): void {
    this.currentVenue = venue;
    for (const id of Object.keys(this.venueGroups) as VenueId[]) {
      this.venueGroups[id].visible = id === venue;
    }
    const tex = this.backdropTextures[venue] ?? this.backdropTextures.CH ?? this.backdropTextures.STUDIO;
    if (tex) {
      this.backdropMat.map = tex;
      this.backdropMat.needsUpdate = true;
    }

    if (lighting) {
      this.setLightingState(lighting);
    } else {
      const defaultState: LightingState =
        venue === 'LEDGER' ? 'ARCHIVE' : venue === 'CH' ? 'INTIMATE' : 'BROADCAST';
      this.setLightingState(defaultState);
    }
  }

  public setLightingState(state: LightingState): void {
    this.lightingState = state;
    const p = LIGHTING_PRESETS[state];
    this.targetBg.setHex(p.bg);
    this.targetFogColor.setHex(p.fog);
    this.targetKeyCol.setHex(p.keyColor);
    this.targetRimCol.setHex(p.rimColor);
    this.targetHemiSky.setHex(p.hemiSky);
    this.targetHemiGround.setHex(p.hemiGround);
    this.targetSpotCol.setHex(p.spotColor);
    if (state === 'FRACTURE') {
      this.backdropTintTarget.setHex(0xff7886);
    } else if (state === 'INTIMATE') {
      this.backdropTintTarget.setHex(0xa8b5cb);
    } else if (state === 'ARCHIVE') {
      this.backdropTintTarget.setHex(0x9bd2e8);
    } else {
      this.backdropTintTarget.setHex(0xd8e0ee);
    }
  }

  public setChronoProgress(ratio: number): void {
    this.chronoRatio = THREE.MathUtils.clamp(ratio, 0, 1);
  }

  public update(dt: number, scene: THREE.Scene): void {
    this.elapsed += dt;
    const preset = LIGHTING_PRESETS[this.lightingState];
    const rate = Math.min(1, dt * 3.2);

    this.liveBg.lerp(this.targetBg, rate);
    this.liveFogColor.lerp(this.targetFogColor, rate);
    this.backdropMat.color.lerp(this.backdropTintTarget, rate);
    scene.background = this.liveBg;
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(this.liveFogColor);
      scene.fog.density = THREE.MathUtils.lerp(scene.fog.density, preset.fogDensity, rate);
    }

    this.keyLight.color.lerp(this.targetKeyCol, rate);
    this.keyLight.intensity = THREE.MathUtils.lerp(this.keyLight.intensity, preset.keyIntensity, rate);

    this.rimLight.color.lerp(this.targetRimCol, rate);
    this.rimLight.intensity = THREE.MathUtils.lerp(this.rimLight.intensity, preset.rimIntensity, rate);

    this.hemiLight.color.lerp(this.targetHemiSky, rate);
    this.hemiLight.groundColor.lerp(this.targetHemiGround, rate);
    this.hemiLight.intensity = THREE.MathUtils.lerp(this.hemiLight.intensity, preset.hemiIntensity, rate);

    this.zenithSpot.color.lerp(this.targetSpotCol, rate);
    this.zenithSpot.intensity = THREE.MathUtils.lerp(this.zenithSpot.intensity, preset.spotIntensity, rate);

    if (this.lightingState === 'FRACTURE') {
      const pulse = 0.55 + 0.45 * Math.sin(this.elapsed * 3.6);
      this.fracturePulseLight.intensity = THREE.MathUtils.lerp(
        this.fracturePulseLight.intensity,
        2.2 + pulse * 2.4,
        rate * 2
      );
      this.fracturePulseLight.position.x = Math.sin(this.elapsed * 1.4) * 3.8;
    } else {
      this.fracturePulseLight.intensity = THREE.MathUtils.lerp(this.fracturePulseLight.intensity, 0, rate * 2);
    }

    // Per-venue living choreography across ALL 10 global venues
    if (this.currentVenue === 'CH') {
      const posAttr = this.chDustPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) + dt * (0.12 + (i % 5) * 0.03);
        if (y > 6.2) y = -0.8;
        const driftX = Math.sin(this.elapsed * 0.4 + this.chDustBaseY[i]) * 0.0015;
        posAttr.setX(i, posAttr.getX(i) + driftX);
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
      this.chDustPoints.rotation.y += dt * 0.03;

      this.scratchColor.setHex(this.lightingState === 'FRACTURE' ? 0xff4658 : 0x7fd4ff);
      for (const m of this.chRimStripMats) {
        m.color.lerp(this.scratchColor, rate);
      }
      this.scratchColor.setHex(this.lightingState === 'FRACTURE' ? 0xff5263 : 0xaad8ff);
      this.chVolumetricMat.color.lerp(this.scratchColor, rate);
    } else if (this.currentVenue === 'GB') {
      this.gbArmillaryRings.forEach((ring, idx) => {
        ring.rotation.y += dt * (0.09 + idx * 0.05) * (idx % 2 === 0 ? 1 : -1);
        ring.rotation.z += dt * 0.025;
      });
      this.scratchColor.setHex(this.lightingState === 'FRACTURE' ? 0xff4c5e : 0xf7cf7c);
      for (const m of this.gbUplightMats) {
        m.color.lerp(this.scratchColor, rate);
      }
    } else if (this.currentVenue === 'JP') {
      for (const b of this.jpBokehBars) {
        const mat = b.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = b.baseOp + Math.sin(this.elapsed * 1.8 + b.phase) * 0.1;
      }
      const tension = 1 - this.chronoRatio;
      const inwardShift = tension * 1.15;
      for (const b of this.jpLeftBaffles) {
        const targetX = (b.userData.baseX as number) + inwardShift;
        b.position.x = THREE.MathUtils.lerp(b.position.x, targetX, Math.min(1, dt * 4));
      }
      for (const b of this.jpRightBaffles) {
        const targetX = (b.userData.baseX as number) - inwardShift;
        b.position.x = THREE.MathUtils.lerp(b.position.x, targetX, Math.min(1, dt * 4));
      }
    } else if (this.currentVenue === 'BR') {
      const posAttr = this.brMistPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) + dt * (0.24 + (i % 5) * 0.055);
        if (y > 6.6) y = -1.2;
        const sway = Math.sin(this.elapsed * 0.75 + this.brMistPhases[i]) * 0.004;
        posAttr.setX(i, posAttr.getX(i) + sway);
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
      this.brMistPoints.rotation.y += dt * 0.024;
      this.scratchColor.setHex(this.lightingState === 'FRACTURE' ? 0xff5263 : 0x34e89e);
      for (const m of this.brBeamMats) {
        m.color.lerp(this.scratchColor, rate);
      }
    } else if (this.currentVenue === 'EG') {
      this.egOculusOuter.rotation.y += dt * 0.12;
      this.egOculusInner.rotation.y -= dt * 0.28;
      this.egSunbeamMat.opacity = 0.075 + Math.sin(this.elapsed * 1.1) * 0.018;
      this.scratchColor.setHex(this.lightingState === 'FRACTURE' ? 0xff4c5e : 0xf7b955);
      this.egSunbeamMat.color.lerp(this.scratchColor, rate);

      const posAttr = this.egDustPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - dt * (0.06 + (i % 4) * 0.025);
        let x = posAttr.getX(i) + Math.cos(this.elapsed * 0.42 + this.egDustPhases[i]) * dt * 0.16;
        if (y < -1.1) y = 6.2;
        if (x > 5.0) x = -5.0;
        if (x < -5.0) x = 5.0;
        posAttr.setX(i, x);
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    } else if (this.currentVenue === 'IS') {
      const targetFrac = this.lightingState === 'FRACTURE' ? 1.0 : 0.0;
      for (const mat of this.isAuroraMats) {
        mat.uniforms.uTime.value = this.elapsed;
        mat.uniforms.uFractureMix.value = THREE.MathUtils.lerp(
          mat.uniforms.uFractureMix.value as number,
          targetFrac,
          rate
        );
      }
      const posAttr = this.isSteamPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) + dt * (0.36 + (i % 4) * 0.08);
        if (y > 5.6) y = -1.5;
        const drift = Math.sin(this.elapsed * 0.6 + this.isSteamPhases[i]) * 0.005;
        posAttr.setX(i, posAttr.getX(i) + drift);
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    } else if (this.currentVenue === 'SG') {
      const speedMult = this.lightingState === 'FRACTURE' ? 1.75 : 1.0 + (1 - this.chronoRatio) * 0.55;
      for (const fil of this.sgFilaments) {
        fil.mesh.position.y += dt * fil.speed * speedMult;
        if (fil.mesh.position.y > fil.maxY) {
          fil.mesh.position.y = fil.minY;
        }
      }
    } else if (this.currentVenue === 'GLOBAL') {
      this.globalAmpRings.forEach((ring, idx) => {
        const dir = idx % 2 === 0 ? 1 : -1;
        ring.rotation.z += dt * (0.075 + idx * 0.025) * dir;
        ring.rotation.y += dt * 0.03 * -dir;
      });
      this.globalMoonbeamMat.opacity = 0.068 + Math.sin(this.elapsed * 0.9) * 0.018;
      this.scratchColor.setHex(this.lightingState === 'FRACTURE' ? 0xff4658 : 0xd9e8ff);
      this.globalMoonbeamMat.color.lerp(this.scratchColor, rate);
      this.globalStarPoints.rotation.y += dt * 0.012;

      const posAttr = this.globalEmberPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
      const emberBoost = 1 + (1 - this.chronoRatio) * 0.6;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) + dt * (0.32 + (i % 5) * 0.06) * emberBoost;
        if (y > 6.8) y = -1.2;
        const spiral = Math.sin(this.elapsed * 0.9 + this.globalEmberPhases[i]) * 0.0045;
        posAttr.setX(i, posAttr.getX(i) + spiral);
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
      this.globalEmberPoints.rotation.y += dt * 0.045;
    } else if (this.currentVenue === 'LEDGER') {
      for (const strip of this.ledgerDataStrips) {
        strip.mesh.position.y += dt * strip.speed;
        if (strip.mesh.position.y > 7.5) {
          strip.mesh.position.y = -3.5;
        }
      }
    } else if (this.currentVenue === 'STUDIO') {
      this.studioHorizonRings.forEach((ring, i) => {
        ring.rotation.z += dt * (0.11 + i * 0.04) * (i % 2 === 0 ? 1 : -1);
        ring.rotation.x = Math.PI * 0.44 + Math.sin(this.elapsed * 0.6 + i) * 0.08;
      });
    }
  }

  public dispose(): void {
    this.disposed = true;
    this.obsidianMat.dispose();
    this.slateMat.dispose();
    this.brassMat.dispose();
    this.travertineMat.dispose();
    this.ceramicMat.dispose();
    this.titaniumMat.dispose();
    this.basaltMat.dispose();
    this.backdropMat.dispose();
    this.backdropMesh.geometry.dispose();
    for (const tex of Object.values(this.backdropTextures)) {
      tex?.dispose();
    }
    this.chVolumetricMat.dispose();
    this.chRimStripMats.forEach((m) => m.dispose());
    this.gbUplightMats.forEach((m) => m.dispose());
    this.chDustPoints.geometry.dispose();
    (this.chDustPoints.material as THREE.Material).dispose();
    this.extraMaterials.forEach((m) => m.dispose());
    this.extraGeometries.forEach((g) => g.dispose());
  }
}
