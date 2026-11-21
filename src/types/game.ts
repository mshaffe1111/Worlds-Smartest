// ============================================================================
// WORLD'S SMARTEST — Locked Cross-Pillar TypeScript Contracts (v0.1)
// Shared across 3D Engine, Audio/Haptics, Trivia Content, Narrative & Mobile UI
// ============================================================================

export type DomainId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface DomainMeta {
  id: DomainId;
  key: string;
  name: string;
  shortName: string;
  accentHex: string;
  secondaryHex: string;
  materialLabel: string;
  glyphShape: GlyphHint;
  factionAffinity: 'SOVEREIGN' | 'HORIZON' | 'AGORA';
}

export type GlyphHint =
  | 'globe'
  | 'atom'
  | 'crown'
  | 'dna'
  | 'compass'
  | 'prism'
  | 'scales'
  | 'column'
  | 'rocket'
  | 'gear'
  | 'mask'
  | 'flame'
  | 'eye'
  | 'wave'
  | 'star'
  | 'scroll';

export type Archetype3D =
  | 'SIGHTLINE_LOCK'
  | 'CODEX_DUAL_RING'
  | 'CALIBRATOR_DIAL'
  | 'GAUNTLET_SHATTER'
  | 'HERO_ARTIFACT_SYNTHESIS';

export type VenueId = 'CH' | 'GB' | 'JP' | 'LEDGER' | 'STUDIO';

export type CharacterId = 'vance' | 'nadia' | 'soren' | 'teo' | 'lindqvist' | 'none';

export type CharacterMood = 'NEUTRAL' | 'IMPRESSED' | 'TENSE' | 'SMIRK' | 'RATTLED' | 'TELL';

export type RivalPrismStatus = 'HIDDEN' | 'THINKING' | 'PEELING' | 'OVERCLOCKING' | 'LOCKED';

export type HeroRelicId = 'meridian_astrolabe' | 'armillary_orrery' | 'origami_prism';

export type LightingState = 'BROADCAST' | 'FRACTURE' | 'INTIMATE' | 'ARCHIVE';

export type GameModeId = 'CAMPAIGN' | 'DAILY' | 'BRIEFING' | 'ENDLESS';

export type PersonaId = 'MAVERICK' | 'DIPLOMAT' | 'ANALYST' | 'PRODIGY';

export type OriginId = 'ACADEMIC' | 'POLYMATH' | 'STRATEGIST';

export type PerkId =
  | 'DIPLOMATIC_REDACTION'
  | 'CLEAN_HANDS'
  | 'HORIZON_LENS'
  | 'ANALOG_STATIC_MASTER'
  | 'DIPLOMAT_COMPOSURE'
  | 'MAVERICK_GAMBIT';

export interface PerkMeta {
  id: PerkId;
  name: string;
  tagline: string;
  effectDescription: string;
  source: string;
}

export type NarrativeFlag =
  | 'SOVEREIGN_BLOC'
  | 'HORIZON_TECH'
  | 'AGORA_CIVIC'
  | 'MERIDIAN_ZERO'
  | 'BLACK_SALON'
  | 'ESPIONAGE'
  | 'ETHICS'
  | 'HIGH_POWER'
  | 'INVESTIGATIVE'
  | 'LATERAL_DEDUCTION'
  | 'CLASSIFIED_LEDGER'
  | 'HIGH_STAKES_BLUFF'
  | 'ARCHIVE_CORE'
  | 'CURRENT_PULSE'
  | 'RIVAL_PRESSURE'
  | 'FINALE_SYNTHESIS';

export type ToneTag = 'PRESTIGE' | 'WITTY' | 'THRILLER' | 'CRYPTIC';

export type PeelTier = 1 | 2 | 3;

export interface Distractor {
  text: string; // <= 28 chars for crisp 3D glass facet typography
  plausibility: number; // 0..1 (higher = trickier near-miss)
}

export interface CodexExt {
  pairs: Array<{ subject: string; target: string }>; // Exactly 3 pairs
  decoyTarget: string; // 4th target decoy on lower ring
}

export interface CalibratorExt {
  exactVal: number;
  unit: string;
  minVal: number;
  maxVal: number;
  logScale?: boolean;
  step?: number;
}

export interface GauntletExt {
  isTrue: boolean;
  isTrick: boolean; // True if "CHALLENGE!" flick-up awards 2.0x bonus
  windowSec: number;
}

export interface QuestionRecord {
  qid: number; // Dense monotonic ID (1..1,048,575 for 1M-scale Roaring/Bitset engine)
  l0Domain: DomainId;
  l1Category: string;
  l2Subcategory: string;
  microTopicId: string;
  regions: string[]; // ISO-3166 ("CH","GB","JP","GLOBAL")
  narrativeTags: NarrativeFlag[];
  tone: ToneTag;
  irtB: number; // -2.5 (accessible) .. +3.0 (polymath)
  irtA: number; // discrimination >= 0.8
  freshness: 'EVERGREEN' | 'SLOW_DRIFT' | 'CURRENT_EVENTS';
  archetype: Archetype3D;
  prompt: string; // <= 140 chars
  answerCorrect: string; // <= 28 chars for Sightline
  distractors?: Distractor[]; // 3-4 distractors for SIGHTLINE_LOCK / HERO_ARTIFACT_SYNTHESIS
  clues: [string, string]; // [Tier-2 Lateral <= 90 chars, Tier-3 Pinpoint <= 80 chars]
  glyphHint: GlyphHint;
  whyExplanation: string; // <= 180 chars
  codexExt?: CodexExt;
  calibratorExt?: CalibratorExt;
  gauntletExt?: GauntletExt;
  heroRelicId?: HeroRelicId;
}

export interface MatchQuerySpec {
  count: number;
  mode: GameModeId;
  regions?: string[];
  domains?: DomainId[];
  archetypes?: Archetype3D[];
  requiredTags?: NarrativeFlag[];
  boostTags?: NarrativeFlag[];
  pinnedQids?: number[];
  targetDifficultyCurve?: number[]; // optional per-question irtB targets
  seed?: number; // deterministic seed for Daily Global Feed
  allowRepeatsFallback?: boolean;
}

export interface AnswerSubmission {
  archetype: Archetype3D;
  selectedFacetIndex?: number;
  selectedText?: string;
  peelTier: PeelTier;
  overclockBonus: number; // 0.0 (safe lock) .. 1.0 (+100% overclock)
  overclocked: boolean;
  elapsedSec: number;
  calibratorVal?: number;
  calibratorTolerancePct?: number; // fraction of total range (0.02..0.35)
  codexMatches?: Array<{ subjectIndex: number; targetIndex: number }>;
  gauntletAction?: 'TRUE' | 'FALSE' | 'CHALLENGE';
  timedOut?: boolean;
}

export interface QuestionResolution {
  qid: number;
  correct: boolean;
  partialScoreRatio?: number;
  bullseye?: boolean;
  backfired: boolean;
  basePoints: number;
  tierMultiplier: number;
  overclockMultiplier: number;
  speedBonus: number;
  totalPoints: number;
  correctAnswerDisplay: string;
  whyExplanation: string;
  peelTier: PeelTier;
  overclocked: boolean;
  rivalPointsDelta?: number;
  rivalCorrect?: boolean;
  promptSnapshot: string;
  domainId: DomainId;
}

// ----------------------------------------------------------------------------
// Narrative & Persistent Profile State
// ----------------------------------------------------------------------------

export type BondLevel = 'NEMESIS' | 'RIVAL' | 'NEUTRAL' | 'ALLIED';

export interface IntelFlashBookmark {
  qid: number;
  prompt: string;
  answer: string;
  why: string;
  domainId: DomainId;
  savedAt: number;
}

export interface StoryStateSnapshot {
  prologueComplete: boolean;
  origin: OriginId | null;
  persona: PersonaId | null;
  axisIntegrity: number; // -100 (Ambition) .. +100 (Integrity)
  publicTrust: number; // 0..100
  councilFavor: number; // 0..100
  bonds: Record<'nadia' | 'teo' | 'lindqvist' | 'soren', BondLevel>;
  flags: Record<string, boolean | string>;
  unlockedPerks: PerkId[];
  activePerks: PerkId[];
  unlockedRelics: HeroRelicId[];
  completedCampaignNodes: string[];
  currentAct: 0 | 1 | 2;
  firstFlightChoice: 'GB' | 'JP' | null;
  blackSalonUnlocked: boolean;
  bookmarks: IntelFlashBookmark[];
  dailyCompletedDate: string | null;
  dailyBestScore: number;
  endlessBestFloor: number;
  endlessBestScore: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  bestStreak: number;
}

export interface StoryChoice {
  id: string;
  label: string;
  subtext: string;
  tag?: string; // e.g. "+Integrity" or "Fracture Mode"
  tagTone?: 'gold' | 'cyan' | 'crimson' | 'neutral';
}

export interface DialogueDisplay {
  sceneTitle: string;
  locationLabel: string;
  speakerId: CharacterId;
  speakerName: string;
  speakerRole: string;
  text: string;
  tellHint?: string; // subtle observational cue (e.g. "Vance adjusts his left brass cufflink.")
  choices?: StoryChoice[];
  continueLabel?: string;
  accentTone?: 'gold' | 'crimson' | 'cyan';
  beatProgress?: string;
}

export interface CampaignNodeMeta {
  id: string;
  country: 'CH' | 'GB' | 'JP' | 'BR' | 'EG' | 'IS' | 'SG';
  city: string;
  venueName: string;
  subtitle: string;
  status: 'LOCKED' | 'AVAILABLE' | 'COMPLETED' | 'COMING_SOON';
  factionLabel: string;
  isBlackSalon?: boolean;
}

// ----------------------------------------------------------------------------
// Active Match & UI Snapshot Contracts
// ----------------------------------------------------------------------------

export interface ActiveFacetDisplay {
  index: number;
  text: string;
  shattered: boolean;
  redacted?: boolean;
  stressFracture?: boolean; // Horizon Probability Lens subtle hint
}

export interface RivalUIState {
  id: CharacterId;
  name: string;
  title: string;
  score: number;
  status: RivalPrismStatus;
  tellMessage?: string;
}

export interface ActiveQuestionState {
  question: QuestionRecord;
  questionNumber: number;
  totalQuestions: number; // 0 for Endless
  facets: ActiveFacetDisplay[];
  activeFacetIndex: number;
  peelTier: PeelTier;
  peelLocked: boolean; // True in Analog Static / Black Salon!
  peelLockReason?: string;
  revealedClues: string[];
  timeRemainingSec: number;
  timeTotalSec: number;
  overclockProgress: number; // 0..1
  overclockActive: boolean;
  calibratorVal: number;
  calibratorTolerancePct: number;
  calibratorMultiplier: number;
  codexOrderTop: string[];
  codexOrderBottom: string[];
  codexAlignedCount: number;
  canRedactionPerk: boolean;
  activeModifiers: string[];
  tutorialHint?: string;
  ethicalInterrupt?: {
    speaker: string;
    message: string;
    leakedHint: string;
    choices: StoryChoice[];
  };
}

export interface EndlessCheckpointState {
  floor: number;
  strataName: 'PUBLIC STRATA' | 'DIPLOMATIC VAULTS' | 'MERIDIAN ZERO CORE';
  bankedScore: number;
  unbankedScore: number;
  shields: number;
  maxShields: number;
  loreSnippet: string;
}

export interface MatchSummaryState {
  mode: GameModeId;
  title: string;
  subtitle: string;
  won: boolean;
  playerScore: number;
  rivalName?: string;
  rivalScore?: number;
  correctCount: number;
  totalCount: number;
  maxStreak: number;
  overclockHits: number;
  averagePeelTier: number;
  unlockedRelic?: HeroRelicId;
  unlockedPerk?: PerkMeta;
  personaAwarded?: PersonaId;
  dailyShareText?: string;
  dailyPercentile?: number;
  nextActionLabel: string;
  secondaryActionLabel?: string;
}

export type GameScreen =
  | 'TITLE'
  | 'DIALOGUE'
  | 'WORLD_GLOBE'
  | 'ACTIVE_MATCH'
  | 'INTEL_FLASH'
  | 'ENDLESS_AIRLOCK'
  | 'MATCH_SUMMARY'
  | 'BRIEFING_PICKER'
  | 'PASSPORT_OBSERVATORY';

export interface GameUIState {
  screen: GameScreen;
  mode: GameModeId;
  venue: VenueId;
  venueTitle: string;
  lightingState: LightingState;
  playerScore: number;
  streak: number;
  shields: number;
  maxShields: number;
  globalElo: number;
  domainRatings: number[]; // 12 domain Elo ratings (600..2400)
  story: StoryStateSnapshot;
  dialogue: DialogueDisplay | null;
  campaignNodes: CampaignNodeMeta[];
  selectedGlobeCountry: 'CH' | 'GB' | 'JP' | 'BR' | 'EG' | 'IS' | 'SG';
  rival: RivalUIState | null;
  activeQuestion: ActiveQuestionState | null;
  lastResolution: QuestionResolution | null;
  endlessCheckpoint: EndlessCheckpointState | null;
  matchSummary: MatchSummaryState | null;
  observatoryRelic: HeroRelicId;
  audioMuted: boolean;
  hapticsEnabled: boolean;
  toastMessage: string | null;
}

export interface GameActions {
  // Navigation & Modes
  goToTitle: () => void;
  startOrContinueCampaign: () => void;
  openWorldGlobe: () => void;
  selectGlobeCountry: (country: 'CH' | 'GB' | 'JP' | 'BR' | 'EG' | 'IS' | 'SG') => void;
  launchCampaignNode: (nodeId: string) => void;
  startDailyFeed: () => void;
  openBriefingRoom: () => void;
  startBriefingRun: (domain: DomainId | 'MIX') => void;
  startEndlessDescent: () => void;
  openPassportObservatory: () => void;
  selectObservatoryRelic: (relicId: HeroRelicId) => void;
  togglePerk: (perkId: PerkId) => void;
  resetCampaignProgress: () => void;

  // Story & Dialogue
  advanceDialogue: () => void;
  chooseDialogueOption: (choiceId: string) => void;
  chooseEthicalInterrupt: (choiceId: string) => void;

  // Veritas Prism Interactive Actions
  spinPrism: (deltaX: number, ring?: 'TOP' | 'BOTTOM') => void;
  stepFacet: (direction: -1 | 1) => void;
  peelPrism: () => void;
  beginOverclock: () => void;
  cancelOverclock: () => void;
  commitLock: () => void;
  adjustCalibrator: (deltaPos: number, deltaTolerance: number) => void;
  commitCodex: () => void;
  swipeGauntlet: (action: 'TRUE' | 'FALSE' | 'CHALLENGE') => void;
  useDiplomaticRedaction: () => void;

  // Post-Question / Checkpoint / Summary
  continueAfterIntelFlash: () => void;
  toggleBookmarkLastFlash: () => void;
  endlessDescend: () => void;
  endlessExtract: () => void;
  summaryPrimaryAction: () => void;
  summarySecondaryAction: () => void;
  copyDailyShare: () => void;

  // Globe / Relic direct drag
  dragWorldOrRelic: (dx: number, dy: number) => void;

  // Settings
  toggleMute: () => void;
  toggleHaptics: () => void;
}

// ----------------------------------------------------------------------------
// Engine Subsystem Interfaces
// ----------------------------------------------------------------------------

export type MusicLayer = 'IDLE' | 'INTERVIEW' | 'DEDUCTION' | 'COUNTDOWN' | 'STREAK' | 'FRACTURE';

export interface IAudioEngine {
  unlock(): void;
  setMuted(muted: boolean): void;
  isMuted(): boolean;
  setVenueMusic(venue: VenueId, layer?: MusicLayer): void;
  setMusicLayer(layer: MusicLayer): void;
  playSpinTick(velocity?: number): void;
  playSightlineSnap(): void;
  playPeelShutter(tier: PeelTier): void;
  startOverclockCharge(): void;
  updateOverclockCharge(progress: number): void;
  stopOverclockCharge(committed: boolean): void;
  playCalibratorTick(tightness: number): void;
  playCorrectReveal(streak: number, overclocked: boolean): void;
  playWrongReveal(backfired: boolean): void;
  playGauntletSwipe(action: 'TRUE' | 'FALSE' | 'CHALLENGE'): void;
  playStorySting(kind: 'SUMMONS' | 'CHOICE' | 'TWIST' | 'STAMP' | 'VICTORY'): void;
  playUiTap(): void;
}

export interface IHapticsEngine {
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
  spinTick(): void;
  sightlineSnap(): void;
  peel(tier: PeelTier): void;
  overclockPulse(progress: number): void;
  lockThunk(): void;
  correctBloom(): void;
  wrongThud(backfired: boolean): void;
  uiTap(): void;
}

export interface PrismLoadOptions {
  facets?: string[];
  redactionIndex?: number;
  probabilityHintIndices?: number[];
  disablePeel?: boolean;
  relicId?: HeroRelicId;
  codexTop?: string[];
  codexBottom?: string[];
  calibratorInitialPos?: number;
  calibratorInitialTol?: number;
}

export interface ISceneManager {
  mount(container: HTMLElement): void;
  dispose(): void;
  setModeView(view: 'TITLE' | 'VENUE_STAGE' | 'PRISM_ACTIVE' | 'GLOBE' | 'OBSERVATORY'): void;
  setVenue(venue: VenueId, lighting?: LightingState): void;
  setLightingState(state: LightingState): void;
  setCharacter(charId: CharacterId, mood?: CharacterMood): void;
  setRivalPrismStatus(status: RivalPrismStatus): void;
  loadQuestionOnPrism(question: QuestionRecord, options?: PrismLoadOptions): void;
  spinPrismBy(deltaX: number, ring?: 'TOP' | 'BOTTOM'): void;
  stepFacet(direction: -1 | 1): void;
  getActiveFacetIndex(): number;
  peelPrismTo(tier: PeelTier, shatterIndices?: number[]): void;
  markFacetRedacted(index: number): void;
  setOverclockVisual(progress: number, active: boolean): void;
  cancelOverclockVisual(): void;
  setCalibratorState(normalizedPos: number, toleranceRatio: number): void;
  getCalibratorState(): { normalizedPos: number; toleranceRatio: number };
  getCodexAlignment(): number[]; // target index aligned under each top subject [0, 1, 2]
  triggerGauntletSwipe(action: 'TRUE' | 'FALSE' | 'CHALLENGE', correct: boolean): void;
  playRevealAnimation(result: { correct: boolean; backfired: boolean; correctIndex?: number; streak?: number }): void;
  setChronoProgress(ratio: number): void;
  inspectHeroRelic(relicId: HeroRelicId): void;
  rotateRelicBy(dx: number, dy: number): void;
  rotateGlobeBy(dx: number, dy: number): void;
  focusGlobeCountry(country: 'CH' | 'GB' | 'JP' | 'BR' | 'EG' | 'IS' | 'SG'): void;
  onFacetChanged?: (index: number) => void;
  onGlobePinClicked?: (country: 'CH' | 'GB' | 'JP' | 'BR' | 'EG' | 'IS' | 'SG') => void;
  onCodexChanged?: (alignedIndices: number[]) => void;
}

export interface EvaluateOptions {
  streakBefore?: number;
  cleanHandsPerk?: boolean;
  maverickGambitPerk?: boolean;
  timeTotalSec?: number;
}

export interface ITriviaEngine {
  selectMatchQuestions(spec: MatchQuerySpec): QuestionRecord[];
  evaluateAnswer(
    question: QuestionRecord,
    submission: AnswerSubmission,
    options?: EvaluateOptions
  ): QuestionResolution;
  recordResult(
    question: QuestionRecord,
    resolution: QuestionResolution,
    submission: AnswerSubmission
  ): void;
  getDailySeedAndDate(): { dateStr: string; seed: number };
  generateDailyShareGrid(
    dateStr: string,
    resolutions: QuestionResolution[],
    totalScore: number,
    percentile: number
  ): string;
  estimateDailyPercentile(totalScore: number): number;
  getGlobalElo(): number;
  getDomainRatings(): number[]; // 12 items (600..2400)
  getWeakestDomain(): DomainId;
  getTotalQuestionCount(): number;
  getSeenCount(): number;
  resetHistory(): void;
}

