// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.5 — 1966 IN LIVING COLOR)
// `src/v7/campaign/FiftyMillionCampaignV7.ts`
// 90-Episode 1966 Network TV Broadcast Thriller, Zero-Friction Episode 1
// Default Waiver (`ensureDefaultWaiverIfMissing`), TV Guide Wit & Plain-English
// Scaffolding, Honest-Loss 2:30 AM Vault Drops, Golden Exits, Episode 45
// Control-Booth Coup, VIP Balcony Jury & 5 Stage-10 Penthouse Endings.
// ============================================================================

import {
  type BoardIdV7,
  type BoardTwistIdV7,
  type BroadcastSettingsV7,
  type BrokerIdV7,
  type CampaignSaveStateV7,
  type CastIdV7,
  type CategoryIdV7,
  type ContestantWaiverV7,
  type CoupRegimeIdV7,
  type DayJobIdV7,
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
  MAX_TRUNK_SLOTS_V7,
  RELIC_BY_ID_V7,
  RIVAL_IDS_V7,
  TROPHY_CATALOG_V7,
  validateTrunkLoadoutV7,
} from './CastAndRelicsCatalogV7';

export { TROPHY_CATALOG_V7 };

export const CAMPAIGN_SAVE_STORAGE_KEY_V7 = 'ws_v7_campaign_save_1';
export const LIEN_SEGMENT_COST_CASH_V7 = 18500; // 12 segments x $18,500 = $222,000 full network buyout
export const MAX_ENTITY_COOLDOWN_KEYS_V7 = 300; // ~25-match cross-toy entity cooldown ring

const FRIENDLY_CATEGORY_NAMES_V7: Record<CategoryIdV7, string> = {
  MEDICINE: 'Medicine',
  CHEMISTRY: 'Chemistry',
  PHYSICS: 'Science & Space',
  GADGETS: 'Gadgets',
  ENGINES: 'Engines',
  LITERATURE: 'Books & Authors',
  LEXICON: 'Words & Wit',
  'FINE ARTS': 'Art & Stage',
  SCREEN: 'Silver Screen',
  JUKEBOX: 'Hit Parade',
  FINANCE: 'Money & Markets',
  PRICING: 'Price Tag',
  ODDS: 'Luck & Numbers',
  ATLAS: 'World Atlas',
  SPORTS: 'Sports',
  DYNASTIES: 'Empires & Kings',
  HEADLINES: 'History Headlines',
  FOLKLORE: 'Myths & Legends',
  FALLACIES: 'Brain Twisters',
  CUISINE: 'Food & Flavor',
};

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

function formatFriendlyWeakSpots(categories: readonly CategoryIdV7[]): string {
  return categories.map((c) => FRIENDLY_CATEGORY_NAMES_V7[c] ?? c).join(', ');
}

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
      'Behind the double glass of Control Booth A, Roz Korman’s gold lighter froze mid-click as Master Control refused to cut the feed. By 6:00 AM, Federal Marshals had padlocked the thirty-fourth floor and voided every predatory contestant bond on Sixth Avenue—clearing Carmen’s Queens clinic, Toby’s lineman pension, and Inez’s retirement on a single morning docket.',
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
  'Live in Living Color! (Stand-In at Desk Two)', // E01
  'Don’t Touch That Dial, Folks', // E02
  'Matinee Smile, Cue-Card Eyes', // E03
  'Quiet Please: The Librarian Is In', // E04
  'Nine Weeks in a Velvet Dinner Jacket', // E05
  '2:30 AM: Burbank Pop-Art Pilot Tape', // E06 (Vault 1: 1966 Burbank Pop-Art Carnival)
  'The Actuary Who Priced Every Square', // E07
  'A Word From Our Nervous Sponsor', // E08
  'Sparks Under Contestant Podium Two', // E09
  'Talcum Powder & Flop Sweat at Eight', // E10
  'The Canary-Yellow Commercial Break', // E11
  'Inside the $64,000 Teak Glass Booth', // E12 (Vault 2: 1964 Isolation Booth)
  'Never Bet Against Queens Night Shift', // E13
  'Spotlight #4 Just Winked Twice', // E14
  'Who’s Sitting in Row C, Seat 14?', // E15
  'Double Dollars After the Station Break', // E16
  'Vera Karp Brought Her Stopwatch', // E17
  '1967 Apollo Master Color Control', // E18 (Vault 3: 1967 Apollo Color Control Pavilion)
  'Honor Among Green-Room Strangers', // E19
  'Subpoena Served in Makeup Chair Three', // E20
  'Sweeps-Week Fever on Sixth Avenue', // E21
  'Pack Your Trunk for the Coast-to-Coast Tour', // E22
];

const SEASON_2_TITLES: readonly string[] = [
  'Saltwater Taffy & Five-Hundred-Dollar Squares', // E23 -> STAGE_06 Steel Pier
  'Live via Early Bird Satellite: Monte Carlo!', // E24 -> STAGE_07 Monte Carlo
  'High Noon Under the Queens Unisphere', // E25 -> STAGE_08 World's Fair
  'Three Miles Off Jersey: Pirate Channel 83!', // E26 -> STAGE_09 Channel 83 Ship
  'Tilt Bells on Atlantic City’s Steel Pier', // E27 -> STAGE_06 Steel Pier
  'Boardwalk Clear-Out (Carmen’s Freedom Special)', // E28 -> STAGE_06 Golden Exit 1
  'Atomic Starbursts Over Flushing Meadows', // E29 -> STAGE_08 World's Fair
  'Fifty Kilowatts & Rolling Atlantic Swells', // E30 -> STAGE_09 Channel 83 Ship
  'Wurlitzer Pipes & Boardwalk Jackpots', // E31 -> STAGE_06 Steel Pier
  'Tuxedos, Francs & Dealing Shoes', // E32 -> STAGE_07 Monte Carlo
  'Long Shadows at the World’s Fair Pavilion', // E33 -> STAGE_08 World's Fair
  'Unisphere Clean Sweep (Toby’s Freedom Special)', // E34 -> STAGE_08 Golden Exit 2
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
    'Seo-Yun’s Monte Carlo House Margin', // E59 -> STAGE_07 Monte Carlo
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
    'Seo-Yun’s Slide Rule in Soundproof Teak', // E58 -> STAGE_04 Teak Booth
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
  };
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
    rivalTrust: {
      CARMEN_DELGADO: 0,
      TOBY_OKAFOR: 0,
      INEZ_CALLAHAN: 0,
      ALASTAIR_KERR: 0,
      SEO_YUN_KANG: 0,
      REX_CALLOWAY: 0,
    },
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
      const parsed = JSON.parse(raw) as Partial<CampaignSaveStateV7>;
      if (!parsed || parsed.version !== 'WS_V7_GOLD_1') {
        return fallback;
      }
      const ep = Math.max(1, Math.min(90, Math.floor(parsed.currentEpisode ?? 1)));
      const rawTrunk = Array.isArray(parsed.equippedRelics) ? parsed.equippedRelics : [];
      const sanitizedTrunk = rawTrunk.filter((item) => Boolean(RELIC_BY_ID_V7[item.relicId]));
      const trunkCheck = validateTrunkLoadoutV7(sanitizedTrunk);

      const merged: CampaignSaveStateV7 = {
        version: 'WS_V7_GOLD_1',
        waiver: parsed.waiver ?? null,
        currentEpisode: ep,
        season: episodeToSeasonV7(ep),
        cleanPurseCash: Math.max(0, Math.floor(parsed.cleanPurseCash ?? 0)),
        contrabandTrunkCash: Math.max(0, Math.floor(parsed.contrabandTrunkCash ?? 0)),
        grudgeBountyPool: Math.max(0, Math.floor(parsed.grudgeBountyPool ?? 0)),
        lienSegmentsPaid: Math.max(0, Math.min(12, Math.floor(parsed.lienSegmentsPaid ?? 0))),
        activeCoupRegime: parsed.activeCoupRegime ?? 'NONE',
        equippedRelics: trunkCheck.ok ? sanitizedTrunk : sanitizedTrunk.slice(0, 2),
        unlockedTrophyIds: Array.isArray(parsed.unlockedTrophyIds)
          ? [...new Set(parsed.unlockedTrophyIds)]
          : [],
        rivalTrust: {
          ...fallback.rivalTrust,
          ...(parsed.rivalTrust ?? {}),
        },
        brokerFavor: {
          ...fallback.brokerFavor,
          ...(parsed.brokerFavor ?? {}),
        },
        boothArrestsCount: Math.max(0, Math.floor(parsed.boothArrestsCount ?? 0)),
        canaryAcceptedCount: Math.max(0, Math.floor(parsed.canaryAcceptedCount ?? 0)),
        canaryBurnedCount: Math.max(0, Math.floor(parsed.canaryBurnedCount ?? 0)),
        episodesWon: Math.max(0, Math.floor(parsed.episodesWon ?? 0)),
        episodesPlayed: Math.max(0, Math.floor(parsed.episodesPlayed ?? 0)),
        unlockedEndings: Array.isArray(parsed.unlockedEndings)
          ? [...new Set(parsed.unlockedEndings)]
          : [],
        recentEntityKeys: Array.isArray(parsed.recentEntityKeys)
          ? parsed.recentEntityKeys.slice(-MAX_ENTITY_COOLDOWN_KEYS_V7)
          : [],
        settings: {
          ...fallback.settings,
          ...(parsed.settings ?? {}),
        },
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
    this.state = createInitialCampaignSaveStateV7();
    if (keepSettingsAndTrophies) {
      this.state.settings = prevSettings;
      this.state.unlockedTrophyIds = prevTrophies;
      this.state.unlockedEndings = prevEndings;
    }
    this.saveToStorage();
    return this.state;
  }

  public stampReleaseWaiver(
    dayJob: DayJobIdV7,
    stageVice: StageViceIdV7,
    lienGoal: LienGoalIdV7,
  ): ContestantWaiverV7 {
    const waiver: ContestantWaiverV7 = {
      dayJob,
      stageVice,
      lienGoal,
      stampedAtIso: new Date().toISOString(),
    };
    this.state.waiver = waiver;
    // Initial broker lean from Waiver Lien Goal
    if (lienGoal === 'CLEAN_PURSE_250K') {
      this.state.brokerFavor.GRANT_BELLAMY += 1;
    } else if (lienGoal === 'DIRTY_HOUSE_MARKER') {
      this.state.brokerFavor.ROZ_KORMAN += 1;
    } else if (lienGoal === 'STAGE_10_BIBLE') {
      this.state.brokerFavor.VERA_KARP += 1;
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
      this.state.rivalTrust[rivalId] = Math.max(-3, this.state.rivalTrust[rivalId] - 1);
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

    // 3. Rival Choreography (Ep 1 = Carmen 52%, Ep 2 = Toby 55%, Ep 3 = Rex 58%!)
    let rivalId: RivalIdV7;
    if (ep === 1) rivalId = 'CARMEN_DELGADO';
    else if (ep === 2) rivalId = 'TOBY_OKAFOR';
    else if (ep === 3) rivalId = 'REX_CALLOWAY';
    else if (ep === 4) rivalId = 'INEZ_CALLAHAN';
    else if (ep === 5) rivalId = 'ALASTAIR_KERR';
    else if (ep === 7) rivalId = 'SEO_YUN_KANG';
    else if (ep === 28) rivalId = 'CARMEN_DELGADO';
    else if (ep === 34) rivalId = 'TOBY_OKAFOR';
    else if (ep === 40) rivalId = 'INEZ_CALLAHAN';
    else if (ep === 45) rivalId = 'ALASTAIR_KERR';
    else if (ep === 89) rivalId = 'SEO_YUN_KANG';
    else if (ep === 90) rivalId = 'ALASTAIR_KERR';
    else {
      rivalId = RIVAL_IDS_V7[(ep * 5 + season) % RIVAL_IDS_V7.length];
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

    const boonMap: Record<RivalIdV7, { title: string; summary: string; chips: number }> = {
      CARMEN_DELGADO: {
        title: 'Carmen’s ER Steady Hand',
        summary: `Balcony salute adds +$${boonTrust >= 1 ? 55 : 35} bonus dollars on every right answer.`,
        chips: boonTrust >= 1 ? 55 : 35,
      },
      TOBY_OKAFOR: {
        title: 'Toby’s Clean-Power Boost',
        summary: `Balcony nod adds +$${boonTrust >= 1 ? 60 : 35} bonus dollars on every right answer.`,
        chips: boonTrust >= 1 ? 60 : 35,
      },
      INEZ_CALLAHAN: {
        title: 'Inez’s Librarian Bookmark',
        summary: `Balcony tip slips +$${boonTrust >= 1 ? 55 : 35} bonus dollars onto every clean lock-in.`,
        chips: boonTrust >= 1 ? 55 : 35,
      },
      ALASTAIR_KERR: {
        title: 'Alastair’s Reluctant Champagne Toast',
        summary: 'Balcony applause adds +$40 prestige dollars on every right answer.',
        chips: 40,
      },
      SEO_YUN_KANG: {
        title: 'Seo-Yun’s Sharp Odds Line',
        summary: 'Balcony odds sheet adds +$45 bonus dollars on every right answer.',
        chips: 45,
      },
      REX_CALLOWAY: {
        title: 'Rex’s Matinee Wink',
        summary: 'Balcony fan-club cheer adds +$40 bonus dollars on every right answer.',
        chips: 40,
      },
    };

    const baneMap: Record<
      RivalIdV7,
      { title: string; summary: string; multPen: number; rivalEv: number }
    > = {
      ALASTAIR_KERR: {
        title: 'Alastair’s Balcony Heckle',
        summary: 'Snide cough from the VIP box trims -0.10× multiplier until you build a streak.',
        multPen: baneTrust <= -1 ? 0.14 : 0.08,
        rivalEv: 0.05,
      },
      SEO_YUN_KANG: {
        title: 'Seo-Yun’s House Side-Bet',
        summary: 'Balcony card-counting sharpens the Champion’s expected pace by +8%.',
        multPen: baneTrust <= -1 ? 0.12 : 0.06,
        rivalEv: 0.08,
      },
      REX_CALLOWAY: {
        title: 'Rex’s Cufflink Glare',
        summary: 'Spotlight bounce from Loge B trims -0.10× multiplier on non-streak turns.',
        multPen: baneTrust <= -1 ? 0.12 : 0.07,
        rivalEv: 0.05,
      },
      CARMEN_DELGADO: {
        title: 'Carmen’s Folded Arms',
        summary: 'Broken backstage truce cools the crowd (-0.08× multiplier).',
        multPen: 0.08,
        rivalEv: 0.04,
      },
      TOBY_OKAFOR: {
        title: 'Toby’s Dimmed Bus',
        summary: 'Slighted lineman trims bonus voltage (-0.09× multiplier).',
        multPen: 0.09,
        rivalEv: 0.04,
      },
      INEZ_CALLAHAN: {
        title: 'Inez’s Strict Shush',
        summary: 'Disapproving glare from the balcony trims -0.08× multiplier.',
        multPen: 0.08,
        rivalEv: 0.04,
      },
    };

    const boon = boonMap[boonVoter];
    const bane = baneMap[baneVoter];

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
      this.state.rivalTrust.CARMEN_DELGADO +
      this.state.rivalTrust.TOBY_OKAFOR +
      this.state.rivalTrust.INEZ_CALLAHAN;

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
    const playerScore = Math.max(0, Math.floor(input.playerMatchScore));
    const rivalScore = Math.max(0, Math.floor(input.rivalMatchScore));
    // Winning an episode requires legitimately beating the Champion's match score!
    const wonMatch = playerScore > rivalScore;

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
            this.state.rivalTrust.CARMEN_DELGADO + 2,
          );
        } else if (input.blueprint.episodeNumber === 34) {
          liberatedRival = 'TOBY_OKAFOR';
          this.state.rivalTrust.TOBY_OKAFOR = Math.min(
            3,
            this.state.rivalTrust.TOBY_OKAFOR + 2,
          );
        } else if (input.blueprint.episodeNumber === 40) {
          liberatedRival = 'INEZ_CALLAHAN';
          this.state.rivalTrust.INEZ_CALLAHAN = Math.min(
            3,
            this.state.rivalTrust.INEZ_CALLAHAN + 2,
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

    const newlyUnlockedTrophies = this.evaluateTrophyUnlocks();
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
  ): readonly TrophySpecV7[] {
    const before = new Set(this.state.unlockedTrophyIds);

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
      this.state.rivalTrust.TOBY_OKAFOR >= 3 ||
      this.state.rivalTrust.CARMEN_DELGADO >= 3
    ) {
      this.grantTrophyId('trophy_s2_15');
    }
    if (this.state.currentEpisode > 45 || this.state.lienSegmentsPaid >= 6) {
      this.grantTrophyId('trophy_s2_18');
    }
    if (
      this.state.season === 4 &&
      (this.state.rivalTrust.CARMEN_DELGADO >= 1 ||
        this.state.rivalTrust.TOBY_OKAFOR >= 1 ||
        this.state.rivalTrust.INEZ_CALLAHAN >= 1)
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
    // Progressive Ep 1–3 Onboarding Beats (Zero Jargon, Pure 1966 Showbiz Clarity!)
    if (ep === 1) {
      return {
        speaker: 'GRANT_BELLAMY',
        line: 'Five seconds to Living Color! Step up to Podium One, tap bright dollar squares on the Tote Board, and outbank Nurse Carmen Delgado across ten brisk turns!',
      };
    }
    if (ep === 2) {
      return {
        speaker: 'TOBY_OKAFOR',
        line: 'Welcome back, champ! Con Ed trained me on engines and physics, not poetry—aim for my ★ Weak-Spot squares to score +0.5× bonus dollars!',
      };
    }
    if (ep === 3) {
      return {
        speaker: 'VERA_KARP',
        line: 'Standards heads-up before air: soap star Rex Calloway gets secret answers from Row C! Whenever his portrait flashes LIVE TELL, tap CATCH CHEAT for an instant cash bounty.',
      };
    }
    if (ep === 4) {
      return {
        speaker: 'INEZ_CALLAHAN',
        line: 'Forty years at the Fifth Avenue Reference Desk taught me to read every clue twice—just go easy on me if Sports or Engines light up on the board!',
      };
    }
    if (ep === 5) {
      return {
        speaker: 'ALASTAIR_KERR',
        line: 'Nine undefeated weeks in custom Savile Row velvet and they send me a walk-on? Keep an eye on Spotlight #4 if you plan on surviving the half-hour.',
      };
    }
    if (ep === 7) {
      return {
        speaker: 'SEO_YUN_KANG',
        line: 'I priced your odds in Monte Carlo before makeup finished my eyeliner—leave one Secret Square unguarded tonight and the house takes the pot.',
      };
    }

    if (isFinale) {
      return {
        speaker: 'GRANT_BELLAMY',
        line: 'Thirty-six floors above Sixth Avenue, fifty million Americans are tuned in for $250,000—let’s find out whether you came to host this network or blow its doors off!',
      };
    }
    if (isCoupPivot) {
      return {
        speaker: 'ROZ_KORMAN',
        line: 'Our Monte Carlo satellite window closes in ten minutes—pick who runs Control Booth A next season, because two of us are leaving in handcuffs or a cab!',
      };
    }
    if (isVaultDrop) {
      if (stageId === 'STAGE_03_1926_VAUDEVILLE_PIT') {
        return {
          speaker: 'VERA_KARP',
          line: 'Audience gone, applause signs dark—Vera Karp unlocked Burbank’s Pop-Art pilot stage after hours so you can win back every dollar in your Comeback Pot!',
        };
      }
      if (stageId === 'STAGE_04_1958_ISOLATION_VAULT') {
        return {
          speaker: 'VERA_KARP',
          line: 'Step inside the ’64 Teak & Glass Isolation Booth—zero sponsor mics, zero tricks, and winning ten square turns reclaims your entire Comeback Pot!',
        };
      }
      return {
        speaker: 'VERA_KARP',
        line: '2:30 AM inside 1967 Apollo Master Color Control—beat ten clean turns off-air and every dime stashed in your Comeback Pot transfers into your Clean Purse!',
      };
    }
    if (isGoldenExitMatch) {
      if (rivalId === 'CARMEN_DELGADO') {
        return {
          speaker: 'CARMEN_DELGADO',
          line: 'Big night on Atlantic City’s Steel Pier—if you beat this board fair and square without dirty sponsor cash, my Queens ER clinic pays off its mortgage before sunrise!',
        };
      }
      if (rivalId === 'TOBY_OKAFOR') {
        return {
          speaker: 'TOBY_OKAFOR',
          line: 'I unhooked every rigged cable under this World’s Fair stage—give me ten honest turns beneath the Unisphere and the network tears up my exclusive bond!',
        };
      }
      if (rivalId === 'INEZ_CALLAHAN') {
        return {
          speaker: 'INEZ_CALLAHAN',
          line: 'Three miles offshore on Channel 83’s radio deck, Roz’s lawyers have zero jurisdiction—win this broadcast cleanly and I walk away with my full pension!',
        };
      }
      return {
        speaker: 'GRANT_BELLAMY',
        line: 'Final stop of our international sweeps tour in Monte Carlo—every dollar banked under the Riviera chandeliers sets the table for tomorrow’s Control Booth coup!',
      };
    }

    if (season === 3) {
      if (this.state.activeCoupRegime === 'REGIME_A_ROZ_PHARMA') {
        const rozLines: readonly string[] = [
          'Vanguard Miracle Tonic bought every commercial break tonight—play ball with my wax-sealed tips and your Backstage Cash will overflow!',
          'Control Booth A belongs to the sponsors now, darling; pocket my halftime envelope at Turn 5 if you want extra multipliers.',
          'The agency executives in Skybox B adore a high roller—crack the $500 Vault and check under my red wax seal at the break!',
          'Ratings are printing money in thirty-two markets; take the sponsor’s tip at Turn 5 and let’s keep everybody rich.',
        ];
        return {
          speaker: 'ROZ_KORMAN',
          line: rozLines[ep % rozLines.length],
        };
      }
      if (this.state.activeCoupRegime === 'REGIME_B_BELLAMY_UHF') {
        const bellamyLines: readonly string[] = [
          'Network censors pulled our landline, so we’re beaming fifty kilowatts off Pirate Channel 83—hit glowing Halo squares for bonus multipliers!',
          'Every tin-foil rabbit-ear antenna from Brooklyn to Boston is locked onto our rogue signal—crack that $500 Vault and put on a clinic!',
          'No Madison Avenue suits in the booth tonight, folks—just hot color cameras, spinning trilons, and bonus cash on every Channel 83 Halo square!',
          'The Coast Guard cutter is circling off portside, which means our ratings just doubled—play bold and light up the whole board!',
        ];
        return {
          speaker: 'GRANT_BELLAMY',
          line: bellamyLines[ep % bellamyLines.length],
        };
      }
      const veraLines: readonly string[] = [
        'Federal observers have every camera timed to the split second—keep your Backstage Cash at $0 or bust a LIVE TELL for clean audit bonuses!',
        'Standards & Practices padlocked the cue-card rack tonight; burn any shady envelope on air at Turn 5 for certified Clean Purse cash.',
        'Every cable under Studio 6A is tagged as evidence—outthink the Champion fair and square and watch your Clean Purse climb!',
        'My stenographer is taking down every turn from Booth B—catch a crooked LIVE TELL tonight and I’ll certify the bounty myself.',
      ];
      return {
        speaker: 'VERA_KARP',
        line: veraLines[ep % veraLines.length],
      };
    }

    if (season === 4) {
      const sympLogeLines: readonly string[] = [
        'Look up at the velvet balcony—the friends you freed on tour are cheering bonus dollars onto every clue you nail tonight!',
        'Half the former champions in the VIP loge have your back tonight; unlock the $500 Gold Vault early and ride the streak to Stage Ten!',
        'You played square with us when the cameras were hot—now let our balcony vote carry you straight to the Penthouse doors!',
      ];
      const heelLogeLines: readonly string[] = [
        'The velvet balcony has side bets stacked against you, challenger—one cold streak on the upper rows and the Penthouse elevator stays locked!',
        'Every champion whose streak you snapped is watching from Loge B tonight; let’s see how steady your buzzer finger stays at eight o’clock.',
        'Roz’s high rollers packed the front balcony just to watch you blink—prove you belong in the Tournament of Champions!',
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
      CARMEN_DELGADO: [
        'Leave my marked Truce square alone on the first pass and we both walk out ahead of the network’s cut tonight.',
        'Twelve hours in Queens Trauma makes thirty-second studio clocks feel like a coffee break—bring your A-game!',
        'My head nurse tuned the break-room color set to Channel 4—stay off Medicine and Chemistry if you want to keep your lead!',
        'Win an adjacent square early to pop open that $500 Gold Vault before Roz’s booth crew gets cute.',
      ],
      TOBY_OKAFOR: [
        'If a square hums before you tap it, Control Booth A wired extra juice underneath—grab my ★ Weak-Spot squares first!',
        'I spent all afternoon balancing Midtown transformers; let’s play ten square turns and make the split-flaps sing.',
        'Ask me jet engines or circuits and I’ll run the table—throw Literature at me and you might catch me flat-footed.',
        'Watch the rebound cash when either of us misses—a +$50 open square turns a close match around fast!',
      ],
      INEZ_CALLAHAN: [
        'Read the second half of every question closely—our writers love tucking a giveaway clue right beside the punchline!',
        'I brought three sharpened No. 2 pencils and forty years of reference clippings; beat me cleanly and I’ll tip my hat.',
        'Nothing rattles a Fifth Avenue librarian except noisy sports trivia and carburetor questions—do with that what you will!',
        'String two right answers together and that $500 Locked Vault pops right open—just don’t leave it sitting there for me.',
      ],
      ALASTAIR_KERR: [
        'Nine weeks undefeated and makeup still powders my lapels twice—do try not to embarrass yourself before the commercial.',
        'My Savile Row tailor bet fifty dollars you’d blink on the top row; prove him wrong if you have the nerve.',
        'Grant Bellamy already reserved my table at “21” for nine o’clock—let’s keep this tidy, challenger.',
        'Stay out of Fine Arts and Empires if you value your dignity; this studio has been my living room for two months.',
      ],
      SEO_YUN_KANG: [
        'I priced your expected finish during the theme song—anything shy of a hot streak belongs to my side of the ledger.',
        'Monte Carlo taught me one iron law: never leave a $500 Gold Vault unlocked when your rival answers next.',
        'Numbers don’t flatter and they never bluff—unless you drag me into Silver Screen gossip, the math favors me.',
        'Hit two in a row and the multipliers compound fast; hesitate and I’ll clear the top row before Turn 8.',
      ],
      REX_CALLOWAY: [
        'Give Camera Three your good profile, pal—fifty million viewers tuned in for my smile, not an upset from Queens!',
        'My agent promised me a victory close-up at 8:28 sharp, so keep your mitts off Silver Screen and Hit Parade!',
        'Daytime Emmy voters are watching tonight—try not to outshine the star before the Mystery Curtain drops.',
        'Just between us, if Chemistry or Brain Twisters come up, pretend the studio lights got in my eyes.',
      ],
    };

    const brokerInterjections: readonly { speaker: BrokerIdV7; line: string }[] = [
      {
        speaker: 'GRANT_BELLAMY',
        line: 'Overnight ratings just topped a forty-eight share in Chicago—crack the $500 Vault or hit a Secret Square and give America fireworks!',
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
    const friendlyWeak = formatFriendlyWeakSpots(profile.weakCategories);
    const stageCallsign = FRIENDLY_STAGE_CALLSIGNS_V7[stageId] ?? 'STUDIO 6A';
    if (isFinale) {
      const bellamyWeak = formatFriendlyWeakSpots(
        CAST_PROFILES_V7.GRANT_BELLAMY.weakCategories,
      );
      return `PENTHOUSE SCOUTING WIRE — Aim for ★ Weak Spots (${bellamyWeak}) for +0.5× bonus & tap CATCH CHEAT on LIVE TELL!`;
    }
    if (isVaultDrop) {
      return `${stageCallsign} WIRE — Off-air Comeback Vault! Win this match to reclaim your full Comeback Pot. Weak spots: ${friendlyWeak}.`;
    }
    if (profile.cheatChannel === 'FRESNEL_LAMP') {
      return `${stageCallsign} WIRE — Watch for ${profile.name}’s LIVE TELL (spotlight blink) & tap CATCH CHEAT! ★ Weak spots: ${friendlyWeak}.`;
    }
    if (profile.cheatChannel === 'SOLENOID_SPARK') {
      return `${stageCallsign} WIRE — Watch for ${profile.name}’s LIVE TELL (rigged podium buzz) & tap CATCH CHEAT! ★ Weak spots: ${friendlyWeak}.`;
    }
    if (profile.cheatChannel === 'ROW_C_GLINT') {
      return `${stageCallsign} WIRE — Watch for ${profile.name}’s LIVE TELL (Row-C opera-glass flash) & tap CATCH CHEAT! ★ Weak spots: ${friendlyWeak}.`;
    }
    return `${stageCallsign} WIRE — Fair-Play Champion! Target ★ Weak Spots (${friendlyWeak}) for +0.5× bonus dollars!`;
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
        const s2Roz: Record<string, string> = {
          STAGE_06_ATLANTIC_CITY_PIER:
            'STEEL PIER VIP ENVELOPE: “Saltwater taffy’s on me, kid—POCKET for +$180 Backstage Cash & a marked clue next turn (tap Check for Rigging first!), or BURN ON AIR for +$125 Clean Purse.”',
          STAGE_07_1969_MONTE_CARLO_CASINO:
            'MONTE CARLO CROUPIER SLIP: “Slid straight from the high-limit shoe! POCKET for +$180 Backstage Cash & a marked answer (watch for house traps!), or BURN ON AIR for +$125 Clean Purse.”',
          STAGE_08_WORLDS_FAIR_GEODESIC:
            'UNISPHERE PRESS COURIER: “The sponsor pavilion wants a big Round 2! POCKET for +$180 Backstage Cash & a penciled hint (verify with UV!), or BURN ON AIR for +$125 Clean Purse.”',
          STAGE_09_CHANNEL_83_UHF_BARGE:
            'OFFSHORE SPEEDBOAT DROP: “Waterproof wax seal from Sixth Avenue! POCKET for +$180 Backstage Cash & next-turn answer mark (check for bait!), or BURN ON AIR for +$125 Clean Purse.”',
        };
        return {
          broker,
          note:
            s2Roz[stageId] ??
            'ROADSHOW SPONSOR WIRE: “POCKET for +$180 Backstage Cash and a marked answer next turn (tap Check for Rigging!), or BURN ON AIR for +$125 Clean Purse.”',
          isPoisoned,
        };
      }
      if (broker === 'GRANT_BELLAMY') {
        return {
          broker,
          note: 'EARLY BIRD SATELLITE CUE: “Our coast-to-coast feed is peaking! POCKET my verified host card for +$180 Backstage Cash & next-turn answer mark, or BURN ON AIR for +$125 Clean Purse.”',
          isPoisoned: false,
        };
      }
      return {
        broker,
        note: 'STANDARDS ROADSHOW CABLE: “We intercepted a tour fixer’s card backstage! BURN ON AIR for +$125 certified Clean Purse, or POCKET for +$180 Backstage Cash & next-turn answer mark.”',
        isPoisoned: false,
      };
    }

    // Season 3: Regime Wars Halftime Couriers (Pharma Skybox / Pirate UHF / Federal Audit)
    if (season === 3) {
      if (broker === 'ROZ_KORMAN') {
        const s3Roz: readonly string[] = [
          'VANGUARD TONIC SKYBOX NOTE: “The sponsor loves a team player, darling—POCKET for +$180 Backstage Cash & a marked answer (run Check for Rigging; I test loyalty!), or BURN ON AIR for +$125 Clean Purse.”',
          'FLOOR 34 PINK-CARBON SLIP: “Keep the split-flaps spinning! POCKET for +$180 Backstage Cash & next-turn grease-pencil mark (check UV for decoys!), or BURN ON AIR for +$125 Clean Purse.”',
        ];
        return { broker, note: s3Roz[ep % s3Roz.length], isPoisoned };
      }
      if (broker === 'GRANT_BELLAMY') {
        const s3Bellamy: readonly string[] = [
          'CHANNEL 83 WHEELHOUSE SLIP: “Fifty kilowatts and zero censors! POCKET my clean cue card for +$180 Backstage Cash & next-turn answer mark, or BURN ON AIR for +$125 Clean Purse.”',
          'BELLAMY’S CUFFLINK NOTE: “Give the rooftop-antenna crowd a showstopper! POCKET for +$180 Backstage Cash & verified next-turn mark, or BURN ON AIR for +$125 Clean Purse.”',
        ];
        return { broker, note: s3Bellamy[ep % s3Bellamy.length], isPoisoned: false };
      }
      const s3Vera: readonly string[] = [
        'FEDERAL AUDIT EXHIBIT: “Subpoenaed straight off Spotlight #4’s desk! BURN ON AIR for +$125 certified Clean Purse, or POCKET for +$180 Backstage Cash & verified next-turn mark.”',
        'STANDARDS STOPWATCH DISPATCH: “Clean hands win subpoenas—BURN ON AIR for +$125 certified Clean Purse, or POCKET this verified card for +$180 Backstage Cash & next-turn mark.”',
      ];
      return { broker, note: s3Vera[ep % s3Vera.length], isPoisoned: false };
    }

    // Season 4: Tournament of Champions Velvet Balcony & Penthouse Ascent
    if (season === 4) {
      if (broker === 'ROZ_KORMAN') {
        return {
          broker,
          note: 'VELVET LOGE MESSENGER: “High-stakes side bets just doubled upstairs! POCKET for +$180 Backstage Cash & next-turn mark (use Check for Rigging—Penthouse traps bite!), or BURN ON AIR for +$125 Clean Purse.”',
          isPoisoned,
        };
      }
      if (broker === 'GRANT_BELLAMY') {
        return {
          broker,
          note: 'EXECUTIVE ELEVATOR CARD: “You’re knocking on Stage Ten’s brass doors—POCKET my verified host mark for +$180 Backstage Cash, or BURN ON AIR for +$125 certified Clean Purse.”',
          isPoisoned: false,
        };
      }
      return {
        broker,
        note: 'GRAND JURY BALCONY SEAL: “Washington is taping tonight’s championship hour! BURN ON AIR for +$125 certified Clean Purse, or POCKET this clean intercept for +$180 Backstage Cash.”',
        isPoisoned: false,
      };
    }

    // Season 1: Studio 6A Classic Halftime Envelopes
    const note =
      broker === 'ROZ_KORMAN'
        ? 'ROZ’S SPONSOR TIP: “POCKET for +$180 Backstage Cash and a grease-penciled answer hint next turn (tap Check for Rigging—I occasionally plant decoys!), or BURN ON AIR for +$125 Clean Purse.”'
        : broker === 'GRANT_BELLAMY'
          ? 'BELLAMY’S HOST CARD: “Camera One wants fireworks after the commercial! POCKET for +$180 Backstage Cash and a verified answer mark next turn, or BURN ON AIR for +$125 Clean Purse.”'
          : 'VERA’S STANDARDS INTERCEPT: “We confiscated this cue card from Row C! BURN ON AIR for +$125 certified Clean Purse cash, or POCKET it for +$180 Backstage Cash and next-turn answer mark.”';

    return { broker, note, isPoisoned };
  }
}
