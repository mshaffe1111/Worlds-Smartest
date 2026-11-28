/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 "SWEEPS WEEK DELUXE")
// `src/v7/ui/CouchPartyShowdownDeluxeV8.ts`
// Sleek Sunlit 1966 Studio 6A 2-Player Couch Pass-and-Play Party Suite:
//   1. `openCouchPartySetupSheetV8` — Warm Broadcast Cream + Sunlit American
//      Walnut & Brushed Champagne Brass Stage Sheet, Radiant Peacock-to-Cobalt
//      Header Ribbon, Dual Ivory-Cream Contestant Podium Plaques (Peacock Teal
//      vs Atomic Tangerine Acrylite Crowns), Paged 6-Portrait Carousel (zero
//      clipped circles, zero horizontal scrollbars), 2-Segment Mechanical Show
//      Length Rocker, Side-by-Side Rotary Stepper Cards (TV Board Format 1/9
//      & 1966 Soundstage 1/11), and Atomic Tangerine 3D Launch Paddle.
//   2. `CouchPartyMatchDirectorV8` — 100% Campaign-isolated 2-Podium state,
//      `playTurnHandoffBanner` (950ms Sunlit Spotlight Sweep) &
//      `playPassGremlinSpinsCurtain` (Crimson Velvet & Cream Challenge!)
//   3. `runCouchBlindFinalShowdownV8` — Zero-Spoiler Blind Dual Final Wager,
//      30s Climax Clue Lock-In & Simultaneous Grant Bellamy Envelope Reveal
//   4. `showCouchWinnerCheckCeremonyV8` — Ornate 1966 IBC Certified Winner's
//      Check Ceremony (`POISED` vs `BREAKDOWN` portraits + Swap-1st-Pick Rematch)
//
// STRICT STATELESS INVARIANT: Zero imports or writes to CampaignSaveStateV7,
// DailyBroadcastSaveV7, localStorage, or sessionStorage!
// ============================================================================

import {
  ALL_BOARD_PLAY_MODES_V9,
  ALL_RIVAL_IDS_V7,
  BOARD_PLAY_MODE_TITLES_V9,
  type BoardPlayModeV9,
  type BroadcastBoothConfigV9,
  type CastIdV7,
  type CategoryIdV7,
  type ClueRecordV7,
  type CouchPlayerConfigV8,
  type CouchSecretFinalWagerResultV8,
  type CouchShowdownLaunchSpecV8,
  type CouchSkillDialV9,
  type PortraitEmotionV7,
  type StageWorldIdV7,
  type StudioVoiceCueIdV8,
  type VibePackIdV9,
} from '../contracts_v7';
import {
  BROKER_IDS_V7,
  CAST_PROFILES_V7,
} from '../campaign/CastAndRelicsCatalogV7';
import { getFriendlyCategoryLabelV7 } from '../corpus/CorpusManagerV7';
import { VIBE_PACK_CATALOG_V9 } from '../../v9/ShowroomAndCatalogsV9';
import { buildPaintedPortraitCssLayersV8 } from './ReactionPipMonitorV8';

export interface CouchShowdownLaunchSpecV9
  extends Omit<CouchShowdownLaunchSpecV8, 'boardPlayMode'> {
  readonly boardPlayMode: BoardPlayModeV9;
  readonly skillDials?: readonly [CouchSkillDialV9, CouchSkillDialV9];
  readonly boothConfig?: BroadcastBoothConfigV9;
}

// ----------------------------------------------------------------------------
// 1. Canonical 1966 Studio Rosters, Nicknames & 27-Portrait Resolver
// ----------------------------------------------------------------------------

export const PODIUM_1_PEACOCK_HEX_V8 = '#008B94';
export const PODIUM_2_TANGERINE_HEX_V8 = '#FF6B35';

/** All 27 painted 1966 Studio Cast Portraits (`24` Champions + `3` Booth Brokers). */
export const ALL_COUCH_CAST_IDS_V8: readonly CastIdV7[] = [
  ...ALL_RIVAL_IDS_V7,
  ...BROKER_IDS_V7,
];

/** All 10 1966 Soundstages available in Couch Party Showdown. */
export const ALL_COUCH_STAGE_IDS_V8: readonly StageWorldIdV7[] = [
  'STAGE_01_IBC_DAYTIME_FUNK',
  'STAGE_02_IBC_PRIMETIME_JUBILEE',
  'STAGE_03_1926_VAUDEVILLE_PIT',
  'STAGE_04_1958_ISOLATION_VAULT',
  'STAGE_05_1984_LARSON_CRT_LAB',
  'STAGE_06_ATLANTIC_CITY_PIER',
  'STAGE_07_1969_MONTE_CARLO_CASINO',
  'STAGE_08_WORLDS_FAIR_GEODESIC',
  'STAGE_09_CHANNEL_83_UHF_BARGE',
  'STAGE_10_SOVEREIGN_SANCTUM',
];

export interface CouchStageDescriptorV8 {
  readonly stageId: StageWorldIdV7;
  readonly code: string;
  readonly title: string;
  readonly eraTag: string;
}

export const COUCH_STAGE_GUIDE_V8: readonly CouchStageDescriptorV8[] = [
  {
    stageId: 'STAGE_01_IBC_DAYTIME_FUNK',
    code: 'STG 01',
    title: 'Studio 6A Living Color',
    eraTag: '30 Rock Matinee · Sunlit Peacock Set',
  },
  {
    stageId: 'STAGE_02_IBC_PRIMETIME_JUBILEE',
    code: 'STG 02',
    title: 'Primetime Jubilee',
    eraTag: 'Sweeps Rotunda · Chasing Gold Arch',
  },
  {
    stageId: 'STAGE_03_1926_VAUDEVILLE_PIT',
    code: 'STG 03',
    title: 'Burbank Pop-Art',
    eraTag: 'Carnaby Shutters · Laugh-In Color Wall',
  },
  {
    stageId: 'STAGE_04_1958_ISOLATION_VAULT',
    code: 'STG 04',
    title: '$64,000 Isolation Booth',
    eraTag: 'Sunlit Teak & Peacock Glass Vault',
  },
  {
    stageId: 'STAGE_05_1984_LARSON_CRT_LAB',
    code: 'STG 05',
    title: 'Apollo Color Control',
    eraTag: 'Orbital Console · Broadcast Cobalt',
  },
  {
    stageId: 'STAGE_06_ATLANTIC_CITY_PIER',
    code: 'STG 06',
    title: 'Atlantic City Pier',
    eraTag: 'Boardwalk Special · Spun Brass & Aqua',
  },
  {
    stageId: 'STAGE_07_1969_MONTE_CARLO_CASINO',
    code: 'STG 07',
    title: 'Monte Carlo Royale',
    eraTag: 'Riviera High Stakes · Emerald & Gold',
  },
  {
    stageId: 'STAGE_08_WORLDS_FAIR_GEODESIC',
    code: 'STG 08',
    title: "World's Fair Pavilion",
    eraTag: 'Unisphere Dome · Mid-Century Sky',
  },
  {
    stageId: 'STAGE_09_CHANNEL_83_UHF_BARGE',
    code: 'STG 09',
    title: 'Channel 83 UHF Ship',
    eraTag: 'Offshore Radio · Atomic Tangerine',
  },
  {
    stageId: 'STAGE_10_SOVEREIGN_SANCTUM',
    code: 'STG 10',
    title: '38th-Floor Penthouse',
    eraTag: 'Championship Finale · Walnut & 24K',
  },
];

/** Instant 1-tap 1966 Network Contestant Nicknames rolled by the Podium Dice button. */
export const COUCH_1966_NICKNAMES_V8: readonly string[] = [
  'ACE',
  'SUNNY',
  'SKIP',
  'DUCHESS',
  'BUZZ',
  'FOXY',
  'DOC',
  'SPARKY',
  'QUEENIE',
  'TEX',
  'COOKIE',
  'CHAMP',
  'SCOOTER',
  'GOLDIE',
  'SLICK',
  'PEACHES',
  'ROCKET',
  'BABS',
  'LUCKY',
  'PROFESSOR',
  'GINGER',
  'FLASH',
  'MAVERICK',
  'STARLET',
];

const BOARD_MODE_HOOKS_V8: Record<BoardPlayModeV9 | 'SURPRISE_MIX', string> = {
  SURPRISE_MIX: 'Cycles fresh 1966 TV Board Formats automatically every match',
  CLASSIC_TOTE: 'Climb $150–$400 rows, reveal the 2x Secret Square & crack the $500 Vault',
  TIC_TAC_LINE: 'Connect 3 claimed squares in any line for +$600 — block your rival!',
  COAST_HEX_BRIDGE: 'Link adjacent wins Coast-to-Coast (NYC to LA) for a +$750 Bridge Bonus',
  EYE_GUESS_MEMORY: 'Memorize the 2.4s board flash to grab hidden 2x & +$300 tiles safely',
  CONCENTRATION_PRIZE_MATCH: 'Match twin luxury prize halves for +$500 — or hit TAKE! to steal $200',
  MONTY_CURTAIN_DEAL: 'Triple Velvet Mystery Curtains (#1–#3) + Instant Bargains & steals',
  PRESS_YOUR_LUCK_GREMLIN: 'Slam STOP! for huge bucks, pass hot spins, or dodge the -40% Gremlin!',
  BIG_WHEEL_SHOWCASE: 'Flick the 20-wedge Wheel for $1,000 Jackpots, 2x Doubles & Lifelines',
  LOUVER_SHUTTER: 'Venetian louvers shutter categories above glowing $200–$500 tiles — flip to reveal!',
  BLIND_PURSE: 'Topics glow clearly while wax-sealed $150–$750 envelopes pop open on tap!',
  BLACKOUT_VAULT: 'Brass safe Trilons #1–#12 hide topic & cash — dodge 3 High-Volt traps!',
  LIVE_WIRE_FUSE: 'Start from 1 open tile — every correct answer sparks adjacent conduits live!',
  SHIFTING_SPOTLIGHT: 'Harvest Gold follow-spot glides each turn for 1.5x/2x bonus payouts!',
  GOLDEN_DOMINO_CASCADE: 'Link 3 contiguous claimed wins to trigger a +$350 Domino Cascade!',
  PRESSURE_COOKER: 'Shared gauge climbs 1.0x -> 1.25x -> 1.5x -> 2.0x; any miss blasts reset!',
  HOLLYWOOD_MARQUEE_LINE: 'Light O/X chasing marquee bulbs in any 3-tile line for +$300!',
};

const STAGE_PALETTE_SWATCHES_V8: Record<StageWorldIdV7, readonly [string, string]> = {
  STAGE_01_IBC_DAYTIME_FUNK: ['#008B94', '#F2A922'],
  STAGE_02_IBC_PRIMETIME_JUBILEE: ['#F2A922', '#E6397A'],
  STAGE_03_1926_VAUDEVILLE_PIT: ['#E6397A', '#FF6B35'],
  STAGE_04_1958_ISOLATION_VAULT: ['#008B94', '#6E3B23'],
  STAGE_05_1984_LARSON_CRT_LAB: ['#1746A2', '#008B94'],
  STAGE_06_ATLANTIC_CITY_PIER: ['#00A5B5', '#FF6B35'],
  STAGE_07_1969_MONTE_CARLO_CASINO: ['#19A85A', '#D9A441'],
  STAGE_08_WORLDS_FAIR_GEODESIC: ['#1746A2', '#F2A922'],
  STAGE_09_CHANNEL_83_UHF_BARGE: ['#FF6B35', '#F2A922'],
  STAGE_10_SOVEREIGN_SANCTUM: ['#6E3B23', '#D9A441'],
};

/**
 * Resolves each of the 27 `CastIdV7` stars directly to their dedicated
 * hand-painted 1966 gouache 2x2 sheet on disk (`./assets/v7/portraits/<snake_id>.jpg`).
 */
export function resolveCouchPortraitAssetV8(castId: CastIdV7): string {
  return `./assets/v7/portraits/${castId.toLowerCase()}.jpg`;
}

/** Applies crisp 2x2 gouache quadrant cropping (`0% 0%` POISED, `100% 100%` BREAKDOWN, etc.). */
export function applyCouchCastPortraitV8(
  el: HTMLElement,
  castId: CastIdV7,
  emotion: PortraitEmotionV7 = 'POISED',
): void {
  const layers = buildPaintedPortraitCssLayersV8(castId, emotion);
  el.style.backgroundImage = layers.backgroundImage;
  el.style.backgroundSize = layers.backgroundSize;
  el.style.backgroundPosition = layers.backgroundPosition;
}

/** Non-blocking warmup for the 2 active Podium portraits (+ Grant Bellamy host). */
export function preloadCouchPortraitsV8(castIds: readonly CastIdV7[]): void {
  if (typeof Image === 'undefined') return;
  const unique = new Set<CastIdV7>([...castIds, 'GRANT_BELLAMY']);
  unique.forEach((id) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = resolveCouchPortraitAssetV8(id);
  });
}

/** Builds a rematch spec swapping Podium 1 & Podium 2 so the other player gets 1st pick! */
export function swapCouchPodiumFirstPickV8(
  spec: CouchShowdownLaunchSpecV8 | CouchShowdownLaunchSpecV9,
): CouchShowdownLaunchSpecV9 {
  const specV9 = spec as CouchShowdownLaunchSpecV9;
  const swappedDials: readonly [CouchSkillDialV9, CouchSkillDialV9] | undefined =
    specV9.skillDials ? [specV9.skillDials[1], specV9.skillDials[0]] : undefined;
  return {
    podium1: {
      podiumIndex: 0,
      name: spec.podium2.name,
      avatarId: spec.podium2.avatarId,
      accentHex: PODIUM_1_PEACOCK_HEX_V8,
    },
    podium2: {
      podiumIndex: 1,
      name: spec.podium1.name,
      avatarId: spec.podium1.avatarId,
      accentHex: PODIUM_2_TANGERINE_HEX_V8,
    },
    totalTurns: spec.totalTurns,
    stageId: spec.stageId,
    boardPlayMode: spec.boardPlayMode,
    questionTimerMode: spec.questionTimerMode,
    skillDials: swappedDials,
    boothConfig: specV9.boothConfig,
  };
}

// ----------------------------------------------------------------------------
// 2. Public Interfaces & Option Contracts
// ----------------------------------------------------------------------------

export interface CouchPartySetupOptionsV8 {
  readonly initialSpec?: Partial<CouchShowdownLaunchSpecV9>;
  readonly defaultTurns?: 6 | 10;
  readonly defaultStageId?: StageWorldIdV7 | 'SURPRISE_MIX';
  readonly defaultBoardPlayMode?: BoardPlayModeV9 | 'SURPRISE_MIX';
  readonly allowIdenticalAvatars?: boolean;
  readonly reducedMotion?: boolean;
  readonly onTapSfx?: () => void;
  readonly onDiceSfx?: () => void;
  readonly onLaunchSfx?: () => void;
  readonly onVoiceCue?: (cueId: StudioVoiceCueIdV8) => void;
}

export interface CouchTurnHandoffOptionsV8 {
  readonly autoAdvanceMs?: number; // Default 950ms; pass 0 to wait strictly for tap
  readonly requireTap?: boolean;
  readonly subtitle?: string;
  readonly reducedMotion?: boolean;
  readonly onTapSfx?: () => void;
  readonly onSwooshSfx?: () => void;
}

export interface CouchPassGremlinCurtainOptionsV8 {
  readonly bankrollAtRisk?: number;
  readonly reducedMotion?: boolean;
  readonly onCurtainSfx?: () => void;
  readonly onTapSfx?: () => void;
  readonly onVoiceCue?: (cueId: StudioVoiceCueIdV8) => void;
}

export type CouchClueInputV8 =
  | Pick<ClueRecordV7, 'category' | 'stem' | 'choices' | 'answerIdx' | 'ahaFactoid'>
  | {
      readonly category: string;
      readonly prompt: string;
      readonly choices: readonly [string, string, string, string];
      readonly answerIdx: 0 | 1 | 2 | 3;
      readonly factoid?: string;
    };

export interface CouchFinalShowdownEvaluationV8 {
  readonly p1Wager: number;
  readonly p2Wager: number;
  readonly p1ChoiceIdx: 0 | 1 | 2 | 3;
  readonly p2ChoiceIdx: 0 | 1 | 2 | 3;
  readonly p1TimeSec: number;
  readonly p2TimeSec: number;
  readonly p1TimedOut: boolean;
  readonly p2TimedOut: boolean;
  readonly p1Correct: boolean;
  readonly p2Correct: boolean;
  readonly p1ShieldApplied: boolean;
  readonly p2ShieldApplied: boolean;
  readonly p1ShieldRefundCash: number;
  readonly p2ShieldRefundCash: number;
  readonly p1Delta: number;
  readonly p2Delta: number;
  readonly finalP1Cash: number;
  readonly finalP2Cash: number;
  readonly isExactCashTie: boolean;
  readonly wonBySpeedTieBreaker: boolean;
  readonly winnerPodium: 0 | 1 | 'CO_CHAMPIONS';
  readonly winnerName: string;
  readonly runnerUpName: string | null;
}

export interface CouchBlindFinalShowdownResultV8
  extends CouchSecretFinalWagerResultV8,
    CouchFinalShowdownEvaluationV8 {}

export interface CouchBlindFinalShowdownOptionsV8 {
  readonly spec: CouchShowdownLaunchSpecV8 | CouchShowdownLaunchSpecV9;
  readonly p1Cash: number;
  readonly p2Cash: number;
  readonly p1FinalWagerShield?: boolean;
  readonly p2FinalWagerShield?: boolean;
  readonly clue: CouchClueInputV8;
  readonly clueTimerSec?: number; // Default 30s
  readonly tieBreakBySpeed?: boolean; // Default true
  readonly skipBeatDRevealModal?: boolean;
  readonly reducedMotion?: boolean;
  readonly onTapSfx?: () => void;
  readonly onSealEnvelopeSfx?: () => void;
  readonly onClockTickSfx?: (remainingSec: number) => void;
  readonly onRevealAnswerSfx?: (anyCorrect: boolean) => void;
  readonly onFlipPodiumSfx?: (podiumIdx: 0 | 1, isCorrect: boolean) => void;
  readonly onCelebrateSfx?: () => void;
  readonly onVoiceCue?: (cueId: StudioVoiceCueIdV8) => void;
}

export type CouchCeremonyActionV8 = 'REMATCH_SWAP_FIRST_PICK' | 'RETURN_TO_HUB';

export interface CouchWinnerCheckCeremonyOptionsV8 {
  readonly spec: CouchShowdownLaunchSpecV8 | CouchShowdownLaunchSpecV9;
  readonly evaluation: CouchFinalShowdownEvaluationV8;
  readonly p1CorrectClues?: number;
  readonly p2CorrectClues?: number;
  readonly p1BestStreak?: number;
  readonly p2BestStreak?: number;
  readonly p1Gremlins?: number;
  readonly p2Gremlins?: number;
  readonly reducedMotion?: boolean;
  readonly onTapSfx?: () => void;
  readonly onCelebrateSfx?: () => void;
  readonly onVoiceCue?: (cueId: StudioVoiceCueIdV8) => void;
  readonly onRematchSwapFirstPick?: (
    swappedSpec: CouchShowdownLaunchSpecV8 | CouchShowdownLaunchSpecV9,
  ) => void;
  readonly onReturnToHub?: () => void;
}

// ----------------------------------------------------------------------------
// 3. Bespoke 1966 Inline Vector SVG Icons & Mini Diagrams (Zero OS Emojis!)
// ----------------------------------------------------------------------------

function buildCouchIconSvg(
  kind:
    | 'DICE'
    | 'TWINS'
    | 'MIC'
    | 'BOLT'
    | 'CLAPPER'
    | 'LOCK'
    | 'SHIELD'
    | 'EYE_SHUTTER'
    | 'FLAME'
    | 'CROWN'
    | 'TROPHY'
    | 'CHECK'
    | 'CROSS'
    | 'CLOCK'
    | 'TV'
    | 'SWAP',
): string {
  switch (kind) {
    case 'DICE':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.5" y="2.5" width="15" height="15" rx="3.5" fill="#FFFDF7" stroke="#6E3B23" stroke-width="1.8"/><circle cx="6.6" cy="6.6" r="1.4" fill="#141B29"/><circle cx="13.4" cy="6.6" r="1.4" fill="#E8531E"/><circle cx="10" cy="10" r="1.5" fill="#008B94"/><circle cx="6.6" cy="13.4" r="1.4" fill="#E8531E"/><circle cx="13.4" cy="13.4" r="1.4" fill="#141B29"/></svg>`;
    case 'TWINS':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 22 18" fill="none" aria-hidden="true"><circle cx="8" cy="6.5" r="3.2" stroke="currentColor" stroke-width="1.7"/><path d="M2.8 15.2 C2.8 12.2 5.1 10.6 8 10.6 C10.9 10.6 13.2 12.2 13.2 15.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="14.5" cy="6.5" r="3.2" stroke="currentColor" stroke-width="1.7"/><path d="M11.2 15.2 C11.6 12.5 13.1 10.8 15.4 10.8 C17.8 10.8 19.4 12.3 19.6 15.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
    case 'MIC':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="6" y="1.8" width="6" height="8.8" rx="3" fill="currentColor"/><path d="M3.8 8.2 C3.8 11.4 6.1 13.5 9 13.5 C11.9 13.5 14.2 11.4 14.2 8.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M9 13.5 V16.2 M6 16.2 H12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
    case 'BOLT':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M10.4 1.6 L4.2 9.8 H8.8 L7.6 16.4 L13.8 8.2 H9.2 Z" fill="currentColor"/></svg>`;
    case 'CLAPPER':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="2.2" y="6.8" width="13.6" height="9" rx="1.8" stroke="currentColor" stroke-width="1.7"/><path d="M2.2 6.8 L15.8 6.8 L14.8 3.2 L1.6 4.6 Z" fill="currentColor"/></svg>`;
    case 'LOCK':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M5.8 8 V5.6 C5.8 3.6 12.2 3.6 12.2 5.6 V8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="3.6" y="8" width="10.8" height="8" rx="2" fill="currentColor"/></svg>`;
    case 'SHIELD':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 1.8 L15 4.3 V9.2 C15 12.8 12.4 15.3 9 16.5 C5.6 15.3 3 12.8 3 9.2 V4.3 Z" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M6.3 9.2 L8.2 11.1 L12 7.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case 'EYE_SHUTTER':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 20 18" fill="none" aria-hidden="true"><path d="M2 9 Q10 2.5 18 9 Q10 15.5 2 9 Z" stroke="currentColor" stroke-width="1.8"/><circle cx="10" cy="9" r="2.6" fill="currentColor"/><line x1="3.5" y1="15" x2="16.5" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    case 'FLAME':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9.5 1.8 C12.4 4.8 14.2 7.4 14.2 10.6 C14.2 13.9 11.9 16.2 9 16.2 C6.1 16.2 3.8 13.9 3.8 10.8 C3.8 8.4 5.4 6.4 6.8 4.8 C6.9 6.5 7.7 7.4 8.5 7.6 C8.2 5.5 8.6 3.5 9.5 1.8 Z" fill="currentColor"/></svg>`;
    case 'CROWN':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 20 18" fill="none" aria-hidden="true"><path d="M2.2 13.5 L4.2 5.2 L8.4 9.2 L10 3.2 L11.6 9.2 L15.8 5.2 L17.8 13.5 Z" fill="currentColor"/><rect x="3" y="14.6" width="14" height="2" rx="1" fill="currentColor"/></svg>`;
    case 'TROPHY':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4.5 2.5 H13.5 V7.2 C13.5 10 11.5 11.8 9 11.8 C6.5 11.8 4.5 10 4.5 7.2 Z" fill="currentColor"/><path d="M4.5 4.2 H2.4 C2.4 7 3.4 8.4 4.5 8.4 M13.5 4.2 H15.6 C15.6 7 14.6 8.4 13.5 8.4 M9 11.8 V15.2 M5.8 15.5 H12.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
    case 'CHECK':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3.5 9.4 L7.3 13.2 L14.6 5.2" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case 'CROSS':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4.5 4.5 L13.5 13.5 M13.5 4.5 L4.5 13.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>`;
    case 'CLOCK':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6.8" stroke="currentColor" stroke-width="1.8"/><path d="M9 5.2 V9.2 L11.8 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    case 'TV':
      return `<svg class="wsc8-svg-ico" viewBox="0 0 20 18" fill="none" aria-hidden="true"><rect x="2.2" y="4.5" width="15.6" height="11.5" rx="2.4" stroke="currentColor" stroke-width="1.8"/><path d="M6.5 1.8 L10 4.5 L13.5 1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case 'SWAP':
    default:
      return `<svg class="wsc8-svg-ico" viewBox="0 0 20 18" fill="none" aria-hidden="true"><path d="M3.5 6.2 H15.5 L12.4 3.2 M16.5 11.8 H4.5 L7.6 14.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
}

function buildCouchBoardMiniDiagramSvg(mode: BoardPlayModeV9 | 'SURPRISE_MIX'): string {
  switch (mode) {
    case 'SURPRISE_MIX':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#5C301B" stroke="#D9A441" stroke-width="1.8"/><polygon points="25,19 14,5 25,5" fill="#F2A922"/><polygon points="25,19 25,5 36,5" fill="#FF6B35"/><polygon points="25,19 36,5 43,19" fill="#E6397A"/><polygon points="25,19 43,19 36,33" fill="#1746A2"/><polygon points="25,19 36,33 14,33" fill="#008B94"/><polygon points="25,19 14,33 7,19" fill="#19A85A"/><polygon points="25,19 7,19 14,5" fill="#FFD166"/><circle cx="25" cy="19" r="7.2" fill="#FAF2DF" stroke="#6E3B23" stroke-width="1.5"/><path d="M25 13.8 L26.5 17.5 L30.2 19 L26.5 20.5 L25 24.2 L23.5 20.5 L19.8 19 L23.5 17.5 Z" fill="#E8531E"/></svg>`;
    case 'CLASSIC_TOTE':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#008B94" stroke="#D9A441" stroke-width="1.8"/><rect x="5.5" y="5.5" width="11" height="7.5" rx="1.8" fill="#FFFDF7"/><rect x="19.5" y="5.5" width="11" height="7.5" rx="1.8" fill="#FFD166"/><rect x="33.5" y="5.5" width="11" height="7.5" rx="1.8" fill="#FFFDF7"/><rect x="5.5" y="15.2" width="11" height="7.5" rx="1.8" fill="#FAF2DF"/><rect x="19.5" y="15.2" width="11" height="7.5" rx="1.8" fill="#FF6B35"/><rect x="33.5" y="15.2" width="11" height="7.5" rx="1.8" fill="#FAF2DF"/><rect x="5.5" y="25" width="11" height="7.5" rx="1.8" fill="#FFFDF7"/><rect x="19.5" y="25" width="11" height="7.5" rx="1.8" fill="#FFFDF7"/><rect x="33.5" y="25" width="11" height="7.5" rx="1.8" fill="#1746A2"/></svg>`;
    case 'TIC_TAC_LINE':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#1746A2" stroke="#D9A441" stroke-width="1.8"/><rect x="6" y="5" width="10.5" height="7.5" rx="1.6" fill="#FFD166"/><rect x="19.8" y="5" width="10.5" height="7.5" rx="1.6" fill="#FAF2DF" fill-opacity="0.35"/><rect x="33.5" y="5" width="10.5" height="7.5" rx="1.6" fill="#E6397A"/><rect x="6" y="15.2" width="10.5" height="7.5" rx="1.6" fill="#FAF2DF" fill-opacity="0.35"/><rect x="19.8" y="15.2" width="10.5" height="7.5" rx="1.6" fill="#FFD166"/><rect x="33.5" y="15.2" width="10.5" height="7.5" rx="1.6" fill="#FAF2DF" fill-opacity="0.35"/><rect x="6" y="25.4" width="10.5" height="7.5" rx="1.6" fill="#008B94"/><rect x="19.8" y="25.4" width="10.5" height="7.5" rx="1.6" fill="#FAF2DF" fill-opacity="0.35"/><rect x="33.5" y="25.4" width="10.5" height="7.5" rx="1.6" fill="#FFD166"/><line x1="8.5" y1="7.2" x2="41.5" y2="30.8" stroke="#FFFDF7" stroke-width="3" stroke-linecap="round"/></svg>`;
    case 'COAST_HEX_BRIDGE':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#007A82" stroke="#D9A441" stroke-width="1.8"/><rect x="4" y="6.5" width="3.2" height="25" rx="1.6" fill="#FFD166"/><rect x="42.8" y="6.5" width="3.2" height="25" rx="1.6" fill="#FF6B35"/><polygon points="15,11 20,14 20,20 15,23 10,20 10,14" fill="#FAF2DF" stroke="#6E3B23" stroke-width="1"/><polygon points="25,15 30,18 30,24 25,27 20,24 20,18" fill="#FFD166" stroke="#6E3B23" stroke-width="1"/><polygon points="35,11 40,14 40,20 35,23 30,20 30,14" fill="#FF6B35" stroke="#FFFDF7" stroke-width="1"/><path d="M15 17 L25 21 L35 17" stroke="#6E3B23" stroke-width="2" stroke-linecap="round"/></svg>`;
    case 'EYE_GUESS_MEMORY':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#6E3B23" stroke="#D9A441" stroke-width="1.8"/><path d="M6.5 19 Q25 5 43.5 19 Q25 33 6.5 19 Z" fill="#FFFDF7" stroke="#F2A922" stroke-width="2"/><circle cx="25" cy="19" r="7" fill="#008B94"/><circle cx="25" cy="19" r="3.2" fill="#141B29"/><circle cx="27" cy="17" r="1.4" fill="#FFFDF7"/></svg>`;
    case 'CONCENTRATION_PRIZE_MATCH':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#C8461C" stroke="#D9A441" stroke-width="1.8"/><rect x="5.5" y="7.5" width="16" height="23" rx="3" fill="#FFFDF7"/><rect x="28.5" y="7.5" width="16" height="23" rx="3" fill="#FFFDF7"/><rect x="9" y="14" width="9" height="8" rx="1.6" fill="#008B94"/><rect x="32" y="14" width="9" height="8" rx="1.6" fill="#008B94"/><path d="M17 9.5 Q25 2.5 33 9.5" stroke="#FFD166" stroke-width="2.4" stroke-linecap="round"/></svg>`;
    case 'MONTY_CURTAIN_DEAL':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#8E1B46" stroke="#D9A441" stroke-width="1.8"/><path d="M5.5 32 V12.5 C5.5 8.5 15.5 8.5 15.5 12.5 V32 Z" fill="#E6397A"/><path d="M20 32 V11.5 C20 7.5 30 7.5 30 11.5 V32 Z" fill="#FFD166"/><path d="M34.5 32 V12.5 C34.5 8.5 44.5 8.5 44.5 12.5 V32 Z" fill="#008B94"/><rect x="4.5" y="31" width="41" height="3" rx="1.5" fill="#F2A922"/></svg>`;
    case 'PRESS_YOUR_LUCK_GREMLIN':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#5C301B" stroke="#D9A441" stroke-width="1.8"/><rect x="5" y="5" width="9" height="6" rx="1.2" fill="#008B94"/><rect x="15.5" y="5" width="9" height="6" rx="1.2" fill="#FFD166"/><rect x="26" y="5" width="9" height="6" rx="1.2" fill="#E6397A"/><rect x="36.5" y="5" width="8.5" height="6" rx="1.2" fill="#1746A2"/><rect x="5" y="27" width="9" height="6" rx="1.2" fill="#FF6B35"/><rect x="15.5" y="27" width="9" height="6" rx="1.2" fill="#1746A2"/><rect x="26" y="27" width="9" height="6" rx="1.2" fill="#FFD166"/><rect x="36.5" y="27" width="8.5" height="6" rx="1.2" fill="#008B94"/><rect x="15.5" y="13" width="19" height="12" rx="2.5" fill="#FAF2DF"/><path d="M25.5 14.5 L22 19.5 H25.2 L24 23.5 L28.2 18.2 H25.2 Z" fill="#E8531E"/></svg>`;
    case 'LOUVER_SHUTTER':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#008B94" stroke="#D9A441" stroke-width="1.8"/><rect x="6" y="6" width="38" height="4.5" rx="1.5" fill="#FFFDF7"/><rect x="6" y="12.5" width="38" height="4.5" rx="1.5" fill="#FAF2DF"/><rect x="6" y="19" width="38" height="4.5" rx="1.5" fill="#FFFDF7"/><rect x="9" y="25.5" width="32" height="7" rx="2" fill="#F2A922" stroke="#6E3B23" stroke-width="1.2"/></svg>`;
    case 'BLIND_PURSE':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#6E3B23" stroke="#D9A441" stroke-width="1.8"/><rect x="7" y="6" width="36" height="8" rx="2.2" fill="#008B94"/><rect x="9" y="16.5" width="32" height="16" rx="3" fill="#FFFDF7" stroke="#E6397A" stroke-width="1.6"/><circle cx="25" cy="24.5" r="5" fill="#E6397A"/><circle cx="25" cy="24.5" r="2" fill="#FFD166"/></svg>`;
    case 'BLACKOUT_VAULT':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#5C301B" stroke="#D9A441" stroke-width="1.8"/><rect x="6" y="6" width="16" height="26" rx="3" fill="#6E3B23" stroke="#FFD166" stroke-width="1.4"/><circle cx="14" cy="19" r="4.5" fill="#F2A922"/><rect x="28" y="6" width="16" height="26" rx="3" fill="#FFF3C4" stroke="#FF6B35" stroke-width="1.6"/><path d="M37 11 L33 19 H36.5 L35 27 L40 18 H36.5 Z" fill="#E8531E"/></svg>`;
    case 'LIVE_WIRE_FUSE':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#1746A2" stroke="#D9A441" stroke-width="1.8"/><line x1="9" y1="19" x2="41" y2="19" stroke="#FFD166" stroke-width="3" stroke-linecap="round"/><line x1="25" y1="7" x2="25" y2="31" stroke="#FFD166" stroke-width="3" stroke-linecap="round"/><rect x="6" y="14" width="10" height="10" rx="2.5" fill="#008B94" stroke="#FFFDF7" stroke-width="1.2"/><rect x="20" y="14" width="10" height="10" rx="2.5" fill="#FF6B35" stroke="#FFFDF7" stroke-width="1.2"/><rect x="34" y="14" width="10" height="10" rx="2.5" fill="#FAF2DF"/></svg>`;
    case 'SHIFTING_SPOTLIGHT':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#007A82" stroke="#D9A441" stroke-width="1.8"/><line x1="6" y1="7" x2="44" y2="7" stroke="#FFD166" stroke-width="2.4" stroke-linecap="round"/><polygon points="25,8 14,32 36,32" fill="#FFD166" fill-opacity="0.5"/><rect x="18" y="18" width="14" height="14" rx="3" fill="#F2A922" stroke="#FFFDF7" stroke-width="1.4"/></svg>`;
    case 'GOLDEN_DOMINO_CASCADE':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#15803D" stroke="#D9A441" stroke-width="1.8"/><rect x="6" y="11" width="10" height="16" rx="2.5" fill="#FFFDF7"/><rect x="20" y="11" width="10" height="16" rx="2.5" fill="#FFD166"/><rect x="34" y="11" width="10" height="16" rx="2.5" fill="#FF6B35"/><circle cx="11" cy="19" r="2.2" fill="#15803D"/><circle cx="25" cy="19" r="2.2" fill="#6E3B23"/><circle cx="39" cy="19" r="2.2" fill="#FFFDF7"/></svg>`;
    case 'PRESSURE_COOKER':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#C8461C" stroke="#D9A441" stroke-width="1.8"/><circle cx="25" cy="19" r="12" fill="#FFFDF7" stroke="#D9A441" stroke-width="2"/><path d="M16 21 A9 9 0 0 1 34 21" stroke="#008B94" stroke-width="3" stroke-linecap="round"/><line x1="25" y1="20" x2="32" y2="12" stroke="#E6397A" stroke-width="2.4" stroke-linecap="round"/><circle cx="25" cy="20" r="2.2" fill="#6E3B23"/></svg>`;
    case 'HOLLYWOOD_MARQUEE_LINE':
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#8E1B46" stroke="#D9A441" stroke-width="1.8"/><rect x="6" y="12" width="10.5" height="14" rx="2.5" fill="#008B94" stroke="#FFD166" stroke-width="1.4"/><circle cx="11.2" cy="19" r="3" stroke="#FFFDF7" stroke-width="1.6"/><rect x="19.8" y="12" width="10.5" height="14" rx="2.5" fill="#008B94" stroke="#FFD166" stroke-width="1.4"/><circle cx="25" cy="19" r="3" stroke="#FFFDF7" stroke-width="1.6"/><rect x="33.5" y="12" width="10.5" height="14" rx="2.5" fill="#008B94" stroke="#FFD166" stroke-width="1.4"/><circle cx="38.8" cy="19" r="3" stroke="#FFFDF7" stroke-width="1.6"/></svg>`;
    case 'BIG_WHEEL_SHOWCASE':
    default:
      return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="#6E3B23" stroke="#D9A441" stroke-width="1.8"/><circle cx="25" cy="19.5" r="13.5" fill="#1746A2" stroke="#FFD166" stroke-width="2"/><path d="M25 19.5 L25 6 A13.5 13.5 0 0 1 36.5 12.5 Z" fill="#FFD166"/><path d="M25 19.5 L36.5 12.5 A13.5 13.5 0 0 1 36.5 26.5 Z" fill="#FF6B35"/><path d="M25 19.5 L36.5 26.5 A13.5 13.5 0 0 1 25 33 Z" fill="#E6397A"/><path d="M25 19.5 L25 33 A13.5 13.5 0 0 1 13.5 26.5 Z" fill="#008B94"/><path d="M25 19.5 L13.5 26.5 A13.5 13.5 0 0 1 13.5 12.5 Z" fill="#19A85A"/><circle cx="25" cy="19.5" r="3.8" fill="#FAF2DF"/></svg>`;
  }
}

function buildCouchStageMiniSwatchSvg(stageId: StageWorldIdV7 | 'SURPRISE_MIX'): string {
  if (stageId === 'SURPRISE_MIX') {
    return buildCouchBoardMiniDiagramSvg('SURPRISE_MIX');
  }
  const [c1, c2] = STAGE_PALETTE_SWATCHES_V8[stageId] ?? ['#008B94', '#F2A922'];
  const stageIdx = ALL_COUCH_STAGE_IDS_V8.indexOf(stageId);
  const numTxt = String(stageIdx + 1).padStart(2, '0');
  return `<svg class="wsc8-mini-diagram-svg" viewBox="0 0 50 38" fill="none" aria-hidden="true"><rect x="1" y="1" width="48" height="36" rx="7" fill="${c1}" stroke="#D9A441" stroke-width="1.8"/><path d="M5 33 C5 17 45 17 45 33 Z" fill="${c2}" fill-opacity="0.88"/><rect x="13" y="8" width="24" height="16" rx="4" fill="#FFFDF7" stroke="#6E3B23" stroke-width="1.4"/><text x="25" y="19.6" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="10.5" fill="#141B29">${numTxt}</text><rect x="5" y="31.5" width="40" height="3" rx="1.5" fill="#FAF2DF"/></svg>`;
}

// ----------------------------------------------------------------------------
// 4. Scoped Sunlit 1966 Living Color Stage Stylesheet Injection
// ----------------------------------------------------------------------------

const SUNLIT_COUCH_STYLE_ID_V8 = 'wsc8-sunlit-deluxe-styles-v8';

export function ensureCouchPartyDeluxeStylesV8(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SUNLIT_COUCH_STYLE_ID_V8)) return;

  const style = document.createElement('style');
  style.id = SUNLIT_COUCH_STYLE_ID_V8;
  style.textContent = `
    body:has(.wsc8-backdrop) .ws7-announcer-stage {
      display: none !important;
    }

    .wsc8-backdrop,
    .wsc8-backdrop * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    .wsc8-backdrop {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100dvh;
      max-width: 100vw;
      max-height: 100dvh;
      z-index: 98;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding:
        max(8px, env(safe-area-inset-top, 0px))
        max(10px, env(safe-area-inset-right, 0px))
        max(8px, env(safe-area-inset-bottom, 0px))
        max(10px, env(safe-area-inset-left, 0px));
      background:
        radial-gradient(circle at 20% 20%, rgba(0, 139, 148, 0.32) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.30) 0%, transparent 50%),
        radial-gradient(circle at 50% 84%, rgba(242, 169, 34, 0.24) 0%, transparent 56%),
        rgba(44, 26, 16, 0.76);
      backdrop-filter: blur(8px);
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 15px;
      line-height: 1.35;
      color: #141B29;
      font-variant-numeric: tabular-nums;
      user-select: none;
      animation: wsc8-sunlit-enter 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes wsc8-sunlit-enter {
      from { opacity: 0; transform: scale(0.985); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Sculpted Warm Broadcast Cream Stage Sheet Framed in Sunlit Walnut & Champagne Brass */
    .wsc8-sheet {
      position: relative;
      width: min(1040px, 100%);
      max-height: calc(100dvh - max(18px, calc(env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))));
      min-width: 0;
      display: flex;
      flex-direction: column;
      border-radius: 22px;
      background: linear-gradient(180deg, #FAF2DF 0%, #F3E7CE 100%);
      color: #141B29;
      border: 3px solid #6E3B23;
      box-shadow:
        inset 0 0 0 2px #D9A441,
        0 9px 0 #4A2614,
        0 28px 64px rgba(34, 18, 9, 0.62);
      overflow: hidden;
    }

    .wsc8-sheet[data-width='medium'] {
      width: min(760px, 100%);
    }

    .wsc8-sheet[data-width='ceremony'] {
      width: min(940px, 100%);
    }

    /* Warm #11 Incandescent Marquee Bulb Crown */
    .wsc8-marquee-bar {
      flex-shrink: 0;
      height: 13px;
      width: 100%;
      background:
        radial-gradient(circle, #FFFDF2 0%, #FFD166 44%, rgba(242, 169, 34, 0) 72%) 0 50% / 24px 12px repeat-x,
        linear-gradient(90deg, #5C301B 0%, #7C4427 50%, #5C301B 100%);
      border-bottom: 1.5px solid #D9A441;
      animation: wsc8-bulb-chase 1.3s linear infinite;
    }

    @keyframes wsc8-bulb-chase {
      from { background-position: 0 50%, 0 0; }
      to { background-position: 24px 50%, 0 0; }
    }

    /* Radiant Peacock-to-Cobalt Header Ribbon Matching QUICK PLAY SETUP */
    .wsc8-sheet-header {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 18px;
      background: linear-gradient(135deg, #008B94 0%, #1746A2 100%);
      color: #FFFDF7;
      border-bottom: 2.5px solid #D9A441;
      min-width: 0;
    }

    .wsc8-sheet-header[data-tone='velvet'] {
      background: linear-gradient(135deg, #B5235A 0%, #7A133B 100%);
    }

    .wsc8-sheet-header[data-tone='tangerine'] {
      background: linear-gradient(135deg, #FF7B47 0%, #C93D12 100%);
    }

    .wsc8-header-copy {
      min-width: 0;
      flex: 1 1 auto;
    }

    .wsc8-kicker {
      font-family: 'Jost', 'League Spartan', sans-serif;
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #FFE694;
      line-height: 1.22;
    }

    .wsc8-kicker-ink {
      font-family: 'Jost', 'League Spartan', sans-serif;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #5C301B;
      line-height: 1.22;
    }

    .wsc8-title {
      margin: 2px 0 0;
      font-family: 'Caprasimo', 'Fraunces', Georgia, serif;
      font-size: clamp(21px, 3vw, 29px);
      font-weight: 400;
      line-height: 1.08;
      color: #FFFDF7;
      text-shadow: 0 2px 0 rgba(20, 27, 41, 0.34);
    }

    .wsc8-title-ink {
      margin: 2px 0 0;
      font-family: 'Caprasimo', 'Fraunces', Georgia, serif;
      font-size: clamp(20px, 2.8vw, 27px);
      font-weight: 400;
      line-height: 1.12;
      color: #141B29;
    }

    .wsc8-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .wsc8-svg-ico {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      display: inline-block;
      vertical-align: middle;
    }

    /* Scrollable Sunlit Cream Stage Body */
    .wsc8-sheet-body {
      flex: 1 1 auto;
      min-height: 0;
      min-width: 0;
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      padding: 13px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .wsc8-sheet-footer {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 11px 18px 13px;
      background: linear-gradient(180deg, #EFE3C9 0%, #E3D2B1 100%);
      border-top: 2px solid #D9A441;
      flex-wrap: wrap;
    }

    /* Tactile 1966 Broadcast Buttons (Strictly >= 48x48px Everywhere!) */
    .wsc8-btn {
      appearance: none;
      min-height: 48px;
      min-width: 48px;
      padding: 8px 15px;
      border-radius: 13px;
      border: 2px solid #C89636;
      background: linear-gradient(180deg, #FFFDF7 0%, #EFE2C6 100%);
      color: #141B29;
      font-family: 'Jost', 'League Spartan', sans-serif;
      font-size: 14.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      line-height: 1.15;
      cursor: pointer;
      touch-action: manipulation;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      text-align: center;
      box-shadow: 0 3px 0 rgba(110, 59, 35, 0.22);
      transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.14s ease;
    }

    .wsc8-btn:hover:not(:disabled) {
      filter: brightness(1.04);
      transform: translateY(-1px);
    }

    .wsc8-btn:active:not(:disabled) {
      transform: translateY(1px);
    }

    .wsc8-btn:focus-visible {
      outline: 3px solid #F2A922;
      outline-offset: 2px;
    }

    .wsc8-btn:disabled {
      opacity: 0.48;
      cursor: not-allowed;
    }

    /* Header Frosted Champagne-Brass Twin Toggle & Single BACK x Pill */
    .wsc8-btn-twin-toggle {
      background: linear-gradient(180deg, rgba(255, 250, 232, 0.24) 0%, rgba(217, 164, 65, 0.34) 100%);
      border: 1.8px solid #F2CE74;
      color: #FFFDF7;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
      padding: 8px 13px;
      font-size: 13.5px;
    }

    .wsc8-btn-twin-toggle[aria-pressed='true'] {
      background: linear-gradient(180deg, #FFE484 0%, #F2A922 100%);
      border-color: #FFFDF7;
      color: #141B29;
      font-weight: 900;
    }

    .wsc8-btn-header-back {
      background: linear-gradient(180deg, #FFFDF7 0%, #F2E4C8 100%);
      border: 2px solid #F2CE74;
      color: #141B29;
      font-weight: 900;
      padding: 8px 14px;
      box-shadow: 0 3px 0 rgba(20, 27, 41, 0.26);
    }

    .wsc8-btn-dice {
      padding: 8px 12px;
      min-width: 82px;
      min-height: 48px;
      background: linear-gradient(180deg, #FFF5D4 0%, #E7BC5A 100%);
      border: 2px solid #AE7A1E;
      color: #141B29;
      font-size: 13.5px;
      font-weight: 900;
      flex-shrink: 0;
    }

    .wsc8-btn-teal {
      background: linear-gradient(180deg, #12B0BF 0%, #007D87 100%);
      color: #FFFDF7;
      border-color: #9FF0F8;
      box-shadow: 0 4px 0 #00545C;
      font-weight: 900;
    }

    .wsc8-btn-gold {
      background: linear-gradient(180deg, #FFE27D 0%, #F2A922 100%);
      color: #141B29;
      border-color: #B6760A;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.76),
        0 4px 0 #9A6206;
      font-weight: 900;
    }

    /* Full-Width Lit Atomic Tangerine 3D Launch Paddle Matching Quick Play */
    .wsc8-launch-paddle {
      position: relative;
      overflow: hidden;
      width: 100%;
      min-height: 60px;
      padding: 11px 20px;
      border-radius: 15px;
      border: 2px solid #FFD6BF;
      background: linear-gradient(180deg, #FF7B47 0%, #E8531E 100%);
      color: #FFFDF7;
      font-family: 'Jost', 'League Spartan', sans-serif;
      font-size: clamp(16px, 2.4vw, 20px);
      font-weight: 900;
      letter-spacing: 0.055em;
      text-transform: uppercase;
      cursor: pointer;
      touch-action: manipulation;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow:
        inset 0 2px 0 rgba(255, 244, 204, 0.78),
        inset 0 -2px 0 rgba(133, 30, 6, 0.42),
        0 6px 0 #942307,
        0 14px 28px rgba(74, 38, 20, 0.32);
      transition: transform 0.12s ease, filter 0.14s ease, box-shadow 0.14s ease;
    }

    .wsc8-launch-paddle:hover:not(:disabled) {
      filter: brightness(1.05);
      transform: translateY(-1px);
    }

    .wsc8-launch-paddle:active:not(:disabled) {
      transform: translateY(2px);
      box-shadow:
        inset 0 2px 0 rgba(255, 244, 204, 0.55),
        0 2px 0 #942307;
    }

    .wsc8-launch-paddle:focus-visible {
      outline: 3px solid #F2A922;
      outline-offset: 2px;
    }

    .wsc8-launch-lead {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      text-shadow: 0 2px 0 rgba(115, 25, 5, 0.48);
    }

    .wsc8-pilot-bulb {
      width: 13px;
      height: 13px;
      min-width: 13px;
      border-radius: 50%;
      background: radial-gradient(circle at 36% 36%, #FFFDF4 0%, #FFD166 50%, #D9860B 100%);
      box-shadow:
        0 0 0 2px rgba(115, 25, 5, 0.35),
        0 0 10px rgba(255, 209, 102, 0.88);
      flex-shrink: 0;
    }

    .wsc8-launch-arrow {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      border-radius: 50%;
      background: rgba(115, 25, 5, 0.24);
      border: 1.5px solid rgba(255, 244, 204, 0.55);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 900;
      line-height: 1;
    }

    /* Dual Sunlit Contestant Podium Plaques (Ivory-Cream + Brass + Acrylite Crowns) */
    .wsc8-podium-split {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      min-width: 0;
    }

    @media (max-width: 720px) {
      .wsc8-podium-split {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .wsc8-podium-desk {
      position: relative;
      border-radius: 16px;
      min-width: 0;
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, #FFFDF7 0%, #FAF0DA 100%);
      border: 2px solid #D9A441;
      box-shadow:
        0 4px 0 rgba(110, 59, 35, 0.16),
        0 8px 20px rgba(74, 38, 20, 0.08);
      overflow: hidden;
    }

    .wsc8-podium-desk[data-podium='0'] {
      --wsc8-podium-accent: #008B94;
      --wsc8-podium-crown: linear-gradient(135deg, #0097A1 0%, #00737C 100%);
    }

    .wsc8-podium-desk[data-podium='1'] {
      --wsc8-podium-accent: #FF6B35;
      --wsc8-podium-crown: linear-gradient(135deg, #FF7945 0%, #DC4B1A 100%);
    }

    .wsc8-podium-crown {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
      padding: 7px 12px;
      background: var(--wsc8-podium-crown);
      color: #FFFDF7;
      border-bottom: 2px solid #D9A441;
    }

    .wsc8-podium-pill {
      font-family: 'Jost', 'League Spartan', sans-serif;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #FFFDF7;
    }

    .wsc8-order-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 9px;
      border-radius: 999px;
      background: rgba(255, 253, 247, 0.20);
      border: 1px solid rgba(255, 253, 247, 0.50);
      font-family: 'Jost', sans-serif;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #FFFDF7;
    }

    .wsc8-podium-inner {
      padding: 10px 12px 11px;
      display: flex;
      flex-direction: column;
      gap: 9px;
      min-width: 0;
    }

    .wsc8-podium-hero-row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .wsc8-gouache-medallion {
      width: 68px;
      height: 68px;
      flex-shrink: 0;
      border-radius: 50%;
      border: 3px solid var(--wsc8-podium-accent, #008B94);
      background-color: #EADBC0;
      background-repeat: no-repeat;
      background-size: 200% 200%, cover;
      background-position: 0% 0%, center;
      box-shadow:
        0 0 0 2px #D9A441,
        0 5px 12px rgba(74, 38, 20, 0.22);
    }

    .wsc8-name-stack {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .wsc8-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .wsc8-name-input {
      flex: 1 1 auto;
      min-width: 0;
      width: 100%;
      min-height: 48px;
      padding: 8px 11px;
      border-radius: 11px;
      border: 2px solid #B9852B;
      background: #F6ECDA;
      color: #141B29;
      font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      user-select: text;
      box-shadow: inset 0 2px 4px rgba(92, 48, 27, 0.13);
    }

    .wsc8-name-input:focus {
      outline: 3px solid #F2A922;
      border-color: #008B94;
      background: #FFFDF7;
    }

    .wsc8-cast-caption {
      font-size: 13px;
      font-weight: 700;
      color: #5C432D;
      line-height: 1.24;
    }

    /* Paged 6-Portrait Carousel (Zero Clipped Circles, Zero Horizontal Scrollbar!) */
    .wsc8-carousel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .wsc8-section-label {
      font-family: 'Jost', 'League Spartan', sans-serif;
      font-size: 12.5px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #5C301B;
    }

    .wsc8-page-pill {
      padding: 2px 9px;
      border-radius: 999px;
      background: #F3E4C2;
      border: 1.5px solid #D9A441;
      font-family: 'Jost', sans-serif;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.07em;
      color: #4A2614;
    }

    .wsc8-carousel-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
    }

    .wsc8-brass-stepper {
      appearance: none;
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
      flex-shrink: 0;
      padding: 0;
      border-radius: 12px;
      border: 2px solid #B68224;
      background: linear-gradient(180deg, #FFF8E3 0%, #E7C370 100%);
      color: #141B29;
      font-family: 'Jost', sans-serif;
      font-size: 24px;
      font-weight: 900;
      line-height: 1;
      cursor: pointer;
      touch-action: manipulation;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 0 rgba(110, 59, 35, 0.22);
      transition: transform 0.1s ease, filter 0.12s ease;
    }

    .wsc8-brass-stepper:hover {
      filter: brightness(1.05);
      transform: translateY(-1px);
    }

    .wsc8-brass-stepper:active {
      transform: translateY(1px);
    }

    .wsc8-brass-stepper:focus-visible {
      outline: 3px solid #F2A922;
      outline-offset: 2px;
    }

    .wsc8-avatar-page-grid {
      flex: 1 1 auto;
      display: grid;
      grid-template-columns: repeat(6, 48px);
      gap: 6px;
      align-items: center;
      justify-content: center;
      min-width: 0;
    }

    @media (max-width: 1019px) {
      .wsc8-avatar-page-grid {
        grid-template-columns: repeat(3, 48px);
        gap: 8px 10px;
      }
    }

    .wsc8-avatar-btn {
      position: relative;
      appearance: none;
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
      flex-shrink: 0;
      padding: 0;
      border-radius: 50%;
      border: 2.5px solid #C9B082;
      background-color: #EADBC0;
      background-repeat: no-repeat;
      background-size: 200% 200%, cover;
      background-position: 0% 0%, center;
      cursor: pointer;
      touch-action: manipulation;
      transition: transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
    }

    .wsc8-avatar-btn[aria-checked='true'] {
      border-color: var(--wsc8-podium-accent, #008B94);
      border-width: 3px;
      box-shadow:
        0 0 0 3px rgba(242, 169, 34, 0.65),
        0 4px 10px rgba(74, 38, 20, 0.25);
      transform: scale(1.05);
    }

    .wsc8-avatar-btn:disabled {
      opacity: 0.42;
      cursor: not-allowed;
      filter: grayscale(0.32);
    }

    .wsc8-avatar-taken-tag {
      position: absolute;
      right: -2px;
      bottom: -2px;
      padding: 1px 5px;
      border-radius: 999px;
      background: #6E3B23;
      border: 1.5px solid #FFD166;
      color: #FFFDF7;
      font-family: 'Jost', sans-serif;
      font-size: 10.5px;
      font-weight: 900;
      line-height: 1.1;
      pointer-events: none;
    }

    /* Mechanical 2-Segment Warm-Ivory / Harvest-Gold Show Length Rocker */
    .wsc8-picker-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .wsc8-rocker-housing {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      padding: 5px;
      border-radius: 14px;
      background: #E8DBC1;
      border: 2px solid #CCA048;
      box-shadow: inset 0 2px 4px rgba(92, 48, 27, 0.12);
    }

    @media (max-width: 580px) {
      .wsc8-rocker-housing {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .wsc8-rocker-btn {
      appearance: none;
      min-height: 48px;
      min-width: 48px;
      padding: 8px 14px;
      border-radius: 11px;
      border: 2px solid #D5C29B;
      background: #FFFDF7;
      color: #263145;
      font-family: 'Jost', 'League Spartan', sans-serif;
      font-size: 14.5px;
      font-weight: 800;
      letter-spacing: 0.045em;
      text-transform: uppercase;
      cursor: pointer;
      touch-action: manipulation;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-align: center;
      transition: transform 0.1s ease, background 0.14s ease, border-color 0.14s ease;
    }

    .wsc8-rocker-btn[aria-checked='true'] {
      background: linear-gradient(180deg, #FFE484 0%, #F2A922 100%);
      color: #141B29;
      border-color: #9E6508;
      font-weight: 900;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.78),
        0 3px 8px rgba(110, 59, 35, 0.22);
    }

    /* Side-by-Side Brushed-Brass & Ivory Rotary Selector Cards (Zero Clipping!) */
    .wsc8-rotary-pair {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      min-width: 0;
    }

    @media (max-width: 740px) {
      .wsc8-rotary-pair {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .wsc8-rotary-card {
      border-radius: 15px;
      padding: 10px 12px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F9EFD9 100%);
      border: 2px solid #D9A441;
      box-shadow: 0 3px 0 rgba(110, 59, 35, 0.14);
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }

    .wsc8-rotary-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }

    .wsc8-rotary-row {
      display: flex;
      align-items: stretch;
      gap: 8px;
      min-width: 0;
    }

    .wsc8-rotary-step {
      appearance: none;
      width: 48px;
      min-width: 48px;
      min-height: 62px;
      flex-shrink: 0;
      padding: 0;
      border-radius: 12px;
      border: 2px solid #B68224;
      background: linear-gradient(180deg, #FFF8E3 0%, #E7C370 100%);
      color: #141B29;
      font-family: 'Jost', sans-serif;
      font-size: 24px;
      font-weight: 900;
      cursor: pointer;
      touch-action: manipulation;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 0 rgba(110, 59, 35, 0.20);
    }

    .wsc8-rotary-display {
      flex: 1 1 auto;
      min-width: 0;
      min-height: 62px;
      appearance: none;
      padding: 8px 11px;
      border-radius: 12px;
      border: 2px solid #C9B286;
      background: #FAF2DF;
      color: #141B29;
      cursor: pointer;
      touch-action: manipulation;
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
      transition: border-color 0.14s ease, background 0.14s ease;
    }

    .wsc8-rotary-display:hover,
    .wsc8-rotary-display[aria-expanded='true'] {
      background: #FFFDF7;
      border-color: #008B94;
    }

    .wsc8-mini-diagram-svg {
      width: 50px;
      height: 38px;
      flex-shrink: 0;
      display: block;
      filter: drop-shadow(0 2px 3px rgba(74, 38, 20, 0.22));
    }

    .wsc8-rotary-copy {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .wsc8-rotary-title {
      font-family: 'Jost', 'League Spartan', sans-serif;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1.16;
      color: #141B29;
      word-break: break-word;
    }

    .wsc8-rotary-sub {
      font-size: 12.5px;
      font-weight: 600;
      line-height: 1.24;
      color: #5C4530;
    }

    .wsc8-pip-strip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding-top: 1px;
    }

    .wsc8-pip {
      width: 8px;
      height: 6px;
      border-radius: 999px;
      background: #D8C59E;
      transition: width 0.16s ease, background 0.16s ease;
    }

    .wsc8-pip[data-active='true'] {
      width: 22px;
      background: #008B94;
    }

    .wsc8-pip[data-tone='tangerine'][data-active='true'] {
      background: #FF6B35;
    }

    /* Expandable Full-Width Non-Clipping Option Grid Inside Rotary Card */
    .wsc8-drawer-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      padding-top: 6px;
      border-top: 1.5px dashed #D9A441;
    }

    @media (max-width: 520px) {
      .wsc8-drawer-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .wsc8-drawer-grid[hidden] {
      display: none !important;
    }

    .wsc8-grid-opt-btn {
      appearance: none;
      min-height: 48px;
      min-width: 48px;
      padding: 8px 10px;
      border-radius: 11px;
      border: 1.8px solid #D3BE94;
      background: #FAF2DF;
      color: #141B29;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      line-height: 1.18;
      text-align: left;
      cursor: pointer;
      touch-action: manipulation;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .wsc8-grid-opt-btn[aria-checked='true'] {
      background: linear-gradient(180deg, #FFE484 0%, #F2A922 100%);
      border-color: #9E6508;
      color: #141B29;
      font-weight: 900;
    }

    /* Sunlit Spotlight Handoff & Crimson Velvet Hot-Gremlin Curtain Cards */
    .wsc8-spotlight-card,
    .wsc8-velvet-curtain-card {
      position: relative;
      width: min(700px, 100%);
      max-height: calc(100dvh - 20px);
      overflow-y: auto;
      overflow-x: hidden;
      border-radius: 22px;
      background: linear-gradient(180deg, #FAF2DF 0%, #F3E7CE 100%);
      color: #141B29;
      border: 3px solid #6E3B23;
      box-shadow:
        inset 0 0 0 2px #D9A441,
        0 9px 0 #4A2614,
        0 26px 60px rgba(34, 18, 9, 0.65);
      display: flex;
      flex-direction: column;
    }

    .wsc8-card-body-center {
      padding: 18px 20px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
    }

    .wsc8-spotlight-beam {
      position: absolute;
      top: -30%;
      left: -30%;
      width: 160%;
      height: 160%;
      pointer-events: none;
      background: linear-gradient(
        112deg,
        transparent 40%,
        rgba(255, 224, 130, 0.28) 50%,
        transparent 60%
      );
      animation: wsc8-beam-sweep 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes wsc8-beam-sweep {
      from { transform: translateX(-34%) rotate(-4deg); }
      to { transform: translateX(34%) rotate(4deg); }
    }

    .wsc8-score-ribbon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
      padding: 7px 14px;
      border-radius: 999px;
      background: #FFFDF7;
      border: 2px solid #D9A441;
      font-family: 'Jost', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: #141B29;
    }

    .wsc8-duel-portraits {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .wsc8-pass-arrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 13px;
      border-radius: 999px;
      background: linear-gradient(180deg, #FF7B47 0%, #D94616 100%);
      border: 2px solid #FFD166;
      color: #FFFDF7;
      font-family: 'Jost', sans-serif;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.06em;
    }

    /* Blind Final Wager, Climax Clue & Envelope Reveal Plaques */
    .wsc8-category-plaque {
      width: 100%;
      border-radius: 16px;
      padding: 13px 16px;
      background: linear-gradient(135deg, #008B94 0%, #1746A2 100%);
      border: 2.5px solid #D9A441;
      text-align: center;
      color: #FFFDF7;
      box-shadow: 0 4px 12px rgba(74, 38, 20, 0.16);
    }

    .wsc8-category-name {
      font-family: 'Caprasimo', 'Fraunces', Georgia, serif;
      font-size: clamp(21px, 3.2vw, 30px);
      color: #FFFDF7;
      line-height: 1.14;
      margin-top: 2px;
    }

    .wsc8-privacy-warning {
      width: 100%;
      border-radius: 14px;
      padding: 12px 14px;
      background: #FFF0F5;
      border: 2px dashed #C82D67;
      color: #6B1235;
      font-size: 15px;
      font-weight: 800;
      line-height: 1.35;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .wsc8-wager-drum {
      font-family: 'Michroma', 'Jost', sans-serif;
      font-size: clamp(28px, 5.8vw, 42px);
      font-weight: 900;
      color: #141B29;
      background: linear-gradient(180deg, #FFFDF7 0%, #F5E8CA 100%);
      border: 3px solid #B68224;
      border-radius: 16px;
      padding: 10px 24px;
      min-width: 220px;
      text-align: center;
      box-shadow:
        inset 0 2px 6px rgba(92, 48, 27, 0.14),
        0 4px 0 rgba(110, 59, 35, 0.18);
    }

    .wsc8-wager-drum[data-masked='true'] {
      color: #0E7A46;
      border-color: #19A85A;
      background: #ECFAF2;
      font-family: 'Jost', sans-serif;
      font-size: clamp(20px, 4vw, 28px);
      letter-spacing: 0.08em;
    }

    .wsc8-wager-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      width: min(520px, 100%);
    }

    .wsc8-wager-slider {
      flex: 1 1 auto;
      width: 100%;
      height: 48px;
      accent-color: #E8531E;
      cursor: pointer;
    }

    .wsc8-preset-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      width: 100%;
    }

    @media (max-width: 480px) {
      .wsc8-preset-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .wsc8-shield-banner {
      width: 100%;
      border-radius: 12px;
      padding: 8px 12px;
      background: #E8F8EF;
      border: 2px solid #19A85A;
      color: #0B5D34;
      font-size: 14px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .wsc8-clock-bar {
      width: 100%;
      height: 11px;
      border-radius: 999px;
      background: #E4D5B7;
      border: 1px solid #C8B184;
      overflow: hidden;
    }

    .wsc8-clock-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #008B94 0%, #F2A922 100%);
      transition: width 0.15s linear;
    }

    .wsc8-clock-fill[data-urgent='true'] {
      background: linear-gradient(90deg, #FF6B35 0%, #E03E36 100%);
    }

    .wsc8-tv-clue-card {
      width: 100%;
      border-radius: 16px;
      padding: 15px 16px;
      background: #FFFDF7;
      color: #141B29;
      border: 3px solid #6E3B23;
      text-align: left;
      box-shadow: 0 4px 14px rgba(74, 38, 20, 0.12);
    }

    .wsc8-tv-clue-stem {
      margin: 6px 0 0;
      font-size: clamp(17.5px, 2.5vw, 22px);
      font-weight: 800;
      line-height: 1.35;
      color: #141B29;
    }

    .wsc8-abcd-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      width: 100%;
    }

    @media (max-width: 600px) {
      .wsc8-abcd-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }

    .wsc8-choice-btn {
      appearance: none;
      min-height: 56px;
      min-width: 48px;
      padding: 10px 14px;
      border-radius: 14px;
      border: 2px solid #C9B286;
      background: linear-gradient(180deg, #FFFDF7 0%, #F5E9CE 100%);
      color: #141B29;
      font-size: 16px;
      font-weight: 800;
      line-height: 1.28;
      text-align: left;
      cursor: pointer;
      touch-action: manipulation;
      display: flex;
      align-items: center;
      gap: 11px;
      box-shadow: 0 3px 0 rgba(110, 59, 35, 0.16);
      transition: transform 0.1s ease, border-color 0.14s ease, background 0.14s ease;
    }

    .wsc8-choice-btn:hover:not(:disabled) {
      border-color: #008B94;
      background: #FFFDF7;
    }

    .wsc8-choice-btn[data-sealed='true'] {
      background: linear-gradient(180deg, #FFE484 0%, #F2A922 100%);
      color: #141B29;
      border-color: #9E6508;
    }

    .wsc8-choice-key {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      border-radius: 9px;
      background: #008B94;
      color: #FFFDF7;
      font-family: 'Jost', sans-serif;
      font-size: 16px;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .wsc8-reveal-card {
      border-radius: 16px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F9EFD9 100%);
      border: 2.5px solid #D9A441;
      color: #141B29;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(74, 38, 20, 0.12);
      transition: opacity 0.26s ease, transform 0.26s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.24s ease;
    }

    .wsc8-reveal-card[data-unflipped='true'] {
      opacity: 0.62;
      transform: translateY(4px) scale(0.99);
    }

    .wsc8-reveal-card[data-winner='true'] {
      border-color: #C98209;
      box-shadow:
        0 0 0 3px rgba(242, 169, 34, 0.48),
        0 8px 22px rgba(110, 59, 35, 0.22);
    }

    /* Ornate 1966 IBC Certified Winner's Check */
    .wsc8-certified-check {
      position: relative;
      width: 100%;
      border-radius: 16px;
      padding: 15px 18px;
      background:
        repeating-linear-gradient(
          -45deg,
          #FFFDF7 0px,
          #FFFDF7 11px,
          #F6ECD5 11px,
          #F6ECD5 22px
        );
      color: #141B29;
      border: 4px double #6E3B23;
      box-shadow:
        0 10px 24px rgba(74, 38, 20, 0.18),
        inset 0 0 0 2px rgba(0, 139, 148, 0.26);
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .wsc8-check-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      border-bottom: 1.5px solid rgba(110, 59, 35, 0.26);
      padding-bottom: 8px;
    }

    .wsc8-check-bank {
      font-family: 'Jost', sans-serif;
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6E3B23;
    }

    .wsc8-check-amount-box {
      padding: 6px 14px;
      border-radius: 10px;
      background: #E8F8EF;
      border: 2px solid #0E7A46;
      font-family: 'Michroma', 'Jost', sans-serif;
      font-size: clamp(20px, 3.2vw, 26px);
      font-weight: 900;
      color: #095C34;
    }

    .wsc8-check-payline {
      display: flex;
      align-items: baseline;
      gap: 10px;
      flex-wrap: wrap;
      font-family: 'Jost', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: #4A3828;
    }

    .wsc8-check-payee {
      font-family: 'Caprasimo', 'Fraunces', Georgia, serif;
      font-size: clamp(20px, 3vw, 28px);
      color: #141B29;
      border-bottom: 2.5px solid #141B29;
      padding-bottom: 1px;
    }

    .wsc8-check-words {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #2C3A52;
      background: rgba(110, 59, 35, 0.07);
      border-radius: 8px;
      padding: 6px 10px;
    }

    .wsc8-check-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      padding-top: 2px;
    }

    .wsc8-wax-seal {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 11px;
      border-radius: 999px;
      background: linear-gradient(180deg, #FFE27D 0%, #D9880B 100%);
      border: 1.5px solid #6E3B23;
      color: #141B29;
      font-family: 'Jost', sans-serif;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .wsc8-signature {
      font-family: Georgia, 'Fraunces', serif;
      font-style: italic;
      font-size: 16px;
      font-weight: 700;
      color: #141B29;
    }

    .wsc8-stat-pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .wsc8-stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 9px;
      border-radius: 8px;
      background: #F4E7CC;
      border: 1.5px solid #D5BC8A;
      font-size: 13px;
      font-weight: 800;
      color: #3A291C;
    }

    /* Compact Mobile Portrait (390x660) & Landscape Precision */
    @media (max-width: 480px) {
      .wsc8-backdrop {
        padding:
          max(4px, env(safe-area-inset-top, 0px))
          max(6px, env(safe-area-inset-right, 0px))
          max(4px, env(safe-area-inset-bottom, 0px))
          max(6px, env(safe-area-inset-left, 0px));
      }
      .wsc8-sheet {
        border-radius: 18px;
      }
      .wsc8-sheet-header {
        padding: 10px 12px;
        flex-wrap: wrap;
      }
      .wsc8-sheet-body {
        padding: 10px 12px;
        gap: 10px;
      }
      .wsc8-sheet-footer {
        padding: 9px 12px 11px;
      }
      .wsc8-gouache-medallion {
        width: 58px;
        height: 58px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .wsc8-backdrop,
      .wsc8-marquee-bar,
      .wsc8-spotlight-beam {
        animation: none !important;
      }
    }

    .wsc8-backdrop[data-reduced-motion='true'],
    .wsc8-backdrop[data-reduced-motion='true'] .wsc8-marquee-bar,
    .wsc8-backdrop[data-reduced-motion='true'] .wsc8-spotlight-beam {
      animation: none !important;
    }

    /* R3 Per-Podium Skill Dials (Equal $200-$500 Prizes) */
    .wsc8-skill-dial-wrap {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding-top: 6px;
      border-top: 1.5px dashed #D8C299;
      min-width: 0;
    }

    .wsc8-skill-dial-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      flex-wrap: wrap;
    }

    .wsc8-equal-prize-pill {
      padding: 2px 8px;
      border-radius: 999px;
      background: #E8F8EF;
      border: 1.5px solid #15803D;
      color: #0D5C2B;
      font-family: 'Jost', sans-serif;
      font-size: 11.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .wsc8-skill-dial-row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }

    .wsc8-skill-btn {
      appearance: none;
      min-height: 48px;
      padding: 6px 6px;
      border-radius: 10px;
      border: 2px solid #D5C29B;
      background: #FFFDF7;
      color: #231F20;
      font-family: 'Jost', 'League Spartan', sans-serif;
      cursor: pointer;
      touch-action: manipulation;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1px;
      transition: transform 0.1s ease, border-color 0.12s ease, background 0.12s ease;
    }

    .wsc8-skill-btn-label {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      line-height: 1.1;
    }

    .wsc8-skill-btn-sub {
      font-size: 11.5px;
      font-weight: 700;
      color: #5C432D;
      line-height: 1.1;
    }

    .wsc8-skill-btn[aria-checked='true'] {
      background: linear-gradient(180deg, #FFE484 0%, #F2A922 100%);
      border-color: var(--wsc8-podium-accent, #008B94);
      color: #141B29;
      box-shadow: inset 0 1.5px 0 rgba(255, 255, 255, 0.78), 0 2px 6px rgba(110, 59, 35, 0.22);
    }

    /* R3 Custom Broadcast Booth Panel (6 Vibe Packs + 3 Red Veto Stamps) */
    .wsc8-booth-card {
      border-radius: 15px;
      padding: 11px 13px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F8EED8 100%);
      border: 2px solid #D9A441;
      box-shadow: 0 3px 0 rgba(110, 59, 35, 0.14);
      display: flex;
      flex-direction: column;
      gap: 9px;
      min-width: 0;
    }

    .wsc8-booth-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }

    .wsc8-vibe-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 7px;
    }

    @media (max-width: 720px) {
      .wsc8-vibe-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .wsc8-vibe-btn {
      appearance: none;
      min-height: 50px;
      padding: 7px 9px;
      border-radius: 11px;
      border: 2px solid #D4BC8B;
      border-left: 5px solid var(--vibe-accent, #008B94);
      background: #FAF2DF;
      color: #141B29;
      text-align: left;
      cursor: pointer;
      touch-action: manipulation;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      transition: transform 0.1s ease, border-color 0.12s ease, background 0.12s ease;
    }

    .wsc8-vibe-btn[aria-checked='true'] {
      background: #FFFDF7;
      border-color: #6E3B23;
      border-left-color: var(--vibe-accent, #008B94);
      box-shadow: 0 0 0 2px #F2A922, 0 3px 8px rgba(110, 59, 35, 0.18);
    }

    .wsc8-vibe-title {
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      line-height: 1.15;
    }

    .wsc8-vibe-sub {
      font-size: 11.5px;
      font-weight: 600;
      color: #5C432D;
      line-height: 1.2;
    }

    .wsc8-veto-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .wsc8-veto-chip {
      position: relative;
      appearance: none;
      min-height: 48px;
      padding: 6px 12px;
      border-radius: 10px;
      border: 2px solid #C9B286;
      background: #FFFDF7;
      color: #141B29;
      font-family: 'Jost', sans-serif;
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      touch-action: manipulation;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      overflow: hidden;
    }

    .wsc8-veto-chip[aria-pressed='true'] {
      background: #FFF0F3;
      border-color: #C81E3A;
      color: #8F1027;
      box-shadow: inset 0 0 0 1px rgba(200, 30, 58, 0.35);
    }

    .wsc8-veto-stamp {
      padding: 1px 6px;
      border-radius: 5px;
      border: 1.5px solid #C81E3A;
      background: #E6397A;
      color: #FFFDF7;
      font-size: 10.5px;
      font-weight: 900;
      letter-spacing: 0.06em;
      transform: rotate(-6deg);
    }

    .wsc8-veto-chip:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* R3 Hot Mic Privacy Handoff Card (Sunlit fallback styles alongside showroom_modes_v9.css) */
    .ws9-hotmic-handoff .wsc8-hotmic-hero {
      padding: 16px 18px 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      background: linear-gradient(180deg, #FFFDF7 0%, #FAF2DF 100%);
      color: #141B29;
    }

    .wsc8-hotmic-alert-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 5px 14px;
      border-radius: 999px;
      background: linear-gradient(90deg, #FF6B35 0%, #E6397A 100%);
      color: #FFFDF7;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      border: 1.5px solid #FFFDF7;
      box-shadow: 0 3px 10px rgba(110, 59, 35, 0.24);
    }

    .wsc8-hotmic-headline {
      margin: 0;
      font-family: 'Caprasimo', 'Fraunces', Georgia, serif;
      font-size: clamp(20px, 3vw, 27px);
      line-height: 1.14;
      color: #5C301B;
    }

    .wsc8-hotmic-stakes {
      width: 100%;
      padding: 10px 13px;
      border-radius: 12px;
      background: #FFF6E3;
      border: 2px solid #D9A441;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.38;
      color: #141B29;
    }

    .wsc8-hotmic-ready-btn {
      width: 100%;
      min-height: 54px;
      padding: 12px 18px;
      border-radius: 14px;
      border: 2.5px solid #FFE2A8;
      background: linear-gradient(180deg, #FF7B47 0%, #E8531E 100%);
      color: #FFFDF7;
      font-family: 'Jost', 'League Spartan', sans-serif;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      touch-action: manipulation;
      box-shadow: 0 5px 0 #942307, 0 10px 22px rgba(92, 48, 27, 0.28);
    }
  `;
  document.head.appendChild(style);
}

// ----------------------------------------------------------------------------
// 5. Pure Formatting & Check-Writing Helpers
// ----------------------------------------------------------------------------

function sanitizeContestantName(raw: string, fallback: string): string {
  const cleaned = raw
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 16)
    .toUpperCase();
  return cleaned.length > 0 ? cleaned : fallback;
}

function formatStudioCash(amount: number): string {
  const clean = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return `$${clean.toLocaleString('en-US')}`;
}

function snapWagerStep(amount: number, maxWager: number): number {
  const clamped = Math.max(0, Math.min(maxWager, Math.round(amount)));
  if (clamped === 0 || clamped === maxWager) return clamped;
  return Math.min(maxWager, Math.round(clamped / 25) * 25);
}

function normalizeClueInput(clue: CouchClueInputV8): {
  readonly category: string;
  readonly prompt: string;
  readonly choices: readonly [string, string, string, string];
  readonly answerIdx: 0 | 1 | 2 | 3;
  readonly factoid: string;
} {
  if ('stem' in clue) {
    return {
      category: clue.category,
      prompt: clue.stem,
      choices: clue.choices,
      answerIdx: clue.answerIdx,
      factoid: clue.ahaFactoid ?? '',
    };
  }
  return {
    category: clue.category,
    prompt: clue.prompt,
    choices: clue.choices,
    answerIdx: clue.answerIdx,
    factoid: clue.factoid ?? '',
  };
}

const ONES_WORDS = [
  'ZERO',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN',
] as const;

const TENS_WORDS = [
  '',
  '',
  'TWENTY',
  'THIRTY',
  'FORTY',
  'FIFTY',
  'SIXTY',
  'SEVENTY',
  'EIGHTY',
  'NINETY',
] as const;

function chunkUnderThousandToWords(n: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const rem = n % 100;
  if (hundreds > 0) {
    parts.push(`${ONES_WORDS[hundreds]} HUNDRED`);
  }
  if (rem >= 20) {
    const tens = Math.floor(rem / 10);
    const unit = rem % 10;
    parts.push(unit > 0 ? `${TENS_WORDS[tens]}-${ONES_WORDS[unit]}` : TENS_WORDS[tens]);
  } else if (rem > 0) {
    parts.push(ONES_WORDS[rem]);
  }
  return parts.join(' ');
}

/** Formats an integer dollar amount into authentic 1966 IBC Banknote Check English. */
export function spellCertifiedCheckDollarsV8(amount: number): string {
  const clean = Number.isFinite(amount) ? Math.max(0, Math.min(999_999, Math.round(amount))) : 0;
  if (clean === 0) {
    return 'ZERO AND 00/100 CERTIFIED STUDIO DOLLARS';
  }
  const thousands = Math.floor(clean / 1000);
  const underThousand = clean % 1000;
  const chunks: string[] = [];
  if (thousands > 0) {
    chunks.push(`${chunkUnderThousandToWords(thousands)} THOUSAND`);
  }
  if (underThousand > 0) {
    chunks.push(chunkUnderThousandToWords(underThousand));
  }
  return `${chunks.join(' ')} AND 00/100 DOLLARS`;
}

/**
 * Evaluates both secret Final Broadcast Wagers & Climax Clue choices,
 * applying the `50%` `FINAL_WAGER_SHIELD` refund when owned and resolving
 * exact `$` ties via fastest climax lock-in speed (or Co-Champions on dead heat).
 */
export function evaluateCouchFinalShowdownV8(input: {
  readonly spec: CouchShowdownLaunchSpecV8 | CouchShowdownLaunchSpecV9;
  readonly p1Cash: number;
  readonly p2Cash: number;
  readonly p1FinalWagerShield?: boolean;
  readonly p2FinalWagerShield?: boolean;
  readonly wagerResult: CouchSecretFinalWagerResultV8;
  readonly p1TimedOut?: boolean;
  readonly p2TimedOut?: boolean;
  readonly answerIdx: 0 | 1 | 2 | 3;
  readonly tieBreakBySpeed?: boolean;
}): CouchFinalShowdownEvaluationV8 {
  const baseP1 = Math.max(0, Math.round(input.p1Cash));
  const baseP2 = Math.max(0, Math.round(input.p2Cash));
  const w1 = Math.max(0, Math.round(input.wagerResult.p1Wager));
  const w2 = Math.max(0, Math.round(input.wagerResult.p2Wager));

  const p1TimedOut = Boolean(input.p1TimedOut);
  const p2TimedOut = Boolean(input.p2TimedOut);
  const p1Correct = !p1TimedOut && input.wagerResult.p1ChoiceIdx === input.answerIdx;
  const p2Correct = !p2TimedOut && input.wagerResult.p2ChoiceIdx === input.answerIdx;

  const p1AtRisk = Math.min(baseP1, w1);
  const p1ShieldApplied = !p1Correct && w1 > 0 && Boolean(input.p1FinalWagerShield);
  const p1NetLoss = p1ShieldApplied ? Math.floor(p1AtRisk * 0.5) : p1AtRisk;
  const p1ShieldRefundCash = p1ShieldApplied ? Math.max(0, p1AtRisk - p1NetLoss) : 0;
  const p1Delta = p1Correct ? w1 : -p1NetLoss;

  const p2AtRisk = Math.min(baseP2, w2);
  const p2ShieldApplied = !p2Correct && w2 > 0 && Boolean(input.p2FinalWagerShield);
  const p2NetLoss = p2ShieldApplied ? Math.floor(p2AtRisk * 0.5) : p2AtRisk;
  const p2ShieldRefundCash = p2ShieldApplied ? Math.max(0, p2AtRisk - p2NetLoss) : 0;
  const p2Delta = p2Correct ? w2 : -p2NetLoss;

  const finalP1Cash = Math.max(0, baseP1 + p1Delta);
  const finalP2Cash = Math.max(0, baseP2 + p2Delta);
  const isExactCashTie = finalP1Cash === finalP2Cash;

  let winnerPodium: 0 | 1 | 'CO_CHAMPIONS';
  let wonBySpeedTieBreaker = false;

  if (finalP1Cash > finalP2Cash) {
    winnerPodium = 0;
  } else if (finalP2Cash > finalP1Cash) {
    winnerPodium = 1;
  } else {
    const useSpeed = input.tieBreakBySpeed !== false;
    const speedGap = Math.abs(input.wagerResult.p1TimeSec - input.wagerResult.p2TimeSec);
    if (useSpeed && (!p1TimedOut || !p2TimedOut) && (p1Correct !== p2Correct || speedGap >= 0.1)) {
      if (p1Correct && !p2Correct) {
        winnerPodium = 0;
        wonBySpeedTieBreaker = true;
      } else if (p2Correct && !p1Correct) {
        winnerPodium = 1;
        wonBySpeedTieBreaker = true;
      } else if (speedGap >= 0.1) {
        winnerPodium = input.wagerResult.p1TimeSec < input.wagerResult.p2TimeSec ? 0 : 1;
        wonBySpeedTieBreaker = true;
      } else {
        winnerPodium = 'CO_CHAMPIONS';
      }
    } else {
      winnerPodium = 'CO_CHAMPIONS';
    }
  }

  const winnerName =
    winnerPodium === 0
      ? input.spec.podium1.name
      : winnerPodium === 1
        ? input.spec.podium2.name
        : `${input.spec.podium1.name} & ${input.spec.podium2.name}`;

  const runnerUpName =
    winnerPodium === 0
      ? input.spec.podium2.name
      : winnerPodium === 1
        ? input.spec.podium1.name
        : null;

  return {
    p1Wager: w1,
    p2Wager: w2,
    p1ChoiceIdx: input.wagerResult.p1ChoiceIdx,
    p2ChoiceIdx: input.wagerResult.p2ChoiceIdx,
    p1TimeSec: input.wagerResult.p1TimeSec,
    p2TimeSec: input.wagerResult.p2TimeSec,
    p1TimedOut,
    p2TimedOut,
    p1Correct,
    p2Correct,
    p1ShieldApplied,
    p2ShieldApplied,
    p1ShieldRefundCash,
    p2ShieldRefundCash,
    p1Delta,
    p2Delta,
    finalP1Cash,
    finalP2Cash,
    isExactCashTie,
    wonBySpeedTieBreaker,
    winnerPodium,
    winnerName,
    runnerUpName,
  };
}

// ----------------------------------------------------------------------------
// 6. Deliverable 1 — Sleek Sunlit 1966 Studio 6A Dual-Podium Setup Sheet
//    (`openCouchPartySetupSheetV8`)
// ----------------------------------------------------------------------------

const PORTRAITS_PER_PAGE_V8 = 6;
const TOTAL_PORTRAIT_PAGES_V8 = Math.ceil(
  ALL_COUCH_CAST_IDS_V8.length / PORTRAITS_PER_PAGE_V8,
);

export function openCouchPartySetupSheetV8(
  container: HTMLElement,
  opts?: CouchPartySetupOptionsV8,
): Promise<CouchShowdownLaunchSpecV9 | null> {
  ensureCouchPartyDeluxeStylesV8();

  return new Promise<CouchShowdownLaunchSpecV9 | null>((resolve) => {
    let p1Name = opts?.initialSpec?.podium1?.name ?? 'ACE';
    let p2Name = opts?.initialSpec?.podium2?.name ?? 'SUNNY';
    let p1Avatar: CastIdV7 = opts?.initialSpec?.podium1?.avatarId ?? 'CARMEN_DELGADO';
    let p2Avatar: CastIdV7 = opts?.initialSpec?.podium2?.avatarId ?? 'REX_CALLOWAY';
    if (p1Avatar === p2Avatar && !opts?.allowIdenticalAvatars) {
      p2Avatar = p1Avatar === 'REX_CALLOWAY' ? 'CARMEN_DELGADO' : 'REX_CALLOWAY';
    }

    let p1SkillDial: CouchSkillDialV9 = opts?.initialSpec?.skillDials?.[0] ?? 'MIXED';
    let p2SkillDial: CouchSkillDialV9 = opts?.initialSpec?.skillDials?.[1] ?? 'MIXED';
    let selectedVibePackId: VibePackIdV9 =
      opts?.initialSpec?.boothConfig?.vibePackId ?? 'PRIMETIME_LIVING_COLOR';
    const vetoedCategorySet = new Set<CategoryIdV7>(
      (opts?.initialSpec?.boothConfig?.vetoedCategories ?? []).slice(0, 3),
    );

    let allowTwinAvatars = Boolean(opts?.allowIdenticalAvatars);
    let totalTurns: 6 | 10 = opts?.initialSpec?.totalTurns ?? opts?.defaultTurns ?? 6;
    let selectedStage: StageWorldIdV7 | 'SURPRISE_MIX' =
      opts?.initialSpec?.stageId ?? opts?.defaultStageId ?? 'SURPRISE_MIX';
    let selectedMode: BoardPlayModeV9 | 'SURPRISE_MIX' =
      opts?.initialSpec?.boardPlayMode ?? opts?.defaultBoardPlayMode ?? 'SURPRISE_MIX';

    let diceCursor = Math.floor(Math.random() * COUCH_1966_NICKNAMES_V8.length);
    let settled = false;

    const backdrop = document.createElement('div');
    backdrop.className = 'wsc8-backdrop';
    backdrop.dataset.modal = 'couch-party-setup-v8';
    if (opts?.reducedMotion) {
      backdrop.dataset.reducedMotion = 'true';
    }
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Studio 6A 2-Player Couch Showdown Setup');

    const closeAndResolve = (spec: CouchShowdownLaunchSpecV9 | null): void => {
      if (settled) return;
      settled = true;
      window.removeEventListener('keydown', handleKeyDown);
      backdrop.remove();
      resolve(spec);
    };

    const handleKeyDown = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        opts?.onTapSfx?.();
        closeAndResolve(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const sheet = document.createElement('section');
    sheet.className = 'wsc8-sheet';

    const marquee = document.createElement('div');
    marquee.className = 'wsc8-marquee-bar';
    marquee.setAttribute('aria-hidden', 'true');

    // Radiant Peacock-to-Cobalt Header Ribbon (Single BACK x button in top-right!)
    const header = document.createElement('header');
    header.className = 'wsc8-sheet-header';

    const headerCopy = document.createElement('div');
    headerCopy.className = 'wsc8-header-copy';
    headerCopy.innerHTML = `
      <div class="wsc8-kicker">STUDIO 6A · PASS-AND-PLAY PARTY SHOWDOWN · 100% CAMPAIGN-SAFE</div>
      <h2 class="wsc8-title">2-Player Couch Showdown</h2>
    `;

    const headerActions = document.createElement('div');
    headerActions.className = 'wsc8-header-actions';

    const twinToggleBtn = document.createElement('button');
    twinToggleBtn.type = 'button';
    twinToggleBtn.className = 'wsc8-btn wsc8-btn-twin-toggle';
    twinToggleBtn.dataset.action = 'toggle-twin-avatars';
    twinToggleBtn.setAttribute('aria-pressed', String(allowTwinAvatars));
    twinToggleBtn.title = 'Allow both Podiums to wear the same Cast Portrait';
    const syncTwinToggleCopy = (): void => {
      twinToggleBtn.setAttribute('aria-pressed', String(allowTwinAvatars));
      twinToggleBtn.innerHTML = `${buildCouchIconSvg('TWINS')}<span>TWIN PORTRAITS: ${allowTwinAvatars ? 'ON' : 'OFF'}</span>`;
    };
    syncTwinToggleCopy();

    const closeTopBtn = document.createElement('button');
    closeTopBtn.type = 'button';
    closeTopBtn.className = 'wsc8-btn wsc8-btn-header-back';
    closeTopBtn.dataset.action = 'couch-setup-close';
    closeTopBtn.setAttribute('aria-label', 'Back to Studio Hub');
    closeTopBtn.textContent = 'BACK ×';
    closeTopBtn.addEventListener('click', () => {
      opts?.onTapSfx?.();
      closeAndResolve(null);
    });

    headerActions.append(twinToggleBtn, closeTopBtn);
    header.append(headerCopy, headerActions);

    // Sunlit Warm Broadcast Cream Body
    const body = document.createElement('div');
    body.className = 'wsc8-sheet-body';

    const podiumSplit = document.createElement('div');
    podiumSplit.className = 'wsc8-podium-split';

    const refreshAvatarCollisionStates: Array<() => void> = [];

    const rollPresetNickname = (excludeName: string): string => {
      const upperExclude = excludeName.trim().toUpperCase();
      for (let i = 0; i < COUCH_1966_NICKNAMES_V8.length; i += 1) {
        diceCursor = (diceCursor + 1) % COUCH_1966_NICKNAMES_V8.length;
        const candidate = COUCH_1966_NICKNAMES_V8[diceCursor];
        if (candidate !== upperExclude) {
          return candidate;
        }
      }
      return 'CHAMP';
    };

    const buildPodiumDesk = (podiumIdx: 0 | 1): HTMLElement => {
      const isP1 = podiumIdx === 0;
      const desk = document.createElement('div');
      desk.className = 'wsc8-podium-desk';
      desk.dataset.podium = String(podiumIdx);

      // Acrylite Top Crown (Left = Peacock Teal, Right = Atomic Tangerine)
      const crown = document.createElement('div');
      crown.className = 'wsc8-podium-crown';

      const pill = document.createElement('span');
      pill.className = 'wsc8-podium-pill';
      pill.textContent = isP1
        ? 'PODIUM 1 · PEACOCK TEAL'
        : 'PODIUM 2 · ATOMIC TANGERINE';

      const orderTag = document.createElement('span');
      orderTag.className = 'wsc8-order-tag';
      orderTag.innerHTML = isP1
        ? `${buildCouchIconSvg('MIC')}<span>1ST BOARD PICK</span>`
        : `${buildCouchIconSvg('BOLT')}<span>COUNTER-PICK</span>`;

      crown.append(pill, orderTag);

      const inner = document.createElement('div');
      inner.className = 'wsc8-podium-inner';

      const heroRow = document.createElement('div');
      heroRow.className = 'wsc8-podium-hero-row';

      const currentAvatar = (): CastIdV7 => (isP1 ? p1Avatar : p2Avatar);
      const otherAvatar = (): CastIdV7 => (isP1 ? p2Avatar : p1Avatar);

      const initialIdx = Math.max(0, ALL_COUCH_CAST_IDS_V8.indexOf(currentAvatar()));
      let currentPage = Math.floor(initialIdx / PORTRAITS_PER_PAGE_V8);

      const medallion = document.createElement('div');
      medallion.className = 'wsc8-gouache-medallion';
      applyCouchCastPortraitV8(medallion, currentAvatar(), 'POISED');

      const nameStack = document.createElement('div');
      nameStack.className = 'wsc8-name-stack';

      const nameRow = document.createElement('div');
      nameRow.className = 'wsc8-name-row';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'wsc8-name-input';
      nameInput.maxLength = 16;
      nameInput.value = isP1 ? p1Name : p2Name;
      nameInput.placeholder = isP1 ? 'CONTESTANT 1' : 'CONTESTANT 2';
      nameInput.dataset.podiumInput = String(podiumIdx);
      nameInput.setAttribute('aria-label', `Podium ${podiumIdx + 1} Contestant Name`);
      nameInput.addEventListener('input', () => {
        if (isP1) p1Name = nameInput.value;
        else p2Name = nameInput.value;
      });
      nameInput.addEventListener('blur', () => {
        const clean = sanitizeContestantName(
          nameInput.value,
          isP1 ? 'CONTESTANT 1' : 'CONTESTANT 2',
        );
        nameInput.value = clean;
        if (isP1) p1Name = clean;
        else p2Name = clean;
      });

      const diceBtn = document.createElement('button');
      diceBtn.type = 'button';
      diceBtn.className = 'wsc8-btn wsc8-btn-dice';
      diceBtn.dataset.action = `roll-nickname-${podiumIdx}`;
      diceBtn.setAttribute(
        'aria-label',
        `Roll 1966 Studio Nickname for Podium ${podiumIdx + 1}`,
      );
      diceBtn.title = 'Roll a fun 1966 Studio Nickname!';
      diceBtn.innerHTML = `${buildCouchIconSvg('DICE')}<span>DICE</span>`;
      diceBtn.addEventListener('click', () => {
        (opts?.onDiceSfx ?? opts?.onTapSfx)?.();
        const nextNick = rollPresetNickname(isP1 ? p2Name : p1Name);
        nameInput.value = nextNick;
        if (isP1) p1Name = nextNick;
        else p2Name = nextNick;
      });

      nameRow.append(nameInput, diceBtn);

      const castCaption = document.createElement('div');
      castCaption.className = 'wsc8-cast-caption';
      const syncCaption = (): void => {
        const prof = CAST_PROFILES_V7[currentAvatar()];
        castCaption.textContent = `${prof.name} · ${prof.title}`;
      };
      syncCaption();

      nameStack.append(nameRow, castCaption);
      heroRow.append(medallion, nameStack);

      // Paged 6-Portrait Carousel (Zero Clipped Circles!)
      const carouselHead = document.createElement('div');
      carouselHead.className = 'wsc8-carousel-head';

      const stripLabel = document.createElement('span');
      stripLabel.className = 'wsc8-section-label';
      stripLabel.textContent = '27 GOUACHE CAST PORTRAITS';

      const pagePill = document.createElement('span');
      pagePill.className = 'wsc8-page-pill';
      pagePill.dataset.role = `portrait-page-indicator-${podiumIdx}`;

      carouselHead.append(stripLabel, pagePill);

      const carouselRow = document.createElement('div');
      carouselRow.className = 'wsc8-carousel-row';

      const prevPageBtn = document.createElement('button');
      prevPageBtn.type = 'button';
      prevPageBtn.className = 'wsc8-brass-stepper';
      prevPageBtn.dataset.action = `prev-avatar-page-${podiumIdx}`;
      prevPageBtn.setAttribute('aria-label', `Previous Podium ${podiumIdx + 1} Portrait Page`);
      prevPageBtn.textContent = '‹';

      const pageGrid = document.createElement('div');
      pageGrid.className = 'wsc8-avatar-page-grid';
      pageGrid.setAttribute('role', 'radiogroup');
      pageGrid.setAttribute('aria-label', `Podium ${podiumIdx + 1} Cast Portrait Carousel`);

      const nextPageBtn = document.createElement('button');
      nextPageBtn.type = 'button';
      nextPageBtn.className = 'wsc8-brass-stepper';
      nextPageBtn.dataset.action = `next-avatar-page-${podiumIdx}`;
      nextPageBtn.setAttribute('aria-label', `Next Podium ${podiumIdx + 1} Portrait Page`);
      nextPageBtn.textContent = '›';

      const renderPortraitPage = (): void => {
        pagePill.textContent = `PAGE ${currentPage + 1}/${TOTAL_PORTRAIT_PAGES_V8}`;
        pageGrid.innerHTML = '';

        const start = currentPage * PORTRAITS_PER_PAGE_V8;
        const slice = ALL_COUCH_CAST_IDS_V8.slice(start, start + PORTRAITS_PER_PAGE_V8);
        const mine = currentAvatar();
        const theirs = otherAvatar();

        slice.forEach((castId) => {
          const prof = CAST_PROFILES_V7[castId];
          const isMine = castId === mine;
          const isTakenByOther = !allowTwinAvatars && castId === theirs && !isMine;

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'wsc8-avatar-btn';
          btn.dataset.castId = castId;
          btn.setAttribute('role', 'radio');
          btn.setAttribute('aria-checked', String(isMine));
          btn.setAttribute('aria-label', `${prof.name} (${prof.title})`);
          btn.title = `${prof.name} — ${prof.title}`;
          btn.disabled = isTakenByOther;
          applyCouchCastPortraitV8(btn, castId, 'POISED');

          if (castId === theirs && !isMine) {
            const tag = document.createElement('span');
            tag.className = 'wsc8-avatar-taken-tag';
            tag.textContent = isP1 ? 'P2' : 'P1';
            btn.appendChild(tag);
          }

          btn.addEventListener('click', () => {
            if (btn.disabled) return;
            opts?.onTapSfx?.();
            if (isP1) p1Avatar = castId;
            else p2Avatar = castId;
            refreshAvatarCollisionStates.forEach((fn) => fn());
          });

          pageGrid.appendChild(btn);
        });
      };

      prevPageBtn.addEventListener('click', () => {
        opts?.onTapSfx?.();
        currentPage = (currentPage - 1 + TOTAL_PORTRAIT_PAGES_V8) % TOTAL_PORTRAIT_PAGES_V8;
        renderPortraitPage();
      });

      nextPageBtn.addEventListener('click', () => {
        opts?.onTapSfx?.();
        currentPage = (currentPage + 1) % TOTAL_PORTRAIT_PAGES_V8;
        renderPortraitPage();
      });

      refreshAvatarCollisionStates.push(() => {
        applyCouchCastPortraitV8(medallion, currentAvatar(), 'POISED');
        syncCaption();
        renderPortraitPage();
      });

      renderPortraitPage();
      carouselRow.append(prevPageBtn, pageGrid, nextPageBtn);

      // R3 Per-Podium Skill Dial (EASY / MIXED / SHARK for equal $200-$500 prizes)
      const skillDialWrap = document.createElement('div');
      skillDialWrap.className = 'wsc8-skill-dial-wrap';

      const skillHead = document.createElement('div');
      skillHead.className = 'wsc8-skill-dial-head';

      const skillLbl = document.createElement('span');
      skillLbl.className = 'wsc8-section-label';
      skillLbl.textContent = 'PODIUM SKILL DIAL';

      const equalPrizePill = document.createElement('span');
      equalPrizePill.className = 'wsc8-equal-prize-pill';
      equalPrizePill.textContent = 'EQUAL $200–$500 PRIZES';

      skillHead.append(skillLbl, equalPrizePill);

      const skillRow = document.createElement('div');
      skillRow.className = 'wsc8-skill-dial-row';
      skillRow.setAttribute('role', 'radiogroup');
      skillRow.setAttribute('aria-label', `Podium ${podiumIdx + 1} Clue Skill Dial`);

      const skillSpecs: ReadonlyArray<{
        readonly dial: CouchSkillDialV9;
        readonly label: string;
        readonly sub: string;
      }> = [
        { dial: 'EASY', label: 'EASY', sub: 'Tiers 1–2' },
        { dial: 'MIXED', label: 'MIXED', sub: 'Tiers 1–4' },
        { dial: 'SHARK', label: 'SHARK', sub: 'Tiers 3–5' },
      ];

      const skillBtns: HTMLButtonElement[] = [];
      const getDial = (): CouchSkillDialV9 => (isP1 ? p1SkillDial : p2SkillDial);
      const setDial = (next: CouchSkillDialV9): void => {
        if (isP1) p1SkillDial = next;
        else p2SkillDial = next;
      };

      skillSpecs.forEach((s) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wsc8-skill-btn';
        btn.dataset.skillDial = s.dial;
        btn.dataset.podiumSkill = String(podiumIdx);
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', String(getDial() === s.dial));
        btn.innerHTML = `<span class="wsc8-skill-btn-label">${s.label}</span><span class="wsc8-skill-btn-sub">${s.sub}</span>`;
        btn.addEventListener('click', () => {
          opts?.onTapSfx?.();
          setDial(s.dial);
          skillBtns.forEach((b) =>
            b.setAttribute('aria-checked', String(b.dataset.skillDial === s.dial)),
          );
        });
        skillBtns.push(btn);
        skillRow.appendChild(btn);
      });

      skillDialWrap.append(skillHead, skillRow);

      inner.append(heroRow, carouselHead, carouselRow, skillDialWrap);
      desk.append(crown, inner);
      return desk;
    };

    podiumSplit.append(buildPodiumDesk(0), buildPodiumDesk(1));

    twinToggleBtn.addEventListener('click', () => {
      opts?.onTapSfx?.();
      allowTwinAvatars = !allowTwinAvatars;
      if (!allowTwinAvatars && p1Avatar === p2Avatar) {
        p2Avatar = ALL_COUCH_CAST_IDS_V8.find((id) => id !== p1Avatar) ?? 'REX_CALLOWAY';
      }
      syncTwinToggleCopy();
      refreshAvatarCollisionStates.forEach((fn) => fn());
    });

    // 2-Segment Warm-Ivory / Harvest-Gold Mechanical Show Length Rocker
    const lengthSection = document.createElement('div');
    lengthSection.className = 'wsc8-picker-section';
    lengthSection.innerHTML = `<div class="wsc8-section-label">SHOW LENGTH &amp; STUDIO PACE</div>`;

    const rockerHousing = document.createElement('div');
    rockerHousing.className = 'wsc8-rocker-housing';
    rockerHousing.setAttribute('role', 'radiogroup');
    rockerHousing.setAttribute('aria-label', 'Show Length Picker');

    const lengthSpecs: ReadonlyArray<{
      readonly turns: 6 | 10;
      readonly icon: 'BOLT' | 'CLAPPER';
      readonly label: string;
    }> = [
      { turns: 6, icon: 'BOLT', label: '6-TURN COUCH DUEL (~4 MIN)' },
      { turns: 10, icon: 'CLAPPER', label: '10-TURN PRIME-TIME SHOW (~7 MIN)' },
    ];
    const lengthBtns: HTMLButtonElement[] = [];
    lengthSpecs.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wsc8-rocker-btn';
      btn.dataset.turns = String(item.turns);
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(totalTurns === item.turns));
      btn.innerHTML = `${buildCouchIconSvg(item.icon)}<span>${item.label}</span>`;
      btn.addEventListener('click', () => {
        opts?.onTapSfx?.();
        totalTurns = item.turns;
        lengthBtns.forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
      });
      lengthBtns.push(btn);
      rockerHousing.appendChild(btn);
    });
    lengthSection.appendChild(rockerHousing);

    // Side-by-Side Brushed-Brass & Ivory Rotary Selector Cards (Zero Overflow!)
    const rotaryPair = document.createElement('div');
    rotaryPair.className = 'wsc8-rotary-pair';

    // Card A: TV Board Game Format (Surprise Studio Mix + All 16 v9 Formats = 17)
    const modeEntries: ReadonlyArray<{
      readonly id: BoardPlayModeV9 | 'SURPRISE_MIX';
      readonly title: string;
      readonly subtitle: string;
    }> = [
      {
        id: 'SURPRISE_MIX',
        title: 'SURPRISE STUDIO MIX',
        subtitle: BOARD_MODE_HOOKS_V8.SURPRISE_MIX,
      },
      ...ALL_BOARD_PLAY_MODES_V9.map((mode) => ({
        id: mode,
        title: BOARD_PLAY_MODE_TITLES_V9[mode],
        subtitle: BOARD_MODE_HOOKS_V8[mode],
      })),
    ];

    const modeCard = document.createElement('div');
    modeCard.className = 'wsc8-rotary-card';

    const modeHead = document.createElement('div');
    modeHead.className = 'wsc8-rotary-head';
    const modeLbl = document.createElement('span');
    modeLbl.className = 'wsc8-section-label';
    modeLbl.textContent = 'TV BOARD GAME FORMAT';
    const modeCountPill = document.createElement('span');
    modeCountPill.className = 'wsc8-page-pill';
    modeHead.append(modeLbl, modeCountPill);

    const modeRow = document.createElement('div');
    modeRow.className = 'wsc8-rotary-row';

    const prevModeBtn = document.createElement('button');
    prevModeBtn.type = 'button';
    prevModeBtn.className = 'wsc8-rotary-step';
    prevModeBtn.dataset.action = 'prev-board-mode';
    prevModeBtn.setAttribute('aria-label', 'Previous TV Board Game Format');
    prevModeBtn.textContent = '‹';

    const modeDisplayBtn = document.createElement('button');
    modeDisplayBtn.type = 'button';
    modeDisplayBtn.className = 'wsc8-rotary-display';
    modeDisplayBtn.dataset.action = 'toggle-board-mode-drawer';
    modeDisplayBtn.setAttribute('aria-expanded', 'false');
    modeDisplayBtn.title = `Tap to view all ${modeEntries.length} TV Board Game Formats at once`;

    const nextModeBtn = document.createElement('button');
    nextModeBtn.type = 'button';
    nextModeBtn.className = 'wsc8-rotary-step';
    nextModeBtn.dataset.action = 'next-board-mode';
    nextModeBtn.setAttribute('aria-label', 'Next TV Board Game Format');
    nextModeBtn.textContent = '›';

    modeRow.append(prevModeBtn, modeDisplayBtn, nextModeBtn);

    const modePips = document.createElement('div');
    modePips.className = 'wsc8-pip-strip';
    modePips.setAttribute('aria-hidden', 'true');
    const modePipEls = modeEntries.map(() => {
      const pip = document.createElement('span');
      pip.className = 'wsc8-pip';
      modePips.appendChild(pip);
      return pip;
    });

    const modeDrawer = document.createElement('div');
    modeDrawer.className = 'wsc8-drawer-grid';
    modeDrawer.hidden = true;
    modeDrawer.setAttribute('role', 'radiogroup');
    modeDrawer.setAttribute('aria-label', `All ${modeEntries.length} TV Board Game Formats`);

    const modeOptBtns: HTMLButtonElement[] = [];
    const syncModeUi = (): void => {
      const idx = Math.max(
        0,
        modeEntries.findIndex((m) => m.id === selectedMode),
      );
      const activeEntry = modeEntries[idx] ?? modeEntries[0];
      modeCountPill.textContent = `${idx + 1} / ${modeEntries.length}`;
      modeDisplayBtn.dataset.boardMode = activeEntry.id;
      modeDisplayBtn.innerHTML = `
        ${buildCouchBoardMiniDiagramSvg(activeEntry.id)}
        <span class="wsc8-rotary-copy">
          <span class="wsc8-rotary-title">${activeEntry.title}</span>
          <span class="wsc8-rotary-sub">${activeEntry.subtitle}</span>
        </span>
      `;
      modePipEls.forEach((pip, i) => {
        pip.dataset.active = String(i === idx);
      });
      modeOptBtns.forEach((b) => {
        b.setAttribute('aria-checked', String(b.dataset.boardMode === selectedMode));
      });
    };

    modeEntries.forEach((entry) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wsc8-grid-opt-btn';
      btn.dataset.boardMode = entry.id;
      btn.setAttribute('role', 'radio');
      btn.textContent = entry.title;
      btn.addEventListener('click', () => {
        opts?.onTapSfx?.();
        selectedMode = entry.id;
        modeDrawer.hidden = true;
        modeDisplayBtn.setAttribute('aria-expanded', 'false');
        syncModeUi();
      });
      modeOptBtns.push(btn);
      modeDrawer.appendChild(btn);
    });

    prevModeBtn.addEventListener('click', () => {
      opts?.onTapSfx?.();
      const idx = Math.max(
        0,
        modeEntries.findIndex((m) => m.id === selectedMode),
      );
      const nextIdx = (idx - 1 + modeEntries.length) % modeEntries.length;
      selectedMode = modeEntries[nextIdx].id;
      syncModeUi();
    });

    nextModeBtn.addEventListener('click', () => {
      opts?.onTapSfx?.();
      const idx = Math.max(
        0,
        modeEntries.findIndex((m) => m.id === selectedMode),
      );
      const nextIdx = (idx + 1) % modeEntries.length;
      selectedMode = modeEntries[nextIdx].id;
      syncModeUi();
    });

    modeDisplayBtn.addEventListener('click', () => {
      opts?.onTapSfx?.();
      modeDrawer.hidden = !modeDrawer.hidden;
      modeDisplayBtn.setAttribute('aria-expanded', String(!modeDrawer.hidden));
    });

    syncModeUi();
    modeCard.append(modeHead, modeRow, modePips, modeDrawer);

    // Card B: 1966 Network Soundstage (Surprise Studio Mix + Stages 01–10 = 11)
    const stageEntries: ReadonlyArray<{
      readonly id: StageWorldIdV7 | 'SURPRISE_MIX';
      readonly title: string;
      readonly subtitle: string;
    }> = [
      {
        id: 'SURPRISE_MIX',
        title: 'SURPRISE STUDIO MIX',
        subtitle: 'Selects any of the 10 Living Color Network Soundstages at Showtime',
      },
      ...COUCH_STAGE_GUIDE_V8.map((st) => ({
        id: st.stageId,
        title: `${st.code} · ${st.title.toUpperCase()}`,
        subtitle: st.eraTag,
      })),
    ];

    const stageCard = document.createElement('div');
    stageCard.className = 'wsc8-rotary-card';

    const stageHead = document.createElement('div');
    stageHead.className = 'wsc8-rotary-head';
    const stageLbl = document.createElement('span');
    stageLbl.className = 'wsc8-section-label';
    stageLbl.textContent = '1966 NETWORK SOUNDSTAGE';
    const stageCountPill = document.createElement('span');
    stageCountPill.className = 'wsc8-page-pill';
    stageHead.append(stageLbl, stageCountPill);

    const stageRow = document.createElement('div');
    stageRow.className = 'wsc8-rotary-row';

    const prevStageBtn = document.createElement('button');
    prevStageBtn.type = 'button';
    prevStageBtn.className = 'wsc8-rotary-step';
    prevStageBtn.dataset.action = 'prev-stage';
    prevStageBtn.setAttribute('aria-label', 'Previous 1966 Network Soundstage');
    prevStageBtn.textContent = '‹';

    const stageDisplayBtn = document.createElement('button');
    stageDisplayBtn.type = 'button';
    stageDisplayBtn.className = 'wsc8-rotary-display';
    stageDisplayBtn.dataset.action = 'toggle-stage-drawer';
    stageDisplayBtn.setAttribute('aria-expanded', 'false');
    stageDisplayBtn.title = 'Tap to view all 11 Soundstage options at once';

    const nextStageBtn = document.createElement('button');
    nextStageBtn.type = 'button';
    nextStageBtn.className = 'wsc8-rotary-step';
    nextStageBtn.dataset.action = 'next-stage';
    nextStageBtn.setAttribute('aria-label', 'Next 1966 Network Soundstage');
    nextStageBtn.textContent = '›';

    stageRow.append(prevStageBtn, stageDisplayBtn, nextStageBtn);

    const stagePips = document.createElement('div');
    stagePips.className = 'wsc8-pip-strip';
    stagePips.setAttribute('aria-hidden', 'true');
    const stagePipEls = stageEntries.map(() => {
      const pip = document.createElement('span');
      pip.className = 'wsc8-pip';
      pip.dataset.tone = 'tangerine';
      stagePips.appendChild(pip);
      return pip;
    });

    const stageDrawer = document.createElement('div');
    stageDrawer.className = 'wsc8-drawer-grid';
    stageDrawer.hidden = true;
    stageDrawer.setAttribute('role', 'radiogroup');
    stageDrawer.setAttribute('aria-label', 'All 11 Network Soundstages');

    const stageOptBtns: HTMLButtonElement[] = [];
    const syncStageUi = (): void => {
      const idx = Math.max(
        0,
        stageEntries.findIndex((s) => s.id === selectedStage),
      );
      const activeEntry = stageEntries[idx] ?? stageEntries[0];
      stageCountPill.textContent = `${idx + 1} / ${stageEntries.length}`;
      stageDisplayBtn.dataset.stageId = activeEntry.id;
      stageDisplayBtn.innerHTML = `
        ${buildCouchStageMiniSwatchSvg(activeEntry.id)}
        <span class="wsc8-rotary-copy">
          <span class="wsc8-rotary-title">${activeEntry.title}</span>
          <span class="wsc8-rotary-sub">${activeEntry.subtitle}</span>
        </span>
      `;
      stagePipEls.forEach((pip, i) => {
        pip.dataset.active = String(i === idx);
      });
      stageOptBtns.forEach((b) => {
        b.setAttribute('aria-checked', String(b.dataset.stageId === selectedStage));
      });
    };

    stageEntries.forEach((entry) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wsc8-grid-opt-btn';
      btn.dataset.stageId = entry.id;
      btn.setAttribute('role', 'radio');
      btn.textContent = entry.title;
      btn.addEventListener('click', () => {
        opts?.onTapSfx?.();
        selectedStage = entry.id;
        stageDrawer.hidden = true;
        stageDisplayBtn.setAttribute('aria-expanded', 'false');
        syncStageUi();
      });
      stageOptBtns.push(btn);
      stageDrawer.appendChild(btn);
    });

    prevStageBtn.addEventListener('click', () => {
      opts?.onTapSfx?.();
      const idx = Math.max(
        0,
        stageEntries.findIndex((s) => s.id === selectedStage),
      );
      const nextIdx = (idx - 1 + stageEntries.length) % stageEntries.length;
      selectedStage = stageEntries[nextIdx].id;
      syncStageUi();
    });

    nextStageBtn.addEventListener('click', () => {
      opts?.onTapSfx?.();
      const idx = Math.max(
        0,
        stageEntries.findIndex((s) => s.id === selectedStage),
      );
      const nextIdx = (idx + 1) % stageEntries.length;
      selectedStage = stageEntries[nextIdx].id;
      syncStageUi();
    });

    stageDisplayBtn.addEventListener('click', () => {
      opts?.onTapSfx?.();
      stageDrawer.hidden = !stageDrawer.hidden;
      stageDisplayBtn.setAttribute('aria-expanded', String(!stageDrawer.hidden));
    });

    syncStageUi();
    stageCard.append(stageHead, stageRow, stagePips, stageDrawer);

    rotaryPair.append(modeCard, stageCard);

    // R3 Custom Broadcast Booth Panel (6 Vibe Packs + up to 3 Red Category Veto Stamps)
    const boothCard = document.createElement('div');
    boothCard.className = 'wsc8-booth-card';
    boothCard.dataset.role = 'couch-custom-broadcast-booth';

    const boothHead = document.createElement('div');
    boothHead.className = 'wsc8-booth-head';

    const boothTitle = document.createElement('span');
    boothTitle.className = 'wsc8-section-label';
    boothTitle.textContent = 'CUSTOM BROADCAST BOOTH · VIBE PACK & RED VETO STAMPS';

    const boothStatusPill = document.createElement('span');
    boothStatusPill.className = 'wsc8-page-pill';
    boothStatusPill.dataset.role = 'couch-booth-veto-count';

    boothHead.append(boothTitle, boothStatusPill);

    const vibeGrid = document.createElement('div');
    vibeGrid.className = 'wsc8-vibe-grid';
    vibeGrid.setAttribute('role', 'radiogroup');
    vibeGrid.setAttribute('aria-label', 'Broadcast Booth Vibe Pack Selector');

    const vetoHead = document.createElement('div');
    vetoHead.className = 'wsc8-booth-head';
    const vetoLbl = document.createElement('span');
    vetoLbl.className = 'wsc8-section-label';
    vetoLbl.textContent = 'STAMP UP TO 3 CATEGORY VETOES (MIN 3 ACTIVE REQUIRED)';
    vetoHead.appendChild(vetoLbl);

    const vetoGrid = document.createElement('div');
    vetoGrid.className = 'wsc8-veto-grid';
    vetoGrid.setAttribute('aria-label', 'Red Category Veto Stamps');

    const vibeBtns: HTMLButtonElement[] = [];

    const resolveActiveVibePack = () =>
      VIBE_PACK_CATALOG_V9.find((p) => p.packId === selectedVibePackId) ??
      VIBE_PACK_CATALOG_V9[0];

    const syncVetoGrid = (): void => {
      const pack = resolveActiveVibePack();
      const packCatSet = new Set<CategoryIdV7>(pack.categories);
      for (const existing of [...vetoedCategorySet]) {
        if (!packCatSet.has(existing)) {
          vetoedCategorySet.delete(existing);
        }
      }
      // Enforce >= 3 remaining categories strictly
      while (pack.categories.length - vetoedCategorySet.size < 3 && vetoedCategorySet.size > 0) {
        const first = vetoedCategorySet.values().next().value as CategoryIdV7 | undefined;
        if (!first) break;
        vetoedCategorySet.delete(first);
      }

      const remaining = pack.categories.length - vetoedCategorySet.size;
      boothStatusPill.textContent = `${vetoedCategorySet.size}/3 VETOED · ${remaining} ACTIVE`;
      vetoGrid.innerHTML = '';

      pack.categories.forEach((cat) => {
        const isVetoed = vetoedCategorySet.has(cat);
        const canAddVeto = vetoedCategorySet.size < 3 && remaining > 3;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wsc8-veto-chip';
        btn.dataset.categoryVeto = cat;
        btn.setAttribute('aria-pressed', String(isVetoed));
        btn.disabled = !isVetoed && !canAddVeto;
        btn.innerHTML = isVetoed
          ? `<span>${cat}</span><span class="wsc8-veto-stamp">VETOED</span>`
          : `<span>${cat}</span>`;
        btn.addEventListener('click', () => {
          opts?.onTapSfx?.();
          if (vetoedCategorySet.has(cat)) {
            vetoedCategorySet.delete(cat);
          } else if (
            vetoedCategorySet.size < 3 &&
            pack.categories.length - vetoedCategorySet.size > 3
          ) {
            vetoedCategorySet.add(cat);
          }
          syncVetoGrid();
        });
        vetoGrid.appendChild(btn);
      });
    };

    VIBE_PACK_CATALOG_V9.forEach((pack) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wsc8-vibe-btn';
      btn.dataset.vibePackId = pack.packId;
      btn.style.setProperty('--vibe-accent', pack.accentHex);
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(pack.packId === selectedVibePackId));
      btn.innerHTML = `<span class="wsc8-vibe-title">${pack.title}</span><span class="wsc8-vibe-sub">${pack.tagline}</span>`;
      btn.addEventListener('click', () => {
        opts?.onTapSfx?.();
        selectedVibePackId = pack.packId;
        vibeBtns.forEach((b) =>
          b.setAttribute('aria-checked', String(b.dataset.vibePackId === pack.packId)),
        );
        syncVetoGrid();
      });
      vibeBtns.push(btn);
      vibeGrid.appendChild(btn);
    });

    syncVetoGrid();
    boothCard.append(boothHead, vibeGrid, vetoHead, vetoGrid);

    body.append(podiumSplit, lengthSection, rotaryPair, boothCard);

    // Pinned Bottom Launch Dock (Full-Width Atomic Tangerine 3D Paddle — Zero Duplicate Back Button!)
    const footer = document.createElement('footer');
    footer.className = 'wsc8-sheet-footer';

    const launchBtn = document.createElement('button');
    launchBtn.type = 'button';
    launchBtn.className = 'wsc8-launch-paddle';
    launchBtn.dataset.action = 'couch-step-up';
    launchBtn.innerHTML = `
      <span class="wsc8-launch-lead">
        <span class="wsc8-pilot-bulb" aria-hidden="true"></span>
        <span>ROLL CAMERA · STEP UP TO THE PODIUMS!</span>
      </span>
      <span class="wsc8-launch-arrow" aria-hidden="true">→</span>
    `;
    launchBtn.addEventListener('click', () => {
      opts?.onLaunchSfx?.();
      opts?.onTapSfx?.();
      opts?.onVoiceCue?.('VO_COUCH_2P_OPEN');

      const resolvedStage: StageWorldIdV7 =
        selectedStage === 'SURPRISE_MIX'
          ? ALL_COUCH_STAGE_IDS_V8[
              Math.floor(Math.random() * ALL_COUCH_STAGE_IDS_V8.length)
            ]
          : selectedStage;

      const resolvedMode: BoardPlayModeV9 =
        selectedMode === 'SURPRISE_MIX'
          ? ALL_BOARD_PLAY_MODES_V9[
              Math.floor(Math.random() * ALL_BOARD_PLAY_MODES_V9.length)
            ]
          : selectedMode;

      const cleanP1 = sanitizeContestantName(p1Name, 'CONTESTANT 1');
      const cleanP2 = sanitizeContestantName(p2Name, 'CONTESTANT 2');

      preloadCouchPortraitsV8([p1Avatar, p2Avatar]);

      closeAndResolve({
        podium1: {
          podiumIndex: 0,
          name: cleanP1,
          avatarId: p1Avatar,
          accentHex: PODIUM_1_PEACOCK_HEX_V8,
        },
        podium2: {
          podiumIndex: 1,
          name: cleanP2,
          avatarId: p2Avatar,
          accentHex: PODIUM_2_TANGERINE_HEX_V8,
        },
        totalTurns,
        stageId: resolvedStage,
        boardPlayMode: resolvedMode,
        skillDials: [p1SkillDial, p2SkillDial],
        boothConfig: {
          vibePackId: selectedVibePackId,
          vetoedCategories: [...vetoedCategorySet],
        },
      });
    });

    footer.appendChild(launchBtn);
    sheet.append(marquee, header, body, footer);
    backdrop.appendChild(sheet);
    container.appendChild(backdrop);
  });
}

// ----------------------------------------------------------------------------
// 7. Deliverable 2 — Live 2-Player Turn & Hot-Gremlin Pass Interstitials
//    (`CouchPartyMatchDirectorV8`)
// ----------------------------------------------------------------------------

export class CouchPartyMatchDirectorV8 {
  public readonly spec: CouchShowdownLaunchSpecV9;
  public readonly skillDials: [CouchSkillDialV9, CouchSkillDialV9];
  public readonly boothConfig?: BroadcastBoothConfigV9;
  public activePodium: 0 | 1 = 0;
  public turnNumber: number = 1;

  public cash: [number, number] = [0, 0];
  public streaks: [number, number] = [0, 0];
  public bestStreaks: [number, number] = [0, 0];
  public correctClues: [number, number] = [0, 0];
  public turnsTaken: [number, number] = [0, 0];
  public gremlins: [number, number] = [0, 0];

  public fiftyFiftyUsed: [boolean, boolean] = [false, false];
  public audiencePollUsed: [boolean, boolean] = [false, false];
  public nextTile2x: [boolean, boolean] = [false, false];
  public finalWagerShield: [boolean, boolean] = [false, false];
  public mysteryVaultBonus: [number, number] = [0, 0];

  public hotMicAvailable: [boolean, boolean] = [true, true];
  public hotMicArmed: boolean = false;
  private hotMicSaboteur: 0 | 1 | null = null;

  constructor(spec: CouchShowdownLaunchSpecV8 | CouchShowdownLaunchSpecV9) {
    this.spec = spec;
    const specV9 = spec as CouchShowdownLaunchSpecV9;
    this.skillDials = [
      specV9.skillDials?.[0] ?? 'MIXED',
      specV9.skillDials?.[1] ?? 'MIXED',
    ];
    this.boothConfig = specV9.boothConfig;
    preloadCouchPortraitsV8([spec.podium1.avatarId, spec.podium2.avatarId]);
  }

  public getSkillDial(idx: 0 | 1 = this.activePodium): CouchSkillDialV9 {
    return this.skillDials[idx] ?? 'MIXED';
  }

  public getActiveSkillDial(): CouchSkillDialV9 {
    return this.getSkillDial(this.activePodium);
  }

  public canArmHotMic(idx: 0 | 1 = this.activePodium): boolean {
    return Boolean(this.hotMicAvailable[idx]) && !this.hotMicArmed;
  }

  public armHotMic(idx: 0 | 1 = this.activePodium): boolean {
    if (!this.hotMicAvailable[idx]) return false;
    this.hotMicArmed = true;
    this.hotMicSaboteur = idx;
    return true;
  }

  public disarmHotMic(): void {
    this.hotMicArmed = false;
    this.hotMicSaboteur = null;
  }

  public consumeHotMicForTurn(): {
    readonly saboteur: 0 | 1;
    readonly receiver: 0 | 1;
    readonly receiverSkillDial: CouchSkillDialV9;
  } {
    const saboteur: 0 | 1 = this.hotMicSaboteur ?? this.activePodium;
    const receiver: 0 | 1 = this.getOpponentIndex(saboteur);
    this.hotMicAvailable[saboteur] = false;
    this.hotMicArmed = false;
    this.hotMicSaboteur = null;
    return {
      saboteur,
      receiver,
      receiverSkillDial: this.getSkillDial(receiver),
    };
  }

  public resolveHotMicOutcome(
    saboteur: 0 | 1,
    receiver: 0 | 1,
    tileValue: number,
    receiverCorrect: boolean,
  ): {
    readonly receiverCorrect: boolean;
    readonly saboteurDelta: number;
    readonly receiverDelta: number;
    readonly saboteurCash: number;
    readonly receiverCash: number;
  } {
    const cleanVal = Math.max(
      0,
      Math.round(Number.isFinite(tileValue) ? tileValue : 0),
    );
    this.turnsTaken[saboteur] += 1;
    if (receiverCorrect) {
      const beforeSab = this.cash[saboteur];
      const afterSab = this.addCash(saboteur, -250);
      const receiverGain = cleanVal + 250;
      const afterRec = this.addCash(receiver, receiverGain);
      this.correctClues[receiver] += 1;
      this.streaks[receiver] += 1;
      if (this.streaks[receiver] > this.bestStreaks[receiver]) {
        this.bestStreaks[receiver] = this.streaks[receiver];
      }
      return {
        receiverCorrect: true,
        saboteurDelta: afterSab - beforeSab,
        receiverDelta: receiverGain,
        saboteurCash: afterSab,
        receiverCash: afterRec,
      };
    }

    const payoff = 150;
    const afterSab = this.addCash(saboteur, payoff);
    this.streaks[receiver] = 0;
    return {
      receiverCorrect: false,
      saboteurDelta: payoff,
      receiverDelta: 0,
      saboteurCash: afterSab,
      receiverCash: this.cash[receiver],
    };
  }

  public getPlayer(idx: 0 | 1 = this.activePodium): CouchPlayerConfigV8 {
    return idx === 0 ? this.spec.podium1 : this.spec.podium2;
  }

  public getActivePlayer(): CouchPlayerConfigV8 {
    return this.getPlayer(this.activePodium);
  }

  public getOpponentIndex(idx: 0 | 1 = this.activePodium): 0 | 1 {
    return idx === 0 ? 1 : 0;
  }

  public getOpponentPlayer(): CouchPlayerConfigV8 {
    return this.getPlayer(this.getOpponentIndex());
  }

  public getCash(idx: 0 | 1 = this.activePodium): number {
    return this.cash[idx];
  }

  public setCash(idx: 0 | 1, amount: number): number {
    const clean = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
    this.cash[idx] = clean;
    return clean;
  }

  public addCash(idx: 0 | 1, delta: number): number {
    const cleanDelta = Number.isFinite(delta) ? Math.round(delta) : 0;
    return this.setCash(idx, this.cash[idx] + cleanDelta);
  }

  public getStreak(idx: 0 | 1 = this.activePodium): number {
    return this.streaks[idx];
  }

  public getGremlins(idx: 0 | 1 = this.activePodium): number {
    return this.gremlins[idx];
  }

  public canUseFiftyFifty(idx: 0 | 1 = this.activePodium): boolean {
    return !this.fiftyFiftyUsed[idx];
  }

  public consumeFiftyFifty(idx: 0 | 1 = this.activePodium): boolean {
    if (this.fiftyFiftyUsed[idx]) return false;
    this.fiftyFiftyUsed[idx] = true;
    return true;
  }

  public canUseAudiencePoll(idx: 0 | 1 = this.activePodium): boolean {
    return !this.audiencePollUsed[idx];
  }

  public consumeAudiencePoll(idx: 0 | 1 = this.activePodium): boolean {
    if (this.audiencePollUsed[idx]) return false;
    this.audiencePollUsed[idx] = true;
    return true;
  }

  public hasNextTile2x(idx: 0 | 1 = this.activePodium): boolean {
    return this.nextTile2x[idx];
  }

  public armNextTile2x(idx: 0 | 1 = this.activePodium): void {
    this.nextTile2x[idx] = true;
  }

  public consumeNextTile2xMultiplier(idx: 0 | 1 = this.activePodium): number {
    if (!this.nextTile2x[idx]) return 1;
    this.nextTile2x[idx] = false;
    return 2;
  }

  public hasFinalWagerShield(idx: 0 | 1 = this.activePodium): boolean {
    return this.finalWagerShield[idx];
  }

  public grantFinalWagerShield(idx: 0 | 1 = this.activePodium): void {
    this.finalWagerShield[idx] = true;
  }

  public consumeFinalWagerShield(idx: 0 | 1 = this.activePodium): boolean {
    if (!this.finalWagerShield[idx]) return false;
    this.finalWagerShield[idx] = false;
    return true;
  }

  public addMysteryVaultBonus(idx: 0 | 1, bonusCash: number): void {
    const clean = Number.isFinite(bonusCash) ? Math.max(0, Math.round(bonusCash)) : 0;
    this.mysteryVaultBonus[idx] += clean;
  }

  public recordTurnOutcome(opts: {
    readonly podium?: 0 | 1;
    readonly correct: boolean;
    readonly cashDelta: number;
  }): { readonly cash: number; readonly streak: number } {
    const idx = opts.podium ?? this.activePodium;
    const cash = this.addCash(idx, opts.cashDelta);
    this.turnsTaken[idx] += 1;
    if (opts.correct) {
      this.correctClues[idx] += 1;
      this.streaks[idx] += 1;
      if (this.streaks[idx] > this.bestStreaks[idx]) {
        this.bestStreaks[idx] = this.streaks[idx];
      }
    } else {
      this.streaks[idx] = 0;
    }
    return { cash, streak: this.streaks[idx] };
  }

  public recordGremlinHit(
    idx: 0 | 1 = this.activePodium,
    cashLost = 0,
  ): { readonly cash: number; readonly gremlins: number } {
    if (cashLost > 0) {
      this.addCash(idx, -Math.abs(cashLost));
    }
    this.gremlins[idx] += 1;
    return { cash: this.cash[idx], gremlins: this.gremlins[idx] };
  }

  public switchActivePodium(): 0 | 1 {
    this.activePodium = this.activePodium === 0 ? 1 : 0;
    return this.activePodium;
  }

  public advanceTurnStep(): {
    readonly activePodium: 0 | 1;
    readonly turnNumber: number;
    readonly isFinalShowdownReady: boolean;
  } {
    if (this.activePodium === 0) {
      this.activePodium = 1;
      return {
        activePodium: 1,
        turnNumber: this.turnNumber,
        isFinalShowdownReady: false,
      };
    }
    this.activePodium = 0;
    const completedAll = this.turnNumber >= this.spec.totalTurns;
    if (!completedAll) {
      this.turnNumber += 1;
    }
    return {
      activePodium: 0,
      turnNumber: this.turnNumber,
      isFinalShowdownReady: completedAll,
    };
  }

  /**
   * Sleek, fast (`950ms` auto-advance or 1-tap instant!) Sunlit 1966 Spotlight
   * Banner announcing Podium turn handoff with painted gouache portrait!
   */
  public playTurnHandoffBanner(
    container: HTMLElement,
    turnNum: number = this.turnNumber,
    totalTurns: number = this.spec.totalTurns,
    opts?: CouchTurnHandoffOptionsV8,
  ): Promise<void> {
    ensureCouchPartyDeluxeStylesV8();
    const idx = this.activePodium;
    const player = this.getPlayer(idx);

    return new Promise<void>((resolve) => {
      let finished = false;
      let timerId: number | null = null;

      opts?.onSwooshSfx?.();

      const backdrop = document.createElement('div');
      backdrop.className = 'wsc8-backdrop';
      backdrop.dataset.variant = 'handoff';
      backdrop.dataset.modal = 'couch-turn-handoff-v8';
      if (opts?.reducedMotion) {
        backdrop.dataset.reducedMotion = 'true';
      }

      const dismiss = (): void => {
        if (finished) return;
        finished = true;
        if (timerId !== null) window.clearTimeout(timerId);
        backdrop.remove();
        resolve();
      };

      const accent = idx === 0 ? PODIUM_1_PEACOCK_HEX_V8 : PODIUM_2_TANGERINE_HEX_V8;

      const card = document.createElement('div');
      card.className = 'wsc8-spotlight-card';

      const marquee = document.createElement('div');
      marquee.className = 'wsc8-marquee-bar';

      const ribbon = document.createElement('header');
      ribbon.className = 'wsc8-sheet-header';
      if (idx === 1) {
        ribbon.dataset.tone = 'tangerine';
      }
      ribbon.innerHTML = `
        <div class="wsc8-header-copy" style="text-align:center;">
          <div class="wsc8-kicker">TURN ${turnNum} OF ${totalTurns} · STUDIO 6A SPOTLIGHT</div>
          <h2 class="wsc8-title">PODIUM ${idx + 1}: ${player.name}'S BOARD PICK!</h2>
        </div>
      `;

      const center = document.createElement('div');
      center.className = 'wsc8-card-body-center';

      const beam = document.createElement('div');
      beam.className = 'wsc8-spotlight-beam';
      beam.setAttribute('aria-hidden', 'true');

      const medallion = document.createElement('div');
      medallion.className = 'wsc8-gouache-medallion';
      medallion.style.width = '78px';
      medallion.style.height = '78px';
      medallion.style.borderColor = accent;
      applyCouchCastPortraitV8(medallion, player.avatarId, 'POISED');

      const scoreRibbon = document.createElement('div');
      scoreRibbon.className = 'wsc8-score-ribbon';
      const activePerks: string[] = [];
      if (this.nextTile2x[idx]) activePerks.push('2.0× ARMED');
      if (this.finalWagerShield[idx]) activePerks.push('WAGER SHIELD');
      const perkSuffix = activePerks.length > 0 ? `  ·  ${activePerks.join(' · ')}` : '';
      scoreRibbon.textContent = `${this.spec.podium1.name}: ${formatStudioCash(this.cash[0])}  ·  ${this.spec.podium2.name}: ${formatStudioCash(this.cash[1])}${perkSuffix}`;

      center.append(beam, medallion, scoreRibbon);

      if (opts?.subtitle) {
        const sub = document.createElement('div');
        sub.style.fontSize = '14.5px';
        sub.style.fontWeight = '700';
        sub.style.color = '#4A3828';
        sub.textContent = opts.subtitle;
        center.appendChild(sub);
      }

      const tapBtn = document.createElement('button');
      tapBtn.type = 'button';
      tapBtn.className = idx === 0 ? 'wsc8-btn wsc8-btn-teal' : 'wsc8-launch-paddle';
      if (idx === 0) {
        tapBtn.style.minWidth = '240px';
        tapBtn.innerHTML = `${buildCouchIconSvg('MIC')}<span>TAP TO PICK NOW →</span>`;
      } else {
        tapBtn.style.maxWidth = '320px';
        tapBtn.innerHTML = `<span class="wsc8-launch-lead"><span class="wsc8-pilot-bulb" aria-hidden="true"></span><span>TAP TO PICK NOW</span></span><span class="wsc8-launch-arrow" aria-hidden="true">→</span>`;
      }
      tapBtn.dataset.action = 'handoff-instant-go';
      tapBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        opts?.onTapSfx?.();
        dismiss();
      });

      backdrop.addEventListener('click', () => {
        opts?.onTapSfx?.();
        dismiss();
      });

      center.appendChild(tapBtn);
      card.append(marquee, ribbon, center);
      backdrop.appendChild(card);
      container.appendChild(backdrop);

      const autoMs = opts?.requireTap ? 0 : (opts?.autoAdvanceMs ?? 950);
      if (autoMs > 0) {
        timerId = window.setTimeout(dismiss, autoMs);
      }
    });
  }

  public playPassGremlinSpinsCurtain(
    container: HTMLElement,
    fromPlayerInput: CouchPlayerConfigV8 | 0 | 1,
    toPlayerInput: CouchPlayerConfigV8 | 0 | 1,
    spinsPassed: number,
    opts?: CouchPassGremlinCurtainOptionsV8,
  ): Promise<void> {
    const fromPlayer =
      typeof fromPlayerInput === 'number' ? this.getPlayer(fromPlayerInput) : fromPlayerInput;
    const toPlayer =
      typeof toPlayerInput === 'number' ? this.getPlayer(toPlayerInput) : toPlayerInput;

    return playCouchPassGremlinSpinsCurtainV8(
      container,
      fromPlayer,
      toPlayer,
      spinsPassed,
      opts,
    );
  }

  public applyFinalShowdownOutcome(
    wagerResult: CouchSecretFinalWagerResultV8,
    answerIdx: 0 | 1 | 2 | 3,
    opts?: {
      readonly p1TimedOut?: boolean;
      readonly p2TimedOut?: boolean;
      readonly tieBreakBySpeed?: boolean;
    },
  ): CouchFinalShowdownEvaluationV8 {
    if (this.mysteryVaultBonus[0] > 0) {
      this.addCash(0, this.mysteryVaultBonus[0]);
      this.mysteryVaultBonus[0] = 0;
    }
    if (this.mysteryVaultBonus[1] > 0) {
      this.addCash(1, this.mysteryVaultBonus[1]);
      this.mysteryVaultBonus[1] = 0;
    }

    const p1HadShield = this.finalWagerShield[0];
    const p2HadShield = this.finalWagerShield[1];

    const evaluation = evaluateCouchFinalShowdownV8({
      spec: this.spec,
      p1Cash: this.cash[0],
      p2Cash: this.cash[1],
      p1FinalWagerShield: p1HadShield,
      p2FinalWagerShield: p2HadShield,
      wagerResult,
      p1TimedOut: opts?.p1TimedOut,
      p2TimedOut: opts?.p2TimedOut,
      answerIdx,
      tieBreakBySpeed: opts?.tieBreakBySpeed,
    });

    if (evaluation.p1ShieldApplied) this.consumeFinalWagerShield(0);
    if (evaluation.p2ShieldApplied) this.consumeFinalWagerShield(1);
    this.setCash(0, evaluation.finalP1Cash);
    this.setCash(1, evaluation.finalP2Cash);
    return evaluation;
  }

  public buildSwappedRematchSpec(): CouchShowdownLaunchSpecV9 {
    return swapCouchPodiumFirstPickV8(this.spec);
  }
}

/**
 * R3 `PASS THE HOT MIC! (Screw)` Full-Screen Sunlit Privacy Handoff Card.
 * Resolves ONLY when the receiving player taps Ready so the 10.0s clock never starts early.
 */
export function playHotMicPrivacyHandoffCard(
  root: HTMLElement,
  opts: {
    readonly saboteurName: string;
    readonly receiverName: string;
    readonly receiverIndex: 0 | 1;
    readonly tileValue: number;
    readonly categoryLabel: string;
    readonly reducedMotion?: boolean;
    readonly onTapSfx?: () => void;
  },
): Promise<void> {
  ensureCouchPartyDeluxeStylesV8();
  const safeReceiver = opts.receiverName.trim().toUpperCase() || `PLAYER ${opts.receiverIndex + 1}`;
  const safeSaboteur = opts.saboteurName.trim().toUpperCase() || 'OPPONENT';
  const cleanVal = Math.max(0, Math.round(Number.isFinite(opts.tileValue) ? opts.tileValue : 0));
  const cleanCat = opts.categoryLabel.trim().toUpperCase() || 'MYSTERY TOPIC';

  return new Promise<void>((resolve) => {
    let settled = false;

    const backdrop = document.createElement('div');
    backdrop.className = 'ws9-modal-backdrop';
    backdrop.dataset.modal = 'hot-mic-privacy-handoff-v9';
    if (opts.reducedMotion) {
      backdrop.dataset.reducedMotion = 'true';
    }
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute(
      'aria-label',
      `Hot Mic Ambush — Pass phone to ${safeReceiver}`,
    );

    const card = document.createElement('section');
    card.className = 'ws9-hotmic-handoff';

    const marquee = document.createElement('div');
    marquee.className = 'wsc8-marquee-bar';
    marquee.setAttribute('aria-hidden', 'true');

    const header = document.createElement('header');
    header.className = 'wsc8-sheet-header';
    header.dataset.tone = opts.receiverIndex === 1 ? 'tangerine' : 'velvet';
    header.innerHTML = `
      <div class="wsc8-header-copy" style="text-align:center;">
        <div class="wsc8-kicker">${safeSaboteur} TOSSED THE HOT MIC · ${cleanCat} ($${cleanVal})</div>
        <h2 class="wsc8-title">PASS THE HOT MIC!</h2>
      </div>
    `;

    const hero = document.createElement('div');
    hero.className = 'wsc8-hotmic-hero';

    const alertBadge = document.createElement('span');
    alertBadge.className = 'wsc8-hotmic-alert-badge';
    alertBadge.textContent = `PODIUM ${opts.receiverIndex + 1} · 10.0s SPOTLIGHT CLOCK`;

    const headline = document.createElement('h3');
    headline.className = 'wsc8-hotmic-headline';
    headline.textContent = `🔥 HOT MIC AMBUSH! PASS PHONE TO ${safeReceiver} — 10s FOR +$250!`;

    const stakes = document.createElement('div');
    stakes.className = 'wsc8-hotmic-stakes';
    stakes.innerHTML =
      `<div><strong>IF ${safeReceiver} NAILS IT (&le;10s):</strong> Wins $${cleanVal} tile <strong>+ loots +$250</strong> from ${safeSaboteur}!</div>` +
      `<div style="margin-top:4px;"><strong>IF ${safeReceiver} MISSES / TIMES OUT:</strong> ${safeSaboteur} banks <strong>+$150 Hot Mic Payoff</strong>!</div>`;

    const readyBtn = document.createElement('button');
    readyBtn.type = 'button';
    readyBtn.className = 'wsc8-hotmic-ready-btn';
    readyBtn.dataset.action = 'hotmic-handoff-ready';
    readyBtn.textContent = "🎙️ I'M HOLDING THE PHONE — SHOW CLUE";
    readyBtn.addEventListener('click', () => {
      if (settled) return;
      settled = true;
      opts.onTapSfx?.();
      backdrop.remove();
      resolve();
    });

    hero.append(alertBadge, headline, stakes, readyBtn);
    card.append(marquee, header, hero);
    backdrop.appendChild(card);
    root.appendChild(backdrop);

    queueMicrotask(() => {
      if (!settled) {
        readyBtn.focus({ preventScroll: true });
      }
    });
  });
}

/** Standalone helper for the 1966 Crimson Velvet & Cream Hot-Gremlin Pass Challenge. */
export function playCouchPassGremlinSpinsCurtainV8(
  container: HTMLElement,
  fromPlayer: CouchPlayerConfigV8,
  toPlayer: CouchPlayerConfigV8,
  spinsPassed: number,
  opts?: CouchPassGremlinCurtainOptionsV8,
): Promise<void> {
  ensureCouchPartyDeluxeStylesV8();
  const safeSpins = Math.max(1, Math.round(spinsPassed));
  const spinWord = safeSpins === 1 ? 'SPIN' : 'SPINS';

  return new Promise<void>((resolve) => {
    let settled = false;
    opts?.onCurtainSfx?.();
    opts?.onVoiceCue?.('VO_TWIST_LIGHT_BOARD_PASS');

    const backdrop = document.createElement('div');
    backdrop.className = 'wsc8-backdrop';
    backdrop.dataset.variant = 'velvet-gremlin';
    backdrop.dataset.modal = 'couch-pass-gremlin-curtain-v8';
    if (opts?.reducedMotion) {
      backdrop.dataset.reducedMotion = 'true';
    }
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');

    const card = document.createElement('div');
    card.className = 'wsc8-velvet-curtain-card';

    const marquee = document.createElement('div');
    marquee.className = 'wsc8-marquee-bar';

    const header = document.createElement('header');
    header.className = 'wsc8-sheet-header';
    header.dataset.tone = 'velvet';
    header.innerHTML = `
      <div class="wsc8-header-copy" style="text-align:center;">
        <div class="wsc8-kicker">STUDIO 6A LIGHT-BOARD SABOTAGE · HOT POTATO HANDOFF</div>
        <h2 class="wsc8-title">${fromPlayer.name} PASSES ${safeSpins} HOT GREMLIN ${spinWord} TO ${toPlayer.name}!</h2>
      </div>
    `;

    const center = document.createElement('div');
    center.className = 'wsc8-card-body-center';

    const duelRow = document.createElement('div');
    duelRow.className = 'wsc8-duel-portraits';

    const fromAvatar = document.createElement('div');
    fromAvatar.className = 'wsc8-gouache-medallion';
    fromAvatar.style.width = '72px';
    fromAvatar.style.height = '72px';
    fromAvatar.style.borderColor = fromPlayer.accentHex || PODIUM_1_PEACOCK_HEX_V8;
    applyCouchCastPortraitV8(fromAvatar, fromPlayer.avatarId, 'TELL');

    const arrowBadge = document.createElement('div');
    arrowBadge.className = 'wsc8-pass-arrow';
    arrowBadge.innerHTML = `${buildCouchIconSvg('FLAME')}<span>${safeSpins} HOT ${spinWord} →</span>`;

    const toAvatar = document.createElement('div');
    toAvatar.className = 'wsc8-gouache-medallion';
    toAvatar.style.width = '72px';
    toAvatar.style.height = '72px';
    toAvatar.style.borderColor = toPlayer.accentHex || PODIUM_2_TANGERINE_HEX_V8;
    applyCouchCastPortraitV8(toAvatar, toPlayer.avatarId, 'RATTLED');

    duelRow.append(fromAvatar, arrowBadge, toAvatar);

    const detail = document.createElement('div');
    detail.style.fontSize = '15.5px';
    detail.style.fontWeight = '800';
    detail.style.color = '#141B29';
    detail.textContent =
      typeof opts?.bankrollAtRisk === 'number'
        ? `Pass the screen to ${toPlayer.name}! ${formatStudioCash(opts.bankrollAtRisk)} is on the line against 4/12 Studio Gremlins!`
        : `Pass the screen to ${toPlayer.name}! Every passed spin must be survived live on the Light-Board!`;

    const surviveBtn = document.createElement('button');
    surviveBtn.type = 'button';
    surviveBtn.className = 'wsc8-launch-paddle';
    surviveBtn.dataset.action = 'accept-passed-gremlin-spins';
    surviveBtn.innerHTML = `
      <span class="wsc8-launch-lead">
        <span class="wsc8-pilot-bulb" aria-hidden="true"></span>
        <span>${toPlayer.name}: TAP TO SURVIVE THE BOARD!</span>
      </span>
      <span class="wsc8-launch-arrow" aria-hidden="true">→</span>
    `;
    surviveBtn.addEventListener('click', () => {
      if (settled) return;
      settled = true;
      opts?.onTapSfx?.();
      backdrop.remove();
      resolve();
    });

    center.append(duelRow, detail, surviveBtn);
    card.append(marquee, header, center);
    backdrop.appendChild(card);
    container.appendChild(backdrop);
  });
}

// ----------------------------------------------------------------------------
// 8. Deliverable 3 — Secret "No-Peeking" Blind Dual Final Broadcast Wager
//    & Climax Showdown (`runCouchBlindFinalShowdownV8`)
// ----------------------------------------------------------------------------

export function runCouchBlindFinalShowdownV8(
  container: HTMLElement,
  opts: CouchBlindFinalShowdownOptionsV8,
): Promise<CouchBlindFinalShowdownResultV8> {
  ensureCouchPartyDeluxeStylesV8();
  const { spec } = opts;
  const p1 = spec.podium1;
  const p2 = spec.podium2;
  const p1Cash = Math.max(0, Math.round(opts.p1Cash));
  const p2Cash = Math.max(0, Math.round(opts.p2Cash));
  const p1Shield = Boolean(opts.p1FinalWagerShield);
  const p2Shield = Boolean(opts.p2FinalWagerShield);
  const clue = normalizeClueInput(opts.clue);
  const clueSeconds = Math.max(5, Math.round(opts.clueTimerSec ?? 30));

  preloadCouchPortraitsV8([p1.avatarId, p2.avatarId, 'GRANT_BELLAMY']);

  const backdrop = document.createElement('div');
  backdrop.className = 'wsc8-backdrop';
  backdrop.dataset.modal = 'couch-blind-final-showdown-v8';
  if (opts.reducedMotion) {
    backdrop.dataset.reducedMotion = 'true';
  }
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Act III Secret Dual Final Broadcast Showdown');
  container.appendChild(backdrop);

  const mountCard = (el: HTMLElement): void => {
    backdrop.innerHTML = '';
    backdrop.appendChild(el);
  };

  const waitMs = (ms: number): Promise<void> =>
    new Promise((resolve) => {
      if (ms <= 0) {
        resolve();
        return;
      }
      window.setTimeout(resolve, ms);
    });

  // Sunlit Privacy Curtain Screen
  const showPrivacyCurtain = (cfg: {
    readonly activePlayer: CouchPlayerConfigV8;
    readonly headline: string;
    readonly instruction: string;
    readonly ctaLabel: string;
    readonly showCategoryBanner: boolean;
    readonly p1WagerLockedBadge: boolean;
    readonly p2WagerLockedBadge: boolean;
  }): Promise<void> =>
    new Promise((resolve) => {
      const sheet = document.createElement('section');
      sheet.className = 'wsc8-sheet';
      sheet.dataset.width = 'medium';

      const marquee = document.createElement('div');
      marquee.className = 'wsc8-marquee-bar';

      const header = document.createElement('header');
      header.className = 'wsc8-sheet-header';
      header.dataset.tone = 'velvet';
      header.innerHTML = `
        <div class="wsc8-header-copy" style="text-align:center;">
          <div class="wsc8-kicker">ACT III SECRET STUDIO CURTAIN · ${getFriendlyCategoryLabelV7(clue.category as CategoryIdV7)}</div>
          <h2 class="wsc8-title">${cfg.headline}</h2>
        </div>
      `;

      const body = document.createElement('div');
      body.className = 'wsc8-sheet-body';
      body.style.alignItems = 'center';
      body.style.textAlign = 'center';

      const medallion = document.createElement('div');
      medallion.className = 'wsc8-gouache-medallion';
      medallion.style.width = '76px';
      medallion.style.height = '76px';
      medallion.style.borderColor = cfg.activePlayer.accentHex || PODIUM_1_PEACOCK_HEX_V8;
      applyCouchCastPortraitV8(medallion, cfg.activePlayer.avatarId, 'POISED');

      body.appendChild(medallion);

      if (cfg.showCategoryBanner) {
        const catPlaque = document.createElement('div');
        catPlaque.className = 'wsc8-category-plaque';
        catPlaque.innerHTML = `
          <div class="wsc8-kicker">ACT III FINAL BROADCAST CATEGORY</div>
          <div class="wsc8-category-name">${getFriendlyCategoryLabelV7(clue.category as CategoryIdV7)}</div>
        `;
        body.appendChild(catPlaque);
      }

      const scoreRibbon = document.createElement('div');
      scoreRibbon.className = 'wsc8-score-ribbon';
      const p1LockTxt = cfg.p1WagerLockedBadge ? ' (LOCKED)' : '';
      const p2LockTxt = cfg.p2WagerLockedBadge ? ' (LOCKED)' : '';
      scoreRibbon.textContent = `${p1.name}: ${formatStudioCash(p1Cash)}${p1LockTxt}  ·  ${p2.name}: ${formatStudioCash(p2Cash)}${p2LockTxt}`;

      const warning = document.createElement('div');
      warning.className = 'wsc8-privacy-warning';
      warning.innerHTML = `${buildCouchIconSvg('EYE_SHUTTER')}<span>${cfg.instruction}</span>`;

      const goBtn = document.createElement('button');
      goBtn.type = 'button';
      goBtn.className = 'wsc8-launch-paddle';
      goBtn.dataset.action = 'privacy-curtain-continue';
      goBtn.innerHTML = `
        <span class="wsc8-launch-lead">
          <span class="wsc8-pilot-bulb" aria-hidden="true"></span>
          <span>${cfg.ctaLabel}</span>
        </span>
        <span class="wsc8-launch-arrow" aria-hidden="true">→</span>
      `;
      goBtn.addEventListener('click', () => {
        opts.onTapSfx?.();
        resolve();
      });

      body.append(scoreRibbon, warning, goBtn);
      sheet.append(marquee, header, body);
      mountCard(sheet);
    });

  // Secret Wager Console ($0 .. Math.max(cash, 500))
  const collectSecretWager = (
    player: CouchPlayerConfigV8,
    playerCash: number,
    hasShield: boolean,
  ): Promise<number> =>
    new Promise((resolve) => {
      const maxWager = Math.max(playerCash, 500);
      let currentWager = snapWagerStep(maxWager * 0.5, maxWager);
      let sealed = false;

      const sheet = document.createElement('section');
      sheet.className = 'wsc8-sheet';
      sheet.dataset.width = 'medium';

      const marquee = document.createElement('div');
      marquee.className = 'wsc8-marquee-bar';

      const header = document.createElement('header');
      header.className = 'wsc8-sheet-header';
      if (player.podiumIndex === 1) {
        header.dataset.tone = 'tangerine';
      }
      header.innerHTML = `
        <div class="wsc8-header-copy">
          <div class="wsc8-kicker">PODIUM ${player.podiumIndex + 1} SECRET WAGER · CATEGORY: ${getFriendlyCategoryLabelV7(clue.category as CategoryIdV7)}</div>
          <h2 class="wsc8-title">${player.name}'s Blind Final Wager</h2>
        </div>
      `;

      const body = document.createElement('div');
      body.className = 'wsc8-sheet-body';
      body.style.alignItems = 'center';
      body.style.textAlign = 'center';

      const purseInfo = document.createElement('div');
      purseInfo.className = 'wsc8-score-ribbon';
      purseInfo.textContent =
        playerCash < 500
          ? `LIVE PURSE: ${formatStudioCash(playerCash)} · $500 HOUSE COMEBACK WAGER UNLOCKED!`
          : `LIVE PURSE: ${formatStudioCash(playerCash)} · MAX WAGER: ${formatStudioCash(maxWager)}`;
      body.appendChild(purseInfo);

      if (hasShield) {
        const shieldBanner = document.createElement('div');
        shieldBanner.className = 'wsc8-shield-banner';
        shieldBanner.innerHTML = `${buildCouchIconSvg('SHIELD')}<span>FINAL WAGER SHIELD OWNED: REFUNDS 50% OF YOUR RISK IF MISSED!</span>`;
        body.appendChild(shieldBanner);
      }

      const drum = document.createElement('div');
      drum.className = 'wsc8-wager-drum';
      drum.dataset.role = 'secret-wager-drum';

      const controlsRow = document.createElement('div');
      controlsRow.className = 'wsc8-wager-controls';

      const minusBtn = document.createElement('button');
      minusBtn.type = 'button';
      minusBtn.className = 'wsc8-btn';
      minusBtn.dataset.action = 'wager-minus-50';
      minusBtn.setAttribute('aria-label', 'Decrease wager by $50');
      minusBtn.textContent = '−$50';

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'wsc8-wager-slider';
      slider.min = '0';
      slider.max = String(maxWager);
      slider.step = '25';
      slider.setAttribute('aria-label', `${player.name} Secret Wager Slider`);

      const plusBtn = document.createElement('button');
      plusBtn.type = 'button';
      plusBtn.className = 'wsc8-btn';
      plusBtn.dataset.action = 'wager-plus-50';
      plusBtn.setAttribute('aria-label', 'Increase wager by $50');
      plusBtn.textContent = '+$50';

      const syncWager = (val: number): void => {
        if (sealed) return;
        currentWager = Math.max(0, Math.min(maxWager, Math.round(val)));
        slider.value = String(currentWager);
        drum.textContent = formatStudioCash(currentWager);
      };
      syncWager(currentWager);

      minusBtn.addEventListener('click', () => {
        opts.onTapSfx?.();
        syncWager(currentWager - 50);
      });
      plusBtn.addEventListener('click', () => {
        opts.onTapSfx?.();
        syncWager(currentWager + 50);
      });
      slider.addEventListener('input', () => {
        syncWager(Number(slider.value));
      });

      controlsRow.append(minusBtn, slider, plusBtn);

      const presetGrid = document.createElement('div');
      presetGrid.className = 'wsc8-preset-grid';
      const presets: ReadonlyArray<{
        readonly key: string;
        readonly label: string;
        readonly amount: number;
      }> = [
        { key: 'safe-0', label: 'SAFE $0', amount: 0 },
        { key: 'pct-25', label: '25%', amount: snapWagerStep(maxWager * 0.25, maxWager) },
        { key: 'pct-50', label: '50%', amount: snapWagerStep(maxWager * 0.5, maxWager) },
        { key: 'all-in', label: 'ALL-IN!', amount: maxWager },
      ];
      presets.forEach((p) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wsc8-btn wsc8-btn-teal';
        btn.dataset.preset = p.key;
        btn.textContent = p.label;
        btn.addEventListener('click', () => {
          opts.onTapSfx?.();
          syncWager(p.amount);
        });
        presetGrid.appendChild(btn);
      });

      const lockBtn = document.createElement('button');
      lockBtn.type = 'button';
      lockBtn.className = 'wsc8-launch-paddle';
      lockBtn.dataset.action = 'seal-secret-wager';
      lockBtn.innerHTML = `
        <span class="wsc8-launch-lead">
          ${buildCouchIconSvg('LOCK')}
          <span>LOCK ${player.name}'S SECRET WAGER</span>
        </span>
        <span class="wsc8-launch-arrow" aria-hidden="true">→</span>
      `;
      lockBtn.addEventListener('click', () => {
        if (sealed) return;
        sealed = true;
        opts.onSealEnvelopeSfx?.();
        opts.onVoiceCue?.('VO_FINAL_WAGER_LOCKED');

        drum.dataset.masked = 'true';
        drum.textContent = 'WAGER LOCKED';
        controlsRow.style.visibility = 'hidden';
        presetGrid.style.visibility = 'hidden';
        lockBtn.disabled = true;
        lockBtn.innerHTML = `<span class="wsc8-launch-lead">${buildCouchIconSvg('LOCK')}<span>WAGER SEALED IN ENVELOPE!</span></span>`;

        window.setTimeout(
          () => {
            resolve(currentWager);
          },
          opts.reducedMotion ? 80 : 260,
        );
      });

      body.append(drum, controlsRow, presetGrid, lockBtn);
      sheet.append(marquee, header, body);
      mountCard(sheet);
    });

  // 30s Secret Final Clue A/B/C/D Lock-In
  const collectSecretClueChoice = (
    player: CouchPlayerConfigV8,
  ): Promise<{
    readonly choiceIdx: 0 | 1 | 2 | 3;
    readonly timeSec: number;
    readonly timedOut: boolean;
  }> =>
    new Promise((resolve) => {
      let locked = false;
      const startedAt = performance.now();
      let shownWholeSec = clueSeconds;
      let timerInterval: number | null = null;

      const sheet = document.createElement('section');
      sheet.className = 'wsc8-sheet';
      sheet.dataset.width = 'medium';

      const marquee = document.createElement('div');
      marquee.className = 'wsc8-marquee-bar';

      const header = document.createElement('header');
      header.className = 'wsc8-sheet-header';
      if (player.podiumIndex === 1) {
        header.dataset.tone = 'tangerine';
      }
      const headerCopy = document.createElement('div');
      headerCopy.className = 'wsc8-header-copy';
      headerCopy.innerHTML = `
        <div class="wsc8-kicker">PODIUM ${player.podiumIndex + 1} · ${player.name} SECRET CLIMAX LOCK-IN</div>
        <h2 class="wsc8-title">${getFriendlyCategoryLabelV7(clue.category as CategoryIdV7)}</h2>
      `;

      const clockReadout = document.createElement('div');
      clockReadout.style.fontFamily = "'Michroma', 'Jost', sans-serif";
      clockReadout.style.fontSize = '18px';
      clockReadout.style.fontWeight = '900';
      clockReadout.style.color = '#FFFDF7';
      clockReadout.textContent = `${clueSeconds}s`;

      header.append(headerCopy, clockReadout);

      const body = document.createElement('div');
      body.className = 'wsc8-sheet-body';

      const clockBar = document.createElement('div');
      clockBar.className = 'wsc8-clock-bar';
      const clockFill = document.createElement('div');
      clockFill.className = 'wsc8-clock-fill';
      clockFill.style.width = '100%';
      clockBar.appendChild(clockFill);

      const monitor = document.createElement('div');
      monitor.className = 'wsc8-tv-clue-card';
      monitor.innerHTML = `
        <div class="wsc8-kicker-ink" style="color:#007A82;">FINAL BROADCAST CLUE · SEAL YOUR ANSWER QUIETLY!</div>
      `;
      const stemEl = document.createElement('p');
      stemEl.className = 'wsc8-tv-clue-stem';
      stemEl.textContent = clue.prompt;
      monitor.appendChild(stemEl);

      const grid = document.createElement('div');
      grid.className = 'wsc8-abcd-grid';
      const letters = ['A', 'B', 'C', 'D'] as const;
      const choiceBtns: HTMLButtonElement[] = [];

      const finalizeChoice = (
        choiceIdx: 0 | 1 | 2 | 3,
        timedOut: boolean,
        tappedBtn?: HTMLButtonElement,
      ): void => {
        if (locked) return;
        locked = true;
        if (timerInterval !== null) window.clearInterval(timerInterval);

        const elapsedSec = timedOut
          ? clueSeconds
          : Math.min(
              clueSeconds,
              Math.max(0.1, Number(((performance.now() - startedAt) / 1000).toFixed(2))),
            );

        choiceBtns.forEach((b) => {
          b.disabled = true;
          const labelSpan = b.querySelector('[data-role="choice-text"]');
          if (labelSpan) {
            labelSpan.textContent = b === tappedBtn ? 'ANSWER SEALED IN ENVELOPE!' : '—';
          }
        });
        if (tappedBtn) {
          tappedBtn.dataset.sealed = 'true';
        }

        opts.onSealEnvelopeSfx?.();
        window.setTimeout(
          () => {
            resolve({ choiceIdx, timeSec: elapsedSec, timedOut });
          },
          opts.reducedMotion ? 70 : 200,
        );
      };

      clue.choices.forEach((choiceText, idx) => {
        const cIdx = idx as 0 | 1 | 2 | 3;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wsc8-choice-btn';
        btn.dataset.choiceIdx = String(cIdx);

        const key = document.createElement('span');
        key.className = 'wsc8-choice-key';
        key.textContent = letters[cIdx];

        const textSpan = document.createElement('span');
        textSpan.dataset.role = 'choice-text';
        textSpan.textContent = choiceText;

        btn.append(key, textSpan);
        btn.addEventListener('click', () => finalizeChoice(cIdx, false, btn));
        choiceBtns.push(btn);
        grid.appendChild(btn);
      });

      timerInterval = window.setInterval(() => {
        const elapsed = (performance.now() - startedAt) / 1000;
        const remWhole = Math.max(0, Math.ceil(clueSeconds - elapsed));
        const pct = Math.max(0, Math.min(100, ((clueSeconds - elapsed) / clueSeconds) * 100));
        clockFill.style.width = `${pct.toFixed(1)}%`;

        if (remWhole !== shownWholeSec) {
          shownWholeSec = remWhole;
          clockReadout.textContent = `${shownWholeSec}s`;
          if (shownWholeSec <= 5 && shownWholeSec > 0) {
            clockFill.dataset.urgent = 'true';
            clockReadout.style.color = '#FFE694';
            opts.onClockTickSfx?.(shownWholeSec);
          }
        }
        if (elapsed >= clueSeconds) {
          const fallbackWrongIdx = ((clue.answerIdx + 1) % 4) as 0 | 1 | 2 | 3;
          finalizeChoice(fallbackWrongIdx, true);
        }
      }, 100);

      body.append(clockBar, monitor, grid);
      sheet.append(marquee, header, body);
      mountCard(sheet);
    });

  // Beat D — Simultaneous Prime-Time Studio Reveal by Grant Bellamy!
  const runBeatDSimultaneousReveal = (
    evaluation: CouchFinalShowdownEvaluationV8,
  ): Promise<void> =>
    new Promise((resolve) => {
      const letters = ['A', 'B', 'C', 'D'] as const;
      opts.onVoiceCue?.('VO_FINAL_REVEAL_SHOWDOWN');
      opts.onRevealAnswerSfx?.(evaluation.p1Correct || evaluation.p2Correct);

      const sheet = document.createElement('section');
      sheet.className = 'wsc8-sheet';
      sheet.dataset.width = 'ceremony';

      const marquee = document.createElement('div');
      marquee.className = 'wsc8-marquee-bar';

      const header = document.createElement('header');
      header.className = 'wsc8-sheet-header';

      const hostMedallion = document.createElement('div');
      hostMedallion.className = 'wsc8-gouache-medallion';
      hostMedallion.style.width = '54px';
      hostMedallion.style.height = '54px';
      hostMedallion.style.borderColor = '#FFD166';
      applyCouchCastPortraitV8(hostMedallion, 'GRANT_BELLAMY', 'POISED');

      const headerCopy = document.createElement('div');
      headerCopy.className = 'wsc8-header-copy';
      const kickerEl = document.createElement('div');
      kickerEl.className = 'wsc8-kicker';
      kickerEl.textContent = `GRANT BELLAMY'S PRIME-TIME ENVELOPE REVEAL · ${getFriendlyCategoryLabelV7(clue.category as CategoryIdV7)}`;

      const headlineEl = document.createElement('h2');
      headlineEl.className = 'wsc8-title';
      headlineEl.textContent = 'Both Envelopes Are Sealed — Watch Together!';

      headerCopy.append(kickerEl, headlineEl);
      header.append(hostMedallion, headerCopy);

      const body = document.createElement('div');
      body.className = 'wsc8-sheet-body';

      const answerBox = document.createElement('div');
      answerBox.className = 'wsc8-tv-clue-card';
      answerBox.innerHTML = `
        <div class="wsc8-kicker-ink" style="color:#0E7A46;display:flex;align-items:center;gap:6px;">
          ${buildCouchIconSvg('CHECK')}
          <span>OFFICIAL STUDIO 6A ANSWER · ${letters[clue.answerIdx]}</span>
        </div>
        <div class="wsc8-tv-clue-stem">${clue.choices[clue.answerIdx]}</div>
        ${
          clue.factoid
            ? `<div style="margin-top:6px;font-size:14px;font-weight:700;color:#4A3828;">${clue.factoid}</div>`
            : ''
        }
      `;

      const revealSplit = document.createElement('div');
      revealSplit.className = 'wsc8-podium-split';

      const createEnvelopeCard = (podiumIdx: 0 | 1): {
        readonly card: HTMLElement;
        readonly flipNow: () => void;
        readonly markChampion: () => void;
      } => {
        const isP1 = podiumIdx === 0;
        const player = isP1 ? p1 : p2;
        const choiceIdx = isP1 ? evaluation.p1ChoiceIdx : evaluation.p2ChoiceIdx;
        const timedOut = isP1 ? evaluation.p1TimedOut : evaluation.p2TimedOut;
        const correct = isP1 ? evaluation.p1Correct : evaluation.p2Correct;
        const wager = isP1 ? evaluation.p1Wager : evaluation.p2Wager;
        const delta = isP1 ? evaluation.p1Delta : evaluation.p2Delta;
        const shieldApplied = isP1 ? evaluation.p1ShieldApplied : evaluation.p2ShieldApplied;
        const shieldSaved = isP1
          ? evaluation.p1ShieldRefundCash
          : evaluation.p2ShieldRefundCash;
        const startCash = isP1 ? p1Cash : p2Cash;
        const endCash = isP1 ? evaluation.finalP1Cash : evaluation.finalP2Cash;
        const timeSec = isP1 ? evaluation.p1TimeSec : evaluation.p2TimeSec;

        const card = document.createElement('div');
        card.className = 'wsc8-reveal-card';
        card.dataset.unflipped = 'true';

        const crown = document.createElement('div');
        crown.className = 'wsc8-podium-crown';
        crown.style.background = isP1
          ? 'linear-gradient(135deg, #0097A1 0%, #00737C 100%)'
          : 'linear-gradient(135deg, #FF7945 0%, #DC4B1A 100%)';

        const badge = document.createElement('span');
        badge.className = 'wsc8-podium-pill';
        badge.textContent = `PODIUM ${podiumIdx + 1} · ${player.name}`;

        const verdictSpan = document.createElement('span');
        verdictSpan.className = 'wsc8-order-tag';
        verdictSpan.innerHTML = `${buildCouchIconSvg('LOCK')}<span>SEALED</span>`;

        crown.append(badge, verdictSpan);

        const inner = document.createElement('div');
        inner.className = 'wsc8-podium-inner';

        const pickLine = document.createElement('div');
        pickLine.style.fontSize = '15px';
        pickLine.style.fontWeight = '700';
        pickLine.style.color = '#141B29';
        pickLine.textContent = 'Opening secret Studio 6A envelope...';

        const shieldLine = document.createElement('div');
        shieldLine.style.fontSize = '13.5px';
        shieldLine.style.fontWeight = '800';
        shieldLine.style.color = '#0E7A46';
        shieldLine.style.display = 'none';

        const tallyBar = document.createElement('div');
        tallyBar.style.display = 'flex';
        tallyBar.style.alignItems = 'baseline';
        tallyBar.style.justifyContent = 'space-between';
        tallyBar.style.gap = '8px';
        tallyBar.style.paddingTop = '6px';
        tallyBar.style.borderTop = '1.5px solid #E5D4B3';

        const wagerSpan = document.createElement('span');
        wagerSpan.style.fontSize = '14px';
        wagerSpan.style.fontWeight = '800';
        wagerSpan.style.color = '#5C432D';
        wagerSpan.textContent = 'Wager: LOCKED';

        const scoreSpan = document.createElement('span');
        scoreSpan.style.fontFamily = "'Michroma', 'Jost', sans-serif";
        scoreSpan.style.fontSize = '22px';
        scoreSpan.style.fontWeight = '900';
        scoreSpan.style.color = '#141B29';
        scoreSpan.textContent = formatStudioCash(startCash);

        tallyBar.append(wagerSpan, scoreSpan);
        inner.append(pickLine, shieldLine, tallyBar);
        card.append(crown, inner);

        const flipNow = (): void => {
          card.dataset.unflipped = 'false';
          opts.onFlipPodiumSfx?.(podiumIdx, correct);

          verdictSpan.style.background = correct ? '#E8F8EF' : '#FEECEC';
          verdictSpan.style.color = correct ? '#095C34' : '#9B1C1C';
          verdictSpan.style.borderColor = correct ? '#19A85A' : '#E03E36';
          verdictSpan.innerHTML = timedOut
            ? `${buildCouchIconSvg('CLOCK')}<span>TIME EXPIRED (${timeSec.toFixed(1)}s)</span>`
            : correct
              ? `${buildCouchIconSvg('CHECK')}<span>CORRECT (${timeSec.toFixed(1)}s)</span>`
              : `${buildCouchIconSvg('CROSS')}<span>MISSED (${timeSec.toFixed(1)}s)</span>`;

          pickLine.textContent = timedOut
            ? 'No answer sealed before the 30s buzzer.'
            : `Locked ${letters[choiceIdx]}: "${clue.choices[choiceIdx]}"`;

          if (shieldApplied) {
            shieldLine.style.display = 'block';
            shieldLine.textContent = `FINAL WAGER SHIELD REFUNDED 50% (+${formatStudioCash(shieldSaved)} SAVED!)`;
          }

          const deltaLabel =
            delta > 0
              ? `+${formatStudioCash(delta)}`
              : delta < 0
                ? `−${formatStudioCash(Math.abs(delta))}`
                : '$0';
          wagerSpan.textContent = `Wager ${formatStudioCash(wager)} (${deltaLabel})`;
          scoreSpan.textContent = formatStudioCash(endCash);
        };

        const markChampion = (): void => {
          card.dataset.winner = 'true';
          crown.style.background = 'linear-gradient(135deg, #FFE27D 0%, #E59B18 100%)';
          badge.style.color = '#141B29';
          badge.innerHTML =
            evaluation.winnerPodium === 'CO_CHAMPIONS'
              ? `${buildCouchIconSvg('CROWN')} CO-CHAMPION · ${player.name}`
              : evaluation.wonBySpeedTieBreaker
                ? `${buildCouchIconSvg('CROWN')} SPEED TIE-BREAKER · ${player.name}`
                : `${buildCouchIconSvg('CROWN')} CHAMPION · ${player.name}`;
        };

        return { card, flipNow, markChampion };
      };

      const env1 = createEnvelopeCard(0);
      const env2 = createEnvelopeCard(1);
      revealSplit.append(env1.card, env2.card);

      body.append(answerBox, revealSplit);

      const footer = document.createElement('footer');
      footer.className = 'wsc8-sheet-footer';
      const checkBtn = document.createElement('button');
      checkBtn.type = 'button';
      checkBtn.className = 'wsc8-launch-paddle';
      checkBtn.dataset.action = 'open-certified-winners-check';
      checkBtn.innerHTML = `
        <span class="wsc8-launch-lead">
          ${buildCouchIconSvg('TROPHY')}
          <span>PRESENT CERTIFIED WINNER'S CHECK!</span>
        </span>
        <span class="wsc8-launch-arrow" aria-hidden="true">→</span>
      `;
      checkBtn.addEventListener('click', () => {
        opts.onTapSfx?.();
        resolve();
      });
      footer.appendChild(checkBtn);

      sheet.append(marquee, header, body, footer);
      mountCard(sheet);

      const stepDelay = opts.reducedMotion ? 0 : 420;
      void (async () => {
        await waitMs(stepDelay);
        env1.flipNow();
        await waitMs(stepDelay);
        env2.flipNow();
        await waitMs(opts.reducedMotion ? 0 : 280);

        if (evaluation.winnerPodium === 0) {
          env1.markChampion();
          headlineEl.textContent = evaluation.wonBySpeedTieBreaker
            ? `${p1.name} WINS ON FASTEST LOCK-IN TIE-BREAKER (${evaluation.p1TimeSec.toFixed(1)}s)!`
            : `${p1.name} IS CROWNED COUCH CHAMPION!`;
        } else if (evaluation.winnerPodium === 1) {
          env2.markChampion();
          headlineEl.textContent = evaluation.wonBySpeedTieBreaker
            ? `${p2.name} WINS ON FASTEST LOCK-IN TIE-BREAKER (${evaluation.p2TimeSec.toFixed(1)}s)!`
            : `${p2.name} IS CROWNED COUCH CHAMPION!`;
        } else {
          env1.markChampion();
          env2.markChampion();
          headlineEl.textContent = 'STUDIO 6A CO-CHAMPIONS CROWNED!';
        }
        opts.onCelebrateSfx?.();
      })();
    });

  return (async (): Promise<CouchBlindFinalShowdownResultV8> => {
    try {
      opts.onVoiceCue?.('VO_ACT3_FINAL_WAGER_INTRO');

      await showPrivacyCurtain({
        activePlayer: p1,
        headline: `${p2.name}, LOOK AWAY! · ${p1.name}, TAP TO WAGER`,
        instruction: `${p2.name}, eyes off the screen while ${p1.name} locks a secret Final Broadcast Wager!`,
        ctaLabel: `${p1.name}: OPEN SECRET WAGER`,
        showCategoryBanner: true,
        p1WagerLockedBadge: false,
        p2WagerLockedBadge: false,
      });
      const p1Wager = await collectSecretWager(p1, p1Cash, p1Shield);

      await showPrivacyCurtain({
        activePlayer: p2,
        headline: `${p1.name}, LOOK AWAY! · PASS TO ${p2.name}`,
        instruction: `${p1.name}'s wager is LOCKED! Pass to ${p2.name} to seal Podium 2's secret wager!`,
        ctaLabel: `${p2.name}: OPEN SECRET WAGER`,
        showCategoryBanner: true,
        p1WagerLockedBadge: true,
        p2WagerLockedBadge: false,
      });
      const p2Wager = await collectSecretWager(p2, p2Cash, p2Shield);

      await showPrivacyCurtain({
        activePlayer: p1,
        headline: `${p2.name}, LOOK AWAY! · ${p1.name}'S FINAL CLUE`,
        instruction: `Both wagers are LOCKED! ${p1.name} gets ${clueSeconds} seconds to quietly tap A, B, C, or D.`,
        ctaLabel: `REVEAL FINAL CLUE FOR ${p1.name}`,
        showCategoryBanner: false,
        p1WagerLockedBadge: true,
        p2WagerLockedBadge: true,
      });
      const p1Ans = await collectSecretClueChoice(p1);

      await showPrivacyCurtain({
        activePlayer: p2,
        headline: `${p1.name}, LOOK AWAY! · PASS TO ${p2.name}`,
        instruction: `${p1.name}'s answer is SEALED! ${p2.name} gets the exact same ${clueSeconds}-second studio clock.`,
        ctaLabel: `REVEAL FINAL CLUE FOR ${p2.name}`,
        showCategoryBanner: false,
        p1WagerLockedBadge: true,
        p2WagerLockedBadge: true,
      });
      const p2Ans = await collectSecretClueChoice(p2);

      const wagerResult: CouchSecretFinalWagerResultV8 = {
        p1Wager,
        p2Wager,
        p1ChoiceIdx: p1Ans.choiceIdx,
        p2ChoiceIdx: p2Ans.choiceIdx,
        p1TimeSec: p1Ans.timeSec,
        p2TimeSec: p2Ans.timeSec,
      };

      const evaluation = evaluateCouchFinalShowdownV8({
        spec,
        p1Cash,
        p2Cash,
        p1FinalWagerShield: p1Shield,
        p2FinalWagerShield: p2Shield,
        wagerResult,
        p1TimedOut: p1Ans.timedOut,
        p2TimedOut: p2Ans.timedOut,
        answerIdx: clue.answerIdx,
        tieBreakBySpeed: opts.tieBreakBySpeed,
      });

      if (!opts.skipBeatDRevealModal) {
        await runBeatDSimultaneousReveal(evaluation);
      }

      return {
        ...wagerResult,
        ...evaluation,
      };
    } finally {
      backdrop.remove();
    }
  })();
}

// ----------------------------------------------------------------------------
// 9. Deliverable 4 — Personalized 1966 Certified Couch Winner's Check Modal
//    (`showCouchWinnerCheckCeremonyV8`)
// ----------------------------------------------------------------------------

export function showCouchWinnerCheckCeremonyV8(
  container: HTMLElement,
  opts: CouchWinnerCheckCeremonyOptionsV8,
): Promise<CouchCeremonyActionV8> {
  ensureCouchPartyDeluxeStylesV8();
  const { spec, evaluation } = opts;
  const p1 = spec.podium1;
  const p2 = spec.podium2;
  const isCoChamps = evaluation.winnerPodium === 'CO_CHAMPIONS';
  const winningCash = Math.max(evaluation.finalP1Cash, evaluation.finalP2Cash);

  return new Promise<CouchCeremonyActionV8>((resolve) => {
    let settled = false;
    opts.onCelebrateSfx?.();
    opts.onVoiceCue?.(
      isCoChamps ? 'VO_CEREMONY_CO_CHAMPION' : 'VO_CEREMONY_COUCH_WINNER',
    );

    const backdrop = document.createElement('div');
    backdrop.className = 'wsc8-backdrop';
    backdrop.dataset.modal = 'couch-winner-check-ceremony-v8';
    if (opts.reducedMotion) {
      backdrop.dataset.reducedMotion = 'true';
    }
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'IBC Network Certified Winner Check Ceremony');

    const finalize = (action: CouchCeremonyActionV8): void => {
      if (settled) return;
      settled = true;
      backdrop.remove();
      if (action === 'REMATCH_SWAP_FIRST_PICK') {
        opts.onRematchSwapFirstPick?.(swapCouchPodiumFirstPickV8(spec));
      } else {
        opts.onReturnToHub?.();
      }
      resolve(action);
    };

    const sheet = document.createElement('section');
    sheet.className = 'wsc8-sheet';
    sheet.dataset.width = 'ceremony';

    const marquee = document.createElement('div');
    marquee.className = 'wsc8-marquee-bar';

    const header = document.createElement('header');
    header.className = 'wsc8-sheet-header';
    const crownTitle = isCoChamps
      ? `${p1.name} & ${p2.name} SHARE THE STUDIO CROWN!`
      : evaluation.wonBySpeedTieBreaker
        ? `${evaluation.winnerName} WINS VIA PHOTO-FINISH SPEED TIE-BREAKER!`
        : `${evaluation.winnerName} CLAIMS THE STUDIO 6A PURSE!`;
    header.innerHTML = `
      <div class="wsc8-header-copy">
        <div class="wsc8-kicker">STUDIO 6A CERTIFIED PAYOUT CEREMONY · ${BOARD_PLAY_MODE_TITLES_V9[spec.boardPlayMode]}</div>
        <h2 class="wsc8-title">${crownTitle}</h2>
      </div>
    `;

    const body = document.createElement('div');
    body.className = 'wsc8-sheet-body';

    // Ornate 1966 IBC Network Certified Winner's Check
    const checkSerial = `66-06A-${String(1000 + ((winningCash * 7 + spec.totalTurns * 31) % 8999))}`;
    const checkEl = document.createElement('div');
    checkEl.className = 'wsc8-certified-check';
    checkEl.dataset.role = 'ibc-certified-check';
    checkEl.innerHTML = `
      <div class="wsc8-check-top">
        <div>
          <div class="wsc8-check-bank">INTERNATIONAL BROADCASTING CORPORATION · STUDIO 6A NEW YORK</div>
          <div style="font-size:12.5px;font-weight:700;color:#5C432D;">30 ROCKEFELLER PLAZA · CHECK NO. ${checkSerial} · AUTUMN 1966</div>
        </div>
        <div class="wsc8-check-amount-box">${formatStudioCash(winningCash)}</div>
      </div>
      <div class="wsc8-check-payline">
        <span>PAY TO THE ORDER OF:</span>
        <span class="wsc8-check-payee">${evaluation.winnerName}</span>
      </div>
      <div class="wsc8-check-words">${spellCertifiedCheckDollarsV8(winningCash)}</div>
      <div class="wsc8-check-bottom">
        <span class="wsc8-wax-seal">${buildCouchIconSvg('TROPHY')}<span>IBC NETWORK CERTIFIED WINNER'S CHECK</span></span>
        <span class="wsc8-signature">Grant Bellamy, Master of Ceremonies</span>
      </div>
    `;

    // Side-by-Side Final Contestant Stat Plaques (`POISED` vs `BREAKDOWN` portraits!)
    const podiumCompare = document.createElement('div');
    podiumCompare.className = 'wsc8-podium-split';

    const buildFinalStatCard = (podiumIdx: 0 | 1): HTMLElement => {
      const isP1 = podiumIdx === 0;
      const player = isP1 ? p1 : p2;
      const isWinner = isCoChamps || evaluation.winnerPodium === podiumIdx;
      const emotion: PortraitEmotionV7 = isWinner ? 'POISED' : 'BREAKDOWN';
      const finalCash = isP1 ? evaluation.finalP1Cash : evaluation.finalP2Cash;
      const delta = isP1 ? evaluation.p1Delta : evaluation.p2Delta;
      const timeSec = isP1 ? evaluation.p1TimeSec : evaluation.p2TimeSec;
      const correctCount = isP1 ? opts.p1CorrectClues : opts.p2CorrectClues;
      const bestStreak = isP1 ? opts.p1BestStreak : opts.p2BestStreak;
      const gremlinHits = isP1 ? opts.p1Gremlins : opts.p2Gremlins;

      const card = document.createElement('div');
      card.className = 'wsc8-podium-desk';
      card.dataset.podium = String(podiumIdx);

      const crown = document.createElement('div');
      crown.className = 'wsc8-podium-crown';
      if (isWinner) {
        crown.style.background = 'linear-gradient(135deg, #FFE27D 0%, #E59B18 100%)';
      }

      const roleTag = document.createElement('span');
      roleTag.className = 'wsc8-podium-pill';
      if (isWinner) {
        roleTag.style.color = '#141B29';
      }
      roleTag.innerHTML = isCoChamps
        ? `${buildCouchIconSvg('CROWN')} CO-CHAMPION`
        : isWinner
          ? evaluation.wonBySpeedTieBreaker
            ? `${buildCouchIconSvg('CROWN')} CHAMPION (FASTEST)`
            : `${buildCouchIconSvg('CROWN')} COUCH CHAMPION`
          : 'RUNNER-UP';

      crown.appendChild(roleTag);

      const inner = document.createElement('div');
      inner.className = 'wsc8-podium-inner';

      const topRow = document.createElement('div');
      topRow.className = 'wsc8-podium-hero-row';

      const portrait = document.createElement('div');
      portrait.className = 'wsc8-gouache-medallion';
      portrait.dataset.emotion = emotion;
      portrait.style.width = '68px';
      portrait.style.height = '68px';
      portrait.style.borderColor = isWinner
        ? '#D9880B'
        : isP1
          ? PODIUM_1_PEACOCK_HEX_V8
          : PODIUM_2_TANGERINE_HEX_V8;
      applyCouchCastPortraitV8(portrait, player.avatarId, emotion);

      const meta = document.createElement('div');
      meta.className = 'wsc8-name-stack';

      const nameAndCash = document.createElement('div');
      nameAndCash.style.display = 'flex';
      nameAndCash.style.alignItems = 'baseline';
      nameAndCash.style.justifyContent = 'space-between';
      nameAndCash.style.gap = '8px';
      nameAndCash.style.flexWrap = 'wrap';
      nameAndCash.innerHTML = `
        <span style="font-family:'Jost',sans-serif;font-size:19px;font-weight:900;color:#141B29;">${player.name}</span>
        <span style="font-family:'Michroma','Jost',sans-serif;font-size:21px;font-weight:900;color:#095C34;">${formatStudioCash(finalCash)}</span>
      `;

      meta.appendChild(nameAndCash);
      topRow.append(portrait, meta);

      const statsRow = document.createElement('div');
      statsRow.className = 'wsc8-stat-pill-row';

      const addStatPill = (txt: string): void => {
        const pill = document.createElement('span');
        pill.className = 'wsc8-stat-pill';
        pill.textContent = txt;
        statsRow.appendChild(pill);
      };

      const deltaTxt =
        delta > 0
          ? `Final +${formatStudioCash(delta)}`
          : delta < 0
            ? `Final −${formatStudioCash(Math.abs(delta))}`
            : 'Final $0';
      addStatPill(deltaTxt);
      addStatPill(`Climax ${timeSec.toFixed(1)}s`);
      if (typeof correctCount === 'number') {
        addStatPill(`${correctCount} Hits`);
      }
      if (typeof bestStreak === 'number' && bestStreak > 0) {
        addStatPill(`${bestStreak} Streak`);
      }
      if (typeof gremlinHits === 'number' && gremlinHits > 0) {
        addStatPill(`${gremlinHits} Gremlin${gremlinHits === 1 ? '' : 's'}`);
      }

      inner.append(topRow, statsRow);
      card.append(crown, inner);
      return card;
    };

    podiumCompare.append(buildFinalStatCard(0), buildFinalStatCard(1));
    body.append(checkEl, podiumCompare);

    // Footer CTAs: RETURN TO STUDIO HUB + REMATCH (SWAP PODIUM 1ST PICK!)
    const footer = document.createElement('footer');
    footer.className = 'wsc8-sheet-footer';

    const hubBtn = document.createElement('button');
    hubBtn.type = 'button';
    hubBtn.className = 'wsc8-btn';
    hubBtn.style.minHeight = '54px';
    hubBtn.style.flex = '1 1 200px';
    hubBtn.dataset.action = 'couch-return-hub';
    hubBtn.innerHTML = `${buildCouchIconSvg('TV')}<span>RETURN TO STUDIO HUB</span>`;
    hubBtn.addEventListener('click', () => {
      opts.onTapSfx?.();
      finalize('RETURN_TO_HUB');
    });

    const rematchBtn = document.createElement('button');
    rematchBtn.type = 'button';
    rematchBtn.className = 'wsc8-launch-paddle';
    rematchBtn.style.flex = '1.5 1 280px';
    rematchBtn.style.minHeight = '54px';
    rematchBtn.dataset.action = 'couch-rematch-swap';
    rematchBtn.innerHTML = `
      <span class="wsc8-launch-lead">
        ${buildCouchIconSvg('SWAP')}
        <span>REMATCH (SWAP PODIUM 1ST PICK!)</span>
      </span>
      <span class="wsc8-launch-arrow" aria-hidden="true">→</span>
    `;
    rematchBtn.addEventListener('click', () => {
      opts.onTapSfx?.();
      finalize('REMATCH_SWAP_FIRST_PICK');
    });

    footer.append(hubBtn, rematchBtn);
    sheet.append(marquee, header, body, footer);
    backdrop.appendChild(sheet);
    container.appendChild(backdrop);
  });
}
