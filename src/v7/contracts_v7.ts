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

export type BoardPlayModeV7 =
  | 'CLASSIC_TOTE'
  | 'TIC_TAC_LINE'
  | 'COAST_HEX_BRIDGE'
  | 'EYE_GUESS_MEMORY'
  | 'CONCENTRATION_PRIZE_MATCH'
  | 'MONTY_CURTAIN_DEAL'
  | 'PRESS_YOUR_LUCK_GREMLIN'
  | 'BIG_WHEEL_SHOWCASE';

export const ALL_BOARD_PLAY_MODES_V7: readonly BoardPlayModeV7[] = [
  'CLASSIC_TOTE',
  'TIC_TAC_LINE',
  'COAST_HEX_BRIDGE',
  'EYE_GUESS_MEMORY',
  'CONCENTRATION_PRIZE_MATCH',
  'MONTY_CURTAIN_DEAL',
  'PRESS_YOUR_LUCK_GREMLIN',
  'BIG_WHEEL_SHOWCASE',
];

export const BOARD_PLAY_MODE_TITLES_V7: Record<BoardPlayModeV7, string> = {
  CLASSIC_TOTE: '1964 CLASSIC TOTE',
  TIC_TAC_LINE: 'HOLLYWOOD SQUARES · 3-IN-A-ROW',
  COAST_HEX_BRIDGE: 'COAST-TO-COAST BRIDGE',
  EYE_GUESS_MEMORY: "EYE GUESS '66 · MEMORY FLASH",
  CONCENTRATION_PRIZE_MATCH: "CONCENTRATION '65 · PRIZE MATCH",
  MONTY_CURTAIN_DEAL: "LET'S MAKE A DEAL · CURTAIN SHOW",
  PRESS_YOUR_LUCK_GREMLIN: "PRESS YOUR LUCK '66 · GREMLIN BOARD",
  BIG_WHEEL_SHOWCASE: '1966 BIG WHEEL SHOWCASE',
};

export type BoardUnlockTopologyV7 =
  | 'CLASSIC_OPEN'
  | 'PYRAMID_CLIMB'
  | 'KEY_AND_SAFE'
  | 'CENTER_STARBURST'
  | 'ROVING_SPOTLIGHT';

export const ALL_BOARD_UNLOCK_TOPOLOGIES_V7: readonly BoardUnlockTopologyV7[] = [
  'CLASSIC_OPEN',
  'PYRAMID_CLIMB',
  'KEY_AND_SAFE',
  'CENTER_STARBURST',
  'ROVING_SPOTLIGHT',
];

export type QuestionCardStyleV7 =
  | 'CLASSIC_CUE'
  | 'HEADLINE_BLANK'
  | 'PICTURE_MONITOR'
  | 'SPOT_THE_MYTH'
  | 'BINARY_SPLIT'
  | 'HIGHER_OR_LOWER'
  | 'ODD_ONE_OUT'
  | 'FINISH_THE_LINE'
  | 'WHO_WHAT_AM_I'
  | 'BEFORE_OR_AFTER';

export function isTwoPaddleCardStyleV7(style?: QuestionCardStyleV7): boolean {
  return (
    style === 'BINARY_SPLIT' ||
    style === 'HIGHER_OR_LOWER' ||
    style === 'BEFORE_OR_AFTER'
  );
}

export type CpuPlaystyleIdV7 =
  | 'GAMBLER'
  | 'BLOCKER'
  | 'PROFESSOR'
  | 'HIGH_ROLLER'
  | 'CLUTCH_SHARK';

export type CpuTemperamentIdV7 =
  | 'HOTHEAD'
  | 'ICE_VEINED'
  | 'STEADY'
  | 'SHOWBOAT';

export type DifficultyModeV7 =
  | 'MATINEE_EASY'
  | 'PRIMETIME_NORMAL'
  | 'ALLSTAR_HARD'
  | 'MASTERMIND';

export type ClassicTvTileTwistV7 =
  | 'NONE'
  | 'LOCKED_VAULT'
  | 'SECRET_SQUARE'
  | 'OPPONENT_CHOICE'
  | 'MYSTERY_CURTAIN'
  | 'INSTANT_BARGAIN'
  | 'SHOWCASE_BONUS'
  | 'BIG_WHEEL_SPIN'
  | 'BLIND_CATEGORY'
  | 'MYSTERY_CASH'
  | 'BRASS_KEY'
  | 'PRESS_LUCK_SPIN';

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
  /** Strictly isolated Past-Show Archive Tape completions (never alters live streak!). */
  readonly archiveResults?: Readonly<
    Record<
      string,
      {
        readonly dailyNumber: number;
        readonly playerCash: number;
        readonly rivalCash: number;
        readonly won: boolean;
        readonly playedAtIso: string;
      }
    >
  >;
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
  nominalBaseChips?: number; // Pre-Act-II-boost nominal dollar tier for live difficulty pacing
  boardMultBonus: number; // +0.0 .. +1.0 (capped at 2.0x cold / 3.0x streaking)
  state: 'OPEN' | 'CLAIMED_PLAYER' | 'CLAIMED_RIVAL' | 'BLITZ_SURVIVOR' | 'RETRACTED';
  tvTwist?: ClassicTvTileTwistV7; // 1966 Network TV Board Twist on this tile
  isVaultLocked?: boolean; // True while LOCKED_VAULT padlock is sealed (unlocks on adjacent claim or 2-streak)
  isTopologyLocked?: boolean; // True while gated by PYRAMID_CLIMB / KEY_AND_SAFE / CENTER_STARBURST / ROVING_SPOTLIGHT
  keyholderProtectedTurns?: number; // >0 shields an unlocked Safe tile from CPU sniping for 1 turn!
  blindCategoryHidden?: boolean; // True on BLIND_CATEGORY ('$600 · ???') until tapped
  mysteryCashHidden?: boolean; // True on MYSTERY_CASH ('CATEGORY · $???') until tapped
  hasAmberTruce: boolean; // Carmen/Toby/Inez truce ring (+0.35 Mult if respected, breaks trust if poached)
  hasUhfHalo: boolean; // Pirate Channel 83 bonus halo
  isRiggedSolenoid: boolean; // 24Hz shiver + copper spark tell!
  isRivalTarget: boolean; // Visible Rival intent crosshair
  isWheelhouse: boolean; // Rival weak-spot (+0.5x bonus!) or strong-spot
  revealedConcentrationPrize?: string; // Stamped Concentration prize icon for Match-Steal!
  // Additive v9 fields (R4 VIP Bluff & R7 Anti-Repetition Boards)
  tvTwistV9?: ClassicTvTileTwistV9;
  vipId?: VipCelebIdV9;
  isLiveWireLocked?: boolean;
  isSpotlightTile?: boolean;
  dominoGroupId?: number;
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
  readonly cardStyle?: QuestionCardStyleV7; // Optional 1966 visual monitor card treatment
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
// 5. 24 1960s Champions + 3 Booth Power Brokers (`CastIdV7` x 4 Gouache States)
// ----------------------------------------------------------------------------

export type RivalIdV7 =
  | 'CARMEN_DELGADO'
  | 'TOBY_OKAFOR'
  | 'INEZ_CALLAHAN'
  | 'ALASTAIR_KERR'
  | 'SEO_YUN_KANG'
  | 'REX_CALLOWAY'
  | 'DOTTY_VANCE'
  | 'CHET_KOWALSKI'
  | 'PEGGY_SUE_CONNORS'
  | 'BUZZ_HALVORSEN'
  | 'GIGI_ST_CLAIR'
  | 'WALTER_PRINGLE'
  | 'BETTY_LOU_HARPER'
  | 'MILES_ELLINGTON'
  | 'SYLVIE_BEAUMONT'
  | 'MARGO_STERLING'
  | 'HANK_MCCOY'
  | 'LANA_STARLING'
  | 'VINCE_CASTELLANO'
  | 'ARTHUR_PENDLETON'
  | 'NORMA_JEAN_BAKER'
  | 'STERLING_VANCE'
  | 'CLARA_VON_BERG'
  | 'VICTOR_LAZAR';

export const ALL_RIVAL_IDS_V7: readonly RivalIdV7[] = [
  'DOTTY_VANCE',
  'CARMEN_DELGADO',
  'CHET_KOWALSKI',
  'PEGGY_SUE_CONNORS',
  'TOBY_OKAFOR',
  'INEZ_CALLAHAN',
  'BUZZ_HALVORSEN',
  'GIGI_ST_CLAIR',
  'WALTER_PRINGLE',
  'BETTY_LOU_HARPER',
  'MILES_ELLINGTON',
  'SYLVIE_BEAUMONT',
  'MARGO_STERLING',
  'HANK_MCCOY',
  'ALASTAIR_KERR',
  'LANA_STARLING',
  'VINCE_CASTELLANO',
  'REX_CALLOWAY',
  'ARTHUR_PENDLETON',
  'NORMA_JEAN_BAKER',
  'STERLING_VANCE',
  'SEO_YUN_KANG',
  'CLARA_VON_BERG',
  'VICTOR_LAZAR',
];

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
  readonly playstyle?: CpuPlaystyleIdV7;
  readonly temperament?: CpuTemperamentIdV7;
  readonly seasonTier?: 1 | 2 | 3 | 4;
  readonly eraFashionTag?: string;
  readonly bio?: string;
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

export type QuestionTimerModeV8 = 'OFF' | 90 | 45 | 30 | 15;

export const QUESTION_TIMER_MODES_V8: readonly QuestionTimerModeV8[] = [
  'OFF',
  90,
  45,
  30,
  15,
] as const;

export interface BroadcastSettingsV7 {
  masterVolume: number; // 0..100
  musicVolume: number; // 0..100
  sfxVolume: number; // 0..100
  crowdVolume: number; // 0..100
  ambienceVolume: number; // 0..100
  voiceVolume?: number; // 0..100 (default 88 — Studio Announcer, Grant Bellamy & Gremlin VO)
  questionTimerMode?: QuestionTimerModeV8; // 'OFF' (No Timer) | 90 | 45 | 30 (default) | 15
  autoPlayShowIntro?: boolean; // Plays 10s 1966 Network TV Show Intro before broadcasts (default true)
  muteFirstTimeTips?: boolean; // Allows muting 1st-occurrence contextual explainer cards (default false)
  muteAutoQuestionTips?: boolean; // Alias for muting 1st-occurrence contextual explainer cards (default false)
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  highContrastBadges: boolean;
  difficultyMode?: DifficultyModeV7;
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

export type CareerMedalIdV7 =
  | 'SHUTOUT_STREAK'
  | 'SAFE_CRACKER'
  | 'WHEEL_HIGH_ROLLER'
  | 'GREMLIN_DODGER'
  | 'CLUTCH_TURN10_WINNER'
  | 'SCOUTING_DETECTIVE'
  | 'NO_LIFELINE_PURIST'
  | 'RETURNING_CHAMP_CROWN';

export type AwardRarityTierV7 =
  | 'BRONZE MEDAL'
  | 'SILVER MEDAL'
  | 'GOLD TROPHY'
  | 'PLATINUM CROWN';

export interface CareerMedalSpecV7 {
  readonly id: CareerMedalIdV7;
  readonly name: string;
  readonly tier: AwardRarityTierV7;
  readonly icon: string;
  readonly summary: string;
  readonly bonusCash: number;
}

export const CAREER_MEDAL_SPECS_V7: Record<CareerMedalIdV7, CareerMedalSpecV7> = {
  SHUTOUT_STREAK: {
    id: 'SHUTOUT_STREAK',
    name: 'Hot-Streak Five',
    tier: 'GOLD TROPHY',
    icon: '🔥',
    summary: 'Rattle off 5+ correct clues in a row during a single broadcast.',
    bonusCash: 100,
  },
  SAFE_CRACKER: {
    id: 'SAFE_CRACKER',
    name: 'Gold Vault Safe-Cracker',
    tier: 'SILVER MEDAL',
    icon: '🔐',
    summary: 'Crack open and win a $500 Locked Gold Vault or Brass-Key Safe.',
    bonusCash: 100,
  },
  WHEEL_HIGH_ROLLER: {
    id: 'WHEEL_HIGH_ROLLER',
    name: 'Big Wheel High-Roller',
    tier: 'GOLD TROPHY',
    icon: '🎡',
    summary: 'Spin $500+ or 2× Double Dollars on the 20-wedge Studio Big Wheel.',
    bonusCash: 100,
  },
  GREMLIN_DODGER: {
    id: 'GREMLIN_DODGER',
    name: 'Signal-Jam Dodger',
    tier: 'SILVER MEDAL',
    icon: '⚡',
    summary: 'Bank Light-Board cash or pass live spins without hitting a Zonk.',
    bonusCash: 100,
  },
  CLUTCH_TURN10_WINNER: {
    id: 'CLUTCH_TURN10_WINNER',
    name: 'Turn-10 Showstopper',
    tier: 'PLATINUM CROWN',
    icon: '🚨',
    summary: 'Nail the final Turn-10 Match-Point clue to clinch a tight broadcast.',
    bonusCash: 125,
  },
  SCOUTING_DETECTIVE: {
    id: 'SCOUTING_DETECTIVE',
    name: 'Backstage Scout Ribbon',
    tier: 'BRONZE MEDAL',
    icon: '📓',
    summary: 'Log a brand-new Champion Weak Spot or Strong Turf in your Notebook.',
    bonusCash: 75,
  },
  NO_LIFELINE_PURIST: {
    id: 'NO_LIFELINE_PURIST',
    name: 'Unassisted Studio Purist',
    tier: 'GOLD TROPHY',
    icon: '🎯',
    summary: 'Win a broadcast with both 50/50 Cut and Audience Poll untouched.',
    bonusCash: 125,
  },
  RETURNING_CHAMP_CROWN: {
    id: 'RETURNING_CHAMP_CROWN',
    name: 'Defending Champion Crown',
    tier: 'PLATINUM CROWN',
    icon: '👑',
    summary: 'Defend your title with a 2+ Returning-Champion win streak.',
    bonusCash: 100,
  },
};

export type BroadcastActNumberV7 = 1 | 2 | 3;

export interface NextEpisodeCliffhangerTeaserV7 {
  readonly episodeCode: string;
  readonly title: string;
  readonly rivalId: RivalIdV7;
  readonly stageCallsign: string;
  readonly hookCopy: string;
  readonly stakesTag: string;
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
  rivalTrust: Partial<Record<RivalIdV7, number>>; // -3 .. +3 (drives Toby Mercy Switches, Golden Exits & VIP Jury!)
  brokerFavor: Record<BrokerIdV7, number>; // Drives Hour-11 Booth Coup & 5 Stage-10 Endings
  boothArrestsCount: number;
  canaryAcceptedCount: number;
  canaryBurnedCount: number;
  episodesWon: number;
  episodesPlayed: number;
  unlockedEndings: string[];
  recentEntityKeys: string[]; // 25-match cross-toy entity cooldown ring
  scoutingNotebook?: Record<
    string,
    {
      revealedStrong: CategoryIdV7[];
      revealedWeak: CategoryIdV7[];
      traitRevealed?: boolean;
    }
  >;
  returningChampStreak?: number;
  recentBoardCombos?: string[];
  careerMedalCounts?: Partial<Record<CareerMedalIdV7, number>>;
  masteredBoardModes?: BoardPlayModeV7[];
  masteredBoardModesV9?: BoardPlayModeV9[];
  masteredDifficulties?: DifficultyModeV7[];
  masteredModeDifficulties?: string[];
  /** R6 Return Champion-vs-Champion rematch state (backwards-compatible with WS_V7_GOLD_1) */
  pendingRematchEpisode?: number | null;
  consecutiveLossesByEpisode?: Record<number, number>;
  settings: BroadcastSettingsV7;
}

// ============================================================================
// 8. v8.0 "SWEEPS WEEK DELUXE" CANONICAL SHARED CONTRACTS
// ============================================================================

/** Upgrade #1 — Dual Studio Cast + Raspy Gremlin Pre-Baked Offline Voice Bank */
export type VoiceSpeakerIdV8 =
  | 'BOOTH_ANNOUNCER'
  | 'GRANT_BELLAMY'
  | 'STUDIO_GREMLIN';

export type VoicePriorityTierV8 = 1 | 2 | 3; // 3 = Bumper/Twist/Jackpot/Ceremony, 2 = Host Call, 1 = Quip

export type StudioVoiceCueIdV8 =
  // Show Open & 3-Act Bumpers (Booth Announcer)
  | 'VO_COLD_OPEN_WELCOME'
  | 'VO_SHOW_CURTAIN_RAISER'
  | 'VO_ACT2_DOUBLE_STAKES'
  | 'VO_ACT3_FINAL_WAGER_INTRO'
  | 'VO_DAILY_BROADCAST_OPEN'
  | 'VO_COUCH_2P_OPEN'
  // Signature TV Board Twists & Side-Games (Booth Announcer)
  | 'VO_TWIST_SECRET_SQUARE'
  | 'VO_TWIST_GOLD_VAULT_OPEN'
  | 'VO_TWIST_BIG_WHEEL_SPIN'
  | 'VO_TWIST_BIG_WHEEL_JACKPOT'
  | 'VO_TWIST_BIG_WHEEL_DOUBLE'
  | 'VO_TWIST_LIGHT_BOARD_OPEN'
  | 'VO_TWIST_LIGHT_BOARD_PASS'
  | 'VO_TWIST_MYSTERY_CURTAIN'
  | 'VO_TWIST_OPPONENT_CHOICE'
  | 'VO_TWIST_PRIZE_MATCH_STEAL'
  | 'VO_BOOTH_TELL_ALERT'
  | 'VO_BOOTH_FEED_INTERCEPTED'
  // Curtain Call Instant Bargain Desk (Grant Bellamy & Booth)
  | 'VO_BARGAIN_ROLLOUT'
  | 'VO_BARGAIN_SOLD'
  | 'VO_BARGAIN_NO_SALE'
  // Post-Answer Comedy, Myth Klaxon, Streaks & Rebound Pot (Grant Bellamy & Booth)
  | 'VO_MYTH_KLAXON_1'
  | 'VO_MYTH_KLAXON_2'
  | 'VO_QUICK_DRAW_1'
  | 'VO_QUICK_DRAW_2'
  | 'VO_DIAL_BULLSEYE'
  | 'VO_DIAL_NEAR_MISS'
  | 'VO_SHUTTER_EARLY_JACKPOT'
  | 'VO_REBOUND_POT_SCOOP'
  | 'VO_STREAK_3_HOT'
  | 'VO_STREAK_5_UNSTOPPABLE'
  | 'VO_HOST_RIGHT_1'
  | 'VO_HOST_RIGHT_2'
  | 'VO_HOST_RIGHT_3'
  | 'VO_HOST_RIGHT_4'
  | 'VO_HOST_WRONG_1'
  | 'VO_HOST_WRONG_2'
  | 'VO_HOST_WRONG_3'
  | 'VO_HOST_WRONG_4'
  // Final Broadcast Wager & Ceremonies (Grant Bellamy & Booth)
  | 'VO_FINAL_WAGER_LOCKED'
  | 'VO_FINAL_REVEAL_SHOWDOWN'
  | 'VO_CEREMONY_NEW_CHAMPION'
  | 'VO_CEREMONY_RETURNING_STREAK'
  | 'VO_CEREMONY_CLOSE_LOSS'
  | 'VO_CEREMONY_CO_CHAMPION'
  | 'VO_CEREMONY_DAILY_WIN'
  | 'VO_CEREMONY_COUCH_WINNER'
  // 8 Hanna-Barbera / UPA Slapstick Studio Gremlin Voice Gags
  | 'VO_GREMLIN_REEL_MOWER'
  | 'VO_GREMLIN_CANISTER_VAC'
  | 'VO_GREMLIN_JACKHAMMER'
  | 'VO_GREMLIN_TNT_PLUNGER'
  | 'VO_GREMLIN_CABLE_SHEARS'
  | 'VO_GREMLIN_WATUSI_BROOM'
  | 'VO_GREMLIN_CATWALK_MAGNET'
  | 'VO_GREMLIN_TIN_UFO'
  // --- v8.1 Expanded Variety Multi-Take Pack (+65 Non-Repeating Studio Takes = 120 Total!) ---
  // TV Show 10s Intro & 1966 End Credits Sign-Offs (Booth Announcer & Grant Bellamy)
  | 'VO_TV_INTRO_1'
  | 'VO_TV_INTRO_2'
  | 'VO_TV_INTRO_3'
  | 'VO_TV_INTRO_4'
  | 'VO_COLD_OPEN_ALT_1'
  | 'VO_COLD_OPEN_ALT_2'
  | 'VO_COLD_OPEN_ALT_3'
  | 'VO_CREDITS_SIGNOFF_1'
  | 'VO_CREDITS_SIGNOFF_2'
  | 'VO_CREDITS_SIGNOFF_3'
  | 'VO_CREDITS_SIGNOFF_4'
  // Expanded Host Correct Answer Praise (Grant Bellamy — 8 Fresh Takes -> 12 Total!)
  | 'VO_HOST_RIGHT_5'
  | 'VO_HOST_RIGHT_6'
  | 'VO_HOST_RIGHT_7'
  | 'VO_HOST_RIGHT_8'
  | 'VO_HOST_RIGHT_9'
  | 'VO_HOST_RIGHT_10'
  | 'VO_HOST_RIGHT_11'
  | 'VO_HOST_RIGHT_12'
  // Expanded Host Miss / Encouragement Wit (Grant Bellamy — 6 Fresh Takes -> 10 Total!)
  | 'VO_HOST_WRONG_5'
  | 'VO_HOST_WRONG_6'
  | 'VO_HOST_WRONG_7'
  | 'VO_HOST_WRONG_8'
  | 'VO_HOST_WRONG_9'
  | 'VO_HOST_WRONG_10'
  // Studio Cheat / Lifeline Calls (Grant Bellamy & Booth — 50/50, Audience Poll, Free Swap)
  | 'VO_LIFELINE_5050_1'
  | 'VO_LIFELINE_5050_2'
  | 'VO_LIFELINE_5050_3'
  | 'VO_LIFELINE_POLL_1'
  | 'VO_LIFELINE_POLL_2'
  | 'VO_LIFELINE_POLL_3'
  | 'VO_LIFELINE_SWAP_1'
  | 'VO_LIFELINE_SWAP_2'
  | 'VO_LIFELINE_SWAP_3'
  // Expanded Streaks, Comebacks & Rival Reactions (Grant Bellamy & Booth)
  | 'VO_STREAK_HOT_ALT_1'
  | 'VO_STREAK_HOT_ALT_2'
  | 'VO_STREAK_HOT_ALT_3'
  | 'VO_COMEBACK_SURGE_1'
  | 'VO_COMEBACK_SURGE_2'
  | 'VO_RIVAL_STUMBLED_1'
  | 'VO_RIVAL_STUMBLED_2'
  | 'VO_RIVAL_STUMBLED_3'
  | 'VO_BOOTH_BUSTED_ALT_1'
  | 'VO_BOOTH_BUSTED_ALT_2'
  // Expanded Board Twists, Showcases, Bargain, Klaxon & Couch Pass-Turn
  | 'VO_SECRET_SQUARE_ALT_1'
  | 'VO_SECRET_SQUARE_ALT_2'
  | 'VO_GOLD_VAULT_ALT_1'
  | 'VO_GOLD_VAULT_ALT_2'
  | 'VO_BIG_WHEEL_ALT_1'
  | 'VO_BIG_WHEEL_ALT_2'
  | 'VO_MYSTERY_CURTAIN_ALT_1'
  | 'VO_MYSTERY_CURTAIN_ALT_2'
  | 'VO_SHOWCASE_SPOTLIGHT_1'
  | 'VO_SHOWCASE_SPOTLIGHT_2'
  | 'VO_SHOWCASE_SPOTLIGHT_3'
  | 'VO_BARGAIN_ROLLOUT_ALT_1'
  | 'VO_BARGAIN_SOLD_ALT_1'
  | 'VO_MYTH_KLAXON_3'
  | 'VO_REBOUND_SCOOP_ALT_1'
  | 'VO_COUCH_PASS_TURN_1'
  | 'VO_COUCH_PASS_TURN_2'
  // Extra Studio Gremlin Taunts (Studio Gremlin)
  | 'VO_GREMLIN_TAUNT_1'
  | 'VO_GREMLIN_TAUNT_2'
  | 'VO_GREMLIN_TAUNT_3'
  | 'VO_GREMLIN_TAUNT_4';

export type StudioVoicePoolIdV8 =
  | 'POOL_TV_INTRO'
  | 'POOL_COLD_OPEN'
  | 'POOL_ACT2_BUMPER'
  | 'POOL_ACT3_WAGER'
  | 'POOL_HOST_RIGHT'
  | 'POOL_HOST_WRONG'
  | 'POOL_QUICK_DRAW'
  | 'POOL_STREAK_HOT'
  | 'POOL_COMEBACK'
  | 'POOL_LIFELINE_5050'
  | 'POOL_LIFELINE_POLL'
  | 'POOL_LIFELINE_SWAP'
  | 'POOL_SECRET_SQUARE'
  | 'POOL_GOLD_VAULT'
  | 'POOL_BIG_WHEEL'
  | 'POOL_LIGHT_BOARD'
  | 'POOL_MYSTERY_CURTAIN'
  | 'POOL_SHOWCASE_INTRO'
  | 'POOL_BARGAIN_OPEN'
  | 'POOL_BARGAIN_SOLD'
  | 'POOL_BARGAIN_NOSALE'
  | 'POOL_MYTH_KLAXON'
  | 'POOL_REBOUND_SCOOP'
  | 'POOL_RIVAL_STUMBLED'
  | 'POOL_BOOTH_BUSTED'
  | 'POOL_COUCH_PASS'
  | 'POOL_CREDITS_SIGNOFF'
  | 'POOL_GREMLIN_GLEE';

export interface StudioVoiceCueSpecV8 {
  readonly cueId: StudioVoiceCueIdV8;
  readonly speaker: VoiceSpeakerIdV8;
  readonly priority: VoicePriorityTierV8;
  readonly mp3Path: string; // ./assets/v7/audio/vo/<file>.mp3
  readonly subtitle: string;
  readonly durationSecEst: number;
}

/** Upgrade #2 — Retro 1966 TV Picture-in-Picture Character Reaction Window */
export interface ReactionPipSpecV8 {
  readonly castId: CastIdV7;
  readonly displayName?: string;
  readonly emotion: PortraitEmotionV7;
  readonly badgeLabel: string; // e.g. 'LIVE BOOTH TELL!', 'BUSTED!', 'CLUTCH SURGE', 'PODIUM 2'
  readonly quipText: string;
  readonly accentHex?: string;
  readonly durationMs?: number;
}

/** Upgrade #5 — 8 Hanna-Barbera / UPA 1966 Animated Studio Gremlin Skits */
export type GremlinSkitIdV8 =
  | 'REEL_MOWER'
  | 'CANISTER_VAC'
  | 'JACKHAMMER_SANDBAG'
  | 'TNT_PLUNGER'
  | 'CABLE_SHEARS'
  | 'WATUSI_BROOM'
  | 'CATWALK_MAGNET'
  | 'TIN_UFO';

export const ALL_GREMLIN_SKIT_IDS_V8: readonly GremlinSkitIdV8[] = [
  'REEL_MOWER',
  'CANISTER_VAC',
  'JACKHAMMER_SANDBAG',
  'TNT_PLUNGER',
  'CABLE_SHEARS',
  'WATUSI_BROOM',
  'CATWALK_MAGNET',
  'TIN_UFO',
];

export interface GremlinSkitPlayInputV8 {
  readonly skitId?: GremlinSkitIdV8;
  readonly seed?: number;
  readonly victimName: string;
  readonly isPlayerVictim: boolean;
  readonly scoreBefore: number;
  readonly cashLost: number;
  readonly newGremlinCount: number; // 1..4 spring-loaded pop-up markers!
  readonly reducedMotion?: boolean;
  readonly onPlayFoghorn?: () => void;
  readonly onPlayBoing?: () => void;
  readonly onPlayVoiceSting?: (skitId: GremlinSkitIdV8) => void;
}

/** Upgrade #6 — Mid-Show "Sale of the Century" Curtain Call Instant Bargain */
export type InstantBargainKindV8 =
  | 'GOLD_PROP'
  | 'NEXT_TILE_2X'
  | 'FINAL_WAGER_SHIELD';

export interface InstantBargainItemV8 {
  readonly kind: InstantBargainKindV8;
  readonly title: string;
  readonly subtitle: string;
  readonly costLiveCash: number; // $250..$450 deducted from live match score!
  readonly badgeTag: string;
  readonly relicId?: string;
}

export interface InstantBargainChoiceResultV8 {
  readonly accepted: boolean;
  readonly chosenItem: InstantBargainItemV8 | null;
}

/** Upgrade #7 & #8 — Post-Answer Wit, Myth Klaxon, Rebound Pot & 4-Shutter Ladder */
export type PostAnswerFlavorKindV8 =
  | 'MYTH_KLAXON'
  | 'QUICK_DRAW'
  | 'DIAL_BULLSEYE'
  | 'DIAL_NEAR_MISS'
  | 'REBOUND_SCOOP'
  | 'SHUTTER_EARLY_SOLVE'
  | 'STANDARD';

export const SHUTTER_REEL_MULTIPLIER_LADDER_V8 = [2.0, 1.6, 1.3, 1.0] as const;

/** Upgrade #9 — 2-Player Couch / Tablet Pass-and-Play Showdown */
export interface CouchPlayerConfigV8 {
  readonly podiumIndex: 0 | 1;
  readonly name: string;
  readonly avatarId: CastIdV7;
  readonly accentHex: string;
}

export interface CouchShowdownLaunchSpecV8 {
  readonly podium1: CouchPlayerConfigV8;
  readonly podium2: CouchPlayerConfigV8;
  readonly totalTurns: 6 | 10;
  readonly stageId: StageWorldIdV7;
  readonly boardPlayMode: BoardPlayModeV7;
  readonly questionTimerMode?: QuestionTimerModeV8;
}

export interface CouchSecretFinalWagerResultV8 {
  readonly p1Wager: number;
  readonly p2Wager: number;
  readonly p1ChoiceIdx: 0 | 1 | 2 | 3;
  readonly p2ChoiceIdx: 0 | 1 | 2 | 3;
  readonly p1TimeSec: number;
  readonly p2TimeSec: number;
}

/** Upgrade #10 — Deluxe Daily 1966 Broadcast Tape Archive & Retro TV Share PNG */
export interface DailyPercentileRankV8 {
  readonly percentile: number; // e.g. 98 -> Top 2%
  readonly topPercentLabel: string; // e.g. "TOP 2%"
  readonly rankTitle: string; // e.g. "NETWORK SOVEREIGN", "EXECUTIVE PRODUCER"
  readonly badgeColorHex: string;
  readonly studioNote: string;
}

export interface DailyArchiveEntryV8 {
  readonly dailyNumber: number;
  readonly dateIso: string;
  readonly displayDateShort: string;
  readonly rivalId: RivalIdV7;
  readonly stageId: StageWorldIdV7;
  readonly boardPlayMode: BoardPlayModeV7;
  readonly isToday: boolean;
  readonly officialTodayCash?: number;
  readonly officialTodayWon?: boolean;
  readonly archiveReplayCash?: number;
  readonly archiveReplayWon?: boolean;
}

/** Upgrade #11 — Historical Career Analytics & Category Drill-Down Ledger */
export interface CategoryStatCounterV8 {
  attempts: number;
  correct: number;
  totalResponseMs: number;
  cashEarned: number;
  currentStreak: number;
  bestStreak: number;
}

export interface ToyFormatStatCounterV8 {
  attempts: number;
  correct: number;
  totalResponseMs: number;
  cashEarned: number;
}

export interface BoardModeStatCounterV8 {
  played: number;
  won: number;
  bestCash: number;
  totalCash: number;
}

export interface MatchHistoryPointV8 {
  readonly tsIso: string;
  readonly matchType:
    | 'CAMPAIGN'
    | 'DAILY'
    | 'QUICK_PLAY'
    | 'COUCH_2P'
    | 'BLITZ_60'
    | 'SWEEPS_WEEK';
  readonly label: string; // e.g. 'S01E03', 'DAILY #144', 'QUICK', 'BLITZ', 'SWEEPS N3'
  readonly boardPlayMode: BoardPlayModeV9;
  readonly rivalName: string;
  readonly playerCash: number;
  readonly rivalCash: number;
  readonly won: boolean;
  readonly cluesAnswered: number;
  readonly cluesCorrect: number;
  readonly bestMatchStreak: number;
}

export interface LifelineStatCounterV8 {
  fiftyFiftyUsed: number;
  fiftyFiftyWins: number;
  audiencePollUsed: number;
  audiencePollWins: number;
  freeSwapUsed: number;
  freeSwapWins: number;
}

export interface CareerStatsLedgerV8 {
  readonly version: 'WS_CAREER_STATS_V8_1';
  seededFromLegacySave: boolean;
  totalMatchesPlayed: number;
  totalMatchesWon: number;
  totalCluesAnswered: number;
  totalCluesCorrect: number;
  totalResponseMs: number;
  lifetimeCashEarned: number;
  highestSingleMatchCash: number;
  currentAnswerStreak: number;
  bestAnswerStreakEver: number;
  currentMatchWinStreak: number;
  bestMatchWinStreakEver: number;
  finalWagersAttempted: number;
  finalWagersWon: number;
  vaultsCracked: number;
  bargainsBought: number;
  gremlinsSurvived: number;
  byCategory: Partial<Record<CategoryIdV7, CategoryStatCounterV8>>;
  byToy: Partial<Record<ToyIdV7, ToyFormatStatCounterV8>>;
  byCardStyle: Partial<Record<QuestionCardStyleV7, ToyFormatStatCounterV8>>;
  byBoardMode: Partial<Record<BoardPlayModeV9, BoardModeStatCounterV8>>;
  lifelines: LifelineStatCounterV8;
  recentMatches: MatchHistoryPointV8[]; // Rolling last 40 episodes for interactive trend graphs!
}

/** Upgrade #12 — 10-Second 1966 Network TV Show Intro & 1960s End Credits */
export interface ShowBroadcastIntroOptsV8 {
  readonly modeLabel: string; // e.g. 'PRIME-TIME CAMPAIGN · S01E01', 'DAILY 1966 BROADCAST #144', '2-PLAYER COUCH SHOWDOWN'
  readonly episodeSubtitle: string; // e.g. 'IBC STUDIO 6A · NEW YORK'
  readonly boardFormatLabel: string;
  readonly rivalName: string;
  readonly rivalTitle: string;
  readonly rivalCastId: CastIdV7;
  readonly challengerName?: string;
  readonly challengerCastId?: CastIdV7;
  readonly durationMs?: number; // default 10000ms (exact 10.0s TV intro!)
  readonly reducedMotion?: boolean;
  readonly onPlayIntroFanfare?: () => void;
  readonly onPlayIntroVoice?: () => void;
  readonly onStopIntroAudio?: () => void;
}

export interface ShowEndCreditsOptsV8 {
  readonly didWin: boolean;
  readonly modeLabel: string;
  readonly playerName: string;
  readonly playerCash: number;
  readonly rivalName: string;
  readonly rivalCash: number;
  readonly rivalCastId: CastIdV7;
  readonly bestStreakInMatch: number;
  readonly accuracyPct: number;
  readonly durationMs?: number; // default 9500ms
  readonly reducedMotion?: boolean;
  readonly onPlayCreditsTheme?: () => void;
  readonly onPlaySignoffVoice?: () => void;
}


// ============================================================================
// 9. v9.0 PRODUCTION RELEASE CANONICAL CONTRACTS (R1-R10 & 96-Item Expansion)
// ============================================================================

export type SeasonIdV7 = 1 | 2 | 3 | 4;

/** R7 Anti-Repetition Board Types (4 Required + 4 Original = 8 New Modes) */
export type BoardPlayModeR7V9 =
  | 'LOUVER_SHUTTER' // R7: Can't see category (dollars visible)
  | 'BLIND_PURSE' // R7: Can't see money (categories visible)
  | 'BLACKOUT_VAULT' // R7: Can't see either (flip #1..#12 safe trilon)
  | 'LIVE_WIRE_FUSE' // R7: All locked but one (orthogonal unlock + emergency circuit breaker)
  | 'SHIFTING_SPOTLIGHT' // R7 Original #1: Gliding 1.5x / 2x spotlight
  | 'GOLDEN_DOMINO_CASCADE' // R7 Original #2: 3 contiguous player claims -> +$350 cascade
  | 'PRESSURE_COOKER' // R7 Original #3: Shared gauge x1.0..x2.0, miss blasts steam -> x1.0
  | 'HOLLYWOOD_MARQUEE_LINE'; // R7 Original #4: O/X bulbs, 3-in-a-row -> +$300 line bonus

export type BoardPlayModeV9 = BoardPlayModeV7 | BoardPlayModeR7V9;

export const ALL_BOARD_PLAY_MODES_R7_V9: readonly BoardPlayModeR7V9[] = [
  'LOUVER_SHUTTER',
  'BLIND_PURSE',
  'BLACKOUT_VAULT',
  'LIVE_WIRE_FUSE',
  'SHIFTING_SPOTLIGHT',
  'GOLDEN_DOMINO_CASCADE',
  'PRESSURE_COOKER',
  'HOLLYWOOD_MARQUEE_LINE',
] as const;

export const ALL_BOARD_PLAY_MODES_V9: readonly BoardPlayModeV9[] = [
  ...ALL_BOARD_PLAY_MODES_V7,
  ...ALL_BOARD_PLAY_MODES_R7_V9,
] as const;

export const BOARD_PLAY_MODE_TITLES_V9: Record<BoardPlayModeV9, string> = {
  ...BOARD_PLAY_MODE_TITLES_V7,
  LOUVER_SHUTTER: 'LOUVER SHUTTER · MYSTERY TOPICS',
  BLIND_PURSE: 'BLIND PURSE · MYSTERY DOLLARS',
  BLACKOUT_VAULT: 'BLACKOUT VAULT · TOTAL MYSTERY',
  LIVE_WIRE_FUSE: 'LIVE-WIRE FUSE · CHAIN UNLOCK',
  SHIFTING_SPOTLIGHT: 'SHIFTING SPOTLIGHT · 1.5×/2× RAIL',
  GOLDEN_DOMINO_CASCADE: 'GOLDEN DOMINO · 3-LINK CASCADE',
  PRESSURE_COOKER: 'THE PRESSURE COOKER · RISING GAUGE',
  HOLLYWOOD_MARQUEE_LINE: 'HOLLYWOOD MARQUEE · 3-IN-A-ROW',
};

export type ClassicTvTileTwistV9 = ClassicTvTileTwistV7 | 'VIP_BLUFF';

/** R8 Bigger Reactive Studio Signs & Live 1960s Studio Audience */
export type ReactiveSignIdV9 = 'ON_THE_AIR' | 'APPLAUSE' | 'LAUGH' | 'JACKPOT';

export type CrowdMoodV9 =
  | 'IDLE'
  | 'APPLAUSE'
  | 'LAUGH'
  | 'GASP'
  | 'OVATION'
  | 'SYMPATHY';

/** R4 Recurring 1966 VIP Celebrities */
export type VipCelebIdV9 =
  | 'vip_kitty_fontaine'
  | 'vip_barnaby_quail'
  | 'vip_frankie_lombardo'
  | 'vip_astrid_lindqvist'
  | 'vip_action_jackson'
  | 'vip_bea_delacroix'
  | 'vip_zoltan';

export interface VipCelebritySpecV9 {
  readonly targetId: VipCelebIdV9;
  readonly name: string;
  readonly title: string;
  readonly strengthBadge: string; // e.g. "PRO: SCREEN · TELL: YACHTS & EX-HUSBANDS"
  readonly strongCategories: readonly CategoryIdV7[];
  readonly weakCategories: readonly CategoryIdV7[];
  readonly baseBluffRate: number; // 0.25 .. 0.60
  readonly tellHint: string;
  readonly honestQuips: readonly string[]; // <= 14 words, <= 115 chars
  readonly bluffQuips: readonly string[]; // <= 14 words, <= 115 chars
}

export type VipCelebSpecV9 = VipCelebritySpecV9;

export interface VipBluffScenarioV9 {
  readonly vip: VipCelebritySpecV9;
  readonly category: CategoryIdV7;
  readonly clueStem?: string;
  readonly suggestedChoiceIdx: 0 | 1 | 2 | 3;
  readonly suggestedChoiceLabel: string;
  readonly isBluffing: boolean;
  readonly bluffProbabilityUsed: number;
  readonly quip: string;
  readonly tileValue: number;
  readonly trustHonestDelta: number; // +1.0x
  readonly trustBluffDelta: number; // -0.5x
  readonly callHonestDelta: number; // -0.5x
  readonly callBluffDelta: number; // +1.5x
}

/** R1 Prize Catalog, Zonks, Winner's Den & Fair Cosmetics (96-Item Expandable) */
export type GrandPrizeIdV9 = string;
export type ZonkIdV9 = string;
export type DenRoomSlotV9 =
  | 'CREDENZA'
  | 'ALCOVE'
  | 'GARAGE_TERRACE'
  | 'TRAVEL_WALL';

export interface PrizeItemV9 {
  readonly targetId: GrandPrizeIdV9;
  readonly name: string;
  readonly tier: 1 | 2 | 3 | 4;
  readonly priceSC: number;
  readonly copy: string;
  readonly chapterUnlock: number; // 1..10 (maps Episodes 1..90 in 9-episode waves)
  readonly seasonAffinity: SeasonIdV7;
  readonly roomSlot: DenRoomSlotV9;
}

export type GrandPrizeSpecV9 = PrizeItemV9;

export interface ZonkItemV9 {
  readonly targetId: ZonkIdV9;
  readonly name: string;
  readonly copy: string;
  readonly chapterUnlock?: number;
  readonly seasonAffinity?: SeasonIdV7;
  readonly roomSlot?: DenRoomSlotV9;
}

export type ZonkSpecV9 = ZonkItemV9;

export type CosmeticSlotV9 = 'PODIUM_TRIM' | 'BUZZER_CHIME' | 'TRILON_STYLE';

export interface CosmeticItemV9 {
  readonly cosmeticId: string;
  readonly slot: CosmeticSlotV9;
  readonly name: string;
  readonly priceSC: number;
  readonly subtitle: string;
  readonly accentHex: string;
  readonly trimStyleKey: string;
}

export type CosmeticItemSpecV9 = CosmeticItemV9;

export interface StudioCosmeticsEquippedV9 {
  readonly PODIUM_TRIM: string;
  readonly BUZZER_CHIME: string;
  readonly TRILON_STYLE: string;
}

export type EquippedCosmeticsV9 = StudioCosmeticsEquippedV9;

export type DenTierIdV9 =
  | 'WAITING_ROOM'
  | 'MOD_STARTER_PAD'
  | 'SPLIT_LEVEL_SHOWCASE'
  | 'NETWORK_PENTHOUSE';

export interface DenTierSpecV9 {
  readonly tierId: DenTierIdV9;
  readonly title: string;
  readonly subtitle: string;
  readonly minOwnedPrizes: number;
  readonly badgeHex: string;
}

export interface ShowroomStateV9 {
  readonly version: 'WS_V9_SHOWROOM_1';
  showroomCash: number;
  plinkoTokens: number;
  freeCurtainTickets: number;
  consecutiveZonks: number;
  ownedPrizeIds: string[];
  ownedZonkIds: string[];
  ownedCosmeticIds: string[];
  equipped: StudioCosmeticsEquippedV9;
  recentOfferedIds: string[]; // Last 12 offered IDs in Featured Shelf / Curtain Gamble
  pinnedDenIds: string[]; // Curated Winner's Den showcase display pins
  totalCurtainPulls: number;
  totalPlinkoDrops: number;
  lastUpdatedIso: string;
}

export type ShowroomLedgerV9 = ShowroomStateV9;

export type CurtainDoorKindV9 = 'ZONK' | 'MID_SHOWCASE' | 'GRAND_SHOWCASE';

export interface CurtainDoorOutcomeV9 {
  readonly bayNumber: 1 | 2 | 3;
  readonly kind: CurtainDoorKindV9;
  readonly targetId: string | null; // Prize or Zonk targetId (null if maxed-tier cash envelope)
  readonly title: string;
  readonly subtitle: string;
  readonly cashAwardedSC: number;
  readonly plinkoTokenAwarded: boolean;
  readonly isDuplicateCashEnvelope: boolean;
}

export interface CurtainGambleResultV9 {
  readonly ok: boolean;
  readonly reason?: string;
  readonly usedFreeTicket: boolean;
  readonly pityShieldTriggered: boolean;
  readonly chosenBay: 1 | 2 | 3;
  readonly chosenOutcome: CurtainDoorOutcomeV9 | null;
  readonly allBays: readonly CurtainDoorOutcomeV9[];
  readonly ledger: ShowroomStateV9;
}

/** R3 Custom Broadcast Booth & 2P Couch Upgrades */
export type VibePackIdV9 =
  | 'PRIMETIME_LIVING_COLOR'
  | 'AFTER_HOURS_LOUNGE'
  | 'SPACE_RACE_TOMORROWLAND'
  | 'SATURDAY_BAR_BET_CHAMPS'
  | 'BURBANK_COMEDY_WALL'
  | 'SWEEPS_SHARK_TANK';

export interface VibePackSpecV9 {
  readonly packId: VibePackIdV9;
  readonly title: string;
  readonly tagline: string;
  readonly accentHex: string;
  readonly categories: readonly CategoryIdV7[];
  readonly preferredDifficulties?: readonly DifficultyTierV7[];
}

export type CouchSkillDialV9 = 'EASY' | 'MIXED' | 'SHARK';
export type SkillDialV9 = CouchSkillDialV9;

export interface BroadcastBoothConfigV9 {
  readonly vibePackId: VibePackIdV9;
  readonly vetoedCategories: readonly CategoryIdV7[];
}

export interface CouchPodiumV9Config extends CouchPlayerConfigV8 {
  readonly skillDial: CouchSkillDialV9;
  readonly hotMicAvailable: boolean;
}

/** R5 Sweeps Week 5-Night Gauntlet & Starburst Plinko */
export type SponsorIdV9 =
  | 'orbit_tang'
  | 'hold_fast_hairspray'
  | 'toast_o_matic_5000'
  | 'shag_a_delia_rugs'
  | 'sonic_7_transistor'
  | 'jello_castle_kit'
  | 'jet_wax_glaze'
  | 'velvet_tone_needle';

export interface SponsorPlaqueSpecV9 {
  readonly sponsorId: SponsorIdV9;
  readonly name: string;
  readonly tagline: string;
  readonly effectSummary: string;
  readonly badgeHex: string;
  readonly accentHex: string;
}

export type SweepsNightNumberV9 = 1 | 2 | 3 | 4 | 5;

export interface SweepsWeekStateV9 {
  readonly version: 'WS_V9_SWEEPS_1';
  activeRun: boolean;
  currentNight: SweepsNightNumberV9; // 1..5
  safeDepositCash: number; // Locked 50% bank
  atRiskVaultCash: number; // At-risk 50% escalators
  revengeJackpotPool: number; // Seeded $1,000, cap $10,000
  draftedSponsors: SponsorIdV9[]; // Up to 3 Sponsor Plaque slots
  nextNightBonusMult: number; // e.g. +0.50x from Plinko center slot
  freeFiftyFiftyArmed: boolean; // From Plinko bucket #2
  pendingLossRematchNight: SweepsNightNumberV9 | null;
  pendingPlinkoFreeDrop: boolean;
  pendingSponsorDraft: boolean;
  lastNightPurse: number;
  nightsWonTotal: number;
  sweepsCrownsWon: number;
  lastUpdatedIso: string;
}

export type PlinkoModeV9 = 'SWEEPS_FREE_DROP' | 'SHOWROOM_TOKEN_OR_CASH';
export type PlinkoLaneIndexV9 = 0 | 1 | 2 | 3 | 4;

export interface PlinkoOutcomeV9 {
  readonly mode: PlinkoModeV9;
  readonly launchLane: PlinkoLaneIndexV9;
  readonly bucketIndex: PlinkoLaneIndexV9;
  readonly bucketLabel: string;
  readonly cashWonSC: number;
  readonly sweepsBonusKind?: 'VAULT_CASH' | 'FREE_5050' | 'NEXT_NIGHT_MULT';
  readonly sweepsVaultDelta: number;
  readonly trajectory: readonly { readonly x: number; readonly y: number; readonly t: number }[];
  readonly pegHits: readonly {
    readonly x: number;
    readonly y: number;
    readonly t: number;
    readonly noteIdx: number;
  }[];
  readonly stallKicksCount: number;
}

/** R8 Per-Season 3D Set & Main Board Visual Specs */
export interface SeasonVisualSpecV9 {
  readonly season: SeasonIdV7;
  readonly title: string;
  readonly subtitle: string;
  readonly flagshipStageId: StageWorldIdV7;
  readonly cabinetHex: string;
  readonly cabinetHexNum: number;
  readonly bezelTrimHex: string;
  readonly bezelTrimHexNum: number;
  readonly tileFaceHex: string;
  readonly tileAccentHex: string;
  readonly spotlightHex: string;
  readonly marqueeStyleLabel: string;
}

/** R10 Gouache Sprite Atlas Contracts */
export interface AtlasSpriteEntryV9 {
  readonly targetId: string;
  readonly file: string; // e.g. 'atlas_vip.webp'
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly sheetW: number;
  readonly sheetH: number;
}

export interface AtlasManifestV9 {
  readonly version: string;
  readonly sprites: Readonly<Record<string, AtlasSpriteEntryV9>>;
}

/** R6 Return Champion Anti-Wall Mercy Profile */
export interface AntiWallMercyProfileV9 {
  readonly active: boolean;
  readonly consecutiveLosses: number;
  readonly rivalAccuracyPenalty: number; // 0.04 at 2 losses, 0.08 at 3, 0.12 cap at 4+
  readonly underdogBonusRatio: number; // 0.10 when active
}

/** Shared Cross-Milestone Engine, Board & QA Diagnostic Contracts */
export type DiagnosticOpenViewNameV9 =
  | 'hub'
  | 'showroom'
  | 'plinko'
  | 'sweeps'
  | 'blitz'
  | 'couch'
  | 'campaign'
  | 'quick';

export interface StageEngineContract {
  setStageWorld(stageId: StageWorldIdV7, season?: SeasonIdV7): StageWorldSpecV7;
  setReactiveSignState(
    signId: ReactiveSignIdV9,
    active: boolean,
    durationMs?: number,
  ): void;
  setCrowdMood(mood: CrowdMoodV9, durationMs?: number): void;
}

export interface BoardLoadSpec {
  readonly boardId: BoardIdV7;
  readonly twistId?: BoardTwistIdV7;
  readonly rivalId?: RivalIdV7;
  readonly rivalWeakCategories?: readonly CategoryIdV7[];
  readonly rivalStrongCategories?: readonly CategoryIdV7[];
  readonly categoriesOverride?: readonly CategoryIdV7[];
  readonly tableBedHex?: number;
  readonly trimVeneerHex?: string;
  readonly trimAccentHex?: string;
  readonly seedOffset?: number;
  readonly season?: SeasonIdV7;
  readonly trilonStyleId?: string;
  readonly vetoedCategories?: readonly CategoryIdV7[];
  readonly boardPlayMode?: BoardPlayModeV9;
}

export interface WindowWsDiagnosticsV7 {
  getTelemetry: () => Record<string, unknown>;
  previewStageAndBoard: (
    stageId: StageWorldIdV7,
    boardId: BoardIdV7,
    twistId?: BoardTwistIdV7,
  ) => void;
  openContraptionPreview: (tileIndex: number, toyId: ToyIdV7) => void;
  recordMasterAudioSamples: (
    durationMs?: number,
  ) => Promise<{ sampleRate: number; samples: number[] }>;
  // v9 QA & Perceptual Inspection Hooks
  getShowroomState?: () => ShowroomStateV9;
  getSweepsState?: () => SweepsWeekStateV9;
  getActiveBoardMode?: () => BoardPlayModeV9;
  getSeasonId?: () => SeasonIdV7;
  getStudioSignStates?: () => Partial<Record<ReactiveSignIdV9, boolean>>;
  getCrowdMood?: () => CrowdMoodV9;
  openView?: (viewName: DiagnosticOpenViewNameV9) => void;
}
