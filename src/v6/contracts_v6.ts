// ============================================================================
// WORLD'S SMARTEST v6.0 — Generational Ultra-HD 3D Studio Contracts
// Shared immutable TypeScript spine across all v6.0 subsystems:
//  1) 10 Radically Distinct 3D Stage Worlds (Unique PBR Materials, Architecture,
//     Lighting, Weather/Particles, HUD Palette & Bespoke Symphonic Score!)
//  2) 100 Physically Distinct 3D Playing Boards + Live Mid-Match Mutation Twists
//  3) 100 Zero-Scroll 3D/Tactile Question Presentations + 4K Relief Atlas + Twists
//  4) Stage Trapdoor Gambit (10 Frantic 8s 3D Survival Mini-Games on Wrong Clues)
//  5) Frankie's Backstage Prop Trunk (+Chips x Mult 3D Relics & Foil Trick Cards)
//  6) 1,279,399+ Clue Calibration (1.0 -> 10.0) + 160 KB Zero-Repeat Bitset Ledger
//  7) Writers'-Room Reactive Backstage Dramedy & On-Stage Quip Engine
//  8) 36 Sculpted 3D Trophies & Cast Medals + Broadcast Mixing Desk Options Console
//  9) Bespoke Re-Recorded Original Hi-Fi Symphonic Score & Horological Foley
// ============================================================================

export type StageWorldIdV6 =
  | 'STAGE_01_VAUDEVILLE_PALACE'     // 1928 Broadway Mahogany, Crimson Velvet & Edison Brass
  | 'STAGE_02_GENEVA_CONSERVATORY'   // White Carrara Marble, Rose-Gold Watch Gears & Sunlit Glass
  | 'STAGE_03_MONTE_CARLO_SALON'     // 1962 Riviera Emerald Felt, Walnut Burl & Crystal Chandeliers
  | 'STAGE_04_CARTOGRAPHIC_ROTUNDA'  // Explorer's Teak Deck, Verdigris Copper & Sapphire Globes
  | 'STAGE_05_ANALOG_BUNKER_1969'    // Cold-War Olive Steel, Orange Nixie Tubes & Phosphor Radar
  | 'STAGE_06_KYOTO_LACQUER_PAVILION'// Vermilion/Black Urushi Lacquer, Kintsugi Gold & Lantern Water
  | 'STAGE_07_CARNIVAL_CURIOSITIES'  // Midnight Pier Wood, Copper Pinball, Calliope & Coastal Fog
  | 'STAGE_08_SUNKEN_BATHYSPHERE'    // Volcanic Basalt, Riveted Bronze Portholes & Water Caustics
  | 'STAGE_09_ASTRAL_OBSERVATORY'    // Open Copper Telescope Dome, Alabaster, Prisms & Live Aurora
  | 'STAGE_10_SOVEREIGN_COLOSSEUM';  // Veined Nero Marble, Live Fire Braziers & 24k Gold Altar

export interface StageAtmosphereThemeV6 {
  stageId: StageWorldIdV6;
  stageNumber: number;               // 1 .. 10 (2 Campaign Episodes per Stage World = 20 Episodes)
  title: string;
  eraSubtitle: string;
  difficultyBand: [number, number];  // e.g. [1.0, 1.9] -> [9.0, 10.0]
  symphonyTrack: SymphonyTrackIdV6;
  // Distinct 3D PBR Material & Lighting Recipe so NO two stages look alike
  materials: {
    floorColorHex: number;
    floorRoughness: number;
    floorMetalness: number;
    trimMetalHex: number;
    trimRoughness: number;
    trimMetalness: number;
    stoneOrWoodHex: number;
    jewelPrimaryHex: number;
    jewelSecondaryHex: number;
  };
  lighting: {
    skyTopHex: number;
    fogHex: number;
    fogDensity: number;
    keyLightHex: number;
    keyIntensity: number;
    rimLightHex: number;
    rimIntensity: number;
    ambientHex: number;
    particleKind:
      | 'GOLDEN_DUST'
      | 'SUNBEAM_POLLEN'
      | 'CHAMPAGNE_SPARKLE'
      | 'COMPASS_FIREFLIES'
      | 'OSCILLOSCOPE_STATIC'
      | 'LANTERN_EMBERS'
      | 'COASTAL_MIST_BULBS'
      | 'ABYSSAL_CAUSTIC_BUBBLES'
      | 'AURORA_STARDUST'
      | 'COLOSSEUM_FIRE_SPARKS';
  };
  // Distinct UI Trim Tokens (while maintaining razor-sharp 3x Retina legibility)
  hudTheme: {
    surfaceCss: string;
    borderCss: string;
    accentCss: string;
    badgeBgCss: string;
    badgeTextCss: string;
    fontHeadingFamily: string;
  };
}

export type BoardFamilyIdV6 =
  | 'CLOCKWORK_ROTARY'
  | 'TURF_WAR_BRIDGES'
  | 'GRAVITY_PHYSICS'
  | 'CASINO_PUSH_LUCK'
  | 'STEALTH_OPTICS_RADAR'
  | 'MONUMENT_INDUSTRIAL'
  | 'CARTOGRAPHY_EXPEDITION'
  | 'CARNIVAL_ARCADE'
  | 'ASTRAL_QUANTUM'
  | 'RULE_BENDER_TWISTS';

export type ToyFamilyIdV6 =
  | 'DEFUSAL_ELIMINATION'
  | 'ATLAS_RELIEF_SPATIAL'
  | 'DIALS_CRYPTEX_LOCKS'
  | 'RAPID_PADDLES_REFLEX'
  | 'PROGRESSIVE_AUDIO_REVEAL'
  | 'WAGER_SCALE_CHRONOLOGY'
  | 'CASINO_BLUFF_STAKES'
  | 'FORENSIC_DETECTIVE'
  | 'KINETIC_CONTRAPTIONS'
  | 'MIND_GAME_TWISTS';

export type BoardTwistMutationIdV6 =
  | 'NONE'
  | 'BLACKOUT_SPOTLIGHT'
  | 'GRAVITY_INVERSION'
  | 'HOST_BLIND_AUCTION'
  | 'CHAIN_FUSE_DETONATION'
  | 'MIRROR_TWIN_LINK'
  | 'RISING_FLOOD_STAGE'
  | 'DOUBLE_AGENT_MOLE'
  | 'SPLIT_OR_STEAL_VAULT'
  | 'MAGNETIC_REPULSOR'
  | 'CURSED_MULTIPLIER_DECAY'
  | 'OVERCLOCK_DOUBLE_SPEED'
  | 'RIVAL_FOG_JAMMER'
  | 'GOLDEN_BOUNTY_HUNT'
  | 'SUDDEN_TRAPDOOR_HAZARD'
  | 'RICOCHET_LASER_BONUS'
  | 'HIGH_VOLTAGE_CHAIN';

export type SymphonyTrackIdV6 =
  | 'curtain_overture'          // Stage 01 Vaudeville & Main Entrance (Mozart Figaro DNA -> Original)
  | 'geneva_horology'           // Stage 02 Swiss Conservatory Scherzo
  | 'riviera_caprice'           // Stage 03 Monte Carlo Salon Caprice
  | 'explorer_odyssey'          // Stage 04 Cartographic Rotunda Horns & Strings
  | 'bunker_espionage'          // Stage 05 1969 Analog Bunker Suspense Fugue
  | 'kyoto_nocturne'            // Stage 06 Lacquer Pavilion Moonlit Presto
  | 'carnival_accelerando'      // Stage 07 Carnival Pier (Grieg Mountain King DNA -> Original)
  | 'bathysphere_cathedral'     // Stage 08 Sunken Basalt Deep Chorale
  | 'astral_storm_presto'       // Stage 09 Aurora Observatory (Vivaldi Summer DNA -> Original)
  | 'colosseum_finale'          // Stage 10 Sovereign Colosseum (Dvorak New World IV DNA -> Original)
  | 'backstage_velvet'          // Frankie's Backstage Prop Trunk
  | 'trophy_hall_majesty'       // Hall of Trophies & Cast Medals
  | 'trapdoor_survival_blitz'   // 8-Second Trapdoor Pit Adrenaline
  | 'crown_victory_fanfare';    // Post-Match Ceremony Fanfare

export type FoleySfxIdV6 =
  | 'ui_brass_tap'
  | 'neve_fader_detent'
  | 'rotary_knob_click'
  | 'brass_gear_detent'
  | 'optical_beam_lock'
  | 'crystal_hex_claim'
  | 'iron_chain_shatter'
  | 'wire_cutter_snip'
  | 'nixie_spark_crackle'
  | 'cryptex_stone_tumbler'
  | 'globe_pin_ruby_click'
  | 'paddle_spring_slam'
  | 'trapdoor_hinge_drop'
  | 'pneumatic_piston_slam'
  | 'velvet_trunk_clasp'
  | 'foil_card_flick'
  | 'relic_pedestal_hum'
  | 'trophy_pedestal_chime'
  | 'medal_enamel_clink'
  | 'screw_rival_slam'
  | 'twist_siren_chime'
  | 'clock_horology_tick'
  | 'clock_escapement_urgent'
  | 'vault_heavy_unlock'
  | 'chip_stack_riffle'
  | 'crowd_warm_applause'
  | 'crowd_studio_roar'
  | 'crowd_collective_gasp'
  | 'streak_chord_1'
  | 'streak_chord_2'
  | 'streak_chord_3'
  | 'streak_chord_4'
  | 'streak_fanfare_5';

export type CameraStageZoneV6 =
  | 'LOBBY_PROSCENIUM'
  | 'TROPHY_MEDAL_VAULT'
  | 'OPTIONS_MIXING_BOOTH'
  | 'BACKSTAGE_PROP_TRUNK'
  | 'BOARD_OVERHEAD_ANGLED'
  | 'TOY_CLOSEUP_STAGE'
  | 'TRAPDOOR_PIT_PLUNGE'
  | 'VICTORY_PODIUM_CEREMONY';

// ----------------------------------------------------------------------------
// 1. Options Console ("Options upon Options" — Broadcast Mixing Desk)
// ----------------------------------------------------------------------------
export type ResolutionTierV6 = 'ULTRA_3X' | 'HIGH_2X' | 'BATTERY_1X';
export type ShadowQualityV6 = 'ULTRA_2048' | 'SOFT_1024' | 'OFF';
export type CameraMotionModeV6 = 'CINEMATIC' | 'SUBTLE' | 'REDUCED';
export type ColorVisionLensV6 = 'STANDARD' | 'DEUTERANOPIA' | 'PROTANOPIA' | 'TRITANOPIA';
export type ThumbDockHandednessV6 = 'CENTER' | 'LEFT_HAND' | 'RIGHT_HAND';
export type TextScalePresetV6 = 0.95 | 1.0 | 1.12;

export interface BroadcastOptionsStateV6 {
  // Bay 1: Rupert-Neve Audio Mixing Desk
  masterVolume: number;      // 0.0 - 1.0
  symphonyVolume: number;    // 0.0 - 1.0
  foleyVolume: number;       // 0.0 - 1.0
  voiceVolume: number;       // 0.0 - 1.0
  ambienceVolume: number;    // 0.0 - 1.0
  autoVoiceDucking: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  // Bay 2: Ultra-HD 3D Graphics & Stage Camera
  resolutionTier: ResolutionTierV6;
  shadowQuality: ShadowQualityV6;
  cameraMotion: CameraMotionModeV6;
  showFpsTelemetry: boolean;
  // Bay 3: Ergonomics, Accessibility & Pacing
  textScale: TextScalePresetV6;
  thumbDock: ThumbDockHandednessV6;
  colorVisionLens: ColorVisionLensV6;
  hapticsIntensity: 'OFF' | 'CRISP' | 'HEAVY';
  timerPaceMode: 'STANDARD' | 'RELAXED_PLUS_4S';
}

// ----------------------------------------------------------------------------
// 2. Calibrated 1.27M Question & 84-Toy Payload Schema
// ----------------------------------------------------------------------------
export interface GeoCoordV6 {
  lat: number;
  lng: number;
  regionHint?: string;
  landmarkLabel?: string;
}

export interface CalibratedClueV6 {
  qid: number;                     // Unique 0 .. 1,310,719 ID tracked in 160KB bitset
  domainId: number;                // 0 .. 11 taxonomy domain
  categoryLabel: string;           // Crisp human category badge (e.g. "INVENTIONS", "WORLD ATLAS")
  subcategoryLabel?: string;
  difficultyScore: number;         // Calibrated 1.0 (Easy Crowd-Pleaser) -> 10.0 (Grand Master)
  difficultyBadge: 'WARMUP' | 'EASY' | 'CONTENDER' | 'SHARP' | 'CHAMPIONSHIP' | 'LEGEND';
  fameScore: number;               // 0.0 - 1.0 household recognizability
  recommendedToyIds?: string[];    // Preferred toy IDs for bespoke clues
  prompt: string;                  // Crisp, zero-scroll stage-host clue (<= 140 chars)
  choices: string[];               // 4 crisp choices (index 0 or correctIndex is truth before shuffle)
  correctIndex: number;
  // Extended multi-toy payload fields (populated natively or synthesized cleanly by QuestionEngineV6)
  wrongWireIndices?: number[];     // For Cut-3-Wrong-Wires / Defusal toys
  numericTarget?: number;          // For Dial / Cliffhanger / Higher-Lower / Scale toys
  numericMin?: number;
  numericMax?: number;
  numericUnit?: string;
  geoTarget?: GeoCoordV6;          // For 3D Shaded-Relief Globe Pin-Drop & Spatial toys
  cryptexWord?: string;            // 4-8 uppercase A-Z letters for Cryptex / Split-Flap / Anagram
  chronologyItems?: Array<{ label: string; yearOrOrder: number }>;
  binaryPair?: {                   // For 2-Paddle DIS OR DAT & Conveyor Sorter
    optionA: string;
    optionB: string;
    items: Array<{ text: string; bucket: 0 | 1 }>;
  };
  corruptedLieWord?: {             // For Lie-Detector / Mind-Game Twist toys
    sentenceWithLie: string;
    lieToken: string;
    truthCorrection: string;
  };
  progressiveHints?: [string, string, string, string];
  wittyHostAside?: string;         // Optional <= 14-word punchline after reveal
}

// ----------------------------------------------------------------------------
// 3. 84 Playing Boards & Node State
// ----------------------------------------------------------------------------
export interface BoardNodeV6 {
  nodeId: string;
  index: number;
  categoryLabel: string;
  domainId: number;
  baseChips: number;
  multBonus: number;
  difficultyOffset: number;
  owner: 'NONE' | 'PLAYER' | 'RIVAL' | 'LOCKED_VAULT';
  lockedChains: number;            // 0 = unlocked, 1+ = iron chains to break
  hasTrapFuse?: boolean;
  isMysteryAuction?: boolean;
  isDoubleAgentMole?: boolean;
  ringIndex?: number;              // For rotary/orrery boards
  tierIndex?: number;              // For pyramid/skyscraper boards
  neighbors: string[];             // Graph adjacency for bridges/lasers/chains
  pos3d: [number, number, number]; // Normalized stage coordinates
}

export interface BoardDefinitionV6 {
  boardId: string;                 // e.g. 'board_001_clockwork_orrery' .. 'board_100_colosseum_altar'
  boardNumber: number;             // 1 .. 100
  name: string;
  family: BoardFamilyIdV6;
  signatureStage: StageWorldIdV6;  // Native architectural world look & feel
  tagline: string;                 // <= 12 words explaining the unique rule & twist
  symphonyTrack: SymphonyTrackIdV6;
  defaultTwist: BoardTwistMutationIdV6;
  targetWinCondition: string;
  nodeCount: number;
  mechanicArchetype:
    | 'CONCENTRIC_RINGS'
    | 'HEX_TURF_BRIDGE'
    | 'PINBALL_DROP'
    | 'STEPPED_PYRAMID'
    | 'LASER_MIRROR_GRID'
    | 'DOMINO_CHAIN'
    | 'SONAR_RADAR_SWEEP'
    | 'BLACKJACK_21_FELT'
    | 'FERRIS_WHEEL'
    | 'PENDULUM_BRIDGE'
    | 'CONVEYOR_FACTORY'
    | 'BALANCE_SCALE'
    | 'SUBWAY_NETWORK'
    | 'SHELL_MONTE_BLUFF'
    | 'MINESWEEPER_VAULTS'
    | 'PRISM_SPLITTER'
    | 'ELEVATOR_SHAFTS'
    | 'CARNIVAL_SHOOTING_GALLERY'
    | 'ASTRAL_CONSTELLATION'
    | 'SPLIT_OR_STEAL_ARENA';
  accentPalette: {
    primaryHex: number;
    secondaryHex: number;
    gemHex: number;
  };
}

export interface BoardRuntimeStateV6 {
  definition: BoardDefinitionV6;
  activeTwist: BoardTwistMutationIdV6;
  nodes: BoardNodeV6[];
  turnNumber: number;
  maxTurns: number;
  ringRotationsDeg: [number, number, number];
  alignedNodeIds: string[];
  playerScoreChips: number;
  playerMult: number;
  playerTotalCash: number;
  rivalTotalCash: number;
  rivalName: string;
  streakCount: number;
}

// ----------------------------------------------------------------------------
// 4. 84 Question Toys & Resolution Result
// ----------------------------------------------------------------------------
export interface ToyDefinitionV6 {
  toyId: string;                   // e.g. 'toy_01_cut_3_bomb_wires' .. 'toy_84_sudden_crossfire'
  toyNumber: number;               // 1 .. 84
  name: string;
  family: ToyFamilyIdV6;
  actionCallout: string;           // <= 5 words (e.g. "CUT 3 WRONG WIRES")
  baseSeconds: number;
  isTwistToy: boolean;
}

export interface ToyResolutionV6 {
  correct: boolean;
  accuracyRatio: number;           // 0.0 - 1.0 (e.g. 0.94 for 84km globe pinpoint)
  secondsRemaining: number;
  chipsEarned: number;
  multDelta: number;
  specificActionTag: string;       // e.g. 'cut_blue_wire', 'bullseye_globe', 'cryptex_solved'
}

// ----------------------------------------------------------------------------
// 5. Trapdoor Survival, Backstage Relics/Foils, Trophies/Medals & Story
// ----------------------------------------------------------------------------
export interface RelicDefinitionV6 {
  relicId: string;
  name: string;
  shortEffect: string;             // <= 8 words (e.g. "+2.5 MULT ON SCIENCE CLUES")
  costCash: number;
  rarity: 'BRASS' | 'STERLING' | 'GOLD' | 'CONTRABAND';
  meshArchetype:
    | 'VACUUM_TUBE'
    | 'LUCKY_COIN'
    | 'VINTAGE_MIC'
    | 'ASTROLABE'
    | 'POCKET_WATCH'
    | 'TUNING_FORK'
    | 'PRISM_LENS'
    | 'MAGNET_HORSESHOE'
    | 'NIXIE_VALVE'
    | 'GOLD_DICE'
    | 'TELEGRAPH_KEY'
    | 'CROWN_SEAL';
}

export interface FoilTrickCardV6 {
  cardId: string;
  name: string;
  shortEffect: string;             // <= 7 words
  costCash: number;
  effectKind:
    | 'FREEZE_NODE'
    | 'DOUBLE_MULT'
    | 'SCREW_RIVAL'
    | 'ROTATE_RING_FREE'
    | 'REVEAL_MOLE'
    | 'DEFUSE_ONE_WIRE'
    | 'SHATTER_CHAINS'
    | 'STEAL_RIVAL_POT'
    | 'SWAP_CLUE_TOY';
}

export interface HonorAwardDefinitionV6 {
  awardId: string;
  kind: 'TROPHY' | 'MEDAL';
  name: string;
  engraving: string;               // Crisp human inscription on the brass plaque
  unlockRequirement: string;
  materialTier: 'CAST_BRONZE' | 'CLOISONNE_ENAMEL' | 'STERLING_SILVER' | 'GOLD_24K' | 'OBSIDIAN_RUBY';
  sculptArchetype: string;
}

export interface ReactiveDialogueBeatV6 {
  beatId: string;
  speakerId: 'FRANKIE' | 'JULIAN' | 'SLOANE' | 'RIVAL';
  speakerDisplayName: string;
  speakerRoleTag: string;
  triggerTags: string[];           // e.g. ['cut_wrong_wire', 'trapdoor_clutch', 'ep_04']
  priority: number;
  lines: [string] | [string, string]; // STRICT MAX 2 SHORT LINES (zero walls of prose!)
}

export interface MatchEventMemoryV6 {
  episodeNumber: number;
  lastBoardId: string;
  lastToyId: string;
  lastActionTags: string[];        // e.g. ['cut_blue_wire', 'trapdoor_survived', 'screwed_frankie']
  wonLastMatch: boolean;
  survivedTrapdoorCount: number;
  maxStreakReached: number;
  bankrollCash: number;
  equippedRelicIds: string[];
}
