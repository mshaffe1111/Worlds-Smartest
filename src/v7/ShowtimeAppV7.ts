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
  type BoardIdV7,
  type BoardTwistIdV7,
  type BroadcastSettingsV7,
  type ClueRecordV7,
  type CoupRegimeIdV7,
  type DifficultyTierV7,
  type DomainIdV7,
  type EpisodeBlueprintV7,
  type PortraitEmotionV7,
  type StageWorldIdV7,
  type ToyIdV7,
  type ToyResolutionV7,
} from './contracts_v7';
import {
  ShowbandAudioEngineV7,
  type CheatTellChannelV7,
} from './audio/ShowbandAudioEngineV7';
import { BOARD_TWIST_SPECS_V7 } from './boards/BoardTwistsEngineV7';
import {
  ALL_BOARD_IDS_V7,
  BOARD_SPECS_V7,
  InteractiveBoard3DControllerV7,
} from './boards/InteractiveBoards3DV7';
import {
  CAST_PROFILES_V7,
  RELIC_CATALOG_V7,
  TROPHY_CATALOG_V7,
  evaluateTurnEconomyV7,
  executeLiveScoreBurnBuyV7,
} from './campaign/CastAndRelicsCatalogV7';
import {
  CampaignDirectorV7,
  type VipJuryBallotV7,
} from './campaign/FiftyMillionCampaignV7';
import { StudioAnnouncerControllerV7 } from './campaign/StudioAnnouncerV7';
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
import { TitleAndOnboardingControllerV7 } from './ui/TitleAndOnboardingV7';
import { TvTwistTheaterV7 } from './ui/TvTwistTheaterV7';
import { StudioBroadcastVfxV7 } from './vfx/StudioBroadcastVfxV7';

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

  private turnNumber = 1;
  private playerMatchScore = 0;
  private rivalMatchScore = 0;
  private rivalExpectedMatchScore = 1850;
  private currentStreak = 0;
  private correctCountInMatch = 0;
  private blitzCorrectCount = 0;
  private isBlitzPhase = false;

  private activeTileIndex: number | null = null;
  private activeClue: ClueRecordV7 | null = null;
  private activeToyId: ToyIdV7 = 'TOY_01_KNIFE_SWITCH';
  private clueOpenedAtMs = 0;
  private remainingClueSec = 32;
  private activeMysteryChipsMult = 1.0;
  private activeSecretSquareBonusMult = 0;
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

    // 1. Persistent 90-Episode Campaign, Corpus & Psychoacoustic Showband Engine
    this.campaign = new CampaignDirectorV7();
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
    const initRival = CAST_PROFILES_V7[this.activeBlueprint.rivalId];
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
        void this.audio.unlock();
        this.audio.playRubberStamp();
        this.chosenCoupRegimeForPivot = chosenRegime;
        void this.launchCampaignWithColdOpenIfNeeded(bp);
      },
      onStartQuickPlay: () => {
        void this.audio.unlock();
        this.audio.playUiTap();
        const quickBp = this.buildQuickPlayBlueprint();
        void this.startMatch(quickBp, true, false);
      },
      onStartDailyBroadcast: () => {
        void this.audio.unlock();
        this.audio.playTileSelect();
        void this.startDailyBroadcastMatch();
      },
      onOpenHowToPlay: () => {
        void this.audio.unlock();
        this.audio.playUiTap();
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
        this.audio.playUiTap();
        this.returnToTitleHub();
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
        void this.audio.unlock();
        this.audio.playUiTap();
        void this.ui.handleFullscreenToggle();
      },
    });

    this.titleHub = new TitleAndOnboardingControllerV7(this.uiRoot, {
      onPlayCampaign: () => {
        void this.audio.unlock();
        this.audio.playTitleShowtimeFanfare();
        const bp = this.campaign.getCurrentEpisodeBlueprint();
        void this.launchCampaignWithColdOpenIfNeeded(bp);
      },
      onPlayDailyBroadcast: () => {
        void this.audio.unlock();
        this.audio.playTileSelect();
        void this.startDailyBroadcastMatch();
      },
      onQuickShow: () => {
        void this.audio.unlock();
        this.audio.playTileSelect();
        const quickBp = this.buildQuickPlayBlueprint();
        void this.startMatch(quickBp, true, false);
      },
      onOpenHowToPlay: () => {
        void this.audio.unlock();
        this.audio.playUiTap();
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
        void this.audio.unlock();
        this.audio.playUiTap();
        void this.ui.handleFullscreenToggle();
      },
      onUiTapSfx: () => {
        void this.audio.unlock();
        this.audio.playUiTap();
      },
      onBellSfx: () => {
        void this.audio.unlock();
        this.audio.playTileSelect();
      },
      onCelebrateSfx: () => {
        void this.audio.unlock();
        this.audio.playTrophyUnlockChime();
      },
    });

    this.twistTheater = new TvTwistTheaterV7(this.uiRoot, {
      onUiTapSfx: () => {
        void this.audio.unlock();
        this.audio.playUiTap();
      },
      onCurtainOpenSfx: () => {
        void this.audio.unlock();
        this.audio.playMysteryCurtainSpin();
      },
      onBargainBellSfx: () => {
        void this.audio.unlock();
        this.audio.playInstantBargainBell();
      },
      onBargainBuySfx: () => {
        void this.audio.unlock();
        this.audio.playTrophyUnlockChime();
      },
      onBargainPassSfx: () => {
        void this.audio.unlock();
        this.audio.playUiTap();
      },
      onSecretSquareSfx: () => {
        void this.audio.unlock();
        this.audio.playSecretSquareFanfare();
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

  private getTileScreenCoordinates(tileIdx: number): { xPx: number; yPx: number } {
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    const wp = this.board.getTileWorldPosition(tileIdx).clone().project(this.engine.camera);
    return {
      xPx: Math.round(rect.left + (wp.x * 0.5 + 0.5) * rect.width),
      yPx: Math.round(rect.top + (-wp.y * 0.5 + 0.5) * rect.height),
    };
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
      if (qaView === 'BOARD') {
        const stg =
          (params.get('stage') as StageWorldIdV7 | null) ??
          'STAGE_01_IBC_DAYTIME_FUNK';
        const brd =
          (params.get('board') as BoardIdV7 | null) ??
          BOARD_SPECS_V7[this.activeBlueprint.boardId]?.id ??
          'BOARD_01_FUNK_CROSSFADER';
        this.titleHub.hideAll();
        this.ui.hideTitleHub();
        this.ui.showTopBroadcastBug(true, false);
        this.phase = 'BOARD_SELECT';
        this.engine.boardMount.visible = true;
        this.activeBlueprint = { ...this.activeBlueprint, stageId: stg, boardId: brd };
        const spec = this.engine.setStageWorld(stg);
        this.board.loadBoard({
          boardId: brd,
          twistId: BOARD_SPECS_V7[brd].defaultTwistId,
          rivalId: this.activeBlueprint.rivalId,
          tableBedHex: spec.tableBedHex,
          trimVeneerHex: spec.trimVeneerHex,
          trimAccentHex: spec.trimAccentHex,
        });
        const rb = this.board.getBoardModeRuleBanner();
        this.ui.setBoardModeBanner({ modeTitle: rb.modeTitle, ruleSummary: rb.ruleSummary });
        this.syncTopBroadcastBug();
        this.engine.fitBoardToViewport(window.innerWidth, window.innerHeight);
        this.engine.renderFrameNow(1 / 60);
        return;
      }
      if (qaView === 'QUESTION_4CHOICE' || qaView === 'QUESTION_SHOWCASE') {
        const toy =
          qaView === 'QUESTION_4CHOICE'
            ? 'TOY_01_KNIFE_SWITCH'
            : ((params.get('toy') as ToyIdV7 | null) ?? 'TOY_03_VERNIER_DIAL');
        this.titleHub.hideAll();
        this.ui.hideTitleHub();
        this.ui.showTopBroadcastBug(true, false);
        this.phase = 'BOARD_SELECT';
        this.syncTopBroadcastBug();
        window.setTimeout(() => {
          const openTile =
            this.board.getTiles().find((t) => !t.isVaultLocked && t.state === 'OPEN') ??
            this.board.getTiles()[0];
          if (openTile) {
            void this.selectBoardTile(openTile.index, toy);
          }
        }, 120);
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

  private async launchCampaignWithColdOpenIfNeeded(bp: EpisodeBlueprintV7): Promise<void> {
    const save = this.campaign.getState();
    this.campaign.ensureDefaultWaiverIfMissing();

    // Immediately start the 1966 Story & 30-Second Host Rules Cold-Open on Episode 1 / first launch!
    const shouldPlayColdOpen =
      !this.titleHub.hasCompletedColdOpen() ||
      (save.episodesPlayed === 0 && bp.episodeNumber === 1);

    if (shouldPlayColdOpen) {
      await this.titleHub.playStoryAndRulesColdOpen({ episodeBlueprint: bp });
    } else {
      this.titleHub.hideAll();
    }

    await this.startMatch(bp, false, false);
  }

  public async startDailyBroadcastMatch(): Promise<void> {
    const dailyBp = getTodayBroadcastBlueprintV7();
    this.activeDailyBlueprint = dailyBp;
    this.dailyTileHistory = [];
    this.titleHub.hideAll();
    await this.startMatch(dailyBp, true, true);
  }

  public returnToTitleHub(): void {
    this.matchGenerationId += 1;
    this.disposeActiveContraption();
    this.ui.closeQuestionChassis();
    this.ui.hideModalStage();
    this.ui.hideTitleHub();
    this.engine.setCardApertureOpen(false);
    this.engine.triggerRowCGlint(false);
    this.audio.setClueSanctuaryActive(false);
    this.audio.setTrapdoorBlitzActive(false);
    this.audio.setBellamySpiteChop(false);
    this.audio.setCensorMicHold(false, 0);
    this.audio.enterGreenRoom();

    this.phase = 'HUB';
    this.isDailyBroadcast = false;
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

  private buildQuickPlayBlueprint(): EpisodeBlueprintV7 {
    const base = this.campaign.getCurrentEpisodeBlueprint();
    const showcaseBoards: readonly BoardIdV7[] = [
      'BOARD_01_FUNK_CROSSFADER',
      'BOARD_02_JUBILEE_HEX_BRIDGE',
      'BOARD_06_BOARDWALK_PINBALL',
      'BOARD_07_MONTE_CARLO_SHOE',
      'BOARD_08_GEODESIC_SUNDIAL',
    ];
    const boardIdx =
      (this.campaign.getState().episodesPlayed + Math.floor(performance.now() * 0.001)) %
      showcaseBoards.length;
    const boardId = showcaseBoards[boardIdx];
    const spec = BOARD_SPECS_V7[boardId];
    return {
      ...base,
      code: 'QUICK',
      title: `1966 Studio 6A Showcase — ${spec.name}`,
      stageId: spec.homeStageId,
      boardId,
      twistId: spec.defaultTwistId,
      isCoupPivot: false,
      isFinale: false,
    };
  }

  private mountStageAndBoardForBlueprint(
    bp: EpisodeBlueprintV7,
    seedOffset?: number,
  ): void {
    const save = this.campaign.getState();
    const vw = this.canvasRoot.clientWidth || window.innerWidth;
    const vh = this.canvasRoot.clientHeight || window.innerHeight;
    this.board.setPortraitMode(vw < vh);
    const stageSpec = this.engine.setStageWorld(bp.stageId);
    this.engine.boardMount.visible = true;
    this.engine.setCoupRegime(save.activeCoupRegime);

    const rivalProfile = CAST_PROFILES_V7[bp.rivalId];
    const weakCats = bp.isFinale
      ? [...rivalProfile.weakCategories, ...CAST_PROFILES_V7.GRANT_BELLAMY.weakCategories]
      : rivalProfile.weakCategories;

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

    this.engine.fitBoardToViewport(vw, vh);
  }

  // --------------------------------------------------------------------------
  // Live Broadcast Match Lifecycle (10-Turn Show OR 6-Turn Daily 1966 Broadcast)
  // --------------------------------------------------------------------------

  public async startMatch(
    blueprint: EpisodeBlueprintV7,
    quickPlay = false,
    dailyBroadcast = false,
  ): Promise<void> {
    const gen = ++this.matchGenerationId;
    this.disposeActiveContraption();
    this.titleHub.hideAll();
    this.ui.hideTitleHub();
    this.ui.closeQuestionChassis();
    this.ui.hideModalStage();

    this.activeBlueprint = blueprint;
    this.isQuickPlay = quickPlay;
    this.isDailyBroadcast = dailyBroadcast;
    this.totalTurnsInCurrentMatch =
      dailyBroadcast && this.activeDailyBlueprint
        ? this.activeDailyBlueprint.recommendedTurns
        : TOTAL_TURNS_PER_MATCH;

    this.turnNumber = 1;
    this.playerMatchScore = 0;
    this.rivalMatchScore = 0;
    this.currentStreak = 0;
    this.correctCountInMatch = 0;
    this.blitzCorrectCount = 0;
    this.isBlitzPhase = false;
    this.activeMysteryChipsMult = 1.0;
    this.activeSecretSquareBonusMult = 0;

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

    this.corpus.resetMatchCadence(
      dailyBroadcast && this.activeDailyBlueprint
        ? this.activeDailyBlueprint.dailySeed
        : blueprint.episodeNumber * 977 + 1966,
    );

    // Warm season corpus shard in background
    void this.corpus.warmSeasonShards(blueprint.season);

    const save = this.campaign.getState();
    const rivalProfile = CAST_PROFILES_V7[blueprint.rivalId];
    this.activeJuryBallot =
      !dailyBroadcast && blueprint.season === 4
        ? this.campaign.evaluateVipJuryBallot(blueprint.rivalId)
        : null;

    // Calibrate Rival expected match score fairly around uncapped Chips × Mult economy
    const juryEvBoost = this.activeJuryBallot?.rivalEvBonusRatio ?? 0;
    const seasonScale = 0.88 + (blueprint.season - 1) * 0.08;
    const turnsRatio = this.totalTurnsInCurrentMatch / TOTAL_TURNS_PER_MATCH;
    this.rivalExpectedMatchScore = Math.round(
      3100 * turnsRatio * (rivalProfile.baseAccuracy + juryEvBoost) * seasonScale,
    );

    this.mountStageAndBoardForBlueprint(
      blueprint,
      dailyBroadcast && this.activeDailyBlueprint
        ? this.activeDailyBlueprint.dailySeed
        : undefined,
    );
    this.engine.setVipJuryState(
      Boolean(this.activeJuryBallot?.active),
      Boolean(this.activeJuryBallot?.active),
    );
    this.engine.setCardApertureOpen(false);

    // Engage genre-honest Showband stage music
    this.audio.setCoupRegime(save.activeCoupRegime);
    this.audio.setBellamySpiteChop(false);
    this.audio.setTrapdoorBlitzActive(false);
    this.audio.setClueSanctuaryActive(false);
    this.audio.setStageWorld(blueprint.stageId);

    if (gen !== this.matchGenerationId) return;

    this.ui.showTopBroadcastBug(true, false);

    // Announce the active 1966 Board Gameplay Mode & Trigger Eye-Guess Memory Flash if applicable!
    const ruleBanner = this.board.getBoardModeRuleBanner();
    this.ui.setBoardModeBanner({
      modeTitle: ruleBanner.modeTitle,
      ruleSummary: ruleBanner.ruleSummary,
    });
    this.instantBargainOfferedInMatch = false;
    this.announcer.resetForNewEpisode({
      blueprint,
      rivalId: blueprint.rivalId,
      stageId: blueprint.stageId,
      isDailyBroadcast: dailyBroadcast,
      dailyEpisodeNumber: this.activeDailyBlueprint?.dailyNumber,
    });
    this.announcer.setPhase('BOARD_SELECT');
    if (ruleBanner.mode === 'EYE_GUESS_MEMORY') {
      this.board.triggerEyeGuessMemoryFlash(2.4);
      this.announcer.onBoardModeHighlight('EYE_GUESS_MEMORY', {
        blueprint,
        rivalId: blueprint.rivalId,
      });
    } else {
      this.announcer.onEpisodeKickoff({
        blueprint,
        rivalId: blueprint.rivalId,
        isDailyBroadcast: dailyBroadcast,
      });
    }

    this.beginBoardSelectTurn();
  }

  private beginBoardSelectTurn(): void {
    this.phase = 'BOARD_SELECT';
    this.activeTileIndex = null;
    this.activeClue = null;
    this.ui.showTopBroadcastBug(true, true);

    // Safety guard: guarantee clickable 3D tiles are always available on every turn!
    const playableCount = this.board
      .getTiles()
      .filter((t) => t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR').length;
    if (playableCount === 0) {
      this.board.reRackFreshWave(2);
    }

    // Preview Rival's intended 3D tile with floating crimson OverheadCrosshair
    this.board.previewRivalIntent();

    // Check Stage 07 / Finale Bellamy Spite Chop when player leads by >= $300 in Round 3+
    const rivalProfile = CAST_PROFILES_V7[this.activeBlueprint.rivalId];
    const shouldSpiteChop =
      !this.isDailyBroadcast &&
      !this.censorShieldChargedThisMatch &&
      this.turnNumber >= 7 &&
      this.playerMatchScore - this.rivalMatchScore >= 300 &&
      (this.activeBlueprint.stageId === 'STAGE_07_1969_MONTE_CARLO_CASINO' ||
        this.activeBlueprint.isFinale ||
        rivalProfile.role === 'RIVAL_HEEL');
    this.audio.setBellamySpiteChop(shouldSpiteChop);
    this.ui.setSabotageWarningActive(shouldSpiteChop);

    // Trigger live Booth Cheat Tell on Heel Rivals (or Finale turns 3, 6, 8) so player can catch it!
    if (!this.isDailyBroadcast) {
      this.maybeTriggerBoothCheatTell();
    } else {
      this.clearBoothCheatTell();
    }

    // Keep side-rail hidden unless an active tell or sabotage is actually happening (fixes Tablet overlap!)
    this.ui.showTopBroadcastBug(true, this.boothTellActive || shouldSpiteChop);

    this.syncTopBroadcastBug();
  }

  private maybeTriggerBoothCheatTell(): void {
    const rival = CAST_PROFILES_V7[this.activeBlueprint.rivalId];
    const isTellTurn =
      (rival.cheatChannel !== 'HONEST' &&
        (this.turnNumber === 2 || this.turnNumber === 5 || this.turnNumber === 8)) ||
      (this.activeBlueprint.isFinale && (this.turnNumber === 3 || this.turnNumber === 7));

    if (!isTellTurn) {
      this.clearBoothCheatTell();
      return;
    }

    const channel: CheatTellChannelV7 =
      rival.cheatChannel !== 'HONEST' ? rival.cheatChannel : 'SOLENOID_SPARK';
    this.boothTellActive = true;
    this.boothTellChannel = channel;
    this.boothTellRemainingSec = 8.0;
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
    void this.audio.unlock();
    if (this.phase !== 'BOARD_SELECT' && this.phase !== 'QUESTION_OPEN') return;

    if (this.boothTellActive) {
      this.clearBoothCheatTell();
      this.audio.playBoothArrestSiren();
      this.boothArrestsInMatch += 1;
      const res = this.campaign.recordLiveBoothArrest(this.activeBlueprint.rivalId);
      this.playerMatchScore += res.cleanBountyCash;
      this.earnedTrophiesInMatch.add('trophy_s1_08');
      this.ui.setRivalEmotion('BREAKDOWN');
      this.syncTopBroadcastBug('BREAKDOWN');
      this.ui.showLiveToast(
        `BOOTH FEED INTERCEPTED! +$${res.cleanBountyCash} CLEAN PURSE BOUNTY`,
        'emerald',
        2600,
      );
    } else {
      // False-alarm tap: subtle mechanical switch click + plain-English explanation!
      this.audio.playKnifeSwitch();
      this.ui.showLiveToast(
        'NO CHEAT ACTIVE — Press ONLY when Rival flashes LIVE TELL to bust Booth rigging (+$400)!',
        'brass',
        2600,
      );
    }
  }

  private handleCensorPaddleHold(held: boolean): void {
    void this.audio.unlock();
    this.censorHeld = held;
    if (!held) {
      this.audio.setCensorMicHold(false, this.censorCharge01);
    }
  }

  private computeMaxDifficultyForTurn(turn: number): DifficultyTierV7 {
    if (this.activeBlueprint.episodeNumber === 1 && turn <= 2) return 1;
    if (turn <= 3) return 2;
    if (turn <= 6) return 3;
    if (turn <= 8) return 4;
    return 5;
  }

  // --------------------------------------------------------------------------
  // Direct 3D Tile Selection -> Eye-Level Contraption -> 1.80s Reveal -> 1.20s Rival
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

    // 1. Check 🔒 LOCKED_VAULT padlock before consuming turn!
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

    this.phase = 'QUESTION_OPEN';
    this.announcer.setPhase('QUESTION_OPEN');
    this.ui.setBoardModeBanner(null);
    this.activeTileIndex = tileIndex;
    this.activeMysteryChipsMult = 1.0;
    this.activeSecretSquareBonusMult = 0;
    this.board.setHoveredTile(null);
    this.board.triggerTileDetentPress(tileIndex);
    this.audio.playTileSelect();

    // 2. Check ⭐ SECRET_SQUARE (Hidden 1966 Daily Double!)
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

    // 3. Check ❓ MYSTERY_CURTAIN (Interactive 3-Door Let's Make a Deal Stage Pick!)
    if (tile.tvTwist === 'MYSTERY_CURTAIN' && !preferredToyOverride) {
      const doorsPreview = this.board.previewMysteryCurtainDoors(tileIndex);
      this.announcer.onClassicTvTwist('MYSTERY_CURTAIN', {
        rivalId: this.activeBlueprint.rivalId,
        category: tile.category,
      });
      const chosenCurtainNum = await this.twistTheater.playMysteryCurtainDoorPick(doorsPreview);
      if (this.disposed || gen !== this.matchGenerationId) return;

      const curtain = this.board.rollMysteryCurtainOutcome(tileIndex, chosenCurtainNum);
      this.activeMysteryChipsMult = curtain.chipsMultiplier;
      if (curtain.instantCashDelta !== 0 || curtain.rivalCashDelta !== 0) {
        this.playerMatchScore = Math.max(0, this.playerMatchScore + curtain.instantCashDelta);
        this.rivalMatchScore = Math.max(0, this.rivalMatchScore + curtain.rivalCashDelta);
        this.syncTopBroadcastBug();
      }
      // Celebrate Curtain reveal with crisp confetti (no center text pop right before Question opens!)
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

    // Preview live multiplier on the Warm Broadcast Cream header
    const opponentChoiceBonus = tile.tvTwist === 'OPPONENT_CHOICE' ? 0.5 : 0;
    const rawBoardBonus =
      Math.max(0, tile.boardMultBonus) +
      this.activeSecretSquareBonusMult +
      opponentChoiceBonus +
      (tile.hasAmberTruce ? 0.35 : 0) +
      (tile.isWheelhouse ? 0.5 : 0) +
      (tile.hasUhfHalo ? 0.2 : 0);
    const maxBoardBonus = this.currentStreak >= 1 || secretReveal.wasSecretSquare ? 2.5 : 1.5;
    const liveMultPreview = 1.0 + Math.min(maxBoardBonus, rawBoardBonus);

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

    const effectiveDisplayChips = Math.round(tile.baseChips * this.activeMysteryChipsMult);
    const activeTwistBadge = secretReveal.wasSecretSquare
      ? 'SECRET_SQUARE'
      : tile.tvTwist ?? 'NONE';

    const toyMeta = TOY_CONTRAPTION_META_V7[draw.selectedToy];
    this.vfx.clearTransientPopups();
    const toyMountEl = this.ui.openQuestionChassis({
      clue: displayClue,
      baseChips: effectiveDisplayChips,
      liveMultPreview,
      countdownSeconds: totalSec,
      totalCountdownSeconds: totalSec,
      isWheelhouse: tile.isWheelhouse,
      hasAmberTruce: tile.hasAmberTruce,
      tvTwist: activeTwistBadge,
      isShowcaseFormat: isShowcaseSelected,
      showcaseFormatName: isShowcaseSelected ? toyMeta?.name : undefined,
    });

    // Determine diegetic metadata overlays ([VOID], Canary Grease-Pencil Tick, UV [POISONED FIX])
    const hasScalpelRelic = save.equippedRelics.some(
      (r) => r.relicId === 'relic_inez_root_scalpel',
    );
    const pruneActive =
      (save.waiver?.dayJob === 'NIGHT_FACT_CHECKER' && this.turnNumber <= 3) ||
      hasScalpelRelic;

    const hasUvRelic = save.equippedRelics.some(
      (r) => r.relicId === 'relic_uv_blacklight_loupe',
    );
    let canaryTickIdx: number | null = null;
    if (this.canaryPendingNextTurn) {
      canaryTickIdx = this.activeBlueprint.canaryIsPoisoned
        ? draw.clue.poisonedFixIdx
        : draw.clue.answerIdx;
    }

    const stageSpec = STAGE_WORLD_SPECS_V7[this.activeBlueprint.stageId];
    this.disposeActiveContraption();
    this.activeContraption = mountTactileContraptionV7(
      toyMountEl,
      draw.clue,
      draw.selectedToy,
      {
        pruneActive,
        canaryTickIdx,
        uvLoupeActive: this.canaryPendingNextTurn && hasUvRelic,
        dayJob: save.waiver?.dayJob ?? null,
        reducedMotion: save.settings.reducedMotion,
        highContrastBadges: save.settings.highContrastBadges,
        brassAccentHex: stageSpec.trimAccentHex,
        onTactileSfx: (ev) => this.playContraptionSfx(ev),
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

    this.disposeActiveContraption();
    this.engine.setCardApertureOpen(false);
    this.audio.setClueSanctuaryActive(false);

    const tileSnapshot = this.board.getTile(tileIdx);
    if (!tileSnapshot) return;

    // Evaluate live 16-twist board claim & trust deltas
    const prelimScored = resolution.isCorrect || resolution.accuracyRatio >= 0.35;
    const twistBreakdown = this.board.claimPlayerTile(tileIdx, prelimScored);
    if (twistBreakdown.respectedAmberTruce) {
      this.respectedAmberTruceInMatch = true;
    }
    if (twistBreakdown.poachedAmberTruce) {
      this.poachedAmberTruceInMatch = true;
    }

    const save = this.campaign.getState();
    const rivalProfile = CAST_PROFILES_V7[this.activeBlueprint.rivalId];

    // Evaluate full bounded turn economy (Waiver + Board Twists + 28 Relics + 4 Foils + VIP Jury)
    const opponentChoiceMult = tileSnapshot.tvTwist === 'OPPONENT_CHOICE' ? 0.5 : 0;
    const economy = evaluateTurnEconomyV7({
      tile: {
        baseChips: Math.round(twistBreakdown.effectiveChips * this.activeMysteryChipsMult),
        boardMultBonus:
          twistBreakdown.cappedMultBonus +
          this.activeSecretSquareBonusMult +
          opponentChoiceMult,
        category: tileSnapshot.category,
        domain: tileSnapshot.domain,
        hasAmberTruce: tileSnapshot.hasAmberTruce,
        hasUhfHalo: tileSnapshot.hasUhfHalo,
        isRiggedSolenoid: tileSnapshot.isRiggedSolenoid,
        isRivalTarget: tileSnapshot.isRivalTarget,
        isWheelhouse: tileSnapshot.isWheelhouse,
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
      waiver: save.waiver,
      equippedRelics: save.equippedRelics,
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

    const opponentChoiceFlatBonus =
      economy.scored && tileSnapshot.tvTwist === 'OPPONENT_CHOICE' ? 100 : 0;

    // Evaluate 6-Board-Gameplay-Mode bonus (3-in-a-row Line, Hex Bridge, Concentration Pair/Steal)
    const modeBonus = this.board.evaluateBoardModePostClaim(tileIdx, economy.scored);
    const modeBonusCash = modeBonus.bonusCash;
    const modeStealCash = modeBonus.rivalStealCash;
    const tileScreenPt = this.getTileScreenCoordinates(tileIdx);

    // Update live match counters & feat trophies
    const totalTurnGain =
      economy.netCashDelta + opponentChoiceFlatBonus + modeBonusCash + modeStealCash;
    this.playerMatchScore = Math.max(0, this.playerMatchScore + totalTurnGain);
    if (modeStealCash > 0) {
      this.rivalMatchScore = Math.max(0, this.rivalMatchScore - modeStealCash);
    }
    this.currentStreak = economy.nextStreak;
    this.cleanBonusCashInMatch += economy.cleanSideDividend;
    this.contrabandBonusCashInMatch += economy.contrabandSideCut;

    if (this.isDailyBroadcast) {
      const effectiveTwist =
        this.activeSecretSquareBonusMult > 0
          ? 'SECRET_SQUARE'
          : tileSnapshot.tvTwist;
      this.dailyTileHistory.push(
        classifyDailyTileOutcomeV7({
          scored: economy.scored,
          tvTwist: effectiveTwist,
          selectedToy: this.activeToyId,
        }),
      );
    }

    if (economy.scored) {
      this.correctCountInMatch += 1;
      this.claimedDomainsInMatch.add(tileSnapshot.domain);
      if (this.isBlitzPhase) {
        this.blitzCorrectCount += 1;
        if (this.blitzCorrectCount >= 2) {
          this.earnedTrophiesInMatch.add('trophy_s3_25'); // Trapdoor Blitz Survivor!
        }
      }
      this.checkContraptionFeatTrophies(clue, resolution);

      // Kinetic 1966 Floating Score Popup + Studio Flashbulbs on big hits!
      this.vfx.spawnFloatingScorePop(
        tileScreenPt.xPx,
        tileScreenPt.yPx,
        `+$${Math.max(0, totalTurnGain).toLocaleString()}`,
        this.currentStreak >= 2 ? `🔥 ${this.currentStreak}× HOT STREAK` : getFriendlyCategoryLabelV7(tileSnapshot.category),
        totalTurnGain >= 450 ? 'JACKPOT' : 'PEACOCK',
      );
      if (totalTurnGain >= 450 || this.currentStreak >= 3) {
        this.vfx.flashStudioAudienceBulbs({ count: 12, durationMs: 800 });
      }

      // Unlock any adjacent 🔒 LOCKED_VAULT tiles (or all vaults on a 2+ streak)!
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
        this.announcer.onBoardModeHighlight(modeBonus.mode, {
          rivalId: this.activeBlueprint.rivalId,
          cashDelta: modeBonusCash + modeStealCash,
        });
        this.ui.showLiveToast(modeBonus.bannerHeadline, 'emerald', 2800);
      } else {
        this.announcer.evaluateMatchStateTransition({
          turnNumber: this.turnNumber,
          totalTurns: this.totalTurnsInCurrentMatch,
          playerCash: this.playerMatchScore,
          rivalCash: this.rivalMatchScore,
          streak: this.currentStreak,
          rivalId: this.activeBlueprint.rivalId,
          stageId: this.activeBlueprint.stageId,
          lastCategory: tileSnapshot.category,
          isDailyBroadcast: this.isDailyBroadcast,
        });
      }
    }

    // Play Post-Answer Showband Bloom / Vault Chime / QI Klaxon + Shepard Cascade Ticks!
    this.audio.playAnswerReveal(economy.scored, resolution.triggeredKlaxon);
    if (economy.turnCash > 0) {
      const steps = Math.min(6, Math.max(2, Math.ceil(economy.turnCash / 160)));
      for (let s = 0; s < steps; s++) {
        window.setTimeout(() => {
          if (!this.disposed && gen === this.matchGenerationId) {
            this.audio.playScoreCascadeTick(s);
          }
        }, 790 + s * 68);
      }
    }

    const postEmotion: PortraitEmotionV7 =
      economy.scored && economy.turnCash >= 350
        ? 'RATTLED'
        : this.boothTellActive
          ? 'TELL'
          : 'POISED';
    this.syncTopBroadcastBug(postEmotion);

    // Mandatory ~1.80s 4-Beat Post-Answer Theater (NEVER 0ms hard-cut!)
    const theaterDwellMs = save.settings.reducedMotion ? 1800 : 1850;
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
    this.vfx.clearTransientPopups();
    await this.ui.playPostAnswerTheater({
      resolution,
      ahaFactoid: postAhaFactoid,
      economy,
      dwellMs: theaterDwellMs,
    });
    if (this.disposed || gen !== this.matchGenerationId) return;

    // Brief sightline breath on the 3D Contraption Board before visible Rival choreography
    await sleepMs(140);
    if (this.disposed || gen !== this.matchGenerationId) return;

    // Mandatory ~1.20s Visible Rival Turn on the 3D Board!
    await this.executeVisibleRivalTurn(gen);
    if (this.disposed || gen !== this.matchGenerationId) return;

    // Advance Pacing Gates:
    //  - Standard 10-turn show: Turn 5 Re-Rack (+ Canary in Ep >= 2) & Turn 8 Finale Blitz!
    //  - 6-Turn Daily 1966 Broadcast: crisp uninterrupted 6-turn head-to-head sprint!
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
      // Re-rack fresh Round-2 Double-Stakes wave so 12-tile boards NEVER exhaust!
      this.board.reRackFreshWave(2);
      this.audio.playSplitFlapTick();
      this.ui.showLiveToast(
        '★ ROUND 2 DOUBLE DOLLARS — FRESH TOTE BOARD RE-RACK!',
        'brass',
        2400,
      );
      (
        this.board as unknown as { triggerEyeGuessMemoryFlash?: (dur?: number) => void }
      ).triggerEyeGuessMemoryFlash?.(2.2);
      await sleepMs(220);
      if (this.disposed || gen !== this.matchGenerationId) return;
    }

    if (!this.isDailyBroadcast && this.turnNumber === 8) {
      this.isBlitzPhase = true;
      this.board.triggerBlitzReRack();
      this.audio.playTileSelect();
      this.audio.setTrapdoorBlitzActive(true);
      this.ui.showLiveToast(
        '⚡ FINAL 2 TURNS — LIGHTNING BONUS ROUND LIVE!',
        'crimson',
        2500,
      );
      await sleepMs(320);
      if (this.disposed || gen !== this.matchGenerationId) return;
    }

    // 1969 Sale of the Century Mid-Show INSTANT BARGAIN Turntable (Turn 4 or 6 when holding >= $220!)
    if (
      !this.isDailyBroadcast &&
      !this.instantBargainOfferedInMatch &&
      (this.turnNumber === 4 || this.turnNumber === 6) &&
      this.playerMatchScore >= 220
    ) {
      const curSave = this.campaign.getState();
      if (curSave.equippedRelics.length < 5) {
        const ownedSet = new Set(curSave.equippedRelics.map((r) => r.relicId));
        const bargainRelic = RELIC_CATALOG_V7.find(
          (r) => r.ledgerKind === 'CLEAN' && !ownedSet.has(r.relicId),
        );
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
            const burnRes = executeLiveScoreBurnBuyV7(
              this.playerMatchScore,
              curSave.equippedRelics,
              bargainRelic.relicId,
            );
            if (burnRes.ok) {
              this.playerMatchScore = Math.max(0, this.playerMatchScore - bargainCost);
              this.campaign.purchaseOrEquipRelic(
                bargainRelic.relicId,
                'GILDED',
                undefined,
                true,
              );
              this.vfx.burstLivingColorConfetti('MEDIUM');
              this.syncTopBroadcastBug();
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
    this.announcer.setPhase('BOARD_SELECT');
    const rb = this.board.getBoardModeRuleBanner();
    this.ui.setBoardModeBanner({ modeTitle: rb.modeTitle, ruleSummary: rb.ruleSummary });
    this.beginBoardSelectTurn();
  }

  private checkContraptionFeatTrophies(
    clue: ClueRecordV7,
    res: ToyResolutionV7,
  ): void {
    if (clue.isKlaxonMyth && res.isCorrect && !res.triggeredKlaxon) {
      this.earnedTrophiesInMatch.add('trophy_s1_06'); // Klaxon Myth-Buster
    }
    if (this.activeToyId === 'TOY_03_VERNIER_DIAL' && res.accuracyRatio >= 0.99) {
      this.earnedTrophiesInMatch.add('trophy_s1_07'); // Exact Vernier Caliper
    }
    if (this.activeToyId === 'TOY_05_RELIEF_GLOBE_3D' && res.accuracyRatio >= 0.99) {
      this.earnedTrophiesInMatch.add('trophy_s2_14'); // <350km Relief Globe Pin
    }
    if (this.activeToyId === 'TOY_13_CYANOTYPE_LOUPE' && res.isCorrect) {
      this.earnedTrophiesInMatch.add('trophy_s2_16'); // Cyanotype Chamber Master
    }
    if (
      this.activeToyId === 'TOY_14_FOUR_SHUTTER_REEL' &&
      res.isCorrect &&
      res.chipMultiplier >= 1.95
    ) {
      this.earnedTrophiesInMatch.add('trophy_s2_17'); // Shutter-One 2.0x Clincher
    }
    if (this.activeToyId === 'TOY_12_CONSPIRACY_LASSO' && res.isCorrect) {
      this.earnedTrophiesInMatch.add('trophy_s3_24'); // Corkboard Twine Triad
    }
  }

  private async executeVisibleRivalTurn(gen: number): Promise<void> {
    this.phase = 'RIVAL_TURN';
    const openTiles = this.board
      .getTiles()
      .filter((t) => t.state === 'OPEN' || t.state === 'BLITZ_SURVIVOR');

    if (openTiles.length === 0) return;

    const targetIdx =
      this.board.previewRivalIntent() ?? openTiles[0].index;
    this.board.resolveRivalOpponentChoiceIfNeeded(targetIdx);
    const targetTile = this.board.getTile(targetIdx) ?? openTiles[0];
    const friendlyCat = getFriendlyCategoryLabelV7(targetTile.category);

    // Deterministic, human-honest Rival scoring (misses ~35%–42% overall, ~68% on Weak Spots!)
    const rivalProfile = CAST_PROFILES_V7[this.activeBlueprint.rivalId];
    const isWeak = rivalProfile.weakCategories.includes(targetTile.category);
    const isStrong = rivalProfile.strongCategories.includes(targetTile.category);
    let hitThreshold = rivalProfile.baseAccuracy;
    if (isWeak) hitThreshold -= 0.24;
    if (isStrong) hitThreshold += 0.08;
    if (this.boothArrestsInMatch > 0 && rivalProfile.role === 'RIVAL_HEEL') {
      hitThreshold -= 0.16; // Catching a Heel's booth feed rattles their accuracy!
    }

    const seedBase =
      this.isDailyBroadcast && this.activeDailyBlueprint
        ? this.activeDailyBlueprint.dailySeed
        : this.activeBlueprint.episodeNumber * 37;
    const roll =
      ((seedBase + this.turnNumber * 29 + targetTile.index * 19 + 7) % 100) / 100;
    const rivalScored = roll < Math.max(0.2, Math.min(0.76, hitThreshold));

    // Choreograph 1.20s Rival turn: locks crimson ONLY if rivalScored, else rebounds OPEN with +$50!
    await this.board.animateRivalClaim(targetTile.index, rivalScored, () => {
      if (!this.disposed && gen === this.matchGenerationId) {
        if (rivalScored) {
          this.audio.playRivalTileClaim();
        } else {
          this.audio.playAnswerReveal(false, false);
        }
      }
    });
    if (this.disposed || gen !== this.matchGenerationId) return;

    if (rivalScored) {
      const mult = 1.12 + Math.min(0.75, Math.max(0, targetTile.boardMultBonus * 0.7));
      const gain = Math.round(targetTile.baseChips * mult);
      this.rivalMatchScore += gain;
      this.audio.playSplitFlapTick();
      this.ui.showLiveToast(
        `${rivalProfile.name.toUpperCase()} CLAIMED ${friendlyCat} (+$${gain})`,
        'crimson',
        1850,
      );
      this.syncTopBroadcastBug();
    } else {
      this.announcer.onRivalMissRebound({
        rivalId: this.activeBlueprint.rivalId,
        category: targetTile.category,
      });
      this.ui.showLiveToast(
        `${rivalProfile.name.toUpperCase()} MISSED ${friendlyCat}! (+$50 REBOUND OPEN!)`,
        'emerald',
        2250,
      );
      this.syncTopBroadcastBug('RATTLED');
    }
  }

  private async finishMatchCeremony(gen: number): Promise<void> {
    this.phase = 'CEREMONY';
    this.announcer.setPhase('CEREMONY');
    this.vfx.clearTransientPopups();
    this.ui.setBoardModeBanner(null);
    this.clearBoothCheatTell();
    this.ui.setSabotageWarningActive(false);
    this.audio.setTrapdoorBlitzActive(false);
    this.audio.setBellamySpiteChop(false);
    this.audio.setCensorMicHold(false, 0);

    const didWin = this.playerMatchScore > this.rivalMatchScore;
    this.audio.playEpisodeCeremonyFanfare(didWin);
    if (didWin) {
      if (this.isDailyBroadcast) {
        // Keep Living Color confetti + audience flashbulbs without covering Daily Share Modal score band!
        this.vfx.burstLivingColorConfetti('MEDIUM');
        this.vfx.flashStudioAudienceBulbs({ count: 16, durationMs: 1100 });
        this.announcer.dismissImmediate();
      } else {
        this.vfx.celebrateEpisodeWin(
          '★ STUDIO CHAMPION! ★',
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
      const rivalName = CAST_PROFILES_V7[this.activeBlueprint.rivalId].name;
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

    if (this.censorShieldChargedThisMatch && didWin) {
      this.cleanBonusCashInMatch += 250;
    }

    const summary = this.campaign.recordEpisodeOutcome({
      blueprint: this.activeBlueprint,
      playerMatchScore: this.playerMatchScore,
      rivalMatchScore: this.rivalMatchScore,
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

    if (summary.newlyUnlockedTrophies.length > 0) {
      this.audio.playTrophyUnlockChime();
    }

    await this.ui.playDualPurseCeremony(
      this.activeBlueprint,
      this.playerMatchScore,
      this.rivalMatchScore,
      summary,
    );
    if (this.disposed || gen !== this.matchGenerationId) return;

    if (this.isQuickPlay) {
      this.returnToTitleHub();
      return;
    }

    // Seamless next-episode progression via Green Room Call-Sheet!
    const nextBp = this.campaign.getCurrentEpisodeBlueprint();
    this.activeBlueprint = nextBp;
    this.mountStageAndBoardForBlueprint(nextBp);
    this.audio.enterGreenRoom();
    this.ui.showTopBroadcastBug(false, false);

    const { chosenRegime } = await this.ui.showGreenRoomCallSheet(nextBp);
    if (this.disposed || gen !== this.matchGenerationId) return;
    this.chosenCoupRegimeForPivot = chosenRegime;
    await this.startMatch(nextBp, false);
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
    });
  }

  // --------------------------------------------------------------------------
  // 60fps Frame Update (3D Kinesthetics, ANSI VU Needle, Timers, Censor Hold)
  // --------------------------------------------------------------------------

  private onFrame(dtSec: number): void {
    const boardDt =
      this.phase === 'RIVAL_TURN' &&
      this.rivalFastForwardHeld &&
      this.activeBlueprint.episodeNumber >= 2
        ? dtSec * 2.0
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

    // Live 8.0s Booth Cheat Tell Window
    if (this.boothTellActive) {
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
    if (this.phase === 'QUESTION_OPEN' && this.activeClue) {
      this.remainingClueSec -= dtSec;
      this.ui.updateQuestionCountdown(this.remainingClueSec);

      const ceilSec = Math.max(0, Math.ceil(this.remainingClueSec));
      if (ceilSec <= 5 && ceilSec !== this.lastTickedWholeSec) {
        this.lastTickedWholeSec = ceilSec;
        this.audio.playCountdownTick(ceilSec);
      }

      if (this.remainingClueSec <= 0) {
        const clue = this.activeClue;
        void this.resolvePlayerTurn({
          isCorrect: false,
          accuracyRatio: 0,
          chipMultiplier: 1.0,
          chosenSummary: 'Time Expired',
          trueAnswerDisplay: clue.cyanotype
            ? clue.cyanotype.targetZoneName
            : clue.choices[clue.answerIdx],
          triggeredKlaxon: false,
          fellForPoisonedFix: false,
        });
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
      void this.audio.unlock();
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
          twistId: this.board.getActiveTwistId(),
          twistCount: Object.keys(BOARD_TWIST_SPECS_V7).length,
          boardCatalogCount: ALL_BOARD_IDS_V7.length,
          toyCatalogCount: ALL_TOY_IDS_V7.length,
          categoryCatalogCount: ALL_CATEGORIES_V7.length,
          trophyCatalogIds: TROPHY_CATALOG_V7.map((t) => t.trophyId),
          turnNumber: this.turnNumber,
          playerMatchScore: this.playerMatchScore,
          rivalMatchScore: this.rivalMatchScore,
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
        // Trigger representative foley beats during Showband playback
        this.audio.playTileHover();
        window.setTimeout(() => this.audio.playTileSelect(), 450);
        window.setTimeout(() => this.audio.playCountdownTick(3), 1100);
        window.setTimeout(() => this.audio.playAnswerReveal(true, false), 1850);
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
