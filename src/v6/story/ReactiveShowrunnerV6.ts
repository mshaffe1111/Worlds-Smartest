// ============================================================================
// WORLD'S SMARTEST v6.0 — ReactiveShowrunnerV6.ts
// Hades-Style Priority-Bucket Backstage Dramedy & Live Broadcast Quip Engine
// - Season Conspiracy: "Clause 14-B" across 10 Stage Worlds (20 Episodes)
// - Strict Anti-Wall-of-Text Law:
//     * On-Stage Live Broadcast Quips: 1 line, <= 14 words
//     * Backstage Prop Trunk Micro-Scenes: max 2 lines, <= 22 words each
// - Zero AI buzzwords, zero tutorial-mouthing, zero repeat spam
// ============================================================================

import type {
  BoardTwistMutationIdV6,
  MatchEventMemoryV6,
  ReactiveDialogueBeatV6,
  StageWorldIdV6,
} from '../contracts_v6.ts';
import {
  type CastMonitorBadgeHandleV6,
  type CastPortraitKeyV6,
  type CastPortraitMoodV6,
  getCastPortraitPalette,
  mountCastMonitorBadge,
  resolvePortraitKeyForSpeaker,
} from './StageCastPortraitsV6.ts';

export type StageChampionIdV6 =
  | 'rival_01_barnaby'
  | 'rival_02_sabine'
  | 'rival_03_mireille'
  | 'rival_04_alistair'
  | 'rival_05_walter'
  | 'rival_06_kenzo'
  | 'rival_07_delilah'
  | 'rival_08_henrik'
  | 'rival_09_nadia'
  | 'rival_10_arthur';

export type LiveBroadcastQuipEventV6 =
  | 'gear_align_x3'
  | 'twist_blackout'
  | 'twist_gravity_inversion'
  | 'twist_blind_auction'
  | 'twist_chain_fuse'
  | 'twist_rising_flood'
  | 'twist_double_agent_mole'
  | 'twist_split_or_steal'
  | 'twist_mirror_twin'
  | 'twist_magnetic_repulsor'
  | 'twist_cursed_decay'
  | 'twist_overclock'
  | 'twist_fog_jammer'
  | 'twist_golden_bounty'
  | 'twist_sudden_trapdoor'
  | 'twist_ricochet_laser'
  | 'twist_high_voltage'
  | 'twist_generic'
  | 'screw_rival'
  | 'rival_screws_player'
  | 'trapdoor_drop'
  | 'trapdoor_escape'
  | 'trapdoor_clutch_escape'
  | 'trapdoor_fail'
  | 'wire_snip_safe'
  | 'wire_snip_wrong'
  | 'globe_bullseye'
  | 'globe_way_off'
  | 'cryptex_cracked'
  | 'hosts_lie_caught'
  | 'hosts_lie_missed'
  | 'blackjack_21'
  | 'blackjack_bust'
  | 'streak_3'
  | 'streak_5'
  | 'chain_shattered'
  | 'lead_taken'
  | 'final_turn'
  | 'match_win'
  | 'match_loss'
  | 'rival_intro'
  | 'rival_screw'
  | 'rival_defeat'
  | 'rival_victory';

export interface CoreCastProfileV6 {
  speakerId: 'JULIAN' | 'FRANKIE' | 'SLOANE';
  displayName: string;
  shortName: string;
  roleTag: string;
  signatureAccentHex: string;
  portraitKey: CastPortraitKeyV6;
}

export interface StageChampionProfileV6 {
  championId: StageChampionIdV6;
  stageWorldId: StageWorldIdV6;
  stageNumber: number;
  displayName: string;
  shortName: string;
  roleTag: string;
  comicFlaw: string;
  tacticalTell: string;
  screwHabit: string;
  signatureAccentHex: string;
  portraitKey: CastPortraitKeyV6;
  introQuip: string;
  screwQuip: string;
  defeatQuip: string;
  victoryQuip: string;
}

export interface BeatConditionRulesV6 {
  minEpisode?: number;
  maxEpisode?: number;
  stageWorldId?: StageWorldIdV6;
  requiresWin?: boolean;
  requiresLoss?: boolean;
  minBankroll?: number;
  maxBankroll?: number;
  minStreak?: number;
  minTrapdoorSurvivals?: number;
}

export interface ExtendedDialogueBeatV6 extends ReactiveDialogueBeatV6 {
  stageWorldId?: StageWorldIdV6;
  episodeNumber?: number;
  rivalId?: StageChampionIdV6;
  replySpeakerId?: 'FRANKIE' | 'JULIAN' | 'SLOANE' | 'RIVAL';
  replySpeakerDisplayName?: string;
  replySpeakerRoleTag?: string;
  mood?: CastPortraitMoodV6;
  conditions?: BeatConditionRulesV6;
}

export interface DramedyScriptBundleV6 {
  schemaVersion: string;
  seasonTitle: string;
  seasonPremise: string;
  coreCast: Record<'JULIAN' | 'FRANKIE' | 'SLOANE', CoreCastProfileV6>;
  stageChampions: StageChampionProfileV6[];
  episodeArcBeats: ExtendedDialogueBeatV6[];
  reactiveMemoryBeats: ExtendedDialogueBeatV6[];
  liveBroadcastQuips: ExtendedDialogueBeatV6[];
}

export interface BackstageSelectionContextV6 {
  stageWorldId?: StageWorldIdV6;
  trapdoorSecondsLeft?: number;
  justUnlockedTrophyId?: string;
  justBoughtContrabandRelic?: boolean;
  justWonSeasonFinale?: boolean;
  extraTags?: string[];
}

export interface LiveQuipContextV6 {
  stageWorldId?: StageWorldIdV6;
  episodeNumber?: number;
  preferRival?: boolean;
}

export interface BackstageMicroSceneExchangeV6 {
  speakerId: 'FRANKIE' | 'JULIAN' | 'SLOANE' | 'RIVAL';
  displayName: string;
  roleTag: string;
  portraitKey: CastPortraitKeyV6;
  accentHex: string;
  mood: CastPortraitMoodV6;
  line: string;
}

export interface DialogueBannerHandleV6 {
  root: HTMLElement;
  destroy(): void;
}

const STAGE_WORLD_ORDER: StageWorldIdV6[] = [
  'STAGE_01_VAUDEVILLE_PALACE',
  'STAGE_02_GENEVA_CONSERVATORY',
  'STAGE_03_MONTE_CARLO_SALON',
  'STAGE_04_CARTOGRAPHIC_ROTUNDA',
  'STAGE_05_ANALOG_BUNKER_1969',
  'STAGE_06_KYOTO_LACQUER_PAVILION',
  'STAGE_07_CARNIVAL_CURIOSITIES',
  'STAGE_08_SUNKEN_BATHYSPHERE',
  'STAGE_09_ASTRAL_OBSERVATORY',
  'STAGE_10_SOVEREIGN_COLOSSEUM',
];

const SEEN_STORAGE_KEY = 'ws_v6_showrunner_seen_beats_v1';
const DEFAULT_SCRIPT_URL = './data/v6/backstage_dramedy_script_v6.json';
const CONTRABAND_KEYWORDS = ['contraband', 'rigged', 'loaded', 'hot_mic', 'trapdoor', 'smuggled', 'blackmarket'];

const FALLBACK_CORE_CAST: Record<'JULIAN' | 'FRANKIE' | 'SLOANE', CoreCastProfileV6> = {
  JULIAN: {
    speakerId: 'JULIAN',
    displayName: 'Julian Sterling',
    shortName: 'Julian',
    roleTag: '30-Year Host',
    signatureAccentHex: '#D9A441',
    portraitKey: 'julian_sterling',
  },
  FRANKIE: {
    speakerId: 'FRANKIE',
    displayName: 'Frankie "The Fixer" DeLuca',
    shortName: 'Frankie',
    roleTag: 'Local 52 Prop Master',
    signatureAccentHex: '#C85A32',
    portraitKey: 'frankie_deluca',
  },
  SLOANE: {
    speakerId: 'SLOANE',
    displayName: 'Sloane Mercer',
    shortName: 'Sloane',
    roleTag: 'VP Standards & Ratings',
    signatureAccentHex: '#4C8FA8',
    portraitKey: 'sloane_mercer',
  },
};

const FALLBACK_CHAMPIONS: StageChampionProfileV6[] = [
  {
    championId: 'rival_01_barnaby',
    stageWorldId: 'STAGE_01_VAUDEVILLE_PALACE',
    stageNumber: 1,
    displayName: 'Barnaby "Two-Takes" Vance',
    shortName: 'Barnaby Vance',
    roleTag: '1987 Soap-Opera Runner-Up',
    comicFlaw: 'Treats every trivia round like a Broadway revival and refuses right-profile camera angles.',
    tacticalTell: 'Hogs center-stage tiles so Camera One stays on his left clavicle.',
    screwHabit: 'Slams a Screw card the instant the audience laughs at someone else\'s joke.',
    signatureAccentHex: '#B83A4B',
    portraitKey: 'rival_01_barnaby',
    introQuip: 'Kindly keep to my right. My left clavicle is union-insured.',
    screwQuip: 'You stepped on my applause line. Enjoy the sabotage, darling.',
    defeatQuip: 'Terrible lighting. Tell my agent the teleprompter had glare.',
    victoryQuip: 'Still got it. Hold the curtain—I have three encores prepared.',
  },
  {
    championId: 'rival_02_sabine',
    stageWorldId: 'STAGE_02_GENEVA_CONSERVATORY',
    stageNumber: 2,
    displayName: 'Dr. Sabine Vogt',
    shortName: 'Dr. Sabine Vogt',
    roleTag: 'Ex-CERN Master Horologist',
    comicFlaw: 'Measures human worth in milliseconds and visibly twitches at imprecise metaphors.',
    tacticalTell: 'Locks concentric gear rings early to force mathematically rigid tie states.',
    screwHabit: 'Triggers Screw cards exclusively on exact fifteen-second clock intervals.',
    signatureAccentHex: '#D49B7A',
    portraitKey: 'rival_02_sabine',
    introQuip: 'You arrived four hundred milliseconds late. Already sloppy.',
    screwQuip: 'Fifteen-second mark. Your rhythm was offending the escapement.',
    defeatQuip: 'Statistical noise. My Swiss chronometer still outranks your pulse.',
    victoryQuip: 'Predictable to the hundredth of a second. Next specimen, please.',
  },
  {
    championId: 'rival_03_mireille',
    stageWorldId: 'STAGE_03_MONTE_CARLO_SALON',
    stageNumber: 3,
    displayName: 'Countess Mireille de Valois',
    shortName: 'Countess Mireille',
    roleTag: 'Disinherited Riviera Heiress',
    comicFlaw: 'Pretends not to recognize paper cash while aggressively counting your chip stack under the felt.',
    tacticalTell: 'Over-bets Blackjack and push-your-luck felt tiles to bait greedy busts past 21.',
    screwHabit: 'Drops velvet-gloved Screws while ordering vintage champagne on Meridian\'s corporate tab.',
    signatureAccentHex: '#2F9E77',
    portraitKey: 'rival_03_mireille',
    introQuip: 'How quaint—you still carry paper money in your pocket.',
    screwQuip: 'Waiter, another bottle on Network Legal, and freeze their felt.',
    defeatQuip: 'Vulgar luck. Do not ask me to split the valet tip.',
    victoryQuip: 'My yacht club will accept these chips by Tuesday, darling.',
  },
  {
    championId: 'rival_04_alistair',
    stageWorldId: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    stageNumber: 4,
    displayName: 'Capt. Alistair Finch-Harrow',
    shortName: 'Capt. Finch-Harrow',
    roleTag: 'Disputed Expedition Author',
    comicFlaw: 'Brags about surviving jungle fever on an Amazon trek quietly filmed in New Jersey.',
    tacticalTell: 'Claims perimeter compass tiles to seal off your navigation routes early.',
    screwHabit: 'Screws vindictively whenever a geography clue exposes his 1954 atlas.',
    signatureAccentHex: '#3A8D8C',
    portraitKey: 'rival_04_alistair',
    introQuip: 'I crossed worse terrain near the Amazon—mostly off Exit Eleven.',
    screwQuip: 'Check my memoirs, chapter four. Now take that detoured route.',
    defeatQuip: 'Cartographic slander. Those borders were completely accurate in fifty-four.',
    victoryQuip: 'Another fine afternoon for rugged field science and brisk tailoring.',
  },
  {
    championId: 'rival_05_walter',
    stageWorldId: 'STAGE_05_ANALOG_BUNKER_1969',
    stageNumber: 5,
    displayName: 'Walter "Redline" Kowalski',
    shortName: 'Walter Kowalski',
    roleTag: 'Sub-Level 5 Radar Squatter',
    comicFlaw: 'Lives rent-free in the 1969 bunker and believes the breakroom microwave reads dental fillings.',
    tacticalTell: 'Rotates optical laser mirrors out of line and camps high-voltage radar sectors.',
    screwHabit: 'Fires Blackout or Fog Jammer Screws the moment you hit a three-streak.',
    signatureAccentHex: '#D9792B',
    portraitKey: 'rival_05_walter',
    introQuip: 'Keep your shoes off my linoleum. I just waxed sector four.',
    screwQuip: 'Cutting the busbar. Let\'s see your fillings read in the dark.',
    defeatQuip: 'Fine. Take the points, leave my nineteen-seventy-one soup thermos alone.',
    victoryQuip: 'Thirty-year lease holds. Now climb back upstairs, tourist.',
  },
  {
    championId: 'rival_06_kenzo',
    stageWorldId: 'STAGE_06_KYOTO_LACQUER_PAVILION',
    stageNumber: 6,
    displayName: 'Kenzo Taniguchi',
    shortName: 'Kenzo Taniguchi',
    roleTag: 'Michelin-Snubbed Critic',
    comicFlaw: 'Critiques opponents\' answers like lukewarm soup while pruning a travel bonsai at his podium.',
    tacticalTell: 'Builds silent stone bridges straight through the center to slice your territory.',
    screwHabit: 'Holds his silence until Turn 5, then drops a surgical iron-chain Screw.',
    signatureAccentHex: '#C73E2D',
    portraitKey: 'rival_06_kenzo',
    introQuip: 'Your last answer tasted over-salted and deeply derivative.',
    screwQuip: 'A necessary reduction. Your board lacked balance anyway.',
    defeatQuip: 'Two stars at best. Service was rushed, lighting was loud.',
    victoryQuip: 'Clean finish. Send my compliments to nobody in this room.',
  },
  {
    championId: 'rival_07_delilah',
    stageWorldId: 'STAGE_07_CARNIVAL_CURIOSITIES',
    stageNumber: 7,
    displayName: 'Delilah "Nickel-Slot" Kerr',
    shortName: 'Delilah Kerr',
    roleTag: 'Blacklisted Pier Hustler',
    comicFlaw: 'Compulsively pockets studio props and blames coastal fog every time a ball bounces funny.',
    tacticalTell: 'Targets kinetic chaos—pinball bumpers, moving tin ducks, and Ferris gondolas.',
    screwHabit: 'Slams Screw cards mid-drop solely to spoil your split-second reflex window.',
    signatureAccentHex: '#D48834',
    portraitKey: 'rival_07_delilah',
    introQuip: 'Check your pockets before we start, sugar. Just friendly advice.',
    screwQuip: 'Oops—coastal damp tilted your bumper. Happens every Tuesday.',
    defeatQuip: 'Keep the trophy, kid. I already pocketed Julian\'s cufflink.',
    victoryQuip: 'Boardwalk rules, sweetheart. Never blink at the copper duck.',
  },
  {
    championId: 'rival_08_henrik',
    stageWorldId: 'STAGE_08_SUNKEN_BATHYSPHERE',
    stageNumber: 8,
    displayName: 'Dr. Henrik Lindholm',
    shortName: 'Dr. Henrik Lindholm',
    roleTag: 'Tax-Exile Deep-Sea Salvager',
    comicFlaw: 'Narrates himself in hushed documentary whispers while nervously checking the leaking bilge seam.',
    tacticalTell: 'Hoards pressure-locked vaults while letting the rising flood swallow your safe tiles.',
    screwHabit: 'Saves Screws for low-clock turns to shove you straight into the Trapdoor.',
    signatureAccentHex: '#3A88A8',
    portraitKey: 'rival_08_henrik',
    introQuip: 'Observe the amateur—unaware the hull pressure already favors me.',
    screwQuip: 'Nature is cruel at three hundred fathoms, and so is Maritime Law.',
    defeatQuip: 'Unfortunate. Also, nobody tell the Swedish Revenue Service I was here.',
    victoryQuip: 'The sea keeps its secrets. Especially my offshore shell accounts.',
  },
  {
    championId: 'rival_09_nadia',
    stageWorldId: 'STAGE_09_ASTRAL_OBSERVATORY',
    stageNumber: 9,
    displayName: 'Nadia Okafor-Voss',
    shortName: 'Nadia Okafor-Voss',
    roleTag: 'Banned Academic Menace',
    comicFlaw: 'Corrects Julian\'s Latin pronunciation on live TV and considers small talk a concussion symptom.',
    tacticalTell: 'Snipes quantum-entangled star nodes before you can chain a multiplier.',
    screwHabit: 'Deploys clinical Screws the exact millisecond your multiplier crosses three.',
    signatureAccentHex: '#7A62D4',
    portraitKey: 'rival_09_nadia',
    introQuip: 'Skip the handshake. Your opening strategy already has two logical fallacies.',
    screwQuip: 'Multiplier corrected downward. Please stop breathing near the prism.',
    defeatQuip: 'An irritating outlier. I expect a peer-reviewed rematch by Friday.',
    victoryQuip: 'As modeled. Three university deans cried faster than you did.',
  },
  {
    championId: 'rival_10_arthur',
    stageWorldId: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    stageNumber: 10,
    displayName: 'Arthur "The Archivist" Pendelton',
    shortName: 'Arthur Pendelton',
    roleTag: '1994 Retainer Closer',
    comicFlaw: 'Memorized every encyclopedia through 1998 and remains quietly furious that Pluto lost planet status.',
    tacticalTell: 'Plays every twist like tournament chess—baits Split-or-Steal traps and chains the apex.',
    screwHabit: 'Apologizes with immaculate gentlemanly grace half a second before ruining your turn.',
    signatureAccentHex: '#E3B84F',
    portraitKey: 'rival_10_arthur',
    introQuip: 'Thirty years on retainer, and they send a parking-deck walk-in. Fascinating.',
    screwQuip: 'Terribly sorry—nothing personal. My penthouse lease prefers your defeat.',
    defeatQuip: 'Well played. Tell Sloane I am keeping the silver tea service.',
    victoryQuip: 'The retainer remains intact. Also, Pluto is still a planet.',
  },
];

const FALLBACK_SCRIPT_BUNDLE: DramedyScriptBundleV6 = {
  schemaVersion: '6.0.0-fallback',
  seasonTitle: 'Clause 14-B',
  seasonPremise:
    'Meridian Network greenlit ten condemned soundstages as a $180M tax write-off, but FCC Bond 14-B forbids cancelling once ON AIR.',
  coreCast: FALLBACK_CORE_CAST,
  stageChampions: FALLBACK_CHAMPIONS,
  episodeArcBeats: [
    {
      beatId: 'ep_01_cold_open',
      episodeNumber: 1,
      stageWorldId: 'STAGE_01_VAUDEVILLE_PALACE',
      speakerId: 'SLOANE',
      speakerDisplayName: 'Sloane Mercer',
      speakerRoleTag: 'VP Standards & Ratings',
      replySpeakerId: 'JULIAN',
      replySpeakerDisplayName: 'Julian Sterling',
      replySpeakerRoleTag: '30-Year Host',
      triggerTags: ['ep_01', 'stage_01'],
      priority: 100,
      mood: 'icy',
      lines: [
        'HR says you walked in for parking validation. Smile at Camera Two, trespasser.',
        'They\'re standing in my key light, Sloane. Have security slide them six inches left.',
      ],
    },
  ],
  reactiveMemoryBeats: [
    {
      beatId: 'evergreen_cue_cards_1',
      speakerId: 'JULIAN',
      speakerDisplayName: 'Julian Sterling',
      speakerRoleTag: '30-Year Host',
      replySpeakerId: 'FRANKIE',
      replySpeakerDisplayName: 'Frankie "The Fixer" DeLuca',
      replySpeakerRoleTag: 'Local 52 Prop Master',
      triggerTags: ['evergreen', 'backstage_idle'],
      priority: 30,
      mood: 'annoyed',
      lines: [
        'Card Seven tells me to smile warmly like a trustworthy uncle. I have zero nephews.',
        'Better than yesterday\'s card, Julian—Standards tried to spell your name with a G.',
      ],
    },
  ],
  liveBroadcastQuips: [
    {
      beatId: 'quip_gear_x3_1',
      speakerId: 'JULIAN',
      speakerDisplayName: 'Julian Sterling',
      speakerRoleTag: '30-Year Host',
      triggerTags: ['gear_align_x3'],
      priority: 75,
      lines: ['Three brass rings aligned. Accounting just spilled scotch on the carpet.'],
    },
    {
      beatId: 'quip_twist_blackout_1',
      speakerId: 'SLOANE',
      speakerDisplayName: 'Sloane Mercer',
      speakerRoleTag: 'VP Standards & Ratings',
      triggerTags: ['twist_blackout', 'BLACKOUT_SPOTLIGHT'],
      priority: 80,
      lines: ['Routine power conservation. Please enjoy your sudden lack of visibility.'],
    },
    {
      beatId: 'quip_screw_rival_1',
      speakerId: 'FRANKIE',
      speakerDisplayName: 'Frankie "The Fixer" DeLuca',
      speakerRoleTag: 'Local 52 Prop Master',
      triggerTags: ['screw_rival'],
      priority: 82,
      lines: ['Oh, that\'s petty. Keep doing it—Legal hates the paperwork.'],
    },
    {
      beatId: 'quip_trapdoor_drop_1',
      speakerId: 'SLOANE',
      speakerDisplayName: 'Sloane Mercer',
      speakerRoleTag: 'VP Standards & Ratings',
      triggerTags: ['trapdoor_drop'],
      priority: 85,
      lines: ['Congratulations on your voluntary vertical relocation to Sub-Level Pit B.'],
    },
    {
      beatId: 'quip_twist_generic_1',
      speakerId: 'SLOANE',
      speakerDisplayName: 'Sloane Mercer',
      speakerRoleTag: 'VP Standards & Ratings',
      triggerTags: ['twist_generic'],
      priority: 70,
      lines: ['Mid-match compliance adjustment active. Thank you for remaining insured.'],
    },
  ],
};

let bannerStylesInjected = false;

export function getStageWorldForEpisode(episodeNumber: number): StageWorldIdV6 {
  const clamped = Math.max(1, Math.min(20, Math.floor(episodeNumber || 1)));
  const stageIdx = Math.floor((clamped - 1) / 2);
  return STAGE_WORLD_ORDER[stageIdx] ?? 'STAGE_01_VAUDEVILLE_PALACE';
}

export function getStageNumberForWorld(stageWorldId: StageWorldIdV6): number {
  const idx = STAGE_WORLD_ORDER.indexOf(stageWorldId);
  return idx >= 0 ? idx + 1 : 1;
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
}

function padTwo(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export class ReactiveShowrunnerV6 {
  private bundle: DramedyScriptBundleV6 = FALLBACK_SCRIPT_BUNDLE;
  private loadPromise: Promise<DramedyScriptBundleV6> | null = null;
  private isHydrated = false;
  private playedBeatIds = new Set<string>();
  private recentQuipIds: string[] = [];
  private readonly maxRecentQuips = 16;

  constructor(initialBundle?: DramedyScriptBundleV6) {
    if (initialBundle) {
      this.bundle = initialBundle;
      this.isHydrated = true;
    }
    this.restorePlayedBeatsFromStorage();
  }

  /**
   * Asynchronously fetches and hydrates the full 20-episode dramedy script JSON.
   * Deduplicates concurrent calls and falls back cleanly offline.
   */
  public loadScript(url = DEFAULT_SCRIPT_URL): Promise<DramedyScriptBundleV6> {
    if (this.isHydrated) {
      return Promise.resolve(this.bundle);
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }
    if (typeof fetch !== 'function') {
      return Promise.resolve(this.bundle);
    }

    this.loadPromise = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<DramedyScriptBundleV6>;
      })
      .then((data) => {
        if (data && Array.isArray(data.stageChampions) && Array.isArray(data.episodeArcBeats)) {
          this.bundle = data;
          this.isHydrated = true;
        }
        return this.bundle;
      })
      .catch(() => this.bundle)
      .finally(() => {
        this.loadPromise = null;
      });

    return this.loadPromise;
  }

  public isScriptLoaded(): boolean {
    return this.isHydrated;
  }

  public getSeasonMeta(): { title: string; premise: string; version: string } {
    return {
      title: this.bundle.seasonTitle,
      premise: this.bundle.seasonPremise,
      version: this.bundle.schemaVersion,
    };
  }

  public getCoreCastProfile(speakerId: 'JULIAN' | 'FRANKIE' | 'SLOANE'): CoreCastProfileV6 {
    return this.bundle.coreCast[speakerId] ?? FALLBACK_CORE_CAST[speakerId];
  }

  public getAllStageChampions(): StageChampionProfileV6[] {
    return this.bundle.stageChampions.slice();
  }

  public getStageChampionForStage(stageWorldId: StageWorldIdV6): StageChampionProfileV6 {
    return (
      this.bundle.stageChampions.find((c) => c.stageWorldId === stageWorldId) ??
      FALLBACK_CHAMPIONS[0]
    );
  }

  public getStageChampionForEpisode(episodeNumber: number): StageChampionProfileV6 {
    return this.getStageChampionForStage(getStageWorldForEpisode(episodeNumber));
  }

  /**
   * Hades-style Priority-Bucket Backstage Selector.
   * Inspects MatchEventMemoryV6 + optional immediate context (Stage World,
   * Trapdoor margin, Trophy unlock, Contraband Relic purchase) and picks the
   * highest-priority unseen micro-scene (strictly <= 2 lines, <= 22 words/line).
   */
  public selectBackstageBeat(
    memory: MatchEventMemoryV6,
    context: BackstageSelectionContextV6 = {},
  ): ExtendedDialogueBeatV6 {
    const episodeNum = Math.max(1, Math.min(20, Math.floor(memory.episodeNumber || 1)));
    const stageWorldId = context.stageWorldId ?? getStageWorldForEpisode(episodeNum);
    const stageNum = getStageNumberForWorld(stageWorldId);

    const activeTags = this.deriveMemoryTags(memory, context, episodeNum, stageWorldId, stageNum);
    const allBackstageBeats: ExtendedDialogueBeatV6[] = [
      ...this.bundle.episodeArcBeats,
      ...this.bundle.reactiveMemoryBeats,
    ];

    const scored: Array<{ beat: ExtendedDialogueBeatV6; score: number }> = [];

    for (const beat of allBackstageBeats) {
      if (this.playedBeatIds.has(beat.beatId)) continue;
      if (!this.matchesConditions(beat, memory, stageWorldId, episodeNum)) continue;

      const matchCount = this.countTagMatches(beat.triggerTags, activeTags);
      if (matchCount === 0) continue;

      // Exact priority bucket + specificity bonus for multi-tag matches
      let score = beat.priority + Math.min(4, matchCount - 1) * 1.5;

      // Keep episode milestone beats locked cleanly to their episode unless finale won
      if (beat.episodeNumber !== undefined && beat.episodeNumber !== episodeNum) {
        continue;
      }
      if (beat.stageWorldId && beat.stageWorldId !== stageWorldId) {
        continue;
      }

      // Slight preference for specific play reactions when player already saw the current ep intro
      if (beat.priority >= 80 && beat.priority < 100 && matchCount > 0) {
        score += 1;
      }

      scored.push({ beat, score });
    }

    if (scored.length > 0) {
      scored.sort((a, b) => b.score - a.score);
      const topScore = scored[0].score;
      const topTier = scored.filter((item) => item.score >= topScore - 1.0);
      const chosen = topTier[Math.floor(Math.random() * topTier.length)].beat;
      this.markBeatPlayed(chosen.beatId);
      return chosen;
    }

    // Graceful evergreen recycle if player has exhausted every single backstage beat
    const evergreenPool = this.bundle.reactiveMemoryBeats.filter((b) =>
      b.triggerTags.some((t) => normalizeTag(t) === 'evergreen'),
    );
    const fallbackPool = evergreenPool.length > 0 ? evergreenPool : this.bundle.reactiveMemoryBeats;
    const chosen = fallbackPool[Math.floor(Math.random() * fallbackPool.length)] ?? FALLBACK_SCRIPT_BUNDLE.reactiveMemoryBeats[0];
    return chosen;
  }

  /**
   * Selects a snappy 1-line (<= 14 words) On-Stage Live Broadcast Quip for
   * real-time match moments (x3 gears, Blackout Twist, Screw, Trapdoor, Rival).
   */
  public selectLiveQuip(
    eventTag: LiveBroadcastQuipEventV6 | BoardTwistMutationIdV6 | string,
    context: LiveQuipContextV6 = {},
  ): ReactiveDialogueBeatV6 {
    const stageWorldId =
      context.stageWorldId ??
      (context.episodeNumber ? getStageWorldForEpisode(context.episodeNumber) : 'STAGE_01_VAUDEVILLE_PALACE');
    const champion = this.getStageChampionForStage(stageWorldId);

    const normalized = normalizeTag(eventTag);
    const rawUpper = eventTag.trim().toUpperCase();

    // Direct Stage Champion live-stage lines (intro, screw, defeat, victory)
    if (normalized === 'rival_intro') {
      return this.buildChampionQuipBeat(champion, 'intro', champion.introQuip);
    }
    if (normalized === 'rival_screw' || (normalized === 'rival_screws_player' && context.preferRival)) {
      return this.buildChampionQuipBeat(champion, 'screw', champion.screwQuip);
    }
    if (normalized === 'rival_defeat' || (normalized === 'match_win' && context.preferRival)) {
      return this.buildChampionQuipBeat(champion, 'defeat', champion.defeatQuip);
    }
    if (normalized === 'rival_victory' || (normalized === 'match_loss' && context.preferRival)) {
      return this.buildChampionQuipBeat(champion, 'victory', champion.victoryQuip);
    }

    // Match against curated <= 14-word liveBroadcastQuips
    let candidates = this.bundle.liveBroadcastQuips.filter((q) =>
      q.triggerTags.some((t) => normalizeTag(t) === normalized || t.trim().toUpperCase() === rawUpper),
    );

    // Fallback to generic twist quip if a twist name wasn't explicitly matched
    if (candidates.length === 0 && (normalized.startsWith('twist_') || rawUpper.includes('_'))) {
      candidates = this.bundle.liveBroadcastQuips.filter((q) =>
        q.triggerTags.some((t) => normalizeTag(t) === 'twist_generic'),
      );
    }

    if (candidates.length === 0) {
      candidates = this.bundle.liveBroadcastQuips;
    }

    const fresh = candidates.filter((q) => !this.recentQuipIds.includes(q.beatId));
    const pool = fresh.length > 0 ? fresh : candidates;
    const chosen = pool[Math.floor(Math.random() * pool.length)] ?? FALLBACK_SCRIPT_BUNDLE.liveBroadcastQuips[0];

    this.recordRecentQuip(chosen.beatId);
    return {
      beatId: chosen.beatId,
      speakerId: chosen.speakerId,
      speakerDisplayName: chosen.speakerDisplayName,
      speakerRoleTag: chosen.speakerRoleTag,
      triggerTags: chosen.triggerTags,
      priority: chosen.priority,
      lines: [chosen.lines[0]],
    };
  }

  /**
   * Formats a 1- or 2-line ExtendedDialogueBeatV6 into ready-to-render speaker
   * exchange objects (resolving portrait keys, stage accent colors, and moods).
   */
  public formatMicroSceneExchanges(
    beat: ExtendedDialogueBeatV6,
    stageWorldId?: StageWorldIdV6,
  ): BackstageMicroSceneExchangeV6[] {
    const resolvedStage = stageWorldId ?? beat.stageWorldId;
    const exchanges: BackstageMicroSceneExchangeV6[] = [];

    const firstPortrait = resolvePortraitKeyForSpeaker(beat.speakerId, resolvedStage, beat.rivalId);
    const firstPal = getCastPortraitPalette(firstPortrait);

    exchanges.push({
      speakerId: beat.speakerId,
      displayName: beat.speakerDisplayName,
      roleTag: beat.speakerRoleTag,
      portraitKey: firstPortrait,
      accentHex: firstPal.accentHex,
      mood: beat.mood ?? 'neutral',
      line: beat.lines[0],
    });

    if (beat.lines.length > 1 && beat.lines[1]) {
      const secondSpeakerId = beat.replySpeakerId ?? beat.speakerId;
      const secondPortrait = resolvePortraitKeyForSpeaker(secondSpeakerId, resolvedStage, beat.rivalId);
      const secondPal = getCastPortraitPalette(secondPortrait);
      exchanges.push({
        speakerId: secondSpeakerId,
        displayName: beat.replySpeakerDisplayName ?? beat.speakerDisplayName,
        roleTag: beat.replySpeakerRoleTag ?? beat.speakerRoleTag,
        portraitKey: secondPortrait,
        accentHex: secondPal.accentHex,
        mood: beat.mood ?? 'wry',
        line: beat.lines[1],
      });
    }

    return exchanges;
  }

  public markBeatPlayed(beatId: string): void {
    this.playedBeatIds.add(beatId);
    this.persistPlayedBeatsToStorage();
  }

  public hasPlayedBeat(beatId: string): boolean {
    return this.playedBeatIds.has(beatId);
  }

  public exportPlayedBeatIds(): string[] {
    return Array.from(this.playedBeatIds);
  }

  public importPlayedBeatIds(ids: string[]): void {
    this.playedBeatIds = new Set(ids);
    this.persistPlayedBeatsToStorage();
  }

  public resetSeasonMemory(): void {
    this.playedBeatIds.clear();
    this.recentQuipIds = [];
    this.persistPlayedBeatsToStorage();
  }

  private deriveMemoryTags(
    memory: MatchEventMemoryV6,
    context: BackstageSelectionContextV6,
    episodeNum: number,
    stageWorldId: StageWorldIdV6,
    stageNum: number,
  ): Set<string> {
    const tags = new Set<string>();
    tags.add(`ep_${padTwo(episodeNum)}`);
    tags.add(`stage_${padTwo(stageNum)}`);
    tags.add('evergreen');

    if (context.justWonSeasonFinale || (episodeNum >= 20 && memory.wonLastMatch)) {
      tags.add('ep_20_win');
      tags.add('season_cleared');
    }

    for (const raw of memory.lastActionTags ?? []) {
      const norm = normalizeTag(raw);
      if (norm) tags.add(norm);
    }
    for (const raw of context.extraTags ?? []) {
      const norm = normalizeTag(raw);
      if (norm) tags.add(norm);
    }

    // Trapdoor timing & survival memory
    if (typeof context.trapdoorSecondsLeft === 'number' && context.trapdoorSecondsLeft < 1.5) {
      tags.add('trapdoor_under_1_5s');
      tags.add('trapdoor_clutch');
    }
    if (memory.survivedTrapdoorCount >= 1) {
      tags.add('trapdoor_survived');
      if (memory.wonLastMatch) tags.add('won_after_trapdoor');
    }
    if (memory.survivedTrapdoorCount >= 2) {
      tags.add('trapdoor_repeat');
    }

    // Bankroll & Monte Carlo memory
    if (memory.bankrollCash <= 250) {
      tags.add('low_bankroll');
      if (stageWorldId === 'STAGE_03_MONTE_CARLO_SALON') {
        tags.add('broke_in_monte_carlo');
      }
    } else if (memory.bankrollCash >= 12000) {
      tags.add('high_bankroll');
    }

    // Streak & match outcome memory
    if (memory.maxStreakReached >= 5) {
      tags.add('streak_5_plus');
    }
    if (!memory.wonLastMatch) {
      tags.add('post_loss');
    }

    // Trophy & Contraband Relic memory
    if (context.justUnlockedTrophyId) {
      tags.add('trophy_unlocked');
    }
    if (context.justBoughtContrabandRelic) {
      tags.add('contraband_relic_bought');
    }

    const relics = memory.equippedRelicIds ?? [];
    if (relics.length >= 4) {
      tags.add('full_relic_podium');
    }
    for (const rid of relics) {
      const normRelic = normalizeTag(rid);
      if (normRelic) {
        tags.add(normRelic);
        if (!normRelic.startsWith('relic_')) {
          tags.add(`relic_${normRelic}`);
        }
        if (CONTRABAND_KEYWORDS.some((kw) => normRelic.includes(kw))) {
          tags.add('contraband_relic_equipped');
        }
      }
    }

    return tags;
  }

  private matchesConditions(
    beat: ExtendedDialogueBeatV6,
    memory: MatchEventMemoryV6,
    stageWorldId: StageWorldIdV6,
    episodeNum: number,
  ): boolean {
    const cond = beat.conditions;
    if (!cond) return true;
    if (cond.minEpisode !== undefined && episodeNum < cond.minEpisode) return false;
    if (cond.maxEpisode !== undefined && episodeNum > cond.maxEpisode) return false;
    if (cond.stageWorldId && cond.stageWorldId !== stageWorldId) return false;
    if (cond.requiresWin && !memory.wonLastMatch) return false;
    if (cond.requiresLoss && memory.wonLastMatch) return false;
    if (cond.minBankroll !== undefined && memory.bankrollCash < cond.minBankroll) return false;
    if (cond.maxBankroll !== undefined && memory.bankrollCash > cond.maxBankroll) return false;
    if (cond.minStreak !== undefined && memory.maxStreakReached < cond.minStreak) return false;
    if (
      cond.minTrapdoorSurvivals !== undefined &&
      memory.survivedTrapdoorCount < cond.minTrapdoorSurvivals
    ) {
      return false;
    }
    return true;
  }

  private countTagMatches(triggerTags: string[], activeTags: Set<string>): number {
    let matches = 0;
    for (const t of triggerTags) {
      if (activeTags.has(normalizeTag(t))) {
        matches += 1;
      }
    }
    return matches;
  }

  private buildChampionQuipBeat(
    champion: StageChampionProfileV6,
    kind: string,
    line: string,
  ): ReactiveDialogueBeatV6 {
    return {
      beatId: `${champion.championId}_${kind}`,
      speakerId: 'RIVAL',
      speakerDisplayName: champion.displayName,
      speakerRoleTag: champion.roleTag,
      triggerTags: [`rival_${kind}`, champion.stageWorldId],
      priority: 82,
      lines: [line],
    };
  }

  private recordRecentQuip(beatId: string): void {
    this.recentQuipIds.push(beatId);
    if (this.recentQuipIds.length > this.maxRecentQuips) {
      this.recentQuipIds.shift();
    }
  }

  private restorePlayedBeatsFromStorage(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const raw = window.localStorage.getItem(SEEN_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const id of parsed) {
          if (typeof id === 'string') this.playedBeatIds.add(id);
        }
      }
    } catch {
      // Ignore storage failures in restricted sandboxes
    }
  }

  private persistPlayedBeatsToStorage(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(Array.from(this.playedBeatIds)));
    } catch {
      // Ignore storage failures
    }
  }
}

function ensureDialogueBannerStyles(): void {
  if (bannerStylesInjected || typeof document === 'undefined') return;
  bannerStylesInjected = true;
  const style = document.createElement('style');
  style.id = 'ws-v6-showrunner-banner-styles';
  style.textContent = `
    .ws-v6-quip-lower-third {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 12px 7px 8px;
      background: linear-gradient(180deg, #1E1915 0%, #120F0D 100%);
      border: 1px solid #8A6B37;
      border-left: 3px solid var(--ws-accent, #D9A441);
      border-radius: 10px;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.62);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #F6F0E4;
      max-width: 560px;
      box-sizing: border-box;
    }
    .ws-v6-quip-copy {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .ws-v6-quip-speaker {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--ws-accent, #F3C86A);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ws-v6-quip-line {
      font-size: 13.5px;
      font-weight: 600;
      line-height: 1.25;
      color: #FBF7EE;
    }
    .ws-v6-backstage-strip {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 10px;
      background: linear-gradient(180deg, #211618 0%, #140D0F 100%);
      border: 1px solid #7E5E30;
      border-radius: 12px;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.58);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #F6EFE2;
      box-sizing: border-box;
    }
    .ws-v6-backstage-row {
      display: flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
    }
    .ws-v6-backstage-row--reply {
      padding-top: 6px;
      border-top: 1px solid rgba(217, 164, 65, 0.22);
    }
    .ws-v6-backstage-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1 1 auto;
    }
    .ws-v6-backstage-header {
      display: flex;
      align-items: baseline;
      gap: 6px;
      min-width: 0;
    }
    .ws-v6-backstage-name {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--ws-accent, #F3C86A);
      white-space: nowrap;
    }
    .ws-v6-backstage-role {
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #9E927F;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ws-v6-backstage-line {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.28;
      color: #FAF4E8;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Mounts a compact, zero-scroll On-Stage Live Broadcast Quip lower-third
 * with crisp Retina Broadcast Monitor Portrait (opaque solid bezel, 0 emojis).
 */
export function mountLiveQuipLowerThird(
  container: HTMLElement,
  quip: ReactiveDialogueBeatV6,
  options?: { stageWorldId?: StageWorldIdV6; rivalId?: string; portraitSizePx?: number },
): DialogueBannerHandleV6 {
  ensureDialogueBannerStyles();

  const portraitKey = resolvePortraitKeyForSpeaker(
    quip.speakerId,
    options?.stageWorldId,
    options?.rivalId,
  );
  const pal = getCastPortraitPalette(portraitKey);

  const root = document.createElement('div');
  root.className = 'ws-v6-quip-lower-third';
  root.style.setProperty('--ws-accent', pal.rimHex);

  const badgeHandle: CastMonitorBadgeHandleV6 = mountCastMonitorBadge(root, {
    portraitKey,
    sizePx: options?.portraitSizePx ?? 48,
    speaking: true,
    showNameplate: false,
    compact: true,
  });

  const copy = document.createElement('div');
  copy.className = 'ws-v6-quip-copy';

  const speakerEl = document.createElement('div');
  speakerEl.className = 'ws-v6-quip-speaker';
  speakerEl.textContent = `${quip.speakerDisplayName} · ${quip.speakerRoleTag}`;

  const lineEl = document.createElement('div');
  lineEl.className = 'ws-v6-quip-line';
  lineEl.textContent = quip.lines[0];

  copy.appendChild(speakerEl);
  copy.appendChild(lineEl);
  root.appendChild(copy);
  container.appendChild(root);

  return {
    root,
    destroy() {
      badgeHandle.destroy();
      root.remove();
    },
  };
}

/**
 * Mounts a crisp 1- or 2-exchange Backstage Prop Trunk Micro-Scene strip
 * (strictly zero-scroll, opaque solid bezel, Retina Broadcast Monitor cameos).
 */
export function mountBackstageMicroSceneStrip(
  container: HTMLElement,
  showrunner: ReactiveShowrunnerV6,
  beat: ExtendedDialogueBeatV6,
  options?: { stageWorldId?: StageWorldIdV6; portraitSizePx?: number },
): DialogueBannerHandleV6 {
  ensureDialogueBannerStyles();

  const exchanges = showrunner.formatMicroSceneExchanges(beat, options?.stageWorldId);
  const root = document.createElement('div');
  root.className = 'ws-v6-backstage-strip';

  const badges: CastMonitorBadgeHandleV6[] = [];

  exchanges.forEach((ex, idx) => {
    const row = document.createElement('div');
    row.className = `ws-v6-backstage-row${idx > 0 ? ' ws-v6-backstage-row--reply' : ''}`;
    row.style.setProperty('--ws-accent', ex.accentHex);

    const badge = mountCastMonitorBadge(row, {
      portraitKey: ex.portraitKey,
      sizePx: options?.portraitSizePx ?? 50,
      speaking: idx === exchanges.length - 1,
      mood: ex.mood,
      showNameplate: false,
      compact: true,
    });
    badges.push(badge);

    const textCol = document.createElement('div');
    textCol.className = 'ws-v6-backstage-text';

    const header = document.createElement('div');
    header.className = 'ws-v6-backstage-header';

    const nameEl = document.createElement('span');
    nameEl.className = 'ws-v6-backstage-name';
    nameEl.textContent = ex.displayName;

    const roleEl = document.createElement('span');
    roleEl.className = 'ws-v6-backstage-role';
    roleEl.textContent = ex.roleTag;

    const lineEl = document.createElement('div');
    lineEl.className = 'ws-v6-backstage-line';
    lineEl.textContent = ex.line;

    header.appendChild(nameEl);
    header.appendChild(roleEl);
    textCol.appendChild(header);
    textCol.appendChild(lineEl);
    row.appendChild(textCol);
    root.appendChild(row);
  });

  container.appendChild(root);

  return {
    root,
    destroy() {
      for (const b of badges) b.destroy();
      root.remove();
    },
  };
}
