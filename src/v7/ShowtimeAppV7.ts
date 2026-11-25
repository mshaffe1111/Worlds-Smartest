// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// Master Showtime Orchestrator (`src/v7/ShowtimeAppV7.ts`)
// Wires 100% of Live Gameplay:
//  - WebGL2StageEngineV7 (10 Grounded Stages, 44°–49° Auto-Fit, 1.15 Bloom)
//  - InteractiveBoard3DControllerV7 (12 Kinetic +22° 3D Boards & 16 Live Twists)
//  - TactileContraptions14V7 (14 1-Gesture Contraptions, 4K Globe, 20 Cyanotypes)
//  - ShowbandAudioEngineV7 (12 Genre-Honest Scenes, 5 XAG Buses, ANSI VU Meter)
//  - CorpusManagerV7 (12-Gate Anti-Slop Clues, Bitset Ledger, 25-Match Cooldown)
//  - CampaignDirectorV7 & BroadcastChromeUIV7 (90 Episodes, 28 Relics, 36 Trophies)
// ============================================================================

import * as THREE from 'three';
import {
  ALL_CATEGORIES_V7,
  ALL_RIVAL_IDS_V7,
  type BoardIdV7,
  type BoardTwistIdV7,
  type BoardUnlockTopologyV7,
  type BroadcastActNumberV7,
  type BroadcastSettingsV7,
  type CampaignSaveStateV7,
  type CategoryIdV7,
  type ClueRecordV7,
  type CoupRegimeIdV7,
  type CpuPlaystyleIdV7,
  type CpuTemperamentIdV7,
  type DifficultyModeV7,
  type DifficultyTierV7,
  type DomainIdV7,
  type EpisodeBlueprintV7,
  CAREER_MEDAL_SPECS_V7,
  type CareerMedalIdV7,
  type NextEpisodeCliffhangerTeaserV7,
  type PortraitEmotionV7,
  type RivalIdV7,
  type StageWorldIdV7,
  type ToyIdV7,
  type ToyResolutionV7,
} from './contracts_v7';
import {
  ShowbandAudioEngineV7,
  type CheatTellChannelV7,
} from './audio/ShowbandAudioEngineV7';
import {
  BOARD_MODE_RULE_BANNERS_V7,
  BOARD_TWIST_SPECS_V7,
  BOARD_UNLOCK_TOPOLOGY_SPECS_V7,
  BoardTwistsEngineV7,
  DEFAULT_RIVAL_PLAYSTYLE_V7,
  DEFAULT_RIVAL_TEMPERAMENT_V7,
  drawCombinatorialBoardComboV7,
  evaluateCpuTurnOutcomeV7,
  type BoardPlayModeV7,
} from './boards/BoardTwistsEngineV7';
import {
  ALL_BOARD_IDS_V7,
  BOARD_SPECS_V7,
  InteractiveBoard3DControllerV7,
} from './boards/InteractiveBoards3DV7';
import {
  CAST_PROFILES_V7,
  RELIC_CATALOG_V7,
  TROPHY_CATALOG_V7,
  evaluatePreTurnRelicHooksV7,
  evaluateTurnEconomyV7,
  executeLiveScoreBurnBuyV7,
} from './campaign/CastAndRelicsCatalogV7';
import {
  CampaignDirectorV7,
  getNextEpisodeCliffhangerTeaserV7,
  type EpisodeOutcomeSummaryV7,
  type VipJuryBallotV7,
} from './campaign/FiftyMillionCampaignV7';
import {
  StudioAnnouncerControllerV7,
  getHostAnswerRevealLineV7,
  getHostLockInQuipV7,
  getHostQuestionIntroLineV7,
  type EmceeMoodV7,
} from './campaign/StudioAnnouncerV7';
import {
  classifyDailyTileOutcomeV7,
  getDailyBroadcastSaveV7,
  getDeterministicDailyTurnSeedV7,
  getTodayBroadcastBlueprintV7,
  recordDailyBroadcastCompletionV7,
  type DailyBroadcastBlueprintV7,
  type DailyTileHistoryTokenV7,
} from './campaign/DailyBroadcastV7';
import {
  CorpusManagerV7,
  getFriendlyCategoryLabelV7,
} from './corpus/CorpusManagerV7';
import { LitTrophyVaultRendererV7 } from './engine/LitTrophyVaultV7';
import { STAGE_WORLD_SPECS_V7 } from './engine/StageWorldsV7';
import { WebGL2StageEngineV7 } from './engine/WebGL2StageEngineV7';
import {
  ALL_TOY_IDS_V7,
  TOY_CONTRAPTION_META_V7,
  mountTactileContraptionV7,
  type MountedTactileContraptionV7,
  type TactileSfxEventV7,
} from './toys/TactileContraptions14V7';
import { BroadcastChromeUIV7 } from './ui/BroadcastChromeUIV7';
import {
  TitleAndOnboardingControllerV7,
  type QuickPlaySelectionV7,
} from './ui/TitleAndOnboardingV7';
import {
  TvTwistTheaterV7,
  type BigWheelSpinResultV7,
} from './ui/TvTwistTheaterV7';
import { StudioBroadcastVfxV7 } from './vfx/StudioBroadcastVfxV7';

const SHOWRUNNER_META_STORAGE_KEY_V7 = 'ws_v7_showrunner_meta_1';

interface ShowrunnerPersistedMetaV7 {
  scoutingNotebook: Record<
    string,
    {
      revealedStrong: CategoryIdV7[];
      revealedWeak: CategoryIdV7[];
      traitRevealed?: boolean;
    }
  >;
  returningChampStreak: number;
  recentBoardCombos: string[];
  careerMedalCounts?: Partial<Record<CareerMedalIdV7, number>>;
  masteredBoardModes?: BoardPlayModeV7[];
  masteredDifficulties?: DifficultyModeV7[];
  masteredModeDifficulties?: string[];
}

export type MatchPhaseV7 =
  | 'HUB'
  | 'BOARD_SELECT'
  | 'QUESTION_OPEN'
  | 'POST_ANSWER_THEATER'
  | 'RIVAL_TURN'
  | 'CANARY_BREAK'
  | 'CEREMONY';

const TOTAL_TURNS_PER_MATCH = 10;

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, Math.max(0, ms));
  });
}

export class ShowtimeAppV7 {
  public readonly engine: WebGL2StageEngineV7;
  public readonly board: InteractiveBoard3DControllerV7;
  public readonly audio: ShowbandAudioEngineV7;
  public readonly corpus: CorpusManagerV7;
  public readonly campaign: CampaignDirectorV7;
  public readonly ui: BroadcastChromeUIV7;
  public readonly titleHub: TitleAndOnboardingControllerV7;
  public readonly twistTheater: TvTwistTheaterV7;
  public readonly announcer: StudioAnnouncerControllerV7;
  public readonly vfx: StudioBroadcastVfxV7;

  private readonly canvasRoot: HTMLElement;
  private readonly uiRoot: HTMLElement;
  private activeVaultRenderer: LitTrophyVaultRendererV7 | null = null;
  private activeContraption: MountedTactileContraptionV7 | null = null;
  private instantBargainOfferedInMatch = false;

  // Live Match Runtime State
  private phase: MatchPhaseV7 = 'HUB';
  private activeBlueprint: EpisodeBlueprintV7;
  private chosenCoupRegimeForPivot: Exclude<CoupRegimeIdV7, 'NONE'> | undefined;
  private isQuickPlay = false;
  private isDailyBroadcast = false;
  private activeDailyBlueprint: DailyBroadcastBlueprintV7 | null = null;
  private dailyTileHistory: DailyTileHistoryTokenV7[] = [];
  private totalTurnsInCurrentMatch = TOTAL_TURNS_PER_MATCH;
  private activePlayMode: BoardPlayModeV7 = 'CLASSIC_TOTE';
  private activeUnlockTopology: BoardUnlockTopologyV7 = 'CLASSIC_OPEN';

  private turnNumber = 1;
  private playerMatchScore = 0;
  private rivalMatchScore = 0;
  private rivalExpectedMatchScore = 1850;
  private currentStreak = 0;
  private cpuStreak = 0;
  private cpuTiltTurnsRemaining = 0;
  private correctCountInMatch = 0;
  private blitzCorrectCount = 0;
  private isBlitzPhase = false;
  private isAct3Showdown = false;
  private isFinalWagerPhase = false;
  private activeFinalWagerResolveHandler: ((res: ToyResolutionV7) => void) | null = null;
  private skipCurtainRaiserOnce = false;
  private boardSelectArmedAtMs = 0;

  // 2 Classic Studio Lifelines Per Match + Scouting Trackers
  private fiftyFiftyAvailableInMatch = true;
  private audiencePollAvailableInMatch = true;
  private newlyScoutedWeakInMatch: CategoryIdV7[] = [];
  private newlyScoutedStrongInMatch: CategoryIdV7[] = [];
  private pendingDiscoveryBannerText: string | null = null;
  private playedRevealOnPadThisTurn = false;
  private rivalTurnSkipRequested = false;

  private activeTileIndex: number | null = null;
  private activeClue: ClueRecordV7 | null = null;
  private activeToyId: ToyIdV7 = 'TOY_01_KNIFE_SWITCH';
  private clueOpenedAtMs = 0;
  private remainingClueSec = 32;
  private activeMysteryChipsMult = 1.0;
  private pendingNextTurnWheelMult = 1.0;
  private activeSecretSquareBonusMult = 0;
  private activeMatchSeedOffset = 19660601;
  private detachToyChoiceCapture: (() => void) | null = null;
  private lastTickedWholeSec = 99;

  // Narrative, Canary, Booth Tell & Censor Capacitor State
  private activeJuryBallot: VipJuryBallotV7 | null = null;
  private respectedAmberTruceInMatch = false;
  private poachedAmberTruceInMatch = false;
  private pocketedCanaryThisMatch = false;
  private canaryPendingNextTurn = false;
  private boothArrestsInMatch = 0;
  private cleanBonusCashInMatch = 0;
  private contrabandBonusCashInMatch = 0;
  private claimedDomainsInMatch = new Set<DomainIdV7>();
  private seenEntitiesInMatch: string[] = [];
  private earnedTrophiesInMatch = new Set<string>();

  private boothTellActive = false;
  private boothTellChannel: CheatTellChannelV7 | null = null;
  private boothTellRemainingSec = 0;
  private boothTellSparkAccumSec = 0;

  private censorHeld = false;
  private censorCharge01 = 0;
  private censorShieldChargedThisMatch = false;
  private rivalFastForwardHeld = false;

  // Pointer, Pinch-to-Zoom & Drag-to-Pan State for Direct 3D Board Play
  private pointerDownPos: { x: number; y: number } | null = null;
  private lastDragClientPos: { x: number; y: number } | null = null;
  private activePointers = new Map<number, { x: number; y: number }>();
  private pinchInitialDist: number | null = null;
  private pinchInitialZoom = 1.0;
  private gestureDidPanOrPinch = false;
  private draggingCrossfader = false;
  private readonly detachListeners: Array<() => void> = [];
  private matchGenerationId = 0;
  private disposed = false;

  constructor(canvasRoot: HTMLElement, uiRoot: HTMLElement) {
    this.canvasRoot = canvasRoot;
    this.uiRoot = uiRoot;

    // 1. Persistent 90-Episode Campaign, Scouting Meta, Corpus & Psychoacoustic Showband Engine
    this.campaign = new CampaignDirectorV7();
    this.hydrateShowrunnerMetaIntoSave();
    const initialSave = this.campaign.getState();
    this.activeBlueprint = this.campaign.getCurrentEpisodeBlueprint();

    this.corpus = new CorpusManagerV7();
    void this.corpus.init();

    this.audio = new ShowbandAudioEngineV7(initialSave.settings);

    // 2. Hardware WebGL2 Stage Engine (10 Grounded Stages + Frustum Auto-Fitter)
    this.engine = new WebGL2StageEngineV7({
      container: this.canvasRoot,
      initialStageId: this.activeBlueprint.stageId,
      preserveDrawingBuffer: false,
      reducedMotion: initialSave.settings.reducedMotion,
    });
    if (initialSave.activeCoupRegime !== 'NONE') {
      this.engine.setCoupRegime(initialSave.activeCoupRegime);
    }

    // 3. Interactive +22°-Raked 3D Contraption Board Controller
    const initRival = CAST_PROFILES_V7[this.activeBlueprint.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const initStageSpec = STAGE_WORLD_SPECS_V7[this.activeBlueprint.stageId];
    this.board = new InteractiveBoard3DControllerV7({
      mountGroup: this.engine.boardMount,
      envMap: this.engine.sharedEnvMap,
      initialBoardId: this.activeBlueprint.boardId,
      initialTwistId: this.activeBlueprint.twistId,
      rivalId: this.activeBlueprint.rivalId,
      rivalWeakCategories: initRival.weakCategories,
      rivalStrongCategories: initRival.strongCategories,
      tableBedHex: initStageSpec.tableBedHex,
      trimVeneerHex: initStageSpec.trimVeneerHex,
      trimAccentHex: initStageSpec.trimAccentHex,
      reducedMotion: initialSave.settings.reducedMotion,
      highContrastBadges: initialSave.settings.highContrastBadges,
      onTileHoverChanged: (tileIdx) => {
        if (tileIdx !== null && this.phase === 'BOARD_SELECT') {
          this.audio.playTileHover();
        }
      },
      onMercySwitchPulled: (disarmedCount) => {
        this.audio.playKnifeSwitch();
        if (disarmedCount > 0) {
          this.earnedTrophiesInMatch.add('trophy_s2_15');
        }
      },
      onBoardGimmickTriggered: () => {
        this.audio.playDialDetent();
        this.audio.playSplitFlapTick();
      },
    });

    // Re-fit portrait/landscape board layout & camera frustum on boot and viewport resize!
    const syncViewportOrientationAndFit = (): void => {
      const vw = this.canvasRoot.clientWidth || window.innerWidth;
      const vh = this.canvasRoot.clientHeight || window.innerHeight;
      this.board.setPortraitMode(vw < vh);
      this.engine.fitBoardToViewport(vw, vh);
    };
    syncViewportOrientationAndFit();
    window.addEventListener('resize', syncViewportOrientationAndFit);
    document.addEventListener('fullscreenchange', syncViewportOrientationAndFit);
    document.addEventListener('webkitfullscreenchange', syncViewportOrientationAndFit as EventListener);
    this.detachListeners.push(() => {
      window.removeEventListener('resize', syncViewportOrientationAndFit);
      document.removeEventListener('fullscreenchange', syncViewportOrientationAndFit);
      document.removeEventListener('webkitfullscreenchange', syncViewportOrientationAndFit as EventListener);
    });

    // 4. 1966 "In Living Color" Broadcast Chrome UI + Animated Title & Onboarding Hub
    this.ui = new BroadcastChromeUIV7(this.uiRoot, this.campaign, {
      onStartCampaignMatch: (bp, chosenRegime) => {
        void this.unlockAudioAndSyncHub();
        this.audio.playRubberStamp();
        this.chosenCoupRegimeForPivot = chosenRegime;
        void this.launchCampaignWithColdOpenIfNeeded(bp);
      },
      onStartQuickPlay: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playUiTap();
        void this.handleQuickPlayLaunch();
      },
      onStartDailyBroadcast: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playTileSelect();
        void this.startDailyBroadcastMatch();
      },
      onOpenHowToPlay: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playUiTap();
        if (this.phase !== 'HUB') {
          this.ui.openHowToPlayModal();
          return;
        }
        const ruleBanner = this.board.getBoardModeRuleBanner();
        this.titleHub.openHowToPlaySheet({
          episodeBlueprint: this.activeBlueprint,
          boardModeSummary: {
            modeTitle: ruleBanner.modeTitle,
            ruleSummary: ruleBanner.ruleSummary,
          },
          onClose: () => {
            if (this.phase === 'HUB') {
              this.refreshTitleHubView();
            }
          },
        });
      },
      onBoothArrestPressed: () => {
        this.handleBoothArrest();
      },
      onCensorPaddleStateChange: (held) => {
        this.handleCensorPaddleHold(held);
      },
      onSettingsChanged: (settings) => {
        this.applyBroadcastSettings(settings);
      },
      onMountTrophyVault3D: (stageEl, initialTrophyId, unlocked) => {
        this.disposeActiveVaultRenderer();
        const vr = new LitTrophyVaultRendererV7({
          container: stageEl,
          sharedEnvMap: this.engine.sharedEnvMap,
          initialTrophyId,
          unlocked,
        });
        vr.start();
        this.activeVaultRenderer = vr;
        return () => {
          this.disposeActiveVaultRenderer();
        };
      },
      onSelectTrophyIn3DVault: (trophyId, unlocked) => {
        this.audio.playUiTap();
        this.activeVaultRenderer?.setTrophy(trophyId, unlocked);
      },
      onLiveScoreBurnPurchase: (nextScore) => {
        this.audio.playRubberStamp();
        this.playerMatchScore = nextScore;
        this.syncTopBroadcastBug();
      },
      onReturnToTitleHub: () => {
        const wasQuickPlay = this.isQuickPlay;
        const wasDaily = this.isDailyBroadcast;
        this.campaign.saveToStorage();
        this.persistShowrunnerMeta();
        this.audio.playRubberStamp();
        this.returnToTitleHub();
        const nextEpCode = this.campaign.getCurrentEpisodeBlueprint().code;
        const msg = wasDaily
          ? '✓ RETURNED TO STUDIO 6A HUB!'
          : wasQuickPlay
            ? '✓ QUICK SHOW STATS, SCOUTING & MEDALS SAVED!'
            : `✓ PROGRESS SAVED — READY FOR ${nextEpCode} ANYTIME!`;
        this.ui.showLiveToast(msg, 'emerald', 3000);
      },
      onAdjustBoardZoom: (deltaOrReset) => {
        this.audio.playDialDetent();
        const nextZoom =
          deltaOrReset === 'RESET'
            ? this.engine.resetCameraZoomAndPan()
            : this.engine.adjustUserZoom(deltaOrReset);
        this.ui.updateZoomReadout(nextZoom);
      },
      onToggleFullscreen: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playUiTap();
        void this.ui.handleFullscreenToggle();
      },
      onUtilityModalStateChange: (open) => {
        if (open) {
          this.announcer.dismissImmediate();
        }
      },
    });

    this.titleHub = new TitleAndOnboardingControllerV7(this.uiRoot, {
      onPlayCampaign: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playTitleShowtimeFanfare();
        const bp = this.campaign.getCurrentEpisodeBlueprint();
        void this.launchCampaignWithColdOpenIfNeeded(bp);
      },
      onPlayDailyBroadcast: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playTileSelect();
        void this.startDailyBroadcastMatch();
      },
      onQuickPlaySelected: (sel) => {
        void this.unlockAudioAndSyncHub();
        this.audio.playTileSelect();
        void this.handleQuickPlayLaunch(sel);
      },
      onQuickShow: (sel) => {
        void this.unlockAudioAndSyncHub();
        this.audio.playTileSelect();
        void this.handleQuickPlayLaunch(sel);
      },
      isAudioUnlocked: () => this.audio.isAudioUnlocked(),
      onRequestAudioUnlock: async () => {
        await this.unlockAudioAndSyncHub();
      },
      onOpenHowToPlay: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playUiTap();
        if (this.phase !== 'HUB') {
          this.ui.openHowToPlayModal();
          return;
        }
        const ruleBanner = this.board.getBoardModeRuleBanner();
        this.titleHub.openHowToPlaySheet({
          episodeBlueprint: this.activeBlueprint,
          boardModeSummary: {
            modeTitle: ruleBanner.modeTitle,
            ruleSummary: ruleBanner.ruleSummary,
          },
          onClose: () => {
            if (this.phase === 'HUB') {
              this.refreshTitleHubView();
            }
          },
        });
      },
      onOpenTrophyVault: () => {
        this.titleHub.hideAll();
        this.ui.openTrophyVaultModal(() => {
          if (this.phase === 'HUB') this.refreshTitleHubView();
        });
      },
      onOpenAudioSettings: () => {
        this.titleHub.hideAll();
        this.ui.openSettingsModal(() => {
          if (this.phase === 'HUB') this.refreshTitleHubView();
        });
      },
      onOpenPropShop: () => {
        this.titleHub.hideAll();
        this.ui.openPropTrunkModal(false, () => {
          if (this.phase === 'HUB') this.refreshTitleHubView();
        });
      },
      onOpenEpisodeJump: () => {
        this.titleHub.hideAll();
        this.ui.openEpisodeJumpModal(() => {
          if (this.phase === 'HUB') this.refreshTitleHubView();
        });
      },
      onToggleFullscreen: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playUiTap();
        void this.ui.handleFullscreenToggle();
      },
      onUiTapSfx: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playUiTap();
      },
      onBellSfx: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playTileSelect();
      },
      onCelebrateSfx: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playTrophyUnlockChime();
      },
    });

    this.twistTheater = new TvTwistTheaterV7(this.uiRoot, {
      onUiTapSfx: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playUiTap();
      },
      onCurtainOpenSfx: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playMysteryCurtainSpin();
      },
      onBargainBellSfx: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playInstantBargainBell();
      },
      onBargainBuySfx: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playTrophyUnlockChime();
      },
      onBargainPassSfx: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playUiTap();
      },
      onSecretSquareSfx: () => {
        void this.unlockAudioAndSyncHub();
        this.audio.playSecretSquareFanfare();
      },
      onWheelPegTickSfx: (speed01) => {
        this.playBigWheelPegTickSfx(speed01);
      },
      onWheelWinSfx: (res) => {
        if (res.kind === 'GREMLIN') {
          this.playGremlinZonkSfx();
        } else {
          this.audio.playTrophyUnlockChime();
          this.triggerApplauseSign(2.2);
        }
      },
      onBounceTickSfx: () => {
        this.audio.playSplitFlapTick();
      },
      onGremlinZonkSfx: () => {
        this.playGremlinZonkSfx();
      },
    });

    this.announcer = new StudioAnnouncerControllerV7(this.uiRoot, {
      reducedMotion: initialSave.settings.reducedMotion,
      highContrast: initialSave.settings.highContrastBadges,
    });

    this.vfx = new StudioBroadcastVfxV7({
      container: document.getElementById('app') ?? document.body,
      reducedMotion: initialSave.settings.reducedMotion,
    });

    // 5. Attach Direct 3D Raycast Pointer, Touch & Keyboard Ergonomics
    this.bindInputListeners();

    // 6. Start 60fps Master Render & Telemetry Loop
    const unsubFrame = this.engine.addFrameListener((dtSec) => {
      this.onFrame(dtSec);
    });
    this.detachListeners.push(unsubFrame);
    this.engine.start();

    // Expose read-only diagnostic & structural-verification bridge
    this.exposeDiagnosticsBridge();

    // Boot into Title & Backstage Hub (or deterministic ?qa_view= preview mode!)
    this.returnToTitleHub();
    this.maybeBootIntoQaQueryPreview();
  }

  // --------------------------------------------------------------------------
  // Persistent Scouting Notebook, Returning-Champ Streak & Audio/Stage Bridges
  // --------------------------------------------------------------------------

  private hydrateShowrunnerMetaIntoSave(): void {
    const save = this.campaign.getState();
    if (!save.scoutingNotebook) save.scoutingNotebook = {};
    if (typeof save.returningChampStreak !== 'number') save.returningChampStreak = 0;
    if (!Array.isArray(save.recentBoardCombos)) save.recentBoardCombos = [];
    if (!save.careerMedalCounts) save.careerMedalCounts = {};
    if (!Array.isArray(save.masteredBoardModes)) save.masteredBoardModes = [];
    if (!Array.isArray(save.masteredDifficulties)) save.masteredDifficulties = [];
    if (!Array.isArray(save.masteredModeDifficulties)) save.masteredModeDifficulties = [];

    try {
      const raw = window.localStorage.getItem(SHOWRUNNER_META_STORAGE_KEY_V7);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ShowrunnerPersistedMetaV7>;
      if (parsed.scoutingNotebook && typeof parsed.scoutingNotebook === 'object') {
        save.scoutingNotebook = {
          ...parsed.scoutingNotebook,
          ...save.scoutingNotebook,
        };
      }
      if (typeof parsed.returningChampStreak === 'number' && save.returningChampStreak === 0) {
        save.returningChampStreak = Math.max(0, Math.floor(parsed.returningChampStreak));
      }
      if (Array.isArray(parsed.recentBoardCombos) && save.recentBoardCombos.length === 0) {
        save.recentBoardCombos = parsed.recentBoardCombos.slice(-18);
      }
      if (parsed.careerMedalCounts && typeof parsed.careerMedalCounts === 'object') {
        save.careerMedalCounts = {
          ...parsed.careerMedalCounts,
          ...save.careerMedalCounts,
        };
      }
      if (Array.isArray(parsed.masteredBoardModes) && save.masteredBoardModes.length === 0) {
        save.masteredBoardModes = [...parsed.masteredBoardModes];
      }
      if (Array.isArray(parsed.masteredDifficulties) && save.masteredDifficulties.length === 0) {
        save.masteredDifficulties = [...parsed.masteredDifficulties];
      }
      if (
        Array.isArray(parsed.masteredModeDifficulties) &&
        save.masteredModeDifficulties.length === 0
      ) {
        save.masteredModeDifficulties = [...parsed.masteredModeDifficulties];
      }
    } catch {
      // Ignore malformed storage
    }
  }

  private persistShowrunnerMeta(): void {
    const save = this.campaign.getState();
    const payload: ShowrunnerPersistedMetaV7 = {
      scoutingNotebook: save.scoutingNotebook ?? {},
      returningChampStreak: save.returningChampStreak ?? 0,
      recentBoardCombos: (save.recentBoardCombos ?? []).slice(-18),
      careerMedalCounts: save.careerMedalCounts ?? {},
      masteredBoardModes: save.masteredBoardModes ?? [],
      masteredDifficulties: save.masteredDifficulties ?? [],
      masteredModeDifficulties: save.masteredModeDifficulties ?? [],
    };
    try {
      window.localStorage.setItem(SHOWRUNNER_META_STORAGE_KEY_V7, JSON.stringify(payload));
    } catch {
      // Ignore quota errors
    }
    this.campaign.updateSettings({});
  }

  private getOrInitRivalNotebook(rivalId: RivalIdV7): {
    revealedStrong: CategoryIdV7[];
    revealedWeak: CategoryIdV7[];
    traitRevealed?: boolean;
  } {
    const save = this.campaign.getState();
    if (!save.scoutingNotebook) save.scoutingNotebook = {};
    let entry = save.scoutingNotebook[rivalId];
    if (!entry) {
      entry = { revealedStrong: [], revealedWeak: [], traitRevealed: false };
      save.scoutingNotebook[rivalId] = entry;
    }
    return entry;
  }

  private discoverRivalWeakCategory(rivalId: RivalIdV7, category: CategoryIdV7): boolean {
    const profile = CAST_PROFILES_V7[rivalId];
    if (!profile || !profile.weakCategories.includes(category)) return false;
    const entry = this.getOrInitRivalNotebook(rivalId);
    if (entry.revealedWeak.includes(category)) return false;
    entry.revealedWeak.push(category);
    if (!this.newlyScoutedWeakInMatch.includes(category)) {
      this.newlyScoutedWeakInMatch.push(category);
    }
    const twists = this.getLiveTwistsEngine();
    twists?.updateRuntimeMatchFlags(
      { scoutedWeakCategories: entry.revealedWeak },
      this.board.getTiles() as never,
    );
    this.board.refreshAllTilePlaques();
    this.persistShowrunnerMeta();
    return true;
  }

  private discoverRivalStrongCategory(rivalId: RivalIdV7, category: CategoryIdV7): boolean {
    const profile = CAST_PROFILES_V7[rivalId];
    if (!profile || !profile.strongCategories.includes(category)) return false;
    const entry = this.getOrInitRivalNotebook(rivalId);
    if (entry.revealedStrong.includes(category)) return false;
    entry.revealedStrong.push(category);
    if (!this.newlyScoutedStrongInMatch.includes(category)) {
      this.newlyScoutedStrongInMatch.push(category);
    }
    this.persistShowrunnerMeta();
    return true;
  }

  private discoverRivalTrait(rivalId: RivalIdV7): void {
    const entry = this.getOrInitRivalNotebook(rivalId);
    if (!entry.traitRevealed) {
      entry.traitRevealed = true;
      this.persistShowrunnerMeta();
    }
  }

  private getLiveTwistsEngine(): BoardTwistsEngineV7 | null {
    return (
      (this.board as unknown as { twistsEngine?: BoardTwistsEngineV7 }).twistsEngine ??
      BoardTwistsEngineV7.getActiveEngine()
    );
  }

  private syncBoardSpotlightBeams(): void {
    const spotIndices = this.getLiveTwistsEngine()?.getActiveSpotlightIndices() ?? [];
    (
      this.board as unknown as { setSpotlightIndices?: (indices: readonly number[]) => void }
    ).setSpotlightIndices?.(spotIndices);
  }

  private triggerApplauseSign(durationSec = 2.4): void {
    (
      this.engine as unknown as { triggerStudioApplauseSign?: (dur?: number) => void }
    ).triggerStudioApplauseSign?.(durationSec);
  }

  private focusCameraOnTile(tileIdx: number | null, zoomBoost = 0.04): void {
    const fn = (
      this.engine as unknown as {
        focusBoardPoint?: (worldX: number, worldZ: number, boost: number) => void;
      }
    ).focusBoardPoint;
    if (typeof fn !== 'function') return;
    if (tileIdx === null) {
      fn.call(this.engine, 0, 0, 0);
      return;
    }
    const wp = this.board.getTileWorldPosition(tileIdx);
    fn.call(this.engine, wp.x, wp.z, zoomBoost);
  }

  private async unlockAudioAndSyncHub(): Promise<void> {
    await this.audio.unlock();
    const isRunning = this.audio.isAudioUnlocked();
    this.titleHub.setAudioUnlocked(isRunning);
  }

  private setSongChartVariantSafe(variantIdx: number): void {
    this.audio.setSongChartVariant(variantIdx);
  }

  private playBandReactionSafe(
    kind: 'LEAD_CHANGE' | 'HOT_STREAK' | 'CLUTCH_POINT' | 'RIVAL_FUMBLE' | 'LINE_JACKPOT',
  ): void {
    this.audio.playBandReaction(kind);
  }

  private playTileSelectFlipSfx(): void {
    this.audio.playTileSelectFlip();
  }

  private playAnswerLockInAudio(isClutch: boolean): void {
    this.audio.playAnswerLockInSting(isClutch);
  }

  private playBigWheelPegTickSfx(speed01 = 0.7): void {
    this.audio.playBigWheelPegTick(speed01);
  }

  private playGremlinZonkSfx(): void {
    this.audio.playStudioGremlinZonk();
  }

  private playLifelineSfx(kind: 'FIFTY_FIFTY' | 'AUDIENCE_POLL'): void {
    this.audio.playLifelineCue(kind);
  }

  private getTileScreenCoordinates(tileIdx: number): { xPx: number; yPx: number } {
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    const wp = this.board.getTileWorldPosition(tileIdx).clone().project(this.engine.camera);
    return {
      xPx: Math.round(rect.left + (wp.x * 0.5 + 0.5) * rect.width),
      yPx: Math.round(rect.top + (-wp.y * 0.5 + 0.5) * rect.height),
    };
  }

  private getCurrentBroadcastAct(): BroadcastActNumberV7 {
    if (this.isDailyBroadcast) return 1;
    if (this.isFinalWagerPhase || this.turnNumber >= this.totalTurnsInCurrentMatch) return 3;
    if (this.turnNumber >= 6) return 2;
    return 1;
  }

  private resolveHostQuestionIntro(ctx: {
    readonly category: CategoryIdV7;
    readonly cashValue: number;
    readonly actNumber: BroadcastActNumberV7;
    readonly twistLabel?: string;
    readonly isClutch?: boolean;
    readonly rivalName: string;
    readonly seed: number;
  }): { readonly hostLine: string; readonly mood: EmceeMoodV7 } {
    return getHostQuestionIntroLineV7(ctx);
  }

  private resolveHostLockInQuip(
    choiceLabel: string,
    isHighStakes: boolean,
    seed: number,
  ): string {
    return getHostLockInQuipV7(choiceLabel, isHighStakes, seed);
  }

  private resolveHostAnswerReveal(ctx: {
    readonly correct: boolean;
    readonly cashWon: number;
    readonly streak: number;
    readonly rivalName: string;
    readonly wasFinalWager?: boolean;
    readonly seed: number;
  }): { readonly headline: string; readonly hostQuip: string; readonly mood: EmceeMoodV7 } {
    return getHostAnswerRevealLineV7(ctx);
  }

  private resolveNextEpisodeCliffhangerTeaser(
    nextBp: EpisodeBlueprintV7,
  ): NextEpisodeCliffhangerTeaserV7 {
    return getNextEpisodeCliffhangerTeaserV7(nextBp, this.campaign.getState());
  }

  private maybeBootIntoQaQueryPreview(): void {
    try {
      const params = new URLSearchParams(window.location.search);
      const qaView = params.get('qa_view');
      if (!qaView) return;

      if (qaView === 'TITLE') {
        this.refreshTitleHubView(false);
        return;
      }
      if (qaView === 'COLD_OPEN') {
        this.titleHub.hideAll();
        void this.titleHub.playStoryAndRulesColdOpen({
          episodeBlueprint: this.activeBlueprint,
          startBeat: 0,
        });
        return;
      }
      if (qaView === 'COLD_OPEN_TWISTS') {
        this.titleHub.hideAll();
        void this.titleHub.playStoryAndRulesColdOpen({
          episodeBlueprint: this.activeBlueprint,
          startBeat: 1,
        });
        return;
      }

      // All Stage / Board / Question / Ceremony QA Views mount the live 3D Stage & Tote Board FIRST!
      const rawStageParam = params.get('stage');
      const shortStageAliases: Record<string, StageWorldIdV7> = {
        STAGE_01: 'STAGE_01_IBC_DAYTIME_FUNK',
        STAGE_02: 'STAGE_02_IBC_PRIMETIME_JUBILEE',
        STAGE_03: 'STAGE_03_1926_VAUDEVILLE_PIT',
        STAGE_04: 'STAGE_04_1958_ISOLATION_VAULT',
        STAGE_05: 'STAGE_05_1984_LARSON_CRT_LAB',
        STAGE_06: 'STAGE_06_ATLANTIC_CITY_PIER',
        STAGE_07: 'STAGE_07_1969_MONTE_CARLO_CASINO',
        STAGE_08: 'STAGE_08_WORLDS_FAIR_GEODESIC',
        STAGE_09: 'STAGE_09_CHANNEL_83_UHF_BARGE',
        STAGE_10: 'STAGE_10_SOVEREIGN_SANCTUM',
      };
      const resolvedStageCandidate = rawStageParam
        ? shortStageAliases[rawStageParam] ?? (rawStageParam as StageWorldIdV7)
        : null;
      const stg: StageWorldIdV7 =
        resolvedStageCandidate && STAGE_WORLD_SPECS_V7[resolvedStageCandidate]
          ? resolvedStageCandidate
          : 'STAGE_01_IBC_DAYTIME_FUNK';
      const brd =
        (params.get('board') as BoardIdV7 | null) ??
        BOARD_SPECS_V7[this.activeBlueprint.boardId]?.id ??
        'BOARD_01_FUNK_CROSSFADER';
      const stageDefaultRivals: Record<StageWorldIdV7, RivalIdV7> = {
        STAGE_01_IBC_DAYTIME_FUNK: 'CARMEN_DELGADO',
        STAGE_02_IBC_PRIMETIME_JUBILEE: 'TOBY_OKAFOR',
        STAGE_03_1926_VAUDEVILLE_PIT: 'GIGI_ST_CLAIR',
        STAGE_04_1958_ISOLATION_VAULT: 'INEZ_CALLAHAN',
        STAGE_05_1984_LARSON_CRT_LAB: 'BUZZ_HALVORSEN',
        STAGE_06_ATLANTIC_CITY_PIER: 'MILES_ELLINGTON',
        STAGE_07_1969_MONTE_CARLO_CASINO: 'REX_CALLOWAY',
        STAGE_08_WORLDS_FAIR_GEODESIC: 'CLARA_VON_BERG',
        STAGE_09_CHANNEL_83_UHF_BARGE: 'SEO_YUN_KANG',
        STAGE_10_SOVEREIGN_SANCTUM: 'VICTOR_LAZAR',
      };
      const rivalParam: RivalIdV7 =
        (params.get('rival') as RivalIdV7 | null) ??
        (rawStageParam ? stageDefaultRivals[stg] : undefined) ??
        this.activeBlueprint.rivalId;
      const topoOverride =
        (params.get('topology') as BoardUnlockTopologyV7 | null) ?? 'CLASSIC_OPEN';
      const modeOverride = params.get('mode') as BoardPlayModeV7 | null;

      if (qaView === 'FINAL_WAGER') {
        this.turnNumber = 10;
        this.isFinalWagerPhase = true;
        this.playerMatchScore = 1850;
        this.rivalMatchScore = 1600;
      }

      this.titleHub.hideAll();
      this.ui.hideTitleHub();
      this.ui.showTopBroadcastBug(true, false);
      this.phase = 'BOARD_SELECT';
      this.activeBlueprint = {
        ...this.activeBlueprint,
        stageId: stg,
        boardId: brd,
        rivalId: rivalParam,
        coldOpenLine: this.campaign.composeQuickPlayColdOpen(rivalParam),
      };
      this.activePlayMode = modeOverride ?? BOARD_SPECS_V7[brd].playMode;
      this.activeUnlockTopology = topoOverride;
      this.mountStageAndBoardForBlueprint(this.activeBlueprint, undefined, {
        playMode: this.activePlayMode,
        unlockTopology: topoOverride,
        isCampaignEp1: false,
      });
      this.syncTopBroadcastBug();
      this.engine.fitBoardToViewport(window.innerWidth, window.innerHeight);
      this.engine.renderFrameNow(1 / 60);

      if (qaView === 'BOARD') {
        const rb = this.board.getBoardModeRuleBanner();
        this.ui.setBoardModeBanner(rb);
        return;
      }
      if (qaView === 'QUESTION_4CHOICE' || qaView === 'QUESTION_SHOWCASE') {
        const toy: ToyIdV7 =
          qaView === 'QUESTION_4CHOICE'
            ? 'TOY_01_KNIFE_SWITCH'
            : ((params.get('toy') as ToyIdV7 | null) ?? 'TOY_03_VERNIER_DIAL');
        const styleParam = params.get('style') as NonNullable<ClueRecordV7['cardStyle']> | null;
        this.qaCardStyleOverride = styleParam;
        this.boardSelectArmedAtMs = 0;
        if (params.get('clutch') === '1') {
          this.turnNumber = this.totalTurnsInCurrentMatch;
          this.isAct3Showdown = true;
        }
        const openQaQuestionNow = (): void => {
          this.boardSelectArmedAtMs = 0;
          this.phase = 'BOARD_SELECT';
          const tiles = this.board.getTiles();
          const openTile =
            tiles.find(
              (t) =>
                !t.isVaultLocked &&
                !t.isTopologyLocked &&
                t.state === 'OPEN' &&
                (!t.tvTwist || t.tvTwist === 'NONE'),
            ) ??
            tiles.find(
              (t) =>
                !t.isVaultLocked &&
                !t.isTopologyLocked &&
                t.state === 'OPEN' &&
                (!t.tvTwist || t.tvTwist === 'NONE' || t.tvTwist === 'SHOWCASE_BONUS'),
            ) ??
            tiles.find((t) => !t.isVaultLocked && !t.isTopologyLocked && t.state === 'OPEN') ??
            tiles[0];
          if (openTile) {
            void this.selectBoardTile(openTile.index, toy);
          }
        };
        void this.corpus
          .init()
          .then(openQaQuestionNow)
          .catch(openQaQuestionNow);
        return;
      }
      if (qaView === 'BIG_WHEEL') {
        void this.twistTheater.playBigWheelSpin({
          seed: 1966,
          onPegTick: (s) => this.playBigWheelPegTickSfx(s),
        });
        return;
      }
      if (qaView === 'PYL_BOARD') {
        const rp = CAST_PROFILES_V7[this.activeBlueprint.rivalId];
        void this.twistTheater.playPressYourLuckGremlinBoard({
          spinsEarned: 2,
          playerCash: 1250,
          rivalName: rp?.name ?? 'Carmen Delgado',
          seed: 1966,
        });
        return;
      }
      if (qaView === 'PYL_ZONK') {
        const rp = CAST_PROFILES_V7[this.activeBlueprint.rivalId];
        void this.twistTheater.playPressYourLuckGremlinBoard({
          spinsEarned: 2,
          playerCash: 1600,
          rivalName: rp?.name ?? 'Carmen Delgado',
          seed: 7,
        });
        window.setTimeout(() => {
          const well = document.querySelector<HTMLElement>('.wst7-pyl-center-well');
          const stage = document.querySelector<HTMLElement>('.wst7-gremlin-stage');
          if (well) well.dataset.mode = 'gremlin';
          if (stage) stage.dataset.state = 'gremlin-zonk';
        }, 80);
        return;
      }
      if (qaView === 'CURTAIN_RAISER') {
        const rb = this.board.getBoardModeRuleBanner();
        const stageSpec = STAGE_WORLD_SPECS_V7[stg];
        void this.ui.playMatchCurtainRaiser({
          episodeCode: this.activeBlueprint.code,
          stageTitle: stageSpec.name,
          matchTitle: this.activeBlueprint.title,
          rivalId: this.activeBlueprint.rivalId,
          boardModeTitle: rb.modeTitle,
          boardRuleSummary: rb.ruleSummary,
          topologyBadge:
            topoOverride !== 'CLASSIC_OPEN'
              ? BOARD_UNLOCK_TOPOLOGY_SPECS_V7[topoOverride].badge
              : undefined,
          returningChampStreak: 2,
          scoutedWeak: [CAST_PROFILES_V7[this.activeBlueprint.rivalId].weakCategories[0]],
          durationMs: 60_000,
        });
        return;
      }
      if (qaView === 'SCOUTING_NOTEBOOK') {
        this.discoverRivalWeakCategory(
          this.activeBlueprint.rivalId,
          CAST_PROFILES_V7[this.activeBlueprint.rivalId].weakCategories[0],
        );
        this.discoverRivalStrongCategory(
          this.activeBlueprint.rivalId,
          CAST_PROFILES_V7[this.activeBlueprint.rivalId].strongCategories[0],
        );
        this.discoverRivalTrait(this.activeBlueprint.rivalId);
        this.ui.openScoutingNotebookModal(this.activeBlueprint.rivalId);
        return;
      }
      if (qaView === 'CANARY') {
        void this.ui.showCanaryEnvelope(this.activeBlueprint);
        return;
      }
      if (qaView === 'PROP_SHOP') {
        this.ui.openPropTrunkModal(false);
        return;
      }
      if (qaView === 'WAIVER') {
        void this.ui.showReleaseWaiver();
        return;
      }
      if (qaView === 'ACT2_BUMPER') {
        void this.ui.playActBreakBumper({ durationMs: 60_000 });
        return;
      }
      if (qaView === 'FINAL_WAGER') {
        this.turnNumber = 10;
        this.isFinalWagerPhase = true;
        this.playerMatchScore = 1850;
        this.rivalMatchScore = 1600;
        this.syncTopBroadcastBug();
        void this.ui.playFinalBroadcastWagerStage({
          episodeCode: this.activeBlueprint.code,
          category: 'DYNASTIES',
          playerCash: 1850,
          rivalCash: 1600,
          rivalId: this.activeBlueprint.rivalId,
          maxWager: 1850,
          isScoutedWeak: true,
        });
        return;
      }
      if (qaView === 'FINAL_WAGER_REVEAL') {
        this.turnNumber = 10;
        this.isFinalWagerPhase = true;
        void this.ui.playFinalWagerShowdownReveal({
          category: 'DYNASTIES',
          trueAnswerDisplay: 'The Treaty of Tordesillas (1494)',
          ahaFactoid:
            'Pope Alexander VI’s meridian accidentally sliced eastern Brazil inside Portugal’s sphere six years before Cabral landed.',
          hostQuip:
            'Nailed the Final Showdown—fifty million viewers just stood up in their living rooms!',
          hostMood: 'WINK',
          rivalId: this.activeBlueprint.rivalId,
          cpuAnswerText: 'The Peace of Westphalia',
          cpuCorrect: false,
          cpuWager: 1400,
          prevRivalCash: 1600,
          finalRivalCash: 200,
          playerAnswerText: 'The Treaty of Tordesillas (1494)',
          playerCorrect: true,
          playerWager: 1400,
          prevPlayerCash: 1850,
          finalPlayerCash: 3250,
          dwellMs: 60_000,
        });
        return;
      }
      if (qaView === 'WINNERS_CHECK') {
        const saveRef = this.campaign.getState();
        saveRef.grudgeBountyPool = 0;
        saveRef.careerMedalCounts = {
          SHUTOUT_STREAK: 2,
          WHEEL_HIGH_ROLLER: 1,
          NO_LIFELINE_PURIST: 3,
          RETURNING_CHAMP_CROWN: 2,
        };
        saveRef.masteredBoardModes = ['CLASSIC_TOTE', 'TIC_TAC_LINE', 'BIG_WHEEL_SHOWCASE'];
        // Exact reconciliation: $2,450 match + $225 (3-day crown) + $425 (4 medals: 100+100+125+100) = $3,100 certifiedPurse!
        const summary = this.campaign.recordEpisodeOutcome({
          blueprint: this.activeBlueprint,
          playerMatchScore: 2450,
          rivalMatchScore: 1600,
          respectedAmberTruce: true,
          poachedAmberTruce: false,
          canaryAction: 'BURNED',
          boothArrestsInMatch: 1,
          cleanBonusCash: 650,
          contrabandBonusCash: 0,
          seenEntityKeysInMatch: [],
          earnedTrophyIdsInMatch: [],
        });
        const nextQaBp = this.campaign.getCurrentEpisodeBlueprint();
        const nextQaRival = CAST_PROFILES_V7[nextQaBp.rivalId]?.name ?? 'Dotty Vance';
        void this.ui
          .playDualPurseCeremony(this.activeBlueprint, 2450, 1600, summary, {
            returningChampStreak: 3,
            newlyScoutedWeak: [CAST_PROFILES_V7[this.activeBlueprint.rivalId].weakCategories[0]],
            newlyScoutedStrong: [
              CAST_PROFILES_V7[this.activeBlueprint.rivalId].strongCategories[0],
            ],
            scoutedPlaystyleLabel: 'PROFESSOR (STEADY)',
            nextRivalName: nextQaRival,
            nextBoardModeTitle: 'HOLLYWOOD SQUARES · 3-IN-A-ROW',
            nextCliffhangerTeaser: this.resolveNextEpisodeCliffhangerTeaser(nextQaBp),
            allowBackstageCustomization: true,
            earnedCareerMedals: [
              'SHUTOUT_STREAK',
              'WHEEL_HIGH_ROLLER',
              'NO_LIFELINE_PURIST',
              'RETURNING_CHAMP_CROWN',
            ],
          })
          .then((choice) => {
            this.campaign.saveToStorage();
            this.persistShowrunnerMeta();
            if (choice === 'SAVE_AND_EXIT') {
              this.audio.playRubberStamp();
              this.returnToTitleHub();
              this.ui.showLiveToast(
                `✓ PROGRESS SAVED — READY FOR ${nextQaBp.code} ANYTIME!`,
                'emerald',
                3200,
              );
            }
          });
        return;
      }
    } catch {
      // Ignore malformed query strings
    }
  }

  private disposeActiveVaultRenderer(): void {
    if (this.activeVaultRenderer) {
      this.activeVaultRenderer.dispose();
      this.activeVaultRenderer = null;
    }
  }

  private disposeActiveContraption(): void {
    if (this.detachToyChoiceCapture) {
      this.detachToyChoiceCapture();
      this.detachToyChoiceCapture = null;
    }
    if (this.activeContraption) {
      this.activeContraption.dispose();
      this.activeContraption = null;
    }
  }

  private applyBroadcastSettings(settings: BroadcastSettingsV7): void {
    this.audio.applySettings(settings);
    this.engine.applySettings(settings);
    this.titleHub.setReducedMotion(settings.reducedMotion);
    this.twistTheater.setReducedMotion(settings.reducedMotion);
    this.vfx.setReducedMotion(settings.reducedMotion);
    this.announcer.setAccessibility({
      reducedMotion: settings.reducedMotion,
      highContrast: settings.highContrastBadges,
    });
    this.board.setVisualAccessibility({
      reducedMotion: settings.reducedMotion,
      highContrastBadges: settings.highContrastBadges,
    });
  }

  private refreshTitleHubView(playBootTuneIn?: boolean): void {
    const save = this.campaign.getState();
    const bp = this.campaign.getCurrentEpisodeBlueprint();
    const dailyBp = getTodayBroadcastBlueprintV7();
    const dailySave = getDailyBroadcastSaveV7(dailyBp.dateIso);
    this.ui.hideTitleHub();
    this.ui.hideModalStage();
    this.ui.hideRivalTurnChyron();
    this.ui.setBoardModeBanner(null);
    this.announcer.setPhase('HUB');
    this.announcer.dismissImmediate();
    this.titleHub.showTitleHub({
      save,
      episodeBlueprint: bp,
      dailySave,
      dailyEpisodeNumber: dailyBp.dailyNumber,
      dailyDateLabel: dailyBp.displayDateShort,
      ...(typeof playBootTuneIn === 'boolean' ? { playBootTuneIn } : {}),
    });
  }

  private generateFreshMatchSeed(salt = 0): number {
    const entropy =
      (Date.now() ^
        Math.floor(Math.random() * 0x7fffffff) ^
        Math.floor(performance.now() * 1000) ^
        Math.imul(salt + 1, 2654435761)) >>>
      0;
    return entropy || 19660601;
  }

  private async handleQuickPlayLaunch(selection?: QuickPlaySelectionV7): Promise<void> {
    if (selection?.difficultyMode) {
      const updated = this.campaign.updateSettings({
        difficultyMode: selection.difficultyMode,
      });
      this.applyBroadcastSettings(updated);
    }
    const save = this.campaign.getState();
    const freshSeed = this.generateFreshMatchSeed(save.episodesPlayed + 17);
    const combo = drawCombinatorialBoardComboV7({
      episodeNumber: 2,
      fallbackBoardId: 'BOARD_01_FUNK_CROSSFADER',
      recentCombos: save.recentBoardCombos,
      preferredMode: selection?.preferredMode,
      seed: freshSeed,
    });
    const quickBp = this.buildQuickPlayBlueprint(combo, freshSeed);
    await this.startMatch(quickBp, true, false, combo);
  }

  private async launchCampaignWithColdOpenIfNeeded(bp: EpisodeBlueprintV7): Promise<void> {
    const launchGen = ++this.matchGenerationId;
    const save = this.campaign.getState();
    this.campaign.ensureDefaultWaiverIfMissing();

    // Streamlined Episode 1 Flow: Story & Rules Cold-Open -> ~3s Curtain-Raiser -> Straight to Board!
    // ZERO Waiver clipboard bloat and ZERO redundant Call-Sheet wall on Episode 1!
    const shouldPlayColdOpen =
      !this.titleHub.hasCompletedColdOpen() ||
      (save.episodesPlayed === 0 && bp.episodeNumber === 1);

    if (shouldPlayColdOpen) {
      await this.titleHub.playStoryAndRulesColdOpen({ episodeBlueprint: bp });
      if (this.disposed || launchGen !== this.matchGenerationId) return;
    } else {
      this.titleHub.hideAll();
    }

    if (bp.isCoupPivot) {
      const { chosenRegime } = await this.ui.showGreenRoomCallSheet(bp);
      if (this.disposed || launchGen !== this.matchGenerationId) return;
      this.chosenCoupRegimeForPivot = chosenRegime;
    }

    await this.startMatch(bp, false, false);
  }

  public async startDailyBroadcastMatch(): Promise<void> {
    const launchGen = ++this.matchGenerationId;
    const dailyBp = getTodayBroadcastBlueprintV7();
    this.activeDailyBlueprint = dailyBp;
    this.dailyTileHistory = [];
    this.titleHub.hideAll();
    // Guarantee 100% deterministic worldwide clue order across all shards BEFORE Turn 1 draws!
    await this.corpus.init();
    await this.corpus.warmSeasonShards();
    if (this.disposed || launchGen !== this.matchGenerationId) return;
    await this.startMatch(dailyBp, false, true, {
      playMode: dailyBp.boardPlayMode,
      unlockTopology: dailyBp.unlockTopology,
      boardId: dailyBp.boardId,
      comboKey: dailyBp.comboKey,
    });
  }

  public returnToTitleHub(): void {
    this.matchGenerationId += 1;
    this.disposeActiveContraption();
    this.twistTheater.cancelActive();
    this.ui.closeQuestionChassis();
    this.ui.hideUtilityModalStage();
    this.ui.hideModalStage();
    this.ui.hideTitleHub();
    this.ui.hideRivalTurnChyron();
    this.engine.setCardApertureOpen(false);
    this.engine.triggerRowCGlint(false);
    this.focusCameraOnTile(null, 0);
    this.audio.setClueSanctuaryActive(false);
    this.audio.setTrapdoorBlitzActive(false);
    this.audio.setBellamySpiteChop(false);
    this.audio.setCensorMicHold(false, 0);
    this.audio.enterGreenRoom();

    this.phase = 'HUB';
    this.isQuickPlay = false;
    this.isDailyBroadcast = false;
    this.isFinalWagerPhase = false;
    this.activeFinalWagerResolveHandler = null;
    this.boothTellActive = false;
    this.censorHeld = false;

    const bp = this.campaign.getCurrentEpisodeBlueprint();
    this.activeBlueprint = bp;
    this.mountStageAndBoardForBlueprint(bp);
    // Keep foreground 3D board hidden on Title Hub so the 1966 Soundstage & Peacock arch shine cleanly behind the animated Title!
    this.engine.boardMount.visible = false;
    this.engine.renderFrameNow(1 / 60);
    this.ui.showTopBroadcastBug(false, false);
    this.refreshTitleHubView();
  }

  private buildQuickPlayBlueprint(
    combo?: {
      readonly playMode: BoardPlayModeV7;
      readonly unlockTopology: BoardUnlockTopologyV7;
      readonly boardId: BoardIdV7;
    },
    seed = 1966,
  ): EpisodeBlueprintV7 {
    const base = this.campaign.getCurrentEpisodeBlueprint();
    const save = this.campaign.getState();
    const diffMode: DifficultyModeV7 = save.settings.difficultyMode ?? 'PRIMETIME_NORMAL';
    const boardId = combo?.boardId ?? 'BOARD_02_JUBILEE_HEX_BRIDGE';
    const spec = BOARD_SPECS_V7[boardId];

    // Pick an authentic 1960s Champion matching the selected Quick-Play Difficulty Tier!
    const tierTarget =
      diffMode === 'MATINEE_EASY'
        ? 1
        : diffMode === 'PRIMETIME_NORMAL'
          ? 2
          : diffMode === 'ALLSTAR_HARD'
            ? 3
            : 4;
    const availableRivals = ALL_RIVAL_IDS_V7.filter((id) => Boolean(CAST_PROFILES_V7[id]));
    const tierRivals = availableRivals.filter(
      (id) => (CAST_PROFILES_V7[id]?.seasonTier ?? 1) === tierTarget,
    );
    const pool = tierRivals.length > 0 ? tierRivals : availableRivals;
    const rivalIdx = (seed >>> 0) % Math.max(1, pool.length);
    const rivalId = pool[rivalIdx] ?? base.rivalId;
    const modeBanner =
      BOARD_MODE_RULE_BANNERS_V7[combo?.playMode ?? spec.playMode];

    return {
      ...base,
      episodeNumber: 2,
      season: (tierTarget as 1 | 2 | 3 | 4) ?? 1,
      code: 'QUICK',
      title: `${modeBanner.modeTitle} — ${spec.name}`,
      stageId: spec.homeStageId,
      boardId,
      twistId: spec.defaultTwistId,
      rivalId,
      coldOpenLine: this.campaign.composeQuickPlayColdOpen(rivalId),
      isRoadshow: false,
      isGoldenExitMatch: false,
      isVaultDrop: false,
      isCoupPivot: false,
      isFinale: false,
    };
  }

  private mountStageAndBoardForBlueprint(
    bp: EpisodeBlueprintV7,
    seedOffset?: number,
    comboOverride?: {
      readonly playMode: BoardPlayModeV7;
      readonly unlockTopology: BoardUnlockTopologyV7;
      readonly isCampaignEp1?: boolean;
    },
  ): void {
    const save = this.campaign.getState();
    const vw = this.canvasRoot.clientWidth || window.innerWidth;
    const vh = this.canvasRoot.clientHeight || window.innerHeight;
    this.board.setPortraitMode(vw < vh);
    const stageSpec = this.engine.setStageWorld(bp.stageId);
    this.engine.boardMount.visible = true;
    this.engine.setCoupRegime(save.activeCoupRegime);

    const rivalProfile = CAST_PROFILES_V7[bp.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const weakCats = bp.isFinale
      ? [...rivalProfile.weakCategories, ...CAST_PROFILES_V7.GRANT_BELLAMY.weakCategories]
      : rivalProfile.weakCategories;
    const notebook = this.getOrInitRivalNotebook(bp.rivalId);

    BoardTwistsEngineV7.stageNextMatchOverrides({
      playModeOverride: comboOverride?.playMode,
      unlockTopology: comboOverride?.unlockTopology ?? 'CLASSIC_OPEN',
      scoutedWeakCategories: notebook.revealedWeak,
      cpuPlaystyle: rivalProfile.playstyle ?? DEFAULT_RIVAL_PLAYSTYLE_V7[bp.rivalId],
      cpuTemperament: rivalProfile.temperament ?? DEFAULT_RIVAL_TEMPERAMENT_V7[bp.rivalId],
      isCampaignEp1: comboOverride?.isCampaignEp1 ?? false,
    });

    this.board.loadBoard({
      boardId: bp.boardId,
      twistId: bp.twistId,
      rivalId: bp.rivalId,
      rivalWeakCategories: weakCats,
      rivalStrongCategories: rivalProfile.strongCategories,
      tableBedHex: stageSpec.tableBedHex,
      trimVeneerHex: stageSpec.trimVeneerHex,
      trimAccentHex: stageSpec.trimAccentHex,
      seedOffset,
    });

    this.syncBoardSpotlightBeams();
    this.engine.fitBoardToViewport(vw, vh);
  }

  // --------------------------------------------------------------------------
  // Live Broadcast Match Lifecycle (10-Turn Show OR 6-Turn Daily 1966 Broadcast)
  // --------------------------------------------------------------------------

  public async startMatch(
    blueprint: EpisodeBlueprintV7,
    quickPlay = false,
    dailyBroadcast = false,
    explicitCombo?: {
      readonly playMode: BoardPlayModeV7;
      readonly unlockTopology: BoardUnlockTopologyV7;
      readonly boardId: BoardIdV7;
      readonly comboKey: string;
    },
  ): Promise<void> {
    const gen = ++this.matchGenerationId;
    this.disposeActiveContraption();
    this.twistTheater.cancelActive();
    this.titleHub.hideAll();
    this.ui.hideTitleHub();
    this.ui.closeQuestionChassis();
    this.ui.hideUtilityModalStage();
    this.ui.hideModalStage();
    this.ui.hideRivalTurnChyron();

    const save = this.campaign.getState();
    const isCampaignEp1 =
      !quickPlay && !dailyBroadcast && blueprint.episodeNumber === 1 && save.episodesPlayed === 0;

    this.activeMatchSeedOffset =
      dailyBroadcast && this.activeDailyBlueprint
        ? this.activeDailyBlueprint.dailySeed
        : this.generateFreshMatchSeed(blueprint.episodeNumber * 97 + save.episodesPlayed * 31);

    // Draw Non-Repeating Combinatorial Board Mode × Unlock Topology (`S01E01` = `CLASSIC_TOTE + CLASSIC_OPEN`)
    const combo =
      explicitCombo ??
      drawCombinatorialBoardComboV7({
        episodeNumber: blueprint.episodeNumber,
        isCampaignEp1,
        fallbackBoardId: blueprint.boardId,
        recentCombos: dailyBroadcast ? [] : save.recentBoardCombos,
        seed: this.activeMatchSeedOffset,
      });

    if (!dailyBroadcast) {
      if (!Array.isArray(save.recentBoardCombos)) save.recentBoardCombos = [];
      save.recentBoardCombos.push(combo.comboKey);
      save.recentBoardCombos = save.recentBoardCombos.slice(-18);
      this.persistShowrunnerMeta();
    }

    const effectiveBp: EpisodeBlueprintV7 =
      combo.boardId !== blueprint.boardId && !blueprint.isFinale && !blueprint.isVaultDrop
        ? {
            ...blueprint,
            boardId: combo.boardId,
            twistId: BOARD_SPECS_V7[combo.boardId].defaultTwistId,
          }
        : blueprint;

    this.activeBlueprint = effectiveBp;
    this.activePlayMode = combo.playMode;
    this.activeUnlockTopology = combo.unlockTopology;
    this.isQuickPlay = quickPlay && !dailyBroadcast;
    this.isDailyBroadcast = dailyBroadcast;
    this.totalTurnsInCurrentMatch =
      dailyBroadcast && this.activeDailyBlueprint
        ? this.activeDailyBlueprint.recommendedTurns
        : TOTAL_TURNS_PER_MATCH;

    this.turnNumber = 1;
    this.playerMatchScore = 0;
    this.rivalMatchScore = 0;
    this.currentStreak = 0;
    this.cpuStreak = 0;
    this.cpuTiltTurnsRemaining = 0;
    this.correctCountInMatch = 0;
    this.blitzCorrectCount = 0;
    this.isBlitzPhase = false;
    this.isAct3Showdown = false;
    this.isFinalWagerPhase = false;
    this.activeFinalWagerResolveHandler = null;
    this.activeMysteryChipsMult = 1.0;
    this.pendingNextTurnWheelMult = 1.0;
    this.activeSecretSquareBonusMult = 0;

    this.fiftyFiftyAvailableInMatch = true;
    this.audiencePollAvailableInMatch = true;
    this.usedLifelineInMatch = false;
    this.maxStreakInMatch = 0;
    this.crackedVaultOrSafeInMatch = false;
    this.bigWheelHighRollInMatch = false;
    this.dodgedGremlinInMatch = false;
    this.wonClutchTurn10InMatch = false;
    this.prunedChoiceIndicesInTurn = [];
    this.newlyScoutedWeakInMatch = [];
    this.newlyScoutedStrongInMatch = [];
    this.pendingDiscoveryBannerText = null;

    this.respectedAmberTruceInMatch = false;
    this.poachedAmberTruceInMatch = false;
    this.pocketedCanaryThisMatch = false;
    this.canaryPendingNextTurn = false;
    this.boothArrestsInMatch = 0;
    this.cleanBonusCashInMatch = 0;
    this.contrabandBonusCashInMatch = 0;
    this.claimedDomainsInMatch.clear();
    this.seenEntitiesInMatch = [];
    this.earnedTrophiesInMatch.clear();
    this.censorCharge01 = 0;
    this.censorShieldChargedThisMatch = false;
    this.ui.updateCensorPaddleProgress(0, false);
    this.ui.setSabotageWarningActive(false);
    this.boothTellActive = false;
    this.boothTellRemainingSec = 0;

    // Progressive UI Unlocks: Episode 1 & Daily Broadcast hide Prop Shop & Cheat/Mic buttons!
    const unlockProps =
      !dailyBroadcast && (this.isQuickPlay || effectiveBp.episodeNumber >= 2 || save.episodesPlayed >= 1);
    const unlockCheatAndMic =
      !dailyBroadcast && (this.isQuickPlay || effectiveBp.episodeNumber >= 2 || save.episodesPlayed >= 1);
    this.ui.setProgressiveUnlocks({
      showPropsButton: unlockProps,
      showCheatAndMicControls: unlockCheatAndMic,
      isQuickPlay: this.isQuickPlay,
      isDailyBroadcast: dailyBroadcast,
    });

    this.corpus.resetMatchCadence(this.activeMatchSeedOffset);

    // Warm season corpus shard in background
    void this.corpus.warmSeasonShards(effectiveBp.season);

    const rivalProfile = CAST_PROFILES_V7[effectiveBp.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    this.activeJuryBallot =
      !dailyBroadcast && effectiveBp.season === 4
        ? this.campaign.evaluateVipJuryBallot(effectiveBp.rivalId)
        : null;

    // Calibrate Rival expected match score fairly around uncapped Chips × Mult economy
    const juryEvBoost = this.activeJuryBallot?.rivalEvBonusRatio ?? 0;
    const seasonScale = 0.88 + (effectiveBp.season - 1) * 0.08;
    const turnsRatio = this.totalTurnsInCurrentMatch / TOTAL_TURNS_PER_MATCH;
    this.rivalExpectedMatchScore = Math.round(
      3100 * turnsRatio * (rivalProfile.baseAccuracy + juryEvBoost) * seasonScale,
    );

    this.mountStageAndBoardForBlueprint(
      effectiveBp,
      this.activeMatchSeedOffset,
      {
        playMode: combo.playMode,
        unlockTopology: combo.unlockTopology,
        isCampaignEp1,
      },
    );
    this.engine.setVipJuryState(
      Boolean(this.activeJuryBallot?.active),
      Boolean(this.activeJuryBallot?.active),
    );
    this.engine.setCardApertureOpen(false);
    this.focusCameraOnTile(null, 0);

    // Engage genre-honest 16-bar Showband stage music & episode chart variant
    this.audio.setCoupRegime(save.activeCoupRegime);
    this.audio.setBellamySpiteChop(false);
    this.audio.setTrapdoorBlitzActive(false);
    this.audio.setClueSanctuaryActive(false);
    this.setSongChartVariantSafe((effectiveBp.episodeNumber - 1) % 5);
    this.audio.setStageWorld(effectiveBp.stageId);

    if (gen !== this.matchGenerationId) return;

    this.ui.showTopBroadcastBug(true, false);
    this.syncTopBroadcastBug();

    const ruleBanner = this.board.getBoardModeRuleBanner();
    const notebook = this.getOrInitRivalNotebook(effectiveBp.rivalId);
    const stageSpec = STAGE_WORLD_SPECS_V7[effectiveBp.stageId];

    // Open Every Match With the ~3s Skippable 'In Living Color' Curtain-Raiser + Tale-of-the-Tape!
    if (!this.skipCurtainRaiserOnce) {
      this.triggerApplauseSign(2.4);
      await this.ui.playMatchCurtainRaiser({
        episodeCode: dailyBroadcast
          ? `DAILY #${this.activeDailyBlueprint?.dailyNumber ?? 1}`
          : effectiveBp.code,
        stageTitle: stageSpec.name,
        matchTitle: effectiveBp.title,
        rivalId: effectiveBp.rivalId,
        boardModeTitle: BOARD_MODE_RULE_BANNERS_V7[this.activePlayMode].modeTitle,
        boardRuleSummary: ruleBanner.ruleSummary,
        topologyBadge:
          this.activeUnlockTopology !== 'CLASSIC_OPEN'
            ? BOARD_UNLOCK_TOPOLOGY_SPECS_V7[this.activeUnlockTopology].badge
            : undefined,
        returningChampStreak: !quickPlay && !dailyBroadcast ? save.returningChampStreak ?? 0 : 0,
        scoutedWeak: notebook.revealedWeak,
        scoutedStrong: notebook.revealedStrong,
        traitRevealed: notebook.traitRevealed,
        playstyle: rivalProfile.playstyle ?? DEFAULT_RIVAL_PLAYSTYLE_V7[effectiveBp.rivalId],
        temperament: rivalProfile.temperament ?? DEFAULT_RIVAL_TEMPERAMENT_V7[effectiveBp.rivalId],
        quoteLine: effectiveBp.coldOpenLine.line,
      });
      if (this.disposed || gen !== this.matchGenerationId) return;
    }
    this.skipCurtainRaiserOnce = false;

    // Announce the active 1966 Board Gameplay Mode & Trigger Eye-Guess Memory Flash if applicable!
    this.ui.setBoardModeBanner(ruleBanner);
    this.instantBargainOfferedInMatch = false;
    this.announcer.resetForNewEpisode({
      blueprint: effectiveBp,
      rivalId: effectiveBp.rivalId,
      stageId: effectiveBp.stageId,
      isDailyBroadcast: dailyBroadcast,
      dailyEpisodeNumber: this.activeDailyBlueprint?.dailyNumber,
    });
    this.announcer.setPhase('BOARD_SELECT');
    if (ruleBanner.mode === 'EYE_GUESS_MEMORY') {
      this.board.triggerEyeGuessMemoryFlash(2.4);
      this.announcer.onBoardModeHighlight('EYE_GUESS_MEMORY', {
        blueprint: effectiveBp,
        rivalId: effectiveBp.rivalId,
      });
    } else if (ruleBanner.mode === 'BIG_WHEEL_SHOWCASE') {
      this.announcer.onBigWheelSpin({
        blueprint: effectiveBp,
        rivalId: effectiveBp.rivalId,
      });
    } else if (ruleBanner.mode === 'PRESS_YOUR_LUCK_GREMLIN') {
      this.announcer.onClassicTvTwist('PRESS_LUCK_SPIN', {
        blueprint: effectiveBp,
        rivalId: effectiveBp.rivalId,
      });
    } else if (this.isQuickPlay && ruleBanner.mode !== 'CLASSIC_TOTE') {
      this.announcer.onBoardModeHighlight(ruleBanner.mode, {
        blueprint: effectiveBp,
        rivalId: effectiveBp.rivalId,
      });
    } else {
      this.announcer.onEpisodeKickoff({
        blueprint: effectiveBp,
        rivalId: effectiveBp.rivalId,
        isDailyBroadcast: dailyBroadcast,
        dailyEpisodeNumber: this.activeDailyBlueprint?.dailyNumber,
      });
    }

    this.beginBoardSelectTurn();
  }

  private beginBoardSelectTurn(): void {
    this.phase = 'BOARD_SELECT';
    this.activeTileIndex = null;
    this.activeClue = null;
    this.ui.hideRivalTurnChyron();
    this.focusCameraOnTile(null, 0);

    // Sync turnNumber into BoardTwistsEngine so CLUTCH_SHARK & ROVING_SPOTLIGHT stay exact
    const twists = this.getLiveTwistsEngine();
    twists?.updateRuntimeMatchFlags({
      turnNumber: this.turnNumber,
      isAct3Showdown: this.isAct3Showdown,
    });
    this.syncBoardSpotlightBeams();

    // Safety guard: guarantee clickable unlocked 3D tiles are always available on every turn!
    const playableCount = this.board
      .getTiles()
      .filter(
        (t) =>
          (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR') &&
          !t.isVaultLocked &&
          !t.isTopologyLocked,
      ).length;
    if (playableCount === 0) {
      this.board.reRackFreshWave(2);
      if (this.isAct3Showdown) {
        twists?.applyAct3DoubleDollarsBoost(this.board.getTiles() as never);
        this.board.refreshAllTilePlaques();
      }
      this.syncBoardSpotlightBeams();
    }

    // Preview Rival's intended 3D tile with floating crimson OverheadCrosshair
    this.board.previewRivalIntent();

    // Check Stage 07 / Finale Bellamy Spite Chop when player leads by >= $300 in Round 3+
    const rivalProfile =
      CAST_PROFILES_V7[this.activeBlueprint.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const allowEpisode2Controls =
      !this.isDailyBroadcast &&
      (this.isQuickPlay ||
        this.activeBlueprint.episodeNumber >= 2 ||
        this.campaign.getState().episodesPlayed >= 1);
    const shouldSpiteChop =
      allowEpisode2Controls &&
      !this.censorShieldChargedThisMatch &&
      this.turnNumber >= 7 &&
      this.playerMatchScore - this.rivalMatchScore >= 300 &&
      (this.activeBlueprint.stageId === 'STAGE_07_1969_MONTE_CARLO_CASINO' ||
        this.activeBlueprint.isFinale ||
        rivalProfile.role === 'RIVAL_HEEL');
    this.audio.setBellamySpiteChop(shouldSpiteChop);
    this.ui.setSabotageWarningActive(shouldSpiteChop);

    // Trigger live Booth Cheat Tell on Heel Rivals in Ep 2+ so player can catch it!
    if (allowEpisode2Controls) {
      this.maybeTriggerBoothCheatTell();
    } else {
      this.clearBoothCheatTell();
    }

    // Keep side-rail hidden unless an active tell or sabotage is actually happening (fixes Tablet overlap!)
    this.ui.showTopBroadcastBug(true, this.boothTellActive || shouldSpiteChop);

    this.syncTopBroadcastBug();
  }

  private maybeTriggerBoothCheatTell(): void {
    const rival =
      CAST_PROFILES_V7[this.activeBlueprint.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const save = this.campaign.getState();
    const assist = evaluatePreTurnRelicHooksV7(
      { waiverPruneIdx: 0, domain: 'SCI_TECH' },
      this.turnNumber,
      save.waiver,
      save.equippedRelics,
    );
    const channel: CheatTellChannelV7 =
      rival.cheatChannel !== 'HONEST' ? rival.cheatChannel : 'SOLENOID_SPARK';
    const hasMatchingSpotterRelic = assist.spotsCheatChannels.includes(channel);
    const isTellTurn =
      (rival.cheatChannel !== 'HONEST' &&
        (this.turnNumber === 2 ||
          this.turnNumber === 5 ||
          this.turnNumber === 8 ||
          (hasMatchingSpotterRelic && (this.turnNumber === 4 || this.turnNumber === 6)))) ||
      (this.activeBlueprint.isFinale && (this.turnNumber === 3 || this.turnNumber === 7));

    if (!isTellTurn) {
      this.clearBoothCheatTell();
      return;
    }

    this.boothTellActive = true;
    this.boothTellChannel = channel;
    this.boothTellRemainingSec = hasMatchingSpotterRelic ? 12.0 : 8.0;
    this.boothTellSparkAccumSec = 0;

    if (channel === 'ROW_C_GLINT') {
      this.engine.triggerRowCGlint(true);
    } else if (channel === 'FRESNEL_LAMP') {
      this.engine.triggerFresnelTell(true);
    } else {
      const riggedTile =
        this.board.getTiles().find((t) => t.isRiggedSolenoid && t.state === 'OPEN') ??
        this.board.getTiles().find((t) => t.state === 'OPEN');
      if (riggedTile) {
        const wp = this.board.getTileWorldPosition(riggedTile.index);
        this.engine.triggerSolenoidSpark(wp, 34);
      }
    }

    this.audio.playCheatTell(channel);
    this.ui.setRivalEmotion('TELL');
    this.ui.setBoothTellActive(true);
  }

  private clearBoothCheatTell(): void {
    this.boothTellActive = false;
    this.boothTellChannel = null;
    this.boothTellRemainingSec = 0;
    this.engine.triggerRowCGlint(false);
    this.ui.setBoothTellActive(false);
  }

  private handleBoothArrest(): void {
    void this.unlockAudioAndSyncHub();
    if (this.phase !== 'BOARD_SELECT' && this.phase !== 'QUESTION_OPEN') return;

    if (this.boothTellActive) {
      this.clearBoothCheatTell();
      this.audio.playBoothArrestSiren();
      this.triggerApplauseSign(2.4);
      this.boothArrestsInMatch += 1;
      this.cpuTiltTurnsRemaining = 2;
      let toastMsg: string;
      if (this.isQuickPlay) {
        const hasSignet = this.campaign
          .getState()
          .equippedRelics.some((r) => r.relicId === 'relic_subpoena_wax_signet');
        const quickBonus = hasSignet ? 300 : 150;
        this.playerMatchScore += quickBonus;
        toastMsg = `BOOTH FEED INTERCEPTED! +$${quickBonus} MATCH BONUS!`;
      } else {
        // `recordLiveBoothArrest` credits `+$150` (`+$300` w/ Wax Signet) directly to `cleanPurseCash` —
        // do NOT also add to `playerMatchScore` (prevents banking twice at Ceremony!).
        const res = this.campaign.recordLiveBoothArrest(this.activeBlueprint.rivalId);
        this.earnedTrophiesInMatch.add('trophy_s1_08');
        toastMsg = `BOOTH FEED INTERCEPTED! +$${res.cleanBountyCash} CLEAN PURSE BANKED!`;
      }
      this.announcer.onBoothRiggingBusted({
        rivalId: this.activeBlueprint.rivalId,
      });
      this.ui.setRivalEmotion('BREAKDOWN');
      this.syncTopBroadcastBug('BREAKDOWN');
      this.ui.showLiveToast(toastMsg, 'emerald', 2600);
    } else {
      this.audio.playKnifeSwitch();
      this.ui.showLiveToast(
        'NO CHEAT ACTIVE — Press ONLY when Rival flashes LIVE TELL (+$150–$300 Clean Purse)!',
        'brass',
        2600,
      );
    }
  }

  private handleCensorPaddleHold(held: boolean): void {
    void this.unlockAudioAndSyncHub();
    this.censorHeld = held;
    if (!held) {
      this.audio.setCensorMicHold(false, this.censorCharge01);
    }
  }

  private computeMaxDifficultyForTurn(turn: number): DifficultyTierV7 {
    const diffMode = this.campaign.getState().settings.difficultyMode ?? 'PRIMETIME_NORMAL';
    if (diffMode === 'MATINEE_EASY') {
      return turn <= 4 ? 1 : turn <= 8 ? 2 : 3;
    }
    if (this.activeBlueprint.episodeNumber === 1 && turn <= 2) return 1;
    if (turn <= 3) return 2;
    if (turn <= 6) return 3;
    if (turn <= 8) return 4;
    return 5;
  }

  // --------------------------------------------------------------------------
  // 2 Classic Studio Lifelines (✂️ 50/50 Cut & 📊 Studio Audience Poll)
  // --------------------------------------------------------------------------

  private isAnswerLockingIn = false;
  private qaCardStyleOverride: NonNullable<ClueRecordV7['cardStyle']> | null = null;
  private prunedChoiceIndicesInTurn: number[] = [];
  private maxStreakInMatch = 0;
  private crackedVaultOrSafeInMatch = false;
  private bigWheelHighRollInMatch = false;
  private dodgedGremlinInMatch = false;
  private wonClutchTurn10InMatch = false;
  private usedLifelineInMatch = false;

  private activeCardStyleInTurn: NonNullable<ClueRecordV7['cardStyle']> | undefined = undefined;

  private handleUseFiftyFiftyLifeline(): void {
    const supportsFourChoices =
      this.activeToyId === 'TOY_01_KNIFE_SWITCH' ||
      this.activeToyId === 'TOY_02_CONFIDENCE_PNEUMATIC' ||
      this.activeToyId === 'TOY_06_FUSE_WIRE_SNIPPER' ||
      this.activeToyId === 'TOY_14_FOUR_SHUTTER_REEL';
    if (
      this.phase !== 'QUESTION_OPEN' ||
      this.isAnswerLockingIn ||
      this.remainingClueSec <= 0.25 ||
      !this.fiftyFiftyAvailableInMatch ||
      !this.activeClue ||
      !supportsFourChoices ||
      this.activeCardStyleInTurn === 'BINARY_SPLIT'
    ) {
      return;
    }
    this.fiftyFiftyAvailableInMatch = false;
    this.usedLifelineInMatch = true;
    this.ui.syncLifelineButtons(
      this.fiftyFiftyAvailableInMatch,
      this.audiencePollAvailableInMatch,
    );
    this.playLifelineSfx('FIFTY_FIFTY');

    const pruned = this.activeContraption?.applyFiftyFiftyPrune?.() ?? [];
    if (pruned.length > 0) {
      for (const pIdx of pruned) {
        if (!this.prunedChoiceIndicesInTurn.includes(pIdx)) {
          this.prunedChoiceIndicesInTurn.push(pIdx);
        }
      }
    } else {
      // Defensive DOM fallback if a custom choice view hasn't pruned 2 wrong buttons yet
      const clue = this.activeClue;
      const mount = this.ui.getToyMountElement();
      const wrongBtns = Array.from(
        mount.querySelectorAll<HTMLButtonElement>('button[data-choice-idx]'),
      ).filter((b) => Number(b.dataset.choiceIdx) !== clue.answerIdx && !b.disabled);
      for (const btn of wrongBtns.slice(0, 2)) {
        btn.disabled = true;
        btn.style.opacity = '0.38';
        const cIdx = Number(btn.dataset.choiceIdx);
        if (!Number.isNaN(cIdx) && !this.prunedChoiceIndicesInTurn.includes(cIdx)) {
          this.prunedChoiceIndicesInTurn.push(cIdx);
        }
      }
    }
    this.ui.showLiveToast('✂️ 50/50 STUDIO CUT — 2 DECOYS CLEARED!', 'emerald', 1900);
  }

  private handleUseAudiencePollLifeline(): void {
    if (
      this.phase !== 'QUESTION_OPEN' ||
      this.isAnswerLockingIn ||
      this.remainingClueSec <= 0.25 ||
      !this.audiencePollAvailableInMatch ||
      !this.activeClue
    ) {
      return;
    }
    this.audiencePollAvailableInMatch = false;
    this.usedLifelineInMatch = true;
    this.ui.syncLifelineButtons(
      this.fiftyFiftyAvailableInMatch,
      this.audiencePollAvailableInMatch,
    );
    this.playLifelineSfx('AUDIENCE_POLL');

    const clue = this.activeClue;
    const pcts = this.computeStudioAudiencePollPercentages(clue);
    this.activeContraption?.showAudiencePollOverlay?.(pcts);

    const hasOnPadPercentBars =
      this.activeToyId === 'TOY_01_KNIFE_SWITCH' ||
      this.activeToyId === 'TOY_02_CONFIDENCE_PNEUMATIC' ||
      this.activeToyId === 'TOY_06_FUSE_WIRE_SNIPPER' ||
      this.activeToyId === 'TOY_14_FOUR_SHUTTER_REEL';
    if (!hasOnPadPercentBars) {
      const summary = `📊 STUDIO CONSENSUS (${pcts[clue.answerIdx]}%): Lean toward “${clue.choices[clue.answerIdx].slice(0, 24)}”`;
      this.ui.setQuestionPollSummary(summary);
    }
  }

  private computeStudioAudiencePollPercentages(
    clue: ClueRecordV7,
  ): readonly [number, number, number, number] {
    const seed = (clue.qid * 73 + this.turnNumber * 19 + 11) % 9;
    const trueLead =
      clue.difficulty <= 2 ? 66 + seed : clue.difficulty === 3 ? 54 + seed : 45 + seed;
    const runnerUp = Math.min(34, Math.max(12, Math.round((100 - trueLead) * 0.48)));
    const third = Math.max(5, Math.round((100 - trueLead - runnerUp) * 0.56));
    const fourth = Math.max(2, 100 - trueLead - runnerUp - third);

    const raw: [number, number, number, number] = [0, 0, 0, 0];
    raw[clue.answerIdx] = trueLead;
    const trapIdx =
      clue.poisonedFixIdx !== clue.answerIdx
        ? clue.poisonedFixIdx
        : (((clue.answerIdx + 1) % 4) as 0 | 1 | 2 | 3);
    raw[trapIdx] = runnerUp;

    const restIndices = ([0, 1, 2, 3] as const).filter(
      (i) => i !== clue.answerIdx && i !== trapIdx,
    );
    raw[restIndices[0] ?? 0] = third;
    raw[restIndices[1] ?? 1] = fourth;

    // Zero out any choices already eliminated by 50/50 Cut or Fact-Checker so stem & pads match 100%!
    const prunedSet = new Set<number>(this.prunedChoiceIndicesInTurn);
    const activeIndices = ([0, 1, 2, 3] as const).filter((i) => !prunedSet.has(i));
    if (activeIndices.length > 0 && activeIndices.length < 4) {
      const activeSum = activeIndices.reduce<number>((acc, idx) => acc + Math.max(1, raw[idx]), 0);
      const norm: [number, number, number, number] = [0, 0, 0, 0];
      let allocated = 0;
      for (let k = 0; k < activeIndices.length; k++) {
        const idx = activeIndices[k];
        if (k === activeIndices.length - 1) {
          norm[idx] = Math.max(0, 100 - allocated);
        } else {
          const share = Math.round((Math.max(1, raw[idx]) / Math.max(1, activeSum)) * 100);
          norm[idx] = share;
          allocated += share;
        }
      }
      return norm;
    }
    return raw;
  }

  // --------------------------------------------------------------------------
  // Big Wheel & Press-Your-Luck Studio Gremlin Helpers
  // --------------------------------------------------------------------------

  private applyPlayerBigWheelResult(
    res: BigWheelSpinResultV7,
    screenPt?: { xPx: number; yPx: number },
    carryDoubleToNextTurn = false,
  ): void {
    if (res.cashValue >= 500 || res.kind === 'DOUBLE') {
      this.bigWheelHighRollInMatch = true;
    }
    switch (res.kind) {
      case 'CASH': {
        this.playerMatchScore = Math.max(0, this.playerMatchScore + res.cashValue);
        this.vfx.burstLivingColorConfetti('MEDIUM', screenPt);
        this.triggerApplauseSign(2.4);
        break;
      }
      case 'DOUBLE': {
        const factor = Math.max(2.0, 1 + res.multBonus);
        if (carryDoubleToNextTurn) {
          this.pendingNextTurnWheelMult = Math.min(4.0, this.pendingNextTurnWheelMult * factor);
          this.ui.showLiveToast('🎡 2× DOUBLE DOLLARS ARMED FOR YOUR NEXT CLUE!', 'emerald', 2200);
        } else {
          this.activeMysteryChipsMult = Math.min(4.0, this.activeMysteryChipsMult * factor);
        }
        this.vfx.burstLivingColorConfetti('MEDIUM', screenPt);
        break;
      }
      case 'STEAL': {
        const amt = Math.max(150, Math.abs(res.cashValue) || 250);
        const swiped = Math.min(this.rivalMatchScore, amt);
        this.playerMatchScore += swiped;
        this.rivalMatchScore = Math.max(0, this.rivalMatchScore - swiped);
        this.cpuTiltTurnsRemaining = 2;
        this.vfx.burstLivingColorConfetti('MEDIUM', screenPt);
        break;
      }
      case 'LIFELINE': {
        if (!this.fiftyFiftyAvailableInMatch) {
          this.fiftyFiftyAvailableInMatch = true;
        } else if (!this.audiencePollAvailableInMatch) {
          this.audiencePollAvailableInMatch = true;
        } else {
          this.playerMatchScore += 200;
        }
        break;
      }
      case 'GREMLIN': {
        const loss = Math.round((this.playerMatchScore * 0.25) / 25) * 25;
        this.playerMatchScore = Math.max(0, this.playerMatchScore - loss);
        break;
      }
    }
    this.syncTopBroadcastBug();
  }

  private async runCpuPassedOrEarnedGremlinSpins(
    spinsCount: number,
    gen: number,
    allowPassBackToPlayer = true,
  ): Promise<void> {
    if (spinsCount <= 0) return;
    const rivalProfile =
      CAST_PROFILES_V7[this.activeBlueprint.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const cpuRes = await this.twistTheater.playPressYourLuckGremlinBoard({
      spinsEarned: spinsCount,
      playerCash: this.rivalMatchScore,
      rivalName: rivalProfile.name,
      autoCpuMode: true,
      seed: (this.activeMatchSeedOffset + this.turnNumber * 47 + spinsCount) >>> 0,
      onBounceTick: () => this.audio.playSplitFlapTick(),
      onGremlinZonk: () => this.playGremlinZonkSfx(),
    });
    if (this.disposed || gen !== this.matchGenerationId) return;

    if (cpuRes.hitGremlin) {
      // -40% CPU Studio Gremlin blowup!
      this.rivalMatchScore = Math.max(0, this.rivalMatchScore + cpuRes.netCashDelta);
      this.cpuTiltTurnsRemaining = 2;
      this.cpuStreak = 0;
      this.triggerApplauseSign(2.4);
      this.announcer.onGremlinZonk({
        rivalId: this.activeBlueprint.rivalId,
        rivalName: rivalProfile.name,
        victim: 'RIVAL',
      });
      this.syncTopBroadcastBug('BREAKDOWN');
      this.ui.showLiveToast(
        `⚡ STUDIO GREMLIN ZAPPED ${rivalProfile.name.toUpperCase()} (${cpuRes.netCashDelta < 0 ? `-$${Math.abs(cpuRes.netCashDelta)}` : '-40%'})!`,
        'emerald',
        2400,
      );
      return;
    }

    if (cpuRes.netCashDelta !== 0 || cpuRes.rivalCashDelta !== 0) {
      this.rivalMatchScore = Math.max(0, this.rivalMatchScore + cpuRes.netCashDelta);
      if (cpuRes.rivalCashDelta !== 0) {
        this.playerMatchScore = Math.max(0, this.playerMatchScore + cpuRes.rivalCashDelta);
      }
      this.syncTopBroadcastBug();
    }

    // If the CPU passed remaining live spins back to the Player, play them out on the Player!
    if (cpuRes.passedSpinsToRival > 0 && allowPassBackToPlayer) {
      this.ui.showLiveToast(
        `⚡ ${rivalProfile.name.toUpperCase()} PASSED ${cpuRes.passedSpinsToRival} LIVE SPIN${cpuRes.passedSpinsToRival > 1 ? 'S' : ''} TO YOU!`,
        'crimson',
        2200,
      );
      const passBackRes = await this.twistTheater.playPressYourLuckGremlinBoard({
        spinsEarned: cpuRes.passedSpinsToRival,
        playerCash: this.playerMatchScore,
        rivalName: rivalProfile.name,
        seed: (this.activeMatchSeedOffset + this.turnNumber * 89 + 19) >>> 0,
        onBounceTick: () => this.audio.playSplitFlapTick(),
        onGremlinZonk: () => this.playGremlinZonkSfx(),
      });
      if (this.disposed || gen !== this.matchGenerationId) return;
      this.playerMatchScore = Math.max(0, this.playerMatchScore + passBackRes.netCashDelta);
      if (passBackRes.rivalCashDelta !== 0) {
        this.rivalMatchScore = Math.max(0, this.rivalMatchScore + passBackRes.rivalCashDelta);
      }
      if (!passBackRes.hitGremlin && passBackRes.netCashDelta > 0) {
        this.dodgedGremlinInMatch = true;
      }
      this.syncTopBroadcastBug();
    }
  }

  // --------------------------------------------------------------------------
  // Direct 3D Tile Selection -> Twists -> Question -> High-Contrast Solari -> Rival
  // --------------------------------------------------------------------------

  public async selectBoardTile(
    tileIndex: number,
    preferredToyOverride?: ToyIdV7,
  ): Promise<void> {
    if (this.phase !== 'BOARD_SELECT') return;
    let tile = this.board.getTile(tileIndex);
    if (!tile || (tile.state !== 'OPEN' && tile.state !== 'BLITZ_SURVIVOR')) return;

    const gen = this.matchGenerationId;
    const screenPt = this.getTileScreenCoordinates(tileIndex);

    // 1a. Check 🔒 LOCKED_VAULT padlock before consuming turn!
    if (tile.isVaultLocked && !preferredToyOverride) {
      this.board.triggerLockedVaultFeedback(tileIndex);
      this.audio.playDialDetent();
      this.vfx.spawnFloatingScorePop(
        screenPt.xPx,
        screenPt.yPx,
        '🔒 VAULT LOCKED',
        'WIN ADJACENT TILE OR 2-STREAK',
        'GOLD',
      );
      return;
    }

    // 1b. Check Topology Lock (`PYRAMID_CLIMB`, `KEY_AND_SAFE`, `CENTER_STARBURST`, `ROVING_SPOTLIGHT`)!
    if (tile.isTopologyLocked && !preferredToyOverride) {
      this.board.triggerLockedVaultFeedback(tileIndex);
      this.audio.playDialDetent();
      const topoMsg =
        this.activeUnlockTopology === 'KEY_AND_SAFE'
          ? 'WIN A 🗝️ BRASS KEY SQUARE FIRST!'
          : this.activeUnlockTopology === 'PYRAMID_CLIMB'
            ? 'WIN AN ADJACENT LOWER TIER SQUARE!'
            : this.activeUnlockTopology === 'CENTER_STARBURST'
              ? 'WIN AN ADJACENT CENTER HUB SQUARE!'
              : 'WAIT FOR THE 🔦 ROVING SPOTLIGHT!';
      this.vfx.spawnFloatingScorePop(
        screenPt.xPx,
        screenPt.yPx,
        '🔒 TIER SHUTTERED',
        topoMsg,
        'GOLD',
      );
      return;
    }

    this.phase = 'QUESTION_OPEN';
    this.isAnswerLockingIn = false;
    this.announcer.setPhase('QUESTION_OPEN');
    this.ui.setBoardModeBanner(null);
    this.activeTileIndex = tileIndex;
    this.activeMysteryChipsMult = this.pendingNextTurnWheelMult;
    this.pendingNextTurnWheelMult = 1.0;
    this.activeSecretSquareBonusMult = 0;
    this.pendingDiscoveryBannerText = null;
    this.playedRevealOnPadThisTurn = false;
    this.board.setHoveredTile(null);
    this.board.triggerTileDetentPress(tileIndex);
    this.playTileSelectFlipSfx();
    this.focusCameraOnTile(tileIndex, 0.045);

    // 2a. Unseal `$600 · ???` BLIND_CATEGORY or `CAT · $???` MYSTERY_CASH shutter on tap!
    const twists = this.getLiveTwistsEngine();
    const unsealed = twists?.revealBlindOrMysteryTile(
      tileIndex,
      this.board.getTiles() as never,
    );
    if (unsealed?.wasBlindCategory || unsealed?.wasMysteryCash) {
      this.board.triggerTrilonFlip(tileIndex, 0, 0.42);
      this.board.refreshAllTilePlaques();
      tile = this.board.getTile(tileIndex) ?? tile;
      this.announcer.onClassicTvTwist(
        unsealed.wasBlindCategory ? 'BLIND_CATEGORY' : 'MYSTERY_CASH',
        {
          rivalId: this.activeBlueprint.rivalId,
          category: tile.category,
        },
      );
    }

    // 2b. Check ⭐ SECRET_SQUARE (Hidden 1966 Daily Double!)
    const secretReveal = this.board.revealSecretSquare(tileIndex);
    if (secretReveal.wasSecretSquare) {
      this.activeSecretSquareBonusMult = secretReveal.multBonus;
      const maybeSecSfx = (
        this.audio as unknown as { playSecretSquareFanfare?: () => void }
      ).playSecretSquareFanfare;
      if (typeof maybeSecSfx === 'function') {
        maybeSecSfx.call(this.audio);
      } else {
        this.audio.playTrophyUnlockChime();
      }
      this.triggerApplauseSign(2.4);
      this.vfx.burstLivingColorConfetti('MEDIUM', screenPt);
      this.vfx.flashStudioAudienceBulbs({ count: 14, durationMs: 900 });
      this.announcer.onSecretSquareDiscovery({
        rivalId: this.activeBlueprint.rivalId,
        category: tile.category,
      });
      if (!preferredToyOverride) {
        await this.twistTheater.flashSecretSquareBanner(secretReveal.headline);
        if (this.disposed || gen !== this.matchGenerationId) return;
      }
    }

    // 3a. Check 🎡 BIG_WHEEL_SPIN (Flickable 20-Wedge 1966 Studio Big Wheel!)
    if (tile.tvTwist === 'BIG_WHEEL_SPIN' && !preferredToyOverride) {
      this.announcer.onBigWheelSpin({
        rivalId: this.activeBlueprint.rivalId,
        category: tile.category,
      });
      const wheelRes = await this.twistTheater.playBigWheelSpin({
        seed: (this.activeMatchSeedOffset + this.turnNumber * 31 + tileIndex) >>> 0,
        onPegTick: (s) => this.playBigWheelPegTickSfx(s),
      });
      if (this.disposed || gen !== this.matchGenerationId) return;
      if (wheelRes.kind === 'GREMLIN') {
        this.announcer.onGremlinZonk({
          rivalId: this.activeBlueprint.rivalId,
          victim: 'PLAYER',
        });
      } else if (wheelRes.cashValue >= 750 || wheelRes.kind === 'DOUBLE') {
        this.announcer.onBigWheelSpin({
          rivalId: this.activeBlueprint.rivalId,
          isJackpot: true,
        });
      }
      this.applyPlayerBigWheelResult(wheelRes, screenPt, false);
      tile = this.board.getTile(tileIndex) ?? tile;
    }

    // 3b. Check ❓ MYSTERY_CURTAIN (Interactive 3-Door Let's Make a Deal Stage Pick!)
    if (tile.tvTwist === 'MYSTERY_CURTAIN' && !preferredToyOverride) {
      const doorsPreview = this.board.previewMysteryCurtainDoors(tileIndex);
      this.announcer.onClassicTvTwist('MYSTERY_CURTAIN', {
        rivalId: this.activeBlueprint.rivalId,
        category: tile.category,
      });
      const chosenCurtainNum = await this.twistTheater.playMysteryCurtainDoorPick(doorsPreview);
      if (this.disposed || gen !== this.matchGenerationId) return;

      const curtain = this.board.rollMysteryCurtainOutcome(tileIndex, chosenCurtainNum);
      // Note: `BoardTwistsEngineV7.evaluateTileModifiers` ALREADY applies `2x` on `DOUBLE_CHIPS` —
      // never multiply `activeMysteryChipsMult` a second time!
      if (curtain.kind === 'STEAL_FROM_RIVAL') {
        const swiped = Math.min(this.rivalMatchScore, Math.abs(curtain.rivalCashDelta));
        this.playerMatchScore = Math.max(0, this.playerMatchScore + swiped);
        this.rivalMatchScore = Math.max(0, this.rivalMatchScore - swiped);
        this.cpuTiltTurnsRemaining = 2;
        this.syncTopBroadcastBug();
      } else if (curtain.instantCashDelta !== 0 || curtain.rivalCashDelta !== 0) {
        this.playerMatchScore = Math.max(0, this.playerMatchScore + curtain.instantCashDelta);
        this.rivalMatchScore = Math.max(0, this.rivalMatchScore + curtain.rivalCashDelta);
        this.syncTopBroadcastBug();
      }
      this.vfx.burstLivingColorConfetti('MEDIUM', screenPt);
      tile = this.board.getTile(tileIndex) ?? tile;
    } else if (tile.tvTwist === 'OPPONENT_CHOICE') {
      this.announcer.onClassicTvTwist('OPPONENT_CHOICE', {
        rivalId: this.activeBlueprint.rivalId,
        category: tile.category,
      });
    }

    const save = this.campaign.getState();
    const maxDifficulty = this.computeMaxDifficultyForTurn(this.turnNumber);
    const isShowcaseTile = tile.tvTwist === 'SHOWCASE_BONUS';
    const dailyTurnSeed =
      this.isDailyBroadcast && this.activeDailyBlueprint
        ? getDeterministicDailyTurnSeedV7(this.activeDailyBlueprint.dateIso, this.turnNumber)
        : undefined;

    const draw = this.corpus.drawClueForTurn({
      category: tile.category,
      maxDifficulty,
      preferredToyId: preferredToyOverride,
      forceClassicFourChoice: !preferredToyOverride && !isShowcaseTile,
      forceShowcaseBonus: !preferredToyOverride && isShowcaseTile,
      deterministicSeed: dailyTurnSeed,
      ignoreSeenLedger: this.isDailyBroadcast,
      isBlitz: this.isBlitzPhase,
      recentEntities: this.isDailyBroadcast
        ? this.seenEntitiesInMatch
        : [...save.recentEntityKeys, ...this.seenEntitiesInMatch],
    });

    this.activeClue = draw.clue;
    this.activeToyId = draw.selectedToy;
    this.seenEntitiesInMatch.push(draw.clue.canonicalEntityKey);

    // Generous 1966 Broadcast Clock: 32s standard, 36s on Special Showcase props, 20s in Blitz!
    const isShowcaseSelected = draw.selectedToy !== 'TOY_01_KNIFE_SWITCH';
    const baseSec = this.isBlitzPhase ? 20 : isShowcaseSelected ? 36 : 32;
    const spiteFactor = this.audio.isBellamySpiteChopActive() ? 0.85 : 1.0;
    const totalSec = Math.max(15, Math.round(baseSec * spiteFactor));
    this.remainingClueSec = totalSec;
    this.lastTickedWholeSec = 99;
    this.clueOpenedAtMs = performance.now();

    // Check Close Turn-10 Match-Point Callout ('THIS CLUE FOR THE SHOW!') & Clutch Lock-In Suspense!
    const scoreGap = Math.abs(this.playerMatchScore - this.rivalMatchScore);
    const isMatchPointTurn =
      this.turnNumber === this.totalTurnsInCurrentMatch && scoreGap <= 950;
    const isClutchMoment =
      isMatchPointTurn ||
      (this.turnNumber >= 8 && scoreGap <= 650) ||
      tile.tvTwist === 'LOCKED_VAULT' ||
      secretReveal.wasSecretSquare ||
      tile.baseChips >= 500;

    if (isMatchPointTurn) {
      this.playBandReactionSafe('CLUTCH_POINT');
    }

    // Gate Episode 2+ Waiver Perks & Daily Clean-Room Relics BEFORE computing preview stakes & pre-turn hooks!
    const allowEpisode2WaiverPerks =
      !this.isDailyBroadcast &&
      (this.isQuickPlay ||
        this.activeBlueprint.episodeNumber >= 2 ||
        save.episodesPlayed >= 1);
    const effectiveWaiver = allowEpisode2WaiverPerks ? save.waiver : null;
    const effectiveRelics = this.isDailyBroadcast ? [] : save.equippedRelics;
    const preTurnAssist = evaluatePreTurnRelicHooksV7(
      draw.clue,
      this.turnNumber,
      effectiveWaiver,
      effectiveRelics,
    );

    // Engage Split-Uniform -55% Stage Dimming & -7.5dB Clue Sanctuary (Merv Griffin "Think!" bed)
    this.engine.setCardApertureOpen(true);
    this.audio.setClueSanctuaryActive(true);
    this.ui.showTopBroadcastBug(true, this.boothTellActive);

    let displayClue: ClueRecordV7 = draw.clue;
    if (draw.selectedToy === 'TOY_07_MAIL_SORTER' && draw.clue.sorter) {
      displayClue = {
        ...draw.clue,
        stem: `Studio Mailroom Sort — Route each slip into “${draw.clue.sorter.chuteALabel}” or “${draw.clue.sorter.chuteBLabel}.”`,
      };
    } else if (draw.selectedToy === 'TOY_08_CHRONOLOGY_RAIL' && draw.clue.chronology) {
      displayClue = {
        ...draw.clue,
        stem: `Time-Line Showcase — Place these ${draw.clue.chronology.events.length} milestones in order from earliest to latest.`,
      };
    }

    // Exact 1:1 Question Header Stakes & Multiplier Preview (matches `resolvePlayerTurn` 100%!)
    const openTwistBreakdown = twists?.evaluateTileModifiers(
      tile,
      this.board.getTiles() as never,
    );
    const boardShownChips = openTwistBreakdown
      ? Math.max(150, Math.round(openTwistBreakdown.effectiveChips / 50) * 50)
      : tile.baseChips;
    const baseChipsForPreview = Math.max(
      150,
      Math.round((boardShownChips * this.activeMysteryChipsMult) / 25) * 25,
    );
    const effectiveAmberTruce = openTwistBreakdown
      ? openTwistBreakdown.respectedAmberTruce
      : tile.hasAmberTruce;
    const effectiveWheelhouse = openTwistBreakdown
      ? openTwistBreakdown.hitRivalWheelhouse
      : tile.isWheelhouse;
    const dedupedOpenBoardMult = openTwistBreakdown
      ? Math.max(
          0,
          openTwistBreakdown.rawMultBonus -
            (openTwistBreakdown.respectedAmberTruce ? 0.35 : 0) -
            (openTwistBreakdown.hitRivalWheelhouse ? 0.5 : 0) -
            (tile.hasUhfHalo ? 0.2 : 0),
        )
      : Math.max(0, tile.boardMultBonus);
    const rivalProfileForPreview =
      CAST_PROFILES_V7[this.activeBlueprint.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;

    const previewEconomy = evaluateTurnEconomyV7({
      tile: {
        baseChips: baseChipsForPreview,
        boardMultBonus: dedupedOpenBoardMult,
        category: tile.category,
        domain: tile.domain,
        hasAmberTruce: effectiveAmberTruce,
        hasUhfHalo: tile.hasUhfHalo,
        isRiggedSolenoid: tile.isRiggedSolenoid,
        isRivalTarget: tile.isRivalTarget,
        isWheelhouse: effectiveWheelhouse,
      },
      clue: draw.clue,
      resolution: {
        isCorrect: true,
        accuracyRatio: 1,
        chipMultiplier: 1,
        chosenSummary: '',
        trueAnswerDisplay: '',
        triggeredKlaxon: false,
        fellForPoisonedFix: false,
      },
      turnNumber: this.turnNumber,
      answerTimeSec: 12,
      currentStreak: this.currentStreak,
      playerMatchScore: this.playerMatchScore,
      rivalMatchScore: this.rivalMatchScore,
      rivalExpectedMatchScore: this.rivalExpectedMatchScore,
      rivalRole: rivalProfileForPreview.role,
      waiver: effectiveWaiver,
      equippedRelics: effectiveRelics,
      activeCoupRegime: save.activeCoupRegime,
      contrabandTrunkCash: save.contrabandTrunkCash,
      grudgeBountyPool: save.grudgeBountyPool,
      claimedDomainsThisMatch: Array.from(this.claimedDomainsInMatch),
      correctCountBeforeTurn: this.correctCountInMatch,
      pocketedCanaryThisMatch: this.pocketedCanaryThisMatch,
      activeCanaryTurn: this.canaryPendingNextTurn,
      boothArrestsThisMatch: this.boothArrestsInMatch,
      juryBoonChips: this.activeJuryBallot?.boonChipsPerTurn ?? 0,
      juryBaneMultPenalty: this.activeJuryBallot?.baneMultPenalty ?? 0,
      isFinale: this.activeBlueprint.isFinale,
      allowFinaleJackpot: this.turnNumber >= this.totalTurnsInCurrentMatch - 1,
    });
    const effectiveDisplayChips = previewEconomy.totalChips;
    const liveMultPreview = previewEconomy.totalMult;

    const activeTwistBadge = secretReveal.wasSecretSquare
      ? 'SECRET_SQUARE'
      : tile.tvTwist ?? 'NONE';
    const effectiveCardStyle =
      this.qaCardStyleOverride ?? draw.selectedCardStyle ?? draw.clue.cardStyle;
    this.qaCardStyleOverride = null;
    this.activeCardStyleInTurn = effectiveCardStyle;

    const supportsFourChoiceLifelines =
      draw.selectedToy === 'TOY_01_KNIFE_SWITCH' ||
      draw.selectedToy === 'TOY_02_CONFIDENCE_PNEUMATIC' ||
      draw.selectedToy === 'TOY_06_FUSE_WIRE_SNIPPER' ||
      draw.selectedToy === 'TOY_14_FOUR_SHUTTER_REEL';
    const allowFiftyFiftyOnCard =
      supportsFourChoiceLifelines && effectiveCardStyle !== 'BINARY_SPLIT';

    const toyMeta = TOY_CONTRAPTION_META_V7[draw.selectedToy];
    const rivalNameForHost = rivalProfileForPreview.name;
    const hostIntro = this.resolveHostQuestionIntro({
      category: displayClue.category,
      cashValue: effectiveDisplayChips,
      actNumber: this.getCurrentBroadcastAct(),
      twistLabel:
        activeTwistBadge !== 'NONE'
          ? activeTwistBadge.replace(/_/g, ' ')
          : isShowcaseSelected
            ? toyMeta?.name
            : undefined,
      isClutch: isClutchMoment,
      rivalName: rivalNameForHost,
      seed: draw.clue.qid + this.turnNumber * 17,
    });

    this.disposeActiveContraption();
    this.vfx.clearTransientPopups();
    const toyMountEl = this.ui.openQuestionChassis({
      clue: displayClue,
      baseChips: effectiveDisplayChips,
      liveMultPreview,
      countdownSeconds: totalSec,
      totalCountdownSeconds: totalSec,
      isWheelhouse: effectiveWheelhouse,
      hasAmberTruce: effectiveAmberTruce,
      tvTwist: activeTwistBadge,
      isShowcaseFormat: isShowcaseSelected,
      showcaseFormatName: isShowcaseSelected ? toyMeta?.name : undefined,
      fiftyFiftyAvailable: this.fiftyFiftyAvailableInMatch && allowFiftyFiftyOnCard,
      audiencePollAvailable: this.audiencePollAvailableInMatch,
      onUseFiftyFifty: allowFiftyFiftyOnCard
        ? () => this.handleUseFiftyFiftyLifeline()
        : undefined,
      onUseAudiencePoll: supportsFourChoiceLifelines
        ? () => this.handleUseAudiencePollLifeline()
        : undefined,
      isMatchPointTurn,
      isAct3Showdown: this.isAct3Showdown,
      hostIntroLine: hostIntro.hostLine,
      hostMood: hostIntro.mood,
    });

    if (preTurnAssist.showExactRivalEv) {
      const cpuPlaystyle =
        rivalProfileForPreview.playstyle ??
        DEFAULT_RIVAL_PLAYSTYLE_V7[this.activeBlueprint.rivalId] ??
        'PROFESSOR';
      const cpuTemperament =
        rivalProfileForPreview.temperament ??
        DEFAULT_RIVAL_TEMPERAMENT_V7[this.activeBlueprint.rivalId] ??
        'STEADY';
      const cpuOdds = evaluateCpuTurnOutcomeV7({
        baseAccuracy: rivalProfileForPreview.baseAccuracy,
        difficultyMode: save.settings.difficultyMode ?? 'PRIMETIME_NORMAL',
        playstyle: cpuPlaystyle,
        temperament: cpuTemperament,
        isWeakCategory: rivalProfileForPreview.weakCategories.includes(tile.category),
        isStrongCategory: rivalProfileForPreview.strongCategories.includes(tile.category),
        isBlindCategory: false,
        tvTwist: activeTwistBadge,
        turnNumber: this.turnNumber,
        cpuStreak: this.cpuStreak,
        cpuTiltTurnsRemaining: this.cpuTiltTurnsRemaining,
        boothRattled:
          this.boothArrestsInMatch > 0 && rivalProfileForPreview.role === 'RIVAL_HEEL',
        deterministicRoll01: 0.5,
      });
      const hitPct = Math.round(cpuOdds.hitThreshold * 100);
      const evCash = Math.round((baseChipsForPreview * cpuOdds.hitThreshold) / 25) * 25;
      this.ui.setQuestionPollSummary(`RIVAL ODDS ${hitPct}% · EV +$${evCash}`);
    }

    // Track which choice pad (A/B/C/D) was clicked so Grant Bellamy calls it out on lock-in,
    // and clean up listeners inside `disposeActiveContraption`!
    let pendingChoiceLabel = isShowcaseSelected ? 'Your showcase call' : 'Your answer';
    const captureClickedChoice = (ev: Event): void => {
      const btn = (ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-choice-idx]');
      if (btn && btn.dataset.choiceIdx !== undefined) {
        const idx = Number(btn.dataset.choiceIdx);
        const letter = ['Choice A', 'Choice B', 'Choice C', 'Choice D'][idx];
        if (letter) pendingChoiceLabel = letter;
      }
    };
    toyMountEl.addEventListener('pointerdown', captureClickedChoice, true);
    toyMountEl.addEventListener('click', captureClickedChoice, true);
    this.detachToyChoiceCapture = () => {
      toyMountEl.removeEventListener('pointerdown', captureClickedChoice, true);
      toyMountEl.removeEventListener('click', captureClickedChoice, true);
    };

    // Determine diegetic metadata overlays ([VOID], Canary Grease-Pencil Tick, UV [POISONED FIX])
    const pruneActive = preTurnAssist.autoPruneChoiceIdx !== null;
    this.prunedChoiceIndicesInTurn =
      preTurnAssist.autoPruneChoiceIdx !== null ? [preTurnAssist.autoPruneChoiceIdx] : [];

    let canaryTickIdx: number | null = null;
    if (this.canaryPendingNextTurn) {
      canaryTickIdx = this.activeBlueprint.canaryIsPoisoned
        ? draw.clue.poisonedFixIdx
        : draw.clue.answerIdx;
    }

    const stageSpec = STAGE_WORLD_SPECS_V7[this.activeBlueprint.stageId];
    this.activeContraption = mountTactileContraptionV7(
      toyMountEl,
      draw.clue,
      draw.selectedToy,
      {
        pruneActive,
        canaryTickIdx,
        uvLoupeActive: this.canaryPendingNextTurn && preTurnAssist.exposesPoisonedCanaryInk,
        hasPatentCyanotypeTube: preTurnAssist.highlightCyanotypeChamfer,
        equippedRelicIds: effectiveRelics.map((r) => r.relicId),
        dayJob: effectiveWaiver?.dayJob ?? null,
        cardStyle: effectiveCardStyle,
        isClutchMoment,
        reducedMotion: save.settings.reducedMotion,
        highContrastBadges: save.settings.highContrastBadges,
        brassAccentHex: stageSpec.trimAccentHex,
        onTactileSfx: (ev) => this.playContraptionSfx(ev),
        onLockInStart: (clutch) => {
          this.isAnswerLockingIn = true;
          this.ui.syncLifelineButtons(false, false);
          this.ui.updateQuestionHostLine(
            this.resolveHostLockInQuip(
              pendingChoiceLabel,
              clutch,
              draw.clue.qid + this.turnNumber * 31,
            ),
            clutch ? 'INTENSE' : 'WINK',
            true,
          );
          this.playAnswerLockInAudio(clutch);
        },
        onRevealFlash: (isCorrect) => {
          this.playedRevealOnPadThisTurn = true;
          this.audio.playAnswerReveal(isCorrect, false);
        },
      },
      (resolution) => {
        void this.resolvePlayerTurn(resolution);
      },
    );
  }

  private playContraptionSfx(ev: TactileSfxEventV7): void {
    switch (ev) {
      case 'TICK':
        this.audio.playTileHover();
        break;
      case 'DETENT':
      case 'SHUTTER_CLACK':
        this.audio.playDialDetent();
        break;
      case 'THROW_SNAP':
      case 'IRIS_FLASH':
        this.audio.playKnifeSwitch();
        break;
      case 'PNEUMATIC_THUNK':
      case 'CHUTE_SWOOSH':
        this.audio.playPneumaticWhoosh(true);
        break;
      case 'WIRE_SNIP':
        this.audio.playWireSnip();
        break;
      case 'PIN_PLANT':
      case 'TWINE_TAUT':
        this.audio.playTileSelect();
        break;
    }
  }

  private async resolvePlayerTurn(resolution: ToyResolutionV7): Promise<void> {
    if (this.phase !== 'QUESTION_OPEN') return;
    const gen = this.matchGenerationId;
    const tileIdx = this.activeTileIndex;
    const clue = this.activeClue;
    if (tileIdx === null || !clue) return;

    this.phase = 'POST_ANSWER_THEATER';
    this.announcer.setPhase('POST_ANSWER_THEATER');
    const answerTimeSec = Math.max(0.2, (performance.now() - this.clueOpenedAtMs) * 0.001);
    const activeCanaryTurn = this.canaryPendingNextTurn;
    this.canaryPendingNextTurn = false;
    const prevPlayerScore = this.playerMatchScore;

    this.disposeActiveContraption();
    this.engine.setCardApertureOpen(false);
    this.audio.setClueSanctuaryActive(false);

    const liveTileRef = this.board.getTile(tileIdx);
    if (!liveTileRef) return;

    // Snapshot pre-claim tile flags BEFORE `claimPlayerTile` clears `isRivalTarget`, `isRiggedSolenoid`,
    // and `hasAmberTruce` so `relic_amber_chalk_holder`, `relic_row_c_opera_monocle`, and `relic_toby_copper_shunt` fire 100%!
    const preClaimTile = {
      category: liveTileRef.category,
      domain: liveTileRef.domain,
      tvTwist: liveTileRef.tvTwist,
      baseChips: liveTileRef.baseChips,
      hasAmberTruce: liveTileRef.hasAmberTruce,
      hasUhfHalo: liveTileRef.hasUhfHalo,
      isRiggedSolenoid: liveTileRef.isRiggedSolenoid,
      isRivalTarget: liveTileRef.isRivalTarget,
      keyholderProtectedTurns: liveTileRef.keyholderProtectedTurns ?? 0,
    };

    const save = this.campaign.getState();
    const allowEpisode2WaiverPerks =
      !this.isDailyBroadcast &&
      (this.isQuickPlay ||
        this.activeBlueprint.episodeNumber >= 2 ||
        save.episodesPlayed >= 1);
    const effectiveWaiver = allowEpisode2WaiverPerks ? save.waiver : null;
    const effectiveRelics = this.isDailyBroadcast ? [] : save.equippedRelics;
    const hasCaliper = effectiveRelics.some((r) => r.relicId === 'relic_brass_vernier_caliper');
    const prelimEffAcc =
      resolution.accuracyRatio > 0 && resolution.accuracyRatio < 1 && hasCaliper
        ? Math.min(1, resolution.accuracyRatio + 0.15)
        : resolution.accuracyRatio;

    // Evaluate live 16-twist board claim & 8-Board-Gameplay-Mode bonus BEFORE `evaluateTurnEconomyV7`
    // so `modeBonus.multAdd` (e.g. `EYE_GUESS` `DOUBLE_2X` `+1.0x`) feeds directly into `totalMult`!
    const prelimScored = resolution.isCorrect || prelimEffAcc >= 0.35;
    const twistBreakdown = this.board.claimPlayerTile(tileIdx, prelimScored);
    if (twistBreakdown.respectedAmberTruce) {
      this.respectedAmberTruceInMatch = true;
    }
    if (twistBreakdown.poachedAmberTruce) {
      this.poachedAmberTruceInMatch = true;
    }

    const modeBonus = this.board.evaluateBoardModePostClaim(tileIdx, prelimScored);
    const rivalProfile =
      CAST_PROFILES_V7[this.activeBlueprint.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;

    // Exact 1:1 Math Reconciliation (Zero Double-Counting of Secret Square, Opponent Choice, Wheelhouse, or UHF!):
    const boardShownChipsForTurn = Math.max(
      150,
      Math.round(twistBreakdown.effectiveChips / 50) * 50,
    );
    const baseChipsForEconomy = Math.max(
      150,
      Math.round((boardShownChipsForTurn * this.activeMysteryChipsMult) / 25) * 25,
    );
    const dedupedBoardMultBonus =
      Math.max(
        0,
        twistBreakdown.rawMultBonus -
          (twistBreakdown.respectedAmberTruce ? 0.35 : 0) -
          (twistBreakdown.hitRivalWheelhouse ? 0.5 : 0) -
          (preClaimTile.hasUhfHalo ? 0.2 : 0),
      ) + (prelimScored ? modeBonus.multAdd : 0);

    const economy = evaluateTurnEconomyV7({
      tile: {
        baseChips: baseChipsForEconomy,
        boardMultBonus: dedupedBoardMultBonus,
        category: preClaimTile.category,
        domain: preClaimTile.domain,
        hasAmberTruce: twistBreakdown.respectedAmberTruce,
        hasUhfHalo: preClaimTile.hasUhfHalo,
        isRiggedSolenoid: preClaimTile.isRiggedSolenoid,
        isRivalTarget: preClaimTile.isRivalTarget,
        isWheelhouse: twistBreakdown.hitRivalWheelhouse,
      },
      clue,
      resolution,
      turnNumber: this.turnNumber,
      answerTimeSec,
      currentStreak: this.currentStreak,
      playerMatchScore: this.playerMatchScore,
      rivalMatchScore: this.rivalMatchScore,
      rivalExpectedMatchScore: this.rivalExpectedMatchScore,
      rivalRole: rivalProfile.role,
      waiver: effectiveWaiver,
      equippedRelics: effectiveRelics,
      activeCoupRegime: save.activeCoupRegime,
      contrabandTrunkCash: save.contrabandTrunkCash,
      grudgeBountyPool: save.grudgeBountyPool,
      claimedDomainsThisMatch: Array.from(this.claimedDomainsInMatch),
      correctCountBeforeTurn: this.correctCountInMatch,
      pocketedCanaryThisMatch: this.pocketedCanaryThisMatch,
      activeCanaryTurn,
      boothArrestsThisMatch: this.boothArrestsInMatch,
      juryBoonChips: this.activeJuryBallot?.boonChipsPerTurn ?? 0,
      juryBaneMultPenalty: this.activeJuryBallot?.baneMultPenalty ?? 0,
      isFinale: this.activeBlueprint.isFinale,
      allowFinaleJackpot: this.turnNumber >= this.totalTurnsInCurrentMatch - 1,
    });

    const modeBonusCash = modeBonus.bonusCash;
    const actualModeSteal = economy.scored
      ? Math.min(modeBonus.rivalStealCash, this.rivalMatchScore)
      : 0;
    const tileScreenPt = this.getTileScreenCoordinates(tileIdx);

    const twists = this.getLiveTwistsEngine();
    const topoUnlock = twists?.unlockTopologyAfterClaim(
      tileIdx,
      this.board.getTiles() as never,
      economy.scored,
      true,
    );
    if (topoUnlock && topoUnlock.unlockedIndices.length > 0) {
      for (const uIdx of topoUnlock.unlockedIndices) {
        this.board.triggerTrilonFlip(uIdx, 0.04, 0.44);
      }
      this.board.refreshAllTilePlaques();
    }
    this.syncBoardSpotlightBeams();

    // Update live match counters & feat trophies with exact 1:1 net score delta!
    const rawTurnGain = economy.netCashDelta + modeBonusCash + actualModeSteal;
    const totalTurnGain = Math.max(-prevPlayerScore, rawTurnGain);
    this.playerMatchScore = prevPlayerScore + totalTurnGain;
    if (actualModeSteal > 0) {
      this.rivalMatchScore = Math.max(0, this.rivalMatchScore - actualModeSteal);
      this.cpuTiltTurnsRemaining = 2;
    }
    this.currentStreak = economy.nextStreak;
    this.maxStreakInMatch = Math.max(this.maxStreakInMatch, this.currentStreak);
    // Award SAFE_CRACKER strictly on WINNING a $500+ Locked Gold Vault or Brass-Key Safe!
    if (
      economy.scored &&
      (preClaimTile.tvTwist === 'LOCKED_VAULT' ||
        preClaimTile.keyholderProtectedTurns > 0 ||
        (preClaimTile.baseChips >= 500 && this.activeUnlockTopology === 'KEY_AND_SAFE'))
    ) {
      this.crackedVaultOrSafeInMatch = true;
    }
    if (
      economy.scored &&
      this.turnNumber === this.totalTurnsInCurrentMatch &&
      Math.abs(prevPlayerScore - this.rivalMatchScore) <= 950
    ) {
      this.wonClutchTurn10InMatch = true;
    }
    this.cleanBonusCashInMatch += economy.cleanSideDividend;
    this.contrabandBonusCashInMatch += economy.contrabandSideCut;

    if (this.isDailyBroadcast) {
      const effectiveTwist =
        this.activeSecretSquareBonusMult > 0
          ? 'SECRET_SQUARE'
          : preClaimTile.tvTwist;
      this.dailyTileHistory.push(
        classifyDailyTileOutcomeV7({
          scored: economy.scored,
          tvTwist: effectiveTwist,
          selectedToy: this.activeToyId,
        }),
      );
    }

    // Scouting Notebook Discovery when Player hits an unscouted Weak Spot!
    if (economy.scored && this.discoverRivalWeakCategory(this.activeBlueprint.rivalId, preClaimTile.category)) {
      const friendlyCat = getFriendlyCategoryLabelV7(preClaimTile.category);
      this.pendingDiscoveryBannerText = `💡 WEAK SPOT FOUND: ${friendlyCat}! (+0.5× SAVED TO NOTEBOOK)`;
      this.announcer.onScoutingDiscovery({
        rivalId: this.activeBlueprint.rivalId,
        category: preClaimTile.category,
        kind: 'WEAK',
      });
    } else if (
      topoUnlock?.keyProtectedSafeIdx !== null &&
      topoUnlock?.keyProtectedSafeIdx !== undefined
    ) {
      this.announcer.onClassicTvTwist('BRASS_KEY', {
        rivalId: this.activeBlueprint.rivalId,
        category: preClaimTile.category,
      });
    }

    if (economy.scored) {
      this.correctCountInMatch += 1;
      this.claimedDomainsInMatch.add(preClaimTile.domain);
      if (this.isBlitzPhase) {
        this.blitzCorrectCount += 1;
        if (this.blitzCorrectCount >= 2) {
          this.earnedTrophiesInMatch.add('trophy_s3_25');
        }
      }
      this.checkContraptionFeatTrophies(clue, resolution);

      // Live Showband Reactions & 3D APPLAUSE Lightbox on Lead Changes, Jackpots & Streaks!
      const tookLead =
        prevPlayerScore <= this.rivalMatchScore && this.playerMatchScore > this.rivalMatchScore;
      if (modeBonusCash >= 500) {
        this.playBandReactionSafe('LINE_JACKPOT');
        this.triggerApplauseSign(3.0);
      } else if (tookLead && this.turnNumber >= 2) {
        this.playBandReactionSafe('LEAD_CHANGE');
        this.triggerApplauseSign(2.4);
      } else if (this.currentStreak >= 3) {
        this.playBandReactionSafe('HOT_STREAK');
        this.triggerApplauseSign(2.4);
      }

      // Kinetic 1966 Floating Score Popup + Studio Flashbulbs on big hits!
      this.vfx.spawnFloatingScorePop(
        tileScreenPt.xPx,
        tileScreenPt.yPx,
        totalTurnGain >= 0
          ? `+$${totalTurnGain.toLocaleString()}`
          : `-$${Math.abs(totalTurnGain).toLocaleString()}`,
        topoUnlock?.keyProtectedSafeIdx !== null && topoUnlock?.keyProtectedSafeIdx !== undefined
          ? '🗝️ SAFE UNLOCKED · 1-TURN SHIELD!'
          : this.currentStreak >= 2
            ? `🔥 ${this.currentStreak}× HOT STREAK`
            : getFriendlyCategoryLabelV7(preClaimTile.category),
        totalTurnGain >= 450 ? 'JACKPOT' : 'PEACOCK',
      );
      if (totalTurnGain >= 450 || this.currentStreak >= 3) {
        this.vfx.flashStudioAudienceBulbs({ count: 12, durationMs: 800 });
      }

      // Unlock any adjacent 🔒 LOCKED_VAULT tiles (or all vaults on a 2+ streak) with 1-Turn Vault Shield!
      const vaultUnlock = this.board.unlockAdjacentVaults(tileIdx, this.currentStreak);
      if (vaultUnlock.unlockedTileIndices.length > 0) {
        const maybeVaultSfx = (
          this.audio as unknown as { playVaultUnlock?: () => void }
        ).playVaultUnlock;
        if (typeof maybeVaultSfx === 'function') {
          maybeVaultSfx.call(this.audio);
        } else {
          this.audio.playTrophyUnlockChime();
        }
        this.vfx.burstLivingColorConfetti('MEDIUM', tileScreenPt);
        this.announcer.onLockedVaultCrack({
          rivalId: this.activeBlueprint.rivalId,
          vaultTriggerReason:
            vaultUnlock.triggerReason === 'STREAK_UNLOCK' ? 'STREAK_UNLOCK' : 'ADJACENT_WIN',
        });
      } else if (modeBonus.bannerHeadline) {
        this.board.triggerMarqueeCelebration(1.5);
        this.vfx.burstLivingColorConfetti('MEDIUM', tileScreenPt);
        if (modeBonus.mode === 'PRESS_YOUR_LUCK_GREMLIN') {
          this.announcer.onGremlinPassSpins({
            rivalId: this.activeBlueprint.rivalId,
            cashDelta: modeBonusCash + actualModeSteal,
          });
        } else if (modeBonus.mode === 'BIG_WHEEL_SHOWCASE') {
          this.announcer.onBigWheelSpin({
            rivalId: this.activeBlueprint.rivalId,
            cashDelta: modeBonusCash + actualModeSteal,
            isJackpot: true,
          });
        } else {
          this.announcer.onBoardModeHighlight(modeBonus.mode, {
            rivalId: this.activeBlueprint.rivalId,
            cashDelta: modeBonusCash + actualModeSteal,
          });
        }
        this.ui.showLiveToast(
          modeBonusCash < 0 ? modeBonus.bannerHeadline : modeBonus.bannerHeadline,
          modeBonusCash < 0 ? 'crimson' : 'emerald',
          2800,
        );
      } else {
        this.announcer.evaluateMatchStateTransition({
          turnNumber: this.turnNumber,
          totalTurns: this.totalTurnsInCurrentMatch,
          playerCash: this.playerMatchScore,
          rivalCash: this.rivalMatchScore,
          streak: this.currentStreak,
          rivalId: this.activeBlueprint.rivalId,
          stageId: this.activeBlueprint.stageId,
          lastCategory: preClaimTile.category,
          isDailyBroadcast: this.isDailyBroadcast,
        });
      }
    } else if (modeBonus.bannerHeadline && modeBonusCash !== 0) {
      // Surface Eye-Guess Trap (-$100) banner even when clue is missed!
      this.ui.showLiveToast(modeBonus.bannerHeadline, 'crimson', 2600);
    }

    // Play Post-Answer Showband Bloom / Klaxon if not already fired on pad flash + Shepard Cascade Ticks!
    if (!this.playedRevealOnPadThisTurn || resolution.triggeredKlaxon) {
      this.audio.playAnswerReveal(economy.scored, resolution.triggeredKlaxon);
    }
    if (economy.turnCash > 0) {
      const steps = Math.min(6, Math.max(2, Math.ceil(economy.turnCash / 160)));
      for (let s = 0; s < steps; s++) {
        window.setTimeout(() => {
          if (!this.disposed && gen === this.matchGenerationId) {
            this.audio.playScoreCascadeTick(s);
          }
        }, 160 + s * 64);
      }
    }

    const postEmotion: PortraitEmotionV7 =
      economy.scored && economy.turnCash >= 350
        ? 'RATTLED'
        : this.boothTellActive
          ? 'TELL'
          : 'POISED';
    this.syncTopBroadcastBug(postEmotion);

    // High-Contrast 2.2s Post-Answer Solari Showcase (Rolls at t+120ms, tap-to-skip after 500ms!)
    const theaterDwellMs = save.settings.reducedMotion ? 1900 : 2200;
    const postAhaFactoid =
      this.activeToyId === 'TOY_07_MAIL_SORTER' && clue.sorter
        ? clue.sorter.items
            .slice(0, 4)
            .map(
              (it) =>
                `${it.label}: ${it.chute === 0 ? clue.sorter!.chuteALabel : clue.sorter!.chuteBLabel}`,
            )
            .join(' · ')
        : clue.ahaFactoid;
    const hostReveal = this.resolveHostAnswerReveal({
      correct: economy.scored,
      cashWon: Math.max(0, totalTurnGain),
      streak: this.currentStreak,
      rivalName: rivalProfile.name,
      wasFinalWager: false,
      seed: clue.qid + this.turnNumber * 23,
    });
    const extraDelta = totalTurnGain - economy.netCashDelta;
    const extraBonusLabel =
      extraDelta > 0
        ? `+$${extraDelta.toLocaleString()}`
        : extraDelta < 0
          ? `-$${Math.abs(extraDelta).toLocaleString()}`
          : undefined;

    this.vfx.clearTransientPopups();
    await this.ui.playPostAnswerTheater({
      resolution,
      ahaFactoid: postAhaFactoid,
      economy,
      totalTurnNetCash: totalTurnGain,
      extraBonusLabel,
      dwellMs: theaterDwellMs,
      discoveryCallout: this.pendingDiscoveryBannerText ?? undefined,
      hostQuip: hostReveal.hostQuip,
      hostMood: hostReveal.mood,
    });
    if (this.disposed || gen !== this.matchGenerationId) return;

    // Bonus TV Twist Stages Earned on Claim (`PRESS_LUCK_SPIN` / `PRESS_YOUR_LUCK_GREMLIN` or Row-Sweep `BIG_WHEEL_SHOWCASE`)!
    const earnedGremlinSpins =
      economy.scored && preClaimTile.tvTwist === 'PRESS_LUCK_SPIN'
        ? Math.max(2, modeBonus.earnedGremlinSpins ?? 2)
        : economy.scored
          ? (modeBonus.earnedGremlinSpins ?? 0)
          : 0;

    if (earnedGremlinSpins > 0) {
      const gremlinRes = await this.twistTheater.playPressYourLuckGremlinBoard({
        spinsEarned: earnedGremlinSpins,
        playerCash: this.playerMatchScore,
        rivalName: rivalProfile.name,
        seed: (this.activeMatchSeedOffset + this.turnNumber * 37 + tileIdx) >>> 0,
        onBounceTick: () => this.audio.playSplitFlapTick(),
        onGremlinZonk: () => this.playGremlinZonkSfx(),
      });
      if (this.disposed || gen !== this.matchGenerationId) return;

      this.playerMatchScore = Math.max(0, this.playerMatchScore + gremlinRes.netCashDelta);
      if (gremlinRes.rivalCashDelta !== 0) {
        this.rivalMatchScore = Math.max(0, this.rivalMatchScore + gremlinRes.rivalCashDelta);
        if (gremlinRes.rivalCashDelta < 0) this.cpuTiltTurnsRemaining = 2;
      }
      if (gremlinRes.hitGremlin) {
        this.announcer.onGremlinZonk({
          rivalId: this.activeBlueprint.rivalId,
          rivalName: rivalProfile.name,
          victim: 'PLAYER',
        });
      } else if (gremlinRes.netCashDelta > 0 || gremlinRes.passedSpinsToRival > 0) {
        this.dodgedGremlinInMatch = true;
      }
      this.syncTopBroadcastBug();

      // If Player passed spins to the Champion, play out the CPU's Gremlin sweat immediately!
      if (gremlinRes.passedSpinsToRival > 0) {
        this.announcer.onGremlinPassSpins({
          rivalId: this.activeBlueprint.rivalId,
          rivalName: rivalProfile.name,
        });
        await this.runCpuPassedOrEarnedGremlinSpins(gremlinRes.passedSpinsToRival, gen, true);
        if (this.disposed || gen !== this.matchGenerationId) return;
      }
    } else if (
      economy.scored &&
      modeBonus.triggerBigWheel &&
      preClaimTile.tvTwist !== 'BIG_WHEEL_SPIN'
    ) {
      const bonusWheel = await this.twistTheater.playBigWheelSpin({
        seed: (this.activeMatchSeedOffset + this.turnNumber * 41 + 103) >>> 0,
        onPegTick: (s) => this.playBigWheelPegTickSfx(s),
      });
      if (this.disposed || gen !== this.matchGenerationId) return;
      this.applyPlayerBigWheelResult(bonusWheel, tileScreenPt, true);
    }

    // Brief sightline breath on the 3D Contraption Board before visible Rival choreography
    await sleepMs(120);
    if (this.disposed || gen !== this.matchGenerationId) return;

    // Mandatory ~1.5s Live Rival Turn Broadcast Chyron & 3D Choreography!
    await this.executeVisibleRivalTurn(gen);
    if (this.disposed || gen !== this.matchGenerationId) return;

    // ------------------------------------------------------------------------
    // True 3-Act Broadcast Escalation:
    //  - Act I (Turns 1–5): Opening Tote Round
    //  - Act II (Turns 6–9): Half-Time Re-Rack + 1.5x Double-Dollars + Snappy ~1.65s Act-Break Bumper!
    //  - Turns 8–9: 2-Turn Solenoid Trapdoor Blitz (`trophy_s3_25` reachable!)
    //  - Act III Climax (Turn 10): Final Broadcast Wager Showdown (Campaign & Quick Show)!
    // ------------------------------------------------------------------------
    if (!this.isDailyBroadcast && this.turnNumber === 5) {
      if (!this.isQuickPlay && this.activeBlueprint.episodeNumber >= 2) {
        this.phase = 'CANARY_BREAK';
        this.audio.setClueSanctuaryActive(true);
        const choice = await this.ui.showCanaryEnvelope(this.activeBlueprint);
        if (this.disposed || gen !== this.matchGenerationId) return;
        this.audio.setClueSanctuaryActive(false);
        if (choice === 'POCKET') {
          this.audio.playWaxSealShatter();
          this.pocketedCanaryThisMatch = true;
          this.canaryPendingNextTurn = true;
        } else {
          this.audio.playRubberStamp();
        }
      }
      // Act I -> Act II Transition: Re-Rack Fresh Wave + Boost Stakes to 1.5x ONCE + Show 1966 Network Act-Break Bumper!
      this.isAct3Showdown = true;
      this.board.reRackFreshWave(2);
      twists?.applyAct3DoubleDollarsBoost(this.board.getTiles() as never);
      this.board.refreshAllTilePlaques();
      this.board.triggerMarqueeCelebration(4.0);
      this.syncBoardSpotlightBeams();
      this.setSongChartVariantSafe((this.activeBlueprint.episodeNumber + 1) % 5);
      this.triggerApplauseSign(2.4);
      this.audio.playTileSelect();

      await this.ui.playActBreakBumper({
        actTitle: '★ ACT II · DOUBLE-DOLLARS & TWISTS! ★',
        headline: 'Fresh Tote Board Re-Racked · 1.5× Boosted Stakes Live!',
        detailLine:
          'Watch for Instant Bargain Turntables, Brass Safe Keys & Control Booth A Tells ahead of Turn 10’s Final Wager!',
        durationMs: save.settings.reducedMotion ? 1350 : 1650,
      });
      if (this.disposed || gen !== this.matchGenerationId) return;

      if (this.activePlayMode === 'EYE_GUESS_MEMORY') {
        this.board.triggerEyeGuessMemoryFlash(2.2);
      }
    }

    // Start Trapdoor Blitz entering Turn 8 so BOTH Turn 8 and Turn 9 are Blitz board turns
    // (making `trophy_s3_25` 2-Blitz-Clues 100% reachable, without re-boosting 1.5x stakes a second time!)
    if (!this.isDailyBroadcast && this.turnNumber === 7) {
      this.isBlitzPhase = true;
      this.board.triggerBlitzReRack();
      this.board.refreshAllTilePlaques();
      this.syncBoardSpotlightBeams();
      this.setSongChartVariantSafe((this.activeBlueprint.episodeNumber + 3) % 5);
      this.audio.playTileSelect();
      this.audio.setTrapdoorBlitzActive(true);
      this.ui.showLiveToast(
        '⚡ TURNS 8 & 9 · LIGHTNING BLITZ RE-RACK BEFORE ACT III FINAL WAGER!',
        'crimson',
        2200,
      );
      await sleepMs(180);
      if (this.disposed || gen !== this.matchGenerationId) return;
    }

    // 1969 Sale of the Century Mid-Show INSTANT BARGAIN Turntable (Turn 4 or 6 when holding >= $220!)
    if (
      !this.isDailyBroadcast &&
      !this.isQuickPlay &&
      !this.instantBargainOfferedInMatch &&
      (this.turnNumber === 4 || this.turnNumber === 6) &&
      this.playerMatchScore >= 220
    ) {
      const curSave = this.campaign.getState();
      if (curSave.equippedRelics.length < 5) {
        const ownedSet = new Set(curSave.equippedRelics.map((r) => r.relicId));
        const multCount = curSave.equippedRelics.filter(
          (eq) => RELIC_CATALOG_V7.find((rc) => rc.relicId === eq.relicId)?.slotKind === 'MULT_DRIVER',
        ).length;
        const eligibleBargains = RELIC_CATALOG_V7.filter(
          (r) =>
            r.ledgerKind === 'CLEAN' &&
            !ownedSet.has(r.relicId) &&
            (r.slotKind !== 'MULT_DRIVER' || multCount < 2),
        );
        const bargainRelic =
          eligibleBargains.length > 0
            ? eligibleBargains[
                ((this.activeMatchSeedOffset + this.turnNumber * 37) >>> 0) %
                  eligibleBargains.length
              ]
            : undefined;
        if (bargainRelic) {
          this.instantBargainOfferedInMatch = true;
          const bargainCost = 150;
          this.announcer.onClassicTvTwist('INSTANT_BARGAIN', {
            playerCash: this.playerMatchScore,
            rivalCash: this.rivalMatchScore,
          });
          const decision = await this.twistTheater.offerInstantBargainTurntable({
            playerCash: this.playerMatchScore,
            costCash: bargainCost,
            relicName: bargainRelic.name,
            relicPerk: bargainRelic.description,
            listPriceCash: bargainRelic.costCash,
          });
          if (this.disposed || gen !== this.matchGenerationId) return;
          if (decision === 'BUY' && this.playerMatchScore >= bargainCost) {
            const equippedOk = this.campaign.purchaseOrEquipRelic(
              bargainRelic.relicId,
              'GILDED',
              undefined,
              true,
            );
            if (equippedOk.ok) {
              this.playerMatchScore = Math.max(0, this.playerMatchScore - bargainCost);
              this.audio.playTrophyUnlockChime();
              this.vfx.burstLivingColorConfetti('MEDIUM');
              this.syncTopBroadcastBug();
              this.ui.showLiveToast(
                `🔔 INSTANT BARGAIN PACKED: ${bargainRelic.name.toUpperCase()}!`,
                'emerald',
                2400,
              );
            }
          }
        }
      }
    }

    if (this.turnNumber >= this.totalTurnsInCurrentMatch) {
      await this.finishMatchCeremony(gen);
      return;
    }

    this.turnNumber += 1;
    // Act III Climax: Turn-10 FINAL BROADCAST WAGER in Campaign & Quick Show!
    if (!this.isDailyBroadcast && this.turnNumber === this.totalTurnsInCurrentMatch) {
      await this.runAct3FinalBroadcastWager(gen);
      return;
    }

    this.announcer.setPhase('BOARD_SELECT');
    const rb = this.board.getBoardModeRuleBanner();
    this.ui.setBoardModeBanner(rb);
    this.beginBoardSelectTurn();
  }

  private async runAct3FinalBroadcastWager(gen: number): Promise<void> {
    if (this.disposed || gen !== this.matchGenerationId) return;
    this.isFinalWagerPhase = true;
    this.isBlitzPhase = false;
    this.audio.setTrapdoorBlitzActive(false);
    this.ui.hideRivalTurnChyron();
    this.ui.setBoardModeBanner(null);

    const save = this.campaign.getState();
    const rivalId = this.activeBlueprint.rivalId;
    const rivalProfile = CAST_PROFILES_V7[rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const notebook = this.getOrInitRivalNotebook(rivalId);

    // Choose a dramatic Final Broadcast Wager category & championship 4-choice clue!
    const catSeed =
      ((this.activeMatchSeedOffset + this.activeBlueprint.episodeNumber * 13 + 5) >>> 0) %
      ALL_CATEGORIES_V7.length;
    const finalCategory = ALL_CATEGORIES_V7[catSeed] ?? 'DYNASTIES';
    const maxDiff: DifficultyTierV7 =
      this.activeBlueprint.season >= 3 ? 5 : this.activeBlueprint.season === 2 ? 4 : 3;

    const draw = this.corpus.drawClueForTurn({
      category: finalCategory,
      maxDifficulty: maxDiff,
      preferredToyId: 'TOY_01_KNIFE_SWITCH',
      forceClassicFourChoice: true,
      isBlitz: false,
      recentEntities: [...save.recentEntityKeys, ...this.seenEntitiesInMatch],
    });
    const finalClue = draw.clue;
    this.seenEntitiesInMatch.push(finalClue.canonicalEntityKey);

    this.syncTopBroadcastBug('POISED');
    this.playBandReactionSafe('CLUTCH_POINT');
    this.board.triggerMarqueeCelebration(4.0);

    // Step 1: Dramatic 1966 FINAL BROADCAST WAGER Stage Card ($500 House Grudge Floor!)
    const maxPlayerWager = Math.max(500, this.playerMatchScore);
    const wagerIntro = this.resolveHostQuestionIntro({
      category: finalClue.category,
      cashValue: maxPlayerWager,
      actNumber: 3,
      isClutch: true,
      rivalName: rivalProfile.name,
      seed: finalClue.qid + 99,
    });

    const chosenPlayerWager = await this.ui.playFinalBroadcastWagerStage({
      episodeCode: this.isQuickPlay ? 'QUICK SHOW' : this.activeBlueprint.code,
      category: finalClue.category,
      playerCash: this.playerMatchScore,
      rivalCash: this.rivalMatchScore,
      rivalId,
      maxWager: maxPlayerWager,
      isScoutedWeak: notebook.revealedWeak.includes(finalClue.category),
      isScoutedStrong: notebook.revealedStrong.includes(finalClue.category),
      hostPromptLine: `Grant Bellamy: “${wagerIntro.hostLine}”`,
      onWagerTickSfx: () => this.audio.playDialDetent(),
      onLockInSfx: () => this.audio.playRubberStamp(),
    });
    if (this.disposed || gen !== this.matchGenerationId) return;

    // Step 2: Open the Final Showdown Clue with a 35s Spotlight Clock & Grant Bellamy Intro!
    this.phase = 'QUESTION_OPEN';
    this.announcer.setPhase('QUESTION_OPEN');
    this.activeClue = finalClue;
    this.activeToyId = 'TOY_01_KNIFE_SWITCH';
    this.activeCardStyleInTurn = 'CLASSIC_CUE';
    this.isAnswerLockingIn = false;
    this.prunedChoiceIndicesInTurn = [];
    this.remainingClueSec = 35;
    this.lastTickedWholeSec = 99;
    this.clueOpenedAtMs = performance.now();
    this.playedRevealOnPadThisTurn = false;

    this.engine.setCardApertureOpen(true);
    this.audio.setClueSanctuaryActive(true);
    this.ui.showTopBroadcastBug(true, false);

    const clueHostIntro = this.resolveHostQuestionIntro({
      category: finalClue.category,
      cashValue: chosenPlayerWager,
      actNumber: 3,
      isClutch: true,
      rivalName: rivalProfile.name,
      seed: finalClue.qid + 17,
    });

    const toyMountEl = this.ui.openQuestionChassis({
      clue: finalClue,
      baseChips: chosenPlayerWager,
      liveMultPreview: 1.0,
      countdownSeconds: 35,
      totalCountdownSeconds: 35,
      isWheelhouse: notebook.revealedWeak.includes(finalClue.category),
      tvTwist: 'SECRET_SQUARE',
      fiftyFiftyAvailable: this.fiftyFiftyAvailableInMatch,
      audiencePollAvailable: this.audiencePollAvailableInMatch,
      onUseFiftyFifty: () => this.handleUseFiftyFiftyLifeline(),
      onUseAudiencePoll: () => this.handleUseAudiencePollLifeline(),
      isMatchPointTurn: true,
      isAct3Showdown: true,
      isFinalWager: true,
      hostIntroLine: clueHostIntro.hostLine,
      hostMood: 'INTENSE',
    });

    this.disposeActiveContraption();
    let pendingFinalChoiceLabel = 'Your Final Answer';
    const captureFinalChoice = (ev: Event): void => {
      const btn = (ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-choice-idx]');
      if (btn && btn.dataset.choiceIdx !== undefined) {
        const letter = ['Choice A', 'Choice B', 'Choice C', 'Choice D'][
          Number(btn.dataset.choiceIdx)
        ];
        if (letter) pendingFinalChoiceLabel = letter;
      }
    };
    toyMountEl.addEventListener('pointerdown', captureFinalChoice, true);
    toyMountEl.addEventListener('click', captureFinalChoice, true);
    this.detachToyChoiceCapture = () => {
      toyMountEl.removeEventListener('pointerdown', captureFinalChoice, true);
      toyMountEl.removeEventListener('click', captureFinalChoice, true);
    };

    const stageSpec = STAGE_WORLD_SPECS_V7[this.activeBlueprint.stageId];
    const resolution = await new Promise<ToyResolutionV7>((resolveClue) => {
      this.activeFinalWagerResolveHandler = (res) => {
        this.activeFinalWagerResolveHandler = null;
        resolveClue(res);
      };
      this.activeContraption = mountTactileContraptionV7(
        toyMountEl,
        finalClue,
        'TOY_01_KNIFE_SWITCH',
        {
          pruneActive: false,
          canaryTickIdx: null,
          uvLoupeActive: false,
          dayJob: null,
          equippedRelicIds: this.isDailyBroadcast ? [] : save.equippedRelics.map((r) => r.relicId),
          cardStyle: 'CLASSIC_CUE',
          isClutchMoment: true,
          reducedMotion: save.settings.reducedMotion,
          highContrastBadges: save.settings.highContrastBadges,
          brassAccentHex: stageSpec.trimAccentHex,
          onTactileSfx: (ev) => this.playContraptionSfx(ev),
          onLockInStart: () => {
            this.isAnswerLockingIn = true;
            this.ui.syncLifelineButtons(false, false);
            this.ui.updateQuestionHostLine(
              this.resolveHostLockInQuip(pendingFinalChoiceLabel, true, finalClue.qid + 10),
              'INTENSE',
              true,
            );
            this.playAnswerLockInAudio(true);
          },
          onRevealFlash: (isCorrect) => {
            this.playedRevealOnPadThisTurn = true;
            this.audio.playAnswerReveal(isCorrect, false);
          },
        },
        (res) => {
          const handler = this.activeFinalWagerResolveHandler;
          if (handler) handler(res);
        },
      );
    });
    if (this.disposed || gen !== this.matchGenerationId) return;

    const finalAnswerTimeSec = Math.max(0.2, (performance.now() - this.clueOpenedAtMs) * 0.001);
    this.phase = 'POST_ANSWER_THEATER';
    this.announcer.setPhase('POST_ANSWER_THEATER');
    this.disposeActiveContraption();
    this.engine.setCardApertureOpen(false);
    this.audio.setClueSanctuaryActive(false);

    // Step 3: Honest Game-Theory CPU Wager & Final Answer Evaluation (Zero Rubber-Banding!)
    const prevPlayerCash = this.playerMatchScore;
    const prevRivalCash = this.rivalMatchScore;
    const playstyle: CpuPlaystyleIdV7 =
      rivalProfile.playstyle ?? DEFAULT_RIVAL_PLAYSTYLE_V7[rivalId] ?? 'PROFESSOR';
    const temperament: CpuTemperamentIdV7 =
      rivalProfile.temperament ?? DEFAULT_RIVAL_TEMPERAMENT_V7[rivalId] ?? 'STEADY';

    const cpuMaxWager = Math.max(500, prevRivalCash);
    let cpuWager = 0;
    if (prevRivalCash > prevPlayerCash * 2 + 100) {
      cpuWager =
        playstyle === 'GAMBLER' || playstyle === 'HIGH_ROLLER' || temperament === 'SHOWBOAT'
          ? Math.round((cpuMaxWager * 0.2) / 50) * 50
          : 0;
    } else if (prevRivalCash > prevPlayerCash) {
      const playerDouble = prevPlayerCash + Math.max(500, prevPlayerCash);
      const cover = Math.max(100, playerDouble + 50 - prevRivalCash);
      cpuWager = Math.min(cpuMaxWager, Math.ceil(cover / 50) * 50);
    } else if (prevRivalCash === prevPlayerCash) {
      cpuWager =
        playstyle === 'GAMBLER' || playstyle === 'CLUTCH_SHARK'
          ? cpuMaxWager
          : Math.round((cpuMaxWager * 0.75) / 50) * 50;
    } else {
      const needToPass = prevPlayerCash - prevRivalCash + 50;
      cpuWager =
        needToPass >= cpuMaxWager
          ? cpuMaxWager
          : Math.min(
              cpuMaxWager,
              Math.max(needToPass, Math.round((cpuMaxWager * 0.75) / 50) * 50),
            );
    }

    const isWeak = rivalProfile.weakCategories.includes(finalClue.category);
    const isStrong = rivalProfile.strongCategories.includes(finalClue.category);
    const cpuRoll01 =
      (((this.activeMatchSeedOffset + finalClue.qid * 17 + 13) >>> 0) % 100) / 100;
    const cpuOutcome = evaluateCpuTurnOutcomeV7({
      baseAccuracy: rivalProfile.baseAccuracy,
      difficultyMode: save.settings.difficultyMode ?? 'PRIMETIME_NORMAL',
      playstyle,
      temperament,
      isWeakCategory: isWeak,
      isStrongCategory: isStrong,
      isBlindCategory: false,
      tvTwist: 'NONE',
      turnNumber: 10,
      cpuStreak: this.cpuStreak,
      cpuTiltTurnsRemaining: this.cpuTiltTurnsRemaining,
      boothRattled: this.boothArrestsInMatch > 0 && rivalProfile.role === 'RIVAL_HEEL',
      deterministicRoll01: cpuRoll01,
    });
    const cpuCorrect = cpuOutcome.scored;
    const wrongFallbackIdx =
      finalClue.poisonedFixIdx !== finalClue.answerIdx
        ? finalClue.poisonedFixIdx
        : ((finalClue.answerIdx + 1) % 4);
    const cpuAnswerText = cpuCorrect
      ? finalClue.choices[finalClue.answerIdx]
      : finalClue.choices[wrongFallbackIdx];

    const playerCorrect = resolution.isCorrect;
    const playerAnswerText =
      resolution.chosenSummary ||
      (playerCorrect ? finalClue.choices[finalClue.answerIdx] : 'No Answer');

    this.rivalMatchScore = Math.max(
      0,
      prevRivalCash + (cpuCorrect ? cpuWager : -cpuWager),
    );
    this.playerMatchScore = Math.max(
      0,
      prevPlayerCash + (playerCorrect ? chosenPlayerWager : -chosenPlayerWager),
    );

    if (playerCorrect) {
      this.correctCountInMatch += 1;
      this.currentStreak += 1;
      this.maxStreakInMatch = Math.max(this.maxStreakInMatch, this.currentStreak);
      if (finalAnswerTimeSec < 15) {
        this.blitzCorrectCount += 1;
        if (this.blitzCorrectCount >= 2) {
          this.earnedTrophiesInMatch.add('trophy_s3_25');
        }
      }
      if (Math.abs(prevPlayerCash - prevRivalCash) <= 950 || prevPlayerCash <= prevRivalCash) {
        this.wonClutchTurn10InMatch = true;
      }
      this.discoverRivalWeakCategory(rivalId, finalClue.category);
    } else {
      this.currentStreak = 0;
    }
    if (cpuCorrect && isStrong) {
      this.discoverRivalStrongCategory(rivalId, finalClue.category);
    }

    if (!this.playedRevealOnPadThisTurn) {
      this.audio.playAnswerReveal(playerCorrect, false);
    }
    this.syncTopBroadcastBug(
      this.playerMatchScore > this.rivalMatchScore ? 'RATTLED' : 'POISED',
    );

    const finalRevealHost = this.resolveHostAnswerReveal({
      correct: playerCorrect,
      cashWon: playerCorrect ? chosenPlayerWager : 0,
      streak: this.currentStreak,
      rivalName: rivalProfile.name,
      wasFinalWager: true,
      seed: finalClue.qid + 77,
    });

    await this.ui.playFinalWagerShowdownReveal({
      category: finalClue.category,
      trueAnswerDisplay: finalClue.choices[finalClue.answerIdx],
      ahaFactoid: finalClue.ahaFactoid,
      hostQuip: finalRevealHost.hostQuip,
      hostMood: this.playerMatchScore > this.rivalMatchScore ? 'WINK' : finalRevealHost.mood,
      rivalId,
      cpuAnswerText,
      cpuCorrect,
      cpuWager,
      prevRivalCash,
      finalRivalCash: this.rivalMatchScore,
      playerAnswerText,
      playerCorrect,
      playerWager: chosenPlayerWager,
      prevPlayerCash,
      finalPlayerCash: this.playerMatchScore,
      dwellMs: save.settings.reducedMotion ? 2700 : 3500,
      onCpuRevealSfx: (ok) => {
        if (ok) this.audio.playRivalTileClaim();
        else this.audio.playSplitFlapTick();
      },
      onPlayerRevealSfx: (ok) => {
        if (ok) {
          this.playBandReactionSafe('LEAD_CHANGE');
          this.triggerApplauseSign(2.8);
          this.vfx.burstLivingColorConfetti('MEDIUM');
        } else {
          this.audio.playSplitFlapTick();
        }
      },
    });
    if (this.disposed || gen !== this.matchGenerationId) return;

    await this.finishMatchCeremony(gen);
  }

  private checkContraptionFeatTrophies(
    clue: ClueRecordV7,
    res: ToyResolutionV7,
  ): void {
    if (clue.isKlaxonMyth && res.isCorrect && !res.triggeredKlaxon) {
      this.earnedTrophiesInMatch.add('trophy_s1_06');
    }
    if (this.activeToyId === 'TOY_03_VERNIER_DIAL' && res.accuracyRatio >= 0.99) {
      this.earnedTrophiesInMatch.add('trophy_s1_07');
    }
    if (this.activeToyId === 'TOY_05_RELIEF_GLOBE_3D' && res.accuracyRatio >= 0.99) {
      this.earnedTrophiesInMatch.add('trophy_s2_14');
    }
    if (this.activeToyId === 'TOY_13_CYANOTYPE_LOUPE' && res.isCorrect) {
      this.earnedTrophiesInMatch.add('trophy_s2_16');
    }
    if (
      this.activeToyId === 'TOY_14_FOUR_SHUTTER_REEL' &&
      res.isCorrect &&
      res.chipMultiplier >= 1.95
    ) {
      this.earnedTrophiesInMatch.add('trophy_s2_17');
    }
    if (this.activeToyId === 'TOY_12_CONSPIRACY_LASSO' && res.isCorrect) {
      this.earnedTrophiesInMatch.add('trophy_s3_24');
    }
  }

  private async executeVisibleRivalTurn(gen: number): Promise<void> {
    this.phase = 'RIVAL_TURN';
    this.rivalTurnSkipRequested = false;

    const openTiles = this.board
      .getTiles()
      .filter(
        (t) =>
          (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR') &&
          !t.isVaultLocked &&
          !t.isTopologyLocked,
      );

    if (openTiles.length === 0) return;

    const targetIdx = this.board.previewRivalIntent() ?? openTiles[0].index;
    this.board.resolveRivalOpponentChoiceIfNeeded(targetIdx);
    const targetTile = this.board.getTile(targetIdx) ?? openTiles[0];
    const targetTwists = this.getLiveTwistsEngine()?.evaluateTileModifiers(
      targetTile,
      this.board.getTiles() as never,
    );
    const rivalTileShownCash = targetTwists
      ? Math.max(150, Math.round(targetTwists.effectiveChips / 50) * 50)
      : targetTile.baseChips;
    const friendlyCat = getFriendlyCategoryLabelV7(targetTile.category);
    const rivalTileCatLabel =
      friendlyCat.toUpperCase() === targetTile.category ||
      friendlyCat.toUpperCase().includes(targetTile.category)
        ? friendlyCat
        : `${targetTile.category} · ${friendlyCat}`;
    this.focusCameraOnTile(targetTile.index, 0.035);

    const rivalId = this.activeBlueprint.rivalId;
    const rivalProfile = CAST_PROFILES_V7[rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const playstyle: CpuPlaystyleIdV7 =
      rivalProfile.playstyle ?? DEFAULT_RIVAL_PLAYSTYLE_V7[rivalId] ?? 'PROFESSOR';
    const temperament: CpuTemperamentIdV7 =
      rivalProfile.temperament ?? DEFAULT_RIVAL_TEMPERAMENT_V7[rivalId] ?? 'STEADY';

    const isWeak = rivalProfile.weakCategories.includes(targetTile.category);
    const isStrong = rivalProfile.strongCategories.includes(targetTile.category);
    const seedBase = this.activeMatchSeedOffset;
    const roll01 =
      (((seedBase + this.turnNumber * 29 + targetTile.index * 19 + 7) >>> 0) % 100) / 100;

    // Honest CPU Accuracy & Temperament Psychology — ZERO Fake Score Rubber-Banding!
    const curSave = this.campaign.getState();
    const cpuOutcome = evaluateCpuTurnOutcomeV7({
      baseAccuracy: rivalProfile.baseAccuracy,
      difficultyMode: curSave.settings.difficultyMode ?? 'PRIMETIME_NORMAL',
      playstyle,
      temperament,
      isWeakCategory: isWeak,
      isStrongCategory: isStrong,
      isBlindCategory: Boolean(targetTile.blindCategoryHidden),
      tvTwist: targetTile.tvTwist,
      turnNumber: this.turnNumber,
      cpuStreak: this.cpuStreak,
      cpuTiltTurnsRemaining: this.cpuTiltTurnsRemaining,
      boothRattled: this.boothArrestsInMatch > 0 && rivalProfile.role === 'RIVAL_HEEL',
      deterministicRoll01: roll01,
    });
    const rivalScored = cpuOutcome.scored;
    const showRivalEv =
      !this.isDailyBroadcast &&
      evaluatePreTurnRelicHooksV7(
        { waiverPruneIdx: 0, domain: targetTile.domain },
        this.turnNumber,
        curSave.waiver,
        curSave.equippedRelics,
      ).showExactRivalEv;
    const evSuffix = showRivalEv ? ` · ODDS ${Math.round(cpuOutcome.hitThreshold * 100)}%` : '';

    if (this.turnNumber >= 2) {
      this.discoverRivalTrait(rivalId);
    }

    // Show sleek ~1.5s Live Rival Turn Broadcast Chyron (with SKIP ⏭ button!)
    const onSkip = (): void => {
      this.rivalTurnSkipRequested = true;
      this.rivalFastForwardHeld = true;
    };
    this.ui.showRivalTurnChyron({
      rivalId,
      headline: `${rivalProfile.name} targets ${rivalTileCatLabel} ($${rivalTileShownCash})`,
      subline: `${playstyle.replace(/_/g, ' ')} · ${cpuOutcome.demeanorTag}${evSuffix}`,
      tone: 'neutral',
      emotion: this.cpuTiltTurnsRemaining > 0 ? 'RATTLED' : 'POISED',
      onSkip,
    });

    await this.board.animateRivalClaim(targetTile.index, rivalScored, () => {
      if (!this.disposed && gen === this.matchGenerationId) {
        if (rivalScored) {
          this.audio.playRivalTileClaim();
        } else {
          this.audio.playAnswerReveal(false, false);
          this.playBandReactionSafe('RIVAL_FUMBLE');
        }
      }
    });
    if (this.disposed || gen !== this.matchGenerationId) {
      this.ui.hideRivalTurnChyron();
      return;
    }

    const twists = this.getLiveTwistsEngine();
    twists?.unlockTopologyAfterClaim(
      targetTile.index,
      this.board.getTiles() as never,
      rivalScored,
      false,
    );
    // Expire 1-Turn Keyholder Priority shields now that they protected the player's Safe through this CPU turn!
    if (twists?.tickKeyholderProtectionAfterRivalTurn(this.board.getTiles() as never)) {
      this.board.refreshAllTilePlaques();
    }
    this.syncBoardSpotlightBeams();
    if (this.cpuTiltTurnsRemaining > 0) {
      this.cpuTiltTurnsRemaining -= 1;
    }

    if (rivalScored) {
      this.cpuStreak += 1;
      const gain = rivalTileShownCash;
      this.rivalMatchScore += gain;
      this.audio.playSplitFlapTick();

      const foundStrong = isStrong && this.discoverRivalStrongCategory(rivalId, targetTile.category);
      if (foundStrong) {
        this.announcer.onScoutingDiscovery({
          rivalId,
          category: targetTile.category,
          kind: 'STRONG',
        });
      } else {
        this.announcer.onRivalTurnBanter({
          rivalId,
          category: targetTile.category,
          cashDelta: gain,
        });
      }
      const subline = foundStrong
        ? `★ STRONG CATEGORY SCOUTED: ${rivalTileCatLabel}!`
        : `${playstyle.replace(/_/g, ' ')} · ${cpuOutcome.demeanorTag}${evSuffix}`;

      this.ui.showRivalTurnChyron({
        rivalId,
        headline: `${rivalProfile.name} CLAIMED ${rivalTileCatLabel} (+$${gain})`,
        subline,
        tone: foundStrong ? 'scout' : 'claim',
        emotion: 'POISED',
        onSkip,
      });
      this.syncTopBroadcastBug();

      // Watchable ~1.5s CPU Big Wheel or Press-Your-Luck Gremlin Mini-Beats!
      if (!this.rivalTurnSkipRequested && targetTile.tvTwist === 'BIG_WHEEL_SPIN') {
        const cpuWheel = await this.twistTheater.playBigWheelSpin({
          autoCpuName: rivalProfile.name,
          seed: seedBase + this.turnNumber * 53 + targetTile.index,
          onPegTick: (s) => this.playBigWheelPegTickSfx(s),
        });
        if (this.disposed || gen !== this.matchGenerationId) {
          this.ui.hideRivalTurnChyron();
          return;
        }
        if (cpuWheel.kind === 'CASH') {
          this.rivalMatchScore += cpuWheel.cashValue;
        } else if (cpuWheel.kind === 'GREMLIN') {
          this.rivalMatchScore = Math.max(
            0,
            this.rivalMatchScore - Math.round((this.rivalMatchScore * 0.25) / 25) * 25,
          );
          this.cpuTiltTurnsRemaining = 2;
        } else if (cpuWheel.kind === 'STEAL') {
          const swiped = Math.min(this.playerMatchScore, 200);
          this.playerMatchScore -= swiped;
          this.rivalMatchScore += swiped;
        }
        this.syncTopBroadcastBug();
      } else if (!this.rivalTurnSkipRequested && targetTile.tvTwist === 'PRESS_LUCK_SPIN') {
        await this.runCpuPassedOrEarnedGremlinSpins(2, gen);
        if (this.disposed || gen !== this.matchGenerationId) {
          this.ui.hideRivalTurnChyron();
          return;
        }
      }
    } else {
      this.cpuStreak = 0;
      const foundWeak = isWeak && this.discoverRivalWeakCategory(rivalId, targetTile.category);
      this.announcer.onRivalMissRebound({
        rivalId,
        category: targetTile.category,
      });
      this.ui.showRivalTurnChyron({
        rivalId,
        headline: `${rivalProfile.name} FUMBLED ${rivalTileCatLabel}! (+$50 REBOUND OPEN!)`,
        subline: foundWeak
          ? `💡 WEAK SPOT FOUND: ${rivalTileCatLabel}! (+0.5× SAVED TO NOTEBOOK)`
          : 'Square stays OPEN with +$50 bonus cash!',
        tone: foundWeak ? 'scout' : 'miss',
        emotion: 'RATTLED',
        onSkip,
      });
      this.syncTopBroadcastBug('RATTLED');
    }

    if (!this.rivalTurnSkipRequested) {
      await sleepMs(360);
    }
    this.rivalFastForwardHeld = false;
    this.ui.hideRivalTurnChyron();
  }

  private async finishMatchCeremony(gen: number): Promise<void> {
    this.phase = 'CEREMONY';
    this.announcer.setPhase('CEREMONY');
    this.vfx.clearTransientPopups();
    this.ui.hideRivalTurnChyron();
    this.ui.setBoardModeBanner(null);
    this.clearBoothCheatTell();
    this.ui.setSabotageWarningActive(false);
    this.focusCameraOnTile(null, 0);
    this.audio.setTrapdoorBlitzActive(false);
    this.audio.setBellamySpiteChop(false);
    this.audio.setCensorMicHold(false, 0);

    const isCoChampionTie =
      !this.isDailyBroadcast &&
      this.playerMatchScore === this.rivalMatchScore &&
      this.playerMatchScore > 0;
    const didWin = this.isDailyBroadcast
      ? this.playerMatchScore >= this.rivalMatchScore
      : this.playerMatchScore > this.rivalMatchScore || isCoChampionTie;
    this.audio.playEpisodeCeremonyFanfare(didWin);
    if (didWin) {
      this.triggerApplauseSign(3.2);
      if (this.isDailyBroadcast) {
        this.vfx.burstLivingColorConfetti('MEDIUM');
        this.vfx.flashStudioAudienceBulbs({ count: 16, durationMs: 1100 });
        this.announcer.dismissImmediate();
      } else {
        this.vfx.celebrateEpisodeWin(
          isCoChampionTie ? '★ STUDIO CO-CHAMPIONS! ★' : '★ STUDIO CHAMPION! ★',
          `$${this.playerMatchScore.toLocaleString()} PURSE WON`,
        );
        this.announcer.onEpisodeVictory({
          rivalId: this.activeBlueprint.rivalId,
          playerCash: this.playerMatchScore,
          rivalCash: this.rivalMatchScore,
        });
      }
    }

    // Daily 1966 Broadcast Shareable Result Card!
    if (this.isDailyBroadcast && this.activeDailyBlueprint) {
      const updatedDaily = recordDailyBroadcastCompletionV7({
        dateIso: this.activeDailyBlueprint.dateIso,
        episodeNumber: this.activeDailyBlueprint.dailyNumber,
        playerCash: this.playerMatchScore,
        rivalCash: this.rivalMatchScore,
        won: didWin,
        tileHistory: this.dailyTileHistory,
      });
      this.ui.showTopBroadcastBug(false, false);
      const rivalName =
        CAST_PROFILES_V7[this.activeBlueprint.rivalId]?.name ?? 'Studio Champion';
      const stageName = STAGE_WORLD_SPECS_V7[this.activeBlueprint.stageId].name;
      const action = await this.titleHub.showDailyBroadcastResultModal({
        save: updatedDaily,
        rivalName,
        stageName,
        dateLabel: this.activeDailyBlueprint.displayDateShort,
      });
      if (this.disposed || gen !== this.matchGenerationId) return;
      if (action === 'PLAY_AGAIN') {
        await this.startDailyBroadcastMatch();
      } else {
        this.returnToTitleHub();
      }
      return;
    }

    const saveBefore = this.campaign.getState();
    // P0 Quick-Play Isolation: Quick Show NEVER mutates Campaign `returningChampStreak`, `currentEpisode`, or purses!
    const nextChampStreak = !this.isQuickPlay
      ? didWin
        ? (saveBefore.returningChampStreak ?? 0) + 1
        : 0
      : 0;
    if (!this.isQuickPlay) {
      saveBefore.returningChampStreak = nextChampStreak;
      if (didWin && nextChampStreak >= 2) {
        this.cleanBonusCashInMatch += nextChampStreak * 75;
      }
      if (this.censorShieldChargedThisMatch && didWin) {
        this.cleanBonusCashInMatch += 250;
      }
    }

    // Wave-4 1966 Career Achievement Medals & Balatro-Style Mode/Difficulty Mastery Stamps!
    const earnedCareerMedals: CareerMedalIdV7[] = [];
    if (this.maxStreakInMatch >= 5) earnedCareerMedals.push('SHUTOUT_STREAK');
    if (this.crackedVaultOrSafeInMatch) earnedCareerMedals.push('SAFE_CRACKER');
    if (this.bigWheelHighRollInMatch) earnedCareerMedals.push('WHEEL_HIGH_ROLLER');
    if (this.dodgedGremlinInMatch) earnedCareerMedals.push('GREMLIN_DODGER');
    if (didWin && this.wonClutchTurn10InMatch) earnedCareerMedals.push('CLUTCH_TURN10_WINNER');
    if (this.newlyScoutedWeakInMatch.length > 0 || this.newlyScoutedStrongInMatch.length > 0) {
      earnedCareerMedals.push('SCOUTING_DETECTIVE');
    }
    if (didWin && !this.usedLifelineInMatch) {
      earnedCareerMedals.push('NO_LIFELINE_PURIST');
    }
    if (!this.isQuickPlay && didWin && nextChampStreak >= 2) {
      earnedCareerMedals.push('RETURNING_CHAMP_CROWN');
    }

    if (!saveBefore.careerMedalCounts) saveBefore.careerMedalCounts = {};
    let medalBonusTotal = 0;
    for (const mId of earnedCareerMedals) {
      saveBefore.careerMedalCounts[mId] = (saveBefore.careerMedalCounts[mId] ?? 0) + 1;
      medalBonusTotal += CAREER_MEDAL_SPECS_V7[mId].bonusCash;
      if (!this.isQuickPlay) {
        this.cleanBonusCashInMatch += CAREER_MEDAL_SPECS_V7[mId].bonusCash;
      }
    }

    // Record Board-Mode & Difficulty Mastery strictly on `didWin === true` (NEVER on a loss!)
    if (didWin) {
      if (!Array.isArray(saveBefore.masteredBoardModes)) saveBefore.masteredBoardModes = [];
      if (!saveBefore.masteredBoardModes.includes(this.activePlayMode)) {
        saveBefore.masteredBoardModes.push(this.activePlayMode);
      }
      const activeDiff: DifficultyModeV7 = saveBefore.settings.difficultyMode ?? 'PRIMETIME_NORMAL';
      if (!Array.isArray(saveBefore.masteredDifficulties)) saveBefore.masteredDifficulties = [];
      if (!saveBefore.masteredDifficulties.includes(activeDiff)) {
        saveBefore.masteredDifficulties.push(activeDiff);
      }
      if (!Array.isArray(saveBefore.masteredModeDifficulties)) {
        saveBefore.masteredModeDifficulties = [];
      }
      const pairKey = `${this.activePlayMode}:${activeDiff}`;
      if (!saveBefore.masteredModeDifficulties.includes(pairKey)) {
        saveBefore.masteredModeDifficulties.push(pairKey);
      }
    }

    this.maxStreakInMatch = 0;
    this.crackedVaultOrSafeInMatch = false;
    this.bigWheelHighRollInMatch = false;
    this.dodgedGremlinInMatch = false;
    this.wonClutchTurn10InMatch = false;

    const summary: EpisodeOutcomeSummaryV7 = this.isQuickPlay
      ? {
          wonMatch: didWin,
          cleanCashAdded: didWin
            ? this.playerMatchScore + medalBonusTotal
            : medalBonusTotal,
          contrabandCashAdded: 0,
          grudgeBountyReclaimed: 0,
          grudgeBountyStoredOnLoss: 0,
          triggeredVaultDropNext: false,
          liberatedRival: null,
          resolvedCoupRegime: saveBefore.activeCoupRegime,
          unlockedEnding: null,
          newlyUnlockedTrophies: [],
          nextEpisodeNumber: saveBefore.currentEpisode,
        }
      : this.campaign.recordEpisodeOutcome({
          blueprint: this.activeBlueprint,
          playerMatchScore: this.playerMatchScore,
          // Non-zero exact Turn-10 tie (`$1,500 === $1,500`) resolves as Co-Champion Win with exact dollar ledger!
          rivalMatchScore: isCoChampionTie ? this.rivalMatchScore - 1 : this.rivalMatchScore,
          respectedAmberTruce: this.respectedAmberTruceInMatch && !this.poachedAmberTruceInMatch,
          poachedAmberTruce: this.poachedAmberTruceInMatch,
          canaryAction: this.pocketedCanaryThisMatch ? 'POCKETED' : 'BURNED',
          boothArrestsInMatch: this.boothArrestsInMatch,
          cleanBonusCash: this.cleanBonusCashInMatch,
          contrabandBonusCash: this.contrabandBonusCashInMatch,
          seenEntityKeysInMatch: this.seenEntitiesInMatch,
          earnedTrophyIdsInMatch: Array.from(this.earnedTrophiesInMatch),
          chosenCoupRegime: this.chosenCoupRegimeForPivot,
        });
    this.campaign.saveToStorage();
    this.persistShowrunnerMeta();

    if (summary.newlyUnlockedTrophies.length > 0) {
      this.audio.playTrophyUnlockChime();
    } else if (earnedCareerMedals.length > 0) {
      const hasPlatinum = earnedCareerMedals.some(
        (mId) => CAREER_MEDAL_SPECS_V7[mId].tier === 'PLATINUM CROWN',
      );
      const hasGold = earnedCareerMedals.some(
        (mId) => CAREER_MEDAL_SPECS_V7[mId].tier === 'GOLD TROPHY',
      );
      const hasSilver = earnedCareerMedals.some(
        (mId) => CAREER_MEDAL_SPECS_V7[mId].tier === 'SILVER MEDAL',
      );
      const chimeTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' = hasPlatinum
        ? 'PLATINUM'
        : hasGold
          ? 'GOLD'
          : hasSilver
            ? 'SILVER'
            : 'BRONZE';
      const maybeMedalChime = (
        this.audio as unknown as {
          playMedalRibbonChime?: (tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM') => void;
        }
      ).playMedalRibbonChime;
      if (typeof maybeMedalChime === 'function') {
        maybeMedalChime.call(this.audio, chimeTier);
      } else {
        this.audio.playTrophyUnlockChime();
      }
    }

    // Preview Next Episode Champion & Combinatorial Board Mode for the Ceremony Teaser CTA!
    const nextBp = this.campaign.getCurrentEpisodeBlueprint();
    const previewNextCombo = drawCombinatorialBoardComboV7({
      episodeNumber: nextBp.episodeNumber,
      isCampaignEp1: false,
      fallbackBoardId: nextBp.boardId,
      recentCombos: this.campaign.getState().recentBoardCombos,
      seed: nextBp.episodeNumber * 2654435761 + this.campaign.getState().episodesPlayed * 40503,
    });
    const nextRivalName =
      CAST_PROFILES_V7[nextBp.rivalId]?.name ?? 'New Challenger';
    const nextBoardModeTitle =
      BOARD_MODE_RULE_BANNERS_V7[previewNextCombo.playMode].modeTitle;
    const rivalNotebook = this.getOrInitRivalNotebook(this.activeBlueprint.rivalId);
    const rivalProf = CAST_PROFILES_V7[this.activeBlueprint.rivalId];

    const ceremonyChoice = await this.ui.playDualPurseCeremony(
      this.activeBlueprint,
      this.playerMatchScore,
      this.rivalMatchScore,
      summary,
      {
        returningChampStreak: nextChampStreak,
        newlyScoutedWeak: this.newlyScoutedWeakInMatch,
        newlyScoutedStrong: this.newlyScoutedStrongInMatch,
        scoutedPlaystyleLabel:
          rivalNotebook.traitRevealed && rivalProf?.playstyle
            ? `${rivalProf.playstyle.replace(/_/g, ' ')} (${(rivalProf.temperament ?? 'STEADY').replace(/_/g, ' ')})`
            : undefined,
        nextRivalName: !this.isQuickPlay ? nextRivalName : undefined,
        nextBoardModeTitle: !this.isQuickPlay ? nextBoardModeTitle : undefined,
        nextCliffhangerTeaser:
          !this.isQuickPlay && !this.activeBlueprint.isFinale
            ? this.resolveNextEpisodeCliffhangerTeaser(nextBp)
            : undefined,
        allowBackstageCustomization: !this.isQuickPlay,
        earnedCareerMedals,
        isCoChampionTie,
      },
    );
    if (this.disposed || gen !== this.matchGenerationId) return;

    // Flush any Waiver Perks, Prop Shop equips, or Buyout Spokes adjusted during Ceremony!
    this.campaign.saveToStorage();
    this.persistShowrunnerMeta();

    if (ceremonyChoice === 'SAVE_AND_EXIT') {
      this.audio.playRubberStamp();
      const wasQuickPlay = this.isQuickPlay;
      this.returnToTitleHub();
      this.ui.showLiveToast(
        wasQuickPlay
          ? '✓ QUICK SHOW STATS, SCOUTING & MEDALS SAVED!'
          : `✓ PROGRESS SAVED — READY FOR ${nextBp.code} ANYTIME!`,
        'emerald',
        3200,
      );
      return;
    }

    if (this.isQuickPlay) {
      if (ceremonyChoice === 'PLAY_AGAIN') {
        this.audio.playTileSelect();
        await this.handleQuickPlayLaunch();
        return;
      }
      this.returnToTitleHub();
      return;
    }

    // Seamless Next-Episode Progression:
    // Only interrupt for Coup Pivot regime choice; otherwise launch straight into Next Match's ~3s Curtain-Raiser!
    this.activeBlueprint = nextBp;
    this.ui.showTopBroadcastBug(false, false);

    if (nextBp.isCoupPivot) {
      this.audio.enterGreenRoom();
      const { chosenRegime } = await this.ui.showGreenRoomCallSheet(nextBp);
      if (this.disposed || gen !== this.matchGenerationId) return;
      this.chosenCoupRegimeForPivot = chosenRegime;
    }

    await this.startMatch(nextBp, false, false, previewNextCombo);
  }

  private syncTopBroadcastBug(emotionOverride?: PortraitEmotionV7): void {
    const emotion: PortraitEmotionV7 =
      emotionOverride ??
      (this.boothTellActive
        ? 'TELL'
        : this.playerMatchScore - this.rivalMatchScore >= 450
          ? 'RATTLED'
          : 'POISED');

    this.ui.updateTopBroadcastBug({
      playerCash: this.playerMatchScore,
      rivalCash: this.rivalMatchScore,
      turnNumber: this.turnNumber,
      totalTurns: this.totalTurnsInCurrentMatch,
      streak: this.currentStreak,
      rivalId: this.activeBlueprint.rivalId,
      rivalEmotion: emotion,
      boothTellLive: this.boothTellActive,
      isDailyBroadcast: this.isDailyBroadcast,
      dailyEpisodeNumber: this.isDailyBroadcast
        ? this.activeDailyBlueprint?.dailyNumber
        : undefined,
      actNumber: this.getCurrentBroadcastAct(),
      isAct2Boosted: this.isAct3Showdown,
      isFinalWager: this.isFinalWagerPhase,
    });
  }

  // --------------------------------------------------------------------------
  // 60fps Frame Update (3D Kinesthetics, ANSI VU Needle, Timers, Censor Hold)
  // --------------------------------------------------------------------------

  private onFrame(dtSec: number): void {
    const boardDt =
      this.phase === 'RIVAL_TURN' &&
      (this.rivalFastForwardHeld || this.rivalTurnSkipRequested)
        ? dtSec * (this.rivalTurnSkipRequested ? 3.5 : 2.2)
        : dtSec;

    this.board.update(boardDt);

    // Live 300ms ANSI Ballistic VU Meter driven by real Master WebAudio AnalyserNode
    const vu = this.audio.getBallisticVuState(dtSec);
    this.ui.updateVuNeedle(vu.needleAngleDeg, vu.peakLedActive);

    // Continuous Mic Shield Capacitor Hold (< 2.1kHz warm saturation — blocks Booth Timer Cut!)
    if (this.censorHeld) {
      this.censorCharge01 = Math.min(1, this.censorCharge01 + dtSec / 2.2);
      this.audio.setCensorMicHold(true, this.censorCharge01);
      if (this.censorCharge01 >= 1 && !this.censorShieldChargedThisMatch) {
        this.censorShieldChargedThisMatch = true;
        this.audio.setBellamySpiteChop(false);
        this.audio.playRubberStamp();
        this.ui.showLiveToast(
          'MIC SHIELD LOCKED ✓ — BOOTH TIMER SABOTAGE BLOCKED (+$250 WIN BONUS)',
          'emerald',
          2400,
        );
      }
      this.ui.updateCensorPaddleProgress(this.censorCharge01, this.censorShieldChargedThisMatch);
    } else if (this.censorCharge01 > 0 && !this.censorShieldChargedThisMatch) {
      this.censorCharge01 = Math.max(0, this.censorCharge01 - dtSec * 0.65);
      this.ui.updateCensorPaddleProgress(this.censorCharge01, false);
    }

    const utilityModalPaused = this.ui.isUtilityModalOpen();

    // Live 8.0s Booth Cheat Tell Window (Paused while a utility modal is open!)
    if (this.boothTellActive && !utilityModalPaused) {
      this.boothTellRemainingSec -= dtSec;
      if (this.boothTellChannel === 'SOLENOID_SPARK') {
        this.boothTellSparkAccumSec += dtSec;
        if (this.boothTellSparkAccumSec >= 0.85) {
          this.boothTellSparkAccumSec = 0;
          const openTile = this.board.getTiles().find((t) => t.state === 'OPEN');
          if (openTile) {
            this.engine.triggerSolenoidSpark(
              this.board.getTileWorldPosition(openTile.index),
              18,
            );
          }
        }
      }
      if (this.boothTellRemainingSec <= 0) {
        this.clearBoothCheatTell();
        this.syncTopBroadcastBug();
      }
    }

    // Live Question Countdown + Audible Final 5-Second Horological Studio Clock Ticks
    // (Freezes while a utility modal is open OR the instant `onLockInStart` fires!)
    if (
      this.phase === 'QUESTION_OPEN' &&
      this.activeClue &&
      !this.isAnswerLockingIn &&
      !utilityModalPaused
    ) {
      this.remainingClueSec -= dtSec;
      this.ui.updateQuestionCountdown(this.remainingClueSec);

      const ceilSec = Math.max(0, Math.ceil(this.remainingClueSec));
      if (ceilSec <= 5 && ceilSec !== this.lastTickedWholeSec) {
        this.lastTickedWholeSec = ceilSec;
        this.audio.playCountdownTick(ceilSec);
      }

      if (this.remainingClueSec <= 0) {
        const clue = this.activeClue;
        const timeoutResolution: ToyResolutionV7 = {
          isCorrect: false,
          accuracyRatio: 0,
          chipMultiplier: 1.0,
          chosenSummary: 'Time Expired',
          trueAnswerDisplay: clue.cyanotype
            ? clue.cyanotype.targetZoneName
            : clue.choices[clue.answerIdx],
          triggeredKlaxon: false,
          fellForPoisonedFix: false,
        };
        if (this.activeFinalWagerResolveHandler) {
          const fwResolve = this.activeFinalWagerResolveHandler;
          this.activeFinalWagerResolveHandler = null;
          fwResolve(timeoutResolution);
        } else {
          void this.resolvePlayerTurn(timeoutResolution);
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Direct 3D Canvas Raycasting & Desktop Keyboard Shortcuts
  // --------------------------------------------------------------------------

  private setRaycasterFromClient(clientX: number, clientY: number): boolean {
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -(((clientY - rect.top) / rect.height) * 2 - 1),
    );
    this.engine.raycaster.setFromCamera(ndc, this.engine.camera);
    return true;
  }

  private bindInputListeners(): void {
    const canvas = this.engine.renderer.domElement;

    const onPointerMove = (e: PointerEvent): void => {
      if (this.disposed) return;

      if (this.activePointers.has(e.pointerId)) {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // 2-Finger Pinch-to-Zoom on Mobile Touchscreens!
      if (this.activePointers.size === 2 && this.phase === 'BOARD_SELECT') {
        const pts = Array.from(this.activePointers.values());
        const distNow = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        if (this.pinchInitialDist && this.pinchInitialDist > 12) {
          const nextZoom = this.engine.setUserZoom(
            this.pinchInitialZoom * (distNow / this.pinchInitialDist),
          );
          this.ui.updateZoomReadout(nextZoom);
          this.gestureDidPanOrPinch = true;
        }
        return;
      }

      if (this.draggingCrossfader && this.phase === 'BOARD_SELECT') {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0) {
          const norm = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const snapped: -1 | 0 | 1 = norm < -0.22 ? -1 : norm > 0.22 ? 1 : 0;
          this.board.setCrossfaderPosition(snapped);
        }
        return;
      }

      // 1-Finger / Mouse Drag-to-Pan across the 3D Contraption Board!
      if (
        this.pointerDownPos &&
        this.lastDragClientPos &&
        this.activePointers.size === 1 &&
        this.phase === 'BOARD_SELECT'
      ) {
        const totalMove = Math.hypot(
          e.clientX - this.pointerDownPos.x,
          e.clientY - this.pointerDownPos.y,
        );
        if (totalMove > 12) {
          this.gestureDidPanOrPinch = true;
          this.board.setHoveredTile(null);
          canvas.style.cursor = 'grabbing';
          this.engine.panBoardCameraByPixels(
            e.clientX - this.lastDragClientPos.x,
            e.clientY - this.lastDragClientPos.y,
          );
          this.lastDragClientPos = { x: e.clientX, y: e.clientY };
          return;
        }
      }

      if (this.phase !== 'BOARD_SELECT') {
        canvas.style.cursor = 'default';
        return;
      }

      if (!this.setRaycasterFromClient(e.clientX, e.clientY)) return;
      const pick = this.board.updateHoverFromRaycaster(this.engine.raycaster);
      const stageHit = this.engine.pickInteractiveTarget(e.clientX, e.clientY);

      if (pick) {
        if (pick.type === 'TILE') {
          const t = this.board.getTile(pick.tileIndex);
          canvas.style.cursor =
            t && (t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR')
              ? 'pointer'
              : 'default';
        } else {
          canvas.style.cursor = 'pointer';
        }
      } else if (stageHit?.kind === 'ROW_C_GLINT' && this.boothTellActive) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'default';
      }
    };

    const onPointerDown = (e: PointerEvent): void => {
      if (this.disposed) return;
      void this.unlockAudioAndSyncHub();
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (this.activePointers.size === 2) {
        const pts = Array.from(this.activePointers.values());
        this.pinchInitialDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        this.pinchInitialZoom = this.engine.getUserZoom();
        this.gestureDidPanOrPinch = true;
        return;
      }

      this.pointerDownPos = { x: e.clientX, y: e.clientY };
      this.lastDragClientPos = { x: e.clientX, y: e.clientY };
      this.gestureDidPanOrPinch = false;

      if (this.phase === 'RIVAL_TURN') {
        this.rivalFastForwardHeld = true;
        this.rivalTurnSkipRequested = true;
        return;
      }

      if (this.phase !== 'BOARD_SELECT') return;
      if (!this.setRaycasterFromClient(e.clientX, e.clientY)) return;
      const pick = this.board.pickBoardInteraction(this.engine.raycaster);
      if (
        pick?.type === 'BOARD_GIMMICK' &&
        pick.boardId === 'BOARD_01_FUNK_CROSSFADER'
      ) {
        this.draggingCrossfader = true;
      }
    };

    const onPointerUp = (e: PointerEvent): void => {
      if (this.disposed) return;
      this.activePointers.delete(e.pointerId);
      if (this.activePointers.size < 2) {
        this.pinchInitialDist = null;
      }
      this.rivalFastForwardHeld = false;

      if (this.draggingCrossfader) {
        this.draggingCrossfader = false;
      }

      const down = this.pointerDownPos;
      const wasPanOrPinch = this.gestureDidPanOrPinch;
      if (this.activePointers.size === 0) {
        this.pointerDownPos = null;
        this.lastDragClientPos = null;
        this.gestureDidPanOrPinch = false;
      }
      if (!down || wasPanOrPinch || this.phase !== 'BOARD_SELECT') return;

      // Generous 14px touch jitter tolerance for 1-handed mobile play
      const dist = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (dist > 14) return;

      // 1) Check 3D Upstage Row-C Glint direct arrest click
      const stageHit = this.engine.pickInteractiveTarget(e.clientX, e.clientY);
      if (stageHit?.kind === 'ROW_C_GLINT' && this.boothTellActive) {
        this.handleBoothArrest();
        return;
      }

      // 2) Check 3D Contraption Board raycast hit (Tile / Toby's Mercy Switch / 3D Gimmick)
      if (!this.setRaycasterFromClient(e.clientX, e.clientY)) return;
      const pick = this.board.pickBoardInteraction(this.engine.raycaster);
      if (!pick) return;

      if (pick.type === 'TILE') {
        // Defer `selectBoardTile` out of `pointerup` AND arm a capture-phase trailing-click
        // shield so the browser's synthesized `click` after `pointerup` NEVER auto-picks A/B/C/D!
        lastCanvasTileTapMs = performance.now();
        window.setTimeout(() => {
          if (!this.disposed) {
            void this.selectBoardTile(pick.tileIndex);
          }
        }, 0);
      } else if (pick.type === 'MERCY_SWITCH') {
        this.board.pullMercySwitch();
      } else if (pick.type === 'BOARD_GIMMICK') {
        this.board.activateBoardGimmick();
      }
    };

    let lastCanvasTileTapMs = -9999;
    const swallowTrailingBoardTapClick = (e: MouseEvent): void => {
      if (this.disposed) return;
      if (e.detail > 0 && performance.now() - lastCanvasTileTapMs < 340) {
        const targetEl = e.target as HTMLElement | null;
        if (targetEl && targetEl !== canvas && targetEl.closest('#ws7-toy-mount, .ws7-question-stage')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent): void => {
      if (this.disposed) return;
      const tag = (document.activeElement?.tagName ?? '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      void this.audio.unlock();

      if (e.key === ' ' && this.boothTellActive && !e.repeat) {
        e.preventDefault();
        this.handleBoothArrest();
        return;
      }

      if (e.key === 'Shift' && !e.repeat && this.phase === 'BOARD_SELECT') {
        this.handleCensorPaddleHold(true);
        return;
      }

      if ((e.key === 'f' || e.key === 'F') && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        this.audio.playUiTap();
        void this.ui.handleFullscreenToggle();
        return;
      }

      // Direct 1..4 keyboard quick-throw when a choice-keyed contraption is open
      if (
        this.phase === 'QUESTION_OPEN' &&
        (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4')
      ) {
        const idx = Number(e.key) - 1;
        const btn = this.ui
          .getToyMountElement()
          .querySelector<HTMLButtonElement>(`button[data-choice-idx="${idx}"]`);
        btn?.click();
      }
    };

    const onKeyUp = (e: KeyboardEvent): void => {
      if (e.key === 'Shift') {
        this.handleCensorPaddleHold(false);
      }
    };

    const onWheel = (e: WheelEvent): void => {
      if (this.disposed || this.phase !== 'BOARD_SELECT') return;
      e.preventDefault();
      const step = e.deltaY < 0 ? 0.14 : -0.14;
      const nextZoom = this.engine.adjustUserZoom(step);
      this.ui.updateZoomReadout(nextZoom);
    };

    const onPointerCancel = (e: PointerEvent): void => {
      this.activePointers.delete(e.pointerId);
      if (this.activePointers.size < 2) {
        this.pinchInitialDist = null;
      }
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('click', swallowTrailingBoardTapClick, true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    this.detachListeners.push(() => {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('click', swallowTrailingBoardTapClick, true);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    });
  }

  // --------------------------------------------------------------------------
  // Structural Sweep & Telemetry Bridge (`window.__WS_V7__`)
  // --------------------------------------------------------------------------

  private exposeDiagnosticsBridge(): void {
    if (typeof window === 'undefined') return;

    const api = {
      getTelemetry: () => {
        const tiles = this.board.getTiles();
        const minLocalTierY = tiles.reduce(
          (acc, t) => Math.min(acc, t.tierY),
          Infinity,
        );
        const worldVec = new THREE.Vector3();
        let minWorldTileY = Infinity;
        const tileScreenPoints: Array<{
          index: number;
          category: string;
          state: string;
          tierY: number;
          worldY: number;
          clientX: number;
          clientY: number;
        }> = [];
        const rect = this.engine.renderer.domElement.getBoundingClientRect();

        for (const t of tiles) {
          this.board.getTileWorldPosition(t.index, worldVec);
          if (t.state !== 'RETRACTED') {
            minWorldTileY = Math.min(minWorldTileY, worldVec.y);
          }
          const proj = worldVec.clone().project(this.engine.camera);
          tileScreenPoints.push({
            index: t.index,
            category: t.category,
            state: t.state,
            tierY: Number(t.tierY.toFixed(3)),
            worldY: Number(worldVec.y.toFixed(3)),
            clientX: Math.round(rect.left + (proj.x * 0.5 + 0.5) * rect.width),
            clientY: Math.round(rect.top + (-proj.y * 0.5 + 0.5) * rect.height),
          });
        }

        return {
          phase: this.phase,
          episodeCode: this.activeBlueprint.code,
          stageId: this.activeBlueprint.stageId,
          boardId: this.board.getActiveBoardId(),
          playMode: this.activePlayMode,
          unlockTopology: this.activeUnlockTopology,
          twistId: this.board.getActiveTwistId(),
          twistCount: Object.keys(BOARD_TWIST_SPECS_V7).length,
          boardCatalogCount: ALL_BOARD_IDS_V7.length,
          toyCatalogCount: ALL_TOY_IDS_V7.length,
          categoryCatalogCount: ALL_CATEGORIES_V7.length,
          trophyCatalogIds: TROPHY_CATALOG_V7.map((t) => t.trophyId),
          turnNumber: this.turnNumber,
          playerMatchScore: this.playerMatchScore,
          rivalMatchScore: this.rivalMatchScore,
          fiftyFiftyAvailable: this.fiftyFiftyAvailableInMatch,
          audiencePollAvailable: this.audiencePollAvailableInMatch,
          returningChampStreak: this.campaign.getState().returningChampStreak ?? 0,
          minLocalTierY: Number(minLocalTierY.toFixed(3)),
          minWorldTileY: Number(minWorldTileY.toFixed(3)),
          tileScreenPoints,
          engine: this.engine.getTelemetry(),
          frustumFit: this.engine.getLastFrustumFit(),
          corpus: this.corpus.getTelemetry(),
          audio: {
            scene: this.audio.getCurrentScene(),
            bpm: this.audio.getCurrentBpm(),
            timeSig: this.audio.getCurrentTimeSignature(),
            isSealedVault: this.audio.isSealedVaultScene(),
            bakedKernelBytes: this.audio.getBakedKernelBytes(),
            activeVoices: this.audio.getActiveVoiceCount(),
            vu: this.audio.getBallisticVuState(1 / 60),
          },
        };
      },
      previewStageAndBoard: (
        stageId: StageWorldIdV7,
        boardId: BoardIdV7,
        twistId?: BoardTwistIdV7,
      ) => {
        this.titleHub.hideAll();
        this.ui.hideTitleHub();
        this.ui.hideModalStage();
        this.ui.closeQuestionChassis();
        this.ui.showTopBroadcastBug(true, false);
        this.phase = 'BOARD_SELECT';
        this.engine.boardMount.visible = true;
        this.activeBlueprint = { ...this.activeBlueprint, stageId, boardId };
        const spec = this.engine.setStageWorld(stageId);
        this.board.loadBoard({
          boardId,
          twistId: twistId ?? BOARD_SPECS_V7[boardId].defaultTwistId,
          rivalId: this.activeBlueprint.rivalId,
          tableBedHex: spec.tableBedHex,
          trimVeneerHex: spec.trimVeneerHex,
          trimAccentHex: spec.trimAccentHex,
        });
        this.engine.fitBoardToViewport(
          this.canvasRoot.clientWidth || window.innerWidth,
          this.canvasRoot.clientHeight || window.innerHeight,
        );
        this.audio.setStageWorld(stageId);
        this.engine.renderFrameNow(1 / 60);
      },
      openContraptionPreview: (tileIndex: number, toyId: ToyIdV7) => {
        if (this.phase !== 'BOARD_SELECT') {
          this.disposeActiveContraption();
          this.ui.closeQuestionChassis();
          this.phase = 'BOARD_SELECT';
        }
        this.selectBoardTile(tileIndex, toyId);
      },
      recordMasterAudioSamples: async (durationMs = 3000) => {
        await this.audio.unlock();
        const ctx = this.audio.getAudioContext();
        const bus = this.audio.masterBus;
        if (!ctx || !bus) return { sampleRate: 24000, samples: [] as number[] };
        const proc = ctx.createScriptProcessor(2048, 1, 1);
        const mute = ctx.createGain();
        mute.gain.value = 0;
        const collected: number[] = [];
        proc.onaudioprocess = (ev) => {
          const ch = ev.inputBuffer.getChannelData(0);
          for (let i = 0; i < ch.length; i++) {
            collected.push(Number(ch[i].toFixed(5)));
          }
        };
        bus.connect(proc);
        proc.connect(mute);
        mute.connect(ctx.destination);
        // Trigger representative 16-bar Showband + new foley/lock-in/reaction beats during playback
        this.audio.playTileHover();
        window.setTimeout(() => this.audio.playTileSelectFlip(), 380);
        window.setTimeout(() => this.audio.playAnswerLockInSting(true), 920);
        window.setTimeout(() => this.audio.playAnswerReveal(true, false), 1850);
        window.setTimeout(() => this.audio.playBandReaction('LEAD_CHANGE'), 2250);
        await sleepMs(durationMs);
        try {
          bus.disconnect(proc);
          proc.disconnect();
          mute.disconnect();
        } catch {
          // ignore
        }
        return {
          sampleRate: Math.round(ctx.sampleRate),
          samples: collected,
        };
      },
    };

    (window as unknown as { __WS_V7__?: typeof api }).__WS_V7__ = api;
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.matchGenerationId += 1;

    for (const fn of this.detachListeners) fn();
    this.detachListeners.length = 0;

    this.disposeActiveContraption();
    this.disposeActiveVaultRenderer();
    this.twistTheater.dispose();
    this.announcer.dispose();
    this.vfx.dispose();
    this.titleHub.dispose();
    this.ui.dispose();
    this.board.dispose();
    this.engine.dispose();
    this.audio.dispose();
  }
}

export function bootShowtimeV7(
  canvasRoot: HTMLElement,
  uiRoot: HTMLElement,
): ShowtimeAppV7 {
  return new ShowtimeAppV7(canvasRoot, uiRoot);
}
