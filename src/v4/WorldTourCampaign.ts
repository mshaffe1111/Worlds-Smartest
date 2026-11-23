// ============================================================================
// WORLD'S SMARTEST v4.0 — 8-Tier World Search Campaign & 5-Slot Progress Store
// Escalating grounded journey: 42 folding chairs -> 1.4 Billion Live Simulcast.
// Bulk narrative/banter/quips lazy-loaded from `./data/world_tour_v4.json` with
// ultra-compact typed inline fallbacks so entry JS stays lean (< 350 kB budget).
// ============================================================================

import type { DomainId } from '../forge/types';
import type {
  BoardTopologyKind,
  ChallengerMoveKind,
  ChallengerProfileV4,
  QuestionFormatV4,
  VenueStageThemeId,
  WorldTourEpisodeV4,
} from './contracts';

export type WorldTourTierNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type WorldTourSlotId = 1 | 2 | 3 | 4 | 5;

export const ALL_WORLD_TOUR_SLOT_IDS: readonly WorldTourSlotId[] = [1, 2, 3, 4, 5];
export const TOTAL_WORLD_TOUR_EPISODES = 32;
export const MAX_WORLD_TOUR_STARS = TOTAL_WORLD_TOUR_EPISODES * 3; // 96 stars

const ACTIVE_SLOT_STORAGE_KEY = 'ws_active_campaign_slot';
const WORLD_TOUR_SLOT_KEY_PREFIX = 'ws_v4_world_tour_slot_';
const WORLD_TOUR_SCHEMA_VERSION = 1;
const MAX_HEADLINE_FEED_ITEMS = 40;
const DEFAULT_DATA_URL = './data/world_tour_v4.json';

export interface WorldTourTierMeta {
  readonly tierNumber: WorldTourTierNumber;
  readonly themeId: VenueStageThemeId;
  readonly name: string;
  readonly venueName: string;
  readonly location: string;
  readonly stageVibe: string;
  readonly audienceRangeLabel: string;
  readonly topPurseUsd: number;
  readonly challengerId: string;
  readonly unlockFeatureLabel: string;
  readonly mediaOutlets: readonly [string, string, string];
}

export interface WorldTourQuipPayload {
  readonly CAMPING_FAVORITE: readonly string[];
  readonly WIN_IN_WEAKEST: readonly string[];
  readonly MISS_IN_STRONGEST: readonly string[];
  readonly RIVAL_FORCED_WEAK: readonly string[];
  readonly RIVAL_FROZE_FAVORITE: readonly string[];
  readonly UNDERDOG_SURGE: readonly string[];
  readonly BUZZER_BEATER: readonly string[];
  readonly INSTANT_SNIPE: readonly string[];
  readonly MATCH4_SWEEP: readonly string[];
  readonly SORT4_PERFECT: readonly string[];
  readonly DOUBLE_DOWN_WIN: readonly string[];
  readonly DOUBLE_DOWN_BLOW: readonly string[];
  readonly POWER_PLAY_WIN: readonly string[];
  readonly POWER_PLAY_MISS: readonly string[];
  readonly SPOTLIGHT_ROULETTE_WIN: readonly string[];
  readonly SPOTLIGHT_ROULETTE_MISS: readonly string[];
  readonly MULTI_STRIKE_SWEEP: readonly string[];
  readonly PINPOINT_BULLSEYE: readonly string[];
  readonly CLUE_ESCALATOR_EARLY: readonly string[];
  readonly CROWN_WEDGE_EARNED: readonly string[];
  readonly WHEEL_CURVEBALL: readonly string[];
  readonly STREAK_HOT: readonly string[];
  readonly GENTLE_MISS: readonly string[];
  readonly EPISODE_INTRO_BY_TIER: Readonly<Record<string, readonly string[]>>;
  readonly MATCH_WIN: readonly string[];
  readonly MATCH_LOSS: readonly string[];
}

export interface WorldTourDataPayload {
  readonly schemaVersion: string;
  readonly host: {
    readonly name: string;
    readonly role: string;
    readonly tagline: string;
  };
  readonly tiers: readonly WorldTourTierMeta[];
  readonly challengers: readonly ChallengerProfileV4[];
  readonly episodes: readonly WorldTourEpisodeV4[];
  readonly quips: WorldTourQuipPayload;
}

export interface HeadlineClipping {
  readonly id: string;
  readonly outlet: string;
  readonly headline: string;
  readonly subline: string;
  readonly viewerDelta: number;
  readonly viewerDeltaLabel: string;
  readonly episodeId: string;
  readonly tierNumber: WorldTourTierNumber;
  readonly timestampIso: string;
}

export interface EpisodeProgressRecord {
  readonly episodeId: string;
  readonly cleared: boolean;
  readonly stars: 0 | 1 | 2 | 3;
  readonly bestScore: number;
  readonly bestRivalScore: number;
  readonly bestWedgesCount: number;
  readonly attempts: number;
  readonly wins: number;
  readonly peakAudienceOnEpisode: number;
  readonly prizeEarnedUsd: number;
  readonly firstClearedAtIso: string | null;
  readonly lastPlayedAtIso: string;
}

export interface WorldTourSlotState {
  readonly slotId: WorldTourSlotId;
  readonly schemaVersion: number;
  readonly contestantName: string;
  readonly unlockedEpisodeIds: readonly string[];
  readonly episodeRecords: Readonly<Record<string, EpisodeProgressRecord>>;
  readonly currentWorldAudience: number;
  readonly peakWorldAudience: number;
  readonly totalCareerPrizeUsd: number;
  readonly headlineFeed: readonly HeadlineClipping[];
  readonly defeatedChallengerIds: readonly string[];
  readonly updatedAtIso: string;
}

export interface WorldTourSlotSummary {
  readonly slotId: WorldTourSlotId;
  readonly isEmpty: boolean;
  readonly isActive: boolean;
  readonly contestantName: string;
  readonly clearedEpisodesCount: number;
  readonly totalEpisodesCount: number;
  readonly totalStars: number;
  readonly maxStars: number;
  readonly currentTierNumber: WorldTourTierNumber;
  readonly currentVenueName: string;
  readonly currentWorldAudience: number;
  readonly totalCareerPrizeUsd: number;
  readonly updatedAtIso: string | null;
}

export interface RecordEpisodeResultInput {
  readonly episodeId: string;
  readonly won: boolean;
  readonly playerScore: number;
  readonly rivalScore?: number;
  readonly accuracyPct?: number;
  readonly wedgesEarned?: number;
  readonly sweepsOrBullseyes?: number;
  readonly headlines?: readonly HeadlineClipping[];
}

export interface EpisodeCompletionSummary {
  readonly episode: WorldTourEpisodeV4;
  readonly won: boolean;
  readonly starsEarned: 0 | 1 | 2 | 3;
  readonly isFirstClear: boolean;
  readonly newlyUnlockedEpisodeId: string | null;
  readonly viewerDelta: number;
  readonly newWorldAudience: number;
  readonly prizeDeltaUsd: number;
  readonly newTotalCareerPrizeUsd: number;
  readonly slotState: WorldTourSlotState;
}

// ============================================================================
// FORMATTING HELPERS (Audience Counts & Prize Purses)
// ============================================================================

export function formatAudienceCount(count: number): string {
  const safe = Math.max(0, Math.round(Number(count) || 0));
  if (safe >= 1_000_000_000) {
    const billions = safe / 1_000_000_000;
    return `${billions >= 10 ? billions.toFixed(0) : Number(billions.toFixed(2))}B`;
  }
  if (safe >= 1_000_000) {
    const millions = safe / 1_000_000;
    return `${millions >= 100 ? Math.round(millions) : Number(millions.toFixed(1))}M`;
  }
  if (safe >= 10_000) {
    const thousands = safe / 1_000;
    return `${thousands >= 100 ? Math.round(thousands) : Number(thousands.toFixed(1))}K`;
  }
  return safe.toLocaleString('en-US');
}

export function formatPrizeUsd(amount: number): string {
  const safe = Math.max(0, Math.round(Number(amount) || 0));
  return `$${safe.toLocaleString('en-US')}`;
}

// ============================================================================
// COMPACT INLINE FALLBACK CATALOG (Hydrated with Full JSON via `loadWorldTourData`)
// ============================================================================

const FALLBACK_TIERS: readonly WorldTourTierMeta[] = [
  {
    tierNumber: 1,
    themeId: 'TIER1_COMMUNITY_HALL',
    name: 'Neighborhood Tryouts',
    venueName: 'Oakridge Community Hall',
    location: 'Oakridge, Brooklyn',
    stageVibe: 'Folding chairs, a squeaky microphone, and a coffee urn older than the internet.',
    audienceRangeLabel: '42 to 180 watching',
    topPurseUsd: 1000,
    challengerId: 'frankie_russo',
    unlockFeatureLabel: 'Classic Board & Match-4 Pairs',
    mediaOutlets: ['Oakridge Bulletin', 'Neighborhood Chat Thread', "Frankie's Bar Napkin"],
  },
  {
    tierNumber: 2,
    themeId: 'TIER2_CIVIC_THEATER',
    name: 'City Championship',
    venueName: 'Downtown Lyric Theater',
    location: 'Downtown Civic District',
    stageVibe: 'Velvet balconies, brass spotlights, and the local cable truck parked out front.',
    audienceRangeLabel: '1,400 to 6,500 watching',
    topPurseUsd: 5000,
    challengerId: 'denise_park',
    unlockFeatureLabel: 'Padlock Neighbors & Sort-4 Timelines',
    mediaOutlets: ['City Arts Weekly', 'Downtown Civic Gazette', 'Local Cable Live Chat'],
  },
  {
    tierNumber: 3,
    themeId: 'TIER3_REGIONAL_TV',
    name: 'Regional Daytime Broadcast',
    venueName: 'Channel 7 Studio B',
    location: 'Regional Broadcast Center',
    stageVibe: 'Live cameras right after the noon weather, studio lights, and real commercial breaks.',
    audienceRangeLabel: '78K to 240K watching',
    topPurseUsd: 25000,
    challengerId: 'trevor_blake',
    unlockFeatureLabel: '6-Color Crown Wedges & Rival Category Traps',
    mediaOutlets: ['Channel 7 Buzz Desk', 'Daytime TV Insider', 'Regional Ratings Wire'],
  },
  {
    tierNumber: 4,
    themeId: 'TIER4_NATIONAL_ARENA',
    name: 'National Prime-Time',
    venueName: 'Starlight Broadcast Center',
    location: 'National Network Stage',
    stageVibe: 'Sweeping jib cranes, a roaring studio crowd, and watch parties from coast to coast.',
    audienceRangeLabel: '5.2M to 14M watching',
    topPurseUsd: 100000,
    challengerId: 'priya_nair',
    unlockFeatureLabel: 'Spotlight Roulette & Pinpoint Dial',
    mediaOutlets: ['Prime-Time Watch', 'National Desk Live', 'Trending #1 Nationwide'],
  },
  {
    tierNumber: 5,
    themeId: 'TIER5_LONDON_ROTUNDA',
    name: 'European & Atlantic Open',
    venueName: 'Grand Rotunda Hall, London',
    location: 'London, United Kingdom',
    stageVibe: 'Marble colonnades, dry British applause, and international odds boards.',
    audienceRangeLabel: '34M to 68M watching',
    topPurseUsd: 500000,
    challengerId: 'alistair_finch',
    unlockFeatureLabel: 'Fog Crossroads & Category Pick-and-Ban Draft',
    mediaOutlets: ['London Evening Quiz Desk', 'Atlantic Broadcast Review', 'Sofa Watch UK'],
  },
  {
    tierNumber: 6,
    themeId: 'TIER6_TOKYO_SKYDOME',
    name: 'World Quarterfinals',
    venueName: 'Shibuya Broadcast Dome, Tokyo',
    location: 'Tokyo, Japan',
    stageVibe: 'Jumbotrons flashing across Shibuya Crossing while thirty thousand fans cheer live.',
    audienceRangeLabel: '160M to 280M watching',
    topPurseUsd: 1500000,
    challengerId: 'kenji_takahashi',
    unlockFeatureLabel: 'Multi-Strike Imposters & Column Freezes',
    mediaOutlets: ['Tokyo Broadcast Daily', 'Shibuya Jumbotron Feed', 'Global Quiz Wire'],
  },
  {
    tierNumber: 7,
    themeId: 'TIER7_CAIRO_PAVILION',
    name: 'World Semifinals',
    venueName: 'Great Pavilion at Giza',
    location: 'Giza, Egypt',
    stageVibe: 'An open-air stage facing ancient stone, broadcast in 60 languages under desert stars.',
    audienceRangeLabel: '490M to 780M watching',
    topPurseUsd: 3500000,
    challengerId: 'nadia_al_mansoor',
    unlockFeatureLabel: 'Clue Escalator & Stat-Targeted Traps',
    mediaOutlets: ['Cairo International Desk', 'World Memory Digest', 'Global Simulcast Pulse'],
  },
  {
    tierNumber: 8,
    themeId: 'TIER8_GLOBAL_FINALE',
    name: "The World's Smartest Live Simulcast",
    venueName: 'Global Championship Arena',
    location: 'Worldwide Live Broadcast',
    stageVibe: 'Every continent tuned in, $10,000,000 on the table, and one undisputed World Crown.',
    audienceRangeLabel: '1.1B to 1.4B watching live',
    topPurseUsd: 10000000,
    challengerId: 'julian_vance',
    unlockFeatureLabel: 'Grand Finale Vault & All 7 Game-Show Formats',
    mediaOutlets: ['World Broadcast Network', 'Planet Earth Live Feed', 'The Global Chronicle'],
  },
];

type CompactChallengerTuple = readonly [
  id: string,
  name: string,
  title: string,
  hometown: string,
  portraitFile: string,
  accentHex: string,
  strongDomains: readonly DomainId[],
  weakDomains: readonly DomainId[],
  baseAccuracy: number,
  gimmick: ChallengerMoveKind,
  intro1: string,
  intro2: string,
  forceLine: string,
  freezeLine: string,
  bigPlayLine: string,
  missLine: string,
  winLine: string,
  loseLine: string,
];

const COMPACT_CHALLENGERS: readonly CompactChallengerTuple[] = [
  [
    'frankie_russo',
    'Frankie "Last Call" Russo',
    'Unbeaten Neighborhood Pub-Quiz Bartender',
    'Oakridge, Brooklyn',
    'teo.png',
    '#f59e0b',
    [4, 5, 9],
    [1, 11],
    0.42,
    'CLAIM_TILE',
    'Relax, kid. I wipe down counters faster than most folks hit the buzzer.',
    "I've won 47 straight Tuesday nights here on movies and sports. Just don't ask me about chemistry.",
    "Let's pull one from my side of the bar. Hope you studied the box office!",
    "Whoa there, that column's cut off for the night. Last call!",
    'Okay, okay! Somebody actually read the backs of the cereal boxes growing up!',
    'Oof, spilled that one right on the bar mat. Happens to the best of us.',
    "Still the king of Oakridge! Stick around though, you've got real spark for this.",
    'You took the belt right off my apron! Go show the big city what Oakridge is made of!',
  ],
  [
    'denise_park',
    'Denise Park',
    'Retired AP History Legend & Grammar Enforcer',
    'Evanston, Illinois',
    'lindqvist.png',
    '#a78bfa',
    [0, 8, 10],
    [4, 6],
    0.48,
    'PLANT_BOUNTY',
    "Sit up straight and please say 'fewer' instead of 'less' when counting points.",
    'Thirty-four years of AP History taught me how to spot a bluffer before the chalk hits the board.',
    'Pop quiz! No notes, no whispering, and no complaining about the syllabus.',
    'One turn in timeout for your favorite column. Consider it character building.',
    "Crisp, accurate, and properly cited in spirit. I'm giving that an A-minus.",
    'Close, if we were grading on enthusiasm. We are not.',
    "Class dismissed! Come back after a little review and we'll try the midterm again.",
    'Extraordinary work! Put me down for a front-row ticket when you hit television.',
  ],
  [
    'trevor_blake',
    'Trevor "14-Day" Blake',
    '14-Day Regional TV Streak Holder',
    'Orlando, Florida',
    'soren.png',
    '#38bdf8',
    [4, 2, 5],
    [1, 3],
    0.55,
    'FORCE_WEAK_TILE',
    "Careful looking straight at my smile under these lights. My dentist calls it 'Broadcast White.'",
    'Fourteen straight afternoons on Channel 7, baby! Wave to your mom before I send you home.',
    'Hey producers, zoom in! I checked your stats backstage and picked your absolute worst topic.',
    "Commercial break on your safety blanket! That column's iced.",
    'Whoa! Somebody tell the director to stop cutting to my worried face!',
    "Yikes! That's gonna end up in the bloopers reel before the evening news.",
    'Day fifteen in the books! At least the Channel 7 tote bag is pretty nice.',
    'Wait, my streak is over?! Go crush prime-time so I can brag I lost to the champ.',
  ],
  [
    'priya_nair',
    'Dr. Priya Nair',
    'ER Trauma Physician & Speed-Crossword Champ',
    'Boston, Massachusetts',
    'nadia.png',
    '#10b981',
    [1, 7, 11],
    [5, 9],
    0.62,
    'PLANT_BOUNTY',
    'I work twelve-hour trauma shifts and finish Sunday crosswords in ink. Thirty seconds feels like a spa day.',
    'Nothing personal, challenger. I just like clean vitals, fast buzzers, and zero wasted seconds.',
    "Prescribing a dose of your weakest subject. Take immediately before the clock runs out.",
    'Putting that column in quarantine for one turn. Try a fresh wing of the board.',
    "Steady hands under prime-time pressure! That's genuinely impressive.",
    "Deep breath! One missed clue isn't fatal, just don't let it rattle the next turn.",
    'Good clean match! Get some rest and come take another shot whenever you are ready.',
    'You out-calmed an ER doctor on national television. Go give London a proper headache!',
  ],
  [
    'alistair_finch',
    'Lord Alistair Finch',
    'Bone-Dry Oxford Classics Fellow',
    'Oxford, England',
    'tariq.png',
    '#e11d48',
    [0, 3, 10],
    [4, 6],
    0.67,
    'FREEZE_FAVORITE_COLUMN',
    'Do forgive me if I look startled by pop-music questions. I still consider television a passing fad.',
    'Welcome to London. Try not to spill American enthusiasm all over the marble floor.',
    "I've selected a delightfully inconvenient subject for you. Do try to enjoy it.",
    "I'm placing a polite 'Closed for Tea' sign on your favorite column.",
    'Good heavens! That was startlingly well played. I may actually uncross my ankles.',
    'Ah. A valiant attempt, if we measure valor purely by confidence.',
    'A spirited contest! Do stay for tea; the scones are gentler than my History picks.',
    "Well played indeed! You've ruined my evening and earned my complete admiration.",
  ],
  [
    'kenji_takahashi',
    'Kenji "Zero-Lag" Takahashi',
    'Former Shogi & Quiz-Bowl Prodigy',
    'Shibuya, Tokyo',
    'soren.png',
    '#f43f5e',
    [6, 11, 5],
    [9, 3],
    0.72,
    'FREEZE_FAVORITE_COLUMN',
    'I read three moves ahead on a shogi board, and five turns ahead on this stage.',
    "Two hundred million people are watching Shibuya tonight. Let's give them a speedrun.",
    'Checking your career chart: this tile has your lowest win rate. Your move!',
    'Column locked! Consider your favorite strategy officially patched out for one turn.',
    "Whoa, frame-perfect answer! Okay, you're legitimately scary when you lock in.",
    'Clipped the corner on that one! Speed only helps when the answer lands.',
    'Checkmate under the neon! Run it back anytime; you pushed my tempo hard.',
    'Wait, you outpaced me in my own dome?! Respect. Go take the whole world title!',
  ],
  [
    'nadia_al_mansoor',
    'Nadia Al-Mansoor',
    'World Memory Champion & Polyglot',
    'Cairo, Egypt',
    'nadia.png',
    '#f5c451',
    [2, 0, 8, 10],
    [5, 4],
    0.76,
    'FORCE_WEAK_TILE',
    'I watched every tape of your climb from Oakridge to Giza. You belong on this stage.',
    "Half a billion viewers are awake for this semifinal. Let's play without holding back.",
    'I memorized your weak spots before we shook hands. Show the world you fixed them.',
    "Let's close your favorite doorway for one turn and see which other rooms you know.",
    "Magnificent! You didn't just remember the fact; you owned the entire stage.",
    'Even the finest memory slips under desert lights. Regroup on the next tile.',
    'What a semifinal! Nobody else came this close to knocking me off pace in Giza.',
    "You earned every cheer tonight. Go beat Julian Vance in front of a billion people!",
  ],
  [
    'julian_vance',
    'Julian Vance',
    'Undefeated 3-Time "World\'s Smartest" Champion',
    'Geneva, Switzerland',
    'vance.png',
    '#fbbf24',
    [0, 1, 2, 8, 11],
    [4, 9],
    0.8,
    'FORCE_WEAK_TILE',
    'Three championships, forty-two challengers, and none from folding chairs in Oakridge. Until tonight.',
    'Over a billion people are watching to see if the crown changes hands. Show me everything.',
    "The world title doesn't let you dodge your hardest category. Step up to this tile.",
    'Closing off your favorite column for one turn. A world champion wins from anywhere.',
    'Now THAT is championship trivia! Three years on this stage and nobody has pushed me like this.',
    "Heavy lights up here, aren't they? Catch your breath, because I'm not slowing down.",
    'Three-time champion becomes four by the narrowest margin of my career. Run it back!',
    "Fourteen hundred million people just watched history. The World Crown is yours.",
  ],
];

const FALLBACK_CHALLENGERS: readonly ChallengerProfileV4[] = COMPACT_CHALLENGERS.map((c) => ({
  id: c[0],
  name: c[1],
  title: c[2],
  hometown: c[3],
  avatarPortraitUrl: `./assets/portraits_cutout/${c[4]}`,
  accentHex: c[5],
  strongDomains: c[6],
  weakDomains: c[7],
  baseAccuracy: c[8],
  signatureGimmick: c[9],
  introLines: [c[10], c[11]],
  onForceCategoryLines: [c[12]],
  onFreezeColumnLines: [c[13]],
  onPlayerBigPlayLines: [c[14]],
  onPlayerMissLines: [c[15]],
  winMatchLine: c[16],
  loseMatchLine: c[17],
}));

const FMT_ALL_7: readonly QuestionFormatV4[] = [
  'MULTIPLE_CHOICE',
  'MATCH_4',
  'SORT_4',
  'MULTI_STRIKE',
  'PINPOINT_DIAL',
  'CLUE_ESCALATOR',
  'VISUAL_SPOTTER',
];

type CompactEpisodeTuple = readonly [
  tier: WorldTourTierNumber,
  epInTier: 1 | 2 | 3 | 4,
  title: string,
  subtitle: string,
  audience: number,
  purse: number,
  diff: WorldTourEpisodeV4['difficultyTier'],
  topology: BoardTopologyKind,
  cols: 4 | 5 | 6,
  rows: 3 | 4,
  maxTurns: number,
  formats: readonly QuestionFormatV4[],
  draft: boolean,
  solo: boolean,
  soloTarget: number,
  hook: string,
];

const COMPACT_EPISODES: readonly CompactEpisodeTuple[] = [
  [1, 1, 'Folding Chairs & Buzzers', 'Open Neighborhood Qualifier', 42, 250, 'MIDDLE_SCHOOL', 'OPEN_CLASSIC', 4, 3, 6, ['MULTIPLE_CHOICE'], false, true, 900, 'Clean open board with no rival yet: pick any tile and beat 900 points to qualify!'],
  [1, 2, 'The Coffee Urn Classic', 'Match-4 Pairs Debut', 78, 400, 'MIDDLE_SCHOOL', 'OPEN_CLASSIC', 4, 3, 7, ['MULTIPLE_CHOICE', 'MATCH_4'], false, true, 1200, 'Introduces Match-4 tiles: pair all 4 prompts cleanly and clear 1,200 points.'],
  [1, 3, 'Double-Down Night', 'First Brush With Frankie', 125, 650, 'MIDDLE_SCHOOL', 'OPEN_CLASSIC', 4, 3, 8, ['MULTIPLE_CHOICE', 'MATCH_4', 'VISUAL_SPOTTER'], false, false, 1400, "Frankie Russo joins the stage! Outscore Oakridge's unbeaten pub-quiz bartender."],
  [1, 4, 'Last Call at Oakridge', 'Neighborhood Championship', 180, 1000, 'MIDDLE_SCHOOL', 'OPEN_CLASSIC', 4, 4, 9, ['MULTIPLE_CHOICE', 'MATCH_4', 'VISUAL_SPOTTER'], false, false, 1700, 'Beat Frankie on a full 4x4 board to win $1,000 and your City Championship ticket.'],

  [2, 1, 'Velvet Seats & Padlocks', 'City Quarterfinal', 1400, 2000, 'MIDDLE_SCHOOL', 'PADLOCK_NEIGHBORS', 4, 4, 8, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4'], false, false, 1800, 'Unlocks Padlock Neighbors and Sort-4: clear adjacent tiles to shatter 400/800 locks!'],
  [2, 2, 'Order in the Timeline', 'Red-Pen Showdown', 2600, 3000, 'MIDDLE_SCHOOL', 'PADLOCK_NEIGHBORS', 4, 4, 9, ['MULTIPLE_CHOICE', 'SORT_4', 'VISUAL_SPOTTER'], false, false, 2000, 'Denise plants bounties while Sort-4 timelines test your chronological instincts.'],
  [2, 3, 'Extra Credit Showdown', 'City Semifinal', 4200, 4000, 'HIGH_SCHOOL', 'PADLOCK_NEIGHBORS', 5, 3, 9, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'VISUAL_SPOTTER'], false, false, 2200, 'High School difficulty arrives on a wider 5-column Padlock board.'],
  [2, 4, 'The Lyric Finals', 'City Championship Crown', 6500, 5000, 'HIGH_SCHOOL', 'PADLOCK_NEIGHBORS', 5, 4, 10, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'VISUAL_SPOTTER'], false, false, 2500, 'Outscore Denise Park across a 5x4 locked board to earn a spot on regional TV.'],

  [3, 1, 'Live After the Weather', 'Television Debut', 78000, 10000, 'HIGH_SCHOOL', 'OPEN_CLASSIC', 5, 4, 10, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'VISUAL_SPOTTER'], false, false, 2600, 'Unlocks 6-Color Crown Wedges on the bottom row while live TV cameras roll!'],
  [3, 2, 'Studio Veneers & Curveballs', 'Sweeps Week Match 2', 120000, 15000, 'HIGH_SCHOOL', 'PADLOCK_NEIGHBORS', 5, 4, 10, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'VISUAL_SPOTTER'], false, false, 2800, 'Padlocked vaults meet Show Wheel curveballs and Power Play wagers on Channel 7.'],
  [3, 3, 'Sweeps Week Ambush', 'Category-Forcing Debut', 175000, 20000, 'HIGH_SCHOOL', 'CHALLENGER_GAUNTLET', 6, 3, 10, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'VISUAL_SPOTTER'], false, false, 3000, 'Trevor reads your career stats and forces you onto your weakest categories live!'],
  [3, 4, 'Day 15 for Trevor', 'Regional Broadcast Finale', 240000, 25000, 'HIGH_SCHOOL', 'CHALLENGER_GAUNTLET', 6, 4, 11, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'VISUAL_SPOTTER'], false, false, 3300, "Snap Trevor's 14-day TV streak to win $25,000 and go prime-time nationwide."],

  [4, 1, 'Prime-Time Premiere', 'Spotlight Roulette Debut', 5200000, 40000, 'COLLEGE', 'SPOTLIGHT_ROULETTE', 5, 4, 10, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'PINPOINT_DIAL'], false, false, 3400, 'Unlocks Spotlight Roulette forced turns and Pinpoint Dial estimation sliders!'],
  [4, 2, 'Code Blue Countdown', 'Under the Ticking Clock', 7800000, 60000, 'COLLEGE', 'SPOTLIGHT_ROULETTE', 5, 4, 10, ['MULTIPLE_CHOICE', 'PINPOINT_DIAL', 'SORT_4', 'VISUAL_SPOTTER'], false, false, 3600, 'Dr. Priya Nair plants high-stakes bounties while the spotlight hijacks your picks.'],
  [4, 3, 'Coast-to-Coast Pressure', 'National Semifinal', 10900000, 80000, 'COLLEGE', 'SPOTLIGHT_ROULETTE', 6, 4, 11, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'PINPOINT_DIAL', 'VISUAL_SPOTTER'], false, false, 3900, 'Land Pinpoint Dial bullseyes in front of 10.9M viewers to stay ahead of Dr. Nair.'],
  [4, 4, 'The National Crown', 'Prime-Time Championship', 14000000, 100000, 'COLLEGE', 'SPOTLIGHT_ROULETTE', 6, 4, 12, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'PINPOINT_DIAL', 'VISUAL_SPOTTER'], false, false, 4200, 'Outscore Dr. Priya Nair across 12 turns to bank $100,000 and fly to London!'],

  [5, 1, 'London Fog Warning', 'Fog Crossroads Debut', 34000000, 200000, 'COLLEGE', 'FOG_CROSSROADS', 5, 4, 10, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'PINPOINT_DIAL', 'VISUAL_SPOTTER'], false, false, 4100, 'Unlocks Fog Crossroads: solve center tiles to illuminate neighboring fogged squares!'],
  [5, 2, 'High Tea & Low Blows', 'Atlantic Open Round 2', 45000000, 300000, 'COLLEGE', 'FOG_CROSSROADS', 6, 4, 11, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'PINPOINT_DIAL', 'VISUAL_SPOTTER'], false, false, 4300, 'Lord Finch freezes your favorite column while you carve through the fogged grid.'],
  [5, 3, 'The Oxford Draft', 'Category Pick & Ban Debut', 56000000, 400000, 'COLLEGE', 'FOG_CROSSROADS', 6, 4, 11, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'PINPOINT_DIAL', 'VISUAL_SPOTTER'], true, false, 4500, "Unlocks Category Pick & Ban Draft! Ban Finch's classics or sneak in Pop Culture."],
  [5, 4, 'Rotunda Cup Final', 'European & Atlantic Title', 68000000, 500000, 'COLLEGE', 'CHALLENGER_GAUNTLET', 6, 4, 12, ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'PINPOINT_DIAL', 'VISUAL_SPOTTER'], true, false, 4800, 'Draft your categories and outlast Lord Finch in front of 68M viewers for $500,000!'],

  [6, 1, 'Neon Lights, Spot the Fake', 'Multi-Strike Debut', 160000000, 750000, 'GRADUATE', 'CHALLENGER_GAUNTLET', 6, 4, 11, ['MULTIPLE_CHOICE', 'MULTI_STRIKE', 'MATCH_4', 'PINPOINT_DIAL'], false, false, 4900, 'Graduate difficulty + Multi-Strike: pick all true items or spot the lone imposter!'],
  [6, 2, 'Zero-Lag Freezeout', 'Quarterfinal Heat 2', 195000000, 1000000, 'GRADUATE', 'CHALLENGER_GAUNTLET', 6, 4, 11, ['MULTIPLE_CHOICE', 'MULTI_STRIKE', 'SORT_4', 'VISUAL_SPOTTER'], false, false, 5100, 'Kenji freezes your best lane and hunts Lightning Blitz tiles; stay nimble.'],
  [6, 3, 'Shibuya Blitz Night', 'Draft & Spotlight Clash', 235000000, 1250000, 'GRADUATE', 'SPOTLIGHT_ROULETTE', 6, 4, 12, ['MULTIPLE_CHOICE', 'MULTI_STRIKE', 'MATCH_4', 'SORT_4', 'PINPOINT_DIAL', 'VISUAL_SPOTTER'], true, false, 5400, 'Draft the Tokyo board, then brace for Spotlight Roulette forced picks.'],
  [6, 4, 'Quarterfinal Dome Clash', 'Tokyo Championship Ticket', 280000000, 1500000, 'GRADUATE', 'CHALLENGER_GAUNTLET', 6, 4, 12, ['MULTIPLE_CHOICE', 'MULTI_STRIKE', 'MATCH_4', 'SORT_4', 'PINPOINT_DIAL', 'VISUAL_SPOTTER'], true, false, 5700, "Defeat Kenji Takahashi before 280M viewers to pocket $1.5M and advance to Cairo."],

  [7, 1, 'Under the Pyramids', 'Clue Escalator Debut', 490000000, 2000000, 'GRADUATE', 'FOG_CROSSROADS', 6, 4, 12, ['MULTIPLE_CHOICE', 'CLUE_ESCALATOR', 'MATCH_4', 'MULTI_STRIKE', 'PINPOINT_DIAL'], false, false, 5800, 'Unlocks Clue Escalator: solve on Clue 1 for 3x points, Clue 2 for 2x, or Clue 3 for 1x!'],
  [7, 2, 'The Memory Palace Test', 'World Semifinal Night 2', 580000000, 2500000, 'GRADUATE', 'CHALLENGER_GAUNTLET', 6, 4, 12, ['MULTIPLE_CHOICE', 'CLUE_ESCALATOR', 'SORT_4', 'MULTI_STRIKE', 'VISUAL_SPOTTER'], false, false, 6000, 'Nadia targets your weakest stats; cash in 3x Clue Escalators to steal momentum.'],
  [7, 3, 'Desert Heat Draft', 'First Taste of Mensa Vaults', 680000000, 3000000, 'MENSA', 'SPOTLIGHT_ROULETTE', 6, 4, 12, FMT_ALL_7, true, false, 6200, 'Mensa difficulty unlocks with all 7 question formats live on stage!'],
  [7, 4, 'Semifinal by Starlight', 'Ticket to the Global Finale', 780000000, 3500000, 'MENSA', 'CHALLENGER_GAUNTLET', 6, 4, 13, FMT_ALL_7, true, false, 6500, 'Beat Nadia Al-Mansoor before 780M viewers to win $3.5M and face Julian Vance!'],

  [8, 1, 'One Billion Pairs of Eyes', 'Global Finale Opening Night', 1100000000, 5000000, 'MENSA', 'GRAND_FINALE_VAULT', 6, 4, 12, FMT_ALL_7, true, false, 6800, 'Grand Finale Vault combines all twists and all 7 formats live for 1.1 billion viewers!'],
  [8, 2, "The Champion's Opening Gambit", 'World Championship Match 2', 1200000000, 6500000, 'MENSA', 'GRAND_FINALE_VAULT', 6, 4, 12, FMT_ALL_7, true, false, 7000, 'Julian Vance attacks your weakest domain; use the Category Draft to pull him off-balance.'],
  [8, 3, 'No Safe Columns Left', 'Championship Match Point', 1300000000, 8000000, 'MENSA', 'GRAND_FINALE_VAULT', 6, 4, 13, FMT_ALL_7, true, false, 7400, '1.3 billion watching! Chain line-clears and Power Plays to push the 3-time champ.'],
  [8, 4, "The World's Smartest Crown", 'The $10,000,000 Live Simulcast Finale', 1400000000, 10000000, 'MENSA', 'GRAND_FINALE_VAULT', 6, 4, 14, FMT_ALL_7, true, false, 7800, '1.4 billion watching live! Beat Julian Vance across 14 turns for $10,000,000 and the Crown!'],
];

const FALLBACK_EPISODES: readonly WorldTourEpisodeV4[] = COMPACT_EPISODES.map((e) => {
  const tierMeta = FALLBACK_TIERS[e[0] - 1];
  const ep: WorldTourEpisodeV4 = {
    episodeId: `t${e[0]}_ep${e[1]}`,
    tierNumber: e[0],
    episodeInTier: e[1],
    title: e[2],
    subtitle: e[3],
    venueName: tierMeta.venueName,
    themeId: tierMeta.themeId,
    baseAudienceWatching: e[4],
    prizePurseUsd: e[5],
    difficultyTier: e[6],
    topology: e[7],
    boardCols: e[8],
    boardRows: e[9],
    maxTurns: e[10],
    allowedFormats: e[11],
    ...(e[12] ? { hasCategoryDraft: true } : {}),
    challengerId: e[13] ? null : tierMeta.challengerId,
    soloTargetScore: e[14],
    rulesHookSummary: e[15],
  };
  return ep;
});

// ============================================================================
// RUNTIME HYDRATION FROM `public/data/world_tour_v4.json`
// ============================================================================

let hydratedPayload: WorldTourDataPayload | null = null;
let inflightLoadPromise: Promise<WorldTourDataPayload | null> | null = null;
const dataLoadedListeners = new Set<(payload: WorldTourDataPayload) => void>();

export function getLoadedWorldTourPayload(): WorldTourDataPayload | null {
  return hydratedPayload;
}

export function subscribeWorldTourDataLoaded(
  listener: (payload: WorldTourDataPayload) => void,
): () => void {
  dataLoadedListeners.add(listener);
  if (hydratedPayload) {
    listener(hydratedPayload);
  }
  return () => {
    dataLoadedListeners.delete(listener);
  };
}

/**
 * Lazy-loads the full campaign, challenger banter, and 250+ Max Sterling quip bank
 * from `./data/world_tour_v4.json`. Safe to call multiple times or in Node tests.
 */
export async function loadWorldTourData(
  fetchUrl: string = DEFAULT_DATA_URL,
): Promise<WorldTourDataPayload | null> {
  if (hydratedPayload) return hydratedPayload;
  if (inflightLoadPromise) return inflightLoadPromise;

  inflightLoadPromise = (async () => {
    if (typeof fetch !== 'function') {
      return null;
    }
    try {
      const response = await fetch(fetchUrl, { cache: 'force-cache' });
      if (!response.ok) return null;
      const parsed = (await response.json()) as Partial<WorldTourDataPayload> | null;
      if (
        !parsed ||
        !Array.isArray(parsed.episodes) ||
        !Array.isArray(parsed.challengers) ||
        !Array.isArray(parsed.tiers) ||
        !parsed.quips
      ) {
        return null;
      }
      hydratedPayload = parsed as WorldTourDataPayload;
      for (const listener of dataLoadedListeners) {
        listener(hydratedPayload);
      }
      return hydratedPayload;
    } catch {
      return null;
    } finally {
      inflightLoadPromise = null;
    }
  })();

  return inflightLoadPromise;
}

// Kick off non-blocking preload in browser environments without blocking entry JS
if (typeof window !== 'undefined' && typeof fetch === 'function') {
  void loadWorldTourData();
}

// ============================================================================
// SYNCHRONOUS CAMPAIGN & CHALLENGER LOOKUPS (Zero-Latency Ready on Frame 1)
// ============================================================================

export function getAllTiers(): readonly WorldTourTierMeta[] {
  return hydratedPayload?.tiers ?? FALLBACK_TIERS;
}

export function getTierMeta(tierNumber: WorldTourTierNumber): WorldTourTierMeta {
  const tiers = getAllTiers();
  const idx = Math.max(0, Math.min(tiers.length - 1, tierNumber - 1));
  return tiers[idx];
}

export function getAllEpisodes(): readonly WorldTourEpisodeV4[] {
  return hydratedPayload?.episodes ?? FALLBACK_EPISODES;
}

export function getEpisodesForTier(
  tierNumber: WorldTourTierNumber,
): readonly WorldTourEpisodeV4[] {
  return getAllEpisodes().filter((ep) => ep.tierNumber === tierNumber);
}

export function getEpisodeById(episodeId: string): WorldTourEpisodeV4 | undefined {
  return getAllEpisodes().find((ep) => ep.episodeId === episodeId);
}

export function getNextEpisodeId(episodeId: string): string | null {
  const all = getAllEpisodes();
  const idx = all.findIndex((ep) => ep.episodeId === episodeId);
  if (idx < 0 || idx >= all.length - 1) return null;
  return all[idx + 1].episodeId;
}

export function getAllChallengers(): readonly ChallengerProfileV4[] {
  return hydratedPayload?.challengers ?? FALLBACK_CHALLENGERS;
}

export function getChallengerById(
  challengerId: string | null | undefined,
): ChallengerProfileV4 | null {
  if (!challengerId) return null;
  return getAllChallengers().find((c) => c.id === challengerId) ?? null;
}

export function getChallengerForEpisode(
  episodeOrId: WorldTourEpisodeV4 | string,
): ChallengerProfileV4 | null {
  const episode = typeof episodeOrId === 'string' ? getEpisodeById(episodeOrId) : episodeOrId;
  if (!episode || !episode.challengerId) return null;
  return getChallengerById(episode.challengerId);
}

// ============================================================================
// 5-SLOT COMPATIBLE WORLD TOUR PROGRESS STORE (`localStorage` + Memory Fallback)
// ============================================================================

function isValidSlotId(v: unknown): v is WorldTourSlotId {
  return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
}

function slotStorageKey(slotId: WorldTourSlotId): string {
  return `${WORLD_TOUR_SLOT_KEY_PREFIX}${slotId}`;
}

function createFreshSlotState(slotId: WorldTourSlotId, contestantName = 'Challenger'): WorldTourSlotState {
  return {
    slotId,
    schemaVersion: WORLD_TOUR_SCHEMA_VERSION,
    contestantName: contestantName.trim() || 'Challenger',
    unlockedEpisodeIds: ['t1_ep1'],
    episodeRecords: {},
    currentWorldAudience: 42,
    peakWorldAudience: 42,
    totalCareerPrizeUsd: 0,
    headlineFeed: [],
    defeatedChallengerIds: [],
    updatedAtIso: new Date().toISOString(),
  };
}

function sanitizeSlotState(slotId: WorldTourSlotId, raw: unknown): WorldTourSlotState {
  const fallback = createFreshSlotState(slotId);
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Partial<WorldTourSlotState>;

  const validEpisodeIds = new Set(getAllEpisodes().map((ep) => ep.episodeId));
  const unlockedSet = new Set<string>(['t1_ep1']);
  if (Array.isArray(obj.unlockedEpisodeIds)) {
    for (const id of obj.unlockedEpisodeIds) {
      if (typeof id === 'string' && validEpisodeIds.has(id)) {
        unlockedSet.add(id);
      }
    }
  }

  const sanitizedRecords: Record<string, EpisodeProgressRecord> = {};
  if (obj.episodeRecords && typeof obj.episodeRecords === 'object') {
    for (const [epId, rec] of Object.entries(obj.episodeRecords)) {
      if (!validEpisodeIds.has(epId) || !rec || typeof rec !== 'object') continue;
      const r = rec as Partial<EpisodeProgressRecord>;
      const rawStars = Math.trunc(Number(r.stars) || 0);
      const stars = Math.max(0, Math.min(3, rawStars)) as 0 | 1 | 2 | 3;
      sanitizedRecords[epId] = {
        episodeId: epId,
        cleared: Boolean(r.cleared),
        stars,
        bestScore: Math.max(0, Math.round(Number(r.bestScore) || 0)),
        bestRivalScore: Math.max(0, Math.round(Number(r.bestRivalScore) || 0)),
        bestWedgesCount: Math.max(0, Math.min(6, Math.trunc(Number(r.bestWedgesCount) || 0))),
        attempts: Math.max(0, Math.trunc(Number(r.attempts) || 0)),
        wins: Math.max(0, Math.trunc(Number(r.wins) || 0)),
        peakAudienceOnEpisode: Math.max(0, Math.round(Number(r.peakAudienceOnEpisode) || 0)),
        prizeEarnedUsd: Math.max(0, Math.round(Number(r.prizeEarnedUsd) || 0)),
        firstClearedAtIso: typeof r.firstClearedAtIso === 'string' ? r.firstClearedAtIso : null,
        lastPlayedAtIso:
          typeof r.lastPlayedAtIso === 'string' ? r.lastPlayedAtIso : new Date().toISOString(),
      };
    }
  }

  const headlineFeed: HeadlineClipping[] = Array.isArray(obj.headlineFeed)
    ? obj.headlineFeed
        .filter((h): h is HeadlineClipping => Boolean(h && typeof h.headline === 'string'))
        .slice(0, MAX_HEADLINE_FEED_ITEMS)
    : [];

  const defeatedChallengers = Array.isArray(obj.defeatedChallengerIds)
    ? Array.from(new Set(obj.defeatedChallengerIds.filter((c): c is string => typeof c === 'string')))
    : [];

  const currentAudience = Math.max(42, Math.round(Number(obj.currentWorldAudience) || 42));
  const peakAudience = Math.max(currentAudience, Math.round(Number(obj.peakWorldAudience) || currentAudience));

  return {
    slotId,
    schemaVersion: WORLD_TOUR_SCHEMA_VERSION,
    contestantName:
      typeof obj.contestantName === 'string' && obj.contestantName.trim()
        ? obj.contestantName.trim().slice(0, 32)
        : 'Challenger',
    unlockedEpisodeIds: Array.from(unlockedSet),
    episodeRecords: sanitizedRecords,
    currentWorldAudience: currentAudience,
    peakWorldAudience: peakAudience,
    totalCareerPrizeUsd: Math.max(0, Math.round(Number(obj.totalCareerPrizeUsd) || 0)),
    headlineFeed,
    defeatedChallengerIds: defeatedChallengers,
    updatedAtIso: typeof obj.updatedAtIso === 'string' ? obj.updatedAtIso : fallback.updatedAtIso,
  };
}

export function computeEpisodeStars(
  episode: WorldTourEpisodeV4,
  input: RecordEpisodeResultInput,
): 0 | 1 | 2 | 3 {
  if (!input.won) return 0;
  const accuracy = Math.max(0, Math.min(100, Number(input.accuracyPct ?? 72)));
  const wedges = Math.max(0, Math.trunc(Number(input.wedgesEarned ?? 0)));
  const sweeps = Math.max(0, Math.trunc(Number(input.sweepsOrBullseyes ?? 0)));
  const benchmark =
    episode.challengerId && typeof input.rivalScore === 'number' && input.rivalScore > 0
      ? input.rivalScore
      : episode.soloTargetScore;
  const marginRatio = benchmark > 0 ? input.playerScore / benchmark : 1.0;

  if (
    accuracy >= 85 ||
    (wedges >= 3 && accuracy >= 75) ||
    (sweeps >= 2 && accuracy >= 75) ||
    marginRatio >= 1.45
  ) {
    return 3;
  }
  if (accuracy >= 70 || wedges >= 2 || sweeps >= 1 || marginRatio >= 1.2) {
    return 2;
  }
  return 1;
}

export function computeAudienceJumpForMatch(
  episode: WorldTourEpisodeV4,
  won: boolean,
  starsEarned: 0 | 1 | 2 | 3,
  sweepsOrBullseyes = 0,
): number {
  const base = episode.baseAudienceWatching;
  if (!won) {
    // Even a nail-biter loss brings a small buzz bump from dramatic television!
    return Math.max(4, Math.round(base * 0.03));
  }
  const starBoost = starsEarned === 3 ? 0.18 : starsEarned === 2 ? 0.12 : 0.07;
  const featBoost = Math.min(0.1, Math.max(0, sweepsOrBullseyes) * 0.025);
  return Math.max(12, Math.round(base * (starBoost + featBoost)));
}

export class WorldTourProgressStore {
  private readonly memorySlots = new Map<WorldTourSlotId, string>();
  private activeSlotId: WorldTourSlotId = 1;
  private readonly listeners = new Set<(state: WorldTourSlotState) => void>();

  constructor() {
    this.activeSlotId = this.readPersistedActiveSlotId() ?? 1;
  }

  private readRaw(key: string): string | null {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        return localStorage.getItem(key);
      }
    } catch {
      // Fallback to in-memory map
    }
    return null;
  }

  private writeRaw(key: string, value: string): void {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(key, value);
      }
    } catch {
      // Ignore storage quota / sandbox restrictions
    }
  }

  private removeRaw(key: string): void {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore storage errors
    }
  }

  private readPersistedActiveSlotId(): WorldTourSlotId | null {
    const raw = this.readRaw(ACTIVE_SLOT_STORAGE_KEY);
    const num = Number(raw);
    return isValidSlotId(num) ? num : null;
  }

  private readSlot(slotId: WorldTourSlotId): WorldTourSlotState | null {
    const raw = this.readRaw(slotStorageKey(slotId)) ?? this.memorySlots.get(slotId) ?? null;
    if (!raw) return null;
    try {
      return sanitizeSlotState(slotId, JSON.parse(raw));
    } catch {
      return null;
    }
  }

  private writeSlot(state: WorldTourSlotState): void {
    const serialized = JSON.stringify(state);
    this.memorySlots.set(state.slotId, serialized);
    this.writeRaw(slotStorageKey(state.slotId), serialized);
  }

  private notify(state: WorldTourSlotState): void {
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  public subscribe(listener: (state: WorldTourSlotState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getActiveSlotId(): WorldTourSlotId {
    const synced = this.readPersistedActiveSlotId();
    if (synced !== null && synced !== this.activeSlotId) {
      this.activeSlotId = synced;
    }
    return this.activeSlotId;
  }

  public setActiveSlot(slotId: WorldTourSlotId): WorldTourSlotState {
    const safeSlot: WorldTourSlotId = isValidSlotId(slotId) ? slotId : 1;
    this.activeSlotId = safeSlot;
    this.writeRaw(ACTIVE_SLOT_STORAGE_KEY, String(safeSlot));
    const snapshot = this.getSnapshot(safeSlot);
    this.notify(snapshot);
    return snapshot;
  }

  public getSnapshot(slotId?: WorldTourSlotId): WorldTourSlotState {
    const targetSlot = isValidSlotId(slotId) ? slotId : this.getActiveSlotId();
    return this.readSlot(targetSlot) ?? createFreshSlotState(targetSlot);
  }

  public setContestantName(name: string, slotId?: WorldTourSlotId): WorldTourSlotState {
    const current = this.getSnapshot(slotId);
    const next: WorldTourSlotState = {
      ...current,
      contestantName: name.trim().slice(0, 32) || 'Challenger',
      updatedAtIso: new Date().toISOString(),
    };
    this.writeSlot(next);
    if (next.slotId === this.getActiveSlotId()) {
      this.notify(next);
    }
    return next;
  }

  public isEpisodeUnlocked(episodeId: string, slotId?: WorldTourSlotId): boolean {
    if (episodeId === 't1_ep1') return true;
    return this.getSnapshot(slotId).unlockedEpisodeIds.includes(episodeId);
  }

  public getEpisodeProgress(
    episodeId: string,
    slotId?: WorldTourSlotId,
  ): EpisodeProgressRecord | null {
    return this.getSnapshot(slotId).episodeRecords[episodeId] ?? null;
  }

  public getNextPlayableEpisode(slotId?: WorldTourSlotId): WorldTourEpisodeV4 {
    const state = this.getSnapshot(slotId);
    const all = getAllEpisodes();
    for (const ep of all) {
      const unlocked = state.unlockedEpisodeIds.includes(ep.episodeId);
      const cleared = Boolean(state.episodeRecords[ep.episodeId]?.cleared);
      if (unlocked && !cleared) {
        return ep;
      }
    }
    // All 32 episodes cleared -> highlight the Grand Finale crown rematch!
    return all[all.length - 1];
  }

  public recordEpisodeResult(
    input: RecordEpisodeResultInput,
    slotId?: WorldTourSlotId,
  ): EpisodeCompletionSummary {
    const episode = getEpisodeById(input.episodeId);
    if (!episode) {
      throw new Error(`Unknown World Tour episodeId: "${input.episodeId}"`);
    }

    const current = this.getSnapshot(slotId);
    const nowIso = new Date().toISOString();
    const prevRec = current.episodeRecords[episode.episodeId];
    const starsEarned = computeEpisodeStars(episode, input);
    const isFirstClear = input.won && !prevRec?.cleared;

    const viewerDelta = computeAudienceJumpForMatch(
      episode,
      input.won,
      starsEarned,
      input.sweepsOrBullseyes ?? 0,
    );
    const episodePeakAudience = episode.baseAudienceWatching + viewerDelta;
    const newWorldAudience = Math.max(
      current.currentWorldAudience + viewerDelta,
      episodePeakAudience,
    );
    const newPeakWorldAudience = Math.max(current.peakWorldAudience, newWorldAudience);

    // Prize purse math: full purse on first clear (+15% 3-star clean sweep bonus),
    // star-upgrade bonus or 10% encore appearance payout on replays!
    let prizeDeltaUsd = 0;
    if (input.won) {
      if (isFirstClear) {
        prizeDeltaUsd = episode.prizePurseUsd + (starsEarned === 3 ? Math.round(episode.prizePurseUsd * 0.15) : 0);
      } else if (starsEarned > (prevRec?.stars ?? 0)) {
        prizeDeltaUsd = Math.round(episode.prizePurseUsd * 0.15);
      } else {
        prizeDeltaUsd = Math.round(episode.prizePurseUsd * 0.1);
      }
    }

    const nextRecord: EpisodeProgressRecord = {
      episodeId: episode.episodeId,
      cleared: Boolean(prevRec?.cleared || input.won),
      stars: Math.max(prevRec?.stars ?? 0, starsEarned) as 0 | 1 | 2 | 3,
      bestScore: Math.max(prevRec?.bestScore ?? 0, Math.max(0, Math.round(input.playerScore))),
      bestRivalScore: Math.max(
        prevRec?.bestRivalScore ?? 0,
        Math.max(0, Math.round(input.rivalScore ?? 0)),
      ),
      bestWedgesCount: Math.max(
        prevRec?.bestWedgesCount ?? 0,
        Math.max(0, Math.min(6, Math.trunc(input.wedgesEarned ?? 0))),
      ),
      attempts: (prevRec?.attempts ?? 0) + 1,
      wins: (prevRec?.wins ?? 0) + (input.won ? 1 : 0),
      peakAudienceOnEpisode: Math.max(prevRec?.peakAudienceOnEpisode ?? 0, episodePeakAudience),
      prizeEarnedUsd: (prevRec?.prizeEarnedUsd ?? 0) + prizeDeltaUsd,
      firstClearedAtIso: prevRec?.firstClearedAtIso ?? (input.won ? nowIso : null),
      lastPlayedAtIso: nowIso,
    };

    const unlockedSet = new Set(current.unlockedEpisodeIds);
    unlockedSet.add(episode.episodeId);
    let newlyUnlockedEpisodeId: string | null = null;
    if (input.won) {
      const nextEpId = getNextEpisodeId(episode.episodeId);
      if (nextEpId && !unlockedSet.has(nextEpId)) {
        unlockedSet.add(nextEpId);
        newlyUnlockedEpisodeId = nextEpId;
      }
    }

    const defeatedSet = new Set(current.defeatedChallengerIds);
    if (input.won && episode.challengerId && episode.episodeInTier === 4) {
      defeatedSet.add(episode.challengerId);
    }

    const mergedHeadlines = input.headlines?.length
      ? [...input.headlines, ...current.headlineFeed].slice(0, MAX_HEADLINE_FEED_ITEMS)
      : current.headlineFeed;

    const newTotalCareerPrizeUsd = current.totalCareerPrizeUsd + prizeDeltaUsd;
    const nextState: WorldTourSlotState = {
      ...current,
      unlockedEpisodeIds: Array.from(unlockedSet),
      episodeRecords: {
        ...current.episodeRecords,
        [episode.episodeId]: nextRecord,
      },
      currentWorldAudience: newWorldAudience,
      peakWorldAudience: newPeakWorldAudience,
      totalCareerPrizeUsd: newTotalCareerPrizeUsd,
      headlineFeed: mergedHeadlines,
      defeatedChallengerIds: Array.from(defeatedSet),
      updatedAtIso: nowIso,
    };

    this.writeSlot(nextState);
    if (nextState.slotId === this.getActiveSlotId()) {
      this.notify(nextState);
    }

    return {
      episode,
      won: input.won,
      starsEarned,
      isFirstClear,
      newlyUnlockedEpisodeId,
      viewerDelta,
      newWorldAudience,
      prizeDeltaUsd,
      newTotalCareerPrizeUsd,
      slotState: nextState,
    };
  }

  public appendHeadlines(
    headlines: readonly HeadlineClipping[],
    slotId?: WorldTourSlotId,
  ): WorldTourSlotState {
    if (!headlines.length) return this.getSnapshot(slotId);
    const current = this.getSnapshot(slotId);
    const nextState: WorldTourSlotState = {
      ...current,
      headlineFeed: [...headlines, ...current.headlineFeed].slice(0, MAX_HEADLINE_FEED_ITEMS),
      updatedAtIso: new Date().toISOString(),
    };
    this.writeSlot(nextState);
    if (nextState.slotId === this.getActiveSlotId()) {
      this.notify(nextState);
    }
    return nextState;
  }

  public listAllSlotSummaries(): WorldTourSlotSummary[] {
    const active = this.getActiveSlotId();
    return ALL_WORLD_TOUR_SLOT_IDS.map((slotId) => {
      const saved = this.readSlot(slotId);
      if (!saved) {
        const tier1 = getTierMeta(1);
        return {
          slotId,
          isEmpty: true,
          isActive: slotId === active,
          contestantName: 'Empty Slot',
          clearedEpisodesCount: 0,
          totalEpisodesCount: TOTAL_WORLD_TOUR_EPISODES,
          totalStars: 0,
          maxStars: MAX_WORLD_TOUR_STARS,
          currentTierNumber: 1,
          currentVenueName: tier1.venueName,
          currentWorldAudience: 42,
          totalCareerPrizeUsd: 0,
          updatedAtIso: null,
        };
      }
      const records = Object.values(saved.episodeRecords);
      const clearedEpisodesCount = records.filter((r) => r.cleared).length;
      const totalStars = records.reduce((acc, r) => acc + r.stars, 0);
      const nextEp = this.getNextPlayableEpisode(slotId);
      return {
        slotId,
        isEmpty: false,
        isActive: slotId === active,
        contestantName: saved.contestantName,
        clearedEpisodesCount,
        totalEpisodesCount: TOTAL_WORLD_TOUR_EPISODES,
        totalStars,
        maxStars: MAX_WORLD_TOUR_STARS,
        currentTierNumber: nextEp.tierNumber,
        currentVenueName: nextEp.venueName,
        currentWorldAudience: saved.currentWorldAudience,
        totalCareerPrizeUsd: saved.totalCareerPrizeUsd,
        updatedAtIso: saved.updatedAtIso,
      };
    });
  }

  public resetSlot(slotId?: WorldTourSlotId, keepName = false): WorldTourSlotState {
    const targetSlot = isValidSlotId(slotId) ? slotId : this.getActiveSlotId();
    const existingName = keepName ? this.getSnapshot(targetSlot).contestantName : 'Challenger';
    this.memorySlots.delete(targetSlot);
    this.removeRaw(slotStorageKey(targetSlot));
    const fresh = createFreshSlotState(targetSlot, existingName);
    if (keepName) {
      this.writeSlot(fresh);
    }
    if (targetSlot === this.getActiveSlotId()) {
      this.notify(fresh);
    }
    return fresh;
  }
}

export const worldTourProgressStore = new WorldTourProgressStore();
