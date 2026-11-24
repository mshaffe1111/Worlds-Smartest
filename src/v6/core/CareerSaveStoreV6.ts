// ============================================================================
// WORLD'S SMARTEST v6.0 — Persistent Career Save, Anti-Repeat Rotation &
// 36-Honor Automatic Evaluation Store (`ws_v6_career_state_v1`)
// ============================================================================

import type {
  BoardDefinitionV6,
  BoardFamilyIdV6,
  BoardTwistMutationIdV6,
  BroadcastOptionsStateV6,
  CameraMotionModeV6,
  ColorVisionLensV6,
  FoilTrickCardV6,
  HonorAwardDefinitionV6,
  MatchEventMemoryV6,
  ResolutionTierV6,
  ShadowQualityV6,
  StageWorldIdV6,
  SymphonyTrackIdV6,
  TextScalePresetV6,
  ThumbDockHandednessV6,
  ToyDefinitionV6,
  ToyFamilyIdV6,
  ToyResolutionV6,
} from '../contracts_v6.ts';

export const CAREER_SAVE_STORAGE_KEY_V6 = 'ws_v6_career_state_v1';
export const CAREER_SAVE_SCHEMA_VERSION_V6 = 1;
export const MAX_CAMPAIGN_EPISODES_V6 = 20;
export const MAX_HELD_FOIL_CARDS_V6 = 3;
export const MAX_PINNED_PODIUM_MEDALS_V6 = 3;
export const BOARD_ROTATION_COOLDOWN_V6 = 25;
export const TOY_ROTATION_COOLDOWN_V6 = 20;
export const TRAPDOOR_ROTATION_COOLDOWN_V6 = 8;

export interface StorageLikeV6 {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface StageWorldMetaV6 {
  stageId: StageWorldIdV6;
  stageNumber: number; // 1 .. 10
  title: string;
  eraSubtitle: string;
  difficultyBand: [number, number];
  symphonyTrack: SymphonyTrackIdV6;
  episodes: [number, number];
  signatureBoardFamilies: BoardFamilyIdV6[];
  championName: string;
  championTitle: string;
}

export const STAGE_WORLD_CATALOG_V6: readonly StageWorldMetaV6[] = [
  {
    stageId: 'STAGE_01_VAUDEVILLE_PALACE',
    stageNumber: 1,
    title: 'Vaudeville Palace',
    eraSubtitle: '1928 Broadway Mahogany & Edison Brass',
    difficultyBand: [1.0, 1.9],
    symphonyTrack: 'curtain_overture',
    episodes: [1, 2],
    signatureBoardFamilies: ['CLOCKWORK_ROTARY', 'TURF_WAR_BRIDGES'],
    championName: 'Barnaby "Two-Takes" Vance',
    championTitle: 'Matinee Crowd Favorite',
  },
  {
    stageId: 'STAGE_02_GENEVA_CONSERVATORY',
    stageNumber: 2,
    title: 'Geneva Conservatory',
    eraSubtitle: 'Carrara Marble & Rose-Gold Horology',
    difficultyBand: [2.0, 2.9],
    symphonyTrack: 'geneva_horology',
    episodes: [3, 4],
    signatureBoardFamilies: ['CLOCKWORK_ROTARY', 'GRAVITY_PHYSICS'],
    championName: 'Dr. Sabine Vogt',
    championTitle: 'Master of Escapements',
  },
  {
    stageId: 'STAGE_03_MONTE_CARLO_SALON',
    stageNumber: 3,
    title: 'Monte Carlo Salon',
    eraSubtitle: '1962 Riviera Emerald Felt & Crystal',
    difficultyBand: [3.0, 3.9],
    symphonyTrack: 'riviera_caprice',
    episodes: [5, 6],
    signatureBoardFamilies: ['CASINO_PUSH_LUCK', 'RULE_BENDER_TWISTS'],
    championName: 'Countess Mireille de Valois',
    championTitle: 'Velvet High-Roller',
  },
  {
    stageId: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    stageNumber: 4,
    title: 'Cartographic Rotunda',
    eraSubtitle: 'Teak Ship-Deck & Verdigris Astrolabes',
    difficultyBand: [4.0, 4.9],
    symphonyTrack: 'explorer_odyssey',
    episodes: [7, 8],
    signatureBoardFamilies: ['CARTOGRAPHY_EXPEDITION', 'TURF_WAR_BRIDGES'],
    championName: 'Capt. Alistair Finch-Harrow',
    championTitle: 'Meridian Strategist',
  },
  {
    stageId: 'STAGE_05_ANALOG_BUNKER_1969',
    stageNumber: 5,
    title: 'Analog Bunker 1969',
    eraSubtitle: 'Olive Steel, Nixie Tubes & Radar',
    difficultyBand: [5.0, 5.9],
    symphonyTrack: 'bunker_espionage',
    episodes: [9, 10],
    signatureBoardFamilies: ['STEALTH_OPTICS_RADAR', 'MONUMENT_INDUSTRIAL'],
    championName: 'Walter "Redline" Kowalski',
    championTitle: 'Signal Saboteur',
  },
  {
    stageId: 'STAGE_06_KYOTO_LACQUER_PAVILION',
    stageNumber: 6,
    title: 'Kyoto Lacquer Pavilion',
    eraSubtitle: 'Urushi Lacquer, Kintsugi Gold & Lanterns',
    difficultyBand: [6.0, 6.9],
    symphonyTrack: 'kyoto_nocturne',
    episodes: [11, 12],
    signatureBoardFamilies: ['TURF_WAR_BRIDGES', 'ASTRAL_QUANTUM'],
    championName: 'Kenzo Taniguchi',
    championTitle: 'Kintsugi Grandmaster',
  },
  {
    stageId: 'STAGE_07_CARNIVAL_CURIOSITIES',
    stageNumber: 7,
    title: 'Carnival of Curiosities',
    eraSubtitle: 'Midnight Pier, Copper Pinball & Calliope',
    difficultyBand: [7.0, 7.9],
    symphonyTrack: 'carnival_accelerando',
    episodes: [13, 14],
    signatureBoardFamilies: ['CARNIVAL_ARCADE', 'GRAVITY_PHYSICS'],
    championName: 'Delilah "Nickel-Slot" Kerr',
    championTitle: 'Midway Trickster',
  },
  {
    stageId: 'STAGE_08_SUNKEN_BATHYSPHERE',
    stageNumber: 8,
    title: 'Sunken Bathysphere',
    eraSubtitle: 'Volcanic Basalt, Bronze Portholes & Caustics',
    difficultyBand: [8.0, 8.5],
    symphonyTrack: 'bathysphere_cathedral',
    episodes: [15, 16],
    signatureBoardFamilies: ['STEALTH_OPTICS_RADAR', 'ASTRAL_QUANTUM'],
    championName: 'Dr. Henrik Lindholm',
    championTitle: 'Abyssal Tactician',
  },
  {
    stageId: 'STAGE_09_ASTRAL_OBSERVATORY',
    stageNumber: 9,
    title: 'Astral Observatory',
    eraSubtitle: 'Copper Telescope Dome & Live Aurora',
    difficultyBand: [8.5, 9.2],
    symphonyTrack: 'astral_storm_presto',
    episodes: [17, 18],
    signatureBoardFamilies: ['ASTRAL_QUANTUM', 'RULE_BENDER_TWISTS'],
    championName: 'Nadia Okafor-Voss',
    championTitle: 'Quantum Sniper',
  },
  {
    stageId: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    stageNumber: 10,
    title: 'Sovereign Colosseum',
    eraSubtitle: 'Nero Marble, Fire Braziers & 24k Altar',
    difficultyBand: [9.0, 10.0],
    symphonyTrack: 'colosseum_finale',
    episodes: [19, 20],
    signatureBoardFamilies: ['MONUMENT_INDUSTRIAL', 'RULE_BENDER_TWISTS'],
    championName: 'Arthur "The Archivist" Pendelton',
    championTitle: 'The $900k Retainer Boss',
  },
] as const;

export const STAGE_WORLD_ORDER_V6: readonly StageWorldIdV6[] =
  STAGE_WORLD_CATALOG_V6.map((s) => s.stageId);

export function getStageMetaByIdV6(stageId: StageWorldIdV6): StageWorldMetaV6 {
  const found = STAGE_WORLD_CATALOG_V6.find((s) => s.stageId === stageId);
  return found ?? STAGE_WORLD_CATALOG_V6[0];
}

export function getStageMetaByNumberV6(stageNumber: number): StageWorldMetaV6 {
  const clamped = Math.max(1, Math.min(10, Math.round(stageNumber)));
  return STAGE_WORLD_CATALOG_V6[clamped - 1];
}

export function getStageMetaForEpisodeV6(episodeNumber: number): StageWorldMetaV6 {
  const ep = Math.max(1, Math.min(MAX_CAMPAIGN_EPISODES_V6, Math.round(episodeNumber)));
  const stageIndex = Math.floor((ep - 1) / 2);
  return STAGE_WORLD_CATALOG_V6[stageIndex];
}

export function isTitleBoutEpisodeV6(episodeNumber: number): boolean {
  return episodeNumber >= 2 && episodeNumber % 2 === 0;
}

export interface EpisodeBlueprintV6 {
  episodeNumber: number;
  stageMeta: StageWorldMetaV6;
  isTitleBout: boolean;
  episodeLabel: string;
  turnCount: number;
  difficultyRange: [number, number];
  basePurseCash: number;
  halftimeTurn: number;
}

export function getEpisodeBlueprintV6(episodeNumber: number): EpisodeBlueprintV6 {
  const ep = Math.max(1, Math.min(MAX_CAMPAIGN_EPISODES_V6, Math.round(episodeNumber)));
  const stageMeta = getStageMetaForEpisodeV6(ep);
  const isTitleBout = isTitleBoutEpisodeV6(ep);
  const [bandMin, bandMax] = stageMeta.difficultyBand;
  const bandMid = Number(((bandMin + bandMax) * 0.5).toFixed(2));
  const difficultyRange: [number, number] = isTitleBout
    ? [bandMid, bandMax]
    : [bandMin, bandMid];

  return {
    episodeNumber: ep,
    stageMeta,
    isTitleBout,
    episodeLabel: isTitleBout
      ? `EP ${String(ep).padStart(2, '0')} • ${stageMeta.title.toUpperCase()} TITLE BOUT`
      : `EP ${String(ep).padStart(2, '0')} • ${stageMeta.title.toUpperCase()} SHOWCASE`,
    turnCount: isTitleBout ? 6 : 5,
    difficultyRange,
    basePurseCash: Math.round((450 + stageMeta.stageNumber * 180) * (isTitleBout ? 1.6 : 1.0)),
    halftimeTurn: 3,
  };
}

// ----------------------------------------------------------------------------
// Canonical 36 Honors (12 Sculpted 3D Trophies + 24 Cast Relief Medals)
// ----------------------------------------------------------------------------
export const HONOR_AWARDS_CATALOG_V6: readonly HonorAwardDefinitionV6[] = [
  // 12 Championship Trophies
  {
    awardId: 'trophy_01_vaudeville_curtain',
    kind: 'TROPHY',
    name: 'The Gilded Proscenium',
    engraving: 'Stole the 1928 spotlight at Vaudeville Palace.',
    unlockRequirement: 'Win Episode 02 (Vaudeville Palace Title Bout)',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'PROSCENIUM_ARCH',
  },
  {
    awardId: 'trophy_02_geneva_tourbillon',
    kind: 'TROPHY',
    name: 'The Geneva Tourbillon',
    engraving: 'Out-timed Dr. Sabine Vogt under Swiss glass.',
    unlockRequirement: 'Win Episode 04 (Geneva Conservatory Title Bout)',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'TOURBILLON_CAGE',
  },
  {
    awardId: 'trophy_03_monte_carlo_whale',
    kind: 'TROPHY',
    name: 'The Riviera High-Roller',
    engraving: 'Broke Countess Mireille de Valois at her own felt.',
    unlockRequirement: 'Win Episode 06 (Monte Carlo Salon Title Bout)',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'CASINO_CROWN_STACK',
  },
  {
    awardId: 'trophy_04_sextant_meridian',
    kind: 'TROPHY',
    name: "Cartographer's Sextant",
    engraving: 'Charted the Rotunda past Capt. Finch-Harrow.',
    unlockRequirement: 'Win Episode 08 (Cartographic Rotunda Title Bout)',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'BRASS_SEXTANT',
  },
  {
    awardId: 'trophy_05_nixie_clearance',
    kind: 'TROPHY',
    name: 'Bunker Clearance 1969',
    engraving: 'Cracked Walter Kowalski’s vault. 5th Relic Slot unlocked.',
    unlockRequirement: 'Win Episode 10 (Analog Bunker Title Bout)',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'NIXIE_OBELISK',
  },
  {
    awardId: 'trophy_06_kintsugi_chalice',
    kind: 'TROPHY',
    name: 'The Kintsugi Chalice',
    engraving: 'Turned fracture into gold past Kenzo Taniguchi.',
    unlockRequirement: 'Win Episode 12 (Kyoto Lacquer Title Bout)',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'KINTSUGI_VESSEL',
  },
  {
    awardId: 'trophy_07_pier_calliope',
    kind: 'TROPHY',
    name: 'Midnight Pier Automaton',
    engraving: 'Beat Delilah "Nickel-Slot" Kerr at the rigged midway.',
    unlockRequirement: 'Win Episode 14 (Carnival Curiosities Title Bout)',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'CALLIOPE_CREST',
  },
  {
    awardId: 'trophy_08_abyssal_bell',
    kind: 'TROPHY',
    name: 'The Bathysphere Bell',
    engraving: 'Outlasted Dr. Henrik Lindholm under ten atmospheres.',
    unlockRequirement: 'Win Episode 16 (Sunken Bathysphere Title Bout)',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'DIVING_BELL',
  },
  {
    awardId: 'trophy_09_aurora_orrery',
    kind: 'TROPHY',
    name: 'The Aurora Armillary',
    engraving: 'Aligned the dome above Nadia Okafor-Voss.',
    unlockRequirement: 'Win Episode 18 (Astral Observatory Title Bout)',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'ARMILLARY_SPHERE',
  },
  {
    awardId: 'trophy_10_sovereign_crown',
    kind: 'TROPHY',
    name: 'Sovereign Mind Crown',
    engraving: 'Dethroned Arthur Pendelton and triggered Clause 14-B.',
    unlockRequirement: 'Win Episode 20 (Sovereign Colosseum Finale)',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'SOVEREIGN_CROWN',
  },
  {
    awardId: 'trophy_11_grand_collector',
    kind: 'TROPHY',
    name: "Frankie's Contraband Wrench",
    engraving: 'Filled all five backstage relic pedestals.',
    unlockRequirement: 'Equip 5 Podium Relics simultaneously',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'CONTRABAND_WRENCH',
  },
  {
    awardId: 'trophy_12_perfect_broadcast',
    kind: 'TROPHY',
    name: 'Flawless Live Tape',
    engraving: 'Not a single missed clue. Not one trapdoor drop.',
    unlockRequirement: 'Win any Title Bout with 0 misses',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'GOLDEN_MIC_STATUE',
  },

  // 24 Cast Relief Medals
  {
    awardId: 'medal_01_first_spotlight',
    kind: 'MEDAL',
    name: 'Opening Night Applause',
    engraving: 'First clue nailed under live stage lamps.',
    unlockRequirement: 'Answer 1 clue correctly',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'SPOTLIGHT_RELIEF',
  },
  {
    awardId: 'medal_02_uncut_detonator',
    kind: 'MEDAL',
    name: 'The Uncut Detonator',
    engraving: 'Snipped three lies with steady wire-cutters.',
    unlockRequirement: 'Clear a Defusal toy with >= 3.0s left',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'WIRE_CUTTER_MEDAL',
  },
  {
    awardId: 'medal_03_pinpoint_navigator',
    kind: 'MEDAL',
    name: 'Bullseye Cartographer',
    engraving: 'Dropped the ruby pin right on the ridge.',
    unlockRequirement: 'Score >= 90% accuracy on an Atlas Spatial toy',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'GLOBE_PIN_MEDAL',
  },
  {
    awardId: 'medal_04_safe_cracker',
    kind: 'MEDAL',
    name: 'Swiss Tumbler Ace',
    engraving: 'Heard every brass tumbler click home.',
    unlockRequirement: 'Solve a Dial or Cryptex Lock toy cleanly',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'CRYPTEX_RING_MEDAL',
  },
  {
    awardId: 'medal_05_lightning_paddle',
    kind: 'MEDAL',
    name: 'Spring-Paddle Reflex',
    engraving: 'Faster than the stagehand buzzer.',
    unlockRequirement: 'Clear a Rapid Paddles toy with >= 4.0s left',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'PADDLE_BOLT_MEDAL',
  },
  {
    awardId: 'medal_06_ear_of_gold',
    kind: 'MEDAL',
    name: 'First-Chair Virtuoso',
    engraving: 'Called the answer before the curtain rose.',
    unlockRequirement: 'Solve a Progressive / Audio Reveal toy cleanly',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'LYRE_CREST_MEDAL',
  },
  {
    awardId: 'medal_07_balance_master',
    kind: 'MEDAL',
    name: 'Apothecary Equilibrium',
    engraving: 'Balanced history to the brass gram.',
    unlockRequirement: 'Clear a Wager Scale / Chronology toy cleanly',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'SCALE_PAN_MEDAL',
  },
  {
    awardId: 'medal_08_velvet_bluffer',
    kind: 'MEDAL',
    name: 'Monte Carlo Nerve',
    engraving: 'Called the house bluff without blinking.',
    unlockRequirement: 'Win a Casino Bluff Stakes toy',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'ROYAL_CHIP_MEDAL',
  },
  {
    awardId: 'medal_09_forensic_eye',
    kind: 'MEDAL',
    name: 'Cold-Case Magnifier',
    engraving: 'Spotted the invisible ink under UV.',
    unlockRequirement: 'Solve a Forensic Detective toy cleanly',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'LENS_SEAL_MEDAL',
  },
  {
    awardId: 'medal_10_kinetic_tamer',
    kind: 'MEDAL',
    name: 'Contraption Whisperer',
    engraving: 'Tamed pistons, prisms, and steam valves.',
    unlockRequirement: 'Solve a Kinetic Contraption toy cleanly',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'GEAR_PISTON_MEDAL',
  },
  {
    awardId: 'medal_11_lie_buster',
    kind: 'MEDAL',
    name: 'Mind-Game Counterpunch',
    engraving: 'Caught the rigged clue red-handed.',
    unlockRequirement: 'Beat any Mind-Game Twist toy (91-100)',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'SHATTERED_MASK_MEDAL',
  },
  {
    awardId: 'medal_12_trapdoor_houdini',
    kind: 'MEDAL',
    name: 'Trapdoor Houdini',
    engraving: 'Dropped into the pit and climbed back smiling.',
    unlockRequirement: 'Survive your first 8s Stage Trapdoor Gambit',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'TRAPDOOR_KEY_MEDAL',
  },
  {
    awardId: 'medal_13_nine_lives',
    kind: 'MEDAL',
    name: 'Pit Veteran',
    engraving: 'Knows every gear down in the cellar.',
    unlockRequirement: 'Survive 5 Trapdoor Gambits in your career',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'CELLAR_COG_MEDAL',
  },
  {
    awardId: 'medal_14_clutch_escape',
    kind: 'MEDAL',
    name: 'Last-Millisecond Latch',
    engraving: 'Beat the closing latch with under 1.5s left.',
    unlockRequirement: 'Survive a Trapdoor Gambit with < 1.5s remaining',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'STOPWATCH_MEDAL',
  },
  {
    awardId: 'medal_15_streak_five',
    kind: 'MEDAL',
    name: 'Standing Ovation x5',
    engraving: 'Five straight answers; the balcony rose.',
    unlockRequirement: 'Hit a 5-clue streak',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'LAUREL_V_MEDAL',
  },
  {
    awardId: 'medal_16_streak_ten',
    kind: 'MEDAL',
    name: 'Encore Phenomenon x10',
    engraving: 'Ten straight hits; Julian tore up the script.',
    unlockRequirement: 'Hit a 10-clue streak',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'LAUREL_X_MEDAL',
  },
  {
    awardId: 'medal_17_chain_breaker',
    kind: 'MEDAL',
    name: 'Iron-Chain Shatterer',
    engraving: 'Snapped Rival chains off a locked vault.',
    unlockRequirement: 'Claim a chain-locked board node',
    materialTier: 'CAST_BRONZE',
    sculptArchetype: 'BROKEN_LINK_MEDAL',
  },
  {
    awardId: 'medal_18_twist_survivor',
    kind: 'MEDAL',
    name: 'Live-Broadcast Improviser',
    engraving: 'Held the lead when the stage lights cut.',
    unlockRequirement: 'Win an episode after a Halftime Twist Mutation',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'SIREN_BOLT_MEDAL',
  },
  {
    awardId: 'medal_19_dirty_trickster',
    kind: 'MEDAL',
    name: "Frankie's Apprentice",
    engraving: 'Played three backstage Foil cards on air.',
    unlockRequirement: 'Play 3 Foil Dirty-Trick Cards',
    materialTier: 'CLOISONNE_ENAMEL',
    sculptArchetype: 'FOIL_ACE_MEDAL',
  },
  {
    awardId: 'medal_20_screw_turnabout',
    kind: 'MEDAL',
    name: 'Sweet Revenge Screw',
    engraving: 'Gave the Rival a taste of their own rig.',
    unlockRequirement: 'Trigger SCREW_RIVAL or STEAL_RIVAL_POT',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'SCREW_DOME_MEDAL',
  },
  {
    awardId: 'medal_21_bankroll_5k',
    kind: 'MEDAL',
    name: 'Prime-Time Bankroll',
    engraving: 'Stacked $5,000 in broadcast purse chips.',
    unlockRequirement: 'Hold at least $5,000 career bankroll',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'BULLION_COIN_MEDAL',
  },
  {
    awardId: 'medal_22_bankroll_25k',
    kind: 'MEDAL',
    name: 'Syndication Mogul',
    engraving: 'Could buy the network out from under Sloane.',
    unlockRequirement: 'Hold at least $25,000 career bankroll',
    materialTier: 'GOLD_24K',
    sculptArchetype: 'VAULT_INGOT_MEDAL',
  },
  {
    awardId: 'medal_23_world_traveler',
    kind: 'MEDAL',
    name: 'Contraption Connoisseur',
    engraving: 'Mastered ten distinct 3D studio boards.',
    unlockRequirement: 'Play 10 unique boards across your career',
    materialTier: 'STERLING_SILVER',
    sculptArchetype: 'COMPASS_ROSE_MEDAL',
  },
  {
    awardId: 'medal_24_century_mind',
    kind: 'MEDAL',
    name: 'Broadcast Centurion',
    engraving: 'One hundred clues answered cleanly on air.',
    unlockRequirement: 'Answer 100 clues correctly lifetime',
    materialTier: 'OBSIDIAN_RUBY',
    sculptArchetype: 'CENTURION_STAR_MEDAL',
  },
] as const;

export interface CareerTelemetryStatsV6 {
  totalCluesAttempted: number;
  totalCluesCorrect: number;
  totalEpisodesPlayed: number;
  totalEpisodesWon: number;
  totalTrapdoorsEntered: number;
  totalTrapdoorsSurvived: number;
  fastestClutchTrapdoorSec: number | null;
  currentStreak: number;
  bestStreak: number;
  foilsPlayedCount: number;
  screwOrStealPlays: number;
  chainsBrokenCount: number;
  twistsSurvivedWins: number;
  peakBankrollCash: number;
  uniqueBoardIdsPlayed: string[];
  uniqueToyIdsPlayed: string[];
  toyFamiliesCleared: ToyFamilyIdV6[];
  defusalFastClear: boolean;
  atlasPinpointClear: boolean;
  rapidPaddleFastClear: boolean;
  flawlessTitleBoutWins: number;
}

export interface RotationHistoryV6 {
  recentBoardIds: string[];
  recentBoardFamilies: BoardFamilyIdV6[];
  recentToyIds: string[];
  recentToyFamilies: ToyFamilyIdV6[];
  recentTrapdoorIds: string[];
}

export interface CareerStateV6 {
  schemaVersion: number;
  updatedAtIso: string;
  currentEpisode: number; // 1 .. 20
  highestEpisodeUnlocked: number; // 1 .. 20
  completedEpisodes: number[];
  unlockedStageWorlds: StageWorldIdV6[];
  bankrollCash: number;
  maxRelicSlots: 4 | 5;
  ownedRelicIds: string[];
  equippedRelicIds: string[];
  heldFoilCards: FoilTrickCardV6[];
  unlockedAwardIds: string[];
  pinnedPodiumMedalIds: string[]; // Max 3
  options: BroadcastOptionsStateV6;
  matchMemory: MatchEventMemoryV6;
  rotationHistory: RotationHistoryV6;
  telemetry: CareerTelemetryStatsV6;
}

export interface AwardEvaluationContextV6 {
  kind: 'CLUE_RESOLVED' | 'TRAPDOOR_RESOLVED' | 'FOIL_PLAYED' | 'EPISODE_FINISHED' | 'RELIC_UPDATED';
  episodeNumber?: number;
  isTitleBout?: boolean;
  wonEpisode?: boolean;
  episodeMisses?: number;
  hadActiveTwist?: boolean;
  toyFamily?: ToyFamilyIdV6;
  toyNumber?: number;
  toyResolution?: ToyResolutionV6;
  brokeLockedChain?: boolean;
  trapdoorSurvived?: boolean;
  trapdoorSecondsRemaining?: number;
  foilEffectKind?: FoilTrickCardV6['effectKind'];
}

// ----------------------------------------------------------------------------
// GPU Capability Detection for Default ULTRA_3X Resolution Tier
// ----------------------------------------------------------------------------
export function detectDefaultResolutionTierV6(): ResolutionTierV6 {
  if (typeof window === 'undefined') {
    return 'ULTRA_3X';
  }
  const dpr = typeof window.devicePixelRatio === 'number' ? window.devicePixelRatio : 1;
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  const cores = typeof nav?.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 4;
  const mem =
    nav && 'deviceMemory' in nav && typeof (nav as { deviceMemory?: unknown }).deviceMemory === 'number'
      ? ((nav as { deviceMemory: number }).deviceMemory)
      : 4;

  // Low-end hardware safeguard only
  if (cores <= 2 && mem <= 2) {
    return 'BATTERY_1X';
  }
  if (cores >= 4 || dpr >= 2.0 || mem >= 4) {
    return 'ULTRA_3X';
  }
  return 'HIGH_2X';
}

export function createDefaultBroadcastOptionsV6(): BroadcastOptionsStateV6 {
  const tier = detectDefaultResolutionTierV6();
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    masterVolume: 0.85,
    symphonyVolume: 0.72,
    foleyVolume: 0.9,
    voiceVolume: 0.95,
    ambienceVolume: 0.5,
    autoVoiceDucking: true,
    musicEnabled: true,
    sfxEnabled: true,
    resolutionTier: tier,
    shadowQuality: tier === 'BATTERY_1X' ? 'SOFT_1024' : 'ULTRA_2048',
    cameraMotion: prefersReducedMotion ? 'REDUCED' : 'CINEMATIC',
    showFpsTelemetry: false,
    textScale: 1.0,
    thumbDock: 'CENTER',
    colorVisionLens: 'STANDARD',
    hapticsIntensity: 'CRISP',
    timerPaceMode: 'STANDARD',
  };
}

export function createInitialCareerStateV6(): CareerStateV6 {
  return {
    schemaVersion: CAREER_SAVE_SCHEMA_VERSION_V6,
    updatedAtIso: new Date().toISOString(),
    currentEpisode: 1,
    highestEpisodeUnlocked: 1,
    completedEpisodes: [],
    unlockedStageWorlds: ['STAGE_01_VAUDEVILLE_PALACE'],
    bankrollCash: 450,
    maxRelicSlots: 4,
    ownedRelicIds: [],
    equippedRelicIds: [],
    heldFoilCards: [],
    unlockedAwardIds: [],
    pinnedPodiumMedalIds: [],
    options: createDefaultBroadcastOptionsV6(),
    matchMemory: {
      episodeNumber: 1,
      lastBoardId: '',
      lastToyId: '',
      lastActionTags: [],
      wonLastMatch: false,
      survivedTrapdoorCount: 0,
      maxStreakReached: 0,
      bankrollCash: 450,
      equippedRelicIds: [],
    },
    rotationHistory: {
      recentBoardIds: [],
      recentBoardFamilies: [],
      recentToyIds: [],
      recentToyFamilies: [],
      recentTrapdoorIds: [],
    },
    telemetry: {
      totalCluesAttempted: 0,
      totalCluesCorrect: 0,
      totalEpisodesPlayed: 0,
      totalEpisodesWon: 0,
      totalTrapdoorsEntered: 0,
      totalTrapdoorsSurvived: 0,
      fastestClutchTrapdoorSec: null,
      currentStreak: 0,
      bestStreak: 0,
      foilsPlayedCount: 0,
      screwOrStealPlays: 0,
      chainsBrokenCount: 0,
      twistsSurvivedWins: 0,
      peakBankrollCash: 450,
      uniqueBoardIdsPlayed: [],
      uniqueToyIdsPlayed: [],
      toyFamiliesCleared: [],
      defusalFastClear: false,
      atlasPinpointClear: false,
      rapidPaddleFastClear: false,
      flawlessTitleBoutWins: 0,
    },
  };
}

// ----------------------------------------------------------------------------
// Validation & Sanitization Helpers
// ----------------------------------------------------------------------------
const VALID_RESOLUTION_TIERS: readonly ResolutionTierV6[] = ['ULTRA_3X', 'HIGH_2X', 'BATTERY_1X'];
const VALID_SHADOW_QUALITIES: readonly ShadowQualityV6[] = ['ULTRA_2048', 'SOFT_1024', 'OFF'];
const VALID_CAMERA_MODES: readonly CameraMotionModeV6[] = ['CINEMATIC', 'SUBTLE', 'REDUCED'];
const VALID_COLOR_LENSES: readonly ColorVisionLensV6[] = [
  'STANDARD',
  'DEUTERANOPIA',
  'PROTANOPIA',
  'TRITANOPIA',
];
const VALID_THUMB_DOCKS: readonly ThumbDockHandednessV6[] = ['CENTER', 'LEFT_HAND', 'RIGHT_HAND'];
const VALID_TEXT_SCALES: readonly TextScalePresetV6[] = [0.95, 1.0, 1.12];
const VALID_STAGE_SET = new Set<string>(STAGE_WORLD_ORDER_V6);

function clampUnit(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

function sanitizeOptions(raw: unknown): BroadcastOptionsStateV6 {
  const def = createDefaultBroadcastOptionsV6();
  if (!raw || typeof raw !== 'object') return def;
  const r = raw as Record<string, unknown>;
  const resTier = VALID_RESOLUTION_TIERS.includes(r.resolutionTier as ResolutionTierV6)
    ? (r.resolutionTier as ResolutionTierV6)
    : def.resolutionTier;
  const shadow = VALID_SHADOW_QUALITIES.includes(r.shadowQuality as ShadowQualityV6)
    ? (r.shadowQuality as ShadowQualityV6)
    : def.shadowQuality;
  const cam = VALID_CAMERA_MODES.includes(r.cameraMotion as CameraMotionModeV6)
    ? (r.cameraMotion as CameraMotionModeV6)
    : def.cameraMotion;
  const lens = VALID_COLOR_LENSES.includes(r.colorVisionLens as ColorVisionLensV6)
    ? (r.colorVisionLens as ColorVisionLensV6)
    : def.colorVisionLens;
  const dock = VALID_THUMB_DOCKS.includes(r.thumbDock as ThumbDockHandednessV6)
    ? (r.thumbDock as ThumbDockHandednessV6)
    : def.thumbDock;
  const textScale = VALID_TEXT_SCALES.includes(r.textScale as TextScalePresetV6)
    ? (r.textScale as TextScalePresetV6)
    : def.textScale;
  const haptics =
    r.hapticsIntensity === 'OFF' || r.hapticsIntensity === 'CRISP' || r.hapticsIntensity === 'HEAVY'
      ? r.hapticsIntensity
      : def.hapticsIntensity;
  const pace =
    r.timerPaceMode === 'STANDARD' || r.timerPaceMode === 'RELAXED_PLUS_4S'
      ? r.timerPaceMode
      : def.timerPaceMode;

  return {
    masterVolume: clampUnit(r.masterVolume, def.masterVolume),
    symphonyVolume: clampUnit(r.symphonyVolume, def.symphonyVolume),
    foleyVolume: clampUnit(r.foleyVolume, def.foleyVolume),
    voiceVolume: clampUnit(r.voiceVolume, def.voiceVolume),
    ambienceVolume: clampUnit(r.ambienceVolume, def.ambienceVolume),
    autoVoiceDucking: typeof r.autoVoiceDucking === 'boolean' ? r.autoVoiceDucking : def.autoVoiceDucking,
    musicEnabled: typeof r.musicEnabled === 'boolean' ? r.musicEnabled : def.musicEnabled,
    sfxEnabled: typeof r.sfxEnabled === 'boolean' ? r.sfxEnabled : def.sfxEnabled,
    resolutionTier: resTier,
    shadowQuality: shadow,
    cameraMotion: cam,
    showFpsTelemetry: typeof r.showFpsTelemetry === 'boolean' ? r.showFpsTelemetry : def.showFpsTelemetry,
    textScale,
    thumbDock: dock,
    colorVisionLens: lens,
    hapticsIntensity: haptics,
    timerPaceMode: pace,
  };
}

function dedupeStrings(arr: unknown, maxLen?: number): string[] {
  if (!Array.isArray(arr)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr) {
    if (typeof item === 'string' && item.length > 0 && !seen.has(item)) {
      seen.add(item);
      out.push(item);
      if (maxLen !== undefined && out.length >= maxLen) break;
    }
  }
  return out;
}

function pushBoundedUnique(list: string[], value: string, maxLen: number): string[] {
  if (!value) return list;
  const filtered = list.filter((item) => item !== value);
  filtered.push(value);
  if (filtered.length > maxLen) {
    return filtered.slice(filtered.length - maxLen);
  }
  return filtered;
}

function sanitizeCareerState(raw: unknown): CareerStateV6 {
  const def = createInitialCareerStateV6();
  if (!raw || typeof raw !== 'object') return def;
  const r = raw as Record<string, unknown>;

  const highestEp =
    typeof r.highestEpisodeUnlocked === 'number' && Number.isFinite(r.highestEpisodeUnlocked)
      ? Math.max(1, Math.min(MAX_CAMPAIGN_EPISODES_V6, Math.round(r.highestEpisodeUnlocked)))
      : def.highestEpisodeUnlocked;

  const currentEp =
    typeof r.currentEpisode === 'number' && Number.isFinite(r.currentEpisode)
      ? Math.max(1, Math.min(highestEp, Math.round(r.currentEpisode)))
      : def.currentEpisode;

  const completedEpisodes = Array.isArray(r.completedEpisodes)
    ? Array.from(
        new Set(
          r.completedEpisodes
            .filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
            .map((n) => Math.round(n))
            .filter((n) => n >= 1 && n <= MAX_CAMPAIGN_EPISODES_V6),
        ),
      ).sort((a, b) => a - b)
    : [];

  const unlockedStagesRaw = dedupeStrings(r.unlockedStageWorlds).filter((id): id is StageWorldIdV6 =>
    VALID_STAGE_SET.has(id),
  );
  if (!unlockedStagesRaw.includes('STAGE_01_VAUDEVILLE_PALACE')) {
    unlockedStagesRaw.unshift('STAGE_01_VAUDEVILLE_PALACE');
  }
  // Ensure stage for highestEpisodeUnlocked is always unlocked
  const highestStage = getStageMetaForEpisodeV6(highestEp).stageId;
  if (!unlockedStagesRaw.includes(highestStage)) {
    unlockedStagesRaw.push(highestStage);
  }

  const maxRelicSlots: 4 | 5 = r.maxRelicSlots === 5 || completedEpisodes.includes(10) ? 5 : 4;
  const bankrollCash =
    typeof r.bankrollCash === 'number' && Number.isFinite(r.bankrollCash)
      ? Math.max(0, Math.round(r.bankrollCash))
      : def.bankrollCash;

  const ownedRelicIds = dedupeStrings(r.ownedRelicIds);
  const equippedRelicIds = dedupeStrings(r.equippedRelicIds, maxRelicSlots);
  for (const id of equippedRelicIds) {
    if (!ownedRelicIds.includes(id)) ownedRelicIds.push(id);
  }

  const heldFoilCards: FoilTrickCardV6[] = Array.isArray(r.heldFoilCards)
    ? r.heldFoilCards
        .filter(
          (c): c is FoilTrickCardV6 =>
            Boolean(c) &&
            typeof c === 'object' &&
            typeof (c as FoilTrickCardV6).cardId === 'string' &&
            typeof (c as FoilTrickCardV6).name === 'string' &&
            typeof (c as FoilTrickCardV6).effectKind === 'string',
        )
        .slice(0, MAX_HELD_FOIL_CARDS_V6)
    : [];

  const unlockedAwardIds = dedupeStrings(r.unlockedAwardIds);
  const unlockedSet = new Set(unlockedAwardIds);
  const pinnedPodiumMedalIds = dedupeStrings(r.pinnedPodiumMedalIds, MAX_PINNED_PODIUM_MEDALS_V6).filter((id) =>
    unlockedSet.has(id),
  );

  const memRaw = (r.matchMemory && typeof r.matchMemory === 'object'
    ? (r.matchMemory as Record<string, unknown>)
    : {}) as Record<string, unknown>;

  const rotRaw = (r.rotationHistory && typeof r.rotationHistory === 'object'
    ? (r.rotationHistory as Record<string, unknown>)
    : {}) as Record<string, unknown>;

  const telRaw = (r.telemetry && typeof r.telemetry === 'object'
    ? (r.telemetry as Record<string, unknown>)
    : {}) as Record<string, unknown>;

  const safeNum = (v: unknown, fb = 0): number =>
    typeof v === 'number' && Number.isFinite(v) ? Math.max(0, v) : fb;

  const state: CareerStateV6 = {
    schemaVersion: CAREER_SAVE_SCHEMA_VERSION_V6,
    updatedAtIso: typeof r.updatedAtIso === 'string' ? r.updatedAtIso : new Date().toISOString(),
    currentEpisode: currentEp,
    highestEpisodeUnlocked: highestEp,
    completedEpisodes,
    unlockedStageWorlds: unlockedStagesRaw,
    bankrollCash,
    maxRelicSlots,
    ownedRelicIds,
    equippedRelicIds,
    heldFoilCards,
    unlockedAwardIds,
    pinnedPodiumMedalIds,
    options: sanitizeOptions(r.options),
    matchMemory: {
      episodeNumber:
        typeof memRaw.episodeNumber === 'number' && Number.isFinite(memRaw.episodeNumber)
          ? Math.max(1, Math.min(MAX_CAMPAIGN_EPISODES_V6, Math.round(memRaw.episodeNumber)))
          : currentEp,
      lastBoardId: typeof memRaw.lastBoardId === 'string' ? memRaw.lastBoardId : '',
      lastToyId: typeof memRaw.lastToyId === 'string' ? memRaw.lastToyId : '',
      lastActionTags: dedupeStrings(memRaw.lastActionTags, 12),
      wonLastMatch: typeof memRaw.wonLastMatch === 'boolean' ? memRaw.wonLastMatch : false,
      survivedTrapdoorCount: Math.round(safeNum(memRaw.survivedTrapdoorCount, 0)),
      maxStreakReached: Math.round(safeNum(memRaw.maxStreakReached, 0)),
      bankrollCash,
      equippedRelicIds: [...equippedRelicIds],
    },
    rotationHistory: {
      recentBoardIds: dedupeStrings(rotRaw.recentBoardIds).slice(-BOARD_ROTATION_COOLDOWN_V6),
      recentBoardFamilies: Array.isArray(rotRaw.recentBoardFamilies)
        ? (rotRaw.recentBoardFamilies.filter((f): f is BoardFamilyIdV6 => typeof f === 'string').slice(-3))
        : [],
      recentToyIds: dedupeStrings(rotRaw.recentToyIds).slice(-TOY_ROTATION_COOLDOWN_V6),
      recentToyFamilies: Array.isArray(rotRaw.recentToyFamilies)
        ? (rotRaw.recentToyFamilies.filter((f): f is ToyFamilyIdV6 => typeof f === 'string').slice(-2))
        : [],
      recentTrapdoorIds: dedupeStrings(rotRaw.recentTrapdoorIds).slice(-TRAPDOOR_ROTATION_COOLDOWN_V6),
    },
    telemetry: {
      totalCluesAttempted: Math.round(safeNum(telRaw.totalCluesAttempted)),
      totalCluesCorrect: Math.round(safeNum(telRaw.totalCluesCorrect)),
      totalEpisodesPlayed: Math.round(safeNum(telRaw.totalEpisodesPlayed)),
      totalEpisodesWon: Math.round(safeNum(telRaw.totalEpisodesWon)),
      totalTrapdoorsEntered: Math.round(safeNum(telRaw.totalTrapdoorsEntered)),
      totalTrapdoorsSurvived: Math.round(safeNum(telRaw.totalTrapdoorsSurvived)),
      fastestClutchTrapdoorSec:
        typeof telRaw.fastestClutchTrapdoorSec === 'number' && Number.isFinite(telRaw.fastestClutchTrapdoorSec)
          ? telRaw.fastestClutchTrapdoorSec
          : null,
      currentStreak: Math.round(safeNum(telRaw.currentStreak)),
      bestStreak: Math.round(safeNum(telRaw.bestStreak)),
      foilsPlayedCount: Math.round(safeNum(telRaw.foilsPlayedCount)),
      screwOrStealPlays: Math.round(safeNum(telRaw.screwOrStealPlays)),
      chainsBrokenCount: Math.round(safeNum(telRaw.chainsBrokenCount)),
      twistsSurvivedWins: Math.round(safeNum(telRaw.twistsSurvivedWins)),
      peakBankrollCash: Math.max(bankrollCash, Math.round(safeNum(telRaw.peakBankrollCash, bankrollCash))),
      uniqueBoardIdsPlayed: dedupeStrings(telRaw.uniqueBoardIdsPlayed),
      uniqueToyIdsPlayed: dedupeStrings(telRaw.uniqueToyIdsPlayed),
      toyFamiliesCleared: Array.isArray(telRaw.toyFamiliesCleared)
        ? (Array.from(new Set(telRaw.toyFamiliesCleared.filter((f): f is ToyFamilyIdV6 => typeof f === 'string'))))
        : [],
      defusalFastClear: Boolean(telRaw.defusalFastClear),
      atlasPinpointClear: Boolean(telRaw.atlasPinpointClear),
      rapidPaddleFastClear: Boolean(telRaw.rapidPaddleFastClear),
      flawlessTitleBoutWins: Math.round(safeNum(telRaw.flawlessTitleBoutWins)),
    },
  };

  return state;
}

// ----------------------------------------------------------------------------
// CareerSaveStoreV6 Class
// ----------------------------------------------------------------------------
export type CareerStateListenerV6 = (state: Readonly<CareerStateV6>) => void;

export class CareerSaveStoreV6 {
  private readonly storageKey: string;
  private readonly storage: StorageLikeV6 | null;
  private state: CareerStateV6;
  private readonly listeners = new Set<CareerStateListenerV6>();
  private externalAwardsById = new Map<string, HonorAwardDefinitionV6>();

  constructor(storage?: StorageLikeV6 | null, storageKey: string = CAREER_SAVE_STORAGE_KEY_V6) {
    this.storageKey = storageKey;
    if (storage !== undefined) {
      this.storage = storage;
    } else if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      this.storage = window.localStorage;
    } else {
      this.storage = null;
    }

    for (const award of HONOR_AWARDS_CATALOG_V6) {
      this.externalAwardsById.set(award.awardId, award);
    }

    this.state = this.loadFromStorage();
  }

  // ---- Lifecycle & Subscriptions -------------------------------------------

  public getState(): Readonly<CareerStateV6> {
    return this.state;
  }

  public getOptions(): Readonly<BroadcastOptionsStateV6> {
    return this.state.options;
  }

  public getMatchMemory(): Readonly<MatchEventMemoryV6> {
    return this.state.matchMemory;
  }

  public subscribe(listener: CareerStateListenerV6): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAwardCatalog(): HonorAwardDefinitionV6[] {
    return Array.from(this.externalAwardsById.values());
  }

  /**
   * Optional bridge so TrophyMedalVault3DV6 can register bespoke definitions
   * if any award metadata is enriched during master integration.
   */
  public registerExternalAwards(awards: readonly HonorAwardDefinitionV6[]): void {
    for (const award of awards) {
      this.externalAwardsById.set(award.awardId, award);
    }
  }

  private loadFromStorage(): CareerStateV6 {
    if (!this.storage) {
      return createInitialCareerStateV6();
    }
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) {
        return createInitialCareerStateV6();
      }
      const parsed: unknown = JSON.parse(raw);
      return sanitizeCareerState(parsed);
    } catch {
      return createInitialCareerStateV6();
    }
  }

  public save(): void {
    this.state.updatedAtIso = new Date().toISOString();
    this.state.matchMemory.bankrollCash = this.state.bankrollCash;
    this.state.matchMemory.equippedRelicIds = [...this.state.equippedRelicIds];
    this.state.matchMemory.episodeNumber = this.state.currentEpisode;

    if (this.storage) {
      try {
        this.storage.setItem(this.storageKey, JSON.stringify(this.state));
      } catch {
        // Ignore QuotaExceeded / private browsing write restriction cleanly
      }
    }
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch {
        // Isolate observer faults from core save path
      }
    }
  }

  // ---- Campaign & Stage World Progression ----------------------------------

  public isStageUnlocked(stageId: StageWorldIdV6): boolean {
    return this.state.unlockedStageWorlds.includes(stageId);
  }

  public setCurrentEpisode(episodeNumber: number): void {
    const ep = Math.max(1, Math.min(this.state.highestEpisodeUnlocked, Math.round(episodeNumber)));
    this.state.currentEpisode = ep;
    this.state.matchMemory.episodeNumber = ep;
    this.save();
  }

  public unlockStageWorld(stageId: StageWorldIdV6): void {
    if (!this.state.unlockedStageWorlds.includes(stageId)) {
      this.state.unlockedStageWorlds.push(stageId);
      this.save();
    }
  }

  public recordEpisodeOutcome(params: {
    episodeNumber: number;
    won: boolean;
    cashEarned: number;
    episodeMisses: number;
    hadActiveTwist: boolean;
    activeTwistId?: BoardTwistMutationIdV6;
    boardId?: string;
    actionTags?: string[];
  }): { newlyUnlockedAwards: HonorAwardDefinitionV6[]; unlockedStage: StageWorldIdV6 | null; expandedRelicSlots: boolean } {
    const ep = Math.max(1, Math.min(MAX_CAMPAIGN_EPISODES_V6, Math.round(params.episodeNumber)));
    const isTitleBout = isTitleBoutEpisodeV6(ep);
    let unlockedStage: StageWorldIdV6 | null = null;
    let expandedRelicSlots = false;

    this.state.telemetry.totalEpisodesPlayed += 1;
    this.state.matchMemory.wonLastMatch = params.won;
    this.state.matchMemory.episodeNumber = ep;

    if (params.boardId) {
      this.state.matchMemory.lastBoardId = params.boardId;
    }
    if (params.actionTags && params.actionTags.length > 0) {
      for (const tag of params.actionTags) {
        this.pushActionTag(tag, false);
      }
    }

    // Apply broadcast purse or consolation fee
    const safeCash = Math.max(0, Math.round(params.cashEarned));
    this.state.bankrollCash += safeCash;
    if (this.state.bankrollCash > this.state.telemetry.peakBankrollCash) {
      this.state.telemetry.peakBankrollCash = this.state.bankrollCash;
    }

    if (params.won) {
      this.state.telemetry.totalEpisodesWon += 1;
      if (!this.state.completedEpisodes.includes(ep)) {
        this.state.completedEpisodes.push(ep);
        this.state.completedEpisodes.sort((a, b) => a - b);
      }
      if (params.hadActiveTwist) {
        this.state.telemetry.twistsSurvivedWins += 1;
      }
      if (isTitleBout && params.episodeMisses === 0) {
        this.state.telemetry.flawlessTitleBoutWins += 1;
      }

      // Unlock next episode and corresponding Stage World
      if (ep < MAX_CAMPAIGN_EPISODES_V6) {
        const nextEp = ep + 1;
        if (nextEp > this.state.highestEpisodeUnlocked) {
          this.state.highestEpisodeUnlocked = nextEp;
        }
        this.state.currentEpisode = nextEp;
        const nextStage = getStageMetaForEpisodeV6(nextEp).stageId;
        if (!this.state.unlockedStageWorlds.includes(nextStage)) {
          this.state.unlockedStageWorlds.push(nextStage);
          unlockedStage = nextStage;
        }
      }

      // Clearing Stage 05 Title Bout (Ep 10) unlocks the 5th Podium Relic Slot!
      if (ep === 10 && this.state.maxRelicSlots < 5) {
        this.state.maxRelicSlots = 5;
        expandedRelicSlots = true;
        this.pushActionTag('unlocked_relic_slot_5', false);
      }

      this.pushActionTag(`won_ep_${String(ep).padStart(2, '0')}`, false);
    } else {
      this.pushActionTag(`lost_ep_${String(ep).padStart(2, '0')}`, false);
    }

    const newlyUnlockedAwards = this.evaluateAndUnlockAwards({
      kind: 'EPISODE_FINISHED',
      episodeNumber: ep,
      isTitleBout,
      wonEpisode: params.won,
      episodeMisses: params.episodeMisses,
      hadActiveTwist: params.hadActiveTwist,
    });

    this.save();
    return { newlyUnlockedAwards, unlockedStage, expandedRelicSlots };
  }

  // ---- Economy, 3D Podium Relics (4 -> 5 slots) & Foil Cards (max 3) -------

  public adjustBankroll(deltaCash: number): number {
    this.state.bankrollCash = Math.max(0, Math.round(this.state.bankrollCash + deltaCash));
    if (this.state.bankrollCash > this.state.telemetry.peakBankrollCash) {
      this.state.telemetry.peakBankrollCash = this.state.bankrollCash;
    }
    this.evaluateAndUnlockAwards({ kind: 'RELIC_UPDATED' });
    this.save();
    return this.state.bankrollCash;
  }

  public expandRelicSlots(costCash = 0): boolean {
    if (this.state.maxRelicSlots >= 5) return false;
    if (costCash > 0 && this.state.bankrollCash < costCash) return false;
    this.state.bankrollCash = Math.max(0, this.state.bankrollCash - costCash);
    this.state.maxRelicSlots = 5;
    this.pushActionTag('unlocked_relic_slot_5', false);
    this.save();
    return true;
  }

  public purchaseAndEquipRelic(relicId: string, costCash: number): { ok: boolean; newlyUnlockedAwards: HonorAwardDefinitionV6[] } {
    if (!relicId || this.state.bankrollCash < costCash) {
      return { ok: false, newlyUnlockedAwards: [] };
    }
    if (!this.state.ownedRelicIds.includes(relicId)) {
      this.state.bankrollCash -= Math.max(0, Math.round(costCash));
      this.state.ownedRelicIds.push(relicId);
    }
    if (!this.state.equippedRelicIds.includes(relicId) && this.state.equippedRelicIds.length < this.state.maxRelicSlots) {
      this.state.equippedRelicIds.push(relicId);
    }
    this.pushActionTag(`equipped_${relicId}`, false);
    const newlyUnlockedAwards = this.evaluateAndUnlockAwards({ kind: 'RELIC_UPDATED' });
    this.save();
    return { ok: true, newlyUnlockedAwards };
  }

  public equipRelic(relicId: string): { ok: boolean; newlyUnlockedAwards: HonorAwardDefinitionV6[] } {
    if (!relicId) return { ok: false, newlyUnlockedAwards: [] };
    if (!this.state.ownedRelicIds.includes(relicId)) {
      this.state.ownedRelicIds.push(relicId);
    }
    if (this.state.equippedRelicIds.includes(relicId)) {
      return { ok: true, newlyUnlockedAwards: [] };
    }
    if (this.state.equippedRelicIds.length >= this.state.maxRelicSlots) {
      return { ok: false, newlyUnlockedAwards: [] };
    }
    this.state.equippedRelicIds.push(relicId);
    const newlyUnlockedAwards = this.evaluateAndUnlockAwards({ kind: 'RELIC_UPDATED' });
    this.save();
    return { ok: true, newlyUnlockedAwards };
  }

  public unequipRelic(relicId: string): boolean {
    const idx = this.state.equippedRelicIds.indexOf(relicId);
    if (idx === -1) return false;
    this.state.equippedRelicIds.splice(idx, 1);
    this.save();
    return true;
  }

  /**
   * Drag/reorder equipped Relics left-to-right so players optimize
   * Balatro-style +Chips (left) -> xMult (right) slot-order cascades!
   */
  public reorderEquippedRelics(fromIndex: number, toIndex: number): string[] {
    const list = this.state.equippedRelicIds;
    if (
      fromIndex < 0 ||
      fromIndex >= list.length ||
      toIndex < 0 ||
      toIndex >= list.length ||
      fromIndex === toIndex
    ) {
      return [...list];
    }
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    this.pushActionTag('reordered_relic_slots', false);
    this.save();
    return [...list];
  }

  public setEquippedRelicOrder(orderedIds: readonly string[]): string[] {
    const valid = orderedIds.filter((id) => this.state.equippedRelicIds.includes(id));
    const remainder = this.state.equippedRelicIds.filter((id) => !valid.includes(id));
    this.state.equippedRelicIds = [...valid, ...remainder].slice(0, this.state.maxRelicSlots);
    this.save();
    return [...this.state.equippedRelicIds];
  }

  public addFoilCard(card: FoilTrickCardV6, costCash = 0): boolean {
    if (this.state.heldFoilCards.length >= MAX_HELD_FOIL_CARDS_V6) {
      return false;
    }
    if (costCash > 0 && this.state.bankrollCash < costCash) {
      return false;
    }
    this.state.bankrollCash = Math.max(0, this.state.bankrollCash - Math.round(costCash));
    this.state.heldFoilCards.push({ ...card });
    this.pushActionTag(`bought_foil_${card.effectKind.toLowerCase()}`, false);
    this.save();
    return true;
  }

  public consumeFoilCard(cardId: string): { card: FoilTrickCardV6 | null; newlyUnlockedAwards: HonorAwardDefinitionV6[] } {
    const idx = this.state.heldFoilCards.findIndex((c) => c.cardId === cardId);
    if (idx === -1) {
      return { card: null, newlyUnlockedAwards: [] };
    }
    const [card] = this.state.heldFoilCards.splice(idx, 1);
    this.state.telemetry.foilsPlayedCount += 1;
    if (card.effectKind === 'SCREW_RIVAL' || card.effectKind === 'STEAL_RIVAL_POT') {
      this.state.telemetry.screwOrStealPlays += 1;
    }
    this.pushActionTag(`played_foil_${card.effectKind.toLowerCase()}`, false);
    const newlyUnlockedAwards = this.evaluateAndUnlockAwards({
      kind: 'FOIL_PLAYED',
      foilEffectKind: card.effectKind,
    });
    this.save();
    return { card, newlyUnlockedAwards };
  }

  // ---- Clue, Trapdoor & Action Memory Tracking -----------------------------

  public pushActionTag(tag: string, persist = true): void {
    if (!tag) return;
    this.state.matchMemory.lastActionTags = pushBoundedUnique(
      this.state.matchMemory.lastActionTags,
      tag,
      12,
    );
    if (persist) this.save();
  }

  public recordClueResolution(params: {
    toy: Pick<ToyDefinitionV6, 'toyId' | 'toyNumber' | 'family'>;
    resolution: ToyResolutionV6;
    brokeLockedChain?: boolean;
  }): HonorAwardDefinitionV6[] {
    const { toy, resolution, brokeLockedChain } = params;
    this.state.telemetry.totalCluesAttempted += 1;
    this.recordToyPlayed(toy.toyId, toy.family, false);

    if (resolution.specificActionTag) {
      this.pushActionTag(resolution.specificActionTag, false);
    }

    if (resolution.correct) {
      this.state.telemetry.totalCluesCorrect += 1;
      this.state.telemetry.currentStreak += 1;
      if (this.state.telemetry.currentStreak > this.state.telemetry.bestStreak) {
        this.state.telemetry.bestStreak = this.state.telemetry.currentStreak;
      }
      if (this.state.telemetry.bestStreak > this.state.matchMemory.maxStreakReached) {
        this.state.matchMemory.maxStreakReached = this.state.telemetry.bestStreak;
      }
      if (!this.state.telemetry.toyFamiliesCleared.includes(toy.family)) {
        this.state.telemetry.toyFamiliesCleared.push(toy.family);
      }
      if (toy.family === 'DEFUSAL_ELIMINATION' && resolution.secondsRemaining >= 3.0) {
        this.state.telemetry.defusalFastClear = true;
      }
      if (toy.family === 'ATLAS_RELIEF_SPATIAL' && resolution.accuracyRatio >= 0.9) {
        this.state.telemetry.atlasPinpointClear = true;
      }
      if (toy.family === 'RAPID_PADDLES_REFLEX' && resolution.secondsRemaining >= 4.0) {
        this.state.telemetry.rapidPaddleFastClear = true;
      }
      if (brokeLockedChain) {
        this.state.telemetry.chainsBrokenCount += 1;
        this.pushActionTag('shattered_iron_chains', false);
      }
    }

    const unlocked = this.evaluateAndUnlockAwards({
      kind: 'CLUE_RESOLVED',
      toyFamily: toy.family,
      toyNumber: toy.toyNumber,
      toyResolution: resolution,
      brokeLockedChain,
    });
    this.save();
    return unlocked;
  }

  public recordTrapdoorResult(params: {
    trapdoorId: string;
    survived: boolean;
    secondsRemaining: number;
  }): HonorAwardDefinitionV6[] {
    this.state.telemetry.totalTrapdoorsEntered += 1;
    this.recordTrapdoorPlayed(params.trapdoorId, false);

    if (params.survived) {
      this.state.telemetry.totalTrapdoorsSurvived += 1;
      this.state.matchMemory.survivedTrapdoorCount += 1;
      if (
        this.state.telemetry.fastestClutchTrapdoorSec === null ||
        params.secondsRemaining < this.state.telemetry.fastestClutchTrapdoorSec
      ) {
        this.state.telemetry.fastestClutchTrapdoorSec = params.secondsRemaining;
      }
      this.pushActionTag(params.secondsRemaining < 1.5 ? 'trapdoor_clutch' : 'trapdoor_survived', false);
    } else {
      this.state.telemetry.currentStreak = 0;
      this.pushActionTag('trapdoor_fell', false);
    }

    const unlocked = this.evaluateAndUnlockAwards({
      kind: 'TRAPDOOR_RESOLVED',
      trapdoorSurvived: params.survived,
      trapdoorSecondsRemaining: params.secondsRemaining,
    });
    this.save();
    return unlocked;
  }

  // ---- Non-Repeating Board, Toy & Trapdoor Rotation ------------------------

  public recordBoardPlayed(boardId: string, family?: BoardFamilyIdV6, persist = true): void {
    if (!boardId) return;
    this.state.matchMemory.lastBoardId = boardId;
    this.state.rotationHistory.recentBoardIds = pushBoundedUnique(
      this.state.rotationHistory.recentBoardIds,
      boardId,
      BOARD_ROTATION_COOLDOWN_V6,
    );
    if (family) {
      this.state.rotationHistory.recentBoardFamilies = [
        ...this.state.rotationHistory.recentBoardFamilies.filter((f) => f !== family),
        family,
      ].slice(-3);
    }
    if (!this.state.telemetry.uniqueBoardIdsPlayed.includes(boardId)) {
      this.state.telemetry.uniqueBoardIdsPlayed.push(boardId);
    }
    if (persist) {
      this.evaluateAndUnlockAwards({ kind: 'RELIC_UPDATED' });
      this.save();
    }
  }

  public recordToyPlayed(toyId: string, family?: ToyFamilyIdV6, persist = true): void {
    if (!toyId) return;
    this.state.matchMemory.lastToyId = toyId;
    this.state.rotationHistory.recentToyIds = pushBoundedUnique(
      this.state.rotationHistory.recentToyIds,
      toyId,
      TOY_ROTATION_COOLDOWN_V6,
    );
    if (family) {
      this.state.rotationHistory.recentToyFamilies = [
        ...this.state.rotationHistory.recentToyFamilies,
        family,
      ].slice(-2);
    }
    if (!this.state.telemetry.uniqueToyIdsPlayed.includes(toyId)) {
      this.state.telemetry.uniqueToyIdsPlayed.push(toyId);
    }
    if (persist) this.save();
  }

  public recordTrapdoorPlayed(trapdoorId: string, persist = true): void {
    if (!trapdoorId) return;
    this.state.rotationHistory.recentTrapdoorIds = pushBoundedUnique(
      this.state.rotationHistory.recentTrapdoorIds,
      trapdoorId,
      TRAPDOOR_ROTATION_COOLDOWN_V6,
    );
    if (persist) this.save();
  }

  /**
   * Selects a non-repeating 3D Board preferring native Stage World contraptions
   * while strictly preventing immediate repeats (never plays same board twice in a row).
   */
  public selectNextBoard(
    candidates: readonly BoardDefinitionV6[],
    preferredStage?: StageWorldIdV6,
    rng: () => number = Math.random,
  ): BoardDefinitionV6 {
    if (candidates.length === 0) {
      throw new Error('CareerSaveStoreV6.selectNextBoard requires at least 1 candidate board.');
    }
    if (candidates.length === 1) {
      return candidates[0];
    }

    const lastBoardId = this.state.matchMemory.lastBoardId;
    const recentSet = new Set(this.state.rotationHistory.recentBoardIds);
    const lastFamily =
      this.state.rotationHistory.recentBoardFamilies[
        this.state.rotationHistory.recentBoardFamilies.length - 1
      ];

    const pickFrom = (pool: readonly BoardDefinitionV6[]): BoardDefinitionV6 => {
      const idx = Math.floor(Math.max(0, Math.min(0.999999, rng())) * pool.length);
      return pool[idx];
    };

    // Tier 1: Native to Stage World, outside cooldown window, fresh family
    if (preferredStage) {
      const tier1 = candidates.filter(
        (b) =>
          b.signatureStage === preferredStage &&
          b.boardId !== lastBoardId &&
          !recentSet.has(b.boardId) &&
          b.family !== lastFamily,
      );
      if (tier1.length > 0) return pickFrom(tier1);

      // Tier 2: Native to Stage World, outside cooldown window
      const tier2 = candidates.filter(
        (b) => b.signatureStage === preferredStage && b.boardId !== lastBoardId && !recentSet.has(b.boardId),
      );
      if (tier2.length > 0) return pickFrom(tier2);

      // Tier 3: Native to Stage World, at least not the immediate previous board
      const tier3 = candidates.filter(
        (b) => b.signatureStage === preferredStage && b.boardId !== lastBoardId,
      );
      if (tier3.length > 0) return pickFrom(tier3);
    }

    // Tier 4: Any stage, outside cooldown window & fresh family
    const tier4 = candidates.filter(
      (b) => b.boardId !== lastBoardId && !recentSet.has(b.boardId) && b.family !== lastFamily,
    );
    if (tier4.length > 0) return pickFrom(tier4);

    // Tier 5: Any stage, outside cooldown window
    const tier5 = candidates.filter((b) => b.boardId !== lastBoardId && !recentSet.has(b.boardId));
    if (tier5.length > 0) return pickFrom(tier5);

    // Tier 6: Strictly not identical to lastBoardId
    const tier6 = candidates.filter((b) => b.boardId !== lastBoardId);
    return pickFrom(tier6.length > 0 ? tier6 : candidates);
  }

  /**
   * Selects a non-repeating interactive Question Toy guaranteeing the player
   * never gets the same toy twice in a row and avoids back-to-back identical Toy Families.
   */
  public selectNextToy(
    candidates: readonly ToyDefinitionV6[],
    opts?: {
      preferTwist?: boolean;
      allowedFamilies?: readonly ToyFamilyIdV6[];
      rng?: () => number;
    },
  ): ToyDefinitionV6 {
    if (candidates.length === 0) {
      throw new Error('CareerSaveStoreV6.selectNextToy requires at least 1 candidate toy.');
    }
    if (candidates.length === 1) {
      return candidates[0];
    }

    const rng = opts?.rng ?? Math.random;
    const lastToyId = this.state.matchMemory.lastToyId;
    const recentSet = new Set(this.state.rotationHistory.recentToyIds);
    const lastFamily =
      this.state.rotationHistory.recentToyFamilies[
        this.state.rotationHistory.recentToyFamilies.length - 1
      ];

    const basePool =
      opts?.allowedFamilies && opts.allowedFamilies.length > 0
        ? candidates.filter((t) => opts.allowedFamilies!.includes(t.family))
        : candidates;
    const working = basePool.length > 0 ? basePool : candidates;

    const pickFrom = (pool: readonly ToyDefinitionV6[]): ToyDefinitionV6 => {
      const idx = Math.floor(Math.max(0, Math.min(0.999999, rng())) * pool.length);
      return pool[idx];
    };

    const twistFilter = (t: ToyDefinitionV6): boolean =>
      opts?.preferTwist === undefined ? true : t.isTwistToy === opts.preferTwist;

    const tier1 = working.filter(
      (t) => twistFilter(t) && t.toyId !== lastToyId && !recentSet.has(t.toyId) && t.family !== lastFamily,
    );
    if (tier1.length > 0) return pickFrom(tier1);

    const tier2 = working.filter(
      (t) => t.toyId !== lastToyId && !recentSet.has(t.toyId) && t.family !== lastFamily,
    );
    if (tier2.length > 0) return pickFrom(tier2);

    const tier3 = working.filter((t) => t.toyId !== lastToyId && !recentSet.has(t.toyId));
    if (tier3.length > 0) return pickFrom(tier3);

    const tier4 = working.filter((t) => t.toyId !== lastToyId);
    return pickFrom(tier4.length > 0 ? tier4 : working);
  }

  public selectNextTrapdoorId(allTrapdoorIds: readonly string[], rng: () => number = Math.random): string {
    if (allTrapdoorIds.length === 0) return 'trapdoor_01_rock_bands';
    const recent = new Set(this.state.rotationHistory.recentTrapdoorIds);
    const last = this.state.rotationHistory.recentTrapdoorIds[this.state.rotationHistory.recentTrapdoorIds.length - 1];
    const fresh = allTrapdoorIds.filter((id) => !recent.has(id) && id !== last);
    const pool = fresh.length > 0 ? fresh : allTrapdoorIds.filter((id) => id !== last);
    const active = pool.length > 0 ? pool : allTrapdoorIds;
    return active[Math.floor(Math.max(0, Math.min(0.999999, rng())) * active.length)];
  }

  // ---- 36-Award Automatic Evaluator & Top-3 Podium Display Medals ----------

  public evaluateAndUnlockAwards(ctx?: AwardEvaluationContextV6): HonorAwardDefinitionV6[] {
    const t = this.state.telemetry;
    const completed = new Set(this.state.completedEpisodes);
    const families = new Set(t.toyFamiliesCleared);
    const newlyUnlocked: HonorAwardDefinitionV6[] = [];

    const check = (awardId: string, predicate: boolean): void => {
      if (!predicate || this.state.unlockedAwardIds.includes(awardId)) return;
      this.state.unlockedAwardIds.push(awardId);
      const def = this.externalAwardsById.get(awardId);
      if (def) {
        newlyUnlocked.push(def);
        // Auto-pin the first 3 earned medals onto the stage podium if empty slots exist
        if (def.kind === 'MEDAL' && this.state.pinnedPodiumMedalIds.length < MAX_PINNED_PODIUM_MEDALS_V6) {
          this.state.pinnedPodiumMedalIds.push(awardId);
        }
      }
    };

    // 12 Championship Trophies
    check('trophy_01_vaudeville_curtain', completed.has(2));
    check('trophy_02_geneva_tourbillon', completed.has(4));
    check('trophy_03_monte_carlo_whale', completed.has(6));
    check('trophy_04_sextant_meridian', completed.has(8));
    check('trophy_05_nixie_clearance', completed.has(10));
    check('trophy_06_kintsugi_chalice', completed.has(12));
    check('trophy_07_pier_calliope', completed.has(14));
    check('trophy_08_abyssal_bell', completed.has(16));
    check('trophy_09_aurora_orrery', completed.has(18));
    check('trophy_10_sovereign_crown', completed.has(20));
    check('trophy_11_grand_collector', this.state.equippedRelicIds.length >= 5);
    check('trophy_12_perfect_broadcast', t.flawlessTitleBoutWins >= 1);

    // 24 Cast Relief Medals
    check('medal_01_first_spotlight', t.totalCluesCorrect >= 1);
    check('medal_02_uncut_detonator', t.defusalFastClear);
    check('medal_03_pinpoint_navigator', t.atlasPinpointClear);
    check('medal_04_safe_cracker', families.has('DIALS_CRYPTEX_LOCKS'));
    check('medal_05_lightning_paddle', t.rapidPaddleFastClear);
    check('medal_06_ear_of_gold', families.has('PROGRESSIVE_AUDIO_REVEAL'));
    check('medal_07_balance_master', families.has('WAGER_SCALE_CHRONOLOGY'));
    check('medal_08_velvet_bluffer', families.has('CASINO_BLUFF_STAKES'));
    check('medal_09_forensic_eye', families.has('FORENSIC_DETECTIVE'));
    check('medal_10_kinetic_tamer', families.has('KINETIC_CONTRAPTIONS'));
    check(
      'medal_11_lie_buster',
      families.has('MIND_GAME_TWISTS') ||
        Boolean(ctx?.toyNumber && ctx.toyNumber >= 91 && ctx.toyResolution?.correct),
    );
    check('medal_12_trapdoor_houdini', t.totalTrapdoorsSurvived >= 1);
    check('medal_13_nine_lives', t.totalTrapdoorsSurvived >= 5);
    check(
      'medal_14_clutch_escape',
      t.fastestClutchTrapdoorSec !== null && t.fastestClutchTrapdoorSec < 1.5,
    );
    check('medal_15_streak_five', t.bestStreak >= 5);
    check('medal_16_streak_ten', t.bestStreak >= 10);
    check('medal_17_chain_breaker', t.chainsBrokenCount >= 1);
    check('medal_18_twist_survivor', t.twistsSurvivedWins >= 1);
    check('medal_19_dirty_trickster', t.foilsPlayedCount >= 3);
    check('medal_20_screw_turnabout', t.screwOrStealPlays >= 1);
    check('medal_21_bankroll_5k', t.peakBankrollCash >= 5000);
    check('medal_22_bankroll_25k', t.peakBankrollCash >= 25000);
    check('medal_23_world_traveler', t.uniqueBoardIdsPlayed.length >= 10);
    check('medal_24_century_mind', t.totalCluesCorrect >= 100);

    return newlyUnlocked;
  }

  public setPinnedPodiumMedals(awardIds: readonly string[]): string[] {
    const unlocked = new Set(this.state.unlockedAwardIds);
    const cleaned = Array.from(new Set(awardIds.filter((id) => unlocked.has(id)))).slice(
      0,
      MAX_PINNED_PODIUM_MEDALS_V6,
    );
    this.state.pinnedPodiumMedalIds = cleaned;
    this.save();
    return [...cleaned];
  }

  public togglePinnedPodiumMedal(awardId: string): string[] {
    if (!this.state.unlockedAwardIds.includes(awardId)) {
      return [...this.state.pinnedPodiumMedalIds];
    }
    const existing = this.state.pinnedPodiumMedalIds.indexOf(awardId);
    if (existing !== -1) {
      this.state.pinnedPodiumMedalIds.splice(existing, 1);
    } else if (this.state.pinnedPodiumMedalIds.length < MAX_PINNED_PODIUM_MEDALS_V6) {
      this.state.pinnedPodiumMedalIds.push(awardId);
    } else {
      // Replace oldest pinned medal cleanly
      this.state.pinnedPodiumMedalIds.shift();
      this.state.pinnedPodiumMedalIds.push(awardId);
    }
    this.save();
    return [...this.state.pinnedPodiumMedalIds];
  }

  // ---- Broadcast Mixing Desk Options ---------------------------------------

  public updateOptions(patch: Partial<BroadcastOptionsStateV6>): BroadcastOptionsStateV6 {
    this.state.options = sanitizeOptions({
      ...this.state.options,
      ...patch,
    });
    this.save();
    return { ...this.state.options };
  }

  // ---- Career Vault Reset Controls (Bay 4 Safety Flip-Covers) --------------

  public resetCampaignProgress(): void {
    const fresh = createInitialCareerStateV6();
    this.state = {
      ...fresh,
      options: { ...this.state.options },
      unlockedAwardIds: [...this.state.unlockedAwardIds],
      pinnedPodiumMedalIds: [...this.state.pinnedPodiumMedalIds],
      rotationHistory: { ...this.state.rotationHistory },
      telemetry: {
        ...this.state.telemetry,
        currentStreak: 0,
      },
    };
    this.save();
  }

  public resetAllCareerData(preserveOptions = true): void {
    const existingOptions = { ...this.state.options };
    this.state = createInitialCareerStateV6();
    if (preserveOptions) {
      this.state.options = existingOptions;
    }
    if (this.storage) {
      try {
        this.storage.removeItem(this.storageKey);
      } catch {
        // Ignore storage restrictions
      }
    }
    this.save();
  }
}
