import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createVolumetricBeamMaterial,
  disposeObject3D,
  getContactShadowTexture,
  getRadialSparkTexture,
  LIGHTING_PRESETS,
  markSharedGlbResources,
  upgradeToHorologicalPhysicalMaterial,
  type LightingMode,
  type LightingPreset,
  type VenueCode,
} from './DomainShaderKits';

interface VenueSpec {
  code: VenueCode;
  title: string;
  hdriFile: string;
  vistaJpg: string;
  roomGlb?: string;
  weatherKind: 'ALPINE_SNOW' | 'CITY_RAIN' | 'SOLAR_DUST' | 'AURORA' | 'APEX_STORM';
  vistaTintHex: number;
  vistaEmissiveStrength: number;
  fogHex: number;
  fogDensity: number;
}

const VENUE_SPECS: Record<VenueCode, VenueSpec> = {
  ch: {
    code: 'ch',
    title: 'Geneva · The Vetting Chamber',
    hdriFile: 'studio_small_09.hdr',
    vistaJpg: 'ch.jpg',
    roomGlb: 'vetting_chamber_room.glb',
    weatherKind: 'ALPINE_SNOW',
    vistaTintHex: 0xc8def8,
    vistaEmissiveStrength: 0.58,
    fogHex: 0x070d1a,
    fogDensity: 0.02,
  },
  gb: {
    code: 'gb',
    title: 'London · The Sovereign Rotunda',
    hdriFile: 'entrance_hall.hdr',
    vistaJpg: 'gb.jpg',
    roomGlb: 'london_rotunda_room.glb',
    weatherKind: 'CITY_RAIN',
    vistaTintHex: 0xf0d4a8,
    vistaEmissiveStrength: 0.46,
    fogHex: 0x110d09,
    fogDensity: 0.028,
  },
  jp: {
    code: 'jp',
    title: 'Tokyo · Shinkansen Sky Pavilion',
    hdriFile: 'dresden_station_night.hdr',
    vistaJpg: 'jp.jpg',
    roomGlb: 'tokyo_pavilion_room.glb',
    weatherKind: 'CITY_RAIN',
    vistaTintHex: 0x92ccf5,
    vistaEmissiveStrength: 0.62,
    fogHex: 0x060c18,
    fogDensity: 0.024,
  },
  eg: {
    code: 'eg',
    title: 'Cairo · Solar Acoustic Hall',
    hdriFile: 'evening_museum_courtyard.hdr',
    vistaJpg: 'eg.jpg',
    roomGlb: 'cairo_solar_hall.glb',
    weatherKind: 'SOLAR_DUST',
    vistaTintHex: 0xf2c988,
    vistaEmissiveStrength: 0.48,
    fogHex: 0x120d08,
    fogDensity: 0.028,
  },
  br: {
    code: 'br',
    title: 'Rio de Janeiro · Botanical Glass Canopy',
    hdriFile: 'evening_museum_courtyard.hdr',
    vistaJpg: 'br.jpg',
    roomGlb: 'rio_canopy_room.glb',
    weatherKind: 'SOLAR_DUST',
    vistaTintHex: 0x9ce0bd,
    vistaEmissiveStrength: 0.56,
    fogHex: 0x06100d,
    fogDensity: 0.02,
  },
  is: {
    code: 'is',
    title: 'Reykjavik · Geothermal Basalt Caldera',
    hdriFile: 'blue_lagoon_night.hdr',
    vistaJpg: 'is.jpg',
    roomGlb: 'reykjavik_caldera_room.glb',
    weatherKind: 'AURORA',
    vistaTintHex: 0x82e0c8,
    vistaEmissiveStrength: 0.58,
    fogHex: 0x060e16,
    fogDensity: 0.022,
  },
  sg: {
    code: 'sg',
    title: 'Singapore · Diplomatic Sky-Bridge',
    hdriFile: 'dresden_station_night.hdr',
    vistaJpg: 'sg.jpg',
    roomGlb: 'singapore_skybridge_room.glb',
    weatherKind: 'CITY_RAIN',
    vistaTintHex: 0x8ecdf0,
    vistaEmissiveStrength: 0.58,
    fogHex: 0x060d19,
    fogDensity: 0.021,
  },
  global: {
    code: 'global',
    title: 'International Waters · The Apex Forum',
    hdriFile: 'blue_lagoon_night.hdr',
    vistaJpg: 'global.jpg',
    roomGlb: 'apex_forum_room.glb',
    weatherKind: 'APEX_STORM',
    vistaTintHex: 0x9ec0eb,
    vistaEmissiveStrength: 0.55,
    fogHex: 0x060a14,
    fogDensity: 0.026,
  },
  ledger: {
    code: 'ledger',
    title: 'Subterranean Strata · The Ledger Core',
    hdriFile: 'blue_lagoon_night.hdr',
    vistaJpg: 'ledger.jpg',
    weatherKind: 'AURORA',
    vistaTintHex: 0x84b6eb,
    vistaEmissiveStrength: 0.54,
    fogHex: 0x050811,
    fogDensity: 0.026,
  },
  studio: {
    code: 'studio',
    title: 'Meridian Calibration Studio',
    hdriFile: 'studio_small_09.hdr',
    vistaJpg: 'studio.jpg',
    weatherKind: 'SOLAR_DUST',
    vistaTintHex: 0xf0d5a8,
    vistaEmissiveStrength: 0.56,
    fogHex: 0x070a12,
    fogDensity: 0.028,
  },
};

interface WeatherParticleState {
  points: THREE.Points;
  velocities: Float32Array;
  bounds: { x: number; yMin: number; yMax: number; zMin: number; zMax: number };
  rainLines?: THREE.LineSegments;
  rainVel?: Float32Array;
  auroraMesh?: THREE.Mesh;
  auroraUniforms?: { uTime: { value: number }; uIntensity: { value: number } };
  searchlightL?: THREE.Mesh;
  searchlightR?: THREE.Mesh;
}

/**
 * Loads real Blender 5.3.0 `.glb` architectural rooms & stage plinths,
 * compiles real Poly Haven `.hdr` PMREM IBL environments (`RGBELoader` + `PMREMGenerator`),
 * drives Dual/Quad Broadcast vs Twist Fracture lighting, and animates 3D city weather.
 */
export class VenueArenaLoader {
  public readonly root = new THREE.Group();

  /** Exact world Y height of the Hero Stage Table / Plinth across all 10 venues. */
  public static readonly HERO_STAGE_SURFACE_Y = 0.78;

  private readonly scene: THREE.Scene;
  private readonly gltfLoader = new GLTFLoader();
  private readonly rgbeLoader = new RGBELoader();
  private readonly texLoader = new THREE.TextureLoader();
  private pmremGenerator: THREE.PMREMGenerator | null = null;

  private readonly baseUrl: string;
  private readonly envCache = new Map<string, Promise<THREE.Texture | null>>();
  private readonly pmremRenderTargets: THREE.WebGLRenderTarget[] = [];
  private readonly glbTemplateCache = new Map<string, Promise<THREE.Group | null>>();
  private readonly vistaTexCache = new Map<string, Promise<THREE.Texture | null>>();

  private readonly activeVenueGroup = new THREE.Group();
  private readonly lightingGroup = new THREE.Group();
  private readonly weatherGroup = new THREE.Group();

  // AAA 3-Point Chiaroscuro Stage Lighting Rig (#171 §3 & #172: Key : Fill : Rim = 4.2 : 0.75 : 2.8)
  private readonly keyLight: THREE.DirectionalLight;
  private readonly keyLightTarget = new THREE.Object3D();
  private readonly rimLight: THREE.DirectionalLight;
  private readonly fillLight: THREE.DirectionalLight;
  private readonly uplightPoint: THREE.PointLight;
  private readonly hemiLight: THREE.HemisphereLight;
  private readonly overheadShaft: THREE.Mesh;
  private readonly overheadShaftMat: THREE.ShaderMaterial;

  // Dynamic room nodes across all 8 Blender `.glb` venues
  private londonChandelier: THREE.Object3D | null = null;
  private cairoOculusBlades: THREE.Object3D | null = null;
  private cairoOculusGimbal: THREE.Object3D | null = null;
  private rioHangingLanterns: THREE.Object3D | null = null;
  private reykjavikAuroraRing: THREE.Object3D | null = null;
  private singaporeCoreRing: THREE.Object3D | null = null;
  private apexCrownHalo: THREE.Object3D | null = null;
  private apexSpotRigL: THREE.Object3D | null = null;
  private apexSpotRigR: THREE.Object3D | null = null;
  private tokyoBeaconMats: THREE.MeshStandardMaterial[] = [];

  private weatherState: WeatherParticleState | null = null;
  private lightningFlash = 0;
  private nextLightningTimer = 5.5;

  private activeVenue: VenueCode = 'ch';
  private venueLoadGeneration = 0;

  private lightingMode: LightingMode = 'BROADCAST';
  private currentPreset: LightingPreset = { ...LIGHTING_PRESETS.BROADCAST };
  private targetPreset: LightingPreset = { ...LIGHTING_PRESETS.BROADCAST };
  private readonly scratchColorA = new THREE.Color();
  private readonly scratchColorB = new THREE.Color();
  private elapsed = 0;

  constructor(scene: THREE.Scene, baseUrl = '/') {
    this.scene = scene;
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    this.root.name = 'VenueArenaRoot';
    this.root.add(this.activeVenueGroup, this.lightingGroup, this.weatherGroup);

    // 1. Warm Champagne Key Directional Light (`4.2` lux, `2048x2048` PCFSoft, tight `±1.55m` hero frustum = 1.51mm/texel!)
    this.keyLight = new THREE.DirectionalLight(0xffefd4, 4.2);
    this.keyLight.position.set(1.35, 3.85, 2.45);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    this.keyLight.shadow.camera.left = -1.55;
    this.keyLight.shadow.camera.right = 1.55;
    this.keyLight.shadow.camera.top = 1.55;
    this.keyLight.shadow.camera.bottom = -1.55;
    this.keyLight.shadow.camera.near = 0.6;
    this.keyLight.shadow.camera.far = 9.2;
    this.keyLight.shadow.bias = -0.00025;
    this.keyLight.shadow.normalBias = 0.014;
    this.keyLightTarget.position.set(0, 1.18, 0);
    this.keyLight.target = this.keyLightTarget;

    // 2. Grazing Cool-Cyan / Rim-Gold Back-Kicker (`2.8` lux at `(-2.4, 2.6, -2.2)` per #171 §3.1)
    this.rimLight = new THREE.DirectionalLight(0x62c0ff, 2.8);
    this.rimLight.position.set(-2.4, 2.6, -2.2);

    // 3. Controlled Chiaroscuro Front Fill (`0.75` lux — preserves deep 6:1 shadow contrast)
    this.fillLight = new THREE.DirectionalLight(0x8fb2de, 0.75);
    this.fillLight.position.set(-1.5, 1.75, 3.0);

    // Championship plinth warm horological uplight (#186 #2: lifted 26cm above Y=0.78m clearcoat table -> zero pinpoint rim dot!)
    this.uplightPoint = new THREE.PointLight(0xe6b856, 0.76, 4.2, 1.45);
    this.uplightPoint.position.set(0, 1.04, 0.44);

    // Suppressed ambient hemisphere (`<= 0.18` — zero muddy ambient wash!)
    this.hemiLight = new THREE.HemisphereLight(0x2d3f5e, 0x06080f, 0.17);

    // Subtle Fresnel overhead volumetric spotlight cone (zero raymarch cost)
    this.overheadShaftMat = createVolumetricBeamMaterial(0xffe9be, 0.052);
    const shaftGeo = new THREE.CylinderGeometry(0.18, 1.18, 3.6, 32, 1, true);
    this.overheadShaft = new THREE.Mesh(shaftGeo, this.overheadShaftMat);
    this.overheadShaft.position.set(0, 2.55, 0);
    this.overheadShaft.renderOrder = 2;

    this.lightingGroup.add(
      this.keyLight,
      this.keyLightTarget,
      this.rimLight,
      this.fillLight,
      this.uplightPoint,
      this.hemiLight,
      this.overheadShaft
    );

    this.scene.background = new THREE.Color(0x070c18);
    this.scene.fog = new THREE.FogExp2(0x070c18, 0.02);
  }

  public initPMREM(renderer: THREE.WebGLRenderer): void {
    this.pmremGenerator = new THREE.PMREMGenerator(renderer);
    this.pmremGenerator.compileEquirectangularShader();

    // Immediate zero-frame fallback IBL while the first Poly Haven .hdr decodes
    const fallbackEnv = new RoomEnvironment();
    const rt = this.pmremGenerator.fromScene(fallbackEnv, 0.04);
    this.pmremRenderTargets.push(rt);
    this.scene.environment = rt.texture;
    this.scene.environmentIntensity = this.currentPreset.envIntensity;
    fallbackEnv.dispose();
  }

  /**
   * Registers a Wave-2 Blender `.glb` venue room once staged in `public/assets/aaa_models/`.
   */
  public registerVenueRoomGlb(venue: VenueCode, roomGlbFilename: string): void {
    const spec = VENUE_SPECS[venue];
    if (spec) {
      spec.roomGlb = roomGlbFilename;
    }
  }

  public getVenue(): VenueCode {
    return this.activeVenue;
  }

  public getLightingMode(): LightingMode {
    return this.lightingMode;
  }

  public setLightingMode(mode: LightingMode, instant = false): LightingPreset {
    this.lightingMode = mode;
    const basePreset = LIGHTING_PRESETS[mode] ?? LIGHTING_PRESETS.BROADCAST;
    const venueSpec = VENUE_SPECS[this.activeVenue] ?? VENUE_SPECS.ch;
    // Match exponential depth haze (`0.018..0.028`) to the active venue in Broadcast/Interview states (#171 §3.2)
    const useVenueFog = mode === 'BROADCAST' || mode === 'INTERVIEW';
    this.targetPreset = {
      ...basePreset,
      fogColor: useVenueFog ? venueSpec.fogHex : basePreset.fogColor,
      fogDensity: useVenueFog ? venueSpec.fogDensity : basePreset.fogDensity,
    };
    if (instant) {
      this.currentPreset = { ...this.targetPreset };
      this.applyCurrentLighting();
    }
    return this.targetPreset;
  }

  public triggerApexLightning(strength = 1.0): void {
    this.lightningFlash = Math.min(1.5, Math.max(this.lightningFlash, strength));
  }

  /**
   * Loads the full 3D venue room/stage + Poly Haven `.hdr` PMREM environment + 3D weather particles.
   */
  public async loadVenue(venueInput: string): Promise<void> {
    const normalized = venueInput.toLowerCase() as VenueCode;
    const spec = VENUE_SPECS[normalized] ?? VENUE_SPECS.ch;
    // #273 Fix #1: Short-circuit redundant reload of the already-mounted venue (eliminates cold-boot flash/delay)
    if (this.activeVenue === spec.code && this.activeVenueGroup.children.length > 0) {
      return;
    }
    this.activeVenue = spec.code;
    const gen = ++this.venueLoadGeneration;

    // Start HDRI IBL + Vista JPG + Room GLB fetches concurrently
    const hdriPromise = this.loadPolyHavenHdri(spec.hdriFile);
    const vistaPromise = this.loadVistaTexture(spec.vistaJpg);
    const roomPromise = spec.roomGlb
      ? this.loadGlbTemplate(`assets/aaa_models/${spec.roomGlb}`)
      : Promise.resolve(null);

    const [envTex, vistaTex, roomTemplate] = await Promise.all([
      hdriPromise,
      vistaPromise,
      roomPromise,
    ]);

    if (gen !== this.venueLoadGeneration) {
      return;
    }

    if (envTex) {
      this.scene.environment = envTex;
      this.scene.environmentIntensity = this.currentPreset.envIntensity;
    }

    // Clear previous venue meshes & dynamic refs
    this.clearActiveVenue();

    if (roomTemplate) {
      const roomInstance = roomTemplate.clone(true);
      this.configureBlenderRoom(spec, roomInstance, vistaTex);
      this.activeVenueGroup.add(roomInstance);
    } else {
      await this.buildPanoramicSculptedArena(spec, vistaTex, gen);
    }

    if (gen === this.venueLoadGeneration) {
      this.setLightingMode(this.lightingMode, false);
      this.buildVenueWeather(spec);
    }
  }

  private clearActiveVenue(): void {
    this.londonChandelier = null;
    this.cairoOculusBlades = null;
    this.cairoOculusGimbal = null;
    this.rioHangingLanterns = null;
    this.reykjavikAuroraRing = null;
    this.singaporeCoreRing = null;
    this.apexCrownHalo = null;
    this.apexSpotRigL = null;
    this.apexSpotRigR = null;
    this.tokyoBeaconMats = [];

    disposeObject3D(this.activeVenueGroup);
    while (this.activeVenueGroup.children.length > 0) {
      const child = this.activeVenueGroup.children[0];
      this.activeVenueGroup.remove(child);
    }

    if (this.weatherState) {
      disposeObject3D(this.weatherGroup);
      while (this.weatherGroup.children.length > 0) {
        this.weatherGroup.remove(this.weatherGroup.children[0]);
      }
      this.weatherState = null;
    }
  }

  /**
   * Configures each real Blender 5.3.0 `.glb` architectural venue:
   * - Geneva (`vetting_chamber_room.glb`): Hides exterior `Alpine_Peaks` rock/castle-slate mesh and replaces
   *   with photorealistic `public/assets/venues/ch.jpg` curved Alpine glacier twilight sky-vista window backdrop!
   * - London (`london_rotunda_room.glb`): Binds spinning `Armillary_Chandelier` & warm skylight vista.
   * - Tokyo (`tokyo_pavilion_room.glb`): Glossy rain-curtain glass, blinking skyline beacons, & `jp.jpg` neon night depth.
   * - Cairo (`cairo_solar_hall.glb`): Binds spinning `Solar_Oculus_Blades` & `Solar_Oculus_Gimbal`.
   */
  private configureBlenderRoom(
    spec: VenueSpec,
    room: THREE.Group,
    vistaTex: THREE.Texture | null
  ): void {
    room.traverse((obj) => {
      const lowerName = obj.name.toLowerCase();

      if (spec.code === 'ch' && lowerName.includes('alpine_peaks')) {
        // ZERO exterior castle-brick / faceted rock blocks — replaced by photorealistic ch.jpg Alpine glacier vista!
        obj.visible = false;
        return;
      }

      if (spec.code === 'gb' && obj.name === 'Armillary_Chandelier') {
        this.londonChandelier = obj;
      }
      if (spec.code === 'eg') {
        if (obj.name === 'Solar_Oculus_Blades') {
          this.cairoOculusBlades = obj;
        } else if (obj.name === 'Solar_Oculus_Gimbal') {
          this.cairoOculusGimbal = obj;
        }
      }
      if (spec.code === 'br' && obj.name === 'Rio_Hanging_Lanterns') {
        this.rioHangingLanterns = obj;
      }
      if (spec.code === 'is' && obj.name === 'Reykjavik_Aurora_Ring') {
        this.reykjavikAuroraRing = obj;
      }
      if (spec.code === 'sg' && obj.name === 'Singapore_Core_Ring') {
        this.singaporeCoreRing = obj;
      }
      if (spec.code === 'global') {
        if (obj.name === 'Apex_Crown_Halo') this.apexCrownHalo = obj;
        else if (obj.name === 'Apex_Spotlight_Rig_L') this.apexSpotRigL = obj;
        else if (obj.name === 'Apex_Spotlight_Rig_R') this.apexSpotRigR = obj;
      }

      if (obj instanceof THREE.Mesh) {
        obj.receiveShadow = true;
        // #255 [P0] Keep draw calls < 120 across all venues: outer room columns/walls/tables are grounded
        // by tableFloorAO, so only Hero 3D hardware casts dynamic PCFSoft shadows onto the tabletop!
        obj.castShadow = false;

        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        const clonedMats = mats.map((m) => {
          if (!(m instanceof THREE.MeshStandardMaterial)) {
            return m;
          }

          if (m.name === 'Mat_Alpine_Peaks') {
            obj.visible = false;
            return m.clone();
          }

          // Make exterior & dome window panes ultra-clean architectural glass
          if (
            lowerName.includes('window_glass') ||
            lowerName.includes('rainglass') ||
            lowerName.includes('canopy_glass') ||
            lowerName.includes('dome_glass') ||
            lowerName.includes('ocean_glass') ||
            m.name === 'Mat_Window_Glass' ||
            m.name === 'Mat_Tokyo_RainGlass'
          ) {
            return new THREE.MeshPhysicalMaterial({
              color: 0x0a1322,
              metalness: 0.08,
              roughness: 0.05,
              transparent: true,
              opacity: 0.14,
              clearcoat: 1.0,
              clearcoatRoughness: 0.04,
              envMapIntensity: 1.0,
              depthWrite: false,
            });
          }

          if (m.name === 'Mat_Tokyo_BeaconRed') {
            const beaconMat = m.clone();
            beaconMat.emissive = new THREE.Color(0xff2a3c);
            beaconMat.emissiveIntensity = 2.0;
            this.tokyoBeaconMats.push(beaconMat);
            return beaconMat;
          }

          // Upgrade room brass, Nero Marquina stone/tables, and carved walnut to MeshPhysicalMaterial (#171 §3.2)
          const phys = upgradeToHorologicalPhysicalMaterial(m, 'AUTO', 0.9, 0.72);
          const matLower = (m.name || '').toLowerCase();
          const isHeroStagePiece =
            lowerName.includes('table') ||
            lowerName.includes('plinth') ||
            lowerName.includes('pedestal') ||
            lowerName.includes('dais') ||
            lowerName.includes('chandelier') ||
            lowerName.includes('oculus');
          const isFloorMesh = lowerName.includes('floor') || matLower.includes('floor');

          // #273 Fix #4: Eliminate flat light-grey Geneva floor, Apex/Reykjavik specular whiteout (>0.5%),
          // and overly bright London/Cairo background walls while preserving rich Rembrandt chiaroscuro!
          const isNonMetallic = phys.metalness < 0.5;
          if (spec.code === 'ch' && isFloorMesh && !isHeroStagePiece) {
            phys.color.multiplyScalar(0.2);
            phys.roughness = 0.54;
            phys.clearcoat = 0.06;
            phys.clearcoatRoughness = 0.42;
            phys.envMapIntensity = 0.22;
          } else if (spec.code === 'global' && isNonMetallic) {
            phys.roughness = Math.max(phys.roughness, 0.5);
            phys.clearcoat = isFloorMesh ? 0.06 : Math.min(phys.clearcoat, 0.12);
            phys.clearcoatRoughness = Math.max(phys.clearcoatRoughness, 0.38);
            phys.envMapIntensity = isFloorMesh ? 0.24 : Math.min(phys.envMapIntensity, 0.32);
            if (isFloorMesh && !isHeroStagePiece) {
              phys.color.multiplyScalar(0.55);
            } else if (!isHeroStagePiece) {
              phys.color.multiplyScalar(0.82);
            }
          } else if (spec.code === 'is' && isNonMetallic) {
            phys.roughness = Math.max(phys.roughness, 0.48);
            phys.clearcoat = Math.min(phys.clearcoat, 0.12);
            phys.clearcoatRoughness = Math.max(phys.clearcoatRoughness, 0.36);
            phys.envMapIntensity = Math.min(phys.envMapIntensity, 0.32);
            if (!isHeroStagePiece) {
              phys.color.multiplyScalar(0.82);
            }
          } else if (!isHeroStagePiece) {
            // Studio cyclorama falloff on unshadowed rear room walls (especially gb travertine & eg sandstone)
            const isBrightVenue = spec.code === 'gb' || spec.code === 'eg';
            const wallFalloff = isBrightVenue ? 0.4 : 0.84;
            phys.color.multiplyScalar(wallFalloff);
            phys.envMapIntensity = isBrightVenue ? 0.4 : 0.78;
            if (isBrightVenue && isNonMetallic) {
              phys.clearcoat = Math.min(phys.clearcoat, 0.18);
              phys.roughness = Math.max(phys.roughness, 0.42);
            }
          }

          return phys;
        });

        obj.material = Array.isArray(obj.material) ? clonedMats : clonedMats[0];
      }
    });

    // Ground the Hero Table / Dais legs into the architectural floor with a dual-ring AO contact shadow (#171 §3.2)
    const tableFloorAO = new THREE.Mesh(
      new THREE.PlaneGeometry(2.85, 2.85),
      new THREE.MeshBasicMaterial({
        map: getContactShadowTexture(),
        transparent: true,
        opacity: 0.68,
        depthWrite: false,
      })
    );
    tableFloorAO.rotation.x = -Math.PI * 0.5;
    tableFloorAO.position.set(0, 0.006, 0);
    this.activeVenueGroup.add(tableFloorAO);

    // Add photorealistic sky-vista backdrops outside windows/skylights
    if (vistaTex) {
      if (spec.code === 'ch') {
        // Curved 155° Alpine Glacier Twilight Sky-Vista cleanly framed outside Chamber_Window_Frame (Z = -4.9m)
        const vistaArc = this.createCurvedVistaMesh(
          vistaTex,
          13.5,
          9.4,
          Math.PI * 0.86,
          spec.vistaTintHex,
          spec.vistaEmissiveStrength
        );
        vistaArc.position.set(0, 3.05, -2.2);
        this.activeVenueGroup.add(vistaArc);
      } else if (spec.code === 'jp') {
        // Deep neon-rain skyline backdrop behind Tokyo's 3D towers
        const vistaArc = this.createCurvedVistaMesh(
          vistaTex,
          44.0,
          28.0,
          Math.PI * 0.82,
          spec.vistaTintHex,
          spec.vistaEmissiveStrength
        );
        vistaArc.position.set(0, 6.2, -18.0);
        this.activeVenueGroup.add(vistaArc);
      } else if (spec.code === 'gb') {
        // Warm London evening glow above the Rotunda's glass skylight dome
        const skyDome = new THREE.Mesh(
          new THREE.PlaneGeometry(6.5, 6.5),
          new THREE.MeshBasicMaterial({
            map: vistaTex,
            color: 0xd4b68c,
          })
        );
        skyDome.position.set(0, 11.1, 0);
        skyDome.rotation.x = Math.PI * 0.5;
        this.activeVenueGroup.add(skyDome);
      } else if (
        spec.code === 'br' ||
        spec.code === 'is' ||
        spec.code === 'sg' ||
        spec.code === 'global'
      ) {
        // Curved panoramic exterior vista outside the conservatory / caldera / skybridge / maritime glass!
        const vistaRadius = spec.code === 'sg' ? 18.5 : 14.2;
        const vistaArc = this.createCurvedVistaMesh(
          vistaTex,
          vistaRadius,
          10.6,
          Math.PI * 1.05,
          spec.vistaTintHex,
          spec.vistaEmissiveStrength
        );
        vistaArc.position.set(0, 3.4, 0);
        this.activeVenueGroup.add(vistaArc);
      }
    }
  }

  /**
   * Builds the sculpted 3D stage arena for `br`, `is`, `sg`, `global`, `ledger`, `studio` using:
   * - Real Blender `stage_plinth.glb` championship dais
   * - Flanking Blender `stage_monolith.glb` obsidian & 24K brass architectural colonnade pillars
   * - Sculpted Nero Marquina marble & brushed-brass Hero Pedestal flush at `Y = 0.78m`
   * - Curved 180° depth-lit panoramic vista cylinder (`br.jpg`, `is.jpg`, `sg.jpg`, `global.jpg`)
   */
  private async buildPanoramicSculptedArena(
    spec: VenueSpec,
    vistaTex: THREE.Texture | null,
    gen: number
  ): Promise<void> {
    const [plinthTpl, monolithTpl] = await Promise.all([
      this.loadGlbTemplate('assets/models/stage_plinth.glb'),
      this.loadGlbTemplate('assets/models/stage_monolith.glb'),
    ]);
    if (gen !== this.venueLoadGeneration) {
      return;
    }

    const arenaGroup = new THREE.Group();
    arenaGroup.name = `SculptedArena_${spec.code}`;

    // Rich matte-satin deep obsidian architectural floor (#253: zero grazing-Fresnel light-grey horizon band!)
    const floorMat = new THREE.MeshPhysicalMaterial({
      color: 0x05070e,
      metalness: 0.04,
      roughness: 0.74,
      clearcoat: 0.0,
      clearcoatRoughness: 0.6,
      envMapIntensity: 0.14,
    });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(12.2, 64), floorMat);
    floor.rotation.x = -Math.PI * 0.5;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    arenaGroup.add(floor);

    // Real Blender stage_plinth.glb dais (#253: deep obsidian stone deck + gleaming 24K brass rail trim)
    if (plinthTpl) {
      const dais = plinthTpl.clone(true);
      dais.position.set(0, 0.02, 0);
      dais.traverse((n) => {
        if (n instanceof THREE.Mesh) {
          n.receiveShadow = true;
          n.castShadow = false;
          if (n.material instanceof THREE.MeshStandardMaterial) {
            const dm = n.material.clone();
            const matLower = (dm.name || '').toLowerCase();
            if (dm.metalness < 0.5 && !matLower.includes('luminous')) {
              dm.color.setHex(0x060911);
              dm.roughness = Math.max(dm.roughness, 0.58);
              dm.envMapIntensity = 0.22;
            } else {
              dm.envMapIntensity = 0.84;
            }
            if (dm.emissiveIntensity > 0.45) dm.emissiveIntensity = 0.45;
            n.material = dm;
          }
        }
      });
      arenaGroup.add(dais);
    }

    // Sculpted Championship Hero Pedestal matching exact Y = 0.78m table plane across all venues
    const pedestalGroup = new THREE.Group();
    const marbleMat = new THREE.MeshPhysicalMaterial({
      color: 0x060911,
      metalness: 0.08,
      roughness: 0.36,
      clearcoat: 0.26,
      clearcoatRoughness: 0.28,
      envMapIntensity: 0.3,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4aa52,
      metalness: 0.9,
      roughness: 0.24,
      envMapIntensity: 0.92,
    });

    const pedColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.68, 0.74, 48),
      marbleMat
    );
    pedColumn.position.y = 0.37;
    pedColumn.receiveShadow = true;
    pedColumn.castShadow = false;

    const pedTopSlab = new THREE.Mesh(
      new THREE.CylinderGeometry(0.64, 0.61, 0.045, 48),
      marbleMat
    );
    pedTopSlab.position.y = 0.758;
    pedTopSlab.receiveShadow = true;

    const pedBrassBevel = new THREE.Mesh(
      new THREE.TorusGeometry(0.635, 0.014, 14, 64),
      brassMat
    );
    pedBrassBevel.rotation.x = Math.PI * 0.5;
    pedBrassBevel.position.y = 0.772;

    const pedBaseRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.685, 0.018, 14, 64),
      brassMat
    );
    pedBaseRing.rotation.x = Math.PI * 0.5;
    pedBaseRing.position.y = 0.02;

    pedestalGroup.add(pedColumn, pedTopSlab, pedBrassBevel, pedBaseRing);
    arenaGroup.add(pedestalGroup);

    // Flanking Blender stage_monolith.glb architectural columns (clamp Mat_Broadcast_LightStrip emissive so zero whiteout per #132!)
    if (monolithTpl) {
      const columnPlacements: Array<{ x: number; y: number; z: number; ry: number; s: number }> = [
        { x: -3.25, y: 1.55, z: -3.65, ry: 0.34, s: 1.42 },
        { x: 3.25, y: 1.55, z: -3.65, ry: -0.34, s: 1.42 },
        { x: -5.45, y: 1.65, z: -2.35, ry: 0.68, s: 1.52 },
        { x: 5.45, y: 1.65, z: -2.35, ry: -0.68, s: 1.52 },
      ];
      for (const p of columnPlacements) {
        const col = monolithTpl.clone(true);
        col.traverse((n) => {
          if (n instanceof THREE.Mesh && n.material instanceof THREE.MeshStandardMaterial) {
            const cm = n.material.clone();
            cm.envMapIntensity = 0.62;
            if (cm.emissiveIntensity > 0.22) {
              cm.emissiveIntensity = 0.22;
            }
            n.material = cm;
          }
        });
        col.position.set(p.x, p.y, p.z);
        col.rotation.y = p.ry;
        col.scale.setScalar(p.s);
        arenaGroup.add(col);
      }
    }

    // Curved 180° depth-lit panoramic vista cylinder
    if (vistaTex) {
      const vista = this.createCurvedVistaMesh(
        vistaTex,
        12.4,
        9.2,
        Math.PI * 1.04,
        spec.vistaTintHex,
        spec.vistaEmissiveStrength
      );
      vista.position.set(0, 3.15, 0);
      arenaGroup.add(vista);
    }

    this.activeVenueGroup.add(arenaGroup);
  }

  /**
   * Curved 180° inward-facing panoramic vista cylinder with soft vertical & horizontal feathering
   * so vistas integrate seamlessly with the 3D stage architecture and exponential fog.
   */
  private createCurvedVistaMesh(
    texture: THREE.Texture,
    radius: number,
    height: number,
    arcRadians: number,
    tintHex: number,
    intensity: number
  ): THREE.Mesh {
    // Cylinder thetaStart centered around -Z (angle Math.PI in Three.js CylinderGeometry where 0 is +Z)
    const thetaStart = Math.PI - arcRadians * 0.5;
    const geo = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      64,
      1,
      true,
      thetaStart,
      arcRadians
    );

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      uniforms: {
        uMap: { value: texture },
        uTint: { value: new THREE.Color(tintHex) },
        uIntensity: { value: intensity },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = vec2(1.0 - uv.x, uv.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform vec3 uTint;
        uniform float uIntensity;
        varying vec2 vUv;
        void main() {
          vec4 texel = texture2D(uMap, vUv);
          float vFade = smoothstep(0.0, 0.14, vUv.y) * (1.0 - smoothstep(0.86, 1.0, vUv.y));
          float hFade = smoothstep(0.0, 0.08, vUv.x) * (1.0 - smoothstep(0.92, 1.0, vUv.x));
          vec3 col = texel.rgb * uTint * uIntensity;
          gl_FragColor = vec4(col, vFade * hFade);
        }
      `,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = 'VenuePanoramicVista';
    mesh.renderOrder = -2;
    return mesh;
  }

  /**
   * Live 3D Weather & Atmosphere per city (#111):
   * Geneva Alpine snow, London/Tokyo/Singapore rain + bokeh, Cairo/Rio golden solar dust,
   * Reykjavik waving 3D Aurora Borealis ribbon, Apex Forum sweeping searchlights + storm lightning.
   */
  private buildVenueWeather(spec: VenueSpec): void {
    const sparkTex = getRadialSparkTexture(this.baseUrl);
    const isExteriorWindowOnly = spec.code === 'ch';

    const count = spec.weatherKind === 'ALPINE_SNOW' ? 220 : 160;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    const bounds = isExteriorWindowOnly
      ? { x: 6.5, yMin: 0.4, yMax: 6.2, zMin: -10.5, zMax: -5.05 }
      : { x: 6.8, yMin: 0.2, yMax: 5.8, zMin: -8.5, zMax: -1.6 };

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() * 2 - 1) * bounds.x;
      positions[i3 + 1] = THREE.MathUtils.lerp(bounds.yMin, bounds.yMax, Math.random());
      positions[i3 + 2] = THREE.MathUtils.lerp(bounds.zMin, bounds.zMax, Math.random());

      if (spec.weatherKind === 'ALPINE_SNOW') {
        velocities[i3] = 0.28 + Math.random() * 0.25;
        velocities[i3 + 1] = -(0.38 + Math.random() * 0.42);
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.12;
      } else if (spec.weatherKind === 'SOLAR_DUST') {
        velocities[i3] = (Math.random() - 0.5) * 0.14;
        velocities[i3 + 1] = 0.08 + Math.random() * 0.16;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
      } else {
        velocities[i3] = (Math.random() - 0.5) * 0.18;
        velocities[i3 + 1] = 0.06 + Math.random() * 0.14;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.12;
      }
    }

    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const ptColor =
      spec.weatherKind === 'ALPINE_SNOW'
        ? 0xe8f3ff
        : spec.weatherKind === 'SOLAR_DUST'
          ? 0xffd98a
          : spec.weatherKind === 'AURORA'
            ? 0x72f5d8
            : 0x9bd2ff;

    const ptMat = new THREE.PointsMaterial({
      color: ptColor,
      map: sparkTex,
      size: spec.weatherKind === 'ALPINE_SNOW' ? 0.095 : 0.075,
      transparent: true,
      opacity: spec.weatherKind === 'ALPINE_SNOW' ? 0.78 : 0.56,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(ptGeo, ptMat);
    this.weatherGroup.add(points);

    const state: WeatherParticleState = { points, velocities, bounds };

    // Sleek 3D diagonal rain streaks for London / Tokyo / Singapore / Apex Storm
    if (spec.weatherKind === 'CITY_RAIN' || spec.weatherKind === 'APEX_STORM') {
      const rainCount = 180;
      const linePos = new Float32Array(rainCount * 6);
      const rainVel = new Float32Array(rainCount);
      const zMin = spec.code === 'jp' ? -9.5 : -7.8;
      const zMax = spec.code === 'jp' ? -5.75 : -2.6;

      for (let i = 0; i < rainCount; i++) {
        const i6 = i * 6;
        const x = (Math.random() * 2 - 1) * 7.2;
        const y = Math.random() * 6.4;
        const z = THREE.MathUtils.lerp(zMin, zMax, Math.random());
        const speed = 5.5 + Math.random() * 3.5;
        rainVel[i] = speed;
        linePos[i6] = x;
        linePos[i6 + 1] = y;
        linePos[i6 + 2] = z;
        linePos[i6 + 3] = x - 0.06;
        linePos[i6 + 4] = y - 0.34;
        linePos[i6 + 5] = z;
      }
      const rainGeo = new THREE.BufferGeometry();
      rainGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
      const rainMat = new THREE.LineBasicMaterial({
        color: spec.code === 'jp' ? 0x8ad8ff : 0xb8d4f5,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const rainLines = new THREE.LineSegments(rainGeo, rainMat);
      this.weatherGroup.add(rainLines);
      state.rainLines = rainLines;
      state.rainVel = rainVel;
    }

    // Flowing 3D Northern Lights Aurora Borealis ribbon for Reykjavik / Ledger
    if (spec.weatherKind === 'AURORA') {
      const auroraUniforms = {
        uTime: { value: 0 },
        uIntensity: { value: 1.0 },
      };
      const auroraGeo = new THREE.PlaneGeometry(18, 4.6, 64, 16);
      const auroraMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: auroraUniforms,
        vertexShader: `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.z += sin(p.x * 0.48 + uTime * 0.65) * 0.85 + cos(p.x * 0.9 - uTime * 0.42) * 0.35;
            p.y += sin(p.x * 0.35 + uTime * 0.5) * 0.28;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uIntensity;
          varying vec2 vUv;
          void main() {
            float curtain = pow(sin(vUv.x * 22.0 + sin(vUv.x * 5.0 + uTime * 0.7) * 3.0) * 0.5 + 0.5, 1.8);
            float vFade = smoothstep(0.0, 0.28, vUv.y) * (1.0 - smoothstep(0.18, 1.0, vUv.y));
            float hFade = smoothstep(0.0, 0.14, vUv.x) * (1.0 - smoothstep(0.86, 1.0, vUv.x));
            vec3 emerald = vec3(0.18, 0.96, 0.68);
            vec3 violet = vec3(0.52, 0.34, 0.98);
            vec3 col = mix(emerald, violet, smoothstep(0.2, 0.85, vUv.y));
            float alpha = (0.16 + 0.34 * curtain) * vFade * hFade * uIntensity;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      });
      const auroraMesh = new THREE.Mesh(auroraGeo, auroraMat);
      auroraMesh.position.set(0, 5.2, -8.2);
      auroraMesh.rotation.x = 0.18;
      this.weatherGroup.add(auroraMesh);
      state.auroraMesh = auroraMesh;
      state.auroraUniforms = auroraUniforms;
    }

    // Apex Forum sweeping maritime searchlights
    if (spec.weatherKind === 'APEX_STORM') {
      const coneGeo = new THREE.CylinderGeometry(0.08, 1.45, 9.5, 24, 1, true);
      const beamMat = createVolumetricBeamMaterial(0x9ec8ff, 0.14);
      const searchL = new THREE.Mesh(coneGeo, beamMat);
      searchL.position.set(-4.6, 3.8, -6.5);
      const searchR = new THREE.Mesh(coneGeo, beamMat);
      searchR.position.set(4.6, 3.8, -6.5);
      this.weatherGroup.add(searchL, searchR);
      state.searchlightL = searchL;
      state.searchlightR = searchR;
    }

    this.weatherState = state;
  }

  private loadPolyHavenHdri(filename: string): Promise<THREE.Texture | null> {
    const cached = this.envCache.get(filename);
    if (cached) {
      return cached;
    }

    const promise = new Promise<THREE.Texture | null>((resolve) => {
      this.rgbeLoader.load(
        `${this.baseUrl}assets/hdris/${filename}`,
        (hdrEquirect) => {
          hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
          if (this.pmremGenerator) {
            const pmremRT = this.pmremGenerator.fromEquirectangular(hdrEquirect);
            this.pmremRenderTargets.push(pmremRT);
            hdrEquirect.dispose();
            resolve(pmremRT.texture);
          } else {
            resolve(hdrEquirect);
          }
        },
        undefined,
        () => resolve(null)
      );
    });

    this.envCache.set(filename, promise);
    return promise;
  }

  private loadVistaTexture(filename: string): Promise<THREE.Texture | null> {
    const cached = this.vistaTexCache.get(filename);
    if (cached) {
      return cached;
    }

    const promise = new Promise<THREE.Texture | null>((resolve) => {
      this.texLoader.load(
        `${this.baseUrl}assets/venues/${filename}`,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          resolve(tex);
        },
        undefined,
        () => resolve(null)
      );
    });

    this.vistaTexCache.set(filename, promise);
    return promise;
  }

  public loadGlbTemplate(relativePath: string): Promise<THREE.Group | null> {
    const cleanRel = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    const cached = this.glbTemplateCache.get(cleanRel);
    if (cached) {
      return cached;
    }

    const promise = new Promise<THREE.Group | null>((resolve) => {
      this.gltfLoader.load(
        `${this.baseUrl}${cleanRel}`,
        (gltf) => {
          markSharedGlbResources(gltf.scene);
          resolve(gltf.scene);
        },
        undefined,
        () => resolve(null)
      );
    });

    this.glbTemplateCache.set(cleanRel, promise);
    return promise;
  }

  private applyCurrentLighting(): void {
    const p = this.currentPreset;
    const flashAdd = this.lightningFlash * 2.4;

    this.keyLight.color.setHex(p.keyColor);
    this.keyLight.intensity = p.keyIntensity + flashAdd;

    this.rimLight.color.setHex(p.rimColor);
    this.rimLight.intensity = p.rimIntensity + flashAdd * 0.8;

    this.fillLight.color.setHex(p.fillColor);
    this.fillLight.intensity = p.fillIntensity;

    this.uplightPoint.color.setHex(p.uplightColor);
    this.uplightPoint.intensity = p.uplightIntensity;

    this.hemiLight.color.setHex(p.ambientColor);
    this.hemiLight.intensity = p.ambientIntensity + flashAdd * 0.35;

    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(p.fogColor);
      this.scene.fog.density = p.fogDensity;
    }
    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.setHex(p.fogColor);
    }
    this.scene.environmentIntensity = p.envIntensity;

    this.overheadShaftMat.uniforms.uColor.value.setHex(p.keyColor);
  }

  public update(dt: number): void {
    this.elapsed += dt;
    const smooth = 1 - Math.exp(-dt * 4.2);

    // Zero-allocation color & intensity interpolation across Dual/Quad Lighting Modes (#154 Pillar #3)
    const lerpColorHex = (currHex: number, targHex: number): number => {
      if (currHex === targHex) return currHex;
      this.scratchColorA.setHex(currHex);
      this.scratchColorB.setHex(targHex);
      this.scratchColorA.lerp(this.scratchColorB, smooth);
      return this.scratchColorA.getHex();
    };

    this.currentPreset.keyColor = lerpColorHex(
      this.currentPreset.keyColor,
      this.targetPreset.keyColor
    );
    this.currentPreset.keyIntensity = THREE.MathUtils.lerp(
      this.currentPreset.keyIntensity,
      this.targetPreset.keyIntensity,
      smooth
    );
    this.currentPreset.rimColor = lerpColorHex(
      this.currentPreset.rimColor,
      this.targetPreset.rimColor
    );
    this.currentPreset.rimIntensity = THREE.MathUtils.lerp(
      this.currentPreset.rimIntensity,
      this.targetPreset.rimIntensity,
      smooth
    );
    this.currentPreset.fillColor = lerpColorHex(
      this.currentPreset.fillColor,
      this.targetPreset.fillColor
    );
    this.currentPreset.fillIntensity = THREE.MathUtils.lerp(
      this.currentPreset.fillIntensity,
      this.targetPreset.fillIntensity,
      smooth
    );
    this.currentPreset.uplightColor = lerpColorHex(
      this.currentPreset.uplightColor,
      this.targetPreset.uplightColor
    );
    this.currentPreset.uplightIntensity = THREE.MathUtils.lerp(
      this.currentPreset.uplightIntensity,
      this.targetPreset.uplightIntensity,
      smooth
    );
    this.currentPreset.ambientColor = lerpColorHex(
      this.currentPreset.ambientColor,
      this.targetPreset.ambientColor
    );
    this.currentPreset.ambientIntensity = THREE.MathUtils.lerp(
      this.currentPreset.ambientIntensity,
      this.targetPreset.ambientIntensity,
      smooth
    );
    this.currentPreset.fogColor = lerpColorHex(
      this.currentPreset.fogColor,
      this.targetPreset.fogColor
    );
    this.currentPreset.fogDensity = THREE.MathUtils.lerp(
      this.currentPreset.fogDensity,
      this.targetPreset.fogDensity,
      smooth
    );
    this.currentPreset.envIntensity = THREE.MathUtils.lerp(
      this.currentPreset.envIntensity,
      this.targetPreset.envIntensity,
      smooth
    );

    if (this.lightningFlash > 0.001) {
      this.lightningFlash *= Math.exp(-dt * 8.5);
    } else {
      this.lightningFlash = 0;
    }

    this.overheadShaftMat.uniforms.uTime.value = this.elapsed;
    this.applyCurrentLighting();

    // Animate kinetic architecture across all 8 real Blender `.glb` venues (#111 & #143)
    if (this.londonChandelier) {
      this.londonChandelier.rotation.y += dt * 0.16;
    }
    if (this.cairoOculusBlades) {
      const spinSpeed = this.lightingMode === 'TWIST_FRACTURE' ? 0.65 : 0.2;
      this.cairoOculusBlades.rotation.y += dt * spinSpeed;
    }
    if (this.cairoOculusGimbal) {
      this.cairoOculusGimbal.rotation.z = Math.sin(this.elapsed * 0.45) * 0.07;
    }
    if (this.rioHangingLanterns) {
      this.rioHangingLanterns.rotation.z = Math.sin(this.elapsed * 0.65) * 0.025;
      this.rioHangingLanterns.rotation.y += dt * 0.05;
    }
    if (this.reykjavikAuroraRing) {
      this.reykjavikAuroraRing.rotation.y += dt * 0.22;
    }
    if (this.singaporeCoreRing) {
      this.singaporeCoreRing.rotation.y -= dt * 0.28;
    }
    if (this.apexCrownHalo) {
      this.apexCrownHalo.rotation.y += dt * 0.18;
    }
    if (this.apexSpotRigL) {
      this.apexSpotRigL.rotation.z = Math.sin(this.elapsed * 0.52) * 0.16;
    }
    if (this.apexSpotRigR) {
      this.apexSpotRigR.rotation.z = -Math.sin(this.elapsed * 0.52) * 0.16;
    }
    if (this.tokyoBeaconMats.length > 0) {
      const pulse = 1.1 + 1.3 * (0.5 + 0.5 * Math.sin(this.elapsed * 3.1));
      for (const m of this.tokyoBeaconMats) {
        m.emissiveIntensity = pulse;
      }
    }

    // Animate 3D weather particles
    const ws = this.weatherState;
    if (ws) {
      const posAttr = ws.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const vel = ws.velocities;
      const b = ws.bounds;

      for (let i = 0; i < posAttr.count; i++) {
        const i3 = i * 3;
        arr[i3] += (vel[i3] + Math.sin(this.elapsed * 0.9 + i) * 0.08) * dt;
        arr[i3 + 1] += vel[i3 + 1] * dt;
        arr[i3 + 2] += vel[i3 + 2] * dt;

        if (arr[i3] > b.x) arr[i3] = -b.x;
        if (arr[i3] < -b.x) arr[i3] = b.x;
        if (arr[i3 + 1] < b.yMin) arr[i3 + 1] = b.yMax;
        if (arr[i3 + 1] > b.yMax) arr[i3 + 1] = b.yMin;
      }
      posAttr.needsUpdate = true;

      if (ws.rainLines && ws.rainVel) {
        const rAttr = ws.rainLines.geometry.getAttribute('position') as THREE.BufferAttribute;
        const rArr = rAttr.array as Float32Array;
        for (let i = 0; i < ws.rainVel.length; i++) {
          const i6 = i * 6;
          const dy = ws.rainVel[i] * dt;
          const dx = dy * 0.16;
          rArr[i6] -= dx;
          rArr[i6 + 1] -= dy;
          rArr[i6 + 3] -= dx;
          rArr[i6 + 4] -= dy;
          if (rArr[i6 + 1] < -0.2) {
            const resetX = (Math.random() * 2 - 1) * 7.2;
            const resetY = 6.2 + Math.random() * 0.8;
            rArr[i6] = resetX;
            rArr[i6 + 1] = resetY;
            rArr[i6 + 3] = resetX - 0.06;
            rArr[i6 + 4] = resetY - 0.34;
          }
        }
        rAttr.needsUpdate = true;
      }

      if (ws.auroraUniforms) {
        ws.auroraUniforms.uTime.value = this.elapsed;
      }

      if (ws.searchlightL && ws.searchlightR) {
        ws.searchlightL.rotation.z = -0.35 + Math.sin(this.elapsed * 0.55) * 0.28;
        ws.searchlightR.rotation.z = 0.35 + Math.cos(this.elapsed * 0.48) * 0.28;
        this.nextLightningTimer -= dt;
        if (this.nextLightningTimer <= 0) {
          this.triggerApexLightning(0.95);
          this.nextLightningTimer = 6.0 + Math.random() * 6.5;
        }
      }
    }
  }

  public dispose(): void {
    this.clearActiveVenue();
    this.overheadShaftGeoCleanup();
    for (const rt of this.pmremRenderTargets) {
      rt.dispose();
    }
    this.pmremRenderTargets.length = 0;
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
      this.pmremGenerator = null;
    }
  }

  private overheadShaftGeoCleanup(): void {
    this.overheadShaft.geometry.dispose();
    this.overheadShaftMat.dispose();
  }
}
