// ============================================================================
// WORLD'S SMARTEST — Sovereign Modernism Master UI & Three-Zone HUD
// Zero-Cropping Responsive Layout + Native <input> Name Entry + Unified 3D Sync
// Wave-2 Integrated: Title Showcase, 2.5D CharacterStageRigDirector,
// OverclockGestureController, Atelier / Observatory / Factions & Backstage Hubs
// ============================================================================

import type {
  Archetype3D,
  CalibratorConeId,
  CampaignHubCode,
  PrismQuestion,
} from '../forge/types';
import { CAMPAIGN_DIFFICULTY_CURVE, FORGE_DOMAINS } from '../forge/types';
import type {
  DuelChallengePayload,
  DuelHeadToHeadSummary,
  LeaderboardCohortSnapshot,
} from '../modes';
import type { OriginId } from '../narrative/PassportSystem';
import { resolvePortraitCutoutUrl } from './CutscenePlayer';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import type { CharacterStageRigDirector } from '../characters';
import type { OverclockGestureController } from '../ergonomics';

export type ActiveHubTab = 'CAMPAIGN' | 'DAILY' | 'BRIEFING' | 'ENDLESS' | 'TRIALS';

export interface VaultLiveStatus {
  srsDueCount: number;
  srsTotalCount: number;
  isOnline: boolean;
  swReady: boolean;
  offlinePacksReady: string[];
  offlineDownloadingLabel?: string | null;
  honoursTotal?: number;
  honoursUnlocked?: number;
  atelierFinishesTotal?: number;
}

export interface CampaignResumeViewInfo {
  hasProgress: boolean;
  kind: 'NEW_GAME' | 'RESUME_PROLOGUE' | 'FLIGHT_FORK' | 'RESUME_MISSION';
  activeHub: CampaignHubCode;
  nextMissionId: string | null;
  primaryCtaLabel: string;
  subLabel: string;
  bannerTitle: string;
  bannerSub: string;
}

export interface TitleShowcaseViewState {
  challengerName: string;
  hasRegisteredName: boolean;
  prologueCompleted: boolean;
  verifiedQuestionTotal: number;
  playableQuestionTotal: number;
  resumeState?: CampaignResumeViewInfo;
  incomingDuel?: DuelChallengePayload | null;
  srsDueCount?: number;
}

export interface CityCardState {
  hub: CampaignHubCode;
  order: number;
  city: string;
  venueName: string;
  difficultyLabel: string;
  timerSec: number;
  unlocked: boolean;
  clearedMissions: number;
  totalMissions: number;
  coreClearedMissions?: number;
  coreTotalMissions?: number;
  sideClearedMissions?: number;
  sideTotalMissions?: number;
  diplomaticCrossClearance?: boolean;
  activeBranchBadge?: string | null;
  isActiveResumeHub?: boolean;
  nextPlayableMissionId?: string | null;
  nextPlayableMissionTitle?: string | null;
  lockRequirementText?: string;
  missions: Array<{
    id: string;
    slot: number;
    title: string;
    subtitle: string;
    unlocked: boolean;
    completed: boolean;
    isBoss?: boolean;
    isSideInvestigation?: boolean;
    questionCount?: number;
    estimatedMinutes?: number;
    failedAttempts?: number;
    lastFailReason?: string;
  }>;
}

export interface RegistrationViewState {
  challengerName: string;
  selectedOrigin: OriginId;
  vanceLine: string;
  errorMessage?: string;
}

export interface DialogueChoiceItem {
  id: string;
  label: string;
  subtext?: string;
  consequenceTag?: string;
}

export interface StoryDialogueViewState {
  chyronTitle: string;
  locationLabel: string;
  speakerId: string;
  speakerName: string;
  speakerRole: string;
  expression: string;
  text: string;
  passiveInsightText?: string;
  tellText?: string;
  choices?: DialogueChoiceItem[];
  continueLabel?: string;
  secondaryActionLabel?: string;
}

export interface GameplayQuestionViewState {
  modeLabel: string;
  chyronTitle: string;
  chyronSub: string;
  questionIndex: number;
  questionTotal: number;
  challengerName: string;
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
  isPrologueQuestion?: boolean;
  question: PrismQuestion;
  remainingTimeSec: number;
  totalTimeSec: number;
  heroStepIndex?: 0 | 1 | 2;
  selectedFacetIndex: number;
  peelTier: 1 | 2 | 3;
  peelSealedByJammer?: boolean;
  freeCoopCueAvailable?: boolean;
  horizonWeakFacetIndex?: number | null;
  showPeoplesHeatmap?: boolean;
  councilVetoAvailable?: boolean;
  shatteredFacetIndices: number[];
  calibratorEstimate: number;
  calibratorCone: CalibratorConeId;
  codexTargetSelections: [number, number, number];
  selectedGlobeCoords?: { lat: number; lon: number } | null;
  selectedGlobeAnchorIndex?: number | null;
  isInstantTrialPrism?: boolean;
  duelLiveSplit?: {
    challengerName: string;
    playerScore: number;
    challengerScore: number;
    deltaPts: number;
    leader: 'PLAYER' | 'CHALLENGER' | 'TIED';
    challengerLockLabel?: string;
  } | null;
  revealed?: {
    correct: boolean;
    backfired: boolean;
    bullseye?: boolean;
    earnedPoints: number;
    tierMultiplier: number;
    overclockMultiplier: number;
    speedBonus: number;
    correctFacetIndex?: number;
    selectedFacetIndex?: number;
    correctDisplay: string;
    whyExplanation: string;
    bookmarked: boolean;
    feedbackVote?: 'UPVOTE' | 'FLAG' | null;
    feedbackToast?: string | null;
    globeDistanceKm?: number;
    globeAccuracyTier?: string;
  } | null;
}

export interface MatchSummaryViewState {
  mode: ActiveHubTab;
  victory: boolean;
  headline: string;
  subheadline: string;
  challengerName: string;
  playerScore: number;
  rivalName?: string;
  rivalScore?: number;
  correctCount: number;
  totalCount: number;
  bestStreak: number;
  unlockedRelicTitle?: string;
  unlockedClueTitle?: string;
  dailyShareText?: string;
  duelShareUrl?: string;
  duelShareLabel?: string;
  duelVerdict?: DuelHeadToHeadSummary | null;
  leaderboard?: LeaderboardCohortSnapshot | null;
  endlessCanContinueFloor?: number;
  endlessShieldsLeft?: number;
  flightForkPending?: boolean;
  retryMissionId?: string;
  failureCauseBanner?: string;
  failureRivalId?: string;
  failureRivalQuote?: string;
  failureCityFirstMissionId?: string;
}

export interface HubViewState {
  activeTab: ActiveHubTab;
  challengerName: string;
  personaLabel: string;
  prologueCompleted: boolean;
  flightForkPending: boolean;
  selectedCityHub: CampaignHubCode;
  activeResumeHub?: CampaignHubCode;
  resumeState?: CampaignResumeViewInfo;
  lockedCityNotice?: {
    hub: CampaignHubCode;
    city: string;
    requirementText: string;
  } | null;
  duelRivalsSummary?: {
    totalDuels: number;
    wins: number;
    losses: number;
    ties: number;
    recentRivals: Array<{ name: string; bestScore: number; recordLabel: string }>;
  };
  cities: CityCardState[];
  campaignCompletedMissions?: number;
  campaignTotalMissions?: number;
  campaignCompletionPct?: number;
  campaignCompletionLabel?: string;
  campaignRemainingHoursLabel?: string;
  verifiedQuestionTotal: number;
  playableQuestionTotal: number;
  dailyCompletedToday: boolean;
  dailyBestScore: number;
  endlessBestFloor: number;
  endlessBestScore: number;
  endlessCanResumeDepth?: number | null;
  pledgedFaction: 'SOVEREIGN' | 'HORIZON' | 'AGORA';
  trialsWins: number;
  blackSalonUnlocked: boolean;
}

export interface SovereignHUDActions {
  onToggleMasterAudio?: () => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onOpenPassport: () => void;
  onOpenSaveSlots: () => void;
  onOpenAnalytics: () => void;
  onOpenHonours: () => void;
  onOpenAtelier: () => void;
  onOpenObservatory: () => void;
  onOpenMasteryReviewDeck?: () => void;
  onDownloadOfflinePack?: () => void;
  onOpenFactions: () => void;
  onOpenDossier: () => void;
  onReturnToTitle: () => void;
  onReturnToHub: () => void;
  onTopBarBack?: () => void;
  onVaultDrawerToggle?: (open: boolean) => void;

  // Title Showcase Actions (#137 P1 #7a + v2.0 Instant Prism & Incoming Duel)
  onTitleEnterMeridian: () => void;
  onTitleQuickMode: (tab: ActiveHubTab) => void;
  onLaunchInstantPrism?: () => void;
  onInstantPrismAction?: (dest: 'CAMPAIGN' | 'BASEBALL' | 'DAILY' | 'ANOTHER') => void;
  onAcceptIncomingDuel?: (payload: DuelChallengePayload) => void;
  onDismissIncomingDuel?: () => void;

  // Registration (Geneva Encrypted Summons)
  onCompleteRegistration: (name: string, origin: OriginId) => void;

  // Hub Actions
  onSelectHubTab: (tab: ActiveHubTab) => void;
  onSelectCity: (hub: CampaignHubCode) => void;
  onHubContinueNow?: () => void;
  onDismissLockedCityNotice?: () => void;
  onStartPrologue: () => void;
  onChooseFlightFork: (hub: 'gb' | 'jp') => void;
  onLaunchMission: (missionId: string) => void;
  onLaunchBackstageHub: (hub: CampaignHubCode) => void;
  onLaunchDaily: () => void;
  onOpenBriefingPicker: (opts?: {
    initialL0DomainId?: number;
    initialL1SubcategoryId?: string;
    initialL2TopicId?: string;
    initialSearchQuery?: string;
  }) => void;
  onLaunchQuickBriefing: () => void;
  onLaunchTopicQuickBriefing?: (spec: {
    domainId: number;
    l1SubcategoryId: string;
    l2TopicId: string;
    label: string;
    count?: 5 | 10 | 20 | 50;
  }) => void;
  onLaunchVisualOrGlobeShowcase?: (kind: 'GLOBE_PIN_DROP' | 'VISUAL_BLUEPRINT') => void;
  onLaunchEndless: (resume: boolean) => void;
  onPledgeFaction: (faction: 'SOVEREIGN' | 'HORIZON' | 'AGORA') => void;
  onLaunchGhostTrial: (blackSalon: boolean) => void;

  // Story Dialogue Actions
  onSelectDialogueChoice: (choiceId: string) => void;
  onAdvanceDialogue: () => void;
  onSecondaryDialogueAction?: () => void;

  // Live Gameplay Actions
  onSelectFacet: (facetIndex: number) => void;
  onSelectGlobeAnchor?: (lat: number, lon: number, anchorIndex: number) => void;
  onTriggerPeel: () => void;
  onTriggerCouncilVeto: () => void;
  onUpdateCalibrator: (estimate: number, cone: CalibratorConeId) => void;
  onUpdateCodexRing: (subjectIdx: 0 | 1 | 2, delta: number) => void;
  onSubmitGauntlet: (action: 'VERIFY' | 'DEBUNK' | 'CHALLENGE') => void;
  onOverclockChargeProgress: (charge01: number) => void;
  onOverclockBluffCancel: () => void;
  onCommitLock: (overclockCharge01: number) => void;
  onToggleBookmark: () => void;
  onRateQuestion?: (vote: 'UPVOTE' | 'FLAG') => void;
  onNextQuestion: () => void;

  // Summary / Endless Airlock / Failure / Duel Share Actions
  onContinueEndlessDescent: () => void;
  onRetryMission?: (missionId: string) => void;
  onRestartFromStart?: (cityFirstMissionId?: string) => void;
  onCopyDailyShare: (text: string) => void;
  onShareDuelLink?: (url: string, title: string, text: string) => Promise<boolean> | boolean | void;
  onSummaryPrimaryContinue: () => void;
}

function escapeHtml(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Strips any `[[DOMAIN] ...]` prompt metadata tags so spoken dialogue is 100% clean (#137 P1 #5) */
export function cleanNarrativeCopy(raw: string | undefined | null): string {
  if (!raw) return '';
  return raw
    .replace(/\[\[[\s\S]*?\]\]/g, '')
    .replace(/\bMIDDLE_SCHOOL\b/g, 'Middle School')
    .replace(/\bHIGH_SCHOOL\b/g, 'High School')
    .replace(/\bGLOBAL_MIX\b/g, 'Global Mix')
    .replace(/\bGLOBE_PIN_DROP\b/g, 'Globe Pin-Drop')
    .replace(/\bVISUAL_BLUEPRINT\b/g, 'Visual Blueprint')
    .replace(/\bSIGHTLINE_LOCK\b/g, 'Sightline Lock')
    .replace(/\bCALIBRATOR_DIAL\b/g, 'Calibrator Dial')
    .replace(/\bCODEX_DUAL_RING\b/g, 'Codex Dual-Ring')
    .replace(/\bGAUNTLET_SHATTER\b/g, 'Gauntlet Shatter')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const HUD_YEAR_UNIT_RE =
  /^(?:ce|bce|ad|bc|c\.e\.|b\.c\.e\.|a\.d\.|b\.c\.|year|yr|season)$/i;
const HUD_YEAR_PROMPT_RE =
  /\b(what year|which year|in what year|when did|when was|when were|born|died|founded|opened|established|inducted|signed|released|published|debuted|world series|olympics|century|decade|date)\b/i;

/**
 * Returns true when a numeric value represents a calendar year or era date
 * (`1000..2150` with empty unit, or explicit `CE`/`BCE`/`AD`/`BC`/`year`/`yr`/`season` unit)
 * that must NEVER render with commas! Non-empty non-year units (`light-years`, `Earth years`,
 * `seats`, `km`, `m`, etc.) ALWAYS return false so they preserve clean thousands commas.
 */
export function isYearLikeHudValue(val: number, unit?: string, _prompt?: string): boolean {
  const cleanUnit = (unit ?? '').trim();
  if (cleanUnit) {
    return HUD_YEAR_UNIT_RE.test(cleanUnit);
  }
  if (Number.isInteger(val) && val >= 1000 && val <= 2150) {
    return true;
  }
  return false;
}

/**
 * Smart HUD numeric formatter: NEVER puts commas inside 4-digit years (`1984`, NEVER `1,984`)
 * or `CE`/`BCE`/`year` quantities, while keeping clean commas for large non-year quantities.
 */
export function formatHudValue(val: number, unit?: string, prompt?: string): string {
  if (!Number.isFinite(val)) return String(val);
  if (isYearLikeHudValue(val, unit, prompt)) {
    return String(val);
  }
  return val.toLocaleString('en-US');
}

/** Formats Calibrator tolerance margins without inserting commas into year-span margins. */
export function formatCalibratorMargin(
  margin: number,
  unit?: string,
  prompt?: string,
  exactVal?: number,
): string {
  if (!Number.isFinite(margin)) return String(margin);
  const yearContext =
    HUD_YEAR_UNIT_RE.test((unit ?? '').trim()) ||
    (typeof exactVal === 'number' && isYearLikeHudValue(exactVal, unit, prompt));
  if (yearContext && Math.abs(margin) < 10000) {
    return String(margin);
  }
  return margin.toLocaleString('en-US');
}

/** Formats non-year counts, score deltas, and geodesic distances with clean thousands separators. */
function formatCount(val: number): string {
  if (!Number.isFinite(val)) return String(val);
  return Math.round(val).toLocaleString('en-US');
}

/**
 * Runtime copy hygiene guard for displayed prompts, facets, clues, and reveal answers:
 * strips accidental commas inside calendar years (`1,984` -> `1984`, `1,864 CE` -> `1864 CE`)
 * and fixes `City. ST?` state punctuation (`Detroit. MI?` -> `Detroit, MI?`).
 */
export function sanitizeHudDisplayText(
  raw: string | undefined | null,
  question?: Pick<PrismQuestion, 'archetype' | 'calibrator' | 'prompt'> | null,
): string {
  if (!raw) return '';
  let text = cleanNarrativeCopy(raw);

  // Strip commas in explicit era years (`1,864 CE` -> `1864 CE`)
  text = text.replace(/\b([12]),(\d{3})(\s*(?:CE|BCE|AD|BC))\b/gi, '$1$2$3');
  // Strip commas in contextual year phrases (`in 1,984`, `born 1,903`, `World Series 1,968`)
  text = text.replace(
    /\b(in|born|died|founded|opened|established|inducted|season|series|circa|from|until|since|year|january|february|march|april|may|june|july|august|september|october|november|december)\s+([12]),(\d{3})\b/gi,
    '$1 $2$3',
  );
  // Strip commas in parenthesized years `(1,903)` or `(b. 1,945)` and decades `1,980s`
  text = text.replace(/\(([b.\s]*)([12]),(\d{3})\)/gi, '($1$2$3)');
  text = text.replace(/\b([12]),(\d{3})s\b/g, '$1$2s');

  // If this question is a year-context Calibrator or explicit year question, strip standalone 4-digit year commas
  const isYearCal = Boolean(
    question?.archetype === 'CALIBRATOR_DIAL' &&
      question.calibrator &&
      isYearLikeHudValue(
        question.calibrator.exactVal,
        question.calibrator.unit,
        question.prompt,
      ),
  );
  if (isYearCal) {
    text = text.replace(/\b([12]),(\d{3})\b/g, '$1$2');
  } else if (question?.prompt && HUD_YEAR_PROMPT_RE.test(question.prompt)) {
    text = text.replace(/^([12]),(\d{3})$/, '$1$2');
  }

  // Fix `City. ST?` punctuation typos (e.g. `Detroit. MI?` -> `Detroit, MI?`) while preserving initials like `U. S.`
  text = text.replace(
    /\b([A-Za-z]{2,}(?:\s+[A-Za-z]{2,})*)\.\s+([A-Z]{2})(?=[?!,)\s]|$)/g,
    '$1, $2',
  );
  return text;
}

/** Formats WGS84 latitude/longitude compactly without calendar-year commas (e.g. `42.3°N, 71.1°W`). */
export function formatLatLonCompact(lat: number, lon: number): string {
  const safeLat = Number.isFinite(lat) ? Math.max(-90, Math.min(90, lat)) : 0;
  const safeLon = Number.isFinite(lon) ? Math.max(-180, Math.min(180, lon)) : 0;
  const ns = safeLat >= 0 ? 'N' : 'S';
  const ew = safeLon >= 0 ? 'E' : 'W';
  return `${Math.abs(safeLat).toFixed(1)}°${ns}, ${Math.abs(safeLon).toFixed(1)}°${ew}`;
}

export interface QuestionDifficultyBadge {
  tierKey: 'middle-school' | 'high-school' | 'college' | 'graduate' | 'mensa';
  label: string;
  color: string;
  bg: string;
}

/** Resolves calibrated 5-tier academic difficulty pill (`MIDDLE SCHOOL` .. `MENSA`) from `PrismQuestion`. */
export function resolveQuestionDifficultyBadge(q: PrismQuestion): QuestionDifficultyBadge {
  const ext = q as PrismQuestion & {
    difficultyTier?: string;
    difficultyLabel?: string;
  };
  const tier = (ext.difficultyTier ?? '').toUpperCase();
  if (tier === 'MIDDLE_SCHOOL' || (!tier && q.irtB < -0.85)) {
    return {
      tierKey: 'middle-school',
      label: (ext.difficultyLabel || 'Middle School').toUpperCase(),
      color: '#6ee7b7',
      bg: 'rgba(57,212,154,0.16)',
    };
  }
  if (tier === 'HIGH_SCHOOL' || (!tier && q.irtB < -0.15)) {
    return {
      tierKey: 'high-school',
      label: (ext.difficultyLabel || 'High School').toUpperCase(),
      color: '#7dd3fc',
      bg: 'rgba(86,212,245,0.16)',
    };
  }
  if (tier === 'COLLEGE' || (!tier && q.irtB < 0.65)) {
    return {
      tierKey: 'college',
      label: (ext.difficultyLabel || 'College').toUpperCase(),
      color: '#f2cf7e',
      bg: 'rgba(242,207,126,0.16)',
    };
  }
  if (tier === 'GRADUATE' || (!tier && q.irtB < 1.45)) {
    return {
      tierKey: 'graduate',
      label: (ext.difficultyLabel || 'Graduate').toUpperCase(),
      color: '#fdba74',
      bg: 'rgba(240,157,70,0.18)',
    };
  }
  return {
    tierKey: 'mensa',
    label: (ext.difficultyLabel || 'Mensa').toUpperCase(),
    color: '#f0abfc',
    bg: 'rgba(217,70,239,0.18)',
  };
}

type HudIconName =
  | 'audioOn'
  | 'audioOff'
  | 'passport'
  | 'stats'
  | 'trophy'
  | 'crown'
  | 'prism'
  | 'scales'
  | 'save'
  | 'dossier'
  | 'ambience'
  | 'globe'
  | 'star'
  | 'mic'
  | 'flight'
  | 'lock'
  | 'shield'
  | 'bolt'
  | 'copy'
  | 'thumbUp'
  | 'flag'
  | 'swords'
  | 'share'
  | 'pin'
  | 'layers'
  | 'wifi';

const HUD_ICON_PATHS: Record<HudIconName, string> = {
  audioOn:
    '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9.5 9.5 0 0 1 0 14"/>',
  audioOff:
    '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>',
  passport:
    '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><line x1="8" y1="16.5" x2="16" y2="16.5"/>',
  stats:
    '<line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="12" width="3" height="8" rx="0.6"/><rect x="11" y="7" width="3" height="13" rx="0.6"/><rect x="16" y="4" width="3" height="16" rx="0.6"/>',
  trophy:
    '<path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v2a3 3 0 0 0 3 3"/><path d="M17 6h3v2a3 3 0 0 1-3 3"/><line x1="12" y1="14" x2="12" y2="19"/><line x1="8" y1="19" x2="16" y2="19"/>',
  crown:
    '<path d="M3 18h18l-1.5-10-4.5 4-3-6-3 6-4.5-4L3 18z"/><line x1="4" y1="20.5" x2="20" y2="20.5"/>',
  prism:
    '<polygon points="12 2.5 21 10 12 21.5 3 10 12 2.5"/><polyline points="3 10 12 12.5 21 10"/><line x1="12" y1="2.5" x2="12" y2="21.5"/>',
  scales:
    '<line x1="12" y1="3" x2="12" y2="20"/><line x1="7" y1="20" x2="17" y2="20"/><line x1="5" y1="7" x2="19" y2="7"/><path d="M5 7l-2.5 6h5L5 7z"/><path d="M19 7l-2.5 6h5L19 7z"/>',
  save:
    '<path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4z"/><polyline points="8 4 8 9 15 9 15 4"/><rect x="8" y="13.5" width="8" height="6.5" rx="0.5"/>',
  dossier:
    '<circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="20.5" y2="20.5"/>',
  ambience:
    '<path d="M3 20h18"/><path d="M4 9l8-5 8 5"/><line x1="6" y1="9" x2="6" y2="20"/><line x1="10" y1="9" x2="10" y2="20"/><line x1="14" y1="9" x2="14" y2="20"/><line x1="18" y1="9" x2="18" y2="20"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4.2" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/>',
  star:
    '<path d="M12 2.5l2.4 7.1L21.5 12l-7.1 2.4L12 21.5l-2.4-7.1L2.5 12l7.1-2.4L12 2.5z"/>',
  mic:
    '<rect x="9" y="3" width="6" height="10" rx="3"/><path d="M6 11a6 6 0 0 0 12 0"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8.5" y1="21" x2="15.5" y2="21"/>',
  flight:
    '<path d="M21 3L10 14"/><polygon points="21 3 14.5 21 10.5 13.5 3 9.5 21 3"/>',
  lock:
    '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  shield:
    '<path d="M12 3l7.5 3v6c0 4.5-3.2 7.8-7.5 9.2C7.7 19.8 4.5 16.5 4.5 12V6L12 3z"/>',
  bolt:
    '<polygon points="13 2 4.5 13 11.5 13 10.5 22 19.5 11 12.5 11 13 2"/>',
  copy:
    '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 3h9A1.5 1.5 0 0 1 14.5 4.5V6"/>',
  thumbUp:
    '<path d="M7 10v11"/><path d="M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
  flag:
    '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  swords:
    '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/>',
  share:
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  pin:
    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  layers:
    '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  wifi:
    '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
};

function hudIcon(name: HudIconName, size = 15): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.18em;flex-shrink:0;">${HUD_ICON_PATHS[name]}</svg>`;
}

export class SovereignHUD {
  private root: HTMLElement;
  private audio: StudioAudioEngine;
  private haptics: HapticsEngine;
  private actions: SovereignHUDActions;
  private characterRig: CharacterStageRigDirector | null = null;
  private overclockController: OverclockGestureController | null = null;
  private unbindOverclockBtn: (() => void) | null = null;

  private overclockHoldRaf = 0;
  private overclockPointerId: number | null = null;
  private overclockStartMs = 0;
  private overclockStartX = 0;
  private overclockCancelled = false;
  private currentCharge01 = 0;
  private lastOverclockHandledMs = 0;
  private fallbackWindowCleanup: (() => void) | null = null;
  private vaultOpen = false;
  private visualLightboxEl: HTMLElement | null = null;
  private vaultStatus: VaultLiveStatus = {
    srsDueCount: 0,
    srsTotalCount: 0,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine !== false : true,
    swReady: false,
    offlinePacksReady: [],
    offlineDownloadingLabel: null,
    honoursTotal: 84,
    honoursUnlocked: 0,
    atelierFinishesTotal: 16,
  };

  constructor(
    root: HTMLElement,
    audio: StudioAudioEngine,
    haptics: HapticsEngine,
    actions: SovereignHUDActions,
    deps?: {
      characterRig?: CharacterStageRigDirector | null;
      overclockController?: OverclockGestureController | null;
    },
  ) {
    this.root = root;
    this.audio = audio;
    this.haptics = haptics;
    this.actions = actions;
    this.characterRig = deps?.characterRig ?? null;
    this.overclockController = deps?.overclockController ?? null;
    this.injectNinePatchCssVariables();
  }

  public attachWave2Systems(deps: {
    characterRig?: CharacterStageRigDirector | null;
    overclockController?: OverclockGestureController | null;
  }): void {
    if (deps.characterRig !== undefined) {
      this.characterRig = deps.characterRig;
    }
    if (deps.overclockController !== undefined) {
      this.overclockController = deps.overclockController;
    }
  }

  /** Called by SovereignMasterController when pointer/gesture commit or bluff-cancel fires. */
  public notifyOverclockCommittedOrCancelled(): void {
    this.lastOverclockHandledMs = performance.now();
  }

  public isVaultDrawerOpen(): boolean {
    return this.vaultOpen;
  }

  public isVisualLightboxOpen(): boolean {
    return this.visualLightboxEl !== null;
  }

  public closeVisualLightbox(): void {
    if (this.visualLightboxEl) {
      this.visualLightboxEl.remove();
      this.visualLightboxEl = null;
    }
  }

  public setVaultLiveStatus(partial: Partial<VaultLiveStatus>): void {
    this.vaultStatus = { ...this.vaultStatus, ...partial };
    this.syncVaultLiveStatusDom();
  }

  private syncVaultLiveStatusDom(): void {
    const srsBadge = this.root.querySelector<HTMLElement>('#ws-vault-srs-badge');
    if (srsBadge) {
      const due = Math.max(0, this.vaultStatus.srsDueCount);
      const total = Math.max(0, this.vaultStatus.srsTotalCount);
      srsBadge.textContent = due > 0 ? `${due} Due` : `${total} Cards`;
      srsBadge.classList.toggle('is-due', due > 0);
    }

    const offBadge = this.root.querySelector<HTMLElement>('#ws-vault-offline-badge');
    const offSub = this.root.querySelector<HTMLElement>('#ws-vault-offline-sub');
    const packReady =
      this.vaultStatus.offlinePacksReady.includes('BASEBALL_PRO') ||
      this.vaultStatus.offlinePacksReady.includes('FULL_WORLD_CIRCUIT');
    const downloading = this.vaultStatus.offlineDownloadingLabel;
    if (offBadge) {
      offBadge.textContent = downloading
        ? downloading
        : packReady
          ? 'Ready Offline'
          : 'Download';
      offBadge.classList.toggle('is-offline-ready', packReady && !downloading);
    }
    if (offSub) {
      const netTag = this.vaultStatus.isOnline ? 'Online' : 'Airplane Mode';
      offSub.textContent = downloading
        ? `Caching offline pack (${downloading})...`
        : packReady
          ? `${netTag} · Baseball & World Pack Cached`
          : `${netTag} · Download Baseball & World Pack`;
    }

    const honoursTitle = this.root.querySelector<HTMLElement>('#ws-vault-trophies-title');
    if (honoursTitle) {
      const total = Math.max(1, this.vaultStatus.honoursTotal ?? 84);
      const unlocked = Math.max(0, this.vaultStatus.honoursUnlocked ?? 0);
      honoursTitle.textContent =
        unlocked > 0
          ? `${total} Medals & Trophies (${unlocked}/${total})`
          : `${total} Medals & Trophies`;
    }

    const atelierSub = this.root.querySelector<HTMLElement>('#ws-vault-atelier-sub');
    if (atelierSub) {
      const finishes = Math.max(1, this.vaultStatus.atelierFinishesTotal ?? 16);
      atelierSub.textContent = `${finishes} Finishes · 24K prism & HUD themes`;
    }
  }

  public openVaultDrawer(): void {
    if (this.vaultOpen) return;
    this.vaultOpen = true;
    this.syncVaultDrawerDomState();
    this.syncVaultLiveStatusDom();
    this.actions.onVaultDrawerToggle?.(true);
  }

  public closeVaultDrawer(): void {
    if (!this.vaultOpen) return;
    this.vaultOpen = false;
    this.syncVaultDrawerDomState();
    this.actions.onVaultDrawerToggle?.(false);
  }

  private syncVaultDrawerDomState(): void {
    const backdrop = this.root.querySelector<HTMLElement>('#ws-vault-backdrop');
    const drawer = this.root.querySelector<HTMLElement>('#ws-vault-drawer');
    const trigger = this.root.querySelector<HTMLButtonElement>('#ws-util-vault');
    if (backdrop) {
      backdrop.classList.toggle('is-open', this.vaultOpen);
      backdrop.setAttribute('aria-hidden', this.vaultOpen ? 'false' : 'true');
      backdrop.hidden = !this.vaultOpen;
    }
    if (drawer) {
      drawer.classList.toggle('is-open', this.vaultOpen);
    }
    if (trigger) {
      trigger.setAttribute('aria-expanded', this.vaultOpen ? 'true' : 'false');
    }
  }

  private injectNinePatchCssVariables(): void {
    // 2026 Sleek Anti-Boxiness Mandate: NEVER add `ws-has-ninepatch` chunky border-image frames!
    document.documentElement.classList.remove('ws-has-ninepatch');
  }

  private renderTopBarHtml(
    chyronTitle: string,
    chyronSub: string,
    showBackBtn: boolean,
    compactGameplay = false,
    isTitleScreen = false,
  ): string {
    const audioActive = this.audio.isMasterAudioActive();

    return `
      <header class="ws-topbar">
        <div class="ws-topbar-left">
          ${
            showBackBtn
              ? `<button type="button" class="ws-topbar-back" id="ws-topbar-back" aria-label="Back" title="${compactGameplay ? 'Leave Match' : 'Back'}">←</button>`
              : ''
          }
          <div class="ws-chyron">
            <span class="ws-chyron-dot" aria-hidden="true"></span>
            <span class="ws-chyron-title">${escapeHtml(chyronTitle)}</span>
            ${chyronSub ? `<span class="ws-chyron-sub">· ${escapeHtml(chyronSub)}</span>` : ''}
          </div>
        </div>
        <div class="ws-topbar-right">
          <button
            type="button"
            class="ws-topbar-icon-btn ${audioActive ? 'is-active' : 'is-muted'}"
            id="ws-util-audio"
            aria-label="${audioActive ? 'Mute All Audio' : 'Unmute Audio'}"
            title="${audioActive ? 'Audio On — Tap to Mute All' : 'Audio Muted — Tap to Unmute'}"
          >${audioActive ? hudIcon('audioOn', 16) : hudIcon('audioOff', 16)}</button>
          <button
            type="button"
            class="ws-vault-trigger"
            id="ws-util-vault"
            aria-haspopup="dialog"
            aria-expanded="${this.vaultOpen ? 'true' : 'false'}"
            title="Open Meridian Vault Menu"
          >☰ VAULT</button>
        </div>
      </header>
      ${this.renderVaultDrawerHtml(compactGameplay, isTitleScreen)}
    `;
  }

  private renderVaultDrawerHtml(compactGameplay: boolean, isTitleScreen: boolean): string {
    const musicOn = this.audio.isMusicEnabled();
    const musicAvail = this.audio.isMusicAvailable();
    const sfxOn = this.audio.isSfxEnabled();
    const openClass = this.vaultOpen ? 'is-open' : '';
    const srsDue = Math.max(0, this.vaultStatus.srsDueCount);
    const srsTotal = Math.max(0, this.vaultStatus.srsTotalCount);
    const packReady =
      this.vaultStatus.offlinePacksReady.includes('BASEBALL_PRO') ||
      this.vaultStatus.offlinePacksReady.includes('FULL_WORLD_CIRCUIT');
    const downloading = this.vaultStatus.offlineDownloadingLabel;
    const netTag = this.vaultStatus.isOnline ? 'Online' : 'Airplane Mode';
    const offlineSub = downloading
      ? `Caching offline pack (${downloading})...`
      : packReady
        ? `${netTag} · Baseball & World Pack Cached`
        : `${netTag} · Download Baseball & World Pack`;
    const offlineBadge = downloading
      ? downloading
      : packReady
        ? 'Ready Offline'
        : 'Download';

    return `
      <div
        class="ws-vault-backdrop ${openClass}"
        id="ws-vault-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="Meridian Vault Menu"
        aria-hidden="${this.vaultOpen ? 'false' : 'true'}"
        ${this.vaultOpen ? '' : 'hidden'}
      >
        <nav class="ws-vault-drawer ${openClass}" id="ws-vault-drawer" aria-label="Meridian Vault">
          <div class="ws-vault-header">
            <div>
              <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.16em;color:var(--cyan-clue);">MERIDIAN ARCHIVE</div>
              <div style="font-family:var(--font-display);font-size:16px;font-weight:800;letter-spacing:0.08em;color:var(--gold-bright);">SOVEREIGN VAULT</div>
            </div>
            <button type="button" class="ws-topbar-icon-btn" id="ws-vault-close" aria-label="Close Vault Menu">✕</button>
          </div>

          <div class="ws-vault-list">
            <div class="ws-vault-section-label">CAREER &amp; SHOWCASE</div>
            <button type="button" class="ws-vault-item" id="ws-vault-srs">
              <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('layers', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title">Spaced-Repetition Deck</span>
                <span class="ws-vault-item-sub">5-Box Leitner mastery &amp; missed-question queue</span>
              </span>
              <span class="ws-vault-badge ${srsDue > 0 ? 'is-due' : ''}" id="ws-vault-srs-badge">${srsDue > 0 ? `${srsDue} Due` : `${srsTotal} Cards`}</span>
            </button>
            <button type="button" class="ws-vault-item" id="ws-util-passport">
              <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('passport', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title">Passport &amp; Persona</span>
                <span class="ws-vault-item-sub">Diplomatic visas, title crest &amp; identity</span>
              </span>
              <span class="ws-vault-item-chev" aria-hidden="true">›</span>
            </button>
            <button type="button" class="ws-vault-item" id="ws-util-stats">
              <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('stats', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title">Career Stats &amp; Graphs</span>
                <span class="ws-vault-item-sub">Right/wrong history, ELO &amp; 12-domain radar</span>
              </span>
              <span class="ws-vault-item-chev" aria-hidden="true">›</span>
            </button>
            <button type="button" class="ws-vault-item" id="ws-util-trophies">
              <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('trophy', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title" id="ws-vault-trophies-title">${
                  (this.vaultStatus.honoursUnlocked ?? 0) > 0
                    ? `${this.vaultStatus.honoursTotal ?? 84} Medals &amp; Trophies (${this.vaultStatus.honoursUnlocked}/${this.vaultStatus.honoursTotal ?? 84})`
                    : `${this.vaultStatus.honoursTotal ?? 84} Medals &amp; Trophies`
                }</span>
                <span class="ws-vault-item-sub">Sculpted medals &amp; zero-P2W rewards</span>
              </span>
              <span class="ws-vault-item-chev" aria-hidden="true">›</span>
            </button>
            <button type="button" class="ws-vault-item" id="ws-util-observatory">
              <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('crown', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title">3D Observatory</span>
                <span class="ws-vault-item-sub">360° Boss Relics, Crown &amp; Saved Flashes</span>
              </span>
              <span class="ws-vault-item-chev" aria-hidden="true">›</span>
            </button>
            <button type="button" class="ws-vault-item" id="ws-util-atelier">
              <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('prism', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title">Prism Atelier</span>
                <span class="ws-vault-item-sub" id="ws-vault-atelier-sub">${this.vaultStatus.atelierFinishesTotal ?? 16} Finishes · 24K prism &amp; HUD themes</span>
              </span>
              <span class="ws-vault-item-chev" aria-hidden="true">›</span>
            </button>
            <button type="button" class="ws-vault-item" id="ws-util-factions">
              <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('scales', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title">Council Blocs &amp; Contenders</span>
                <span class="ws-vault-item-sub">Faction standings &amp; Ghost Trials</span>
              </span>
              <span class="ws-vault-item-chev" aria-hidden="true">›</span>
            </button>

            <div class="ws-vault-section-label">CAMPAIGN &amp; OFFLINE</div>
            <button type="button" class="ws-vault-item" id="ws-util-saves">
              <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('save', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title">5-Slot Saves</span>
                <span class="ws-vault-item-sub">Switch, export, import or reset dossiers</span>
              </span>
              <span class="ws-vault-item-chev" aria-hidden="true">›</span>
            </button>
            <button type="button" class="ws-vault-item" id="ws-util-dossier">
              <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('dossier', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title">12-Clue Dossier</span>
                <span class="ws-vault-item-sub">Conspiracy board &amp; suspect red-threads</span>
              </span>
              <span class="ws-vault-item-chev" aria-hidden="true">›</span>
            </button>
            <button type="button" class="ws-vault-item" id="ws-vault-offline-pack">
              <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('wifi', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title">Offline Airplane Pack</span>
                <span class="ws-vault-item-sub" id="ws-vault-offline-sub">${escapeHtml(offlineSub)}</span>
              </span>
              <span class="ws-vault-badge ${packReady && !downloading ? 'is-offline-ready' : ''}" id="ws-vault-offline-badge">${escapeHtml(offlineBadge)}</span>
            </button>

            <div class="ws-vault-section-label">STUDIO AUDIO</div>
            <button type="button" class="ws-vault-item" id="ws-util-sfx" aria-pressed="${sfxOn ? 'true' : 'false'}">
              <span class="ws-vault-item-icon" aria-hidden="true">${sfxOn ? hudIcon('audioOn', 16) : hudIcon('audioOff', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title">SFX &amp; Voice</span>
                <span class="ws-vault-item-sub">Horological Foley &amp; cast performances</span>
              </span>
              <span class="ws-vault-toggle-state ${sfxOn ? 'is-on' : ''}">${sfxOn ? 'ON' : 'OFF'}</span>
            </button>
            <button type="button" class="ws-vault-item" id="ws-util-music" aria-pressed="${musicOn ? 'true' : 'false'}">
              <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('ambience', 16)}</span>
              <span class="ws-vault-item-body">
                <span class="ws-vault-item-title">Room Ambience</span>
                <span class="ws-vault-item-sub">Acoustic sanctuary air bed</span>
              </span>
              <span class="ws-vault-toggle-state ${musicAvail && musicOn ? 'is-on' : ''}">${musicAvail && musicOn ? 'ON' : 'OFF'}</span>
            </button>

            ${
              !isTitleScreen
                ? `
              <div class="ws-vault-section-label">NAVIGATION</div>
              <button type="button" class="ws-vault-item" id="ws-util-menu">
                <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('globe', 16)}</span>
                <span class="ws-vault-item-body">
                  <span class="ws-vault-item-title">${compactGameplay ? 'Leave Match to Hub' : 'Campaign Map & Modes'}</span>
                  <span class="ws-vault-item-sub">8-city globe &amp; all 5 game modes</span>
                </span>
                <span class="ws-vault-item-chev" aria-hidden="true">›</span>
              </button>
              <button type="button" class="ws-vault-item" id="ws-util-title">
                <span class="ws-vault-item-icon" aria-hidden="true">${hudIcon('star', 16)}</span>
                <span class="ws-vault-item-body">
                  <span class="ws-vault-item-title">Start Screen</span>
                  <span class="ws-vault-item-sub">Return to 3D Veritas Prism front stage</span>
                </span>
                <span class="ws-vault-item-chev" aria-hidden="true">›</span>
              </button>
            `
                : ''
            }
          </div>
        </nav>
      </div>
    `;
  }

  private bindTopBarEvents(): void {
    this.root.querySelector('#ws-topbar-back')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.closeVaultDrawer();
      if (this.actions.onTopBarBack) {
        this.actions.onTopBarBack();
      } else {
        this.actions.onReturnToHub();
      }
    });

    this.root.querySelector('#ws-util-audio')?.addEventListener('click', () => {
      this.haptics.uiTap();
      if (this.actions.onToggleMasterAudio) {
        this.actions.onToggleMasterAudio();
      } else {
        this.actions.onToggleSfx();
        if (this.audio.isSfxEnabled()) {
          this.audio.playSfx('ui_tap');
        }
      }
    });

    this.root.querySelector('#ws-util-vault')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      if (this.vaultOpen) {
        this.closeVaultDrawer();
      } else {
        this.openVaultDrawer();
      }
    });

    this.root.querySelector('#ws-vault-close')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.closeVaultDrawer();
    });

    const backdrop = this.root.querySelector<HTMLElement>('#ws-vault-backdrop');
    backdrop?.addEventListener('click', (ev) => {
      if (ev.target === backdrop) {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.closeVaultDrawer();
      }
    });

    const bindVaultNav = (selector: string, handler: () => void) => {
      this.root.querySelector(selector)?.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.closeVaultDrawer();
        handler();
      });
    };

    bindVaultNav('#ws-vault-srs', () => {
      if (this.actions.onOpenMasteryReviewDeck) {
        this.actions.onOpenMasteryReviewDeck();
      } else {
        this.actions.onOpenObservatory();
      }
    });
    bindVaultNav('#ws-util-passport', () => this.actions.onOpenPassport());
    bindVaultNav('#ws-util-saves', () => this.actions.onOpenSaveSlots());
    bindVaultNav('#ws-util-stats', () => this.actions.onOpenAnalytics());
    bindVaultNav('#ws-util-trophies', () => this.actions.onOpenHonours());
    bindVaultNav('#ws-util-atelier', () => this.actions.onOpenAtelier());
    bindVaultNav('#ws-util-observatory', () => this.actions.onOpenObservatory());
    bindVaultNav('#ws-util-factions', () => this.actions.onOpenFactions());
    bindVaultNav('#ws-util-dossier', () => this.actions.onOpenDossier());
    bindVaultNav('#ws-util-title', () => this.actions.onReturnToTitle());
    bindVaultNav('#ws-util-menu', () => this.actions.onReturnToHub());

    this.root.querySelector('#ws-vault-offline-pack')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onDownloadOfflinePack?.();
    });

    this.root.querySelector('#ws-util-music')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onToggleMusic();
    });
    this.root.querySelector('#ws-util-sfx')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.actions.onToggleSfx();
      if (this.audio.isSfxEnabled()) {
        this.audio.playSfx('ui_tap');
      }
    });
  }

  // ==========================================================================
  // 0. 2026 MOBILE-FIRST SLEEK 3D TITLE SHOWCASE (1-CLICK CONTINUE & ZERO JARGON)
  // ==========================================================================

  public renderTitleShowcase(vm: TitleShowcaseViewState): void {
    this.cancelOverclockHold(true);
    this.closeVisualLightbox();

    const ctaMain =
      vm.resumeState?.primaryCtaLabel ??
      (vm.prologueCompleted
        ? `▶ CONTINUE AS ${vm.challengerName.toUpperCase()}`
        : '▶ START STORY CAMPAIGN');
    const ctaSub =
      vm.resumeState?.subLabel ??
      (vm.prologueCompleted ? 'Resume Where You Left Off' : 'Act 0 · Geneva Sanctuary');

    const duel = vm.incomingDuel;
    const duelBannerHtml = duel
      ? `
        <section class="ws-duel-banner" id="ws-incoming-duel-banner" role="region" aria-label="Incoming Challenger Duel">
          <div class="ws-duel-banner-head">
            <span class="ws-duel-banner-eyebrow" style="display:inline-flex;align-items:center;gap:6px;">
              ${hudIcon('swords', 13)}<span>CHALLENGER DUEL · ${escapeHtml(duel.mode)}</span>
            </span>
            <span class="ws-duel-banner-meta">${escapeHtml(duel.faction)} · ELO ${duel.elo}</span>
          </div>
          <h2 class="ws-duel-banner-title">
            ${escapeHtml(duel.challengerName)} · ${duel.totalScore.toLocaleString('en-US')} PTS
          </h2>
          <div class="ws-duel-banner-meta">
            ${escapeHtml(duel.topicLabel || (duel.mode === 'DAILY' ? 'Daily Global Feed' : 'Meridian Challenge'))} · ${duel.qids.length} Exact Prisms
          </div>
          <div class="ws-duel-banner-actions">
            <button type="button" class="ws-btn-gold" id="ws-btn-accept-duel">ACCEPT DUEL ▶</button>
            <button type="button" class="ws-btn-obsidian" id="ws-btn-dismiss-duel">Dismiss</button>
          </div>
        </section>
      `
      : '';

    const dueSrs = Math.max(0, vm.srsDueCount ?? this.vaultStatus.srsDueCount);

    this.root.innerHTML = `
      ${this.renderTopBarHtml('THE MERIDIAN', 'GENEVA', false, false, true)}

      <div class="ws-title-showcase">
        <header class="ws-title-hero" aria-label="World's Smartest">
          <div class="ws-title-eyebrow">SPIN · PEEL · OVERCLOCK</div>
          <h1 class="ws-title-wordmark">WORLD'S SMARTEST</h1>
        </header>

        <section class="ws-title-dock" aria-label="Meridian Launch Controls">
          ${duelBannerHtml}

          <button type="button" class="ws-btn-gold ws-title-primary-cta" id="ws-title-enter-cta">
            <span class="ws-title-primary-label">${escapeHtml(ctaMain)}</span>
            <span class="ws-title-primary-sub">${escapeHtml(ctaSub)}</span>
          </button>

          <nav class="ws-title-mode-strip" aria-label="Direct Mode Select">
            <button type="button" class="ws-title-mode-btn" data-title-mode="CAMPAIGN">Campaign Map</button>
            <button type="button" class="ws-title-mode-btn" data-title-mode="BRIEFING">Pick a Topic</button>
            <button type="button" class="ws-title-mode-btn" data-title-mode="DAILY">Daily 10</button>
            <button type="button" class="ws-title-mode-btn" data-title-mode="ENDLESS">Endless</button>
            <button type="button" class="ws-title-mode-btn" data-title-mode="TRIALS">1v1 Duels</button>
          </nav>

          <div class="ws-title-meta-row">
            <button type="button" class="ws-instant-prism-pill" id="ws-btn-instant-prism" title="Jump into 1 live 3D Prism right now">
              ${hudIcon('bolt', 13)}<span>Quick 1-Q</span>
            </button>
            <button type="button" class="ws-title-saves-link" id="ws-title-saves-cta" style="white-space:nowrap;display:inline-flex;align-items:center;gap:5px;">
              ${hudIcon('save', 13)}<span>Saves (5)</span>
            </button>
            ${
              dueSrs > 0
                ? `<button type="button" class="ws-title-saves-link" id="ws-title-srs-cta" style="color:var(--gold-bright);white-space:nowrap;display:inline-flex;align-items:center;gap:5px;">
                    ${hudIcon('layers', 13)}<span>Review (${dueSrs})</span>
                  </button>`
                : `<span class="ws-title-verified-count" style="white-space:nowrap;">
                    ${vm.verifiedQuestionTotal.toLocaleString('en-US')} Qs
                  </span>`
            }
          </div>
        </section>
      </div>
    `;

    this.bindTopBarEvents();

    this.root.querySelector('#ws-title-enter-cta')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.closeVaultDrawer();
      this.actions.onTitleEnterMeridian();
    });

    this.root.querySelector('#ws-btn-instant-prism')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.closeVaultDrawer();
      this.actions.onLaunchInstantPrism?.();
    });

    this.root.querySelector('#ws-title-saves-cta')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.closeVaultDrawer();
      this.actions.onOpenSaveSlots();
    });

    this.root.querySelector('#ws-title-srs-cta')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.closeVaultDrawer();
      if (this.actions.onOpenMasteryReviewDeck) {
        this.actions.onOpenMasteryReviewDeck();
      } else {
        this.actions.onOpenObservatory();
      }
    });

    this.root.querySelector('#ws-btn-accept-duel')?.addEventListener('click', () => {
      if (!duel) return;
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.closeVaultDrawer();
      this.actions.onAcceptIncomingDuel?.(duel);
    });

    this.root.querySelector('#ws-btn-dismiss-duel')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onDismissIncomingDuel?.();
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-title-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.titleMode as ActiveHubTab;
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.closeVaultDrawer();
        this.actions.onTitleQuickMode(mode);
      });
    });
  }

  // ==========================================================================
  // 1. REAL NATIVE <input> CHALLENGER NAME & ORIGIN REGISTRATION (GENEVA)
  // ==========================================================================

  public renderRegistration(vm: RegistrationViewState): void {
    this.cancelOverclockHold(true);
    let currentOrigin: OriginId = vm.selectedOrigin || 'POLYMATH';
    const cleanVanceLine = cleanNarrativeCopy(vm.vanceLine);

    const origins: Array<{ id: OriginId; title: string; desc: string; tag: string }> = [
      {
        id: 'ACADEMIC',
        title: 'Disgraced Academic',
        desc: 'Published suppressed findings your university tried to bury. They kept the chair; you kept the proof.',
        tag: 'History · Science · Law · Myth',
      },
      {
        id: 'POLYMATH',
        title: 'Street-Smart Polymath',
        desc: 'Self-taught across twelve disciplines far outside ivory walls—connecting patterns specialists miss.',
        tag: 'Geography · Society · Pop · Sports',
      },
      {
        id: 'STRATEGIST',
        title: 'Pattern-Breaking Strategist',
        desc: 'Reads probabilities, clock pressure, and human micro-tells three moves ahead of the table.',
        tag: 'Tech · Logic · Economics · Arts',
      },
    ];

    const draw = (draftName: string, errorMessage?: string) => {
      this.root.innerHTML = `
        ${this.renderTopBarHtml('GENEVA · THE VETTING CHAMBER', 'DIPLOMATIC CREDENTIALING', true)}
        <div style="flex:1 1 auto;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;overflow-y:auto;">
          <div class="ws-frame-cinema ws-interactive" style="width:100%;max-width:820px;padding:clamp(14px,2vw,22px);display:flex;flex-direction:column;gap:14px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div class="ws-actor-cutout-wrap" style="width:64px;height:64px;">
                <img class="ws-actor-cutout-img" src="${resolvePortraitCutoutUrl('vance', 'intense')}" alt="Julian Vance" />
              </div>
              <div style="min-width:0;flex:1 1 auto;">
                <div style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;">
                  JULIAN VANCE · CHIEF ADJUDICATOR
                </div>
                <p style="margin:4px 0 0;font-size:clamp(13.5px,1.4vw,16px);line-height:1.38;color:var(--ivory-primary);">
                  “${escapeHtml(cleanVanceLine)}”
                </p>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:6px;">
              <label for="challenger-name-input" style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;">
                CHALLENGER DIPLOMATIC NAME (1–22 CHARACTERS)
              </label>
              <input
                id="challenger-name-input"
                class="ws-name-input"
                type="text"
                maxlength="22"
                autocomplete="off"
                spellcheck="false"
                placeholder="Enter your name, Challenger..."
                value="${escapeHtml(draftName)}"
                style="max-width:100%;font-size:16px;"
              />
              ${
                errorMessage
                  ? `<div id="challenger-name-error" role="alert" style="font-family:var(--font-mono);font-size:11.5px;color:#ff8e9b;padding:4px 8px;border-radius:6px;background:rgba(224,82,99,0.14);box-shadow:inset 3px 0 0 var(--crimson-alert);">${escapeHtml(errorMessage)}</div>`
                  : ''
              }
            </div>

            <div>
              <div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--ivory-muted);margin-bottom:7px;letter-spacing:0.05em;">
                SELECT SCOUTING DOSSIER ORIGIN
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;">
                ${origins
                  .map(
                    (o) => `
                  <button
                    type="button"
                    class="ws-mode-tab ${currentOrigin === o.id ? 'is-selected' : ''}"
                    data-origin-id="${o.id}"
                    style="padding:10px 12px;"
                  >
                    <div class="ws-mode-tab-title">${escapeHtml(o.title)}</div>
                    <div style="font-size:11.5px;color:var(--ivory-primary);margin-top:4px;line-height:1.3;">${escapeHtml(o.desc)}</div>
                    <div style="font-family:var(--font-mono);font-size:10px;color:var(--cyan-clue);margin-top:5px;">${escapeHtml(o.tag)}</div>
                  </button>
                `,
                  )
                  .join('')}
              </div>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
              <span style="font-size:11.5px;color:var(--ivory-muted);">
                4-Question Vetting Screening · Teaches Spin, Peel, Overclock & Calibrator
              </span>
              <button type="button" class="ws-btn-gold" id="ws-begin-vetting">
                STAMP IDENTITY & BEGIN SCREENING ▶
              </button>
            </div>
          </div>
        </div>
      `;

      this.bindTopBarEvents();

      const portraitSlot = this.root.querySelector<HTMLElement>('.ws-actor-cutout-wrap');
      if (portraitSlot && this.characterRig) {
        this.characterRig.mountStoryDialogueSlots(
          {
            portraitSlot,
            cardContainer: this.root.querySelector<HTMLElement>('.ws-frame-cinema'),
          },
          { speakerId: 'vance', expression: 'intense', text: cleanVanceLine },
        );
      }

      const inputEl = this.root.querySelector<HTMLInputElement>('#challenger-name-input');
      setTimeout(() => {
        inputEl?.focus();
      }, 30);

      this.root.querySelectorAll<HTMLButtonElement>('[data-origin-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const currentVal = inputEl?.value ?? draftName;
          currentOrigin = (btn.dataset.originId as OriginId) || 'POLYMATH';
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          draw(currentVal);
        });
      });

      const submit = () => {
        const raw = (inputEl?.value ?? '').trim().slice(0, 22);
        const finalName = raw.length > 0 ? raw : 'Arbiter';
        this.haptics.passportStamp();
        this.audio.playSfx('passport_stamp');
        this.actions.onCompleteRegistration(finalName, currentOrigin);
      };

      this.root.querySelector('#ws-begin-vetting')?.addEventListener('click', submit);
      inputEl?.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          submit();
        }
      });
    };

    draw(vm.challengerName === 'Challenger' ? '' : vm.challengerName, vm.errorMessage);
  }

  // ==========================================================================
  // 2. MAIN SOVEREIGN HUB & ZERO-CUTOFF 4×2 / 2×4 8-CITY CAMPAIGN GRID
  // ==========================================================================

  public renderHub(vm: HubViewState): void {
    this.cancelOverclockHold(true);
    const selectedCity =
      vm.cities.find((c) => c.hub === vm.selectedCityHub) ?? vm.cities[0];

    this.root.innerHTML = `
      ${this.renderTopBarHtml(
        'THE MERIDIAN',
        vm.personaLabel
          ? `${vm.challengerName.toUpperCase()} · ${vm.personaLabel.toUpperCase()}`
          : vm.challengerName.toUpperCase(),
        true,
        false,
        false,
      )}

      <div class="ws-hub-scroll">
        <!-- Compact Single-Row Plain-English Mode Tabs (0px Clipping at 360px..1280px) -->
        <nav class="ws-mode-tabs" aria-label="Game Modes" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;overflow:visible;">
          <button type="button" class="ws-mode-tab ${vm.activeTab === 'CAMPAIGN' ? 'is-selected' : ''}" data-hub-tab="CAMPAIGN" style="min-width:0;padding:5px 3px;min-height:38px;align-items:center;justify-content:center;text-align:center;">
            <div class="ws-mode-tab-title" style="font-size:clamp(10px,2.5vw,12px);white-space:normal;line-height:1.12;text-align:center;">Campaign Map</div>
          </button>
          <button type="button" class="ws-mode-tab ${vm.activeTab === 'DAILY' ? 'is-selected' : ''}" data-hub-tab="DAILY" style="min-width:0;padding:5px 3px;min-height:38px;align-items:center;justify-content:center;text-align:center;">
            <div class="ws-mode-tab-title" style="font-size:clamp(10px,2.5vw,12px);white-space:normal;line-height:1.12;text-align:center;">Daily 10</div>
          </button>
          <button type="button" class="ws-mode-tab ${vm.activeTab === 'BRIEFING' ? 'is-selected' : ''}" data-hub-tab="BRIEFING" style="min-width:0;padding:5px 3px;min-height:38px;align-items:center;justify-content:center;text-align:center;">
            <div class="ws-mode-tab-title" style="font-size:clamp(10px,2.5vw,12px);white-space:normal;line-height:1.12;text-align:center;">Pick Topic</div>
          </button>
          <button type="button" class="ws-mode-tab ${vm.activeTab === 'ENDLESS' ? 'is-selected' : ''}" data-hub-tab="ENDLESS" style="min-width:0;padding:5px 3px;min-height:38px;align-items:center;justify-content:center;text-align:center;">
            <div class="ws-mode-tab-title" style="font-size:clamp(10px,2.5vw,12px);white-space:normal;line-height:1.12;text-align:center;">Endless</div>
          </button>
          <button type="button" class="ws-mode-tab ${vm.activeTab === 'TRIALS' ? 'is-selected' : ''}" data-hub-tab="TRIALS" style="min-width:0;padding:5px 3px;min-height:38px;align-items:center;justify-content:center;text-align:center;">
            <div class="ws-mode-tab-title" style="font-size:clamp(10px,2.5vw,12px);white-space:normal;line-height:1.12;text-align:center;">1v1 Duels</div>
          </button>
        </nav>

        ${this.renderActiveHubBodyHtml(vm, selectedCity)}
      </div>
    `;

    this.bindTopBarEvents();

    this.root.querySelectorAll<HTMLButtonElement>('[data-hub-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.hubTab as ActiveHubTab;
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.actions.onSelectHubTab(tab);
      });
    });

    this.root.querySelector('#ws-hub-continue-now')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      if (this.actions.onHubContinueNow) {
        this.actions.onHubContinueNow();
      } else {
        this.actions.onTitleEnterMeridian();
      }
    });

    this.root.querySelector('#ws-hub-lock-play-current')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      if (this.actions.onHubContinueNow) {
        this.actions.onHubContinueNow();
      } else {
        this.actions.onTitleEnterMeridian();
      }
    });

    this.root.querySelector('#ws-hub-lock-dismiss')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onDismissLockedCityNotice?.();
    });

    this.root.querySelector('#ws-hub-play-next-in-city')?.addEventListener('click', (ev) => {
      const btn = ev.currentTarget as HTMLButtonElement;
      const mid = btn.dataset.nextMissionId;
      const fork = btn.dataset.nextFlightFork as 'gb' | 'jp' | undefined;
      const resumePrologue = btn.dataset.nextPrologue === '1';
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      if (resumePrologue) {
        this.actions.onStartPrologue();
      } else if (fork === 'gb' || fork === 'jp') {
        this.actions.onChooseFlightFork(fork);
      } else if (mid) {
        this.actions.onLaunchMission(mid);
      } else if (this.actions.onHubContinueNow) {
        this.actions.onHubContinueNow();
      }
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-city-hub]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hub = btn.dataset.cityHub as CampaignHubCode;
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.actions.onSelectCity(hub);
      });
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-start-prologue]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.haptics.sightlineSnap();
        this.audio.playSfx('sightline_snap');
        this.actions.onStartPrologue();
      });
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-flight-fork]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dest = btn.dataset.flightFork as 'gb' | 'jp';
        this.haptics.sightlineSnap();
        this.audio.playSfx('sightline_snap');
        this.actions.onChooseFlightFork(dest);
      });
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-mission-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mid = btn.dataset.missionId;
        if (!mid) return;
        this.haptics.sightlineSnap();
        this.audio.playSfx('sightline_snap');
        this.actions.onLaunchMission(mid);
      });
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-open-saves]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.actions.onOpenSaveSlots();
      });
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-backstage-hub]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hub = btn.dataset.backstageHub as CampaignHubCode;
        if (!hub) return;
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.actions.onLaunchBackstageHub(hub);
      });
    });

    this.root.querySelector('#ws-launch-daily')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.actions.onLaunchDaily();
    });

    this.root.querySelector('#ws-open-briefing-modal')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      const searchBox = this.root.querySelector<HTMLInputElement>('#ws-hub-briefing-search');
      const q = searchBox?.value.trim() || undefined;
      this.actions.onOpenBriefingPicker(q ? { initialSearchQuery: q } : undefined);
    });

    const hubSearchInput = this.root.querySelector<HTMLInputElement>('#ws-hub-briefing-search');
    hubSearchInput?.addEventListener('keydown', (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Enter') {
        ev.preventDefault();
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        const q = hubSearchInput.value.trim();
        this.actions.onOpenBriefingPicker(q ? { initialSearchQuery: q } : undefined);
      }
    });

    this.root.querySelector('#ws-hub-briefing-search-go')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      const q = hubSearchInput?.value.trim();
      this.actions.onOpenBriefingPicker(q ? { initialSearchQuery: q } : undefined);
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-drill-l0]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dId = Number(btn.dataset.drillL0);
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.actions.onOpenBriefingPicker({ initialL0DomainId: dId });
      });
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-showcase-kind]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const kind = btn.dataset.showcaseKind as 'GLOBE_PIN_DROP' | 'VISUAL_BLUEPRINT';
        if (!kind) return;
        this.haptics.sightlineSnap();
        this.audio.playSfx('sightline_snap');
        this.actions.onLaunchVisualOrGlobeShowcase?.(kind);
      });
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-quick-topic]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dom = Number(btn.dataset.quickDom || '5');
        const l1 = btn.dataset.quickL1 || 'sports';
        const l2 = btn.dataset.quickTopic || 'sports_baseball';
        const label = btn.dataset.quickLabel || 'Sports › Baseball';
        this.haptics.sightlineSnap();
        this.audio.playSfx('sightline_snap');
        if (this.actions.onLaunchTopicQuickBriefing) {
          this.actions.onLaunchTopicQuickBriefing({
            domainId: dom,
            l1SubcategoryId: l1,
            l2TopicId: l2,
            label,
            count: 10,
          });
        } else {
          this.actions.onOpenBriefingPicker({
            initialL0DomainId: dom,
            initialL1SubcategoryId: l1,
            initialL2TopicId: l2,
          });
        }
      });
    });

    this.root.querySelector('#ws-quick-briefing')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.actions.onLaunchQuickBriefing();
    });

    this.root.querySelector('#ws-launch-endless')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.actions.onLaunchEndless(false);
    });

    this.root.querySelector('#ws-resume-endless')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.actions.onLaunchEndless(true);
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-pledge-faction]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.pledgeFaction as 'SOVEREIGN' | 'HORIZON' | 'AGORA';
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.actions.onPledgeFaction(f);
      });
    });

    this.root.querySelector('#ws-open-factions-modal')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onOpenFactions();
    });

    this.root.querySelector('#ws-launch-ghost-duel')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.actions.onLaunchGhostTrial(false);
    });

    this.root.querySelector('#ws-launch-black-salon')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.actions.onLaunchGhostTrial(true);
    });
  }

  private renderActiveHubBodyHtml(vm: HubViewState, selectedCity: CityCardState): string {
    if (vm.activeTab === 'CAMPAIGN') {
      const resume = vm.resumeState;
      const resumeEyebrow = resume?.hasProgress
        ? 'CONTINUE WHERE YOU LEFT OFF'
        : 'NEW STORY CAMPAIGN · ACT 0';
      const resumeTitle = resume
        ? resume.bannerTitle
        : vm.prologueCompleted
          ? 'Geneva Sanctuary · Round 1'
          : 'Geneva Vetting Interview';
      const resumeSub = resume
        ? resume.bannerSub
        : 'Answer 4 screening questions to claim your Meridian passport and unlock the World Circuit.';
      const resumeBtnText = resume?.hasProgress ? '▶ CONTINUE NOW' : '▶ START STORY CAMPAIGN';
      const activeResumeHub = vm.activeResumeHub ?? resume?.activeHub ?? 'ch';

      return `
        <!-- Pinned Continue-Where-You-Left-Off Hero Banner (Always Visible at Top of Campaign Map!) -->
        <section class="ws-hub-continue-hero" id="ws-hub-continue-banner" aria-label="Continue Campaign">
          <div class="ws-hub-continue-copy">
            <div class="ws-hub-continue-eyebrow">${escapeHtml(resumeEyebrow)}</div>
            <div class="ws-hub-continue-title" style="white-space:normal;overflow:visible;text-overflow:clip;">${escapeHtml(cleanNarrativeCopy(resumeTitle))}</div>
            <div class="ws-hub-continue-sub" style="white-space:normal;overflow:visible;text-overflow:clip;">${escapeHtml(cleanNarrativeCopy(resumeSub))}</div>
          </div>
          <button type="button" class="ws-btn-gold ws-hub-continue-cta" id="ws-hub-continue-now">
            ${escapeHtml(resumeBtnText)}
          </button>
        </section>

        ${
          vm.lockedCityNotice
            ? `
          <div class="ws-hub-lock-notice" id="ws-hub-lock-notice" role="status" aria-live="polite">
            <div class="ws-hub-lock-copy" style="display:flex;align-items:center;gap:8px;">
              <span aria-hidden="true" style="color:var(--gold-bright);flex:0 0 auto;">${hudIcon('lock', 15)}</span>
              <span><strong>${escapeHtml(vm.lockedCityNotice.city)} Locked:</strong> ${escapeHtml(vm.lockedCityNotice.requirementText)}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex:0 0 auto;">
              <button type="button" class="ws-btn-gold ws-hub-lock-notice-cta" id="ws-hub-lock-play-current">
                ▶ PLAY CURRENT STAGE
              </button>
              <button type="button" class="ws-hub-lock-dismiss" id="ws-hub-lock-dismiss" aria-label="Dismiss notice">✕</button>
            </div>
          </div>
        `
            : ''
        }

        ${
          vm.flightForkPending
            ? `
          <div class="ws-frame-tableau" style="padding:12px 16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
            <div>
              <div style="font-family:var(--font-mono);font-size:10.5px;color:var(--gold-bright);">ACT I WORLD CIRCUIT FORK UNLOCKED</div>
              <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--ivory-primary);">
                Choose Your Opening World Circuit City: London or Tokyo
              </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              <button type="button" class="ws-btn-gold" data-flight-fork="gb">${hudIcon('flight', 14)} LONDON FIRST</button>
              <button type="button" class="ws-btn-gold" data-flight-fork="jp">${hudIcon('flight', 14)} TOKYO FIRST</button>
            </div>
          </div>
        `
            : ''
        }

        <!-- 96-Mission Campaign Progress & Remaining Playtime Telemetry (#175) -->
        <div class="ws-frame-tableau" style="padding:9px 14px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-family:var(--font-mono);font-size:11.5px;">
            <span style="color:var(--gold-bright);font-weight:800;">
              ◆ ${escapeHtml(vm.campaignCompletionLabel ?? `${vm.campaignCompletedMissions ?? 0} / ${vm.campaignTotalMissions ?? 96} Missions (${vm.campaignCompletionPct ?? 0}%)`)}
            </span>
            <span style="color:var(--cyan-clue);">
              ${escapeHtml(vm.campaignRemainingHoursLabel ?? '~20.8 hrs remaining')}
            </span>
          </div>
          <div style="flex:1 1 160px;max-width:300px;height:6px;border-radius:999px;background:rgba(255,255,255,0.1);overflow:hidden;">
            <div style="height:100%;width:${Math.max(2, Math.min(100, vm.campaignCompletionPct ?? 0))}%;background:linear-gradient(90deg,var(--gold-24k) 0%,var(--gold-bright) 100%);"></div>
          </div>
        </div>

        <!-- ALL 8 CAMPAIGN CITIES IN ZERO-CUTOFF 4×2 (Desktop/Square) / 2×4 (Mobile) GRID -->
        <section aria-label="8 World Tour Cities">
          <div class="ws-cities-grid">
            ${vm.cities
              .map((c) => {
                const isSel = c.hub === selectedCity?.hub;
                const isActiveResume = Boolean(c.isActiveResumeHub || c.hub === activeResumeHub);
                const coreStarsDone = c.coreClearedMissions ?? Math.min(5, c.clearedMissions);
                const starsHtml = [0, 1, 2, 3, 4]
                  .map(
                    (idx) =>
                      `<img class="ws-city-star" src="./assets/ui/${idx < coreStarsDone ? 'star_filled' : 'star_empty'}.png" alt="" />`,
                  )
                  .join('');
                return `
                  <button
                    type="button"
                    class="ws-city-card ${isSel ? 'is-selected' : ''} ${isActiveResume ? 'is-active-resume' : ''} ${c.unlocked ? '' : 'is-locked'}"
                    data-city-hub="${c.hub}"
                    aria-pressed="${isSel ? 'true' : 'false'}"
                  >
                    <div class="ws-city-thumb" style="background-image:url('./assets/venues/${c.hub}.jpg');">
                      <span class="ws-city-diff-tag">${escapeHtml(c.difficultyLabel)} · ${c.timerSec}s</span>
                    </div>
                    <div class="ws-city-body">
                      <div class="ws-city-name">${c.order}. ${escapeHtml(c.city.toUpperCase())}</div>
                      <div class="ws-city-venue">
                        ${escapeHtml(c.venueName)}
                        ${c.diplomaticCrossClearance ? ' <span style="color:var(--cyan-clue);font-size:10px;">· CROSS-CLEARED</span>' : ''}
                      </div>
                      ${
                        isActiveResume
                          ? `<div class="ws-city-active-pill">● RESUME HERE ▶</div>`
                          : ''
                      }
                      <div class="ws-city-stars">
                        ${starsHtml}
                        <span style="margin-left:auto;font-family:var(--font-mono);font-size:10px;color:${c.unlocked ? 'var(--gold-bright)' : '#b4bdd0'};">
                          ${c.unlocked ? `${c.clearedMissions}/${c.totalMissions}` : 'LOCKED'}
                        </span>
                      </div>
                    </div>
                  </button>
                `;
              })
              .join('')}
          </div>
        </section>

        <!-- Selected City Mission Strip (Core Story Spine vs City Dossier Investigations) + Backstage Hub Interrogation -->
        ${
          selectedCity
            ? (() => {
                const coreMissions = selectedCity.missions.filter((m) => !m.isSideInvestigation);
                const sideMissions = selectedCity.missions.filter((m) => m.isSideInvestigation);
                const nextInCityMid =
                  selectedCity.nextPlayableMissionId ??
                  selectedCity.missions.find((m) => m.unlocked && !m.completed)?.id ??
                  selectedCity.missions.find((m) => m.unlocked)?.id ??
                  null;
                const cityIsMidPrologue = selectedCity.hub === 'ch' && !vm.prologueCompleted;
                const cityIsFlightFork =
                  vm.flightForkPending &&
                  (selectedCity.hub === 'gb' || selectedCity.hub === 'jp');
                const canQuickPlayCity =
                  selectedCity.unlocked &&
                  (cityIsMidPrologue || cityIsFlightFork || Boolean(nextInCityMid));

                const renderMissionCard = (
                  m: CityCardState['missions'][number],
                  prefixLabel: string,
                ) => {
                  const isFailed = !m.completed && (m.failedAttempts ?? 0) > 0;
                  const accentCol = m.completed
                    ? 'rgba(57,212,154,0.85)'
                    : isFailed
                      ? 'rgba(224,82,99,0.92)'
                      : m.isBoss
                        ? 'rgba(242,207,126,0.9)'
                        : m.isSideInvestigation
                          ? 'rgba(86,212,245,0.75)'
                          : 'rgba(216,175,87,0.45)';
                  const statusColor = m.completed
                    ? 'var(--emerald-win)'
                    : isFailed
                      ? '#ff8e9b'
                      : m.isSideInvestigation
                        ? 'var(--cyan-clue)'
                        : 'var(--gold-bright)';
                  const statusBadge = m.completed
                    ? '✓ CLEARED'
                    : isFailed
                      ? '⚠ FAILED — RETRYABLE'
                      : m.unlocked
                        ? 'READY ▶'
                        : hudIcon('lock', 12);
                  return `
                    <button
                      type="button"
                      class="ws-btn-obsidian ws-hub-mission-tile"
                      data-mission-id="${escapeHtml(m.id)}"
                      ${m.unlocked ? '' : 'disabled'}
                      style="flex-direction:column;align-items:flex-start;text-align:left;padding:9px 11px;border:none;box-shadow:inset 3px 0 0 ${accentCol};"
                    >
                      <div style="width:100%;display:flex;justify-content:space-between;gap:4px;font-family:var(--font-mono);font-size:10px;color:${statusColor};">
                        <span>${prefixLabel}${m.isBoss ? ' · BOSS RELIC' : ''}</span>
                        <span>${statusBadge}</span>
                      </div>
                      <div style="font-size:12px;font-weight:700;line-height:1.25;color:var(--ivory-primary);margin-top:3px;width:100%;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                        ${escapeHtml(cleanNarrativeCopy(m.title))}
                      </div>
                      <div style="font-size:10.5px;line-height:1.25;color:var(--ivory-muted);margin-top:2px;width:100%;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                        ${escapeHtml(cleanNarrativeCopy(m.subtitle))}
                      </div>
                    </button>
                  `;
                };

                return `
                  <div class="ws-frame-tableau" id="ws-hub-missions-panel" style="padding:12px 16px;display:flex;flex-direction:column;gap:10px;">
                    <div class="ws-missions-panel-head">
                      <div>
                        <span style="font-family:var(--font-display);font-size:15px;font-weight:800;color:var(--gold-bright);">
                          STAGE ${selectedCity.order}: ${escapeHtml(selectedCity.city.toUpperCase())} — ${escapeHtml(selectedCity.venueName.toUpperCase())}
                        </span>
                        <span style="font-family:var(--font-mono);font-size:11px;color:var(--ivory-muted);margin-left:8px;">
                          ${escapeHtml(selectedCity.difficultyLabel)} · ${selectedCity.timerSec}s Chrono-Ring
                        </span>
                        ${
                          selectedCity.activeBranchBadge
                            ? `<span style="font-family:var(--font-mono);font-size:10.5px;color:var(--cyan-clue);margin-left:8px;">[${escapeHtml(selectedCity.activeBranchBadge)}]</span>`
                            : ''
                        }
                      </div>
                      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                        ${
                          canQuickPlayCity
                            ? `<button
                                type="button"
                                class="ws-btn-gold ws-missions-play-next-btn"
                                id="ws-hub-play-next-in-city"
                                ${cityIsMidPrologue ? 'data-next-prologue="1"' : ''}
                                ${cityIsFlightFork ? `data-next-flight-fork="${selectedCity.hub}"` : ''}
                                ${nextInCityMid ? `data-next-mission-id="${escapeHtml(nextInCityMid)}"` : ''}
                              >▶ PLAY NEXT IN ${escapeHtml(selectedCity.city.toUpperCase())}</button>`
                            : ''
                        }
                        <button type="button" class="ws-btn-obsidian" data-open-saves="1">${hudIcon('save', 14)} SAVES</button>
                        ${
                          selectedCity.unlocked
                            ? `<button type="button" class="ws-btn-obsidian" data-backstage-hub="${selectedCity.hub}">${hudIcon('mic', 14)} BACKSTAGE</button>`
                            : ''
                        }
                        ${
                          selectedCity.hub === 'ch' && vm.prologueCompleted
                            ? `<button type="button" class="ws-btn-obsidian" data-start-prologue="1">REPLAY VETTING</button>`
                            : ''
                        }
                      </div>
                    </div>

                    <div style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;">
                      CORE STORY SPINE (${coreMissions.filter((m) => m.completed).length}/${coreMissions.length} CLEARED)
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(174px,1fr));gap:8px;">
                      ${coreMissions.map((m, idx) => renderMissionCard(m, `M${idx + 1}`)).join('')}
                    </div>

                    ${
                      sideMissions.length > 0
                        ? `
                      <div style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:var(--cyan-clue);letter-spacing:0.06em;margin-top:4px;display:inline-flex;align-items:center;gap:6px;">
                        ${hudIcon('dossier', 13)} CITY DOSSIER INVESTIGATIONS (${sideMissions.filter((m) => m.completed).length}/${sideMissions.length} OPTIONAL SIDE-OPS)
                      </div>
                      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(174px,1fr));gap:8px;">
                        ${sideMissions.map((m, idx) => renderMissionCard(m, `DOSSIER #${idx + 1}`)).join('')}
                      </div>
                    `
                        : ''
                    }
                  </div>
                `;
              })()
            : ''
        }
      `;
    }

    if (vm.activeTab === 'DAILY') {
      return `
        <div class="ws-frame-tableau" style="padding:18px 22px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
          <div style="flex:1 1 420px;">
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--cyan-clue);">00:00 UTC SYNCHRONIZED WORLD BROADCAST</div>
            <div style="font-family:var(--font-display);font-size:20px;font-weight:800;color:var(--gold-bright);margin-top:4px;">
              DAILY 10 · GLOBAL UTC BROADCAST
            </div>
            <p style="margin:6px 0 0;font-size:13px;line-height:1.45;color:var(--ivory-muted);">
              Hosted by Julian Vance. Identical UTC-date deterministic seed worldwide spanning Sightline Lock, Codex Dual-Ring, Gauntlet Shatter, and a final Calibrator Bullseye Tiebreaker so every player on Earth compares scores fairly!
            </p>
            <div style="margin-top:10px;font-family:var(--font-mono);font-size:11.5px;color:var(--gold-bright);">
              PERSONAL BEST: ${vm.dailyBestScore.toLocaleString()} PTS · STATUS: ${vm.dailyCompletedToday ? '✓ COMPLETED TODAY (PRACTICE REPLAY OPEN)' : 'LIVE NOW'}
            </div>
          </div>
          <button type="button" class="ws-btn-gold" id="ws-launch-daily">LAUNCH DAILY 10 ▶</button>
        </div>
      `;
    }

    if (vm.activeTab === 'BRIEFING') {
      return `
        <div class="ws-frame-tableau" style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
            <div style="flex:1 1 380px;">
              <div style="font-family:var(--font-mono);font-size:11px;color:var(--gold-bright);">
                HOSTED BY NADIA AL-MANSOOR · ${vm.verifiedQuestionTotal.toLocaleString()} VERIFIED QUESTIONS · CRYPTO-RANDOM ZERO-REPEAT
              </div>
              <div style="font-family:var(--font-display);font-size:20px;font-weight:800;color:var(--ivory-primary);margin-top:3px;">
                PICK A TOPIC · 3-LEVEL SUBCATEGORY DRILL-DOWN
              </div>
              <p style="margin:5px 0 0;font-size:12.5px;line-height:1.42;color:var(--ivory-muted);">
                Drill down from any of the 12 Sovereign Domains into 48+ Categories and 150+ Specialist Topics (e.g. <strong>Sports &amp; Games › Sports › Baseball</strong>) across Middle School to Mensa difficulty tiers.
              </p>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
              <button type="button" class="ws-btn-obsidian" id="ws-quick-briefing">QUICK 5-Q MIX</button>
              <button type="button" class="ws-btn-gold" id="ws-open-briefing-modal">OPEN TOPIC PICKER ▶</button>
            </div>
          </div>

          <!-- Instant Subcategory Search + Direct Specialist Topic Launchers (#181) -->
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
            <input
              type="search"
              id="ws-hub-briefing-search"
              class="ws-name-input"
              autocomplete="off"
              spellcheck="false"
              placeholder='Filter 150+ subcategories, e.g. "Baseball", "World War II", "Exoplanets"...'
              style="flex:1 1 260px;max-width:460px;min-height:44px;padding:8px 12px;font-size:13.5px;"
            />
            <button type="button" class="ws-btn-obsidian" id="ws-hub-briefing-search-go">SEARCH TOPICS ▶</button>
          </div>

          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;">
            <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--cyan-clue);">POPULAR SPECIALIST TOPICS:</span>
            <button type="button" class="ws-util-pill" id="ws-quick-globe-showcase" data-showcase-kind="GLOBE_PIN_DROP" style="color:var(--gold-bright);display:inline-flex;align-items:center;gap:5px;">
              ${hudIcon('pin', 12)}<span>3D GLOBE PIN-DROP</span>
            </button>
            <button type="button" class="ws-util-pill" id="ws-quick-visual-showcase" data-showcase-kind="VISUAL_BLUEPRINT" style="color:var(--cyan-clue);display:inline-flex;align-items:center;gap:5px;">
              ${hudIcon('layers', 12)}<span>VISUAL BLUEPRINTS</span>
            </button>
            <button type="button" class="ws-util-pill" data-quick-dom="5" data-quick-l1="sports" data-quick-topic="sports_baseball" data-quick-label="Sports › Baseball">◈ BASEBALL</button>
            <button type="button" class="ws-util-pill" data-quick-dom="5" data-quick-l1="sports" data-quick-topic="sports_basketball" data-quick-label="Sports › Basketball">◈ BASKETBALL</button>
            <button type="button" class="ws-util-pill" data-quick-dom="5" data-quick-l1="sports" data-quick-topic="sports_soccer" data-quick-label="Sports › Soccer">◈ SOCCER</button>
            <button type="button" class="ws-util-pill" data-quick-dom="0" data-quick-l1="hist_military" data-quick-topic="hist_ww2" data-quick-label="History › World War II">◈ WORLD WAR II</button>
            <button type="button" class="ws-util-pill" data-quick-dom="1" data-quick-l1="sci_astronomy_space" data-quick-topic="sci_space_missions" data-quick-label="Science › Spaceflight">◈ SPACEFLIGHT</button>
            <button type="button" class="ws-util-pill" data-quick-dom="4" data-quick-l1="pop_cinema" data-quick-topic="pop_hollywood_modern_film" data-quick-label="Cinema › Hollywood &amp; Film">◈ HOLLYWOOD &amp; FILM</button>
            <button type="button" class="ws-util-pill" data-quick-dom="5" data-quick-l1="games_esports" data-quick-topic="games_chess_tabletop" data-quick-label="Games › Chess &amp; Tabletop">◈ CHESS</button>
          </div>

          <!-- 12 Sovereign Domain Medallions (1-Click Drill into L1 Subcategories) -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:8px;">
            ${FORGE_DOMAINS.map(
              (dom) => `
                <button type="button" class="ws-btn-obsidian" data-drill-l0="${dom.id}" style="justify-content:flex-start;gap:8px;padding:7px 10px;">
                  <img src="./assets/ui/cat_${dom.id}.png" alt="" style="width:26px;height:26px;object-fit:contain;flex:0 0 auto;" />
                  <span style="font-size:11.5px;font-weight:700;text-align:left;line-height:1.2;">${escapeHtml(dom.shortName)} ›</span>
                </button>
              `,
            ).join('')}
          </div>
        </div>
      `;
    }

    if (vm.activeTab === 'ENDLESS') {
      return `
        <div class="ws-frame-tableau" style="padding:18px 22px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
          <div style="flex:1 1 420px;">
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--crimson-alert);">3 PRISM SHIELDS · 5-Q EXTRACTION AIRLOCKS</div>
            <div style="font-family:var(--font-display);font-size:20px;font-weight:800;color:var(--gold-bright);margin-top:4px;">
              ENDLESS DESCENT · SUBTERRANEAN LEDGER VAULTS
            </div>
            <p style="margin:6px 0 0;font-size:13px;line-height:1.45;color:var(--ivory-muted);">
              Descend from Public Strata into Diplomatic Vaults and the Meridian Zero Core as difficulty climbs monotonically. Bank your score at every 5-Prism Extraction Airlock—or risk deeper floors! Overclock 3-streaks repair 1 Shield; Backfires shatter 2.
            </p>
            <div style="margin-top:10px;font-family:var(--font-mono);font-size:11.5px;color:var(--gold-bright);">
              DEEPEST FLOOR: FLOOR ${vm.endlessBestFloor} · HIGH HAUL: ${vm.endlessBestScore.toLocaleString()} PTS
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            ${
              typeof vm.endlessCanResumeDepth === 'number' && vm.endlessCanResumeDepth > 1
                ? `<button type="button" class="ws-btn-obsidian" id="ws-resume-endless">RESUME DEPTH ${vm.endlessCanResumeDepth} ▶</button>`
                : ''
            }
            <button type="button" class="ws-btn-gold" id="ws-launch-endless">ENTER EXTRACTION AIRLOCK ▶</button>
          </div>
        </div>
      `;
    }

    // 1v1 DUELS, COUNCIL TRIALS & BLACK SALON
    const rivals = vm.duelRivalsSummary;
    return `
      <div class="ws-frame-tableau" style="padding:18px 22px;display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
          <div>
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--cyan-clue);">1-TAP FRIEND DUEL LINKS · 3D ASYNC KINETIC GHOSTS</div>
            <div style="font-family:var(--font-display);font-size:20px;font-weight:800;color:var(--gold-bright);margin-top:3px;">
              1v1 DUELS, COUNCIL TRIALS &amp; BLACK SALON
            </div>
          </div>
          <div style="font-family:var(--font-mono);font-size:11.5px;color:var(--gold-bright);">
            TRIAL VICTORIES: ${vm.trialsWins}${
              rivals && rivals.totalDuels > 0
                ? ` · H2H DUELS: ${rivals.wins}W-${rivals.losses}L${rivals.ties > 0 ? `-${rivals.ties}T` : ''}`
                : ''
            }
          </div>
        </div>

        ${
          rivals && rivals.recentRivals.length > 0
            ? `
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 12px;border-radius:10px;background:rgba(242,207,126,0.08);box-shadow:inset 3px 0 0 var(--gold-bright);">
            <span style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:var(--gold-bright);display:inline-flex;align-items:center;gap:5px;">
              ${hudIcon('swords', 13)}<span>RECENT DUEL RIVALS:</span>
            </span>
            ${rivals.recentRivals
              .slice(0, 4)
              .map(
                (r) => `<span style="font-family:var(--font-mono);font-size:11px;color:var(--ivory-primary);padding:2px 8px;border-radius:999px;background:rgba(255,255,255,0.06);">${escapeHtml(r.name)} (${escapeHtml(r.recordLabel)} · Best ${r.bestScore.toLocaleString('en-US')})</span>`,
              )
              .join('')}
          </div>
        `
            : `
          <div style="font-size:12.5px;color:var(--ivory-muted);line-height:1.4;">
            Finish any match in Campaign, Daily 10, Pick Topic, or Council Trials and tap <strong>Share 1-Tap Duel Link</strong> on the summary screen to challenge friends head-to-head on your exact question splits!
          </div>
        `
        }

        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--ivory-muted);">PLEDGED COUNCIL BLOC:</span>
          ${(['SOVEREIGN', 'HORIZON', 'AGORA'] as const)
            .map(
              (f) => `
            <button type="button" class="ws-util-pill ${vm.pledgedFaction === f ? 'is-active' : ''}" data-pledge-faction="${f}">
              ${f} BLOC
            </button>
          `,
            )
            .join('')}
          <button type="button" class="ws-btn-obsidian" id="ws-open-factions-modal" style="margin-left:auto;">
            ${hudIcon('scales', 14)} COUNCIL STANDINGS &amp; CONTENDERS
          </button>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <button type="button" class="ws-btn-gold" id="ws-launch-ghost-duel">
            RACE 3D KINETIC GHOST DUEL ▶
          </button>
          <button type="button" class="ws-btn-obsidian" id="ws-launch-black-salon">
            ${hudIcon('bolt', 14)} ENTER TEO'S BLACK SALON (ALL-IN BLITZ)
          </button>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 3. INTERACTIVE STORY BEAT & ETHICAL CHOICE OVERLAY (GENEVA LEAK / FORKS)
  // ==========================================================================

  public renderStoryDialogue(vm: StoryDialogueViewState): void {
    this.cancelOverclockHold(true);

    const spokenText = cleanNarrativeCopy(vm.text);
    const tellCopy = cleanNarrativeCopy(vm.tellText);
    const insightCopy = cleanNarrativeCopy(vm.passiveInsightText);

    this.root.innerHTML = `
      ${this.renderTopBarHtml(vm.chyronTitle, vm.locationLabel, true)}

      <div style="flex:1 1 auto;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;overflow-y:auto;min-height:0;">
        <div class="ws-frame-cinema ws-interactive" style="width:100%;max-width:880px;margin:0 auto;padding:clamp(10px,1.8vw,20px);display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;align-items:flex-start;gap:14px;">
          <div class="ws-actor-cutout-wrap" style="width:68px;height:68px;border-radius:12px;">
            <img class="ws-actor-cutout-img" src="${resolvePortraitCutoutUrl(vm.speakerId, vm.expression)}" alt="${escapeHtml(vm.speakerName)}" />
          </div>
          <div style="flex:1 1 auto;min-width:0;">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
              <span style="font-family:var(--font-display);font-weight:800;font-size:14px;color:var(--gold-bright);letter-spacing:0.06em;">
                ${escapeHtml(vm.speakerName.toUpperCase())}
              </span>
              <span style="font-family:var(--font-mono);font-size:11px;color:var(--ivory-muted);">
                · ${escapeHtml(vm.speakerRole)}
              </span>
            </div>
            <div id="ws-story-tell-slot">
              ${
                tellCopy
                  ? `<div style="margin-top:4px;font-size:11.5px;font-style:italic;color:var(--cyan-clue);">Tell: ${escapeHtml(tellCopy)}</div>`
                  : ''
              }
            </div>
            <p style="margin:6px 0 0;font-size:clamp(14px,1.5vw,17.5px);line-height:1.42;color:var(--ivory-primary);font-weight:500;">
              “${escapeHtml(spokenText)}”
            </p>
            ${
              insightCopy
                ? `<div style="margin-top:7px;padding:5px 10px;border-radius:8px;background:rgba(86,212,245,0.12);box-shadow:inset 3px 0 0 var(--cyan-clue);font-size:11.5px;color:#d9f6ff;">✦ ${escapeHtml(insightCopy)}</div>`
                : ''
            }
          </div>
        </div>

        ${
          vm.choices && vm.choices.length > 0
            ? `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px;">
            ${vm.choices
              .map(
                (ch) => `
                <button
                  type="button"
                  class="ws-mode-tab"
                  data-story-choice="${escapeHtml(ch.id)}"
                  style="padding:10px 12px;border:none;box-shadow:inset 3px 0 0 rgba(242,207,126,0.65);"
                >
                <div style="font-family:var(--font-display);font-size:12.5px;font-weight:700;color:var(--gold-bright);">
                  ${escapeHtml(cleanNarrativeCopy(ch.label))}
                </div>
                ${ch.subtext ? `<div style="font-size:11.5px;color:var(--ivory-primary);margin-top:3px;line-height:1.3;">${escapeHtml(cleanNarrativeCopy(ch.subtext))}</div>` : ''}
                ${ch.consequenceTag ? `<div style="font-family:var(--font-mono);font-size:10px;color:var(--cyan-clue);margin-top:5px;">${escapeHtml(cleanNarrativeCopy(ch.consequenceTag))}</div>` : ''}
              </button>
            `,
              )
              .join('')}
          </div>
        `
            : `
          <div style="display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px;">
            ${
              vm.secondaryActionLabel
                ? `<button type="button" class="ws-btn-obsidian" id="ws-story-secondary">${escapeHtml(vm.secondaryActionLabel)}</button>`
                : ''
            }
            <button type="button" class="ws-btn-gold" id="ws-story-continue">
              ${escapeHtml(vm.continueLabel || 'CONTINUE ▶')}
            </button>
          </div>
        `
        }
        </div>
      </div>
    `;

    this.bindTopBarEvents();

    const portraitSlot = this.root.querySelector<HTMLElement>('.ws-actor-cutout-wrap');
    if (portraitSlot && this.characterRig) {
      this.characterRig.mountStoryDialogueSlots(
        {
          portraitSlot,
          tellBadgeSlot: this.root.querySelector<HTMLElement>('#ws-story-tell-slot'),
          cardContainer: this.root.querySelector<HTMLElement>('.ws-frame-cinema'),
        },
        {
          speakerId: vm.speakerId,
          expression: vm.expression,
          tellText: tellCopy,
          text: spokenText,
        },
      );
    }

    this.root.querySelectorAll<HTMLButtonElement>('[data-story-choice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cid = btn.dataset.storyChoice;
        if (!cid) return;
        this.haptics.sightlineSnap();
        this.audio.playSfx('sightline_snap');
        this.actions.onSelectDialogueChoice(cid);
      });
    });

    this.root.querySelector('#ws-story-secondary')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onSecondaryDialogueAction?.();
    });

    this.root.querySelector('#ws-story-continue')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onAdvanceDialogue();
    });
  }

  // ==========================================================================
  // 4. THREE-ZONE LIVE GAMEPLAY HUD ("SPIN. PEEL. OVERCLOCK.")
  // ==========================================================================

  private resolveActiveTierMultiplier(vm: GameplayQuestionViewState): number {
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

  public renderGameplay(vm: GameplayQuestionViewState): void {
    this.cancelOverclockHold(true);
    this.closeVisualLightbox();

    const q = vm.question;
    const activeStep =
      q.archetype === 'HERO_ARTIFACT_SYNTHESIS' && q.heroSynthesis
        ? q.heroSynthesis.steps[vm.heroStepIndex ?? 0]
        : null;

    const promptText = sanitizeHudDisplayText(activeStep ? activeStep.prompt : q.prompt, q);
    const facets = activeStep ? activeStep.facets : q.facets;
    const clueTiers = activeStep ? activeStep.clueTiers : q.clueTiers;
    const diffBadge = resolveQuestionDifficultyBadge(q);

    const tierMult = this.resolveActiveTierMultiplier(vm);
    const tierShort = `${tierMult.toFixed(1)}x`;
    const tierDetail =
      q.archetype === 'CALIBRATOR_DIAL'
        ? vm.peelTier === 1
          ? ` ${vm.calibratorCone}`
          : vm.peelTier === 2
            ? ` ${vm.calibratorCone} · CLUE`
            : ` ${vm.calibratorCone} · BLUEPRINT`
        : q.archetype === 'GLOBE_PIN_DROP'
          ? vm.peelTier === 1
            ? ' PINPOINT'
            : vm.peelTier === 2
              ? ' REGION'
              : ' BLUEPRINT'
          : vm.peelTier === 1
            ? ' INSTINCT'
            : vm.peelTier === 2
              ? ' CLUE'
              : ' BLUEPRINT';

    const leakedMirrorHint =
      vm.isPrologueQuestion &&
      !vm.revealed &&
      vm.peelTier === 1 &&
      vm.coachHint &&
      vm.coachHint.includes('MIRROR GLIMPSE')
        ? cleanNarrativeCopy(vm.coachHint)
        : null;
    const clueText =
      vm.peelTier === 3
        ? clueTiers[2]?.clueText || q.clues[1]
        : vm.peelTier === 2
          ? clueTiers[1]?.clueText || q.clues[0]
          : leakedMirrorHint;

    const totalCombined = Math.max(1, vm.playerScore + vm.rivalScore);
    const tugPct =
      vm.playerScore === 0 && vm.rivalScore === 0
        ? 50
        : Math.max(12, Math.min(88, Math.round((vm.playerScore / totalCombined) * 100)));

    // Freeze Chrono-Ring at exact lock timestamp during REVEAL (#137 P1 #6)
    const totalSec = Math.max(1, vm.totalTimeSec || q.timerSec || 20);
    const remSec = Math.max(0, vm.remainingTimeSec ?? totalSec);
    const chronoFrac = Math.max(0, Math.min(1, remSec / totalSec));
    const dashOffset = ((1 - chronoFrac) * 59.7).toFixed(2);
    const chronoUrgent = !vm.revealed && remSec <= 5.0 && remSec > 0;

    // Only show floating coach pill during Prologue Q1..Q4 before lock, docked low above dock (#203 §3.3)
    const showCoachPill = Boolean(vm.isPrologueQuestion && vm.coachHint && !vm.revealed);
    const inlineMutatorHint =
      !vm.isPrologueQuestion && vm.coachHint && !vm.revealed
        ? cleanNarrativeCopy(vm.coachHint)
        : '';
    const cleanTell = cleanNarrativeCopy(vm.tellLine);
    const tellQuiet = !cleanTell && vm.rivalStatus === 'HIDDEN';
    const isFinalQuestion = vm.questionIndex + 1 >= vm.questionTotal;
    const pinnedActionsHtml = vm.revealed
      ? this.renderRevealPinnedButtonsHtml(vm, vm.revealed, isFinalQuestion)
      : this.renderLiveActionRowHtml(vm, q.archetype, tierMult, facets);

    const duelSplit = vm.duelLiveSplit ?? null;
    const duelTotal = duelSplit ? Math.max(1, duelSplit.playerScore + duelSplit.challengerScore) : 1;
    const duelFillPct = duelSplit
      ? duelSplit.playerScore === 0 && duelSplit.challengerScore === 0
        ? 50
        : Math.max(12, Math.min(88, Math.round((duelSplit.playerScore / duelTotal) * 100)))
      : 50;
    const duelDeltaSign = duelSplit
      ? duelSplit.deltaPts > 0
        ? `+${formatCount(duelSplit.deltaPts)}`
        : duelSplit.deltaPts < 0
          ? `-${formatCount(Math.abs(duelSplit.deltaPts))}`
          : '0'
      : '0';
    const duelDeltaCls = duelSplit
      ? duelSplit.leader === 'PLAYER'
        ? 'is-ahead'
        : duelSplit.leader === 'CHALLENGER'
          ? 'is-behind'
          : 'is-tied'
      : 'is-tied';

    this.root.innerHTML = `
      ${this.renderTopBarHtml(
        vm.chyronTitle,
        `Q${vm.questionIndex + 1}/${vm.questionTotal}`,
        true,
        true,
        false,
      )}

      <div class="ws-gameplay-layout">
        <!-- ZONE 1: Single Wrapper (Preserves Strict 3-Row Grid!) for Telemetry Ribbon + Optional Live 1v1 Ghost Split Bar -->
        <div class="ws-gameplay-zone1" style="display:flex;flex-direction:column;gap:4px;min-width:0;">
          <section class="ws-stage-story-strip" aria-label="Match Scoreboard and Live Character Tell">
            <div class="ws-momentum-card">
              <div class="ws-momentum-row">
                <span class="ws-player-score" id="ws-player-pts">
                  ${escapeHtml(vm.challengerName.toUpperCase())} · ${vm.playerScore.toLocaleString('en-US')} PTS
                  ${
                    vm.streak >= 2
                      ? `<img src="./assets/ui/badge_streak_fire.png" alt="" style="width:15px;height:15px;vertical-align:middle;margin-left:3px;" />×${vm.streak}`
                      : ''
                  }
                  ${typeof vm.shields === 'number' ? ` · ${hudIcon('shield', 13)}×${vm.shields}` : ''}
                </span>
                ${
                  vm.rivalStatus !== 'HIDDEN'
                    ? `
                  <span class="ws-rival-score">
                    <span class="ws-rival-status-chip ${vm.rivalStatus === 'OVERCLOCKING' ? 'is-overclock' : ''}" id="ws-rival-chip">
                      ${escapeHtml(vm.rivalStatus)}
                    </span>
                    <span id="ws-rival-pts">${escapeHtml(vm.rivalName.toUpperCase())} ${vm.rivalScore.toLocaleString('en-US')}</span>
                  </span>
                `
                    : `<span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-muted);white-space:nowrap;">${escapeHtml(cleanNarrativeCopy(vm.modeLabel).toUpperCase())}</span>`
                }
              </div>
              <div class="ws-tug-track">
                <div class="ws-tug-fill" id="ws-tug-fill" style="width:${tugPct}%;"></div>
              </div>
            </div>

            <div class="ws-actor-tell-cluster ${tellQuiet ? 'is-quiet' : ''}">
              <div class="ws-actor-cutout-wrap">
                <img
                  id="ws-live-actor-img"
                  class="ws-actor-cutout-img"
                  src="${resolvePortraitCutoutUrl(vm.actorId, vm.actorExpression)}"
                  alt="${escapeHtml(vm.actorName)}"
                />
              </div>
              <div class="ws-tell-copy">
                <div class="ws-tell-speaker">${escapeHtml(vm.actorName.toUpperCase())}</div>
                <div class="ws-tell-text" id="ws-live-tell-text" style="${cleanTell ? '' : 'display:none;'}">${escapeHtml(cleanTell)}</div>
              </div>
            </div>
          </section>

          ${
            duelSplit
              ? `
            <div class="ws-duel-live-split-bar" id="ws-duel-live-split-bar" aria-label="Head-to-Head Ghost Split Comparison">
              <div class="ws-duel-split-head">
                <span class="ws-duel-split-you" id="ws-duel-split-you">YOU: ${duelSplit.playerScore.toLocaleString('en-US')} PTS</span>
                <span class="ws-duel-split-delta ${duelDeltaCls}" id="ws-duel-split-delta">Δ ${duelDeltaSign}</span>
                <span class="ws-duel-split-rival" id="ws-duel-split-rival">${escapeHtml(duelSplit.challengerName.toUpperCase())}: ${duelSplit.challengerScore.toLocaleString('en-US')} PTS</span>
              </div>
              <div class="ws-duel-split-track">
                <div class="ws-duel-split-fill" id="ws-duel-split-fill" style="width:${duelFillPct}%;"></div>
              </div>
            </div>
          `
              : ''
          }
        </div>

        <!-- ZONE 2: Center Unobstructed 3D Veritas Prism Spotlight Plane -->
        <section class="ws-spotlight-plane" aria-hidden="true">
          ${showCoachPill ? `<div class="ws-coach-pill">${escapeHtml(cleanNarrativeCopy(vm.coachHint))}</div>` : ''}
        </section>

        <!-- ZONE 3: Sleek 2026 Frameless Bottom Question Dock (ZERO NinePatch / ZERO Covered A-D) -->
        <section class="ws-broadcast-dock ${vm.revealed ? 'is-revealed' : ''}" aria-label="Veritas Prism Controls">
          <div class="ws-dock-scroll-region">
            <div class="ws-dock-meta-row">
              <div class="ws-domain-badge">
                <img class="ws-domain-medallion" src="./assets/ui/cat_${q.l0Domain}.png" alt="" />
                <div class="ws-domain-text-wrap">
                  <span class="ws-domain-label">
                    ${escapeHtml(FORGE_DOMAINS[q.l0Domain]?.shortName ?? FORGE_DOMAINS[q.l0Domain]?.name ?? 'General')}${activeStep ? ` · ${escapeHtml(activeStep.stepLabel)}` : ''}
                  </span>
                  <span class="ws-domain-sub">
                    <span
                      id="ws-question-difficulty-badge"
                      class="ws-difficulty-tier-badge is-${diffBadge.tierKey}"
                      style="margin-right:5px;"
                    >${escapeHtml(diffBadge.label)}</span>${escapeHtml(q.l1Category || q.archetype.replace(/_/g, ' '))}${
                      inlineMutatorHint
                        ? ` · <span style="color:var(--cyan-clue);">${escapeHtml(inlineMutatorHint)}</span>`
                        : ''
                    }
                  </span>
                </div>
              </div>

              <div class="ws-tier-chrono-group">
                <span class="ws-tier-pill tier-${vm.peelTier}" id="ws-tier-badge" title="${tierShort}${tierDetail}">${tierShort}<span class="ws-tier-detail">${tierDetail}</span></span>
                <div class="ws-chrono-ring ${chronoUrgent ? 'is-urgent' : ''}" id="ws-chrono-box">
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9.5" fill="none" stroke="rgba(216,175,87,0.22)" stroke-width="2.6" />
                    <circle
                      id="ws-chrono-arc"
                      cx="12"
                      cy="12"
                      r="9.5"
                      fill="none"
                      stroke="#f2cf7e"
                      stroke-width="2.6"
                      stroke-dasharray="59.7"
                      stroke-dashoffset="${dashOffset}"
                      transform="rotate(-90 12 12)"
                    />
                  </svg>
                  <span id="ws-chrono-text">${remSec.toFixed(1)}s</span>
                </div>
              </div>
            </div>

            <p class="ws-question-prompt">${escapeHtml(promptText)}</p>

            ${
              clueText
                ? `<div class="ws-clue-drawer"><strong>${vm.peelTier === 3 ? 'BLUEPRINT:' : vm.peelTier === 2 ? 'CLUE:' : 'LEAKED INTEL (3.0× KEPT):'}</strong> ${escapeHtml(sanitizeHudDisplayText(clueText, q))}</div>`
                : ''
            }

            ${this.renderArchetypeControlsHtml(vm, q.archetype, facets, promptText)}

            ${vm.revealed ? this.renderRevealFooterHtml(vm.revealed, q) : ''}
          </div>

          ${
            pinnedActionsHtml
              ? `<div class="ws-dock-pinned-actions">${pinnedActionsHtml}</div>`
              : ''
          }
        </section>
      </div>
    `;

    this.bindTopBarEvents();

    // Mount Wave-2 Living 2.5D CharacterStageActor + Tells + Mini-Rival-Prism Telemetry!
    if (this.characterRig) {
      this.characterRig.mountGameplaySlots({
        portraitSlot: this.root.querySelector<HTMLElement>('.ws-actor-cutout-wrap'),
        tellCopySlot: this.root.querySelector<HTMLElement>('.ws-tell-copy'),
        tellCardContainer: this.root.querySelector<HTMLElement>('.ws-actor-tell-cluster'),
        rivalScoreSlot:
          vm.rivalStatus !== 'HIDDEN'
            ? this.root.querySelector<HTMLElement>('.ws-rival-score')
            : null,
      });
    }

    this.bindGameplayControls(vm, promptText);
  }

  private renderArchetypeControlsHtml(
    vm: GameplayQuestionViewState,
    archetype: Archetype3D,
    facets: PrismQuestion['facets'],
    promptText: string,
  ): string {
    if (archetype === 'GLOBE_PIN_DROP' && vm.question.globePin) {
      const gp = vm.question.globePin;
      const anchors = gp.quickAnchors.slice(0, 4);
      const sel = vm.selectedGlobeCoords ?? null;
      const distKm = vm.revealed?.globeDistanceKm;
      const statusText = vm.revealed
        ? typeof distKm === 'number'
          ? `DISTANCE: ${formatCount(distKm)} KM${vm.revealed.globeAccuracyTier ? ` · ${vm.revealed.globeAccuracyTier}` : ''}`
          : `TARGET: ${gp.targetLabel}`
        : sel
          ? 'Tap 3D Globe to Pinpoint · Armed'
          : 'Tap 3D Globe or Quick Region below';
      const coordValText = vm.revealed
        ? `TARGET ${formatLatLonCompact(gp.targetLat, gp.targetLon)}`
        : sel
          ? formatLatLonCompact(sel.lat, sel.lon)
          : 'NO PIN DROPPED';

      // Identify closest quick-anchor to the true target for clean Reveal highlighting
      let bestAnchorIdx = -1;
      if (vm.revealed && anchors.length > 0) {
        let bestSq = Infinity;
        anchors.forEach((a, idx) => {
          const dLat = a.lat - gp.targetLat;
          const dLon = a.lon - gp.targetLon;
          const sq = dLat * dLat + dLon * dLon;
          if (sq < bestSq) {
            bestSq = sq;
            bestAnchorIdx = idx;
          }
        });
      }

      return `
        <div class="ws-globe-pin-controls" id="ws-globe-pin-controls">
          <div class="ws-globe-coord-readout">
            <span class="ws-globe-coord-status" id="ws-globe-coord-status">
              ${hudIcon('pin', 13)} <span>${escapeHtml(statusText)}</span>
            </span>
            <span class="ws-globe-coord-val" id="ws-globe-coord-val">${escapeHtml(coordValText)}</span>
          </div>
          <div class="ws-globe-anchors-grid">
            ${anchors
              .map((a, idx) => {
                const isSel = !vm.revealed && vm.selectedGlobeAnchorIndex === idx;
                const isCorrect = Boolean(vm.revealed && idx === bestAnchorIdx);
                const isWrong = Boolean(
                  vm.revealed &&
                    !vm.revealed.correct &&
                    vm.selectedGlobeAnchorIndex === idx &&
                    idx !== bestAnchorIdx,
                );
                const stateCls = isCorrect
                  ? 'is-correct'
                  : isWrong
                    ? 'is-wrong'
                    : isSel
                      ? 'is-selected'
                      : '';
                return `
                  <button
                    type="button"
                    class="ws-globe-anchor-btn ${stateCls}"
                    data-globe-anchor-idx="${idx}"
                    data-globe-lat="${a.lat}"
                    data-globe-lon="${a.lon}"
                    data-globe-label="${escapeHtml(a.label)}"
                    ${vm.revealed ? 'disabled' : ''}
                  >
                    <span class="ws-facet-key">${idx + 1}</span>
                    <span class="ws-globe-anchor-label">${escapeHtml(sanitizeHudDisplayText(a.label, vm.question))}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        </div>
      `;
    }

    if (archetype === 'CALIBRATOR_DIAL' && vm.question.calibrator) {
      const cal = vm.question.calibrator;
      const unitStr = cal.unit ? ` ${cal.unit}` : '';
      const span = Math.max(1, cal.maxVal - cal.minVal);
      const bigStep = Math.max(cal.step * 5, Math.round(span / 20 / cal.step) * cal.step || 10);

      const estDisplay = formatHudValue(vm.calibratorEstimate, cal.unit, promptText);
      const minDisplay = formatHudValue(cal.minVal, cal.unit, promptText);
      const maxDisplay = formatHudValue(cal.maxVal, cal.unit, promptText);

      return `
        <div class="ws-calibrator-box">
          <div class="ws-calibrator-top" style="gap:6px;flex-wrap:nowrap;">
            <span class="ws-calibrator-readout" id="ws-cal-readout" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1 1 auto;">
              EST: ${escapeHtml(estDisplay)}${escapeHtml(unitStr)}
            </span>
            <div class="ws-step-cluster" style="flex:0 0 auto;gap:4px;">
              <button type="button" class="ws-step-btn" data-cal-delta="${-bigStep}" style="padding:3px 7px;" ${vm.revealed ? 'disabled' : ''}>-${bigStep}</button>
              <button type="button" class="ws-step-btn" data-cal-delta="${-cal.step}" style="padding:3px 7px;" ${vm.revealed ? 'disabled' : ''}>-${cal.step}</button>
              <button type="button" class="ws-step-btn" data-cal-delta="${cal.step}" style="padding:3px 7px;" ${vm.revealed ? 'disabled' : ''}>+${cal.step}</button>
              <button type="button" class="ws-step-btn" data-cal-delta="${bigStep}" style="padding:3px 7px;" ${vm.revealed ? 'disabled' : ''}>+${bigStep}</button>
            </div>
          </div>

          <input
            id="ws-cal-slider"
            class="ws-range-slider"
            type="range"
            min="${cal.minVal}"
            max="${cal.maxVal}"
            step="${cal.step}"
            value="${vm.calibratorEstimate}"
            ${vm.revealed ? 'disabled' : ''}
          />
          <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);margin-top:-3px;">
            <span>${escapeHtml(minDisplay)}${escapeHtml(unitStr)}</span>
            <span>${escapeHtml(maxDisplay)}${escapeHtml(unitStr)}</span>
          </div>

          <div class="ws-cone-pills">
            ${cal.toleranceCones
              .map(
                (cone) => `
              <button
                type="button"
                class="ws-cone-pill ${vm.calibratorCone === cone.id ? 'is-active' : ''}"
                data-cone-id="${cone.id}"
                ${vm.revealed ? 'disabled' : ''}
              >
                ${cone.id} ±${escapeHtml(formatCalibratorMargin(cone.margin, cal.unit, promptText, cal.exactVal))} [${cone.multiplier.toFixed(1)}x]
              </button>
            `,
              )
              .join('')}
          </div>
        </div>
      `;
    }

    if (archetype === 'CODEX_DUAL_RING' && vm.question.codex) {
      const codex = vm.question.codex;
      return `
        <div class="ws-codex-grid">
          ${codex.subjects
            .map((subj, sIdx) => {
              const tIdx = vm.codexTargetSelections[sIdx] ?? 0;
              const targetLabel = codex.targets[tIdx] ?? codex.targets[0];
              return `
                <div class="ws-codex-pair-card">
                  <div class="ws-codex-subject">${escapeHtml(sanitizeHudDisplayText(subj, vm.question))}</div>
                  <div class="ws-codex-target-cycle">
                    <button type="button" class="ws-step-btn" data-codex-subj="${sIdx}" data-codex-dir="-1" ${vm.revealed ? 'disabled' : ''}>◀</button>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(sanitizeHudDisplayText(targetLabel, vm.question))}</span>
                    <button type="button" class="ws-step-btn" data-codex-subj="${sIdx}" data-codex-dir="1" ${vm.revealed ? 'disabled' : ''}>▶</button>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `;
    }

    if (archetype === 'GAUNTLET_SHATTER') {
      return `
        <div class="ws-gauntlet-row">
          <button type="button" class="ws-btn-obsidian" data-gauntlet="DEBUNK" ${vm.revealed ? 'disabled' : ''} style="border:none;box-shadow:inset 3px 0 0 var(--amber-warn);color:var(--amber-warn);padding:11px 8px;">
            ◀ FALSE
          </button>
          <button type="button" class="ws-btn-gold" data-gauntlet="CHALLENGE" ${vm.revealed ? 'disabled' : ''} style="border-radius:10px;padding:11px 8px;">
            ▲ TRICK 2.5×
          </button>
          <button type="button" class="ws-btn-obsidian" data-gauntlet="VERIFY" ${vm.revealed ? 'disabled' : ''} style="border:none;box-shadow:inset 3px 0 0 var(--emerald-win);color:var(--emerald-win);padding:11px 8px;">
            TRUE ▶
          </button>
        </div>
      `;
    }

    // Default: SIGHTLINE_LOCK & HERO_ARTIFACT_SYNTHESIS (+ Optional Sapphire Visual Blueprint Lens Plate)
    const vp = vm.question.visualPlate;
    const visualPlateHtml =
      vp && vp.imageUrl
        ? `
      <div
        class="ws-visual-plate-frame"
        id="ws-visual-plate-frame"
        role="button"
        tabindex="0"
        aria-label="${escapeHtml(vp.altText || 'Inspect Sapphire Blueprint Visual')}"
        title="Tap to inspect full blueprint"
      >
        <img
          class="ws-visual-plate-img"
          src="${escapeHtml(vp.imageUrl)}"
          alt="${escapeHtml(vp.altText || vp.caption || 'Visual Blueprint')}"
        />
        <div class="ws-visual-plate-meta">
          <span class="ws-visual-plate-tag">${escapeHtml((vp.kind || 'BLUEPRINT').replace(/_/g, ' '))} · TAP TO ZOOM</span>
          ${vp.caption ? `<span class="ws-visual-plate-caption">${escapeHtml(sanitizeHudDisplayText(vp.caption, vm.question))}</span>` : ''}
        </div>
      </div>
    `
        : '';

    return `
      ${visualPlateHtml}
      <div class="ws-facet-strip ws-facets-grid">
        ${facets
          .slice(0, 4)
          .map((f, idx) => {
            const isShattered = vm.shatteredFacetIndices.includes(idx);
            const isSightline = vm.selectedFacetIndex === idx && !vm.revealed;
            const isCorrectReveal = Boolean(vm.revealed && vm.revealed.correctFacetIndex === idx);
            const isWrongReveal = Boolean(
              vm.revealed &&
                !vm.revealed.correct &&
                vm.revealed.selectedFacetIndex === idx,
            );
            const weakHint = vm.horizonWeakFacetIndex === idx && !isShattered;

            let stateClass = '';
            if (isCorrectReveal) stateClass = 'is-correct';
            else if (isWrongReveal) stateClass = 'is-wrong';
            else if (isShattered) stateClass = 'is-shattered';
            else if (isSightline) stateClass = 'is-sightline';

            return `
              <button
                type="button"
                class="ws-facet-pill ${stateClass}"
                data-facet-idx="${idx}"
                aria-pressed="${isSightline ? 'true' : 'false'}"
                ${isShattered || vm.revealed ? 'disabled' : ''}
              >
                <span class="ws-facet-key">${escapeHtml(f.slotLabel)}</span>
                <span class="ws-facet-text">
                  ${escapeHtml(sanitizeHudDisplayText(f.text, vm.question))}
                  ${weakHint ? ' <em style="color:var(--amber-warn);font-size:10px;">[FRACTURE]</em>' : ''}
                  ${vm.showPeoplesHeatmap && !isShattered ? ` <em style="color:var(--cyan-clue);font-size:10px;">${f.crowdSharePct}%</em>` : ''}
                </span>
                ${
                  isSightline
                    ? `<span class="ws-facet-armed-badge" aria-hidden="true">ARMED</span>`
                    : isCorrectReveal
                      ? `<span class="ws-facet-armed-badge is-correct" aria-hidden="true">✓</span>`
                      : isWrongReveal
                        ? `<span class="ws-facet-armed-badge is-wrong" aria-hidden="true">✕</span>`
                        : ''
                }
              </button>
            `;
          })
          .join('')}
      </div>
    `;
  }

  private getConciseOverclockIdleLabel(tierMult: number): string {
    const tierStr = tierMult.toFixed(1);
    const maxStr = (tierMult * 2.0).toFixed(1);
    const narrow = typeof window !== 'undefined' && window.innerWidth < 460;
    return narrow
      ? `LOCK ${tierStr}× · HOLD ${maxStr}×`
      : `TAP: LOCK (${tierStr}×) · HOLD: OVERCLOCK`;
  }

  private renderLiveActionRowHtml(
    vm: GameplayQuestionViewState,
    archetype: Archetype3D,
    tierMult: number,
    facets: PrismQuestion['facets'],
  ): string {
    if (archetype === 'GAUNTLET_SHATTER') {
      return '';
    }

    const baseUnpeeledMult =
      archetype === 'CALIBRATOR_DIAL'
        ? vm.question.calibrator?.toleranceCones.find((c) => c.id === vm.calibratorCone)
            ?.multiplier ??
          (vm.calibratorCone === 'PINHOLE' ? 3.5 : vm.calibratorCone === 'WIDE' ? 1.5 : 2.5)
        : archetype === 'GLOBE_PIN_DROP'
          ? 3.5
          : 3.0;
    const isScaledPeel =
      archetype === 'CALIBRATOR_DIAL' ||
      archetype === 'CODEX_DUAL_RING' ||
      archetype === 'GLOBE_PIN_DROP';
    const nextT2Mult = isScaledPeel
      ? Math.round(baseUnpeeledMult * 0.78 * 100) / 100
      : 2.0;
    const nextT3Mult = isScaledPeel
      ? Math.round(baseUnpeeledMult * 0.55 * 100) / 100
      : 1.2;

    let peelLabel = '✓ OPEN';
    let peelTitle = `All clue tiers revealed (${nextT3Mult.toFixed(1)}×)`;
    let peelDisabled = true;
    if (vm.peelSealedByJammer) {
      peelLabel = '◈ SEALED';
      peelTitle = 'Peel sealed by jammer';
      peelDisabled = true;
    } else if (vm.freeCoopCueAvailable && vm.peelTier === 1) {
      peelLabel = `✦ CUE · ${baseUnpeeledMult.toFixed(1)}×`;
      peelTitle = `Free Nadia Cue (Keep ${baseUnpeeledMult.toFixed(1)}×)`;
      peelDisabled = false;
    } else if (vm.peelTier === 1) {
      peelLabel = `▼ PEEL · ${nextT2Mult.toFixed(1)}×`;
      peelTitle = `Peel Brass Crown for Clue (${baseUnpeeledMult.toFixed(1)}× → ${nextT2Mult.toFixed(1)}×)`;
      peelDisabled = false;
    } else if (vm.peelTier === 2) {
      peelLabel = `▼ PEEL · ${nextT3Mult.toFixed(1)}×`;
      peelTitle = isScaledPeel
        ? `Peel Blueprint Clue (${nextT2Mult.toFixed(1)}× → ${nextT3Mult.toFixed(1)}×)`
        : 'Peel Blueprint & Shatter 2 Decoys (2.0× → 1.2×)';
      peelDisabled = false;
    }

    const globeUnpinned = archetype === 'GLOBE_PIN_DROP' && !vm.selectedGlobeCoords;
    const armedSlot =
      archetype === 'GLOBE_PIN_DROP'
        ? vm.selectedGlobeCoords
          ? 'PIN'
          : 'UNPINNED'
        : (facets[vm.selectedFacetIndex]?.slotLabel ?? 'A');
    const idleLabel = globeUnpinned
      ? 'DROP PIN ON GLOBE TO ARM'
      : this.getConciseOverclockIdleLabel(tierMult);

    return `
      <div class="ws-action-row ${vm.councilVetoAvailable ? 'has-veto' : ''}">
        <button type="button" class="ws-peel-btn" id="ws-btn-peel" title="${escapeHtml(peelTitle)}" ${peelDisabled ? 'disabled' : ''}>
          ${peelLabel}
        </button>

        ${
          vm.councilVetoAvailable
            ? `<button type="button" class="ws-peel-btn" id="ws-btn-veto" title="Veto Domain" style="color:var(--gold-bright);">⟳ VETO</button>`
            : ''
        }

        <button
          type="button"
          class="ws-overclock-bar"
          id="ws-btn-overclock"
          data-armed-slot="${escapeHtml(armedSlot)}"
          ${globeUnpinned ? 'disabled' : ''}
        >
          <div class="ws-overclock-fill" id="ws-overclock-fill"></div>
          <span class="ws-overclock-label" id="ws-overclock-label">
            ${escapeHtml(idleLabel)}
          </span>
        </button>
      </div>
    `;
  }

  private renderRevealFooterHtml(
    rev: NonNullable<GameplayQuestionViewState['revealed']>,
    question: PrismQuestion,
  ): string {
    const cleanCorrect = sanitizeHudDisplayText(rev.correctDisplay, question);
    const cleanWhy = sanitizeHudDisplayText(rev.whyExplanation, question);
    const globeDistTag =
      typeof rev.globeDistanceKm === 'number' && !cleanCorrect.toLowerCase().includes('km')
        ? ` · ${formatCount(rev.globeDistanceKm)} km`
        : '';
    const statusLabel = rev.correct
      ? rev.bullseye
        ? `BULLSEYE! +${rev.earnedPoints.toLocaleString('en-US')} PTS${globeDistTag}`
        : `GOLD RESONANCE! +${rev.earnedPoints.toLocaleString('en-US')} PTS${globeDistTag}`
      : rev.backfired
        ? `BACKFIRE! ANSWER: ${cleanCorrect}${globeDistTag}`
        : `ANSWER: ${cleanCorrect}${globeDistTag}`;

    return `
      <div class="ws-intel-flash ${rev.correct ? '' : 'is-miss'}">
        <div style="flex:1 1 100%;min-width:0;">
          <div class="ws-intel-flash-title" style="color:${rev.correct ? 'var(--emerald-win)' : '#ff8e9b'};display:flex;flex-wrap:wrap;align-items:center;gap:6px;">
            <span>${escapeHtml(statusLabel)}</span>
            ${
              rev.feedbackToast
                ? `<span id="ws-q-feedback-toast" style="font-family:var(--font-mono);font-size:10px;color:var(--gold-bright);padding:1px 6px;border-radius:999px;background:rgba(242,207,126,0.16);">${escapeHtml(rev.feedbackToast)}</span>`
                : ''
            }
          </div>
          <div class="ws-intel-flash-body">
            ${escapeHtml(cleanWhy)}
          </div>
        </div>
      </div>
    `;
  }

  private renderRevealPinnedButtonsHtml(
    vm: GameplayQuestionViewState,
    rev: NonNullable<GameplayQuestionViewState['revealed']>,
    isFinalQuestion = false,
  ): string {
    const feedbackControls = `
      <div class="ws-feedback-micro-group">
        <button
          type="button"
          class="ws-feedback-micro-btn ${rev.feedbackVote === 'UPVOTE' ? 'is-upvoted' : ''}"
          id="ws-btn-q-upvote"
          aria-label="Upvote Question"
          aria-pressed="${rev.feedbackVote === 'UPVOTE' ? 'true' : 'false'}"
          title="Great question"
        >${hudIcon('thumbUp', 14)}</button>
        <button
          type="button"
          class="ws-feedback-micro-btn ${rev.feedbackVote === 'FLAG' ? 'is-flagged' : ''}"
          id="ws-btn-q-flag"
          aria-label="Flag and Quarantine Question"
          aria-pressed="${rev.feedbackVote === 'FLAG' ? 'true' : 'false'}"
          title="Flag awkward phrasing & quarantine from pool"
        >${hudIcon('flag', 14)}</button>
      </div>
      <button type="button" class="ws-util-pill ${rev.bookmarked ? 'is-active' : ''}" id="ws-btn-bookmark" style="display:inline-flex;align-items:center;gap:4px;">
        ${hudIcon('star', 13)}<span>${rev.bookmarked ? 'SAVED' : 'SAVE'}</span>
      </button>
    `;

    if (vm.isInstantTrialPrism) {
      const headline = rev.correct
        ? 'Impressive Instinct — Choose Your Next Move'
        : 'Sharp Warmup — Choose Your Next Move';
      return `
        <div id="ws-instant-prism-next-bar" style="display:flex;flex-direction:column;gap:6px;width:100%;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="font-family:var(--font-mono);font-size:10.5px;font-weight:800;letter-spacing:0.06em;color:var(--gold-bright);text-transform:uppercase;">
              ${escapeHtml(headline)}
            </span>
            <div style="display:inline-flex;align-items:center;gap:5px;flex:0 0 auto;">
              ${feedbackControls}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1.2fr 1fr 0.9fr;gap:6px;width:100%;">
            <button type="button" class="ws-btn-gold" id="ws-instant-go-campaign" style="min-height:42px;padding:6px 6px;font-size:clamp(10.5px,2.8vw,11.5px);letter-spacing:0.02em;white-space:nowrap;">
              Story Mode ▶
            </button>
            <button type="button" class="ws-btn-obsidian" id="ws-instant-go-baseball" style="min-height:42px;padding:6px 6px;font-size:clamp(10.5px,2.8vw,11.5px);letter-spacing:0.02em;white-space:nowrap;">
              Baseball
            </button>
            <button type="button" class="ws-btn-obsidian" id="ws-instant-go-daily" style="min-height:42px;padding:6px 6px;font-size:clamp(10.5px,2.8vw,11.5px);letter-spacing:0.02em;white-space:nowrap;">
              Daily 10
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="ws-action-row ws-reveal-action-row">
        ${feedbackControls}
        <button type="button" class="ws-btn-gold" id="ws-btn-next-q">
          ${isFinalQuestion ? 'FINISH STAGE ▶' : 'NEXT PRISM ▶'}
        </button>
      </div>
    `;
  }

  /** Surgically updates Globe Pin-Drop readout & arms Overclock without rebuilding DOM. */
  public updateGlobeSelectionDom(
    lat: number,
    lon: number,
    anchorIdx: number | null,
    tierMult: number,
    anchorLabel?: string,
  ): void {
    const statusEl = this.root.querySelector<HTMLElement>('#ws-globe-coord-status span');
    if (statusEl) {
      statusEl.textContent = anchorLabel
        ? `Selected: ${anchorLabel} · Armed`
        : 'Tap 3D Globe to Pinpoint · Armed';
    }
    const valEl = this.root.querySelector<HTMLElement>('#ws-globe-coord-val');
    if (valEl) {
      valEl.textContent = formatLatLonCompact(lat, lon);
    }
    this.root.querySelectorAll<HTMLButtonElement>('[data-globe-anchor-idx]').forEach((btn) => {
      const idx = Number(btn.dataset.globeAnchorIdx);
      btn.classList.toggle('is-selected', anchorIdx !== null && idx === anchorIdx);
    });
    const ocBtn = this.root.querySelector<HTMLButtonElement>('#ws-btn-overclock');
    if (ocBtn) {
      ocBtn.disabled = false;
      ocBtn.dataset.armedSlot = anchorLabel ? anchorLabel.slice(0, 10) : 'PIN';
    }
    const labelEl = this.root.querySelector<HTMLElement>('#ws-overclock-label');
    if (labelEl) {
      labelEl.textContent = this.getConciseOverclockIdleLabel(tierMult);
    }
  }

  private openVisualPlateLightbox(imageUrl: string, caption?: string, altText?: string): void {
    this.closeVisualLightbox();
    const overlay = document.createElement('div');
    overlay.className = 'ws-visual-plate-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', altText || 'Sapphire Blueprint Zoom');
    overlay.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;max-width:min(94vw,680px);width:100%;">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(altText || caption || 'Blueprint Visual')}" />
        ${
          caption
            ? `<div style="font-family:var(--font-mono);font-size:12px;color:var(--ivory-primary);text-align:center;">${escapeHtml(caption)}</div>`
            : ''
        }
        <button type="button" class="ws-btn-obsidian" id="ws-lightbox-close" style="min-height:40px;padding:6px 18px;">CLOSE BLUEPRINT ✕</button>
      </div>
    `;
    overlay.addEventListener('click', (ev) => {
      if (ev.target === overlay) {
        this.closeVisualLightbox();
      }
    });
    overlay.querySelector('#ws-lightbox-close')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.closeVisualLightbox();
    });
    document.body.appendChild(overlay);
    this.visualLightboxEl = overlay;
  }

  private bindGameplayControls(vm: GameplayQuestionViewState, promptText: string): void {
    // Visual Blueprint Lightbox Trigger
    const vp = vm.question.visualPlate;
    const plateFrame = this.root.querySelector<HTMLElement>('#ws-visual-plate-frame');
    if (plateFrame && vp?.imageUrl) {
      const openZoom = () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.openVisualPlateLightbox(vp.imageUrl, vp.caption, vp.altText);
      };
      plateFrame.addEventListener('click', openZoom);
      plateFrame.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          openZoom();
        }
      });
    }

    // 3D Globe Pin-Drop Quick Region Anchor Pills
    this.root.querySelectorAll<HTMLButtonElement>('[data-globe-anchor-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.globeAnchorIdx);
        const lat = Number(btn.dataset.globeLat);
        const lon = Number(btn.dataset.globeLon);
        if (Number.isNaN(idx) || Number.isNaN(lat) || Number.isNaN(lon)) return;
        this.actions.onSelectGlobeAnchor?.(lat, lon, idx);
      });
    });

    // 4-Facet Pills: 1st tap selects & highlights clearly; 2nd tap on armed facet locks immediately!
    this.root.querySelectorAll<HTMLButtonElement>('[data-facet-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.facetIdx);
        if (Number.isNaN(idx)) return;
        const curSelected = Number(
          this.root.querySelector<HTMLButtonElement>('.ws-facet-pill.is-sightline')?.dataset
            .facetIdx ?? vm.selectedFacetIndex,
        );
        if (idx === curSelected) {
          this.lastOverclockHandledMs = performance.now();
          this.actions.onCommitLock(0);
        } else {
          this.actions.onSelectFacet(idx);
        }
      });
    });

    // Calibrator Slider & Step Buttons & Tolerance Cone Pills (Year-Safe Formatting!)
    const slider = this.root.querySelector<HTMLInputElement>('#ws-cal-slider');
    const readout = this.root.querySelector<HTMLElement>('#ws-cal-readout');
    const calUnit = vm.question.calibrator?.unit;
    const unitStr = calUnit ? ` ${calUnit}` : '';

    slider?.addEventListener('input', () => {
      const val = Number(slider.value);
      if (readout) {
        readout.textContent = `EST: ${formatHudValue(val, calUnit, promptText)}${unitStr}`;
      }
      this.haptics.spinTick();
      this.audio.playSfx('spin_tick');
      this.actions.onUpdateCalibrator(val, vm.calibratorCone);
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-cal-delta]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cal = vm.question.calibrator;
        if (!cal) return;
        const delta = Number(btn.dataset.calDelta);
        const cur = slider ? Number(slider.value) : vm.calibratorEstimate;
        const next = Math.max(cal.minVal, Math.min(cal.maxVal, cur + delta));
        if (slider) slider.value = String(next);
        if (readout) {
          readout.textContent = `EST: ${formatHudValue(next, cal.unit, promptText)}${unitStr}`;
        }
        this.haptics.spinTick();
        this.audio.playSfx('spin_tick');
        this.actions.onUpdateCalibrator(next, vm.calibratorCone);
      });
    });

    this.root.querySelectorAll<HTMLButtonElement>('[data-cone-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cone = btn.dataset.coneId as CalibratorConeId;
        const cur = slider ? Number(slider.value) : vm.calibratorEstimate;
        this.haptics.sightlineSnap();
        this.audio.playSfx('sightline_snap');
        this.actions.onUpdateCalibrator(cur, cone);
      });
    });

    // Codex Dual-Ring Controls
    this.root.querySelectorAll<HTMLButtonElement>('[data-codex-subj]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sIdx = Number(btn.dataset.codexSubj) as 0 | 1 | 2;
        const dir = Number(btn.dataset.codexDir);
        this.haptics.spinTick();
        this.audio.playSfx('spin_tick');
        this.actions.onUpdateCodexRing(sIdx, dir);
      });
    });

    // Gauntlet Shatter Controls
    this.root.querySelectorAll<HTMLButtonElement>('[data-gauntlet]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.gauntlet as 'VERIFY' | 'DEBUNK' | 'CHALLENGE';
        this.haptics.shatterPlate();
        this.audio.playSfx('glass_shatter');
        this.actions.onSubmitGauntlet(act);
      });
    });

    // Peel Crown Button
    this.root.querySelector('#ws-btn-peel')?.addEventListener('click', () => {
      this.actions.onTriggerPeel();
    });

    // Council Veto Button
    this.root.querySelector('#ws-btn-veto')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('shutter_peel');
      this.actions.onTriggerCouncilVeto();
    });

    // Hold-to-Overclock / Tap Safe Lock + Slide Sideways to Cancel (Bluff Echo)
    // + Unbreakable Native `click` Fallback (100% submission reliability!)
    const overclockBtn = this.root.querySelector<HTMLButtonElement>('#ws-btn-overclock');
    const fillEl = this.root.querySelector<HTMLElement>('#ws-overclock-fill');
    const labelEl = this.root.querySelector<HTMLElement>('#ws-overclock-label');
    const tierMult = this.resolveActiveTierMultiplier(vm);
    const globeUnpinned = vm.question.archetype === 'GLOBE_PIN_DROP' && !vm.selectedGlobeCoords;

    if (overclockBtn && !vm.revealed) {
      if (this.overclockController) {
        this.overclockController.setTierMultiplier(tierMult);
        this.unbindOverclockBtn = this.overclockController.bindButton({
          buttonEl: overclockBtn,
          fillEl,
          labelEl,
        });
        // Keep single-line concise mobile-first idle label
        if (labelEl) {
          labelEl.textContent = globeUnpinned
            ? 'DROP PIN ON GLOBE TO ARM'
            : this.getConciseOverclockIdleLabel(tierMult);
        }
      } else {
        this.bindFallbackOverclockButton(overclockBtn, fillEl, labelEl, tierMult);
        // Native `click` safety net for fallback mode (OverclockGestureController has its own
        // authoritative `handleClickSafetyNet` synced with `ventedPointerId` & `lastHandledReleaseMs`)
        overclockBtn.addEventListener('click', (ev) => {
          if (overclockBtn.disabled) return;
          const now = performance.now();
          if (now - this.lastOverclockHandledMs < 320) return;
          if (this.overclockPointerId !== null) return;
          ev.stopPropagation();
          this.lastOverclockHandledMs = now;
          this.actions.onCommitLock(0);
        });
      }
    }

    // Reveal Actions (Upvote / Flag Quarantine / Bookmark / Next Prism / Instant Trial Next Move)
    this.root.querySelector('#ws-btn-q-upvote')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onRateQuestion?.('UPVOTE');
    });

    this.root.querySelector('#ws-btn-q-flag')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onRateQuestion?.('FLAG');
    });

    this.root.querySelector('#ws-btn-bookmark')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onToggleBookmark();
    });

    this.root.querySelector('#ws-btn-next-q')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onNextQuestion();
    });

    this.root.querySelector('#ws-instant-go-campaign')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.actions.onInstantPrismAction?.('CAMPAIGN');
    });

    this.root.querySelector('#ws-instant-go-baseball')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.actions.onInstantPrismAction?.('BASEBALL');
    });

    this.root.querySelector('#ws-instant-go-daily')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.actions.onInstantPrismAction?.('DAILY');
    });
  }

  private bindFallbackOverclockButton(
    overclockBtn: HTMLButtonElement,
    fillEl: HTMLElement | null,
    labelEl: HTMLElement | null,
    tierMult: number,
  ): void {
    const clearWindowListeners = () => {
      if (this.fallbackWindowCleanup) {
        this.fallbackWindowCleanup();
        this.fallbackWindowCleanup = null;
      }
    };

    const onWinMove = (ev: PointerEvent) => {
      if (this.overclockPointerId !== ev.pointerId || this.overclockCancelled) return;
      const elapsedMs = performance.now() - this.overclockStartMs;
      // NEVER trigger Bluff Echo Cancel during < 260ms normal tap window!
      if (elapsedMs < 260) return;
      const dx = Math.abs(ev.clientX - this.overclockStartX);
      const rect = overclockBtn.getBoundingClientRect();
      const verticalExit = ev.clientY < rect.top - 36 || ev.clientY > rect.bottom + 36;
      if (dx >= 88 || verticalExit) {
        this.overclockCancelled = true;
        this.lastOverclockHandledMs = performance.now();
        this.cancelOverclockHold();
        if (fillEl) fillEl.style.width = '0%';
        if (labelEl) {
          labelEl.textContent = `BLUFF VENTED — ${this.getConciseOverclockIdleLabel(tierMult)}`;
        }
        this.haptics.uiTap();
        this.actions.onOverclockBluffCancel();
      }
    };

    const onWinUp = (ev: PointerEvent) => {
      if (this.overclockPointerId !== ev.pointerId) return;
      const wasCancelled = this.overclockCancelled;
      const elapsedMs = performance.now() - this.overclockStartMs;
      const finalCharge = elapsedMs < 240 ? 0 : this.currentCharge01;
      this.lastOverclockHandledMs = performance.now();
      this.cancelOverclockHold();
      if (!wasCancelled) {
        this.actions.onCommitLock(finalCharge);
      }
    };

    const onWinCancel = (ev: PointerEvent) => {
      if (this.overclockPointerId !== ev.pointerId) return;
      this.lastOverclockHandledMs = performance.now();
      this.cancelOverclockHold();
      this.actions.onOverclockBluffCancel();
    };

    overclockBtn.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      ev.preventDefault();
      try {
        overclockBtn.setPointerCapture(ev.pointerId);
      } catch {
        // Ignore capture failure in synthetic environments
      }
      this.overclockPointerId = ev.pointerId;
      this.overclockStartMs = performance.now();
      this.overclockStartX = ev.clientX;
      this.overclockCancelled = false;
      this.currentCharge01 = 0;

      clearWindowListeners();
      window.addEventListener('pointermove', onWinMove);
      window.addEventListener('pointerup', onWinUp);
      window.addEventListener('pointercancel', onWinCancel);
      this.fallbackWindowCleanup = () => {
        window.removeEventListener('pointermove', onWinMove);
        window.removeEventListener('pointerup', onWinUp);
        window.removeEventListener('pointercancel', onWinCancel);
      };

      const stepHold = () => {
        if (this.overclockPointerId === null || this.overclockCancelled) return;
        const elapsedSec = (performance.now() - this.overclockStartMs) / 1000;
        if (elapsedSec >= 0.24) {
          if (this.currentCharge01 === 0) {
            this.audio.startOverclockCharge();
          }
          const charge = Math.min(1, (elapsedSec - 0.24) / 0.81);
          this.currentCharge01 = charge;
          this.haptics.overclockPulse(charge);
          this.actions.onOverclockChargeProgress(charge);

          const liveMult = (tierMult * (1 + charge)).toFixed(2);
          if (fillEl) fillEl.style.width = `${(charge * 100).toFixed(1)}%`;
          if (labelEl) {
            labelEl.textContent = `OVERCLOCK ${liveMult}× — RELEASE · SLIDE ↔ CANCEL`;
          }
        }
        this.overclockHoldRaf = requestAnimationFrame(stepHold);
      };
      this.overclockHoldRaf = requestAnimationFrame(stepHold);
    });
  }

  /** Fast 60fps telemetry tick without re-rendering DOM or breaking pointer capture */
  public updateLiveTelemetry(params: {
    remainingSec: number;
    totalSec: number;
    selectedFacetIndex?: number;
    rivalStatus?: string;
    rivalName?: string;
    rivalScore?: number;
    playerScore?: number;
    challengerName?: string;
    actorId?: string;
    actorExpression?: string;
    tellLine?: string;
    duelLiveSplit?: GameplayQuestionViewState['duelLiveSplit'];
  }): void {
    const chronoText = this.root.querySelector<HTMLElement>('#ws-chrono-text');
    const chronoBox = this.root.querySelector<HTMLElement>('#ws-chrono-box');
    const chronoArc = this.root.querySelector<SVGCircleElement>('#ws-chrono-arc');

    if (chronoText) {
      chronoText.textContent = `${Math.max(0, params.remainingSec).toFixed(1)}s`;
    }
    if (chronoBox) {
      chronoBox.classList.toggle('is-urgent', params.remainingSec <= 5.0 && params.remainingSec > 0);
    }
    if (chronoArc && params.totalSec > 0) {
      const frac = Math.max(0, Math.min(1, params.remainingSec / params.totalSec));
      const circumference = 59.7;
      chronoArc.style.strokeDashoffset = `${((1 - frac) * circumference).toFixed(2)}`;
    }

    if (typeof params.selectedFacetIndex === 'number') {
      const slotLetters = ['A', 'B', 'C', 'D'];
      this.root.querySelectorAll<HTMLButtonElement>('[data-facet-idx]').forEach((btn) => {
        const idx = Number(btn.dataset.facetIdx);
        if (!btn.classList.contains('is-correct') && !btn.classList.contains('is-wrong')) {
          const isArmed = idx === params.selectedFacetIndex;
          btn.classList.toggle('is-sightline', isArmed);
          btn.setAttribute('aria-pressed', isArmed ? 'true' : 'false');
          const existingBadge = btn.querySelector('.ws-facet-armed-badge');
          if (isArmed && !existingBadge) {
            const badge = document.createElement('span');
            badge.className = 'ws-facet-armed-badge';
            badge.setAttribute('aria-hidden', 'true');
            badge.textContent = 'ARMED';
            btn.appendChild(badge);
          } else if (!isArmed && existingBadge) {
            existingBadge.remove();
          }
        }
      });
      const ocBtn = this.root.querySelector<HTMLElement>('#ws-btn-overclock');
      if (ocBtn) {
        ocBtn.dataset.armedSlot = slotLetters[params.selectedFacetIndex] ?? 'A';
      }
    }

    if (params.rivalStatus) {
      const chip = this.root.querySelector<HTMLElement>('#ws-rival-chip');
      if (chip) {
        chip.textContent = params.rivalStatus;
        chip.classList.toggle('is-overclock', params.rivalStatus === 'OVERCLOCKING');
      }
    }

    if (typeof params.rivalScore === 'number' && params.rivalName) {
      const rPts = this.root.querySelector<HTMLElement>('#ws-rival-pts');
      if (rPts) {
        rPts.textContent = `${params.rivalName.toUpperCase()} ${params.rivalScore.toLocaleString('en-US')}`;
      }
      if (typeof params.playerScore === 'number') {
        const tugFill = this.root.querySelector<HTMLElement>('#ws-tug-fill');
        const tot = Math.max(1, params.playerScore + params.rivalScore);
        const pct =
          params.playerScore === 0 && params.rivalScore === 0
            ? 50
            : Math.max(12, Math.min(88, Math.round((params.playerScore / tot) * 100)));
        if (tugFill) tugFill.style.width = `${pct}%`;
      }
    }

    if (params.duelLiveSplit) {
      const ds = params.duelLiveSplit;
      const youEl = this.root.querySelector<HTMLElement>('#ws-duel-split-you');
      const rivalEl = this.root.querySelector<HTMLElement>('#ws-duel-split-rival');
      const deltaEl = this.root.querySelector<HTMLElement>('#ws-duel-split-delta');
      const fillEl = this.root.querySelector<HTMLElement>('#ws-duel-split-fill');
      if (youEl) {
        youEl.textContent = `YOU: ${ds.playerScore.toLocaleString('en-US')} PTS`;
      }
      if (rivalEl) {
        rivalEl.textContent = `${ds.challengerName.toUpperCase()}: ${ds.challengerScore.toLocaleString('en-US')} PTS`;
      }
      if (deltaEl) {
        const sign =
          ds.deltaPts > 0
            ? `+${formatCount(ds.deltaPts)}`
            : ds.deltaPts < 0
              ? `-${formatCount(Math.abs(ds.deltaPts))}`
              : '0';
        deltaEl.textContent = `Δ ${sign}`;
        deltaEl.classList.toggle('is-ahead', ds.leader === 'PLAYER');
        deltaEl.classList.toggle('is-behind', ds.leader === 'CHALLENGER');
        deltaEl.classList.toggle('is-tied', ds.leader === 'TIED');
      }
      if (fillEl) {
        const tot = Math.max(1, ds.playerScore + ds.challengerScore);
        const pct =
          ds.playerScore === 0 && ds.challengerScore === 0
            ? 50
            : Math.max(12, Math.min(88, Math.round((ds.playerScore / tot) * 100)));
        fillEl.style.width = `${pct}%`;
      }
    }

    if (!this.characterRig && params.actorId && params.actorExpression) {
      const img = this.root.querySelector<HTMLImageElement>('#ws-live-actor-img');
      const nextSrc = resolvePortraitCutoutUrl(params.actorId, params.actorExpression);
      if (img && !img.src.endsWith(nextSrc.replace('./', ''))) {
        img.src = nextSrc;
      }
    }
    if (params.tellLine !== undefined) {
      const cleanTell = cleanNarrativeCopy(params.tellLine);
      const tellEl = this.root.querySelector<HTMLElement>('#ws-live-tell-text');
      const clusterEl = this.root.querySelector<HTMLElement>('.ws-actor-tell-cluster');
      if (tellEl) {
        if (tellEl.textContent !== cleanTell) {
          tellEl.textContent = cleanTell;
        }
        tellEl.style.display = cleanTell ? '' : 'none';
      }
      if (clusterEl && params.rivalStatus === 'HIDDEN') {
        clusterEl.classList.toggle('is-quiet', !cleanTell);
      }
    }
  }

  public cancelOverclockHold(unbind = false): void {
    if (unbind) {
      if (this.unbindOverclockBtn) {
        this.unbindOverclockBtn();
        this.unbindOverclockBtn = null;
      }
    } else if (this.overclockController?.isHolding()) {
      this.overclockController.reset();
    }
    if (this.fallbackWindowCleanup) {
      this.fallbackWindowCleanup();
      this.fallbackWindowCleanup = null;
    }
    if (this.overclockHoldRaf !== 0) {
      cancelAnimationFrame(this.overclockHoldRaf);
      this.overclockHoldRaf = 0;
    }
    this.overclockPointerId = null;
    this.currentCharge01 = 0;
    this.audio.stopOverclockCharge();
  }

  // ==========================================================================
  // 5. MATCH SUMMARY, ENDLESS EXTRACTION AIRLOCK & DAILY SHARE GRID
  // ==========================================================================

  public renderMatchSummary(vm: MatchSummaryViewState): void {
    this.cancelOverclockHold(true);

    // #171 §2.1: Dedicated Unmistakable Crimson/Amber Level Failure Screen when `won === false`!
    if (!vm.victory && vm.retryMissionId) {
      const causeBanner =
        vm.failureCauseBanner ||
        (vm.rivalName && typeof vm.rivalScore === 'number'
          ? `OUTSCORED BY ${vm.rivalName.toUpperCase()}: ${vm.playerScore.toLocaleString()} VS ${vm.rivalScore.toLocaleString()}`
          : 'CIRCUIT THRESHOLD UNMET');

      this.root.innerHTML = `
        ${this.renderTopBarHtml('⚠ CIRCUIT BREACH', vm.mode, true, false, false)}

        <div style="flex:1 1 auto;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;overflow-y:auto;">
          <div class="ws-frame-cinema ws-interactive" style="width:100%;max-width:820px;padding:clamp(16px,2.2vw,24px);display:flex;flex-direction:column;gap:14px;background:linear-gradient(180deg, rgba(44, 14, 22, 0.94) 0%, rgba(12, 10, 18, 0.98) 100%);box-shadow:inset 0 2px 0 rgba(224,82,99,0.75);">
            <div style="padding:8px 14px;border-radius:9px;background:rgba(224,82,99,0.16);box-shadow:inset 3px 0 0 var(--crimson-alert);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
              <span style="font-family:var(--font-display);font-size:13.5px;font-weight:800;letter-spacing:0.08em;color:#ff8e9b;">
                ⚠ CIRCUIT BREACH — LEVEL FAILED
              </span>
              <span style="font-family:var(--font-mono);font-size:11.5px;font-weight:700;color:var(--amber-warn);">
                ${escapeHtml(causeBanner)}
              </span>
            </div>

            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
              <div style="display:flex;align-items:center;gap:12px;flex:1 1 360px;min-width:0;">
                ${
                  vm.failureRivalId
                    ? `
                  <div class="ws-actor-cutout-wrap" style="width:62px;height:62px;border:none;box-shadow:inset 0 0 0 1px rgba(224,82,99,0.55);">
                    <img class="ws-actor-cutout-img" src="${resolvePortraitCutoutUrl(vm.failureRivalId, 'smirk')}" alt="${escapeHtml(vm.rivalName || 'Rival')}" />
                  </div>
                `
                    : ''
                }
                <div style="min-width:0;flex:1 1 auto;">
                  <div style="font-family:var(--font-display);font-size:clamp(17px,2vw,22px);font-weight:800;color:#ffd4d9;">
                    ${escapeHtml(cleanNarrativeCopy(vm.headline))}
                  </div>
                  <div style="font-size:13px;color:var(--ivory-primary);margin-top:3px;line-height:1.38;">
                    ${
                      vm.failureRivalQuote
                        ? `“${escapeHtml(cleanNarrativeCopy(vm.failureRivalQuote))}”`
                        : escapeHtml(cleanNarrativeCopy(vm.subheadline))
                    }
                  </div>
                </div>
              </div>

              <div style="text-align:right;font-family:var(--font-mono);">
                <div style="font-size:21px;font-weight:800;color:#ff8e9b;">
                  ${vm.playerScore.toLocaleString('en-US')} PTS
                </div>
                <div style="font-size:11.5px;color:var(--ivory-primary);">
                  ${escapeHtml(vm.challengerName)} · ${vm.correctCount}/${vm.totalCount} Solved · Streak ×${vm.bestStreak}
                </div>
                ${
                  vm.rivalName && typeof vm.rivalScore === 'number'
                    ? `<div style="font-size:11.5px;color:var(--amber-warn);margin-top:2px;">${escapeHtml(vm.rivalName)}: ${vm.rivalScore.toLocaleString('en-US')} PTS</div>`
                    : ''
                }
              </div>
            </div>

            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:10px;padding-top:8px;border-top:1px solid rgba(224,82,99,0.22);">
              <button type="button" class="ws-btn-obsidian" id="ws-summary-continue">
                ← RETURN TO HUB
              </button>
              <button type="button" class="ws-btn-obsidian" id="ws-restart-from-start" style="border:none;box-shadow:inset 3px 0 0 var(--amber-warn);color:var(--amber-warn);">
                ⏮ RESTART FROM START
              </button>
              <button type="button" class="ws-btn-gold" id="ws-retry-mission">
                ↻ RETRY LEVEL ▶
              </button>
            </div>
          </div>
        </div>
      `;

      this.bindTopBarEvents();

      const portraitSlot = this.root.querySelector<HTMLElement>('.ws-actor-cutout-wrap');
      if (portraitSlot && this.characterRig && vm.failureRivalId) {
        this.characterRig.mountStoryDialogueSlots(
          {
            portraitSlot,
            cardContainer: this.root.querySelector<HTMLElement>('.ws-frame-cinema'),
          },
          {
            speakerId: vm.failureRivalId,
            expression: 'smirk',
            text: vm.failureRivalQuote || vm.subheadline,
          },
        );
      }

      this.root.querySelector('#ws-retry-mission')?.addEventListener('click', () => {
        if (!vm.retryMissionId) return;
        this.haptics.sightlineSnap();
        this.audio.playSfx('sightline_snap');
        this.actions.onRetryMission?.(vm.retryMissionId);
      });

      this.root.querySelector('#ws-restart-from-start')?.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.actions.onRestartFromStart?.(vm.failureCityFirstMissionId);
      });

      this.root.querySelector('#ws-summary-continue')?.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.actions.onSummaryPrimaryContinue();
      });
      return;
    }

    const duelVerdict = vm.duelVerdict ?? null;
    const duelShareUrl = vm.duelShareUrl || duelVerdict?.rematchUrl || '';
    const duelShareBtnLabel =
      vm.duelShareLabel ||
      (duelVerdict ? 'Share Rematch Link' : 'Share 1-Tap Duel Link');
    const lb = vm.leaderboard ?? null;

    const renderLeaderboardRows = (expanded: boolean): string => {
      if (!lb) return '';
      let rows = lb.top20;
      if (!expanded) {
        const picked = new Map<string, (typeof lb.top20)[number]>();
        for (const r of lb.top20.slice(0, 5)) picked.set(`${r.rank}:${r.handle}`, r);
        for (const r of lb.entries) {
          if (r.isFriend || r.isPlayer) picked.set(`${r.rank}:${r.handle}`, r);
        }
        rows = Array.from(picked.values()).sort((a, b) => a.rank - b.rank);
      }
      return rows
        .map((entry) => {
          const rawTag = (entry.tag || entry.faction || '').trim();
          const cc = (entry.countryCode || '').trim();
          const metaLabel = entry.isPlayer
            ? rawTag || 'YOU · LIVE RANK'
            : cc && !new RegExp(`\\b${cc}\\b`, 'i').test(rawTag)
              ? `${rawTag ? `${rawTag}, ` : ''}${cc}`
              : rawTag.replace(/\s*·\s*([A-Z]{2})$/, ', $1');
          return `
        <div class="ws-leaderboard-row ${entry.isPlayer ? 'is-player' : entry.isFriend ? 'is-friend' : ''}">
          <span class="ws-lb-rank">#${entry.rank}</span>
          <span class="ws-lb-handle">
            ${escapeHtml(entry.handle)}
            <span class="ws-lb-meta">· ${escapeHtml(metaLabel)}</span>
          </span>
          <span class="ws-lb-score">${escapeHtml(entry.scoreFormatted)} PTS</span>
        </div>
      `;
        })
        .join('');
    };

    const duelVerdictHtml = duelVerdict
      ? `
        <div id="ws-duel-verdict-card" style="padding:10px 13px;border-radius:10px;background:rgba(12,17,30,0.88);box-shadow:inset 3px 0 0 ${duelVerdict.playerWon ? 'var(--emerald-win)' : duelVerdict.tied ? 'var(--gold-bright)' : 'var(--amber-warn)'};display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
            <span style="font-family:var(--font-mono);font-size:11px;font-weight:800;color:var(--gold-bright);display:inline-flex;align-items:center;gap:6px;">
              ${hudIcon('swords', 14)}<span>${escapeHtml(duelVerdict.headline)}</span>
            </span>
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--cyan-clue);">
              Splits Won: You ${duelVerdict.splitsWonByPlayer} · ${escapeHtml(duelVerdict.challengerName)} ${duelVerdict.splitsWonByChallenger}${duelVerdict.splitsTied > 0 ? ` · Tied ${duelVerdict.splitsTied}` : ''}
            </span>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;max-height:132px;overflow-y:auto;">
            ${duelVerdict.splitBreakdown
              .map((row) => {
                const deltaStr =
                  row.deltaSplitPts > 0
                    ? `+${formatCount(row.deltaSplitPts)}`
                    : row.deltaSplitPts < 0
                      ? `-${formatCount(Math.abs(row.deltaSplitPts))}`
                      : '0';
                const col =
                  row.deltaSplitPts > 0
                    ? 'var(--emerald-win)'
                    : row.deltaSplitPts < 0
                      ? '#ff8e9b'
                      : 'var(--ivory-muted)';
                return `
                  <div style="display:grid;grid-template-columns:36px 1fr 1fr 72px;gap:6px;align-items:center;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,0.03);font-family:var(--font-mono);font-size:11px;font-variant-numeric:tabular-nums;">
                    <span style="color:var(--ivory-muted);font-weight:700;">Q${row.qIndex + 1}</span>
                    <span style="color:var(--ivory-primary);">You: ${formatCount(row.playerSplitPts)}</span>
                    <span style="color:var(--cyan-clue);">${escapeHtml(duelVerdict.challengerName)}: ${formatCount(row.challengerSplitPts)}</span>
                    <span style="text-align:right;font-weight:700;color:${col};">${deltaStr}</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      `
      : '';

    const leaderboardHtml = lb
      ? `
        <div id="ws-summary-leaderboard" style="display:flex;flex-direction:column;gap:7px;padding:10px 12px;border-radius:10px;background:rgba(10,14,24,0.84);box-shadow:inset 3px 0 0 rgba(86,212,245,0.62);">
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
            <div style="font-family:var(--font-mono);font-size:11px;font-weight:800;color:var(--cyan-clue);">
              GLOBAL CONTENDERS · ${escapeHtml(lb.title.toUpperCase())} · YOUR RANK #${lb.playerRank}/${lb.totalEntries} (${escapeHtml(lb.topPercentBanner)})
            </div>
            <button type="button" class="ws-util-pill" id="ws-leaderboard-toggle" style="min-height:32px;padding:3px 9px;font-size:10.5px;">
              Show Top 20 ▾
            </button>
          </div>
          <div class="ws-leaderboard-list" id="ws-leaderboard-rows">
            ${renderLeaderboardRows(false)}
          </div>
        </div>
      `
      : '';

    this.root.innerHTML = `
      ${this.renderTopBarHtml('BROADCAST SUMMARY', vm.mode, true, false, false)}

      <div style="flex:1 1 auto;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;overflow-y:auto;">
        <div class="ws-frame-cinema ws-interactive" style="width:100%;max-width:780px;padding:clamp(14px,2.1vw,22px);display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
            <div>
              <div style="font-family:var(--font-mono);font-size:11px;color:${vm.victory ? 'var(--emerald-win)' : 'var(--amber-warn)'};">
                ${vm.victory ? '◆ STAGE VERIFIED · VICTORY' : '◆ STAGE UNRESOLVED · RETRY AVAILABLE'}
              </div>
              <div style="font-family:var(--font-display);font-size:clamp(18px,2.2vw,25px);font-weight:800;color:var(--gold-bright);margin-top:2px;">
                ${escapeHtml(cleanNarrativeCopy(vm.headline))}
              </div>
              <div style="font-size:13px;color:var(--ivory-muted);margin-top:2px;">
                ${escapeHtml(cleanNarrativeCopy(vm.subheadline))}
              </div>
            </div>

            <div style="text-align:right;font-family:var(--font-mono);">
              <div style="font-size:22px;font-weight:800;color:var(--gold-bright);">
                ${vm.playerScore.toLocaleString('en-US')} PTS
              </div>
              <div style="font-size:11.5px;color:var(--ivory-primary);">
                ${escapeHtml(vm.challengerName)} · ${vm.correctCount}/${vm.totalCount} Solved · Streak ×${vm.bestStreak}
              </div>
              ${
                vm.rivalName && typeof vm.rivalScore === 'number'
                  ? `<div style="font-size:11px;color:var(--cyan-clue);margin-top:2px;">vs ${escapeHtml(vm.rivalName)}: ${vm.rivalScore.toLocaleString('en-US')} PTS</div>`
                  : ''
              }
            </div>
          </div>

          ${duelVerdictHtml}

          ${
            vm.unlockedRelicTitle || vm.unlockedClueTitle
              ? `
            <div style="padding:10px 14px;border-radius:10px;background:rgba(242,207,126,0.10);box-shadow:inset 3px 0 0 var(--gold-bright);font-size:12.5px;color:var(--gold-bright);">
              ${vm.unlockedRelicTitle ? `<div style="display:flex;align-items:center;gap:6px;">${hudIcon('trophy', 14)}<span><strong>3D Relic Unlocked in Observatory:</strong> ${escapeHtml(vm.unlockedRelicTitle)}</span></div>` : ''}
              ${vm.unlockedClueTitle ? `<div style="display:flex;align-items:center;gap:6px;">${hudIcon('dossier', 14)}<span><strong>Dossier Evidence Decrypted:</strong> ${escapeHtml(vm.unlockedClueTitle)}</span></div>` : ''}
            </div>
          `
              : ''
          }

          ${
            vm.dailyShareText
              ? `
            <div style="padding:10px 12px;border-radius:9px;background:rgba(8,11,18,0.88);box-shadow:inset 3px 0 0 var(--cyan-clue);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
              <pre style="margin:0;flex:1 1 260px;min-width:0;max-height:76px;overflow-y:auto;font-family:var(--font-mono);font-size:11.5px;color:var(--ivory-primary);white-space:pre-wrap;word-break:break-all;">${escapeHtml(vm.dailyShareText)}</pre>
              <button type="button" class="ws-btn-obsidian" id="ws-copy-daily">${hudIcon('copy', 14)} COPY SHARE</button>
            </div>
          `
              : ''
          }

          ${leaderboardHtml}

          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
            ${
              duelShareUrl
                ? `
              <button
                type="button"
                class="ws-btn-obsidian"
                id="ws-btn-share-duel-link"
                data-duel-url="${escapeHtml(duelShareUrl)}"
                style="display:inline-flex;align-items:center;gap:7px;box-shadow:inset 3px 0 0 var(--gold-bright);color:var(--gold-bright);"
              >
                ${hudIcon('share', 14)}<span id="ws-share-duel-label">${escapeHtml(duelShareBtnLabel)}</span>
              </button>
            `
                : '<span></span>'
            }

            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:10px;">
              ${
                typeof vm.endlessCanContinueFloor === 'number' && (vm.endlessShieldsLeft ?? 0) > 0
                  ? `
                <button type="button" class="ws-btn-obsidian" id="ws-summary-hub">BANK HAUL &amp; EXTRACT</button>
                <button type="button" class="ws-btn-gold" id="ws-endless-deeper">
                  DESCEND TO FLOOR ${vm.endlessCanContinueFloor} (${hudIcon('shield', 13)}×${vm.endlessShieldsLeft}) ▶
                </button>
              `
                  : vm.retryMissionId
                    ? `
                <button type="button" class="ws-btn-obsidian" id="ws-summary-continue">RETURN TO MERIDIAN HUB</button>
                <button type="button" class="ws-btn-gold" id="ws-retry-mission">↻ RETRY MISSION ▶</button>
              `
                    : `
                <button type="button" class="ws-btn-gold" id="ws-summary-continue">
                  ${vm.flightForkPending ? 'CHART ACT I FLIGHT FORK ▶' : 'CONTINUE TO MERIDIAN HUB ▶'}
                </button>
              `
              }
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindTopBarEvents();

    let lbExpanded = false;
    this.root.querySelector('#ws-leaderboard-toggle')?.addEventListener('click', (ev) => {
      if (!lb) return;
      lbExpanded = !lbExpanded;
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      const rowsEl = this.root.querySelector<HTMLElement>('#ws-leaderboard-rows');
      if (rowsEl) {
        rowsEl.innerHTML = renderLeaderboardRows(lbExpanded);
      }
      const btn = ev.currentTarget as HTMLButtonElement;
      btn.textContent = lbExpanded ? 'Compact ▴' : 'Show Top 20 ▾';
    });

    this.root.querySelector('#ws-btn-share-duel-link')?.addEventListener('click', async () => {
      if (!duelShareUrl) return;
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      const shareTitle = `World's Smartest 1v1 Duel · ${vm.challengerName}`;
      const shareText =
        duelVerdict?.shareCaption ||
        `${vm.challengerName} scored ${vm.playerScore.toLocaleString('en-US')} PTS (${vm.correctCount}/${vm.totalCount}). Beat my exact Ghost splits!`;
      const lbl = this.root.querySelector<HTMLElement>('#ws-share-duel-label');
      try {
        await this.actions.onShareDuelLink?.(duelShareUrl, shareTitle, shareText);
        if (lbl) {
          lbl.textContent = '✓ Copied 1-Tap Duel Link!';
        }
      } catch {
        if (lbl) {
          lbl.textContent = '✓ Duel Link Ready!';
        }
      }
    });

    this.root.querySelector('#ws-copy-daily')?.addEventListener('click', (ev) => {
      if (!vm.dailyShareText) return;
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onCopyDailyShare(vm.dailyShareText);
      const btn = ev.currentTarget as HTMLButtonElement;
      btn.textContent = '✓ COPIED TO CLIPBOARD!';
    });

    this.root.querySelector('#ws-endless-deeper')?.addEventListener('click', () => {
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.actions.onContinueEndlessDescent();
    });

    this.root.querySelector('#ws-retry-mission')?.addEventListener('click', () => {
      if (!vm.retryMissionId) return;
      this.haptics.sightlineSnap();
      this.audio.playSfx('sightline_snap');
      this.actions.onRetryMission?.(vm.retryMissionId);
    });

    this.root.querySelector('#ws-summary-hub')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onSummaryPrimaryContinue();
    });

    this.root.querySelector('#ws-summary-continue')?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.actions.onSummaryPrimaryContinue();
    });
  }
}

export function buildDefaultCityCards(): CityCardState[] {
  return CAMPAIGN_DIFFICULTY_CURVE.map((stage, idx) => ({
    hub: stage.hub,
    order: idx + 1,
    city: stage.city,
    venueName: stage.venueName,
    difficultyLabel: stage.difficultyLabel,
    timerSec: stage.timerSec,
    unlocked: idx === 0,
    clearedMissions: 0,
    totalMissions: 5,
    missions: [1, 2, 3, 4, 5].map((slot) => ({
      id: `${stage.hub}_${slot}`,
      slot,
      title: `${stage.city} Round ${slot}`,
      subtitle: slot === 5 ? `Boss Showdown · ${stage.heroRelicTitle}` : stage.venueName,
      unlocked: idx === 0 && slot === 1,
      completed: false,
      isBoss: slot === 5,
    })),
  }));
}
