// ============================================================================
// WORLD'S SMARTEST v6.0 — Boards 051–100 Catalog & 3D Contraption Blueprints
// Families VI–X:
//   VI.   MONUMENT_INDUSTRIAL     (Boards 51–60, Stages 10 / 05 / 06 / 08)
//   VII.  CARTOGRAPHY_EXPEDITION  (Boards 61–70, Stage 04)
//   VIII. CARNIVAL_ARCADE         (Boards 71–80, Stage 07)
//   IX.   ASTRAL_QUANTUM          (Boards 81–90, Stages 09 / 08)
//   X.    RULE_BENDER_TWISTS      (Boards 91–100, All Stages / Bosses)
// Pure TypeScript + deterministic 3D node topology generator (zero soft-locks).
// ============================================================================

import type {
  BoardDefinitionV6,
  BoardFamilyIdV6,
  BoardNodeV6,
  BoardRuntimeStateV6,
  BoardTwistMutationIdV6,
  StageWorldIdV6,
  SymphonyTrackIdV6,
} from '../contracts_v6';

// ----------------------------------------------------------------------------
// 1. Canonical Domain Labels (Aligned with 12-Domain Corpus Taxonomy 0..11)
// ----------------------------------------------------------------------------

export const DOMAIN_LABELS_V6: Readonly<Record<number, string>> = {
  0: 'WORLD HISTORY',
  1: 'SCIENCE & SPACE',
  2: 'WORLD ATLAS',
  3: 'ARTS & DESIGN',
  4: 'FILM & MUSIC',
  5: 'SPORTS & GAMES',
  6: 'INVENTIONS',
  7: 'LIVING NATURE',
  8: 'GLOBAL AFFAIRS',
  9: 'CULINARY & CRAFT',
  10: 'MYTH & BOOKS',
  11: 'LOGIC & MATH',
};

// ----------------------------------------------------------------------------
// 2. Contraption Structural Blueprint Metadata (Extends BoardDefinitionV6)
// ----------------------------------------------------------------------------

export type ContraptionLayoutKindB =
  | 'PYRAMID_4321'
  | 'CONVEYOR_DUAL_BELT'
  | 'ELEVATOR_3_SHAFT'
  | 'PIPE_ORGAN_RANKS'
  | 'SWITCHYARD_TRACKS'
  | 'SUSPENSION_SPAN'
  | 'SPILLWAY_DAM'
  | 'SCAFFOLD_TOWER'
  | 'FOUNDRY_CRUCIBLE_RING'
  | 'CHARIOT_OVAL'
  | 'ARMILLARY_3_RING'
  | 'TRADE_WIND_ROUTE'
  | 'ARCHIPELAGO_CHAIN'
  | 'RAIL_SPIKE_LINES'
  | 'ICEBREAKER_CHANNELS'
  | 'SUNKEN_GRID'
  | 'CARAVAN_OASIS'
  | 'ROPE_BRIDGE_CHASM'
  | 'SEXTANT_ARC'
  | 'ZIGGURAT_TERRACE'
  | 'FERRIS_GONDOLA_WHEEL'
  | 'TIN_DUCK_GALLERY'
  | 'CALLIOPE_VALVES'
  | 'HIGH_STRIKER_TOWER'
  | 'TRICK_MIRROR_HALL'
  | 'CLAW_PRIZE_PIT'
  | 'TILT_WHIRL_CUPS'
  | 'AUTOMATON_BOOTH'
  | 'RING_TOSS_BOTTLES'
  | 'COASTER_LOOP'
  | 'CONSTELLATION_LOOM'
  | 'BINARY_TWIN_ORBIT'
  | 'TELESCOPE_LENS_ARRAY'
  | 'TIDAL_GRAVITY_WELL'
  | 'BATHYSPHERE_TRENCH'
  | 'PRISM_WAVELENGTH_FAN'
  | 'METEOR_SHIELD_ARC'
  | 'QUANTUM_ENTANGLED_PAIRS'
  | 'SUNDIAL_SHADOW_DIAL'
  | 'SUPERNOVA_CORE'
  | 'BLACKOUT_HEIST_GRID'
  | 'MOLE_VAULT_RING'
  | 'SPLIT_STEAL_ARENA'
  | 'FLOOD_ISLAND_RINGS'
  | 'ESCHER_INVERTED_PYRAMID'
  | 'CHAIN_BOMB_WEB'
  | 'MIRROR_TWIN_MATRIX'
  | 'AUCTION_CLOCHE_HALL'
  | 'MAGNETIC_REPULSOR_DISK'
  | 'SOVEREIGN_MIND_REACTOR';

export interface BoardContraptionBlueprintB {
  readonly boardId: string;
  readonly layoutKind: ContraptionLayoutKindB;
  readonly customRuleSummary: string;
  readonly preferredDomains: readonly number[];
  readonly defaultMaxTurns: number;
  readonly kineticSpeed: number;
  readonly supportsRingRotation: boolean;
  readonly supportsConveyorShift: boolean;
  readonly supportsEntangledPairs: boolean;
  readonly supportsFloodElevation: boolean;
  readonly supportsSpotlightCone: boolean;
  readonly halftimeTwistPool: readonly BoardTwistMutationIdV6[];
}

export interface BoardRuntimeInitOptionsB {
  readonly seed?: number;
  readonly rivalName?: string;
  readonly overrideTwist?: BoardTwistMutationIdV6;
  readonly maxTurns?: number;
  readonly stageDifficultyOffset?: number;
}

// ----------------------------------------------------------------------------
// 3. Seeded PRNG for Deterministic Board Topology Hydration
// ----------------------------------------------------------------------------

function createMulberry32(seed: number): () => number {
  let state = (seed >>> 0) || 0x9e3779b9;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ----------------------------------------------------------------------------
// 4. Master Catalog: 50 Distinct Playable Contraptions (Boards 051–100)
// ----------------------------------------------------------------------------

interface RawBoardSpecB {
  boardNumber: number;
  slug: string;
  name: string;
  family: BoardFamilyIdV6;
  signatureStage: StageWorldIdV6;
  tagline: string;
  symphonyTrack: SymphonyTrackIdV6;
  defaultTwist: BoardTwistMutationIdV6;
  targetWinCondition: string;
  nodeCount: number;
  mechanicArchetype: BoardDefinitionV6['mechanicArchetype'];
  accentPalette: BoardDefinitionV6['accentPalette'];
  blueprint: Omit<BoardContraptionBlueprintB, 'boardId'>;
}

const RAW_BOARDS_051_TO_100: readonly RawBoardSpecB[] = [
  // ==========================================================================
  // FAMILY VI: MONUMENT_INDUSTRIAL (Boards 51–60, Stages 10 / 05 / 06 / 08)
  // ==========================================================================
  {
    boardNumber: 51,
    slug: 'stepped_gold_pyramid',
    name: 'Stepped Gold Pyramid',
    family: 'MONUMENT_INDUSTRIAL',
    signatureStage: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    tagline: 'Climb 4-3-2-1 gilded tiers to unlock the Apex Crown Vault.',
    symphonyTrack: 'colosseum_finale',
    defaultTwist: 'GOLDEN_BOUNTY_HUNT',
    targetWinCondition: 'Claim either support below each tier and seize the Apex Vault.',
    nodeCount: 10,
    mechanicArchetype: 'STEPPED_PYRAMID',
    accentPalette: { primaryHex: 0xd9a441, secondaryHex: 0x2b241d, gemHex: 0xffd15c },
    blueprint: {
      layoutKind: 'PYRAMID_4321',
      customRuleSummary: '4-3-2-1 stepped pyramid: unlocking a parent tier requires claiming at least one supporting stone beneath it.',
      preferredDomains: [0, 2, 3, 10, 1, 8],
      defaultMaxTurns: 10,
      kineticSpeed: 0.7,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: true,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['GRAVITY_INVERSION', 'GOLDEN_BOUNTY_HUNT', 'CHAIN_FUSE_DETONATION'],
    },
  },
  {
    boardNumber: 52,
    slug: 'factory_conveyor_belt',
    name: 'Factory Conveyor Belt',
    family: 'MONUMENT_INDUSTRIAL',
    signatureStage: 'STAGE_05_ANALOG_BUNKER_1969',
    tagline: 'Crates slide 1 belt notch every turn toward the molten smelter.',
    symphonyTrack: 'bunker_espionage',
    defaultTwist: 'OVERCLOCK_DOUBLE_SPEED',
    targetWinCondition: 'Salvage high-value crates before they plunge into the foundry smelter.',
    nodeCount: 14,
    mechanicArchetype: 'CONVEYOR_FACTORY',
    accentPalette: { primaryHex: 0xd96b27, secondaryHex: 0x434d3e, gemHex: 0xffa834 },
    blueprint: {
      layoutKind: 'CONVEYOR_DUAL_BELT',
      customRuleSummary: 'Dual motorized belts shift every unclaimed crate 1 notch toward the smelter each turn; last-notch rescues pay x1.5 Mult.',
      preferredDomains: [6, 1, 9, 0, 11, 5],
      defaultMaxTurns: 10,
      kineticSpeed: 1.45,
      supportsRingRotation: false,
      supportsConveyorShift: true,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['OVERCLOCK_DOUBLE_SPEED', 'CHAIN_FUSE_DETONATION', 'MAGNETIC_REPULSOR'],
    },
  },
  {
    boardNumber: 53,
    slug: 'skyscraper_express_elevators',
    name: 'Skyscraper Express Elevators',
    family: 'MONUMENT_INDUSTRIAL',
    signatureStage: 'STAGE_05_ANALOG_BUNKER_1969',
    tagline: 'Three brass elevator shafts ascend in offset express stops.',
    symphonyTrack: 'bunker_espionage',
    defaultTwist: 'GRAVITY_INVERSION',
    targetWinCondition: 'Ride any express shaft to the Penthouse Suite for +2.0x Mult.',
    nodeCount: 12,
    mechanicArchetype: 'ELEVATOR_SHAFTS',
    accentPalette: { primaryHex: 0xc59a45, secondaryHex: 0x263238, gemHex: 0x57e2e5 },
    blueprint: {
      layoutKind: 'ELEVATOR_3_SHAFT',
      customRuleSummary: 'Three vertical 4-floor shafts move express cabs each turn; claiming the floor where a cab docks doubles chips.',
      preferredDomains: [3, 6, 8, 4, 0, 11],
      defaultMaxTurns: 9,
      kineticSpeed: 1.15,
      supportsRingRotation: false,
      supportsConveyorShift: true,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['GRAVITY_INVERSION', 'OVERCLOCK_DOUBLE_SPEED', 'SUDDEN_TRAPDOOR_HAZARD'],
    },
  },
  {
    boardNumber: 54,
    slug: 'grand_pipe_organ_resonance',
    name: 'Grand Pipe Organ Resonance',
    family: 'MONUMENT_INDUSTRIAL',
    signatureStage: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    tagline: 'Claim matching brass organ pipes to strike a harmonic chord.',
    symphonyTrack: 'colosseum_finale',
    defaultTwist: 'HIGH_VOLTAGE_CHAIN',
    targetWinCondition: 'Connect 3 resonant pipe ranks for a Full-Tutti Chord surge.',
    nodeCount: 14,
    mechanicArchetype: 'BALANCE_SCALE',
    accentPalette: { primaryHex: 0xe0b254, secondaryHex: 0x3b1f1b, gemHex: 0xf77f00 },
    blueprint: {
      layoutKind: 'PIPE_ORGAN_RANKS',
      customRuleSummary: 'Ascending cathedral pipe ranks harmonize across symmetric pairs; owning mirrored pipes creates a +1.0x Resonance Chord.',
      preferredDomains: [4, 3, 10, 0, 1, 9],
      defaultMaxTurns: 10,
      kineticSpeed: 0.9,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: true,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['HIGH_VOLTAGE_CHAIN', 'MIRROR_TWIN_LINK', 'CURSED_MULTIPLIER_DECAY'],
    },
  },
  {
    boardNumber: 55,
    slug: 'locomotive_switchyard',
    name: 'Locomotive Switchyard',
    family: 'MONUMENT_INDUSTRIAL',
    signatureStage: 'STAGE_05_ANALOG_BUNKER_1969',
    tagline: 'Throw brass rail switches to route the express past burning fuses.',
    symphonyTrack: 'bunker_espionage',
    defaultTwist: 'CHAIN_FUSE_DETONATION',
    targetWinCondition: 'Complete a continuous main-line track from Depot to Terminal.',
    nodeCount: 15,
    mechanicArchetype: 'SUBWAY_NETWORK',
    accentPalette: { primaryHex: 0xb86f3c, secondaryHex: 0x2d332c, gemHex: 0xffc145 },
    blueprint: {
      layoutKind: 'SWITCHYARD_TRACKS',
      customRuleSummary: 'Three converging iron rail lines with live turntable switches; claiming a junction flips downstream track access.',
      preferredDomains: [2, 6, 0, 8, 5, 1],
      defaultMaxTurns: 10,
      kineticSpeed: 1.2,
      supportsRingRotation: true,
      supportsConveyorShift: true,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['CHAIN_FUSE_DETONATION', 'OVERCLOCK_DOUBLE_SPEED', 'RIVAL_FOG_JAMMER'],
    },
  },
  {
    boardNumber: 56,
    slug: 'suspension_bridge_cables',
    name: 'Suspension Bridge Cables',
    family: 'MONUMENT_INDUSTRIAL',
    signatureStage: 'STAGE_06_KYOTO_LACQUER_PAVILION',
    tagline: 'Cross suspended lacquer towers where missed clues snap deck cables.',
    symphonyTrack: 'kyoto_nocturne',
    defaultTwist: 'SUDDEN_TRAPDOOR_HAZARD',
    targetWinCondition: 'Span both suspension towers before rival sabotage severs the deck.',
    nodeCount: 14,
    mechanicArchetype: 'PENDULUM_BRIDGE',
    accentPalette: { primaryHex: 0xc83228, secondaryHex: 0x1a1514, gemHex: 0xf4c95d },
    blueprint: {
      layoutKind: 'SUSPENSION_SPAN',
      customRuleSummary: 'Catenary cable deck spanning twin pylons; center-span tiles carry x2 tension multiplier and Trapdoor cable-snap risk.',
      preferredDomains: [3, 2, 6, 0, 9, 10],
      defaultMaxTurns: 10,
      kineticSpeed: 0.95,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: true,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['SUDDEN_TRAPDOOR_HAZARD', 'RISING_FLOOD_STAGE', 'HIGH_VOLTAGE_CHAIN'],
    },
  },
  {
    boardNumber: 57,
    slug: 'hydro_spillway_gates',
    name: 'Hydro Spillway Gates',
    family: 'MONUMENT_INDUSTRIAL',
    signatureStage: 'STAGE_08_SUNKEN_BATHYSPHERE',
    tagline: 'Sluice gates flood lower turbines every two turns—race uphill.',
    symphonyTrack: 'bathysphere_cathedral',
    defaultTwist: 'RISING_FLOOD_STAGE',
    targetWinCondition: 'Capture dry Upper Spillway turbines before reservoir surge floods out.',
    nodeCount: 15,
    mechanicArchetype: 'CONVEYOR_FACTORY',
    accentPalette: { primaryHex: 0x3ba8a6, secondaryHex: 0x262a2e, gemHex: 0x72efdd },
    blueprint: {
      layoutKind: 'SPILLWAY_DAM',
      customRuleSummary: 'Stepped concrete & bronze dam wall; lower sluices submerge every 2 turns while upper turbine gates surge in payout.',
      preferredDomains: [1, 7, 2, 6, 8, 11],
      defaultMaxTurns: 10,
      kineticSpeed: 1.1,
      supportsRingRotation: false,
      supportsConveyorShift: true,
      supportsEntangledPairs: false,
      supportsFloodElevation: true,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['RISING_FLOOD_STAGE', 'HIGH_VOLTAGE_CHAIN', 'OVERCLOCK_DOUBLE_SPEED'],
    },
  },
  {
    boardNumber: 58,
    slug: 'clocktower_scaffolding',
    name: 'Clocktower Scaffolding',
    family: 'MONUMENT_INDUSTRIAL',
    signatureStage: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    tagline: 'Scale decaying timber scaffolds as multipliers tick downward each turn.',
    symphonyTrack: 'colosseum_finale',
    defaultTwist: 'CURSED_MULTIPLIER_DECAY',
    targetWinCondition: 'Reach the Belfry Chime before platform multipliers erode away.',
    nodeCount: 14,
    mechanicArchetype: 'ELEVATOR_SHAFTS',
    accentPalette: { primaryHex: 0xd49c3d, secondaryHex: 0x2d241c, gemHex: 0xffb703 },
    blueprint: {
      layoutKind: 'SCAFFOLD_TOWER',
      customRuleSummary: 'Zig-zag brass scaffolding wrapping a belfry core; unclaimed tiers lose -0.25x Mult per turn unless frozen.',
      preferredDomains: [0, 3, 6, 11, 10, 1],
      defaultMaxTurns: 9,
      kineticSpeed: 0.85,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['CURSED_MULTIPLIER_DECAY', 'GRAVITY_INVERSION', 'CHAIN_FUSE_DETONATION'],
    },
  },
  {
    boardNumber: 59,
    slug: 'foundry_crucible',
    name: 'Foundry Crucible',
    family: 'MONUMENT_INDUSTRIAL',
    signatureStage: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    tagline: 'Molten crucible electromagnet slings bonus chips onto outer ingot rims.',
    symphonyTrack: 'colosseum_finale',
    defaultTwist: 'MAGNETIC_REPULSOR',
    targetWinCondition: 'Temper 3 rim ingots and claim the White-Hot Center Pour.',
    nodeCount: 13,
    mechanicArchetype: 'STEPPED_PYRAMID',
    accentPalette: { primaryHex: 0xe85d04, secondaryHex: 0x241d1c, gemHex: 0xffba08 },
    blueprint: {
      layoutKind: 'FOUNDRY_CRUCIBLE_RING',
      customRuleSummary: 'Central molten crucible radiates magnetic pulses every turn, pushing unclaimed chip bonuses outward to perimeter molds.',
      preferredDomains: [1, 6, 9, 0, 3, 5],
      defaultMaxTurns: 10,
      kineticSpeed: 1.05,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['MAGNETIC_REPULSOR', 'GOLDEN_BOUNTY_HUNT', 'CHAIN_FUSE_DETONATION'],
    },
  },
  {
    boardNumber: 60,
    slug: 'sovereign_colosseum_chariot_track',
    name: 'Sovereign Colosseum Chariot Track',
    family: 'MONUMENT_INDUSTRIAL',
    signatureStage: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    tagline: 'Lap the oval marble circus and overtake the golden pacemaker bounty.',
    symphonyTrack: 'colosseum_finale',
    defaultTwist: 'GOLDEN_BOUNTY_HUNT',
    targetWinCondition: 'Complete a 5-node chariot streak around the marble oval.',
    nodeCount: 16,
    mechanicArchetype: 'CONCENTRIC_RINGS',
    accentPalette: { primaryHex: 0xe6b84c, secondaryHex: 0x161418, gemHex: 0xff4d6d },
    blueprint: {
      layoutKind: 'CHARIOT_OVAL',
      customRuleSummary: 'Double-lane Roman marble oval; a golden pacemaker token orbits 2 stalls per turn—intercepting it awards +500 Chips.',
      preferredDomains: [0, 5, 10, 8, 3, 2],
      defaultMaxTurns: 10,
      kineticSpeed: 1.35,
      supportsRingRotation: true,
      supportsConveyorShift: true,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['GOLDEN_BOUNTY_HUNT', 'OVERCLOCK_DOUBLE_SPEED', 'SPLIT_OR_STEAL_VAULT'],
    },
  },

  // ==========================================================================
  // FAMILY VII: CARTOGRAPHY_EXPEDITION (Boards 61–70, Stage 04)
  // ==========================================================================
  {
    boardNumber: 61,
    slug: 'armillary_meridian_rings',
    name: 'Armillary Meridian Rings',
    family: 'CARTOGRAPHY_EXPEDITION',
    signatureStage: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    tagline: 'Align three tilted bronze meridian rings to fire a zenith beam.',
    symphonyTrack: 'explorer_odyssey',
    defaultTwist: 'RICOCHET_LASER_BONUS',
    targetWinCondition: 'Align 3 meridian rings so the sapphire beam pierces the pole.',
    nodeCount: 15,
    mechanicArchetype: 'CONCENTRIC_RINGS',
    accentPalette: { primaryHex: 0x3b8c7e, secondaryHex: 0x4e3620, gemHex: 0x4cc9f0 },
    blueprint: {
      layoutKind: 'ARMILLARY_3_RING',
      customRuleSummary: 'Three gimbaled verdigris-copper rings orbit at tilted inclinations; aligned solstice nodes trigger a x2.5 Beam Bonus.',
      preferredDomains: [2, 1, 0, 10, 6, 11],
      defaultMaxTurns: 10,
      kineticSpeed: 0.9,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['RICOCHET_LASER_BONUS', 'BLACKOUT_SPOTLIGHT', 'GOLDEN_BOUNTY_HUNT'],
    },
  },
  {
    boardNumber: 62,
    slug: 'trade_wind_galleon_route',
    name: 'Trade-Wind Galleon Route',
    family: 'CARTOGRAPHY_EXPEDITION',
    signatureStage: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    tagline: 'Ride shifting brass wind currents between spice ports before rivals dock.',
    symphonyTrack: 'explorer_odyssey',
    defaultTwist: 'OVERCLOCK_DOUBLE_SPEED',
    targetWinCondition: 'Chart a 4-port maritime circuit with tailwind multiplier bonus.',
    nodeCount: 14,
    mechanicArchetype: 'SUBWAY_NETWORK',
    accentPalette: { primaryHex: 0xc99649, secondaryHex: 0x1b3a4b, gemHex: 0x48cae4 },
    blueprint: {
      layoutKind: 'TRADE_WIND_ROUTE',
      customRuleSummary: 'Directional trade-wind lanes shift compass bearing each turn; sailing with the wind waives chain locks and grants +150 Chips.',
      preferredDomains: [2, 0, 9, 7, 8, 3],
      defaultMaxTurns: 10,
      kineticSpeed: 1.15,
      supportsRingRotation: true,
      supportsConveyorShift: true,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['OVERCLOCK_DOUBLE_SPEED', 'HOST_BLIND_AUCTION', 'RISING_FLOOD_STAGE'],
    },
  },
  {
    boardNumber: 63,
    slug: 'archipelago_lighthouse_chain',
    name: 'Archipelago Lighthouse Chain',
    family: 'CARTOGRAPHY_EXPEDITION',
    signatureStage: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    tagline: 'Sweep coastal lighthouse beams to reveal hidden reefs in night fog.',
    symphonyTrack: 'explorer_odyssey',
    defaultTwist: 'BLACKOUT_SPOTLIGHT',
    targetWinCondition: 'Ignite 3 island lighthouses to illuminate the Grand Harbor Vault.',
    nodeCount: 15,
    mechanicArchetype: 'HEX_TURF_BRIDGE',
    accentPalette: { primaryHex: 0x4ea89a, secondaryHex: 0x16252c, gemHex: 0xffe66d },
    blueprint: {
      layoutKind: 'ARCHIPELAGO_CHAIN',
      customRuleSummary: 'Nocturnal island chain where each claimed lighthouse permanently widens the illuminated safe-harbor radius.',
      preferredDomains: [2, 7, 0, 10, 1, 9],
      defaultMaxTurns: 10,
      kineticSpeed: 0.85,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: true,
      supportsSpotlightCone: true,
      halftimeTwistPool: ['BLACKOUT_SPOTLIGHT', 'RIVAL_FOG_JAMMER', 'RISING_FLOOD_STAGE'],
    },
  },
  {
    boardNumber: 64,
    slug: 'transcontinental_rail_spike',
    name: 'Transcontinental Rail Spike',
    family: 'CARTOGRAPHY_EXPEDITION',
    signatureStage: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    tagline: 'Race East and West survey crews to drive the Golden Spike.',
    symphonyTrack: 'explorer_odyssey',
    defaultTwist: 'HIGH_VOLTAGE_CHAIN',
    targetWinCondition: 'Link coastal terminus to the central Golden Spike junction.',
    nodeCount: 15,
    mechanicArchetype: 'SUBWAY_NETWORK',
    accentPalette: { primaryHex: 0xb07d4f, secondaryHex: 0x2c221b, gemHex: 0xffd166 },
    blueprint: {
      layoutKind: 'RAIL_SPIKE_LINES',
      customRuleSummary: 'Bilateral frontier railroad converging on a central Golden Spike; contiguous owned track segments charge +0.5x Mult each.',
      preferredDomains: [0, 2, 6, 8, 5, 4],
      defaultMaxTurns: 10,
      kineticSpeed: 1.0,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['HIGH_VOLTAGE_CHAIN', 'CHAIN_FUSE_DETONATION', 'GOLDEN_BOUNTY_HUNT'],
    },
  },
  {
    boardNumber: 65,
    slug: 'polar_icebreaker_channels',
    name: 'Polar Icebreaker Channels',
    family: 'CARTOGRAPHY_EXPEDITION',
    signatureStage: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    tagline: 'Crack arctic floes through rival whiteout jamming to reach the Pole.',
    symphonyTrack: 'explorer_odyssey',
    defaultTwist: 'RIVAL_FOG_JAMMER',
    targetWinCondition: 'Carve an unbroken channel through pack ice to the Magnetic Pole.',
    nodeCount: 16,
    mechanicArchetype: 'HEX_TURF_BRIDGE',
    accentPalette: { primaryHex: 0x6ec1e4, secondaryHex: 0x1d2d3b, gemHex: 0xcaf0f8 },
    blueprint: {
      layoutKind: 'ICEBREAKER_CHANNELS',
      customRuleSummary: 'Crystalline hex floes where whiteout blizzards obscure rival-jammed lanes until broken by adjacent claims.',
      preferredDomains: [2, 7, 1, 0, 8, 6],
      defaultMaxTurns: 10,
      kineticSpeed: 0.75,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: true,
      supportsSpotlightCone: true,
      halftimeTwistPool: ['RIVAL_FOG_JAMMER', 'RISING_FLOOD_STAGE', 'MAGNETIC_REPULSOR'],
    },
  },
  {
    boardNumber: 66,
    slug: 'sunken_treasure_grid',
    name: 'Sunken Treasure Grid',
    family: 'CARTOGRAPHY_EXPEDITION',
    signatureStage: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    tagline: 'Dredge galleon chests while spotting wobbly brass decoy mines.',
    symphonyTrack: 'explorer_odyssey',
    defaultTwist: 'DOUBLE_AGENT_MOLE',
    targetWinCondition: 'Recover 4 authentic bullion chests without triggering a rival decoy.',
    nodeCount: 16,
    mechanicArchetype: 'MINESWEEPER_VAULTS',
    accentPalette: { primaryHex: 0x2f7f7d, secondaryHex: 0x1b2b34, gemHex: 0xf6bd60 },
    blueprint: {
      layoutKind: 'SUNKEN_GRID',
      customRuleSummary: '4x4 seabed salvage grid hiding 2 booby-trapped rival chests with subtle buoyant wobble tells; authentic chests escalate payout.',
      preferredDomains: [2, 0, 7, 10, 9, 3],
      defaultMaxTurns: 10,
      kineticSpeed: 0.9,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: true,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['DOUBLE_AGENT_MOLE', 'GOLDEN_BOUNTY_HUNT', 'RISING_FLOOD_STAGE'],
    },
  },
  {
    boardNumber: 67,
    slug: 'silk_road_caravan_oasis',
    name: 'Silk-Road Caravan Oasis',
    family: 'CARTOGRAPHY_EXPEDITION',
    signatureStage: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    tagline: 'Outbid rivals under desert bazaar cloches along ancient oasis stops.',
    symphonyTrack: 'explorer_odyssey',
    defaultTwist: 'HOST_BLIND_AUCTION',
    targetWinCondition: 'Control 3 Oasis Bazaars and outsmart rival blind-auction bluffs.',
    nodeCount: 14,
    mechanicArchetype: 'SHELL_MONTE_BLUFF',
    accentPalette: { primaryHex: 0xd49a54, secondaryHex: 0x3b2416, gemHex: 0x2ec4b6 },
    blueprint: {
      layoutKind: 'CARAVAN_OASIS',
      customRuleSummary: 'Winding dune route dotted with velvet auction tents; winning a blind bid unlocks a spice caravan x2 multiplier.',
      preferredDomains: [0, 2, 9, 3, 10, 8],
      defaultMaxTurns: 10,
      kineticSpeed: 0.8,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['HOST_BLIND_AUCTION', 'GOLDEN_BOUNTY_HUNT', 'CURSED_MULTIPLIER_DECAY'],
    },
  },
  {
    boardNumber: 68,
    slug: 'canyon_rope_bridge',
    name: 'Canyon Rope-Bridge',
    family: 'CARTOGRAPHY_EXPEDITION',
    signatureStage: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    tagline: 'Cross swaying canyon planks where wrong answers cut support ropes.',
    symphonyTrack: 'explorer_odyssey',
    defaultTwist: 'SUDDEN_TRAPDOOR_HAZARD',
    targetWinCondition: 'Cross the swaying gorge to claim the Emerald Mesa Idol.',
    nodeCount: 12,
    mechanicArchetype: 'PENDULUM_BRIDGE',
    accentPalette: { primaryHex: 0xb5653d, secondaryHex: 0x3d2618, gemHex: 0x52b788 },
    blueprint: {
      layoutKind: 'ROPE_BRIDGE_CHASM',
      customRuleSummary: 'Suspended twin-plank canyon span that tilts dynamically with score balance; hazardous rotten planks trigger Trapdoor Gambits.',
      preferredDomains: [2, 7, 5, 0, 10, 1],
      defaultMaxTurns: 9,
      kineticSpeed: 1.1,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['SUDDEN_TRAPDOOR_HAZARD', 'GRAVITY_INVERSION', 'CHAIN_FUSE_DETONATION'],
    },
  },
  {
    boardNumber: 69,
    slug: 'sextant_star_fix',
    name: 'Sextant Star-Fix',
    family: 'CARTOGRAPHY_EXPEDITION',
    signatureStage: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    tagline: 'Triangulate brass sextant arcs to bounce sightlines across three stars.',
    symphonyTrack: 'explorer_odyssey',
    defaultTwist: 'RICOCHET_LASER_BONUS',
    targetWinCondition: 'Bounce a brass sighting beam through 3 celestial arc nodes.',
    nodeCount: 13,
    mechanicArchetype: 'PRISM_SPLITTER',
    accentPalette: { primaryHex: 0xd4af37, secondaryHex: 0x16263a, gemHex: 0x72efdd },
    blueprint: {
      layoutKind: 'SEXTANT_ARC',
      customRuleSummary: '60-degree brass sextant arc with mirrored index arm; aligning the arm refracts bonus chips into downstream star nodes.',
      preferredDomains: [1, 2, 11, 6, 0, 10],
      defaultMaxTurns: 9,
      kineticSpeed: 0.9,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['RICOCHET_LASER_BONUS', 'BLACKOUT_SPOTLIGHT', 'MIRROR_TWIN_LINK'],
    },
  },
  {
    boardNumber: 70,
    slug: 'lost_city_ziggurat',
    name: 'Lost City Ziggurat',
    family: 'CARTOGRAPHY_EXPEDITION',
    signatureStage: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    tagline: 'Ascend mossy expedition terraces before ancient relic multipliers crumble.',
    symphonyTrack: 'explorer_odyssey',
    defaultTwist: 'CURSED_MULTIPLIER_DECAY',
    targetWinCondition: 'Ascend all 3 terraced steps to open the Sun-Disc Chamber.',
    nodeCount: 13,
    mechanicArchetype: 'STEPPED_PYRAMID',
    accentPalette: { primaryHex: 0x6b8f71, secondaryHex: 0x3b3224, gemHex: 0xffd166 },
    blueprint: {
      layoutKind: 'ZIGGURAT_TERRACE',
      customRuleSummary: 'Three stepped sandstone terraces overgrown with brass vines; decaying sand-glass shrines reward fast ascent.',
      preferredDomains: [0, 2, 10, 3, 7, 9],
      defaultMaxTurns: 10,
      kineticSpeed: 0.75,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: true,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['CURSED_MULTIPLIER_DECAY', 'DOUBLE_AGENT_MOLE', 'GOLDEN_BOUNTY_HUNT'],
    },
  },

  // ==========================================================================
  // FAMILY VIII: CARNIVAL_ARCADE (Boards 71–80, Stage 07)
  // ==========================================================================
  {
    boardNumber: 71,
    slug: 'carousel_ferris_wheel',
    name: 'Carousel Ferris Wheel',
    family: 'CARNIVAL_ARCADE',
    signatureStage: 'STAGE_07_CARNIVAL_CURIOSITIES',
    tagline: 'Vertical 3D lit gondolas rotate every turn past the Jackpot Platform.',
    symphonyTrack: 'carnival_accelerando',
    defaultTwist: 'OVERCLOCK_DOUBLE_SPEED',
    targetWinCondition: 'Board and claim 4 rotating gondolas at the lit Top-Crown dock.',
    nodeCount: 12,
    mechanicArchetype: 'FERRIS_WHEEL',
    accentPalette: { primaryHex: 0xd94f4f, secondaryHex: 0x261c2c, gemHex: 0x48e5c2 },
    blueprint: {
      layoutKind: 'FERRIS_GONDOLA_WHEEL',
      customRuleSummary: 'Vertical 12-gondola brass wheel rotates 30° each turn; top zenith & bottom boarding docks unlock double-payout rides.',
      preferredDomains: [4, 5, 9, 0, 3, 6],
      defaultMaxTurns: 10,
      kineticSpeed: 1.35,
      supportsRingRotation: true,
      supportsConveyorShift: true,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['OVERCLOCK_DOUBLE_SPEED', 'GOLDEN_BOUNTY_HUNT', 'GRAVITY_INVERSION'],
    },
  },
  {
    boardNumber: 72,
    slug: 'penny_arcade_tin_duck_gallery',
    name: 'Penny-Arcade Tin-Duck Gallery',
    family: 'CARNIVAL_ARCADE',
    signatureStage: 'STAGE_07_CARNIVAL_CURIOSITIES',
    tagline: 'Counter-scrolling rows of brass tin ducks parade past golden bullseyes.',
    symphonyTrack: 'carnival_accelerando',
    defaultTwist: 'GOLDEN_BOUNTY_HUNT',
    targetWinCondition: 'Knock down 5 moving brass ducks including the Golden Swan.',
    nodeCount: 15,
    mechanicArchetype: 'CARNIVAL_SHOOTING_GALLERY',
    accentPalette: { primaryHex: 0xe6a13c, secondaryHex: 0x2b1d24, gemHex: 0xff595e },
    blueprint: {
      layoutKind: 'TIN_DUCK_GALLERY',
      customRuleSummary: 'Three counter-moving horizontal rows of stamped-brass ducks shift every turn; center-rail shots count as x2 Bullseyes.',
      preferredDomains: [4, 5, 7, 9, 0, 11],
      defaultMaxTurns: 10,
      kineticSpeed: 1.5,
      supportsRingRotation: false,
      supportsConveyorShift: true,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['GOLDEN_BOUNTY_HUNT', 'OVERCLOCK_DOUBLE_SPEED', 'DOUBLE_AGENT_MOLE'],
    },
  },
  {
    boardNumber: 73,
    slug: 'calliope_steam_valves',
    name: 'Calliope Steam Valves',
    family: 'CARNIVAL_ARCADE',
    signatureStage: 'STAGE_07_CARNIVAL_CURIOSITIES',
    tagline: 'Build copper boiler pressure across linked whistle pipes for steam surges.',
    symphonyTrack: 'carnival_accelerando',
    defaultTwist: 'HIGH_VOLTAGE_CHAIN',
    targetWinCondition: 'Pressurize 3 linked copper calliope manifolds without overblowing.',
    nodeCount: 14,
    mechanicArchetype: 'ELEVATOR_SHAFTS',
    accentPalette: { primaryHex: 0xc86d44, secondaryHex: 0x241d1c, gemHex: 0x06d6a0 },
    blueprint: {
      layoutKind: 'CALLIOPE_VALVES',
      customRuleSummary: 'Copper steam calliope with pressure-gauge valves; chaining adjacent valves discharges a high-voltage whistle multiplier.',
      preferredDomains: [4, 6, 1, 3, 9, 0],
      defaultMaxTurns: 10,
      kineticSpeed: 1.2,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: true,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['HIGH_VOLTAGE_CHAIN', 'CHAIN_FUSE_DETONATION', 'OVERCLOCK_DOUBLE_SPEED'],
    },
  },
  {
    boardNumber: 74,
    slug: 'high_striker_strongman_bell',
    name: 'High-Striker Strongman Bell',
    family: 'CARNIVAL_ARCADE',
    signatureStage: 'STAGE_07_CARNIVAL_CURIOSITIES',
    tagline: 'Launch the weighted brass puck upward before decay drags it down.',
    symphonyTrack: 'carnival_accelerando',
    defaultTwist: 'CURSED_MULTIPLIER_DECAY',
    targetWinCondition: 'Ring the Top Strongman Bell by climbing consecutive momentum rungs.',
    nodeCount: 12,
    mechanicArchetype: 'STEPPED_PYRAMID',
    accentPalette: { primaryHex: 0xe63946, secondaryHex: 0x281e22, gemHex: 0xffd166 },
    blueprint: {
      layoutKind: 'HIGH_STRIKER_TOWER',
      customRuleSummary: 'Vertical fairground striker tower flanked by momentum weights; rapid streak hits launch the puck straight into the Bell.',
      preferredDomains: [5, 4, 1, 6, 0, 9],
      defaultMaxTurns: 9,
      kineticSpeed: 1.3,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['CURSED_MULTIPLIER_DECAY', 'GRAVITY_INVERSION', 'GOLDEN_BOUNTY_HUNT'],
    },
  },
  {
    boardNumber: 75,
    slug: 'hall_of_trick_mirrors',
    name: 'Hall of Trick Mirrors',
    family: 'CARNIVAL_ARCADE',
    signatureStage: 'STAGE_07_CARNIVAL_CURIOSITIES',
    tagline: 'Every mirror panel reflects its twin—claim one to flip both.',
    symphonyTrack: 'carnival_accelerando',
    defaultTwist: 'MIRROR_TWIN_LINK',
    targetWinCondition: 'Master mirrored pairs to control 6 carnival reflection panels.',
    nodeCount: 14,
    mechanicArchetype: 'LASER_MIRROR_GRID',
    accentPalette: { primaryHex: 0x4cc9f0, secondaryHex: 0x24172b, gemHex: 0xf72585 },
    blueprint: {
      layoutKind: 'TRICK_MIRROR_HALL',
      customRuleSummary: 'Angled funhouse mirror gallery linking left and right reflection nodes; claiming a panel simultaneously flips its twin.',
      preferredDomains: [3, 4, 10, 11, 1, 0],
      defaultMaxTurns: 10,
      kineticSpeed: 1.0,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: true,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['MIRROR_TWIN_LINK', 'RICOCHET_LASER_BONUS', 'DOUBLE_AGENT_MOLE'],
    },
  },
  {
    boardNumber: 76,
    slug: 'claw_machine_prize_pit',
    name: 'Claw-Machine Prize Pit',
    family: 'CARNIVAL_ARCADE',
    signatureStage: 'STAGE_07_CARNIVAL_CURIOSITIES',
    tagline: 'Bid chips for overhead brass-claw drops into shrouded prize capsules.',
    symphonyTrack: 'carnival_accelerando',
    defaultTwist: 'HOST_BLIND_AUCTION',
    targetWinCondition: 'Snag 3 plush/brass capsule jackpots while baiting rival overbids.',
    nodeCount: 15,
    mechanicArchetype: 'PINBALL_DROP',
    accentPalette: { primaryHex: 0xf77f00, secondaryHex: 0x23192d, gemHex: 0x06d6a0 },
    blueprint: {
      layoutKind: 'CLAW_PRIZE_PIT',
      customRuleSummary: 'Three-tier arcade prize bin beneath a moving overhead brass gantry; golden capsules trigger mystery blind bids.',
      preferredDomains: [4, 9, 5, 6, 7, 3],
      defaultMaxTurns: 10,
      kineticSpeed: 1.25,
      supportsRingRotation: false,
      supportsConveyorShift: true,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['HOST_BLIND_AUCTION', 'MAGNETIC_REPULSOR', 'GOLDEN_BOUNTY_HUNT'],
    },
  },
  {
    boardNumber: 77,
    slug: 'tilt_a_whirl_cups',
    name: 'Tilt-a-Whirl Cups',
    family: 'CARNIVAL_ARCADE',
    signatureStage: 'STAGE_07_CARNIVAL_CURIOSITIES',
    tagline: 'Spinning carnival saucers sling loose multiplier tokens across the platform.',
    symphonyTrack: 'carnival_accelerando',
    defaultTwist: 'MAGNETIC_REPULSOR',
    targetWinCondition: 'Capture spinning saucer hubs after centrifugal chip slings.',
    nodeCount: 13,
    mechanicArchetype: 'CONCENTRIC_RINGS',
    accentPalette: { primaryHex: 0x9b5de5, secondaryHex: 0x1e1829, gemHex: 0xfee440 },
    blueprint: {
      layoutKind: 'TILT_WHIRL_CUPS',
      customRuleSummary: 'Three orbiting teacup pods around a central motor hub; centrifugal repulsor kicks scatter extra chips to rim seats.',
      preferredDomains: [4, 5, 1, 9, 11, 3],
      defaultMaxTurns: 10,
      kineticSpeed: 1.6,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['MAGNETIC_REPULSOR', 'OVERCLOCK_DOUBLE_SPEED', 'MIRROR_TWIN_LINK'],
    },
  },
  {
    boardNumber: 78,
    slug: 'fortune_teller_automaton',
    name: 'Fortune-Teller Automaton',
    family: 'CARNIVAL_ARCADE',
    signatureStage: 'STAGE_07_CARNIVAL_CURIOSITIES',
    tagline: 'Zoltar deals gilded tarot tiles—two are cursed clockwork decoys.',
    symphonyTrack: 'carnival_accelerando',
    defaultTwist: 'DOUBLE_AGENT_MOLE',
    targetWinCondition: 'Read the mechanical wobble tells and claim 4 true prophecy cards.',
    nodeCount: 14,
    mechanicArchetype: 'SHELL_MONTE_BLUFF',
    accentPalette: { primaryHex: 0xd9a05b, secondaryHex: 0x2b1224, gemHex: 0x00f5d4 },
    blueprint: {
      layoutKind: 'AUTOMATON_BOOTH',
      customRuleSummary: 'Velvet-draped tarot fan dealt by a brass cabinet; 2 high-value cards are rival Moles with subtle eye-blink & wobble tells.',
      preferredDomains: [10, 4, 0, 3, 8, 11],
      defaultMaxTurns: 10,
      kineticSpeed: 0.9,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['DOUBLE_AGENT_MOLE', 'HOST_BLIND_AUCTION', 'BLACKOUT_SPOTLIGHT'],
    },
  },
  {
    boardNumber: 79,
    slug: 'ring_toss_bottleneck',
    name: 'Ring-Toss Bottleneck',
    family: 'CARNIVAL_ARCADE',
    signatureStage: 'STAGE_07_CARNIVAL_CURIOSITIES',
    tagline: 'Ring narrow emerald bottlenecks where glancing misses spring hidden trapdoors.',
    symphonyTrack: 'carnival_accelerando',
    defaultTwist: 'SUDDEN_TRAPDOOR_HAZARD',
    targetWinCondition: 'Land brass rings on the back-row Gold Crown bottles.',
    nodeCount: 15,
    mechanicArchetype: 'CARNIVAL_SHOOTING_GALLERY',
    accentPalette: { primaryHex: 0x2ec4b6, secondaryHex: 0x221c29, gemHex: 0xff9f1c },
    blueprint: {
      layoutKind: 'RING_TOSS_BOTTLES',
      customRuleSummary: 'Staggered pyramid rack of glass milk bottles; back-row crowns pay triple chips but adjacent misses trigger Trapdoor drops.',
      preferredDomains: [5, 9, 4, 7, 2, 11],
      defaultMaxTurns: 10,
      kineticSpeed: 1.0,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['SUDDEN_TRAPDOOR_HAZARD', 'GOLDEN_BOUNTY_HUNT', 'CURSED_MULTIPLIER_DECAY'],
    },
  },
  {
    boardNumber: 80,
    slug: 'roller_coaster_loop',
    name: 'Roller-Coaster Loop',
    family: 'CARNIVAL_ARCADE',
    signatureStage: 'STAGE_07_CARNIVAL_CURIOSITIES',
    tagline: 'Climb the wooden cyclone and flip upside down at loop apex.',
    symphonyTrack: 'carnival_accelerando',
    defaultTwist: 'GRAVITY_INVERSION',
    targetWinCondition: 'Ride the full 360° brass coaster track and invert the Crown Car.',
    nodeCount: 14,
    mechanicArchetype: 'FERRIS_WHEEL',
    accentPalette: { primaryHex: 0xff595e, secondaryHex: 0x1d1b2b, gemHex: 0xffca3a },
    blueprint: {
      layoutKind: 'COASTER_LOOP',
      customRuleSummary: 'Vertical clothoid loop track; reaching midpoint flips gravity upside-down so inverted crest cars pay massive x3 Mult.',
      preferredDomains: [5, 1, 6, 4, 2, 0],
      defaultMaxTurns: 10,
      kineticSpeed: 1.55,
      supportsRingRotation: true,
      supportsConveyorShift: true,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['GRAVITY_INVERSION', 'OVERCLOCK_DOUBLE_SPEED', 'SUDDEN_TRAPDOOR_HAZARD'],
    },
  },

  // ==========================================================================
  // FAMILY IX: ASTRAL_QUANTUM (Boards 81–90, Stages 09 / 08)
  // ==========================================================================
  {
    boardNumber: 81,
    slug: 'aurora_constellation_loom',
    name: 'Aurora Constellation Loom',
    family: 'ASTRAL_QUANTUM',
    signatureStage: 'STAGE_09_ASTRAL_OBSERVATORY',
    tagline: 'Weave star-filament triangles across the observatory dome for plasma arcs.',
    symphonyTrack: 'astral_storm_presto',
    defaultTwist: 'HIGH_VOLTAGE_CHAIN',
    targetWinCondition: 'Complete 2 closed aurora star constellations across the dome.',
    nodeCount: 15,
    mechanicArchetype: 'ASTRAL_CONSTELLATION',
    accentPalette: { primaryHex: 0x38d9a9, secondaryHex: 0x161b33, gemHex: 0x74c0fc },
    blueprint: {
      layoutKind: 'CONSTELLATION_LOOM',
      customRuleSummary: 'Suspended copper-and-alabaster star nodes connected by aurora silk; closing any 3-node triangle sparks a High-Voltage surge.',
      preferredDomains: [1, 10, 3, 2, 11, 6],
      defaultMaxTurns: 10,
      kineticSpeed: 0.85,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: true,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['HIGH_VOLTAGE_CHAIN', 'RICOCHET_LASER_BONUS', 'MIRROR_TWIN_LINK'],
    },
  },
  {
    boardNumber: 82,
    slug: 'binary_eclipse_twin_orbits',
    name: 'Binary Eclipse Twin-Orbits',
    family: 'ASTRAL_QUANTUM',
    signatureStage: 'STAGE_09_ASTRAL_OBSERVATORY',
    tagline: 'Twin sun and moon rings overlap—claims at syzygy flip both.',
    symphonyTrack: 'astral_storm_presto',
    defaultTwist: 'MIRROR_TWIN_LINK',
    targetWinCondition: 'Capture both Eclipse Syzygy intersections to double board score.',
    nodeCount: 14,
    mechanicArchetype: 'CONCENTRIC_RINGS',
    accentPalette: { primaryHex: 0xf4a261, secondaryHex: 0x111526, gemHex: 0x90e0ef },
    blueprint: {
      layoutKind: 'BINARY_TWIN_ORBIT',
      customRuleSummary: 'Figure-eight binary orbital rings where opposing orbital nodes are mirrored; claiming an eclipse node flips its orbital partner.',
      preferredDomains: [1, 10, 0, 11, 2, 3],
      defaultMaxTurns: 10,
      kineticSpeed: 1.0,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: true,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['MIRROR_TWIN_LINK', 'BLACKOUT_SPOTLIGHT', 'OVERCLOCK_DOUBLE_SPEED'],
    },
  },
  {
    boardNumber: 83,
    slug: 'telescope_lens_alignment',
    name: 'Telescope Lens Alignment',
    family: 'ASTRAL_QUANTUM',
    signatureStage: 'STAGE_09_ASTRAL_OBSERVATORY',
    tagline: 'Focus stacked optical glass rings to amplify a celestial laser.',
    symphonyTrack: 'astral_storm_presto',
    defaultTwist: 'RICOCHET_LASER_BONUS',
    targetWinCondition: 'Focus all 4 optical lens stages onto the Deep-Space Quasar.',
    nodeCount: 14,
    mechanicArchetype: 'PRISM_SPLITTER',
    accentPalette: { primaryHex: 0xc87d4b, secondaryHex: 0x171d2b, gemHex: 0x64dfdf },
    blueprint: {
      layoutKind: 'TELESCOPE_LENS_ARRAY',
      customRuleSummary: 'Coaxial brass refractor tube with rotatable lens apertures; each focused lens adds +0.6x optical beam magnification.',
      preferredDomains: [1, 6, 11, 2, 0, 3],
      defaultMaxTurns: 10,
      kineticSpeed: 0.9,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: true,
      halftimeTwistPool: ['RICOCHET_LASER_BONUS', 'BLACKOUT_SPOTLIGHT', 'HIGH_VOLTAGE_CHAIN'],
    },
  },
  {
    boardNumber: 84,
    slug: 'tidal_gravity_wells',
    name: 'Tidal Gravity Wells',
    family: 'ASTRAL_QUANTUM',
    signatureStage: 'STAGE_08_SUNKEN_BATHYSPHERE',
    tagline: 'Abyssal gravity wells warp chip payouts inward and repel rival locks.',
    symphonyTrack: 'bathysphere_cathedral',
    defaultTwist: 'MAGNETIC_REPULSOR',
    targetWinCondition: 'Stabilize twin gravity singularities without losing rim control.',
    nodeCount: 15,
    mechanicArchetype: 'ASTRAL_CONSTELLATION',
    accentPalette: { primaryHex: 0x2a9d8f, secondaryHex: 0x101c24, gemHex: 0x80ffdb },
    blueprint: {
      layoutKind: 'TIDAL_GRAVITY_WELL',
      customRuleSummary: 'Warped funnel lattice around deep abyssal wells; polarity pulses shift unclaimed payout weight between well & rim.',
      preferredDomains: [1, 7, 2, 11, 6, 10],
      defaultMaxTurns: 10,
      kineticSpeed: 1.05,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: true,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['MAGNETIC_REPULSOR', 'GRAVITY_INVERSION', 'RISING_FLOOD_STAGE'],
    },
  },
  {
    boardNumber: 85,
    slug: 'bathysphere_trench_descent',
    name: 'Bathysphere Trench Descent',
    family: 'ASTRAL_QUANTUM',
    signatureStage: 'STAGE_08_SUNKEN_BATHYSPHERE',
    tagline: 'Dive riveted pressure decks as crushing ocean floods seal upper hatches.',
    symphonyTrack: 'bathysphere_cathedral',
    defaultTwist: 'RISING_FLOOD_STAGE',
    targetWinCondition: 'Reach the Abyssal Vent Chamber before upper ballast locks flood.',
    nodeCount: 14,
    mechanicArchetype: 'ELEVATOR_SHAFTS',
    accentPalette: { primaryHex: 0xb07c4f, secondaryHex: 0x0e1821, gemHex: 0x48bfe3 },
    blueprint: {
      layoutKind: 'BATHYSPHERE_TRENCH',
      customRuleSummary: 'Descending pressure-lock decks framed by bronze portholes; rising abyssal tide seals shallow decks while deep vents pay x3.',
      preferredDomains: [7, 1, 2, 6, 0, 8],
      defaultMaxTurns: 10,
      kineticSpeed: 0.95,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: true,
      supportsSpotlightCone: true,
      halftimeTwistPool: ['RISING_FLOOD_STAGE', 'BLACKOUT_SPOTLIGHT', 'SUDDEN_TRAPDOOR_HAZARD'],
    },
  },
  {
    boardNumber: 86,
    slug: 'prism_wavelength_fan',
    name: 'Prism Wavelength Fan',
    family: 'ASTRAL_QUANTUM',
    signatureStage: 'STAGE_09_ASTRAL_OBSERVATORY',
    tagline: 'Split white starlight into seven spectral bands that ricochet bonuses.',
    symphonyTrack: 'astral_storm_presto',
    defaultTwist: 'RICOCHET_LASER_BONUS',
    targetWinCondition: 'Illuminate 4 spectral wavelength crystals from Violet to Ruby.',
    nodeCount: 15,
    mechanicArchetype: 'PRISM_SPLITTER',
    accentPalette: { primaryHex: 0x9d4edd, secondaryHex: 0x16192b, gemHex: 0x00f5d4 },
    blueprint: {
      layoutKind: 'PRISM_WAVELENGTH_FAN',
      customRuleSummary: 'Central cut-quartz crystal fans into chromatic rays; claiming consecutive wavelength bands multiplies optical payout.',
      preferredDomains: [1, 3, 4, 6, 11, 7],
      defaultMaxTurns: 10,
      kineticSpeed: 0.9,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['RICOCHET_LASER_BONUS', 'HIGH_VOLTAGE_CHAIN', 'MIRROR_TWIN_LINK'],
    },
  },
  {
    boardNumber: 87,
    slug: 'meteor_shower_shield',
    name: 'Meteor Shower Shield',
    family: 'ASTRAL_QUANTUM',
    signatureStage: 'STAGE_09_ASTRAL_OBSERVATORY',
    tagline: 'Intercept sparking meteor fuses before impact chains lock adjacent shields.',
    symphonyTrack: 'astral_storm_presto',
    defaultTwist: 'CHAIN_FUSE_DETONATION',
    targetWinCondition: 'Defuse 3 incoming meteor fuses and hold the Observatory Core.',
    nodeCount: 15,
    mechanicArchetype: 'SONAR_RADAR_SWEEP',
    accentPalette: { primaryHex: 0xf77f00, secondaryHex: 0x141829, gemHex: 0x4cc9f0 },
    blueprint: {
      layoutKind: 'METEOR_SHIELD_ARC',
      customRuleSummary: 'Hemispheric copper shield dome tracking burning bolide arcs; intercepting fused arcs breaks locks and awards Bomb-Squad Mult.',
      preferredDomains: [1, 6, 2, 11, 0, 5],
      defaultMaxTurns: 10,
      kineticSpeed: 1.35,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['CHAIN_FUSE_DETONATION', 'OVERCLOCK_DOUBLE_SPEED', 'RIVAL_FOG_JAMMER'],
    },
  },
  {
    boardNumber: 88,
    slug: 'quantum_entangled_pairs',
    name: 'Quantum Entangled Pairs',
    family: 'ASTRAL_QUANTUM',
    signatureStage: 'STAGE_09_ASTRAL_OBSERVATORY',
    tagline: 'Claiming Node A instantly flips its entangled quantum twin Node A-prime.',
    symphonyTrack: 'astral_storm_presto',
    defaultTwist: 'MIRROR_TWIN_LINK',
    targetWinCondition: 'Collapse 4 entangled quantum pairs into unified player spin.',
    nodeCount: 16,
    mechanicArchetype: 'ASTRAL_CONSTELLATION',
    accentPalette: { primaryHex: 0x00bbf9, secondaryHex: 0x121329, gemHex: 0xf15bb5 },
    blueprint: {
      layoutKind: 'QUANTUM_ENTANGLED_PAIRS',
      customRuleSummary: '8 braided twin orb pairs wired by luminous plasma arcs; claiming Node A instantaneously flips entangled Node A-prime.',
      preferredDomains: [1, 11, 6, 3, 10, 8],
      defaultMaxTurns: 10,
      kineticSpeed: 1.15,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: true,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['MIRROR_TWIN_LINK', 'HIGH_VOLTAGE_CHAIN', 'MAGNETIC_REPULSOR'],
    },
  },
  {
    boardNumber: 89,
    slug: 'sundial_shadow_sweep',
    name: 'Sundial Shadow Sweep',
    family: 'ASTRAL_QUANTUM',
    signatureStage: 'STAGE_09_ASTRAL_OBSERVATORY',
    tagline: 'A giant bronze gnomon sweeps shadow—read nodes caught in sunlight.',
    symphonyTrack: 'astral_storm_presto',
    defaultTwist: 'BLACKOUT_SPOTLIGHT',
    targetWinCondition: 'Claim 4 Sun-Lit Meridian hours before the shadow gnomon eclipses them.',
    nodeCount: 13,
    mechanicArchetype: 'SONAR_RADAR_SWEEP',
    accentPalette: { primaryHex: 0xe9c46a, secondaryHex: 0x1b2236, gemHex: 0xffb703 },
    blueprint: {
      layoutKind: 'SUNDIAL_SHADOW_DIAL',
      customRuleSummary: 'Monumental 12-hour alabaster sundial plus central gnomon spire; only sunlit sector tiles reveal full bounty value.',
      preferredDomains: [0, 1, 2, 10, 3, 11],
      defaultMaxTurns: 10,
      kineticSpeed: 0.85,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: true,
      halftimeTwistPool: ['BLACKOUT_SPOTLIGHT', 'CURSED_MULTIPLIER_DECAY', 'RICOCHET_LASER_BONUS'],
    },
  },
  {
    boardNumber: 90,
    slug: 'supernova_core',
    name: 'Supernova Core',
    family: 'ASTRAL_QUANTUM',
    signatureStage: 'STAGE_09_ASTRAL_OBSERVATORY',
    tagline: 'Overclocked stellar shells expand rapidly—tap the core before collapse.',
    symphonyTrack: 'astral_storm_presto',
    defaultTwist: 'OVERCLOCK_DOUBLE_SPEED',
    targetWinCondition: 'Stabilize 3 expanding shockwave shells and claim the Singularity Core.',
    nodeCount: 15,
    mechanicArchetype: 'ASTRAL_CONSTELLATION',
    accentPalette: { primaryHex: 0xff6d00, secondaryHex: 0x140f24, gemHex: 0x00f5d4 },
    blueprint: {
      layoutKind: 'SUPERNOVA_CORE',
      customRuleSummary: 'Concentric plasma shells pulse outward at double speed; core claims trigger massive supernova multiplier cascades.',
      preferredDomains: [1, 6, 11, 10, 2, 4],
      defaultMaxTurns: 9,
      kineticSpeed: 1.65,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: true,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['OVERCLOCK_DOUBLE_SPEED', 'CHAIN_FUSE_DETONATION', 'HIGH_VOLTAGE_CHAIN'],
    },
  },

  // ==========================================================================
  // FAMILY X: RULE_BENDER_TWISTS (Boards 91–100, All Stages / Bosses)
  // ==========================================================================
  {
    boardNumber: 91,
    slug: 'blackout_spotlight_heist',
    name: 'The Blackout Spotlight Heist',
    family: 'RULE_BENDER_TWISTS',
    signatureStage: 'STAGE_05_ANALOG_BUNKER_1969',
    tagline: 'House lights cut—only nodes inside your movable spotlight cone show.',
    symphonyTrack: 'bunker_espionage',
    defaultTwist: 'BLACKOUT_SPOTLIGHT',
    targetWinCondition: 'Sweep your Fresnel beam to scout and heist 4 high-value vaults.',
    nodeCount: 16,
    mechanicArchetype: 'SONAR_RADAR_SWEEP',
    accentPalette: { primaryHex: 0xffd166, secondaryHex: 0x0b1019, gemHex: 0x06d6a0 },
    blueprint: {
      layoutKind: 'BLACKOUT_HEIST_GRID',
      customRuleSummary: 'Studio blackout drops stage lighting; move the 3D golden spotlight cone to reveal categories & hidden locks before tapping.',
      preferredDomains: [4, 8, 0, 6, 2, 11],
      defaultMaxTurns: 10,
      kineticSpeed: 1.0,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: true,
      halftimeTwistPool: ['BLACKOUT_SPOTLIGHT', 'DOUBLE_AGENT_MOLE', 'RIVAL_FOG_JAMMER'],
    },
  },
  {
    boardNumber: 92,
    slug: 'double_agent_mole_board',
    name: 'Double-Agent Mole Board',
    family: 'RULE_BENDER_TWISTS',
    signatureStage: 'STAGE_03_MONTE_CARLO_SALON',
    tagline: 'Two disguised rival trap gems carry subtle 3D physical wobble tells.',
    symphonyTrack: 'riviera_caprice',
    defaultTwist: 'DOUBLE_AGENT_MOLE',
    targetWinCondition: 'Outsmart both rival Moles via wobble tells or Reveal-Mole foils.',
    nodeCount: 15,
    mechanicArchetype: 'MINESWEEPER_VAULTS',
    accentPalette: { primaryHex: 0x10b981, secondaryHex: 0x1b241f, gemHex: 0xef476f },
    blueprint: {
      layoutKind: 'MOLE_VAULT_RING',
      customRuleSummary: 'High-stakes emerald salon ring hiding 2 rival Mole gems that subtly shiver in 3D; unmasking a Mole converts it into +300 bounty.',
      preferredDomains: [8, 0, 4, 10, 9, 11],
      defaultMaxTurns: 10,
      kineticSpeed: 0.95,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['DOUBLE_AGENT_MOLE', 'HOST_BLIND_AUCTION', 'SPLIT_OR_STEAL_VAULT'],
    },
  },
  {
    boardNumber: 93,
    slug: 'split_or_steal_final_vault',
    name: 'Split-or-Steal Final Vault',
    family: 'RULE_BENDER_TWISTS',
    signatureStage: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    tagline: 'Fill the central Golden Pot, then commit SPLIT or STEAL live.',
    symphonyTrack: 'colosseum_finale',
    defaultTwist: 'SPLIT_OR_STEAL_VAULT',
    targetWinCondition: 'Build the Twin-Sphere Vault Pot and win the Split-or-Steal showdown.',
    nodeCount: 13,
    mechanicArchetype: 'SPLIT_OR_STEAL_ARENA',
    accentPalette: { primaryHex: 0xf5c542, secondaryHex: 0x1b1518, gemHex: 0xff2e63 },
    blueprint: {
      layoutKind: 'SPLIT_STEAL_ARENA',
      customRuleSummary: 'Every claimed rim tile feeds a central Golden Pot; unlocking the center launches a live SPLIT vs STEAL prisoner dilemma.',
      preferredDomains: [8, 0, 4, 5, 11, 2],
      defaultMaxTurns: 9,
      kineticSpeed: 1.0,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['SPLIT_OR_STEAL_VAULT', 'HOST_BLIND_AUCTION', 'GOLDEN_BOUNTY_HUNT'],
    },
  },
  {
    boardNumber: 94,
    slug: 'shrinking_flood_island',
    name: 'Shrinking Flood Island',
    family: 'RULE_BENDER_TWISTS',
    signatureStage: 'STAGE_08_SUNKEN_BATHYSPHERE',
    tagline: 'Outer hex ring submerges every two turns—fight for dry summit.',
    symphonyTrack: 'bathysphere_cathedral',
    defaultTwist: 'RISING_FLOOD_STAGE',
    targetWinCondition: 'Survive rising abyssal tides and own the Final Dry Citadel.',
    nodeCount: 19,
    mechanicArchetype: 'HEX_TURF_BRIDGE',
    accentPalette: { primaryHex: 0x00b4d8, secondaryHex: 0x142129, gemHex: 0xffd166 },
    blueprint: {
      layoutKind: 'FLOOD_ISLAND_RINGS',
      customRuleSummary: '19-hex concentric island (1 summit + 6 highlands + 12 coastline); tide submerges outer coastal hexes every 2 turns.',
      preferredDomains: [2, 7, 1, 0, 9, 10],
      defaultMaxTurns: 10,
      kineticSpeed: 1.05,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: true,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['RISING_FLOOD_STAGE', 'SUDDEN_TRAPDOOR_HAZARD', 'GOLDEN_BOUNTY_HUNT'],
    },
  },
  {
    boardNumber: 95,
    slug: 'inverted_gravity_escher_pyramid',
    name: 'Inverted-Gravity Escher Pyramid',
    family: 'RULE_BENDER_TWISTS',
    signatureStage: 'STAGE_06_KYOTO_LACQUER_PAVILION',
    tagline: 'Flip the entire 3D lacquer pyramid upside down to invert payouts.',
    symphonyTrack: 'kyoto_nocturne',
    defaultTwist: 'GRAVITY_INVERSION',
    targetWinCondition: 'Navigate impossible Escher stairs across both upright and inverted states.',
    nodeCount: 12,
    mechanicArchetype: 'STEPPED_PYRAMID',
    accentPalette: { primaryHex: 0xd62828, secondaryHex: 0x120e10, gemHex: 0xf4c95d },
    blueprint: {
      layoutKind: 'ESCHER_INVERTED_PYRAMID',
      customRuleSummary: 'Double-sided kintsugi lacquer pyramid that physically flips 180° at halftime, turning base stones into suspended Apex Vaults.',
      preferredDomains: [3, 11, 10, 1, 0, 6],
      defaultMaxTurns: 10,
      kineticSpeed: 0.95,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: true,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['GRAVITY_INVERSION', 'MIRROR_TWIN_LINK', 'CURSED_MULTIPLIER_DECAY'],
    },
  },
  {
    boardNumber: 96,
    slug: 'ticking_fuse_chain_bomb',
    name: 'Ticking Fuse Chain-Bomb',
    family: 'RULE_BENDER_TWISTS',
    signatureStage: 'STAGE_05_ANALOG_BUNKER_1969',
    tagline: 'Burning brass fuses race across neighbors—defuse before chain detonation.',
    symphonyTrack: 'bunker_espionage',
    defaultTwist: 'CHAIN_FUSE_DETONATION',
    targetWinCondition: 'Snip 3 active chain-bomb fuses for Bomb-Squad Mult victory.',
    nodeCount: 15,
    mechanicArchetype: 'DOMINO_CHAIN',
    accentPalette: { primaryHex: 0xf77f00, secondaryHex: 0x262b24, gemHex: 0xff4d6d },
    blueprint: {
      layoutKind: 'CHAIN_BOMB_WEB',
      customRuleSummary: 'Braided detonation network where 2-turn fuses crawl between nodes; defusing awards +250 & shatters adjacent iron chains.',
      preferredDomains: [6, 1, 8, 0, 11, 5],
      defaultMaxTurns: 10,
      kineticSpeed: 1.4,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['CHAIN_FUSE_DETONATION', 'OVERCLOCK_DOUBLE_SPEED', 'SUDDEN_TRAPDOOR_HAZARD'],
    },
  },
  {
    boardNumber: 97,
    slug: 'mirror_twin_sabotage',
    name: 'Mirror-Twin Sabotage',
    family: 'RULE_BENDER_TWISTS',
    signatureStage: 'STAGE_09_ASTRAL_OBSERVATORY',
    tagline: 'Every rival sabotage bounces back across linked prism twins.',
    symphonyTrack: 'astral_storm_presto',
    defaultTwist: 'MIRROR_TWIN_LINK',
    targetWinCondition: 'Flip rival-held twin clusters simultaneously in a single combo.',
    nodeCount: 16,
    mechanicArchetype: 'LASER_MIRROR_GRID',
    accentPalette: { primaryHex: 0x7209b7, secondaryHex: 0x131629, gemHex: 0x4cc9f0 },
    blueprint: {
      layoutKind: 'MIRROR_TWIN_MATRIX',
      customRuleSummary: '4x4 split-mirror lattice where mirrored quadrants share ownership state unless locked down with a Freeze Foil card.',
      preferredDomains: [11, 1, 3, 4, 8, 6],
      defaultMaxTurns: 10,
      kineticSpeed: 1.1,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: true,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['MIRROR_TWIN_LINK', 'RICOCHET_LASER_BONUS', 'RIVAL_FOG_JAMMER'],
    },
  },
  {
    boardNumber: 98,
    slug: 'frankies_rigged_auction_house',
    name: "Frankie's Rigged Auction House",
    family: 'RULE_BENDER_TWISTS',
    signatureStage: 'STAGE_01_VAUDEVILLE_PALACE',
    tagline: 'Secretly bid chips under crimson velvet cloches—beware rigged decoys.',
    symphonyTrack: 'curtain_overture',
    defaultTwist: 'HOST_BLIND_AUCTION',
    targetWinCondition: 'Out-bluff Frankie across 3 Broadway Mystery Cloche auctions.',
    nodeCount: 14,
    mechanicArchetype: 'SHELL_MONTE_BLUFF',
    accentPalette: { primaryHex: 0xc1121f, secondaryHex: 0x2b1612, gemHex: 0xffd166 },
    blueprint: {
      layoutKind: 'AUCTION_CLOCHE_HALL',
      customRuleSummary: 'Velvet-and-brass Vaudeville auction stage where mystery cloches hide x3 jackpots or fused lemons—bait Frankie into overpaying.',
      preferredDomains: [4, 3, 9, 0, 5, 8],
      defaultMaxTurns: 10,
      kineticSpeed: 0.95,
      supportsRingRotation: false,
      supportsConveyorShift: false,
      supportsEntangledPairs: false,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['HOST_BLIND_AUCTION', 'DOUBLE_AGENT_MOLE', 'SPLIT_OR_STEAL_VAULT'],
    },
  },
  {
    boardNumber: 99,
    slug: 'magnetic_repulsor_puck',
    name: 'Magnetic Repulsor Puck',
    family: 'RULE_BENDER_TWISTS',
    signatureStage: 'STAGE_02_GENEVA_CONSERVATORY',
    tagline: 'Rose-gold electromagnet flips polarity, slinging chips and rival claims away.',
    symphonyTrack: 'geneva_horology',
    defaultTwist: 'MAGNETIC_REPULSOR',
    targetWinCondition: 'Harness magnetic repulsion waves to sweep high-value outer poles.',
    nodeCount: 15,
    mechanicArchetype: 'BALANCE_SCALE',
    accentPalette: { primaryHex: 0xd4a59a, secondaryHex: 0xe9e4dc, gemHex: 0x3a86ff },
    blueprint: {
      layoutKind: 'MAGNETIC_REPULSOR_DISK',
      customRuleSummary: 'Carrara marble magnetic table with rotating dipole core; each claim reverses North/South field and pushes payout rings.',
      preferredDomains: [1, 6, 11, 3, 2, 0],
      defaultMaxTurns: 10,
      kineticSpeed: 1.25,
      supportsRingRotation: true,
      supportsConveyorShift: false,
      supportsEntangledPairs: true,
      supportsFloodElevation: false,
      supportsSpotlightCone: false,
      halftimeTwistPool: ['MAGNETIC_REPULSOR', 'GRAVITY_INVERSION', 'HIGH_VOLTAGE_CHAIN'],
    },
  },
  {
    boardNumber: 100,
    slug: 'sovereign_mind_reactor',
    name: 'The 100th Board: Sovereign Mind Reactor',
    family: 'RULE_BENDER_TWISTS',
    signatureStage: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    tagline: 'Three concentric golden reactor rings fuse twists into one ultimate boss.',
    symphonyTrack: 'colosseum_finale',
    defaultTwist: 'HIGH_VOLTAGE_CHAIN',
    targetWinCondition: 'Charge all 3 Sovereign Reactor Rings and win the Crown Showdown.',
    nodeCount: 18,
    mechanicArchetype: 'SPLIT_OR_STEAL_ARENA',
    accentPalette: { primaryHex: 0xffd700, secondaryHex: 0x100e14, gemHex: 0x00f5d4 },
    blueprint: {
      layoutKind: 'SOVEREIGN_MIND_REACTOR',
      customRuleSummary: 'Grand 100th Board: 3 counter-rotating gold rings, entangled conduits, rising climax twists & Split-or-Steal Sovereign Core.',
      preferredDomains: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      defaultMaxTurns: 12,
      kineticSpeed: 1.3,
      supportsRingRotation: true,
      supportsConveyorShift: true,
      supportsEntangledPairs: true,
      supportsFloodElevation: false,
      supportsSpotlightCone: true,
      halftimeTwistPool: [
        'SPLIT_OR_STEAL_VAULT',
        'GRAVITY_INVERSION',
        'BLACKOUT_SPOTLIGHT',
        'CHAIN_FUSE_DETONATION',
        'HIGH_VOLTAGE_CHAIN',
      ],
    },
  },
];

// Export clean immutable `BoardDefinitionV6[]` (Boards 51..100)
export const BOARD_CATALOG_051_TO_100: readonly BoardDefinitionV6[] = RAW_BOARDS_051_TO_100.map(
  (spec) => ({
    boardId: `board_${String(spec.boardNumber).padStart(3, '0')}_${spec.slug}`,
    boardNumber: spec.boardNumber,
    name: spec.name,
    family: spec.family,
    signatureStage: spec.signatureStage,
    tagline: spec.tagline,
    symphonyTrack: spec.symphonyTrack,
    defaultTwist: spec.defaultTwist,
    targetWinCondition: spec.targetWinCondition,
    nodeCount: spec.nodeCount,
    mechanicArchetype: spec.mechanicArchetype,
    accentPalette: spec.accentPalette,
  }),
);

export const BOARD_MAP_051_TO_100: ReadonlyMap<string, BoardDefinitionV6> = new Map(
  BOARD_CATALOG_051_TO_100.map((def) => [def.boardId, def]),
);

export const BOARD_BLUEPRINTS_051_TO_100: ReadonlyMap<string, BoardContraptionBlueprintB> = new Map(
  RAW_BOARDS_051_TO_100.map((spec) => {
    const boardId = `board_${String(spec.boardNumber).padStart(3, '0')}_${spec.slug}`;
    return [
      boardId,
      {
        boardId,
        ...spec.blueprint,
      },
    ];
  }),
);

export function getBoardDefinitionB(boardIdOrNumber: string | number): BoardDefinitionV6 | undefined {
  if (typeof boardIdOrNumber === 'number') {
    return BOARD_CATALOG_051_TO_100.find((b) => b.boardNumber === boardIdOrNumber);
  }
  return BOARD_MAP_051_TO_100.get(boardIdOrNumber);
}

export function getBoardBlueprintB(boardId: string): BoardContraptionBlueprintB | undefined {
  return BOARD_BLUEPRINTS_051_TO_100.get(boardId);
}

// ----------------------------------------------------------------------------
// 5. Distinct 3D Coordinate & Graph Topology Generator for Families VI–X
// ----------------------------------------------------------------------------

interface LayoutNodeSeed {
  pos3d: [number, number, number];
  ringIndex?: number;
  tierIndex?: number;
  neighbors: number[];
  baseChips: number;
  multBonus: number;
  difficultyOffset: number;
  lockedChains: number;
  isVault?: boolean;
}

function addUndirectedEdge(seeds: LayoutNodeSeed[], a: number, b: number): void {
  if (a === b || a < 0 || b < 0 || a >= seeds.length || b >= seeds.length) return;
  if (!seeds[a].neighbors.includes(b)) seeds[a].neighbors.push(b);
  if (!seeds[b].neighbors.includes(a)) seeds[b].neighbors.push(a);
}

function generateLayoutSeeds(
  def: BoardDefinitionV6,
  blueprint: BoardContraptionBlueprintB,
): LayoutNodeSeed[] {
  const n = def.nodeCount;
  const seeds: LayoutNodeSeed[] = [];

  switch (blueprint.layoutKind) {
    // 4-3-2-1 Stepped Gold Pyramid (10 nodes) & Escher Inverted Pyramid (12 nodes) & Ziggurat (13)
    case 'PYRAMID_4321':
    case 'ESCHER_INVERTED_PYRAMID':
    case 'ZIGGURAT_TERRACE':
    case 'HIGH_STRIKER_TOWER': {
      const tiers =
        blueprint.layoutKind === 'PYRAMID_4321'
          ? [4, 3, 2, 1]
          : blueprint.layoutKind === 'ESCHER_INVERTED_PYRAMID'
            ? [4, 4, 3, 1]
            : blueprint.layoutKind === 'ZIGGURAT_TERRACE'
              ? [5, 4, 3, 1]
              : [3, 3, 3, 2, 1];
      let idx = 0;
      const tierIndices: number[][] = [];
      for (let t = 0; t < tiers.length; t++) {
        const count = tiers[t];
        const row: number[] = [];
        const y = t * 0.78 - (tiers.length - 1) * 0.32;
        const z = (tiers.length - 1 - t) * 0.42 - 0.6;
        for (let c = 0; c < count; c++) {
          const x = (c - (count - 1) / 2) * 1.25;
          const isApex = t === tiers.length - 1;
          seeds.push({
            pos3d: [x, y, z],
            tierIndex: t,
            neighbors: [],
            baseChips: 150 + t * 120 + (isApex ? 250 : 0),
            multBonus: Number((0.25 * t + (isApex ? 1.0 : 0)).toFixed(2)),
            difficultyOffset: t * 0.55,
            lockedChains: t >= 2 ? 1 : 0,
            isVault: isApex,
          });
          row.push(idx++);
        }
        tierIndices.push(row);
      }
      for (let t = 0; t < tierIndices.length; t++) {
        const row = tierIndices[t];
        for (let c = 0; c < row.length - 1; c++) {
          addUndirectedEdge(seeds, row[c], row[c + 1]);
        }
        if (t + 1 < tierIndices.length) {
          const upper = tierIndices[t + 1];
          for (let u = 0; u < upper.length; u++) {
            const mapped = Math.min(row.length - 1, Math.floor((u * row.length) / upper.length));
            addUndirectedEdge(seeds, upper[u], row[mapped]);
            if (mapped + 1 < row.length) {
              addUndirectedEdge(seeds, upper[u], row[mapped + 1]);
            }
          }
        }
      }
      break;
    }

    // Dual-Belt Factory Conveyor / Hydro Spillway / Tin-Duck Gallery
    case 'CONVEYOR_DUAL_BELT':
    case 'SPILLWAY_DAM':
    case 'TIN_DUCK_GALLERY':
    case 'RING_TOSS_BOTTLES': {
      const rows = blueprint.layoutKind === 'CONVEYOR_DUAL_BELT' ? 2 : 3;
      const cols = Math.ceil(n / rows);
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const x = (c - (cols - 1) / 2) * 1.15;
        const y = blueprint.layoutKind === 'SPILLWAY_DAM' ? (rows - 1 - r) * 0.65 - 0.5 : (r - (rows - 1) / 2) * 0.22;
        const z = (r - (rows - 1) / 2) * 1.35;
        const isDangerEnd = c === cols - 1;
        seeds.push({
          pos3d: [x, y, z],
          tierIndex: r,
          ringIndex: c,
          neighbors: [],
          baseChips: 160 + c * 65 + (isDangerEnd ? 180 : 0),
          multBonus: isDangerEnd ? 0.75 : Number((r * 0.25).toFixed(2)),
          difficultyOffset: c * 0.3 + r * 0.25,
          lockedChains: isDangerEnd && r === 0 ? 1 : 0,
        });
      }
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        if (c + 1 < cols && i + 1 < n) addUndirectedEdge(seeds, i, i + 1);
        if (r + 1 < rows && i + cols < n) addUndirectedEdge(seeds, i, i + cols);
      }
      break;
    }

    // Vertical Ferris Wheel / Roller-Coaster Loop (Vertical XY ring!)
    case 'FERRIS_GONDOLA_WHEEL':
    case 'COASTER_LOOP': {
      const radius = 2.45;
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius + 0.35;
        const z = blueprint.layoutKind === 'COASTER_LOOP' ? Math.sin(angle * 2) * 0.65 : 0;
        const isZenith = i === Math.floor(n / 4) || i === Math.floor((3 * n) / 4);
        seeds.push({
          pos3d: [x, y, z],
          ringIndex: 0,
          tierIndex: y > 0.5 ? 2 : y > -0.8 ? 1 : 0,
          neighbors: [],
          baseChips: isZenith ? 360 : 180 + (i % 3) * 55,
          multBonus: isZenith ? 1.0 : 0.25,
          difficultyOffset: isZenith ? 1.2 : 0.35 * (i % 3),
          lockedChains: isZenith ? 1 : 0,
        });
      }
      for (let i = 0; i < n; i++) {
        addUndirectedEdge(seeds, i, (i + 1) % n);
        addUndirectedEdge(seeds, i, (i + Math.floor(n / 2)) % n);
      }
      break;
    }

    // Vertical 3-Shaft Elevators / Calliope Valves / Scaffold Tower / Bathysphere Trench
    case 'ELEVATOR_3_SHAFT':
    case 'CALLIOPE_VALVES':
    case 'SCAFFOLD_TOWER':
    case 'BATHYSPHERE_TRENCH':
    case 'PIPE_ORGAN_RANKS': {
      const shafts = blueprint.layoutKind === 'ELEVATOR_3_SHAFT' ? 3 : 4;
      const floors = Math.ceil(n / shafts);
      for (let i = 0; i < n; i++) {
        const s = i % shafts;
        const f = Math.floor(i / shafts);
        const x = (s - (shafts - 1) / 2) * 1.45;
        const y =
          blueprint.layoutKind === 'BATHYSPHERE_TRENCH'
            ? (floors - 1 - f) * 0.72 - 0.85
            : f * 0.72 - (floors - 1) * 0.35;
        const z = Math.sin(s * 1.2) * 0.35;
        const isTop = f === floors - 1;
        seeds.push({
          pos3d: [x, y, z],
          tierIndex: f,
          ringIndex: s,
          neighbors: [],
          baseChips: 160 + f * 95 + (isTop ? 120 : 0),
          multBonus: Number((f * 0.3 + (isTop ? 0.5 : 0)).toFixed(2)),
          difficultyOffset: f * 0.45,
          lockedChains: isTop && s === Math.floor(shafts / 2) ? 1 : 0,
        });
      }
      for (let i = 0; i < n; i++) {
        const s = i % shafts;
        const f = Math.floor(i / shafts);
        if (f + 1 < floors && i + shafts < n) addUndirectedEdge(seeds, i, i + shafts);
        if (s + 1 < shafts && i + 1 < n && Math.floor((i + 1) / shafts) === f) {
          addUndirectedEdge(seeds, i, i + 1);
        }
      }
      break;
    }

    // Concentric Rings: Armillary / Chariot Oval / Foundry Crucible / Tilt-a-Whirl / Sundial / Flood Island / Sovereign Reactor
    case 'ARMILLARY_3_RING':
    case 'CHARIOT_OVAL':
    case 'FOUNDRY_CRUCIBLE_RING':
    case 'TILT_WHIRL_CUPS':
    case 'SUNDIAL_SHADOW_DIAL':
    case 'FLOOD_ISLAND_RINGS':
    case 'MOLE_VAULT_RING':
    case 'SPLIT_STEAL_ARENA':
    case 'SUPERNOVA_CORE':
    case 'MAGNETIC_REPULSOR_DISK':
    case 'SOVEREIGN_MIND_REACTOR': {
      // Center vault/core at index 0
      seeds.push({
        pos3d: [0, 0.55, 0],
        ringIndex: 0,
        tierIndex: 2,
        neighbors: [],
        baseChips: 450,
        multBonus: 1.5,
        difficultyOffset: 1.5,
        lockedChains: 1,
        isVault: true,
      });
      const remaining = n - 1;
      const innerCount = Math.min(6, Math.max(4, Math.floor(remaining * 0.42)));
      const outerCount = remaining - innerCount;

      const isOval = blueprint.layoutKind === 'CHARIOT_OVAL';
      const isArmillary = blueprint.layoutKind === 'ARMILLARY_3_RING';
      const innerR = 1.48;
      const outerR = 2.75;

      for (let i = 0; i < innerCount; i++) {
        const a = (i / innerCount) * Math.PI * 2;
        const x = Math.cos(a) * innerR * (isOval ? 1.35 : 1);
        const z = Math.sin(a) * innerR * (isOval ? 0.78 : 1);
        const y = isArmillary ? Math.sin(a) * 0.75 + 0.15 : 0.22;
        seeds.push({
          pos3d: [x, y, z],
          ringIndex: 1,
          tierIndex: 1,
          neighbors: [],
          baseChips: 240 + (i % 2) * 60,
          multBonus: 0.5,
          difficultyOffset: 0.75,
          lockedChains: 0,
        });
      }
      for (let i = 0; i < outerCount; i++) {
        const a = (i / Math.max(1, outerCount)) * Math.PI * 2 + Math.PI / Math.max(1, outerCount);
        const x = Math.cos(a) * outerR * (isOval ? 1.32 : 1);
        const z = Math.sin(a) * outerR * (isOval ? 0.76 : 1);
        const y = isArmillary ? -Math.cos(a) * 0.85 : -0.1;
        seeds.push({
          pos3d: [x, y, z],
          ringIndex: 2,
          tierIndex: 0,
          neighbors: [],
          baseChips: 150 + (i % 3) * 45,
          multBonus: 0.25,
          difficultyOffset: 0.25 * (i % 3),
          lockedChains: 0,
        });
      }
      // Wire inner ring + center spokes
      for (let i = 0; i < innerCount; i++) {
        const curr = 1 + i;
        const next = 1 + ((i + 1) % innerCount);
        addUndirectedEdge(seeds, curr, next);
        addUndirectedEdge(seeds, 0, curr);
      }
      // Wire outer ring + radial spokes to inner ring
      for (let i = 0; i < outerCount; i++) {
        const curr = 1 + innerCount + i;
        const next = 1 + innerCount + ((i + 1) % outerCount);
        addUndirectedEdge(seeds, curr, next);
        const innerTarget = 1 + Math.floor((i * innerCount) / Math.max(1, outerCount));
        addUndirectedEdge(seeds, curr, innerTarget);
      }
      break;
    }

    // Entangled Binary / Quantum Pairs & Mirror Matrices
    case 'QUANTUM_ENTANGLED_PAIRS':
    case 'BINARY_TWIN_ORBIT':
    case 'TRICK_MIRROR_HALL':
    case 'MIRROR_TWIN_MATRIX': {
      const half = Math.floor(n / 2);
      for (let i = 0; i < n; i++) {
        const side = i < half ? -1 : 1;
        const localIdx = i < half ? i : i - half;
        const angle = (localIdx / Math.max(1, half)) * Math.PI * 2;
        const rx = 1.15;
        const rz = 1.65;
        const cx = side * 1.75;
        const x = cx + Math.cos(angle) * rx;
        const z = Math.sin(angle) * rz;
        const y = Math.sin(angle * 2) * 0.32;
        seeds.push({
          pos3d: [x, y, z],
          ringIndex: side < 0 ? 0 : 1,
          tierIndex: localIdx % 2,
          neighbors: [],
          baseChips: 190 + (localIdx % 3) * 70,
          multBonus: localIdx === 0 ? 0.75 : 0.35,
          difficultyOffset: 0.35 + (localIdx % 3) * 0.35,
          lockedChains: localIdx === 0 && side > 0 ? 1 : 0,
        });
      }
      for (let i = 0; i < half; i++) {
        addUndirectedEdge(seeds, i, (i + 1) % half);
        const twin = i + half;
        if (twin < n) {
          addUndirectedEdge(seeds, i, twin);
          const nextTwin = half + ((i + 1) % (n - half));
          if (nextTwin < n) addUndirectedEdge(seeds, twin, nextTwin);
        }
      }
      break;
    }

    // Suspension Span & Canyon Rope Bridge (Arcing 2-lane catenary)
    case 'SUSPENSION_SPAN':
    case 'ROPE_BRIDGE_CHASM': {
      const pairs = Math.ceil(n / 2);
      for (let i = 0; i < n; i++) {
        const step = Math.floor(i / 2);
        const lane = i % 2 === 0 ? -0.78 : 0.78;
        const u = pairs > 1 ? step / (pairs - 1) : 0.5;
        const x = (u - 0.5) * 5.2;
        const sag = -Math.sin(u * Math.PI) * 0.62;
        const pylonLift = step === 0 || step === pairs - 1 ? 0.45 : 0;
        const isCenter = Math.abs(u - 0.5) < 0.2;
        seeds.push({
          pos3d: [x, sag + pylonLift, lane],
          tierIndex: isCenter ? 2 : 1,
          ringIndex: step,
          neighbors: [],
          baseChips: isCenter ? 320 : 170 + step * 25,
          multBonus: isCenter ? 0.75 : 0.25,
          difficultyOffset: isCenter ? 1.0 : 0.35,
          lockedChains: isCenter && lane > 0 ? 1 : 0,
        });
      }
      for (let i = 0; i < n; i++) {
        if (i % 2 === 0 && i + 1 < n) addUndirectedEdge(seeds, i, i + 1);
        if (i + 2 < n) addUndirectedEdge(seeds, i, i + 2);
      }
      break;
    }

    // Prism Fan / Sextant Arc / Telescope Array / Constellation Loom / Meteor Shield / Auction & Heist Grids
    default: {
      const isRadialFan =
        blueprint.layoutKind === 'PRISM_WAVELENGTH_FAN' ||
        blueprint.layoutKind === 'SEXTANT_ARC' ||
        blueprint.layoutKind === 'METEOR_SHIELD_ARC' ||
        blueprint.layoutKind === 'AUTOMATON_BOOTH';
      if (isRadialFan) {
        // Emitter apex + fanned spectral arcs
        seeds.push({
          pos3d: [0, 0.35, 1.95],
          ringIndex: 0,
          tierIndex: 2,
          neighbors: [],
          baseChips: 380,
          multBonus: 1.0,
          difficultyOffset: 1.1,
          lockedChains: 0,
        });
        const rem = n - 1;
        const inner = Math.floor(rem / 2);
        const outer = rem - inner;
        for (let i = 0; i < inner; i++) {
          const t = inner > 1 ? i / (inner - 1) : 0.5;
          const a = -Math.PI * 0.38 + t * Math.PI * 0.76;
          seeds.push({
            pos3d: [Math.sin(a) * 2.1, 0.12, 1.95 - Math.cos(a) * 2.05],
            ringIndex: 1,
            tierIndex: 1,
            neighbors: [],
            baseChips: 210 + (i % 3) * 45,
            multBonus: 0.4,
            difficultyOffset: 0.55,
            lockedChains: 0,
          });
        }
        for (let i = 0; i < outer; i++) {
          const t = outer > 1 ? i / (outer - 1) : 0.5;
          const a = -Math.PI * 0.44 + t * Math.PI * 0.88;
          seeds.push({
            pos3d: [Math.sin(a) * 3.4, -0.08, 1.95 - Math.cos(a) * 3.45],
            ringIndex: 2,
            tierIndex: 0,
            neighbors: [],
            baseChips: 160 + (i % 4) * 55,
            multBonus: i === Math.floor(outer / 2) ? 0.85 : 0.25,
            difficultyOffset: 0.3 + (i % 3) * 0.3,
            lockedChains: i === Math.floor(outer / 2) ? 1 : 0,
          });
        }
        for (let i = 0; i < inner; i++) {
          addUndirectedEdge(seeds, 0, 1 + i);
          if (i + 1 < inner) addUndirectedEdge(seeds, 1 + i, 2 + i);
        }
        for (let i = 0; i < outer; i++) {
          const curr = 1 + inner + i;
          const innerParent = 1 + Math.min(inner - 1, Math.floor((i * inner) / Math.max(1, outer)));
          addUndirectedEdge(seeds, curr, innerParent);
          if (i + 1 < outer) addUndirectedEdge(seeds, curr, curr + 1);
        }
      } else {
        // Organic staggered expedition / constellation / heist grid
        const cols = n >= 16 ? 4 : n >= 13 ? 5 : 4;
        const rows = Math.ceil(n / cols);
        for (let i = 0; i < n; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const stagger = r % 2 === 1 ? 0.32 : -0.18;
          const x = (c - (cols - 1) / 2) * 1.32 + stagger;
          const z = (r - (rows - 1) / 2) * 1.28;
          const distCenter = Math.hypot(x, z);
          const y =
            blueprint.layoutKind === 'CONSTELLATION_LOOM' || blueprint.layoutKind === 'TIDAL_GRAVITY_WELL'
              ? Math.cos(distCenter * 0.75) * 0.52
              : 0.1 * ((r + c) % 2);
          const isCenterFocus = distCenter < 1.05;
          seeds.push({
            pos3d: [x, y, z],
            ringIndex: distCenter < 1.2 ? 0 : distCenter < 2.2 ? 1 : 2,
            tierIndex: rows - 1 - r,
            neighbors: [],
            baseChips: isCenterFocus ? 320 : 150 + ((r + c) % 4) * 55,
            multBonus: isCenterFocus ? 0.75 : 0.25,
            difficultyOffset: isCenterFocus ? 0.9 : 0.25 * (r % 3),
            lockedChains: isCenterFocus && r === 1 ? 1 : 0,
          });
        }
        for (let i = 0; i < n; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          if (c + 1 < cols && i + 1 < n) addUndirectedEdge(seeds, i, i + 1);
          if (r + 1 < rows && i + cols < n) addUndirectedEdge(seeds, i, i + cols);
          if (r + 1 < rows && c + 1 < cols && i + cols + 1 < n && (r + c) % 2 === 0) {
            addUndirectedEdge(seeds, i, i + cols + 1);
          }
        }
      }
      break;
    }
  }

  return seeds;
}

// ----------------------------------------------------------------------------
// 6. Hydrate Complete Playable `BoardRuntimeStateV6` for Any Board 51..100
// ----------------------------------------------------------------------------

export function buildBoardRuntimeStateB(
  boardOrId: BoardDefinitionV6 | string | number,
  options: BoardRuntimeInitOptionsB = {},
): BoardRuntimeStateV6 {
  const definition =
    typeof boardOrId === 'string' || typeof boardOrId === 'number'
      ? getBoardDefinitionB(boardOrId)
      : boardOrId;

  if (!definition) {
    throw new Error(`[BoardCatalog051To100] Unknown board identifier: ${String(boardOrId)}`);
  }

  const blueprint = getBoardBlueprintB(definition.boardId);
  if (!blueprint) {
    throw new Error(`[BoardCatalog051To100] Missing blueprint for board: ${definition.boardId}`);
  }

  const rng = createMulberry32(options.seed ?? hashStringToSeed(definition.boardId));
  const activeTwist: BoardTwistMutationIdV6 = options.overrideTwist ?? definition.defaultTwist;
  const stageDiff = options.stageDifficultyOffset ?? 0;
  const layoutSeeds = generateLayoutSeeds(definition, blueprint);

  const nodes: BoardNodeV6[] = layoutSeeds.map((seed, index) => {
    const domainId =
      blueprint.preferredDomains[(index + Math.floor(rng() * 2)) % blueprint.preferredDomains.length];
    const categoryLabel = DOMAIN_LABELS_V6[domainId] ?? 'GENERAL KNOWLEDGE';
    return {
      nodeId: `${definition.boardId}_n${String(index).padStart(2, '0')}`,
      index,
      categoryLabel,
      domainId,
      baseChips: seed.baseChips,
      multBonus: seed.multBonus,
      difficultyOffset: Number((seed.difficultyOffset + stageDiff).toFixed(2)),
      owner: seed.isVault && definition.boardNumber >= 93 ? 'LOCKED_VAULT' : 'NONE',
      lockedChains: seed.lockedChains,
      hasTrapFuse: false,
      isMysteryAuction: false,
      isDoubleAgentMole: false,
      ringIndex: seed.ringIndex,
      tierIndex: seed.tierIndex,
      neighbors: [],
      pos3d: seed.pos3d,
    };
  });

  // Resolve index neighbors into nodeIds
  for (let i = 0; i < layoutSeeds.length; i++) {
    nodes[i].neighbors = layoutSeeds[i].neighbors.map((neighborIdx) => nodes[neighborIdx].nodeId);
  }

  // Stamp initial twist-specific node flags cleanly (with zero-soft-lock guarantee!)
  const candidateIndices = nodes
    .map((node, idx) => ({ node, idx }))
    .filter((entry) => entry.node.owner === 'NONE')
    .map((entry) => entry.idx);

  const pickDistinct = (count: number, preferHighChips = false): number[] => {
    const pool = [...candidateIndices];
    if (preferHighChips) {
      pool.sort((a, b) => nodes[b].baseChips - nodes[a].baseChips);
    } else {
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
    }
    return pool.slice(0, Math.min(count, Math.max(0, pool.length - 2)));
  };

  if (activeTwist === 'DOUBLE_AGENT_MOLE') {
    for (const idx of pickDistinct(2, true)) {
      nodes[idx].isDoubleAgentMole = true;
      nodes[idx].baseChips = Math.max(nodes[idx].baseChips, 340); // Tempting gem bait!
    }
  } else if (activeTwist === 'HOST_BLIND_AUCTION') {
    for (const idx of pickDistinct(2, true)) {
      nodes[idx].isMysteryAuction = true;
    }
  } else if (activeTwist === 'CHAIN_FUSE_DETONATION') {
    for (const idx of pickDistinct(2, false)) {
      nodes[idx].hasTrapFuse = true;
    }
  }

  // Zero-soft-lock check: ensure at least 2 unlocked NONE nodes exist immediately
  let unlockedPlayable = nodes.filter((nd) => nd.owner === 'NONE' && nd.lockedChains === 0);
  if (unlockedPlayable.length < 2) {
    for (const nd of nodes) {
      if (nd.owner === 'NONE' && nd.lockedChains > 0) {
        nd.lockedChains = 0;
        unlockedPlayable = nodes.filter((x) => x.owner === 'NONE' && x.lockedChains === 0);
        if (unlockedPlayable.length >= 2) break;
      }
    }
  }

  const alignedNodeIds = nodes
    .filter((nd) => nd.ringIndex === 0 || nd.tierIndex === 2)
    .slice(0, 3)
    .map((nd) => nd.nodeId);

  return {
    definition,
    activeTwist,
    nodes,
    turnNumber: 1,
    maxTurns: options.maxTurns ?? blueprint.defaultMaxTurns,
    ringRotationsDeg: [0, 0, 0],
    alignedNodeIds,
    playerScoreChips: 0,
    playerMult: 1.0,
    playerTotalCash: 500,
    rivalTotalCash: 500,
    rivalName: options.rivalName ?? 'Frankie "The Fixer" Vance',
    streakCount: 0,
  };
}
