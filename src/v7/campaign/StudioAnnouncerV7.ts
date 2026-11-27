// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING — 1966 "IN LIVING COLOR" ULTRA-HD
// `src/v7/campaign/StudioAnnouncerV7.ts`
// 1966 Don Pardo / Art Fleming / Peter Marshall Live Studio Host & Announcer
// Reactive Banter Engine + Diagonal Lower-Third Broadcast Chyron Controller.
//
// Design & Engineering Guarantees:
//  - ZERO Rectangular SaaS Toast Boxes: Sculpted -11° Saul Bass / NBC Living
//    Color diagonal optical chyron blade (`clip-path` parallelogram + sweeping
//    3px Living Color spectrum rule + RCA 44-BX ribbon mic medallion).
//  - 100% Non-Blocking (`pointer-events: none` across root and all children),
//    auto-fades cleanly without covering 3D Tote Board tiles or A/B/C/D pads.
//  - 180+ Non-Repeating Human-Authored 1966 Studio Lines across all mandatory
//    triggers + 6 distinct 1960s Board Modes (Fisher-Yates no-repeat bags).
//  - Unified 1964–1969 NBC/CBS Living Color palette (#0B1D30, #F7EEDB, #0096A6,
//    #F4A91F, #FF6738, #1E56C5, #E63B7A) & Jost / Michroma / Plus Jakarta Sans.
// ============================================================================

import type {
  BrokerIdV7,
  CastIdV7,
  CategoryIdV7,
  ClassicTvTileTwistV7,
  EpisodeBlueprintV7,
  PostAnswerFlavorKindV8,
  RivalIdV7,
  StageWorldIdV7,
} from '../contracts_v7';
import {
  CAST_PROFILES_V7,
  CAST_TV_GUIDE_BIOS_V7,
  CHAMPION_VOICE_KITS_V7,
  type ChampionVoiceKitV7,
} from './CastAndRelicsCatalogV7';
import { computeDailyEpisodeNumberV7 } from './DailyBroadcastV7';

// ----------------------------------------------------------------------------
// 1. Public Types, Event Triggers & Context Contracts
// ----------------------------------------------------------------------------

export type AnnouncerPersonaIdV7 =
  | 'DON_PARDO_BOOTH' // Booming Studio 6A / Johnny Olson / Don Pardo announcer
  | 'ART_FLEMING_HOST' // Warm, crisp, encyclopedic 1964 Jeopardy! emcee energy
  | 'PETER_MARSHALL_WIT' // Breezy 1966 Hollywood Squares dry wink & velvet charm
  | 'GRANT_BELLAMY_MC'; // In-world Sovereign Master of Ceremonies

export type AnnouncerBoardModeIdV7 =
  | 'CLASSIC_TOTE'
  | 'TIC_TAC_LINE'
  | 'COAST_HEX_BRIDGE'
  | 'EYE_GUESS_MEMORY'
  | 'CONCENTRATION_PRIZE_MATCH'
  | 'MONTY_CURTAIN_DEAL';

export type AnnouncerEventIdV7 =
  | 'EPISODE_KICKOFF'
  | 'HOT_STREAK_2X'
  | 'HOT_STREAK_3X'
  | 'HOT_STREAK_5X'
  | 'SECRET_SQUARE_DISCOVERY'
  | 'LOCKED_VAULT_CRACK'
  | 'RIVAL_MISS_REBOUND'
  | 'COMEBACK_LEAD_CHANGE'
  | 'FINAL_2_TURN_NAILBITER'
  | 'EPISODE_VICTORY'
  | 'MYSTERY_CURTAIN_REVEAL'
  | 'OPPONENT_CHOICE_CHALLENGE'
  | 'INSTANT_BARGAIN_TEMPTATION'
  | 'BOOTH_RIGGING_BUSTED'
  | 'CLASSIC_TOTE_ROW_SWEEP'
  | 'TIC_TAC_LINE_JACKPOT'
  | 'COAST_BRIDGE_CONNECTED'
  | 'EYE_GUESS_FLASH_OPEN'
  | 'CONCENTRATION_PRIZE_MATCH'
  | 'BIG_WHEEL_SPIN_START'
  | 'BIG_WHEEL_JACKPOT'
  | 'GREMLIN_ZONK_BLOWUP'
  | 'GREMLIN_PASS_SPINS'
  | 'SCOUTING_DISCOVERY'
  | 'RIVAL_TURN_CALL'
  | 'BRASS_KEY_UNLOCK'
  | 'BLIND_MYSTERY_REVEAL'
  | 'MYTH_KLAXON_TRAP'
  | 'WRONG_PICK_WIT'
  | 'DIAL_NEAR_MISS_PRAISE'
  | 'QUICK_DRAW_STAMP'
  | 'REBOUND_POT_SCOOP';

export type ChampionReactionKindV7 =
  | 'SMIRK'
  | 'FUMBLE'
  | 'CLUTCH'
  | 'ZONK'
  | 'WHEEL'
  | 'SCOUT_STRONG'
  | 'SCOUT_WEAK';

export interface ChampionTvGuideCloseUpV7 {
  readonly tvGuideListing: string;
  readonly dossierHintStrong: string;
  readonly dossierHintWeak: string;
  readonly greenRoomDossier: string;
}

export type EmceeMoodV7 = 'POISED' | 'WINK' | 'GASP' | 'INTENSE';

export const EMCEE_MEDALLION_ASSET_V7 = './assets/v7/portraits/grant_bellamy.jpg';

export const EMCEE_SPRITE_POSITIONS_V7: Record<EmceeMoodV7, string> = {
  POISED: '0% 0%',
  WINK: '100% 0%',
  GASP: '0% 100%',
  INTENSE: '100% 100%',
};

export type ChyronToneV7 =
  | 'PEACOCK' // Peacock Teal #0096A6 — Kickoff, 2x Streak, General Studio
  | 'GOLD' // Harvest Marquee Gold #F4A91F — Secret Square, Vault Crack, Victory
  | 'TANGERINE' // Atomic Tangerine #FF6738 — 3x/5x Heater, Nailbiter, Bargain
  | 'EMERALD' // Emerald Tote Lamp #18A957 — +$50 Rebound, Comeback Lead, Bust
  | 'CERISE' // Mod Pop Cerise #E63B7A — Mystery Curtain, Opponent's Choice
  | 'COBALT'; // CBS Royal Cobalt #1E56C5 — Prime-Time Authority

export type AnnouncerPhaseHintV7 =
  | 'HUB'
  | 'BOARD_SELECT'
  | 'QUESTION_OPEN'
  | 'POST_ANSWER_THEATER'
  | 'RIVAL_TURN'
  | 'CANARY_BREAK'
  | 'CEREMONY';

export interface StudioAnnouncerLineSpecV7 {
  readonly id: string;
  readonly event: AnnouncerEventIdV7;
  readonly persona: AnnouncerPersonaIdV7;
  readonly kickerTag: string;
  readonly template: string;
  readonly tone: ChyronToneV7;
  readonly stageFilter?: StageWorldIdV7;
}

export interface AnnouncerContextV7 {
  readonly blueprint?: EpisodeBlueprintV7;
  readonly rivalId?: RivalIdV7;
  readonly rivalName?: string;
  readonly stageId?: StageWorldIdV7;
  readonly category?: CategoryIdV7;
  readonly playerCash?: number;
  readonly rivalCash?: number;
  readonly cashDelta?: number;
  readonly reboundBonus?: number; // defaults to 50 for RIVAL_MISS_REBOUND
  readonly streak?: number;
  readonly turnNumber?: number;
  readonly totalTurns?: number;
  readonly isDailyBroadcast?: boolean;
  readonly dailyEpisodeNumber?: number;
  readonly vaultTriggerReason?: 'ADJACENT_WIN' | 'STREAK_UNLOCK';
  readonly customBadgeOverride?: string;
  readonly dwellMsOverride?: number;
  readonly forceImmediate?: boolean;
  readonly outcomeLabel?: string;
  readonly spinsCount?: number;
  readonly moodOverride?: EmceeMoodV7;
  readonly victim?: 'PLAYER' | 'RIVAL';
  readonly scoutKind?: 'WEAK' | 'STRONG';
}

export interface AnnouncerMatchSnapshotV7 {
  readonly turnNumber: number;
  readonly totalTurns?: number;
  readonly playerCash: number;
  readonly rivalCash: number;
  readonly streak: number;
  readonly rivalId?: RivalIdV7;
  readonly stageId?: StageWorldIdV7;
  readonly lastCategory?: CategoryIdV7;
  readonly isDailyBroadcast?: boolean;
}

export interface AnnouncerCueEmittedV7 {
  readonly lineId: string;
  readonly event: AnnouncerEventIdV7;
  readonly persona: AnnouncerPersonaIdV7;
  readonly speakerLabel: string;
  readonly kickerTag: string;
  readonly renderedText: string;
  readonly tone: ChyronToneV7;
  readonly mood: EmceeMoodV7;
  readonly dwellMs: number;
}

export interface StudioAnnouncerOptionsV7 {
  readonly reducedMotion?: boolean;
  readonly highContrast?: boolean;
  readonly defaultDwellMs?: number;
  readonly minGapBetweenLowPriorityMs?: number;
  readonly seed?: number;
  readonly onCueShown?: (cue: AnnouncerCueEmittedV7) => void;
}

// ----------------------------------------------------------------------------
// 2. Friendly Spoken 1966 Cast (All 24 Champions + 3 Brokers), Categories & Stages
// ----------------------------------------------------------------------------

const SPOKEN_CAST_NAMES_V7: Record<CastIdV7, string> = {
  // Season 1 (Easy)
  DOTTY_VANCE: 'Dotty Vance',
  CARMEN_DELGADO: 'Carmen Delgado',
  CHET_KOWALSKI: 'Chet Kowalski',
  PEGGY_SUE_CONNORS: 'Peggy Sue Connors',
  TOBY_OKAFOR: 'Toby Okafor',
  INEZ_CALLAHAN: 'Inez Callahan',
  // Season 2 (Standard)
  BUZZ_HALVORSEN: 'Buzz Halvorsen',
  GIGI_ST_CLAIR: 'Gigi St. Clair',
  WALTER_PRINGLE: 'Walter Pringle',
  BETTY_LOU_HARPER: 'Betty Lou Harper',
  MILES_ELLINGTON: 'Miles Ellington',
  SYLVIE_BEAUMONT: 'Sylvie Beaumont',
  // Season 3 (Hard)
  MARGO_STERLING: 'Margo Sterling',
  HANK_MCCOY: 'Hank McCoy',
  ALASTAIR_KERR: 'Alastair Kerr',
  LANA_STARLING: 'Lana Starling',
  VINCE_CASTELLANO: 'Vince Castellano',
  REX_CALLOWAY: 'Rex Calloway',
  // Season 4 (Mastermind)
  ARTHUR_PENDLETON: 'Arthur Pendleton',
  NORMA_JEAN_BAKER: 'Norma Jean Baker',
  STERLING_VANCE: 'Sterling Vance',
  SEO_YUN_KANG: 'Seo-Yun Kang',
  CLARA_VON_BERG: 'Clara von Berg',
  VICTOR_LAZAR: 'Victor Lazar',
  // 3 Booth Brokers
  GRANT_BELLAMY: 'Grant Bellamy',
  ROZ_KORMAN: 'Roz Korman',
  VERA_KARP: 'Vera Karp',
};

/** 24 Champion-specific 1966 showbiz color quips for Episode Kickoffs & Rival Turn calls. */
export const CHAMPION_ANNOUNCER_QUIPS_V7: Record<RivalIdV7, readonly [string, string]> = {
  DOTTY_VANCE: [
    'Dotty Vance brought her Topeka blue-ribbon apron and a smile bright enough to blow a fuse on Camera One!',
    'Watch Dotty pat that bouffant—she plays the Mystery Curtains like she’s hunting a kitchen mixer!',
  ],
  CARMEN_DELGADO: [
    'Bellevue’s own Head Triage Clinician Carmen Delgado stepped straight off midnight rounds—steady hands and zero booth tricks!',
    'Watch Carmen twist that blue triage pen in her crisp white clinical coat—her poise keeps every dollar tight!',
  ],
  CHET_KOWALSKI: [
    'Milwaukee’s 300-game kegler Chet Kowalski just dusted his bowling thumb and eyed the top-row $500 plaque!',
    'Chet Kowalski swings for the fences on big money squares—snatch his favorite lane and watch him steam!',
  ],
  PEGGY_SUE_CONNORS: [
    'Pan Am’s Peggy Sue Connors touched down from Rome at dawn—white gloves spotless and ready to spin the Big Wheel!',
    'Fasten your seatbelts in Studio 6A—Peggy Sue plays every wild twist like a first-class upgrade!',
  ],
  TOBY_OKAFOR: [
    'Con Ed lineman Toby Okafor can hear a hum under Podium Two from the lobby—good luck sneaking a line past him!',
    'Toby Okafor plays square and blocks tight—outsmart the lineman on Books or Words!',
  ],
  INEZ_CALLAHAN: [
    'Shhh! Fifth Avenue Head Librarian Inez Callahan brought her cat-eye glasses and forty years of reference steel!',
    'Inez Callahan never hurries and never blinks—better steer the Tote Board away from the bookshelves!',
  ],
  BUZZ_HALVORSEN: [
    'Cape Canaveral’s Buzz Halvorsen holstered his slide rule and locked onto countdown precision!',
    'All systems nominal for Buzz Halvorsen—drag him out of orbit into Art or Hit Parade if you want breathing room!',
  ],
  GIGI_ST_CLAIR: [
    'Swinging London hits 30 Rock! Carnaby Street buyer Gigi St. Clair is eyeing every Wheel and Curtain on the board!',
    'Groovy alert—Gigi St. Clair’s geometric bob is razor-sharp, and watch Row C for her mod entourage!',
  ],
  WALTER_PRINGLE: [
    'Hartford’s Sunday crossword terror Walter Pringle adjusted his polka-dot bow tie—every pick is a defensive trap!',
    'Walter Pringle reads the Tote Board like 1-Across—block his lanes before he boxes you in!',
  ],
  BETTY_LOU_HARPER: [
    'Nashville’s beehive queen Betty Lou Harper saves her loudest chorus for Turns 8 through 10—watch your back!',
    'Sequins sparkling under 300 footcandles—Betty Lou Harper loves stealing the spotlight down the stretch!',
  ],
  MILES_ELLINGTON: [
    'Cool as midnight at the Village Vanguard—jazz critic Miles Ellington is snapping an off-beat block across the rack!',
    'Behind those dark tortoise shades, Miles Ellington never rattles—you’ll have to out-swing him on pure trivia!',
  ],
  SYLVIE_BEAUMONT: [
    'Montreal gourmet columnist Sylvie Beaumont brought her Jackie-O pillbox hat and a three-star appetite for $500 plaques!',
    'Careful—Sylvie Beaumont’s soufflé deflates fast when you swipe her big-money square!',
  ],
  MARGO_STERLING: [
    'Madison Avenue’s Margo Sterling runs this Tote Board like an agency pitch—surgical blocks and ice-cold timing!',
    'Emerald suit, French chignon, and zero mercy—watch Spotlight #4 whenever Margo smiles!',
  ],
  HANK_MCCOY: [
    'Hold onto your ten-gallon hats—Houston wildcatter Hank McCoy drills straight for $500 gushers and Blind plaques!',
    'Hank McCoy bets big and boils hot—send him into a Signal-Jam Zonk and watch that Stetson fly!',
  ],
  ALASTAIR_KERR: [
    'Nine weeks undefeated in Savile Row wool—Alastair Kerr thinks Studio 6A’s trophy already has his initials!',
    'Keep one eye on Spotlight #4 when Alastair adjusts his cufflinks—bust that feed and watch him wilt!',
  ],
  LANA_STARLING: [
    'Burbank’s platinum-flip sitcom starlet Lana Starling demands Camera Two’s key light—and every wild Wheel on the rack!',
    'Watch Row C when Lana bats those Hollywood lashes—someone in the front rows is feeding her lines!',
  ],
  VINCE_CASTELLANO: [
    'Vegas Sands pit boss Vince Castellano counts six decks without blinking—and he’s lethal in Turns 8 to 10!',
    'Sharkskin suit and flashing gold pinky ring—Vince Castellano loves closing out nailbiters at the wire!',
  ],
  REX_CALLOWAY: [
    'Press-box legend Rex Calloway flashes that million-dollar grin for Camera Three—watch Row C Seat 14 for cues!',
    'Rex Calloway turns every Turn 9 into a ninth-inning rally—keep your lead padded against the columnist!',
  ],
  ARTHUR_PENDLETON: [
    'Oxford Regius Don Arthur Pendleton wears crushed claret velvet and plays pure, unrigged trivia like a chess master!',
    'No booth gimmicks for Professor Pendleton—just formidable classical scholarship at eight o’clock!',
  ],
  NORMA_JEAN_BAKER: [
    'Jet-set chess prodigy Norma Jean Baker sees six moves ahead behind those oversized white mod shades!',
    'Houndstooth coat and ruthless positional blocks—Norma Jean Baker turns the Tote Board into a Zurich endgame!',
  ],
  STERLING_VANCE: [
    'Wall Street tape-reader Sterling Vance treats every $600 Blind square like a hostile takeover before the closing bell!',
    'Chalk-stripe three-piece and pocket watch ticking—Sterling Vance never blinks when the stakes double!',
  ],
  SEO_YUN_KANG: [
    'Geneva biochemist Seo-Yun Kang calculates every board permutation before the brass fanfare finishes!',
    'Watch Seo-Yun’s fingertips near the lectern trim—catch a LIVE TELL before she sweeps the science row!',
  ],
  CLARA_VON_BERG: [
    'Vienna opera conductor Clara von Berg commands Studio 6A with one sharp flick of her wooden baton!',
    'Interrupt Clara von Berg’s tempo and watch the fiery maestro lose her cool in front of fifty million homes!',
  ],
  VICTOR_LAZAR: [
    'Eleven undefeated Fridays! The Nehru-jacketed Sphinx Victor Lazar has never yielded the Studio 6A throne!',
    'Ice in his veins and an onyx pin gleaming—defeating Victor Lazar in Living Color takes a masterclass!',
  ],
};

const SPOKEN_CATEGORY_NAMES_V7: Record<CategoryIdV7, string> = {
  MEDICINE: 'Body & Medicine',
  CHEMISTRY: 'Chemistry',
  PHYSICS: 'Science & Space',
  GADGETS: 'Inventions',
  ENGINES: 'Planes & Autos',
  LITERATURE: 'Books & Authors',
  LEXICON: 'Words & Wit',
  'FINE ARTS': 'Art & Stage',
  SCREEN: 'Silver Screen',
  JUKEBOX: 'Hit Parade',
  FINANCE: 'Money & Markets',
  PRICING: 'Price Tag',
  ODDS: 'Luck & Numbers',
  ATLAS: 'World Atlas',
  SPORTS: 'Wide World of Sports',
  DYNASTIES: 'Empires & Kings',
  HEADLINES: 'Front Page',
  FOLKLORE: 'Myths & Legends',
  FALLACIES: 'Brain Twisters',
  CUISINE: 'Food & Flavor',
};

const SPOKEN_STAGE_NAMES_V7: Record<StageWorldIdV7, string> = {
  STAGE_01_IBC_DAYTIME_FUNK: 'Studio 6A Daytime',
  STAGE_02_IBC_PRIMETIME_JUBILEE: 'Jubilee Color Theater',
  STAGE_03_1926_VAUDEVILLE_PIT: 'Burbank Pop-Art Carnival',
  STAGE_04_1958_ISOLATION_VAULT: 'Teak & Teal Isolation Booth',
  STAGE_05_1984_LARSON_CRT_LAB: 'Apollo Color Control Pavilion',
  STAGE_06_ATLANTIC_CITY_PIER: 'Atlantic City Steel Pier',
  STAGE_07_1969_MONTE_CARLO_CASINO: 'Monte Carlo Royale',
  STAGE_08_WORLDS_FAIR_GEODESIC: 'World’s Fair Pavilion',
  STAGE_09_CHANNEL_83_UHF_BARGE: 'Channel 83 Offshore Ship',
  STAGE_10_SOVEREIGN_SANCTUM: 'Executive Penthouse Studio',
};

export const PERSONA_DISPLAY_LABELS_V7: Record<
  AnnouncerPersonaIdV7,
  { readonly speaker: string; readonly glyphKind: 'MIC' | 'STAR' | 'CROWN' | 'BOLT' }
> = {
  DON_PARDO_BOOTH: { speaker: 'BOOTH 6A · ANNOUNCER', glyphKind: 'MIC' },
  ART_FLEMING_HOST: { speaker: 'STAGE DESK · EMCEE', glyphKind: 'STAR' },
  PETER_MARSHALL_WIT: { speaker: 'CENTER SQUARE · HOST', glyphKind: 'STAR' },
  GRANT_BELLAMY_MC: { speaker: 'GRANT BELLAMY · HOST', glyphKind: 'CROWN' },
};

const EVENT_PRIORITY_V7: Record<AnnouncerEventIdV7, number> = {
  EPISODE_VICTORY: 100,
  BIG_WHEEL_JACKPOT: 97,
  GREMLIN_ZONK_BLOWUP: 96,
  COAST_BRIDGE_CONNECTED: 95,
  TIC_TAC_LINE_JACKPOT: 94,
  CONCENTRATION_PRIZE_MATCH: 93,
  SECRET_SQUARE_DISCOVERY: 92,
  CLASSIC_TOTE_ROW_SWEEP: 91,
  LOCKED_VAULT_CRACK: 90,
  BRASS_KEY_UNLOCK: 89,
  BOOTH_RIGGING_BUSTED: 88,
  GREMLIN_PASS_SPINS: 87,
  HOT_STREAK_5X: 86,
  COMEBACK_LEAD_CHANGE: 84,
  BIG_WHEEL_SPIN_START: 83,
  MYSTERY_CURTAIN_REVEAL: 82,
  EYE_GUESS_FLASH_OPEN: 81,
  INSTANT_BARGAIN_TEMPTATION: 80,
  SCOUTING_DISCOVERY: 79,
  EPISODE_KICKOFF: 78,
  BLIND_MYSTERY_REVEAL: 77,
  FINAL_2_TURN_NAILBITER: 76,
  RIVAL_MISS_REBOUND: 74,
  HOT_STREAK_3X: 70,
  RIVAL_TURN_CALL: 68,
  OPPONENT_CHOICE_CHALLENGE: 66,
  HOT_STREAK_2X: 60,
  MYTH_KLAXON_TRAP: 88,
  REBOUND_POT_SCOOP: 86,
  DIAL_NEAR_MISS_PRAISE: 82,
  QUICK_DRAW_STAMP: 81,
  WRONG_PICK_WIT: 75,
};

const EVENT_EMCEE_MOOD_V7: Record<AnnouncerEventIdV7, EmceeMoodV7> = {
  EPISODE_KICKOFF: 'POISED',
  HOT_STREAK_2X: 'POISED',
  HOT_STREAK_3X: 'POISED',
  HOT_STREAK_5X: 'POISED',
  SECRET_SQUARE_DISCOVERY: 'POISED',
  LOCKED_VAULT_CRACK: 'POISED',
  BRASS_KEY_UNLOCK: 'POISED',
  EPISODE_VICTORY: 'POISED',
  CLASSIC_TOTE_ROW_SWEEP: 'POISED',
  TIC_TAC_LINE_JACKPOT: 'POISED',
  COAST_BRIDGE_CONNECTED: 'POISED',
  CONCENTRATION_PRIZE_MATCH: 'POISED',
  BIG_WHEEL_JACKPOT: 'POISED',
  SCOUTING_DISCOVERY: 'POISED',
  REBOUND_POT_SCOOP: 'POISED',
  RIVAL_MISS_REBOUND: 'WINK',
  MYSTERY_CURTAIN_REVEAL: 'WINK',
  OPPONENT_CHOICE_CHALLENGE: 'WINK',
  INSTANT_BARGAIN_TEMPTATION: 'WINK',
  EYE_GUESS_FLASH_OPEN: 'WINK',
  BIG_WHEEL_SPIN_START: 'WINK',
  BLIND_MYSTERY_REVEAL: 'WINK',
  RIVAL_TURN_CALL: 'WINK',
  WRONG_PICK_WIT: 'WINK',
  DIAL_NEAR_MISS_PRAISE: 'WINK',
  GREMLIN_ZONK_BLOWUP: 'GASP',
  BOOTH_RIGGING_BUSTED: 'GASP',
  MYTH_KLAXON_TRAP: 'GASP',
  FINAL_2_TURN_NAILBITER: 'INTENSE',
  COMEBACK_LEAD_CHANGE: 'INTENSE',
  GREMLIN_PASS_SPINS: 'INTENSE',
  QUICK_DRAW_STAMP: 'INTENSE',
};

// ----------------------------------------------------------------------------
// 3. 270+ Non-Repeating, Zero-AI-Slop 1966 Network Studio Banter Lines
//    Voice Lineage: Don Pardo · Johnny Olson · Art Fleming · Peter Marshall
// ----------------------------------------------------------------------------

function buildLineBank(
  event: AnnouncerEventIdV7,
  defaultTone: ChyronToneV7,
  entries: ReadonlyArray<
    readonly [
      persona: AnnouncerPersonaIdV7,
      kickerTag: string,
      template: string,
      toneOverride?: ChyronToneV7,
      stageFilter?: StageWorldIdV7,
    ]
  >,
  idSuffix = '',
): readonly StudioAnnouncerLineSpecV7[] {
  const prefix = idSuffix ? `${event.toLowerCase()}_${idSuffix}` : event.toLowerCase();
  return entries.map(([persona, kickerTag, template, toneOverride, stageFilter], idx) => ({
    id: `${prefix}_${String(idx + 1).padStart(2, '0')}`,
    event,
    persona,
    kickerTag,
    template,
    tone: toneOverride ?? defaultTone,
    ...(stageFilter ? { stageFilter } : {}),
  }));
}

export const STUDIO_ANNOUNCER_LINES_V7: readonly StudioAnnouncerLineSpecV7[] = [
  // ======================== 1. EPISODE KICKOFF (20) =========================
  ...buildLineBank('EPISODE_KICKOFF', 'PEACOCK', [
    ['DON_PARDO_BOOTH', 'LIVE · IN LIVING COLOR', 'From {stage} in Living Color—fifty million viewers are tuned in coast to coast!'],
    ['DON_PARDO_BOOTH', 'ON THE AIR · STUDIO 6A', 'The Peacock lamps are hot, the Tote Board is armed, and {rival} awaits your opening pick!'],
    ['ART_FLEMING_HOST', 'TEN TURNS TO GLORY', 'Welcome to the stage! Ten brisk turns on the Giant Tote Board—pick a square and draw first blood.'],
    ['GRANT_BELLAMY_MC', 'CHAMPIONSHIP CHALLENGER', 'Good evening, America. {rival} holds the champion’s lectern—let’s see if our challenger blinks.'],
    ['PETER_MARSHALL_WIT', 'CURTAIN UP · LIVE TV', 'Adjust your color tint knobs at home, folks—tonight’s Tote Board is dressed to pay!'],
    ['DON_PARDO_BOOTH', 'COAST-TO-COAST HOOKUP', 'Live over the IBC Color Network from New York to Burbank—{episode} is officially on the air!'],
    ['ART_FLEMING_HOST', 'BOARD IS YOURS', 'All dollar plaques are lit and a $500 Gold Vault is sealed on the rack. Where do we start?'],
    ['PETER_MARSHALL_WIT', 'PRIME-TIME CHALLENGER', '{rival} spent twenty minutes polishing that trophy backstage. Care to smudge it on Turn 1?'],
    ['DON_PARDO_BOOTH', '300 FOOTCANDLES LIVE', 'Cameras One, Two, and Three have you in Living Color—tap any illuminated Trilon to open the show!'],
    ['GRANT_BELLAMY_MC', 'THE STAKES ARE LIVE', 'Ten turns, real showband brass, and one Secret Square hiding under the Acrylite. Choose wisely.'],
    ['ART_FLEMING_HOST', 'EYES ON THE TOTE', 'Higher rows pay fatter dollars, and adjacent wins pop the Gold Vault. The opening move is yours!'],
    ['PETER_MARSHALL_WIT', 'SPONSOR’S DELIGHT', 'Our sponsor loves a polite tie, and our studio crowd loves an upset. Give the crowd a show!'],
    ['DON_PARDO_BOOTH', 'SOLARI DRUMS ZEROED', 'Both Split-Flap counters read zero at {stage}—let’s hear those brass solenoids clack!'],
    ['GRANT_BELLAMY_MC', 'UNVETTED CONTENDER', 'Control Booth A gave {rival} the morning odds, yet fifty million living rooms love a dark horse.'],
    ['ART_FLEMING_HOST', 'GENEROUS STUDIO CLOCK', 'Thirty calm seconds on the studio clock once a plaque flips—spot your category and strike!'],
    ['PETER_MARSHALL_WIT', 'LIVING ROOM STANDOFF', 'Somewhere in Ohio a family TV dinner is riding on your first category. Make it a tasty one!'],
    ['DON_PARDO_BOOTH', 'MARQUEE BULBS CHASING', 'Two hundred tungsten bulbs framing one electric Tote Board—step right up and call your square!'],
    ['ART_FLEMING_HOST', 'OPENING GAMBIT', 'Watch {rival}’s weak spots on the rack—a smart opening category sets the tempo for all ten turns.'],
    ['GRANT_BELLAMY_MC', 'NETWORK BROADCAST', 'The red tally lamp on Camera Two belongs to you, challenger. Call your first plaque!'],
    ['PETER_MARSHALL_WIT', 'QUIZ SHOW ROYALE', 'No cue cards, no calling Aunt Martha—just you, {rival}, two lifelines, and a wall of glowing Trilons!'],
  ]),

  // ======== 1B. STAGE-BESPOKE KICKOFFS (ALL 10 STAGES — 01 THROUGH 10) ======
  ...buildLineBank(
    'EPISODE_KICKOFF',
    'GOLD',
    [
      // Stage 01 — 30 Rock Studio 6A Living Color Flagship (5 bespoke openers)
      ['DON_PARDO_BOOTH', 'STUDIO 6A · IN LIVING COLOR!', 'Live from 30 Rock Studio 6A! Chasing #11 tungsten bulbs, 300 footcandles, and {rival} at Podium Two!', 'PEACOCK', 'STAGE_01_IBC_DAYTIME_FUNK'],
      ['ART_FLEMING_HOST', 'CLASSIC TOTE · STUDIO 6A', 'Step onto Studio 6A! Sweep any full row for +$250 or crack that padlocked $500 Gold Vault!', 'PEACOCK', 'STAGE_01_IBC_DAYTIME_FUNK'],
      ['PETER_MARSHALL_WIT', 'LIVE FROM SIXTH AVENUE!', 'Wait till you hear our showband horns in Studio 6A—pick an opening square and make {rival} sweat!', 'GOLD', 'STAGE_01_IBC_DAYTIME_FUNK'],
      ['GRANT_BELLAMY_MC', 'EIGHT O’CLOCK FLAGSHIP', 'Good evening from Studio 6A. Ten clean turns stand between you and tonight’s engraved check.', 'GOLD', 'STAGE_01_IBC_DAYTIME_FUNK'],
      ['DON_PARDO_BOOTH', 'PEACOCK LAMPS HOT · 6A!', 'Cameras One through Three are rolling at 30 Rock—tap a glowing Trilon and launch the show!', 'PEACOCK', 'STAGE_01_IBC_DAYTIME_FUNK'],

      // Stage 02 — CBS Television City Primetime Jubilee (Tic-Tac Line Mode)
      ['DON_PARDO_BOOTH', 'PRIMETIME JUBILEE · LIVE!', 'Live beneath the golden starburst rotunda at Jubilee Color Theater—connect 3 in a row for +$600!', 'GOLD', 'STAGE_02_IBC_PRIMETIME_JUBILEE'],
      ['PETER_MARSHALL_WIT', 'TIC-TAC SHOWDOWN · +$600!', 'Welcome to Primetime Jubilee! Link three squares in a line for +$600—and block {rival}’s two-in-a-row!', 'GOLD', 'STAGE_02_IBC_PRIMETIME_JUBILEE'],
      ['ART_FLEMING_HOST', 'HONEYCOMB STARBURST LIVE', 'The Jubilee light-bridges are glowing! Every three-square line pays a +$600 Prime-Time Jackpot!', 'GOLD', 'STAGE_02_IBC_PRIMETIME_JUBILEE'],
      ['GRANT_BELLAMY_MC', 'TELEVISION CITY ROYALE', 'Tuxedo brass in the pit and Cerise chevrons blazing—play the angles and beat {rival} to three in a row!', 'CERISE', 'STAGE_02_IBC_PRIMETIME_JUBILEE'],
      ['DON_PARDO_BOOTH', 'JUBILEE CHASING BULBS!', 'From Television City in Living Color—line up three connected plaques on the Jubilee deck to break the bank!', 'GOLD', 'STAGE_02_IBC_PRIMETIME_JUBILEE'],

      // Stage 03 — 1966 Burbank Pop-Art Carnival (Concentration Prize-Match Mode)
      ['DON_PARDO_BOOTH', 'BURBANK POP-ART · LIVE!', 'Groovy from Burbank Pop-Art Carnival! Spin the Kaleidoscope Trilons and match luxury prize halves for +$500!', 'CERISE', 'STAGE_03_1926_VAUDEVILLE_PIT'],
      ['PETER_MARSHALL_WIT', 'MONDRIAN SHUTTERS OPEN!', 'Flower-power bulbs and Go-Go Hammond organ in Burbank—pair two matching prize plaques for +$500!', 'CERISE', 'STAGE_03_1926_VAUDEVILLE_PIT'],
      ['ART_FLEMING_HOST', 'PRIZE MATCH & TAKE! STEAL', 'Color TVs, convertibles, and TAKE! steals hide under these Pop-Art Trilons—remember every flip!', 'TANGERINE', 'STAGE_03_1926_VAUDEVILLE_PIT'],
      ['GRANT_BELLAMY_MC', 'CARNABY COLOR CARNIVAL', 'Don’t let the bright Mondrian shutters fool you—{rival} is hunting those +$500 prize pairs too!', 'CERISE', 'STAGE_03_1926_VAUDEVILLE_PIT'],
      ['DON_PARDO_BOOTH', 'KALEIDOSCOPE WHEELS SPIN!', 'Three Pop-Art prize wheels whirling in Living Color—tap your first square and hunt a +$500 match!', 'TANGERINE', 'STAGE_03_1926_VAUDEVILLE_PIT'],

      // Stage 04 — 1964 "$64,000" Teak & Teal Glass Isolation Booth (Classic Tote)
      ['DON_PARDO_BOOTH', 'SEALED ISOLATION BOOTH!', 'Silence on the floor! Inside the soundproof Teak & Teal Isolation Booth, it’s pure brainpower vs {rival}!', 'PEACOCK', 'STAGE_04_1958_ISOLATION_VAULT'],
      ['ART_FLEMING_HOST', 'SOUNDPROOF GLASS SEALED', 'No studio applause in the Isolation Booth—just cool air, crossbar relays, and a +$250 Row Sweep bonus!', 'PEACOCK', 'STAGE_04_1958_ISOLATION_VAULT'],
      ['GRANT_BELLAMY_MC', 'HIGH-TENSION BOOTH MATCH', 'Double-pane borosilicate glass sealed tight. Outthink {rival} under pure quartz spotlight pressure.', 'COBALT', 'STAGE_04_1958_ISOLATION_VAULT'],
      ['PETER_MARSHALL_WIT', 'HEAR A PIN DROP · LIVE!', 'It’s so quiet in the Teak Isolation Booth you can hear {rival} sweating—call your opening plaque!', 'PEACOCK', 'STAGE_04_1958_ISOLATION_VAULT'],
      ['DON_PARDO_BOOTH', 'ISOLATION TOTE ARMED!', 'Crossbar relays clicking behind teak and glass—sweep a full Tote row for +$250 or crack the $500 Vault!', 'GOLD', 'STAGE_04_1958_ISOLATION_VAULT'],

      // Stage 06 — 1966 Atlantic City Steel Pier (Monty Curtain Deal Mode)
      ['DON_PARDO_BOOTH', 'ATLANTIC CITY STEEL PIER!', 'Live over the ocean waves from Atlantic City’s Steel Pier—three Mystery Curtains are armed on tonight’s board!', 'TANGERINE', 'STAGE_06_ATLANTIC_CITY_PIER'],
      ['PETER_MARSHALL_WIT', 'BOARDWALK CURTAIN DEAL!', 'Hear that gilded Wurlitzer organ? Three velvet Mystery Curtains are primed to deal cash and steals!', 'CERISE', 'STAGE_06_ATLANTIC_CITY_PIER'],
      ['ART_FLEMING_HOST', 'STEEL PIER BIG BAND LIVE!', 'Salt air, spinning carnival starbursts, and pinball bumpers—hit a Mystery Curtain for a boardwalk windfall!', 'TANGERINE', 'STAGE_06_ATLANTIC_CITY_PIER'],
      ['GRANT_BELLAMY_MC', 'BOARDWALK HIGH ROLLERS', 'The Steel Pier Ferris wheel is turning and {rival} wants first crack at Curtain #1—beat them to it!', 'GOLD', 'STAGE_06_ATLANTIC_CITY_PIER'],
      ['DON_PARDO_BOOTH', 'THREE DOORS ON THE PIER!', 'Big-band brass booming down the Atlantic City boardwalk—step up and make a Steel Pier deal!', 'CERISE', 'STAGE_06_ATLANTIC_CITY_PIER'],

      // Stage 09 — 1967 Channel 83 Offshore Pirate Ship (Eye Guess Memory Mode)
      ['DON_PARDO_BOOTH', 'CHANNEL 83 OFFSHORE LIVE!', 'Broadcasting at 50,000 watts from international waters aboard Channel 83—watch the Trilon memory flash!', 'COBALT', 'STAGE_09_CHANNEL_83_UHF_BARGE'],
      ['ART_FLEMING_HOST', 'PIRATE RADAR LOCKED ON!', 'Klystron tubes glowing on the offshore deck! Memorize the flashing 2× Stars before the shutters snap!', 'PEACOCK', 'STAGE_09_CHANNEL_83_UHF_BARGE'],
      ['PETER_MARSHALL_WIT', 'ANCHORS AWEIGH · CH. 83!', 'Three miles past the coast guard and broadcasting in Living Color—don’t let {rival} pirate your squares!', 'COBALT', 'STAGE_09_CHANNEL_83_UHF_BARGE'],
      ['GRANT_BELLAMY_MC', 'M/V CASSANDRA ON THE AIR', 'Salt spray on the portholes and high voltage on the UHF carrier—spot the hidden stars and strike fast!', 'PEACOCK', 'STAGE_09_CHANNEL_83_UHF_BARGE'],
      ['DON_PARDO_BOOTH', 'OFFSHORE TRANSMITTER HOT!', 'Radar dish spinning above the North Atlantic—outplay {rival} on the Pirate UHF Deck!', 'COBALT', 'STAGE_09_CHANNEL_83_UHF_BARGE'],

      // Stage 05 — 1967 Apollo Master Color Control Pavilion (4 bespoke openers)
      ['DON_PARDO_BOOTH', 'APOLLO COLOR CONTROL LIVE!', 'From the 1967 Apollo Master Color Control Pavilion—telemetry armillary spinning and Tote Board hot!', 'COBALT', 'STAGE_05_1984_LARSON_CRT_LAB'],
      ['ART_FLEMING_HOST', 'GEMINI TELEMETRY ARMED!', 'Vectorscopes humming in Apollo Control—spot the blinking stars before the memory shutters snap!', 'PEACOCK', 'STAGE_05_1984_LARSON_CRT_LAB'],
      ['PETER_MARSHALL_WIT', 'CAPE CANAVERAL CHIC!', 'More switches in here than a Gemini capsule—let’s see if {rival} survives orbital countdown!', 'COBALT', 'STAGE_05_1984_LARSON_CRT_LAB'],
      ['GRANT_BELLAMY_MC', 'MASTER CONTROL PAVILION', 'Precision glass consoles and blazing color bars—call your opening plaque under zero-drift lamps.', 'GOLD', 'STAGE_05_1984_LARSON_CRT_LAB'],

      // Stage 07 — 1969 Monte Carlo Casino Royale (4 bespoke openers)
      ['GRANT_BELLAMY_MC', 'MONTE CARLO ROYALE LIVE!', 'Champagne chandeliers and spinning brass roulette in Monte Carlo—match luxury prize halves for +$500!', 'GOLD', 'STAGE_07_1969_MONTE_CARLO_CASINO'],
      ['DON_PARDO_BOOTH', 'VIA EARLY BIRD SATELLITE!', 'Live from the Riviera high-limit salon—pair matching prize plaques across the gilded deck for +$500!', 'GOLD', 'STAGE_07_1969_MONTE_CARLO_CASINO'],
      ['PETER_MARSHALL_WIT', 'TUXEDOS & PRIZE PAIRS!', 'Watch your franc-to-dollar math in Monte Carlo—{rival} is eyeing those +$500 luxury pairs too!', 'CERISE', 'STAGE_07_1969_MONTE_CARLO_CASINO'],
      ['ART_FLEMING_HOST', 'RIVIERA SHOWROOM DECK!', 'Crystal sconces aglow above the baccarat shoe—sharp recall unlocks +$500 Concentration matches!', 'GOLD', 'STAGE_07_1969_MONTE_CARLO_CASINO'],

      // Stage 08 — 1964/65 Queens World's Fair Unisphere Pavilion (4 bespoke openers)
      ['DON_PARDO_BOOTH', 'WORLD’S FAIR PAVILION!', 'Beneath the orbiting Unisphere rings—link a Coast-to-Coast hex bridge from left to right for +$750!', 'PEACOCK', 'STAGE_08_WORLDS_FAIR_GEODESIC'],
      ['ART_FLEMING_HOST', 'UNISPHERE MERIDIAN LIVE!', 'Connect left edge to right edge across Flushing Meadows’ hex deck for a soaring +$750 Link Bonus!', 'PEACOCK', 'STAGE_08_WORLDS_FAIR_GEODESIC'],
      ['PETER_MARSHALL_WIT', 'PEACE THROUGH TRIVIA!', 'Grab a Belgian waffle later—right now {rival} is trying to block your +$750 Coast-to-Coast bridge!', 'TANGERINE', 'STAGE_08_WORLDS_FAIR_GEODESIC'],
      ['GRANT_BELLAMY_MC', 'FLUSHING MEADOWS SPOTLIGHT', 'Geodesic ribs gleaming against the evening sky—span the full honeycomb and claim +$750!', 'GOLD', 'STAGE_08_WORLDS_FAIR_GEODESIC'],

      // Stage 10 — 36th-Floor Sovereign Penthouse Finale (4 bespoke openers)
      ['GRANT_BELLAMY_MC', 'PENTHOUSE 36 · FINALE!', 'Thirty-six floors above Sixth Avenue—climb the Sovereign Ziggurat and line up three for the crown!', 'GOLD', 'STAGE_10_SOVEREIGN_SANCTUM'],
      ['DON_PARDO_BOOTH', 'EXECUTIVE PENTHOUSE LIVE!', 'High above Midtown Manhattan in Living Color—connect three Ziggurat plaques for +$600 and the title!', 'GOLD', 'STAGE_10_SOVEREIGN_SANCTUM'],
      ['ART_FLEMING_HOST', 'SOVEREIGN ZIGGURAT ARMED!', 'Every former champion is watching from the velvet balcony—stay ice-cool against {rival} at the summit!', 'COBALT', 'STAGE_10_SOVEREIGN_SANCTUM'],
      ['PETER_MARSHALL_WIT', 'TOP OF 30 ROCK · LIVE!', 'Careful leaning over that brass rail—thirty-six floors down is a long way to drop a winning streak!', 'GOLD', 'STAGE_10_SOVEREIGN_SANCTUM'],
    ],
    'stage',
  ),

  // ======================== 2. 2X HOT STREAK (16) ===========================
  ...buildLineBank('HOT_STREAK_2X', 'PEACOCK', [
    ['ART_FLEMING_HOST', '2× STREAK · BACK TO BACK', 'Back-to-back bullseyes! Your multiplier warms up and any padlocked Vault on the rack just popped!'],
    ['DON_PARDO_BOOTH', '2× DOUBLE HIT!', 'Bing-bing! The brass solenoids are drumming a rhythm the whole East Coast can dance to!'],
    ['PETER_MARSHALL_WIT', '2× PAIR OF ACES', '{rival} just pretended to inspect a cuticles-only emergency at the champion’s lectern—keep swinging!'],
    ['GRANT_BELLAMY_MC', '2× MOMENTUM BUILDING', 'A crisp brace of answers, challenger—notice how the trombone section suddenly sat up straighter.'],
    ['ART_FLEMING_HOST', '2× SOLARI ROLLING', 'Another green lamp in your column! Keep that tempo and those upper-row plaques pay double-time.'],
    ['DON_PARDO_BOOTH', '2× TALLY LAMPS GREEN', 'Didn’t even have to flip the APPLAUSE sign—Studio 6A is clapping on its own dime tonight!'],
    ['PETER_MARSHALL_WIT', '2× WARMING UP', 'One more like that and our boom-mic guy owes the trumpet section a steak at Toots Shor’s!'],
    ['ART_FLEMING_HOST', '2× VAULT KEY EARNED', 'Double bullseye—remember, a 2-answer streak automatically springs every $500 Gold Vault padlock!'],
    ['GRANT_BELLAMY_MC', '2× STEADY HAND', 'Twice asked, twice nailed. Control Booth A just sent a pageboy downstairs for your audition file.'],
    ['DON_PARDO_BOOTH', '2× COAST-TO-COAST POP', 'That’s the spark that turns a walk-on challenger into a five-Friday returning champion!'],
    ['PETER_MARSHALL_WIT', '2× SHARP SHOOTING', 'No sweat, no squinting—even the fellow holding the cue cards looks unemployed right now!'],
    ['ART_FLEMING_HOST', '2× BOARD CONTROL', 'You’ve linked a clean pair! Press that warm multiplier onto a top-row plaque next.'],
    ['DON_PARDO_BOOTH', '2× BRASS STINGER', 'Hear that Tijuana horn punch? That’s what a hot streak sounds like over a network coaxial cable!'],
    ['GRANT_BELLAMY_MC', '2× PRIME COMPOSURE', 'Cooler than Walter Cronkite at seven sharp—two wins stacked neatly into your purse.'],
    ['PETER_MARSHALL_WIT', '2× BUZZER CHECK!', 'Hold everything—{rival} just asked the stage manager if your podium was secretly plugged into MIT!'],
    ['ART_FLEMING_HOST', '2× RIGHT ON CUE', 'Two chimes in a row without breaking a stride—your streak bonus is live on the next pick!'],
  ]),

  // ======================== 3. 3X HOT STREAK (16) ===========================
  ...buildLineBank('HOT_STREAK_3X', 'TANGERINE', [
    ['DON_PARDO_BOOTH', '3× HAT TRICK ON AIR!', 'HAT TRICK IN LIVING COLOR! The balcony is stamping its feet and {rival} looks suddenly thirsty!'],
    ['ART_FLEMING_HOST', '3× TRIPLE BELL HEATER', 'A clean triad on the rack! You’re steering tonight’s broadcast like a ten-week Friday veteran!'],
    ['PETER_MARSHALL_WIT', '3× SEND FOR WATER!', 'Somebody bring {rival} a glass of tap water—no ice, don’t shock the gentleman’s nerves!'],
    ['GRANT_BELLAMY_MC', '3× BOOTH SWEATING', 'Unanswered triple! I can hear Roz’s headset mic clicking furiously through my earpiece from Booth A.'],
    ['DON_PARDO_BOOTH', '3× HAMMOND ORGAN SWELL', 'Milton and the showband are cooking with high-test gas—third green tally lamp in a row!'],
    ['ART_FLEMING_HOST', '3× MULTIPLIER SURGE', 'You’ve hit a genuine 3-turn heater! Every dollar plaque on the wall is paying rich dividends now!'],
    ['PETER_MARSHALL_WIT', '3× TIC-TAC-BINGO', 'Over on Hollywood Squares that wins you a dinette set; here it buys pure panic at {rival}’s desk!'],
    ['DON_PARDO_BOOTH', '3× RED-HOT CONTENDER', 'Ding-ding-DING! Three golden chimes echoing across fifty million console color sets!'],
    ['GRANT_BELLAMY_MC', '3× COMMANDING RUN', 'Not half bad for an unvetted walk-on squinting into three hundred footcandles of quartz light.'],
    ['ART_FLEMING_HOST', '3× SHARP AS KODALITH', 'Reading the head writers’ minds tonight—three categories conquered without a single wobble!'],
    ['PETER_MARSHALL_WIT', '3× HEATER ALERT', 'Our network accountant just loosened his necktie and switched from bourbon to Maalox!'],
    ['DON_PARDO_BOOTH', '3× TOTE BOARD TORCHED', 'A live triple-play at {stage}—{playerCash} clattering up the Split-Flap and still climbing!'],
    ['ART_FLEMING_HOST', '3× DIALED RIGHT IN', 'Third clean chime on the bounce! This is the exact beat to raid a $400 or $500 upper plaque.'],
    ['GRANT_BELLAMY_MC', '3× PRIME-TIME PACE', 'Zero hesitation, three times running. {rival}’s morning odds are looking mighty mortal right now.'],
    ['PETER_MARSHALL_WIT', '3× STUDIO ELECTRIC', 'Even the tourists in Row M who only came in for the free air-conditioning are on their feet!'],
    ['DON_PARDO_BOOTH', '3× NONSTOP CHIMES', 'Don’t touch the vertical hold, America—our challenger just rattled off a sizzling three-piece!'],
  ]),

  // ======================== 4. 5X HOT STREAK (16) ===========================
  ...buildLineBank('HOT_STREAK_5X', 'TANGERINE', [
    ['DON_PARDO_BOOTH', '5× HISTORIC RUNAWAY!', 'FIVE FOR FIVE ON LIVE TELEVISION! Studio 6A just lifted three inches off Sixth Avenue!'],
    ['ART_FLEMING_HOST', '5× UNSTOPPABLE STREAK!', 'Not a single blemish across five turns—we haven’t seen a clinic this crisp all broadcast season!'],
    ['PETER_MARSHALL_WIT', '5× CALL THE FIRE MARSHAL!', 'Put the screwdriver down, Booth A—nobody wired this lectern, our challenger actually reads books!'],
    ['GRANT_BELLAMY_MC', '5× SOVEREIGN FORM', 'Half a ten-turn broadcast swept clean! Fifty million living rooms just forgot their TV dinners.'],
    ['DON_PARDO_BOOTH', '5× FIVE-ALARM CHIMES!', 'The Solari split-flap drums are smoking—five solenoid bells without letting the buzzer breathe!'],
    ['ART_FLEMING_HOST', '5× MASTER OF THE RACK', 'Science, history, pop culture, numbers—nothing on the rack can lay a glove on you tonight!'],
    ['PETER_MARSHALL_WIT', '5× BUS SCHEDULE CHECK!', 'Easy now—{rival} is quietly unfolding a Greyhound timetable behind the podium!'],
    ['DON_PARDO_BOOTH', '5× LIVING COLOR LEGEND!', 'A five-turn juggernaut beaming coast to coast! Every #11 tungsten bulb in the rafters is running hot!'],
    ['GRANT_BELLAMY_MC', '5× CONTROL BOOTH PANIC', 'Vera Karp is beaming over her stopwatch while Roz just snapped her No. 2 pencil clean in half!'],
    ['ART_FLEMING_HOST', '5× ENCYCLOPEDIC RUN', 'Pure quiz-show artistry—five consecutive plaques banked at peak streak velocity!'],
    ['PETER_MARSHALL_WIT', '5× SHOWBAND OVERDRIVE', 'Give the brass section an intermission, folks—our trumpet players’ lips are going numb from fanfares!'],
    ['DON_PARDO_BOOTH', '5× GOLD-PLATED HEATER!', 'Unanswered five-bagger! You’re etching your name right into the Studio 6A brass record book!'],
    ['ART_FLEMING_HOST', '5× FLAWLESS STREAK', 'Every tally lamp blazing green—your streak multiplier is humming right against the ceiling!'],
    ['GRANT_BELLAMY_MC', '5× TOUR DE FORCE', 'Even the union cameraman who hasn’t cracked a smile since Eisenhower just tipped his cap!'],
    ['PETER_MARSHALL_WIT', '5× ROYAL FLUSH ON AIR!', 'In Vegas five like that beats a full house; on network TV it buys a brand-new Mustang convertible!'],
    ['DON_PARDO_BOOTH', '5× COAST-TO-COAST ROAR!', 'From Times Square to Sunset & Vine, nobody is getting up to change the channel tonight!'],
  ]),

  // ======================== 5. SECRET SQUARE DISCOVERY (16) =================
  ...buildLineBank('SECRET_SQUARE_DISCOVERY', 'GOLD', [
    ['DON_PARDO_BOOTH', '⭐ 2× SECRET SQUARE!', 'HOLD THE PRESSES! You tapped tonight’s hidden Secret Square—Double Dollars ride on this clue!'],
    ['PETER_MARSHALL_WIT', '⭐ SECRET SQUARE FOUND!', 'Ding-ding-ding! You stepped square onto our 2× Secret Square—even Paul Lynde would applaud that!'],
    ['ART_FLEMING_HOST', '⭐ DAILY DOUBLE STAR!', 'Hear that warbling studio chime? You uncovered the concealed 2× Star—double stakes right now!'],
    ['GRANT_BELLAMY_MC', '⭐ HIDDEN JACKPOT PLAQUE', 'The gold starburst swings around! Twice the cash rides on one clean answer, challenger.'],
    ['DON_PARDO_BOOTH', '⭐ MARQUEE STARBURST!', 'Chase those gold #11 bulbs! Tonight’s Secret Square was tucked right behind {category}!'],
    ['PETER_MARSHALL_WIT', '⭐ DOUBLE-DOLLAR SURPRISE', 'Well hello, gold star! {rival} was quietly praying you’d walk past {category}—2× payout live!'],
    ['ART_FLEMING_HOST', '⭐ 2× BONUS MULTIPLIER', 'You struck the hidden 2× plaque! Take an easy breath, use your full clock, and bank Double Cash!'],
    ['DON_PARDO_BOOTH', '⭐ STUDIO GASP · 2× LIVE!', 'Hear the whole balcony inhale! The hidden 2× Secret Square just popped wide open in {category}!'],
    ['GRANT_BELLAMY_MC', '⭐ THE STAR PLAQUE', 'There rings the concealed solenoid bell! Bring this {category} clue home for double dollars.'],
    ['PETER_MARSHALL_WIT', '⭐ JACKPOT TRILON!', 'Look at the marquee go haywire—you poked the exact square our accountant begged us to hide!'],
    ['ART_FLEMING_HOST', '⭐ PRIME-TIME BREAK!', 'Striking the Secret Square in {category} can tilt an entire ten-turn show in one beat!'],
    ['DON_PARDO_BOOTH', '⭐ DOUBLE STAKES ON AIR!', 'Gold foil flashing on the Trilon! Nail {category} right here for an instant 2× windfall!'],
    ['PETER_MARSHALL_WIT', '⭐ GOLDEN FINGER!', 'Out of the whole rack you walked straight into the 2× Secret Square—don’t leave the magic on the table!'],
    ['GRANT_BELLAMY_MC', '⭐ DOUBLE OR GLORY', 'The Secret Square shows its hand in {category}. Show America how a pro cashes a 2× star.'],
    ['ART_FLEMING_HOST', '⭐ STARBURST UNCOVERED!', 'Concealed beneath {category} all evening—lock in the right option and double this plaque’s purse!'],
    ['DON_PARDO_BOOTH', '⭐ 2× GOLD CHIME!', 'The Secret Square chime rings across {stage}—Double Dollars are riding on {category}!'],
  ]),

  // ======================== 6. LOCKED VAULT CRACK (16) ======================
  ...buildLineBank('LOCKED_VAULT_CRACK', 'GOLD', [
    ['DON_PARDO_BOOTH', '🔓 $500 VAULT UNLOCKED!', 'CLACK-THUNK! The heavy brass padlock drops—the $500 Gold Vault is wide open on the rack!'],
    ['ART_FLEMING_HOST', '🔓 GOLD VAULT OPEN!', 'Tumblers cleared! That gleaming $500 Gold Vault is unlatched—grab it before {rival} gets ideas!'],
    ['PETER_MARSHALL_WIT', '🔓 PADLOCK POPPED!', 'Hear that heavy bolt slide back? Help yourself to the top shelf—$500 sitting out in the open!'],
    ['GRANT_BELLAMY_MC', '🔓 SAFE CRACKED LIVE!', 'The stage vault solenoid just kicked loose! Five hundred base dollars waiting without a guard.'],
    ['DON_PARDO_BOOTH', '🔓 $500 SAFE WIDE OPEN!', 'No combination needed! Tap that shining $500 Gold Vault on your next turn for a bankroll surge!'],
    ['ART_FLEMING_HOST', '🔓 VAULT SEAL BROKEN!', 'Winning right next door sprung the $500 Gold Vault latch—first finger to tap it gets the shot!'],
    ['PETER_MARSHALL_WIT', '🔓 BANK DOOR SWINGS OPEN!', 'Quick—{rival} is staring at that unlocked $500 Vault like a beagle eyeing a Thanksgiving ham!'],
    ['DON_PARDO_BOOTH', '🔓 GOLD BULLION PLAQUE!', 'Five hundred prime-time dollars just stepped off lock and key—the Gold Vault Trilon is live!'],
    ['GRANT_BELLAMY_MC', '🔓 TUMBLERS CLEARED', 'That crisp brass clack means the $500 safe is armed. High stakes, handsome reward.'],
    ['ART_FLEMING_HOST', '🔓 $500 PRIZE SQUARE LIVE!', 'The padlock shutter dropped away and the $500 Vault is glowing gold—prime pickings next turn!'],
    ['PETER_MARSHALL_WIT', '🔓 OPEN SESAME · $500!', 'Not a stick of dynamite in sight—your hot streak just cracked the Studio Safe on live TV!'],
    ['DON_PARDO_BOOTH', '🔓 HEAVY BRASS UNLATCHED!', 'The crown jewel on the wall is officially unlocked—$500 Gold Vault up for grabs right now!'],
    ['ART_FLEMING_HOST', '🔓 VAULT READY TO BANK', 'You earned the key and sprung the $500 Vault! Strike while your streak multiplier is singing!'],
    ['GRANT_BELLAMY_MC', '🔓 THE $500 SANCTUM OPENS', 'The network safe is unsealed, challenger. Five hundred base dollars await a bold choice.'],
    ['PETER_MARSHALL_WIT', '🔓 SAFE-CRACKER SPECIAL!', 'Click, whirl, pop! That $500 Gold Vault is sitting out bare as a Las Vegas buffet!'],
    ['DON_PARDO_BOOTH', '🔓 $500 VAULT ARMED!', 'Gold marquee lamps framing the Vault—tap that $500 giant on your very next pick!'],
  ]),

  // ======================== 7. RIVAL MISS REBOUND (18) ======================
  ...buildLineBank('RIVAL_MISS_REBOUND', 'EMERALD', [
    ['DON_PARDO_BOOTH', '+$50 REBOUND LIVE!', 'BRZZZT at {rival}’s lectern! {category} bounces back open with a crisp +$50 Rebound—steal it!'],
    ['ART_FLEMING_HOST', '+$50 REBOUND OPEN!', '{rival} couldn’t solve {category}! That plaque stays lit with a +$50 Rebound bonus—pounce!'],
    ['PETER_MARSHALL_WIT', 'BUZZER WHIFF · +$50!', 'Ouch! {rival} left {category} cooling on the windowsill with +$50 taped to it—go pick their pocket!'],
    ['DON_PARDO_BOOTH', 'CHAMPION BLINKS · +$50!', 'A rare studio buzzer on {rival}! {category} rebounds wide open at +$50—snatch it right now!'],
    ['GRANT_BELLAMY_MC', '+$50 SWEETENED POT', '{rival} stumbled on {category}, sweetening the Trilon by +$50. Care to sweep up the crystal?'],
    ['ART_FLEMING_HOST', 'LOOSE CHANGE ON THE TOTE', 'No joy at the Champion’s desk! {category} is worth +$50 extra and sitting wide open for you!'],
    ['PETER_MARSHALL_WIT', 'FREE +$50 GIFT WRAP!', 'How neighborly of {rival}—whiffed {category} and stapled a crisp Grant fifty right onto the plaque!'],
    ['DON_PARDO_BOOTH', '+$50 REBOUND ON {category}!', 'Buzzer rasps at the Champion’s desk! +{rebound} Rebound added to {category}—steal that square!'],
    ['ART_FLEMING_HOST', 'OPPORTUNITY KNOCKS · +$50', 'Every Rival miss adds +$50 straight onto the plaque—{category} is ripe for a clean steal!'],
    ['GRANT_BELLAMY_MC', 'RIVAL SLIPS · +$50 BOUNTY', 'Even {rival} is mortal under quartz lights! {category} stays live with a +$50 sweetener!'],
    ['PETER_MARSHALL_WIT', '+$50 ON THE REBOUND!', 'Clang off the rim by {rival}! Snag that +$50 Rebound on {category} before the paint dries!'],
    ['DON_PARDO_BOOTH', 'WIDE OPEN REBOUND · +$50!', 'Zero dollars for {rival}, and +$50 tacked straight onto {category}—cash in on that rebound!'],
    ['ART_FLEMING_HOST', '+$50 TOTE SWEETENER', 'Look at {category} rimmed in Emerald—{rival}’s miss just juiced its value by +$50!'],
    ['PETER_MARSHALL_WIT', 'THANK THE CHAMPION · +$50', '{rival} did the heavy lifting of adding +$50 to {category}; all you have to do is pocket it!'],
    ['GRANT_BELLAMY_MC', '+$50 UNCLAIMED PLAQUE', 'A swing and a raspy magnetic buzzer from {rival}! +{rebound} Rebound waits on {category}.'],
    ['DON_PARDO_BOOTH', 'STEAL THE +$50 REBOUND!', '{rival} came up dry! That leaves +{rebound} extra riding on {category}—take it to the bank!'],
    ['ART_FLEMING_HOST', 'CHAMPION’S MISS, YOUR GAIN', 'Nothing doing at Podium Two—{category} stays lit with a juicy +$50 Rebound bonus!'],
    ['PETER_MARSHALL_WIT', '+$50 HOUSE EXTRA!', 'Oof, that buzzer echoes all the way to Hoboken! {category} jumped +$50—swoop in!'],
  ]),

  // ======================== 8. COMEBACK LEAD CHANGE (16) ====================
  ...buildLineBank('COMEBACK_LEAD_CHANGE', 'EMERALD', [
    ['DON_PARDO_BOOTH', 'NEW LEADER ON THE TOTE!', 'LEAD CHANGE AT {stage}! You roar from behind to overtake {rival} by {lead}!'],
    ['ART_FLEMING_HOST', 'COMEBACK SURGE!', 'Watch those Split-Flap digits blur—you’ve wiped out the deficit and claimed the front seat!'],
    ['PETER_MARSHALL_WIT', 'TABLES TURNED LIVE!', 'Honk as you pass {rival} in the express lane! From trailing to leading in one thunderous swing!'],
    ['GRANT_BELLAMY_MC', 'THE CHALLENGER LEADS!', 'Well, well—our dark horse just turned the scoreboard upside down: {playerCash} to {rivalCash}!'],
    ['DON_PARDO_BOOTH', 'ROAR FROM THE BALCONY!', 'Listen to Studio 6A erupt! You’ve snatched top billing on the master Solari!'],
    ['ART_FLEMING_HOST', 'MOMENTUM FLIPPED!', 'Never write off a cool customer—you’ve vaulted clean past {rival} into first place!'],
    ['PETER_MARSHALL_WIT', 'UPSET ON THE SPLIT-FLAP!', 'Quick, cut Camera Three to {rival}’s face! You just erased their cushion and stole the steering wheel!'],
    ['DON_PARDO_BOOTH', 'SCOREBOARD OVERTAKE!', 'Clack-clack-clack go the drums—challenger on top {playerCash} to {rivalCash} in Living Color!'],
    ['GRANT_BELLAMY_MC', 'CONTROL BOOTH STUNNED', 'Trailing a moment ago; leading by {lead} right now. Somebody check Booth A’s pulse!'],
    ['ART_FLEMING_HOST', 'RALLY FROM BEHIND!', 'Nerves of spun aluminum! You kept your poise, stacked the multipliers, and grabbed the lead!'],
    ['PETER_MARSHALL_WIT', 'COMEBACK KID STRIKES!', 'America loves an underdog rally, and you just served one steaming hot—ahead by {lead}!'],
    ['DON_PARDO_BOOTH', 'FIRST PLACE SNATCHED!', 'A seismic swing at eight o’clock! Our challenger leaps past {rival} onto the top line!'],
    ['ART_FLEMING_HOST', 'NEW FRONT-RUNNER!', 'Peacock Teal pulls ahead! Guard that {lead} cushion carefully down the homestretch!'],
    ['GRANT_BELLAMY_MC', 'THE PENDULUM SWINGS', 'Fortune tips its fedora to courage—you’ve surged past the Champion into first!'],
    ['PETER_MARSHALL_WIT', 'MIND THE BREEZE, CHAMP!', 'Whoosh! Hope {rival}’s hairspray held—you just blew right past them on the master rack!'],
    ['DON_PARDO_BOOTH', 'CHALLENGER TAKES COMMAND!', 'Underdog to front-runner in one clutch strike—{playerCash} commands the broadcast!'],
  ]),

  // ======================== 9. FINAL 2-TURN NAILBITER (16) ==================
  ...buildLineBank('FINAL_2_TURN_NAILBITER', 'TANGERINE', [
    ['DON_PARDO_BOOTH', 'FINAL STRETCH · PHOTO FINISH!', 'Two turns left and only {gap} separates these two—nobody breathe in the mezzanine!'],
    ['ART_FLEMING_HOST', 'CRUNCH TIME · {gap} APART!', 'Down to the final bell! One bold upper-row plaque decides tonight’s entire check!'],
    ['PETER_MARSHALL_WIT', 'EDGE-OF-THE-SOFA TIME!', 'Set the TV trays down, folks—two turns left and you couldn’t slide a dime between these scores!'],
    ['GRANT_BELLAMY_MC', 'HIGH-WIRE HOMESTRETCH', 'Turn {turn} of 10, razor-thin {gap} margin. Every dollar on this rack weighs a ton right now.'],
    ['DON_PARDO_BOOTH', 'BARN-BURNER ON AIR!', 'Fifty million sets glued to Channel 4—{playerCash} vs {rivalCash} rolling into the wire!'],
    ['ART_FLEMING_HOST', 'CLUTCH TERRITORY!', 'Eye those dollar tiers closely—with {gap} between you, pick the square that seals the math!'],
    ['PETER_MARSHALL_WIT', 'SWEATY PALMS AT THE PODIUM!', 'Two turns to go and it’s tighter than a brand-new pair of patent-leather wingtips!'],
    ['DON_PARDO_BOOTH', 'HOMESTRETCH SHOWDOWN!', 'The brushed snare is ticking faster—just {gap} apart with the checkered flag in sight!'],
    ['GRANT_BELLAMY_MC', 'CHAMPIONSHIP NERVE TEST', 'This is why sponsors buy eight o’clock: final turns, {gap} on the board, zero room to blink.'],
    ['ART_FLEMING_HOST', 'EVERY DOLLAR CRITICAL!', 'We have a classic network nailbiter! Hunt a fat plaque or a +$50 Rebound right here!'],
    ['PETER_MARSHALL_WIT', 'DON’T TOUCH THAT DIAL!', 'If our director throws to a soap commercial right now there’ll be a riot—only {gap} apart!'],
    ['DON_PARDO_BOOTH', 'RAZOR’S EDGE · TURN {turn}!', 'Neck and neck at {playerCash} to {rivalCash}—this broadcast goes down to the final chime!'],
    ['ART_FLEMING_HOST', 'TWO PICKS FROM THE BELL!', 'Stay calm on the thirty-second clock—one crisp answer here can lock {rival} out for good!'],
    ['GRANT_BELLAMY_MC', 'SUDDEN-DEATH TENSION', 'You can hear the quartz spotlights hum in {stage}—{gap} separates champagne from heartbreak!'],
    ['PETER_MARSHALL_WIT', 'NAILBITER OF THE WEEK!', 'My cue card is rattling like a tambourine and I’m not even playing! {gap} game at the wire!'],
    ['DON_PARDO_BOOTH', 'CLUTCH TURN AT {stage}!', 'All eyes on the master board—two last turns to outbank {rival} and claim the trophy check!'],
  ]),

  // ======================== 10. EPISODE VICTORY (18) ========================
  ...buildLineBank('EPISODE_VICTORY', 'GOLD', [
    ['DON_PARDO_BOOTH', '🏆 NEW STUDIO CHAMPION!', 'BALLGAME AT {stage}! You outbank {rival} {playerCash} to {rivalCash} in Living Color!'],
    ['ART_FLEMING_HOST', '🏆 EPISODE WINNER!', 'What a show! You outplayed {rival} wire to wire—that engraved winner’s check is all yours!'],
    ['PETER_MARSHALL_WIT', '🏆 POP THE CONFETTI!', 'Cue the Tijuana horns and drop the gold tinsel—our challenger just dethroned {rival}!'],
    ['GRANT_BELLAMY_MC', '🏆 VICTORY ON THE TOTE', '{playerCash} locked on the Solari! Take a bow under Camera One—tonight’s stage belongs to you.'],
    ['DON_PARDO_BOOTH', '🏆 STANDING OVATION!', 'Hear those cheers rattle the 30 Rock chandeliers! Challenger takes it {playerCash} to {rivalCash}!'],
    ['ART_FLEMING_HOST', '🏆 PURSE CLAIMED!', 'Poise, speed, and genuine quiz craft—you’ve conquered {stage} fair and square!'],
    ['PETER_MARSHALL_WIT', '🏆 UPSET COMPLETE!', 'Send {rival} home with the lovely chrome toaster—the big network check has YOUR name on it!'],
    ['DON_PARDO_BOOTH', '🏆 MARQUEE LIGHTS BLAZING!', 'Every #11 tungsten bulb in the house is flashing gold—{playerCash} seals a thrilling triumph!'],
    ['GRANT_BELLAMY_MC', '🏆 CONTROL BOOTH SILENCED', 'Unscripted, unrigged, undeniable. You beat {rival} straight up before fifty million witnesses!'],
    ['ART_FLEMING_HOST', '🏆 CHAMPIONSHIP CLINIC!', 'Ten electric turns and your column towers over the rack—congratulations, Champion!'],
    ['PETER_MARSHALL_WIT', '🏆 BREAK THE BANK!', '{playerCash} in crisp broadcast dollars! Even the vice president of paper clips is cheering!'],
    ['DON_PARDO_BOOTH', '🏆 COAST-TO-COAST WINNER!', 'From Manhattan to Malibu, raise a glass to tonight’s newest World’s Smartest winner!'],
    ['ART_FLEMING_HOST', '🏆 CLIMBING THE LADDER!', 'Another reigning champ toppled, another fat deposit into your purse—on to the next soundstage!'],
    ['GRANT_BELLAMY_MC', '🏆 SOVEREIGN FINISH', 'A commanding {lead} margin at the bell! Step forward for Grant Bellamy’s Purse Ceremony!'],
    ['PETER_MARSHALL_WIT', '🏆 PURE GOLD BROADCAST!', 'Nerves of brushed aluminum and {playerCash} in the safe—Ed Sullivan couldn’t follow that!'],
    ['DON_PARDO_BOOTH', '🏆 FANFARE FOR THE CHAMP!', 'Blast that showband brass! {playerCash} tops {rival} as the whole studio goes wild!'],
    ['ART_FLEMING_HOST', '🏆 UNDISPUTED TONIGHT!', 'You read the rack, worked every twist, and closed the show like a five-week legend!'],
    ['PETER_MARSHALL_WIT', '🏆 RING THE WINNER’S BELL!', 'Ding-ding-ding! Call Brinks and warm up the Cadillac—our challenger owns the studio tonight!'],
  ]),

  // ======================== 11. BONUS CLASSIC TV TWISTS (40) ================
  ...buildLineBank('MYSTERY_CURTAIN_REVEAL', 'CERISE', [
    ['DON_PARDO_BOOTH', '❓ MYSTERY CURTAIN!', 'Part the velvet drapes—let’s see what prize is gleaming behind tonight’s Mystery Curtain!'],
    ['PETER_MARSHALL_WIT', '❓ CURTAIN #1, #2 OR #3?', 'Monty Hall is grinning in Burbank! No goats back there, folks—pure 1966 cash-and-steal action!'],
    ['ART_FLEMING_HOST', '❓ WILD CURTAIN TWIST!', 'You yanked the gold velvet tassel! Instant cash, a Rival steal, or Double Chips on the reveal!'],
    ['GRANT_BELLAMY_MC', '❓ VELVET DRAPE SURPRISE', 'Cue the showband drumroll—a Mystery Curtain plaque never leaves a scoreboard polite for long.'],
    ['DON_PARDO_BOOTH', '❓ CURTAIN CORD PULLED!', 'Mod Cerise footlights blazing! What prime-time windfall did the prize desk tuck behind the drape?'],
    ['PETER_MARSHALL_WIT', '❓ BEHIND THE VELVET!', 'Hope you like surprises—our stagehands spent all afternoon polishing whatever’s behind that curtain!'],
    ['ART_FLEMING_HOST', '❓ DEAL OR STEAL!', 'Footlights up on the Mystery Curtain! Every reveal shakes up both columns on the Tote!'],
    ['GRANT_BELLAMY_MC', '❓ SHOWROOM REVEAL', 'Draw back the crimson velvet and let fifty million living rooms gasp in unison!'],
  ]),

  ...buildLineBank('OPPONENT_CHOICE_CHALLENGE', 'CERISE', [
    ['ART_FLEMING_HOST', '🎭 RIVAL’S PICK · 1.5×!', '{rival} hand-picked this tricky category to trip you—ace it for a sweet 1.5× Spite Bonus!'],
    ['PETER_MARSHALL_WIT', '🎭 THROWN GAUNTLET!', '{rival} dared you to tap {category}! Nail it and cash the 1.5× Spite Bonus right in their face!'],
    ['GRANT_BELLAMY_MC', '🎭 CHAMPION’S DARE', 'An Opponent’s Choice square! {rival} set the trap—flip it into +$100 and 1.5× extra multiplier!'],
    ['DON_PARDO_BOOTH', '🎭 1.5× SPITE BOUNTY!', 'You marched straight into {rival}’s chosen test! Conquer {category} for bonus spite dollars!'],
    ['PETER_MARSHALL_WIT', '🎭 DOUBLE DARE ON AIR!', 'Bold tap! Nothing wilts a Champion’s collar faster than acing the exact trap they laid for you!'],
    ['ART_FLEMING_HOST', '🎭 TURNING THE TABLES!', '{rival} wanted you nowhere near your comfort zone—solve {category} and make them pay 1.5×!'],
    ['DON_PARDO_BOOTH', '🎭 WALKING INTO THE LION’S DEN!', 'Follow-spots crossing on {category}! Beat {rival}’s personal dare for a massive spite payout!'],
    ['GRANT_BELLAMY_MC', '🎭 CALLING THEIR BLUFF', 'You accepted {rival}’s private challenge without blinking. Bring it home for 1.5× bonus!'],
    ['PETER_MARSHALL_WIT', '🎭 SWEETEST REVENGE · 1.5×!', 'If you nail {category} right now, {rival} is going to need a fresh pocket handkerchief!'],
    ['ART_FLEMING_HOST', '🎭 SPITE MULTIPLIER ARMED!', 'High-wire courage! Turning {rival}’s own pick into 1.5× cash is classic television theater!'],
  ]),

  ...buildLineBank('INSTANT_BARGAIN_TEMPTATION', 'TANGERINE', [
    ['DON_PARDO_BOOTH', '🔔 INSTANT BARGAIN BELL!', 'STOP THE BOARD! The Instant Bargain turntable is spinning with a mid-show studio temptation!'],
    ['PETER_MARSHALL_WIT', '🔔 SALE OF THE CENTURY!', 'Hear that bargain bell? Trade a sliver of live score right now for permanent firepower—or pass!'],
    ['ART_FLEMING_HOST', '🔔 SPECIAL DESK OFFER!', 'An Instant Bargain from our showroom plinth! Weigh your cash cushion before tapping Buy or Pass!'],
    ['GRANT_BELLAMY_MC', '🔔 REVOLVING PLINTH LIVE', 'Temptation on velvet, challenger. Spend a slice of your lead now to supercharge the finish?'],
    ['DON_PARDO_BOOTH', '🔔 ONE-TAP STUDIO DEAL!', 'Spotlight on the brass bargain turntable! Protect your lead or invest in a game-changer?'],
    ['PETER_MARSHALL_WIT', '🔔 MID-SHOW MARKDOWN!', 'Forget Macy’s Basement—this revolving plinth deals studio props at pennies on the scoreboard dollar!'],
    ['ART_FLEMING_HOST', '🔔 SHOWROOM TEMPTATION', 'A revolving prize offer! Smart players check the scoreboard gap before spending live score.'],
    ['GRANT_BELLAMY_MC', '🔔 EXECUTIVE BARGAIN', 'A rare Studio Prop glides into the follow-spot. Take the discount now, or keep every dollar intact?'],
    ['DON_PARDO_BOOTH', '🔔 TURNTABLE IN MOTION!', 'The velvet plinth rotates live! Buy big momentum right now or wave the bargain bell away!'],
    ['PETER_MARSHALL_WIT', '🔔 BUYER BE BOLD!', '{rival} is praying you blow your cushion—or praying you don’t grab that multiplier prop!'],
  ]),

  ...buildLineBank('BOOTH_RIGGING_BUSTED', 'EMERALD', [
    ['DON_PARDO_BOOTH', '🚨 BOOTH RIGGING BUSTED!', 'INTERCEPTED ON LIVE TV! You caught Control Booth A feeding a live tell—+$400 Clean Bounty!'],
    ['ART_FLEMING_HOST', '🚨 STANDARDS ARREST!', 'Vera Karp clicks her brass stopwatch! Booth A’s signal is cut and $400 Clean Purse goes to you!'],
    ['PETER_MARSHALL_WIT', '🚨 CAUGHT RED-HANDED!', 'Wave to the Senate subcommittee, {rival}! Our challenger spotted that cue from forty feet away!'],
    ['GRANT_BELLAMY_MC', '🚨 FEED TERMINATED!', 'Hawk eyes, challenger! You severed the Booth feed and rattled {rival} right at the lectern!'],
    ['DON_PARDO_BOOTH', '🚨 +$400 WHISTLEBLOWER HIT!', 'Siren in the rafters! Clean Purse bounty certified and the Champion’s secret line is dead!'],
    ['PETER_MARSHALL_WIT', '🚨 CALL WASHINGTON!', 'Caught with a hand in the spotlight jar! {rival}’s face just matched the red tally lamp!'],
    ['ART_FLEMING_HOST', '🚨 CLEAN-AIR INTERCEPT!', 'Broadcast Standards just pulled the plug on Booth A—+$400 certified Clean Cash awarded!'],
    ['DON_PARDO_BOOTH', '🚨 RIGGED WIRE SNIPPED!', 'Fifty million witnesses just saw that cheat collapse live on air—+$400 straight to your Clean Purse!'],
    ['GRANT_BELLAMY_MC', '🚨 UNSANCTIONED SIGNAL CUT', 'Ahem—let the record show the host had no knowledge of that wire! Clean bounty certified!'],
    ['PETER_MARSHALL_WIT', '🚨 BUSTED IN LIVING COLOR!', 'Somebody hide the canary envelopes! You nailed Booth A red-handed for a cool +$400!'],
  ]),

  // ================ 12. 6-MODE 1960s BOARD GAMEPLAY CALLS (56) ==============
  ...buildLineBank('CLASSIC_TOTE_ROW_SWEEP', 'GOLD', [
    ['DON_PARDO_BOOTH', '★ FULL ROW SWEEP · +$250!', 'CLEAN SWEEP ACROSS THE RACK! Owning an entire horizontal tier banks an instant +$250 Bonus!'],
    ['ART_FLEMING_HOST', '★ +$250 TIER BONUS!', 'Every plaque across that dollar shelf belongs to you—+$250 Classic Tote Sweep added to your purse!'],
    ['PETER_MARSHALL_WIT', '★ STRAIGHT ACROSS · +$250!', 'Cleared that shelf faster than a Friday white sale—+$250 Row Sweep straight into your column!'],
    ['GRANT_BELLAMY_MC', '★ HORIZONTAL DOMINION!', 'Left stanchion to right stanchion, completely yours—+$250 Row Bonus rings onto the Solari!'],
    ['PETER_MARSHALL_WIT', '★ SHELF CLEARED · +$250!', 'Didn’t even leave {rival} a crumb on that tier—+$250 Row Sweep bonus certified!'],
    ['DON_PARDO_BOOTH', '★ COAST-TO-COAST ROW!', 'Three across in Living Color! Our solenoid bell pays +$250 for sweeping the whole row!'],
    ['DON_PARDO_BOOTH', '★ ISOLATION ROW SWEEP!', 'Crossbar relays lock green inside the Teak & Teal Isolation Booth—+$250 Row Sweep banked in silence!', 'PEACOCK', 'STAGE_04_1958_ISOLATION_VAULT'],
    ['GRANT_BELLAMY_MC', '★ SOUNDPROOF PRECISION!', 'Clinical sweep across the Isolation Tote Desk—+$250 bonus while {rival} watches through the glass!', 'GOLD', 'STAGE_04_1958_ISOLATION_VAULT'],
    ['ART_FLEMING_HOST', '★ RELAY PAIR COMPLETE!', 'Every supervisory lamp on that Isolation Booth tier is lit—+$250 Row Bonus confirmed!', 'PEACOCK', 'STAGE_04_1958_ISOLATION_VAULT'],
    ['PETER_MARSHALL_WIT', '★ GLASS-BOOTH CLEANOUT!', 'Quiet as a cathedral in there, yet that +$250 Row Sweep rang loud enough for Sixth Avenue!', 'GOLD', 'STAGE_04_1958_ISOLATION_VAULT'],
  ]),

  ...buildLineBank('TIC_TAC_LINE_JACKPOT', 'GOLD', [
    ['PETER_MARSHALL_WIT', '★ THREE IN A ROW · +$600!', 'TIC-TAC-JACKPOT! Three connected squares light the marquee row for an instant +$600 Line Bonus!'],
    ['DON_PARDO_BOOTH', '★ +$600 LINE BONUS!', 'Chasing #11 gold bulbs straight across the scaffold—three in a row banks +$600 in Living Color!'],
    ['ART_FLEMING_HOST', '★ LINE COMPLETED · +$600!', 'Brilliant tic-tac geometry! {rival} missed the block and you cash the +$600 Line Jackpot!'],
    ['GRANT_BELLAMY_MC', '★ HOLLYWOOD LINE SWEEP!', 'Three illuminated cubicles linked cleanly across the Tote—+$600 bonus straight to your purse!'],
    ['PETER_MARSHALL_WIT', '★ BLOCK THAT, CHAMPION!', 'X marks the jackpot! Three connected squares and +$600 before {rival} could plug the gap!'],
    ['DON_PARDO_BOOTH', '★ JUBILEE LINE JACKPOT!', 'The Primetime Jubilee starburst erupts—three connected hexes pay +$600 at Television City!', 'GOLD', 'STAGE_02_IBC_PRIMETIME_JUBILEE'],
    ['PETER_MARSHALL_WIT', '★ TELEVISION CITY BINGO!', 'Cerise and gold chevrons flashing! You beat {rival} to three-in-a-row on the Jubilee bridge for +$600!', 'CERISE', 'STAGE_02_IBC_PRIMETIME_JUBILEE'],
    ['ART_FLEMING_HOST', '★ JUBILEE LIGHT-PIPE LIT!', 'Three honeycomb cubicles linked under the golden rotunda—+$600 Jubilee Line Bonus banked!', 'GOLD', 'STAGE_02_IBC_PRIMETIME_JUBILEE'],
    ['GRANT_BELLAMY_MC', '★ ZIGGURAT CROWN LINE!', 'Three aligned plaques across the Penthouse Ziggurat—+$600 Championship Line Bonus!', 'GOLD', 'STAGE_10_SOVEREIGN_SANCTUM'],
  ]),

  ...buildLineBank('COAST_BRIDGE_CONNECTED', 'PEACOCK', [
    ['DON_PARDO_BOOTH', '⬡ COAST TO COAST · +$750!', 'NEW YORK TO HOLLYWOOD CONNECTED! Your unbroken hex bridge lights up for a +$750 Link Jackpot!'],
    ['ART_FLEMING_HOST', '⬡ +$750 BRIDGE BONUS!', 'Left edge to right edge! You’ve spanned the entire network map for +$750 bonus dollars!'],
    ['PETER_MARSHALL_WIT', '⬡ TRANSCONTINENTAL HIT!', 'All aboard the Peacock express! Coast-to-coast hex chain complete for a cool +$750!'],
    ['GRANT_BELLAMY_MC', '⬡ FULL NETWORK SPAN!', 'Every relay from 30 Rock to Burbank just locked green—+$750 Coast-to-Coast Bridge awarded!'],
    ['DON_PARDO_BOOTH', '⬡ GOLD HEX CHAIN · +$750!', 'What a path across the honeycomb! Unbroken coast-to-coast link pays +$750 on the spot!'],
    ['DON_PARDO_BOOTH', '⬡ UNISPHERE MERIDIAN LINK!', 'Orbiting World’s Fair rings blaze gold—your Coast-to-Coast Sundial bridge banks +$750!', 'GOLD', 'STAGE_08_WORLDS_FAIR_GEODESIC'],
    ['ART_FLEMING_HOST', '⬡ PAVILION SPAN · +$750!', 'East Pavilion to West Pavilion connected under the Unisphere—+$750 Link Bonus!', 'PEACOCK', 'STAGE_08_WORLDS_FAIR_GEODESIC'],
  ]),

  ...buildLineBank('EYE_GUESS_FLASH_OPEN', 'COBALT', [
    ['ART_FLEMING_HOST', '👁 EYE GUESS BOARD FLASH!', 'Watch the Trilons! Every hidden 2× Star and bonus prize flashes open for two seconds—memorize fast!'],
    ['DON_PARDO_BOOTH', '👁 TWO-SECOND PEEK LIVE!', 'Don’t blink at home! All hidden board prizes are flashing right now before the shutters snap!'],
    ['PETER_MARSHALL_WIT', '👁 PHOTOGRAPHIC MEMORY!', 'Quick, spot the gold stars before the Trilons spin shut—Bill Cullen style!'],
    ['GRANT_BELLAMY_MC', '👁 MEMORIZE THE RACK', 'Two seconds of pure truth on the Tote Board—remember where the jackpots and traps are hiding!'],
    ['DON_PARDO_BOOTH', '👁 SHUTTERS SNAPPING SHUT!', 'Lock those coordinates in your head—the Eye Guess memory flash is live at {stage}!'],
    ['DON_PARDO_BOOTH', '👁 CHANNEL 83 RADAR PEEK!', 'Pirate radar sweeps the offshore deck! Memorize every 2× Star and trap before the hatches slam shut!', 'COBALT', 'STAGE_09_CHANNEL_83_UHF_BARGE'],
    ['ART_FLEMING_HOST', '👁 OFFSHORE MEMORY FLASH!', '50,000 watts of UHF truth for two brisk seconds—lock those Channel 83 jackpot squares in mind!', 'PEACOCK', 'STAGE_09_CHANNEL_83_UHF_BARGE'],
    ['PETER_MARSHALL_WIT', '👁 SEA-LEGS & SHARP EYES!', 'Don’t get seasick, folks—spot the +$300 prizes on M/V Cassandra before the Trilons flip dark!', 'COBALT', 'STAGE_09_CHANNEL_83_UHF_BARGE'],
    ['DON_PARDO_BOOTH', '👁 APOLLO TELEMETRY FLASH!', 'Master Color Control flashes every hidden star on the memory ring—lock your coordinates fast!', 'COBALT', 'STAGE_05_1984_LARSON_CRT_LAB'],
  ]),

  ...buildLineBank('CONCENTRATION_PRIZE_MATCH', 'GOLD', [
    ['DON_PARDO_BOOTH', '🎁 PRIZE PAIR MATCHED · +$500!', 'IT’S A CONCENTRATION MATCH! Two matching 1966 luxury prize halves bank a +$500 Prize Package!'],
    ['ART_FLEMING_HOST', '🎁 +$500 PRIZE PACKAGE!', 'Sharp memory on the rotating Trilons! You paired both halves for a +$500 showroom windfall!'],
    ['PETER_MARSHALL_WIT', '🎁 MATCHING HALVES!', 'Hugh Downs is applauding somewhere! Two matching prize plaques put +$500 straight in your column!'],
    ['GRANT_BELLAMY_MC', '🎁 TRILON PAIR LOCKED!', 'Both halves of the luxury prize match cleanly—+$500 added to your broadcast tally!'],
    ['DON_PARDO_BOOTH', '🎁 SHOWROOM JACKPOT · +$500!', 'Clack-clack—it’s a match! Five hundred bonus dollars roll onto your Split-Flap drum!'],
    ['DON_PARDO_BOOTH', '🎁 BURBANK POP-ART MATCH!', 'The Mondrian shutters fly open and the Kaleidoscope wheels cheer—+$500 Burbank Prize Match banked!', 'CERISE', 'STAGE_03_1926_VAUDEVILLE_PIT'],
    ['PETER_MARSHALL_WIT', '🎁 GROOVY PRIZE PAIR · +$500!', 'Sock it to the Tote Board! Two matching halves at Burbank Pop-Art Carnival pay a cool +$500!', 'TANGERINE', 'STAGE_03_1926_VAUDEVILLE_PIT'],
    ['ART_FLEMING_HOST', '🎁 KALEIDOSCOPE JACKPOT!', 'Brilliant recall on the Burbank Prize Deck—both luxury halves matched for +$500!', 'GOLD', 'STAGE_03_1926_VAUDEVILLE_PIT'],
    ['GRANT_BELLAMY_MC', '🎁 MONTE CARLO PAIR · +$500!', 'Riviera showroom elegance—two matching luxury plaques lock in +$500 beside the roulette wheel!', 'GOLD', 'STAGE_07_1969_MONTE_CARLO_CASINO'],
  ]),

  ...buildLineBank(
    'MYSTERY_CURTAIN_REVEAL',
    'CERISE',
    [
      ['DON_PARDO_BOOTH', '❓ STEEL PIER CURTAIN DEAL!', 'Wurlitzer organ swelling on Atlantic City’s Steel Pier—pick Curtain #1, #2, or #3 for a boardwalk prize!', 'TANGERINE', 'STAGE_06_ATLANTIC_CITY_PIER'],
      ['PETER_MARSHALL_WIT', '❓ BOARDWALK VELVET DOORS!', 'Step right up on the Steel Pier! Behind these salt-air curtains: cash envelopes, steals, or Double Chips!', 'CERISE', 'STAGE_06_ATLANTIC_CITY_PIER'],
      ['ART_FLEMING_HOST', '❓ PIER MONTY DEAL LIVE!', 'Atlantic City spotlight on the three velvet drapes—make your boardwalk deal before the tide turns!', 'GOLD', 'STAGE_06_ATLANTIC_CITY_PIER'],
    ],
    'pier',
  ),

  // ========= 13. BIG WHEEL, MONOSCOPE SIGNAL-JAM & SCOUTING (78) ============
  ...buildLineBank('BIG_WHEEL_SPIN_START', 'GOLD', [
    ['DON_PARDO_BOOTH', '🎡 SPIN THE BIG WHEEL!', 'Roll out the 20-wedge Spun-Aluminum Showcase Wheel—give that rim a prime-time flick for big cash!'],
    ['PETER_MARSHALL_WIT', '🎡 BIG MONEY · SPIN TO WIN!', 'Listen to those brass rim pegs click-click-click! Give the 1966 Showcase Wheel a hearty yank!'],
    ['ART_FLEMING_HOST', '🎡 SHOWCASE WHEEL LIVE!', 'Twenty gleaming wedges from +$100 to the $1,000 Gold Star—flick the rim and watch the flapper dance!'],
    ['GRANT_BELLAMY_MC', '🎡 COAST-TO-COAST SPIN', 'Step right up to the turntable, challenger—one clean spin can reshape tonight’s entire scoreboard!'],
    ['DON_PARDO_BOOTH', '🎡 TUNGSTEN WHEEL ARMED!', 'Twenty-four #11 bezel bulbs chasing gold—spin the Big Wheel and let fifty million viewers cheer!'],
    ['PETER_MARSHALL_WIT', '🎡 GIVE IT A WHIRL!', '{rival} is squinting nervously at that +$1,000 wedge—put some shoulder into that walnut rim!'],
    ['ART_FLEMING_HOST', '🎡 LEATHER FLAPPER READY!', 'One solid spin of the spun-aluminum drum—hope the brass pointer stops squarely on gold!'],
    ['GRANT_BELLAMY_MC', '🎡 FORTUNE AT EIGHT O’CLOCK', 'Camera Two glides tight onto the hubcap. Give our 20-wedge Showcase Wheel an authoritative spin!'],
    ['DON_PARDO_BOOTH', '🎡 SHOWROOM TURNTABLE HOT!', 'Hit that spinning rim! Bonus cash, steals, and the glittering $1,000 wedge are all in play!'],
    ['PETER_MARSHALL_WIT', '🎡 WRIST ENGLISH TIME!', 'Remember, folks—it takes a crisp flick to clear the flapper! Show us your prime-time swing!'],
  ]),

  ...buildLineBank('BIG_WHEEL_JACKPOT', 'GOLD', [
    ['DON_PARDO_BOOTH', '🌟 BIG WHEEL JACKPOT!', 'STOP THE FLAPPER! {outcome} on the Showcase Wheel—Studio 6A just lifted clean off its hinges!'],
    ['PETER_MARSHALL_WIT', '🌟 WHAT A SPIN!', 'Now THAT is championship wrist action! {outcome} clattering straight onto the Split-Flap counter!'],
    ['ART_FLEMING_HOST', '🌟 SHOWCASE WINDFALL!', 'Right on the money! The leather flapper settles squarely on {outcome} in Living Color!'],
    ['GRANT_BELLAMY_MC', '🌟 GOLD WEDGE LOCKED!', 'Magnificent spin—{outcome} pays out live while our brass section hits full fortissimo!'],
    ['DON_PARDO_BOOTH', '🌟 CROWD ON ITS FEET!', 'Ding-ding-ding! {outcome} on the Big Wheel—{rival}’s jaw just grazed the walnut lectern!'],
    ['PETER_MARSHALL_WIT', '🌟 CALL THE BRINKS TRUCK!', 'You landed {outcome} right under {rival}’s nose—even our stingiest sponsor is grinning!'],
    ['ART_FLEMING_HOST', '🌟 PRECISION LANDING!', 'Not a millimeter over, not a hair short—the brass peg locks {outcome} into your column!'],
    ['GRANT_BELLAMY_MC', '🌟 TURNTABLE TRIUMPH', 'Fifty million homes cheered the instant that flapper clicked home: {outcome} certified!'],
    ['DON_PARDO_BOOTH', '🌟 MARQUEE EXPLOSION!', 'Every bulb on the Showcase drum is flashing gold—{outcome} rocks tonight’s scoreboard!'],
    ['PETER_MARSHALL_WIT', '🌟 GOLDEN TOUCH!', 'Have you considered retiring to Monte Carlo? {outcome} off one velvet flick of the wrist!'],
  ]),

  ...buildLineBank('GREMLIN_ZONK_BLOWUP', 'TANGERINE', [
    ['DON_PARDO_BOOTH', '📺 SIGNAL JAMMED · ZONK!', 'PLEASE STAND BY—WAH-WAH-WAAAH! The RCA Monoscope hijacked the carrier and wiped {cash}!'],
    ['PETER_MARSHALL_WIT', '📺 TEST PATTERN ZONK!', 'Ka-blooey! Nothing says “tough luck, pal” like a 1966 test pattern eating {cash} on live TV!'],
    ['ART_FLEMING_HOST', '📺 CARRIER DROP · ZONK!', 'Hear the whole balcony gasp! Hitting the Signal Jam flashes the Monoscope for a {cash} wipeout!'],
    ['GRANT_BELLAMY_MC', '📺 SHORT CIRCUIT ON AIR!', 'Oscilloscope spiking into crimson! Technical difficulties just trimmed {cash}—never push one spin too far!'],
    ['DON_PARDO_BOOTH', '📺 WAH-WAH-WAAAH · ZONK!', 'Slide trombone groans across fifty million living rooms—the Signal Jam just torched {cash}!'],
    ['PETER_MARSHALL_WIT', '📺 TUBE BLOWOUT!', 'Somebody kick the master transmitter in Booth A! The Monoscope just swallowed {cash} whole!'],
    ['ART_FLEMING_HOST', '📺 PLEASE STAND BY!', 'High-voltage static on the light-board—a painful {cash} Zonk right in front of Camera One!'],
    ['GRANT_BELLAMY_MC', '📺 TECHNICAL DIFFICULTIES', 'Our apologies to viewers in Omaha—the broadcast carrier just clipped {cash} off the ledger!'],
    ['DON_PARDO_BOOTH', '📺 MONOSCOPE STRIKES!', 'Crosshairs locked, sine wave howling—the Signal Jam wipes {cash} off the Split-Flap!'],
    ['PETER_MARSHALL_WIT', '📺 DO NOT ADJUST YOUR SET!', 'That’s not your rabbit ears, folks—that’s {cash} evaporating into a prime-time test pattern!'],
  ]),

  ...buildLineBank('GREMLIN_PASS_SPINS', 'CERISE', [
    ['PETER_MARSHALL_WIT', '🔥 SPINS PASSED TO {rival}!', 'OH, THAT IS DIABOLICAL! You shoved {spins} hot spins straight to {rival}—make ’em face the static!'],
    ['DON_PARDO_BOOTH', '🔥 HOT POTATO ON AIR!', '{spins} live Press-Your-Luck spins dumped squarely in {rival}’s lap—the crowd loves the nerve!'],
    ['ART_FLEMING_HOST', '🔥 TACTICAL PASS!', 'Ice-cold strategy! Passing {spins} spins forces {rival} onto the hazard light-board right now!'],
    ['GRANT_BELLAMY_MC', '🔥 THE PRESSURE SHIFTS', 'Watch {rival} swallow hard—{spins} mandatory spins under the Monoscope with fifty million watching!'],
    ['PETER_MARSHALL_WIT', '🔥 GOOD LUCK, CHAMP!', '“Here, you hold the live wire!” {rival} must survive {spins} spins before they can exhale!'],
    ['DON_PARDO_BOOTH', '🔥 PASSED THE DYNAMITE!', '{spins} dangerous spins slid across the stage to {rival}—one Signal Jam blows their purse wide open!'],
    ['ART_FLEMING_HOST', '🔥 FORCED TO SPIN!', 'Brilliant defense! You bank your safety and hand {rival} {spins} nerve-wracking light-board drops!'],
    ['PETER_MARSHALL_WIT', '🔥 SPECIAL DELIVERY!', 'Sign on the dotted line, {rival}—our challenger just mailed you {spins} high-voltage spins!'],
    ['GRANT_BELLAMY_MC', '🔥 CALCULATED GAMBIT', 'Step up to the hazard console, {rival}—{spins} passed spins standing between you and safety.'],
    ['DON_PARDO_BOOTH', '🔥 ALL EYES ON PODIUM TWO!', 'The studio hush falls as {rival} inherits {spins} live spins—will the Monoscope strike?'],
  ]),

  ...buildLineBank('SCOUTING_DISCOVERY', 'PEACOCK', [
    ['ART_FLEMING_HOST', '💡 SCOUTING NOTEBOOK LOGGED!', 'Aha! {outcome} on {rival}—permanently inked into your Studio Scouting Notebook!'],
    ['PETER_MARSHALL_WIT', '💡 READ ’EM LIKE A BOOK!', 'Sharp eyes! You clocked {rival}’s flinch on {category}—{outcome} saved for every rematch!'],
    ['DON_PARDO_BOOTH', '💡 CHAMPION FILE UPDATED!', 'Green-room flash: {outcome} stamped on {rival}—turn that intel into cash on the Tote!'],
    ['GRANT_BELLAMY_MC', '💡 LIVE TELL LOGGED', 'Not a blink gets past you—{outcome} on {rival} is now filed permanently in your dossier.'],
    ['ART_FLEMING_HOST', '💡 SCOUTING BREAKTHROUGH!', 'Pocket that reaction! {outcome} on {rival}—aim your next strike whenever {category} lights up!'],
    ['PETER_MARSHALL_WIT', '💡 GREEN-ROOM GOSSIP PAID OFF!', 'Catch that tiny collar tug? {outcome} on {rival}—now you know exactly where to poke!'],
    ['DON_PARDO_BOOTH', '💡 INTEL LOCKED IN!', 'That tells the whole story in Living Color: {outcome} recorded on {rival}’s dossier!'],
    ['ART_FLEMING_HOST', '💡 TACTICAL EDGE GAINED!', 'Every great returning champion scouts the lectern—{outcome} logged against {rival}!'],
    ['GRANT_BELLAMY_MC', '💡 DOSSIER ANNOTATED', 'A subtle micro-expression under 300 footcandles: {outcome} noted for {rival}.'],
    ['PETER_MARSHALL_WIT', '💡 WRITE THAT DOWN!', 'You read {rival} faster than a Sunday gossip column—{outcome} inked into your notebook!'],
  ]),

  ...buildLineBank('BRASS_KEY_UNLOCK', 'GOLD', [
    ['DON_PARDO_BOOTH', '🗝️ BRASS KEY SECURED!', 'Clack-clink! You claimed the Brass Key—the $500 Safe is unlocked and shielded for YOUR pick next turn!'],
    ['ART_FLEMING_HOST', '🗝️ KEYHOLDER PRIORITY!', 'Masterful move! The $500 Safe pops open, and {rival} is locked out for one full turn while you strike!'],
    ['PETER_MARSHALL_WIT', '🗝️ HANDS OFF, {rival}!', 'You hold the Brass Key—that gleaming $500 Safe has your name taped right over the combination dial!'],
    ['GRANT_BELLAMY_MC', '🗝️ SAFE UNSEALED', 'One-turn Keyholder Priority belongs to you—tap the unlocked Safe next turn before {rival} gets near it!'],
    ['DON_PARDO_BOOTH', '🗝️ EXCLUSIVE VAULT ACCESS!', 'The brass safe key drops into your palm—one guarded turn to claim the $500 crown jewel!'],
    ['PETER_MARSHALL_WIT', '🗝️ VIP SAFE PASS!', 'Sorry, {rival}—velvet rope’s up around the $500 Safe until our challenger takes first crack!'],
    ['ART_FLEMING_HOST', '🗝️ SHIELDED $500 SAFE!', 'Clean key-capture! The gold shield rim protects the $500 Safe exclusively for your next turn!'],
    ['GRANT_BELLAMY_MC', '🗝️ TURN THE TUMBLER', 'You earned the sole Brass Key on the rack. Step up next turn and empty the $500 Safe!'],
  ]),

  ...buildLineBank('BLIND_MYSTERY_REVEAL', 'CERISE', [
    ['DON_PARDO_BOOTH', '🎭 MYSTERY PLAQUE REVEALED!', 'The gold shutter flips in Living Color—{category} stands revealed under the blind plaque!'],
    ['PETER_MARSHALL_WIT', '🎭 BEHIND THE QUESTION MARK!', 'Fearless leap into the dark! Under the blind shutter sits {category}—let’s cash it!'],
    ['ART_FLEMING_HOST', '🎭 SURPRISE PLAQUE LIVE!', 'Nothing beats a high-stakes mystery gamble—{category} locks onto the monitor, thirty seconds live!'],
    ['GRANT_BELLAMY_MC', '🎭 UNMASKED ON AIR', 'Courage rewarded under the spots—{category} springs from beneath the mystery shutter!'],
    ['DON_PARDO_BOOTH', '🎭 SHUTTER SNAPS OPEN!', 'Clack! The blind Trilon spins around to reveal {category}—bring that mystery purse home!'],
    ['PETER_MARSHALL_WIT', '🎭 PEEK-A-BOO DOLLARS!', 'Surprise! It’s {category} hiding under the question mark—hope you studied that shelf!'],
    ['ART_FLEMING_HOST', '🎭 BLIND PICK UNVEILED!', 'Bold board play—the concealed shutter clears and {category} takes center monitor!'],
    ['GRANT_BELLAMY_MC', '🎭 EYES WIDE OPEN', 'You bought the plaque sight unseen, challenger—now conquer {category} for prime-time cash!'],
  ]),

  ...buildLineBank('RIVAL_TURN_CALL', 'COBALT', [
    ['DON_PARDO_BOOTH', '📺 CHAMPION’S TURN', '{rival} steps up to {category} on the rack—{outcome}'],
    ['PETER_MARSHALL_WIT', '📺 AT THE CHAMPION’S DESK', 'Camera Two glides over to {rival} on {category}—{outcome}'],
    ['ART_FLEMING_HOST', '📺 RIVAL PLAY-BY-PLAY', '{rival} calls {category} off the Tote—{outcome}'],
    ['GRANT_BELLAMY_MC', '📺 LIVE COUNTER-MOVE', '{rival} makes a prime-time play on {category}—{outcome}'],
    ['DON_PARDO_BOOTH', '📺 PODIUM TWO LIVE', 'The spotlight swings right to {rival} in {category}—{outcome}'],
    ['PETER_MARSHALL_WIT', '📺 OVER TO PODIUM TWO', '{rival} adjusts the collar and aims at {category}—{outcome}'],
    ['ART_FLEMING_HOST', '📺 CHAMPION RESPONDS', 'Your rival fires back by tapping {category}—{outcome}'],
    ['GRANT_BELLAMY_MC', '📺 COUNTER-STRIKE', '{rival} answers the bell with {category}—{outcome}'],
    ['DON_PARDO_BOOTH', '📺 RIVAL ON THE CLOCK', 'Tally lamp crimson on Podium Two for {category}—{outcome}'],
    ['PETER_MARSHALL_WIT', '📺 WATCH THIS PICK', '{rival} walks straight up to {category} like they own the place—{outcome}'],
    ['ART_FLEMING_HOST', '📺 BOARD EXCHANGE', 'Control shifts across the stage as {rival} tries {category}—{outcome}'],
    ['GRANT_BELLAMY_MC', '📺 CHAMPION’S GAMBIT', '{rival} tests the waters in {category}—{outcome}'],
  ]),

  // ========= 14. UPGRADE #7 — KLAXON, YDKJ/QI WIT & REBOUND CALLS (50) ======
  ...buildLineBank('MYTH_KLAXON_TRAP', 'CERISE', [
    ['GRANT_BELLAMY_MC', '🚨 POPULAR MYTH KLAXON!', 'AWOOOOGA! Sound the Popular-Myth Klaxon—every barbershop in America swears that’s true, and every encyclopedia disagrees!'],
    ['PETER_MARSHALL_WIT', '🚨 FOLKLORE TRAP SPRUNG!', 'Clang-clang-clang! You stepped square into our writers’ juiciest urban-legend bear trap!'],
    ['DON_PARDO_BOOTH', '🚨 KLAXON ALERT · BUSTED!', 'RED BEACON FLASHING IN STUDIO 6A! Another classic schoolyard myth claims a prime-time victim!'],
    ['ART_FLEMING_HOST', '🚨 FAMOUS MISCONCEPTION!', 'Ah, the Popular-Myth Klaxon! Millions repeat that yarn at dinner parties, yet our Standards vault marks it bogus!'],
    ['GRANT_BELLAMY_MC', '🚨 URBAN LEGEND BITES!', 'Hear that submarine horn? That answer is 100% Grade-A cocktail-party fiction, challenger!'],
    ['PETER_MARSHALL_WIT', '🚨 GOTCHA BY THE KLAXON!', 'Don’t feel bad—three network vice presidents and my brother-in-law fell for that exact myth during rehearsal!'],
    ['DON_PARDO_BOOTH', '🚨 MYTH ALARM RINGING!', 'AWOOOOGA! Our research desk laid out the velvet bait and the Popular-Myth Klaxon collects again!'],
    ['ART_FLEMING_HOST', '🚨 OLD WIVES’ TALE TRAP!', 'So tempting, so widely quoted, and so thoroughly debunked—the Studio Klaxon takes a bow!'],
    ['GRANT_BELLAMY_MC', '🚨 SEDUCTIVE FICTION!', 'If sounding plausible paid cash, you’d own 30 Rock—alas, the Popular-Myth Klaxon knows better!'],
    ['PETER_MARSHALL_WIT', '🚨 PAGE ONE IN THE MYTH BOOK!', 'Put another notch on the Klaxon horn—that’s history’s most famous wrong answer in Living Color!'],
  ]),

  ...buildLineBank('WRONG_PICK_WIT', 'TANGERINE', [
    ['PETER_MARSHALL_WIT', '🎙️ SWING & A WINK', 'Spoken with the ringing authority of a senator—and just as allergic to the actual facts!'],
    ['GRANT_BELLAMY_MC', '🎙️ BOLDLY INCORRECT', 'Magnificent posture on the buzzer, challenger; tragic news from the sealed answer envelope!'],
    ['ART_FLEMING_HOST', '🎙️ CLOSE ONLY IN HORSESHOES', 'Our Standards judge admired your optimism in {category}, though the magnetic buzzer begged to differ!'],
    ['PETER_MARSHALL_WIT', '🎙️ WRONG ENVELOPE!', 'That would be a terrific answer to an entirely different question on Channel 9—shake it off!'],
    ['DON_PARDO_BOOTH', '🎙️ STUDIO BUZZER RASPS!', 'BRZZZT! Fifty million living rooms just yelled four different answers at the dog—regroup next pick!'],
    ['GRANT_BELLAMY_MC', '🎙️ NICE TRY, CHALLENGER', 'Ten points for panache under three hundred footcandles, zero dollars from our stingy accounting desk!'],
    ['PETER_MARSHALL_WIT', '🎙️ TOUGH BREAK ON {category}!', 'Oof—even our cue-card fellow winced, and he’s holding the answers upside down!'],
    ['ART_FLEMING_HOST', '🎙️ SLIPPED PAST THE CHIME', 'Tricky distractor in {category}! File that factoid away and ambush {rival} on the bounce!'],
    ['GRANT_BELLAMY_MC', '🎙️ DRY HOLE ON THE TOTE', 'Confident thumb, theatrical pause, wrong button—fortunately ten turns leave plenty of runway!'],
    ['PETER_MARSHALL_WIT', '🎙️ PAGING ENCYCLOPEDIA!', 'Somewhere a high-school teacher just spilled hot Sanka on the ottoman—steal the momentum right back!'],
  ]),

  ...buildLineBank('DIAL_NEAR_MISS_PRAISE', 'EMERALD', [
    ['ART_FLEMING_HOST', '🎯 RAZOR-SHARP CALIBRATION!', 'Within a coat of lacquer of the dead-center bullseye—superb Range Dial touch under studio lights!'],
    ['GRANT_BELLAMY_MC', '🎯 PRECISION INSTRUMENT!', 'Our Swiss watchmaker in Booth A just whistled—you parked that needle right inside the money band!'],
    ['PETER_MARSHALL_WIT', '🎯 SHAVED IT CLOSE!', 'Couldn’t slip a subway token between your pointer and the exact mark—sweet estimation!'],
    ['DON_PARDO_BOOTH', '🎯 RIGHT IN THE GREEN ZONE!', 'THE RANGE BAND LIGHTS EMERALD! Calibrated like a Cape Canaveral flight engineer in Living Color!'],
    ['ART_FLEMING_HOST', '🎯 DEAD-EYE ESTIMATE!', 'Ninety-plus percent accuracy on the dial! That’s how seasoned pros turn tough numbers into cash!'],
    ['GRANT_BELLAMY_MC', '🎯 VELVET THUMB ON THE DIAL', 'Barely a whisker off the pinpoint number—Standards & Practices happily pays out on that craft!'],
    ['PETER_MARSHALL_WIT', '🎯 PRICE-TAG WIZARDRY!', 'Have you been weighing groceries by hand? That dial needle stopped right beside the gold star!'],
    ['DON_PARDO_BOOTH', '🎯 PINPOINT STUDIO GAUGE!', 'Ding! That’s jewel-bearing accuracy on {category}—{rival} didn’t expect math that tight!'],
    ['ART_FLEMING_HOST', '🎯 MICROMETER TOUCH!', 'Steady wrist, eagle eye—parking the dial that close to true north earns prime-time applause!'],
    ['GRANT_BELLAMY_MC', '🎯 CALCULATED TO A HAIR', 'Not a wild guess in sight—pure analytical poise right inside our green tolerance arc!'],
  ]),

  ...buildLineBank('QUICK_DRAW_STAMP', 'GOLD', [
    ['DON_PARDO_BOOTH', '⚡ QUICK-DRAW BUZZER!', 'BLINK AND YOU MISSED IT! Locked in under three seconds before the studio clock barely ticked!'],
    ['GRANT_BELLAMY_MC', '⚡ LIGHTNING AT PODIUM ONE!', 'Fastest thumb on Sixth Avenue—our brass section nearly choked on their mouthpieces trying to keep up!'],
    ['PETER_MARSHALL_WIT', '⚡ SMOKE OFF THE BUTTON!', 'Careful, you’ll melt the Acrylite! Answered {category} before our boom-mic guy found first gear!'],
    ['ART_FLEMING_HOST', '⚡ INSTANT RECALL!', 'Sub-three-second reflex! Nothing rattles {rival} faster than a challenger firing off the hip!'],
    ['DON_PARDO_BOOTH', '⚡ SNAPSHOT BULLSEYE!', 'BAM—DING! That Quick-Draw lock-in echoed from 30 Rock straight to Burbank in record time!'],
    ['GRANT_BELLAMY_MC', '⚡ ZERO HESITATION', 'Ice-cold reflex under hot lamps—you knew {category} before I finished clearing my throat!'],
    ['PETER_MARSHALL_WIT', '⚡ SPEED LIMIT BROKEN!', 'Call the highway patrol—Podium One just clocked a sub-three-second Quick-Draw in Living Color!'],
    ['ART_FLEMING_HOST', '⚡ HAIR-TRIGGER CHIME!', 'Textbook buzzer speed! Quick-Draw answers keep the tempo brisk and the Champion on their heels!'],
    ['DON_PARDO_BOOTH', '⚡ ELECTRIC THUMB SPEED!', 'The solenoid bell barely had time to coil its spring—instant Quick-Draw strike on {category}!'],
    ['GRANT_BELLAMY_MC', '⚡ PURE REFLEX GOLD', 'Sharp mind, quicker finger—that’s how five-week champions command the eight o’clock hour!'],
  ]),

  ...buildLineBank('REBOUND_POT_SCOOP', 'EMERALD', [
    ['DON_PARDO_BOOTH', '💰 REBOUND POT SCOOPED!', 'SWOOP AND COLLECT! You emptied the glowing +{rebound} Studio Rebound Pot straight into your bankroll!'],
    ['PETER_MARSHALL_WIT', '💰 FINDERS KEEPERS · +{rebound}!', 'Thank you very much! {rival} left +{rebound} sitting in the center pot and you vacuumed every cent!'],
    ['ART_FLEMING_HOST', '💰 +{rebound} POT CLAIMED!', 'Opportunistic quiz play! Nailing that clue sweeps the entire +{rebound} Studio Rebound Pot home!'],
    ['GRANT_BELLAMY_MC', '💰 CENTER POT SWEPT CLEAN', 'Never leave loose bullion on the stage apron—+{rebound} Rebound Pot added to your Split-Flap!'],
    ['DON_PARDO_BOOTH', '💰 EXTRA +{rebound} WINDFALL!', 'Clack-clack-clack! The glowing Rebound Pot pours +{rebound} bonus dollars onto Podium One!'],
    ['PETER_MARSHALL_WIT', '💰 CLEANUP ON AISLE SIX!', 'One rival miss, one sharp challenger, and +{rebound} vanishes from the center pot into your pocket!'],
    ['ART_FLEMING_HOST', '💰 SWEETENED BY +{rebound}!', 'That’s two wins in one swing—base plaque dollars plus the +{rebound} Studio Rebound Pot!'],
    ['GRANT_BELLAMY_MC', '💰 THE HOUSE POT PAYS OUT', 'Poise pays extra dividends tonight—+{rebound} from the Rebound Pot certified to your purse!'],
    ['DON_PARDO_BOOTH', '💰 JACKPOT ON THE BOUNCE!', 'Emerald lamps flashing! You cashed {category} and scooped the +{rebound} Rebound Pot clean!'],
    ['PETER_MARSHALL_WIT', '💰 ROBBERY IN BROAD DAYLIGHT!', 'Legal in all fifty states—snatching +{rebound} out of the Rebound Pot while {rival} watches!'],
  ]),
];

const DAILY_BROADCAST_KICKOFF_LINES_V7: readonly StudioAnnouncerLineSpecV7[] = buildLineBank(
  'EPISODE_KICKOFF',
  'GOLD',
  [
    ['DON_PARDO_BOOTH', 'DAILY BROADCAST · LIVE!', 'Coast to coast on {episode}! Every living room in America plays this exact board—set the pace!', 'GOLD'],
    ['ART_FLEMING_HOST', 'NATIONWIDE DAILY BOARD!', 'Welcome to {episode}! Same categories, same twists for every player—clock a sharp shareable run!', 'PEACOCK'],
    ['PETER_MARSHALL_WIT', 'DAILY 1966 SHOWDOWN!', 'One global seed on {episode}—beat {rival} cleanly and send your retro TV scorecard to the whole block!', 'CERISE'],
    ['GRANT_BELLAMY_MC', 'TODAY’S GLOBAL BROADCAST', 'Eight o’clock sharp for {episode}. One unified board from Bangor to Burbank—keep your streak alive.', 'GOLD'],
    ['DON_PARDO_BOOTH', 'DAILY STREAK ON THE LINE!', 'Marquee lights blazing for {episode}! Outbank {rival} to extend your Daily Broadcast winning streak!', 'TANGERINE'],
    ['ART_FLEMING_HOST', 'ONE BOARD · ONE SHOT!', 'No rehearsals on {episode}—read the board twists fast and climb to the top of today’s Daily tally!', 'PEACOCK'],
    ['PETER_MARSHALL_WIT', 'WATERCOOLER CHALLENGE!', 'Tomorrow’s office bragging rights ride on {episode}—step up and show {rival} how it’s done!', 'GOLD'],
    ['GRANT_BELLAMY_MC', 'LIVE NATIONAL EDITION', 'All fifty states share tonight’s {episode} rack. Make every Trilon count and earn your Daily stamp.', 'COBALT'],
  ],
  'daily',
);

// ----------------------------------------------------------------------------
// 4. Scoped 1966 Diagonal Lower-Third Chyron Stylesheet (Zero AI Boxes!)
// ----------------------------------------------------------------------------

const ANNOUNCER_STYLE_ELEMENT_ID = 'ws7-studio-announcer-1966-styles';

const ANNOUNCER_SCOPED_CSS = `
/* ============================================================================
   1966 DIAGONAL LOWER-THIRD BROADCAST CHYRON ("OPTICAL SUPER")
   Saul Bass / Morton Goldsholl / NBC Living Color Asymmetric Parallelogram
   100% Non-Interactive (pointer-events: none) · Zero SaaS Rectangular Boxes
   ============================================================================ */

.ws7-announcer-stage {
  position: fixed;
  left: calc(env(safe-area-inset-left, 0px) + 12px);
  right: calc(env(safe-area-inset-right, 0px) + 12px);
  bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  z-index: 47;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  pointer-events: none !important;
  user-select: none;
}

.ws7-announcer-stage * {
  pointer-events: none !important;
  box-sizing: border-box;
}

.ws7-announcer-stage[data-hidden='true'] {
  display: none !important;
}

/* Smoothly duck the idle board-mode pill while the live Studio Announcer speaks
   so the bottom 8–12% safe zone NEVER stacks two ribbons or brushes 3D tiles! */
body:has(.ws7-announcer-stage[data-hidden='false']) .ws7-board-mode-ribbon,
body:has(.ws7-announcer-stage[data-hidden='false']) .ws7-board-mode-banner {
  opacity: 0 !important;
  transition: opacity 0.18s ease-out;
}

/* When Question Monitor is open, tuck tighter to bottom edge with lower z-index
   or compact footprint so A/B/C/D buttons are NEVER obstructed! */
.ws7-announcer-stage[data-phase='QUESTION_OPEN'] {
  bottom: calc(env(safe-area-inset-bottom, 0px) + 6px);
  z-index: 45;
}

.ws7-announcer-ribbon {
  --ws7-chyron-accent: #0096a6;
  --ws7-chyron-accent-bright: #0096a6;
  --ws7-chyron-kicker-ink: #0b1d30;
  position: relative;
  max-width: min(690px, 95vw);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  filter: drop-shadow(0 10px 24px rgba(11, 29, 48, 0.68));
  transform-origin: left bottom;
  opacity: 0;
  transform: translate3d(-22px, 6px, 0);
  transition:
    opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
}

.ws7-announcer-ribbon[data-state='enter'],
.ws7-announcer-ribbon[data-state='visible'] {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.ws7-announcer-ribbon[data-state='exit'] {
  opacity: 0;
  transform: translate3d(12px, 5px, 0);
  transition:
    opacity 0.28s ease-out,
    transform 0.28s ease-out;
}

/* Tone Palettes — Unified 1966 Living Color (#0B1D30, #F7EEDB, #0096A6, #F4A91F, #FF6738, #1E56C5, #E63B7A) */
.ws7-announcer-ribbon[data-tone='PEACOCK'] {
  --ws7-chyron-accent: #0096a6;
  --ws7-chyron-accent-bright: #0096a6;
  --ws7-chyron-kicker-ink: #f7eedb;
}

.ws7-announcer-ribbon[data-tone='GOLD'] {
  --ws7-chyron-accent: #f4a91f;
  --ws7-chyron-accent-bright: #f4a91f;
  --ws7-chyron-kicker-ink: #0b1d30;
}

.ws7-announcer-ribbon[data-tone='TANGERINE'] {
  --ws7-chyron-accent: #ff6738;
  --ws7-chyron-accent-bright: #ff6738;
  --ws7-chyron-kicker-ink: #f7eedb;
}

.ws7-announcer-ribbon[data-tone='EMERALD'] {
  --ws7-chyron-accent: #18a957;
  --ws7-chyron-accent-bright: #18a957;
  --ws7-chyron-kicker-ink: #f7eedb;
}

.ws7-announcer-ribbon[data-tone='CERISE'] {
  --ws7-chyron-accent: #e63b7a;
  --ws7-chyron-accent-bright: #e63b7a;
  --ws7-chyron-kicker-ink: #f7eedb;
}

.ws7-announcer-ribbon[data-tone='COBALT'] {
  --ws7-chyron-accent: #1e56c5;
  --ws7-chyron-accent-bright: #1e56c5;
  --ws7-chyron-kicker-ink: #f7eedb;
}

/* Top Diagonal Kicker Blade (Saul Bass Parallelogram — NO rounded SaaS pill!) */
.ws7-announcer-kicker-row {
  display: inline-flex;
  align-items: stretch;
  margin-left: 8px;
  margin-bottom: -2px;
  z-index: 2;
}

.ws7-announcer-kicker-blade {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 16px 4px 13px;
  background: var(--ws7-chyron-accent);
  color: var(--ws7-chyron-kicker-ink);
  clip-path: polygon(7px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
  font-family: 'Michroma', 'Jost', sans-serif;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
}

.ws7-announcer-speaker-blade {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px 4px 11px;
  margin-left: -4px;
  background: linear-gradient(180deg, #6E3B23 0%, #4E2714 100%);
  color: #FFE48F;
  clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
  font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
}

/* Main Diagonal Lower-Third Sunlit Broadcast Cream & Brass Super Blade */
.ws7-announcer-body-blade {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 26px 10px 16px;
  background: linear-gradient(
    98deg,
    rgba(255, 253, 247, 0.98) 0%,
    rgba(250, 242, 223, 0.97) 78%,
    rgba(242, 228, 198, 0.96) 100%
  );
  border-top: 2px solid #D9A441;
  border-bottom: 2px solid #6E3B23;
  box-shadow: 0 10px 26px rgba(52, 24, 10, 0.34);
  clip-path: polygon(11px 0, 100% 0, calc(100% - 15px) 100%, 0 100%);
}

/* Leading Diagonal Living Color Fin */
.ws7-announcer-body-blade::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 7px;
  background: var(--ws7-chyron-accent);
}

/* Expressive 1966 Illustrated TV Emcee Portrait Medallion (100% pointer-events: none) */
.ws7-announcer-emcee-medallion {
  position: relative;
  width: 50px;
  height: 50px;
  min-width: 50px;
  border-radius: 50%;
  background-color: #F5E9CE;
  background-repeat: no-repeat;
  background-size: 200% 200%;
  background-position: 0% 0%;
  border: 2.5px solid #6E3B23;
  box-shadow:
    0 3px 10px rgba(74, 36, 18, 0.28),
    0 0 0 2px #D9A441;
  flex-shrink: 0;
  overflow: hidden;
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.ws7-announcer-emcee-medallion[data-mood='GASP'] {
  transform: scale(1.06) rotate(-3deg);
  border-color: #ff6738;
}

.ws7-announcer-emcee-medallion[data-mood='WINK'] {
  transform: rotate(2deg);
}

.ws7-announcer-emcee-medallion[data-mood='INTENSE'] {
  border-color: #ffd166;
  box-shadow:
    0 0 14px rgba(244, 169, 31, 0.55),
    0 0 0 2px var(--ws7-chyron-accent);
}

.ws7-announcer-emcee-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ws7-announcer-mic-emblem {
  position: absolute;
  right: -4px;
  bottom: -3px;
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 50%;
  background: #6E3B23;
  border: 1.5px solid #FFD166;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #FFD166;
  filter: drop-shadow(0 1px 4px rgba(58, 28, 12, 0.55));
}

.ws7-announcer-mic-emblem svg {
  width: 12px;
  height: 12px;
}

/* Bottom 3px 1966 Living Color Optical Spectrum Rule */
.ws7-announcer-spectrum-rule {
  width: calc(100% - 14px);
  height: 3px;
  margin-left: 2px;
  background: linear-gradient(
    90deg,
    #0096a6 0%,
    #1e56c5 24%,
    #e63b7a 48%,
    #ff6738 74%,
    #f4a91f 92%,
    rgba(244, 169, 31, 0) 100%
  );
  transform-origin: left center;
  animation: ws7ChyronRuleWipe 0.36s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.ws7-announcer-copy {
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Jost', sans-serif;
  font-size: clamp(15px, 1.55vw, 18px);
  font-weight: 800;
  line-height: 1.32;
  letter-spacing: 0.005em;
  color: #141B29;
  word-break: normal;
  overflow-wrap: normal;
  hyphens: none;
  text-shadow: none;
}

@keyframes ws7ChyronRuleWipe {
  from {
    transform: scaleX(0.08);
    opacity: 0.4;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

/* Mobile Portrait Optimization (360x640 .. 430x932): Sleek, full-legibility, zero ellipsis */
@media (max-width: 720px) {
  .ws7-announcer-stage {
    left: calc(env(safe-area-inset-left, 0px) + 8px);
    right: calc(env(safe-area-inset-right, 0px) + 8px);
    bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
    justify-content: center;
  }

  .ws7-announcer-ribbon {
    width: 100%;
    max-width: 440px;
  }

  .ws7-announcer-speaker-blade {
    display: none;
  }

  .ws7-announcer-body-blade {
    width: 100%;
    padding: 7px 16px 7px 13px;
    gap: 10px;
    clip-path: polygon(8px 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
  }

  .ws7-announcer-emcee-medallion {
    width: 42px;
    height: 42px;
    min-width: 42px;
  }

  .ws7-announcer-copy {
    font-size: 14.5px;
    line-height: 1.26;
  }
}

/* Compact Mobile Portrait (360x640 .. 390x660): Tighter lower-third blade clearing Row 5 */
@media (max-width: 520px) and (max-height: 700px) {
  .ws7-announcer-stage {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 5px);
  }

  .ws7-announcer-kicker-blade {
    padding: 2px 12px 2px 10px;
    font-size: 14px;
  }

  .ws7-announcer-body-blade {
    padding: 5px 14px 5px 11px;
    gap: 8px;
  }

  .ws7-announcer-emcee-medallion {
    width: 38px;
    height: 38px;
    min-width: 38px;
  }

  .ws7-announcer-copy {
    font-size: 14px;
    line-height: 1.2;
  }
}

/* Mobile Landscape (844x390): Ultra-slim 34px centered chyron clearing bottom 3D board bezel */
@media (max-height: 480px) and (orientation: landscape) {
  .ws7-announcer-stage {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 2px);
    left: calc(env(safe-area-inset-left, 0px) + 10px);
    right: calc(env(safe-area-inset-right, 0px) + 10px);
    justify-content: center;
  }

  .ws7-announcer-ribbon {
    max-width: min(680px, 88vw);
    flex-direction: row;
    align-items: center;
  }

  .ws7-announcer-speaker-blade,
  .ws7-announcer-kicker-blade,
  .ws7-announcer-spectrum-rule {
    display: none;
  }

  .ws7-announcer-body-blade {
    padding: 3px 14px 3px 10px;
    gap: 8px;
  }

  .ws7-announcer-emcee-medallion {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }

  .ws7-announcer-mic-emblem {
    display: none;
  }

  .ws7-announcer-copy {
    font-size: 13px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
  }
}

/* High Contrast & Reduced Motion Accessibility */
.ws7-announcer-stage[data-high-contrast='true'] .ws7-announcer-body-blade {
  background: #07111e;
}

.ws7-announcer-stage[data-high-contrast='true'] .ws7-announcer-copy {
  color: #ffffff;
}

.ws7-announcer-stage[data-reduced-motion='true'] .ws7-announcer-ribbon,
.ws7-announcer-stage[data-reduced-motion='true'] .ws7-announcer-spectrum-rule {
  animation: none !important;
  transition: opacity 0.15s linear !important;
  transform: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .ws7-announcer-ribbon,
  .ws7-announcer-spectrum-rule {
    animation: none !important;
    transition: opacity 0.15s linear !important;
    transform: none !important;
  }
}
`;

function ensureAnnouncerStylesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ANNOUNCER_STYLE_ELEMENT_ID)) return;
  const styleEl = document.createElement('style');
  styleEl.id = ANNOUNCER_STYLE_ELEMENT_ID;
  styleEl.textContent = ANNOUNCER_SCOPED_CSS;
  document.head.appendChild(styleEl);
}

function renderPersonaGlyphSvg(kind: 'MIC' | 'STAR' | 'CROWN' | 'BOLT'): string {
  switch (kind) {
    case 'MIC':
      // 1966 RCA 44-BX Studio Ribbon Microphone silhouette
      return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 16 5.5 16 12.5 12 16 8 12.5 8 5.5 12 2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="10.5" x2="16" y2="10.5"/><path d="M5 10.5a7 7 0 0 0 14 0"/><line x1="12" y1="17.5" x2="12" y2="21.5"/><line x1="8.5" y1="21.5" x2="15.5" y2="21.5"/></svg>`;
    case 'STAR':
      // 1966 NBC/Goodson Atomic 8-Point Starburst
      return `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 1.5l2.4 6.6 6.6-2.4-2.4 6.3 6.4 2.4-6.4 2.4 2.4 6.3-6.6-2.4L12 22.5l-2.4-6.6-6.6 2.4 2.4-6.3L1 9.6l6.4-2.4-2.4-6.3 6.6 2.4L12 1.5z"/></svg>`;
    case 'CROWN':
      // Sovereign Network Crest
      return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M3 18h18l-2-11-5 4-2-6-2 6-5-4-2 11z"/><line x1="3" y1="21" x2="21" y2="21"/></svg>`;
    case 'BOLT':
      return `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2"/></svg>`;
  }
}

/**
 * Crisp 1966 Saul Bass Emcee Brass Studio Mic & Tuxedo Bow-Tie Medallion SVG fallback
 * while Grant Bellamy's painted 2x2 gouache portrait sheet loads.
 * ZERO cartoon faces/eyes/mouths — pure Mid-Century broadcast prop heraldry!
 */
export function buildEmceeMonogramSvgDataUriV7(mood: EmceeMoodV7 = 'POISED'): string {
  const palette =
    mood === 'GASP'
      ? { bg: '#34130A', ring: '#FF6738', star: '#FFD166', tilt: 'rotate(-8 48 48)' }
      : mood === 'INTENSE'
        ? { bg: '#2B1120', ring: '#FFD166', star: '#E63B7A', tilt: 'rotate(7 48 48)' }
        : mood === 'WINK'
          ? { bg: '#231A09', ring: '#F4A91F', star: '#FFD166', tilt: 'rotate(5 48 48)' }
          : { bg: '#0C233A', ring: '#0096A6', star: '#F4A91F', tilt: '' };
  const micGroup =
    '<rect x="38" y="18" width="20" height="32" rx="10" fill="#F4A91F" stroke="#0B1D30" stroke-width="2.5"/>' +
    '<line x1="40" y1="28" x2="56" y2="28" stroke="#0B1D30" stroke-width="2"/>' +
    '<line x1="39" y1="35" x2="57" y2="35" stroke="#0B1D30" stroke-width="2"/>' +
    '<line x1="40" y1="42" x2="56" y2="42" stroke="#0B1D30" stroke-width="2"/>' +
    '<path d="M31 36 C31 55 65 55 65 36" fill="none" stroke="#F7EEDB" stroke-width="3" stroke-linecap="round"/>' +
    '<line x1="48" y1="52" x2="48" y2="66" stroke="#F7EEDB" stroke-width="3.5"/>' +
    '<polygon points="31,62 48,70 31,78" fill="#0B1D30" stroke="#F4A91F" stroke-width="2"/>' +
    '<polygon points="65,62 48,70 65,78" fill="#0B1D30" stroke="#F4A91F" stroke-width="2"/>' +
    '<circle cx="48" cy="70" r="4.5" fill="#F4A91F" stroke="#0B1D30" stroke-width="1.5"/>';
  const wrapped = palette.tilt ? `<g transform="${palette.tilt}">${micGroup}</g>` : micGroup;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">` +
    `<rect width="96" height="96" fill="${palette.bg}"/>` +
    `<polygon points="48,6 54,34 82,20 62,44 90,48 62,52 82,76 54,62 48,90 42,62 14,76 34,52 6,48 34,44 14,20 42,34" fill="${palette.star}" fill-opacity="0.22"/>` +
    `<circle cx="48" cy="48" r="44" fill="none" stroke="${palette.ring}" stroke-width="4"/>` +
    wrapped +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ----------------------------------------------------------------------------
// 5. Formatting, Orphan Prevention & Catalog Verification Helpers
// ----------------------------------------------------------------------------

function formatDollarsV7(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  return `$${abs.toLocaleString('en-US')}`;
}

function preventOrphanWord(text: string): string {
  const trimmed = text.trim();
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace <= 0 || lastSpace >= trimmed.length - 1) return trimmed;
  return `${trimmed.slice(0, lastSpace)}\u00A0${trimmed.slice(lastSpace + 1)}`;
}

const BROKER_DOSSIER_FALLBACKS_V8: Record<
  BrokerIdV7,
  Omit<ChampionTvGuideCloseUpV7, 'tvGuideListing'>
> = {
  GRANT_BELLAMY: {
    greenRoomDossier:
      'Checked his gold cufflinks in Camera One’s lens hood while privately signaling Control Booth A to keep the Penthouse elevator locked.',
    dossierHintStrong:
      'Effortless command of silver-screen lore, royal dynasties, classic literature, and hit-parade standards.',
    dossierHintWeak:
      'Leaves everyday checkout prices, world maps, wire headlines, and slippery logic traps to his writers.',
  },
  ROZ_KORMAN: {
    greenRoomDossier:
      'Stacked three wax-sealed canary sponsor envelopes beside the master switcher and warned the stage manager to protect the eight o’clock share.',
    dossierHintStrong:
      'Lethal Madison Avenue fluency in high finance, retail markups, and house probabilities.',
    dossierHintWeak:
      'Dismisses hospital triage charts, fireside folklore, and lab physics as low-rating dead air.',
  },
  VERA_KARP: {
    greenRoomDossier:
      'Calibrated two brass Standards & Practices stopwatches against the master studio clock and logged every voltage spike under Podium Two.',
    dossierHintStrong:
      'Sleepless investigator’s grip on logical fallacies, front-page wire records, and precision vocabulary.',
    dossierHintWeak:
      'Spends zero off-duty hours around jukebox singles, stadium box scores, or Hollywood gossip.',
  },
};

function isRivalIdInVoiceKitsV8(id: CastIdV7 | undefined): id is RivalIdV7 {
  return Boolean(id && Object.prototype.hasOwnProperty.call(CHAMPION_VOICE_KITS_V7, id));
}

export function getChampionTvGuideCloseUpV7(castId: CastIdV7): ChampionTvGuideCloseUpV7 {
  const tvGuideListing =
    CAST_TV_GUIDE_BIOS_V7[castId] ?? CAST_PROFILES_V7[castId]?.bio ?? '';
  if (isRivalIdInVoiceKitsV8(castId)) {
    const kit: ChampionVoiceKitV7 = CHAMPION_VOICE_KITS_V7[castId];
    return {
      tvGuideListing,
      dossierHintStrong: kit.dossierHintStrong,
      dossierHintWeak: kit.dossierHintWeak,
      greenRoomDossier: kit.greenRoomDossier,
    };
  }
  const brokerFallback =
    BROKER_DOSSIER_FALLBACKS_V8[castId as BrokerIdV7] ?? BROKER_DOSSIER_FALLBACKS_V8.GRANT_BELLAMY;
  return {
    tvGuideListing,
    ...brokerFallback,
  };
}

export function interpolateAnnouncerTemplateV7(
  template: string,
  ctx: AnnouncerContextV7 = {},
): string {
  const rivalId: CastIdV7 | undefined = ctx.rivalId ?? ctx.blueprint?.rivalId;
  const rivalName =
    ctx.rivalName ??
    (rivalId && SPOKEN_CAST_NAMES_V7[rivalId] ? SPOKEN_CAST_NAMES_V7[rivalId] : 'the Champion');

  const stageId = ctx.stageId ?? ctx.blueprint?.stageId;
  const stageName =
    stageId && SPOKEN_STAGE_NAMES_V7[stageId]
      ? SPOKEN_STAGE_NAMES_V7[stageId]
      : 'Studio 6A';

  const categoryName = ctx.category
    ? SPOKEN_CATEGORY_NAMES_V7[ctx.category] ?? ctx.category
    : 'that square';

  const playerCash = ctx.playerCash ?? 0;
  const rivalCash = ctx.rivalCash ?? 0;
  const diff = Math.abs(playerCash - rivalCash);
  const hasExplicitCashDelta =
    typeof ctx.cashDelta === 'number' &&
    Number.isFinite(ctx.cashDelta) &&
    Math.round(Math.abs(ctx.cashDelta)) > 0;
  const absCashDelta = hasExplicitCashDelta ? Math.round(Math.abs(ctx.cashDelta!)) : 0;

  const reboundBonus =
    typeof ctx.reboundBonus === 'number' && Number.isFinite(ctx.reboundBonus) && ctx.reboundBonus > 0
      ? Math.round(ctx.reboundBonus)
      : 50;

  const resolvedDailyNum = (() => {
    if (
      typeof ctx.dailyEpisodeNumber === 'number' &&
      Number.isFinite(ctx.dailyEpisodeNumber) &&
      ctx.dailyEpisodeNumber >= 1
    ) {
      return Math.floor(ctx.dailyEpisodeNumber);
    }
    const bpDaily = (ctx.blueprint as { dailyNumber?: number } | undefined)?.dailyNumber;
    if (typeof bpDaily === 'number' && Number.isFinite(bpDaily) && bpDaily >= 1) {
      return Math.floor(bpDaily);
    }
    if (
      typeof ctx.blueprint?.episodeNumber === 'number' &&
      Number.isFinite(ctx.blueprint.episodeNumber) &&
      ctx.blueprint.episodeNumber >= 1
    ) {
      return Math.floor(ctx.blueprint.episodeNumber);
    }
    const codeMatch = ctx.blueprint?.code ? /#\s*(\d+)/.exec(ctx.blueprint.code) : null;
    if (codeMatch) {
      return Math.max(1, Number.parseInt(codeMatch[1], 10));
    }
    return computeDailyEpisodeNumberV7();
  })();
  const episodeLabel = ctx.isDailyBroadcast
    ? `Daily Broadcast #${resolvedDailyNum}`
    : ctx.blueprint?.code ?? 'Tonight’s Broadcast';

  let working = template;

  // 1. Safe {cash} handling — NEVER renders "$0", "-$300", or "$0 wipeout!"
  if (working.includes('{cash}')) {
    if (hasExplicitCashDelta) {
      working = working.replace(/\{cash\}/g, formatDollarsV7(absCashDelta));
    } else {
      const looksLikeZonk =
        /wipeout|Zonk|test pattern|Monoscope|carrier|static|blackout|fault|fined|cost me|ate \{cash\}|stole \{cash\}|raked \{cash\}|sacrificed \{cash\}|liquidated \{cash\}|incinerated \{cash\}|shattered.*\{cash\}|dent me for \{cash\}|vandalized.*\{cash\}/i.test(
          working,
        );
      if (looksLikeZonk) {
        working = working
          .replace(/for a \{cash\} wipeout/gi, 'for a brutal Studio Gremlin wipeout')
          .replace(/a painful \{cash\} Zonk/gi, 'a brutal Studio Gremlin wipeout')
          .replace(/eating \{cash\}/gi, 'unleashing a brutal Studio Gremlin wipeout')
          .replace(/wiped \{cash\} clean off my box score/gi, 'triggered a brutal Studio Gremlin wipeout')
          .replace(/wiped \{cash\}/gi, 'triggered a brutal Studio Gremlin wipeout')
          .replace(/wipes \{cash\} off the Split-Flap/gi, 'triggers a brutal Studio Gremlin wipeout')
          .replace(/torched \{cash\} off my billings/gi, 'dealt a brutal Studio Gremlin wipeout')
          .replace(/torched \{cash\}/gi, 'dealt a brutal Studio Gremlin wipeout')
          .replace(/trimmed \{cash\}/gi, 'dealt a brutal Studio Gremlin wipeout')
          .replace(/swallowed \{cash\} whole/gi, 'dealt a brutal Studio Gremlin wipeout')
          .replace(/clipped \{cash\} off the ledger/gi, 'dealt a brutal Studio Gremlin wipeout')
          .replace(
            /\{cash\} evaporating into a prime-time test pattern/gi,
            'a brutal Studio Gremlin wipeout flashing across the screen',
          )
          .replace(/AND \{cash\}/g, 'in a brutal Studio Gremlin wipeout')
          .replace(/\{cash\} vanished/gi, 'a brutal Studio Gremlin wipeout struck')
          .replace(/for \{cash\}/gi, 'with a brutal Studio Gremlin wipeout')
          .replace(/\{cash\}/g, 'a brutal Studio Gremlin wipeout');
      } else if (playerCash > 0) {
        working = working.replace(/\{cash\}/g, formatDollarsV7(playerCash));
      } else {
        working = working
          .replace(/\{cash\} richer/gi, 'richer in broadcast cash')
          .replace(/for \{cash\}/gi, 'for prime-time cash')
          .replace(/\{cash\}/g, 'prime-time cash');
      }
    }
  }

  // 2. Safe {outcome} handling — NEVER renders "—Big Broadcast Cash!" or mid-sentence "! on"
  if (working.includes('{outcome}')) {
    const rawOutcome = (ctx.outcomeLabel ?? '').trim();
    const isTerminalOutcome = /\{outcome\}\s*$/.test(working);
    const looksLikeScouting = /dossier|notebook|logged|scouting|tell/i.test(working);
    if (rawOutcome.length > 0) {
      const stripped = rawOutcome.replace(/[.!?]+$/g, '').trim();
      const replacement = isTerminalOutcome ? `${stripped}!` : stripped;
      working = working.replace(/\{outcome\}/g, replacement);
    } else if (isTerminalOutcome) {
      const fallbackClause = hasExplicitCashDelta
        ? `banks ${formatDollarsV7(absCashDelta)} clean on Podium Two!`
        : 'locks that square onto Podium Two!';
      working = working.replace(/—\s*\{outcome\}\s*$/, ` — ${fallbackClause}`).replace(/\{outcome\}/g, fallbackClause);
    } else if (looksLikeScouting) {
      const scoutPhrase =
        ctx.scoutKind === 'STRONG' ? 'a trademark Strong Turf' : 'a telltale Weak Spot';
      working = working.replace(/\{outcome\}/g, scoutPhrase);
    } else {
      const midPhrase = hasExplicitCashDelta
        ? formatDollarsV7(absCashDelta)
        : 'a top-dollar jackpot wedge';
      working = working.replace(/\{outcome\}/g, midPhrase);
    }
  }

  // 3. Safe {spins} handling — NEVER fabricates "2" when spinsCount is omitted, singularizes "1 spin"
  if (working.includes('{spins}')) {
    const validSpins =
      typeof ctx.spinsCount === 'number' &&
      Number.isFinite(ctx.spinsCount) &&
      Math.round(ctx.spinsCount) > 0
        ? Math.round(ctx.spinsCount)
        : null;
    if (validSpins !== null) {
      working = working.replace(/\{spins\}/g, String(validSpins));
      if (validSpins === 1) {
        working = working
          .replace(/\b1 ((?:[\w-]+\s+){0,3})spins\b/gi, '1 $1spin')
          .replace(/\b1 ((?:[\w-]+\s+){0,3})drops\b/gi, '1 $1drop');
      }
    } else {
      working = working
        .replace(/Passing \{spins\} spins/gi, 'Passing those live spins')
        .replace(/\{spins\} spins/gi, 'those live spins')
        .replace(/\{spins\} live/gi, 'those live')
        .replace(/\{spins\} /g, 'those ')
        .replace(/\{spins\}/g, 'live');
    }
  }

  const rendered = working
    .replace(/\{rival\}/g, rivalName)
    .replace(/\{stage\}/g, stageName)
    .replace(/\{category\}/g, categoryName)
    .replace(/\{playerCash\}/g, formatDollarsV7(playerCash))
    .replace(/\{rivalCash\}/g, formatDollarsV7(rivalCash))
    .replace(/\{rebound\}/g, formatDollarsV7(reboundBonus))
    .replace(/\{lead\}/g, formatDollarsV7(Math.max(10, diff)))
    .replace(/\{gap\}/g, diff === 0 ? 'a dead-even tie' : formatDollarsV7(diff))
    .replace(/\{streak\}/g, String(Math.max(2, ctx.streak ?? 2)))
    .replace(/\{turn\}/g, String(ctx.turnNumber ?? 9))
    .replace(/\{episode\}/g, episodeLabel)
    .replace(/!{2,}/g, '!')
    .replace(/!\./g, '!')
    .replace(/\s{2,}/g, ' ');

  return preventOrphanWord(rendered);
}

export interface AnnouncerCatalogStatsV7 {
  readonly totalLines: number;
  readonly uniqueIds: number;
  readonly uniqueTemplates: number;
  readonly countsByEvent: Readonly<Record<AnnouncerEventIdV7, number>>;
  readonly valid: boolean;
}

export function getAnnouncerCatalogStatsV7(): AnnouncerCatalogStatsV7 {
  const idSet = new Set<string>();
  const templateSet = new Set<string>();
  const counts: Record<AnnouncerEventIdV7, number> = {
    EPISODE_KICKOFF: 0,
    HOT_STREAK_2X: 0,
    HOT_STREAK_3X: 0,
    HOT_STREAK_5X: 0,
    SECRET_SQUARE_DISCOVERY: 0,
    LOCKED_VAULT_CRACK: 0,
    RIVAL_MISS_REBOUND: 0,
    COMEBACK_LEAD_CHANGE: 0,
    FINAL_2_TURN_NAILBITER: 0,
    EPISODE_VICTORY: 0,
    MYSTERY_CURTAIN_REVEAL: 0,
    OPPONENT_CHOICE_CHALLENGE: 0,
    INSTANT_BARGAIN_TEMPTATION: 0,
    BOOTH_RIGGING_BUSTED: 0,
    CLASSIC_TOTE_ROW_SWEEP: 0,
    TIC_TAC_LINE_JACKPOT: 0,
    COAST_BRIDGE_CONNECTED: 0,
    EYE_GUESS_FLASH_OPEN: 0,
    CONCENTRATION_PRIZE_MATCH: 0,
    BIG_WHEEL_SPIN_START: 0,
    BIG_WHEEL_JACKPOT: 0,
    GREMLIN_ZONK_BLOWUP: 0,
    GREMLIN_PASS_SPINS: 0,
    SCOUTING_DISCOVERY: 0,
    RIVAL_TURN_CALL: 0,
    BRASS_KEY_UNLOCK: 0,
    BLIND_MYSTERY_REVEAL: 0,
    MYTH_KLAXON_TRAP: 0,
    WRONG_PICK_WIT: 0,
    DIAL_NEAR_MISS_PRAISE: 0,
    QUICK_DRAW_STAMP: 0,
    REBOUND_POT_SCOOP: 0,
  };

  for (const line of STUDIO_ANNOUNCER_LINES_V7) {
    idSet.add(line.id);
    templateSet.add(line.template);
    counts[line.event] += 1;
  }

  return {
    totalLines: STUDIO_ANNOUNCER_LINES_V7.length,
    uniqueIds: idSet.size,
    uniqueTemplates: templateSet.size,
    countsByEvent: counts,
    valid:
      STUDIO_ANNOUNCER_LINES_V7.length >= 120 &&
      idSet.size === STUDIO_ANNOUNCER_LINES_V7.length &&
      templateSet.size === STUDIO_ANNOUNCER_LINES_V7.length,
  };
}

// ----------------------------------------------------------------------------
// 6. StudioAnnouncerControllerV7 — Non-Repeating Bag & Diagonal Chyron Engine
// ----------------------------------------------------------------------------

export class StudioAnnouncerControllerV7 {
  private readonly host: HTMLElement | null;
  private readonly stageEl: HTMLDivElement | null = null;
  private readonly ribbonEl: HTMLDivElement | null = null;
  private readonly kickerBladeEl: HTMLSpanElement | null = null;
  private readonly speakerBladeEl: HTMLSpanElement | null = null;
  private readonly emceeMedallionEl: HTMLSpanElement | null = null;
  private readonly micEmblemEl: HTMLSpanElement | null = null;
  private readonly copyEl: HTMLParagraphElement | null = null;
  private readonly spectrumRuleEl: HTMLDivElement | null = null;
  private emceeSpriteLoaded = false;

  private readonly linesByEvent = new Map<AnnouncerEventIdV7, StudioAnnouncerLineSpecV7[]>();
  private readonly shuffleBags = new Map<string, StudioAnnouncerLineSpecV7[]>();
  private readonly lastLineIdByBucket = new Map<string, string>();
  private readonly spokenLineIdsSession = new Set<string>();
  private readonly championQuipBags = new Map<string, string[]>();
  private readonly lastChampionQuipByKey = new Map<string, string>();

  private rngState: number;
  private reducedMotion: boolean;
  private highContrast: boolean;
  private readonly defaultDwellMs: number;
  private readonly minGapBetweenLowPriorityMs: number;
  private readonly onCueShown?: (cue: AnnouncerCueEmittedV7) => void;

  private activeCue: AnnouncerCueEmittedV7 | null = null;
  private activePriority = 0;
  private lastCueShownAtMs = -10_000;
  private enterFrameHandle: number | null = null;
  private fadeTimerHandle: number | null = null;
  private hideTimerHandle: number | null = null;
  private currentPhase: AnnouncerPhaseHintV7 = 'HUB';
  private activeStageId: StageWorldIdV7 | undefined = undefined;
  private disposed = false;

  // Match-scoped reactive state tracker for automatic edge detection
  private prevPlayerCash = 0;
  private prevRivalCash = 0;
  private hasTrailedInMatch = false;
  private announcedNailbiterTurns = new Set<number>();
  private announcedStreaksInRun = new Set<number>();

  constructor(host?: HTMLElement | null, options: StudioAnnouncerOptionsV7 = {}) {
    this.host = host ?? (typeof document !== 'undefined' ? document.getElementById('ui-root') ?? document.body : null);
    this.reducedMotion = Boolean(options.reducedMotion);
    this.highContrast = Boolean(options.highContrast);
    this.defaultDwellMs = options.defaultDwellMs ?? 2950;
    this.minGapBetweenLowPriorityMs = options.minGapBetweenLowPriorityMs ?? 900;
    this.onCueShown = options.onCueShown;
    this.rngState = ((options.seed ?? Date.now()) >>> 0) || 0x1966_06a1;

    // Index all 280+ lines by event trigger
    for (const spec of STUDIO_ANNOUNCER_LINES_V7) {
      let bucket = this.linesByEvent.get(spec.event);
      if (!bucket) {
        bucket = [];
        this.linesByEvent.set(spec.event, bucket);
      }
      bucket.push(spec);
    }

    if (typeof document !== 'undefined' && this.host) {
      ensureAnnouncerStylesInjected();

      const stage = document.createElement('div');
      stage.className = 'ws7-announcer-stage';
      stage.dataset.hidden = 'true';
      stage.dataset.phase = this.currentPhase;
      stage.dataset.reducedMotion = String(this.reducedMotion);
      stage.dataset.highContrast = String(this.highContrast);
      stage.setAttribute('role', 'status');
      stage.setAttribute('aria-live', 'polite');
      stage.setAttribute('aria-atomic', 'true');

      const ribbon = document.createElement('div');
      ribbon.className = 'ws7-announcer-ribbon';
      ribbon.dataset.tone = 'PEACOCK';
      ribbon.dataset.state = 'exit';

      const kickerRow = document.createElement('div');
      kickerRow.className = 'ws7-announcer-kicker-row';

      const kickerBlade = document.createElement('span');
      kickerBlade.className = 'ws7-announcer-kicker-blade';

      const speakerBlade = document.createElement('span');
      speakerBlade.className = 'ws7-announcer-speaker-blade';

      kickerRow.append(kickerBlade, speakerBlade);

      const bodyBlade = document.createElement('div');
      bodyBlade.className = 'ws7-announcer-body-blade';

      const emceeWrap = document.createElement('span');
      emceeWrap.className = 'ws7-announcer-emcee-wrap';

      const emceeMedallion = document.createElement('span');
      emceeMedallion.className = 'ws7-announcer-emcee-medallion';
      emceeMedallion.dataset.mood = 'POISED';
      emceeMedallion.setAttribute('aria-hidden', 'true');
      emceeMedallion.style.backgroundImage = `url("${buildEmceeMonogramSvgDataUriV7('POISED')}")`;
      emceeMedallion.style.backgroundSize = '100% 100%';
      emceeMedallion.style.backgroundPosition = '50% 50%';

      const micEmblem = document.createElement('span');
      micEmblem.className = 'ws7-announcer-mic-emblem';

      emceeWrap.append(emceeMedallion, micEmblem);

      const copy = document.createElement('p');
      copy.className = 'ws7-announcer-copy';

      bodyBlade.append(emceeWrap, copy);

      const spectrumRule = document.createElement('div');
      spectrumRule.className = 'ws7-announcer-spectrum-rule';

      ribbon.append(kickerRow, bodyBlade, spectrumRule);
      stage.appendChild(ribbon);
      this.host.appendChild(stage);

      this.stageEl = stage;
      this.ribbonEl = ribbon;
      this.kickerBladeEl = kickerBlade;
      this.speakerBladeEl = speakerBlade;
      this.emceeMedallionEl = emceeMedallion;
      this.micEmblemEl = micEmblem;
      this.copyEl = copy;
      this.spectrumRuleEl = spectrumRule;

      // Preload 1966 2x2 Illustrated Emcee Portrait Sheet cleanly
      if (typeof Image !== 'undefined') {
        const preloadImg = new Image();
        preloadImg.onload = () => {
          this.emceeSpriteLoaded = true;
          if (!this.disposed && this.emceeMedallionEl) {
            const currentMood = (this.emceeMedallionEl.dataset.mood as EmceeMoodV7) || 'POISED';
            this.applyEmceeMedallionMood(currentMood);
          }
        };
        preloadImg.src = EMCEE_MEDALLION_ASSET_V7;
      }
    }
  }

  private applyEmceeMedallionMood(mood: EmceeMoodV7): void {
    if (!this.emceeMedallionEl) return;
    this.emceeMedallionEl.dataset.mood = mood;
    if (this.emceeSpriteLoaded) {
      this.emceeMedallionEl.style.backgroundImage = `url("${EMCEE_MEDALLION_ASSET_V7}")`;
      this.emceeMedallionEl.style.backgroundSize = '200% 200%';
      this.emceeMedallionEl.style.backgroundPosition = EMCEE_SPRITE_POSITIONS_V7[mood];
    } else {
      this.emceeMedallionEl.style.backgroundImage = `url("${buildEmceeMonogramSvgDataUriV7(mood)}")`;
      this.emceeMedallionEl.style.backgroundSize = '100% 100%';
      this.emceeMedallionEl.style.backgroundPosition = '50% 50%';
    }
  }

  private nextRandom01(): number {
    // Mulberry32 PRNG — fast, deterministic when seeded, high distribution quality
    let t = (this.rngState += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  private drawFromPoolBag(
    bagKey: string,
    candidates: readonly StudioAnnouncerLineSpecV7[],
  ): StudioAnnouncerLineSpecV7 {
    let bag = this.shuffleBags.get(bagKey);
    if (!bag || bag.length === 0) {
      const unseen = candidates.filter((l) => !this.spokenLineIdsSession.has(l.id));
      const pool = unseen.length > 0 ? [...unseen] : [...candidates];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(this.nextRandom01() * (i + 1));
        const tmp = pool[i];
        pool[i] = pool[j];
        pool[j] = tmp;
      }

      const prevId = this.lastLineIdByBucket.get(bagKey);
      if (pool.length > 1 && pool[pool.length - 1].id === prevId) {
        const tmp = pool[pool.length - 1];
        pool[pool.length - 1] = pool[0];
        pool[0] = tmp;
      }

      bag = pool;
      this.shuffleBags.set(bagKey, bag);
    }

    const picked = bag.pop()!;
    this.lastLineIdByBucket.set(bagKey, picked.id);
    this.spokenLineIdsSession.add(picked.id);
    return picked;
  }

  private drawNonRepeatingLine(
    event: AnnouncerEventIdV7,
    stageId?: StageWorldIdV7,
  ): StudioAnnouncerLineSpecV7 {
    const source = this.linesByEvent.get(event);
    if (!source || source.length === 0) {
      throw new Error(`Missing announcer pool for event: ${event}`);
    }

    // Prioritize bespoke stage lines when playing on that soundstage (never leaking onto other stages!)
    if (stageId) {
      const stageSpecific = source.filter((l) => l.stageFilter === stageId);
      if (stageSpecific.length > 0) {
        const hasUnseenStageLine = stageSpecific.some(
          (l) => !this.spokenLineIdsSession.has(l.id),
        );
        if (hasUnseenStageLine || this.nextRandom01() < 0.65) {
          return this.drawFromPoolBag(`${event}::${stageId}`, stageSpecific);
        }
      }
    }

    const universal = source.filter((l) => !l.stageFilter);
    return this.drawFromPoolBag(
      `${event}::UNIVERSAL`,
      universal.length > 0 ? universal : source,
    );
  }

  // --------------------------------------------------------------------------
  // Core Chyron Trigger & Lifecycle Controls
  // --------------------------------------------------------------------------

  public announce(
    event: AnnouncerEventIdV7,
    ctx: AnnouncerContextV7 = {},
  ): AnnouncerCueEmittedV7 | null {
    const resolvedStageId = ctx.stageId ?? ctx.blueprint?.stageId ?? this.activeStageId;
    if (resolvedStageId) {
      this.activeStageId = resolvedStageId;
    }

    if (
      this.disposed ||
      this.currentPhase === 'QUESTION_OPEN' ||
      this.currentPhase === 'HUB' ||
      this.currentPhase === 'CANARY_BREAK'
    ) {
      return null;
    }

    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const priority = EVENT_PRIORITY_V7[event] ?? 50;

    // Same-beat collision guard: if two events fire within 1.1s (e.g. 2x Streak +
    // Vault Crack on the same answer), keep the higher-priority call; once >= 1.1s
    // has elapsed, fresh turn beats (Rebound, Nailbiter) cleanly supersede!
    const elapsedSinceLastMs = nowMs - this.lastCueShownAtMs;
    if (!ctx.forceImmediate && this.activeCue !== null && elapsedSinceLastMs < 1100) {
      if (priority <= this.activePriority) {
        return null;
      }
    }

    const effectiveCtx: AnnouncerContextV7 = resolvedStageId
      ? { stageId: resolvedStageId, ...ctx }
      : ctx;
    const lineSpec =
      event === 'EPISODE_KICKOFF' && effectiveCtx.isDailyBroadcast
        ? this.drawFromPoolBag('EPISODE_KICKOFF::DAILY', DAILY_BROADCAST_KICKOFF_LINES_V7)
        : this.drawNonRepeatingLine(event, resolvedStageId);
    const personaMeta = PERSONA_DISPLAY_LABELS_V7[lineSpec.persona];
    const rivalIdForQuip = effectiveCtx.rivalId ?? effectiveCtx.blueprint?.rivalId;
    const validRivalId = isRivalIdInVoiceKitsV8(rivalIdForQuip) ? rivalIdForQuip : undefined;

    let renderedText: string;
    if (
      event === 'EPISODE_KICKOFF' &&
      validRivalId &&
      CHAMPION_ANNOUNCER_QUIPS_V7[validRivalId] &&
      !effectiveCtx.isDailyBroadcast &&
      this.nextRandom01() < 0.45
    ) {
      const rawQuip =
        CHAMPION_ANNOUNCER_QUIPS_V7[validRivalId][Math.floor(this.nextRandom01() * 2)];
      renderedText = interpolateAnnouncerTemplateV7(rawQuip, effectiveCtx);
    } else if (
      event === 'RIVAL_TURN_CALL' &&
      validRivalId &&
      !effectiveCtx.outcomeLabel &&
      this.nextRandom01() < 0.8
    ) {
      renderedText = this.getChampionReactionQuip(validRivalId, 'SMIRK', effectiveCtx);
    } else if (
      event === 'RIVAL_MISS_REBOUND' &&
      validRivalId &&
      this.nextRandom01() < 0.72
    ) {
      renderedText = this.getChampionReactionQuip(validRivalId, 'FUMBLE', effectiveCtx);
    } else if (
      event === 'BIG_WHEEL_SPIN_START' &&
      validRivalId &&
      this.nextRandom01() < 0.6
    ) {
      renderedText = this.getChampionReactionQuip(validRivalId, 'WHEEL', effectiveCtx);
    } else if (
      event === 'GREMLIN_ZONK_BLOWUP' &&
      validRivalId &&
      effectiveCtx.victim !== 'PLAYER' &&
      this.nextRandom01() < 0.8
    ) {
      renderedText = this.getChampionReactionQuip(validRivalId, 'ZONK', effectiveCtx);
    } else if (
      event === 'SCOUTING_DISCOVERY' &&
      validRivalId &&
      !effectiveCtx.outcomeLabel &&
      this.nextRandom01() < 0.82
    ) {
      renderedText = this.getChampionReactionQuip(
        validRivalId,
        effectiveCtx.scoutKind === 'STRONG' ? 'SCOUT_STRONG' : 'SCOUT_WEAK',
        effectiveCtx,
      );
    } else if (
      event === 'FINAL_2_TURN_NAILBITER' &&
      validRivalId &&
      this.nextRandom01() < 0.5
    ) {
      renderedText = this.getChampionReactionQuip(validRivalId, 'CLUTCH', effectiveCtx);
    } else {
      renderedText = interpolateAnnouncerTemplateV7(lineSpec.template, effectiveCtx);
    }
    const rawKicker = (ctx.customBadgeOverride ?? lineSpec.kickerTag).trim();
    const kickerTag = rawKicker.includes('{')
      ? interpolateAnnouncerTemplateV7(rawKicker, effectiveCtx).replace(/\u00A0/g, ' ')
      : rawKicker;
    const mood: EmceeMoodV7 = ctx.moodOverride ?? EVENT_EMCEE_MOOD_V7[event] ?? 'POISED';

    // Calibrate clean readable dwell (~2.65s..3.45s) without overstaying
    const charBonusMs = Math.min(550, Math.max(0, (renderedText.length - 54) * 14));
    const dwellMs = Math.max(
      1800,
      Math.round(ctx.dwellMsOverride ?? this.defaultDwellMs + charBonusMs),
    );

    const cue: AnnouncerCueEmittedV7 = {
      lineId: lineSpec.id,
      event,
      persona: lineSpec.persona,
      speakerLabel: personaMeta.speaker,
      kickerTag,
      renderedText,
      tone: lineSpec.tone,
      mood,
      dwellMs,
    };

    this.activeCue = cue;
    this.activePriority = priority;
    this.lastCueShownAtMs = nowMs;

    this.renderChyronDom(cue, personaMeta.glyphKind);
    this.onCueShown?.(cue);
    return cue;
  }

  private renderChyronDom(
    cue: AnnouncerCueEmittedV7,
    glyphKind: 'MIC' | 'STAR' | 'CROWN' | 'BOLT',
  ): void {
    if (
      !this.stageEl ||
      !this.ribbonEl ||
      !this.kickerBladeEl ||
      !this.speakerBladeEl ||
      !this.micEmblemEl ||
      !this.copyEl
    ) {
      return;
    }

    this.clearTimers();

    this.stageEl.dataset.hidden = 'false';
    this.ribbonEl.dataset.tone = cue.tone;
    this.kickerBladeEl.textContent = cue.kickerTag;
    this.speakerBladeEl.textContent = cue.speakerLabel;
    this.applyEmceeMedallionMood(cue.mood);
    this.micEmblemEl.innerHTML = renderPersonaGlyphSvg(glyphKind);
    this.copyEl.textContent = cue.renderedText;

    // Retrigger spectrum wipe animation cleanly when motion is enabled
    if (this.spectrumRuleEl && !this.reducedMotion) {
      this.spectrumRuleEl.style.animation = 'none';
      // Force lightweight style recalc on the 3px bar only
      void this.spectrumRuleEl.offsetWidth;
      this.spectrumRuleEl.style.animation = '';
    }

    if (this.reducedMotion || typeof window === 'undefined') {
      this.ribbonEl.dataset.state = 'visible';
    } else {
      this.ribbonEl.dataset.state = 'exit';
      this.enterFrameHandle = window.requestAnimationFrame(() => {
        this.enterFrameHandle = null;
        if (!this.disposed && this.ribbonEl) {
          this.ribbonEl.dataset.state = 'visible';
        }
      });
    }

    if (typeof window !== 'undefined') {
      this.fadeTimerHandle = window.setTimeout(() => {
        this.fadeTimerHandle = null;
        this.beginFadeOut();
      }, cue.dwellMs);
    }
  }

  private beginFadeOut(): void {
    if (this.disposed) return;
    this.activeCue = null;
    this.activePriority = 0;

    if (!this.ribbonEl || !this.stageEl) return;
    this.ribbonEl.dataset.state = 'exit';

    const exitDurationMs = this.reducedMotion ? 160 : 300;
    if (typeof window !== 'undefined') {
      this.hideTimerHandle = window.setTimeout(() => {
        this.hideTimerHandle = null;
        if (!this.disposed && this.stageEl && this.activeCue === null) {
          this.stageEl.dataset.hidden = 'true';
        }
      }, exitDurationMs);
    } else {
      this.stageEl.dataset.hidden = 'true';
    }
  }

  private clearTimers(): void {
    if (typeof window === 'undefined') return;
    if (this.enterFrameHandle !== null) {
      window.cancelAnimationFrame(this.enterFrameHandle);
      this.enterFrameHandle = null;
    }
    if (this.fadeTimerHandle !== null) {
      window.clearTimeout(this.fadeTimerHandle);
      this.fadeTimerHandle = null;
    }
    if (this.hideTimerHandle !== null) {
      window.clearTimeout(this.hideTimerHandle);
      this.hideTimerHandle = null;
    }
  }

  // --------------------------------------------------------------------------
  // Champion Voice Kit & TV Guide Close-Up Resurrection (All 24 Champions + 3 Brokers)
  // --------------------------------------------------------------------------

  public getChampionReactionQuip(
    rivalId: RivalIdV7,
    kind: ChampionReactionKindV7,
    ctx: AnnouncerContextV7 = {},
  ): string {
    const kit = CHAMPION_VOICE_KITS_V7[rivalId] ?? CHAMPION_VOICE_KITS_V7.CARMEN_DELGADO;
    let candidates: readonly string[];
    switch (kind) {
      case 'SMIRK':
        candidates = kit.smirkLines;
        break;
      case 'FUMBLE':
        candidates = kit.fumbleLines;
        break;
      case 'CLUTCH':
        candidates = [kit.clutchLine];
        break;
      case 'ZONK':
        candidates = [kit.zonkLine];
        break;
      case 'WHEEL':
        candidates = [kit.wheelLine];
        break;
      case 'SCOUT_STRONG':
        candidates = [kit.scoutStrongCall];
        break;
      case 'SCOUT_WEAK':
        candidates = [kit.scoutWeakCall];
        break;
    }

    const bagKey = `${rivalId}::${kind}`;
    let bag = this.championQuipBags.get(bagKey);
    if (!bag || bag.length === 0) {
      const pool = [...candidates];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(this.nextRandom01() * (i + 1));
        const tmp = pool[i];
        pool[i] = pool[j];
        pool[j] = tmp;
      }
      const prev = this.lastChampionQuipByKey.get(bagKey);
      if (pool.length > 1 && pool[pool.length - 1] === prev) {
        const tmp = pool[pool.length - 1];
        pool[pool.length - 1] = pool[0];
        pool[0] = tmp;
      }
      bag = pool;
      this.championQuipBags.set(bagKey, bag);
    }

    const rawTemplate = bag.pop()!;
    this.lastChampionQuipByKey.set(bagKey, rawTemplate);
    return interpolateAnnouncerTemplateV7(rawTemplate, {
      rivalId,
      reboundBonus: ctx.reboundBonus ?? 50,
      ...ctx,
    });
  }

  public getChampionTvGuideCloseUp(castId: CastIdV7): ChampionTvGuideCloseUpV7 {
    return getChampionTvGuideCloseUpV7(castId);
  }

  // --------------------------------------------------------------------------
  // Semantic Game-State Trigger Helpers (1-Line Integration in ShowtimeAppV7)
  // --------------------------------------------------------------------------

  public resetForNewEpisode(ctx: AnnouncerContextV7 = {}): void {
    const resolvedStageId = ctx.stageId ?? ctx.blueprint?.stageId;
    if (resolvedStageId) {
      this.activeStageId = resolvedStageId;
    }
    this.prevPlayerCash = ctx.playerCash ?? 0;
    this.prevRivalCash = ctx.rivalCash ?? 0;
    this.hasTrailedInMatch = false;
    this.announcedNailbiterTurns.clear();
    this.announcedStreaksInRun.clear();
    this.dismissImmediate();
  }

  public onEpisodeKickoff(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    const resolvedStageId = ctx.stageId ?? ctx.blueprint?.stageId ?? this.activeStageId;
    if (resolvedStageId) {
      this.activeStageId = resolvedStageId;
    }
    this.prevPlayerCash = ctx.playerCash ?? 0;
    this.prevRivalCash = ctx.rivalCash ?? 0;
    this.hasTrailedInMatch = false;
    this.announcedNailbiterTurns.clear();
    this.announcedStreaksInRun.clear();
    return this.announce('EPISODE_KICKOFF', { ...ctx, forceImmediate: true });
  }

  public onHotStreak(
    streak: number,
    ctx: AnnouncerContextV7 = {},
  ): AnnouncerCueEmittedV7 | null {
    if (streak < 2) {
      this.announcedStreaksInRun.clear();
      return null;
    }
    if (this.announcedStreaksInRun.has(streak)) return null;

    let bucket: AnnouncerEventIdV7 | null = null;
    if (streak === 2) {
      bucket = 'HOT_STREAK_2X';
    } else if (streak === 3) {
      bucket = 'HOT_STREAK_3X';
    } else if (streak >= 5) {
      bucket = 'HOT_STREAK_5X';
    }
    if (!bucket) return null;

    const customBadgeOverride =
      streak > 5 ? `${streak}× HISTORIC HEATER!` : ctx.customBadgeOverride;
    const cue = this.announce(bucket, { ...ctx, streak, customBadgeOverride });
    if (cue) {
      this.announcedStreaksInRun.add(streak);
    }
    return cue;
  }

  public onSecretSquareDiscovery(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('SECRET_SQUARE_DISCOVERY', { ...ctx, forceImmediate: true });
  }

  public onLockedVaultCrack(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('LOCKED_VAULT_CRACK', { ...ctx, forceImmediate: true });
  }

  public onRivalMissRebound(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('RIVAL_MISS_REBOUND', {
      reboundBonus: 50,
      forceImmediate: true,
      ...ctx,
    });
  }

  public onComebackLeadChange(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('COMEBACK_LEAD_CHANGE', { ...ctx, forceImmediate: true });
  }

  public onFinalTwoTurnNailbiter(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    const turn = ctx.turnNumber ?? 9;
    if (this.announcedNailbiterTurns.has(turn)) return null;
    const cue = this.announce('FINAL_2_TURN_NAILBITER', {
      forceImmediate: true,
      ...ctx,
    });
    if (cue) {
      this.announcedNailbiterTurns.add(turn);
    }
    return cue;
  }

  public onEpisodeVictory(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('EPISODE_VICTORY', { ...ctx, forceImmediate: true });
  }

  public onClassicTvTwist(
    twist: ClassicTvTileTwistV7,
    ctx: AnnouncerContextV7 = {},
  ): AnnouncerCueEmittedV7 | null {
    switch (twist) {
      case 'SECRET_SQUARE':
        return this.onSecretSquareDiscovery(ctx);
      case 'LOCKED_VAULT':
        return this.onLockedVaultCrack(ctx);
      case 'MYSTERY_CURTAIN':
        return this.announce('MYSTERY_CURTAIN_REVEAL', ctx);
      case 'OPPONENT_CHOICE':
        return this.announce('OPPONENT_CHOICE_CHALLENGE', ctx);
      case 'INSTANT_BARGAIN':
        return this.announce('INSTANT_BARGAIN_TEMPTATION', ctx);
      case 'BIG_WHEEL_SPIN':
        return this.onBigWheelSpin(ctx);
      case 'PRESS_LUCK_SPIN':
        return this.announce('GREMLIN_PASS_SPINS', { ...ctx, moodOverride: 'WINK' });
      case 'BRASS_KEY':
        return this.announce('BRASS_KEY_UNLOCK', { ...ctx, forceImmediate: true });
      case 'BLIND_CATEGORY':
      case 'MYSTERY_CASH':
        return this.announce('BLIND_MYSTERY_REVEAL', { ...ctx, forceImmediate: true });
      default:
        return null;
    }
  }

  public onBigWheelSpin(
    ctx: AnnouncerContextV7 & { readonly isJackpot?: boolean } = {},
  ): AnnouncerCueEmittedV7 | null {
    return this.announce(ctx.isJackpot ? 'BIG_WHEEL_JACKPOT' : 'BIG_WHEEL_SPIN_START', {
      forceImmediate: true,
      ...ctx,
    });
  }

  public onGremlinZonk(
    ctx: AnnouncerContextV7 & { readonly victim?: 'PLAYER' | 'RIVAL' } = {},
  ): AnnouncerCueEmittedV7 | null {
    const customBadgeOverride =
      ctx.victim === 'RIVAL'
        ? `📺 ${ctx.rivalName?.toUpperCase() ?? 'CHAMPION'} SIGNAL-JAMMED!`
        : ctx.customBadgeOverride;
    return this.announce('GREMLIN_ZONK_BLOWUP', {
      forceImmediate: true,
      moodOverride: 'GASP',
      ...ctx,
      customBadgeOverride,
    });
  }

  public onGremlinPassSpins(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('GREMLIN_PASS_SPINS', {
      forceImmediate: true,
      moodOverride: 'INTENSE',
      ...ctx,
    });
  }

  public onScoutingDiscovery(
    ctx: AnnouncerContextV7 & { readonly kind?: 'WEAK' | 'STRONG' } = {},
  ): AnnouncerCueEmittedV7 | null {
    const scoutKind = ctx.kind ?? ctx.scoutKind ?? 'WEAK';
    return this.announce('SCOUTING_DISCOVERY', {
      forceImmediate: true,
      scoutKind,
      customBadgeOverride:
        ctx.customBadgeOverride ??
        (scoutKind === 'STRONG' ? '★ STRONG SPOT LOGGED!' : '💡 WEAK SPOT FOUND!'),
      ...ctx,
    });
  }

  public onMythKlaxonTrap(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('MYTH_KLAXON_TRAP', {
      forceImmediate: true,
      moodOverride: 'GASP',
      ...ctx,
    });
  }

  public onWrongPickWit(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('WRONG_PICK_WIT', {
      forceImmediate: true,
      moodOverride: 'WINK',
      ...ctx,
    });
  }

  public onDialNearMissPraise(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('DIAL_NEAR_MISS_PRAISE', {
      forceImmediate: true,
      moodOverride: 'WINK',
      ...ctx,
    });
  }

  public onQuickDrawStamp(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('QUICK_DRAW_STAMP', {
      forceImmediate: true,
      moodOverride: 'INTENSE',
      ...ctx,
    });
  }

  public onReboundPotScoop(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    const potAmount =
      ctx.reboundBonus && ctx.reboundBonus > 0
        ? ctx.reboundBonus
        : ctx.cashDelta && Math.abs(ctx.cashDelta) > 0
          ? Math.abs(ctx.cashDelta)
          : 100;
    return this.announce('REBOUND_POT_SCOOP', {
      forceImmediate: true,
      reboundBonus: potAmount,
      ...ctx,
    });
  }

  public onRivalTurnBanter(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('RIVAL_TURN_CALL', {
      forceImmediate: true,
      ...ctx,
    });
  }

  public onBoothRiggingBusted(ctx: AnnouncerContextV7 = {}): AnnouncerCueEmittedV7 | null {
    return this.announce('BOOTH_RIGGING_BUSTED', { ...ctx, forceImmediate: true });
  }

  public onBoardModeHighlight(
    mode: AnnouncerBoardModeIdV7,
    ctx: AnnouncerContextV7 = {},
  ): AnnouncerCueEmittedV7 | null {
    switch (mode) {
      case 'CLASSIC_TOTE':
        return this.announce('CLASSIC_TOTE_ROW_SWEEP', { ...ctx, forceImmediate: true });
      case 'TIC_TAC_LINE':
        return this.announce('TIC_TAC_LINE_JACKPOT', { ...ctx, forceImmediate: true });
      case 'COAST_HEX_BRIDGE':
        return this.announce('COAST_BRIDGE_CONNECTED', { ...ctx, forceImmediate: true });
      case 'EYE_GUESS_MEMORY':
        return this.announce('EYE_GUESS_FLASH_OPEN', { ...ctx, forceImmediate: true });
      case 'CONCENTRATION_PRIZE_MATCH':
        return this.announce('CONCENTRATION_PRIZE_MATCH', { ...ctx, forceImmediate: true });
      case 'MONTY_CURTAIN_DEAL':
        return this.announce('MYSTERY_CURTAIN_REVEAL', { ...ctx, forceImmediate: true });
      default:
        return null;
    }
  }

  /**
   * Automatic state-diff helper: call after any score or turn transition to
   * fire Comeback Lead Change, 2x/3x/5x Hot Streaks, or Final 2-Turn Nailbiter
   * automatically without manual bookkeeping in the caller!
   */
  public evaluateMatchStateTransition(
    snapshot: AnnouncerMatchSnapshotV7,
  ): AnnouncerCueEmittedV7 | null {
    const totalTurns = snapshot.totalTurns ?? 10;
    const wasTrailing = this.prevPlayerCash < this.prevRivalCash;
    if (snapshot.playerCash < snapshot.rivalCash - 25) {
      this.hasTrailedInMatch = true;
    }
    if (snapshot.streak === 0) {
      this.announcedStreaksInRun.clear();
    }

    const baseCtx: AnnouncerContextV7 = {
      rivalId: snapshot.rivalId,
      stageId: snapshot.stageId,
      category: snapshot.lastCategory,
      playerCash: snapshot.playerCash,
      rivalCash: snapshot.rivalCash,
      streak: snapshot.streak,
      turnNumber: snapshot.turnNumber,
      totalTurns,
      isDailyBroadcast: snapshot.isDailyBroadcast,
    };

    const nowLeading = snapshot.playerCash > snapshot.rivalCash;
    const crossedIntoLead =
      (wasTrailing || this.hasTrailedInMatch) &&
      this.prevPlayerCash <= this.prevRivalCash &&
      nowLeading &&
      snapshot.turnNumber >= 2;

    this.prevPlayerCash = snapshot.playerCash;
    this.prevRivalCash = snapshot.rivalCash;

    // 1. Comeback Lead Change takes top dramatic precedence when overtaking Rival
    if (crossedIntoLead) {
      return this.onComebackLeadChange(baseCtx);
    }

    // 2. 5x, 3x, or 2x Hot Streak
    if (snapshot.streak === 5 || snapshot.streak === 3 || snapshot.streak === 2) {
      const streakCue = this.onHotStreak(snapshot.streak, baseCtx);
      if (streakCue) return streakCue;
    }

    // 3. Final 2-Turn Nailbiter (Turns 9–10 in a 10-turn match, or final 2 turns of Daily)
    const turnsRemaining = totalTurns - snapshot.turnNumber + 1;
    const scoreGap = Math.abs(snapshot.playerCash - snapshot.rivalCash);
    if (
      turnsRemaining <= 2 &&
      turnsRemaining >= 1 &&
      scoreGap <= 480 &&
      (snapshot.playerCash > 0 || snapshot.rivalCash > 0)
    ) {
      return this.onFinalTwoTurnNailbiter(baseCtx);
    }

    return null;
  }

  // --------------------------------------------------------------------------
  // Phase Sync, Accessibility & Cleanup
  // --------------------------------------------------------------------------

  public setPhase(phase: AnnouncerPhaseHintV7): void {
    this.currentPhase = phase;
    if (this.stageEl) {
      this.stageEl.dataset.phase = phase;
    }
    // Never linger over Title Hub, open Question Monitor/Showcase controls, or Canary Break modal
    if (phase === 'HUB' || phase === 'QUESTION_OPEN' || phase === 'CANARY_BREAK') {
      this.dismissImmediate();
    }
  }

  public setAccessibility(opts: {
    readonly reducedMotion?: boolean;
    readonly highContrast?: boolean;
  }): void {
    if (opts.reducedMotion !== undefined) {
      this.reducedMotion = opts.reducedMotion;
      if (this.stageEl) {
        this.stageEl.dataset.reducedMotion = String(this.reducedMotion);
      }
    }
    if (opts.highContrast !== undefined) {
      this.highContrast = opts.highContrast;
      if (this.stageEl) {
        this.stageEl.dataset.highContrast = String(this.highContrast);
      }
    }
  }

  public dismiss(): void {
    this.beginFadeOut();
  }

  public dismissImmediate(): void {
    this.clearTimers();
    this.activeCue = null;
    this.activePriority = 0;
    if (this.ribbonEl) {
      this.ribbonEl.dataset.state = 'exit';
    }
    if (this.stageEl) {
      this.stageEl.dataset.hidden = 'true';
    }
  }

  public getActiveCue(): AnnouncerCueEmittedV7 | null {
    return this.activeCue;
  }

  public getSpokenCountInSession(): number {
    return this.spokenLineIdsSession.size;
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.dismissImmediate();
    if (this.stageEl && this.stageEl.parentNode) {
      this.stageEl.parentNode.removeChild(this.stageEl);
    }
  }
}

// ----------------------------------------------------------------------------
// 7. Live Host Grant Bellamy Question-Setup, Lock-In & Post-Answer Banter (#234)
//    Compact, zero-scroll 1966 Art Fleming / Peter Marshall / Grant Bellamy
//    host lines rendered inside the Question Monitor & Post-Answer Reveal.
// ----------------------------------------------------------------------------

export interface HostQuestionIntroContextV7 {
  readonly category: CategoryIdV7;
  readonly cashValue: number;
  readonly actNumber: 1 | 2 | 3;
  readonly twistLabel?: string;
  readonly isClutch?: boolean;
  readonly rivalName: string;
  readonly seed?: number;
}

export { StudioAnnouncerControllerV7 as StudioAnnouncerV7 };

export interface HostAnswerRevealContextV7 {
  readonly correct: boolean;
  readonly cashWon: number;
  readonly streak: number;
  readonly rivalName: string;
  readonly wasFinalWager?: boolean;
  readonly flavor?: PostAnswerFlavorKindV8;
  readonly reboundPotWon?: number;
  readonly shutterMultiplier?: number;
  readonly seed?: number;
}

let hostBanterCursorV7 = 0;

function pickHostIndexV7(length: number, seed?: number): number {
  if (length <= 1) return 0;
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    return Math.abs(Math.floor(seed)) % length;
  }
  hostBanterCursorV7 = (hostBanterCursorV7 + 1) % 100_003;
  return hostBanterCursorV7 % length;
}

function compactRivalFirstNameV7(rivalName: string): string {
  const cleaned = rivalName.trim();
  if (!cleaned) return 'the Champ';
  if (cleaned.length <= 11) return cleaned;
  const first = cleaned.split(/\s+/)[0];
  return first || cleaned.slice(0, 11);
}

function clampHostCopyV7(text: string, maxLen: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLen) return normalized;
  const cut = normalized.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const safe = lastSpace >= Math.floor(maxLen * 0.6) ? cut.slice(0, lastSpace) : cut;
  return `${safe.replace(/[,;:—–-]+$/, '')}…`;
}

const HOST_ACT3_FINAL_WAGER_INTROS_V7: readonly string[] = [
  'Final Wager on {category}—{cash} riding on one clean answer!',
  'All fifty million holding their breath—{category} for {cash}!',
  'This is the ballgame! {cash} on {category} vs. {rival}!',
  'Turn 10 spotlight locked—nail {category} to bank {cash}!',
  'Everything rides on {category}—{cash} and tonight’s check!',
  'Final Broadcast Wager: {cash} on {category}—steady hands!',
  'Quiet in Studio 6A! {category} for {cash} and the crown!',
  'One answer settles tonight’s show—{cash} in {category}!',
  'Camera One tight on Podium One—{category} for {cash}!',
  'Showband paused, wager locked—{cash} rides on {category}!',
];

const HOST_TWIST_QUESTION_INTROS_V7: readonly string[] = [
  '{twist} live in {category}—{cash} right in the spotlight!',
  'Special plaque! {twist} puts {cash} up for grabs in {category}!',
  'Watch the marquee—{twist} makes {category} worth {cash}!',
  'Big swing here: {twist} lights up {category} for {cash}!',
  'Studio crowd loves this—{twist} in {category} for {cash}!',
  'No blinking now—{twist} supercharges {category} to {cash}!',
  '{rival} is watching close—{twist} on {category} for {cash}!',
  'Prime-time fireworks: {twist} raises {category} to {cash}!',
  'Hold onto your buzzer—{twist} puts {cash} on {category}!',
  'Living Color bonus! {twist} turns {category} into {cash}!',
];

const HOST_ACT2_DOUBLE_INTROS_V7: readonly string[] = [
  'Act II Double Dollars! {cash} on {category}—{rival} is leaning in!',
  'Stakes just jumped—{category} pays {cash} if you nail it clean!',
  'Second half heat! {cash} waiting on {category} right now!',
  'Bigger money in Act II—lock down {category} for {cash}!',
  'Double-Dollar board is hot! {cash} rides on {category}!',
  '{rival} wants this tier—claim {category} for {cash} first!',
  'Act II brass is swinging—bank {cash} right here on {category}!',
  'Prime-time payout! {category} jumps to {cash} in Act II!',
  'Take a clean breath—{cash} sits wide open on {category}!',
  'Every plaque weighs more now—{category} for a cool {cash}!',
];

const HOST_CATEGORY_FLAVOR_INTROS_V7: Readonly<Record<CategoryIdV7, string>> = {
  MEDICINE: 'Check your pulse—{cash} riding on Body & Medicine!',
  CHEMISTRY: 'Step up to the lab bench—{cash} on Chemistry!',
  PHYSICS: 'Mission Control is listening—{cash} on Science & Space!',
  GADGETS: 'Patent office is open—{cash} riding on Inventions!',
  ENGINES: 'Rev the tachometer—{cash} on Planes & Autos!',
  LITERATURE: 'Open the first edition—{cash} on Books & Authors!',
  LEXICON: 'Mind your syllables—{cash} riding on Words & Wit!',
  'FINE ARTS': 'Spotlight on the gallery—{cash} on Art & Stage!',
  SCREEN: 'Roll Camera Two—{cash} riding on Silver Screen!',
  JUKEBOX: 'Drop a nickel in the Wurlitzer—{cash} on Hit Parade!',
  FINANCE: 'Check the Broad Street ticker—{cash} on Money & Markets!',
  PRICING: 'Step right up to the register—{cash} on Price Tag!',
  ODDS: 'Play the percentages—{cash} riding on Luck & Numbers!',
  ATLAS: 'Spin the studio globe—{cash} on World Atlas!',
  SPORTS: 'Over to press row—{cash} on Wide World of Sports!',
  DYNASTIES: 'Dust off the royal crown—{cash} on Empires & Kings!',
  HEADLINES: 'Hot off the teletype—{cash} riding on Front Page!',
  FOLKLORE: 'Pull up a fireside chair—{cash} on Myths & Legends!',
  FALLACIES: 'Watch the fine print—{cash} on Brain Twisters!',
  CUISINE: 'Step into the Studio 6A kitchen—{cash} on Food & Flavor!',
};

const HOST_ACT1_GENERAL_INTROS_V7: readonly string[] = [
  'Thirty calm seconds on the clock—{category} for {cash}!',
  'Clean plaque in {category}—answer sharp to bank {cash}!',
  'Studio lamps on you—{cash} sitting on {category}!',
  '{rival} is watching Podium One—take {category} for {cash}!',
  'Read the clue twice—{category} pays {cash} straight up!',
  'Opening act rhythm—lock down {category} for {cash}!',
  'Here’s your shot at {cash} in {category}—take your pick!',
  'Smart board pick—{category} puts {cash} on the line!',
  'From the sealed writer’s envelope: {category} for {cash}!',
  'Let’s hear that brass chime—{cash} rides on {category}!',
];

/**
 * Returns a crisp 1-line Host Grant Bellamy question-setup cue (`<= 88` chars)
 * + matching portrait mood across 60 varied 1966 templates!
 */
export function getHostQuestionIntroLineV7(
  ctx: HostQuestionIntroContextV7,
): { readonly hostLine: string; readonly mood: EmceeMoodV7 } {
  const category = SPOKEN_CATEGORY_NAMES_V7[ctx.category] ?? ctx.category;
  const cash = formatDollarsV7(ctx.cashValue);
  const rival = compactRivalFirstNameV7(ctx.rivalName);
  const twist = ctx.twistLabel ? ctx.twistLabel.trim().slice(0, 22) : '';

  let template: string;
  let mood: EmceeMoodV7 = 'POISED';

  if (ctx.actNumber === 3 || ctx.isClutch) {
    template =
      HOST_ACT3_FINAL_WAGER_INTROS_V7[
        pickHostIndexV7(HOST_ACT3_FINAL_WAGER_INTROS_V7.length, ctx.seed)
      ];
    mood = 'INTENSE';
  } else if (twist) {
    template =
      HOST_TWIST_QUESTION_INTROS_V7[
        pickHostIndexV7(HOST_TWIST_QUESTION_INTROS_V7.length, ctx.seed)
      ];
    mood = 'WINK';
  } else if (ctx.actNumber === 2) {
    const idx = pickHostIndexV7(HOST_ACT2_DOUBLE_INTROS_V7.length, ctx.seed);
    template = HOST_ACT2_DOUBLE_INTROS_V7[idx];
    mood = idx % 2 === 0 ? 'INTENSE' : 'WINK';
  } else {
    const roll = pickHostIndexV7(HOST_ACT1_GENERAL_INTROS_V7.length + 10, ctx.seed);
    if (roll < 10) {
      template = HOST_CATEGORY_FLAVOR_INTROS_V7[ctx.category] ?? HOST_ACT1_GENERAL_INTROS_V7[0];
      mood = 'WINK';
    } else {
      template = HOST_ACT1_GENERAL_INTROS_V7[roll - 10];
      mood = 'POISED';
    }
  }

  const raw = template
    .replace(/\{category\}/g, category)
    .replace(/\{cash\}/g, cash)
    .replace(/\{rival\}/g, rival)
    .replace(/\{twist\}/g, twist);

  return {
    hostLine: clampHostCopyV7(raw, 88),
    mood,
  };
}

const HOST_LOCK_IN_STANDARD_V7: readonly string[] = [
  '{choice} locked on the desk—let’s check the vault!',
  '{choice} is in—opening the sealed envelope!',
  'You called {choice}—let’s light up the answer!',
  'Buzzer locked on {choice}—here comes the verdict!',
  'Solid tap on {choice}—checking with Standards!',
  '{choice} stamped in ink—let’s see the official card!',
  'Going with {choice}—show us the green lamp!',
  '{choice} on the wire—let’s ring the master board!',
  'No turning back on {choice}—checking the card!',
  '{choice} locked tight—over to the judge’s desk!',
  'Podium One says {choice}—let’s verify it live!',
  '{choice} is final—let’s see if the bells ring!',
];

const HOST_LOCK_IN_HIGH_STAKES_V7: readonly string[] = [
  '{choice} locked—hold your breath, America!',
  '{choice} sealed in brass—crack the master envelope!',
  'Big nerve on {choice}—drumroll in Studio 6A!',
  '{choice} rides for the show—here’s the verdict!',
  'Fifty million watching {choice}—let’s reveal it!',
  'Clutch lock on {choice}—check that golden card!',
  '{choice} is sealed—silence across the balcony!',
  'All chips behind {choice}—let’s see the truth!',
  'High-wire call on {choice}—open the safe!',
  '{choice} locked in prime time—cue the drumroll!',
  'Bold move on {choice}—let’s settle the score!',
  '{choice} stamped live—every spotlight on the card!',
];

function formatHostChoiceLabelV7(choiceLabel: string): string {
  const trimmed = choiceLabel.trim();
  if (!trimmed) return 'Answer';
  if (/^[A-D]$/i.test(trimmed)) return `Choice ${trimmed.toUpperCase()}`;
  return trimmed.length <= 16 ? trimmed : trimmed.slice(0, 16).trim();
}

/**
 * Returns a snappy 1-line Host Grant Bellamy lock-in quip (`<= 55` chars)
 * displayed the instant the player commits an answer!
 */
export function getHostLockInQuipV7(
  choiceLabel: string,
  isHighStakes: boolean,
  seed?: number,
): string {
  const pool = isHighStakes ? HOST_LOCK_IN_HIGH_STAKES_V7 : HOST_LOCK_IN_STANDARD_V7;
  const template = pool[pickHostIndexV7(pool.length, seed)];
  const formatted = formatHostChoiceLabelV7(choiceLabel);
  return clampHostCopyV7(template.replace(/\{choice\}/g, formatted), 55);
}

const HOST_REVEAL_FINAL_WIN_V7: readonly { readonly headline: string; readonly quip: string }[] = [
  { headline: 'FINAL WAGER CASHED!', quip: 'Ice in your veins! +{cash} cashes in the Final Wager as Studio 6A erupts!' },
  { headline: 'CLUTCH SHOWDOWN WIN!', quip: 'What a finish! You nailed the Final Wager for +{cash} right before {rival}!' },
  { headline: 'PRIME-TIME WALK-OFF!', quip: 'Fifty million on their feet—+{cash} banked on the final clue of the night!' },
  { headline: 'CHAMPIONSHIP NERVE!', quip: 'That’s how legends close a broadcast! +{cash} locked on the Final Wager!' },
  { headline: 'SOVEREIGN FINISH!', quip: 'Not a flicker of doubt under the spots—+{cash} sealed in Living Color!' },
  { headline: 'BALLGAME AT EIGHT!', quip: 'Hit the brass fortissimo! +{cash} on the Final Wager—take a bow, challenger!' },
  { headline: 'GOLD-PLATED CLIMAX!', quip: 'Talk about prime-time theater—+{cash} on the wire while {rival} applauds!' },
  { headline: 'UNFORGETTABLE FINALE!', quip: 'Textbook Final Wager! +{cash} rolls straight onto your Split-Flap counter!' },
];

const HOST_REVEAL_FINAL_MISS_V7: readonly { readonly headline: string; readonly quip: string }[] = [
  { headline: 'FINAL WAGER MISSED!', quip: 'Oh, what a heartbreaker at the wire—bold wager, tough final card!' },
  { headline: 'STUNG AT THE BELL!', quip: 'Studio 6A exhales—a brave Final Wager that came up just a whisker short.' },
  { headline: 'HIGH-WIRE DRAMA!', quip: 'That final clue had teeth—hats off for swinging big in front of America!' },
  { headline: 'PHOTO-FINISH STING!', quip: 'Ouch—even Grant Bellamy winced on that final card! Let’s check the totals.' },
  { headline: 'NERVE-WRACKING WIRE!', quip: 'A fearless Turn-10 swing—sometimes the writers keep one last curveball.' },
  { headline: 'TOUGH FINAL CARD!', quip: 'The balcony groans with you, challenger—now let’s see how {rival} wagered!' },
  { headline: 'SO CLOSE AT TURN 10!', quip: 'You played it bold under three hundred footcandles—let’s tally the final check!' },
  { headline: 'BUZZER AT THE SUMMIT!', quip: 'Heart-stopping finish! Let’s see where the Final Wagers leave the scoreboard.' },
];

const HOST_REVEAL_STREAK_WIN_V7: readonly { readonly headline: string; readonly quip: string }[] = [
  { headline: '{streak}× HOT STREAK!', quip: 'That’s {streak} straight! +{cash} banked and {rival} just checked their collar!' },
  { headline: 'UNSTOPPABLE · {streak}×!', quip: 'Bing-bing! +{cash} into your column—our showband can barely catch its breath!' },
  { headline: '{streak} IN A ROW!', quip: 'Pure prime-time rhythm! +{cash} stacked as your {streak}× streak catches fire!' },
  { headline: 'HEATER AT PODIUM ONE!', quip: '{streak} clean bells running! +{cash} clatters up while Booth A sweats!' },
  { headline: 'LOCKED IN · {streak}×!', quip: 'Reading the writers’ minds tonight—+{cash} on a sizzling {streak}-turn run!' },
  { headline: 'BLAZING TOTE BOARD!', quip: 'Another green lamp! +{cash} banked and {rival} is eyeing the exit sign!' },
  { headline: 'PRIME-TIME CLINIC!', quip: '{streak} unanswered hits! +{cash} keeps the Split-Flap drums spinning fast!' },
  { headline: 'MARQUEE ON FIRE!', quip: 'No stopping Podium One—+{cash} extends your {streak}× heater in Living Color!' },
  { headline: 'CHIME AFTER CHIME!', quip: 'Sweet music for the mezzanine! +{cash} locks in {streak} clean answers running!' },
  { headline: 'SHOWSTOPPER · {streak}×!', quip: 'Even the stagehands are clapping—+{cash} and {streak} straight in the vault!' },
];

const HOST_REVEAL_STANDARD_WIN_V7: readonly { readonly headline: string; readonly quip: string }[] = [
  { headline: 'RIGHT ON THE MONEY!', quip: 'Spot on! +{cash} clatters straight onto your Split-Flap counter!' },
  { headline: 'CORRECT · BELL RINGS!', quip: 'Clean as a whistle—+{cash} banked while Studio 6A cheers!' },
  { headline: 'BULLSEYE ON AIR!', quip: 'That’s the official answer! +{cash} into your purse with style.' },
  { headline: 'NAILED IT!', quip: 'Sharp recall under hot quartz lights—+{cash} belongs to Podium One!' },
  { headline: 'OFFICIAL MATCH!', quip: 'Standards & Practices stamps it green—+{cash} added to your ledger!' },
  { headline: 'BRASS FANFARE!', quip: 'Hear those Tijuana horns? +{cash} straight into tonight’s winnings!' },
  { headline: 'CRISP ANSWER!', quip: 'Not a moment’s hesitation—+{cash} puts fresh pressure on {rival}!' },
  { headline: 'THAT’S A WINNER!', quip: 'You knew that one cold! +{cash} lights up the Peacock side!' },
  { headline: 'ON THE BOARD!', quip: 'Velvet execution—+{cash} banked and the crowd wants an encore!' },
  { headline: 'VERIFIED CORRECT!', quip: 'Right off the master card! +{cash} climbs onto your scoreboard.' },
  { headline: 'SMOOTH PLAY!', quip: 'Cool as eight o’clock news—+{cash} drops cleanly into your column!' },
  { headline: 'STUDIO APPLAUSE!', quip: 'Didn’t even need the APPLAUSE sign—+{cash} earned fair and square!' },
];

const HOST_REVEAL_MISS_V7: readonly { readonly headline: string; readonly quip: string }[] = [
  { headline: 'NOT QUITE!', quip: 'Ooh, close—that one had teeth! Shake it off and claim the next square.' },
  { headline: 'TOUGH BREAK!', quip: 'Even our head writer double-checked that card twice—plenty of board left!' },
  { headline: 'BUZZER CALL!', quip: 'Rasp of the old studio buzzer—hang tight, one hot streak flips it right back!' },
  { headline: 'WRITER’S CURVEBALL!', quip: 'Sly wording on that clue—tuck the factoid away and strike back next turn!' },
  { headline: 'JUST SHORT!', quip: 'A hair off the mark—keep your poise, {rival} still has to face the rack!' },
  { headline: 'NO SCORE THIS TURN!', quip: 'Tough slip under bright lamps—plenty of high-dollar plaques waiting ahead.' },
  { headline: 'TRICKY PLAQUE!', quip: 'Half the mezzanine groaned on that one too—reset your rhythm and swing again!' },
  { headline: 'CLOSE CALL!', quip: 'Good instinct, wrong envelope—bounce right back on your favorite category!' },
  { headline: 'STUMPED BY THE VAULT!', quip: 'That’s why they pay our trivia writers! Watch {rival}’s move for a rebound.' },
  { headline: 'MISSED THE CHIME!', quip: 'Happens to five-week champs too—keep your eyes on that +$50 Rebound!' },
  { headline: 'ROUGH BOUNCE!', quip: 'Don’t sweat the buzzer—one unlocked Vault or Secret Square erases that fast!' },
  { headline: 'UNLUCKY DRAW!', quip: 'A classic 1966 stumper—take a breath and steal the momentum right back!' },
];

const HOST_REVEAL_FLAVOR_OVERRIDES_V8: Record<
  Exclude<PostAnswerFlavorKindV8, 'STANDARD'>,
  readonly { readonly headline: string; readonly quip: string; readonly mood: EmceeMoodV7 }[]
> = {
  MYTH_KLAXON: [
    { headline: '🚨 POPULAR-MYTH KLAXON!', quip: 'AWOOOOGA! Half of America repeats that yarn—our Standards vault knows better!', mood: 'GASP' },
    { headline: '🚨 MYTH TRAP SPRUNG!', quip: 'Clang goes the Klaxon! A world-famous cocktail-party myth claims another victim!', mood: 'GASP' },
    { headline: '🚨 URBAN LEGEND BUSTED!', quip: 'Don’t sweat it—three network VPs fell for that exact misconception in rehearsal!', mood: 'WINK' },
  ],
  QUICK_DRAW: [
    { headline: '⚡ QUICK-DRAW BULLSEYE!', quip: 'Smoke off the button! +{cash} locked in under three seconds flat!', mood: 'INTENSE' },
    { headline: '⚡ SUB-3s BUZZER BEATER!', quip: 'Fastest thumb on Sixth Avenue—+{cash} before the brass section could blink!', mood: 'INTENSE' },
    { headline: '⚡ LIGHTNING LOCK-IN!', quip: 'Zero hesitation under hot lamps—+{cash} puts {rival} on instant notice!', mood: 'WINK' },
  ],
  DIAL_BULLSEYE: [
    { headline: '🎯 DEAD-CENTER DIAL HIT!', quip: 'Swiss-watch precision! +{cash} right inside the exact Range Game band!', mood: 'POISED' },
    { headline: '🎯 PINPOINT CALIBRATION!', quip: 'Parked the needle on a dime for +{cash}—Booth A is tipping its cap!', mood: 'WINK' },
  ],
  DIAL_NEAR_MISS: [
    { headline: '🎯 RAZOR-CLOSE DIAL!', quip: 'Within a coat of varnish of the exact mark—+{cash} for sharp estimation!', mood: 'WINK' },
    { headline: '🎯 MICROMETER TOUCH!', quip: 'Ninety-plus percent dial accuracy banks +{cash} under bright lights!', mood: 'WINK' },
  ],
  REBOUND_SCOOP: [
    { headline: '💰 REBOUND POT SCOOPED!', quip: 'Clean sweep! +{cash} banked including the glowing Studio Rebound Pot!', mood: 'POISED' },
    { headline: '💰 HOUSE POT CLAIMED!', quip: '{rival} left cash on the stage apron and you scooped +{cash} clean!', mood: 'WINK' },
  ],
  SHUTTER_EARLY_SOLVE: [
    { headline: '🔥 EARLY-SHUTTER GENIUS!', quip: 'Solved before the wall even finished opening—+{cash} multiplier windfall!', mood: 'INTENSE' },
    { headline: '🔥 LATERAL MASTERSTROKE!', quip: 'Only Connect brilliance in Living Color—+{cash} rolls onto Podium One!', mood: 'POISED' },
  ],
};

/**
 * Returns a warm celebratory or dry empathetic Grant Bellamy Post-Answer Reveal
 * headline, hostQuip (`<= 95` chars), and reactive portrait mood across 65+ templates!
 */
export function getHostAnswerRevealLineV7(
  ctx: HostAnswerRevealContextV7,
): { readonly headline: string; readonly hostQuip: string; readonly mood: EmceeMoodV7 } {
  const cash = formatDollarsV7(Math.max(0, ctx.cashWon));
  const rival = compactRivalFirstNameV7(ctx.rivalName);
  const streak = Math.max(2, Math.floor(ctx.streak));

  let picked: { readonly headline: string; readonly quip: string };
  let mood: EmceeMoodV7;

  if (!ctx.wasFinalWager && ctx.flavor && ctx.flavor !== 'STANDARD') {
    const flavorPool = HOST_REVEAL_FLAVOR_OVERRIDES_V8[ctx.flavor];
    const entry = flavorPool[pickHostIndexV7(flavorPool.length, ctx.seed)];
    picked = { headline: entry.headline, quip: entry.quip };
    mood = entry.mood;
  } else if (ctx.wasFinalWager) {
    if (ctx.correct) {
      picked =
        HOST_REVEAL_FINAL_WIN_V7[pickHostIndexV7(HOST_REVEAL_FINAL_WIN_V7.length, ctx.seed)];
      mood = 'POISED';
    } else {
      picked =
        HOST_REVEAL_FINAL_MISS_V7[pickHostIndexV7(HOST_REVEAL_FINAL_MISS_V7.length, ctx.seed)];
      mood = 'GASP';
    }
  } else if (ctx.correct && ctx.streak >= 2) {
    const idx = pickHostIndexV7(HOST_REVEAL_STREAK_WIN_V7.length, ctx.seed);
    picked = HOST_REVEAL_STREAK_WIN_V7[idx];
    mood = ctx.streak >= 3 ? 'INTENSE' : 'WINK';
  } else if (ctx.correct) {
    const idx = pickHostIndexV7(HOST_REVEAL_STANDARD_WIN_V7.length, ctx.seed);
    picked = HOST_REVEAL_STANDARD_WIN_V7[idx];
    mood = idx % 2 === 0 ? 'POISED' : 'WINK';
  } else {
    const idx = pickHostIndexV7(HOST_REVEAL_MISS_V7.length, ctx.seed);
    picked = HOST_REVEAL_MISS_V7[idx];
    mood = idx % 3 === 0 ? 'WINK' : 'GASP';
  }

  const fmt = (s: string): string =>
    s
      .replace(/\{cash\}/g, cash)
      .replace(/\{rival\}/g, rival)
      .replace(/\{streak\}/g, String(streak));

  return {
    headline: fmt(picked.headline),
    hostQuip: clampHostCopyV7(fmt(picked.quip), 95),
    mood,
  };
}
