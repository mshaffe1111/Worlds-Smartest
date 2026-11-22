import * as THREE from 'three';

export type DomainId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type LightingMode =
  | 'BROADCAST'
  | 'TWIST_FRACTURE'
  | 'INTERVIEW'
  | 'GOLD_RESONANCE'
  | 'MISSION_FAILED';

export type VenueCode =
  | 'ch'
  | 'gb'
  | 'jp'
  | 'br'
  | 'eg'
  | 'is'
  | 'sg'
  | 'global'
  | 'ledger'
  | 'studio';

export type PrismArchetype =
  | 'SIGHTLINE_LOCK'
  | 'CODEX_DUAL_RING'
  | 'CALIBRATOR_DIAL'
  | 'GAUNTLET_SHATTER'
  | 'HERO_ARTIFACT_SYNTHESIS'
  | 'WORLD_GLOBE'
  | 'CHAMPIONSHIP_TROPHY'
  | 'IDLE_ORB'
  | 'DIPLOMATIC_PASSPORT';

export type HeroRelicKey =
  | 'meridian_astrolabe'
  | 'armillary_orrery'
  | 'origami_prism'
  | 'emerald_sphere'
  | 'cipher_box'
  | 'cryo_relay'
  | 'council_seal'
  | 'master_ledger'
  | 'championship_trophy'
  | 'meridian_passport_3d';

export type PrismAtelierSkinId =
  | 'SOVEREIGN_OBSIDIAN'
  | 'DAMASCUS_STEEL'
  | 'KYOTO_KINTSUGI'
  | 'IMPERIAL_EMERALD'
  | 'PHARAONIC_LAPIS'
  | 'AURORA_DICHROIC'
  | 'SINGAPORE_SKYBRIDGE'
  | 'CRIMSON_BLACK_SALON'
  | 'METEORITE_ROSE_GOLD'
  | 'ARCTIC_CRYO_SAPPHIRE'
  | 'ELECTRUM_MOTHER_OF_PEARL'
  | 'MYTHIC_CELESTIAL_DIAMOND';

export interface PrismAtelierSkinSpec {
  id: PrismAtelierSkinId | string;
  name?: string;
  metalHex: number;
  secondaryMetalHex: number;
  shutterHex: number;
  crystalHex: number;
  accentHex?: number;
  metalRoughness: number;
  iridescence: number;
  useDomainAccent?: boolean;
}

export const PRISM_ATELIER_SKINS: Record<PrismAtelierSkinId, PrismAtelierSkinSpec> = {
  SOVEREIGN_OBSIDIAN: {
    id: 'SOVEREIGN_OBSIDIAN',
    name: 'Sovereign Obsidian & 24K Gold',
    metalHex: 0xd9af54,
    secondaryMetalHex: 0x8c6830,
    shutterHex: 0x0b1220,
    crystalHex: 0x081120,
    metalRoughness: 0.24,
    iridescence: 0.16,
    useDomainAccent: true,
  },
  DAMASCUS_STEEL: {
    id: 'DAMASCUS_STEEL',
    name: 'Damascus Folded Steel & Amber',
    metalHex: 0xb7c6d8,
    secondaryMetalHex: 0xd98e38,
    shutterHex: 0x161d29,
    crystalHex: 0x091322,
    accentHex: 0xf2a644,
    metalRoughness: 0.2,
    iridescence: 0.28,
    useDomainAccent: false,
  },
  KYOTO_KINTSUGI: {
    id: 'KYOTO_KINTSUGI',
    name: 'Kyoto Urushi Lacquer & Kintsugi Gold',
    metalHex: 0xf0c24f,
    secondaryMetalHex: 0x3b1814,
    shutterHex: 0x09070b,
    crystalHex: 0x110a12,
    accentHex: 0xffc84a,
    metalRoughness: 0.16,
    iridescence: 0.2,
    useDomainAccent: false,
  },
  IMPERIAL_EMERALD: {
    id: 'IMPERIAL_EMERALD',
    name: 'Imperial Emerald Quartz & Botanical Brass',
    metalHex: 0xdab866,
    secondaryMetalHex: 0x164a35,
    shutterHex: 0x071a14,
    crystalHex: 0x061914,
    accentHex: 0x38e59b,
    metalRoughness: 0.21,
    iridescence: 0.25,
    useDomainAccent: false,
  },
  PHARAONIC_LAPIS: {
    id: 'PHARAONIC_LAPIS',
    name: 'Pharaonic Lapis Lazuli & Solar Electrum',
    metalHex: 0xebd078,
    secondaryMetalHex: 0x1d2e6e,
    shutterHex: 0x0b1336,
    crystalHex: 0x08102b,
    accentHex: 0xffcf5c,
    metalRoughness: 0.19,
    iridescence: 0.34,
    useDomainAccent: false,
  },
  AURORA_DICHROIC: {
    id: 'AURORA_DICHROIC',
    name: 'Aurora Dichroic Titanium',
    metalHex: 0xc8dcf2,
    secondaryMetalHex: 0x4b3c7a,
    shutterHex: 0x0e1428,
    crystalHex: 0x0a1228,
    accentHex: 0x62f2d6,
    metalRoughness: 0.14,
    iridescence: 0.85,
    useDomainAccent: false,
  },
  SINGAPORE_SKYBRIDGE: {
    id: 'SINGAPORE_SKYBRIDGE',
    name: 'Sky-Bridge Rhodium Platinum & Cyan Sapphire',
    metalHex: 0xdde7f2,
    secondaryMetalHex: 0x164c64,
    shutterHex: 0x081824,
    crystalHex: 0x061420,
    accentHex: 0x4ae8ff,
    metalRoughness: 0.15,
    iridescence: 0.48,
    useDomainAccent: false,
  },
  CRIMSON_BLACK_SALON: {
    id: 'CRIMSON_BLACK_SALON',
    name: 'Black Salon PVD Obsidian & Ruby Tourbillon',
    metalHex: 0xd9a85b,
    secondaryMetalHex: 0x5c1422,
    shutterHex: 0x0d070a,
    crystalHex: 0x14060c,
    accentHex: 0xff4d6d,
    metalRoughness: 0.18,
    iridescence: 0.32,
    useDomainAccent: false,
  },
  METEORITE_ROSE_GOLD: {
    id: 'METEORITE_ROSE_GOLD',
    name: 'Widmanstätten Meteorite & 18K Rose Gold',
    metalHex: 0xe4a788,
    secondaryMetalHex: 0x4b5362,
    shutterHex: 0x12161f,
    crystalHex: 0x0c0e17,
    accentHex: 0xffbfa0,
    metalRoughness: 0.22,
    iridescence: 0.26,
    useDomainAccent: false,
  },
  ARCTIC_CRYO_SAPPHIRE: {
    id: 'ARCTIC_CRYO_SAPPHIRE',
    name: 'Smoked Cryo-Sapphire & White Gold',
    metalHex: 0xe6eef8,
    secondaryMetalHex: 0x1f3f72,
    shutterHex: 0x091326,
    crystalHex: 0x071022,
    accentHex: 0x7ac4ff,
    metalRoughness: 0.14,
    iridescence: 0.56,
    useDomainAccent: false,
  },
  ELECTRUM_MOTHER_OF_PEARL: {
    id: 'ELECTRUM_MOTHER_OF_PEARL',
    name: 'Nacre Mother-of-Pearl & Sovereign Electrum',
    metalHex: 0xf0d68a,
    secondaryMetalHex: 0x7d7a8c,
    shutterHex: 0x141622,
    crystalHex: 0x0d101b,
    accentHex: 0xffe7a8,
    metalRoughness: 0.16,
    iridescence: 0.72,
    useDomainAccent: false,
  },
  MYTHIC_CELESTIAL_DIAMOND: {
    id: 'MYTHIC_CELESTIAL_DIAMOND',
    name: 'Mythic Celestial Diamond & 24K Sovereign Crown',
    metalHex: 0xf5d478,
    secondaryMetalHex: 0x24345a,
    shutterHex: 0x080c18,
    crystalHex: 0x070c1a,
    accentHex: 0xfff0b8,
    metalRoughness: 0.12,
    iridescence: 0.94,
    useDomainAccent: false,
  },
};

export type HologramGlyphShape =
  | 'CROWN_LAUREL'
  | 'ORBITAL_ATOM'
  | 'COMPASS_ARMILLARY'
  | 'IONIC_CAPITAL'
  | 'APERTURE_STAR'
  | 'VICTORY_FLAME'
  | 'QUANTUM_LATTICE'
  | 'DOUBLE_HELIX'
  | 'TREATY_SCALES'
  | 'HOROLOGY_GEARS'
  | 'ASTRAL_OCTAHEDRON'
  | 'TESSERACT_PRISM';

export interface DomainShaderPalette {
  id: DomainId;
  key: string;
  name: string;
  materialLabel: string;
  metalHex: number;
  secondaryMetalHex: number;
  crystalColorHex: number;
  attenuationHex: number;
  accentHex: number;
  emissiveHex: number;
  metalRoughness: number;
  crystalRoughness: number;
  iridescence: number;
  glyphShape: HologramGlyphShape;
}

export interface LightingPreset {
  mode: LightingMode;
  keyColor: number;
  keyIntensity: number;
  rimColor: number;
  rimIntensity: number;
  fillColor: number;
  fillIntensity: number;
  uplightColor: number;
  uplightIntensity: number;
  ambientColor: number;
  ambientIntensity: number;
  fogColor: number;
  fogDensity: number;
  envIntensity: number;
  bloomStrength: number;
  exposure: number;
}

/**
 * 12 Procedural Domain PBR Shader Palettes (PITCH_BIBLE.md §5.2, #132 Deep Obsidian-Jewel Contrast Tuned).
 */
export const DOMAIN_SHADER_PALETTES: Record<DomainId, DomainShaderPalette> = {
  0: {
    id: 0,
    key: 'HISTORY',
    name: 'History',
    materialLabel: 'Aged Bronze Patina',
    metalHex: 0xcf9f4e,
    secondaryMetalHex: 0x6e4f27,
    crystalColorHex: 0x0c0b09,
    attenuationHex: 0x1c140b,
    accentHex: 0xe8bc64,
    emissiveHex: 0xffd884,
    metalRoughness: 0.25,
    crystalRoughness: 0.16,
    iridescence: 0.1,
    glyphShape: 'CROWN_LAUREL',
  },
  1: {
    id: 1,
    key: 'SCIENCE',
    name: 'Science',
    materialLabel: 'Iridescent Cobalt & Orbital Gold',
    metalHex: 0xd0dce8,
    secondaryMetalHex: 0x1c4f82,
    crystalColorHex: 0x071122,
    attenuationHex: 0x0b2242,
    accentHex: 0x4cc4ff,
    emissiveHex: 0x7ae0ff,
    metalRoughness: 0.19,
    crystalRoughness: 0.14,
    iridescence: 0.62,
    glyphShape: 'ORBITAL_ATOM',
  },
  2: {
    id: 2,
    key: 'GEOGRAPHY',
    name: 'Geography',
    materialLabel: 'Topographic Brass & Verdigris',
    metalHex: 0xd9b25f,
    secondaryMetalHex: 0x1c5c4c,
    crystalColorHex: 0x071513,
    attenuationHex: 0x0c2b25,
    accentHex: 0x3ed6a0,
    emissiveHex: 0x6ef5c4,
    metalRoughness: 0.22,
    crystalRoughness: 0.16,
    iridescence: 0.2,
    glyphShape: 'COMPASS_ARMILLARY',
  },
  3: {
    id: 3,
    key: 'ARTS',
    name: 'Arts & Culture',
    materialLabel: 'Carrara Marble & Kintsugi Gold',
    metalHex: 0xe6c57a,
    secondaryMetalHex: 0x825f54,
    crystalColorHex: 0x100c0d,
    attenuationHex: 0x241918,
    accentHex: 0xf0cf92,
    emissiveHex: 0xffe4b0,
    metalRoughness: 0.2,
    crystalRoughness: 0.15,
    iridescence: 0.18,
    glyphShape: 'IONIC_CAPITAL',
  },
  4: {
    id: 4,
    key: 'POP',
    name: 'Pop & Media',
    materialLabel: 'Obsidian Lacquer & Rose Gold',
    metalHex: 0xdfa097,
    secondaryMetalHex: 0x5c1f4e,
    crystalColorHex: 0x110814,
    attenuationHex: 0x2b1029,
    accentHex: 0xf26ca8,
    emissiveHex: 0xff94c6,
    metalRoughness: 0.18,
    crystalRoughness: 0.14,
    iridescence: 0.42,
    glyphShape: 'APERTURE_STAR',
  },
  5: {
    id: 5,
    key: 'SPORTS',
    name: 'Sports & Games',
    materialLabel: 'Forged Carbon & Championship Gold',
    metalHex: 0xe0a84c,
    secondaryMetalHex: 0x6e3615,
    crystalColorHex: 0x100b08,
    attenuationHex: 0x2b160b,
    accentHex: 0xff9642,
    emissiveHex: 0xffb870,
    metalRoughness: 0.23,
    crystalRoughness: 0.16,
    iridescence: 0.14,
    glyphShape: 'VICTORY_FLAME',
  },
  6: {
    id: 6,
    key: 'TECH',
    name: 'Tech & Eng',
    materialLabel: 'Smoked Polycarbonate & Etched PCB Gold',
    metalHex: 0xd9ba6c,
    secondaryMetalHex: 0x1c475e,
    crystalColorHex: 0x06131a,
    attenuationHex: 0x0b2a36,
    accentHex: 0x5ee8f2,
    emissiveHex: 0x8cf6ff,
    metalRoughness: 0.18,
    crystalRoughness: 0.13,
    iridescence: 0.5,
    glyphShape: 'QUANTUM_LATTICE',
  },
  7: {
    id: 7,
    key: 'NATURE',
    name: 'Nature & Bio',
    materialLabel: 'Volcanic Basalt & Imperial Jade',
    metalHex: 0xcbb06a,
    secondaryMetalHex: 0x1d4f30,
    crystalColorHex: 0x07140e,
    attenuationHex: 0x0e2e1c,
    accentHex: 0x5fe076,
    emissiveHex: 0x8bf79d,
    metalRoughness: 0.21,
    crystalRoughness: 0.15,
    iridescence: 0.24,
    glyphShape: 'DOUBLE_HELIX',
  },
  8: {
    id: 8,
    key: 'SOCIETY',
    name: 'Society & Law',
    materialLabel: 'Portland Limestone & Sovereign Brass',
    metalHex: 0xdabf78,
    secondaryMetalHex: 0x52483d,
    crystalColorHex: 0x0b0d14,
    attenuationHex: 0x1c1b24,
    accentHex: 0xdfd0b0,
    emissiveHex: 0xfff0d2,
    metalRoughness: 0.23,
    crystalRoughness: 0.16,
    iridescence: 0.12,
    glyphShape: 'TREATY_SCALES',
  },
  9: {
    id: 9,
    key: 'FOOD',
    name: 'Food & Craft',
    materialLabel: 'Hammered Copper & Horology Brass',
    metalHex: 0xdc8e58,
    secondaryMetalHex: 0x6b351e,
    crystalColorHex: 0x120b08,
    attenuationHex: 0x2e170d,
    accentHex: 0xeb9e65,
    emissiveHex: 0xffbe8a,
    metalRoughness: 0.21,
    crystalRoughness: 0.16,
    iridescence: 0.16,
    glyphShape: 'HOROLOGY_GEARS',
  },
  10: {
    id: 10,
    key: 'MYTH',
    name: 'Myth & Philosophy',
    materialLabel: 'Lapis Lazuli & Astral Gold-Leaf',
    metalHex: 0xe3be64,
    secondaryMetalHex: 0x302969,
    crystalColorHex: 0x09091c,
    attenuationHex: 0x16133d,
    accentHex: 0x9d8df8,
    emissiveHex: 0xc4b8ff,
    metalRoughness: 0.19,
    crystalRoughness: 0.15,
    iridescence: 0.46,
    glyphShape: 'ASTRAL_OCTAHEDRON',
  },
  11: {
    id: 11,
    key: 'LOGIC',
    name: 'Logic & Cryptic',
    materialLabel: 'Dichroic Refraction & Platinum Gold',
    metalHex: 0xeadba8,
    secondaryMetalHex: 0x3e3066,
    crystalColorHex: 0x0a091a,
    attenuationHex: 0x1c1638,
    accentHex: 0xffe278,
    emissiveHex: 0xfff4ad,
    metalRoughness: 0.16,
    crystalRoughness: 0.13,
    iridescence: 0.82,
    glyphShape: 'TESSERACT_PRISM',
  },
};

export function getDomainPalette(domainId: number): DomainShaderPalette {
  const clamped = Math.max(0, Math.min(11, Math.round(domainId))) as DomainId;
  return DOMAIN_SHADER_PALETTES[clamped] ?? DOMAIN_SHADER_PALETTES[0];
}

/**
 * AAA 3-Point Chiaroscuro Broadcast Stage Lighting States (#171 §3 & #172 Tuned):
 * - Exact `Key : Fill : Rim = 4.2 : 0.75 : 2.8` lux contrast on BROADCAST
 * - Suppressed uniform ambient wash (`<= 0.18`) & restrained IBL (`0.46..0.64`) so obsidian,
 *   carved walnut, and shadow recesses hold rich cinematic relief without 24K gold whiteout!
 */
export const LIGHTING_PRESETS: Record<LightingMode, LightingPreset> = {
  BROADCAST: {
    mode: 'BROADCAST',
    keyColor: 0xffefd4,
    keyIntensity: 4.2,
    rimColor: 0x62c0ff,
    rimIntensity: 2.8,
    fillColor: 0x8fb2de,
    fillIntensity: 0.75,
    uplightColor: 0xe6b856,
    uplightIntensity: 0.76,
    ambientColor: 0x162033,
    ambientIntensity: 0.17,
    fogColor: 0x070c18,
    fogDensity: 0.021,
    envIntensity: 0.6,
    bloomStrength: 0.14,
    exposure: 0.82,
  },
  TWIST_FRACTURE: {
    mode: 'TWIST_FRACTURE',
    keyColor: 0xff2e4d,
    keyIntensity: 4.05,
    rimColor: 0x8848f8,
    rimIntensity: 2.85,
    fillColor: 0x451630,
    fillIntensity: 0.62,
    uplightColor: 0xff1e3c,
    uplightIntensity: 0.96,
    ambientColor: 0x150812,
    ambientIntensity: 0.15,
    fogColor: 0x09040a,
    fogDensity: 0.026,
    envIntensity: 0.52,
    bloomStrength: 0.16,
    exposure: 0.82,
  },
  INTERVIEW: {
    mode: 'INTERVIEW',
    keyColor: 0xffe2b4,
    keyIntensity: 3.85,
    rimColor: 0x72b6f0,
    rimIntensity: 2.55,
    fillColor: 0x6480a4,
    fillIntensity: 0.68,
    uplightColor: 0xd4a44e,
    uplightIntensity: 0.64,
    ambientColor: 0x141b2b,
    ambientIntensity: 0.16,
    fogColor: 0x060a14,
    fogDensity: 0.023,
    envIntensity: 0.56,
    bloomStrength: 0.13,
    exposure: 0.81,
  },
  GOLD_RESONANCE: {
    mode: 'GOLD_RESONANCE',
    keyColor: 0xffe69c,
    keyIntensity: 4.35,
    rimColor: 0x46e8af,
    rimIntensity: 2.85,
    fillColor: 0xe8c97e,
    fillIntensity: 0.78,
    uplightColor: 0xf5c84c,
    uplightIntensity: 0.94,
    ambientColor: 0x1e1a12,
    ambientIntensity: 0.18,
    fogColor: 0x090d16,
    fogDensity: 0.019,
    envIntensity: 0.64,
    bloomStrength: 0.16,
    exposure: 0.84,
  },
  MISSION_FAILED: {
    mode: 'MISSION_FAILED',
    keyColor: 0xff243e,
    keyIntensity: 3.6,
    rimColor: 0x9e1b34,
    rimIntensity: 2.6,
    fillColor: 0x260812,
    fillIntensity: 0.42,
    uplightColor: 0xff142c,
    uplightIntensity: 1.08,
    ambientColor: 0x120408,
    ambientIntensity: 0.12,
    fogColor: 0x090205,
    fogDensity: 0.028,
    envIntensity: 0.46,
    bloomStrength: 0.16,
    exposure: 0.82,
  },
};

export interface CrystalFacetUniforms {
  uTime: { value: number };
  uOverclockCharge: { value: number };
  uSightlineFocus: { value: number };
  uBackfirePulse: { value: number };
  uResonanceFlash: { value: number };
  uStressHairline: { value: number };
  uPeopleHeatmap: { value: number };
  uDomainAccent: { value: THREE.Color };
  uHalfHeight: { value: number };
}

export interface CrystalFacetMaterialHandle {
  material: THREE.MeshPhysicalMaterial;
  uniforms: CrystalFacetUniforms;
}

/**
 * Luxury Horological Corundum-Sapphire Lens (`MeshPhysicalMaterial`, #171 §3.2):
 * - `ior: 1.77` (true sapphire crystal), `clearcoat: 1.0`, `clearcoatRoughness: 0.04`
 * - `iridescence: >= 0.20`, `specularIntensity: 1.0`, deep midnight-sapphire `attenuationColor`
 * - Preserves `>= 16:1` white & 24K gold MSDF text legibility while catching razor-sharp bevel speculars!
 */
export function createCrystalFacetMaterial(
  palette: DomainShaderPalette,
  halfHeight = 0.11
): CrystalFacetMaterialHandle {
  const uniforms: CrystalFacetUniforms = {
    uTime: { value: 0 },
    uOverclockCharge: { value: 0 },
    uSightlineFocus: { value: 0 },
    uBackfirePulse: { value: 0 },
    uResonanceFlash: { value: 0 },
    uStressHairline: { value: 0 },
    uPeopleHeatmap: { value: 0 },
    uDomainAccent: { value: new THREE.Color(palette.accentHex) },
    uHalfHeight: { value: Math.max(0.05, halfHeight) },
  };

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(palette.crystalColorHex),
    metalness: 0.08,
    roughness: Math.min(0.14, palette.crystalRoughness),
    transmission: 0,
    transparent: true,
    opacity: 0.84,
    ior: 1.77,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    iridescence: Math.max(0.2, palette.iridescence),
    iridescenceIOR: 1.42,
    specularIntensity: 1.0,
    specularColor: new THREE.Color(0xe2f0ff),
    envMapIntensity: 0.96,
    emissive: new THREE.Color(palette.emissiveHex),
    emissiveIntensity: 0.028,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uOverclockCharge = uniforms.uOverclockCharge;
    shader.uniforms.uSightlineFocus = uniforms.uSightlineFocus;
    shader.uniforms.uBackfirePulse = uniforms.uBackfirePulse;
    shader.uniforms.uResonanceFlash = uniforms.uResonanceFlash;
    shader.uniforms.uStressHairline = uniforms.uStressHairline;
    shader.uniforms.uPeopleHeatmap = uniforms.uPeopleHeatmap;
    shader.uniforms.uDomainAccent = uniforms.uDomainAccent;
    shader.uniforms.uHalfHeight = uniforms.uHalfHeight;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vFacetLocalPos;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vFacetLocalPos = position;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uTime;
uniform float uOverclockCharge;
uniform float uSightlineFocus;
uniform float uBackfirePulse;
uniform float uResonanceFlash;
uniform float uStressHairline;
uniform float uPeopleHeatmap;
uniform vec3 uDomainAccent;
uniform float uHalfHeight;
varying vec3 vFacetLocalPos;`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
float normY = clamp((vFacetLocalPos.y + uHalfHeight) / (2.0 * uHalfHeight), 0.0, 1.0);
float edgeRim = smoothstep(0.62, 0.99, max(abs(vFacetLocalPos.x) / 0.21, abs(vFacetLocalPos.y) / uHalfHeight));

// Sightline Beam bevel focus rim glow (keeps interior dark for crisp text readability!)
totalEmissiveRadiance += uDomainAccent * (uSightlineFocus * (0.04 + 0.42 * edgeRim));

// People's Lens global consensus warm rim aura
if (uPeopleHeatmap > 0.001) {
  float pulse = 0.78 + 0.22 * sin(uTime * 3.4);
  totalEmissiveRadiance += vec3(1.0, 0.82, 0.36) * (uPeopleHeatmap * pulse * (0.12 + 0.35 * edgeRim));
}

// Horizon Probability Lens hairline stress fracture on weak distractors
if (uStressHairline > 0.001) {
  float crackA = abs(sin((vFacetLocalPos.x * 38.0 + vFacetLocalPos.y * 23.0) + sin(vFacetLocalPos.y * 55.0)));
  float crackMask = 1.0 - smoothstep(0.0, 0.065, crackA);
  totalEmissiveRadiance += vec3(0.95, 0.34, 0.26) * (crackMask * uStressHairline * 0.55);
}

// Molten 24K Gold Overclock vertical surge (0.0 -> 1.0)
if (uOverclockCharge > 0.001) {
  float waveRipple = 0.032 * sin(vFacetLocalPos.x * 32.0 + uTime * 9.5)
                   + 0.018 * cos(vFacetLocalPos.x * 58.0 - uTime * 13.0);
  float fillLevel = uOverclockCharge * 1.08 + waveRipple;
  float submerged = 1.0 - smoothstep(fillLevel - 0.08, fillLevel + 0.03, normY);
  float meniscus = exp(-pow((normY - fillLevel) / 0.045, 2.0)) * step(0.01, uOverclockCharge);
  vec3 moltenGold = mix(vec3(0.88, 0.56, 0.12), vec3(1.0, 0.9, 0.55), meniscus);
  totalEmissiveRadiance += moltenGold * (submerged * (0.38 + 0.52 * uOverclockCharge) + meniscus * 0.95);
}

// Gold Resonance correct shatter/victory flash (#137 P0 #3: rim-focused <= 0.42 so text never washes out!)
if (uResonanceFlash > 0.001) {
  vec3 emeraldGold = mix(vec3(0.92, 0.76, 0.28), vec3(0.22, 0.85, 0.58), 0.45);
  totalEmissiveRadiance += emeraldGold * min(0.42, uResonanceFlash * (0.06 + 0.36 * edgeRim));
}

// Backfire crimson radial fracture pulse
if (uBackfirePulse > 0.001) {
  float radDist = length(vFacetLocalPos.xy);
  float ring = exp(-pow((radDist - (1.0 - uBackfirePulse) * 0.28) / 0.045, 2.0));
  float rays = pow(abs(sin(atan(vFacetLocalPos.y, vFacetLocalPos.x) * 7.0 + radDist * 24.0)), 6.0);
  totalEmissiveRadiance += vec3(0.96, 0.12, 0.22) * uBackfirePulse * (0.42 + 0.95 * ring + 0.68 * rays);
}`
      );
  };

  material.customProgramCacheKey = () => 'veritas-crystal-facet-v4';
  return { material, uniforms };
}

/**
 * Upgrades `.glb` `MeshStandardMaterial`s to luxury horological `MeshPhysicalMaterial`s (#171 §3.2 & #172 §3)
 * without cloning shared GLTF textures (`map`, `normalMap`, `roughnessMap`, `metalnessMap`):
 * - 24K Brass / Platinum / Steel: `metalness = 0.96`, micro-contrasted `roughness ~ 0.19`, `clearcoat = 0.35` lacquer sheen
 * - Nero Marquina Stone / Marble: `clearcoat = 0.65`, `clearcoatRoughness = 0.12`
 * - Obsidian / Onyx Shutters: `clearcoat = 0.68`, `clearcoatRoughness = 0.09`
 */
export function upgradeToHorologicalPhysicalMaterial(
  orig: THREE.MeshStandardMaterial,
  role: 'AUTO' | 'METAL' | 'STONE' | 'OBSIDIAN' | 'WOOD' = 'AUTO',
  envMapIntensity = 0.92,
  maxEmissiveIntensity = 0.55
): THREE.MeshPhysicalMaterial {
  const lower = (orig.name || '').toLowerCase();
  let resolvedRole = role;
  if (resolvedRole === 'AUTO') {
    if (
      orig.metalness >= 0.62 ||
      lower.includes('gold') ||
      lower.includes('brass') ||
      lower.includes('steel') ||
      lower.includes('platinum') ||
      lower.includes('silver') ||
      lower.includes('copper') ||
      lower.includes('bronze') ||
      lower.includes('titanium') ||
      lower.includes('electrum') ||
      lower.includes('metal')
    ) {
      resolvedRole = 'METAL';
    } else if (lower.includes('obsidian') || lower.includes('onyx')) {
      resolvedRole = 'OBSIDIAN';
    } else if (
      lower.includes('walnut') ||
      lower.includes('wood') ||
      lower.includes('mahogany') ||
      lower.includes('leather')
    ) {
      resolvedRole = 'WOOD';
    } else if (
      lower.includes('marble') ||
      lower.includes('stone') ||
      lower.includes('granite') ||
      lower.includes('basalt') ||
      lower.includes('slate') ||
      lower.includes('plinth') ||
      lower.includes('pedestal') ||
      lower.includes('floor')
    ) {
      resolvedRole = 'STONE';
    }
  }

  let metalness = orig.metalness;
  let roughness = orig.roughness;
  let clearcoat = 0.18;
  let clearcoatRoughness = 0.22;

  if (resolvedRole === 'METAL') {
    metalness = 0.96;
    roughness = lower.includes('liquid_gold')
      ? 0.15
      : lower.includes('antique')
        ? 0.22
        : THREE.MathUtils.clamp(orig.roughness, 0.16, 0.22);
    if (Math.abs(roughness - orig.roughness) < 0.001 && orig.roughness > 0.24) {
      roughness = 0.19;
    }
    clearcoat = 0.35;
    clearcoatRoughness = 0.14;
  } else if (resolvedRole === 'STONE') {
    metalness = Math.min(0.14, orig.metalness);
    roughness = THREE.MathUtils.clamp(orig.roughness, 0.16, 0.26);
    clearcoat = 0.65;
    clearcoatRoughness = 0.12;
  } else if (resolvedRole === 'OBSIDIAN') {
    metalness = 0.18;
    roughness = 0.18;
    clearcoat = 0.68;
    clearcoatRoughness = 0.09;
  } else if (resolvedRole === 'WOOD') {
    metalness = 0.05;
    roughness = THREE.MathUtils.clamp(orig.roughness, 0.26, 0.38);
    clearcoat = 0.42;
    clearcoatRoughness = 0.18;
  }

  const hadTransmission =
    orig instanceof THREE.MeshPhysicalMaterial && orig.transmission > 0.05;

  const phys = new THREE.MeshPhysicalMaterial({
    name: orig.name,
    color: orig.color.clone(),
    map: orig.map,
    normalMap: orig.normalMap,
    normalScale: orig.normalScale ? orig.normalScale.clone() : new THREE.Vector2(1, 1),
    roughnessMap: orig.roughnessMap,
    metalnessMap: orig.metalnessMap,
    aoMap: orig.aoMap,
    aoMapIntensity: orig.aoMapIntensity,
    emissive: orig.emissive.clone(),
    emissiveMap: orig.emissiveMap,
    emissiveIntensity: Math.min(maxEmissiveIntensity, orig.emissiveIntensity),
    metalness,
    roughness: hadTransmission ? Math.min(roughness, 0.12) : roughness,
    transmission: 0,
    clearcoat: hadTransmission ? 1.0 : clearcoat,
    clearcoatRoughness: hadTransmission ? 0.05 : clearcoatRoughness,
    specularIntensity: 1.0,
    envMapIntensity,
    transparent: orig.transparent || hadTransmission,
    opacity: hadTransmission ? Math.min(orig.opacity, 0.8) : orig.opacity,
    side: orig.side,
    vertexColors: orig.vertexColors,
  });

  return phys;
}

/**
 * Smooth Fresnel + axial distance-faded volumetric light cone material.
 */
export function createVolumetricBeamMaterial(
  colorHex: number,
  opacity = 0.14
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPosition.xyz;
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      void main() {
        vec3 viewDir = normalize(vViewPos);
        float fresnel = pow(abs(dot(vNormalView, viewDir)), 1.65);
        float axialFade = smoothstep(0.0, 0.24, vUv.y) * (1.0 - smoothstep(0.14, 1.0, vUv.y));
        float shimmer = 0.92 + 0.08 * sin(uTime * 2.4 + vUv.y * 8.0);
        float alpha = uOpacity * fresnel * axialFade * shimmer;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });
}

let cachedSparkTexture: THREE.Texture | null = null;

export function getRadialSparkTexture(_baseUrl = '/'): THREE.Texture {
  if (cachedSparkTexture) {
    return cachedSparkTexture;
  }

  // #185 #3: Pure 64x64 cubic radial falloff reaching alpha = 0 strictly by r = 0.88 (zero square sprite edges!)
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const img = ctx.createImageData(size, size);
    const data = img.data;
    const center = (size - 1) * 0.5;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (x - center) / center;
        const dy = (y - center) / center;
        const r = Math.hypot(dx, dy);
        const idx = (y * size + x) * 4;
        if (r >= 0.88) {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
        } else {
          const t = 1.0 - r / 0.88;
          const cubic = t * t * (3.0 - 2.0 * t);
          const alpha = Math.pow(cubic, 1.85);
          const core = Math.pow(t, 3.2);
          data[idx] = 255;
          data[idx + 1] = Math.round(218 + 37 * core);
          data[idx + 2] = Math.round(145 + 110 * core);
          data[idx + 3] = Math.round(255 * alpha);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  const sparkTex = new THREE.CanvasTexture(canvas);
  sparkTex.colorSpace = THREE.SRGBColorSpace;
  sparkTex.minFilter = THREE.LinearFilter;
  sparkTex.magFilter = THREE.LinearFilter;
  sparkTex.generateMipmaps = false;
  sparkTex.wrapS = THREE.ClampToEdgeWrapping;
  sparkTex.wrapT = THREE.ClampToEdgeWrapping;
  cachedSparkTexture = sparkTex;
  return cachedSparkTexture;
}

let cachedContactShadowTexture: THREE.CanvasTexture | null = null;

export function getContactShadowTexture(): THREE.CanvasTexture {
  if (cachedContactShadowTexture) {
    return cachedContactShadowTexture;
  }
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const half = size * 0.5;
    // Dual-ring ambient-occlusion contact shadow (#171 §3.2: tight dark umbral base seam + soft penumbral AO halo)
    const grad = ctx.createRadialGradient(half, half, 2, half, half, half);
    grad.addColorStop(0.0, 'rgba(1, 2, 6, 0.92)');
    grad.addColorStop(0.34, 'rgba(2, 4, 10, 0.84)');
    grad.addColorStop(0.46, 'rgba(3, 6, 14, 0.68)');
    grad.addColorStop(0.68, 'rgba(5, 8, 18, 0.26)');
    grad.addColorStop(0.88, 'rgba(6, 10, 20, 0.07)');
    grad.addColorStop(1.0, 'rgba(6, 10, 20, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  cachedContactShadowTexture = new THREE.CanvasTexture(canvas);
  return cachedContactShadowTexture;
}

/**
 * Builds the 3D Holographic Domain Core Glyph (optionally featuring an illustrated luminous
 * SDF glyph sprite `public/assets/glyphs/<glyphId>.png` inside the 3D wireframe gimbal halo!).
 */
export function buildHologramCoreGlyph(
  domainId: number,
  glyphSpriteTex?: THREE.Texture | null
): THREE.Group {
  const palette = getDomainPalette(domainId);
  const group = new THREE.Group();
  group.name = `HologramGlyph_${palette.key}`;

  const holoWireMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette.accentHex),
    emissive: new THREE.Color(palette.emissiveHex),
    emissiveIntensity: 1.15,
    metalness: 0.4,
    roughness: 0.2,
    wireframe: true,
    transparent: true,
    opacity: 0.9,
  });

  const holoSolidMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(palette.accentHex),
    emissive: new THREE.Color(palette.emissiveHex),
    emissiveIntensity: 0.88,
    metalness: 0.25,
    roughness: 0.14,
    transmission: 0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    ior: 1.5,
    transparent: true,
    opacity: 0.86,
    envMapIntensity: 0.95,
  });

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.105, 0.0032, 12, 48),
    holoSolidMat
  );
  outerRing.rotation.x = Math.PI * 0.36;
  group.add(outerRing);

  // If a Wave-2 SDF Holographic Core Glyph PNG texture is provided, mount luminous double-sided emblem
  if (glyphSpriteTex) {
    const planeMat = new THREE.MeshBasicMaterial({
      map: glyphSpriteTex,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.135, 0.135), planeMat);
    group.add(plane);
    return group;
  }

  switch (palette.glyphShape) {
    case 'CROWN_LAUREL': {
      const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.052, 0.065, 8, 1, true),
        holoWireMat
      );
      const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.042, 0), holoSolidMat);
      group.add(crown, jewel);
      break;
    }
    case 'ORBITAL_ATOM': {
      const nucleus = new THREE.Mesh(new THREE.IcosahedronGeometry(0.036, 1), holoSolidMat);
      group.add(nucleus);
      for (let i = 0; i < 3; i++) {
        const orbit = new THREE.Mesh(
          new THREE.TorusGeometry(0.088, 0.0028, 10, 40),
          holoSolidMat
        );
        orbit.rotation.set((i * Math.PI) / 3, (i * Math.PI) / 4, 0.4);
        group.add(orbit);
      }
      break;
    }
    case 'COMPASS_ARMILLARY': {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.064, 14, 10), holoWireMat);
      const eq = new THREE.Mesh(new THREE.TorusGeometry(0.084, 0.004, 10, 40), holoSolidMat);
      eq.rotation.x = Math.PI * 0.5;
      group.add(sphere, eq);
      break;
    }
    case 'IONIC_CAPITAL': {
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.042, 0.11, 12),
        holoWireMat
      );
      const voluteL = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.006, 10, 24), holoSolidMat);
      voluteL.position.set(-0.042, 0.052, 0);
      const voluteR = voluteL.clone();
      voluteR.position.set(0.042, 0.052, 0);
      group.add(shaft, voluteL, voluteR);
      break;
    }
    case 'APERTURE_STAR': {
      const starA = new THREE.Mesh(new THREE.OctahedronGeometry(0.072, 0), holoSolidMat);
      const starB = new THREE.Mesh(new THREE.OctahedronGeometry(0.072, 0), holoWireMat);
      starB.rotation.y = Math.PI * 0.25;
      starB.rotation.z = Math.PI * 0.25;
      group.add(starA, starB);
      break;
    }
    case 'VICTORY_FLAME': {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.13, 7), holoSolidMat);
      const cage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.076, 0), holoWireMat);
      group.add(cone, cage);
      break;
    }
    case 'QUANTUM_LATTICE': {
      const outerCube = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.105, 0.105), holoWireMat);
      outerCube.rotation.set(0.6, 0.78, 0.3);
      const innerCube = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.054, 0.054), holoSolidMat);
      innerCube.rotation.set(-0.6, 0.4, -0.3);
      group.add(outerCube, innerCube);
      break;
    }
    case 'DOUBLE_HELIX': {
      for (let i = 0; i < 8; i++) {
        const t = (i / 7 - 0.5) * 0.13;
        const ang = i * 0.78;
        const rung = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0035, 0.0035, 0.09, 8),
          holoSolidMat
        );
        rung.position.y = t;
        rung.rotation.z = Math.PI * 0.5;
        rung.rotation.y = ang;
        group.add(rung);
      }
      break;
    }
    case 'TREATY_SCALES': {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.01, 0.13, 8),
        holoSolidMat
      );
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.13, 8),
        holoSolidMat
      );
      beam.position.y = 0.048;
      beam.rotation.z = Math.PI * 0.5;
      const panL = new THREE.Mesh(
        new THREE.ConeGeometry(0.026, 0.018, 12, 1, true),
        holoWireMat
      );
      panL.position.set(-0.058, 0.012, 0);
      panL.rotation.x = Math.PI;
      const panR = panL.clone();
      panR.position.set(0.058, 0.012, 0);
      group.add(pillar, beam, panL, panR);
      break;
    }
    case 'HOROLOGY_GEARS': {
      const gearA = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.011, 8, 12), holoSolidMat);
      gearA.position.set(-0.024, 0.018, 0);
      const gearB = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.009, 8, 10), holoWireMat);
      gearB.position.set(0.034, -0.022, 0.01);
      group.add(gearA, gearB);
      break;
    }
    case 'ASTRAL_OCTAHEDRON': {
      const octa = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), holoSolidMat);
      const halo = new THREE.Mesh(new THREE.TorusKnotGeometry(0.055, 0.004, 48, 8), holoWireMat);
      group.add(octa, halo);
      break;
    }
    case 'TESSERACT_PRISM':
    default: {
      const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.058, 0.012, 64, 12, 2, 3),
        holoSolidMat
      );
      const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.088, 0), holoWireMat);
      group.add(knot, shell);
      break;
    }
  }

  return group;
}

const sharedGlbGeos = new WeakSet<THREE.BufferGeometry>();
const sharedGlbMats = new WeakSet<THREE.Material>();

/**
 * Registers all geometries and materials inside a cached GLTF template in `WeakSet`s
 * (#155 fix: `m.clone()` copies `userData`, whereas `WeakSet` tracks exact object identity so
 * cloned materials dispose 100% cleanly across 40+ rounds while cached templates stay alive!).
 */
export function markSharedGlbResources(templateRoot: THREE.Object3D): void {
  templateRoot.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
      if (obj.geometry) {
        sharedGlbGeos.add(obj.geometry);
      }
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) {
        if (m) {
          sharedGlbMats.add(m);
        }
      }
    }
  });
}

/**
 * Disposes ONLY per-instance cloned materials and procedural geometries in `root`,
 * strictly preserving cached GLTF template geometries/materials and shared textures.
 */
export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
      if (obj.geometry && !sharedGlbGeos.has(obj.geometry)) {
        obj.geometry.dispose();
      }
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const m of mats) {
        if (m && !sharedGlbMats.has(m) && typeof m.dispose === 'function') {
          m.dispose();
        }
      }
    }
  });
}
