// ============================================================================
// WORLD'S SMARTEST — Master Sovereign Integration Controller (Wave-2 Complete)
// Unites:
//  • Stage3DDirector (Three.js r172 PBR + All 8 3D Venues + 7 Boss Relics + MSDF)
//  • ForgeEngine (1,000,129 Playable QIDs + 128 KB Roaring Bitset + 12-Domain IRT)
//  • Narrative & 5 Modes (Prologue, 40-Mission Campaign, Daily, Briefing, Endless, Trials)
//  • Wave2NarrativeDirector (16 Backstage Trees, 24 Live Callouts, 40 Lore Logs)
//  • MetaProgressionSuite (Passport 2.0, 3D Observatory, Prism Atelier, Factions)
//  • MotionCinemaDirector, BossPhaseBannerDirector, EndingSequenceDirector
//  • TactileErgonomicsSuite (ViewportFitGuard, Overclock 6.0x Curve, Keyboard/Gamepad)
//  • CharacterStageRigDirector (60fps 2.5D Acting, Human Tells & CALL BLUFF, Rival Prism)
//  • StudioAudioEngine (144 Neural VO Clips + 10 Foley Cues + 5 Room-Air Beds)
// ============================================================================

import {
  FORGE_DOMAINS,
  forgeEngine,
  getAcademicTierSpec,
  getCampaignStageSpec,
  normalizeToPrismQuestion,
  resolveCampaignAcademicTier,
  type Archetype3D,
  type BriefingDifficultyPreset,
  type CalibratorConeId,
  type CampaignHubCode,
  type DomainId,
  type PeelTier,
  type PrismQuestion,
} from '../forge';
import { Stage3DDirector, type VenueCode } from '../stage3d';
import {
  CampaignCircuitDirector,
  CampaignSaveSlotManager,
  EvidenceDossier,
  InkBlackboard,
  PERSONA_DEFINITIONS,
  PassportSystem,
  PrologueDirector,
  RivalAI,
  Wave2NarrativeDirector,
  claimGameplayBarkVoiceUrl,
  reactionVarietyBank,
  type BackstageDialogueNode,
  type BackstageHubConversation,
  type BluffCallOutcome,
  type CampaignChoiceOption,
  type CampaignDialogueBeat,
  type CampaignMissionView,
  type CastMemberId,
  type EndingId,
  type FactionId,
  type HubId,
  type LiveCalloutEvent,
  type OriginId,
  type ProloguePhase,
  type PrologueQuestionCard,
  type PrologueStepSnapshot,
  type ReactionTriggerKind,
} from '../narrative';
import {
  ArchiveDescentEndless,
  BriefingCategoriesMode,
  ClueLadderTracker,
  CouncilTrialsGhostMode,
  DailyGlobalFeed,
  DuelRaceTracker,
  ScoringEngine,
  buildFinaleCategoryOptions,
  buildShareableDuelUrl,
  computeHaversineDistanceKm,
  computeRetryMercyBoost,
  createDuelSplitFromResult,
  createMatchGambitSession,
  duelRivalsStore,
  encodeDuelChallenge,
  evaluatePrismAnswer,
  extractDuelParamFromLocation,
  getDailyGlobalLeaderboard,
  getSubcategoryLeaderboard,
  mindGambitStore,
  pickFinaleQuestionForCategoryAsync,
  shouldUseClueLadder,
  swapQuestionToStrongestDomain,
  utcDateToCode,
  type BriefingRunLength,
  type DuelChallengePayload,
  type DuelMode,
  type DuelQuestionSplit,
  type LeaderboardCohortSnapshot,
  type MatchGambitSession,
  type MindGambitId,
  type PrismAnswerSubmission,
  type RetryMercyBoost,
  type ScoredQuestionResult,
} from '../modes';
import type { BossPhaseBannerDirector } from '../cinema/BossPhaseBannerDirector';
import type { EndingSequenceDirector } from '../cinema/EndingSequenceDirector';
import type { MotionCinemaDirector } from '../cinema/MotionCinemaDirector';
import {
  MetaProgressionSuite,
  equipHudAccentTheme,
  getQuarantinedQidSet,
  getQuestionVote,
  recordQuestionFeedback,
  type PracticeSliceRequest,
  type SpecialFeatKind,
  type SrsReviewCard,
} from '../meta';
import type { OfflineVaultStatus } from '../pwa/OfflineServiceWorkerClient';
import { TactileErgonomicsSuite, type BridgeScreenMode } from '../ergonomics';
import { CharacterStageRigDirector, preloadCharacterCutouts } from '../characters';
import { StudioAudioEngine } from '../audio/StudioAudioEngine';
import { HapticsEngine } from '../audio/HapticsEngine';
import { VfxOverlayCanvas } from './VfxOverlayCanvas';
import type { EvidenceDossierModal } from './EvidenceDossierModal';
import type { BriefingCategoriesModal } from './BriefingCategoriesModal';
import type {
  CampaignSaveSlotsModal,
  CampaignSlotCardView,
  CampaignSlotId,
} from './CampaignSaveSlotsModal';
import {
  SovereignHUD,
  buildDefaultCityCards,
  formatHudValue,
  type ActiveGambitHudState,
  type ActiveHubTab,
  type CampaignResumeViewInfo,
  type CityCardState,
  type ClueLadderStepView,
  type ClueLadderViewState,
  type FinaleCategoryPickerViewState,
  type GameplayQuestionViewState,
  type HubViewState,
  type MatchSummaryViewState,
  type MindGambitCardView,
  type RoundReadyViewState,
  type StoryDialogueViewState,
} from './SovereignHUD';

type ScreenKind =
  | 'TITLE'
  | 'REGISTRATION'
  | 'HUB'
  | 'STORY_DIALOGUE'
  | 'ROUND_READY'
  | 'FINALE_PICKER'
  | 'GAMEPLAY'
  | 'SUMMARY';

type ActiveMatchContext =
  | { kind: 'PROLOGUE'; qCard: PrologueQuestionCard }
  | { kind: 'INSTANT_TRIAL'; question: PrismQuestion; scoring: ScoringEngine }
  | {
      kind: 'DUEL';
      payload: DuelChallengePayload;
      tracker: DuelRaceTracker;
      questions: PrismQuestion[];
      index: number;
      scoring: ScoringEngine;
    }
  | {
      kind: 'SRS_REVIEW';
      cards: SrsReviewCard[];
      questions: PrismQuestion[];
      index: number;
      scoring: ScoringEngine;
    }
  | {
      kind: 'SHOWCASE';
      showcaseKind: 'GLOBE_PIN_DROP' | 'VISUAL_BLUEPRINT';
      questions: PrismQuestion[];
      index: number;
      scoring: ScoringEngine;
    }
  | {
      kind: 'CAMPAIGN';
      mission: CampaignMissionView;
      questions: PrismQuestion[];
      index: number;
      scoring: ScoringEngine;
      rival: RivalAI;
      mercy: RetryMercyBoost;
      shieldsRemaining?: number;
      suddenDeathBackfired: boolean;
      bluffBonusPoints: number;
      freeCoopUsed: boolean;
      councilVetoUsed: boolean;
      choiceOverrideNextMission?: string | null;
      deferredEndingChoices: CampaignChoiceOption[];
    }
  | { kind: 'DAILY'; total: number; index: number; utcDate: string }
  | {
      kind: 'BRIEFING';
      questions: PrismQuestion[];
      total: number;
      index: number;
      domainsLabel: string;
      difficultyPreset: BriefingDifficultyPreset;
      domainId: number;
      l1Id?: string;
      l2Id?: string;
      topicLabel?: string;
    }
  | { kind: 'ENDLESS' }
  | { kind: 'TRIALS'; isBlackSalon: boolean; opponentHandle: string; total: number; index: number };

function difficultyTierToBadgeKey(
  raw: string | undefined | null,
): RoundReadyViewState['difficultyTierKey'] {
  const key = String(raw ?? '').trim().toUpperCase();
  if (key.includes('MENSA') || key.includes('GENIUS')) return 'mensa';
  if (key.includes('GRADUATE') || key.includes('HARD')) return 'graduate';
  if (key.includes('COLLEGE') || key.includes('MEDIUM')) return 'college';
  if (key.includes('HIGH_SCHOOL') || key.includes('HIGH SCHOOL')) return 'high-school';
  return 'middle-school';
}

function replacePrismQuestionInPlace(target: PrismQuestion, source: PrismQuestion): void {
  delete target.codex;
  delete target.calibrator;
  delete target.gauntlet;
  delete target.heroSynthesis;
  delete target.globePin;
  delete target.visualPlate;
  delete target.heroRelicId;
  Object.assign(target, source);
}

function buildPickerGambitCards(): MindGambitCardView[] {
  return mindGambitStore.getPickerOptions(3).map((g) => ({
    id: g.id,
    title: g.name,
    tagline: g.shortBadge,
    description: g.description,
    unlocked: g.unlocked,
    unlockRequirement: g.unlockConditionLabel,
  }));
}

function toClueLadderViewState(tracker: ClueLadderTracker): ClueLadderViewState {
  const snap = tracker.getSnapshot();
  const mapped = snap.steps.map((s) => ({
    step: s.step,
    points: s.pointsValue,
    label: s.label,
    text: s.text,
  })) as [ClueLadderStepView, ClueLadderStepView, ClueLadderStepView];
  return {
    activeStep: snap.activeStep,
    steps: mapped,
    nextRevealInSec: snap.canRevealNext ? snap.nextAutoRevealInSec : null,
  };
}

function formatDifficultyPresetLabel(raw: string | undefined | null): string {
  const key = String(raw ?? '').trim().toUpperCase();
  switch (key) {
    case 'MIDDLE_SCHOOL':
    case 'EASY':
      return 'Middle School';
    case 'HIGH_SCHOOL':
      return 'High School';
    case 'COLLEGE':
    case 'MEDIUM':
      return 'College';
    case 'GRADUATE':
    case 'HARD':
      return 'Graduate';
    case 'MENSA':
    case 'GENIUS':
      return 'Mensa';
    case 'ADAPTIVE':
      return 'Adaptive';
    case 'PROGRESSIVE':
      return 'Progressive';
    default:
      return String(raw ?? '').replace(/_/g, ' ').trim();
  }
}

const VISA_STAMP_URLS: Record<HubId, string> = {
  ch: './assets/visas/visa_ch.png',
  gb: './assets/visas/visa_gb.png',
  jp: './assets/visas/visa_jp.png',
  br: './assets/visas/visa_br.png',
  eg: './assets/visas/visa_eg.png',
  is: './assets/visas/visa_is.png',
  sg: './assets/visas/visa_sg.png',
  global: './assets/visas/visa_global.png',
};

const FACTION_CREST_URLS: Record<FactionId, string> = {
  SOVEREIGN: './assets/factions/faction_sovereign.png',
  HORIZON: './assets/factions/faction_horizon.png',
  AGORA: './assets/factions/faction_agora.png',
};

function prologueCardToPrismQuestion(card: PrologueQuestionCard): PrismQuestion {
  return normalizeToPrismQuestion(
    {
      qid: card.qid,
      l0Domain: card.domainId,
      l1Category: 'Geneva Vetting Assessment',
      l2Subcategory: card.taughtVerb,
      microTopicId: `prologue_q_${card.questionIndex}`,
      regions: ['CH', 'GLOBAL'],
      irtB: -1.45,
      irtA: 1.0,
      archetype: card.archetype,
      prompt: card.prompt,
      answerCorrect: card.answerCorrect,
      distractors: card.facets
        ? card.facets
            .filter((_, idx) => idx !== card.correctFacetIndex)
            .map((t) => ({ text: t, plausibility: 0.72 }))
        : undefined,
      clues: [card.clues[0], card.clues[1]],
      whyExplanation: card.whyExplanation,
      calibratorExt: card.calibratorSpec
        ? {
            exactVal: card.calibratorSpec.exactVal,
            minVal: card.calibratorSpec.minVal,
            maxVal: card.calibratorSpec.maxVal,
            step: card.calibratorSpec.step,
            unit: card.calibratorSpec.unit,
          }
        : undefined,
      heroRelicId: card.archetype === 'CALIBRATOR_DIAL' ? 'meridian_astrolabe' : undefined,
    },
    {
      timerSec: Math.max(35, card.timeTotalSec || 35),
      facetCount: 4,
      shuffleSalt: 0,
    },
  );
}

export class SovereignMasterController {
  private readonly stage3d: Stage3DDirector;
  private readonly audio: StudioAudioEngine;
  private readonly haptics: HapticsEngine;
  private readonly vfx: VfxOverlayCanvas;

  private readonly passport: PassportSystem;
  private readonly blackboard: InkBlackboard;
  private readonly dossier: EvidenceDossier;
  private readonly prologue: PrologueDirector;
  private readonly campaign: CampaignCircuitDirector;
  private readonly wave2Narrative: Wave2NarrativeDirector;
  private readonly saveSlotManager: CampaignSaveSlotManager;

  private readonly dailyMode: DailyGlobalFeed;
  private readonly briefingMode: BriefingCategoriesMode;
  private readonly endlessMode: ArchiveDescentEndless;
  private readonly trialsMode: CouncilTrialsGhostMode;
  private readonly prologueScoring = new ScoringEngine();

  private motionCinema: MotionCinemaDirector | null = null;
  private bossBanner: BossPhaseBannerDirector | null = null;
  private endingDirector: EndingSequenceDirector | null = null;
  private pendingWave2BossBanners: Array<{
    phase: number;
    code: string;
    bannerTitle: string;
    bannerSubtitle: string;
    archetype: string;
    lightingMode: string;
    voiceClipId?: string;
    voiceUrl?: string;
    text?: string;
  }> = [];

  private readonly metaSuite: MetaProgressionSuite;
  private readonly characterRig: CharacterStageRigDirector;
  private readonly ergonomics: TactileErgonomicsSuite;

  private dossierModal: EvidenceDossierModal | null = null;
  private briefingModal: BriefingCategoriesModal | null = null;
  private saveSlotsModal: CampaignSaveSlotsModal | null = null;
  private readonly hud: SovereignHUD;
  private localFailedMissions = new Map<string, { attempts: number; lastFailReason: string }>();
  private restartFromStartModalEl: HTMLElement | null = null;

  // v2.0 Commercial Upgrades & #325 Menu State
  private pendingIncomingDuel: DuelChallengePayload | null = null;
  private lockedCityNotice: HubViewState['lockedCityNotice'] = null;
  private currentMatchRecordedQids: number[] = [];
  private currentMatchRecordedSplits: DuelQuestionSplit[] = [];
  private recentInstantTrialQids: number[] = [];
  private offlineUnsubscribe: (() => void) | null = null;
  private offlineStatusSnapshot: OfflineVaultStatus = {
    swReady: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine !== false : true,
    cachedEntryCount: 0,
    packsReady: [],
  };
  private offlineDownloadingLabel: string | null = null;

  private screen: ScreenKind = 'TITLE';
  private activeHubTab: ActiveHubTab = 'CAMPAIGN';
  private selectedCityHub: CampaignHubCode = 'ch';
  private playedCutsceneIds = new Set<string>();
  private backstageCursorByHub = new Map<HubId, number>();

  // Active Story / Backstage Queue State
  private activeDialogueVm: StoryDialogueViewState | null = null;
  private dialogueLeadsToMatch = false;
  private pendingDialogueQueue: CampaignDialogueBeat[] = [];
  private pendingMissionChoices: CampaignChoiceOption[] = [];
  private onDialogueQueueComplete: (() => void) | null = null;
  private onDialogueSecondaryAction: (() => void) | null = null;
  private activeMissionForChoice: CampaignMissionView | null = null;
  private pendingChoiceNextMissionOverride: string | null | undefined = undefined;
  private activeBackstageCtx: {
    hubId: HubId;
    conversation: BackstageHubConversation;
    currentNode: BackstageDialogueNode;
  } | null = null;

  // v3.0 Pre-Round Readiness Gate, Finale Category Picker, Clue Ladder & Mind Gambits State
  private activeRoundReadyVm: RoundReadyViewState | null = null;
  private onRoundReadyStart: (() => void | Promise<void>) | null = null;
  private isStartingRoundQuestions = false;
  private activeFinalePickerVm: FinaleCategoryPickerViewState | null = null;
  private onFinaleCategorySelected: ((domainId: number) => void | Promise<void>) | null = null;
  private isSelectingFinaleCategory = false;
  private readingGraceRemainingSec = 0;
  private activeClueLadder: ClueLadderTracker | null = null;
  private activeGambitSession: MatchGambitSession | null = null;
  private activeMercyBoost: RetryMercyBoost | null = null;
  private liveBluffRadarLabel: string | null = null;
  private matchFirstClueSnipes = 0;
  private matchBluffsCaught = 0;
  private matchSecondWindTriggered = false;
  private matchFinaleCategoryWon = false;
  private matchExtraBonusPoints = 0;
  private questionMindGambitTriggered = false;
  private questionFinaleCategoryPicked = false;

  // Active Live Question State
  private matchCtx: ActiveMatchContext | null = null;
  private liveVm: GameplayQuestionViewState | null = null;
  private activeElapsedSec = 0;
  private timerTotalSec = 20;
  private timerRemainingSec = 20;
  private spinUsedThisQ = false;
  private isCommittingAnswer = false;
  private isAdvancingQuestion = false;
  private telemetryRaf = 0;
  private lastTickMs = 0;
  private canvasChargeAudioActive = false;
  private lastMetaSuiteClosedAtMs = 0;
  private readonly playedGameplayVoUrls = new Set<string>();

  // Per-match & per-question telemetry counters (#166 / #180)
  private matchPeelsUsed = 0;
  private matchMax6xWins = 0;
  private matchShieldsLost = 0;
  private matchSorenBluffCaught = false;
  private questionBluffCalled = false;
  private questionBluffEchoCancelled = false;
  private questionCodexMoves = 0;
  private endlessRunCorrectCount = 0;
  private endlessRunStreak = 0;
  private endlessRunMaxStreak = 0;

  private activeSummaryVm: MatchSummaryViewState | null = null;

  // #168 Deterministic Return Stack ("Always Get Back To Exactly Where You Were")
  private navigationReturnStack: Array<{
    kind: 'MODAL' | 'BACKSTAGE' | 'HUB_FROM_TITLE';
    originScreen: ScreenKind;
    activeHubTab: ActiveHubTab;
    selectedCityHub: CampaignHubCode;
    hubScrollTop: number;
    pausedRemainingSec?: number;
  }> = [];
  private isHandlingPopState = false;
  private boundPopState: ((ev: PopStateEvent) => void) | null = null;
  private leaveConfirmModalEl: HTMLElement | null = null;

  constructor(
    canvasRoot: HTMLElement,
    vfxCanvas: HTMLCanvasElement,
    uiRoot: HTMLElement,
  ) {
    const baseHref = new URL('./', document.baseURI || window.location.href).pathname;
    this.stage3d = new Stage3DDirector({
      baseUrl: baseHref,
      qualityTier: 'HIGH',
      initialVenue: 'ch',
      initialLighting: 'BROADCAST',
    });

    this.audio = new StudioAudioEngine();
    // #203 §3.3c: Enforce `ws_ambience_enabled_v2` defaulting strictly to OFF (`false`) on boot!
    try {
      const ambienceV2 = window.localStorage?.getItem('ws_ambience_enabled_v2') === '1';
      if (this.audio.isMusicEnabled() !== ambienceV2) {
        this.audio.toggleMusic();
      }
    } catch {
      if (this.audio.isMusicEnabled()) {
        this.audio.toggleMusic();
      }
    }
    this.haptics = new HapticsEngine();
    this.vfx = new VfxOverlayCanvas(vfxCanvas);

    this.passport = new PassportSystem();
    this.blackboard = new InkBlackboard();
    this.dossier = new EvidenceDossier(this.blackboard, this.passport);
    this.prologue = new PrologueDirector(this.passport, this.blackboard);
    this.campaign = new CampaignCircuitDirector(this.blackboard, this.passport, this.dossier);
    this.wave2Narrative = new Wave2NarrativeDirector(this.passport, this.blackboard);
    this.saveSlotManager = new CampaignSaveSlotManager({
      passport: this.passport,
      blackboard: this.blackboard,
      campaign: this.campaign,
      wave2: this.wave2Narrative,
      prologue: this.prologue,
    });

    this.dailyMode = new DailyGlobalFeed(forgeEngine, this.passport);
    this.briefingMode = new BriefingCategoriesMode(forgeEngine, this.passport);
    this.endlessMode = new ArchiveDescentEndless(forgeEngine, this.passport);
    this.trialsMode = new CouncilTrialsGhostMode(forgeEngine, this.passport, this.blackboard);

    // Upgrade #3: Sync persisted user-flagged quarantined QIDs into ForgeEngine before any draw!
    forgeEngine.setQuarantinedQids(getQuarantinedQidSet());

    // Upgrade #1: Check cold-boot URL for 1-tap `?duel=` challenge link!
    if (typeof window !== 'undefined') {
      try {
        const incoming = extractDuelParamFromLocation(
          window.location.search,
          window.location.hash,
        );
        if (incoming && incoming.qids.length > 0) {
          this.pendingIncomingDuel = incoming;
          duelRivalsStore.recordIncomingChallenger(incoming);
        }
      } catch {
        this.pendingIncomingDuel = null;
      }
    }

    // #325: Auto-sync selectedCityHub to the player's actual resume city on boot!
    this.selectedCityHub = this.resolveCampaignResumeState().activeHub;

    this.metaSuite = new MetaProgressionSuite(
      {
        passport: this.passport,
        blackboard: this.blackboard,
        stage3d: this.stage3d,
        trialsMode: this.trialsMode,
        audio: this.audio,
        haptics: this.haptics,
        visaStampUrls: VISA_STAMP_URLS,
        factionCrestUrls: FACTION_CREST_URLS,
      },
      {
        onRenameChallenger: (newName) => {
          this.passport.setChallengerName(newName);
          this.saveSlotManager.saveActiveSlot();
          if (this.liveVm) {
            this.liveVm.challengerName = this.passport.getChallengerName();
          }
          this.rerenderTopState();
        },
        onEquipSkin: () => {
          this.metaSuite.applyEquippedFinish();
        },
        onEquipBroadcastTitle: () => {
          this.saveSlotManager.saveActiveSlot();
          this.rerenderTopState();
        },
        onEquipHudTheme: (theme) => {
          equipHudAccentTheme(theme.id);
          this.rerenderTopState();
        },
        onPledgeFaction: (f) => {
          this.trialsMode.pledgeFaction(f);
          this.saveSlotManager.saveActiveSlot();
          if (this.screen === 'HUB') this.renderHubScreen();
        },
        onLaunchGhostDuel: (contenderId) => {
          this.closeAllModals();
          void this.launchGhostOrSalon(false, contenderId);
        },
        onLaunchBlackSalon: () => {
          this.closeAllModals();
          void this.launchGhostOrSalon(true);
        },
        onLaunchLivePrismReview: (cards) => {
          this.closeAllModals();
          void this.launchSpacedRepetitionReview(cards);
        },
        onPracticeSlice: (slice) => {
          this.closeAllModals();
          void this.launchPracticeSliceBriefing(slice);
        },
        onCloseSuite: () => {
          this.lastMetaSuiteClosedAtMs = performance.now();
          document.documentElement.classList.remove('ws-3d-showcase-open');
          const modalSnap = this.navigationReturnStack.find((s) => s.kind === 'MODAL');
          this.navigationReturnStack = this.navigationReturnStack.filter(
            (s) => s.kind !== 'MODAL',
          );
          if (modalSnap && modalSnap.originScreen === 'HUB') {
            this.restoreHubScrollIfNeeded(modalSnap.hubScrollTop);
          }
          this.syncVaultLiveStatus();
          void this.restore3DAfterModal();
        },
      },
    );
    equipHudAccentTheme(this.metaSuite.getEquippedHudAccentTheme().id);

    this.characterRig = new CharacterStageRigDirector({
      audioEngine: this.audio,
      onCallBluff: () => this.handleCallRivalBluff(),
      telemetryVariant: 'compact',
      showMicroCaption: true,
    });

    this.ergonomics = new TactileErgonomicsSuite({
      stateQuery: {
        getScreenMode: (): BridgeScreenMode => {
          if (
            this.motionCinema?.isActive() ||
            this.bossBanner?.isActive() ||
            this.endingDirector?.isActive()
          ) {
            return 'CUTSCENE';
          }
          if (
            this.metaSuite.isOpen() ||
            this.dossierModal?.isOpen() ||
            this.briefingModal?.isOpen() ||
            this.saveSlotsModal?.isOpen() ||
            this.hud?.isVaultDrawerOpen() ||
            this.hud?.isVisualLightboxOpen() ||
            this.hud?.isRulesModalOpen() ||
            this.leaveConfirmModalEl !== null ||
            this.restartFromStartModalEl !== null
          ) {
            return 'MODAL_OPEN';
          }
          if (this.screen === 'GAMEPLAY') {
            return this.liveVm?.revealed ? 'GAMEPLAY_REVEALED' : 'GAMEPLAY_LIVE';
          }
          if (
            this.screen === 'TITLE' ||
            this.screen === 'ROUND_READY' ||
            this.screen === 'FINALE_PICKER'
          ) {
            return 'HUB';
          }
          return this.screen;
        },
        getActiveArchetype: () => {
          const arch = this.liveVm?.question.archetype ?? 'SIGHTLINE_LOCK';
          return arch === 'GLOBE_PIN_DROP' ? 'SIGHTLINE_LOCK' : arch;
        },
      },
      audio: this.audio,
      haptics: this.haptics,
      stage3d: this.stage3d,
      overclockCallbacks: {
        onOverclockStart: () => {
          if (this.matchCtx?.kind === 'TRIALS') {
            this.trialsMode.recordPlayerKineticGesture(this.getElapsedSec(), 'OVERCLOCK_START');
          }
        },
        onChargeFrame: (snap) => {
          const doubled = Boolean(this.liveVm?.doubleDownActive);
          this.stage3d.setOverclockState(
            snap.charge01 > 0.01 || doubled,
            snap.charge01 > 0.01 ? snap.charge01 : doubled ? 0.55 : 0,
          );
          if (snap.charge01 >= 0.08 && this.liveVm && !this.liveVm.revealed) {
            const labelEl = document.getElementById('ws-overclock-label');
            if (labelEl) {
              const effMult = Math.max(2.0, snap.effectiveTotalMultiplier);
              labelEl.textContent = `✦ 2× WAGER (${effMult.toFixed(1)}×) — RELEASE`;
            }
          }
        },
        onCommit: (payload) => {
          this.hud?.notifyOverclockCommittedOrCancelled();
          void this.commitCurrentAnswer(payload.charge01);
        },
        onBluffEchoCancel: () => {
          this.hud?.notifyOverclockCommittedOrCancelled();
          this.handleBluffCancel();
          if (this.liveVm) {
            this.hud.syncDoubleDownDom(this.liveVm);
          }
        },
      },
      shortcutCallbacks: {
        onSpinStep: (delta) => {
          if (!this.liveVm || this.liveVm.revealed) return;
          if (this.liveVm.question.archetype === 'GLOBE_PIN_DROP' && this.liveVm.question.globePin) {
            const anchors = this.liveVm.question.globePin.quickAnchors;
            if (anchors.length > 0) {
              const cur = this.liveVm.selectedGlobeAnchorIndex ?? -1;
              const next = (cur + delta + anchors.length) % anchors.length;
              const picked = anchors[next];
              if (picked) this.handleSelectGlobeCoords(picked.lat, picked.lon, next, true);
            }
            return;
          }
          const next = this.stage3d.stepFacet(delta);
          this.handleUiSelectFacet(next, true);
        },
        onDirectFacetSpin: (idx) => {
          if (this.liveVm?.question.archetype === 'GLOBE_PIN_DROP' && this.liveVm.question.globePin) {
            const picked = this.liveVm.question.globePin.quickAnchors[idx];
            if (picked) {
              this.handleSelectGlobeCoords(picked.lat, picked.lon, idx, true);
            }
            return;
          }
          this.handleUiSelectFacet(idx);
        },
        onPeelCrown: () => {
          this.handleTriggerPeel();
        },
        onGauntletVerdict: (verdict) => {
          this.handleGauntletSubmit(verdict);
        },
        onCalibratorNudge: (steps) => {
          this.nudgeCalibratorSteps(steps);
        },
        onCalibratorSelectCone: (coneIndex) => {
          const cones: CalibratorConeId[] = ['WIDE', 'SHARP', 'PINHOLE'];
          const picked = cones[coneIndex] ?? 'SHARP';
          if (this.liveVm && !this.liveVm.revealed) {
            this.haptics.sightlineSnap();
            this.audio.playSfx('sightline_snap');
            this.handleUpdateCalibrator(this.liveVm.calibratorEstimate, picked);
          }
        },
        onCodexStep: (subjIdx, dir) => {
          this.haptics.spinTick();
          this.audio.playSfx('spin_tick');
          this.handleUpdateCodex(subjIdx, dir);
        },
        onAdvanceOrContinue: () => {
          this.handlePrimaryAdvanceKey();
        },
        onSelectDialogueChoiceByIndex: (choiceIdx) => {
          const choice = this.activeDialogueVm?.choices?.[choiceIdx];
          if (choice) {
            this.haptics.sightlineSnap();
            this.audio.playSfx('sightline_snap');
            this.handleDialogueChoice(choice.id);
          }
        },
        onEscapeDismiss: () => {
          this.closeAllModals();
        },
      },
    });
    this.ergonomics.install();

    this.hud = new SovereignHUD(
      uiRoot,
      this.audio,
      this.haptics,
      {
        onToggleMasterAudio: () => {
          if (this.audio.isMasterAudioActive()) {
            this.audio.setSfxEnabled(false);
            if (this.audio.isMusicEnabled()) {
              this.audio.setMusicEnabled(false);
            }
            this.audio.stopVoice();
          } else {
            this.audio.setSfxEnabled(true);
            this.audio.playSfx('ui_tap');
          }
          this.rerenderTopState();
        },
        onToggleMusic: () => {
          const next = this.audio.toggleMusic();
          try {
            window.localStorage?.setItem('ws_ambience_enabled_v2', next ? '1' : '0');
          } catch {
            // Ignore private storage restrictions
          }
          this.rerenderTopState();
        },
        onToggleSfx: () => {
          this.audio.toggleSfx();
          this.rerenderTopState();
        },
        onOpenPassport: () => this.openPassportModal(false),
        onOpenSaveSlots: () => void this.openSaveSlotsModal(),
        onOpenAnalytics: () => this.openAnalyticsModal(),
        onOpenHonours: () => this.openHonoursModal(),
        onOpenAtelier: () => this.openAtelierModal(),
        onOpenObservatory: () => this.openObservatoryModal(),
        onOpenMasteryReviewDeck: () => this.openMasteryReviewDeckModal(),
        onDownloadOfflinePack: () => void this.handleDownloadOfflinePack(),
        onOpenFactions: () => this.openFactionsModal(),
        onOpenDossier: () => void this.openDossierModal(),
        onReturnToTitle: () => this.enterTitleShowcase(),
        onReturnToHub: () => this.handleLeaveOrReturnToHub(),
        onTopBarBack: () => this.handleTopBarBack(),
        onVaultDrawerToggle: (open) => {
          if (open) {
            this.stopAnyActiveOverclockAudio();
            this.syncVaultLiveStatus();
          }
        },
        onRulesModalToggle: (open) => {
          if (open) {
            this.stopAnyActiveOverclockAudio();
          }
        },
        onSelectRoundGambit: (gambitId) => {
          this.handleSelectRoundGambit(gambitId);
        },
        onStartRoundQuestions: () => {
          void this.handleStartRoundQuestions();
        },
        onSelectFinaleCategory: (domainId) => {
          void this.handleSelectFinaleCategory(domainId);
        },

        onTitleEnterMeridian: () => this.handleTitleEnterMeridian(),
        onTitleQuickMode: (tab) => this.handleTitleQuickMode(tab),
        onLaunchInstantPrism: () => this.launchInstantTrialPrism(),
        onInstantPrismAction: (dest) => this.handleInstantPrismAction(dest),
        onAcceptIncomingDuel: (payload) => void this.acceptIncomingDuel(payload),
        onDismissIncomingDuel: () => {
          this.pendingIncomingDuel = null;
          if (this.screen === 'TITLE') this.renderTitleScreen();
        },

        onCompleteRegistration: (name, origin) => this.handleCompleteRegistration(name, origin),

        onSelectHubTab: (tab) => {
          this.lockedCityNotice = null;
          this.activeHubTab = tab;
          this.renderHubScreen();
        },
        onSelectCity: (hub) => this.handleHubSelectCity(hub),
        onHubContinueNow: () => this.handleContinueWhereLeftOff(),
        onDismissLockedCityNotice: () => {
          this.lockedCityNotice = null;
          if (this.screen === 'HUB') this.renderHubScreen();
        },
        onStartPrologue: () => {
          if (this.blackboard.getSnapshot().prologueComplete) {
            this.startFullPrologueFlow();
          } else {
            this.resumePrologueWhereLeftOff();
          }
        },
        onChooseFlightFork: (dest) => this.handleFlightForkChoice(dest === 'gb' ? 'GB' : 'JP'),
        onLaunchMission: (missionId) => void this.launchCampaignMission(missionId),
        onLaunchBackstageHub: (hub) => void this.launchBackstageConversation(hub as HubId),
        onLaunchDaily: () => this.launchDailyBroadcast(),
        onOpenBriefingPicker: (opts) => void this.openBriefingPickerModal(opts),
        onLaunchQuickBriefing: () =>
          void this.launchBriefingRun({
            domains: 'GLOBAL_MIX',
            difficulty: 'ADAPTIVE',
            length: 5,
          }),
        onLaunchTopicQuickBriefing: (spec) =>
          void this.launchBriefingRun({
            domains: [spec.domainId as DomainId],
            difficulty: 'ADAPTIVE',
            length: spec.count ?? 10,
            l1SubcategoryId: spec.l1SubcategoryId,
            l2TopicId: spec.l2TopicId,
            topicDisplayLabel: spec.label,
          }),
        onLaunchVisualOrGlobeShowcase: (kind) => void this.launchVisualOrGlobeShowcase(kind),
        onLaunchEndless: (resume) => void this.launchEndlessDescent(resume),
        onPledgeFaction: (f) => {
          this.trialsMode.pledgeFaction(f);
          this.metaSuite.recordSpecialFeat('FACTION_PLEDGED');
          this.saveSlotManager.saveActiveSlot();
          this.renderHubScreen();
        },
        onLaunchGhostTrial: (blackSalon) => void this.launchGhostOrSalon(blackSalon),

        onSelectDialogueChoice: (choiceId) => this.handleDialogueChoice(choiceId),
        onAdvanceDialogue: () => this.handleAdvanceDialogue(),
        onSecondaryDialogueAction: () => this.onDialogueSecondaryAction?.(),

        onSelectFacet: (idx) => this.handleUiSelectFacet(idx),
        onSelectGlobeAnchor: (lat, lon, anchorIdx) =>
          this.handleSelectGlobeCoords(lat, lon, anchorIdx, true),
        onTriggerPeel: () => this.handleTriggerPeel(),
        onToggleDoubleDown: () => this.handleToggleDoubleDown(),
        onRevealNextClueStep: () => this.handleRevealNextClueStep(),
        onUseSwapTopicGambit: () => this.handleUseSwapTopicGambit(),
        onTriggerCouncilVeto: () => this.handleCouncilVeto(),
        onUpdateCalibrator: (est, cone) => this.handleUpdateCalibrator(est, cone),
        onUpdateCodexRing: (subjIdx, delta) => this.handleUpdateCodex(subjIdx, delta),
        onSubmitGauntlet: (act) => this.handleGauntletSubmit(act),
        onOverclockChargeProgress: (charge01) => {
          this.stage3d.setOverclockState(charge01 > 0.01, charge01);
        },
        onOverclockBluffCancel: () => this.handleBluffCancel(),
        onCommitLock: (charge01) => void this.commitCurrentAnswer(charge01),
        onToggleBookmark: () => this.handleToggleBookmark(),
        onRateQuestion: (vote) => this.handleRateQuestion(vote),
        onNextQuestion: () => void this.advanceAfterReveal(),

        onContinueEndlessDescent: () => void this.continueEndlessFromAirlock(),
        onRetryMission: (missionId) => void this.launchCampaignMission(missionId),
        onRestartFromStart: (cityFirstMissionId) =>
          this.openRestartFromStartModal(cityFirstMissionId),
        onCopyDailyShare: (text) => {
          void navigator.clipboard?.writeText(text).catch(() => {});
        },
        onShareDuelLink: (url, title, text) => this.handleShareDuelLink(url, title, text),
        onSummaryPrimaryContinue: () => this.handleSummaryPrimaryContinue(),
      },
      {
        characterRig: this.characterRig,
        overclockController: this.ergonomics.overclock,
      },
    );

    this.syncVaultLiveStatus();
    this.bindStage3DEvents();
    this.installPopStateNavigationGuard();
    void this.bootAsync(canvasRoot);
  }

  // ==========================================================================
  // DYNAMIC `import()` LAZY LOADERS (Upgrade #4: Ultra-Lean Initial Entry Bundle)
  // ==========================================================================

  private async getMotionCinema(): Promise<MotionCinemaDirector> {
    if (!this.motionCinema) {
      const mod = await import('../cinema/MotionCinemaDirector');
      this.motionCinema = new mod.MotionCinemaDirector(this.audio, this.haptics, this.stage3d);
    }
    return this.motionCinema;
  }

  private async getBossBanner(): Promise<BossPhaseBannerDirector> {
    if (!this.bossBanner) {
      const mod = await import('../cinema/BossPhaseBannerDirector');
      this.bossBanner = new mod.BossPhaseBannerDirector(this.audio, this.haptics);
      if (this.pendingWave2BossBanners.length > 0) {
        this.bossBanner.ingestWave2Banners(this.pendingWave2BossBanners);
      }
    }
    return this.bossBanner;
  }

  private async getEndingDirector(): Promise<EndingSequenceDirector> {
    if (!this.endingDirector) {
      const mod = await import('../cinema/EndingSequenceDirector');
      this.endingDirector = new mod.EndingSequenceDirector(this.audio, this.haptics);
    }
    return this.endingDirector;
  }

  private async getDossierModal(): Promise<EvidenceDossierModal> {
    if (!this.dossierModal) {
      const mod = await import('./EvidenceDossierModal');
      this.dossierModal = new mod.EvidenceDossierModal(this.audio, this.haptics);
    }
    return this.dossierModal;
  }

  private async getBriefingModal(): Promise<BriefingCategoriesModal> {
    if (!this.briefingModal) {
      const mod = await import('./BriefingCategoriesModal');
      this.briefingModal = new mod.BriefingCategoriesModal(this.audio, this.haptics);
    }
    return this.briefingModal;
  }

  private async getSaveSlotsModal(): Promise<CampaignSaveSlotsModal> {
    if (!this.saveSlotsModal) {
      const mod = await import('./CampaignSaveSlotsModal');
      this.saveSlotsModal = new mod.CampaignSaveSlotsModal(this.audio, this.haptics);
    }
    return this.saveSlotsModal;
  }

  private getOfflineClient() {
    return import('../pwa/OfflineServiceWorkerClient');
  }

  private installPopStateNavigationGuard(): void {
    if (typeof window === 'undefined') return;
    this.boundPopState = () => {
      if (this.isHandlingPopState) return;
      // MetaProgressionSuite manages its own internal sub-navigation stack (`#168` / `#193` #2)
      if (this.metaSuite.isOpen()) return;
      if (performance.now() - this.lastMetaSuiteClosedAtMs < 60) return;

      this.isHandlingPopState = true;
      try {
        this.popNavigationReturnStack(true);
      } finally {
        this.isHandlingPopState = false;
      }
    };
    window.addEventListener('popstate', this.boundPopState);
  }

  private pushNavigationReturnSnapshot(
    kind: 'MODAL' | 'BACKSTAGE' | 'HUB_FROM_TITLE',
    skipHistoryPush = false,
  ): void {
    const hubScrollEl = document.querySelector<HTMLElement>('.ws-hub-scroll');
    // Avoid stacking duplicate MODAL entries when switching between Passport <-> Atelier <-> Stats
    if (kind === 'MODAL' && this.navigationReturnStack.some((s) => s.kind === 'MODAL')) {
      return;
    }
    this.navigationReturnStack.push({
      kind,
      originScreen: this.screen,
      activeHubTab: this.activeHubTab,
      selectedCityHub: this.selectedCityHub,
      hubScrollTop: hubScrollEl ? hubScrollEl.scrollTop : 0,
      pausedRemainingSec:
        this.screen === 'GAMEPLAY' ? this.timerRemainingSec : undefined,
    });
    if (!skipHistoryPush) {
      try {
        window.history?.pushState(
          { wsNavDepth: this.navigationReturnStack.length, kind },
          '',
        );
      } catch {
        // Ignore sandboxed history restrictions
      }
    }
  }

  private restoreHubScrollIfNeeded(scrollTop: number): void {
    if (scrollTop <= 0) return;
    requestAnimationFrame(() => {
      const hubScrollEl = document.querySelector<HTMLElement>('.ws-hub-scroll');
      if (hubScrollEl) {
        hubScrollEl.scrollTop = scrollTop;
      }
    });
  }

  private popNavigationReturnStack(fromPopState = false): boolean {
    if (this.hud.isRulesModalOpen()) {
      this.hud.closeRulesModal();
      return true;
    }
    if (this.hud.isVisualLightboxOpen()) {
      this.hud.closeVisualLightbox();
      return true;
    }
    if (this.hud.isVaultDrawerOpen()) {
      this.hud.closeVaultDrawer();
      return true;
    }
    if (this.leaveConfirmModalEl) {
      this.closeLeaveConfirmModal();
      return true;
    }
    if (this.restartFromStartModalEl) {
      this.closeRestartFromStartModal();
      return true;
    }
    const top = this.navigationReturnStack.pop();
    if (!top) {
      if (
        this.metaSuite.isOpen() ||
        this.dossierModal?.isOpen() ||
        this.briefingModal?.isOpen() ||
        this.saveSlotsModal?.isOpen()
      ) {
        this.closeAllModals(false);
        return true;
      }
      if (fromPopState && this.screen === 'HUB') {
        this.enterTitleShowcase();
        return true;
      }
      return false;
    }

    if (top.kind === 'MODAL') {
      this.closeAllModals(false);
      if (top.originScreen === 'HUB') {
        this.restoreHubScrollIfNeeded(top.hubScrollTop);
      }
      return true;
    }

    if (top.kind === 'BACKSTAGE') {
      this.audio.stopVoice();
      this.activeBackstageCtx = null;
      this.selectedCityHub = top.selectedCityHub;
      this.enterHub(top.activeHubTab);
      this.restoreHubScrollIfNeeded(top.hubScrollTop);
      return true;
    }

    if (top.kind === 'HUB_FROM_TITLE') {
      this.enterTitleShowcase();
      return true;
    }

    return false;
  }

  private handleTopBarBack(): void {
    if (this.hud.isRulesModalOpen()) {
      this.hud.closeRulesModal();
      return;
    }
    if (this.hud.isVaultDrawerOpen()) {
      this.hud.closeVaultDrawer();
      return;
    }
    if (this.screen === 'REGISTRATION') {
      if (!this.popNavigationReturnStack(false)) {
        this.enterTitleShowcase();
      }
      return;
    }
    if (this.screen === 'HUB') {
      if (!this.popNavigationReturnStack(false)) {
        this.enterTitleShowcase();
      }
      return;
    }
    if (
      this.screen === 'STORY_DIALOGUE' ||
      this.screen === 'ROUND_READY' ||
      this.screen === 'FINALE_PICKER'
    ) {
      if (this.activeBackstageCtx) {
        this.popNavigationReturnStack(false);
        return;
      }
      this.enterHub(this.activeHubTab);
      return;
    }
    if (this.screen === 'GAMEPLAY') {
      this.handleLeaveOrReturnToHub();
      return;
    }
    if (this.screen === 'SUMMARY') {
      this.handleSummaryPrimaryContinue();
      return;
    }
    this.enterTitleShowcase();
  }

  private handleLeaveOrReturnToHub(): void {
    // If inside a Backstage Conversation, pop straight back to exact Hub scroll position!
    if (this.activeBackstageCtx) {
      this.popNavigationReturnStack(false);
      return;
    }

    // #168 Item 1c: Quick non-blocking confirm if leaving an active un-revealed live question!
    if (this.screen === 'GAMEPLAY' && this.liveVm && !this.liveVm.revealed) {
      this.openLeaveConfirmModal();
      return;
    }

    this.enterHub(this.activeHubTab);
  }

  private openLeaveConfirmModal(): void {
    this.closeLeaveConfirmModal();
    this.stopAnyActiveOverclockAudio();

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-label', 'Confirm Leave Active Match');
    backdrop.innerHTML = `
      <div class="ws-modal-panel" style="max-width:460px;gap:14px;">
        <div class="ws-modal-sticky-header">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:800;color:var(--gold-bright);letter-spacing:0.06em;">
            LEAVE ACTIVE PRISM STAGE?
          </div>
          <button type="button" class="ws-btn-obsidian" id="ws-leave-cancel-top">← RESUME</button>
        </div>
        <p style="margin:0;font-size:13.5px;line-height:1.45;color:var(--ivory-primary);">
          Your Chrono-Ring is paused at <strong style="color:var(--gold-bright);">${this.timerRemainingSec.toFixed(1)}s</strong>. Return to the Meridian Hub, or resume right where you left off?
        </p>
        <div style="display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px;">
          <button type="button" class="ws-btn-obsidian" id="ws-leave-confirm-hub">LEAVE TO HUB</button>
          <button type="button" class="ws-btn-gold" id="ws-leave-resume-btn">RESUME MATCH ▶</button>
        </div>
      </div>
    `;

    backdrop.querySelector('#ws-leave-cancel-top')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.closeLeaveConfirmModal();
    });
    backdrop.querySelector('#ws-leave-resume-btn')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.closeLeaveConfirmModal();
    });
    backdrop.querySelector('#ws-leave-confirm-hub')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.closeLeaveConfirmModal();
      this.enterHub(this.activeHubTab);
    });
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) this.closeLeaveConfirmModal();
    });

    document.body.appendChild(backdrop);
    this.leaveConfirmModalEl = backdrop;
  }

  private closeLeaveConfirmModal(): void {
    if (this.leaveConfirmModalEl) {
      this.leaveConfirmModalEl.remove();
      this.leaveConfirmModalEl = null;
    }
  }

  private async bootAsync(canvasRoot: HTMLElement): Promise<void> {
    // Pillar #8 (#137 P1 #7a & #154): Cold boot opens immediately on the AAA Title Showcase!
    this.enterTitleShowcase();
    void preloadCharacterCutouts();

    // Upgrade #5A: Lazy-bind Offline Service Worker status subscription
    void this.getOfflineClient()
      .then(async (pwa) => {
        this.offlineStatusSnapshot = pwa.getOfflineVaultStatus();
        this.syncVaultLiveStatus();
        this.offlineUnsubscribe = pwa.subscribeOfflineStatus((st) => {
          this.offlineStatusSnapshot = st;
          this.syncVaultLiveStatus();
        });
        const refreshed = await pwa.refreshOfflineVaultStatus();
        this.offlineStatusSnapshot = refreshed;
        this.syncVaultLiveStatus();
      })
      .catch(() => {});

    await this.stage3d.mount(canvasRoot, 'ch');
    this.audio.setVenueAmbience('ch');
    this.metaSuite.applyEquippedFinish();

    if (this.screen === 'TITLE') {
      await this.stage3d.showTitleShowcase('ch');
      this.stage3d.setLightingMode('BROADCAST');
      this.metaSuite.applyEquippedFinish();
    } else if (this.screen === 'HUB') {
      await this.syncHub3DGlobe();
    }

    // Stream 1M+ Forge catalog + 96-mission Campaign + Wave-2 Narrative Bible concurrently
    await Promise.allSettled([
      forgeEngine.init('./data'),
      this.campaign.loadCampaignData('./data/campaign_20hr.json'),
      this.wave2Narrative.loadWave2Data('./data/narrative_wave2.json').then((ok) => {
        if (ok) {
          this.endlessMode.setLoreLogs(this.wave2Narrative.getAllArchiveLoreLogs());
          const banners = this.wave2Narrative
            .getBossPhaseBanners()
            .filter((b) => typeof b.phase === 'number')
            .map((b) => ({
              phase: b.phase as number,
              code: b.code || `PHASE_${b.phase}`,
              bannerTitle: b.bannerTitle || `PHASE ${b.phase}`,
              bannerSubtitle: b.bannerSubtitle || '',
              archetype: b.archetype || 'SIGHTLINE_LOCK',
              lightingMode: b.lightingMode || 'BROADCAST',
              voiceClipId: b.voiceClipId,
              voiceUrl: b.voiceUrl,
              text: b.text,
            }));
          if (banners.length > 0) {
            this.pendingWave2BossBanners = banners;
            this.bossBanner?.ingestWave2Banners(banners);
          }
        }
      }),
    ]);

    // #325: Re-sync selectedCityHub to the player's actual active campaign city once campaign_20hr.json is hydrated
    this.selectedCityHub = this.resolveCampaignResumeState().activeHub;
    this.syncVaultLiveStatus();

    if (this.screen === 'TITLE') {
      this.renderTitleScreen();
    } else if (this.screen === 'HUB') {
      const prevScrollTop =
        document.querySelector<HTMLElement>('.ws-hub-scroll')?.scrollTop ?? 0;
      await this.syncHub3DGlobe();
      this.renderHubScreen();
      if (prevScrollTop > 0) {
        this.restoreHubScrollIfNeeded(prevScrollTop);
      }
    }
  }

  private async setStageVenueWithAmbience(venue: VenueCode): Promise<void> {
    this.audio.setVenueAmbience(venue);
    await this.stage3d.setVenue(venue);
  }

  private pausePassive2DActors(): void {
    this.characterRig.actor.unmount();
    this.characterRig.rivalPrism.unmount();
  }

  private stopAnyActiveOverclockAudio(): void {
    this.canvasChargeAudioActive = false;
    this.hud.cancelOverclockHold();
    this.ergonomics.overclock.reset();
    this.audio.stopOverclockCharge();
    this.stage3d.cancelOverclockBluff();
    this.stage3d.setOverclockState(false, 0);
    if (typeof document !== 'undefined' && typeof PointerEvent !== 'undefined') {
      const canvas = document.querySelector('#canvas-root canvas');
      canvas?.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1 }));
    }
  }

  // ==========================================================================
  // #325 DETERMINISTIC "CONTINUE WHERE I LEFT OFF" & CAMPAIGN RESUME ENGINE
  // ==========================================================================

  private deriveResumeProloguePhase(): { phase: ProloguePhase; stepLabel: string; hasProgress: boolean } {
    const snap = this.blackboard.getSnapshot();
    const completed = new Set(snap.completedMissions);
    const flags = snap.branchFlags ?? {};
    const hasName = this.passport.hasRegisteredName();
    const pState = this.prologue.getInternalStateSnapshot();

    if (completed.has('ch_4')) {
      return { phase: 'PASSPORT_STAMP_PAYOFF', stepLabel: 'Passport Stamp', hasProgress: true };
    }
    if (completed.has('ch_3')) {
      return { phase: 'VETTING_Q4_CALIBRATOR', stepLabel: 'Q4 of 4 · Calibrator', hasProgress: true };
    }
    if (completed.has('ch_2')) {
      if (flags.manifesto) {
        return { phase: 'VETTING_Q3_OVERCLOCK', stepLabel: 'Q3 of 4 · Overclock', hasProgress: true };
      }
      return { phase: 'SPOTLIGHT_MANIFESTO', stepLabel: 'Charter Oath · Q3/4', hasProgress: true };
    }
    if (completed.has('ch_1')) {
      if (flags.prologue_leak) {
        return { phase: 'VETTING_Q2_PEEL', stepLabel: 'Q2 of 4 · Depth Peel', hasProgress: true };
      }
      return { phase: 'MIRROR_LEAK_CHOICE', stepLabel: 'Mirror Choice · Q2/4', hasProgress: true };
    }
    if (hasName) {
      return { phase: 'VETTING_Q1_SPIN', stepLabel: 'Q1 of 4 · Sightline', hasProgress: true };
    }
    if (pState.phase !== 'SUMMONS_CUTSCENE') {
      const label =
        pState.phase === 'IDENTITY_REGISTRATION'
          ? 'Identity Registration'
          : pState.phase === 'CHAMBER_OPENING'
            ? 'Geneva Vetting Chamber'
            : 'Geneva Vetting';
      return { phase: pState.phase, stepLabel: label, hasProgress: true };
    }
    return { phase: 'SUMMONS_CUTSCENE', stepLabel: 'Act 0 · Geneva Sanctuary', hasProgress: false };
  }

  private resolveCampaignResumeState(): CampaignResumeViewInfo {
    const snap = this.blackboard.getSnapshot();

    // Case 1: Act 0 Geneva Prologue not yet completed
    if (!snap.prologueComplete) {
      const derived = this.deriveResumeProloguePhase();
      if (!derived.hasProgress) {
        return {
          hasProgress: false,
          kind: 'NEW_GAME',
          activeHub: 'ch',
          nextMissionId: 'ch_1',
          primaryCtaLabel: '▶ START STORY CAMPAIGN',
          subLabel: 'Act 0 · Geneva Sanctuary',
          bannerTitle: 'Act 0 · Geneva Vetting Screening',
          bannerSub: '4-question diplomatic vetting to claim your Meridian Passport and unlock the World Circuit.',
        };
      }
      return {
        hasProgress: true,
        kind: 'RESUME_PROLOGUE',
        activeHub: 'ch',
        nextMissionId: null,
        primaryCtaLabel: '▶ CONTINUE: GENEVA VETTING',
        subLabel: `Geneva · ${derived.stepLabel}`,
        bannerTitle: `Geneva Vetting · ${derived.stepLabel}`,
        bannerSub: 'Pick up right where you left off in Julian Vance’s Geneva Chamber.',
      };
    }

    // Case 2: Prologue complete, Act I Flight Fork pending (London vs Tokyo)
    if (!snap.firstFlight) {
      return {
        hasProgress: true,
        kind: 'FLIGHT_FORK',
        activeHub: 'ch',
        nextMissionId: null,
        primaryCtaLabel: '▶ CONTINUE: CHOOSE LONDON OR TOKYO',
        subLabel: 'Act I World Circuit Fork',
        bannerTitle: 'Act I Flight Fork · London or Tokyo',
        bannerSub: 'Your Geneva Visa is stamped. Choose your opening World Circuit departure city.',
      };
    }

    // Case 3: Active World Circuit Campaign mission
    const completedSet = new Set(snap.completedMissions);
    let nextMissionId: string | null = null;
    let activeHub: CampaignHubCode = (snap.firstFlight === 'JP' ? 'jp' : 'gb') as CampaignHubCode;
    let cityName = activeHub === 'jp' ? 'Tokyo' : 'London';
    let slotNum = 1;
    let missionTitle = `${cityName} Mission 1`;

    if (this.campaign.isLoaded()) {
      const grid = this.campaign.getHubGridCards();
      const candidateCurId = snap.currentMissionId;
      const curView = candidateCurId ? this.campaign.getMissionView(candidateCurId) : null;
      const curHubCard = curView ? grid.find((g) => g.hubId === curView.hubId) : null;

      if (curView && curHubCard && curHubCard.status !== 'LOCKED' && !completedSet.has(curView.id)) {
        nextMissionId = curView.id;
        activeHub = curView.hubId as CampaignHubCode;
        cityName = curHubCard.city;
        slotNum = curView.rhythmSlot || 1;
        missionTitle = curView.title;
      } else {
        // Scan unlocked hubs in progression order (prioritizing chosen firstFlight track first!)
        const ordered = [...grid].sort((a, b) => {
          if (snap.firstFlight === 'JP') {
            if (a.hubId === 'jp' && b.hubId === 'gb') return -1;
            if (a.hubId === 'gb' && b.hubId === 'jp') return 1;
          }
          return a.order - b.order;
        });
        const nextHub =
          ordered.find((h) => h.status !== 'LOCKED' && h.nextPlayableMissionId) ??
          ordered.find((h) => h.status !== 'LOCKED') ??
          ordered[0];
        if (nextHub) {
          activeHub = nextHub.hubId as CampaignHubCode;
          cityName = nextHub.city;
          nextMissionId =
            nextHub.nextPlayableMissionId ??
            nextHub.coreMissionIds[0] ??
            nextHub.missionIds[0] ??
            `${activeHub}_1`;
          const mView = nextMissionId ? this.campaign.getMissionView(nextMissionId) : null;
          slotNum = mView?.rhythmSlot || 1;
          missionTitle = mView?.title ?? `${cityName} Round ${slotNum}`;
        }
      }
    } else {
      // Fallback before campaign_20hr.json finishes streaming
      const curId = snap.currentMissionId || (snap.firstFlight === 'JP' ? 'jp_1' : 'gb_1');
      const parts = curId.split('_');
      const prefix = (parts[0] || 'gb') as CampaignHubCode;
      const num = Math.max(1, Number(parts[1]) || 1);
      const cityNames: Record<CampaignHubCode, string> = {
        ch: 'Geneva',
        gb: 'London',
        jp: 'Tokyo',
        br: 'Rio de Janeiro',
        eg: 'Cairo',
        is: 'Reykjavik',
        sg: 'Singapore',
        global: 'The Apex Forum',
      };
      activeHub = cityNames[prefix] ? prefix : 'gb';
      cityName = cityNames[activeHub];
      slotNum = num;
      nextMissionId = curId;
      missionTitle = `${cityName} Round ${slotNum}`;
    }

    return {
      hasProgress: true,
      kind: 'RESUME_MISSION',
      activeHub,
      nextMissionId,
      primaryCtaLabel: `▶ CONTINUE: ${cityName.toUpperCase()} · M${slotNum}`,
      subLabel: missionTitle,
      bannerTitle: `${cityName} · Mission ${slotNum} — ${missionTitle}`,
      bannerSub: `Next story stage on your Meridian World Circuit.`,
    };
  }

  private resumePrologueWhereLeftOff(): void {
    const snap = this.blackboard.getSnapshot();
    if (snap.prologueComplete && !snap.firstFlight) {
      this.stopTelemetryLoop();
      this.activeBackstageCtx = null;
      this.activeMissionForChoice = null;
      this.presentPrologueStep(this.prologue.proceedToFlightFork());
      return;
    }

    const derived = this.deriveResumeProloguePhase();
    if (!derived.hasProgress) {
      this.startFullPrologueFlow();
      return;
    }

    this.stopTelemetryLoop();
    this.activeBackstageCtx = null;
    this.activeMissionForChoice = null;

    const flags = snap.branchFlags ?? {};
    const leakFlag = flags.prologue_leak;
    const mirrorChoice: 'EXPLOITED' | 'FLAGGED' | 'CLEAN' =
      leakFlag === 'EXPLOITED'
        ? 'EXPLOITED'
        : leakFlag === 'FLAGGED'
          ? 'FLAGGED'
          : 'CLEAN';
    const manFlag = flags.manifesto;
    const manifestoChoice: 'COUNCIL' | 'PUBLIC' | 'SELF' =
      manFlag === 'COUNCIL'
        ? 'COUNCIL'
        : manFlag === 'SELF'
          ? 'SELF'
          : 'PUBLIC';

    const cur = this.prologue.getInternalStateSnapshot();
    this.prologue.hydrateInternalState({
      ...cur,
      phase: derived.phase,
      selectedOrigin: this.passport.getSnapshot().origin ?? cur.selectedOrigin,
      mirrorChoice,
      manifestoChoice,
      leakedHintRevealed: mirrorChoice === 'EXPLOITED',
      stampedPersonaId: this.passport.getSnapshot().persona ?? cur.stampedPersonaId,
    });
    this.saveSlotManager.saveActiveSlot();
    this.presentPrologueStep(this.prologue.getSnapshot());
  }

  private handleContinueWhereLeftOff(): void {
    const resume = this.resolveCampaignResumeState();
    this.lockedCityNotice = null;
    if (resume.kind === 'NEW_GAME') {
      this.startFullPrologueFlow();
      return;
    }
    if (resume.kind === 'RESUME_PROLOGUE') {
      this.resumePrologueWhereLeftOff();
      return;
    }
    if (resume.kind === 'FLIGHT_FORK') {
      this.presentPrologueStep(this.prologue.proceedToFlightFork());
      return;
    }
    if (resume.nextMissionId) {
      this.selectedCityHub = resume.activeHub;
      void this.launchCampaignMission(resume.nextMissionId);
      return;
    }
    this.enterHub('CAMPAIGN');
  }

  private getCityLockRequirementText(hub: CampaignHubCode): string {
    const snap = this.blackboard.getSnapshot();
    if (!snap.prologueComplete) {
      return 'Complete the 4-question Geneva Vetting Interview first to unlock Act I departures.';
    }
    if (!snap.firstFlight && (hub === 'gb' || hub === 'jp')) {
      return 'Choose London or Tokyo at the Act I Flight Fork to begin your World Circuit.';
    }
    switch (hub) {
      case 'gb':
      case 'jp':
        return 'Complete Geneva Vetting and pick your Act I departure track.';
      case 'br':
      case 'eg':
        return 'Clear both London and Tokyo Boss Showdowns (Act I) to unlock Act II sanctuaries.';
      case 'is':
      case 'sg':
        return 'Clear both Rio de Janeiro and Cairo Boss Showdowns (Act II) to unlock Act III.';
      case 'global':
        return 'Clear Reykjavik and Singapore Boss Showdowns (Act III) to enter The Apex Forum Championship.';
      default:
        return 'Clear the current active sanctuary stage to unlock this venue.';
    }
  }

  private handleHubSelectCity(hub: CampaignHubCode): void {
    const cities = this.buildHubCitiesList();
    const picked = cities.find((c) => c.hub === hub);
    if (!picked) return;

    const snap = this.blackboard.getSnapshot();

    // #353 P0 #2: Flight Fork pending click on London or Tokyo MUST run BEFORE locked check!
    if (snap.prologueComplete && !snap.firstFlight && (hub === 'gb' || hub === 'jp')) {
      this.lockedCityNotice = null;
      this.handleFlightForkChoice(hub === 'gb' ? 'GB' : 'JP');
      return;
    }

    if (!picked.unlocked) {
      this.lockedCityNotice = {
        hub,
        city: picked.city,
        requirementText: this.getCityLockRequirementText(hub),
      };
      this.haptics.uiTap();
      this.renderHubScreen();
      // #353 P0 #3: Always scroll locked notice into view at top of Hub!
      requestAnimationFrame(() => {
        const sc = document.querySelector<HTMLElement>('.ws-hub-scroll');
        if (sc) sc.scrollTop = 0;
        document
          .getElementById('ws-hub-lock-notice')
          ?.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
      return;
    }

    this.lockedCityNotice = null;

    // Mid-Prologue click on Geneva immediately resumes Geneva Vetting!
    if (!snap.prologueComplete && hub === 'ch') {
      this.resumePrologueWhereLeftOff();
      return;
    }

    // Clicking the already-selected unlocked city launches its next playable mission immediately!
    if (hub === this.selectedCityHub && picked.nextPlayableMissionId) {
      void this.launchCampaignMission(picked.nextPlayableMissionId);
      return;
    }

    // #353 P0 #3: Switch city and deterministically scroll `#ws-hub-missions-panel` into view!
    this.selectedCityHub = hub;
    this.audio.setVenueAmbience(hub);
    this.stage3d.focusGlobeCity(hub as VenueCode);
    this.renderHubScreen();
    requestAnimationFrame(() => {
      const sc = document.querySelector<HTMLElement>('.ws-hub-scroll');
      const panel = document.getElementById('ws-hub-missions-panel');
      if (sc && panel) {
        sc.scrollTop = Math.max(0, panel.offsetTop - 8);
      } else {
        panel?.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    });
  }

  // ==========================================================================
  // 0. MAJESTIC FIRST-BOOT 3D TITLE SHOWCASE (#137 P1 #7a & #154 #8 & #325)
  // ==========================================================================

  private enterTitleShowcase(): void {
    this.stopTelemetryLoop();
    this.audio.stopVoice();
    this.pausePassive2DActors();
    this.hud.closeVaultDrawer();
    this.hud.closeVisualLightbox();
    this.hud.closeRulesModal();
    this.activeRoundReadyVm = null;
    this.onRoundReadyStart = null;
    this.activeFinalePickerVm = null;
    this.onFinaleCategorySelected = null;
    this.screen = 'TITLE';
    this.renderTitleScreen();
    void this.stage3d.showTitleShowcase('ch').then(() => {
      this.stage3d.setLightingMode('BROADCAST');
      this.metaSuite.applyEquippedFinish();
    });
  }

  private renderTitleScreen(): void {
    const counts = forgeEngine.getDomainCounts();
    const snap = this.blackboard.getSnapshot();
    const resumeState = this.resolveCampaignResumeState();
    this.hud.renderTitleShowcase({
      challengerName: this.passport.getChallengerName(),
      hasRegisteredName: this.passport.hasRegisteredName(),
      prologueCompleted: snap.prologueComplete,
      verifiedQuestionTotal:
        counts.verifiedUniqueTotal > 50000 ? counts.verifiedUniqueTotal : 949729,
      playableQuestionTotal:
        counts.totalPlayableCount > 50000 ? counts.totalPlayableCount : 1000129,
      resumeState,
      incomingDuel: this.pendingIncomingDuel,
      srsDueCount: this.metaSuite.getDueReviewCount(),
    });
  }

  private handleTitleEnterMeridian(): void {
    this.pushNavigationReturnSnapshot('HUB_FROM_TITLE');
    this.handleContinueWhereLeftOff();
  }

  private handleTitleQuickMode(tab: ActiveHubTab): void {
    if (tab === 'BRIEFING') {
      // #325 & #341: 1-click Topic Picker straight over Start Screen (Back/Close returns to Title!)
      void this.openBriefingPickerModal();
      return;
    }
    this.pushNavigationReturnSnapshot('HUB_FROM_TITLE');
    if (tab === 'DAILY') {
      if (!this.dailyMode.hasCompletedToday()) {
        this.launchDailyBroadcast();
        return;
      }
      this.enterHub('DAILY');
      return;
    }
    if (tab === 'ENDLESS') {
      if (!this.endlessMode.canResumeCheckpoint()) {
        void this.launchEndlessDescent(false);
        return;
      }
      this.enterHub('ENDLESS');
      return;
    }
    if (tab === 'CAMPAIGN') {
      this.selectedCityHub = this.resolveCampaignResumeState().activeHub;
    }
    this.enterHub(tab);
  }

  // ==========================================================================
  // STAGE 3D INTERACTIVE CALLBACKS & KEYBOARD / GAMEPAD ROUTING
  // ==========================================================================

  private bindStage3DEvents(): void {
    this.stage3d.events = {
      onSpinDetent: () => {
        this.spinUsedThisQ = true;
        this.haptics.spinTick();
        this.audio.playSfx('spin_tick');
      },
      onFacetSelected: (idx) => {
        if (!this.liveVm || this.liveVm.revealed) return;
        this.spinUsedThisQ = true;
        this.liveVm.selectedFacetIndex = idx;
        this.haptics.sightlineSnap();
        this.audio.playSfx('sightline_snap');
        if (this.matchCtx?.kind === 'TRIALS') {
          this.trialsMode.recordPlayerKineticGesture(this.getElapsedSec(), 'SPIN', {
            facetIndex: idx,
          });
        }
        this.hud.updateLiveTelemetry({
          remainingSec: this.timerRemainingSec,
          totalSec: this.timerTotalSec,
          selectedFacetIndex: idx,
        });
      },
      onGlobePinSelected: (lat, lon) => {
        this.handleSelectGlobeCoords(lat, lon, null, false);
      },
      onPeelTriggered: () => {
        this.handleTriggerPeel(true);
      },
      onSafeLock: (idx) => {
        if (!this.liveVm || this.liveVm.revealed) return;
        this.liveVm.selectedFacetIndex = idx;
        void this.commitCurrentAnswer(0);
      },
      onOverclockProgress: (charge01, active) => {
        if (
          !this.liveVm ||
          this.liveVm.revealed ||
          this.screen !== 'GAMEPLAY' ||
          this.isAnyOverlayModalOpen()
        ) {
          if (this.canvasChargeAudioActive) {
            this.canvasChargeAudioActive = false;
            this.audio.stopOverclockCharge();
          }
          return;
        }
        if (active && charge01 > 0.04) {
          if (!this.canvasChargeAudioActive) {
            this.canvasChargeAudioActive = true;
            this.audio.startOverclockCharge();
          }
          this.haptics.overclockPulse(charge01);
        } else if (!active) {
          this.canvasChargeAudioActive = false;
          this.audio.stopOverclockCharge();
        }
        const fillEl = document.getElementById('ws-overclock-fill');
        const labelEl = document.getElementById('ws-overclock-label');
        const tierMult = this.resolveLiveTierMultiplier(this.liveVm);
        if (fillEl) fillEl.style.width = active ? `${(charge01 * 100).toFixed(1)}%` : '0%';
        if (labelEl && active) {
          labelEl.textContent = `OVERCLOCKING ${(tierMult * (1 + charge01)).toFixed(2)}x — RELEASE TO LOCK`;
        }
      },
      onOverclockCommit: (idx, finalCharge01) => {
        if (!this.liveVm || this.liveVm.revealed) return;
        this.canvasChargeAudioActive = false;
        this.audio.stopOverclockCharge();
        this.liveVm.selectedFacetIndex = idx;
        void this.commitCurrentAnswer(finalCharge01);
      },
      onOverclockCancelBluff: () => {
        this.handleBluffCancel();
      },
      onCodexChanged: (topIdx, bottomIdx, changedRing) => {
        if (!this.liveVm || this.liveVm.revealed) return;
        const safeTop = Math.max(0, Math.min(2, topIdx)) as 0 | 1 | 2;
        if (changedRing === 'TOP') {
          // #190 P1 + #192: Rotating Top Subject Ring preserves saved pair & snaps Bottom Target Ring!
          const savedTarget = this.liveVm.codexTargetSelections[safeTop] ?? 0;
          this.stage3d.spinCodexRing('BOTTOM', savedTarget, false);
        } else {
          this.questionCodexMoves += 1;
          this.liveVm.codexTargetSelections[safeTop] = bottomIdx;
        }
        this.syncCodexConduitsTo3D();
        this.liveVm.remainingTimeSec = this.timerRemainingSec;
        this.hud.renderGameplay(this.liveVm);
      },
      onCalibratorChanged: (val) => {
        if (!this.liveVm || this.liveVm.revealed || !this.liveVm.question.calibrator) return;
        const cal = this.liveVm.question.calibrator;
        const step = cal.step || 1;
        const prev = this.liveVm.calibratorEstimate;
        const snapped = Math.round(val / step) * step;
        this.liveVm.calibratorEstimate = snapped;
        if (snapped !== prev) {
          this.haptics.spinTick();
          this.audio.playSfx('spin_tick');
        }
        const slider = document.getElementById('ws-cal-slider') as HTMLInputElement | null;
        const readout = document.getElementById('ws-cal-readout');
        const unitStr = cal.unit ? ` ${cal.unit}` : '';
        if (slider) slider.value = String(snapped);
        if (readout) {
          readout.textContent = `EST: ${formatHudValue(snapped, cal.unit, this.liveVm.question.prompt)}${unitStr}`;
        }
      },
      onCalibratorConeChanged: (coneId) => {
        if (!this.liveVm || this.liveVm.revealed || !this.liveVm.question.calibrator) return;
        if (this.liveVm.calibratorCone !== coneId) {
          this.haptics.sightlineSnap();
          this.audio.playSfx('sightline_snap');
          this.handleUpdateCalibrator(this.liveVm.calibratorEstimate, coneId);
        }
      },
      onGauntletSwipe: (verdict) => {
        this.handleGauntletSubmit(verdict);
      },
      onGlobeCitySelected: (venue) => {
        if (this.screen !== 'HUB') return;
        const validHubs = new Set(['ch', 'gb', 'jp', 'br', 'eg', 'is', 'sg', 'global']);
        if (validHubs.has(venue)) {
          this.handleHubSelectCity(venue as CampaignHubCode);
        }
      },
    };
  }

  private handlePrimaryAdvanceKey(): void {
    if (this.screen === 'TITLE') {
      this.handleTitleEnterMeridian();
      return;
    }
    if (this.screen === 'ROUND_READY') {
      void this.handleStartRoundQuestions();
      return;
    }
    if (this.screen === 'GAMEPLAY' && this.liveVm?.revealed) {
      void this.advanceAfterReveal();
      return;
    }
    if (this.screen === 'STORY_DIALOGUE') {
      // Strictly never skip mandatory branching or ending choices (#145 P0 #3)
      if (this.activeDialogueVm?.choices && this.activeDialogueVm.choices.length > 0) {
        return;
      }
      this.handleAdvanceDialogue();
      return;
    }
    if (this.screen === 'SUMMARY' && this.activeSummaryVm) {
      this.handleSummaryPrimaryContinue();
    }
  }

  private nudgeCalibratorSteps(stepMultiplier: number): void {
    if (!this.liveVm || this.liveVm.revealed || !this.liveVm.question.calibrator) return;
    const cal = this.liveVm.question.calibrator;
    const next = Math.max(
      cal.minVal,
      Math.min(cal.maxVal, this.liveVm.calibratorEstimate + cal.step * stepMultiplier),
    );
    this.haptics.spinTick();
    this.audio.playSfx('spin_tick');
    this.handleUpdateCalibrator(next, this.liveVm.calibratorCone);
    const slider = document.getElementById('ws-cal-slider') as HTMLInputElement | null;
    const readout = document.getElementById('ws-cal-readout');
    const unitStr = cal.unit ? ` ${cal.unit}` : '';
    if (slider) slider.value = String(next);
    if (readout) {
      readout.textContent = `EST: ${formatHudValue(next, cal.unit, this.liveVm.question.prompt)}${unitStr}`;
    }
  }

  private rerenderTopState(): void {
    if (this.screen === 'TITLE') this.renderTitleScreen();
    else if (this.screen === 'HUB') this.renderHubScreen();
    else if (this.screen === 'ROUND_READY' && this.activeRoundReadyVm) {
      this.hud.renderRoundReady(this.activeRoundReadyVm);
    } else if (this.screen === 'FINALE_PICKER' && this.activeFinalePickerVm) {
      this.hud.renderFinaleCategoryPicker(this.activeFinalePickerVm);
    } else if (this.screen === 'GAMEPLAY' && this.liveVm) {
      this.liveVm.remainingTimeSec = this.timerRemainingSec;
      this.hud.renderGameplay(this.liveVm);
    } else if (this.screen === 'STORY_DIALOGUE' && this.activeDialogueVm) {
      this.hud.renderStoryDialogue(this.activeDialogueVm);
    } else if (this.screen === 'SUMMARY' && this.activeSummaryVm) {
      this.hud.renderMatchSummary(this.activeSummaryVm);
    } else if (this.screen === 'REGISTRATION') {
      const snap = this.prologue.getSnapshot();
      this.hud.renderRegistration({
        challengerName: this.passport.getChallengerName(),
        selectedOrigin: snap.selectedOrigin,
        vanceLine: snap.dialogueText,
      });
    }
  }

  // ==========================================================================
  // GENEVA PROLOGUE & REAL CHALLENGER NAME ENTRY
  // ==========================================================================

  private startFullPrologueFlow(): void {
    this.stopTelemetryLoop();
    this.prologueScoring.reset(0);
    this.activeBackstageCtx = null;
    this.activeMissionForChoice = null;
    const snap = this.prologue.startFromBeginning();
    this.presentPrologueStep(snap);
  }

  private handleCompleteRegistration(name: string, origin: OriginId): void {
    this.prologueScoring.reset(0);
    const { validation, snapshot } = this.prologue.submitIdentityAndOrigin(name, origin);
    if (!validation.valid) {
      this.haptics.wrongThud(false);
      this.audio.playSfx('ui_tap');
      this.hud.renderRegistration({
        challengerName: name,
        selectedOrigin: origin,
        vanceLine: snapshot.dialogueText,
        errorMessage:
          validation.error || 'Enter 1–22 letters, numbers, or spaces for your Challenger name.',
      });
      return;
    }
    this.saveSlotManager.saveActiveSlot();
    this.presentPrologueStep(snapshot);
  }

  private presentPrologueStep(snap: PrologueStepSnapshot): void {
    void this.setStageVenueWithAmbience('ch');
    this.stage3d.setLightingMode(snap.stageLightingMode);
    this.onDialogueSecondaryAction = null;

    if (snap.phase === 'SUMMONS_CUTSCENE' && snap.cutsceneSlides) {
      void this.getMotionCinema().then((cinema) => {
        cinema.play(
          {
            id: 'act0_invitation',
            title: 'ACT 0 · THE BLACK-GLASS SUMMONS',
            location: 'Geneva, Switzerland · 23:42 CET',
            image: snap.cutsceneImageUrl ?? './assets/cutscenes/act0_invitation.jpg',
            weather_fx: 'alpine_snow',
            lines: snap.cutsceneSlides!.map((s) => ({
              id: s.id,
              speaker: s.speakerId,
              speaker_name: s.speakerName,
              expression: s.expression,
              voice_clip: s.voiceUrl,
              text: s.subtitle,
            })),
          },
          this.passport.getChallengerName(),
          () => {
            const next = this.prologue.advanceFromCutscene();
            this.saveSlotManager.saveActiveSlot();
            this.presentPrologueStep(next);
          },
          { showPrologueSummons: true },
        );
      });
      return;
    }

    if (snap.requiresNameAndOriginInput || snap.phase === 'IDENTITY_REGISTRATION') {
      this.screen = 'REGISTRATION';
      void this.stage3d.showTitleShowcase('ch');
      this.stage3d.setLightingMode('INTERVIEW');
      this.stage3d.setCameraShot('INTERVIEW_CLOSEUP');
      this.metaSuite.applyEquippedFinish();

      if (snap.voiceUrl) this.audio.playVoice(snap.voiceUrl);
      else this.audio.stopVoice();
      this.hud.renderRegistration({
        challengerName: this.passport.getChallengerName(),
        selectedOrigin: snap.selectedOrigin,
        vanceLine: snap.dialogueText,
      });
      return;
    }

    if (snap.activeQuestion) {
      if (snap.voiceUrl) this.audio.playVoice(snap.voiceUrl);
      else this.audio.stopVoice();
      const qCard = snap.activeQuestion;
      const prismQ = prologueCardToPrismQuestion(qCard);
      if (qCard.facets && qCard.correctFacetIndex !== undefined) {
        const wrongIdxs = [0, 1, 2, 3]
          .filter((i) => i !== qCard.correctFacetIndex)
          .slice(0, 2);
        prismQ.facets = qCard.facets.map((text, idx) => ({
          index: idx,
          slotLabel: (['A', 'B', 'C', 'D'][idx] ?? 'A') as 'A' | 'B' | 'C' | 'D',
          text,
          isCorrect: idx === qCard.correctFacetIndex,
          plausibility: idx === qCard.correctFacetIndex ? 1 : 0.7,
          crowdSharePct: idx === qCard.correctFacetIndex ? 46 : 18,
          shattersOnTier3: wrongIdxs.includes(idx),
        }));
        prismQ.correctFacetIndex = qCard.correctFacetIndex;
        if (prismQ.clueTiers[2]) {
          prismQ.clueTiers[2].shatteredFacetIndices = wrongIdxs;
        }
      }

      this.matchCtx = { kind: 'PROLOGUE', qCard };
      this.activeGambitSession = null;
      this.activeMercyBoost = null;
      this.activeClueLadder = null;
      const initialPeel: PeelTier = 1;
      const leakedActive = Boolean(snap.leakedHintRevealed && qCard.leakedHintText);

      const prologueMechanicByIdx: Record<number, { title: string; tip: string }> = {
        1: {
          title: 'Pick & Lock',
          tip: 'Tap any choice A–D, then tap ✓ Lock Answer to submit (+300 pts). No penalty for missing during warmup!',
        },
        2: {
          title: 'Hint & 50/50',
          tip: leakedActive
            ? 'Mara’s Margin Note is already open! Need more help? Tap ◆ Hint (2× pts) or 50/50 (1× pts) to cross out 2 wrong choices.'
            : 'Need a nudge? Tap ◆ Hint (2× pts) for a clue, or tap again for 50/50 (1× pts) to cross out 2 wrong choices.',
        },
        3: {
          title: '2× Double Down',
          tip: 'Confident in your answer? Toggle ✦ 2× Double Down before locking to double your points (+600 pts), or stay safe at 1×.',
        },
        4: {
          title: 'Closest-Year Slider',
          tip: 'Slide the year dial to your best guess, choose a precision band (Wide / Sharp / Bullseye), and tap ✓ Lock Answer!',
        },
      };
      const mech = prologueMechanicByIdx[qCard.questionIndex] ?? prologueMechanicByIdx[1];

      this.presentRoundReadyGate(
        {
          chyronTitle: 'GENEVA · THE VETTING CHAMBER',
          chyronSub: `WARMUP QUESTION ${qCard.questionIndex} OF 4`,
          roundTitle: `Ready for Question ${qCard.questionIndex} of 4`,
          roundSubtitle: 'Warmup — you cannot fail this check. Take your time!',
          difficultyLabel: 'Middle School · Warmup',
          difficultyTierKey: 'middle-school',
          questionCount: 4,
          timerPerQuestionSec: Math.round(prismQ.timerSec || 35),
          isPrologueStep: true,
          prologueQuestionNumber: qCard.questionIndex,
          prologueMechanicTitle: mech.title,
          prologueMechanicTip: mech.tip,
          startButtonLabel: `▶ START QUESTION ${qCard.questionIndex}`,
        },
        () => {
          void this.beginQuestionOnStage(prismQ, {
            modeLabel: 'GENEVA WARMUP',
            chyronTitle: 'GENEVA · THE VETTING CHAMBER',
            chyronSub: `WARMUP · Q${qCard.questionIndex} / 4`,
            questionIndex: qCard.questionIndex - 1,
            questionTotal: 4,
            playerScore: this.prologueScoring.getMatchScore(),
            streak: this.prologueScoring.getStreak(),
            rivalId: 'vance',
            rivalName: 'Vance',
            rivalScore: 0,
            rivalStatus: 'HIDDEN',
            actorId: snap.speakerId,
            actorName: snap.speakerName,
            actorExpression: snap.expression,
            tellLine: leakedActive ? qCard.leakedHintText! : snap.tellHint || snap.dialogueText,
            coachHint: leakedActive ? qCard.leakedHintText! : qCard.coachPrompt,
            initialPeelTier: initialPeel,
            peelSealed: false,
          });
        },
        false,
      );
      return;
    }

    // Story / Ethical Interrupt / Passport Stamp Ceremony / Flight Fork Dialogue
    // #353 P0 #1: Clear active Prologue question matchCtx so UNLOCK WORLD GLOBE ▶ advances cleanly!
    this.matchCtx = null;
    this.screen = 'STORY_DIALOGUE';

    if (snap.phase === 'ACT1_FLIGHT_FORK') {
      if (snap.voiceUrl) this.audio.playVoice(snap.voiceUrl);
      else this.audio.stopVoice();
      void this.stage3d.showWorldGlobe({
        focusedVenue: 'ch',
        unlockedVenues: ['ch', 'gb', 'jp'],
        completedVenues: ['ch'],
        showAct1FlightFork: true,
      });
    } else if (snap.phase === 'PASSPORT_STAMP_PAYOFF') {
      // Record Prologue honours right at the actual Passport Stamp Ceremony (after Q1–Q4 complete!)
      this.metaSuite.recordSpecialFeat('PASSPORT_STAMPED');
      this.metaSuite.recordSpecialFeat('PROLOGUE_CLEARED');
      this.saveSlotManager.saveActiveSlot();
      // Play dedicated Wave-2 Persona Ink-Stamp Ceremony VO (#135 / #142)!
      const personaId = this.passport.getSnapshot().persona;
      const ceremony = personaId ? this.wave2Narrative.getPersonaCeremony(personaId) : undefined;
      const personaVo =
        ceremony?.voiceUrl ||
        (personaId ? `./assets/voice/vance_persona_${personaId.toLowerCase()}.mp3` : snap.voiceUrl);
      if (personaVo) this.audio.playVoice(personaVo);
      else this.audio.stopVoice();
      this.audio.playSfx('passport_stamp');
      this.haptics.passportStamp();
      void this.stage3d.showHeroRelic('meridian_astrolabe', 0);
      this.vfx.playGoldResonance(3, true);
      this.onDialogueSecondaryAction = () => {
        this.openPassportModal(true);
      };
    } else if (snap.voiceUrl) {
      this.audio.playVoice(snap.voiceUrl);
    } else {
      this.audio.stopVoice();
    }

    const choices =
      snap.mirrorLeakChoices?.map((c) => ({
        id: `MIRROR:${c.id}`,
        label: c.label,
        subtext: c.subtext,
        consequenceTag: c.impactBadge,
      })) ??
      snap.manifestoChoices?.map((c) => ({
        id: `MANIFESTO:${c.id}`,
        label: c.label,
        subtext: c.subtext,
        consequenceTag: c.impactBadge,
      })) ??
      snap.flightForkChoices?.map((c) => ({
        id: `FORK:${c.id}`,
        label: c.label,
        subtext: c.subtext,
        consequenceTag: c.impactBadge,
      }));

    this.activeDialogueVm = {
      chyronTitle:
        snap.phase === 'ACT1_FLIGHT_FORK'
          ? 'ACT I · GLOBAL FLIGHT FORK'
          : 'GENEVA · THE VETTING CHAMBER',
      locationLabel: 'SWITZERLAND · DIPLOMATIC VAULT',
      speakerId: snap.speakerId,
      speakerName: snap.speakerName,
      speakerRole: snap.speakerRole,
      expression: snap.expression,
      text: snap.dialogueText,
      tellText: snap.tellHint,
      choices,
      secondaryActionLabel:
        snap.phase === 'PASSPORT_STAMP_PAYOFF' ? 'INSPECT STAMPED PASSPORT' : undefined,
      continueLabel:
        snap.phase === 'PASSPORT_STAMP_PAYOFF' ? 'UNLOCK WORLD GLOBE ▶' : 'CONTINUE ▶',
    };
    this.hud.renderStoryDialogue(this.activeDialogueVm);
  }

  private handleFlightForkChoice(dest: 'GB' | 'JP'): void {
    const { nextMissionId } = this.prologue.selectAct1FlightFork(dest);
    this.selectedCityHub = dest === 'GB' ? 'gb' : 'jp';
    this.lockedCityNotice = null;
    this.saveSlotManager.saveActiveSlot();
    void this.launchCampaignMission(nextMissionId);
  }

  // ==========================================================================
  // HUB, BACKSTAGE CONVERSATIONS & 8-CITY MERIDIAN CIRCUIT WORLD GLOBE
  // ==========================================================================

  private enterHub(tab: ActiveHubTab = 'CAMPAIGN'): void {
    this.stopTelemetryLoop();
    this.audio.stopVoice();
    this.pausePassive2DActors();
    this.hud.closeVaultDrawer();
    this.hud.closeVisualLightbox();
    this.hud.closeRulesModal();
    this.activeRoundReadyVm = null;
    this.onRoundReadyStart = null;
    this.activeFinalePickerVm = null;
    this.onFinaleCategorySelected = null;
    this.activeClueLadder = null;
    this.activeGambitSession = null;
    this.activeMercyBoost = null;
    this.liveBluffRadarLabel = null;
    this.matchCtx = null;
    this.liveVm = null;
    this.activeBackstageCtx = null;
    this.onDialogueSecondaryAction = null;
    this.lockedCityNotice = null;
    this.screen = 'HUB';
    this.activeHubTab = tab;
    if (tab === 'CAMPAIGN') {
      const resume = this.resolveCampaignResumeState();
      this.selectedCityHub = resume.activeHub;
    }
    this.renderHubScreen();
    void this.syncHub3DGlobe();
  }

  private async syncHub3DGlobe(): Promise<void> {
    const snap = this.blackboard.getSnapshot();
    const hubCards = this.campaign.isLoaded() ? this.campaign.getHubGridCards() : [];
    const unlockedVenues = hubCards
      .filter((h) => h.status !== 'LOCKED')
      .map((h) => h.hubId as VenueCode);
    const completedVenues = hubCards
      .filter((h) => h.status === 'COMPLETED')
      .map((h) => h.hubId as VenueCode);

    await this.setStageVenueWithAmbience(this.selectedCityHub as VenueCode);
    this.stage3d.setLightingMode('BROADCAST');
    await this.stage3d.showWorldGlobe({
      focusedVenue: this.selectedCityHub as VenueCode,
      unlockedVenues: unlockedVenues.length > 0 ? unlockedVenues : ['ch'],
      completedVenues,
      showAct1FlightFork: snap.prologueComplete && !snap.firstFlight,
    });
  }

  private buildHubCitiesList(): CityCardState[] {
    const resume = this.resolveCampaignResumeState();
    const snap = this.blackboard.getSnapshot();
    const forkPending = snap.prologueComplete && !snap.firstFlight;
    if (!this.campaign.isLoaded()) {
      const defaults = buildDefaultCityCards();
      return defaults.map((c) => {
        const unlocked =
          c.unlocked || (forkPending && (c.hub === 'gb' || c.hub === 'jp'));
        return {
          ...c,
          unlocked,
          isActiveResumeHub: c.hub === resume.activeHub,
          nextPlayableMissionId:
            c.hub === resume.activeHub
              ? resume.nextMissionId
              : c.missions.find((m) => m.unlocked && !m.completed)?.id ?? null,
          lockRequirementText: unlocked ? undefined : this.getCityLockRequirementText(c.hub),
        };
      });
    }
    const grid = this.campaign.getHubGridCards();
    const completedSet = new Set(snap.completedMissions);

    return grid.map((card) => {
      const unlockedHub =
        card.status !== 'LOCKED' ||
        (forkPending && (card.hubId === 'gb' || card.hubId === 'jp'));
      const hubView = this.campaign.getHubView(card.hubId);

      const missions = hubView
        ? hubView.missions.map((m, idx) => {
            const coreIdx = hubView.coreMissions.findIndex((cm) => cm.id === m.id);
            const prevCoreDone =
              coreIdx <= 0
                ? unlockedHub
                : completedSet.has(hubView.coreMissions[coreIdx - 1].id);
            const isPlayable =
              unlockedHub &&
              (m.completed ||
                m.isNextPlayable ||
                (m.isSideInvestigation ? unlockedHub : prevCoreDone));
            const localFail = this.localFailedMissions.get(m.id);
            return {
              id: m.id,
              slot: m.isSideInvestigation ? idx + 1 : coreIdx + 1,
              title: m.title,
              subtitle: m.subtitle,
              unlocked: isPlayable,
              completed: m.completed,
              isBoss: !m.isSideInvestigation && m.rhythmSlot === 5,
              isSideInvestigation: m.isSideInvestigation,
              questionCount: m.questionCount,
              estimatedMinutes: m.estimatedMinutes,
              failedAttempts: m.failedAttemptInfo?.attempts ?? localFail?.attempts,
              lastFailReason: m.failedAttemptInfo?.lastFailReason ?? localFail?.lastFailReason,
            };
          })
        : card.missionIds.map((mid, idx) => {
            const mView = this.campaign.getMissionView(mid);
            const done = completedSet.has(mid);
            const prevDone = idx === 0 ? unlockedHub : completedSet.has(card.missionIds[idx - 1]);
            const isPlayable =
              unlockedHub && (done || prevDone || mid === card.nextPlayableMissionId);
            const localFail = this.localFailedMissions.get(mid);
            return {
              id: mid,
              slot: idx + 1,
              title: mView?.title ?? `${card.city} Round ${idx + 1}`,
              subtitle: mView?.subtitle ?? card.venueName,
              unlocked: isPlayable,
              completed: done,
              isBoss: idx === 4,
              failedAttempts: mView?.failedAttemptInfo?.attempts ?? localFail?.attempts,
              lastFailReason:
                mView?.failedAttemptInfo?.lastFailReason ?? localFail?.lastFailReason,
            };
          });

      const firstCoreId = card.coreMissionIds[0] ?? card.missionIds[0];
      const hubCode = card.hubId as CampaignHubCode;
      const stageSpec = getCampaignStageSpec(hubCode);
      const hubTier = resolveCampaignAcademicTier(hubCode, 0, 0);
      const earlyHubFloorSec =
        hubCode === 'ch' ? 30 : hubCode === 'gb' ? 28 : hubCode === 'jp' ? 26 : 0;
      const timerSec = Math.max(
        earlyHubFloorSec,
        getAcademicTierSpec(hubTier).timerSec,
        stageSpec.timerSec,
        this.campaign.getMissionView(firstCoreId)?.matchSpec.timePerQuestionSec ?? stageSpec.timerSec,
      );
      const nextPlayableId =
        card.nextPlayableMissionId ??
        missions.find((m) => m.unlocked && !m.completed)?.id ??
        missions.find((m) => m.unlocked)?.id ??
        null;
      const nextPlayableTitle = nextPlayableId
        ? missions.find((m) => m.id === nextPlayableId)?.title ?? null
        : null;

      return {
        hub: hubCode,
        order: card.order,
        city: card.city,
        venueName: card.venueName,
        difficultyLabel: formatDifficultyPresetLabel(hubTier),
        timerSec,
        unlocked: unlockedHub,
        clearedMissions: card.completedCount,
        totalMissions: card.totalCount,
        coreClearedMissions: card.coreCompletedCount,
        coreTotalMissions: card.coreTotalCount,
        sideClearedMissions: card.sideCompletedCount,
        sideTotalMissions: card.sideTotalCount,
        diplomaticCrossClearance: card.diplomaticCrossClearance,
        activeBranchBadge: card.activeBranchBadge,
        isActiveResumeHub: card.hubId === resume.activeHub,
        nextPlayableMissionId: nextPlayableId,
        nextPlayableMissionTitle: nextPlayableTitle,
        lockRequirementText: unlockedHub
          ? undefined
          : this.getCityLockRequirementText(card.hubId as CampaignHubCode),
        missions,
      };
    });
  }

  private renderHubScreen(): void {
    const snap = this.blackboard.getSnapshot();
    const passSnap = this.passport.getSnapshot();
    const counts = forgeEngine.getDomainCounts();
    const trialsOverview = this.trialsMode.getHubOverview();
    const endlessHud = this.endlessMode.getHUDState();
    const campOverview = this.campaign.getCampaignOverview();
    const resumeState = this.resolveCampaignResumeState();

    const duelTotals = duelRivalsStore.getRecordSummary();
    const recentRivals = duelRivalsStore.getRivals().slice(0, 4).map((r) => ({
      name: r.name,
      bestScore: r.bestScoreOverall,
      recordLabel: `${r.lossesAgainstPlayer}W-${r.winsAgainstPlayer}L${r.tiesWithPlayer > 0 ? `-${r.tiesWithPlayer}T` : ''}`,
    }));

    const activeCrest = passSnap.activeTitleCrest?.trim();
    const basePersona = passSnap.persona
      ? PERSONA_DEFINITIONS[passSnap.persona].title
      : 'Candidate';
    const challengerClean = this.passport.getChallengerName();
    let personaTitle = basePersona;
    if (activeCrest) {
      const aLow = activeCrest.toLowerCase();
      const bLow = basePersona.toLowerCase();
      if (aLow.includes(bLow) || bLow.includes(aLow)) {
        personaTitle = activeCrest.length >= basePersona.length ? activeCrest : basePersona;
      } else {
        personaTitle = `${basePersona} · ${activeCrest}`;
      }
    }
    if (personaTitle.toLowerCase() === challengerClean.toLowerCase()) {
      personaTitle = '';
    }

    this.hud.renderHub({
      activeTab: this.activeHubTab,
      challengerName: challengerClean,
      personaLabel: personaTitle,
      prologueCompleted: snap.prologueComplete,
      flightForkPending: snap.prologueComplete && !snap.firstFlight,
      selectedCityHub: this.selectedCityHub,
      activeResumeHub: resumeState.activeHub,
      resumeState,
      lockedCityNotice: this.lockedCityNotice,
      duelRivalsSummary: {
        totalDuels: duelTotals.totalDuels,
        wins: duelTotals.wins,
        losses: duelTotals.losses,
        ties: duelTotals.ties,
        recentRivals,
      },
      cities: this.buildHubCitiesList(),
      campaignCompletedMissions: campOverview.completedMissionsCount,
      campaignTotalMissions: campOverview.totalMissionsCount,
      campaignCompletionPct: campOverview.completionPct,
      campaignCompletionLabel: campOverview.completionLabel,
      campaignRemainingHoursLabel: campOverview.estimatedRemainingLabel,
      verifiedQuestionTotal:
        counts.verifiedUniqueTotal > 50000 ? counts.verifiedUniqueTotal : 949729,
      playableQuestionTotal:
        counts.totalPlayableCount > 50000 ? counts.totalPlayableCount : 1000129,
      dailyCompletedToday: this.dailyMode.hasCompletedToday(),
      dailyBestScore:
        passSnap.dailyHistory.reduce((max, d) => Math.max(max, d.score), 0) || 0,
      endlessBestFloor: endlessHud.bestDepthEver,
      endlessBestScore: endlessHud.bestScoreEver,
      endlessCanResumeDepth: this.endlessMode.canResumeCheckpoint() ? endlessHud.depth : null,
      pledgedFaction: snap.pledgedFaction ?? 'AGORA',
      trialsWins: trialsOverview.wins,
      blackSalonUnlocked: snap.blackSalonUnlocked,
    });
  }

  /**
   * Launches one of `#142`'s voiced multi-node Backstage Interrogations & Hub Conversations!
   */
  private async launchBackstageConversation(hubId: HubId): Promise<void> {
    this.pushNavigationReturnSnapshot('BACKSTAGE');
    this.stopTelemetryLoop();
    // Prevent Act II/III/IV spoiler leaks: use Wave2NarrativeDirector's mission-slot-sorted unlock filter
    const convs = this.wave2Narrative.getUnlockedBackstageConversationsForHub(hubId);
    if (convs.length === 0) return;
    const cursor = this.backstageCursorByHub.get(hubId) ?? 0;
    const conv = convs[cursor % convs.length];
    this.backstageCursorByHub.set(hubId, cursor + 1);

    const firstNode = conv.nodes[0];
    if (!firstNode) return;

    await this.setStageVenueWithAmbience(hubId as VenueCode);
    this.stage3d.setLightingMode('INTERVIEW');
    this.stage3d.setCameraShot('INTERVIEW_CLOSEUP');

    this.activeBackstageCtx = {
      hubId,
      conversation: conv,
      currentNode: firstNode,
    };
    this.screen = 'STORY_DIALOGUE';
    this.renderBackstageNode(firstNode);
  }

  private renderBackstageNode(node: BackstageDialogueNode): void {
    if (!this.activeBackstageCtx) return;
    const conv = this.activeBackstageCtx.conversation;
    this.activeBackstageCtx.currentNode = node;

    if (node.voiceUrl) {
      this.audio.playVoice(node.voiceUrl);
    } else {
      this.audio.stopVoice();
    }

    // Evaluate authored `passiveDomainCheck` against live Passport Elo & Forge IRT theta
    let passiveInsightText: string | undefined;
    if (node.passiveDomainCheck) {
      const { domainId, minTheta, insight } = node.passiveDomainCheck;
      const passSnap = this.passport.getSnapshot();
      const playerElo = passSnap.domainElo[domainId] ?? 1200;
      const solvedInDomain = passSnap.domainQuestionsSolved[domainId] ?? 0;
      const eloTheta = (playerElo - 1200) / 320;
      const forgeTheta = forgeEngine.getSkillSnapshot().thetaDomain[domainId] ?? 0;
      const effectiveTheta = Math.max(eloTheta, forgeTheta);
      if ((solvedInDomain > 0 || forgeTheta > 0.05) && effectiveTheta >= minTheta) {
        passiveInsightText = this.passport.interpolateText(insight);
      }
    }

    const choices =
      node.options && node.options.length > 0
        ? node.options.map((opt) => {
            const extOpt = opt as typeof opt & { unlockPerk?: string; vaultClue?: string };
            const tags: string[] = [];
            if (opt.unlockEvidenceClue) tags.push('DOSSIER CLUE');
            if (extOpt.unlockPerk) tags.push('✦ PERK');
            if (extOpt.vaultClue) tags.push('VAULT KEY');
            if (opt.integrityDelta) {
              tags.push(`${opt.integrityDelta > 0 ? '+' : ''}${opt.integrityDelta} INTEGRITY`);
            }
            if (opt.publicTrustDelta) {
              tags.push(`${opt.publicTrustDelta > 0 ? '+' : ''}${opt.publicTrustDelta} TRUST`);
            }
            if (opt.councilFavorDelta) {
              tags.push(`${opt.councilFavorDelta > 0 ? '+' : ''}${opt.councilFavorDelta} FAVOR`);
            }
            if (opt.bondNpc && opt.bondDelta) {
              tags.push(`${opt.bondDelta > 0 ? '+' : ''}${opt.bondDelta} ${opt.bondNpc.toUpperCase()}`);
            }
            return {
              id: `BACKSTAGE:${opt.id}`,
              label: opt.label,
              consequenceTag: tags.length > 0 ? tags.slice(0, 2).join(' · ') : undefined,
            };
          })
        : undefined;

    const nextInChain =
      node.nextNodeId && node.nextNodeId !== 'END'
        ? conv.nodes.find((n) => n.id === node.nextNodeId)
        : undefined;

    this.activeDialogueVm = {
      chyronTitle: `BACKSTAGE · ${conv.title.toUpperCase()}`,
      locationLabel: conv.locationLabel,
      speakerId: node.speakerId,
      speakerName: node.speakerName,
      speakerRole: 'Backstage Interrogation',
      expression: node.expression,
      text: node.text,
      passiveInsightText,
      tellText: node.tellHint,
      choices,
      continueLabel: nextInChain ? 'NEXT ▶' : 'RETURN TO CIRCUIT HUB ▶',
    };
    this.hud.renderStoryDialogue(this.activeDialogueVm);
  }

  // ==========================================================================
  // CAMPAIGN 40-MISSION LAUNCHER (MOTION-CINEMA + BOSS BANNERS + 4 ENDINGS)
  // ==========================================================================

  private async launchCampaignMission(missionId: string): Promise<void> {
    this.stopTelemetryLoop();
    this.activeBackstageCtx = null;
    if (!this.campaign.isLoaded()) {
      await this.campaign.loadCampaignData('./data/campaign_20hr.json');
    }

    const weakestDomain = forgeEngine.pickNemesisCounterDomain();
    const mView = this.campaign.getMissionView(missionId, weakestDomain);
    if (!mView) {
      this.startFullPrologueFlow();
      return;
    }

    this.selectedCityHub = mView.hubId as CampaignHubCode;
    this.pendingChoiceNextMissionOverride = undefined;

    // #353 P0 #4: Stream 3D venue room non-blocking so Start Screen -> Continue transitions instantly!
    void this.setStageVenueWithAmbience(mView.hubId as VenueCode).then(() => {
      this.stage3d.setLightingMode(mView.matchSpec.stageLightingMode);
    });

    // #145 P0 #1: Split pre-match choices vs post-match Championship Ending choices (`global_5`)!
    const preMatchChoices = mView.choices.filter((c) => !c.endingId);

    const runPreMatchStory = () => {
      this.activeMissionForChoice = mView;
      this.playDialogueSequence(
        `${mView.countryCode} · ${mView.title.toUpperCase()}`,
        mView.subtitle,
        mView.preMatchBeats,
        preMatchChoices,
        () => {
          void this.startCampaignPrismMatch(mView);
        },
        true,
      );
    };

    if (mView.cutsceneBefore && !this.playedCutsceneIds.has(mView.cutsceneBefore.id)) {
      this.playedCutsceneIds.add(mView.cutsceneBefore.id);
      const cs = mView.cutsceneBefore;
      const cinema = await this.getMotionCinema();
      cinema.play(
        {
          id: cs.id,
          title: cs.title,
          location: cs.location,
          image: cs.imageUrl,
          ken_burns: {
            start_scale: cs.kenBurns.startScale,
            end_scale: cs.kenBurns.endScale,
            pan_x: cs.kenBurns.panX,
            pan_y: cs.kenBurns.panY,
          },
          lines: cs.lines.map((ln) => ({
            id: ln.id,
            speaker: ln.speakerId,
            speaker_name: ln.speakerName,
            expression: ln.expression,
            voice_clip: ln.voiceUrl,
            text: ln.text,
          })),
        },
        this.passport.getChallengerName(),
        runPreMatchStory,
      );
      return;
    }

    runPreMatchStory();
  }

  private playDialogueSequence(
    chyronTitle: string,
    locationLabel: string,
    beats: CampaignDialogueBeat[],
    choicesAtEnd: CampaignChoiceOption[],
    onDone: () => void,
    leadsToMatch = false,
  ): void {
    this.dialogueLeadsToMatch = leadsToMatch;
    this.pendingDialogueQueue = [...beats];
    let availChoices = [...choicesAtEnd].filter((c) => c.available);
    // Safety fallback (#145): if choices were supplied (e.g. global_5 endings) and 0 were marked available, unlock first
    if (choicesAtEnd.length > 0 && availChoices.length === 0) {
      availChoices = [{ ...choicesAtEnd[0], available: true }];
    }
    this.pendingMissionChoices = availChoices;
    this.onDialogueQueueComplete = onDone;
    this.onDialogueSecondaryAction = null;

    if (this.pendingDialogueQueue.length === 0 && this.pendingMissionChoices.length === 0) {
      onDone();
      return;
    }

    if (this.pendingDialogueQueue.length === 0 && this.pendingMissionChoices.length > 0) {
      // Render choice directly over last context
      this.screen = 'STORY_DIALOGUE';
      this.activeDialogueVm = {
        chyronTitle,
        locationLabel,
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'The Apex Forum · Final Decree',
        expression: 'intense',
        text: 'The Master Ledger stands unlocked before two billion witnesses. Make your sovereign decree.',
        choices: this.pendingMissionChoices.map((c) => ({
          id: `MISSION_CHOICE:${c.id}`,
          label: c.label,
          subtext: c.subtext,
          consequenceTag: c.impactBadge,
        })),
      };
      this.hud.renderStoryDialogue(this.activeDialogueVm);
      return;
    }

    this.screen = 'STORY_DIALOGUE';
    this.stepDialogueQueue(chyronTitle, locationLabel);
  }

  private stepDialogueQueue(chyronTitle: string, locationLabel: string): void {
    const nextBeat = this.pendingDialogueQueue.shift();
    if (!nextBeat) {
      const done = this.onDialogueQueueComplete;
      this.onDialogueQueueComplete = null;
      done?.();
      return;
    }

    if (nextBeat.voiceUrl) {
      this.audio.playVoice(nextBeat.voiceUrl);
    } else {
      this.audio.stopVoice();
    }

    const isLastBeat = this.pendingDialogueQueue.length === 0;
    const choices =
      isLastBeat && this.pendingMissionChoices.length > 0
        ? this.pendingMissionChoices.map((c) => ({
            id: `MISSION_CHOICE:${c.id}`,
            label: c.label,
            subtext: c.subtext,
            consequenceTag: c.impactBadge,
          }))
        : undefined;

    this.activeDialogueVm = {
      chyronTitle,
      locationLabel,
      speakerId: nextBeat.speakerId,
      speakerName: nextBeat.speakerName,
      speakerRole: nextBeat.speakerRole,
      expression: nextBeat.expression,
      text: nextBeat.text,
      passiveInsightText: nextBeat.passiveDomainInsight?.unlocked
        ? nextBeat.passiveDomainInsight.insightText
        : undefined,
      tellText: nextBeat.tellHint,
      choices,
      continueLabel: isLastBeat
        ? this.dialogueLeadsToMatch
          ? 'PREPARE FOR QUESTIONS ▶'
          : 'CONTINUE ▶'
        : 'NEXT ▶',
    };
    this.hud.renderStoryDialogue(this.activeDialogueVm);
  }

  private handleAdvanceDialogue(): void {
    // Strictly block Space/Enter/Continue bypass when mandatory choices are on screen (#145 P0 #3)
    if (this.activeDialogueVm?.choices && this.activeDialogueVm.choices.length > 0) {
      return;
    }

    if (this.activeBackstageCtx) {
      const { conversation, currentNode } = this.activeBackstageCtx;
      const nextInChain =
        currentNode.nextNodeId && currentNode.nextNodeId !== 'END'
          ? conversation.nodes.find((n) => n.id === currentNode.nextNodeId)
          : undefined;
      if (nextInChain) {
        this.renderBackstageNode(nextInChain);
        return;
      }
      this.popNavigationReturnStack(false);
      return;
    }

    if (
      (this.matchCtx === null || this.matchCtx.kind === 'PROLOGUE') &&
      !this.activeMissionForChoice
    ) {
      const snap = this.prologue.getSnapshot();
      if (snap.phase === 'CHAMBER_OPENING') {
        const next = this.prologue.advanceFromCutscene();
        this.saveSlotManager.saveActiveSlot();
        this.presentPrologueStep(next);
        return;
      }
      if (snap.phase === 'PASSPORT_STAMP_PAYOFF') {
        const next = this.prologue.proceedToFlightFork();
        this.saveSlotManager.saveActiveSlot();
        this.presentPrologueStep(next);
        return;
      }
    }

    if (this.activeDialogueVm) {
      this.stepDialogueQueue(
        this.activeDialogueVm.chyronTitle,
        this.activeDialogueVm.locationLabel,
      );
    }
  }

  private handleDialogueChoice(rawChoiceId: string): void {
    if (rawChoiceId.startsWith('BACKSTAGE:') && this.activeBackstageCtx) {
      const optId = rawChoiceId.slice('BACKSTAGE:'.length);
      const { hubId, conversation, currentNode } = this.activeBackstageCtx;
      const res = this.wave2Narrative.selectBackstageOption(
        hubId,
        currentNode.id,
        optId,
        conversation.id,
      );
      this.metaSuite.recordSpecialFeat('BACKSTAGE_INTERROGATION');
      this.saveSlotManager.saveActiveSlot();
      if (!res) {
        this.popNavigationReturnStack(false);
        return;
      }
      if (res.nextNode) {
        // #199: Render target node directly (Wave2NarrativeDirector sets responseText = targetNode.text)
        this.renderBackstageNode(res.nextNode);
      } else if (!res.responseText?.trim()) {
        // Terminal backstage choice with no closing line: summarize logged impact cleanly or pop straight back!
        const chosenOpt = currentNode.options?.find((o) => o.id === optId) as
          | ((NonNullable<BackstageDialogueNode['options']>[number]) & {
              unlockPerk?: string;
              vaultClue?: string;
            })
          | undefined;
        const impacts: string[] = [];
        if (chosenOpt?.unlockEvidenceClue) impacts.push('Evidence Dossier clue decrypted');
        if (chosenOpt?.unlockPerk) impacts.push(`Perk unlocked (${chosenOpt.unlockPerk.replace(/_/g, ' ')})`);
        if (chosenOpt?.vaultClue) impacts.push('Vault Key fragment recorded');
        if (chosenOpt?.integrityDelta) {
          impacts.push(`${chosenOpt.integrityDelta > 0 ? '+' : ''}${chosenOpt.integrityDelta} Integrity`);
        }
        if (chosenOpt?.publicTrustDelta) {
          impacts.push(`${chosenOpt.publicTrustDelta > 0 ? '+' : ''}${chosenOpt.publicTrustDelta} Public Trust`);
        }
        if (chosenOpt?.councilFavorDelta) {
          impacts.push(`${chosenOpt.councilFavorDelta > 0 ? '+' : ''}${chosenOpt.councilFavorDelta} Council Favor`);
        }
        if (chosenOpt?.bondNpc && chosenOpt?.bondDelta) {
          impacts.push(`${chosenOpt.bondDelta > 0 ? '+' : ''}${chosenOpt.bondDelta} ${chosenOpt.bondNpc.toUpperCase()} Bond`);
        }
        if (impacts.length === 0) {
          this.popNavigationReturnStack(false);
          return;
        }
        // Clear nextNodeId so clicking CONTINUE pops straight back to the Hub
        this.audio.stopVoice();
        this.activeBackstageCtx.currentNode = { ...currentNode, nextNodeId: 'END', options: undefined };
        this.activeDialogueVm = {
          chyronTitle: `BACKSTAGE · ${conversation.title.toUpperCase()}`,
          locationLabel: conversation.locationLabel,
          speakerId: currentNode.speakerId,
          speakerName: currentNode.speakerName,
          speakerRole: 'Backstage Debrief',
          expression: 'neutral',
          text: `Exchange logged in your Meridian Dossier: ${impacts.join(' · ')}.`,
          continueLabel: 'RETURN TO CIRCUIT HUB ▶',
        };
        this.hud.renderStoryDialogue(this.activeDialogueVm);
      } else {
        if (res.responseVoiceUrl) {
          this.audio.playVoice(res.responseVoiceUrl);
        } else {
          this.audio.stopVoice();
        }
        this.activeBackstageCtx.currentNode = { ...currentNode, nextNodeId: 'END', options: undefined };
        this.activeDialogueVm = {
          chyronTitle: `BACKSTAGE · ${conversation.title.toUpperCase()}`,
          locationLabel: conversation.locationLabel,
          speakerId: currentNode.speakerId,
          speakerName: currentNode.speakerName,
          speakerRole: 'Backstage Interrogation',
          expression: 'smirk',
          text: res.responseText.trim(),
          continueLabel: 'RETURN TO CIRCUIT HUB ▶',
        };
        this.hud.renderStoryDialogue(this.activeDialogueVm);
      }
      return;
    }

    if (rawChoiceId.startsWith('MIRROR:')) {
      const id = rawChoiceId.slice('MIRROR:'.length) as
        | 'EXPLOIT_LEAK'
        | 'FLAG_BREACH'
        | 'SOLVE_CLEAN';
      const next = this.prologue.chooseMirrorLeakAction(id);
      this.saveSlotManager.saveActiveSlot();
      this.presentPrologueStep(next);
      return;
    }
    if (rawChoiceId.startsWith('MANIFESTO:')) {
      const id = rawChoiceId.slice('MANIFESTO:'.length) as
        | 'MANIFESTO_COUNCIL'
        | 'MANIFESTO_PUBLIC'
        | 'MANIFESTO_SELF';
      const next = this.prologue.chooseManifesto(id);
      this.saveSlotManager.saveActiveSlot();
      this.presentPrologueStep(next);
      return;
    }
    if (rawChoiceId.startsWith('FORK:')) {
      const dest = rawChoiceId.slice('FORK:'.length) as 'GB' | 'JP';
      this.handleFlightForkChoice(dest);
      return;
    }
    if (rawChoiceId.startsWith('MISSION_CHOICE:') && this.activeMissionForChoice) {
      const cid = rawChoiceId.slice('MISSION_CHOICE:'.length);
      const res = this.campaign.selectMissionChoice(this.activeMissionForChoice.id, cid);
      this.saveSlotManager.saveActiveSlot();
      if (res.overrideNextMissionId !== undefined) {
        this.pendingChoiceNextMissionOverride = res.overrideNextMissionId;
      }
      if (res.endingCommitted) {
        this.metaSuite.recordSpecialFeat('CAMPAIGN_COMPLETED');
        this.metaSuite.recordSpecialFeat('ENDING_UNLOCKED', {
          endingId: res.endingCommitted.id as EndingId,
        });
        this.saveSlotManager.saveActiveSlot();
        // Launch full Wave-2 EndingSequenceDirector (#140) with 7-City Chronicle & New Circuit+!
        this.pendingMissionChoices = [];
        this.onDialogueQueueComplete = null;
        this.pausePassive2DActors();
        void this.stage3d.showChampionshipTrophy(0);
        this.vfx.playGoldResonance(5, true);
        void this.getEndingDirector().then((endingDir) => {
          endingDir.play({
            ending: res.endingCommitted!,
            challengerName: this.passport.getChallengerName(),
            blackboard: this.blackboard,
            passport: this.passport,
            stage3d: this.stage3d,
            onStartNewCircuitPlus: (heatMutators) => {
              this.campaign.startNewCircuitPlus(heatMutators);
              this.saveSlotManager.saveActiveSlot();
              this.selectedCityHub = 'gb';
              this.enterHub('CAMPAIGN');
            },
            onReturnToHub: () => this.enterHub('CAMPAIGN'),
          });
        });
        return;
      }

      // Surface authored `response_line` aftermath beat before transitioning to combat/summary!
      if (res.responseLine?.trim()) {
        this.audio.stopVoice();
        this.pendingMissionChoices = [];
        this.pendingDialogueQueue = [];
        const prevVm = this.activeDialogueVm;
        this.activeDialogueVm = {
          chyronTitle:
            prevVm?.chyronTitle ||
            `${this.activeMissionForChoice.countryCode} · ${this.activeMissionForChoice.title.toUpperCase()}`,
          locationLabel: prevVm?.locationLabel || this.activeMissionForChoice.subtitle,
          speakerId: prevVm?.speakerId || 'vance',
          speakerName: prevVm?.speakerName || 'Julian Vance',
          speakerRole: prevVm?.speakerRole || 'Meridian Circuit',
          expression: 'intense',
          text: res.responseLine.trim(),
          continueLabel: this.dialogueLeadsToMatch ? 'PREPARE FOR QUESTIONS ▶' : 'CONTINUE ▶',
        };
        this.hud.renderStoryDialogue(this.activeDialogueVm);
        return;
      }

      const done = this.onDialogueQueueComplete;
      this.pendingMissionChoices = [];
      this.onDialogueQueueComplete = null;
      done?.();
    }
  }

  private async startCampaignPrismMatch(mission: CampaignMissionView): Promise<void> {
    const refreshed =
      this.campaign.getMissionView(mission.id, forgeEngine.pickNemesisCounterDomain()) ?? mission;
    const spec = refreshed.matchSpec;
    const rules = spec.compiledRules;
    const deferredEndingChoices = refreshed.choices.filter((c) => Boolean(c.endingId));

    const hubCode = spec.hubId as CampaignHubCode;
    const stageSpec = getCampaignStageSpec(hubCode);
    const failedAttempts = Math.max(
      refreshed.failedAttemptInfo?.attempts ?? 0,
      this.localFailedMissions.get(mission.id)?.attempts ?? 0,
    );
    const mercy = computeRetryMercyBoost(failedAttempts);

    // Mandate #1: ALWAYS route through `forgeEngine.queryCampaignRoundAsync` so strict
    // Stage 1 (MIDDLE_SCHOOL) -> Stage 8 (MENSA) difficulty gates & Scout's Advantage mercy apply!
    const questions = await forgeEngine.queryCampaignRoundAsync({
      hub: hubCode,
      roundIndex: spec.rhythmSlot - 1,
      count: spec.questionCount,
      isBossShowdown: spec.isBossShowdown,
      irtBRange: spec.irtBRange,
      lateralJammerMode: rules.peelLockedBothPlayers,
      nemesisCounterPick: rules.nemesisWeakestDomainActive,
      domains: spec.preferredDomains.length > 0 ? spec.preferredDomains : undefined,
      morphSequence: spec.isBossShowdown
        ? undefined
        : spec.morphSequence.length > 0
          ? spec.morphSequence
          : undefined,
      mercyTierShift: mercy.mercyTierShift,
      bonusTimerSec: mercy.bonusTimerSec,
    });

    const effectiveTier = resolveCampaignAcademicTier(
      hubCode,
      spec.rhythmSlot - 1,
      mercy.mercyTierShift,
    );
    const earlyHubFloorSec =
      hubCode === 'ch' ? 30 : hubCode === 'gb' ? 28 : hubCode === 'jp' ? 26 : 0;
    const tierTimerSec = getAcademicTierSpec(effectiveTier).timerSec;
    const targetTimerSec =
      Math.max(earlyHubFloorSec, tierTimerSec, stageSpec.timerSec, spec.timePerQuestionSec) +
      mercy.bonusTimerSec;
    for (const q of questions) {
      if (q.archetype !== 'GAUNTLET_SHATTER') {
        q.timerSec = Math.max(q.timerSec || 0, targetTimerSec);
      }
    }

    const rival = new RivalAI({
      actorId: spec.rivalId,
      hubId: hubCode,
      tempoStealActive:
        rules.activeMutators.includes('TEMPO_STEAL') || rules.nadiaSuspicionTempoSteal,
      tempoStealImmune: rules.tempoStealImmune,
      analogStaticJammed: rules.peelLockedBothPlayers,
      grudgeDomainActive: rules.nemesisWeakestDomainActive,
      grudgeDomainId: rules.nemesisTargetDomainId,
      bluffWagerDuels:
        rules.activeMutators.includes('BLUFF_WAGER') || rules.bluffOverclockDuels,
      isFinaleVsVance: spec.missionId === 'global_5',
    });

    // Mandate #1: Disable shield-depletion instant failure on early non-boss stages (ch / gb / jp)!
    const baseShields =
      typeof rules.startingShields === 'number'
        ? rules.startingShields
        : spec.isBossShowdown
          ? 3
          : undefined;
    const isEarlyNonBoss =
      !spec.isBossShowdown && (hubCode === 'ch' || hubCode === 'gb' || hubCode === 'jp');
    const initialShields = isEarlyNonBoss
      ? undefined
      : typeof baseShields === 'number'
        ? baseShields + mercy.bonusStartingShields
        : undefined;

    const scoring = new ScoringEngine();
    this.resetPerMatchAnalyticsCounters();
    this.activeMercyBoost = mercy.active ? mercy : null;
    this.matchCtx = {
      kind: 'CAMPAIGN',
      mission: refreshed,
      questions,
      index: 0,
      scoring,
      rival,
      mercy,
      shieldsRemaining: initialShields,
      suddenDeathBackfired: false,
      bluffBonusPoints: 0,
      freeCoopUsed: false,
      councilVetoUsed: false,
      choiceOverrideNextMission: this.pendingChoiceNextMissionOverride,
      deferredEndingChoices,
    };

    const q0 = questions[0];
    if (!q0) {
      this.enterHub('CAMPAIGN');
      return;
    }

    const stageNumber = stageSpec.index + 1;
    const tierDisplay = formatDifficultyPresetLabel(effectiveTier);
    const scoutsBadge = mercy.active ? `${mercy.badgeTitle}: ${mercy.badgeDetail}` : null;

    this.presentRoundReadyGate(
      {
        chyronTitle: `${spec.countryCode} · ${spec.title.toUpperCase()}`,
        chyronSub: `${tierDisplay.toUpperCase()} · ${questions.length} QUESTIONS`,
        roundTitle: refreshed.title,
        roundSubtitle: refreshed.subtitle,
        difficultyLabel: `${tierDisplay} · ${stageNumber <= 2 ? 'Welcoming' : `Stage ${stageNumber}`}`,
        difficultyTierKey: difficultyTierToBadgeKey(effectiveTier),
        questionCount: questions.length,
        timerPerQuestionSec: Math.round(q0.timerSec || targetTimerSec),
        scoutsAdvantageBadge: scoutsBadge,
        gambits: buildPickerGambitCards(),
        selectedGambitId: mindGambitStore.getEquippedGambitId(),
        startButtonLabel: '▶ START QUESTIONS',
      },
      async () => {
        // Play Phase I Boss Showdown Broadcast Stinger before Q0 on Boss missions!
        if (spec.isBossShowdown) {
          const cue = this.campaign.getRivalReaction(spec.rivalId, 'on_boss_intro');
          const bossBanner = await this.getBossBanner();
          await bossBanner.playIfPhaseTransition(
            {
              isBossShowdown: true,
              questionIndex: 0,
              totalQuestions: questions.length,
              archetype: q0.archetype,
              questions,
              bossPhases: spec.bossPhases,
            },
            {
              hubId: spec.hubId,
              countryCode: spec.countryCode,
              cityName: refreshed.title,
              missionTitle: refreshed.subtitle,
              heroRelicId: spec.heroRelicId,
              rivalId: spec.rivalId,
              voiceUrl: spec.hubId === 'global' ? undefined : cue.voiceUrl,
              stage3d: this.stage3d,
            },
          );
        }

        const rivalHud = rival.beginQuestion({
          qid: q0.qid,
          domainId: q0.l0Domain,
          irtB: q0.irtB,
          archetype: q0.archetype,
          timeTotalSec: q0.timerSec,
          hubId: hubCode,
          difficultyTier: q0.difficultyTier,
        });

        await this.beginQuestionOnStage(q0, {
          modeLabel: tierDisplay.toUpperCase(),
          chyronTitle: `${spec.countryCode} · ${spec.title.toUpperCase()}`,
          chyronSub: `${tierDisplay} · ${Math.round(q0.timerSec)}s`,
          questionIndex: 0,
          questionTotal: questions.length,
          playerScore: 0,
          streak: 0,
          shields: initialShields,
          rivalId: rivalHud.actorId,
          rivalName: rivalHud.shortName,
          rivalScore: rivalHud.score,
          rivalStatus: rivalHud.status,
          actorId: rivalHud.actorId,
          actorName: rivalHud.name,
          actorExpression: rivalHud.expression,
          tellLine: rivalHud.tellPillText,
          coachHint: spec.mutatorBrief || undefined,
          peelSealed: rules.peelLockedBothPlayers,
          autoRedactOneDecoy: rules.autoShatterDecoyOnQ1,
        });
      },
      true,
    );
  }

  // ==========================================================================
  // V3.0 PRE-ROUND READINESS GATE, MIND GAMBITS & FINALE CATEGORY PICKER
  // ==========================================================================

  private presentRoundReadyGate(
    vm: RoundReadyViewState,
    onStart: () => void | Promise<void>,
    enableMindGambits = true,
  ): void {
    this.stopTelemetryLoop();
    this.pausePassive2DActors();
    this.hud.closeVaultDrawer();
    this.hud.closeVisualLightbox();
    this.hud.closeRulesModal();

    this.screen = 'ROUND_READY';
    this.isStartingRoundQuestions = false;
    this.activeRoundReadyVm = vm;
    this.onRoundReadyStart = async () => {
      if (enableMindGambits) {
        this.activeGambitSession = createMatchGambitSession(
          mindGambitStore.getEquippedGambitId(),
          { grantFreeSecondWind: Boolean(this.activeMercyBoost?.grantFreeSecondWind) },
        );
      } else {
        this.activeGambitSession = null;
      }
      await onStart();
    };
    this.hud.renderRoundReady(vm);
  }

  private handleSelectRoundGambit(gambitId: string): void {
    if (!this.activeRoundReadyVm) return;
    if (mindGambitStore.setEquippedGambit(gambitId as MindGambitId)) {
      this.activeRoundReadyVm = {
        ...this.activeRoundReadyVm,
        gambits: buildPickerGambitCards(),
        selectedGambitId: mindGambitStore.getEquippedGambitId(),
      };
      this.hud.renderRoundReady(this.activeRoundReadyVm);
    }
  }

  private async handleStartRoundQuestions(): Promise<void> {
    if (this.screen !== 'ROUND_READY' || this.isStartingRoundQuestions || !this.onRoundReadyStart) {
      return;
    }
    this.isStartingRoundQuestions = true;
    const starter = this.onRoundReadyStart;
    this.onRoundReadyStart = null;
    this.activeRoundReadyVm = null;
    try {
      await starter();
    } finally {
      this.isStartingRoundQuestions = false;
    }
  }

  private presentFinaleCategoryPicker(
    vm: FinaleCategoryPickerViewState,
    onSelect: (domainId: number) => void | Promise<void>,
  ): void {
    this.stopTelemetryLoop();
    this.pausePassive2DActors();
    this.screen = 'FINALE_PICKER';
    this.isSelectingFinaleCategory = false;
    this.activeFinalePickerVm = vm;
    this.onFinaleCategorySelected = onSelect;
    this.hud.renderFinaleCategoryPicker(vm);
  }

  private async handleSelectFinaleCategory(domainId: number): Promise<void> {
    if (
      this.screen !== 'FINALE_PICKER' ||
      this.isSelectingFinaleCategory ||
      !this.onFinaleCategorySelected
    ) {
      return;
    }
    this.isSelectingFinaleCategory = true;
    const picker = this.onFinaleCategorySelected;
    this.onFinaleCategorySelected = null;
    this.activeFinalePickerVm = null;
    try {
      await picker(domainId);
    } finally {
      this.isSelectingFinaleCategory = false;
    }
  }

  private getActiveMatchQuestions(): PrismQuestion[] | undefined {
    const ctx = this.matchCtx;
    if (!ctx) return undefined;
    if (
      ctx.kind === 'CAMPAIGN' ||
      ctx.kind === 'BRIEFING' ||
      ctx.kind === 'DUEL' ||
      ctx.kind === 'SHOWCASE' ||
      ctx.kind === 'SRS_REVIEW'
    ) {
      return ctx.questions;
    }
    return undefined;
  }

  private canCurrentMatchSwapTopic(): boolean {
    const ctx = this.matchCtx;
    if (!ctx) return false;
    return (
      ctx.kind === 'CAMPAIGN' ||
      ctx.kind === 'BRIEFING' ||
      ctx.kind === 'ENDLESS' ||
      ctx.kind === 'TRIALS' ||
      ctx.kind === 'DAILY' ||
      ctx.kind === 'SHOWCASE'
    );
  }

  private buildActiveGambitHudState(isFinalQuestion: boolean): ActiveGambitHudState | null {
    const mercyLabel = this.activeMercyBoost?.active ? this.activeMercyBoost.badgeTitle : null;
    if (!this.activeGambitSession) {
      if (!mercyLabel) return null;
      return {
        id: 'SCOUTS_ADVANTAGE',
        title: "Scout's Advantage",
        statusText: this.activeMercyBoost!.badgeDetail,
        scoutsAdvantageLabel: mercyLabel,
      };
    }
    const pill = this.activeGambitSession.getHudPillState(isFinalQuestion);
    return {
      id: pill.gambitId,
      title: pill.name,
      statusText: pill.detailText,
      canUseSwapTopic: pill.canSwapTopic && this.canCurrentMatchSwapTopic(),
      swapTopicUsed: this.activeGambitSession.equippedId === 'TOPIC_REROLL' && !pill.canSwapTopic,
      secondWindReady: pill.secondWindReady,
      bluffRadarLabel: pill.bluffRadarActive ? this.liveBluffRadarLabel : null,
      comboBonusLabel: pill.comboBonusLabel,
      scoutsAdvantageLabel: mercyLabel,
    };
  }

  private async launchPracticeSliceBriefing(slice: PracticeSliceRequest): Promise<void> {
    const hasDomain =
      typeof slice.domainId === 'number' && slice.domainId >= 0 && slice.domainId <= 11;
    const domains: DomainId[] | 'GLOBAL_MIX' = hasDomain
      ? [Math.trunc(slice.domainId!) as DomainId]
      : 'GLOBAL_MIX';
    const domainMeta = hasDomain ? FORGE_DOMAINS[Math.trunc(slice.domainId!)] : null;
    const topicDisplayLabel =
      slice.subcatLabel && slice.subcatLabel.trim().length > 0
        ? slice.subcatLabel.trim()
        : domainMeta
          ? `${domainMeta.name} Practice`
          : slice.outcome === 'WRONG'
            ? 'Missed Questions Practice'
            : slice.outcome === 'DOUBLE_DOWN'
              ? 'Double-Down Practice'
              : 'Targeted Stats Practice';

    const safeArchetype: Archetype3D | 'ALL_MORPHS' | undefined =
      slice.archetype && slice.archetype !== 'HERO_ARTIFACT_SYNTHESIS'
        ? (slice.archetype as Archetype3D)
        : undefined;

    await this.launchBriefingRun({
      domains,
      difficulty: 'ADAPTIVE',
      length: 5,
      topicDisplayLabel,
      archetypeFilter: safeArchetype,
    });
  }

  // ==========================================================================
  // DAILY, BRIEFING ROOM, ARCHIVE DESCENT & GHOST TRIALS LAUNCHERS
  // ==========================================================================

  private resetPerMatchAnalyticsCounters(): void {
    this.matchPeelsUsed = 0;
    this.matchMax6xWins = 0;
    this.matchShieldsLost = 0;
    this.matchSorenBluffCaught = false;
    this.matchFirstClueSnipes = 0;
    this.matchBluffsCaught = 0;
    this.matchSecondWindTriggered = false;
    this.matchFinaleCategoryWon = false;
    this.matchExtraBonusPoints = 0;
    this.activeClueLadder = null;
    this.activeMercyBoost = null;
    this.liveBluffRadarLabel = null;
    this.currentMatchRecordedQids = [];
    this.currentMatchRecordedSplits = [];
  }

  private launchDailyBroadcast(): void {
    this.stopTelemetryLoop();
    this.resetPerMatchAnalyticsCounters();
    const { packet, firstQuestion, hostGreeting } = this.dailyMode.startBroadcast();
    if (!firstQuestion) return;

    this.matchCtx = {
      kind: 'DAILY',
      total: packet.questions.length,
      index: 0,
      utcDate: packet.utcDate,
    };
    void this.setStageVenueWithAmbience('global');
    this.stage3d.setLightingMode('BROADCAST');

    this.presentRoundReadyGate(
      {
        chyronTitle: `GLOBAL FEED #${packet.broadcastNumber}`,
        chyronSub: `${packet.utcDate} · ${packet.questions.length} QUESTIONS`,
        roundTitle: `Daily Global Feed #${packet.broadcastNumber}`,
        roundSubtitle: 'Same 10 questions for every challenger worldwide today.',
        difficultyLabel: 'Daily Mix · Progressive',
        difficultyTierKey: 'college',
        questionCount: packet.questions.length,
        timerPerQuestionSec: Math.round(firstQuestion.timerSec || 22),
        gambits: buildPickerGambitCards(),
        selectedGambitId: mindGambitStore.getEquippedGambitId(),
        startButtonLabel: '▶ START QUESTIONS',
      },
      () => {
        this.playGameplayVoiceOnce('vance_intro_2');
        void this.beginQuestionOnStage(firstQuestion, {
          modeLabel: `FEED #${packet.broadcastNumber}`,
          chyronTitle: `GLOBAL FEED #${packet.broadcastNumber}`,
          chyronSub: packet.utcDate,
          questionIndex: 0,
          questionTotal: packet.questions.length,
          playerScore: 0,
          streak: 0,
          rivalId: 'vance',
          rivalName: 'Vance',
          rivalScore: 0,
          rivalStatus: 'HIDDEN',
          actorId: 'vance',
          actorName: 'Julian Vance',
          actorExpression: 'neutral',
          tellLine: hostGreeting,
        });
      },
      true,
    );
  }

  private async openBriefingPickerModal(opts?: {
    initialL0DomainId?: number;
    initialL1SubcategoryId?: string;
    initialL2TopicId?: string;
    initialSearchQuery?: string;
  }): Promise<void> {
    this.pushNavigationReturnSnapshot('MODAL');
    this.stopAnyActiveOverclockAudio();
    this.metaSuite.closeAll(false);
    this.dossierModal?.close();
    this.saveSlotsModal?.close();
    document.documentElement.classList.remove('ws-3d-showcase-open');

    const modal = await this.getBriefingModal();
    const counts = forgeEngine.getDomainCounts();
    modal.open(
      counts,
      (spec) => {
        this.navigationReturnStack = this.navigationReturnStack.filter(
          (s) => s.kind !== 'MODAL',
        );
        void this.launchBriefingRun({
          domains: spec.domains.length === 0 ? 'GLOBAL_MIX' : spec.domains,
          difficulty: spec.difficulty,
          length: spec.count,
          l1SubcategoryId: spec.l1SubcategoryId,
          l2TopicId: spec.l2TopicId,
          topicDisplayLabel: spec.selectionLabel,
        });
      },
      () => {
        this.navigationReturnStack = this.navigationReturnStack.filter(
          (s) => s.kind !== 'MODAL',
        );
        void this.restore3DAfterModal();
      },
      {
        initialL0DomainId:
          typeof opts?.initialL0DomainId === 'number'
            ? (opts.initialL0DomainId as DomainId)
            : null,
        initialL1SubcategoryId: opts?.initialL1SubcategoryId ?? null,
        initialL2TopicId: opts?.initialL2TopicId ?? null,
        initialSearchQuery: opts?.initialSearchQuery,
        forgeInstance: forgeEngine,
      },
    );
  }

  private async launchBriefingRun(cfg: {
    domains: DomainId[] | 'GLOBAL_MIX';
    difficulty: BriefingDifficultyPreset;
    length: BriefingRunLength;
    l1SubcategoryId?: string;
    l2TopicId?: string;
    topicDisplayLabel?: string;
    archetypeFilter?: Archetype3D | 'ALL_MORPHS';
  }): Promise<void> {
    this.stopTelemetryLoop();
    this.resetPerMatchAnalyticsCounters();
    const { questions, firstQuestion, nadiaGreeting } =
      await this.briefingMode.startBriefingRun(cfg);
    if (!firstQuestion) return;

    const diffLabel = formatDifficultyPresetLabel(cfg.difficulty);
    const subLabel = cfg.topicDisplayLabel
      ? `${cfg.topicDisplayLabel} · ${diffLabel}`
      : diffLabel;
    const singleDomainId =
      Array.isArray(cfg.domains) && cfg.domains.length === 1 ? cfg.domains[0] : -1;

    this.matchCtx = {
      kind: 'BRIEFING',
      questions,
      total: questions.length,
      index: 0,
      domainsLabel: subLabel,
      difficultyPreset: cfg.difficulty,
      domainId: singleDomainId,
      l1Id: cfg.l1SubcategoryId,
      l2Id: cfg.l2TopicId,
      topicLabel: cfg.topicDisplayLabel,
    };
    await this.setStageVenueWithAmbience('studio');
    this.stage3d.setLightingMode('BROADCAST');

    this.presentRoundReadyGate(
      {
        chyronTitle: 'THE BRIEFING ROOM',
        chyronSub: subLabel,
        roundTitle: cfg.topicDisplayLabel || 'Briefing Room Practice',
        roundSubtitle: `${questions.length}-question custom focus set · ${diffLabel}`,
        difficultyLabel: diffLabel,
        difficultyTierKey: difficultyTierToBadgeKey(cfg.difficulty),
        questionCount: questions.length,
        timerPerQuestionSec: Math.round(firstQuestion.timerSec || 24),
        gambits: buildPickerGambitCards(),
        selectedGambitId: mindGambitStore.getEquippedGambitId(),
        startButtonLabel: '▶ START QUESTIONS',
      },
      async () => {
        await this.beginQuestionOnStage(firstQuestion, {
          modeLabel: `BRIEFING · ${diffLabel.toUpperCase()}`,
          chyronTitle: 'THE BRIEFING ROOM',
          chyronSub: subLabel,
          questionIndex: 0,
          questionTotal: questions.length,
          playerScore: 0,
          streak: 0,
          rivalId: 'nadia',
          rivalName: 'Nadia',
          rivalScore: 0,
          rivalStatus: 'HIDDEN',
          actorId: 'nadia',
          actorName: 'Nadia Al-Mansoor',
          actorExpression: 'neutral',
          tellLine: nadiaGreeting,
        });
      },
      true,
    );
  }

  // ==========================================================================
  // V2.0 LAUNCHERS: INSTANT 1-TAP TRIAL PRISM · ?duel= HEAD-TO-HEAD ·
  // GLOBE/VISUAL SHOWCASE · LIVE SPACED-REPETITION 3D REVIEW
  // ==========================================================================

  private launchInstantTrialPrism(): void {
    this.stopTelemetryLoop();
    this.resetPerMatchAnalyticsCounters();
    this.activeGambitSession = null;
    this.activeBackstageCtx = null;

    // Upgrade #4: Synchronous < 100ms cold-open 1-Prism launch (zero cutscenes, zero name gate!)
    const q = forgeEngine.getInstantTrialPrism(this.recentInstantTrialQids);
    this.recentInstantTrialQids.push(q.qid);
    if (this.recentInstantTrialQids.length > 10) {
      this.recentInstantTrialQids.shift();
    }

    const scoring = new ScoringEngine();
    this.matchCtx = { kind: 'INSTANT_TRIAL', question: q, scoring };
    this.stage3d.setLightingMode('BROADCAST');

    void this.beginQuestionOnStage(q, {
      modeLabel: 'QUICK 1-Q',
      chyronTitle: 'THE MERIDIAN · QUICK QUESTION',
      chyronSub: '1-TAP SHOWCASE',
      questionIndex: 0,
      questionTotal: 1,
      playerScore: 0,
      streak: 0,
      rivalId: 'vance',
      rivalName: 'Vance',
      rivalScore: 0,
      rivalStatus: 'HIDDEN',
      actorId: 'vance',
      actorName: 'Julian Vance',
      actorExpression: 'neutral',
      tellLine: 'Pick A–D, tap Hint if stuck, or toggle 2× Double Down before locking!',
      isInstantTrialPrism: true,
    });
  }

  private handleInstantPrismAction(dest: 'CAMPAIGN' | 'BASEBALL' | 'DAILY' | 'ANOTHER'): void {
    this.audio.stopVoice();
    if (dest === 'CAMPAIGN') {
      this.handleContinueWhereLeftOff();
      return;
    }
    if (dest === 'BASEBALL') {
      void this.launchBriefingRun({
        domains: [5],
        difficulty: 'ADAPTIVE',
        length: 10,
        l1SubcategoryId: 'sports',
        l2TopicId: 'sports_baseball',
        topicDisplayLabel: 'Sports › Baseball',
      });
      return;
    }
    if (dest === 'DAILY') {
      this.launchDailyBroadcast();
      return;
    }
    this.launchInstantTrialPrism();
  }

  private async acceptIncomingDuel(payload: DuelChallengePayload): Promise<void> {
    this.stopTelemetryLoop();
    this.resetPerMatchAnalyticsCounters();
    this.pendingIncomingDuel = null;
    this.activeBackstageCtx = null;

    // Strip `?duel=` cleanly from browser URL without reloading page
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      try {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('duel');
        window.history.replaceState(window.history.state, '', cleanUrl.href);
      } catch {
        // Ignore sandboxed history errors
      }
    }

    if (!forgeEngine.isReady()) {
      await forgeEngine.init('./data');
    }

    let questions = await forgeEngine.queryExactQuestionsByIds(payload.qids, {
      facetCount: 4,
      seed: payload.utcDateCode || 2026,
    });
    if (questions.length === 0) {
      questions = forgeEngine.queryQuestions({
        count: Math.max(1, Math.min(10, payload.qids.length || 5)),
        mode: 'BRIEFING',
      });
    }
    const q0 = questions[0];
    if (!q0) {
      this.enterHub('TRIALS');
      return;
    }

    const tracker = new DuelRaceTracker(payload, this.passport.getChallengerName());
    const scoring = new ScoringEngine();
    this.matchCtx = {
      kind: 'DUEL',
      payload,
      tracker,
      questions,
      index: 0,
      scoring,
    };

    this.metaSuite.recordSpecialFeat('DUEL_CHALLENGE_PLAYED');
    await this.setStageVenueWithAmbience('sg');
    this.stage3d.setLightingMode('BROADCAST');

    this.presentRoundReadyGate(
      {
        chyronTitle: `1v1 DUEL VS ${payload.challengerName.toUpperCase()}`,
        chyronSub: payload.topicLabel || `${questions.length} QUESTIONS`,
        roundTitle: `Head-to-Head vs ${payload.challengerName}`,
        roundSubtitle: `Target to beat: ${payload.totalScore.toLocaleString('en-US')} PTS across ${questions.length} matched questions.`,
        difficultyLabel: '1v1 Ghost Duel',
        difficultyTierKey: 'college',
        questionCount: questions.length,
        timerPerQuestionSec: Math.round(q0.timerSec || 22),
        gambits: buildPickerGambitCards(),
        selectedGambitId: mindGambitStore.getEquippedGambitId(),
        startButtonLabel: '▶ START DUEL',
      },
      async () => {
        await this.beginQuestionOnStage(q0, {
          modeLabel: `1v1 DUEL · ${payload.topicLabel || payload.mode}`,
          chyronTitle: `1v1 DUEL VS ${payload.challengerName.toUpperCase()}`,
          chyronSub: payload.topicLabel || `${questions.length} PRISMS`,
          questionIndex: 0,
          questionTotal: questions.length,
          playerScore: 0,
          streak: 0,
          rivalId: 'soren',
          rivalName: payload.challengerName,
          rivalScore: 0,
          rivalStatus: 'THINKING',
          actorId: 'soren',
          actorName: payload.challengerName,
          actorExpression: 'intense',
          tellLine: `Beat ${payload.challengerName}'s ${payload.totalScore.toLocaleString('en-US')} PTS across ${questions.length} exact questions!`,
          duelLiveSplit: {
            challengerName: payload.challengerName,
            playerScore: 0,
            challengerScore: 0,
            deltaPts: 0,
            leader: 'TIED',
          },
        });
      },
      true,
    );
  }

  private async launchVisualOrGlobeShowcase(
    kind: 'GLOBE_PIN_DROP' | 'VISUAL_BLUEPRINT',
  ): Promise<void> {
    this.stopTelemetryLoop();
    this.resetPerMatchAnalyticsCounters();
    this.activeBackstageCtx = null;

    if (!forgeEngine.isReady()) {
      await forgeEngine.init('./data');
    }

    const questions = forgeEngine.queryVisualOrGlobeShowcase({ count: 5, kind });
    const q0 = questions[0];
    if (!q0) {
      await this.launchBriefingRun({
        domains: 'GLOBAL_MIX',
        difficulty: 'ADAPTIVE',
        length: 5,
      });
      return;
    }

    const scoring = new ScoringEngine();
    this.matchCtx = {
      kind: 'SHOWCASE',
      showcaseKind: kind,
      questions,
      index: 0,
      scoring,
    };

    await this.setStageVenueWithAmbience(kind === 'GLOBE_PIN_DROP' ? 'global' : 'studio');
    this.stage3d.setLightingMode('BROADCAST');

    this.presentRoundReadyGate(
      {
        chyronTitle: kind === 'GLOBE_PIN_DROP' ? 'MERIDIAN 3D GLOBE ATLAS' : 'SAPPHIRE BLUEPRINT LENS',
        chyronSub: `${questions.length}-QUESTION SHOWCASE`,
        roundTitle: kind === 'GLOBE_PIN_DROP' ? '3D Globe Pin-Drop Atlas' : 'Visual Blueprint Lens',
        roundSubtitle:
          kind === 'GLOBE_PIN_DROP'
            ? 'Drop your pinpoint on the 3D Earth or pick a Quick Region button!'
            : 'Study crisp diagram plates and lock your answer!',
        difficultyLabel: 'Showcase · Adaptive',
        difficultyTierKey: 'high-school',
        questionCount: questions.length,
        timerPerQuestionSec: Math.round(q0.timerSec || 25),
        gambits: buildPickerGambitCards(),
        selectedGambitId: mindGambitStore.getEquippedGambitId(),
        startButtonLabel: '▶ START QUESTIONS',
      },
      async () => {
        await this.beginQuestionOnStage(q0, {
          modeLabel: kind === 'GLOBE_PIN_DROP' ? '3D GLOBE PIN-DROP' : 'VISUAL BLUEPRINTS',
          chyronTitle: kind === 'GLOBE_PIN_DROP' ? 'MERIDIAN 3D GLOBE ATLAS' : 'SAPPHIRE BLUEPRINT LENS',
          chyronSub: `${questions.length}-PRISM SHOWCASE`,
          questionIndex: 0,
          questionTotal: questions.length,
          playerScore: 0,
          streak: 0,
          rivalId: 'nadia',
          rivalName: 'Nadia',
          rivalScore: 0,
          rivalStatus: 'HIDDEN',
          actorId: 'nadia',
          actorName: 'Nadia Al-Mansoor',
          actorExpression: 'neutral',
          tellLine:
            kind === 'GLOBE_PIN_DROP'
              ? 'Tap the 3D Meridian Globe (or a Quick Region pill) to drop your pinpoint!'
              : 'Inspect the Sapphire Blueprint Lens plate — tap it to enlarge full-screen!',
        });
      },
      true,
    );
  }

  private async launchSpacedRepetitionReview(cards: readonly SrsReviewCard[]): Promise<void> {
    if (!cards || cards.length === 0) return;
    this.stopTelemetryLoop();
    this.resetPerMatchAnalyticsCounters();
    this.activeBackstageCtx = null;

    if (!forgeEngine.isReady()) {
      await forgeEngine.init('./data');
    }

    const targetCards = cards.slice(0, 10);
    const qids = targetCards.map((c) => c.qid);
    let questions = await forgeEngine.queryExactQuestionsByIds(qids, { facetCount: 4 });
    if (questions.length === 0) {
      questions = forgeEngine.queryQuestions({
        count: Math.min(5, targetCards.length),
        mode: 'BRIEFING',
      });
    }
    const q0 = questions[0];
    if (!q0) return;

    const scoring = new ScoringEngine();
    this.matchCtx = {
      kind: 'SRS_REVIEW',
      cards: [...targetCards],
      questions,
      index: 0,
      scoring,
    };

    await this.setStageVenueWithAmbience('studio');
    this.stage3d.setLightingMode('BROADCAST');

    this.presentRoundReadyGate(
      {
        chyronTitle: 'SPACED-REPETITION REVIEW',
        chyronSub: `${questions.length} DUE CARDS`,
        roundTitle: 'Leitner Mastery Deck Review',
        roundSubtitle: 'Correct recalls promote missed cards up the 5-Box Mastery schedule.',
        difficultyLabel: 'Personal Review',
        difficultyTierKey: 'middle-school',
        questionCount: questions.length,
        timerPerQuestionSec: Math.round(q0.timerSec || 26),
        gambits: buildPickerGambitCards(),
        selectedGambitId: mindGambitStore.getEquippedGambitId(),
        startButtonLabel: '▶ START REVIEW',
      },
      async () => {
        await this.beginQuestionOnStage(q0, {
          modeLabel: 'LEITNER MASTERY DECK',
          chyronTitle: 'SPACED-REPETITION REVIEW',
          chyronSub: `${questions.length} DUE CARDS`,
          questionIndex: 0,
          questionTotal: questions.length,
          playerScore: 0,
          streak: 0,
          rivalId: 'nadia',
          rivalName: 'Nadia',
          rivalScore: 0,
          rivalStatus: 'HIDDEN',
          actorId: 'nadia',
          actorName: 'Nadia Al-Mansoor',
          actorExpression: 'neutral',
          tellLine: 'Correct recalls promote cards up the 5-Box Leitner mastery schedule!',
        });
      },
      true,
    );
  }

  private async launchEndlessDescent(resume: boolean): Promise<void> {
    this.stopTelemetryLoop();
    if (!resume) {
      this.resetPerMatchAnalyticsCounters();
      this.endlessRunCorrectCount = 0;
      this.endlessRunStreak = 0;
      this.endlessRunMaxStreak = 0;
    }
    const { question, hud } = await this.endlessMode.startDescent(resume);
    if (!question) return;

    this.matchCtx = { kind: 'ENDLESS' };
    await this.setStageVenueWithAmbience('ledger');
    this.stage3d.setLightingMode('BROADCAST');

    this.presentRoundReadyGate(
      {
        chyronTitle: `ARCHIVE DESCENT · DEPTH ${hud.depth}`,
        chyronSub: `${hud.strataTitle} (${hud.strataMultiplier}x)`,
        roundTitle: resume ? `Resume Depth ${hud.depth}` : 'Archive Descent · Endless Run',
        roundSubtitle: `${hud.shields} Shields active · Safe Airlock & Score Bank every 5 questions.`,
        difficultyLabel: `${hud.strataTitle} · ${hud.strataMultiplier}x`,
        difficultyTierKey: hud.depth >= 16 ? 'graduate' : hud.depth >= 6 ? 'college' : 'high-school',
        questionCount: 5,
        timerPerQuestionSec: Math.round(question.timerSec || 22),
        gambits: buildPickerGambitCards(),
        selectedGambitId: mindGambitStore.getEquippedGambitId(),
        startButtonLabel: '▶ START DESCENT',
      },
      async () => {
        await this.beginQuestionOnStage(question, {
          modeLabel: `${hud.strataTitle} (${hud.strataMultiplier}x)`,
          chyronTitle: `ARCHIVE DESCENT · DEPTH ${hud.depth}`,
          chyronSub: hud.strataTitle,
          questionIndex: (hud.depth - 1) % 5,
          questionTotal: 5,
          playerScore: hud.totalLiveScore + this.matchExtraBonusPoints,
          streak: hud.overclockRepairStreak,
          shields: hud.shields,
          rivalId: 'tariq',
          rivalName: 'Tariq',
          rivalScore: 0,
          rivalStatus: 'HIDDEN',
          actorId: 'tariq',
          actorName: 'Archive Core Telemetry',
          actorExpression: 'neutral',
          tellLine: '3-Streak Double Down repairs +1 Shield · Safe Airlock every 5 questions.',
        });
      },
      true,
    );
  }

  private async continueEndlessFromAirlock(): Promise<void> {
    const { question, hud } = await this.endlessMode.descendFromAirlock();
    if (!question) {
      this.enterHub('ENDLESS');
      return;
    }
    this.matchCtx = { kind: 'ENDLESS' };
    await this.beginQuestionOnStage(question, {
      modeLabel: `${hud.strataTitle} (${hud.strataMultiplier}x)`,
      chyronTitle: `ARCHIVE DESCENT · DEPTH ${hud.depth}`,
      chyronSub: hud.strataTitle,
      questionIndex: (hud.depth - 1) % 5,
      questionTotal: 5,
      playerScore: hud.totalLiveScore + this.matchExtraBonusPoints,
      streak: hud.overclockRepairStreak,
      shields: hud.shields,
      rivalId: 'tariq',
      rivalName: 'Tariq',
      rivalScore: 0,
      rivalStatus: 'HIDDEN',
      actorId: 'tariq',
      actorName: 'Archive Core Telemetry',
      actorExpression: 'intense',
      tellLine: `Descending into ${hud.strataTitle} (${hud.strataMultiplier}x Multiplier)!`,
    });
  }

  private handleSummaryPrimaryContinue(): void {
    // #145 P0 #2: Bank 100% of floor haul & best depth when extracting at an Endless Airlock!
    if (
      this.activeSummaryVm?.mode === 'ENDLESS' &&
      typeof this.activeSummaryVm.endlessCanContinueFloor === 'number'
    ) {
      const extracted = this.endlessMode.extractAtAirlock();
      mindGambitStore.recordMatchProgress({
        won: extracted.extractedCleanly,
        maxStreak: extracted.maxStreak,
        firstClueSnipes: this.matchFirstClueSnipes,
        gambitTriggered: Boolean(this.activeGambitSession?.hasTriggeredAnyEffect()),
      });
      this.notifyMetaMatchCompleted({
        mode: 'ENDLESS',
        won: extracted.extractedCleanly,
        correctCount: extracted.correctCount,
        totalQuestions: Math.max(1, extracted.depthCleared),
        score: extracted.finalBankedScore + this.matchExtraBonusPoints,
        shieldsLost: this.matchShieldsLost,
        peelsUsed: this.matchPeelsUsed,
        max6xOverclockWinsInMatch: this.matchMax6xWins,
        endlessDepthReached: extracted.depthCleared,
      });
    }
    const targetMode = this.activeSummaryVm?.mode ?? 'CAMPAIGN';
    this.activeSummaryVm = null;
    this.enterHub(targetMode);
  }

  private async launchGhostOrSalon(blackSalon: boolean, contenderId?: string): Promise<void> {
    this.stopTelemetryLoop();
    this.resetPerMatchAnalyticsCounters();
    if (blackSalon) {
      const { salonSpec, questions, firstQuestion } =
        await this.trialsMode.startBlackSalonRound();
      if (!firstQuestion) return;
      this.matchCtx = {
        kind: 'TRIALS',
        isBlackSalon: true,
        opponentHandle: salonSpec.opponent.handle,
        total: questions.length,
        index: 0,
      };
      await this.setStageVenueWithAmbience('is');
      this.stage3d.setLightingMode('TWIST_FRACTURE');

      this.presentRoundReadyGate(
        {
          chyronTitle: `BLACK SALON · ${salonSpec.roundTitle.toUpperCase()}`,
          chyronSub: salonSpec.mutatorLabel,
          roundTitle: `Black Salon · ${salonSpec.roundTitle}`,
          roundSubtitle: `High-stakes match vs ${salonSpec.opponent.handle} · ${salonSpec.mutatorLabel}`,
          difficultyLabel: 'Black Salon · Graduate',
          difficultyTierKey: 'graduate',
          questionCount: questions.length,
          timerPerQuestionSec: Math.round(firstQuestion.timerSec || 18),
          gambits: buildPickerGambitCards(),
          selectedGambitId: mindGambitStore.getEquippedGambitId(),
          startButtonLabel: '▶ START BLACK SALON',
        },
        async () => {
          await this.beginQuestionOnStage(firstQuestion, {
            modeLabel: 'BLACK SALON',
            chyronTitle: `BLACK SALON · ${salonSpec.roundTitle.toUpperCase()}`,
            chyronSub: salonSpec.mutatorLabel,
            questionIndex: 0,
            questionTotal: questions.length,
            playerScore: 0,
            streak: 0,
            rivalId: salonSpec.opponent.portraitActorId,
            rivalName: salonSpec.opponent.handle,
            rivalScore: 0,
            rivalStatus: 'THINKING',
            actorId: salonSpec.opponent.portraitActorId,
            actorName: salonSpec.opponent.handle,
            actorExpression: 'intense',
            tellLine: salonSpec.mutatorLabel,
            peelSealed: salonSpec.peelLocked,
          });
        },
        true,
      );
      return;
    }

    const overview = this.trialsMode.getHubOverview();
    const chosenId =
      contenderId ?? overview.contenders[overview.wins % overview.contenders.length]?.id;
    const pick =
      overview.contenders.find((c) => c.id === chosenId) ?? overview.contenders[0];
    const { questions, firstQuestion, opponentHandle } =
      await this.trialsMode.startGhostDuel(pick.id);
    if (!firstQuestion) return;

    this.matchCtx = {
      kind: 'TRIALS',
      isBlackSalon: false,
      opponentHandle,
      total: questions.length,
      index: 0,
    };
    await this.setStageVenueWithAmbience('sg');
    this.stage3d.setLightingMode('BROADCAST');

    this.presentRoundReadyGate(
      {
        chyronTitle: 'WORLD COUNCIL TRIALS · 3D GHOST DUEL',
        chyronSub: `VS ${opponentHandle.toUpperCase()}`,
        roundTitle: `Ghost Duel vs ${opponentHandle}`,
        roundSubtitle: `${pick.styleTag} · ${questions.length} competitive questions.`,
        difficultyLabel: 'Council Trials · College',
        difficultyTierKey: 'college',
        questionCount: questions.length,
        timerPerQuestionSec: Math.round(firstQuestion.timerSec || 20),
        gambits: buildPickerGambitCards(),
        selectedGambitId: mindGambitStore.getEquippedGambitId(),
        startButtonLabel: '▶ START TRIAL',
      },
      async () => {
        await this.beginQuestionOnStage(firstQuestion, {
          modeLabel: 'GHOST DUEL',
          chyronTitle: 'WORLD COUNCIL TRIALS · 3D GHOST DUEL',
          chyronSub: `VS ${opponentHandle.toUpperCase()}`,
          questionIndex: 0,
          questionTotal: questions.length,
          playerScore: 0,
          streak: 0,
          rivalId: pick.portraitActorId,
          rivalName: opponentHandle,
          rivalScore: 0,
          rivalStatus: 'THINKING',
          actorId: pick.portraitActorId,
          actorName: opponentHandle,
          actorExpression: 'neutral',
          tellLine: `3D Kinetic Ghost Replay active — ${pick.styleTag}`,
        });
      },
      true,
    );
  }

  // ==========================================================================
  // UNIFIED LIVE 3D PRISM QUESTION ENGINE
  // ==========================================================================

  private async beginQuestionOnStage(
    q: PrismQuestion,
    opts: {
      modeLabel: string;
      chyronTitle: string;
      chyronSub: string;
      questionIndex: number;
      questionTotal: number;
      playerScore: number;
      streak: number;
      shields?: number;
      rivalId: string;
      rivalName: string;
      rivalScore: number;
      rivalStatus: 'HIDDEN' | 'THINKING' | 'PEELING' | 'OVERCLOCKING' | 'LOCKED';
      actorId: string;
      actorName: string;
      actorExpression: string;
      tellLine: string;
      coachHint?: string;
      initialPeelTier?: PeelTier;
      peelSealed?: boolean;
      autoRedactOneDecoy?: boolean;
      isInstantTrialPrism?: boolean;
      isFinaleQuestion?: boolean;
      duelLiveSplit?: GameplayQuestionViewState['duelLiveSplit'];
    },
  ): Promise<void> {
    this.screen = 'GAMEPLAY';
    this.hud.closeVaultDrawer();
    this.hud.closeVisualLightbox();
    this.hud.closeRulesModal();
    this.spinUsedThisQ = false;

    const ctxSnap = this.matchCtx;
    const isCampaign = ctxSnap?.kind === 'CAMPAIGN';
    const hasHorizonLens = isCampaign && this.blackboard.hasPerk('HORIZON_LENS');
    const hasPeoplesLens = isCampaign && this.blackboard.hasPerk('PEOPLES_LENS');
    const freeCoop =
      ctxSnap?.kind === 'CAMPAIGN' &&
      this.blackboard.hasPerk('COOP_CROSSCHECK') &&
      !ctxSnap.freeCoopUsed;
    const councilVeto =
      ctxSnap?.kind === 'CAMPAIGN' &&
      this.blackboard.hasPerk('COUNCIL_OVERRIDE') &&
      !ctxSnap.councilVetoUsed;

    let weakFacetIdx: number | null = null;
    if (hasHorizonLens && q.facets.length > 0) {
      let minP = Infinity;
      for (const f of q.facets) {
        if (!f.isCorrect && f.plausibility < minP) {
          minP = f.plausibility;
          weakFacetIdx = f.index;
        }
      }
    }

    const shattered: number[] = [];
    if (opts.autoRedactOneDecoy && q.facets.length > 1) {
      const decoy = q.facets.find((f) => !f.isCorrect);
      if (decoy) shattered.push(decoy.index);
    }

    const initEst = q.calibrator ? q.calibrator.initialEstimate : 0;

    this.timerTotalSec =
      q.archetype === 'GAUNTLET_SHATTER'
        ? q.gauntlet?.windowSec ?? 10
        : q.timerSec || 20;
    this.timerRemainingSec = this.timerTotalSec;
    this.readingGraceRemainingSec = 2.0;
    this.activeElapsedSec = 0;
    this.isCommittingAnswer = false;
    this.isAdvancingQuestion = false;
    this.questionBluffCalled = false;
    this.questionBluffEchoCancelled = false;
    this.questionCodexMoves = 0;
    this.questionMindGambitTriggered = false;
    this.questionFinaleCategoryPicked = Boolean(opts.isFinaleQuestion);
    this.liveBluffRadarLabel = null;

    const isFinalSlot =
      Boolean(opts.isFinaleQuestion) ||
      (ctxSnap?.kind !== 'PROLOGUE' &&
        ctxSnap?.kind !== 'INSTANT_TRIAL' &&
        opts.questionTotal >= 4 &&
        opts.questionIndex === opts.questionTotal - 1);

    const clueLadderEligible =
      ctxSnap?.kind !== 'PROLOGUE' &&
      ctxSnap?.kind !== 'INSTANT_TRIAL' &&
      !opts.isFinaleQuestion &&
      shouldUseClueLadder(
        opts.questionIndex,
        opts.questionTotal,
        q,
        this.getActiveMatchQuestions(),
      );
    this.activeClueLadder = clueLadderEligible ? new ClueLadderTracker(q, true) : null;

    const initialPeelTier = opts.initialPeelTier ?? 1;
    const initialFacetIndex = shattered.includes(0) ? 1 : 0;

    // #190 P1: Guarantee 0 initial matches on CODEX_DUAL_RING so `[0, 1, 2]` never auto-wins untouched!
    const initialCodexSelections: [number, number, number] = q.codex
      ? ([
          (q.codex.correctTargetIndexBySubject[0] + 1) % 4,
          (q.codex.correctTargetIndexBySubject[1] + 2) % 4,
          (q.codex.correctTargetIndexBySubject[2] + 3) % 4,
        ] as [number, number, number])
      : [0, 1, 2];

    this.liveVm = {
      modeLabel: opts.modeLabel,
      chyronTitle: opts.chyronTitle,
      chyronSub: opts.chyronSub,
      questionIndex: opts.questionIndex,
      questionTotal: opts.questionTotal,
      challengerName: this.passport.getChallengerName(),
      playerScore: opts.playerScore,
      streak: opts.streak,
      shields: opts.shields,
      rivalId: opts.rivalId,
      rivalName: opts.rivalName,
      rivalScore: opts.rivalScore,
      rivalStatus: opts.rivalStatus,
      actorId: opts.actorId,
      actorName: opts.actorName,
      actorExpression: opts.actorExpression,
      tellLine: opts.tellLine,
      coachHint: opts.coachHint,
      isPrologueQuestion: ctxSnap?.kind === 'PROLOGUE',
      question: q,
      remainingTimeSec: this.timerRemainingSec,
      totalTimeSec: this.timerTotalSec,
      readingGraceRemainingSec: this.readingGraceRemainingSec,
      doubleDownActive: false,
      clueLadder: this.activeClueLadder ? toClueLadderViewState(this.activeClueLadder) : null,
      activeGambit: this.buildActiveGambitHudState(isFinalSlot),
      secondWindBanner: null,
      isFinaleQuestion: isFinalSlot,
      scoutsAdvantageActive: Boolean(this.activeMercyBoost?.active),
      heroStepIndex: 0,
      selectedFacetIndex: initialFacetIndex,
      peelTier: initialPeelTier,
      peelSealedByJammer: Boolean(opts.peelSealed),
      freeCoopCueAvailable: freeCoop,
      horizonWeakFacetIndex: weakFacetIdx,
      showPeoplesHeatmap: hasPeoplesLens,
      councilVetoAvailable: councilVeto,
      shatteredFacetIndices: shattered,
      calibratorEstimate: initEst,
      calibratorCone: 'SHARP',
      codexTargetSelections: initialCodexSelections,
      selectedGlobeCoords: null,
      selectedGlobeAnchorIndex: null,
      isInstantTrialPrism: Boolean(opts.isInstantTrialPrism),
      duelLiveSplit: opts.duelLiveSplit ?? null,
      revealed: null,
    };

    const tierMult = this.resolveLiveTierMultiplier(this.liveVm);
    this.ergonomics.notifyQuestionStarted(
      tierMult,
      4,
      initialFacetIndex,
      Boolean(opts.peelSealed),
    );

    this.hud.renderGameplay(this.liveVm);

    // Sync initial CharacterStageRigDirector state
    if (this.matchCtx?.kind === 'CAMPAIGN') {
      this.characterRig.syncLiveCampaignRival(this.matchCtx.rival.getHUDState());
    } else if (this.matchCtx?.kind === 'TRIALS') {
      const g0 = this.trialsMode.sampleOpponentGhostAt(0);
      if (g0) this.characterRig.syncLiveGhostOpponent(opts.actorId, g0);
    } else {
      this.characterRig.syncSoloStageHost(opts.actorId, opts.actorExpression, opts.tellLine);
    }

    await this.stage3d.presentQuestion(q, {
      initialFacetIndex,
      horizonLens: hasHorizonLens,
      peoplesLens: hasPeoplesLens,
      peelLocked: Boolean(opts.peelSealed),
      synthesisStepIndex: 0,
    });
    this.metaSuite.applyEquippedFinish();

    if (q.archetype === 'CODEX_DUAL_RING') {
      this.stage3d.spinCodexRing('TOP', 0, false);
      this.stage3d.spinCodexRing('BOTTOM', initialCodexSelections[0], false);
      this.syncCodexConduitsTo3D();
    }

    if (shattered.length > 0) {
      this.stage3d.redactFacet(shattered[0]);
    }
    if (initialPeelTier === 2) {
      this.stage3d.triggerPeel();
    }

    if (this.screen === 'GAMEPLAY' && this.liveVm && !this.liveVm.revealed) {
      this.startTelemetryLoop();
    }
  }

  private isAnyOverlayModalOpen(): boolean {
    return (
      this.metaSuite.isOpen() ||
      Boolean(this.dossierModal?.isOpen()) ||
      Boolean(this.briefingModal?.isOpen()) ||
      Boolean(this.saveSlotsModal?.isOpen()) ||
      this.hud.isVaultDrawerOpen() ||
      this.hud.isVisualLightboxOpen() ||
      this.hud.isRulesModalOpen() ||
      this.leaveConfirmModalEl !== null ||
      this.restartFromStartModalEl !== null ||
      Boolean(this.motionCinema?.isActive()) ||
      Boolean(this.bossBanner?.isActive()) ||
      Boolean(this.endingDirector?.isActive()) ||
      document.querySelector('.ws-modal-backdrop, .ws-meta-backdrop') !== null
    );
  }

  /**
   * #200 Pulls non-repeating written reaction copy from `reactionVarietyBank` (`396` unique lines,
   * 150-item ring buffer, ~60% clean silence on routine answers so only factual `Why` shows!).
   */
  private pickNonRepeatingReactionSubtitle(opts: {
    actorId: string;
    correct: boolean;
    streakAfter: number;
    overclocked: boolean;
    backfired: boolean;
    bullseye: boolean;
    peelTier: number;
    domainId: number;
    remainingTimeSec?: number;
    forceShow?: boolean;
  }): string | null {
    const validCast = new Set<CastMemberId>([
      'vance',
      'nadia',
      'soren',
      'teo',
      'lindqvist',
      'tariq',
    ]);
    const safeActor: CastMemberId = validCast.has(opts.actorId as CastMemberId)
      ? (opts.actorId as CastMemberId)
      : 'vance';

    let kind: ReactionTriggerKind | null = null;
    if (opts.backfired) {
      kind = 'BACKFIRE';
    } else if (opts.bullseye) {
      kind = 'CALIBRATOR_BULLSEYE';
    } else if (opts.correct && opts.overclocked) {
      kind = 'OVERCLOCK_WIN';
    } else if (opts.correct && opts.streakAfter >= 10) {
      kind = 'STREAK_10';
    } else if (opts.correct && opts.streakAfter >= 5) {
      kind = 'STREAK_5';
    } else if (opts.correct && opts.streakAfter === 3) {
      kind = 'STREAK_3';
    } else if (opts.correct && (opts.remainingTimeSec ?? 10) <= 2.5) {
      kind = 'CLOSE_CALL';
    } else if (!opts.correct) {
      kind = 'MISS';
    } else if (opts.peelTier > 1) {
      kind = 'PEEL_USED';
    } else {
      // Routine Tier-1 safe win (<3 streak): keep 100% sleek & un-nagged!
      return null;
    }

    const picked = reactionVarietyBank.pickReaction({
      actorId: safeActor,
      kind,
      domainId: (opts.domainId >= 0 && opts.domainId <= 11 ? opts.domainId : 0) as DomainId,
      forceShow: opts.forceShow,
    });
    return picked ? picked.text : null;
  }

  private getElapsedSec(): number {
    return Math.max(0, this.activeElapsedSec);
  }

  /**
   * #200 Anti-Annoyance Session Guard: Once ANY gameplay VO clip plays once in a session,
   * it NEVER plays a second time (routine Qs rely purely on crisp horological Foley!).
   */
  private playGameplayVoiceOnce(clipOrUrl?: string | null): void {
    if (!clipOrUrl || this.audio.isVoicePlaying()) return;
    const claimed = claimGameplayBarkVoiceUrl(clipOrUrl);
    if (!claimed) return;
    const normKey = claimed.trim().toLowerCase();
    if (this.playedGameplayVoUrls.has(normKey)) return;
    this.playedGameplayVoUrls.add(normKey);
    this.audio.playVoice(claimed);
  }

  private maybePlayLiveCallout(
    event: LiveCalloutEvent,
    preferredSpeaker?: CastMemberId,
  ): void {
    if (this.audio.isVoicePlaying()) return;
    const cue = this.wave2Narrative.getLiveGameplayCalloutIfReady(
      event,
      performance.now(),
      16000,
      preferredSpeaker,
    );
    if (cue?.voiceUrl) {
      this.playGameplayVoiceOnce(cue.voiceUrl);
    }
  }

  private resolveLiveTierMultiplier(vm: GameplayQuestionViewState): number {
    const peelScale = vm.peelTier === 1 ? 1.0 : vm.peelTier === 2 ? 0.78 : 0.55;
    if (vm.question.archetype === 'CALIBRATOR_DIAL') {
      const coneSpec = vm.question.calibrator?.toleranceCones.find(
        (c) => c.id === vm.calibratorCone,
      );
      const baseCone = coneSpec
        ? coneSpec.multiplier
        : vm.calibratorCone === 'PINHOLE'
          ? 3.5
          : vm.calibratorCone === 'WIDE'
            ? 1.5
            : 2.5;
      return Math.round(baseCone * peelScale * 100) / 100;
    }
    if (vm.question.archetype === 'GLOBE_PIN_DROP') {
      return Math.round(3.5 * peelScale * 100) / 100;
    }
    if (vm.question.archetype === 'CODEX_DUAL_RING') {
      return Math.round(3.0 * peelScale * 100) / 100;
    }
    return vm.peelTier === 1 ? 3.0 : vm.peelTier === 2 ? 2.0 : 1.2;
  }

  private handleCallRivalBluff(): BluffCallOutcome | void {
    if (!this.liveVm || this.liveVm.revealed || this.matchCtx?.kind !== 'CAMPAIGN') {
      return;
    }
    const outcome = this.matchCtx.rival.callRivalBluff();
    if (!outcome.accepted) return outcome;

    if (outcome.wasActuallyBluffing) {
      // Only credit bluffCalled on a verified genuine bluff (single source of truth via recordQuestionOutcome)
      this.questionBluffCalled = true;
      this.matchBluffsCaught += 1;
      const radarStealBonus = this.activeGambitSession?.getBluffRadarStealBonus() ?? 0;
      if (radarStealBonus > 0) {
        this.questionMindGambitTriggered = true;
        this.metaSuite.recordSpecialFeat('MIND_GAMBIT_USED');
      }
      this.matchCtx.scoring.awardBonusPoints(outcome.playerBonusPoints + radarStealBonus);
      this.liveVm.playerScore = this.matchCtx.scoring.getMatchScore() + this.matchCtx.bluffBonusPoints;
      this.liveVm.rivalScore = this.matchCtx.rival.getScore();
      this.liveVm.tellLine =
        radarStealBonus > 0
          ? `${outcome.bannerText} · ◎ Tell Scanner +${radarStealBonus} Steal!`
          : outcome.bannerText;
      this.liveVm.actorExpression = 'shocked';
      this.haptics.correctBloom();
      this.audio.playSfx('gold_resonance');
      this.vfx.playGoldResonance(2, false);
      const rActor = this.matchCtx.rival.getActorId();
      this.maybePlayLiveCallout('SOREN_BLUFF', rActor);
      if (rActor === 'soren') {
        this.matchSorenBluffCaught = true;
        this.metaSuite.recordSpecialFeat('SOREN_COIN_BLUFF_DEFEATED');
      }
    } else {
      this.liveVm.tellLine = outcome.bannerText;
      this.liveVm.actorExpression = 'smirk';
      this.haptics.wrongThud(false);
      this.audio.playSfx('shutter_peel');
    }

    const pPts = document.getElementById('ws-player-pts');
    if (pPts) {
      pPts.textContent = `${this.liveVm.challengerName.toUpperCase()} · ${this.liveVm.playerScore.toLocaleString()} PTS`;
    }
    this.hud.updateLiveTelemetry({
      remainingSec: this.timerRemainingSec,
      totalSec: this.timerTotalSec,
      rivalName: this.liveVm.rivalName,
      rivalScore: this.liveVm.rivalScore,
      playerScore: this.liveVm.playerScore,
      tellLine: this.liveVm.tellLine,
    });
    return outcome;
  }

  private startTelemetryLoop(): void {
    // Cancel only any prior RAF tick directly — NEVER call stopTelemetryLoop() here,
    // which would cancel/reset freshly armed Overclock controls on a new question!
    if (this.telemetryRaf !== 0) {
      cancelAnimationFrame(this.telemetryRaf);
      this.telemetryRaf = 0;
    }
    this.lastTickMs = performance.now();

    const step = (now: number) => {
      if (this.screen !== 'GAMEPLAY' || !this.liveVm || this.liveVm.revealed) {
        this.telemetryRaf = 0;
        return;
      }
      const dt = Math.min(0.1, Math.max(0.001, (now - this.lastTickMs) / 1000));
      this.lastTickMs = now;

      if (this.isAnyOverlayModalOpen()) {
        this.telemetryRaf = requestAnimationFrame(step);
        return;
      }

      // Mandate #2: 2.0-second Reading Grace on every question before countdown ticks!
      if (this.readingGraceRemainingSec > 0) {
        this.readingGraceRemainingSec = Math.max(0, this.readingGraceRemainingSec - dt);
        this.liveVm.readingGraceRemainingSec = this.readingGraceRemainingSec;
        this.hud.updateLiveTelemetry({
          remainingSec: this.timerRemainingSec,
          totalSec: this.timerTotalSec,
          readingGraceSec: this.readingGraceRemainingSec,
          clueLadderNextSec: this.activeClueLadder?.canRevealNext
            ? this.activeClueLadder.nextAutoRevealInSec
            : null,
          rivalStatus: this.liveVm.rivalStatus,
          rivalName: this.liveVm.rivalName,
          rivalScore: this.liveVm.rivalScore,
          playerScore: this.liveVm.playerScore,
          actorId: this.liveVm.actorId,
          actorExpression: this.liveVm.actorExpression,
          tellLine: this.liveVm.tellLine,
          duelLiveSplit: this.liveVm.duelLiveSplit,
        });
        this.telemetryRaf = requestAnimationFrame(step);
        return;
      }

      this.activeElapsedSec += dt;
      const elapsed = this.activeElapsedSec;
      this.timerRemainingSec = Math.max(0, this.timerRemainingSec - dt);
      this.liveVm.remainingTimeSec = this.timerRemainingSec;
      this.liveVm.readingGraceRemainingSec = 0;

      // Mandate #7: Progressive Clue Ladder auto-reveal (`4.5s` per step after Reading Grace)
      if (this.activeClueLadder && this.activeClueLadder.canRevealNext) {
        const ladderTick = this.activeClueLadder.tick(dt);
        if (ladderTick.advanced) {
          this.liveVm.clueLadder = toClueLadderViewState(this.activeClueLadder);
          this.audio.playSfx('shutter_peel');
          this.hud.renderGameplay(this.liveVm);
        }
      }

      if (this.matchCtx?.kind === 'CAMPAIGN') {
        const tickOut = this.matchCtx.rival.tick(elapsed);
        if (tickOut.tempoStealDrainSec > 0) {
          this.timerRemainingSec = Math.max(
            1.2,
            this.timerRemainingSec - tickOut.tempoStealDrainSec,
          );
          this.liveVm.remainingTimeSec = this.timerRemainingSec;
        }
        this.liveVm.rivalStatus = tickOut.hud.status;
        this.liveVm.actorExpression = tickOut.hud.expression;
        this.liveVm.tellLine = tickOut.hud.tellPillText;
        if (this.activeGambitSession?.isBluffRadarActive()) {
          const radar = this.matchCtx.rival.getBluffRadarReadout();
          const nextLabel = radar.activeWager ? radar.label : null;
          if (nextLabel !== this.liveBluffRadarLabel) {
            this.liveBluffRadarLabel = nextLabel;
            if (this.liveVm.activeGambit) {
              this.liveVm.activeGambit.bluffRadarLabel = nextLabel;
            }
            const radarEl = document.getElementById('ws-gambit-bluff-radar');
            if (radarEl) {
              radarEl.textContent = nextLabel ?? '';
              radarEl.style.display = nextLabel ? '' : 'none';
            }
          }
          if (nextLabel) {
            this.liveVm.tellLine = nextLabel;
          }
        }
        this.characterRig.syncLiveCampaignRival(tickOut.hud);
      } else if (this.matchCtx?.kind === 'TRIALS') {
        const ghostFrame = this.trialsMode.sampleOpponentGhostAt(elapsed);
        if (ghostFrame) {
          this.liveVm.rivalStatus = ghostFrame.status;
          this.liveVm.rivalScore = ghostFrame.liveTotalScore;
          this.liveVm.actorExpression = ghostFrame.expression;
          this.liveVm.tellLine = ghostFrame.telemetryBanner;
          this.characterRig.syncLiveGhostOpponent(this.liveVm.actorId, ghostFrame);
        }
      } else if (this.matchCtx?.kind === 'DUEL') {
        const { tracker, index, payload } = this.matchCtx;
        const split = tracker.getChallengerSplit(index);
        const prevCum = index > 0 ? tracker.getChallengerCumulativeAt(index - 1) : 0;
        const lockSec = split ? split.lockTime100ms / 10 : 4.5;
        const ghostLocked = elapsed >= lockSec;
        const ghostCum = ghostLocked ? tracker.getChallengerCumulativeAt(index) : prevCum;
        const ghostStatus: GameplayQuestionViewState['rivalStatus'] = ghostLocked
          ? 'LOCKED'
          : split && split.overclockTier > 0 && elapsed >= Math.max(0.8, lockSec - 1.2)
            ? 'OVERCLOCKING'
            : split && split.peelTier > 1 && elapsed >= lockSec * 0.55
              ? 'PEELING'
              : 'THINKING';
        const deltaPts = this.liveVm.playerScore - ghostCum;
        this.liveVm.rivalStatus = ghostStatus;
        this.liveVm.rivalScore = ghostCum;
        this.liveVm.duelLiveSplit = {
          challengerName: payload.challengerName,
          playerScore: this.liveVm.playerScore,
          challengerScore: ghostCum,
          deltaPts,
          leader: deltaPts > 0 ? 'PLAYER' : deltaPts < 0 ? 'CHALLENGER' : 'TIED',
        };
      }

      this.hud.updateLiveTelemetry({
        remainingSec: this.timerRemainingSec,
        totalSec: this.timerTotalSec,
        readingGraceSec: 0,
        clueLadderNextSec: this.activeClueLadder?.canRevealNext
          ? this.activeClueLadder.nextAutoRevealInSec
          : null,
        rivalStatus: this.liveVm.rivalStatus,
        rivalName: this.liveVm.rivalName,
        rivalScore: this.liveVm.rivalScore,
        playerScore: this.liveVm.playerScore,
        actorId: this.liveVm.actorId,
        actorExpression: this.liveVm.actorExpression,
        tellLine: this.liveVm.tellLine,
        duelLiveSplit: this.liveVm.duelLiveSplit,
      });

      if (this.timerRemainingSec <= 0) {
        this.telemetryRaf = 0;
        this.ergonomics.notifyTimerExpired();
        this.stopAnyActiveOverclockAudio();
        this.stage3d.cancelOverclockBluff();
        void this.commitCurrentAnswer(0, true);
        return;
      }

      this.telemetryRaf = requestAnimationFrame(step);
    };

    this.telemetryRaf = requestAnimationFrame(step);
  }

  private stopTelemetryLoop(): void {
    if (this.telemetryRaf !== 0) {
      cancelAnimationFrame(this.telemetryRaf);
      this.telemetryRaf = 0;
    }
    this.stopAnyActiveOverclockAudio();
  }

  // ==========================================================================
  // SYNCED TACTILE CONTROLS (SPIN · PEEL · OVERCLOCK · CALIBRATOR · CODEX · GAUNTLET)
  // ==========================================================================

  private handleUiSelectFacet(idx: number, fromStep = false): void {
    if (!this.liveVm || this.liveVm.revealed) return;
    if (this.liveVm.shatteredFacetIndices.includes(idx)) return;
    this.spinUsedThisQ = true;
    this.liveVm.selectedFacetIndex = idx;
    if (!fromStep) {
      this.stage3d.spinToFacet(idx, false);
    }
    this.haptics.sightlineSnap();
    this.audio.playSfx('sightline_snap');
    if (this.matchCtx?.kind === 'TRIALS') {
      this.trialsMode.recordPlayerKineticGesture(this.getElapsedSec(), 'SPIN', {
        facetIndex: idx,
      });
    }
    this.hud.updateLiveTelemetry({
      remainingSec: this.timerRemainingSec,
      totalSec: this.timerTotalSec,
      selectedFacetIndex: idx,
    });
  }

  private handleSelectGlobeCoords(
    lat: number,
    lon: number,
    anchorIdx: number | null = null,
    moveStagePin = false,
  ): void {
    if (!this.liveVm || this.liveVm.revealed) return;
    if (this.liveVm.question.archetype !== 'GLOBE_PIN_DROP' || !this.liveVm.question.globePin) {
      return;
    }
    const safeLat = Math.max(-90, Math.min(90, lat));
    const safeLon = Math.max(-180, Math.min(180, lon));
    this.spinUsedThisQ = true;
    this.liveVm.selectedGlobeCoords = { lat: safeLat, lon: safeLon };
    this.liveVm.selectedGlobeAnchorIndex = anchorIdx;

    if (moveStagePin) {
      this.stage3d.setGlobeCandidatePin(safeLat, safeLon, true);
    }

    this.haptics.sightlineSnap();
    this.audio.playSfx('sightline_snap');

    const anchorLabel =
      anchorIdx !== null
        ? this.liveVm.question.globePin.quickAnchors[anchorIdx]?.label
        : undefined;
    const tierMult = this.resolveLiveTierMultiplier(this.liveVm);
    this.ergonomics.overclock.setTierMultiplier(tierMult);
    this.hud.updateGlobeSelectionDom(safeLat, safeLon, anchorIdx, tierMult, anchorLabel);
  }

  private handleTriggerPeel(from3D = false): void {
    if (!this.liveVm || this.liveVm.revealed || this.liveVm.peelSealedByJammer) return;
    if (this.liveVm.peelTier >= 3) return;

    // Only apply brief peel-gesture transition guard when triggered by 3D swipe;
    // clicking #ws-btn-peel must NEVER swallow an immediate tap on #ws-btn-overclock!
    this.ergonomics.notifyPeelStarted(from3D ? 120 : 0);

    if (
      this.liveVm.freeCoopCueAvailable &&
      this.liveVm.peelTier === 1 &&
      this.matchCtx?.kind === 'CAMPAIGN'
    ) {
      this.matchCtx.freeCoopUsed = true;
      this.liveVm.freeCoopCueAvailable = false;
      this.liveVm.coachHint = `NADIA CO-OP CUE (3.0x PRESERVED): ${this.liveVm.question.clues[0]}`;
      this.liveVm.remainingTimeSec = this.timerRemainingSec;
      this.haptics.peel(2);
      this.audio.playSfx('shutter_peel');
      this.vfx.playPeelShimmer();
      this.hud.renderGameplay(this.liveVm);
      return;
    }

    // Mandate #7: Hot-Streak Surge free 50/50 recharge preserves full multiplier!
    if (
      this.activeGambitSession &&
      this.activeGambitSession.getFreeFiftyFiftyCharges() > 0 &&
      this.liveVm.peelTier < 3 &&
      (this.liveVm.question.archetype === 'SIGHTLINE_LOCK' ||
        this.liveVm.question.archetype === 'HERO_ARTIFACT_SYNTHESIS')
    ) {
      if (this.activeGambitSession.consumeFreeFiftyFifty()) {
        this.questionMindGambitTriggered = true;
        this.metaSuite.recordSpecialFeat('MIND_GAMBIT_USED');
        const q = this.liveVm.question;
        const step =
          q.archetype === 'HERO_ARTIFACT_SYNTHESIS' && q.heroSynthesis
            ? q.heroSynthesis.steps[this.liveVm.heroStepIndex ?? 0]
            : null;
        const activeCorrectIdx = step ? step.correctFacetIndex : q.correctFacetIndex;
        const elim = [0, 1, 2, 3]
          .filter((i) => i !== activeCorrectIdx && !this.liveVm!.shatteredFacetIndices.includes(i))
          .slice(0, 2);
        for (const eIdx of elim) {
          this.liveVm.shatteredFacetIndices.push(eIdx);
        }
        if (this.liveVm.shatteredFacetIndices.includes(this.liveVm.selectedFacetIndex)) {
          const surviving = [0, 1, 2, 3].find(
            (i) => !this.liveVm!.shatteredFacetIndices.includes(i),
          );
          if (surviving !== undefined) {
            this.liveVm.selectedFacetIndex = surviving;
            this.stage3d.spinToFacet(surviving, false);
          }
        }
        this.liveVm.coachHint = `✦ STREAK SURGE FREE 50/50 (FULL MULTIPLIER KEPT): ${q.clues[0]}`;
        this.liveVm.activeGambit = this.buildActiveGambitHudState(Boolean(this.liveVm.isFinaleQuestion));
        this.liveVm.remainingTimeSec = this.timerRemainingSec;
        if (!from3D) this.stage3d.triggerPeel(elim);
        this.haptics.peel(3);
        this.audio.playSfx('glass_shatter');
        this.vfx.playPeelShimmer();
        this.hud.renderGameplay(this.liveVm);
        return;
      }
    }

    const nextTier: 2 | 3 = this.liveVm.peelTier === 1 ? 2 : 3;
    this.matchPeelsUsed += 1;
    this.liveVm.peelTier = nextTier;
    this.liveVm.remainingTimeSec = this.timerRemainingSec;
    this.ergonomics.overclock.setTierMultiplier(this.resolveLiveTierMultiplier(this.liveVm));

    const q = this.liveVm.question;
    const step =
      q.archetype === 'HERO_ARTIFACT_SYNTHESIS' && q.heroSynthesis
        ? q.heroSynthesis.steps[this.liveVm.heroStepIndex ?? 0]
        : null;
    const activeCorrectIdx = step ? step.correctFacetIndex : q.correctFacetIndex;
    const rawElim =
      nextTier === 3
        ? step?.clueTiers[2].shatteredFacetIndices ?? q.clueTiers[2].shatteredFacetIndices
        : undefined;
    // Safety invariant: Tier-3 Peel must NEVER shatter or disable the real correct answer!
    const elim = rawElim
      ? rawElim.filter((i) => i !== activeCorrectIdx).slice(0, 2)
      : undefined;

    if (nextTier === 3 && elim && elim.length > 0) {
      for (const eIdx of elim) {
        if (!this.liveVm.shatteredFacetIndices.includes(eIdx)) {
          this.liveVm.shatteredFacetIndices.push(eIdx);
        }
      }
      if (this.liveVm.shatteredFacetIndices.includes(this.liveVm.selectedFacetIndex)) {
        const surviving = [0, 1, 2, 3].find(
          (i) => !this.liveVm!.shatteredFacetIndices.includes(i),
        );
        if (surviving !== undefined) {
          this.liveVm.selectedFacetIndex = surviving;
          this.stage3d.spinToFacet(surviving, false);
        }
      }
      this.audio.playSfx('glass_shatter');
      this.maybePlayLiveCallout('TIER3_PEEL', 'vance');
    } else {
      this.audio.playSfx('shutter_peel');
      this.maybePlayLiveCallout('TIER2_PEEL', 'vance');
    }

    if (!from3D) {
      this.stage3d.triggerPeel(elim);
    }
    if (this.matchCtx?.kind === 'TRIALS') {
      this.trialsMode.recordPlayerKineticGesture(this.getElapsedSec(), 'PEEL', {
        peelTier: nextTier,
      });
    }

    this.haptics.peel(nextTier);
    this.vfx.playPeelShimmer();
    this.hud.renderGameplay(this.liveVm);
  }

  private handleToggleDoubleDown(): void {
    if (!this.liveVm || this.liveVm.revealed) return;
    this.liveVm.doubleDownActive = !this.liveVm.doubleDownActive;
    this.haptics.sightlineSnap();
    this.audio.playSfx(this.liveVm.doubleDownActive ? 'sightline_snap' : 'ui_tap');
    this.stage3d.setOverclockState(
      this.liveVm.doubleDownActive,
      this.liveVm.doubleDownActive ? 0.55 : 0,
    );
    this.hud.syncDoubleDownDom(this.liveVm);
  }

  private handleRevealNextClueStep(): void {
    if (
      !this.liveVm ||
      this.liveVm.revealed ||
      !this.activeClueLadder ||
      !this.activeClueLadder.canRevealNext
    ) {
      return;
    }
    const res = this.activeClueLadder.revealNextStep();
    if (!res.revealed) return;
    this.liveVm.clueLadder = toClueLadderViewState(this.activeClueLadder);
    this.liveVm.remainingTimeSec = this.timerRemainingSec;
    this.haptics.uiTap();
    this.audio.playSfx('shutter_peel');
    this.hud.renderGameplay(this.liveVm);
  }

  private handleUseSwapTopicGambit(): void {
    if (
      !this.liveVm ||
      this.liveVm.revealed ||
      !this.matchCtx ||
      !this.activeGambitSession?.canUseTopicSwap() ||
      !this.canCurrentMatchSwapTopic()
    ) {
      return;
    }
    if (!this.activeGambitSession.consumeTopicSwap()) return;
    this.questionMindGambitTriggered = true;
    this.metaSuite.recordSpecialFeat('MIND_GAMBIT_USED');

    const curQ = this.liveVm.question;
    const activeQs = this.getActiveMatchQuestions();
    const excludeQids = Array.from(
      new Set<number>([
        curQ.qid,
        ...(activeQs?.map((item) => item.qid) ?? []),
        ...this.currentMatchRecordedQids,
      ]),
    );

    let difficultyPreset: BriefingDifficultyPreset = curQ.difficultyTier ?? 'MIDDLE_SCHOOL';
    let mercyTierShift = 0;
    if (this.matchCtx.kind === 'CAMPAIGN') {
      mercyTierShift = this.matchCtx.mercy.mercyTierShift;
      difficultyPreset = resolveCampaignAcademicTier(
        this.matchCtx.mission.hubId as CampaignHubCode,
        this.matchCtx.mission.matchSpec.rhythmSlot - 1,
        mercyTierShift,
      );
    } else if (this.matchCtx.kind === 'BRIEFING') {
      difficultyPreset = this.matchCtx.difficultyPreset;
    }

    const replacement = swapQuestionToStrongestDomain(forgeEngine, curQ, {
      excludeQids,
      difficultyPreset,
      mercyTierShift,
    });
    replacement.timerSec = Math.max(curQ.timerSec || 22, replacement.timerSec || 22);

    if (
      this.matchCtx.kind === 'CAMPAIGN' ||
      this.matchCtx.kind === 'BRIEFING' ||
      this.matchCtx.kind === 'SHOWCASE'
    ) {
      this.matchCtx.questions[this.matchCtx.index] = replacement;
    } else if (this.matchCtx.kind === 'ENDLESS') {
      const target = this.endlessMode.getCurrentQuestion();
      if (target) replacePrismQuestionInPlace(target, replacement);
    } else if (this.matchCtx.kind === 'TRIALS') {
      const target = this.trialsMode.getCurrentQuestion();
      if (target) replacePrismQuestionInPlace(target, replacement);
    } else if (this.matchCtx.kind === 'DAILY') {
      const target = this.dailyMode.getCurrentQuestion();
      if (target) replacePrismQuestionInPlace(target, replacement);
    }

    const qForStage =
      this.matchCtx.kind === 'ENDLESS'
        ? this.endlessMode.getCurrentQuestion() ?? replacement
        : this.matchCtx.kind === 'TRIALS'
          ? this.trialsMode.getCurrentQuestion() ?? replacement
          : this.matchCtx.kind === 'DAILY'
            ? this.dailyMode.getCurrentQuestion() ?? replacement
            : replacement;

    this.liveVm.question = qForStage;
    this.liveVm.peelTier = 1;
    this.liveVm.heroStepIndex = 0;
    this.liveVm.selectedFacetIndex = 0;
    this.liveVm.shatteredFacetIndices = [];
    this.liveVm.doubleDownActive = false;
    this.liveVm.secondWindBanner = '↻ TOPIC SWAPPED to your strongest domain!';
    this.liveVm.calibratorEstimate = qForStage.calibrator
      ? qForStage.calibrator.initialEstimate
      : 0;
    this.liveVm.calibratorCone = 'SHARP';
    this.liveVm.selectedGlobeCoords = null;
    this.liveVm.selectedGlobeAnchorIndex = null;

    this.timerTotalSec = qForStage.timerSec || 24;
    this.timerRemainingSec = this.timerTotalSec;
    this.readingGraceRemainingSec = 2.0;
    this.activeElapsedSec = 0;
    this.questionBluffCalled = false;
    this.questionBluffEchoCancelled = false;
    this.questionCodexMoves = 0;
    this.liveVm.totalTimeSec = this.timerTotalSec;
    this.liveVm.remainingTimeSec = this.timerRemainingSec;
    this.liveVm.readingGraceRemainingSec = this.readingGraceRemainingSec;

    const keepClueLadder =
      this.activeClueLadder !== null ||
      shouldUseClueLadder(
        this.liveVm.questionIndex,
        this.liveVm.questionTotal,
        qForStage,
        this.getActiveMatchQuestions(),
      );
    this.activeClueLadder =
      keepClueLadder && !this.liveVm.isFinaleQuestion
        ? new ClueLadderTracker(qForStage, true)
        : null;
    this.liveVm.clueLadder = this.activeClueLadder
      ? toClueLadderViewState(this.activeClueLadder)
      : null;
    this.liveVm.activeGambit = this.buildActiveGambitHudState(Boolean(this.liveVm.isFinaleQuestion));

    this.ergonomics.notifyQuestionStarted(
      this.resolveLiveTierMultiplier(this.liveVm),
      4,
      0,
      Boolean(this.liveVm.peelSealedByJammer),
    );
    if (this.matchCtx.kind === 'CAMPAIGN') {
      const rivalHud = this.matchCtx.rival.beginQuestion({
        qid: qForStage.qid,
        domainId: qForStage.l0Domain,
        irtB: qForStage.irtB,
        archetype: qForStage.archetype,
        timeTotalSec: this.timerTotalSec,
        hubId: this.matchCtx.mission.hubId,
        difficultyTier: qForStage.difficultyTier,
      });
      this.liveVm.rivalStatus = rivalHud.status;
      this.liveVm.tellLine = rivalHud.tellPillText;
      this.characterRig.syncLiveCampaignRival(rivalHud);
    }

    this.haptics.sightlineSnap();
    this.audio.playSfx('shutter_peel');
    this.vfx.playPeelShimmer();
    this.hud.renderGameplay(this.liveVm);
    void this.stage3d.presentQuestion(qForStage).then(() => {
      this.metaSuite.applyEquippedFinish();
    });
  }

  private handleCouncilVeto(): void {
    if (!this.liveVm || this.liveVm.revealed || this.matchCtx?.kind !== 'CAMPAIGN') return;
    if (this.matchCtx.councilVetoUsed) return;
    this.matchCtx.councilVetoUsed = true;
    const curQ = this.liveVm.question;
    const replacement = forgeEngine.queryQuestions({
      count: 1,
      mode: 'CAMPAIGN',
      hub: this.matchCtx.mission.hubId,
      excludeDomains: [curQ.l0Domain],
      archetypes: [curQ.archetype],
    })[0];

    if (replacement) {
      replacement.timerSec = curQ.timerSec;
      this.matchCtx.questions[this.matchCtx.index] = replacement;
      this.liveVm.question = replacement;
      this.liveVm.councilVetoAvailable = false;
      this.liveVm.peelTier = 1;
      this.liveVm.heroStepIndex = 0;
      this.liveVm.selectedFacetIndex = 0;
      this.liveVm.shatteredFacetIndices = [];
      this.liveVm.calibratorEstimate = replacement.calibrator
        ? replacement.calibrator.initialEstimate
        : 0;
      this.liveVm.calibratorCone = 'SHARP';
      this.liveVm.codexTargetSelections = replacement.codex
        ? ([
            (replacement.codex.correctTargetIndexBySubject[0] + 1) % 4,
            (replacement.codex.correctTargetIndexBySubject[1] + 2) % 4,
            (replacement.codex.correctTargetIndexBySubject[2] + 3) % 4,
          ] as [number, number, number])
        : [0, 1, 2];
      this.timerTotalSec =
        replacement.archetype === 'GAUNTLET_SHATTER'
          ? replacement.gauntlet?.windowSec ?? 10
          : replacement.timerSec || 20;
      this.timerRemainingSec = this.timerTotalSec;
      this.activeElapsedSec = 0;
      this.questionBluffCalled = false;
      this.questionBluffEchoCancelled = false;
      this.questionCodexMoves = 0;
      this.liveVm.totalTimeSec = this.timerTotalSec;
      this.liveVm.remainingTimeSec = this.timerRemainingSec;
      this.ergonomics.notifyQuestionStarted(
        this.resolveLiveTierMultiplier(this.liveVm),
        4,
        0,
        this.liveVm.peelSealedByJammer,
      );
      const rivalHud = this.matchCtx.rival.beginQuestion({
        qid: replacement.qid,
        domainId: replacement.l0Domain,
        irtB: replacement.irtB,
        archetype: replacement.archetype,
        timeTotalSec: this.timerTotalSec,
        hubId: this.matchCtx.mission.hubId,
        difficultyTier: replacement.difficultyTier,
      });
      this.liveVm.rivalStatus = rivalHud.status;
      this.liveVm.tellLine = rivalHud.tellPillText;
      this.characterRig.syncLiveCampaignRival(rivalHud);
      this.hud.renderGameplay(this.liveVm);
      void this.stage3d.presentQuestion(replacement).then(() => {
        this.metaSuite.applyEquippedFinish();
      });
    }
  }

  private handleUpdateCalibrator(estimate: number, cone: CalibratorConeId): void {
    if (!this.liveVm || this.liveVm.revealed || !this.liveVm.question.calibrator) return;
    const prevCone = this.liveVm.calibratorCone;
    this.liveVm.calibratorEstimate = estimate;
    this.liveVm.calibratorCone = cone;
    this.liveVm.remainingTimeSec = this.timerRemainingSec;

    this.stage3d.setCalibratorValue(estimate);
    const coneSpec = this.liveVm.question.calibrator.toleranceCones.find((c) => c.id === cone);
    if (coneSpec) {
      // #190 P0: coneSpec.pctOfSpan is already a [0.008..0.32] fraction — never divide by 100 twice!
      const frac = coneSpec.pctOfSpan > 1 ? coneSpec.pctOfSpan / 100 : coneSpec.pctOfSpan;
      this.stage3d.setCalibratorTolerance(frac, `${coneSpec.multiplier.toFixed(1)}x`);
    }
    this.ergonomics.overclock.setTierMultiplier(this.resolveLiveTierMultiplier(this.liveVm));
    if (prevCone !== cone) {
      this.hud.renderGameplay(this.liveVm);
    }
  }

  private handleUpdateCodex(subjIdx: 0 | 1 | 2, delta: number): void {
    if (!this.liveVm || this.liveVm.revealed || !this.liveVm.question.codex) return;
    this.questionCodexMoves += 1;
    const cur = this.liveVm.codexTargetSelections[subjIdx] ?? 0;
    const next = (cur + delta + 4) % 4;
    this.liveVm.codexTargetSelections[subjIdx] = next;
    this.liveVm.remainingTimeSec = this.timerRemainingSec;
    this.stage3d.spinCodexRing('TOP', subjIdx, false);
    this.stage3d.spinCodexRing('BOTTOM', next, false);
    this.syncCodexConduitsTo3D();
    this.hud.renderGameplay(this.liveVm);
  }

  private syncCodexConduitsTo3D(): void {
    if (!this.liveVm?.question.codex) return;
    const uniqueCount = new Set(this.liveVm.codexTargetSelections).size;
    this.stage3d.setCodexConduits(uniqueCount);
  }

  private handleGauntletSubmit(action: 'VERIFY' | 'DEBUNK' | 'CHALLENGE'): void {
    if (!this.liveVm || this.liveVm.revealed) return;
    this.haptics.shatterPlate();
    this.audio.playSfx('glass_shatter');
    void this.commitCurrentAnswer(0, false, action);
  }

  private handleBluffCancel(): void {
    this.canvasChargeAudioActive = false;
    this.audio.stopOverclockCharge();
    this.stage3d.cancelOverclockBluff();
    if (!this.liveVm || this.liveVm.revealed) return;

    // Recorded once via notifyMetaQuestionOutcome({ bluffEchoCancelled: true }) — avoids double-counting!
    this.questionBluffEchoCancelled = true;
    this.maybePlayLiveCallout('OVERCLOCK_CANCEL', 'vance');

    if (this.matchCtx?.kind === 'TRIALS') {
      this.trialsMode.recordPlayerKineticGesture(this.getElapsedSec(), 'OVERCLOCK_CANCEL');
    }
    if (this.matchCtx?.kind === 'CAMPAIGN' && this.blackboard.hasPerk('BLUFF_ECHO')) {
      const baited = this.matchCtx.rival.triggerPlayerBluffEchoFeint(this.getElapsedSec());
      if (baited) {
        this.timerRemainingSec = Math.min(this.timerTotalSec, this.timerRemainingSec + 1.5);
        this.liveVm.remainingTimeSec = this.timerRemainingSec;
        this.liveVm.tellLine = this.matchCtx.rival.getHUDState().tellPillText;
        this.characterRig.syncLiveCampaignRival(this.matchCtx.rival.getHUDState());
      }
    }
  }

  private async commitCurrentAnswer(
    overclockCharge01: number,
    timedOut = false,
    gauntletAction?: 'VERIFY' | 'DEBUNK' | 'CHALLENGE',
  ): Promise<void> {
    if (!this.liveVm || this.liveVm.revealed || !this.matchCtx || this.isCommittingAnswer) return;
    this.isCommittingAnswer = true;
    this.hud.notifyOverclockCommittedOrCancelled();
    try {
      const q = this.liveVm.question;
      // Handle 3-Step Chained Boss HERO_ARTIFACT_SYNTHESIS Latches (0 -> 1 -> 2)!
      if (
        !timedOut &&
        q.archetype === 'HERO_ARTIFACT_SYNTHESIS' &&
        q.heroSynthesis &&
        (this.liveVm.heroStepIndex ?? 0) < 2
      ) {
        const curStepIdx = this.liveVm.heroStepIndex ?? 0;
        const stepSpec = q.heroSynthesis.steps[curStepIdx];
        if (this.liveVm.selectedFacetIndex === stepSpec.correctFacetIndex) {
          const nextIdx = (curStepIdx + 1) as 1 | 2;
          this.liveVm.heroStepIndex = nextIdx;
          this.liveVm.peelTier = 1;
          this.liveVm.shatteredFacetIndices = [];
          this.liveVm.selectedFacetIndex = 0;
          this.timerRemainingSec = Math.min(this.timerTotalSec, this.timerRemainingSec + 6);
          this.liveVm.remainingTimeSec = this.timerRemainingSec;
          this.haptics.correctBloom();
          this.audio.playSfx('vault_thunk');
          this.maybePlayLiveCallout('RELIC_LATCH', 'vance');
          this.vfx.playGoldResonance(2, false);
          // Re-arm ergonomics & release commit latch immediately so Step 1->2 rapid taps NEVER drop!
          this.ergonomics.notifyQuestionStarted(3.0, 4, 0, false);
          this.hud.renderGameplay(this.liveVm);
          this.isCommittingAnswer = false;
          const isCampaign = this.matchCtx.kind === 'CAMPAIGN';
          void this.stage3d
            .presentQuestion(q, {
              synthesisStepIndex: nextIdx,
              horizonLens: isCampaign && this.blackboard.hasPerk('HORIZON_LENS'),
              peoplesLens: isCampaign && this.blackboard.hasPerk('PEOPLES_LENS'),
            })
            .then(() => {
              this.metaSuite.applyEquippedFinish();
            });
          const relicId = q.heroSynthesis.relicId ?? q.heroRelicId;
          if (relicId) {
            this.metaSuite.recordSpecialFeat('RELIC_LATCH_OPENED', {
              relicId,
              latchCount: nextIdx,
            });
          }
          return;
        }
      }

      // Guard unpinned GLOBE_PIN_DROP manual lock — require a pin drop unless timer expired
      if (
        !timedOut &&
        q.archetype === 'GLOBE_PIN_DROP' &&
        !this.liveVm.selectedGlobeCoords
      ) {
        this.haptics.uiTap();
        return;
      }

      const activeCorrectIdxPre =
        q.archetype === 'HERO_ARTIFACT_SYNTHESIS' && q.heroSynthesis
          ? q.heroSynthesis.steps[this.liveVm.heroStepIndex ?? 0].correctFacetIndex
          : q.correctFacetIndex;

      // Mandate #7: Second Wind Mulligan (from SECOND_WIND Gambit or Scout's Advantage Retry Mercy)!
      if (
        !timedOut &&
        this.activeGambitSession?.canTriggerSecondWind(q.archetype, false) &&
        this.liveVm.selectedFacetIndex !== activeCorrectIdxPre
      ) {
        const sw = this.activeGambitSession.consumeSecondWind();
        if (sw.triggered) {
          this.questionMindGambitTriggered = true;
          this.matchSecondWindTriggered = true;
          this.metaSuite.recordSpecialFeat('MIND_GAMBIT_USED');
          this.metaSuite.recordSpecialFeat('SECOND_WIND_SAVED');

          const wrongIdx = this.liveVm.selectedFacetIndex;
          if (!this.liveVm.shatteredFacetIndices.includes(wrongIdx)) {
            this.liveVm.shatteredFacetIndices.push(wrongIdx);
            this.stage3d.redactFacet(wrongIdx);
          }
          const surviving = [0, 1, 2, 3].find(
            (i) => !this.liveVm!.shatteredFacetIndices.includes(i),
          );
          if (surviving !== undefined) {
            this.liveVm.selectedFacetIndex = surviving;
            this.stage3d.spinToFacet(surviving, false);
          }
          this.liveVm.doubleDownActive = false;
          this.stage3d.setOverclockState(false, 0);
          this.liveVm.secondWindBanner = sw.bannerText;
          this.timerRemainingSec = Math.min(this.timerTotalSec, this.timerRemainingSec + 3.0);
          this.liveVm.remainingTimeSec = this.timerRemainingSec;
          this.liveVm.activeGambit = this.buildActiveGambitHudState(
            Boolean(this.liveVm.isFinaleQuestion),
          );
          this.ergonomics.notifyQuestionStarted(
            this.resolveLiveTierMultiplier(this.liveVm),
            4,
            this.liveVm.selectedFacetIndex,
            Boolean(this.liveVm.peelSealedByJammer),
          );
          this.haptics.peel(2);
          this.audio.playSfx('shutter_peel');
          this.vfx.playPeelShimmer();
          this.hud.renderGameplay(this.liveVm);
          return;
        }
      }

      const frozenLockTimeSec = Math.max(0, this.timerRemainingSec);
      this.stopTelemetryLoop();
      this.liveVm.remainingTimeSec = frozenLockTimeSec;

      this.haptics.lockThunk();
      this.audio.playSfx('vault_thunk');

      const elapsedSec = this.getElapsedSec();
      // Mandate #4: Explicit 2x Double Down toggle OR classic pointer-hold Overclock!
      const effectiveCharge01 =
        !timedOut && this.liveVm.doubleDownActive && overclockCharge01 < 0.08
          ? 1.0
          : overclockCharge01;
      const overclocked = effectiveCharge01 >= 0.08;

      const submission: PrismAnswerSubmission = {
        archetype: q.archetype,
        selectedFacetIndex: this.liveVm.selectedFacetIndex,
        peelTier: this.liveVm.peelTier,
        overclocked,
        overclockCharge: effectiveCharge01,
        elapsedSec,
        timedOut,
        calibratorEstimate: this.liveVm.calibratorEstimate,
        calibratorConeId: this.liveVm.calibratorCone,
        codexSelectedTargetIndices: [...this.liveVm.codexTargetSelections],
        selectedGlobeCoords: this.liveVm.selectedGlobeCoords ?? undefined,
        gauntletAction,
        synthesisStepIndex: this.liveVm.heroStepIndex ?? 0,
      };

      // Mandate #7: Snapshot Clue Ladder & evaluate Mind Gambit bonuses cleanly before scoring!
      const ladderBonus = this.activeClueLadder ? this.activeClueLadder.ladderBonusPoints : 0;
      const ladderCallout = this.activeClueLadder ? this.activeClueLadder.currentCalloutBanner : null;
      const isLadderStep1 = Boolean(this.activeClueLadder?.isStep1Snipe);
      const currentStreakBefore = this.liveVm.streak;
      const previewEval = evaluatePrismAnswer(q, submission, currentStreakBefore);
      const gambitEval = this.activeGambitSession
        ? this.activeGambitSession.evaluateQuestionBonuses({
            correct: previewEval.correct,
            currentStreakBefore,
            isClueLadderStep1: isLadderStep1,
            elapsedSec,
            isFinalQuestion: Boolean(this.liveVm.isFinaleQuestion),
          })
        : null;

      if (gambitEval?.statusCallout) {
        this.questionMindGambitTriggered = true;
        this.metaSuite.recordSpecialFeat('MIND_GAMBIT_USED');
      }

      const v3Modifiers = {
        clueLadderBonusPoints: ladderBonus,
        gambitFlatBonusPoints: gambitEval?.clueBountyPoints ?? 0,
        streakComboMultiplierBonus: gambitEval?.streakComboMultiplierBonus ?? 0,
        finaleJackpotMultiplier: gambitEval?.finaleJackpotMultiplier ?? 1.0,
        zeroDoubleDownPenalty: gambitEval?.zeroDoubleDownPenalty ?? false,
      };

      let scored: ScoredQuestionResult;
      let campaignRivalActor: CastMemberId | null = null;
      let extraNonNativeBonus = 0;

      if (this.matchCtx.kind === 'PROLOGUE') {
        scored = this.prologueScoring.submitAnswer(q, submission);
        this.liveVm.playerScore = scored.matchScoreAfter;
        this.liveVm.streak = scored.streakAfter;

        // #137 P1 #7b & #163: Idempotent live Passport & Forge IRT sync on Prologue Q1..Q4!
        this.prologue.syncLivePrologueOutcome(
          this.matchCtx.qCard.questionIndex as 1 | 2 | 3 | 4,
          scored.correct,
          submission.peelTier,
          scored.overclocked,
        );
        this.saveSlotManager.saveActiveSlot();
      } else if (
        this.matchCtx.kind === 'INSTANT_TRIAL' ||
        this.matchCtx.kind === 'SRS_REVIEW' ||
        this.matchCtx.kind === 'SHOWCASE'
      ) {
        scored = this.matchCtx.scoring.submitAnswer(q, submission, v3Modifiers);
        this.liveVm.playerScore = scored.matchScoreAfter;
        this.liveVm.streak = scored.streakAfter;
        forgeEngine.recordQuestionOutcome({
          qid: q.qid,
          l0Domain: q.l0Domain,
          archetype: q.archetype,
          irtB: q.irtB,
          irtA: q.irtA,
          correct: scored.correct,
          peelTier: submission.peelTier,
          accuracyRatio: scored.partialCreditRatio,
          bullseye: scored.bullseye,
          overclocked: scored.overclocked,
        });
        this.passport.recordDomainQuestionOutcome(
          q.l0Domain,
          scored.correct,
          submission.peelTier,
          q.irtB,
        );
      } else if (this.matchCtx.kind === 'DUEL') {
        const ctx = this.matchCtx;
        scored = ctx.scoring.submitAnswer(q, submission, v3Modifiers);
        this.liveVm.playerScore = scored.matchScoreAfter;
        this.liveVm.streak = scored.streakAfter;
        forgeEngine.recordQuestionOutcome({
          qid: q.qid,
          l0Domain: q.l0Domain,
          archetype: q.archetype,
          irtB: q.irtB,
          irtA: q.irtA,
          correct: scored.correct,
          peelTier: submission.peelTier,
          accuracyRatio: scored.partialCreditRatio,
          bullseye: scored.bullseye,
          overclocked: scored.overclocked,
        });
        this.passport.recordDomainQuestionOutcome(
          q.l0Domain,
          scored.correct,
          submission.peelTier,
          q.irtB,
        );
        const comp = ctx.tracker.recordPlayerSplit(
          ctx.index,
          scored.pointsEarned,
          scored.matchScoreAfter,
          Math.round(elapsedSec * 1000),
          {
            correct: scored.correct,
            peelTier: submission.peelTier,
            overclockCharge: effectiveCharge01,
          },
        );
        this.liveVm.rivalScore = comp.challengerCumulativePts;
        this.liveVm.rivalStatus = 'LOCKED';
        this.liveVm.duelLiveSplit = {
          challengerName: ctx.payload.challengerName,
          playerScore: comp.playerCumulativePts,
          challengerScore: comp.challengerCumulativePts,
          deltaPts: comp.deltaCumulativePts,
          leader: comp.leader,
        };
      } else if (this.matchCtx.kind === 'CAMPAIGN') {
        const ctx = this.matchCtx;
        const spec = ctx.mission.matchSpec;
        const rules = spec.compiledRules;
        scored = ctx.scoring.submitAnswer(q, submission, {
          tier1BonusMultiplier: rules.tier1ColdInstinctMultiplier,
          sovereignDomainMultiplier: rules.sovereignDomainBonusMultiplier,
          overclockPeakBonusScale: rules.overclockPeakBonusScale,
          chronoSurgeActive: rules.activeMutators.includes('CHRONO_SURGE'),
          ...v3Modifiers,
        });
        forgeEngine.recordQuestionOutcome({
          qid: q.qid,
          l0Domain: q.l0Domain,
          archetype: q.archetype,
          irtB: q.irtB,
          irtA: q.irtA,
          correct: scored.correct,
          peelTier: submission.peelTier,
          accuracyRatio: scored.partialCreditRatio,
          bullseye: scored.bullseye,
          overclocked: scored.overclocked,
        });
        this.passport.recordDomainQuestionOutcome(
          q.l0Domain,
          scored.correct,
          submission.peelTier,
          q.irtB,
        );

        // #145 P1 #4 & #193 #4: Decrement shields on miss / Backfire, and enforce Phase III Sudden-Death Backfire!
        const heroIdx = ctx.questions.findIndex(
          (item) => item.archetype === 'HERO_ARTIFACT_SYNTHESIS',
        );
        const isPhase3SuddenDeath =
          (spec.isBossShowdown &&
            ctx.index > (heroIdx >= 0 ? heroIdx : ctx.questions.length - 2)) ||
          rules.activeMutators.includes('ZERO_SHIELD_SUDDEN_DEATH');
        if (isPhase3SuddenDeath && scored.backfired && !v3Modifiers.zeroDoubleDownPenalty) {
          ctx.suddenDeathBackfired = true;
          this.matchShieldsLost += ctx.shieldsRemaining ?? 3;
          ctx.shieldsRemaining = 0;
        } else if (!scored.correct && typeof ctx.shieldsRemaining === 'number') {
          const loss = scored.backfired && !v3Modifiers.zeroDoubleDownPenalty ? 2 : 1;
          const prevShields = ctx.shieldsRemaining;
          ctx.shieldsRemaining = Math.max(0, ctx.shieldsRemaining - loss);
          this.matchShieldsLost += Math.max(0, prevShields - ctx.shieldsRemaining);
        }
        this.liveVm.shields = ctx.shieldsRemaining;

        const rivalOut = ctx.rival.resolveQuestion({
          archetype: q.archetype,
          playerCorrect: scored.correct,
          playerBackfired: scored.backfired,
        });
        this.liveVm.playerScore = scored.matchScoreAfter + ctx.bluffBonusPoints;
        this.liveVm.streak = scored.streakAfter;
        this.liveVm.rivalScore = rivalOut.totalRivalScore;
        this.liveVm.rivalStatus = 'LOCKED';
        this.liveVm.actorExpression = rivalOut.expression;
        this.liveVm.tellLine = rivalOut.hud.tellPillText;
        this.characterRig.syncLiveCampaignRival(rivalOut.hud);
        campaignRivalActor = ctx.rival.getActorId();
      } else if (this.matchCtx.kind === 'DAILY') {
        const out = this.dailyMode.submitCurrentAnswer(submission);
        scored = out.resolution;
        if (scored.correct) {
          extraNonNativeBonus =
            ladderBonus +
            (gambitEval?.clueBountyPoints ?? 0) +
            (gambitEval && gambitEval.streakComboMultiplierBonus > 0
              ? Math.round(100 * gambitEval.streakComboMultiplierBonus)
              : 0) +
            (gambitEval && gambitEval.finaleJackpotMultiplier > 1
              ? Math.round(scored.pointsEarned * (gambitEval.finaleJackpotMultiplier - 1))
              : 0);
          this.matchExtraBonusPoints += extraNonNativeBonus;
        }
        this.liveVm.playerScore = scored.matchScoreAfter + this.matchExtraBonusPoints;
        this.liveVm.streak = scored.streakAfter;
        if (out.completedSummary) {
          this.pendingDailySummary = out.completedSummary;
        }
      } else if (this.matchCtx.kind === 'BRIEFING') {
        const out = this.briefingMode.submitCurrentAnswer(submission);
        scored = out.resolution;
        if (scored.correct) {
          extraNonNativeBonus =
            ladderBonus +
            (gambitEval?.clueBountyPoints ?? 0) +
            (gambitEval && gambitEval.streakComboMultiplierBonus > 0
              ? Math.round(100 * gambitEval.streakComboMultiplierBonus)
              : 0) +
            (gambitEval && gambitEval.finaleJackpotMultiplier > 1
              ? Math.round(scored.pointsEarned * (gambitEval.finaleJackpotMultiplier - 1))
              : 0);
          this.matchExtraBonusPoints += extraNonNativeBonus;
        }
        this.liveVm.playerScore = scored.matchScoreAfter + this.matchExtraBonusPoints;
        this.liveVm.streak = scored.streakAfter;
        if (out.summary) {
          this.pendingBriefingSummary = out.summary;
        }
      } else if (this.matchCtx.kind === 'ENDLESS') {
        const prevShields = this.liveVm.shields ?? 3;
        const out = await this.endlessMode.submitCurrentAnswer(submission);
        scored = out.resolution;
        if (scored.correct) {
          extraNonNativeBonus =
            ladderBonus +
            (gambitEval?.clueBountyPoints ?? 0) +
            (gambitEval && gambitEval.streakComboMultiplierBonus > 0
              ? Math.round(100 * gambitEval.streakComboMultiplierBonus)
              : 0) +
            (gambitEval && gambitEval.finaleJackpotMultiplier > 1
              ? Math.round(scored.pointsEarned * (gambitEval.finaleJackpotMultiplier - 1))
              : 0);
          this.matchExtraBonusPoints += extraNonNativeBonus;
          this.endlessRunCorrectCount += 1;
          this.endlessRunStreak += 1;
          if (this.endlessRunStreak > this.endlessRunMaxStreak) {
            this.endlessRunMaxStreak = this.endlessRunStreak;
          }
        } else {
          this.endlessRunStreak = 0;
        }
        this.liveVm.playerScore = out.hud.totalLiveScore + this.matchExtraBonusPoints;
        this.liveVm.shields = out.hud.shields;
        if (out.hud.shields < prevShields) {
          this.matchShieldsLost += prevShields - out.hud.shields;
        }
        this.pendingEndlessStep = out;
      } else {
        const out = this.trialsMode.submitCurrentAnswer(submission);
        scored = out.resolution;
        if (scored.correct) {
          extraNonNativeBonus =
            ladderBonus +
            (gambitEval?.clueBountyPoints ?? 0) +
            (gambitEval && gambitEval.streakComboMultiplierBonus > 0
              ? Math.round(100 * gambitEval.streakComboMultiplierBonus)
              : 0) +
            (gambitEval && gambitEval.finaleJackpotMultiplier > 1
              ? Math.round(scored.pointsEarned * (gambitEval.finaleJackpotMultiplier - 1))
              : 0);
          this.matchExtraBonusPoints += extraNonNativeBonus;
        }
        this.liveVm.playerScore = scored.matchScoreAfter + this.matchExtraBonusPoints;
        this.liveVm.streak = scored.streakAfter;
        this.liveVm.rivalScore = out.ghostTotalScore;
        this.liveVm.rivalStatus = 'LOCKED';
        if (out.summary) {
          this.pendingTrialsSummary = out.summary;
        }
      }

      // Snapshot locked Clue Ladder step BEFORE revealing all 3 steps on the reveal card!
      const lockedClueLadderStep = this.activeClueLadder
        ? this.activeClueLadder.activeStep
        : undefined;

      // Record Clue-1 Snipe & Finale Category Win honours feats!
      if (scored.correct && isLadderStep1) {
        this.matchFirstClueSnipes += 1;
        this.metaSuite.recordSpecialFeat('CLUE_LADDER_STEP1_SNIPE');
      }
      if (scored.correct && this.questionFinaleCategoryPicked) {
        this.matchFinaleCategoryWon = true;
        this.metaSuite.recordSpecialFeat('FINALE_CATEGORY_WIN');
      }

      // Reveal full 3-step Clue Ladder on reveal card and refresh Gambit HUD strip
      if (this.activeClueLadder) {
        this.activeClueLadder.revealAllSteps();
        this.liveVm.clueLadder = toClueLadderViewState(this.activeClueLadder);
      }
      this.liveVm.activeGambit = this.buildActiveGambitHudState(
        Boolean(this.liveVm.isFinaleQuestion),
      );

      // Upgrade #1: Record compact per-question split for 1-Tap `?duel=` Share Links (up to 15 Qs)
      if (
        this.matchCtx.kind !== 'PROLOGUE' &&
        this.matchCtx.kind !== 'ENDLESS' &&
        this.matchCtx.kind !== 'INSTANT_TRIAL' &&
        this.currentMatchRecordedQids.length < 15
      ) {
        this.currentMatchRecordedQids.push(q.qid);
        this.currentMatchRecordedSplits.push(
          createDuelSplitFromResult(scored, Math.round(elapsedSec * 1000)),
        );
      }

      if (scored.correct && submission.peelTier === 1 && effectiveCharge01 >= 0.88) {
        this.matchMax6xWins += 1;
      }
      if (
        scored.correct &&
        q.archetype === 'HERO_ARTIFACT_SYNTHESIS' &&
        (q.heroSynthesis?.relicId ?? q.heroRelicId)
      ) {
        this.metaSuite.recordSpecialFeat('RELIC_LATCH_OPENED', {
          relicId: (q.heroSynthesis?.relicId ?? q.heroRelicId)!,
          latchCount: 3,
        });
      }

      const activeCorrectIdx =
        q.archetype === 'HERO_ARTIFACT_SYNTHESIS' && q.heroSynthesis
          ? q.heroSynthesis.steps[this.liveVm.heroStepIndex ?? 0].correctFacetIndex
          : q.correctFacetIndex;

      let globeReveal:
        | {
            targetLat: number;
            targetLon: number;
            candidateLat?: number;
            candidateLon?: number;
            distanceKm?: number;
            targetLabel?: string;
          }
        | undefined;
      if (q.archetype === 'GLOBE_PIN_DROP' && q.globePin) {
        const gp = q.globePin;
        const sel = this.liveVm.selectedGlobeCoords;
        const distKm =
          typeof scored.globeDistanceKm === 'number'
            ? scored.globeDistanceKm
            : sel
              ? computeHaversineDistanceKm(sel.lat, sel.lon, gp.targetLat, gp.targetLon)
              : undefined;
        globeReveal = {
          targetLat: gp.targetLat,
          targetLon: gp.targetLon,
          candidateLat: sel?.lat,
          candidateLon: sel?.lon,
          distanceKm: distKm,
          targetLabel: gp.targetLabel,
        };
      }

      this.stage3d.resolveOutcome({
        correct: scored.correct,
        correctIndex: activeCorrectIdx,
        selectedIndex: this.liveVm.selectedFacetIndex,
        wasOverclocked: scored.overclocked,
        exactCalibratorVal: q.calibrator?.exactVal,
        gauntletVerdict: gauntletAction,
        globeReveal,
      });

      if (scored.correct) {
        this.haptics.correctBloom();
        this.audio.playStreakFanfare(scored.streakAfter);
        this.vfx.playGoldResonance(scored.streakAfter, scored.bullseye);
        if (this.matchCtx.kind === 'PROLOGUE') {
          if (scored.overclocked) {
            this.playGameplayVoiceOnce('vance_overclock_win');
          }
        } else {
          // #200: Routine answers use crisp Foley ONLY; special feats play each Wave-2 VO clip at most ONCE per session!
          if (scored.bullseye && q.archetype === 'CALIBRATOR_DIAL') {
            this.maybePlayLiveCallout('CALIBRATOR_PINHOLE', 'vance');
          } else if (q.archetype === 'CODEX_DUAL_RING') {
            this.maybePlayLiveCallout('CODEX_LOCK', 'vance');
          } else if (q.archetype === 'GAUNTLET_SHATTER' && scored.streakAfter >= 3) {
            this.maybePlayLiveCallout('GAUNTLET_SWEEP', 'vance');
          } else if (scored.overclocked && overclockCharge01 >= 0.65) {
            this.maybePlayLiveCallout('OVERCLOCK_BOLD', 'vance');
          } else if (submission.peelTier === 1 && scored.streakAfter >= 4) {
            this.maybePlayLiveCallout('COLD_INSTINCT', 'vance');
          }
        }
      } else {
        // #200: ZERO repetitive "Costly misstep" / `on_player_miss` VO barks — horological Foley ONLY!
        this.haptics.wrongThud(scored.backfired);
        this.audio.playSfx('backfire_fracture');
        this.vfx.playBackfirePulse(scored.backfired);
        if (this.matchCtx.kind === 'PROLOGUE' && scored.backfired) {
          this.playGameplayVoiceOnce('vance_backfire');
        }
      }

      // #200: Replace routine reveal subtitle with non-repeating ReactionVarietyBank line (or clean silence!)
      const reactionSubtitle = this.pickNonRepeatingReactionSubtitle({
        actorId: campaignRivalActor ?? this.liveVm.actorId,
        correct: scored.correct,
        streakAfter: scored.streakAfter,
        overclocked: scored.overclocked,
        backfired: scored.backfired,
        bullseye: scored.bullseye,
        peelTier: submission.peelTier,
        domainId: q.l0Domain,
        remainingTimeSec: frozenLockTimeSec,
      });
      this.liveVm.tellLine = reactionSubtitle ?? '';

      const isBookmarked = this.passport
        .getSnapshot()
        .bookmarks.some((b) => b.qid === q.qid);

      // #166 §3 + Upgrade #5 + #329 + v3.0: Live Career Analytics, Leitner SRS Auto-Capture & 88 Honours!
      const displayEarnedPoints = scored.pointsEarned + extraNonNativeBonus;
      const revealedClueBonus = scored.correct && ladderBonus > 0 ? ladderBonus : undefined;
      const revealedGambitBonus =
        scored.correct && gambitEval && gambitEval.clueBountyPoints > 0
          ? gambitEval.clueBountyPoints
          : undefined;
      this.notifyMetaQuestionOutcome(q, submission, scored, lockedClueLadderStep);

      this.liveVm.revealed = {
        correct: scored.correct,
        backfired: scored.backfired,
        bullseye: scored.bullseye,
        earnedPoints: displayEarnedPoints,
        tierMultiplier: scored.tierMultiplier,
        overclockMultiplier: scored.overclockMultiplier,
        speedBonus: scored.speedBonus,
        ladderBonusPoints: revealedClueBonus,
        ladderSnipeLabel: revealedClueBonus ? ladderCallout : null,
        gambitBonusPoints: revealedGambitBonus,
        gambitBonusLabel: gambitEval?.statusCallout ?? null,
        correctFacetIndex: activeCorrectIdx,
        selectedFacetIndex: this.liveVm.selectedFacetIndex,
        correctDisplay: scored.correctAnswerDisplay,
        whyExplanation: scored.whyExplanation,
        bookmarked: isBookmarked,
        feedbackVote: getQuestionVote(q.qid),
        feedbackToast: null,
        globeDistanceKm: globeReveal?.distanceKm ?? scored.globeDistanceKm,
        globeAccuracyTier: scored.globeAccuracyTier,
      };

      this.hud.renderGameplay(this.liveVm);
    } finally {
      this.isCommittingAnswer = false;
    }
  }

  private pendingDailySummary: ReturnType<DailyGlobalFeed['submitCurrentAnswer']>['completedSummary'] =
    null;
  private pendingBriefingSummary: ReturnType<
    BriefingCategoriesMode['submitCurrentAnswer']
  >['summary'] = null;
  private pendingEndlessStep: Awaited<
    ReturnType<ArchiveDescentEndless['submitCurrentAnswer']>
  > | null = null;
  private pendingTrialsSummary: ReturnType<
    CouncilTrialsGhostMode['submitCurrentAnswer']
  >['summary'] = null;

  private handleToggleBookmark(): void {
    if (!this.liveVm?.revealed) return;
    const q = this.liveVm.question;
    const nowSaved = this.passport.toggleIntelBookmark({
      qid: q.qid,
      domainId: q.l0Domain,
      prompt: q.prompt,
      answer: this.liveVm.revealed.correctDisplay,
      whyExplanation: q.whyExplanation,
    });
    this.liveVm.revealed.bookmarked = nowSaved;
    if (nowSaved) {
      this.metaSuite.syncSpacedRepetitionBookmarks();
      this.syncVaultLiveStatus();
    }
    this.saveSlotManager.saveActiveSlot();
    this.hud.renderGameplay(this.liveVm);
  }

  private handleRateQuestion(vote: 'UPVOTE' | 'FLAG'): void {
    if (!this.liveVm?.revealed) return;
    const q = this.liveVm.question;
    recordQuestionFeedback({
      qid: q.qid,
      vote,
      reason: vote === 'FLAG' ? 'AWKWARD_PHRASING' : undefined,
      domainId: q.l0Domain,
      subcatLabel: q.l1Category,
      promptSnippet: q.prompt,
    });
    if (vote === 'FLAG') {
      forgeEngine.addQuarantinedQid(q.qid);
    }
    this.liveVm.revealed.feedbackVote = vote;
    this.liveVm.revealed.feedbackToast =
      vote === 'FLAG' ? '✓ Question Flagged & Quarantined' : '✓ Upvoted — Thanks!';
    this.metaSuite.evaluateAndToastHonours();
    this.syncVaultLiveStatus();
    this.hud.renderGameplay(this.liveVm);
  }

  private async advanceAfterReveal(): Promise<void> {
    if (!this.matchCtx || !this.liveVm?.revealed || this.isAdvancingQuestion) return;
    this.isAdvancingQuestion = true;
    this.audio.stopVoice();
    try {
      if (this.matchCtx.kind === 'PROLOGUE') {
        const qCard = this.matchCtx.qCard;
        const rev = this.liveVm.revealed;
        const coneSpec = this.liveVm.question.calibrator?.toleranceCones.find(
          (c) => c.id === this.liveVm!.calibratorCone,
        );
        const rawPct = coneSpec?.pctOfSpan;
        const nextSnap = this.prologue.recordQuestionCompleted({
          questionIndex: qCard.questionIndex,
          correct: rev.correct,
          peelTierUsed: this.liveVm.peelTier,
          overclocked: rev.overclockMultiplier > 1.01,
          spinUsed: this.spinUsedThisQ,
          calibratorTolerancePct:
            typeof rawPct === 'number' ? (rawPct > 1 ? rawPct / 100 : rawPct) : undefined,
        });
        this.saveSlotManager.saveActiveSlot();
        this.presentPrologueStep(nextSnap);
        return;
      }

      if (this.matchCtx.kind === 'INSTANT_TRIAL') {
        this.handleInstantPrismAction('CAMPAIGN');
        return;
      }

      if (this.matchCtx.kind === 'DUEL') {
        const ctx = this.matchCtx;
        ctx.index += 1;
        const nextQ = ctx.questions[ctx.index];
        if (nextQ) {
          const ghostCum =
            ctx.index > 0 ? ctx.tracker.getChallengerCumulativeAt(ctx.index - 1) : 0;
          const playerScore = ctx.scoring.getMatchScore();
          const deltaPts = playerScore - ghostCum;
          await this.beginQuestionOnStage(nextQ, {
            modeLabel: this.liveVm.modeLabel,
            chyronTitle: this.liveVm.chyronTitle,
            chyronSub: this.liveVm.chyronSub,
            questionIndex: ctx.index,
            questionTotal: ctx.questions.length,
            playerScore,
            streak: ctx.scoring.getStreak(),
            rivalId: 'soren',
            rivalName: ctx.payload.challengerName,
            rivalScore: ghostCum,
            rivalStatus: 'THINKING',
            actorId: 'soren',
            actorName: ctx.payload.challengerName,
            actorExpression: 'intense',
            tellLine: `Split ${ctx.index + 1} of ${ctx.questions.length} vs ${ctx.payload.challengerName}`,
            duelLiveSplit: {
              challengerName: ctx.payload.challengerName,
              playerScore,
              challengerScore: ghostCum,
              deltaPts,
              leader: deltaPts > 0 ? 'PLAYER' : deltaPts < 0 ? 'CHALLENGER' : 'TIED',
            },
          });
          return;
        }

        const faction = (this.blackboard.getSnapshot().pledgedFaction ?? 'AGORA') as FactionId;
        const elo = forgeEngine.getSkillSnapshot().globalElo;
        const baseHref =
          typeof window !== 'undefined' ? new URL('./', window.location.href).href : undefined;
        const verdict = ctx.tracker.buildFinalHeadToHeadSummary({
          playerName: this.passport.getChallengerName(),
          playerFaction: faction,
          playerElo: elo,
          playerTotalScore: ctx.scoring.getMatchScore(),
          playerCorrectCount: ctx.scoring.getCorrectCount(),
          baseHref,
        });
        duelRivalsStore.recordCompletedDuel(verdict, encodeDuelChallenge(ctx.payload));
        if (verdict.playerWon) {
          this.metaSuite.recordSpecialFeat('DUEL_GHOST_BEATEN');
        }
        this.notifyMetaMatchCompleted({
          mode: 'TRIALS',
          hubId: 'sg',
          won: verdict.playerWon || verdict.tied,
          correctCount: verdict.playerCorrectCount,
          totalQuestions: verdict.totalQuestions,
          score: verdict.playerScore,
          peelsUsed: this.matchPeelsUsed,
          max6xOverclockWinsInMatch: this.matchMax6xWins,
        });
        const lb = this.buildSummaryLeaderboard({
          scope: ctx.payload.mode === 'DAILY' ? 'DAILY' : 'SUBCATEGORY',
          topicKey: verdict.topicKey,
          topicLabel: verdict.topicLabel,
          utcDate: ctx.payload.utcDate,
          playerScore: verdict.playerScore,
        });
        this.pausePassive2DActors();
        void this.stage3d.showChampionshipTrophy(0);
        this.screen = 'SUMMARY';
        this.activeSummaryVm = {
          mode: 'TRIALS',
          victory: verdict.playerWon || verdict.tied,
          headline: verdict.headline,
          subheadline: `${verdict.topicLabel} · ${verdict.totalQuestions} Prisms Head-to-Head`,
          challengerName: verdict.playerName,
          playerScore: verdict.playerScore,
          rivalName: verdict.challengerName,
          rivalScore: verdict.challengerScore,
          correctCount: verdict.playerCorrectCount,
          totalCount: verdict.totalQuestions,
          bestStreak: ctx.scoring.getMaxStreak(),
          duelVerdict: verdict,
          duelShareUrl: verdict.rematchUrl,
          duelShareLabel: 'Share Rematch Link',
          leaderboard: lb,
        };
        this.hud.renderMatchSummary(this.activeSummaryVm);
        return;
      }

      if (this.matchCtx.kind === 'SHOWCASE') {
        const ctx = this.matchCtx;
        ctx.index += 1;
        const nextQ = ctx.questions[ctx.index];
        if (nextQ) {
          await this.beginQuestionOnStage(nextQ, {
            modeLabel: this.liveVm.modeLabel,
            chyronTitle: this.liveVm.chyronTitle,
            chyronSub: this.liveVm.chyronSub,
            questionIndex: ctx.index,
            questionTotal: ctx.questions.length,
            playerScore: ctx.scoring.getMatchScore(),
            streak: ctx.scoring.getStreak(),
            rivalId: 'nadia',
            rivalName: 'Nadia',
            rivalScore: 0,
            rivalStatus: 'HIDDEN',
            actorId: 'nadia',
            actorName: 'Nadia Al-Mansoor',
            actorExpression: 'neutral',
            tellLine:
              ctx.showcaseKind === 'GLOBE_PIN_DROP'
                ? 'Tap the 3D Meridian Globe (or a Quick Region) to drop your pinpoint!'
                : 'Inspect the Sapphire Blueprint plate — tap it to enlarge!',
          });
          return;
        }
        const playerScore = ctx.scoring.getMatchScore();
        const correctCount = ctx.scoring.getCorrectCount();
        const won = correctCount >= Math.ceil(ctx.questions.length * 0.5);
        const label =
          ctx.showcaseKind === 'GLOBE_PIN_DROP' ? '3D Globe Pin-Drop' : 'Visual Blueprints';
        this.notifyMetaMatchCompleted({
          mode: 'BRIEFING',
          won,
          correctCount,
          totalQuestions: ctx.questions.length,
          score: playerScore,
          peelsUsed: this.matchPeelsUsed,
          max6xOverclockWinsInMatch: this.matchMax6xWins,
        });
        const duelShareUrl = this.buildDuelShareUrlForCurrentMatch({
          mode: 'BRIEFING',
          domainId: -1,
          topicLabel: label,
          totalScore: playerScore,
        });
        const lb = this.buildSummaryLeaderboard({
          scope: 'SUBCATEGORY',
          topicKey: ctx.showcaseKind === 'GLOBE_PIN_DROP' ? 'globe_pin_drop' : 'visual_blueprints',
          topicLabel: label,
          playerScore,
        });
        this.pausePassive2DActors();
        void this.stage3d.showChampionshipTrophy(0);
        this.screen = 'SUMMARY';
        this.activeSummaryVm = {
          mode: 'BRIEFING',
          victory: won,
          headline: `${label.toUpperCase()} SHOWCASE COMPLETE`,
          subheadline: `${correctCount}/${ctx.questions.length} Solved · ${playerScore.toLocaleString('en-US')} PTS`,
          challengerName: this.passport.getChallengerName(),
          playerScore,
          correctCount,
          totalCount: ctx.questions.length,
          bestStreak: ctx.scoring.getMaxStreak(),
          duelShareUrl,
          leaderboard: lb,
        };
        this.hud.renderMatchSummary(this.activeSummaryVm);
        return;
      }

      if (this.matchCtx.kind === 'SRS_REVIEW') {
        const ctx = this.matchCtx;
        ctx.index += 1;
        const nextQ = ctx.questions[ctx.index];
        if (nextQ) {
          await this.beginQuestionOnStage(nextQ, {
            modeLabel: 'LEITNER MASTERY DECK',
            chyronTitle: 'SPACED-REPETITION REVIEW',
            chyronSub: `${ctx.questions.length} DUE CARDS`,
            questionIndex: ctx.index,
            questionTotal: ctx.questions.length,
            playerScore: ctx.scoring.getMatchScore(),
            streak: ctx.scoring.getStreak(),
            rivalId: 'nadia',
            rivalName: 'Nadia',
            rivalScore: 0,
            rivalStatus: 'HIDDEN',
            actorId: 'nadia',
            actorName: 'Nadia Al-Mansoor',
            actorExpression: 'neutral',
            tellLine: 'Correct recalls promote cards toward Box 5 Mastery!',
          });
          return;
        }
        const playerScore = ctx.scoring.getMatchScore();
        const correctCount = ctx.scoring.getCorrectCount();
        this.metaSuite.recordSpecialFeat('SRS_REVIEW_COMPLETED');
        this.notifyMetaMatchCompleted({
          mode: 'BRIEFING',
          won: correctCount >= Math.ceil(ctx.questions.length * 0.5),
          correctCount,
          totalQuestions: ctx.questions.length,
          score: playerScore,
          peelsUsed: this.matchPeelsUsed,
          max6xOverclockWinsInMatch: this.matchMax6xWins,
        });
        this.syncVaultLiveStatus();
        this.pausePassive2DActors();
        void this.stage3d.showChampionshipTrophy(0);
        this.screen = 'SUMMARY';
        this.activeSummaryVm = {
          mode: 'BRIEFING',
          victory: true,
          headline: 'LEITNER MASTERY REVIEW COMPLETE',
          subheadline: `${correctCount}/${ctx.questions.length} Cards Promoted · ${this.metaSuite.getDueReviewCount()} Due Remaining`,
          challengerName: this.passport.getChallengerName(),
          playerScore,
          correctCount,
          totalCount: ctx.questions.length,
          bestStreak: ctx.scoring.getMaxStreak(),
        };
        this.hud.renderMatchSummary(this.activeSummaryVm);
        return;
      }

      if (this.matchCtx.kind === 'CAMPAIGN') {
        const ctx = this.matchCtx;
        const spec = ctx.mission.matchSpec;
        const shieldsShattered =
          ctx.suddenDeathBackfired ||
          (typeof ctx.shieldsRemaining === 'number' && ctx.shieldsRemaining <= 0);

        ctx.index += 1;
        const nextQ = !shieldsShattered ? ctx.questions[ctx.index] : undefined;
        if (nextQ) {
          const launchNextCampaignQuestion = async (
            chosenQ: PrismQuestion,
            isFinalePicked = false,
          ): Promise<void> => {
            // Play Phase II / Phase III Boss Showdown Broadcast Stinger on phase boundaries (#140 & #176/#178)!
            if (spec.isBossShowdown) {
              const bossBanner = await this.getBossBanner();
              await bossBanner.playIfPhaseTransition(
                {
                  isBossShowdown: true,
                  questionIndex: ctx.index,
                  totalQuestions: ctx.questions.length,
                  archetype: chosenQ.archetype,
                  questions: ctx.questions,
                  bossPhases: spec.bossPhases,
                },
                {
                  hubId: spec.hubId,
                  countryCode: spec.countryCode,
                  cityName: ctx.mission.title,
                  missionTitle: ctx.mission.subtitle,
                  heroRelicId: spec.heroRelicId,
                  rivalId: spec.rivalId,
                  stage3d: this.stage3d,
                },
              );
            }

            const rivalHud = ctx.rival.beginQuestion({
              qid: chosenQ.qid,
              domainId: chosenQ.l0Domain,
              irtB: chosenQ.irtB,
              archetype: chosenQ.archetype,
              timeTotalSec: chosenQ.timerSec,
              hubId: spec.hubId,
              difficultyTier: chosenQ.difficultyTier,
            });
            await this.beginQuestionOnStage(chosenQ, {
              modeLabel: this.liveVm?.modeLabel ?? ctx.mission.difficultyLabel,
              chyronTitle: `${ctx.mission.countryCode} · ${ctx.mission.title.toUpperCase()}`,
              chyronSub: this.liveVm?.chyronSub ?? ctx.mission.difficultyLabel,
              questionIndex: ctx.index,
              questionTotal: ctx.questions.length,
              playerScore: ctx.scoring.getMatchScore() + ctx.bluffBonusPoints,
              streak: ctx.scoring.getStreak(),
              shields: ctx.shieldsRemaining,
              rivalId: rivalHud.actorId,
              rivalName: rivalHud.shortName,
              rivalScore: rivalHud.score,
              rivalStatus: rivalHud.status,
              actorId: rivalHud.actorId,
              actorName: rivalHud.name,
              actorExpression: rivalHud.expression,
              tellLine: rivalHud.tellPillText,
              peelSealed: spec.compiledRules.peelLockedBothPlayers,
              isFinaleQuestion: isFinalePicked,
            });
          };

          // Mandate #7: Finale Category Picker (*Final Jeopardy!* moment) before final question of non-boss rounds!
          if (
            !spec.isBossShowdown &&
            ctx.questions.length >= 4 &&
            ctx.index === ctx.questions.length - 1
          ) {
            const preferredDom = spec.preferredDomains[0] ?? null;
            const finaleOptions = buildFinaleCategoryOptions(forgeEngine, preferredDom, 3);
            const effectiveTier = resolveCampaignAcademicTier(
              spec.hubId as CampaignHubCode,
              spec.rhythmSlot - 1,
              ctx.mercy.mercyTierShift,
            );
            const hasJackpot = this.activeGambitSession?.equippedId === 'FINALE_JACKPOT';
            this.presentFinaleCategoryPicker(
              {
                chyronTitle: `${ctx.mission.countryCode} · FINAL QUESTION`,
                chyronSub: ctx.mission.title.toUpperCase(),
                headline: 'Final Question: Choose Your Category',
                subheadline: 'Pick your favorite topic below to lock in the deciding question!',
                jackpotNote: hasJackpot
                  ? '★ VAULT JACKPOT ACTIVE: 2.5× Final Payout & Zero Double-Down Penalty!'
                  : '✦ Final Question — Tip: Toggle 2× Double Down if you know your chosen topic!',
                options: finaleOptions.map((o) => ({
                  domainId: o.domainId,
                  title: o.title,
                  subtitle: o.subtitle,
                  medallionUrl: o.medallionUrl,
                  isStrongest: o.isRecommended,
                })),
              },
              async (pickedDomainId) => {
                const pickedQ = await pickFinaleQuestionForCategoryAsync(
                  forgeEngine,
                  pickedDomainId as DomainId,
                  effectiveTier,
                  {
                    excludeQids: ctx.questions.map((item) => item.qid),
                    timerSec: nextQ.timerSec,
                    hub: spec.hubId,
                    mercyTierShift: ctx.mercy.mercyTierShift,
                    bonusTimerSec: ctx.mercy.bonusTimerSec,
                  },
                );
                ctx.questions[ctx.index] = pickedQ;
                await launchNextCampaignQuestion(pickedQ, true);
              },
            );
            return;
          }

          await launchNextCampaignQuestion(nextQ, false);
          return;
        }

        // Campaign Mission Finished!
        // Mandate #1: Forgiving early pass threshold (`>= 40%` on Stage 1 Geneva & Stage 2 London, `>= 60%` later)!
        const playerPts = ctx.scoring.getMatchScore() + ctx.bluffBonusPoints;
        const rivalPts = ctx.rival.getScore();
        const isForgivingEarlyHub = ctx.mission.hubId === 'ch' || ctx.mission.hubId === 'gb';
        const passRatio = isForgivingEarlyHub ? 0.4 : 0.6;
        const won =
          !shieldsShattered &&
          (playerPts >= rivalPts ||
            ctx.scoring.getCorrectCount() >= Math.ceil(ctx.questions.length * passRatio));

        mindGambitStore.recordMatchProgress({
          won,
          maxStreak: ctx.scoring.getMaxStreak(),
          bluffsCaught: this.matchBluffsCaught,
          firstClueSnipes: this.matchFirstClueSnipes,
          gambitTriggered: Boolean(this.activeGambitSession?.hasTriggeredAnyEffect()),
        });

        const failReasonCode:
          | 'PHASE3_SUDDEN_DEATH_BACKFIRE'
          | 'SHIELDS_DEPLETED'
          | 'OUTSCORED_BY_RIVAL' = ctx.suddenDeathBackfired
          ? 'PHASE3_SUDDEN_DEATH_BACKFIRE'
          : shieldsShattered
            ? 'SHIELDS_DEPLETED'
            : 'OUTSCORED_BY_RIVAL';

        let failureRivalQuote: string | undefined;
        if (won) {
          this.localFailedMissions.delete(ctx.mission.id);
          const cue = this.campaign.getRivalReaction(ctx.rival.getActorId(), 'on_defeat');
          this.playGameplayVoiceOnce(cue.voiceUrl);
        } else {
          const prev = this.localFailedMissions.get(ctx.mission.id)?.attempts ?? 0;
          this.localFailedMissions.set(ctx.mission.id, {
            attempts: prev + 1,
            lastFailReason: failReasonCode,
          });
          this.campaign.recordMissionFailed(
            ctx.mission.id,
            playerPts,
            rivalPts,
            failReasonCode,
          );

          failureRivalQuote =
            this.pickNonRepeatingReactionSubtitle({
              actorId: ctx.rival.getActorId(),
              correct: false,
              streakAfter: 0,
              overclocked: ctx.suddenDeathBackfired,
              backfired: ctx.suddenDeathBackfired,
              bullseye: false,
              peelTier: 1,
              domainId: 0,
              forceShow: true,
            }) ?? undefined;
          this.audio.playSfx('backfire_fracture');
        }

        const completion = won
          ? this.campaign.completeMission(ctx.mission.id, ctx.choiceOverrideNextMission)
          : null;
        this.saveSlotManager.saveActiveSlot();

        if (won) {
          const bbDone = new Set(this.blackboard.getSnapshot().completedMissions);
          if (bbDone.has('gb_5') && bbDone.has('jp_5')) {
            this.metaSuite.recordSpecialFeat('ACT1_CLEARED');
          }
        }

        this.notifyMetaMatchCompleted({
          mode: 'CAMPAIGN',
          hubId: ctx.mission.hubId,
          won,
          correctCount: ctx.scoring.getCorrectCount(),
          totalQuestions: ctx.questions.length,
          score: playerPts,
          isBossShowdown: spec.isBossShowdown,
          shieldsLost: this.matchShieldsLost,
          peelsUsed: this.matchPeelsUsed,
          max6xOverclockWinsInMatch: this.matchMax6xWins,
          defeatedRivalId: won ? ctx.rival.getActorId() : undefined,
          sorenCoinTellCaughtInMatch: this.matchSorenBluffCaught,
        });

        const cityFirstMissionId = `${ctx.mission.hubId}_1`;
        const failureCauseBanner = ctx.suddenDeathBackfired
          ? 'SUDDEN-DEATH OVERCLOCK BACKFIRE'
          : shieldsShattered
            ? 'SHIELDS SHATTERED (0 / 3)'
            : `OUTSCORED BY ${ctx.rival.getName().toUpperCase()}: ${playerPts.toLocaleString()} VS ${rivalPts.toLocaleString()}`;

        const campDuelUrl = this.buildDuelShareUrlForCurrentMatch({
          mode: 'TRIALS',
          domainId: spec.preferredDomains[0] ?? -1,
          topicLabel: ctx.mission.title.slice(0, 28),
          totalScore: playerPts,
        });
        const campLb = this.buildSummaryLeaderboard({
          scope: 'SUBCATEGORY',
          topicKey: `campaign_${ctx.mission.hubId}`,
          topicLabel: `${ctx.mission.countryCode} · ${ctx.mission.title}`,
          playerScore: playerPts,
        });

        const showSummary = () => {
          this.pausePassive2DActors();
          if (won) {
            if (completion?.unlockedRelicId) {
              void this.stage3d.showHeroRelic(completion.unlockedRelicId, 0);
            } else {
              void this.stage3d.showChampionshipTrophy(0);
            }
          } else {
            this.stage3d.triggerMissionFailedState();
          }
          this.screen = 'SUMMARY';
          this.activeSummaryVm = {
            mode: 'CAMPAIGN',
            victory: won,
            headline: won
              ? `${ctx.mission.title} — CLEARED!`
              : ctx.suddenDeathBackfired
                ? `${ctx.mission.title} — SUDDEN-DEATH BACKFIRE`
                : `${ctx.mission.title} — LEVEL FAILED`,
            subheadline: won
              ? ctx.mission.cliffhangerHook
              : `Outscore your rival or solve at least ${isForgivingEarlyHub ? '40%' : '60%'} of questions to advance. Retrying unlocks Scout's Advantage (+6s Timer & Free Second Wind)!`,
            challengerName: this.passport.getChallengerName(),
            playerScore: playerPts,
            rivalName: ctx.rival.getName(),
            rivalScore: rivalPts,
            correctCount: ctx.scoring.getCorrectCount(),
            totalCount: ctx.questions.length,
            bestStreak: ctx.scoring.getMaxStreak(),
            unlockedRelicTitle: completion?.unlockedRelicId ?? undefined,
            unlockedClueTitle: completion?.unlockedEvidenceClueId ?? undefined,
            duelShareUrl: campDuelUrl,
            leaderboard: won ? campLb : null,
            flightForkPending:
              this.blackboard.getSnapshot().prologueComplete &&
              !this.blackboard.getSnapshot().firstFlight,
            retryMissionId: won ? undefined : ctx.mission.id,
            failureCauseBanner: won ? undefined : failureCauseBanner,
            failureRivalId: won ? undefined : ctx.rival.getActorId(),
            failureRivalQuote: won ? undefined : failureRivalQuote,
            failureCityFirstMissionId: won ? undefined : cityFirstMissionId,
          };
          this.hud.renderMatchSummary(this.activeSummaryVm);
        };

        if (
          won &&
          (ctx.mission.postMatchBeats.length > 0 || ctx.deferredEndingChoices.length > 0)
        ) {
          this.activeMissionForChoice = ctx.mission;
          this.playDialogueSequence(
            `${ctx.mission.countryCode} · AFTERMATH`,
            ctx.mission.title,
            ctx.mission.postMatchBeats,
            ctx.deferredEndingChoices,
            showSummary,
          );
        } else {
          showSummary();
        }
        return;
      }

      if (this.matchCtx.kind === 'DAILY') {
        const nextQ = this.dailyMode.getCurrentQuestion();
        if (nextQ && !this.pendingDailySummary) {
          this.matchCtx.index += 1;
          const prog = this.dailyMode.getProgress();
          await this.beginQuestionOnStage(nextQ, {
            modeLabel: 'GLOBAL FEED',
            chyronTitle: this.liveVm.chyronTitle,
            chyronSub: this.liveVm.chyronSub,
            questionIndex: this.matchCtx.index,
            questionTotal: this.matchCtx.total,
            playerScore: prog.score + this.matchExtraBonusPoints,
            streak: this.liveVm.streak,
            rivalId: 'vance',
            rivalName: 'Vance',
            rivalScore: 0,
            rivalStatus: 'HIDDEN',
            actorId: 'vance',
            actorName: 'Julian Vance',
            actorExpression: 'neutral',
            tellLine:
              this.matchCtx.index === this.matchCtx.total - 1
                ? 'FINAL QUESTION — Closest-Year Bullseye Tiebreaker!'
                : 'Global Feed synchronized UTC seed active.',
            isFinaleQuestion: this.matchCtx.index === this.matchCtx.total - 1,
          });
          return;
        }

        const sum = this.pendingDailySummary!;
        this.pendingDailySummary = null;
        const dailyFinalScore = sum.totalScore + this.matchExtraBonusPoints;
        let curRunStreak = 0;
        let maxRunStreak = 0;
        for (const r of sum.resolutions) {
          curRunStreak = r.correct ? curRunStreak + 1 : 0;
          if (curRunStreak > maxRunStreak) maxRunStreak = curRunStreak;
        }
        mindGambitStore.recordMatchProgress({
          won: sum.correctCount >= Math.ceil(sum.totalQuestions * 0.5),
          maxStreak: maxRunStreak,
          firstClueSnipes: this.matchFirstClueSnipes,
          gambitTriggered: Boolean(this.activeGambitSession?.hasTriggeredAnyEffect()),
        });
        this.notifyMetaMatchCompleted({
          mode: 'DAILY',
          hubId: 'global',
          won: true,
          correctCount: sum.correctCount,
          totalQuestions: sum.totalQuestions,
          score: dailyFinalScore,
          peelsUsed: this.matchPeelsUsed,
          max6xOverclockWinsInMatch: this.matchMax6xWins,
          utcDate: sum.utcDate,
          isReplay: Boolean((sum as { isReplay?: boolean }).isReplay),
        });
        const dailyDuelUrl = this.buildDuelShareUrlForCurrentMatch({
          mode: 'DAILY',
          domainId: -1,
          topicLabel: `Daily #${sum.broadcastNumber}`,
          utcDate: sum.utcDate,
          totalScore: dailyFinalScore,
        });
        const dailyLb = this.buildSummaryLeaderboard({
          scope: 'DAILY',
          topicKey: `daily:${sum.utcDate}`,
          topicLabel: `Global Feed #${sum.broadcastNumber}`,
          utcDate: sum.utcDate,
          playerScore: dailyFinalScore,
        });
        this.pausePassive2DActors();
        void this.stage3d.showChampionshipTrophy(0);
        this.screen = 'SUMMARY';
        this.activeSummaryVm = {
          mode: 'DAILY',
          victory: true,
          headline: `GLOBAL FEED #${sum.broadcastNumber} · ${sum.topPercentBanner.toUpperCase()}`,
          subheadline: `Daily Streak: ${sum.dailyStreak}d · ${sum.emojiRow}`,
          challengerName: sum.challengerName,
          playerScore: dailyFinalScore,
          correctCount: sum.correctCount,
          totalCount: sum.totalQuestions,
          bestStreak: maxRunStreak,
          dailyShareText: sum.shareText,
          duelShareUrl: dailyDuelUrl,
          leaderboard: dailyLb,
        };
        this.hud.renderMatchSummary(this.activeSummaryVm);
        return;
      }

      if (this.matchCtx.kind === 'BRIEFING') {
        const ctx = this.matchCtx;
        const nextQ = this.briefingMode.getCurrentQuestion();
        if (nextQ && !this.pendingBriefingSummary) {
          ctx.index += 1;
          const launchBriefingQ = async (
            chosenQ: PrismQuestion,
            isFinalePicked = false,
          ): Promise<void> => {
            await this.beginQuestionOnStage(chosenQ, {
              modeLabel: this.liveVm?.modeLabel ?? 'BRIEFING',
              chyronTitle: 'THE BRIEFING ROOM',
              chyronSub: ctx.domainsLabel,
              questionIndex: ctx.index,
              questionTotal: ctx.total,
              playerScore: this.liveVm?.playerScore ?? 0,
              streak: this.liveVm?.streak ?? 0,
              rivalId: 'nadia',
              rivalName: 'Nadia',
              rivalScore: 0,
              rivalStatus: 'HIDDEN',
              actorId: 'nadia',
              actorName: 'Nadia Al-Mansoor',
              actorExpression: 'neutral',
              tellLine: isFinalePicked
                ? 'Final Category locked — give it your best shot!'
                : '12-Domain Skill Radar updating live.',
              isFinaleQuestion: isFinalePicked,
            });
          };

          // Mandate #7: Finale Category Picker before the final question of Briefing runs (`>= 4` Qs)!
          if (ctx.total >= 4 && ctx.index === ctx.total - 1) {
            const prefDom =
              ctx.domainId >= 0 && ctx.domainId <= 11 ? (ctx.domainId as DomainId) : null;
            const finaleOptions = buildFinaleCategoryOptions(forgeEngine, prefDom, 3);
            const hasJackpot = this.activeGambitSession?.equippedId === 'FINALE_JACKPOT';
            this.presentFinaleCategoryPicker(
              {
                chyronTitle: 'THE BRIEFING ROOM · FINAL QUESTION',
                chyronSub: ctx.domainsLabel,
                headline: 'Final Question: Choose Your Category',
                subheadline: 'Choose 1 of 3 domains for your closing question!',
                jackpotNote: hasJackpot
                  ? '★ VAULT JACKPOT ACTIVE: 2.5× Final Payout & Zero Double-Down Penalty!'
                  : '✦ Final Question — Toggle 2× Double Down if you feel confident!',
                options: finaleOptions.map((o) => ({
                  domainId: o.domainId,
                  title: o.title,
                  subtitle: o.subtitle,
                  medallionUrl: o.medallionUrl,
                  isStrongest: o.isRecommended,
                })),
              },
              async (pickedDomainId) => {
                const pickedQ = await pickFinaleQuestionForCategoryAsync(
                  forgeEngine,
                  pickedDomainId as DomainId,
                  ctx.difficultyPreset,
                  {
                    excludeQids: ctx.questions.map((item) => item.qid),
                    timerSec: nextQ.timerSec,
                  },
                );
                ctx.questions[ctx.index] = pickedQ;
                await launchBriefingQ(pickedQ, true);
              },
            );
            return;
          }

          await launchBriefingQ(nextQ, false);
          return;
        }

        const sum = this.pendingBriefingSummary!;
        this.pendingBriefingSummary = null;
        const briefingFinalScore = sum.totalScore + this.matchExtraBonusPoints;
        const wonBriefing = sum.correctCount >= Math.ceil(sum.totalQuestions * 0.5);
        mindGambitStore.recordMatchProgress({
          won: wonBriefing,
          maxStreak: sum.maxStreak,
          firstClueSnipes: this.matchFirstClueSnipes,
          gambitTriggered: Boolean(this.activeGambitSession?.hasTriggeredAnyEffect()),
        });
        this.notifyMetaMatchCompleted({
          mode: 'BRIEFING',
          won: wonBriefing,
          correctCount: sum.correctCount,
          totalQuestions: sum.totalQuestions,
          score: briefingFinalScore,
          peelsUsed: this.matchPeelsUsed,
          max6xOverclockWinsInMatch: this.matchMax6xWins,
          difficultyPreset: ctx.difficultyPreset,
        });
        const briefDuelUrl = this.buildDuelShareUrlForCurrentMatch({
          mode: 'BRIEFING',
          domainId: ctx.domainId,
          l1Id: ctx.l1Id,
          l2Id: ctx.l2Id,
          topicLabel: (ctx.topicLabel || sum.domainsLabel).slice(0, 28),
          totalScore: briefingFinalScore,
        });
        const briefLb = this.buildSummaryLeaderboard({
          scope: 'SUBCATEGORY',
          topicKey: ctx.l2Id || ctx.l1Id || (ctx.domainId >= 0 ? `domain:${ctx.domainId}` : 'global'),
          topicLabel: ctx.topicLabel || sum.domainsLabel,
          playerScore: briefingFinalScore,
        });
        this.pausePassive2DActors();
        void this.stage3d.showChampionshipTrophy(0);
        this.screen = 'SUMMARY';
        this.activeSummaryVm = {
          mode: 'BRIEFING',
          victory: wonBriefing,
          headline: 'BRIEFING CALIBRATION COMPLETE',
          subheadline: `${sum.domainsLabel} · ${formatDifficultyPresetLabel(sum.difficulty)}`,
          challengerName: sum.challengerName,
          playerScore: briefingFinalScore,
          correctCount: sum.correctCount,
          totalCount: sum.totalQuestions,
          bestStreak: sum.maxStreak,
          duelShareUrl: briefDuelUrl,
          leaderboard: briefLb,
        };
        this.hud.renderMatchSummary(this.activeSummaryVm);
        return;
      }

      if (this.matchCtx.kind === 'ENDLESS') {
        const step = this.pendingEndlessStep;
        this.pendingEndlessStep = null;
        if (!step) {
          this.enterHub('ENDLESS');
          return;
        }

        if (step.runEndedSummary) {
          const s = step.runEndedSummary;
          const endlessFinalScore = s.finalBankedScore + this.matchExtraBonusPoints;
          mindGambitStore.recordMatchProgress({
            won: s.extractedCleanly,
            maxStreak: s.maxStreak,
            firstClueSnipes: this.matchFirstClueSnipes,
            gambitTriggered: Boolean(this.activeGambitSession?.hasTriggeredAnyEffect()),
          });
          this.notifyMetaMatchCompleted({
            mode: 'ENDLESS',
            won: s.extractedCleanly,
            correctCount: s.correctCount,
            totalQuestions: Math.max(1, s.depthCleared),
            score: endlessFinalScore,
            shieldsLost: this.matchShieldsLost,
            peelsUsed: this.matchPeelsUsed,
            max6xOverclockWinsInMatch: this.matchMax6xWins,
            endlessDepthReached: s.depthCleared,
          });
          this.pausePassive2DActors();
          if (!s.extractedCleanly) {
            this.stage3d.triggerMissionFailedState();
          }
          this.screen = 'SUMMARY';
          this.activeSummaryVm = {
            mode: 'ENDLESS',
            victory: s.extractedCleanly,
            headline: s.extractedCleanly
              ? 'ARCHIVE HAUL BANKED!'
              : 'SHIELDS SHATTERED — EMERGENCY EXTRACT',
            subheadline: `Reached Depth ${s.depthCleared} (${s.strataReached})`,
            challengerName: s.challengerName,
            playerScore: endlessFinalScore,
            correctCount: s.correctCount,
            totalCount: Math.max(1, s.depthCleared),
            bestStreak: s.maxStreak,
          };
          this.hud.renderMatchSummary(this.activeSummaryVm);
          return;
        }

        if (step.airlockReached) {
          const air = step.airlockReached;
          const airExt = air as typeof air & { correctCount?: number; maxStreak?: number };
          const airCorrect =
            typeof airExt.correctCount === 'number'
              ? airExt.correctCount
              : this.endlessRunCorrectCount;
          const airBestStreak =
            typeof airExt.maxStreak === 'number'
              ? airExt.maxStreak
              : this.endlessRunMaxStreak;
          const airlockNum = Math.max(1, Math.floor(air.depthReached / 5));
          const wave2Log = this.wave2Narrative.getArchiveLoreLog(airlockNum);
          this.pausePassive2DActors();
          void this.stage3d.showChampionshipTrophy(0);
          this.screen = 'SUMMARY';
          this.activeSummaryVm = {
            mode: 'ENDLESS',
            victory: true,
            headline: `EXTRACTION AIRLOCK · DEPTH ${air.depthReached} CLEARED`,
            subheadline: wave2Log
              ? `${wave2Log.code} — ${wave2Log.title}: “${wave2Log.body}”`
              : `${air.loreLogTitle}: “${air.loreLogText}”`,
            challengerName: this.passport.getChallengerName(),
            playerScore: air.totalExtractableScore + this.matchExtraBonusPoints,
            correctCount: airCorrect,
            totalCount: air.depthReached,
            bestStreak: airBestStreak,
            endlessCanContinueFloor: air.depthReached + 1,
            endlessShieldsLeft: air.shields,
          };
          this.hud.renderMatchSummary(this.activeSummaryVm);
          return;
        }

        if (step.nextQuestion) {
          const hud = step.hud;
          const floorQIndex = (hud.depth - 1) % 5;
          const launchEndlessQ = async (
            chosenQ: PrismQuestion,
            isFinalePicked = false,
          ): Promise<void> => {
            await this.beginQuestionOnStage(chosenQ, {
              modeLabel: `${hud.strataTitle} (${hud.strataMultiplier}x)`,
              chyronTitle: `ARCHIVE DESCENT · DEPTH ${hud.depth}`,
              chyronSub: hud.strataTitle,
              questionIndex: floorQIndex,
              questionTotal: 5,
              playerScore: hud.totalLiveScore + this.matchExtraBonusPoints,
              streak: hud.overclockRepairStreak,
              shields: hud.shields,
              rivalId: 'tariq',
              rivalName: 'Tariq',
              rivalScore: 0,
              rivalStatus: 'HIDDEN',
              actorId: 'tariq',
              actorName: 'Archive Core Telemetry',
              actorExpression: 'neutral',
              tellLine: `Safe Banked: ${hud.bankedSafeScore.toLocaleString()} PTS · Unbanked Haul: ${hud.unbankedFloorHaul.toLocaleString()} PTS`,
              isFinaleQuestion: isFinalePicked,
            });
          };

          // Mandate #7: Finale Category Picker before Q5 (Airlock Gate) of every Endless floor!
          if (floorQIndex === 4) {
            const finaleOptions = buildFinaleCategoryOptions(forgeEngine, null, 3);
            const hasJackpot = this.activeGambitSession?.equippedId === 'FINALE_JACKPOT';
            this.presentFinaleCategoryPicker(
              {
                chyronTitle: `ARCHIVE DESCENT · AIRLOCK GATE (DEPTH ${hud.depth})`,
                chyronSub: hud.strataTitle,
                headline: 'Airlock Finale: Choose Your Category',
                subheadline: 'Clear this final floor question to reach the Safe Extraction Airlock!',
                jackpotNote: hasJackpot
                  ? '★ VAULT JACKPOT ACTIVE: 2.5× Final Payout & Zero Double-Down Penalty!'
                  : `✦ ${hud.strataMultiplier}× Strata Multiplier active on this Airlock Question!`,
                options: finaleOptions.map((o) => ({
                  domainId: o.domainId,
                  title: o.title,
                  subtitle: o.subtitle,
                  medallionUrl: o.medallionUrl,
                  isStrongest: o.isRecommended,
                })),
              },
              async (pickedDomainId) => {
                const pickedQ = await pickFinaleQuestionForCategoryAsync(
                  forgeEngine,
                  pickedDomainId as DomainId,
                  step.nextQuestion!.difficultyTier ?? 'ADAPTIVE',
                  {
                    excludeQids: [step.nextQuestion!.qid],
                    timerSec: step.nextQuestion!.timerSec,
                  },
                );
                replacePrismQuestionInPlace(step.nextQuestion!, pickedQ);
                await launchEndlessQ(step.nextQuestion!, true);
              },
            );
            return;
          }

          await launchEndlessQ(step.nextQuestion, false);
        }
        return;
      }

      if (this.matchCtx.kind === 'TRIALS') {
        const nextQ = this.trialsMode.getCurrentQuestion();
        if (nextQ && !this.pendingTrialsSummary) {
          this.matchCtx.index += 1;
          await this.beginQuestionOnStage(nextQ, {
            modeLabel: this.liveVm.modeLabel,
            chyronTitle: this.liveVm.chyronTitle,
            chyronSub: this.liveVm.chyronSub,
            questionIndex: this.matchCtx.index,
            questionTotal: this.matchCtx.total,
            playerScore: this.liveVm.playerScore,
            streak: this.liveVm.streak,
            rivalId: this.liveVm.rivalId,
            rivalName: this.matchCtx.opponentHandle,
            rivalScore: this.liveVm.rivalScore,
            rivalStatus: 'THINKING',
            actorId: this.liveVm.actorId,
            actorName: this.matchCtx.opponentHandle,
            actorExpression: 'neutral',
            tellLine: this.liveVm.tellLine,
            peelSealed: this.liveVm.peelSealedByJammer,
            isFinaleQuestion: this.matchCtx.index === this.matchCtx.total - 1,
          });
          return;
        }

        const sum = this.pendingTrialsSummary!;
        const isBlackSalon = this.matchCtx.isBlackSalon;
        this.pendingTrialsSummary = null;
        const trialsFinalScore = sum.playerScore + this.matchExtraBonusPoints;
        mindGambitStore.recordMatchProgress({
          won: sum.won,
          maxStreak: sum.maxStreak,
          firstClueSnipes: this.matchFirstClueSnipes,
          gambitTriggered: Boolean(this.activeGambitSession?.hasTriggeredAnyEffect()),
        });
        if (isBlackSalon && sum.won) {
          this.metaSuite.recordSpecialFeat('BLACK_SALON_VICTORY');
        }
        this.notifyMetaMatchCompleted({
          mode: isBlackSalon ? 'BLACK_SALON' : 'TRIALS',
          hubId: isBlackSalon ? 'is' : 'sg',
          won: sum.won,
          correctCount: sum.correctCount,
          totalQuestions: sum.totalQuestions,
          score: trialsFinalScore,
          isBlackSalon,
          peelsUsed: this.matchPeelsUsed,
          max6xOverclockWinsInMatch: this.matchMax6xWins,
        });
        const trialsDuelUrl = this.buildDuelShareUrlForCurrentMatch({
          mode: 'TRIALS',
          domainId: -1,
          topicLabel: isBlackSalon ? 'Black Salon Blitz' : 'Council Trials Duel',
          totalScore: trialsFinalScore,
        });
        const trialsLb = this.buildSummaryLeaderboard({
          scope: 'SUBCATEGORY',
          topicKey: 'trials:global',
          topicLabel: isBlackSalon ? 'Black Salon Blitz' : 'Council Trials',
          playerScore: trialsFinalScore,
        });
        this.pausePassive2DActors();
        void this.stage3d.showChampionshipTrophy(0);
        this.screen = 'SUMMARY';
        this.activeSummaryVm = {
          mode: 'TRIALS',
          victory: sum.won,
          headline: sum.won
            ? `TRIAL VICTORY VS ${sum.opponentHandle.toUpperCase()}!`
            : 'GHOST DUEL COMPLETE',
          subheadline: `Trials Elo: ${sum.newTrialsElo} (${sum.eloDelta >= 0 ? `+${sum.eloDelta}` : sum.eloDelta}) · +${sum.factionPointsAwarded} Bloc Pts`,
          challengerName: sum.challengerName,
          playerScore: trialsFinalScore,
          rivalName: sum.opponentHandle,
          rivalScore: sum.ghostScore,
          correctCount: sum.correctCount,
          totalCount: sum.totalQuestions,
          bestStreak: sum.maxStreak,
          dailyShareText: sum.shareableGhostCode,
          duelShareUrl: trialsDuelUrl,
          leaderboard: trialsLb,
        };
        this.hud.renderMatchSummary(this.activeSummaryVm);
      }
    } finally {
      this.isAdvancingQuestion = false;
    }
  }

  // ==========================================================================
  // META-PROGRESSION SUITE (PASSPORT 2.0, OBSERVATORY, ATELIER, FACTIONS) & DOSSIER
  // ==========================================================================

  private closeAllModals(clearReturnModalSnap = true): void {
    const hadModal =
      this.metaSuite.isOpen() ||
      Boolean(this.dossierModal?.isOpen()) ||
      Boolean(this.briefingModal?.isOpen()) ||
      Boolean(this.saveSlotsModal?.isOpen()) ||
      this.hud.isRulesModalOpen() ||
      this.leaveConfirmModalEl !== null ||
      this.restartFromStartModalEl !== null;
    this.hud.closeVaultDrawer();
    this.hud.closeVisualLightbox();
    this.hud.closeRulesModal();
    this.metaSuite.closeAll(false);
    this.dossierModal?.close();
    this.briefingModal?.close();
    this.saveSlotsModal?.close();
    this.closeLeaveConfirmModal();
    this.closeRestartFromStartModal();
    if (clearReturnModalSnap) {
      this.navigationReturnStack = this.navigationReturnStack.filter(
        (s) => s.kind !== 'MODAL',
      );
    }
    document.documentElement.classList.remove('ws-3d-showcase-open');
    if (hadModal) {
      void this.restore3DAfterModal();
    }
  }

  private openPassportModal(playStampCeremony = false): void {
    this.pushNavigationReturnSnapshot('MODAL', true);
    this.stopAnyActiveOverclockAudio();
    this.dossierModal?.close();
    this.briefingModal?.close();
    this.saveSlotsModal?.close();
    document.documentElement.classList.add('ws-3d-showcase-open');
    this.metaSuite.openPassport('CREDENTIALS', playStampCeremony);
  }

  private openAnalyticsModal(): void {
    this.pushNavigationReturnSnapshot('MODAL', true);
    this.stopAnyActiveOverclockAudio();
    this.dossierModal?.close();
    this.briefingModal?.close();
    this.saveSlotsModal?.close();
    document.documentElement.classList.remove('ws-3d-showcase-open');
    this.metaSuite.openAnalytics('ALL_TIME');
  }

  private openHonoursModal(): void {
    this.pushNavigationReturnSnapshot('MODAL', true);
    this.stopAnyActiveOverclockAudio();
    this.dossierModal?.close();
    this.briefingModal?.close();
    this.saveSlotsModal?.close();
    document.documentElement.classList.remove('ws-3d-showcase-open');
    this.metaSuite.openHonours();
  }

  private openObservatoryModal(): void {
    this.pushNavigationReturnSnapshot('MODAL', true);
    this.stopAnyActiveOverclockAudio();
    this.dossierModal?.close();
    this.briefingModal?.close();
    this.saveSlotsModal?.close();
    document.documentElement.classList.add('ws-3d-showcase-open');
    this.metaSuite.openObservatory('RELICS_3D', 'championship_trophy');
  }

  private openMasteryReviewDeckModal(): void {
    this.pushNavigationReturnSnapshot('MODAL', true);
    this.stopAnyActiveOverclockAudio();
    this.dossierModal?.close();
    this.briefingModal?.close();
    this.saveSlotsModal?.close();
    document.documentElement.classList.add('ws-3d-showcase-open');
    this.metaSuite.openMasteryReviewDeck(true);
  }

  private openAtelierModal(): void {
    this.pushNavigationReturnSnapshot('MODAL', true);
    this.stopAnyActiveOverclockAudio();
    this.dossierModal?.close();
    this.briefingModal?.close();
    this.saveSlotsModal?.close();
    document.documentElement.classList.add('ws-3d-showcase-open');
    this.metaSuite.openAtelier();
  }

  private openFactionsModal(): void {
    this.pushNavigationReturnSnapshot('MODAL', true);
    this.stopAnyActiveOverclockAudio();
    this.dossierModal?.close();
    this.briefingModal?.close();
    this.saveSlotsModal?.close();
    this.metaSuite.openFactions();
  }

  private async openDossierModal(): Promise<void> {
    this.pushNavigationReturnSnapshot('MODAL');
    this.stopAnyActiveOverclockAudio();
    this.metaSuite.closeAll(false);
    this.briefingModal?.close();
    this.saveSlotsModal?.close();
    document.documentElement.classList.remove('ws-3d-showcase-open');

    const modal = await this.getDossierModal();
    const dVm = this.dossier.buildViewModel();
    modal.open(
      {
        challengerName: dVm.challengerName,
        boardTitle: dVm.boardTitle,
        boardSubtitle: dVm.conspiracyStageLabel,
        act3Branch: this.blackboard.getSnapshot().act3Branch,
        suspects: dVm.suspects.map((s) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          status_hint: s.statusHint,
          bondLabel: `${s.role} · ${s.bondTier}`,
        })),
        clues: dVm.clues.map((c) => ({
          id: c.id,
          number: c.number,
          title: c.title,
          city_id: c.cityId,
          city_label: c.cityLabel,
          unlock_mission: c.unlockMissionId,
          suspect_id: c.suspectId,
          category: c.category,
          summary: c.displaySummary,
          red_thread_to: c.redThreadTo,
          board_pos: c.boardPos,
          unlocked: c.unlocked,
        })),
      },
      () => {
        this.navigationReturnStack = this.navigationReturnStack.filter(
          (s) => s.kind !== 'MODAL',
        );
        void this.restore3DAfterModal();
      },
    );
  }

  private syncVaultLiveStatus(): void {
    const srsSummary = this.metaSuite.getSrsDeckSummary();
    const totals = this.metaSuite.getCatalogTotals();
    const honoursUnlocked = this.metaSuite.honoursSystem
      .getAllProgress()
      .filter((h) => h.unlocked).length;
    this.hud.setVaultLiveStatus({
      srsDueCount: srsSummary.dueCount,
      srsTotalCount: srsSummary.totalCards,
      isOnline: this.offlineStatusSnapshot.isOnline,
      swReady: this.offlineStatusSnapshot.swReady,
      offlinePacksReady: [...this.offlineStatusSnapshot.packsReady],
      offlineDownloadingLabel: this.offlineDownloadingLabel,
      honoursTotal: totals.honours,
      honoursUnlocked,
      atelierFinishesTotal: totals.finishes,
    });
  }

  private async handleDownloadOfflinePack(): Promise<void> {
    if (this.offlineDownloadingLabel) return;
    this.offlineDownloadingLabel = '0%';
    this.syncVaultLiveStatus();
    try {
      const pwa = await this.getOfflineClient();
      const res = await pwa.downloadOfflinePack('BASEBALL_PRO', (done, total) => {
        const pct = total > 0 ? Math.min(99, Math.round((done / total) * 100)) : 50;
        this.offlineDownloadingLabel = `${pct}%`;
        this.syncVaultLiveStatus();
      });
      this.offlineStatusSnapshot = await pwa.refreshOfflineVaultStatus();
      if (res.packsReady.length > 0 || this.offlineStatusSnapshot.packsReady.length > 0) {
        this.metaSuite.recordSpecialFeat('OFFLINE_PACK_CACHED');
      }
    } catch {
      // Keep UI responsive even in restricted offline test environments
    } finally {
      this.offlineDownloadingLabel = null;
      this.syncVaultLiveStatus();
    }
  }

  private buildDuelShareUrlForCurrentMatch(opts: {
    mode: DuelMode;
    domainId: number;
    l1Id?: string;
    l2Id?: string;
    topicLabel?: string;
    utcDate?: string;
    totalScore: number;
  }): string | undefined {
    if (this.currentMatchRecordedQids.length === 0) return undefined;
    try {
      const faction = (this.blackboard.getSnapshot().pledgedFaction ?? 'AGORA') as FactionId;
      const elo = forgeEngine.getSkillSnapshot().globalElo;
      const cleanDate = opts.utcDate ?? new Date().toISOString().slice(0, 10);
      const baseHref =
        typeof window !== 'undefined' ? new URL('./', window.location.href).href : undefined;
      return buildShareableDuelUrl(
        {
          version: 2,
          mode: opts.mode,
          challengerName: this.passport.getChallengerName(),
          faction,
          elo,
          utcDateCode: opts.mode === 'DAILY' ? utcDateToCode(cleanDate) : 0,
          utcDate: opts.mode === 'DAILY' ? cleanDate : undefined,
          domainId: opts.domainId,
          l1Id: opts.l1Id,
          l2Id: opts.l2Id,
          topicLabel: opts.topicLabel?.slice(0, 28),
          qids: [...this.currentMatchRecordedQids],
          splits: [...this.currentMatchRecordedSplits],
          totalScore: Math.max(0, Math.round(opts.totalScore)),
        },
        baseHref,
      );
    } catch {
      return undefined;
    }
  }

  private buildSummaryLeaderboard(opts: {
    scope: 'DAILY' | 'SUBCATEGORY';
    topicKey: string;
    topicLabel: string;
    utcDate?: string;
    playerScore: number;
  }): LeaderboardCohortSnapshot | null {
    try {
      const playerName = this.passport.getChallengerName();
      const faction = (this.blackboard.getSnapshot().pledgedFaction ?? 'AGORA') as FactionId;
      const elo = forgeEngine.getSkillSnapshot().globalElo;
      const dateStr = opts.utcDate ?? new Date().toISOString().slice(0, 10);
      if (opts.scope === 'DAILY') {
        return getDailyGlobalLeaderboard(dateStr, playerName, opts.playerScore, faction);
      }
      return getSubcategoryLeaderboard(
        opts.topicKey,
        playerName,
        opts.playerScore,
        elo,
        undefined,
        dateStr,
        faction,
      );
    } catch {
      return null;
    }
  }

  private async handleShareDuelLink(
    url: string,
    title: string,
    text: string,
  ): Promise<boolean> {
    this.metaSuite.recordSpecialFeat('DUEL_CHALLENGE_PLAYED');
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title, text, url });
        return true;
      }
    } catch {
      // User dismissed native share sheet or unsupported — fall through cleanly to clipboard!
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        return true;
      }
    } catch {
      // Clipboard restricted in non-HTTPS iframe
    }
    return true;
  }

  /**
   * #145 P1 #5: Full lossless 3D stage restoration after closing Passport / Observatory / Atelier / Dossier!
   */
  private async restore3DAfterModal(): Promise<void> {
    if (this.screen === 'TITLE') {
      await this.stage3d.showTitleShowcase('ch');
      this.stage3d.setLightingMode('BROADCAST');
      this.metaSuite.applyEquippedFinish();
      return;
    }
    if (this.screen === 'HUB') {
      await this.syncHub3DGlobe();
      return;
    }
    if (this.screen === 'REGISTRATION') {
      await this.stage3d.showTitleShowcase('ch');
      this.stage3d.setLightingMode('INTERVIEW');
      this.stage3d.setCameraShot('INTERVIEW_CLOSEUP');
      this.metaSuite.applyEquippedFinish();
      return;
    }
    if (this.screen === 'GAMEPLAY' && this.liveVm) {
      const vm = this.liveVm;
      const q = vm.question;
      const isCampaign = this.matchCtx?.kind === 'CAMPAIGN';
      const hasHorizon = isCampaign && this.blackboard.hasPerk('HORIZON_LENS');
      const hasPeoples = isCampaign && this.blackboard.hasPerk('PEOPLES_LENS');

      await this.stage3d.presentQuestion(q, {
        initialFacetIndex: vm.selectedFacetIndex,
        horizonLens: hasHorizon,
        peoplesLens: hasPeoples,
        peelLocked: vm.peelSealedByJammer,
        synthesisStepIndex: vm.heroStepIndex,
      });
      this.metaSuite.applyEquippedFinish();

      // Re-apply active Peel Tier & shattered facets
      if (vm.peelTier >= 2) {
        this.stage3d.triggerPeel();
      }
      if (vm.peelTier >= 3) {
        this.stage3d.triggerPeel(vm.shatteredFacetIndices);
      }
      for (const sIdx of vm.shatteredFacetIndices) {
        this.stage3d.redactFacet(sIdx);
      }

      // Re-apply Calibrator / Codex / Globe Pin-Drop positions
      if (q.archetype === 'CALIBRATOR_DIAL' && q.calibrator) {
        this.stage3d.setCalibratorValue(vm.calibratorEstimate);
        const coneSpec = q.calibrator.toleranceCones.find((c) => c.id === vm.calibratorCone);
        if (coneSpec) {
          const frac = coneSpec.pctOfSpan > 1 ? coneSpec.pctOfSpan / 100 : coneSpec.pctOfSpan;
          this.stage3d.setCalibratorTolerance(frac, `${coneSpec.multiplier.toFixed(1)}x`);
        }
      } else if (q.archetype === 'CODEX_DUAL_RING') {
        this.stage3d.spinCodexRing('TOP', 0, false);
        this.stage3d.spinCodexRing('BOTTOM', vm.codexTargetSelections[0] ?? 0, false);
        this.syncCodexConduitsTo3D();
      } else if (q.archetype === 'GLOBE_PIN_DROP' && vm.selectedGlobeCoords) {
        this.stage3d.setGlobeCandidatePin(
          vm.selectedGlobeCoords.lat,
          vm.selectedGlobeCoords.lon,
          false,
        );
      }

      // Re-apply Reveal state if already locked
      if (vm.revealed) {
        const gp = q.globePin;
        this.stage3d.resolveOutcome({
          correct: vm.revealed.correct,
          correctIndex: vm.revealed.correctFacetIndex,
          selectedIndex: vm.revealed.selectedFacetIndex,
          wasOverclocked: vm.revealed.overclockMultiplier > 1.01,
          exactCalibratorVal: q.calibrator?.exactVal,
          globeReveal:
            q.archetype === 'GLOBE_PIN_DROP' && gp
              ? {
                  targetLat: gp.targetLat,
                  targetLon: gp.targetLon,
                  candidateLat: vm.selectedGlobeCoords?.lat,
                  candidateLon: vm.selectedGlobeCoords?.lon,
                  distanceKm: vm.revealed.globeDistanceKm,
                  targetLabel: gp.targetLabel,
                }
              : undefined,
        });
      }
    }
  }

  public dispose(): void {
    this.stopTelemetryLoop();
    if (this.boundPopState && typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.boundPopState);
      this.boundPopState = null;
    }
    this.offlineUnsubscribe?.();
    this.offlineUnsubscribe = null;
    this.hud.closeVisualLightbox();
    this.hud.closeRulesModal();
    this.motionCinema?.dispose();
    this.bossBanner?.dispose();
    this.endingDirector?.dispose();
    this.metaSuite.dispose();
    this.dossierModal?.close();
    this.briefingModal?.close();
    this.saveSlotsModal?.close();
    this.closeLeaveConfirmModal();
    this.closeRestartFromStartModal();
    this.ergonomics.dispose();
    this.characterRig.dispose();
    this.vfx.dispose();
    this.audio.dispose();
    this.stage3d.dispose();
  }

  // ==========================================================================
  // #166, #171, #329 & V2.0: META ANALYTICS, LEITNER SRS, 84 HONOURS & 5-SLOT SAVES
  // ==========================================================================

  private notifyMetaQuestionOutcome(
    q: PrismQuestion,
    sub: PrismAnswerSubmission,
    scored: ScoredQuestionResult,
    lockedClueLadderStep?: 1 | 2 | 3,
  ): void {
    const skillSnap = forgeEngine.getSkillSnapshot();
    const modeStr =
      this.matchCtx?.kind === 'TRIALS' && this.matchCtx.isBlackSalon
        ? 'BLACK_SALON'
        : this.matchCtx?.kind ?? 'CAMPAIGN';
    const hubId =
      this.matchCtx?.kind === 'CAMPAIGN' ? this.matchCtx.mission.hubId : this.selectedCityHub;
    const isFirstTryCodex =
      q.archetype === 'CODEX_DUAL_RING' && scored.correct && this.questionCodexMoves <= 3;

    // Upgrade #5: Feed EVERY answered question into 5-Box Leitner Spaced-Repetition Deck!
    this.metaSuite.ingestSpacedRepetitionOutcome({
      qid: q.qid,
      prompt: q.prompt,
      correctAnswer: scored.correctAnswerDisplay,
      distractors: q.facets.filter((f) => !f.isCorrect).map((f) => f.text),
      whyExplanation: scored.whyExplanation,
      domainId: q.l0Domain,
      subcatLabel: q.l2Subcategory || q.l1Category,
      wasCorrect: scored.correct,
    });

    this.metaSuite.recordQuestionOutcome({
      ts: Date.now(),
      qid: q.qid,
      domainId: q.l0Domain,
      mode: modeStr,
      hubId,
      archetype: q.archetype,
      subcatLabel: q.l2Subcategory || q.l1Category,
      clueLadderStep: lockedClueLadderStep,
      mindGambitId: this.activeGambitSession?.equippedId,
      mindGambitTriggered: this.questionMindGambitTriggered,
      finaleCategoryPicked: this.questionFinaleCategoryPicked,
      correct: scored.correct,
      peelTier: sub.peelTier,
      overclockCharge01: sub.overclockCharge,
      backfired: scored.backfired,
      bluffCalled: this.questionBluffCalled,
      bluffEchoCancelled: this.questionBluffEchoCancelled,
      bullseye: scored.bullseye,
      firstTryCodex: isFirstTryCodex,
      responseTimeMs: Math.round(sub.elapsedSec * 1000),
      pointsDelta: scored.pointsEarned,
      eloAfter: skillSnap.globalElo,
      promptSnippet: q.prompt,
      answerLabel: scored.correctAnswerDisplay,
      difficultyTier: q.difficultyTier,
      globeDistanceKm: scored.globeDistanceKm,
      hasVisualPlate: Boolean(q.visualPlate?.imageUrl),
    });

    this.syncVaultLiveStatus();
  }

  private notifyMetaMatchCompleted(
    input: Parameters<MetaProgressionSuite['recordMatchCompleted']>[0],
  ): void {
    this.metaSuite.recordMatchCompleted({
      ...input,
      mindGambitUsed: input.mindGambitUsed ?? this.activeGambitSession?.equippedId,
      secondWindTriggered: input.secondWindTriggered ?? this.matchSecondWindTriggered,
      finaleCategoryWon: input.finaleCategoryWon ?? this.matchFinaleCategoryWon,
    });
    // Flush Passport/Blackboard/Honours mutations into active Save Slot so page reload never wipes them
    this.saveSlotManager.saveActiveSlot();
    this.syncVaultLiveStatus();
  }

  protected notifyMetaSpecialFeat(
    featId: SpecialFeatKind,
    detail?: Parameters<MetaProgressionSuite['recordSpecialFeat']>[1],
  ): void {
    this.metaSuite.recordSpecialFeat(featId, detail);
  }

  private openRestartFromStartModal(cityFirstMissionId?: string): void {
    this.closeRestartFromStartModal();
    this.stopAnyActiveOverclockAudio();

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-label', 'Restart From Start Options');
    backdrop.innerHTML = `
      <div class="ws-modal-panel" style="max-width:520px;gap:14px;">
        <div class="ws-modal-sticky-header">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:800;color:var(--gold-bright);letter-spacing:0.06em;">
            ⏮ RESTART FROM START
          </div>
          <button type="button" class="ws-btn-obsidian" id="ws-rfs-cancel">← BACK</button>
        </div>
        <p style="margin:0;font-size:13px;line-height:1.45;color:var(--ivory-primary);">
          Choose whether to restart the current City Sanctuary from Mission 1, or reset your active Campaign Save Slot all the way back to Act 0 Geneva Vetting (Career Analytics &amp; Hall of Honours remain preserved).
        </p>
        <div style="display:flex;flex-direction:column;gap:9px;">
          ${
            cityFirstMissionId
              ? `<button type="button" class="ws-btn-gold" id="ws-rfs-city">↺ RESTART CURRENT CITY FROM MISSION 1 ▶</button>`
              : ''
          }
          <button type="button" class="ws-btn-obsidian" id="ws-rfs-campaign" style="border:none;box-shadow:inset 3px 0 0 var(--crimson-alert);color:#ff9ca8;">
            ⏮ RESTART ENTIRE CAMPAIGN FROM ACT 0 GENEVA
          </button>
        </div>
      </div>
    `;

    backdrop.querySelector('#ws-rfs-cancel')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.closeRestartFromStartModal();
    });
    backdrop.querySelector('#ws-rfs-city')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.closeRestartFromStartModal();
      if (cityFirstMissionId) {
        const targetHub = (cityFirstMissionId.split('_')[0] || 'ch') as HubId;
        const resetMissionId = this.campaign.restartCurrentCityFromStart(targetHub);
        for (const k of Array.from(this.localFailedMissions.keys())) {
          if (k.startsWith(`${targetHub}_`)) this.localFailedMissions.delete(k);
        }
        this.saveSlotManager.saveActiveSlot();
        void this.launchCampaignMission(resetMissionId || cityFirstMissionId);
      }
    });
    backdrop.querySelector('#ws-rfs-campaign')?.addEventListener('click', () => {
      this.haptics.shatterPlate();
      this.audio.playSfx('glass_shatter');
      this.closeRestartFromStartModal();
      this.resetActiveCampaignToAct0Start();
    });
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) this.closeRestartFromStartModal();
    });

    document.body.appendChild(backdrop);
    this.restartFromStartModalEl = backdrop;
  }

  private closeRestartFromStartModal(): void {
    if (this.restartFromStartModalEl) {
      this.restartFromStartModalEl.remove();
      this.restartFromStartModalEl = null;
    }
  }

  private resetActiveCampaignToAct0Start(): void {
    const activeSlot = this.saveSlotManager.getActiveSlotId();
    this.saveSlotManager.resetSlotToCampaignStart(activeSlot);
    this.localFailedMissions.clear();
    this.playedCutsceneIds.clear();
    this.selectedCityHub = 'ch';
    this.startFullPrologueFlow();
  }

  private buildSaveSlotCards(): CampaignSlotCardView[] {
    return this.saveSlotManager.listSlots().map((meta) => ({
      slotId: meta.slotId,
      isEmpty: meta.isEmpty,
      isActive: meta.isActive,
      challengerName: meta.challengerName,
      personaLabel: meta.personaTitle ?? 'Candidate',
      currentActOrCity: `${meta.currentActLabel} · ${meta.currentCity}`,
      visasCleared: meta.visasCount,
      relicsUnlocked: meta.relicsCount,
      missionsCompleted: meta.completedMissionsCount,
      totalMissions: meta.totalMissionsCount,
      completionPct: meta.completionPct,
      completionLabel: meta.completionLabel,
      estimatedRemainingLabel: meta.estimatedRemainingLabel,
      failedAttemptsCount: meta.failedAttemptsCount,
      accuracyPct: meta.accuracyPct,
      updatedAtLabel: meta.updatedAtIso
        ? (() => {
            const d = new Date(meta.updatedAtIso);
            if (Number.isNaN(d.getTime())) return 'SAVED';
            const datePart = d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timePart = d.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            });
            return `${datePart} · ${timePart}`;
          })()
        : 'EMPTY',
    }));
  }

  private async openSaveSlotsModal(): Promise<void> {
    this.pushNavigationReturnSnapshot('MODAL');
    this.stopAnyActiveOverclockAudio();
    this.metaSuite.closeAll(false);
    this.dossierModal?.close();
    this.briefingModal?.close();
    document.documentElement.classList.remove('ws-3d-showcase-open');

    if (
      this.passport.hasRegisteredName() ||
      this.blackboard.getSnapshot().prologueComplete ||
      this.blackboard.getSnapshot().completedMissions.length > 0
    ) {
      this.saveSlotManager.saveActiveSlot();
    }

    const modal = await this.getSaveSlotsModal();
    modal.open({
      getSlots: () => this.buildSaveSlotCards(),
      onSwitchOrStartSlot: (slotId: CampaignSlotId) => {
        this.navigationReturnStack = this.navigationReturnStack.filter(
          (s) => s.kind !== 'MODAL',
        );
        const { isFreshStart, meta } = this.saveSlotManager.switchOrStartSlot(slotId);
        this.localFailedMissions.clear();
        this.playedCutsceneIds.clear();
        if (isFreshStart) {
          this.selectedCityHub = 'ch';
          this.startFullPrologueFlow();
          return;
        }
        const hubPrefix = (meta.currentMissionId.split('_')[0] || 'ch') as CampaignHubCode;
        this.selectedCityHub = hubPrefix;
        this.enterHub('CAMPAIGN');
      },
      onExportSlot: (slotId: CampaignSlotId) => {
        this.saveSlotManager.exportSlotToFile(slotId);
      },
      onImportSlotJson: (slotId: CampaignSlotId, rawJson: string) => {
        const res = this.saveSlotManager.importSlotFromFileJson(slotId, rawJson);
        if (!res.ok) {
          return { ok: false, message: res.error || 'Invalid .ws-save.json file.' };
        }
        if (slotId === this.saveSlotManager.getActiveSlotId()) {
          this.localFailedMissions.clear();
          this.rerenderTopState();
        }
        return {
          ok: true,
          message: `✓ Imported campaign dossier into Slot ${slotId} (${res.meta?.challengerName ?? 'Challenger'}).`,
        };
      },
      onResetSlotToStart: (slotId: CampaignSlotId) => {
        const isCurrent = slotId === this.saveSlotManager.getActiveSlotId();
        this.saveSlotManager.resetSlotToCampaignStart(slotId);
        if (isCurrent) {
          this.localFailedMissions.clear();
          this.playedCutsceneIds.clear();
          this.selectedCityHub = 'ch';
          this.rerenderTopState();
        }
      },
      onDeleteSlot: (slotId: CampaignSlotId) => {
        const isCurrent = slotId === this.saveSlotManager.getActiveSlotId();
        this.saveSlotManager.deleteSlot(slotId);
        if (isCurrent) {
          this.localFailedMissions.clear();
          this.playedCutsceneIds.clear();
          this.selectedCityHub = 'ch';
          this.rerenderTopState();
        }
      },
      onClose: () => {
        this.navigationReturnStack = this.navigationReturnStack.filter(
          (s) => s.kind !== 'MODAL',
        );
        void this.restore3DAfterModal();
      },
    });
  }
}
