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
  CastIdV7,
  CategoryIdV7,
  ClassicTvTileTwistV7,
  EpisodeBlueprintV7,
  RivalIdV7,
  StageWorldIdV7,
} from '../contracts_v7';

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
  | 'CONCENTRATION_PRIZE_MATCH';

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
// 2. Friendly Spoken 1966 Category & Stage Names + Persona Labels
// ----------------------------------------------------------------------------

const SPOKEN_CAST_NAMES_V7: Record<CastIdV7, string> = {
  CARMEN_DELGADO: 'Carmen Delgado',
  TOBY_OKAFOR: 'Toby Okafor',
  INEZ_CALLAHAN: 'Inez Callahan',
  ALASTAIR_KERR: 'Alastair Kerr',
  SEO_YUN_KANG: 'Seo-Yun Kang',
  REX_CALLOWAY: 'Rex Calloway',
  GRANT_BELLAMY: 'Grant Bellamy',
  ROZ_KORMAN: 'Roz Korman',
  VERA_KARP: 'Vera Karp',
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
  COAST_BRIDGE_CONNECTED: 95,
  TIC_TAC_LINE_JACKPOT: 94,
  CONCENTRATION_PRIZE_MATCH: 93,
  SECRET_SQUARE_DISCOVERY: 92,
  CLASSIC_TOTE_ROW_SWEEP: 91,
  LOCKED_VAULT_CRACK: 90,
  BOOTH_RIGGING_BUSTED: 88,
  HOT_STREAK_5X: 86,
  COMEBACK_LEAD_CHANGE: 84,
  MYSTERY_CURTAIN_REVEAL: 82,
  EYE_GUESS_FLASH_OPEN: 81,
  INSTANT_BARGAIN_TEMPTATION: 80,
  EPISODE_KICKOFF: 78,
  FINAL_2_TURN_NAILBITER: 76,
  RIVAL_MISS_REBOUND: 74,
  HOT_STREAK_3X: 70,
  OPPONENT_CHOICE_CHALLENGE: 66,
  HOT_STREAK_2X: 60,
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
    ['PETER_MARSHALL_WIT', 'QUIZ SHOW ROYALE', 'No cue cards, no lifelines from Aunt Martha—just you, {rival}, and twelve glowing Trilons!'],
  ]),

  // ======== 1B. STAGE-BESPOKE KICKOFFS (STAGES 02, 03, 04, 06, 09 + ALL) ====
  ...buildLineBank(
    'EPISODE_KICKOFF',
    'GOLD',
    [
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

      // Stage 05, 07, 08, 10 Bespoke Flavor Openers
      ['DON_PARDO_BOOTH', 'APOLLO COLOR CONTROL LIVE!', 'From the 1967 Apollo Master Color Control Pavilion—telemetry armillary spinning and Tote Board hot!', 'COBALT', 'STAGE_05_1984_LARSON_CRT_LAB'],
      ['GRANT_BELLAMY_MC', 'MONTE CARLO ROYALE LIVE!', 'Champagne chandeliers and spinning brass roulette in Monte Carlo—match luxury prize halves for +$500!', 'GOLD', 'STAGE_07_1969_MONTE_CARLO_CASINO'],
      ['DON_PARDO_BOOTH', 'WORLD’S FAIR PAVILION!', 'Beneath the orbiting Unisphere rings—link a Coast-to-Coast hex bridge from left to right for +$750!', 'PEACOCK', 'STAGE_08_WORLDS_FAIR_GEODESIC'],
      ['GRANT_BELLAMY_MC', 'PENTHOUSE 38 · FINALE!', 'Thirty-eight floors above Manhattan—climb the Sovereign Ziggurat and line up three for the crown!', 'GOLD', 'STAGE_10_SOVEREIGN_SANCTUM'],
    ],
    'stage',
  ),

  // ======================== 2. 2X HOT STREAK (16) ===========================
  ...buildLineBank('HOT_STREAK_2X', 'PEACOCK', [
    ['ART_FLEMING_HOST', '2× STREAK · BACK TO BACK', 'Two straight on the Tote! Your multiplier is warm and any Locked Vault on the rack just popped!'],
    ['DON_PARDO_BOOTH', '2× DOUBLE HIT!', 'Back-to-back bells in Studio 6A—the Split-Flap drum likes the rhythm you’re playing!'],
    ['PETER_MARSHALL_WIT', '2× TWO IN A ROW', 'Two for two! {rival} just casually pretended to inspect a fingernail at the champion’s desk.'],
    ['GRANT_BELLAMY_MC', '2× MOMENTUM BUILDING', 'A clean brace of answers, challenger—and notice how the showband brass just leaned forward.'],
    ['ART_FLEMING_HOST', '2× SOLARI ROLLING', 'Two consecutive plaques in your column! Keep that cadence and the upper-row dollars multiply fast.'],
    ['DON_PARDO_BOOTH', '2× TALLY LAMPS GREEN', 'Ding-ding! Two straight green lamps and the studio applause sign didn’t even need switching on!'],
    ['PETER_MARSHALL_WIT', '2× WARMING UP', 'Two in the bank! One more and our stagehand owes the trombone section five bucks.'],
    ['ART_FLEMING_HOST', '2× CRISP EXECUTION', 'Back-to-back bullseyes—and remember, a 2-streak automatically springs any $500 Gold Vault padlock!'],
    ['GRANT_BELLAMY_MC', '2× STEADY HAND', 'Twice asked, twice answered. Control Booth A is suddenly flipping through your file.'],
    ['DON_PARDO_BOOTH', '2× COAST-TO-COAST POP', 'Two straight winners! That’s how challengers turn into five-day returning champions!'],
    ['PETER_MARSHALL_WIT', '2× SHARP SHOOTING', 'Two in a row without breaking a studio sweat—even the boom mic operator nodded at that one!'],
    ['ART_FLEMING_HOST', '2× BOARD CONTROL', 'You’ve linked two clean turns! Now press your multiplier edge on a high-dollar plaque.'],
    ['DON_PARDO_BOOTH', '2× BRASS STINGER', 'Hear that Tijuana horn bounce? That’s the sound of a 2-streak catching fire on live TV!'],
    ['GRANT_BELLAMY_MC', '2× COMPOSURE', 'Cool as a network news anchor at seven o’clock—two straight into your purse!'],
    ['PETER_MARSHALL_WIT', '2× PAIR OF ACES', 'Two consecutive strikes! {rival} is asking the floor manager if your buzzer was inspected.'],
    ['ART_FLEMING_HOST', '2× RIGHT ON CUE', 'Two straight chimes on the board—your streak bonus is live for the next plaque!'],
  ]),

  // ======================== 3. 3X HOT STREAK (16) ===========================
  ...buildLineBank('HOT_STREAK_3X', 'TANGERINE', [
    ['DON_PARDO_BOOTH', '3× HAT TRICK ON AIR!', 'Three in a row in Living Color! The studio audience is roaring and {rival} looks rattled!'],
    ['ART_FLEMING_HOST', '3× TRIPLE BELL HEATER', 'Three straight correct! You are commanding this Tote Board like a seasoned Friday champion!'],
    ['PETER_MARSHALL_WIT', '3× THREE STRAIGHT!', 'Three in a row! Somebody bring {rival} a glass of studio water—no ice, don’t shock the nerves!'],
    ['GRANT_BELLAMY_MC', '3× BOOTH SWEATING', 'Three unanswered strikes. I can hear Roz’s lighter snapping through my earpiece from Booth A.'],
    ['DON_PARDO_BOOTH', '3× HAMMOND ORGAN SWELL', 'Three consecutive winners! Milton and the band are cooking with gas on Stage 6A tonight!'],
    ['ART_FLEMING_HOST', '3× MULTIPLIER SURGE', 'That’s a 3-turn heater! Every chip on the board is paying prime-time dividends right now!'],
    ['PETER_MARSHALL_WIT', '3× TIC-TAC-BINGO', 'Three straight chimes! In Hollywood Squares we pay a bonus for that; here you get pure fear from {rival}!'],
    ['DON_PARDO_BOOTH', '3× RED-HOT CONTENDER', 'Bing-bing-bing! Three straight green lamps blazing across fifty million television sets!'],
    ['GRANT_BELLAMY_MC', '3× COMMANDING RUN', 'Three for three! Not bad at all for an unvetted walk-on under network quartz lights.'],
    ['ART_FLEMING_HOST', '3× SHARP AS KODALITH', 'Three straight categories mastered—you’re reading the writers’ minds tonight!'],
    ['PETER_MARSHALL_WIT', '3× HEATER ALERT', 'Three in a row! Our accountant in Standards & Practices just loosened his collar!'],
    ['DON_PARDO_BOOTH', '3× TOTE BOARD TORCHED', 'A triple-play on live network television—{playerCash} on the Split-Flap and still climbing!'],
    ['ART_FLEMING_HOST', '3× DIALED RIGHT IN', 'Three consecutive strikes! This is the exact moment to hunt a $400 or $500 square.'],
    ['GRANT_BELLAMY_MC', '3× PRIME-TIME PACE', 'Three straight chimes, zero hesitation. {rival}’s lead is suddenly looking mighty mortal.'],
    ['PETER_MARSHALL_WIT', '3× STUDIO ELECTRIC', 'Three straight! Even the folks in the balcony who came for the air-conditioning are cheering!'],
    ['DON_PARDO_BOOTH', '3× NONSTOP CHIMES', 'Three straight winners off the Trilon rack—nobody touch the dial!'],
  ]),

  // ======================== 4. 5X HOT STREAK (16) ===========================
  ...buildLineBank('HOT_STREAK_5X', 'TANGERINE', [
    ['DON_PARDO_BOOTH', '5× HISTORIC RUNAWAY!', 'FIVE IN A ROW ON LIVE TELEVISION! Studio 6A is on its feet—what a prime-time clinic!'],
    ['ART_FLEMING_HOST', '5× UNSTOPPABLE STREAK!', 'Five straight without a blemish! We haven’t seen a Tote Board sweep this clean all season!'],
    ['PETER_MARSHALL_WIT', '5× CALL THE FIRE MARSHAL!', 'Five straight! Stop checking the wiring, Booth A—our challenger actually knows this stuff!'],
    ['GRANT_BELLAMY_MC', '5× SOVEREIGN FORM', 'Five consecutive bullseyes! Fifty million Americans just leaned six inches closer to the glass.'],
    ['DON_PARDO_BOOTH', '5× FIVE-ALARM CHIMES!', 'Five straight solenoid bells! The Split-Flap counter can barely keep pace with your purse!'],
    ['ART_FLEMING_HOST', '5× MASTER OF THE RACK', 'Five in a row—science, arts, history, numbers—nothing on this board can trip you up tonight!'],
    ['PETER_MARSHALL_WIT', '5× FIVE FOR FIVE!', 'Five straight! {rival} is quietly checking the bus schedule back to Newark!'],
    ['DON_PARDO_BOOTH', '5× LIVING COLOR LEGEND!', 'A five-turn juggernaut coast to coast! Every marquee bulb in the house is running hot!'],
    ['GRANT_BELLAMY_MC', '5× CONTROL BOOTH PANIC', 'Five straight hits! Vera Karp is smiling with her stopwatch and Roz is chewing her pencil in half.'],
    ['ART_FLEMING_HOST', '5× ENCYCLOPEDIC RUN', 'Five consecutive plaques banked at maximum velocity—pure quiz-show artistry!'],
    ['PETER_MARSHALL_WIT', '5× SHOWBAND OVERDRIVE', 'Five straight! Give the brass section a breath, folks, their lips are going numb from fanfares!'],
    ['DON_PARDO_BOOTH', '5× GOLD-PLATED HEATER!', 'Five unanswered winners! You are rewriting the Studio 6A record book in Living Color!'],
    ['ART_FLEMING_HOST', '5× FLAWLESS STREAK', 'Five straight green tally lamps—your streak multiplier is screaming at peak ceiling!'],
    ['GRANT_BELLAMY_MC', '5× TOUR DE FORCE', 'Five consecutive strikes under three hundred footcandles. Take a bow between picks, challenger!'],
    ['PETER_MARSHALL_WIT', '5× PERFECT HAND', 'Five in a row! In poker that beats a full house; on network TV it buys a convertible!'],
    ['DON_PARDO_BOOTH', '5× COAST-TO-COAST ROAR!', 'Five straight! From Times Square to Sunset Vine, nobody is changing channels tonight!'],
  ]),

  // ======================== 5. SECRET SQUARE DISCOVERY (16) =================
  ...buildLineBank('SECRET_SQUARE_DISCOVERY', 'GOLD', [
    ['DON_PARDO_BOOTH', '⭐ 2× SECRET SQUARE!', 'HOLD EVERYTHING! You found tonight’s hidden Secret Square—Double Dollars on this plaque!'],
    ['PETER_MARSHALL_WIT', '⭐ SECRET SQUARE FOUND!', 'Ding-ding-ding! That’s our Secret Square! Nail this question and the payout doubles on the spot!'],
    ['ART_FLEMING_HOST', '⭐ DAILY DOUBLE STAR!', 'Hear that warbling studio chime? You uncovered the hidden 2× Star—double stakes right here!'],
    ['GRANT_BELLAMY_MC', '⭐ HIDDEN JACKPOT PLAQUE', 'The gold starburst flips! Double Dollars ride on this single answer, challenger—make it count!'],
    ['DON_PARDO_BOOTH', '⭐ MARQUEE STARBURST!', 'Flash the gold #11 bulbs! Tonight’s Secret Square was hiding right under {category}!'],
    ['PETER_MARSHALL_WIT', '⭐ DOUBLE-DOLLAR SURPRISE', 'Well hello, gold star! {rival} was praying you wouldn’t tap {category}—2× payout live!'],
    ['ART_FLEMING_HOST', '⭐ 2× BONUS MULTIPLIER', 'You struck the hidden Secret Square! Take a breath, use your thirty seconds, and bank Double Cash!'],
    ['DON_PARDO_BOOTH', '⭐ STUDIO GASP · 2× LIVE!', 'Listen to that Studio 6A gasp! The hidden 2× Secret Square is wide open in {category}!'],
    ['GRANT_BELLAMY_MC', '⭐ THE STAR PLAQUE', 'There goes the concealed solenoid chime! Twice the dollars if you bring this {category} clue home.'],
    ['PETER_MARSHALL_WIT', '⭐ JACKPOT TRILON!', 'Look at those marquee lights dance—you stepped straight onto the 2× Secret Square!'],
    ['ART_FLEMING_HOST', '⭐ PRIME-TIME BREAK!', 'What a find! Hitting the Secret Square in {category} can swing an entire ten-turn broadcast!'],
    ['DON_PARDO_BOOTH', '⭐ DOUBLE STAKES ON AIR!', 'Gold foil on the Trilon! Nail this {category} clue for an instant 2× Secret Square windfall!'],
    ['PETER_MARSHALL_WIT', '⭐ LUCKY FINGER!', 'Out of every plaque on the rack, you poked the 2× Secret Square! Don’t waste the magic!'],
    ['GRANT_BELLAMY_MC', '⭐ DOUBLE OR GLORY', 'The Secret Square reveals itself in {category}! Show fifty million viewers how to cash a 2× star.'],
    ['ART_FLEMING_HOST', '⭐ STARBURST UNCOVERED!', 'Hidden beneath {category} all along—lock in the right answer and double this plaque’s value!'],
    ['DON_PARDO_BOOTH', '⭐ 2× GOLD CHIME!', 'The Secret Square bell rings out across Studio 6A—Double Dollars are riding on {category}!'],
  ]),

  // ======================== 6. LOCKED VAULT CRACK (16) ======================
  ...buildLineBank('LOCKED_VAULT_CRACK', 'GOLD', [
    ['DON_PARDO_BOOTH', '🔓 $500 VAULT UNLOCKED!', 'CLACK-THUNK! The heavy brass padlock drops—the $500 Gold Vault is wide open on the board!'],
    ['ART_FLEMING_HOST', '🔓 GOLD VAULT OPEN!', 'You sprung the tumblers! That gleaming $500 Gold Vault plaque is unlocked—grab it before {rival} does!'],
    ['PETER_MARSHALL_WIT', '🔓 PADLOCK POPPED!', 'Hear that heavy bolt slide? The $500 Vault is open for business—help yourself to the top shelf!'],
    ['GRANT_BELLAMY_MC', '🔓 SAFE CRACKED LIVE!', 'The stage vault solenoid just released! Five hundred base dollars sitting unguarded on the Tote!'],
    ['DON_PARDO_BOOTH', '🔓 $500 SAFE WIDE OPEN!', 'Tumblers aligned, padlock off! Tap that shining $500 Gold Vault on your next pick for huge cash!'],
    ['ART_FLEMING_HOST', '🔓 VAULT SEAL BROKEN!', 'Smart board geometry! Winning next door cracked the $500 Gold Vault—it’s ready to claim!'],
    ['PETER_MARSHALL_WIT', '🔓 BANK DOOR SWINGS OPEN!', 'The $500 Vault just popped its latch! {rival} is eyeing it too, so don’t leave it sitting there!'],
    ['DON_PARDO_BOOTH', '🔓 GOLD BULLION PLAQUE!', 'Five hundred prime-time dollars just came off lock and key—the Gold Vault Trilon is live!'],
    ['GRANT_BELLAMY_MC', '🔓 TUMBLERS CLEARED', 'That crisp brass clack means the $500 Vault is armed. High risk, magnificent reward.'],
    ['ART_FLEMING_HOST', '🔓 $500 PRIZE SQUARE LIVE!', 'The padlock emblem is gone and the $500 Vault is glowing gold—prime pickings on your next turn!'],
    ['PETER_MARSHALL_WIT', '🔓 OPEN SESAME · $500!', 'No dynamite required—your hot hand just sprung the $500 Studio Vault right on camera!'],
    ['DON_PARDO_BOOTH', '🔓 HEAVY BRASS UNLATCHED!', 'The biggest plaque on the Tote Board is officially unlocked—$500 Gold Vault up for grabs!'],
    ['ART_FLEMING_HOST', '🔓 VAULT READY TO BANK', 'You earned the key and popped the $500 Vault! Strike while your streak multiplier is warm!'],
    ['GRANT_BELLAMY_MC', '🔓 THE $500 SANCTUM OPENS', 'The network safe is unsealed, challenger. Five hundred base chips await a bold finger.'],
    ['PETER_MARSHALL_WIT', '🔓 SAFE-CRACKER SPECIAL!', 'Click, spin, pop! That $500 Gold Vault is naked as a jaybird on the Tote Board now!'],
    ['DON_PARDO_BOOTH', '🔓 $500 VAULT ARMED!', 'Gold marquee lights around the Vault—tap that $500 giant on your very next move!'],
  ]),

  // ======================== 7. RIVAL MISS REBOUND (18) ======================
  ...buildLineBank('RIVAL_MISS_REBOUND', 'EMERALD', [
    ['DON_PARDO_BOOTH', '+$50 REBOUND LIVE!', '+$50 Rebound on the board — steal it!'],
    ['ART_FLEMING_HOST', '+$50 REBOUND OPEN!', '{rival} missed {category}! That plaque stays open with a +$50 Rebound bonus—steal it!'],
    ['PETER_MARSHALL_WIT', 'BUZZER WHIFF · +$50!', 'Brzzzt! {rival} left {category} warm on the counter with +$50 extra—go pick their pocket!'],
    ['DON_PARDO_BOOTH', 'CHAMPION BLINKS · +$50!', 'A rare studio buzzer on {rival}! {category} rebounds wide open at +$50—snatch it right now!'],
    ['GRANT_BELLAMY_MC', '+$50 SWEETENED POT', '{rival} stumbled on {category}, sweetening the Trilon by +$50. Care to clean up the glass?'],
    ['ART_FLEMING_HOST', 'LOOSE CHANGE ON THE TOTE', 'The Champion couldn’t close {category}! Now it’s worth +$50 more and sitting wide open for you!'],
    ['PETER_MARSHALL_WIT', 'FREE +$50 GIFT WRAP!', 'How polite of {rival}—missed {category} and taped a crisp $50 bill to the plaque for you!'],
    ['DON_PARDO_BOOTH', '+$50 REBOUND ON {category}!', 'Buzzer rasps at the Champion’s desk! +{rebound} Rebound added to {category}—steal that square!'],
    ['ART_FLEMING_HOST', 'OPPORTUNITY KNOCKS · +$50', 'Whenever a Champion misses, our solenoid adds +$50 to the plaque—{category} is ripe for the taking!'],
    ['GRANT_BELLAMY_MC', 'RIVAL SLIPS · +$50 BOUNTY', 'Even {rival} is human under quartz lights! {category} bounces back open with a +$50 sweetener!'],
    ['PETER_MARSHALL_WIT', '+$50 ON THE REBOUND!', 'Clang off the rim by {rival}! Grab that +$50 Rebound on {category} before it cools off!'],
    ['DON_PARDO_BOOTH', 'WIDE OPEN REBOUND · +$50!', 'Zero dollars for {rival}, and +$50 tacked straight onto {category}—pounce on that rebound!'],
    ['ART_FLEMING_HOST', '+$50 TOTE SWEETENER', 'Look at {category} flashing green edge—{rival}’s miss boosted its value by +$50!'],
    ['PETER_MARSHALL_WIT', 'THANK THE CHAMPION · +$50', '{rival} did the hard part of adding +$50 to {category}; all you have to do is cash it!'],
    ['GRANT_BELLAMY_MC', '+$50 UNCLAIMED PLAQUE', 'A swing and an electro-mechanical rasp from {rival}! +{rebound} Rebound sits waiting on {category}.'],
    ['DON_PARDO_BOOTH', 'STEAL THE +$50 REBOUND!', '{rival} came up empty! That leaves +{rebound} extra riding on {category}—take it to the bank!'],
    ['ART_FLEMING_HOST', 'CHAMPION’S MISS, YOUR GAIN', 'No score at the rival lectern—{category} stays lit with a juicy +$50 Rebound bonus!'],
    ['PETER_MARSHALL_WIT', '+$50 HOUSE EXTRA!', 'Oof, that buzzer smarts! {category} just jumped by +$50—swoop in and claim the rebound!'],
  ]),

  // ======================== 8. COMEBACK LEAD CHANGE (16) ====================
  ...buildLineBank('COMEBACK_LEAD_CHANGE', 'EMERALD', [
    ['DON_PARDO_BOOTH', 'NEW LEADER ON THE TOTE!', 'LEAD CHANGE IN STUDIO 6A! You storm from behind to overtake {rival} by {lead}!'],
    ['ART_FLEMING_HOST', 'COMEBACK SURGE!', 'Look at those Split-Flap digits spin—you’ve erased the deficit and seized the lead!'],
    ['PETER_MARSHALL_WIT', 'TABLES TURNED LIVE!', 'Wave as you pass {rival} in the fast lane! From trailing to leading in one thunderous swing!'],
    ['GRANT_BELLAMY_MC', 'THE CHALLENGER LEADS!', 'Well, well! Our underdog just flipped the scoreboard upside down—{playerCash} to {rivalCash}!'],
    ['DON_PARDO_BOOTH', 'ROAR FROM THE BALCONY!', 'Listen to Studio 6A erupt! You’ve snatched top billing on the Solari Tote Board!'],
    ['ART_FLEMING_HOST', 'MOMENTUM FLIPPED!', 'Never count a sharp player out—you’ve vaulted past {rival} into first place!'],
    ['PETER_MARSHALL_WIT', 'UPSET ON THE SPLIT-FLAP!', 'Check {rival}’s face on Camera Three! You just erased their cushion and grabbed the driver’s seat!'],
    ['DON_PARDO_BOOTH', 'SCOREBOARD OVERTAKE!', 'Clack-clack-clack go the flaps—challenger on top {playerCash} to {rivalCash} in Living Color!'],
    ['GRANT_BELLAMY_MC', 'CONTROL BOOTH STUNNED', 'You trailed a moment ago; now you hold a {lead} edge. Somebody check Booth A’s blood pressure!'],
    ['ART_FLEMING_HOST', 'RALLY FROM BEHIND!', 'Textbook comeback! You stayed poised, worked the multipliers, and took over the lead!'],
    ['PETER_MARSHALL_WIT', 'COMEBACK KID STRIKES!', 'America loves a rally, and you just served one piping hot—you’re out in front by {lead}!'],
    ['DON_PARDO_BOOTH', 'FIRST PLACE SNATCHED!', 'A dramatic prime-time swing! Our challenger leaps ahead of {rival} on the master board!'],
    ['ART_FLEMING_HOST', 'NEW FRONT-RUNNER!', 'The Peacock Teal counter pulls ahead! Protect this {lead} margin down the homestretch!'],
    ['GRANT_BELLAMY_MC', 'THE PENDULUM SWINGS', 'Fortune favors nerve under studio lights—you’ve surged past the Champion into the lead!'],
    ['PETER_MARSHALL_WIT', 'MIND THE BREEZE, CHAMP!', 'Whoosh! That was our challenger blowing right past {rival} on the Tote Board!'],
    ['DON_PARDO_BOOTH', 'CHALLENGER TAKES COMMAND!', 'From underdog to front-runner in one clutch answer—{playerCash} leads the broadcast!'],
  ]),

  // ======================== 9. FINAL 2-TURN NAILBITER (16) ==================
  ...buildLineBank('FINAL_2_TURN_NAILBITER', 'TANGERINE', [
    ['DON_PARDO_BOOTH', 'FINAL STRETCH · PHOTO FINISH!', 'Down to the final two turns and only {gap} separates these two—nobody breathe in Studio 6A!'],
    ['ART_FLEMING_HOST', 'CRUNCH TIME · {gap} APART!', 'Two turns left on the Tote! One big upper-row plaque decides tonight’s entire purse!'],
    ['PETER_MARSHALL_WIT', 'EDGE-OF-THE-SOFA TIME!', 'Hold your coffee cups at home, folks—two turns left and you can’t slide a dime between these scores!'],
    ['GRANT_BELLAMY_MC', 'HIGH-WIRE HOMESTRETCH', 'Turn {turn} of 10, razor-thin {gap} margin. Every dollar on this rack weighs a ton now.'],
    ['DON_PARDO_BOOTH', 'BARN-BURNER IN LIVING COLOR!', 'Fifty million viewers glued to the glass—{playerCash} vs {rivalCash} heading into the final turns!'],
    ['ART_FLEMING_HOST', 'CLUTCH TERRITORY!', 'Look closely at the dollar tiers—with {gap} between you, pick the square that seals the math!'],
    ['PETER_MARSHALL_WIT', 'SWEATY PALMS AT THE PODIUM!', 'Two turns to go and it’s tighter than a new pair of patent-leather wingtips!'],
    ['DON_PARDO_BOOTH', 'HOMESTRETCH SHOWDOWN!', 'The showband percussion is ticking up—just {gap} apart with the finish line in sight!'],
    ['GRANT_BELLAMY_MC', 'CHAMPIONSHIP NERVE TEST', 'This is why fifty million tune in: final turns, {gap} on the board, zero margin for error.'],
    ['ART_FLEMING_HOST', 'EVERY DOLLAR CRITICAL!', 'We have a genuine Studio 6A nailbiter! Hunt a high-chip plaque or a +$50 Rebound right here!'],
    ['PETER_MARSHALL_WIT', 'DON’T TOUCH THAT DIAL!', 'If our director cuts to commercial right now there’ll be a riot—only {gap} apart in the clutch!'],
    ['DON_PARDO_BOOTH', 'RAZOR’S EDGE · TURN {turn}!', 'Split-Flap neck and neck at {playerCash} to {rivalCash}—this broadcast comes down to the wire!'],
    ['ART_FLEMING_HOST', 'TWO PICKS FROM THE BELL!', 'Stay cool on the studio clock—one crisp answer right here can lock {rival} out for good!'],
    ['GRANT_BELLAMY_MC', 'SUDDEN-DEATH TENSION', 'You can hear the quartz lamps hum in {stage}—{gap} separates victory from heartbreak!'],
    ['PETER_MARSHALL_WIT', 'NAILBITER OF THE WEEK!', 'My cue card is shaking and I’m not even answering! {gap} game with the final bell looming!'],
    ['DON_PARDO_BOOTH', 'CLUTCH TURN IN STUDIO 6A!', 'All eyes on the Tote Board—two final turns to outbank {rival} and claim the purse!'],
  ]),

  // ======================== 10. EPISODE VICTORY (18) ========================
  ...buildLineBank('EPISODE_VICTORY', 'GOLD', [
    ['DON_PARDO_BOOTH', '🏆 NEW STUDIO CHAMPION!', 'BALLGAME IN STUDIO 6A! You outbank {rival} {playerCash} to {rivalCash} in Living Color!'],
    ['ART_FLEMING_HOST', '🏆 EPISODE WINNER!', 'Magnificent broadcast! You outplayed {rival} across ten turns—that entire winner’s purse is yours!'],
    ['PETER_MARSHALL_WIT', '🏆 POP THE CONFETTI!', 'Cue the Tijuana brass and drop the metallic ribbons—our challenger just dethroned {rival}!'],
    ['GRANT_BELLAMY_MC', '🏆 VICTORY ON THE TOTE', '{playerCash} on the master Solari! Take a bow under the spotlights—tonight’s stage belongs to you.'],
    ['DON_PARDO_BOOTH', '🏆 STANDING OVATION!', 'Listen to those cheers echo through 30 Rock! Challenger wins it {playerCash} to {rivalCash}!'],
    ['ART_FLEMING_HOST', '🏆 PURSE CLAIMED!', 'Poise, speed, and prime-time trivia craft—you’ve conquered {stage} fair and square!'],
    ['PETER_MARSHALL_WIT', '🏆 UPSET COMPLETE!', 'Send {rival} home with the lovely parting toaster—the big network check has YOUR name on it!'],
    ['DON_PARDO_BOOTH', '🏆 MARQUEE LIGHTS BLAZING!', 'Every #11 bulb in the house is flashing gold—{playerCash} banks a thrilling prime-time triumph!'],
    ['GRANT_BELLAMY_MC', '🏆 CONTROL BOOTH SILENCED', 'Unscripted, unrigged, undeniable. You beat {rival} straight up in front of fifty million witnesses!'],
    ['ART_FLEMING_HOST', '🏆 TEXTBOOK CHAMPIONSHIP!', 'After ten electric turns, your column stands tallest on the Tote—congratulations, Champion!'],
    ['PETER_MARSHALL_WIT', '🏆 BREAK THE BANK!', '{playerCash} in crisp broadcast dollars! Even our stingiest sponsor is clapping in the VIP box!'],
    ['DON_PARDO_BOOTH', '🏆 COAST-TO-COAST WINNER!', 'From New York to Los Angeles, salute tonight’s newest World’s Smartest winner!'],
    ['ART_FLEMING_HOST', '🏆 GOING UP THE LADDER!', 'Another champion toppled, another fat deposit into your purse—onward to the next soundstage!'],
    ['GRANT_BELLAMY_MC', '🏆 SOVEREIGN FINISH', 'A commanding {lead} victory margin! Step forward for the Winner’s Purse Ceremony!'],
    ['PETER_MARSHALL_WIT', '🏆 PURE GOLD BROADCAST!', 'Ten turns, nerves of brushed aluminum, and {playerCash} in the vault—what a television show!'],
    ['DON_PARDO_BOOTH', '🏆 FANFARE FOR THE CHAMP!', 'Hit that showband brass! {playerCash} tops {rival} as Studio 6A goes wild!'],
    ['ART_FLEMING_HOST', '🏆 UNDISPUTED TONIGHT!', 'You read the board, worked the twists, and closed the show like a network legend!'],
    ['PETER_MARSHALL_WIT', '🏆 RING THE WINNER’S BELL!', 'Ding-ding-ding! Pack the cash trunk, folks—our challenger owns the studio tonight!'],
  ]),

  // ======================== 11. BONUS CLASSIC TV TWISTS (20) ================
  ...buildLineBank('MYSTERY_CURTAIN_REVEAL', 'CERISE', [
    ['DON_PARDO_BOOTH', '❓ MYSTERY CURTAIN!', 'Part the velvet drapes—let’s see what prize is hiding behind tonight’s Mystery Curtain!'],
    ['PETER_MARSHALL_WIT', '❓ CURTAIN #1, #2 OR #3?', 'Monty would be proud! No livestock back there, folks—pure 1966 Mystery Curtain action!'],
    ['ART_FLEMING_HOST', '❓ WILD CURTAIN TWIST!', 'You pulled the Mystery Curtain cord! Instant cash, a Rival steal, or Double Chips on the spin!'],
    ['GRANT_BELLAMY_MC', '❓ VELVET DRAPE SURPRISE', 'Cue the showband drumroll—a Mystery Curtain plaque always spices up the Tote!'],
    ['DON_PARDO_BOOTH', '❓ SPIN THE CURTAIN WHEEL!', 'Mod Cerise lights flashing! What twist did Control Booth A tuck behind the velvet curtain?'],
  ]),

  ...buildLineBank('OPPONENT_CHOICE_CHALLENGE', 'CERISE', [
    ['ART_FLEMING_HOST', '🎭 RIVAL’S PICK · 1.5×!', '{rival} hand-picked this tricky category to trip you—beat it for a sweet 1.5× Spite Bonus!'],
    ['PETER_MARSHALL_WIT', '🎭 THROWN GAUNTLET!', '{rival} dared you to tap {category}! Answer right and cash the 1.5× Spite Bonus right in their face!'],
    ['GRANT_BELLAMY_MC', '🎭 CHAMPION’S DARE', 'An Opponent’s Choice square! {rival} set the trap—turn it into +$100 and 1.5× extra multiplier!'],
    ['DON_PARDO_BOOTH', '🎭 1.5× SPITE BOUNTY!', 'You stepped straight into {rival}’s chosen test! Conquer {category} for bonus spite cash!'],
    ['PETER_MARSHALL_WIT', '🎭 DOUBLE DARE ON AIR!', 'Bold tap! Nothing rattles a Champion faster than acing the very category they picked for you!'],
  ]),

  ...buildLineBank('INSTANT_BARGAIN_TEMPTATION', 'TANGERINE', [
    ['DON_PARDO_BOOTH', '🔔 INSTANT BARGAIN BELL!', 'STOP THE TOTE BOARD! The Instant Bargain turntable is spinning with a mid-show studio temptation!'],
    ['PETER_MARSHALL_WIT', '🔔 SALE OF THE CENTURY!', 'Hear that bargain bell? Trade a sliver of live score right now for a permanent studio edge—or pass!'],
    ['ART_FLEMING_HOST', '🔔 SPECIAL DESK OFFER!', 'An Instant Bargain from our prize desk! Weigh your scoreboard cushion before tapping Buy or Pass!'],
    ['GRANT_BELLAMY_MC', '🔔 REVOLVING PLINTH LIVE', 'Temptation on the velvet turntable, challenger. Spend a few live dollars now to multiply the finish?'],
    ['DON_PARDO_BOOTH', '🔔 ONE-TAP STUDIO DEAL!', 'Spotlight on the bargain pedestal! Will you keep your cash lead or invest in firepower?'],
  ]),

  ...buildLineBank('BOOTH_RIGGING_BUSTED', 'EMERALD', [
    ['DON_PARDO_BOOTH', '🚨 BOOTH RIGGING BUSTED!', 'INTERCEPTED ON LIVE TV! You caught Control Booth A feeding a live tell—+$400 Clean Bounty!'],
    ['ART_FLEMING_HOST', '🚨 STANDARDS ARREST!', 'Vera Karp clicks her stopwatch! Booth A’s signal is cut and $400 Clean Purse cash goes to you!'],
    ['PETER_MARSHALL_WIT', '🚨 CAUGHT RED-HANDED!', 'Smile for the FCC, {rival}! Our challenger spotted that studio tell from forty feet away!'],
    ['GRANT_BELLAMY_MC', '🚨 FEED TERMINATED!', 'Sharp eyes, challenger! You severed the Booth feed and rattled {rival} right at the podium!'],
    ['DON_PARDO_BOOTH', '🚨 +$400 WHISTLEBLOWER HIT!', 'Siren in the rafters! Clean Purse bounty awarded and the Champion’s cheat line is dead!'],
  ]),

  // ================ 12. 6-MODE 1960s BOARD GAMEPLAY CALLS (56) ==============
  ...buildLineBank('CLASSIC_TOTE_ROW_SWEEP', 'GOLD', [
    ['DON_PARDO_BOOTH', '★ FULL ROW SWEEP · +$250!', 'CLEAN SWEEP ACROSS THE TOTE! Claiming an entire horizontal tier banks an instant +$250 Row Bonus!'],
    ['ART_FLEMING_HOST', '★ +$250 TIER BONUS!', 'Every plaque across that dollar row belongs to you—+$250 Classic Tote Sweep added to your purse!'],
    ['PETER_MARSHALL_WIT', '★ STRAIGHT ACROSS · +$250!', 'You cleared that shelf faster than a bargain basement—+$250 Row Sweep straight into the bank!'],
    ['DON_PARDO_BOOTH', '★ ISOLATION ROW SWEEP!', 'Crossbar relays lock green inside the Teak & Teal Isolation Booth—+$250 Row Sweep banked in silence!', 'PEACOCK', 'STAGE_04_1958_ISOLATION_VAULT'],
    ['GRANT_BELLAMY_MC', '★ SOUNDPROOF PRECISION!', 'Clinical sweep across the Isolation Tote Desk—+$250 bonus while {rival} watches through the glass!', 'GOLD', 'STAGE_04_1958_ISOLATION_VAULT'],
    ['ART_FLEMING_HOST', '★ RELAY PAIR COMPLETE!', 'Every supervisory lamp on that Isolation Booth tier is lit—+$250 Row Bonus confirmed!', 'PEACOCK', 'STAGE_04_1958_ISOLATION_VAULT'],
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
];

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
  background: rgba(11, 29, 48, 0.94);
  color: #f4a91f;
  clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
  font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.05em;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
}

/* Main Diagonal Lower-Third Broadcast Super Blade */
.ws7-announcer-body-blade {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 26px 10px 16px;
  background: linear-gradient(
    98deg,
    rgba(11, 29, 48, 0.96) 0%,
    rgba(11, 29, 48, 0.92) 78%,
    rgba(30, 86, 197, 0.82) 100%
  );
  clip-path: polygon(11px 0, 100% 0, calc(100% - 15px) 100%, 0 100%);
}

/* Leading Diagonal Living Color Fin */
.ws7-announcer-body-blade::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: var(--ws7-chyron-accent);
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

.ws7-announcer-mic-emblem {
  width: 24px;
  height: 24px;
  min-width: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #f4a91f;
  filter: drop-shadow(0 0 6px rgba(244, 169, 31, 0.38));
}

.ws7-announcer-copy {
  margin: 0;
  font-family: 'Plus Jakarta Sans', 'Jost', sans-serif;
  font-size: clamp(15px, 1.55vw, 18px);
  font-weight: 700;
  line-height: 1.32;
  letter-spacing: 0.005em;
  color: #f7eedb;
  word-break: normal;
  overflow-wrap: normal;
  hyphens: none;
  text-shadow: 0 1px 2px rgba(11, 29, 48, 0.9);
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
    padding: 8px 18px 8px 14px;
    gap: 9px;
    clip-path: polygon(8px 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
  }

  .ws7-announcer-copy {
    font-size: 15px;
    line-height: 1.28;
  }
}

/* Mobile Landscape (844x390): Ultra-sleek lower-left chyron */
@media (max-height: 480px) and (orientation: landscape) {
  .ws7-announcer-stage {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 6px);
    left: calc(env(safe-area-inset-left, 0px) + 10px);
    justify-content: flex-start;
  }

  .ws7-announcer-ribbon {
    max-width: min(560px, 76vw);
  }

  .ws7-announcer-body-blade {
    padding: 6px 18px 6px 13px;
  }

  .ws7-announcer-copy {
    font-size: 14.5px;
    line-height: 1.24;
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
    : 'that plaque';

  const playerCash = ctx.playerCash ?? 0;
  const rivalCash = ctx.rivalCash ?? 0;
  const diff = Math.abs(playerCash - rivalCash);
  const reboundBonus = ctx.reboundBonus ?? 50;
  const episodeLabel = ctx.isDailyBroadcast
    ? `Daily Broadcast #${ctx.dailyEpisodeNumber ?? 1}`
    : ctx.blueprint?.code ?? 'Tonight’s Broadcast';

  const rendered = template
    .replace(/\{rival\}/g, rivalName)
    .replace(/\{stage\}/g, stageName)
    .replace(/\{category\}/g, categoryName)
    .replace(/\{playerCash\}/g, formatDollarsV7(playerCash))
    .replace(/\{rivalCash\}/g, formatDollarsV7(rivalCash))
    .replace(/\{cash\}/g, formatDollarsV7(ctx.cashDelta ?? playerCash))
    .replace(/\{rebound\}/g, formatDollarsV7(reboundBonus))
    .replace(/\{lead\}/g, formatDollarsV7(Math.max(10, diff)))
    .replace(/\{gap\}/g, diff === 0 ? 'a dead-even tie' : formatDollarsV7(diff))
    .replace(/\{streak\}/g, String(Math.max(2, ctx.streak ?? 2)))
    .replace(/\{turn\}/g, String(ctx.turnNumber ?? 9))
    .replace(/\{episode\}/g, episodeLabel);

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
  private readonly micEmblemEl: HTMLSpanElement | null = null;
  private readonly copyEl: HTMLParagraphElement | null = null;
  private readonly spectrumRuleEl: HTMLDivElement | null = null;

  private readonly linesByEvent = new Map<AnnouncerEventIdV7, StudioAnnouncerLineSpecV7[]>();
  private readonly shuffleBags = new Map<string, StudioAnnouncerLineSpecV7[]>();
  private readonly lastLineIdByBucket = new Map<string, string>();
  private readonly spokenLineIdsSession = new Set<string>();

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

    // Index all 188+ lines by event trigger
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

      const micEmblem = document.createElement('span');
      micEmblem.className = 'ws7-announcer-mic-emblem';

      const copy = document.createElement('p');
      copy.className = 'ws7-announcer-copy';

      bodyBlade.append(micEmblem, copy);

      const spectrumRule = document.createElement('div');
      spectrumRule.className = 'ws7-announcer-spectrum-rule';

      ribbon.append(kickerRow, bodyBlade, spectrumRule);
      stage.appendChild(ribbon);
      this.host.appendChild(stage);

      this.stageEl = stage;
      this.ribbonEl = ribbon;
      this.kickerBladeEl = kickerBlade;
      this.speakerBladeEl = speakerBlade;
      this.micEmblemEl = micEmblem;
      this.copyEl = copy;
      this.spectrumRuleEl = spectrumRule;
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
    const lineSpec = this.drawNonRepeatingLine(event, resolvedStageId);
    const personaMeta = PERSONA_DISPLAY_LABELS_V7[lineSpec.persona];
    const renderedText = interpolateAnnouncerTemplateV7(lineSpec.template, effectiveCtx);
    const kickerTag = (ctx.customBadgeOverride ?? lineSpec.kickerTag).trim();

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
      default:
        return null;
    }
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
