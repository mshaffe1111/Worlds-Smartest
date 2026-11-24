// ============================================================================
// WORLD'S SMARTEST v5.0 — AAA Showtime, 3D Globe, Story & Voiced Cast Contracts
// Zero CSS Dashboard Boxes · Bespoke Painted Art · 3D Globe · Real Sampled Audio
// ============================================================================

import type { ChallengerIdV4, TierNumberV4, WedgeColorId } from '../v4/contracts';

export type HostPoseV5 = 'welcome' | 'hype' | 'wince';

export interface CastAssetPathsV5 {
  readonly maxWelcome: string;
  readonly maxHype: string;
  readonly maxWince: string;
  readonly challengers: Readonly<Record<ChallengerIdV4, string>>;
}

export const V5_CAST_ASSETS: CastAssetPathsV5 = {
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
  },
};

export const V5_VENUE_STAGE_ASSETS: Readonly<Record<TierNumberV4, string>> = {
  1: './assets/v5/venues/tier1_oakridge.webp',
  2: './assets/v5/venues/tier2_lyric.webp',
  3: './assets/v5/venues/tier3_channel7.webp',
  4: './assets/v5/venues/tier4_primetime.webp',
  5: './assets/v5/venues/tier5_london.webp',
  6: './assets/v5/venues/tier6_tokyo.webp',
  7: './assets/v5/venues/tier7_cairo.webp',
  8: './assets/v5/venues/tier8_finale.webp',
};

export const V5_STORY_ART_ASSETS = {
  openCall: './assets/v5/story/story_open_call.webp',
  scoutBreakthrough: './assets/v5/story/story_scout_breakthrough.webp',
  worldCoronation: './assets/v5/story/story_world_coronation.webp',
} as const;

export interface GlobeVenueNodeV5 {
  readonly tierNumber: TierNumberV4;
  readonly cityLabel: string;
  readonly venueName: string;
  readonly lat: number;
  readonly lon: number;
  readonly accentHex: string;
  readonly viewerLabel: string;
  readonly purseLabel: string;
  readonly unlocked: boolean;
  readonly completed: boolean;
  readonly isCurrent: boolean;
}

export const WORLD_TOUR_GLOBE_COORDS_V5: Readonly<
  Record<TierNumberV4, { readonly cityLabel: string; readonly lat: number; readonly lon: number; readonly accentHex: string }>
> = {
  1: { cityLabel: 'Oakridge, Ohio', lat: 41.4, lon: -81.7, accentHex: '#ffb84d' },
  2: { cityLabel: 'Chicago, USA', lat: 41.88, lon: -87.63, accentHex: '#ff6b8b' },
  3: { cityLabel: 'Atlanta Studio B', lat: 33.75, lon: -84.39, accentHex: '#47d7ff' },
  4: { cityLabel: 'Los Angeles Live', lat: 34.05, lon: -118.24, accentHex: '#ffd86b' },
  5: { cityLabel: 'London Rotunda', lat: 51.51, lon: -0.13, accentHex: '#a78bfa' },
  6: { cityLabel: 'Shibuya, Tokyo', lat: 35.66, lon: 139.7, accentHex: '#38f2e6' },
  7: { cityLabel: 'Giza Plateau, Cairo', lat: 29.98, lon: 31.13, accentHex: '#ffc252' },
  8: { cityLabel: 'Geneva Global Apex', lat: 46.2, lon: 6.14, accentHex: '#ffe999' },
};

// ============================================================================
// VOICE MANIFEST CONTRACTS (`public/data/v5_voice_manifest.json`)
// Every voiced line has a deterministic `clipId` and verified `transcript`!
// ============================================================================

export type VoiceSpeakerIdV5 = 'max_sterling' | ChallengerIdV4;

export interface VoiceClipEntryV5 {
  readonly clipId: string;
  readonly speaker: VoiceSpeakerIdV5;
  readonly url: string;
  readonly transcript: string;
  readonly durationSec: number;
  readonly category:
    | 'cold_open'
    | 'welcome'
    | 'host_hit'
    | 'host_streak'
    | 'host_miss'
    | 'host_power_play'
    | 'host_ buzzer'
    | 'host_victory'
    | 'host_defeat'
    | 'rival_intro'
    | 'rival_clapback_reply'
    | 'rival_trap'
    | 'rival_win'
    | 'rival_lose'
    | 'tier_promo';
}

export interface VoiceManifestV5 {
  readonly version: '5.0';
  readonly generatedAtIso: string;
  readonly clips: Readonly<Record<string, VoiceClipEntryV5>>;
}

// ============================================================================
// STORY DIRECTOR CONTRACTS (`public/data/v5_story_scenes.json`)
// ============================================================================

export type DialogueToneV5 = 'BOLD' | 'WITTY' | 'HUMBLE';

export interface PlayerClapbackOptionV5 {
  readonly tone: DialogueToneV5;
  readonly playerLine: string;
  readonly speakerReplyText: string;
  readonly speakerReplyClipId?: string;
  readonly hostReactionText?: string;
  readonly hostReactionClipId?: string;
}

export interface StoryBeatLineV5 {
  readonly speaker: VoiceSpeakerIdV5 | 'narrator';
  readonly speakerDisplayName: string;
  readonly speakerSubtitle?: string;
  readonly text: string;
  readonly voiceClipId?: string;
  readonly hostPose?: HostPoseV5;
  readonly backgroundArt?: string;
}

export interface ChallengerWalkoutSceneV5 {
  readonly tierNumber: TierNumberV4;
  readonly challengerId: ChallengerIdV4;
  readonly venueBackdropUrl: string;
  readonly stageHeadline: string;
  readonly openingBeats: readonly StoryBeatLineV5[];
  readonly playerChoices: readonly [
    PlayerClapbackOptionV5,
    PlayerClapbackOptionV5,
    PlayerClapbackOptionV5,
  ];
}

export interface TierPromotionCutsceneV5 {
  readonly completedTier: TierNumberV4;
  readonly nextTier: TierNumberV4 | null;
  readonly title: string;
  readonly subtitle: string;
  readonly artworkUrl: string;
  readonly beats: readonly StoryBeatLineV5[];
}

export interface ColdOpenStorySpecV5 {
  readonly title: string;
  readonly subtitle: string;
  readonly openingBeats: readonly StoryBeatLineV5[];
  readonly frankieChallengeChoices: readonly [
    PlayerClapbackOptionV5,
    PlayerClapbackOptionV5,
    PlayerClapbackOptionV5,
  ];
  readonly postAuditionBeats: readonly StoryBeatLineV5[];
}

export interface StoryScenesBundleV5 {
  readonly version: '5.0';
  readonly coldOpen: ColdOpenStorySpecV5;
  readonly walkouts: Readonly<Record<string, ChallengerWalkoutSceneV5>>;
  readonly promotions: Readonly<Record<string, TierPromotionCutsceneV5>>;
}

// ============================================================================
// 3D STAGE & VFX DIRECTOR INTERFACE (`src/v5/Stage3DShowDirector.ts`)
// ============================================================================

export type Stage3DModeV5 = 'HOME_TROPHY' | 'WORLD_GLOBE' | 'LIVE_STAGE' | 'HIDDEN';

export interface Stage3DVfxBurstOptions {
  readonly xNorm?: number; // 0..1 viewport X
  readonly yNorm?: number; // 0..1 viewport Y
  readonly toXNorm?: number;
  readonly toYNorm?: number;
  readonly wedgeColor?: WedgeColorId;
  readonly intensity?: number;
}

export interface IStage3DShowDirectorV5 {
  mount(canvasContainer: HTMLElement, vfxCanvas: HTMLCanvasElement): Promise<void>;
  setMode(mode: Stage3DModeV5): void;
  setVenueTier(tier: TierNumberV4): void;
  setGlobeNodes(
    nodes: readonly GlobeVenueNodeV5[],
    selectedTier: TierNumberV4,
    onSelectTier: (tier: TierNumberV4) => void,
  ): void;
  focusGlobeTier(tier: TierNumberV4): void;
  triggerChainShatter(fromXNorm: number, fromYNorm: number, targets: ReadonlyArray<{ x: number; y: number }>): void;
  triggerWedgeBurst(wedgeColor: WedgeColorId, xNorm?: number, yNorm?: number): void;
  triggerStageJackpot(label?: string): void;
  triggerAnswerPulse(correct: boolean): void;
  dispose(): void;
}
