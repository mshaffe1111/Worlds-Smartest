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
  type BroadcastSettingsV7,
  type CampaignSaveStateV7,
  type CastIdV7,
  type CategoryIdV7,
  type ClassicTvTileTwistV7,
  type ClueRecordV7,
  type ContestantWaiverV7,
  type CoupRegimeIdV7,
  type DayJobIdV7,
  type DomainIdV7,
  type EpisodeBlueprintV7,
  type LienGoalIdV7,
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

const LIVING_COLOR_DOMAIN_RIBBONS_V7: Record<
  DomainIdV7,
  { readonly bg: string; readonly ink: string; readonly chipBg: string; readonly chipInk: string }
> = {
  SCI_TECH: {
    bg: 'linear-gradient(90deg, #164db8 0%, #2468e0 100%)',
    ink: '#ffffff',
    chipBg: 'rgba(7, 19, 33, 0.34)',
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
    chipBg: 'rgba(7, 19, 33, 0.3)',
    chipInk: '#fff7e6',
  },
  HIST_FACT: {
    bg: 'linear-gradient(90deg, #d9461a 0%, #f56838 100%)',
    ink: '#ffffff',
    chipBg: 'rgba(7, 19, 33, 0.3)',
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

const TV_TWIST_FLARE_SPECS_V7: Partial<Record<ClassicTvTileTwistV7, TvTwistFlareSpecV7>> = {
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
    chipBg: 'rgba(7, 19, 33, 0.34)',
    chipInk: '#fff7e6',
  },
  OPPONENT_CHOICE: {
    badge: '🎭 RIVAL',
    flareBanner: '🎭 OPPONENT’S CHOICE · BONUS MULT!',
    headerBg: 'linear-gradient(95deg, #ad1a56 0%, #e63b7a 52%, #b81d5c 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(7, 19, 33, 0.34)',
    chipInk: '#fff7e6',
  },
  MYSTERY_CURTAIN: {
    badge: '❓ CURTAIN',
    flareBanner: '❓ MYSTERY CURTAIN · PRIZE PLAY!',
    headerBg: 'linear-gradient(95deg, #008294 0%, #1e56c5 48%, #e63b7a 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(7, 19, 33, 0.36)',
    chipInk: '#fff7e6',
  },
  INSTANT_BARGAIN: {
    badge: '🔔 BARGAIN',
    flareBanner: '🔔 INSTANT BARGAIN · BONUS CHANCE!',
    headerBg: 'linear-gradient(95deg, #cc4114 0%, #ff6738 52%, #d9461a 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(7, 19, 33, 0.32)',
    chipInk: '#fff7e6',
  },
  SHOWCASE_BONUS: {
    badge: '★ BONUS',
    flareBanner: '★ 1966 STUDIO SHOWCASE BONUS ROUND!',
    headerBg: 'linear-gradient(95deg, #164db8 0%, #0096a6 55%, #f4a91f 100%)',
    headerInk: '#ffffff',
    chipBg: 'rgba(7, 19, 33, 0.36)',
    chipInk: '#fff7e6',
  },
};

// ----------------------------------------------------------------------------
// 2. Public Interfaces & Event Hooks for Master Engine Integration
// ----------------------------------------------------------------------------

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
  readonly tvTwist?: ClassicTvTileTwistV7;
  readonly isShowcaseFormat?: boolean;
  readonly showcaseFormatName?: string;
}

export interface PostAnswerTheaterSpecV7 {
  readonly resolution: ToyResolutionV7;
  readonly ahaFactoid: string;
  readonly economy: TurnEconomyBreakdownV7;
  readonly dwellMs?: number;
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
  private readonly turnKickerEl: HTMLSpanElement;
  private readonly turnNumEl: HTMLSpanElement;
  private readonly streakChipEl: HTMLSpanElement;
  private readonly rivalMedallionEl: HTMLDivElement;
  private readonly rivalEmotionTextEl: HTMLSpanElement;
  private readonly vuMeterWrapEl: HTMLDivElement;
  private readonly vuNeedleLineEl: SVGLineElement;

  private readonly rightWingDockEl: HTMLDivElement;
  private readonly zoomPillEl: HTMLDivElement;
  private readonly arrestSwitchBtn: HTMLButtonElement;
  private readonly censorPaddleBtn: HTMLButtonElement;
  private readonly zoomReadoutBtn: HTMLButtonElement;

  private readonly questionStageEl: HTMLDivElement;
  private readonly questionChassisEl: HTMLDivElement;
  private readonly twistFlareStripEl: HTMLDivElement;
  private readonly clueHeaderRowEl: HTMLDivElement;
  private readonly domainPillEl: HTMLSpanElement;
  private readonly clueStakesChipEl: HTMLSpanElement;
  private readonly clueTimerPillEl: HTMLSpanElement;
  private readonly clueTimerBarFillEl: HTMLDivElement;
  private readonly clueStemEl: HTMLParagraphElement;
  private readonly clueStakesMetaEl: HTMLDivElement;
  private readonly toyBayEl: HTMLDivElement;

  private readonly modalStageEl: HTMLDivElement;
  private readonly liveToastEl: HTMLDivElement;
  private readonly boardModeRibbonEl: HTMLDivElement;
  private readonly boardModeTagEl: HTMLSpanElement;
  private readonly boardModeRuleEl: HTMLSpanElement;

  private activeTimerHandle: number | null = null;
  private activeToastTimeout: number | null = null;
  private activeBoardModeFadeTimeout: number | null = null;
  private activeModalCleanup: (() => void) | null = null;
  private liveMatchScoreForShop: number | null = null;
  private currentRivalId: RivalIdV7 = 'CARMEN_DELGADO';
  private questionMaxCountdownSec = 30;
  private hasSyncedTopScoresOnce = false;
  private activeBoardModeBanner: { readonly modeTitle: string; readonly ruleSummary: string } | null = null;
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
    playerLabelRow.append(playerTag, this.streakChipEl, this.playerDeltaPopEl);
    this.playerDrumEl = document.createElement('span');
    this.playerDrumEl.className = 'ws7-solari-drum';
    this.renderSolariCharacters(this.playerDrumEl, '$0', '', false);
    playerStack.append(playerLabelRow, this.playerDrumEl);
    this.playerBoxEl.appendChild(playerStack);

    // Center Turn Dial
    const turnDial = document.createElement('div');
    turnDial.className = 'ws7-turn-pill';
    this.turnKickerEl = document.createElement('span');
    this.turnKickerEl.className = 'ws7-turn-kicker';
    this.turnKickerEl.textContent = 'TURN';
    this.turnNumEl = document.createElement('span');
    this.turnNumEl.className = 'ws7-turn-num';
    this.turnNumEl.textContent = '01/10';
    turnDial.append(this.turnKickerEl, this.turnNumEl);

    // CHAMPION Score (Tangerine Tally Bar + Split-Flap Drum + Circular Lens Avatar)
    this.rivalBoxEl = document.createElement('div');
    this.rivalBoxEl.className = 'ws7-solari-box';
    this.rivalBoxEl.dataset.side = 'rival';
    const rivalStack = document.createElement('div');
    rivalStack.className = 'ws7-score-stack';
    const rivalLabelRow = document.createElement('div');
    rivalLabelRow.className = 'ws7-score-label-row';
    const rivalTag = document.createElement('span');
    rivalTag.className = 'ws7-solari-tag';
    rivalTag.textContent = 'CHAMP';
    this.rivalDeltaPopEl = document.createElement('span');
    this.rivalDeltaPopEl.className = 'ws7-score-delta-pop';
    rivalLabelRow.append(rivalTag, this.rivalDeltaPopEl);
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
    this.rivalEmotionTextEl.className = 'ws7-rival-emotion-label';
    this.rivalEmotionTextEl.textContent = 'POISED';
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

    const rulesBtn = makeRibbonBtn(
      '?',
      'RULES',
      'rules',
      'How to Play — Board Rules, TV Twists & Scoring',
      false,
      true,
    );
    rulesBtn.addEventListener('click', () => {
      if (this.callbacks.onOpenHowToPlay) {
        this.callbacks.onOpenHowToPlay();
      } else {
        this.openHowToPlayModal();
      }
    });

    const propsBtn = makeRibbonBtn(
      '★',
      'PROPS',
      'props',
      'Studio Prop Trunk — Equip Passive Score Boosters',
      true,
    );
    propsBtn.addEventListener('click', () => {
      this.openPropTrunkModal(this.liveMatchScoreForShop !== null);
    });

    const soundBtn = makeRibbonBtn(
      '♪',
      'SOUND',
      'sound',
      'Sound Mixer, Accessibility & Studio Menu',
      false,
    );
    soundBtn.addEventListener('click', () => {
      this.openSettingsModal();
    });

    const hubBtn = makeRibbonBtn(
      '⌂',
      'HUB',
      'hub',
      'Return to 1966 Title Hub',
      true,
    );
    hubBtn.addEventListener('click', () => {
      if (this.callbacks.onReturnToTitleHub) {
        this.callbacks.onReturnToTitleHub();
      } else {
        this.showTitleHub();
      }
    });

    bugActions.append(rulesBtn, propsBtn, soundBtn, hubBtn);
    topBug.append(solariPair, this.vuMeterWrapEl, bugActions);
    this.topBugWrapEl.appendChild(topBug);

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
      'Tap when your Rival flashes LIVE TELL to bust Control Booth cheating (+$400)!';
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

    this.clueHeaderRowEl = document.createElement('div');
    this.clueHeaderRowEl.className = 'ws7-clue-header-row';
    this.clueHeaderRowEl.dataset.flare = 'false';

    this.domainPillEl = document.createElement('span');
    this.domainPillEl.className = 'ws7-domain-pill';

    const headerRight = document.createElement('div');
    headerRight.className = 'ws7-header-right-cluster';

    this.clueStakesChipEl = document.createElement('span');
    this.clueStakesChipEl.className = 'ws7-clue-stakes-chip';

    this.clueTimerPillEl = document.createElement('span');
    this.clueTimerPillEl.className = 'ws7-clue-timer-pill';
    this.clueTimerPillEl.textContent = '30s';

    headerRight.append(this.clueStakesChipEl, this.clueTimerPillEl);
    this.clueHeaderRowEl.append(this.domainPillEl, headerRight);

    const timerTrack = document.createElement('div');
    timerTrack.className = 'ws7-timer-bar-track';
    this.clueTimerBarFillEl = document.createElement('div');
    this.clueTimerBarFillEl.className = 'ws7-timer-bar-fill';
    this.clueTimerBarFillEl.dataset.phase = 'calm';
    timerTrack.appendChild(this.clueTimerBarFillEl);

    const clueBody = document.createElement('div');
    clueBody.className = 'ws7-clue-body';

    this.clueStemEl = document.createElement('p');
    this.clueStemEl.className = 'ws7-balanced-copy';

    this.clueStakesMetaEl = document.createElement('div');
    this.clueStakesMetaEl.className = 'ws7-clue-meta-line';

    clueBody.append(this.clueStemEl, this.clueStakesMetaEl);
    vellumPane.append(this.twistFlareStripEl, this.clueHeaderRowEl, timerTrack, clueBody);

    this.toyBayEl = document.createElement('div');
    this.toyBayEl.className = 'ws7-toy-bay';
    this.toyBayEl.id = 'ws7-toy-mount';

    this.questionChassisEl.append(vellumPane, this.toyBayEl);
    this.questionStageEl.appendChild(this.questionChassisEl);

    // ------------------------------------------------------------------------
    // 4. Sculpted Modal Stage & Broadcast Chyron Toast
    // ------------------------------------------------------------------------
    this.modalStageEl = document.createElement('div');
    this.modalStageEl.className = 'ws7-eye-stage ws7-hidden';
    this.modalStageEl.dataset.topBugOpen = 'false';

    this.liveToastEl = document.createElement('div');
    this.liveToastEl.className = 'ws7-live-toast-pill ws7-hidden';
    this.liveToastEl.dataset.tone = 'brass';
    this.liveToastEl.setAttribute('role', 'status');
    this.liveToastEl.setAttribute('aria-live', 'polite');

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
      this.liveToastEl,
      this.questionStageEl,
      this.modalStageEl,
    );
    this.host.appendChild(this.rootEl);

    this.bindPortraitAsset(this.rivalMedallionEl, 'CARMEN_DELGADO', 'POISED');
  }

  public setCallbacks(callbacks: BroadcastChromeCallbacksV7): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public dispose(): void {
    this.hideModalStage();
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

  public showTopBroadcastBug(
    visible: boolean = true,
    showRightWingControls: boolean = true,
  ): void {
    this.topBugWrapEl.classList.toggle('ws7-hidden', !visible);
    this.rightWingDockEl.classList.toggle('ws7-hidden', !(visible && showRightWingControls));
    this.modalStageEl.dataset.topBugOpen = visible ? 'true' : 'false';
    if (!visible) {
      this.liveToastEl.classList.add('ws7-hidden');
      this.hasSyncedTopScoresOnce = false;
    }
    this.syncBoardModeRibbonVisibility();
  }

  public setBoardModeBanner(
    banner: { readonly modeTitle: string; readonly ruleSummary: string } | null,
  ): void {
    if (this.activeBoardModeFadeTimeout !== null) {
      window.clearTimeout(this.activeBoardModeFadeTimeout);
      this.activeBoardModeFadeTimeout = null;
    }
    this.activeBoardModeBanner = banner;
    this.boardModeRibbonAutoHidden = false;
    if (banner) {
      this.boardModeTagEl.textContent = `★ ${banner.modeTitle}`;
      this.boardModeRuleEl.textContent = banner.ruleSummary;
      // Auto-fade bottom mode ribbon after 4.5s so the 3D stage & board stay 100% unobstructed!
      this.activeBoardModeFadeTimeout = window.setTimeout(() => {
        this.boardModeRibbonAutoHidden = true;
        this.activeBoardModeFadeTimeout = null;
        this.syncBoardModeRibbonVisibility();
      }, 4500);
    } else {
      this.boardModeTagEl.textContent = '';
      this.boardModeRuleEl.textContent = '';
    }
    this.syncBoardModeRibbonVisibility();
  }

  private syncBoardModeRibbonVisibility(): void {
    const topBugVisible = !this.topBugWrapEl.classList.contains('ws7-hidden');
    const questionOpen = !this.questionStageEl.classList.contains('ws7-hidden');
    const modalOpen = !this.modalStageEl.classList.contains('ws7-hidden');
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

    this.liveMatchScoreForShop = Math.max(0, Math.floor(snap.playerCash));
    this.animateSolariScore(
      this.playerRoller,
      this.playerDrumEl,
      this.playerBoxEl,
      this.playerDeltaPopEl,
      snap.playerCash,
      canAnimate,
    );
    this.animateSolariScore(
      this.rivalRoller,
      this.rivalDrumEl,
      this.rivalBoxEl,
      this.rivalDeltaPopEl,
      snap.rivalCash,
      canAnimate,
    );

    const totalTurns = snap.totalTurns ?? 10;
    const clampedTurn = Math.max(1, Math.min(totalTurns, snap.turnNumber));
    const compactHeader = typeof window !== 'undefined' && window.innerWidth <= 560;
    this.turnKickerEl.textContent = snap.isDailyBroadcast
      ? compactHeader
        ? 'DAILY'
        : `DAILY${snap.dailyEpisodeNumber ? ` #${snap.dailyEpisodeNumber}` : ''}`
      : 'TURN';
    this.turnNumEl.textContent = `${String(clampedTurn).padStart(2, '0')}/${String(totalTurns).padStart(2, '0')}`;

    const streakVal = Math.max(0, snap.streak);
    this.streakChipEl.dataset.active = streakVal >= 2 ? 'true' : 'false';
    this.streakChipEl.textContent = `🔥${streakVal}`;

    const sabotageLikely =
      clampedTurn >= 7 && snap.playerCash - snap.rivalCash >= 250;
    if (this.censorPaddleBtn.dataset.locked !== 'true') {
      this.censorPaddleBtn.dataset.sabotageActive = sabotageLikely ? 'true' : 'false';
    }

    const emotion = snap.rivalEmotion ?? 'POISED';
    if (this.currentRivalId !== snap.rivalId) {
      this.currentRivalId = snap.rivalId;
      this.bindPortraitAsset(this.rivalMedallionEl, snap.rivalId, emotion);
    } else {
      this.setRivalEmotion(emotion);
    }

    if (typeof snap.boothTellLive === 'boolean') {
      this.setBoothTellActive(snap.boothTellLive);
    }

    if (snap.boardModeBanner !== undefined) {
      this.setBoardModeBanner(snap.boardModeBanner);
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
    const spec = PORTRAIT_SPRITE_POSITIONS_V7[emotion];
    this.rivalMedallionEl.dataset.emotion = emotion;
    this.rivalMedallionEl.style.backgroundPosition = spec.bgPosition;
    this.rivalEmotionTextEl.textContent = spec.badgeLabel;
  }

  public setBoothTellActive(active: boolean): void {
    this.arrestSwitchBtn.dataset.tellLive = active ? 'true' : 'false';
    this.arrestSwitchBtn.innerHTML = active
      ? '<span>🚨 CHEAT LIVE!</span><span class="ws7-dock-sub">Tap for +$400</span>'
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
    el.dataset.emotion = emotion;

    const applySprite = (): void => {
      el.style.backgroundImage = `url("${profile.portraitAsset}")`;
      el.style.backgroundSize = '200% 200%';
      el.style.backgroundPosition = spec.bgPosition;
    };

    if (this.portraitLoadedCache.has(profile.portraitAsset)) {
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

  public showReleaseWaiver(): Promise<ContestantWaiverV7> {
    this.clearActiveTimer();
    return new Promise((resolve) => {
      let selectedJob: DayJobIdV7 = 'PATENT_CLERK';
      let selectedVice: StageViceIdV7 = 'SCOREBOARD_GRUDGE';
      let selectedGoal: LienGoalIdV7 = 'CLEAN_PURSE_250K';
      let remainingSec = 60;

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
      kicker.textContent = 'IBC STUDIO 6A · CONTESTANT SIGN-IN CLIPBOARD';
      const timerBadge = document.createElement('span');
      timerBadge.className = 'ws7-clue-timer-pill';
      timerBadge.textContent = '60s';
      topRow.append(kicker, timerBadge);

      const heading = document.createElement('h2');
      heading.className = 'ws7-display-title';
      heading.textContent = 'Pick Your Contestant Style Before Going Live';
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
        this.clearActiveTimer();
        const stamped = this.campaign.stampReleaseWaiver(
          selectedJob,
          selectedVice,
          selectedGoal,
        );
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
      sealBtn.textContent = 'SIGN & WALK INTO STUDIO\u00A06A →';
      sealBtn.addEventListener('click', finishWaiver);
      footer.appendChild(sealBtn);

      body.append(jobGroup, viceGroup, goalGroup);
      board.append(masthead, body, footer);
      this.mountModalContent(board);

      this.activeTimerHandle = window.setInterval(() => {
        remainingSec -= 1;
        timerBadge.textContent = `${Math.max(0, remainingSec)}s`;
        timerBadge.dataset.urgent = remainingSec <= 10 ? 'true' : 'false';
        if (remainingSec <= 0) {
          finishWaiver();
        }
      }, 1000);
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
      const friendlyWeakList = rivalProfile.weakCategories
        .map((c) => getFriendlyTvCategoryLabelV7(c))
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
        <div style="font-size:14px;color:#ffd56b;font-weight:700;">Weak Spots: ${friendlyWeakList}</div>
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
      window.setTimeout(() => {
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

  public openQuestionChassis(spec: QuestionChassisOpenSpecV7): HTMLDivElement {
    const activeTwist: ClassicTvTileTwistV7 =
      spec.tvTwist && spec.tvTwist !== 'NONE'
        ? spec.tvTwist
        : spec.isShowcaseFormat
          ? 'SHOWCASE_BONUS'
          : 'NONE';

    const flareSpec =
      activeTwist !== 'NONE' ? TV_TWIST_FLARE_SPECS_V7[activeTwist] : undefined;
    const domainRibbon = LIVING_COLOR_DOMAIN_RIBBONS_V7[spec.clue.domain];

    // Apply Dramatic 1966 Living Color Twist Flare to Monitor & Header!
    this.questionChassisEl.dataset.twist = activeTwist;
    this.clueHeaderRowEl.dataset.flare = flareSpec ? 'true' : 'false';

    if (flareSpec) {
      this.clueHeaderRowEl.style.background = flareSpec.headerBg;
      this.clueHeaderRowEl.style.color = flareSpec.headerInk;
      this.clueStakesChipEl.style.background = flareSpec.chipBg;
      this.clueStakesChipEl.style.color = flareSpec.chipInk;

      this.twistFlareStripEl.dataset.twist = activeTwist;
      this.twistFlareStripEl.textContent =
        activeTwist === 'SHOWCASE_BONUS' && spec.showcaseFormatName
          ? `★ STUDIO SHOWCASE · ${spec.showcaseFormatName.toUpperCase()} ★`
          : flareSpec.flareBanner;
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
    this.domainPillEl.textContent = `${friendlyCat} · $${spec.baseChips}`;

    // Keep header stakes chip razor-compact (NEVER duplicate the full twist banner title so 30s clock NEVER clips on 360–430px phones!)
    const chipParts: string[] = [];
    if (spec.liveMultPreview > 1.05) {
      chipParts.push(`${spec.liveMultPreview.toFixed(1)}×`);
    } else if (flareSpec) {
      chipParts.push(flareSpec.badge);
    }
    this.clueStakesChipEl.textContent = chipParts.join(' ');

    // Big, Arm's-Length Readable Clue Stem
    const formattedStem = formatOrphanProofCopyV7(spec.clue.stem);
    this.clueStemEl.textContent = formattedStem;
    this.clueStemEl.dataset.long = formattedStem.length > 155 ? 'true' : 'false';

    const bonusTags: string[] = [];
    if (spec.isWheelhouse) bonusTags.push('★ CHAMPION WEAK SPOT (+0.5× BONUS)');
    if (spec.hasAmberTruce) bonusTags.push('✦ STUDIO TRUCE BONUS (+0.35×)');
    this.clueStakesMetaEl.textContent = bonusTags.join('  ·  ');

    this.questionMaxCountdownSec = Math.max(
      1,
      spec.totalCountdownSeconds ?? spec.countdownSeconds,
    );
    this.updateQuestionCountdown(spec.countdownSeconds);

    this.toyBayEl.innerHTML = '';
    this.questionStageEl.classList.remove('ws7-hidden');
    this.syncBoardModeRibbonVisibility();
    return this.toyBayEl;
  }

  public updateQuestionCountdown(secondsRemaining: number): void {
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
    this.toyBayEl.innerHTML = '';
    this.syncBoardModeRibbonVisibility();
  }

  // --------------------------------------------------------------------------
  // Screen 5: 1.80s 4-Beat Post-Answer Theater Showcase
  // --------------------------------------------------------------------------

  public playPostAnswerTheater(spec: PostAnswerTheaterSpecV7): Promise<void> {
    this.closeQuestionChassis();
    const dwellMs = Math.max(1800, spec.dwellMs ?? 1800);

    return new Promise((resolve) => {
      const card = document.createElement('div');
      card.className = 'ws7-theater-card';
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

      const answerKicker = document.createElement('div');
      answerKicker.className = 'ws7-theater-answer-kicker';
      answerKicker.textContent = spec.resolution.isCorrect
        ? 'OFFICIAL STUDIO ANSWER'
        : 'THE CORRECT ANSWER WAS';

      const answerPlaque = document.createElement('div');
      answerPlaque.className = 'ws7-theater-answer';
      answerPlaque.style.opacity = '0';
      answerPlaque.style.transition = 'opacity 0.18s ease';
      answerPlaque.textContent = spec.resolution.trueAnswerDisplay;

      const ahaRibbon = document.createElement('div');
      ahaRibbon.className = 'ws7-aha-ribbon';
      ahaRibbon.style.opacity = '0';
      ahaRibbon.style.transition = 'opacity 0.2s ease';
      ahaRibbon.textContent = formatOrphanProofCopyV7(spec.ahaFactoid);

      creamBand.append(answerKicker, answerPlaque, ahaRibbon);

      const odoRow = document.createElement('div');
      odoRow.className = 'ws7-odometer-row';
      odoRow.style.opacity = '0';
      odoRow.style.transition = 'opacity 0.2s ease';

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

      const cashCell = document.createElement('span');
      cashCell.className = 'ws7-odometer-cell';
      cashCell.dataset.total = 'true';
      if (spec.economy.netCashDelta < 0) {
        cashCell.dataset.negative = 'true';
      } else if (spec.economy.netCashDelta === 0) {
        cashCell.dataset.zero = 'true';
      }
      cashCell.textContent = spec.economy.netCashDelta > 0 ? '+$0' : '$0';

      odoRow.append(chipsCell, multSign, multCell, eqSign, cashCell);

      const dwellTrack = document.createElement('div');
      dwellTrack.className = 'ws7-theater-dwell-track';
      const dwellBar = document.createElement('div');
      dwellBar.className = 'ws7-theater-dwell-bar';
      dwellTrack.appendChild(dwellBar);

      card.append(crest, creamBand, odoRow, dwellTrack);
      this.mountModalContent(card);

      window.setTimeout(() => {
        answerPlaque.style.opacity = '1';
      }, 90);
      window.setTimeout(() => {
        ahaRibbon.style.opacity = '1';
      }, 220);
      window.setTimeout(() => {
        odoRow.style.opacity = '1';
        const target = spec.economy.netCashDelta;
        const start = performance.now();
        const rollDuration = 420;
        const stepRoll = (now: number): void => {
          const p = Math.min(1, (now - start) / rollDuration);
          const cur = Math.round(target * p) || 0;
          cashCell.textContent =
            cur > 0
              ? `+$${cur.toLocaleString()}`
              : cur === 0
                ? '$0'
                : `-$${Math.abs(cur).toLocaleString()}`;
          if (p < 1) {
            window.requestAnimationFrame(stepRoll);
          }
        };
        window.requestAnimationFrame(stepRoll);
      }, 380);

      window.setTimeout(() => {
        this.hideModalStage();
        resolve();
      }, dwellMs);
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
      const hasUvRelic = this.campaign
        .getState()
        .equippedRelics.some((r) => r.relicId === 'relic_uv_blacklight_loupe');
      let uvOn = hasUvRelic;

      const card = document.createElement('div');
      card.className = 'ws7-canary-card';
      card.dataset.uv = 'false';

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
      kicker.textContent = `COMMERCIAL BREAK · ${CAST_PROFILES_V7[blueprint.canaryBroker].name.toUpperCase()} COURIER`;
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
        <svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true">
          <polygon points="40,6 68,18 46,38 28,22" fill="#e03e36" stroke="#fff7e6" stroke-width="1.3"/>
          <polygon points="68,18 74,50 48,46 46,38" fill="#c42b23" stroke="#fff7e6" stroke-width="1.3"/>
          <polygon points="74,50 44,74 36,50 48,46" fill="#eb4d44" stroke="#fff7e6" stroke-width="1.3"/>
          <polygon points="44,74 12,58 26,40 36,50" fill="#b3241d" stroke="#fff7e6" stroke-width="1.3"/>
          <polygon points="12,58 14,22 28,22 46,38 26,40" fill="#d9342b" stroke="#fff7e6" stroke-width="1.3"/>
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
        card.dataset.uv = uvOn ? 'true' : 'false';
        poisonStamp.classList.toggle('ws7-hidden', !uvOn);
      };

      const finishChoice = (choice: 'POCKET' | 'BURN'): void => {
        this.clearActiveTimer();
        this.campaign.recordCanaryChoice(choice, blueprint.canaryBroker);
        this.hideModalStage();
        resolve(choice);
      };

      const controlsRow = document.createElement('div');
      controlsRow.className = 'ws7-btn-row';

      const uvBtn = document.createElement('button');
      uvBtn.type = 'button';
      uvBtn.className = 'ws7-teal-btn';
      uvBtn.textContent = hasUvRelic ? 'TOGGLE UV CHECK' : 'CHECK FOR RIGGING';
      uvBtn.addEventListener('click', () => {
        uvOn = !uvOn;
        syncUvState();
      });

      const pocketBtn = document.createElement('button');
      pocketBtn.type = 'button';
      pocketBtn.className = 'ws7-primary-btn';
      pocketBtn.textContent = 'POCKET TIP (+$180)';
      pocketBtn.addEventListener('click', () => finishChoice('POCKET'));

      const burnBtn = document.createElement('button');
      burnBtn.type = 'button';
      burnBtn.className = 'ws7-crimson-btn';
      burnBtn.textContent = 'BURN ON AIR (+$125 CLEAN)';
      burnBtn.addEventListener('click', () => finishChoice('BURN'));

      controlsRow.append(uvBtn, pocketBtn, burnBtn);
      openedBody.append(noteBox, controlsRow);

      sealBtn.addEventListener('click', () => {
        if (shattered) return;
        shattered = true;
        sealWrap.classList.add('ws7-hidden');
        openedBody.classList.remove('ws7-hidden');
        syncUvState();
      });

      inner.append(topRow, title, sealWrap, openedBody);
      card.appendChild(inner);
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
  ): Promise<void> {
    this.clearActiveTimer();
    return new Promise((resolve) => {
      const renderCeremony = (): void => {
        const save = this.campaign.getState();
        const rivalName = CAST_PROFILES_V7[blueprint.rivalId].name;
        const panel = document.createElement('div');
        panel.className = 'ws7-mahogany-panel';

        const header = document.createElement('div');
        header.className = summary.wonMatch
          ? 'ws7-sheet-header ws7-ceremony-header-win'
          : 'ws7-sheet-header';
        header.style.background = summary.wonMatch
          ? 'linear-gradient(135deg, #007d8c 0%, #0b2d47 100%)'
          : 'linear-gradient(135deg, #b83b18 0%, #0b1d30 100%)';

        const kicker = document.createElement('div');
        kicker.className = 'ws7-subtitle-kicker';
        kicker.textContent = `${blueprint.code} OFFICIAL BROADCAST TALLY · ${
          summary.wonMatch ? '★ CHAMPION DEFEATED!' : 'COMEBACK POT BANKED'
        }`;

        const heading = document.createElement('h2');
        heading.className = 'ws7-display-title';
        heading.textContent = summary.wonMatch
          ? `Studio 6A Victory Over ${rivalName}!`
          : `${rivalName} Took the Hour — $${summary.grudgeBountyStoredOnLoss.toLocaleString()} Carried Over`;
        header.append(kicker, heading);

        const body = document.createElement('div');
        body.className = 'ws7-sheet-body';

        // Full-Bleed Pablo Ferro Score Showdown Split Banner
        const versus = document.createElement('div');
        versus.className = 'ws7-ceremony-versus';
        versus.innerHTML = `
          <div class="ws7-ceremony-side" data-side="player">
            <span style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;letter-spacing:0.08em;color:#ffd56b;">${summary.wonMatch ? '★ YOU (WINNER)' : 'YOU'}</span>
            <span class="ws7-ceremony-score-big">$${Math.floor(playerMatchScore).toLocaleString()}</span>
          </div>
          <div class="ws7-ceremony-side" data-side="rival">
            <span style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;letter-spacing:0.08em;color:#ffe3d3;">${!summary.wonMatch ? `★ ${rivalName.toUpperCase()}` : rivalName.toUpperCase()}</span>
            <span class="ws7-ceremony-score-big">$${Math.floor(rivalMatchScore).toLocaleString()}</span>
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
        body.append(versus, grid);

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
        footer.className = 'ws7-sheet-footer';

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'ws7-primary-btn';
        nextBtn.textContent =
          blueprint.isFinale && summary.wonMatch
            ? 'WATCH STAGE-10 FINALE EPILOGUE →'
            : summary.triggeredVaultDropNext
              ? 'ENTER 2:30 AM VAULT SHOWDOWN →'
              : `NEXT BROADCAST: ${formatEpisodeCodeV7(summary.nextEpisodeNumber)} →`;
        nextBtn.addEventListener('click', () => {
          if (blueprint.isFinale && summary.wonMatch) {
            void this.playEndingEpilogue(summary.unlockedEnding ?? undefined).then(resolve);
          } else {
            this.hideModalStage();
            resolve();
          }
        });

        footer.appendChild(nextBtn);
        panel.append(header, body, footer);
        this.mountModalContent(panel);
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
    return `<svg class="ws7-lien-svg" viewBox="0 0 136 136" aria-label="12-Segment Network Buyout Wheel"><circle cx="68" cy="68" r="64" fill="#0b1d30" stroke="#0096a6" stroke-width="2.5"/>${spokes.join('')}<circle cx="68" cy="68" r="21" fill="#102a43" stroke="#f4a91f" stroke-width="2.2"/><text x="68" y="73" text-anchor="middle" fill="#fff7e6" font-family="Jost, sans-serif" font-size="14" font-weight="900">${paidCount}/12</text></svg>`;
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
      if (onClose) onClose();
      else this.hideModalStage();
    };

    const panel = document.createElement('div');
    panel.className = 'ws7-mahogany-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'How to Play World’s Smartest');

    const header = this.createDismissibleSheetHeader(
      '1966 STUDIO 6A · CONTESTANT BRIEFING',
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
        <div style="font-size:15px;font-weight:700;color:#121a2b;margin-top:3px;">${this.activeBoardModeBanner.ruleSummary}</div>
      `;
      body.appendChild(modeCallout);
    }

    const rules: ReadonlyArray<{ title: string; copy: string }> = [
      {
        title: '1. TAP A TILE ON THE GIANT TOTE BOARD',
        copy: 'Pick any open dollar square ($150–$500) on the illuminated 3D board. You get a generous 30-second studio clock! Most questions are classic 4-choice trivia, mixed with special 1966 TV Showcase bonus formats.',
      },
      {
        title: '2. SIX CLASSIC 1966 BOARD MODES & TV TWISTS',
        copy: 'Different stages play by iconic 1960s rules—3-in-a-Row Jackpots, Coast-to-Coast Bridges, Eye Guess Memory Flashes, Concentration Prize Pairs, Curtain Deals & Classic Tote—plus 🔒 Locked Vaults, ⭐ 2× Secret Squares, 🎭 Opponent’s Choice, and 🔔 Instant Bargains!',
      },
      {
        title: '3. OUTBANK THE CHAMPION IN 10 TURNS',
        copy: 'You and the reigning Champion alternate turns. Target tiles marked ★ Weak Spot for +0.5× multipliers—and if the Champion misses, their square rebounds open with +$50 bonus cash for you to steal!',
      },
      {
        title: '4. WATCH FOR BACKSTAGE RIGGING & PROP BOOSTERS',
        copy: 'In later episodes, crooked Champions get secret cues from Control Booth A—tap the flashing red CATCH CHEAT alert for +$400! Visit the Prop Shop anytime to pack score-multiplying studio relics.',
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
      const propsQuickBtn = document.createElement('button');
      propsQuickBtn.type = 'button';
      propsQuickBtn.className = 'ws7-teal-btn';
      propsQuickBtn.textContent = '★ PROP SHOP';
      propsQuickBtn.addEventListener('click', () => {
        this.openPropTrunkModal(true);
      });
      footer.appendChild(propsQuickBtn);
    }

    const doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.className = 'ws7-primary-btn';
    doneBtn.textContent = 'GOT IT — BACK TO STAGE';
    doneBtn.addEventListener('click', dismiss);
    footer.appendChild(doneBtn);

    panel.append(header, body, footer);
    this.mountModalContent(panel, dismiss);
  }

  public openPropTrunkModal(
    allowLiveScoreBurn: boolean = false,
    onClose?: () => void,
  ): void {
    const dismiss = (): void => {
      if (onClose) onClose();
      else this.hideModalStage();
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
      this.mountModalContent(panel, dismiss);
    };
    render();
  }

  public openTrophyVaultModal(
    onClose?: () => void,
    catalog: readonly TrophySpecV7[] = TROPHY_CATALOG_V7,
  ): void {
    const dismiss = (): void => {
      if (onClose) onClose();
      else this.hideModalStage();
    };
    let filterSeason: 0 | 1 | 2 | 3 | 4 = 0;
    const unlockedInit = new Set(this.campaign.getState().unlockedTrophyIds);
    const firstEarned = catalog.find((c) => unlockedInit.has(c.trophyId));
    let selectedTrophyId = firstEarned?.trophyId ?? catalog[0]?.trophyId ?? 'trophy_s1_01';

    const render = (): void => {
      const unlocked = new Set(this.campaign.getState().unlockedTrophyIds);
      const activeSpec =
        catalog.find((c) => c.trophyId === selectedTrophyId) ?? catalog[0];
      const activeUnlocked = unlocked.has(activeSpec.trophyId);

      const panel = document.createElement('div');
      panel.className = 'ws7-mahogany-panel';
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

      // Full-Bleed 3D Turntable Showcase Band (ZERO inner border box!)
      const showcaseRow = document.createElement('div');
      showcaseRow.className = 'ws7-vault-3d-showcase';

      const stageBox = document.createElement('div');
      stageBox.className = 'ws7-vault-3d-stage';
      stageBox.id = 'ws7-vault-3d-stage';

      const plaqueCol = document.createElement('div');
      plaqueCol.className = 'ws7-vault-3d-plaque';
      const updateShowcasePlaque = (spec: TrophySpecV7, isOpen: boolean): void => {
        plaqueCol.innerHTML = `
          <div style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:${isOpen ? '#ffd56b' : '#bfd0e0'};">${isOpen ? '★ EARNED & LIT ON TURNTABLE' : 'LOCKED AWARD PREVIEW'} · SEASON 0${spec.season}</div>
          <div style="font-family:var(--ws7-font-showlogo);font-size:22px;color:#fff7e6;">${spec.name}</div>
          <div style="font-family:var(--ws7-font-broadcast);font-size:14.5px;color:#22c7d8;font-weight:800;">“${spec.engraving}”</div>
          <div style="font-size:14.5px;color:#d6e2ec;">${formatOrphanProofCopyV7(spec.unlockRuleText)}</div>
        `;
      };
      updateShowcasePlaque(activeSpec, activeUnlocked);
      showcaseRow.append(stageBox, plaqueCol);

      // Sticky Broadcast Tab Rail (Grid equal-columns — 0px horizontal tab clip on 375px & 768px!)
      const tabRail = document.createElement('div');
      tabRail.className = 'ws7-tab-rail';
      const tabs: ReadonlyArray<{ s: 0 | 1 | 2 | 3 | 4; shortLabel: string; longSuffix: string; title: string }> = [
        { s: 0, shortLabel: 'ALL', longSuffix: ' 36', title: 'All 36 Awards' },
        { s: 1, shortLabel: 'S1', longSuffix: ' · GOLD', title: 'Season 1 Awards' },
        { s: 2, shortLabel: 'S2', longSuffix: ' · ROAD', title: 'Season 2 Awards' },
        { s: 3, shortLabel: 'S3', longSuffix: ' · COUP', title: 'Season 3 Awards' },
        { s: 4, shortLabel: 'S4', longSuffix: ' · VIP', title: 'Season 4 Awards' },
      ];
      for (const t of tabs) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ws7-tab-btn';
        b.dataset.active = filterSeason === t.s ? 'true' : 'false';
        b.title = t.title;
        b.innerHTML = `<span>${t.shortLabel}<span class="ws7-tab-long">${t.longSuffix}</span></span>`;
        b.addEventListener('click', () => {
          filterSeason = t.s;
          render();
        });
        tabRail.appendChild(b);
      }

      // Flush Warm Cream Broadcast Honors Index
      const list = document.createElement('div');
      list.className = 'ws7-editorial-list';
      const shown = catalog.filter((c) => filterSeason === 0 || c.season === filterSeason);
      const rowNodes: HTMLDivElement[] = [];
      for (const tr of shown) {
        const isOpen = unlocked.has(tr.trophyId);
        const row = document.createElement('div');
        row.className = 'ws7-editorial-row';
        row.dataset.unlocked = isOpen ? 'true' : 'false';
        row.dataset.selected = tr.trophyId === selectedTrophyId ? 'true' : 'false';
        row.dataset.clickable = 'true';
        row.dataset.trophyId = tr.trophyId;
        row.innerHTML = `
          <div class="ws7-editorial-meta">
            <div style="font-family:var(--ws7-font-broadcast);font-size:14px;font-weight:900;color:${isOpen ? '#b86800' : '#0f3a4d'};">${isOpen ? '★ EARNED' : 'LOCKED'} · SEASON 0${tr.season}</div>
            <div style="font-size:16px;font-weight:800;color:#121a2b;">${tr.name} <span style="font-weight:600;color:#384660;">— “${tr.engraving}”</span></div>
            <div style="font-size:14px;color:#384660;font-weight:600;">${formatOrphanProofCopyV7(tr.unlockRuleText)}</div>
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

      const footer = document.createElement('div');
      footer.className = 'ws7-sheet-footer';
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'ws7-secondary-btn';
      closeBtn.textContent = 'CLOSE TROPHY VAULT';
      closeBtn.addEventListener('click', dismiss);
      footer.appendChild(closeBtn);

      body.append(showcaseRow, tabRail, list);
      panel.append(header, body, footer);
      this.mountModalContent(panel, dismiss);

      const cleanup = this.callbacks.onMountTrophyVault3D?.(
        stageBox,
        activeSpec.trophyId,
        activeUnlocked,
      );
      if (typeof cleanup === 'function') {
        this.activeModalCleanup = cleanup;
      }
    };
    render();
  }

  public openEpisodeJumpModal(onClose?: () => void): void {
    const dismiss = (): void => {
      if (onClose) onClose();
      else this.hideModalStage();
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
      this.mountModalContent(panel, dismiss);
    };
    render();
  }

  public openSettingsModal(onClose?: () => void): void {
    const dismiss = (): void => {
      if (onClose) onClose();
      else this.hideModalStage();
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
        key: 'masterVolume' | 'musicVolume' | 'sfxVolume' | 'crowdVolume' | 'ambienceVolume';
        label: string;
      }> = [
        { key: 'masterVolume', label: 'Master Level' },
        { key: 'musicVolume', label: 'Showband' },
        { key: 'sfxVolume', label: 'Bells & SFX' },
        { key: 'crowdVolume', label: 'Live Audience' },
        { key: 'ambienceVolume', label: 'Studio Room' },
      ];

      const faderBlock = document.createElement('div');
      faderBlock.className = 'ws7-fader-grid';
      for (const s of sliders) {
        const row = document.createElement('label');
        row.className = 'ws7-slider-row';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = s.label;

        const input = document.createElement('input');
        input.type = 'range';
        input.min = '0';
        input.max = '100';
        input.value = String(settings[s.key]);
        input.className = 'ws7-range-input';

        const valSpan = document.createElement('span');
        valSpan.style.fontFamily = 'var(--ws7-font-broadcast)';
        valSpan.style.fontSize = '15px';
        valSpan.style.color = '#ffd56b';
        valSpan.style.textAlign = 'right';
        valSpan.textContent = `${settings[s.key]}%`;

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

      toggleRow.append(
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
      toggleBand.appendChild(toggleRow);
      body.appendChild(toggleBand);

      const footer = document.createElement('div');
      footer.className = 'ws7-sheet-footer';

      if (this.liveMatchScoreForShop !== null) {
        const propBtn = document.createElement('button');
        propBtn.type = 'button';
        propBtn.className = 'ws7-teal-btn';
        propBtn.textContent = '★ PROP SHOP';
        propBtn.addEventListener('click', () => {
          this.openPropTrunkModal(true);
        });

        const hubBtn = document.createElement('button');
        hubBtn.type = 'button';
        hubBtn.className = 'ws7-secondary-btn';
        hubBtn.textContent = '⌂ TITLE HUB';
        hubBtn.addEventListener('click', () => {
          if (this.callbacks.onReturnToTitleHub) {
            this.callbacks.onReturnToTitleHub();
          } else {
            this.showTitleHub();
          }
        });

        footer.append(propBtn, hubBtn);
      }

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'ws7-primary-btn';
      closeBtn.textContent = 'DONE';
      closeBtn.addEventListener('click', dismiss);
      footer.appendChild(closeBtn);

      panel.append(header, body, footer);
      this.mountModalContent(panel, dismiss);
    };
    render();
  }

  public getSaveSnapshot(): CampaignSaveStateV7 {
    return this.campaign.getState();
  }

  // --------------------------------------------------------------------------
  // Internal Helpers
  // --------------------------------------------------------------------------

  private applySettingsAttributes(settings: BroadcastSettingsV7): void {
    this.rootEl.dataset.highContrast = settings.highContrastBadges ? 'true' : 'false';
    this.rootEl.dataset.reducedMotion = settings.reducedMotion ? 'true' : 'false';
  }

  private activeModalDismissCleanup: (() => void) | null = null;

  private mountModalContent(content: HTMLElement, onDismiss?: () => void): void {
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
        if (ev.key === 'Escape') {
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
    this.syncBoardModeRibbonVisibility();
  }

  private clearActiveTimer(): void {
    if (this.activeTimerHandle !== null) {
      window.clearInterval(this.activeTimerHandle);
      this.activeTimerHandle = null;
    }
  }
}
