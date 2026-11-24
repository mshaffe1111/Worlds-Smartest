// ============================================================================
// WORLD'S SMARTEST v5.0 — 20+ Hour Fail-Forward Branching Campaign Engine
// Inspired by Pyre (fail-forward tournament), 80 Days (additive graph state),
// Hades (diegetic mechanic onboarding & keepsakes), and The Queen's Gambit
// (rivals evolving into green-room coaches or grudge saboteurs under sponsors).
// ============================================================================

import type { QuestionFormatV4 } from '../v4/contracts';
import {
  V5_GREENROOM_BACKDROPS,
  V5_STORY_PLATES,
  V5_VENUE_STAGES,
  type BranchingCampaignSaveStateV5,
  type CampaignBracketLaneV5,
  type CampaignNodeV5,
  type ChallengerIdV5,
  type CharmIdV5,
  type DialogueAttitudeV5,
  type EndingIdV5,
  type GreenRoomEraV5,
  type HostPoseV5,
  type InteractiveStorySceneV5,
  type SponsorFactionIdV5,
  type StoryChoiceConsequenceV5,
  type TierNumberV5,
  type VoicedDialogueBeatV5,
} from './contracts_v5';

export type CampaignSlotIdV5 = 1 | 2 | 3 | 4 | 5;

export const ALL_CAMPAIGN_SLOT_IDS_V5: readonly CampaignSlotIdV5[] = [1, 2, 3, 4, 5];
export const CAMPAIGN_SLOT_KEY_PREFIX_V5 = 'ws_v5_campaign_slot_';
export const ACTIVE_CAMPAIGN_SLOT_KEY_V5 = 'ws_v5_active_campaign_slot';

export const DEFAULT_STORY_ACTS_1_2_URL = './data/v5_story_acts_1_2.json';
export const DEFAULT_STORY_ACTS_3_5_URL = './data/v5_story_acts_3_5.json';

export const ALL_CHALLENGER_IDS_V5: readonly ChallengerIdV5[] = [
  'frankie_russo',
  'denise_park',
  'trevor_blake',
  'priya_nair',
  'alistair_finch',
  'kenji_takahashi',
  'nadia_al_mansoor',
  'viktor_volkov',
];

export const ALL_SPONSOR_IDS_V5: readonly SponsorFactionIdV5[] = [
  'INDEPENDENT',
  'APEX_NETWORK',
  'VELVET_SOCIETY',
];

export const ALL_CHARM_IDS_V5: readonly CharmIdV5[] = [
  'frankies_coaster',
  'denises_red_pen',
  'trevors_hot_mic',
  'priyas_adrenaline',
  'alistairs_pocketwatch',
  'kenjis_cyber_link',
  'nadias_astrolabe',
  'grassroots_megaphone',
  'syndicate_golden_dice',
  'velvet_wax_seal',
  'underdog_chip',
  'screw_shield',
];

export const ALL_ENDING_IDS_V5: readonly EndingIdV5[] = [
  'PEOPLES_CHAMPION',
  'NETWORK_SOVEREIGN',
  'VELVET_GRANDMASTER',
  'CINDERELLA_REDEMPTION',
];

export const ALLY_AFFINITY_THRESHOLD_V5 = 25;
export const SWORN_ALLY_AFFINITY_THRESHOLD_V5 = 60;
export const GRUDGE_AFFINITY_THRESHOLD_V5 = -25;
export const NEMESIS_AFFINITY_THRESHOLD_V5 = -60;
export const MAX_EQUIPPED_CHARMS_V5 = 3;
export const MAX_PRESS_CLIPPINGS_V5 = 60;

/**
 * All 14 playable v5 Board Topologies & Live Stage Twists introduced organically
 * by the story engine right before first encounter.
 */
export type BoardTwistIdV5 =
  | 'showcase_starter'
  | 'chain_padlocks'
  | 'spiral_labyrinth'
  | 'pyramid_ascent'
  | 'fog_spotlight'
  | 'time_bomb_hot_potato'
  | 'tug_of_war_turf'
  | 'velvet_x_crossroads'
  | 'spotlight_roulette'
  | 'power_play_minefield'
  | 'ice_fire_columns'
  | 'gold_fever_contagion'
  | 'oxford_pick_ban'
  | 'championship_gauntlet';

export interface CampaignNodeExtendedV5 extends CampaignNodeV5 {
  readonly boardTwistId?: BoardTwistIdV5;
  readonly mechanicsToIntroduce?: readonly string[];
  readonly allyCallSceneId?: string;
  readonly grudgeWarningSceneId?: string;
}

export interface StoryPackPayloadV5 {
  readonly version?: string;
  readonly acts?: readonly number[];
  readonly nodes?: readonly CampaignNodeExtendedV5[];
  readonly scenes?:
    | readonly InteractiveStorySceneV5[]
    | Readonly<Record<string, InteractiveStorySceneV5>>;
  readonly endings?:
    | readonly InteractiveStorySceneV5[]
    | Readonly<Record<string, InteractiveStorySceneV5>>;
}

export type RivalStandingV5 =
  | 'BITTER_NEMESIS'
  | 'GRUDGE'
  | 'RIVAL'
  | 'ALLY'
  | 'SWORN_ALLY';

export interface RivalProfileMetaV5 {
  readonly challengerId: ChallengerIdV5;
  readonly shortKey: string;
  readonly displayName: string;
  readonly nicknameTitle: string;
  readonly tierNumber: TierNumberV5;
  readonly signatureCharmId: CharmIdV5;
  readonly allyCallSceneId: string;
  readonly weakDomainLabel: string;
  readonly allyCoachingTip: string;
  readonly grudgeSabotageKind: ActiveGrudgeSabotageV5['kind'];
  readonly grudgeSabotageTaunt: string;
}

export interface SponsorContractMetaV5 {
  readonly id: SponsorFactionIdV5;
  readonly name: string;
  readonly shortName: string;
  readonly tagline: string;
  readonly purseMultiplier: number;
  readonly dareBonusMultiplier: number;
  readonly audienceMultiplier: number;
  readonly signatureCharmId: CharmIdV5;
  readonly charmUnlockRep: number;
  readonly accentHex: string;
}

export interface DiegeticMechanicBeatV5 {
  readonly mechanicId: string;
  readonly title: string;
  readonly phase: 'COLD_OPEN' | 'ACT_1' | 'BOARD_TWIST';
  readonly triggerTwist?: BoardTwistIdV5;
  readonly triggerFormat?: QuestionFormatV4;
  readonly speaker: VoicedDialogueBeatV5['speaker'];
  readonly speakerName: string;
  readonly speakerRole: string;
  readonly hostPose?: HostPoseV5;
  readonly diegeticLine: string;
  readonly shortCueBanner: string;
  readonly voiceClipId?: string;
}

export interface ActiveGrudgeSabotageV5 {
  readonly sabotageId: string;
  readonly rivalId: ChallengerIdV5;
  readonly rivalName: string;
  readonly kind: 'DOUBLE_BOUNTY_WEAK_DOMAIN' | 'SPONSOR_SMEAR' | 'EARLY_SCREW_AMBUSH';
  readonly targetDomainLabel: string;
  readonly tauntLine: string;
  readonly voiceClipId: string;
  readonly createdAtAct: 1 | 2 | 3 | 4 | 5;
  readonly triggered: boolean;
}

export interface StoryChoiceHistoryEntryV5 {
  readonly sceneId: string;
  readonly attitude: DialogueAttitudeV5;
  readonly label: string;
  readonly challengerId: ChallengerIdV5 | null;
  readonly affinityDelta: number;
  readonly timestampIso: string;
}

export interface BranchingCampaignStateV5 extends BranchingCampaignSaveStateV5 {
  slotId: CampaignSlotIdV5;
  mechanicsIntroduced: string[];
  contractMulligansRemaining: number;
  mulliganUsedOnNodeIds: string[];
  activeGrudgeSabotages: ActiveGrudgeSabotageV5[];
  completedDareIds: string[];
  failedDareIds: string[];
  storyChoiceHistory: StoryChoiceHistoryEntryV5[];
  rivalAllyCallsUnlocked: ChallengerIdV5[];
  rivalGrudgesTriggered: ChallengerIdV5[];
}

export interface CampaignSlotSummaryV5 {
  readonly slotId: CampaignSlotIdV5;
  readonly isEmpty: boolean;
  readonly isActive: boolean;
  readonly contestantName: string;
  readonly coldOpenCompleted: boolean;
  readonly currentAct: 1 | 2 | 3 | 4 | 5;
  readonly currentNodeId: string;
  readonly currentVenueName: string;
  readonly wonNodesCount: number;
  readonly lostNodesCount: number;
  readonly totalNodesCount: number;
  readonly totalStars: number;
  readonly maxStars: number;
  readonly bankrollUsd: number;
  readonly careerEarningsUsd: number;
  readonly liveWorldAudience: number;
  readonly activeSponsor: SponsorFactionIdV5;
  readonly unlockedCharmsCount: number;
  readonly unlockedEndingsCount: number;
  readonly comebackWinsFromRedemption: number;
  readonly updatedAtIso: string | null;
}

export interface RecordMatchOutcomeInputV5 {
  readonly nodeId: string;
  readonly won: boolean;
  readonly playerScore: number;
  readonly rivalScore?: number;
  readonly accuracyPct?: number;
  readonly wedgesEarned?: number;
  readonly sweepsOrBullseyes?: number;
  readonly dareCompleted?: boolean;
  readonly screwsLanded?: number;
  readonly usedDoubleDown?: boolean;
  readonly entryFeeAlreadyPaid?: boolean;
  readonly customHeadline?: {
    readonly outlet: string;
    readonly headline: string;
    readonly subline: string;
  };
}

export interface MatchOutcomeResolutionV5 {
  readonly node: CampaignNodeExtendedV5;
  readonly won: boolean;
  readonly starsEarned: 0 | 1 | 2 | 3;
  readonly isFirstWinOnNode: boolean;
  readonly newlyUnlockedNodeIds: readonly string[];
  readonly secretUnlockedNodeIds: readonly string[];
  readonly unlockedRedemptionBranch: boolean;
  readonly canOfferContractMulligan: boolean;
  readonly bankrollDeltaUsd: number;
  readonly dareBonusUsd: number;
  readonly dareBonusViewers: number;
  readonly audienceDelta: number;
  readonly unlockedCharms: readonly CharmIdV5[];
  readonly queuedInboxCallSceneIds: readonly string[];
  readonly triggeredGrudgeSabotage: ActiveGrudgeSabotageV5 | null;
  readonly postMatchSceneId: string | null;
  readonly endingResolution: EndingResolutionV5 | null;
  readonly state: BranchingCampaignStateV5;
}

export interface StoryChoiceResolutionV5 {
  readonly sceneId: string;
  readonly choice: StoryChoiceConsequenceV5;
  readonly challengerId: ChallengerIdV5 | null;
  readonly newAffinity: number | null;
  readonly rivalStanding: RivalStandingV5 | null;
  readonly bankrollDeltaUsd: number;
  readonly sponsorRepChanges: Readonly<Partial<Record<SponsorFactionIdV5, number>>>;
  readonly unlockedCharms: readonly CharmIdV5[];
  readonly queuedAllyCallSceneId: string | null;
  readonly triggeredSabotage: ActiveGrudgeSabotageV5 | null;
  readonly state: BranchingCampaignStateV5;
}

export interface MulliganResolutionV5 {
  readonly ok: boolean;
  readonly nodeId: string;
  readonly refundedEntryFeeUsd: number;
  readonly remainingMulligans: number;
  readonly hostLine: string;
  readonly state: BranchingCampaignStateV5;
}

export interface EndingResolutionV5 {
  readonly endingId: EndingIdV5;
  readonly sceneId: string;
  readonly title: string;
  readonly subtitle: string;
  readonly scene: InteractiveStorySceneV5;
  readonly epilogueCallouts: readonly string[];
  readonly isNewlyUnlocked: boolean;
}

export interface CampaignGraphAuditV5 {
  readonly totalNodes: number;
  readonly totalScenes: number;
  readonly actsCovered: readonly number[];
  readonly initialNodeIds: readonly string[];
  readonly deadEndLinks: readonly { fromNodeId: string; targetNodeId: string; edge: 'win' | 'loss' | 'secret' }[];
  readonly orphanNodeIds: readonly string[];
  readonly reachableNodeCount: number;
  readonly missingEndingSceneIds: readonly string[];
  readonly lanesPresent: readonly CampaignBracketLaneV5[];
  readonly twistsCovered: readonly BoardTwistIdV5[];
}

// ============================================================================
// 1. CANONICAL CATALOGS: SPONSORS, RIVALS & 25 DIEGETIC ONBOARDING MECHANICS
// ============================================================================

export const SPONSOR_CATALOG_V5: Readonly<Record<SponsorFactionIdV5, SponsorContractMetaV5>> = {
  INDEPENDENT: {
    id: 'INDEPENDENT',
    name: 'Oakridge Grassroots',
    shortName: 'Independent',
    tagline: 'Zero corporate strings, roaring hometown support, and pass-the-hat rescue funds.',
    purseMultiplier: 1.0,
    dareBonusMultiplier: 1.0,
    audienceMultiplier: 1.15,
    signatureCharmId: 'grassroots_megaphone',
    charmUnlockRep: 25,
    accentHex: '#2ee09a',
  },
  APEX_NETWORK: {
    id: 'APEX_NETWORK',
    name: 'Apex Network Syndicate',
    shortName: 'Apex Network',
    tagline: 'Prime-time ratings machine: +25% stage purses and lucrative Showman Dares.',
    purseMultiplier: 1.25,
    dareBonusMultiplier: 1.3,
    audienceMultiplier: 1.1,
    signatureCharmId: 'syndicate_golden_dice',
    charmUnlockRep: 25,
    accentHex: '#f5be49',
  },
  VELVET_SOCIETY: {
    id: 'VELVET_SOCIETY',
    name: 'The Velvet Society',
    shortName: 'Velvet Society',
    tagline: 'Wax-sealed midnight salons, forbidden board twists, and rare Podium Lucky Charms.',
    purseMultiplier: 1.15,
    dareBonusMultiplier: 1.15,
    audienceMultiplier: 1.0,
    signatureCharmId: 'velvet_wax_seal',
    charmUnlockRep: 25,
    accentHex: '#c480ff',
  },
};

export const RIVAL_PROFILES_V5: Readonly<Record<ChallengerIdV5, RivalProfileMetaV5>> = {
  frankie_russo: {
    challengerId: 'frankie_russo',
    shortKey: 'frankie',
    displayName: 'Frankie "Last Call" Russo',
    nicknameTitle: 'Unbeaten Oakridge Tavern Champ',
    tierNumber: 1,
    signatureCharmId: 'frankies_coaster',
    allyCallSceneId: 'scene_ally_call_frankie',
    weakDomainLabel: 'Classical Arts & Architecture',
    allyCoachingTip:
      'Keep my lucky cork coaster on your podium—when the cameras make you blink on a 2x Double Down, your first miss costs zero.',
    grudgeSabotageKind: 'DOUBLE_BOUNTY_WEAK_DOMAIN',
    grudgeSabotageTaunt:
      'You talked loud in my bar, kid. I tipped the bookies off—there is a Double Bounty sitting right on your shakiest column tonight.',
  },
  denise_park: {
    challengerId: 'denise_park',
    shortKey: 'denise',
    displayName: 'Denise Park',
    nicknameTitle: 'Retired AP History Legend',
    tierNumber: 2,
    signatureCharmId: 'denises_red_pen',
    allyCallSceneId: 'scene_ally_call_denise',
    weakDomainLabel: 'Modern Pop & Gaming',
    allyCoachingTip:
      'Take my red grading pen. It crosses out one lazy decoy on History and Literature clues before the clock even sweats.',
    grudgeSabotageKind: 'EARLY_SCREW_AMBUSH',
    grudgeSabotageTaunt:
      'Sloppy footnotes deserve pop quizzes. Expect a surprise SCREW buzzer on your opening turn tonight.',
  },
  trevor_blake: {
    challengerId: 'trevor_blake',
    shortKey: 'trevor',
    displayName: 'Trevor Blake',
    nicknameTitle: 'Daytime TV 19-Game Streak Star',
    tierNumber: 3,
    signatureCharmId: 'trevors_hot_mic',
    allyCallSceneId: 'scene_ally_call_trevor',
    weakDomainLabel: 'Earth Science & Deep Nature',
    allyCoachingTip:
      'Clip my hot-mic lapel charm onto your desk—once your streak hits three, the studio crowd hands you +75 pure heat.',
    grudgeSabotageKind: 'SPONSOR_SMEAR',
    grudgeSabotageTaunt:
      'I dropped a little whisper in the Apex ratings booth. Let us see how you handle a Double Bounty spotlight under prime-time glare.',
  },
  priya_nair: {
    challengerId: 'priya_nair',
    shortKey: 'priya',
    displayName: 'Dr. Priya Nair',
    nicknameTitle: 'ER Trauma Surgeon & Speed-Logic Phenom',
    tierNumber: 4,
    signatureCharmId: 'priyas_adrenaline',
    allyCallSceneId: 'scene_ally_call_priya',
    weakDomainLabel: 'Sports & Trivia Folklore',
    allyCoachingTip:
      'Pulse steady, eyes on the arc. My adrenaline vial turns any clutch lock under five seconds into a +120 surge.',
    grudgeSabotageKind: 'EARLY_SCREW_AMBUSH',
    grudgeSabotageTaunt:
      'Triage lesson: never insult the surgeon who reads your charts. Watch your weakest column closely.',
  },
  alistair_finch: {
    challengerId: 'alistair_finch',
    shortKey: 'alistair',
    displayName: 'Lord Alistair Finch',
    nicknameTitle: 'Oxford Quiz Society Fellow',
    tierNumber: 5,
    signatureCharmId: 'alistairs_pocketwatch',
    allyCallSceneId: 'scene_ally_call_alistair',
    weakDomainLabel: 'Street Pop Culture',
    allyCoachingTip:
      'Borrow my brass pocketwatch before Cairo and the Finale—eight extra seconds on every shot clock turns panic into poetry.',
    grudgeSabotageKind: 'DOUBLE_BOUNTY_WEAK_DOMAIN',
    grudgeSabotageTaunt:
      'Bad form travels faster than Concordes. I have personally sponsored a Double Bounty against your weakest chair.',
  },
  kenji_takahashi: {
    challengerId: 'kenji_takahashi',
    shortKey: 'kenji',
    displayName: 'Kenji Takahashi',
    nicknameTitle: 'Shibuya Speed-Circuit Prodigy',
    tierNumber: 6,
    signatureCharmId: 'kenjis_cyber_link',
    allyCallSceneId: 'scene_ally_call_kenji',
    weakDomainLabel: 'Ancient Mythology',
    allyCoachingTip:
      'Plug in my Shibuya cyber-link charm. Lock clean inside six seconds and it injects a +150 Speed Surge straight onto your score.',
    grudgeSabotageKind: 'EARLY_SCREW_AMBUSH',
    grudgeSabotageTaunt:
      'You chose arrogance over precision. I mapped your slowest response latency and handed it to your next opponent.',
  },
  nadia_al_mansoor: {
    challengerId: 'nadia_al_mansoor',
    shortKey: 'nadia',
    displayName: 'Nadia Al-Mansoor',
    nicknameTitle: 'Cairo Polymath & Velvet Laureate',
    tierNumber: 7,
    signatureCharmId: 'nadias_astrolabe',
    allyCallSceneId: 'scene_ally_call_nadia',
    weakDomainLabel: 'Late-Night Pop Trivia',
    allyCoachingTip:
      'Viktor Volkov guards the crown wedges like a fortress. Carry my brass astrolabe—every Wedge tile you claim pays +150 extra.',
    grudgeSabotageKind: 'DOUBLE_BOUNTY_WEAK_DOMAIN',
    grudgeSabotageTaunt:
      'A scholar who burns bridges enters the Finale blind. Expect my Velvet patrons to double the stakes on your blind spot.',
  },
  viktor_volkov: {
    challengerId: 'viktor_volkov',
    shortKey: 'viktor',
    displayName: 'Grandmaster Viktor Volkov',
    nicknameTitle: 'Undefeated World Champion',
    tierNumber: 8,
    signatureCharmId: 'screw_shield',
    allyCallSceneId: 'scene_ally_call_viktor',
    weakDomainLabel: 'Pop Improv',
    allyCoachingTip:
      'You played the board with discipline rather than noise. Keep this brass Screw Shield—even a champion respects an equal.',
    grudgeSabotageKind: 'EARLY_SCREW_AMBUSH',
    grudgeSabotageTaunt:
      'One point four billion viewers are watching your hands shake. Tonight I will dismantle your favorite column first.',
  },
};

export const DIEGETIC_MECHANICS_CATALOG_V5: readonly DiegeticMechanicBeatV5[] = [
  // ---- COLD OPEN CORE MECHANICS (4) ----
  {
    mechanicId: 'read_in_2s',
    title: '2-Second Untimed Read-In',
    phase: 'COLD_OPEN',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'welcome',
    diegeticLine:
      'Deep breath, rookie—the brass shot clock stays frozen for two full seconds while you read every clue. Read first, strike smart.',
    shortCueBanner: 'STAGE RULE · 2S UNTIMED READ-IN',
    voiceClipId: 'vo_max_read_in_tip_1',
  },
  {
    mechanicId: 'double_down_2x',
    title: '2x Double Down Throw-Switch',
    phase: 'COLD_OPEN',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'hype',
    diegeticLine:
      'See that heavy brass 2x Double Down throw-switch on your podium? Flip it before locking in when you smell blood—double points on a hit, half-back on a slip.',
    shortCueBanner: 'PODIUM SWITCH · 2X DOUBLE DOWN',
    voiceClipId: 'vo_max_double_down_1',
  },
  {
    mechanicId: 'clue_coins',
    title: 'Brass Clue & 50/50 Coins',
    phase: 'COLD_OPEN',
    speaker: 'producer_sam',
    speakerName: 'Producer Sam',
    speakerRole: 'Backstage Showrunner',
    hostPose: 'welcome',
    diegeticLine:
      'I slipped two stamped brass tokens onto your ledge: 50/50 shears off two decoys, and Clue whispers a lateral nudge without burning your streak.',
    shortCueBanner: 'PODIUM TOKENS · 50/50 & CLUE COINS',
    voiceClipId: 'vo_sam_1',
  },
  {
    mechanicId: 'gadget_dial_cables',
    title: 'Analog Speedometer Dial & Match-4 Neon Cables',
    phase: 'COLD_OPEN',
    triggerFormat: 'MATCH_4',
    speaker: 'frankie_russo',
    speakerName: 'Frankie "Last Call" Russo',
    speakerRole: 'Unbeaten Oakridge Champ',
    hostPose: 'hype',
    diegeticLine:
      'We do not just mash four buttons here, kid. Some clues drop a live brass speedometer dial or a braided neon switchboard—spin clean, plug tight, pull the lock lever.',
    shortCueBanner: 'STAGE GADGETS · DIAL & NEON CABLES',
    voiceClipId: 'vo_cold_3',
  },

  // ---- ACT I CORE STAGE MECHANICS (7) ----
  {
    mechanicId: 'six_wedge_medallion',
    title: '6-Wedge Jewel Championship Medallion',
    phase: 'ACT_1',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'hype',
    diegeticLine:
      'Look up at that six-jewel Championship Medallion. Claim Crown tiles across six subjects to light every gem—each glowing wedge powers up your podium rating.',
    shortCueBanner: 'BOARD GOAL · 6-WEDGE MEDALLION',
    voiceClipId: 'vo_max_wedge_earned_1',
  },
  {
    mechanicId: 'row_col_sweep_jackpots',
    title: 'Row & Column Stage Sweep Jackpots',
    phase: 'ACT_1',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'hype',
    diegeticLine:
      'Clear every tile across any full row or down any full column and the studio sirens blow—an instant +300 Stage Sweep Jackpot plus a bonus Jewel Wedge.',
    shortCueBanner: 'COMBO PAYOUT · ROW/COL SWEEP (+300)',
    voiceClipId: 'vo_max_stage_sweep_1',
  },
  {
    mechanicId: 'chain_locks_3d',
    title: '3D Iron Chain & Brass Padlock Reactions',
    phase: 'ACT_1',
    speaker: 'denise_park',
    speakerName: 'Denise Park',
    speakerRole: 'Retired AP History Legend',
    hostPose: 'welcome',
    diegeticLine:
      'Those heavy iron chains are not decoration. Nail an adjacent open tile and the lightning arc shatters the brass padlock right off the big-money vault beside it.',
    shortCueBanner: 'CHAIN REACTION · SHATTER PADLOCKS',
    voiceClipId: 'vo_max_chain_shatter_1',
  },
  {
    mechanicId: 'screw_rival_buzzer',
    title: 'Red SCREW RIVAL! Arcade Buzzer',
    phase: 'ACT_1',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'hype',
    diegeticLine:
      'Spot a brutal tile in your opponent’s weakest subject? Slam that glossy red SCREW RIVAL dome on your desk—force them into the spotlight and steal the entire pot if they choke!',
    shortCueBanner: 'SABOTAGE · RED SCREW RIVAL BUZZER',
    voiceClipId: 'vo_max_screw_slammed_1',
  },
  {
    mechanicId: 'tour_trunk_yarn_branches',
    title: 'Contender Tour Trunk & Red/Gold Yarn Branches',
    phase: 'ACT_1',
    speaker: 'producer_sam',
    speakerName: 'Producer Sam',
    speakerRole: 'Backstage Showrunner',
    hostPose: 'welcome',
    diegeticLine:
      'Everything lives inside your leather Tour Trunk. Gold yarn tracks the prime-time main bracket; crimson yarn leads down the late-night Redemption circuit if you ever take a knockdown.',
    shortCueBanner: 'OVERWORLD · TOUR TRUNK YARN ROUTES',
    voiceClipId: 'vo_sam_2',
  },
  {
    mechanicId: 'sponsor_dares',
    title: '3 Competing Sponsors & On-Air Showman Dares',
    phase: 'ACT_1',
    speaker: 'producer_sam',
    speakerName: 'Producer Sam',
    speakerRole: 'Backstage Showrunner',
    hostPose: 'welcome',
    diegeticLine:
      'Three backers are watching your clip reel: Oakridge Grassroots, Apex Network, and the Velvet Society. Hit their on-air Showman Dares for bonus bankroll and exclusive backstage doors.',
    shortCueBanner: 'SPONSORS · SHOWMAN DARES & CONTRACTS',
    voiceClipId: 'vo_sam_3',
  },
  {
    mechanicId: 'podium_lucky_charms',
    title: 'Equipable Podium Lucky Charms',
    phase: 'ACT_1',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'welcome',
    diegeticLine:
      'Win over rivals backstage or conquer secret salons to earn Podium Lucky Charms. Seat up to three physical trinkets in your brass desk cups before walking on air.',
    shortCueBanner: 'LOADOUT · 3 PODIUM LUCKY CHARMS',
    voiceClipId: 'vo_sam_4',
  },

  // ---- ALL 14 BOARD TOPOLOGIES & TWISTS (14) ----
  {
    mechanicId: 'topology_showcase_starter',
    title: 'Classic Showcase Board',
    phase: 'BOARD_TWIST',
    triggerTwist: 'showcase_starter',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'welcome',
    diegeticLine:
      'Tonight is a Classic Showcase layout—every column mixes live formats from cables to dials, with a Spinning Wheel and Crown Wedge waiting right in the heart of the board.',
    shortCueBanner: 'BOARD TWIST 1/14 · SHOWCASE STARTER',
    voiceClipId: 'vo_max_board_welcome_1',
  },
  {
    mechanicId: 'topology_chain_padlocks',
    title: '3D Chain-Reaction Padlocks',
    phase: 'BOARD_TWIST',
    triggerTwist: 'chain_padlocks',
    speaker: 'denise_park',
    speakerName: 'Denise Park',
    speakerRole: 'Retired AP History Legend',
    hostPose: 'welcome',
    diegeticLine:
      'Padlock Neighbors is live: the top vaults are wrapped in crossed iron chains. Carve smart paths through adjacent tiles to crack them open before I do.',
    shortCueBanner: 'BOARD TWIST 2/14 · 3D CHAIN PADLOCKS',
    voiceClipId: 'vo_max_chain_shatter_2',
  },
  {
    mechanicId: 'topology_spiral_labyrinth',
    title: 'Spiral Labyrinth Core',
    phase: 'BOARD_TWIST',
    triggerTwist: 'spiral_labyrinth',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'hype',
    diegeticLine:
      'Welcome to the Spiral Labyrinth! Outer ring tiles unlock the inner coil, spiraling all the way to a blazing 1,000-point Core tile dead center.',
    shortCueBanner: 'BOARD TWIST 3/14 · SPIRAL LABYRINTH CORE',
    voiceClipId: 'vo_max_board_welcome_2',
  },
  {
    mechanicId: 'topology_pyramid_ascent',
    title: 'Pyramid Ascent',
    phase: 'BOARD_TWIST',
    triggerTwist: 'pyramid_ascent',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'hype',
    diegeticLine:
      'Pyramid Ascent rules: start at the broad base row and climb upward—each cleared foundation unlocks the steeper summit vaults directly overhead.',
    shortCueBanner: 'BOARD TWIST 4/14 · PYRAMID ASCENT',
    voiceClipId: 'vo_max_board_welcome_3',
  },
  {
    mechanicId: 'topology_fog_spotlight',
    title: 'Fog-of-War Spotlight',
    phase: 'BOARD_TWIST',
    triggerTwist: 'fog_spotlight',
    speaker: 'alistair_finch',
    speakerName: 'Lord Alistair Finch',
    speakerRole: 'Oxford Quiz Fellow',
    hostPose: 'welcome',
    diegeticLine:
      'The theater lamps are dimmed to Fog-of-War Spotlight. Only lit perimeter tiles reveal their secrets—every answer swings the searchlight deeper into the dark.',
    shortCueBanner: 'BOARD TWIST 5/14 · FOG-OF-WAR SPOTLIGHT',
    voiceClipId: 'vo_alistair_walkout',
  },
  {
    mechanicId: 'topology_time_bomb_hot_potato',
    title: 'Time-Bomb Hot Potato',
    phase: 'BOARD_TWIST',
    triggerTwist: 'time_bomb_hot_potato',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'hype',
    diegeticLine:
      'Hear that sizzling fuse? Time-Bomb Hot Potato is ticking on the board—defuse the lit Blitz tile for bonus loot before the fuse jumps or blows!',
    shortCueBanner: 'BOARD TWIST 6/14 · TIME-BOMB HOT POTATO',
    voiceClipId: 'vo_max_buzzer_beater_1',
  },
  {
    mechanicId: 'topology_tug_of_war_turf',
    title: 'Tug-of-War Territory Turf',
    phase: 'BOARD_TWIST',
    triggerTwist: 'tug_of_war_turf',
    speaker: 'trevor_blake',
    speakerName: 'Trevor Blake',
    speakerRole: 'Daytime TV Streak Champ',
    hostPose: 'hype',
    diegeticLine:
      'Tug-of-War Turf tonight—every tile you win paints that square in your house color. Hold the majority of the stage at the final buzzer for a massive +500 Turf Bonus.',
    shortCueBanner: 'BOARD TWIST 7/14 · TUG-OF-WAR TURF (+500)',
    voiceClipId: 'vo_trevor_walkout',
  },
  {
    mechanicId: 'topology_velvet_x_crossroads',
    title: 'Velvet X-Crossroads',
    phase: 'BOARD_TWIST',
    triggerTwist: 'velvet_x_crossroads',
    speaker: 'nadia_al_mansoor',
    speakerName: 'Nadia Al-Mansoor',
    speakerRole: 'Velvet Society Laureate',
    hostPose: 'welcome',
    diegeticLine:
      'Velvet X-Crossroads: two gilded diagonal tracks cross the stage at 2x payout. Control the intersection and you control the night.',
    shortCueBanner: 'BOARD TWIST 8/14 · VELVET X-CROSSROADS',
    voiceClipId: 'vo_nadia_walkout',
  },
  {
    mechanicId: 'topology_spotlight_roulette',
    title: 'Spotlight Roulette Sweep',
    phase: 'BOARD_TWIST',
    triggerTwist: 'spotlight_roulette',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'hype',
    diegeticLine:
      'Spotlight Roulette is rolling! A roaming studio beam selects boosted jackpot squares each turn—catch the spotlight tile to supercharge your score.',
    shortCueBanner: 'BOARD TWIST 9/14 · SPOTLIGHT ROULETTE',
    voiceClipId: 'vo_max_power_play_1',
  },
  {
    mechanicId: 'topology_power_play_minefield',
    title: 'High-Roller Power-Play Minefield',
    phase: 'BOARD_TWIST',
    triggerTwist: 'power_play_minefield',
    speaker: 'max_sterling',
    speakerName: 'Max Sterling',
    speakerRole: 'Prime-Time Host',
    hostPose: 'hype',
    diegeticLine:
      'Four concealed Power-Play Wager vaults are buried across this board. Trip one, dial your brass wager, and swing the entire leaderboard in a single heartbeat.',
    shortCueBanner: 'BOARD TWIST 10/14 · POWER-PLAY MINEFIELD',
    voiceClipId: 'vo_max_power_play_2',
  },
  {
    mechanicId: 'topology_ice_fire_columns',
    title: 'Ice & Fire Column Sabotage',
    phase: 'BOARD_TWIST',
    triggerTwist: 'ice_fire_columns',
    speaker: 'kenji_takahashi',
    speakerName: 'Kenji Takahashi',
    speakerRole: 'Shibuya Speed-Logic Prodigy',
    hostPose: 'welcome',
    diegeticLine:
      'Ice and Fire Columns are armed: frosted squares lock down an entire lane until you solve a glowing Flame tile to thaw the column for a crisp +200 burst.',
    shortCueBanner: 'BOARD TWIST 11/14 · ICE & FIRE COLUMNS',
    voiceClipId: 'vo_kenji_walkout',
  },
  {
    mechanicId: 'topology_gold_fever_contagion',
    title: 'Gold Fever Multiplier Contagion',
    phase: 'BOARD_TWIST',
    triggerTwist: 'gold_fever_contagion',
    speaker: 'priya_nair',
    speakerName: 'Dr. Priya Nair',
    speakerRole: 'ER Surgeon & Blitz Strategist',
    hostPose: 'hype',
    diegeticLine:
      'Multiplier Contagion: string consecutive hits together and golden 2x fever spreads into adjacent squares—keep the streak alive and watch the whole grid ignite.',
    shortCueBanner: 'BOARD TWIST 12/14 · MULTIPLIER CONTAGION',
    voiceClipId: 'vo_priya_walkout',
  },
  {
    mechanicId: 'topology_oxford_pick_ban',
    title: 'Oxford Pick & Ban Category Draft',
    phase: 'BOARD_TWIST',
    triggerTwist: 'oxford_pick_ban',
    speaker: 'alistair_finch',
    speakerName: 'Lord Alistair Finch',
    speakerRole: 'Oxford Quiz Fellow',
    hostPose: 'welcome',
    diegeticLine:
      'Before first buzz we play the Oxford Pick & Ban Draft: strike your rival’s pet subject off the marquee and lock in a favorite lane of your own.',
    shortCueBanner: 'BOARD TWIST 13/14 · OXFORD PICK & BAN',
    voiceClipId: 'vo_alistair_trap_taunt',
  },
  {
    mechanicId: 'topology_championship_gauntlet',
    title: '6-Column Championship Gauntlet',
    phase: 'BOARD_TWIST',
    triggerTwist: 'championship_gauntlet',
    speaker: 'viktor_volkov',
    speakerName: 'Grandmaster Viktor Volkov',
    speakerRole: 'Defending World Champion',
    hostPose: 'hype',
    diegeticLine:
      'Six columns, chained apex vaults, roving spotlights, and one point four billion eyes. Everything you learned across five acts collides in the Championship Gauntlet.',
    shortCueBanner: 'BOARD TWIST 14/14 · 6-COL GAUNTLET',
    voiceClipId: 'vo_viktor_walkout',
  },
];

const MECHANIC_BY_ID: ReadonlyMap<string, DiegeticMechanicBeatV5> = new Map(
  DIEGETIC_MECHANICS_CATALOG_V5.map((m) => [m.mechanicId, m]),
);

const TWIST_TO_MECHANIC_ID: Readonly<Record<BoardTwistIdV5, string>> = {
  showcase_starter: 'topology_showcase_starter',
  chain_padlocks: 'topology_chain_padlocks',
  spiral_labyrinth: 'topology_spiral_labyrinth',
  pyramid_ascent: 'topology_pyramid_ascent',
  fog_spotlight: 'topology_fog_spotlight',
  time_bomb_hot_potato: 'topology_time_bomb_hot_potato',
  tug_of_war_turf: 'topology_tug_of_war_turf',
  velvet_x_crossroads: 'topology_velvet_x_crossroads',
  spotlight_roulette: 'topology_spotlight_roulette',
  power_play_minefield: 'topology_power_play_minefield',
  ice_fire_columns: 'topology_ice_fire_columns',
  gold_fever_contagion: 'topology_gold_fever_contagion',
  oxford_pick_ban: 'topology_oxford_pick_ban',
  championship_gauntlet: 'topology_championship_gauntlet',
};

const ENDING_SCENE_IDS: Readonly<Record<EndingIdV5, string>> = {
  PEOPLES_CHAMPION: 'ending_peoples_champion',
  NETWORK_SOVEREIGN: 'ending_network_sovereign',
  VELVET_GRANDMASTER: 'ending_velvet_grandmaster',
  CINDERELLA_REDEMPTION: 'ending_cinderella_redemption',
};

const ENDING_META: Readonly<Record<EndingIdV5, { readonly title: string; readonly subtitle: string }>> = {
  PEOPLES_CHAMPION: {
    title: "The People's Champion",
    subtitle: 'Independent Heart · Backed by Friends, Allies & 1.4 Billion Cheering Viewers',
  },
  NETWORK_SOVEREIGN: {
    title: 'The Network Sovereign',
    subtitle: 'Prime-Time Empire · Apex Syndicate Crown & Record-Shattering Showmanship',
  },
  VELVET_GRANDMASTER: {
    title: 'The Velvet Grandmaster',
    subtitle: 'Wax-Sealed Laureate · Master of Forbidden Boards & Underground Salons',
  },
  CINDERELLA_REDEMPTION: {
    title: 'The Cinderella Redemption Crown',
    subtitle: 'From 2 AM Diner Wildcards to the $10,000,000 World Stage — Unbreakable',
  },
};

// ============================================================================
// 2. PURE HELPER UTILITIES
// ============================================================================

export function isValidCampaignSlotIdV5(value: unknown): value is CampaignSlotIdV5 {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

export function campaignSlotStorageKeyV5(slotId: CampaignSlotIdV5): string {
  return `${CAMPAIGN_SLOT_KEY_PREFIX_V5}${slotId}`;
}

export function clampAffinity(value: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(-100, Math.min(100, Math.round(num)));
}

export function getRivalStandingForAffinity(affinity: number): RivalStandingV5 {
  const clamped = clampAffinity(affinity);
  if (clamped >= SWORN_ALLY_AFFINITY_THRESHOLD_V5) return 'SWORN_ALLY';
  if (clamped >= ALLY_AFFINITY_THRESHOLD_V5) return 'ALLY';
  if (clamped <= NEMESIS_AFFINITY_THRESHOLD_V5) return 'BITTER_NEMESIS';
  if (clamped <= GRUDGE_AFFINITY_THRESHOLD_V5) return 'GRUDGE';
  return 'RIVAL';
}

export function deriveGreenRoomEraForAct(act: 1 | 2 | 3 | 4 | 5): GreenRoomEraV5 {
  if (act <= 1) return 'LOCAL_PUB';
  if (act <= 3) return 'TV_DRESSING_ROOM';
  return 'GLOBAL_VIP_SUITE';
}

export function formatBankrollUsd(amount: number): string {
  const safe = Math.round(Number(amount) || 0);
  const sign = safe < 0 ? '-' : '';
  return `${sign}$${Math.abs(safe).toLocaleString('en-US')}`;
}

export function formatLiveAudience(count: number): string {
  const safe = Math.max(0, Math.round(Number(count) || 0));
  if (safe >= 1_000_000_000) {
    const b = safe / 1_000_000_000;
    return `${b >= 10 ? b.toFixed(0) : Number(b.toFixed(2))}B`;
  }
  if (safe >= 1_000_000) {
    const m = safe / 1_000_000;
    return `${m >= 100 ? Math.round(m) : Number(m.toFixed(1))}M`;
  }
  if (safe >= 10_000) {
    const k = safe / 1_000;
    return `${k >= 100 ? Math.round(k) : Number(k.toFixed(1))}K`;
  }
  return safe.toLocaleString('en-US');
}

export function getMechanicIdForBoardTwist(twist: BoardTwistIdV5): string {
  return TWIST_TO_MECHANIC_ID[twist] ?? 'topology_showcase_starter';
}

/**
 * Infers which of the 14 Board Twists a node showcases using its explicit
 * `boardTwistId` first, then inspecting `hookBlurb`/`showTitle`/`topology`.
 */
export function inferBoardTwistForNode(node: CampaignNodeExtendedV5): BoardTwistIdV5 {
  if (node.boardTwistId && node.boardTwistId in TWIST_TO_MECHANIC_ID) {
    return node.boardTwistId;
  }
  const text = `${node.showTitle} ${node.hookBlurb}`.toLowerCase();
  if (/oxford|pick\s*&?\s*ban|category draft/.test(text)) return 'oxford_pick_ban';
  if (/ice\s*&?\s*fire|thaw|frozen column|flame tile/.test(text)) return 'ice_fire_columns';
  if (/contagion|gold fever|multiplier spread/.test(text)) return 'gold_fever_contagion';
  if (/minefield|power[- ]?play/.test(text)) return 'power_play_minefield';
  if (/time[- ]?bomb|hot potato|sizzling fuse|blitz/.test(text)) return 'time_bomb_hot_potato';
  if (/tug[- ]?of[- ]?war|territory|turf/.test(text)) return 'tug_of_war_turf';
  if (/pyramid|summit|ascent/.test(text)) return 'pyramid_ascent';
  if (/spiral|labyrinth|core/.test(text)) return 'spiral_labyrinth';
  if (/x[- ]?crossroads|diagonal/.test(text)) return 'velvet_x_crossroads';
  if (/gauntlet|6[- ]?column|championship/.test(text) || node.topology === 'FINALE_GAUNTLET') {
    return 'championship_gauntlet';
  }
  if (node.topology === 'FOG_EXPLORER') return 'fog_spotlight';
  if (node.topology === 'SPOTLIGHT_ROULETTE') return 'spotlight_roulette';
  if (node.topology === 'CROSSROADS_HYBRID') return 'velvet_x_crossroads';
  if (node.topology === 'PADLOCK_NEIGHBORS') return 'chain_padlocks';
  return 'showcase_starter';
}

function isChallengerIdV5(value: unknown): value is ChallengerIdV5 {
  return typeof value === 'string' && (ALL_CHALLENGER_IDS_V5 as readonly string[]).includes(value);
}

function isSponsorIdV5(value: unknown): value is SponsorFactionIdV5 {
  return typeof value === 'string' && (ALL_SPONSOR_IDS_V5 as readonly string[]).includes(value);
}

function isCharmIdV5(value: unknown): value is CharmIdV5 {
  return typeof value === 'string' && (ALL_CHARM_IDS_V5 as readonly string[]).includes(value);
}

function isEndingIdV5(value: unknown): value is EndingIdV5 {
  return typeof value === 'string' && (ALL_ENDING_IDS_V5 as readonly string[]).includes(value);
}

function createZeroAffinityMap(): Record<ChallengerIdV5, number> {
  return {
    frankie_russo: 0,
    denise_park: 0,
    trevor_blake: 0,
    priya_nair: 0,
    alistair_finch: 0,
    kenji_takahashi: 0,
    nadia_al_mansoor: 0,
    viktor_volkov: 0,
  };
}

function createInitialSponsorRep(): Record<SponsorFactionIdV5, number> {
  return {
    INDEPENDENT: 10,
    APEX_NETWORK: 0,
    VELVET_SOCIETY: 0,
  };
}

function dedupeStrings(items: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    if (typeof item === 'string' && item.length > 0 && !seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

function normalizeScenesInput(
  raw: StoryPackPayloadV5['scenes'] | StoryPackPayloadV5['endings'] | undefined,
): InteractiveStorySceneV5[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((s): s is InteractiveStorySceneV5 => Boolean(s && typeof s.sceneId === 'string'));
  }
  if (typeof raw === 'object') {
    return Object.values(raw).filter(
      (s): s is InteractiveStorySceneV5 => Boolean(s && typeof s.sceneId === 'string'),
    );
  }
  return [];
}

// ============================================================================
// 3. COMPACT CANONICAL FALLBACK SCENES & NODES
// Used seamlessly if JSON packs are not yet fetched or an ally/ending scene ID
// isn't supplied by an external pack. Replaced 100% by loaded JSON IDs when present!
// ============================================================================

function buildFallbackNodes(): CampaignNodeExtendedV5[] {
  return [
    {
      nodeId: 'act1_m1',
      actNumber: 1,
      tierNumber: 1,
      lane: 'MAIN_STAGE',
      ephemeraStyle: 'POLAROID_SNAPSHOT',
      pinX: 16,
      pinY: 46,
      tiltDeg: -3,
      cityStamp: 'BROOKLYN, NY',
      venueName: 'Oakridge Community Hall',
      showTitle: 'The Oakridge Open Call',
      hookBlurb:
        'Forty-two folding chairs, one buzzing mic, and unbeaten bartender Frankie Russo testing your nerves on Classic Showcase.',
      challengerId: 'frankie_russo',
      boardCols: 4,
      boardRows: 3,
      maxTurns: 8,
      topology: 'OPEN_TRYOUT',
      boardTwistId: 'showcase_starter',
      entryFeeUsd: 0,
      purseUsd: 1000,
      baseAudience: 42,
      soloTargetScore: 900,
      featuredFormats: ['MULTIPLE_CHOICE', 'MATCH_4', 'PINPOINT_DIAL', 'CLUE_ESCALATOR'],
      optionalDare: {
        dareId: 'dare_act1_m1_double',
        sponsor: 'APEX_NETWORK',
        description: 'Flip the 2x Double Down throw-switch and land a clean hit live.',
        conditionKind: 'WIN_DOUBLE_DOWN',
        bonusPurseUsd: 400,
        bonusViewers: 65,
      },
      rewardCharmId: 'frankies_coaster',
      initialUnlocked: true,
      onWinUnlockIds: ['act1_m2', 'act1_s1'],
      onLossUnlockIds: ['act1_r1'],
      secretUnlockIds: ['act1_v1'],
      preMatchSceneId: 'scene_act1_m1_walkout',
      postWinSceneId: 'scene_act1_m1_win',
      postLossSceneId: 'scene_act1_m1_loss',
    },
    {
      nodeId: 'act1_r1',
      actNumber: 1,
      tierNumber: 1,
      lane: 'REDEMPTION_GRIT',
      ephemeraStyle: 'TORN_PUB_FLYER',
      pinX: 28,
      pinY: 74,
      tiltDeg: 5,
      cityStamp: 'BROOKLYN · 2 AM',
      venueName: 'Silver Spoon All-Night Diner',
      showTitle: '2 AM Diner Redemption Play-In',
      hookBlurb:
        'Knocked off Oakridge stage? Claw right back onto the tour with a sizzling Time-Bomb Hot Potato late-night hustle.',
      challengerId: 'frankie_russo',
      boardCols: 4,
      boardRows: 3,
      maxTurns: 8,
      topology: 'OPEN_TRYOUT',
      boardTwistId: 'time_bomb_hot_potato',
      entryFeeUsd: 0,
      purseUsd: 650,
      baseAudience: 95,
      soloTargetScore: 850,
      featuredFormats: ['MULTIPLE_CHOICE', 'SORT_4', 'PINPOINT_DIAL', 'MULTI_STRIKE'],
      rewardCharmId: 'underdog_chip',
      onWinUnlockIds: ['act1_m2'],
      onLossUnlockIds: ['act1_m2'],
      preMatchSceneId: 'scene_act1_r1_redemption',
    },
    {
      nodeId: 'act1_s1',
      actNumber: 1,
      tierNumber: 2,
      lane: 'SPONSOR_SHOWCASE',
      ephemeraStyle: 'CALL_SHEET_CLIP',
      pinX: 46,
      pinY: 22,
      tiltDeg: -4,
      cityStamp: 'DOWNTOWN STUDIO',
      venueName: 'Downtown Lyric Theater',
      showTitle: 'Apex Ratings Showcase: Pyramid Ascent',
      hookBlurb:
        'Apex producers want fireworks—climb the Pyramid Ascent board and claim a Showman Dare bonus purse.',
      challengerId: 'denise_park',
      boardCols: 4,
      boardRows: 3,
      maxTurns: 9,
      topology: 'PADLOCK_NEIGHBORS',
      boardTwistId: 'pyramid_ascent',
      entryFeeUsd: 250,
      purseUsd: 3500,
      baseAudience: 2800,
      soloTargetScore: 1300,
      featuredFormats: ['MULTIPLE_CHOICE', 'MATCH_4', 'SORT_4', 'CLUE_ESCALATOR'],
      optionalDare: {
        dareId: 'dare_act1_s1_sweep',
        sponsor: 'APEX_NETWORK',
        description: 'Sweep a full row or column for a +300 Stage Jackpot.',
        conditionKind: 'CLEAR_FULL_LINE',
        bonusPurseUsd: 1200,
        bonusViewers: 1400,
      },
      onWinUnlockIds: ['act2_m1'],
      onLossUnlockIds: ['act1_m2'],
    },
    {
      nodeId: 'act1_v1',
      actNumber: 1,
      tierNumber: 2,
      lane: 'VELVET_SALON',
      ephemeraStyle: 'VELVET_WAX_INVITE',
      pinX: 54,
      pinY: 78,
      tiltDeg: 3,
      cityStamp: 'MIDNIGHT SALON',
      venueName: 'The Velvet Parlor',
      showTitle: 'Wax-Sealed Salon: Spiral Core',
      hookBlurb:
        'A crimson wax envelope slid under your hotel door—crack the Spiral Labyrinth to reach the 1,000-point core.',
      challengerId: 'denise_park',
      boardCols: 4,
      boardRows: 4,
      maxTurns: 10,
      topology: 'PADLOCK_NEIGHBORS',
      boardTwistId: 'spiral_labyrinth',
      entryFeeUsd: 300,
      purseUsd: 5000,
      baseAudience: 600,
      soloTargetScore: 1500,
      featuredFormats: ['CLUE_ESCALATOR', 'SORT_4', 'PINPOINT_DIAL', 'VISUAL_SPOTTER'],
      rewardCharmId: 'velvet_wax_seal',
      onWinUnlockIds: ['act2_m1'],
      onLossUnlockIds: ['act1_m2'],
    },
    {
      nodeId: 'act1_m2',
      actNumber: 1,
      tierNumber: 2,
      lane: 'MAIN_STAGE',
      ephemeraStyle: 'POLAROID_SNAPSHOT',
      pinX: 74,
      pinY: 48,
      tiltDeg: 2,
      cityStamp: 'CIVIC DISTRICT',
      venueName: 'Downtown Lyric Theater',
      showTitle: 'City Championship: 3D Chain Locks',
      hookBlurb:
        'Retired AP History legend Denise Park locks the high vaults in iron chains—shatter padlocks and deploy SCREW RIVAL!',
      challengerId: 'denise_park',
      boardCols: 4,
      boardRows: 4,
      maxTurns: 10,
      topology: 'PADLOCK_NEIGHBORS',
      boardTwistId: 'chain_padlocks',
      entryFeeUsd: 200,
      purseUsd: 5000,
      baseAudience: 5200,
      soloTargetScore: 1450,
      featuredFormats: ['MULTIPLE_CHOICE', 'SORT_4', 'MATCH_4', 'PINPOINT_DIAL'],
      rewardCharmId: 'denises_red_pen',
      onWinUnlockIds: ['act2_m1'],
      onLossUnlockIds: ['act1_r1', 'act2_m1'],
    },
    {
      nodeId: 'act2_m1',
      actNumber: 2,
      tierNumber: 3,
      lane: 'MAIN_STAGE',
      ephemeraStyle: 'POLAROID_SNAPSHOT',
      pinX: 35,
      pinY: 44,
      tiltDeg: -2,
      cityStamp: 'CHANNEL 7 LIVE',
      venueName: 'Channel 7 Studio B',
      showTitle: 'Daytime Ratings War: Tug-of-War Turf',
      hookBlurb:
        'Nineteen-game streak star Trevor Blake owns daytime TV. Paint the majority of the board to steal the +500 Turf Bonus.',
      challengerId: 'trevor_blake',
      boardCols: 5,
      boardRows: 3,
      maxTurns: 10,
      topology: 'SPOTLIGHT_ROULETTE',
      boardTwistId: 'tug_of_war_turf',
      entryFeeUsd: 500,
      purseUsd: 25000,
      baseAudience: 185000,
      soloTargetScore: 2100,
      featuredFormats: ['MULTIPLE_CHOICE', 'MULTI_STRIKE', 'MATCH_4', 'PINPOINT_DIAL'],
      rewardCharmId: 'trevors_hot_mic',
      onWinUnlockIds: ['act3_m1'],
      onLossUnlockIds: ['act3_r1'],
    },
    {
      nodeId: 'act3_m1',
      actNumber: 3,
      tierNumber: 5,
      lane: 'MAIN_STAGE',
      ephemeraStyle: 'BOARDING_PASS',
      pinX: 30,
      pinY: 42,
      tiltDeg: -3,
      cityStamp: 'LONDON, UK',
      venueName: 'London Royal Rotunda',
      showTitle: 'The Oxford Pick & Ban Classic',
      hookBlurb:
        'Lord Alistair Finch welcomes you across the Atlantic with Fog-of-War spotlights and the Oxford Pick & Ban Draft.',
      challengerId: 'alistair_finch',
      boardCols: 5,
      boardRows: 4,
      maxTurns: 12,
      topology: 'FOG_EXPLORER',
      boardTwistId: 'oxford_pick_ban',
      entryFeeUsd: 1500,
      purseUsd: 120000,
      baseAudience: 42000000,
      soloTargetScore: 3100,
      featuredFormats: ['CLUE_ESCALATOR', 'SORT_4', 'VISUAL_SPOTTER', 'MULTIPLE_CHOICE'],
      rewardCharmId: 'alistairs_pocketwatch',
      onWinUnlockIds: ['act4_m1'],
      onLossUnlockIds: ['act3_r1'],
    },
    {
      nodeId: 'act3_r1',
      actNumber: 3,
      tierNumber: 6,
      lane: 'REDEMPTION_GRIT',
      ephemeraStyle: 'TORN_PUB_FLYER',
      pinX: 62,
      pinY: 70,
      tiltDeg: 4,
      cityStamp: 'TOKYO · SHIBUYA',
      venueName: 'Shibuya Rain-Lit Sky-Dome',
      showTitle: 'International Wildcard: Ice & Fire',
      hookBlurb:
        'One last international lifeline in Tokyo against Kenji Takahashi—thaw frozen lanes with Flame squares to survive.',
      challengerId: 'kenji_takahashi',
      boardCols: 5,
      boardRows: 4,
      maxTurns: 12,
      topology: 'CROSSROADS_HYBRID',
      boardTwistId: 'ice_fire_columns',
      entryFeeUsd: 0,
      purseUsd: 95000,
      baseAudience: 68000000,
      soloTargetScore: 3200,
      featuredFormats: ['MATCH_4', 'PINPOINT_DIAL', 'MULTI_STRIKE', 'MULTIPLE_CHOICE'],
      rewardCharmId: 'kenjis_cyber_link',
      onWinUnlockIds: ['act4_m1'],
      onLossUnlockIds: ['act4_m1'],
    },
    {
      nodeId: 'act4_m1',
      actNumber: 4,
      tierNumber: 7,
      lane: 'MAIN_STAGE',
      ephemeraStyle: 'POLAROID_SNAPSHOT',
      pinX: 52,
      pinY: 46,
      tiltDeg: -2,
      cityStamp: 'GIZA, EGYPT',
      venueName: 'Great Starlight Pavilion at Giza',
      showTitle: 'Global Semifinal: Velvet X-Crossroads',
      hookBlurb:
        'Under the pyramids against Nadia Al-Mansoor: master 2x diagonal tracks and Multiplier Contagion to earn your ticket to the Finale.',
      challengerId: 'nadia_al_mansoor',
      boardCols: 5,
      boardRows: 4,
      maxTurns: 12,
      topology: 'CROSSROADS_HYBRID',
      boardTwistId: 'velvet_x_crossroads',
      entryFeeUsd: 2500,
      purseUsd: 500000,
      baseAudience: 380000000,
      soloTargetScore: 4200,
      featuredFormats: ['CLUE_ESCALATOR', 'MATCH_4', 'SORT_4', 'PINPOINT_DIAL', 'VISUAL_SPOTTER'],
      rewardCharmId: 'nadias_astrolabe',
      onWinUnlockIds: ['act5_finale'],
      onLossUnlockIds: ['act5_finale'],
    },
    {
      nodeId: 'act5_finale',
      actNumber: 5,
      tierNumber: 8,
      lane: 'MAIN_STAGE',
      ephemeraStyle: 'POLAROID_SNAPSHOT',
      pinX: 50,
      pinY: 44,
      tiltDeg: 0,
      cityStamp: 'WORLDWIDE LIVE SIMULCAST',
      venueName: 'Global Championship Colosseum',
      showTitle: "The $10,000,000 World's Smartest Finale",
      hookBlurb:
        '1.4 billion viewers watching live. Six-Column Championship Gauntlet against undefeated Grandmaster Viktor Volkov.',
      challengerId: 'viktor_volkov',
      boardCols: 6,
      boardRows: 4,
      maxTurns: 16,
      topology: 'FINALE_GAUNTLET',
      boardTwistId: 'championship_gauntlet',
      entryFeeUsd: 0,
      purseUsd: 10000000,
      baseAudience: 1400000000,
      soloTargetScore: 5800,
      featuredFormats: [
        'MULTIPLE_CHOICE',
        'MATCH_4',
        'SORT_4',
        'MULTI_STRIKE',
        'PINPOINT_DIAL',
        'CLUE_ESCALATOR',
        'VISUAL_SPOTTER',
      ],
      onWinUnlockIds: [],
      onLossUnlockIds: [],
      preMatchSceneId: 'scene_act5_finale_walkout',
    },
  ];
}

function buildFallbackColdOpenScene(): InteractiveStorySceneV5 {
  return {
    sceneId: 'scene_cold_open',
    kind: 'COLD_OPEN',
    title: 'The Open Call',
    locationSubhead: 'OAKRIDGE HALL',
    backdropUrl: V5_VENUE_STAGES[1],
    featuredChallengerId: 'frankie_russo',
    beats: [
      {
        speaker: 'max_sterling',
        speakerName: 'Max Sterling',
        speakerRole: 'Prime-Time Host',
        text: 'Every broadcast network on Earth pooled ten million dollars for one open search—and it starts tonight on forty-two folding chairs in Oakridge.',
        voiceClipId: 'vo_cold_1',
        hostPose: 'welcome',
        backdropUrl: V5_STORY_PLATES.openCall,
      },
      {
        speaker: 'producer_sam',
        speakerName: 'Producer Sam',
        speakerRole: 'Backstage Showrunner',
        text: 'Quick briefing before the red tally light fires: you get a two-second untimed Read-In on every clue, brass 50/50 and Clue coins on your ledge, and a 2x Double Down throw-switch when you feel brave.',
        voiceClipId: 'vo_cold_2',
        hostPose: 'welcome',
        backdropUrl: V5_VENUE_STAGES[1],
      },
      {
        speaker: 'frankie_russo',
        speakerName: 'Frankie "Last Call" Russo',
        speakerRole: 'Unbeaten Oakridge Champ',
        text: 'Six years undefeated behind this bar, kid. Put your $250 on the wood or head home.',
        voiceClipId: 'vo_cold_3',
        hostPose: 'hype',
        backdropUrl: V5_VENUE_STAGES[1],
      },
    ],
    choices: [
      {
        attitude: 'RUTHLESS_CONFIDENCE',
        label: "Keep the tab open—this won't take long.",
        playerSpokenText: "Keep the tab open—this won't take long.",
        rivalReplyText: 'Ooh, spicy! Apex TV scouts love a loudmouth—let us see if your trivia matches your swagger.',
        rivalReplyVoiceId: 'vo_frankie_reply_bold',
        hostReplyText: 'Now that is prime-time television! Step to the podium and light up the board!',
        hostReplyVoiceId: 'vo_cold_4',
        rivalAffinityDelta: -10,
        sponsorRepDelta: { APEX_NETWORK: 15 },
      },
      {
        attitude: 'WARM_RESPECT',
        label: 'May the sharpest memory win, Frankie.',
        playerSpokenText: 'May the sharpest memory win, Frankie.',
        rivalReplyText: 'Class act. Tell you what—hold your nerve on the 2x switch and I might slip you my lucky bar coaster later.',
        rivalReplyVoiceId: 'vo_frankie_reply_respect',
        hostReplyText: 'Sportsmanship in Brooklyn—miracles really do happen on live mic!',
        hostReplyVoiceId: 'vo_cold_5',
        rivalAffinityDelta: 25,
        sponsorRepDelta: { INDEPENDENT: 12 },
      },
      {
        attitude: 'SHARP_WIT',
        label: 'Do I still get free pretzels if I sweep?',
        playerSpokenText: 'Do I still get free pretzels if I sweep?',
        rivalReplyText: 'Ha! Sweep a full row on my board and the pretzels—and the applause—are on the house.',
        rivalReplyVoiceId: 'vo_frankie_reply_witty',
        hostReplyText: 'The crowd is already chanting! Wire up the cables, spin the dial, and let us play!',
        hostReplyVoiceId: 'vo_cold_6',
        rivalAffinityDelta: 12,
        sponsorRepDelta: { INDEPENDENT: 8, VELVET_SOCIETY: 6 },
      },
    ],
  };
}

function buildFallbackAllyCallScene(challengerId: ChallengerIdV5): InteractiveStorySceneV5 {
  const profile = RIVAL_PROFILES_V5[challengerId];
  return {
    sceneId: profile.allyCallSceneId,
    kind: 'GREEN_ROOM_CALL',
    title: `Green-Room Call: ${profile.displayName}`,
    locationSubhead: 'BACKSTAGE GREEN ROOM',
    backdropUrl: V5_GREENROOM_BACKDROPS.TV_DRESSING_ROOM,
    featuredChallengerId: challengerId,
    beats: [
      {
        speaker: 'producer_sam',
        speakerName: 'Producer Sam',
        speakerRole: 'Backstage Showrunner',
        text: `Line one is blinking—${profile.displayName} is calling your dressing room ahead of tonight's broadcast.`,
        voiceClipId: 'vo_sam_5',
        hostPose: 'welcome',
      },
      {
        speaker: challengerId,
        speakerName: profile.displayName,
        speakerRole: profile.nicknameTitle,
        text: profile.allyCoachingTip,
        voiceClipId: `vo_${profile.shortKey}_ally_call`,
        hostPose: 'hype',
      },
    ],
    closingBeats: [
      {
        speaker: 'max_sterling',
        speakerName: 'Max Sterling',
        speakerRole: 'Prime-Time Host',
        text: `Rivals turned into your backstage brain trust—equip that signature Podium Lucky Charm inside your Tour Trunk before curtain up.`,
        voiceClipId: 'vo_max_board_welcome_2',
        hostPose: 'hype',
      },
    ],
  };
}

function buildFallbackEndingScene(endingId: EndingIdV5): InteractiveStorySceneV5 {
  const meta = ENDING_META[endingId];
  const sceneId = ENDING_SCENE_IDS[endingId];
  const linesByEnding: Record<EndingIdV5, readonly VoicedDialogueBeatV5[]> = {
    PEOPLES_CHAMPION: [
      {
        speaker: 'max_sterling',
        speakerName: 'Max Sterling',
        speakerRole: 'Prime-Time Host',
        text: 'One point four billion voices roaring in unison! No corporate handlers, no compromises—just pure curiosity and the friends you won along the road.',
        voiceClipId: 'vo_max_ending_crown_1',
        hostPose: 'hype',
        backdropUrl: V5_STORY_PLATES.worldCoronation,
      },
      {
        speaker: 'viktor_volkov',
        speakerName: 'Grandmaster Viktor Volkov',
        speakerRole: 'Former World Champion',
        text: 'You brought a whole community to a solitary throne. The crown belongs to you—well played.',
        voiceClipId: 'vo_viktor_defeat',
        hostPose: 'welcome',
        backdropUrl: V5_VENUE_STAGES[8],
      },
    ],
    NETWORK_SOVEREIGN: [
      {
        speaker: 'max_sterling',
        speakerName: 'Max Sterling',
        speakerRole: 'Prime-Time Host',
        text: 'Ratings shattered on every continent! Every Showman Dare cashed, every camera locked on you—behold the undisputed Network Sovereign!',
        voiceClipId: 'vo_max_ending_crown_2',
        hostPose: 'hype',
        backdropUrl: V5_STORY_PLATES.worldCoronation,
      },
      {
        speaker: 'producer_sam',
        speakerName: 'Producer Sam',
        speakerRole: 'Executive Showrunner',
        text: 'Apex just offered you your own prime-time syndicate franchise—and ten million dollars is only the signing bonus.',
        voiceClipId: 'vo_sam_6',
        hostPose: 'hype',
        backdropUrl: V5_VENUE_STAGES[8],
      },
    ],
    VELVET_GRANDMASTER: [
      {
        speaker: 'nadia_al_mansoor',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Velvet Society Laureate',
        text: 'From midnight wax-sealed salons to the brightest arena on Earth—the Velvet Society bows to its newest Grandmaster.',
        voiceClipId: 'vo_nadia_ally_call',
        hostPose: 'hype',
        backdropUrl: V5_STORY_PLATES.worldCoronation,
      },
      {
        speaker: 'max_sterling',
        speakerName: 'Max Sterling',
        speakerRole: 'Prime-Time Host',
        text: 'Every forbidden board cracked, every vault unlocked—tonight belongs to the Velvet Grandmaster!',
        voiceClipId: 'vo_max_ending_crown_1',
        hostPose: 'hype',
        backdropUrl: V5_VENUE_STAGES[8],
      },
    ],
    CINDERELLA_REDEMPTION: [
      {
        speaker: 'frankie_russo',
        speakerName: 'Frankie "Last Call" Russo',
        speakerRole: 'Oakridge Ally',
        text: 'They wrote you off in a two-A.M. diner wildcard, kid—and you just lifted the ten-million-dollar crown in front of the entire planet!',
        voiceClipId: 'vo_frankie_ally_call',
        hostPose: 'hype',
        backdropUrl: V5_STORY_PLATES.worldCoronation,
      },
      {
        speaker: 'max_sterling',
        speakerName: 'Max Sterling',
        speakerRole: 'Prime-Time Host',
        text: 'Knocked down, never counted out! History will never forget the greatest Cinderella Redemption comeback ever broadcast!',
        voiceClipId: 'vo_max_ending_crown_2',
        hostPose: 'hype',
        backdropUrl: V5_VENUE_STAGES[8],
      },
    ],
  };

  return {
    sceneId,
    kind: 'ENDING',
    title: meta.title,
    locationSubhead: 'WORLDWIDE CORONATION',
    backdropUrl: V5_STORY_PLATES.worldCoronation,
    featuredChallengerId: endingId === 'VELVET_GRANDMASTER' ? 'nadia_al_mansoor' : endingId === 'CINDERELLA_REDEMPTION' ? 'frankie_russo' : 'viktor_volkov',
    beats: linesByEnding[endingId],
  };
}

function buildFallbackScenesMap(): Map<string, InteractiveStorySceneV5> {
  const map = new Map<string, InteractiveStorySceneV5>();
  const cold = buildFallbackColdOpenScene();
  map.set(cold.sceneId, cold);

  for (const cid of ALL_CHALLENGER_IDS_V5) {
    const allyScene = buildFallbackAllyCallScene(cid);
    map.set(allyScene.sceneId, allyScene);
  }
  for (const eid of ALL_ENDING_IDS_V5) {
    const endScene = buildFallbackEndingScene(eid);
    map.set(endScene.sceneId, endScene);
  }

  map.set('scene_act1_m1_walkout', {
    sceneId: 'scene_act1_m1_walkout',
    kind: 'STAGE_WALKOUT',
    title: 'Oakridge Opening Bell',
    locationSubhead: 'OAKRIDGE HALL',
    backdropUrl: V5_VENUE_STAGES[1],
    featuredChallengerId: 'frankie_russo',
    beats: [
      {
        speaker: 'max_sterling',
        speakerName: 'Max Sterling',
        speakerRole: 'Prime-Time Host',
        text: 'Lights up in Oakridge! Forty-two neighbors are leaning forward—beat Frankie on the Classic Showcase board to punch your ticket downtown.',
        voiceClipId: 'vo_max_board_welcome_1',
        hostPose: 'hype',
      },
    ],
  });

  map.set('scene_act1_m1_win', {
    sceneId: 'scene_act1_m1_win',
    kind: 'ACT_CLIMAX',
    title: 'Upset at Oakridge',
    locationSubhead: 'OAKRIDGE HALL',
    backdropUrl: V5_STORY_PLATES.scoutBreakthrough,
    featuredChallengerId: 'frankie_russo',
    beats: [
      {
        speaker: 'frankie_russo',
        speakerName: 'Frankie "Last Call" Russo',
        speakerRole: 'Oakridge Tavern Legend',
        text: 'Six years unbeaten, snapped on my own floorboards. That broadcast scout in the back row just dropped her coffee—go show downtown what Oakridge built.',
        voiceClipId: 'vo_frankie_defeat',
        hostPose: 'hype',
      },
    ],
  });

  map.set('scene_act1_m1_loss', {
    sceneId: 'scene_act1_m1_loss',
    kind: 'REDEMPTION_BEAT',
    title: 'Last Call Detour',
    locationSubhead: 'OAKRIDGE BACK ALLEY',
    backdropUrl: V5_GREENROOM_BACKDROPS.LOCAL_PUB,
    featuredChallengerId: 'frankie_russo',
    beats: [
      {
        speaker: 'frankie_russo',
        speakerName: 'Frankie "Last Call" Russo',
        speakerRole: 'Oakridge Tavern Legend',
        text: 'Not your night yet—but the tour does not end on one stumble. There is a 2 AM Redemption Wildcard down at the Silver Spoon Diner if you have the grit.',
        voiceClipId: 'vo_frankie_win',
        hostPose: 'wince',
      },
      {
        speaker: 'max_sterling',
        speakerName: 'Max Sterling',
        speakerRole: 'Prime-Time Host',
        text: 'Your Tour Trunk just pinned a crimson Redemption flyer—or you can burn your one-time Contract Mulligan for an immediate rematch right here.',
        voiceClipId: 'vo_max_redemption_1',
        hostPose: 'welcome',
      },
    ],
  });

  map.set('scene_act1_r1_redemption', {
    sceneId: 'scene_act1_r1_redemption',
    kind: 'REDEMPTION_BEAT',
    title: 'Neon Coffee & Wildcard Grit',
    locationSubhead: 'SILVER SPOON DINER · 2 AM',
    backdropUrl: V5_GREENROOM_BACKDROPS.LOCAL_PUB,
    featuredChallengerId: 'frankie_russo',
    beats: [
      {
        speaker: 'max_sterling',
        speakerName: 'Max Sterling',
        speakerRole: 'Prime-Time Host',
        text: 'Welcome to the Late-Night Redemption Circuit—no studio makeup, just hot coffee, a ticking Time-Bomb board, and a back door straight back to prime time.',
        voiceClipId: 'vo_max_redemption_2',
        hostPose: 'hype',
      },
    ],
  });

  map.set('scene_act5_finale_walkout', {
    sceneId: 'scene_act5_finale_walkout',
    kind: 'STAGE_WALKOUT',
    title: 'One Point Four Billion Watching',
    locationSubhead: 'GLOBAL CHAMPIONSHIP FINALE',
    backdropUrl: V5_VENUE_STAGES[8],
    featuredChallengerId: 'viktor_volkov',
    beats: [
      {
        speaker: 'max_sterling',
        speakerName: 'Max Sterling',
        speakerRole: 'Prime-Time Host',
        text: 'From forty-two folding chairs in Brooklyn to one point four billion viewers live worldwide. Ten million dollars—and the title of World’s Smartest—on the line!',
        voiceClipId: 'vo_max_ending_crown_1',
        hostPose: 'hype',
      },
      {
        speaker: 'viktor_volkov',
        speakerName: 'Grandmaster Viktor Volkov',
        speakerRole: 'Defending World Champion',
        text: 'Many challengers climb this staircase. None have survived the six-column Championship Gauntlet. Let us begin.',
        voiceClipId: 'vo_viktor_walkout',
        hostPose: 'hype',
      },
    ],
  });

  return map;
}

// ============================================================================
// 4. BRANCHING CAMPAIGN ENGINE (88-Node Graph + 5-Slot Store + Fail-Forward)
// ============================================================================

export class BranchingCampaignEngine {
  private readonly nodesMap = new Map<string, CampaignNodeExtendedV5>();
  private orderedNodes: CampaignNodeExtendedV5[] = [];
  private readonly scenesMap = new Map<string, InteractiveStorySceneV5>();
  private readonly fallbackScenesMap: Map<string, InteractiveStorySceneV5>;
  private readonly memorySlots = new Map<CampaignSlotIdV5, string>();
  private readonly listeners = new Set<(state: BranchingCampaignStateV5) => void>();
  private activeSlotId: CampaignSlotIdV5 = 1;
  private packsLoaded = false;

  constructor() {
    this.fallbackScenesMap = buildFallbackScenesMap();
    this.hydrateFromPayloads(
      { nodes: buildFallbackNodes(), scenes: Array.from(this.fallbackScenesMap.values()) },
      null,
    );
    this.packsLoaded = false; // Fallback seeded; real JSON packs still eligible to hydrate
    this.activeSlotId = this.readPersistedActiveSlotId() ?? 1;
  }

  // --------------------------------------------------------------------------
  // DATA LOADING & GRAPH MERGING (`v5_story_acts_1_2.json` + `v5_story_acts_3_5.json`)
  // --------------------------------------------------------------------------

  public async loadStoryPacks(options?: {
    acts12Url?: string;
    acts35Url?: string;
    forceReload?: boolean;
  }): Promise<{ loadedNodes: number; loadedScenes: number; usedFallback: boolean }> {
    if (this.packsLoaded && !options?.forceReload) {
      return {
        loadedNodes: this.orderedNodes.length,
        loadedScenes: this.scenesMap.size,
        usedFallback: false,
      };
    }

    const url12 = options?.acts12Url ?? DEFAULT_STORY_ACTS_1_2_URL;
    const url35 = options?.acts35Url ?? DEFAULT_STORY_ACTS_3_5_URL;

    if (typeof fetch !== 'function') {
      return {
        loadedNodes: this.orderedNodes.length,
        loadedScenes: this.scenesMap.size,
        usedFallback: true,
      };
    }

    const fetchJson = async (url: string): Promise<StoryPackPayloadV5 | null> => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return (await res.json()) as StoryPackPayloadV5;
      } catch {
        return null;
      }
    };

    const [acts12, acts35] = await Promise.all([fetchJson(url12), fetchJson(url35)]);
    if (!acts12 && !acts35) {
      return {
        loadedNodes: this.orderedNodes.length,
        loadedScenes: this.scenesMap.size,
        usedFallback: true,
      };
    }

    const result = this.hydrateFromPayloads(acts12, acts35);
    this.packsLoaded = true;
    // Re-sanitize active slot against newly loaded full 88-node catalog
    const state = this.getState();
    this.writeSlot(state);
    return { ...result, usedFallback: false };
  }

  public hydrateFromPayloads(
    acts12?: StoryPackPayloadV5 | null,
    acts35?: StoryPackPayloadV5 | null,
  ): { loadedNodes: number; loadedScenes: number } {
    const incomingNodes: CampaignNodeExtendedV5[] = [];
    if (Array.isArray(acts12?.nodes)) incomingNodes.push(...acts12.nodes);
    if (Array.isArray(acts35?.nodes)) incomingNodes.push(...acts35.nodes);

    if (incomingNodes.length > 0) {
      this.nodesMap.clear();
      for (const rawNode of incomingNodes) {
        if (!rawNode || typeof rawNode.nodeId !== 'string' || !rawNode.nodeId.trim()) continue;
        this.nodesMap.set(rawNode.nodeId, rawNode);
      }
      this.orderedNodes = Array.from(this.nodesMap.values()).sort((a, b) => {
        if (a.actNumber !== b.actNumber) return a.actNumber - b.actNumber;
        if (a.tierNumber !== b.tierNumber) return a.tierNumber - b.tierNumber;
        return 0;
      });
    }

    // Seed fallback scenes first, then let authored JSON packs override any matching IDs
    this.scenesMap.clear();
    for (const [id, scene] of this.fallbackScenesMap.entries()) {
      this.scenesMap.set(id, scene);
    }

    const incomingScenes = [
      ...normalizeScenesInput(acts12?.scenes),
      ...normalizeScenesInput(acts12?.endings),
      ...normalizeScenesInput(acts35?.scenes),
      ...normalizeScenesInput(acts35?.endings),
    ];
    for (const scene of incomingScenes) {
      this.scenesMap.set(scene.sceneId, scene);
    }

    if (incomingNodes.length > 0) {
      this.packsLoaded = true;
    }

    return {
      loadedNodes: this.orderedNodes.length,
      loadedScenes: this.scenesMap.size,
    };
  }

  public validateCampaignGraph(): CampaignGraphAuditV5 {
    const initialNodeIds = this.getInitialNodeIds();
    const deadEndLinks: Array<{ fromNodeId: string; targetNodeId: string; edge: 'win' | 'loss' | 'secret' }> = [];

    for (const node of this.orderedNodes) {
      for (const target of node.onWinUnlockIds ?? []) {
        if (!this.nodesMap.has(target)) {
          deadEndLinks.push({ fromNodeId: node.nodeId, targetNodeId: target, edge: 'win' });
        }
      }
      for (const target of node.onLossUnlockIds ?? []) {
        if (!this.nodesMap.has(target)) {
          deadEndLinks.push({ fromNodeId: node.nodeId, targetNodeId: target, edge: 'loss' });
        }
      }
      for (const target of node.secretUnlockIds ?? []) {
        if (!this.nodesMap.has(target)) {
          deadEndLinks.push({ fromNodeId: node.nodeId, targetNodeId: target, edge: 'secret' });
        }
      }
    }

    const visited = new Set<string>(initialNodeIds);
    const queue = [...initialNodeIds];
    while (queue.length > 0) {
      const id = queue.shift()!;
      const node = this.nodesMap.get(id);
      if (!node) continue;
      const neighbors = [
        ...(node.onWinUnlockIds ?? []),
        ...(node.onLossUnlockIds ?? []),
        ...(node.secretUnlockIds ?? []),
      ];
      for (const nextId of neighbors) {
        if (this.nodesMap.has(nextId) && !visited.has(nextId)) {
          visited.add(nextId);
          queue.push(nextId);
        }
      }
    }

    const orphanNodeIds = this.orderedNodes
      .filter((n) => !visited.has(n.nodeId))
      .map((n) => n.nodeId);

    const actsCovered = Array.from(new Set(this.orderedNodes.map((n) => n.actNumber))).sort((a, b) => a - b);
    const lanesPresent = Array.from(new Set(this.orderedNodes.map((n) => n.lane)));
    const twistsCovered = Array.from(new Set(this.orderedNodes.map((n) => inferBoardTwistForNode(n))));
    const missingEndingSceneIds = ALL_ENDING_IDS_V5.map((id) => ENDING_SCENE_IDS[id]).filter(
      (sceneId) => !this.scenesMap.has(sceneId),
    );

    return {
      totalNodes: this.orderedNodes.length,
      totalScenes: this.scenesMap.size,
      actsCovered,
      initialNodeIds,
      deadEndLinks,
      orphanNodeIds,
      reachableNodeCount: visited.size,
      missingEndingSceneIds,
      lanesPresent,
      twistsCovered,
    };
  }

  // --------------------------------------------------------------------------
  // 5-SLOT LOCALSTORAGE PERSISTENCE (`ws_v5_campaign_slot_1..5`)
  // --------------------------------------------------------------------------

  private readRaw(key: string): string | null {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        return localStorage.getItem(key);
      }
    } catch {
      // Fallback to in-memory slot store
    }
    return null;
  }

  private writeRaw(key: string, value: string): void {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(key, value);
      }
    } catch {
      // Ignore quota / sandbox errors
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

  private readPersistedActiveSlotId(): CampaignSlotIdV5 | null {
    const raw = this.readRaw(ACTIVE_CAMPAIGN_SLOT_KEY_V5);
    const parsed = Number(raw);
    return isValidCampaignSlotIdV5(parsed) ? parsed : null;
  }

  private getInitialNodeIds(): string[] {
    const flagged = this.orderedNodes.filter((n) => n.initialUnlocked).map((n) => n.nodeId);
    if (flagged.length > 0) return flagged;
    if (this.nodesMap.has('act1_m1')) return ['act1_m1'];
    return this.orderedNodes.length > 0 ? [this.orderedNodes[0].nodeId] : ['act1_m1'];
  }

  public createFreshState(
    slotId: CampaignSlotIdV5,
    contestantName = 'Challenger',
  ): BranchingCampaignStateV5 {
    const initialNodes = this.getInitialNodeIds();
    const startNodeId = initialNodes[0] ?? 'act1_m1';
    const cleanName = contestantName.trim().slice(0, 32) || 'Challenger';
    return {
      version: '5.0',
      slotId,
      contestantName: cleanName,
      coldOpenCompleted: false,
      currentAct: 1,
      currentNodeId: startNodeId,
      unlockedNodeIds: [...initialNodes],
      wonNodeIds: [],
      lostNodeIds: [],
      nodeStars: {},
      nodeHighScores: {},
      bankrollUsd: 500,
      careerEarningsUsd: 0,
      liveWorldAudience: 42,
      activeSponsor: 'INDEPENDENT',
      sponsorRep: createInitialSponsorRep(),
      rivalAffinity: createZeroAffinityMap(),
      unlockedCharms: [],
      equippedCharms: [],
      seenSceneIds: [],
      inboxCallsQueue: [],
      pressClippings: [],
      totalMatchesPlayed: 0,
      totalMatchesWon: 0,
      comebackWinsFromRedemption: 0,
      unlockedEndings: [],
      mechanicsIntroduced: [],
      contractMulligansRemaining: 1,
      mulliganUsedOnNodeIds: [],
      activeGrudgeSabotages: [],
      completedDareIds: [],
      failedDareIds: [],
      storyChoiceHistory: [],
      rivalAllyCallsUnlocked: [],
      rivalGrudgesTriggered: [],
      updatedAtIso: new Date().toISOString(),
    };
  }

  private sanitizeState(slotId: CampaignSlotIdV5, raw: unknown): BranchingCampaignStateV5 {
    const base = this.createFreshState(slotId);
    if (!raw || typeof raw !== 'object') return base;
    const obj = raw as Partial<BranchingCampaignStateV5>;

    const initialIds = this.getInitialNodeIds();
    const unlockedSet = new Set<string>(initialIds);
    if (Array.isArray(obj.unlockedNodeIds)) {
      for (const id of obj.unlockedNodeIds) {
        if (typeof id === 'string' && id.trim()) {
          unlockedSet.add(id);
        }
      }
    }

    const wonNodeIds = Array.isArray(obj.wonNodeIds) ? dedupeStrings(obj.wonNodeIds) : [];
    const lostNodeIds = Array.isArray(obj.lostNodeIds) ? dedupeStrings(obj.lostNodeIds) : [];
    for (const id of [...wonNodeIds, ...lostNodeIds]) {
      unlockedSet.add(id);
    }

    const nodeStars: Record<string, 0 | 1 | 2 | 3> = {};
    if (obj.nodeStars && typeof obj.nodeStars === 'object') {
      for (const [k, v] of Object.entries(obj.nodeStars)) {
        const clamped = Math.max(0, Math.min(3, Math.trunc(Number(v) || 0))) as 0 | 1 | 2 | 3;
        nodeStars[k] = clamped;
      }
    }

    const nodeHighScores: Record<string, number> = {};
    if (obj.nodeHighScores && typeof obj.nodeHighScores === 'object') {
      for (const [k, v] of Object.entries(obj.nodeHighScores)) {
        nodeHighScores[k] = Math.max(0, Math.round(Number(v) || 0));
      }
    }

    const sponsorRep = createInitialSponsorRep();
    if (obj.sponsorRep && typeof obj.sponsorRep === 'object') {
      for (const s of ALL_SPONSOR_IDS_V5) {
        const val = Number((obj.sponsorRep as Record<string, unknown>)[s]);
        if (Number.isFinite(val)) sponsorRep[s] = Math.max(-100, Math.min(200, Math.round(val)));
      }
    }

    const rivalAffinity = createZeroAffinityMap();
    if (obj.rivalAffinity && typeof obj.rivalAffinity === 'object') {
      for (const c of ALL_CHALLENGER_IDS_V5) {
        const val = Number((obj.rivalAffinity as Record<string, unknown>)[c]);
        if (Number.isFinite(val)) rivalAffinity[c] = clampAffinity(val);
      }
    }

    const unlockedCharms = Array.isArray(obj.unlockedCharms)
      ? Array.from(new Set(obj.unlockedCharms.filter(isCharmIdV5)))
      : [];
    const equippedCharms = Array.isArray(obj.equippedCharms)
      ? Array.from(
          new Set(
            obj.equippedCharms.filter((c): c is CharmIdV5 => isCharmIdV5(c) && unlockedCharms.includes(c)),
          ),
        ).slice(0, MAX_EQUIPPED_CHARMS_V5)
      : [];

    const unlockedEndings = Array.isArray(obj.unlockedEndings)
      ? Array.from(new Set(obj.unlockedEndings.filter(isEndingIdV5)))
      : [];

    const currentActRaw = Number(obj.currentAct);
    const currentAct: 1 | 2 | 3 | 4 | 5 =
      currentActRaw === 1 ||
      currentActRaw === 2 ||
      currentActRaw === 3 ||
      currentActRaw === 4 ||
      currentActRaw === 5
        ? currentActRaw
        : 1;

    const currentNodeId =
      typeof obj.currentNodeId === 'string' && obj.currentNodeId.trim()
        ? obj.currentNodeId
        : base.currentNodeId;

    const pressClippings = Array.isArray(obj.pressClippings)
      ? obj.pressClippings
          .filter(
            (p): p is BranchingCampaignSaveStateV5['pressClippings'][number] =>
              Boolean(p && typeof p.headline === 'string' && typeof p.nodeId === 'string'),
          )
          .slice(0, MAX_PRESS_CLIPPINGS_V5)
      : [];

    const activeGrudgeSabotages: ActiveGrudgeSabotageV5[] = Array.isArray(obj.activeGrudgeSabotages)
      ? obj.activeGrudgeSabotages.filter(
          (g): g is ActiveGrudgeSabotageV5 =>
            Boolean(g && typeof g.sabotageId === 'string' && isChallengerIdV5(g.rivalId)),
        )
      : [];

    const storyChoiceHistory: StoryChoiceHistoryEntryV5[] = Array.isArray(obj.storyChoiceHistory)
      ? obj.storyChoiceHistory.filter(
          (e): e is StoryChoiceHistoryEntryV5 =>
            Boolean(e && typeof e.sceneId === 'string' && typeof e.attitude === 'string'),
        )
      : [];

    return {
      version: '5.0',
      slotId,
      contestantName:
        typeof obj.contestantName === 'string' && obj.contestantName.trim()
          ? obj.contestantName.trim().slice(0, 32)
          : 'Challenger',
      coldOpenCompleted: Boolean(obj.coldOpenCompleted),
      currentAct,
      currentNodeId,
      unlockedNodeIds: Array.from(unlockedSet),
      wonNodeIds,
      lostNodeIds,
      nodeStars,
      nodeHighScores,
      bankrollUsd: Math.max(0, Math.round(Number(obj.bankrollUsd ?? base.bankrollUsd) || 0)),
      careerEarningsUsd: Math.max(0, Math.round(Number(obj.careerEarningsUsd) || 0)),
      liveWorldAudience: Math.max(42, Math.round(Number(obj.liveWorldAudience) || 42)),
      activeSponsor: isSponsorIdV5(obj.activeSponsor) ? obj.activeSponsor : 'INDEPENDENT',
      sponsorRep,
      rivalAffinity,
      unlockedCharms,
      equippedCharms,
      seenSceneIds: Array.isArray(obj.seenSceneIds) ? dedupeStrings(obj.seenSceneIds) : [],
      inboxCallsQueue: Array.isArray(obj.inboxCallsQueue) ? dedupeStrings(obj.inboxCallsQueue) : [],
      pressClippings,
      totalMatchesPlayed: Math.max(0, Math.trunc(Number(obj.totalMatchesPlayed) || 0)),
      totalMatchesWon: Math.max(0, Math.trunc(Number(obj.totalMatchesWon) || 0)),
      comebackWinsFromRedemption: Math.max(0, Math.trunc(Number(obj.comebackWinsFromRedemption) || 0)),
      unlockedEndings,
      mechanicsIntroduced: Array.isArray(obj.mechanicsIntroduced)
        ? dedupeStrings(obj.mechanicsIntroduced)
        : [],
      contractMulligansRemaining:
        typeof obj.contractMulligansRemaining === 'number' && Number.isFinite(obj.contractMulligansRemaining)
          ? Math.max(0, Math.trunc(obj.contractMulligansRemaining))
          : 1,
      mulliganUsedOnNodeIds: Array.isArray(obj.mulliganUsedOnNodeIds)
        ? dedupeStrings(obj.mulliganUsedOnNodeIds)
        : [],
      activeGrudgeSabotages,
      completedDareIds: Array.isArray(obj.completedDareIds) ? dedupeStrings(obj.completedDareIds) : [],
      failedDareIds: Array.isArray(obj.failedDareIds) ? dedupeStrings(obj.failedDareIds) : [],
      storyChoiceHistory,
      rivalAllyCallsUnlocked: Array.isArray(obj.rivalAllyCallsUnlocked)
        ? Array.from(new Set(obj.rivalAllyCallsUnlocked.filter(isChallengerIdV5)))
        : [],
      rivalGrudgesTriggered: Array.isArray(obj.rivalGrudgesTriggered)
        ? Array.from(new Set(obj.rivalGrudgesTriggered.filter(isChallengerIdV5)))
        : [],
      updatedAtIso: typeof obj.updatedAtIso === 'string' ? obj.updatedAtIso : base.updatedAtIso,
    };
  }

  private readSlot(slotId: CampaignSlotIdV5): BranchingCampaignStateV5 | null {
    const raw = this.readRaw(campaignSlotStorageKeyV5(slotId)) ?? this.memorySlots.get(slotId) ?? null;
    if (!raw) return null;
    try {
      return this.sanitizeState(slotId, JSON.parse(raw));
    } catch {
      return null;
    }
  }

  private writeSlot(state: BranchingCampaignStateV5): void {
    state.updatedAtIso = new Date().toISOString();
    const serialized = JSON.stringify(state);
    this.memorySlots.set(state.slotId, serialized);
    this.writeRaw(campaignSlotStorageKeyV5(state.slotId), serialized);
  }

  private notify(state: BranchingCampaignStateV5): void {
    const snapshot = this.cloneState(state);
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private cloneState(state: BranchingCampaignStateV5): BranchingCampaignStateV5 {
    return JSON.parse(JSON.stringify(state)) as BranchingCampaignStateV5;
  }

  public subscribe(listener: (state: BranchingCampaignStateV5) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getActiveSlotId(): CampaignSlotIdV5 {
    const persisted = this.readPersistedActiveSlotId();
    if (persisted) this.activeSlotId = persisted;
    return this.activeSlotId;
  }

  public setActiveSlotId(slotId: CampaignSlotIdV5): BranchingCampaignStateV5 {
    this.activeSlotId = slotId;
    this.writeRaw(ACTIVE_CAMPAIGN_SLOT_KEY_V5, String(slotId));
    const existing = this.readSlot(slotId) ?? this.createFreshState(slotId);
    this.writeSlot(existing);
    this.notify(existing);
    return this.cloneState(existing);
  }

  public getState(slotId: CampaignSlotIdV5 = this.getActiveSlotId()): BranchingCampaignStateV5 {
    const existing = this.readSlot(slotId);
    if (existing) return this.cloneState(existing);
    const fresh = this.createFreshState(slotId);
    this.writeSlot(fresh);
    return this.cloneState(fresh);
  }

  private mutateActiveState(mutator: (state: BranchingCampaignStateV5) => void): BranchingCampaignStateV5 {
    const slotId = this.getActiveSlotId();
    const state = this.readSlot(slotId) ?? this.createFreshState(slotId);
    mutator(state);
    this.writeSlot(state);
    this.notify(state);
    return this.cloneState(state);
  }

  public startNewCampaignInSlot(
    slotId: CampaignSlotIdV5,
    contestantName = 'Challenger',
  ): BranchingCampaignStateV5 {
    this.activeSlotId = slotId;
    this.writeRaw(ACTIVE_CAMPAIGN_SLOT_KEY_V5, String(slotId));
    const fresh = this.createFreshState(slotId, contestantName);
    this.writeSlot(fresh);
    this.notify(fresh);
    return this.cloneState(fresh);
  }

  public resetSlot(slotId: CampaignSlotIdV5): BranchingCampaignStateV5 {
    const existing = this.readSlot(slotId);
    const fresh = this.createFreshState(slotId, existing?.contestantName ?? 'Challenger');
    this.writeSlot(fresh);
    if (slotId === this.getActiveSlotId()) {
      this.notify(fresh);
    }
    return this.cloneState(fresh);
  }

  public deleteSlot(slotId: CampaignSlotIdV5): void {
    this.memorySlots.delete(slotId);
    this.removeRaw(campaignSlotStorageKeyV5(slotId));
    if (slotId === this.getActiveSlotId()) {
      const fresh = this.createFreshState(slotId);
      this.writeSlot(fresh);
      this.notify(fresh);
    }
  }

  public exportSlotJson(slotId: CampaignSlotIdV5 = this.getActiveSlotId()): string {
    const state = this.readSlot(slotId) ?? this.createFreshState(slotId);
    return JSON.stringify(state, null, 2);
  }

  public importSlotJson(
    slotId: CampaignSlotIdV5,
    rawJson: string,
  ): { ok: boolean; message: string; state?: BranchingCampaignStateV5 } {
    try {
      const parsed = JSON.parse(rawJson) as unknown;
      if (!parsed || typeof parsed !== 'object') {
        return { ok: false, message: 'Save JSON must be a valid campaign object.' };
      }
      const sanitized = this.sanitizeState(slotId, parsed);
      this.writeSlot(sanitized);
      if (slotId === this.getActiveSlotId()) {
        this.notify(sanitized);
      }
      return { ok: true, message: `Imported Contestant Dossier into Slot ${slotId}.`, state: this.cloneState(sanitized) };
    } catch {
      return { ok: false, message: 'Invalid JSON syntax in imported dossier.' };
    }
  }

  public listSlotSummaries(): CampaignSlotSummaryV5[] {
    const activeId = this.getActiveSlotId();
    const totalNodes = Math.max(1, this.orderedNodes.length);
    const maxStars = totalNodes * 3;

    return ALL_CAMPAIGN_SLOT_IDS_V5.map((slotId) => {
      const saved = this.readSlot(slotId);
      if (!saved) {
        return {
          slotId,
          isEmpty: true,
          isActive: slotId === activeId,
          contestantName: 'Empty Slot',
          coldOpenCompleted: false,
          currentAct: 1,
          currentNodeId: this.getInitialNodeIds()[0] ?? 'act1_m1',
          currentVenueName: 'Oakridge Community Hall',
          wonNodesCount: 0,
          lostNodesCount: 0,
          totalNodesCount: totalNodes,
          totalStars: 0,
          maxStars,
          bankrollUsd: 500,
          careerEarningsUsd: 0,
          liveWorldAudience: 42,
          activeSponsor: 'INDEPENDENT',
          unlockedCharmsCount: 0,
          unlockedEndingsCount: 0,
          comebackWinsFromRedemption: 0,
          updatedAtIso: null,
        };
      }
      const currentNode = this.nodesMap.get(saved.currentNodeId);
      const totalStars = Object.values(saved.nodeStars).reduce<number>((acc, s) => acc + s, 0);
      return {
        slotId,
        isEmpty: false,
        isActive: slotId === activeId,
        contestantName: saved.contestantName,
        coldOpenCompleted: saved.coldOpenCompleted,
        currentAct: saved.currentAct,
        currentNodeId: saved.currentNodeId,
        currentVenueName: currentNode?.venueName ?? 'Oakridge Community Hall',
        wonNodesCount: saved.wonNodeIds.length,
        lostNodesCount: saved.lostNodeIds.length,
        totalNodesCount: totalNodes,
        totalStars,
        maxStars,
        bankrollUsd: saved.bankrollUsd,
        careerEarningsUsd: saved.careerEarningsUsd,
        liveWorldAudience: saved.liveWorldAudience,
        activeSponsor: saved.activeSponsor,
        unlockedCharmsCount: saved.unlockedCharms.length,
        unlockedEndingsCount: saved.unlockedEndings.length,
        comebackWinsFromRedemption: saved.comebackWinsFromRedemption,
        updatedAtIso: saved.updatedAtIso,
      };
    });
  }

  // --------------------------------------------------------------------------
  // NODE & SCENE QUERIES
  // --------------------------------------------------------------------------

  public getAllNodes(): readonly CampaignNodeExtendedV5[] {
    return this.orderedNodes;
  }

  public getNodesByAct(act: 1 | 2 | 3 | 4 | 5): readonly CampaignNodeExtendedV5[] {
    return this.orderedNodes.filter((n) => n.actNumber === act);
  }

  public getNodesByLane(lane: CampaignBracketLaneV5): readonly CampaignNodeExtendedV5[] {
    return this.orderedNodes.filter((n) => n.lane === lane);
  }

  public getNode(nodeId: string): CampaignNodeExtendedV5 | null {
    return this.nodesMap.get(nodeId) ?? null;
  }

  public getUnlockedNodes(state: BranchingCampaignStateV5 = this.getState()): readonly CampaignNodeExtendedV5[] {
    const unlocked = new Set(state.unlockedNodeIds);
    return this.orderedNodes.filter((n) => unlocked.has(n.nodeId));
  }

  public getRecommendedNextNode(state: BranchingCampaignStateV5 = this.getState()): CampaignNodeExtendedV5 | null {
    const wonSet = new Set(state.wonNodeIds);
    const unlockedNodes = this.getUnlockedNodes(state);
    // Prefer an unplayed current node
    const current = this.nodesMap.get(state.currentNodeId);
    if (current && state.unlockedNodeIds.includes(current.nodeId) && !wonSet.has(current.nodeId)) {
      return current;
    }
    // Prefer unplayed Redemption or Main Stage nodes in current act
    const unplayed = unlockedNodes.filter((n) => !wonSet.has(n.nodeId));
    if (unplayed.length > 0) {
      const redemption = unplayed.find((n) => n.lane === 'REDEMPTION_GRIT');
      const main = unplayed.find((n) => n.lane === 'MAIN_STAGE');
      return main ?? redemption ?? unplayed[0];
    }
    return current ?? unlockedNodes[unlockedNodes.length - 1] ?? this.orderedNodes[0] ?? null;
  }

  public getScene(sceneId: string): InteractiveStorySceneV5 | null {
    return this.scenesMap.get(sceneId) ?? this.fallbackScenesMap.get(sceneId) ?? null;
  }

  public getColdOpenScene(): InteractiveStorySceneV5 {
    return this.getScene('scene_cold_open') ?? buildFallbackColdOpenScene();
  }

  public completeColdOpen(contestantName?: string): BranchingCampaignStateV5 {
    return this.mutateActiveState((state) => {
      state.coldOpenCompleted = true;
      if (contestantName && contestantName.trim()) {
        state.contestantName = contestantName.trim().slice(0, 32);
      }
      for (const id of ['read_in_2s', 'double_down_2x', 'clue_coins', 'gadget_dial_cables']) {
        if (!state.mechanicsIntroduced.includes(id)) {
          state.mechanicsIntroduced.push(id);
        }
      }
      if (!state.seenSceneIds.includes('scene_cold_open')) {
        state.seenSceneIds.push('scene_cold_open');
      }
    });
  }

  public setContestantName(name: string): BranchingCampaignStateV5 {
    const clean = name.trim().slice(0, 32) || 'Challenger';
    return this.mutateActiveState((state) => {
      state.contestantName = clean;
    });
  }

  public selectCurrentNode(nodeId: string): boolean {
    const node = this.nodesMap.get(nodeId);
    if (!node) return false;
    const state = this.getState();
    if (!state.unlockedNodeIds.includes(nodeId)) return false;
    this.mutateActiveState((s) => {
      s.currentNodeId = nodeId;
      if (node.actNumber > s.currentAct) {
        s.currentAct = node.actNumber;
      }
    });
    return true;
  }

  public markSceneSeen(sceneId: string): BranchingCampaignStateV5 {
    return this.mutateActiveState((state) => {
      if (!state.seenSceneIds.includes(sceneId)) {
        state.seenSceneIds.push(sceneId);
      }
      state.inboxCallsQueue = state.inboxCallsQueue.filter((id) => id !== sceneId);
    });
  }

  // --------------------------------------------------------------------------
  // DIEGETIC MECHANIC ONBOARDING (`mechanicsIntroduced: string[]`)
  // --------------------------------------------------------------------------

  public isMechanicIntroduced(mechanicId: string): boolean {
    return this.getState().mechanicsIntroduced.includes(mechanicId);
  }

  public markMechanicIntroduced(mechanicId: string): boolean {
    if (!mechanicId || this.isMechanicIntroduced(mechanicId)) return false;
    this.mutateActiveState((state) => {
      if (!state.mechanicsIntroduced.includes(mechanicId)) {
        state.mechanicsIntroduced.push(mechanicId);
      }
    });
    return true;
  }

  public markMechanicsIntroduced(mechanicIds: readonly string[]): string[] {
    const newlyAdded: string[] = [];
    this.mutateActiveState((state) => {
      for (const id of mechanicIds) {
        if (id && !state.mechanicsIntroduced.includes(id)) {
          state.mechanicsIntroduced.push(id);
          newlyAdded.push(id);
        }
      }
    });
    return newlyAdded;
  }

  public getMechanicBeat(mechanicId: string): DiegeticMechanicBeatV5 | null {
    return MECHANIC_BY_ID.get(mechanicId) ?? null;
  }

  public getColdOpenOnboardingBeats(): readonly DiegeticMechanicBeatV5[] {
    return DIEGETIC_MECHANICS_CATALOG_V5.filter((m) => m.phase === 'COLD_OPEN');
  }

  /**
   * Computes every unintroduced mechanic organically encountered on `node`
   * (Core Cold-Open / Act I mechanics + that node's specific Board Twist).
   */
  public getUnintroducedMechanicsForNode(
    nodeIdOrNode: string | CampaignNodeExtendedV5,
  ): readonly DiegeticMechanicBeatV5[] {
    const node = typeof nodeIdOrNode === 'string' ? this.nodesMap.get(nodeIdOrNode) : nodeIdOrNode;
    if (!node) return [];

    const state = this.getState();
    const introduced = new Set(state.mechanicsIntroduced);
    const neededIds: string[] = [];

    const pushIfNew = (id: string) => {
      if (!introduced.has(id) && !neededIds.includes(id) && MECHANIC_BY_ID.has(id)) {
        neededIds.push(id);
      }
    };

    // 1. Explicit node-level tags from narrative JSON if provided
    if (Array.isArray(node.mechanicsToIntroduce)) {
      for (const id of node.mechanicsToIntroduce) pushIfNew(id);
    }

    // 2. Cold Open core floor mechanics if player jumped directly onto Act I
    if (!state.coldOpenCompleted || node.actNumber === 1) {
      pushIfNew('read_in_2s');
      pushIfNew('double_down_2x');
      pushIfNew('clue_coins');
      if (
        node.featuredFormats.includes('MATCH_4') ||
        node.featuredFormats.includes('PINPOINT_DIAL')
      ) {
        pushIfNew('gadget_dial_cables');
      }
    }

    // 3. Act I core stage systems introduced at the exact moment they appear
    if (node.actNumber >= 1) {
      pushIfNew('six_wedge_medallion');
      pushIfNew('row_col_sweep_jackpots');
    }
    if (node.topology === 'PADLOCK_NEIGHBORS' || inferBoardTwistForNode(node) === 'chain_padlocks') {
      pushIfNew('chain_locks_3d');
    }
    if (node.challengerId !== null && (state.totalMatchesPlayed >= 1 || node.tierNumber >= 2)) {
      pushIfNew('screw_rival_buzzer');
    }
    if (state.unlockedNodeIds.length >= 2 || node.lane === 'REDEMPTION_GRIT') {
      pushIfNew('tour_trunk_yarn_branches');
    }
    if (node.optionalDare || node.lane === 'SPONSOR_SHOWCASE') {
      pushIfNew('sponsor_dares');
    }
    if (node.rewardCharmId || state.unlockedCharms.length > 0) {
      pushIfNew('podium_lucky_charms');
    }

    // 4. Specific Board Topology / Twist introduction (all 14 twists)
    const twist = inferBoardTwistForNode(node);
    pushIfNew(getMechanicIdForBoardTwist(twist));

    return neededIds
      .map((id) => MECHANIC_BY_ID.get(id))
      .filter((m): m is DiegeticMechanicBeatV5 => Boolean(m));
  }

  /**
   * Builds a ready-to-play pre-match story scene that fuses the node's authored
   * walkout scene with up to 2 concise diegetic onboarding banter beats for
   * brand-new mechanics/twists plus any active Grudge Sabotage ambush beat!
   */
  public buildAugmentedPreMatchScene(nodeId: string): {
    readonly scene: InteractiveStorySceneV5;
    readonly newlyIntroducedMechanics: readonly string[];
    readonly activeSabotage: ActiveGrudgeSabotageV5 | null;
  } | null {
    const node = this.nodesMap.get(nodeId);
    if (!node) return null;

    const baseScene = node.preMatchSceneId ? this.getScene(node.preMatchSceneId) : null;
    const unintroduced = this.getUnintroducedMechanicsForNode(node);
    // Prioritize twist intro + at most 1 core mechanic beat per walkout so pacing stays crisp!
    const twistMechId = getMechanicIdForBoardTwist(inferBoardTwistForNode(node));
    const prioritized = [
      ...unintroduced.filter((m) => m.mechanicId === twistMechId),
      ...unintroduced.filter((m) => m.mechanicId !== twistMechId),
    ].slice(0, 2);

    const pendingSabotage = this.peekPendingGrudgeSabotageForNode(node);
    const injectedBeats: VoicedDialogueBeatV5[] = [];

    for (const mech of prioritized) {
      injectedBeats.push({
        speaker: mech.speaker,
        speakerName: mech.speakerName,
        speakerRole: mech.shortCueBanner,
        text: mech.diegeticLine,
        voiceClipId: mech.voiceClipId,
        hostPose: mech.hostPose ?? 'hype',
        backdropUrl: V5_VENUE_STAGES[node.tierNumber],
      });
    }

    if (pendingSabotage) {
      injectedBeats.push({
        speaker: pendingSabotage.rivalId,
        speakerName: pendingSabotage.rivalName,
        speakerRole: 'GRUDGE SABOTAGE WARNING',
        text: pendingSabotage.tauntLine,
        voiceClipId: pendingSabotage.voiceClipId,
        hostPose: 'wince',
        backdropUrl: V5_VENUE_STAGES[node.tierNumber],
      });
    }

    const newlyIntroducedMechanics = prioritized.map((m) => m.mechanicId);
    if (newlyIntroducedMechanics.length > 0) {
      this.markMechanicsIntroduced(newlyIntroducedMechanics);
    }

    if (!baseScene && injectedBeats.length === 0) {
      return null;
    }

    if (baseScene) {
      const mergedBeats: VoicedDialogueBeatV5[] = [...baseScene.beats];
      // Insert diegetic mechanic beats before the final choice beat so the final taunt leads right into choices
      if (baseScene.choices && baseScene.choices.length > 0 && mergedBeats.length > 0) {
        const finalBeat = mergedBeats.pop()!;
        mergedBeats.push(...injectedBeats, finalBeat);
      } else {
        mergedBeats.push(...injectedBeats);
      }
      return {
        scene: {
          ...baseScene,
          beats: mergedBeats,
        },
        newlyIntroducedMechanics,
        activeSabotage: pendingSabotage,
      };
    }

    return {
      scene: {
        sceneId: `scene_auto_walkout_${node.nodeId}`,
        kind: node.lane === 'REDEMPTION_GRIT' ? 'REDEMPTION_BEAT' : 'STAGE_WALKOUT',
        title: node.showTitle,
        locationSubhead: node.venueName.toUpperCase(),
        backdropUrl: V5_VENUE_STAGES[node.tierNumber],
        featuredChallengerId: node.challengerId ?? undefined,
        beats: injectedBeats,
      },
      newlyIntroducedMechanics,
      activeSabotage: pendingSabotage,
    };
  }

  // --------------------------------------------------------------------------
  // RIVAL RELATIONSHIPS (-100..+100), ALLY CALLS & GRUDGE SABOTAGE
  // --------------------------------------------------------------------------

  public getRivalAffinity(challengerId: ChallengerIdV5): number {
    return this.getState().rivalAffinity[challengerId] ?? 0;
  }

  public getRivalStanding(challengerId: ChallengerIdV5): RivalStandingV5 {
    return getRivalStandingForAffinity(this.getRivalAffinity(challengerId));
  }

  public getAlliedRivals(state: BranchingCampaignStateV5 = this.getState()): readonly ChallengerIdV5[] {
    return ALL_CHALLENGER_IDS_V5.filter((id) => (state.rivalAffinity[id] ?? 0) >= ALLY_AFFINITY_THRESHOLD_V5);
  }

  public getGrudgeRivals(state: BranchingCampaignStateV5 = this.getState()): readonly ChallengerIdV5[] {
    return ALL_CHALLENGER_IDS_V5.filter((id) => (state.rivalAffinity[id] ?? 0) <= GRUDGE_AFFINITY_THRESHOLD_V5);
  }

  private findAllyCallSceneIdForChallenger(challengerId: ChallengerIdV5): string {
    // Prefer any loaded JSON GREEN_ROOM_CALL scene matching this challenger
    for (const scene of this.scenesMap.values()) {
      if (scene.kind === 'GREEN_ROOM_CALL' && scene.featuredChallengerId === challengerId) {
        return scene.sceneId;
      }
    }
    return RIVAL_PROFILES_V5[challengerId].allyCallSceneId;
  }

  private evaluateRivalThresholdsInPlace(
    state: BranchingCampaignStateV5,
    challengerId: ChallengerIdV5,
  ): {
    queuedAllyCallSceneId: string | null;
    unlockedCharmId: CharmIdV5 | null;
    triggeredSabotage: ActiveGrudgeSabotageV5 | null;
  } {
    const affinity = clampAffinity(state.rivalAffinity[challengerId] ?? 0);
    state.rivalAffinity[challengerId] = affinity;
    const profile = RIVAL_PROFILES_V5[challengerId];

    let queuedAllyCallSceneId: string | null = null;
    let unlockedCharmId: CharmIdV5 | null = null;
    let triggeredSabotage: ActiveGrudgeSabotageV5 | null = null;

    // Ally threshold >= +25 -> Queue Green-Room Ally Coaching Call & unlock signature Podium Charm!
    if (affinity >= ALLY_AFFINITY_THRESHOLD_V5) {
      if (!state.rivalAllyCallsUnlocked.includes(challengerId)) {
        state.rivalAllyCallsUnlocked.push(challengerId);
        const callSceneId = this.findAllyCallSceneIdForChallenger(challengerId);
        if (!state.seenSceneIds.includes(callSceneId) && !state.inboxCallsQueue.includes(callSceneId)) {
          state.inboxCallsQueue.push(callSceneId);
          queuedAllyCallSceneId = callSceneId;
        }
      }
      if (!state.unlockedCharms.includes(profile.signatureCharmId)) {
        state.unlockedCharms.push(profile.signatureCharmId);
        if (state.equippedCharms.length < MAX_EQUIPPED_CHARMS_V5) {
          state.equippedCharms.push(profile.signatureCharmId);
        }
        unlockedCharmId = profile.signatureCharmId;
      }
    }

    // Grudge threshold <= -25 -> Enqueue Grudge Sabotage ambush!
    if (affinity <= GRUDGE_AFFINITY_THRESHOLD_V5 && !state.rivalGrudgesTriggered.includes(challengerId)) {
      state.rivalGrudgesTriggered.push(challengerId);
      const sabotage: ActiveGrudgeSabotageV5 = {
        sabotageId: `grudge_${challengerId}_act${state.currentAct}`,
        rivalId: challengerId,
        rivalName: profile.displayName,
        kind: profile.grudgeSabotageKind,
        targetDomainLabel: profile.weakDomainLabel,
        tauntLine: profile.grudgeSabotageTaunt,
        voiceClipId: `vo_${profile.shortKey}_screw_taunt`,
        createdAtAct: state.currentAct,
        triggered: false,
      };
      state.activeGrudgeSabotages.push(sabotage);
      triggeredSabotage = sabotage;
    }

    return { queuedAllyCallSceneId, unlockedCharmId, triggeredSabotage };
  }

  public adjustRivalAffinity(
    challengerId: ChallengerIdV5,
    delta: number,
  ): {
    readonly newAffinity: number;
    readonly standing: RivalStandingV5;
    readonly queuedAllyCallSceneId: string | null;
    readonly unlockedCharmId: CharmIdV5 | null;
    readonly triggeredSabotage: ActiveGrudgeSabotageV5 | null;
  } {
    let outAffinity = 0;
    let queuedAllyCallSceneId: string | null = null;
    let unlockedCharmId: CharmIdV5 | null = null;
    let triggeredSabotage: ActiveGrudgeSabotageV5 | null = null;

    this.mutateActiveState((state) => {
      state.rivalAffinity[challengerId] = clampAffinity((state.rivalAffinity[challengerId] ?? 0) + delta);
      outAffinity = state.rivalAffinity[challengerId];
      const res = this.evaluateRivalThresholdsInPlace(state, challengerId);
      queuedAllyCallSceneId = res.queuedAllyCallSceneId;
      unlockedCharmId = res.unlockedCharmId;
      triggeredSabotage = res.triggeredSabotage;
    });

    return {
      newAffinity: outAffinity,
      standing: getRivalStandingForAffinity(outAffinity),
      queuedAllyCallSceneId,
      unlockedCharmId,
      triggeredSabotage,
    };
  }

  public getPendingInboxCallIds(): readonly string[] {
    return this.getState().inboxCallsQueue;
  }

  public getPendingInboxCallScenes(): readonly InteractiveStorySceneV5[] {
    return this.getState()
      .inboxCallsQueue.map((id) => this.getScene(id))
      .filter((s): s is InteractiveStorySceneV5 => Boolean(s));
  }

  public peekNextInboxCallScene(): InteractiveStorySceneV5 | null {
    const queue = this.getState().inboxCallsQueue;
    for (const id of queue) {
      const scene = this.getScene(id);
      if (scene) return scene;
    }
    return null;
  }

  public getPendingGrudgeSabotages(): readonly ActiveGrudgeSabotageV5[] {
    return this.getState().activeGrudgeSabotages.filter((g) => !g.triggered);
  }

  private peekPendingGrudgeSabotageForNode(node: CampaignNodeExtendedV5): ActiveGrudgeSabotageV5 | null {
    const pending = this.getPendingGrudgeSabotages();
    if (pending.length === 0) return null;
    // Prefer a grudge from the current opponent OR an earlier rival striking back!
    return (
      pending.find((g) => g.rivalId === node.challengerId) ??
      pending.find((g) => g.createdAtAct <= node.actNumber) ??
      pending[0]
    );
  }

  public consumeNextGrudgeSabotage(nodeId: string): ActiveGrudgeSabotageV5 | null {
    const node = this.nodesMap.get(nodeId);
    let consumed: ActiveGrudgeSabotageV5 | null = null;
    this.mutateActiveState((state) => {
      const idx = state.activeGrudgeSabotages.findIndex(
        (g) => !g.triggered && (!node || g.rivalId === node.challengerId || g.createdAtAct <= node.actNumber),
      );
      if (idx >= 0) {
        const target = state.activeGrudgeSabotages[idx];
        const updated: ActiveGrudgeSabotageV5 = { ...target, triggered: true };
        state.activeGrudgeSabotages[idx] = updated;
        consumed = updated;
      }
    });
    return consumed;
  }

  public applyStoryChoice(
    sceneId: string,
    choice: StoryChoiceConsequenceV5,
    featuredChallengerId?: ChallengerIdV5 | null,
  ): StoryChoiceResolutionV5 {
    const scene = this.getScene(sceneId);
    const challengerId: ChallengerIdV5 | null =
      featuredChallengerId ?? scene?.featuredChallengerId ?? null;

    let newAffinity: number | null = null;
    let rivalStanding: RivalStandingV5 | null = null;
    const unlockedCharms: CharmIdV5[] = [];
    let queuedAllyCallSceneId: string | null = null;
    let triggeredSabotage: ActiveGrudgeSabotageV5 | null = null;
    const sponsorRepChanges: Partial<Record<SponsorFactionIdV5, number>> = {};
    const bankrollDeltaUsd = Math.round(Number(choice.bankrollDeltaUsd) || 0);

    const nextState = this.mutateActiveState((state) => {
      state.storyChoiceHistory.push({
        sceneId,
        attitude: choice.attitude,
        label: choice.label,
        challengerId,
        affinityDelta: choice.rivalAffinityDelta,
        timestampIso: new Date().toISOString(),
      });

      if (challengerId) {
        const updated = clampAffinity((state.rivalAffinity[challengerId] ?? 0) + choice.rivalAffinityDelta);
        state.rivalAffinity[challengerId] = updated;
        newAffinity = updated;
        rivalStanding = getRivalStandingForAffinity(updated);

        const thresholdRes = this.evaluateRivalThresholdsInPlace(state, challengerId);
        queuedAllyCallSceneId = thresholdRes.queuedAllyCallSceneId;
        if (thresholdRes.unlockedCharmId) unlockedCharms.push(thresholdRes.unlockedCharmId);
        triggeredSabotage = thresholdRes.triggeredSabotage;
      }

      if (choice.sponsorRepDelta) {
        for (const s of ALL_SPONSOR_IDS_V5) {
          const delta = Number(choice.sponsorRepDelta[s] ?? 0);
          if (delta !== 0) {
            state.sponsorRep[s] = Math.max(-100, Math.min(200, (state.sponsorRep[s] ?? 0) + Math.round(delta)));
            sponsorRepChanges[s] = Math.round(delta);
            const sponsorCharm = this.checkSponsorCharmUnlockInPlace(state, s);
            if (sponsorCharm) unlockedCharms.push(sponsorCharm);
          }
        }
      }

      if (bankrollDeltaUsd !== 0) {
        state.bankrollUsd = Math.max(0, state.bankrollUsd + bankrollDeltaUsd);
        if (bankrollDeltaUsd > 0) {
          state.careerEarningsUsd += bankrollDeltaUsd;
        }
      }

      if (choice.unlockCharmId && !state.unlockedCharms.includes(choice.unlockCharmId)) {
        state.unlockedCharms.push(choice.unlockCharmId);
        if (state.equippedCharms.length < MAX_EQUIPPED_CHARMS_V5) {
          state.equippedCharms.push(choice.unlockCharmId);
        }
        unlockedCharms.push(choice.unlockCharmId);
      }

      if (!state.seenSceneIds.includes(sceneId)) {
        state.seenSceneIds.push(sceneId);
      }
      state.inboxCallsQueue = state.inboxCallsQueue.filter((id) => id !== sceneId);
    });

    return {
      sceneId,
      choice,
      challengerId,
      newAffinity,
      rivalStanding,
      bankrollDeltaUsd,
      sponsorRepChanges,
      unlockedCharms: Array.from(new Set(unlockedCharms)),
      queuedAllyCallSceneId,
      triggeredSabotage,
      state: nextState,
    };
  }

  // --------------------------------------------------------------------------
  // SPONSORS, BANKROLL & PODIUM LUCKY CHARMS
  // --------------------------------------------------------------------------

  private checkSponsorCharmUnlockInPlace(
    state: BranchingCampaignStateV5,
    sponsor: SponsorFactionIdV5,
  ): CharmIdV5 | null {
    const spec = SPONSOR_CATALOG_V5[sponsor];
    if ((state.sponsorRep[sponsor] ?? 0) >= spec.charmUnlockRep) {
      if (!state.unlockedCharms.includes(spec.signatureCharmId)) {
        state.unlockedCharms.push(spec.signatureCharmId);
        if (state.equippedCharms.length < MAX_EQUIPPED_CHARMS_V5) {
          state.equippedCharms.push(spec.signatureCharmId);
        }
        return spec.signatureCharmId;
      }
    }
    return null;
  }

  public selectActiveSponsor(sponsor: SponsorFactionIdV5): BranchingCampaignStateV5 {
    return this.mutateActiveState((state) => {
      state.activeSponsor = sponsor;
      state.sponsorRep[sponsor] = Math.min(200, (state.sponsorRep[sponsor] ?? 0) + 5);
      this.checkSponsorCharmUnlockInPlace(state, sponsor);
    });
  }

  public adjustSponsorRep(
    sponsor: SponsorFactionIdV5,
    delta: number,
  ): {
    readonly newRep: number;
    readonly unlockedCharmId: CharmIdV5 | null;
    readonly unlockedSecretNodes: readonly string[];
  } {
    let newRep = 0;
    let unlockedCharmId: CharmIdV5 | null = null;
    const unlockedSecretNodes: string[] = [];

    this.mutateActiveState((state) => {
      state.sponsorRep[sponsor] = Math.max(-100, Math.min(200, (state.sponsorRep[sponsor] ?? 0) + Math.round(delta)));
      newRep = state.sponsorRep[sponsor];
      unlockedCharmId = this.checkSponsorCharmUnlockInPlace(state, sponsor);

      // High Velvet Society rep unlocks any secret Velvet Salons linked to already-won nodes!
      if (sponsor === 'VELVET_SOCIETY' && newRep >= 15) {
        for (const wonId of state.wonNodeIds) {
          const node = this.nodesMap.get(wonId);
          for (const secretId of node?.secretUnlockIds ?? []) {
            if (this.nodesMap.has(secretId) && !state.unlockedNodeIds.includes(secretId)) {
              state.unlockedNodeIds.push(secretId);
              unlockedSecretNodes.push(secretId);
            }
          }
        }
      }
    });

    return { newRep, unlockedCharmId, unlockedSecretNodes };
  }

  public adjustBankroll(deltaUsd: number): number {
    const rounded = Math.round(Number(deltaUsd) || 0);
    const next = this.mutateActiveState((state) => {
      state.bankrollUsd = Math.max(0, state.bankrollUsd + rounded);
      if (rounded > 0) state.careerEarningsUsd += rounded;
    });
    return next.bankrollUsd;
  }

  public canAffordNodeEntry(nodeId: string): {
    readonly canAfford: boolean;
    readonly entryFeeUsd: number;
    readonly needsBailout: boolean;
  } {
    const node = this.nodesMap.get(nodeId);
    const fee = Math.max(0, node?.entryFeeUsd ?? 0);
    const bankroll = this.getState().bankrollUsd;
    return {
      canAfford: bankroll >= fee,
      entryFeeUsd: fee,
      needsBailout: bankroll < fee && fee > 0,
    };
  }

  /**
   * Pays a node's entry fee—or triggers an automatic Grassroots Pass-the-Hat
   * bailout / Sponsor Advance if bankroll is short so the player can NEVER soft-lock!
   */
  public payEntryFeeOrBailout(nodeId: string): {
    readonly paidUsd: number;
    readonly usedGrassrootsBailout: boolean;
    readonly newBankrollUsd: number;
  } {
    const node = this.nodesMap.get(nodeId);
    const fee = Math.max(0, node?.entryFeeUsd ?? 0);
    let paidUsd = 0;
    let usedBailout = false;

    const next = this.mutateActiveState((state) => {
      if (fee === 0) return;
      if (state.bankrollUsd >= fee) {
        state.bankrollUsd -= fee;
        paidUsd = fee;
      } else {
        // Grassroots pass-the-hat covers shortfall cleanly
        paidUsd = state.bankrollUsd;
        state.bankrollUsd = 0;
        usedBailout = true;
        state.sponsorRep.INDEPENDENT = Math.min(200, (state.sponsorRep.INDEPENDENT ?? 0) + 4);
      }
    });

    return {
      paidUsd,
      usedGrassrootsBailout: usedBailout,
      newBankrollUsd: next.bankrollUsd,
    };
  }

  public unlockCharm(charmId: CharmIdV5, autoEquipIfSlotFree = true): boolean {
    if (!isCharmIdV5(charmId)) return false;
    let added = false;
    this.mutateActiveState((state) => {
      if (!state.unlockedCharms.includes(charmId)) {
        state.unlockedCharms.push(charmId);
        added = true;
        if (autoEquipIfSlotFree && state.equippedCharms.length < MAX_EQUIPPED_CHARMS_V5) {
          state.equippedCharms.push(charmId);
        }
      }
    });
    return added;
  }

  public equipCharm(charmId: CharmIdV5): boolean {
    let ok = false;
    this.mutateActiveState((state) => {
      if (!state.unlockedCharms.includes(charmId)) return;
      if (state.equippedCharms.includes(charmId)) {
        ok = true;
        return;
      }
      if (state.equippedCharms.length >= MAX_EQUIPPED_CHARMS_V5) {
        state.equippedCharms.shift();
      }
      state.equippedCharms.push(charmId);
      ok = true;
    });
    return ok;
  }

  public unequipCharm(charmId: CharmIdV5): boolean {
    let removed = false;
    this.mutateActiveState((state) => {
      const before = state.equippedCharms.length;
      state.equippedCharms = state.equippedCharms.filter((c) => c !== charmId);
      removed = state.equippedCharms.length < before;
    });
    return removed;
  }

  public setEquippedCharms(charmIds: readonly CharmIdV5[]): readonly CharmIdV5[] {
    const next = this.mutateActiveState((state) => {
      const allowed = new Set(state.unlockedCharms);
      state.equippedCharms = Array.from(new Set(charmIds.filter((c) => allowed.has(c)))).slice(
        0,
        MAX_EQUIPPED_CHARMS_V5,
      );
    });
    return next.equippedCharms;
  }

  // --------------------------------------------------------------------------
  // FAIL-FORWARD MATCH RESOLUTION & 1-TIME CONTRACT MULLIGAN
  // --------------------------------------------------------------------------

  private computeNodeStars(node: CampaignNodeExtendedV5, input: RecordMatchOutcomeInputV5): 0 | 1 | 2 | 3 {
    if (!input.won) return 0;
    const accuracy = Math.max(0, Math.min(100, Number(input.accuracyPct ?? 72)));
    const wedges = Math.max(0, Math.trunc(Number(input.wedgesEarned ?? 0)));
    const sweeps = Math.max(0, Math.trunc(Number(input.sweepsOrBullseyes ?? 0)));
    const benchmark =
      node.challengerId && typeof input.rivalScore === 'number' && input.rivalScore > 0
        ? input.rivalScore
        : node.soloTargetScore;
    const marginRatio = benchmark > 0 ? input.playerScore / benchmark : 1.0;

    if (
      accuracy >= 85 ||
      (wedges >= 3 && accuracy >= 75) ||
      (sweeps >= 2 && accuracy >= 75) ||
      marginRatio >= 1.4
    ) {
      return 3;
    }
    if (accuracy >= 70 || wedges >= 2 || sweeps >= 1 || marginRatio >= 1.18) {
      return 2;
    }
    return 1;
  }

  private buildPressClipping(
    node: CampaignNodeExtendedV5,
    won: boolean,
    stars: 0 | 1 | 2 | 3,
    contestantName: string,
    dareCompleted: boolean,
  ): BranchingCampaignSaveStateV5['pressClippings'][number] {
    const rivalName = node.challengerId ? RIVAL_PROFILES_V5[node.challengerId].displayName : 'the House Board';
    const outlet =
      node.lane === 'VELVET_SALON'
        ? 'The Velvet Ledger'
        : node.lane === 'REDEMPTION_GRIT'
          ? 'Late-Night Wildcard Wire'
          : node.tierNumber >= 5
            ? 'Global Broadcast Desk'
            : node.tierNumber >= 3
              ? 'Prime-Time Ratings Insider'
              : 'Oakridge Daily Bulletin';

    if (won) {
      const headline =
        node.lane === 'REDEMPTION_GRIT'
          ? `${contestantName} Roars Back From Redemption Circuit at ${node.venueName}!`
          : stars === 3
            ? `STUNNING SWEEP: ${contestantName} Dominates ${rivalName} Live!`
            : `${contestantName} Outduels ${rivalName} on ${node.showTitle}`;
      const subline = dareCompleted
        ? `Cashed the on-air Showman Dare in front of ${formatLiveAudience(node.baseAudience)} viewers.`
        : `Punched a golden ticket forward from ${node.cityStamp}.`;
      return { outlet, headline, subline, nodeId: node.nodeId, won: true };
    }

    return {
      outlet,
      headline: `HEARTBREAK AT ${node.venueName.toUpperCase()}: ${rivalName} Holds Off ${contestantName}`,
      subline: 'Not out of the tournament—the Late-Night Redemption Circuit opens a dramatic back door!',
      nodeId: node.nodeId,
      won: false,
    };
  }

  public recordMatchOutcome(input: RecordMatchOutcomeInputV5): MatchOutcomeResolutionV5 {
    const node = this.nodesMap.get(input.nodeId);
    if (!node) {
      throw new Error(`Unknown campaign nodeId: ${input.nodeId}`);
    }

    const starsEarned = this.computeNodeStars(node, input);
    const newlyUnlockedNodeIds: string[] = [];
    const secretUnlockedNodeIds: string[] = [];
    const unlockedCharms: CharmIdV5[] = [];
    const queuedInboxCallSceneIds: string[] = [];
    let triggeredGrudgeSabotage: ActiveGrudgeSabotageV5 | null = null;
    let isFirstWinOnNode = false;
    let bankrollDeltaUsd = 0;
    let dareBonusUsd = 0;
    let dareBonusViewers = 0;
    let audienceDelta = 0;
    let unlockedRedemptionBranch = false;
    const endingHolder: { value: EndingResolutionV5 | null } = { value: null };

    const nextState = this.mutateActiveState((state) => {
      state.totalMatchesPlayed += 1;
      if (!state.unlockedNodeIds.includes(node.nodeId)) {
        state.unlockedNodeIds.push(node.nodeId);
      }

      // Track best score on node
      const prevHigh = state.nodeHighScores[node.nodeId] ?? 0;
      if (input.playerScore > prevHigh) {
        state.nodeHighScores[node.nodeId] = Math.round(input.playerScore);
      }

      const sponsorSpec = SPONSOR_CATALOG_V5[state.activeSponsor];
      const dare = node.optionalDare;
      const dareWon = Boolean(input.won && dare && input.dareCompleted);

      if (dare && input.dareCompleted && !state.completedDareIds.includes(dare.dareId)) {
        state.completedDareIds.push(dare.dareId);
      } else if (dare && input.dareCompleted === false && !state.failedDareIds.includes(dare.dareId)) {
        state.failedDareIds.push(dare.dareId);
      }

      if (input.won) {
        state.totalMatchesWon += 1;
        isFirstWinOnNode = !state.wonNodeIds.includes(node.nodeId);
        if (isFirstWinOnNode) {
          state.wonNodeIds.push(node.nodeId);
        }
        const prevStars = state.nodeStars[node.nodeId] ?? 0;
        if (starsEarned > prevStars) {
          state.nodeStars[node.nodeId] = starsEarned;
        }

        if (node.lane === 'REDEMPTION_GRIT') {
          state.comebackWinsFromRedemption += 1;
          // Underdog Redemption wins unlock the signature Underdog Chip charm!
          if (!state.unlockedCharms.includes('underdog_chip')) {
            state.unlockedCharms.push('underdog_chip');
            if (state.equippedCharms.length < MAX_EQUIPPED_CHARMS_V5) {
              state.equippedCharms.push('underdog_chip');
            }
            unlockedCharms.push('underdog_chip');
          }
        }

        // Payout calculation (full purse on first win, 25% exhibition bonus on replays)
        const basePurse = isFirstWinOnNode ? node.purseUsd : Math.round(node.purseUsd * 0.25);
        const scaledPurse = Math.round(basePurse * sponsorSpec.purseMultiplier);
        if (dareWon && dare) {
          dareBonusUsd = Math.round(dare.bonusPurseUsd * sponsorSpec.dareBonusMultiplier);
          dareBonusViewers = dare.bonusViewers;
          state.sponsorRep[dare.sponsor] = Math.min(200, (state.sponsorRep[dare.sponsor] ?? 0) + 14);
          const dareCharm = this.checkSponsorCharmUnlockInPlace(state, dare.sponsor);
          if (dareCharm) unlockedCharms.push(dareCharm);
        }

        const entryDeduction = input.entryFeeAlreadyPaid ? 0 : Math.min(state.bankrollUsd, node.entryFeeUsd);
        bankrollDeltaUsd = scaledPurse + dareBonusUsd - entryDeduction;
        state.bankrollUsd = Math.max(0, state.bankrollUsd + bankrollDeltaUsd);
        state.careerEarningsUsd += scaledPurse + dareBonusUsd;

        // Audience escalation
        const starFactor = starsEarned === 3 ? 0.22 : starsEarned === 2 ? 0.14 : 0.08;
        const baseJump = Math.max(20, Math.round(node.baseAudience * starFactor * sponsorSpec.audienceMultiplier));
        audienceDelta = baseJump + dareBonusViewers;
        state.liveWorldAudience = Math.max(
          state.liveWorldAudience + audienceDelta,
          Math.round(node.baseAudience * 1.05),
        );

        // Lane-specific sponsor reputation momentum
        if (node.lane === 'VELVET_SALON') {
          state.sponsorRep.VELVET_SOCIETY = Math.min(200, (state.sponsorRep.VELVET_SOCIETY ?? 0) + 15);
          const c = this.checkSponsorCharmUnlockInPlace(state, 'VELVET_SOCIETY');
          if (c) unlockedCharms.push(c);
        } else if (node.lane === 'SPONSOR_SHOWCASE') {
          state.sponsorRep.APEX_NETWORK = Math.min(200, (state.sponsorRep.APEX_NETWORK ?? 0) + 12);
          const c = this.checkSponsorCharmUnlockInPlace(state, 'APEX_NETWORK');
          if (c) unlockedCharms.push(c);
        } else if (node.lane === 'REDEMPTION_GRIT') {
          state.sponsorRep.INDEPENDENT = Math.min(200, (state.sponsorRep.INDEPENDENT ?? 0) + 14);
          const c = this.checkSponsorCharmUnlockInPlace(state, 'INDEPENDENT');
          if (c) unlockedCharms.push(c);
        } else {
          state.sponsorRep[state.activeSponsor] = Math.min(200, (state.sponsorRep[state.activeSponsor] ?? 0) + 6);
          const c = this.checkSponsorCharmUnlockInPlace(state, state.activeSponsor);
          if (c) unlockedCharms.push(c);
        }

        // Grant node reward charm if defined
        if (node.rewardCharmId && !state.unlockedCharms.includes(node.rewardCharmId)) {
          state.unlockedCharms.push(node.rewardCharmId);
          if (state.equippedCharms.length < MAX_EQUIPPED_CHARMS_V5) {
            state.equippedCharms.push(node.rewardCharmId);
          }
          unlockedCharms.push(node.rewardCharmId);
        }

        // Unlock all WIN graph edges
        for (const nextId of node.onWinUnlockIds ?? []) {
          if (!state.unlockedNodeIds.includes(nextId)) {
            state.unlockedNodeIds.push(nextId);
            newlyUnlockedNodeIds.push(nextId);
          }
          const nextNode = this.nodesMap.get(nextId);
          if (nextNode && nextNode.actNumber > state.currentAct) {
            state.currentAct = nextNode.actNumber;
          }
        }

        // Unlock SECRET graph edges (Velvet Salons / elite invitations) on 3-star, high accuracy, or Velvet Rep >= 15
        const qualifiesForSecret =
          starsEarned === 3 ||
          (input.accuracyPct ?? 0) >= 85 ||
          (state.sponsorRep.VELVET_SOCIETY ?? 0) >= 15 ||
          Boolean(input.screwsLanded && input.screwsLanded > 0);
        if (qualifiesForSecret) {
          for (const secretId of node.secretUnlockIds ?? []) {
            if (!state.unlockedNodeIds.includes(secretId)) {
              state.unlockedNodeIds.push(secretId);
              secretUnlockedNodeIds.push(secretId);
              newlyUnlockedNodeIds.push(secretId);
            }
          }
        }

        // Advance currentNodeId smoothly onto the primary unlocked next stop
        if (node.onWinUnlockIds.length > 0) {
          state.currentNodeId = node.onWinUnlockIds[0];
        }

        // Winning cleanly against a rival slightly warms respect (+5) unless they already hold a deep grudge
        if (node.challengerId) {
          const curAff = state.rivalAffinity[node.challengerId] ?? 0;
          const postWinDelta = curAff <= GRUDGE_AFFINITY_THRESHOLD_V5 ? -5 : 6;
          state.rivalAffinity[node.challengerId] = clampAffinity(curAff + postWinDelta);
          const tRes = this.evaluateRivalThresholdsInPlace(state, node.challengerId);
          if (tRes.queuedAllyCallSceneId) queuedInboxCallSceneIds.push(tRes.queuedAllyCallSceneId);
          if (tRes.unlockedCharmId) unlockedCharms.push(tRes.unlockedCharmId);
          if (tRes.triggeredSabotage) triggeredGrudgeSabotage = tRes.triggeredSabotage;
        }

        // If entering Act III, IV, or V, queue any unlocked Ally Green-Room Calls for big boss prep!
        if (state.currentAct >= 3) {
          const allies = this.getAlliedRivals(state);
          for (const allyId of allies) {
            const callId = this.findAllyCallSceneIdForChallenger(allyId);
            if (!state.seenSceneIds.includes(callId) && !state.inboxCallsQueue.includes(callId)) {
              state.inboxCallsQueue.push(callId);
              queuedInboxCallSceneIds.push(callId);
            }
          }
          // Queen's Gambit Act V climax: patch all befriended rivals onto one pre-finale Green-Room line!
          if (
            state.currentAct === 5 &&
            allies.length >= 2 &&
            this.scenesMap.has('scene_call_finale_all_allies') &&
            !state.seenSceneIds.includes('scene_call_finale_all_allies') &&
            !state.inboxCallsQueue.includes('scene_call_finale_all_allies')
          ) {
            state.inboxCallsQueue.unshift('scene_call_finale_all_allies');
            queuedInboxCallSceneIds.push('scene_call_finale_all_allies');
          }
        }
      } else {
        // FAIL-FORWARD LOSS RESOLUTION (Pyre × 80 Days): NEVER a dead-end Game Over!
        if (!state.lostNodeIds.includes(node.nodeId)) {
          state.lostNodeIds.push(node.nodeId);
        }

        // Small dramatic TV audience curiosity bump even on a heartbreak loss
        audienceDelta = Math.max(8, Math.round(node.baseAudience * 0.04));
        state.liveWorldAudience += audienceDelta;

        const entryDeduction = input.entryFeeAlreadyPaid ? 0 : Math.min(state.bankrollUsd, node.entryFeeUsd);
        bankrollDeltaUsd = -entryDeduction;
        state.bankrollUsd = Math.max(0, state.bankrollUsd - entryDeduction);

        // Unlock all FAIL-FORWARD LOSS edges (`REDEMPTION_GRIT` late-night wildcard circuit!)
        for (const lossId of node.onLossUnlockIds ?? []) {
          if (!state.unlockedNodeIds.includes(lossId)) {
            state.unlockedNodeIds.push(lossId);
            newlyUnlockedNodeIds.push(lossId);
          }
          const lossNode = this.nodesMap.get(lossId);
          if (lossNode?.lane === 'REDEMPTION_GRIT') {
            unlockedRedemptionBranch = true;
          }
          if (lossNode && lossNode.actNumber > state.currentAct) {
            state.currentAct = lossNode.actNumber;
          }
        }
        if (node.onLossUnlockIds.length > 0) {
          const redemptionTarget =
            node.onLossUnlockIds.find((id) => this.nodesMap.get(id)?.lane === 'REDEMPTION_GRIT') ??
            node.onLossUnlockIds[0];
          state.currentNodeId = redemptionTarget;
          unlockedRedemptionBranch =
            unlockedRedemptionBranch || this.nodesMap.get(redemptionTarget)?.lane === 'REDEMPTION_GRIT';
        }

        // Surviving a grudge loss teaches grit and unlocks screw_shield after 2 losses
        if (state.lostNodeIds.length >= 2 && !state.unlockedCharms.includes('screw_shield')) {
          state.unlockedCharms.push('screw_shield');
          if (state.equippedCharms.length < MAX_EQUIPPED_CHARMS_V5) {
            state.equippedCharms.push('screw_shield');
          }
          unlockedCharms.push('screw_shield');
        }
      }

      // Record press clipping
      const clipping = input.customHeadline
        ? { ...input.customHeadline, nodeId: node.nodeId, won: input.won }
        : this.buildPressClipping(node, input.won, starsEarned, state.contestantName, dareWon);
      state.pressClippings = [clipping, ...state.pressClippings].slice(0, MAX_PRESS_CLIPPINGS_V5);

      // Check for Act V Finale completion -> Resolve 1 of the 4 Canonical Endings!
      const isFinaleNode =
        node.nodeId === 'act5_finale' ||
        (node.actNumber === 5 && (node.onWinUnlockIds?.length ?? 0) === 0);
      if (isFinaleNode && input.won) {
        const resolved = this.resolveCanonicalEndingFromState(state);
        if (!state.unlockedEndings.includes(resolved.endingId)) {
          state.unlockedEndings.push(resolved.endingId);
          endingHolder.value = { ...resolved, isNewlyUnlocked: true };
        } else {
          endingHolder.value = { ...resolved, isNewlyUnlocked: false };
        }
      }
    });

    const canOfferContractMulligan =
      !input.won &&
      nextState.contractMulligansRemaining > 0 &&
      !nextState.mulliganUsedOnNodeIds.includes(node.nodeId);

    const resolvedEnding = endingHolder.value;
    const postMatchSceneId = input.won
      ? resolvedEnding?.sceneId ?? node.postWinSceneId ?? null
      : node.postLossSceneId ?? null;

    return {
      node,
      won: input.won,
      starsEarned,
      isFirstWinOnNode,
      newlyUnlockedNodeIds: dedupeStrings(newlyUnlockedNodeIds),
      secretUnlockedNodeIds: dedupeStrings(secretUnlockedNodeIds),
      unlockedRedemptionBranch,
      canOfferContractMulligan,
      bankrollDeltaUsd,
      dareBonusUsd,
      dareBonusViewers,
      audienceDelta,
      unlockedCharms: Array.from(new Set(unlockedCharms)),
      queuedInboxCallSceneIds: dedupeStrings(queuedInboxCallSceneIds),
      triggeredGrudgeSabotage,
      postMatchSceneId,
      endingResolution: resolvedEnding,
      state: nextState,
    };
  }

  public canUseContractMulligan(nodeId: string): boolean {
    const state = this.getState();
    return (
      state.contractMulligansRemaining > 0 &&
      state.lostNodeIds.includes(nodeId) &&
      !state.mulliganUsedOnNodeIds.includes(nodeId)
    );
  }

  /**
   * Optional 1-Time Contract Mulligan: lets a player invoke their network clause
   * to replay a lost match immediately (refunding entry fee), instead of taking
   * the Redemption Circuit first.
   */
  public invokeContractMulligan(nodeId: string): MulliganResolutionV5 {
    const node = this.nodesMap.get(nodeId);
    const currentState = this.getState();
    if (!node || currentState.contractMulligansRemaining <= 0 || currentState.mulliganUsedOnNodeIds.includes(nodeId)) {
      return {
        ok: false,
        nodeId,
        refundedEntryFeeUsd: 0,
        remainingMulligans: currentState.contractMulligansRemaining,
        hostLine: 'No Contract Mulligans left on your rider—time to earn it the gritty way on the Redemption Circuit!',
        state: currentState,
      };
    }

    const refunded = Math.max(0, node.entryFeeUsd);
    const nextState = this.mutateActiveState((state) => {
      state.contractMulligansRemaining = Math.max(0, state.contractMulligansRemaining - 1);
      state.mulliganUsedOnNodeIds.push(nodeId);
      state.currentNodeId = nodeId;
      if (refunded > 0) {
        state.bankrollUsd += refunded;
      }
    });

    return {
      ok: true,
      nodeId,
      refundedEntryFeeUsd: refunded,
      remainingMulligans: nextState.contractMulligansRemaining,
      hostLine:
        'Producer Sam invoked your one-time Contract Mulligan clause! Cameras are rolling again—step right back onto that stage and rewrite the headline.',
      state: nextState,
    };
  }

  // --------------------------------------------------------------------------
  // 4 CANONICAL ENDINGS RESOLVER
  // --------------------------------------------------------------------------

  public getEndingScene(endingId: EndingIdV5): InteractiveStorySceneV5 {
    const sceneId = ENDING_SCENE_IDS[endingId];
    return this.getScene(sceneId) ?? buildFallbackEndingScene(endingId);
  }

  private resolveCanonicalEndingFromState(state: BranchingCampaignStateV5): EndingResolutionV5 {
    const wonNodes = state.wonNodeIds
      .map((id) => this.nodesMap.get(id))
      .filter((n): n is CampaignNodeExtendedV5 => Boolean(n));
    const velvetWins = wonNodes.filter((n) => n.lane === 'VELVET_SALON').length;
    const sponsorShowcaseWins = wonNodes.filter((n) => n.lane === 'SPONSOR_SHOWCASE').length;
    const alliedRivals = this.getAlliedRivals(state);
    const grudgeRivals = this.getGrudgeRivals(state);

    const repInd = state.sponsorRep.INDEPENDENT ?? 0;
    const repApex = state.sponsorRep.APEX_NETWORK ?? 0;
    const repVelvet = state.sponsorRep.VELVET_SOCIETY ?? 0;

    let endingId: EndingIdV5 = 'PEOPLES_CHAMPION';

    // 1. CINDERELLA REDEMPTION: Fought back from heartbreak through the Redemption Circuit
    if (
      state.comebackWinsFromRedemption >= 2 ||
      (state.lostNodeIds.length >= 2 && state.comebackWinsFromRedemption >= 1)
    ) {
      endingId = 'CINDERELLA_REDEMPTION';
    }
    // 2. VELVET GRANDMASTER: Dominant Velvet Society path & underground salons
    else if (
      (state.activeSponsor === 'VELVET_SOCIETY' && repVelvet >= 20) ||
      (repVelvet >= 35 && repVelvet >= repApex && repVelvet >= repInd && velvetWins >= 1)
    ) {
      endingId = 'VELVET_GRANDMASTER';
    }
    // 3. NETWORK SOVEREIGN: Dominant Apex Syndicate showmanship & Dares
    else if (
      (state.activeSponsor === 'APEX_NETWORK' && repApex >= 20) ||
      (repApex >= 35 &&
        repApex > repVelvet &&
        repApex >= repInd &&
        (state.completedDareIds.length >= 1 || sponsorShowcaseWins >= 1 || state.careerEarningsUsd >= 250_000))
    ) {
      endingId = 'NETWORK_SOVEREIGN';
    }
    // 4. PEOPLE'S CHAMPION: Independent grassroots heart & rival alliances
    else {
      endingId = 'PEOPLES_CHAMPION';
    }

    const meta = ENDING_META[endingId];
    const sceneId = ENDING_SCENE_IDS[endingId];
    const scene = this.getEndingScene(endingId);

    const epilogueCallouts: string[] = [
      `Peak Global Broadcast Audience: ${formatLiveAudience(state.liveWorldAudience)} live viewers.`,
      `Career Stage Winnings: ${formatBankrollUsd(state.careerEarningsUsd)} · Active Backer: ${SPONSOR_CATALOG_V5[state.activeSponsor].name}.`,
    ];

    if (alliedRivals.length > 0) {
      const names = alliedRivals.map((id) => RIVAL_PROFILES_V5[id].displayName).join(', ');
      epilogueCallouts.push(`Green-Room Brain Trust Allies (${alliedRivals.length}): ${names}.`);
    }
    if (grudgeRivals.length > 0) {
      const names = grudgeRivals.map((id) => RIVAL_PROFILES_V5[id].displayName).join(', ');
      epilogueCallouts.push(`Unsettled Stage Grudges (${grudgeRivals.length}): ${names}.`);
    }
    if (state.comebackWinsFromRedemption > 0) {
      epilogueCallouts.push(
        `Redemption Circuit Comebacks: ${state.comebackWinsFromRedemption} upset victory${state.comebackWinsFromRedemption === 1 ? '' : ' victories'} off the late-night bracket.`,
      );
    }

    return {
      endingId,
      sceneId,
      title: meta.title,
      subtitle: meta.subtitle,
      scene,
      epilogueCallouts,
      isNewlyUnlocked: !state.unlockedEndings.includes(endingId),
    };
  }

  public resolveCanonicalEnding(overrideState?: BranchingCampaignStateV5): EndingResolutionV5 {
    return this.resolveCanonicalEndingFromState(overrideState ?? this.getState());
  }
}

let singletonEngine: BranchingCampaignEngine | null = null;

export function getBranchingCampaignEngine(): BranchingCampaignEngine {
  if (!singletonEngine) {
    singletonEngine = new BranchingCampaignEngine();
  }
  return singletonEngine;
}
