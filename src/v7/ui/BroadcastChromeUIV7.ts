// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING — 1966 "IN LIVING COLOR" ULTRA-HD
// `src/v7/ui/BroadcastChromeUIV7.ts` (Wave 2 AAA Polish)
// Mobile-Phone & Tablet First 1966 NBC/CBS Network Broadcast Chrome:
//  - Flush <=56px Split-Flap Broadcast Header Ribbon with Mechanical Solari
//    Rolling Split-Flap Digits, Delta Flash Pops, Circular TV-Camera Lens Avatar
//  - Monolithic 1966 RCA Studio Question Monitor with Dramatic Living Color
//    TV Twist Header Flares (Secret Square, Locked Vault, Opponent's Choice,
//    Mystery Curtain, Instant Bargain, Studio Showcase) & 30s Countdown Bar
//  - Zero-Box Editorial Broadcast Sheets (Ceremony, Prop Shop, Trophy Vault,
//    Sound Console, Air-Mail Canary Envelope, Pablo Ferro Split Call-Sheet)
// ============================================================================

import {
  ALL_BOARD_PLAY_MODES_V7,
  BOARD_PLAY_MODE_TITLES_V7,
  CAREER_MEDAL_SPECS_V7,
  type AwardRarityTierV7,
  type BoardPlayModeV7,
  type BoardTwistIdV7,
  type BroadcastActNumberV7,
  type BroadcastSettingsV7,
  type CampaignSaveStateV7,
  type CareerMedalIdV7,
  type CastIdV7,
  type CategoryIdV7,
  type ClassicTvTileTwistV7,
  type ClassicTvTileTwistV9,
  type ClueRecordV7,
  type ContestantWaiverV7,
  type CoupRegimeIdV7,
  type CpuPlaystyleIdV7,
  type CpuTemperamentIdV7,
  type DayJobIdV7,
  type DifficultyModeV7,
  type DomainIdV7,
  type EpisodeBlueprintV7,
  type LienGoalIdV7,
  type NextEpisodeCliffhangerTeaserV7,
  type PortraitEmotionV7,
  type RivalIdV7,
  type StageViceIdV7,
  type ToyResolutionV7,
  type TrophySpecV7,
} from '../contracts_v7';
import {
  CAST_PROFILES_V7,
  FOIL_SPECS_V7,
  LIVE_SCORE_BURN_SHOP_COST_V7,
  MAX_MULT_DRIVER_SLOTS_V7,
  MAX_TRUNK_SLOTS_V7,
  PORTRAIT_SPRITE_POSITIONS_V7,
  RELIC_BY_ID_V7,
  RELIC_CATALOG_V7,
  TROPHY_CATALOG_V7,
  buildCastMonogramSvgDataUriV7,
  executeLiveScoreBurnBuyV7,
  validateTrunkLoadoutV7,
  type TurnEconomyBreakdownV7,
} from '../campaign/CastAndRelicsCatalogV7';
import {
  CampaignDirectorV7,
  FINALE_ENDINGS_V7,
  LIEN_SEGMENT_COST_CASH_V7,
  formatEpisodeCodeV7,
  type EpisodeOutcomeSummaryV7,
  type FinaleEndingSpecV7,
  type VipJuryBallotV7,
} from '../campaign/FiftyMillionCampaignV7';
import { getTrophyDisplayMetaV7 } from '../engine/LitTrophyVaultV7';
import {
  EMCEE_MEDALLION_ASSET_V7,
  EMCEE_SPRITE_POSITIONS_V7,
  type EmceeMoodV7,
} from '../campaign/StudioAnnouncerV7';
import {
  isAutoTipsMutedV8,
  mountQuestionTimerSelectorV8,
  normalizeQuestionTimerModeV8,
  resetSeenStudioGuidesV8,
  setAutoTipsMutedV8,
} from './SmartStudioCoachV8';
import {
  isAutoPlayShowIntroEnabledV8,
  setAutoPlayShowIntroEnabledV8,
} from './ShowBroadcastIntroAndCreditsV8';
import { BOARD_TWIST_SPECS_V7 } from '../boards/BoardTwistsEngineV7';

// ----------------------------------------------------------------------------
// 1. Orphan-Proof Copy & Friendly 1966 TV Category + Twist Flare Specs
// ----------------------------------------------------------------------------

export function formatOrphanProofCopyV7(raw: string): string {
  const cleaned = raw
    .replace(/\.{3}|\u2026/g, '—')
    .replace(/\*([^*]+)\*/g, '“$1”')
    .trim();
  const lastSpace = cleaned.lastIndexOf(' ');
  if (lastSpace <= 0 || lastSpace >= cleaned.length - 1) {
    return cleaned;
  }
  return `${cleaned.slice(0, lastSpace)}\u00A0${cleaned.slice(lastSpace + 1)}`;
}

export const FRIENDLY_TV_CATEGORY_LABELS_V7: Record<CategoryIdV7, string> = {
  MEDICINE: 'BODY & MEDICINE',
  CHEMISTRY: 'SCIENCE · CHEMISTRY',
  PHYSICS: 'SCIENCE & SPACE',
  GADGETS: 'INVENTIONS & GADGETS',
  ENGINES: 'PLANES, TRAINS & AUTOS',
  LITERATURE: 'BOOKS & AUTHORS',
  LEXICON: 'WORDS & WIT',
  'FINE ARTS': 'ART & STAGE',
  SCREEN: 'SILVER SCREEN',
  JUKEBOX: 'HIT PARADE · MUSIC',
  FINANCE: 'MONEY & MARKETS',
  PRICING: 'PRICE TAG',
  ODDS: 'LUCK & NUMBERS',
  ATLAS: 'WORLD ATLAS',
  SPORTS: 'WIDE WORLD OF SPORTS',
  DYNASTIES: 'EMPIRES & KINGS',
  HEADLINES: 'FRONT PAGE HISTORY',
  FOLKLORE: 'MYTHS & LEGENDS',
  FALLACIES: 'BRAIN TWISTERS',
  CUISINE: 'FOOD & FLAVOR',
};

export function getFriendlyTvCategoryLabelV7(category: CategoryIdV7): string {
  return FRIENDLY_TV_CATEGORY_LABELS_V7[category] ?? category;
}

export function isDocumentFullscreenV7(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
  };
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
}

export async function toggleDocumentFullscreenV7(): Promise<{
  readonly ok: boolean;
  readonly isFullscreen: boolean;
  readonly reason?: 'UNSUPPORTED_IOS' | 'BLOCKED';
}> {
  if (typeof document === 'undefined') {
    return { ok: false, isFullscreen: false, reason: 'BLOCKED' };
  }
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void> | void;
  };
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
  };

  try {
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      if (typeof doc.exitFullscreen === 'function') {
        await doc.exitFullscreen();
      } else if (typeof doc.webkitExitFullscreen === 'function') {
        await doc.webkitExitFullscreen();
      }
      return { ok: true, isFullscreen: false };
    }

    if (typeof el.requestFullscreen === 'function') {
      await el.requestFullscreen({ navigationUI: 'hide' });
      return { ok: true, isFullscreen: true };
    }
    if (typeof el.webkitRequestFullscreen === 'function') {
      await el.webkitRequestFullscreen();
      return { ok: true, isFullscreen: true };
    }
    return { ok: false, isFullscreen: false, reason: 'UNSUPPORTED_IOS' };
  } catch {
    return { ok: false, isFullscreen: isDocumentFullscreenV7(), reason: 'BLOCKED' };
  }
}

const LIVING_COLOR_DOMAIN_RIBBONS_V7: Record<
  DomainIdV7,
  { readonly bg: string; readonly ink: string; readonly chipBg: string; readonly chipInk: string }
> = {
  SCI_TECH: {
    bg: 'linear-gradient(90deg, #164db8 0%, #2468e0 100%)',
    ink: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.34)',
    chipInk: '#fff7e6',
  },
  POP_LIT: {
    bg: 'linear-gradient(90deg, #e5960b 0%, #f6b52c 100%)',
    ink: '#121a2b',
    chipBg: 'rgba(18, 26, 43, 0.16)',
    chipInk: '#121a2b',
  },
  NUM_GEO: {
    bg: 'linear-gradient(90deg, #007d8c 0%, #00a3b5 100%)',
    ink: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.3)',
    chipInk: '#fff7e6',
  },
  HIST_FACT: {
    bg: 'linear-gradient(90deg, #d9461a 0%, #f56838 100%)',
    ink: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.3)',
    chipInk: '#fff7e6',
  },
};

interface TvTwistFlareSpecV7 {
  readonly badge: string;
  readonly flareBanner: string;
  readonly headerBg: string;
  readonly headerInk: string;
  readonly chipBg: string;
  readonly chipInk: string;
}

const TV_TWIST_FLARE_SPECS_V7: Partial<Record<ClassicTvTileTwistV9, TvTwistFlareSpecV7>> = {
  SECRET_SQUARE: {
    badge: '⭐ 2×',
    flareBanner: '★ SECRET SQUARE · DOUBLE DOLLARS! ★',
    headerBg: 'linear-gradient(95deg, #cc7a00 0%, #f7b728 52%, #e08200 100%)',
    headerInk: '#121a2b',
    chipBg: 'rgba(18, 26, 43, 0.18)',
    chipInk: '#121a2b',
  },
  LOCKED_VAULT: {
    badge: '🔓 VAULT',
    flareBanner: '🔓 GOLDEN VAULT · $500 JACKPOT CLUE!',
    headerBg: 'linear-gradient(95deg, #0b6e46 0%, #19a85a 52%, #0c784c 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.34)',
    chipInk: '#fff7e6',
  },
  OPPONENT_CHOICE: {
    badge: '🎭 RIVAL',
    flareBanner: '🎭 OPPONENT’S CHOICE · BONUS MULT!',
    headerBg: 'linear-gradient(95deg, #ad1a56 0%, #e63b7a 52%, #b81d5c 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.34)',
    chipInk: '#fff7e6',
  },
  MYSTERY_CURTAIN: {
    badge: '❓ CURTAIN',
    flareBanner: '❓ MYSTERY CURTAIN · PRIZE PLAY!',
    headerBg: 'linear-gradient(95deg, #008294 0%, #1e56c5 48%, #e63b7a 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.36)',
    chipInk: '#fff7e6',
  },
  INSTANT_BARGAIN: {
    badge: '🔔 BARGAIN',
    flareBanner: '🔔 INSTANT BARGAIN · BONUS CHANCE!',
    headerBg: 'linear-gradient(95deg, #cc4114 0%, #ff6738 52%, #d9461a 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.32)',
    chipInk: '#fff7e6',
  },
  SHOWCASE_BONUS: {
    badge: '★ BONUS',
    flareBanner: '★ 1966 STUDIO SHOWCASE BONUS ROUND!',
    headerBg: 'linear-gradient(95deg, #164db8 0%, #0096a6 55%, #f4a91f 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.36)',
    chipInk: '#fff7e6',
  },
  BIG_WHEEL_SPIN: {
    badge: '🎡 WHEEL',
    flareBanner: '🎡 1966 BIG WHEEL SPIN · BONUS PRIZE!',
    headerBg: 'linear-gradient(95deg, #c97300 0%, #f4a91f 48%, #0096a6 100%)',
    headerInk: '#121a2b',
    chipBg: 'rgba(18, 26, 43, 0.18)',
    chipInk: '#121a2b',
  },
  BLIND_CATEGORY: {
    badge: '$600 ???',
    flareBanner: '🔒 $600 BLIND CATEGORY UNSEALED!',
    headerBg: 'linear-gradient(95deg, #103b96 0%, #2468e0 52%, #0f3788 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.36)',
    chipInk: '#fff7e6',
  },
  MYSTERY_CASH: {
    badge: '$??? CASH',
    flareBanner: '💰 MYSTERY CASH ENVELOPE UNSEALED!',
    headerBg: 'linear-gradient(95deg, #007485 0%, #18a957 52%, #007d8c 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.34)',
    chipInk: '#fff7e6',
  },
  BRASS_KEY: {
    badge: '🗝️ KEY',
    flareBanner: '🗝️ BRASS SAFE KEY · WIN TO UNLOCK $500 SAFE!',
    headerBg: 'linear-gradient(95deg, #b86800 0%, #ffd166 52%, #b86800 100%)',
    headerInk: '#121a2b',
    chipBg: 'rgba(18, 26, 43, 0.18)',
    chipInk: '#121a2b',
  },
  PRESS_LUCK_SPIN: {
    badge: '⚡ LUCK',
    flareBanner: '⚡ PRESS YOUR LUCK · WIN TO EARN SPINS!',
    headerBg: 'linear-gradient(95deg, #c93312 0%, #ff6738 50%, #e63b7a 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.36)',
    chipInk: '#fff7e6',
  },
  VIP_BLUFF: {
    badge: '🎭 VIP',
    flareBanner: '🎭 1966 CELEBRITY VIP SQUARE · TRUST OR CALL BLUFF!',
    headerBg: 'linear-gradient(95deg, #c93b12 0%, #f2a922 52%, #e6397a 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(92, 48, 27, 0.34)',
    chipInk: '#fff7e6',
  },
};

// ----------------------------------------------------------------------------
// 2. Public Interfaces & Event Hooks for Master Engine Integration
// ----------------------------------------------------------------------------

const SVG_DOSSIER_TAB_1966 =
  '<svg class="ws7-vec-ico" viewBox="0 0 16 16" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M1.5 3.2A1.2 1.2 0 0 1 2.7 2h3.6l1.4 1.6h5.6a1.2 1.2 0 0 1 1.2 1.2v7.6a1.2 1.2 0 0 1-1.2 1.2H2.7a1.2 1.2 0 0 1-1.2-1.2V3.2Zm2.3 3.3v1.4h8.4V6.5H3.8Zm0 3v1.4h5.8V9.5H3.8Z"/></svg>';

const SVG_TELL_BEACON_1966 =
  '<svg class="ws7-vec-ico" viewBox="0 0 16 16" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M8 1.2 9.9 5l4.2.6-3 3 .7 4.2L8 10.8l-3.8 2 .7-4.2-3-3L6.1 5 8 1.2Z"/></svg>';

const SVG_SCISSORS_1966 =
  '<svg class="ws7-vec-ico" viewBox="0 0 18 18" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="4.5" cy="5" r="2.2"/><circle cx="4.5" cy="13" r="2.2"/><path d="M6.4 6.3 15.2 13M15.2 5 6.4 11.7"/></svg>';

const SVG_POLL_BARS_1966 =
  '<svg class="ws7-vec-ico" viewBox="0 0 18 18" width="15" height="15" fill="currentColor" aria-hidden="true"><rect x="2" y="9" width="3.2" height="6.5" rx="0.8"/><rect x="7.4" y="3.5" width="3.2" height="12" rx="0.8"/><rect x="12.8" y="6.5" width="3.2" height="9" rx="0.8"/></svg>';

const SVG_FREE_SWAP_1966 =
  '<svg class="ws7-vec-ico" viewBox="0 0 18 18" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.2 6.5h10.2l-2.6-2.6M14.8 11.5H4.6l2.6 2.6"/></svg>';

const SVG_REEL_VAULT_1966 =
  '<svg class="ws7-vec-ico" viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true"><rect x="1.2" y="2.2" width="13.6" height="11.6" rx="2.2" stroke="currentColor" stroke-width="1.5"/><circle cx="5.2" cy="7.3" r="2.2" stroke="currentColor" stroke-width="1.4"/><circle cx="10.8" cy="7.3" r="2.2" stroke="currentColor" stroke-width="1.4"/><circle cx="5.2" cy="7.3" r="0.7" fill="currentColor"/><circle cx="10.8" cy="7.3" r="0.7" fill="currentColor"/><path d="M4.2 11.4H11.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

const SVG_BRASS_CLIPBOARD_1966 =
  '<svg class="ws7-vec-ico" viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true"><rect x="2.5" y="2.8" width="11" height="11.6" rx="1.8" stroke="currentColor" stroke-width="1.5"/><path d="M5.6 1.5H10.4V3.7H5.6V1.5Z" fill="currentColor"/><path d="M5 6.8H11M5 9.4H11M5 12H8.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

export interface BroadcastChromeCallbacksV7 {
  readonly onStartCampaignMatch?: (
    blueprint: EpisodeBlueprintV7,
    chosenRegime?: Exclude<CoupRegimeIdV7, 'NONE'>,
  ) => void;
  readonly onStartQuickPlay?: () => void;
  readonly onStartDailyBroadcast?: () => void;
  readonly onOpenHowToPlay?: () => void;
  readonly onBoothArrestPressed?: () => void;
  readonly onCensorPaddleStateChange?: (held: boolean) => void;
  readonly onSettingsChanged?: (settings: BroadcastSettingsV7) => void;
  readonly onSelectTrophyIn3DVault?: (trophyId: string, unlocked: boolean) => void;
  readonly onMountTrophyVault3D?: (
    stageEl: HTMLElement,
    initialTrophyId: string,
    unlocked: boolean,
  ) => (() => void) | void;
  readonly onLiveScoreBurnPurchase?: (
    nextPlayerMatchScore: number,
    relicId: string,
  ) => void;
  readonly onReturnToTitleHub?: () => void;
  readonly onAdjustBoardZoom?: (deltaOrReset: number | 'RESET') => void;
  readonly onToggleFullscreen?: () => void;
  readonly onUtilityModalStateChange?: (open: boolean) => void;
  readonly onStartCouchParty?: () => void;
  readonly onOpenCareerStats?: () => void;
  readonly onOpenDailyTapeVault?: () => void;
  readonly onPlayEndCredits?: () => void;
  readonly onOpenWalnutShareCard?: () => void;
  readonly onToggleTurbo?: () => void;
  readonly onTriggerTkoWin?: () => void;
  readonly onConcedeRematch?: () => void;
  readonly onBlitzPass?: () => void;
  readonly onArmHotMic?: () => void;
}

export interface TopBugSnapshotV7 {
  readonly playerCash: number;
  readonly rivalCash: number;
  readonly turnNumber: number; // 1 .. 10
  readonly totalTurns?: number; // default 10
  readonly streak: number;
  readonly rivalId: RivalIdV7;
  readonly rivalEmotion?: PortraitEmotionV7;
  readonly boothTellLive?: boolean;
  readonly isDailyBroadcast?: boolean;
  readonly dailyEpisodeNumber?: number;
  readonly actNumber?: BroadcastActNumberV7;
  readonly isAct2Boosted?: boolean;
  readonly isFinalWager?: boolean;
  readonly turboEnabled?: boolean;
  readonly mercyBellState?: 'NONE' | 'TKO_WIN' | 'CONCEDE_REMATCH';
  readonly hotMicShowButton?: boolean;
  readonly hotMicAvailable?: boolean;
  readonly hotMicArmed?: boolean;
  readonly blitzMode?: boolean;
  readonly podiumTrimId?: string;
  readonly boardModeBanner?: {
    readonly modeTitle: string;
    readonly ruleSummary: string;
  } | null;
}

export interface QuestionChassisOpenSpecV7 {
  readonly clue: ClueRecordV7;
  readonly baseChips: number;
  readonly liveMultPreview: number;
  readonly countdownSeconds: number;
  readonly totalCountdownSeconds?: number;
  readonly isWheelhouse?: boolean;
  readonly hasAmberTruce?: boolean;
  readonly tvTwist?: ClassicTvTileTwistV9;
  readonly isShowcaseFormat?: boolean;
  readonly showcaseFormatName?: string;
  readonly fiftyFiftyAvailable?: boolean;
  readonly audiencePollAvailable?: boolean;
  readonly freeSwapAvailable?: boolean;
  readonly onUseFiftyFifty?: () => void;
  readonly onUseAudiencePoll?: () => void;
  readonly onUseFreeSwap?: () => void;
  readonly plainMicroTip?: { readonly badge: string; readonly plainInstruction: string };
  readonly onOpenQuestionCoach?: () => void;
  readonly noTimerMode?: boolean;
  readonly isMatchPointTurn?: boolean;
  readonly isAct3Showdown?: boolean;
  readonly isFinalWager?: boolean;
  readonly hostIntroLine?: string;
  readonly hostMood?: EmceeMoodV7;
}

export interface MatchCurtainRaiserSpecV7 {
  readonly episodeCode: string;
  readonly stageTitle: string;
  readonly matchTitle: string;
  readonly rivalId: RivalIdV7;
  readonly boardModeTitle: string;
  readonly boardRuleSummary: string;
  readonly topologyBadge?: string;
  readonly returningChampStreak?: number;
  readonly scoutedWeak?: readonly CategoryIdV7[];
  readonly scoutedStrong?: readonly CategoryIdV7[];
  readonly traitRevealed?: boolean;
  readonly playstyle?: CpuPlaystyleIdV7;
  readonly temperament?: CpuTemperamentIdV7;
  readonly quoteLine?: string;
  readonly durationMs?: number;
}

export interface RivalTurnChyronSpecV7 {
  readonly rivalId: RivalIdV7;
  readonly headline: string;
  readonly subline?: string;
  readonly tone?: 'neutral' | 'claim' | 'miss' | 'zonk' | 'scout';
  readonly emotion?: PortraitEmotionV7;
  readonly onSkip?: () => void;
}

export interface CeremonyExtraSpecV7 {
  readonly returningChampStreak?: number;
  readonly newlyScoutedWeak?: readonly CategoryIdV7[];
  readonly newlyScoutedStrong?: readonly CategoryIdV7[];
  readonly scoutedPlaystyleLabel?: string;
  readonly nextRivalName?: string;
  readonly nextBoardModeTitle?: string;
  readonly nextCliffhangerTeaser?: NextEpisodeCliffhangerTeaserV7;
  readonly allowBackstageCustomization?: boolean;
  readonly earnedCareerMedals?: readonly CareerMedalIdV7[];
  readonly isCoChampionTie?: boolean;
  readonly consolationShowroomCash?: number;
  readonly rematchButtonLabel?: string;
  readonly onRematchClick?: () => void;
}

export interface WinnersCirclePromptOptionsV9 {
  readonly matchWinningsSC: number;
  readonly onTapSfx?: () => void;
}

export interface WinnersCircleSprintOptionsV9 {
  readonly clues: readonly ClueRecordV7[];
  readonly totalClockSec?: number;
  readonly onTapSfx?: () => void;
  readonly onAnswerSfx?: (correct: boolean) => void;
  readonly onPassSfx?: () => void;
  readonly onCompleteSfx?: (swept: boolean) => void;
}

export interface WinnersCircleSprintResultV9 {
  readonly bonusCashEarned: number;
  readonly hits: number;
  readonly sweptAllSix: boolean;
}

export interface PostAnswerTheaterSpecV7 {
  readonly resolution: ToyResolutionV7;
  readonly ahaFactoid: string;
  readonly economy: TurnEconomyBreakdownV7;
  readonly totalTurnNetCash?: number;
  readonly extraBonusLabel?: string;
  readonly dwellMs?: number;
  readonly turboMode?: boolean;
  readonly discoveryCallout?: string;
  readonly hostQuip?: string;
  readonly hostMood?: EmceeMoodV7;
}

export interface ActBreakBumperSpecV7 {
  readonly actTitle?: string;
  readonly headline?: string;
  readonly detailLine?: string;
  readonly durationMs?: number;
}

export interface FinalBroadcastWagerStageSpecV7 {
  readonly episodeCode: string;
  readonly category: CategoryIdV7;
  readonly playerCash: number;
  readonly rivalCash: number;
  readonly rivalId: RivalIdV7;
  readonly maxWager: number;
  readonly isScoutedWeak?: boolean;
  readonly isScoutedStrong?: boolean;
  readonly hostPromptLine?: string;
  readonly onWagerTickSfx?: () => void;
  readonly onLockInSfx?: () => void;
}

export interface FinalWagerShowdownRevealSpecV7 {
  readonly category: CategoryIdV7;
  readonly trueAnswerDisplay: string;
  readonly ahaFactoid: string;
  readonly hostQuip: string;
  readonly hostMood?: EmceeMoodV7;
  readonly rivalId: RivalIdV7;
  readonly cpuAnswerText: string;
  readonly cpuCorrect: boolean;
  readonly cpuWager: number;
  readonly prevRivalCash: number;
  readonly finalRivalCash: number;
  readonly playerAnswerText: string;
  readonly playerCorrect: boolean;
  readonly playerWager: number;
  readonly prevPlayerCash: number;
  readonly finalPlayerCash: number;
  readonly discoveryCallout?: string;
  readonly dwellMs?: number;
  readonly onCpuRevealSfx?: (correct: boolean) => void;
  readonly onPlayerRevealSfx?: (correct: boolean) => void;
}

const DAY_JOB_LABELS_V7: ReadonlyArray<{
  readonly id: DayJobIdV7;
  readonly title: string;
  readonly perk: string;
}> = [
  {
    id: 'PATENT_CLERK',
    title: 'Patent Clerk',
    perk: '+20% Dollars on Science & Tech plus a blueprint hint on visual plates.',
  },
  {
    id: 'MONOLOGUE_WRITER',
    title: 'Monologue Writer',
    perk: '+20% Dollars on Arts & Culture plus 1 free shutter reveal.',
  },
  {
    id: 'VEGAS_ACTUARY',
    title: 'Vegas Actuary',
    perk: '+15% Cash on high-stakes wins plus sharper Champion scouting.',
  },
  {
    id: 'NIGHT_FACT_CHECKER',
    title: 'Night Fact-Checker',
    perk: 'Crosses out 1 wrong decoy early in the show plus +$25 bonus.',
  },
];

const STAGE_VICE_LABELS_V7: ReadonlyArray<{
  readonly id: StageViceIdV7;
  readonly title: string;
  readonly perk: string;
}> = [
  {
    id: 'DOUBLE_OR_NOTHING',
    title: 'Double or Nothing',
    perk: '2+ streak adds +0.45× multiplier; misses carry a -$100 sting.',
  },
  {
    id: 'KNOW_IT_ALL',
    title: 'Quick Buzzer',
    perk: 'Answering within 4.5 seconds banks +$60 Speed Bonus.',
  },
  {
    id: 'SCOREBOARD_GRUDGE',
    title: 'Comeback Kid',
    perk: 'Trailing the Champion boosts your multiplier by +0.50×.',
  },
];

const LIEN_GOAL_LABELS_V7: ReadonlyArray<{
  readonly id: LienGoalIdV7;
  readonly title: string;
  readonly perk: string;
}> = [
  {
    id: 'CLEAN_PURSE_250K',
    title: '$250K Clean Purse',
    perk: 'Play straight for the official network buyout (+1 Grant Bellamy favor).',
  },
  {
    id: 'DIRTY_HOUSE_MARKER',
    title: 'Backstage Hustle',
    perk: 'Work the under-the-table side action (+1 Roz Korman favor).',
  },
  {
    id: 'STAGE_10_BIBLE',
    title: 'Expose the Rigging',
    perk: 'Uncover Control Booth A’s secret playbook (+1 Vera Karp favor).',
  },
];

interface SolariRollerState {
  displayed: number;
  target: number;
  lastFormatted: string;
  rafId: number | null;
  glowTimeout: number | null;
  deltaTimeout: number | null;
}

// ----------------------------------------------------------------------------
// 3. BroadcastChromeUIV7 — 1966 Living Color Ultra-HD Broadcast UI Controller
// ----------------------------------------------------------------------------

export class BroadcastChromeUIV7 {
  private readonly host: HTMLElement;
  private readonly campaign: CampaignDirectorV7;
  private callbacks: BroadcastChromeCallbacksV7;
  private readonly portraitLoadedCache = new Set<string>();

  private readonly rootEl: HTMLDivElement;
  private readonly topBugWrapEl: HTMLDivElement;
  private readonly playerBoxEl: HTMLDivElement;
  private readonly rivalBoxEl: HTMLDivElement;
  private readonly playerDrumEl: HTMLSpanElement;
  private readonly rivalDrumEl: HTMLSpanElement;
  private readonly playerDeltaPopEl: HTMLSpanElement;
  private readonly rivalDeltaPopEl: HTMLSpanElement;
  private readonly turnPillEl: HTMLDivElement;
  private readonly turnKickerEl: HTMLSpanElement;
  private readonly turnNumEl: HTMLSpanElement;
  private readonly streakChipEl: HTMLSpanElement;
  private readonly rivalNameFullEl: HTMLSpanElement;
  private readonly rivalNameShortEl: HTMLSpanElement;
  private readonly rivalMedallionEl: HTMLDivElement;
  private readonly rivalEmotionTextEl: HTMLSpanElement;
  private readonly vuMeterWrapEl: HTMLDivElement;
  private readonly vuNeedleLineEl: SVGLineElement;

  private readonly rightWingDockEl: HTMLDivElement;
  private readonly propsBtnEl: HTMLButtonElement;
  private readonly zoomPillEl: HTMLDivElement;
  private readonly arrestSwitchBtn: HTMLButtonElement;
  private readonly censorPaddleBtn: HTMLButtonElement;
  private readonly zoomReadoutBtn: HTMLButtonElement;
  private readonly fullscreenBugBtn: HTMLButtonElement;
  private readonly turboBugBtn: HTMLButtonElement;
  private readonly turboLabelEl: HTMLSpanElement;
  private readonly mobileMenuBtnEl: HTMLButtonElement;
  private readonly mobileHudDrawerEl: HTMLDivElement;
  private readonly mobileDrawerPropsBtnEl: HTMLButtonElement;
  private readonly mobileDrawerFullscreenBtnEl: HTMLButtonElement;
  private readonly hudActionStripEl: HTMLDivElement;
  private readonly mercyBellBtn: HTMLButtonElement;
  private readonly hotMicHudBtn: HTMLButtonElement;

  private readonly questionStageEl: HTMLDivElement;
  private readonly questionChassisEl: HTMLDivElement;
  private readonly twistFlareStripEl: HTMLDivElement;
  private readonly blitzHudBannerEl: HTMLDivElement;
  private readonly clueHeaderRowEl: HTMLDivElement;
  private readonly domainPillEl: HTMLSpanElement;
  private readonly clueStakesChipEl: HTMLSpanElement;
  private readonly clueTipBtnEl: HTMLButtonElement;
  private readonly clueTimerPillEl: HTMLSpanElement;
  private readonly blitzTimeDeltaEl: HTMLSpanElement;
  private readonly clueTimerBarFillEl: HTMLDivElement;
  private readonly hostDeskStripEl: HTMLDivElement;
  private readonly hostDeskAvatarEl: HTMLDivElement;
  private readonly hostDeskQuipEl: HTMLSpanElement;
  private readonly plainMicroTipEl: HTMLDivElement;
  private readonly clueStemKickerEl: HTMLDivElement;
  private readonly clueStemEl: HTMLParagraphElement;
  private readonly clueStakesMetaEl: HTMLDivElement;
  private readonly lifelineBarEl: HTMLDivElement;
  private readonly fiftyFiftyBtnEl: HTMLButtonElement;
  private readonly audiencePollBtnEl: HTMLButtonElement;
  private readonly freeSwapBtnEl: HTMLButtonElement;
  private readonly toyBayEl: HTMLDivElement;
  private readonly blitzPassBarEl: HTMLButtonElement;

  private readonly modalStageEl: HTMLDivElement;
  private readonly utilityModalStageEl: HTMLDivElement;
  private readonly liveToastEl: HTMLDivElement;
  private readonly rivalChyronEl: HTMLDivElement;
  private readonly boardModeRibbonEl: HTMLDivElement;
  private readonly boardModeTagEl: HTMLSpanElement;
  private readonly boardModeRuleEl: HTMLSpanElement;

  private activeUseFiftyFiftyHandler: (() => void) | null = null;
  private activeUseAudiencePollHandler: (() => void) | null = null;
  private activeUseFreeSwapHandler: (() => void) | null = null;
  private activeOpenQuestionCoachHandler: (() => void) | null = null;
  private activeNoTimerMode = false;
  private activeRivalSkipHandler: (() => void) | null = null;
  private cheatAndMicUnlocked = true;
  private propsUnlockedInMatch = true;
  private isQuickPlayMatch = false;
  private isDailyBroadcastMatch = false;

  private activeTimerHandle: number | null = null;
  private readonly activeFlowTimeouts = new Set<number>();
  private readonly activeFlowRafs = new Set<number>();
  private activeToastTimeout: number | null = null;
  private blitzDeltaTimeout: number | null = null;
  private blitzModeActive = false;
  private currentMercyBellState: 'NONE' | 'TKO_WIN' | 'CONCEDE_REMATCH' = 'NONE';
  private activeBoardModeFadeTimeout: number | null = null;
  private activeModalCleanup: (() => void) | null = null;
  private activeUtilityModalCleanup: (() => void) | null = null;
  private activeUtilityDismissCleanup: (() => void) | null = null;
  private readonly detachChromeListeners: Array<() => void> = [];
  private questionOpenedAtMs = 0;
  private sawFreshPointerDownInToyBay = false;
  private liveMatchScoreForShop: number | null = null;
  private currentRivalId: RivalIdV7 = 'CARMEN_DELGADO';
  private questionMaxCountdownSec = 30;
  private hasSyncedTopScoresOnce = false;
  private activeBoardModeBanner: {
    readonly modeTitle: string;
    readonly ruleSummary: string;
    readonly compactTitle?: string;
    readonly compactRuleSummary?: string;
  } | null = null;
  private activeBoardTwistId: BoardTwistIdV7 | null = null;
  private mobileHudMenuOpen = false;
  private boardModeRibbonAutoHidden = false;

  private readonly playerRoller: SolariRollerState = {
    displayed: 0,
    target: 0,
    lastFormatted: '$0',
    rafId: null,
    glowTimeout: null,
    deltaTimeout: null,
  };

  private readonly rivalRoller: SolariRollerState = {
    displayed: 0,
    target: 0,
    lastFormatted: '$0',
    rafId: null,
    glowTimeout: null,
    deltaTimeout: null,
  };

  constructor(
    host: HTMLElement,
    campaign: CampaignDirectorV7,
    callbacks: BroadcastChromeCallbacksV7 = {},
  ) {
    this.host = host;
    this.campaign = campaign;
    this.callbacks = callbacks;

    this.rootEl = document.createElement('div');
    this.rootEl.className = 'ws7-chrome-root';
    this.applySettingsAttributes(this.campaign.getState().settings);

    // ------------------------------------------------------------------------
    // 1. Flush <=56px 1966 Split-Flap Broadcast Header Ribbon
    // ------------------------------------------------------------------------
    this.topBugWrapEl = document.createElement('div');
    this.topBugWrapEl.className = 'ws7-top-bug-wrap ws7-hidden';

    const topBug = document.createElement('div');
    topBug.className = 'ws7-top-bug';
    topBug.setAttribute('role', 'region');
    topBug.setAttribute('aria-label', 'Live Broadcast Scoreboard');

    const solariPair = document.createElement('div');
    solariPair.className = 'ws7-solari-pair';

    // YOU Score (Peacock Teal Tally Bar + Mechanical Solari Split-Flap Drum)
    this.playerBoxEl = document.createElement('div');
    this.playerBoxEl.className = 'ws7-solari-box';
    this.playerBoxEl.dataset.side = 'player';
    const playerStack = document.createElement('div');
    playerStack.className = 'ws7-score-stack';
    const playerLabelRow = document.createElement('div');
    playerLabelRow.className = 'ws7-score-label-row';
    const playerTag = document.createElement('span');
    playerTag.className = 'ws7-solari-tag';
    playerTag.textContent = 'YOU';
    this.streakChipEl = document.createElement('span');
    this.streakChipEl.className = 'ws7-streak-chip';
    this.streakChipEl.dataset.active = 'false';
    this.streakChipEl.textContent = '🔥0';
    this.playerDeltaPopEl = document.createElement('span');
    this.playerDeltaPopEl.className = 'ws7-score-delta-pop';
    this.playerDeltaPopEl.dataset.side = 'player';
    playerLabelRow.append(playerTag, this.streakChipEl);
    this.playerDrumEl = document.createElement('span');
    this.playerDrumEl.className = 'ws7-solari-drum';
    this.renderSolariCharacters(this.playerDrumEl, '$0', '', false);
    playerStack.append(playerLabelRow, this.playerDrumEl);
    this.playerBoxEl.appendChild(playerStack);

    // Center Turn & Live 3-Act Broadcast Dial
    const turnDial = document.createElement('div');
    turnDial.className = 'ws7-turn-pill';
    turnDial.dataset.act = '1';
    this.turnPillEl = turnDial;
    this.turnKickerEl = document.createElement('span');
    this.turnKickerEl.className = 'ws7-turn-kicker';
    this.turnKickerEl.textContent = 'ACT I';
    this.turnNumEl = document.createElement('span');
    this.turnNumEl.className = 'ws7-turn-num';
    this.turnNumEl.textContent = '01/10';
    turnDial.append(this.turnKickerEl, this.turnNumEl);

    // CHAMPION Score (Tangerine Tally Bar + Proud Champion Name + 44px Painted Lens Avatar + 1-Tap Scouting Notebook!)
    this.rivalBoxEl = document.createElement('div');
    this.rivalBoxEl.className = 'ws7-solari-box';
    this.rivalBoxEl.dataset.side = 'rival';
    this.rivalBoxEl.title = 'Tap to inspect Champion Scouting Notebook & Dossier!';
    this.rivalBoxEl.setAttribute('role', 'button');
    this.rivalBoxEl.tabIndex = 0;
    this.rivalBoxEl.addEventListener('click', () => {
      if (!this.isUtilityModalOpen()) {
        this.openScoutingNotebookModal(this.currentRivalId);
      }
    });
    this.rivalBoxEl.addEventListener('keydown', (ev) => {
      if ((ev.key === 'Enter' || ev.key === ' ') && !this.isUtilityModalOpen()) {
        ev.preventDefault();
        this.openScoutingNotebookModal(this.currentRivalId);
      }
    });

    const rivalStack = document.createElement('div');
    rivalStack.className = 'ws7-score-stack';
    const rivalLabelRow = document.createElement('div');
    rivalLabelRow.className = 'ws7-score-label-row';
    const rivalTag = document.createElement('span');
    rivalTag.className = 'ws7-solari-tag';
    this.rivalNameFullEl = document.createElement('span');
    this.rivalNameFullEl.className = 'ws7-champ-name-full';
    this.rivalNameFullEl.textContent = 'CARMEN DELGADO';
    this.rivalNameShortEl = document.createElement('span');
    this.rivalNameShortEl.className = 'ws7-champ-name-short';
    this.rivalNameShortEl.textContent = 'CARMEN';
    rivalTag.append(this.rivalNameFullEl, this.rivalNameShortEl);
    this.rivalDeltaPopEl = document.createElement('span');
    this.rivalDeltaPopEl.className = 'ws7-score-delta-pop';
    this.rivalDeltaPopEl.dataset.side = 'rival';
    rivalLabelRow.append(rivalTag);
    this.rivalDrumEl = document.createElement('span');
    this.rivalDrumEl.className = 'ws7-solari-drum';
    this.renderSolariCharacters(this.rivalDrumEl, '$0', '', false);
    rivalStack.append(rivalLabelRow, this.rivalDrumEl);

    const rivalCluster = document.createElement('div');
    rivalCluster.className = 'ws7-rival-bug-cluster';
    this.rivalMedallionEl = document.createElement('div');
    this.rivalMedallionEl.className = 'ws7-gouache-medallion';
    this.rivalMedallionEl.dataset.emotion = 'POISED';
    this.rivalEmotionTextEl = document.createElement('span');
    this.rivalEmotionTextEl.className = 'ws7-scout-dossier-badge';
    this.rivalEmotionTextEl.innerHTML = `<span class="ws7-dossier-ico" aria-hidden="true">${SVG_DOSSIER_TAB_1966}</span><span class="ws7-dossier-txt"> DOSSIER</span>`;
    rivalCluster.append(this.rivalMedallionEl, this.rivalEmotionTextEl);

    this.rivalBoxEl.append(rivalStack, rivalCluster);
    solariPair.append(this.playerBoxEl, turnDial, this.rivalBoxEl);

    // Integrated Sleek Broadcast VU Needle Window (Desktop only)
    this.vuMeterWrapEl = document.createElement('div');
    this.vuMeterWrapEl.className = 'ws7-vu-meter';
    this.vuMeterWrapEl.dataset.peak = 'false';
    this.vuMeterWrapEl.title = 'Live Studio Broadcast Audio Level';

    const svgNs = 'http://www.w3.org/2000/svg';
    const vuSvg = document.createElementNS(svgNs, 'svg');
    vuSvg.setAttribute('viewBox', '0 0 54 28');
    vuSvg.setAttribute('class', 'ws7-vu-svg');

    const arcNormal = document.createElementNS(svgNs, 'path');
    arcNormal.setAttribute('d', 'M 6 23 A 21 21 0 0 1 38 7');
    arcNormal.setAttribute('fill', 'none');
    arcNormal.setAttribute('stroke', '#22c7d8');
    arcNormal.setAttribute('stroke-width', '2.2');
    arcNormal.setAttribute('stroke-linecap', 'round');

    const arcPeak = document.createElementNS(svgNs, 'path');
    arcPeak.setAttribute('d', 'M 38 7 A 21 21 0 0 1 48 23');
    arcPeak.setAttribute('fill', 'none');
    arcPeak.setAttribute('stroke', '#ff6738');
    arcPeak.setAttribute('stroke-width', '2.6');
    arcPeak.setAttribute('stroke-linecap', 'round');

    this.vuNeedleLineEl = document.createElementNS(svgNs, 'line');
    this.vuNeedleLineEl.setAttribute('x1', '27');
    this.vuNeedleLineEl.setAttribute('y1', '25');
    this.vuNeedleLineEl.setAttribute('x2', '15');
    this.vuNeedleLineEl.setAttribute('y2', '10');
    this.vuNeedleLineEl.setAttribute('stroke', '#ffd56b');
    this.vuNeedleLineEl.setAttribute('stroke-width', '2');
    this.vuNeedleLineEl.setAttribute('stroke-linecap', 'round');

    const pivotDot = document.createElementNS(svgNs, 'circle');
    pivotDot.setAttribute('cx', '27');
    pivotDot.setAttribute('cy', '25');
    pivotDot.setAttribute('r', '2.6');
    pivotDot.setAttribute('fill', '#f4a91f');

    vuSvg.append(arcNormal, arcPeak, this.vuNeedleLineEl, pivotDot);

    const peakLamp = document.createElement('span');
    peakLamp.className = 'ws7-vu-peak-lamp';
    this.vuMeterWrapEl.append(vuSvg, peakLamp);

    // Clean Integrated Actions (>= 48x48px Touch Targets!)
    const bugActions = document.createElement('div');
    bugActions.className = 'ws7-bug-actions';

    const makeRibbonBtn = (
      icon: string,
      label: string,
      actionKey: string,
      title: string,
      mobileDrawerOnly: boolean = false,
      goldAccent: boolean = false,
    ): HTMLButtonElement => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ws7-thumb-btn';
      btn.dataset.action = actionKey;
      if (mobileDrawerOnly) btn.dataset.mobileDrawer = 'true';
      if (goldAccent) btn.dataset.accent = 'gold';
      btn.title = title;
      btn.innerHTML = `<span class="ws7-thumb-icon" aria-hidden="true">${icon}</span><span>${label}</span>`;
      return btn;
    };

    const openRulesSheet = (): void => {
      this.setMobileHudMenuOpen(false);
      if (this.callbacks.onOpenHowToPlay) {
        this.callbacks.onOpenHowToPlay();
      } else {
        this.openHowToPlayModal();
      }
    };
    const openPropsSheet = (): void => {
      this.setMobileHudMenuOpen(false);
      this.openPropTrunkModal(this.liveMatchScoreForShop !== null);
    };
    const openSoundSheet = (): void => {
      this.setMobileHudMenuOpen(false);
      this.openSettingsModal();
    };
    const triggerReturnHub = (): void => {
      this.setMobileHudMenuOpen(false);
      if (this.callbacks.onReturnToTitleHub) {
        this.callbacks.onReturnToTitleHub();
      } else {
        this.showTitleHub();
      }
    };
    const triggerFullscreen = (): void => {
      this.setMobileHudMenuOpen(false);
      if (this.callbacks.onToggleFullscreen) {
        this.callbacks.onToggleFullscreen();
      } else {
        void this.handleFullscreenToggle();
      }
    };

    const rulesBtn = makeRibbonBtn(
      '?',
      'RULES',
      'rules',
      'How to Play — Board Rules, TV Twists & Scoring',
      true,
      true,
    );
    rulesBtn.addEventListener('click', openRulesSheet);

    const propsBtn = makeRibbonBtn(
      '★',
      'PROPS',
      'props',
      'Studio Prop Trunk — Equip Passive Score Boosters',
      true,
    );
    this.propsBtnEl = propsBtn;
    propsBtn.addEventListener('click', openPropsSheet);

    const soundBtn = makeRibbonBtn(
      '♪',
      'SOUND',
      'sound',
      'Sound Mixer, Accessibility & Studio Menu',
      true,
    );
    soundBtn.addEventListener('click', openSoundSheet);

    const hubBtn = makeRibbonBtn(
      '⌂',
      'HUB',
      'hub',
      'Return to 1966 Title Hub',
      true,
    );
    hubBtn.addEventListener('click', triggerReturnHub);

    this.fullscreenBugBtn = makeRibbonBtn(
      '⛶',
      'FULL',
      'fullscreen',
      'Toggle Full Screen (F)',
      true,
    );
    this.fullscreenBugBtn.dataset.compactHide = 'true';
    this.fullscreenBugBtn.addEventListener('click', triggerFullscreen);

    this.mobileMenuBtnEl = makeRibbonBtn(
      '☰',
      'MENU',
      'hud-menu',
      'Broadcast Rules, Props, Sound & Studio Menu',
      false,
      true,
    );
    this.mobileMenuBtnEl.classList.add('ws7-hud-menu-btn');
    this.mobileMenuBtnEl.setAttribute('aria-haspopup', 'menu');
    this.mobileMenuBtnEl.setAttribute('aria-expanded', 'false');
    this.mobileMenuBtnEl.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.setMobileHudMenuOpen(!this.mobileHudMenuOpen);
    });

    this.turboBugBtn = document.createElement('button');
    this.turboBugBtn.type = 'button';
    this.turboBugBtn.className = 'ws9-turbo-pill';
    this.turboBugBtn.dataset.action = 'turbo';
    this.turboBugBtn.dataset.active = 'false';
    this.turboBugBtn.setAttribute('aria-label', 'Toggle 0.4s Turbo Rival Turn Speed');
    this.turboBugBtn.setAttribute('aria-pressed', 'false');
    this.turboBugBtn.title = 'Toggle 0.4s Turbo Rival Turn Speed';
    const turboIcoEl = document.createElement('span');
    turboIcoEl.className = 'ws9-turbo-ico';
    turboIcoEl.setAttribute('aria-hidden', 'true');
    turboIcoEl.textContent = '⚡';
    this.turboLabelEl = document.createElement('span');
    this.turboLabelEl.className = 'ws9-turbo-label';
    this.turboLabelEl.textContent = ' TURBO';
    this.turboBugBtn.append(turboIcoEl, this.turboLabelEl);
    this.turboBugBtn.addEventListener('click', () => {
      this.callbacks.onToggleTurbo?.();
    });

    bugActions.append(
      this.turboBugBtn,
      rulesBtn,
      propsBtn,
      soundBtn,
      this.fullscreenBugBtn,
      hubBtn,
      this.mobileMenuBtnEl,
    );
    topBug.append(solariPair, this.vuMeterWrapEl, bugActions);

    this.mobileHudDrawerEl = document.createElement('div');
    this.mobileHudDrawerEl.className = 'ws7-mobile-hud-drawer ws7-hidden';
    this.mobileHudDrawerEl.setAttribute('role', 'menu');
    this.mobileHudDrawerEl.setAttribute('aria-label', 'Studio Menu');

    const makeDrawerItem = (
      icon: string,
      label: string,
      actionKey: string,
      onClick: () => void,
      accent?: 'gold',
    ): HTMLButtonElement => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ws7-mobile-drawer-btn';
      btn.setAttribute('role', 'menuitem');
      btn.dataset.action = actionKey;
      if (accent) btn.dataset.accent = accent;
      btn.innerHTML = `<span aria-hidden="true">${icon}</span><span>${label}</span>`;
      btn.addEventListener('click', onClick);
      return btn;
    };

    const drawerRulesBtn = makeDrawerItem('?', 'HOW TO PLAY & TWIST RULES', 'rules', openRulesSheet, 'gold');
    this.mobileDrawerPropsBtnEl = makeDrawerItem('★', 'STUDIO PROP SHOP', 'props', openPropsSheet);
    const drawerSoundBtn = makeDrawerItem('♪', 'SOUND & ACCESSIBILITY', 'sound', openSoundSheet);
    this.mobileDrawerFullscreenBtnEl = makeDrawerItem('⛶', 'FULL SCREEN', 'fullscreen', triggerFullscreen);
    const drawerHubBtn = makeDrawerItem('⌂', 'RETURN TO HUB', 'hub', triggerReturnHub);
    this.mobileHudDrawerEl.append(
      drawerRulesBtn,
      this.mobileDrawerPropsBtnEl,
      drawerSoundBtn,
      this.mobileDrawerFullscreenBtnEl,
      drawerHubBtn,
    );
    this.syncFullscreenButtonState();

    const closeDrawerOnOutside = (ev: PointerEvent): void => {
      if (!this.mobileHudMenuOpen) return;
      const target = ev.target as Node | null;
      if (target && !this.topBugWrapEl.contains(target)) {
        this.setMobileHudMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeDrawerOnOutside);
    this.detachChromeListeners.push(() => {
      document.removeEventListener('pointerdown', closeDrawerOnOutside);
    });

    this.hudActionStripEl = document.createElement('div');
    this.hudActionStripEl.className = 'ws9-hud-action-strip ws7-hidden';

    this.mercyBellBtn = document.createElement('button');
    this.mercyBellBtn.type = 'button';
    this.mercyBellBtn.className = 'ws9-mercy-bell-pill ws7-hidden';
    this.mercyBellBtn.dataset.mode = 'NONE';
    this.mercyBellBtn.addEventListener('click', () => {
      if (this.currentMercyBellState === 'TKO_WIN') {
        this.callbacks.onTriggerTkoWin?.();
      } else if (this.currentMercyBellState === 'CONCEDE_REMATCH') {
        this.callbacks.onConcedeRematch?.();
      }
    });

    this.hotMicHudBtn = document.createElement('button');
    this.hotMicHudBtn.type = 'button';
    this.hotMicHudBtn.className = 'ws9-hotmic-hud-btn ws7-hidden';
    this.hotMicHudBtn.dataset.armed = 'false';
    this.hotMicHudBtn.textContent = '🔥 PASS THE HOT MIC!';
    this.hotMicHudBtn.addEventListener('click', () => {
      if (this.hotMicHudBtn.disabled) return;
      this.callbacks.onArmHotMic?.();
    });

    this.hudActionStripEl.append(this.mercyBellBtn, this.hotMicHudBtn);
    this.topBugWrapEl.append(
      topBug,
      this.hudActionStripEl,
      this.mobileHudDrawerEl,
      this.playerDeltaPopEl,
      this.rivalDeltaPopEl,
    );

    // ------------------------------------------------------------------------
    // 2. Live-Event Controls (Zero Board Overlap on Mobile & Tablet!)
    // ------------------------------------------------------------------------
    this.rightWingDockEl = document.createElement('div');
    this.rightWingDockEl.className = 'ws7-right-wing-dock ws7-hidden';

    this.arrestSwitchBtn = document.createElement('button');
    this.arrestSwitchBtn.type = 'button';
    this.arrestSwitchBtn.className = 'ws7-arrest-switch';
    this.arrestSwitchBtn.dataset.tellLive = 'false';
    this.arrestSwitchBtn.title =
      'Tap when your Rival flashes LIVE TELL to bust Control Booth cheating (+$150–$300 Clean Purse)!';
    this.arrestSwitchBtn.innerHTML =
      '<span>CATCH CHEAT</span><span class="ws7-dock-sub">Wait for Tell</span>';
    this.arrestSwitchBtn.addEventListener('click', () => {
      this.callbacks.onBoothArrestPressed?.();
    });

    this.censorPaddleBtn = document.createElement('button');
    this.censorPaddleBtn.type = 'button';
    this.censorPaddleBtn.className = 'ws7-censor-paddle';
    this.censorPaddleBtn.dataset.held = 'false';
    this.censorPaddleBtn.dataset.locked = 'false';
    this.censorPaddleBtn.dataset.sabotageActive = 'false';
    this.censorPaddleBtn.title =
      'Hold 2 seconds during late-game sabotage to lock Mic Shield (+$250 win bonus)!';
    this.censorPaddleBtn.innerHTML =
      '<span>MIC SHIELD</span><span class="ws7-dock-sub">Hold to Protect</span>';

    const setPaddleHeld = (held: boolean): void => {
      if (this.censorPaddleBtn.dataset.held === String(held)) return;
      this.censorPaddleBtn.dataset.held = String(held);
      this.callbacks.onCensorPaddleStateChange?.(held);
    };
    this.censorPaddleBtn.addEventListener('pointerdown', () => setPaddleHeld(true));
    this.censorPaddleBtn.addEventListener('pointerup', () => setPaddleHeld(false));
    this.censorPaddleBtn.addEventListener('pointerleave', () => setPaddleHeld(false));
    this.censorPaddleBtn.addEventListener('pointercancel', () => setPaddleHeld(false));

    this.zoomPillEl = document.createElement('div');
    this.zoomPillEl.className = 'ws7-zoom-pill';
    this.zoomPillEl.dataset.zoomed = 'false';
    this.zoomPillEl.setAttribute('role', 'group');
    this.zoomPillEl.setAttribute('aria-label', '3D Board Zoom Controls');

    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.type = 'button';
    zoomOutBtn.className = 'ws7-zoom-step-btn';
    zoomOutBtn.textContent = '−';
    zoomOutBtn.title = 'Zoom Out 3D Board';
    zoomOutBtn.addEventListener('click', () => {
      this.callbacks.onAdjustBoardZoom?.(-0.25);
    });

    this.zoomReadoutBtn = document.createElement('button');
    this.zoomReadoutBtn.type = 'button';
    this.zoomReadoutBtn.className = 'ws7-zoom-reset-btn';
    this.zoomReadoutBtn.textContent = '1.0x';
    this.zoomReadoutBtn.title = 'Reset Board Zoom & Pan';
    this.zoomReadoutBtn.addEventListener('click', () => {
      this.callbacks.onAdjustBoardZoom?.('RESET');
    });

    const zoomInBtn = document.createElement('button');
    zoomInBtn.type = 'button';
    zoomInBtn.className = 'ws7-zoom-step-btn';
    zoomInBtn.textContent = '+';
    zoomInBtn.title = 'Zoom In 3D Board';
    zoomInBtn.addEventListener('click', () => {
      this.callbacks.onAdjustBoardZoom?.(0.3);
    });

    this.zoomPillEl.append(zoomOutBtn, this.zoomReadoutBtn, zoomInBtn);
    this.rightWingDockEl.append(this.zoomPillEl, this.arrestSwitchBtn, this.censorPaddleBtn);

    // ------------------------------------------------------------------------
    // 3. Monolithic 1966 RCA Studio Cue-Card & Question Monitor + Twist Flares
    // ------------------------------------------------------------------------
    this.questionStageEl = document.createElement('div');
    this.questionStageEl.className = 'ws7-question-stage ws7-hidden';

    this.questionChassisEl = document.createElement('div');
    this.questionChassisEl.className = 'ws7-question-chassis';
    this.questionChassisEl.dataset.twist = 'NONE';
    this.questionChassisEl.setAttribute('role', 'dialog');
    this.questionChassisEl.setAttribute('aria-label', 'Studio Question Monitor');

    const vellumPane = document.createElement('div');
    vellumPane.className = 'ws7-clue-vellum-pane';

    // Dramatic Flush TV Twist Flare Strip (Hidden on standard questions!)
    this.twistFlareStripEl = document.createElement('div');
    this.twistFlareStripEl.className = 'ws7-twist-flare-strip ws7-hidden';
    this.twistFlareStripEl.dataset.twist = 'NONE';

    this.blitzHudBannerEl = document.createElement('div');
    this.blitzHudBannerEl.className = 'ws9-blitz-hud ws7-hidden';

    this.clueHeaderRowEl = document.createElement('div');
    this.clueHeaderRowEl.className = 'ws7-clue-header-row';
    this.clueHeaderRowEl.dataset.flare = 'false';

    this.domainPillEl = document.createElement('span');
    this.domainPillEl.className = 'ws7-domain-pill';

    const headerRight = document.createElement('div');
    headerRight.className = 'ws7-header-right-cluster';

    this.clueStakesChipEl = document.createElement('span');
    this.clueStakesChipEl.className = 'ws7-clue-stakes-chip';

    this.clueTipBtnEl = document.createElement('button');
    this.clueTipBtnEl.type = 'button';
    this.clueTipBtnEl.className = 'ws7-clue-tip-btn ws7-hidden';
    this.clueTipBtnEl.title = 'Pause clock & see how this question type works';
    this.clueTipBtnEl.textContent = '? TIP';
    this.clueTipBtnEl.addEventListener('click', () => {
      this.activeOpenQuestionCoachHandler?.();
    });

    this.clueTimerPillEl = document.createElement('span');
    this.clueTimerPillEl.className = 'ws7-clue-timer-pill';
    this.clueTimerPillEl.textContent = '30s';

    this.blitzTimeDeltaEl = document.createElement('span');
    this.blitzTimeDeltaEl.className = 'ws9-blitz-delta-burst ws7-hidden';
    this.blitzTimeDeltaEl.dataset.kind = 'gain';

    headerRight.append(
      this.clueStakesChipEl,
      this.clueTipBtnEl,
      this.clueTimerPillEl,
      this.blitzTimeDeltaEl,
    );
    this.clueHeaderRowEl.append(this.domainPillEl, headerRight);

    const timerTrack = document.createElement('div');
    timerTrack.className = 'ws7-timer-bar-track';
    this.clueTimerBarFillEl = document.createElement('div');
    this.clueTimerBarFillEl.className = 'ws7-timer-bar-fill';
    this.clueTimerBarFillEl.dataset.phase = 'calm';
    timerTrack.appendChild(this.clueTimerBarFillEl);

    // Compact 34px Live Host Grant Bellamy Desk Strip (Zero-Scroll on 390x660!)
    this.hostDeskStripEl = document.createElement('div');
    this.hostDeskStripEl.className = 'ws7-host-desk-strip';
    this.hostDeskStripEl.dataset.locked = 'false';

    this.hostDeskAvatarEl = document.createElement('div');
    this.hostDeskAvatarEl.className = 'ws7-host-desk-avatar';
    this.hostDeskAvatarEl.style.backgroundImage = `url("${EMCEE_MEDALLION_ASSET_V7}")`;
    this.hostDeskAvatarEl.style.backgroundSize = '200% 200%';
    this.hostDeskAvatarEl.style.backgroundPosition = EMCEE_SPRITE_POSITIONS_V7.POISED;

    const hostTagEl = document.createElement('span');
    hostTagEl.className = 'ws7-host-desk-tag';
    hostTagEl.textContent = 'GRANT:';

    this.hostDeskQuipEl = document.createElement('span');
    this.hostDeskQuipEl.className = 'ws7-host-desk-quip';
    this.hostDeskQuipEl.textContent = 'Eyes on the cue card—thirty seconds on the studio clock!';

    this.hostDeskStripEl.append(this.hostDeskAvatarEl, hostTagEl, this.hostDeskQuipEl);

    const clueBody = document.createElement('div');
    clueBody.className = 'ws7-clue-body';

    this.plainMicroTipEl = document.createElement('div');
    this.plainMicroTipEl.className = 'ws7-plain-micro-tip ws7-hidden';

    this.clueStemKickerEl = document.createElement('div');
    this.clueStemKickerEl.className = 'ws7-stem-kicker-pill ws7-hidden';

    this.clueStemEl = document.createElement('p');
    this.clueStemEl.className = 'ws7-balanced-copy';

    this.clueStakesMetaEl = document.createElement('div');
    this.clueStakesMetaEl.className = 'ws7-clue-meta-line';

    clueBody.append(
      this.plainMicroTipEl,
      this.clueStemKickerEl,
      this.clueStemEl,
      this.clueStakesMetaEl,
    );

    // Unmissable 3-Paddle Illuminated "STUDIO CHEATS" Console (✂️ 50/50 Cut · 📊 Ask Audience · 🔄 Free Swap)
    this.lifelineBarEl = document.createElement('div');
    this.lifelineBarEl.className = 'ws7-lifeline-bar';
    this.lifelineBarEl.dataset.cols = '3';

    const cheatsHead = document.createElement('div');
    cheatsHead.className = 'ws7-lifeline-console-head';
    cheatsHead.innerHTML =
      '<span class="ws7-lifeline-console-kicker"><span class="ws7-lifeline-console-dot" aria-hidden="true"></span><span>STUDIO CHEATS · 1 USE EACH PER SHOW</span></span>';

    const paddlesGrid = document.createElement('div');
    paddlesGrid.className = 'ws7-lifeline-paddles-grid';

    this.fiftyFiftyBtnEl = document.createElement('button');
    this.fiftyFiftyBtnEl.type = 'button';
    this.fiftyFiftyBtnEl.className = 'ws7-lifeline-btn';
    this.fiftyFiftyBtnEl.dataset.lifeline = 'fifty-fifty';
    this.fiftyFiftyBtnEl.addEventListener('click', () => {
      if (this.fiftyFiftyBtnEl.disabled) return;
      this.activeUseFiftyFiftyHandler?.();
    });

    this.audiencePollBtnEl = document.createElement('button');
    this.audiencePollBtnEl.type = 'button';
    this.audiencePollBtnEl.className = 'ws7-lifeline-btn';
    this.audiencePollBtnEl.dataset.lifeline = 'audience-poll';
    this.audiencePollBtnEl.addEventListener('click', () => {
      if (this.audiencePollBtnEl.disabled) return;
      this.activeUseAudiencePollHandler?.();
    });

    this.freeSwapBtnEl = document.createElement('button');
    this.freeSwapBtnEl.type = 'button';
    this.freeSwapBtnEl.className = 'ws7-lifeline-btn';
    this.freeSwapBtnEl.dataset.lifeline = 'free-swap';
    this.freeSwapBtnEl.addEventListener('click', () => {
      if (this.freeSwapBtnEl.disabled) return;
      this.activeUseFreeSwapHandler?.();
    });

    paddlesGrid.append(this.fiftyFiftyBtnEl, this.audiencePollBtnEl, this.freeSwapBtnEl);
    this.lifelineBarEl.append(cheatsHead, paddlesGrid);
    vellumPane.append(
      this.twistFlareStripEl,
      this.blitzHudBannerEl,
      this.clueHeaderRowEl,
      timerTrack,
      this.hostDeskStripEl,
      clueBody,
      this.lifelineBarEl,
    );

    this.toyBayEl = document.createElement('div');
    this.toyBayEl.className = 'ws7-toy-bay';
    this.toyBayEl.id = 'ws7-toy-mount';

    this.blitzPassBarEl = document.createElement('button');
    this.blitzPassBarEl.type = 'button';
    this.blitzPassBarEl.className = 'ws9-blitz-pass-bar ws7-hidden';
    this.blitzPassBarEl.dataset.action = 'blitz-pass';
    this.blitzPassBarEl.textContent = '⏭ PASS — NEXT CLUE';
    this.blitzPassBarEl.addEventListener('click', () => {
      if (this.blitzPassBarEl.disabled) return;
      this.callbacks.onBlitzPass?.();
    });

    // Capture-phase anti-bleed gate: prevents trailing `click`/`pointerup` from a 3D board tile tap
    // from ever auto-answering a newly mounted question before a fresh pointerdown inside `toyBayEl`!
    const onToyPointerDownCapture = (ev: PointerEvent): void => {
      const elapsed =
        typeof performance !== 'undefined' ? performance.now() - this.questionOpenedAtMs : 999;
      if (elapsed < 220) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        return;
      }
      this.sawFreshPointerDownInToyBay = true;
    };
    const onToyClickCapture = (ev: MouseEvent): void => {
      const elapsed =
        typeof performance !== 'undefined' ? performance.now() - this.questionOpenedAtMs : 999;
      // `ev.detail === 0` indicates keyboard Enter/Space or synthetic keyboard shortcut `.click()`;
      // `ev.detail > 0` is a physical mouse/touch/pen click and MUST have started inside `toyBayEl`!
      if (elapsed < 220 || (ev.detail > 0 && !this.sawFreshPointerDownInToyBay)) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
      }
    };
    this.toyBayEl.addEventListener('pointerdown', onToyPointerDownCapture, true);
    this.toyBayEl.addEventListener('click', onToyClickCapture, true);
    this.detachChromeListeners.push(() => {
      this.toyBayEl.removeEventListener('pointerdown', onToyPointerDownCapture, true);
      this.toyBayEl.removeEventListener('click', onToyClickCapture, true);
    });

    if (typeof document !== 'undefined') {
      const onFsChange = (): void => {
        this.syncFullscreenButtonState();
      };
      document.addEventListener('fullscreenchange', onFsChange);
      document.addEventListener('webkitfullscreenchange', onFsChange as EventListener);
      this.detachChromeListeners.push(() => {
        document.removeEventListener('fullscreenchange', onFsChange);
        document.removeEventListener('webkitfullscreenchange', onFsChange as EventListener);
      });
    }

    this.questionChassisEl.append(vellumPane, this.toyBayEl, this.blitzPassBarEl);
    this.questionStageEl.appendChild(this.questionChassisEl);

    // ------------------------------------------------------------------------
    // 4. Sculpted Modal Stage & Broadcast Chyron Toast
    // ------------------------------------------------------------------------
    this.modalStageEl = document.createElement('div');
    this.modalStageEl.className = 'ws7-eye-stage ws7-hidden';
    this.modalStageEl.dataset.topBugOpen = 'false';

    this.utilityModalStageEl = document.createElement('div');
    this.utilityModalStageEl.className = 'ws7-eye-stage ws7-utility-stage ws7-hidden';
    this.utilityModalStageEl.dataset.topBugOpen = 'false';

    this.liveToastEl = document.createElement('div');
    this.liveToastEl.className = 'ws7-live-toast-pill ws7-hidden';
    this.liveToastEl.dataset.tone = 'brass';
    this.liveToastEl.setAttribute('role', 'status');
    this.liveToastEl.setAttribute('aria-live', 'polite');

    this.rivalChyronEl = document.createElement('div');
    this.rivalChyronEl.className = 'ws7-rival-chyron ws7-hidden';
    this.rivalChyronEl.dataset.tone = 'neutral';
    this.rivalChyronEl.setAttribute('role', 'status');
    this.rivalChyronEl.addEventListener('click', () => {
      this.activeRivalSkipHandler?.();
    });

    this.boardModeRibbonEl = document.createElement('div');
    this.boardModeRibbonEl.className = 'ws7-board-mode-ribbon ws7-hidden';
    this.boardModeRibbonEl.setAttribute('role', 'status');
    this.boardModeTagEl = document.createElement('span');
    this.boardModeTagEl.className = 'ws7-board-mode-tag';
    this.boardModeRuleEl = document.createElement('span');
    this.boardModeRuleEl.className = 'ws7-board-mode-rule';
    this.boardModeRibbonEl.append(this.boardModeTagEl, this.boardModeRuleEl);

    this.rootEl.append(
      this.topBugWrapEl,
      this.rightWingDockEl,
      this.boardModeRibbonEl,
      this.rivalChyronEl,
      this.liveToastEl,
      this.questionStageEl,
      this.modalStageEl,
      this.utilityModalStageEl,
    );
    this.host.appendChild(this.rootEl);

    this.bindPortraitAsset(this.rivalMedallionEl, 'CARMEN_DELGADO', 'POISED');
  }

  public setCallbacks(callbacks: BroadcastChromeCallbacksV7): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public dispose(): void {
    this.hideUtilityModalStage();
    this.hideModalStage();
    for (const unsub of this.detachChromeListeners) {
      unsub();
    }
    this.detachChromeListeners.length = 0;
    if (this.activeToastTimeout !== null) {
      window.clearTimeout(this.activeToastTimeout);
      this.activeToastTimeout = null;
    }
    if (this.activeBoardModeFadeTimeout !== null) {
      window.clearTimeout(this.activeBoardModeFadeTimeout);
      this.activeBoardModeFadeTimeout = null;
    }
    this.cancelSolariRollers();
    this.rootEl.remove();
  }

  private setMobileHudMenuOpen(open: boolean): void {
    this.mobileHudMenuOpen = open;
    this.mobileHudDrawerEl.classList.toggle('ws7-hidden', !open);
    this.mobileMenuBtnEl.setAttribute('aria-expanded', open ? 'true' : 'false');
    this.mobileMenuBtnEl.dataset.active = open ? 'true' : 'false';
  }

  public syncFullscreenButtonState(): void {
    const active = isDocumentFullscreenV7();
    const bugBtn = this.fullscreenBugBtn as HTMLButtonElement | undefined;
    if (bugBtn?.dataset) {
      bugBtn.dataset.active = active ? 'true' : 'false';
      bugBtn.innerHTML = active
        ? `<span class="ws7-thumb-icon" aria-hidden="true">🗗</span><span>EXIT</span>`
        : `<span class="ws7-thumb-icon" aria-hidden="true">⛶</span><span>FULL</span>`;
      bugBtn.title = active ? 'Exit Full Screen (Esc / F)' : 'Enter Full Screen (F)';
    }
    const drawerFsBtn = this.mobileDrawerFullscreenBtnEl as HTMLButtonElement | undefined;
    if (drawerFsBtn?.dataset) {
      drawerFsBtn.dataset.active = active ? 'true' : 'false';
      drawerFsBtn.innerHTML = active
        ? `<span aria-hidden="true">🗗</span><span>EXIT FULL SCREEN</span>`
        : `<span aria-hidden="true">⛶</span><span>FULL SCREEN</span>`;
    }
  }

  public async handleFullscreenToggle(): Promise<void> {
    const res = await toggleDocumentFullscreenV7();
    this.syncFullscreenButtonState();
    if (!res.ok && res.reason === 'UNSUPPORTED_IOS') {
      this.showLiveToast(
        'IPHONE FULL SCREEN: Tap Safari Share → “Add to Home Screen” for full-screen TV mode!',
        'brass',
        3400,
      );
    }
  }

  // --------------------------------------------------------------------------
  // Mechanical Solari Split-Flap Digit Roller
  // --------------------------------------------------------------------------

  private cancelSolariRollers(): void {
    for (const roller of [this.playerRoller, this.rivalRoller]) {
      if (roller.rafId !== null) {
        window.cancelAnimationFrame(roller.rafId);
        roller.rafId = null;
      }
      if (roller.glowTimeout !== null) {
        window.clearTimeout(roller.glowTimeout);
        roller.glowTimeout = null;
      }
      if (roller.deltaTimeout !== null) {
        window.clearTimeout(roller.deltaTimeout);
        roller.deltaTimeout = null;
      }
    }
  }

  private renderSolariCharacters(
    drumEl: HTMLSpanElement,
    formatted: string,
    prevFormatted: string,
    animateChangedChars: boolean,
  ): void {
    drumEl.innerHTML = '';
    const lenDiff = formatted.length - prevFormatted.length;
    for (let i = 0; i < formatted.length; i += 1) {
      const ch = formatted[i];
      const prevIdx = i - lenDiff;
      const prevCh = prevIdx >= 0 && prevIdx < prevFormatted.length ? prevFormatted[prevIdx] : '';
      const span = document.createElement('span');
      span.className =
        animateChangedChars && ch !== prevCh
          ? 'ws7-flap-char ws7-flap-kick'
          : 'ws7-flap-char';
      span.textContent = ch;
      drumEl.appendChild(span);
    }
  }

  private animateSolariScore(
    roller: SolariRollerState,
    drumEl: HTMLSpanElement,
    boxEl: HTMLDivElement,
    deltaPopEl: HTMLSpanElement,
    nextRaw: number,
    allowAnimate: boolean,
  ): void {
    const nextValue = Math.max(0, Math.floor(nextRaw));
    const reducedMotion = this.campaign.getState().settings.reducedMotion;

    if (!allowAnimate || reducedMotion || nextValue === roller.target) {
      if (roller.rafId !== null) {
        window.cancelAnimationFrame(roller.rafId);
        roller.rafId = null;
      }
      roller.displayed = nextValue;
      roller.target = nextValue;
      const fmt = `$${nextValue.toLocaleString()}`;
      if (fmt !== roller.lastFormatted) {
        this.renderSolariCharacters(drumEl, fmt, roller.lastFormatted, false);
        roller.lastFormatted = fmt;
      }
      return;
    }

    const startValue = roller.displayed;
    const delta = nextValue - roller.target;
    roller.target = nextValue;

    // Trigger glowing studio tally bar & transient delta pop (+$350 / -$100)
    if (delta !== 0) {
      boxEl.dataset.scoring = delta > 0 ? 'up' : 'down';
      if (roller.glowTimeout !== null) window.clearTimeout(roller.glowTimeout);
      roller.glowTimeout = window.setTimeout(() => {
        delete boxEl.dataset.scoring;
        roller.glowTimeout = null;
      }, 760);

      deltaPopEl.dataset.sign = delta > 0 ? 'pos' : 'neg';
      deltaPopEl.textContent =
        delta > 0 ? `+$${delta.toLocaleString()}` : `-$${Math.abs(delta).toLocaleString()}`;
      if (typeof window !== 'undefined') {
        const rect = boxEl.getBoundingClientRect();
        if (rect.width > 0) {
          const clampedLeft = Math.max(8, Math.min(window.innerWidth - 96, Math.round(rect.left + 4)));
          deltaPopEl.style.left = `${clampedLeft}px`;
          deltaPopEl.style.top = `${Math.max(46, Math.round(rect.bottom + 3))}px`;
        }
      }
      deltaPopEl.dataset.show = 'false';
      void deltaPopEl.offsetWidth; // restart keyframe cleanly
      deltaPopEl.dataset.show = 'true';
      if (roller.deltaTimeout !== null) window.clearTimeout(roller.deltaTimeout);
      roller.deltaTimeout = window.setTimeout(() => {
        deltaPopEl.dataset.show = 'false';
        roller.deltaTimeout = null;
      }, 1200);
    }

    if (roller.rafId !== null) {
      window.cancelAnimationFrame(roller.rafId);
      roller.rafId = null;
    }

    const startTime = performance.now();
    const durationMs = Math.min(680, Math.max(360, Math.abs(nextValue - startValue) * 0.85));
    let lastFlipStepMs = 0;

    const tick = (now: number): void => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = t >= 1 ? nextValue : Math.round(startValue + (nextValue - startValue) * eased);
      roller.displayed = cur;

      // Throttle mechanical split-flap DOM kicks to ~14fps so flaps read crisply!
      if (t >= 1 || now - lastFlipStepMs >= 68) {
        lastFlipStepMs = now;
        const fmt = `$${cur.toLocaleString()}`;
        if (fmt !== roller.lastFormatted) {
          this.renderSolariCharacters(drumEl, fmt, roller.lastFormatted, true);
          roller.lastFormatted = fmt;
        }
      }

      if (t < 1) {
        roller.rafId = window.requestAnimationFrame(tick);
      } else {
        roller.rafId = null;
      }
    };

    roller.rafId = window.requestAnimationFrame(tick);
  }

  // --------------------------------------------------------------------------
  // Top Broadcast Ribbon, Analog VU Needle, Lens Portraits & Live Controls
  // --------------------------------------------------------------------------

  public setProgressiveUnlocks(opts: {
    readonly showPropsButton: boolean;
    readonly showCheatAndMicControls: boolean;
    readonly isQuickPlay?: boolean;
    readonly isDailyBroadcast?: boolean;
  }): void {
    this.propsUnlockedInMatch = opts.showPropsButton;
    this.isQuickPlayMatch = Boolean(opts.isQuickPlay);
    this.isDailyBroadcastMatch = Boolean(opts.isDailyBroadcast);
    this.propsBtnEl.classList.toggle('ws7-hidden', !opts.showPropsButton);
    this.mobileDrawerPropsBtnEl.classList.toggle('ws7-hidden', !opts.showPropsButton);
    this.cheatAndMicUnlocked = opts.showCheatAndMicControls;
    this.arrestSwitchBtn.classList.toggle('ws7-hidden', !opts.showCheatAndMicControls);
    this.censorPaddleBtn.classList.toggle(
      'ws7-hidden',
      this.blitzModeActive || !opts.showCheatAndMicControls,
    );
  }

  public showTopBroadcastBug(
    visible: boolean = true,
    showRightWingControls: boolean = true,
  ): void {
    this.topBugWrapEl.classList.toggle('ws7-hidden', !visible);
    this.rightWingDockEl.classList.toggle(
      'ws7-hidden',
      !(visible && showRightWingControls && this.cheatAndMicUnlocked),
    );
    this.modalStageEl.dataset.topBugOpen = visible ? 'true' : 'false';
    this.utilityModalStageEl.dataset.topBugOpen = visible ? 'true' : 'false';
    if (!visible) {
      this.setMobileHudMenuOpen(false);
      this.liveToastEl.classList.add('ws7-hidden');
      this.rivalChyronEl.classList.add('ws7-hidden');
      this.hasSyncedTopScoresOnce = false;
      this.liveMatchScoreForShop = null;
    }
    this.syncBoardModeRibbonVisibility();
  }

  public showRivalTurnChyron(spec: RivalTurnChyronSpecV7): void {
    const profile = CAST_PROFILES_V7[spec.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    this.activeRivalSkipHandler = spec.onSkip ?? null;
    this.rivalChyronEl.dataset.tone = spec.tone ?? 'neutral';
    this.rivalChyronEl.innerHTML = '';

    const left = document.createElement('div');
    left.className = 'ws7-rival-chyron-left';
    const pic = document.createElement('div');
    pic.className = 'ws7-gouache-medallion';
    this.bindPortraitAsset(pic, spec.rivalId, spec.emotion ?? 'POISED');

    const copy = document.createElement('div');
    copy.className = 'ws7-rival-chyron-copy';
    const head = document.createElement('div');
    head.className = 'ws7-rival-chyron-head';
    head.textContent = spec.headline || `${profile.name} ON THE CLOCK`;
    copy.appendChild(head);
    if (spec.subline) {
      const sub = document.createElement('div');
      sub.className = 'ws7-rival-chyron-sub';
      sub.textContent = spec.subline;
      copy.appendChild(sub);
    }
    left.append(pic, copy);

    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'ws7-rival-skip-btn';
    skipBtn.textContent = 'SKIP ⏭';
    skipBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.activeRivalSkipHandler?.();
    });

    this.rivalChyronEl.append(left, skipBtn);
    this.rivalChyronEl.classList.remove('ws7-hidden');
    this.syncBoardModeRibbonVisibility();
  }

  public hideRivalTurnChyron(): void {
    this.activeRivalSkipHandler = null;
    this.rivalChyronEl.classList.add('ws7-hidden');
    this.syncBoardModeRibbonVisibility();
  }

  public playMatchCurtainRaiser(spec: MatchCurtainRaiserSpecV7): Promise<void> {
    this.clearActiveTimer();
    const reduced = this.campaign.getState().settings.reducedMotion;
    const durationMs = Math.max(800, spec.durationMs ?? (reduced ? 1800 : 2850));
    const profile = CAST_PROFILES_V7[spec.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;

    const scoutedWeak = spec.scoutedWeak ?? [];
    const weakSlots: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      weakSlots.push(
        scoutedWeak[i] ? `💡 ${getFriendlyTvCategoryLabelV7(scoutedWeak[i])}` : '???',
      );
    }
    const scoutedStrong = spec.scoutedStrong ?? [];
    const strongSummary =
      scoutedStrong.length > 0
        ? ` · ★ Turf: ${scoutedStrong.map((c) => getFriendlyTvCategoryLabelV7(c)).join(', ')}`
        : '';

    const traitTag =
      spec.traitRevealed && (spec.playstyle || profile.playstyle)
        ? `${(spec.playstyle ?? profile.playstyle ?? '').replace(/_/g, ' ')} · ${(spec.temperament ?? profile.temperament ?? 'STEADY').replace(/_/g, ' ')}`
        : 'PLAYSTYLE: REVEALS IN TURN 2+';

    return new Promise((resolve) => {
      let finished = false;
      let skipTimeout: number | null = null;
      const openedAt = typeof performance !== 'undefined' ? performance.now() : 0;

      const card = document.createElement('div');
      card.className = 'ws7-curtain-raiser';
      card.style.setProperty('--ws7-dwell-ms', `${durationMs}ms`);

      const header = document.createElement('div');
      header.className = 'ws7-sheet-header ws7-curtain-header-marquee';
      const bulbsHtml = Array.from({ length: 14 }, (_, idx) => {
        const phase = idx % 2 === 0 ? 'even' : 'odd';
        return `<span class="ws7-curtain-bulb" data-phase="${phase}"></span>`;
      }).join('');
      const cleanMatchTitle = spec.matchTitle.replace(/\s*\([^)]+\)\s*$/, '').trim() || spec.matchTitle;
      const shortRole = (profile.title.split('—')[0] ?? profile.title).trim().toUpperCase();
      header.innerHTML = `
        <div class="ws7-curtain-bulb-rail" aria-hidden="true">${bulbsHtml}</div>
        <div class="ws7-curtain-header-row">
          <svg class="ws7-curtain-starburst-svg" viewBox="0 0 56 56" width="42" height="42" aria-hidden="true">
            <circle cx="28" cy="28" r="26" fill="#5C301B" stroke="#f4a91f" stroke-width="1.8"/>
            <polygon points="28,3 31,20 44,8 35,23 52,22 36,28 52,34 35,33 44,48 31,36 28,53 25,36 12,48 21,33 4,34 20,28 4,22 21,23 12,8 25,20" fill="#ffd56b"/>
            <polygon points="28,9 30,22 41,15 33,25 47,28 33,31 41,41 30,34 28,47 26,34 15,41 23,31 9,28 23,25 15,15 26,22" fill="#ff6738" opacity="0.92"/>
            <circle cx="28" cy="28" r="7.5" fill="#0096a6" stroke="#fff7e6" stroke-width="1.6"/>
            <circle cx="28" cy="28" r="3" fill="#fff7e6"/>
          </svg>
          <div style="min-width:0;flex:1 1 auto;">
            <div class="ws7-subtitle-kicker">LIVE IN LIVING COLOR · ${spec.episodeCode}</div>
            <h2 class="ws7-display-title ws7-curtain-title">${cleanMatchTitle}</h2>
          </div>
        </div>
      `;

      const body = document.createElement('div');

      if (spec.returningChampStreak && spec.returningChampStreak >= 1) {
        const crown = document.createElement('div');
        crown.className = 'ws7-champ-crown-banner';
        crown.textContent = `👑 DEFENDING ${spec.returningChampStreak}-DAY STUDIO CHAMPION STREAK!`;
        body.appendChild(crown);
      }

      const tapeBand = document.createElement('div');
      tapeBand.className = 'ws7-curtain-tape-band';
      const pic = document.createElement('div');
      pic.className = 'ws7-gouache-medallion';
      pic.dataset.size = 'lg';
      this.bindPortraitAsset(pic, spec.rivalId, 'POISED');

      const rawQuote = (spec.quoteLine ?? profile.bio ?? profile.signatureTellText).trim();
      const firstSentenceMatch = rawQuote.match(/^[^.!?]+[.!?]/);
      const compactQuote =
        rawQuote.length <= 115
          ? rawQuote
          : firstSentenceMatch && firstSentenceMatch[0].length <= 120
            ? firstSentenceMatch[0]
            : `${rawQuote.slice(0, 108).replace(/\s+\S*$/, '')}!`;

      const meta = document.createElement('div');
      meta.style.flex = '1 1 auto';
      meta.style.minWidth = '0';
      meta.innerHTML = `
        <div class="ws7-curtain-role-kicker">TONIGHT’S CHAMPION · ${shortRole}</div>
        <div class="ws7-curtain-champ-name">${profile.name}</div>
        <div class="ws7-curtain-trait-pill">${traitTag}</div>
        <div class="ws7-curtain-quote">${formatOrphanProofCopyV7(compactQuote)}</div>
        <div class="ws7-curtain-scout-line">WEAK SPOTS: ${weakSlots.join('\u00A0·\u00A0')}${strongSummary}</div>
      `;
      tapeBand.append(pic, meta);

      const modeBand = document.createElement('div');
      modeBand.className = 'ws7-curtain-mode-band';
      modeBand.innerHTML = `
        <div style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:#007d8c;letter-spacing:0.05em;">★ BOARD FORMAT · ${spec.boardModeTitle}${spec.topologyBadge ? ` (${spec.topologyBadge})` : ''}</div>
        <div style="font-size:14.5px;font-weight:700;color:#121a2b;line-height:1.3;">${formatOrphanProofCopyV7(spec.boardRuleSummary)}</div>
      `;

      const dwellTrack = document.createElement('div');
      dwellTrack.className = 'ws7-theater-dwell-track';
      const dwellBar = document.createElement('div');
      dwellBar.className = 'ws7-theater-dwell-bar';
      dwellTrack.appendChild(dwellBar);

      const skipFooter = document.createElement('div');
      skipFooter.className = 'ws7-curtain-skip-footer';
      skipFooter.textContent = 'STEP UP TO PODIUM → (TAP TO START)';

      body.append(tapeBand, modeBand, dwellTrack, skipFooter);
      card.append(header, body);

      const finish = (): void => {
        if (finished) return;
        finished = true;
        if (skipTimeout !== null) {
          this.clearFlowTimeout(skipTimeout);
          skipTimeout = null;
        }
        this.hideModalStage();
        resolve();
      };

      card.addEventListener('click', () => {
        const elapsed =
          typeof performance !== 'undefined' ? performance.now() - openedAt : 999;
        if (elapsed >= 180) {
          finish();
        }
      });

      this.mountModalContent(card, finish);
      skipTimeout = this.scheduleFlowTimeout(finish, durationMs);
    });
  }

  public setActiveBoardTwist(twistId: BoardTwistIdV7 | null): void {
    this.activeBoardTwistId = twistId;
  }

  public setBoardModeBanner(
    banner: {
      readonly modeTitle: string;
      readonly ruleSummary: string;
      readonly compactTitle?: string;
      readonly compactRuleSummary?: string;
    } | null,
  ): void {
    if (this.activeBoardModeFadeTimeout !== null) {
      window.clearTimeout(this.activeBoardModeFadeTimeout);
      this.activeBoardModeFadeTimeout = null;
    }
    this.activeBoardModeBanner = banner;
    this.boardModeRibbonAutoHidden = false;
    if (banner) {
      const fullTag = `★ ${banner.modeTitle}`;
      const shortTag = `★ ${banner.compactTitle ?? banner.modeTitle}`;
      const fullRule = banner.ruleSummary;
      const shortRule = banner.compactRuleSummary ?? banner.ruleSummary;
      this.boardModeTagEl.innerHTML = '';
      const tagFullEl = document.createElement('span');
      tagFullEl.className = 'ws7-mode-copy-full';
      tagFullEl.textContent = fullTag;
      const tagCompactEl = document.createElement('span');
      tagCompactEl.className = 'ws7-mode-copy-compact';
      tagCompactEl.textContent = shortTag;
      this.boardModeTagEl.append(tagFullEl, tagCompactEl);

      this.boardModeRuleEl.innerHTML = '';
      const ruleFullEl = document.createElement('span');
      ruleFullEl.className = 'ws7-mode-copy-full';
      ruleFullEl.textContent = fullRule;
      const ruleCompactEl = document.createElement('span');
      ruleCompactEl.className = 'ws7-mode-copy-compact';
      ruleCompactEl.textContent = shortRule;
      this.boardModeRuleEl.append(ruleFullEl, ruleCompactEl);
    } else {
      this.boardModeTagEl.textContent = '';
      this.boardModeRuleEl.textContent = '';
    }
    this.syncBoardModeRibbonVisibility();
  }

  private syncBoardModeRibbonVisibility(): void {
    const topBugVisible = !this.topBugWrapEl.classList.contains('ws7-hidden');
    const questionOpen = !this.questionStageEl.classList.contains('ws7-hidden');
    const modalOpen =
      !this.modalStageEl.classList.contains('ws7-hidden') || this.isUtilityModalOpen();
    const toastVisible = !this.liveToastEl.classList.contains('ws7-hidden');
    const liveAlertBusy =
      this.arrestSwitchBtn.dataset.tellLive === 'true' ||
      this.censorPaddleBtn.dataset.sabotageActive === 'true';
    const shouldShow =
      Boolean(this.activeBoardModeBanner) &&
      !this.boardModeRibbonAutoHidden &&
      topBugVisible &&
      !questionOpen &&
      !modalOpen &&
      !toastVisible &&
      !liveAlertBusy;
    this.boardModeRibbonEl.classList.toggle('ws7-hidden', !shouldShow);
  }

  public showLiveToast(
    message: string,
    tone: 'brass' | 'crimson' | 'emerald' = 'brass',
    durationMs: number = 2200,
  ): void {
    if (this.activeToastTimeout !== null) {
      window.clearTimeout(this.activeToastTimeout);
      this.activeToastTimeout = null;
    }
    this.liveToastEl.dataset.tone = tone;
    this.liveToastEl.textContent = message;
    this.liveToastEl.classList.remove('ws7-hidden');
    this.syncBoardModeRibbonVisibility();
    this.activeToastTimeout = window.setTimeout(() => {
      this.liveToastEl.classList.add('ws7-hidden');
      this.activeToastTimeout = null;
      this.syncBoardModeRibbonVisibility();
    }, Math.max(800, durationMs));
  }

  public updateTopBroadcastBug(snap: TopBugSnapshotV7): void {
    const canAnimate = this.hasSyncedTopScoresOnce;
    this.hasSyncedTopScoresOnce = true;

    const isBlitz = Boolean(snap.blitzMode || this.blitzModeActive);
    this.topBugWrapEl.dataset.blitz = isBlitz ? 'true' : 'false';
    this.rivalBoxEl.hidden = isBlitz;
    this.rivalBoxEl.classList.toggle('ws7-hidden', isBlitz);
    this.turboBugBtn.classList.toggle('ws7-hidden', isBlitz);
    this.censorPaddleBtn.classList.toggle('ws7-hidden', isBlitz);

    this.liveMatchScoreForShop = Math.max(0, Math.floor(snap.playerCash));
    this.applyPodiumTrimToPlayerBox(snap.podiumTrimId);
    this.animateSolariScore(
      this.playerRoller,
      this.playerDrumEl,
      this.playerBoxEl,
      this.playerDeltaPopEl,
      snap.playerCash,
      canAnimate,
    );
    if (!isBlitz) {
      this.animateSolariScore(
        this.rivalRoller,
        this.rivalDrumEl,
        this.rivalBoxEl,
        this.rivalDeltaPopEl,
        snap.rivalCash,
        canAnimate,
      );
    }

    const totalTurns = snap.totalTurns ?? 10;
    const clampedTurn = Math.max(1, Math.min(totalTurns, snap.turnNumber));
    if (isBlitz) {
      this.turnPillEl.dataset.act = 'blitz';
      this.turnKickerEl.textContent = '⚡ BLITZ';
      this.turnNumEl.textContent = '60s SOLO';
    } else if (snap.isDailyBroadcast) {
      this.turnPillEl.dataset.act = 'daily';
      this.turnKickerEl.innerHTML = snap.dailyEpisodeNumber
        ? `<span class="ws7-turn-full">DAILY #${snap.dailyEpisodeNumber}</span><span class="ws7-turn-short">DAILY</span>`
        : 'DAILY';
      this.turnNumEl.textContent = `${String(clampedTurn).padStart(2, '0')}/${String(totalTurns).padStart(2, '0')}`;
    } else {
      const actNum: BroadcastActNumberV7 =
        snap.actNumber ??
        (snap.isFinalWager || clampedTurn >= totalTurns
          ? 3
          : clampedTurn >= 6
            ? 2
            : 1);
      this.turnPillEl.dataset.act = String(actNum);
      const turnDigits = `${String(clampedTurn).padStart(2, '0')}/${String(totalTurns).padStart(2, '0')}`;
      if (actNum === 3) {
        this.turnKickerEl.textContent = 'ACT III';
        this.turnNumEl.innerHTML =
          '<span class="ws7-turn-full">FINAL WAGER</span><span class="ws7-turn-short">WAGER</span>';
      } else if (actNum === 2) {
        this.turnKickerEl.innerHTML =
          '<span class="ws7-turn-full">ACT II · 1.5×</span><span class="ws7-turn-short">ACT II</span>';
        this.turnNumEl.textContent = turnDigits;
      } else {
        this.turnKickerEl.textContent = 'ACT I';
        this.turnNumEl.textContent = turnDigits;
      }
    }

    const streakVal = Math.max(0, snap.streak);
    this.streakChipEl.dataset.active = streakVal >= 2 ? 'true' : 'false';
    this.streakChipEl.textContent = `🔥${streakVal}`;

    const sabotageLikely =
      !isBlitz && clampedTurn >= 7 && snap.playerCash - snap.rivalCash >= 250;
    if (this.censorPaddleBtn.dataset.locked !== 'true') {
      this.censorPaddleBtn.dataset.sabotageActive = sabotageLikely ? 'true' : 'false';
    }

    if (!isBlitz) {
      const rivalProfile = CAST_PROFILES_V7[snap.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
      const fullUpper = rivalProfile.name.toUpperCase();
      const nameParts = rivalProfile.name.trim().split(/\s+/);
      const rawFirst = (nameParts[0] ?? rivalProfile.name).toUpperCase();
      const rawLast = (nameParts[nameParts.length - 1] ?? rawFirst).toUpperCase();
      const firstUpper = rawFirst.length <= 7 ? rawFirst : rawLast.length <= 7 ? rawLast : rawFirst.slice(0, 7);
      if (this.rivalNameFullEl.textContent !== fullUpper) {
        this.rivalNameFullEl.textContent = fullUpper;
      }
      if (this.rivalNameShortEl.textContent !== firstUpper) {
        this.rivalNameShortEl.textContent = firstUpper;
      }

      const emotion = snap.rivalEmotion ?? 'POISED';
      if (this.currentRivalId !== snap.rivalId) {
        this.currentRivalId = snap.rivalId;
        this.bindPortraitAsset(this.rivalMedallionEl, snap.rivalId, emotion);
        this.setRivalEmotion(emotion);
      } else {
        this.setRivalEmotion(emotion);
      }
    }

    if (typeof snap.boothTellLive === 'boolean') {
      this.setBoothTellActive(isBlitz ? false : snap.boothTellLive);
    }

    if (snap.boardModeBanner !== undefined) {
      this.setBoardModeBanner(isBlitz ? null : snap.boardModeBanner);
    }

    if (typeof snap.turboEnabled === 'boolean') {
      this.turboBugBtn.dataset.active = snap.turboEnabled ? 'true' : 'false';
      this.turboBugBtn.setAttribute('aria-pressed', snap.turboEnabled ? 'true' : 'false');
      this.turboLabelEl.textContent = snap.turboEnabled ? ' TURBO ON' : ' TURBO';
      this.turboBugBtn.title = snap.turboEnabled
        ? 'Turbo Rival Turn Speed: ON (0.4s) — Tap to toggle'
        : 'Toggle 0.4s Turbo Rival Turn Speed';
    }

    const mercyState = isBlitz ? 'NONE' : (snap.mercyBellState ?? 'NONE');
    this.currentMercyBellState = mercyState;
    if (mercyState === 'TKO_WIN') {
      this.mercyBellBtn.dataset.mode = 'TKO_WIN';
      this.mercyBellBtn.textContent = '🔔 RING TKO BELL (+$300)';
      this.mercyBellBtn.classList.remove('ws7-hidden');
    } else if (mercyState === 'CONCEDE_REMATCH') {
      this.mercyBellBtn.dataset.mode = 'CONCEDE_REMATCH';
      this.mercyBellBtn.textContent = '🏳️ CONCEDE & REMATCH';
      this.mercyBellBtn.classList.remove('ws7-hidden');
    } else {
      this.mercyBellBtn.dataset.mode = 'NONE';
      this.mercyBellBtn.classList.add('ws7-hidden');
    }

    const showHotMic = !isBlitz && Boolean(snap.hotMicShowButton);
    this.hotMicHudBtn.classList.toggle('ws7-hidden', !showHotMic);
    if (showHotMic) {
      const available = snap.hotMicAvailable !== false;
      const armed = Boolean(snap.hotMicArmed);
      this.hotMicHudBtn.dataset.armed = String(armed);
      this.hotMicHudBtn.disabled = !available && !armed;
      this.hotMicHudBtn.textContent = armed
        ? '🔥 HOT MIC ARMED! (TAP TILE)'
        : available
          ? '🔥 PASS THE HOT MIC!'
          : '🔥 HOT MIC USED';
    }

    const showStrip = !isBlitz && (mercyState !== 'NONE' || showHotMic);
    this.hudActionStripEl.classList.toggle('ws7-hidden', !showStrip);
  }

  private applyPodiumTrimToPlayerBox(trimId?: string): void {
    const resolved = trimId && trimId.trim() ? trimId.trim() : 'trim_walnut_classic';
    this.playerBoxEl.dataset.podiumTrim = resolved;
    switch (resolved) {
      case 'trim_peacock_chrome':
      case 'podium_peacock_chrome':
        this.playerBoxEl.style.borderColor = '#008B94';
        this.playerBoxEl.style.boxShadow =
          'inset 0 0 0 2px #E6F8FA, 0 2px 10px rgba(0, 139, 148, 0.34)';
        break;
      case 'trim_champagne_brass':
      case 'podium_champagne_brass':
        this.playerBoxEl.style.borderColor = '#D9A441';
        this.playerBoxEl.style.boxShadow =
          'inset 0 0 0 2px #FFF6D6, 0 2px 10px rgba(217, 164, 65, 0.38)';
        break;
      case 'trim_carnaby_tangerine':
      case 'podium_carnaby_tangerine':
        this.playerBoxEl.style.borderColor = '#FF6B35';
        this.playerBoxEl.style.boxShadow =
          'inset 0 0 0 2px #FFE4D6, 0 2px 10px rgba(255, 107, 53, 0.38)';
        break;
      case 'trim_walnut_classic':
      case 'podium_walnut_classic':
      default:
        this.playerBoxEl.style.borderColor = '#6E3B23';
        this.playerBoxEl.style.boxShadow =
          'inset 0 0 0 1.5px #EBD4AE, 0 2px 8px rgba(110, 59, 35, 0.25)';
        break;
    }
  }

  public setSabotageWarningActive(active: boolean): void {
    this.censorPaddleBtn.dataset.sabotageActive = active ? 'true' : 'false';
    this.syncBoardModeRibbonVisibility();
  }

  public updateVuNeedle(angleDeg: number, peakActive: boolean): void {
    const clamped = Math.max(-44, Math.min(44, angleDeg));
    const rad = ((clamped - 90) * Math.PI) / 180;
    const length = 18;
    const x2 = 27 + Math.cos(rad) * length;
    const y2 = 25 + Math.sin(rad) * length;
    this.vuNeedleLineEl.setAttribute('x2', x2.toFixed(2));
    this.vuNeedleLineEl.setAttribute('y2', y2.toFixed(2));
    this.vuMeterWrapEl.dataset.peak = peakActive ? 'true' : 'false';
  }

  public setRivalEmotion(emotion: PortraitEmotionV7): void {
    const spec = PORTRAIT_SPRITE_POSITIONS_V7[emotion] ?? PORTRAIT_SPRITE_POSITIONS_V7.POISED;
    this.rivalMedallionEl.dataset.emotion = emotion;
    this.rivalMedallionEl.style.backgroundPosition = spec.bgPosition;
    this.rivalEmotionTextEl.dataset.tell = emotion === 'TELL' ? 'true' : 'false';
    this.rivalEmotionTextEl.innerHTML =
      emotion === 'TELL'
        ? `<span class="ws7-dossier-ico" aria-hidden="true">${SVG_TELL_BEACON_1966}</span><span class="ws7-dossier-txt"> TELL!</span>`
        : `<span class="ws7-dossier-ico" aria-hidden="true">${SVG_DOSSIER_TAB_1966}</span><span class="ws7-dossier-txt"> DOSSIER</span>`;
  }

  public openScoutingDossierModal(focusRivalId?: RivalIdV7, onClose?: () => void): void {
    this.openScoutingNotebookModal(focusRivalId, onClose);
  }

  public openScoutingNotebookModal(focusRivalId?: RivalIdV7, onClose?: () => void): void {
    const dismiss = (): void => {
      this.hideUtilityModalStage();
      onClose?.();
    };
    let activeId: RivalIdV7 = focusRivalId ?? this.currentRivalId ?? 'CARMEN_DELGADO';

    const renderNotebook = (): void => {
      const save = this.campaign.getState();
      const notebookMap = save.scoutingNotebook ?? {};
      const allRivalIds = (Object.keys(CAST_PROFILES_V7) as CastIdV7[]).filter(
        (id): id is RivalIdV7 => CAST_PROFILES_V7[id].role !== 'BOOTH_BROKER',
      );
      let totalWeakDiscovered = 0;
      for (const id of allRivalIds) {
        totalWeakDiscovered += notebookMap[id]?.revealedWeak?.length ?? 0;
      }

      const panel = document.createElement('div');
      panel.className = 'ws7-mahogany-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', '1966 Studio Champion Scouting Notebook');

      const header = this.createDismissibleSheetHeader(
        `STUDIO 6A SCOUTING NOTEBOOK · ${totalWeakDiscovered} / ${allRivalIds.length * 3} WEAK SPOTS LOGGED`,
        '1966 Champion Scouting Dossier',
        dismiss,
        'Close Scouting Notebook',
      );

      const body = document.createElement('div');
      body.className = 'ws7-sheet-body';

      const focusProfile = CAST_PROFILES_V7[activeId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
      const focusEntry = notebookMap[activeId];
      const revealedWeak = focusEntry?.revealedWeak ?? [];
      const revealedStrong = focusEntry?.revealedStrong ?? [];
      const traitLine =
        focusEntry?.traitRevealed && focusProfile.playstyle
          ? `${focusProfile.playstyle.replace(/_/g, ' ')} · ${(focusProfile.temperament ?? 'STEADY').replace(/_/g, ' ')}`
          : 'MIND-GAME STYLE: ??? (REVEALS IN TURN 2+)';

      const hero = document.createElement('div');
      hero.className = 'ws7-scouting-featured-hero';
      const heroPic = document.createElement('div');
      heroPic.className = 'ws7-gouache-medallion';
      heroPic.dataset.size = 'lg';
      this.bindPortraitAsset(heroPic, activeId, 'POISED');

      const weakChipsHtml = [0, 1, 2]
        .map((idx) => {
          const cat = revealedWeak[idx];
          return cat
            ? `<span class="ws7-scout-chip" data-kind="weak">💡 ${getFriendlyTvCategoryLabelV7(cat)} (+0.5×)</span>`
            : `<span class="ws7-scout-chip" data-kind="unknown">💡 WEAK SPOT #${idx + 1}: ???</span>`;
        })
        .join('');

      const strongChipsHtml = [0, 1, 2]
        .map((idx) => {
          const cat = revealedStrong[idx];
          return cat
            ? `<span class="ws7-scout-chip" data-kind="strong">★ ${getFriendlyTvCategoryLabelV7(cat)}</span>`
            : `<span class="ws7-scout-chip" data-kind="unknown">★ STRONG TURF #${idx + 1}: ???</span>`;
        })
        .join('');

      const heroMeta = document.createElement('div');
      heroMeta.style.flex = '1 1 320px';
      heroMeta.style.minWidth = '0';
      heroMeta.innerHTML = `
        <div style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:#ff9c78;letter-spacing:0.06em;">SEASON ${focusProfile.seasonTier ?? 1} CHAMPION · ${focusProfile.title.toUpperCase()}</div>
        <div style="font-size:21px;font-weight:900;color:#fff7e6;margin:2px 0;">${focusProfile.name} <span style="font-size:14px;color:#ffd56b;font-weight:800;">· ${traitLine}</span></div>
        <div style="font-size:14.5px;color:#d6e2ec;font-weight:600;line-height:1.4;margin-top:3px;">${formatOrphanProofCopyV7(focusProfile.bio ?? focusProfile.signatureTellText)}</div>
        <div class="ws7-scouting-pill-row">${weakChipsHtml}</div>
        <div class="ws7-scouting-pill-row">${strongChipsHtml}</div>
      `;
      hero.append(heroPic, heroMeta);
      body.appendChild(hero);

      // 24-Champion Roster Ledger
      const rosterList = document.createElement('div');
      rosterList.className = 'ws7-editorial-list';
      for (const rId of allRivalIds) {
        const prof = CAST_PROFILES_V7[rId];
        const ent = notebookMap[rId];
        const wCount = ent?.revealedWeak?.length ?? 0;
        const sCount = ent?.revealedStrong?.length ?? 0;
        const row = document.createElement('div');
        row.className = 'ws7-editorial-row';
        row.dataset.unlocked = rId === activeId || wCount > 0 || sCount > 0 ? 'true' : 'false';

        const pic = document.createElement('div');
        pic.className = 'ws7-gouache-medallion';
        this.bindPortraitAsset(pic, rId, 'POISED');

        const meta = document.createElement('div');
        meta.className = 'ws7-editorial-meta';
        meta.innerHTML = `
          <div style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:#007d8c;letter-spacing:0.04em;">SEASON ${prof.seasonTier ?? 1} · ${wCount}/3 WEAK SPOTS · ${sCount}/3 STRONG TURF</div>
          <div style="font-size:16px;font-weight:800;color:#121a2b;">${prof.name}${rId === this.currentRivalId ? ' · (ON STAGE)' : ''}</div>
          <div style="font-size:14px;color:#384660;font-weight:600;">${prof.title}</div>
        `;

        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.className = rId === activeId ? 'ws7-teal-btn' : 'ws7-dossier-inspect-btn';
        viewBtn.textContent = rId === activeId ? 'VIEWING ✓' : 'INSPECT';
        viewBtn.addEventListener('click', () => {
          activeId = rId;
          renderNotebook();
        });

        row.append(pic, meta, viewBtn);
        rosterList.appendChild(row);
      }
      body.appendChild(rosterList);

      const footer = document.createElement('div');
      footer.className = 'ws7-sheet-footer';
      const doneBtn = document.createElement('button');
      doneBtn.type = 'button';
      doneBtn.className = 'ws7-primary-btn';
      doneBtn.textContent = 'BACK TO STUDIO 6A →';
      doneBtn.addEventListener('click', dismiss);
      footer.appendChild(doneBtn);

      panel.append(header, body, footer);
      this.mountUtilityModalContent(panel, dismiss);
    };

    renderNotebook();
  }

  public setBoothTellActive(active: boolean): void {
    const hasSignet = this.campaign
      .getState()
      .equippedRelics.some((r) => r.relicId === 'relic_subpoena_wax_signet');
    const bounty = hasSignet ? 300 : 150;
    this.arrestSwitchBtn.dataset.tellLive = active ? 'true' : 'false';
    this.arrestSwitchBtn.innerHTML = active
      ? `<span>CHEAT LIVE!</span><span class="ws7-dock-sub">Tap +$${bounty} Clean</span>`
      : '<span>CATCH CHEAT</span><span class="ws7-dock-sub">Wait for Tell</span>';
    this.syncBoardModeRibbonVisibility();
  }

  public updateCensorPaddleProgress(charge01: number, locked: boolean): void {
    this.censorPaddleBtn.dataset.locked = locked ? 'true' : 'false';
    if (locked) {
      this.censorPaddleBtn.innerHTML =
        '<span>MIC SHIELD ✓</span><span class="ws7-dock-sub">Clock Protected</span>';
    } else if (charge01 > 0.02) {
      const pct = Math.min(99, Math.round(charge01 * 100));
      this.censorPaddleBtn.innerHTML = `<span>CHARGING ${pct}%</span><span class="ws7-dock-sub">Keep Holding</span>`;
    } else {
      this.censorPaddleBtn.innerHTML =
        '<span>MIC SHIELD</span><span class="ws7-dock-sub">Hold to Protect</span>';
    }
  }

  public updateZoomReadout(zoom: number): void {
    this.zoomReadoutBtn.textContent = `${zoom.toFixed(1)}x`;
    this.zoomPillEl.dataset.zoomed = Math.abs(zoom - 1.0) > 0.06 ? 'true' : 'false';
  }

  public bindPortraitAsset(
    el: HTMLElement,
    castId: CastIdV7,
    emotion: PortraitEmotionV7 = 'POISED',
  ): void {
    const profile = CAST_PROFILES_V7[castId];
    const spec = PORTRAIT_SPRITE_POSITIONS_V7[emotion];
    el.dataset.castId = castId;
    el.dataset.emotion = emotion;

    const applySprite = (): void => {
      el.style.backgroundImage = `url("${profile.portraitAsset}")`;
      el.style.backgroundSize = '200% 200%';
      el.style.backgroundPosition = spec.bgPosition;
    };

    if (
      profile.portraitAsset.startsWith('data:') ||
      this.portraitLoadedCache.has(profile.portraitAsset)
    ) {
      applySprite();
      return;
    }

    el.style.backgroundImage = `url("${buildCastMonogramSvgDataUriV7(castId, emotion)}")`;
    el.style.backgroundSize = '100% 100%';
    el.style.backgroundPosition = '50% 50%';

    if (typeof Image !== 'undefined') {
      const img = new Image();
      img.onload = () => {
        this.portraitLoadedCache.add(profile.portraitAsset);
        if (el.dataset.castId !== castId) return;
        applySprite();
      };
      img.src = profile.portraitAsset;
    }
  }

  // --------------------------------------------------------------------------
  // Screen 1: Radiant 1966 Living Color Fallback Title & Backstage Hub
  // --------------------------------------------------------------------------

  public showTitleHub(): void {
    this.clearActiveTimer();
    this.liveMatchScoreForShop = null;
    const save = this.campaign.getState();
    const bp = this.campaign.getCurrentEpisodeBlueprint();

    const panel = document.createElement('div');
    panel.className = 'ws7-mahogany-panel';

    const header = document.createElement('div');
    header.className = 'ws7-sheet-header';
    const kicker = document.createElement('div');
    kicker.className = 'ws7-subtitle-kicker';
    kicker.textContent = '1966 STUDIO 6A · LIVE IN LIVING COLOR · FIFTY MILLION WATCHING';

    const title = document.createElement('h1');
    title.className = 'ws7-display-title';
    title.textContent = 'WORLD’S SMARTEST';

    const lead = document.createElement('p');
    lead.style.margin = '4px 0 0 0';
    lead.style.fontSize = '15px';
    lead.style.fontWeight = '600';
    lead.style.color = '#d6e2ec';
    lead.textContent = formatOrphanProofCopyV7(
      `Next Broadcast: ${bp.code} — ${bp.title} vs. ${CAST_PROFILES_V7[bp.rivalId].name}.`,
    );
    header.append(kicker, title, lead);

    const body = document.createElement('div');
    body.className = 'ws7-sheet-body';

    const statsGrid = document.createElement('div');
    statsGrid.className = 'ws7-hub-stats-grid';
    const stats: ReadonlyArray<{ label: string; val: string }> = [
      { label: 'CLEAN PURSE', val: `$${save.cleanPurseCash.toLocaleString()}` },
      { label: 'BACKSTAGE CASH', val: `$${save.contrabandTrunkCash.toLocaleString()}` },
      { label: 'LIEN SPOKES', val: `${save.lienSegmentsPaid} / 12` },
      { label: 'TROPHY VAULT', val: `${save.unlockedTrophyIds.length} / 36` },
    ];
    for (const s of stats) {
      const plaque = document.createElement('div');
      plaque.className = 'ws7-stat-plaque';
      plaque.innerHTML = `<span class="ws7-stat-label">${s.label}</span><span class="ws7-stat-val">${s.val}</span>`;
      statsGrid.appendChild(plaque);
    }

    const actionBand = document.createElement('div');
    actionBand.className = 'ws7-sheet-band';
    const primaryRow = document.createElement('div');
    primaryRow.className = 'ws7-btn-row';

    const continueBtn = document.createElement('button');
    continueBtn.type = 'button';
    continueBtn.className = 'ws7-primary-btn';
    continueBtn.textContent = save.waiver
      ? `PLAY CAMPAIGN · ${bp.code}`
      : `START CAMPAIGN · ${bp.code}`;
    continueBtn.addEventListener('click', () => {
      void this.launchCampaignFlow();
    });
    primaryRow.appendChild(continueBtn);

    if (this.callbacks.onStartDailyBroadcast) {
      const dailyBtn = document.createElement('button');
      dailyBtn.type = 'button';
      dailyBtn.className = 'ws7-teal-btn';
      dailyBtn.textContent = '★ DAILY 1966 BROADCAST';
      dailyBtn.addEventListener('click', () => {
        this.hideModalStage();
        this.callbacks.onStartDailyBroadcast?.();
      });
      primaryRow.appendChild(dailyBtn);
    }

    const quickBtn = document.createElement('button');
    quickBtn.type = 'button';
    quickBtn.className = 'ws7-teal-btn';
    quickBtn.textContent = 'QUICK SHOW';
    quickBtn.addEventListener('click', () => {
      this.hideModalStage();
      this.callbacks.onStartQuickPlay?.();
    });

    const howToBtn = document.createElement('button');
    howToBtn.type = 'button';
    howToBtn.className = 'ws7-secondary-btn';
    howToBtn.textContent = '? HOW TO PLAY';
    howToBtn.addEventListener('click', () => {
      if (this.callbacks.onOpenHowToPlay) {
        this.callbacks.onOpenHowToPlay();
      } else {
        this.openHowToPlayModal(() => this.showTitleHub());
      }
    });

    primaryRow.append(quickBtn, howToBtn);
    actionBand.appendChild(primaryRow);

    const utilityFooter = document.createElement('div');
    utilityFooter.className = 'ws7-sheet-footer';

    const trunkBtn = document.createElement('button');
    trunkBtn.type = 'button';
    trunkBtn.className = 'ws7-secondary-btn';
    trunkBtn.textContent = `PROP SHOP (${save.equippedRelics.length}/${MAX_TRUNK_SLOTS_V7})`;
    trunkBtn.addEventListener('click', () =>
      this.openPropTrunkModal(false, () => this.showTitleHub()),
    );

    const vaultBtn = document.createElement('button');
    vaultBtn.type = 'button';
    vaultBtn.className = 'ws7-secondary-btn';
    vaultBtn.textContent = `TROPHIES (${save.unlockedTrophyIds.length}/36)`;
    vaultBtn.addEventListener('click', () =>
      this.openTrophyVaultModal(() => this.showTitleHub()),
    );

    const jumpBtn = document.createElement('button');
    jumpBtn.type = 'button';
    jumpBtn.className = 'ws7-secondary-btn';
    jumpBtn.textContent = 'EPISODE ARCHIVE';
    jumpBtn.addEventListener('click', () =>
      this.openEpisodeJumpModal(() => this.showTitleHub()),
    );

    const audioBtn = document.createElement('button');
    audioBtn.type = 'button';
    audioBtn.className = 'ws7-secondary-btn';
    audioBtn.textContent = 'SOUND & OPTIONS';
    audioBtn.addEventListener('click', () =>
      this.openSettingsModal(() => this.showTitleHub()),
    );

    utilityFooter.append(trunkBtn, vaultBtn, jumpBtn, audioBtn);
    if (this.callbacks.onStartCouchParty) {
      const couchBtn = document.createElement('button');
      couchBtn.type = 'button';
      couchBtn.className = 'ws7-teal-btn';
      couchBtn.textContent = '2P COUCH PARTY';
      couchBtn.addEventListener('click', () => {
        this.hideModalStage();
        this.callbacks.onStartCouchParty?.();
      });
      utilityFooter.appendChild(couchBtn);
    }
    if (this.callbacks.onOpenCareerStats) {
      const statsBtn = document.createElement('button');
      statsBtn.type = 'button';
      statsBtn.className = 'ws7-secondary-btn';
      statsBtn.textContent = 'STATS & CHARTS';
      statsBtn.addEventListener('click', () => {
        this.callbacks.onOpenCareerStats?.();
      });
      utilityFooter.appendChild(statsBtn);
    }
    if (this.callbacks.onOpenDailyTapeVault) {
      const tapeBtn = document.createElement('button');
      tapeBtn.type = 'button';
      tapeBtn.className = 'ws7-secondary-btn';
      tapeBtn.textContent = 'TAPE VAULT';
      tapeBtn.addEventListener('click', () => {
        this.callbacks.onOpenDailyTapeVault?.();
      });
      utilityFooter.appendChild(tapeBtn);
    }
    body.append(statsGrid, actionBand, utilityFooter);
    panel.append(header, body);
    this.mountModalContent(panel);
  }

  public hideTitleHub(): void {
    this.hideModalStage();
  }

  private async launchCampaignFlow(): Promise<void> {
    const save = this.campaign.getState();
    if (!save.waiver) {
      await this.showReleaseWaiver();
    }
    const bp = this.campaign.getCurrentEpisodeBlueprint();
    const { chosenRegime } = await this.showGreenRoomCallSheet(bp);
    this.hideModalStage();
    this.callbacks.onStartCampaignMatch?.(bp, chosenRegime);
  }

  // --------------------------------------------------------------------------
  // Screen 2: 1966 IBC Contestant Release Clipboard (Pinned CTA Footer!)
  // --------------------------------------------------------------------------

  public showReleaseWaiver(opts?: {
    readonly betweenEpisodes?: boolean;
  }): Promise<ContestantWaiverV7> {
    const isBetweenEpisodes = Boolean(opts?.betweenEpisodes);
    if (!isBetweenEpisodes) {
      this.clearActiveTimer();
    }
    return new Promise((resolve) => {
      let resolvedOnce = false;
      let preMatchInterval: number | null = null;
      const existingWaiver = this.campaign.getState().waiver;
      let selectedJob: DayJobIdV7 = existingWaiver?.dayJob ?? 'PATENT_CLERK';
      let selectedVice: StageViceIdV7 = existingWaiver?.stageVice ?? 'SCOREBOARD_GRUDGE';
      let selectedGoal: LienGoalIdV7 = existingWaiver?.lienGoal ?? 'CLEAN_PURSE_250K';
      let remainingSec = 60;

      const clearLocalWaiverTimer = (): void => {
        if (preMatchInterval !== null) {
          window.clearInterval(preMatchInterval);
          preMatchInterval = null;
        }
        if (!isBetweenEpisodes) {
          this.clearActiveTimer();
        }
      };

      const cancelBetweenEpisodes = (): void => {
        if (resolvedOnce) return;
        resolvedOnce = true;
        clearLocalWaiverTimer();
        this.hideUtilityModalStage();
        resolve(this.campaign.ensureDefaultWaiverIfMissing());
      };

      const board = document.createElement('div');
      board.className = 'ws7-waiver-clipboard';

      const masthead = document.createElement('div');
      masthead.className = 'ws7-waiver-masthead';

      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.alignItems = 'center';
      topRow.style.justifyContent = 'space-between';
      topRow.style.gap = '10px';
      const kicker = document.createElement('span');
      kicker.className = 'ws7-subtitle-kicker';
      kicker.textContent = isBetweenEpisodes
        ? 'IBC STUDIO 6A · GREEN-ROOM CONTESTANT PERKS'
        : 'IBC STUDIO 6A · CONTESTANT SIGN-IN CLIPBOARD';

      const timerBadge = document.createElement('span');
      timerBadge.className = 'ws7-clue-timer-pill';
      timerBadge.textContent = '60s';

      if (isBetweenEpisodes) {
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'ws7-sheet-close-btn';
        closeBtn.setAttribute('aria-label', 'Close Contestant Perks');
        closeBtn.title = 'Close Contestant Perks';
        closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', cancelBetweenEpisodes);
        topRow.append(kicker, closeBtn);
      } else {
        topRow.append(kicker, timerBadge);
      }

      const heading = document.createElement('h2');
      heading.className = 'ws7-display-title';
      heading.textContent = isBetweenEpisodes
        ? 'Adjust Your Contestant Perks for Next Broadcast'
        : 'Pick Your Contestant Style Before Going Live';
      masthead.append(topRow, heading);

      const body = document.createElement('div');
      body.className = 'ws7-waiver-body';

      const buildStampGroup = <T extends string>(
        groupTitle: string,
        items: ReadonlyArray<{ readonly id: T; readonly title: string; readonly perk: string }>,
        getCurrent: () => T,
        onPick: (id: T) => void,
      ): HTMLDivElement => {
        const wrap = document.createElement('div');
        wrap.className = 'ws7-stamp-section';
        const label = document.createElement('div');
        label.className = 'ws7-stamp-group-heading';
        label.textContent = groupTitle;
        const grid = document.createElement('div');
        grid.className = 'ws7-stamp-grid';

        const renderOptions = (): void => {
          grid.innerHTML = '';
          for (const item of items) {
            const active = getCurrent() === item.id;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ws7-stamp-option';
            btn.dataset.stamped = active ? 'true' : 'false';
            btn.innerHTML = `
              <strong style="font-size:15.5px;color:#121a2b;">${item.title}</strong>
              <span style="font-size:14px;color:#384660;font-weight:600;line-height:1.35;">${formatOrphanProofCopyV7(item.perk)}</span>
              ${active ? '<span class="ws7-wet-ink-badge">SELECTED ✓</span>' : ''}
            `;
            btn.addEventListener('click', () => {
              onPick(item.id);
              renderOptions();
            });
            grid.appendChild(btn);
          }
        };
        renderOptions();
        wrap.append(label, grid);
        return wrap;
      };

      const finishWaiver = (): void => {
        if (resolvedOnce) return;
        resolvedOnce = true;
        clearLocalWaiverTimer();
        const stamped = this.campaign.stampReleaseWaiver(
          selectedJob,
          selectedVice,
          selectedGoal,
        );
        if (isBetweenEpisodes) {
          this.hideUtilityModalStage();
        }
        resolve(stamped);
      };

      const jobGroup = buildStampGroup(
        '1. YOUR DAY JOB (SPECIALTY BONUS)',
        DAY_JOB_LABELS_V7,
        () => selectedJob,
        (v) => {
          selectedJob = v;
        },
      );
      const viceGroup = buildStampGroup(
        '2. YOUR STAGE STYLE (MULTIPLIER PERK)',
        STAGE_VICE_LABELS_V7,
        () => selectedVice,
        (v) => {
          selectedVice = v;
        },
      );
      const goalGroup = buildStampGroup(
        '3. YOUR BACKSTAGE MOTIVE (STORY TRACK)',
        LIEN_GOAL_LABELS_V7,
        () => selectedGoal,
        (v) => {
          selectedGoal = v;
        },
      );

      const footer = document.createElement('div');
      footer.className = 'ws7-waiver-footer';
      const sealBtn = document.createElement('button');
      sealBtn.type = 'button';
      sealBtn.className = 'ws7-primary-btn';
      sealBtn.textContent = isBetweenEpisodes
        ? 'SAVE PERKS & RETURN ✓'
        : 'SIGN & WALK INTO STUDIO\u00A06A →';
      sealBtn.addEventListener('click', finishWaiver);
      footer.appendChild(sealBtn);

      body.append(jobGroup, viceGroup, goalGroup);
      board.append(masthead, body, footer);

      if (isBetweenEpisodes) {
        this.mountUtilityModalContent(board, cancelBetweenEpisodes);
      } else {
        this.mountModalContent(board);
        preMatchInterval = window.setInterval(() => {
          remainingSec -= 1;
          timerBadge.textContent = `${Math.max(0, remainingSec)}s`;
          timerBadge.dataset.urgent = remainingSec <= 10 ? 'true' : 'false';
          if (remainingSec <= 0) {
            finishWaiver();
          }
        }, 1000);
        this.activeTimerHandle = preMatchInterval;
      }
    });
  }

  // --------------------------------------------------------------------------
  // Screen 3: Pablo Ferro Split-Panel Green Room Call-Sheet & AP Wire Ticker
  // --------------------------------------------------------------------------

  public showGreenRoomCallSheet(
    blueprint: EpisodeBlueprintV7,
  ): Promise<{ readonly chosenRegime?: Exclude<CoupRegimeIdV7, 'NONE'> }> {
    this.clearActiveTimer();
    return new Promise((resolve) => {
      let remainingSec = 20;
      let pickedRegime: Exclude<CoupRegimeIdV7, 'NONE'> =
        this.campaign.computeNaturalCoupRegime();

      const panel = document.createElement('div');
      panel.className = 'ws7-mahogany-panel';

      const header = document.createElement('div');
      header.className = 'ws7-sheet-header';

      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.alignItems = 'center';
      topRow.style.justifyContent = 'space-between';
      topRow.style.gap = '10px';
      const kicker = document.createElement('span');
      kicker.className = 'ws7-subtitle-kicker';
      kicker.textContent = `${blueprint.code} · SEASON ${blueprint.season} MATCHUP${
        blueprint.isVaultDrop
          ? ' · 2:30 AM VAULT SHOWDOWN'
          : blueprint.isGoldenExitMatch
            ? ' · GOLDEN EXIT SPECIAL'
            : ''
      }`;
      const callTimer = document.createElement('span');
      callTimer.className = 'ws7-clue-timer-pill';
      callTimer.textContent = '20s';
      topRow.append(kicker, callTimer);

      const title = document.createElement('h2');
      title.className = 'ws7-display-title';
      title.textContent = blueprint.title;
      header.append(topRow, title);

      const body = document.createElement('div');
      body.className = 'ws7-sheet-body';

      // Full-Bleed Pablo Ferro Split-Screen Matchup Band (ZERO floating inner boxes!)
      const castRow = document.createElement('div');
      castRow.className = 'ws7-callsheet-cast-row';

      const rivalProfile = CAST_PROFILES_V7[blueprint.rivalId];
      const scoutedWeakForSheet =
        this.campaign.getState().scoutingNotebook?.[blueprint.rivalId]?.revealedWeak ?? [];
      const friendlyWeakList = [0, 1, 2]
        .map((idx) =>
          scoutedWeakForSheet[idx]
            ? `💡 ${getFriendlyTvCategoryLabelV7(scoutedWeakForSheet[idx])}`
            : '???',
        )
        .join(' · ');

      const rivalCard = document.createElement('div');
      rivalCard.className = 'ws7-cast-card';
      const rivalPic = document.createElement('div');
      rivalPic.className = 'ws7-gouache-medallion';
      rivalPic.dataset.size = 'lg';
      this.bindPortraitAsset(rivalPic, blueprint.rivalId, 'POISED');
      const rivalMeta = document.createElement('div');
      rivalMeta.innerHTML = `
        <div style="font-family:var(--ws7-font-broadcast);font-size:14px;color:#ff9c78;font-weight:800;letter-spacing:0.06em;">TONIGHT’S CHAMPION</div>
        <div style="font-size:19px;font-weight:800;color:#fff7e6;margin:2px 0;">${rivalProfile.name}</div>
        <div style="font-size:14px;color:#ffd56b;font-weight:700;">Scouted Weak Spots: ${friendlyWeakList}</div>
      `;
      rivalCard.append(rivalPic, rivalMeta);

      const speakerIsSameAsRival = blueprint.coldOpenLine.speaker === blueprint.rivalId;
      const secondCardCastId: CastIdV7 = speakerIsSameAsRival
        ? blueprint.canaryBroker
        : blueprint.coldOpenLine.speaker;
      const speakerProfile = CAST_PROFILES_V7[secondCardCastId];
      const speakerCard = document.createElement('div');
      speakerCard.className = 'ws7-cast-card';
      speakerCard.dataset.role = 'speaker';
      const speakerPic = document.createElement('div');
      speakerPic.className = 'ws7-gouache-medallion';
      speakerPic.dataset.size = 'lg';
      this.bindPortraitAsset(speakerPic, secondCardCastId, 'TELL');
      const speakerMeta = document.createElement('div');
      speakerMeta.innerHTML = speakerIsSameAsRival
        ? `
        <div style="font-family:var(--ws7-font-broadcast);font-size:14px;color:#22c7d8;font-weight:800;letter-spacing:0.06em;">BACKSTAGE MIC · ${speakerProfile.name.toUpperCase()}</div>
        <div style="font-size:14.5px;line-height:1.4;color:#f7eedb;margin-top:3px;">${rivalProfile.name} whispered: “${formatOrphanProofCopyV7(blueprint.coldOpenLine.line)}”</div>
      `
        : `
        <div style="font-family:var(--ws7-font-broadcast);font-size:14px;color:#22c7d8;font-weight:800;letter-spacing:0.06em;">GREEN ROOM · ${speakerProfile.name.toUpperCase()}</div>
        <div style="font-size:14.5px;line-height:1.4;color:#f7eedb;margin-top:3px;">“${formatOrphanProofCopyV7(blueprint.coldOpenLine.line)}”</div>
      `;
      speakerCard.append(speakerPic, speakerMeta);

      castRow.append(rivalCard, speakerCard);

      const teletype = document.createElement('div');
      teletype.className = 'ws7-teletype-strip';
      teletype.textContent = blueprint.boothCheatHint;
      this.scheduleFlowTimeout(() => {
        teletype.dataset.faded = 'true';
        teletype.textContent =
          'STAGE MANAGER CLEARED THE WIRE — TARGET THE CHAMPION’S WEAK-SPOT TILES!';
      }, 3600);

      body.append(castRow, teletype);

      if (blueprint.season === 4) {
        const jury: VipJuryBallotV7 = this.campaign.evaluateVipJuryBallot(blueprint.rivalId);
        const juryBox = document.createElement('div');
        juryBox.className = 'ws7-vellum-card';
        juryBox.dataset.accent = 'gold';
        juryBox.innerHTML = `
          <div class="ws7-subtitle-kicker">OVERHEAD VIP JURY · 1 BOON & 1 BANE</div>
          <div style="font-size:14.5px;font-weight:800;margin-top:5px;color:#0e7c40;">BOON (${CAST_PROFILES_V7[jury.boonVoter].name}): ${jury.boonTitle} — ${jury.boonSummary}</div>
          <div style="font-size:14.5px;font-weight:800;margin-top:4px;color:#b32620;">BANE (${CAST_PROFILES_V7[jury.baneVoter].name}): ${jury.baneTitle} — ${jury.baneSummary}</div>
        `;
        body.appendChild(juryBox);
      }

      if (blueprint.isCoupPivot) {
        const coupBox = document.createElement('div');
        coupBox.className = 'ws7-vellum-card';
        coupBox.dataset.accent = 'tangerine';
        const coupTitle = document.createElement('div');
        coupTitle.className = 'ws7-subtitle-kicker';
        coupTitle.textContent = 'SEASON 3 NETWORK COUP · CHOOSE WHO TAKES CONTROL BOOTH A';
        const coupRow = document.createElement('div');
        coupRow.className = 'ws7-btn-row';
        coupRow.style.marginTop = '10px';

        const regimes: ReadonlyArray<{
          id: Exclude<CoupRegimeIdV7, 'NONE'>;
          label: string;
        }> = [
          { id: 'REGIME_A_ROZ_PHARMA', label: 'ROZ KORMAN (PHARMA SYNDICATE)' },
          { id: 'REGIME_B_BELLAMY_UHF', label: 'GRANT BELLAMY (UHF CRUSADE)' },
          { id: 'REGIME_C_VERA_FORENSIC', label: 'VERA KARP (FORENSIC AUDIT)' },
        ];
        const renderRegimes = (): void => {
          coupRow.innerHTML = '';
          for (const r of regimes) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = pickedRegime === r.id ? 'ws7-crimson-btn' : 'ws7-teal-btn';
            b.textContent = r.label;
            b.addEventListener('click', () => {
              pickedRegime = r.id;
              renderRegimes();
            });
            coupRow.appendChild(b);
          }
        };
        renderRegimes();
        coupBox.append(coupTitle, coupRow);
        body.appendChild(coupBox);
      }

      const stepOut = (): void => {
        this.clearActiveTimer();
        resolve({
          chosenRegime: blueprint.isCoupPivot ? pickedRegime : undefined,
        });
      };

      const footer = document.createElement('div');
      footer.className = 'ws7-sheet-footer';
      const stepBtn = document.createElement('button');
      stepBtn.type = 'button';
      stepBtn.className = 'ws7-primary-btn';
      stepBtn.textContent = 'STEP ONTO STAGE 6A →';
      stepBtn.addEventListener('click', stepOut);
      footer.appendChild(stepBtn);

      panel.append(header, body, footer);
      this.mountModalContent(panel);

      this.activeTimerHandle = window.setInterval(() => {
        remainingSec -= 1;
        callTimer.textContent = `${Math.max(0, remainingSec)}s`;
        callTimer.dataset.urgent = remainingSec <= 5 ? 'true' : 'false';
        if (remainingSec <= 0) {
          stepOut();
        }
      }, 1000);
    });
  }

  // --------------------------------------------------------------------------
  // Screen 4: THE STAR — 1966 RCA Studio Cue-Card Monitor + TV Twist Flares
  // --------------------------------------------------------------------------

  public getToyMountElement(): HTMLDivElement {
    return this.toyBayEl;
  }

  public syncLifelineButtons(
    fiftyFiftyAvailable: boolean,
    audiencePollAvailable: boolean,
    freeSwapAvailable: boolean = Boolean(this.activeUseFreeSwapHandler),
  ): void {
    const renderPaddle = (
      iconSvg: string,
      title: string,
      sub: string,
    ): string =>
      `<span class="ws7-lifeline-lamp" aria-hidden="true"></span>${iconSvg}<span class="ws7-lifeline-copy-stack"><span class="ws7-lifeline-main-lbl">${title}</span><span class="ws7-lifeline-sub-lbl">${sub}</span></span>`;

    this.fiftyFiftyBtnEl.disabled = !fiftyFiftyAvailable;
    this.fiftyFiftyBtnEl.innerHTML = fiftyFiftyAvailable
      ? renderPaddle(SVG_SCISSORS_1966, '50/50 CUT', 'Cuts 2 Wrong')
      : renderPaddle(SVG_SCISSORS_1966, '50/50 CUT', 'Used This Show');

    this.audiencePollBtnEl.disabled = !audiencePollAvailable;
    this.audiencePollBtnEl.innerHTML = audiencePollAvailable
      ? renderPaddle(SVG_POLL_BARS_1966, 'ASK AUDIENCE', '50M TV Poll')
      : renderPaddle(SVG_POLL_BARS_1966, 'ASK AUDIENCE', 'Used This Show');

    this.freeSwapBtnEl.disabled = !freeSwapAvailable;
    this.freeSwapBtnEl.innerHTML = freeSwapAvailable
      ? renderPaddle(SVG_FREE_SWAP_1966, 'FREE SWAP', 'New Question')
      : renderPaddle(SVG_FREE_SWAP_1966, 'FREE SWAP', 'Used This Show');
  }

  public setQuestionPollSummary(summaryText: string): void {
    const existing = this.clueStakesMetaEl.dataset.baseTags ?? '';
    this.clueStakesMetaEl.textContent = existing
      ? `${existing}  ·  ${summaryText}`
      : summaryText;
  }

  public updateQuestionHostLine(
    text: string,
    mood: EmceeMoodV7 = 'WINK',
    lockedIn: boolean = false,
  ): void {
    this.hostDeskStripEl.dataset.locked = lockedIn ? 'true' : 'false';
    this.hostDeskAvatarEl.style.backgroundPosition =
      EMCEE_SPRITE_POSITIONS_V7[mood] ?? EMCEE_SPRITE_POSITIONS_V7.POISED;
    this.hostDeskQuipEl.textContent = formatOrphanProofCopyV7(text);
  }

  public openQuestionChassis(spec: QuestionChassisOpenSpecV7): HTMLDivElement {
    const activeTwist: ClassicTvTileTwistV9 =
      spec.tvTwist && spec.tvTwist !== 'NONE'
        ? spec.tvTwist
        : spec.isShowcaseFormat
          ? 'SHOWCASE_BONUS'
          : 'NONE';

    const flareSpec =
      activeTwist !== 'NONE' ? TV_TWIST_FLARE_SPECS_V7[activeTwist] : undefined;
    const domainRibbon = LIVING_COLOR_DOMAIN_RIBBONS_V7[spec.clue.domain];

    // Apply Dramatic 1966 Living Color Twist Flare to Monitor & Header!
    this.questionChassisEl.dataset.twist = spec.isFinalWager ? 'SECRET_SQUARE' : activeTwist;
    this.questionChassisEl.dataset.blitz = this.blitzModeActive ? 'true' : 'false';
    this.clueHeaderRowEl.dataset.flare =
      flareSpec || spec.isMatchPointTurn || spec.isFinalWager ? 'true' : 'false';

    if (spec.isFinalWager) {
      this.clueHeaderRowEl.style.background =
        'linear-gradient(95deg, #10357a 0%, #1e56c5 48%, #b86800 100%)';
      this.clueHeaderRowEl.style.color = '#ffffff';
      this.clueStakesChipEl.style.background = 'rgba(92, 48, 27, 0.42)';
      this.clueStakesChipEl.style.color = '#ffd56b';

      this.twistFlareStripEl.dataset.twist = 'SECRET_SQUARE';
      this.twistFlareStripEl.textContent =
        spec.baseChips > 0
          ? `★ ACT III · FINAL BROADCAST WAGER · $${spec.baseChips.toLocaleString()} AT STAKE!`
          : '★ ACT III · FINAL BROADCAST WAGER · SAFE $0 PLAY!';
      this.twistFlareStripEl.classList.remove('ws7-hidden');
    } else if (spec.isMatchPointTurn) {
      this.clueHeaderRowEl.style.background =
        'linear-gradient(95deg, #a81812 0%, #e03e36 52%, #b86800 100%)';
      this.clueHeaderRowEl.style.color = '#ffffff';
      this.clueStakesChipEl.style.background = 'rgba(92, 48, 27, 0.36)';
      this.clueStakesChipEl.style.color = '#ffd56b';

      this.twistFlareStripEl.dataset.twist = 'MATCH_POINT';
      this.twistFlareStripEl.textContent = '🚨 THIS CLUE FOR THE SHOW! · FINAL TURN MATCH POINT!';
      this.twistFlareStripEl.classList.remove('ws7-hidden');
    } else if (flareSpec) {
      this.clueHeaderRowEl.style.background = flareSpec.headerBg;
      this.clueHeaderRowEl.style.color = flareSpec.headerInk;
      this.clueStakesChipEl.style.background = flareSpec.chipBg;
      this.clueStakesChipEl.style.color = flareSpec.chipInk;

      const cleanShowcaseName = spec.showcaseFormatName
        ? spec.showcaseFormatName.toUpperCase().replace(/^STUDIO\s+/i, '')
        : '';
      this.twistFlareStripEl.dataset.twist = activeTwist;
      this.twistFlareStripEl.textContent =
        activeTwist === 'SHOWCASE_BONUS' && cleanShowcaseName
          ? `★ STUDIO SHOWCASE · ${cleanShowcaseName}`
          : flareSpec.flareBanner;
      this.twistFlareStripEl.classList.remove('ws7-hidden');
    } else if (spec.isAct3Showdown && !this.blitzModeActive) {
      this.clueHeaderRowEl.style.background = domainRibbon.bg;
      this.clueHeaderRowEl.style.color = domainRibbon.ink;
      this.clueStakesChipEl.style.background = domainRibbon.chipBg;
      this.clueStakesChipEl.style.color = domainRibbon.chipInk;

      this.twistFlareStripEl.dataset.twist = 'SECRET_SQUARE';
      this.twistFlareStripEl.textContent = '⚡ DOUBLE-DOLLARS SHOWDOWN · 1.5× ACT III STAKES!';
      this.twistFlareStripEl.classList.remove('ws7-hidden');
    } else {
      this.clueHeaderRowEl.style.background = domainRibbon.bg;
      this.clueHeaderRowEl.style.color = domainRibbon.ink;
      this.clueStakesChipEl.style.background = domainRibbon.chipBg;
      this.clueStakesChipEl.style.color = domainRibbon.chipInk;

      this.twistFlareStripEl.dataset.twist = 'NONE';
      this.twistFlareStripEl.textContent = '';
      this.twistFlareStripEl.classList.add('ws7-hidden');
    }

    const friendlyCat = getFriendlyTvCategoryLabelV7(spec.clue.category);
    const headerCatLabel = friendlyCat;
    this.domainPillEl.innerHTML = '';
    const catWrapEl = document.createElement('span');
    catWrapEl.className = 'ws7-cat-label-wrap';
    catWrapEl.textContent = headerCatLabel;
    const cashPillEl = document.createElement('span');
    cashPillEl.className = 'ws7-cat-cash-pill';
    cashPillEl.textContent = `$${spec.baseChips}`;
    this.domainPillEl.append(catWrapEl, cashPillEl);

    // Keep header stakes chip razor-compact & 1:1 exact with Post-Answer totalMult (e.g. 1.35x -> 1.35x, 1.50x -> 1.5x!)
    const chipParts: string[] = [];
    if (!this.blitzModeActive) {
      if (spec.liveMultPreview > 1.02) {
        const m = Math.round(spec.liveMultPreview * 100) / 100;
        const fmtMult = Math.abs(Math.round(m * 10) - m * 10) < 0.005 ? m.toFixed(1) : m.toFixed(2);
        chipParts.push(`${fmtMult}×`);
      } else if (flareSpec) {
        chipParts.push(flareSpec.badge);
      }
    }
    this.clueStakesChipEl.textContent = chipParts.join(' ');
    this.clueStakesChipEl.classList.toggle('ws7-hidden', this.blitzModeActive || chipParts.length === 0);

    // Live Host Grant Bellamy 1-Line Studio Desk Setup
    const defaultHostIntro = spec.isFinalWager
      ? `Final Wager on the line—$${spec.baseChips.toLocaleString()} riding on ${friendlyCat}!`
      : `${friendlyCat} for $${spec.baseChips}—thirty seconds on the Studio 6A clock!`;
    const hideHostStripForBlitz = this.blitzModeActive && !spec.hostIntroLine;
    this.hostDeskStripEl.classList.toggle('ws7-hidden', hideHostStripForBlitz);
    if (!hideHostStripForBlitz) {
      this.updateQuestionHostLine(
        spec.hostIntroLine || defaultHostIntro,
        spec.hostMood ?? (spec.isFinalWager || spec.isMatchPointTurn ? 'INTENSE' : 'POISED'),
        false,
      );
    }

    // Plain-English Zero-Assumption Micro-Instruction + Optional `? TIP` Button
    this.activeOpenQuestionCoachHandler = spec.onOpenQuestionCoach ?? null;
    this.clueTipBtnEl.classList.toggle('ws7-hidden', !spec.onOpenQuestionCoach);
    if (spec.plainMicroTip) {
      this.plainMicroTipEl.innerHTML = '';
      const bEl = document.createElement('span');
      bEl.className = 'ws7-plain-micro-badge';
      const badgeRaw = spec.plainMicroTip.badge.trim();
      bEl.textContent = /[?!:]$/.test(badgeRaw) ? badgeRaw : `${badgeRaw}:`;
      const copyEl = document.createElement('span');
      copyEl.textContent = spec.plainMicroTip.plainInstruction;
      this.plainMicroTipEl.append(bEl, copyEl);
      this.plainMicroTipEl.classList.remove('ws7-hidden');
    } else {
      this.plainMicroTipEl.textContent = '';
      this.plainMicroTipEl.classList.add('ws7-hidden');
    }

    // Big, Arm's-Length Readable Clue Stem (extract duplicated mechanical prefix into kicker pill!)
    const rawStem = spec.clue.stem.trim();
    this.clueStemEl.dataset.rawStem = rawStem;
    const prefixRe =
      /^(Before or After|Odd One Out|Who or What Am I|Higher or Lower|Spot the Myth|Finish the Line)(?:\s*[!?:—-]+|\s+(?=[A-Z“"']))\s*/i;
    const prefixMatch = prefixRe.exec(rawStem);
    const extractedRemainder = prefixMatch ? rawStem.slice(prefixMatch[0].length).trim() : '';
    let stemForDisplay = rawStem;
    if (prefixMatch && extractedRemainder.length >= 16) {
      this.clueStemKickerEl.textContent = prefixMatch[1].toUpperCase();
      this.clueStemKickerEl.classList.remove('ws7-hidden');
      stemForDisplay = extractedRemainder.replace(/^[a-z]/, (c) => c.toUpperCase());
    } else {
      this.clueStemKickerEl.textContent = '';
      this.clueStemKickerEl.classList.add('ws7-hidden');
    }
    const formattedStem = formatOrphanProofCopyV7(stemForDisplay);
    this.clueStemEl.textContent = formattedStem;
    this.clueStemEl.dataset.long = formattedStem.length > 155 ? 'true' : 'false';

    const bonusTags: string[] = [];
    if (!this.blitzModeActive) {
      if (spec.isWheelhouse) bonusTags.push('★ CHAMPION WEAK SPOT (+0.5× BONUS)');
      if (spec.hasAmberTruce) bonusTags.push('✦ STUDIO TRUCE BONUS (+0.35×)');
    }
    const baseTags = bonusTags.join('  ·  ');
    this.clueStakesMetaEl.dataset.baseTags = baseTags;
    this.clueStakesMetaEl.textContent = baseTags;
    this.clueStakesMetaEl.classList.toggle('ws7-hidden', this.blitzModeActive || baseTags.length === 0);

    this.activeUseFiftyFiftyHandler = this.blitzModeActive ? null : (spec.onUseFiftyFifty ?? null);
    this.activeUseAudiencePollHandler = this.blitzModeActive ? null : (spec.onUseAudiencePoll ?? null);
    this.activeUseFreeSwapHandler = this.blitzModeActive ? null : (spec.onUseFreeSwap ?? null);
    const hasFifty = Boolean(this.activeUseFiftyFiftyHandler);
    const hasPoll = Boolean(this.activeUseAudiencePollHandler);
    const hasSwap = Boolean(this.activeUseFreeSwapHandler);
    const visibleCols = (hasFifty ? 1 : 0) + (hasPoll ? 1 : 0) + (hasSwap ? 1 : 0);
    const showLifelines = !this.blitzModeActive && visibleCols > 0;
    this.lifelineBarEl.classList.toggle('ws7-hidden', !showLifelines);
    this.lifelineBarEl.dataset.cols = String(Math.max(1, visibleCols));
    this.fiftyFiftyBtnEl.classList.toggle('ws7-hidden', !hasFifty);
    this.audiencePollBtnEl.classList.toggle('ws7-hidden', !hasPoll);
    this.freeSwapBtnEl.classList.toggle('ws7-hidden', !hasSwap);
    if (showLifelines) {
      this.syncLifelineButtons(
        Boolean(spec.fiftyFiftyAvailable),
        Boolean(spec.audiencePollAvailable),
        Boolean(spec.freeSwapAvailable),
      );
    }

    this.activeNoTimerMode = Boolean(spec.noTimerMode);
    this.questionMaxCountdownSec = Math.max(
      1,
      spec.totalCountdownSeconds ?? spec.countdownSeconds,
    );
    this.updateQuestionCountdown(spec.countdownSeconds);

    this.questionOpenedAtMs = typeof performance !== 'undefined' ? performance.now() : 0;
    this.sawFreshPointerDownInToyBay = false;
    this.toyBayEl.innerHTML = '';
    this.questionStageEl.classList.remove('ws7-hidden');
    this.syncBoardModeRibbonVisibility();
    return this.toyBayEl;
  }

  public updateQuestionCountdown(secondsRemaining: number): void {
    if (this.activeNoTimerMode || !Number.isFinite(secondsRemaining)) {
      this.clueTimerPillEl.textContent = '∞ NO TIMER';
      this.clueTimerPillEl.dataset.notimer = 'true';
      this.clueTimerPillEl.dataset.urgent = 'false';
      this.clueTimerBarFillEl.style.width = '100%';
      this.clueTimerBarFillEl.dataset.phase = 'calm';
      return;
    }

    this.clueTimerPillEl.dataset.notimer = 'false';
    const clampedSec = Math.max(0, secondsRemaining);
    const ceilSec = Math.ceil(clampedSec);
    const ratio = Math.max(0, Math.min(1, clampedSec / this.questionMaxCountdownSec));

    this.clueTimerPillEl.textContent = `${ceilSec}s`;
    this.clueTimerPillEl.dataset.urgent = ceilSec <= 6 ? 'true' : 'false';

    this.clueTimerBarFillEl.style.width = `${(ratio * 100).toFixed(1)}%`;
    this.clueTimerBarFillEl.dataset.phase =
      ceilSec <= 6 ? 'urgent' : ceilSec <= 12 || ratio <= 0.4 ? 'warn' : 'calm';
  }

  public closeQuestionChassis(): void {
    this.questionStageEl.classList.add('ws7-hidden');
    this.questionChassisEl.dataset.twist = 'NONE';
    this.activeUseFiftyFiftyHandler = null;
    this.activeUseAudiencePollHandler = null;
    this.activeUseFreeSwapHandler = null;
    this.activeOpenQuestionCoachHandler = null;
    this.activeNoTimerMode = false;
    this.toyBayEl.innerHTML = '';
    this.syncBoardModeRibbonVisibility();
  }

  // --------------------------------------------------------------------------
  // R2: 60-Second Blitz HUD, Time Delta Burst & 45s Winner's Circle Modal
  // --------------------------------------------------------------------------

  public setBlitzHudMode(opts: {
    readonly active: boolean;
    readonly passesRemaining?: number;
    readonly passCooldownSec?: number;
    readonly nextPassCostSec?: number;
    readonly hits?: number;
    readonly streakMult?: number;
  }): void {
    this.blitzModeActive = Boolean(opts.active);
    this.topBugWrapEl.dataset.blitz = this.blitzModeActive ? 'true' : 'false';
    this.questionChassisEl.dataset.blitz = this.blitzModeActive ? 'true' : 'false';
    this.blitzHudBannerEl.classList.toggle('ws7-hidden', !this.blitzModeActive);
    this.blitzPassBarEl.classList.toggle('ws7-hidden', !this.blitzModeActive);
    this.rivalBoxEl.hidden = this.blitzModeActive;
    this.rivalBoxEl.classList.toggle('ws7-hidden', this.blitzModeActive);
    this.turboBugBtn.classList.toggle('ws7-hidden', this.blitzModeActive);
    this.censorPaddleBtn.classList.toggle('ws7-hidden', this.blitzModeActive);

    if (!this.blitzModeActive) {
      this.blitzTimeDeltaEl.classList.add('ws7-hidden');
      this.hostDeskStripEl.classList.remove('ws7-hidden');
      this.clueStakesChipEl.classList.remove('ws7-hidden');
      this.clueStakesMetaEl.classList.remove('ws7-hidden');
      this.syncBoardModeRibbonVisibility();
      return;
    }

    this.clueStakesChipEl.classList.add('ws7-hidden');
    this.clueStakesMetaEl.classList.add('ws7-hidden');
    this.lifelineBarEl.classList.add('ws7-hidden');
    this.mercyBellBtn.classList.add('ws7-hidden');
    this.hotMicHudBtn.classList.add('ws7-hidden');
    this.hudActionStripEl.classList.add('ws7-hidden');
    this.syncBoardModeRibbonVisibility();

    const passesLeft = Math.max(0, Math.floor(opts.passesRemaining ?? 0));
    const cooldown = Math.max(0, opts.passCooldownSec ?? 0);
    const nextCost = opts.nextPassCostSec ?? (passesLeft > 0 ? 0 : -2.0);
    const hits = Math.max(0, Math.floor(opts.hits ?? 0));
    const mult = opts.streakMult ?? 1.0;

    this.blitzHudBannerEl.innerHTML = `
      <div class="ws9-blitz-stats-row">
        <span>⚡ 60-SECOND BLITZ</span>
        <span>HITS: ${hits} · ${mult.toFixed(2).replace(/\.00$/, '.0')}×</span>
        <span>${passesLeft > 0 ? `${passesLeft} FREE PASSES` : 'PASS: -2.0s'}</span>
      </div>
    `;

    this.blitzPassBarEl.disabled = cooldown > 0.05;
    if (cooldown > 0.05) {
      this.blitzPassBarEl.textContent = `⏭ PASS READY IN ${cooldown.toFixed(1)}s`;
    } else if (passesLeft > 0) {
      this.blitzPassBarEl.textContent = `⏭ PASS — NEXT CLUE (${passesLeft} FREE)`;
    } else {
      this.blitzPassBarEl.textContent = `⏭ PASS — NEXT CLUE (${nextCost.toFixed(1)}s)`;
    }
  }

  public showBlitzTimeDelta(deltaSec: number): void {
    if (this.blitzDeltaTimeout !== null) {
      window.clearTimeout(this.blitzDeltaTimeout);
      this.blitzDeltaTimeout = null;
    }
    const isGain = deltaSec >= 0;
    this.blitzTimeDeltaEl.dataset.kind = isGain ? 'gain' : 'loss';
    this.blitzTimeDeltaEl.textContent = `${isGain ? '+' : ''}${deltaSec.toFixed(1)}s`;
    this.blitzTimeDeltaEl.classList.remove('ws7-hidden');
    this.blitzDeltaTimeout = window.setTimeout(() => {
      this.blitzTimeDeltaEl.classList.add('ws7-hidden');
      this.blitzDeltaTimeout = null;
    }, 680);
  }

  public openWinnersCirclePromptV9(
    opts: WinnersCirclePromptOptionsV9,
  ): Promise<'PLAY' | 'BANK'> {
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = 'ws9-modal-backdrop';

      const card = document.createElement('section');
      card.className = 'ws9-winners-circle-card';
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-modal', 'true');
      card.setAttribute('aria-label', "45-Second Winner's Circle Bonus Sprint");

      const header = document.createElement('header');
      header.className = 'ws9-shell-header';
      header.innerHTML = `
        <div>
          <div class="ws9-shell-kicker">VICTORY BONUS INVITATION · RISK-FREE SPRINT</div>
          <h2 class="ws9-shell-title">45s WINNER’S CIRCLE</h2>
        </div>
      `;

      const body = document.createElement('div');
      body.className = 'ws9-shell-body';
      body.innerHTML = `
        <div class="ws9-pill-badge" style="align-self:flex-start;background:#dcfce7;border-color:#15803d;color:#14532d;">
          🛡️ YOUR MATCH WINNINGS ($${Math.max(0, Math.floor(opts.matchWinningsSC)).toLocaleString()} SC) ARE 100% SAFE!
        </div>
        <p style="margin:0;font-size:16px;font-weight:700;line-height:1.4;">
          Step into the 45-second Winner’s Circle spotlight! Answer 6 escalating clues ($100 → $100 → $150 → $150 → $200 → $300) for up to <strong>+$1,500 Showroom Cash</strong> and a <strong>Free Curtain Ticket</strong> on a 6/6 Sweep!
        </p>
        <div class="ws9-pill-badge">⚡ 45.0s CLOCK · WRONG: -5.0s · PASS: -3.0s · ZERO RISK TO BANKED CASH</div>
      `;

      const footer = document.createElement('footer');
      footer.className = 'ws9-shell-footer';

      let settled = false;
      const finish = (choice: 'PLAY' | 'BANK'): void => {
        if (settled) return;
        settled = true;
        backdrop.remove();
        resolve(choice);
      };

      const bankBtn = document.createElement('button');
      bankBtn.type = 'button';
      bankBtn.className = 'ws9-btn ws9-btn-cream';
      bankBtn.textContent = 'BANK & CONTINUE';
      bankBtn.addEventListener('click', () => {
        opts.onTapSfx?.();
        finish('BANK');
      });

      const playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.className = 'ws9-btn ws9-btn-tangerine';
      playBtn.dataset.action = 'play-winners-circle';
      playBtn.textContent = '⚡ PLAY 45s WINNER’S CIRCLE (+$1,500 UP FOR GRABS)';
      playBtn.addEventListener('click', () => {
        opts.onTapSfx?.();
        finish('PLAY');
      });

      footer.append(bankBtn, playBtn);
      card.append(header, body, footer);
      backdrop.appendChild(card);
      this.host.appendChild(backdrop);
    });
  }

  public openWinnersCircleSprintV9(
    opts: WinnersCircleSprintOptionsV9,
  ): Promise<WinnersCircleSprintResultV9> {
    const ladderValues = [100, 100, 150, 150, 200, 300] as const;
    const clues = opts.clues.slice(0, 6);
    const maxSec = opts.totalClockSec ?? 45.0;

    return new Promise((resolve) => {
      if (clues.length === 0) {
        resolve({ bonusCashEarned: 0, hits: 0, sweptAllSix: false });
        return;
      }

      let clockRemaining = maxSec;
      let idx = 0;
      let hits = 0;
      let bonusCashEarned = 0;
      let locked = false;
      let settled = false;
      const stepStates: Array<'pending' | 'current' | 'won' | 'miss'> = clues.map((_, i) =>
        i === 0 ? 'current' : 'pending',
      );

      const backdrop = document.createElement('div');
      backdrop.className = 'ws9-modal-backdrop';

      const card = document.createElement('section');
      card.className = 'ws9-winners-circle-card';
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-modal', 'true');
      card.setAttribute('aria-label', "45s Winner's Circle Sprint");

      const header = document.createElement('header');
      header.className = 'ws9-shell-header';
      const titleBox = document.createElement('div');
      titleBox.innerHTML = `
        <div class="ws9-shell-kicker">45s WINNER’S CIRCLE · 6-CLUE BONUS SPRINT</div>
        <h2 class="ws9-shell-title">SHOWROOM BONUS SPRINT</h2>
      `;
      const clockBadge = document.createElement('span');
      clockBadge.className = 'ws9-pill-badge';
      clockBadge.style.fontSize = '16px';
      clockBadge.textContent = `${clockRemaining.toFixed(1)}s`;
      header.append(titleBox, clockBadge);

      const body = document.createElement('div');
      body.className = 'ws9-shell-body';

      const stepsRow = document.createElement('div');
      stepsRow.className = 'ws9-winners-circle-steps';

      const clueCard = document.createElement('div');
      clueCard.style.display = 'flex';
      clueCard.style.flexDirection = 'column';
      clueCard.style.gap = '10px';

      body.append(stepsRow, clueCard);
      card.append(header, body);
      backdrop.appendChild(card);
      this.host.appendChild(backdrop);

      let lastTickMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
      let timerId: number | null = null;
      let dwellId: number | null = null;

      const renderSteps = (): void => {
        stepsRow.innerHTML = '';
        clues.forEach((_, i) => {
          const st = document.createElement('div');
          st.className = 'ws9-wc-step';
          st.dataset.state = stepStates[i] ?? 'pending';
          st.textContent = `$${ladderValues[i] ?? 150}`;
          stepsRow.appendChild(st);
        });
      };

      const finishSprint = (): void => {
        if (settled) return;
        settled = true;
        if (timerId !== null) window.clearInterval(timerId);
        if (dwellId !== null) window.clearTimeout(dwellId);

        const sweptAllSix = hits === 6 && clues.length === 6;
        const totalAward = bonusCashEarned + (sweptAllSix ? 500 : 0);
        opts.onCompleteSfx?.(sweptAllSix);

        stepsRow.innerHTML = '';
        renderSteps();
        clueCard.innerHTML = `
          <div style="padding:14px;border-radius:14px;border:2px solid var(--ws9-brass);background:var(--ws9-cream-bright);text-align:center;">
            <div class="ws9-pill-badge" style="margin-bottom:8px;">
              ${sweptAllSix ? '👑 6/6 SWEEP JACKPOT! +$500 &amp; FREE CURTAIN TICKET!' : `★ WINNER’S CIRCLE COMPLETE · ${hits}/${clues.length} HITS`}
            </div>
            <div style="font-family:var(--ws66-font-show,'Caprasimo',serif);font-size:32px;color:var(--ws9-emerald);">
              +$${totalAward.toLocaleString()} SHOWROOM CASH
            </div>
            <p style="margin:6px 0 0;font-weight:700;font-size:14px;">Credited straight to your 1966 Prize Showroom bankroll!</p>
          </div>
        `;
        const doneBtn = document.createElement('button');
        doneBtn.type = 'button';
        doneBtn.className = 'ws9-btn ws9-btn-peacock';
        doneBtn.style.width = '100%';
        doneBtn.textContent = 'BANK BONUS & CONTINUE ▸';
        doneBtn.addEventListener('click', () => {
          opts.onTapSfx?.();
          backdrop.remove();
          resolve({
            bonusCashEarned,
            hits,
            sweptAllSix,
          });
        });
        clueCard.appendChild(doneBtn);
      };

      const advanceClue = (): void => {
        idx += 1;
        if (idx >= clues.length || clockRemaining <= 0) {
          finishSprint();
          return;
        }
        stepStates[idx] = 'current';
        locked = false;
        renderCurrentClue();
      };

      const renderCurrentClue = (): void => {
        renderSteps();
        const clue = clues[idx];
        const value = ladderValues[idx] ?? 150;
        clueCard.innerHTML = '';

        const meta = document.createElement('div');
        meta.style.display = 'flex';
        meta.style.justifyContent = 'space-between';
        meta.style.alignItems = 'center';
        meta.innerHTML = `
          <span class="ws9-pill-badge">${getFriendlyTvCategoryLabelV7(clue.category)}</span>
          <span class="ws9-pill-badge" style="background:var(--ws9-gold);color:var(--ws9-ink);">CLUE ${idx + 1}/6 · +$${value}</span>
        `;

        const stemEl = document.createElement('p');
        stemEl.style.margin = '0';
        stemEl.style.fontSize = 'clamp(17px, 4.2vw, 21px)';
        stemEl.style.fontWeight = '800';
        stemEl.style.lineHeight = '1.35';
        stemEl.textContent = formatOrphanProofCopyV7(clue.stem);

        const optGrid = document.createElement('div');
        optGrid.style.display = 'grid';
        optGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
        optGrid.style.gap = '8px';

        const letters = ['A', 'B', 'C', 'D'] as const;
        clue.choices.forEach((choice, cIdx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ws9-btn ws9-btn-cream';
          btn.style.justifyContent = 'flex-start';
          btn.style.textAlign = 'left';
          btn.style.textTransform = 'none';
          btn.textContent = `${letters[cIdx] ?? cIdx + 1}. ${choice}`;
          btn.addEventListener('click', () => {
            if (locked || settled) return;
            locked = true;
            const correct = cIdx === clue.answerIdx;
            opts.onAnswerSfx?.(correct);
            if (correct) {
              hits += 1;
              bonusCashEarned += value;
              stepStates[idx] = 'won';
              btn.className = 'ws9-btn ws9-btn-emerald';
            } else {
              clockRemaining = Math.max(0, clockRemaining - 5.0);
              clockBadge.textContent = `${clockRemaining.toFixed(1)}s`;
              stepStates[idx] = 'miss';
              btn.className = 'ws9-btn ws9-btn-cerise';
            }
            dwellId = window.setTimeout(advanceClue, 180);
          });
          optGrid.appendChild(btn);
        });

        const passBtn = document.createElement('button');
        passBtn.type = 'button';
        passBtn.className = 'ws9-blitz-pass-bar';
        passBtn.textContent = '⏭ PASS (-3.0s) — NEXT CLUE';
        passBtn.addEventListener('click', () => {
          if (locked || settled) return;
          locked = true;
          opts.onPassSfx?.();
          clockRemaining = Math.max(0, clockRemaining - 3.0);
          clockBadge.textContent = `${clockRemaining.toFixed(1)}s`;
          stepStates[idx] = 'miss';
          dwellId = window.setTimeout(advanceClue, 150);
        });

        clueCard.append(meta, stemEl, optGrid, passBtn);
      };

      timerId = window.setInterval(() => {
        if (settled) return;
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const dt = Math.min(0.25, (now - lastTickMs) / 1000);
        lastTickMs = now;
        if (!locked) {
          clockRemaining = Math.max(0, clockRemaining - dt);
          clockBadge.textContent = `${clockRemaining.toFixed(1)}s`;
          if (clockRemaining <= 0) {
            finishSprint();
          }
        }
      }, 100);

      renderCurrentClue();
    });
  }

  // --------------------------------------------------------------------------
  // Screen 5: 2.20s High-Contrast Post-Answer Solari Showcase (Tap-to-Skip >=500ms)
  // --------------------------------------------------------------------------

  public playPostAnswerTheater(spec: PostAnswerTheaterSpecV7): Promise<void> {
    this.closeQuestionChassis();
    const minDwell = spec.turboMode ? 550 : 1850;
    const dwellMs = Math.max(minDwell, spec.dwellMs ?? (spec.turboMode ? 650 : 2200));

    return new Promise((resolve) => {
      let resolved = false;
      let autoTimeout: number | null = null;
      const openedAt = typeof performance !== 'undefined' ? performance.now() : 0;

      const card = document.createElement('div');
      card.className = 'ws7-theater-card';
      card.style.cursor = 'pointer';
      card.style.setProperty('--ws7-dwell-ms', `${dwellMs}ms`);

      const crest = document.createElement('div');
      crest.className = 'ws7-theater-crest';
      if (spec.resolution.isCorrect) {
        crest.dataset.verdict = 'correct';
        crest.textContent = '★ DING! CORRECT! ★';
      } else if (spec.economy.scored) {
        crest.dataset.verdict = 'partial';
        crest.textContent = `CLOSE CALL · ${Math.round(spec.resolution.accuracyRatio * 100)}%`;
      } else {
        crest.dataset.verdict = 'wrong';
        crest.textContent = spec.resolution.triggeredKlaxon
          ? 'BUZZER TRAP — WRONG!'
          : 'TIME / MISS';
      }

      const creamBand = document.createElement('div');
      creamBand.className = 'ws7-theater-cream-band';

      if (spec.hostQuip) {
        const hostRow = document.createElement('div');
        hostRow.className = 'ws7-theater-host-row';
        const hostPic = document.createElement('div');
        hostPic.className = 'ws7-host-desk-avatar';
        hostPic.dataset.size = 'md';
        const mood: EmceeMoodV7 =
          spec.hostMood ??
          (spec.resolution.isCorrect
            ? 'WINK'
            : spec.resolution.triggeredKlaxon
              ? 'GASP'
              : 'POISED');
        hostPic.style.backgroundImage = `url("${EMCEE_MEDALLION_ASSET_V7}")`;
        hostPic.style.backgroundSize = '200% 200%';
        hostPic.style.backgroundPosition = EMCEE_SPRITE_POSITIONS_V7[mood];

        const hostBubble = document.createElement('div');
        hostBubble.className = 'ws7-theater-host-copy';
        hostBubble.innerHTML = `<span class="ws7-theater-host-name">GRANT BELLAMY:</span> “${formatOrphanProofCopyV7(spec.hostQuip)}”`;
        hostRow.append(hostPic, hostBubble);
        creamBand.appendChild(hostRow);
      }

      const answerKicker = document.createElement('div');
      answerKicker.className = 'ws7-theater-answer-kicker';
      answerKicker.textContent = spec.resolution.isCorrect
        ? 'OFFICIAL STUDIO ANSWER'
        : 'THE CORRECT ANSWER WAS';

      const answerPlaque = document.createElement('div');
      answerPlaque.className = 'ws7-theater-answer';
      answerPlaque.textContent = spec.resolution.trueAnswerDisplay;

      const ahaRibbon = document.createElement('div');
      ahaRibbon.className = 'ws7-aha-ribbon';
      ahaRibbon.textContent = formatOrphanProofCopyV7(spec.ahaFactoid);

      creamBand.append(answerKicker, answerPlaque, ahaRibbon);

      if (spec.discoveryCallout) {
        const discEl = document.createElement('div');
        discEl.style.fontFamily = 'var(--ws7-font-broadcast)';
        discEl.style.fontSize = '14.5px';
        discEl.style.fontWeight = '900';
        discEl.style.color = '#0e7c40';
        discEl.textContent = spec.discoveryCallout;
        creamBand.appendChild(discEl);
      }

      // High-Contrast Solari Odometer Row — Crisp & Visible Immediately (Rolls at t+120ms!)
      const odoRow = document.createElement('div');
      odoRow.className = 'ws7-odometer-row';

      const chipsCell = document.createElement('span');
      chipsCell.className = 'ws7-odometer-cell';
      chipsCell.textContent = `$${spec.economy.totalChips}`;

      const multSign = document.createElement('span');
      multSign.textContent = '×';

      const multCell = document.createElement('span');
      multCell.className = 'ws7-odometer-cell';
      multCell.textContent = `${spec.economy.totalMult.toFixed(2)}×`;

      const eqSign = document.createElement('span');
      eqSign.textContent = '=';

      const finalOdometerTarget = spec.totalTurnNetCash ?? spec.economy.netCashDelta;
      const cashCell = document.createElement('span');
      cashCell.className = 'ws7-odometer-cell';
      cashCell.dataset.total = 'true';
      if (finalOdometerTarget < 0) {
        cashCell.dataset.negative = 'true';
      } else if (finalOdometerTarget === 0) {
        cashCell.dataset.zero = 'true';
      }
      cashCell.textContent = finalOdometerTarget > 0 ? '+$0' : '$0';

      if (spec.extraBonusLabel) {
        const bonusCell = document.createElement('span');
        bonusCell.className = 'ws7-odometer-cell';
        bonusCell.textContent = spec.extraBonusLabel;
        odoRow.append(chipsCell, multSign, multCell, bonusCell, eqSign, cashCell);
      } else {
        odoRow.append(chipsCell, multSign, multCell, eqSign, cashCell);
      }

      const dwellTrack = document.createElement('div');
      dwellTrack.className = 'ws7-theater-dwell-track';
      const dwellBar = document.createElement('div');
      dwellBar.className = 'ws7-theater-dwell-bar';
      dwellTrack.appendChild(dwellBar);

      const skipHint = document.createElement('div');
      skipHint.className = 'ws7-theater-skip-hint';
      skipHint.textContent = 'TAP ANYWHERE TO CONTINUE';

      card.append(crest, creamBand, odoRow, dwellTrack, skipHint);

      const finishTheater = (): void => {
        if (resolved) return;
        resolved = true;
        if (autoTimeout !== null) {
          this.clearFlowTimeout(autoTimeout);
          autoTimeout = null;
        }
        this.hideModalStage();
        resolve();
      };

      card.addEventListener('click', () => {
        const elapsed =
          typeof performance !== 'undefined' ? performance.now() - openedAt : 999;
        if (elapsed >= 500) {
          finishTheater();
        }
      });

      this.mountModalContent(card, () => {
        const elapsed =
          typeof performance !== 'undefined' ? performance.now() - openedAt : 999;
        if (elapsed >= 500) {
          finishTheater();
        }
      });

      const target = finalOdometerTarget;
      const start = performance.now();
      const rollDuration = 200;
      const stepRoll = (now: number): void => {
        if (resolved) return;
        const p = Math.max(0, Math.min(1, (now - start) / rollDuration));
        const eased = 1 - Math.pow(1 - p, 3);
        const cur = p >= 1 ? target : Math.round(target * eased) || 0;
        cashCell.textContent =
          cur > 0
            ? `+$${cur.toLocaleString()}`
            : cur === 0
              ? '$0'
              : `-$${Math.abs(cur).toLocaleString()}`;
        if (p < 1) {
          this.scheduleFlowRaf(stepRoll);
        }
      };
      this.scheduleFlowRaf(stepRoll);

      autoTimeout = this.scheduleFlowTimeout(finishTheater, dwellMs);
    });
  }

  // --------------------------------------------------------------------------
  // Screen 5B: 1966 Act-Break Bumper & Act III Final Broadcast Wager Climax
  // --------------------------------------------------------------------------

  public playActBreakBumper(spec?: ActBreakBumperSpecV7): Promise<void> {
    this.clearActiveTimer();
    const durationMs = Math.max(900, spec?.durationMs ?? 1650);

    return new Promise((resolve) => {
      let resolved = false;
      let autoTimer: number | null = null;
      const openedAt = typeof performance !== 'undefined' ? performance.now() : 0;

      const finish = (): void => {
        if (resolved) return;
        resolved = true;
        if (autoTimer !== null) {
          this.clearFlowTimeout(autoTimer);
          autoTimer = null;
        }
        this.hideModalStage();
        resolve();
      };

      const card = document.createElement('div');
      card.className = 'ws7-act-bumper-card';
      card.style.cursor = 'pointer';
      card.style.setProperty('--ws7-dwell-ms', `${durationMs}ms`);

      const bulbRail = document.createElement('div');
      bulbRail.className = 'ws7-curtain-bulb-rail';
      for (let i = 0; i < 14; i += 1) {
        const b = document.createElement('span');
        b.className = 'ws7-curtain-bulb';
        b.style.animationDelay = `${(i % 4) * 0.12}s`;
        bulbRail.appendChild(b);
      }

      const actTitle = spec?.actTitle ?? '★ ACT II · DOUBLE-DOLLARS & TWISTS! ★';
      const headline =
        spec?.headline ?? 'Fresh Tote Board Re-Racked · 1.5× Boosted Stakes!';
      const detail =
        spec?.detailLine ??
        'Watch for Instant Bargain Turntables, Brass Safe Keys & Control Booth A Tells!';

      const inner = document.createElement('div');
      inner.className = 'ws7-act-bumper-inner';
      inner.innerHTML = `
        <div class="ws7-subtitle-kicker">STUDIO 6A LIVE NETWORK INTERMISSION</div>
        <h2 class="ws7-act-bumper-title">${actTitle}</h2>
        <div class="ws7-act-bumper-chips">
          <span class="ws7-act-bumper-chip">🔄 FRESH TOTE RACK</span>
          <span class="ws7-act-bumper-chip" data-gold="true">⚡ 1.5× STAKES LIVE</span>
          <span class="ws7-act-bumper-chip">🔔 BARGAINS & TELLS</span>
        </div>
        <div class="ws7-act-bumper-detail">${formatOrphanProofCopyV7(`${headline} — ${detail}`)}</div>
      `;

      const dwellTrack = document.createElement('div');
      dwellTrack.className = 'ws7-theater-dwell-track';
      const dwellBar = document.createElement('div');
      dwellBar.className = 'ws7-theater-dwell-bar';
      dwellTrack.appendChild(dwellBar);

      const skipBar = document.createElement('div');
      skipBar.className = 'ws7-curtain-skip-footer';
      skipBar.textContent = 'TAP ANYWHERE TO LAUNCH ACT II →';

      card.append(bulbRail, inner, dwellTrack, skipBar);

      card.addEventListener('click', () => {
        const elapsed = typeof performance !== 'undefined' ? performance.now() - openedAt : 999;
        if (elapsed >= 140) finish();
      });

      this.mountModalContent(card, () => {
        const elapsed = typeof performance !== 'undefined' ? performance.now() - openedAt : 999;
        if (elapsed >= 140) finish();
      });
      autoTimer = this.scheduleFlowTimeout(finish, durationMs);
    });
  }

  public playFinalBroadcastWagerStage(spec: FinalBroadcastWagerStageSpecV7): Promise<number> {
    this.clearActiveTimer();
    return new Promise((resolve) => {
      let resolved = false;
      const maxWager = Math.max(500, Math.floor(spec.maxWager));
      const hasHouseFloor = spec.playerCash < 500;
      const rivalProfile = CAST_PROFILES_V7[spec.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
      const rivalFirst = rivalProfile.name.split(/\s+/)[0] ?? rivalProfile.name;
      const friendlyCategory = getFriendlyTvCategoryLabelV7(spec.category);

      // Compute authentic game-theory Cover / Catch-Up preset & strategy hint!
      const playerCash = Math.max(0, Math.floor(spec.playerCash));
      const rivalCash = Math.max(0, Math.floor(spec.rivalCash));
      const rivalMax = Math.max(500, rivalCash);
      const rawCoverNeeded = Math.max(0, rivalCash + rivalMax + 50 - playerCash);
      const coverPreset =
        playerCash > rivalCash && rawCoverNeeded > 0 && rawCoverNeeded < maxWager
          ? Math.min(maxWager, Math.ceil(rawCoverNeeded / 50) * 50)
          : null;
      const catchUpNeeded =
        playerCash < rivalCash
          ? Math.min(maxWager, Math.ceil((rivalCash - playerCash + 50) / 50) * 50)
          : null;

      let strategyHint: string;
      if (playerCash > rivalCash + rivalMax) {
        strategyHint = `💡 RUNAWAY LEAD: A $0 Safe Wager guarantees victory over ${rivalFirst}!`;
      } else if (playerCash > rivalCash && coverPreset !== null) {
        strategyHint = `💡 COVER MATH: Wager $${coverPreset.toLocaleString()} to lock out ${rivalFirst} even if they double!`;
      } else if (playerCash === rivalCash) {
        strategyHint = `💡 DEAD-EVEN TIE: Out-wager or out-answer ${rivalFirst} to claim the Studio 6A Crown!`;
      } else if (catchUpNeeded !== null && playerCash + maxWager > rivalCash) {
        strategyHint = `💡 COMEBACK SHOT: Wager $${catchUpNeeded.toLocaleString()}+ to overtake ${rivalFirst}${hasHouseFloor ? ' ($500 House Grudge Stake active!)' : ''}!`;
      } else {
        strategyHint = `💡 ALL-IN CLIMAX: Go All-In ($${maxWager.toLocaleString()}) and hope ${rivalFirst} stumbles!`;
      }

      const w25 = Math.min(maxWager, Math.max(50, Math.round((maxWager * 0.25) / 50) * 50));
      const w50 = Math.min(maxWager, Math.max(100, Math.round((maxWager * 0.5) / 50) * 50));
      const thirdPresetVal =
        coverPreset !== null && coverPreset !== w25 && coverPreset !== maxWager
          ? coverPreset
          : catchUpNeeded !== null && catchUpNeeded !== w25 && catchUpNeeded < maxWager
            ? catchUpNeeded
            : w50;
      const thirdPresetLabel =
        coverPreset !== null && thirdPresetVal === coverPreset
          ? 'COVER BET'
          : catchUpNeeded !== null && thirdPresetVal === catchUpNeeded
            ? 'OVERTAKE'
            : '50% STAKE';

      let selectedWager =
        playerCash > rivalCash + rivalMax
          ? 0
          : coverPreset !== null
            ? coverPreset
            : catchUpNeeded !== null
              ? catchUpNeeded
              : w50;

      const presets: ReadonlyArray<{ label: string; amount: number }> = [
        { label: 'SAFE · $0', amount: 0 },
        { label: `25% · $${w25.toLocaleString()}`, amount: w25 },
        { label: `${thirdPresetLabel} · $${thirdPresetVal.toLocaleString()}`, amount: thirdPresetVal },
        {
          label: `${hasHouseFloor ? 'GRUDGE MAX' : 'ALL-IN'} · $${maxWager.toLocaleString()}`,
          amount: maxWager,
        },
      ];

      const panel = document.createElement('div');
      panel.className = 'ws7-mahogany-panel ws7-final-wager-card ws7-final-wager-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Act III Final Broadcast Wager');

      const header = document.createElement('div');
      header.className = 'ws7-sheet-header ws7-final-wager-header';
      header.innerHTML = `
        <div class="ws7-subtitle-kicker"><span class="ws7-turn-full">${spec.episodeCode} · ACT III CLIMAX · TURN 10 OF 10</span><span class="ws7-turn-short">${spec.episodeCode} · ACT III · TURN 10/10</span></div>
        <h2 class="ws7-display-title">★ Final Broadcast Wager ★</h2>
      `;

      const body = document.createElement('div');
      body.className = 'ws7-sheet-body ws7-final-wager-body';

      // Compact Host Grant Bellamy Strip
      const hostStrip = document.createElement('div');
      hostStrip.className = 'ws7-host-desk-strip ws7-final-wager-host';
      const hostPic = document.createElement('div');
      hostPic.className = 'ws7-host-desk-avatar';
      hostPic.style.backgroundImage = `url("${EMCEE_MEDALLION_ASSET_V7}")`;
      hostPic.style.backgroundSize = '200% 200%';
      hostPic.style.backgroundPosition = EMCEE_SPRITE_POSITIONS_V7.INTENSE;
      const hostCopy = document.createElement('span');
      hostCopy.className = 'ws7-host-desk-quip';
      hostCopy.textContent = formatOrphanProofCopyV7(
        spec.hostPromptLine ??
          'Grant Bellamy: “Fifty million watching—place your Final Broadcast Wager before we unseal the vault!”',
      );
      hostStrip.append(hostPic, hostCopy);

      // Dual Scoreboard + Cover Math Hint
      const scoreBand = document.createElement('div');
      scoreBand.className = 'ws7-final-wager-scores';
      scoreBand.innerHTML = `
        <div class="ws7-final-score-cell" data-side="player">
          <span class="ws7-final-score-tag">YOU${hasHouseFloor ? ' · $500 GRUDGE MAX' : ''}</span>
          <span class="ws7-final-score-val">$${playerCash.toLocaleString()}</span>
        </div>
        <div class="ws7-final-score-cell" data-side="rival">
          <span class="ws7-final-score-tag">${rivalProfile.name.toUpperCase()}</span>
          <span class="ws7-final-score-val">$${rivalCash.toLocaleString()}</span>
        </div>
      `;

      const hintBar = document.createElement('div');
      hintBar.className = 'ws7-final-wager-hint';
      hintBar.textContent = strategyHint;

      // Glowing 1966 Backlit Acrylite Final Category Plaque (Clue Still Sealed!)
      const catPlaque = document.createElement('div');
      catPlaque.className = 'ws7-final-wager-category-plaque';
      const scoutBadge = spec.isScoutedWeak
        ? '<span class="ws7-final-scout-tag" data-kind="weak">💡 RIVAL WEAK SPOT!</span>'
        : spec.isScoutedStrong
          ? '<span class="ws7-final-scout-tag" data-kind="strong">★ RIVAL STRONG TURF</span>'
          : '';
      catPlaque.innerHTML = `
        <div class="ws7-final-cat-kicker"><span class="ws7-turn-full">TONIGHT’S FINAL CATEGORY · CLUE SEALED</span><span class="ws7-turn-short">FINAL CATEGORY · CLUE SEALED</span></div>
        <div class="ws7-final-cat-title">${friendlyCategory} ${scoutBadge}</div>
      `;

      // 4 Strategic 1-Tap Wager Presets + Fine-Tune Stepper
      const controlsWrap = document.createElement('div');
      controlsWrap.className = 'ws7-final-wager-controls';

      const presetGrid = document.createElement('div');
      presetGrid.className = 'ws7-final-preset-grid';
      const presetBtns: HTMLButtonElement[] = [];

      const readoutValEl = document.createElement('span');
      readoutValEl.className = 'ws7-final-stepper-val';

      const lockBtn = document.createElement('button');
      lockBtn.type = 'button';
      lockBtn.className = 'ws7-primary-btn ws7-final-lock-btn';

      const syncWagerUi = (): void => {
        selectedWager = Math.max(0, Math.min(maxWager, Math.round(selectedWager / 50) * 50));
        readoutValEl.textContent = `$${selectedWager.toLocaleString()}`;
        lockBtn.textContent = `LOCK IN $${selectedWager.toLocaleString()} FINAL WAGER →`;
        for (let i = 0; i < presets.length; i += 1) {
          presetBtns[i].dataset.active = presets[i].amount === selectedWager ? 'true' : 'false';
        }
      };

      for (const p of presets) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ws7-final-preset-btn';
        b.textContent = p.label;
        b.addEventListener('click', () => {
          selectedWager = p.amount;
          spec.onWagerTickSfx?.();
          syncWagerUi();
        });
        presetBtns.push(b);
        presetGrid.appendChild(b);
      }

      const stepperRow = document.createElement('div');
      stepperRow.className = 'ws7-final-stepper-row';
      const minusBtn = document.createElement('button');
      minusBtn.type = 'button';
      minusBtn.className = 'ws7-final-step-btn';
      minusBtn.textContent = '− $50';
      minusBtn.addEventListener('click', () => {
        selectedWager = Math.max(0, selectedWager - 50);
        spec.onWagerTickSfx?.();
        syncWagerUi();
      });

      const plusBtn = document.createElement('button');
      plusBtn.type = 'button';
      plusBtn.className = 'ws7-final-step-btn';
      plusBtn.textContent = '+ $50';
      plusBtn.addEventListener('click', () => {
        selectedWager = Math.min(maxWager, selectedWager + 50);
        spec.onWagerTickSfx?.();
        syncWagerUi();
      });

      stepperRow.append(minusBtn, readoutValEl, plusBtn);
      controlsWrap.append(presetGrid, stepperRow);

      body.append(hostStrip, scoreBand, hintBar, catPlaque, controlsWrap);

      const footer = document.createElement('div');
      footer.className = 'ws7-sheet-footer ws7-final-wager-footer';
      lockBtn.addEventListener('click', () => {
        if (resolved) return;
        resolved = true;
        spec.onLockInSfx?.();
        this.hideModalStage();
        resolve(selectedWager);
      });
      footer.appendChild(lockBtn);

      syncWagerUi();
      panel.append(header, body, footer);
      this.mountModalContent(panel);
    });
  }

  public playFinalWagerShowdownReveal(spec: FinalWagerShowdownRevealSpecV7): Promise<void> {
    this.closeQuestionChassis();
    const dwellMs = Math.max(2400, spec.dwellMs ?? 3500);

    return new Promise((resolve) => {
      let resolved = false;
      let autoTimer: number | null = null;
      const openedAt = typeof performance !== 'undefined' ? performance.now() : 0;
      const rivalProfile = CAST_PROFILES_V7[spec.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
      const playerWonShow = spec.finalPlayerCash > spec.finalRivalCash;

      const card = document.createElement('div');
      card.className = 'ws7-theater-card ws7-final-reveal-card';
      card.style.cursor = 'pointer';
      card.style.setProperty('--ws7-dwell-ms', `${dwellMs}ms`);

      const crest = document.createElement('div');
      crest.className = 'ws7-theater-crest';
      crest.dataset.verdict = playerWonShow ? 'correct' : spec.playerCorrect ? 'partial' : 'wrong';
      crest.textContent = playerWonShow
        ? '★ FINAL WAGER SHOWDOWN · YOU WIN! ★'
        : '★ FINAL BROADCAST WAGER TALLY ★';

      const creamBand = document.createElement('div');
      creamBand.className = 'ws7-theater-cream-band ws7-final-reveal-cream';

      const hostRow = document.createElement('div');
      hostRow.className = 'ws7-theater-host-row';
      const hostPic = document.createElement('div');
      hostPic.className = 'ws7-host-desk-avatar';
      hostPic.dataset.size = 'md';
      const mood: EmceeMoodV7 = spec.hostMood ?? (playerWonShow ? 'WINK' : 'INTENSE');
      hostPic.style.backgroundImage = `url("${EMCEE_MEDALLION_ASSET_V7}")`;
      hostPic.style.backgroundSize = '200% 200%';
      hostPic.style.backgroundPosition = EMCEE_SPRITE_POSITIONS_V7[mood];
      const hostBubble = document.createElement('div');
      hostBubble.className = 'ws7-theater-host-copy';
      hostBubble.innerHTML = `<span class="ws7-theater-host-name">GRANT BELLAMY:</span> “${formatOrphanProofCopyV7(spec.hostQuip)}”`;
      hostRow.append(hostPic, hostBubble);

      const answerLine = document.createElement('div');
      answerLine.className = 'ws7-final-reveal-answer';
      answerLine.innerHTML = `<span class="ws7-theater-answer-kicker">OFFICIAL ANSWER:</span> <strong>${spec.trueAnswerDisplay}</strong>`;

      const ahaRibbon = document.createElement('div');
      ahaRibbon.className = 'ws7-aha-ribbon';
      ahaRibbon.textContent = formatOrphanProofCopyV7(spec.ahaFactoid);

      creamBand.append(hostRow, answerLine, ahaRibbon);

      // 2-Beat Podium Showdown Strip (Beat 1: Champion Wager & Answer -> Beat 2: Player Wager & Answer!)
      const podiumGrid = document.createElement('div');
      podiumGrid.className = 'ws7-final-podium-grid';

      const cpuDeltaStr = spec.cpuCorrect
        ? `+$${spec.cpuWager.toLocaleString()}`
        : `-$${spec.cpuWager.toLocaleString()}`;
      const cpuCard = document.createElement('div');
      cpuCard.className = 'ws7-final-podium-box';
      cpuCard.dataset.revealed = 'false';
      cpuCard.dataset.verdict = spec.cpuCorrect ? 'hit' : 'miss';
      cpuCard.innerHTML = `
        <div class="ws7-final-podium-top">
          <span>${rivalProfile.name.toUpperCase()}</span>
          <span class="ws7-final-podium-wager">WAGERED $${spec.cpuWager.toLocaleString()}</span>
        </div>
        <div class="ws7-final-podium-ans">“${spec.cpuAnswerText}”</div>
        <div class="ws7-final-podium-tot">
          <span>${spec.cpuCorrect ? `✓ CORRECT (${cpuDeltaStr})` : `✕ MISSED (${cpuDeltaStr})`}</span>
          <strong>$${spec.finalRivalCash.toLocaleString()}</strong>
        </div>
      `;

      const playerDeltaStr = spec.playerCorrect
        ? `+$${spec.playerWager.toLocaleString()}`
        : `-$${spec.playerWager.toLocaleString()}`;
      const playerCard = document.createElement('div');
      playerCard.className = 'ws7-final-podium-box';
      playerCard.dataset.revealed = 'false';
      playerCard.dataset.verdict = spec.playerCorrect ? 'hit' : 'miss';
      playerCard.innerHTML = `
        <div class="ws7-final-podium-top">
          <span>★ YOU (PODIUM ONE)</span>
          <span class="ws7-final-podium-wager">WAGERED $${spec.playerWager.toLocaleString()}</span>
        </div>
        <div class="ws7-final-podium-ans">“${spec.playerAnswerText}”</div>
        <div class="ws7-final-podium-tot">
          <span>${spec.playerCorrect ? `★ CORRECT! (${playerDeltaStr})` : `✕ MISSED (${playerDeltaStr})`}</span>
          <strong>$${spec.finalPlayerCash.toLocaleString()}</strong>
        </div>
      `;

      podiumGrid.append(cpuCard, playerCard);

      const dwellTrack = document.createElement('div');
      dwellTrack.className = 'ws7-theater-dwell-track';
      const dwellBar = document.createElement('div');
      dwellBar.className = 'ws7-theater-dwell-bar';
      dwellTrack.appendChild(dwellBar);

      const skipHint = document.createElement('div');
      skipHint.className = 'ws7-theater-skip-hint';
      skipHint.textContent = 'TAP ANYWHERE TO ENTER WINNER’S CEREMONY →';

      card.append(crest, creamBand, podiumGrid, dwellTrack, skipHint);

      const finish = (): void => {
        if (resolved) return;
        resolved = true;
        if (autoTimer !== null) {
          this.clearFlowTimeout(autoTimer);
          autoTimer = null;
        }
        this.hideModalStage();
        resolve();
      };

      card.addEventListener('click', () => {
        const elapsed = typeof performance !== 'undefined' ? performance.now() - openedAt : 999;
        if (elapsed >= 600) finish();
      });

      this.mountModalContent(card, () => {
        const elapsed = typeof performance !== 'undefined' ? performance.now() - openedAt : 999;
        if (elapsed >= 600) finish();
      });

      this.scheduleFlowTimeout(() => {
        if (resolved) return;
        cpuCard.dataset.revealed = 'true';
        spec.onCpuRevealSfx?.(spec.cpuCorrect);
      }, 140);

      this.scheduleFlowTimeout(() => {
        if (resolved) return;
        playerCard.dataset.revealed = 'true';
        spec.onPlayerRevealSfx?.(spec.playerCorrect);
      }, 820);

      autoTimer = this.scheduleFlowTimeout(finish, dwellMs);
    });
  }

  // --------------------------------------------------------------------------
  // Screen 6: 12s Commercial-Break Air-Mail Wax-Sealed Canary Dispatch
  // --------------------------------------------------------------------------

  public showCanaryEnvelope(
    blueprint: EpisodeBlueprintV7,
  ): Promise<'POCKET' | 'BURN'> {
    this.clearActiveTimer();
    return new Promise((resolve) => {
      let remainingSec = 12;
      let shattered = false;
      let resolvedOnce = false;
      const equippedRelics = this.campaign.getState().equippedRelics;
      const hasUvRelic = equippedRelics.some((r) => r.relicId === 'relic_uv_blacklight_loupe');
      const hasSignetRelic = equippedRelics.some(
        (r) => r.relicId === 'relic_subpoena_wax_signet',
      );
      const burnCleanBonus = hasSignetRelic ? 275 : 125;
      let uvOn = hasUvRelic;

      const card = document.createElement('div');
      card.className = 'ws7-canary-card';
      card.dataset.uv = 'false';

      const airMailTop = document.createElement('div');
      airMailTop.className = 'ws7-par-avion-trim';
      airMailTop.setAttribute('aria-hidden', 'true');

      const airMailBottom = document.createElement('div');
      airMailBottom.className = 'ws7-par-avion-trim';
      airMailBottom.setAttribute('aria-hidden', 'true');

      const inner = document.createElement('div');
      inner.className = 'ws7-canary-inner';

      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.alignItems = 'center';
      topRow.style.justifyContent = 'space-between';
      topRow.style.width = '100%';
      topRow.style.gap = '10px';
      const kicker = document.createElement('span');
      kicker.className = 'ws7-subtitle-kicker';
      kicker.style.color = '#0f3a4d';
      kicker.textContent = `PAR AVION · COMMERCIAL BREAK · ${CAST_PROFILES_V7[blueprint.canaryBroker].name.toUpperCase()} COURIER`;
      const timerPill = document.createElement('span');
      timerPill.className = 'ws7-clue-timer-pill';
      timerPill.textContent = '12s';
      topRow.append(kicker, timerPill);

      const title = document.createElement('h3');
      title.className = 'ws7-display-title';
      title.style.color = '#121a2b';
      title.style.textAlign = 'center';
      title.textContent = 'A Wax-Sealed Backstage Tip Slid Onto Your Podium';

      const sealWrap = document.createElement('div');
      sealWrap.style.display = 'flex';
      sealWrap.style.flexDirection = 'column';
      sealWrap.style.alignItems = 'center';
      sealWrap.style.gap = '8px';

      const sealBtn = document.createElement('button');
      sealBtn.type = 'button';
      sealBtn.className = 'ws7-wax-seal-btn';
      sealBtn.innerHTML = `
        <svg viewBox="0 0 80 80" width="76" height="76" aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="#c42b23" stroke="#9e1c15" stroke-width="2.5"/>
          <circle cx="40" cy="40" r="29" fill="none" stroke="#ffd56b" stroke-width="1.4" stroke-dasharray="3 2"/>
          <polygon points="40,12 44,28 58,20 48,34 64,40 48,46 58,60 44,52 40,68 36,52 22,60 32,46 16,40 32,34 22,20 36,28" fill="#eb4d44" opacity="0.85"/>
          <circle cx="40" cy="40" r="19" fill="#b3241d" stroke="#fff7e6" stroke-width="1.4"/>
          <text x="40" y="45" text-anchor="middle" fill="#fff7e6" font-family="Jost, sans-serif" font-size="14" font-weight="900">OPEN</text>
        </svg>
      `;
      const sealHint = document.createElement('span');
      sealHint.style.fontSize = '14.5px';
      sealHint.style.fontWeight = '700';
      sealHint.style.color = '#384660';
      sealHint.textContent = 'Tap the red seal to inspect the secret tip before cameras return';
      sealWrap.append(sealBtn, sealHint);

      const openedBody = document.createElement('div');
      openedBody.className = 'ws7-hidden';
      openedBody.style.width = '100%';
      openedBody.style.display = 'flex';
      openedBody.style.flexDirection = 'column';
      openedBody.style.gap = '12px';

      const noteBox = document.createElement('div');
      noteBox.className = 'ws7-grease-note';
      noteBox.textContent = formatOrphanProofCopyV7(blueprint.canaryNote);

      const poisonStamp = document.createElement('div');
      poisonStamp.className = 'ws7-poison-stamp ws7-hidden';
      poisonStamp.textContent = blueprint.canaryIsPoisoned
        ? 'UV ALERT: RIGGED BAIT — DO NOT TRUST!'
        : 'UV CLEAR: GENUINE CONTROL BOOTH INTERCEPT';
      noteBox.appendChild(poisonStamp);

      const syncUvState = (): void => {
        const allowReveal = hasUvRelic && uvOn;
        card.dataset.uv = allowReveal ? 'true' : 'false';
        poisonStamp.classList.toggle('ws7-hidden', !allowReveal);
      };

      const finishChoice = (choice: 'POCKET' | 'BURN'): void => {
        if (resolvedOnce) return;
        resolvedOnce = true;
        this.clearActiveTimer();
        this.campaign.recordCanaryChoice(choice, blueprint.canaryBroker);
        this.hideModalStage();
        resolve(choice);
      };

      const controlsRow = document.createElement('div');
      controlsRow.className = 'ws7-btn-row';

      if (hasUvRelic) {
        const uvBtn = document.createElement('button');
        uvBtn.type = 'button';
        uvBtn.className = 'ws7-teal-btn';
        uvBtn.textContent = 'TOGGLE UV CHECK';
        uvBtn.addEventListener('click', () => {
          uvOn = !uvOn;
          syncUvState();
        });
        controlsRow.appendChild(uvBtn);
      }

      const pocketBtn = document.createElement('button');
      pocketBtn.type = 'button';
      pocketBtn.className = 'ws7-primary-btn';
      pocketBtn.textContent = 'POCKET TIP (+$180)';
      pocketBtn.addEventListener('click', () => finishChoice('POCKET'));

      const burnBtn = document.createElement('button');
      burnBtn.type = 'button';
      burnBtn.className = 'ws7-crimson-btn';
      burnBtn.textContent = `BURN ON AIR (+$${burnCleanBonus} CLEAN)`;
      burnBtn.addEventListener('click', () => finishChoice('BURN'));

      controlsRow.append(pocketBtn, burnBtn);
      openedBody.append(noteBox, controlsRow);

      sealBtn.addEventListener('click', () => {
        if (shattered) return;
        shattered = true;
        sealWrap.classList.add('ws7-hidden');
        openedBody.classList.remove('ws7-hidden');
        syncUvState();
      });

      inner.append(topRow, title, sealWrap, openedBody);
      card.append(airMailTop, inner, airMailBottom);
      this.mountModalContent(card);

      this.activeTimerHandle = window.setInterval(() => {
        remainingSec -= 1;
        timerPill.textContent = `${Math.max(0, remainingSec)}s`;
        timerPill.dataset.urgent = remainingSec <= 4 ? 'true' : 'false';
        if (remainingSec <= 0) {
          finishChoice('BURN');
        }
      }, 1000);
    });
  }

  // --------------------------------------------------------------------------
  // Screen 7: 1966 Prime-Time Dual-Purse Ceremony (ZERO Boxy Cards!)
  // --------------------------------------------------------------------------

  public playDualPurseCeremony(
    blueprint: EpisodeBlueprintV7,
    playerMatchScore: number,
    rivalMatchScore: number,
    summary: EpisodeOutcomeSummaryV7,
    ceremonyExtra?: CeremonyExtraSpecV7,
  ): Promise<'NEXT_EPISODE' | 'PLAY_AGAIN' | 'SAVE_AND_EXIT'> {
    this.clearActiveTimer();
    return new Promise((resolve) => {
      let resolvedOnce = false;
      const finishCeremony = (
        action: 'NEXT_EPISODE' | 'PLAY_AGAIN' | 'SAVE_AND_EXIT',
      ): void => {
        if (resolvedOnce) return;
        resolvedOnce = true;
        this.hideModalStage();
        resolve(action);
      };

      const renderCeremony = (): void => {
        const save = this.campaign.getState();
        const rivalName = CAST_PROFILES_V7[blueprint.rivalId].name;
        const panel = document.createElement('div');
        panel.className = 'ws7-mahogany-panel ws7-ceremony-panel';

        const header = document.createElement('div');
        header.className = summary.wonMatch
          ? 'ws7-sheet-header ws7-ceremony-header-win'
          : 'ws7-sheet-header';
        header.style.background = summary.wonMatch
          ? 'linear-gradient(135deg, #008B94 0%, #005860 100%)'
          : 'linear-gradient(135deg, #b83b18 0%, #5c301b 100%)';

        const headerRow = document.createElement('div');
        headerRow.className = 'ws7-sheet-header-row';
        const headerTitles = document.createElement('div');
        headerTitles.className = 'ws7-sheet-header-titles';

        const kicker = document.createElement('div');
        kicker.className = 'ws7-subtitle-kicker';
        kicker.textContent = `${blueprint.code} OFFICIAL BROADCAST TALLY · ✓ PROGRESS SAVED`;

        const isCoChamp = Boolean(ceremonyExtra?.isCoChampionTie && summary.wonMatch);
        const isZeroZeroTie =
          !summary.wonMatch && playerMatchScore === rivalMatchScore && playerMatchScore === 0;
        const heading = document.createElement('h2');
        heading.className = 'ws7-display-title';
        heading.textContent = isCoChamp
          ? `Studio 6A Co-Champions With ${rivalName}!`
          : summary.wonMatch
            ? `Studio 6A Victory Over ${rivalName}!`
            : isZeroZeroTie
              ? `Deadlock at $0 — $${summary.grudgeBountyStoredOnLoss.toLocaleString()} Comeback Voucher Held`
              : `${rivalName} Took the Hour — $${summary.grudgeBountyStoredOnLoss.toLocaleString()} Carried Over`;
        headerTitles.append(kicker, heading);

        const closeSaveBtn = document.createElement('button');
        closeSaveBtn.type = 'button';
        closeSaveBtn.className = 'ws7-sheet-close-btn';
        closeSaveBtn.setAttribute('aria-label', 'Save and exit to Title Menu');
        closeSaveBtn.title = 'Save & Exit to Title Menu';
        closeSaveBtn.textContent = '✕';
        closeSaveBtn.addEventListener('click', () => finishCeremony('SAVE_AND_EXIT'));

        headerRow.append(headerTitles, closeSaveBtn);
        header.appendChild(headerRow);

        const body = document.createElement('div');
        body.className = 'ws7-sheet-body';

        const champStreak = ceremonyExtra?.returningChampStreak ?? save.returningChampStreak ?? 0;
        if (summary.wonMatch && champStreak >= 1) {
          const crown = document.createElement('div');
          crown.className = 'ws7-champ-crown-banner';
          crown.textContent =
            champStreak >= 2
              ? `👑 ${champStreak}-DAY RETURNING STUDIO CHAMPION STREAK! (+$${champStreak * 75} CROWN BONUS)`
              : '👑 NEW STUDIO 6A RETURNING CHAMPION CROWNED!';
          body.appendChild(crown);
        }

        // Full-Bleed Pablo Ferro Score Showdown Split Banner
        const playerSideTag = isCoChamp
          ? '★ YOU (CO-CHAMPION)'
          : summary.wonMatch
            ? '★ YOU (WINNER)'
            : 'YOU';
        const rivalSideTag = isCoChamp
          ? `★ ${rivalName.toUpperCase()} (CO-CHAMPION)`
          : !summary.wonMatch && !isZeroZeroTie
            ? `★ ${rivalName.toUpperCase()}`
            : rivalName.toUpperCase();
        const versus = document.createElement('div');
        versus.className = 'ws7-ceremony-versus';
        versus.innerHTML = `
          <div class="ws7-ceremony-side" data-side="player">
            <span style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;letter-spacing:0.08em;color:#ffd56b;">${playerSideTag}</span>
            <span class="ws7-ceremony-score-big">$${Math.floor(playerMatchScore).toLocaleString()}</span>
          </div>
          <div class="ws7-ceremony-side" data-side="rival">
            <span style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;letter-spacing:0.08em;color:#ffe3d3;">${rivalSideTag}</span>
            <span class="ws7-ceremony-score-big">$${Math.floor(rivalMatchScore).toLocaleString()}</span>
          </div>
        `;

        // Certified 1966 Network Winner's Check (or Exact Comeback Voucher Held for Next Broadcast!)
        const checkAmount = Math.max(
          0,
          Math.floor(
            summary.wonMatch
              ? summary.cleanCashAdded + summary.contrabandCashAdded
              : summary.grudgeBountyStoredOnLoss,
          ),
        );
        const epSerial = String(blueprint.episodeNumber).padStart(3, '0');
        const checkEl = document.createElement('div');
        checkEl.className = 'ws7-winners-check-1966';
        checkEl.innerHTML = `
          <div class="ws7-check-main-col">
            <div class="ws7-check-bank-row">
              <svg class="ws7-check-rosette-svg" viewBox="0 0 44 44" width="38" height="38" aria-hidden="true">
                <circle cx="22" cy="22" r="20" fill="#5C301B" stroke="#9c6a12" stroke-width="1.8"/>
                <circle cx="22" cy="22" r="16" fill="none" stroke="#f4a91f" stroke-width="1" stroke-dasharray="2.4 1.8"/>
                <path d="M22 29 C18 19 10 18 7 23 C5 26 9 30 14 29 Z" fill="#f4a91f"/>
                <path d="M22 29 C17 15 10 10 10 14 C9 19 14 25 20 29 Z" fill="#ff6738"/>
                <path d="M22 28 C20 13 17 7 19 8 C21 9 22 18 22 28 Z" fill="#e63b7a"/>
                <path d="M22 28 C22 18 23 9 25 8 C27 7 24 13 22 28 Z" fill="#1e56c5"/>
                <path d="M22 29 C26 25 35 19 34 14 C34 10 27 15 22 29 Z" fill="#0096a6"/>
                <circle cx="22" cy="14" r="2.1" fill="#fff7e6"/>
              </svg>
              <div style="min-width:0;flex:1 1 auto;">
                <div class="ws7-check-bank-kicker" style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:#0f3a4d;letter-spacing:0.05em;">IBC · 30 ROCKEFELLER PLAZA, N.Y. · NO. 1966-${epSerial}</div>
                <div class="ws7-check-payee-line" style="font-size:15px;font-weight:800;color:#121a2b;margin-top:1px;">${
                  isCoChamp
                    ? 'PAY TO THE ORDER OF: STUDIO 6A CO-CHAMPION'
                    : summary.wonMatch
                      ? 'PAY TO THE ORDER OF: STUDIO 6A RETURNING CHAMPION'
                      : 'CERTIFIED COMEBACK VOUCHER · HELD FOR NEXT BROADCAST'
                }</div>
              </div>
            </div>
            <div class="ws7-check-words-line">${this.formatCheckAmountWords1966(checkAmount)}</div>
            <div class="ws7-check-sig-micr-row">
              <span class="ws7-check-micr">⑆0210-0002⑆  ⑈1966-${epSerial}⑈  ⑈06A⑈</span>
              <span class="ws7-check-sig-wrap">
                <svg viewBox="0 0 144 28" width="124" height="24" aria-hidden="true">
                  <path d="M8 19 C4 11, 11 3, 19 4 C24 5, 22 14, 15 17 C19 18, 24 13, 25 20 C26 25, 19 25, 17 21" fill="none" stroke="#123866" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M25 16 C28 11, 30 18, 34 14 C37 11, 38 18, 42 14 C45 11, 47 18, 51 13 C54 8, 55 18, 60 15" fill="none" stroke="#123866" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M49 10 L58 9" fill="none" stroke="#123866" stroke-width="1.4" stroke-linecap="round"/>
                  <path d="M69 20 L74 4 M72 6 C80 3, 84 8, 76 12 C85 12, 84 20, 71 19" fill="none" stroke="#123866" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M81 16 C85 12, 88 5, 86 16 C90 12, 93 5, 91 16 C95 12, 98 17, 101 13 C104 11, 106 17, 110 13 C113 11, 116 17, 120 13 C122 18, 118 24, 113 22" fill="none" stroke="#123866" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 23 Q74 20 136 22" fill="none" stroke="#123866" stroke-width="1.15" stroke-linecap="round" opacity="0.82"/>
                </svg>
                <span style="font-family:var(--ws7-font-display);font-style:italic;font-size:14px;color:#384660;">Grant Bellamy, Exec. Producer</span>
              </span>
            </div>
          </div>
          <div class="ws7-check-stub-col">
            <span style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:#0f3a4d;letter-spacing:0.06em;">${summary.wonMatch ? 'CERTIFIED PURSE' : 'VOUCHER CREDIT'}</span>
            <span class="ws7-check-amount-pill">$${checkAmount.toLocaleString()}</span>
          </div>
        `;

        const grid = document.createElement('div');
        grid.className = 'ws7-ceremony-grid';

        const ledger = document.createElement('div');
        ledger.className = 'ws7-ceremony-ledger';
        ledger.innerHTML = `
          <div class="ws7-ledger-row">
            <span class="ws7-ledger-label">CLEAN PURSE (+$${summary.cleanCashAdded.toLocaleString()})</span>
            <span class="ws7-ledger-val" style="color:#007d8c;">$${save.cleanPurseCash.toLocaleString()}</span>
          </div>
          <div class="ws7-ledger-row">
            <span class="ws7-ledger-label">BACKSTAGE CASH (+$${summary.contrabandCashAdded.toLocaleString()})</span>
            <span class="ws7-ledger-val" style="color:#c92a68;">$${save.contrabandTrunkCash.toLocaleString()}</span>
          </div>
          <div class="ws7-ledger-row">
            <span class="ws7-ledger-label">GRUDGE COMEBACK POT</span>
            <span class="ws7-ledger-val" style="color:#d9461a;">$${save.grudgeBountyPool.toLocaleString()}</span>
          </div>
        `;

        const wheelCol = document.createElement('div');
        wheelCol.className = 'ws7-lien-wheel-wrap';
        wheelCol.innerHTML = this.buildBrassLienWheelSvg(save.lienSegmentsPaid);

        const wheelMeta = document.createElement('div');
        wheelMeta.className = 'ws7-lien-meta';
        const wheelCaption = document.createElement('div');
        wheelCaption.style.fontFamily = 'var(--ws7-font-broadcast)';
        wheelCaption.style.fontSize = '14px';
        wheelCaption.style.fontWeight = '900';
        wheelCaption.style.color = '#ffd56b';
        wheelCaption.textContent = `NETWORK BUYOUT: ${save.lienSegmentsPaid} / 12 SPOKES`;
        wheelMeta.appendChild(wheelCaption);

        if (
          save.lienSegmentsPaid < 12 &&
          save.cleanPurseCash >= LIEN_SEGMENT_COST_CASH_V7
        ) {
          const paySpokeBtn = document.createElement('button');
          paySpokeBtn.type = 'button';
          paySpokeBtn.className = 'ws7-teal-btn';
          paySpokeBtn.textContent = `PAY 1 SPOKE ($${LIEN_SEGMENT_COST_CASH_V7.toLocaleString()})`;
          paySpokeBtn.addEventListener('click', () => {
            this.campaign.payBrassLienSegment('CLEAN');
            renderCeremony();
          });
          wheelMeta.appendChild(paySpokeBtn);
        }
        wheelCol.appendChild(wheelMeta);

        grid.append(ledger, wheelCol);
        body.append(versus, checkEl);

        // Wave-4 1966 Broadcast Achievement Ribbons & Medals Rack (Directly beneath Certified Check!)
        const earnedMedals = ceremonyExtra?.earnedCareerMedals ?? [];
        if (earnedMedals.length > 0) {
          const medalRack = document.createElement('div');
          medalRack.className = 'ws7-medal-rack';
          const medalCounts = save.careerMedalCounts ?? {};
          const pillsHtml = earnedMedals
            .map((mId) => {
              const spec = CAREER_MEDAL_SPECS_V7[mId];
              const count = medalCounts[mId] ?? 1;
              return `<span class="ws7-career-medal-pill" data-tier="${spec.tier}" title="${spec.summary}">${spec.icon} ${spec.name.toUpperCase()} (+$${spec.bonusCash}${count > 1 ? ` · ×${count}` : ''})</span>`;
            })
            .join('');
          medalRack.innerHTML = `
            <div style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:#ffd56b;letter-spacing:0.06em;">🏅 1966 BROADCAST ACHIEVEMENT MEDALS AWARDED THIS SHOW</div>
            <div class="ws7-medal-pill-grid">${pillsHtml}</div>
          `;
          body.appendChild(medalRack);
        }

        // 1966 TV Guide "NEXT TIME ON WORLD'S SMARTEST..." Plot Cliffhanger Preview Card!
        if (
          ceremonyExtra?.allowBackstageCustomization &&
          !blueprint.isFinale &&
          ceremonyExtra.nextCliffhangerTeaser
        ) {
          const teaser = ceremonyExtra.nextCliffhangerTeaser;
          const nextProf =
            CAST_PROFILES_V7[teaser.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
          const cliffCard = document.createElement('div');
          cliffCard.className = 'ws7-next-time-cliffhanger-card';

          const cliffKicker = document.createElement('div');
          cliffKicker.className = 'ws7-next-time-kicker';
          cliffKicker.textContent = `📺 NEXT TIME ON WORLD’S SMARTEST · ${teaser.episodeCode} · ${teaser.stakesTag}`;

          const cliffRow = document.createElement('div');
          cliffRow.className = 'ws7-next-time-row';

          const nextPic = document.createElement('div');
          nextPic.className = 'ws7-gouache-medallion';
          this.bindPortraitAsset(nextPic, teaser.rivalId, 'POISED');

          const cliffCopy = document.createElement('div');
          cliffCopy.className = 'ws7-next-time-copy';
          cliffCopy.innerHTML = `
            <div class="ws7-next-time-title">“${teaser.title}” · vs. ${nextProf.name} <span class="ws7-next-time-stage">(${teaser.stageCallsign})</span></div>
            <div class="ws7-next-time-hook">${formatOrphanProofCopyV7(teaser.hookCopy)}</div>
          `;

          cliffRow.append(nextPic, cliffCopy);
          cliffCard.append(cliffKicker, cliffRow);
          body.appendChild(cliffCard);
        }

        body.appendChild(grid);

        // Loss-Empathy Persistent Run Gains (Zero Wasted Runs!)
        if (!summary.wonMatch && summary.grudgeBountyStoredOnLoss > 0) {
          const empathyCard = document.createElement('div');
          empathyCard.className = 'ws7-vellum-card';
          empathyCard.dataset.accent = 'tangerine';
          empathyCard.innerHTML = `<strong style="font-size:14.5px;color:#b32620;">🔥 COMEBACK VOUCHER BANKED (+$${summary.grudgeBountyStoredOnLoss.toLocaleString()}):</strong> <span style="font-size:14.5px;font-weight:700;">50% of your match score is locked into the Grudge Comeback Pot for your next win—plus all Scouted Tells & Career Ribbons stay permanently!</span>`;
          body.appendChild(empathyCard);
        }

        if (
          !summary.wonMatch &&
          ceremonyExtra?.consolationShowroomCash !== undefined &&
          ceremonyExtra.consolationShowroomCash > 0
        ) {
          const scConsolationCard = document.createElement('div');
          scConsolationCard.className = 'ws7-vellum-card';
          scConsolationCard.dataset.accent = 'gold';
          scConsolationCard.innerHTML = `<strong style="font-size:14.5px;color:#5C301B;">🎁 50% CONSOLATION SHOWROOM CASH (+$${ceremonyExtra.consolationShowroomCash.toLocaleString()} SC):</strong> <span style="font-size:14.5px;font-weight:700;">Spendable right now in the 1966 Prize Showroom — completely separate from your Campaign Purse!</span>`;
          body.appendChild(scConsolationCard);
        }

        const newWeak = ceremonyExtra?.newlyScoutedWeak ?? [];
        const newStrong = ceremonyExtra?.newlyScoutedStrong ?? [];
        if (newWeak.length > 0 || newStrong.length > 0 || ceremonyExtra?.scoutedPlaystyleLabel) {
          const scoutCard = document.createElement('div');
          scoutCard.className = 'ws7-vellum-card';
          scoutCard.dataset.accent = 'gold';
          const parts: string[] = [];
          if (newWeak.length > 0) {
            parts.push(
              `💡 Weak Spots Found: ${newWeak.map((c) => getFriendlyTvCategoryLabelV7(c)).join(', ')}`,
            );
          }
          if (newStrong.length > 0) {
            parts.push(
              `★ Strong Turf: ${newStrong.map((c) => getFriendlyTvCategoryLabelV7(c)).join(', ')}`,
            );
          }
          if (ceremonyExtra?.scoutedPlaystyleLabel) {
            parts.push(`Style: ${ceremonyExtra.scoutedPlaystyleLabel}`);
          }
          scoutCard.innerHTML = `<strong style="display:inline-flex;align-items:center;gap:5px;font-size:14.5px;color:#0f3a4d;">${SVG_DOSSIER_TAB_1966}<span>SCOUTING NOTEBOOK UPDATED (${rivalName}):</span></strong> <span style="font-size:14.5px;font-weight:700;">${parts.join(' · ')}</span>`;
          body.appendChild(scoutCard);
        }

        // Zeigarnik "NEXT UNLOCKABLE & TROPHY CLOSE TO COMPLETION" Progress Teaser!
        const equippedSet = new Set(save.equippedRelics.map((r) => r.relicId));
        const nextCleanProp = [...RELIC_CATALOG_V7]
          .filter((r) => r.ledgerKind === 'CLEAN' && !equippedSet.has(r.relicId))
          .sort((a, b) => a.costCash - b.costCash)[0];
        const unlockedSet = new Set(save.unlockedTrophyIds);
        const nextTrophy =
          TROPHY_CATALOG_V7.find((t) => !unlockedSet.has(t.trophyId) && t.season <= save.season) ??
          TROPHY_CATALOG_V7.find((t) => !unlockedSet.has(t.trophyId));
        const masteredModesCount = save.masteredBoardModes?.length ?? 0;

        if (nextCleanProp || nextTrophy) {
          const progressCard = document.createElement('div');
          progressCard.className = 'ws7-unlock-progress-card';
          const propRatio = nextCleanProp
            ? Math.min(1, Math.max(0.06, save.cleanPurseCash / Math.max(1, nextCleanProp.costCash)))
            : 1;
          const propPct = Math.round(propRatio * 100);
          const cashShortfall = nextCleanProp
            ? Math.max(0, nextCleanProp.costCash - save.cleanPurseCash)
            : 0;
          const propLine = nextCleanProp
            ? cashShortfall === 0
              ? `★ PROP READY TO PACK IN SHOP: ${nextCleanProp.name} ($${nextCleanProp.costCash})!`
              : `NEXT STUDIO PROP (${propPct}%): ${nextCleanProp.name} — Only $${cashShortfall.toLocaleString()} Clean Purse away!`
            : `ALL CLEAN STUDIO PROPS READY · ${unlockedSet.size}/36 TROPHIES EARNED`;
          const trophyLine = nextTrophy
            ? `🏆 NEXT TROPHY TARGET: ${nextTrophy.name} — ${nextTrophy.unlockRuleText}`
            : '🏆 ALL 36 BROADCAST TROPHIES UNLOCKED!';

          progressCard.innerHTML = `
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;">
              <span style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:#007d8c;letter-spacing:0.04em;">${propLine}</span>
              <span style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:#0f3a4d;">${masteredModesCount}/${ALL_BOARD_PLAY_MODES_V7.length} BOARD MODES MASTERED</span>
            </div>
            <div class="ws7-unlock-meter-track"><div class="ws7-unlock-meter-fill" style="width:${propPct}%;"></div></div>
            <div style="font-size:14px;font-weight:700;color:#384660;">${formatOrphanProofCopyV7(trophyLine)}</div>
          `;
          body.appendChild(progressCard);
        }

        if (summary.liberatedRival) {
          const libBanner = document.createElement('div');
          libBanner.className = 'ws7-vellum-card';
          libBanner.dataset.accent = 'gold';
          libBanner.innerHTML = `<strong style="font-size:15px;">GOLDEN EXIT LIBERATION:</strong> <span style="font-size:15px;">${CAST_PROFILES_V7[summary.liberatedRival].name} tore up IBC’s debt bond and pledged permanent Season 4 VIP Jury support!</span>`;
          body.appendChild(libBanner);
        }

        if (summary.newlyUnlockedTrophies.length > 0) {
          const trophyStrip = document.createElement('div');
          trophyStrip.className = 'ws7-vellum-card';
          trophyStrip.dataset.accent = 'tangerine';
          const names = summary.newlyUnlockedTrophies.map((t) => t.name).join(' · ');
          trophyStrip.innerHTML = `<strong style="font-size:15px;">★ TROPHY EARNED:</strong> <span style="font-size:15px;">${names}</span>`;
          body.appendChild(trophyStrip);
        }

        const footer = document.createElement('div');
        footer.className = 'ws7-sheet-footer ws7-ceremony-footer';
        const isCampaignMode = Boolean(ceremonyExtra?.allowBackstageCustomization);
        footer.dataset.mode = isCampaignMode ? 'campaign' : 'quickplay';

        const hasLossRematchCta =
          !summary.wonMatch &&
          Boolean(ceremonyExtra?.onRematchClick || ceremonyExtra?.rematchButtonLabel);

        const saveExitBtn = document.createElement('button');
        saveExitBtn.type = 'button';
        saveExitBtn.className = 'ws7-ceremony-save-exit-btn';
        saveExitBtn.title = 'Save all progress, medals & cash and return to the Start Screen';
        saveExitBtn.innerHTML = hasLossRematchCta
          ? '<span>🏠 TITLE HUB</span>'
          : `${SVG_REEL_VAULT_1966}<span>SAVE &amp; EXIT</span>`;
        saveExitBtn.addEventListener('click', () => {
          finishCeremony('SAVE_AND_EXIT');
        });
        footer.appendChild(saveExitBtn);

        if (this.callbacks.onOpenCareerStats) {
          const statsBtn = document.createElement('button');
          statsBtn.type = 'button';
          statsBtn.className = 'ws7-secondary-btn';
          statsBtn.textContent = 'STATS & CHARTS';
          statsBtn.addEventListener('click', () => {
            this.callbacks.onOpenCareerStats?.();
          });
          footer.appendChild(statsBtn);
        }

        if (this.callbacks.onPlayEndCredits) {
          const creditsBtn = document.createElement('button');
          creditsBtn.type = 'button';
          creditsBtn.className = 'ws7-secondary-btn';
          creditsBtn.textContent = '1966 CREDITS ▶';
          creditsBtn.addEventListener('click', () => {
            this.callbacks.onPlayEndCredits?.();
          });
          footer.appendChild(creditsBtn);
        }

        if (isCampaignMode) {
          footer.dataset.hasBackstageRow = 'true';
          const perksBtn = document.createElement('button');
          perksBtn.type = 'button';
          perksBtn.className = 'ws7-secondary-btn ws7-ceremony-perks-btn';
          perksBtn.innerHTML = `${SVG_BRASS_CLIPBOARD_1966}<span>PERKS</span>`;
          perksBtn.addEventListener('click', () => {
            void this.showReleaseWaiver({ betweenEpisodes: true }).then(() => renderCeremony());
          });

          const shopBtn = document.createElement('button');
          shopBtn.type = 'button';
          shopBtn.className = 'ws7-teal-btn ws7-ceremony-shop-btn';
          const slotCountLabel = `(${save.equippedRelics.length}/${MAX_TRUNK_SLOTS_V7})`;
          shopBtn.innerHTML = `<span class="ws7-shop-full">★ PROP SHOP ${slotCountLabel}</span><span class="ws7-shop-compact">★ PROPS ${slotCountLabel}</span>`;
          shopBtn.addEventListener('click', () => {
            this.openPropTrunkModal(false, () => renderCeremony());
          });

          footer.append(perksBtn, shopBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'ws7-primary-btn ws7-ceremony-next-btn';
        const compactNextMode = ceremonyExtra?.nextBoardModeTitle
          ? ceremonyExtra.nextBoardModeTitle
              .replace(/^HOLLYWOOD SQUARES\s*·\s*/i, '')
              .replace(/^CONCENTRATION '65\s*·\s*/i, '')
              .replace(/^LET'S MAKE A DEAL\s*·\s*/i, '')
              .replace(/^PRESS YOUR LUCK '66\s*·\s*/i, '')
          : '';
        const shortNextName = ceremonyExtra?.nextRivalName
          ? (ceremonyExtra.nextRivalName.trim().split(/\s+/)[0] ?? ceremonyExtra.nextRivalName)
          : '';
        const teaserText = !isCampaignMode
          ? 'PLAY ANOTHER SHOW →'
          : ceremonyExtra?.nextRivalName && compactNextMode
            ? `UP NEXT: vs. ${ceremonyExtra.nextRivalName} · ${compactNextMode}! →`
            : `NEXT BROADCAST: ${formatEpisodeCodeV7(summary.nextEpisodeNumber)} →`;
        const shortTeaserText = !isCampaignMode
          ? 'PLAY AGAIN →'
          : shortNextName
            ? `UP NEXT: VS. ${shortNextName.toUpperCase()} →`
            : `NEXT: ${formatEpisodeCodeV7(summary.nextEpisodeNumber)} →`;
        if (blueprint.isFinale && summary.wonMatch) {
          nextBtn.textContent = 'WATCH STAGE-10 FINALE EPILOGUE →';
        } else if (summary.triggeredVaultDropNext) {
          nextBtn.textContent = 'ENTER 2:30 AM VAULT SHOWDOWN →';
        } else {
          nextBtn.innerHTML = `<span class="ws7-next-cta-full">${teaserText}</span><span class="ws7-next-cta-short">${shortTeaserText}</span>`;
        }
        nextBtn.addEventListener('click', () => {
          if (blueprint.isFinale && summary.wonMatch) {
            void this.playEndingEpilogue(summary.unlockedEnding ?? undefined).then(() => {
              if (!resolvedOnce) {
                resolvedOnce = true;
                resolve('SAVE_AND_EXIT');
              }
            });
          } else {
            finishCeremony(isCampaignMode ? 'NEXT_EPISODE' : 'PLAY_AGAIN');
          }
        });

        if (hasLossRematchCta) {
          const rematchBtn = document.createElement('button');
          rematchBtn.type = 'button';
          rematchBtn.className = 'ws7-primary-btn ws9-rematch-cta';
          rematchBtn.dataset.action = 'rematch';
          rematchBtn.textContent =
            ceremonyExtra?.rematchButtonLabel ?? '🔥 PLAY RETURN CHAMPION REMATCH';
          rematchBtn.addEventListener('click', () => {
            ceremonyExtra?.onRematchClick?.();
            finishCeremony('PLAY_AGAIN');
          });
          footer.appendChild(rematchBtn);
        } else {
          footer.appendChild(nextBtn);
        }
        panel.append(header, body, footer);
        this.mountModalContent(panel, () => finishCeremony('SAVE_AND_EXIT'));
      };

      renderCeremony();
    });
  }

  public playEndingEpilogue(initialEnding?: FinaleEndingSpecV7): Promise<void> {
    const eligible = this.campaign.getEligibleFinaleEndings();
    let activeEnding: FinaleEndingSpecV7 =
      initialEnding ?? eligible[0] ?? FINALE_ENDINGS_V7.ENDING_02_NEW_VELVET_HOST;

    return new Promise((resolve) => {
      const renderEnding = (): void => {
        const panel = document.createElement('div');
        panel.className = 'ws7-mahogany-panel';

        const header = document.createElement('div');
        header.className = 'ws7-sheet-header';
        const kicker = document.createElement('div');
        kicker.className = 'ws7-subtitle-kicker';
        kicker.textContent = activeEnding.subtitle;

        const title = document.createElement('h2');
        title.className = 'ws7-display-title';
        title.textContent = activeEnding.title;
        header.append(kicker, title);

        const body = document.createElement('div');
        body.className = 'ws7-sheet-body';

        const vellum = document.createElement('div');
        vellum.className = 'ws7-sheet-band';
        vellum.dataset.surface = 'cream';
        vellum.innerHTML = `
          <div style="font-family:var(--ws7-font-broadcast);font-size:15px;font-weight:900;color:#d9461a;letter-spacing:0.06em;margin-bottom:8px;">${activeEnding.headlineBanner}</div>
          ${activeEnding.epilogueParagraphs
            .map(
              (p) =>
                `<p style="font-size:15.5px;line-height:1.5;margin:0 0 10px 0;color:#121a2b;font-weight:600;">${formatOrphanProofCopyV7(p)}</p>`,
            )
            .join('')}
        `;
        body.appendChild(vellum);

        if (eligible.length > 1) {
          const switchBand = document.createElement('div');
          switchBand.className = 'ws7-sheet-band';
          const switchRow = document.createElement('div');
          switchRow.className = 'ws7-btn-row';
          for (const opt of eligible) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className =
              opt.endingId === activeEnding.endingId
                ? 'ws7-teal-btn'
                : 'ws7-secondary-btn';
            b.textContent = opt.title;
            b.addEventListener('click', () => {
              activeEnding = opt;
              this.campaign.commitFinaleEndingSelection(opt.endingId);
              renderEnding();
            });
            switchRow.appendChild(b);
          }
          switchBand.appendChild(switchRow);
          body.appendChild(switchBand);
        }

        const footer = document.createElement('div');
        footer.className = 'ws7-sheet-footer';
        const doneBtn = document.createElement('button');
        doneBtn.type = 'button';
        doneBtn.className = 'ws7-primary-btn';
        doneBtn.textContent = 'RETURN TO STUDIO 6A HUB';
        doneBtn.addEventListener('click', () => {
          this.campaign.commitFinaleEndingSelection(activeEnding.endingId);
          this.hideModalStage();
          resolve();
        });
        footer.appendChild(doneBtn);
        panel.append(header, body, footer);
        this.mountModalContent(panel);
      };

      renderEnding();
    });
  }

  private formatCheckAmountWords1966(amount: number): string {
    const clean = Math.max(0, Math.min(999_999, Math.floor(amount)));
    if (clean === 0) return 'ZERO AND 00/100 DOLLARS ★★★★';
    const ones = [
      '',
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
    ];
    const tens = [
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
    ];
    const underThousand = (n: number): string => {
      const parts: string[] = [];
      if (n >= 100) {
        parts.push(`${ones[Math.floor(n / 100)]} HUNDRED`);
        n %= 100;
      }
      if (n >= 20) {
        const t = tens[Math.floor(n / 10)];
        const o = ones[n % 10];
        parts.push(o ? `${t}-${o}` : t);
      } else if (n > 0) {
        parts.push(ones[n]);
      }
      return parts.join(' ');
    };
    const chunks: string[] = [];
    const thousands = Math.floor(clean / 1000);
    const rem = clean % 1000;
    if (thousands > 0) {
      chunks.push(`${underThousand(thousands)} THOUSAND`);
    }
    if (rem > 0) {
      chunks.push(underThousand(rem));
    }
    return `${chunks.join(' ')} AND 00/100 DOLLARS ★★★★`;
  }

  private buildBrassLienWheelSvg(paidCount: number): string {
    const spokes: string[] = [];
    for (let i = 0; i < 12; i += 1) {
      const a0 = ((i * 30 - 90) * Math.PI) / 180;
      const a1 = (((i + 1) * 30 - 92) * Math.PI) / 180;
      const rIn = 24;
      const rOut = 60;
      const x1 = 68 + Math.cos(a0) * rIn;
      const y1 = 68 + Math.sin(a0) * rIn;
      const x2 = 68 + Math.cos(a0) * rOut;
      const y2 = 68 + Math.sin(a0) * rOut;
      const x3 = 68 + Math.cos(a1) * rOut;
      const y3 = 68 + Math.sin(a1) * rOut;
      const x4 = 68 + Math.cos(a1) * rIn;
      const y4 = 68 + Math.sin(a1) * rIn;
      const paid = i < paidCount;
      const fill = paid ? '#f4a91f' : '#13324d';
      const stroke = paid ? '#fff7e6' : '#0096a6';
      spokes.push(
        `<polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)} ${x4.toFixed(1)},${y4.toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>`,
      );
    }
    return `<svg class="ws7-lien-svg" viewBox="0 0 136 136" aria-label="12-Segment Network Buyout Wheel"><circle cx="68" cy="68" r="64" fill="#5c301b" stroke="#d9a441" stroke-width="2.5"/>${spokes.join('')}<circle cx="68" cy="68" r="21" fill="#3e2012" stroke="#f4a91f" stroke-width="2.2"/><text x="68" y="73" text-anchor="middle" fill="#fff7e6" font-family="Jost, sans-serif" font-size="14" font-weight="900">${paidCount}/12</text></svg>`;
  }

  // --------------------------------------------------------------------------
  // Screen 8: Zero-Box Studio Guide, Prop Shop, 36-Trophy Vault, Archive & Sound
  // --------------------------------------------------------------------------

  private createDismissibleSheetHeader(
    kickerText: string,
    titleText: string,
    onDismiss: () => void,
    closeAriaLabel: string = 'Close dialog',
  ): HTMLDivElement {
    const header = document.createElement('div');
    header.className = 'ws7-sheet-header';

    const row = document.createElement('div');
    row.className = 'ws7-sheet-header-row';

    const titles = document.createElement('div');
    titles.className = 'ws7-sheet-header-titles';

    const kicker = document.createElement('div');
    kicker.className = 'ws7-subtitle-kicker';
    kicker.textContent = kickerText;

    const heading = document.createElement('h2');
    heading.className = 'ws7-display-title';
    heading.textContent = titleText;

    titles.append(kicker, heading);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ws7-sheet-close-btn';
    closeBtn.setAttribute('aria-label', closeAriaLabel);
    closeBtn.title = closeAriaLabel;
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', onDismiss);

    row.append(titles, closeBtn);
    header.appendChild(row);
    return header;
  }

  public openHowToPlayModal(onClose?: () => void): void {
    const dismiss = (): void => {
      this.hideUtilityModalStage();
      onClose?.();
    };

    const panel = document.createElement('div');
    panel.className = 'ws7-mahogany-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'How to Play World’s Smartest');

    const headerKicker = this.isDailyBroadcastMatch
      ? 'DAILY 1966 BROADCAST · OFFICIAL CONTESTANT BRIEFING'
      : this.isQuickPlayMatch
        ? '1966 QUICK SHOW · STUDIO 6A BRIEFING'
        : '1966 STUDIO 6A · CONTESTANT BRIEFING';

    const header = this.createDismissibleSheetHeader(
      headerKicker,
      'How to Play World’s Smartest',
      dismiss,
      'Close How to Play Guide',
    );

    const body = document.createElement('div');
    body.className = 'ws7-sheet-body';

    if (this.activeBoardModeBanner) {
      const modeCallout = document.createElement('div');
      modeCallout.className = 'ws7-vellum-card';
      modeCallout.dataset.accent = 'gold';
      modeCallout.innerHTML = `
        <div class="ws7-subtitle-kicker">TONIGHT’S BOARD MODE · ${this.activeBoardModeBanner.modeTitle}</div>
        <div style="font-size:15px;font-weight:700;color:#121a2b;margin-top:3px;line-height:1.35;">${this.activeBoardModeBanner.ruleSummary}</div>
      `;
      body.appendChild(modeCallout);
    }

    const activeTwistSpec = this.activeBoardTwistId
      ? BOARD_TWIST_SPECS_V7[this.activeBoardTwistId]
      : undefined;
    if (activeTwistSpec) {
      const twistCallout = document.createElement('div');
      twistCallout.className = 'ws7-vellum-card';
      twistCallout.dataset.accent = 'teal';
      twistCallout.innerHTML = `
        <div class="ws7-subtitle-kicker">${activeTwistSpec.iconGlyph} ACTIVE STAGE TWIST · ${activeTwistSpec.name}</div>
        <div style="font-size:15px;font-weight:700;color:#121a2b;margin-top:3px;line-height:1.35;">${activeTwistSpec.shortRule}</div>
      `;
      body.appendChild(twistCallout);
    }

    const isExhibitionRules = this.isQuickPlayMatch || this.isDailyBroadcastMatch;
    const rules: ReadonlyArray<{ title: string; copy: string }> = isExhibitionRules
      ? [
          {
            title: '1. TAP AN OPEN SQUARE & USE YOUR 2 LIFELINES',
            copy: 'Pick any open dollar square ($150–$600) on the illuminated 3D Tote Board with a calm 32-second clock. Stuck on a tough clue? Use 50/50 Studio Cut or Studio Audience Poll once per broadcast!',
          },
          {
            title: '2. PLAY TONIGHT’S 1966 BOARD TWISTS & BONUS WHEELS',
            copy: 'Crack $500 Gold Vaults via an adjacent win or 2-streak (with a 1-turn shield!), flip hidden 2× Secret Squares, pull Velvet Mystery Curtains, or spin the 20-wedge Big Wheel & Studio Light-Board!',
          },
          {
            title: '3. SCOUT CHAMPION WEAK SPOTS (+0.5× BONUS)',
            copy: 'Every Champion has 3 secret weak categories and 3 strong turfs. Watch their smirks and fumbles—logged Weak Spots boost your multiplier by +0.5× permanently in your Scouting Notebook!',
          },
          {
            title: this.isDailyBroadcastMatch
              ? '4. OUTBANK THE CHAMPION & SHARE YOUR DAILY CARD'
              : '4. SURGE IN ACT II (1.5×) & ACT III FINAL WAGER',
            copy: this.isDailyBroadcastMatch
              ? 'Everyone worldwide plays the exact same seeded Daily Broadcast board. Outbank today’s Champion to extend your streak and copy your spoiler-free 1966 TV emoji grid!'
              : 'Turn 6 re-racks a fresh 1.5× Double-Dollars board, and Turn 10 culminates in the Act III Final Broadcast Wager Showdown ($500 House Grudge Stake floor if trailing)!',
          },
        ]
      : [
          {
            title: '1. TAP A TILE & USE YOUR 2 STUDIO LIFELINES',
            copy: 'Pick any open dollar square ($150–$600) on the illuminated 3D Tote Board with a calm 32-second clock. Stuck on a tough clue? Use 50/50 Studio Cut or Studio Audience Poll once per show!',
          },
          {
            title: '2. EIGHT 1966 BOARD MODES & WILD TV TWISTS',
            copy: 'Every broadcast mixes 8 classic TV formats—Big Wheel Showcase, Light-Board Bonanza, 3-in-a-Row, Coast-to-Coast Bridge, Eye Guess Memory, Concentration Pairs, Curtain Deals & Classic Tote—plus Brass Safe Keys (1-turn shield!), Locked Vaults, and 2× Secret Squares!',
          },
          {
            title: '3. SCOUT 24 CHAMPIONS & 3-ACT FINAL WAGER',
            copy: 'Champions start with hidden ??? weak spots—log permanent +0.5× Weak Spots in your Scouting Notebook! Turn 6 boosts stakes to 1.5×, and Turn 10 triggers the Final Broadcast Wager!',
          },
          {
            title: '4. BUST BOOTH RIGGING & PACK STUDIO PROPS',
            copy: 'From Episode 2 onward, crooked Champions get secret cues from Control Booth A—slap the flashing red CATCH CHEAT switch for +$150–$300 Clean Purse! Visit the Prop Shop between shows to equip score-multiplying studio props.',
          },
        ];

    const list = document.createElement('div');
    list.className = 'ws7-guide-list';
    for (const r of rules) {
      const row = document.createElement('div');
      row.className = 'ws7-guide-item';
      row.innerHTML = `<div class="ws7-guide-title">${r.title}</div><div class="ws7-guide-body">${r.copy}</div>`;
      list.appendChild(row);
    }
    body.appendChild(list);

    const footer = document.createElement('div');
    footer.className = 'ws7-sheet-footer';

    if (this.liveMatchScoreForShop !== null) {
      const saveExitQuickBtn = document.createElement('button');
      saveExitQuickBtn.type = 'button';
      saveExitQuickBtn.className = 'ws7-ceremony-save-exit-btn';
      saveExitQuickBtn.innerHTML = `${SVG_REEL_VAULT_1966}<span>SAVE &amp; EXIT</span>`;
      saveExitQuickBtn.addEventListener('click', () => {
        this.hideUtilityModalStage();
        if (this.callbacks.onReturnToTitleHub) {
          this.callbacks.onReturnToTitleHub();
        } else {
          this.showTitleHub();
        }
      });
      footer.appendChild(saveExitQuickBtn);

      if (this.propsUnlockedInMatch && !this.isDailyBroadcastMatch) {
        const propsQuickBtn = document.createElement('button');
        propsQuickBtn.type = 'button';
        propsQuickBtn.className = 'ws7-teal-btn';
        propsQuickBtn.textContent = '★ PROP SHOP';
        propsQuickBtn.addEventListener('click', () => {
          this.openPropTrunkModal(true);
        });
        footer.appendChild(propsQuickBtn);
      }
    }

    const doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.className = 'ws7-primary-btn';
    doneBtn.textContent = 'GOT IT — BACK TO STAGE';
    doneBtn.addEventListener('click', dismiss);
    footer.appendChild(doneBtn);

    panel.append(header, body, footer);
    this.mountUtilityModalContent(panel, dismiss);
  }

  public openPropTrunkModal(
    allowLiveScoreBurn: boolean = false,
    onClose?: () => void,
  ): void {
    const dismiss = (): void => {
      this.hideUtilityModalStage();
      onClose?.();
    };
    let statusBanner = '';
    const render = (): void => {
      const save = this.campaign.getState();
      const validation = validateTrunkLoadoutV7(save.equippedRelics);

      const panel = document.createElement('div');
      panel.className = 'ws7-mahogany-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Studio Prop Shop and Trunk');

      const header = this.createDismissibleSheetHeader(
        allowLiveScoreBurn
          ? `STUDIO 6A PROP TRUNK · ${validation.multDriverCount}/${MAX_MULT_DRIVER_SLOTS_V7} MULT SLOTS`
          : `CLEAN\u00A0$${save.cleanPurseCash.toLocaleString()} · BACKSTAGE\u00A0$${save.contrabandTrunkCash.toLocaleString()} · ${validation.multDriverCount}/${MAX_MULT_DRIVER_SLOTS_V7} MULT`,
        allowLiveScoreBurn
          ? `Live Prop Counter ($${LIVE_SCORE_BURN_SHOP_COST_V7})`
          : 'Studio 6A Prop Shop',
        dismiss,
        'Close Prop Shop',
      );

      const body = document.createElement('div');
      body.className = 'ws7-sheet-body';

      // Seamless 5-Bay Horizontal Prop Console Rail (ZERO separate floating boxes!)
      const slotsGrid = document.createElement('div');
      slotsGrid.className = 'ws7-velvet-trunk-slots';
      for (let i = 0; i < MAX_TRUNK_SLOTS_V7; i += 1) {
        const owned = save.equippedRelics[i];
        const slot = document.createElement('div');
        slot.className = 'ws7-velvet-slot';
        if (owned) {
          const spec = RELIC_BY_ID_V7[owned.relicId];
          const foilSpec = FOIL_SPECS_V7[owned.foil];
          slot.innerHTML = `
            <div>
              <div style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:${foilSpec.badgeHex};">0${i + 1} · ${foilSpec.label}</div>
              <div style="font-size:15px;font-weight:800;color:#fff7e6;margin-top:2px;">${spec?.name ?? owned.relicId}</div>
              <div style="font-size:14px;color:#bfd0e0;">${spec?.slotKind === 'MULT_DRIVER' ? 'Multiplier' : 'Bonus'}</div>
            </div>
          `;
          const dropBtn = document.createElement('button');
          dropBtn.type = 'button';
          dropBtn.className = 'ws7-secondary-btn';
          dropBtn.textContent = 'REMOVE';
          dropBtn.addEventListener('click', () => {
            this.campaign.unequipRelicSlot(i);
            statusBanner = 'Removed prop from Studio Trunk.';
            render();
          });
          slot.appendChild(dropBtn);
        } else {
          slot.innerHTML = `<div style="font-family:var(--ws7-font-broadcast);font-size:14px;color:#ffd56b;font-weight:900;">BAY 0${i + 1}</div><div style="font-size:14px;color:#bfd0e0;">Open Slot</div>`;
        }
        slotsGrid.appendChild(slot);
      }

      body.appendChild(slotsGrid);

      if (statusBanner) {
        const statusNoteEl = document.createElement('div');
        statusNoteEl.className = 'ws7-vellum-card';
        statusNoteEl.dataset.accent = 'tangerine';
        statusNoteEl.style.fontSize = '14.5px';
        statusNoteEl.style.fontWeight = '800';
        statusNoteEl.textContent = statusBanner;
        body.appendChild(statusNoteEl);
      }

      // Flush Warm Cream Editorial Catalogue Ledger (Single unified scroll!)
      const catalogList = document.createElement('div');
      catalogList.className = 'ws7-editorial-list';
      for (const spec of RELIC_CATALOG_V7) {
        const equipped = save.equippedRelics.some((r) => r.relicId === spec.relicId);
        const row = document.createElement('div');
        row.className = 'ws7-editorial-row';
        row.dataset.unlocked = equipped ? 'true' : 'false';
        row.dataset.ledger = spec.ledgerKind;

        const meta = document.createElement('div');
        meta.className = 'ws7-editorial-meta';
        meta.innerHTML = `
          <div style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:${spec.ledgerKind === 'CONTRABAND' ? '#c92266' : '#007d8c'};letter-spacing:0.04em;">${spec.ledgerKind === 'CONTRABAND' ? 'BACKSTAGE' : 'CLEAN'} · ${spec.slotKind === 'MULT_DRIVER' ? 'MULTIPLIER PROP' : 'DOLLAR PROP'}${equipped ? ' · PACKED ✓' : ''}</div>
          <div style="font-size:16px;font-weight:800;color:#121a2b;">${spec.name}</div>
          <div style="font-size:14px;color:#384660;font-weight:600;">${formatOrphanProofCopyV7(spec.triggerSummary)}</div>
        `;
        row.appendChild(meta);

        if (!equipped) {
          const buyBtn = document.createElement('button');
          buyBtn.type = 'button';
          buyBtn.className = 'ws7-primary-btn';
          buyBtn.style.flex = '0 0 auto';
          buyBtn.textContent = allowLiveScoreBurn
            ? `TRADE $${LIVE_SCORE_BURN_SHOP_COST_V7}`
            : `PACK ($${spec.costCash})`;
          buyBtn.addEventListener('click', () => {
            if (allowLiveScoreBurn && this.liveMatchScoreForShop !== null) {
              const burn = executeLiveScoreBurnBuyV7(
                this.liveMatchScoreForShop,
                save.equippedRelics,
                spec.relicId,
              );
              if (!burn.ok) {
                statusBanner = burn.reason ?? 'Need more live match score to trade.';
              } else {
                this.liveMatchScoreForShop = burn.nextPlayerMatchScore;
                this.campaign.purchaseOrEquipRelic(
                  spec.relicId,
                  spec.defaultFoil,
                  undefined,
                  true,
                );
                this.animateSolariScore(
                  this.playerRoller,
                  this.playerDrumEl,
                  this.playerBoxEl,
                  this.playerDeltaPopEl,
                  burn.nextPlayerMatchScore,
                  true,
                );
                this.callbacks.onLiveScoreBurnPurchase?.(
                  burn.nextPlayerMatchScore,
                  spec.relicId,
                );
                statusBanner = `Traded $${LIVE_SCORE_BURN_SHOP_COST_V7} lead to pack ${spec.name}!`;
              }
            } else {
              const res = this.campaign.purchaseOrEquipRelic(spec.relicId);
              statusBanner = res.ok
                ? `Packed ${spec.name} into your Studio Trunk.`
                : (res.reason ?? 'Cannot pack prop.');
            }
            render();
          });
          row.appendChild(buyBtn);
        }
        catalogList.appendChild(row);
      }
      body.appendChild(catalogList);

      const footer = document.createElement('div');
      footer.className = 'ws7-sheet-footer';
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'ws7-secondary-btn';
      closeBtn.textContent = 'CLOSE PROP SHOP';
      closeBtn.addEventListener('click', dismiss);
      footer.appendChild(closeBtn);

      panel.append(header, body, footer);
      this.mountUtilityModalContent(panel, dismiss);
    };
    render();
  }

  public openTrophyVaultModal(
    onClose?: () => void,
    catalog: readonly TrophySpecV7[] = TROPHY_CATALOG_V7,
  ): void {
    const dismiss = (): void => {
      this.hideUtilityModalStage();
      onClose?.();
    };
    let filterSeason: 0 | 1 | 2 | 3 | 4 = 0;
    const unlocked = new Set(this.campaign.getState().unlockedTrophyIds);
    const firstEarned = catalog.find((c) => unlocked.has(c.trophyId));
    let selectedTrophyId = firstEarned?.trophyId ?? catalog[0]?.trophyId ?? 'trophy_s1_01';

    const panel = document.createElement('div');
    panel.className = 'ws7-mahogany-panel ws7-vault-modal-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '36 Broadcast Awards Trophy Vault');

    const header = this.createDismissibleSheetHeader(
      `3D STUDIO TROPHY TURNTABLE · ${unlocked.size} OF ${catalog.length} EARNED`,
      '36 Broadcast Awards',
      dismiss,
      'Close Trophy Vault',
    );

    const body = document.createElement('div');
    body.className = 'ws7-sheet-body';

    // Single Persistent 3D Turntable Showcase Band (Reused across ALL/S1..S4 tabs — ZERO WebGLRenderer churn!)
    const showcaseRow = document.createElement('div');
    showcaseRow.className = 'ws7-vault-3d-showcase';

    const stageBox = document.createElement('div');
    stageBox.className = 'ws7-vault-3d-stage';
    stageBox.id = 'ws7-vault-3d-stage';

    const plaqueCol = document.createElement('div');
    plaqueCol.className = 'ws7-vault-3d-plaque';
    const updateShowcasePlaque = (spec: TrophySpecV7, isOpen: boolean): void => {
      const displayMeta = getTrophyDisplayMetaV7(spec.trophyId);
      const tierLabel: AwardRarityTierV7 = displayMeta.tierBadge;
      const cleanRule = spec.unlockRuleText.replace(/^Quick Win:\s*/i, '');
      plaqueCol.innerHTML = `
        <div style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:${isOpen ? '#ffd56b' : '#bfd0e0'};">${isOpen ? '★ EARNED & LIT ON TURNTABLE' : 'SILHOUETTED LOCKED AWARD'} · ${tierLabel}</div>
        <div style="font-family:var(--ws7-font-showlogo);font-size:21px;color:#fff7e6;line-height:1.12;">${spec.name}</div>
        <div style="font-family:var(--ws7-font-broadcast);font-size:14px;color:#22c7d8;font-weight:800;">“${spec.engraving}” · ${displayMeta.formLabel}</div>
        <div style="font-size:14px;color:#d6e2ec;line-height:1.3;">${isOpen ? formatOrphanProofCopyV7(cleanRule) : `HOW TO UNLOCK: ${formatOrphanProofCopyV7(cleanRule)}`}</div>
      `;
    };
    const initialSpec = catalog.find((c) => c.trophyId === selectedTrophyId) ?? catalog[0];
    updateShowcasePlaque(initialSpec, unlocked.has(initialSpec.trophyId));
    showcaseRow.append(stageBox, plaqueCol);

    // 8 Board-Mode Mastery Stickers Bar
    const saveSnapshot = this.campaign.getState();
    const masteredSet = new Set<BoardPlayModeV7>(saveSnapshot.masteredBoardModes ?? []);
    const stickerBar = document.createElement('div');
    stickerBar.className = 'ws7-mastery-sticker-row';
    const shortModeNames: Record<BoardPlayModeV7, string> = {
      CLASSIC_TOTE: 'CLASSIC TOTE',
      TIC_TAC_LINE: '3-IN-A-ROW',
      COAST_HEX_BRIDGE: 'COAST BRIDGE',
      EYE_GUESS_MEMORY: 'EYE GUESS',
      CONCENTRATION_PRIZE_MATCH: 'PRIZE MATCH',
      MONTY_CURTAIN_DEAL: 'CURTAIN DEAL',
      PRESS_YOUR_LUCK_GREMLIN: 'GREMLIN BOARD',
      BIG_WHEEL_SHOWCASE: 'BIG WHEEL',
    };
    stickerBar.innerHTML = ALL_BOARD_PLAY_MODES_V7.map((mode) => {
      const earned = masteredSet.has(mode);
      return `<span class="ws7-mastery-sticker" data-earned="${earned}" title="${BOARD_PLAY_MODE_TITLES_V7[mode]}">${earned ? '✓' : '○'} ${shortModeNames[mode]}</span>`;
    }).join('');

    // Sticky Broadcast Tab Rail
    const tabRail = document.createElement('div');
    tabRail.className = 'ws7-tab-rail';
    const tabs: ReadonlyArray<{ s: 0 | 1 | 2 | 3 | 4; shortLabel: string; longSuffix: string; title: string }> = [
      { s: 0, shortLabel: 'ALL', longSuffix: ' 36', title: 'All 36 Awards' },
      { s: 1, shortLabel: 'S1', longSuffix: ' · STUDIO 6A', title: 'Season 1 Studio 6A Awards' },
      { s: 2, shortLabel: 'S2', longSuffix: ' · ROADSHOW', title: 'Season 2 Roadshow Awards' },
      { s: 3, shortLabel: 'S3', longSuffix: ' · PRIMETIME', title: 'Season 3 Primetime Awards' },
      { s: 4, shortLabel: 'S4', longSuffix: ' · FINALE', title: 'Season 4 Finale Awards' },
    ];
    const tabBtns: Array<{ s: 0 | 1 | 2 | 3 | 4; btn: HTMLButtonElement }> = [];

    const list = document.createElement('div');
    list.className = 'ws7-editorial-list';

    const renderFilteredList = (): void => {
      for (const tb of tabBtns) {
        tb.btn.dataset.active = tb.s === filterSeason ? 'true' : 'false';
      }
      list.innerHTML = '';
      const shown = catalog.filter((c) => filterSeason === 0 || c.season === filterSeason);
      if (shown.length > 0 && !shown.some((c) => c.trophyId === selectedTrophyId)) {
        const nextSpec = shown.find((c) => unlocked.has(c.trophyId)) ?? shown[0];
        selectedTrophyId = nextSpec.trophyId;
        const nextOpen = unlocked.has(nextSpec.trophyId);
        updateShowcasePlaque(nextSpec, nextOpen);
        this.callbacks.onSelectTrophyIn3DVault?.(nextSpec.trophyId, nextOpen);
      }
      const rowNodes: HTMLDivElement[] = [];
      for (const tr of shown) {
        const isOpen = unlocked.has(tr.trophyId);
        const trMeta = getTrophyDisplayMetaV7(tr.trophyId);
        const tierLabel: AwardRarityTierV7 = trMeta.tierBadge;
        const cleanRule = tr.unlockRuleText.replace(/^Quick Win:\s*/i, '');
        const row = document.createElement('div');
        row.className = 'ws7-editorial-row';
        row.dataset.unlocked = isOpen ? 'true' : 'false';
        row.dataset.selected = tr.trophyId === selectedTrophyId ? 'true' : 'false';
        row.dataset.clickable = 'true';
        row.dataset.trophyId = tr.trophyId;
        row.innerHTML = `
          <div class="ws7-editorial-meta">
            <div style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:${isOpen ? '#b86800' : '#0f3a4d'};">${isOpen ? `★ EARNED · ${tierLabel}` : `LOCKED · ${tierLabel}`} · SEASON 0${tr.season} · +${trMeta.rarityPoints} PTS</div>
            <div style="font-size:16px;font-weight:800;color:#121a2b;">${tr.name} <span style="font-weight:600;color:#384660;">— “${tr.engraving}”</span></div>
            <div style="font-size:14px;color:#384660;font-weight:700;">${isOpen ? formatOrphanProofCopyV7(cleanRule) : `HOW TO UNLOCK: ${formatOrphanProofCopyV7(cleanRule)}`}</div>
          </div>
        `;
        row.addEventListener('click', () => {
          selectedTrophyId = tr.trophyId;
          for (const n of rowNodes) {
            n.dataset.selected = n.dataset.trophyId === tr.trophyId ? 'true' : 'false';
          }
          updateShowcasePlaque(tr, isOpen);
          this.callbacks.onSelectTrophyIn3DVault?.(tr.trophyId, isOpen);
        });
        rowNodes.push(row);
        list.appendChild(row);
      }
      list.scrollTop = 0;
    };

    for (const t of tabs) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ws7-tab-btn';
      b.dataset.active = filterSeason === t.s ? 'true' : 'false';
      b.title = t.title;
      b.innerHTML = `<span>${t.shortLabel}<span class="ws7-tab-long">${t.longSuffix}</span></span>`;
      b.addEventListener('click', () => {
        if (filterSeason === t.s) return;
        filterSeason = t.s;
        renderFilteredList();
      });
      tabBtns.push({ s: t.s, btn: b });
      tabRail.appendChild(b);
    }

    const footer = document.createElement('div');
    footer.className = 'ws7-sheet-footer';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ws7-secondary-btn';
    closeBtn.textContent = 'CLOSE TROPHY VAULT';
    closeBtn.addEventListener('click', dismiss);
    footer.appendChild(closeBtn);

    renderFilteredList();
    body.append(showcaseRow, stickerBar, tabRail, list);
    panel.append(header, body, footer);
    this.mountUtilityModalContent(panel, dismiss);

    const cleanup = this.callbacks.onMountTrophyVault3D?.(
      stageBox,
      initialSpec.trophyId,
      unlocked.has(initialSpec.trophyId),
    );
    if (typeof cleanup === 'function') {
      this.activeUtilityModalCleanup = cleanup;
    }
  }

  public openEpisodeJumpModal(onClose?: () => void): void {
    const dismiss = (): void => {
      this.hideUtilityModalStage();
      onClose?.();
    };
    let selectedSeason: 1 | 2 | 3 | 4 = this.campaign.getState().season;
    let selectedRegime: CoupRegimeIdV7 = this.campaign.getState().activeCoupRegime;

    const render = (): void => {
      const panel = document.createElement('div');
      panel.className = 'ws7-mahogany-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', '90-Episode Broadcast Archive');

      const header = this.createDismissibleSheetHeader(
        '1966 TV GUIDE SCHEDULE · 90 BROADCAST EPISODES',
        'Jump to Any Episode (S01E01 – S04E90)',
        dismiss,
        'Close Episode Archive',
      );

      const body = document.createElement('div');
      body.className = 'ws7-sheet-body';

      const seasonTabs = document.createElement('div');
      seasonTabs.className = 'ws7-tab-rail';
      const ranges: ReadonlyArray<{
        s: 1 | 2 | 3 | 4;
        shortLabel: string;
        longSuffix: string;
        rangeText: string;
        start: number;
        end: number;
      }> = [
        { s: 1, shortLabel: 'S1', longSuffix: ' · STUDIO 6A', rangeText: '1–22', start: 1, end: 22 },
        { s: 2, shortLabel: 'S2', longSuffix: ' · ROADSHOW', rangeText: '23–45', start: 23, end: 45 },
        { s: 3, shortLabel: 'S3', longSuffix: ' · REGIMES', rangeText: '46–68', start: 46, end: 68 },
        { s: 4, shortLabel: 'S4', longSuffix: ' · SANCTUM', rangeText: '69–90', start: 69, end: 90 },
      ];
      for (const r of ranges) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ws7-tab-btn';
        b.dataset.active = selectedSeason === r.s ? 'true' : 'false';
        b.innerHTML = `<span>${r.shortLabel}<span class="ws7-tab-long">${r.longSuffix}</span></span><span class="ws7-tab-sub">${r.rangeText}</span>`;
        b.addEventListener('click', () => {
          selectedSeason = r.s;
          if (selectedSeason >= 3 && selectedRegime === 'NONE') {
            selectedRegime = 'REGIME_A_ROZ_PHARMA';
          }
          render();
        });
        seasonTabs.appendChild(b);
      }
      body.appendChild(seasonTabs);

      if (selectedSeason >= 3) {
        const regimeBand = document.createElement('div');
        regimeBand.className = 'ws7-sheet-band';
        regimeBand.dataset.surface = 'deep';
        const regimeRow = document.createElement('div');
        regimeRow.className = 'ws7-btn-row';
        const regimes: ReadonlyArray<{ id: Exclude<CoupRegimeIdV7, 'NONE'>; label: string }> = [
          { id: 'REGIME_A_ROZ_PHARMA', label: 'ROZ PHARMA' },
          { id: 'REGIME_B_BELLAMY_UHF', label: 'BELLAMY UHF' },
          { id: 'REGIME_C_VERA_FORENSIC', label: 'VERA FORENSIC' },
        ];
        for (const rg of regimes) {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = selectedRegime === rg.id ? 'ws7-crimson-btn' : 'ws7-secondary-btn';
          b.textContent = rg.label;
          b.addEventListener('click', () => {
            selectedRegime = rg.id;
            this.campaign.jumpToEpisode(this.campaign.getState().currentEpisode, rg.id);
            render();
          });
          regimeRow.appendChild(b);
        }
        regimeBand.appendChild(regimeRow);
        body.appendChild(regimeBand);
      }

      const activeRange = ranges.find((r) => r.s === selectedSeason) ?? ranges[0];
      const currentEp = this.campaign.getState().currentEpisode;
      const epList = document.createElement('div');
      epList.className = 'ws7-editorial-list';
      for (let ep = activeRange.start; ep <= activeRange.end; ep += 1) {
        const bp = this.campaign.buildEpisodeBlueprint(ep);
        const isCurrent = ep === currentEp;
        const row = document.createElement('div');
        row.className = 'ws7-editorial-row';
        row.dataset.unlocked = isCurrent ? 'true' : 'false';

        const meta = document.createElement('div');
        meta.className = 'ws7-editorial-meta';
        meta.innerHTML = `
          <div style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:${isCurrent ? '#b86800' : '#007d8c'};">${bp.code}${isCurrent ? ' · ★ CURRENT' : ''} · vs ${CAST_PROFILES_V7[bp.rivalId].name}</div>
          <div style="font-size:15.5px;font-weight:800;color:#121a2b;">${bp.title}</div>
        `;
        const cueBtn = document.createElement('button');
        cueBtn.type = 'button';
        cueBtn.className = 'ws7-primary-btn';
        cueBtn.style.flex = '0 0 auto';
        cueBtn.textContent = `PLAY ${bp.code}`;
        cueBtn.addEventListener('click', () => {
          this.hideUtilityModalStage();
          this.campaign.jumpToEpisode(
            ep,
            selectedSeason >= 3 && selectedRegime !== 'NONE' ? selectedRegime : undefined,
          );
          void this.launchCampaignFlow();
        });
        row.append(meta, cueBtn);
        epList.appendChild(row);
      }
      body.appendChild(epList);

      const footer = document.createElement('div');
      footer.className = 'ws7-sheet-footer';
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'ws7-secondary-btn';
      closeBtn.textContent = 'BACK TO HUB';
      closeBtn.addEventListener('click', dismiss);
      footer.appendChild(closeBtn);

      panel.append(header, body, footer);
      this.mountUtilityModalContent(panel, dismiss);
    };
    render();
  }

  public openAudioSettingsModal(onClose?: () => void): void {
    this.openSettingsModal(onClose);
  }

  public openSettingsModal(onClose?: () => void): void {
    let resetSaveArmed = false;
    const dismiss = (): void => {
      this.hideUtilityModalStage();
      onClose?.();
    };
    const render = (): void => {
      const settings = this.campaign.getState().settings;
      const panel = document.createElement('div');
      panel.className = 'ws7-mahogany-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Studio Audio and Broadcast Desk');

      const header = this.createDismissibleSheetHeader(
        'STUDIO 6A MASTER CONTROL · SOUND & OPTIONS',
        'Studio Audio & Broadcast Desk',
        dismiss,
        'Close Sound and Options',
      );

      const body = document.createElement('div');
      body.className = 'ws7-sheet-body';

      const sliders: ReadonlyArray<{
        key:
          | 'masterVolume'
          | 'voiceVolume'
          | 'musicVolume'
          | 'sfxVolume'
          | 'crowdVolume'
          | 'ambienceVolume';
        label: string;
        fallback?: number;
      }> = [
        { key: 'masterVolume', label: 'Master Level' },
        { key: 'voiceVolume', label: 'Studio Voices', fallback: 88 },
        { key: 'musicVolume', label: 'Showband' },
        { key: 'sfxVolume', label: 'Bells & SFX' },
        { key: 'crowdVolume', label: 'Live Audience' },
        { key: 'ambienceVolume', label: 'Studio Room' },
      ];

      const faderBlock = document.createElement('div');
      faderBlock.className = 'ws7-fader-grid';
      for (const s of sliders) {
        const curVal = settings[s.key] ?? s.fallback ?? 80;
        const row = document.createElement('label');
        row.className = 'ws7-slider-row';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = s.label;

        const input = document.createElement('input');
        input.type = 'range';
        input.min = '0';
        input.max = '100';
        input.value = String(curVal);
        input.className = 'ws7-range-input';

        const valSpan = document.createElement('span');
        valSpan.style.fontFamily = 'var(--ws7-font-broadcast)';
        valSpan.style.fontSize = '15px';
        valSpan.style.color = '#ffd56b';
        valSpan.style.textAlign = 'right';
        valSpan.textContent = `${curVal}%`;

        input.addEventListener('input', () => {
          const v = Number(input.value);
          valSpan.textContent = `${v}%`;
          const updated = this.campaign.updateSettings({ [s.key]: v });
          this.applySettingsAttributes(updated);
          this.callbacks.onSettingsChanged?.(updated);
        });

        row.append(nameSpan, input, valSpan);
        faderBlock.appendChild(row);
      }
      body.appendChild(faderBlock);

      // 5-Speed Studio Question Clock Selector (NO TIMER · 90s · 45s · 30s · 15s)
      const clockBand = document.createElement('div');
      clockBand.className = 'ws7-sheet-band';
      clockBand.dataset.surface = 'cream';
      mountQuestionTimerSelectorV8(clockBand, {
        value: normalizeQuestionTimerModeV8(settings.questionTimerMode ?? 30),
        showHeader: true,
        showSummary: true,
        onChange: (nextMode) => {
          const updated = this.campaign.updateSettings({ questionTimerMode: nextMode });
          this.applySettingsAttributes(updated);
          this.callbacks.onSettingsChanged?.(updated);
        },
      });
      body.appendChild(clockBand);

      const toggleBand = document.createElement('div');
      toggleBand.className = 'ws7-sheet-band';
      toggleBand.dataset.surface = 'deep';
      const toggleRow = document.createElement('div');
      toggleRow.className = 'ws7-btn-row';
      const makeToggle = (
        label: string,
        current: boolean,
        patch: Partial<BroadcastSettingsV7>,
      ): HTMLButtonElement => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = current ? 'ws7-teal-btn' : 'ws7-secondary-btn';
        b.textContent = `${label}: ${current ? 'ON' : 'OFF'}`;
        b.addEventListener('click', () => {
          const updated = this.campaign.updateSettings(patch);
          this.applySettingsAttributes(updated);
          this.callbacks.onSettingsChanged?.(updated);
          render();
        });
        return b;
      };

      const fsToggleBtn = document.createElement('button');
      fsToggleBtn.type = 'button';
      const fsNow = isDocumentFullscreenV7();
      fsToggleBtn.className = fsNow ? 'ws7-teal-btn' : 'ws7-secondary-btn';
      fsToggleBtn.textContent = `⛶ FULL SCREEN: ${fsNow ? 'ON' : 'OFF'}`;
      fsToggleBtn.addEventListener('click', () => {
        void (async () => {
          if (this.callbacks.onToggleFullscreen) {
            this.callbacks.onToggleFullscreen();
            window.setTimeout(() => {
              if (this.isUtilityModalOpen()) render();
            }, 120);
          } else {
            await this.handleFullscreenToggle();
            if (this.isUtilityModalOpen()) render();
          }
        })();
      });

      toggleRow.append(
        fsToggleBtn,
        makeToggle('HAPTICS', settings.hapticsEnabled, {
          hapticsEnabled: !settings.hapticsEnabled,
        }),
        makeToggle('REDUCED MOTION', settings.reducedMotion, {
          reducedMotion: !settings.reducedMotion,
        }),
        makeToggle('HIGH CONTRAST', settings.highContrastBadges, {
          highContrastBadges: !settings.highContrastBadges,
        }),
      );

      const introEnabled =
        settings.autoPlayShowIntro !== undefined
          ? settings.autoPlayShowIntro
          : isAutoPlayShowIntroEnabledV8();
      const introToggleBtn = document.createElement('button');
      introToggleBtn.type = 'button';
      introToggleBtn.className = introEnabled ? 'ws7-teal-btn' : 'ws7-secondary-btn';
      introToggleBtn.textContent = `10S TV INTRO: ${introEnabled ? 'ON' : 'OFF'}`;
      introToggleBtn.addEventListener('click', () => {
        const next = !introEnabled;
        setAutoPlayShowIntroEnabledV8(next);
        const updated = this.campaign.updateSettings({ autoPlayShowIntro: next });
        this.applySettingsAttributes(updated);
        this.callbacks.onSettingsChanged?.(updated);
        render();
      });

      const tipsMuted = Boolean(settings.muteAutoQuestionTips) || isAutoTipsMutedV8();
      const tipsToggleBtn = document.createElement('button');
      tipsToggleBtn.type = 'button';
      tipsToggleBtn.className = !tipsMuted ? 'ws7-teal-btn' : 'ws7-secondary-btn';
      tipsToggleBtn.textContent = `1ST-TIME TIPS: ${!tipsMuted ? 'ON' : 'MUTED'}`;
      tipsToggleBtn.addEventListener('click', () => {
        const nextMuted = !tipsMuted;
        setAutoTipsMutedV8(nextMuted);
        const updated = this.campaign.updateSettings({ muteAutoQuestionTips: nextMuted });
        this.applySettingsAttributes(updated);
        this.callbacks.onSettingsChanged?.(updated);
        render();
      });

      const resetTipsBtn = document.createElement('button');
      resetTipsBtn.type = 'button';
      resetTipsBtn.className = 'ws7-secondary-btn';
      resetTipsBtn.textContent = '↻ RESET QUESTION TIPS';
      resetTipsBtn.addEventListener('click', () => {
        resetSeenStudioGuidesV8();
        const updated = this.campaign.updateSettings({ muteAutoQuestionTips: false });
        this.applySettingsAttributes(updated);
        this.callbacks.onSettingsChanged?.(updated);
        this.showLiveToast('FIRST-TIME STUDIO CUE CARDS RESET!', 'emerald', 2200);
        render();
      });

      toggleRow.append(introToggleBtn, tipsToggleBtn, resetTipsBtn);
      toggleBand.appendChild(toggleRow);
      body.appendChild(toggleBand);

      // CPU Champion Difficulty Mode Selector (Matinee Easy / Prime-Time Normal / All-Star Hard / Mastermind)
      const diffBand = document.createElement('div');
      diffBand.className = 'ws7-sheet-band';
      const diffKicker = document.createElement('div');
      diffKicker.className = 'ws7-subtitle-kicker';
      diffKicker.style.marginBottom = '8px';
      diffKicker.style.textAlign = 'center';
      diffKicker.textContent = 'CPU CHAMPION DIFFICULTY · HONEST ACCURACY TIER';
      const diffRow = document.createElement('div');
      diffRow.className = 'ws7-btn-row';
      const currentDiff: DifficultyModeV7 = settings.difficultyMode ?? 'PRIMETIME_NORMAL';
      const diffChoices: ReadonlyArray<{ id: DifficultyModeV7; label: string }> = [
        { id: 'MATINEE_EASY', label: 'MATINEE (EASY)' },
        { id: 'PRIMETIME_NORMAL', label: 'PRIME-TIME (NORMAL)' },
        { id: 'ALLSTAR_HARD', label: 'ALL-STAR (HARD)' },
        { id: 'MASTERMIND', label: 'MASTERMIND' },
      ];
      for (const d of diffChoices) {
        const db = document.createElement('button');
        db.type = 'button';
        db.className = currentDiff === d.id ? 'ws7-teal-btn' : 'ws7-secondary-btn';
        db.textContent = d.label;
        db.addEventListener('click', () => {
          const updated = this.campaign.updateSettings({ difficultyMode: d.id });
          this.applySettingsAttributes(updated);
          this.callbacks.onSettingsChanged?.(updated);
          render();
        });
        diffRow.appendChild(db);
      }
      diffBand.append(diffKicker, diffRow);
      body.appendChild(diffBand);

      const saveBand = document.createElement('div');
      saveBand.className = 'ws7-sheet-band';
      const saveKicker = document.createElement('div');
      saveKicker.className = 'ws7-subtitle-kicker';
      saveKicker.style.marginBottom = '8px';
      saveKicker.style.textAlign = 'center';
      saveKicker.textContent = resetSaveArmed
        ? 'PERMANENT ACTION · CLEARS CAMPAIGN, DAILY, TROPHIES & SHOWROOM'
        : 'STUDIO ARCHIVE STORAGE · 2-STEP RESET';
      const saveRow = document.createElement('div');
      saveRow.className = 'ws7-btn-row';
      if (!resetSaveArmed) {
        const resetSaveBtn = document.createElement('button');
        resetSaveBtn.type = 'button';
        resetSaveBtn.className = 'ws7-secondary-btn';
        resetSaveBtn.dataset.action = 'reset-save';
        resetSaveBtn.textContent = 'RESET SAVE';
        resetSaveBtn.addEventListener('click', () => {
          resetSaveArmed = true;
          render();
        });
        saveRow.appendChild(resetSaveBtn);
      } else {
        const confirmResetBtn = document.createElement('button');
        confirmResetBtn.type = 'button';
        confirmResetBtn.className = 'ws7-primary-btn';
        confirmResetBtn.dataset.action = 'confirm-reset-save';
        confirmResetBtn.style.background = '#B8253E';
        confirmResetBtn.style.borderColor = '#8C182C';
        confirmResetBtn.style.color = '#FFFDF7';
        confirmResetBtn.textContent = 'ARE YOU SURE? CONFIRM RESET';
        confirmResetBtn.addEventListener('click', () => {
          resetSaveArmed = false;
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              const keysToClear = [
                'ws_v7_campaign_save_1',
                'ws_v7_showrunner_meta_1',
                'ws_v7_daily_broadcast_save_1',
                'ws8_career_stats_ledger_v1',
                'ws_v9_showroom_save_1',
                'ws_v9_sweeps_save_1',
                'ws_v7_cold_open_seen_1',
                'ws8_smart_coach_seen_v1',
                'ws8_voice_recency_ring_v1',
              ];
              for (const k of keysToClear) {
                window.localStorage.removeItem(k);
              }
            }
          } catch {
            // Ignore storage restrictions
          }
          resetSeenStudioGuidesV8();
          const freshState = this.campaign.resetCampaign(false);
          this.applySettingsAttributes(freshState.settings);
          this.callbacks.onSettingsChanged?.(freshState.settings);
          this.hideUtilityModalStage();
          if (this.liveMatchScoreForShop !== null && this.callbacks.onReturnToTitleHub) {
            this.callbacks.onReturnToTitleHub();
          } else {
            onClose?.();
          }
          this.showLiveToast(
            'SAVE DATA CLEARED — FRESH STUDIO 6A BROADCAST READY!',
            'emerald',
            2600,
          );
        });

        const cancelResetBtn = document.createElement('button');
        cancelResetBtn.type = 'button';
        cancelResetBtn.className = 'ws7-secondary-btn';
        cancelResetBtn.dataset.action = 'cancel-reset-save';
        cancelResetBtn.textContent = 'CANCEL';
        cancelResetBtn.addEventListener('click', () => {
          resetSaveArmed = false;
          render();
        });
        saveRow.append(confirmResetBtn, cancelResetBtn);
      }
      saveBand.append(saveKicker, saveRow);
      body.appendChild(saveBand);

      const footer = document.createElement('div');
      footer.className = 'ws7-sheet-footer';

      if (this.liveMatchScoreForShop !== null) {
        const hubBtn = document.createElement('button');
        hubBtn.type = 'button';
        hubBtn.className = 'ws7-ceremony-save-exit-btn';
        hubBtn.innerHTML = `${SVG_REEL_VAULT_1966}<span>SAVE &amp; EXIT</span>`;
        hubBtn.addEventListener('click', () => {
          this.hideUtilityModalStage();
          if (this.callbacks.onReturnToTitleHub) {
            this.callbacks.onReturnToTitleHub();
          } else {
            this.showTitleHub();
          }
        });
        footer.appendChild(hubBtn);

        if (this.propsUnlockedInMatch && !this.isDailyBroadcastMatch) {
          const propBtn = document.createElement('button');
          propBtn.type = 'button';
          propBtn.className = 'ws7-teal-btn';
          propBtn.textContent = '★ PROP SHOP';
          propBtn.addEventListener('click', () => {
            this.openPropTrunkModal(true);
          });
          footer.appendChild(propBtn);
        }
      }

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'ws7-primary-btn';
      closeBtn.textContent = 'DONE';
      closeBtn.addEventListener('click', dismiss);
      footer.appendChild(closeBtn);

      panel.append(header, body, footer);
      this.mountUtilityModalContent(panel, dismiss);
    };
    render();
  }

  public getSaveSnapshot(): CampaignSaveStateV7 {
    return this.campaign.getState();
  }

  public isUtilityModalOpen(): boolean {
    return !this.utilityModalStageEl.classList.contains('ws7-hidden');
  }

  public isAnyModalOpen(): boolean {
    return (
      !this.modalStageEl.classList.contains('ws7-hidden') ||
      !this.utilityModalStageEl.classList.contains('ws7-hidden')
    );
  }

  // --------------------------------------------------------------------------
  // Internal Helpers
  // --------------------------------------------------------------------------

  private applySettingsAttributes(settings: BroadcastSettingsV7): void {
    this.rootEl.dataset.highContrast = settings.highContrastBadges ? 'true' : 'false';
    this.rootEl.dataset.reducedMotion = settings.reducedMotion ? 'true' : 'false';
  }

  private scheduleFlowTimeout(fn: () => void, ms: number): number {
    const id = window.setTimeout(() => {
      this.activeFlowTimeouts.delete(id);
      fn();
    }, ms);
    this.activeFlowTimeouts.add(id);
    return id;
  }

  private clearFlowTimeout(id: number): void {
    window.clearTimeout(id);
    this.activeFlowTimeouts.delete(id);
  }

  private scheduleFlowRaf(fn: (now: number) => void): number {
    const id = window.requestAnimationFrame((now) => {
      this.activeFlowRafs.delete(id);
      fn(now);
    });
    this.activeFlowRafs.add(id);
    return id;
  }

  private activeModalDismissCleanup: (() => void) | null = null;

  private mountUtilityModalContent(content: HTMLElement, onDismiss?: () => void): void {
    if (this.activeUtilityModalCleanup) {
      this.activeUtilityModalCleanup();
      this.activeUtilityModalCleanup = null;
    }
    if (this.activeUtilityDismissCleanup) {
      this.activeUtilityDismissCleanup();
      this.activeUtilityDismissCleanup = null;
    }
    this.utilityModalStageEl.innerHTML = '';
    this.utilityModalStageEl.appendChild(content);
    this.utilityModalStageEl.classList.remove('ws7-hidden');
    this.utilityModalStageEl.scrollTop = 0;

    if (onDismiss) {
      const onStageClick = (ev: MouseEvent): void => {
        if (ev.target === this.utilityModalStageEl) {
          onDismiss();
        }
      };
      const onKeyDown = (ev: KeyboardEvent): void => {
        if (ev.key === 'Escape') {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          onDismiss();
        }
      };
      this.utilityModalStageEl.addEventListener('click', onStageClick);
      window.addEventListener('keydown', onKeyDown, true);
      this.activeUtilityDismissCleanup = () => {
        this.utilityModalStageEl.removeEventListener('click', onStageClick);
        window.removeEventListener('keydown', onKeyDown, true);
      };
    }

    this.callbacks.onUtilityModalStateChange?.(true);
    this.syncBoardModeRibbonVisibility();
  }

  public hideUtilityModalStage(): void {
    if (this.activeUtilityModalCleanup) {
      this.activeUtilityModalCleanup();
      this.activeUtilityModalCleanup = null;
    }
    if (this.activeUtilityDismissCleanup) {
      this.activeUtilityDismissCleanup();
      this.activeUtilityDismissCleanup = null;
    }
    this.utilityModalStageEl.innerHTML = '';
    this.utilityModalStageEl.classList.add('ws7-hidden');
    this.callbacks.onUtilityModalStateChange?.(false);
    this.syncBoardModeRibbonVisibility();
  }

  private clearScoreDeltaPops(): void {
    for (const roller of [this.playerRoller, this.rivalRoller]) {
      if (roller.deltaTimeout !== null) {
        window.clearTimeout(roller.deltaTimeout);
        roller.deltaTimeout = null;
      }
    }
    this.playerDeltaPopEl.dataset.show = 'false';
    this.rivalDeltaPopEl.dataset.show = 'false';
  }

  private mountModalContent(content: HTMLElement, onDismiss?: () => void): void {
    this.clearScoreDeltaPops();
    if (this.activeModalCleanup) {
      this.activeModalCleanup();
      this.activeModalCleanup = null;
    }
    if (this.activeModalDismissCleanup) {
      this.activeModalDismissCleanup();
      this.activeModalDismissCleanup = null;
    }
    this.modalStageEl.innerHTML = '';
    this.modalStageEl.appendChild(content);
    this.modalStageEl.classList.remove('ws7-hidden');
    this.modalStageEl.scrollTop = 0;

    if (onDismiss) {
      const onStageClick = (ev: MouseEvent): void => {
        if (ev.target === this.modalStageEl) {
          onDismiss();
        }
      };
      const onKeyDown = (ev: KeyboardEvent): void => {
        if (ev.key === 'Escape' && !this.isUtilityModalOpen()) {
          ev.preventDefault();
          onDismiss();
        }
      };
      this.modalStageEl.addEventListener('click', onStageClick);
      window.addEventListener('keydown', onKeyDown);
      this.activeModalDismissCleanup = () => {
        this.modalStageEl.removeEventListener('click', onStageClick);
        window.removeEventListener('keydown', onKeyDown);
      };
    }

    this.callbacks.onUtilityModalStateChange?.(true);
    this.syncBoardModeRibbonVisibility();
  }

  public hideModalStage(): void {
    this.clearActiveTimer();
    if (this.activeModalCleanup) {
      this.activeModalCleanup();
      this.activeModalCleanup = null;
    }
    if (this.activeModalDismissCleanup) {
      this.activeModalDismissCleanup();
      this.activeModalDismissCleanup = null;
    }
    this.modalStageEl.innerHTML = '';
    this.modalStageEl.classList.add('ws7-hidden');
    if (!this.isUtilityModalOpen()) {
      this.callbacks.onUtilityModalStateChange?.(false);
    }
    this.syncBoardModeRibbonVisibility();
  }

  private clearActiveTimer(): void {
    if (this.activeTimerHandle !== null) {
      window.clearInterval(this.activeTimerHandle);
      this.activeTimerHandle = null;
    }
    for (const tid of this.activeFlowTimeouts) {
      window.clearTimeout(tid);
    }
    this.activeFlowTimeouts.clear();
    for (const rid of this.activeFlowRafs) {
      window.cancelAnimationFrame(rid);
    }
    this.activeFlowRafs.clear();
  }
}
