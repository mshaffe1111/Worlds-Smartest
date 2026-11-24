// ============================================================================
// WORLD'S SMARTEST v6.0 — 3D Game-Board Contraptions Catalog (Boards 001–050)
// Families I–V:
//   I.   CLOCKWORK_ROTARY    (Boards 001–010) — Stages 02 / 01
//   II.  TURF_WAR_BRIDGES    (Boards 011–020) — Stages 01 / 06
//   III. GRAVITY_PHYSICS     (Boards 021–030) — Stages 07 / 02
//   IV.  CASINO_PUSH_LUCK    (Boards 031–040) — Stage  03
//   V.   STEALTH_OPTICS_RADAR(Boards 041–050) — Stages 05 / 08
// Pure TypeScript, zero DOM/browser globals, deterministic topology builders.
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
// 1. Canonical 12 Corpus Domains (0 .. 11)
// ----------------------------------------------------------------------------
export interface CorpusDomainMetaV6 {
  readonly domainId: number;
  readonly label: string;
  readonly shortCode: string;
  readonly accentHex: number;
}

export const CORPUS_DOMAINS_V6: readonly CorpusDomainMetaV6[] = [
  { domainId: 0, label: 'HISTORY', shortCode: 'HIS', accentHex: 0xd9a84e },
  { domainId: 1, label: 'SCIENCE', shortCode: 'SCI', accentHex: 0x4ca8ff },
  { domainId: 2, label: 'WORLD ATLAS', shortCode: 'GEO', accentHex: 0x3ec9a7 },
  { domainId: 3, label: 'ARTS & CULTURE', shortCode: 'ART', accentHex: 0xe688b4 },
  { domainId: 4, label: 'POP & MEDIA', shortCode: 'POP', accentHex: 0xf06d7d },
  { domainId: 5, label: 'SPORTS & GAMES', shortCode: 'SPT', accentHex: 0xeba938 },
  { domainId: 6, label: 'INVENTIONS', shortCode: 'TEC', accentHex: 0x62d4ff },
  { domainId: 7, label: 'NATURE & BIO', shortCode: 'BIO', accentHex: 0x5fe076 },
  { domainId: 8, label: 'SOCIETY & LAW', shortCode: 'LAW', accentHex: 0xdfd0b0 },
  { domainId: 9, label: 'FOOD & CRAFT', shortCode: 'FOD', accentHex: 0xeb9e65 },
  { domainId: 10, label: 'MYTH & LORE', shortCode: 'MTH', accentHex: 0x9d8df8 },
  { domainId: 11, label: 'LOGIC & CIPHERS', shortCode: 'LOG', accentHex: 0xffe278 },
] as const;

// ----------------------------------------------------------------------------
// 2. Mechanical Contraption Sub-Variants & Extended Metadata
// ----------------------------------------------------------------------------
export type ContraptionSubVariantA =
  // Family I: CLOCKWORK_ROTARY (001–010)
  | 'ORRERY_TRIPLE_LASER'
  | 'TOURBILLON_ESCAPEMENT'
  | 'VAUDEVILLE_CURTAIN_TURNTABLE'
  | 'ASTROLABE_ECLIPSE'
  | 'TWIN_MESH_GEARS'
  | 'SAFE_FENCE_NOTCHES'
  | 'JUKEBOX_TONEARM'
  | 'GYROSCOPE_GIMBAL'
  | 'EPICYCLE_ORBITS'
  | 'CARILLON_CLOCKFACE'
  // Family II: TURF_WAR_BRIDGES (011–020)
  | 'HEX_IRON_BRIDGE'
  | 'KINTSUGI_GO_CAPTURE'
  | 'SUBWAY_EXPRESS_LINES'
  | 'ROSE_WINDOW_RADIAL'
  | 'CIRCUIT_BUS_POWER'
  | 'TUG_ROPE_TENSION'
  | 'CANAL_DRAW_SPANS'
  | 'CHECKERS_KING_LEAP'
  | 'SIEGE_CITADEL_CHAINS'
  | 'DIAMOND_RHOMBUS_WEB'
  // Family III: GRAVITY_PHYSICS (021–030)
  | 'PINBALL_CHROME_TABLE'
  | 'DOMINO_FORK_CASCADE'
  | 'PENDULUM_SWING_LEAF'
  | 'PACHINKO_PEG_FIELD'
  | 'APOTHECARY_TWIN_PAN'
  | 'VORTEX_HYPERBOLIC_FUNNEL'
  | 'PLINKO_PEG_WALL'
  | 'NEWTON_CRADLE_IMPULSE'
  | 'SEESAW_LAUNCH_ARM'
  | 'AVALANCHE_GRAVITY_CHUTE'
  // Family IV: CASINO_PUSH_LUCK (031–040)
  | 'BLACKJACK_21_SHOE'
  | 'ROULETTE_WHEEL_ROTOR'
  | 'MINESWEEPER_DEDUCTION'
  | 'THREE_SHELL_SHUFFLE'
  | 'CRAPS_DICE_POINT'
  | 'BACCARAT_NINE_SHOE'
  | 'AUCTION_GAVEL_BLOCK'
  | 'POKER_RIVER_HAND'
  | 'BANK_OR_BUST_RUNGS'
  | 'VIP_HIGH_LIMIT_SALON'
  // Family V: STEALTH_OPTICS_RADAR (041–050)
  | 'LASER_MIRROR_BENCH'
  | 'SONAR_PHOSPHOR_PPI'
  | 'NIXIE_BREAKER_RACK'
  | 'BATHYSPHERE_AIRLOCK_RINGS'
  | 'ENIGMA_STEPPED_ROTORS'
  | 'PERISCOPE_CROSSHAIR'
  | 'PRISM_RGB_DISPERSION'
  | 'SEARCHLIGHT_DUAL_BEAM'
  | 'XRAY_FLUOROSCOPE_BELT'
  | 'TRIANGULATION_DISH_NET';

export interface ClockworkParamsA {
  readonly ringCounts: readonly number[];       // Nodes per ring [outer, mid?, inner?]
  readonly ringRadii: readonly number[];        // Stage world radii (within <= 2.25m)
  readonly ringStepDeg: readonly [number, number, number];
  readonly gearRatios: readonly [number, number, number]; // Back-drive ratios when neighbor spins
  readonly alignmentMult: number;               // Multiplier when rings align on meridian
  readonly hasCurtainMask?: boolean;
  readonly hasEscapementWindow?: boolean;
  readonly hasTonearmSweep?: boolean;
  readonly isTwinSideBySide?: boolean;
  readonly isEpicycleSubGears?: boolean;
}

export interface TurfBridgeParamsA {
  readonly layoutKind:
    | 'HEX_19'
    | 'GO_WEB_19'
    | 'SUBWAY_16'
    | 'ROSE_19'
    | 'CIRCUIT_16'
    | 'ROPE_15'
    | 'CANAL_16'
    | 'CHECKERS_16'
    | 'SIEGE_17'
    | 'DIAMOND_17';
  readonly chainedIndices: readonly number[];
  readonly westPierIndices: readonly number[];
  readonly eastPierIndices: readonly number[];
  readonly bridgeBonusChips: number;
  readonly supportsEncirclementFlip?: boolean;
  readonly supportsKingLeapSteal?: boolean;
  readonly expressLineGroups?: readonly (readonly number[])[];
}

export interface GravityPhysicsParamsA {
  readonly contraptionKind:
    | 'PINBALL'
    | 'DOMINO'
    | 'PENDULUM'
    | 'PACHINKO'
    | 'BALANCE_SCALE'
    | 'VORTEX'
    | 'PLINKO'
    | 'NEWTON_CRADLE'
    | 'SEESAW'
    | 'AVALANCHE';
  readonly tiltDeg: number;
  readonly bumperPositions?: readonly [number, number][];
  readonly dominoPaths?: readonly (readonly number[])[];
  readonly weightGramsByIndex?: readonly number[];
  readonly cascadeMultPerLink: number;
}

export interface CasinoPushLuckParamsA {
  readonly tableGameKind:
    | 'BLACKJACK_21'
    | 'ROULETTE'
    | 'MINESWEEPER'
    | 'THREE_SHELL'
    | 'CRAPS'
    | 'BACCARAT'
    | 'BLIND_AUCTION'
    | 'POKER_RIVER'
    | 'LADDER_BUST'
    | 'VIP_HIGH_LIMIT';
  readonly targetTotal?: number;                // 21 for Blackjack, 9 for Baccarat
  readonly jackpotMult: number;
  readonly cardValuesByIndex?: readonly number[];
  readonly pokerLabelsByIndex?: readonly string[];
  readonly mineIndices?: readonly number[];
  readonly shellCupIndices?: readonly number[];
}

export interface StealthOpticsParamsA {
  readonly opticsKind:
    | 'LASER_MIRROR'
    | 'SONAR_PPI'
    | 'NIXIE_BREAKER'
    | 'BATHYSPHERE_AIRLOCK'
    | 'ENIGMA_ROTORS'
    | 'PERISCOPE_GRID'
    | 'PRISM_SPLITTER'
    | 'SEARCHLIGHT_YARD'
    | 'XRAY_BELT'
    | 'TRIANGULATION';
  readonly mirrorNodeIndices?: readonly number[];
  readonly initialMirrorAnglesDeg?: readonly number[];
  readonly emitterPos: readonly [number, number];
  readonly emitterDir: readonly [number, number];
  readonly bounceMultDelta: number;
  readonly sweepSpeedRadPerSec?: number;
  readonly dishAnchorIndices?: readonly number[];
}

export interface BoardContraptionSpecA {
  readonly definition: BoardDefinitionV6;
  readonly subVariant: ContraptionSubVariantA;
  readonly ruleBannerShort: string;             // <= 8 words for instant 2s player comprehension
  readonly baseChipScale: number;
  readonly domainRotationOffset: number;
  readonly clockwork?: ClockworkParamsA;
  readonly turf?: TurfBridgeParamsA;
  readonly gravity?: GravityPhysicsParamsA;
  readonly casino?: CasinoPushLuckParamsA;
  readonly stealth?: StealthOpticsParamsA;
}

// ----------------------------------------------------------------------------
// 3. Authoritative Specs for Boards 001 – 050
// ----------------------------------------------------------------------------
function makeDef(
  boardNumber: number,
  boardId: string,
  name: string,
  family: BoardFamilyIdV6,
  signatureStage: StageWorldIdV6,
  symphonyTrack: SymphonyTrackIdV6,
  mechanicArchetype: BoardDefinitionV6['mechanicArchetype'],
  defaultTwist: BoardTwistMutationIdV6,
  nodeCount: number,
  targetWinCondition: string,
  tagline: string,
  accentPalette: { primaryHex: number; secondaryHex: number; gemHex: number }
): BoardDefinitionV6 {
  return {
    boardId,
    boardNumber,
    name,
    family,
    signatureStage,
    tagline,
    symphonyTrack,
    defaultTwist,
    targetWinCondition,
    nodeCount,
    mechanicArchetype,
    accentPalette,
  };
}

const RAW_SPECS_001_TO_050: readonly BoardContraptionSpecA[] = [
  // ==========================================================================
  // FAMILY I: CLOCKWORK_ROTARY (Boards 001 – 010) — Stages 02 / 01
  // ==========================================================================
  {
    definition: makeDef(
      1,
      'board_001_clockwork_orrery',
      'The Grand Clockwork Orrery',
      'CLOCKWORK_ROTARY',
      'STAGE_02_GENEVA_CONSERVATORY',
      'geneva_horology',
      'CONCENTRIC_RINGS',
      'RICOCHET_LASER_BONUS',
      18,
      'Align 3 gear rings on meridian for x3',
      'Three rotating brass gear rings ignite a x3 ruby alignment laser.',
      { primaryHex: 0xd8ae52, secondaryHex: 0x3b4d6b, gemHex: 0xff3d5a }
    ),
    subVariant: 'ORRERY_TRIPLE_LASER',
    ruleBannerShort: 'Align 3 brass rings to fire x3 laser',
    baseChipScale: 100,
    domainRotationOffset: 0,
    clockwork: {
      ringCounts: [8, 6, 4],
      ringRadii: [2.05, 1.32, 0.65],
      ringStepDeg: [45, -60, 90],
      gearRatios: [1, -0.5, 0.5],
      alignmentMult: 3.0,
    },
  },
  {
    definition: makeDef(
      2,
      'board_002_geneva_tourbillon',
      'Geneva Tourbillon Escapement',
      'CLOCKWORK_ROTARY',
      'STAGE_02_GENEVA_CONSERVATORY',
      'geneva_horology',
      'CONCENTRIC_RINGS',
      'OVERCLOCK_DOUBLE_SPEED',
      16,
      'Strike vaults inside live escapement arc',
      'Rocking blued-steel anchor pallets gate North and South impulse vaults.',
      { primaryHex: 0xe3a87c, secondaryHex: 0x24426e, gemHex: 0x62d4ff }
    ),
    subVariant: 'TOURBILLON_ESCAPEMENT',
    ruleBannerShort: 'Claim nodes inside North/South pallet arc',
    baseChipScale: 110,
    domainRotationOffset: 1,
    clockwork: {
      ringCounts: [10, 6],
      ringRadii: [2.0, 1.08],
      ringStepDeg: [36, -60, 0],
      gearRatios: [1, -0.75, 0],
      alignmentMult: 2.5,
      hasEscapementWindow: true,
    },
  },
  {
    definition: makeDef(
      3,
      'board_003_vaudeville_revolving_stage',
      'Vaudeville Revolving Stage',
      'CLOCKWORK_ROTARY',
      'STAGE_01_VAUDEVILLE_PALACE',
      'curtain_overture',
      'CONCENTRIC_RINGS',
      'BLACKOUT_SPOTLIGHT',
      15,
      'Harvest backstage tiles charged under curtain',
      'Mahogany turntable hides rear nodes behind velvet curtains to build bonus chips.',
      { primaryHex: 0xd4a442, secondaryHex: 0x8b1e2d, gemHex: 0xffd268 }
    ),
    subVariant: 'VAUDEVILLE_CURTAIN_TURNTABLE',
    ruleBannerShort: 'Curtained tiles gain +150 each spin',
    baseChipScale: 100,
    domainRotationOffset: 2,
    clockwork: {
      ringCounts: [9, 6],
      ringRadii: [1.96, 1.05],
      ringStepDeg: [40, 60, 0],
      gearRatios: [1, 0.5, 0],
      alignmentMult: 2.4,
      hasCurtainMask: true,
    },
  },
  {
    definition: makeDef(
      4,
      'board_004_astrolabe_eclipse_rings',
      'Astrolabe Eclipse Rings',
      'CLOCKWORK_ROTARY',
      'STAGE_02_GENEVA_CONSERVATORY',
      'geneva_horology',
      'CONCENTRIC_RINGS',
      'MIRROR_TWIN_LINK',
      16,
      'Trigger triple-ring solar eclipse conjunction',
      'Eccentric brass meridian arcs align for double-payout eclipse turns.',
      { primaryHex: 0xcfa44e, secondaryHex: 0x263554, gemHex: 0xffa63d }
    ),
    subVariant: 'ASTROLABE_ECLIPSE',
    ruleBannerShort: 'Line up brass meridian arcs for x2.8',
    baseChipScale: 115,
    domainRotationOffset: 3,
    clockwork: {
      ringCounts: [8, 5, 3],
      ringRadii: [2.04, 1.32, 0.64],
      ringStepDeg: [45, 72, -120],
      gearRatios: [1, -0.6, 0.8],
      alignmentMult: 2.8,
    },
  },
  {
    definition: makeDef(
      5,
      'board_005_twin_cuckoo_pendulums',
      'Twin Cuckoo Pendulum Gears',
      'CLOCKWORK_ROTARY',
      'STAGE_02_GENEVA_CONSERVATORY',
      'geneva_horology',
      'CONCENTRIC_RINGS',
      'CHAIN_FUSE_DETONATION',
      16,
      'Mesh both wheels on center x3 pinion',
      'Two counter-spinning cuckoo wheels interlock at a volatile x3 contact tooth.',
      { primaryHex: 0xcf9b4c, secondaryHex: 0x5c3621, gemHex: 0xff5a4f }
    ),
    subVariant: 'TWIN_MESH_GEARS',
    ruleBannerShort: 'Sync twin wheels at center x3 pinion',
    baseChipScale: 110,
    domainRotationOffset: 4,
    clockwork: {
      ringCounts: [8, 8],
      ringRadii: [0.94, 0.94],
      ringStepDeg: [45, -45, 0],
      gearRatios: [1, -1, 0],
      alignmentMult: 3.0,
      isTwinSideBySide: true,
    },
  },
  {
    definition: makeDef(
      6,
      'board_006_safe_vault_combination',
      'Safe-Vault Combination Wheel',
      'CLOCKWORK_ROTARY',
      'STAGE_01_VAUDEVILLE_PALACE',
      'curtain_overture',
      'CONCENTRIC_RINGS',
      'GOLDEN_BOUNTY_HUNT',
      15,
      'Drop all 3 steel notches onto vault bolt',
      'Spin three milled tumbler wheels until the bolt cracks the bullion core.',
      { primaryHex: 0xbac3ce, secondaryHex: 0x2c3442, gemHex: 0xffd75e }
    ),
    subVariant: 'SAFE_FENCE_NOTCHES',
    ruleBannerShort: 'Align 3 milled tumbler gates for Vault',
    baseChipScale: 120,
    domainRotationOffset: 5,
    clockwork: {
      ringCounts: [6, 5, 4],
      ringRadii: [2.02, 1.32, 0.68],
      ringStepDeg: [60, -72, 90],
      gearRatios: [1, 0, 0],
      alignmentMult: 3.5,
    },
  },
  {
    definition: makeDef(
      7,
      'board_007_vinyl_jukebox_turntable',
      'Vinyl Jukebox Turntable',
      'CLOCKWORK_ROTARY',
      'STAGE_01_VAUDEVILLE_PALACE',
      'curtain_overture',
      'CONCENTRIC_RINGS',
      'OVERCLOCK_DOUBLE_SPEED',
      16,
      'Claim vinyl grooves under the live needle',
      'Sweeping brass tonearm supercharges grooves directly under the diamond stylus.',
      { primaryHex: 0xe3b859, secondaryHex: 0x16161d, gemHex: 0xff4d79 }
    ),
    subVariant: 'JUKEBOX_TONEARM',
    ruleBannerShort: 'Solve tracks under brass tonearm needle',
    baseChipScale: 105,
    domainRotationOffset: 6,
    clockwork: {
      ringCounts: [8, 5, 3],
      ringRadii: [2.02, 1.32, 0.65],
      ringStepDeg: [30, 30, 30],
      gearRatios: [1, 1, 1],
      alignmentMult: 2.5,
      hasTonearmSweep: true,
    },
  },
  {
    definition: makeDef(
      8,
      'board_008_compass_rose_gyroscope',
      'Compass Rose Gyroscope',
      'CLOCKWORK_ROTARY',
      'STAGE_02_GENEVA_CONSERVATORY',
      'geneva_horology',
      'CONCENTRIC_RINGS',
      'MAGNETIC_REPULSOR',
      17,
      'Capture nodes on dipping magnetic pole',
      'Tilting Cardan gimbal doubles chips across the active magnetic hemisphere.',
      { primaryHex: 0xdba94b, secondaryHex: 0x1d4e56, gemHex: 0x4de6c6 }
    ),
    subVariant: 'GYROSCOPE_GIMBAL',
    ruleBannerShort: 'Dipping magnetic compass pole pays x2',
    baseChipScale: 115,
    domainRotationOffset: 7,
    clockwork: {
      ringCounts: [8, 8, 1],
      ringRadii: [2.05, 1.15, 0.0],
      ringStepDeg: [45, -45, 0],
      gearRatios: [1, -0.5, 0],
      alignmentMult: 2.25,
    },
  },
  {
    definition: makeDef(
      9,
      'board_009_planetary_epicycle',
      'Planetary Epicycle',
      'CLOCKWORK_ROTARY',
      'STAGE_02_GENEVA_CONSERVATORY',
      'geneva_horology',
      'CONCENTRIC_RINGS',
      'GRAVITY_INVERSION',
      16,
      'Chain orbital syzygy across mini-gears',
      'Three orbiting satellite sub-gears link dynamically on planetary conjunctions.',
      { primaryHex: 0xe6be67, secondaryHex: 0x252c4a, gemHex: 0x9b8cff }
    ),
    subVariant: 'EPICYCLE_ORBITS',
    ruleBannerShort: 'Hit satellite syzygy for bonus chain',
    baseChipScale: 120,
    domainRotationOffset: 8,
    clockwork: {
      ringCounts: [12, 4],
      ringRadii: [1.85, 0.62],
      ringStepDeg: [30, -90, 60],
      gearRatios: [1, -1.5, 0.5],
      alignmentMult: 2.75,
      isEpicycleSubGears: true,
    },
  },
  {
    definition: makeDef(
      10,
      'board_010_midnight_chime_carillon',
      'Midnight Chime Carillon',
      'CLOCKWORK_ROTARY',
      'STAGE_01_VAUDEVILLE_PALACE',
      'curtain_overture',
      'CONCENTRIC_RINGS',
      'CURSED_MULTIPLIER_DECAY',
      12,
      'Ring live chime bell before midnight strikes',
      'Twelve cast-bronze clock bells amplify whichever hour the striker hammer hits.',
      { primaryHex: 0xe2b24e, secondaryHex: 0x3b221a, gemHex: 0xffe478 }
    ),
    subVariant: 'CARILLON_CLOCKFACE',
    ruleBannerShort: 'Strike lit clock-hour bell for x3 chime',
    baseChipScale: 130,
    domainRotationOffset: 9,
    clockwork: {
      ringCounts: [12],
      ringRadii: [1.92],
      ringStepDeg: [30, 0, 0],
      gearRatios: [1, 0, 0],
      alignmentMult: 3.0,
      hasTonearmSweep: true,
    },
  },

  // ==========================================================================
  // FAMILY II: TURF_WAR_BRIDGES (Boards 011 – 020) — Stages 01 / 06
  // ==========================================================================
  {
    definition: makeDef(
      11,
      'board_011_hexagon_bridge_turf_war',
      'Hexagon Bridge Turf-War',
      'TURF_WAR_BRIDGES',
      'STAGE_01_VAUDEVILLE_PALACE',
      'curtain_overture',
      'HEX_TURF_BRIDGE',
      'HIGH_VOLTAGE_CHAIN',
      19,
      'Bridge West pier to East pier first',
      '19 beveled crystal hexes with shatterable 3D iron chains guarding the span.',
      { primaryHex: 0xd9af54, secondaryHex: 0x162238, gemHex: 0x38d9ff }
    ),
    subVariant: 'HEX_IRON_BRIDGE',
    ruleBannerShort: 'Shatter chains & connect West to East',
    baseChipScale: 105,
    domainRotationOffset: 1,
    turf: {
      layoutKind: 'HEX_19',
      chainedIndices: [9, 4, 14],
      westPierIndices: [0, 1, 2],
      eastPierIndices: [16, 17, 18],
      bridgeBonusChips: 1200,
    },
  },
  {
    definition: makeDef(
      12,
      'board_012_kyoto_kintsugi_go_web',
      'Kyoto Kintsugi Stone Go-Web',
      'TURF_WAR_BRIDGES',
      'STAGE_06_KYOTO_LACQUER_PAVILION',
      'kyoto_nocturne',
      'HEX_TURF_BRIDGE',
      'MIRROR_TWIN_LINK',
      19,
      'Surround rival lacquer stones to flip them',
      'Urushi stone web linked by molten gold seams flips encircled rival clusters.',
      { primaryHex: 0xe6be5c, secondaryHex: 0xa61f1f, gemHex: 0xffd25a }
    ),
    subVariant: 'KINTSUGI_GO_CAPTURE',
    ruleBannerShort: 'Encircle rival stones to flip via gold',
    baseChipScale: 115,
    domainRotationOffset: 2,
    turf: {
      layoutKind: 'GO_WEB_19',
      chainedIndices: [9],
      westPierIndices: [0, 1, 2],
      eastPierIndices: [16, 17, 18],
      bridgeBonusChips: 1100,
      supportsEncirclementFlip: true,
    },
  },
  {
    definition: makeDef(
      13,
      'board_013_subway_express_takeover',
      'Subway Express Takeover',
      'TURF_WAR_BRIDGES',
      'STAGE_01_VAUDEVILLE_PALACE',
      'curtain_overture',
      'SUBWAY_NETWORK',
      'OVERCLOCK_DOUBLE_SPEED',
      16,
      'Claim both line terminals to electrify route',
      'Three intersecting transit lines cascade bonus claims across connected stations.',
      { primaryHex: 0xdba748, secondaryHex: 0x263547, gemHex: 0xff6b3d }
    ),
    subVariant: 'SUBWAY_EXPRESS_LINES',
    ruleBannerShort: 'Own express terminals to surge the line',
    baseChipScale: 110,
    domainRotationOffset: 3,
    turf: {
      layoutKind: 'SUBWAY_16',
      chainedIndices: [5, 10],
      westPierIndices: [0, 4, 8, 12],
      eastPierIndices: [3, 7, 11, 15],
      bridgeBonusChips: 1050,
      expressLineGroups: [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
      ],
    },
  },
  {
    definition: makeDef(
      14,
      'board_014_stained_glass_rose_window',
      'Stained-Glass Rose Window',
      'TURF_WAR_BRIDGES',
      'STAGE_01_VAUDEVILLE_PALACE',
      'curtain_overture',
      'HEX_TURF_BRIDGE',
      'GOLDEN_BOUNTY_HUNT',
      19,
      'Light a full petal ray into center Oculus',
      'Backlit cathedral glass shards award x3 when spanning outer rim to Oculus.',
      { primaryHex: 0xe3b659, secondaryHex: 0x3b1d5e, gemHex: 0xff5ca8 }
    ),
    subVariant: 'ROSE_WINDOW_RADIAL',
    ruleBannerShort: 'Complete any radial ray to center Oculus',
    baseChipScale: 115,
    domainRotationOffset: 4,
    turf: {
      layoutKind: 'ROSE_19',
      chainedIndices: [0],
      westPierIndices: [7, 8, 9, 10, 11, 12],
      eastPierIndices: [0],
      bridgeBonusChips: 1250,
    },
  },
  {
    definition: makeDef(
      15,
      'board_015_circuit_trace_crossfire',
      'Circuit-Trace Crossfire',
      'TURF_WAR_BRIDGES',
      'STAGE_01_VAUDEVILLE_PALACE',
      'curtain_overture',
      'SUBWAY_NETWORK',
      'HIGH_VOLTAGE_CHAIN',
      16,
      'Sever rival traces from central dynamo',
      'Copper stage-bus traces double powered loops and brown out severed nodes.',
      { primaryHex: 0xd98e43, secondaryHex: 0x16362d, gemHex: 0x52ffb8 }
    ),
    subVariant: 'CIRCUIT_BUS_POWER',
    ruleBannerShort: 'Link dynamo loops; sever rival traces',
    baseChipScale: 115,
    domainRotationOffset: 5,
    turf: {
      layoutKind: 'CIRCUIT_16',
      chainedIndices: [5, 6, 9, 10],
      westPierIndices: [0, 4, 8, 12],
      eastPierIndices: [3, 7, 11, 15],
      bridgeBonusChips: 1150,
      supportsEncirclementFlip: true,
    },
  },
  {
    definition: makeDef(
      16,
      'board_016_tug_of_war_rope_span',
      'Tug-of-War Rope Span',
      'TURF_WAR_BRIDGES',
      'STAGE_01_VAUDEVILLE_PALACE',
      'curtain_overture',
      'HEX_TURF_BRIDGE',
      'SUDDEN_TRAPDOOR_HAZARD',
      15,
      'Haul crimson rope knot 3 notches home',
      'Braided brass rigging hauls the crimson center ribbon home on every hit.',
      { primaryHex: 0xd69f4c, secondaryHex: 0x6e2020, gemHex: 0xff3b3b }
    ),
    subVariant: 'TUG_ROPE_TENSION',
    ruleBannerShort: 'Haul crimson knot 3 notches to win',
    baseChipScale: 105,
    domainRotationOffset: 6,
    turf: {
      layoutKind: 'ROPE_15',
      chainedIndices: [7],
      westPierIndices: [0, 5, 10],
      eastPierIndices: [4, 9, 14],
      bridgeBonusChips: 1000,
    },
  },
  {
    definition: makeDef(
      17,
      'board_017_venetian_canal_bridges',
      'Venetian Canal Bridges',
      'TURF_WAR_BRIDGES',
      'STAGE_06_KYOTO_LACQUER_PAVILION',
      'kyoto_nocturne',
      'SUBWAY_NETWORK',
      'RISING_FLOOD_STAGE',
      16,
      'Cross toggling footbridges to seize locks',
      'Stone islets linked by shifting timber spans reward flanking lock control.',
      { primaryHex: 0xd8b15f, secondaryHex: 0x164454, gemHex: 0x45e3d8 }
    ),
    subVariant: 'CANAL_DRAW_SPANS',
    ruleBannerShort: 'Capture central canal locks across spans',
    baseChipScale: 110,
    domainRotationOffset: 7,
    turf: {
      layoutKind: 'CANAL_16',
      chainedIndices: [5, 10],
      westPierIndices: [0, 4, 8, 12],
      eastPierIndices: [3, 7, 11, 15],
      bridgeBonusChips: 1100,
    },
  },
  {
    definition: makeDef(
      18,
      'board_018_checkers_king_leap',
      'Checkers King Leap',
      'TURF_WAR_BRIDGES',
      'STAGE_06_KYOTO_LACQUER_PAVILION',
      'kyoto_nocturne',
      'HEX_TURF_BRIDGE',
      'DOUBLE_AGENT_MOLE',
      16,
      'Leap diagonally past rival to steal chips',
      'Diagonal lacquer arena lets you leap rival squares to siphon 250 chips.',
      { primaryHex: 0xe2b658, secondaryHex: 0x201518, gemHex: 0xff4c3b }
    ),
    subVariant: 'CHECKERS_KING_LEAP',
    ruleBannerShort: 'Jump across rival squares to steal +250',
    baseChipScale: 110,
    domainRotationOffset: 8,
    turf: {
      layoutKind: 'CHECKERS_16',
      chainedIndices: [6, 9],
      westPierIndices: [0, 4, 8, 12],
      eastPierIndices: [3, 7, 11, 15],
      bridgeBonusChips: 1150,
      supportsKingLeapSteal: true,
    },
  },
  {
    definition: makeDef(
      19,
      'board_019_siege_battlement',
      'Siege Battlement',
      'TURF_WAR_BRIDGES',
      'STAGE_06_KYOTO_LACQUER_PAVILION',
      'kyoto_nocturne',
      'HEX_TURF_BRIDGE',
      'CHAIN_FUSE_DETONATION',
      17,
      'Breach two gatehouse locks to take Keep',
      'Double-chained Citadel Keep guarded by stone rampart rings and flanking bastions.',
      { primaryHex: 0xc99c4a, secondaryHex: 0x3b2c2a, gemHex: 0xff8a3d }
    ),
    subVariant: 'SIEGE_CITADEL_CHAINS',
    ruleBannerShort: 'Break outer gate locks to storm Keep',
    baseChipScale: 120,
    domainRotationOffset: 9,
    turf: {
      layoutKind: 'SIEGE_17',
      chainedIndices: [0, 1, 3, 5],
      westPierIndices: [9, 10, 11, 12],
      eastPierIndices: [0],
      bridgeBonusChips: 1400,
    },
  },
  {
    definition: makeDef(
      20,
      'board_020_diamond_lattice_duel',
      'Diamond Lattice Duel',
      'TURF_WAR_BRIDGES',
      'STAGE_06_KYOTO_LACQUER_PAVILION',
      'kyoto_nocturne',
      'HEX_TURF_BRIDGE',
      'SPLIT_OR_STEAL_VAULT',
      17,
      'Close any 4-facet diamond loop for x2.5',
      'Beveled obsidian rhombus lattice crystallizes any closed 4-tile diamond loop.',
      { primaryHex: 0xe6c36c, secondaryHex: 0x1a1e33, gemHex: 0xb882ff }
    ),
    subVariant: 'DIAMOND_RHOMBUS_WEB',
    ruleBannerShort: 'Complete a 4-facet diamond loop for x2.5',
    baseChipScale: 120,
    domainRotationOffset: 10,
    turf: {
      layoutKind: 'DIAMOND_17',
      chainedIndices: [8],
      westPierIndices: [0, 1, 4],
      eastPierIndices: [12, 15, 16],
      bridgeBonusChips: 1200,
      supportsEncirclementFlip: true,
    },
  },

  // ==========================================================================
  // FAMILY III: GRAVITY_PHYSICS (Boards 021 – 030) — Stages 07 / 02
  // ==========================================================================
  {
    definition: makeDef(
      21,
      'board_021_pinball_bumper_drop',
      'Pinball Bumper Drop',
      'GRAVITY_PHYSICS',
      'STAGE_07_CARNIVAL_CURIOSITIES',
      'carnival_accelerando',
      'PINBALL_DROP',
      'RICOCHET_LASER_BONUS',
      15,
      'Ricochet chrome ball through bumpers to score',
      'Chrome steel ball bounces off lit brass pop-bumpers for +75 per hit.',
      { primaryHex: 0xd98a4a, secondaryHex: 0x1d2b3a, gemHex: 0xff4769 }
    ),
    subVariant: 'PINBALL_CHROME_TABLE',
    ruleBannerShort: 'Chrome ball bounces bumpers for +75 each',
    baseChipScale: 110,
    domainRotationOffset: 2,
    gravity: {
      contraptionKind: 'PINBALL',
      tiltDeg: 9,
      bumperPositions: [
        [-1.05, -0.7],
        [0.0, -0.95],
        [1.05, -0.7],
        [-0.55, 0.05],
        [0.55, 0.05],
      ],
      cascadeMultPerLink: 0.3,
    },
  },
  {
    definition: makeDef(
      22,
      'board_022_domino_chain_reaction',
      'Domino Chain Reaction',
      'GRAVITY_PHYSICS',
      'STAGE_02_GENEVA_CONSERVATORY',
      'geneva_horology',
      'DOMINO_CHAIN',
      'CHAIN_FUSE_DETONATION',
      16,
      'Topple longest ivory domino chain cascade',
      'Standing ivory-and-brass 3D dominoes fall in forked runs multiplying +0.35x each.',
      { primaryHex: 0xf2ead7, secondaryHex: 0xc99c42, gemHex: 0xffb347 }
    ),
    subVariant: 'DOMINO_FORK_CASCADE',
    ruleBannerShort: 'Topple linked dominoes for +0.35x chain',
    baseChipScale: 105,
    domainRotationOffset: 3,
    gravity: {
      contraptionKind: 'DOMINO',
      tiltDeg: 0,
      dominoPaths: [
        [0, 1, 2, 3, 4, 5],
        [2, 6, 7, 8, 9, 10],
        [7, 11, 12, 13, 14, 15],
      ],
      cascadeMultPerLink: 0.35,
    },
  },
  {
    definition: makeDef(
      23,
      'board_023_pendulum_drawbridge',
      'Pendulum Drawbridge',
      'GRAVITY_PHYSICS',
      'STAGE_02_GENEVA_CONSERVATORY',
      'geneva_horology',
      'PENDULUM_BRIDGE',
      'OVERCLOCK_DOUBLE_SPEED',
      15,
      'Cross center bridge at dead-center swing',
      'Swinging brass counterweight locks alternating bridge leaves; dead-center pays x2.5.',
      { primaryHex: 0xdba94b, secondaryHex: 0x3b2c26, gemHex: 0x57d8ff }
    ),
    subVariant: 'PENDULUM_SWING_LEAF',
    ruleBannerShort: 'Strike center vault on pendulum zenith',
    baseChipScale: 115,
    domainRotationOffset: 4,
    gravity: {
      contraptionKind: 'PENDULUM',
      tiltDeg: 0,
      cascadeMultPerLink: 0.4,
    },
  },
  {
    definition: makeDef(
      24,
      'board_024_pachinko_brass_pegboard',
      'Pachinko Brass Pegboard',
      'GRAVITY_PHYSICS',
      'STAGE_07_CARNIVAL_CURIOSITIES',
      'carnival_accelerando',
      'PINBALL_DROP',
      'GOLDEN_BOUNTY_HUNT',
      16,
      'Deflect steel marble into brass tulip pocket',
      'Rattling brass nail lattice funnels steel balls into x3 illuminated tulip cups.',
      { primaryHex: 0xe3b14f, secondaryHex: 0x261d2e, gemHex: 0x3bf0c2 }
    ),
    subVariant: 'PACHINKO_PEG_FIELD',
    ruleBannerShort: 'Drop ball through brass pegs into tulips',
    baseChipScale: 110,
    domainRotationOffset: 5,
    gravity: {
      contraptionKind: 'PACHINKO',
      tiltDeg: 11,
      bumperPositions: [
        [-1.1, -0.8],
        [-0.36, -0.8],
        [0.36, -0.8],
        [1.1, -0.8],
        [-0.72, -0.15],
        [0.0, -0.15],
        [0.72, -0.15],
      ],
      cascadeMultPerLink: 0.3,
    },
  },
  {
    definition: makeDef(
      25,
      'board_025_balance_beam_apothecary',
      'Balance-Beam Apothecary Scale',
      'GRAVITY_PHYSICS',
      'STAGE_02_GENEVA_CONSERVATORY',
      'geneva_horology',
      'BALANCE_SCALE',
      'GRAVITY_INVERSION',
      14,
      'Hold brass scale level for x2.5 Alchemy',
      'Weighted ingots tilt twin apothecary pans; hold level balance for x2.5 Alchemy.',
      { primaryHex: 0xd9b15b, secondaryHex: 0x264038, gemHex: 0x6bffa8 }
    ),
    subVariant: 'APOTHECARY_TWIN_PAN',
    ruleBannerShort: 'Keep twin brass pans balanced for x2.5',
    baseChipScale: 115,
    domainRotationOffset: 6,
    gravity: {
      contraptionKind: 'BALANCE_SCALE',
      tiltDeg: 0,
      weightGramsByIndex: [100, 150, 200, 250, 300, 350, 400, 100, 150, 200, 250, 300, 350, 400],
      cascadeMultPerLink: 0.45,
    },
  },
  {
    definition: makeDef(
      26,
      'board_026_marble_vortex_funnel',
      'Marble Vortex Funnel',
      'GRAVITY_PHYSICS',
      'STAGE_07_CARNIVAL_CURIOSITIES',
      'carnival_accelerando',
      'PINBALL_DROP',
      'CURSED_MULTIPLIER_DECAY',
      16,
      'Spiral inward to claim x3 abyss socket',
      'Chrome marble orbits faster down a spun-brass hyperbolic funnel toward x3 core.',
      { primaryHex: 0xd4964c, secondaryHex: 0x16293d, gemHex: 0x52c8ff }
    ),
    subVariant: 'VORTEX_HYPERBOLIC_FUNNEL',
    ruleBannerShort: 'Ride marble spiral down to x3 core',
    baseChipScale: 115,
    domainRotationOffset: 7,
    gravity: {
      contraptionKind: 'VORTEX',
      tiltDeg: 0,
      cascadeMultPerLink: 0.35,
    },
  },
  {
    definition: makeDef(
      27,
      'board_027_plinko_multiplier_wall',
      'Plinko Multiplier Wall',
      'GRAVITY_PHYSICS',
      'STAGE_07_CARNIVAL_CURIOSITIES',
      'carnival_accelerando',
      'PINBALL_DROP',
      'SUDDEN_TRAPDOOR_HAZARD',
      15,
      'Drop brass puck into x4 bottom bin',
      'Staggered brass pegs deflect falling pucks into x1 through x4 collector chutes.',
      { primaryHex: 0xe3a84a, secondaryHex: 0x451a2b, gemHex: 0xffd24d }
    ),
    subVariant: 'PLINKO_PEG_WALL',
    ruleBannerShort: 'Bounce brass puck into x4 center chute',
    baseChipScale: 110,
    domainRotationOffset: 8,
    gravity: {
      contraptionKind: 'PLINKO',
      tiltDeg: 10,
      bumperPositions: [
        [0, -0.95],
        [-0.6, -0.45],
        [0.6, -0.45],
        [-1.1, 0.05],
        [0, 0.05],
        [1.1, 0.05],
      ],
      cascadeMultPerLink: 0.35,
    },
  },
  {
    definition: makeDef(
      28,
      'board_028_newtons_cradle_momentum',
      "Newton's Cradle Momentum",
      'GRAVITY_PHYSICS',
      'STAGE_02_GENEVA_CONSERVATORY',
      'geneva_horology',
      'PENDULUM_BRIDGE',
      'MIRROR_TWIN_LINK',
      15,
      'Swing outer sphere to shatter opposite end',
      'Suspended steel spheres transfer elastic momentum directly across owned middle vaults.',
      { primaryHex: 0xd0d8e2, secondaryHex: 0x3b2c1e, gemHex: 0x82d8ff }
    ),
    subVariant: 'NEWTON_CRADLE_IMPULSE',
    ruleBannerShort: 'Link middle spheres to smash end vault',
    baseChipScale: 120,
    domainRotationOffset: 9,
    gravity: {
      contraptionKind: 'NEWTON_CRADLE',
      tiltDeg: 0,
      cascadeMultPerLink: 0.4,
    },
  },
  {
    definition: makeDef(
      29,
      'board_029_seesaw_catapult',
      'Seesaw Catapult',
      'GRAVITY_PHYSICS',
      'STAGE_07_CARNIVAL_CURIOSITIES',
      'carnival_accelerando',
      'BALANCE_SCALE',
      'MAGNETIC_REPULSOR',
      14,
      'Slam low plank to catapult high targets',
      'Dropping heavy brass weights onto the fulcrum flings chips into chained vaults.',
      { primaryHex: 0xd98744, secondaryHex: 0x33221c, gemHex: 0xff6e40 }
    ),
    subVariant: 'SEESAW_LAUNCH_ARM',
    ruleBannerShort: 'Drop low weights to launch high unlocks',
    baseChipScale: 115,
    domainRotationOffset: 10,
    gravity: {
      contraptionKind: 'SEESAW',
      tiltDeg: 0,
      weightGramsByIndex: [150, 250, 350, 450, 200, 300, 400, 150, 250, 350, 450, 200, 300, 400],
      cascadeMultPerLink: 0.35,
    },
  },
  {
    definition: makeDef(
      30,
      'board_030_avalanche_chute',
      'Avalanche Chute',
      'GRAVITY_PHYSICS',
      'STAGE_07_CARNIVAL_CURIOSITIES',
      'carnival_accelerando',
      'DOMINO_CHAIN',
      'RISING_FLOOD_STAGE',
      16,
      'Clear base stones to drop crystal summit',
      'Clearing bottom chute blockers cascades upper high-value boulders straight into play.',
      { primaryHex: 0xcfa457, secondaryHex: 0x223344, gemHex: 0x70f0ff }
    ),
    subVariant: 'AVALANCHE_GRAVITY_CHUTE',
    ruleBannerShort: 'Clear base blocks to drop summit gems',
    baseChipScale: 115,
    domainRotationOffset: 11,
    gravity: {
      contraptionKind: 'AVALANCHE',
      tiltDeg: 12,
      dominoPaths: [
        [12, 8, 4, 0],
        [13, 9, 5, 1],
        [14, 10, 6, 2],
        [15, 11, 7, 3],
      ],
      cascadeMultPerLink: 0.4,
    },
  },

  // ==========================================================================
  // FAMILY IV: CASINO_PUSH_LUCK (Boards 031 – 040) — Stage 03
  // ==========================================================================
  {
    definition: makeDef(
      31,
      'board_031_monte_carlo_blackjack_21',
      'Monte Carlo Blackjack 21 Felt',
      'CASINO_PUSH_LUCK',
      'STAGE_03_MONTE_CARLO_SALON',
      'riviera_caprice',
      'BLACKJACK_21_FELT',
      'SUDDEN_TRAPDOOR_HAZARD',
      16,
      'Hit exact 21 for x4; over 21 busts',
      'Felt tiles push toward 21—hit 21 for x4, bust to Trapdoor.',
      { primaryHex: 0xe3ba5a, secondaryHex: 0x0d5c3e, gemHex: 0xffd54f }
    ),
    subVariant: 'BLACKJACK_21_SHOE',
    ruleBannerShort: 'Hit 21 for x4; over 21 busts',
    baseChipScale: 120,
    domainRotationOffset: 0,
    casino: {
      tableGameKind: 'BLACKJACK_21',
      targetTotal: 21,
      jackpotMult: 4.0,
      cardValuesByIndex: [11, 10, 7, 4, 9, 6, 10, 3, 8, 5, 11, 2, 7, 4, 9, 6],
    },
  },
  {
    definition: makeDef(
      32,
      'board_032_roulette_multiplier_wheel',
      'Roulette Multiplier Wheel',
      'CASINO_PUSH_LUCK',
      'STAGE_03_MONTE_CARLO_SALON',
      'riviera_caprice',
      'BLACKJACK_21_FELT',
      'GOLDEN_BOUNTY_HUNT',
      17,
      'Claim sector lit by live roulette ball',
      'Spinning European walnut rotor boosts matching felt sectors x2.5 or Zero x5.',
      { primaryHex: 0xdba948, secondaryHex: 0x105e3d, gemHex: 0xff3d4d }
    ),
    subVariant: 'ROULETTE_WHEEL_ROTOR',
    ruleBannerShort: 'Hit roulette ball sector for x2.5 / x5',
    baseChipScale: 115,
    domainRotationOffset: 1,
    casino: {
      tableGameKind: 'ROULETTE',
      jackpotMult: 5.0,
      cardValuesByIndex: [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8],
    },
  },
  {
    definition: makeDef(
      33,
      'board_033_minesweeper_brass_vaults',
      'Minesweeper Brass Vaults',
      'CASINO_PUSH_LUCK',
      'STAGE_03_MONTE_CARLO_SALON',
      'riviera_caprice',
      'MINESWEEPER_VAULTS',
      'CHAIN_FUSE_DETONATION',
      16,
      'Sweep safe vaults; dodge 3 rival mines',
      'Brass vault plaques reveal adjacent mine counts; high-nerve cells pay +1.25x.',
      { primaryHex: 0xd9ad54, secondaryHex: 0x144734, gemHex: 0xff5252 }
    ),
    subVariant: 'MINESWEEPER_DEDUCTION',
    ruleBannerShort: 'Read mine digits; dodge 3 armed vaults',
    baseChipScale: 120,
    domainRotationOffset: 2,
    casino: {
      tableGameKind: 'MINESWEEPER',
      jackpotMult: 3.0,
      mineIndices: [3, 9, 14],
    },
  },
  {
    definition: makeDef(
      34,
      'board_034_three_shell_monte_bluff',
      'Three-Shell Monte Bluff',
      'CASINO_PUSH_LUCK',
      'STAGE_03_MONTE_CARLO_SALON',
      'riviera_caprice',
      'SHELL_MONTE_BLUFF',
      'DOUBLE_AGENT_MOLE',
      12,
      'Track emerald pearl under shuffled cups',
      'Three burnished brass cups shuffle across velvet; spot the pearl for x3.',
      { primaryHex: 0xe6be63, secondaryHex: 0x0e4f36, gemHex: 0x2effa4 }
    ),
    subVariant: 'THREE_SHELL_SHUFFLE',
    ruleBannerShort: 'Follow emerald pearl under brass cups',
    baseChipScale: 125,
    domainRotationOffset: 3,
    casino: {
      tableGameKind: 'THREE_SHELL',
      jackpotMult: 3.0,
      shellCupIndices: [0, 1, 2],
    },
  },
  {
    definition: makeDef(
      35,
      'board_035_high_roller_craps_arena',
      'High-Roller Craps Arena',
      'CASINO_PUSH_LUCK',
      'STAGE_03_MONTE_CARLO_SALON',
      'riviera_caprice',
      'BLACKJACK_21_FELT',
      'HOST_BLIND_AUCTION',
      15,
      'Match live ivory dice Point for x3 odds',
      'Twin 3D ivory dice tumble across emerald baize to ignite high-odds bays.',
      { primaryHex: 0xe0b454, secondaryHex: 0x0f5e41, gemHex: 0xff4f5e }
    ),
    subVariant: 'CRAPS_DICE_POINT',
    ruleBannerShort: 'Claim odds bays matching live dice Point',
    baseChipScale: 120,
    domainRotationOffset: 4,
    casino: {
      tableGameKind: 'CRAPS',
      jackpotMult: 3.0,
      cardValuesByIndex: [4, 5, 6, 8, 9, 10, 7, 11, 6, 8, 5, 9, 4, 10, 12],
    },
  },
  {
    definition: makeDef(
      36,
      'board_036_baccarat_sabotage_shoe',
      'Baccarat Sabotage Shoe',
      'CASINO_PUSH_LUCK',
      'STAGE_03_MONTE_CARLO_SALON',
      'riviera_caprice',
      'BLACKJACK_21_FELT',
      'SPLIT_OR_STEAL_VAULT',
      14,
      'Land last digit 9 to siphon rival stack',
      'Mod-10 Punto/Banco shoe turns Natural 9 hits into instant rival chip siphons.',
      { primaryHex: 0xdfb152, secondaryHex: 0x0b4a33, gemHex: 0xffc857 }
    ),
    subVariant: 'BACCARAT_NINE_SHOE',
    ruleBannerShort: 'Hit last-digit 9 to steal rival stack',
    baseChipScale: 125,
    domainRotationOffset: 5,
    casino: {
      tableGameKind: 'BACCARAT',
      targetTotal: 9,
      jackpotMult: 3.2,
      cardValuesByIndex: [9, 4, 5, 8, 1, 7, 2, 6, 3, 9, 5, 4, 8, 6],
    },
  },
  {
    definition: makeDef(
      37,
      'board_037_host_blind_auction_gavel',
      "Host's Blind Auction Gavel",
      'CASINO_PUSH_LUCK',
      'STAGE_03_MONTE_CARLO_SALON',
      'riviera_caprice',
      'SHELL_MONTE_BLUFF',
      'HOST_BLIND_AUCTION',
      14,
      'Outbid rival at gavel for x4 Velvet Lot',
      'Strike the walnut auction block to seize sealed showcase vaults worth x4.',
      { primaryHex: 0xdca74c, secondaryHex: 0x451a24, gemHex: 0xffe066 }
    ),
    subVariant: 'AUCTION_GAVEL_BLOCK',
    ruleBannerShort: 'Strike gavel lots for x4 Mystery Vaults',
    baseChipScale: 130,
    domainRotationOffset: 6,
    casino: {
      tableGameKind: 'BLIND_AUCTION',
      jackpotMult: 4.0,
    },
  },
  {
    definition: makeDef(
      38,
      'board_038_poker_5_card_river',
      'Poker 5-Card River',
      'CASINO_PUSH_LUCK',
      'STAGE_03_MONTE_CARLO_SALON',
      'riviera_caprice',
      'BLACKJACK_21_FELT',
      'DOUBLE_AGENT_MOLE',
      15,
      'Build 5-card Flush or Full House hand',
      'Felt plaques deal ranked suits; assemble 5-card poker hands for +1,500.',
      { primaryHex: 0xe3ba5c, secondaryHex: 0x0f593b, gemHex: 0xff5268 }
    ),
    subVariant: 'POKER_RIVER_HAND',
    ruleBannerShort: 'Claim 5 suited plaques for Poker bonus',
    baseChipScale: 120,
    domainRotationOffset: 7,
    casino: {
      tableGameKind: 'POKER_RIVER',
      jackpotMult: 3.5,
      pokerLabelsByIndex: [
        'A-S', 'K-S', 'Q-S', 'J-S', '10-S',
        'A-H', 'K-H', 'Q-H', '10-H', '9-H',
        'A-D', 'K-D', 'Q-D', 'J-C', '10-C',
      ],
    },
  },
  {
    definition: makeDef(
      39,
      'board_039_bank_or_bust_ladder',
      'Bank-or-Bust Ladder',
      'CASINO_PUSH_LUCK',
      'STAGE_03_MONTE_CARLO_SALON',
      'riviera_caprice',
      'MINESWEEPER_VAULTS',
      'CURSED_MULTIPLIER_DECAY',
      15,
      'Climb x1 to x5 rungs or bank early',
      'Five escalating gilt felt rungs multiply your pot—one miss drops unbanked gold.',
      { primaryHex: 0xe8c164, secondaryHex: 0x134a35, gemHex: 0xffb838 }
    ),
    subVariant: 'BANK_OR_BUST_RUNGS',
    ruleBannerShort: 'Ascend x1 to x5 ladder before busting',
    baseChipScale: 125,
    domainRotationOffset: 8,
    casino: {
      tableGameKind: 'LADDER_BUST',
      jackpotMult: 5.0,
    },
  },
  {
    definition: makeDef(
      40,
      'board_040_velvet_vip_high_limit',
      'Velvet VIP High-Limit Table',
      'CASINO_PUSH_LUCK',
      'STAGE_03_MONTE_CARLO_SALON',
      'riviera_caprice',
      'BLACKJACK_21_FELT',
      'SPLIT_OR_STEAL_VAULT',
      16,
      'Chain 3 VIP stacks to open $3,000 Vault',
      'High-denomination clay chip towers guard the crystal Riviera High-Limit Vault.',
      { primaryHex: 0xf0c969, secondaryHex: 0x0b3f2c, gemHex: 0x4df5c8 }
    ),
    subVariant: 'VIP_HIGH_LIMIT_SALON',
    ruleBannerShort: 'Hit 3-streak to unlock $3,000 VIP Vault',
    baseChipScale: 145,
    domainRotationOffset: 9,
    casino: {
      tableGameKind: 'VIP_HIGH_LIMIT',
      jackpotMult: 4.0,
    },
  },

  // ==========================================================================
  // FAMILY V: STEALTH_OPTICS_RADAR (Boards 041 – 050) — Stages 05 / 08
  // ==========================================================================
  {
    definition: makeDef(
      41,
      'board_041_laser_mirror_vault',
      'Laser Mirror Vault',
      'STEALTH_OPTICS_RADAR',
      'STAGE_05_ANALOG_BUNKER_1969',
      'bunker_espionage',
      'LASER_MIRROR_GRID',
      'RICOCHET_LASER_BONUS',
      16,
      'Rotate brass mirrors to pierce vaults',
      'Rotate 45-deg brass mirrors to bounce a ruby laser through category safes.',
      { primaryHex: 0xd4a44e, secondaryHex: 0x3a4534, gemHex: 0xff2e4c }
    ),
    subVariant: 'LASER_MIRROR_BENCH',
    ruleBannerShort: 'Rotate 45 deg mirrors to aim ruby laser',
    baseChipScale: 120,
    domainRotationOffset: 3,
    stealth: {
      opticsKind: 'LASER_MIRROR',
      mirrorNodeIndices: [1, 5, 6, 9, 10, 14],
      initialMirrorAnglesDeg: [45, 135, 45, 45, 135, 45],
      emitterPos: [-2.15, -1.2],
      emitterDir: [1, 0],
      bounceMultDelta: 0.6,
    },
  },
  {
    definition: makeDef(
      42,
      'board_042_submarine_phosphor_sonar',
      'Submarine Phosphor Sonar Sweep',
      'STEALTH_OPTICS_RADAR',
      'STAGE_08_SUNKEN_BATHYSPHERE',
      'bathysphere_cathedral',
      'SONAR_RADAR_SWEEP',
      'RIVAL_FOG_JAMMER',
      15,
      'Lock blips at peak phosphor sonar glow',
      'Live phosphor sweep lights submerged contacts—lock on sweep peak for x2.5.',
      { primaryHex: 0x3ef095, secondaryHex: 0x102926, gemHex: 0x6dffb3 }
    ),
    subVariant: 'SONAR_PHOSPHOR_PPI',
    ruleBannerShort: 'Tap blips during peak phosphor ping',
    baseChipScale: 120,
    domainRotationOffset: 4,
    stealth: {
      opticsKind: 'SONAR_PPI',
      emitterPos: [0, 0],
      emitterDir: [0, -1],
      bounceMultDelta: 0.5,
      sweepSpeedRadPerSec: 1.05,
    },
  },
  {
    definition: makeDef(
      43,
      'board_043_1969_nixie_breaker_matrix',
      '1969 Nixie Breaker Matrix',
      'STEALTH_OPTICS_RADAR',
      'STAGE_05_ANALOG_BUNKER_1969',
      'bunker_espionage',
      'LASER_MIRROR_GRID',
      'HIGH_VOLTAGE_CHAIN',
      16,
      'Route Nixie cathode bus past overload fuses',
      'Glowing orange Nixie glass bulbs and Bakelite breakers power linked relay rows.',
      { primaryHex: 0xff8a2b, secondaryHex: 0x343d30, gemHex: 0xffb347 }
    ),
    subVariant: 'NIXIE_BREAKER_RACK',
    ruleBannerShort: 'Flip Nixie breakers to power high vaults',
    baseChipScale: 120,
    domainRotationOffset: 5,
    stealth: {
      opticsKind: 'NIXIE_BREAKER',
      emitterPos: [-2.1, 0],
      emitterDir: [1, 0],
      bounceMultDelta: 0.5,
    },
  },
  {
    definition: makeDef(
      44,
      'board_044_bathysphere_pressure_airlocks',
      'Bathysphere Pressure Airlocks',
      'STEALTH_OPTICS_RADAR',
      'STAGE_08_SUNKEN_BATHYSPHERE',
      'bathysphere_cathedral',
      'SONAR_RADAR_SWEEP',
      'RISING_FLOOD_STAGE',
      15,
      'Equalize outer valves to open 4000m Core',
      'Riveted bronze porthole chambers descend from 100m hull down to 4,000m Abyss.',
      { primaryHex: 0xc28a4e, secondaryHex: 0x0e2c3a, gemHex: 0x3de8f5 }
    ),
    subVariant: 'BATHYSPHERE_AIRLOCK_RINGS',
    ruleBannerShort: 'Equalize outer airlocks to reach Abyss',
    baseChipScale: 125,
    domainRotationOffset: 6,
    stealth: {
      opticsKind: 'BATHYSPHERE_AIRLOCK',
      emitterPos: [0, 0],
      emitterDir: [1, 0],
      bounceMultDelta: 0.5,
      sweepSpeedRadPerSec: 0.7,
    },
  },
  {
    definition: makeDef(
      45,
      'board_045_enigma_cipher_rotors',
      'Enigma Cipher Rotors',
      'STEALTH_OPTICS_RADAR',
      'STAGE_05_ANALOG_BUNKER_1969',
      'bunker_espionage',
      'LASER_MIRROR_GRID',
      'RIVAL_FOG_JAMMER',
      15,
      'Step 3 cipher drums to decrypt gold lamps',
      'Three coaxial brass Enigma rotors click forward each solve to unveil bonuses.',
      { primaryHex: 0xd1a752, secondaryHex: 0x2c3329, gemHex: 0xffd24d }
    ),
    subVariant: 'ENIGMA_STEPPED_ROTORS',
    ruleBannerShort: 'Click Enigma rotors to expose gold slots',
    baseChipScale: 125,
    domainRotationOffset: 7,
    stealth: {
      opticsKind: 'ENIGMA_ROTORS',
      emitterPos: [-2.0, 0],
      emitterDir: [1, 0],
      bounceMultDelta: 0.55,
    },
  },
  {
    definition: makeDef(
      46,
      'board_046_periscope_torpedo_grid',
      'Periscope Torpedo Grid',
      'STEALTH_OPTICS_RADAR',
      'STAGE_08_SUNKEN_BATHYSPHERE',
      'bathysphere_cathedral',
      'SONAR_RADAR_SWEEP',
      'BLACKOUT_SPOTLIGHT',
      16,
      'Sink multi-tile convoy bearings for +1,000',
      'Brass periscope reticle tracks submerged convoy ships across bearing rings.',
      { primaryHex: 0xc99c52, secondaryHex: 0x0f2d36, gemHex: 0x4affb8 }
    ),
    subVariant: 'PERISCOPE_CROSSHAIR',
    ruleBannerShort: 'Lock convoy silhouettes for +1,000 salvo',
    baseChipScale: 120,
    domainRotationOffset: 8,
    stealth: {
      opticsKind: 'PERISCOPE_GRID',
      emitterPos: [0, 0],
      emitterDir: [0, -1],
      bounceMultDelta: 0.45,
      sweepSpeedRadPerSec: 0.85,
    },
  },
  {
    definition: makeDef(
      47,
      'board_047_prism_rainbow_splitter',
      'Prism Rainbow Splitter',
      'STEALTH_OPTICS_RADAR',
      'STAGE_05_ANALOG_BUNKER_1969',
      'bunker_espionage',
      'PRISM_SPLITTER',
      'RICOCHET_LASER_BONUS',
      15,
      'Aim crystal prism R/G/B rays onto safes',
      'Rotatable crown-glass prism disperses white light into triple x2.5 spectral beams.',
      { primaryHex: 0xdbe6ff, secondaryHex: 0x262e38, gemHex: 0x7df9ff }
    ),
    subVariant: 'PRISM_RGB_DISPERSION',
    ruleBannerShort: 'Rotate crystal prism to aim RGB rays',
    baseChipScale: 125,
    domainRotationOffset: 9,
    stealth: {
      opticsKind: 'PRISM_SPLITTER',
      mirrorNodeIndices: [0],
      initialMirrorAnglesDeg: [0],
      emitterPos: [-2.15, 0],
      emitterDir: [1, 0],
      bounceMultDelta: 0.75,
    },
  },
  {
    definition: makeDef(
      48,
      'board_048_searchlight_heist_yard',
      'Searchlight Heist Yard',
      'STEALTH_OPTICS_RADAR',
      'STAGE_05_ANALOG_BUNKER_1969',
      'bunker_espionage',
      'SONAR_RADAR_SWEEP',
      'BLACKOUT_SPOTLIGHT',
      16,
      'Raid shadowed crates between dual beams',
      'Twin bunker searchlights sweep yard vaults—strike shadowed targets for stealth x2.',
      { primaryHex: 0xe6d39c, secondaryHex: 0x202821, gemHex: 0xfff08a }
    ),
    subVariant: 'SEARCHLIGHT_DUAL_BEAM',
    ruleBannerShort: 'Strike crates inside stealth beam window',
    baseChipScale: 120,
    domainRotationOffset: 10,
    stealth: {
      opticsKind: 'SEARCHLIGHT_YARD',
      emitterPos: [-2.0, -1.5],
      emitterDir: [0.8, 0.6],
      bounceMultDelta: 0.5,
      sweepSpeedRadPerSec: 0.9,
    },
  },
  {
    definition: makeDef(
      49,
      'board_049_xray_baggage_scanner',
      'X-Ray Baggage Scanner',
      'STEALTH_OPTICS_RADAR',
      'STAGE_05_ANALOG_BUNKER_1969',
      'bunker_espionage',
      'LASER_MIRROR_GRID',
      'DOUBLE_AGENT_MOLE',
      15,
      'Spot golden contraband inside X-ray cases',
      'Cyan X-ray arch exposes hidden gold relics and decoys inside moving crates.',
      { primaryHex: 0x52e5ff, secondaryHex: 0x1b2936, gemHex: 0x70f8ff }
    ),
    subVariant: 'XRAY_FLUOROSCOPE_BELT',
    ruleBannerShort: 'Scan crates under cyan X-ray for gold',
    baseChipScale: 125,
    domainRotationOffset: 11,
    stealth: {
      opticsKind: 'XRAY_BELT',
      emitterPos: [0, -1.6],
      emitterDir: [0, 1],
      bounceMultDelta: 0.5,
      sweepSpeedRadPerSec: 0.65,
    },
  },
  {
    definition: makeDef(
      50,
      'board_050_triangulation_relay',
      'Triangulation Relay',
      'STEALTH_OPTICS_RADAR',
      'STAGE_08_SUNKEN_BATHYSPHERE',
      'bathysphere_cathedral',
      'PRISM_SPLITTER',
      'HIGH_VOLTAGE_CHAIN',
      16,
      'Lock 3 perimeter dishes onto Signal Core',
      'Claim three outer sonar dishes to converge lock beams on $2,200 Core.',
      { primaryHex: 0x45e8c2, secondaryHex: 0x132b38, gemHex: 0xffd24d }
    ),
    subVariant: 'TRIANGULATION_DISH_NET',
    ruleBannerShort: 'Claim 3 outer dishes to lock Signal Core',
    baseChipScale: 135,
    domainRotationOffset: 0,
    stealth: {
      opticsKind: 'TRIANGULATION',
      emitterPos: [0, 0],
      emitterDir: [0, -1],
      bounceMultDelta: 0.8,
      dishAnchorIndices: [1, 6, 11],
    },
  },
];

// ----------------------------------------------------------------------------
// 4. Public Catalog & Lookup Exports
// ----------------------------------------------------------------------------
export const BOARD_CATALOG_001_TO_050: readonly BoardDefinitionV6[] =
  RAW_SPECS_001_TO_050.map((s) => s.definition);

export const BOARD_SPECS_001_TO_050: Readonly<Record<string, BoardContraptionSpecA>> =
  Object.freeze(
    RAW_SPECS_001_TO_050.reduce<Record<string, BoardContraptionSpecA>>((acc, spec) => {
      acc[spec.definition.boardId] = spec;
      return acc;
    }, {})
  );

export function getBoardContraptionSpecA(
  boardIdOrNumber: string | number
): BoardContraptionSpecA | undefined {
  if (typeof boardIdOrNumber === 'number') {
    const idx = Math.trunc(boardIdOrNumber) - 1;
    return RAW_SPECS_001_TO_050[idx];
  }
  const direct = BOARD_SPECS_001_TO_050[boardIdOrNumber];
  if (direct) return direct;
  const num = Number(boardIdOrNumber);
  if (Number.isFinite(num) && num >= 1 && num <= 50) {
    return RAW_SPECS_001_TO_050[Math.trunc(num) - 1];
  }
  return undefined;
}

export function getBoardDefinition001To050(
  boardIdOrNumber: string | number
): BoardDefinitionV6 | undefined {
  return getBoardContraptionSpecA(boardIdOrNumber)?.definition;
}

export function getBoardsByFamily001To050(family: BoardFamilyIdV6): BoardDefinitionV6[] {
  return BOARD_CATALOG_001_TO_050.filter((b) => b.family === family);
}

export function getBoardsByStage001To050(stageId: StageWorldIdV6): BoardDefinitionV6[] {
  return BOARD_CATALOG_001_TO_050.filter((b) => b.signatureStage === stageId);
}

// ----------------------------------------------------------------------------
// 5. Deterministic PRNG & 3D Topology / Graph Builders for All 50 Boards
// ----------------------------------------------------------------------------
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function linkSymmetric(nodes: BoardNodeV6[], idxA: number, idxB: number): void {
  if (idxA === idxB) return;
  const a = nodes[idxA];
  const b = nodes[idxB];
  if (!a || !b) return;
  if (!a.neighbors.includes(b.nodeId)) a.neighbors.push(b.nodeId);
  if (!b.neighbors.includes(a.nodeId)) b.neighbors.push(a.nodeId);
}

function linkNearestNeighbors(nodes: BoardNodeV6[], maxDist: number): void {
  const maxDistSq = maxDist * maxDist;
  for (let i = 0; i < nodes.length; i++) {
    const [ax, , az] = nodes[i].pos3d;
    for (let j = i + 1; j < nodes.length; j++) {
      const [bx, , bz] = nodes[j].pos3d;
      const dx = ax - bx;
      const dz = az - bz;
      if (dx * dx + dz * dz <= maxDistSq) {
        linkSymmetric(nodes, i, j);
      }
    }
  }
}

function makeBaseNode(
  boardId: string,
  index: number,
  domainId: number,
  pos3d: [number, number, number],
  baseChips: number,
  multBonus: number,
  difficultyOffset: number,
  extra?: Partial<BoardNodeV6>
): BoardNodeV6 {
  const dom = CORPUS_DOMAINS_V6[((domainId % 12) + 12) % 12];
  return {
    nodeId: `${boardId}_n${String(index + 1).padStart(2, '0')}`,
    index,
    categoryLabel: dom.label,
    domainId: dom.domainId,
    baseChips: Math.round(baseChips / 10) * 10,
    multBonus: Number(multBonus.toFixed(2)),
    difficultyOffset: Number(difficultyOffset.toFixed(2)),
    owner: 'NONE',
    lockedChains: 0,
    neighbors: [],
    pos3d,
    ...extra,
  };
}

function buildClockworkNodes(spec: BoardContraptionSpecA, rand: () => number): BoardNodeV6[] {
  const cw = spec.clockwork!;
  const nodes: BoardNodeV6[] = [];
  const boardId = spec.definition.boardId;

  if (cw.isTwinSideBySide) {
    // Twin side-by-side meshing cuckoo gears centered at x = -1.16 and +1.16 (half-tooth phase offset!)
    const centers: readonly [number, number][] = [
      [-1.16, 0],
      [1.16, 0],
    ];
    let idx = 0;
    for (let r = 0; r < 2; r++) {
      const count = cw.ringCounts[r];
      const rad = cw.ringRadii[r];
      const [cx, cz] = centers[r];
      const phaseOffset = r === 1 ? Math.PI / count : 0;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2 + phaseOffset;
        const x = Number((cx + Math.cos(angle) * rad).toFixed(3));
        const z = Number((cz + Math.sin(angle) * rad).toFixed(3));
        const isPinionTouch = (r === 0 && i === 2) || (r === 1 && i === 6);
        nodes.push(
          makeBaseNode(
            boardId,
            idx,
            (spec.domainRotationOffset + idx) % 12,
            [x, 0.24, z],
            spec.baseChipScale * (isPinionTouch ? 2.5 : 1.0 + (i % 3) * 0.3),
            isPinionTouch ? 1.0 : 0.25,
            isPinionTouch ? 1.2 : (i % 3) * 0.4,
            { ringIndex: r, hasTrapFuse: isPinionTouch && r === 1 }
          )
        );
        idx++;
      }
    }
    for (let r = 0; r < 2; r++) {
      const base = r * 8;
      for (let i = 0; i < 8; i++) {
        linkSymmetric(nodes, base + i, base + ((i + 1) % 8));
      }
    }
    linkSymmetric(nodes, 2, 14);
    return nodes;
  }

  if (cw.isEpicycleSubGears) {
    // 4 inner sun nodes + 3 satellite epicycle clusters of 4 nodes each
    let idx = 0;
    const satCenters = [0, 1, 2].map((s) => {
      const a = (s / 3) * Math.PI * 2 - Math.PI / 2;
      return [Math.cos(a) * 1.68, Math.sin(a) * 1.68] as const;
    });
    for (let s = 0; s < 3; s++) {
      const [cx, cz] = satCenters[s];
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + s * 0.4;
        const x = Number((cx + Math.cos(a) * 0.5).toFixed(3));
        const z = Number((cz + Math.sin(a) * 0.5).toFixed(3));
        nodes.push(
          makeBaseNode(
            boardId,
            idx,
            (spec.domainRotationOffset + idx) % 12,
            [x, 0.28, z],
            spec.baseChipScale * (1.2 + k * 0.25),
            0.3 + s * 0.15,
            0.3 + k * 0.35,
            { ringIndex: 0, tierIndex: s }
          )
        );
        idx++;
      }
    }
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 - Math.PI / 2;
      nodes.push(
        makeBaseNode(
          boardId,
          idx,
          (spec.domainRotationOffset + idx) % 12,
          [Number((Math.cos(a) * 0.54).toFixed(3)), 0.38, Number((Math.sin(a) * 0.54).toFixed(3))],
          spec.baseChipScale * 2.1,
          0.75,
          1.1,
          { ringIndex: 1, tierIndex: 3 }
        )
      );
      idx++;
    }
    for (let s = 0; s < 3; s++) {
      const b = s * 4;
      for (let k = 0; k < 4; k++) linkSymmetric(nodes, b + k, b + ((k + 1) % 4));
      linkSymmetric(nodes, b, 12 + s);
    }
    for (let k = 0; k < 4; k++) linkSymmetric(nodes, 12 + k, 12 + ((k + 1) % 4));
    return nodes;
  }

  // Standard concentric horology rings (1, 2, or 3 rings)
  let idx = 0;
  const ringStarts: number[] = [];
  for (let r = 0; r < cw.ringCounts.length; r++) {
    ringStarts.push(idx);
    const count = cw.ringCounts[r];
    const radius = cw.ringRadii[r];
    const elevation = 0.22 + r * 0.12;
    for (let i = 0; i < count; i++) {
      const angle = count === 1 ? 0 : (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = Number((Math.cos(angle) * radius).toFixed(3));
      const z = Number((Math.sin(angle) * radius).toFixed(3));
      const tierMult = r === cw.ringCounts.length - 1 ? 0.8 : 0.25 + r * 0.25;
      const chips = spec.baseChipScale * (1.0 + r * 0.65 + (i % 2) * 0.25);
      const isCore = radius === 0 || (spec.subVariant === 'SAFE_FENCE_NOTCHES' && r === 2 && i === 0);
      nodes.push(
        makeBaseNode(
          boardId,
          idx,
          (spec.domainRotationOffset + idx + Math.floor(rand() * 2)) % 12,
          [x, elevation, z],
          isCore ? spec.baseChipScale * 3.0 : chips,
          isCore ? 1.25 : tierMult,
          r * 0.65 + (i % 3) * 0.25,
          {
            ringIndex: r,
            tierIndex: r,
            lockedChains: isCore ? 1 : 0,
          }
        )
      );
      idx++;
    }
  }

  // Link each ring circumferentially + radial gear teeth bridges
  for (let r = 0; r < cw.ringCounts.length; r++) {
    const start = ringStarts[r];
    const count = cw.ringCounts[r];
    if (count > 1) {
      for (let i = 0; i < count; i++) {
        linkSymmetric(nodes, start + i, start + ((i + 1) % count));
      }
    }
    if (r + 1 < cw.ringCounts.length) {
      const nextStart = ringStarts[r + 1];
      const nextCount = cw.ringCounts[r + 1];
      for (let i = 0; i < count; i++) {
        const mapped = Math.floor((i / count) * nextCount) % nextCount;
        linkSymmetric(nodes, start + i, nextStart + mapped);
      }
    }
  }
  return nodes;
}

function buildTurfBridgeNodes(spec: BoardContraptionSpecA): BoardNodeV6[] {
  const turf = spec.turf!;
  const boardId = spec.definition.boardId;
  const nodes: BoardNodeV6[] = [];
  const chainSet = new Set(turf.chainedIndices);

  if (turf.layoutKind === 'HEX_19' || turf.layoutKind === 'GO_WEB_19') {
    // Radius-2 axial hex grid (19 hexes: rows of 3, 4, 5, 4, 3)
    const hexSpacing = 0.88;
    const coords: Array<[number, number]> = [];
    for (let q = -2; q <= 2; q++) {
      const r1 = Math.max(-2, -q - 2);
      const r2 = Math.min(2, -q + 2);
      for (let r = r1; r <= r2; r++) {
        coords.push([q, r]);
      }
    }
    const coordToIdx = new Map<string, number>();
    coords.forEach(([q, r], idx) => {
      coordToIdx.set(`${q},${r}`, idx);
      const x = Number((hexSpacing * (1.5 * q * 0.66)).toFixed(3));
      const z = Number((hexSpacing * (Math.sqrt(3) * (r + q / 2) * 0.56)).toFixed(3));
      const distCenter = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
      const isCenter = distCenter === 0;
      const chains = chainSet.has(idx) ? (isCenter ? 2 : 1) : 0;
      nodes.push(
        makeBaseNode(
          boardId,
          idx,
          (spec.domainRotationOffset + idx) % 12,
          [x, 0.2 + (2 - distCenter) * 0.06, z],
          spec.baseChipScale * (isCenter ? 2.8 : 2.0 - distCenter * 0.4),
          isCenter ? 1.25 : 0.25 + (2 - distCenter) * 0.25,
          (2 - distCenter) * 0.65,
          { lockedChains: chains, tierIndex: 2 - distCenter }
        )
      );
    });
    const axialDirs: readonly [number, number][] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, -1],
      [-1, 1],
    ];
    coords.forEach(([q, r], idx) => {
      for (const [dq, dr] of axialDirs) {
        const nbIdx = coordToIdx.get(`${q + dq},${r + dr}`);
        if (nbIdx !== undefined) linkSymmetric(nodes, idx, nbIdx);
      }
    });
    return nodes;
  }

  if (turf.layoutKind === 'ROSE_19') {
    // 1 center oculus + 6 inner lancets + 12 outer petals
    nodes.push(
      makeBaseNode(boardId, 0, spec.domainRotationOffset % 12, [0, 0.36, 0], spec.baseChipScale * 3.0, 1.5, 1.4, {
        lockedChains: 2,
        ringIndex: 2,
        tierIndex: 2,
      })
    );
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      nodes.push(
        makeBaseNode(
          boardId,
          1 + i,
          (spec.domainRotationOffset + 1 + i) % 12,
          [Number((Math.cos(a) * 1.05).toFixed(3)), 0.28, Number((Math.sin(a) * 1.05).toFixed(3))],
          spec.baseChipScale * 1.8,
          0.6,
          0.7,
          { ringIndex: 1, tierIndex: 1 }
        )
      );
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      nodes.push(
        makeBaseNode(
          boardId,
          7 + i,
          (spec.domainRotationOffset + 7 + i) % 12,
          [Number((Math.cos(a) * 1.98).toFixed(3)), 0.2, Number((Math.sin(a) * 1.98).toFixed(3))],
          spec.baseChipScale * 1.1,
          0.25,
          0.2,
          { ringIndex: 0, tierIndex: 0 }
        )
      );
    }
    for (let i = 0; i < 6; i++) {
      linkSymmetric(nodes, 0, 1 + i);
      linkSymmetric(nodes, 1 + i, 1 + ((i + 1) % 6));
      linkSymmetric(nodes, 1 + i, 7 + i * 2);
      linkSymmetric(nodes, 1 + i, 7 + ((i * 2 + 1) % 12));
    }
    for (let i = 0; i < 12; i++) linkSymmetric(nodes, 7 + i, 7 + ((i + 1) % 12));
    return nodes;
  }

  if (turf.layoutKind === 'ROPE_15') {
    // 3 taut parallel rigging lines x 5 stations
    let idx = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const x = Number(((col - 2) * 0.96).toFixed(3));
        const z = Number(((row - 1) * 0.96).toFixed(3));
        const centerDist = Math.abs(col - 2);
        nodes.push(
          makeBaseNode(
            boardId,
            idx,
            (spec.domainRotationOffset + idx) % 12,
            [x, 0.24 + (row === 1 && col === 2 ? 0.1 : 0), z],
            spec.baseChipScale * (2.2 - centerDist * 0.45),
            centerDist === 0 ? 1.0 : 0.3,
            (2 - centerDist) * 0.5,
            { lockedChains: chainSet.has(idx) ? 1 : 0, tierIndex: 2 - centerDist }
          )
        );
        idx++;
      }
    }
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) linkSymmetric(nodes, r * 5 + c, r * 5 + c + 1);
    }
    for (let c = 0; c < 5; c++) {
      linkSymmetric(nodes, c, 5 + c);
      linkSymmetric(nodes, 5 + c, 10 + c);
    }
    return nodes;
  }

  if (turf.layoutKind === 'SIEGE_17') {
    // 1 center keep + 6 inner gatehouse bastions + 10 outer ramparts
    nodes.push(
      makeBaseNode(boardId, 0, spec.domainRotationOffset % 12, [0, 0.44, 0], spec.baseChipScale * 3.4, 1.5, 1.5, {
        lockedChains: 2,
        tierIndex: 2,
      })
    );
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      nodes.push(
        makeBaseNode(
          boardId,
          1 + i,
          (spec.domainRotationOffset + 1 + i) % 12,
          [Number((Math.cos(a) * 1.12).toFixed(3)), 0.3, Number((Math.sin(a) * 1.12).toFixed(3))],
          spec.baseChipScale * 1.9,
          0.6,
          0.8,
          { lockedChains: chainSet.has(1 + i) ? 1 : 0, tierIndex: 1 }
        )
      );
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      nodes.push(
        makeBaseNode(
          boardId,
          7 + i,
          (spec.domainRotationOffset + 7 + i) % 12,
          [Number((Math.cos(a) * 2.02).toFixed(3)), 0.2, Number((Math.sin(a) * 2.02).toFixed(3))],
          spec.baseChipScale * 1.1,
          0.25,
          0.25,
          { tierIndex: 0 }
        )
      );
    }
    for (let i = 0; i < 6; i++) {
      linkSymmetric(nodes, 0, 1 + i);
      linkSymmetric(nodes, 1 + i, 1 + ((i + 1) % 6));
    }
    linkNearestNeighbors(nodes, 1.12);
    return nodes;
  }

  if (turf.layoutKind === 'DIAMOND_17') {
    // Cut diamond rhombus lattice (columns: 1, 3, 5, 3, 5? Better: 1, 3, 4, 1 center, 4, 3, 1 -> exact 17!)
    const pts: readonly [number, number][] = [
      [-2.05, 0],
      [-1.35, -0.85], [-1.35, 0], [-1.35, 0.85],
      [-0.68, -1.3], [-0.68, -0.45], [-0.68, 0.45], [-0.68, 1.3],
      [0, 0],
      [0.68, -1.3], [0.68, -0.45], [0.68, 0.45], [0.68, 1.3],
      [1.35, -0.85], [1.35, 0], [1.35, 0.85],
      [2.05, 0],
    ];
    pts.forEach(([x, z], idx) => {
      const isCore = idx === 8;
      nodes.push(
        makeBaseNode(
          boardId,
          idx,
          (spec.domainRotationOffset + idx) % 12,
          [x, isCore ? 0.36 : 0.22, z],
          spec.baseChipScale * (isCore ? 2.8 : 1.4),
          isCore ? 1.25 : 0.4,
          isCore ? 1.2 : 0.4,
          { lockedChains: chainSet.has(idx) ? 1 : 0, tierIndex: isCore ? 2 : 1 }
        )
      );
    });
    linkNearestNeighbors(nodes, 1.05);
    return nodes;
  }

  // Subway / Circuit / Canal / Checkers (16-node stylized 4x4 topological network with distinct offsets)
  let idx = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const staggerX = turf.layoutKind === 'CHECKERS_16' ? (row % 2 === 0 ? -0.22 : 0.22) : 0;
      const canalGap = turf.layoutKind === 'CANAL_16' && col >= 2 ? 0.26 : turf.layoutKind === 'CANAL_16' ? -0.26 : 0;
      const x = Number(((col - 1.5) * 1.08 + staggerX + canalGap).toFixed(3));
      const z = Number(((row - 1.5) * 0.98).toFixed(3));
      const isCenterHub = (row === 1 || row === 2) && (col === 1 || col === 2);
      nodes.push(
        makeBaseNode(
          boardId,
          idx,
          (spec.domainRotationOffset + idx) % 12,
          [x, isCenterHub ? 0.3 : 0.22, z],
          spec.baseChipScale * (isCenterHub ? 1.9 : 1.15),
          isCenterHub ? 0.75 : 0.3,
          isCenterHub ? 0.85 : 0.3,
          { lockedChains: chainSet.has(idx) ? 1 : 0, tierIndex: isCenterHub ? 1 : 0 }
        )
      );
      idx++;
    }
  }
  if (turf.layoutKind === 'CHECKERS_16') {
    linkNearestNeighbors(nodes, 1.55);
  } else {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (c < 3) linkSymmetric(nodes, r * 4 + c, r * 4 + c + 1);
        if (r < 3) linkSymmetric(nodes, r * 4 + c, (r + 1) * 4 + c);
      }
    }
  }
  return nodes;
}

function buildGravityPhysicsNodes(spec: BoardContraptionSpecA): BoardNodeV6[] {
  const grav = spec.gravity!;
  const boardId = spec.definition.boardId;
  const nodes: BoardNodeV6[] = [];
  const tiltRad = (grav.tiltDeg * Math.PI) / 180;

  if (grav.contraptionKind === 'VORTEX') {
    // 16 nodes along an inward logarithmic spiral descending into a spun-brass funnel
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const angle = i * 0.78 - Math.PI / 2;
      const radius = 2.02 * (1 - t * 0.78);
      const y = Number((0.68 - t * 0.56).toFixed(3));
      nodes.push(
        makeBaseNode(
          boardId,
          i,
          (spec.domainRotationOffset + i) % 12,
          [Number((Math.cos(angle) * radius).toFixed(3)), y, Number((Math.sin(angle) * radius).toFixed(3))],
          spec.baseChipScale * (1.0 + t * 2.0),
          0.25 + t * 1.25,
          t * 1.4,
          { ringIndex: Math.floor(t * 3), tierIndex: Math.floor(t * 3) }
        )
      );
      if (i > 0) linkSymmetric(nodes, i - 1, i);
    }
    return nodes;
  }

  if (grav.contraptionKind === 'DOMINO') {
    // 16 standing ivory dominoes laid out along 3 serpentine forked cascades
    const pts: readonly [number, number][] = [
      // Trunk 0..5
      [-1.95, -1.25], [-1.2, -1.25], [-0.45, -1.15], [0.35, -1.15], [1.15, -1.2], [1.9, -1.25],
      // Middle fork 6..10
      [-0.45, -0.35], [0.25, -0.05], [1.0, -0.15], [1.75, -0.25], [1.95, 0.55],
      // Lower fork 11..15
      [-1.75, 0.35], [-1.05, 0.65], [-0.25, 0.85], [0.55, 1.05], [1.35, 1.25],
    ];
    pts.forEach(([x, z], i) => {
      nodes.push(
        makeBaseNode(
          boardId,
          i,
          (spec.domainRotationOffset + i) % 12,
          [x, 0.34, z],
          spec.baseChipScale * (1.1 + (i % 5) * 0.28),
          0.35 + (i >= 13 ? 0.5 : 0),
          (i % 5) * 0.3,
          { tierIndex: Math.floor(i / 5) }
        )
      );
    });
    for (const path of grav.dominoPaths ?? []) {
      for (let k = 0; k + 1 < path.length; k++) linkSymmetric(nodes, path[k], path[k + 1]);
    }
    return nodes;
  }

  if (grav.contraptionKind === 'BALANCE_SCALE' || grav.contraptionKind === 'SEESAW') {
    // 7 nodes on Left Pan/Arm + 7 nodes on Right Pan/Arm
    const weights = grav.weightGramsByIndex ?? [];
    for (let side = 0; side < 2; side++) {
      const cx = side === 0 ? -1.32 : 1.32;
      for (let k = 0; k < 7; k++) {
        const idx = side * 7 + k;
        const angle = (k / 7) * Math.PI * 2;
        const rad = k === 0 ? 0 : 0.72;
        const x = Number((cx + Math.cos(angle) * rad).toFixed(3));
        const z = Number((Math.sin(angle) * rad).toFixed(3));
        const grams = weights[idx] ?? 200;
        nodes.push(
          makeBaseNode(
            boardId,
            idx,
            (spec.domainRotationOffset + idx) % 12,
            [x, 0.42, z],
            spec.baseChipScale * (grams / 140),
            grams >= 350 ? 0.8 : 0.35,
            (grams - 100) / 220,
            { ringIndex: side, tierIndex: Math.floor(grams / 150) }
          )
        );
      }
    }
    linkNearestNeighbors(nodes, 0.92);
    return nodes;
  }

  if (grav.contraptionKind === 'PENDULUM' || grav.contraptionKind === 'NEWTON_CRADLE') {
    // 5 columns x 3 elevated tiers (Left Bastion / Center Swing / Right Bastion)
    let idx = 0;
    for (let tier = 0; tier < 3; tier++) {
      for (let col = 0; col < 5; col++) {
        const x = Number(((col - 2) * 0.94).toFixed(3));
        const z = Number(((tier - 1) * 1.02).toFixed(3));
        const isCenter = col === 2;
        nodes.push(
          makeBaseNode(
            boardId,
            idx,
            (spec.domainRotationOffset + idx) % 12,
            [x, 0.3 + (isCenter ? 0.12 : 0), z],
            spec.baseChipScale * (isCenter ? 2.1 : 1.2 + tier * 0.25),
            isCenter ? 1.0 : 0.35,
            isCenter ? 1.0 : 0.35 + tier * 0.25,
            { tierIndex: tier, ringIndex: col }
          )
        );
        idx++;
      }
    }
    linkNearestNeighbors(nodes, 1.15);
    return nodes;
  }

  // Inclined gravity playfields: PINBALL (15), PACHINKO (16), PLINKO (15), AVALANCHE (16)
  const count = spec.definition.nodeCount;
  const cols = count === 16 ? 4 : 5;
  const rows = Math.ceil(count / cols);
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const stagger = (grav.contraptionKind === 'PLINKO' || grav.contraptionKind === 'PACHINKO') && r % 2 === 1 ? 0.22 : 0;
    const x = Number(((c - (cols - 1) / 2) * (cols === 5 ? 0.9 : 1.08) + stagger).toFixed(3));
    const z = Number(((r - (rows - 1) / 2) * 0.96).toFixed(3));
    const y = Number((0.36 - z * Math.sin(tiltRad)).toFixed(3));
    const isBottomJackpot = r === rows - 1 && Math.abs(x) < 0.7;
    nodes.push(
      makeBaseNode(
        boardId,
        i,
        (spec.domainRotationOffset + i) % 12,
        [x, y, z],
        spec.baseChipScale * (isBottomJackpot ? 2.6 : 1.1 + r * 0.35),
        isBottomJackpot ? 1.2 : 0.3 + r * 0.15,
        r * 0.4,
        { tierIndex: r, ringIndex: c }
      )
    );
  }
  linkNearestNeighbors(nodes, 1.25);
  return nodes;
}

function buildCasinoPushLuckNodes(spec: BoardContraptionSpecA): BoardNodeV6[] {
  const cas = spec.casino!;
  const boardId = spec.definition.boardId;
  const nodes: BoardNodeV6[] = [];
  const mineSet = new Set(cas.mineIndices ?? []);

  if (cas.tableGameKind === 'ROULETTE') {
    // 1 center Zero Emerald core + 16 radial betting sectors
    nodes.push(
      makeBaseNode(boardId, 0, spec.domainRotationOffset % 12, [0, 0.34, 0], spec.baseChipScale * 3.5, 2.0, 1.4, {
        ringIndex: 1,
        tierIndex: 2,
      })
    );
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
      const rad = i % 2 === 0 ? 1.98 : 1.38;
      nodes.push(
        makeBaseNode(
          boardId,
          1 + i,
          (spec.domainRotationOffset + 1 + i) % 12,
          [Number((Math.cos(a) * rad).toFixed(3)), 0.2, Number((Math.sin(a) * rad).toFixed(3))],
          spec.baseChipScale * (i % 2 === 0 ? 1.3 : 1.65),
          0.5,
          0.35 + (i % 3) * 0.25,
          { ringIndex: i % 2, tierIndex: i % 2 }
        )
      );
      linkSymmetric(nodes, 0, 1 + i);
      if (i > 0) linkSymmetric(nodes, 1 + i, i);
    }
    linkSymmetric(nodes, 1, 16);
    return nodes;
  }

  if (cas.tableGameKind === 'THREE_SHELL') {
    // 3 hero brass shell cups at front + 9 emerald betting plaques in a 3x3 arc behind
    const cupX = [-1.25, 0, 1.25];
    for (let c = 0; c < 3; c++) {
      nodes.push(
        makeBaseNode(
          boardId,
          c,
          (spec.domainRotationOffset + c) % 12,
          [cupX[c], 0.34, -0.95],
          spec.baseChipScale * 2.4,
          1.2,
          0.9,
          { ringIndex: 0, isDoubleAgentMole: c === 2 }
        )
      );
    }
    for (let i = 0; i < 9; i++) {
      const r = Math.floor(i / 3);
      const c = i % 3;
      const idx = 3 + i;
      nodes.push(
        makeBaseNode(
          boardId,
          idx,
          (spec.domainRotationOffset + idx) % 12,
          [Number(((c - 1) * 1.28).toFixed(3)), 0.18, Number((0.05 + r * 0.72).toFixed(3))],
          spec.baseChipScale * (1.1 + r * 0.3),
          0.35,
          0.3 + r * 0.3,
          { ringIndex: 1, tierIndex: r }
        )
      );
    }
    linkNearestNeighbors(nodes, 1.45);
    return nodes;
  }

  if (cas.tableGameKind === 'LADDER_BUST') {
    // 5 escalating rungs of 3 plaques each (bottom x1 -> top x5)
    let idx = 0;
    for (let rung = 0; rung < 5; rung++) {
      for (let col = 0; col < 3; col++) {
        const x = Number(((col - 1) * 1.15).toFixed(3));
        const z = Number((1.45 - rung * 0.72).toFixed(3));
        const y = Number((0.18 + rung * 0.11).toFixed(3));
        nodes.push(
          makeBaseNode(
            boardId,
            idx,
            (spec.domainRotationOffset + idx) % 12,
            [x, y, z],
            spec.baseChipScale * (1.0 + rung * 0.55),
            0.3 + rung * 0.45,
            rung * 0.4,
            { tierIndex: rung, hasTrapFuse: rung >= 3 && col === 1 }
          )
        );
        idx++;
      }
    }
    linkNearestNeighbors(nodes, 1.25);
    return nodes;
  }

  // Semicircular Monte Carlo felt layout (Blackjack 21, Minesweeper, Craps, Baccarat, Auction, Poker, VIP)
  const count = spec.definition.nodeCount;
  const cols = count === 16 ? 4 : count === 15 ? 5 : 4;
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const rowItems = Math.min(cols, count - r * cols);
    const x = Number(((c - (rowItems - 1) / 2) * (cols === 5 ? 0.92 : 1.08)).toFixed(3));
    const totalRows = Math.ceil(count / cols);
    const arcLift = Math.cos((x / 2.2) * 0.65) * 0.16;
    const z = Number(((r - (totalRows - 1) / 2) * 0.88 - arcLift * 0.5).toFixed(3));
    const cardVal = cas.cardValuesByIndex?.[i];
    const isMine = mineSet.has(i);
    const isAuctionLot = cas.tableGameKind === 'BLIND_AUCTION' && (i === 5 || i === 8);
    nodes.push(
      makeBaseNode(
        boardId,
        i,
        (spec.domainRotationOffset + i) % 12,
        [x, 0.2, z],
        spec.baseChipScale * (cardVal ? 0.8 + cardVal * 0.14 : 1.25 + r * 0.25),
        isAuctionLot ? 1.5 : 0.4 + r * 0.15,
        0.25 + r * 0.35,
        {
          tierIndex: r,
          hasTrapFuse: isMine,
          isMysteryAuction: isAuctionLot,
          isDoubleAgentMole: cas.tableGameKind === 'POKER_RIVER' && i === 7,
        }
      )
    );
  }
  linkNearestNeighbors(nodes, 1.35);
  return nodes;
}

function buildStealthOpticsNodes(spec: BoardContraptionSpecA): BoardNodeV6[] {
  const st = spec.stealth!;
  const boardId = spec.definition.boardId;
  const nodes: BoardNodeV6[] = [];

  if (
    st.opticsKind === 'SONAR_PPI' ||
    st.opticsKind === 'BATHYSPHERE_AIRLOCK' ||
    st.opticsKind === 'PERISCOPE_GRID' ||
    st.opticsKind === 'TRIANGULATION'
  ) {
    // Polar radar / bathysphere concentric bearing rings
    const count = spec.definition.nodeCount;
    const dishSet = new Set(st.dishAnchorIndices ?? []);
    // Center core (index 0)
    nodes.push(
      makeBaseNode(boardId, 0, spec.domainRotationOffset % 12, [0, 0.34, 0], spec.baseChipScale * 3.2, 1.5, 1.4, {
        ringIndex: 2,
        tierIndex: 2,
        lockedChains: st.opticsKind === 'BATHYSPHERE_AIRLOCK' || st.opticsKind === 'TRIANGULATION' ? 2 : 0,
      })
    );
    const innerCount = 5;
    const outerCount = count - 1 - innerCount;
    for (let i = 0; i < innerCount; i++) {
      const a = (i / innerCount) * Math.PI * 2 - Math.PI / 2;
      nodes.push(
        makeBaseNode(
          boardId,
          1 + i,
          (spec.domainRotationOffset + 1 + i) % 12,
          [Number((Math.cos(a) * 1.06).toFixed(3)), 0.26, Number((Math.sin(a) * 1.06).toFixed(3))],
          spec.baseChipScale * 1.85,
          0.65,
          0.75,
          {
            ringIndex: 1,
            tierIndex: 1,
            lockedChains: st.opticsKind === 'BATHYSPHERE_AIRLOCK' ? 1 : 0,
          }
        )
      );
      linkSymmetric(nodes, 0, 1 + i);
    }
    for (let i = 0; i < outerCount; i++) {
      const idx = 1 + innerCount + i;
      const a = (i / outerCount) * Math.PI * 2 - Math.PI / 2 + 0.18;
      const isDish = dishSet.has(idx);
      nodes.push(
        makeBaseNode(
          boardId,
          idx,
          (spec.domainRotationOffset + idx) % 12,
          [Number((Math.cos(a) * 1.96).toFixed(3)), isDish ? 0.34 : 0.2, Number((Math.sin(a) * 1.96).toFixed(3))],
          spec.baseChipScale * (isDish ? 1.8 : 1.15),
          isDish ? 0.9 : 0.35,
          0.3,
          { ringIndex: 0, tierIndex: 0 }
        )
      );
    }
    linkNearestNeighbors(nodes, 1.25);
    return nodes;
  }

  if (st.opticsKind === 'PRISM_SPLITTER') {
    // Index 0 = rotatable triangular dispersion prism at x = -1.15, fanning into 3 + 5 + 6 = 14 spectral vaults
    nodes.push(
      makeBaseNode(boardId, 0, spec.domainRotationOffset % 12, [-1.15, 0.38, 0], spec.baseChipScale * 2.5, 1.25, 1.0, {
        ringIndex: 0,
        tierIndex: 2,
      })
    );
    const tierSpecs: ReadonlyArray<{ dist: number; angles: readonly number[] }> = [
      { dist: 1.15, angles: [-0.55, 0, 0.55] },
      { dist: 2.05, angles: [-0.68, -0.34, 0, 0.34, 0.68] },
      { dist: 2.95, angles: [-0.62, -0.37, -0.12, 0.12, 0.37, 0.62] },
    ];
    let idx = 1;
    tierSpecs.forEach(({ dist, angles }, tier) => {
      angles.forEach((a, k) => {
        if (idx >= 15) return;
        const x = Number((-1.15 + Math.cos(a) * dist).toFixed(3));
        const z = Number((Math.sin(a) * dist).toFixed(3));
        nodes.push(
          makeBaseNode(
            boardId,
            idx,
            (spec.domainRotationOffset + idx) % 12,
            [x, 0.24, z],
            spec.baseChipScale * (1.2 + tier * 0.45),
            0.4 + tier * 0.35,
            0.35 + tier * 0.35,
            { tierIndex: tier, ringIndex: k % 3 } // 0=Red, 1=Green, 2=Blue band
          )
        );
        idx++;
      });
    });
    linkNearestNeighbors(nodes, 1.25);
    return nodes;
  }

  // Optical bench / Nixie Breaker / Enigma Rotors / Searchlight Yard / X-Ray Belt (15 or 16 nodes)
  const count = spec.definition.nodeCount;
  const cols = count === 16 ? 4 : 5;
  const rows = Math.ceil(count / cols);
  const mirrorSet = new Set(st.mirrorNodeIndices ?? []);
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = Number(((c - (cols - 1) / 2) * (cols === 5 ? 0.94 : 1.12)).toFixed(3));
    const z = Number(((r - (rows - 1) / 2) * 0.96).toFixed(3));
    const isMirror = mirrorSet.has(i);
    const isOverloadFuse = st.opticsKind === 'NIXIE_BREAKER' && (i === 5 || i === 10);
    nodes.push(
      makeBaseNode(
        boardId,
        i,
        (spec.domainRotationOffset + i) % 12,
        [x, isMirror ? 0.34 : 0.22, z],
        spec.baseChipScale * (isMirror ? 1.65 : 1.15 + r * 0.25),
        isMirror ? 0.65 : 0.35 + r * 0.15,
        0.3 + r * 0.3,
        {
          tierIndex: r,
          ringIndex: c,
          hasTrapFuse: isOverloadFuse,
          isDoubleAgentMole: st.opticsKind === 'XRAY_BELT' && (i === 4 || i === 11),
          lockedChains: st.opticsKind === 'LASER_MIRROR' && (i === 3 || i === 15) ? 1 : 0,
        }
      )
    );
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= count) continue;
      if (c + 1 < cols && idx + 1 < count) linkSymmetric(nodes, idx, idx + 1);
      if (r + 1 < rows && idx + cols < count) linkSymmetric(nodes, idx, idx + cols);
    }
  }
  return nodes;
}

export function buildNodesForBoardA(
  spec: BoardContraptionSpecA,
  seed?: number
): BoardNodeV6[] {
  const effectiveSeed = (seed ?? spec.definition.boardNumber * 7919 + 1337) >>> 0;
  const rand = mulberry32(effectiveSeed);
  switch (spec.definition.family) {
    case 'CLOCKWORK_ROTARY':
      return buildClockworkNodes(spec, rand);
    case 'TURF_WAR_BRIDGES':
      return buildTurfBridgeNodes(spec);
    case 'GRAVITY_PHYSICS':
      return buildGravityPhysicsNodes(spec);
    case 'CASINO_PUSH_LUCK':
      return buildCasinoPushLuckNodes(spec);
    case 'STEALTH_OPTICS_RADAR':
      return buildStealthOpticsNodes(spec);
    default:
      return buildClockworkNodes(spec, rand);
  }
}

export interface CreateBoardRuntimeOptionsA {
  readonly seed?: number;
  readonly rivalName?: string;
  readonly maxTurns?: number;
  readonly activeTwist?: BoardTwistMutationIdV6;
  readonly overrideTwist?: BoardTwistMutationIdV6;
  readonly stageDifficultyOffset?: number;
}

export function createInitialBoardRuntimeStateA(
  boardIdOrNumber: string | number,
  options?: CreateBoardRuntimeOptionsA
): BoardRuntimeStateV6 {
  const spec = getBoardContraptionSpecA(boardIdOrNumber) ?? RAW_SPECS_001_TO_050[0];
  const diffOffset = options?.stageDifficultyOffset ?? 0;
  const nodes = buildNodesForBoardA(spec, options?.seed).map((n) =>
    diffOffset !== 0
      ? { ...n, difficultyOffset: Number((n.difficultyOffset + diffOffset).toFixed(2)) }
      : n
  );
  return {
    definition: spec.definition,
    activeTwist: options?.overrideTwist ?? options?.activeTwist ?? spec.definition.defaultTwist,
    nodes,
    turnNumber: 1,
    maxTurns: options?.maxTurns ?? Math.min(12, Math.max(8, Math.floor(nodes.length * 0.7))),
    ringRotationsDeg: [0, 0, 0],
    alignedNodeIds: [],
    playerScoreChips: 0,
    playerMult: 1.0,
    playerTotalCash: 0,
    rivalTotalCash: 0,
    rivalName: options?.rivalName ?? 'Frankie "The Fix" Castellano',
    streakCount: 0,
  };
}

/**
 * Direct drop-in state factory matching `UnifiedBoardManagerV6.hydrateCatalogAFromModule()`.
 */
export function buildBoardRuntimeStateA(
  definition: BoardDefinitionV6,
  options?: {
    seed?: number;
    rivalName?: string;
    overrideTwist?: BoardTwistMutationIdV6;
    maxTurns?: number;
    stageDifficultyOffset?: number;
  }
): BoardRuntimeStateV6 {
  return createInitialBoardRuntimeStateA(definition.boardId, options);
}
