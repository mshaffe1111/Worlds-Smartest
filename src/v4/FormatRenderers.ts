// ============================================================================
// WORLD'S SMARTEST v4.0 — 7-Format Interactive Broadcast Question Renderer
// Renders MULTIPLE_CHOICE, MATCH_4, SORT_4, MULTI_STRIKE, PINPOINT_DIAL,
// CLUE_ESCALATOR, and VISUAL_SPOTTER with surgical DOM updates (ZERO full DOM
// rebuilds on timer ticks!), giant arm's-length typography, and 0 OS emojis.
// ============================================================================

import {
  WEDGE_CATALOG_V4,
  type AnswerSubmissionV4,
  type EvaluatedAnswerV4,
  type QuestionCardV4,
  type TimerPaceModeV4,
  type WedgeColorId,
} from './contracts';

// ============================================================================
// SHARED CUSTOM INLINE SVG BROADCAST ICON LIBRARY (ZERO OS COLOR EMOJIS)
// ============================================================================

export type BroadcastIconName =
  | 'crown'
  | 'padlock'
  | 'padlock_open'
  | 'wheel'
  | 'spotlight'
  | 'flame'
  | 'eye'
  | 'trophy'
  | 'frost'
  | 'fog'
  | 'bolt'
  | 'star'
  | 'star_outline'
  | 'sound_on'
  | 'sound_off'
  | 'radar'
  | 'saves'
  | 'help'
  | 'check'
  | 'cross'
  | 'play'
  | 'arrow_up'
  | 'arrow_down'
  | 'grip'
  | 'mic'
  | 'sparkle'
  | 'target'
  | 'shield'
  | 'share'
  | 'back'
  | 'clock'
  | 'infinity'
  | 'clue'
  | 'split5050'
  | 'double2x'
  | 'calendar'
  | 'layers';

export function getBroadcastIconSvg(name: BroadcastIconName, size = 18): string {
  const s = `${size}`;
  const open = `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`;
  switch (name) {
    case 'crown':
      return `${open}<path d="M3 18h18l-1.5-10-4.5 4-3-6-3 6-4.5-4L3 18z" fill="currentColor" fill-opacity="0.24"/><path d="M3 20h18"/></svg>`;
    case 'padlock':
      return `${open}<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" fill-opacity="0.22"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.4" fill="currentColor"/></svg>`;
    case 'padlock_open':
      return `${open}<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" fill-opacity="0.22"/><path d="M8 11V7a4 4 0 0 1 7.6-1.6"/><circle cx="12" cy="16" r="1.4" fill="currentColor"/></svg>`;
    case 'wheel':
      return `${open}<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M12 3v6.8M12 14.2V21M4.2 7.5l5.9 3.4M13.9 13.1l5.9 3.4M19.8 7.5l-5.9 3.4M10.1 13.1l-5.9 3.4"/></svg>`;
    case 'spotlight':
      return `${open}<path d="M8 4h8l5 16H3L8 4z" fill="currentColor" fill-opacity="0.2"/><path d="M9 4h6"/><ellipse cx="12" cy="20" rx="7" ry="1.8"/></svg>`;
    case 'flame':
      return `${open}<path d="M12 2c.6 3.6-2.5 5.4-2.5 8.5 0 1.5 1.1 2.5 2.5 2.5 1.9 0 3.2-1.8 2.8-4.2 2.4 1.6 4.2 4.3 4.2 7.2a7 7 0 1 1-14 0c0-3.6 2.7-7.1 7-14z" fill="currentColor" fill-opacity="0.28"/></svg>`;
    case 'eye':
      return `${open}<path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.3"/></svg>`;
    case 'trophy':
      return `${open}<path d="M7 4h10v5a5 5 0 0 1-10 0V4z" fill="currentColor" fill-opacity="0.22"/><path d="M7 6H4a2 2 0 0 0 0 4h3M17 6h3a2 2 0 0 1 0 4h-3M12 14v5M8 20h8"/></svg>`;
    case 'frost':
      return `${open}<path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1M10 4l2 2 2-2M10 20l2-2 2 2M4 10l2 2-2 2M20 10l-2 2 2 2"/></svg>`;
    case 'fog':
      return `${open}<path d="M4 14h16M3 18h14M6 10a4 4 0 0 1 7.6-1.7A3.5 3.5 0 0 1 18.5 11H6a2.5 2.5 0 0 1 0-1z" fill="currentColor" fill-opacity="0.18"/></svg>`;
    case 'bolt':
      return `${open}<polygon points="13 2 4 14 11.5 14 10.5 22 20 10 12.5 10 13 2" fill="currentColor" fill-opacity="0.32"/></svg>`;
    case 'star':
      return `${open}<polygon points="12 2.5 15 8.8 22 9.7 16.9 14.5 18.2 21.4 12 18 5.8 21.4 7.1 14.5 2 9.7 9 8.8 12 2.5" fill="currentColor"/></svg>`;
    case 'star_outline':
      return `${open}<polygon points="12 2.5 15 8.8 22 9.7 16.9 14.5 18.2 21.4 12 18 5.8 21.4 7.1 14.5 2 9.7 9 8.8 12 2.5"/></svg>`;
    case 'sound_on':
      return `${open}<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.25"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.8 5.5a9.2 9.2 0 0 1 0 13"/></svg>`;
    case 'sound_off':
      return `${open}<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.2"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>`;
    case 'radar':
      return `${open}<polygon points="12 3 20 8 18 18 6 18 4 8 12 3" fill="currentColor" fill-opacity="0.16"/><polygon points="12 7 16.5 10 15.2 15.5 8.8 15.5 7.5 10 12 7"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`;
    case 'saves':
      return `${open}<path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4z" fill="currentColor" fill-opacity="0.16"/><path d="M8 4v5h7V4M8 21v-7h8v7"/></svg>`;
    case 'help':
      return `${open}<circle cx="12" cy="12" r="9"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.3 1c0 1.8-2.6 2.3-2.6 3.8"/><circle cx="12" cy="17.2" r="0.9" fill="currentColor"/></svg>`;
    case 'check':
      return `${open}<polyline points="20 6 9 17 4 12" stroke-width="2.6"/></svg>`;
    case 'cross':
      return `${open}<line x1="18" y1="6" x2="6" y2="18" stroke-width="2.4"/><line x1="6" y1="6" x2="18" y2="18" stroke-width="2.4"/></svg>`;
    case 'play':
      return `${open}<polygon points="6 4 20 12 6 20 6 4" fill="currentColor"/></svg>`;
    case 'arrow_up':
      return `${open}<polyline points="6 15 12 9 18 15" stroke-width="2.5"/></svg>`;
    case 'arrow_down':
      return `${open}<polyline points="6 9 12 15 18 9" stroke-width="2.5"/></svg>`;
    case 'grip':
      return `${open}<circle cx="9" cy="6" r="1.4" fill="currentColor"/><circle cx="15" cy="6" r="1.4" fill="currentColor"/><circle cx="9" cy="12" r="1.4" fill="currentColor"/><circle cx="15" cy="12" r="1.4" fill="currentColor"/><circle cx="9" cy="18" r="1.4" fill="currentColor"/><circle cx="15" cy="18" r="1.4" fill="currentColor"/></svg>`;
    case 'mic':
      return `${open}<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" fill-opacity="0.24"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"/></svg>`;
    case 'sparkle':
      return `${open}<path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3z" fill="currentColor" fill-opacity="0.28"/></svg>`;
    case 'target':
      return `${open}<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>`;
    case 'shield':
      return `${open}<path d="M12 3l8 3.5V12c0 4.8-3.4 8.2-8 9.5C7.4 20.2 4 16.8 4 12V6.5L12 3z" fill="currentColor" fill-opacity="0.22"/></svg>`;
    case 'share':
      return `${open}<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><line x1="8.4" y1="10.8" x2="15.6" y2="6.2"/><line x1="8.4" y1="13.2" x2="15.6" y2="17.8"/></svg>`;
    case 'back':
      return `${open}<polyline points="15 18 9 12 15 6" stroke-width="2.4"/><line x1="9" y1="12" x2="20" y2="12"/></svg>`;
    case 'clock':
      return `${open}<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`;
    case 'infinity':
      return `${open}<path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"/></svg>`;
    case 'clue':
      return `${open}<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.2 1 2.1h5c0-.9.3-1.6 1-2.1A6 6 0 0 0 12 3z" fill="currentColor" fill-opacity="0.22"/></svg>`;
    case 'split5050':
      return `${open}<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" fill-opacity="0.3"/></svg>`;
    case 'double2x':
      return `${open}<polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" fill="currentColor" fill-opacity="0.22"/><path d="M8 14.5l4-5 4 5"/></svg>`;
    case 'calendar':
      return `${open}<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    case 'layers':
      return `${open}<polygon points="12 3 21 8 12 13 3 8 12 3" fill="currentColor" fill-opacity="0.24"/><polyline points="3 13 12 18 21 13"/><polyline points="3 17.5 12 22 21 17.5"/></svg>`;
  }
}

export function iconSpan(name: BroadcastIconName, size = 18): string {
  return `<span class="ws4-icon" style="width:${size}px;height:${size}px">${getBroadcastIconSvg(name, size)}</span>`;
}

export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats numbers cleanly for Pinpoint Dial — NEVER adds commas to 4-digit years
 * (e.g. 1969 stays "1969", never "1,969").
 */
export function formatPinpointNumber(
  value: number,
  unitLabel: string,
  minVal: number,
  maxVal: number,
): string {
  const isLikelyYear =
    unitLabel.trim() === '' && minVal >= 500 && maxVal <= 2200 && Number.isInteger(value);
  if (isLikelyYear) {
    return String(Math.round(value));
  }
  const formatted = Number.isInteger(value)
    ? value.toLocaleString('en-US')
    : Number(value.toFixed(2)).toLocaleString('en-US');
  return unitLabel ? `${formatted} ${unitLabel}` : formatted;
}

// ============================================================================
// PUBLIC RENDERER INTERFACES
// ============================================================================

export interface QuestionStageContext {
  readonly card: QuestionCardV4;
  readonly tilePointValue: number;
  readonly timerMode: TimerPaceModeV4;
  readonly lifelines5050Left: number;
  readonly lifelinesHintLeft: number;
  readonly currentStreak: number;
  readonly activeWagerPoints?: number;
  readonly doublePotMultiplier?: number;
  readonly isLightningBlitz?: boolean;
  readonly isCrownWedgeTile?: boolean;
  readonly isRivalBountyTile?: boolean;
  readonly venueLabel?: string;
  readonly questionCounterLabel?: string;
}

export interface QuestionStageCallbacks {
  readonly onSubmit: (submission: AnswerSubmissionV4) => void | Promise<void>;
  readonly onUse5050?: () => void;
  readonly onUseHint?: () => void;
  readonly onDoubleDownToggle?: (armed: boolean) => void;
  readonly onEscalatorDealClue?: (cluesRevealed: 2 | 3) => void;
  readonly onNext?: () => void;
  readonly onInteractionFeedback?: (
    kind: 'tap' | 'pair' | 'reorder' | 'dial' | 'lock_in',
  ) => void;
}

export interface QuestionRevealPayload {
  readonly evaluation: EvaluatedAnswerV4;
  readonly hostQuip: string;
  readonly hostSpeakerName?: string;
  readonly funFactWhy?: string;
  readonly wedgeAwarded?: WedgeColorId | null;
  readonly nextButtonLabel?: string;
}

export interface QuestionClockTickState {
  readonly phase: 'READ_IN' | 'ACTIVE' | 'RELAXED' | 'LOCKED' | 'TIMEOUT';
  readonly remainingSec: number;
  readonly totalSec: number;
  readonly readInRemainingSec?: number;
}

// 4 high-contrast studio cable colors for Match-4 Bézier connectors
const MATCH4_LINK_COLORS = ['#f5c451', '#46a8ff', '#34d993', '#f26498'] as const;
const CHOICE_LETTERS = ['A', 'B', 'C', 'D'] as const;
const CLOCK_RING_CIRCUMFERENCE = 2 * Math.PI * 14; // r = 14 inside 34x34 viewBox

// ============================================================================
// FORMAT QUESTION STAGE RENDERER
// ============================================================================

export class FormatQuestionStageRenderer {
  private readonly mountEl: HTMLElement;
  private ctx: QuestionStageContext | null = null;
  private callbacks: QuestionStageCallbacks | null = null;
  private mountedAtMs = 0;
  private submitted = false;
  private revealed = false;

  // Lifelines & risk toggles
  private used5050 = false;
  private usedHint = false;
  private doubleDownArmed = false;

  // Surgical DOM refs (NEVER rebuilt on timer ticks!)
  private clockBoxEl: HTMLElement | null = null;
  private clockStatusEl: HTMLElement | null = null;
  private clockReadoutEl: HTMLElement | null = null;
  private clockRingFgEl: SVGCircleElement | null = null;
  private hintDrawerEl: HTMLElement | null = null;
  private hintTextEl: HTMLElement | null = null;
  private revealDockEl: HTMLElement | null = null;
  private btn5050El: HTMLButtonElement | null = null;
  private btnHintEl: HTMLButtonElement | null = null;
  private btnDoubleEl: HTMLButtonElement | null = null;

  // Format-specific live state & refs
  private choiceButtons: HTMLButtonElement[] = [];
  private chosenChoiceIndex: number | null = null;
  private lockPulseTimer: number | null = null;

  // MATCH_4 state
  private matchLinks = new Map<string, string>(); // leftPairId -> rightPairId
  private matchLinkColorByLeft = new Map<string, string>();
  private matchSelectedSide: 'left' | 'right' | null = null;
  private matchSelectedId: string | null = null;
  private matchArenaEl: HTMLElement | null = null;
  private matchSvgEl: SVGSVGElement | null = null;
  private matchLeftButtons = new Map<string, HTMLButtonElement>();
  private matchRightButtons = new Map<string, HTMLButtonElement>();
  private matchCountEl: HTMLElement | null = null;
  private matchLockBtn: HTMLButtonElement | null = null;
  private matchResizeObserver: ResizeObserver | null = null;
  private matchDragState: {
    side: 'left' | 'right';
    pairId: string;
    pointerId: number;
    startX: number;
    startY: number;
    currX: number;
    currY: number;
    moved: boolean;
  } | null = null;

  // SORT_4 state
  private sortOrderIds: string[] = [];
  private sortListEl: HTMLElement | null = null;
  private sortLockBtn: HTMLButtonElement | null = null;
  private sortDragIndex: number | null = null;

  // MULTI_STRIKE state
  private multiSelectedIds = new Set<string>();
  private multiButtons = new Map<string, HTMLButtonElement>();
  private multiCounterEl: HTMLElement | null = null;
  private multiLockBtn: HTMLButtonElement | null = null;

  // PINPOINT_DIAL state
  private dialValue = 0;
  private dialPanelEl: HTMLElement | null = null;
  private dialReadoutEl: HTMLElement | null = null;
  private dialRangeEl: HTMLInputElement | null = null;
  private dialLockBtn: HTMLButtonElement | null = null;
  private dialStepBtns: HTMLButtonElement[] = [];

  // CLUE_ESCALATOR state
  private escalatorRevealedCount: 1 | 2 | 3 = 1;
  private escalatorCards: HTMLElement[] = [];
  private escalatorPointsBadgeEl: HTMLElement | null = null;

  // Global cleanup listeners
  private cleanupFns: Array<() => void> = [];

  constructor(mountEl: HTMLElement) {
    this.mountEl = mountEl;
  }

  public mountQuestion(ctx: QuestionStageContext, callbacks: QuestionStageCallbacks): void {
    this.teardownActiveState();
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.mountedAtMs = performance.now();
    this.submitted = false;
    this.revealed = false;
    this.used5050 = false;
    this.usedHint = false;
    this.doubleDownArmed = false;

    const { card } = ctx;
    const wedge = WEDGE_CATALOG_V4[card.wedgeId];
    const effectiveBase = this.getEffectivePointBase();

    const formatBadge = this.getFormatDisplayLabel(card.format);
    const stakesTags: string[] = [];
    if (ctx.activeWagerPoints && ctx.activeWagerPoints > 0) {
      stakesTags.push(`<span class="ws4-pill ws4-pill-gold">${iconSpan('star', 13)} POWER PLAY · ${ctx.activeWagerPoints.toLocaleString('en-US')} PTS</span>`);
    }
    if (ctx.isCrownWedgeTile) {
      stakesTags.push(`<span class="ws4-pill ws4-pill-gold">${iconSpan('crown', 13)} CROWN WEDGE</span>`);
    }
    if (ctx.isRivalBountyTile) {
      stakesTags.push(`<span class="ws4-pill ws4-pill-live">${iconSpan('target', 13)} RIVAL BOUNTY</span>`);
    }
    if (ctx.isLightningBlitz) {
      stakesTags.push(`<span class="ws4-pill ws4-pill-gold">${iconSpan('bolt', 13)} LIGHTNING BLITZ</span>`);
    }
    if (ctx.doublePotMultiplier && ctx.doublePotMultiplier > 1) {
      stakesTags.push(`<span class="ws4-pill ws4-pill-gold">${iconSpan('wheel', 13)} ${ctx.doublePotMultiplier}X WHEEL POT</span>`);
    }

    const initialPhase =
      ctx.timerMode === 'RELAXED_UNTIMED'
        ? 'RELAXED'
        : card.readInGraceSec > 0
          ? 'READ_IN'
          : 'ACTIVE';
    const initialStatus =
      initialPhase === 'RELAXED'
        ? 'RELAXED PACE'
        : initialPhase === 'READ_IN'
          ? 'READING CLUE...'
          : 'SHOT CLOCK';
    const initialReadout =
      initialPhase === 'RELAXED'
        ? '∞'
        : `${Math.ceil(card.recommendedSec)}s`;

    this.mountEl.innerHTML = `
      <div class="ws4-question-stage" style="--ws4-wedge-accent: ${wedge.accentHex}">
        <div class="ws4-q-topbar">
          <div class="ws4-q-meta">
            <span class="ws4-wedge-chip">
              <span class="ws4-wedge-dot"></span>
              <span>${escapeHtml(card.categoryLabel)}</span>
            </span>
            ${card.wittyHeader ? `<span class="ws4-witty-header">${escapeHtml(card.wittyHeader)}</span>` : ''}
            <span class="ws4-pill">${escapeHtml(formatBadge)}</span>
            ${ctx.questionCounterLabel ? `<span class="ws4-pill">${escapeHtml(ctx.questionCounterLabel)}</span>` : ''}
            <span class="ws4-points-badge" data-ws4-points-badge>${effectiveBase.toLocaleString('en-US')} PTS</span>
            ${stakesTags.join('')}
          </div>

          <div class="ws4-clock-box" data-phase="${initialPhase}" role="timer" aria-live="off">
            <svg class="ws4-clock-ring" viewBox="0 0 34 34" aria-hidden="true">
              <circle class="ws4-clock-ring-bg" cx="17" cy="17" r="14"></circle>
              <circle
                class="ws4-clock-ring-fg"
                cx="17"
                cy="17"
                r="14"
                stroke-dasharray="${CLOCK_RING_CIRCUMFERENCE.toFixed(2)}"
                stroke-dashoffset="0"
              ></circle>
            </svg>
            <div class="ws4-clock-text-col">
              <span class="ws4-clock-status">${initialStatus}</span>
              <span class="ws4-clock-readout">${initialReadout}</span>
            </div>
          </div>
        </div>

        <section class="ws4-prompt-card" aria-label="Question Prompt">
          <h2 class="ws4-q-prompt">${escapeHtml(card.prompt)}</h2>
          <div class="ws4-format-instruction" data-ws4-instruction hidden></div>
          <div class="ws4-hint-drawer" data-ws4-hint-drawer role="status">
            ${iconSpan('clue', 20)}
            <div>
              <strong style="color:var(--ws4-cyan);text-transform:uppercase;font-size:12px;letter-spacing:0.08em;display:block;margin-bottom:2px;">Studio Clue</strong>
              <span data-ws4-hint-text>${escapeHtml(card.helpfulHint)}</span>
            </div>
          </div>
        </section>

        <div class="ws4-format-body" data-ws4-format-body></div>

        <section class="ws4-reveal-dock" data-ws4-reveal-dock aria-live="polite"></section>
      </div>
    `;

    // Cache surgical DOM refs ONCE
    this.clockBoxEl = this.mountEl.querySelector('.ws4-clock-box');
    this.clockStatusEl = this.mountEl.querySelector('.ws4-clock-status');
    this.clockReadoutEl = this.mountEl.querySelector('.ws4-clock-readout');
    this.clockRingFgEl = this.mountEl.querySelector('.ws4-clock-ring-fg');
    this.hintDrawerEl = this.mountEl.querySelector('[data-ws4-hint-drawer]');
    this.hintTextEl = this.mountEl.querySelector('[data-ws4-hint-text]');
    this.revealDockEl = this.mountEl.querySelector('[data-ws4-reveal-dock]');
    this.escalatorPointsBadgeEl = this.mountEl.querySelector('[data-ws4-points-badge]');

    const bodyEl = this.mountEl.querySelector('[data-ws4-format-body]') as HTMLElement;
    const instructionEl = this.mountEl.querySelector('[data-ws4-instruction]') as HTMLElement;

    switch (card.format) {
      case 'MULTIPLE_CHOICE':
        this.mountMultipleChoice(bodyEl);
        break;
      case 'MATCH_4':
        this.mountMatch4(bodyEl, instructionEl);
        break;
      case 'SORT_4':
        this.mountSort4(bodyEl, instructionEl);
        break;
      case 'MULTI_STRIKE':
        this.mountMultiStrike(bodyEl, instructionEl);
        break;
      case 'PINPOINT_DIAL':
        this.mountPinpointDial(bodyEl, instructionEl);
        break;
      case 'CLUE_ESCALATOR':
        this.mountClueEscalator(bodyEl, instructionEl);
        break;
      case 'VISUAL_SPOTTER':
        this.mountVisualSpotter(bodyEl, instructionEl);
        break;
    }

    this.attachKeyboardShortcuts();
  }

  /**
   * SURGICAL clock tick update — NEVER rebuilds DOM or touches `innerHTML`!
   * Safe to call at 10–60Hz during active drag-and-drop, slider drags, or typing.
   */
  public updateClock(state: QuestionClockTickState): void {
    if (!this.clockBoxEl || !this.clockStatusEl || !this.clockReadoutEl || !this.clockRingFgEl) {
      return;
    }

    if (state.phase === 'RELAXED') {
      this.clockBoxEl.dataset.phase = 'RELAXED';
      this.clockStatusEl.textContent = 'RELAXED PACE';
      this.clockReadoutEl.textContent = '∞';
      this.clockRingFgEl.style.strokeDashoffset = '0';
      return;
    }

    if (state.phase === 'READ_IN') {
      this.clockBoxEl.dataset.phase = 'READ_IN';
      this.clockStatusEl.textContent = 'READING CLUE...';
      const secDisplay = Math.ceil(Math.max(0, state.totalSec));
      this.clockReadoutEl.textContent = `${secDisplay}s`;
      this.clockRingFgEl.style.strokeDashoffset = '0';
      return;
    }

    if (state.phase === 'LOCKED') {
      this.clockBoxEl.dataset.phase = 'LOCKED';
      this.clockStatusEl.textContent = 'LOCKED IN';
      return;
    }

    if (state.phase === 'TIMEOUT') {
      this.clockBoxEl.dataset.phase = 'URGENT';
      this.clockStatusEl.textContent = "TIME'S UP";
      this.clockReadoutEl.textContent = '0s';
      this.clockRingFgEl.style.strokeDashoffset = CLOCK_RING_CIRCUMFERENCE.toFixed(2);
      return;
    }

    // ACTIVE countdown
    const clampedRem = Math.max(0, state.remainingSec);
    const total = Math.max(1, state.totalSec);
    const frac = Math.max(0, Math.min(1, clampedRem / total));
    const offset = CLOCK_RING_CIRCUMFERENCE * (1 - frac);
    const isUrgent = clampedRem <= 6;

    this.clockBoxEl.dataset.phase = isUrgent ? 'URGENT' : 'ACTIVE';
    this.clockStatusEl.textContent = isUrgent ? 'HURRY!' : 'SHOT CLOCK';
    this.clockReadoutEl.textContent =
      clampedRem < 5 ? `${clampedRem.toFixed(1)}s` : `${Math.ceil(clampedRem)}s`;
    this.clockRingFgEl.style.strokeDashoffset = offset.toFixed(2);
  }

  public getDoubleDownArmed(): boolean {
    return this.doubleDownArmed;
  }

  /**
   * Surgically eliminates 2 wrong choices (for 50/50 lifeline on 4-choice formats).
   */
  public apply5050Elimination(indicesToEliminate?: readonly number[]): void {
    if (!this.ctx || this.submitted || this.used5050 || this.choiceButtons.length < 4) return;
    const correctIdx = this.get4ChoiceCorrectIndex(this.ctx.card);
    if (correctIdx === null) return;

    let targets: number[];
    if (indicesToEliminate && indicesToEliminate.length > 0) {
      targets = indicesToEliminate.filter((idx) => idx !== correctIdx).slice(0, 2);
    } else {
      const wrong = [0, 1, 2, 3].filter((i) => i !== correctIdx);
      // Deterministic pick based on qid so it never feels erratic
      const offset = Math.abs(this.ctx.card.qid) % wrong.length;
      targets = [wrong[offset], wrong[(offset + 1) % wrong.length]];
    }

    this.used5050 = true;
    for (const idx of targets) {
      const btn = this.choiceButtons[idx];
      if (btn) {
        btn.disabled = true;
        btn.classList.add('ws4-eliminated');
        btn.setAttribute('aria-disabled', 'true');
      }
    }
    if (this.btn5050El) {
      this.btn5050El.disabled = true;
      const badge = this.btn5050El.querySelector('[data-ws4-ll-count]');
      if (badge) {
        badge.textContent = String(Math.max(0, this.ctx.lifelines5050Left - 1));
      }
    }
  }

  /**
   * Surgically reveals the lateral clue drawer without touching any interactive controls.
   */
  public revealHint(hintText?: string): void {
    if (!this.hintDrawerEl || !this.hintTextEl || !this.ctx) return;
    this.usedHint = true;
    if (hintText) {
      this.hintTextEl.textContent = hintText;
    }
    this.hintDrawerEl.classList.add('is-open');
    if (this.btnHintEl) {
      this.btnHintEl.disabled = true;
      const badge = this.btnHintEl.querySelector('[data-ws4-ll-count]');
      if (badge) {
        badge.textContent = String(Math.max(0, this.ctx.lifelinesHintLeft - 1));
      }
    }
  }

  /**
   * Displays the emerald/crimson post-answer reveal, host quip, Did You Know card, and NEXT CTA.
   */
  public showReveal(payload: QuestionRevealPayload): void {
    if (!this.ctx || !this.revealDockEl) return;
    this.submitted = true;
    this.revealed = true;
    this.mountEl.querySelector('.ws4-question-stage')?.classList.add('is-revealed');
    this.disableLifelineControls();

    const { card } = this.ctx;
    const { evaluation } = payload;

    // 1. Format-specific visual reveal markup
    switch (card.format) {
      case 'MULTIPLE_CHOICE':
      case 'CLUE_ESCALATOR':
      case 'VISUAL_SPOTTER':
        this.reveal4ChoiceOutcome(card);
        break;
      case 'MATCH_4':
        this.revealMatch4Outcome(card);
        break;
      case 'SORT_4':
        this.revealSort4Outcome(card);
        break;
      case 'MULTI_STRIKE':
        this.revealMultiStrikeOutcome(card);
        break;
      case 'PINPOINT_DIAL':
        this.revealPinpointOutcome(card);
        break;
    }

    // 2. Broadcast Reveal Footer
    const sign = evaluation.netPointsDelta > 0 ? '+' : '';
    const deltaLabel =
      evaluation.netPointsDelta === 0
        ? '0 PTS'
        : `${sign}${evaluation.netPointsDelta.toLocaleString('en-US')} PTS`;
    const verdictHeadline = evaluation.isBullseyeOrSweep
      ? 'BULLSEYE SWEEP!'
      : evaluation.isCorrect
        ? 'NAILED IT!'
        : 'MISSED THE MARK';
    const verdictIcon: BroadcastIconName = evaluation.isCorrect ? 'check' : 'cross';
    const hostName = payload.hostSpeakerName || 'Max Sterling';
    const funFact = payload.funFactWhy || card.funFactWhy;
    const nextLabel = payload.nextButtonLabel || 'NEXT';

    const wedgePill = payload.wedgeAwarded
      ? `<span class="ws4-pill ws4-pill-gold" style="border-color:${WEDGE_CATALOG_V4[payload.wedgeAwarded].accentHex}">
           ${iconSpan('crown', 14)}
           <span>${escapeHtml(WEDGE_CATALOG_V4[payload.wedgeAwarded].shortLabel)} WEDGE EARNED!</span>
         </span>`
      : '';

    this.revealDockEl.className = `ws4-reveal-dock is-visible ${evaluation.isCorrect ? 'is-win' : 'is-miss'}`;
    this.revealDockEl.innerHTML = `
      <div class="ws4-reveal-head">
        <div class="ws4-reveal-verdict">
          <span class="ws4-pill ${evaluation.isCorrect ? 'ws4-pill-gold' : 'ws4-pill-live'}">
            ${iconSpan(verdictIcon, 14)}
            <span>${verdictHeadline}</span>
          </span>
          <span class="ws4-reveal-delta">${deltaLabel}</span>
          ${wedgePill}
        </div>
        <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-ws4-next-btn>
          <span>${escapeHtml(nextLabel)}</span>
          ${iconSpan('play', 16)}
        </button>
      </div>
      <div class="ws4-reveal-breakdown">
        <strong>Answer:</strong> ${escapeHtml(evaluation.correctSummaryLabel)}
        ${evaluation.detailBreakdown ? ` &middot; ${escapeHtml(evaluation.detailBreakdown)}` : ''}
      </div>
      <div class="ws4-reveal-cards">
        <div class="ws4-host-bubble">
          <span class="ws4-reveal-card-kicker">${iconSpan('mic', 14)} ${escapeHtml(hostName)}</span>
          <p class="ws4-reveal-card-copy">${escapeHtml(payload.hostQuip)}</p>
        </div>
        <div class="ws4-funfact-card">
          <span class="ws4-reveal-card-kicker">${iconSpan('sparkle', 14)} Did You Know?</span>
          <p class="ws4-reveal-card-copy">${escapeHtml(funFact)}</p>
        </div>
      </div>
    `;

    const nextBtn = this.revealDockEl.querySelector('[data-ws4-next-btn]') as HTMLButtonElement | null;
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.callbacks?.onNext?.();
      });
    }
  }

  public dispose(): void {
    this.teardownActiveState();
    this.mountEl.innerHTML = '';
  }

  // ==========================================================================
  // FORMAT 1: MULTIPLE CHOICE
  // ==========================================================================

  private mountMultipleChoice(bodyEl: HTMLElement): void {
    const choices = this.ctx?.card.choices ?? ['', '', '', ''];
    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${this.renderLifelineBarHtml({ allow5050: true, allowHint: true, allowDoubleDown: true })}
        <div class="ws4-choices-grid" data-ws4-choices-grid>
          ${choices
            .map(
              (text, idx) => `
            <button type="button" class="ws4-plaque" data-choice-index="${idx}">
              <span class="ws4-plaque-letter">${CHOICE_LETTERS[idx]}</span>
              <span class="ws4-plaque-text">${escapeHtml(text)}</span>
            </button>`,
            )
            .join('')}
        </div>
      </div>
    `;

    this.bindLifelineBar(bodyEl);
    this.bind4ChoiceButtons(bodyEl, 'MULTIPLE_CHOICE');
  }

  // ==========================================================================
  // FORMAT 2: MATCH_4 (DRAG BEZIER LINES + 1-TAP LEFT -> 1-TAP RIGHT)
  // ==========================================================================

  private mountMatch4(bodyEl: HTMLElement, instructionEl: HTMLElement): void {
    const spec = this.ctx?.card.match4;
    if (!spec) {
      this.mountMultipleChoice(bodyEl);
      return;
    }

    instructionEl.hidden = false;
    instructionEl.innerHTML = `${iconSpan('layers', 16)} <span>${escapeHtml(spec.instruction)} — Drag a glowing wire OR tap Left then Right to pair.</span>`;

    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${this.renderLifelineBarHtml({ allow5050: false, allowHint: true, allowDoubleDown: true })}
        <div class="ws4-match4-arena" data-ws4-match4-arena>
          <svg class="ws4-match4-svg" data-ws4-match4-svg aria-hidden="true"></svg>
          <div class="ws4-match4-col" data-ws4-match4-left>
            ${spec.pairs
              .map(
                (p) => `
              <button type="button" class="ws4-match-card is-left" data-side="left" data-pair-id="${escapeHtml(p.pairId)}">
                <span class="ws4-plaque-text">${escapeHtml(p.leftPrompt)}</span>
                <span class="ws4-match-port" aria-hidden="true"></span>
              </button>`,
              )
              .join('')}
          </div>
          <div aria-hidden="true"></div>
          <div class="ws4-match4-col" data-ws4-match4-right>
            ${spec.shuffledRight
              .map(
                (r) => `
              <button type="button" class="ws4-match-card is-right" data-side="right" data-pair-id="${escapeHtml(r.pairId)}">
                <span class="ws4-plaque-text">${escapeHtml(r.text)}</span>
                <span class="ws4-match-port" aria-hidden="true"></span>
              </button>`,
              )
              .join('')}
          </div>
        </div>
        <div class="ws4-action-footer">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;min-width:0;">
            <span class="ws4-pill ws4-pill-gold" data-ws4-match-count>0 / 4 Paired</span>
            <button type="button" class="ws4-btn ws4-btn-ghost ws4-btn-sm" data-ws4-match-clear>Clear</button>
          </div>
          <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-ws4-match-lock disabled>
            <span>LOCK 4 MATCHES</span>
          </button>
        </div>
      </div>
    `;

    this.bindLifelineBar(bodyEl);
    this.matchArenaEl = bodyEl.querySelector('[data-ws4-match4-arena]');
    this.matchSvgEl = bodyEl.querySelector('[data-ws4-match4-svg]');
    this.matchCountEl = bodyEl.querySelector('[data-ws4-match-count]');
    this.matchLockBtn = bodyEl.querySelector('[data-ws4-match-lock]');
    const clearBtn = bodyEl.querySelector('[data-ws4-match-clear]') as HTMLButtonElement | null;

    this.matchLeftButtons.clear();
    this.matchRightButtons.clear();
    this.matchLinks.clear();
    this.matchLinkColorByLeft.clear();
    this.matchSelectedSide = null;
    this.matchSelectedId = null;

    bodyEl.querySelectorAll<HTMLButtonElement>('.ws4-match-card').forEach((btn) => {
      const side = btn.dataset.side as 'left' | 'right';
      const pairId = btn.dataset.pairId || '';
      if (side === 'left') this.matchLeftButtons.set(pairId, btn);
      else this.matchRightButtons.set(pairId, btn);

      btn.addEventListener('pointerdown', (ev) => this.handleMatchPointerDown(ev, side, pairId));
    });

    const onDocMove = (ev: PointerEvent): void => this.handleMatchPointerMove(ev);
    const onDocUp = (ev: PointerEvent): void => this.handleMatchPointerUp(ev);
    window.addEventListener('pointermove', onDocMove);
    window.addEventListener('pointerup', onDocUp);
    window.addEventListener('pointercancel', onDocUp);
    this.cleanupFns.push(() => {
      window.removeEventListener('pointermove', onDocMove);
      window.removeEventListener('pointerup', onDocUp);
      window.removeEventListener('pointercancel', onDocUp);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (this.submitted) return;
        this.matchLinks.clear();
        this.matchLinkColorByLeft.clear();
        this.matchSelectedSide = null;
        this.matchSelectedId = null;
        this.syncMatch4Visuals();
      });
    }

    if (this.matchLockBtn) {
      this.matchLockBtn.addEventListener('click', () => {
        if (this.submitted || this.matchLinks.size < 4) return;
        this.submitted = true;
        this.matchLockBtn!.disabled = true;
        this.callbacks?.onInteractionFeedback?.('lock_in');
        const linksObj: Record<string, string> = {};
        this.matchLinks.forEach((rightId, leftId) => {
          linksObj[leftId] = rightId;
        });
        this.emitSubmission({
          format: 'MATCH_4',
          match4Links: linksObj,
        });
      });
    }

    // Keep SVG Bézier curves pixel-aligned on viewport resize
    if (typeof ResizeObserver !== 'undefined' && this.matchArenaEl) {
      this.matchResizeObserver = new ResizeObserver(() => {
        this.redrawMatch4Svg();
      });
      this.matchResizeObserver.observe(this.matchArenaEl);
    }
    const onWinResize = (): void => this.redrawMatch4Svg();
    window.addEventListener('resize', onWinResize, { passive: true });
    this.cleanupFns.push(() => window.removeEventListener('resize', onWinResize));

    window.requestAnimationFrame(() => this.redrawMatch4Svg());
  }

  private handleMatchPointerDown(
    ev: PointerEvent,
    side: 'left' | 'right',
    pairId: string,
  ): void {
    if (this.submitted || ev.button === 2) return;
    ev.preventDefault();
    this.matchDragState = {
      side,
      pairId,
      pointerId: ev.pointerId,
      startX: ev.clientX,
      startY: ev.clientY,
      currX: ev.clientX,
      currY: ev.clientY,
      moved: false,
    };
  }

  private handleMatchPointerMove(ev: PointerEvent): void {
    if (!this.matchDragState || ev.pointerId !== this.matchDragState.pointerId) return;
    const dx = ev.clientX - this.matchDragState.startX;
    const dy = ev.clientY - this.matchDragState.startY;
    if (Math.hypot(dx, dy) > 8) {
      this.matchDragState.moved = true;
    }
    this.matchDragState.currX = ev.clientX;
    this.matchDragState.currY = ev.clientY;
    if (this.matchDragState.moved) {
      this.redrawMatch4Svg();
    }
  }

  private handleMatchPointerUp(ev: PointerEvent): void {
    const drag = this.matchDragState;
    if (!drag || ev.pointerId !== drag.pointerId) return;
    this.matchDragState = null;

    if (drag.moved) {
      // Dropped after dragging: see if released over an opposite-side match card
      const hitEl = document.elementFromPoint(ev.clientX, ev.clientY);
      const cardEl = hitEl?.closest<HTMLButtonElement>('.ws4-match-card');
      if (cardEl && cardEl.dataset.side && cardEl.dataset.pairId) {
        const targetSide = cardEl.dataset.side as 'left' | 'right';
        const targetId = cardEl.dataset.pairId;
        if (targetSide !== drag.side) {
          const leftId = drag.side === 'left' ? drag.pairId : targetId;
          const rightId = drag.side === 'right' ? drag.pairId : targetId;
          this.linkMatchPair(leftId, rightId);
          this.matchSelectedSide = null;
          this.matchSelectedId = null;
          this.syncMatch4Visuals();
          return;
        }
      }
      this.redrawMatch4Svg();
      return;
    }

    // Tap interaction (1-tap Left -> 1-tap Right, OR tap paired card to unpair!)
    this.handleMatchCardTap(drag.side, drag.pairId);
  }

  private handleMatchCardTap(side: 'left' | 'right', pairId: string): void {
    if (this.submitted) return;

    // If nothing currently selected and tapped card is already paired -> unpair it!
    if (this.matchSelectedSide === null) {
      if (side === 'left' && this.matchLinks.has(pairId)) {
        this.matchLinks.delete(pairId);
        this.matchLinkColorByLeft.delete(pairId);
        this.callbacks?.onInteractionFeedback?.('tap');
        this.syncMatch4Visuals();
        return;
      }
      if (side === 'right') {
        const existingLeft = this.findLeftByRight(pairId);
        if (existingLeft) {
          this.matchLinks.delete(existingLeft);
          this.matchLinkColorByLeft.delete(existingLeft);
          this.callbacks?.onInteractionFeedback?.('tap');
          this.syncMatch4Visuals();
          return;
        }
      }
      this.matchSelectedSide = side;
      this.matchSelectedId = pairId;
      this.callbacks?.onInteractionFeedback?.('tap');
      this.syncMatch4Visuals();
      return;
    }

    // Tapping same card cancels selection
    if (this.matchSelectedSide === side && this.matchSelectedId === pairId) {
      this.matchSelectedSide = null;
      this.matchSelectedId = null;
      this.syncMatch4Visuals();
      return;
    }

    // Tapping another card on same side switches active pick
    if (this.matchSelectedSide === side) {
      this.matchSelectedId = pairId;
      this.callbacks?.onInteractionFeedback?.('tap');
      this.syncMatch4Visuals();
      return;
    }

    // Opposite side -> pair them!
    const leftId = side === 'left' ? pairId : this.matchSelectedId!;
    const rightId = side === 'right' ? pairId : this.matchSelectedId!;
    this.linkMatchPair(leftId, rightId);
    this.matchSelectedSide = null;
    this.matchSelectedId = null;
    this.syncMatch4Visuals();
  }

  private linkMatchPair(leftId: string, rightId: string): void {
    // Remove any existing link pointing to this rightId
    const prevLeft = this.findLeftByRight(rightId);
    if (prevLeft && prevLeft !== leftId) {
      this.matchLinks.delete(prevLeft);
      this.matchLinkColorByLeft.delete(prevLeft);
    }

    // Assign a distinct color from MATCH4_LINK_COLORS
    if (!this.matchLinkColorByLeft.has(leftId)) {
      const usedColors = new Set(this.matchLinkColorByLeft.values());
      const freeColor =
        MATCH4_LINK_COLORS.find((c) => !usedColors.has(c)) ??
        MATCH4_LINK_COLORS[this.matchLinks.size % MATCH4_LINK_COLORS.length];
      this.matchLinkColorByLeft.set(leftId, freeColor);
    }
    this.matchLinks.set(leftId, rightId);
    this.callbacks?.onInteractionFeedback?.('pair');
  }

  private findLeftByRight(rightId: string): string | null {
    for (const [lId, rId] of this.matchLinks.entries()) {
      if (rId === rightId) return lId;
    }
    return null;
  }

  private syncMatch4Visuals(): void {
    const rightToColor = new Map<string, string>();
    this.matchLinks.forEach((rId, lId) => {
      rightToColor.set(rId, this.matchLinkColorByLeft.get(lId) ?? MATCH4_LINK_COLORS[0]);
    });

    this.matchLeftButtons.forEach((btn, lId) => {
      const isActive = this.matchSelectedSide === 'left' && this.matchSelectedId === lId;
      const isPaired = this.matchLinks.has(lId);
      btn.classList.toggle('is-active-pick', isActive);
      btn.classList.toggle('is-paired', isPaired);
      if (isPaired) {
        btn.style.setProperty('--ws4-link-color', this.matchLinkColorByLeft.get(lId) ?? '#f5c451');
      } else {
        btn.style.removeProperty('--ws4-link-color');
      }
    });

    this.matchRightButtons.forEach((btn, rId) => {
      const isActive = this.matchSelectedSide === 'right' && this.matchSelectedId === rId;
      const color = rightToColor.get(rId);
      btn.classList.toggle('is-active-pick', isActive);
      btn.classList.toggle('is-paired', Boolean(color));
      if (color) {
        btn.style.setProperty('--ws4-link-color', color);
      } else {
        btn.style.removeProperty('--ws4-link-color');
      }
    });

    const count = this.matchLinks.size;
    if (this.matchCountEl) {
      this.matchCountEl.textContent = `${count} / 4 Paired`;
    }
    if (this.matchLockBtn) {
      this.matchLockBtn.disabled = this.submitted || count < 4;
    }

    this.redrawMatch4Svg();
  }

  private redrawMatch4Svg(revealMode = false): void {
    if (!this.matchArenaEl || !this.matchSvgEl) return;
    const arenaRect = this.matchArenaEl.getBoundingClientRect();
    if (arenaRect.width <= 0 || arenaRect.height <= 0) return;

    this.matchSvgEl.setAttribute('viewBox', `0 0 ${arenaRect.width} ${arenaRect.height}`);
    const paths: string[] = [];

    const getPortPoint = (btn: HTMLButtonElement): { x: number; y: number } => {
      const port = btn.querySelector('.ws4-match-port') ?? btn;
      const r = port.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - arenaRect.left,
        y: r.top + r.height / 2 - arenaRect.top,
      };
    };

    const bezierPath = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string,
      dashed = false,
    ): string => {
      const dx = Math.max(36, Math.abs(x2 - x1) * 0.52);
      const c1x = x1 < x2 ? x1 + dx : x1 - dx;
      const c2x = x1 < x2 ? x2 - dx : x2 + dx;
      const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${c1x.toFixed(1)} ${y1.toFixed(1)}, ${c2x.toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      const dashAttr = dashed ? ' stroke-dasharray="8 6"' : '';
      return `
        <path d="${d}" fill="none" stroke="${color}" stroke-opacity="0.28" stroke-width="9" stroke-linecap="round"${dashAttr}/>
        <path d="${d}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"${dashAttr}/>
        <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="4.5" fill="${color}"/>
        <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="4.5" fill="${color}"/>
      `;
    };

    this.matchLinks.forEach((rightId, leftId) => {
      const lBtn = this.matchLeftButtons.get(leftId);
      const rBtn = this.matchRightButtons.get(rightId);
      if (!lBtn || !rBtn) return;
      const p1 = getPortPoint(lBtn);
      const p2 = getPortPoint(rBtn);
      let color = this.matchLinkColorByLeft.get(leftId) ?? '#f5c451';
      if (revealMode) {
        color = leftId === rightId ? '#34d993' : '#f25c6e';
      }
      paths.push(bezierPath(p1.x, p1.y, p2.x, p2.y, color, false));
    });

    if (this.matchDragState && this.matchDragState.moved) {
      const srcBtn =
        this.matchDragState.side === 'left'
          ? this.matchLeftButtons.get(this.matchDragState.pairId)
          : this.matchRightButtons.get(this.matchDragState.pairId);
      if (srcBtn) {
        const p1 = getPortPoint(srcBtn);
        const p2x = this.matchDragState.currX - arenaRect.left;
        const p2y = this.matchDragState.currY - arenaRect.top;
        paths.push(bezierPath(p1.x, p1.y, p2x, p2y, '#ffe082', true));
      }
    }

    this.matchSvgEl.innerHTML = paths.join('');
  }

  private revealMatch4Outcome(card: QuestionCardV4): void {
    const spec = card.match4;
    if (!spec) return;
    const rightLabelByPairId = new Map(spec.pairs.map((p) => [p.pairId, p.rightAnswer]));

    this.matchLeftButtons.forEach((btn, lId) => {
      btn.disabled = true;
      btn.classList.remove('is-active-pick');
      const chosenR = this.matchLinks.get(lId);
      const isOk = chosenR === lId;
      btn.classList.add(isOk ? 'is-correct' : 'is-wrong');
      if (!isOk) {
        const textWrap = btn.querySelector('.ws4-plaque-text');
        const trueAns = rightLabelByPairId.get(lId);
        if (textWrap && trueAns) {
          const note = document.createElement('span');
          note.className = 'ws4-match-correction';
          note.textContent = `Match: ${trueAns}`;
          textWrap.appendChild(note);
        }
      }
    });

    this.matchRightButtons.forEach((btn, rId) => {
      btn.disabled = true;
      btn.classList.remove('is-active-pick');
      const pairedLeft = this.findLeftByRight(rId);
      btn.classList.add(pairedLeft === rId ? 'is-correct' : 'is-wrong');
    });

    const clearBtn = this.mountEl.querySelector<HTMLButtonElement>('[data-ws4-match-clear]');
    if (clearBtn) clearBtn.disabled = true;
    if (this.matchLockBtn) this.matchLockBtn.disabled = true;

    window.requestAnimationFrame(() => this.redrawMatch4Svg(true));
  }

  // ==========================================================================
  // FORMAT 3: SORT_4 (POINTER DRAG REORDER + UP/DOWN 1-TAP BUTTONS)
  // ==========================================================================

  private mountSort4(bodyEl: HTMLElement, instructionEl: HTMLElement): void {
    const spec = this.ctx?.card.sort4;
    if (!spec) {
      this.mountMultipleChoice(bodyEl);
      return;
    }

    instructionEl.hidden = false;
    instructionEl.innerHTML = `${iconSpan('arrow_down', 16)} <span>Arrange all 4 cards from top (#1) to bottom (#4) — drag cards OR tap ▲ / ▼ arrows.</span>`;

    this.sortOrderIds = spec.initialOrder.map((item) => item.itemId);

    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${this.renderLifelineBarHtml({ allow5050: false, allowHint: true, allowDoubleDown: true })}
        <div class="ws4-sort-direction">
          <span>#1 TOP</span>
          <span>${escapeHtml(spec.orderDirectionLabel)}</span>
          <span>#4 BOTTOM</span>
        </div>
        <div class="ws4-sort-list" data-ws4-sort-list></div>
        <div class="ws4-action-footer">
          <span class="ws4-pill">Drag or tap ▲ / ▼</span>
          <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-ws4-sort-lock>
            <span>LOCK ORDER</span>
          </button>
        </div>
      </div>
    `;

    this.bindLifelineBar(bodyEl);
    this.sortListEl = bodyEl.querySelector('[data-ws4-sort-list]');
    this.sortLockBtn = bodyEl.querySelector('[data-ws4-sort-lock]');

    this.renderSort4Cards();

    if (this.sortLockBtn) {
      this.sortLockBtn.addEventListener('click', () => {
        if (this.submitted) return;
        this.submitted = true;
        this.sortLockBtn!.disabled = true;
        this.callbacks?.onInteractionFeedback?.('lock_in');
        this.emitSubmission({
          format: 'SORT_4',
          sort4Ids: [...this.sortOrderIds],
        });
      });
    }
  }

  private renderSort4Cards(): void {
    const spec = this.ctx?.card.sort4;
    if (!spec || !this.sortListEl) return;

    const itemById = new Map(spec.correctOrder.map((item) => [item.itemId, item]));
    this.sortListEl.innerHTML = '';

    this.sortOrderIds.forEach((id, index) => {
      const item = itemById.get(id);
      if (!item) return;

      const card = document.createElement('div');
      card.className = 'ws4-sort-card';
      card.dataset.itemId = id;
      card.dataset.index = String(index);
      card.innerHTML = `
        <span class="ws4-sort-rank">#${index + 1}</span>
        <span class="ws4-sort-grip" data-sort-grip title="Drag to reorder" aria-hidden="true">${iconSpan('grip', 18)}</span>
        <span class="ws4-sort-label">${escapeHtml(item.label)}</span>
        <span class="ws4-sort-value-pill" data-sort-value hidden></span>
        <div class="ws4-sort-controls">
          <button type="button" class="ws4-sort-arrow-btn" data-move="up" aria-label="Move ${escapeHtml(item.label)} up" ${index === 0 || this.submitted ? 'disabled' : ''}>
            ${iconSpan('arrow_up', 20)}
          </button>
          <button type="button" class="ws4-sort-arrow-btn" data-move="down" aria-label="Move ${escapeHtml(item.label)} down" ${index === this.sortOrderIds.length - 1 || this.submitted ? 'disabled' : ''}>
            ${iconSpan('arrow_down', 20)}
          </button>
        </div>
      `;

      const upBtn = card.querySelector<HTMLButtonElement>('[data-move="up"]');
      const downBtn = card.querySelector<HTMLButtonElement>('[data-move="down"]');
      upBtn?.addEventListener('click', () => this.swapSortIndices(index, index - 1));
      downBtn?.addEventListener('click', () => this.swapSortIndices(index, index + 1));

      // Pointer drag-and-drop reorder
      const startDrag = (ev: PointerEvent): void => {
        if (this.submitted) return;
        const target = ev.target as HTMLElement | null;
        if (target?.closest('button')) return;
        ev.preventDefault();
        this.sortDragIndex = index;
        card.classList.add('is-dragging');
        card.setPointerCapture?.(ev.pointerId);

        const onMove = (moveEv: PointerEvent): void => {
          if (this.sortDragIndex === null || !this.sortListEl) return;
          const cards = Array.from(this.sortListEl.querySelectorAll<HTMLElement>('.ws4-sort-card'));
          for (let j = 0; j < cards.length; j++) {
            if (j === this.sortDragIndex) continue;
            const rect = cards[j].getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (
              (j < this.sortDragIndex && moveEv.clientY < midY) ||
              (j > this.sortDragIndex && moveEv.clientY > midY)
            ) {
              const movedId = this.sortOrderIds.splice(this.sortDragIndex, 1)[0];
              this.sortOrderIds.splice(j, 0, movedId);
              this.sortDragIndex = j;
              this.callbacks?.onInteractionFeedback?.('reorder');
              this.syncSortCardPositions();
              break;
            }
          }
        };

        const onEnd = (): void => {
          this.sortDragIndex = null;
          this.sortListEl
            ?.querySelectorAll('.ws4-sort-card.is-dragging')
            .forEach((el) => el.classList.remove('is-dragging'));
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onEnd);
          window.removeEventListener('pointercancel', onEnd);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onEnd);
        window.addEventListener('pointercancel', onEnd);
      };

      card.addEventListener('pointerdown', startDrag);
      this.sortListEl!.appendChild(card);
    });
  }

  private swapSortIndices(a: number, b: number): void {
    if (this.submitted || b < 0 || b >= this.sortOrderIds.length) return;
    const tmp = this.sortOrderIds[a];
    this.sortOrderIds[a] = this.sortOrderIds[b];
    this.sortOrderIds[b] = tmp;
    this.callbacks?.onInteractionFeedback?.('reorder');
    this.renderSort4Cards();
  }

  /**
   * Reorders existing DOM nodes in place during active pointer drag so pointer capture never drops!
   */
  private syncSortCardPositions(): void {
    if (!this.sortListEl) return;
    const byId = new Map<string, HTMLElement>();
    this.sortListEl.querySelectorAll<HTMLElement>('.ws4-sort-card').forEach((el) => {
      if (el.dataset.itemId) byId.set(el.dataset.itemId, el);
    });
    this.sortOrderIds.forEach((id, idx) => {
      const el = byId.get(id);
      if (!el) return;
      el.dataset.index = String(idx);
      const rankEl = el.querySelector('.ws4-sort-rank');
      if (rankEl) rankEl.textContent = `#${idx + 1}`;
      const upBtn = el.querySelector<HTMLButtonElement>('[data-move="up"]');
      const downBtn = el.querySelector<HTMLButtonElement>('[data-move="down"]');
      if (upBtn) upBtn.disabled = idx === 0 || this.submitted;
      if (downBtn) downBtn.disabled = idx === this.sortOrderIds.length - 1 || this.submitted;
      this.sortListEl!.appendChild(el);
    });
  }

  private revealSort4Outcome(card: QuestionCardV4): void {
    const spec = card.sort4;
    if (!spec || !this.sortListEl) return;

    const correctRankById = new Map(spec.correctOrder.map((item, idx) => [item.itemId, idx]));
    const itemById = new Map(spec.correctOrder.map((item) => [item.itemId, item]));

    this.sortListEl.querySelectorAll<HTMLElement>('.ws4-sort-card').forEach((el, idx) => {
      const id = el.dataset.itemId || '';
      const trueRank = correctRankById.get(id) ?? idx;
      const item = itemById.get(id);
      const isOk = trueRank === idx;
      el.classList.add(isOk ? 'is-correct' : 'is-wrong');

      const valPill = el.querySelector<HTMLElement>('[data-sort-value]');
      if (valPill && item) {
        valPill.hidden = false;
        valPill.textContent = isOk
          ? item.formattedValue
          : `${item.formattedValue} · True #${trueRank + 1}`;
      }
      el.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
        b.disabled = true;
      });
    });

    if (this.sortLockBtn) this.sortLockBtn.disabled = true;
  }

  // ==========================================================================
  // FORMAT 4: MULTI_STRIKE (PICK ALL TRUE / SPOT THE IMPOSTER)
  // ==========================================================================

  private mountMultiStrike(bodyEl: HTMLElement, instructionEl: HTMLElement): void {
    const spec = this.ctx?.card.multiStrike;
    if (!spec) {
      this.mountMultipleChoice(bodyEl);
      return;
    }

    const modeHint =
      spec.strikeMode === 'SPOT_THE_IMPOSTER'
        ? `Spot the ${spec.targetCount} IMPOSTER (the false option)!`
        : `Tap ALL ${spec.targetCount} TRUE answers, then Lock Picks!`;

    instructionEl.hidden = false;
    instructionEl.innerHTML = `${iconSpan('target', 16)} <span>${escapeHtml(modeHint)}</span>`;

    this.multiSelectedIds.clear();
    this.multiButtons.clear();

    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="ws4-strike-header">
          ${this.renderLifelineBarHtml({ allow5050: false, allowHint: true, allowDoubleDown: true })}
          <span class="ws4-pill ws4-pill-gold" data-ws4-strike-counter>0 / ${spec.targetCount} Selected</span>
        </div>
        <div class="ws4-strike-grid">
          ${spec.options
            .map(
              (opt) => `
            <button type="button" class="ws4-strike-card" data-option-id="${escapeHtml(opt.optionId)}" aria-pressed="false">
              <span class="ws4-strike-check" aria-hidden="true">${iconSpan('check', 16)}</span>
              <span class="ws4-plaque-text">${escapeHtml(opt.label)}</span>
            </button>`,
            )
            .join('')}
        </div>
        <div class="ws4-action-footer">
          <span class="ws4-pill">${spec.strikeMode === 'SPOT_THE_IMPOSTER' ? 'Imposter Round' : 'Multi-Strike Round'}</span>
          <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-ws4-strike-lock disabled>
            <span>LOCK PICKS</span>
          </button>
        </div>
      </div>
    `;

    this.bindLifelineBar(bodyEl);
    this.multiCounterEl = bodyEl.querySelector('[data-ws4-strike-counter]');
    this.multiLockBtn = bodyEl.querySelector('[data-ws4-strike-lock]');

    bodyEl.querySelectorAll<HTMLButtonElement>('.ws4-strike-card').forEach((btn) => {
      const optId = btn.dataset.optionId || '';
      this.multiButtons.set(optId, btn);
      btn.addEventListener('click', () => {
        if (this.submitted) return;
        if (this.multiSelectedIds.has(optId)) {
          this.multiSelectedIds.delete(optId);
        } else {
          // For SPOT_THE_IMPOSTER with targetCount === 1, smoothly act like single-pick toggle
          if (spec.strikeMode === 'SPOT_THE_IMPOSTER' && spec.targetCount === 1) {
            this.multiSelectedIds.clear();
          }
          this.multiSelectedIds.add(optId);
        }
        this.callbacks?.onInteractionFeedback?.('tap');
        this.syncMultiStrikeVisuals(spec.targetCount);
      });
    });

    if (this.multiLockBtn) {
      this.multiLockBtn.addEventListener('click', () => {
        if (this.submitted || this.multiSelectedIds.size === 0) return;
        this.submitted = true;
        this.multiLockBtn!.disabled = true;
        this.callbacks?.onInteractionFeedback?.('lock_in');
        this.emitSubmission({
          format: 'MULTI_STRIKE',
          multiStrikeIds: Array.from(this.multiSelectedIds),
        });
      });
    }
  }

  private syncMultiStrikeVisuals(targetCount: number): void {
    this.multiButtons.forEach((btn, id) => {
      const selected = this.multiSelectedIds.has(id);
      btn.classList.toggle('is-selected', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
    if (this.multiCounterEl) {
      this.multiCounterEl.textContent = `${this.multiSelectedIds.size} / ${targetCount} Selected`;
    }
    if (this.multiLockBtn) {
      this.multiLockBtn.disabled = this.submitted || this.multiSelectedIds.size === 0;
    }
  }

  private revealMultiStrikeOutcome(card: QuestionCardV4): void {
    const spec = card.multiStrike;
    if (!spec) return;

    spec.options.forEach((opt) => {
      const btn = this.multiButtons.get(opt.optionId);
      if (!btn) return;
      btn.disabled = true;
      const picked = this.multiSelectedIds.has(opt.optionId);
      btn.classList.remove('is-selected');
      if (opt.isTarget && picked) {
        btn.classList.add('is-hit');
      } else if (opt.isTarget && !picked) {
        btn.classList.add('is-missed-target');
      } else if (!opt.isTarget && picked) {
        btn.classList.add('is-wrong-pick');
      }
    });
    if (this.multiLockBtn) this.multiLockBtn.disabled = true;
  }

  // ==========================================================================
  // FORMAT 5: PINPOINT_DIAL (RANGE SLIDER + STEP BUTTONS + ZONE REVEAL)
  // ==========================================================================

  private mountPinpointDial(bodyEl: HTMLElement, instructionEl: HTMLElement): void {
    const spec = this.ctx?.card.pinpoint;
    if (!spec) {
      this.mountMultipleChoice(bodyEl);
      return;
    }

    const span = Math.max(1, spec.maxVal - spec.minVal);
    const rawMid = spec.minVal + span / 2;
    const step = Math.max(0.01, spec.step || 1);
    this.dialValue = this.clampDial(Math.round(rawMid / step) * step, spec.minVal, spec.maxVal, step);

    const fineStep = step;
    const coarseStep = step * 10;

    // Pre-compute exact reveal zone percentages
    const toPct = (v: number): number =>
      Math.max(0, Math.min(100, ((v - spec.minVal) / span) * 100));
    const winLeft = toPct(spec.exactVal - spec.winRadius);
    const winRight = toPct(spec.exactVal + spec.winRadius);
    const bullLeft = toPct(spec.exactVal - spec.bullseyeRadius);
    const bullRight = toPct(spec.exactVal + spec.bullseyeRadius);
    const exactPct = toPct(spec.exactVal);

    instructionEl.hidden = false;
    instructionEl.innerHTML = `${iconSpan('target', 16)} <span>Dial in your estimate! Within ±${spec.bullseyeRadius}${spec.unitLabel ? ' ' + spec.unitLabel : ''} scores a 2× Bullseye; within ±${spec.winRadius} wins 1×!</span>`;

    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${this.renderLifelineBarHtml({ allow5050: false, allowHint: true, allowDoubleDown: true })}
        <div class="ws4-dial-panel" data-ws4-dial-panel>
          <div class="ws4-dial-readout-row">
            <span class="ws4-dial-value" data-ws4-dial-readout>${escapeHtml(formatPinpointNumber(this.dialValue, '', spec.minVal, spec.maxVal))}</span>
            ${spec.unitLabel ? `<span class="ws4-dial-unit">${escapeHtml(spec.unitLabel)}</span>` : ''}
          </div>

          <div class="ws4-dial-track-wrap">
            <div class="ws4-dial-zone-bar" aria-hidden="true">
              <div class="ws4-dial-win-zone" style="left:${winLeft.toFixed(2)}%;width:${Math.max(1.5, winRight - winLeft).toFixed(2)}%"></div>
              <div class="ws4-dial-bullseye-zone" style="left:${bullLeft.toFixed(2)}%;width:${Math.max(1.5, bullRight - bullLeft).toFixed(2)}%"></div>
              <div class="ws4-dial-exact-pin" style="left:${exactPct.toFixed(2)}%">
                EXACT: ${escapeHtml(formatPinpointNumber(spec.exactVal, spec.unitLabel, spec.minVal, spec.maxVal))}
              </div>
            </div>
            <input
              type="range"
              class="ws4-dial-range"
              data-ws4-dial-range
              min="${spec.minVal}"
              max="${spec.maxVal}"
              step="${step}"
              value="${this.dialValue}"
              aria-label="Pinpoint value slider"
            />
          </div>

          <div class="ws4-dial-bounds">
            <span>${escapeHtml(formatPinpointNumber(spec.minVal, spec.unitLabel, spec.minVal, spec.maxVal))}</span>
            <span>${escapeHtml(formatPinpointNumber(Math.round((spec.minVal + spec.maxVal) / 2), spec.unitLabel, spec.minVal, spec.maxVal))}</span>
            <span>${escapeHtml(formatPinpointNumber(spec.maxVal, spec.unitLabel, spec.minVal, spec.maxVal))}</span>
          </div>

          <div class="ws4-dial-steps">
            <button type="button" class="ws4-dial-step-btn" data-dial-delta="${-coarseStep}">-${coarseStep}</button>
            <button type="button" class="ws4-dial-step-btn" data-dial-delta="${-fineStep}">-${fineStep}</button>
            <button type="button" class="ws4-dial-step-btn" data-dial-delta="${fineStep}">+${fineStep}</button>
            <button type="button" class="ws4-dial-step-btn" data-dial-delta="${coarseStep}">+${coarseStep}</button>
          </div>

          <div class="ws4-dial-legend">
            <span style="color:#34d993">● Bullseye 2× (±${spec.bullseyeRadius})</span>
            <span style="color:#46a8ff">● Win Zone 1× (±${spec.winRadius})</span>
          </div>
        </div>

        <div class="ws4-action-footer">
          <span class="ws4-pill">Drag slider or tap step buttons</span>
          <button type="button" class="ws4-btn ws4-btn-gold ws4-btn-lg" data-ws4-dial-lock>
            <span>LOCK PINPOINT</span>
          </button>
        </div>
      </div>
    `;

    this.bindLifelineBar(bodyEl);
    this.dialPanelEl = bodyEl.querySelector('[data-ws4-dial-panel]');
    this.dialReadoutEl = bodyEl.querySelector('[data-ws4-dial-readout]');
    this.dialRangeEl = bodyEl.querySelector('[data-ws4-dial-range]');
    this.dialLockBtn = bodyEl.querySelector('[data-ws4-dial-lock]');
    this.dialStepBtns = Array.from(bodyEl.querySelectorAll<HTMLButtonElement>('.ws4-dial-step-btn'));

    const updateDial = (nextVal: number): void => {
      if (this.submitted) return;
      this.dialValue = this.clampDial(nextVal, spec.minVal, spec.maxVal, step);
      if (this.dialRangeEl) this.dialRangeEl.value = String(this.dialValue);
      if (this.dialReadoutEl) {
        this.dialReadoutEl.textContent = formatPinpointNumber(
          this.dialValue,
          '',
          spec.minVal,
          spec.maxVal,
        );
      }
      this.callbacks?.onInteractionFeedback?.('dial');
    };

    this.dialRangeEl?.addEventListener('input', () => {
      updateDial(Number(this.dialRangeEl!.value));
    });

    this.dialStepBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const delta = Number(btn.dataset.dialDelta || 0);
        updateDial(this.dialValue + delta);
      });
    });

    this.dialLockBtn?.addEventListener('click', () => {
      if (this.submitted) return;
      this.submitted = true;
      this.dialLockBtn!.disabled = true;
      if (this.dialRangeEl) this.dialRangeEl.disabled = true;
      this.dialStepBtns.forEach((b) => (b.disabled = true));
      this.callbacks?.onInteractionFeedback?.('lock_in');
      this.emitSubmission({
        format: 'PINPOINT_DIAL',
        pinpointValue: this.dialValue,
      });
    });
  }

  private clampDial(v: number, min: number, max: number, step: number): number {
    const snapped = min + Math.round((v - min) / step) * step;
    const clamped = Math.max(min, Math.min(max, snapped));
    return Number.isInteger(step) ? Math.round(clamped) : Number(clamped.toFixed(2));
  }

  private revealPinpointOutcome(_card: QuestionCardV4): void {
    this.dialPanelEl?.classList.add('is-revealed');
    if (this.dialRangeEl) this.dialRangeEl.disabled = true;
    this.dialStepBtns.forEach((b) => (b.disabled = true));
    if (this.dialLockBtn) this.dialLockBtn.disabled = true;
  }

  // ==========================================================================
  // FORMAT 6: CLUE_ESCALATOR (3-CARD FLIP STACK ABOVE 4 ANSWER PLAQUES)
  // ==========================================================================

  private mountClueEscalator(bodyEl: HTMLElement, instructionEl: HTMLElement): void {
    const spec = this.ctx?.card.escalator;
    if (!spec) {
      this.mountMultipleChoice(bodyEl);
      return;
    }

    this.escalatorRevealedCount = 1;
    instructionEl.hidden = false;
    instructionEl.innerHTML = `${iconSpan('layers', 16)} <span>Answer early for 3× points, or deal Clue 2 (2×) and Clue 3 (1×) for clearer hints!</span>`;

    const base = this.getEffectivePointBase();
    if (this.escalatorPointsBadgeEl) {
      this.escalatorPointsBadgeEl.textContent = `${(base * 3).toLocaleString('en-US')} PTS (3×)`;
    }

    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${this.renderLifelineBarHtml({ allow5050: true, allowHint: false, allowDoubleDown: false })}
        <div class="ws4-escalator-stack" data-ws4-escalator-stack>
          <article class="ws4-clue-card is-open" data-clue-slot="1">
            <div class="ws4-clue-head">
              <span>Clue 1 · Hard</span>
              <span class="ws4-pill ws4-pill-gold">3× Points</span>
            </div>
            <div class="ws4-clue-body">${escapeHtml(spec.clues[0])}</div>
          </article>

          <article class="ws4-clue-card is-sealed" data-clue-slot="2">
            <button type="button" class="ws4-btn ws4-btn-gold" data-deal-clue="2">
              ${iconSpan('clue', 16)}
              <span>Deal Clue 2 (2×)</span>
            </button>
          </article>

          <article class="ws4-clue-card is-sealed" data-clue-slot="3">
            <button type="button" class="ws4-btn ws4-btn-ghost" data-deal-clue="3">
              ${iconSpan('clue', 16)}
              <span>Deal Clue 3 (1×)</span>
            </button>
          </article>
        </div>

        <div class="ws4-choices-grid" data-ws4-choices-grid>
          ${spec.choices
            .map(
              (text, idx) => `
            <button type="button" class="ws4-plaque" data-choice-index="${idx}">
              <span class="ws4-plaque-letter">${CHOICE_LETTERS[idx]}</span>
              <span class="ws4-plaque-text">${escapeHtml(text)}</span>
            </button>`,
            )
            .join('')}
        </div>
      </div>
    `;

    this.bindLifelineBar(bodyEl);
    this.escalatorCards = Array.from(bodyEl.querySelectorAll<HTMLElement>('[data-clue-slot]'));

    const openSlot = (targetSlot: 2 | 3): void => {
      if (this.submitted) return;
      const revealUpTo = targetSlot;
      if (revealUpTo > this.escalatorRevealedCount) {
        this.escalatorRevealedCount = revealUpTo;
      }

      for (let s = 2; s <= revealUpTo; s++) {
        const cardEl = this.escalatorCards[s - 1];
        if (!cardEl || cardEl.classList.contains('is-open')) continue;
        cardEl.classList.remove('is-sealed');
        cardEl.classList.add('is-open');
        const multLabel = s === 2 ? '2× Points' : '1× Points';
        const diffLabel = s === 2 ? 'Clue 2 · Medium' : 'Clue 3 · Clear';
        cardEl.innerHTML = `
          <div class="ws4-clue-head">
            <span>${diffLabel}</span>
            <span class="ws4-pill ws4-pill-gold">${multLabel}</span>
          </div>
          <div class="ws4-clue-body">${escapeHtml(spec.clues[s - 1])}</div>
        `;
      }

      const mult = this.escalatorRevealedCount === 1 ? 3 : this.escalatorRevealedCount === 2 ? 2 : 1;
      if (this.escalatorPointsBadgeEl) {
        this.escalatorPointsBadgeEl.textContent = `${(base * mult).toLocaleString('en-US')} PTS (${mult}×)`;
      }
      this.callbacks?.onInteractionFeedback?.('tap');
      this.callbacks?.onEscalatorDealClue?.(targetSlot);
    };

    bodyEl.querySelector('[data-deal-clue="2"]')?.addEventListener('click', () => openSlot(2));
    bodyEl.querySelector('[data-deal-clue="3"]')?.addEventListener('click', () => openSlot(3));

    this.bind4ChoiceButtons(bodyEl, 'CLUE_ESCALATOR');
  }

  // ==========================================================================
  // FORMAT 7: VISUAL_SPOTTER (DIAGRAM PLATE OR WORLD MAP PIN VIEW)
  // ==========================================================================

  private mountVisualSpotter(bodyEl: HTMLElement, instructionEl: HTMLElement): void {
    const spec = this.ctx?.card.visualSpotter;
    if (!spec) {
      this.mountMultipleChoice(bodyEl);
      return;
    }

    const isMap = spec.visualKind === 'WORLD_REGION_MAP';
    instructionEl.hidden = false;
    instructionEl.innerHTML = isMap
      ? `${iconSpan('target', 16)} <span>Inspect the glowing broadcast beacon on the World Map and pick its location!</span>`
      : `${iconSpan('eye', 16)} <span>Examine the visual plate closely and lock in the right identification!</span>`;

    const visualMediaHtml = isMap
      ? this.renderWorldMapPinSvg(spec.targetLat ?? 0, spec.targetLon ?? 0)
      : `<img src="${escapeHtml(spec.imageUrl || './assets/visuals/arch_eiffel_tower.svg')}" alt="${escapeHtml(spec.caption || 'Visual clue diagram')}" data-ws4-visual-img />`;

    bodyEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${this.renderLifelineBarHtml({ allow5050: true, allowHint: true, allowDoubleDown: true })}
        <div class="ws4-visual-stage">
          <figure class="ws4-visual-frame ${isMap ? 'is-map' : ''}" style="margin:0;">
            <div class="ws4-visual-media">${visualMediaHtml}</div>
            <figcaption class="ws4-visual-caption">
              ${escapeHtml(
                spec.caption ||
                  (isMap
                    ? `Target Beacon · ${Math.abs(spec.targetLat ?? 0).toFixed(1)}°${(spec.targetLat ?? 0) >= 0 ? 'N' : 'S'}, ${Math.abs(spec.targetLon ?? 0).toFixed(1)}°${(spec.targetLon ?? 0) >= 0 ? 'E' : 'W'}`
                    : 'Studio Visual Plate'),
              )}
            </figcaption>
          </figure>

          <div class="ws4-choices-grid" style="grid-template-columns:1fr;align-content:center;" data-ws4-choices-grid>
            ${spec.choices
              .map(
                (text, idx) => `
              <button type="button" class="ws4-plaque" data-choice-index="${idx}">
                <span class="ws4-plaque-letter">${CHOICE_LETTERS[idx]}</span>
                <span class="ws4-plaque-text">${escapeHtml(text)}</span>
              </button>`,
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    // Graceful SVG diagram fallback if an asset URL ever 404s
    const imgEl = bodyEl.querySelector<HTMLImageElement>('[data-ws4-visual-img]');
    if (imgEl) {
      imgEl.addEventListener('error', () => {
        const parent = imgEl.parentElement;
        if (parent) {
          parent.innerHTML = `<div style="color:#1b2844;text-align:center;padding:18px;font-weight:700;">
            ${iconSpan('eye', 36)}
            <div style="margin-top:8px;">${escapeHtml(spec.caption || 'Studio Visual Reference')}</div>
          </div>`;
        }
      });
    }

    this.bindLifelineBar(bodyEl);
    this.bind4ChoiceButtons(bodyEl, 'VISUAL_SPOTTER');
  }

  /**
   * Stylized vector World Map with clean continent silhouettes, graticule, and pulsing pin beacon.
   */
  private renderWorldMapPinSvg(lat: number, lon: number): string {
    const clampedLat = Math.max(-85, Math.min(85, lat));
    const clampedLon = Math.max(-180, Math.min(180, lon));
    const px = ((clampedLon + 180) / 360) * 600;
    const py = ((90 - clampedLat) / 180) * 300;

    return `
      <svg class="ws4-map-svg" viewBox="0 0 600 300" role="img" aria-label="World map showing target pin">
        <defs>
          <radialGradient id="ws4MapOcean" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stop-color="#12305c"/>
            <stop offset="100%" stop-color="#07152c"/>
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="600" height="300" fill="url(#ws4MapOcean)"/>
        <!-- Graticule Grid -->
        <g stroke="rgba(130, 185, 255, 0.14)" stroke-width="0.9">
          <line x1="0" y1="75" x2="600" y2="75"/>
          <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(245, 196, 81, 0.24)" stroke-dasharray="4 4"/>
          <line x1="0" y1="225" x2="600" y2="225"/>
          <line x1="100" y1="0" x2="100" y2="300"/>
          <line x1="200" y1="0" x2="200" y2="300"/>
          <line x1="300" y1="0" x2="300" y2="300" stroke="rgba(245, 196, 81, 0.22)" stroke-dasharray="4 4"/>
          <line x1="400" y1="0" x2="400" y2="300"/>
          <line x1="500" y1="0" x2="500" y2="300"/>
        </g>
        <!-- Stylized Vector Continents (Equirectangular 600x300) -->
        <g fill="#214d7a" stroke="#5398d9" stroke-width="1.15" stroke-linejoin="round">
          <!-- North America -->
          <path d="M52 54 L94 42 L152 46 L184 70 L176 92 L156 105 L146 128 L134 134 L126 122 L106 112 L88 94 L66 78 Z"/>
          <!-- Greenland -->
          <path d="M210 24 L244 22 L252 44 L228 56 L210 42 Z"/>
          <!-- South America -->
          <path d="M168 144 L196 150 L224 176 L214 206 L194 246 L180 260 L174 236 L166 196 L158 164 Z"/>
          <!-- Europe -->
          <path d="M276 54 L318 46 L354 54 L360 76 L338 88 L308 86 L284 94 L274 78 Z"/>
          <!-- Africa -->
          <path d="M274 108 L314 102 L352 114 L374 146 L362 184 L344 226 L320 232 L304 196 L296 164 L268 144 Z"/>
          <!-- Asia -->
          <path d="M356 48 L434 40 L512 52 L538 72 L514 96 L494 118 L466 144 L436 148 L412 126 L388 134 L362 110 L352 84 Z"/>
          <!-- Japan & SE Asia Islands -->
          <path d="M524 84 L536 92 L528 106 L518 98 Z"/>
          <path d="M474 156 L504 162 L512 172 L476 168 Z"/>
          <!-- Australia & NZ -->
          <path d="M478 192 L524 186 L544 210 L534 236 L492 234 L474 214 Z"/>
          <path d="M560 228 L572 242 L564 252 L554 238 Z"/>
        </g>
        <!-- Crosshair Lines -->
        <line x1="${px.toFixed(1)}" y1="0" x2="${px.toFixed(1)}" y2="300" stroke="rgba(255, 224, 130, 0.35)" stroke-width="1" stroke-dasharray="3 4"/>
        <line x1="0" y1="${py.toFixed(1)}" x2="600" y2="${py.toFixed(1)}" stroke="rgba(255, 224, 130, 0.35)" stroke-width="1" stroke-dasharray="3 4"/>
        <!-- Target Beacon -->
        <circle class="ws4-map-pin-pulse" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="11" fill="none" stroke="#ffe082" stroke-width="2.2"/>
        <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="10" fill="rgba(245, 196, 81, 0.25)" stroke="#ffe082" stroke-width="1.8"/>
        <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.5" fill="#ff5b71" stroke="#ffffff" stroke-width="1.8"/>
      </svg>
    `;
  }

  // ==========================================================================
  // SHARED LIFELINE BAR & 4-CHOICE LOCK-IN PULSE HELPERS
  // ==========================================================================

  private renderLifelineBarHtml(opts: {
    allow5050: boolean;
    allowHint: boolean;
    allowDoubleDown: boolean;
  }): string {
    if (!this.ctx) return '';
    const base = this.getEffectivePointBase();
    const doubleWin = base * 2;
    const doubleMiss = Math.round(base * 0.5);
    const hasPowerPlay = Boolean(this.ctx.activeWagerPoints && this.ctx.activeWagerPoints > 0);

    return `
      <div class="ws4-lifeline-bar">
        <div class="ws4-lifeline-group">
          ${
            opts.allow5050
              ? `<button type="button" class="ws4-lifeline-btn" data-ws4-btn-5050 ${this.ctx.lifelines5050Left <= 0 ? 'disabled' : ''}>
                   ${iconSpan('split5050', 17)}
                   <span>50/50</span>
                   <span class="ws4-stakes-tag" data-ws4-ll-count>${this.ctx.lifelines5050Left}</span>
                 </button>`
              : ''
          }
          ${
            opts.allowHint
              ? `<button type="button" class="ws4-lifeline-btn" data-ws4-btn-hint ${this.ctx.lifelinesHintLeft <= 0 ? 'disabled' : ''}>
                   ${iconSpan('clue', 17)}
                   <span>Clue</span>
                   <span class="ws4-stakes-tag" data-ws4-ll-count>${this.ctx.lifelinesHintLeft}</span>
                 </button>`
              : ''
          }
        </div>
        ${
          opts.allowDoubleDown && !hasPowerPlay
            ? `<button type="button" class="ws4-double-btn" data-ws4-btn-double aria-pressed="false">
                 ${iconSpan('double2x', 17)}
                 <span>2× Double Down</span>
                 <span class="ws4-stakes-tag">+${doubleWin.toLocaleString('en-US')} / -${doubleMiss.toLocaleString('en-US')}</span>
               </button>`
            : ''
        }
      </div>
    `;
  }

  private bindLifelineBar(scope: HTMLElement): void {
    this.btn5050El = scope.querySelector('[data-ws4-btn-5050]');
    this.btnHintEl = scope.querySelector('[data-ws4-btn-hint]');
    this.btnDoubleEl = scope.querySelector('[data-ws4-btn-double]');

    this.btn5050El?.addEventListener('click', () => {
      if (this.submitted || this.used5050) return;
      this.apply5050Elimination();
      this.callbacks?.onUse5050?.();
    });

    this.btnHintEl?.addEventListener('click', () => {
      if (this.submitted || this.usedHint) return;
      this.revealHint();
      this.callbacks?.onUseHint?.();
    });

    this.btnDoubleEl?.addEventListener('click', () => {
      if (this.submitted) return;
      this.doubleDownArmed = !this.doubleDownArmed;
      this.btnDoubleEl!.setAttribute('aria-pressed', String(this.doubleDownArmed));
      this.callbacks?.onInteractionFeedback?.('tap');
      this.callbacks?.onDoubleDownToggle?.(this.doubleDownArmed);
    });
  }

  private bind4ChoiceButtons(
    scope: HTMLElement,
    format: 'MULTIPLE_CHOICE' | 'CLUE_ESCALATOR' | 'VISUAL_SPOTTER',
  ): void {
    this.choiceButtons = Array.from(scope.querySelectorAll<HTMLButtonElement>('[data-choice-index]'));
    this.chosenChoiceIndex = null;

    this.choiceButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.submitted || btn.disabled) return;
        const idx = Number(btn.dataset.choiceIndex);
        this.commit4Choice(idx, format);
      });
    });
  }

  private commit4Choice(
    idx: number,
    format: 'MULTIPLE_CHOICE' | 'CLUE_ESCALATOR' | 'VISUAL_SPOTTER',
  ): void {
    if (this.submitted) return;
    this.submitted = true;
    this.chosenChoiceIndex = idx;
    this.disableLifelineControls();

    // Disable all plaques immediately & pulse chosen plaque gold for 360ms
    this.choiceButtons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === idx) {
        btn.classList.add('ws4-locked-in');
      }
    });
    this.callbacks?.onInteractionFeedback?.('lock_in');

    this.lockPulseTimer = window.setTimeout(() => {
      this.lockPulseTimer = null;
      this.emitSubmission({
        format,
        chosenIndex: idx,
        escalatorCluesRevealed:
          format === 'CLUE_ESCALATOR' ? this.escalatorRevealedCount : undefined,
      });
    }, 360);
  }

  private reveal4ChoiceOutcome(card: QuestionCardV4): void {
    const correctIdx = this.get4ChoiceCorrectIndex(card);
    this.choiceButtons.forEach((btn, idx) => {
      btn.disabled = true;
      btn.classList.remove('ws4-locked-in');
      if (idx === correctIdx) {
        btn.classList.add('ws4-correct');
      } else if (idx === this.chosenChoiceIndex) {
        btn.classList.add('ws4-wrong');
      } else {
        btn.classList.add('ws4-dim-after');
      }
    });
  }

  private get4ChoiceCorrectIndex(card: QuestionCardV4): number | null {
    if (card.format === 'MULTIPLE_CHOICE') return card.correctIndex ?? 0;
    if (card.format === 'CLUE_ESCALATOR') return card.escalator?.correctIndex ?? 0;
    if (card.format === 'VISUAL_SPOTTER') return card.visualSpotter?.correctIndex ?? 0;
    return null;
  }

  private disableLifelineControls(): void {
    if (this.btn5050El) this.btn5050El.disabled = true;
    if (this.btnHintEl) this.btnHintEl.disabled = true;
    if (this.btnDoubleEl) this.btnDoubleEl.disabled = true;
  }

  private emitSubmission(partial: Omit<AnswerSubmissionV4, 'elapsedSec'>): void {
    const elapsedSec = Math.max(0.1, Number(((performance.now() - this.mountedAtMs) / 1000).toFixed(2)));
    const submission: AnswerSubmissionV4 = {
      ...partial,
      elapsedSec,
      used5050: this.used5050,
      usedHint: this.usedHint,
      doubleDownArmed: this.doubleDownArmed,
    };
    void this.callbacks?.onSubmit(submission);
  }

  private attachKeyboardShortcuts(): void {
    const onKeyDown = (ev: KeyboardEvent): void => {
      if (!this.ctx) return;
      const target = ev.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (this.revealed && (ev.key === 'Enter' || ev.key === ' ')) {
        ev.preventDefault();
        this.callbacks?.onNext?.();
        return;
      }

      if (
        !this.submitted &&
        (this.ctx.card.format === 'MULTIPLE_CHOICE' ||
          this.ctx.card.format === 'CLUE_ESCALATOR' ||
          this.ctx.card.format === 'VISUAL_SPOTTER')
      ) {
        const keyMap: Record<string, number> = {
          '1': 0,
          '2': 1,
          '3': 2,
          '4': 3,
          a: 0,
          b: 1,
          c: 2,
          d: 3,
        };
        const idx = keyMap[ev.key.toLowerCase()];
        if (idx !== undefined && this.choiceButtons[idx] && !this.choiceButtons[idx].disabled) {
          ev.preventDefault();
          this.commit4Choice(idx, this.ctx.card.format);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    this.cleanupFns.push(() => window.removeEventListener('keydown', onKeyDown));
  }

  private getEffectivePointBase(): number {
    if (!this.ctx) return 200;
    if (this.ctx.activeWagerPoints && this.ctx.activeWagerPoints > 0) {
      return this.ctx.activeWagerPoints;
    }
    const mult = this.ctx.doublePotMultiplier && this.ctx.doublePotMultiplier > 1 ? this.ctx.doublePotMultiplier : 1;
    return this.ctx.tilePointValue * mult;
  }

  private getFormatDisplayLabel(format: QuestionCardV4['format']): string {
    switch (format) {
      case 'MULTIPLE_CHOICE':
        return '4-Choice Showdown';
      case 'MATCH_4':
        return 'Match-4 Wires';
      case 'SORT_4':
        return 'Order Sort-4';
      case 'MULTI_STRIKE':
        return 'Multi-Strike';
      case 'PINPOINT_DIAL':
        return 'Pinpoint Dial';
      case 'CLUE_ESCALATOR':
        return '3-Clue Escalator';
      case 'VISUAL_SPOTTER':
        return 'Visual Spotter';
    }
  }

  private teardownActiveState(): void {
    if (this.lockPulseTimer !== null) {
      window.clearTimeout(this.lockPulseTimer);
      this.lockPulseTimer = null;
    }
    if (this.matchResizeObserver) {
      this.matchResizeObserver.disconnect();
      this.matchResizeObserver = null;
    }
    for (const fn of this.cleanupFns) {
      fn();
    }
    this.cleanupFns = [];
    this.choiceButtons = [];
    this.matchLeftButtons.clear();
    this.matchRightButtons.clear();
    this.multiButtons.clear();
    this.dialStepBtns = [];
    this.escalatorCards = [];
    this.matchDragState = null;
    this.sortDragIndex = null;
  }
}
