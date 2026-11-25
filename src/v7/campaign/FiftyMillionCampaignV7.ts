// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.5 — 1966 IN LIVING COLOR)
// `src/v7/campaign/FiftyMillionCampaignV7.ts`
// 90-Episode 1966 Network TV Broadcast Thriller, Zero-Friction Episode 1
// Default Waiver (`ensureDefaultWaiverIfMissing`), TV Guide Wit & Plain-English
// Scaffolding, Honest-Loss 2:30 AM Vault Drops, Golden Exits, Episode 45
// Control-Booth Coup, VIP Balcony Jury & 5 Stage-10 Penthouse Endings.
// ============================================================================

import {
  ALL_BOARD_PLAY_MODES_V7,
  CAREER_MEDAL_SPECS_V7,
  type BoardIdV7,
  type BoardPlayModeV7,
  type BoardTwistIdV7,
  type BroadcastSettingsV7,
  type BrokerIdV7,
  type CampaignSaveStateV7,
  type CareerMedalIdV7,
  type CastIdV7,
  type ContestantWaiverV7,
  type CoupRegimeIdV7,
  type DayJobIdV7,
  type DifficultyModeV7,
  type EpisodeBlueprintV7,
  type FoilFinishV7,
  type LienGoalIdV7,
  type OwnedRelicV7,
  type RivalIdV7,
  type StageViceIdV7,
  type StageWorldIdV7,
  type TrophySpecV7,
} from '../contracts_v7';
import {
  CAST_PROFILES_V7,
  getChampionCurtainRaiserLineV7,
  MAX_TRUNK_SLOTS_V7,
  RELIC_BY_ID_V7,
  RIVAL_IDS_V7,
  SEASON_RIVALS_V7,
  TROPHY_CATALOG_V7,
  validateTrunkLoadoutV7,
} from './CastAndRelicsCatalogV7';

export { TROPHY_CATALOG_V7 };

export const CAMPAIGN_SAVE_STORAGE_KEY_V7 = 'ws_v7_campaign_save_1';
export const SHOWRUNNER_META_STORAGE_KEY_V7 = 'ws_v7_showrunner_meta_1';
export const LIEN_SEGMENT_COST_CASH_V7 = 18500; // 12 segments x $18,500 = $222,000 full network buyout
export const MAX_ENTITY_COOLDOWN_KEYS_V7 = 300; // ~25-match cross-toy entity cooldown ring

type CampaignSaveStatePersistedV7 = CampaignSaveStateV7 & {
  masteredModeDifficulties?: string[];
  lastWaiverStampedEpisode?: number;
  lastWaiverStampedBroker?: BrokerIdV7;
};

const VALID_BROKERS_SET_V7 = new Set<BrokerIdV7>([
  'GRANT_BELLAMY',
  'ROZ_KORMAN',
  'VERA_KARP',
]);

function lienGoalToBrokerV7(lienGoal: LienGoalIdV7): BrokerIdV7 {
  if (lienGoal === 'DIRTY_HOUSE_MARKER') return 'ROZ_KORMAN';
  if (lienGoal === 'STAGE_10_BIBLE') return 'VERA_KARP';
  return 'GRANT_BELLAMY';
}

const VALID_BOARD_PLAY_MODES_SET_V7 = new Set<string>(ALL_BOARD_PLAY_MODES_V7);
const VALID_DIFFICULTY_MODES_SET_V7 = new Set<DifficultyModeV7>([
  'MATINEE_EASY',
  'PRIMETIME_NORMAL',
  'ALLSTAR_HARD',
  'MASTERMIND',
]);
const VALID_CAREER_MEDAL_IDS_SET_V7 = new Set<string>(Object.keys(CAREER_MEDAL_SPECS_V7));
const VALID_COUP_REGIMES_SET_V7 = new Set<CoupRegimeIdV7>([
  'NONE',
  'REGIME_A_ROZ_PHARMA',
  'REGIME_B_BELLAMY_UHF',
  'REGIME_C_VERA_FORENSIC',
]);
const VALID_FOIL_FINISHES_SET_V7 = new Set<FoilFinishV7>([
  'GILDED',
  'SILVER_HALIDE',
  'DICHROIC',
  'TAX_STAMPED',
]);
const VALID_DAY_JOBS_SET_V7 = new Set<DayJobIdV7>([
  'PATENT_CLERK',
  'MONOLOGUE_WRITER',
  'VEGAS_ACTUARY',
  'NIGHT_FACT_CHECKER',
]);
const VALID_STAGE_VICES_SET_V7 = new Set<StageViceIdV7>([
  'DOUBLE_OR_NOTHING',
  'KNOW_IT_ALL',
  'SCOREBOARD_GRUDGE',
]);
const VALID_LIEN_GOALS_SET_V7 = new Set<LienGoalIdV7>([
  'CLEAN_PURSE_250K',
  'DIRTY_HOUSE_MARKER',
  'STAGE_10_BIBLE',
]);

function sanitizeFiniteIntV7(
  value: unknown,
  fallback: number,
  min: number,
  max?: number,
): number {
  if (value === null || value === undefined || typeof value === 'boolean' || value === '') {
    return fallback;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  const floored = Math.floor(num);
  const clampedLow = Math.max(min, floored);
  return typeof max === 'number' ? Math.min(max, clampedLow) : clampedLow;
}

const FRIENDLY_STAGE_CALLSIGNS_V7: Record<StageWorldIdV7, string> = {
  STAGE_01_IBC_DAYTIME_FUNK: '30 ROCK STUDIO 6A',
  STAGE_02_IBC_PRIMETIME_JUBILEE: 'TELEVISION CITY JUBILEE',
  STAGE_03_1926_VAUDEVILLE_PIT: 'BURBANK POP-ART STAGE',
  STAGE_04_1958_ISOLATION_VAULT: '1964 TEAK ISOLATION BOOTH',
  STAGE_05_1984_LARSON_CRT_LAB: '1967 APOLLO COLOR CONTROL',
  STAGE_06_ATLANTIC_CITY_PIER: 'ATLANTIC CITY STEEL PIER',
  STAGE_07_1969_MONTE_CARLO_CASINO: 'MONTE CARLO SALON',
  STAGE_08_WORLDS_FAIR_GEODESIC: 'QUEENS UNISPHERE PAVILION',
  STAGE_09_CHANNEL_83_UHF_BARGE: 'OFFSHORE CHANNEL 83 SHIP',
  STAGE_10_SOVEREIGN_SANCTUM: '36TH-FLOOR PENTHOUSE',
};

// ----------------------------------------------------------------------------
// 1. 5 Playable Stage-10 Penthouse Endings & Season 4 VIP Balcony Jury Ballot
// ----------------------------------------------------------------------------

export type FinaleEndingIdV7 =
  | 'ENDING_01_SOVEREIGN_WHISTLEBLOWER'
  | 'ENDING_02_NEW_VELVET_HOST'
  | 'ENDING_03_CONTRABAND_SYNDICATE'
  | 'ENDING_04_CLEAN_WALKAWAY'
  | 'ENDING_05_CHANNEL_83_PIRATE_TAKEOVER';

export interface FinaleEndingSpecV7 {
  readonly endingId: FinaleEndingIdV7;
  readonly trophyId: string;
  readonly title: string;
  readonly subtitle: string;
  readonly headlineBanner: string;
  readonly epilogueParagraphs: readonly [string, string, string];
  readonly keyBroker: BrokerIdV7;
}

export const FINALE_ENDINGS_V7: Record<FinaleEndingIdV7, FinaleEndingSpecV7> = {
  ENDING_01_SOVEREIGN_WHISTLEBLOWER: {
    endingId: 'ENDING_01_SOVEREIGN_WHISTLEBLOWER',
    trophyId: 'trophy_s4_34',
    title: 'The Prime-Time Whistleblower',
    subtitle: 'Ending I — Coast-to-Coast Congressional Broadcast',
    headlineBanner: 'CONTROL BOOTH A RIGGING LEDGER READ LIVE TO FIFTY MILLION HOMES',
    epilogueParagraphs: [
      'When the final Penthouse tote board chimed in your favor, you walked straight past Grant Bellamy’s oversized presentation check. With Camera One’s red tally lamp burning bright, you held Vera Karp’s carbon-stamped rigging ledger up to the lens while fifty million forks paused over TV dinners from Manhattan to Malibu.',
      'Behind the double glass of Control Booth A, Roz Korman’s headset froze mid-whisper as Master Control refused to cut the feed. By 6:00 AM, Federal Marshals had padlocked the thirty-fourth floor and voided every predatory contestant bond on Sixth Avenue—clearing Carmen’s Queens clinic, Toby’s lineman pension, and Inez’s retirement on a single morning docket.',
      'Six months later, Vera Karp chairs the new Public Broadcast Standards Desk in Washington—and your dented Studio 6A push-button sits under glass at the Smithsonian beside a brushed-brass plaque reading: NO QUESTION IS FAIR UNTIL THE BOOTH PLAYS SQUARE.',
    ],
    keyBroker: 'VERA_KARP',
  },
  ENDING_02_NEW_VELVET_HOST: {
    endingId: 'ENDING_02_NEW_VELVET_HOST',
    trophyId: 'trophy_s4_35',
    title: 'The New Voice of Eight O’Clock',
    subtitle: 'Ending II — Keys to Studio 6A',
    headlineBanner: 'UNDEFEATED CHALLENGER TAKES THE RIBBON MIC AS BELLAMY STEPS ASIDE',
    epilogueParagraphs: [
      'Grant Bellamy watched the split-flap counters clatter to rest on your winning total, touched two fingers to his silver cufflinks, and unscrewed the brass nameplate from the host lectern himself. In twelve seasons of network color, nobody had ever beaten the Penthouse house math on live air.',
      'Before CBS could reach your dressing-room telephone, terrified Sixth Avenue executives rode down from the thirty-fourth floor with the one offer big enough to keep you in the building: the custom midnight-blue dinner jacket, final lock on every trivia vault, and forty-two percent of coast-to-coast syndication.',
      'Every Friday at eight sharp, the NBC-style peacock blooms across fifty million living-room sets as you tap a crisp cream cue card against the walnut rail—hosting the fastest, wittiest, squarest half-hour in American television.',
    ],
    keyBroker: 'GRANT_BELLAMY',
  },
  ENDING_03_CONTRABAND_SYNDICATE: {
    endingId: 'ENDING_03_CONTRABAND_SYNDICATE',
    trophyId: 'trophy_s4_33',
    title: 'The Back-Room Kingpin',
    subtitle: 'Ending III — Behind the One-Way Booth Glass',
    headlineBanner: 'NEW SIXTH AVENUE BROKER CALLS THE ODDS ABOVE STUDIO 6A',
    epilogueParagraphs: [
      'You stopped needing anybody’s blessing the night your Backstage Cash eclipsed Roz Korman’s entire sponsor war chest. While metallic confetti drifted under the 300-footcandle Penthouse lamps, Roz quietly slid the brass master key to Control Booth A across the talkback console.',
      'From Monte Carlo’s roulette stage to Burbank’s Pop-Art wall, every spotlight wink, revolving prize turntable, and canary-yellow halftime envelope now clears through your five-slot Studio Trunk first. Alastair Kerr and Seo-Yun Kang send polite champagne upstairs just to keep their prime-time bookings.',
      'To fifty million families watching in Living Color, you retired an undefeated folk hero; to everyone wearing a headset along Sixth Avenue, yours is the quiet initial on every check that clears.',
    ],
    keyBroker: 'ROZ_KORMAN',
  },
  ENDING_04_CLEAN_WALKAWAY: {
    endingId: 'ENDING_04_CLEAN_WALKAWAY',
    trophyId: 'trophy_s4_32',
    title: 'The Quarter-Million Walkaway',
    subtitle: 'Ending IV — Paid in Full, Zero Strings Attached',
    headlineBanner: 'UNDEFEATED STAND-IN CASHES CERTIFIED $250,000 CHECK AND WALKS FREE',
    epilogueParagraphs: [
      'All twelve gold spokes on your Network Buyout Wheel snapped open in unison, releasing your exclusivity contract live over the studio boom mics to a roaring standing ovation from Row A to the velvet balcony.',
      'Backstage, Grant Bellamy offered a five-year hosting contract; Roz Korman offered double in Geneva bank drafts; Vera Karp offered a Senate press flash. You signed only the certified $250,000 cashier’s receipt, folded your lucky Episode 1 call-sheet into your coat pocket, and took the local elevator down to the lobby.',
      'Outside on Sixth Avenue, warm rain shimmered in the marquee lights and smelled like roasted chestnuts and late-edition newsprint instead of hot camera tubes. For the first time in ninety broadcasts, nobody in a control booth knew where you were walking next.',
    ],
    keyBroker: 'VERA_KARP',
  },
  ENDING_05_CHANNEL_83_PIRATE_TAKEOVER: {
    endingId: 'ENDING_05_CHANNEL_83_PIRATE_TAKEOVER',
    trophyId: 'trophy_s4_29',
    title: 'Pirate Channel 83 Takeover',
    subtitle: 'Ending V — Fifty Kilowatts Past the Three-Mile Line',
    headlineBanner: 'PENTHOUSE FEED HIJACKED LIVE TO OFFSHORE UHF PARTY SHIP',
    epilogueParagraphs: [
      'Eight bars into the victory fanfare, Toby Okafor’s copper jumper patched the Penthouse master video bus straight out to the offshore radio ship anchored three miles beyond the Jersey Coast Guard buoys.',
      'Before Master Control could pull the patch cords, you, Carmen, Toby, and Inez threw open the network’s entire prize vault live across free-air UHF Channel 83—turning every tin-foil rabbit-ear antenna on the Eastern Seaboard into a living-room giveaway.',
      'Sixth Avenue’s quiz monopoly vanished before the eleven o’clock news, while out on the salt-sprayed Atlantic deck, chasing #11 tungsten bulbs still blaze warm gold above your turntable stage: NO SPONSORS, NO FIXERS, BEST BRAIN WINS.',
    ],
    keyBroker: 'GRANT_BELLAMY',
  },
};

export interface VipJuryBallotV7 {
  readonly active: boolean;
  readonly boonVoter: RivalIdV7;
  readonly boonTitle: string;
  readonly boonSummary: string;
  readonly boonChipsPerTurn: number;
  readonly baneVoter: RivalIdV7;
  readonly baneTitle: string;
  readonly baneSummary: string;
  readonly baneMultPenalty: number;
  readonly rivalEvBonusRatio: number;
}

// ----------------------------------------------------------------------------
// 2. 90 Handcrafted 1966 TV Guide Episode Titles (136 Branched Scripts!)
// ----------------------------------------------------------------------------

const SEASON_1_TITLES: readonly string[] = [
  'Bellevue’s Night-Shift Angel', // E01 — Carmen Delgado (Painted!)
  'Sparks Under Contestant Podium Two', // E02 — Toby Okafor (Painted!)
  'Quiet Please: The Librarian Is In', // E03 — Inez Callahan (Painted!)
  'Topeka Blue Ribbon vs. the Tote', // E04 — Dotty Vance
  'Three Hundred on the Lanes', // E05 — Chet Kowalski
  '2:30 AM: Burbank Pop-Art Pilot Tape', // E06 — Peggy Sue Connors (Vault 1: Burbank Pop-Art Carnival)
  'Never Bet Against Bellevue Night Shift', // E07 — Carmen Delgado
  'A Word From Our Nervous Sponsor', // E08 — Dotty Vance
  'Don’t Touch That Dial, Folks', // E09 — Chet Kowalski
  'Talcum Powder & Flop Sweat at Eight', // E10 — Toby Okafor
  'The Canary-Yellow Commercial Break', // E11 — Inez Callahan
  'Inside the $64,000 Teak Glass Booth', // E12 — Carmen Delgado (Vault 2: 1964 Isolation Booth)
  'First-Class Clipper From JFK to Studio 6A', // E13 — Peggy Sue Connors
  'Dewey Decimal 813 & Double Dollars', // E14 — Inez Callahan
  'Spare Ball & Five-Hundred-Dollar Squares', // E15 — Chet Kowalski
  'Double Dollars After the Station Break', // E16 — Peggy Sue Connors
  'Vera Karp Brought Her Stopwatch', // E17 — Dotty Vance
  '1967 Apollo Master Color Control', // E18 — Buzz Halvorsen (Vault 3: Apollo Control Pavilion)
  'Honor Among Green-Room Strangers', // E19 — Toby Okafor
  'Swinging London Calls Studio 6A', // E20 — Gigi St. Clair
  'Sweeps-Week Crossword on Sixth Avenue', // E21 — Walter Pringle
  'Pack Your Trunk for the Coast-to-Coast Tour', // E22 — Inez Callahan
];

const SEASON_2_TITLES: readonly string[] = [
  'Saltwater Taffy & $500 Squares', // E23 -> STAGE_06 Steel Pier
  'Live via Early Bird: Monte Carlo!', // E24 -> STAGE_07 Monte Carlo
  'High Noon Under the Queens Unisphere', // E25 -> STAGE_08 World's Fair
  'Three Miles Off Jersey: Channel 83!', // E26 -> STAGE_09 Channel 83 Ship
  'Tilt Bells on Atlantic City’s Pier', // E27 -> STAGE_06 Steel Pier
  'Boardwalk Clear-Out (Carmen’s Exit)', // E28 -> STAGE_06 Golden Exit 1
  'Atomic Starbursts Over Flushing', // E29 -> STAGE_08 World's Fair
  'Fifty Kilowatts & Atlantic Swells', // E30 -> STAGE_09 Channel 83 Ship
  'Wurlitzer Pipes & Pier Jackpots', // E31 -> STAGE_06 Steel Pier
  'Tuxedos, Francs & Dealing Shoes', // E32 -> STAGE_07 Monte Carlo
  'Long Shadows at the World’s Fair', // E33 -> STAGE_08 World's Fair
  'Unisphere Sweep (Toby’s Freedom)', // E34 -> STAGE_08 Golden Exit 2
  'Ferris-Wheel Lights & Flying Bumpers', // E35 -> STAGE_06 Steel Pier
  'Midnight Baccarat in Monte Carlo', // E36 -> STAGE_07 Monte Carlo
  'Space-Age Showdown at the Fairgrounds', // E37 -> STAGE_08 World's Fair
  'Coast Guard Searchlight Off Starboard', // E38 -> STAGE_09 Channel 83 Ship
  'High Tide on the Atlantic City Boardwalk', // E39 -> STAGE_06 Steel Pier
  'Offshore Amnesty (Inez’s Freedom Special)', // E40 -> STAGE_09 Golden Exit 3
  'Orbiting Rings & Five-Hundred-Dollar Stakes', // E41 -> STAGE_08 World's Fair
  'Tin-Foil Rabbit Ears Across the Seaboard', // E42 -> STAGE_09 Channel 83 Ship
  'Last Call at the Steel Pier Ballroom', // E43 -> STAGE_06 Steel Pier
  'Grand Monte Carlo Sweeps Showcase', // E44 -> STAGE_07 Golden Exit 4
  '11:00 PM in Monte Carlo: Coup in Booth A!', // E45 -> STAGE_07 Coup Pivot!
];

const SEASON_3_TITLES_BY_REGIME: Record<
  Exclude<CoupRegimeIdV7, 'NONE'>,
  readonly string[]
> = {
  REGIME_A_ROZ_PHARMA: [
    'Jubilee Premiere: Vanguard Miracle Tonic!', // E46 -> STAGE_02 Jubilee
    'Silk Handcuffs in Monte Carlo', // E47 -> STAGE_07 Monte Carlo
    'Invisible Ink in Apollo Color Control', // E48 -> STAGE_05 Apollo Control
    'Sponsor’s Skybox Over Steel Pier', // E49 -> STAGE_06 Steel Pier
    'Champagne in the Jubilee VIP Box', // E50 -> STAGE_02 Jubilee
    'Pink Carbon IOUs at the Roulette Table', // E51 -> STAGE_07 Monte Carlo
    'Telemetry Fix on Monitor Bank Four', // E52 -> STAGE_05 Apollo Control
    'Alastair’s Boardwalk Guarantee', // E53 -> STAGE_06 Steel Pier
    'Midnight Bookkeeping at Television City', // E54 -> STAGE_02 Jubilee
    'Careful—That Riviera Tip Bites Back', // E55 -> STAGE_07 Monte Carlo
    'Apollo Color-Bar Sponsor Override', // E56 -> STAGE_05 Apollo Control
    'Two Wax Seals on the Atlantic Boardwalk', // E57 -> STAGE_06 Steel Pier
    'The Jubilee Tote Board Runs a Fever', // E58 -> STAGE_02 Jubilee
    'Vince’s Monte Carlo House Margin', // E59 -> STAGE_07 Monte Carlo
    'Overtime Pay in Apollo Master Control', // E60 -> STAGE_05 Apollo Control
    'Salt Air & Cracks in the Sponsor Crown', // E61 -> STAGE_06 Steel Pier
    'The Comeback Pot Boils Over at Eight', // E62 -> STAGE_02 Jubilee
    'Rex Calloway’s Riviera Close-Up', // E63 -> STAGE_07 Monte Carlo
    'Blacklight Scandal on the Vectorscope', // E64 -> STAGE_05 Apollo Control
    'Torn Cashier’s Check on Steel Pier', // E65 -> STAGE_06 Steel Pier
    'Madison Avenue Panics During the Jubilee', // E66 -> STAGE_02 Jubilee
    'Process Server at the Casino Door', // E67 -> STAGE_07 Monte Carlo
    'Apollo Master Key to the 36th Floor', // E68 -> STAGE_05 Apollo Control
  ],
  REGIME_B_BELLAMY_UHF: [
    'Hijacked Live onto UHF Channel 83!', // E46 -> STAGE_09 Channel 83 Ship
    'Rebel Signal Inside 30 Rock Studio 6A', // E47 -> STAGE_01 Studio 6A
    'Fifty Kilowatts Off the Queens Unisphere', // E48 -> STAGE_08 World's Fair
    'Bootleg Relay on Atlantic City’s Pier', // E49 -> STAGE_06 Steel Pier
    'Rolling Swells & Spinning Offshore Trilons', // E50 -> STAGE_09 Channel 83 Ship
    'Grant Bellamy Throws Away the Script', // E51 -> STAGE_01 Studio 6A
    'Every Rooftop Antenna Around the Fairgrounds', // E52 -> STAGE_08 World's Fair
    'Boardwalk Neon & Uncensored Coax', // E53 -> STAGE_06 Steel Pier
    'Harbor Patrol Off the Portside Rail', // E54 -> STAGE_09 Channel 83 Ship
    'No Sponsor Can Pull Studio 6A’s Plug', // E55 -> STAGE_01 Studio 6A
    'Glowing Halo Over Flushing Meadows', // E56 -> STAGE_08 World's Fair
    'Salt Spray on the Steel Pier Ribbon Mic', // E57 -> STAGE_06 Steel Pier
    'Nor’easter Live From the Pirate Deck', // E58 -> STAGE_09 Channel 83 Ship
    'Switchboard Jammed at 30 Rockefeller', // E59 -> STAGE_01 Studio 6A
    'Midnight Uplink Under the Unisphere', // E60 -> STAGE_08 World's Fair
    'Bellamy’s Uncut Color Tape on the Pier', // E61 -> STAGE_06 Steel Pier
    'Offshore Tubes Glowing Cherry Red', // E62 -> STAGE_09 Channel 83 Ship
    'Nielsen Needle Pinned in Studio 6A', // E63 -> STAGE_01 Studio 6A
    'Three-Tower Relay Across the World’s Fair', // E64 -> STAGE_08 World's Fair
    'High-Wire Trivia Over the Boardwalk', // E65 -> STAGE_06 Steel Pier
    'The Host Commands From Three Miles Out', // E66 -> STAGE_09 Channel 83 Ship
    'Revolt in Sixth Avenue Master Control', // E67 -> STAGE_01 Studio 6A
    'Unisphere Launchpad to Stage Ten', // E68 -> STAGE_08 World's Fair
  ],
  REGIME_C_VERA_FORENSIC: [
    'Placed Under Oath in the Teak Glass Booth', // E46 -> STAGE_04 Teak Booth
    'Federal Stopwatches on the Burbank Lot', // E47 -> STAGE_03 Burbank Pop-Art
    '2:30 AM Audit Behind Burbank’s Joke Wall', // E48 -> STAGE_03 Vault (ep%6===0)
    'Every Jubilee Wire Tagged as Evidence', // E49 -> STAGE_02 Jubilee
    'Cross-Examination Inside the Glass Booth', // E50 -> STAGE_04 Teak Booth
    'Exhibit A Under the Pop-Art Shutters', // E51 -> STAGE_03 Burbank Pop-Art
    'Clean Signal Beneath the Queens Unisphere', // E52 -> STAGE_08 World's Fair
    'Alastair Kerr Takes the Fifth at Eight', // E53 -> STAGE_02 Jubilee
    'Sealed Subpoena on Burbank Stage Three', // E54 -> STAGE_03 Vault (ep%6===0)
    'Zero Cue Cards at the Pop-Art Desk', // E55 -> STAGE_03 Burbank Pop-Art
    'Grand Jury Transcript at the World’s Fair', // E56 -> STAGE_08 World's Fair
    'Testing the Jubilee Trapdoors Live', // E57 -> STAGE_02 Jubilee
    'Vince’s Vegas Odds in Soundproof Teak', // E58 -> STAGE_04 Teak Booth
    'No Applause Sign on the Burbank Stage', // E59 -> STAGE_03 Burbank Pop-Art
    'Off-Air Wiretap Behind the Mondrian Wall', // E60 -> STAGE_03 Vault (ep%6===0)
    'Roz Korman’s Shredded Jubilee Memo', // E61 -> STAGE_02 Jubilee
    'Twelve Paid Spokes in the Isolation Booth', // E62 -> STAGE_04 Teak Booth
    'Nervous Witness in Burbank Makeup', // E63 -> STAGE_03 Burbank Pop-Art
    'Public Standards Hearing at the Unisphere', // E64 -> STAGE_08 World's Fair
    'Prompters Dark at Television City', // E65 -> STAGE_02 Jubilee
    'Key Witness Behind the Pop-Art Wall', // E66 -> STAGE_03 Vault (ep%6===0)
    'Coast-to-Coast Warrant From Burbank', // E67 -> STAGE_03 Burbank Pop-Art
    'World’s Fair Audit Before Stage Ten', // E68 -> STAGE_08 World's Fair
  ],
};

const SEASON_4_TITLES: readonly string[] = [
  'Former Champions Take the Jubilee Balcony', // E69 -> STAGE_02 Jubilee
  'Boardwalk Cheers & Balcony Jeers', // E70 -> STAGE_06 Steel Pier
  'Monte Carlo Top-Seed Showdown', // E71 -> STAGE_07 Monte Carlo
  'Unisphere Champions Quarterfinal', // E72 -> STAGE_08 World's Fair
  'Home-Turf Rematch in Studio 6A', // E73 -> STAGE_01 Studio 6A
  'First Glimpse of the 36th-Floor Penthouse', // E74 -> STAGE_10 Penthouse
  'Television City Jubilee Quarterfinal', // E75 -> STAGE_02 Jubilee
  'Old Scores on Atlantic City’s Steel Pier', // E76 -> STAGE_06 Steel Pier
  'Monte Carlo High-Table Elimination', // E77 -> STAGE_07 Monte Carlo
  'World’s Fair Sundial Balancing Act', // E78 -> STAGE_08 World's Fair
  'Studio 6A Gauntlet of Champions', // E79 -> STAGE_01 Studio 6A
  'Penthouse Dress Rehearsal Above Sixth Ave', // E80 -> STAGE_10 Penthouse
  'Prime-Time Jubilee Semifinal Bell', // E81 -> STAGE_02 Jubilee
  'Steel Pier Semifinal & Balcony Bets', // E82 -> STAGE_06 Steel Pier
  'Last Roulette Spin in Monte Carlo', // E83 -> STAGE_07 Monte Carlo
  'Farewell Under the Queens Unisphere', // E84 -> STAGE_08 World's Fair
  'Penthouse Round I: The Velvet Rope', // E85 -> STAGE_10 Penthouse
  'Penthouse Round II: Chasing Marquee Gold', // E86 -> STAGE_10 Penthouse
  'Penthouse Round III: Coast-to-Coast Peacock', // E87 -> STAGE_10 Penthouse
  'Penthouse Round IV: Executive Skybox', // E88 -> STAGE_10 Penthouse
  'Penthouse Round V: Bellamy’s Final Test', // E89 -> STAGE_10 Penthouse
  'Fifty Million Watching (The $250,000 Finale)', // E90 -> STAGE_10 Grand Finale!
];

const ALL_TWISTS_RING_V7: readonly BoardTwistIdV7[] = [
  'TWIST_01_CROSSFADER_BOOST',
  'TWIST_02_HEX_BRIDGE_CHAIN',
  'TWIST_13_AMBER_CHALK_TRUCE',
  'TWIST_14_RIVAL_WHEELHOUSE_BOUNTY',
  'TWIST_15_SOLENOID_RIGGED_GAMBIT',
  'TWIST_16_DOUBLE_STAKE_CORNER',
  'TWIST_03_ESCAPEMENT_TICK_SHIFT',
  'TWIST_04_SUPERVISORY_RELAY_PAIR',
  'TWIST_05_LARSON_HOT_SPOT',
  'TWIST_06_PINBALL_BUMPER_RICOCHET',
  'TWIST_07_BACCARAT_NATURAL_21',
  'TWIST_08_SOLAR_MERIDIAN_SWEEP',
  'TWIST_09_PIRATE_CARRIER_LOCK',
  'TWIST_10_ZIGGURAT_APEX_CROWN',
  'TWIST_11_GAUNTLET_BLOCKADE_BREACH',
  'TWIST_12_FULCRUM_EQUILIBRIUM',
];

const STAGE_DEFAULT_BOARD_V7: Record<StageWorldIdV7, BoardIdV7> = {
  STAGE_01_IBC_DAYTIME_FUNK: 'BOARD_01_FUNK_CROSSFADER',
  STAGE_02_IBC_PRIMETIME_JUBILEE: 'BOARD_02_JUBILEE_HEX_BRIDGE',
  STAGE_03_1926_VAUDEVILLE_PIT: 'BOARD_03_VAUDEVILLE_GEAR_TRAIN',
  STAGE_04_1958_ISOLATION_VAULT: 'BOARD_04_MAHOGANY_SWITCHBOARD',
  STAGE_05_1984_LARSON_CRT_LAB: 'BOARD_05_LARSON_SPIN_RING',
  STAGE_06_ATLANTIC_CITY_PIER: 'BOARD_06_BOARDWALK_PINBALL',
  STAGE_07_1969_MONTE_CARLO_CASINO: 'BOARD_07_MONTE_CARLO_SHOE',
  STAGE_08_WORLDS_FAIR_GEODESIC: 'BOARD_08_GEODESIC_SUNDIAL',
  STAGE_09_CHANNEL_83_UHF_BARGE: 'BOARD_09_PIRATE_UHF_DECK',
  STAGE_10_SOVEREIGN_SANCTUM: 'BOARD_10_SOVEREIGN_ZIGGURAT',
};

const STAGE_DEFAULT_TWIST_V7: Record<StageWorldIdV7, BoardTwistIdV7> = {
  STAGE_01_IBC_DAYTIME_FUNK: 'TWIST_01_CROSSFADER_BOOST',
  STAGE_02_IBC_PRIMETIME_JUBILEE: 'TWIST_02_HEX_BRIDGE_CHAIN',
  STAGE_03_1926_VAUDEVILLE_PIT: 'TWIST_03_ESCAPEMENT_TICK_SHIFT',
  STAGE_04_1958_ISOLATION_VAULT: 'TWIST_04_SUPERVISORY_RELAY_PAIR',
  STAGE_05_1984_LARSON_CRT_LAB: 'TWIST_05_LARSON_HOT_SPOT',
  STAGE_06_ATLANTIC_CITY_PIER: 'TWIST_06_PINBALL_BUMPER_RICOCHET',
  STAGE_07_1969_MONTE_CARLO_CASINO: 'TWIST_07_BACCARAT_NATURAL_21',
  STAGE_08_WORLDS_FAIR_GEODESIC: 'TWIST_08_SOLAR_MERIDIAN_SWEEP',
  STAGE_09_CHANNEL_83_UHF_BARGE: 'TWIST_09_PIRATE_CARRIER_LOCK',
  STAGE_10_SOVEREIGN_SANCTUM: 'TWIST_10_ZIGGURAT_APEX_CROWN',
};

// ----------------------------------------------------------------------------
// 3. Default Save Factory & Match Outcome Contracts
// ----------------------------------------------------------------------------

export function createDefaultBroadcastSettingsV7(): BroadcastSettingsV7 {
  return {
    masterVolume: 85,
    musicVolume: 78,
    sfxVolume: 88,
    crowdVolume: 72,
    ambienceVolume: 68,
    hapticsEnabled: true,
    reducedMotion: false,
    highContrastBadges: false,
    difficultyMode: 'PRIMETIME_NORMAL',
  };
}

function createInitialRivalTrustMapV7(): Partial<Record<RivalIdV7, number>> {
  const trust: Partial<Record<RivalIdV7, number>> = {};
  for (const id of RIVAL_IDS_V7) {
    trust[id] = 0;
  }
  return trust;
}

export function createInitialCampaignSaveStateV7(): CampaignSaveStateV7 {
  return {
    version: 'WS_V7_GOLD_1',
    waiver: null,
    currentEpisode: 1,
    season: 1,
    cleanPurseCash: 0,
    contrabandTrunkCash: 0,
    grudgeBountyPool: 0,
    lienSegmentsPaid: 0,
    activeCoupRegime: 'NONE',
    equippedRelics: [],
    unlockedTrophyIds: [],
    rivalTrust: createInitialRivalTrustMapV7(),
    brokerFavor: {
      GRANT_BELLAMY: 0,
      ROZ_KORMAN: 0,
      VERA_KARP: 0,
    },
    boothArrestsCount: 0,
    canaryAcceptedCount: 0,
    canaryBurnedCount: 0,
    episodesWon: 0,
    episodesPlayed: 0,
    unlockedEndings: [],
    recentEntityKeys: [],
    scoutingNotebook: {},
    returningChampStreak: 0,
    recentBoardCombos: [],
    careerMedalCounts: {},
    masteredBoardModes: [],
    masteredDifficulties: [],
    settings: createDefaultBroadcastSettingsV7(),
  };
}

export function episodeToSeasonV7(episodeNumber: number): 1 | 2 | 3 | 4 {
  if (episodeNumber <= 22) return 1;
  if (episodeNumber <= 45) return 2;
  if (episodeNumber <= 68) return 3;
  return 4;
}

export function formatEpisodeCodeV7(episodeNumber: number): string {
  const clamped = Math.max(1, Math.min(90, Math.floor(episodeNumber)));
  const season = episodeToSeasonV7(clamped);
  return `S0${season}E${String(clamped).padStart(2, '0')}`;
}

export interface EpisodeOutcomeInputV7 {
  readonly blueprint: EpisodeBlueprintV7;
  readonly playerMatchScore: number;
  readonly rivalMatchScore: number;
  readonly cleanBonusCash?: number;
  readonly contrabandBonusCash?: number;
  readonly respectedAmberTruce?: boolean;
  readonly poachedAmberTruce?: boolean;
  readonly boothArrestsInMatch?: number;
  readonly canaryAction?: 'NONE' | 'POCKETED' | 'BURNED';
  readonly chosenCoupRegime?: Exclude<CoupRegimeIdV7, 'NONE'>;
  readonly chosenFinaleEnding?: FinaleEndingIdV7;
  readonly seenEntityKeysInMatch?: readonly string[];
  readonly earnedTrophyIdsInMatch?: readonly string[];
}

export interface EpisodeOutcomeSummaryV7 {
  readonly wonMatch: boolean;
  readonly cleanCashAdded: number;
  readonly contrabandCashAdded: number;
  readonly grudgeBountyReclaimed: number;
  readonly grudgeBountyStoredOnLoss: number;
  readonly triggeredVaultDropNext: boolean;
  readonly liberatedRival: RivalIdV7 | null;
  readonly resolvedCoupRegime: CoupRegimeIdV7;
  readonly unlockedEnding: FinaleEndingSpecV7 | null;
  readonly newlyUnlockedTrophies: readonly TrophySpecV7[];
  readonly nextEpisodeNumber: number;
}

// ----------------------------------------------------------------------------
// 4. CampaignDirectorV7 — 90-Episode Script Engine & Save State Manager
// ----------------------------------------------------------------------------

export class CampaignDirectorV7 {
  private state: CampaignSaveStateV7;
  private readonly storageKey: string;

  constructor(storageKey: string = CAMPAIGN_SAVE_STORAGE_KEY_V7) {
    this.storageKey = storageKey;
    this.state = this.loadFromStorage();
  }

  public getState(): CampaignSaveStateV7 {
    return this.state;
  }

  public saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {
      // Ignore quota / private-browsing storage restrictions
    }
  }

  public loadFromStorage(): CampaignSaveStateV7 {
    const fallback = createInitialCampaignSaveStateV7();
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as Partial<CampaignSaveStatePersistedV7> | null;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || parsed.version !== 'WS_V7_GOLD_1') {
        return fallback;
      }

      const ep = sanitizeFiniteIntV7(parsed.currentEpisode, 1, 1, 90);
      const rawTrunk = Array.isArray(parsed.equippedRelics) ? parsed.equippedRelics : [];
      const sanitizedTrunk: OwnedRelicV7[] = rawTrunk
        .filter(
          (item): item is OwnedRelicV7 =>
            Boolean(item) &&
            typeof item === 'object' &&
            !Array.isArray(item) &&
            typeof (item as { relicId?: unknown }).relicId === 'string' &&
            Boolean(RELIC_BY_ID_V7[(item as { relicId: string }).relicId]),
        )
        .map((item) => {
          const spec = RELIC_BY_ID_V7[item.relicId];
          const foil =
            typeof item.foil === 'string' && VALID_FOIL_FINISHES_SET_V7.has(item.foil as FoilFinishV7)
              ? (item.foil as FoilFinishV7)
              : spec.defaultFoil;
          return { relicId: item.relicId, foil };
        });
      const trunkCheck = validateTrunkLoadoutV7(sanitizedTrunk);

      // Sanitize Contestant Waiver
      let sanitizedWaiver: ContestantWaiverV7 | null = null;
      if (parsed.waiver && typeof parsed.waiver === 'object' && !Array.isArray(parsed.waiver)) {
        const w = parsed.waiver as Partial<ContestantWaiverV7>;
        if (
          typeof w.dayJob === 'string' &&
          VALID_DAY_JOBS_SET_V7.has(w.dayJob as DayJobIdV7) &&
          typeof w.stageVice === 'string' &&
          VALID_STAGE_VICES_SET_V7.has(w.stageVice as StageViceIdV7) &&
          typeof w.lienGoal === 'string' &&
          VALID_LIEN_GOALS_SET_V7.has(w.lienGoal as LienGoalIdV7)
        ) {
          sanitizedWaiver = {
            dayJob: w.dayJob as DayJobIdV7,
            stageVice: w.stageVice as StageViceIdV7,
            lienGoal: w.lienGoal as LienGoalIdV7,
            stampedAtIso:
              typeof w.stampedAtIso === 'string' && w.stampedAtIso.length > 0
                ? w.stampedAtIso
                : new Date().toISOString(),
          };
        }
      }

      // Sanitize Rival Trust (-3..+3) & Broker Favor (finite ints)
      const sanitizedRivalTrust: Partial<Record<RivalIdV7, number>> = { ...fallback.rivalTrust };
      if (parsed.rivalTrust && typeof parsed.rivalTrust === 'object' && !Array.isArray(parsed.rivalTrust)) {
        for (const rivalId of RIVAL_IDS_V7) {
          const val = (parsed.rivalTrust as Record<string, unknown>)[rivalId];
          if (val !== undefined) {
            sanitizedRivalTrust[rivalId] = sanitizeFiniteIntV7(val, 0, -3, 3);
          }
        }
      }

      const rawBroker =
        parsed.brokerFavor && typeof parsed.brokerFavor === 'object' && !Array.isArray(parsed.brokerFavor)
          ? (parsed.brokerFavor as Record<string, unknown>)
          : {};
      const sanitizedBrokerFavor: Record<BrokerIdV7, number> = {
        GRANT_BELLAMY: sanitizeFiniteIntV7(rawBroker.GRANT_BELLAMY, 0, -999, 999),
        ROZ_KORMAN: sanitizeFiniteIntV7(rawBroker.ROZ_KORMAN, 0, -999, 999),
        VERA_KARP: sanitizeFiniteIntV7(rawBroker.VERA_KARP, 0, -999, 999),
      };

      // Sanitize Career Medals & Mode/Difficulty Mastery (including per-pair "MODE:DIFFICULTY")
      const sanitizedMedals: Partial<Record<CareerMedalIdV7, number>> = {};
      if (
        parsed.careerMedalCounts &&
        typeof parsed.careerMedalCounts === 'object' &&
        !Array.isArray(parsed.careerMedalCounts)
      ) {
        for (const [medalKey, rawCount] of Object.entries(
          parsed.careerMedalCounts as Record<string, unknown>,
        )) {
          if (!VALID_CAREER_MEDAL_IDS_SET_V7.has(medalKey)) continue;
          const cleanCount = sanitizeFiniteIntV7(rawCount, 0, 0);
          if (cleanCount > 0) {
            sanitizedMedals[medalKey as CareerMedalIdV7] = cleanCount;
          }
        }
      }

      const sanitizedMasteredModes: BoardPlayModeV7[] = Array.isArray(parsed.masteredBoardModes)
        ? [
            ...new Set(
              parsed.masteredBoardModes.filter(
                (m): m is BoardPlayModeV7 =>
                  typeof m === 'string' && VALID_BOARD_PLAY_MODES_SET_V7.has(m),
              ),
            ),
          ]
        : [];

      const sanitizedMasteredDifficulties: DifficultyModeV7[] = Array.isArray(
        parsed.masteredDifficulties,
      )
        ? [
            ...new Set(
              parsed.masteredDifficulties.filter(
                (d): d is DifficultyModeV7 =>
                  typeof d === 'string' && VALID_DIFFICULTY_MODES_SET_V7.has(d as DifficultyModeV7),
              ),
            ),
          ]
        : [];

      const sanitizedMasteredModeDifficulties: string[] = Array.isArray(
        parsed.masteredModeDifficulties,
      )
        ? [
            ...new Set(
              parsed.masteredModeDifficulties
                .filter((pair): pair is string => typeof pair === 'string')
                .map((pair) => pair.trim())
                .filter((pair) => {
                  const sep = pair.indexOf(':');
                  return sep > 0 && sep < pair.length - 1;
                }),
            ),
          ].slice(0, 64)
        : [];

      // Sanitize Scouting Notebook
      const sanitizedNotebook: NonNullable<CampaignSaveStateV7['scoutingNotebook']> = {};
      if (
        parsed.scoutingNotebook &&
        typeof parsed.scoutingNotebook === 'object' &&
        !Array.isArray(parsed.scoutingNotebook)
      ) {
        for (const [k, entry] of Object.entries(
          parsed.scoutingNotebook as Record<string, unknown>,
        )) {
          if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
          const e = entry as Record<string, unknown>;
          const revealedStrong = Array.isArray(e.revealedStrong)
            ? [...new Set(e.revealedStrong.filter((c): c is string => typeof c === 'string'))]
            : [];
          const revealedWeak = Array.isArray(e.revealedWeak)
            ? [...new Set(e.revealedWeak.filter((c): c is string => typeof c === 'string'))]
            : [];
          sanitizedNotebook[k] = {
            revealedStrong: revealedStrong as NonNullable<
              CampaignSaveStateV7['scoutingNotebook']
            >[string]['revealedStrong'],
            revealedWeak: revealedWeak as NonNullable<
              CampaignSaveStateV7['scoutingNotebook']
            >[string]['revealedWeak'],
            ...(typeof e.traitRevealed === 'boolean' ? { traitRevealed: e.traitRevealed } : {}),
          };
        }
      }

      // Sanitize Broadcast Settings
      const rawSettings =
        parsed.settings && typeof parsed.settings === 'object' && !Array.isArray(parsed.settings)
          ? (parsed.settings as Partial<BroadcastSettingsV7>)
          : {};
      const sanitizedSettings: BroadcastSettingsV7 = {
        masterVolume: sanitizeFiniteIntV7(rawSettings.masterVolume, fallback.settings.masterVolume, 0, 100),
        musicVolume: sanitizeFiniteIntV7(rawSettings.musicVolume, fallback.settings.musicVolume, 0, 100),
        sfxVolume: sanitizeFiniteIntV7(rawSettings.sfxVolume, fallback.settings.sfxVolume, 0, 100),
        crowdVolume: sanitizeFiniteIntV7(rawSettings.crowdVolume, fallback.settings.crowdVolume, 0, 100),
        ambienceVolume: sanitizeFiniteIntV7(
          rawSettings.ambienceVolume,
          fallback.settings.ambienceVolume,
          0,
          100,
        ),
        hapticsEnabled:
          typeof rawSettings.hapticsEnabled === 'boolean'
            ? rawSettings.hapticsEnabled
            : fallback.settings.hapticsEnabled,
        reducedMotion:
          typeof rawSettings.reducedMotion === 'boolean'
            ? rawSettings.reducedMotion
            : fallback.settings.reducedMotion,
        highContrastBadges:
          typeof rawSettings.highContrastBadges === 'boolean'
            ? rawSettings.highContrastBadges
            : fallback.settings.highContrastBadges,
        difficultyMode:
          typeof rawSettings.difficultyMode === 'string' &&
          VALID_DIFFICULTY_MODES_SET_V7.has(rawSettings.difficultyMode as DifficultyModeV7)
            ? (rawSettings.difficultyMode as DifficultyModeV7)
            : fallback.settings.difficultyMode,
      };

      const sanitizedRegime: CoupRegimeIdV7 =
        typeof parsed.activeCoupRegime === 'string' &&
        VALID_COUP_REGIMES_SET_V7.has(parsed.activeCoupRegime as CoupRegimeIdV7)
          ? (parsed.activeCoupRegime as CoupRegimeIdV7)
          : 'NONE';

      const sanitizedLastWaiverEpisode =
        parsed.lastWaiverStampedEpisode !== undefined &&
        parsed.lastWaiverStampedEpisode !== null &&
        Number.isFinite(Number(parsed.lastWaiverStampedEpisode))
          ? sanitizeFiniteIntV7(parsed.lastWaiverStampedEpisode, ep, 1, 90)
          : sanitizedWaiver
            ? ep
            : undefined;
      const sanitizedLastWaiverBroker: BrokerIdV7 | undefined =
        typeof parsed.lastWaiverStampedBroker === 'string' &&
        VALID_BROKERS_SET_V7.has(parsed.lastWaiverStampedBroker as BrokerIdV7)
          ? (parsed.lastWaiverStampedBroker as BrokerIdV7)
          : sanitizedWaiver
            ? lienGoalToBrokerV7(sanitizedWaiver.lienGoal)
            : undefined;

      const merged: CampaignSaveStatePersistedV7 = {
        version: 'WS_V7_GOLD_1',
        waiver: sanitizedWaiver,
        currentEpisode: ep,
        season: episodeToSeasonV7(ep),
        cleanPurseCash: sanitizeFiniteIntV7(parsed.cleanPurseCash, 0, 0),
        contrabandTrunkCash: sanitizeFiniteIntV7(parsed.contrabandTrunkCash, 0, 0),
        grudgeBountyPool: sanitizeFiniteIntV7(parsed.grudgeBountyPool, 0, 0),
        lienSegmentsPaid: sanitizeFiniteIntV7(parsed.lienSegmentsPaid, 0, 0, 12),
        activeCoupRegime: sanitizedRegime,
        equippedRelics: trunkCheck.ok ? sanitizedTrunk : sanitizedTrunk.slice(0, 2),
        unlockedTrophyIds: Array.isArray(parsed.unlockedTrophyIds)
          ? [
              ...new Set(
                parsed.unlockedTrophyIds.filter(
                  (id): id is string => typeof id === 'string' && id.trim().length > 0,
                ),
              ),
            ]
          : [],
        rivalTrust: sanitizedRivalTrust,
        brokerFavor: sanitizedBrokerFavor,
        boothArrestsCount: sanitizeFiniteIntV7(parsed.boothArrestsCount, 0, 0),
        canaryAcceptedCount: sanitizeFiniteIntV7(parsed.canaryAcceptedCount, 0, 0),
        canaryBurnedCount: sanitizeFiniteIntV7(parsed.canaryBurnedCount, 0, 0),
        episodesWon: sanitizeFiniteIntV7(parsed.episodesWon, 0, 0),
        episodesPlayed: sanitizeFiniteIntV7(parsed.episodesPlayed, 0, 0),
        unlockedEndings: Array.isArray(parsed.unlockedEndings)
          ? [
              ...new Set(
                parsed.unlockedEndings.filter(
                  (id): id is string => typeof id === 'string' && id.trim().length > 0,
                ),
              ),
            ]
          : [],
        recentEntityKeys: Array.isArray(parsed.recentEntityKeys)
          ? parsed.recentEntityKeys
              .filter((k): k is string => typeof k === 'string' && k.length > 0)
              .slice(-MAX_ENTITY_COOLDOWN_KEYS_V7)
          : [],
        scoutingNotebook: sanitizedNotebook,
        returningChampStreak: sanitizeFiniteIntV7(parsed.returningChampStreak, 0, 0),
        recentBoardCombos: Array.isArray(parsed.recentBoardCombos)
          ? parsed.recentBoardCombos
              .filter((c): c is string => typeof c === 'string' && c.length > 0)
              .slice(-12)
          : [],
        careerMedalCounts: sanitizedMedals,
        masteredBoardModes: sanitizedMasteredModes,
        masteredDifficulties: sanitizedMasteredDifficulties,
        masteredModeDifficulties: sanitizedMasteredModeDifficulties,
        ...(sanitizedLastWaiverEpisode !== undefined
          ? { lastWaiverStampedEpisode: sanitizedLastWaiverEpisode }
          : {}),
        ...(sanitizedLastWaiverBroker !== undefined
          ? { lastWaiverStampedBroker: sanitizedLastWaiverBroker }
          : {}),
        settings: sanitizedSettings,
      };
      return merged;
    } catch {
      return fallback;
    }
  }

  public resetCampaign(keepSettingsAndTrophies: boolean = true): CampaignSaveStateV7 {
    const prevSettings = { ...this.state.settings };
    const prevTrophies = [...this.state.unlockedTrophyIds];
    const prevEndings = [...this.state.unlockedEndings];
    const fresh: CampaignSaveStatePersistedV7 = {
      ...createInitialCampaignSaveStateV7(),
      masteredModeDifficulties: [],
      lastWaiverStampedEpisode: undefined,
      lastWaiverStampedBroker: undefined,
    };
    this.state = fresh;
    if (keepSettingsAndTrophies) {
      this.state.settings = prevSettings;
      this.state.unlockedTrophyIds = prevTrophies;
      this.state.unlockedEndings = prevEndings;
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(SHOWRUNNER_META_STORAGE_KEY_V7);
      }
    } catch {
      // Ignore storage access errors in private/restricted environments
    }
    this.saveToStorage();
    return this.state;
  }

  public stampReleaseWaiver(
    dayJob: DayJobIdV7,
    stageVice: StageViceIdV7,
    lienGoal: LienGoalIdV7,
  ): ContestantWaiverV7 {
    const persisted = this.state as CampaignSaveStatePersistedV7;
    const ep = this.state.currentEpisode;
    const nextBroker = lienGoalToBrokerV7(lienGoal);
    const waiver: ContestantWaiverV7 = {
      dayJob,
      stageVice,
      lienGoal,
      stampedAtIso: new Date().toISOString(),
    };
    this.state.waiver = waiver;

    // Grant +1 broker favor strictly ONCE per episode (switching goals before the
    // same episode transfers the +1 cleanly instead of letting players farm favor!).
    if (persisted.lastWaiverStampedEpisode === ep) {
      const prevBroker = persisted.lastWaiverStampedBroker;
      if (prevBroker && prevBroker !== nextBroker) {
        this.state.brokerFavor[prevBroker] = Math.max(0, this.state.brokerFavor[prevBroker] - 1);
        this.state.brokerFavor[nextBroker] += 1;
        persisted.lastWaiverStampedBroker = nextBroker;
      }
    } else {
      this.state.brokerFavor[nextBroker] += 1;
      persisted.lastWaiverStampedEpisode = ep;
      persisted.lastWaiverStampedBroker = nextBroker;
    }

    this.saveToStorage();
    return waiver;
  }

  /**
   * Stamps a welcoming, zero-penalty default Contestant Waiver when missing so
   * Episode 1 launches straight onto Stage 6A right after the 1966 Story Cold-Open
   * with zero legal-form friction!
   */
  public ensureDefaultWaiverIfMissing(): ContestantWaiverV7 {
    if (this.state.waiver) {
      return this.state.waiver;
    }
    return this.stampReleaseWaiver(
      'NIGHT_FACT_CHECKER',
      'SCOREBOARD_GRUDGE',
      'CLEAN_PURSE_250K',
    );
  }

  public updateSettings(partial: Partial<BroadcastSettingsV7>): BroadcastSettingsV7 {
    this.state.settings = {
      ...this.state.settings,
      ...partial,
      masterVolume: Math.max(
        0,
        Math.min(100, Math.round(partial.masterVolume ?? this.state.settings.masterVolume)),
      ),
      musicVolume: Math.max(
        0,
        Math.min(100, Math.round(partial.musicVolume ?? this.state.settings.musicVolume)),
      ),
      sfxVolume: Math.max(
        0,
        Math.min(100, Math.round(partial.sfxVolume ?? this.state.settings.sfxVolume)),
      ),
      crowdVolume: Math.max(
        0,
        Math.min(100, Math.round(partial.crowdVolume ?? this.state.settings.crowdVolume)),
      ),
      ambienceVolume: Math.max(
        0,
        Math.min(100, Math.round(partial.ambienceVolume ?? this.state.settings.ambienceVolume)),
      ),
    };
    this.saveToStorage();
    return this.state.settings;
  }

  /** Instant Episode/Season Jump Selector for chapter replay & QA verification. */
  public jumpToEpisode(
    episodeNumber: number,
    regimeOverride?: CoupRegimeIdV7,
  ): EpisodeBlueprintV7 {
    const clamped = Math.max(1, Math.min(90, Math.floor(episodeNumber)));
    this.state.currentEpisode = clamped;
    this.state.season = episodeToSeasonV7(clamped);
    if (regimeOverride) {
      this.state.activeCoupRegime = regimeOverride;
    } else if (clamped >= 46 && this.state.activeCoupRegime === 'NONE') {
      this.state.activeCoupRegime = this.computeNaturalCoupRegime();
    } else if (clamped < 46 && !regimeOverride) {
      this.state.activeCoupRegime = 'NONE';
    }
    this.saveToStorage();
    return this.getCurrentEpisodeBlueprint();
  }

  /** Buy or equip a Relic into the 5-slot Studio Prop Trunk using Clean or Backstage cash. */
  public purchaseOrEquipRelic(
    relicId: string,
    foil?: FoilFinishV7,
    replaceSlotIdx?: number,
    freeEquip: boolean = false,
  ): {
    readonly ok: boolean;
    readonly reason?: string;
    readonly newlyUnlockedTrophies: readonly TrophySpecV7[];
  } {
    const spec = RELIC_BY_ID_V7[relicId];
    if (!spec) {
      return { ok: false, reason: 'Unknown studio prop ID.', newlyUnlockedTrophies: [] };
    }
    if (this.state.equippedRelics.some((r) => r.relicId === relicId)) {
      return {
        ok: false,
        reason: `${spec.name} is already packed in your Studio Trunk.`,
        newlyUnlockedTrophies: [],
      };
    }

    if (!freeEquip) {
      if (spec.ledgerKind === 'CONTRABAND') {
        const totalAvailable = this.state.contrabandTrunkCash + this.state.cleanPurseCash;
        if (totalAvailable < spec.costCash) {
          return {
            ok: false,
            reason: `Need $${spec.costCash} in Backstage Cash or Clean Purse to pack ${spec.name}.`,
            newlyUnlockedTrophies: [],
          };
        }
      } else if (this.state.cleanPurseCash < spec.costCash) {
        return {
          ok: false,
          reason: `Need $${spec.costCash} Clean Purse Cash to pack ${spec.name}.`,
          newlyUnlockedTrophies: [],
        };
      }
    }

    const candidate: OwnedRelicV7[] = [...this.state.equippedRelics];
    const nextItem: OwnedRelicV7 = { relicId: spec.relicId, foil: foil ?? spec.defaultFoil };
    if (
      typeof replaceSlotIdx === 'number' &&
      replaceSlotIdx >= 0 &&
      replaceSlotIdx < candidate.length
    ) {
      candidate[replaceSlotIdx] = nextItem;
    } else if (candidate.length < MAX_TRUNK_SLOTS_V7) {
      candidate.push(nextItem);
    } else {
      return {
        ok: false,
        reason: 'All 5 Studio Trunk slots are full—unequip a prop first to swap.',
        newlyUnlockedTrophies: [],
      };
    }

    const valid = validateTrunkLoadoutV7(candidate);
    if (!valid.ok) {
      return { ok: false, reason: valid.reason, newlyUnlockedTrophies: [] };
    }

    if (!freeEquip) {
      if (spec.ledgerKind === 'CONTRABAND') {
        const fromContraband = Math.min(this.state.contrabandTrunkCash, spec.costCash);
        const remainder = spec.costCash - fromContraband;
        this.state.contrabandTrunkCash -= fromContraband;
        this.state.cleanPurseCash -= remainder;
      } else {
        this.state.cleanPurseCash -= spec.costCash;
      }
    }

    this.state.equippedRelics = candidate;
    const newlyUnlockedTrophies = this.evaluateTrophyUnlocks();
    this.saveToStorage();
    return { ok: true, newlyUnlockedTrophies };
  }

  /** Equips an already-paid studio prop (e.g. from Instant Bargain Turntable) into the 5-slot Trunk. */
  public equipPurchasedRelic(
    relicId: string,
    foil?: FoilFinishV7,
    replaceSlotIdx?: number,
  ): {
    readonly ok: boolean;
    readonly reason?: string;
    readonly newlyUnlockedTrophies: readonly TrophySpecV7[];
  } {
    return this.purchaseOrEquipRelic(relicId, foil, replaceSlotIdx, true);
  }

  public unequipRelicSlot(slotIdx: number): void {
    if (slotIdx < 0 || slotIdx >= this.state.equippedRelics.length) return;
    this.state.equippedRelics.splice(slotIdx, 1);
    this.saveToStorage();
  }

  /** Pay 1 segment ($18,500) on the 12-Spoke Network Buyout Wheel. */
  public payBrassLienSegment(ledgerSource: 'CLEAN' | 'CONTRABAND' = 'CLEAN'): {
    readonly ok: boolean;
    readonly reason?: string;
    readonly lienSegmentsPaid: number;
    readonly newlyUnlockedTrophies: readonly TrophySpecV7[];
  } {
    if (this.state.lienSegmentsPaid >= 12) {
      return {
        ok: false,
        reason: 'All 12 Network Buyout spokes are already paid in full!',
        lienSegmentsPaid: 12,
        newlyUnlockedTrophies: [],
      };
    }
    const cost = LIEN_SEGMENT_COST_CASH_V7;
    if (ledgerSource === 'CLEAN') {
      if (this.state.cleanPurseCash < cost) {
        return {
          ok: false,
          reason: `Need $${cost.toLocaleString()} Clean Purse Cash per buyout spoke.`,
          lienSegmentsPaid: this.state.lienSegmentsPaid,
          newlyUnlockedTrophies: [],
        };
      }
      this.state.cleanPurseCash -= cost;
      this.state.brokerFavor.VERA_KARP += 1;
    } else {
      if (this.state.contrabandTrunkCash < cost) {
        return {
          ok: false,
          reason: `Need $${cost.toLocaleString()} Backstage Cash per buyout spoke.`,
          lienSegmentsPaid: this.state.lienSegmentsPaid,
          newlyUnlockedTrophies: [],
        };
      }
      this.state.contrabandTrunkCash -= cost;
      this.state.brokerFavor.ROZ_KORMAN += 1;
    }

    this.state.lienSegmentsPaid += 1;
    const newlyUnlockedTrophies = this.evaluateTrophyUnlocks();
    this.saveToStorage();
    return {
      ok: true,
      lienSegmentsPaid: this.state.lienSegmentsPaid,
      newlyUnlockedTrophies,
    };
  }

  /** Live Booth Arrest action when player catches a Rival cheat tell on air! */
  public recordLiveBoothArrest(rivalId: RivalIdV7): {
    readonly cleanBountyCash: number;
    readonly newlyUnlockedTrophies: readonly TrophySpecV7[];
  } {
    this.state.boothArrestsCount += 1;
    this.state.brokerFavor.VERA_KARP += 2;
    this.state.brokerFavor.ROZ_KORMAN = Math.max(-5, this.state.brokerFavor.ROZ_KORMAN - 1);
    if (CAST_PROFILES_V7[rivalId].role === 'RIVAL_HEEL') {
      this.state.rivalTrust[rivalId] = Math.max(-3, (this.state.rivalTrust[rivalId] ?? 0) - 1);
    }
    const hasSignet = this.state.equippedRelics.some(
      (r) => r.relicId === 'relic_subpoena_wax_signet',
    );
    const cleanBountyCash = hasSignet ? 300 : 150;
    this.state.cleanPurseCash += cleanBountyCash;
    const newlyUnlockedTrophies = this.evaluateTrophyUnlocks();
    this.saveToStorage();
    return { cleanBountyCash, newlyUnlockedTrophies };
  }

  /** Live Commercial-Break Wax-Sealed Canary Envelope choice (`POCKET` vs `BURN`). */
  public recordCanaryChoice(
    choice: 'POCKET' | 'BURN',
    brokerId: BrokerIdV7,
  ): {
    readonly immediateCleanBonus: number;
    readonly immediateContrabandBonus: number;
    readonly newlyUnlockedTrophies: readonly TrophySpecV7[];
  } {
    let immediateCleanBonus = 0;
    let immediateContrabandBonus = 0;
    if (choice === 'POCKET') {
      this.state.canaryAcceptedCount += 1;
      this.state.brokerFavor[brokerId] += 1;
      this.state.brokerFavor.ROZ_KORMAN += 1;
      immediateContrabandBonus = 180;
      this.state.contrabandTrunkCash += immediateContrabandBonus;
    } else {
      this.state.canaryBurnedCount += 1;
      this.state.brokerFavor.VERA_KARP += 2;
      this.state.brokerFavor.GRANT_BELLAMY += 1;
      const hasSignet = this.state.equippedRelics.some(
        (r) => r.relicId === 'relic_subpoena_wax_signet',
      );
      immediateCleanBonus = hasSignet ? 275 : 125;
      this.state.cleanPurseCash += immediateCleanBonus;
    }
    const newlyUnlockedTrophies = this.evaluateTrophyUnlocks();
    this.saveToStorage();
    return {
      immediateCleanBonus,
      immediateContrabandBonus,
      newlyUnlockedTrophies,
    };
  }

  public getCurrentEpisodeBlueprint(): EpisodeBlueprintV7 {
    return this.buildEpisodeBlueprint(this.state.currentEpisode);
  }

  /** Generates any of the 90 Broadcast Scripts (`S01E01` .. `S04E90`) with live branching! */
  public buildEpisodeBlueprint(episodeNumber: number): EpisodeBlueprintV7 {
    const ep = Math.max(1, Math.min(90, Math.floor(episodeNumber)));
    const season = episodeToSeasonV7(ep);
    const code = formatEpisodeCodeV7(ep);
    const hasHonestLossVaultTrigger =
      this.state.grudgeBountyPool > 0 && ep === this.state.currentEpisode && ep < 85;

    // Scheduled Vault drops in Season 1 + Honest-Loss 2:30 AM Vault Showdowns!
    const isScheduledVault = season === 1 && (ep === 6 || ep === 12 || ep === 18);
    const isVaultDrop =
      isScheduledVault ||
      (season === 1 && hasHonestLossVaultTrigger) ||
      (season === 3 &&
        this.state.activeCoupRegime === 'REGIME_C_VERA_FORENSIC' &&
        ep % 6 === 0);

    const isRoadshow = season === 2;
    const isGoldenExitMatch = season === 2 && (ep === 28 || ep === 34 || ep === 40 || ep === 44);
    const isCoupPivot = ep === 45;
    const isFinale = ep === 90;

    // 1. Stage Selection across all 10 Stages
    let stageId: StageWorldIdV7;
    if (isFinale || ep >= 85) {
      stageId = 'STAGE_10_SOVEREIGN_SANCTUM';
    } else if (isVaultDrop) {
      const vaultCycle: readonly StageWorldIdV7[] = [
        'STAGE_03_1926_VAUDEVILLE_PIT',
        'STAGE_04_1958_ISOLATION_VAULT',
        'STAGE_05_1984_LARSON_CRT_LAB',
      ];
      const idx = ep === 6 ? 0 : ep === 12 ? 1 : ep === 18 ? 2 : ep % 3;
      stageId = vaultCycle[idx];
    } else if (season === 1) {
      stageId =
        ep % 2 === 1 ? 'STAGE_01_IBC_DAYTIME_FUNK' : 'STAGE_02_IBC_PRIMETIME_JUBILEE';
    } else if (season === 2) {
      if (ep === 28) stageId = 'STAGE_06_ATLANTIC_CITY_PIER';
      else if (ep === 34) stageId = 'STAGE_08_WORLDS_FAIR_GEODESIC';
      else if (ep === 40) stageId = 'STAGE_09_CHANNEL_83_UHF_BARGE';
      else if (ep === 44 || ep === 45) stageId = 'STAGE_07_1969_MONTE_CARLO_CASINO';
      else {
        const roadshowRing: readonly StageWorldIdV7[] = [
          'STAGE_06_ATLANTIC_CITY_PIER',
          'STAGE_07_1969_MONTE_CARLO_CASINO',
          'STAGE_08_WORLDS_FAIR_GEODESIC',
          'STAGE_09_CHANNEL_83_UHF_BARGE',
        ];
        stageId = roadshowRing[(ep - 23) % roadshowRing.length];
      }
    } else if (season === 3) {
      const regime =
        this.state.activeCoupRegime === 'NONE'
          ? this.computeNaturalCoupRegime()
          : this.state.activeCoupRegime;
      if (regime === 'REGIME_A_ROZ_PHARMA') {
        const rozStages: readonly StageWorldIdV7[] = [
          'STAGE_02_IBC_PRIMETIME_JUBILEE',
          'STAGE_07_1969_MONTE_CARLO_CASINO',
          'STAGE_05_1984_LARSON_CRT_LAB',
          'STAGE_06_ATLANTIC_CITY_PIER',
        ];
        stageId = rozStages[(ep - 46) % rozStages.length];
      } else if (regime === 'REGIME_B_BELLAMY_UHF') {
        const bellamyStages: readonly StageWorldIdV7[] = [
          'STAGE_09_CHANNEL_83_UHF_BARGE',
          'STAGE_01_IBC_DAYTIME_FUNK',
          'STAGE_08_WORLDS_FAIR_GEODESIC',
          'STAGE_06_ATLANTIC_CITY_PIER',
        ];
        stageId = bellamyStages[(ep - 46) % bellamyStages.length];
      } else {
        const veraStages: readonly StageWorldIdV7[] = [
          'STAGE_04_1958_ISOLATION_VAULT',
          'STAGE_03_1926_VAUDEVILLE_PIT',
          'STAGE_08_WORLDS_FAIR_GEODESIC',
          'STAGE_02_IBC_PRIMETIME_JUBILEE',
        ];
        stageId = veraStages[(ep - 46) % veraStages.length];
      }
    } else {
      // Season 4 Championship lead-up (Ep 69..84 — all live VIP Balcony Jury arenas!)
      const champStages: readonly StageWorldIdV7[] = [
        'STAGE_02_IBC_PRIMETIME_JUBILEE',
        'STAGE_06_ATLANTIC_CITY_PIER',
        'STAGE_07_1969_MONTE_CARLO_CASINO',
        'STAGE_08_WORLDS_FAIR_GEODESIC',
        'STAGE_01_IBC_DAYTIME_FUNK',
        'STAGE_10_SOVEREIGN_SANCTUM',
      ];
      stageId = champStages[(ep - 69) % champStages.length];
    }

    // 2. Board & Twist Selection (ensuring Boards 11 & 12 and all 16 Twists rotate cleanly!)
    let boardId: BoardIdV7 = STAGE_DEFAULT_BOARD_V7[stageId];
    if (!isFinale && !isVaultDrop) {
      if (ep % 9 === 0) boardId = 'BOARD_11_WHEW_GAUNTLET';
      else if (ep % 11 === 0) boardId = 'BOARD_12_PENDULUM_BALANCE';
    }

    let twistId: BoardTwistIdV7 = STAGE_DEFAULT_TWIST_V7[stageId];
    if (boardId === 'BOARD_11_WHEW_GAUNTLET') {
      twistId = 'TWIST_11_GAUNTLET_BLOCKADE_BREACH';
    } else if (boardId === 'BOARD_12_PENDULUM_BALANCE') {
      twistId = 'TWIST_12_FULCRUM_EQUILIBRIUM';
    } else if (ep % 4 === 0 && !isFinale) {
      twistId = ALL_TWISTS_RING_V7[(ep + 3) % ALL_TWISTS_RING_V7.length];
    }

    // 3. 24-Champion Smooth Campaign Choreography (Painted-First S01E01–E03: Carmen 42% -> Toby 44% -> Inez 46%!)
    const s1Cast = SEASON_RIVALS_V7[1];
    const s2Cast = SEASON_RIVALS_V7[2];
    const s3Cast = SEASON_RIVALS_V7[3];
    const s4Cast = SEASON_RIVALS_V7[4];

    let rivalId: RivalIdV7;
    if (ep === 1) rivalId = 'CARMEN_DELGADO'; // Painted S01E01 opener (0.42)
    else if (ep === 2) rivalId = 'TOBY_OKAFOR'; // Painted S01E02 (0.44)
    else if (ep === 3) rivalId = 'INEZ_CALLAHAN'; // Painted S01E03 (0.46)
    else if (ep === 4) rivalId = 'DOTTY_VANCE';
    else if (ep === 5) rivalId = 'CHET_KOWALSKI';
    else if (ep === 6) rivalId = 'PEGGY_SUE_CONNORS'; // Vault 1: Burbank Pop-Art Carnival
    else if (ep === 7) rivalId = 'CARMEN_DELGADO';
    else if (ep === 8) rivalId = 'DOTTY_VANCE';
    else if (ep === 9) rivalId = 'CHET_KOWALSKI';
    else if (ep === 10) rivalId = 'TOBY_OKAFOR';
    else if (ep === 11) rivalId = 'INEZ_CALLAHAN';
    else if (ep === 12) rivalId = 'CARMEN_DELGADO'; // Vault 2: 1964 Teak Glass Booth
    else if (ep === 13) rivalId = 'PEGGY_SUE_CONNORS';
    else if (ep === 14) rivalId = 'INEZ_CALLAHAN';
    else if (ep === 15) rivalId = 'CHET_KOWALSKI';
    else if (ep === 16) rivalId = 'PEGGY_SUE_CONNORS';
    else if (ep === 17) rivalId = 'DOTTY_VANCE';
    else if (ep === 18) rivalId = 'BUZZ_HALVORSEN'; // Vault 3: Apollo Master Color Control!
    else if (ep === 19) rivalId = 'TOBY_OKAFOR';
    else if (ep === 20) rivalId = 'GIGI_ST_CLAIR';
    else if (ep === 21) rivalId = 'WALTER_PRINGLE';
    else if (ep === 22) rivalId = 'INEZ_CALLAHAN';
    else if (ep === 28) rivalId = 'CARMEN_DELGADO'; // Golden Exit 1
    else if (ep === 34) rivalId = 'TOBY_OKAFOR'; // Golden Exit 2
    else if (ep === 40) rivalId = 'INEZ_CALLAHAN'; // Golden Exit 3
    else if (ep === 44) rivalId = 'SYLVIE_BEAUMONT'; // Monte Carlo Sweeps Showcase
    else if (ep === 45) rivalId = 'ALASTAIR_KERR'; // Control Booth Coup Pivot
    else if (ep === 53) rivalId = 'ALASTAIR_KERR';
    else if (ep === 54) rivalId = 'MARGO_STERLING'; // Prevents back-to-back Alastair repeat
    else if (ep === 58) {
      const s3Regime =
        this.state.activeCoupRegime === 'NONE'
          ? this.computeNaturalCoupRegime()
          : this.state.activeCoupRegime;
      rivalId = s3Regime === 'REGIME_C_VERA_FORENSIC' ? 'VINCE_CASTELLANO' : 'MARGO_STERLING';
    } else if (ep === 59) {
      const s3Regime =
        this.state.activeCoupRegime === 'NONE'
          ? this.computeNaturalCoupRegime()
          : this.state.activeCoupRegime;
      rivalId = s3Regime === 'REGIME_C_VERA_FORENSIC' ? 'LANA_STARLING' : 'VINCE_CASTELLANO';
    } else if (ep === 63) rivalId = 'REX_CALLOWAY';
    else if (ep === 64) rivalId = 'MARGO_STERLING'; // Keeps E63 Rex -> E64 Margo -> E65 Hank portrait-distinct!
    else if (ep === 68) rivalId = 'ALASTAIR_KERR'; // Keeps E67 Lana -> E68 Alastair -> E69 Arthur portrait-distinct!
    else if (ep === 85) rivalId = 'ARTHUR_PENDLETON';
    else if (ep === 86) rivalId = 'NORMA_JEAN_BAKER';
    else if (ep === 87) rivalId = 'STERLING_VANCE';
    else if (ep === 88) rivalId = 'SEO_YUN_KANG';
    else if (ep === 89) rivalId = 'CLARA_VON_BERG';
    else if (ep === 90) rivalId = 'VICTOR_LAZAR'; // Grand Finale vs. 11-Week Undefeated Champion!
    else if (season === 1) {
      rivalId = s1Cast[(ep - 1) % s1Cast.length];
    } else if (season === 2) {
      rivalId = s2Cast[(ep - 23) % s2Cast.length];
    } else if (season === 3) {
      rivalId = s3Cast[(ep - 46) % s3Cast.length];
    } else {
      rivalId = s4Cast[(ep - 69) % s4Cast.length];
    }

    // 4. Episode Title
    let title: string;
    if (hasHonestLossVaultTrigger && season === 1 && !isScheduledVault) {
      title = `2:30 AM Comeback Tape: ${SEASON_1_TITLES[ep - 1]}`;
    } else if (season === 1) {
      title = SEASON_1_TITLES[ep - 1];
    } else if (season === 2) {
      title = SEASON_2_TITLES[ep - 23];
    } else if (season === 3) {
      const regimeKey =
        this.state.activeCoupRegime === 'NONE'
          ? this.computeNaturalCoupRegime()
          : this.state.activeCoupRegime;
      title = SEASON_3_TITLES_BY_REGIME[regimeKey][ep - 46];
    } else {
      title = SEASON_4_TITLES[ep - 69];
    }

    // 5. Witty 1966 Cold Open, Plain-English Studio Scouting Wire & Canary Tip
    const coldOpenLine = this.composeColdOpenLine(
      ep,
      season,
      rivalId,
      stageId,
      isVaultDrop,
      isGoldenExitMatch,
      isCoupPivot,
      isFinale,
    );
    const boothCheatHint = this.composeBoothCheatHint(
      rivalId,
      stageId,
      isVaultDrop,
      isFinale,
    );
    const canaryPack = this.composeCanaryEnvelope(
      ep,
      season,
      rivalId,
      stageId,
      isVaultDrop,
    );

    return {
      episodeNumber: ep,
      season,
      code,
      title,
      stageId,
      boardId,
      twistId,
      rivalId,
      isRoadshow,
      isGoldenExitMatch,
      isVaultDrop,
      isCoupPivot,
      isFinale,
      coldOpenLine,
      boothCheatHint,
      canaryBroker: canaryPack.broker,
      canaryNote: canaryPack.note,
      canaryIsPoisoned: canaryPack.isPoisoned,
    };
  }

  /** Evaluates Season 4 Overhead VIP Balcony Jury 1-Boon + 1-Bane votes from Rival Trust! */
  public evaluateVipJuryBallot(currentRivalId?: RivalIdV7): VipJuryBallotV7 {
    const candidates = RIVAL_IDS_V7.filter((id) => id !== currentRivalId);
    let boonVoter: RivalIdV7 = 'CARMEN_DELGADO';
    let highestTrust = -99;
    let baneVoter: RivalIdV7 = 'ALASTAIR_KERR';
    let lowestTrust = 99;

    for (const id of candidates) {
      const t = this.state.rivalTrust[id] ?? 0;
      const sympatheticBias = CAST_PROFILES_V7[id].role === 'RIVAL_SYMPATHETIC' ? 0.25 : 0;
      if (t + sympatheticBias > highestTrust) {
        highestTrust = t + sympatheticBias;
        boonVoter = id;
      }
      if (t - sympatheticBias < lowestTrust) {
        lowestTrust = t - sympatheticBias;
        baneVoter = id;
      }
    }
    if (baneVoter === boonVoter) {
      baneVoter = candidates.find((c) => c !== boonVoter) ?? 'SEO_YUN_KANG';
    }

    const boonTrust = this.state.rivalTrust[boonVoter] ?? 0;
    const baneTrust = this.state.rivalTrust[baneVoter] ?? 0;

    const boonProfile = CAST_PROFILES_V7[boonVoter];
    const baneProfile = CAST_PROFILES_V7[baneVoter];
    const boonChips =
      boonProfile.role === 'RIVAL_SYMPATHETIC'
        ? boonTrust >= 1
          ? 55
          : 35
        : 40;
    const baneMultPen =
      baneProfile.role === 'RIVAL_HEEL'
        ? baneTrust <= -1
          ? 0.13
          : 0.08
        : 0.08;
    const baneRivalEv = baneProfile.role === 'RIVAL_HEEL' ? 0.06 : 0.04;

    const customBoon: Record<RivalIdV7, { title: string; summary: string; chips: number }> = {
      CARMEN_DELGADO: {
        title: 'Carmen’s Bellevue Steady Hand',
        summary: `A calm triage nod from Loge A adds +$${boonChips} bonus dollars on every right answer.`,
        chips: boonChips,
      },
      TOBY_OKAFOR: {
        title: 'Toby’s Clean-Power Boost',
        summary: `Con Ed salute from the balcony adds +$${boonTrust >= 1 ? 60 : 35} bonus dollars on every right answer.`,
        chips: boonTrust >= 1 ? 60 : 35,
      },
      INEZ_CALLAHAN: {
        title: 'Inez’s Librarian Bookmark',
        summary: `Teacup toast from Loge A slips +$${boonChips} bonus dollars onto every clean lock-in.`,
        chips: boonChips,
      },
      DOTTY_VANCE: {
        title: 'Dotty’s Blue-Ribbon Cheer',
        summary: `Topeka standing ovation adds +$${boonChips} bonus dollars on every right answer.`,
        chips: boonChips,
      },
      CHET_KOWALSKI: {
        title: 'Chet’s 300-Game Alley Roar',
        summary: `Milwaukee rosin-bag fist pump puts +$${boonChips} extra dollars behind every strike.`,
        chips: boonChips,
      },
      PEGGY_SUE_CONNORS: {
        title: 'Peggy Sue’s First-Class Upgrade',
        summary: `Pan Am wing wave from the balcony upgrades every right answer by +$${boonChips}.`,
        chips: boonChips,
      },
      BUZZ_HALVORSEN: {
        title: 'Buzz’s Gemini Green-Light',
        summary: `Slide-rule thumbs-up from Loge A boosts every accurate call by +$${boonChips}.`,
        chips: boonChips,
      },
      GIGI_ST_CLAIR: {
        title: 'Gigi’s Carnaby Mod Applause',
        summary: `Swinging London cheer from the front loge adds +$${boonChips} bonus dollars per win.`,
        chips: boonChips,
      },
      WALTER_PRINGLE: {
        title: 'Walter’s 1-Across Endorsement',
        summary: `Tip of the tweed cap from Hartford adds +$${boonChips} bonus dollars to every right answer.`,
        chips: boonChips,
      },
      BETTY_LOU_HARPER: {
        title: 'Betty Lou’s High-C Harmony',
        summary: `Nashville cheering section in Loge A swells every win by +$${boonChips}.`,
        chips: boonChips,
      },
      MILES_ELLINGTON: {
        title: 'Miles’s Vanguard Downbeat',
        summary: `Two cool finger-snaps from the balcony swing +$${boonChips} onto every right answer.`,
        chips: boonChips,
      },
      SYLVIE_BEAUMONT: {
        title: 'Sylvie’s Three-Star Nod',
        summary: `Rare Montreal culinary approval garnishes every clean answer with +$${boonChips}.`,
        chips: boonChips,
      },
      MARGO_STERLING: {
        title: 'Margo’s Madison Ave Retainer',
        summary: `Agency toast from Loge A signs +$${boonChips} bonus dollars onto every right answer.`,
        chips: boonChips,
      },
      HANK_MCCOY: {
        title: 'Hank’s Gusher Side-Stake',
        summary: `Ten-gallon Stetson wave from the balcony pumps +$${boonChips} into every clean win.`,
        chips: boonChips,
      },
      ALASTAIR_KERR: {
        title: 'Alastair’s Reluctant Bravo',
        summary: `Savile Row golf-clap from Loge A quietly adds +$${boonChips} per right answer.`,
        chips: boonChips,
      },
      LANA_STARLING: {
        title: 'Lana’s Burbank Spotlight Kiss',
        summary: `Starlet wave toward Camera Two lifts every right answer by +$${boonChips}.`,
        chips: boonChips,
      },
      VINCE_CASTELLANO: {
        title: 'Vince’s Sands Comp Chip',
        summary: `Pit-boss nod from the balcony comps +$${boonChips} onto every winning turn.`,
        chips: boonChips,
      },
      REX_CALLOWAY: {
        title: 'Rex’s Press-Row Banner',
        summary: `Syndicated cheer from Loge A prints +$${boonChips} bonus dollars on every hit.`,
        chips: boonChips,
      },
      ARTHUR_PENDLETON: {
        title: 'Pendleton’s High-Table Salute',
        summary: `Oxford applause from Loge A adds +$${boonChips} bonus dollars per right answer.`,
        chips: boonChips,
      },
      NORMA_JEAN_BAKER: {
        title: 'Norma Jean’s Queen’s Salute',
        summary: `Grandmaster nod from the balcony awards +$${boonChips} on every sound move.`,
        chips: boonChips,
      },
      STERLING_VANCE: {
        title: 'Sterling’s Opening-Bell Dividend',
        summary: `Broad Street tip from Loge A pays a +$${boonChips} dividend on every right answer.`,
        chips: boonChips,
      },
      SEO_YUN_KANG: {
        title: 'Seo-Yun’s Geneva Citation',
        summary: `Crisp peer-review nod from the balcony adds +$${boonChips} to every verified hit.`,
        chips: boonChips,
      },
      CLARA_VON_BERG: {
        title: 'Clara’s Viennese Bravo',
        summary: `Maestro baton salute from Loge A swells every right answer by +$${boonChips}.`,
        chips: boonChips,
      },
      VICTOR_LAZAR: {
        title: 'Lazar’s Rare Respect',
        summary: `A quiet midnight nod from the Sphinx adds +$${boonChips} onto every sharp lock-in.`,
        chips: boonChips,
      },
    };

    const customBane: Record<
      RivalIdV7,
      { title: string; summary: string; multPen: number; rivalEv: number }
    > = {
      CARMEN_DELGADO: {
        title: 'Carmen’s Stern Triage Glare',
        summary: `Disappointed headshake from Loge B trims -${baneMultPen.toFixed(2)}× until you build a streak.`,
        multPen: baneMultPen,
        rivalEv: baneRivalEv,
      },
      TOBY_OKAFOR: {
        title: 'Toby’s Voltage Warning',
        summary: `Skeptical lineman fold-of-arms trims -${baneMultPen.toFixed(2)}× on cold turns.`,
        multPen: baneMultPen,
        rivalEv: baneRivalEv,
      },
      INEZ_CALLAHAN: {
        title: 'Inez’s Overdue Shush',
        summary: `Icy cat-eye glare from Loge B docks -${baneMultPen.toFixed(2)}× until your streak warms up.`,
        multPen: baneMultPen,
        rivalEv: baneRivalEv,
      },
      DOTTY_VANCE: {
        title: 'Dotty’s Cold Shoulder',
        summary: `Polite Kansas eyebrow raise from Loge B trims -${baneMultPen.toFixed(2)}× on cold picks.`,
        multPen: baneMultPen,
        rivalEv: baneRivalEv,
      },
      CHET_KOWALSKI: {
        title: 'Chet’s Alley Heckle',
        summary: `Milwaukee Bronx cheer from Loge B shaves -${baneMultPen.toFixed(2)}× until you streak.`,
        multPen: baneMultPen,
        rivalEv: baneRivalEv,
      },
      PEGGY_SUE_CONNORS: {
        title: 'Peggy Sue’s Coach Downgrade',
        summary: `Frosty stewardess smile from Loge B clips -${baneMultPen.toFixed(2)}× until you streak.`,
        multPen: baneMultPen,
        rivalEv: baneRivalEv,
      },
      BUZZ_HALVORSEN: {
        title: 'Buzz’s Telemetry Heckle',
        summary: `Cape Canaveral odds-calling from Loge B sharpens the Champion’s pace (+6% EV).`,
        multPen: baneMultPen,
        rivalEv: 0.06,
      },
      GIGI_ST_CLAIR: {
        title: 'Gigi’s Row-C Catcall',
        summary: `Swinging London sneer from Loge B trims -${baneMultPen.toFixed(2)}× until you catch fire.`,
        multPen: baneMultPen,
        rivalEv: baneRivalEv,
      },
      WALTER_PRINGLE: {
        title: 'Walter’s Red-Pen Nitpick',
        summary: `Crossword-editor muttering from Loge B docks -${baneMultPen.toFixed(2)}× on cold turns.`,
        multPen: baneMultPen,
        rivalEv: baneRivalEv,
      },
      BETTY_LOU_HARPER: {
        title: 'Betty Lou’s Rival Encore',
        summary: `Balcony cheering for Podium Two trims -${baneMultPen.toFixed(2)}× until you build a streak.`,
        multPen: baneMultPen,
        rivalEv: baneRivalEv,
      },
      MILES_ELLINGTON: {
        title: 'Miles’s Off-Beat Pan',
        summary: `Dry jazz-critic sigh from Loge B trims -${baneMultPen.toFixed(2)}× on non-streak turns.`,
        multPen: baneMultPen,
        rivalEv: baneRivalEv,
      },
      SYLVIE_BEAUMONT: {
        title: 'Sylvie’s One-Star Sniff',
        summary: `Withering Montreal critique from Loge B docks -${baneMultPen.toFixed(2)}× until you streak.`,
        multPen: baneMultPen,
        rivalEv: 0.06,
      },
      MARGO_STERLING: {
        title: 'Margo’s Sponsor Freeze',
        summary: `Cold Madison Avenue stare from Loge B trims -${baneMultPen.toFixed(2)}× on cold picks.`,
        multPen: baneMultPen,
        rivalEv: 0.06,
      },
      HANK_MCCOY: {
        title: 'Hank’s High-Stakes Grudge Bet',
        summary: `Booming Houston side-bet against you trims -${baneMultPen.toFixed(2)}× until you streak.`,
        multPen: baneMultPen,
        rivalEv: 0.06,
      },
      ALASTAIR_KERR: {
        title: 'Alastair’s Balcony Heckle',
        summary: 'Snide cough from the VIP box trims -0.10× multiplier until you build a streak.',
        multPen: baneTrust <= -1 ? 0.14 : 0.08,
        rivalEv: 0.05,
      },
      LANA_STARLING: {
        title: 'Lana’s Scene-Stealing Glare',
        summary: `Flashing compact mirrors from Loge B clip -${baneMultPen.toFixed(2)}× until you streak.`,
        multPen: baneMultPen,
        rivalEv: 0.06,
      },
      VINCE_CASTELLANO: {
        title: 'Vince’s Balcony House Line',
        summary: `Vegas pit-boss odds-making sharpens the Champion’s tempo (+7% EV) and trims -${baneMultPen.toFixed(2)}×.`,
        multPen: baneMultPen,
        rivalEv: 0.07,
      },
      REX_CALLOWAY: {
        title: 'Rex’s Press-Box Glare',
        summary: 'Spotlight bounce from Loge B trims -0.10× multiplier on non-streak turns.',
        multPen: baneTrust <= -1 ? 0.12 : 0.07,
        rivalEv: 0.05,
      },
      ARTHUR_PENDLETON: {
        title: 'Pendleton’s Donnish Skepticism',
        summary: `Arched Oxford brow from Loge B trims -${baneMultPen.toFixed(2)}× until you prove a streak.`,
        multPen: baneMultPen,
        rivalEv: baneRivalEv,
      },
      NORMA_JEAN_BAKER: {
        title: 'Norma Jean’s Endgame Hex',
        summary: `Silent chess-prodigy analysis from Loge B sharpens Podium Two’s accuracy (+7% EV).`,
        multPen: baneMultPen,
        rivalEv: 0.07,
      },
      STERLING_VANCE: {
        title: 'Sterling’s Short Position',
        summary: `Broad Street bet against your column trims -${baneMultPen.toFixed(2)}× until you streak.`,
        multPen: baneMultPen,
        rivalEv: 0.07,
      },
      SEO_YUN_KANG: {
        title: 'Seo-Yun’s Precision Odds',
        summary: 'Balcony probability tracking sharpens the Champion’s expected pace by +8%.',
        multPen: baneTrust <= -1 ? 0.12 : 0.06,
        rivalEv: 0.08,
      },
      CLARA_VON_BERG: {
        title: 'Clara’s Tempo Disruption',
        summary: `Sharp baton raps from Loge B throw off cold picks (-${baneMultPen.toFixed(2)}× multiplier).`,
        multPen: baneMultPen,
        rivalEv: 0.07,
      },
      VICTOR_LAZAR: {
        title: 'Lazar’s Sphinx Stare',
        summary: 'Chilling gaze from the Penthouse loge sharpens the Champion’s tempo (+8% EV).',
        multPen: 0.12,
        rivalEv: 0.08,
      },
    };

    const boon = customBoon[boonVoter];
    const bane = customBane[baneVoter];

    return {
      active: this.state.season === 4,
      boonVoter,
      boonTitle: boon.title,
      boonSummary: boon.summary,
      boonChipsPerTurn: boon.chips,
      baneVoter,
      baneTitle: bane.title,
      baneSummary: bane.summary,
      baneMultPenalty: bane.multPen,
      rivalEvBonusRatio: bane.rivalEv,
    };
  }

  /** Computes natural Episode 45 Control-Booth Coup Regime from player choices. */
  public computeNaturalCoupRegime(): Exclude<CoupRegimeIdV7, 'NONE'> {
    // On an unplayed save (e.g. previewing Episode Archive S3 before playing), align default preview with Regime A tab
    if (
      this.state.episodesPlayed === 0 &&
      this.state.boothArrestsCount === 0 &&
      this.state.canaryBurnedCount === 0 &&
      this.state.canaryAcceptedCount === 0 &&
      this.state.lienSegmentsPaid === 0
    ) {
      return 'REGIME_A_ROZ_PHARMA';
    }

    const veraScore =
      this.state.brokerFavor.VERA_KARP * 2 +
      this.state.boothArrestsCount * 2 +
      this.state.canaryBurnedCount * 2 +
      (this.state.waiver?.lienGoal === 'STAGE_10_BIBLE' ? 3 : 0);

    const rozScore =
      this.state.brokerFavor.ROZ_KORMAN * 2 +
      this.state.canaryAcceptedCount * 2 +
      Math.floor(this.state.contrabandTrunkCash / 2000) +
      (this.state.waiver?.lienGoal === 'DIRTY_HOUSE_MARKER' ? 3 : 0);

    const bellamyScore =
      this.state.brokerFavor.GRANT_BELLAMY * 2 +
      Math.floor(this.state.episodesWon / 6) +
      (this.state.waiver?.lienGoal === 'CLEAN_PURSE_250K' ? 3 : 0);

    if (veraScore >= rozScore && veraScore >= bellamyScore) {
      return 'REGIME_C_VERA_FORENSIC';
    }
    if (rozScore >= bellamyScore) {
      return 'REGIME_A_ROZ_PHARMA';
    }
    return 'REGIME_B_BELLAMY_UHF';
  }

  /** Returns all Stage-10 Finale Endings the player is eligible to claim on Episode 90! */
  public getEligibleFinaleEndings(): readonly FinaleEndingSpecV7[] {
    const eligible: FinaleEndingIdV7[] = [];

    if (
      this.state.canaryBurnedCount >= 2 ||
      this.state.boothArrestsCount >= 2 ||
      this.state.activeCoupRegime === 'REGIME_C_VERA_FORENSIC' ||
      this.state.waiver?.lienGoal === 'STAGE_10_BIBLE'
    ) {
      eligible.push('ENDING_01_SOVEREIGN_WHISTLEBLOWER');
    }

    if (
      this.state.contrabandTrunkCash >= 2500 ||
      this.state.canaryAcceptedCount >= 2 ||
      this.state.activeCoupRegime === 'REGIME_A_ROZ_PHARMA' ||
      this.state.waiver?.lienGoal === 'DIRTY_HOUSE_MARKER'
    ) {
      eligible.push('ENDING_03_CONTRABAND_SYNDICATE');
    }

    if (
      this.state.lienSegmentsPaid >= 12 ||
      this.state.cleanPurseCash >= 120000 ||
      this.state.waiver?.lienGoal === 'CLEAN_PURSE_250K'
    ) {
      eligible.push('ENDING_04_CLEAN_WALKAWAY');
    }

    const sympatheticTrustSum =
      (this.state.rivalTrust.CARMEN_DELGADO ?? 0) +
      (this.state.rivalTrust.TOBY_OKAFOR ?? 0) +
      (this.state.rivalTrust.INEZ_CALLAHAN ?? 0) +
      (this.state.rivalTrust.DOTTY_VANCE ?? 0);

    if (
      this.state.activeCoupRegime === 'REGIME_B_BELLAMY_UHF' ||
      sympatheticTrustSum >= 2 ||
      this.state.equippedRelics.some((r) => r.relicId === 'relic_channel_83_crystal')
    ) {
      eligible.push('ENDING_05_CHANNEL_83_PIRATE_TAKEOVER');
    }

    // Always allow Eight O'Clock Host succession if winning Stage 10, ensuring >= 2 rich choices!
    eligible.push('ENDING_02_NEW_VELVET_HOST');
    if (eligible.length === 1) {
      eligible.push('ENDING_04_CLEAN_WALKAWAY');
    }

    return eligible.map((id) => FINALE_ENDINGS_V7[id]);
  }

  /** Commits the end-of-episode ledger, Honest-Loss 50% Comeback Pot, Coup, Endings & 36 Trophies! */
  public recordEpisodeOutcome(input: EpisodeOutcomeInputV7): EpisodeOutcomeSummaryV7 {
    // Snapshot BEFORE any grantTrophyId() call so summary.newlyUnlockedTrophies captures 100% of unlocks!
    const beforeTrophies = new Set(this.state.unlockedTrophyIds);

    const playerScore = sanitizeFiniteIntV7(input.playerMatchScore, 0, 0);
    const rivalScore = sanitizeFiniteIntV7(input.rivalMatchScore, 0, 0);
    // Winning an episode requires beating the Champion's match score (or tying > $0 as 1966 Co-Champions!).
    const wonMatch = playerScore > rivalScore || (playerScore === rivalScore && playerScore > 0);

    this.state.episodesPlayed += 1;
    if (wonMatch) {
      this.state.episodesWon += 1;
    }

    // Update 25-match cross-toy entity cooldown ring
    if (input.seenEntityKeysInMatch && input.seenEntityKeysInMatch.length > 0) {
      const mergedKeys = [...this.state.recentEntityKeys, ...input.seenEntityKeysInMatch];
      this.state.recentEntityKeys = [...new Set(mergedKeys)].slice(
        -MAX_ENTITY_COOLDOWN_KEYS_V7,
      );
    }

    // Rival Trust updates (Studio Truce + Golden Exit Specials)
    const rivalId = input.blueprint.rivalId;
    if (input.respectedAmberTruce) {
      this.state.rivalTrust[rivalId] = Math.min(3, (this.state.rivalTrust[rivalId] ?? 0) + 1);
    } else if (input.poachedAmberTruce) {
      this.state.rivalTrust[rivalId] = Math.max(-3, (this.state.rivalTrust[rivalId] ?? 0) - 1);
    }

    let cleanCashAdded = Math.max(0, Math.floor(input.cleanBonusCash ?? 0));
    let contrabandCashAdded = Math.max(0, Math.floor(input.contrabandBonusCash ?? 0));
    let grudgeBountyReclaimed = 0;
    let grudgeBountyStoredOnLoss = 0;
    let triggeredVaultDropNext = false;
    let liberatedRival: RivalIdV7 | null = null;

    // Direct contraption/board feat trophies earned inside the match
    if (input.earnedTrophyIdsInMatch) {
      for (const tid of input.earnedTrophyIdsInMatch) {
        this.grantTrophyId(tid);
      }
    }

    if (wonMatch) {
      if (input.blueprint.episodeNumber === 1) {
        this.grantTrophyId('trophy_s1_01');
      }
      if (input.respectedAmberTruce) {
        this.grantTrophyId('trophy_s1_05');
      }
      if ((input.boothArrestsInMatch ?? 0) >= 1) {
        this.grantTrophyId('trophy_s3_23');
      }
      if (this.state.activeCoupRegime === 'REGIME_A_ROZ_PHARMA') {
        this.grantTrophyId('trophy_s4_28');
      } else if (this.state.activeCoupRegime === 'REGIME_B_BELLAMY_UHF') {
        this.grantTrophyId('trophy_s4_29');
      } else if (this.state.activeCoupRegime === 'REGIME_C_VERA_FORENSIC') {
        this.grantTrophyId('trophy_s4_30');
      }

      if (input.canaryAction === 'POCKETED') {
        // Split 65% clean / 35% backstage when match won on a pocketed commercial-break tip
        const dirtyShare = Math.floor(playerScore * 0.35);
        const cleanShare = playerScore - dirtyShare;
        cleanCashAdded += cleanShare;
        contrabandCashAdded += dirtyShare;
      } else {
        cleanCashAdded += playerScore;
      }

      if (this.state.grudgeBountyPool > 0) {
        grudgeBountyReclaimed = this.state.grudgeBountyPool;
        cleanCashAdded += grudgeBountyReclaimed;
        this.state.grudgeBountyPool = 0;
      }

      // Stage-specific win trophies (aligned 1:1 with LitTrophyVaultV7)
      this.awardStageWinTrophy(input.blueprint.stageId, playerScore - rivalScore);

      // Season 2 Golden Exit Freedom Specials
      if (input.blueprint.isGoldenExitMatch) {
        this.grantTrophyId('trophy_s3_26');
        if (input.blueprint.episodeNumber === 28) {
          liberatedRival = 'CARMEN_DELGADO';
          this.state.rivalTrust.CARMEN_DELGADO = Math.min(
            3,
            (this.state.rivalTrust.CARMEN_DELGADO ?? 0) + 2,
          );
        } else if (input.blueprint.episodeNumber === 34) {
          liberatedRival = 'TOBY_OKAFOR';
          this.state.rivalTrust.TOBY_OKAFOR = Math.min(
            3,
            (this.state.rivalTrust.TOBY_OKAFOR ?? 0) + 2,
          );
        } else if (input.blueprint.episodeNumber === 40) {
          liberatedRival = 'INEZ_CALLAHAN';
          this.state.rivalTrust.INEZ_CALLAHAN = Math.min(
            3,
            (this.state.rivalTrust.INEZ_CALLAHAN ?? 0) + 2,
          );
        }
      }
    } else {
      // HONEST LOSS: Zero Retry walls! 50% of match score rolls into Comeback Pot!
      grudgeBountyStoredOnLoss = Math.max(125, Math.floor(playerScore * 0.5));
      this.state.grudgeBountyPool += grudgeBountyStoredOnLoss;
      cleanCashAdded += Math.floor(playerScore * 0.25); // Union scale appearance fee
      triggeredVaultDropNext = this.state.season === 1;
    }

    if (input.blueprint.isVaultDrop) {
      this.state.brokerFavor.VERA_KARP += 1;
    }

    this.state.cleanPurseCash += cleanCashAdded;
    this.state.contrabandTrunkCash += contrabandCashAdded;

    // Episode 45 Hour-11 Control-Booth Coup Pivot
    if (input.blueprint.isCoupPivot || input.blueprint.episodeNumber === 45) {
      this.state.activeCoupRegime =
        input.chosenCoupRegime ?? this.computeNaturalCoupRegime();
      this.grantTrophyId('trophy_s3_27');
    }

    // Milestone Season Completion Trophies
    if (input.blueprint.episodeNumber >= 22 && this.state.lienSegmentsPaid >= 3) {
      this.grantTrophyId('trophy_s1_09');
    }
    if (input.blueprint.episodeNumber >= 45) {
      this.grantTrophyId('trophy_s2_18');
    }

    // Episode 90 Stage-10 Finale Ending Resolution
    let unlockedEnding: FinaleEndingSpecV7 | null = null;
    if (input.blueprint.isFinale && wonMatch) {
      const eligible = this.getEligibleFinaleEndings();
      const picked =
        (input.chosenFinaleEnding ? FINALE_ENDINGS_V7[input.chosenFinaleEnding] : undefined) ??
        eligible[0];
      unlockedEnding = picked;
      if (!this.state.unlockedEndings.includes(picked.endingId)) {
        this.state.unlockedEndings.push(picked.endingId);
      }
      this.grantTrophyId(picked.trophyId);
      this.grantTrophyId('trophy_s4_35');
      this.grantTrophyId('trophy_s4_36');
    }

    // Advance campaign clock (0 Retry walls on honest loss unless on Ep 90 championship crest)
    if (!input.blueprint.isFinale) {
      this.state.currentEpisode = Math.min(90, input.blueprint.episodeNumber + 1);
      this.state.season = episodeToSeasonV7(this.state.currentEpisode);
    }

    const newlyUnlockedTrophies = this.evaluateTrophyUnlocks(TROPHY_CATALOG_V7, beforeTrophies);
    this.saveToStorage();

    return {
      wonMatch,
      cleanCashAdded,
      contrabandCashAdded,
      grudgeBountyReclaimed,
      grudgeBountyStoredOnLoss,
      triggeredVaultDropNext,
      liberatedRival,
      resolvedCoupRegime: this.state.activeCoupRegime,
      unlockedEnding,
      newlyUnlockedTrophies,
      nextEpisodeNumber: this.state.currentEpisode,
    };
  }

  /** Persists a player-selected Stage-10 Finale Ending (e.g. from the Finale Ceremony switcher) and grants its matching trophy! */
  public commitFinaleEndingSelection(endingId: FinaleEndingIdV7): {
    readonly ending: FinaleEndingSpecV7;
    readonly newlyUnlockedTrophies: readonly TrophySpecV7[];
  } {
    const beforeTrophies = new Set(this.state.unlockedTrophyIds);
    const ending = FINALE_ENDINGS_V7[endingId];
    if (!this.state.unlockedEndings.includes(ending.endingId)) {
      this.state.unlockedEndings.push(ending.endingId);
    }
    this.grantTrophyId(ending.trophyId);
    const newlyUnlockedTrophies = this.evaluateTrophyUnlocks(TROPHY_CATALOG_V7, beforeTrophies);
    this.saveToStorage();
    return { ending, newlyUnlockedTrophies };
  }

  /** Allows toys/boards to unlock specific feat trophies (`trophy_s1_06`, `trophy_s2_14`, etc.). */
  public unlockTrophyById(trophyId: string): TrophySpecV7 | null {
    const spec = TROPHY_CATALOG_V7.find((t) => t.trophyId === trophyId);
    if (!spec || this.state.unlockedTrophyIds.includes(trophyId)) {
      return null;
    }
    this.state.unlockedTrophyIds.push(trophyId);
    this.saveToStorage();
    return spec;
  }

  /** Evaluates all 36 canonical `TROPHY_CATALOG_V7` rules against live save state. */
  public evaluateTrophyUnlocks(
    catalog: readonly TrophySpecV7[] = TROPHY_CATALOG_V7,
    priorUnlockedSnapshot?: ReadonlySet<string>,
  ): readonly TrophySpecV7[] {
    const before = priorUnlockedSnapshot ?? new Set(this.state.unlockedTrophyIds);

    if (this.state.boothArrestsCount >= 1) {
      this.grantTrophyId('trophy_s1_08');
    }
    if (this.state.canaryBurnedCount >= 1) {
      this.grantTrophyId('trophy_s2_13');
    }
    if (this.state.currentEpisode > 22 && this.state.lienSegmentsPaid >= 3) {
      this.grantTrophyId('trophy_s1_09');
    }
    if (
      (this.state.rivalTrust.TOBY_OKAFOR ?? 0) >= 3 ||
      (this.state.rivalTrust.CARMEN_DELGADO ?? 0) >= 3 ||
      (this.state.rivalTrust.INEZ_CALLAHAN ?? 0) >= 3 ||
      (this.state.rivalTrust.DOTTY_VANCE ?? 0) >= 3
    ) {
      this.grantTrophyId('trophy_s2_15');
    }
    if (this.state.currentEpisode > 45 || this.state.lienSegmentsPaid >= 6) {
      this.grantTrophyId('trophy_s2_18');
    }
    if (
      this.state.season === 4 &&
      ((this.state.rivalTrust.CARMEN_DELGADO ?? 0) >= 1 ||
        (this.state.rivalTrust.TOBY_OKAFOR ?? 0) >= 1 ||
        (this.state.rivalTrust.INEZ_CALLAHAN ?? 0) >= 1 ||
        (this.state.rivalTrust.DOTTY_VANCE ?? 0) >= 1)
    ) {
      this.grantTrophyId('trophy_s3_22');
    }
    if (this.state.equippedRelics.length >= MAX_TRUNK_SLOTS_V7) {
      this.grantTrophyId('trophy_s4_31');
    }
    if (this.state.lienSegmentsPaid >= 12 && this.state.contrabandTrunkCash === 0) {
      this.grantTrophyId('trophy_s4_32');
    }
    if (this.state.contrabandTrunkCash >= 5000 && this.state.boothArrestsCount === 0) {
      this.grantTrophyId('trophy_s4_33');
    }

    return catalog.filter(
      (t) => !before.has(t.trophyId) && this.state.unlockedTrophyIds.includes(t.trophyId),
    );
  }

  private awardStageWinTrophy(stageId: StageWorldIdV7, marginCash: number): void {
    switch (stageId) {
      case 'STAGE_01_IBC_DAYTIME_FUNK':
        this.grantTrophyId('trophy_s1_01');
        this.grantTrophyId('trophy_s1_02');
        break;
      case 'STAGE_02_IBC_PRIMETIME_JUBILEE':
        this.grantTrophyId('trophy_s1_03');
        break;
      case 'STAGE_03_1926_VAUDEVILLE_PIT':
        this.grantTrophyId('trophy_s1_04');
        break;
      case 'STAGE_04_1958_ISOLATION_VAULT':
        this.grantTrophyId('trophy_s2_10');
        break;
      case 'STAGE_05_1984_LARSON_CRT_LAB':
        this.grantTrophyId('trophy_s2_11');
        break;
      case 'STAGE_06_ATLANTIC_CITY_PIER':
        this.grantTrophyId('trophy_s2_12');
        break;
      case 'STAGE_07_1969_MONTE_CARLO_CASINO':
        if (marginCash >= 400) {
          this.grantTrophyId('trophy_s3_19');
        }
        break;
      case 'STAGE_08_WORLDS_FAIR_GEODESIC':
        this.grantTrophyId('trophy_s3_20');
        break;
      case 'STAGE_09_CHANNEL_83_UHF_BARGE':
        this.grantTrophyId('trophy_s3_21');
        break;
      case 'STAGE_10_SOVEREIGN_SANCTUM':
        this.grantTrophyId('trophy_s4_35');
        break;
    }
  }

  private grantTrophyId(trophyId: string): void {
    if (!this.state.unlockedTrophyIds.includes(trophyId)) {
      this.state.unlockedTrophyIds.push(trophyId);
    }
  }

  /** Returns a bespoke character-driven Cold Open for Quick Play so rival quotes never bleed Ep 1. */
  public composeQuickPlayColdOpen(
    rivalId: RivalIdV7,
  ): { readonly speaker: CastIdV7; readonly line: string } {
    return {
      speaker: rivalId,
      line: getChampionCurtainRaiserLineV7(rivalId),
    };
  }

  private composeColdOpenLine(
    ep: number,
    season: 1 | 2 | 3 | 4,
    rivalId: RivalIdV7,
    stageId: StageWorldIdV7,
    isVaultDrop: boolean,
    isGoldenExitMatch: boolean,
    isCoupPivot: boolean,
    isFinale: boolean,
  ): { readonly speaker: CastIdV7; readonly line: string } {
    // Progressive Ep 1–6 Season-1 Onboarding Beats (Painted-First Opener, Character-Driven 390px Fit!)
    if (ep === 1) {
      return {
        speaker: 'CARMEN_DELGADO',
        line: getChampionCurtainRaiserLineV7('CARMEN_DELGADO'),
      };
    }
    if (ep === 2) {
      return {
        speaker: 'TOBY_OKAFOR',
        line: 'I hear loose wiring a block away—watch how Champions react to scout hidden blind spots before I block your line!',
      };
    }
    if (ep === 3) {
      return {
        speaker: 'INEZ_CALLAHAN',
        line: 'Forty years at the Reference Desk taught me to read twice—chain two clean wins to crack the $500 Vault before I do!',
      };
    }
    if (ep === 4) {
      return {
        speaker: 'DOTTY_VANCE',
        line: 'Fresh in from Topeka with my lucky blue ribbon! Keep your eyes peeled when a Mystery Curtain or Big Wheel lights up!',
      };
    }
    if (ep === 5) {
      return {
        speaker: 'CHET_KOWALSKI',
        line: 'Three 300-games taught me to aim for the fattest top-row cash—beat me to the $500 Vault and watch my collar steam!',
      };
    }
    if (ep === 6) {
      return {
        speaker: 'PEGGY_SUE_CONNORS',
        line: 'Just flew the Pan Am Clipper in from Rome onto Burbank’s Pop-Art set—lock your tray table when those prize shutters pop!',
      };
    }

    if (isFinale) {
      return {
        speaker: 'GRANT_BELLAMY',
        line: 'Thirty-six floors above Sixth Ave for $250,000—let’s see whether you came to host this network or blow its doors off!',
      };
    }
    if (isCoupPivot) {
      return {
        speaker: 'ROZ_KORMAN',
        line: 'Our Monte Carlo satellite closes in ten minutes—pick who runs Booth A next season before somebody leaves in cuffs!',
      };
    }
    if (isVaultDrop) {
      if (stageId === 'STAGE_03_1926_VAUDEVILLE_PIT') {
        return {
          speaker: 'VERA_KARP',
          line: 'Audience gone, applause sign dark—win this after-hours Burbank tape to reclaim every dollar in your Comeback Pot!',
        };
      }
      if (stageId === 'STAGE_04_1958_ISOLATION_VAULT') {
        return {
          speaker: 'VERA_KARP',
          line: 'Inside the ’64 Teak Glass Booth—zero sponsor tricks, and winning ten square turns reclaims your whole Comeback Pot!',
        };
      }
      return {
        speaker: 'VERA_KARP',
        line: '2:30 AM in Apollo Color Control—beat ten clean off-air turns and your entire Comeback Pot transfers into Clean Cash!',
      };
    }
    if (isGoldenExitMatch) {
      if (rivalId === 'CARMEN_DELGADO') {
        return {
          speaker: 'CARMEN_DELGADO',
          line: 'Big night on Steel Pier—beat this board square with zero dirty cash and my Queens clinic pays off its mortgage!',
        };
      }
      if (rivalId === 'TOBY_OKAFOR') {
        return {
          speaker: 'TOBY_OKAFOR',
          line: 'I pulled every rigged wire under the Unisphere—ten honest turns tonight and the network tears up my exclusive bond!',
        };
      }
      if (rivalId === 'INEZ_CALLAHAN') {
        return {
          speaker: 'INEZ_CALLAHAN',
          line: 'Three miles offshore on Channel 83, Roz’s lawyers have zero reach—win clean and I retire with my full pension!',
        };
      }
      return {
        speaker: 'GRANT_BELLAMY',
        line: 'Final stop on our sweeps tour in Monte Carlo—every dollar banked tonight sets the stage for tomorrow’s Booth coup!',
      };
    }

    if (season === 3) {
      if (this.state.activeCoupRegime === 'REGIME_A_ROZ_PHARMA') {
        const rozLines: readonly string[] = [
          'Vanguard Tonic bought every break tonight—play ball with my wax-sealed tips and your Backstage Cash will overflow!',
          'Booth A belongs to the sponsors now, darling—pocket my halftime envelope at Turn 5 for extra multipliers.',
          'Skybox B adores a bold gambler—crack the $500 Vault and peek beneath my red wax seal at halftime!',
          'Ratings are printing money in thirty-two markets—take the Turn-5 sponsor tip and let’s keep everybody rich.',
        ];
        return {
          speaker: 'ROZ_KORMAN',
          line: rozLines[ep % rozLines.length],
        };
      }
      if (this.state.activeCoupRegime === 'REGIME_B_BELLAMY_UHF') {
        const bellamyLines: readonly string[] = [
          'Censors pulled our landline, so we’re blasting fifty kilowatts off Channel 83—tap glowing Halo squares for bonus mult!',
          'Every rabbit-ear antenna from Brooklyn to Boston is locked onto us—crack that $500 Vault and put on a clinic!',
          'Zero Madison Avenue suits in the booth tonight—just hot color lenses and bonus cash on every Channel 83 Halo square!',
          'The Coast Guard cutter is circling off portside, which just doubled our ratings—light up the whole board!',
        ];
        return {
          speaker: 'GRANT_BELLAMY',
          line: bellamyLines[ep % bellamyLines.length],
        };
      }
      const veraLines: readonly string[] = [
        'Federal observers are timing every camera—keep Backstage Cash at $0 or bust a LIVE TELL for clean audit bonuses!',
        'Standards padlocked the cue rack tonight—burn any shady envelope on air at Turn 5 for certified Clean Purse cash.',
        'Every cable under the floor is tagged as evidence—outthink the Champion square and watch your Clean Purse climb!',
        'My stenographer is logging every turn from Booth B—catch a LIVE TELL tonight and I’ll certify the bounty myself.',
      ];
      return {
        speaker: 'VERA_KARP',
        line: veraLines[ep % veraLines.length],
      };
    }

    if (season === 4) {
      const s4ByChampion: Partial<Record<RivalIdV7, readonly string[]>> = {
        ARTHUR_PENDLETON: [
          'Look up at the velvet balcony—honest scholars are applauding from Loge A while we play pure trivia for the summit!',
          'No back-room envelopes needed at Magdalen or Stage Ten—let the VIP Balcony witness ten clean championship turns!',
        ],
        NORMA_JEAN_BAKER: [
          'Half the former champs in Loge B are betting you blunder by Turn 4—I already mapped the endgame before the theme ended.',
          'The balcony wants drama, challenger, yet chess prodigies prefer clean checkmates before the commercial break.',
        ],
        STERLING_VANCE: [
          'Wall Street high rollers packed Loge B just to short your bankroll—one cold stretch and the Penthouse stays locked!',
          'Every former champ upstairs knows how Broad Street closes: raid the top row early and price out the competition.',
        ],
        SEO_YUN_KANG: [
          'Even with friends cheering from Loge A, my Geneva variance model leaves you zero margin for hesitation tonight.',
          'The balcony loves an underdog story; laboratory math favors whoever controls the $500 Vault and multipliers.',
        ],
        CLARA_VON_BERG: [
          'The velvet loge can cheer all it likes—tonight’s semifinal moves at Vienna’s tempo, not the balcony’s!',
          'Every past champion whose streak you broke is watching from Loge B—drop one beat and I cut your lead in half!',
        ],
        VICTOR_LAZAR: [
          'Even the noisy VIP Balcony hushes when the Sphinx steps to Podium Two—show fifty million why you reached Season Four.',
          'Eleven Fridays undefeated beneath these lights—let the former champions upstairs judge whether you belong here.',
        ],
      };
      const bespoke = s4ByChampion[rivalId];
      if (bespoke) {
        return {
          speaker: rivalId,
          line: bespoke[ep % bespoke.length],
        };
      }
      const sympLogeLines: readonly string[] = [
        'Look up at Loge A—friends you backed on tour are cheering bonus dollars onto every right answer tonight!',
        'Half the velvet balcony is pulling for you tonight—pop the $500 Vault early and ride the streak to Stage Ten!',
      ];
      const heelLogeLines: readonly string[] = [
        'Side bets are stacked against you in Loge B—one cold streak up top and the Penthouse elevator stays shut!',
        'Every champ whose streak you snapped is watching from Loge B—let’s see how steady your buzzer stays tonight.',
      ];
      return {
        speaker: rivalId,
        line:
          CAST_PROFILES_V7[rivalId].role === 'RIVAL_SYMPATHETIC'
            ? sympLogeLines[ep % sympLogeLines.length]
            : heelLogeLines[ep % heelLogeLines.length],
      };
    }

    const rivalPools: Record<RivalIdV7, readonly string[]> = {
      DOTTY_VANCE: [
        'Oh, how thrilling—my whole bridge club in Topeka bought color sets just to see me spin that shiny Big Wheel!',
        'I brought two pecan chiffons for the stagehands, darling—now let’s see what hides behind tonight’s Mystery Curtain!',
        'Win an adjacent square to pop that $500 Gold Vault—I promise I’ll clap even if you beat me to it!',
      ],
      CARMEN_DELGADO: [
        'Leave my marked Truce square alone on the first pass and we both walk out ahead of the network’s cut tonight.',
        'Twelve hours on Bellevue night ward makes thirty-second studio clocks feel like a coffee break—bring your A-game!',
        'My ward nurses tuned the break-room color set to Channel 4—let’s give them ten clean, honest turns!',
      ],
      CHET_KOWALSKI: [
        'Bowl three hundred in Milwaukee and nobody blinks—nail a $500 square on live TV and the whole alley drinks free!',
        'I’m aiming straight for the top-dollar rack tonight, pal—try not to step in front of my hook!',
        'Keep your hands off the Wurlitzer plaques and I might let you borrow my lucky rosin bag!',
      ],
      PEGGY_SUE_CONNORS: [
        'Coffee, tea, or a Mystery Curtain? Pan Am taught me to smile through turbulence and spin for first-class jackpots!',
        'My crew in Rome is staying up past midnight for this broadcast—let’s make those marquee bulbs blaze!',
        'Watch the Big Wheel when I step up—a clipper hostess always knows how to land on the gold wedge!',
      ],
      TOBY_OKAFOR: [
        'If a square hums before you tap it, Control Booth A wired extra juice underneath—keep your eyes peeled!',
        'I spent all afternoon balancing Midtown transformers; let’s play ten square turns and make the split-flaps sing.',
        'Watch the rebound cash when either of us misses—a +$50 open square turns a close match around fast!',
      ],
      INEZ_CALLAHAN: [
        'Read the second half of every question closely—our writers love tucking a giveaway clue right beside the punchline!',
        'I brought three sharpened No. 2 pencils and forty years of reference clippings; beat me cleanly and I’ll tip my hat.',
        'String two right answers together and that $500 Locked Vault pops right open—just don’t leave it sitting there for me.',
      ],
      BUZZ_HALVORSEN: [
        'T-minus ten turns to liftoff—slide rule calibrated, trajectory plotted, zero room for sloppy arithmetic.',
        'Cape Canaveral taught me one iron rule: trust the checklist, sweep the hardware squares, and never sweat the clock.',
        'Nice studio setup here at 30 Rock—let’s see if your nerve holds up past Turn 7.',
      ],
      GIGI_ST_CLAIR: [
        'Fabulous studio lighting, darling—now spin that Big Wheel and let’s make Carnaby Street proud!',
        'If you blink while I’m eyeing the Mystery Curtain, half your purse is heading straight back to Soho!',
        'Everybody in Row C adores my op-art shift—try to focus on the Tote Board instead of my hemline!',
      ],
      WALTER_PRINGLE: [
        'A Tote Board is just a vertical Sunday crossword, my friend—block the crossing letters and watch your opponent stall.',
        'I’ve outfoxed half of Hartford every Sunday morning for twenty years; ten television turns won’t ruffle my tweed.',
        'Careful on those trick wordings—our writers love slipping a sly fallacy into the back half of a sentence.',
      ],
      BETTY_LOU_HARPER: [
        'Honey, I teased this beehive three inches higher just for the color cameras—wait till you see my Turn 9 encore!',
        'Down in Nashville we save the biggest hook for the final chorus, so don’t get cozy with an early lead!',
        'Hear that studio showband swing? Makes me want to sweep the whole bottom row in one breath!',
      ],
      MILES_ELLINGTON: [
        'Dig the tempo on that Hammond organ, cat—I’ll just sit back, play the cool blocks, and let you rush the beat.',
        'Midnight at the Vanguard taught me never to chase bad notes—pick the right lane and let the dollars swing.',
        'No sweat, no panic—just crisp answers in Living Color until the final bell cools off.',
      ],
      SYLVIE_BEAUMONT: [
        'Mon Dieu, these studio lights are bright enough to curdle a hollandaise—bring me the $500 plaques immediately!',
        'I do not nibble at $150 appetizers, challenger—I order straight from the top of the Tote Board!',
        'Dare to snatch my favorite square and you will discover how sharp a Montreal dining critic can be!',
      ],
      MARGO_STERLING: [
        'In my Madison Avenue conference room, nobody speaks until the numbers work—and tonight the Tote Board works for me.',
        'I’ll block your streaks before the first commercial and still make my nine o’clock reservation at the Four Seasons.',
        'Sweetie, I sell refrigerators to polar bears—outmaneuvering a walk-on takes half a martini.',
      ],
      HANK_MCCOY: [
        'Yee-haw! Back in Houston we don’t drill shallow holes—point me at the $600 Blind plaques and stand back!',
        'Pass me a Press-Your-Luck spin and I’ll stare that Signal-Jam test pattern straight into the dirt—mostly!',
        'Keep your hands off my top-row gushers or you’ll hear this Stetson echo all the way to Hoboken!',
      ],
      ALASTAIR_KERR: [
        'Nine weeks undefeated and makeup still powders my lapels twice—do try not to embarrass yourself before the commercial.',
        'My Savile Row tailor bet fifty dollars you’d blink on the top row; prove him wrong if you have the nerve.',
        'Grant Bellamy already reserved my table at “21” for nine o’clock—let’s keep this tidy, challenger.',
      ],
      LANA_STARLING: [
        'Make sure Camera Two gets my left profile, sweetie—I’m spinning the Big Wheel and stealing the whole broadcast!',
        'My Burbank fan club sent three hundred telegrams tonight, so don’t expect me to play shy on the wild tiles!',
        'One wink at the right square and the audience melts—good luck keeping up with prime-time star power!',
      ],
      VINCE_CASTELLANO: [
        'At the Sands we love players who celebrate at Turn 5—because the pit boss always collects between Turns 8 and 10.',
        'Sharkskin doesn’t crease and I don’t sweat—let’s see how clean your math stays when the clock dips low.',
        'Pass me spins if you’ve got the nerve, kid—I’ve stared down nastier static than a 1966 test pattern.',
      ],
      REX_CALLOWAY: [
        'Give Camera Three your good profile, pal—fifty million viewers tuned in for my press-box swagger, not an upset!',
        'My syndicate editor already wrote tomorrow’s headline: “Calloway Cruises in Living Color!”',
        'Wait till the ninth inning, rookie—that’s when I clear the bases and lock the trophy case!',
      ],
      ARTHUR_PENDLETON: [
        'How refreshingly civilized—an honest contest of scholarship under incandescent marquee bulbs. Shall we begin?',
        'No secret signals for me, thank you; an Oxford don prefers to dismantle his opponent in full view of the cameras.',
        'Mind your multipliers, challenger—classical erudition compounds remarkably briskly on a hot streak.',
      ],
      NORMA_JEAN_BAKER: [
        'I already mapped the next six turns while the announcer read our names—your opening pick is practically forced.',
        'Behind these shades I see every fork, every lock, and every bridge on this board. Your move.',
        'A charming opening gambit—let’s see if you survive the endgame without dropping a key square.',
      ],
      STERLING_VANCE: [
        'Every plaque on this rack is an undervalued asset—and I intend to buy the top row before the closing bell.',
        'Emotion loses money on Broad Street and on Studio 6A. Watch how a tape-reader prices a Blind $600 tile.',
        'Keep your clean purse tidy, challenger—I’m about to execute a hostile takeover of tonight’s Tote Board.',
      ],
      SEO_YUN_KANG: [
        'I calculated your expected finish during the theme song—anything shy of a hot streak belongs to my ledger.',
        'Geneva laboratory discipline leaves zero room for guesswork—leave one Vault unguarded and I will claim it cleanly.',
        'Hit two in a row and the multipliers compound fast; hesitate and I’ll clear the top row before Turn 8.',
      ],
      CLARA_VON_BERG: [
        'Tonight’s broadcast moves at MY tempo—step out of rhythm on one square and I shall cut your lead in half!',
        'I have disciplined hundred-piece Vienna orchestras; a nervous challenger at Podium One is a light warm-up.',
        'Touch my favorite square and you will hear the brass section play a funeral march for your streak!',
      ],
      VICTOR_LAZAR: [
        'Eleven Fridays undefeated. Eleven challengers certain they found a crack in the marble. Let us test your theory.',
        'The spotlights never bother me, and the clock never hurries me—show fifty million viewers what you truly know.',
        'Enjoy the early turns, challenger. On Turn 8, the Sphinx wakes up and clears the Penthouse board.',
      ],
    };

    const brokerInterjections: readonly { speaker: BrokerIdV7; line: string }[] = [
      {
        speaker: 'GRANT_BELLAMY',
        line: 'Chicago just hit a forty-eight share—crack the $500 Vault or find the Secret Square and give America fireworks!',
      },
      {
        speaker: 'ROZ_KORMAN',
        line: 'Sponsors adore a gambler, darling—check your lectern during the Turn 5 commercial break for a little canary-yellow edge.',
      },
      {
        speaker: 'VERA_KARP',
        line: 'My stopwatch is running from Control Booth B—catch any crooked LIVE TELL on stage tonight and I’ll certify the cash bonus myself!',
      },
      {
        speaker: 'GRANT_BELLAMY',
        line: 'Coast-to-coast color sets are glowing from Manhattan to Malibu—build a two-answer streak and watch those multipliers climb!',
      },
    ];

    if (ep % 4 === 0) {
      return brokerInterjections[Math.floor(ep / 4) % brokerInterjections.length];
    }
    const pool = rivalPools[rivalId];
    return {
      speaker: rivalId,
      line: pool[ep % pool.length],
    };
  }

  private composeBoothCheatHint(
    rivalId: RivalIdV7,
    stageId: StageWorldIdV7,
    isVaultDrop: boolean,
    isFinale: boolean,
  ): string {
    const profile = CAST_PROFILES_V7[rivalId];
    const stageCallsign = FRIENDLY_STAGE_CALLSIGNS_V7[stageId] ?? 'STUDIO 6A';
    const styleLabel =
      profile.playstyle === 'GAMBLER'
        ? 'Wheel & Curtain Gambler'
        : profile.playstyle === 'BLOCKER'
          ? 'Tactical Line Blocker'
          : profile.playstyle === 'HIGH_ROLLER'
            ? 'Top-Row High Roller'
            : profile.playstyle === 'CLUTCH_SHARK'
              ? 'Late-Turn Clutch Shark'
              : 'Category Professor';

    if (isFinale) {
      return `PENTHOUSE SCOUTING WIRE — Grand Finale vs. ${profile.name} (${styleLabel}). Track every reaction to ink ★ Weak Spots & slap CATCH CHEAT if a LIVE TELL blinks!`;
    }
    if (isVaultDrop) {
      return `${stageCallsign} WIRE — Off-Air Comeback Tape! Beat ${profile.name} cleanly to bring every dollar in your Comeback Pot home.`;
    }
    if (profile.cheatChannel === 'FRESNEL_LAMP') {
      return `${stageCallsign} WIRE — ${profile.name} (${styleLabel}) takes cues off Spotlight #4. Slap CATCH CHEAT the instant LIVE TELL flashes!`;
    }
    if (profile.cheatChannel === 'SOLENOID_SPARK') {
      return `${stageCallsign} WIRE — ${profile.name} (${styleLabel}) reads rigged pulses under the lectern. Hit CATCH CHEAT whenever LIVE TELL sparks!`;
    }
    if (profile.cheatChannel === 'ROW_C_GLINT') {
      return `${stageCallsign} WIRE — ${profile.name} (${styleLabel}) gets opera-glass flashes from Row C. Bust their LIVE TELL with CATCH CHEAT!`;
    }
    const fairTip =
      profile.playstyle === 'BLOCKER'
        ? `Expect tight lane blocks—watch fumbles to log ★ Weak Spots (+0.5× bonus).`
        : profile.playstyle === 'GAMBLER'
          ? `Loves Curtains & Wheels—log ★ Weak Spots from their misses (+0.5× bonus).`
          : profile.playstyle === 'HIGH_ROLLER'
            ? `Chases top-row vaults—spot their blind spots to cash ★ Weak Spots (+0.5× bonus).`
            : profile.playstyle === 'CLUTCH_SHARK'
              ? `Surges on Turns 8–10—build a lead early and exploit ★ Weak Spots (+0.5× bonus).`
              : `Plays by the book—read their TV Guide close-up & log ★ Weak Spots (+0.5× bonus).`;
    return `${stageCallsign} WIRE — Fair-Play ${styleLabel}: ${profile.name}. ${fairTip}`;
  }

  private composeCanaryEnvelope(
    ep: number,
    season: 1 | 2 | 3 | 4,
    rivalId: RivalIdV7,
    stageId: StageWorldIdV7,
    isVaultDrop: boolean,
  ): { readonly broker: BrokerIdV7; readonly note: string; readonly isPoisoned: boolean } {
    if (isVaultDrop) {
      const vaultTag =
        stageId === 'STAGE_03_1926_VAUDEVILLE_PIT'
          ? 'BURBANK VAULT MEMO'
          : stageId === 'STAGE_04_1958_ISOLATION_VAULT'
            ? 'TEAK BOOTH MEMO'
            : 'APOLLO CONTROL MEMO';
      return {
        broker: 'VERA_KARP',
        note: `${vaultTag}: “This off-air tape is 100% clean. BURN ON AIR for +$125 certified Clean Purse, or POCKET for +$180 Backstage Cash plus a verified answer mark next turn!”`,
        isPoisoned: false,
      };
    }

    if (ep === 90) {
      return {
        broker: 'ROZ_KORMAN',
        note: '36TH-FLOOR PENTHOUSE COURIER: “Fifty million watching and Bellamy’s palm is sweating! POCKET for +$180 Backstage Cash & a marked answer (check UV—I play for keeps!), or BURN ON AIR for +$125 Clean Purse.”',
        isPoisoned: true,
      };
    }

    const rozBias =
      this.state.activeCoupRegime === 'REGIME_A_ROZ_PHARMA' || ep % 2 === 0;
    const broker: BrokerIdV7 =
      this.state.activeCoupRegime === 'REGIME_C_VERA_FORENSIC' && ep % 3 !== 0
        ? 'VERA_KARP'
        : this.state.activeCoupRegime === 'REGIME_B_BELLAMY_UHF' && ep % 3 === 1
          ? 'GRANT_BELLAMY'
          : rozBias
            ? 'ROZ_KORMAN'
            : ep % 3 === 0
              ? 'GRANT_BELLAMY'
              : 'VERA_KARP';

    // Poisoned fixes appear when Roz tests you against Heel plants or in Season 3+!
    const isPoisoned =
      broker === 'ROZ_KORMAN' &&
      (CAST_PROFILES_V7[rivalId].role === 'RIVAL_HEEL' || season >= 3) &&
      ep % 3 !== 1;

    // Season 2: Coast-to-Coast & Riviera Roadshow Air-Mail Dispatches
    if (season === 2) {
      if (broker === 'ROZ_KORMAN') {
        const s2Roz: Record<string, readonly string[]> = {
          STAGE_06_ATLANTIC_CITY_PIER: [
            'STEEL PIER VIP ENVELOPE: “Saltwater taffy’s on the agency, kid—POCKET this for +$180 Backstage Cash and a penciled clue (tap Check for Rigging first!), or torch it on camera for +$125 Clean Purse.”',
            'BOARDWALK SPONSOR NOTE: “Our detergent buyer hates a dull second half! Slip this inside for +$180 Backstage Cash & a marked option (verify the ink!), or burn it live for +$125 Clean Cash.”',
          ],
          STAGE_07_1969_MONTE_CARLO_CASINO: [
            'MONTE CARLO CROUPIER SLIP: “Slid straight from the high-limit shoe, darling! Take +$180 Backstage Cash & a marked choice (watch for Riviera decoys!), or burn it for +$125 Clean Purse.”',
            'RIVIERA HOUSE ENVELOPE: “Even the Prince likes a little edge after intermission—pocket +$180 Backstage Cash & a hint (check UV first), or send it up in flames for +$125 Clean Cash.”',
          ],
          STAGE_08_WORLDS_FAIR_GEODESIC: [
            'UNISPHERE PRESS COURIER: “The sponsor pavilion wants a louder Round 2! Pocket +$180 Backstage Cash & a greased cue (verify under UV!), or strike a match for +$125 Clean Purse.”',
            'FLUSHING MEADOWS DISPATCH: “Tomorrow’s world runs on leverage—take +$180 Backstage Cash & a next-turn mark (check for bait!), or burn it on air for +$125 Clean Cash.”',
          ],
          STAGE_09_CHANNEL_83_UHF_BARGE: [
            'OFFSHORE SPEEDBOAT DROP: “Waterproof wax seal straight from Sixth Avenue! Claim +$180 Backstage Cash & a next-turn mark (check UV for traps!), or burn it dry for +$125 Clean Purse.”',
            'PIRATE DECK COURIER: “Three miles out and my messenger still found your lectern—pocket +$180 Backstage Cash & a marked pick (check for rigging!), or burn live for +$125 Clean Cash.”',
          ],
        };
        const pool = s2Roz[stageId] ?? [
          'ROADSHOW SPONSOR WIRE: “Pocket +$180 Backstage Cash and a marked answer next turn (check UV first!), or burn it on air for +$125 Clean Purse.”',
        ];
        return { broker, note: pool[ep % pool.length], isPoisoned };
      }
      if (broker === 'GRANT_BELLAMY') {
        const s2Grant: readonly string[] = [
          'EARLY BIRD SATELLITE CUE: “Our trans-Atlantic color feed is peaking! Take my verified card for +$180 Backstage Cash & a clean hint, or burn it with style for +$125 Clean Purse.”',
          'BELLAMY’S TRAVELING CARD: “Fifty million living rooms want a barn-burner after the break—pocket +$180 Backstage Cash & a true mark, or toast it on air for +$125 Clean Cash.”',
          'ROADSHOW EMCEE SLIP: “Between you and the ribbon mic, this mark is gold—pocket +$180 Backstage Cash, or wave it at Standards and burn it for +$125 Clean Purse.”',
        ];
        return { broker, note: s2Grant[ep % s2Grant.length], isPoisoned: false };
      }
      const s2Vera: readonly string[] = [
        'STANDARDS ROADSHOW CABLE: “We intercepted a tour fixer’s card behind the curtain! Burn it on camera for +$125 certified Clean Purse, or pocket it for +$180 Backstage Cash & a verified mark.”',
        'VERA’S TOUR INTERCEPT: “Every clean burn puts another nail in Booth A’s coffin—+$125 Clean Purse if you torch it, or +$180 Backstage Cash & a clean answer mark if you fold.”',
        'FEDERAL AUDIT DISPATCH: “My stopwatch caught a courier slipping past security—burn this exhibit live for +$125 Clean Cash, or pocket +$180 Backstage Cash & next-turn intel.”',
      ];
      return { broker, note: s2Vera[ep % s2Vera.length], isPoisoned: false };
    }

    // Season 3: Regime Wars Halftime Couriers (Pharma Skybox / Pirate UHF / Federal Audit)
    if (season === 3) {
      if (broker === 'ROZ_KORMAN') {
        const s3Roz: readonly string[] = [
          'VANGUARD TONIC SKYBOX NOTE: “Sponsors adore a cooperative star—pocket +$180 Backstage Cash & a grease-penciled clue (run Check for Rigging; I test nerves!), or torch it for +$125 Clean Purse.”',
          'FLOOR 34 PINK-CARBON SLIP: “Keep those Solari drums humming! Take +$180 Backstage Cash & a next-turn mark (check UV for decoys!), or play saint and burn it for +$125 Clean Cash.”',
          'SPONSOR ACCOUNT MEMO: “Thirty-two affiliates are watching your collar—claim +$180 Backstage Cash & a marked choice (verify ink first!), or burn it live for +$125 Clean Purse.”',
          'MADISON AVE COURIER: “Do we make money together or do you make speeches? +$180 Backstage Cash & a hint if you pocket (check UV!), +$125 Clean Cash if you strike the match.”',
        ];
        return { broker, note: s3Roz[ep % s3Roz.length], isPoisoned };
      }
      if (broker === 'GRANT_BELLAMY') {
        const s3Bellamy: readonly string[] = [
          'CHANNEL 83 WHEELHOUSE SLIP: “Fifty kilowatts and zero suits in the booth! Pocket my true cue card for +$180 Backstage Cash & a clean mark, or burn it dramatically for +$125 Clean Purse.”',
          'BELLAMY’S CUFFLINK NOTE: “Give the tin-foil rabbit-ear crowd a showstopper—+$180 Backstage Cash & a verified hint in your pocket, or +$125 Clean Cash in a puff of smoke.”',
          'REBEL HOST CARD: “No censors left on Sixth Avenue! Pocket +$180 Backstage Cash & a genuine answer mark, or light it up on Camera One for +$125 Clean Purse.”',
        ];
        return { broker, note: s3Bellamy[ep % s3Bellamy.length], isPoisoned: false };
      }
      const s3Vera: readonly string[] = [
        'FEDERAL AUDIT EXHIBIT: “Subpoenaed straight off Spotlight #4’s catwalk! Burn it on camera for +$125 certified Clean Cash, or pocket +$180 Backstage Cash & a verified hint.”',
        'STANDARDS STOPWATCH DISPATCH: “Clean hands win Senate hearings—strike the match for +$125 Clean Purse, or pocket this verified exhibit for +$180 Backstage Cash & a true mark.”',
        'BOOTH B EVIDENCE SEAL: “My stenographer has the camera rolling—torch this live for +$125 certified Clean Cash, or quietly claim +$180 Backstage Cash & next-turn intel.”',
      ];
      return { broker, note: s3Vera[ep % s3Vera.length], isPoisoned: false };
    }

    // Season 4: Tournament of Champions Velvet Balcony & Penthouse Ascent
    if (season === 4) {
      if (broker === 'ROZ_KORMAN') {
        const s4Roz: readonly string[] = [
          'VELVET LOGE MESSENGER: “Side bets in the balcony just doubled! Pocket +$180 Backstage Cash & a marked answer (tap Check for Rigging—Penthouse bait bites!), or burn live for +$125 Clean Cash.”',
          '36TH-FLOOR RUNNER: “Half the former champs upstairs think you’ll fold—take +$180 Backstage Cash & a penciled hint (verify under UV!), or burn it before the balcony for +$125 Clean Purse.”',
          'CHAMPIONS’ BOX ENVELOPE: “High-rollers love bold hands—slip +$180 Backstage Cash & a cue into your trunk (check for traps!), or incinerate it on air for +$125 Clean Cash.”',
        ];
        return { broker, note: s4Roz[ep % s4Roz.length], isPoisoned };
      }
      if (broker === 'GRANT_BELLAMY') {
        const s4Grant: readonly string[] = [
          'EXECUTIVE ELEVATOR CARD: “You’re knocking on Stage Ten’s brass doors—pocket my verified host mark for +$180 Backstage Cash, or burn it clean before the Jury for +$125 Clean Purse.”',
          'PENTHOUSE RIBBON-MIC NOTE: “Only legends survive Season Four. Claim +$180 Backstage Cash & my honest hint, or send it up in sparks for +$125 certified Clean Cash.”',
          'BELLAMY’S GOLD-EDGE CARD: “Give the velvet balcony something to whisper about—+$180 Backstage Cash & a true mark if you pocket, +$125 Clean Purse if you burn.”',
        ];
        return { broker, note: s4Grant[ep % s4Grant.length], isPoisoned: false };
      }
      const s4Vera: readonly string[] = [
        'GRAND JURY BALCONY SEAL: “Washington is kinescoping tonight’s Championship Hour! Burn this exhibit on camera for +$125 Clean Cash, or pocket +$180 Backstage Cash & a verified mark.”',
        'VERA’S FINAL DOSSIER: “Every clean burn strengthens our subpoena before Episode 90—+$125 certified Clean Purse in flames, or +$180 Backstage Cash & a clean cue in your pocket.”',
        'STANDARDS PENNANT NOTE: “Show the VIP Balcony a spotless challenger—torch this live for +$125 Clean Purse, or accept +$180 Backstage Cash & verified next-turn intel.”',
      ];
      return { broker, note: s4Vera[ep % s4Vera.length], isPoisoned: false };
    }

    // Season 1: Studio 6A Classic Halftime Envelopes
    const s1Roz: readonly string[] = [
      'ROZ’S SPONSOR TIP: “Our soap buyer adores a lively second half, darling. Pocket +$180 Backstage Cash & a grease-penciled clue (tap Check for Rigging—I do enjoy testing nerves!), or burn it live for +$125 Clean Purse.”',
      'BOOTH A CANARY SLIP: “Between commercial jingles, a smart challenger takes help—+$180 Backstage Cash & a marked answer (check UV for decoys!), or torch it on camera for +$125 Clean Cash.”',
      'MAKEUP-MIRROR ENVELOPE: “Tucked under your cue sheet with red wax—pocket +$180 Backstage Cash & a next-turn mark (verify the ink first!), or play choirboy and burn it for +$125 Clean Purse.”',
    ];
    const s1Grant: readonly string[] = [
      'BELLAMY’S HOST CARD: “Camera One wants fireworks after the station break! Pocket +$180 Backstage Cash & my verified hint, or burn it with theatrical flair for +$125 Clean Purse.”',
      'EIGHT O’CLOCK CUE SLIP: “Ratings jump two points when a walk-on heats up—claim +$180 Backstage Cash & a true answer mark, or wave it off in smoke for +$125 Clean Cash.”',
      'VELVET-VOICE NOTE: “Consider this a warm Studio 6A welcome: +$180 Backstage Cash & an honest mark in your pocket, or +$125 certified Clean Purse if you torch it live.”',
    ];
    const s1Vera: readonly string[] = [
      'VERA’S STANDARDS INTERCEPT: “My crew lifted this cue card off Row C during the commercial! Burn it on air for +$125 certified Clean Cash, or pocket +$180 Backstage Cash & a verified mark.”',
      'BOOTH B STOPWATCH NOTE: “Standards & Practices rewards clean hands—light this up for +$125 Clean Purse, or pocket the verified card for +$180 Backstage Cash & a next-turn clue.”',
      'CLEAN-AIR INTERCEPT: “Confiscated from an over-eager pageboy—strike a match on Camera One for +$125 Clean Cash, or slip +$180 Backstage Cash & a true mark into your trunk.”',
    ];
    const note =
      broker === 'ROZ_KORMAN'
        ? s1Roz[ep % s1Roz.length]
        : broker === 'GRANT_BELLAMY'
          ? s1Grant[ep % s1Grant.length]
          : s1Vera[ep % s1Vera.length];

    return { broker, note, isPoisoned };
  }
}

// ----------------------------------------------------------------------------
// 5. 90-Episode "NEXT TIME ON WORLD'S SMARTEST..." Broadcast Cliffhanger Teasers
//    Gripping 1966 TV Guide Thriller Hooks (130–210 chars across all 90 eps!)
// ----------------------------------------------------------------------------

export interface NextEpisodeCliffhangerTeaserV7 {
  readonly episodeCode: string;
  readonly title: string;
  readonly rivalId: RivalIdV7;
  readonly stageCallsign: string;
  readonly hookCopy: string;
  readonly stakesTag: string;
}

const BESPOKE_EPISODE_CLIFFHANGERS_V7: Readonly<
  Record<number, { readonly stakesTag: string; readonly hookCopy: string }>
> = {
  1: {
    stakesTag: 'PREMIERE · STUDIO 6A LIVE',
    hookCopy:
      'Fifty million sets just tuned to Studio 6A in Living Color! Step up to Podium One against Bellevue night-shift nurse Carmen Delgado and prove a last-minute stand-in belongs under prime-time lights…',
  },
  2: {
    stakesTag: 'NEW RIVAL · BOOTH A WIRE',
    hookCopy:
      'Sparks jumped beneath Podium Two during tonight’s sign-off. Tomorrow night, Con Ed lineman Toby Okafor steps onto the Jubilee board—and he knows which wire climbs straight into Control Booth A…',
  },
  3: {
    stakesTag: 'NEW RIVAL · STOLEN CUE CARD',
    hookCopy:
      'Someone slipped a red-penciled cue card out of Control Booth A right after the credits rolled. Next broadcast, Fifth Avenue librarian Inez Callahan brings forty years of reference steel to Studio 6A…',
  },
  4: {
    stakesTag: 'NEW RIVAL · MYSTERY CURTAINS',
    hookCopy:
      'Stagehands wheeled three crimson Mystery Curtains onto the Jubilee deck after midnight. Tomorrow at eight, Topeka bake-off queen Dotty Vance flashes her blue ribbon and gambles on every hidden prize…',
  },
  5: {
    stakesTag: 'NEW RIVAL · $500 VAULT RAID',
    hookCopy:
      'Control Booth A just bolted a heavier brass padlock onto the $500 Gold Vault. Next in Studio 6A, Milwaukee 300-game bowler Chet Kowalski has his rosin bag ready—and his sights locked on the top row…',
  },
  6: {
    stakesTag: '2:30 AM · BURBANK PILOT VAULT',
    hookCopy:
      'After the studio crowd clears out, Vera Karp unlocks a sealed 2:30 AM tape behind Burbank’s Pop-Art wall. Outsmart Pan Am hostess Peggy Sue Connors under Mondrian shutters to expose a buried pilot…',
  },
  7: {
    stakesTag: 'REMATCH · BELLEVUE COMEBACK',
    hookCopy:
      'Bellevue’s midnight shift just wired a bouquet to Dressing Room B. Tomorrow night, Carmen Delgado returns to Studio 6A with a sharper blue pen and a score to settle across ten unrigged turns…',
  },
  8: {
    stakesTag: 'SPONSOR WATCH · JUBILEE DECK',
    hookCopy:
      'Roz Korman spent all commercial break whispering into her headset from Floor 34. Next at Television City, Dotty Vance returns while nervous sponsors slide a fresh canary envelope onto your lectern…',
  },
  9: {
    stakesTag: 'SWEEPS WEEK · HIGH VOLTAGE',
    hookCopy:
      'Overnight Nielsen needles just spiked six points in Chicago. Tomorrow night in Studio 6A, Chet Kowalski storms back for the top-row plaques while Control Booth A scrambles to cool your streak…',
  },
  10: {
    stakesTag: 'PODIUM TWO · CIRCUIT CHECK',
    hookCopy:
      'Toby Okafor caught a floor technician taping fresh copper leads beneath the Jubilee stage at dawn. Next broadcast, the Con Ed lineman tests your nerve under blinding three-hundred-footcandle quartz…',
  },
  11: {
    stakesTag: 'HALFTIME · CANARY CONSPIRACY',
    hookCopy:
      'A pageboy dropped a wax-sealed sponsor memo right outside Inez Callahan’s dressing room. Tomorrow at eight, Fifth Avenue’s sharpest librarian dares you to beat her clean without touching dirty cash…',
  },
  12: {
    stakesTag: '2:30 AM · TEAK ISOLATION BOOTH',
    hookCopy:
      'Vera Karp just sealed the soundproof 1964 Teak & Glass Isolation Booth for an off-air showdown. No audience applause, no sponsor mics—just you, Carmen Delgado, and ten silent turns behind thick glass…',
  },
  13: {
    stakesTag: 'JET-AGE SWEEPS · STUDIO 6A',
    hookCopy:
      'Pan Am Flight 114 landed early at JFK carrying a gleaming silver suitcase straight to 30 Rock. Next broadcast, Peggy Sue Connors spins the Studio 6A Showcase Wheel for a coast-to-coast prime-time splash…',
  },
  14: {
    stakesTag: 'PRIME TIME · REFERENCE DUEL',
    hookCopy:
      'Inez Callahan spotted a mismatched wax seal on the network’s question vault before rehearsal. Tomorrow night at Television City, beat the librarian’s quiet composure across every high-dollar row…',
  },
  15: {
    stakesTag: 'STUDIO 6A · TOP-ROW BRAWL',
    hookCopy:
      'Chet Kowalski bet half of Milwaukee he can clear the $500 Gold Vault before the first commercial. Step back into Studio 6A tomorrow night before his 300-game swagger runs away with the scoreboard…',
  },
  16: {
    stakesTag: 'DOUBLE DOLLARS · JUBILEE LIVE',
    hookCopy:
      'Master Control just doubled the ratings bonus for our next Television City broadcast. Peggy Sue Connors is eyeing every Mystery Curtain on the wall—don’t blink when the Act-II stakes explode…',
  },
  17: {
    stakesTag: 'STANDARDS AUDIT · STUDIO 6A',
    hookCopy:
      'Vera Karp arrived at Studio 6A carrying two brass stopwatches and an unsigned federal warrant. Tomorrow night, Dotty Vance brings Topeka charm to the podium while Booth A sweats under fresh scrutiny…',
  },
  18: {
    stakesTag: '2:30 AM · APOLLO COLOR VAULT',
    hookCopy:
      'Deep inside 1967 Apollo Master Color Control, Vera Karp rolls a locked midnight test tape. Cape Canaveral engineer Buzz Halvorsen steps out of the shadows with a holstered slide rule and zero drift…',
  },
  19: {
    stakesTag: 'ALLIANCE TEST · STUDIO 6A',
    hookCopy:
      'Word leaked backstage that the network plans to ship its sharpest challengers overseas next month. Tomorrow in Studio 6A, Toby Okafor wants one last honest match before the roadshow trunks lock…',
  },
  20: {
    stakesTag: 'SWINGING LONDON · ROW C ALERT',
    hookCopy:
      'A charter flight from Heathrow just dropped Carnaby Street trendsetter Gigi St. Clair straight onto Television City. Watch Row C when her mirrored compact glints—she didn’t cross the Atlantic to lose…',
  },
  21: {
    stakesTag: 'SWEEPS FINALE · CROSSWORD TRAP',
    hookCopy:
      'Hartford Sunday crossword terror Walter Pringle arrived at 30 Rock armed with a ruby fountain pen and a defensive grid map. Beat his ruthless lane blocks before the Season 1 finale doors swing open…',
  },
  22: {
    stakesTag: 'SEASON 1 FINALE · TOUR TICKET',
    hookCopy:
      'Steamer trunks are stacked outside Studio 6A for the International Sweeps Tour! Outbank Inez Callahan across one final Television City showdown to punch your first-class ticket to Atlantic City…',
  },
  23: {
    stakesTag: 'SEASON 2 PREMIERE · STEEL PIER',
    hookCopy:
      'Salt air, chasing Ferris-wheel bulbs, and velvet curtains over the Atlantic waves! Season 2 kicks off on Atlantic City’s Steel Pier—where Cape Canaveral’s Buzz Halvorsen calculates every spin…',
  },
  24: {
    stakesTag: 'EARLY BIRD SATELLITE · MONTE CARLO',
    hookCopy:
      'Live via Early Bird Satellite from the Monte Carlo casino salon! Beneath crystal chandeliers and spinning roulette wheels, Swinging London’s Gigi St. Clair chases +$500 luxury pairs while Row C signals…',
  },
  25: {
    stakesTag: 'WORLD’S FAIR · UNISPHERE BRIDGE',
    hookCopy:
      'High noon beneath the gleaming steel Unisphere in Flushing Meadows! Village Vanguard jazz critic Miles Ellington steps onto the hex deck—connect a Coast-to-Coast bridge before he blocks every lane…',
  },
  26: {
    stakesTag: '3 MILES OFFSHORE · CHANNEL 83',
    hookCopy:
      'Fifty kilowatts blasting past the Coast Guard line aboard rogue UHF ship Channel 83! Nashville vocalist Betty Lou Harper saves her loudest chorus for the Final Wager while Eye Guess shutters flash…',
  },
  28: {
    stakesTag: 'GOLDEN EXIT I · CARMEN’S CLINIC',
    hookCopy:
      'Everything Carmen Delgado fought for rides on tonight’s Steel Pier broadcast! Win ten clean turns without dirty sponsor cash and her Queens ER clinic tears up its mortgage before sunrise…',
  },
  34: {
    stakesTag: 'GOLDEN EXIT II · TOBY’S FREEDOM',
    hookCopy:
      'Toby Okafor unhooked every rigged solenoid beneath the Queens Unisphere Pavilion. Deliver ten honest turns beneath the orbiting rings tomorrow night and the network is forced to burn his exclusive bond…',
  },
  40: {
    stakesTag: 'GOLDEN EXIT III · OFFSHORE AMNESTY',
    hookCopy:
      'Three miles past Sixth Avenue’s lawyers aboard Pirate Channel 83, Inez Callahan stakes her full pension on one clean broadcast. Memorize the flashing radar Trilons and bring her home free…',
  },
  44: {
    stakesTag: 'SWEEPS SHOWCASE · MONTE CARLO',
    hookCopy:
      'Whispers of a mutiny in Control Booth A just reached the Riviera chandeliers. Outduel fiery Montreal critic Sylvie Beaumont in Monte Carlo before tomorrow night’s explosive Hour-11 Coup explodes…',
  },
  45: {
    stakesTag: 'HOUR-11 COUP · BOOTH A FALLS!',
    hookCopy:
      'Eleven o’clock in Monte Carlo—and Control Booth A is tearing itself in three! Topple nine-week Savile Row champion Alastair Kerr, then choose who seizes the network before Season 3 ignites…',
  },
  69: {
    stakesTag: 'SEASON 4 PREMIERE · VIP BALCONY',
    hookCopy:
      'The velvet balcony above Television City is packed with every Champion you faced all year! Oxford don Arthur Pendleton opens the Tournament of Champions while allies cheer and rivals place side bets…',
  },
  74: {
    stakesTag: 'FLOOR 36 PREVIEW · PENTHOUSE',
    hookCopy:
      'For the very first time, the brass express elevator climbs straight to the 36th-Floor Penthouse! Step beneath the Sovereign Ziggurat lights and prove to Grant Bellamy you belong above Sixth Avenue…',
  },
  85: {
    stakesTag: 'PENTHOUSE ROUND I · VELVET ROPE',
    hookCopy:
      'Six broadcasts left to the $250,000 crown! Thirty-six floors above Manhattan, Oxford polymath Arthur Pendleton guards the Penthouse threshold with pure, unrigged scholarship and zero mercy…',
  },
  86: {
    stakesTag: 'PENTHOUSE ROUND II · ENDGAME',
    hookCopy:
      'The Penthouse doors seal behind you as jet-set chess prodigy Norma Jean Baker takes Podium Two. She plotted your Turn-9 fork before soundcheck—watch Spotlight #4 and break her positional lock…',
  },
  87: {
    stakesTag: 'PENTHOUSE ROUND III · HOSTILE BID',
    hookCopy:
      'Broad Street tape-reader Sterling Vance offered to buy the whole broadcast before airtime. Tomorrow night on Floor 36, raid the upper Ziggurat before he executes a hostile takeover of your purse…',
  },
  88: {
    stakesTag: 'PENTHOUSE ROUND IV · LAB PRECISION',
    hookCopy:
      'Three nights from the Finale! Geneva molecular biochemist Seo-Yun Kang clicks her chrome pen against Podium Two with ice-cold variance math—catch her LIVE TELL before she sweeps the top row…',
  },
  89: {
    stakesTag: 'PENTHOUSE SEMIFINAL · VIENNA TEMPO',
    hookCopy:
      'One victory away from the $250,000 Grand Finale! Fiery Vienna opera maestro Clara von Berg raises her baton under the Penthouse chandeliers—shatter her tempo and claim the final challenger slot…',
  },
  90: {
    stakesTag: 'GRAND FINALE · $250,000 CROWN!',
    hookCopy:
      'This is it—fifty million homes tuned to Floor 36 for $250,000 and the soul of the network! Undefeated eleven-week Sphinx Victor Lazar awaits at Podium Two; every choice you made decides the ending…',
  },
};

/**
 * Generates a gripping 1966 TV Guide "NEXT TIME ON WORLD'S SMARTEST..." cliffhanger
 * teaser (`130–210` chars) for any upcoming Campaign episode (`S01E02`..`S04E90`).
 */
export function getNextEpisodeCliffhangerTeaserV7(
  nextBp: EpisodeBlueprintV7,
  save: CampaignSaveStateV7,
): NextEpisodeCliffhangerTeaserV7 {
  const ep = Math.max(1, Math.min(90, Math.floor(nextBp.episodeNumber)));
  const stageCallsign = FRIENDLY_STAGE_CALLSIGNS_V7[nextBp.stageId] ?? '30 ROCK STUDIO 6A';
  const rival = CAST_PROFILES_V7[nextBp.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;

  const hasComebackPot = save.grudgeBountyPool > 0;
  if (nextBp.isVaultDrop && hasComebackPot && ep !== 6 && ep !== 12 && ep !== 18) {
    const potText = `$${save.grudgeBountyPool.toLocaleString('en-US')}`;
    return {
      episodeCode: nextBp.code,
      title: nextBp.title,
      rivalId: nextBp.rivalId,
      stageCallsign,
      stakesTag: '2:30 AM · COMEBACK POT VAULT',
      hookCopy: `Vera Karp unlocked ${stageCallsign} after hours! Beat ${rival.name} across ten clean off-air turns to pull your ${potText} Comeback Pot back into Clean Cash…`,
    };
  }

  const bespoke = BESPOKE_EPISODE_CLIFFHANGERS_V7[ep];
  if (bespoke) {
    return {
      episodeCode: nextBp.code,
      title: nextBp.title,
      rivalId: nextBp.rivalId,
      stageCallsign,
      stakesTag: bespoke.stakesTag,
      hookCopy: bespoke.hookCopy,
    };
  }

  // Season 3 Regime-Specific Thriller Arcs (E46..E68)
  if (nextBp.season === 3) {
    const regime = save.activeCoupRegime;
    if (regime === 'REGIME_A_ROZ_PHARMA') {
      const rozHooks: readonly string[] = [
        `Roz Korman’s sponsors bought every billboard outside ${stageCallsign}. Next at eight, ${rival.name} steps up under pink-carbon odds while a wax-sealed envelope waits…`,
        `Vanguard Miracle Tonic demanded a ratings spike at ${stageCallsign}. Next up, ${rival.name} takes Podium Two—check every halftime tip under blacklight before Booth A strikes…`,
        `Word from Floor 34 says the skybox is doubling side bets at ${stageCallsign}. Outplay ${rival.name} across three acts and leave Roz Korman chewing her pencil in half…`,
      ];
      return {
        episodeCode: nextBp.code,
        title: nextBp.title,
        rivalId: nextBp.rivalId,
        stageCallsign,
        stakesTag: 'REGIME WAR · SPONSOR SKYBOX',
        hookCopy: rozHooks[ep % rozHooks.length],
      };
    }
    if (regime === 'REGIME_B_BELLAMY_UHF') {
      const uhfHooks: readonly string[] = [
        `Network censors cut the coax, yet Bellamy’s rogue feed booms into ${stageCallsign}! Next broadcast, ${rival.name} challenges your streak under glowing Channel 83 Halos…`,
        `Fifty kilowatts of pirate color rattled every rooftop around ${stageCallsign}. Tomorrow night, ${rival.name} enters the follow-spot—hit the Halo squares before patrol boats close in…`,
        `Bellamy tossed the sponsor cards overboard and lit up ${stageCallsign} on pirate UHF! Outbank ${rival.name} in the Final Wager to keep the rebel broadcast on top…`,
      ];
      return {
        episodeCode: nextBp.code,
        title: nextBp.title,
        rivalId: nextBp.rivalId,
        stageCallsign,
        stakesTag: 'REGIME WAR · PIRATE CHANNEL 83',
        hookCopy: uhfHooks[ep % uhfHooks.length],
      };
    }
    const veraHooks: readonly string[] = [
      `Federal clerks tagged every floor cable inside ${stageCallsign} as Exhibit B! Tomorrow night, ${rival.name} faces Vera Karp’s stopwatch—bust any LIVE TELL on sight…`,
      `Standards & Practices padlocked the cue rack at ${stageCallsign} before the subpoena hearing. Beat ${rival.name} clean and watch Control Booth A’s alibi crack on air…`,
      `Vera Karp’s grand-jury tape rolls at ${stageCallsign}. Next broadcast, ${rival.name} faces ten sworn turns—torch any dirty envelope at halftime to tighten the federal net…`,
    ];
    return {
      episodeCode: nextBp.code,
      title: nextBp.title,
      rivalId: nextBp.rivalId,
      stageCallsign,
      stakesTag: 'REGIME WAR · FEDERAL AUDIT',
      hookCopy: veraHooks[ep % veraHooks.length],
    };
  }

  // Season 4 Tournament of Champions VIP Balcony Arcs (E70..E84)
  if (nextBp.season === 4) {
    const s4Hooks: readonly string[] = [
      `The velvet balcony above ${stageCallsign} buzzes with Champions trading side bets on your run. Tomorrow night, ${rival.name} guards the road to Floor 36—hold steady for the Final Wager…`,
      `Grant Bellamy polished the Penthouse elevator keys backstage at ${stageCallsign}. Next in the Tournament of Champions, ${rival.name} targets the upper plaques while the VIP Jury votes…`,
      `Every ally and rival from three seasons fills the balcony at ${stageCallsign}. Outduel ${rival.name} across three escalating acts to stay alive for the $250,000 Penthouse Finale…`,
    ];
    return {
      episodeCode: nextBp.code,
      title: nextBp.title,
      rivalId: nextBp.rivalId,
      stageCallsign,
      stakesTag: 'SEASON 4 · VIP BALCONY JURY',
      hookCopy: s4Hooks[ep % s4Hooks.length],
    };
  }

  // Season 2 International & Coast-to-Coast Roadshow Arcs (E27..E43)
  const s2StreakHooks: readonly string[] = [
    `Your ${save.returningChampStreak}-show streak has Booth A sweating at ${stageCallsign}! Tomorrow night, ${rival.name} steps up to snap your run—watch every twist and seal the Final Wager…`,
    `Fifty million viewers want to know if your ${save.returningChampStreak}-show heater survives ${stageCallsign}! Next broadcast, ${rival.name} aims straight for the top-row plaques and Double Dollars…`,
    `Control Booth A is betting your ${save.returningChampStreak}-game run ends at ${stageCallsign}. Tomorrow at eight, outfox ${rival.name} across three live acts and keep the spotlight locked on Podium One…`,
  ];
  const s2TourHooks: readonly string[] = [
    `Our touring color trucks rolled into ${stageCallsign} ahead of tomorrow’s live sweeps broadcast! ${rival.name} awaits at Podium Two with fresh board twists and high-stakes prime-time drama…`,
    `Live cables stretch across ${stageCallsign} as fifty million families tune in for the Sweeps Tour! Beat ${rival.name} across ten sharp turns before the Final Wager decides the purse…`,
    `The remote marquee just blazed to life at ${stageCallsign}! Tomorrow night at eight, ${rival.name} steps behind Podium Two—spot every board twist and bank the sweeps check in Living Color…`,
  ];
  const streakNote =
    (save.returningChampStreak ?? 0) >= 2
      ? s2StreakHooks[ep % s2StreakHooks.length]
      : s2TourHooks[ep % s2TourHooks.length];
  return {
    episodeCode: nextBp.code,
    title: nextBp.title,
    rivalId: nextBp.rivalId,
    stageCallsign,
    stakesTag: nextBp.isRoadshow ? 'SWEEPS TOUR · LIVE REMOTE' : 'NEXT BROADCAST · LIVE',
    hookCopy: streakNote,
  };
}
