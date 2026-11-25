// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// Single Canonical Contract (`src/v7/contracts_v7.ts`)
// Zero Split-Brain IDs — Shared 1:1 by Engine, 10 Stages, 12 3D Boards,
// 14 Tactile Contraptions, 4,200+ Pinned Clues, Showband Audio, 90-Episode
// Branching Campaign, Prop Trunk, Ceremony & 36-Award Lit Sovereign Vault.
// ============================================================================

export type DomainIdV7 = 'SCI_TECH' | 'POP_LIT' | 'NUM_GEO' | 'HIST_FACT';

/** 20 Zero-Abbreviation <= 10-Char Categories (5 per Domain, 100% Whole Words). */
export type CategoryIdV7 =
  // SCI_TECH (#0072B2 Cobalt Hex, #FFFDF7 Ivory Relief)
  | 'MEDICINE'
  | 'CHEMISTRY'
  | 'PHYSICS'
  | 'GADGETS'
  | 'ENGINES'
  // POP_LIT (#E69F00 Amber Scallop, #110E0B Oxidized-Brass Relief)
  | 'LITERATURE'
  | 'LEXICON'
  | 'FINE ARTS'
  | 'SCREEN'
  | 'JUKEBOX'
  // NUM_GEO (#009E73 Emerald Vernier, #110E0B Oxidized-Brass Relief)
  | 'FINANCE'
  | 'PRICING'
  | 'ODDS'
  | 'ATLAS'
  | 'SPORTS'
  // HIST_FACT (#D55E00 Vermilion Wax-Seal, #110E0B Oxidized-Brass Relief)
  | 'DYNASTIES'
  | 'HEADLINES'
  | 'FOLKLORE'
  | 'FALLACIES'
  | 'CUISINE';

export interface DomainVisualSpecV7 {
  readonly domainId: DomainIdV7;
  readonly label: string;
  readonly enamelHex: string;
  readonly enamelHexNum: number;
  readonly glyphHex: string;
  readonly notchShape: 'HEX' | 'SCALLOP' | 'VERNIER' | 'WAX_SEAL';
  readonly categories: readonly CategoryIdV7[];
}

export const DOMAIN_SPECS_V7: Record<DomainIdV7, DomainVisualSpecV7> = {
  SCI_TECH: {
    domainId: 'SCI_TECH',
    label: 'Science & Tech',
    enamelHex: '#0072B2',
    enamelHexNum: 0x0072b2,
    glyphHex: '#FFFDF7',
    notchShape: 'HEX',
    categories: ['MEDICINE', 'CHEMISTRY', 'PHYSICS', 'GADGETS', 'ENGINES'],
  },
  POP_LIT: {
    domainId: 'POP_LIT',
    label: 'Arts & Culture',
    enamelHex: '#E69F00',
    enamelHexNum: 0xe69f00,
    glyphHex: '#110E0B',
    notchShape: 'SCALLOP',
    categories: ['LITERATURE', 'LEXICON', 'FINE ARTS', 'SCREEN', 'JUKEBOX'],
  },
  NUM_GEO: {
    domainId: 'NUM_GEO',
    label: 'Numbers & World',
    enamelHex: '#009E73',
    enamelHexNum: 0x009e73,
    glyphHex: '#110E0B',
    notchShape: 'VERNIER',
    categories: ['FINANCE', 'PRICING', 'ODDS', 'ATLAS', 'SPORTS'],
  },
  HIST_FACT: {
    domainId: 'HIST_FACT',
    label: 'History & Lore',
    enamelHex: '#D55E00',
    enamelHexNum: 0xd55e00,
    glyphHex: '#110E0B',
    notchShape: 'WAX_SEAL',
    categories: ['DYNASTIES', 'HEADLINES', 'FOLKLORE', 'FALLACIES', 'CUISINE'],
  },
};

export const CATEGORY_TO_DOMAIN_V7: Record<CategoryIdV7, DomainIdV7> = {
  MEDICINE: 'SCI_TECH',
  CHEMISTRY: 'SCI_TECH',
  PHYSICS: 'SCI_TECH',
  GADGETS: 'SCI_TECH',
  ENGINES: 'SCI_TECH',
  LITERATURE: 'POP_LIT',
  LEXICON: 'POP_LIT',
  'FINE ARTS': 'POP_LIT',
  SCREEN: 'POP_LIT',
  JUKEBOX: 'POP_LIT',
  FINANCE: 'NUM_GEO',
  PRICING: 'NUM_GEO',
  ODDS: 'NUM_GEO',
  ATLAS: 'NUM_GEO',
  SPORTS: 'NUM_GEO',
  DYNASTIES: 'HIST_FACT',
  HEADLINES: 'HIST_FACT',
  FOLKLORE: 'HIST_FACT',
  FALLACIES: 'HIST_FACT',
  CUISINE: 'HIST_FACT',
};

export const ALL_CATEGORIES_V7: readonly CategoryIdV7[] = Object.keys(
  CATEGORY_TO_DOMAIN_V7,
) as CategoryIdV7[];

// ----------------------------------------------------------------------------
// 1. 10 Grounded 3-Layer Split-Horizon Stage Worlds & 3 Booth Coup Regimes
// ----------------------------------------------------------------------------

export type StageWorldIdV7 =
  | 'STAGE_01_IBC_DAYTIME_FUNK'
  | 'STAGE_02_IBC_PRIMETIME_JUBILEE'
  | 'STAGE_03_1926_VAUDEVILLE_PIT'
  | 'STAGE_04_1958_ISOLATION_VAULT'
  | 'STAGE_05_1984_LARSON_CRT_LAB'
  | 'STAGE_06_ATLANTIC_CITY_PIER'
  | 'STAGE_07_1969_MONTE_CARLO_CASINO'
  | 'STAGE_08_WORLDS_FAIR_GEODESIC'
  | 'STAGE_09_CHANNEL_83_UHF_BARGE'
  | 'STAGE_10_SOVEREIGN_SANCTUM';

export type CoupRegimeIdV7 =
  | 'NONE'
  | 'REGIME_A_ROZ_PHARMA'
  | 'REGIME_B_BELLAMY_UHF'
  | 'REGIME_C_VERA_FORENSIC';

export interface StageWorldSpecV7 {
  readonly stageId: StageWorldIdV7;
  readonly code: string;
  readonly name: string;
  readonly eraLabel: string;
  readonly subtitle: string;
  readonly isSealedVault: boolean; // Zero studio crowd audio in 2:30 AM vaults!
  readonly bpm: number;
  readonly timeSig: '4/4' | '5/4';
  readonly keyLightHex: number;
  readonly coveLightHex: number;
  readonly cycBaseHex: number; // Always L* >= 10 (never 0x000000 black void!)
  readonly floorBaseHex: number;
  readonly tableBedHex: number; // Always matte L* = 18..23 (roughness 0.82) for >=4.8:1 tile pop
  readonly trimVeneerHex: string;
  readonly trimAccentHex: string;
}

// ----------------------------------------------------------------------------
// 2. 12 Interactive +22°-Raked 3D Contraption Boards & 16 Live Twists
// ----------------------------------------------------------------------------

export type BoardIdV7 =
  | 'BOARD_01_FUNK_CROSSFADER'
  | 'BOARD_02_JUBILEE_HEX_BRIDGE'
  | 'BOARD_03_VAUDEVILLE_GEAR_TRAIN'
  | 'BOARD_04_MAHOGANY_SWITCHBOARD'
  | 'BOARD_05_LARSON_SPIN_RING'
  | 'BOARD_06_BOARDWALK_PINBALL'
  | 'BOARD_07_MONTE_CARLO_SHOE'
  | 'BOARD_08_GEODESIC_SUNDIAL'
  | 'BOARD_09_PIRATE_UHF_DECK'
  | 'BOARD_10_SOVEREIGN_ZIGGURAT'
  | 'BOARD_11_WHEW_GAUNTLET'
  | 'BOARD_12_PENDULUM_BALANCE';

export type BoardTwistIdV7 =
  | 'TWIST_01_CROSSFADER_BOOST'
  | 'TWIST_02_HEX_BRIDGE_CHAIN'
  | 'TWIST_03_ESCAPEMENT_TICK_SHIFT'
  | 'TWIST_04_SUPERVISORY_RELAY_PAIR'
  | 'TWIST_05_LARSON_HOT_SPOT'
  | 'TWIST_06_PINBALL_BUMPER_RICOCHET'
  | 'TWIST_07_BACCARAT_NATURAL_21'
  | 'TWIST_08_SOLAR_MERIDIAN_SWEEP'
  | 'TWIST_09_PIRATE_CARRIER_LOCK'
  | 'TWIST_10_ZIGGURAT_APEX_CROWN'
  | 'TWIST_11_GAUNTLET_BLOCKADE_BREACH'
  | 'TWIST_12_FULCRUM_EQUILIBRIUM'
  | 'TWIST_13_AMBER_CHALK_TRUCE'
  | 'TWIST_14_RIVAL_WHEELHOUSE_BOUNTY'
  | 'TWIST_15_SOLENOID_RIGGED_GAMBIT'
  | 'TWIST_16_DOUBLE_STAKE_CORNER';

export type ClassicTvTileTwistV7 =
  | 'NONE'
  | 'LOCKED_VAULT'
  | 'SECRET_SQUARE'
  | 'OPPONENT_CHOICE'
  | 'MYSTERY_CURTAIN'
  | 'INSTANT_BARGAIN'
  | 'SHOWCASE_BONUS';

export interface DailyBroadcastSaveV7 {
  readonly lastPlayedDateIso: string; // YYYY-MM-DD
  readonly currentStreak: number;
  readonly bestStreak: number;
  readonly gamesPlayed: number;
  readonly gamesWon: number;
  readonly todayResult?: {
    readonly dateIso: string;
    readonly episodeNumber: number;
    readonly playerCash: number;
    readonly rivalCash: number;
    readonly won: boolean;
    readonly tileHistory: readonly ('WIN' | 'SECRET_WIN' | 'VAULT_WIN' | 'MYSTERY_WIN' | 'SHOWCASE_WIN' | 'MISS')[];
    readonly shareText: string;
  };
}

export interface BoardTileNodeV7 {
  readonly index: number;
  readonly id: string;
  readonly x: number; // Local table X (-2.3 .. +2.3m)
  readonly z: number; // Local table Z (-1.35 .. +1.35m)
  readonly tierY: number; // Proud local elevation >= 0.12m
  readonly shape: 'HEX' | 'CHAMFER_RECT' | 'OCTAGON' | 'WEDGE_PLINTH';
  category: CategoryIdV7;
  domain: DomainIdV7;
  baseChips: number; // 150 | 200 | 250 | 300 | 400 | 500
  boardMultBonus: number; // +0.0 .. +1.0 (capped at 2.0x cold / 3.0x streaking)
  state: 'OPEN' | 'CLAIMED_PLAYER' | 'CLAIMED_RIVAL' | 'BLITZ_SURVIVOR' | 'RETRACTED';
  tvTwist?: ClassicTvTileTwistV7; // 1966 Network TV Board Twist on this tile
  isVaultLocked?: boolean; // True while LOCKED_VAULT padlock is sealed (unlocks on adjacent claim or 2-streak)
  hasAmberTruce: boolean; // Carmen/Toby/Inez truce ring (+0.35 Mult if respected, breaks trust if poached)
  hasUhfHalo: boolean; // Pirate Channel 83 bonus halo
  isRiggedSolenoid: boolean; // 24Hz shiver + copper spark tell!
  isRivalTarget: boolean; // Visible Rival intent crosshair
  isWheelhouse: boolean; // Rival weak-spot (+0.5x bonus!) or strong-spot
}

// ----------------------------------------------------------------------------
// 3. 14 Non-Isomorphic 1-Gesture Tactile Question Contraptions
// ----------------------------------------------------------------------------

export type ToyIdV7 =
  | 'TOY_01_KNIFE_SWITCH'
  | 'TOY_02_CONFIDENCE_PNEUMATIC'
  | 'TOY_03_VERNIER_DIAL'
  | 'TOY_04_BALANCE_SCALE'
  | 'TOY_05_RELIEF_GLOBE_3D'
  | 'TOY_06_FUSE_WIRE_SNIPPER'
  | 'TOY_07_MAIL_SORTER'
  | 'TOY_08_CHRONOLOGY_RAIL'
  | 'TOY_09_SWITCHBOARD_PATCHBAY'
  | 'TOY_10_CLIFFHANGERS_THROTTLE'
  | 'TOY_11_MISSING_VOWELS_WHEEL'
  | 'TOY_12_CONSPIRACY_LASSO'
  | 'TOY_13_CYANOTYPE_LOUPE'
  | 'TOY_14_FOUR_SHUTTER_REEL';

export const BLITZ_LEGAL_TOYS_V7: readonly ToyIdV7[] = [
  'TOY_01_KNIFE_SWITCH',
  'TOY_03_VERNIER_DIAL',
  'TOY_05_RELIEF_GLOBE_3D',
  'TOY_10_CLIFFHANGERS_THROTTLE',
  'TOY_11_MISSING_VOWELS_WHEEL',
];

// ----------------------------------------------------------------------------
// 4. 12-Gate Verified Clue Schema (`ClueRecordV7`)
// ----------------------------------------------------------------------------

export type DifficultyTierV7 = 1 | 2 | 3 | 4 | 5;

export interface BalanceScalePayloadV7 {
  readonly unit: string;
  readonly targetSum: number;
  readonly weights: readonly [
    { label: string; value: number },
    { label: string; value: number },
    { label: string; value: number },
    { label: string; value: number },
    { label: string; value: number },
  ];
  readonly validPair: readonly [number, number]; // Indices summing to targetSum
}

export interface GeoTargetPayloadV7 {
  readonly lat: number;
  readonly lng: number;
  readonly landmarkLabel: string;
  readonly regionHint: string;
}

export interface NumericDialPayloadV7 {
  readonly target: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly unit: string;
}

export interface MailSorterPayloadV7 {
  readonly chuteALabel: string;
  readonly chuteBLabel: string;
  readonly items: readonly { label: string; chute: 0 | 1 }[];
}

export interface ChronologyPayloadV7 {
  readonly events: readonly { label: string; year: number; displayYear: string }[];
}

export interface PatchbayPayloadV7 {
  readonly callers: readonly [string, string, string]; // 3 left plugs
  readonly jacks: readonly [string, string, string, string]; // 4 right sockets
  readonly correctMapping: readonly [number, number, number]; // jack index for caller 0,1,2
}

export interface MissingVowelsPayloadV7 {
  readonly maskedDisplay: string; // e.g. "C R B L C   C D"
  readonly fullAnswer: string; // "CARBOLIC ACID"
  readonly vowelChoices: readonly [string, string, string, string]; // e.g. ["A-O-I-A-I", ...]
  readonly correctChoiceIdx: 0 | 1 | 2 | 3;
}

export interface ConspiracyLassoPayloadV7 {
  readonly connectionPrompt: string;
  readonly cards: readonly string[]; // 9 cards (3x3)
  readonly triadIndices: readonly [number, number, number];
}

export interface CyanotypePlatePayloadV7 {
  readonly plateId: CategoryIdV7; // Maps to one of 20 bespoke Prussian-Blue SVG cutaway plates!
  readonly targetZoneIdx: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  readonly targetZoneName: string; // Shown ONLY in 1.80s post-answer reveal!
}

export interface ShutterReelPayloadV7 {
  readonly shutters: readonly [string, string, string, string]; // Hardest lateral -> clearest clincher
}

export interface ClueRecordV7 {
  readonly qid: number; // Dense 0 .. N-1 for SeenLedger O(1) bitset
  readonly canonicalEntityKey: string; // Enforces 25-match cross-toy entity cooldown!
  readonly category: CategoryIdV7;
  readonly domain: DomainIdV7;
  readonly difficulty: DifficultyTierV7;
  readonly isBlitzLegal: boolean;
  readonly stem: string;
  readonly choices: readonly [string, string, string, string];
  /** Bijection across {0, 1, 2, 3}: */
  readonly answerIdx: 0 | 1 | 2 | 3;
  readonly poisonedFixIdx: 0 | 1 | 2 | 3; // Plausible trap Roz's rigged Canary may circle!
  readonly waiverPruneIdx: 0 | 1 | 2 | 3; // Stamped [VOID] / [KLAXON BAIT] by Fact-Checker/Scalpel
  readonly anchorIdx: 0 | 1 | 2 | 3;
  readonly isKlaxonMyth: boolean;
  readonly ahaFactoid: string; // Mandatory 1-line post-answer payoff!
  readonly supportedToys: readonly ToyIdV7[];
  // Optional contraption-specific payloads:
  readonly numeric?: NumericDialPayloadV7;
  readonly balance?: BalanceScalePayloadV7;
  readonly geo?: GeoTargetPayloadV7;
  readonly sorter?: MailSorterPayloadV7;
  readonly chronology?: ChronologyPayloadV7;
  readonly patchbay?: PatchbayPayloadV7;
  readonly vowels?: MissingVowelsPayloadV7;
  readonly lasso?: ConspiracyLassoPayloadV7;
  readonly cyanotype?: CyanotypePlatePayloadV7;
  readonly shutters?: ShutterReelPayloadV7;
}

export interface ToyResolutionV7 {
  readonly isCorrect: boolean;
  readonly accuracyRatio: number; // 0.0 .. 1.0 (supports 0.5x partial credit on dial/globe/chronology/cliffhanger!)
  readonly chipMultiplier: number; // e.g. 0.75x Insured, 1.25x Spike, 2.0x Shutter-1, etc.
  readonly chosenSummary: string;
  readonly trueAnswerDisplay: string;
  readonly triggeredKlaxon: boolean;
  readonly fellForPoisonedFix: boolean;
}

// ----------------------------------------------------------------------------
// 5. 6 Rivals + 3 Booth Power Brokers (`CastIdV7` x 4 Gouache States)
// ----------------------------------------------------------------------------

export type RivalIdV7 =
  | 'CARMEN_DELGADO'
  | 'TOBY_OKAFOR'
  | 'INEZ_CALLAHAN'
  | 'ALASTAIR_KERR'
  | 'SEO_YUN_KANG'
  | 'REX_CALLOWAY';

export type BrokerIdV7 = 'GRANT_BELLAMY' | 'ROZ_KORMAN' | 'VERA_KARP';
export type CastIdV7 = RivalIdV7 | BrokerIdV7;
export type PortraitEmotionV7 = 'POISED' | 'TELL' | 'RATTLED' | 'BREAKDOWN';

export interface CastProfileV7 {
  readonly id: CastIdV7;
  readonly role: 'RIVAL_SYMPATHETIC' | 'RIVAL_HEEL' | 'BOOTH_BROKER';
  readonly name: string;
  readonly age: number;
  readonly title: string;
  readonly silhouetteShape: 'SQUARE' | 'TRIANGLE' | 'CIRCLE';
  readonly portraitAsset: string; // 2x2 1966 TV Guide gouache & crow-quill sheet
  readonly accentHex: string;
  readonly weakCategories: readonly CategoryIdV7[]; // 3 per Rival (18) + 4 Bellamy Stage-10 = 20/20 coverage!
  readonly strongCategories: readonly CategoryIdV7[];
  readonly signatureTellText: string;
  readonly cheatChannel: 'ROW_C_GLINT' | 'SOLENOID_SPARK' | 'FRESNEL_LAMP' | 'HONEST';
  readonly baseAccuracy: number;
}

// ----------------------------------------------------------------------------
// 6.Contestant Waiver, 28 Relics x 4 Foils & 36 Unified Sovereign Trophies
// ----------------------------------------------------------------------------

export type DayJobIdV7 =
  | 'PATENT_CLERK' // +20% Chips on SCI_TECH + highlights Cyanotype chamfer hint
  | 'MONOLOGUE_WRITER' // +20% Chips on POP_LIT + reveals 1 shutter free on Reel
  | 'VEGAS_ACTUARY' // +15% Cash on Spike/Gambit wins + shows exact Rival EV
  | 'NIGHT_FACT_CHECKER'; // Auto-stamps [VOID] on 1 distractor every Round 1 clue

export type StageViceIdV7 =
  | 'DOUBLE_OR_NOTHING' // Streak >= 2 adds +0.45 Mult, wrong resets streak + -$100 sting
  | 'KNOW_IT_ALL' // Answering in <= 4.5s adds +60 Speed Chips
  | 'SCOREBOARD_GRUDGE'; // Trailing Rival adds +0.50 Comeback Mult!

export type LienGoalIdV7 =
  | 'CLEAN_PURSE_250K' // Clean network buyout track
  | 'DIRTY_HOUSE_MARKER' // Contraband trunk & Canary hustle track
  | 'STAGE_10_BIBLE'; // Vera Karp whistle-blower horological audit track

export interface ContestantWaiverV7 {
  readonly dayJob: DayJobIdV7;
  readonly stageVice: StageViceIdV7;
  readonly lienGoal: LienGoalIdV7;
  readonly stampedAtIso: string;
}

export type FoilFinishV7 = 'GILDED' | 'SILVER_HALIDE' | 'DICHROIC' | 'TAX_STAMPED';

export interface RelicSpecV7 {
  readonly relicId: string;
  readonly name: string;
  readonly ledgerKind: 'CLEAN' | 'CONTRABAND';
  readonly slotKind: 'CHIPS_OR_UTILITY' | 'MULT_DRIVER'; // Max 2 MULT_DRIVER slots in 5-slot trunk!
  readonly costCash: number;
  readonly description: string;
  readonly triggerSummary: string;
  readonly defaultFoil: FoilFinishV7;
}

export interface OwnedRelicV7 {
  readonly relicId: string;
  readonly foil: FoilFinishV7;
}

export interface TrophySpecV7 {
  readonly trophyId: string; // Canonical `trophy_s1_01` .. `trophy_s4_36`
  readonly season: 1 | 2 | 3 | 4;
  readonly name: string;
  readonly subtitle: string;
  readonly engraving: string;
  readonly unlockRuleText: string;
  readonly materialTier: 'GOLD_24K' | 'BLUED_STEEL_GOLD' | 'GRAND_FEU_ENAMEL' | 'PLATINUM_ONYX';
  readonly sculptKind:
    | 'RIBBON_MIC'
    | 'TURNTABLE_PLATTER'
    | 'HEX_STARBURST'
    | 'VAUDEVILLE_RATCHET'
    | 'ISOLATION_RELAY'
    | 'LARSON_OSCILLOSCOPE'
    | 'WURLITZER_LYRE'
    | 'ROULETTE_ASTROLABE'
    | 'GEODESIC_ARMILLARY'
    | 'PIRATE_KLYSTRON'
    | 'ESCAPEMENT_CROWN'
    | 'SUBPOENA_PENDULUM';
}

// ----------------------------------------------------------------------------
// 7. Broadcast Match State, Options & 90-Episode Branching Campaign Save
// ----------------------------------------------------------------------------

export interface BroadcastSettingsV7 {
  masterVolume: number; // 0..100
  musicVolume: number; // 0..100
  sfxVolume: number; // 0..100
  crowdVolume: number; // 0..100
  ambienceVolume: number; // 0..100
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  highContrastBadges: boolean;
}

export interface EpisodeBlueprintV7 {
  readonly episodeNumber: number; // 1 .. 90
  readonly season: 1 | 2 | 3 | 4;
  readonly code: string; // e.g. "S01E01"
  readonly title: string;
  readonly stageId: StageWorldIdV7;
  readonly boardId: BoardIdV7;
  readonly twistId: BoardTwistIdV7;
  readonly rivalId: RivalIdV7;
  readonly isRoadshow: boolean;
  readonly isGoldenExitMatch: boolean;
  readonly isVaultDrop: boolean;
  readonly isCoupPivot: boolean;
  readonly isFinale: boolean;
  readonly coldOpenLine: { speaker: CastIdV7; line: string };
  readonly boothCheatHint: string;
  readonly canaryBroker: BrokerIdV7;
  readonly canaryNote: string;
  readonly canaryIsPoisoned: boolean;
}

export interface CampaignSaveStateV7 {
  readonly version: 'WS_V7_GOLD_1';
  waiver: ContestantWaiverV7 | null;
  currentEpisode: number; // 1 .. 90
  season: 1 | 2 | 3 | 4;
  cleanPurseCash: number; // Exact integer $1
  contrabandTrunkCash: number; // Exact integer $1
  grudgeBountyPool: number; // Honest-loss 50% carryover pot!
  lienSegmentsPaid: number; // 0 .. 12 on the Brass Lien Wheel
  activeCoupRegime: CoupRegimeIdV7;
  equippedRelics: OwnedRelicV7[]; // Up to 5 slots (<= 2 MULT_DRIVER)
  unlockedTrophyIds: string[]; // Subset of TROPHY_CATALOG_V7[36].trophyId
  rivalTrust: Record<RivalIdV7, number>; // -3 .. +3 (drives Toby Mercy Switches, Golden Exits & VIP Jury!)
  brokerFavor: Record<BrokerIdV7, number>; // Drives Hour-11 Booth Coup & 5 Stage-10 Endings
  boothArrestsCount: number;
  canaryAcceptedCount: number;
  canaryBurnedCount: number;
  episodesWon: number;
  episodesPlayed: number;
  unlockedEndings: string[];
  recentEntityKeys: string[]; // 25-match cross-toy entity cooldown ring
  settings: BroadcastSettingsV7;
}
