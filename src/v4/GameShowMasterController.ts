// ============================================================================
// WORLD'S SMARTEST v4.0 — Master Prime-Time Game-Show Integration Controller
// Unites:
//  • StageBackdropDirector (8 Escalating Broadcast Venues, 0 Spinning 3D Prism)
//  • GameShowStageUI & FormatQuestionStageRenderer (Giant Type, 7 Formats)
//  • BoardEngine, ChallengerAI & ScoringV4 (Gimmick Boards & 1:1 Honest Math)
//  • WorldTourCampaign & WittyHostBank (42 Viewers -> 1.4B Live + Max Sterling)
//  • QuestionGeneratorV4 (276 Witty Curated + Clean Gold/Jeopardy + 500k+ Shards)
//  • StudioAudioEngine & HapticsEngine (Default-ON Score, Streak Chords, Clock)
//  • Salvaged Modes: Single Topic/157 Subcategories, Daily Share, Endless,
//    5-Slot Saves, Career Stats & 5 Graphs, and 100 Trophies / 48 Unlockables!
// ============================================================================

import { HapticsEngine } from '../audio/HapticsEngine';
import { StudioAudioEngine, type SfxCueId } from '../audio/StudioAudioEngine';
import type { BriefingDifficultyPreset, DomainId } from '../forge/types';
import type { AnalyticsDifficultyTier, SpecialFeatKind } from '../meta/CareerAnalyticsStore';
import type { PracticeSliceRequest } from '../meta/CareerAnalyticsDashboardView';
import type { SrsReviewCard } from '../meta/SpacedRepetitionEngine';
import type { MetaProgressionSuite } from '../meta';
import type {
  BriefingCategoriesModal,
  BriefingModalOpenOptions,
  BriefingStartConfig,
} from '../ui/BriefingCategoriesModal';
import type {
  CampaignSaveSlotsModal,
  CampaignSlotCardView,
  CampaignSlotId,
} from '../ui/CampaignSaveSlotsModal';
import {
  ALL_QUESTION_FORMATS_V4,
  DOMAIN_TOPIC_SUBTITLE_V4,
  consumeBoardLifeline,
  createSeededRng,
  createStageBoard,
  getTileById,
  resolveTileResult,
  spinCurveballWheel,
  type DraftedColumnSpecV4,
} from './BoardEngine';
import {
  applyPlayerDraftPick,
  applyRivalDraftPick,
  buildCategoryDraftPool,
  finalizeDraftToBoardColumns,
  runChallengerTurn,
  type CategoryDraftStateV4,
} from './ChallengerAI';
import {
  FormatQuestionStageRenderer,
  type QuestionStageContext,
} from './FormatRenderers';
import {
  GameShowStageUI,
  type CategoryDraftItem,
  type WorldTourTierGroupModel,
} from './GameShowStageUI';
import {
  NON_BOARD_BASE_POINTS_V4,
  evaluateBoardOutcome,
  getPowerPlayWagerBounds,
  scoreAnswerV4,
  type WheelActiveEffectV4,
} from './ScoringV4';
import { StageBackdropDirector } from './StageBackdropDirector';
import {
  generatePostMatchHeadlines,
  pickBestTurnQuip,
  pickEpisodeIntroQuip,
  pickMatchWrapQuip,
  pickStatAwareQuip,
} from './WittyHostBank';
import {
  MAX_WORLD_TOUR_STARS,
  TOTAL_WORLD_TOUR_EPISODES,
  getAllEpisodes,
  getAllTiers,
  getChallengerById,
  getChallengerForEpisode,
  getEpisodeById,
  getEpisodesForTier,
  getNextEpisodeId,
  loadWorldTourData,
  worldTourProgressStore,
  type WorldTourSlotId,
} from './WorldTourCampaign';
import {
  domainToWedgeColor,
  type AnswerSubmissionV4,
  type BoardTileV4,
  type BriefingFormatModeV4,
  type ChallengerProfileV4,
  type ChallengerTurnActionV4,
  type EvaluatedAnswerV4,
  type PlayerStatProfileForHost,
  type QuestionCardV4,
  type QuestionFormatV4,
  type StageBoardStateV4,
  type TimerPaceModeV4,
  type WedgeColorId,
  type WorldTourEpisodeV4,
} from './contracts';

const FORMAT_PREF_KEY = 'ws_briefing_format_mode_v4';
const TIMER_PREF_KEY = 'ws_briefing_timer_pace_v4';
const ENDLESS_BEST_KEY = 'ws_v4_endless_best_streak';
const DAILY_DONE_PREFIX = 'ws_v4_daily_done_';
const EQUIPPED_TITLE_KEY = 'ws_equipped_broadcast_title_v2';

type QuestionGenModule = typeof import('./QuestionGeneratorV4');

interface ActiveBoardMatchSession {
  episode: WorldTourEpisodeV4;
  challenger: ChallengerProfileV4 | null;
  board: StageBoardStateV4;
  rng: () => number;
  currentStreak: number;
  bestStreak: number;
  questionsAnswered: number;
  questionsCorrect: number;
  hostLine: string;
  newlyUnlockedTileIds: readonly string[];
  lastChallengerAction: ChallengerTurnActionV4 | null;
  pendingWheelEffect: WheelActiveEffectV4;
  consecutiveDomainId: DomainId | null;
  consecutiveDomainCount: number;
  // Feat counters for dynamic headlines
  buzzerBeatersCount: number;
  instantSnipesCount: number;
  match4SweepsCount: number;
  sort4PerfectsCount: number;
  pinpointBullseyesCount: number;
  clue1SnipesCount: number;
  powerPlaysWon: number;
  doubleDownsWon: number;
  doubleDownsBlown: number;
  weakDomainUpsets: number;
  trailedAtAnyPoint: boolean;
}

interface ActiveLinearRunSession {
  mode: 'SINGLE_TOPIC' | 'DAILY' | 'ENDLESS' | 'SRS_REVIEW';
  title: string;
  venueLabel: string;
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
  fixedFormatFilter?: QuestionFormatV4 | null;
  seedBase: number;
  seenQids: Set<number>;
  srsQueue?: readonly SrsReviewCard[];
}

function readLocalPref(key: string): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function writeLocalPref(key: string, val: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
    }
  } catch {
    // Ignore private-mode storage restrictions
  }
}

function getTodayUtcCode(): number {
  const now = new Date();
  return (
    now.getUTCFullYear() * 10000 +
    (now.getUTCMonth() + 1) * 100 +
    now.getUTCDate()
  );
}

function getDailyBroadcastNumber(): number {
  const epochMs = Date.UTC(2026, 0, 1);
  const diffDays = Math.max(1, Math.floor((Date.now() - epochMs) / 86_400_000) + 1);
  return diffDays;
}

function mapDifficultyPresetToTier(
  preset: BriefingDifficultyPreset,
  streak = 0,
): QuestionCardV4['difficultyTier'] {
  switch (preset) {
    case 'MIDDLE_SCHOOL':
    case 'EASY':
      return 'MIDDLE_SCHOOL';
    case 'HIGH_SCHOOL':
      return 'HIGH_SCHOOL';
    case 'COLLEGE':
    case 'MEDIUM':
      return 'COLLEGE';
    case 'GRADUATE':
    case 'HARD':
      return 'GRADUATE';
    case 'MENSA':
    case 'GENIUS':
      return 'MENSA';
    case 'PROGRESSIVE':
    case 'ADAPTIVE':
    default: {
      if (streak >= 16) return 'MENSA';
      if (streak >= 11) return 'GRADUATE';
      if (streak >= 6) return 'COLLEGE';
      if (streak >= 3) return 'HIGH_SCHOOL';
      return 'MIDDLE_SCHOOL';
    }
  }
}

export class GameShowMasterController {
  private readonly backdrop: StageBackdropDirector;
  private readonly ui: GameShowStageUI;
  private readonly audio: StudioAudioEngine;
  private readonly haptics: HapticsEngine;

  private activeRenderer: FormatQuestionStageRenderer | null = null;
  private clockIntervalId: number | null = null;
  private lastTickedWholeSec: number | null = null;

  private boardSession: ActiveBoardMatchSession | null = null;
  private linearSession: ActiveLinearRunSession | null = null;
  private seenQidsSession = new Set<number>();

  private formatMode: BriefingFormatModeV4;
  private timerMode: TimerPaceModeV4;
  private currentMusicCue: 'title' | 'board' | 'thinking' | 'finale' = 'title';

  // Lazy-loaded heavy modules (keeps initial JS bundle < 200 kB!)
  private qGenPromise: Promise<QuestionGenModule> | null = null;
  private metaSuitePromise: Promise<MetaProgressionSuite> | null = null;
  private metaSuiteInstance: MetaProgressionSuite | null = null;
  private briefingModalInstance: BriefingCategoriesModal | null = null;
  private savesModalInstance: CampaignSaveSlotsModal | null = null;

  private readonly boundFirstGesture = (): void => {
    if (this.audio.isMusicEnabled()) {
      this.audio.setMusicCue(this.currentMusicCue);
    }
  };

  constructor(
    canvasRoot: HTMLElement,
    vfxCanvas: HTMLCanvasElement,
    uiRoot: HTMLElement,
  ) {
    // Hide legacy v3 VFX overlay canvas so nothing intercepts layout or layers
    vfxCanvas.style.display = 'none';

    this.audio = new StudioAudioEngine();
    this.haptics = new HapticsEngine();
    this.backdrop = new StageBackdropDirector(canvasRoot);
    this.ui = new GameShowStageUI(uiRoot);

    this.formatMode =
      readLocalPref(FORMAT_PREF_KEY) === 'CLASSIC_4_ONLY'
        ? 'CLASSIC_4_ONLY'
        : 'VARIETY_MIX';
    this.timerMode =
      readLocalPref(TIMER_PREF_KEY) === 'RELAXED_UNTIMED'
        ? 'RELAXED_UNTIMED'
        : 'STANDARD';

    window.addEventListener('pointerdown', this.boundFirstGesture, {
      once: true,
      passive: true,
    });
    window.addEventListener('keydown', this.boundFirstGesture, {
      once: true,
      passive: true,
    });

    // Hydrate full 32-episode & 342-quip JSON non-blockingly and refresh Home Hub if idle
    void loadWorldTourData().then(() => {
      if (!this.boardSession && !this.linearSession && !this.activeRenderer) {
        this.showHomeHub();
      }
    });

    // Prewarm QuestionGenerator & MetaSuite on idle right after first paint
    window.setTimeout(() => {
      void this.ensureQuestionGenerator();
      void this.ensureMetaSuite();
    }, 80);

    this.showHomeHub();
    this.checkUrlAutoLaunch();
  }

  public dispose(): void {
    this.stopQuestionClock();
    this.activeRenderer?.dispose();
    this.ui.dispose();
    this.backdrop.dispose();
    this.metaSuiteInstance?.dispose();
    this.audio.dispose();
    window.removeEventListener('pointerdown', this.boundFirstGesture);
    window.removeEventListener('keydown', this.boundFirstGesture);
  }

  // ==========================================================================
  // LAZY MODULE LOADERS
  // ==========================================================================

  private ensureQuestionGenerator(): Promise<QuestionGenModule> {
    if (!this.qGenPromise) {
      this.qGenPromise = import('./QuestionGeneratorV4');
    }
    return this.qGenPromise;
  }

  private async ensureMetaSuite(): Promise<MetaProgressionSuite> {
    if (this.metaSuiteInstance) return this.metaSuiteInstance;
    if (!this.metaSuitePromise) {
      this.metaSuitePromise = (async () => {
        const [{ MetaProgressionSuite }, { PassportSystem }, { InkBlackboard }] =
          await Promise.all([
            import('../meta'),
            import('../narrative/PassportSystem'),
            import('../narrative/InkBlackboard'),
          ]);
        const passport = new PassportSystem();
        const blackboard = new InkBlackboard();
        const suite = new MetaProgressionSuite(
          {
            passport,
            blackboard,
            audio: this.audio,
            haptics: this.haptics,
          },
          {
            onRenameChallenger: (newName) => {
              worldTourProgressStore.setContestantName(newName);
              if (!this.boardSession && !this.linearSession) {
                this.showHomeHub();
              }
            },
            onEquipBroadcastTitle: () => {
              if (!this.boardSession && !this.linearSession) {
                this.showHomeHub();
              }
            },
            onPracticeSlice: (slice: PracticeSliceRequest) => {
              void this.launchPracticeSliceRun(slice);
            },
            onLaunchLivePrismReview: (cards: readonly SrsReviewCard[]) => {
              void this.launchSrsReviewRun(cards);
            },
            onCloseSuite: () => {
              if (!this.boardSession && !this.linearSession) {
                this.showHomeHub();
              }
            },
          },
        );
        this.metaSuiteInstance = suite;
        return suite;
      })();
    }
    return this.metaSuitePromise;
  }

  private async getPlayerStatProfile(): Promise<PlayerStatProfileForHost | null> {
    try {
      const suite = await this.ensureMetaSuite();
      return suite.getPlayerStatProfileForHost();
    } catch {
      return null;
    }
  }

  private checkUrlAutoLaunch(): void {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('daily') === '1' || params.has('duel')) {
        void this.startDailyChallenge();
      }
    } catch {
      // Ignore malformed URL query
    }
  }

  // ==========================================================================
  // AUDIO HELPERS
  // ==========================================================================

  private isMasterAudioOn(): boolean {
    return this.audio.isMusicEnabled() || this.audio.isSfxEnabled();
  }

  private toggleMasterAudio(): void {
    const next = !this.isMasterAudioOn();
    this.audio.setMusicEnabled(next);
    this.audio.setSfxEnabled(next);
    this.audio.setVoiceEnabled(next);
    if (next) {
      this.audio.playSfx('ui_tap');
      this.audio.setMusicCue(this.currentMusicCue);
    }
  }

  private switchMusicCue(cue: 'title' | 'board' | 'thinking' | 'finale'): void {
    this.currentMusicCue = cue;
    if (this.audio.isMusicEnabled()) {
      this.audio.setMusicCue(cue);
    }
  }

  private playStreakSfx(streak: number): void {
    const clamped = Math.max(1, Math.min(5, streak)) as 1 | 2 | 3 | 4 | 5;
    const cue = `streak_${clamped}` as SfxCueId;
    this.audio.playSfx(cue);
  }

  // ==========================================================================
  // 1. HOME STUDIO HUB & WORLD TOUR MAP
  // ==========================================================================

  private computeRankTitle(clearedCount: number, tierNum: number): string {
    const customTitle = readLocalPref(EQUIPPED_TITLE_KEY);
    if (customTitle && customTitle.trim() && customTitle !== 'MERIDIAN CANDIDATE') {
      return customTitle.trim();
    }
    if (clearedCount >= TOTAL_WORLD_TOUR_EPISODES) return "The World's Smartest Champion";
    switch (tierNum) {
      case 1:
        return 'Local Open Contender';
      case 2:
        return 'City Stage Finalist';
      case 3:
        return 'Regional TV Contender';
      case 4:
        return 'National Prime-Time Star';
      case 5:
        return 'International Open Seed';
      case 6:
        return 'World Quarterfinalist';
      case 7:
        return 'World Semifinalist';
      case 8:
      default:
        return 'World Finale Challenger';
    }
  }

  public showHomeHub(): void {
    this.stopQuestionClock();
    this.activeRenderer?.dispose();
    this.activeRenderer = null;
    this.boardSession = null;
    this.linearSession = null;

    this.backdrop.setTheme('HOME_STUDIO');
    this.backdrop.setIntensity('calm');
    this.switchMusicCue('title');

    const snap = worldTourProgressStore.getSnapshot();
    const nextEp = worldTourProgressStore.getNextPlayableEpisode();
    const challenger = getChallengerForEpisode(nextEp);
    const clearedCount = Object.values(snap.episodeRecords).filter((r) => r.cleared).length;
    const todayCode = getTodayUtcCode();
    const dailyCompleted = readLocalPref(`${DAILY_DONE_PREFIX}${todayCode}`) === '1';
    const endlessBest = Math.max(0, Number(readLocalPref(ENDLESS_BEST_KEY) || 0));
    const latestHeadline = snap.headlineFeed[0]?.headline;

    this.ui.renderHomeHub(
      {
        currentEpisode: nextEp,
        currentChallenger: challenger,
        audienceWatching: snap.currentWorldAudience,
        careerEarningsUsd: snap.totalCareerPrizeUsd,
        playerRankTitle: this.computeRankTitle(clearedCount, nextEp.tierNumber),
        completedEpisodesCount: clearedCount,
        totalEpisodesCount: TOTAL_WORLD_TOUR_EPISODES,
        dailyBroadcastLabel: `Broadcast #${getDailyBroadcastNumber()}`,
        dailyCompletedToday: dailyCompleted,
        endlessBestStreak: endlessBest,
        audioEnabled: this.isMasterAudioOn(),
        formatMode: this.formatMode,
        timerMode: this.timerMode,
        latestHeadline,
      },
      {
        onPlayWorldTour: () => {
          this.audio.playSfx('ui_tap');
          void this.launchWorldTourEpisode(nextEp.episodeId);
        },
        onOpenWorldTourMap: () => {
          this.audio.playSfx('ui_tap');
          this.showWorldTourMap();
        },
        onPlaySingleTopic: () => {
          this.audio.playSfx('ui_tap');
          void this.openSingleTopicModal();
        },
        onPlayDailyChallenge: () => {
          this.audio.playSfx('ui_tap');
          void this.startDailyChallenge();
        },
        onPlayEndlessStreak: () => {
          this.audio.playSfx('ui_tap');
          void this.startEndlessRun();
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
          this.toggleMasterAudio();
          this.showHomeHub();
        },
        onOpenHowToPlay: () => {
          this.audio.playSfx('ui_tap');
          this.ui.renderHowToPlayModal(() => {});
        },
        onChangeFormatMode: (mode) => {
          this.audio.playSfx('ui_tap');
          this.formatMode = mode;
          writeLocalPref(FORMAT_PREF_KEY, mode);
        },
        onChangeTimerMode: (mode) => {
          this.audio.playSfx('ui_tap');
          this.timerMode = mode;
          writeLocalPref(TIMER_PREF_KEY, mode);
        },
      },
    );
  }

  public showWorldTourMap(): void {
    this.stopQuestionClock();
    this.activeRenderer?.dispose();
    this.activeRenderer = null;
    this.boardSession = null;
    this.linearSession = null;

    this.backdrop.setTheme('HOME_STUDIO');
    this.backdrop.setIntensity('calm');
    this.switchMusicCue('title');

    const snap = worldTourProgressStore.getSnapshot();
    const nextEp = worldTourProgressStore.getNextPlayableEpisode();
    const allTiers = getAllTiers();
    let totalStars = 0;
    for (const rec of Object.values(snap.episodeRecords)) {
      totalStars += rec.stars;
    }

    const tierGroups: WorldTourTierGroupModel[] = allTiers.map((tierMeta) => {
      const challenger =
        getChallengerById(tierMeta.challengerId) ?? {
          id: tierMeta.challengerId,
          name: 'Stage Challenger',
          title: tierMeta.name,
          hometown: tierMeta.location,
          avatarPortraitUrl: './assets/portraits_cutout/vance.png',
          accentHex: '#f5c451',
          strongDomains: [0, 1],
          weakDomains: [4, 5],
          baseAccuracy: 0.5,
          signatureGimmick: 'CLAIM_TILE',
          introLines: ['Welcome to the stage!', 'Show us what you know.'],
          onForceCategoryLines: ['Try this category!'],
          onFreezeColumnLines: ['That column is on ice!'],
          onPlayerBigPlayLines: ['Nice shot!'],
          onPlayerMissLines: ['Tough break!'],
          winMatchLine: 'Better luck next broadcast!',
          loseMatchLine: 'Well played — the stage is yours!',
        };
      const eps = getEpisodesForTier(tierMeta.tierNumber).map((episode) => {
        const unlocked = worldTourProgressStore.isEpisodeUnlocked(episode.episodeId);
        const rec = snap.episodeRecords[episode.episodeId];
        return {
          episode,
          unlocked,
          stars: (rec?.stars ?? 0) as 0 | 1 | 2 | 3,
          isCurrentNext: episode.episodeId === nextEp.episodeId,
        };
      });

      return {
        tierNumber: tierMeta.tierNumber,
        tierTitle: tierMeta.name,
        venueName: tierMeta.venueName,
        accentHex: challenger.accentHex,
        audienceRangeLabel: tierMeta.audienceRangeLabel,
        topPurseUsd: tierMeta.topPurseUsd,
        twistSummary: tierMeta.unlockFeatureLabel,
        challenger,
        episodes: eps,
      };
    });

    this.ui.renderWorldTourMap(
      {
        tiers: tierGroups,
        audienceWatching: snap.currentWorldAudience,
        careerEarningsUsd: snap.totalCareerPrizeUsd,
        totalStarsEarned: totalStars,
        maxStars: MAX_WORLD_TOUR_STARS,
      },
      {
        onBackHome: () => {
          this.audio.playSfx('ui_tap');
          this.showHomeHub();
        },
        onSelectEpisode: (episodeId) => {
          this.audio.playSfx('ui_tap');
          void this.launchWorldTourEpisode(episodeId);
        },
      },
    );
  }

  // ==========================================================================
  // 2. WORLD TOUR STAGE BOARD LIFECYCLE (GIMMICK BOARDS & CHALLENGER AI)
  // ==========================================================================

  public async launchWorldTourEpisode(episodeId: string): Promise<void> {
    await loadWorldTourData();
    const episode = getEpisodeById(episodeId) ?? getAllEpisodes()[0];
    const challenger = getChallengerForEpisode(episode);

    this.backdrop.setTheme(episode.themeId);
    this.backdrop.setIntensity('board');
    this.switchMusicCue(episode.tierNumber >= 7 ? 'finale' : 'board');

    if (episode.hasCategoryDraft && challenger) {
      const playerStats = await this.getPlayerStatProfile();
      this.runPreBoardCategoryDraft(episode, challenger, playerStats);
      return;
    }

    this.initializeBoardSession(episode, challenger);
  }

  private runPreBoardCategoryDraft(
    episode: WorldTourEpisodeV4,
    challenger: ChallengerProfileV4,
    playerStats: PlayerStatProfileForHost | null,
  ): void {
    const rng = createSeededRng(`${episode.episodeId}_${Date.now()}`);
    let draftState: CategoryDraftStateV4 = buildCategoryDraftPool({
      targetColumns: episode.boardCols,
      rng,
    });

    const advanceRivalStepsIfNeeded = (): void => {
      let guard = 0;
      while (!draftState.isComplete && draftState.nextActor === 'RIVAL' && guard < 8) {
        draftState = applyRivalDraftPick(draftState, challenger, playerStats, rng);
        guard++;
      }
    };

    const renderDraft = (): void => {
      advanceRivalStepsIfNeeded();
      const actionVerb =
        draftState.nextAction === 'BAN'
          ? `BAN 1 category you want OFF the board (${draftState.playerBansRemaining} ban left)`
          : `PICK a category to lock ONTO the board (${draftState.playerPicksRemaining} left)`;
      const instruction = draftState.isComplete
        ? draftState.lastMove?.banterLine ?? 'Board lineup locked! Ready to take the stage.'
        : `${actionVerb}. ${draftState.lastMove ? `Last move: ${draftState.lastMove.banterLine}` : ''}`;

      const items: CategoryDraftItem[] = draftState.pool.map((entry) => ({
        colId: entry.entryId,
        wedgeId: entry.wedgeId,
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

      this.ui.renderCategoryDraftModal(
        {
          challenger,
          phaseTitle: `${episode.title} — Pick & Ban Draft`,
          instruction,
          pool: items,
          canConfirm: draftState.isComplete,
        },
        {
          onSelectDraftItem: (colId) => {
            if (draftState.isComplete) return;
            this.audio.playBoardCue('tile_flip');
            draftState = applyPlayerDraftPick(draftState, colId);
            renderDraft();
          },
          onConfirmDraft: () => {
            this.audio.playBoardCue('lock_in');
            const draftedCols = finalizeDraftToBoardColumns(draftState, rng);
            this.initializeBoardSession(episode, challenger, draftedCols);
          },
        },
      );
    };

    renderDraft();
  }

  private initializeBoardSession(
    episode: WorldTourEpisodeV4,
    challenger: ChallengerProfileV4 | null,
    draftedColumns?: readonly DraftedColumnSpecV4[],
  ): void {
    const rng = createSeededRng(`${episode.episodeId}_${Date.now()}`);
    const allowedFormats: readonly QuestionFormatV4[] =
      this.formatMode === 'CLASSIC_4_ONLY'
        ? ['MULTIPLE_CHOICE']
        : episode.allowedFormats;

    const board = createStageBoard({
      boardId: `board_${episode.episodeId}_${Date.now()}`,
      topology: episode.topology,
      cols: episode.boardCols,
      rows: episode.boardRows,
      maxTurns: episode.maxTurns,
      allowedFormats,
      draftedColumns,
      hasActiveRival: Boolean(challenger),
      soloTargetScore: episode.soloTargetScore,
      initialLifelines5050: 2,
      initialLifelinesHint: 2,
      rng,
    });

    const introQuip = pickEpisodeIntroQuip(episode.tierNumber, rng).text;
    const hostGreeting = challenger
      ? `${introQuip} Across the stage: ${challenger.name} — "${challenger.introLines[0]}"`
      : introQuip;

    this.boardSession = {
      episode,
      challenger,
      board,
      rng,
      currentStreak: 0,
      bestStreak: 0,
      questionsAnswered: 0,
      questionsCorrect: 0,
      hostLine: hostGreeting,
      newlyUnlockedTileIds: [],
      lastChallengerAction: null,
      pendingWheelEffect: 'NONE',
      consecutiveDomainId: null,
      consecutiveDomainCount: 0,
      buzzerBeatersCount: 0,
      instantSnipesCount: 0,
      match4SweepsCount: 0,
      sort4PerfectsCount: 0,
      pinpointBullseyesCount: 0,
      clue1SnipesCount: 0,
      powerPlaysWon: 0,
      doubleDownsWon: 0,
      doubleDownsBlown: 0,
      weakDomainUpsets: 0,
      trailedAtAnyPoint: false,
    };

    this.renderActiveBoard();
  }

  private renderActiveBoard(animateForcedSpotlight = false): void {
    const session = this.boardSession;
    if (!session) return;

    this.stopQuestionClock();
    this.activeRenderer?.dispose();
    this.activeRenderer = null;

    this.backdrop.setTheme(session.episode.themeId);
    this.backdrop.setIntensity('board');
    this.switchMusicCue(session.episode.tierNumber >= 7 ? 'finale' : 'board');

    const wheelLabel =
      session.pendingWheelEffect === 'DOUBLE_POT'
        ? '2X NEXT TILE'
        : session.pendingWheelEffect === 'HOT_SEAT_ALL_IN'
          ? 'ALL-IN 2X'
          : null;

    this.ui.renderStageBoard(
      {
        episode: session.episode,
        board: session.board,
        challenger: session.challenger,
        hostLine: session.hostLine,
        currentStreak: session.currentStreak,
        audioEnabled: this.isMasterAudioOn(),
        newlyUnlockedTileIds: session.newlyUnlockedTileIds,
        lastChallengerAction: session.lastChallengerAction,
        activeWheelBoostLabel: wheelLabel,
      },
      {
        onSelectTile: (tileId) => {
          void this.handleBoardTileClicked(tileId);
        },
        onBackToMap: () => {
          this.audio.playSfx('ui_tap');
          this.showWorldTourMap();
        },
        onToggleAudio: () => {
          this.toggleMasterAudio();
          this.renderActiveBoard(false);
        },
        onOpenHowToPlay: () => {
          this.audio.playSfx('ui_tap');
          this.ui.renderHowToPlayModal(() => {});
        },
      },
    );

    if (animateForcedSpotlight && session.board.forcedTileId) {
      this.backdrop.triggerLightingPulse('spotlight');
      void this.ui.animateSpotlightRoulette(session.board.forcedTileId, 1200);
    }
  }

  private async handleBoardTileClicked(tileId: string): Promise<void> {
    const session = this.boardSession;
    if (!session) return;
    const tile = getTileById(session.board, tileId);
    if (!tile || tile.status !== 'OPEN') return;
    if (session.board.forcedTileId && session.board.forcedTileId !== tile.tileId) {
      return;
    }

    this.audio.playBoardCue('tile_flip');
    this.haptics.spinTick();

    // Track consecutive picks in same domain for Max Sterling comfort-zone roast!
    if (!session.board.forcedTileId) {
      if (session.consecutiveDomainId === tile.domainId) {
        session.consecutiveDomainCount += 1;
      } else {
        session.consecutiveDomainId = tile.domainId;
        session.consecutiveDomainCount = 1;
      }
    }

    const col = session.board.columns[tile.colIndex];

    // Power Play (Daily Double) wager modal BEFORE seeing the clue!
    if (tile.twist === 'POWER_PLAY') {
      this.audio.playBoardCue('power_play');
      this.backdrop.triggerLightingPulse('power_play');
      const bounds = getPowerPlayWagerBounds(session.board.playerScore);
      this.ui.renderPowerPlayModal(
        {
          column: col,
          tile,
          playerScore: session.board.playerScore,
          minWager: bounds.minWager,
          maxWager: bounds.maxWager,
          hostLine: 'Power Play uncovered! Name your stakes before the clue hits the monitor.',
        },
        {
          onLockWager: (wagerPoints) => {
            this.audio.playBoardCue('lock_in');
            void this.openBoardTileQuestion(tile, wagerPoints);
          },
        },
      );
      return;
    }

    await this.openBoardTileQuestion(tile, null);
  }

  private async openBoardTileQuestion(
    tile: BoardTileV4,
    powerPlayWager: number | null,
  ): Promise<void> {
    const session = this.boardSession;
    if (!session) return;

    const qGen = await this.ensureQuestionGenerator();
    const col = session.board.columns[tile.colIndex];
    const effectiveFormat: QuestionFormatV4 =
      this.formatMode === 'CLASSIC_4_ONLY' ? 'MULTIPLE_CHOICE' : tile.format;

    const card = await qGen.drawQuestionCardV4({
      format: effectiveFormat,
      domainId: tile.domainId,
      subcategoryId: col?.subcategoryId,
      wedgeId: tile.wedgeId,
      difficultyTier: session.episode.difficultyTier,
      isLightningBlitz: tile.twist === 'LIGHTNING_BLITZ',
      excludeQids: this.seenQidsSession,
    });
    this.seenQidsSession.add(card.qid);

    const cardWithColumnHeader: QuestionCardV4 = col
      ? { ...card, wittyHeader: col.wittyTitle }
      : card;

    this.backdrop.setIntensity(
      powerPlayWager || session.pendingWheelEffect === 'HOT_SEAT_ALL_IN'
        ? 'tension'
        : 'question',
    );
    this.switchMusicCue(
      powerPlayWager || session.episode.tierNumber >= 7 ? 'finale' : 'thinking',
    );

    const mount = this.ui.getQuestionMountContainer();
    const renderer = new FormatQuestionStageRenderer(mount);
    this.activeRenderer = renderer;

    const doublePotMult =
      session.pendingWheelEffect === 'DOUBLE_POT' ||
      session.pendingWheelEffect === 'HOT_SEAT_ALL_IN'
        ? 2
        : 1;

    const wasForcedTurn = session.board.forcedTileId === tile.tileId;

    const ctx: QuestionStageContext = {
      card: cardWithColumnHeader,
      tilePointValue: tile.pointValue,
      timerMode: this.timerMode,
      lifelines5050Left: session.board.lifelines5050Left,
      lifelinesHintLeft: session.board.lifelinesHintLeft,
      currentStreak: session.currentStreak,
      activeWagerPoints: powerPlayWager ?? undefined,
      doublePotMultiplier: doublePotMult,
      isLightningBlitz: tile.twist === 'LIGHTNING_BLITZ',
      isCrownWedgeTile: tile.twist === 'CROWN_WEDGE',
      isRivalBountyTile: tile.twist === 'RIVAL_BOUNTY',
      venueLabel: session.episode.venueName,
      questionCounterLabel: `TURN ${Math.min(session.board.turnNumber + 1, session.board.maxTurns)} OF ${session.board.maxTurns}`,
    };

    renderer.mountQuestion(ctx, {
      onInteractionFeedback: (kind) => {
        if (kind === 'lock_in') {
          this.audio.playBoardCue('lock_in');
          this.backdrop.triggerLightingPulse('lock_in');
          this.haptics.lockThunk();
        } else {
          this.audio.playSfx('ui_tap');
        }
      },
      onUse5050: () => {
        const res = consumeBoardLifeline(session.board, '5050');
        if (res.consumed) {
          session.board = res.board;
          this.audio.playSfx('shutter_peel');
          renderer.apply5050Elimination();
        }
      },
      onUseHint: () => {
        const res = consumeBoardLifeline(session.board, 'HINT');
        if (res.consumed) {
          session.board = res.board;
          this.audio.playSfx('shutter_peel');
          renderer.revealHint(cardWithColumnHeader.helpfulHint);
        }
      },
      onDoubleDownToggle: (armed) => {
        this.audio.playBoardCue(armed ? 'power_play' : 'tile_flip');
      },
      onEscalatorDealClue: () => {
        this.audio.playBoardCue('tile_flip');
      },
      onSubmit: async (submission) => {
        await this.resolveBoardQuestionSubmission(
          tile,
          cardWithColumnHeader,
          submission,
          powerPlayWager,
          wasForcedTurn,
        );
      },
      onNext: () => {
        this.audio.playSfx('ui_tap');
        void this.advanceAfterBoardReveal();
      },
    });

    this.startQuestionClock(cardWithColumnHeader, renderer, async () => {
      await this.resolveBoardQuestionSubmission(
        tile,
        cardWithColumnHeader,
        {
          format: cardWithColumnHeader.format,
          timedOut: true,
          elapsedSec: cardWithColumnHeader.recommendedSec,
          doubleDownArmed: renderer.getDoubleDownArmed(),
        },
        powerPlayWager,
        wasForcedTurn,
      );
    });
  }

  private pendingPostRevealOutcome: ReturnType<typeof resolveTileResult> | null = null;

  private async resolveBoardQuestionSubmission(
    tile: BoardTileV4,
    card: QuestionCardV4,
    submission: AnswerSubmissionV4,
    powerPlayWager: number | null,
    wasForcedTurn: boolean,
  ): Promise<void> {
    const session = this.boardSession;
    const renderer = this.activeRenderer;
    if (!session || !renderer) return;

    this.stopQuestionClock();

    const qGen = await this.ensureQuestionGenerator();
    const rawEval = qGen.evaluateSubmissionV4(card, submission, tile.pointValue);
    const wheelEffectUsed = session.pendingWheelEffect;
    session.pendingWheelEffect = 'NONE';

    const resolved = resolveTileResult(session.board, tile.tileId, rawEval, {
      currentStreak: session.currentStreak,
      doubleDownArmed: Boolean(submission.doubleDownArmed),
      powerPlayWager,
      wheelEffect: wheelEffectUsed,
      allowNegative: false,
      evalResultIsFinalized: false,
      rng: session.rng,
    });

    session.board = resolved.board;
    session.newlyUnlockedTileIds = resolved.unlockedTileIds;
    session.currentStreak = resolved.newStreak;
    session.bestStreak = Math.max(session.bestStreak, resolved.newStreak);
    session.questionsAnswered += 1;
    if (resolved.evaluated.isCorrect) {
      session.questionsCorrect += 1;
    }
    if (session.board.hasActiveRival && session.board.playerScore < session.board.rivalScore) {
      session.trailedAtAnyPoint = true;
    }

    const secondsRemaining = Math.max(0, card.recommendedSec - submission.elapsedSec);
    if (resolved.evaluated.isCorrect) {
      if (this.timerMode === 'STANDARD' && secondsRemaining <= 2.5) {
        session.buzzerBeatersCount += 1;
      }
      if (submission.elapsedSec > 0 && submission.elapsedSec < 3.0) {
        session.instantSnipesCount += 1;
      }
      if (card.format === 'MATCH_4' && resolved.evaluated.isBullseyeOrSweep) {
        session.match4SweepsCount += 1;
      }
      if (card.format === 'SORT_4' && resolved.evaluated.isBullseyeOrSweep) {
        session.sort4PerfectsCount += 1;
      }
      if (card.format === 'PINPOINT_DIAL' && resolved.evaluated.isBullseyeOrSweep) {
        session.pinpointBullseyesCount += 1;
      }
      if (card.format === 'CLUE_ESCALATOR' && submission.escalatorCluesRevealed === 1) {
        session.clue1SnipesCount += 1;
      }
      if (powerPlayWager) {
        session.powerPlaysWon += 1;
      }
      if (submission.doubleDownArmed) {
        session.doubleDownsWon += 1;
      }
    } else if (submission.doubleDownArmed) {
      session.doubleDownsBlown += 1;
    }

    // Audio & Stage Lighting Celebration / Setback
    if (resolved.evaluated.isCorrect) {
      this.backdrop.setIntensity('celebration');
      this.backdrop.triggerLightingPulse(resolved.awardedWedge ? 'wedge' : 'win');
      this.playStreakSfx(Math.max(1, session.currentStreak));
      if (resolved.unlockedTileIds.length > 0) {
        this.audio.playBoardCue('padlock_break');
      }
      if (resolved.awardedWedge) {
        this.audio.playBoardCue('wedge_earned');
      }
      if (
        powerPlayWager ||
        submission.doubleDownArmed ||
        resolved.awardedWedge ||
        session.currentStreak >= 3
      ) {
        this.audio.playAudienceReaction(
          session.episode.tierNumber,
          session.episode.tierNumber >= 6 ? 'roar' : 'applause',
        );
      }
      this.haptics.goldResonance();
    } else {
      this.backdrop.triggerLightingPulse('miss');
      this.audio.playBoardCue('wrong_answer');
      if (powerPlayWager || submission.doubleDownArmed) {
        this.audio.playAudienceReaction(session.episode.tierNumber, 'gasp');
      }
      this.haptics.backfireFracture();
    }

    // Record Stats, SRS & 100 Trophies!
    const playerStatsBefore = await this.getPlayerStatProfile();
    if (
      resolved.evaluated.isCorrect &&
      playerStatsBefore?.weakestDomainId === card.domainId
    ) {
      session.weakDomainUpsets += 1;
    }

    await this.recordAnalyticsAndFeats({
      card,
      evaluated: resolved.evaluated,
      submission,
      modeLabel: 'CAMPAIGN',
      hubId: `tier_${session.episode.tierNumber}`,
      powerPlayWager: powerPlayWager ?? undefined,
      padlocksBroken: resolved.unlockedTileIds.length,
      survivedChallengerTrap: Boolean(wasForcedTurn && resolved.evaluated.isCorrect),
      awardedWedge: resolved.awardedWedge,
      totalBoardWedgesNow: session.board.earnedWedges.length,
    });

    // Pick Host Max Sterling's funniest stat-aware or situational line!
    const domainName = DOMAIN_TOPIC_SUBTITLE_V4[card.domainId];
    let hostQuip = pickBestTurnQuip(playerStatsBefore, {
      won: resolved.evaluated.isCorrect,
      format: card.format,
      twist: powerPlayWager ? 'POWER_PLAY' : tile.twist,
      elapsedSec: submission.elapsedSec,
      secondsRemaining: this.timerMode === 'STANDARD' ? secondsRemaining : undefined,
      doubleDownArmed: submission.doubleDownArmed,
      isBullseyeOrSweep: resolved.evaluated.isBullseyeOrSweep,
      wasForcedSpotlight: wasForcedTurn,
      escalatorCluesRevealed: submission.escalatorCluesRevealed,
      earnedWedge: Boolean(resolved.awardedWedge),
      currentStreak: session.currentStreak,
      domainId: card.domainId,
      domainName,
      rivalName: session.challenger?.name,
      rng: session.rng,
    }).text;

    if (
      resolved.evaluated.isCorrect &&
      !wasForcedTurn &&
      session.consecutiveDomainCount >= 3 &&
      playerStatsBefore
    ) {
      const campQuip = pickStatAwareQuip(playerStatsBefore, {
        action: 'PICK_TILE',
        domainId: card.domainId,
        domainName,
        consecutivePicksInDomain: session.consecutiveDomainCount,
        rng: session.rng,
      });
      if (campQuip) hostQuip = campQuip.text;
    }

    if (resolved.lineClearTriggered && resolved.lineClearRewards[0]) {
      hostQuip = `${resolved.lineClearRewards[0].banner} ${hostQuip}`;
    }

    session.hostLine = hostQuip;
    this.pendingPostRevealOutcome = resolved;

    // Ensure revealed points badge matches exact board delta 1:1
    const exactDisplayEval: EvaluatedAnswerV4 = {
      ...resolved.evaluated,
      netPointsDelta: resolved.playerScoreDelta,
    };

    renderer.showReveal({
      evaluation: exactDisplayEval,
      hostQuip,
      hostSpeakerName: 'Max Sterling',
      funFactWhy: card.funFactWhy,
      wedgeAwarded: resolved.awardedWedge,
      nextButtonLabel: session.board.isBoardComplete ? 'FINAL SCOREBOARD' : 'BACK TO BOARD',
    });
  }

  private async advanceAfterBoardReveal(): Promise<void> {
    const session = this.boardSession;
    const resolved = this.pendingPostRevealOutcome;
    this.pendingPostRevealOutcome = null;
    if (!session) return;

    // 1. If player hit a Show Wheel Curveball tile and answered right -> Spin the 6-Slice Wheel!
    if (resolved?.triggeredWheelCurveball && !session.board.isBoardComplete) {
      const spinRes = spinCurveballWheel(session.board, session.rng);
      this.renderActiveBoard(false);
      this.ui.renderCurveballWheelModal(
        {
          outcome: spinRes.outcome,
          outcomeHeadline: spinRes.sliceMeta.label,
          outcomeDescription: spinRes.banner,
        },
        {
          onSpinStart: () => {
            this.audio.playBoardCue('wheel_tick');
          },
          onSpinComplete: () => {
            session.board = spinRes.board;
            session.pendingWheelEffect = spinRes.nextTileEffect;
            session.hostLine = spinRes.banner;
            if (spinRes.unlockedTileIds.length > 0) {
              session.newlyUnlockedTileIds = spinRes.unlockedTileIds;
              this.audio.playBoardCue('padlock_break');
            }
            if (spinRes.awardedWedge) {
              this.audio.playBoardCue('wedge_earned');
            }
            void this.runPostWheelChallengerStepAndShowBoard();
          },
        },
      );
      return;
    }

    await this.runPostWheelChallengerStepAndShowBoard();
  }

  private async runPostWheelChallengerStepAndShowBoard(): Promise<void> {
    const session = this.boardSession;
    if (!session) return;

    if (session.board.isBoardComplete) {
      await this.finishBoardMatch();
      return;
    }

    // 2. Active Single-Player Challenger AI Turn!
    if (session.challenger && !session.board.forcedTileId) {
      const playerStats = await this.getPlayerStatProfile();
      const rivalTurn = runChallengerTurn(
        session.board,
        session.challenger,
        playerStats,
        session.rng,
      );
      session.board = rivalTurn.board;
      session.lastChallengerAction = rivalTurn.action;
      if (session.board.playerScore < session.board.rivalScore) {
        session.trailedAtAnyPoint = true;
      }
      if (rivalTurn.unlockedTileIds.length > 0) {
        session.newlyUnlockedTileIds = [
          ...session.newlyUnlockedTileIds,
          ...rivalTurn.unlockedTileIds,
        ];
      }

      if (session.board.isBoardComplete) {
        await this.finishBoardMatch();
        return;
      }

      // Show dramatic Challenger Interference modal when Rival forces a weak category, freezes a column, or plants a bounty!
      const isInterference =
        rivalTurn.action.moveKind === 'FORCE_WEAK_TILE' ||
        rivalTurn.action.moveKind === 'FREEZE_FAVORITE_COLUMN' ||
        rivalTurn.action.moveKind === 'PLANT_BOUNTY';

      session.hostLine = rivalTurn.action.banterLine;

      if (isInterference) {
        this.audio.playBoardCue('rival_trap');
        const targetCol =
          typeof rivalTurn.action.targetColIndex === 'number'
            ? session.board.columns[rivalTurn.action.targetColIndex]
            : undefined;
        this.renderActiveBoard(false);
        this.ui.renderChallengerTurnModal(
          {
            challenger: session.challenger,
            action: rivalTurn.action,
            targetColumnTitle: targetCol
              ? `${targetCol.wittyTitle} (${targetCol.topicSubtitle})`
              : undefined,
          },
          () => {
            this.renderActiveBoard(Boolean(session.board.forcedTileId));
          },
        );
        return;
      }
    }

    this.renderActiveBoard(Boolean(session.board.forcedTileId));
  }

  private async finishBoardMatch(): Promise<void> {
    const session = this.boardSession;
    if (!session) return;

    this.stopQuestionClock();
    this.activeRenderer?.dispose();
    this.activeRenderer = null;

    const outcome = evaluateBoardOutcome(session.board);
    const didWin = outcome.playerWon;
    const accuracyPct =
      session.questionsAnswered > 0
        ? Math.round((session.questionsCorrect / session.questionsAnswered) * 100)
        : 0;
    const playerStats = await this.getPlayerStatProfile();
    const snapBefore = worldTourProgressStore.getSnapshot();

    const clippings = generatePostMatchHeadlines({
      episodeId: session.episode.episodeId,
      contestantName: snapBefore.contestantName,
      won: didWin,
      playerScore: session.board.playerScore,
      rivalScore: session.board.hasActiveRival ? session.board.rivalScore : undefined,
      starsEarned: outcome.starsEarned,
      wedgesEarned: session.board.earnedWedges.length,
      buzzerBeatersCount: session.buzzerBeatersCount,
      instantSnipesCount: session.instantSnipesCount,
      match4SweepsCount: session.match4SweepsCount,
      sort4PerfectsCount: session.sort4PerfectsCount,
      pinpointBullseyesCount: session.pinpointBullseyesCount,
      clue1SnipesCount: session.clue1SnipesCount,
      powerPlaysWon: session.powerPlaysWon,
      doubleDownsWon: session.doubleDownsWon,
      doubleDownsBlown: session.doubleDownsBlown,
      weakDomainUpsets: session.weakDomainUpsets,
      weakDomainName: playerStats?.weakestDomainName ?? null,
      wasComebackWin: didWin && session.trailedAtAnyPoint,
      bestStreakInMatch: session.bestStreak,
      rng: session.rng,
    });

    const summary = worldTourProgressStore.recordEpisodeResult({
      episodeId: session.episode.episodeId,
      won: didWin,
      playerScore: session.board.playerScore,
      rivalScore: session.board.rivalScore,
      accuracyPct,
      wedgesEarned: session.board.earnedWedges.length,
      sweepsOrBullseyes:
        session.match4SweepsCount +
        session.sort4PerfectsCount +
        session.pinpointBullseyesCount,
      headlines: clippings,
    });

    // Audio & Meta celebration
    if (didWin) {
      this.backdrop.setIntensity('celebration');
      this.backdrop.triggerLightingPulse('win');
      this.playStreakSfx(5);
      this.audio.playAudienceReaction(
        session.episode.tierNumber,
        session.episode.tierNumber >= 5 ? 'roar' : 'applause',
      );
    } else {
      this.backdrop.triggerLightingPulse('miss');
      this.audio.playBoardCue('wrong_answer');
    }
    this.switchMusicCue('title');

    try {
      const suite = await this.ensureMetaSuite();
      suite.recordMatchCompleted({
        mode: 'CAMPAIGN',
        won: didWin,
        hubId: `tier_${session.episode.tierNumber}`,
        score: session.board.playerScore,
        correctCount: session.questionsCorrect,
        totalQuestions: session.questionsAnswered,
        earnedWedgesCount: session.board.earnedWedges.length,
        completedSixWedgeCrown: session.board.earnedWedges.length >= 6,
        worldTourTierCleared:
          didWin && session.episode.episodeInTier === 4
            ? session.episode.tierNumber
            : undefined,
        wonWorldSmartestFinale: Boolean(didWin && session.episode.episodeId === 't8_ep4'),
      });
      if (didWin && session.episode.episodeInTier === 4) {
        suite.recordSpecialFeat('WORLD_TOUR_TIER_CLEARED');
      }
      if (didWin && session.episode.episodeId === 't8_ep4') {
        suite.recordSpecialFeat('WORLD_SMARTEST_CHAMPION');
        suite.recordSpecialFeat('CAMPAIGN_COMPLETED');
      }
    } catch {
      // Non-blocking meta persistence
    }

    const hostWrap = pickMatchWrapQuip(didWin, session.rng).text;
    const rivalWrap = session.challenger
      ? didWin
        ? session.challenger.loseMatchLine
        : session.challenger.winMatchLine
      : undefined;
    const nextEpId = getNextEpisodeId(session.episode.episodeId);

    this.ui.renderPostRoundSummary(
      {
        episode: session.episode,
        didWin,
        starsEarned: summary.starsEarned,
        playerScore: session.board.playerScore,
        rivalScore: session.board.rivalScore,
        soloTargetScore: session.board.soloTargetScore,
        hasActiveRival: session.board.hasActiveRival,
        challenger: session.challenger,
        earnedWedges: session.board.earnedWedges,
        accuracyPct,
        bestStreak: session.bestStreak,
        audienceDelta: summary.viewerDelta,
        totalAudienceNow: summary.newWorldAudience,
        prizeEarnedUsd: summary.prizeDeltaUsd,
        headlines: clippings.map((c) => `[${c.outlet}] ${c.headline} — ${c.subline}`),
        hostClosingQuip: `${outcome.headlineSummary} ${hostWrap}`,
        rivalClosingLine: rivalWrap,
        hasNextEpisode: Boolean(nextEpId),
      },
      {
        onNextEpisode: nextEpId
          ? () => {
              this.audio.playSfx('ui_tap');
              void this.launchWorldTourEpisode(nextEpId);
            }
          : undefined,
        onRematch: () => {
          this.audio.playSfx('ui_tap');
          void this.launchWorldTourEpisode(session.episode.episodeId);
        },
        onOpenWorldTourMap: () => {
          this.audio.playSfx('ui_tap');
          this.showWorldTourMap();
        },
        onBackHome: () => {
          this.audio.playSfx('ui_tap');
          this.showHomeHub();
        },
      },
    );
  }

  // ==========================================================================
  // 3. SALVAGED MODES: SINGLE TOPIC/SUBCATEGORY, DAILY CHALLENGE, ENDLESS & SRS
  // ==========================================================================

  private async openSingleTopicModal(opts?: BriefingModalOpenOptions): Promise<void> {
    const [{ BriefingCategoriesModal }, { forgeEngine }] = await Promise.all([
      import('../ui/BriefingCategoriesModal'),
      import('../forge/ForgeEngine'),
    ]);
    if (!this.briefingModalInstance) {
      this.briefingModalInstance = new BriefingCategoriesModal(this.audio, this.haptics);
    }
    const counts = forgeEngine.getDomainCounts();
    this.briefingModalInstance.open(
      counts,
      (spec: BriefingStartConfig) => {
        this.formatMode = spec.formatMode;
        this.timerMode = spec.timerPace;
        void this.startSingleTopicRun(spec);
      },
      () => {},
      {
        initialFormatMode: this.formatMode,
        initialTimerPace: this.timerMode,
        forgeInstance: forgeEngine,
        ...opts,
      },
    );
  }

  private async startSingleTopicRun(spec: BriefingStartConfig): Promise<void> {
    const resolvedDomainId: DomainId | null =
      spec.l0DomainId ?? (spec.domains.length === 1 ? spec.domains[0] : null);
    const label =
      spec.selectionLabel ||
      (resolvedDomainId !== null
        ? DOMAIN_TOPIC_SUBTITLE_V4[resolvedDomainId]
        : 'All 12 Topics');

    this.linearSession = {
      mode: 'SINGLE_TOPIC',
      title: `Single Topic: ${label}`,
      venueLabel: 'Prime-Time Topic Showcase',
      totalQuestions: spec.count,
      questionIndex: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      livesRemaining: 999,
      lifelines5050Left: 2,
      lifelinesHintLeft: 2,
      earnedWedges: [],
      formatMode: spec.formatMode,
      timerPace: spec.timerPace,
      domainId: resolvedDomainId,
      subcategoryId: spec.l2TopicId ?? spec.l1SubcategoryId ?? null,
      difficultyPreset: spec.difficulty,
      seedBase: Date.now(),
      seenQids: new Set(this.seenQidsSession),
    };

    this.backdrop.setTheme('TIER4_NATIONAL_ARENA');
    this.backdrop.setIntensity('question');
    this.switchMusicCue('thinking');
    await this.presentNextLinearQuestion();
  }

  public async startDailyChallenge(): Promise<void> {
    const todayCode = getTodayUtcCode();
    const broadcastNum = getDailyBroadcastNumber();

    this.linearSession = {
      mode: 'DAILY',
      title: `Daily Global Broadcast #${broadcastNum}`,
      venueLabel: `UTC Daily Show · ${todayCode}`,
      totalQuestions: 7,
      questionIndex: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      livesRemaining: 999,
      lifelines5050Left: 2,
      lifelinesHintLeft: 2,
      earnedWedges: [],
      formatMode: 'VARIETY_MIX',
      timerPace: this.timerMode,
      domainId: null,
      subcategoryId: null,
      difficultyPreset: 'PROGRESSIVE',
      seedBase: todayCode * 97 + 13,
      seenQids: new Set(),
    };

    this.backdrop.setTheme('TIER6_TOKYO_SKYDOME');
    this.backdrop.setIntensity('question');
    this.switchMusicCue('thinking');
    await this.presentNextLinearQuestion();
  }

  public async startEndlessRun(): Promise<void> {
    this.linearSession = {
      mode: 'ENDLESS',
      title: 'Endless Streak Survival',
      venueLabel: '3 Strikes · Airlock Refill Every 5 Streak',
      totalQuestions: Number.POSITIVE_INFINITY,
      questionIndex: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      livesRemaining: 3,
      lifelines5050Left: 2,
      lifelinesHintLeft: 2,
      earnedWedges: [],
      formatMode: this.formatMode,
      timerPace: this.timerMode,
      domainId: null,
      subcategoryId: null,
      difficultyPreset: 'PROGRESSIVE',
      seedBase: Date.now(),
      seenQids: new Set(this.seenQidsSession),
    };

    this.backdrop.setTheme('TIER5_LONDON_ROTUNDA');
    this.backdrop.setIntensity('question');
    this.switchMusicCue('thinking');
    await this.presentNextLinearQuestion();
  }

  private async launchPracticeSliceRun(slice: PracticeSliceRequest): Promise<void> {
    const domId =
      typeof slice.domainId === 'number' && slice.domainId >= 0 && slice.domainId <= 11
        ? (slice.domainId as DomainId)
        : null;
    const label =
      slice.subcatLabel ||
      (domId !== null ? DOMAIN_TOPIC_SUBTITLE_V4[domId] : 'Targeted Practice Slice');

    this.linearSession = {
      mode: 'SINGLE_TOPIC',
      title: `Practice Slice: ${label}`,
      venueLabel: 'Career Radar Drill',
      totalQuestions: 7,
      questionIndex: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      livesRemaining: 999,
      lifelines5050Left: 2,
      lifelinesHintLeft: 2,
      earnedWedges: [],
      formatMode: slice.questionFormat ? 'VARIETY_MIX' : this.formatMode,
      timerPace: this.timerMode,
      domainId: domId,
      subcategoryId: slice.subcatLabel ?? null,
      difficultyPreset: 'ADAPTIVE',
      fixedFormatFilter: slice.questionFormat ?? null,
      seedBase: Date.now(),
      seenQids: new Set(this.seenQidsSession),
    };

    this.backdrop.setTheme('TIER3_REGIONAL_TV');
    this.backdrop.setIntensity('question');
    this.switchMusicCue('thinking');
    await this.presentNextLinearQuestion();
  }

  private async launchSrsReviewRun(cards: readonly SrsReviewCard[]): Promise<void> {
    if (!cards.length) {
      this.showHomeHub();
      return;
    }
    this.linearSession = {
      mode: 'SRS_REVIEW',
      title: 'Missed-Question Mastery Deck',
      venueLabel: 'Study Review Showdown',
      totalQuestions: Math.min(10, cards.length),
      questionIndex: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      correctCount: 0,
      answeredCount: 0,
      livesRemaining: 999,
      lifelines5050Left: 2,
      lifelinesHintLeft: 2,
      earnedWedges: [],
      formatMode: 'CLASSIC_4_ONLY',
      timerPace: 'RELAXED_UNTIMED',
      domainId: null,
      subcategoryId: null,
      difficultyPreset: 'ADAPTIVE',
      seedBase: Date.now(),
      seenQids: new Set(),
      srsQueue: cards.slice(0, 10),
    };

    this.backdrop.setTheme('TIER2_CIVIC_THEATER');
    this.backdrop.setIntensity('question');
    this.switchMusicCue('thinking');
    await this.presentNextLinearQuestion();
  }

  private convertSrsCardToV4(srs: SrsReviewCard): QuestionCardV4 {
    const domId = (Math.max(0, Math.min(11, srs.domainId || 0)) as DomainId);
    const rawChoices = [srs.correctAnswer, ...(srs.distractors ?? [])].slice(0, 4);
    while (rawChoices.length < 4) {
      rawChoices.push(`Option ${rawChoices.length + 1}`);
    }
    const shift = Math.abs(srs.qid) % 4;
    const rotated = [0, 1, 2, 3].map((i) => rawChoices[(i + shift) % 4]) as [
      string,
      string,
      string,
      string,
    ];
    const correctIdx = Math.max(0, rotated.indexOf(srs.correctAnswer)) as 0 | 1 | 2 | 3;

    return {
      qid: srs.qid,
      format: 'MULTIPLE_CHOICE',
      domainId: domId,
      wedgeId: domainToWedgeColor(domId),
      categoryLabel: srs.subcatLabel || DOMAIN_TOPIC_SUBTITLE_V4[domId],
      wittyHeader: 'Redemption Round',
      difficultyTier: 'COLLEGE',
      recommendedSec: 28,
      readInGraceSec: 2.0,
      prompt: srs.prompt,
      funFactWhy: srs.whyExplanation || `Correct answer: ${srs.correctAnswer}.`,
      helpfulHint: 'Review each option carefully and eliminate what you missed previously.',
      choices: rotated,
      correctIndex: correctIdx,
    };
  }

  private async presentNextLinearQuestion(): Promise<void> {
    const run = this.linearSession;
    if (!run) return;

    if (
      run.questionIndex >= run.totalQuestions ||
      (run.mode === 'ENDLESS' && run.livesRemaining <= 0)
    ) {
      await this.finishLinearRun();
      return;
    }

    const qGen = await this.ensureQuestionGenerator();
    let card: QuestionCardV4;

    if (run.mode === 'SRS_REVIEW' && run.srsQueue && run.srsQueue[run.questionIndex]) {
      card = this.convertSrsCardToV4(run.srsQueue[run.questionIndex]);
    } else {
      const targetFormat: QuestionFormatV4 =
        run.fixedFormatFilter ??
        (run.formatMode === 'CLASSIC_4_ONLY'
          ? 'MULTIPLE_CHOICE'
          : ALL_QUESTION_FORMATS_V4[
              (run.questionIndex + (run.mode === 'DAILY' ? 0 : run.seedBase % 7)) %
                ALL_QUESTION_FORMATS_V4.length
            ]);

      const domId: DomainId =
        run.domainId !== null
          ? run.domainId
          : (((run.seedBase + run.questionIndex * 5) % 12) as DomainId);

      const diffTier = mapDifficultyPresetToTier(
        run.difficultyPreset,
        run.mode === 'DAILY' ? run.questionIndex * 2 : run.currentStreak,
      );

      card = await qGen.drawQuestionCardV4({
        format: targetFormat,
        domainId: domId,
        subcategoryId: run.subcategoryId ?? undefined,
        difficultyTier: diffTier,
        excludeQids: run.seenQids,
        seed: run.seedBase + run.questionIndex * 101,
      });
    }

    run.seenQids.add(card.qid);
    if (run.mode !== 'DAILY') {
      this.seenQidsSession.add(card.qid);
    }

    const mount = this.ui.getQuestionMountContainer();
    const renderer = new FormatQuestionStageRenderer(mount);
    this.activeRenderer = renderer;

    const counterLabel =
      run.mode === 'ENDLESS'
        ? `Q${run.questionIndex + 1} · ${run.livesRemaining} LIVES LEFT`
        : `Q${run.questionIndex + 1} OF ${run.totalQuestions}`;

    const basePts =
      run.mode === 'DAILY'
        ? (([100, 200, 200, 400, 400, 800, 800] as const)[run.questionIndex] ?? 200)
        : NON_BOARD_BASE_POINTS_V4;

    renderer.mountQuestion(
      {
        card,
        tilePointValue: basePts,
        timerMode: run.timerPace,
        lifelines5050Left: run.lifelines5050Left,
        lifelinesHintLeft: run.lifelinesHintLeft,
        currentStreak: run.currentStreak,
        venueLabel: run.title,
        questionCounterLabel: counterLabel,
      },
      {
        onInteractionFeedback: (kind) => {
          if (kind === 'lock_in') {
            this.audio.playBoardCue('lock_in');
            this.backdrop.triggerLightingPulse('lock_in');
          } else {
            this.audio.playSfx('ui_tap');
          }
        },
        onUse5050: () => {
          if (run.lifelines5050Left > 0) {
            run.lifelines5050Left -= 1;
            this.audio.playSfx('shutter_peel');
            renderer.apply5050Elimination();
          }
        },
        onUseHint: () => {
          if (run.lifelinesHintLeft > 0) {
            run.lifelinesHintLeft -= 1;
            this.audio.playSfx('shutter_peel');
            renderer.revealHint(card.helpfulHint);
          }
        },
        onDoubleDownToggle: (armed) => {
          this.audio.playBoardCue(armed ? 'power_play' : 'tile_flip');
        },
        onEscalatorDealClue: () => {
          this.audio.playBoardCue('tile_flip');
        },
        onSubmit: async (sub) => {
          await this.resolveLinearQuestionSubmission(card, sub, basePts);
        },
        onNext: () => {
          this.audio.playSfx('ui_tap');
          run.questionIndex += 1;
          void this.presentNextLinearQuestion();
        },
      },
    );

    this.startQuestionClock(card, renderer, async () => {
      await this.resolveLinearQuestionSubmission(
        card,
        {
          format: card.format,
          timedOut: true,
          elapsedSec: card.recommendedSec,
          doubleDownArmed: renderer.getDoubleDownArmed(),
        },
        basePts,
      );
    });
  }

  private async resolveLinearQuestionSubmission(
    card: QuestionCardV4,
    submission: AnswerSubmissionV4,
    basePts: number,
  ): Promise<void> {
    const run = this.linearSession;
    const renderer = this.activeRenderer;
    if (!run || !renderer) return;

    this.stopQuestionClock();
    const qGen = await this.ensureQuestionGenerator();
    const rawEval = qGen.evaluateSubmissionV4(card, submission, basePts);

    const scoreRes = scoreAnswerV4({
      isCorrect: rawEval.isCorrect,
      baseTilePoints:
        rawEval.isCorrect && rawEval.accuracyRatio > 0 && rawEval.accuracyRatio < 1
          ? rawEval.basePoints
          : basePts,
      currentPlayerScore: run.score,
      currentStreak: run.currentStreak,
      accuracyRatio: rawEval.accuracyRatio,
      isBullseyeOrSweep: rawEval.isBullseyeOrSweep,
      doubleDownArmed: submission.doubleDownArmed,
      correctSummaryLabel: rawEval.correctSummaryLabel,
      extraFormatBonusPoints: rawEval.bonusPoints,
    });

    run.score = scoreRes.newPlayerScore;
    run.currentStreak = scoreRes.newStreak;
    run.bestStreak = Math.max(run.bestStreak, scoreRes.newStreak);
    run.answeredCount += 1;

    let awardedWedge: WedgeColorId | null = null;
    if (rawEval.isCorrect) {
      run.correctCount += 1;
      if (!run.earnedWedges.includes(card.wedgeId)) {
        run.earnedWedges.push(card.wedgeId);
        awardedWedge = card.wedgeId;
      }
      // Endless Airlock Recharge every 5 consecutive hits!
      if (run.mode === 'ENDLESS' && run.currentStreak > 0 && run.currentStreak % 5 === 0) {
        run.lifelines5050Left = Math.min(4, run.lifelines5050Left + 1);
        run.lifelinesHintLeft = Math.min(4, run.lifelinesHintLeft + 1);
      }
      if (run.mode === 'ENDLESS') {
        const prevBest = Number(readLocalPref(ENDLESS_BEST_KEY) || 0);
        if (run.bestStreak > prevBest) {
          writeLocalPref(ENDLESS_BEST_KEY, String(run.bestStreak));
        }
      }
      this.backdrop.triggerLightingPulse('win');
      this.playStreakSfx(Math.max(1, run.currentStreak));
      if (run.currentStreak >= 3 || submission.doubleDownArmed) {
        this.audio.playAudienceReaction(4, 'applause');
      }
    } else {
      if (run.mode === 'ENDLESS') {
        run.livesRemaining = Math.max(0, run.livesRemaining - 1);
      }
      this.backdrop.triggerLightingPulse('miss');
      this.audio.playBoardCue('wrong_answer');
    }

    const playerStats = await this.getPlayerStatProfile();
    await this.recordAnalyticsAndFeats({
      card,
      evaluated: { ...rawEval, netPointsDelta: scoreRes.playerDelta },
      submission,
      modeLabel:
        run.mode === 'DAILY'
          ? 'DAILY'
          : run.mode === 'ENDLESS'
            ? 'ENDLESS'
            : run.mode === 'SRS_REVIEW'
              ? 'SRS_REVIEW'
              : 'BRIEFING',
      awardedWedge,
      totalBoardWedgesNow: run.earnedWedges.length,
    });

    const secondsRemaining = Math.max(0, card.recommendedSec - submission.elapsedSec);
    let quip = pickBestTurnQuip(playerStats, {
      won: rawEval.isCorrect,
      format: card.format,
      elapsedSec: submission.elapsedSec,
      secondsRemaining: run.timerPace === 'STANDARD' ? secondsRemaining : undefined,
      doubleDownArmed: submission.doubleDownArmed,
      isBullseyeOrSweep: rawEval.isBullseyeOrSweep,
      escalatorCluesRevealed: submission.escalatorCluesRevealed,
      currentStreak: run.currentStreak,
      domainId: card.domainId,
      domainName: DOMAIN_TOPIC_SUBTITLE_V4[card.domainId],
    }).text;

    if (
      run.mode === 'ENDLESS' &&
      rawEval.isCorrect &&
      run.currentStreak > 0 &&
      run.currentStreak % 5 === 0
    ) {
      quip = `AIRLOCK CHECKPOINT REACHED (${run.currentStreak} Streak)! +1 50/50 and +1 Clue recharged! ${quip}`;
    }

    const isRunOver =
      run.questionIndex + 1 >= run.totalQuestions ||
      (run.mode === 'ENDLESS' && run.livesRemaining <= 0);

    renderer.showReveal({
      evaluation: {
        ...rawEval,
        netPointsDelta: scoreRes.playerDelta,
        detailBreakdown: scoreRes.evaluated.detailBreakdown,
      },
      hostQuip: quip,
      hostSpeakerName: 'Max Sterling',
      funFactWhy: card.funFactWhy,
      wedgeAwarded: awardedWedge,
      nextButtonLabel: isRunOver ? 'SHOW SUMMARY' : 'NEXT QUESTION',
    });
  }

  private async finishLinearRun(): Promise<void> {
    const run = this.linearSession;
    if (!run) return;

    this.stopQuestionClock();
    this.activeRenderer?.dispose();
    this.activeRenderer = null;
    this.switchMusicCue('title');

    if (run.mode === 'DAILY') {
      writeLocalPref(`${DAILY_DONE_PREFIX}${getTodayUtcCode()}`, '1');
    }

    const accuracyPct =
      run.answeredCount > 0
        ? Math.round((run.correctCount / run.answeredCount) * 100)
        : 0;
    const targetBar =
      run.mode === 'ENDLESS'
        ? 1000
        : Math.round(run.answeredCount * NON_BOARD_BASE_POINTS_V4 * 0.5);
    const didWin = run.score >= targetBar || accuracyPct >= 60;

    try {
      const suite = await this.ensureMetaSuite();
      suite.recordMatchCompleted({
        mode:
          run.mode === 'DAILY'
            ? 'DAILY'
            : run.mode === 'ENDLESS'
              ? 'ENDLESS'
              : 'BRIEFING',
        won: didWin,
        score: run.score,
        correctCount: run.correctCount,
        totalQuestions: run.answeredCount,
        endlessDepthReached: run.mode === 'ENDLESS' ? run.answeredCount : undefined,
      });
      if (run.mode === 'SRS_REVIEW') {
        suite.recordSpecialFeat('SRS_REVIEW_COMPLETED');
      }
    } catch {
      // Ignore non-blocking analytics errors
    }

    const snap = worldTourProgressStore.getSnapshot();
    const syntheticEpisode: WorldTourEpisodeV4 = {
      episodeId: 'custom_show',
      tierNumber: run.mode === 'DAILY' ? 6 : 4,
      episodeInTier: 1,
      title: run.title,
      subtitle: run.venueLabel,
      venueName: run.venueLabel,
      themeId: 'TIER4_NATIONAL_ARENA',
      baseAudienceWatching: snap.currentWorldAudience,
      prizePurseUsd: 0,
      difficultyTier: 'COLLEGE',
      topology: 'OPEN_CLASSIC',
      boardCols: 4,
      boardRows: 3,
      maxTurns: run.answeredCount,
      allowedFormats: ALL_QUESTION_FORMATS_V4,
      challengerId: null,
      soloTargetScore: targetBar,
      rulesHookSummary: run.venueLabel,
    };

    const savedMode = run.mode;
    this.linearSession = null;

    this.ui.renderPostRoundSummary(
      {
        episode: syntheticEpisode,
        didWin,
        starsEarned: accuracyPct >= 85 ? 3 : accuracyPct >= 65 ? 2 : didWin ? 1 : 0,
        playerScore: run.score,
        rivalScore: 0,
        soloTargetScore: targetBar,
        hasActiveRival: false,
        challenger: null,
        earnedWedges: run.earnedWedges,
        accuracyPct,
        bestStreak: run.bestStreak,
        audienceDelta: 0,
        totalAudienceNow: snap.currentWorldAudience,
        prizeEarnedUsd: 0,
        headlines: [
          `[Broadcast Desk] ${run.correctCount}/${run.answeredCount} (${accuracyPct}%) in ${run.title} · Best Streak: ${run.bestStreak}!`,
        ],
        hostClosingQuip: pickMatchWrapQuip(didWin).text,
        hasNextEpisode: false,
      },
      {
        onRematch: () => {
          this.audio.playSfx('ui_tap');
          if (savedMode === 'DAILY') void this.startDailyChallenge();
          else if (savedMode === 'ENDLESS') void this.startEndlessRun();
          else void this.openSingleTopicModal();
        },
        onOpenWorldTourMap: () => {
          this.audio.playSfx('ui_tap');
          this.showWorldTourMap();
        },
        onBackHome: () => {
          this.audio.playSfx('ui_tap');
          this.showHomeHub();
        },
      },
    );
  }

  // ==========================================================================
  // 4. SURGICAL SHOT-CLOCK LOOP (2.0s READ-IN -> 25-35s CLOCK OR RELAXED)
  // ==========================================================================

  private startQuestionClock(
    card: QuestionCardV4,
    renderer: FormatQuestionStageRenderer,
    onTimeout: () => Promise<void>,
  ): void {
    this.stopQuestionClock();
    this.lastTickedWholeSec = null;

    if (this.timerMode === 'RELAXED_UNTIMED' || this.linearSession?.timerPace === 'RELAXED_UNTIMED') {
      renderer.updateClock({
        phase: 'RELAXED',
        remainingSec: card.recommendedSec,
        totalSec: card.recommendedSec,
      });
      return;
    }

    const readInMs = Math.max(0, card.readInGraceSec) * 1000;
    const totalSec = Math.max(10, card.recommendedSec);
    const startedAt = performance.now();

    this.clockIntervalId = window.setInterval(() => {
      const elapsedMs = performance.now() - startedAt;
      if (elapsedMs < readInMs) {
        renderer.updateClock({
          phase: 'READ_IN',
          remainingSec: totalSec,
          totalSec,
          readInRemainingSec: (readInMs - elapsedMs) / 1000,
        });
        return;
      }

      const activeSec = (elapsedMs - readInMs) / 1000;
      const remainingSec = Math.max(0, totalSec - activeSec);
      const wholeCeil = Math.ceil(remainingSec);

      if (wholeCeil <= 6 && wholeCeil >= 1 && this.lastTickedWholeSec !== wholeCeil) {
        this.lastTickedWholeSec = wholeCeil;
        this.audio.playCountdownTick(wholeCeil);
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
  // 5. ANALYTICS, SRS & 100-TROPHY RECORDING + META MODALS
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

      // Feed missed Classic / Escalator / Visual 4-choice cards into Spaced-Repetition Mastery Deck!
      const fourChoices =
        card.choices ??
        card.escalator?.choices ??
        card.visualSpotter?.choices;
      const fourCorrectIdx =
        card.correctIndex ??
        card.escalator?.correctIndex ??
        card.visualSpotter?.correctIndex;

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

      // Record v4 Special Feats for 100 Trophies!
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
      // Never block live gameplay on secondary analytics error
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
    const [{ CampaignSaveSlotsModal }, suite] = await Promise.all([
      import('../ui/CampaignSaveSlotsModal'),
      this.ensureMetaSuite(),
    ]);
    if (!this.savesModalInstance) {
      this.savesModalInstance = new CampaignSaveSlotsModal(this.audio, this.haptics);
    }

    const buildSlotViews = (): CampaignSlotCardView[] => {
      const summaries = worldTourProgressStore.listAllSlotSummaries();
      const accPct = Math.round(suite.getPlayerStatProfileForHost().overallAccuracyPct);

      return summaries.map((s) => ({
        slotId: s.slotId as CampaignSlotId,
        isEmpty: s.isEmpty,
        isActive: s.isActive,
        challengerName: s.contestantName,
        personaLabel: `Tier ${s.currentTierNumber} · $${s.totalCareerPrizeUsd.toLocaleString('en-US')}`,
        currentActOrCity: s.currentVenueName,
        visasCleared: Math.floor(s.clearedEpisodesCount / 4),
        relicsUnlocked: s.totalStars,
        missionsCompleted: s.clearedEpisodesCount,
        totalMissions: s.totalEpisodesCount,
        completionPct: Math.round((s.clearedEpisodesCount / s.totalEpisodesCount) * 100),
        completionLabel: `${s.clearedEpisodesCount}/${s.totalEpisodesCount} Episodes · ${s.totalStars} Stars`,
        accuracyPct: accPct,
        updatedAtLabel: s.updatedAtIso ?? 'Empty',
      }));
    };

    this.savesModalInstance.open({
      getSlots: buildSlotViews,
      onSwitchOrStartSlot: (slotId) => {
        worldTourProgressStore.setActiveSlot(slotId as WorldTourSlotId);
        this.savesModalInstance?.close();
        this.showHomeHub();
      },
      onExportSlot: (slotId) => {
        const snap = worldTourProgressStore.getSnapshot(slotId as WorldTourSlotId);
        const blob = new Blob([JSON.stringify(snap, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `worlds_smartest_slot_${slotId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      onImportSlotJson: (slotId, rawJson) => {
        try {
          const parsed = JSON.parse(rawJson);
          if (!parsed || typeof parsed !== 'object') {
            return { ok: false, message: 'Invalid JSON save file.' };
          }
          writeLocalPref(
            `ws_v4_world_tour_slot_${slotId}`,
            JSON.stringify({ ...parsed, slotId }),
          );
          worldTourProgressStore.setActiveSlot(slotId as WorldTourSlotId);
          return { ok: true, message: `Imported Slot ${slotId}!` };
        } catch {
          return { ok: false, message: 'Could not parse JSON.' };
        }
      },
      onResetSlotToStart: (slotId) => {
        worldTourProgressStore.resetSlot(slotId as WorldTourSlotId, true);
      },
      onDeleteSlot: (slotId) => {
        worldTourProgressStore.resetSlot(slotId as WorldTourSlotId, false);
      },
      onClose: () => {
        this.showHomeHub();
      },
    });
  }
}
