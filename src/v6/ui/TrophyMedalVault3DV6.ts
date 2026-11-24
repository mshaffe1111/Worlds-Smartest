// ============================================================================
// WORLD'S SMARTEST v6.0 — 3D Trophy & Cast-Relief Medal Vault (`36` Honors)
// 12 Sculpted Championship Trophies + 24 Struck Relief & Cloisonne Medals
// Live Interactive 360-deg Three.js PBR Museum Turntable · Zero-Scroll Pager
// ============================================================================

import * as THREE from 'three';
import type {
  FoleySfxIdV6,
  HonorAwardDefinitionV6,
  ResolutionTierV6,
} from '../contracts_v6';

// ----------------------------------------------------------------------------
// 36 Human-Written Championship Trophies (12) & Cast Relief Medals (24)
// ----------------------------------------------------------------------------
export const HONOR_AWARDS_CATALOG_V6: readonly HonorAwardDefinitionV6[] = [
  // ===================== 12 SCULPTED CHAMPIONSHIP TROPHIES =====================
  {
    awardId: 'trophy_sovereign_mind_crown',
    kind: 'TROPHY',
    name: 'The Sovereign Mind Crown',
    engraving: 'Struck in 24k gold for the lone mind left standing beneath the Colosseum braziers.',
    unlockRequirement: 'Win Episode 20 in Stage 10: Sovereign Colosseum',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'SOVEREIGN_CROWN',
  },
  {
    awardId: 'trophy_uncut_detonator',
    kind: 'TROPHY',
    name: 'The Uncut Detonator',
    engraving: 'Three wrong wires severed with a surgeon’s pulse; the live truth left humming.',
    unlockRequirement: 'Clear 10 Wire-Defusal clues without cutting a live wire',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'DETONATOR_CORE',
  },
  {
    awardId: 'trophy_geneva_tourbillon',
    kind: 'TROPHY',
    name: 'The Geneva Tourbillon',
    engraving: 'Balanced on jewel bearings; not a tenth of a second wasted across three rotating rings.',
    unlockRequirement: 'Align a triple-ring x3 laser bonus in Geneva Conservatory',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'TOURBILLON_CAGE',
  },
  {
    awardId: 'trophy_monte_carlo_chalice',
    kind: 'TROPHY',
    name: 'Monte Carlo High-Roller',
    engraving: 'Pushed the emerald felt to natural twenty-one while the whole salon held its breath.',
    unlockRequirement: 'Cash a $10,000+ single-stage purse in Monte Carlo Salon',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'HIGH_ROLLER_CHALICE',
  },
  {
    awardId: 'trophy_frankie_contraband_wrench',
    kind: 'TROPHY',
    name: "Frankie's Contraband Wrench",
    engraving: 'Stamped beneath the velvet lining: "If the studio rigs the lights, rig the wiring back."',
    unlockRequirement: 'Trigger 5 Relic + Foil Trick Card synergies in one episode',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'CONTRABAND_WRENCH',
  },
  {
    awardId: 'trophy_trapdoor_houdini',
    kind: 'TROPHY',
    name: 'Trapdoor Houdini',
    engraving: 'Dropped through the stage floor three times in one show and climbed out smiling.',
    unlockRequirement: 'Survive 3 Trapdoor Pit drops in a single episode',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'HOUDINI_ESCAPEMENT',
  },
  {
    awardId: 'trophy_cartographer_sextant',
    kind: 'TROPHY',
    name: "Cartographer's Sextant",
    engraving: 'Dropped a brass pin within fifty kilometers of truth on a spinning relief Earth.',
    unlockRequirement: 'Score 3 globe bullseyes within 150 km on the 3D Relief Atlas',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'BRASS_SEXTANT',
  },
  {
    awardId: 'trophy_kyoto_kintsugi_vessel',
    kind: 'TROPHY',
    name: 'The Kintsugi Urushi Vessel',
    engraving: 'What broke under pressure returned stronger, mended in molten lacquer and gold leaf.',
    unlockRequirement: 'Win a match after trailing your rival by $2,500+ at halftime',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'KINTSUGI_VESSEL',
  },
  {
    awardId: 'trophy_bathysphere_bell',
    kind: 'TROPHY',
    name: 'Abyssal Bathysphere Bell',
    engraving: 'Tested at four hundred atmospheres where only calm deduction keeps the hull intact.',
    unlockRequirement: 'Sweep Stage 08: Sunken Bathysphere without losing a streak',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'BATHYSPHERE_BELL',
  },
  {
    awardId: 'trophy_astral_armillary',
    kind: 'TROPHY',
    name: 'Astral Prism Armillary',
    engraving: 'Refracted aurora light through three crystal spheres to solve the Zenith Equinox.',
    unlockRequirement: 'Conquer Episode 18 in Stage 09: Astral Observatory',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'ASTRAL_ARMILLARY',
  },
  {
    awardId: 'trophy_colosseum_brazier',
    kind: 'TROPHY',
    name: 'Nero Colosseum Brazier',
    engraving: 'Carved from veined marble and ruby flame for conquering every board twist alive.',
    unlockRequirement: 'Win 10 episodes with active Halftime Board Mutations',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'COLOSSEUM_BRAZIER',
  },
  {
    awardId: 'trophy_golden_ribbon_mic',
    kind: 'TROPHY',
    name: 'Prime-Time Ribbon Mic',
    engraving: 'Presented by the broadcast booth for a flawless, zero-miss prime-time taping.',
    unlockRequirement: 'Complete any full 100-Board episode with 100% clue accuracy',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'BROADCAST_RIBBON_MIC',
  },

  // =================== 24 CAST RELIEF & CLOISONNE MEDALS ===================
  {
    awardId: 'medal_opening_night',
    kind: 'MEDAL',
    name: 'Opening Night Curtain Call',
    engraving: 'Stepped into the Edison footlights and took your first live stage victory.',
    unlockRequirement: 'Complete Episode 01 in Vaudeville Palace',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'MEDAL_LAUREL_MASK',
  },
  {
    awardId: 'medal_vaudeville_headliner',
    kind: 'MEDAL',
    name: 'Broadway Spotlight Star',
    engraving: 'Name bolted in marquee brass after sweeping both Vaudeville Palace billings.',
    unlockRequirement: 'Clear Episodes 01 & 02 in Stage 01',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'MEDAL_STARBURST_ENAMEL',
  },
  {
    awardId: 'medal_swiss_chronometer',
    kind: 'MEDAL',
    name: 'Escapement Precision Seal',
    engraving: 'Certified accurate to the single beat across every rotary clockwork board.',
    unlockRequirement: 'Win 3 Clockwork Rotary contraption matches',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'MEDAL_GEAR_WHEEL',
  },
  {
    awardId: 'medal_riviera_blackjack',
    kind: 'MEDAL',
    name: 'Natural Twenty-One Token',
    engraving: 'Hit exact twenty-one on the Monte Carlo felt without triggering the trapdoor.',
    unlockRequirement: 'Score an exact 21 jackpot on Blackjack 21 Felt',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'MEDAL_OCTAGON_SPADE',
  },
  {
    awardId: 'medal_zero_kilometer_pin',
    kind: 'MEDAL',
    name: 'Meridian Bullseye Medallion',
    engraving: 'Vitreous sapphire enamel inlaid for an uncanny single-pin globe drop.',
    unlockRequirement: 'Land within 80 km of any target on the 3D Relief Globe',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'MEDAL_COMPASS_ROSE',
  },
  {
    awardId: 'medal_bunker_nixie_pulse',
    kind: 'MEDAL',
    name: 'Cold-War Nixie Clearance',
    engraving: 'Authorized access to Sub-Level Five after cracking the phosphor radar sweep.',
    unlockRequirement: 'Clear Stage 05: Analog Bunker 1969',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'MEDAL_RADAR_GRID',
  },
  {
    awardId: 'medal_urushi_crimson_crest',
    kind: 'MEDAL',
    name: 'Kyoto Vermilion Seal',
    engraving: 'Kiln-fired crimson cloisonne awarded for bridging the Kintsugi stone web.',
    unlockRequirement: 'Win a Turf-War Bridge match in Kyoto Lacquer Pavilion',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'MEDAL_TORII_ENAMEL',
  },
  {
    awardId: 'medal_calliope_encore',
    kind: 'MEDAL',
    name: 'Midnight Pier Calliope',
    engraving: 'Kept the steel ball singing across every copper bumper on the misty pier.',
    unlockRequirement: 'Win 3 Gravity Physics contraption matches',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'MEDAL_CAROUSEL_CREST',
  },
  {
    awardId: 'medal_trench_pressure',
    kind: 'MEDAL',
    name: 'Hadopelagic Dive Cross',
    engraving: 'Struck in 925 sterling silver for sealing every airlock below ten thousand meters.',
    unlockRequirement: 'Win Episode 16 in Sunken Bathysphere',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'MEDAL_PORTHOLE_CROSS',
  },
  {
    awardId: 'medal_aurora_equinox',
    kind: 'MEDAL',
    name: 'Equinox Prism Medallion',
    engraving: 'Split white starlight into six scoring bands under the open copper dome.',
    unlockRequirement: 'Claim 5 Prism or Constellation nodes in one match',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'MEDAL_PRISM_STAR',
  },
  {
    awardId: 'medal_colosseum_laurel',
    kind: 'MEDAL',
    name: 'Imperator Laurel Disk',
    engraving: 'High-relief classical wreath cast for conquering a ★ 9.0+ Legend-tier clue.',
    unlockRequirement: 'Solve 5 clues rated ★ 9.0 or higher',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'MEDAL_WREATH_RING',
  },
  {
    awardId: 'medal_wire_surgeon',
    kind: 'MEDAL',
    name: 'Cold-Sweat Wire Surgeon',
    engraving: 'Snipped the final wrong wire with under 1.2 seconds remaining on the clock.',
    unlockRequirement: 'Defuse a Wire-Cut clue with < 1.2s left',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'MEDAL_SCISSOR_BOLT',
  },
  {
    awardId: 'medal_cryptex_cracker',
    kind: 'MEDAL',
    name: 'Master Cryptex Tumbler',
    engraving: 'Aligned stone letter rings cleanly without burning a single hint.',
    unlockRequirement: 'Solve 15 Cryptex or Dial lock clues',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'MEDAL_KEYHOLE_RING',
  },
  {
    awardId: 'medal_lie_detector',
    kind: 'MEDAL',
    name: "Host's Lie Expose",
    engraving: 'Caught Julian slipping a forged word past the prime-time teleprompter.',
    unlockRequirement: 'Spot 5 Host Lies or Sabotage Twists accurately',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'MEDAL_EYE_DIAMOND',
  },
  {
    awardId: 'medal_trapdoor_survivor_5',
    kind: 'MEDAL',
    name: 'Five-Drop Pit Veteran',
    engraving: 'The floor hinges know your weight by heart, and still cannot keep you down.',
    unlockRequirement: 'Survive 5 total Trapdoor Pit mini-games',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'MEDAL_HINGE_SHIELD',
  },
  {
    awardId: 'medal_trapdoor_immortal',
    kind: 'MEDAL',
    name: 'Unbreakable Trapdoor Ace',
    engraving: 'Outlasted all ten distinct 8-second pit contraptions without losing a life.',
    unlockRequirement: 'Survive 20 Trapdoor Pit mini-games across your career',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'MEDAL_PHOENIX_CREST',
  },
  {
    awardId: 'medal_ten_streak_blaze',
    kind: 'MEDAL',
    name: 'Ten-Clue Incandescent',
    engraving: 'Lit up every brass marquee filament with ten unbroken answers in a row.',
    unlockRequirement: 'Reach a 10-clue streak in any show',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'MEDAL_FLAME_SUN',
  },
  {
    awardId: 'medal_twenty_five_streak',
    kind: 'MEDAL',
    name: 'Unbroken Quarter-Century',
    engraving: 'Twenty-five consecutive truths. Even the rival booth stood up to applaud.',
    unlockRequirement: 'Reach a 25-clue career streak',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'MEDAL_CROWN_HEX',
  },
  {
    awardId: 'medal_frankie_vip',
    kind: 'MEDAL',
    name: 'Backstage Contraband Stamp',
    engraving: 'Issued personally by Frankie once your trunk holds four gleaming 3D relics.',
    unlockRequirement: 'Equip 4 Relics simultaneously in Frankie’s Prop Trunk',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'MEDAL_TRUNK_CLASP',
  },
  {
    awardId: 'medal_mult_alchemist',
    kind: 'MEDAL',
    name: 'Ten-Times Mult Alchemist',
    engraving: 'Chained relics, streaks, and foil tricks past a blistering x10 multiplier.',
    unlockRequirement: 'Reach x10.0 Multiplier in a single episode',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'MEDAL_MULT_DIAMOND',
  },
  {
    awardId: 'medal_speed_reflex',
    kind: 'MEDAL',
    name: 'Sub-Second Paddle Reflex',
    engraving: 'Slammed the right brass paddle before the host finished the syllable.',
    unlockRequirement: 'Solve 10 Rapid-Paddle or Reflex clues under 1.5s',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'MEDAL_LIGHTNING_COIN',
  },
  {
    awardId: 'medal_corpus_centurion',
    kind: 'MEDAL',
    name: 'One Thousand Unique Clues',
    engraving: 'One thousand distinct bits flipped in the 1.27M zero-repeat ledger.',
    unlockRequirement: 'Answer 1,000 unique calibrated clues without a repeat',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'MEDAL_SCROLL_SEAL',
  },
  {
    awardId: 'medal_twist_master',
    kind: 'MEDAL',
    name: 'Chaos Mutation Conqueror',
    engraving: 'Blackouts, gravity flips, and blind auctions—none could knock you off pace.',
    unlockRequirement: 'Win matches under 6 different Halftime Board Twists',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'MEDAL_VORTEX_COIN',
  },
  {
    awardId: 'medal_grand_encyclopedist',
    kind: 'MEDAL',
    name: 'All-10-Worlds Sovereign',
    engraving: 'Every architectural stage from Broadway to the Colosseum carries your signature.',
    unlockRequirement: 'Earn at least one win in all 10 Stage Worlds',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'MEDAL_GLOBE_CROWN',
  },
];

export const MATERIAL_TIER_LABELS_V6: Record<HonorAwardDefinitionV6['materialTier'], string> = {
  CAST_BRONZE: 'CAST BRONZE',
  CLOISONNE_ENAMEL: 'CLOISONNÉ ENAMEL',
  STERLING_SILVER: '925 STERLING',
  GOLD_24K: '24K MINT GOLD',
  OBSIDIAN_RUBY: 'OBSIDIAN & RUBY',
};

// ----------------------------------------------------------------------------
// Shared Procedural 3D PBR Material Cache & Sculpture Builder
// ----------------------------------------------------------------------------
let cachedBrushedBumpTex: THREE.CanvasTexture | null = null;

function getBrushedMetalBumpTexture(): THREE.CanvasTexture | null {
  if (cachedBrushedBumpTex) return cachedBrushedBumpTex;
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y++) {
    const shade = 112 + ((y * 37) % 32);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(0, y, 128, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  cachedBrushedBumpTex = tex;
  return tex;
}

interface HonorMaterialSet {
  primary: THREE.MeshPhysicalMaterial;
  accent: THREE.MeshPhysicalMaterial;
  enamel: THREE.MeshPhysicalMaterial;
  plinth: THREE.MeshPhysicalMaterial;
}

function createHonorMaterials(
  tier: HonorAwardDefinitionV6['materialTier'],
  unlocked: boolean,
): HonorMaterialSet {
  const bump = getBrushedMetalBumpTexture();

  if (!unlocked) {
    // Museum foundry cast proof (tangible silhouette waiting to be earned!)
    const primary = new THREE.MeshPhysicalMaterial({
      color: 0x4b4640,
      metalness: 0.72,
      roughness: 0.52,
      clearcoat: 0.12,
      bumpMap: bump,
      bumpScale: 0.015,
    });
    const accent = new THREE.MeshPhysicalMaterial({
      color: 0x6b5c49,
      metalness: 0.78,
      roughness: 0.44,
      clearcoat: 0.16,
    });
    const enamel = new THREE.MeshPhysicalMaterial({
      color: 0x262930,
      metalness: 0.2,
      roughness: 0.45,
      clearcoat: 0.3,
    });
    const plinth = new THREE.MeshPhysicalMaterial({
      color: 0x18171b,
      metalness: 0.18,
      roughness: 0.55,
      clearcoat: 0.25,
    });
    return { primary, accent, enamel, plinth };
  }

  let primary: THREE.MeshPhysicalMaterial;
  let accent: THREE.MeshPhysicalMaterial;
  let enamel: THREE.MeshPhysicalMaterial;

  switch (tier) {
    case 'CAST_BRONZE':
      primary = new THREE.MeshPhysicalMaterial({
        color: 0xc27b43,
        metalness: 0.88,
        roughness: 0.3,
        clearcoat: 0.24,
        bumpMap: bump,
        bumpScale: 0.018,
      });
      accent = new THREE.MeshPhysicalMaterial({
        color: 0xe6ad67,
        metalness: 0.92,
        roughness: 0.2,
        clearcoat: 0.38,
      });
      enamel = new THREE.MeshPhysicalMaterial({
        color: 0x26483e,
        metalness: 0.15,
        roughness: 0.18,
        clearcoat: 0.85,
      });
      break;
    case 'CLOISONNE_ENAMEL':
      primary = new THREE.MeshPhysicalMaterial({
        color: 0xeabf5c,
        metalness: 0.94,
        roughness: 0.18,
        clearcoat: 0.42,
        bumpMap: bump,
        bumpScale: 0.012,
      });
      accent = new THREE.MeshPhysicalMaterial({
        color: 0xfff0be,
        metalness: 0.96,
        roughness: 0.14,
        clearcoat: 0.5,
      });
      enamel = new THREE.MeshPhysicalMaterial({
        color: 0x168f9e,
        emissive: 0x052830,
        metalness: 0.12,
        roughness: 0.08,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
      });
      break;
    case 'STERLING_SILVER':
      primary = new THREE.MeshPhysicalMaterial({
        color: 0xdce4ee,
        metalness: 0.96,
        roughness: 0.16,
        clearcoat: 0.45,
        bumpMap: bump,
        bumpScale: 0.012,
      });
      accent = new THREE.MeshPhysicalMaterial({
        color: 0x8bb6e8,
        emissive: 0x0b1c36,
        metalness: 0.86,
        roughness: 0.18,
        clearcoat: 0.7,
      });
      enamel = new THREE.MeshPhysicalMaterial({
        color: 0x173157,
        metalness: 0.22,
        roughness: 0.12,
        clearcoat: 0.95,
      });
      break;
    case 'OBSIDIAN_RUBY':
      primary = new THREE.MeshPhysicalMaterial({
        color: 0x1a1720,
        metalness: 0.35,
        roughness: 0.09,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
      });
      accent = new THREE.MeshPhysicalMaterial({
        color: 0xf4c553,
        metalness: 0.96,
        roughness: 0.15,
        clearcoat: 0.5,
      });
      enamel = new THREE.MeshPhysicalMaterial({
        color: 0xd91c45,
        emissive: 0x4d0618,
        metalness: 0.18,
        roughness: 0.06,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
      });
      break;
    case 'GOLD_24K':
    default:
      primary = new THREE.MeshPhysicalMaterial({
        color: 0xf5c54d,
        metalness: 0.97,
        roughness: 0.15,
        clearcoat: 0.52,
        bumpMap: bump,
        bumpScale: 0.012,
      });
      accent = new THREE.MeshPhysicalMaterial({
        color: 0xfff0b2,
        metalness: 0.98,
        roughness: 0.11,
        clearcoat: 0.65,
      });
      enamel = new THREE.MeshPhysicalMaterial({
        color: 0x821428,
        emissive: 0x22040a,
        metalness: 0.16,
        roughness: 0.1,
        clearcoat: 0.96,
      });
      break;
  }

  const plinth = new THREE.MeshPhysicalMaterial({
    color: 0x151117,
    metalness: 0.22,
    roughness: 0.22,
    clearcoat: 0.8,
  });

  return { primary, accent, enamel, plinth };
}

/**
 * Procedural 3D PBR sculpture factory shared by TrophyMedalVault3DV6 and PostMatchCeremonyV6.
 * Builds 12 unique sculpted Championship Trophies & 24 distinct Cast-Relief / Cloisonne Medals.
 */
export function buildHonor3DGroupV6(
  award: HonorAwardDefinitionV6,
  unlocked: boolean,
): THREE.Group {
  const group = new THREE.Group();
  const mats = createHonorMaterials(award.materialTier, unlocked);

  if (award.kind === 'TROPHY') {
    // Turned obsidian-and-brass exhibition plinth
    const baseFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.06, 0.26, 32), mats.plinth);
    baseFoot.position.y = -1.16;
    group.add(baseFoot);

    const baseCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.9, 0.1, 32), mats.accent);
    baseCollar.position.y = -0.98;
    group.add(baseCollar);

    const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.15, 0.06), mats.accent);
    plaque.position.set(0, -1.15, 0.96);
    group.add(plaque);

    buildTrophyUpperSculpture(group, award.sculptArchetype, mats);
  } else {
    buildMedalReliefSculpture(group, award.sculptArchetype, mats);
  }

  return group;
}

function buildTrophyUpperSculpture(
  group: THREE.Group,
  archetype: string,
  mats: HonorMaterialSet,
): void {
  switch (archetype) {
    case 'SOVEREIGN_CROWN': {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.66, 0.34, 32, 1, true), mats.primary);
      band.material.side = THREE.DoubleSide;
      band.position.y = -0.25;
      group.add(band);

      const rimLow = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.055, 16, 40), mats.accent);
      rimLow.rotation.x = Math.PI / 2;
      rimLow.position.y = -0.42;
      group.add(rimLow);

      const rimHigh = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.055, 16, 40), mats.accent);
      rimHigh.rotation.x = Math.PI / 2;
      rimHigh.position.y = -0.08;
      group.add(rimHigh);

      // 8 sculpted gothic crown spires & 4 imperial arches meeting at ruby finial
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.44, 6), mats.primary);
        spire.position.set(Math.cos(angle) * 0.72, 0.18, Math.sin(angle) * 0.72);
        group.add(spire);

        const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.085, 0), mats.enamel);
        jewel.position.set(Math.cos(angle) * 0.75, -0.24, Math.sin(angle) * 0.75);
        group.add(jewel);
      }
      for (let a = 0; a < 4; a++) {
        const arch = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.045, 12, 32, Math.PI), mats.primary);
        arch.rotation.y = (a * Math.PI) / 4;
        arch.position.y = -0.06;
        group.add(arch);
      }
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), mats.enamel);
      orb.position.y = 0.82;
      group.add(orb);
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.56, 0.5, 24), mats.primary);
      pedestal.position.y = -0.68;
      group.add(pedestal);
      break;
    }

    case 'DETONATOR_CORE': {
      const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.62, 1.35, 8), mats.primary);
      housing.position.y = -0.15;
      group.add(housing);

      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 1), mats.enamel);
      core.position.y = 0.78;
      group.add(core);

      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.48, 0.14), mats.accent);
        rib.position.set(Math.cos(a) * 0.56, -0.1, Math.sin(a) * 0.56);
        rib.rotation.y = -a;
        group.add(rib);

        const wire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 10, 24, Math.PI), mats.accent);
        wire.position.set(Math.cos(a) * 0.34, 0.58, Math.sin(a) * 0.34);
        wire.rotation.y = -a;
        group.add(wire);
      }
      break;
    }

    case 'TOURBILLON_CAGE': {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.38, 0.45, 24), mats.primary);
      stem.position.y = -0.7;
      group.add(stem);

      const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.07, 16, 48), mats.primary);
      outerRing.position.y = 0.24;
      group.add(outerRing);

      const midRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.055, 16, 40), mats.accent);
      midRing.position.y = 0.24;
      midRing.rotation.y = Math.PI / 3;
      group.add(midRing);

      const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.045, 16, 36), mats.primary);
      innerRing.position.y = 0.24;
      innerRing.rotation.x = Math.PI / 3;
      group.add(innerRing);

      const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), mats.enamel);
      jewel.position.y = 0.24;
      group.add(jewel);

      for (let t = 0; t < 12; t++) {
        const a = (t / 12) * Math.PI * 2;
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.08), mats.accent);
        tooth.position.set(Math.cos(a) * 0.92, 0.24 + Math.sin(a) * 0.92, 0);
        tooth.rotation.z = a;
        group.add(tooth);
      }
      break;
    }

    case 'HIGH_ROLLER_CHALICE': {
      const pts = [
        new THREE.Vector2(0.01, -0.92),
        new THREE.Vector2(0.46, -0.92),
        new THREE.Vector2(0.14, -0.58),
        new THREE.Vector2(0.22, -0.22),
        new THREE.Vector2(0.12, 0.04),
        new THREE.Vector2(0.58, 0.26),
        new THREE.Vector2(0.76, 0.78),
        new THREE.Vector2(0.68, 0.84),
        new THREE.Vector2(0.48, 0.34),
        new THREE.Vector2(0.01, 0.22),
      ];
      const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), mats.primary);
      group.add(cup);

      const leftHandle = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 12, 28, Math.PI * 1.25), mats.accent);
      leftHandle.position.set(-0.68, 0.44, 0);
      leftHandle.rotation.z = Math.PI * 0.42;
      group.add(leftHandle);

      const rightHandle = leftHandle.clone();
      rightHandle.position.x = 0.68;
      rightHandle.rotation.z = -Math.PI * 0.42;
      rightHandle.rotation.y = Math.PI;
      group.add(rightHandle);

      const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), mats.enamel);
      diamond.position.y = 0.88;
      group.add(diamond);
      break;
    }

    case 'CONTRABAND_WRENCH': {
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.48, 0.14), mats.primary);
      shaft.position.y = -0.02;
      shaft.rotation.z = -0.18;
      group.add(shaft);

      const head = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.11, 14, 28, Math.PI * 1.45), mats.accent);
      head.position.set(-0.16, 0.82, 0);
      head.rotation.z = 0.6;
      group.add(head);

      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.2, 6), mats.enamel);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(-0.14, 0.8, 0);
      group.add(bolt);

      const tailRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 12, 24), mats.accent);
      tailRing.position.set(0.14, -0.72, 0);
      group.add(tailRing);
      break;
    }

    case 'HOUDINI_ESCAPEMENT': {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.12, 0.82), mats.primary);
      frame.position.y = -0.58;
      group.add(frame);

      const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.72), mats.accent);
      doorL.position.set(-0.42, -0.28, 0);
      doorL.rotation.z = -0.92;
      group.add(doorL);

      const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.72), mats.accent);
      doorR.position.set(0.42, -0.28, 0);
      doorR.rotation.z = 0.92;
      group.add(doorR);

      // Rising chain rings & victory star
      for (let i = 0; i < 4; i++) {
        const link = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 10, 20), mats.primary);
        link.position.y = -0.28 + i * 0.26;
        link.rotation.y = (i % 2) * (Math.PI / 2);
        group.add(link);
      }
      const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), mats.enamel);
      finial.position.y = 0.84;
      group.add(finial);
      break;
    }

    case 'BRASS_SEXTANT': {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.065, 14, 36, Math.PI * 0.65), mats.primary);
      arc.position.y = 0.2;
      arc.rotation.z = Math.PI * 1.18;
      group.add(arc);

      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.96, 0.08), mats.accent);
      armL.position.set(-0.26, 0.14, 0);
      armL.rotation.z = -0.45;
      group.add(armL);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.96, 0.08), mats.accent);
      armR.position.set(0.26, 0.14, 0);
      armR.rotation.z = 0.45;
      group.add(armR);

      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.92, 20), mats.primary);
      scope.rotation.z = Math.PI / 2 - 0.25;
      scope.position.set(0.05, 0.48, 0.12);
      group.add(scope);

      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), mats.enamel);
      lens.position.set(0.5, 0.36, 0.12);
      group.add(lens);
      break;
    }

    case 'KINTSUGI_VESSEL': {
      const pts = [
        new THREE.Vector2(0.01, -0.82),
        new THREE.Vector2(0.42, -0.82),
        new THREE.Vector2(0.76, -0.34),
        new THREE.Vector2(0.84, 0.28),
        new THREE.Vector2(0.68, 0.72),
        new THREE.Vector2(0.58, 0.72),
        new THREE.Vector2(0.72, 0.26),
        new THREE.Vector2(0.62, -0.28),
        new THREE.Vector2(0.32, -0.68),
        new THREE.Vector2(0.01, -0.68),
      ];
      const bowl = new THREE.Mesh(new THREE.LatheGeometry(pts, 36), mats.primary);
      group.add(bowl);

      // Molten kintsugi gold repair veins
      for (let i = 0; i < 3; i++) {
        const seam = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.032, 10, 32, Math.PI * 0.7), mats.accent);
        seam.rotation.y = (i * Math.PI * 2) / 3;
        seam.rotation.x = 0.55;
        seam.position.y = 0.05;
        group.add(seam);
      }
      const ember = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), mats.enamel);
      ember.position.y = 0.32;
      group.add(ember);
      break;
    }

    case 'BATHYSPHERE_BELL': {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.74, 32, 24), mats.primary);
      sphere.position.y = 0.02;
      group.add(sphere);

      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.06, 14, 36), mats.accent);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 0.02;
      group.add(collar);

      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const portFrame = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.055, 12, 24), mats.accent);
        portFrame.position.set(Math.cos(a) * 0.7, 0.06, Math.sin(a) * 0.7);
        portFrame.rotation.y = -a + Math.PI / 2;
        group.add(portFrame);

        const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 20), mats.enamel);
        glass.position.set(Math.cos(a) * 0.68, 0.06, Math.sin(a) * 0.68);
        glass.rotation.z = Math.PI / 2;
        glass.rotation.y = -a;
        group.add(glass);
      }

      const hook = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 12, 24), mats.accent);
      hook.position.y = 0.92;
      group.add(hook);
      break;
    }

    case 'ASTRAL_ARMILLARY': {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.34, 0.56, 20), mats.primary);
      stand.position.y = -0.66;
      group.add(stand);

      for (let i = 0; i < 4; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.76 - i * 0.1, 0.038, 12, 42), i % 2 === 0 ? mats.primary : mats.accent);
        ring.position.y = 0.22;
        ring.rotation.set(i * 0.55, i * 0.85, i * 0.3);
        group.add(ring);
      }

      const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 12), mats.accent);
      axis.position.y = 0.22;
      axis.rotation.z = 0.42;
      group.add(axis);

      const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), mats.enamel);
      prism.position.y = 0.22;
      group.add(prism);
      break;
    }

    case 'COLOSSEUM_BRAZIER': {
      const tripodLegs = 3;
      for (let i = 0; i < tripodLegs; i++) {
        const a = (i / tripodLegs) * Math.PI * 2;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.15, 12), mats.accent);
        leg.position.set(Math.cos(a) * 0.42, -0.34, Math.sin(a) * 0.42);
        leg.rotation.z = Math.cos(a) * 0.24;
        leg.rotation.x = -Math.sin(a) * 0.24;
        group.add(leg);
      }
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.48, 0.34, 16), mats.primary);
      basin.position.y = 0.26;
      group.add(basin);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.06, 12, 32), mats.accent);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.43;
      group.add(rim);

      // Sculpted ruby flame spires
      for (let f = 0; f < 5; f++) {
        const a = (f / 5) * Math.PI * 2;
        const r = f === 0 ? 0 : 0.26;
        const h = f === 0 ? 0.72 : 0.48;
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.18, h, 5), mats.enamel);
        flame.position.set(Math.cos(a) * r, 0.56 + h * 0.3, Math.sin(a) * r);
        group.add(flame);
      }
      break;
    }

    case 'BROADCAST_RIBBON_MIC':
    default: {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.72, 18), mats.accent);
      stalk.position.y = -0.58;
      group.add(stalk);

      const yoke = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.045, 12, 32, Math.PI), mats.accent);
      yoke.rotation.z = Math.PI;
      yoke.position.y = 0.18;
      group.add(yoke);

      const pillBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.58, 12, 24), mats.primary);
      pillBody.position.y = 0.28;
      group.add(pillBody);

      for (let r = -3; r <= 3; r++) {
        const louver = new THREE.Mesh(new THREE.TorusGeometry(0.41 - Math.abs(r) * 0.015, 0.022, 8, 32), mats.accent);
        louver.rotation.x = Math.PI / 2;
        louver.position.y = 0.28 + r * 0.11;
        group.add(louver);
      }
      const airLight = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14), mats.enamel);
      airLight.position.set(0, 0.96, 0);
      group.add(airLight);
      break;
    }
  }
}

function buildMedalReliefSculpture(
  group: THREE.Group,
  archetype: string,
  mats: HonorMaterialSet,
): void {
  // Determine medallion contour (Octagonal, 12-sided scalloped, or Classic Mint Disk)
  let radialSegments = 48;
  if (archetype.includes('OCTAGON') || archetype.includes('HEX') || archetype.includes('CROWN')) {
    radialSegments = 8;
  } else if (archetype.includes('CROSS') || archetype.includes('SHIELD') || archetype.includes('STAR')) {
    radialSegments = 12;
  }

  // Thick high-pressure mint blank
  const blank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.96, 0.96, 0.16, radialSegments),
    mats.primary,
  );
  blank.rotation.x = Math.PI / 2;
  group.add(blank);

  // Struck raised outer bezel rim (front & reverse!)
  const rimFront = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.085, 16, radialSegments), mats.accent);
  rimFront.position.z = 0.06;
  group.add(rimFront);

  const rimBack = rimFront.clone();
  rimBack.position.z = -0.06;
  group.add(rimBack);

  // Recessed cloisonne enamel or matte-blasted obverse & reverse field disks
  const fieldFront = new THREE.Mesh(
    new THREE.CylinderGeometry(0.84, 0.84, 0.04, radialSegments),
    mats.enamel,
  );
  fieldFront.rotation.x = Math.PI / 2;
  fieldFront.position.z = 0.075;
  group.add(fieldFront);

  const fieldBack = fieldFront.clone();
  fieldBack.position.z = -0.075;
  group.add(fieldBack);

  // Reeded coin edge / radial mint studs
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const pip = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), mats.accent);
    pip.position.set(Math.cos(a) * 0.89, Math.sin(a) * 0.89, 0.11);
    group.add(pip);
  }

  // Top suspension bail & ribbon bar clasp
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.042, 12, 24), mats.accent);
  bail.position.set(0, 1.08, 0);
  group.add(bail);

  const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.14, 0.1), mats.accent);
  clasp.position.set(0, 1.28, 0);
  group.add(clasp);

  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.34, 0.05), mats.enamel);
  ribbon.position.set(0, 1.48, 0);
  group.add(ribbon);

  // High-relief sculpted center emblem (both obverse & mirrored reverse!)
  const emblem = buildMedalCenterEmblem(archetype, mats);
  emblem.position.z = 0.11;
  group.add(emblem);

  const reverseEmblem = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 12, 24), mats.accent);
  reverseEmblem.position.z = -0.11;
  group.add(reverseEmblem);
}

function buildMedalCenterEmblem(archetype: string, mats: HonorMaterialSet): THREE.Group {
  const emblem = new THREE.Group();

  if (archetype.includes('GEAR') || archetype.includes('VORTEX') || archetype.includes('CAROUSEL')) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.07, 12, 28), mats.accent);
    emblem.add(ring);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 16), mats.primary);
    hub.rotation.x = Math.PI / 2;
    emblem.add(hub);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.16, 0.08), mats.accent);
      tooth.position.set(Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0);
      tooth.rotation.z = a;
      emblem.add(tooth);
    }
  } else if (archetype.includes('COMPASS') || archetype.includes('STAR') || archetype.includes('SUN')) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const len = i % 2 === 0 ? 0.56 : 0.36;
      const ray = new THREE.Mesh(new THREE.ConeGeometry(0.09, len, 4), mats.accent);
      ray.position.set(Math.cos(a) * (len * 0.46), Math.sin(a) * (len * 0.46), 0);
      ray.rotation.z = a - Math.PI / 2;
      emblem.add(ray);
    }
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), mats.primary);
    emblem.add(core);
  } else if (archetype.includes('TORII') || archetype.includes('HINGE') || archetype.includes('TRUNK')) {
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.1, 0.09), mats.accent);
    topBar.position.y = 0.28;
    emblem.add(topBar);
    const midBar = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.08, 0.08), mats.primary);
    midBar.position.y = 0.1;
    emblem.add(midBar);
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.72, 0.09), mats.accent);
    pillarL.position.set(-0.24, -0.06, 0);
    emblem.add(pillarL);
    const pillarR = pillarL.clone();
    pillarR.position.x = 0.24;
    emblem.add(pillarR);
  } else if (archetype.includes('CROWN') || archetype.includes('GLOBE') || archetype.includes('WREATH')) {
    const wreath = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.065, 12, 32, Math.PI * 1.55), mats.accent);
    wreath.rotation.z = Math.PI * 0.72;
    emblem.add(wreath);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), mats.primary);
    gem.position.y = 0.04;
    emblem.add(gem);
  } else {
    // High-relief faceted diamond emblem + crossed bars
    const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 0), mats.accent);
    diamond.scale.set(1, 1.25, 0.42);
    emblem.add(diamond);
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.08, 0.06), mats.primary);
    bar1.rotation.z = Math.PI / 4;
    emblem.add(bar1);
    const bar2 = bar1.clone();
    bar2.rotation.z = -Math.PI / 4;
    emblem.add(bar2);
  }

  return emblem;
}

// ----------------------------------------------------------------------------
// TrophyMedalVault3DV6 Interactive Museum Screen
// ----------------------------------------------------------------------------
export type VaultFilterModeV6 = 'ALL' | 'TROPHY' | 'MEDAL' | 'PINNED';
export type VaultLightMoodV6 = 'MUSEUM' | 'DRAMATIC' | 'DAYLIGHT';

export interface TrophyMedalVaultOptionsV6 {
  unlockedAwardIds?: ReadonlyArray<string>;
  pinnedMedalIds?: ReadonlyArray<string>;
  initialAwardId?: string;
  resolutionTier?: ResolutionTierV6;
  onClose: () => void;
  onPinnedMedalsChange?: (pinnedIds: string[]) => void;
  onSelectHonor?: (award: HonorAwardDefinitionV6) => void;
  onPlayFoley?: (sfxId: FoleySfxIdV6) => void;
}

const VAULT_ICONS = {
  back: '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  pin: '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17v5M8 4h8l-1 6 3 3H6l3-3-1-6z"/></svg>',
  prev: '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  next: '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
};

function targetDprFromTier(tier: ResolutionTierV6): number {
  const nativeDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  if (tier === 'BATTERY_1X') return 1;
  if (tier === 'HIGH_2X') return Math.min(nativeDpr, 2);
  return Math.min(nativeDpr, 3);
}

export class TrophyMedalVault3DV6 {
  private readonly opts: TrophyMedalVaultOptionsV6;
  private unlockedSet: Set<string>;
  private pinnedMedalIds: string[];
  private resolutionTier: ResolutionTierV6;

  private filterMode: VaultFilterModeV6 = 'ALL';
  private pageIndex = 0;
  private selectedAwardId: string;
  private lightMood: VaultLightMoodV6 = 'MUSEUM';
  private autoRotate = true;

  private rootEl: HTMLElement | null = null;
  private stageEl: HTMLElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;

  // Dynamic UI refs
  private countBadgeEl: HTMLElement | null = null;
  private azReadoutEl: HTMLElement | null = null;
  private tierChipEl: HTMLElement | null = null;
  private plaqueNameEl: HTMLElement | null = null;
  private plaqueEngravingEl: HTMLElement | null = null;
  private plaqueReqEl: HTMLElement | null = null;
  private plaqueStatusEl: HTMLElement | null = null;
  private pinBtnEl: HTMLButtonElement | null = null;
  private spinBtnEl: HTMLButtonElement | null = null;
  private lightBtnEl: HTMLButtonElement | null = null;
  private gridEl: HTMLElement | null = null;
  private pageLabelEl: HTMLElement | null = null;
  private filterBtns: Map<VaultFilterModeV6, HTMLButtonElement> = new Map();

  // Three.js Turntable Runtime
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private honorContainer: THREE.Group | null = null;
  private currentHonorMesh: THREE.Group | null = null;
  private keyLight: THREE.SpotLight | null = null;
  private rimLight: THREE.PointLight | null = null;
  private glintLight: THREE.PointLight | null = null;
  private fillLight: THREE.HemisphereLight | null = null;

  private rafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private lastFrameTs = 0;

  // Turntable Orbit State
  private yaw = 0.35;
  private targetYaw = 0.35;
  private pitch = 0.14;
  private targetPitch = 0.14;
  private camDistance = 4.35;
  private dragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private glintPhase = 0;

  constructor(options: TrophyMedalVaultOptionsV6) {
    this.opts = options;
    this.unlockedSet = new Set(
      options.unlockedAwardIds ?? [
        'trophy_sovereign_mind_crown',
        'trophy_geneva_tourbillon',
        'medal_opening_night',
        'medal_vaudeville_headliner',
        'medal_zero_kilometer_pin',
      ],
    );
    this.pinnedMedalIds = (options.pinnedMedalIds ?? ['medal_opening_night']).slice(0, 3);
    this.resolutionTier = options.resolutionTier ?? 'ULTRA_3X';
    this.selectedAwardId =
      options.initialAwardId ?? HONOR_AWARDS_CATALOG_V6[0].awardId;
  }

  public mount(parent: HTMLElement): void {
    this.dispose();
    parent.classList.add('v6-ultrahd-root');

    const screen = document.createElement('section');
    screen.className = 'v6-screen v6-vault-screen';
    screen.setAttribute('aria-label', 'Hall of Trophies and Cast Medals');
    this.rootEl = screen;

    // 1) Slim Top Navigation Bar
    const topbar = document.createElement('header');
    topbar.className = 'v6-topbar';

    const leftGroup = document.createElement('div');
    leftGroup.className = 'v6-topbar-group';

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'v6-hardware-pill';
    backBtn.innerHTML = `${VAULT_ICONS.back}<span>STAGE HUB</span>`;
    backBtn.addEventListener('click', () => {
      this.playFoley('ui_brass_tap');
      this.opts.onClose();
    });

    const headingPill = document.createElement('div');
    headingPill.className = 'v6-spec-chip';
    headingPill.innerHTML = '<strong>HALL OF HONORS</strong>';

    leftGroup.append(backBtn, headingPill);

    const rightGroup = document.createElement('div');
    rightGroup.className = 'v6-topbar-group';
    this.countBadgeEl = document.createElement('div');
    this.countBadgeEl.className = 'v6-spec-chip v6-tabular';
    rightGroup.appendChild(this.countBadgeEl);

    topbar.append(leftGroup, rightGroup);

    // 2) Main Zero-Scroll Body: Turntable + Engraved Brass Plaque + Paged Specimen Drawer
    const body = document.createElement('div');
    body.className = 'v6-vault-body';

    // 2A) Interactive 3D Three.js Turntable Stage
    this.stageEl = document.createElement('div');
    this.stageEl.className = 'v6-turntable-stage';

    this.canvasEl = document.createElement('canvas');
    this.canvasEl.className = 'v6-turntable-canvas';
    this.stageEl.appendChild(this.canvasEl);

    const hudTL = document.createElement('div');
    hudTL.className = 'v6-turntable-hud-tl';
    this.tierChipEl = document.createElement('span');
    this.tierChipEl.className = 'v6-spec-chip';
    hudTL.appendChild(this.tierChipEl);

    const hudTR = document.createElement('div');
    hudTR.className = 'v6-turntable-hud-tr';

    this.spinBtnEl = document.createElement('button');
    this.spinBtnEl.type = 'button';
    this.spinBtnEl.className = 'v6-mini-ctrl-btn is-active';
    this.spinBtnEl.textContent = 'SPIN: ON';
    this.spinBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.autoRotate = !this.autoRotate;
      this.playFoley('rotary_knob_click');
      this.syncTurntableControls();
    });

    this.lightBtnEl = document.createElement('button');
    this.lightBtnEl.type = 'button';
    this.lightBtnEl.className = 'v6-mini-ctrl-btn';
    this.lightBtnEl.textContent = 'LIGHT: MUSEUM';
    this.lightBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const moods: VaultLightMoodV6[] = ['MUSEUM', 'DRAMATIC', 'DAYLIGHT'];
      const next = moods[(moods.indexOf(this.lightMood) + 1) % moods.length];
      this.lightMood = next;
      this.playFoley('rotary_knob_click');
      this.applyLightingMood();
      this.syncTurntableControls();
    });

    hudTR.append(this.spinBtnEl, this.lightBtnEl);

    const hudBL = document.createElement('div');
    hudBL.className = 'v6-turntable-hud-bl';
    this.azReadoutEl = document.createElement('span');
    this.azReadoutEl.className = 'v6-spec-chip v6-tabular';
    this.azReadoutEl.textContent = 'DRAG 360° · AZ 020°';
    const dragHint = document.createElement('span');
    dragHint.className = 'v6-spec-chip';
    dragHint.textContent = 'INSPECT TURNTABLE';
    hudBL.append(this.azReadoutEl, dragHint);

    this.stageEl.append(hudTL, hudTR, hudBL);
    this.bindTurntableInput(this.stageEl);

    // 2B) Engraved Brass Museum Plaque
    const plaque = document.createElement('div');
    plaque.className = 'v6-museum-plaque';

    const plaqueInfo = document.createElement('div');
    plaqueInfo.className = 'v6-plaque-info';

    const titleRow = document.createElement('div');
    titleRow.className = 'v6-plaque-title-row';
    this.plaqueNameEl = document.createElement('h2');
    this.plaqueNameEl.className = 'v6-plaque-name';
    this.plaqueStatusEl = document.createElement('span');
    this.plaqueStatusEl.className = 'v6-plate-tag';
    titleRow.append(this.plaqueNameEl, this.plaqueStatusEl);

    this.plaqueEngravingEl = document.createElement('p');
    this.plaqueEngravingEl.className = 'v6-plaque-engraving';

    this.plaqueReqEl = document.createElement('div');
    this.plaqueReqEl.className = 'v6-plaque-req';

    plaqueInfo.append(titleRow, this.plaqueEngravingEl, this.plaqueReqEl);

    const plaqueActions = document.createElement('div');
    plaqueActions.className = 'v6-plaque-actions';

    this.pinBtnEl = document.createElement('button');
    this.pinBtnEl.type = 'button';
    this.pinBtnEl.className = 'v6-hardware-pill';
    this.pinBtnEl.addEventListener('click', () => {
      this.togglePinSelectedMedal();
    });
    plaqueActions.appendChild(this.pinBtnEl);

    plaque.append(plaqueInfo, plaqueActions);

    // 2C) Zero-Scroll Paged Specimen Tray (ALL 36 · TROPHIES 12 · MEDALS 24 · PINNED)
    const tray = document.createElement('div');
    tray.className = 'v6-vault-tray';

    const trayBar = document.createElement('div');
    trayBar.className = 'v6-vault-tray-bar';

    const filterTabs = document.createElement('div');
    filterTabs.className = 'v6-filter-tabs';

    const filters: Array<{ id: VaultFilterModeV6; label: string }> = [
      { id: 'ALL', label: 'ALL 36' },
      { id: 'TROPHY', label: 'TROPHIES' },
      { id: 'MEDAL', label: 'MEDALS' },
      { id: 'PINNED', label: 'PINNED' },
    ];
    this.filterBtns.clear();
    for (const f of filters) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'v6-filter-tab';
      btn.textContent = f.label;
      btn.addEventListener('click', () => {
        this.filterMode = f.id;
        this.pageIndex = 0;
        this.playFoley('brass_gear_detent');
        this.renderSpecimenPage();
      });
      this.filterBtns.set(f.id, btn);
      filterTabs.appendChild(btn);
    }

    const pager = document.createElement('div');
    pager.className = 'v6-pager-group';

    const prevPageBtn = document.createElement('button');
    prevPageBtn.type = 'button';
    prevPageBtn.className = 'v6-mini-ctrl-btn';
    prevPageBtn.setAttribute('aria-label', 'Previous Honor Page');
    prevPageBtn.innerHTML = VAULT_ICONS.prev;
    prevPageBtn.addEventListener('click', () => {
      this.stepPage(-1);
    });

    this.pageLabelEl = document.createElement('span');
    this.pageLabelEl.className = 'v6-spec-chip v6-tabular';

    const nextPageBtn = document.createElement('button');
    nextPageBtn.type = 'button';
    nextPageBtn.className = 'v6-mini-ctrl-btn';
    nextPageBtn.setAttribute('aria-label', 'Next Honor Page');
    nextPageBtn.innerHTML = VAULT_ICONS.next;
    nextPageBtn.addEventListener('click', () => {
      this.stepPage(1);
    });

    pager.append(prevPageBtn, this.pageLabelEl, nextPageBtn);
    trayBar.append(filterTabs, pager);

    this.gridEl = document.createElement('div');
    this.gridEl.className = 'v6-specimen-grid';

    tray.append(trayBar, this.gridEl);

    body.append(this.stageEl, plaque, tray);
    screen.append(topbar, body);
    parent.appendChild(screen);

    this.initThreeTurntable();
    this.selectHonor(this.selectedAwardId, false);
    this.renderSpecimenPage();
    this.syncCounts();
    this.syncTurntableControls();
  }

  public setUnlockedAwards(unlockedIds: ReadonlyArray<string>): void {
    this.unlockedSet = new Set(unlockedIds);
    this.rebuildSelected3DModel();
    this.syncPlaque();
    this.renderSpecimenPage();
    this.syncCounts();
  }

  public setResolutionTier(tier: ResolutionTierV6): void {
    this.resolutionTier = tier;
    if (this.renderer) {
      this.renderer.setPixelRatio(targetDprFromTier(tier));
      this.handleResize();
    }
  }

  public getPinnedMedalIds(): string[] {
    return [...this.pinnedMedalIds];
  }

  public selectHonor(awardId: string, playSound = true): void {
    const award =
      HONOR_AWARDS_CATALOG_V6.find((a) => a.awardId === awardId) ??
      HONOR_AWARDS_CATALOG_V6[0];
    this.selectedAwardId = award.awardId;
    this.targetYaw = 0.28;
    this.targetPitch = 0.14;
    this.rebuildSelected3DModel();
    this.syncPlaque();
    this.renderSpecimenPage();
    if (playSound) {
      this.playFoley(award.kind === 'TROPHY' ? 'trophy_pedestal_chime' : 'medal_enamel_clink');
    }
    this.opts.onSelectHonor?.(award);
  }

  public dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    this.disposeCurrentHonorMesh();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    this.honorContainer = null;
    this.rootEl?.remove();
    this.rootEl = null;
  }

  // --------------------------------------------------------------------------
  // Three.js PBR Museum Turntable
  // --------------------------------------------------------------------------

  private initThreeTurntable(): void {
    if (!this.canvasEl || !this.stageEl) return;
    try {
      const renderer = new THREE.WebGLRenderer({
        canvas: this.canvasEl,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(targetDprFromTier(this.resolutionTier));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.24;
      this.renderer = renderer;

      const scene = new THREE.Scene();
      this.scene = scene;

      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
      camera.position.set(0, 0.42, this.camDistance);
      camera.lookAt(0, 0, 0);
      this.camera = camera;

      // Brushed brass museum turntable plinth stage
      const turntableBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.42, 1.56, 0.16, 48),
        new THREE.MeshPhysicalMaterial({
          color: 0x16141a,
          metalness: 0.35,
          roughness: 0.25,
          clearcoat: 0.85,
        }),
      );
      turntableBase.position.y = -1.36;
      scene.add(turntableBase);

      const brassTrimRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.45, 0.032, 14, 56),
        new THREE.MeshPhysicalMaterial({
          color: 0xe6bc5c,
          metalness: 0.94,
          roughness: 0.18,
          clearcoat: 0.45,
        }),
      );
      brassTrimRing.rotation.x = Math.PI / 2;
      brassTrimRing.position.y = -1.28;
      scene.add(brassTrimRing);

      // Museum Spotlights & Dynamic Glint Sweep
      this.fillLight = new THREE.HemisphereLight(0xfff1d2, 0x1a1e30, 0.95);
      scene.add(this.fillLight);

      this.keyLight = new THREE.SpotLight(0xffe7b3, 18, 20, Math.PI / 4, 0.45, 1.2);
      this.keyLight.position.set(2.8, 4.4, 3.6);
      scene.add(this.keyLight);

      this.rimLight = new THREE.PointLight(0x63b8ff, 9, 14, 1.5);
      this.rimLight.position.set(-3.2, 2.0, -2.6);
      scene.add(this.rimLight);

      this.glintLight = new THREE.PointLight(0xfff6d4, 7.5, 12, 1.4);
      this.glintLight.position.set(2.2, 1.8, 2.5);
      scene.add(this.glintLight);

      this.honorContainer = new THREE.Group();
      scene.add(this.honorContainer);

      this.applyLightingMood();
      this.handleResize();

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        this.resizeObserver.observe(this.stageEl);
      }

      this.lastFrameTs = performance.now();
      this.startLoop();
    } catch {
      // Headless environment without WebGL2 context fails cleanly without throwing
      this.renderer = null;
    }
  }

  private applyLightingMood(): void {
    if (!this.keyLight || !this.rimLight || !this.fillLight || !this.glintLight) return;
    if (this.lightMood === 'DRAMATIC') {
      this.fillLight.intensity = 0.35;
      this.keyLight.color.setHex(0xffd27d);
      this.keyLight.intensity = 26;
      this.rimLight.color.setHex(0xff5268);
      this.rimLight.intensity = 13;
      this.glintLight.intensity = 10;
    } else if (this.lightMood === 'DAYLIGHT') {
      this.fillLight.intensity = 1.45;
      this.keyLight.color.setHex(0xffffff);
      this.keyLight.intensity = 16;
      this.rimLight.color.setHex(0x9bd7ff);
      this.rimLight.intensity = 8;
      this.glintLight.intensity = 7;
    } else {
      this.fillLight.intensity = 0.95;
      this.keyLight.color.setHex(0xffe7b3);
      this.keyLight.intensity = 19;
      this.rimLight.color.setHex(0x63b8ff);
      this.rimLight.intensity = 9.5;
      this.glintLight.intensity = 8;
    }
  }

  private rebuildSelected3DModel(): void {
    if (!this.honorContainer) return;
    this.disposeCurrentHonorMesh();

    const award = this.getSelectedAward();
    const unlocked = this.unlockedSet.has(award.awardId);
    const meshGroup = buildHonor3DGroupV6(award, unlocked);
    meshGroup.position.y = award.kind === 'MEDAL' ? -0.14 : 0.04;
    this.honorContainer.add(meshGroup);
    this.currentHonorMesh = meshGroup;
  }

  private disposeCurrentHonorMesh(): void {
    if (!this.currentHonorMesh || !this.honorContainer) return;
    this.honorContainer.remove(this.currentHonorMesh);
    this.currentHonorMesh.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    this.currentHonorMesh = null;
  }

  private handleResize(): void {
    if (!this.stageEl || !this.renderer || !this.camera) return;
    const w = Math.max(120, Math.floor(this.stageEl.clientWidth));
    const h = Math.max(120, Math.floor(this.stageEl.clientHeight));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    const nextPageSize = this.getPageSize();
    if (this.gridEl && this.gridEl.childElementCount > 0 && this.gridEl.childElementCount !== nextPageSize) {
      const items = this.getFilteredAwards();
      const pageCount = Math.max(1, Math.ceil(items.length / nextPageSize));
      if (this.pageIndex >= pageCount) {
        this.pageIndex = pageCount - 1;
      }
      this.renderSpecimenPage();
    }
  }

  private startLoop(): void {
    const tick = (now: number) => {
      this.rafId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameTs) / 1000));
      this.lastFrameTs = now;

      if (this.autoRotate && !this.dragging) {
        this.targetYaw += dt * 0.52;
      }

      const damp = 1 - Math.exp(-10 * dt);
      this.yaw += (this.targetYaw - this.yaw) * damp;
      this.pitch += (this.targetPitch - this.pitch) * damp;

      if (this.honorContainer) {
        this.honorContainer.rotation.y = this.yaw;
        this.honorContainer.rotation.x = this.pitch;
      }

      // Sweep spotlight glint across beveled metal as honor spins
      this.glintPhase += dt * 0.9;
      if (this.glintLight) {
        this.glintLight.position.x = Math.cos(this.glintPhase) * 2.7;
        this.glintLight.position.z = 2.4 + Math.sin(this.glintPhase * 0.7) * 0.9;
        this.glintLight.position.y = 1.6 + Math.sin(this.glintPhase * 1.1) * 0.65;
      }

      if (this.camera) {
        this.camera.position.z += (this.camDistance - this.camera.position.z) * damp;
      }

      if (this.azReadoutEl) {
        const deg = (((Math.round((this.yaw * 180) / Math.PI) % 360) + 360) % 360);
        const pad = deg < 10 ? `00${deg}` : deg < 100 ? `0${deg}` : String(deg);
        this.azReadoutEl.textContent = `DRAG 360° · AZ ${pad}°`;
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private bindTurntableInput(el: HTMLElement): void {
    el.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement)?.closest('button')) return;
      this.dragging = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.targetYaw += dx * 0.011;
      this.targetPitch = Math.max(-0.55, Math.min(0.62, this.targetPitch + dy * 0.008));
    });

    const endDrag = (e: PointerEvent) => {
      if (!this.dragging) return;
      this.dragging = false;
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    };
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.camDistance = Math.max(2.9, Math.min(5.2, this.camDistance + e.deltaY * 0.002));
      },
      { passive: false },
    );

    el.addEventListener('dblclick', () => {
      this.targetYaw = 0.28;
      this.targetPitch = 0.14;
      this.camDistance = 4.35;
      this.playFoley('rotary_knob_click');
    });
  }

  // --------------------------------------------------------------------------
  // Zero-Scroll Paged Specimen Drawer & Live Podium Pinning
  // --------------------------------------------------------------------------

  private getFilteredAwards(): HonorAwardDefinitionV6[] {
    if (this.filterMode === 'TROPHY') {
      return HONOR_AWARDS_CATALOG_V6.filter((a) => a.kind === 'TROPHY');
    }
    if (this.filterMode === 'MEDAL') {
      return HONOR_AWARDS_CATALOG_V6.filter((a) => a.kind === 'MEDAL');
    }
    if (this.filterMode === 'PINNED') {
      return HONOR_AWARDS_CATALOG_V6.filter((a) => this.pinnedMedalIds.includes(a.awardId));
    }
    return [...HONOR_AWARDS_CATALOG_V6];
  }

  private getPageSize(): number {
    if (typeof window === 'undefined') return 6;
    const compact = window.innerHeight <= 590 || window.innerWidth >= 900 || window.innerWidth > window.innerHeight;
    return compact ? 6 : 8;
  }

  private stepPage(delta: -1 | 1): void {
    const items = this.getFilteredAwards();
    const pageSize = this.getPageSize();
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    this.pageIndex = (this.pageIndex + delta + pageCount) % pageCount;
    this.playFoley('brass_gear_detent');
    this.renderSpecimenPage();
  }

  private renderSpecimenPage(): void {
    if (!this.gridEl) return;

    this.filterBtns.forEach((btn, id) => {
      btn.classList.toggle('is-active', id === this.filterMode);
    });

    const items = this.getFilteredAwards();
    const pageSize = this.getPageSize();
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    this.pageIndex = Math.min(this.pageIndex, pageCount - 1);

    if (this.pageLabelEl) {
      this.pageLabelEl.textContent = `${this.pageIndex + 1} / ${pageCount}`;
    }

    const slice = items.slice(this.pageIndex * pageSize, (this.pageIndex + 1) * pageSize);
    this.gridEl.innerHTML = '';

    if (slice.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'v6-spec-chip';
      empty.style.gridColumn = '1 / -1';
      empty.style.justifyContent = 'center';
      empty.style.padding = '12px';
      empty.textContent = 'NO MEDALS PINNED TO LIVE PODIUM YET';
      this.gridEl.appendChild(empty);
      return;
    }

    for (const award of slice) {
      const unlocked = this.unlockedSet.has(award.awardId);
      const pinned = this.pinnedMedalIds.includes(award.awardId);
      const selected = award.awardId === this.selectedAwardId;

      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'v6-specimen-slot';
      if (selected) slot.classList.add('is-selected');
      if (!unlocked) slot.classList.add('is-locked');

      const top = document.createElement('span');
      top.className = 'v6-specimen-top';

      const kindLbl = document.createElement('span');
      kindLbl.textContent = award.kind === 'TROPHY' ? 'TROPHY' : 'MEDAL';

      const dot = document.createElement('span');
      dot.className = `v6-specimen-dot v6-tier-${award.materialTier}`;
      top.append(kindLbl, dot);

      const label = document.createElement('span');
      label.className = 'v6-specimen-label';
      label.textContent = award.name;

      slot.append(top, label);

      if (pinned) {
        const pinBadge = document.createElement('span');
        pinBadge.className = 'v6-pin-badge';
        pinBadge.title = 'Pinned on Live Podium';
        slot.appendChild(pinBadge);
      }

      slot.addEventListener('click', () => {
        this.selectHonor(award.awardId, true);
      });

      this.gridEl.appendChild(slot);
    }
  }

  private getSelectedAward(): HonorAwardDefinitionV6 {
    return (
      HONOR_AWARDS_CATALOG_V6.find((a) => a.awardId === this.selectedAwardId) ??
      HONOR_AWARDS_CATALOG_V6[0]
    );
  }

  private syncPlaque(): void {
    const award = this.getSelectedAward();
    const unlocked = this.unlockedSet.has(award.awardId);
    const pinned = this.pinnedMedalIds.includes(award.awardId);

    if (this.tierChipEl) {
      this.tierChipEl.innerHTML = `<strong>${MATERIAL_TIER_LABELS_V6[award.materialTier]}</strong>`;
    }
    if (this.plaqueNameEl) {
      this.plaqueNameEl.textContent = award.name;
    }
    if (this.plaqueStatusEl) {
      this.plaqueStatusEl.textContent = unlocked ? 'EARNED' : 'LOCKED PROOF';
    }
    if (this.plaqueEngravingEl) {
      this.plaqueEngravingEl.textContent = `"${award.engraving}"`;
    }
    if (this.plaqueReqEl) {
      this.plaqueReqEl.textContent = `CRITERIA: ${award.unlockRequirement.toUpperCase()}`;
    }

    if (this.pinBtnEl) {
      if (award.kind !== 'MEDAL') {
        this.pinBtnEl.disabled = true;
        this.pinBtnEl.classList.remove('is-active');
        this.pinBtnEl.innerHTML = '<span>TROPHY DISPLAY</span>';
      } else if (!unlocked) {
        this.pinBtnEl.disabled = true;
        this.pinBtnEl.classList.remove('is-active');
        this.pinBtnEl.innerHTML = '<span>EARN TO PIN</span>';
      } else {
        this.pinBtnEl.disabled = false;
        this.pinBtnEl.classList.toggle('is-active', pinned);
        this.pinBtnEl.innerHTML = `${VAULT_ICONS.pin}<span>${
          pinned ? 'PINNED ON PODIUM' : `PIN PODIUM (${this.pinnedMedalIds.length}/3)`
        }</span>`;
      }
    }
  }

  private togglePinSelectedMedal(): void {
    const award = this.getSelectedAward();
    if (award.kind !== 'MEDAL' || !this.unlockedSet.has(award.awardId)) return;

    const existingIdx = this.pinnedMedalIds.indexOf(award.awardId);
    if (existingIdx >= 0) {
      this.pinnedMedalIds.splice(existingIdx, 1);
    } else {
      if (this.pinnedMedalIds.length >= 3) {
        this.pinnedMedalIds.shift(); // Replace oldest pinned slot cleanly
      }
      this.pinnedMedalIds.push(award.awardId);
    }
    this.playFoley('medal_enamel_clink');
    this.syncPlaque();
    this.syncCounts();
    this.renderSpecimenPage();
    this.opts.onPinnedMedalsChange?.([...this.pinnedMedalIds]);
  }

  private syncCounts(): void {
    if (this.countBadgeEl) {
      this.countBadgeEl.innerHTML = `<strong>${this.unlockedSet.size}/36</strong> EARNED · <strong>${this.pinnedMedalIds.length}/3</strong> PINNED`;
    }
  }

  private syncTurntableControls(): void {
    if (this.spinBtnEl) {
      this.spinBtnEl.textContent = this.autoRotate ? 'SPIN: ON' : 'SPIN: OFF';
      this.spinBtnEl.classList.toggle('is-active', this.autoRotate);
    }
    if (this.lightBtnEl) {
      this.lightBtnEl.textContent = `LIGHT: ${this.lightMood}`;
    }
  }

  private playFoley(sfxId: FoleySfxIdV6): void {
    this.opts.onPlayFoley?.(sfxId);
  }
}
