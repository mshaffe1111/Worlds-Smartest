// ============================================================================
// WORLD'S SMARTEST v5.0 — True AAA Diegetic Showtime, 20h Branching Story,
// Tactile Tour Trunk Overworld (ZERO 3D Globe! ZERO CSS Boxes!) & Voiced Cast
// ============================================================================

import type { DomainId } from '../narrative';
import type { QuestionFormatV4, WedgeColorId } from '../v4/contracts';

export type TierNumberV5 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ChallengerIdV5 =
  | 'frankie_russo'
  | 'denise_park'
  | 'trevor_blake'
  | 'priya_nair'
  | 'alistair_finch'
  | 'kenji_takahashi'
  | 'nadia_al_mansoor'
  | 'viktor_volkov';

export type HostPoseV5 = 'welcome' | 'hype' | 'wince';

export type GreenRoomEraV5 = 'LOCAL_PUB' | 'TV_DRESSING_ROOM' | 'GLOBAL_VIP_SUITE';

// ============================================================================
// 1. BESPOKE PAINTED ART & TRANSPARENT-ALPHA STAGE ACTOR PATHS
// ============================================================================

export const V5_CAST_CUTOUTS = {
  maxWelcome: './assets/v5/cast/max_welcome.webp',
  maxHype: './assets/v5/cast/max_hype.webp',
  maxWince: './assets/v5/cast/max_wince.webp',
  challengers: {
    frankie_russo: './assets/v5/cast/frankie.webp',
    denise_park: './assets/v5/cast/denise.webp',
    trevor_blake: './assets/v5/cast/trevor.webp',
    priya_nair: './assets/v5/cast/priya.webp',
    alistair_finch: './assets/v5/cast/alistair.webp',
    kenji_takahashi: './assets/v5/cast/kenji.webp',
    nadia_al_mansoor: './assets/v5/cast/nadia.webp',
    viktor_volkov: './assets/v5/cast/viktor.webp',
  } as Readonly<Record<ChallengerIdV5, string>>,
} as const;

export const V5_VENUE_STAGES: Readonly<Record<TierNumberV5, string>> = {
  1: './assets/v5/venues/tier1_oakridge.webp',
  2: './assets/v5/venues/tier2_lyric.webp',
  3: './assets/v5/venues/tier3_channel7.webp',
  4: './assets/v5/venues/tier4_primetime.webp',
  5: './assets/v5/venues/tier5_london.webp',
  6: './assets/v5/venues/tier6_tokyo.webp',
  7: './assets/v5/venues/tier7_cairo.webp',
  8: './assets/v5/venues/tier8_finale.webp',
};

export const V5_GREENROOM_BACKDROPS: Readonly<Record<GreenRoomEraV5, string>> = {
  LOCAL_PUB: './assets/v5/greenroom/greenroom_local.webp',
  TV_DRESSING_ROOM: './assets/v5/greenroom/greenroom_tv.webp',
  GLOBAL_VIP_SUITE: './assets/v5/greenroom/greenroom_global.webp',
};

export const V5_TOUR_TRUNK_SURFACE = './assets/v5/greenroom/tour_corkboard_bg.webp';

export const V5_STORY_PLATES = {
  openCall: './assets/v5/story/story_open_call.webp',
  scoutBreakthrough: './assets/v5/story/story_scout_breakthrough.webp',
  worldCoronation: './assets/v5/story/story_world_coronation.webp',
} as const;

// ============================================================================
// 2. EQUIPABLE PODIUM LUCKY CHARMS / STAGE EDGES (Balatro x Queen's Gambit)
// Earned via Rival Alliances, Underground Velvet Salons & Sponsor Dares!
// Up to 3 Charms sit physically on your Stage Podium during matches.
// ============================================================================

export type CharmIdV5 =
  | 'frankies_coaster'
  | 'denises_red_pen'
  | 'trevors_hot_mic'
  | 'priyas_adrenaline'
  | 'alistairs_pocketwatch'
  | 'kenjis_cyber_link'
  | 'nadias_astrolabe'
  | 'grassroots_megaphone'
  | 'syndicate_golden_dice'
  | 'velvet_wax_seal'
  | 'underdog_chip'
  | 'screw_shield';

export interface PodiumCharmSpecV5 {
  readonly charmId: CharmIdV5;
  readonly name: string;
  readonly tagline: string;
  readonly effectSummary: string;
  readonly originSource: string;
  readonly accentHex: string;
  readonly svgEmblemKind:
    | 'coaster'
    | 'fountain_pen'
    | 'mic'
    | 'pulse'
    | 'watch'
    | 'circuit'
    | 'astrolabe'
    | 'megaphone'
    | 'dice'
    | 'seal'
    | 'chip'
    | 'shield';
}

// ============================================================================
// 3. 20+ HOUR FAIL-FORWARD BRANCHING TOURNAMENT STORY (Pyre x 80 Days x Queen's Gambit)
// ============================================================================

export type SponsorFactionIdV5 = 'INDEPENDENT' | 'APEX_NETWORK' | 'VELVET_SOCIETY';

export type CampaignBracketLaneV5 =
  | 'MAIN_STAGE'        // Prime-time winner's bracket
  | 'REDEMPTION_GRIT'   // Fail-forward underdog circuit (late-night / pub / wildcard play-ins!)
  | 'VELVET_SALON'      // Secret underground high-stakes intellectual salons
  | 'SPONSOR_SHOWCASE'  // High-purse exhibition matches with spicy on-air Dares
  | 'RIVAL_GRUDGE';     // Personal score-settling / sparring matches

export type TourEphemeraStyleV5 =
  | 'POLAROID_SNAPSHOT'
  | 'BOARDING_PASS'
  | 'VELVET_WAX_INVITE'
  | 'TORN_PUB_FLYER'
  | 'CALL_SHEET_CLIP';

export type DialogueAttitudeV5 = 'WARM_RESPECT' | 'SHARP_WIT' | 'RUTHLESS_CONFIDENCE';

export interface StoryChoiceConsequenceV5 {
  readonly attitude: DialogueAttitudeV5;
  readonly label: string;
  readonly playerSpokenText: string;
  readonly rivalReplyText: string;
  readonly rivalReplyVoiceId?: string;
  readonly hostReplyText?: string;
  readonly hostReplyVoiceId?: string;
  readonly rivalAffinityDelta: number; // + builds Ally (unlocks coaching & Charm!), - builds Grudge!
  readonly sponsorRepDelta?: Partial<Record<SponsorFactionIdV5, number>>;
  readonly bankrollDeltaUsd?: number;
  readonly unlockCharmId?: CharmIdV5;
}

export interface ShowmanDareV5 {
  readonly dareId: string;
  readonly sponsor: SponsorFactionIdV5;
  readonly description: string;
  readonly conditionKind:
    | 'WIN_POWER_PLAY'
    | 'WIN_DOUBLE_DOWN'
    | 'REACH_STREAK_4'
    | 'USE_SCREW_SUCCESSFULLY'
    | 'EARN_3_WEDGES'
    | 'CLEAR_FULL_LINE'
    | 'NO_LIFELINES_USED';
  readonly bonusPurseUsd: number;
  readonly bonusViewers: number;
}

export interface CampaignNodeV5 {
  readonly nodeId: string;
  readonly actNumber: 1 | 2 | 3 | 4 | 5;
  readonly tierNumber: TierNumberV5;
  readonly lane: CampaignBracketLaneV5;
  readonly ephemeraStyle: TourEphemeraStyleV5;
  /** Pinboard coordinates (0..100%) & organic tilt (-7deg..+7deg) on the Tour Trunk Corkboard! */
  readonly pinX: number;
  readonly pinY: number;
  readonly tiltDeg: number;
  readonly cityStamp: string;
  readonly venueName: string;
  readonly showTitle: string;
  readonly hookBlurb: string;
  readonly challengerId: ChallengerIdV5 | null;
  readonly boardCols: 4 | 5 | 6;
  readonly boardRows: 3 | 4;
  readonly maxTurns: number;
  readonly topology:
    | 'OPEN_TRYOUT'
    | 'PADLOCK_NEIGHBORS'
    | 'FOG_EXPLORER'
    | 'SPOTLIGHT_ROULETTE'
    | 'CROSSROADS_HYBRID'
    | 'FINALE_GAUNTLET';
  readonly entryFeeUsd: number;
  readonly purseUsd: number;
  readonly baseAudience: number;
  readonly soloTargetScore: number;
  readonly featuredFormats: readonly QuestionFormatV4[];
  readonly preferredDomains?: readonly DomainId[];
  readonly optionalDare?: ShowmanDareV5;
  readonly rewardCharmId?: CharmIdV5;
  /** Branching graph edges: Winning advances along `onWinUnlockIds`, Losing branches to `onLossUnlockIds`! */
  readonly initialUnlocked?: boolean;
  readonly onWinUnlockIds: readonly string[];
  readonly onLossUnlockIds: readonly string[];
  readonly secretUnlockIds?: readonly string[];
  readonly preMatchSceneId?: string;
  readonly postWinSceneId?: string;
  readonly postLossSceneId?: string;
}

export interface VoicedDialogueBeatV5 {
  readonly speaker: 'max_sterling' | 'producer_sam' | ChallengerIdV5 | 'narrator';
  readonly speakerName: string;
  readonly speakerRole?: string;
  readonly text: string;
  readonly voiceClipId?: string;
  readonly hostPose?: HostPoseV5;
  readonly backdropUrl?: string;
}

export interface InteractiveStorySceneV5 {
  readonly sceneId: string;
  readonly kind: 'COLD_OPEN' | 'GREEN_ROOM_CALL' | 'STAGE_WALKOUT' | 'ACT_CLIMAX' | 'REDEMPTION_BEAT' | 'ENDING';
  readonly title: string;
  readonly locationSubhead: string;
  readonly backdropUrl: string;
  readonly featuredChallengerId?: ChallengerIdV5;
  readonly beats: readonly VoicedDialogueBeatV5[];
  readonly choices?: readonly StoryChoiceConsequenceV5[];
  readonly closingBeats?: readonly VoicedDialogueBeatV5[];
}

export type EndingIdV5 =
  | 'PEOPLES_CHAMPION'
  | 'NETWORK_SOVEREIGN'
  | 'VELVET_GRANDMASTER'
  | 'CINDERELLA_REDEMPTION';

export interface BranchingCampaignSaveStateV5 {
  readonly version: '5.0';
  contestantName: string;
  coldOpenCompleted: boolean;
  currentAct: 1 | 2 | 3 | 4 | 5;
  currentNodeId: string;
  unlockedNodeIds: string[];
  wonNodeIds: string[];
  lostNodeIds: string[];
  nodeStars: Record<string, 0 | 1 | 2 | 3>;
  nodeHighScores: Record<string, number>;
  bankrollUsd: number;
  careerEarningsUsd: number;
  liveWorldAudience: number;
  activeSponsor: SponsorFactionIdV5;
  sponsorRep: Record<SponsorFactionIdV5, number>;
  /** -100 (Bitter Grudge) .. +100 (Sworn Ally / Sparring Partner) */
  rivalAffinity: Record<ChallengerIdV5, number>;
  unlockedCharms: CharmIdV5[];
  equippedCharms: CharmIdV5[]; // max 3 on podium
  seenSceneIds: string[];
  inboxCallsQueue: string[]; // Pending Green-Room phone/note scenes from Allies, Rivals, or Sponsors!
  pressClippings: Array<{
    readonly outlet: string;
    readonly headline: string;
    readonly subline: string;
    readonly nodeId: string;
    readonly won: boolean;
  }>;
  totalMatchesPlayed: number;
  totalMatchesWon: number;
  comebackWinsFromRedemption: number;
  unlockedEndings: EndingIdV5[];
  updatedAtIso: string;
}

// ============================================================================
// 4. VOICE MANIFEST CONTRACT (`public/data/v5_voice_manifest.json`)
// ============================================================================

export interface VoiceClipEntryV5 {
  readonly clipId: string;
  readonly speaker: 'max_sterling' | 'producer_sam' | ChallengerIdV5;
  readonly url: string;
  readonly transcript: string;
  readonly durationSec: number;
}

export interface VoiceManifestV5 {
  readonly version: '5.0';
  readonly generatedAtIso: string;
  readonly clips: Readonly<Record<string, VoiceClipEntryV5>>;
}

// ============================================================================
// 5. HIGH-Z-INDEX STAGE VFX & LIVING BOARD EVENTS
// ============================================================================

export interface ShatterArcTargetV5 {
  readonly xPx: number;
  readonly yPx: number;
}

export interface StageVfxApiV5 {
  mount(canvas: HTMLCanvasElement): void;
  setStageMood(tier: TierNumberV5, intensity: 'calm' | 'board' | 'hotseat' | 'jackpot'): void;
  fireChainShatter(originX: number, originY: number, unlockedTargets: readonly ShatterArcTargetV5[]): void;
  fireScrewSlam(targetX: number, targetY: number, byPlayer: boolean): void;
  fireWedgeCrystal(x: number, y: number, wedge: WedgeColorId): void;
  fireLineJackpotSweep(pointsLabel: string): void;
  fireConfettiOvation(durationMs?: number): void;
  dispose(): void;
}
