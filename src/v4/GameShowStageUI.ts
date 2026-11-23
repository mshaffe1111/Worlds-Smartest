// ============================================================================
// WORLD'S SMARTEST v4.0 — Prime-Time TV Game-Show Stage UI & Modals
// Renders:
//  1. 3-Pillar Prime-Time Home Hub (ZERO database row counters!)
//  2. 8-Tier World Tour Campaign Map (42 viewers -> 1.4B Global Simulcast)
//  3. Interactive 4..6 Column Jeopardy! x Trivial Pursuit Gimmick Board
//  4. Power Play (Daily Double) Wager Modal
//  5. 6-Slice Curveball Wheel Spin Modal (custom inline SVG rotor)
//  6. Challenger Turn & Stat-Roast Banner / Modal
//  7. Pre-Board Category Pick & Ban Draft Modal
//  8. Post-Round Broadcast Headline & Shareable Results Card
//  9. How To Play Broadcast Guide Modal
// ============================================================================

import {
  WEDGE_CATALOG_V4,
  type BoardColumnV4,
  type BoardTileV4,
  type BriefingFormatModeV4,
  type ChallengerProfileV4,
  type ChallengerTurnActionV4,
  type QuestionFormatV4,
  type StageBoardStateV4,
  type TimerPaceModeV4,
  type WedgeColorId,
  type WheelSliceOutcome,
  type WorldTourEpisodeV4,
} from './contracts';
import { escapeHtml, iconSpan, type BroadcastIconName } from './FormatRenderers';

// ============================================================================
// FORMATTING & CUSTOM BROADCAST SVG WIDGETS
// ============================================================================

export const WEDGE_ORDER_V4: readonly WedgeColorId[] = [
  'GOLD_HISTORY',
  'SAPPHIRE_GEO',
  'EMERALD_SCIENCE',
  'MAGENTA_POP',
  'ORANGE_SPORTS',
  'VIOLET_ARTS',
];

export function formatAudienceCount(viewers: number): string {
  if (viewers >= 1_000_000_000) {
    const b = viewers / 1_000_000_000;
    return `${b >= 10 ? b.toFixed(0) : b.toFixed(1)}B`;
  }
  if (viewers >= 1_000_000) {
    const m = viewers / 1_000_000;
    return `${m >= 10 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (viewers >= 1_000) {
    const k = viewers / 1_000;
    return `${k >= 10 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return Math.max(0, Math.round(viewers)).toLocaleString('en-US');
}

export function formatPrizeUsd(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `$${Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  return `$${Math.max(0, Math.round(amount)).toLocaleString('en-US')}`;
}

/**
 * Renders the iconic 6-Slice Trivial Pursuit Crown Ring SVG widget.
 * Earned slices illuminate in their exact WEDGE_CATALOG_V4 color with golden rim!
 */
export function renderCrownWedgeRingSvg(
  earnedWedges: readonly WedgeColorId[],
  size = 62,
): string {
  const earnedSet = new Set(earnedWedges);
  const cx = 50;
  const cy = 50;
  const outerR = 44;
  const innerR = 16;

  const slices = WEDGE_ORDER_V4.map((wedgeId, i) => {
    const meta = WEDGE_CATALOG_V4[wedgeId];
    const startDeg = -90 + i * 60 + 3;
    const endDeg = -90 + (i + 1) * 60 - 3;
    const a1 = (startDeg * Math.PI) / 180;
    const a2 = (endDeg * Math.PI) / 180;

    const x1 = cx + outerR * Math.cos(a1);
    const y1 = cy + outerR * Math.sin(a1);
    const x2 = cx + outerR * Math.cos(a2);
    const y2 = cy + outerR * Math.sin(a2);
    const x3 = cx + innerR * Math.cos(a2);
    const y3 = cy + innerR * Math.sin(a2);
    const x4 = cx + innerR * Math.cos(a1);
    const y4 = cy + innerR * Math.sin(a1);

    const d = [
      `M ${x1.toFixed(1)} ${y1.toFixed(1)}`,
      `A ${outerR} ${outerR} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`,
      `L ${x3.toFixed(1)} ${y3.toFixed(1)}`,
      `A ${innerR} ${innerR} 0 0 0 ${x4.toFixed(1)} ${y4.toFixed(1)}`,
      'Z',
    ].join(' ');

    const isEarned = earnedSet.has(wedgeId);
    return `<path d="${d}" fill="${isEarned ? meta.accentHex : 'rgba(255,255,255,0.09)'}" stroke="${isEarned ? '#fff5cf' : 'rgba(255,255,255,0.22)'}" stroke-width="${isEarned ? 1.8 : 1.1}">
      <title>${escapeHtml(meta.shortLabel)}${isEarned ? ' (Earned)' : ' (Unearned)'}</title>
    </path>`;
  }).join('');

  return `
    <svg class="ws4-crown-ring" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${earnedSet.size} of 6 Crown Wedges earned">
      <circle cx="50" cy="50" r="47" fill="rgba(7,14,32,0.88)" stroke="rgba(245,196,81,0.56)" stroke-width="2.2"/>
      ${slices}
      <circle cx="50" cy="50" r="14" fill="#101d3b" stroke="#f5c451" stroke-width="2"/>
      <text x="50" y="54.5" text-anchor="middle" fill="#ffe082" font-family="JetBrains Mono, monospace" font-weight="800" font-size="13">${earnedSet.size}/6</text>
    </svg>
  `;
}

function renderPortraitHtml(
  name: string,
  portraitUrl: string | undefined,
  accentHex: string,
  sizePx = 56,
): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  return `
    <div class="ws4-avatar-frame" style="--ws4-avatar-accent:${accentHex};width:${sizePx}px;height:${sizePx}px;">
      ${
        portraitUrl
          ? `<img src="${escapeHtml(portraitUrl)}" alt="${escapeHtml(name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
             <span class="ws4-avatar-fallback" style="display:none;align-items:center;justify-content:center;width:100%;height:100%;">${escapeHtml(initials)}</span>`
          : `<span class="ws4-avatar-fallback">${escapeHtml(initials)}</span>`
      }
    </div>
  `;
}

function renderStarsHtml(stars: number, maxStars = 3, size = 14): string {
  let out = '<span class="ws4-stars-row" aria-label="' + stars + ' of ' + maxStars + ' stars">';
  for (let i = 1; i <= maxStars; i++) {
    const filled = i <= stars;
    out += `<span style="color:${filled ? '#f5c451' : 'rgba(255,255,255,0.22)'}">${iconSpan(filled ? 'star' : 'star_outline', size)}</span>`;
  }
  out += '</span>';
  return out;
}

function formatShortFormatTag(format: QuestionFormatV4): string {
  switch (format) {
    case 'MULTIPLE_CHOICE':
      return 'Classic';
    case 'MATCH_4':
      return 'Match 4';
    case 'SORT_4':
      return 'Sort 4';
    case 'MULTI_STRIKE':
      return 'Multi';
    case 'PINPOINT_DIAL':
      return 'Pinpoint';
    case 'CLUE_ESCALATOR':
      return '3-Clue';
    case 'VISUAL_SPOTTER':
      return 'Visual';
  }
}

// ============================================================================
// VIEW-MODEL & CALLBACK INTERFACES
// ============================================================================

export interface HomeHubViewModel {
  readonly currentEpisode: WorldTourEpisodeV4;
  readonly currentChallenger: ChallengerProfileV4 | null;
  readonly audienceWatching: number;
  readonly careerEarningsUsd: number;
  readonly playerRankTitle: string;
  readonly completedEpisodesCount: number;
  readonly totalEpisodesCount: number;
  readonly dailyBroadcastLabel: string;
  readonly dailyCompletedToday: boolean;
  readonly endlessBestStreak: number;
  readonly audioEnabled: boolean;
  readonly formatMode: BriefingFormatModeV4;
  readonly timerMode: TimerPaceModeV4;
  readonly latestHeadline?: string;
}

export interface HomeHubCallbacks {
  readonly onPlayWorldTour: () => void;
  readonly onOpenWorldTourMap: () => void;
  readonly onPlaySingleTopic: () => void;
  readonly onPlayDailyChallenge: () => void;
  readonly onPlayEndlessStreak: () => void;
  readonly onOpenStatsRadar: () => void;
  readonly onOpenTrophies: () => void;
  readonly onOpenSaves: () => void;
  readonly onToggleAudio: () => void;
  readonly onOpenHowToPlay?: () => void;
  readonly onChangeFormatMode?: (mode: BriefingFormatModeV4) => void;
  readonly onChangeTimerMode?: (mode: TimerPaceModeV4) => void;
}

export interface WorldTourTierGroupModel {
  readonly tierNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  readonly tierTitle: string;
  readonly venueName: string;
  readonly accentHex: string;
  readonly audienceRangeLabel: string;
  readonly topPurseUsd: number;
  readonly twistSummary: string;
  readonly challenger: ChallengerProfileV4;
  readonly episodes: readonly {
    readonly episode: WorldTourEpisodeV4;
    readonly unlocked: boolean;
    readonly stars: 0 | 1 | 2 | 3;
    readonly isCurrentNext: boolean;
  }[];
}

export interface WorldTourMapViewModel {
  readonly tiers: readonly WorldTourTierGroupModel[];
  readonly audienceWatching: number;
  readonly careerEarningsUsd: number;
  readonly totalStarsEarned: number;
  readonly maxStars: number;
}

export interface WorldTourMapCallbacks {
  readonly onBackHome: () => void;
  readonly onSelectEpisode: (episodeId: string) => void;
}

export interface StageBoardViewModel {
  readonly episode: WorldTourEpisodeV4;
  readonly board: StageBoardStateV4;
  readonly challenger: ChallengerProfileV4 | null;
  readonly hostLine: string;
  readonly currentStreak: number;
  readonly audioEnabled: boolean;
  readonly newlyUnlockedTileIds?: readonly string[];
  readonly lastChallengerAction?: ChallengerTurnActionV4 | null;
  readonly activeWheelBoostLabel?: string | null;
}

export interface StageBoardCallbacks {
  readonly onSelectTile: (tileId: string) => void;
  readonly onBackToMap: () => void;
  readonly onToggleAudio: () => void;
  readonly onOpenHowToPlay?: () => void;
}

export interface PowerPlayModalModel {
  readonly column: BoardColumnV4;
  readonly tile: BoardTileV4;
  readonly playerScore: number;
  readonly minWager: number;
  readonly maxWager: number;
  readonly hostLine?: string;
}

export interface PowerPlayModalCallbacks {
  readonly onLockWager: (wagerPoints: number) => void;
}

export interface CurveballWheelModalModel {
  readonly outcome: WheelSliceOutcome;
  readonly outcomeHeadline: string;
  readonly outcomeDescription: string;
}

export interface CurveballWheelModalCallbacks {
  readonly onSpinStart?: () => void;
  readonly onSpinComplete: (outcome: WheelSliceOutcome) => void;
}

export interface ChallengerTurnModalModel {
  readonly challenger: ChallengerProfileV4;
  readonly action: ChallengerTurnActionV4;
  readonly targetColumnTitle?: string;
}

export interface CategoryDraftItem {
  readonly colId: string;
  readonly wedgeId: WedgeColorId;
  readonly wittyTitle: string;
  readonly topicSubtitle: string;
  readonly state: 'AVAILABLE' | 'PLAYER_PICK' | 'RIVAL_PICK' | 'PLAYER_BAN' | 'RIVAL_BAN';
}

export interface CategoryDraftModalModel {
  readonly challenger: ChallengerProfileV4;
  readonly phaseTitle: string;
  readonly instruction: string;
  readonly pool: readonly CategoryDraftItem[];
  readonly canConfirm: boolean;
}

export interface CategoryDraftModalCallbacks {
  readonly onSelectDraftItem: (colId: string) => void;
  readonly onConfirmDraft: () => void;
}

export interface PostRoundSummaryModel {
  readonly episode: WorldTourEpisodeV4;
  readonly didWin: boolean;
  readonly starsEarned: 0 | 1 | 2 | 3;
  readonly playerScore: number;
  readonly rivalScore: number;
  readonly soloTargetScore: number;
  readonly hasActiveRival: boolean;
  readonly challenger: ChallengerProfileV4 | null;
  readonly earnedWedges: readonly WedgeColorId[];
  readonly accuracyPct: number;
  readonly bestStreak: number;
  readonly audienceDelta: number;
  readonly totalAudienceNow: number;
  readonly prizeEarnedUsd: number;
  readonly headlines: readonly string[];
  readonly hostClosingQuip: string;
  readonly rivalClosingLine?: string;
  readonly hasNextEpisode: boolean;
}

export interface PostRoundSummaryCallbacks {
  readonly onNextEpisode?: () => void;
  readonly onRematch: () => void;
  readonly onOpenWorldTourMap: () => void;
  readonly onBackHome: () => void;
}

// ============================================================================
// 6-SLICE CURVEBALL WHEEL METADATA (MATCHES `WheelSliceOutcome` 1:1)
// ============================================================================

interface WheelSliceVisualSpec {
  readonly outcome: WheelSliceOutcome;
  readonly shortLabel: string;
  readonly colorHex: string;
  readonly textHex: string;
}

const WHEEL_SLICES_V4: readonly WheelSliceVisualSpec[] = [
  { outcome: 'DOUBLE_POT', shortLabel: '2X NEXT TILE', colorHex: '#f5c451', textHex: '#181002' },
  { outcome: 'FREE_WEDGE_SHARD', shortLabel: 'FREE WEDGE', colorHex: '#b47cff', textHex: '#140826' },
  { outcome: 'STEAL_RIVAL_POINTS', shortLabel: 'STEAL +250', colorHex: '#f26498', textHex: '#210510' },
  { outcome: 'RECHARGE_LIFELINES', shortLabel: 'REFILL LIFE', colorHex: '#34d993', textHex: '#041f13' },
  { outcome: 'SHATTER_ALL_LOCKS', shortLabel: 'CRACK LOCKS', colorHex: '#46a8ff', textHex: '#04172b' },
  { outcome: 'HOT_SEAT_ALL_IN', shortLabel: 'ALL-IN 2X', colorHex: '#ff9347', textHex: '#240f02' },
];

// ============================================================================
// GAME SHOW STAGE UI CONTROLLER
// ============================================================================

export class GameShowStageUI {
  private readonly rootEl: HTMLElement;
  private readonly stageContainer: HTMLElement;
  private readonly modalContainer: HTMLElement;
  private spotlightTimerIds: number[] = [];

  constructor(rootEl: HTMLElement) {
    this.rootEl = rootEl;
    this.rootEl.innerHTML = '';
    this.rootEl.classList.add('ws4-stage-root');

    this.stageContainer = document.createElement('div');
    this.stageContainer.className = 'ws4-shell';
    this.rootEl.appendChild(this.stageContainer);

    this.modalContainer = document.createElement('div');
    this.modalContainer.setAttribute('data-ws4-modal-layer', 'true');
    this.rootEl.appendChild(this.modalContainer);
  }

  /**
   * Returns a clean mount element inside the stage shell (e.g. for FormatQuestionStageRenderer).
   */
  public getQuestionMountContainer(): HTMLElement {
    this.clearSpotlightTimers();
    this.stageContainer.innerHTML = '';
    const mount = document.createElement('div');
    mount.style.width = '100%';
    this.stageContainer.appendChild(mount);
    return mount;
  }

  public closeModal(): void {
    this.modalContainer.innerHTML = '';
  }

  public dispose(): void {
    this.clearSpotlightTimers();
    this.rootEl.innerHTML = '';
  }

  // ==========================================================================
  // 1. PRIME-TIME 3-PILLAR HOME HUB (ZERO DATABASE COUNTERS!)
  // ==========================================================================

  public renderHomeHub(model: HomeHubViewModel, callbacks: HomeHubCallbacks): void {
    this.clearSpotlightTimers();
    this.closeModal();
    const ep = model.currentEpisode;
    const tierPips = Array.from({ length: 8 }, (_, idx) => {
      const tNum = idx + 1;
      const cls =
        tNum < ep.tierNumber ? 'is-done' : tNum === ep.tierNumber ? 'is-current' : '';
      return `<span class="ws4-tier-pip ${cls}" title="Tier ${tNum}"></span>`;
    }).join('');

    this.stageContainer.innerHTML = `
      <header class="ws4-home-topbar">
        <div class="ws4-brand-lockup">
          <div class="ws4-brand-emblem">${iconSpan('crown', 23)}</div>
          <div>
            <h1 class="ws4-brand-title">WORLD'S SMARTEST</h1>
            <div class="ws4-brand-sub">The Global Prime-Time Search</div>
          </div>
        </div>

        <nav class="ws4-util-row" aria-label="Studio Tools">
          <button type="button" class="ws4-util-btn" data-home-action="stats">
            ${iconSpan('radar', 16)} <span>Stats &amp; Radar</span>
          </button>
          <button type="button" class="ws4-util-btn" data-home-action="trophies">
            ${iconSpan('trophy', 16)} <span>100 Trophies</span>
          </button>
          <button type="button" class="ws4-util-btn" data-home-action="saves">
            ${iconSpan('saves', 16)} <span>Saves</span>
          </button>
          <button type="button" class="ws4-util-btn" data-home-action="audio" data-active="${model.audioEnabled}">
            ${iconSpan(model.audioEnabled ? 'sound_on' : 'sound_off', 16)}
            <span>${model.audioEnabled ? 'Audio ON' : 'Audio OFF'}</span>
          </button>
          <button type="button" class="ws4-util-btn" data-home-action="howto">
            ${iconSpan('help', 16)} <span>How to Play</span>
          </button>
        </nav>
      </header>

      <section class="ws4-prestige-strip" aria-label="Broadcast Prestige">
        <div class="ws4-prestige-tile">
          <div class="ws4-prestige-icon">${iconSpan('eye', 20)}</div>
          <div>
            <div class="ws4-prestige-label">Live World Audience</div>
            <div class="ws4-prestige-value">${formatAudienceCount(model.audienceWatching)} Watching</div>
          </div>
        </div>
        <div class="ws4-prestige-tile">
          <div class="ws4-prestige-icon">${iconSpan('trophy', 20)}</div>
          <div>
            <div class="ws4-prestige-label">Career Prize Earnings</div>
            <div class="ws4-prestige-value">${formatPrizeUsd(model.careerEarningsUsd)}</div>
          </div>
        </div>
        <div class="ws4-prestige-tile">
          <div class="ws4-prestige-icon">${iconSpan('crown', 20)}</div>
          <div>
            <div class="ws4-prestige-label">Broadcast Standing</div>
            <div class="ws4-prestige-value" style="font-family:var(--ws4-font-sans);font-size:clamp(16px,1.9vw,21px);">${escapeHtml(model.playerRankTitle)}</div>
          </div>
        </div>
      </section>

      <section class="ws4-hero-card" aria-label="Play World Tour">
        <div>
          <div class="ws4-hero-kicker">
            <span class="ws4-pill ws4-pill-live"><span class="ws4-live-dot"></span> ON AIR · TIER ${ep.tierNumber} OF 8</span>
            <span class="ws4-pill ws4-pill-gold">${escapeHtml(ep.venueName)}</span>
          </div>
          <h2 class="ws4-hero-title">${escapeHtml(ep.title)}</h2>
          <p class="ws4-hero-subtitle">${escapeHtml(ep.rulesHookSummary)}</p>
          <div class="ws4-hero-meta-row">
            <span class="ws4-pill">${iconSpan('eye', 14)} ${formatAudienceCount(ep.baseAudienceWatching)} Watching</span>
            <span class="ws4-pill ws4-pill-gold">${iconSpan('trophy', 14)} ${formatPrizeUsd(ep.prizePurseUsd)} Purse</span>
            <span class="ws4-pill">${ep.boardCols}×${ep.boardRows} Stage Board · ${ep.maxTurns} Turns</span>
          </div>
          <div class="ws4-hero-actions">
            <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-home-action="play-tour">
              ${iconSpan('play', 18)}
              <span>PLAY WORLD TOUR</span>
            </button>
            <button type="button" class="ws4-btn ws4-btn-ghost ws4-btn-lg" data-home-action="tour-map">
              <span>All 8 Tiers (${model.completedEpisodesCount}/${model.totalEpisodesCount})</span>
            </button>
          </div>
        </div>

        <aside class="ws4-hero-spotlight-box">
          <div class="ws4-prestige-label">Stage Escalation · Tier ${ep.tierNumber} / 8</div>
          <div class="ws4-hero-tier-ladder" aria-label="Tier ${ep.tierNumber} of 8">${tierPips}</div>
          ${
            model.currentChallenger
              ? `<div class="ws4-hero-challenger-row">
                   ${renderPortraitHtml(model.currentChallenger.name, model.currentChallenger.avatarPortraitUrl, model.currentChallenger.accentHex, 58)}
                   <div style="min-width:0;">
                     <div style="font-size:11.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--ws4-gold-bright);">Next Challenger</div>
                     <div style="font-size:17px;font-weight:800;color:var(--ws4-ink-ivory);">${escapeHtml(model.currentChallenger.name)}</div>
                     <div style="font-size:13px;color:var(--ws4-ink-soft);line-height:1.28;">${escapeHtml(model.currentChallenger.title)}</div>
                   </div>
                 </div>`
              : `<div style="display:flex;align-items:center;gap:12px;">
                   <div class="ws4-prestige-icon" style="width:48px;height:48px;">${iconSpan('spotlight', 24)}</div>
                   <div>
                     <div style="font-size:11.5px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--ws4-gold-bright);">Open Stage Tryout</div>
                     <div style="font-size:16px;font-weight:800;">Target: ${ep.soloTargetScore.toLocaleString('en-US')} PTS</div>
                     <div style="font-size:13px;color:var(--ws4-ink-soft);">Beat the qualifying score to earn your TV seat!</div>
                   </div>
                 </div>`
          }
          ${
            model.latestHeadline
              ? `<div style="font-size:13px;color:var(--ws4-gold-bright);border-top:1px solid rgba(255,255,255,0.12);padding-top:8px;font-style:italic;">"${escapeHtml(model.latestHeadline)}"</div>`
              : ''
          }
        </aside>
      </section>

      <section class="ws4-mode-grid" aria-label="Game Modes">
        <button type="button" class="ws4-mode-card" style="--ws4-mode-accent:#46a8ff" data-home-action="single-topic">
          <div class="ws4-mode-head">
            <div class="ws4-mode-icon">${iconSpan('layers', 22)}</div>
            <span class="ws4-pill">12 Topics</span>
          </div>
          <h3 class="ws4-mode-title">Single Topic Trivia</h3>
          <p class="ws4-mode-desc">Pick any category you love — History, Science, Pop Culture, Sports, World Wonders — and play a crisp 7-format custom show.</p>
          <div class="ws4-mode-foot">
            <span>Choose Category</span>
            ${iconSpan('play', 14)}
          </div>
        </button>

        <button type="button" class="ws4-mode-card" style="--ws4-mode-accent:#f5c451" data-home-action="daily">
          <div class="ws4-mode-head">
            <div class="ws4-mode-icon">${iconSpan('calendar', 22)}</div>
            <span class="ws4-pill ${model.dailyCompletedToday ? 'ws4-pill-gold' : ''}">${escapeHtml(model.dailyCompletedToday ? 'Completed' : model.dailyBroadcastLabel)}</span>
          </div>
          <h3 class="ws4-mode-title">Daily Challenge</h3>
          <p class="ws4-mode-desc">One shared global broadcast every 24 hours. Everyone plays the exact same 7-question lineup — compare your score card!</p>
          <div class="ws4-mode-foot">
            <span>${model.dailyCompletedToday ? 'View / Replay Today' : 'Play Today’s Show'}</span>
            ${iconSpan('play', 14)}
          </div>
        </button>

        <button type="button" class="ws4-mode-card" style="--ws4-mode-accent:#f26498" data-home-action="endless">
          <div class="ws4-mode-head">
            <div class="ws4-mode-icon">${iconSpan('flame', 22)}</div>
            <span class="ws4-pill">Best: ${model.endlessBestStreak}</span>
          </div>
          <h3 class="ws4-mode-title">Endless Streak</h3>
          <p class="ws4-mode-desc">Rapid prime-time survival across all 7 interactive formats. Build your streak multiplier and see how far your nerve holds.</p>
          <div class="ws4-mode-foot">
            <span>Start Streak Run</span>
            ${iconSpan('play', 14)}
          </div>
        </button>
      </section>

      <div class="ws4-pref-strip" aria-label="Broadcast Preferences">
        <div class="ws4-pref-group">
          <span class="ws4-pref-label">Format Style</span>
          <div class="ws4-seg-group" role="group" aria-label="Question format style">
            <button type="button" class="ws4-seg-btn" data-set-format="VARIETY_MIX" aria-pressed="${model.formatMode === 'VARIETY_MIX'}">7-Format Mix</button>
            <button type="button" class="ws4-seg-btn" data-set-format="CLASSIC_4_ONLY" aria-pressed="${model.formatMode === 'CLASSIC_4_ONLY'}">Classic 4-Choice</button>
          </div>
        </div>
        <div class="ws4-pref-group">
          <span class="ws4-pref-label">Shot Clock</span>
          <div class="ws4-seg-group" role="group" aria-label="Shot clock mode">
            <button type="button" class="ws4-seg-btn" data-set-timer="STANDARD" aria-pressed="${model.timerMode === 'STANDARD'}">Standard (25–35s)</button>
            <button type="button" class="ws4-seg-btn" data-set-timer="RELAXED_UNTIMED" aria-pressed="${model.timerMode === 'RELAXED_UNTIMED'}">Relaxed ∞</button>
          </div>
        </div>
      </div>
    `;

    const bind = (action: string, fn?: () => void): void => {
      this.stageContainer
        .querySelector(`[data-home-action="${action}"]`)
        ?.addEventListener('click', () => fn?.());
    };

    bind('play-tour', callbacks.onPlayWorldTour);
    bind('tour-map', callbacks.onOpenWorldTourMap);
    bind('single-topic', callbacks.onPlaySingleTopic);
    bind('daily', callbacks.onPlayDailyChallenge);
    bind('endless', callbacks.onPlayEndlessStreak);
    bind('stats', callbacks.onOpenStatsRadar);
    bind('trophies', callbacks.onOpenTrophies);
    bind('saves', callbacks.onOpenSaves);
    bind('audio', callbacks.onToggleAudio);
    bind('howto', () => {
      if (callbacks.onOpenHowToPlay) callbacks.onOpenHowToPlay();
      else this.renderHowToPlayModal(() => this.closeModal());
    });

    this.stageContainer.querySelectorAll<HTMLButtonElement>('[data-set-format]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.setFormat as BriefingFormatModeV4;
        this.stageContainer.querySelectorAll('[data-set-format]').forEach((b) => {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        callbacks.onChangeFormatMode?.(mode);
      });
    });

    this.stageContainer.querySelectorAll<HTMLButtonElement>('[data-set-timer]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.setTimer as TimerPaceModeV4;
        this.stageContainer.querySelectorAll('[data-set-timer]').forEach((b) => {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        callbacks.onChangeTimerMode?.(mode);
      });
    });
  }

  // ==========================================================================
  // 2. 8-TIER WORLD TOUR CAMPAIGN MAP
  // ==========================================================================

  public renderWorldTourMap(model: WorldTourMapViewModel, callbacks: WorldTourMapCallbacks): void {
    this.clearSpotlightTimers();
    this.closeModal();

    this.stageContainer.innerHTML = `
      <header class="ws4-tour-header">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <button type="button" class="ws4-btn ws4-btn-ghost ws4-btn-sm" data-tour-back>
            ${iconSpan('back', 16)} <span>Home Studio</span>
          </button>
          <div>
            <h2 style="margin:0;font-family:var(--ws4-font-display);font-size:clamp(20px,2.8vw,28px);color:var(--ws4-gold-bright);">THE WORLD SEARCH TOUR</h2>
            <div style="font-size:13.5px;color:var(--ws4-ink-soft);">Start in front of 42 locals. Climb all 8 stages to 1.4 Billion live viewers.</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="ws4-pill">${iconSpan('eye', 14)} ${formatAudienceCount(model.audienceWatching)} Watching</span>
          <span class="ws4-pill ws4-pill-gold">${iconSpan('trophy', 14)} ${formatPrizeUsd(model.careerEarningsUsd)}</span>
          <span class="ws4-pill ws4-pill-gold">${iconSpan('star', 14)} ${model.totalStarsEarned} / ${model.maxStars}</span>
        </div>
      </header>

      <div class="ws4-tour-grid">
        ${model.tiers
          .map((tier) => {
            const anyUnlocked = tier.episodes.some((e) => e.unlocked);
            const hasCurrent = tier.episodes.some((e) => e.isCurrentNext);
            return `
              <article class="ws4-tier-card ${!anyUnlocked ? 'is-locked' : ''} ${hasCurrent ? 'is-current' : ''}" style="--ws4-tier-accent:${tier.accentHex}">
                <div class="ws4-tier-head">
                  <div style="min-width:0;">
                    <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
                      <span class="ws4-pill ws4-pill-gold">TIER ${tier.tierNumber}</span>
                      <span class="ws4-pill">${iconSpan('eye', 13)} ${escapeHtml(tier.audienceRangeLabel)}</span>
                      <span class="ws4-pill">${formatPrizeUsd(tier.topPurseUsd)}</span>
                    </div>
                    <h3 class="ws4-tier-name">${escapeHtml(tier.tierTitle)}</h3>
                    <div class="ws4-tier-venue">${escapeHtml(tier.venueName)} &middot; ${escapeHtml(tier.twistSummary)}</div>
                  </div>
                  ${renderPortraitHtml(tier.challenger.name, tier.challenger.avatarPortraitUrl, tier.challenger.accentHex, 54)}
                </div>

                <div style="font-size:13px;color:var(--ws4-ink-soft);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                  <span><strong style="color:var(--ws4-ink-ivory);">${escapeHtml(tier.challenger.name)}</strong> — ${escapeHtml(tier.challenger.title)}</span>
                </div>

                <div class="ws4-tier-episodes">
                  ${tier.episodes
                    .map(
                      (item) => `
                    <button
                      type="button"
                      class="ws4-ep-btn ${item.isCurrentNext ? 'is-next' : ''}"
                      data-select-episode="${escapeHtml(item.episode.episodeId)}"
                      ${item.unlocked ? '' : 'disabled'}
                    >
                      <div class="ws4-ep-top">
                        <span>EP ${item.episode.episodeInTier} · ${item.episode.boardCols}×${item.episode.boardRows}</span>
                        ${item.unlocked ? renderStarsHtml(item.stars, 3, 13) : `<span>${iconSpan('padlock', 13)}</span>`}
                      </div>
                      <div class="ws4-ep-title">${escapeHtml(item.episode.title)}</div>
                    </button>`,
                    )
                    .join('')}
                </div>
              </article>
            `;
          })
          .join('')}
      </div>
    `;

    this.stageContainer
      .querySelector('[data-tour-back]')
      ?.addEventListener('click', () => callbacks.onBackHome());

    this.stageContainer
      .querySelectorAll<HTMLButtonElement>('[data-select-episode]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const epId = btn.dataset.selectEpisode;
          if (epId) callbacks.onSelectEpisode(epId);
        });
      });
  }

  // ==========================================================================
  // 3. INTERACTIVE JEOPARDY x TRIVIAL PURSUIT STAGE BOARD
  // ==========================================================================

  public renderStageBoard(model: StageBoardViewModel, callbacks: StageBoardCallbacks): void {
    this.clearSpotlightTimers();
    const { board, episode, challenger } = model;
    const colsCount = board.columns.length;
    const unlockedSet = new Set(model.newlyUnlockedTileIds ?? []);

    // Group tiles by (row, col) cleanly so we render exact Jeopardy column headers followed by rows
    const maxRow = board.tiles.reduce((acc, t) => Math.max(acc, t.rowIndex), 0);
    const tileByKey = new Map<string, BoardTileV4>();
    board.tiles.forEach((t) => tileByKey.set(`${t.rowIndex}:${t.colIndex}`, t));

    const soloPct = Math.min(
      100,
      Math.round((board.playerScore / Math.max(1, board.soloTargetScore)) * 100),
    );

    const rightPanelHtml =
      board.hasActiveRival && challenger
        ? `
          <div class="ws4-score-card is-rival">
            <div style="min-width:0;">
              <div class="ws4-score-kicker">
                <span>${escapeHtml(challenger.name)}</span>
              </div>
              <div class="ws4-score-num">${board.rivalScore.toLocaleString('en-US')}</div>
              <div class="ws4-score-sub">
                <span>Wedges: ${board.rivalWedges.length}/6</span>
              </div>
            </div>
            ${renderPortraitHtml(challenger.name, challenger.avatarPortraitUrl, challenger.accentHex, 52)}
          </div>
        `
        : `
          <div class="ws4-score-card is-rival">
            <div class="ws4-solo-meter">
              <div class="ws4-score-kicker">
                <span>QUALIFYING TARGET</span>
              </div>
              <div class="ws4-score-num" style="color:var(--ws4-ink-ivory);">${board.soloTargetScore.toLocaleString('en-US')}</div>
              <div class="ws4-meter-track">
                <div class="ws4-meter-fill" style="width:${soloPct}%"></div>
              </div>
            </div>
          </div>
        `;

    const forcedBannerHtml = board.forcedTileId
      ? `
        <div class="ws4-forced-banner" role="alert">
          ${
            challenger
              ? renderPortraitHtml(challenger.name, challenger.avatarPortraitUrl, challenger.accentHex, 48)
              : `<div class="ws4-prestige-icon" style="width:46px;height:46px;">${iconSpan('spotlight', 24)}</div>`
          }
          <div style="min-width:0;flex:1;">
            <div class="ws4-forced-banner-title">${iconSpan('spotlight', 13)} FORCED STAGE PICK — NO CHOICE THIS TURN!</div>
            <div class="ws4-forced-banner-text">${escapeHtml(board.forcedReasonBanner || 'The studio spotlight locked onto your next clue! Tap the glowing tile.')}</div>
          </div>
        </div>
      `
      : '';

    const colHeadersHtml = board.columns
      .map((col) => {
        const wedge = WEDGE_CATALOG_V4[col.wedgeId];
        const isFrozen = col.frozenTurnsRemaining > 0;
        return `
          <div
            class="ws4-col-header ${isFrozen ? 'ws4-col-frozen' : ''}"
            style="--ws4-wedge-accent:${wedge.accentHex}"
            data-col-index="${col.colIndex}"
          >
            <div class="ws4-col-witty">${escapeHtml(col.wittyTitle)}</div>
            <div class="ws4-col-topic">${escapeHtml(col.topicSubtitle)}</div>
            ${
              isFrozen
                ? `<div class="ws4-col-flag">${iconSpan('frost', 12)} FROZEN (${col.frozenTurnsRemaining}T)</div>`
                : col.pickedBy === 'RIVAL'
                  ? `<div class="ws4-col-flag" style="color:#ffb3c1;">RIVAL PICK</div>`
                  : ''
            }
          </div>
        `;
      })
      .join('');

    const rowsHtml: string[] = [];
    for (let r = 0; r <= maxRow; r++) {
      for (let c = 0; c < colsCount; c++) {
        const tile = tileByKey.get(`${r}:${c}`);
        if (!tile) {
          rowsHtml.push(`<div></div>`);
          continue;
        }
        rowsHtml.push(this.renderSingleBoardTileHtml(tile, board.forcedTileId, unlockedSet.has(tile.tileId)));
      }
    }

    this.stageContainer.innerHTML = `
      <div class="ws4-host-chyron">
        <div class="ws4-host-chyron-left">
          <button type="button" class="ws4-btn ws4-btn-ghost ws4-btn-sm" data-board-action="back">
            ${iconSpan('back', 15)} <span>Tour</span>
          </button>
          <span class="ws4-host-tag">${iconSpan('mic', 12)} Max Sterling</span>
          <span style="white-space:normal;line-height:1.3;">${escapeHtml(model.hostLine)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span class="ws4-pill">${iconSpan('eye', 13)} ${formatAudienceCount(episode.baseAudienceWatching)}</span>
          ${model.activeWheelBoostLabel ? `<span class="ws4-pill ws4-pill-gold">${iconSpan('wheel', 13)} ${escapeHtml(model.activeWheelBoostLabel)}</span>` : ''}
          <button type="button" class="ws4-util-btn" style="min-height:36px;padding:5px 10px;" data-board-action="audio" aria-label="Toggle Audio">
            ${iconSpan(model.audioEnabled ? 'sound_on' : 'sound_off', 16)}
          </button>
          <button type="button" class="ws4-util-btn" style="min-height:36px;padding:5px 10px;" data-board-action="howto" aria-label="How to Play">
            ${iconSpan('help', 16)}
          </button>
        </div>
      </div>

      <section class="ws4-board-hud" aria-label="Broadcast Scoreboard">
        <div class="ws4-score-card">
          <div style="min-width:0;">
            <div class="ws4-score-kicker">
              <span>YOU</span>
              ${model.currentStreak >= 2 ? `<span class="ws4-pill ws4-pill-gold" style="padding:2px 7px;font-size:11px;">${iconSpan('flame', 12)} ${model.currentStreak} STREAK</span>` : ''}
            </div>
            <div class="ws4-score-num">${board.playerScore.toLocaleString('en-US')}</div>
            <div class="ws4-score-sub">
              <span>50/50: <strong>${board.lifelines5050Left}</strong></span>
              <span>Clue: <strong>${board.lifelinesHintLeft}</strong></span>
            </div>
          </div>
        </div>

        <div class="ws4-crown-center">
          <div class="ws4-crown-widget">
            ${renderCrownWedgeRingSvg(board.earnedWedges, 62)}
          </div>
          <span class="ws4-turn-pill">TURN ${Math.min(board.turnNumber + 1, board.maxTurns)} / ${board.maxTurns}</span>
        </div>

        ${rightPanelHtml}
      </section>

      ${forcedBannerHtml}

      <div class="ws4-board-scroll">
        <div class="ws4-board-grid" style="--ws4-board-cols:${colsCount}" data-ws4-board-grid>
          ${colHeadersHtml}
          ${rowsHtml.join('')}
        </div>
      </div>
    `;

    this.stageContainer
      .querySelector('[data-board-action="back"]')
      ?.addEventListener('click', () => callbacks.onBackToMap());
    this.stageContainer
      .querySelector('[data-board-action="audio"]')
      ?.addEventListener('click', () => callbacks.onToggleAudio());
    this.stageContainer
      .querySelector('[data-board-action="howto"]')
      ?.addEventListener('click', () => {
        if (callbacks.onOpenHowToPlay) callbacks.onOpenHowToPlay();
        else this.renderHowToPlayModal(() => this.closeModal());
      });

    this.stageContainer.querySelectorAll<HTMLButtonElement>('[data-tile-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const tileId = btn.dataset.tileId;
        if (tileId) callbacks.onSelectTile(tileId);
      });
    });
  }

  private renderSingleBoardTileHtml(
    tile: BoardTileV4,
    forcedTileId: string | null,
    justUnlocked: boolean,
  ): string {
    const wedge = WEDGE_CATALOG_V4[tile.wedgeId];
    const isForced = forcedTileId === tile.tileId;
    const dimmedByOtherForced = forcedTileId !== null && !isForced;
    const unlockClass = justUnlocked ? 'ws4-tile-unlocking' : '';

    if (tile.status === 'CLEARED_WIN') {
      return `
        <button type="button" class="ws4-tile ws4-tile-cleared-win" style="--ws4-wedge-accent:${wedge.accentHex}" data-tile-id="${escapeHtml(tile.tileId)}" disabled aria-label="${tile.pointValue} points cleared">
          ${iconSpan('check', 24)}
          <span class="ws4-tile-format" style="color:var(--ws4-emerald);">WON</span>
        </button>
      `;
    }

    if (tile.status === 'CLEARED_MISS') {
      return `
        <button type="button" class="ws4-tile ws4-tile-cleared-miss" style="--ws4-wedge-accent:${wedge.accentHex}" data-tile-id="${escapeHtml(tile.tileId)}" disabled aria-label="${tile.pointValue} points missed">
          ${iconSpan('cross', 20)}
          <span class="ws4-tile-format">PLAYED</span>
        </button>
      `;
    }

    if (tile.status === 'CLAIMED_BY_RIVAL') {
      return `
        <button type="button" class="ws4-tile ws4-tile-rival-claimed" style="--ws4-wedge-accent:${wedge.accentHex}" data-tile-id="${escapeHtml(tile.tileId)}" disabled aria-label="Claimed by Rival">
          ${iconSpan('shield', 20)}
          <span class="ws4-tile-format" style="color:#ff9fb0;">RIVAL</span>
        </button>
      `;
    }

    if (tile.status === 'PADLOCKED') {
      return `
        <button type="button" class="ws4-tile ws4-tile-padlocked" style="--ws4-wedge-accent:${wedge.accentHex}" data-tile-id="${escapeHtml(tile.tileId)}" disabled title="Solve an adjacent tile to shatter padlock" aria-label="Padlocked ${tile.pointValue} points">
          <span class="ws4-tile-chain-bars" aria-hidden="true"></span>
          ${iconSpan('padlock', 22)}
          <span class="ws4-tile-points">${tile.pointValue}</span>
          <span class="ws4-tile-format">LOCKED</span>
        </button>
      `;
    }

    if (tile.status === 'FOGGED') {
      return `
        <button type="button" class="ws4-tile ws4-tile-fogged" style="--ws4-wedge-accent:${wedge.accentHex}" data-tile-id="${escapeHtml(tile.tileId)}" disabled title="Solve a nearby tile to clear the fog" aria-label="Fogged mystery tile">
          ${iconSpan('fog', 24)}
          <span class="ws4-tile-format" style="color:#d2c4ff;">FOG</span>
        </button>
      `;
    }

    if (tile.status === 'FROZEN_BY_RIVAL') {
      return `
        <button type="button" class="ws4-tile ws4-tile-frozen" style="--ws4-wedge-accent:${wedge.accentHex}" data-tile-id="${escapeHtml(tile.tileId)}" disabled title="Frozen by Rival for 1 turn" aria-label="Frozen by Rival">
          ${iconSpan('frost', 22)}
          <span class="ws4-tile-points" style="color:#d2f4ff;">${tile.pointValue}</span>
          <span class="ws4-tile-format" style="color:#d2f4ff;">FROZEN</span>
        </button>
      `;
    }

    // OPEN Tile
    let twistBadgeHtml = '';
    if (tile.twist === 'CROWN_WEDGE') {
      twistBadgeHtml = `<span class="ws4-tile-twist-tag" title="Win to earn this Crown Wedge">${iconSpan('crown', 11)} WEDGE</span>`;
    } else if (tile.twist === 'RIVAL_BOUNTY') {
      twistBadgeHtml = `<span class="ws4-tile-twist-tag is-bounty" title="Beat to steal +300 from Rival">${iconSpan('target', 11)} BOUNTY</span>`;
    } else if (tile.twist === 'LIGHTNING_BLITZ') {
      twistBadgeHtml = `<span class="ws4-tile-twist-tag" title="Rapid-fire clue">${iconSpan('bolt', 11)} BLITZ</span>`;
    } else if (tile.twistRevealedToPlayer && tile.twist === 'POWER_PLAY') {
      twistBadgeHtml = `<span class="ws4-tile-twist-tag">${iconSpan('star', 11)} WAGER</span>`;
    } else if (tile.twistRevealedToPlayer && tile.twist === 'WHEEL_CURVEBALL') {
      twistBadgeHtml = `<span class="ws4-tile-twist-tag">${iconSpan('wheel', 11)} WHEEL</span>`;
    } else if (tile.twistRevealedToPlayer && tile.twist === 'SPOTLIGHT_SWEEP') {
      twistBadgeHtml = `<span class="ws4-tile-twist-tag">${iconSpan('spotlight', 11)} SPOT</span>`;
    }

    const classes = [
      'ws4-tile',
      unlockClass,
      isForced ? 'ws4-tile-forced' : '',
      dimmedByOtherForced ? 'ws4-tile-dimmed' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `
      <button
        type="button"
        class="${classes}"
        style="--ws4-wedge-accent:${wedge.accentHex}"
        data-tile-id="${escapeHtml(tile.tileId)}"
        ${dimmedByOtherForced ? 'disabled' : ''}
      >
        ${twistBadgeHtml}
        <span class="ws4-tile-points">${tile.pointValue}</span>
        <span class="ws4-tile-format">${escapeHtml(formatShortFormatTag(tile.format))}</span>
        ${isForced ? '<span class="ws4-tile-forced-badge">PLAY NOW</span>' : ''}
      </button>
    `;
  }

  /**
   * Sweeps a prime-time Spotlight Roulette beam across open tiles before landing on `targetTileId`.
   */
  public animateSpotlightRoulette(targetTileId: string, durationMs = 1500): Promise<void> {
    this.clearSpotlightTimers();
    const tiles = Array.from(
      this.stageContainer.querySelectorAll<HTMLButtonElement>('.ws4-tile:not(:disabled)'),
    );
    const targetEl = this.stageContainer.querySelector<HTMLButtonElement>(
      `[data-tile-id="${CSS.escape(targetTileId)}"]`,
    );
    if (!targetEl || tiles.length === 0) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const steps = 11;
      const stepMs = Math.max(70, Math.floor(durationMs / steps));
      let prevEl: HTMLElement | null = null;

      for (let i = 0; i < steps; i++) {
        const timerId = window.setTimeout(() => {
          if (prevEl) prevEl.classList.remove('ws4-tile-spotlight-sweep');
          const el = i === steps - 1 ? targetEl : tiles[i % tiles.length];
          el.classList.add('ws4-tile-spotlight-sweep');
          prevEl = el;
          if (i === steps - 1) {
            el.classList.add('ws4-tile-forced');
            resolve();
          }
        }, i * stepMs);
        this.spotlightTimerIds.push(timerId);
      }
    });
  }

  // ==========================================================================
  // 4. POWER PLAY (DAILY DOUBLE) WAGER MODAL
  // ==========================================================================

  public renderPowerPlayModal(
    model: PowerPlayModalModel,
    callbacks: PowerPlayModalCallbacks,
  ): void {
    const wedge = WEDGE_CATALOG_V4[model.column.wedgeId];
    const minW = Math.max(50, Math.round(model.minWager));
    const maxW = Math.max(minW, Math.round(model.maxWager));
    const step = maxW - minW >= 500 ? 50 : 25;
    let wager = Math.min(maxW, Math.max(minW, Math.round((minW + maxW) / 2 / step) * step));

    this.modalContainer.innerHTML = `
      <div class="ws4-modal-backdrop" role="dialog" aria-modal="true" aria-label="Power Play Wager">
        <div class="ws4-modal-card">
          <div style="text-align:center;">
            <span class="ws4-pill ws4-pill-gold">${iconSpan('star', 14)} POWER PLAY · DAILY DOUBLE</span>
          </div>
          <h2 class="ws4-modal-title">NAME YOUR STAKES</h2>
          <p class="ws4-modal-sub">
            Category: <strong style="color:${wedge.accentHex}">${escapeHtml(model.column.wittyTitle)}</strong> (${escapeHtml(model.column.topicSubtitle)})
            ${model.hostLine ? `<br/><em>"${escapeHtml(model.hostLine)}"</em>` : ''}
          </p>

          <div class="ws4-wager-readout" data-wager-readout>${wager.toLocaleString('en-US')} PTS</div>

          <input
            type="range"
            class="ws4-dial-range"
            data-wager-slider
            min="${minW}"
            max="${maxW}"
            step="${step}"
            value="${wager}"
            aria-label="Power Play Wager Amount"
          />

          <div class="ws4-dial-bounds">
            <span>Min: ${minW.toLocaleString('en-US')}</span>
            <span>Your Score: ${model.playerScore.toLocaleString('en-US')}</span>
            <span>Max: ${maxW.toLocaleString('en-US')}</span>
          </div>

          <div class="ws4-wager-presets">
            <button type="button" class="ws4-btn ws4-btn-ghost ws4-btn-sm" data-wager-pct="0.25">25%</button>
            <button type="button" class="ws4-btn ws4-btn-ghost ws4-btn-sm" data-wager-pct="0.5">50%</button>
            <button type="button" class="ws4-btn ws4-btn-ghost ws4-btn-sm" data-wager-pct="0.75">75%</button>
            <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-sm" data-wager-pct="1">ALL-IN</button>
          </div>

          <div class="ws4-wager-outcome-row">
            <div class="ws4-wager-outcome is-win">
              <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">If Right</div>
              <div style="font-family:var(--ws4-font-mono);font-size:22px;" data-wager-win>+${wager.toLocaleString('en-US')}</div>
            </div>
            <div class="ws4-wager-outcome is-miss">
              <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">If Wrong</div>
              <div style="font-family:var(--ws4-font-mono);font-size:22px;" data-wager-miss>-${wager.toLocaleString('en-US')}</div>
            </div>
          </div>

          <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-wager-confirm>
            <span>LOCK WAGER &amp; SEE CLUE</span>
            ${iconSpan('play', 16)}
          </button>
        </div>
      </div>
    `;

    const readoutEl = this.modalContainer.querySelector('[data-wager-readout]')!;
    const winEl = this.modalContainer.querySelector('[data-wager-win]')!;
    const missEl = this.modalContainer.querySelector('[data-wager-miss]')!;
    const sliderEl = this.modalContainer.querySelector<HTMLInputElement>('[data-wager-slider]')!;

    const syncWager = (val: number): void => {
      wager = Math.max(minW, Math.min(maxW, Math.round(val)));
      sliderEl.value = String(wager);
      readoutEl.textContent = `${wager.toLocaleString('en-US')} PTS`;
      winEl.textContent = `+${wager.toLocaleString('en-US')}`;
      missEl.textContent = `-${wager.toLocaleString('en-US')}`;
    };

    sliderEl.addEventListener('input', () => syncWager(Number(sliderEl.value)));

    this.modalContainer.querySelectorAll<HTMLButtonElement>('[data-wager-pct]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pct = Number(btn.dataset.wagerPct || 0.5);
        const computed = pct >= 1 ? maxW : minW + (maxW - minW) * pct;
        syncWager(Math.round(computed / step) * step);
      });
    });

    this.modalContainer.querySelector('[data-wager-confirm]')?.addEventListener('click', () => {
      this.closeModal();
      callbacks.onLockWager(wager);
    });
  }

  // ==========================================================================
  // 5. 6-SLICE CURVEBALL WHEEL SPIN MODAL (CUSTOM SVG WHEEL)
  // ==========================================================================

  public renderCurveballWheelModal(
    model: CurveballWheelModalModel,
    callbacks: CurveballWheelModalCallbacks,
  ): void {
    const targetIndex = Math.max(
      0,
      WHEEL_SLICES_V4.findIndex((s) => s.outcome === model.outcome),
    );
    // Slice i spans [i*60, (i+1)*60] deg clockwise from 12 o'clock; center is i*60 + 30.
    // To land slice center directly under 12 o'clock pointer (0 deg), rotate by 360*5 - (targetIndex*60 + 30).
    const landingRotationDeg = 360 * 5 + (360 - (targetIndex * 60 + 30));

    const wheelSvg = this.buildCurveballWheelSvg();

    this.modalContainer.innerHTML = `
      <div class="ws4-modal-backdrop" role="dialog" aria-modal="true" aria-label="Show Curveball Wheel">
        <div class="ws4-modal-card">
          <div style="text-align:center;">
            <span class="ws4-pill ws4-pill-gold">${iconSpan('wheel', 14)} CURVEBALL STAGE WHEEL</span>
          </div>
          <h2 class="ws4-modal-title">SPIN THE SHOW WHEEL!</h2>

          <div class="ws4-wheel-stage">
            <svg class="ws4-wheel-pointer" viewBox="0 0 36 42" aria-hidden="true">
              <polygon points="18,40 3,6 33,6" fill="#ffe082" stroke="#181002" stroke-width="2.5"/>
              <circle cx="18" cy="10" r="4" fill="#ffffff"/>
            </svg>
            <div class="ws4-wheel-rotor" data-wheel-rotor style="transform:rotate(0deg);">
              ${wheelSvg}
            </div>
          </div>

          <div class="ws4-wheel-result-box" data-wheel-result hidden>
            <h3 class="ws4-wheel-result-title">${escapeHtml(model.outcomeHeadline)}</h3>
            <p class="ws4-wheel-result-desc">${escapeHtml(model.outcomeDescription)}</p>
          </div>

          <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-wheel-spin-btn>
            ${iconSpan('wheel', 18)}
            <span>SPIN THE WHEEL</span>
          </button>

          <button type="button" class="ws4-btn ws4-btn-emerald ws4-btn-lg" data-wheel-continue-btn hidden>
            <span>CLAIM &amp; CONTINUE</span>
            ${iconSpan('play', 16)}
          </button>
        </div>
      </div>
    `;

    const rotorEl = this.modalContainer.querySelector<HTMLElement>('[data-wheel-rotor]')!;
    const spinBtn = this.modalContainer.querySelector<HTMLButtonElement>('[data-wheel-spin-btn]')!;
    const continueBtn = this.modalContainer.querySelector<HTMLButtonElement>('[data-wheel-continue-btn]')!;
    const resultBox = this.modalContainer.querySelector<HTMLElement>('[data-wheel-result]')!;

    let spun = false;
    spinBtn.addEventListener('click', () => {
      if (spun) return;
      spun = true;
      spinBtn.disabled = true;
      spinBtn.textContent = 'SPINNING...';
      callbacks.onSpinStart?.();

      window.requestAnimationFrame(() => {
        rotorEl.style.transform = `rotate(${landingRotationDeg}deg)`;
      });

      const finishTimer = window.setTimeout(() => {
        spinBtn.hidden = true;
        resultBox.hidden = false;
        continueBtn.hidden = false;
      }, 3350);
      this.spotlightTimerIds.push(finishTimer);
    });

    continueBtn.addEventListener('click', () => {
      this.closeModal();
      callbacks.onSpinComplete(model.outcome);
    });
  }

  private buildCurveballWheelSvg(): string {
    const cx = 160;
    const cy = 160;
    const r = 144;

    const wedges = WHEEL_SLICES_V4.map((slice, i) => {
      const startDeg = -90 + i * 60;
      const endDeg = startDeg + 60;
      const midDeg = startDeg + 30;
      const a1 = (startDeg * Math.PI) / 180;
      const a2 = (endDeg * Math.PI) / 180;
      const am = (midDeg * Math.PI) / 180;

      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2);
      const y2 = cy + r * Math.sin(a2);
      const tx = cx + r * 0.62 * Math.cos(am);
      const ty = cy + r * 0.62 * Math.sin(am);
      // Keep bottom-half slice labels right-side-up so every wedge reads effortlessly
      const rawRot = midDeg + 90;
      const labelRot = midDeg > 15 && midDeg < 165 ? rawRot + 180 : rawRot;

      const d = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;

      return `
        <path d="${d}" fill="${slice.colorHex}" stroke="#0b152c" stroke-width="3"/>
        <text
          x="${tx.toFixed(1)}"
          y="${ty.toFixed(1)}"
          fill="${slice.textHex}"
          font-family="Inter, sans-serif"
          font-size="12"
          font-weight="900"
          text-anchor="middle"
          dominant-baseline="middle"
          transform="rotate(${labelRot}, ${tx.toFixed(1)}, ${ty.toFixed(1)})"
        >${escapeHtml(slice.shortLabel)}</text>
      `;
    }).join('');

    const studs = Array.from({ length: 12 }, (_, idx) => {
      const ang = (idx * 30 * Math.PI) / 180;
      const sx = cx + 150 * Math.cos(ang);
      const sy = cy + 150 * Math.sin(ang);
      return `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3.4" fill="#fff5cc"/>`;
    }).join('');

    return `
      <svg viewBox="0 0 320 320" width="100%" height="100%" role="img" aria-label="6-Slice Game Show Curveball Wheel">
        <circle cx="160" cy="160" r="156" fill="#18264c" stroke="#f5c451" stroke-width="5"/>
        ${wedges}
        ${studs}
        <circle cx="160" cy="160" r="28" fill="#101d3b" stroke="#ffe082" stroke-width="4"/>
        <circle cx="160" cy="160" r="11" fill="#f5c451"/>
      </svg>
    `;
  }

  // ==========================================================================
  // 6. CHALLENGER TURN / STAT-ROAST MODAL BANNER
  // ==========================================================================

  public renderChallengerTurnModal(
    model: ChallengerTurnModalModel,
    onContinue: () => void,
  ): void {
    const { challenger, action } = model;
    const badgeMap: Record<ChallengerTurnActionV4['moveKind'], { label: string; icon: BroadcastIconName }> = {
      FORCE_WEAK_TILE: { label: 'FORCED YOUR WEAK CATEGORY', icon: 'spotlight' },
      FREEZE_FAVORITE_COLUMN: { label: 'FROZE YOUR FAVORITE COLUMN', icon: 'frost' },
      PLANT_BOUNTY: { label: 'PLANTED A RIVAL BOUNTY', icon: 'target' },
      CLAIM_TILE: {
        label: action.rivalSucceeded
          ? `RIVAL SCORED +${action.rivalPointsDelta.toLocaleString('en-US')} PTS`
          : 'RIVAL MISSED THEIR PICK!',
        icon: 'shield',
      },
    };
    const meta = badgeMap[action.moveKind];

    this.modalContainer.innerHTML = `
      <div class="ws4-modal-backdrop" role="dialog" aria-modal="true" aria-label="Challenger Turn">
        <div class="ws4-modal-card">
          <div style="display:flex;align-items:center;justify-content:center;gap:14px;">
            ${renderPortraitHtml(challenger.name, challenger.avatarPortraitUrl, challenger.accentHex, 76)}
            <div>
              <span class="ws4-pill ws4-pill-live">${iconSpan(meta.icon, 13)} ${meta.label}</span>
              <h2 style="margin:6px 0 2px;font-family:var(--ws4-font-display);font-size:24px;color:var(--ws4-ink-ivory);">${escapeHtml(challenger.name)}</h2>
              <div style="font-size:13.5px;color:var(--ws4-ink-soft);">${escapeHtml(challenger.title)}</div>
            </div>
          </div>

          <div class="ws4-host-bubble" style="background:rgba(242,92,110,0.14);border-color:rgba(242,92,110,0.48);">
            <span class="ws4-reveal-card-kicker" style="color:#ffc2ca;">${iconSpan('mic', 14)} On-Air Challenge</span>
            <p class="ws4-reveal-card-copy" style="font-size:clamp(17px,2.2vw,21px);font-weight:700;">"${escapeHtml(action.banterLine)}"</p>
          </div>

          ${
            model.targetColumnTitle
              ? `<div style="text-align:center;"><span class="ws4-pill ws4-pill-gold">Target Column: ${escapeHtml(model.targetColumnTitle)}</span></div>`
              : ''
          }

          <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-challenger-continue>
            <span>BACK TO THE BOARD</span>
            ${iconSpan('play', 16)}
          </button>
        </div>
      </div>
    `;

    this.modalContainer.querySelector('[data-challenger-continue]')?.addEventListener('click', () => {
      this.closeModal();
      onContinue();
    });
  }

  // ==========================================================================
  // 7. PRE-BOARD CATEGORY PICK & BAN DRAFT MODAL (TIER 5-8 BOSSES)
  // ==========================================================================

  public renderCategoryDraftModal(
    model: CategoryDraftModalModel,
    callbacks: CategoryDraftModalCallbacks,
  ): void {
    this.modalContainer.innerHTML = `
      <div class="ws4-modal-backdrop" role="dialog" aria-modal="true" aria-label="Category Draft">
        <div class="ws4-modal-card is-wide">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <div>
              <span class="ws4-pill ws4-pill-gold">${iconSpan('crown', 13)} BOSS STAGE DRAFT</span>
              <h2 class="ws4-modal-title" style="text-align:left;margin-top:6px;">${escapeHtml(model.phaseTitle)}</h2>
            </div>
            ${renderPortraitHtml(model.challenger.name, model.challenger.avatarPortraitUrl, model.challenger.accentHex, 56)}
          </div>
          <p class="ws4-modal-sub" style="text-align:left;">${escapeHtml(model.instruction)}</p>

          <div class="ws4-draft-grid">
            ${model.pool
              .map((item) => {
                const wedge = WEDGE_CATALOG_V4[item.wedgeId];
                const stateCls =
                  item.state === 'PLAYER_PICK' || item.state === 'RIVAL_PICK'
                    ? 'is-picked'
                    : item.state === 'PLAYER_BAN' || item.state === 'RIVAL_BAN'
                      ? 'is-banned'
                      : '';
                const badge =
                  item.state === 'PLAYER_PICK'
                    ? 'YOUR PICK'
                    : item.state === 'RIVAL_PICK'
                      ? 'RIVAL PICK'
                      : item.state === 'PLAYER_BAN'
                        ? 'YOU BANNED'
                        : item.state === 'RIVAL_BAN'
                          ? 'RIVAL BANNED'
                          : 'OPEN';
                return `
                  <button
                    type="button"
                    class="ws4-draft-chip ${stateCls}"
                    style="--ws4-wedge-accent:${wedge.accentHex}"
                    data-draft-col="${escapeHtml(item.colId)}"
                    ${item.state !== 'AVAILABLE' ? 'disabled' : ''}
                  >
                    <div>
                      <div style="font-size:16px;font-weight:800;">${escapeHtml(item.wittyTitle)}</div>
                      <div style="font-size:12.5px;color:${wedge.accentHex};font-weight:700;">${escapeHtml(item.topicSubtitle)}</div>
                    </div>
                    <span class="ws4-pill">${badge}</span>
                  </button>
                `;
              })
              .join('')}
          </div>

          <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-draft-confirm ${model.canConfirm ? '' : 'disabled'}>
            <span>LOCK STAGE BOARD</span>
            ${iconSpan('play', 16)}
          </button>
        </div>
      </div>
    `;

    this.modalContainer.querySelectorAll<HTMLButtonElement>('[data-draft-col]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const colId = btn.dataset.draftCol;
        if (colId) callbacks.onSelectDraftItem(colId);
      });
    });

    this.modalContainer.querySelector('[data-draft-confirm]')?.addEventListener('click', () => {
      this.closeModal();
      callbacks.onConfirmDraft();
    });
  }

  // ==========================================================================
  // 8. POST-ROUND BROADCAST HEADLINE & SHAREABLE RESULTS CARD
  // ==========================================================================

  public renderPostRoundSummary(
    model: PostRoundSummaryModel,
    callbacks: PostRoundSummaryCallbacks,
  ): void {
    this.clearSpotlightTimers();
    this.closeModal();

    const wedgeSummaryBlocks = WEDGE_ORDER_V4.map((w) =>
      model.earnedWedges.includes(w) ? '[W]' : '[ ]',
    ).join('');
    const shareText = [
      `WORLD'S SMARTEST — Tier ${model.episode.tierNumber}: ${model.episode.title}`,
      `${model.didWin ? 'STAGE VICTORY' : 'CHALLENGER HELD THE STAGE'} | Score: ${model.playerScore.toLocaleString('en-US')} PTS${
        model.hasActiveRival && model.challenger
          ? ` vs ${model.challenger.name} (${model.rivalScore.toLocaleString('en-US')})`
          : ` (Target ${model.soloTargetScore.toLocaleString('en-US')})`
      }`,
      `Accuracy: ${model.accuracyPct}% | Best Streak: ${model.bestStreak} | Crown Wedges: ${model.earnedWedges.length}/6 ${wedgeSummaryBlocks}`,
      `Audience Now Watching: ${formatAudienceCount(model.totalAudienceNow)}`,
    ].join('\n');

    this.stageContainer.innerHTML = `
      <section class="ws4-modal-card is-wide" style="max-width:960px;max-height:none;margin:0 auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <span class="ws4-pill ${model.didWin ? 'ws4-pill-gold' : 'ws4-pill-live'}">
            ${iconSpan(model.didWin ? 'trophy' : 'shield', 14)}
            <span>${model.didWin ? 'BROADCAST VICTORY!' : 'STAGE SETBACK — TRY AGAIN'}</span>
          </span>
          <div>${renderStarsHtml(model.starsEarned, 3, 22)}</div>
        </div>

        <h2 class="ws4-modal-title" style="text-align:left;">
          ${escapeHtml(model.episode.title)} — ${escapeHtml(model.episode.venueName)}
        </h2>

        <div class="ws4-summary-grid">
          <div class="ws4-summary-scorebox ${model.didWin ? 'is-winner' : ''}">
            <div class="ws4-prestige-label">Your Final Score</div>
            <div class="ws4-score-num" style="margin:6px 0;">${model.playerScore.toLocaleString('en-US')}</div>
            <div style="font-size:14px;color:var(--ws4-ink-soft);">
              Accuracy: <strong>${model.accuracyPct}%</strong> &middot; Best Streak: <strong>${model.bestStreak}</strong>
            </div>
          </div>

          <div class="ws4-summary-scorebox ${!model.didWin ? 'is-winner' : ''}">
            <div class="ws4-prestige-label">
              ${model.hasActiveRival && model.challenger ? escapeHtml(model.challenger.name) : 'Qualifying Score Target'}
            </div>
            <div class="ws4-score-num" style="margin:6px 0;color:${model.hasActiveRival ? '#ffb0be' : 'var(--ws4-ink-ivory)'};">
              ${(model.hasActiveRival ? model.rivalScore : model.soloTargetScore).toLocaleString('en-US')}
            </div>
            <div style="font-size:14px;color:var(--ws4-ink-soft);">
              ${model.didWin ? 'You beat the stage bar cleanly!' : 'Beat this score to advance!'}
            </div>
          </div>
        </div>

        <div class="ws4-prestige-strip">
          <div class="ws4-prestige-tile">
            <div class="ws4-prestige-icon">${iconSpan('eye', 20)}</div>
            <div>
              <div class="ws4-prestige-label">World Audience</div>
              <div class="ws4-prestige-value">${formatAudienceCount(model.totalAudienceNow)}</div>
              ${model.audienceDelta > 0 ? `<div style="font-size:12.5px;color:var(--ws4-emerald);font-weight:700;">+${formatAudienceCount(model.audienceDelta)} new viewers!</div>` : ''}
            </div>
          </div>

          <div class="ws4-prestige-tile">
            <div class="ws4-prestige-icon">${iconSpan('trophy', 20)}</div>
            <div>
              <div class="ws4-prestige-label">Prize Purse Won</div>
              <div class="ws4-prestige-value">${model.prizeEarnedUsd > 0 ? `+${formatPrizeUsd(model.prizeEarnedUsd)}` : '$0'}</div>
            </div>
          </div>

          <div class="ws4-prestige-tile">
            ${renderCrownWedgeRingSvg(model.earnedWedges, 48)}
            <div>
              <div class="ws4-prestige-label">Crown Wedges</div>
              <div class="ws4-prestige-value">${model.earnedWedges.length} / 6</div>
            </div>
          </div>
        </div>

        <div class="ws4-host-bubble">
          <span class="ws4-reveal-card-kicker">${iconSpan('mic', 14)} Max Sterling — Post-Show Desk</span>
          <p class="ws4-reveal-card-copy">${escapeHtml(model.hostClosingQuip)}</p>
          ${model.rivalClosingLine && model.challenger ? `<p class="ws4-reveal-card-copy" style="color:#ffc2ca;margin-top:4px;"><strong>${escapeHtml(model.challenger.name)}:</strong> "${escapeHtml(model.rivalClosingLine)}"</p>` : ''}
        </div>

        ${
          model.headlines.length > 0
            ? `<div class="ws4-headline-feed">
                 <div class="ws4-prestige-label">Breaking Broadcast Headlines</div>
                 ${model.headlines
                   .map((h) => `<div class="ws4-headline-item">${escapeHtml(h)}</div>`)
                   .join('')}
               </div>`
            : ''
        }

        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
            <span class="ws4-prestige-label">Broadcast Share Card</span>
            <button type="button" class="ws4-btn ws4-btn-ghost ws4-btn-sm" data-summary-share>
              ${iconSpan('share', 14)} <span data-share-label>Copy Share Card</span>
            </button>
          </div>
          <div class="ws4-share-preview">${escapeHtml(shareText)}</div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;">
          <button type="button" class="ws4-btn ws4-btn-ghost" data-summary-action="home">Home Studio</button>
          <button type="button" class="ws4-btn ws4-btn-ghost" data-summary-action="map">World Tour Map</button>
          <button type="button" class="ws4-btn" data-summary-action="rematch">Rematch</button>
          ${
            model.didWin && model.hasNextEpisode && callbacks.onNextEpisode
              ? `<button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-summary-action="next">
                   <span>NEXT EPISODE</span> ${iconSpan('play', 16)}
                 </button>`
              : ''
          }
        </div>
      </section>
    `;

    const shareBtn = this.stageContainer.querySelector<HTMLButtonElement>('[data-summary-share]');
    const shareLabel = this.stageContainer.querySelector<HTMLElement>('[data-share-label]');
    shareBtn?.addEventListener('click', () => {
      const done = (): void => {
        if (shareLabel) shareLabel.textContent = 'Copied to Clipboard!';
        window.setTimeout(() => {
          if (shareLabel) shareLabel.textContent = 'Copy Share Card';
        }, 2000);
      };
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        void navigator.clipboard.writeText(shareText).then(done).catch(done);
      } else {
        done();
      }
    });

    this.stageContainer
      .querySelector('[data-summary-action="home"]')
      ?.addEventListener('click', () => callbacks.onBackHome());
    this.stageContainer
      .querySelector('[data-summary-action="map"]')
      ?.addEventListener('click', () => callbacks.onOpenWorldTourMap());
    this.stageContainer
      .querySelector('[data-summary-action="rematch"]')
      ?.addEventListener('click', () => callbacks.onRematch());
    this.stageContainer
      .querySelector('[data-summary-action="next"]')
      ?.addEventListener('click', () => callbacks.onNextEpisode?.());
  }

  // ==========================================================================
  // 9. HOW TO PLAY QUICK BROADCAST GUIDE MODAL
  // ==========================================================================

  public renderHowToPlayModal(onClose: () => void): void {
    this.modalContainer.innerHTML = `
      <div class="ws4-modal-backdrop" role="dialog" aria-modal="true" aria-label="How to Play">
        <div class="ws4-modal-card is-wide">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <span class="ws4-pill ws4-pill-gold">${iconSpan('help', 14)} SHOW RULES</span>
            <button type="button" class="ws4-btn ws4-btn-ghost ws4-btn-sm" data-howto-close>Close</button>
          </div>
          <h2 class="ws4-modal-title" style="text-align:left;">HOW WORLD'S SMARTEST WORKS</h2>

          <div class="ws4-howto-grid">
            <div class="ws4-howto-card">
              <h4>1. Climb From 42 People to 1.4 Billion</h4>
              <p>Start at Oakridge Community Hall and win episodes across 8 escalating TV stages. Beat the Qualifying Target or outscore your live Challenger to advance.</p>
            </div>
            <div class="ws4-howto-card">
              <h4>2. Living Jeopardy × Trivial Pursuit Boards</h4>
              <p>Solve adjacent tiles to shatter Padlocks and clear Fog-of-War. Watch for Power Play wagers, 6-Slice Curveball Wheels, Spotlight forced picks, and Rival column freezes!</p>
            </div>
            <div class="ws4-howto-card">
              <h4>3. 7 Tactile Question Formats</h4>
              <p>Play Classic 4-Choice, Match-4 glowing wires, Sort-4 order cards, Multi-Strike &amp; Imposter rounds, Pinpoint Dials, 3-Clue Escalators, and Visual/Map Spotters.</p>
            </div>
            <div class="ws4-howto-card">
              <h4>4. Read-First Clock &amp; Honest Scoring</h4>
              <p>Every clue gives you 2 seconds to read before the 25–35s shot clock ticks (or switch to Relaxed ∞). Arm 2× Double Down BEFORE tapping for +2× win / -0.5× miss!</p>
            </div>
          </div>

          <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-howto-close-main>
            <span>GOT IT — BACK TO STAGE</span>
          </button>
        </div>
      </div>
    `;

    const close = (): void => {
      this.closeModal();
      onClose();
    };
    this.modalContainer.querySelector('[data-howto-close]')?.addEventListener('click', close);
    this.modalContainer.querySelector('[data-howto-close-main]')?.addEventListener('click', close);
  }

  private clearSpotlightTimers(): void {
    for (const id of this.spotlightTimerIds) {
      window.clearTimeout(id);
    }
    this.spotlightTimerIds = [];
  }
}
