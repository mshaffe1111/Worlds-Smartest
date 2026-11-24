// ============================================================================
// WORLD'S SMARTEST v5.0 — Master Theatrical Showtime Integration Controller
// Unites all 17 AAA v5.0 specialist modules into one cohesive, mobile-first
// (Phone Portrait + 2-Col Phone Landscape + 1-Tap Fullscreen) experience:
//  • GreenRoomMenuView (Era-evolving backstage vista + mahogany/brass props)
//  • BranchingCampaignEngine & VoicedStoryTheaterView (88 nodes, 97 voiced
//    scenes, 132 neural cast VOs, diegetic tutorials, fail-forward Redemption,
//    3 Sponsors, Rival Alliances/Grudges & 4 Canonical Endings)
//  • TourTrunkPinboardView (Open leather flight trunk, 5 brass Act luggage
//    tabs, braided gold/crimson/velvet yarn routes, 12 Podium Lucky Charms)
//  • TopicJukeboxView (12-Domain rotary brass dial, 157 subcategories, search,
//    physical brass throw-switches & pull-lever)
//  • LivingStageBoardView, StageBoardRulesV5 & StageVfxCanvasV5 (Tilted 2.5D
//    octagonal jewel board, ALL 14 playable Board Topologies/Twists, 3D chain
//    shatter, SCREW RIVAL! dome buzzer, Row/Col +300 Stage Sweeps, 6-Wedge
//    Medallion, Oxford Pick & Ban Draft, Power-Play Dial & Stage Wheel)
//  • SpotlightLozengeRendererV5 & TactileGadgetRenderersV5 (Hexagonal light
//    lozenges, 2s Read-In Brass Chronometer, 270° Pinpoint Speedometer,
//    Braided Cable Match-4 Switchboard & Sort-4 Brass Slotted Rack)
//  • StudioAudioEngine (5 core MusyngKite symphonic movements + 8 Stage &
//    Story-Branch Symphonies + 24 orchestral/tactile Foley cues)
//  • 1,279,399 clean playable questions + Career Stats Radar + 100 Trophies
// ============================================================================

import '../styles/showtime_v5.css';
import { HapticsEngine } from '../audio/HapticsEngine';
import { StudioAudioEngine, type SfxCueId } from '../audio/StudioAudioEngine';
import type { BriefingDifficultyPreset, DomainId } from '../forge/types';
import type { AnalyticsDifficultyTier, SpecialFeatKind } from '../meta/CareerAnalyticsStore';
import type { PracticeSliceRequest } from '../meta/CareerAnalyticsDashboardView';
import type { SrsReviewCard } from '../meta/SpacedRepetitionEngine';
import type { MetaProgressionSuite } from '../meta';
import type {
  CampaignSaveSlotsModal,
  CampaignSlotCardView,
  CampaignSlotId,
} from '../ui/CampaignSaveSlotsModal';
import {
  domainToWedgeColor,
  type AnswerSubmissionV4,
  type BoardColumnV4,
  type BoardTileV4,
  type BoardTopologyKind,
  type BriefingFormatModeV4,
  type ChallengerMoveKind,
  type ChallengerProfileV4,
  type ChallengerTurnActionV4,
  type EvaluatedAnswerV4,
  type PlayerStatProfileForHost,
  type QuestionCardV4,
  type TimerPaceModeV4,
  type VenueStageThemeId,
  type WedgeColorId,
  type WorldTourEpisodeV4,
} from '../v4/contracts';
import type { WheelActiveEffectV4 } from '../v4/ScoringV4';
import {
  BranchingCampaignEngine,
  SPONSOR_CATALOG_V5,
  formatBankrollUsd,
  inferBoardTwistForNode,
  type ActiveGrudgeSabotageV5,
  type CampaignNodeExtendedV5,
  type CampaignSlotIdV5,
} from './BranchingCampaignEngine';
import {
  GreenRoomMenuView,
  buildGreenRoomModelFromSave,
  deriveGreenRoomEra,
} from './GreenRoomMenuView';
import { StageVfxCanvasV5 } from './StageVfxCanvasV5';
import {
  V5_CAST_CUTOUTS,
  V5_VENUE_STAGES,
  type ChallengerIdV5,
  type CharmIdV5,
  type HostPoseV5,
  type InteractiveStorySceneV5,
  type ShowmanDareV5,
  type StoryChoiceConsequenceV5,
  type TierNumberV5,
} from './contracts_v5';
import type {
  BoardTwistIdV5,
  CategoryDraftItemV5,
  LivingStageBoardView,
  LivingStageOnboardingTipV5,
} from './LivingStageBoardView';
import type { SpotlightLozengeRendererV5 } from './SpotlightLozengeRendererV5';
import type { StageBoardStateV5 } from './StageBoardRulesV5';
import type { TopicJukeboxLaunchSpec, TopicJukeboxView } from './TopicJukeboxView';
import type { TourActNumberV5, TourTrunkPinboardView } from './TourTrunkPinboardView';
import type { VoicedStoryTheaterView } from './VoicedStoryTheaterView';

const FORMAT_PREF_KEY = 'ws_briefing_format_mode_v4';
const TIMER_PREF_KEY = 'ws_briefing_timer_pace_v4';
const ENDLESS_BEST_KEY = 'ws_v4_endless_best_streak';
const DAILY_DONE_PREFIX = 'ws_v4_daily_done_';
const SUMMARY_STYLE_ID = 'v5-linear-curtain-styles';

type QuestionGenModule = typeof import('../v4/QuestionGeneratorV4');
type BoardStageModule = typeof import('./LivingStageBoardView');
type BoardRulesModule = typeof import('./StageBoardRulesV5');
type SpotlightModule = typeof import('./SpotlightLozengeRendererV5');
type GadgetsModule = typeof import('./TactileGadgetRenderersV5');
type PinboardModule = typeof import('./TourTrunkPinboardView');
type JukeboxModule = typeof import('./TopicJukeboxView');
type StoryTheaterModule = typeof import('./VoicedStoryTheaterView');
type ScoringV4Module = typeof import('../v4/ScoringV4');
type ChallengerAiModule = typeof import('../v4/ChallengerAI');
type WittyHostModule = typeof import('../v4/WittyHostBank');

interface ActiveBoardMatchSessionV5 {
  node: CampaignNodeExtendedV5;
  episode: WorldTourEpisodeV4;
  challenger: ChallengerProfileV4 | null;
  board: StageBoardStateV5;
  acceptDare: boolean;
  dareCompleted: boolean;
  entryFeePaid: boolean;
  activeSabotage: ActiveGrudgeSabotageV5 | null;
  rng: () => number;
  currentStreak: number;
  bestStreak: number;
  questionsAnswered: number;
  questionsCorrect: number;
  hostLine: string;
  hostPose: HostPoseV5;
  rivalReactionLine: string | null;
  rivalActionBadge: string | null;
  newlyUnlockedTileIds: readonly string[];
  triggeredCharmIds: CharmIdV5[];
  lastChallengerAction: ChallengerTurnActionV4 | null;
  pendingWheelEffect: WheelActiveEffectV4;
  usedDoubleDownCount: number;
  usedLifelinesCount: number;
  sweepsOrBullseyesCount: number;
  buzzerBeatersCount: number;
  powerPlaysWonCount: number;
  trailedAtAnyPoint: boolean;
  onboardingTip: LivingStageOnboardingTipV5 | null;
}

interface ActiveLinearRunSessionV5 {
  mode: 'AUDITION_WARMUP' | 'CUSTOM_SHOW' | 'DAILY' | 'ENDLESS' | 'SRS_REVIEW';
  title: string;
  venueLabel: string;
  tierNumber: TierNumberV5;
  totalQuestions: number; // Infinity for ENDLESS
  questionIndex: number;
  score: number;
  currentStreak: number;
  bestStreak: number;
  correctCount: number;
  answeredCount: number;
  livesRemaining: number; // Used in ENDLESS (3 strikes)
  lifelines5050Left: number;
  lifelinesHintLeft: number;
  earnedWedges: WedgeColorId[];
  formatMode: BriefingFormatModeV4;
  timerPace: TimerPaceModeV4;
  domainId: DomainId | null;
  subcategoryId: string | null;
  difficultyPreset: BriefingDifficultyPreset;
  prebuiltDeck: QuestionCardV4[] | null;
  srsDeck: SrsReviewCard[] | null;
  answerResults: boolean[];
  coachWhispers?: readonly string[];
}

const CHALLENGER_ROSTER_V5: Readonly<
  Record<
    ChallengerIdV5,
    {
      name: string;
      title: string;
      hometown: string;
      accentHex: string;
      strongDomains: readonly DomainId[];
      weakDomains: readonly DomainId[];
      baseAccuracy: number;
      signatureGimmick: ChallengerMoveKind;
      introLines: readonly [string, string];
    }
  >
> = {
  frankie_russo: {
    name: 'Frankie Russo',
    title: 'Unbeaten Oakridge Pub-Quiz Bartender',
    hometown: 'Oakridge, Brooklyn',
    accentHex: '#f59e0b',
    strongDomains: [4, 5, 9],
    weakDomains: [3, 10],
    baseAccuracy: 0.46,
    signatureGimmick: 'CLAIM_TILE',
    introLines: [
      'Twenty bucks on table four says you blink under the stage lights!',
      'Keep your tab open, kid — this board is mine.',
    ],
  },
  denise_park: {
    name: 'Denise Park',
    title: 'Retired AP History Legend',
    hometown: 'Evanston, Illinois',
    accentHex: '#a78bfa',
    strongDomains: [0, 8, 10],
    weakDomains: [4, 6],
    baseAccuracy: 0.54,
    signatureGimmick: 'FORCE_WEAK_TILE',
    introLines: [
      'Pencils up, posture straight. Sloppy citations lose matches.',
      'Let us see if your homework holds up on air.',
    ],
  },
  trevor_blake: {
    name: 'Trevor Blake',
    title: '19-Day Regional TV Streak Star',
    hometown: 'Orlando, Florida',
    accentHex: '#38bdf8',
    strongDomains: [4, 5, 2],
    weakDomains: [1, 11],
    baseAccuracy: 0.60,
    signatureGimmick: 'PLANT_BOUNTY',
    introLines: [
      'Make sure Camera Two catches my good side when I sweep your column!',
      'Nineteen straight broadcasts — you are episode twenty.',
    ],
  },
  priya_nair: {
    name: 'Dr. Priya Nair',
    title: 'ER Trauma Physician & Crossword Champ',
    hometown: 'Boston, Massachusetts',
    accentHex: '#10b981',
    strongDomains: [1, 7, 11],
    weakDomains: [5, 4],
    baseAccuracy: 0.65,
    signatureGimmick: 'FREEZE_FAVORITE_COLUMN',
    introLines: [
      'A 25-second shot clock feels like a vacation after a night shift in trauma.',
      'Stay calm — panic costs more points than ignorance.',
    ],
  },
  alistair_finch: {
    name: 'Lord Alistair Finch',
    title: 'Oxford Classics Fellow',
    hometown: 'Oxford, England',
    accentHex: '#e11d48',
    strongDomains: [0, 3, 10],
    weakDomains: [4, 5],
    baseAccuracy: 0.70,
    signatureGimmick: 'FORCE_WEAK_TILE',
    introLines: [
      'How charmingly ambitious. Shall we test your classical foundations?',
      'Mind the draft bans — Oxford rules reward foresight.',
    ],
  },
  kenji_takahashi: {
    name: 'Kenji Takahashi',
    title: 'Shogi & Quiz-Bowl Speed Prodigy',
    hometown: 'Shibuya, Tokyo',
    accentHex: '#f43f5e',
    strongDomains: [1, 6, 11],
    weakDomains: [9, 10],
    baseAccuracy: 0.74,
    signatureGimmick: 'PLANT_BOUNTY',
    introLines: [
      'Three moves ahead on the grid. Your clock is already behind mine.',
      'Speed without precision is noise — bring both.',
    ],
  },
  nadia_al_mansoor: {
    name: 'Nadia Al-Mansoor',
    title: 'World Memory Champion & Polyglot',
    hometown: 'Cairo, Egypt',
    accentHex: '#f5c451',
    strongDomains: [2, 3, 8],
    weakDomains: [5, 6],
    baseAccuracy: 0.78,
    signatureGimmick: 'FREEZE_FAVORITE_COLUMN',
    introLines: [
      'Every tile on this stage already has a room inside my memory palace.',
      'Show me a mind worthy of the semifinal.',
    ],
  },
  viktor_volkov: {
    name: 'Viktor Volkov',
    title: 'Reigning Global Grandmaster',
    hometown: 'Geneva, Switzerland',
    accentHex: '#fbbf24',
    strongDomains: [0, 1, 8, 11],
    weakDomains: [4, 9],
    baseAccuracy: 0.82,
    signatureGimmick: 'FORCE_WEAK_TILE',
    introLines: [
      'One point four billion viewers. Zero margin for hesitation.',
      'You climbed all the way to the summit — now prove you belong here.',
    ],
  },
};

const TIER_THEME_IDS_V5: Readonly<Record<TierNumberV5, VenueStageThemeId>> = {
  1: 'TIER1_COMMUNITY_HALL',
  2: 'TIER2_CIVIC_THEATER',
  3: 'TIER3_REGIONAL_TV',
  4: 'TIER4_NATIONAL_ARENA',
  5: 'TIER5_LONDON_ROTUNDA',
  6: 'TIER6_TOKYO_SKYDOME',
  7: 'TIER7_CAIRO_PAVILION',
  8: 'TIER8_GLOBAL_FINALE',
};

function escapeHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readLocalPref(key: string): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function writeLocalPref(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore private-mode storage quota errors
  }
}

function getTodayUtcCode(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDailySeedFromUtcCode(utcCode: string): number {
  let h = 2166136261;
  for (let i = 0; i < utcCode.length; i += 1) {
    h ^= utcCode.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 20260501;
}

function getDailyBroadcastNumber(): number {
  const epochMs = Date.UTC(2025, 0, 1);
  const nowMs = Date.now();
  return Math.max(1, Math.floor((nowMs - epochMs) / 86_400_000) + 1);
}

function hashStringSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1337;
}

function createMulberryRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mapDifficultyPresetToTierV4(
  preset: BriefingDifficultyPreset,
  streak: number,
): QuestionCardV4['difficultyTier'] {
  switch (preset) {
    case 'MIDDLE_SCHOOL':
      return 'MIDDLE_SCHOOL';
    case 'HIGH_SCHOOL':
      return 'HIGH_SCHOOL';
    case 'COLLEGE':
      return 'COLLEGE';
    case 'GRADUATE':
      return 'GRADUATE';
    case 'MENSA':
      return 'MENSA';
    case 'ADAPTIVE':
    default:
      if (streak >= 10) return 'MENSA';
      if (streak >= 6) return 'GRADUATE';
      if (streak >= 3) return 'COLLEGE';
      return 'HIGH_SCHOOL';
  }
}

function mapTierNumberToDifficultyV4(tierNumber: TierNumberV5): QuestionCardV4['difficultyTier'] {
  if (tierNumber <= 2) return 'MIDDLE_SCHOOL';
  if (tierNumber <= 4) return 'HIGH_SCHOOL';
  if (tierNumber <= 5) return 'COLLEGE';
  if (tierNumber <= 7) return 'GRADUATE';
  return 'MENSA';
}

function buildEpisodeProxyFromNode(
  node: CampaignNodeExtendedV5,
  boardTwistId: BoardTwistIdV5,
): WorldTourEpisodeV4 {
  const topologyMap: Record<CampaignNodeExtendedV5['topology'], BoardTopologyKind> = {
    OPEN_TRYOUT: 'OPEN_CLASSIC',
    PADLOCK_NEIGHBORS: 'PADLOCK_NEIGHBORS',
    FOG_EXPLORER: 'FOG_CROSSROADS',
    SPOTLIGHT_ROULETTE: 'SPOTLIGHT_ROULETTE',
    CROSSROADS_HYBRID: 'CHALLENGER_GAUNTLET',
    FINALE_GAUNTLET: 'GRAND_FINALE_VAULT',
  };
  return {
    episodeId: node.nodeId,
    tierNumber: node.tierNumber,
    episodeInTier: (((node.actNumber - 1) % 4) + 1) as 1 | 2 | 3 | 4,
    title: node.showTitle,
    subtitle: `${node.cityStamp} · ${node.venueName}`,
    venueName: node.venueName,
    themeId: TIER_THEME_IDS_V5[node.tierNumber],
    baseAudienceWatching: node.baseAudience,
    prizePurseUsd: node.purseUsd,
    difficultyTier: mapTierNumberToDifficultyV4(node.tierNumber),
    topology: topologyMap[node.topology] ?? 'OPEN_CLASSIC',
    boardCols: node.boardCols,
    boardRows: node.boardRows,
    maxTurns: node.maxTurns,
    allowedFormats: [...node.featuredFormats],
    hasCategoryDraft: boardTwistId === 'oxford_pick_ban',
    challengerId: node.challengerId,
    soloTargetScore: node.soloTargetScore ?? 1000,
    rulesHookSummary: `${boardTwistId.replace(/_/g, ' ').toUpperCase()} · Live Broadcast`,
  };
}

function buildChallengerProfileFromId(challengerId: ChallengerIdV5 | null): ChallengerProfileV4 | null {
  if (!challengerId) return null;
  const spec = CHALLENGER_ROSTER_V5[challengerId];
  if (!spec) return null;
  return {
    id: challengerId,
    name: spec.name,
    title: spec.title,
    hometown: spec.hometown,
    avatarPortraitUrl: V5_CAST_CUTOUTS.challengers[challengerId],
    accentHex: spec.accentHex,
    strongDomains: spec.strongDomains,
    weakDomains: spec.weakDomains,
    baseAccuracy: spec.baseAccuracy,
    signatureGimmick: spec.signatureGimmick,
    introLines: spec.introLines,
    onForceCategoryLines: [spec.introLines[0]],
    onFreezeColumnLines: ['Let us put your favorite column on ice for a moment!'],
    onPlayerBigPlayLines: ['Clean shot. Do not expect the next tile to be that friendly.'],
    onPlayerMissLines: ['The spotlight burns hot when you hesitate!'],
    winMatchLine: 'Another broadcast locked up. Check the Late-Night circuit if you want a rematch.',
    loseMatchLine: 'Sharp play under the lights — you earned that curtain call.',
  };
}

function ensureLinearCurtainStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(SUMMARY_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SUMMARY_STYLE_ID;
  style.textContent = `
    .v5-curtain-shell {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: clamp(10px, 2.2vmin, 22px);
      box-sizing: border-box;
      overflow-y: auto;
      background-size: cover;
      background-position: center;
      color: #fff8e7;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .v5-curtain-shell::before {
      content: '';
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at 50% 24%, rgba(16, 36, 62, 0.48), rgba(6, 10, 18, 0.88) 78%);
      pointer-events: none;
      z-index: 0;
    }
    .v5-curtain-plaque {
      position: relative;
      z-index: 1;
      width: min(94vw, 620px);
      background: linear-gradient(165deg, #3b2112 0%, #241209 52%, #170b05 100%);
      border: 3px solid #d4a548;
      border-radius: 22px;
      box-shadow:
        0 20px 48px rgba(0, 0, 0, 0.78),
        inset 0 2px 0 rgba(255, 236, 179, 0.45),
        inset 0 0 0 3px rgba(92, 54, 20, 0.85);
      padding: clamp(14px, 2.8vmin, 26px);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: clamp(10px, 1.8vmin, 16px);
    }
    .v5-curtain-ribbon {
      align-self: center;
      background: linear-gradient(180deg, #16794b 0%, #0b462a 100%);
      border: 2px solid #f2c96b;
      border-radius: 999px;
      padding: 5px 18px;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(11px, 1.7vmin, 13px);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #fff6d6;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }
    .v5-curtain-title {
      margin: 0;
      text-align: center;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(20px, 4.2vmin, 30px);
      line-height: 1.15;
      color: #ffe7a3;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.75);
    }
    .v5-curtain-sub {
      margin: 0;
      text-align: center;
      font-size: clamp(12.5px, 2vmin, 15px);
      line-height: 1.4;
      color: #f3e4c6;
    }
    .v5-curtain-dials {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .v5-curtain-dial {
      background: radial-gradient(circle at 50% 25%, #163226 0%, #091812 100%);
      border: 2px solid #c9993e;
      border-radius: 14px;
      padding: 8px 6px;
      text-align: center;
      box-shadow: inset 0 1px 0 rgba(255, 232, 168, 0.28);
    }
    .v5-curtain-dial-val {
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: clamp(16px, 3.2vmin, 22px);
      color: #ffdf85;
    }
    .v5-curtain-dial-lbl {
      display: block;
      margin-top: 2px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #c8dfc8;
    }
    .v5-curtain-pips {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
    }
    .v5-curtain-pip {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid #e7be63;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
    }
    .v5-curtain-pip.is-hit {
      background: linear-gradient(180deg, #22c55e, #15803d);
      color: #fff;
    }
    .v5-curtain-pip.is-miss {
      background: linear-gradient(180deg, #dc2626, #7f1d1d);
      color: #fff;
    }
    .v5-curtain-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 4px;
    }
    .v5-curtain-btn {
      min-height: 46px;
      padding: 10px 18px;
      border-radius: 999px;
      border: 2px solid #f0c565;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(12px, 1.9vmin, 14px);
      letter-spacing: 0.06em;
      cursor: pointer;
      color: #fff9e8;
      background: linear-gradient(180deg, #4b2b16 0%, #2a1509 100%);
      box-shadow: 0 5px 14px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 232, 175, 0.35);
    }
    .v5-curtain-btn.is-primary {
      background: linear-gradient(180deg, #1ca362 0%, #0d5c35 100%);
      border-color: #ffe28a;
    }
    @media (max-height: 460px) and (orientation: landscape) {
      .v5-curtain-plaque {
        width: min(94vw, 760px);
        padding: 10px 18px;
        gap: 8px;
      }
      .v5-curtain-title {
        font-size: clamp(17px, 4.4vh, 22px);
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// SHOWTIME MASTER CONTROLLER v5.0
// ============================================================================

export class ShowtimeMasterControllerV5 {
  private readonly canvasRoot: HTMLElement;
  private readonly vfxCanvasEl: HTMLCanvasElement;
  private readonly uiRoot: HTMLElement;

  public readonly audio: StudioAudioEngine;
  public readonly haptics: HapticsEngine;
  public readonly campaign: BranchingCampaignEngine;
  public readonly vfx: StageVfxCanvasV5;

  private readonly greenRoomView: GreenRoomMenuView;
  private pinboardView: TourTrunkPinboardView | null = null;
  private jukeboxView: TopicJukeboxView | null = null;
  private storyTheaterView: VoicedStoryTheaterView | null = null;
  private boardStageView: LivingStageBoardView | null = null;
  private spotlightRenderer: SpotlightLozengeRendererV5 | null = null;
  private savesModalInstance: CampaignSaveSlotsModal | null = null;

  // Cached dynamic module promises (keeps initial entry JS well below 350 kB!)
  private qGenPromise: Promise<QuestionGenModule> | null = null;
  private boardStagePromise: Promise<BoardStageModule> | null = null;
  private boardRulesPromise: Promise<BoardRulesModule> | null = null;
  private spotlightPromise: Promise<SpotlightModule> | null = null;
  private gadgetsPromise: Promise<GadgetsModule> | null = null;
  private pinboardPromise: Promise<PinboardModule> | null = null;
  private jukeboxPromise: Promise<JukeboxModule> | null = null;
  private storyTheaterPromise: Promise<StoryTheaterModule> | null = null;
  private scoringV4Promise: Promise<ScoringV4Module> | null = null;
  private challengerAiPromise: Promise<ChallengerAiModule> | null = null;
  private wittyHostPromise: Promise<WittyHostModule> | null = null;
  private metaSuitePromise: Promise<MetaProgressionSuite> | null = null;
  private storyPacksPromise: Promise<void> | null = null;

  private formatMode: BriefingFormatModeV4;
  private timerMode: TimerPaceModeV4;
  private activeTourAct: TourActNumberV5 = 1;
  private currentScreen:
    | 'GREEN_ROOM'
    | 'STORY_THEATER'
    | 'TOUR_PINBOARD'
    | 'TOPIC_JUKEBOX'
    | 'STAGE_BOARD'
    | 'SPOTLIGHT_QUESTION'
    | 'CURTAIN_SUMMARY' = 'GREEN_ROOM';

  private boardSession: ActiveBoardMatchSessionV5 | null = null;
  private linearSession: ActiveLinearRunSessionV5 | null = null;
  private usedQidsThisSession = new Set<number>();

  private clockIntervalId: number | null = null;
  private lastTickedWholeSec: number | null = null;
  private prewarmTimerId: number | null = null;
  private boundGlobalClick: ((ev: MouseEvent) => void) | null = null;
  private disposed = false;

  constructor(canvasRoot: HTMLElement, vfxCanvasEl: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.canvasRoot = canvasRoot;
    this.vfxCanvasEl = vfxCanvasEl;
    this.uiRoot = uiRoot;

    // Configure mount layers for v5 2.5D stage + z-index: 65 VFX canvas
    this.canvasRoot.style.display = 'none';
    this.uiRoot.classList.add('v5-show-root');
    this.vfxCanvasEl.style.position = 'fixed';
    this.vfxCanvasEl.style.inset = '0';
    this.vfxCanvasEl.style.pointerEvents = 'none';
    this.vfxCanvasEl.style.zIndex = '65';

    this.audio = new StudioAudioEngine();
    this.haptics = new HapticsEngine();
    this.campaign = new BranchingCampaignEngine();
    this.vfx = new StageVfxCanvasV5();
    this.vfx.mount(this.vfxCanvasEl);
    this.greenRoomView = new GreenRoomMenuView(this.uiRoot);

    const savedFmt = readLocalPref(FORMAT_PREF_KEY);
    this.formatMode = savedFmt === 'CLASSIC_4_ONLY' ? 'CLASSIC_4_ONLY' : 'VARIETY_MIX';
    const savedTimer = readLocalPref(TIMER_PREF_KEY);
    this.timerMode = savedTimer === 'RELAXED_UNTIMED' ? 'RELAXED_UNTIMED' : 'STANDARD';

    // Global 1-tap Fullscreen support for any [data-v5-fullscreen-toggle] button across all views
    this.boundGlobalClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      const fsTrigger = target?.closest?.('[data-v5-fullscreen-toggle]');
      if (fsTrigger) {
        ev.preventDefault();
        this.audio.playSfx('ui_tap');
        void this.toggleFullscreen();
      }
    };
    window.addEventListener('click', this.boundGlobalClick, { passive: false });

    // Expose safe diagnostic hook for Red-Team QA & mobile viewport verification
    (window as unknown as Record<string, unknown>).__wsShowtimeV5 = this;

    // Render Green Room immediately on frame 1!
    this.showGreenRoomHub();

    // Load 88-node story packs immediately in background & refresh Green Room callouts
    this.storyPacksPromise = this.campaign
      .loadStoryPacks()
      .then(() => {
        if (!this.disposed && this.currentScreen === 'GREEN_ROOM') {
          this.showGreenRoomHub();
        }
      })
      .catch(() => {
        // Hydrated fallback already built into BranchingCampaignEngine
      });

    // Prewarm secondary chunks 60ms after first paint so every button tap is instant
    this.prewarmTimerId = window.setTimeout(() => {
      this.prewarmTimerId = null;
      if (this.disposed) return;
      void this.ensurePinboardModule();
      void this.ensureBoardModules();
      void this.ensureQuestionModules();
      void this.ensureStoryTheaterModule();
      void this.ensureJukeboxModule();
      void this.ensureMetaSuite();
    }, 60);
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopQuestionClock();
    if (this.prewarmTimerId !== null) {
      window.clearTimeout(this.prewarmTimerId);
      this.prewarmTimerId = null;
    }
    if (this.boundGlobalClick) {
      window.removeEventListener('click', this.boundGlobalClick);
      this.boundGlobalClick = null;
    }
    this.teardownActiveViews();
    this.greenRoomView.dispose();
    this.pinboardView?.dispose();
    this.jukeboxView?.dispose();
    this.storyTheaterView?.dispose();
    this.boardStageView?.dispose();
    this.spotlightRenderer?.dispose();
    this.vfx.dispose();
    this.audio.dispose();
  }

  // ==========================================================================
  // DYNAMIC CHUNK LOADERS & FULLSCREEN / AUDIO HELPERS
  // ==========================================================================

  private ensureStoryReady(): Promise<void> {
    if (!this.storyPacksPromise) {
      this.storyPacksPromise = this.campaign.loadStoryPacks().then(() => {});
    }
    return this.storyPacksPromise;
  }

  private ensureQuestionGen(): Promise<QuestionGenModule> {
    if (!this.qGenPromise) {
      this.qGenPromise = import('../v4/QuestionGeneratorV4');
    }
    return this.qGenPromise;
  }

  private ensurePinboardModule(): Promise<PinboardModule> {
    if (!this.pinboardPromise) {
      this.pinboardPromise = import('./TourTrunkPinboardView');
    }
    return this.pinboardPromise;
  }

  private ensureJukeboxModule(): Promise<JukeboxModule> {
    if (!this.jukeboxPromise) {
      this.jukeboxPromise = import('./TopicJukeboxView');
    }
    return this.jukeboxPromise;
  }

  private ensureStoryTheaterModule(): Promise<StoryTheaterModule> {
    if (!this.storyTheaterPromise) {
      this.storyTheaterPromise = import('./VoicedStoryTheaterView');
    }
    return this.storyTheaterPromise;
  }

  private ensureBoardModules(): Promise<
    [BoardStageModule, BoardRulesModule, ScoringV4Module, ChallengerAiModule, WittyHostModule]
  > {
    if (!this.boardStagePromise) this.boardStagePromise = import('./LivingStageBoardView');
    if (!this.boardRulesPromise) this.boardRulesPromise = import('./StageBoardRulesV5');
    if (!this.scoringV4Promise) this.scoringV4Promise = import('../v4/ScoringV4');
    if (!this.challengerAiPromise) this.challengerAiPromise = import('../v4/ChallengerAI');
    if (!this.wittyHostPromise) this.wittyHostPromise = import('../v4/WittyHostBank');
    return Promise.all([
      this.boardStagePromise,
      this.boardRulesPromise,
      this.scoringV4Promise,
      this.challengerAiPromise,
      this.wittyHostPromise,
    ]);
  }

  private ensureQuestionModules(): Promise<[SpotlightModule, GadgetsModule, QuestionGenModule, WittyHostModule]> {
    if (!this.spotlightPromise) this.spotlightPromise = import('./SpotlightLozengeRendererV5');
    if (!this.gadgetsPromise) this.gadgetsPromise = import('./TactileGadgetRenderersV5');
    if (!this.wittyHostPromise) this.wittyHostPromise = import('../v4/WittyHostBank');
    return Promise.all([
      this.spotlightPromise,
      this.gadgetsPromise,
      this.ensureQuestionGen(),
      this.wittyHostPromise,
    ]);
  }

  private async ensureMetaSuite(): Promise<MetaProgressionSuite> {
    if (!this.metaSuitePromise) {
      this.metaSuitePromise = (async () => {
        const [{ MetaProgressionSuite: Suite }, { PassportSystem }, { InkBlackboard }] =
          await Promise.all([
            import('../meta'),
            import('../narrative/PassportSystem'),
            import('../narrative/InkBlackboard'),
          ]);
        const passport = new PassportSystem();
        const blackboard = new InkBlackboard();
        return new Suite(
          {
            passport,
            blackboard,
            audio: this.audio,
            haptics: this.haptics,
          },
          {
            onRenameChallenger: (newName: string) => {
              this.campaign.setContestantName(newName);
              if (this.currentScreen === 'GREEN_ROOM') {
                this.showGreenRoomHub();
              }
            },
            onEquipBroadcastTitle: () => {
              if (this.currentScreen === 'GREEN_ROOM') {
                this.showGreenRoomHub();
              }
            },
            onPracticeSlice: (req: PracticeSliceRequest) => {
              const domId =
                typeof req.domainId === 'number' && req.domainId >= 0 && req.domainId <= 11
                  ? (req.domainId as DomainId)
                  : null;
              void this.openTopicJukebox({
                initialDomainId: domId,
                initialSearchQuery: req.subcatLabel ?? '',
              });
            },
            onLaunchLivePrismReview: (cards: readonly SrsReviewCard[]) => {
              void this.startSrsReviewDeck(cards);
            },
            onCloseSuite: () => {
              if (this.currentScreen === 'GREEN_ROOM') {
                this.showGreenRoomHub();
              }
            },
          },
        );
      })();
    }
    return this.metaSuitePromise;
  }

  private playStreakSfx(streak: number): void {
    const clamped = Math.max(1, Math.min(5, streak)) as 1 | 2 | 3 | 4 | 5;
    const cue = `streak_${clamped}` as SfxCueId;
    this.audio.playSfx(cue);
  }

  public isFullscreenActive(): boolean {
    if (typeof document === 'undefined') return false;
    const docAny = document as Document & { webkitFullscreenElement?: Element | null };
    return Boolean(document.fullscreenElement || docAny.webkitFullscreenElement);
  }

  public async toggleFullscreen(): Promise<boolean> {
    if (typeof document === 'undefined') return false;
    const docAny = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    const rootAny = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    try {
      if (document.fullscreenElement || docAny.webkitFullscreenElement) {
        if (typeof document.exitFullscreen === 'function') {
          await document.exitFullscreen();
        } else if (typeof docAny.webkitExitFullscreen === 'function') {
          await docAny.webkitExitFullscreen();
        }
        return false;
      }
      if (typeof rootAny.requestFullscreen === 'function') {
        await rootAny.requestFullscreen();
        return true;
      }
      if (typeof rootAny.webkitRequestFullscreen === 'function') {
        await rootAny.webkitRequestFullscreen();
        return true;
      }
    } catch {
      // Ignore fullscreen rejection in restricted embedded webviews
    }
    return this.isFullscreenActive();
  }

  private isMasterAudioOn(): boolean {
    return this.audio.isSfxEnabled() || this.audio.isMusicEnabled();
  }

  private toggleMasterAudio(): boolean {
    const next = !this.isMasterAudioOn();
    this.audio.setSfxEnabled(next);
    this.audio.setVoiceEnabled(next);
    this.audio.setMusicEnabled(next);
    if (next) {
      this.audio.playSfx('ui_tap');
    }
    return next;
  }

  private teardownActiveViews(): void {
    this.stopQuestionClock();
    this.audio.stopVoice();
    this.spotlightRenderer?.dispose();
    this.spotlightRenderer = null;
    this.boardStageView?.closeModal();
    this.pinboardView?.unmount();
    this.storyTheaterView?.unmount();
    this.jukeboxView?.dispose();
    this.jukeboxView = null;
  }

  // ==========================================================================
  // 1. DIEGETIC GREEN-ROOM MAIN MENU (`GreenRoomMenuView`)
  // ==========================================================================

  public showGreenRoomHub(): void {
    this.teardownActiveViews();
    this.boardSession = null;
    this.linearSession = null;
    this.currentScreen = 'GREEN_ROOM';

    const save = this.campaign.getState();
    const eraTier: TierNumberV5 = save.currentAct <= 1 ? 1 : save.currentAct <= 3 ? 4 : 8;
    this.vfx.setStageMood(eraTier, 'calm');
    this.audio.setMusicCue('greenroom');

    const recNode = this.campaign.getRecommendedNextNode(save);
    const inboxScene = this.campaign.peekNextInboxCallScene();
    const todayCode = getTodayUtcCode();
    const dailyCompletedToday = readLocalPref(`${DAILY_DONE_PREFIX}${todayCode}`) === '1';
    const endlessBestStreak = Math.max(0, Number(readLocalPref(ENDLESS_BEST_KEY) || 0));

    const stepSubtitle =
      !save.coldOpenCompleted && save.totalMatchesPlayed === 0
        ? 'Live Open-Call Audition · Oakridge Hall'
        : recNode
          ? `${recNode.showTitle} · ${recNode.venueName}`
          : 'Continue Championship Tour';

    const model = buildGreenRoomModelFromSave(save, {
      era: deriveGreenRoomEra(save.currentAct),
      stepOnStageSubtitle: stepSubtitle,
      currentVenueName: recNode?.venueName ?? 'Oakridge Community Hall',
      currentShowTitle: recNode?.showTitle ?? 'Oakridge Pub Open Call',
      inboxCount: save.inboxCallsQueue.length,
      inboxHeadline: inboxScene?.title,
      inboxCallerName: inboxScene?.beats[0]?.speakerName,
      dailyBroadcastNumber: getDailyBroadcastNumber(),
      dailyBroadcastLabel: `Broadcast #${getDailyBroadcastNumber()}`,
      dailyCompletedToday,
      endlessBestStreak,
      audioEnabled: this.isMasterAudioOn(),
      activeSaveSlotLabel: `Slot ${this.campaign.getActiveSlotId()}`,
    });

    this.greenRoomView.render(model, {
      onStepOnStage: () => {
        this.audio.playBoardCue('switch_clack');
        this.haptics.uiTap();
        void this.handleStepOnStageFromGreenRoom();
      },
      onOpenTourTrunk: () => {
        this.audio.playBoardCue('polaroid_pin');
        this.haptics.uiTap();
        void this.showTourTrunkPinboard();
      },
      onOpenTopicJukebox: () => {
        this.audio.playBoardCue('switch_clack');
        this.haptics.uiTap();
        void this.openTopicJukebox();
      },
      onStartDaily: () => {
        this.audio.playBoardCue('switch_clack');
        this.haptics.uiTap();
        void this.startDailyBroadcast();
      },
      onStartEndless: () => {
        this.audio.playBoardCue('switch_clack');
        this.haptics.uiTap();
        void this.startEndlessStreak();
      },
      onOpenStatsRadar: () => {
        this.audio.playSfx('ui_tap');
        void this.openCareerStats();
      },
      onOpenTrophies: () => {
        this.audio.playSfx('ui_tap');
        void this.openHallOfTrophies();
      },
      onOpenSaves: () => {
        this.audio.playSfx('ui_tap');
        void this.openSavesSheet();
      },
      onToggleAudio: () => {
        const enabled = this.toggleMasterAudio();
        this.greenRoomView.updateAudioState(enabled);
      },
      onToggleFullscreen: () => {
        void this.toggleFullscreen();
      },
      onOpenInboxCall: () => {
        this.audio.playBoardCue('switch_clack');
        void this.openNextBackstagePhoneCall();
      },
      onInteractionFeedback: (kind: 'hover' | 'tap' | 'ring') => {
        if (kind === 'tap' || kind === 'ring') {
          this.audio.playSfx('ui_tap');
        }
      },
    });
  }

  private async handleStepOnStageFromGreenRoom(): Promise<void> {
    await this.ensureStoryReady();
    const save = this.campaign.getState();

    // Fresh save: run the voiced Cold-Open Backstage Scene + 3-Clue Guided Live Audition!
    if (!save.coldOpenCompleted && save.totalMatchesPlayed === 0) {
      const coldOpenScene = this.campaign.getColdOpenScene();
      await this.playInteractiveStoryScene(coldOpenScene, {
        continueButtonLabel: 'STEP TO AUDITION MIC',
        onFinished: () => {
          void this.startColdOpenAuditionWarmup();
        },
      });
      return;
    }

    const nextNode =
      this.campaign.getRecommendedNextNode(save) ?? this.campaign.getAllNodes()[0] ?? null;
    if (nextNode) {
      await this.launchCampaignNode(nextNode.nodeId, false);
    } else {
      await this.showTourTrunkPinboard();
    }
  }

  private async openNextBackstagePhoneCall(): Promise<void> {
    await this.ensureStoryReady();
    const callScene = this.campaign.peekNextInboxCallScene();
    if (!callScene) {
      this.showGreenRoomHub();
      return;
    }
    await this.playInteractiveStoryScene(callScene, {
      continueButtonLabel: 'HANG UP & RETURN',
      onFinished: () => {
        this.campaign.markSceneSeen(callScene.sceneId);
        this.showGreenRoomHub();
      },
    });
  }

  // ==========================================================================
  // 2. VOICED INTERACTIVE STORY THEATER (`VoicedStoryTheaterView`)
  // ==========================================================================

  private async playInteractiveStoryScene(
    scene: InteractiveStorySceneV5,
    opts: {
      continueButtonLabel?: string;
      onFinished: () => void;
    },
  ): Promise<void> {
    const { VoicedStoryTheaterView: TheaterCls, createStoryTheaterVoiceBridge } =
      await this.ensureStoryTheaterModule();

    this.teardownActiveViews();
    this.currentScreen = 'STORY_THEATER';

    if (!this.storyTheaterView) {
      this.storyTheaterView = new TheaterCls(this.uiRoot);
    }

    // Match story music bed to scene emotion
    if (scene.kind === 'REDEMPTION_BEAT') {
      this.audio.playStageSymphony(2, 'REDEMPTION_GRIT');
    } else if (scene.kind === 'ENDING') {
      this.audio.playStageSymphony(8, 'MAIN_STAGE');
      this.vfx.fireConfettiOvation(4200);
    } else if (scene.kind === 'GREEN_ROOM_CALL' || scene.kind === 'COLD_OPEN') {
      this.audio.setMusicCue('greenroom');
    } else if (scene.kind === 'ACT_CLIMAX') {
      this.audio.playStageSymphony(6, 'MAIN_STAGE');
    }

    const bridge = createStoryTheaterVoiceBridge(this.audio);
    let completed = false;
    const finishOnce = () => {
      if (completed) return;
      completed = true;
      this.campaign.markSceneSeen(scene.sceneId);
      opts.onFinished();
    };

    this.storyTheaterView.showScene(scene, {
      voiceBridge: bridge,
      continueButtonLabel: opts.continueButtonLabel ?? 'STEP ONTO STAGE',
      allowSkip: true,
      onToggleFullscreen: () => {
        void this.toggleFullscreen();
      },
      onChoiceSelected: (choice: StoryChoiceConsequenceV5) => {
        this.haptics.uiTap();
        return this.campaign.applyStoryChoice(scene.sceneId, choice, scene.featuredChallengerId);
      },
      onSceneComplete: () => {
        finishOnce();
      },
      onSkipScene: () => {
        finishOnce();
      },
    });
  }

  private async startColdOpenAuditionWarmup(): Promise<void> {
    const [, , qGen] = await this.ensureQuestionModules();
    const c1 = await qGen.drawQuestionCardV4({
      format: 'MULTIPLE_CHOICE',
      difficultyTier: 'MIDDLE_SCHOOL',
      excludeQids: this.usedQidsThisSession,
    });
    this.usedQidsThisSession.add(c1.qid);

    const c2 = await qGen.drawQuestionCardV4({
      format: 'PINPOINT_DIAL',
      difficultyTier: 'MIDDLE_SCHOOL',
      excludeQids: this.usedQidsThisSession,
    });
    this.usedQidsThisSession.add(c2.qid);

    const c3 = await qGen.drawQuestionCardV4({
      format: 'MATCH_4',
      difficultyTier: 'MIDDLE_SCHOOL',
      excludeQids: this.usedQidsThisSession,
    });
    this.usedQidsThisSession.add(c3.qid);

    this.campaign.markMechanicsIntroduced([
      'read_in_grace_clock',
      'lifeline_brass_coins',
      'double_down_switch',
      'format_pinpoint_dial',
      'format_match4_switchboard',
    ]);

    void this.audio.playRandomHostCategoryVoice('read_in_tip');
    this.audio.playStageSymphony(1, 'MAIN_STAGE');

    this.linearSession = {
      mode: 'AUDITION_WARMUP',
      title: 'Live Open-Call Mic Check',
      venueLabel: 'Oakridge Community Hall · Audition',
      tierNumber: 1,
      totalQuestions: 3,
      questionIndex: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      livesRemaining: 99,
      lifelines5050Left: 2,
      lifelinesHintLeft: 2,
      earnedWedges: [],
      formatMode: 'VARIETY_MIX',
      timerPace: this.timerMode,
      domainId: null,
      subcategoryId: null,
      difficultyPreset: 'ADAPTIVE',
      prebuiltDeck: [c1, c2, c3],
      srsDeck: null,
      answerResults: [],
      coachWhispers: [
        'MAX STERLING: Notice the 2-second amber Read-In grace before the Shot Clock ticks — and those 50/50 & CLUE brass coins on your desk!',
        'MAX STERLING: Drag the 270° brass dial needle into the green Win Zone — or flip the 2× DOUBLE DOWN switch if you know the exact bullseye!',
        'PRODUCER SAM: Snap all 4 braided neon patch cables across the mahogany switchboard, then pull LOCK 4 CABLES!',
      ],
    };

    await this.presentNextLinearQuestion();
  }

  // ==========================================================================
  // 3. CONTENDER'S TOUR TRUNK PINBOARD OVERWORLD (`TourTrunkPinboardView`)
  // ==========================================================================

  public async showTourTrunkPinboard(preferredAct?: TourActNumberV5): Promise<void> {
    await this.ensureStoryReady();
    const [pinboardMod, rulesMod] = await Promise.all([
      this.ensurePinboardModule(),
      this.boardRulesPromise ?? (this.boardRulesPromise = import('./StageBoardRulesV5')),
    ]);

    this.teardownActiveViews();
    this.boardSession = null;
    this.linearSession = null;
    this.currentScreen = 'TOUR_PINBOARD';

    this.vfx.setStageMood(1, 'calm');
    this.audio.setMusicCue('title');

    const save = this.campaign.getState();
    const recNode = this.campaign.getRecommendedNextNode(save);
    this.activeTourAct = preferredAct ?? (recNode?.actNumber ?? save.currentAct);

    if (!this.pinboardView) {
      this.pinboardView = new pinboardMod.TourTrunkPinboardView();
    }

    const refreshPinboard = (selectedNodeId?: string | null) => {
      const latestSave = this.campaign.getState();
      this.pinboardView?.render({
        saveState: latestSave,
        nodes: this.campaign.getAllNodes(),
        charmsCatalog: rulesMod.PODIUM_CHARMS_LIST_V5,
        activeAct: this.activeTourAct,
        selectedNodeId: selectedNodeId ?? recNode?.nodeId ?? latestSave.currentNodeId,
      });
    };

    this.pinboardView.mount(this.uiRoot, {
      onLaunchNode: (node, options) => {
        this.audio.playBoardCue('polaroid_pin');
        this.haptics.lockThunk();
        void this.launchCampaignNode(node.nodeId, Boolean(options?.acceptDare));
      },
      onEquipCharms: (equippedIds) => {
        this.audio.playBoardCue('switch_clack');
        this.campaign.setEquippedCharms(equippedIds);
        refreshPinboard();
      },
      onSelectAct: (actNum) => {
        this.audio.playBoardCue('polaroid_pin');
        this.activeTourAct = actNum;
      },
      onSelectSponsor: (sponsor) => {
        this.audio.playBoardCue('switch_clack');
        this.campaign.selectActiveSponsor(sponsor);
        refreshPinboard();
      },
      onBackToGreenRoom: () => {
        this.audio.playSfx('ui_tap');
        this.showGreenRoomHub();
      },
      onPlayUiSfx: (kind) => {
        if (kind === 'pin') this.audio.playBoardCue('polaroid_pin');
        else if (kind === 'charm' || kind === 'launch') this.audio.playBoardCue('switch_clack');
        else this.audio.playSfx('ui_tap');
      },
    });

    refreshPinboard();
  }

  // ==========================================================================
  // 4. LIVING 2.5D STAGE BOARD & ALL 14 PLAYABLE TWISTS (`LivingStageBoardView`)
  // ==========================================================================

  public async launchCampaignNode(nodeId: string, acceptDare = false): Promise<void> {
    await this.ensureStoryReady();
    const node = this.campaign.getNode(nodeId) ?? this.campaign.getRecommendedNextNode();
    if (!node) {
      this.showGreenRoomHub();
      return;
    }

    // Pay entry fee (auto-triggers Frankie's Grassroots Bailout if low on cash so 0 soft-locks!)
    const feeRes = this.campaign.payEntryFeeOrBailout(node.nodeId);
    const feeHandled = feeRes.paidUsd >= 0;
    this.campaign.selectCurrentNode(node.nodeId);

    // Check for authored Stage Walkout + Diegetic Twist Onboarding + Grudge Sabotage beat
    const preMatch = this.campaign.buildAugmentedPreMatchScene(node.nodeId);
    if (preMatch) {
      await this.playInteractiveStoryScene(preMatch.scene, {
        continueButtonLabel: 'LIGHTS UP · TO THE BOARD!',
        onFinished: () => {
          void this.initializeAndMountStageBoard(node, acceptDare, feeHandled);
        },
      });
      return;
    }

    await this.initializeAndMountStageBoard(node, acceptDare, feeHandled);
  }

  private async initializeAndMountStageBoard(
    node: CampaignNodeExtendedV5,
    acceptDare: boolean,
    entryFeePaid: boolean,
  ): Promise<void> {
    const [stageMod, rulesMod, , challengerAiMod] = await this.ensureBoardModules();

    this.teardownActiveViews();
    this.currentScreen = 'STAGE_BOARD';

    // Crossfade into this Stage Tier or Story Branch's real-instrument Symphony!
    this.audio.playStageSymphony(node.tierNumber, node.lane);
    this.vfx.setStageMood(node.tierNumber, node.tierNumber >= 7 ? 'hotseat' : 'board');

    if (!this.boardStageView) {
      this.boardStageView = new stageMod.LivingStageBoardView(this.uiRoot);
    }

    const save = this.campaign.getState();
    const boardTwistId = rulesMod.resolveBoardTwistIdV5(
      node.boardTwistId ?? inferBoardTwistForNode(node),
      node.topology,
    );
    const episode = buildEpisodeProxyFromNode(node, boardTwistId);
    const challenger = buildChallengerProfileFromId(node.challengerId);
    const seed = hashStringSeed(`${node.nodeId}_${save.totalMatchesPlayed}_${Date.now()}`);
    const rng = createMulberryRng(seed);

    // If Oxford Pick & Ban Draft topology, run interactive Pick/Ban Draft modal first!
    if (boardTwistId === 'oxford_pick_ban' && challenger) {
      let workingDraft = rulesMod.buildOxfordPickBanDraftV5({
        targetColumns: node.boardCols,
        poolSize: Math.max(8, node.boardCols + 4),
        rng,
      });

      const advanceRivalDraftIfNeeded = () => {
        let guard = 0;
        while (!workingDraft.isComplete && workingDraft.nextActor === 'RIVAL' && guard < 12) {
          workingDraft = challengerAiMod.applyRivalDraftPick(workingDraft, challenger, null, rng);
          guard += 1;
        }
      };

      const mountFinalizedBoard = (
        draftedCols?: ReturnType<typeof rulesMod.finalizeDraftToBoardColumns>,
      ) => {
        this.boardStageView?.closeModal();
        this.finishStageBoardSetup(
          node,
          episode,
          challenger,
          boardTwistId,
          acceptDare,
          entryFeePaid,
          rng,
          rulesMod,
          draftedCols,
        );
      };

      const renderDraftStep = () => {
        if (!this.boardStageView) return;
        advanceRivalDraftIfNeeded();
        const poolItems: CategoryDraftItemV5[] = workingDraft.pool.map((entry) => ({
          colId: entry.entryId,
          wedgeId: entry.wedgeId,
          domainId: entry.domainId,
          wittyTitle: entry.wittyTitle,
          topicSubtitle: entry.topicSubtitle,
          state:
            entry.status === 'PICKED_PLAYER'
              ? 'PLAYER_PICK'
              : entry.status === 'PICKED_RIVAL'
                ? 'RIVAL_PICK'
                : entry.status === 'BANNED_PLAYER'
                  ? 'PLAYER_BAN'
                  : entry.status === 'BANNED_RIVAL'
                    ? 'RIVAL_BAN'
                    : 'AVAILABLE',
        }));

        const phaseTitle = workingDraft.isComplete
          ? 'Oxford Pick & Ban Locked!'
          : workingDraft.nextAction === 'BAN'
            ? `Oxford Ban: Veto 1 Rival Subject (${workingDraft.playerBansRemaining} left)`
            : `Oxford Pick: Claim Column (${workingDraft.playerPicksRemaining} left)`;

        this.boardStageView.openCategoryDraftModal(
          {
            challenger,
            phaseTitle,
            instruction:
              'Pick favored columns (+75 PTS bonus) and veto your rival’s signature domains before the board lights up.',
            pool: poolItems,
            canConfirm: workingDraft.isComplete,
          },
          {
            onSelectDraftItem: (colId) => {
              if (workingDraft.isComplete) return;
              this.audio.playBoardCue('switch_clack');
              workingDraft = challengerAiMod.applyPlayerDraftPick(workingDraft, colId);
              renderDraftStep();
            },
            onConfirmDraft: () => {
              this.audio.playBoardCue('power_play');
              const finalized = rulesMod.finalizeDraftToBoardColumns(workingDraft, rng);
              mountFinalizedBoard(finalized);
            },
          },
        );
      };

      this.finishStageBoardSetup(
        node,
        episode,
        challenger,
        boardTwistId,
        acceptDare,
        entryFeePaid,
        rng,
        rulesMod,
      );
      renderDraftStep();
      return;
    }

    this.finishStageBoardSetup(
      node,
      episode,
      challenger,
      boardTwistId,
      acceptDare,
      entryFeePaid,
      rng,
      rulesMod,
    );
  }

  private finishStageBoardSetup(
    node: CampaignNodeExtendedV5,
    episode: WorldTourEpisodeV4,
    challenger: ChallengerProfileV4 | null,
    boardTwistId: BoardTwistIdV5,
    acceptDare: boolean,
    entryFeePaid: boolean,
    rng: () => number,
    rulesMod: BoardRulesModule,
    draftedColumns?: ReturnType<BoardRulesModule['finalizeDraftToBoardColumns']>,
  ): void {
    const save = this.campaign.getState();
    let board = rulesMod.generateStageBoardV5(node, {
      boardTwistId,
      equippedCharms: save.equippedCharms,
      draftedColumns,
      rng,
    });

    // Apply any queued Rival Grudge Sabotage ambush cleanly!
    const sabotage = this.campaign.consumeNextGrudgeSabotage(node.nodeId);
    let initialRivalLine: string | null = challenger ? challenger.introLines[0] ?? null : null;
    let initialRivalBadge: string | null = null;
    if (sabotage) {
      initialRivalLine = sabotage.tauntLine;
      initialRivalBadge = `GRUDGE AMBUSH · ${sabotage.rivalName.toUpperCase()}`;
      const openTile = board.tiles.find((t) => t.status === 'OPEN');
      if (openTile && sabotage.kind === 'EARLY_SCREW_AMBUSH') {
        board = {
          ...board,
          forcedTileId: openTile.tileId,
          forcedReasonBanner: `${sabotage.rivalName} called in a Grudge Ambush on "${board.columns[openTile.colIndex]?.wittyTitle ?? 'Opening Tile'}"!`,
        };
      }
    }

    const twistSpec = rulesMod.getBoardTopologySpecV5(boardTwistId);
    const onboardingTip: LivingStageOnboardingTipV5 = {
      kind:
        boardTwistId === 'chain_padlocks'
          ? 'CHAINS'
          : board.playerScrewTokensLeft > 0 && save.totalMatchesPlayed <= 2
            ? 'SCREW'
            : 'GENERAL',
      badgeLabel: twistSpec.shortPill,
      text: twistSpec.ruleHook,
    };

    this.boardSession = {
      node,
      episode,
      challenger,
      board,
      acceptDare,
      dareCompleted: false,
      entryFeePaid,
      activeSabotage: sabotage,
      rng,
      currentStreak: 0,
      bestStreak: 0,
      questionsAnswered: 0,
      questionsCorrect: 0,
      hostLine: twistSpec.hostIntroCue,
      hostPose: 'welcome',
      rivalReactionLine: initialRivalLine,
      rivalActionBadge: initialRivalBadge,
      newlyUnlockedTileIds: [],
      triggeredCharmIds: [],
      lastChallengerAction: null,
      pendingWheelEffect: 'NONE',
      usedDoubleDownCount: 0,
      usedLifelinesCount: 0,
      sweepsOrBullseyesCount: 0,
      buzzerBeatersCount: 0,
      powerPlaysWonCount: 0,
      trailedAtAnyPoint: false,
      onboardingTip,
    };

    void this.audio.playRandomHostCategoryVoice('board_welcome');
    this.renderCurrentStageBoard();
  }

  private renderCurrentStageBoard(): void {
    const session = this.boardSession;
    if (!session || !this.boardStageView) return;
    this.currentScreen = 'STAGE_BOARD';

    const save = this.campaign.getState();
    const rulesModPromise = this.boardRulesPromise;
    void rulesModPromise?.then((rulesMod) => {
      if (!this.boardSession || this.boardSession !== session || !this.boardStageView) return;

      const equippedCharmSpecs = session.board.charms.equippedCharms.map((id) =>
        rulesMod.getPodiumCharmSpecV5(id),
      );

      const wheelLabel =
        session.pendingWheelEffect === 'DOUBLE_POT'
          ? '2× DOUBLE POT ARMED'
          : session.pendingWheelEffect === 'HOT_SEAT_ALL_IN'
            ? 'ALL-IN 2× ARMED'
            : null;

      this.boardStageView.render(
        {
          episode: session.episode,
          board: session.board,
          challenger: session.challenger,
          hostLine: session.hostLine,
          hostPose: session.hostPose,
          onboardingTip: session.onboardingTip,
          rivalReactionLine: session.rivalReactionLine,
          rivalActionBadge: session.rivalActionBadge,
          currentStreak: session.currentStreak,
          audioEnabled: this.isMasterAudioOn(),
          screwsRemaining: session.board.playerScrewTokensLeft,
          equippedCharms: equippedCharmSpecs,
          triggeredCharmIds: session.triggeredCharmIds,
          activeDare: session.node.optionalDare ?? null,
          dareCompleted: session.dareCompleted,
          newlyUnlockedTileIds: session.newlyUnlockedTileIds,
          lastChallengerAction: session.lastChallengerAction,
          activeWheelBoostLabel: wheelLabel,
          playerDisplayName: save.contestantName,
          boardTwistId: session.board.boardTwistId,
          boardTwistLabel: session.board.boardTwistLabel,
          tileMetaById: session.board.tileMetaById,
          tugOfWarTurf: session.board.tugOfWarTurf,
        },
        {
          onSelectTile: (tileId) => {
            void this.handleSelectBoardTile(tileId);
          },
          onScrewTile: (tileId) => {
            void this.handleScrewRivalOnTile(tileId);
          },
          onScrewModeChange: (armed) => {
            this.audio.playBoardCue('switch_clack');
            this.haptics.uiTap();
            if (armed) {
              this.boardStageView?.setHostSpeech(
                'SCREW RIVAL ARMED! Tap any open tile in your opponent’s weak subject to force them onto the hot seat!',
                'hype',
              );
            }
          },
          onCharmInspect: (charm) => {
            this.audio.playSfx('ui_tap');
            this.boardStageView?.setHostSpeech(`${charm.name}: ${charm.effectSummary}`, 'welcome');
          },
          onBackToMap: () => {
            this.audio.playSfx('ui_tap');
            void this.showTourTrunkPinboard(session.node.actNumber);
          },
          onToggleAudio: () => {
            this.toggleMasterAudio();
            this.renderCurrentStageBoard();
          },
          onOpenHowToPlay: () => {
            this.audio.playSfx('ui_tap');
            this.boardStageView?.openHowToPlayModal();
          },
        },
      );

      session.triggeredCharmIds = [];
      session.newlyUnlockedTileIds = [];
    });
  }

  private async handleScrewRivalOnTile(tileId: string): Promise<void> {
    const session = this.boardSession;
    if (!session || !this.boardStageView) return;
    const [, rulesMod] = await this.ensureBoardModules();

    const tileCoords = this.boardStageView.getTileCenterViewportCoords(tileId);

    const res = rulesMod.executePlayerScrewOnTile(session.board, tileId, {
      challenger: session.challenger ?? session.board.challengerId,
      rng: session.rng,
    });

    if (!res.executed) {
      this.audio.playBoardCue('wrong_answer');
      this.boardStageView.setHostSpeech(res.errorReason ?? 'Choose an open tile to Screw Rival!', 'wince');
      return;
    }

    this.audio.playBoardCue('screw_slam');
    this.haptics.shatterPlate();
    void this.audio.playRandomHostCategoryVoice('screw_slammed');

    if (tileCoords) {
      this.vfx.fireScrewSlam(tileCoords.x, tileCoords.y, true);
    }

    if (res.shatteredNeighborTileIds.length > 0 && tileCoords) {
      this.audio.playBoardCue('padlock_break');
      const neighborCoords = res.shatteredNeighborTileIds
        .map((id) => this.boardStageView?.getTileCenterViewportCoords(id))
        .filter((c): c is { x: number; y: number } => Boolean(c))
        .map((c) => ({ xPx: c.x, yPx: c.y }));
      for (const id of res.shatteredNeighborTileIds) {
        this.boardStageView.triggerTileShatter(id);
      }
      if (neighborCoords.length > 0) {
        this.vfx.fireChainShatter(tileCoords.x, tileCoords.y, neighborCoords);
      }
    }

    if (res.lineSweepJackpots.length > 0) {
      this.audio.playBoardCue('jackpot_sweep');
      this.vfx.fireLineJackpotSweep(`+${res.lineSweepJackpots.length * 300} STAGE SWEEP!`);
    }

    session.board = res.board;
    session.hostLine = res.hostLine;
    session.hostPose = res.outcome === 'CHOKED' ? 'hype' : 'wince';
    session.rivalReactionLine = res.challengerLine;
    session.rivalActionBadge =
      res.outcome === 'CHOKED'
        ? `SCREW LANDED! +${res.playerScoreDelta} PTS`
        : `SCREW BACKFIRED! RIVAL +${res.rivalScoreDelta}`;
    session.newlyUnlockedTileIds = res.shatteredNeighborTileIds;
    session.onboardingTip = null;
    this.evaluateLiveShowmanDare(session);

    if (session.board.isBoardComplete) {
      this.renderCurrentStageBoard();
      window.setTimeout(() => {
        void this.presentBoardCurtainCall();
      }, 950);
      return;
    }

    this.renderCurrentStageBoard();
  }

  private async handleSelectBoardTile(tileId: string): Promise<void> {
    const session = this.boardSession;
    if (!session || !this.boardStageView) return;

    const effectiveTileId =
      session.board.forcedTileId && session.board.forcedTileId !== tileId
        ? session.board.forcedTileId
        : tileId;

    const tile = session.board.tiles.find((t) => t.tileId === effectiveTileId);
    if (!tile || tile.status !== 'OPEN') {
      this.audio.playSfx('ui_tap');
      return;
    }

    const col = session.board.columns[tile.colIndex];
    if (col && col.frozenTurnsRemaining > 0) {
      this.audio.playBoardCue('wrong_answer');
      this.boardStageView.setHostSpeech(
        `That "${col.wittyTitle}" column is frozen for ${col.frozenTurnsRemaining} more turn!`,
        'wince',
      );
      return;
    }

    this.audio.playBoardCue('tile_flip');
    this.haptics.uiTap();
    session.onboardingTip = null;

    const [, rulesMod, scoringMod] = await this.ensureBoardModules();

    if (session.board.boardTwistId === 'spotlight_roulette' && !session.board.forcedTileId) {
      await this.boardStageView.animateSpotlightRoulette(tile.tileId, 650);
    }

    // Check Wheel Curveball Twist first!
    if (tile.twist === 'WHEEL_CURVEBALL') {
      const spinRes = rulesMod.spinCurveballWheelV5(session.board, session.rng);
      this.boardStageView.openStageWheelModal(
        {
          outcome: spinRes.outcome,
          outcomeHeadline: spinRes.sliceMeta.label,
          outcomeDescription: spinRes.banner,
          hostPrompt: 'Give the brass Stage Wheel a spin before your clue!',
        },
        {
          onSpinStart: () => this.audio.playBoardCue('wheel_tick'),
          onTick: () => this.audio.playBoardCue('wheel_tick'),
          onSpinComplete: () => {
            this.boardStageView?.closeModal();
            session.board = spinRes.board;
            session.pendingWheelEffect = spinRes.nextTileEffect;
            if (spinRes.unlockedTileIds.length > 0) {
              this.audio.playBoardCue('padlock_break');
            }
            if (spinRes.awardedWedge) {
              this.audio.playBoardCue('wedge_earned');
            }
            void this.launchBoardTileQuestion(tile, col ?? null, null);
          },
        },
      );
      return;
    }

    // Check Power-Play Brass Wager Dial!
    if (tile.twist === 'POWER_PLAY') {
      this.audio.playBoardCue('power_play');
      void this.audio.playRandomHostCategoryVoice('power_play');
      const bounds = scoringMod.getPowerPlayWagerBounds(session.board.playerScore);
      const fallbackCol: BoardColumnV4 = col ?? {
        colIndex: tile.colIndex,
        domainId: tile.domainId,
        wedgeId: tile.wedgeId,
        wittyTitle: 'Power Play Spotlight',
        topicSubtitle: 'Stage Wager',
        frozenTurnsRemaining: 0,
        pickedBy: 'SHOW',
      };
      this.boardStageView.openPowerPlayDialModal(
        {
          column: fallbackCol,
          tile,
          playerScore: session.board.playerScore,
          minWager: bounds.minWager,
          maxWager: bounds.maxWager,
          hostLine: 'Turn the brass dial to lock your Power-Play stake!',
        },
        {
          onWagerChange: () => this.audio.playBoardCue('wheel_tick'),
          onLockWager: (wagerPts) => {
            this.audio.playBoardCue('lock_in');
            this.boardStageView?.closeModal();
            void this.launchBoardTileQuestion(tile, fallbackCol, wagerPts);
          },
        },
      );
      return;
    }

    await this.launchBoardTileQuestion(tile, col ?? null, null);
  }

  private async launchBoardTileQuestion(
    tile: BoardTileV4,
    col: BoardColumnV4 | null,
    powerPlayWager: number | null,
  ): Promise<void> {
    const session = this.boardSession;
    if (!session) return;

    const [[spotlightMod, gadgetsMod, qGen, wittyHost], [, rulesMod]] = await Promise.all([
      this.ensureQuestionModules(),
      this.ensureBoardModules(),
    ]);

    const card = await qGen.drawQuestionCardV4({
      format: tile.format,
      domainId: tile.domainId,
      wedgeId: tile.wedgeId,
      difficultyTier: mapTierNumberToDifficultyV4(session.node.tierNumber),
      isLightningBlitz: tile.twist === 'LIGHTNING_BLITZ',
      excludeQids: this.usedQidsThisSession,
    });
    this.usedQidsThisSession.add(card.qid);

    const displayCard: QuestionCardV4 = col
      ? { ...card, wittyHeader: col.wittyTitle }
      : card;

    const preCharm = rulesMod.getPreQuestionCharmModifiers(session.board, {
      domainId: tile.domainId,
      format: displayCard.format,
      choices: displayCard.choices ?? displayCard.escalator?.choices ?? displayCard.visualSpotter?.choices,
      correctIndex:
        displayCard.correctIndex ??
        displayCard.escalator?.correctIndex ??
        displayCard.visualSpotter?.correctIndex,
      rng: session.rng,
    });

    this.stopQuestionClock();
    this.spotlightRenderer?.dispose();
    this.spotlightRenderer = new spotlightMod.SpotlightLozengeRendererV5(this.uiRoot);
    this.currentScreen = 'SPOTLIGHT_QUESTION';

    const doublePotMult =
      session.pendingWheelEffect === 'DOUBLE_POT' ||
      session.pendingWheelEffect === 'HOT_SEAT_ALL_IN'
        ? 2
        : 1;
    const effectivePointVal =
      session.board.tileMetaById[tile.tileId]?.displayPointsOverride ?? tile.pointValue;

    let answered = false;
    const renderer = this.spotlightRenderer;

    renderer.mountQuestion(
      {
        card: displayCard,
        tilePointValue: effectivePointVal,
        timerMode: this.timerMode,
        lifelines5050Left: session.board.lifelines5050Left,
        lifelinesHintLeft: session.board.lifelinesHintLeft,
        currentStreak: session.currentStreak,
        activeWagerPoints: powerPlayWager ?? undefined,
        doublePotMultiplier: doublePotMult > 1 ? doublePotMult : undefined,
        isLightningBlitz: tile.twist === 'LIGHTNING_BLITZ',
        isCrownWedgeTile: tile.twist === 'CROWN_WEDGE',
        isRivalBountyTile: tile.twist === 'RIVAL_BOUNTY',
        venueLabel: `${session.node.venueName} · ${session.board.boardTwistLabel}`,
        questionCounterLabel: `TURN ${session.board.turnNumber + 1}/${session.board.maxTurns}`,
        tierNumber: session.node.tierNumber,
        venueBackdropUrl: V5_VENUE_STAGES[session.node.tierNumber],
        challengerId: session.node.challengerId,
        challengerName: session.challenger?.name,
        hostPose: powerPlayWager ? 'hype' : 'welcome',
        coachWhisper:
          preCharm.activeCharms.length > 0
            ? preCharm.activeCharms.map((c) => c.description).join(' · ')
            : null,
        customGadgetMounter: (slotEl, hostApi) => {
          const handle = gadgetsMod.mountTactileGadgetV5(slotEl, hostApi.card, {
            onInteractionFeedback: (k) => hostApi.emitFeedback(k),
            onSubmit: (sub) => hostApi.submit(sub),
            getDoubleDownArmed: () => renderer.getDoubleDownArmed(),
          });
          return handle ?? undefined;
        },
      },
      {
        onInteractionFeedback: (kind) => {
          if (kind === 'lock_in') this.audio.playBoardCue('lock_in');
          else if (kind === 'dial') this.audio.playBoardCue('wheel_tick');
          else if (kind === 'pair' || kind === 'reorder') this.audio.playBoardCue('switch_clack');
          else this.audio.playSfx('ui_tap');
        },
        onUse5050: () => {
          const consumed = rulesMod.consumeBoardLifelineV5(session.board, '5050');
          if (!consumed.consumed) return;
          session.board = consumed.board;
          session.usedLifelinesCount += 1;
          this.audio.playBoardCue('switch_clack');
          renderer.apply5050Elimination();
        },
        onUseHint: () => {
          const consumed = rulesMod.consumeBoardLifelineV5(session.board, 'HINT');
          if (!consumed.consumed) return;
          session.board = consumed.board;
          session.usedLifelinesCount += 1;
          this.audio.playBoardCue('switch_clack');
          renderer.revealHint(displayCard.helpfulHint);
        },
        onDoubleDownToggle: (armed) => {
          this.audio.playBoardCue('switch_clack');
          if (armed) {
            void this.audio.playRandomHostCategoryVoice('double_down');
          }
        },
        onSubmit: async (submission) => {
          if (answered) return;
          answered = true;
          const clockRemaining = this.getRemainingClockSecSnapshot(
            displayCard,
            preCharm.shotClockBonusSec,
          );
          this.stopQuestionClock();

          const rawEval = qGen.evaluateSubmissionV4(displayCard, submission, effectivePointVal);
          const wasForcedTrap = session.board.forcedTileId === tile.tileId;

          const resolved = rulesMod.resolveTileResultV5(session.board, tile.tileId, rawEval, {
            currentStreak: session.currentStreak,
            doubleDownArmed: Boolean(submission.doubleDownArmed && powerPlayWager === null),
            powerPlayWager,
            wheelEffect: session.pendingWheelEffect,
            elapsedSec: submission.elapsedSec,
            secondsRemaining: clockRemaining,
            timedOut: submission.timedOut,
            rng: session.rng,
          });

          session.pendingWheelEffect = 'NONE';
          session.board = resolved.board;
          session.questionsAnswered += 1;
          if (submission.doubleDownArmed) session.usedDoubleDownCount += 1;
          if (submission.used5050 || submission.usedHint) session.usedLifelinesCount += 1;

          const finalEval = resolved.charmResult.evaluated;
          if (finalEval.isCorrect) {
            session.questionsCorrect += 1;
            session.currentStreak = resolved.newStreak;
            session.bestStreak = Math.max(session.bestStreak, session.currentStreak);
            if (finalEval.isBullseyeOrSweep) session.sweepsOrBullseyesCount += 1;
            if (clockRemaining > 0 && clockRemaining <= 2.5) session.buzzerBeatersCount += 1;
            if (powerPlayWager && powerPlayWager > 0) session.powerPlaysWonCount += 1;

            this.playStreakSfx(session.currentStreak);
            this.audio.playAudienceReaction(
              session.node.tierNumber,
              session.currentStreak >= 3 || finalEval.isBullseyeOrSweep ? 'roar' : 'applause',
            );
            this.haptics.correctBloom();

            if (session.currentStreak === 3) void this.audio.playRandomHostCategoryVoice('streak_3');
            else if (session.currentStreak === 4) void this.audio.playRandomHostCategoryVoice('streak_4');
            else if (session.currentStreak >= 5) void this.audio.playRandomHostCategoryVoice('streak_5');
            else if (clockRemaining > 0 && clockRemaining <= 2.2) {
              void this.audio.playRandomHostCategoryVoice('buzzer_beater');
            }
          } else {
            session.currentStreak = 0;
            this.audio.playBoardCue('wrong_answer');
            if (submission.doubleDownArmed || (powerPlayWager && powerPlayWager > 0)) {
              this.audio.playAudienceReaction(session.node.tierNumber, 'gasp');
            }
            this.haptics.wrongThud(Boolean(submission.doubleDownArmed));
            void this.audio.playRandomHostCategoryVoice('tough_miss');
          }

          session.newlyUnlockedTileIds = resolved.unlockedTileIds;
          session.triggeredCharmIds = resolved.charmResult.triggeredCharms.map((c) => c.charmId);

          const hostQuip = wittyHost.pickBestTurnQuip(null, {
            won: finalEval.isCorrect,
            format: displayCard.format,
            twist: powerPlayWager ? 'POWER_PLAY' : tile.twist,
            elapsedSec: submission.elapsedSec,
            secondsRemaining: this.timerMode === 'STANDARD' ? clockRemaining : undefined,
            doubleDownArmed: submission.doubleDownArmed,
            isBullseyeOrSweep: finalEval.isBullseyeOrSweep,
            wasForcedSpotlight: wasForcedTrap,
            escalatorCluesRevealed: submission.escalatorCluesRevealed,
            earnedWedge: Boolean(resolved.awardedWedge),
            currentStreak: session.currentStreak,
            domainId: displayCard.domainId,
            domainName: displayCard.categoryLabel,
            rivalName: session.challenger?.name,
            rng: session.rng,
          }).text;

          session.hostLine = hostQuip;
          session.hostPose = finalEval.isCorrect ? 'hype' : 'wince';
          this.evaluateLiveShowmanDare(session);

          void this.recordAnalyticsAndFeats({
            card: displayCard,
            evaluated: finalEval,
            submission,
            modeLabel: 'WORLD_TOUR_V5',
            hubId: session.node.nodeId,
            powerPlayWager: powerPlayWager ?? undefined,
            padlocksBroken: resolved.unlockedTileIds.length,
            survivedChallengerTrap: Boolean(wasForcedTrap && finalEval.isCorrect),
            awardedWedge: resolved.awardedWedge,
            totalBoardWedgesNow: session.board.earnedWedges.length,
          });

          const charmBanner =
            resolved.charmResult.triggeredCharms.length > 0
              ? resolved.charmResult.triggeredCharms.map((c) => `${c.name} (${c.effectTag})`).join(' · ')
              : resolved.lineSweepJackpots.length > 0
                ? `STAGE SWEEP JACKPOT +${resolved.lineSweepJackpotPoints} PTS!`
                : undefined;

          renderer.showReveal({
            evaluation: {
              ...finalEval,
              netPointsDelta: resolved.totalPlayerScoreDelta,
            },
            hostQuip,
            hostSpeakerName: 'Max Sterling',
            funFactWhy: displayCard.funFactWhy,
            wedgeAwarded: resolved.awardedWedge,
            charmingTagLabel: charmBanner,
            hostPoseOverride: finalEval.isCorrect ? 'hype' : 'wince',
            nextButtonLabel: session.board.isBoardComplete
              ? 'FINAL SCOREBOARD'
              : 'BACK TO STAGE BOARD',
          });
        },
        onNext: () => {
          this.audio.playSfx('ui_tap');
          void this.advanceAfterBoardQuestion();
        },
      },
    );

    if (preCharm.autoEliminatedChoiceIndex !== null) {
      renderer.apply5050Elimination([preCharm.autoEliminatedChoiceIndex]);
    }

    this.startQuestionClock(
      renderer,
      displayCard.recommendedSec + preCharm.shotClockBonusSec,
      async () => {
        if (answered) return;
        renderer.submitExternalAnswer({
          format: displayCard.format,
          timedOut: true,
          doubleDownArmed: renderer.getDoubleDownArmed(),
        });
      },
    );
  }

  private async advanceAfterBoardQuestion(): Promise<void> {
    const session = this.boardSession;
    if (!session) {
      this.showGreenRoomHub();
      return;
    }

    this.spotlightRenderer?.dispose();
    this.spotlightRenderer = null;

    if (session.board.isBoardComplete) {
      await this.presentBoardCurtainCall();
      return;
    }

    if (session.challenger && session.board.hasActiveRival) {
      const [, rulesMod] = await this.ensureBoardModules();
      let playerStats: PlayerStatProfileForHost | null = null;
      try {
        const suite = await this.ensureMetaSuite();
        playerStats = suite.getPlayerStatProfileForHost();
      } catch {
        playerStats = null;
      }

      const rivalTurn = rulesMod.runChallengerTurnV5(
        session.board,
        session.challenger,
        playerStats,
        session.rng,
      );
      session.board = rivalTurn.board;
      session.lastChallengerAction = rivalTurn.action;
      session.rivalReactionLine = rivalTurn.action.banterLine;
      if (session.board.playerScore < session.board.rivalScore) {
        session.trailedAtAnyPoint = true;
      }

      if (rivalTurn.rivalScrewResult?.triggered) {
        this.audio.playBoardCue('rival_trap');
        session.rivalActionBadge = rivalTurn.rivalScrewResult.blockedByScrewShield
          ? 'SCREW SHIELD BLOCKED RIVAL!'
          : 'RIVAL SCREW DEPLOYED!';
        if (rivalTurn.rivalScrewResult.blockedByScrewShield) {
          session.triggeredCharmIds.push('screw_shield');
        }
      } else if (rivalTurn.blockedFreezeByScrewShield) {
        session.rivalActionBadge = 'SCREW SHIELD BLOCKED FREEZE!';
        session.triggeredCharmIds.push('screw_shield');
      } else if (rivalTurn.action.rivalPointsDelta > 0) {
        session.rivalActionBadge = `${session.challenger.name.toUpperCase()} +${rivalTurn.action.rivalPointsDelta} PTS`;
      } else {
        session.rivalActionBadge = `${session.challenger.name.toUpperCase()} MISSED!`;
      }

      if (session.board.isBoardComplete) {
        await this.presentBoardCurtainCall();
        return;
      }
    }

    this.renderCurrentStageBoard();

    if (session.newlyUnlockedTileIds.length > 0 && this.boardStageView) {
      const coords = session.newlyUnlockedTileIds
        .map((id) => this.boardStageView?.getTileCenterViewportCoords(id))
        .filter((c): c is { x: number; y: number } => Boolean(c));
      if (coords.length > 0) {
        this.audio.playBoardCue('padlock_break');
        this.vfx.fireChainShatter(
          coords[0].x,
          coords[0].y,
          coords.map((c) => ({ xPx: c.x, yPx: c.y })),
        );
      }
    }
  }

  private evaluateLiveShowmanDare(session: ActiveBoardMatchSessionV5): void {
    const dare: ShowmanDareV5 | undefined = session.node.optionalDare;
    if (!dare || session.dareCompleted) return;
    const kind = dare.conditionKind;
    const b = session.board;
    if (kind === 'USE_SCREW_SUCCESSFULLY' && b.playerSuccessfulScrews >= 1) {
      session.dareCompleted = true;
    } else if (kind === 'WIN_DOUBLE_DOWN' && session.usedDoubleDownCount >= 1 && session.questionsCorrect >= 1) {
      session.dareCompleted = true;
    } else if (kind === 'REACH_STREAK_4' && session.bestStreak >= 4) {
      session.dareCompleted = true;
    } else if (kind === 'EARN_3_WEDGES' && b.earnedWedges.length >= 3) {
      session.dareCompleted = true;
    } else if (kind === 'CLEAR_FULL_LINE' && b.totalLineSweepJackpotPoints > 0) {
      session.dareCompleted = true;
    } else if (kind === 'WIN_POWER_PLAY' && session.powerPlaysWonCount >= 1) {
      session.dareCompleted = true;
    }
  }

  private async presentBoardCurtainCall(): Promise<void> {
    const session = this.boardSession;
    if (!session || !this.boardStageView) return;

    const [, , scoringMod, , wittyHost] = await this.ensureBoardModules();
    const boardOutcome = scoringMod.evaluateBoardOutcome(session.board);
    const didWin = boardOutcome.playerWon;

    if (session.node.optionalDare && !session.dareCompleted && didWin) {
      if (session.node.optionalDare.conditionKind === 'NO_LIFELINES_USED' && session.usedLifelinesCount === 0) {
        session.dareCompleted = true;
      }
    }

    const accuracyPct =
      session.questionsAnswered > 0
        ? Math.round((session.questionsCorrect / session.questionsAnswered) * 100)
        : 0;

    const resolution = this.campaign.recordMatchOutcome({
      nodeId: session.node.nodeId,
      won: didWin,
      playerScore: session.board.playerScore,
      rivalScore: session.board.rivalScore,
      accuracyPct,
      wedgesEarned: session.board.earnedWedges.length,
      sweepsOrBullseyes:
        session.sweepsOrBullseyesCount +
        session.board.paidOutRowIndices.length +
        session.board.paidOutColIndices.length,
      dareCompleted: session.dareCompleted,
      screwsLanded: session.board.playerSuccessfulScrews,
      usedDoubleDown: session.usedDoubleDownCount > 0,
      entryFeeAlreadyPaid: session.entryFeePaid,
    });

    if (didWin) {
      this.vfx.setStageMood(session.node.tierNumber, 'jackpot');
      this.vfx.fireConfettiOvation(3800);
      this.playStreakSfx(5);
      this.audio.playAudienceReaction(session.node.tierNumber, 'roar');
      void this.audio.playRandomHostCategoryVoice(
        resolution.endingResolution ? 'ending_crown' : 'match_win',
      );
    } else {
      this.audio.playAudienceReaction(session.node.tierNumber, 'applause');
      void this.audio.playRandomHostCategoryVoice('redemption');
    }

    const clippings = wittyHost.generatePostMatchHeadlines({
      episodeId: session.episode.episodeId,
      contestantName: resolution.state.contestantName,
      won: didWin,
      playerScore: session.board.playerScore,
      rivalScore: session.board.hasActiveRival ? session.board.rivalScore : undefined,
      starsEarned: resolution.starsEarned,
      wedgesEarned: session.board.earnedWedges.length,
      buzzerBeatersCount: session.buzzerBeatersCount,
      instantSnipesCount: 0,
      match4SweepsCount: session.sweepsOrBullseyesCount,
      sort4PerfectsCount: 0,
      pinpointBullseyesCount: 0,
      clue1SnipesCount: 0,
      powerPlaysWon: session.powerPlaysWonCount,
      doubleDownsWon: session.usedDoubleDownCount,
      doubleDownsBlown: 0,
      weakDomainUpsets: session.board.playerSuccessfulScrews,
      weakDomainName: null,
      wasComebackWin: Boolean(didWin && session.trailedAtAnyPoint),
      bestStreakInMatch: session.bestStreak,
      rng: session.rng,
    });

    const hostClosingQuip = wittyHost.pickMatchWrapQuip(didWin, session.rng).text;
    const nextRecNode = this.campaign.getRecommendedNextNode(resolution.state);

    const maybePlayEndingThenRoute = async (target: 'NEXT' | 'MAP' | 'HOME') => {
      if (resolution.endingResolution) {
        await this.playInteractiveStoryScene(resolution.endingResolution.scene, {
          continueButtonLabel: 'RETURN TO TOUR TRUNK',
          onFinished: () => {
            void this.showTourTrunkPinboard(5);
          },
        });
        return;
      }
      if (target === 'NEXT' && nextRecNode) {
        await this.launchCampaignNode(nextRecNode.nodeId, false);
      } else if (target === 'HOME') {
        this.showGreenRoomHub();
      } else {
        await this.showTourTrunkPinboard(nextRecNode?.actNumber ?? session.node.actNumber);
      }
    };

    const proceedAfterCurtain = async (target: 'NEXT' | 'MAP' | 'HOME') => {
      if (resolution.postMatchSceneId) {
        const postScene = this.campaign.getScene(resolution.postMatchSceneId);
        if (postScene) {
          await this.playInteractiveStoryScene(postScene, {
            continueButtonLabel: resolution.endingResolution ? 'WORLD CORONATION' : 'CONTINUE TOUR',
            onFinished: () => {
              void maybePlayEndingThenRoute(target);
            },
          });
          return;
        }
      }
      await maybePlayEndingThenRoute(target);
    };

    this.boardStageView.renderPostMatchCurtainCall(
      {
        episode: session.episode,
        didWin,
        starsEarned: resolution.starsEarned,
        playerScore: session.board.playerScore,
        rivalScore: session.board.rivalScore,
        soloTargetScore: session.board.soloTargetScore,
        hasActiveRival: session.board.hasActiveRival,
        challenger: session.challenger,
        earnedWedges: session.board.earnedWedges,
        accuracyPct,
        bestStreak: session.bestStreak,
        audienceDelta: resolution.audienceDelta,
        totalAudienceNow: resolution.state.liveWorldAudience,
        prizeEarnedUsd: Math.max(0, resolution.bankrollDeltaUsd),
        headlines: clippings.map((c) => `[${c.outlet}] ${c.headline} — ${c.subline}`),
        hostClosingQuip,
        rivalClosingLine: session.challenger
          ? didWin
            ? session.challenger.loseMatchLine
            : session.challenger.winMatchLine
          : undefined,
        hasNextEpisode: Boolean(nextRecNode),
        dareCompleted: session.dareCompleted,
        dareDescription: session.node.optionalDare?.description,
        dareBonusUsd: resolution.dareBonusUsd,
        newspaperMasthead: `${session.node.cityStamp} BROADCAST CHRONICLE`,
        nextStageLabel: nextRecNode ? `NEXT: ${nextRecNode.showTitle}` : 'TOUR TRUNK MAP',
        redemptionNote: !didWin
          ? 'FAIL-FORWARD CIRCUIT OPEN: Your crimson Late-Night Redemption route is live in the Tour Trunk!'
          : resolution.unlockedCharms.length > 0
            ? `NEW PODIUM CHARM UNLOCKED: ${resolution.unlockedCharms.join(', ')}`
            : undefined,
      },
      {
        onNextEpisode: nextRecNode
          ? () => {
              this.audio.playBoardCue('switch_clack');
              void proceedAfterCurtain('NEXT');
            }
          : undefined,
        onRematch: () => {
          this.audio.playBoardCue('switch_clack');
          if (!didWin && resolution.canOfferContractMulligan) {
            this.campaign.invokeContractMulligan(session.node.nodeId);
          }
          void this.launchCampaignNode(session.node.nodeId, session.acceptDare);
        },
        onOpenWorldTourMap: () => {
          this.audio.playBoardCue('polaroid_pin');
          void proceedAfterCurtain('MAP');
        },
        onBackHome: () => {
          this.audio.playSfx('ui_tap');
          void proceedAfterCurtain('HOME');
        },
      },
    );
  }

  // ==========================================================================
  // 5. MAHOGANY & BRASS TOPIC JUKEBOX + DAILY SHOW + ENDLESS STREAK
  // ==========================================================================

  public async openTopicJukebox(opts?: {
    initialDomainId?: DomainId | null;
    initialSearchQuery?: string;
  }): Promise<void> {
    const jukeboxMod = await this.ensureJukeboxModule();
    this.teardownActiveViews();
    this.currentScreen = 'TOPIC_JUKEBOX';

    this.audio.setMusicCue('greenroom');
    this.jukeboxView = new jukeboxMod.TopicJukeboxView(this.uiRoot);
    this.jukeboxView.mount(
      {
        onStartCustomShow: (spec: TopicJukeboxLaunchSpec) => {
          this.audio.playBoardCue('switch_clack');
          this.haptics.lockThunk();
          this.formatMode = spec.formatMode;
          this.timerMode = spec.timerPace;
          writeLocalPref(FORMAT_PREF_KEY, spec.formatMode);
          writeLocalPref(TIMER_PREF_KEY, spec.timerPace);
          void this.startCustomTopicShow(spec);
        },
        onClose: () => {
          this.audio.playSfx('ui_tap');
          this.showGreenRoomHub();
        },
        onChangeFormatMode: (mode: BriefingFormatModeV4) => {
          this.formatMode = mode;
          writeLocalPref(FORMAT_PREF_KEY, mode);
        },
        onChangeTimerPace: (pace: TimerPaceModeV4) => {
          this.timerMode = pace;
          writeLocalPref(TIMER_PREF_KEY, pace);
        },
        onToggleFullscreen: () => {
          void this.toggleFullscreen();
        },
        onInteractionFeedback: (kind: 'dial_tick' | 'switch_flip' | 'lever_pull' | 'tap') => {
          if (kind === 'dial_tick') this.audio.playBoardCue('wheel_tick');
          else if (kind === 'switch_flip' || kind === 'lever_pull') {
            this.audio.playBoardCue('switch_clack');
          } else {
            this.audio.playSfx('ui_tap');
          }
        },
      },
      {
        mode: 'page',
        initialDomainId: opts?.initialDomainId ?? null,
        initialSearchQuery: opts?.initialSearchQuery ?? '',
        initialFormatMode: this.formatMode,
        initialTimerPace: this.timerMode,
      },
    );
  }

  private async startCustomTopicShow(spec: TopicJukeboxLaunchSpec): Promise<void> {
    this.audio.playStageSymphony(3, 'MAIN_STAGE');
    const chosenDom = spec.l0DomainId ?? spec.domains[0] ?? null;
    this.linearSession = {
      mode: 'CUSTOM_SHOW',
      title: spec.selectionLabel || 'Custom Topic Show',
      venueLabel: `Topic Jukebox · ${spec.selectionLabel || 'All 12 Domains'}`,
      tierNumber: 3,
      totalQuestions: spec.count,
      questionIndex: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      livesRemaining: 99,
      lifelines5050Left: 2,
      lifelinesHintLeft: 2,
      earnedWedges: [],
      formatMode: spec.formatMode,
      timerPace: spec.timerPace,
      domainId: chosenDom,
      subcategoryId: spec.l2TopicId ?? spec.l1SubcategoryId ?? null,
      difficultyPreset: spec.difficulty,
      prebuiltDeck: null,
      srsDeck: null,
      answerResults: [],
    };
    await this.presentNextLinearQuestion();
  }

  public async startDailyBroadcast(): Promise<void> {
    const [, , qGen] = await this.ensureQuestionModules();
    const todayCode = getTodayUtcCode();
    const seed = getDailySeedFromUtcCode(todayCode);
    const deck = await qGen.drawQuestionDeckV4(10, {
      seed,
      difficultyTier: 'COLLEGE',
    });

    this.audio.playStageSymphony(4, 'MAIN_STAGE');
    this.linearSession = {
      mode: 'DAILY',
      title: `Daily Show #${getDailyBroadcastNumber()}`,
      venueLabel: `Global Daily Broadcast · ${todayCode}`,
      tierNumber: 4,
      totalQuestions: deck.length,
      questionIndex: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      livesRemaining: 99,
      lifelines5050Left: 2,
      lifelinesHintLeft: 2,
      earnedWedges: [],
      formatMode: 'VARIETY_MIX',
      timerPace: this.timerMode,
      domainId: null,
      subcategoryId: null,
      difficultyPreset: 'COLLEGE',
      prebuiltDeck: deck,
      srsDeck: null,
      answerResults: [],
    };
    await this.presentNextLinearQuestion();
  }

  public async startEndlessStreak(): Promise<void> {
    this.audio.playStageSymphony(6, 'MAIN_STAGE');
    this.linearSession = {
      mode: 'ENDLESS',
      title: 'Endless Streak Survival',
      venueLabel: 'High-Voltage Survival Stage · 3 Strikes',
      tierNumber: 6,
      totalQuestions: Number.POSITIVE_INFINITY,
      questionIndex: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      livesRemaining: 3,
      lifelines5050Left: 3,
      lifelinesHintLeft: 3,
      earnedWedges: [],
      formatMode: this.formatMode,
      timerPace: this.timerMode,
      domainId: null,
      subcategoryId: null,
      difficultyPreset: 'ADAPTIVE',
      prebuiltDeck: null,
      srsDeck: null,
      answerResults: [],
    };
    await this.presentNextLinearQuestion();
  }

  private async startSrsReviewDeck(cards: readonly SrsReviewCard[]): Promise<void> {
    if (!cards || cards.length === 0) return;
    this.audio.playStageSymphony(5, 'VELVET_SALON');
    this.linearSession = {
      mode: 'SRS_REVIEW',
      title: 'Mastery Recall Salon',
      venueLabel: 'Spaced-Repetition Recall Stage',
      tierNumber: 5,
      totalQuestions: cards.length,
      questionIndex: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      livesRemaining: 99,
      lifelines5050Left: 2,
      lifelinesHintLeft: 2,
      earnedWedges: [],
      formatMode: 'CLASSIC_4_ONLY',
      timerPace: 'RELAXED_UNTIMED',
      domainId: null,
      subcategoryId: null,
      difficultyPreset: 'ADAPTIVE',
      prebuiltDeck: null,
      srsDeck: [...cards],
      answerResults: [],
    };
    await this.presentNextLinearQuestion();
  }

  private async presentNextLinearQuestion(): Promise<void> {
    const run = this.linearSession;
    if (!run) {
      this.showGreenRoomHub();
      return;
    }

    if (
      run.questionIndex >= run.totalQuestions ||
      (run.mode === 'ENDLESS' && run.livesRemaining <= 0)
    ) {
      this.renderLinearCurtainSummary(run);
      return;
    }

    const [spotlightMod, gadgetsMod, qGen, wittyHost] = await this.ensureQuestionModules();
    let card: QuestionCardV4;

    if (run.prebuiltDeck && run.prebuiltDeck[run.questionIndex]) {
      card = run.prebuiltDeck[run.questionIndex];
    } else if (run.srsDeck && run.srsDeck[run.questionIndex]) {
      const srs = run.srsDeck[run.questionIndex];
      const domId = Math.max(0, Math.min(11, srs.domainId || 0)) as DomainId;
      const rawChoices = [srs.correctAnswer, ...(srs.distractors ?? [])].slice(0, 4);
      while (rawChoices.length < 4) {
        rawChoices.push(`Option ${rawChoices.length + 1}`);
      }
      const rng = createMulberryRng(srs.qid + run.questionIndex * 31);
      for (let i = rawChoices.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [rawChoices[i], rawChoices[j]] = [rawChoices[j], rawChoices[i]];
      }
      const fourTuple = [rawChoices[0], rawChoices[1], rawChoices[2], rawChoices[3]] as const;
      const correctIndex = Math.max(0, fourTuple.indexOf(srs.correctAnswer)) as 0 | 1 | 2 | 3;
      card = {
        qid: srs.qid,
        format: 'MULTIPLE_CHOICE',
        domainId: domId,
        wedgeId: domainToWedgeColor(domId),
        categoryLabel: srs.subcatLabel || 'Mastery Recall',
        wittyHeader: 'Mastery Recall Check',
        difficultyTier: 'COLLEGE',
        recommendedSec: 30,
        readInGraceSec: 2.0,
        prompt: srs.prompt,
        helpfulHint: srs.whyExplanation || 'Recall your earlier studio miss!',
        funFactWhy: srs.whyExplanation || `Verified answer: ${srs.correctAnswer}.`,
        choices: fourTuple,
        correctIndex,
      };
    } else {
      card = await qGen.drawQuestionCardV4({
        format: run.formatMode === 'CLASSIC_4_ONLY' ? 'MULTIPLE_CHOICE' : undefined,
        domainId: run.domainId ?? undefined,
        subcategoryId: run.subcategoryId ?? undefined,
        difficultyTier: mapDifficultyPresetToTierV4(run.difficultyPreset, run.currentStreak),
        excludeQids: this.usedQidsThisSession,
        preferDynamicShards: run.mode === 'ENDLESS' && run.questionIndex >= 8,
      });
      this.usedQidsThisSession.add(card.qid);
    }

    this.teardownActiveViews();
    this.currentScreen = 'SPOTLIGHT_QUESTION';
    this.spotlightRenderer = new spotlightMod.SpotlightLozengeRendererV5(this.uiRoot);
    const renderer = this.spotlightRenderer;

    const counterLabel =
      run.mode === 'ENDLESS'
        ? `STREAK ${run.currentStreak} · ${run.livesRemaining} LIVES`
        : `CLUE ${run.questionIndex + 1} OF ${run.totalQuestions}`;

    const whisper = run.coachWhispers?.[run.questionIndex] ?? null;
    let answered = false;
    const basePoints = 200 + Math.min(400, run.currentStreak * 50);

    renderer.mountQuestion(
      {
        card,
        tilePointValue: basePoints,
        timerMode: run.timerPace,
        lifelines5050Left: run.lifelines5050Left,
        lifelinesHintLeft: run.lifelinesHintLeft,
        currentStreak: run.currentStreak,
        venueLabel: run.venueLabel,
        questionCounterLabel: counterLabel,
        tierNumber: run.tierNumber,
        venueBackdropUrl: V5_VENUE_STAGES[run.tierNumber],
        hostPose: 'welcome',
        coachWhisper: whisper,
        customGadgetMounter: (slotEl, hostApi) => {
          const handle = gadgetsMod.mountTactileGadgetV5(slotEl, hostApi.card, {
            onInteractionFeedback: (k) => hostApi.emitFeedback(k),
            onSubmit: (sub) => hostApi.submit(sub),
            getDoubleDownArmed: () => renderer.getDoubleDownArmed(),
          });
          return handle ?? undefined;
        },
      },
      {
        onInteractionFeedback: (kind) => {
          if (kind === 'lock_in') this.audio.playBoardCue('lock_in');
          else if (kind === 'dial') this.audio.playBoardCue('wheel_tick');
          else if (kind === 'pair' || kind === 'reorder') this.audio.playBoardCue('switch_clack');
          else this.audio.playSfx('ui_tap');
        },
        onUse5050: () => {
          if (run.lifelines5050Left <= 0) return;
          run.lifelines5050Left -= 1;
          this.audio.playBoardCue('switch_clack');
          renderer.apply5050Elimination();
        },
        onUseHint: () => {
          if (run.lifelinesHintLeft <= 0) return;
          run.lifelinesHintLeft -= 1;
          this.audio.playBoardCue('switch_clack');
          renderer.revealHint(card.helpfulHint);
        },
        onDoubleDownToggle: (armed) => {
          this.audio.playBoardCue('switch_clack');
          if (armed) void this.audio.playRandomHostCategoryVoice('double_down');
        },
        onSubmit: async (submission) => {
          if (answered) return;
          answered = true;
          this.stopQuestionClock();

          const evaluated = qGen.evaluateSubmissionV4(card, submission, basePoints);
          run.answeredCount += 1;
          run.answerResults.push(evaluated.isCorrect);
          run.score = Math.max(0, run.score + evaluated.netPointsDelta);

          if (evaluated.isCorrect) {
            run.correctCount += 1;
            run.currentStreak += 1;
            run.bestStreak = Math.max(run.bestStreak, run.currentStreak);
            if (run.mode === 'ENDLESS') {
              const prevBest = Math.max(0, Number(readLocalPref(ENDLESS_BEST_KEY) || 0));
              if (run.bestStreak > prevBest) {
                writeLocalPref(ENDLESS_BEST_KEY, String(run.bestStreak));
              }
            }
            this.playStreakSfx(run.currentStreak);
            this.audio.playAudienceReaction(run.tierNumber, run.currentStreak >= 3 ? 'roar' : 'applause');
            this.haptics.correctBloom();
          } else {
            run.currentStreak = 0;
            if (run.mode === 'ENDLESS') {
              run.livesRemaining -= 1;
            }
            this.audio.playBoardCue('wrong_answer');
            this.haptics.wrongThud(Boolean(submission.doubleDownArmed));
          }

          void this.recordAnalyticsAndFeats({
            card,
            evaluated,
            submission,
            modeLabel: run.mode,
          });

          const hostQuip = wittyHost.pickBestTurnQuip(null, {
            won: evaluated.isCorrect,
            format: card.format,
            twist: 'NONE',
            elapsedSec: submission.elapsedSec,
            doubleDownArmed: submission.doubleDownArmed,
            isBullseyeOrSweep: evaluated.isBullseyeOrSweep,
            wasForcedSpotlight: false,
            escalatorCluesRevealed: submission.escalatorCluesRevealed,
            earnedWedge: false,
            currentStreak: run.currentStreak,
            domainId: card.domainId,
            domainName: card.categoryLabel,
          }).text;

          const isFinal =
            run.questionIndex + 1 >= run.totalQuestions ||
            (run.mode === 'ENDLESS' && run.livesRemaining <= 0);

          renderer.showReveal({
            evaluation: evaluated,
            hostQuip,
            hostSpeakerName: 'Max Sterling',
            funFactWhy: card.funFactWhy,
            hostPoseOverride: evaluated.isCorrect ? 'hype' : 'wince',
            nextButtonLabel: isFinal ? 'CURTAIN CALL SUMMARY' : 'NEXT SPOTLIGHT CLUE',
          });
        },
        onNext: () => {
          this.audio.playSfx('ui_tap');
          run.questionIndex += 1;
          void this.presentNextLinearQuestion();
        },
      },
    );

    this.startQuestionClock(renderer, card.recommendedSec, async () => {
      if (answered) return;
      renderer.submitExternalAnswer({
        format: card.format,
        timedOut: true,
        doubleDownArmed: renderer.getDoubleDownArmed(),
      });
    });
  }

  private renderLinearCurtainSummary(run: ActiveLinearRunSessionV5): void {
    this.teardownActiveViews();
    this.currentScreen = 'CURTAIN_SUMMARY';
    ensureLinearCurtainStyles();

    if (run.mode === 'AUDITION_WARMUP') {
      this.campaign.completeColdOpen();
    } else if (run.mode === 'DAILY') {
      writeLocalPref(`${DAILY_DONE_PREFIX}${getTodayUtcCode()}`, '1');
    }

    if (run.correctCount >= Math.max(1, Math.ceil(run.answeredCount * 0.6))) {
      this.vfx.fireConfettiOvation(3200);
      this.audio.playAudienceReaction(run.tierNumber, 'roar');
    }

    const accPct =
      run.answeredCount > 0 ? Math.round((run.correctCount / run.answeredCount) * 100) : 0;

    const pipsHtml = run.answerResults
      .slice(0, 20)
      .map(
        (hit, i) =>
          `<span class="v5-curtain-pip ${hit ? 'is-hit' : 'is-miss'}" title="Clue ${i + 1}">${
            hit ? 'OK' : 'X'
          }</span>`,
      )
      .join('');

    const subtitle =
      run.mode === 'AUDITION_WARMUP'
        ? 'Max Sterling & Producer Sam stamped your Oakridge stage pass — Act I of the World Championship Tour is now live!'
        : run.mode === 'DAILY'
          ? `Broadcast #${getDailyBroadcastNumber()} complete — share your clean studio scorecard or step back into the Green Room.`
          : run.mode === 'ENDLESS'
            ? `High-voltage survival run locked at a ${run.bestStreak}-clue streak!`
            : `Completed ${run.answeredCount} spotlight clues at ${accPct}% accuracy.`;

    const primaryLabel =
      run.mode === 'AUDITION_WARMUP'
        ? 'ENTER ACT I STAGE BOARD'
        : run.mode === 'DAILY'
          ? 'COPY DAILY SCORECARD'
          : 'PLAY AGAIN';

    this.uiRoot.innerHTML = `
      <section class="v5-curtain-shell" style="background-image:url('${V5_VENUE_STAGES[run.tierNumber]}')">
        <div class="v5-curtain-plaque" role="region" aria-label="Broadcast Curtain Call">
          <div class="v5-curtain-ribbon">${escapeHtml(run.venueLabel)}</div>
          <h1 class="v5-curtain-title">${escapeHtml(run.title)}</h1>
          <p class="v5-curtain-sub">${escapeHtml(subtitle)}</p>
          <div class="v5-curtain-dials">
            <div class="v5-curtain-dial">
              <span class="v5-curtain-dial-val">${run.score.toLocaleString('en-US')}</span>
              <span class="v5-curtain-dial-lbl">Stage Points</span>
            </div>
            <div class="v5-curtain-dial">
              <span class="v5-curtain-dial-val">${accPct}%</span>
              <span class="v5-curtain-dial-lbl">Accuracy (${run.correctCount}/${run.answeredCount})</span>
            </div>
            <div class="v5-curtain-dial">
              <span class="v5-curtain-dial-val">${run.bestStreak}</span>
              <span class="v5-curtain-dial-lbl">Best Streak</span>
            </div>
          </div>
          ${pipsHtml ? `<div class="v5-curtain-pips">${pipsHtml}</div>` : ''}
          <div class="v5-curtain-actions">
            <button type="button" class="v5-curtain-btn is-primary" data-curtain-act="primary">${escapeHtml(
              primaryLabel,
            )}</button>
            ${
              run.mode === 'CUSTOM_SHOW'
                ? '<button type="button" class="v5-curtain-btn" data-curtain-act="jukebox">TOPIC JUKEBOX</button>'
                : '<button type="button" class="v5-curtain-btn" data-curtain-act="trunk">OPEN TOUR TRUNK</button>'
            }
            <button type="button" class="v5-curtain-btn" data-curtain-act="home">GREEN ROOM</button>
          </div>
        </div>
      </section>
    `;

    const primaryBtn = this.uiRoot.querySelector<HTMLButtonElement>('[data-curtain-act="primary"]');
    primaryBtn?.addEventListener('click', () => {
      this.audio.playBoardCue('switch_clack');
      if (run.mode === 'AUDITION_WARMUP') {
        const firstNode = this.campaign.getRecommendedNextNode() ?? this.campaign.getAllNodes()[0];
        if (firstNode) void this.launchCampaignNode(firstNode.nodeId, false);
        else void this.showTourTrunkPinboard(1);
      } else if (run.mode === 'DAILY') {
        const shareGrid = run.answerResults.map((ok) => (ok ? '[OK]' : '[--]')).join('');
        const text = `WORLD'S SMARTEST Daily #${getDailyBroadcastNumber()} · ${run.score} PTS (${run.correctCount}/${run.answeredCount}) ${shareGrid}`;
        void navigator.clipboard?.writeText?.(text).catch(() => {});
        if (primaryBtn) primaryBtn.textContent = 'SCORECARD COPIED!';
      } else if (run.mode === 'ENDLESS') {
        void this.startEndlessStreak();
      } else {
        void this.openTopicJukebox({ initialDomainId: run.domainId });
      }
    });

    this.uiRoot
      .querySelector<HTMLButtonElement>('[data-curtain-act="jukebox"]')
      ?.addEventListener('click', () => {
        this.audio.playSfx('ui_tap');
        void this.openTopicJukebox({ initialDomainId: run.domainId });
      });

    this.uiRoot
      .querySelector<HTMLButtonElement>('[data-curtain-act="trunk"]')
      ?.addEventListener('click', () => {
        this.audio.playBoardCue('polaroid_pin');
        void this.showTourTrunkPinboard();
      });

    this.uiRoot
      .querySelector<HTMLButtonElement>('[data-curtain-act="home"]')
      ?.addEventListener('click', () => {
        this.audio.playSfx('ui_tap');
        this.showGreenRoomHub();
      });
  }

  // ==========================================================================
  // 6. SURGICAL 2.0s READ-IN GRACE + SHOT CLOCK ENGINE
  // ==========================================================================

  private activeClockStartedMs = 0;
  private activeClockTotalSec = 30;
  private activeClockReadInSec = 2.0;

  private getRemainingClockSecSnapshot(card: QuestionCardV4, bonusSec = 0): number {
    if (this.timerMode === 'RELAXED_UNTIMED') return card.recommendedSec + bonusSec;
    const elapsed = Math.max(0, (performance.now() - this.activeClockStartedMs) / 1000);
    if (elapsed <= this.activeClockReadInSec) return this.activeClockTotalSec;
    return Math.max(0, this.activeClockTotalSec - (elapsed - this.activeClockReadInSec));
  }

  private startQuestionClock(
    renderer: SpotlightLozengeRendererV5,
    totalSecRaw: number,
    onTimeout: () => Promise<void>,
  ): void {
    this.stopQuestionClock();
    const totalSec = Math.max(10, totalSecRaw);
    this.activeClockTotalSec = totalSec;
    this.activeClockReadInSec = 2.0;
    this.activeClockStartedMs = performance.now();

    const effectiveMode = this.linearSession?.timerPace ?? this.timerMode;

    if (effectiveMode === 'RELAXED_UNTIMED') {
      renderer.updateClock({
        phase: 'RELAXED',
        remainingSec: totalSec,
        totalSec,
      });
      return;
    }

    renderer.updateClock({
      phase: 'READ_IN',
      remainingSec: totalSec,
      totalSec,
      readInRemainingSec: this.activeClockReadInSec,
    });

    this.clockIntervalId = window.setInterval(() => {
      if (this.disposed) {
        this.stopQuestionClock();
        return;
      }
      const elapsedSec = (performance.now() - this.activeClockStartedMs) / 1000;
      if (elapsedSec < this.activeClockReadInSec) {
        renderer.updateClock({
          phase: 'READ_IN',
          remainingSec: totalSec,
          totalSec,
          readInRemainingSec: Math.max(0, this.activeClockReadInSec - elapsedSec),
        });
        return;
      }

      const activeElapsed = elapsedSec - this.activeClockReadInSec;
      const remainingSec = Math.max(0, totalSec - activeElapsed);
      const wholeSec = Math.ceil(remainingSec);

      if (wholeSec <= 6 && wholeSec !== this.lastTickedWholeSec) {
        this.lastTickedWholeSec = wholeSec;
        this.audio.playCountdownTick(remainingSec);
      }

      if (remainingSec <= 0) {
        this.stopQuestionClock();
        this.audio.playCountdownTick(0);
        renderer.updateClock({
          phase: 'TIMEOUT',
          remainingSec: 0,
          totalSec,
        });
        void onTimeout();
        return;
      }

      renderer.updateClock({
        phase: 'ACTIVE',
        remainingSec,
        totalSec,
      });
    }, 90);
  }

  private stopQuestionClock(): void {
    if (this.clockIntervalId !== null) {
      window.clearInterval(this.clockIntervalId);
      this.clockIntervalId = null;
    }
    this.lastTickedWholeSec = null;
  }

  // ==========================================================================
  // 7. CAREER ANALYTICS, SRS, 100 TROPHIES & 5-SLOT BRASS DOSSIER SAVES
  // ==========================================================================

  private async recordAnalyticsAndFeats(params: {
    card: QuestionCardV4;
    evaluated: EvaluatedAnswerV4;
    submission: AnswerSubmissionV4;
    modeLabel: string;
    hubId?: string;
    powerPlayWager?: number;
    padlocksBroken?: number;
    survivedChallengerTrap?: boolean;
    awardedWedge?: WedgeColorId | null;
    totalBoardWedgesNow?: number;
  }): Promise<void> {
    try {
      const suite = await this.ensureMetaSuite();
      const { card, evaluated, submission } = params;
      const speedBucketIdx =
        submission.elapsedSec < 4
          ? 0
          : submission.elapsedSec < 8
            ? 1
            : submission.elapsedSec < 14
              ? 2
              : submission.elapsedSec < 22
                ? 3
                : 4;

      suite.recordQuestionOutcome({
        qid: card.qid,
        domainId: card.domainId,
        mode: params.modeLabel,
        hubId: params.hubId,
        questionFormat: card.format,
        difficultyTier: card.difficultyTier as AnalyticsDifficultyTier,
        subcatLabel: card.categoryLabel,
        speedBucketIdx,
        correct: evaluated.isCorrect,
        peelTier: submission.used5050 ? 3 : submission.usedHint ? 2 : 1,
        overclockCharge01: submission.doubleDownArmed ? 1 : 0,
        backfired: Boolean(submission.doubleDownArmed && !evaluated.isCorrect),
        bullseye: Boolean(card.format === 'PINPOINT_DIAL' && evaluated.isBullseyeOrSweep),
        isBullseyeOrSweep: evaluated.isBullseyeOrSweep,
        powerPlayWager: params.powerPlayWager,
        padlocksBroken: params.padlocksBroken,
        survivedChallengerTrap: params.survivedChallengerTrap,
        responseTimeMs: Math.round(submission.elapsedSec * 1000),
        pointsDelta: evaluated.netPointsDelta,
        promptSnippet: card.prompt.slice(0, 120),
        answerLabel: evaluated.correctSummaryLabel,
      });

      const fourChoices =
        card.choices ?? card.escalator?.choices ?? card.visualSpotter?.choices;
      const fourCorrectIdx =
        card.correctIndex ?? card.escalator?.correctIndex ?? card.visualSpotter?.correctIndex;

      if (fourChoices && typeof fourCorrectIdx === 'number') {
        const correctAnswer = fourChoices[fourCorrectIdx];
        const distractors = fourChoices.filter((_, idx) => idx !== fourCorrectIdx);
        suite.ingestSpacedRepetitionOutcome({
          qid: card.qid,
          domainId: card.domainId,
          subcatLabel: card.categoryLabel,
          prompt: card.prompt,
          correctAnswer,
          distractors,
          whyExplanation: card.funFactWhy,
          wasCorrect: evaluated.isCorrect,
        });
      }

      const featsToRecord: SpecialFeatKind[] = [];
      if (evaluated.isCorrect) {
        if (card.format === 'MATCH_4' && evaluated.isBullseyeOrSweep) {
          featsToRecord.push('MATCH4_CLEAN_SWEEP');
        }
        if (card.format === 'SORT_4' && evaluated.isBullseyeOrSweep) {
          featsToRecord.push('SORT4_PERFECT');
        }
        if (
          card.format === 'MULTI_STRIKE' &&
          card.multiStrike?.strikeMode === 'SPOT_THE_IMPOSTER'
        ) {
          featsToRecord.push('IMPOSTER_CAUGHT');
        }
        if (card.format === 'PINPOINT_DIAL' && evaluated.isBullseyeOrSweep) {
          featsToRecord.push('PINPOINT_BULLSEYE');
        }
        if (params.powerPlayWager && params.powerPlayWager > 0) {
          featsToRecord.push('POWER_PLAY_WIN');
          if (params.powerPlayWager >= 400) {
            featsToRecord.push('POWER_PLAY_HIGH_ROLLER');
          }
        }
        if (params.survivedChallengerTrap) {
          featsToRecord.push('CHALLENGER_TRAP_SURVIVED');
        }
      }
      if ((params.padlocksBroken ?? 0) > 0) {
        featsToRecord.push('PADLOCK_SHATTERED');
      }
      if (params.awardedWedge) {
        featsToRecord.push('WEDGE_EARNED');
      }
      if ((params.totalBoardWedgesNow ?? 0) >= 6) {
        featsToRecord.push('SIX_WEDGE_CROWN');
      }

      for (const feat of featsToRecord) {
        suite.recordSpecialFeat(feat);
      }
    } catch {
      // Never block live stage flow on analytics storage
    }
  }

  public async openCareerStats(): Promise<void> {
    const suite = await this.ensureMetaSuite();
    suite.openAnalytics('ALL_TIME');
  }

  public async openHallOfTrophies(): Promise<void> {
    const suite = await this.ensureMetaSuite();
    suite.openHonours('TROPHIES_64');
  }

  public async openSavesSheet(): Promise<void> {
    await this.ensureStoryReady();
    const [{ CampaignSaveSlotsModal: SavesModal }, suite] = await Promise.all([
      import('../ui/CampaignSaveSlotsModal'),
      this.ensureMetaSuite(),
    ]);

    if (!this.savesModalInstance) {
      this.savesModalInstance = new SavesModal(this.audio, this.haptics);
    }

    const buildSlotViews = (): CampaignSlotCardView[] => {
      const summaries = this.campaign.listSlotSummaries();
      const accPct = Math.round(suite.getPlayerStatProfileForHost().overallAccuracyPct);
      return summaries.map((s) => {
        const sponsorName = SPONSOR_CATALOG_V5[s.activeSponsor]?.name ?? 'Independent';
        return {
          slotId: s.slotId as CampaignSlotId,
          isEmpty: s.isEmpty,
          isActive: s.isActive,
          challengerName: s.contestantName,
          personaLabel: `${sponsorName} · ${formatBankrollUsd(s.bankrollUsd)}`,
          currentActOrCity: `Act ${s.currentAct} · ${s.currentVenueName}`,
          visasCleared: s.currentAct,
          relicsUnlocked: s.unlockedCharmsCount,
          missionsCompleted: s.wonNodesCount,
          totalMissions: s.totalNodesCount,
          completionPct: Math.min(100, Math.round((s.wonNodesCount / Math.max(1, s.totalNodesCount)) * 100)),
          completionLabel: `${s.wonNodesCount}/${s.totalNodesCount} Stages · ${s.totalStars} Stars`,
          failedAttemptsCount: s.lostNodesCount,
          accuracyPct: accPct,
          updatedAtLabel: s.updatedAtIso ?? 'Empty',
        };
      });
    };

    this.savesModalInstance.open({
      getSlots: buildSlotViews,
      onSwitchOrStartSlot: (slotId) => {
        this.campaign.setActiveSlotId(slotId as CampaignSlotIdV5);
        this.savesModalInstance?.close();
        this.showGreenRoomHub();
      },
      onExportSlot: (slotId) => {
        const json = this.campaign.exportSlotJson(slotId as CampaignSlotIdV5);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `worlds_smartest_v5_slot_${slotId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      onImportSlotJson: (slotId, rawJson) => {
        return this.campaign.importSlotJson(slotId as CampaignSlotIdV5, rawJson);
      },
      onResetSlotToStart: (slotId) => {
        this.campaign.resetSlot(slotId as CampaignSlotIdV5);
      },
      onDeleteSlot: (slotId) => {
        this.campaign.deleteSlot(slotId as CampaignSlotIdV5);
      },
      onClose: () => {
        this.showGreenRoomHub();
      },
    });
  }
}
