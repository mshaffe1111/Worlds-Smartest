// ============================================================================
// WORLD'S SMARTEST v6.0 — Interactive Question Toy Catalog (Toys 001–050)
// Families I–V:
//   I.   DEFUSAL_ELIMINATION       (Toys 001–010)
//   II.  ATLAS_RELIEF_SPATIAL      (Toys 011–020) — Powered by AtlasReliefGlobe3DV6
//   III. DIALS_CRYPTEX_LOCKS       (Toys 021–030)
//   IV.  RAPID_PADDLES_REFLEX      (Toys 031–040)
//   V.   PROGRESSIVE_AUDIO_REVEAL  (Toys 041–050)
// ============================================================================

import type {
  CalibratedClueV6,
  FoleySfxIdV6,
  ToyDefinitionV6,
  ToyFamilyIdV6,
} from '../contracts_v6';

export type ToyMechanicModeAV6 =
  // Family I: Defusal & Elimination (Toys 1-10)
  | 'DEFUSAL_BOMB_WIRES'
  | 'DEFUSAL_STATUE_SMASH'
  | 'DEFUSAL_TRAPDOOR_TILES'
  | 'DEFUSAL_CIRCUIT_BREAKERS'
  | 'DEFUSAL_CROCODILE_TEETH'
  | 'DEFUSAL_DECOY_CANDLES'
  | 'DEFUSAL_SHORT_PLUGS'
  | 'DEFUSAL_CARNIVAL_BALLOONS'
  | 'DEFUSAL_SABOTEUR_PODS'
  | 'DEFUSAL_RIGGED_FUSE'
  // Family II: 3D Shaded-Relief World Atlas Spatial (Toys 11-20)
  | 'ATLAS_PIN_DROP'
  | 'ATLAS_FLIGHT_DUEL'
  | 'ATLAS_LATITUDE_SLIDER'
  | 'ATLAS_TRENCH_PLUNGE'
  | 'ATLAS_PEAK_PICK'
  | 'ATLAS_COMPASS_BEARING'
  | 'ATLAS_SUN_TERMINATOR'
  | 'ATLAS_HEMISPHERE_SORT'
  | 'ATLAS_ANTIPODE_GUESS'
  | 'ATLAS_LANDMARK_ORBIT'
  // Family III: Horological Dials, Cryptex & Mechanical Locks (Toys 21-30)
  | 'DIAL_CRYPTEX_RINGS'
  | 'DIAL_ROTARY_VAULT'
  | 'DIAL_TACHOMETER_270'
  | 'DIAL_SPLIT_FLAP'
  | 'DIAL_MARQUEE_VOWELS'
  | 'DIAL_ANAGRAM_RAIL'
  | 'DIAL_COMBO_PADLOCK'
  | 'DIAL_CASH_REGISTER'
  | 'DIAL_VERNIER_CALIPER'
  | 'DIAL_TELEGRAPH_KEY'
  // Family IV: Rapid Paddles & WarioWare Reflex (Toys 31-40)
  | 'REFLEX_SPRING_PADDLES'
  | 'REFLEX_PNEUMATIC_PISTONS'
  | 'REFLEX_BUZZER_CHICKEN'
  | 'REFLEX_CONVEYOR_SORT'
  | 'REFLEX_CRATE_CATCH'
  | 'REFLEX_QUICK_DRAW'
  | 'REFLEX_GUILLOTINE_LEVER'
  | 'REFLEX_THREE_CUP_SHELL'
  | 'REFLEX_PINBALL_FLIPPER'
  | 'REFLEX_HOT_MIC_BLITZ'
  // Family V: Progressive Unmasking & Audio Reveal (Toys 41-50)
  | 'REVEAL_FOUR_CLUE_JACKPOT'
  | 'REVEAL_SYMPHONY_EAR'
  | 'REVEAL_CAMERA_IRIS'
  | 'REVEAL_REDACTION_PEEL'
  | 'REVEAL_DARKROOM_SEARCHLIGHT'
  | 'REVEAL_MAGNIFYING_LOUPE'
  | 'REVEAL_YEAR_VISE_CLAMP'
  | 'REVEAL_QUOTE_STAMP'
  | 'REVEAL_SUSPECT_LINEUP'
  | 'REVEAL_RIDDLE_CYLINDER';

export interface ToySpec001To050V6 extends ToyDefinitionV6 {
  readonly mode: ToyMechanicModeAV6;
  readonly microTip: string;          // <= 8 crisp words for 1.5s first-time clarity
  readonly verbTag: string;           // 1-2 word stamp verb (SNIP, SMASH, DROP PIN, etc.)
  readonly safeTag: string;           // Feedback badge on safe/cleared item
  readonly foleyInteract: FoleySfxIdV6;
  readonly foleyLock: FoleySfxIdV6;
  readonly chassisTheme: {
    readonly primaryBg: string;
    readonly surfaceBg: string;
    readonly metalAccent: string;
    readonly glowColor: string;
    readonly dangerColor: string;
  };
}

export const TOY_CATALOG_001_TO_050: readonly ToySpec001To050V6[] = [
  // ==========================================================================
  // FAMILY I — DEFUSAL_ELIMINATION (Toys 001–010)
  // ==========================================================================
  {
    toyId: 'toy_01_cut_3_bomb_wires',
    toyNumber: 1,
    name: 'Cut 3 Wrong Bomb Wires',
    family: 'DEFUSAL_ELIMINATION',
    actionCallout: 'CUT 3 WRONG WIRES',
    baseSeconds: 18,
    isTwistToy: false,
    mode: 'DEFUSAL_BOMB_WIRES',
    microTip: 'Snip 3 decoys — leave the truth live!',
    verbTag: 'SNIP',
    safeTag: 'SAFE',
    foleyInteract: 'wire_cutter_snip',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1b212a 0%, #0d1118 100%)',
      surfaceBg: '#252d38',
      metalAccent: '#d6b162',
      glowColor: '#39e59c',
      dangerColor: '#ff4858',
    },
  },
  {
    toyId: 'toy_02_smash_impostor_statues',
    toyNumber: 2,
    name: 'Smash 3 Impostor Statues',
    family: 'DEFUSAL_ELIMINATION',
    actionCallout: 'SMASH 3 IMPOSTORS',
    baseSeconds: 17,
    isTwistToy: false,
    mode: 'DEFUSAL_STATUE_SMASH',
    microTip: 'Shatter 3 fake busts — spare the true one.',
    verbTag: 'SMASH',
    safeTag: 'FAKE!',
    foleyInteract: 'iron_chain_shatter',
    foleyLock: 'trophy_pedestal_chime',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #271e19 0%, #120d0a 100%)',
      surfaceBg: '#362a23',
      metalAccent: '#e2bd73',
      glowColor: '#f3d078',
      dangerColor: '#e65353',
    },
  },
  {
    toyId: 'toy_03_trapdoor_elimination',
    toyNumber: 3,
    name: '4-Tile Trapdoor Elimination',
    family: 'DEFUSAL_ELIMINATION',
    actionCallout: 'DROP 3 WRONG TILES',
    baseSeconds: 16,
    isTwistToy: false,
    mode: 'DEFUSAL_TRAPDOOR_TILES',
    microTip: 'Release 3 false floor hatches — keep truth standing.',
    verbTag: 'DROP',
    safeTag: 'DROPPED',
    foleyInteract: 'trapdoor_hinge_drop',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1d1a24 0%, #0b0a12 100%)',
      surfaceBg: '#2b2636',
      metalAccent: '#c8a258',
      glowColor: '#48e0a4',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_04_flip_lie_breakers',
    toyNumber: 4,
    name: 'Flip Off 3 Lie Breakers',
    family: 'DEFUSAL_ELIMINATION',
    actionCallout: 'TRIP 3 LIE BREAKERS',
    baseSeconds: 16,
    isTwistToy: false,
    mode: 'DEFUSAL_CIRCUIT_BREAKERS',
    microTip: 'Shut down 3 false circuits — keep truth powered.',
    verbTag: 'OFF',
    safeTag: 'ISOLATED',
    foleyInteract: 'rotary_knob_click',
    foleyLock: 'nixie_spark_crackle',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1a241c 0%, #0b110d 100%)',
      surfaceBg: '#253227',
      metalAccent: '#dfb45d',
      glowColor: '#ffb74d',
      dangerColor: '#ff4f4f',
    },
  },
  {
    toyId: 'toy_05_crocodile_safe_tooth',
    toyNumber: 5,
    name: 'Pull the Safe Crocodile Tooth',
    family: 'DEFUSAL_ELIMINATION',
    actionCallout: 'PULL 3 DECOY TEETH',
    baseSeconds: 17,
    isTwistToy: true,
    mode: 'DEFUSAL_CROCODILE_TEETH',
    microTip: 'Tap 3 harmless ivory teeth — do NOT pull the truth!',
    verbTag: 'PULL',
    safeTag: 'CLICK!',
    foleyInteract: 'brass_gear_detent',
    foleyLock: 'paddle_spring_slam',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #112a22 0%, #071510 100%)',
      surfaceBg: '#1c3d32',
      metalAccent: '#e7c477',
      glowColor: '#4ce89f',
      dangerColor: '#ff4355',
    },
  },
  {
    toyId: 'toy_06_snuff_decoy_candles',
    toyNumber: 6,
    name: 'Snuff 3 Decoy Candles',
    family: 'DEFUSAL_ELIMINATION',
    actionCallout: 'SNUFF 3 DECOY FLAMES',
    baseSeconds: 16,
    isTwistToy: false,
    mode: 'DEFUSAL_DECOY_CANDLES',
    microTip: 'Extinguish 3 false flames — leave truth burning.',
    verbTag: 'SNUFF',
    safeTag: 'OUT',
    foleyInteract: 'ui_brass_tap',
    foleyLock: 'trophy_pedestal_chime',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #271519 0%, #10080a 100%)',
      surfaceBg: '#371f24',
      metalAccent: '#f2c872',
      glowColor: '#ffbd59',
      dangerColor: '#ff4c5e',
    },
  },
  {
    toyId: 'toy_07_unplug_short_circuits',
    toyNumber: 7,
    name: 'Unplug Short-Circuits',
    family: 'DEFUSAL_ELIMINATION',
    actionCallout: 'YANK 3 BAD PLUGS',
    baseSeconds: 16,
    isTwistToy: false,
    mode: 'DEFUSAL_SHORT_PLUGS',
    microTip: 'Pull 3 shorted jacks — keep the true patch plugged.',
    verbTag: 'YANK',
    safeTag: 'UNPLUGGED',
    foleyInteract: 'nixie_spark_crackle',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #211812 0%, #0e0a07 100%)',
      surfaceBg: '#32241a',
      metalAccent: '#d9aa57',
      glowColor: '#56d8ff',
      dangerColor: '#ff5147',
    },
  },
  {
    toyId: 'toy_08_pop_carnival_balloons',
    toyNumber: 8,
    name: 'Pop Fake Carnival Balloons',
    family: 'DEFUSAL_ELIMINATION',
    actionCallout: 'POP 3 FAKE BALLOONS',
    baseSeconds: 15,
    isTwistToy: false,
    mode: 'DEFUSAL_CARNIVAL_BALLOONS',
    microTip: 'Burst 3 decoy balloons — spare the prize balloon!',
    verbTag: 'POP',
    safeTag: 'POPPED',
    foleyInteract: 'paddle_spring_slam',
    foleyLock: 'crowd_warm_applause',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #22142e 0%, #0c0714 100%)',
      surfaceBg: '#322044',
      metalAccent: '#f2cb6e',
      glowColor: '#66e6b8',
      dangerColor: '#ff4e6a',
    },
  },
  {
    toyId: 'toy_09_eject_saboteur_pods',
    toyNumber: 9,
    name: 'Eject Saboteur Pods',
    family: 'DEFUSAL_ELIMINATION',
    actionCallout: 'EJECT 3 SABOTEURS',
    baseSeconds: 16,
    isTwistToy: true,
    mode: 'DEFUSAL_SABOTEUR_PODS',
    microTip: 'Jettison 3 impostor pods — dock the true crew.',
    verbTag: 'EJECT',
    safeTag: 'EJECTED',
    foleyInteract: 'pneumatic_piston_slam',
    foleyLock: 'optical_beam_lock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #101e2e 0%, #060c14 100%)',
      surfaceBg: '#192d44',
      metalAccent: '#d5b268',
      glowColor: '#54d9ff',
      dangerColor: '#ff4b5c',
    },
  },
  {
    toyId: 'toy_10_cut_rigged_fuse',
    toyNumber: 10,
    name: 'Cut the Rigged Fuse',
    family: 'DEFUSAL_ELIMINATION',
    actionCallout: 'SNIP 3 BURNING FUSES',
    baseSeconds: 14,
    isTwistToy: true,
    mode: 'DEFUSAL_RIGGED_FUSE',
    microTip: 'Snip 3 rigged fuses before sparks reach the keg!',
    verbTag: 'SNIP',
    safeTag: 'DOUSED',
    foleyInteract: 'wire_cutter_snip',
    foleyLock: 'nixie_spark_crackle',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #291811 0%, #120905 100%)',
      surfaceBg: '#3c2418',
      metalAccent: '#eab962',
      glowColor: '#ffae42',
      dangerColor: '#ff3b3b',
    },
  },

  // ==========================================================================
  // FAMILY II — ATLAS_RELIEF_SPATIAL (Toys 011–020)
  // Powered by Three.js Ultra-HD 4K Shaded-Relief World Globe (AtlasReliefGlobe3DV6)
  // ==========================================================================
  {
    toyId: 'toy_11_globe_pin_drop',
    toyNumber: 11,
    name: '3D Relief Globe Pin-Drop',
    family: 'ATLAS_RELIEF_SPATIAL',
    actionCallout: 'DROP RUBY PIN ON GLOBE',
    baseSeconds: 22,
    isTwistToy: false,
    mode: 'ATLAS_PIN_DROP',
    microTip: 'Spin 3D globe, tap to plant ruby pin, then LOCK.',
    verbTag: 'LOCK PIN',
    safeTag: 'BULLSEYE',
    foleyInteract: 'globe_pin_ruby_click',
    foleyLock: 'crystal_hex_claim',
    chassisTheme: {
      primaryBg: 'radial-gradient(circle at 50% 40%, #102845 0%, #050d1a 100%)',
      surfaceBg: '#0e2238',
      metalAccent: '#e6c274',
      glowColor: '#56d8ff',
      dangerColor: '#ff5268',
    },
  },
  {
    toyId: 'toy_12_flight_great_circle_duel',
    toyNumber: 12,
    name: 'Flight-Path Great-Circle Closer Duel',
    family: 'ATLAS_RELIEF_SPATIAL',
    actionCallout: 'PICK CLOSER FLIGHT ARC',
    baseSeconds: 18,
    isTwistToy: false,
    mode: 'ATLAS_FLIGHT_DUEL',
    microTip: 'Compare great-circle arcs on the 3D globe.',
    verbTag: 'SELECT',
    safeTag: 'CLOSER!',
    foleyInteract: 'globe_pin_ruby_click',
    foleyLock: 'optical_beam_lock',
    chassisTheme: {
      primaryBg: 'radial-gradient(circle at 50% 40%, #132c48 0%, #050d18 100%)',
      surfaceBg: '#12263f',
      metalAccent: '#f0ca78',
      glowColor: '#48e5b8',
      dangerColor: '#ff5c6c',
    },
  },
  {
    toyId: 'toy_13_latitude_equator_slider',
    toyNumber: 13,
    name: 'Latitude Equator-to-Pole Slider',
    family: 'ATLAS_RELIEF_SPATIAL',
    actionCallout: 'SLIDE LATITUDE RING',
    baseSeconds: 18,
    isTwistToy: false,
    mode: 'ATLAS_LATITUDE_SLIDER',
    microTip: 'Sweep the golden parallel to the target latitude.',
    verbTag: 'LOCK LAT',
    safeTag: 'ALIGNED',
    foleyInteract: 'neve_fader_detent',
    foleyLock: 'optical_beam_lock',
    chassisTheme: {
      primaryBg: 'radial-gradient(circle at 50% 40%, #12283e 0%, #060e18 100%)',
      surfaceBg: '#112539',
      metalAccent: '#e6bf6b',
      glowColor: '#f6d27a',
      dangerColor: '#ff5768',
    },
  },
  {
    toyId: 'toy_14_ocean_trench_plunge',
    toyNumber: 14,
    name: 'Ocean Trench Depth Plunge',
    family: 'ATLAS_RELIEF_SPATIAL',
    actionCallout: 'LOCATE DEEP WATERS',
    baseSeconds: 19,
    isTwistToy: false,
    mode: 'ATLAS_TRENCH_PLUNGE',
    microTip: 'Inspect bathymetry & tap the matching sea or basin.',
    verbTag: 'SONAR LOCK',
    safeTag: 'PINGED',
    foleyInteract: 'globe_pin_ruby_click',
    foleyLock: 'crystal_hex_claim',
    chassisTheme: {
      primaryBg: 'radial-gradient(circle at 50% 40%, #0a2538 0%, #030b14 100%)',
      surfaceBg: '#0c2233',
      metalAccent: '#cfab60',
      glowColor: '#3ee2ff',
      dangerColor: '#ff5268',
    },
  },
  {
    toyId: 'toy_15_continent_peak_pick',
    toyNumber: 15,
    name: 'Continent Elevation Peak Pick',
    family: 'ATLAS_RELIEF_SPATIAL',
    actionCallout: 'SPOT THE RELIEF RANGE',
    baseSeconds: 19,
    isTwistToy: false,
    mode: 'ATLAS_PEAK_PICK',
    microTip: 'Examine the 3D mountain relief & claim the right peak.',
    verbTag: 'CLAIM PEAK',
    safeTag: 'SUMMIT!',
    foleyInteract: 'globe_pin_ruby_click',
    foleyLock: 'trophy_pedestal_chime',
    chassisTheme: {
      primaryBg: 'radial-gradient(circle at 50% 40%, #1d2b38 0%, #080f16 100%)',
      surfaceBg: '#1a2733',
      metalAccent: '#e8c26e',
      glowColor: '#ffcf70',
      dangerColor: '#ff5766',
    },
  },
  {
    toyId: 'toy_16_compass_bearing_lock',
    toyNumber: 16,
    name: 'Compass Bearing Lock',
    family: 'ATLAS_RELIEF_SPATIAL',
    actionCallout: 'AIM COMPASS BEARING',
    baseSeconds: 18,
    isTwistToy: false,
    mode: 'ATLAS_COMPASS_BEARING',
    microTip: 'Rotate the brass compass needle toward the target.',
    verbTag: 'LOCK HEADING',
    safeTag: 'ON COURSE',
    foleyInteract: 'brass_gear_detent',
    foleyLock: 'optical_beam_lock',
    chassisTheme: {
      primaryBg: 'radial-gradient(circle at 50% 40%, #152b3b 0%, #071019 100%)',
      surfaceBg: '#132735',
      metalAccent: '#ecc674',
      glowColor: '#56e2b4',
      dangerColor: '#ff5566',
    },
  },
  {
    toyId: 'toy_17_timezone_sun_terminator',
    toyNumber: 17,
    name: 'Time-Zone Sun Terminator',
    family: 'ATLAS_RELIEF_SPATIAL',
    actionCallout: 'ALIGN SOLAR MERIDIAN',
    baseSeconds: 20,
    isTwistToy: true,
    mode: 'ATLAS_SUN_TERMINATOR',
    microTip: 'Sweep the daylight meridian to match the zone.',
    verbTag: 'LOCK SOLAR',
    safeTag: 'SYNCED',
    foleyInteract: 'rotary_knob_click',
    foleyLock: 'crystal_hex_claim',
    chassisTheme: {
      primaryBg: 'radial-gradient(circle at 50% 40%, #16223d 0%, #050a16 100%)',
      surfaceBg: '#131e36',
      metalAccent: '#f2ca70',
      glowColor: '#ffb74d',
      dangerColor: '#ff5566',
    },
  },
  {
    toyId: 'toy_18_hemisphere_sorter',
    toyNumber: 18,
    name: 'Hemisphere Sorter',
    family: 'ATLAS_RELIEF_SPATIAL',
    actionCallout: 'PICK THE HEMISPHERE',
    baseSeconds: 15,
    isTwistToy: false,
    mode: 'ATLAS_HEMISPHERE_SORT',
    microTip: 'Select NW, NE, SW, or SE quadrant on the 3D globe.',
    verbTag: 'QUADRANT',
    safeTag: 'LOCKED',
    foleyInteract: 'ui_brass_tap',
    foleyLock: 'crystal_hex_claim',
    chassisTheme: {
      primaryBg: 'radial-gradient(circle at 50% 40%, #112a40 0%, #060e18 100%)',
      surfaceBg: '#0f2538',
      metalAccent: '#e2bd6d',
      glowColor: '#4be2a8',
      dangerColor: '#ff5465',
    },
  },
  {
    toyId: 'toy_19_antipode_opposite_earth',
    toyNumber: 19,
    name: 'Antipode Opposite-Earth Guess',
    family: 'ATLAS_RELIEF_SPATIAL',
    actionCallout: 'PIN OPPOSITE EARTH',
    baseSeconds: 22,
    isTwistToy: true,
    mode: 'ATLAS_ANTIPODE_GUESS',
    microTip: 'Spin 180° around the globe and drop pin on the antipode!',
    verbTag: 'LOCK ANTIPODE',
    safeTag: 'THROUGH EARTH',
    foleyInteract: 'globe_pin_ruby_click',
    foleyLock: 'optical_beam_lock',
    chassisTheme: {
      primaryBg: 'radial-gradient(circle at 50% 40%, #1c1e42 0%, #070818 100%)',
      surfaceBg: '#191b3b',
      metalAccent: '#f0c76f',
      glowColor: '#a682ff',
      dangerColor: '#ff5566',
    },
  },
  {
    toyId: 'toy_20_landmark_orbit_zoom',
    toyNumber: 20,
    name: 'Landmark Orbit Zoom',
    family: 'ATLAS_RELIEF_SPATIAL',
    actionCallout: 'IDENTIFY ORBIT TARGET',
    baseSeconds: 18,
    isTwistToy: false,
    mode: 'ATLAS_LANDMARK_ORBIT',
    microTip: 'The 3D camera orbits the clue region — pick the landmark!',
    verbTag: 'IDENTIFY',
    safeTag: 'VERIFIED',
    foleyInteract: 'ui_brass_tap',
    foleyLock: 'trophy_pedestal_chime',
    chassisTheme: {
      primaryBg: 'radial-gradient(circle at 50% 40%, #112c3f 0%, #050d15 100%)',
      surfaceBg: '#102738',
      metalAccent: '#ecc674',
      glowColor: '#56d8ff',
      dangerColor: '#ff5566',
    },
  },

  // ==========================================================================
  // FAMILY III — DIALS_CRYPTEX_LOCKS (Toys 021–030)
  // ==========================================================================
  {
    toyId: 'toy_21_brass_cryptex_tumbler',
    toyNumber: 21,
    name: '3D Brass Cryptex Ring Tumbler',
    family: 'DIALS_CRYPTEX_LOCKS',
    actionCallout: 'SPIN BRASS RINGS',
    baseSeconds: 24,
    isTwistToy: false,
    mode: 'DIAL_CRYPTEX_RINGS',
    microTip: 'Flick or tap engraved brass rings to spell the answer.',
    verbTag: 'UNLOCK',
    safeTag: 'CRACKED!',
    foleyInteract: 'cryptex_stone_tumbler',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #271b10 0%, #100a06 100%)',
      surfaceBg: '#372617',
      metalAccent: '#f0c768',
      glowColor: '#ffd470',
      dangerColor: '#e8525d',
    },
  },
  {
    toyId: 'toy_22_rotary_vault_cracker',
    toyNumber: 22,
    name: 'Rotary Vault Safe-Cracker',
    family: 'DIALS_CRYPTEX_LOCKS',
    actionCallout: 'CRACK THE VAULT DIAL',
    baseSeconds: 20,
    isTwistToy: false,
    mode: 'DIAL_ROTARY_VAULT',
    microTip: 'Spin the brass vault wheel to the right stop & crack it.',
    verbTag: 'CRACK',
    safeTag: 'OPEN!',
    foleyInteract: 'rotary_knob_click',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1d2229 0%, #0c0e12 100%)',
      surfaceBg: '#2b323c',
      metalAccent: '#e2bd6a',
      glowColor: '#48e0a4',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_23_brass_tachometer_270',
    toyNumber: 23,
    name: '270° Brass Tachometer Needle',
    family: 'DIALS_CRYPTEX_LOCKS',
    actionCallout: 'SET BRASS NEEDLE',
    baseSeconds: 20,
    isTwistToy: false,
    mode: 'DIAL_TACHOMETER_270',
    microTip: 'Drag the illuminated 270° needle to the target value.',
    verbTag: 'LOCK DIAL',
    safeTag: 'BULLSEYE',
    foleyInteract: 'brass_gear_detent',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1b1815 0%, #0b0908 100%)',
      surfaceBg: '#2b241d',
      metalAccent: '#efca72',
      glowColor: '#ff9d3b',
      dangerColor: '#ff4f5e',
    },
  },
  {
    toyId: 'toy_24_airport_split_flap',
    toyNumber: 24,
    name: 'Airport Split-Flap Clacker',
    family: 'DIALS_CRYPTEX_LOCKS',
    actionCallout: 'FLIP DEPARTURE BOARD',
    baseSeconds: 19,
    isTwistToy: false,
    mode: 'DIAL_SPLIT_FLAP',
    microTip: 'Clack the Solari flaps to align the true answer.',
    verbTag: 'BOARD',
    safeTag: 'DEPARTING',
    foleyInteract: 'brass_gear_detent',
    foleyLock: 'trophy_pedestal_chime',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #181a1f 0%, #0a0b0e 100%)',
      surfaceBg: '#23262e',
      metalAccent: '#f2c968',
      glowColor: '#ffd25a',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_25_missing_vowel_marquee',
    toyNumber: 25,
    name: 'Missing-Vowel Marquee Bulbs',
    family: 'DIALS_CRYPTEX_LOCKS',
    actionCallout: 'LIGHT MISSING VOWELS',
    baseSeconds: 21,
    isTwistToy: false,
    mode: 'DIAL_MARQUEE_VOWELS',
    microTip: 'Tap A/E/I/O/U bulbs to light up the Broadway marquee.',
    verbTag: 'LIGHT UP',
    safeTag: 'SHOWTIME!',
    foleyInteract: 'ui_brass_tap',
    foleyLock: 'crowd_warm_applause',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #2d1219 0%, #12060a 100%)',
      surfaceBg: '#421a24',
      metalAccent: '#f8d274',
      glowColor: '#ffe082',
      dangerColor: '#ff4e5e',
    },
  },
  {
    toyId: 'toy_26_anagram_brass_rail',
    toyNumber: 26,
    name: 'Anagram Brass Tile Rail',
    family: 'DIALS_CRYPTEX_LOCKS',
    actionCallout: 'UNSCRAMBLE BRASS TILES',
    baseSeconds: 22,
    isTwistToy: false,
    mode: 'DIAL_ANAGRAM_RAIL',
    microTip: 'Tap scrambled letter slugs in order onto the rail.',
    verbTag: 'VERIFY',
    safeTag: 'SOLVED!',
    foleyInteract: 'medal_enamel_clink',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #231912 0%, #0e0906 100%)',
      surfaceBg: '#332419',
      metalAccent: '#e9c26a',
      glowColor: '#56e2a8',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_27_combination_padlock',
    toyNumber: 27,
    name: 'Combination Padlock',
    family: 'DIALS_CRYPTEX_LOCKS',
    actionCallout: 'DIAL 4-WHEEL LOCK',
    baseSeconds: 20,
    isTwistToy: false,
    mode: 'DIAL_COMBO_PADLOCK',
    microTip: 'Roll the 4 numbered brass wheels to match the target year/number.',
    verbTag: 'POP SHACKLE',
    safeTag: 'UNLOCKED',
    foleyInteract: 'cryptex_stone_tumbler',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1d2026 0%, #0b0d11 100%)',
      surfaceBg: '#2c313b',
      metalAccent: '#e8c16c',
      glowColor: '#48e5a4',
      dangerColor: '#ff4e5f',
    },
  },
  {
    toyId: 'toy_28_vintage_cash_register',
    toyNumber: 28,
    name: 'Vintage Cash-Register Keys',
    family: 'DIALS_CRYPTEX_LOCKS',
    actionCallout: 'PUNCH THE BRASS KEY',
    baseSeconds: 15,
    isTwistToy: false,
    mode: 'DIAL_CASH_REGISTER',
    microTip: 'Press the brass register key to pop the truth flag!',
    verbTag: 'RING UP',
    safeTag: 'CHA-CHING!',
    foleyInteract: 'medal_enamel_clink',
    foleyLock: 'chip_stack_riffle',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #2a1e12 0%, #110c07 100%)',
      surfaceBg: '#3f2e1c',
      metalAccent: '#f5ce74',
      glowColor: '#ffd666',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_29_vernier_caliper_gauge',
    toyNumber: 29,
    name: 'Vernier Caliper Gauge',
    family: 'DIALS_CRYPTEX_LOCKS',
    actionCallout: 'SLIDE CALIPER JAWS',
    baseSeconds: 19,
    isTwistToy: false,
    mode: 'DIAL_VERNIER_CALIPER',
    microTip: 'Drag the precision brass caliper jaw to measure the answer.',
    verbTag: 'CLAMP',
    safeTag: 'PRECISION!',
    foleyInteract: 'neve_fader_detent',
    foleyLock: 'optical_beam_lock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1a2125 0%, #090d10 100%)',
      surfaceBg: '#273137',
      metalAccent: '#e2be6c',
      glowColor: '#56d4f5',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_30_telegraph_brass_key',
    toyNumber: 30,
    name: 'Telegraph Brass Key',
    family: 'DIALS_CRYPTEX_LOCKS',
    actionCallout: 'TAP SIGNAL CHANNEL',
    baseSeconds: 17,
    isTwistToy: true,
    mode: 'DIAL_TELEGRAPH_KEY',
    microTip: 'Tune the channel & strike the brass telegraph key to transmit.',
    verbTag: 'TRANSMIT',
    safeTag: 'RECEIVED',
    foleyInteract: 'clock_horology_tick',
    foleyLock: 'nixie_spark_crackle',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #241911 0%, #0e0905 100%)',
      surfaceBg: '#362619',
      metalAccent: '#ecc46e',
      glowColor: '#ffbe55',
      dangerColor: '#ff515f',
    },
  },

  // ==========================================================================
  // FAMILY IV — RAPID_PADDLES_REFLEX (Toys 031–040)
  // ==========================================================================
  {
    toyId: 'toy_31_spring_paddles_dis_dat',
    toyNumber: 31,
    name: 'Spring-Loaded 2-Paddle DIS OR DAT',
    family: 'RAPID_PADDLES_REFLEX',
    actionCallout: 'SLAM DIS OR DAT',
    baseSeconds: 18,
    isTwistToy: false,
    mode: 'REFLEX_SPRING_PADDLES',
    microTip: 'Slam Left or Right spring paddle — chain a combo!',
    verbTag: 'SLAM',
    safeTag: 'STREAK!',
    foleyInteract: 'paddle_spring_slam',
    foleyLock: 'streak_chord_3',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1c1829 0%, #0a0812 100%)',
      surfaceBg: '#2a243d',
      metalAccent: '#f2ca70',
      glowColor: '#48e5a4',
      dangerColor: '#ff4e63',
    },
  },
  {
    toyId: 'toy_32_pneumatic_whack_pistons',
    toyNumber: 32,
    name: 'Pneumatic Whack-the-Truth Pistons',
    family: 'RAPID_PADDLES_REFLEX',
    actionCallout: 'WHACK THE TRUE PISTON',
    baseSeconds: 15,
    isTwistToy: false,
    mode: 'REFLEX_PNEUMATIC_PISTONS',
    microTip: 'Slam the rising truth piston before it retracts!',
    verbTag: 'WHACK',
    safeTag: 'DIRECT HIT',
    foleyInteract: 'pneumatic_piston_slam',
    foleyLock: 'streak_chord_2',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #251c16 0%, #100b08 100%)',
      surfaceBg: '#382a20',
      metalAccent: '#ebb95f',
      glowColor: '#4be59e',
      dangerColor: '#ff4b58',
    },
  },
  {
    toyId: 'toy_33_buzzer_chicken_redline',
    toyNumber: 33,
    name: 'Buzzer Chicken (Stop Before Redline)',
    family: 'RAPID_PADDLES_REFLEX',
    actionCallout: 'STOP BEFORE REDLINE',
    baseSeconds: 15,
    isTwistToy: true,
    mode: 'REFLEX_BUZZER_CHICKEN',
    microTip: 'Wait as the needle builds chips — SLAM before redline!',
    verbTag: 'SLAM STOP',
    safeTag: 'CLUTCH!',
    foleyInteract: 'clock_escapement_urgent',
    foleyLock: 'screw_rival_slam',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #2a1216 0%, #110608 100%)',
      surfaceBg: '#3e1a21',
      metalAccent: '#f2c86e',
      glowColor: '#ffb74d',
      dangerColor: '#ff3648',
    },
  },
  {
    toyId: 'toy_34_conveyor_lr_sorter',
    toyNumber: 34,
    name: 'Conveyor Left/Right Sorter',
    family: 'RAPID_PADDLES_REFLEX',
    actionCallout: 'SORT CRATES LEFT/RIGHT',
    baseSeconds: 18,
    isTwistToy: false,
    mode: 'REFLEX_CONVEYOR_SORT',
    microTip: 'Flick moving factory crates into Left or Right chute!',
    verbTag: 'SHUNT',
    safeTag: 'SORTED',
    foleyInteract: 'paddle_spring_slam',
    foleyLock: 'chip_stack_riffle',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1d2224 0%, #0b0d0e 100%)',
      surfaceBg: '#2d3438',
      metalAccent: '#e2bd6a',
      glowColor: '#56d8ff',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_35_falling_crate_catch',
    toyNumber: 35,
    name: 'Falling Crate Catch',
    family: 'RAPID_PADDLES_REFLEX',
    actionCallout: 'CATCH THE TRUE CRATE',
    baseSeconds: 15,
    isTwistToy: false,
    mode: 'REFLEX_CRATE_CATCH',
    microTip: 'Slide the brass rail cart under the falling true answer!',
    verbTag: 'CATCH',
    safeTag: 'CAUGHT!',
    foleyInteract: 'pneumatic_piston_slam',
    foleyLock: 'crowd_warm_applause',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #221c16 0%, #0d0a07 100%)',
      surfaceBg: '#332a20',
      metalAccent: '#eab962',
      glowColor: '#56e2a8',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_36_quick_draw_sheriff',
    toyNumber: 36,
    name: 'Quick-Draw Sheriff Paddles',
    family: 'RAPID_PADDLES_REFLEX',
    actionCallout: 'QUICK-DRAW THE TRUTH',
    baseSeconds: 12,
    isTwistToy: false,
    mode: 'REFLEX_QUICK_DRAW',
    microTip: 'Wait for DRAW! — then slap the true badge fastest.',
    verbTag: 'DRAW!',
    safeTag: 'FASTEST!',
    foleyInteract: 'paddle_spring_slam',
    foleyLock: 'streak_chord_4',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #2b1d12 0%, #120b06 100%)',
      surfaceBg: '#402b1b',
      metalAccent: '#f5ca6c',
      glowColor: '#ffd25a',
      dangerColor: '#ff4858',
    },
  },
  {
    toyId: 'toy_37_guillotine_tf_lever',
    toyNumber: 37,
    name: 'Guillotine True/False Lever',
    family: 'RAPID_PADDLES_REFLEX',
    actionCallout: 'PULL TRUTH OR MYTH',
    baseSeconds: 13,
    isTwistToy: false,
    mode: 'REFLEX_GUILLOTINE_LEVER',
    microTip: 'Throw the chrome lever to spare TRUTH or slice MYTH.',
    verbTag: 'THROW',
    safeTag: 'CLEAN CUT',
    foleyInteract: 'trapdoor_hinge_drop',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #24161a 0%, #0e080a 100%)',
      surfaceBg: '#362127',
      metalAccent: '#e2be6c',
      glowColor: '#48e5a4',
      dangerColor: '#ff4355',
    },
  },
  {
    toyId: 'toy_38_three_cup_shell_track',
    toyNumber: 38,
    name: '3-Cup Shell Track',
    family: 'RAPID_PADDLES_REFLEX',
    actionCallout: 'TRACK THE TRUE CUP',
    baseSeconds: 16,
    isTwistToy: true,
    mode: 'REFLEX_THREE_CUP_SHELL',
    microTip: 'Watch the truth slip under a brass cup, follow the shuffle!',
    verbTag: 'LIFT CUP',
    safeTag: 'FOUND!',
    foleyInteract: 'chip_stack_riffle',
    foleyLock: 'trophy_pedestal_chime',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #0f291e 0%, #05110c 100%)',
      surfaceBg: '#193d2e',
      metalAccent: '#f2ca70',
      glowColor: '#ffd264',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_39_pinball_flipper_target',
    toyNumber: 39,
    name: 'Pinball Flipper Target',
    family: 'RAPID_PADDLES_REFLEX',
    actionCallout: 'FIRE FLIPPER AT TRUTH',
    baseSeconds: 16,
    isTwistToy: false,
    mode: 'REFLEX_PINBALL_FLIPPER',
    microTip: 'Aim & fire Left/Right brass flippers to hit the true bumper!',
    verbTag: 'FLIP!',
    safeTag: 'BUMPER HIT',
    foleyInteract: 'paddle_spring_slam',
    foleyLock: 'streak_chord_3',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1b1530 0%, #0a0715 100%)',
      surfaceBg: '#2a214a',
      metalAccent: '#f5cc6e',
      glowColor: '#54e4ff',
      dangerColor: '#ff4e63',
    },
  },
  {
    toyId: 'toy_40_hot_mic_rapid_blitz',
    toyNumber: 40,
    name: 'Hot-Mic Rapid Blitz',
    family: 'RAPID_PADDLES_REFLEX',
    actionCallout: 'PUNCH THE HOT MIC',
    baseSeconds: 16,
    isTwistToy: false,
    mode: 'REFLEX_HOT_MIC_BLITZ',
    microTip: 'Statements flash live — slam ON AIR for truth, CUT for fake!',
    verbTag: 'ON AIR',
    safeTag: 'LIVE HIT',
    foleyInteract: 'ui_brass_tap',
    foleyLock: 'crowd_studio_roar',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #27151b 0%, #10080b 100%)',
      surfaceBg: '#3a2028',
      metalAccent: '#ecc56f',
      glowColor: '#ff6b6b',
      dangerColor: '#ff3b4f',
    },
  },

  // ==========================================================================
  // FAMILY V — PROGRESSIVE_AUDIO_REVEAL (Toys 041–050)
  // ==========================================================================
  {
    toyId: 'toy_41_four_clue_jackpot',
    toyNumber: 41,
    name: '4-Clue Cascading Jackpot',
    family: 'PROGRESSIVE_AUDIO_REVEAL',
    actionCallout: 'BUZZ EARLY FOR $1,000',
    baseSeconds: 22,
    isTwistToy: false,
    mode: 'REVEAL_FOUR_CLUE_JACKPOT',
    microTip: 'Answer at Clue 1 for $1,000, or reveal more clues for less.',
    verbTag: 'BUZZ IN',
    safeTag: 'JACKPOT!',
    foleyInteract: 'velvet_trunk_clasp',
    foleyLock: 'streak_fanfare_5',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #231a11 0%, #0d0905 100%)',
      surfaceBg: '#342719',
      metalAccent: '#f5ce74',
      glowColor: '#ffd466',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_42_symphony_ear_test',
    toyNumber: 42,
    name: 'Symphony Composer/Era Ear-Test',
    family: 'PROGRESSIVE_AUDIO_REVEAL',
    actionCallout: 'DROP NEEDLE & IDENTIFY',
    baseSeconds: 20,
    isTwistToy: false,
    mode: 'REVEAL_SYMPHONY_EAR',
    microTip: 'Cue the brass turntable & match the musical motif/clue.',
    verbTag: 'LOCK ERA',
    safeTag: 'MAESTRO!',
    foleyInteract: 'trophy_pedestal_chime',
    foleyLock: 'streak_chord_4',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #261614 0%, #100807 100%)',
      surfaceBg: '#39221e',
      metalAccent: '#f0c66c',
      glowColor: '#ffb74d',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_43_camera_iris_unmask',
    toyNumber: 43,
    name: 'Mechanical Camera Iris Unmask',
    family: 'PROGRESSIVE_AUDIO_REVEAL',
    actionCallout: 'OPEN IRIS TO UNMASK',
    baseSeconds: 20,
    isTwistToy: false,
    mode: 'REVEAL_CAMERA_IRIS',
    microTip: 'Widen the brass aperture for more clue text — tighter = more chips!',
    verbTag: 'SNAP',
    safeTag: 'IN FOCUS',
    foleyInteract: 'brass_gear_detent',
    foleyLock: 'optical_beam_lock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1b1f26 0%, #0a0c10 100%)',
      surfaceBg: '#292f3a',
      metalAccent: '#e2bd6a',
      glowColor: '#56d4f5',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_44_classified_redaction_peel',
    toyNumber: 44,
    name: 'Classified Redaction Peel',
    family: 'PROGRESSIVE_AUDIO_REVEAL',
    actionCallout: 'PEEL CENSOR STRIPS',
    baseSeconds: 20,
    isTwistToy: false,
    mode: 'REVEAL_REDACTION_PEEL',
    microTip: 'Peel black censor tape for intel — fewer peels = higher payout!',
    verbTag: 'DECLASSIFY',
    safeTag: 'CLEARED',
    foleyInteract: 'foil_card_flick',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #221d15 0%, #0e0c08 100%)',
      surfaceBg: '#332b20',
      metalAccent: '#dec074',
      glowColor: '#48e5a4',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_45_searchlight_darkroom',
    toyNumber: 45,
    name: 'Searchlight Darkroom Reveal',
    family: 'PROGRESSIVE_AUDIO_REVEAL',
    actionCallout: 'SWEEP DARKROOM BEAM',
    baseSeconds: 20,
    isTwistToy: true,
    mode: 'REVEAL_DARKROOM_SEARCHLIGHT',
    microTip: 'Drag the amber beam across the darkroom plate to read hidden hints.',
    verbTag: 'DEVELOP',
    safeTag: 'EXPOSED!',
    foleyInteract: 'optical_beam_lock',
    foleyLock: 'crystal_hex_claim',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #241012 0%, #0c0506 100%)',
      surfaceBg: '#36181b',
      metalAccent: '#e8bd68',
      glowColor: '#ff8a4c',
      dangerColor: '#ff4252',
    },
  },
  {
    toyId: 'toy_46_detective_magnifying_lens',
    toyNumber: 46,
    name: 'Detective Magnifying Lens',
    family: 'PROGRESSIVE_AUDIO_REVEAL',
    actionCallout: 'INSPECT WITH LOUPE',
    baseSeconds: 20,
    isTwistToy: false,
    mode: 'REVEAL_MAGNIFYING_LOUPE',
    microTip: 'Sweep the brass magnifying loupe to inspect clues, then solve!',
    verbTag: 'DEDUCE',
    safeTag: 'ELEMENTARY',
    foleyInteract: 'ui_brass_tap',
    foleyLock: 'trophy_pedestal_chime',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1d1a14 0%, #0a0906 100%)',
      surfaceBg: '#2e291f',
      metalAccent: '#ecc674',
      glowColor: '#ffd470',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_47_year_vise_clamp',
    toyNumber: 47,
    name: 'Year-Vise Narrowing Clamp',
    family: 'PROGRESSIVE_AUDIO_REVEAL',
    actionCallout: 'CLAMP THE YEAR VISE',
    baseSeconds: 20,
    isTwistToy: true,
    mode: 'REVEAL_YEAR_VISE_CLAMP',
    microTip: 'Tighten Left/Right brass jaws around the year — tighter = bigger mult!',
    verbTag: 'CLAMP VISE',
    safeTag: 'TRAPPED!',
    foleyInteract: 'brass_gear_detent',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #1e2124 0%, #0c0d0f 100%)',
      surfaceBg: '#2e3338',
      metalAccent: '#e6c06c',
      glowColor: '#48e5a4',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_48_quote_word_stamp',
    toyNumber: 48,
    name: 'Quote Missing-Word Stamp',
    family: 'PROGRESSIVE_AUDIO_REVEAL',
    actionCallout: 'STAMP MISSING WORD',
    baseSeconds: 16,
    isTwistToy: false,
    mode: 'REVEAL_QUOTE_STAMP',
    microTip: 'Pick the missing brass stamp & slam it into the parchment!',
    verbTag: 'STAMP',
    safeTag: 'SEALED!',
    foleyInteract: 'pneumatic_piston_slam',
    foleyLock: 'medal_enamel_clink',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #261d14 0%, #100c08 100%)',
      surfaceBg: '#392c1e',
      metalAccent: '#f0c66c',
      glowColor: '#f6d27a',
      dangerColor: '#ff5263',
    },
  },
  {
    toyId: 'toy_49_suspect_lineup',
    toyNumber: 49,
    name: '3-Clue Suspect Lineup',
    family: 'PROGRESSIVE_AUDIO_REVEAL',
    actionCallout: 'SPOTLIGHT THE SUSPECT',
    baseSeconds: 20,
    isTwistToy: false,
    mode: 'REVEAL_SUSPECT_LINEUP',
    microTip: 'Flip on up to 3 witness spotlights — arrest early for max chips!',
    verbTag: 'ARREST',
    safeTag: 'BOOKED!',
    foleyInteract: 'optical_beam_lock',
    foleyLock: 'vault_heavy_unlock',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #161a24 0%, #07090e 100%)',
      surfaceBg: '#232938',
      metalAccent: '#e2bd6a',
      glowColor: '#56d8ff',
      dangerColor: '#ff4e63',
    },
  },
  {
    toyId: 'toy_50_riddle_brass_cylinder',
    toyNumber: 50,
    name: 'Riddle Brass Cylinder',
    family: 'PROGRESSIVE_AUDIO_REVEAL',
    actionCallout: 'CRANK RIDDLE CYLINDER',
    baseSeconds: 21,
    isTwistToy: false,
    mode: 'REVEAL_RIDDLE_CYLINDER',
    microTip: 'Crank the Edison brass drum to unspool clues, then lock truth.',
    verbTag: 'SOLVE',
    safeTag: 'DECIPHERED',
    foleyInteract: 'cryptex_stone_tumbler',
    foleyLock: 'trophy_pedestal_chime',
    chassisTheme: {
      primaryBg: 'linear-gradient(160deg, #281b11 0%, #110b06 100%)',
      surfaceBg: '#3a2819',
      metalAccent: '#f2ca70',
      glowColor: '#ffd470',
      dangerColor: '#ff5263',
    },
  },
] as const;

const TOY_BY_ID = new Map<string, ToySpec001To050V6>(
  TOY_CATALOG_001_TO_050.map((t) => [t.toyId, t]),
);

const TOY_BY_NUMBER = new Map<number, ToySpec001To050V6>(
  TOY_CATALOG_001_TO_050.map((t) => [t.toyNumber, t]),
);

/**
 * Cross-subsystem alias table so bespoke clue packs referencing shorthand IDs
 * (e.g. `toy_11_relief_globe_pin`, `toy_21_brass_cryptex`, `toy_31_dis_or_dat_paddles`)
 * always resolve cleanly to their exact ToySpec001To050V6.
 */
const TOY_ID_ALIASES_001_TO_050: Record<string, number> = {
  toy_11_relief_globe_pin: 11,
  toy_21_brass_cryptex: 21,
  toy_22_rotary_safe_dial: 22,
  toy_23_brass_tachometer: 23,
  toy_31_dis_or_dat_paddles: 31,
  toy_41_cascading_jackpot: 41,
};

export function getToySpec001To050ById(toyId: string): ToySpec001To050V6 | undefined {
  const direct = TOY_BY_ID.get(toyId);
  if (direct) return direct;
  const aliasNum = TOY_ID_ALIASES_001_TO_050[toyId];
  if (aliasNum !== undefined) return TOY_BY_NUMBER.get(aliasNum);
  const numMatch = /^toy_0?(\d{1,2})(?:_|$)/i.exec(toyId.trim());
  if (numMatch) {
    const n = Number(numMatch[1]);
    if (n >= 1 && n <= 50) return TOY_BY_NUMBER.get(n);
  }
  return undefined;
}

export function getToySpec001To050ByNumber(toyNumber: number): ToySpec001To050V6 | undefined {
  return TOY_BY_NUMBER.get(toyNumber);
}

export function getToys001To050ByFamily(family: ToyFamilyIdV6): ToySpec001To050V6[] {
  return TOY_CATALOG_001_TO_050.filter((t) => t.family === family);
}

export function isToyInCatalog001To050(toyIdOrNumber: string | number): boolean {
  return typeof toyIdOrNumber === 'number'
    ? TOY_BY_NUMBER.has(toyIdOrNumber)
    : getToySpec001To050ById(toyIdOrNumber) !== undefined;
}

/**
 * Picks a well-matched Toy from 001–050 for a given clue while avoiding recently
 * played toy IDs so two consecutive clues never feel repetitive.
 */
export function pickBestToyFrom001To050(
  clue: CalibratedClueV6,
  recentToyIds: readonly string[] = [],
  rng: () => number = Math.random,
): ToySpec001To050V6 {
  const recentSet = new Set(recentToyIds.slice(-6));

  // 1. Honor bespoke clue recommendation if it belongs to 001–050 and wasn't just played
  if (clue.recommendedToyIds && clue.recommendedToyIds.length > 0) {
    for (const recId of clue.recommendedToyIds) {
      const found = TOY_BY_ID.get(recId);
      if (found && !recentSet.has(found.toyId)) {
        return found;
      }
    }
  }

  // 2. Match strong native payloads to their signature families
  const preferredFamilies: ToyFamilyIdV6[] = [];
  if (clue.geoTarget) preferredFamilies.push('ATLAS_RELIEF_SPATIAL');
  if (clue.cryptexWord && clue.cryptexWord.length >= 4 && clue.cryptexWord.length <= 8) {
    preferredFamilies.push('DIALS_CRYPTEX_LOCKS');
  }
  if (clue.binaryPair && clue.binaryPair.items.length >= 2) {
    preferredFamilies.push('RAPID_PADDLES_REFLEX');
  }
  if (typeof clue.numericTarget === 'number') {
    preferredFamilies.push('DIALS_CRYPTEX_LOCKS', 'PROGRESSIVE_AUDIO_REVEAL');
  }
  if (clue.progressiveHints && clue.progressiveHints.length === 4) {
    preferredFamilies.push('PROGRESSIVE_AUDIO_REVEAL');
  }
  if (preferredFamilies.length === 0) {
    preferredFamilies.push(
      'DEFUSAL_ELIMINATION',
      'DIALS_CRYPTEX_LOCKS',
      'RAPID_PADDLES_REFLEX',
      'PROGRESSIVE_AUDIO_REVEAL',
    );
  }

  const familyPool = TOY_CATALOG_001_TO_050.filter(
    (t) => preferredFamilies.includes(t.family) && !recentSet.has(t.toyId),
  );
  const pool =
    familyPool.length > 0
      ? familyPool
      : TOY_CATALOG_001_TO_050.filter((t) => !recentSet.has(t.toyId));
  const finalPool = pool.length > 0 ? pool : TOY_CATALOG_001_TO_050;
  return finalPool[Math.floor(rng() * finalPool.length) % finalPool.length];
}
