import { getDomainMeta, PERKS } from '../data/domains';
import {
  BLACK_SALON_BRACKET_ROUNDS,
  buildCampaignNodes,
  buildDialogueDisplay,
  computeProloguePersona,
  computeSingaporeBetrayer,
  DIALOGUE_SEQUENCES,
  ENDING_METADATA,
  FACTION_METADATA,
  getEndlessStrataForFloor,
  PERSONA_LABELS,
  PROLOGUE_ETHICAL_INTERRUPT,
  PROLOGUE_TUTORIAL_HINTS,
  resolveBeatChoices,
  SKIN_METADATA,
  TRIALS_GHOST_CONTENDERS,
  VENUE_TITLES,
  type BlackSalonRoundConfig,
  type CampaignChoiceDef,
  type DialogueBeatDef,
  type DialogueContext,
  type DialogueSequenceId,
  type PlayableCampaignNodeId,
  type StoryChoiceEffects,
  type TrialsGhostDef,
} from '../story/campaignScript';
import { StoryState, type BetrayerId, type BondNpcId } from '../story/StoryState';
import type {
  ActiveFacetDisplay,
  ActiveQuestionState,
  AnswerSubmission,
  Archetype3D,
  CharacterId,
  CharacterMood,
  DomainId,
  EndingId,
  EndlessCheckpointState,
  EvaluateOptions,
  FactionId,
  GameActions,
  GameModeId,
  GameUIState,
  GlobeCountryCode,
  HeroRelicId,
  IAudioEngine,
  IHapticsEngine,
  ISceneManager,
  ITriviaEngine,
  LightingState,
  MatchQuerySpec,
  MatchSummaryState,
  MusicLayer,
  PeelTier,
  PerkId,
  PrismLoadOptions,
  PrismSkinId,
  QuestionRecord,
  QuestionResolution,
  RivalUIState,
  TrialsHubState,
  VenueId,
} from '../types/game';
import { RivalAI } from './RivalAI';

export interface GameControllerDeps {
  scene: ISceneManager;
  audio: IAudioEngine;
  haptics: IHapticsEngine;
  trivia: ITriviaEngine;
  onStateChange: (state: GameUIState) => void;
}

interface ActiveDialogueRunner {
  sequenceId: DialogueSequenceId;
  beats: DialogueBeatDef[];
  beatIndex: number;
  context: DialogueContext;
  onComplete: () => void;
}

const ARCHETYPE_LABELS: Record<Archetype3D, string> = {
  SIGHTLINE_LOCK: 'SIGHTLINE LOCK',
  CALIBRATOR_DIAL: 'CALIBRATOR DIAL',
  CODEX_DUAL_RING: 'CODEX DUAL-RING',
  GAUNTLET_SHATTER: 'GAUNTLET SHATTER',
  HERO_ARTIFACT_SYNTHESIS: 'HERO SYNTHESIS',
};

interface MatchSession {
  mode: GameModeId;
  campaignNodeId?: PlayableCampaignNodeId;
  briefingDomain?: DomainId | 'MIX';
  briefingArchetype?: Archetype3D;
  trialsKind?: 'GHOST_DUEL' | 'BLACK_SALON';
  trialsGhost?: TrialsGhostDef;
  salonRoundCfg?: BlackSalonRoundConfig;
  venue: VenueId;
  venueTitle: string;
  baseLighting: LightingState;
  baseMusicLayer: MusicLayer;
  hostCharacter: CharacterId;
  questions: QuestionRecord[];
  currentIndex: number;
  resolutions: QuestionResolution[];
  score: number;
  streak: number;
  maxStreak: number;
  overclockAttempts: number;
  overclockHits: number;
  bullseyeHit: boolean;
  peelTierSum: number;
  redactionUsed: boolean;
  coopCrossCheckUsed: boolean;
  blackSalonDoublePoints: boolean;
  blackSalonSuddenDeath: boolean;
  chronoOverrideSec?: number;
  lockAllPeel: boolean;
  lockTier3Only: boolean;
  peelLockReason?: string;
  perksAllowed: boolean;
  rivalAI: RivalAI | null;
  grudgeDomainId?: DomainId;
  betrayer?: BetrayerId;
  apexPhase2RivalId?: 'nadia' | 'soren';
  campaignShields: number;
  campaignMaxShields: number;
  dailyDateStr?: string;
  dailySeed?: number;
  bossRelicId?: HeroRelicId;
  choiceUnlockedPerk?: PerkId;
  // Endless Archive Descent state
  endlessFloor: number;
  endlessBankedScore: number;
  endlessUnbankedScore: number;
  endlessShields: number;
  endlessMaxShields: number;
  endlessOverclockStreak: number;
  endlessStrataMultiplier: number;
  endlessUsedQids: Set<number>;
}

interface QuestionRuntime {
  question: QuestionRecord;
  facets: ActiveFacetDisplay[];
  correctFacetIndex: number;
  distractorPlausibility: Map<number, number>;
  codexRawTop: string[];
  codexRawBottom: string[];
  codexBottomCanonical: number[];
  codexAlignedSlots: number[];
  calibratorNormPos: number;
  calibratorTol: number;
  elapsedSec: number;
  timeTotalSec: number;
  timeRemainingSec: number;
  countdownEscalated: boolean;
  resolved: boolean;
  ethicalInterruptTriggered: boolean;
  ethicalInterruptActive: boolean;
  coopCrossCheckFreeTier2: boolean;
  bluffEchoUsedThisQuestion: boolean;
  lastOverclockHapticTs: number;
  lastCalibratorAudioTs: number;
  lastSpinAudioTs: number;
  lastUiEmitTs: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

function createMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function computeCalibratorMultiplier(tolerancePct: number): number {
  const tol = clamp(tolerancePct, 0.02, 0.35);
  if (tol <= 0.04) return 3.5;
  const t = clamp((0.35 - tol) / (0.35 - 0.04), 0, 1);
  return round2(1.0 + t * 2.5);
}

function computeCalibratorValue(question: QuestionRecord, normPos: number): number {
  const ext = question.calibratorExt;
  if (!ext) return 0;
  const p = clamp(normPos, 0, 1);
  let raw: number;
  if (ext.logScale && ext.minVal > 0 && ext.maxVal > ext.minVal) {
    raw = ext.minVal * Math.pow(ext.maxVal / ext.minVal, p);
  } else {
    raw = ext.minVal + p * (ext.maxVal - ext.minVal);
  }
  const step = ext.step && ext.step > 0 ? ext.step : 1;
  const stepped = Math.round(raw / step) * step;
  const decimals = step < 1 ? Math.min(4, Math.ceil(-Math.log10(step))) : 0;
  const fixed = decimals > 0 ? Number(stepped.toFixed(decimals)) : Math.round(stepped);
  return clamp(fixed, ext.minVal, ext.maxVal);
}

export class GameController {
  private readonly scene: ISceneManager;
  private readonly audio: IAudioEngine;
  private readonly haptics: IHapticsEngine;
  private readonly trivia: ITriviaEngine;
  private readonly onStateChange: (state: GameUIState) => void;
  private readonly story: StoryState;
  private readonly actions: GameActions;

  private state: GameUIState;
  private dialogueRunner: ActiveDialogueRunner | null = null;
  private match: MatchSession | null = null;
  private qRuntime: QuestionRuntime | null = null;
  private pendingChoicePerk: PerkId | undefined;
  private pendingEndingAwarded: EndingId | null = null;
  private lastBriefingDomain: DomainId | 'MIX' = 'MIX';
  private lastBriefingArchetype: Archetype3D | undefined = undefined;
  private onSummaryPrimary: (() => void) | null = null;
  private onSummarySecondary: (() => void) | null = null;

  // Mode 5: Black Salon 16-Player Knockout Bracket state
  private salonRound: 0 | 1 | 2 | 3 = 0;
  private salonEliminated = false;

  private rafId: number | null = null;
  private lastTickTs = 0;
  private toastTimerId: number | null = null;
  private disposed = false;

  constructor(deps: GameControllerDeps) {
    this.scene = deps.scene;
    this.audio = deps.audio;
    this.haptics = deps.haptics;
    this.trivia = deps.trivia;
    this.onStateChange = deps.onStateChange;
    this.story = new StoryState();

    const initialStory = this.story.getSnapshot();
    this.state = {
      screen: 'TITLE',
      mode: 'CAMPAIGN',
      venue: 'CH',
      venueTitle: "THE MERIDIAN · WORLD'S SMARTEST",
      lightingState: 'BROADCAST',
      playerScore: 0,
      streak: 0,
      shields: 0,
      maxShields: 0,
      globalElo: this.trivia.getGlobalElo(),
      domainRatings: this.trivia.getDomainRatings(),
      story: initialStory,
      dialogue: null,
      campaignNodes: buildCampaignNodes(initialStory),
      selectedGlobeCountry: this.computeFrontierCountry(initialStory),
      rival: null,
      activeQuestion: null,
      lastResolution: null,
      endlessCheckpoint: null,
      matchSummary: null,
      trialsHub: this.buildTrialsHubState(),
      endingAwarded: null,
      observatoryRelic:
        initialStory.unlockedRelics[initialStory.unlockedRelics.length - 1] ?? 'meridian_astrolabe',
      audioMuted: this.audio.isMuted(),
      hapticsEnabled: this.haptics.isEnabled(),
      toastMessage: null,
    };

    this.actions = this.createActions();
  }

  public start(): void {
    if (this.disposed) return;

    this.scene.onFacetChanged = (index: number) => {
      this.handleSceneFacetChanged(index);
    };
    this.scene.onCodexChanged = (alignedIndices: number[]) => {
      this.handleSceneCodexChanged(alignedIndices);
    };
    this.scene.onGlobePinClicked = (country: GlobeCountryCode) => {
      this.actions.selectGlobeCountry(country);
    };

    this.applyActiveSkinToScene();
    this.enterTitle(false);
  }

  public getState(): GameUIState {
    return this.state;
  }

  public getActions(): GameActions {
    return this.actions;
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stopTickLoop();
    this.clearToastTimer();
    try {
      this.audio.stopOverclockCharge(false);
    } catch {
      // Ignore audio cleanup errors
    }
    this.scene.onFacetChanged = undefined;
    this.scene.onCodexChanged = undefined;
    this.scene.onGlobePinClicked = undefined;
  }

  // ==========================================================================
  // Public GameActions Binding
  // ==========================================================================

  private createActions(): GameActions {
    return {
      goToTitle: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.enterTitle(true);
      },

      startOrContinueCampaign: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        const snap = this.story.getSnapshot();
        if (!snap.prologueComplete) {
          this.launchCampaignNodeInternal('ch_prologue');
        } else {
          this.enterWorldGlobe();
        }
      },

      openWorldGlobe: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.enterWorldGlobe();
      },

      selectGlobeCountry: (country: GlobeCountryCode) => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.state.selectedGlobeCountry = country;
        this.scene.focusGlobeCountry(country);
        this.emitState();
      },

      launchCampaignNode: (nodeId: string) => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.launchCampaignNodeInternal(nodeId);
      },

      startDailyFeed: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.beginDailyMatch();
      },

      openBriefingRoom: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.enterBriefingPicker();
      },

      startBriefingRun: (domain: DomainId | 'MIX', archetypeFilter?: Archetype3D) => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.beginBriefingMatch(domain, archetypeFilter);
      },

      startEndlessDescent: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.beginEndlessDescent();
      },

      openTrialsHub: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.enterTrialsHub();
      },

      pledgeFaction: (faction: FactionId) => {
        this.unlockAudio();
        this.audio.playStorySting('CHOICE');
        this.haptics.uiTap();
        this.story.setPledgedFaction(faction);
        this.syncStoryAndRatings();
        this.state.trialsHub = this.buildTrialsHubState();
        this.showToast(
          `Pledged to ${FACTION_METADATA[faction].name} — Trials wins now boost your Faction!`
        );
        this.emitState();
      },

      startGhostDuel: (ghostId: string) => {
        this.unlockAudio();
        this.audio.playStorySting('SUMMONS');
        this.haptics.uiTap();
        this.beginGhostDuelMatch(ghostId);
      },

      startBlackSalonBracket: () => {
        this.unlockAudio();
        this.audio.playStorySting('TWIST');
        this.haptics.peel(2);
        this.beginBlackSalonBracketMatch();
      },

      openPassportObservatory: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.enterPassportObservatory();
      },

      selectObservatoryRelic: (relicId: HeroRelicId) => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.state.observatoryRelic = relicId;
        this.scene.inspectHeroRelic(relicId);
        this.emitState();
      },

      selectPrismSkin: (skinId: PrismSkinId) => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.handleSelectPrismSkin(skinId);
      },

      togglePerk: (perkId: PerkId) => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        const res = this.story.togglePerk(perkId);
        if (!res.changed && res.reason) {
          this.showToast(res.reason);
        } else if (res.changed) {
          const meta = PERKS[perkId];
          this.showToast(res.equipped ? `Equipped: ${meta.name}` : `Unequipped: ${meta.name}`);
        }
        this.syncStoryAndRatings();
        this.emitState();
      },

      resetCampaignProgress: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.story.reset();
        this.trivia.resetHistory();
        this.salonRound = 0;
        this.salonEliminated = false;
        this.pendingEndingAwarded = null;
        this.applyActiveSkinToScene();
        this.syncStoryAndRatings();
        this.showToast('Meridian dossier & question history reset.');
        this.enterTitle(false);
      },

      advanceDialogue: () => {
        this.unlockAudio();
        this.handleAdvanceDialogue();
      },

      chooseDialogueOption: (choiceId: string) => {
        this.unlockAudio();
        this.handleChooseDialogueOption(choiceId);
      },

      chooseEthicalInterrupt: (choiceId: string) => {
        this.unlockAudio();
        this.handleEthicalInterruptChoice(choiceId);
      },

      spinPrism: (deltaX: number, ring?: 'TOP' | 'BOTTOM') => {
        this.unlockAudio();
        this.handleSpinPrism(deltaX, ring);
      },

      stepFacet: (direction: -1 | 1) => {
        this.unlockAudio();
        this.handleStepFacet(direction);
      },

      peelPrism: () => {
        this.unlockAudio();
        this.handlePeelPrism();
      },

      beginOverclock: () => {
        this.unlockAudio();
        this.handleBeginOverclock();
      },

      cancelOverclock: () => {
        this.unlockAudio();
        this.handleCancelOverclock();
      },

      commitLock: () => {
        this.unlockAudio();
        this.handleCommitLock();
      },

      adjustCalibrator: (deltaPos: number, deltaTolerance: number) => {
        this.unlockAudio();
        this.handleAdjustCalibrator(deltaPos, deltaTolerance);
      },

      commitCodex: () => {
        this.unlockAudio();
        this.handleCommitCodex();
      },

      swipeGauntlet: (action: 'TRUE' | 'FALSE' | 'CHALLENGE') => {
        this.unlockAudio();
        this.handleSwipeGauntlet(action);
      },

      useDiplomaticRedaction: () => {
        this.unlockAudio();
        this.handleUseDiplomaticRedaction();
      },

      continueAfterIntelFlash: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.handleContinueAfterIntelFlash();
      },

      toggleBookmarkLastFlash: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.handleToggleBookmarkLastFlash();
      },

      endlessDescend: () => {
        this.unlockAudio();
        this.audio.playStorySting('CHOICE');
        this.haptics.peel(2);
        this.handleEndlessDescend();
      },

      endlessExtract: () => {
        this.unlockAudio();
        this.audio.playStorySting('VICTORY');
        this.haptics.correctBloom();
        this.handleEndlessExtract();
      },

      summaryPrimaryAction: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        const fn = this.onSummaryPrimary;
        if (fn) {
          fn();
        } else {
          this.enterTitle(true);
        }
      },

      summarySecondaryAction: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        const fn = this.onSummarySecondary;
        if (fn) {
          fn();
        } else {
          this.enterTitle(true);
        }
      },

      copyDailyShare: () => {
        this.unlockAudio();
        this.audio.playUiTap();
        this.haptics.uiTap();
        this.handleCopyDailyShare();
      },

      dragWorldOrRelic: (dx: number, dy: number) => {
        this.unlockAudio();
        if (this.state.screen === 'WORLD_GLOBE') {
          this.scene.rotateGlobeBy(dx, dy);
        } else if (this.state.screen === 'PASSPORT_OBSERVATORY') {
          this.scene.rotateRelicBy(dx, dy);
        }
      },

      toggleMute: () => {
        this.unlockAudio();
        const nextMuted = !this.audio.isMuted();
        this.audio.setMuted(nextMuted);
        this.state.audioMuted = this.audio.isMuted();
        if (!this.state.audioMuted) {
          this.audio.playUiTap();
        }
        this.showToast(this.state.audioMuted ? 'Audio Muted' : 'Audio Enabled');
        this.emitState();
      },

      toggleHaptics: () => {
        this.unlockAudio();
        const nextEnabled = !this.haptics.isEnabled();
        this.haptics.setEnabled(nextEnabled);
        this.state.hapticsEnabled = this.haptics.isEnabled();
        if (this.state.hapticsEnabled) {
          this.haptics.uiTap();
        }
        this.showToast(this.state.hapticsEnabled ? 'Haptics Enabled' : 'Haptics Off');
        this.emitState();
      },
    };
  }

  // ==========================================================================
  // Prism Atelier Skin Helper
  // ==========================================================================

  private applyActiveSkinToScene(): void {
    const activeSkin = this.story.getSnapshot().activeSkin ?? 'OBSIDIAN_BRASS';
    this.scene.setPrismSkin?.(activeSkin);
  }

  private handleSelectPrismSkin(skinId: PrismSkinId): void {
    const meta = SKIN_METADATA[skinId];
    if (!this.story.isSkinUnlocked(skinId)) {
      this.showToast(meta ? meta.unlockHint : 'Prism Skin locked.');
      return;
    }
    this.story.setActiveSkin(skinId);
    this.scene.setPrismSkin?.(skinId);
    this.audio.playSightlineSnap();
    this.haptics.sightlineSnap();
    this.syncStoryAndRatings();
    this.showToast(`Prism Atelier equipped: ${meta?.name ?? skinId}`);
    this.emitState();
  }

  // ==========================================================================
  // Screen Transitions & Navigation
  // ==========================================================================

  private computeFrontierCountry(snap: GameUIState['story']): GlobeCountryCode {
    const done = snap.completedCampaignNodes;
    if (!snap.prologueComplete) return 'CH';
    if (!done.includes('gb_london')) return 'GB';
    if (!done.includes('jp_tokyo')) return 'JP';
    if (snap.blackSalonUnlocked && !done.includes('gb_black_salon')) return 'GB';
    if (!done.includes('br_rio')) return 'BR';
    if (!done.includes('eg_cairo')) return 'EG';
    if (!done.includes('is_reykjavik')) return 'IS';
    if (!done.includes('sg_singapore')) return 'SG';
    return 'GLOBAL';
  }

  private buildTrialsHubState(): TrialsHubState {
    const snap = this.story.getSnapshot();
    const nextRoundIdx =
      this.salonEliminated || this.salonRound === 0
        ? 0
        : clamp(this.salonRound - 1, 0, BLACK_SALON_BRACKET_ROUNDS.length - 1);
    const activeRoundCfg = BLACK_SALON_BRACKET_ROUNDS[nextRoundIdx] ?? BLACK_SALON_BRACKET_ROUNDS[0];

    return {
      pledgedFaction: snap.pledgedFaction ?? null,
      factionStandings: this.story.getFactionStandings(),
      ghostContenders: TRIALS_GHOST_CONTENDERS.map((g) => ({
        id: g.id,
        handle: g.handle,
        countryCode: g.countryCode,
        faction: g.faction,
        elo: g.elo,
        portraitId: g.portraitId,
        styleTag: g.styleTag,
      })),
      salonRound: this.salonRound,
      salonModifier: activeRoundCfg.modifierTitle,
      salonEliminated: this.salonEliminated,
    };
  }

  private enterTitle(playMusic: boolean): void {
    this.stopTickLoop();
    this.dialogueRunner = null;
    this.match = null;
    this.qRuntime = null;
    this.onSummaryPrimary = null;
    this.onSummarySecondary = null;
    this.pendingEndingAwarded = null;
    this.syncStoryAndRatings();

    this.state.screen = 'TITLE';
    this.state.mode = 'CAMPAIGN';
    this.state.venue = 'CH';
    this.state.venueTitle = "THE MERIDIAN · WORLD'S SMARTEST";
    this.state.lightingState = 'BROADCAST';
    this.state.dialogue = null;
    this.state.rival = null;
    this.state.activeQuestion = null;
    this.state.lastResolution = null;
    this.state.endlessCheckpoint = null;
    this.state.matchSummary = null;
    this.state.endingAwarded = null;
    this.state.trialsHub = this.buildTrialsHubState();
    this.state.playerScore = 0;
    this.state.streak = 0;
    this.state.shields = 0;
    this.state.maxShields = 0;

    this.applyActiveSkinToScene();
    this.scene.setModeView('TITLE');
    this.scene.setVenue('CH', 'BROADCAST');
    this.scene.setCharacter('none');
    this.scene.setRivalPrismStatus('HIDDEN');
    this.scene.setChronoProgress(1);

    if (playMusic) {
      this.audio.setVenueMusic('CH', 'IDLE');
    }

    this.emitState();
  }

  private enterWorldGlobe(): void {
    this.stopTickLoop();
    this.dialogueRunner = null;
    this.match = null;
    this.qRuntime = null;
    this.pendingEndingAwarded = null;
    this.syncStoryAndRatings();

    const snap = this.story.getSnapshot();
    const defaultCountry = this.computeFrontierCountry(snap);

    this.state.screen = 'WORLD_GLOBE';
    this.state.mode = 'CAMPAIGN';
    this.state.venue = 'STUDIO';
    this.state.venueTitle = 'THE MERIDIAN CIRCUIT · GLOBAL FLIGHT PLAN';
    this.state.lightingState = 'BROADCAST';
    this.state.selectedGlobeCountry = defaultCountry;
    this.state.dialogue = null;
    this.state.rival = null;
    this.state.activeQuestion = null;
    this.state.lastResolution = null;
    this.state.endlessCheckpoint = null;
    this.state.matchSummary = null;
    this.state.endingAwarded = null;

    this.scene.setModeView('GLOBE');
    this.scene.setCharacter('none');
    this.scene.setRivalPrismStatus('HIDDEN');
    this.scene.focusGlobeCountry(defaultCountry);
    this.audio.setVenueMusic('STUDIO', 'IDLE');

    this.emitState();
  }

  private enterBriefingPicker(): void {
    this.stopTickLoop();
    this.dialogueRunner = null;
    this.match = null;
    this.qRuntime = null;
    this.pendingEndingAwarded = null;
    this.syncStoryAndRatings();

    this.state.screen = 'BRIEFING_PICKER';
    this.state.mode = 'BRIEFING';
    this.state.venue = 'STUDIO';
    this.state.venueTitle = 'THE BRIEFING ROOM · 12-DOMAIN CALIBRATION';
    this.state.lightingState = 'BROADCAST';
    this.state.dialogue = null;
    this.state.rival = null;
    this.state.activeQuestion = null;
    this.state.lastResolution = null;
    this.state.endlessCheckpoint = null;
    this.state.matchSummary = null;
    this.state.endingAwarded = null;

    this.scene.setModeView('VENUE_STAGE');
    this.scene.setVenue('STUDIO', 'BROADCAST');
    this.scene.setCharacter('nadia', 'NEUTRAL');
    this.scene.setRivalPrismStatus('HIDDEN');
    this.audio.setVenueMusic('STUDIO', 'IDLE');

    this.emitState();
  }

  private enterTrialsHub(): void {
    this.stopTickLoop();
    this.dialogueRunner = null;
    this.match = null;
    this.qRuntime = null;
    this.pendingEndingAwarded = null;
    this.syncStoryAndRatings();

    this.state.screen = 'TRIALS_HUB';
    this.state.mode = 'TRIALS';
    this.state.venue = 'STUDIO';
    this.state.venueTitle = 'WORLD COUNCIL TRIALS · THE BLACK SALON';
    this.state.lightingState = 'INTIMATE';
    this.state.dialogue = null;
    this.state.rival = null;
    this.state.activeQuestion = null;
    this.state.lastResolution = null;
    this.state.endlessCheckpoint = null;
    this.state.matchSummary = null;
    this.state.endingAwarded = null;
    this.state.trialsHub = this.buildTrialsHubState();

    this.scene.setModeView('VENUE_STAGE');
    this.scene.setVenue('STUDIO', 'INTIMATE');
    this.scene.setCharacter('teo', 'SMIRK');
    this.scene.setRivalPrismStatus('HIDDEN');
    this.audio.setVenueMusic('STUDIO', 'IDLE');

    this.emitState();
  }

  private enterPassportObservatory(): void {
    this.stopTickLoop();
    this.dialogueRunner = null;
    this.match = null;
    this.qRuntime = null;
    this.pendingEndingAwarded = null;
    this.syncStoryAndRatings();

    const relics = this.state.story.unlockedRelics;
    if (relics.length > 0 && !relics.includes(this.state.observatoryRelic)) {
      this.state.observatoryRelic = relics[relics.length - 1];
    } else if (relics.length === 0) {
      this.state.observatoryRelic = 'meridian_astrolabe';
    }

    this.state.screen = 'PASSPORT_OBSERVATORY';
    this.state.venue = 'STUDIO';
    this.state.venueTitle = 'MERIDIAN PASSPORT & 3D OBSERVATORY';
    this.state.lightingState = 'INTIMATE';
    this.state.dialogue = null;
    this.state.rival = null;
    this.state.activeQuestion = null;
    this.state.lastResolution = null;
    this.state.endlessCheckpoint = null;
    this.state.matchSummary = null;
    this.state.endingAwarded = null;

    this.applyActiveSkinToScene();
    this.scene.setModeView('OBSERVATORY');
    this.scene.setVenue('STUDIO', 'INTIMATE');
    this.scene.setCharacter('none');
    this.scene.setRivalPrismStatus('HIDDEN');
    this.scene.inspectHeroRelic(this.state.observatoryRelic);
    this.audio.setVenueMusic('STUDIO', 'IDLE');

    this.emitState();
  }

  // ==========================================================================
  // Campaign Nodes & Dialogue Orchestration (ALL 8 CHAPTERS + HIDDEN NODE)
  // ==========================================================================

  private launchCampaignNodeInternal(nodeId: string): void {
    const snap = this.story.getSnapshot();
    const done = snap.completedCampaignNodes;
    this.pendingChoicePerk = undefined;
    this.pendingEndingAwarded = null;

    if (nodeId === 'ch_prologue') {
      this.startDialogueSequence('prologue_intro', { story: snap }, () => {
        this.beginPrologueMatch();
      });
      return;
    }

    if (nodeId === 'gb_london') {
      if (!snap.prologueComplete) {
        this.showToast('Complete Geneva Vetting first to unlock Act I flights.');
        return;
      }
      this.story.setFirstFlightChoice('GB');
      this.syncStoryAndRatings();
      this.startDialogueSequence('london_intro', { story: this.story.getSnapshot() }, () => {
        this.beginLondonMatch();
      });
      return;
    }

    if (nodeId === 'gb_black_salon') {
      if (!snap.blackSalonUnlocked) {
        this.showToast("Burn Lindqvist's sealed briefing in London to unlock the Black Salon.");
        return;
      }
      this.startDialogueSequence('black_salon_intro', { story: snap }, () => {
        this.beginBlackSalonMatch();
      });
      return;
    }

    if (nodeId === 'jp_tokyo') {
      if (!snap.prologueComplete) {
        this.showToast('Complete Geneva Vetting first to unlock Act I flights.');
        return;
      }
      this.story.setFirstFlightChoice('JP');
      this.syncStoryAndRatings();
      this.startDialogueSequence('tokyo_intro', { story: this.story.getSnapshot() }, () => {
        this.beginTokyoMatch();
      });
      return;
    }

    if (nodeId === 'br_rio') {
      if (!done.includes('gb_london') || !done.includes('jp_tokyo')) {
        this.showToast('Complete both London and Tokyo (Act I) to board the Rio charter.');
        return;
      }
      this.startDialogueSequence('rio_intro', { story: snap }, () => {
        this.beginRioMatch();
      });
      return;
    }

    if (nodeId === 'eg_cairo') {
      if (!done.includes('br_rio')) {
        this.showToast('Complete Rio de Janeiro (Stage 3) to unlock Cairo / Giza.');
        return;
      }
      this.startDialogueSequence('cairo_intro', { story: snap }, () => {
        this.beginCairoMatch();
      });
      return;
    }

    if (nodeId === 'is_reykjavik') {
      if (!done.includes('eg_cairo')) {
        this.showToast('Complete Cairo / Giza (Stage 4) to unlock Reykjavik.');
        return;
      }
      const seq: DialogueSequenceId =
        snap.act3Branch === 'INSIDER' ? 'reykjavik_intro_insider' : 'reykjavik_intro_whistle';
      this.startDialogueSequence(seq, { story: snap }, () => {
        this.beginReykjavikMatch();
      });
      return;
    }

    if (nodeId === 'sg_singapore') {
      if (!done.includes('is_reykjavik')) {
        this.showToast('Complete Reykjavik (Stage 5) to unlock Singapore Sky-Bridge.');
        return;
      }
      const betrayer = computeSingaporeBetrayer(snap);
      this.story.setBetrayer(betrayer);
      this.syncStoryAndRatings();
      const seq: DialogueSequenceId =
        betrayer === 'nadia'
          ? 'singapore_intro_nadia'
          : betrayer === 'teo'
            ? 'singapore_intro_teo'
            : 'singapore_intro_soren';
      this.startDialogueSequence(
        seq,
        { story: this.story.getSnapshot(), betrayer },
        () => {
          this.beginSingaporeMatch(betrayer);
        }
      );
      return;
    }

    if (nodeId === 'global_apex') {
      if (!done.includes('sg_singapore')) {
        this.showToast('Complete Singapore (Stage 6) to unlock The Apex Forum Grand Finale.');
        return;
      }
      this.startDialogueSequence('apex_intro', { story: snap }, () => {
        this.beginApexMatch();
      });
      return;
    }

    this.showToast('Unknown Meridian destination.');
  }

  private startDialogueSequence(
    sequenceId: DialogueSequenceId,
    context: DialogueContext,
    onComplete: () => void
  ): void {
    this.stopTickLoop();
    const def = DIALOGUE_SEQUENCES[sequenceId];
    if (!def || def.beats.length === 0) {
      onComplete();
      return;
    }

    this.dialogueRunner = {
      sequenceId,
      beats: def.beats,
      beatIndex: 0,
      context: { ...context, story: this.story.getSnapshot() },
      onComplete,
    };

    this.state.screen = 'DIALOGUE';
    this.state.activeQuestion = null;
    this.state.lastResolution = null;
    this.state.endlessCheckpoint = null;
    this.state.matchSummary = null;
    this.state.endingAwarded = null;

    this.presentCurrentDialogueBeat();
  }

  private presentCurrentDialogueBeat(): void {
    const runner = this.dialogueRunner;
    if (!runner) return;
    const beat = runner.beats[runner.beatIndex];
    if (!beat) {
      const done = runner.onComplete;
      this.dialogueRunner = null;
      done();
      return;
    }

    runner.context.story = this.story.getSnapshot();
    const display = buildDialogueDisplay(beat, runner.beatIndex, runner.beats.length, runner.context);

    this.state.venue = beat.venue;
    this.state.venueTitle = VENUE_TITLES[beat.venue];
    this.state.lightingState = beat.lightingState;
    this.state.dialogue = display;

    this.scene.setModeView('VENUE_STAGE');
    this.scene.setVenue(beat.venue, beat.lightingState);
    this.scene.setCharacter(beat.speakerId, beat.mood);
    this.scene.setRivalPrismStatus('HIDDEN');
    this.audio.setVenueMusic(beat.venue, beat.musicLayer);
    if (beat.sting) {
      this.audio.playStorySting(beat.sting);
    }

    this.emitState();
  }

  private handleAdvanceDialogue(): void {
    const runner = this.dialogueRunner;
    if (!runner || this.state.screen !== 'DIALOGUE') return;
    const beat = runner.beats[runner.beatIndex];
    if (!beat) return;

    const resolvedChoices = resolveBeatChoices(beat, runner.context);
    if (resolvedChoices && resolvedChoices.length > 0) return;

    this.audio.playUiTap();
    this.haptics.uiTap();

    if (beat.nextBeatId) {
      const nextIdx = runner.beats.findIndex((b) => b.id === beat.nextBeatId);
      if (nextIdx !== -1) {
        runner.beatIndex = nextIdx;
        this.presentCurrentDialogueBeat();
        return;
      }
    }

    const done = runner.onComplete;
    this.dialogueRunner = null;
    this.state.dialogue = null;
    done();
  }

  private handleChooseDialogueOption(choiceId: string): void {
    const runner = this.dialogueRunner;
    if (!runner || this.state.screen !== 'DIALOGUE') return;
    const beat = runner.beats[runner.beatIndex];
    if (!beat) return;

    const resolvedChoices = resolveBeatChoices(beat, runner.context);
    if (!resolvedChoices) return;

    const choice: CampaignChoiceDef | undefined = resolvedChoices.find((c) => c.id === choiceId);
    if (!choice) return;

    this.audio.playStorySting('CHOICE');
    this.haptics.uiTap();

    if (choice.effects) {
      this.applyStoryEffects(choice.effects);
    }

    if (choice.nextBeatId) {
      const nextIdx = runner.beats.findIndex((b) => b.id === choice.nextBeatId);
      if (nextIdx !== -1) {
        runner.beatIndex = nextIdx;
        this.presentCurrentDialogueBeat();
        return;
      }
    }

    const done = runner.onComplete;
    this.dialogueRunner = null;
    this.state.dialogue = null;
    done();
  }

  private applyStoryEffects(effects: StoryChoiceEffects): void {
    if (effects.origin) {
      this.story.setOrigin(effects.origin);
    }
    if (effects.integrity) {
      this.story.adjustIntegrity(effects.integrity);
    }
    if (effects.publicTrust) {
      this.story.adjustPublicTrust(effects.publicTrust);
    }
    if (effects.councilFavor) {
      this.story.adjustCouncilFavor(effects.councilFavor);
    }
    if (effects.bonds) {
      for (const [npc, delta] of Object.entries(effects.bonds)) {
        if (typeof delta === 'number' && delta !== 0) {
          this.story.shiftBond(npc as BondNpcId, delta);
        }
      }
    }
    if (effects.setBonds) {
      for (const [npc, level] of Object.entries(effects.setBonds)) {
        if (level) {
          this.story.setBond(npc as BondNpcId, level);
        }
      }
    }
    if (effects.flags) {
      for (const [k, v] of Object.entries(effects.flags)) {
        this.story.setFlag(k, v);
      }
    }
    if (effects.act3Branch) {
      this.story.setAct3Branch(effects.act3Branch);
    }
    if (effects.betrayer) {
      this.story.setBetrayer(effects.betrayer);
    }
    if (effects.unlockPerk) {
      this.story.unlockPerk(effects.unlockPerk, Boolean(effects.autoEquipPerk));
      this.pendingChoicePerk = effects.unlockPerk;
    }
    if (effects.unlockSkin) {
      this.story.unlockSkin(effects.unlockSkin, Boolean(effects.autoEquipSkin));
      if (effects.autoEquipSkin) {
        this.applyActiveSkinToScene();
      }
    }
    if (effects.unlockBlackSalon) {
      this.story.unlockBlackSalon();
    }
    if (effects.endingAwarded) {
      this.story.recordEnding(effects.endingAwarded);
      this.pendingEndingAwarded = effects.endingAwarded;
    }
    if (effects.toast) {
      this.showToast(effects.toast);
    }
    this.syncStoryAndRatings();
  }

  // ==========================================================================
  // Question Fetcher with Grudge Counter-Pick & Archetype-Preserving Fallbacks
  // ==========================================================================

  private fetchQuestionsWithFallback(
    primarySpec: MatchQuerySpec,
    desiredCount: number,
    excludeQids?: Set<number>
  ): QuestionRecord[] {
    const collected: QuestionRecord[] = [];
    const seenQids = new Set<number>(excludeQids ?? []);

    const appendUnique = (items: QuestionRecord[]) => {
      for (const q of items) {
        if (collected.length >= desiredCount) break;
        if (!seenQids.has(q.qid)) {
          collected.push(q);
          seenQids.add(q.qid);
        }
      }
    };

    appendUnique(this.trivia.selectMatchQuestions(primarySpec));

    if (collected.length < desiredCount && primarySpec.requiredTags) {
      appendUnique(
        this.trivia.selectMatchQuestions({
          ...primarySpec,
          count: desiredCount - collected.length,
          requiredTags: undefined,
          boostTags: [...(primarySpec.boostTags ?? []), ...primarySpec.requiredTags],
          allowRepeatsFallback: true,
        })
      );
    }

    if (collected.length < desiredCount && primarySpec.regions) {
      appendUnique(
        this.trivia.selectMatchQuestions({
          ...primarySpec,
          count: desiredCount - collected.length,
          regions: undefined,
          requiredTags: undefined,
          allowRepeatsFallback: true,
        })
      );
    }

    // Preserve explicit archetype filter (e.g. Briefing Morph drill) before dropping domains!
    if (collected.length < desiredCount && primarySpec.domains && primarySpec.archetypes) {
      appendUnique(
        this.trivia.selectMatchQuestions({
          ...primarySpec,
          count: desiredCount - collected.length,
          domains: undefined,
          regions: undefined,
          requiredTags: undefined,
          allowRepeatsFallback: true,
        })
      );
    }

    if (collected.length < desiredCount && primarySpec.archetypes) {
      appendUnique(
        this.trivia.selectMatchQuestions({
          count: desiredCount - collected.length,
          mode: primarySpec.mode,
          archetypes: primarySpec.archetypes,
          allowRepeatsFallback: true,
        })
      );
    }

    if (collected.length < desiredCount) {
      appendUnique(
        this.trivia.selectMatchQuestions({
          count: desiredCount - collected.length,
          mode: primarySpec.mode,
          allowRepeatsFallback: true,
        })
      );
    }

    return collected;
  }

  /**
   * Nemesis Nadia Grudge Pressure:
   * Queries `trivia.getWeakestDomain()` to counter-pick the player's actual weakest trivia domain
   * and splices 1-2 counter-picked questions into slots 1..N-2 (preserving the Boss Finale slot!).
   */
  private injectGrudgeWeakestDomainQuestions(
    questions: QuestionRecord[],
    weakestDomain: DomainId,
    injectCount = 1
  ): QuestionRecord[] {
    if (questions.length < 3 || injectCount <= 0) return questions;
    const used = new Set(questions.map((q) => q.qid));
    const counterPicks = this.fetchQuestionsWithFallback(
      {
        count: injectCount,
        mode: 'CAMPAIGN',
        domains: [weakestDomain],
        archetypes: ['SIGHTLINE_LOCK'],
        boostTags: ['RIVAL_PRESSURE'],
        allowRepeatsFallback: true,
      },
      injectCount,
      used
    );
    if (counterPicks.length === 0) return questions;

    const result = [...questions];
    // Replace slot 1 (and slot 3 if 2 counter-picks) so opening and Boss Relic finale stay intact
    if (counterPicks[0] && result.length >= 3) {
      result[1] = counterPicks[0];
    }
    if (counterPicks[1] && result.length >= 5) {
      result[3] = counterPicks[1];
    }
    return result;
  }

  // ==========================================================================
  // Match Setup Across ALL 5 Game Modes & ALL 8 Campaign Chapters
  // ==========================================================================

  private beginPrologueMatch(): void {
    const questions = this.fetchQuestionsWithFallback(
      {
        count: 4,
        mode: 'CAMPAIGN',
        pinnedQids: [1, 2, 3, 4],
        regions: ['CH', 'GLOBAL'],
        allowRepeatsFallback: true,
      },
      4
    );

    if (questions.length === 0) {
      this.showToast('Question bank unavailable.');
      this.enterTitle(true);
      return;
    }

    this.startMatchSession({
      mode: 'CAMPAIGN',
      campaignNodeId: 'ch_prologue',
      venue: 'CH',
      venueTitle: VENUE_TITLES.CH,
      baseLighting: 'BROADCAST',
      baseMusicLayer: 'DEDUCTION',
      hostCharacter: 'vance',
      questions,
      rivalAI: null,
      perksAllowed: true,
      blackSalonDoublePoints: false,
      lockAllPeel: false,
      lockTier3Only: false,
      bossRelicId: 'meridian_astrolabe',
    });
  }

  private beginLondonMatch(): void {
    const snap = this.story.getSnapshot();
    const acceptedBriefing = snap.flags.london_choice === 'ACCEPTED_BRIEFING';
    const hasAnalogImmunity = this.story.hasActivePerk('ANALOG_STATIC_MASTER');

    const questions = this.fetchQuestionsWithFallback(
      {
        count: 5,
        mode: 'CAMPAIGN',
        regions: ['GB'],
        boostTags: ['SOVEREIGN_BLOC', 'HIGH_POWER'],
        allowRepeatsFallback: true,
      },
      5
    );

    if (questions.length === 0) {
      this.showToast('Question bank unavailable.');
      this.enterWorldGlobe();
      return;
    }

    const nadia = new RivalAI({
      id: 'nadia',
      tempoStealActive: acceptedBriefing,
      tempoStealBlockedByPerk: hasAnalogImmunity,
    });

    this.startMatchSession({
      mode: 'CAMPAIGN',
      campaignNodeId: 'gb_london',
      venue: 'GB',
      venueTitle: VENUE_TITLES.GB,
      baseLighting: 'BROADCAST',
      baseMusicLayer: 'DEDUCTION',
      hostCharacter: 'nadia',
      questions,
      rivalAI: nadia,
      perksAllowed: true,
      blackSalonDoublePoints: false,
      lockAllPeel: false,
      lockTier3Only: false,
      bossRelicId: 'armillary_orrery',
      choiceUnlockedPerk: this.pendingChoicePerk,
    });
  }

  private beginBlackSalonMatch(): void {
    const questions = this.fetchQuestionsWithFallback(
      {
        count: 4,
        mode: 'CAMPAIGN',
        regions: ['GB'],
        requiredTags: ['BLACK_SALON'],
        boostTags: ['ESPIONAGE', 'CLASSIFIED_LEDGER'],
        targetDifficultyCurve: [0.6, 1.0, 1.3, 1.7],
        allowRepeatsFallback: true,
      },
      4
    );

    if (questions.length === 0) {
      this.showToast('Question bank unavailable.');
      this.enterWorldGlobe();
      return;
    }

    this.startMatchSession({
      mode: 'CAMPAIGN',
      campaignNodeId: 'gb_black_salon',
      venue: 'GB',
      venueTitle: 'LONDON · THE BLACK SALON (OFF-GRID)',
      baseLighting: 'FRACTURE',
      baseMusicLayer: 'FRACTURE',
      hostCharacter: 'teo',
      questions,
      rivalAI: null,
      perksAllowed: true,
      blackSalonDoublePoints: true,
      lockAllPeel: false,
      lockTier3Only: true,
      peelLockReason: 'BLACK SALON — TIER-3 PEEL LOCKED',
    });
  }

  private beginTokyoMatch(): void {
    const snap = this.story.getSnapshot();
    const analogStatic = Boolean(snap.flags.tokyo_analog_static);

    const questions = this.fetchQuestionsWithFallback(
      {
        count: 5,
        mode: 'CAMPAIGN',
        regions: ['JP'],
        requiredTags: analogStatic ? ['LATERAL_DEDUCTION'] : undefined,
        boostTags: analogStatic ? ['LATERAL_DEDUCTION', 'HORIZON_TECH'] : ['HORIZON_TECH'],
        allowRepeatsFallback: true,
      },
      5
    );

    if (questions.length === 0) {
      this.showToast('Question bank unavailable.');
      this.enterWorldGlobe();
      return;
    }

    const soren = new RivalAI({
      id: 'soren',
      analogStaticJammed: analogStatic,
    });

    this.startMatchSession({
      mode: 'CAMPAIGN',
      campaignNodeId: 'jp_tokyo',
      venue: 'JP',
      venueTitle: analogStatic ? 'TOKYO · ANALOG STATIC FRACTURE' : VENUE_TITLES.JP,
      baseLighting: analogStatic ? 'FRACTURE' : 'BROADCAST',
      baseMusicLayer: analogStatic ? 'FRACTURE' : 'DEDUCTION',
      hostCharacter: 'soren',
      questions,
      rivalAI: soren,
      perksAllowed: true,
      blackSalonDoublePoints: false,
      lockAllPeel: analogStatic,
      lockTier3Only: false,
      peelLockReason: analogStatic ? 'ANALOG STATIC — PEEL JAMMED' : undefined,
      bossRelicId: 'origami_prism',
      choiceUnlockedPerk: this.pendingChoicePerk,
    });
  }

  private beginRioMatch(): void {
    const snap = this.story.getSnapshot();
    const savedNadia = Boolean(snap.flags.rio_shield_sacrifice) || snap.bonds.nadia === 'ALLIED';
    const nemesisNadia = snap.bonds.nadia === 'NEMESIS';
    const hasAnalogImmunity = this.story.hasActivePerk('ANALOG_STATIC_MASTER');

    let questions = this.fetchQuestionsWithFallback(
      {
        count: 5,
        mode: 'CAMPAIGN',
        regions: ['BR'],
        boostTags: ['AGORA_CIVIC', 'CURRENT_PULSE'],
        allowRepeatsFallback: true,
      },
      5
    );

    let grudgeDomainId: DomainId | undefined;
    if (nemesisNadia) {
      grudgeDomainId = this.trivia.getWeakestDomain();
      questions = this.injectGrudgeWeakestDomainQuestions(questions, grudgeDomainId, 1);
    }

    if (questions.length === 0) {
      this.showToast('Question bank unavailable.');
      this.enterWorldGlobe();
      return;
    }

    const nadia = new RivalAI({
      id: 'nadia',
      customTitle: nemesisNadia ? 'Sworn Nemesis · Grudge Pressure' : 'Allied Polymath · Agora Summit',
      tempoStealActive: nemesisNadia,
      tempoStealBlockedByPerk: hasAnalogImmunity,
      grudgePressure: nemesisNadia,
      grudgeDomainId,
      grudgeDomainName: grudgeDomainId !== undefined ? getDomainMeta(grudgeDomainId).name : undefined,
    });

    this.startMatchSession({
      mode: 'CAMPAIGN',
      campaignNodeId: 'br_rio',
      venue: 'BR',
      venueTitle: VENUE_TITLES.BR,
      baseLighting: nemesisNadia ? 'FRACTURE' : 'BROADCAST',
      baseMusicLayer: nemesisNadia ? 'FRACTURE' : 'DEDUCTION',
      hostCharacter: 'nadia',
      questions,
      rivalAI: nadia,
      grudgeDomainId,
      campaignShields: savedNadia ? 1 : 2,
      campaignMaxShields: 2,
      perksAllowed: true,
      blackSalonDoublePoints: false,
      lockAllPeel: false,
      lockTier3Only: false,
      bossRelicId: 'emerald_sphere',
      choiceUnlockedPerk: this.pendingChoicePerk,
    });
  }

  private beginCairoMatch(): void {
    const snap = this.story.getSnapshot();
    const isWhistleblower = snap.act3Branch === 'WHISTLEBLOWER';
    const nemesisNadia = snap.bonds.nadia === 'NEMESIS';
    const hasAnalogImmunity = this.story.hasActivePerk('ANALOG_STATIC_MASTER');

    let questions = this.fetchQuestionsWithFallback(
      {
        count: 5,
        mode: 'CAMPAIGN',
        regions: ['EG'],
        boostTags: ['MERIDIAN_ZERO', 'ARCHIVE_CORE', 'CLASSIFIED_LEDGER'],
        allowRepeatsFallback: true,
      },
      5
    );

    let grudgeDomainId: DomainId | undefined;
    if (nemesisNadia) {
      grudgeDomainId = this.trivia.getWeakestDomain();
      questions = this.injectGrudgeWeakestDomainQuestions(questions, grudgeDomainId, 2);
    }

    if (questions.length === 0) {
      this.showToast('Question bank unavailable.');
      this.enterWorldGlobe();
      return;
    }

    const rival = new RivalAI({
      id: 'nadia',
      customTitle: nemesisNadia
        ? 'Nemesis · Meridian Zero Hunt'
        : isWhistleblower
          ? 'Whistleblower Vault Race'
          : 'Giza Acoustic Decryption',
      tempoStealActive: nemesisNadia,
      tempoStealBlockedByPerk: hasAnalogImmunity,
      grudgePressure: nemesisNadia,
      grudgeDomainId,
      grudgeDomainName: grudgeDomainId !== undefined ? getDomainMeta(grudgeDomainId).name : undefined,
    });

    this.startMatchSession({
      mode: 'CAMPAIGN',
      campaignNodeId: 'eg_cairo',
      venue: 'EG',
      venueTitle: isWhistleblower
        ? 'CAIRO · MERIDIAN ZERO BLACKOUT'
        : 'CAIRO · SOLAR ACOUSTIC VAULT',
      baseLighting: 'FRACTURE',
      baseMusicLayer: 'FRACTURE',
      hostCharacter: 'nadia',
      questions,
      rivalAI: rival,
      grudgeDomainId,
      perksAllowed: true,
      blackSalonDoublePoints: false,
      lockAllPeel: false,
      lockTier3Only: false,
      bossRelicId: 'cipher_box',
      choiceUnlockedPerk: this.pendingChoicePerk,
    });
  }

  private beginReykjavikMatch(): void {
    const snap = this.story.getSnapshot();
    const isInsider = snap.act3Branch === 'INSIDER';

    const questions = this.fetchQuestionsWithFallback(
      {
        count: 5,
        mode: 'CAMPAIGN',
        regions: ['IS'],
        boostTags: isInsider
          ? ['ARCHIVE_CORE', 'HIGH_STAKES_BLUFF', 'HIGH_POWER']
          : ['ARCHIVE_CORE', 'BLACK_SALON', 'MERIDIAN_ZERO'],
        targetDifficultyCurve: [0.5, 0.8, 1.1, 1.4, 1.8],
        allowRepeatsFallback: true,
      },
      5
    );

    if (questions.length === 0) {
      this.showToast('Question bank unavailable.');
      this.enterWorldGlobe();
      return;
    }

    const rival = isInsider
      ? new RivalAI({
          id: 'soren',
          customTitle: 'Conclave Bluff Wager Duelist',
          overclockChanceOverride: 0.72,
          speedMultiplier: 0.88,
        })
      : new RivalAI({
          id: 'tariq',
          customTitle: 'Meridian Zero · Trojan Horse Calibration',
          baseAccuracyOverride: 0.81,
          peelChanceOverride: 0.26,
        });

    this.startMatchSession({
      mode: 'CAMPAIGN',
      campaignNodeId: 'is_reykjavik',
      venue: 'IS',
      venueTitle: isInsider
        ? 'REYKJAVIK · CONCLAVE BLUFF DUEL'
        : 'REYKJAVIK · AURORA PIRATE CALIBRATION',
      baseLighting: isInsider ? 'INTIMATE' : 'FRACTURE',
      baseMusicLayer: isInsider ? 'DEDUCTION' : 'FRACTURE',
      hostCharacter: isInsider ? 'soren' : 'tariq',
      questions,
      rivalAI: rival,
      perksAllowed: true,
      blackSalonDoublePoints: false,
      lockAllPeel: false,
      lockTier3Only: false,
      bossRelicId: 'cryo_relay',
      choiceUnlockedPerk: this.pendingChoicePerk,
    });
  }

  private beginSingaporeMatch(betrayer: BetrayerId): void {
    const hasAnalogImmunity = this.story.hasActivePerk('ANALOG_STATIC_MASTER');

    let questions = this.fetchQuestionsWithFallback(
      {
        count: 5,
        mode: 'CAMPAIGN',
        regions: ['SG'],
        boostTags: ['CLASSIFIED_LEDGER', 'HIGH_POWER', 'ESPIONAGE'],
        targetDifficultyCurve: [0.7, 1.0, 1.3, 1.6, 2.0],
        allowRepeatsFallback: true,
      },
      5
    );

    let grudgeDomainId: DomainId | undefined;
    if (betrayer === 'nadia') {
      grudgeDomainId = this.trivia.getWeakestDomain();
      questions = this.injectGrudgeWeakestDomainQuestions(questions, grudgeDomainId, 2);
    }

    if (questions.length === 0) {
      this.showToast('Question bank unavailable.');
      this.enterWorldGlobe();
      return;
    }

    const rival = new RivalAI({
      id: betrayer,
      customTitle:
        betrayer === 'nadia'
          ? 'Nemesis Proxy · Grudge Pressure'
          : betrayer === 'teo'
            ? 'Rogue Whistleblower · Feed Hijacked'
            : 'Interim Arbiter · Charter 9B',
      tempoStealActive: betrayer === 'nadia' || betrayer === 'soren',
      tempoStealBlockedByPerk: hasAnalogImmunity,
      grudgePressure: betrayer === 'nadia',
      grudgeDomainId,
      grudgeDomainName: grudgeDomainId !== undefined ? getDomainMeta(grudgeDomainId).name : undefined,
      overclockChanceOverride: betrayer === 'soren' ? 0.72 : undefined,
    });

    this.startMatchSession({
      mode: 'CAMPAIGN',
      campaignNodeId: 'sg_singapore',
      venue: 'SG',
      venueTitle: 'SINGAPORE · HIGH-ALERT SKY-BRIDGE',
      baseLighting: 'FRACTURE',
      baseMusicLayer: 'FRACTURE',
      hostCharacter: betrayer,
      questions,
      rivalAI: rival,
      grudgeDomainId,
      betrayer,
      perksAllowed: true,
      blackSalonDoublePoints: false,
      lockAllPeel: false,
      lockTier3Only: false,
      bossRelicId: 'council_seal',
    });
  }

  private beginApexMatch(): void {
    const snap = this.story.getSnapshot();
    const nemesisNadia = snap.bonds.nadia === 'NEMESIS';
    const weakestDomain = this.trivia.getWeakestDomain();
    const phase2Rival: 'nadia' | 'soren' =
      nemesisNadia || snap.betrayer === 'nadia' ? 'nadia' : 'soren';

    // Assemble the 3-Phase 6-Question Grand Finale Showdown!
    const usedQids = new Set<number>();
    const pickOne = (spec: MatchQuerySpec): QuestionRecord | undefined => {
      const list = this.fetchQuestionsWithFallback(spec, 1, usedQids);
      const q = list[0];
      if (q) usedQids.add(q.qid);
      return q;
    };

    const q1 = pickOne({
      count: 1,
      mode: 'CAMPAIGN',
      regions: ['GLOBAL'],
      archetypes: ['GAUNTLET_SHATTER'],
      boostTags: ['FINALE_SYNTHESIS', 'HIGH_POWER'],
      targetDifficultyCurve: [0.9],
      allowRepeatsFallback: true,
    });
    const q2 = pickOne({
      count: 1,
      mode: 'CAMPAIGN',
      regions: ['GLOBAL'],
      archetypes: ['CODEX_DUAL_RING'],
      boostTags: ['FINALE_SYNTHESIS', 'MERIDIAN_ZERO'],
      targetDifficultyCurve: [1.1],
      allowRepeatsFallback: true,
    });
    const q3 = pickOne({
      count: 1,
      mode: 'CAMPAIGN',
      regions: ['GLOBAL'],
      archetypes: ['CALIBRATOR_DIAL'],
      boostTags: ['FINALE_SYNTHESIS', 'RIVAL_PRESSURE'],
      targetDifficultyCurve: [1.3],
      allowRepeatsFallback: true,
    });
    const q4 = pickOne({
      count: 1,
      mode: 'CAMPAIGN',
      domains: nemesisNadia ? [weakestDomain] : undefined,
      regions: nemesisNadia ? undefined : ['GLOBAL'],
      archetypes: ['SIGHTLINE_LOCK'],
      boostTags: ['RIVAL_PRESSURE', 'FINALE_SYNTHESIS'],
      targetDifficultyCurve: [1.5],
      allowRepeatsFallback: true,
    });
    const q5 = pickOne({
      count: 1,
      mode: 'CAMPAIGN',
      regions: ['GLOBAL'],
      archetypes: ['SIGHTLINE_LOCK'],
      boostTags: ['FINALE_SYNTHESIS', 'MERIDIAN_ZERO'],
      targetDifficultyCurve: [1.7],
      allowRepeatsFallback: true,
    });
    const q6 = pickOne({
      count: 1,
      mode: 'CAMPAIGN',
      regions: ['GLOBAL'],
      archetypes: ['HERO_ARTIFACT_SYNTHESIS', 'SIGHTLINE_LOCK'],
      boostTags: ['FINALE_SYNTHESIS', 'MERIDIAN_ZERO', 'CLASSIFIED_LEDGER'],
      targetDifficultyCurve: [2.0],
      allowRepeatsFallback: true,
    });

    const questions = [q1, q2, q3, q4, q5, q6].filter(
      (q): q is QuestionRecord => Boolean(q)
    );

    if (questions.length < 6) {
      const topUp = this.fetchQuestionsWithFallback(
        {
          count: 6 - questions.length,
          mode: 'CAMPAIGN',
          regions: ['GLOBAL'],
          allowRepeatsFallback: true,
        },
        6 - questions.length,
        usedQids
      );
      questions.push(...topUp);
    }

    if (questions.length === 0) {
      this.showToast('Question bank unavailable.');
      this.enterWorldGlobe();
      return;
    }

    // Phase I Rival: Chancellor Ingrid Lindqvist (Gauntlet of the World)
    const lindqvist = new RivalAI({
      id: 'lindqvist',
      customTitle: 'Phase I · Gauntlet of the World',
      baseAccuracyOverride: 0.79,
    });

    this.startMatchSession({
      mode: 'CAMPAIGN',
      campaignNodeId: 'global_apex',
      venue: 'GLOBAL',
      venueTitle: 'APEX FORUM · PHASE I: GAUNTLET OF THE WORLD',
      baseLighting: 'BROADCAST',
      baseMusicLayer: 'DEDUCTION',
      hostCharacter: 'lindqvist',
      questions,
      rivalAI: lindqvist,
      grudgeDomainId: nemesisNadia ? weakestDomain : undefined,
      apexPhase2RivalId: phase2Rival,
      perksAllowed: true,
      blackSalonDoublePoints: false,
      lockAllPeel: false,
      lockTier3Only: false,
      bossRelicId: 'master_ledger',
    });
  }

  private beginDailyMatch(): void {
    const { dateStr, seed } = this.trivia.getDailySeedAndDate();
    const questions = this.fetchQuestionsWithFallback(
      {
        count: 7,
        mode: 'DAILY',
        seed,
        allowRepeatsFallback: true,
      },
      7
    );

    if (questions.length === 0) {
      this.showToast('Daily Global Feed unavailable.');
      this.enterTitle(true);
      return;
    }

    this.startMatchSession({
      mode: 'DAILY',
      venue: 'STUDIO',
      venueTitle: `THE GLOBAL FEED · ${dateStr}`,
      baseLighting: 'BROADCAST',
      baseMusicLayer: 'DEDUCTION',
      hostCharacter: 'vance',
      questions,
      rivalAI: null,
      perksAllowed: false, // Uniform Global Seed — zero perks!
      blackSalonDoublePoints: false,
      lockAllPeel: false,
      lockTier3Only: false,
      dailyDateStr: dateStr,
      dailySeed: seed,
    });
  }

  private beginBriefingMatch(domain: DomainId | 'MIX', archetypeFilter?: Archetype3D): void {
    this.lastBriefingDomain = domain;
    this.lastBriefingArchetype = archetypeFilter;
    const domainMeta = domain === 'MIX' ? null : getDomainMeta(domain);
    const morphLabel = archetypeFilter ? ARCHETYPE_LABELS[archetypeFilter] : null;

    const questions = this.fetchQuestionsWithFallback(
      {
        count: 5,
        mode: 'BRIEFING',
        domains: domain === 'MIX' ? undefined : [domain],
        archetypes: archetypeFilter ? [archetypeFilter] : undefined,
        allowRepeatsFallback: true,
      },
      5
    );

    if (questions.length === 0) {
      this.showToast('No briefing questions found.');
      this.enterBriefingPicker();
      return;
    }

    const titleParts = ['BRIEFING ROOM'];
    if (domainMeta) {
      titleParts.push(domainMeta.name.toUpperCase());
    } else if (!morphLabel) {
      titleParts.push('GLOBAL MIX');
    }
    if (morphLabel) {
      titleParts.push(morphLabel);
    }

    this.startMatchSession({
      mode: 'BRIEFING',
      briefingDomain: domain,
      briefingArchetype: archetypeFilter,
      venue: 'STUDIO',
      venueTitle: titleParts.join(' · '),
      baseLighting: 'BROADCAST',
      baseMusicLayer: 'DEDUCTION',
      hostCharacter: 'nadia',
      questions,
      rivalAI: null,
      perksAllowed: true,
      blackSalonDoublePoints: false,
      lockAllPeel: false,
      lockTier3Only: false,
    });
  }

  private beginEndlessDescent(): void {
    const strata = getEndlessStrataForFloor(1);
    const firstBatch = this.fetchEndlessBatch(1, new Set<number>());

    if (firstBatch.length === 0) {
      this.showToast('Archive Descent bank unavailable.');
      this.enterTitle(true);
      return;
    }

    this.startMatchSession({
      mode: 'ENDLESS',
      venue: 'LEDGER',
      venueTitle: `THE ARCHIVE DESCENT · ${strata.strataName}`,
      baseLighting: strata.lightingState,
      baseMusicLayer: 'DEDUCTION',
      hostCharacter: 'none',
      questions: firstBatch,
      rivalAI: null,
      perksAllowed: true,
      blackSalonDoublePoints: false,
      lockAllPeel: false,
      lockTier3Only: strata.lockTier3,
      peelLockReason: strata.lockTier3 ? 'MERIDIAN ZERO — TIER-3 LOCKED' : undefined,
      endlessUsedQids: new Set(firstBatch.map((q) => q.qid)),
    });
  }

  // ==========================================================================
  // Mode 5: World Council Trials — Async Kinetic Ghost Duels & Black Salon Bracket
  // ==========================================================================

  private beginGhostDuelMatch(ghostId: string): void {
    const ghost =
      TRIALS_GHOST_CONTENDERS.find((g) => g.id === ghostId) ?? TRIALS_GHOST_CONTENDERS[0];

    const usedQids = new Set<number>();
    const cadence: Archetype3D[] = [
      'SIGHTLINE_LOCK',
      'CODEX_DUAL_RING',
      'GAUNTLET_SHATTER',
      'CALIBRATOR_DIAL',
      'SIGHTLINE_LOCK',
    ];
    const baseIrt = clamp((ghost.elo - 1350) / 450, -0.4, 1.8);
    const questions: QuestionRecord[] = [];
    for (let i = 0; i < cadence.length; i++) {
      const picked = this.fetchQuestionsWithFallback(
        {
          count: 1,
          mode: 'TRIALS',
          archetypes: [cadence[i]],
          targetDifficultyCurve: [round2(baseIrt + i * 0.15)],
          allowRepeatsFallback: true,
        },
        1,
        usedQids
      );
      if (picked[0]) {
        questions.push(picked[0]);
        usedQids.add(picked[0].qid);
      }
    }

    if (questions.length === 0) {
      this.showToast('Trials question bank unavailable.');
      this.enterTrialsHub();
      return;
    }

    const ghostAI = new RivalAI({
      id: ghost.portraitId,
      customName: ghost.handle,
      customTitle: `${ghost.countryCode} · ELO ${ghost.elo} · ${ghost.styleTag}`,
      elo: ghost.elo,
      peelChanceOverride: ghost.peelChance,
      overclockChanceOverride: ghost.overclockChance,
      speedMultiplier: ghost.speedMultiplier,
      isGhostTelemetry: true,
    });

    this.startMatchSession({
      mode: 'TRIALS',
      trialsKind: 'GHOST_DUEL',
      trialsGhost: ghost,
      venue: ghost.venue,
      venueTitle: `GHOST DUEL · ${ghost.handle} (ELO ${ghost.elo})`,
      baseLighting: 'BROADCAST',
      baseMusicLayer: 'DEDUCTION',
      hostCharacter: ghost.portraitId,
      questions,
      rivalAI: ghostAI,
      perksAllowed: false, // Zero Pay-to-Win uniform competitive fairness
      blackSalonDoublePoints: false,
      lockAllPeel: false,
      lockTier3Only: false,
    });
  }

  private beginBlackSalonBracketMatch(): void {
    if (this.salonEliminated) {
      this.salonEliminated = false;
      this.salonRound = 0;
    }

    const targetRound: 1 | 2 | 3 =
      this.salonRound === 2 ? 2 : this.salonRound === 3 ? 3 : 1;
    this.salonRound = targetRound;

    const roundCfg =
      BLACK_SALON_BRACKET_ROUNDS[targetRound - 1] ?? BLACK_SALON_BRACKET_ROUNDS[0];

    const questions = this.fetchQuestionsWithFallback(
      {
        count: roundCfg.questionCount,
        mode: 'TRIALS',
        boostTags: ['BLACK_SALON', 'HIGH_STAKES_BLUFF', 'ESPIONAGE', 'LATERAL_DEDUCTION'],
        targetDifficultyCurve:
          targetRound === 1
            ? [0.4, 0.8, 1.1, 1.4]
            : targetRound === 2
              ? [0.7, 1.0, 1.3, 1.7]
              : [0.9, 1.2, 1.5, 1.8, 2.2],
        allowRepeatsFallback: true,
      },
      roundCfg.questionCount
    );

    if (questions.length === 0) {
      this.showToast('Black Salon bank unavailable.');
      this.enterTrialsHub();
      return;
    }

    const opponentAI = new RivalAI({
      id: roundCfg.portraitId,
      customName: roundCfg.opponentHandle,
      customTitle: roundCfg.opponentTitle,
      elo: roundCfg.elo,
      analogStaticJammed: roundCfg.lockAllPeel,
      speedMultiplier: targetRound === 2 ? 0.82 : 0.9,
      overclockChanceOverride: roundCfg.suddenDeath ? 0.68 : 0.5,
      isGhostTelemetry: true,
    });

    this.startMatchSession({
      mode: 'TRIALS',
      trialsKind: 'BLACK_SALON',
      salonRoundCfg: roundCfg,
      venue: roundCfg.venue,
      venueTitle: `BLACK SALON · ${roundCfg.roundLabel}`,
      baseLighting: 'FRACTURE',
      baseMusicLayer: 'FRACTURE',
      hostCharacter: roundCfg.portraitId,
      questions,
      rivalAI: opponentAI,
      perksAllowed: false,
      blackSalonDoublePoints: roundCfg.suddenDeath,
      blackSalonSuddenDeath: roundCfg.suddenDeath,
      chronoOverrideSec: roundCfg.chronoOverrideSec,
      lockAllPeel: roundCfg.lockAllPeel,
      lockTier3Only: false,
      peelLockReason: roundCfg.lockAllPeel ? 'ANALOG STATIC — PEEL JAMMED' : undefined,
    });
  }

  private fetchEndlessBatch(startFloor: number, usedQids: Set<number>): QuestionRecord[] {
    const strata = getEndlessStrataForFloor(startFloor);
    const [minB, maxB] = strata.targetIrtRange;
    const curve = Array.from({ length: 5 }, (_, idx) =>
      round2(minB + ((maxB - minB) * idx) / 4)
    );

    const picked = this.fetchQuestionsWithFallback(
      {
        count: 5,
        mode: 'ENDLESS',
        targetDifficultyCurve: curve,
        boostTags:
          startFloor >= 11
            ? ['MERIDIAN_ZERO', 'ARCHIVE_CORE']
            : startFloor >= 6
              ? ['CLASSIFIED_LEDGER', 'HIGH_POWER']
              : undefined,
        allowRepeatsFallback: true,
      },
      5
    );

    const fresh = picked.filter((q) => !usedQids.has(q.qid));
    if (fresh.length >= 5) {
      const batch = fresh.slice(0, 5);
      for (const q of batch) usedQids.add(q.qid);
      return batch;
    }

    const batch = picked.slice(0, 5);
    for (const q of batch) usedQids.add(q.qid);
    return batch;
  }

  private startMatchSession(opts: {
    mode: GameModeId;
    campaignNodeId?: PlayableCampaignNodeId;
    briefingDomain?: DomainId | 'MIX';
    briefingArchetype?: Archetype3D;
    trialsKind?: 'GHOST_DUEL' | 'BLACK_SALON';
    trialsGhost?: TrialsGhostDef;
    salonRoundCfg?: BlackSalonRoundConfig;
    venue: VenueId;
    venueTitle: string;
    baseLighting: LightingState;
    baseMusicLayer: MusicLayer;
    hostCharacter: CharacterId;
    questions: QuestionRecord[];
    rivalAI: RivalAI | null;
    grudgeDomainId?: DomainId;
    betrayer?: BetrayerId;
    apexPhase2RivalId?: 'nadia' | 'soren';
    campaignShields?: number;
    campaignMaxShields?: number;
    perksAllowed: boolean;
    blackSalonDoublePoints: boolean;
    blackSalonSuddenDeath?: boolean;
    chronoOverrideSec?: number;
    lockAllPeel: boolean;
    lockTier3Only: boolean;
    peelLockReason?: string;
    dailyDateStr?: string;
    dailySeed?: number;
    bossRelicId?: HeroRelicId;
    choiceUnlockedPerk?: PerkId;
    endlessUsedQids?: Set<number>;
  }): void {
    this.stopTickLoop();
    this.dialogueRunner = null;
    this.onSummaryPrimary = null;
    this.onSummarySecondary = null;
    this.state.endingAwarded = null;

    const cShields = opts.campaignShields ?? 0;
    const cMaxShields = opts.campaignMaxShields ?? 0;

    this.match = {
      mode: opts.mode,
      campaignNodeId: opts.campaignNodeId,
      briefingDomain: opts.briefingDomain,
      briefingArchetype: opts.briefingArchetype,
      trialsKind: opts.trialsKind,
      trialsGhost: opts.trialsGhost,
      salonRoundCfg: opts.salonRoundCfg,
      venue: opts.venue,
      venueTitle: opts.venueTitle,
      baseLighting: opts.baseLighting,
      baseMusicLayer: opts.baseMusicLayer,
      hostCharacter: opts.hostCharacter,
      questions: opts.questions,
      currentIndex: 0,
      resolutions: [],
      score: 0,
      streak: 0,
      maxStreak: 0,
      overclockAttempts: 0,
      overclockHits: 0,
      bullseyeHit: false,
      peelTierSum: 0,
      redactionUsed: false,
      coopCrossCheckUsed: false,
      blackSalonDoublePoints: opts.blackSalonDoublePoints,
      blackSalonSuddenDeath: Boolean(opts.blackSalonSuddenDeath),
      chronoOverrideSec: opts.chronoOverrideSec,
      lockAllPeel: opts.lockAllPeel,
      lockTier3Only: opts.lockTier3Only,
      peelLockReason: opts.peelLockReason,
      perksAllowed: opts.perksAllowed,
      rivalAI: opts.rivalAI,
      grudgeDomainId: opts.grudgeDomainId,
      betrayer: opts.betrayer,
      apexPhase2RivalId: opts.apexPhase2RivalId,
      campaignShields: cShields,
      campaignMaxShields: cMaxShields,
      dailyDateStr: opts.dailyDateStr,
      dailySeed: opts.dailySeed,
      bossRelicId: opts.bossRelicId,
      choiceUnlockedPerk: opts.choiceUnlockedPerk,
      endlessFloor: 0,
      endlessBankedScore: 0,
      endlessUnbankedScore: 0,
      endlessShields: 3,
      endlessMaxShields: 3,
      endlessOverclockStreak: 0,
      endlessStrataMultiplier: 1.0,
      endlessUsedQids: opts.endlessUsedQids ?? new Set<number>(),
    };

    this.state.mode = opts.mode;
    this.state.venue = opts.venue;
    this.state.venueTitle = opts.venueTitle;
    this.state.lightingState = opts.baseLighting;
    this.state.playerScore = 0;
    this.state.streak = 0;
    this.state.shields = opts.mode === 'ENDLESS' ? 3 : cShields;
    this.state.maxShields = opts.mode === 'ENDLESS' ? 3 : cMaxShields;
    this.state.dialogue = null;
    this.state.lastResolution = null;
    this.state.endlessCheckpoint = null;
    this.state.matchSummary = null;
    this.state.rival = opts.rivalAI ? opts.rivalAI.getUIState() : null;

    this.applyActiveSkinToScene();
    this.loadCurrentQuestion();
  }

  // ==========================================================================
  // Question Loading & Veritas Prism Setup
  // ==========================================================================

  private loadCurrentQuestion(): void {
    const match = this.match;
    if (!match) return;

    const rawQuestion = match.questions[match.currentIndex];
    if (!rawQuestion) {
      this.finishMatch();
      return;
    }

    // Elevate Campaign Boss finale Sightline/Hero questions to mount the chapter's exact 3D Hero Relic!
    const isFinalCampaignSlot =
      match.mode === 'CAMPAIGN' &&
      match.currentIndex === match.questions.length - 1 &&
      Boolean(match.bossRelicId);
    const activeRelicId: HeroRelicId | undefined = isFinalCampaignSlot
      ? (match.bossRelicId ?? rawQuestion.heroRelicId)
      : rawQuestion.heroRelicId;
    const question: QuestionRecord =
      isFinalCampaignSlot &&
      activeRelicId &&
      (rawQuestion.archetype === 'SIGHTLINE_LOCK' ||
        rawQuestion.archetype === 'HERO_ARTIFACT_SYNTHESIS')
        ? { ...rawQuestion, archetype: 'HERO_ARTIFACT_SYNTHESIS', heroRelicId: activeRelicId }
        : rawQuestion;

    const isEndless = match.mode === 'ENDLESS';
    const currentFloor = isEndless ? match.endlessFloor + 1 : match.currentIndex + 1;
    const endlessStrata = isEndless ? getEndlessStrataForFloor(currentFloor) : null;

    if (endlessStrata) {
      match.baseLighting = endlessStrata.lightingState;
      match.endlessStrataMultiplier = endlessStrata.scoreMultiplier;
      match.lockTier3Only = endlessStrata.lockTier3;
      match.peelLockReason = endlessStrata.lockTier3
        ? 'MERIDIAN ZERO — TIER-3 LOCKED'
        : undefined;
      match.venueTitle = `THE ARCHIVE DESCENT · ${endlessStrata.strataName}`;
    }

    // All 10 Active Perks
    const hasComposure = match.perksAllowed && this.story.hasActivePerk('DIPLOMAT_COMPOSURE');
    const hasAnalogMaster = match.perksAllowed && this.story.hasActivePerk('ANALOG_STATIC_MASTER');
    const hasHorizonLens = match.perksAllowed && this.story.hasActivePerk('HORIZON_LENS');
    const hasPeoplesLens = match.perksAllowed && this.story.hasActivePerk('PEOPLES_LENS');
    const hasRedaction =
      match.perksAllowed &&
      this.story.hasActivePerk('DIPLOMATIC_REDACTION') &&
      !match.redactionUsed;
    const hasCleanHands = match.perksAllowed && this.story.hasActivePerk('CLEAN_HANDS');
    const hasMaverick = match.perksAllowed && this.story.hasActivePerk('MAVERICK_GAMBIT');
    const isSightlineQuestion =
      question.archetype === 'SIGHTLINE_LOCK' ||
      question.archetype === 'HERO_ARTIFACT_SYNTHESIS';
    const hasCoopCrossCheck =
      match.perksAllowed &&
      isSightlineQuestion &&
      this.story.hasActivePerk('COOP_CROSSCHECK') &&
      !match.coopCrossCheckUsed;
    const hasCouncilOverride =
      match.perksAllowed &&
      this.story.hasActivePerk('COUNCIL_OVERRIDE') &&
      this.matchesCouncilOverride(question);
    const hasBluffEcho = match.perksAllowed && this.story.hasActivePerk('BLUFF_ECHO');

    // Compute Chrono-Ring time budget
    let timeTotalSec: number;
    if (question.archetype === 'GAUNTLET_SHATTER') {
      timeTotalSec = Math.max(5.5, question.gauntletExt?.windowSec ?? 7.0);
      if (hasComposure) timeTotalSec += 1.0;
      if (hasAnalogMaster) timeTotalSec += 1.2;
    } else if (question.archetype === 'CODEX_DUAL_RING') {
      timeTotalSec = 24;
      if (hasComposure) timeTotalSec += 2.0;
      if (hasAnalogMaster) timeTotalSec += 2.5;
    } else if (question.archetype === 'CALIBRATOR_DIAL') {
      timeTotalSec = 22;
      if (hasComposure) timeTotalSec += 2.0;
      if (hasAnalogMaster) timeTotalSec += 2.5;
    } else {
      timeTotalSec = 20;
      if (hasComposure) timeTotalSec += 2.0;
      if (hasAnalogMaster) timeTotalSec += 2.5;
    }

    if (match.campaignNodeId === 'ch_prologue') {
      timeTotalSec = Math.max(timeTotalSec, 26);
    }
    if (endlessStrata && endlessStrata.timePenaltySec > 0) {
      timeTotalSec = Math.max(8, timeTotalSec - endlessStrata.timePenaltySec);
    }
    if (match.chronoOverrideSec !== undefined) {
      // Black Salon All-In Blitz (11s Chrono, 6s Gauntlet)
      timeTotalSec =
        question.archetype === 'GAUNTLET_SHATTER'
          ? Math.min(timeTotalSec, 6.0)
          : Math.min(timeTotalSec, match.chronoOverrideSec);
    }

    // Deterministic RNG for Daily, standard Math.random otherwise
    const rng =
      match.dailySeed !== undefined
        ? createMulberry32(match.dailySeed + question.qid * 7919 + match.currentIndex * 31)
        : Math.random;

    // Prepare Sightline facets
    const facets: ActiveFacetDisplay[] = [];
    const distractorPlausibility = new Map<number, number>();
    let correctFacetIndex = 0;
    const probabilityHintIndices: number[] = [];

    if (
      question.archetype === 'SIGHTLINE_LOCK' ||
      question.archetype === 'HERO_ARTIFACT_SYNTHESIS'
    ) {
      const entries: Array<{ text: string; isCorrect: boolean; plausibility: number }> = [
        { text: question.answerCorrect, isCorrect: true, plausibility: 1.0 },
      ];
      const distractors = question.distractors ?? [];
      for (const d of distractors.slice(0, 4)) {
        if (d.text && d.text.trim() !== '') {
          entries.push({ text: d.text, isCorrect: false, plausibility: d.plausibility });
        }
      }
      const fallbackLabels = ['Vienna', 'Alexandria', 'Kyoto', 'Reykjavik'];
      let padIdx = 0;
      while (entries.length < 4 && padIdx < fallbackLabels.length) {
        const candidate = fallbackLabels[padIdx++];
        if (!entries.some((e) => e.text.toLowerCase() === candidate.toLowerCase())) {
          entries.push({ text: candidate, isCorrect: false, plausibility: 0.25 });
        }
      }

      // Fisher-Yates shuffle
      for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = entries[i];
        entries[i] = entries[j];
        entries[j] = tmp;
      }

      const decoyRanked: Array<{ idx: number; plausibility: number }> = [];
      entries.forEach((entry, idx) => {
        if (entry.isCorrect) {
          correctFacetIndex = idx;
        } else {
          distractorPlausibility.set(idx, entry.plausibility);
          decoyRanked.push({ idx, plausibility: entry.plausibility });
        }
      });
      decoyRanked.sort((a, b) => a.plausibility - b.plausibility);

      // Horizon Lens marks weakest decoy; People's Sightline marks consensus elimination (stacks cleanly!)
      const hintBudget = (hasHorizonLens ? 1 : 0) + (hasPeoplesLens ? 1 : 0);
      for (let i = 0; i < Math.min(hintBudget, Math.max(0, decoyRanked.length - 1)); i++) {
        probabilityHintIndices.push(decoyRanked[i].idx);
      }

      entries.forEach((entry, idx) => {
        facets.push({
          index: idx,
          text: entry.text,
          shattered: false,
          redacted: false,
          stressFracture: probabilityHintIndices.includes(idx),
        });
      });
    }

    // Prepare Codex Dual-Ring
    let codexRawTop: string[] = [];
    let codexRawBottom: string[] = [];
    let codexBottomCanonical: number[] = [];
    let codexAlignedSlots: number[] = [0, 1, 2];

    if (question.archetype === 'CODEX_DUAL_RING' && question.codexExt) {
      const pairs = question.codexExt.pairs;
      codexRawTop = pairs.map((p) => p.subject);
      const baseTargets = [...pairs.map((p) => p.target), question.codexExt.decoyTarget];
      const baseCanonical = [0, 1, 2, 3];
      const shift = 1 + Math.floor(rng() * 3);
      for (let i = 0; i < 4; i++) {
        const srcIdx = (i + shift) % 4;
        codexRawBottom.push(baseTargets[srcIdx]);
        codexBottomCanonical.push(baseCanonical[srcIdx]);
      }
    }

    // Prepare Calibrator Dial initial position
    let calibratorNormPos = 0.5;
    const calibratorTol = 0.16;
    if (question.archetype === 'CALIBRATOR_DIAL' && question.calibratorExt) {
      const ext = question.calibratorExt;
      const range = Math.max(1e-6, ext.maxVal - ext.minVal);
      const exactNorm = clamp((ext.exactVal - ext.minVal) / range, 0.05, 0.95);
      const offset = 0.22 + rng() * 0.12;
      calibratorNormPos =
        exactNorm > 0.5
          ? clamp(exactNorm - offset, 0.12, 0.88)
          : clamp(exactNorm + offset, 0.12, 0.88);
    }

    // Active modifiers display pills
    const activeModifiers: string[] = [];
    if (match.mode === 'DAILY') {
      activeModifiers.push('GLOBAL SEED · PURE SKILL');
    }
    if (match.trialsKind === 'GHOST_DUEL') {
      activeModifiers.push('ASYNC GHOST TELEMETRY');
    }
    if (match.salonRoundCfg) {
      activeModifiers.push(match.salonRoundCfg.modifierTitle);
    }
    if (match.blackSalonDoublePoints && !match.salonRoundCfg) {
      activeModifiers.push('BLACK SALON · 2x POINTS');
    }
    if (match.lockAllPeel && !match.salonRoundCfg) {
      activeModifiers.push('ANALOG STATIC · PEEL JAMMED');
    } else if (match.lockTier3Only) {
      activeModifiers.push('TIER-3 PEEL LOCKED');
    }
    if (match.grudgeDomainId !== undefined && question.l0Domain === match.grudgeDomainId) {
      activeModifiers.push(
        `GRUDGE COUNTER-PICK · ${getDomainMeta(match.grudgeDomainId).shortName.toUpperCase()}`
      );
    }
    if (endlessStrata) {
      activeModifiers.push(`${endlessStrata.strataName} · ${endlessStrata.scoreMultiplier}x`);
    }
    if (hasCleanHands) activeModifiers.push('CLEAN HANDS +25% T1');
    if (hasHorizonLens) activeModifiers.push('HORIZON LENS');
    if (hasPeoplesLens) activeModifiers.push("PEOPLE'S SIGHTLINE +10%");
    if (hasCoopCrossCheck) activeModifiers.push('CO-OP CROSS-CHECK (3x T2)');
    if (hasCouncilOverride) activeModifiers.push('COUNCIL OVERRIDE +20%');
    if (hasBluffEcho) activeModifiers.push('BLUFF ECHO');
    if (hasMaverick) activeModifiers.push('MAVERICK GAMBIT');
    if (hasComposure) activeModifiers.push('COMPOSURE +2s');
    if (hasAnalogMaster) activeModifiers.push('ANALOG INSTINCT');

    const tutorialHint =
      match.campaignNodeId === 'ch_prologue'
        ? PROLOGUE_TUTORIAL_HINTS[match.currentIndex]
        : undefined;

    // Rival AI initialization for this question
    let rivalState: RivalUIState | null = null;
    if (match.rivalAI) {
      rivalState = match.rivalAI.beginQuestion(question, timeTotalSec);
      this.scene.setRivalPrismStatus('THINKING');
    } else {
      this.scene.setRivalPrismStatus('HIDDEN');
    }

    // Configure 3D Scene for active Prism
    const prismOptions: PrismLoadOptions = {
      facets: facets.map((f) => f.text),
      probabilityHintIndices: probabilityHintIndices.length > 0 ? probabilityHintIndices : undefined,
      disablePeel: match.lockAllPeel || question.archetype === 'GAUNTLET_SHATTER',
      relicId: activeRelicId,
      codexTop: codexRawTop.length > 0 ? codexRawTop : undefined,
      codexBottom: codexRawBottom.length > 0 ? codexRawBottom : undefined,
      calibratorInitialPos: calibratorNormPos,
      calibratorInitialTol: calibratorTol,
    };

    this.scene.setModeView('PRISM_ACTIVE');
    this.scene.setVenue(match.venue, match.baseLighting);
    this.scene.setCharacter(
      match.rivalAI ? match.rivalAI.getId() : match.hostCharacter,
      'NEUTRAL'
    );
    this.scene.loadQuestionOnPrism(question, prismOptions);
    this.scene.setChronoProgress(1);

    if (question.archetype === 'CALIBRATOR_DIAL') {
      this.scene.setCalibratorState(calibratorNormPos, calibratorTol);
    }

    if (question.archetype === 'CODEX_DUAL_RING') {
      const initialAligned = this.scene.getCodexAlignment();
      if (Array.isArray(initialAligned) && initialAligned.length === 3) {
        codexAlignedSlots = initialAligned.slice(0, 3);
      }
    }

    const initialActiveFacet =
      facets.length > 0 ? clamp(this.scene.getActiveFacetIndex(), 0, facets.length - 1) : 0;

    // Update Adaptive Music Layer
    const musicLayer: MusicLayer =
      match.baseLighting === 'FRACTURE'
        ? 'FRACTURE'
        : match.streak >= 3
          ? 'STREAK'
          : match.baseMusicLayer;
    this.audio.setVenueMusic(match.venue, musicLayer);

    this.qRuntime = {
      question,
      facets,
      correctFacetIndex,
      distractorPlausibility,
      codexRawTop,
      codexRawBottom,
      codexBottomCanonical,
      codexAlignedSlots,
      calibratorNormPos,
      calibratorTol,
      elapsedSec: 0,
      timeTotalSec,
      timeRemainingSec: timeTotalSec,
      countdownEscalated: false,
      resolved: false,
      ethicalInterruptTriggered: false,
      ethicalInterruptActive: false,
      coopCrossCheckFreeTier2: false,
      bluffEchoUsedThisQuestion: false,
      lastOverclockHapticTs: 0,
      lastCalibratorAudioTs: 0,
      lastSpinAudioTs: 0,
      lastUiEmitTs: 0,
    };

    const isSightline =
      question.archetype === 'SIGHTLINE_LOCK' ||
      question.archetype === 'HERO_ARTIFACT_SYNTHESIS';

    const activeQuestion: ActiveQuestionState = {
      question,
      questionNumber: isEndless ? match.endlessFloor + 1 : match.currentIndex + 1,
      totalQuestions: isEndless ? 0 : match.questions.length,
      facets,
      activeFacetIndex: initialActiveFacet,
      peelTier: 1,
      peelLocked: match.lockAllPeel || question.archetype === 'GAUNTLET_SHATTER',
      peelLockReason: match.lockAllPeel ? match.peelLockReason : undefined,
      revealedClues: [],
      timeRemainingSec: timeTotalSec,
      timeTotalSec,
      overclockProgress: 0,
      overclockActive: false,
      calibratorVal: computeCalibratorValue(question, calibratorNormPos),
      calibratorTolerancePct: calibratorTol,
      calibratorMultiplier: computeCalibratorMultiplier(calibratorTol),
      codexOrderTop: [...codexRawTop],
      codexOrderBottom: this.getDisplayedCodexBottom(codexRawBottom, codexAlignedSlots),
      codexAlignedCount: this.computeCodexAlignedCount(codexAlignedSlots, codexRawBottom.length),
      canRedactionPerk: Boolean(hasRedaction && isSightline && facets.length >= 3),
      activeModifiers,
      tutorialHint,
      ethicalInterrupt: undefined,
    };

    this.state.screen = 'ACTIVE_MATCH';
    this.state.venue = match.venue;
    this.state.venueTitle = match.venueTitle;
    this.state.lightingState = match.baseLighting;
    this.state.rival = rivalState;
    this.state.activeQuestion = activeQuestion;
    this.state.lastResolution = null;
    this.state.endlessCheckpoint = null;

    this.emitState();
    this.startTickLoop();
  }

  private matchesCouncilOverride(question: QuestionRecord): boolean {
    return (
      question.l0Domain === 0 || // History
      question.l0Domain === 8 || // Society & Law
      question.narrativeTags.includes('HIGH_POWER') ||
      question.narrativeTags.includes('SOVEREIGN_BLOC') ||
      question.archetype === 'HERO_ARTIFACT_SYNTHESIS'
    );
  }

  private getDisplayedCodexBottom(rawBottom: string[], alignedSlots: number[]): string[] {
    if (rawBottom.length === 0) return [];
    return alignedSlots.map((slot) => rawBottom[clamp(slot, 0, rawBottom.length - 1)] ?? '');
  }

  private computeCodexAlignedCount(alignedSlots: number[], bottomLen: number): number {
    if (bottomLen === 0) return 0;
    const distinct = new Set<number>();
    for (const s of alignedSlots) {
      if (s >= 0 && s < bottomLen) distinct.add(s);
    }
    return distinct.size;
  }

  // ==========================================================================
  // Real-Time Tick Loop (Chrono-Ring, Overclock, Rival AI, Ethical Interrupt)
  // ==========================================================================

  private startTickLoop(): void {
    this.stopTickLoop();
    this.lastTickTs = performance.now();
    const step = (now: number) => {
      if (this.disposed) return;
      const dt = clamp((now - this.lastTickTs) / 1000, 0, 0.05);
      this.lastTickTs = now;
      this.tick(dt, now);
      if (this.state.screen === 'ACTIVE_MATCH' && this.qRuntime && !this.qRuntime.resolved) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.rafId = null;
      }
    };
    this.rafId = requestAnimationFrame(step);
  }

  private stopTickLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick(dt: number, nowMs: number): void {
    const match = this.match;
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (!match || !rt || !aq || rt.resolved || this.state.screen !== 'ACTIVE_MATCH') {
      return;
    }

    if (rt.ethicalInterruptActive) {
      return;
    }

    let forceUiEmit = false;

    rt.elapsedSec += dt;
    rt.timeRemainingSec = Math.max(0, rt.timeRemainingSec - dt);
    aq.timeRemainingSec = rt.timeRemainingSec;

    const chronoRatio = clamp(rt.timeRemainingSec / Math.max(0.1, rt.timeTotalSec), 0, 1);
    this.scene.setChronoProgress(chronoRatio);

    // Geneva Prologue Q2 Live Mid-Question Ethical Interrupt (~3.5s elapsed)
    if (
      match.campaignNodeId === 'ch_prologue' &&
      match.currentIndex === 1 &&
      !rt.ethicalInterruptTriggered &&
      rt.elapsedSec >= PROLOGUE_ETHICAL_INTERRUPT.triggerElapsedSec
    ) {
      rt.ethicalInterruptTriggered = true;
      rt.ethicalInterruptActive = true;

      if (aq.overclockActive) {
        aq.overclockActive = false;
        aq.overclockProgress = 0;
        this.scene.cancelOverclockVisual();
        this.audio.stopOverclockCharge(false);
      }

      aq.ethicalInterrupt = {
        speaker: PROLOGUE_ETHICAL_INTERRUPT.speaker,
        message: PROLOGUE_ETHICAL_INTERRUPT.message,
        leakedHint:
          rt.question.clues[0] ||
          'A partial holographic deduction flickers across the obsidian table.',
        choices: PROLOGUE_ETHICAL_INTERRUPT.choices.map((c) => ({
          id: c.id,
          label: c.label,
          subtext: c.subtext,
          tag: c.tag,
          tagTone: c.tagTone,
        })),
      };

      this.audio.playStorySting('TWIST');
      this.haptics.peel(2);
      this.scene.setCharacter('teo', 'TELL');
      this.emitState();
      return;
    }

    // Escalate music to COUNTDOWN at <= 6s (unless in FRACTURE)
    if (
      !rt.countdownEscalated &&
      rt.timeRemainingSec <= 6.0 &&
      match.baseLighting !== 'FRACTURE'
    ) {
      rt.countdownEscalated = true;
      this.audio.setMusicLayer('COUNTDOWN');
    }

    // Overclock charge progression
    if (aq.overclockActive) {
      const hasMaverick = match.perksAllowed && this.story.hasActivePerk('MAVERICK_GAMBIT');
      const chargeDuration = hasMaverick ? 0.6 : 0.85;
      aq.overclockProgress = clamp(aq.overclockProgress + dt / chargeDuration, 0, 1);
      this.scene.setOverclockVisual(aq.overclockProgress, true);
      this.audio.updateOverclockCharge(aq.overclockProgress);

      if (nowMs - rt.lastOverclockHapticTs >= 85) {
        rt.lastOverclockHapticTs = nowMs;
        this.haptics.overclockPulse(aq.overclockProgress);
      }
    }

    // Rival AI live duel update
    if (match.rivalAI) {
      const rivalUpdate = match.rivalAI.tick(rt.elapsedSec);
      if (rivalUpdate.changed) {
        this.state.rival = rivalUpdate.uiState;
        this.scene.setRivalPrismStatus(rivalUpdate.status);
        if (rivalUpdate.mood) {
          this.scene.setCharacter(match.rivalAI.getId(), rivalUpdate.mood);
        }
        if (rivalUpdate.tempoStealSec > 0) {
          rt.timeRemainingSec = Math.max(3.0, rt.timeRemainingSec - rivalUpdate.tempoStealSec);
          aq.timeRemainingSec = rt.timeRemainingSec;
          this.audio.playStorySting('TWIST');
          this.haptics.wrongThud(false);
          this.showToast(
            `TEMPO STEAL! ${match.rivalAI.getName()} shaves -${rivalUpdate.tempoStealSec.toFixed(1)}s off your Chrono-Ring!`
          );
        } else if (rivalUpdate.tempoStealBlocked) {
          this.audio.playSightlineSnap();
          this.showToast('Analog Instinct blocked Tempo Steal!');
        }
        forceUiEmit = true;
      }
    }

    // Check timeout
    if (rt.timeRemainingSec <= 0) {
      this.resolveActiveQuestion({
        archetype: rt.question.archetype,
        peelTier: aq.peelTier,
        overclockBonus: 0,
        overclocked: false,
        elapsedSec: rt.timeTotalSec,
        timedOut: true,
      });
      return;
    }

    if (forceUiEmit || nowMs - rt.lastUiEmitTs >= 45) {
      rt.lastUiEmitTs = nowMs;
      this.emitState();
    }
  }

  // ==========================================================================
  // Mid-Question Ethical Interrupt (Geneva Prologue Q2)
  // ==========================================================================

  private handleEthicalInterruptChoice(choiceId: string): void {
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (!rt || !aq || !rt.ethicalInterruptActive) return;

    const def = PROLOGUE_ETHICAL_INTERRUPT.choices.find((c) => c.id === choiceId);
    if (!def) return;

    this.applyStoryEffects(def.effects);

    if (def.revealTier2Free) {
      const clue = rt.question.clues[0];
      if (clue && !aq.revealedClues.includes(clue)) {
        aq.revealedClues = [...aq.revealedClues, clue];
      }
      this.audio.playPeelShutter(2);
      this.haptics.peel(2);
    } else {
      this.audio.playStorySting('CHOICE');
      this.haptics.uiTap();
    }

    this.showToast(def.toast);

    rt.ethicalInterruptActive = false;
    aq.ethicalInterrupt = undefined;
    this.scene.setCharacter('vance', def.id === 'eth_exploit' ? 'TENSE' : 'IMPRESSED');
    this.lastTickTs = performance.now();
    this.emitState();
  }

  // ==========================================================================
  // Veritas Prism Interactive Actions
  // ==========================================================================

  private handleSceneFacetChanged(index: number): void {
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (!rt || !aq || rt.resolved || this.state.screen !== 'ACTIVE_MATCH') return;
    if (aq.facets.length === 0) return;

    const clamped = clamp(index, 0, aq.facets.length - 1);
    if (clamped !== aq.activeFacetIndex) {
      aq.activeFacetIndex = clamped;
      this.audio.playSightlineSnap();
      this.haptics.sightlineSnap();
      this.emitState();
    }
  }

  private handleSceneCodexChanged(alignedIndices: number[]): void {
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (!rt || !aq || rt.resolved || this.state.screen !== 'ACTIVE_MATCH') return;
    if (rt.question.archetype !== 'CODEX_DUAL_RING') return;
    if (!Array.isArray(alignedIndices) || alignedIndices.length === 0) return;

    const nextSlots = alignedIndices.slice(0, 3);
    const changed =
      nextSlots.length !== rt.codexAlignedSlots.length ||
      nextSlots.some((v, idx) => v !== rt.codexAlignedSlots[idx]);

    if (changed) {
      rt.codexAlignedSlots = nextSlots;
      aq.codexOrderBottom = this.getDisplayedCodexBottom(rt.codexRawBottom, nextSlots);
      aq.codexAlignedCount = this.computeCodexAlignedCount(nextSlots, rt.codexRawBottom.length);
      this.audio.playSightlineSnap();
      this.haptics.sightlineSnap();
      this.emitState();
    }
  }

  private handleSpinPrism(deltaX: number, ring?: 'TOP' | 'BOTTOM'): void {
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (
      !rt ||
      !aq ||
      rt.resolved ||
      rt.ethicalInterruptActive ||
      this.state.screen !== 'ACTIVE_MATCH'
    ) {
      return;
    }

    this.scene.spinPrismBy(deltaX, ring);

    const now = performance.now();
    if (Math.abs(deltaX) >= 3 && now - rt.lastSpinAudioTs >= 45) {
      rt.lastSpinAudioTs = now;
      this.audio.playSpinTick(Math.min(1, Math.abs(deltaX) / 30));
      this.haptics.spinTick();
    }

    if (rt.question.archetype === 'CODEX_DUAL_RING') {
      const aligned = this.scene.getCodexAlignment();
      if (Array.isArray(aligned) && aligned.length === 3) {
        this.handleSceneCodexChanged(aligned);
      }
    }
  }

  private handleStepFacet(direction: -1 | 1): void {
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (
      !rt ||
      !aq ||
      rt.resolved ||
      rt.ethicalInterruptActive ||
      this.state.screen !== 'ACTIVE_MATCH'
    ) {
      return;
    }

    if (rt.question.archetype === 'CODEX_DUAL_RING') {
      this.handleSpinPrism(direction * 46, 'BOTTOM');
      return;
    }

    const prevIdx = aq.activeFacetIndex;
    this.scene.stepFacet(direction);
    const idx = this.scene.getActiveFacetIndex();
    if (aq.facets.length > 0) {
      const clamped = clamp(idx, 0, aq.facets.length - 1);
      if (clamped !== aq.activeFacetIndex) {
        aq.activeFacetIndex = clamped;
        this.audio.playSightlineSnap();
        this.haptics.sightlineSnap();
        this.emitState();
      } else if (clamped === prevIdx) {
        this.audio.playUiTap();
      }
    }
  }

  private handlePeelPrism(): void {
    const match = this.match;
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (
      !match ||
      !rt ||
      !aq ||
      rt.resolved ||
      rt.ethicalInterruptActive ||
      this.state.screen !== 'ACTIVE_MATCH'
    ) {
      return;
    }

    if (aq.peelLocked || aq.peelTier >= 3) {
      this.audio.playUiTap();
      if (aq.peelLockReason) {
        this.showToast(aq.peelLockReason);
      }
      return;
    }

    if (aq.peelTier === 2 && match.lockTier3Only) {
      aq.peelLocked = true;
      aq.peelLockReason = match.peelLockReason ?? 'TIER-3 PEEL LOCKED';
      this.audio.playWrongReveal(false);
      this.showToast(aq.peelLockReason);
      this.emitState();
      return;
    }

    const nextTier = (aq.peelTier + 1) as PeelTier;
    aq.peelTier = nextTier;

    if (nextTier === 2) {
      const clue2 = rt.question.clues[0];
      if (clue2 && !aq.revealedClues.includes(clue2)) {
        aq.revealedClues = [...aq.revealedClues, clue2];
      }

      // CO-OP CROSS-CHECK (Allied Nadia): 1x/match free Tier-2 Peel keeps full 3.0x multiplier on Sightline/Hero!
      const isSightlineOrHero =
        rt.question.archetype === 'SIGHTLINE_LOCK' ||
        rt.question.archetype === 'HERO_ARTIFACT_SYNTHESIS';
      if (
        match.perksAllowed &&
        isSightlineOrHero &&
        this.story.hasActivePerk('COOP_CROSSCHECK') &&
        !match.coopCrossCheckUsed
      ) {
        match.coopCrossCheckUsed = true;
        rt.coopCrossCheckFreeTier2 = true;
        aq.activeModifiers = aq.activeModifiers.map((m) =>
          m.startsWith('CO-OP CROSS-CHECK') ? 'CO-OP ACTIVE · 3.0x HELD' : m
        );
        this.showToast(
          'CO-OP CROSS-CHECK! Allied Nadia flashes Tier-2 clue at full 3.0x multiplier!'
        );
      }

      this.scene.peelPrismTo(2);
      this.audio.playPeelShutter(2);
      this.haptics.peel(2);

      if (match.lockTier3Only) {
        aq.peelLocked = true;
        aq.peelLockReason = match.peelLockReason ?? 'TIER-3 PEEL LOCKED';
      }
    } else if (nextTier === 3) {
      const clue3 = rt.question.clues[1];
      if (clue3 && !aq.revealedClues.includes(clue3)) {
        aq.revealedClues = [...aq.revealedClues, clue3];
      }

      const shatterIndices: number[] = [];
      if (aq.facets.length > 2) {
        const aliveDecoys = aq.facets
          .filter((f) => f.index !== rt.correctFacetIndex && !f.shattered && !f.redacted)
          .sort(
            (a, b) =>
              (rt.distractorPlausibility.get(a.index) ?? 0.5) -
              (rt.distractorPlausibility.get(b.index) ?? 0.5)
          );
        const shatterCount = Math.max(1, aliveDecoys.length - 1);
        for (let i = 0; i < shatterCount; i++) {
          const idx = aliveDecoys[i].index;
          shatterIndices.push(idx);
          aq.facets[idx].shattered = true;
        }
      }

      this.scene.peelPrismTo(3, shatterIndices.length > 0 ? shatterIndices : undefined);
      this.audio.playPeelShutter(3);
      this.haptics.peel(3);

      if (aq.facets[aq.activeFacetIndex]?.shattered) {
        const intact = aq.facets.find((f) => !f.shattered && !f.redacted);
        if (intact) {
          this.scene.stepFacet(1);
          aq.activeFacetIndex = intact.index;
        }
      }
    }

    this.emitState();
  }

  private handleUseDiplomaticRedaction(): void {
    const match = this.match;
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (
      !match ||
      !rt ||
      !aq ||
      rt.resolved ||
      rt.ethicalInterruptActive ||
      !aq.canRedactionPerk ||
      match.redactionUsed
    ) {
      return;
    }

    const candidates = aq.facets
      .filter((f) => f.index !== rt.correctFacetIndex && !f.shattered && !f.redacted)
      .sort(
        (a, b) =>
          (rt.distractorPlausibility.get(b.index) ?? 0.5) -
          (rt.distractorPlausibility.get(a.index) ?? 0.5)
      );

    if (candidates.length === 0) return;

    const target = candidates[0];
    target.redacted = true;
    match.redactionUsed = true;
    aq.canRedactionPerk = false;

    this.scene.markFacetRedacted(target.index);
    this.audio.playPeelShutter(2);
    this.haptics.peel(2);
    this.showToast('DIPLOMATIC REDACTION — High-threat decoy neutralized!');

    if (aq.activeFacetIndex === target.index) {
      const nextIntact = aq.facets.find((f) => !f.shattered && !f.redacted);
      if (nextIntact) {
        this.scene.stepFacet(1);
        aq.activeFacetIndex = nextIntact.index;
      }
    }

    this.emitState();
  }

  private handleBeginOverclock(): void {
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (
      !rt ||
      !aq ||
      rt.resolved ||
      rt.ethicalInterruptActive ||
      this.state.screen !== 'ACTIVE_MATCH'
    ) {
      return;
    }
    if (rt.question.archetype === 'GAUNTLET_SHATTER') return;
    if (aq.overclockActive) return;

    aq.overclockActive = true;
    aq.overclockProgress = 0.02;
    this.audio.startOverclockCharge();
    this.scene.setOverclockVisual(aq.overclockProgress, true);
    this.haptics.overclockPulse(0.15);
    this.emitState();
  }

  private handleCancelOverclock(): void {
    const match = this.match;
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (!match || !rt || !aq || !aq.overclockActive) return;

    aq.overclockActive = false;
    aq.overclockProgress = 0;
    this.scene.cancelOverclockVisual();
    this.audio.stopOverclockCharge(false);
    this.haptics.uiTap();

    const hasBluffEcho = match.perksAllowed && this.story.hasActivePerk('BLUFF_ECHO');
    const hasComposure = match.perksAllowed && this.story.hasActivePerk('DIPLOMAT_COMPOSURE');

    if (hasBluffEcho && !rt.bluffEchoUsedThisQuestion) {
      rt.bluffEchoUsedThisQuestion = true;
      rt.timeRemainingSec = Math.min(rt.timeTotalSec, rt.timeRemainingSec + 1.5);
      aq.timeRemainingSec = rt.timeRemainingSec;

      const baited = match.rivalAI ? match.rivalAI.triggerBluffEchoBait(rt.elapsedSec) : false;
      if (baited && match.rivalAI) {
        this.state.rival = match.rivalAI.getUIState();
        this.scene.setCharacter(match.rivalAI.getId(), 'RATTLED');
        this.audio.playStorySting('CHOICE');
        this.showToast('BLUFF ECHO! +1.5s recovered — Rival baited into a premature lock!');
      } else {
        this.showToast('BLUFF ECHO! Overclock feint recovered +1.5s!');
      }
    } else if (!hasComposure) {
      rt.timeRemainingSec = Math.max(1.5, rt.timeRemainingSec - 0.75);
      aq.timeRemainingSec = rt.timeRemainingSec;
      this.showToast('Overclock vented (-0.75s).');
    } else {
      this.showToast("Overclock vented cleanly (Diplomat's Composure · 0s cost).");
    }
    this.emitState();
  }

  private handleAdjustCalibrator(deltaPos: number, deltaTolerance: number): void {
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (
      !rt ||
      !aq ||
      rt.resolved ||
      rt.ethicalInterruptActive ||
      this.state.screen !== 'ACTIVE_MATCH'
    ) {
      return;
    }
    if (rt.question.archetype !== 'CALIBRATOR_DIAL') return;

    const normDx = Math.abs(deltaPos) > 0.6 ? deltaPos / 280 : deltaPos;
    const normDy = Math.abs(deltaTolerance) > 0.6 ? deltaTolerance / 260 : deltaTolerance;

    rt.calibratorNormPos = clamp(rt.calibratorNormPos + normDx, 0, 1);
    rt.calibratorTol = clamp(rt.calibratorTol + normDy, 0.02, 0.35);

    this.scene.setCalibratorState(rt.calibratorNormPos, rt.calibratorTol);

    aq.calibratorVal = computeCalibratorValue(rt.question, rt.calibratorNormPos);
    aq.calibratorTolerancePct = round2(rt.calibratorTol);
    aq.calibratorMultiplier = computeCalibratorMultiplier(rt.calibratorTol);

    const now = performance.now();
    if (now - rt.lastCalibratorAudioTs >= 45) {
      rt.lastCalibratorAudioTs = now;
      const tightness = clamp((0.35 - rt.calibratorTol) / (0.35 - 0.02), 0, 1);
      this.audio.playCalibratorTick(tightness);
      this.haptics.spinTick();
    }

    this.emitState();
  }

  private handleCommitLock(): void {
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (
      !rt ||
      !aq ||
      rt.resolved ||
      rt.ethicalInterruptActive ||
      this.state.screen !== 'ACTIVE_MATCH'
    ) {
      return;
    }

    if (rt.question.archetype === 'CODEX_DUAL_RING') {
      this.handleCommitCodex();
      return;
    }

    if (rt.question.archetype === 'GAUNTLET_SHATTER') {
      return;
    }

    const overclocked = aq.overclockActive && aq.overclockProgress >= 0.08;
    const overclockBonus = overclocked ? clamp(aq.overclockProgress, 0, 1) : 0;

    if (aq.overclockActive) {
      this.audio.stopOverclockCharge(true);
    } else {
      this.audio.playSightlineSnap();
    }
    this.haptics.lockThunk();

    if (rt.question.archetype === 'CALIBRATOR_DIAL') {
      this.resolveActiveQuestion({
        archetype: 'CALIBRATOR_DIAL',
        peelTier: aq.peelTier,
        overclockBonus,
        overclocked,
        elapsedSec: rt.elapsedSec,
        calibratorVal: aq.calibratorVal,
        calibratorTolerancePct: rt.calibratorTol,
      });
      return;
    }

    let idx = clamp(this.scene.getActiveFacetIndex(), 0, Math.max(0, aq.facets.length - 1));
    if (!aq.facets[idx] || aq.facets[idx].shattered || aq.facets[idx].redacted) {
      idx = aq.activeFacetIndex;
    }
    const chosenFacet = aq.facets[idx];

    this.resolveActiveQuestion({
      archetype: rt.question.archetype,
      selectedFacetIndex: idx,
      selectedText: chosenFacet?.text,
      peelTier: aq.peelTier,
      overclockBonus,
      overclocked,
      elapsedSec: rt.elapsedSec,
    });
  }

  private handleCommitCodex(): void {
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (
      !rt ||
      !aq ||
      rt.resolved ||
      rt.ethicalInterruptActive ||
      this.state.screen !== 'ACTIVE_MATCH'
    ) {
      return;
    }
    if (rt.question.archetype !== 'CODEX_DUAL_RING') return;

    const sceneAligned = this.scene.getCodexAlignment();
    const slots =
      Array.isArray(sceneAligned) && sceneAligned.length === 3
        ? sceneAligned.slice(0, 3)
        : rt.codexAlignedSlots;

    const codexMatches = slots.map((visualBottomSlot, subjectIndex) => {
      const clampedSlot = clamp(
        visualBottomSlot,
        0,
        Math.max(0, rt.codexBottomCanonical.length - 1)
      );
      const canonicalTargetIdx = rt.codexBottomCanonical[clampedSlot] ?? 3;
      return {
        subjectIndex,
        targetIndex: canonicalTargetIdx,
      };
    });

    const overclocked = aq.overclockActive && aq.overclockProgress >= 0.08;
    const overclockBonus = overclocked ? clamp(aq.overclockProgress, 0, 1) : 0;

    if (aq.overclockActive) {
      this.audio.stopOverclockCharge(true);
    } else {
      this.audio.playSightlineSnap();
    }
    this.haptics.lockThunk();

    this.resolveActiveQuestion({
      archetype: 'CODEX_DUAL_RING',
      codexMatches,
      peelTier: aq.peelTier,
      overclockBonus,
      overclocked,
      elapsedSec: rt.elapsedSec,
    });
  }

  private handleSwipeGauntlet(action: 'TRUE' | 'FALSE' | 'CHALLENGE'): void {
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (
      !rt ||
      !aq ||
      rt.resolved ||
      rt.ethicalInterruptActive ||
      this.state.screen !== 'ACTIVE_MATCH'
    ) {
      return;
    }
    if (rt.question.archetype !== 'GAUNTLET_SHATTER') return;

    this.audio.playGauntletSwipe(action);
    this.haptics.lockThunk();

    this.resolveActiveQuestion({
      archetype: 'GAUNTLET_SHATTER',
      gauntletAction: action,
      peelTier: 1,
      overclockBonus: 0,
      overclocked: false,
      elapsedSec: rt.elapsedSec,
    });
  }

  // ==========================================================================
  // Question Resolution & Intel Flash
  // ==========================================================================

  private resolveActiveQuestion(submission: AnswerSubmission): void {
    const match = this.match;
    const rt = this.qRuntime;
    const aq = this.state.activeQuestion;
    if (!match || !rt || !aq || rt.resolved) return;

    rt.resolved = true;
    this.stopTickLoop();

    if (submission.timedOut && aq.overclockActive) {
      this.scene.cancelOverclockVisual();
      this.audio.stopOverclockCharge(false);
    }
    aq.overclockActive = false;

    // CO-OP CROSS-CHECK: if active on this question at Tier-2, preserve full 3.0x multiplier!
    const effectiveSubmission: AnswerSubmission =
      rt.coopCrossCheckFreeTier2 && submission.peelTier === 2
        ? { ...submission, peelTier: 1 }
        : submission;

    const evalOpts: EvaluateOptions = {
      streakBefore: match.streak,
      cleanHandsPerk: match.perksAllowed && this.story.hasActivePerk('CLEAN_HANDS'),
      maverickGambitPerk: match.perksAllowed && this.story.hasActivePerk('MAVERICK_GAMBIT'),
      timeTotalSec: rt.timeTotalSec,
    };

    const resolution = this.trivia.evaluateAnswer(rt.question, effectiveSubmission, evalOpts);

    // Apply Perk & Mode-level score multipliers cleanly
    if (resolution.correct && resolution.totalPoints > 0) {
      // COUNCIL OVERRIDE (+20% on History, Society/Law, High-Power & Hero Synthesis!)
      if (
        match.perksAllowed &&
        this.story.hasActivePerk('COUNCIL_OVERRIDE') &&
        this.matchesCouncilOverride(rt.question)
      ) {
        resolution.totalPoints = Math.round(resolution.totalPoints * 1.2);
        resolution.tierMultiplier = round2(resolution.tierMultiplier * 1.2);
      }

      // PEOPLE'S SIGHTLINE (+10% public consensus momentum on Sightline/Hero)
      if (
        match.perksAllowed &&
        this.story.hasActivePerk('PEOPLES_LENS') &&
        (rt.question.archetype === 'SIGHTLINE_LOCK' ||
          rt.question.archetype === 'HERO_ARTIFACT_SYNTHESIS')
      ) {
        resolution.totalPoints = Math.round(resolution.totalPoints * 1.1);
      }

      if (match.blackSalonDoublePoints) {
        const mult = match.blackSalonSuddenDeath ? 1.5 : 2.0;
        resolution.totalPoints = Math.round(resolution.totalPoints * mult);
      } else if (match.mode === 'ENDLESS' && match.endlessStrataMultiplier > 1) {
        resolution.totalPoints = Math.round(resolution.totalPoints * match.endlessStrataMultiplier);
      }
    }

    this.trivia.recordResult(rt.question, resolution, effectiveSubmission);

    match.peelTierSum += submission.peelTier;
    if (submission.overclocked) {
      match.overclockAttempts += 1;
      if (resolution.correct) {
        match.overclockHits += 1;
      }
    }
    if (resolution.bullseye) {
      match.bullseyeHit = true;
    }

    if (resolution.correct) {
      match.streak += 1;
      if (match.streak > match.maxStreak) {
        match.maxStreak = match.streak;
      }
      if (match.mode === 'ENDLESS') {
        match.endlessUnbankedScore += resolution.totalPoints;
        match.score = match.endlessBankedScore + match.endlessUnbankedScore;

        if (submission.overclocked) {
          match.endlessOverclockStreak += 1;
        } else {
          match.endlessOverclockStreak = 0;
        }
        if (
          submission.overclocked &&
          (match.endlessOverclockStreak >= 3 || (match.streak >= 3 && match.streak % 3 === 0)) &&
          match.endlessShields < match.endlessMaxShields
        ) {
          match.endlessShields += 1;
          match.endlessOverclockStreak = 0;
          this.showToast('3-STREAK OVERCLOCK — 1 Prism Shield Repaired!');
        }
      } else {
        match.score += resolution.totalPoints;
      }
    } else {
      match.streak = 0;
      match.endlessOverclockStreak = 0;
      if (match.mode === 'ENDLESS') {
        const shieldLoss = resolution.backfired ? 2 : 1;
        match.endlessShields = Math.max(0, match.endlessShields - shieldLoss);
        if (resolution.backfired) {
          this.showToast('OVERCLOCK BACKFIRE — 2 Prism Shields Shattered!');
        }
      } else if (match.campaignMaxShields > 0) {
        // Rio Shield Sacrifice tangible gameplay consequence!
        if (match.campaignShields > 0) {
          match.campaignShields -= 1;
          this.showToast('PRISM SHIELD CRACKED — Shield absorbed the Rio misfire!');
        } else {
          match.score = Math.max(0, match.score - 350);
          this.showToast('UNSHIELDED BREACH (-350 pts) — Your Rio Shield sacrifice is felt!');
        }
      } else if (match.blackSalonSuddenDeath) {
        // Black Salon Grand Final: Zero-Shield Sudden Death penalty!
        const penalty = resolution.backfired ? 1200 : 800;
        match.score = Math.max(0, match.score - penalty);
        this.showToast(`ZERO-SHIELD SUDDEN DEATH! -${penalty} pts Crimson Fracture!`);
      }
    }

    if (match.mode === 'ENDLESS') {
      match.endlessFloor += 1;
    }

    this.story.recordAnswerStats(resolution.correct, match.streak);

    // Resolve Rival AI for this question
    if (match.rivalAI) {
      const rivalRes = match.rivalAI.resolveQuestion(
        rt.question,
        resolution.correct,
        resolution.backfired
      );
      resolution.rivalCorrect = rivalRes.rivalCorrect;
      resolution.rivalPointsDelta = rivalRes.rivalPointsDelta;
      this.state.rival = rivalRes.uiState;
      this.scene.setRivalPrismStatus('LOCKED');
      this.scene.setCharacter(match.rivalAI.getId(), rivalRes.reactionMood);
    } else {
      const hostMood: CharacterMood = resolution.correct
        ? match.streak >= 2 || resolution.overclocked
          ? 'IMPRESSED'
          : 'SMIRK'
        : resolution.backfired
          ? 'RATTLED'
          : 'TENSE';
      this.scene.setCharacter(match.hostCharacter, hostMood);
    }

    // Fire 3D reveal animations, Audio & Haptics
    if (rt.question.archetype === 'GAUNTLET_SHATTER' && submission.gauntletAction) {
      this.scene.triggerGauntletSwipe(submission.gauntletAction, resolution.correct);
    }
    this.scene.playRevealAnimation({
      correct: resolution.correct,
      backfired: resolution.backfired,
      correctIndex:
        rt.question.archetype === 'SIGHTLINE_LOCK' ||
        rt.question.archetype === 'HERO_ARTIFACT_SYNTHESIS'
          ? rt.correctFacetIndex
          : undefined,
      streak: match.streak,
    });

    if (resolution.correct) {
      this.audio.playCorrectReveal(match.streak, resolution.overclocked);
      this.haptics.correctBloom();
      if (match.streak >= 3 && match.baseLighting !== 'FRACTURE') {
        this.audio.setMusicLayer('STREAK');
      }
    } else {
      this.audio.playWrongReveal(resolution.backfired);
      this.haptics.wrongThud(resolution.backfired);
    }

    match.resolutions.push(resolution);

    this.state.playerScore = match.score;
    this.state.streak = match.streak;
    this.state.shields = match.mode === 'ENDLESS' ? match.endlessShields : match.campaignShields;
    this.state.maxShields =
      match.mode === 'ENDLESS' ? match.endlessMaxShields : match.campaignMaxShields;
    this.state.lastResolution = resolution;
    this.state.screen = 'INTEL_FLASH';

    this.syncStoryAndRatings();
    this.emitState();
  }

  private handleToggleBookmarkLastFlash(): void {
    const res = this.state.lastResolution;
    if (!res) return;

    const added = this.story.toggleBookmark({
      qid: res.qid,
      prompt: res.promptSnapshot,
      answer: res.correctAnswerDisplay,
      why: res.whyExplanation,
      domainId: res.domainId,
      savedAt: Date.now(),
    });
    this.syncStoryAndRatings();
    this.showToast(added ? 'Saved to Intel Observatory Bookmarks.' : 'Removed from Bookmarks.');
    this.emitState();
  }

  private handleContinueAfterIntelFlash(): void {
    const match = this.match;
    if (!match || this.state.screen !== 'INTEL_FLASH') return;

    // Endless Mode progression: shield breach check & 5-floor Extraction Airlock
    if (match.mode === 'ENDLESS') {
      if (match.endlessShields <= 0) {
        this.finishEndlessRun(false);
        return;
      }

      if (match.endlessFloor > 0 && match.endlessFloor % 5 === 0) {
        this.enterEndlessAirlock();
        return;
      }

      match.currentIndex += 1;
      if (match.currentIndex >= match.questions.length) {
        const nextBatch = this.fetchEndlessBatch(match.endlessFloor + 1, match.endlessUsedQids);
        match.questions.push(...nextBatch);
      }
      this.loadCurrentQuestion();
      return;
    }

    // Geneva Prologue Post-Q3 Manifesto Dialogue Interlude
    if (match.campaignNodeId === 'ch_prologue' && match.currentIndex === 2) {
      match.currentIndex += 1;
      this.startDialogueSequence(
        'prologue_manifesto',
        { story: this.story.getSnapshot() },
        () => {
          this.loadCurrentQuestion();
        }
      );
      return;
    }

    // Apex Forum 3-Stage Phase Escalations!
    if (match.campaignNodeId === 'global_apex') {
      // Entering Phase II (Q3 — Rival Reckoning)
      if (match.currentIndex === 1) {
        match.currentIndex += 1;
        const prevScore = match.rivalAI ? match.rivalAI.getScore() : 0;
        const snap = this.story.getSnapshot();
        const phase2Id = match.apexPhase2RivalId ?? 'soren';
        const nemesisNadia = phase2Id === 'nadia' && snap.bonds.nadia === 'NEMESIS';
        const nextRival = new RivalAI({
          id: phase2Id,
          customTitle: 'Phase II · Rival Reckoning',
          grudgePressure: nemesisNadia,
          grudgeDomainId: match.grudgeDomainId,
          grudgeDomainName:
            match.grudgeDomainId !== undefined
              ? getDomainMeta(match.grudgeDomainId).name
              : undefined,
          tempoStealActive: nemesisNadia,
          tempoStealBlockedByPerk: this.story.hasActivePerk('ANALOG_STATIC_MASTER'),
        });
        nextRival.setScore(prevScore);
        match.rivalAI = nextRival;
        match.hostCharacter = phase2Id;
        match.venueTitle = 'APEX FORUM · PHASE II: RIVAL RECKONING';
        this.showToast(`PHASE II: RIVAL RECKONING — ${nextRival.getName()} takes the podium!`);
        this.loadCurrentQuestion();
        return;
      }

      // Entering Phase III (Q5 — The Arbiter's Gambit vs. Julian Vance!)
      if (match.currentIndex === 3) {
        match.currentIndex += 1;
        const prevScore = match.rivalAI ? match.rivalAI.getScore() : 0;
        this.startDialogueSequence(
          'apex_mid_gambit',
          { story: this.story.getSnapshot() },
          () => {
            const vanceAI = new RivalAI({
              id: 'vance',
              customTitle: "Phase III · The Arbiter's Gambit",
              isVanceFinale: true,
            });
            vanceAI.setScore(prevScore);
            match.rivalAI = vanceAI;
            match.hostCharacter = 'vance';
            match.venueTitle = "APEX FORUM · PHASE III: THE ARBITER'S GAMBIT";
            this.loadCurrentQuestion();
          }
        );
        return;
      }
    }

    match.currentIndex += 1;
    if (match.currentIndex < match.questions.length) {
      this.loadCurrentQuestion();
    } else {
      this.finishMatch();
    }
  }

  // ==========================================================================
  // Endless Archive Descent — Extraction Airlock
  // ==========================================================================

  private enterEndlessAirlock(): void {
    const match = this.match;
    if (!match) return;

    const strata = getEndlessStrataForFloor(match.endlessFloor);
    const loreIdx = Math.floor((match.endlessFloor / 5 - 1) % strata.loreSnippets.length);
    const loreSnippet = strata.loreSnippets[Math.max(0, loreIdx)] ?? strata.loreSnippets[0];

    const checkpoint: EndlessCheckpointState = {
      floor: match.endlessFloor,
      strataName: strata.strataName,
      bankedScore: match.endlessBankedScore,
      unbankedScore: match.endlessUnbankedScore,
      shields: match.endlessShields,
      maxShields: match.endlessMaxShields,
      loreSnippet,
    };

    this.state.screen = 'ENDLESS_AIRLOCK';
    this.state.endlessCheckpoint = checkpoint;
    this.state.activeQuestion = null;
    this.state.lastResolution = null;
    this.scene.setModeView('VENUE_STAGE');
    this.scene.setVenue('LEDGER', strata.lightingState);
    this.scene.setCharacter('none');
    this.audio.setVenueMusic('LEDGER', 'INTERVIEW');
    this.audio.playStorySting('TWIST');

    this.emitState();
  }

  private handleEndlessDescend(): void {
    const match = this.match;
    if (!match || this.state.screen !== 'ENDLESS_AIRLOCK') return;

    const safeRelay = Math.round(match.endlessUnbankedScore * 0.4);
    match.endlessBankedScore += safeRelay;
    match.endlessUnbankedScore = Math.max(0, match.endlessUnbankedScore - safeRelay);
    match.score = match.endlessBankedScore + match.endlessUnbankedScore;

    const nextFloor = match.endlessFloor + 1;
    const nextStrata = getEndlessStrataForFloor(nextFloor);
    const nextBatch = this.fetchEndlessBatch(nextFloor, match.endlessUsedQids);
    match.questions.push(...nextBatch);
    match.currentIndex += 1;

    this.showToast(
      `Descending into ${nextStrata.strataName} (${nextStrata.scoreMultiplier}x score)!`
    );
    this.loadCurrentQuestion();
  }

  private handleEndlessExtract(): void {
    const match = this.match;
    if (!match || this.state.screen !== 'ENDLESS_AIRLOCK') return;

    match.endlessBankedScore += match.endlessUnbankedScore;
    match.endlessUnbankedScore = 0;
    match.score = match.endlessBankedScore;
    this.finishEndlessRun(true);
  }

  private finishEndlessRun(extracted: boolean): void {
    const match = this.match;
    if (!match) return;

    const finalScore = match.endlessBankedScore;
    this.story.recordEndlessResult(match.endlessFloor, finalScore);
    this.syncStoryAndRatings();

    const correctCount = match.resolutions.filter((r) => r.correct).length;
    const totalCount = match.resolutions.length;
    const avgPeel = totalCount > 0 ? round2(match.peelTierSum / totalCount) : 1.0;

    const summary: MatchSummaryState = {
      mode: 'ENDLESS',
      title: extracted ? 'EXTRACTION SUCCESSFUL' : 'ARCHIVE BREACH · DESCENT ENDED',
      subtitle: extracted
        ? `Extracted cleanly from Floor ${match.endlessFloor} with all vault telemetry secured.`
        : `All Prism Shields shattered on Floor ${match.endlessFloor}. Banked Vault score preserved.`,
      won: extracted || finalScore > 0,
      playerScore: finalScore,
      correctCount,
      totalCount,
      maxStreak: match.maxStreak,
      overclockHits: match.overclockHits,
      averagePeelTier: avgPeel,
      nextActionLabel: 'DESCEND AGAIN',
      secondaryActionLabel: 'RETURN TO TITLE',
    };

    this.onSummaryPrimary = () => this.beginEndlessDescent();
    this.onSummarySecondary = () => this.enterTitle(true);

    this.presentMatchSummary(summary, 'LEDGER');
  }

  // ==========================================================================
  // Match Completion & Campaign Outros (ALL 8 CHAPTERS + TRIALS + ENDINGS)
  // ==========================================================================

  private finishMatch(): void {
    const match = this.match;
    if (!match) return;

    const correctCount = match.resolutions.filter((r) => r.correct).length;
    const totalCount = match.resolutions.length;
    const avgPeel = totalCount > 0 ? round2(match.peelTierSum / totalCount) : 1.0;
    const rivalScore = match.rivalAI ? match.rivalAI.getScore() : undefined;
    const won =
      rivalScore !== undefined
        ? match.score >= rivalScore
        : correctCount >= Math.ceil(totalCount / 2);

    // ------------------------------------------------------------------------
    // CAMPAIGN: GENEVA PROLOGUE
    // ------------------------------------------------------------------------
    if (match.mode === 'CAMPAIGN' && match.campaignNodeId === 'ch_prologue') {
      const personaRes = computeProloguePersona({
        story: this.story.getSnapshot(),
        correctCount,
        totalCount,
        overclockAttempts: match.overclockAttempts,
        overclockHits: match.overclockHits,
        averagePeelTier: avgPeel,
        bullseyeHit: match.bullseyeHit,
      });

      this.story.completePrologue(personaRes.persona);
      this.story.unlockPerk(personaRes.startingPerk, true);
      this.story.unlockRelic('meridian_astrolabe');
      this.syncStoryAndRatings();

      const perkMeta = PERKS[personaRes.startingPerk];

      const summary: MatchSummaryState = {
        mode: 'CAMPAIGN',
        title: `PASSPORT STAMPED · ${PERSONA_LABELS[personaRes.persona].name}`,
        subtitle: personaRes.dossierNote,
        won: true,
        playerScore: match.score,
        correctCount,
        totalCount,
        maxStreak: match.maxStreak,
        overclockHits: match.overclockHits,
        averagePeelTier: avgPeel,
        unlockedRelic: 'meridian_astrolabe',
        unlockedPerk: perkMeta,
        personaAwarded: personaRes.persona,
        nextActionLabel: 'OPEN WORLD GLOBE',
        secondaryActionLabel: 'INSPECT RELIC IN OBSERVATORY',
      };

      this.onSummaryPrimary = () => this.enterWorldGlobe();
      this.onSummarySecondary = () => {
        this.state.observatoryRelic = 'meridian_astrolabe';
        this.enterPassportObservatory();
      };

      this.startDialogueSequence(
        'prologue_outro',
        {
          story: this.story.getSnapshot(),
          lastMatchWon: true,
          awardedPersona: personaRes.persona,
          awardedPerkName: perkMeta.name,
        },
        () => {
          this.presentMatchSummary(summary, 'CH');
        }
      );
      return;
    }

    // ------------------------------------------------------------------------
    // CAMPAIGN: LONDON STAGE 1
    // ------------------------------------------------------------------------
    if (match.mode === 'CAMPAIGN' && match.campaignNodeId === 'gb_london') {
      this.story.completeCampaignNode('gb_london');
      this.story.unlockRelic('armillary_orrery');
      if (won) this.story.adjustPublicTrust(6);
      this.syncStoryAndRatings();

      const unlockedPerk = match.choiceUnlockedPerk ? PERKS[match.choiceUnlockedPerk] : undefined;

      const summary: MatchSummaryState = {
        mode: 'CAMPAIGN',
        title: won ? 'SOVEREIGN ROTUNDA · VICTORY' : 'SOVEREIGN ROTUNDA · MATCH COMPLETE',
        subtitle: won
          ? "You out-calculated Nadia Al-Mansoor under London's dome and claimed the Locked Armillary Orrery."
          : 'Nadia edged the scoreboard, yet your clearance advances across the Meridian Circuit.',
        won,
        playerScore: match.score,
        rivalName: match.rivalAI?.getName(),
        rivalScore,
        correctCount,
        totalCount,
        maxStreak: match.maxStreak,
        overclockHits: match.overclockHits,
        averagePeelTier: avgPeel,
        unlockedRelic: 'armillary_orrery',
        unlockedPerk,
        nextActionLabel: 'OPEN WORLD GLOBE',
        secondaryActionLabel: 'INSPECT ARMILLARY ORRERY',
      };

      this.onSummaryPrimary = () => this.enterWorldGlobe();
      this.onSummarySecondary = () => {
        this.state.observatoryRelic = 'armillary_orrery';
        this.enterPassportObservatory();
      };

      this.startDialogueSequence(
        'london_outro',
        { story: this.story.getSnapshot(), lastMatchWon: won },
        () => {
          this.presentMatchSummary(summary, 'GB');
        }
      );
      return;
    }

    // ------------------------------------------------------------------------
    // CAMPAIGN: HIDDEN LONDON BLACK SALON
    // ------------------------------------------------------------------------
    if (match.mode === 'CAMPAIGN' && match.campaignNodeId === 'gb_black_salon') {
      this.story.completeCampaignNode('gb_black_salon');
      this.story.setFlag('black_salon_intel', true);
      this.story.adjustPublicTrust(12);
      this.story.adjustIntegrity(10);
      this.story.shiftBond('teo', 1);
      this.syncStoryAndRatings();

      const summary: MatchSummaryState = {
        mode: 'CAMPAIGN',
        title: 'BLACK SALON · TRIAL 00 INTEL SECURED',
        subtitle:
          'You survived Teo\'s off-grid Fracture vault (2x points · Tier-3 sealed) and extracted the "AL-MANS—" dossier fragment.',
        won: true,
        playerScore: match.score,
        correctCount,
        totalCount,
        maxStreak: match.maxStreak,
        overclockHits: match.overclockHits,
        averagePeelTier: avgPeel,
        nextActionLabel: 'RETURN TO WORLD GLOBE',
        secondaryActionLabel: 'OPEN PASSPORT',
      };

      this.onSummaryPrimary = () => this.enterWorldGlobe();
      this.onSummarySecondary = () => this.enterPassportObservatory();

      this.startDialogueSequence(
        'black_salon_outro',
        { story: this.story.getSnapshot(), lastMatchWon: won },
        () => {
          this.presentMatchSummary(summary, 'GB');
        }
      );
      return;
    }

    // ------------------------------------------------------------------------
    // CAMPAIGN: TOKYO STAGE 2
    // ------------------------------------------------------------------------
    if (match.mode === 'CAMPAIGN' && match.campaignNodeId === 'jp_tokyo') {
      this.story.completeCampaignNode('jp_tokyo');
      this.story.unlockRelic('origami_prism');
      if (won) this.story.adjustPublicTrust(8);
      this.syncStoryAndRatings();

      const unlockedPerk = match.choiceUnlockedPerk ? PERKS[match.choiceUnlockedPerk] : undefined;
      const act2Ready = this.story.isNodeCompleted('gb_london');

      const summary: MatchSummaryState = {
        mode: 'CAMPAIGN',
        title: won ? 'TOKYO SKY PAVILION · VICTORY' : 'TOKYO SKY PAVILION · STAGE COMPLETE',
        subtitle: act2Ready
          ? 'Folding Origami Prism unlocked! Act II Charter to Rio de Janeiro is now LIVE on your World Globe!'
          : 'Folding Origami Prism unlocked! Complete London next to open the Act II Charter to Rio.',
        won,
        playerScore: match.score,
        rivalName: match.rivalAI?.getName(),
        rivalScore,
        correctCount,
        totalCount,
        maxStreak: match.maxStreak,
        overclockHits: match.overclockHits,
        averagePeelTier: avgPeel,
        unlockedRelic: 'origami_prism',
        unlockedPerk,
        nextActionLabel: act2Ready ? 'FLY TO RIO (ACT II)' : 'OPEN WORLD GLOBE',
        secondaryActionLabel: 'INSPECT ORIGAMI PRISM',
      };

      this.onSummaryPrimary = () =>
        act2Ready ? this.launchCampaignNodeInternal('br_rio') : this.enterWorldGlobe();
      this.onSummarySecondary = () => {
        this.state.observatoryRelic = 'origami_prism';
        this.enterPassportObservatory();
      };

      this.startDialogueSequence(
        'tokyo_outro',
        { story: this.story.getSnapshot(), lastMatchWon: won },
        () => {
          this.presentMatchSummary(summary, 'JP');
        }
      );
      return;
    }

    // ------------------------------------------------------------------------
    // CAMPAIGN: STAGE 3 — RIO DE JANEIRO
    // ------------------------------------------------------------------------
    if (match.mode === 'CAMPAIGN' && match.campaignNodeId === 'br_rio') {
      this.story.completeCampaignNode('br_rio');
      this.story.unlockRelic('emerald_sphere');
      const newlyUnlockedSkin = this.story.unlockSkin('EMERALD_SOVEREIGN', false);
      if (won) this.story.adjustPublicTrust(8);
      this.syncStoryAndRatings();

      const unlockedPerk = match.choiceUnlockedPerk ? PERKS[match.choiceUnlockedPerk] : undefined;

      const summary: MatchSummaryState = {
        mode: 'CAMPAIGN',
        title: won ? 'RIO GLASS CANOPY · VICTORY' : 'RIO GLASS CANOPY · STAGE COMPLETE',
        subtitle: newlyUnlockedSkin
          ? 'Unlocked Emerald Resonance Sphere + EMERALD SOVEREIGN Prism Skin! Cairo / Giza is now open on the World Globe.'
          : 'Emerald Resonance Sphere claimed before 10,000 cheering fans. Next destination: Cairo / Giza.',
        won,
        playerScore: match.score,
        rivalName: match.rivalAI?.getName(),
        rivalScore,
        correctCount,
        totalCount,
        maxStreak: match.maxStreak,
        overclockHits: match.overclockHits,
        averagePeelTier: avgPeel,
        unlockedRelic: 'emerald_sphere',
        unlockedPerk,
        nextActionLabel: 'FLY TO CAIRO / GIZA',
        secondaryActionLabel: 'OPEN WORLD GLOBE',
      };

      this.onSummaryPrimary = () => this.launchCampaignNodeInternal('eg_cairo');
      this.onSummarySecondary = () => this.enterWorldGlobe();

      this.startDialogueSequence(
        'rio_outro',
        { story: this.story.getSnapshot(), lastMatchWon: won },
        () => {
          this.presentMatchSummary(summary, 'BR');
        }
      );
      return;
    }

    // ------------------------------------------------------------------------
    // CAMPAIGN: STAGE 4 — CAIRO / GIZA
    // ------------------------------------------------------------------------
    if (match.mode === 'CAMPAIGN' && match.campaignNodeId === 'eg_cairo') {
      this.story.completeCampaignNode('eg_cairo');
      this.story.unlockRelic('cipher_box');
      this.syncStoryAndRatings();

      const snap = this.story.getSnapshot();
      const unlockedPerk = match.choiceUnlockedPerk ? PERKS[match.choiceUnlockedPerk] : undefined;
      const isWhistle = snap.act3Branch === 'WHISTLEBLOWER';

      const summary: MatchSummaryState = {
        mode: 'CAMPAIGN',
        title: 'CAIRO VAULT · MERIDIAN ZERO CRACKED',
        subtitle: isWhistle
          ? 'Cipher Box & Black Salon Crimson Skin unlocked! Whistleblower Path opens Reykjavik\'s pirate Black Salon crash.'
          : 'Cipher Box & Damascus Titanium Skin unlocked! Insider Path opens Reykjavik\'s closed World Council Conclave.',
        won,
        playerScore: match.score,
        rivalName: match.rivalAI?.getName(),
        rivalScore,
        correctCount,
        totalCount,
        maxStreak: match.maxStreak,
        overclockHits: match.overclockHits,
        averagePeelTier: avgPeel,
        unlockedRelic: 'cipher_box',
        unlockedPerk,
        nextActionLabel: 'FLY TO REYKJAVIK (ACT III)',
        secondaryActionLabel: 'OPEN WORLD GLOBE',
      };

      this.onSummaryPrimary = () => this.launchCampaignNodeInternal('is_reykjavik');
      this.onSummarySecondary = () => this.enterWorldGlobe();

      this.startDialogueSequence(
        'cairo_outro',
        { story: this.story.getSnapshot(), lastMatchWon: won },
        () => {
          this.presentMatchSummary(summary, 'EG');
        }
      );
      return;
    }

    // ------------------------------------------------------------------------
    // CAMPAIGN: STAGE 5 — REYKJAVIK
    // ------------------------------------------------------------------------
    if (match.mode === 'CAMPAIGN' && match.campaignNodeId === 'is_reykjavik') {
      this.story.completeCampaignNode('is_reykjavik');
      this.story.unlockRelic('cryo_relay');
      this.story.setFlag('reykjavik_trojan_truth', true);
      if (won) this.story.adjustPublicTrust(6);
      this.syncStoryAndRatings();

      const unlockedPerk = match.choiceUnlockedPerk ? PERKS[match.choiceUnlockedPerk] : undefined;

      const summary: MatchSummaryState = {
        mode: 'CAMPAIGN',
        title: won ? 'REYKJAVIK CALDERA · VICTORY' : 'REYKJAVIK CALDERA · RELAY SECURED',
        subtitle:
          "Vance's Trojan Horse revealed with Tariq Al-Mansoor! Aurora Cryo-Core Relay unlocked — Singapore Sky-Bridge awaits.",
        won,
        playerScore: match.score,
        rivalName: match.rivalAI?.getName(),
        rivalScore,
        correctCount,
        totalCount,
        maxStreak: match.maxStreak,
        overclockHits: match.overclockHits,
        averagePeelTier: avgPeel,
        unlockedRelic: 'cryo_relay',
        unlockedPerk,
        nextActionLabel: 'FLY TO SINGAPORE',
        secondaryActionLabel: 'OPEN WORLD GLOBE',
      };

      this.onSummaryPrimary = () => this.launchCampaignNodeInternal('sg_singapore');
      this.onSummarySecondary = () => this.enterWorldGlobe();

      this.startDialogueSequence(
        'reykjavik_outro',
        { story: this.story.getSnapshot(), lastMatchWon: won },
        () => {
          this.presentMatchSummary(summary, 'IS');
        }
      );
      return;
    }

    // ------------------------------------------------------------------------
    // CAMPAIGN: STAGE 6 — SINGAPORE
    // ------------------------------------------------------------------------
    if (match.mode === 'CAMPAIGN' && match.campaignNodeId === 'sg_singapore') {
      this.story.completeCampaignNode('sg_singapore');
      this.story.unlockRelic('council_seal');
      this.story.setFlag('singapore_ledger_key', true);
      if (won) this.story.adjustPublicTrust(10);
      this.syncStoryAndRatings();

      const summary: MatchSummaryState = {
        mode: 'CAMPAIGN',
        title: won ? 'SINGAPORE SKY-BRIDGE · COUP SHATTERED' : 'SINGAPORE SKY-BRIDGE · SEAL CLAIMED',
        subtitle:
          'Fractured Council Seal unlocked! Act IV Grand Finale at THE APEX FORUM (International Waters) is now LIVE!',
        won,
        playerScore: match.score,
        rivalName: match.rivalAI?.getName(),
        rivalScore,
        correctCount,
        totalCount,
        maxStreak: match.maxStreak,
        overclockHits: match.overclockHits,
        averagePeelTier: avgPeel,
        unlockedRelic: 'council_seal',
        nextActionLabel: 'ENTER THE APEX FORUM',
        secondaryActionLabel: 'OPEN WORLD GLOBE',
      };

      this.onSummaryPrimary = () => this.launchCampaignNodeInternal('global_apex');
      this.onSummarySecondary = () => this.enterWorldGlobe();

      this.startDialogueSequence(
        'singapore_outro',
        { story: this.story.getSnapshot(), lastMatchWon: won, betrayer: match.betrayer },
        () => {
          this.presentMatchSummary(summary, 'SG');
        }
      );
      return;
    }

    // ------------------------------------------------------------------------
    // CAMPAIGN: STAGE 7 — THE APEX FORUM GRAND FINALE (ALL 4 PLAYABLE ENDINGS!)
    // ------------------------------------------------------------------------
    if (match.mode === 'CAMPAIGN' && match.campaignNodeId === 'global_apex') {
      this.story.completeCampaignNode('global_apex');
      this.story.unlockRelic('master_ledger');
      this.story.unlockSkin('KYOTO_KINTSUGI', false);
      this.syncStoryAndRatings();

      this.startDialogueSequence(
        'apex_finale_choice',
        { story: this.story.getSnapshot(), lastMatchWon: won },
        () => {
          const chosenEnding: EndingId = this.pendingEndingAwarded ?? 'SOVEREIGN_ARBITER';
          const endingMeta = ENDING_METADATA[chosenEnding];

          const summary: MatchSummaryState = {
            mode: 'CAMPAIGN',
            title: endingMeta.title,
            subtitle: `${endingMeta.subtitle} Unlocked Master Ledger Core & Kyoto Kintsugi Gold Prism Skin!`,
            won: true,
            playerScore: match.score,
            rivalName: match.rivalAI?.getName(),
            rivalScore,
            correctCount,
            totalCount,
            maxStreak: match.maxStreak,
            overclockHits: match.overclockHits,
            averagePeelTier: avgPeel,
            unlockedRelic: 'master_ledger',
            nextActionLabel: 'OPEN WORLD GLOBE',
            secondaryActionLabel: 'INSPECT MASTER LEDGER',
          };

          this.onSummaryPrimary = () => this.enterWorldGlobe();
          this.onSummarySecondary = () => {
            this.state.observatoryRelic = 'master_ledger';
            this.enterPassportObservatory();
          };

          this.presentMatchSummary(summary, 'GLOBAL', chosenEnding);
        }
      );
      return;
    }

    // ------------------------------------------------------------------------
    // MODE 5: WORLD COUNCIL TRIALS — GHOST DUELS & BLACK SALON 16-PLAYER BRACKET
    // ------------------------------------------------------------------------
    if (match.mode === 'TRIALS') {
      if (match.trialsKind === 'BLACK_SALON' && match.salonRoundCfg) {
        const roundCfg = match.salonRoundCfg;
        const pledged = this.story.getSnapshot().pledgedFaction;

        if (won) {
          if (roundCfg.round < 3) {
            const pts = roundCfg.round === 1 ? 220 : 300;
            this.story.recordTrialsWin(pts);
            this.salonRound = (roundCfg.round + 1) as 2 | 3;
            this.salonEliminated = false;
            const nextCfg = BLACK_SALON_BRACKET_ROUNDS[this.salonRound - 1];
            this.syncStoryAndRatings();

            const summary: MatchSummaryState = {
              mode: 'TRIALS',
              title: `BLACK SALON · ${roundCfg.roundLabel} CLEARED`,
              subtitle: `Eliminated ${roundCfg.opponentHandle}! Next up: ${nextCfg.roundLabel} (${nextCfg.modifierTitle})${pledged ? ` · +${pts} ${FACTION_METADATA[pledged].name} pts!` : ''}`,
              won: true,
              playerScore: match.score,
              rivalName: roundCfg.opponentHandle,
              rivalScore,
              correctCount,
              totalCount,
              maxStreak: match.maxStreak,
              overclockHits: match.overclockHits,
              averagePeelTier: avgPeel,
              nextActionLabel:
                this.salonRound === 2 ? 'PLAY SEMIFINAL' : 'PLAY GRAND FINAL',
              secondaryActionLabel: 'TRIALS HUB',
            };

            this.onSummaryPrimary = () => this.beginBlackSalonBracketMatch();
            this.onSummarySecondary = () => this.enterTrialsHub();
            this.presentMatchSummary(summary, roundCfg.venue);
            return;
          }

          // GRAND FINAL VICTORY — BLACK SALON 16-PLAYER CHAMPION!
          this.story.recordSalonTrophy();
          this.story.recordTrialsWin(500);
          this.story.unlockSkin('BLACK_SALON_CRIMSON', true);
          this.applyActiveSkinToScene();
          this.salonRound = 0;
          this.salonEliminated = false;
          this.syncStoryAndRatings();

          const summary: MatchSummaryState = {
            mode: 'TRIALS',
            title: 'BLACK SALON 16-PLAYER CHAMPION!',
            subtitle: `Black Salon Trophy awarded & BLACK SALON CRIMSON Prism Skin unlocked!${pledged ? ` +500 Faction War points for ${FACTION_METADATA[pledged].name}!` : ''}`,
            won: true,
            playerScore: match.score,
            rivalName: roundCfg.opponentHandle,
            rivalScore,
            correctCount,
            totalCount,
            maxStreak: match.maxStreak,
            overclockHits: match.overclockHits,
            averagePeelTier: avgPeel,
            nextActionLabel: 'RETURN TO TRIALS HUB',
            secondaryActionLabel: 'OPEN PRISM ATELIER',
          };

          this.onSummaryPrimary = () => this.enterTrialsHub();
          this.onSummarySecondary = () => this.enterPassportObservatory();
          this.presentMatchSummary(summary, roundCfg.venue);
          return;
        }

        // Eliminated in Black Salon Bracket
        this.salonEliminated = true;
        this.syncStoryAndRatings();

        const summary: MatchSummaryState = {
          mode: 'TRIALS',
          title: `ELIMINATED · ${roundCfg.roundLabel}`,
          subtitle: `${roundCfg.opponentHandle} took the bracket under ${roundCfg.modifierTitle}. Re-enter Quarterfinals anytime!`,
          won: false,
          playerScore: match.score,
          rivalName: roundCfg.opponentHandle,
          rivalScore,
          correctCount,
          totalCount,
          maxStreak: match.maxStreak,
          overclockHits: match.overclockHits,
          averagePeelTier: avgPeel,
          nextActionLabel: 'RE-ENTER BLACK SALON',
          secondaryActionLabel: 'TRIALS HUB',
        };

        this.onSummaryPrimary = () => this.beginBlackSalonBracketMatch();
        this.onSummarySecondary = () => this.enterTrialsHub();
        this.presentMatchSummary(summary, roundCfg.venue);
        return;
      }

      // Async Kinetic Ghost Duel completion
      const ghost = match.trialsGhost;
      const pledged = this.story.getSnapshot().pledgedFaction;
      const factionPts = ghost ? Math.round(120 + Math.max(0, ghost.elo - 1100) * 0.25) : 150;

      if (won) {
        this.story.recordTrialsWin(factionPts);
      }
      this.syncStoryAndRatings();

      const summary: MatchSummaryState = {
        mode: 'TRIALS',
        title: won ? `GHOST DUEL VICTORY · ${ghost?.handle ?? 'CONTENDER'}` : 'GHOST DUEL COMPLETE',
        subtitle: won
          ? pledged
            ? `Outscored ${ghost?.handle ?? 'Ghost'} (Elo ${ghost?.elo ?? 1500})! Added +${factionPts} Faction War points to ${FACTION_METADATA[pledged].name}.`
            : `Outscored ${ghost?.handle ?? 'Ghost'}! Pledge a Faction in Trials Hub to earn Faction War points.`
          : `${ghost?.handle ?? 'Ghost'} edged you on kinetic telemetry. Study their pace and challenge again!`,
        won,
        playerScore: match.score,
        rivalName: ghost?.handle ?? match.rivalAI?.getName(),
        rivalScore,
        correctCount,
        totalCount,
        maxStreak: match.maxStreak,
        overclockHits: match.overclockHits,
        averagePeelTier: avgPeel,
        nextActionLabel: 'RETURN TO TRIALS HUB',
        secondaryActionLabel: 'REMATCH GHOST',
      };

      const rematchId = ghost?.id ?? TRIALS_GHOST_CONTENDERS[0].id;
      this.onSummaryPrimary = () => this.enterTrialsHub();
      this.onSummarySecondary = () => this.beginGhostDuelMatch(rematchId);
      this.presentMatchSummary(summary, match.venue);
      return;
    }

    // ------------------------------------------------------------------------
    // DAILY: THE GLOBAL FEED
    // ------------------------------------------------------------------------
    if (match.mode === 'DAILY') {
      const dateStr = match.dailyDateStr ?? this.trivia.getDailySeedAndDate().dateStr;
      const percentile = this.trivia.estimateDailyPercentile(match.score);
      const shareText = this.trivia.generateDailyShareGrid(
        dateStr,
        match.resolutions,
        match.score,
        percentile
      );
      this.story.recordDailyResult(dateStr, match.score);
      this.syncStoryAndRatings();

      const summary: MatchSummaryState = {
        mode: 'DAILY',
        title: 'THE GLOBAL FEED · DISPATCH COMPLETE',
        subtitle: `Synchronized UTC Seed (${dateStr}) · Ranked in the ${percentile}th global percentile.`,
        won: correctCount >= 4,
        playerScore: match.score,
        correctCount,
        totalCount,
        maxStreak: match.maxStreak,
        overclockHits: match.overclockHits,
        averagePeelTier: avgPeel,
        dailyShareText: shareText,
        dailyPercentile: percentile,
        nextActionLabel: 'RETURN TO TITLE',
        secondaryActionLabel: 'BRIEFING ROOM',
      };

      this.onSummaryPrimary = () => this.enterTitle(true);
      this.onSummarySecondary = () => this.enterBriefingPicker();

      this.presentMatchSummary(summary, 'STUDIO');
      return;
    }

    // ------------------------------------------------------------------------
    // BRIEFING ROOM
    // ------------------------------------------------------------------------
    const domainMeta =
      match.briefingDomain && match.briefingDomain !== 'MIX'
        ? getDomainMeta(match.briefingDomain)
        : null;
    const morphLabel = match.briefingArchetype ? ARCHETYPE_LABELS[match.briefingArchetype] : null;

    const titlePrefix = domainMeta
      ? domainMeta.name.toUpperCase()
      : morphLabel ?? 'GLOBAL MIX';

    const summary: MatchSummaryState = {
      mode: 'BRIEFING',
      title: `${titlePrefix} · CALIBRATED`,
      subtitle: `${morphLabel && domainMeta ? `${morphLabel} Drill · ` : ''}Your 12-Domain Mastery Radar has updated to Global Elo ${this.trivia.getGlobalElo()}.`,
      won: correctCount >= 3,
      playerScore: match.score,
      correctCount,
      totalCount,
      maxStreak: match.maxStreak,
      overclockHits: match.overclockHits,
      averagePeelTier: avgPeel,
      nextActionLabel: 'RUN AGAIN',
      secondaryActionLabel: 'CHANGE DOMAIN',
    };

    const replayDomain = this.lastBriefingDomain;
    const replayArchetype = this.lastBriefingArchetype;
    this.onSummaryPrimary = () => this.beginBriefingMatch(replayDomain, replayArchetype);
    this.onSummarySecondary = () => this.enterBriefingPicker();

    this.presentMatchSummary(summary, 'STUDIO');
  }

  private presentMatchSummary(
    summary: MatchSummaryState,
    venue: VenueId,
    endingAwarded: EndingId | null = null
  ): void {
    this.stopTickLoop();
    this.state.screen = 'MATCH_SUMMARY';
    this.state.venue = venue;
    this.state.lightingState = 'BROADCAST';
    this.state.activeQuestion = null;
    this.state.lastResolution = null;
    this.state.endlessCheckpoint = null;
    this.state.dialogue = null;
    this.state.matchSummary = summary;
    this.state.endingAwarded = endingAwarded;
    this.state.trialsHub = this.buildTrialsHubState();

    this.scene.setModeView('VENUE_STAGE');
    this.scene.setVenue(venue, 'BROADCAST');
    this.scene.setRivalPrismStatus('HIDDEN');
    this.audio.setVenueMusic(venue, 'IDLE');
    this.audio.playStorySting(summary.won ? 'VICTORY' : 'STAMP');

    this.syncStoryAndRatings();
    this.emitState();
  }

  // ==========================================================================
  // Clipboard Share & Utilities
  // ==========================================================================

  private handleCopyDailyShare(): void {
    const text = this.state.matchSummary?.dailyShareText;
    if (!text) return;

    const onCopied = () => {
      this.showToast('Global Feed Share Grid copied to clipboard!');
    };

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(onCopied)
        .catch(() => {
          this.fallbackCopyText(text, onCopied);
        });
    } else {
      this.fallbackCopyText(text, onCopied);
    }
  }

  private fallbackCopyText(text: string, onSuccess: () => void): void {
    try {
      if (typeof document === 'undefined') return;
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onSuccess();
    } catch {
      this.showToast('Share grid ready — copy manually from summary.');
    }
  }

  private unlockAudio(): void {
    try {
      this.audio.unlock();
    } catch {
      // Safe fallback
    }
  }

  private syncStoryAndRatings(): void {
    const snap = this.story.getSnapshot();
    this.state.story = snap;
    this.state.campaignNodes = buildCampaignNodes(snap);
    this.state.trialsHub = this.buildTrialsHubState();
    this.state.globalElo = this.trivia.getGlobalElo();
    this.state.domainRatings = this.trivia.getDomainRatings();
  }

  private showToast(message: string): void {
    this.clearToastTimer();
    this.state.toastMessage = message;
    this.emitState();
    if (typeof window !== 'undefined') {
      this.toastTimerId = window.setTimeout(() => {
        if (this.disposed) return;
        this.state.toastMessage = null;
        this.toastTimerId = null;
        this.emitState();
      }, 3200);
    }
  }

  private clearToastTimer(): void {
    if (this.toastTimerId !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.toastTimerId);
      this.toastTimerId = null;
    }
  }

  private emitState(): void {
    if (this.disposed) return;
    this.onStateChange({ ...this.state });
  }
}
