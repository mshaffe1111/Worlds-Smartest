// ============================================================================
// WORLD'S SMARTEST — Readable Human Tells Choreographer & Soren 24K Coin Rig
// Implements docs/PITCH_BIBLE.md §2.5 ("Readable Human Tells!")
//
// Renders unmistakable, high-craft animated visual tells + diegetic micro-captions
// pinned directly onto CharacterStageActor & its surrounding stage card:
//   • Julian Vance: Gleaming brass cufflink/lapel star-glint when withholding
//     truth or bluffing vs rhythmic right-ear golden stylus double-tap ripples!
//   • Nadia Al-Mansoor: Micro-blink, corner smirk highlight & amber eye-glint
//     before locking a lethal hit vs jaw-tension crimson pulse when rattled!
//   • Soren "Echo" Kael: Actual animated 3D-projected spinning 24K gold coin
//     rolling across the card edge — FREEZES DEAD with a cyan Horizon smart-lens
//     glint on a genuine earpiece hit, or spins unevenly with friction sparks
//     when bluffing an Overclock (surfacing the >=44px interactive CALL BLUFF button)!
//   • Mateo "Teo" Rojas: Rapid control-room camera tally-light strobe blink
//     before delivering a covert backstage whisper or warning of a tapped line!
//   • Chancellor Lindqvist: Blinding platinum spectacle lens glint & slow
//     frame-lowering fade before delivering a threat, deal, or Sovereign bluff!
//   • Tariq Al-Mansoor: Sacred-geometry Meridian Zero golden triangle trace!
// ============================================================================

import type { CastMemberId } from '../narrative/InkBlackboard';
import type { BluffCallOutcome, RivalLiveHUDState } from '../narrative/RivalAI';
import {
  CharacterStageActor,
  hexToRgba,
  normalizeCastId,
  type ActorMoodTint,
  type ProjectedStageMetrics,
} from './CharacterStageActor';

export type CharacterTellId =
  | 'NONE'
  // Julian Vance
  | 'VANCE_IDLE_ASTROLABE'
  | 'VANCE_CUFFLINK_GLINT'
  | 'VANCE_STYLUS_TAP'
  // Nadia Al-Mansoor
  | 'NADIA_IDLE_ACOUSTIC'
  | 'NADIA_SMIRK_EYE_GLINT'
  | 'NADIA_JAW_CRIMSON_PULSE'
  // Soren "Echo" Kael
  | 'SOREN_COIN_IDLE_ROLL'
  | 'SOREN_COIN_FREEZE_HIT'
  | 'SOREN_COIN_UNEVEN_BLUFF'
  | 'SOREN_EARPIECE_JAMMED'
  // Mateo "Teo" Rojas
  | 'TEO_CONSOLE_STEADY'
  | 'TEO_TALLY_BLINK'
  // Chancellor Ingrid Lindqvist
  | 'LINDQVIST_POISE_FIRM'
  | 'LINDQVIST_SPECTACLE_GLINT_FADE'
  // Tariq Al-Mansoor
  | 'TARIQ_TRIANGLE_RESONANCE'
  | 'TARIQ_TRIANGLE_HESITATION';

export type TellReadabilityKind = 'IDLE' | 'GENUINE_HIT' | 'BLUFF_OR_COVERT' | 'JAMMED';

export interface TellVisualDescriptor {
  id: CharacterTellId;
  actorId: CastMemberId;
  kind: TellReadabilityKind;
  microCaption: string;
  accentHex: string;
  moodTint: ActorMoodTint;
}

export const TELL_DESCRIPTORS: Record<CharacterTellId, TellVisualDescriptor> = {
  NONE: {
    id: 'NONE',
    actorId: 'vance',
    kind: 'IDLE',
    microCaption: '',
    accentHex: '#d8af57',
    moodTint: 'default',
  },
  VANCE_IDLE_ASTROLABE: {
    id: 'VANCE_IDLE_ASTROLABE',
    actorId: 'vance',
    kind: 'IDLE',
    microCaption: 'Astrolabe poised beside the mic',
    accentHex: '#e8c474',
    moodTint: 'default',
  },
  VANCE_CUFFLINK_GLINT: {
    id: 'VANCE_CUFFLINK_GLINT',
    actorId: 'vance',
    kind: 'BLUFF_OR_COVERT',
    microCaption: 'Brass cufflink glint · Withholding truth',
    accentHex: '#ff9b54',
    moodTint: 'gold',
  },
  VANCE_STYLUS_TAP: {
    id: 'VANCE_STYLUS_TAP',
    actorId: 'vance',
    kind: 'GENUINE_HIT',
    microCaption: 'Stylus double-tap · Impressed',
    accentHex: '#fae29c',
    moodTint: 'gold',
  },
  NADIA_IDLE_ACOUSTIC: {
    id: 'NADIA_IDLE_ACOUSTIC',
    actorId: 'nadia',
    kind: 'IDLE',
    microCaption: 'Measured acoustic focus',
    accentHex: '#48b8f0',
    moodTint: 'default',
  },
  NADIA_SMIRK_EYE_GLINT: {
    id: 'NADIA_SMIRK_EYE_GLINT',
    actorId: 'nadia',
    kind: 'GENUINE_HIT',
    microCaption: 'Amber eye-glint · Lethal lock',
    accentHex: '#ffc25c',
    moodTint: 'gold',
  },
  NADIA_JAW_CRIMSON_PULSE: {
    id: 'NADIA_JAW_CRIMSON_PULSE',
    actorId: 'nadia',
    kind: 'BLUFF_OR_COVERT',
    microCaption: 'Jaw crimson pulse · Rattled bluff',
    accentHex: '#ff5468',
    moodTint: 'crimson',
  },
  SOREN_COIN_IDLE_ROLL: {
    id: 'SOREN_COIN_IDLE_ROLL',
    actorId: 'soren',
    kind: 'IDLE',
    microCaption: '24K gold coin rolling smoothly',
    accentHex: '#f2cf7e',
    moodTint: 'default',
  },
  SOREN_COIN_FREEZE_HIT: {
    id: 'SOREN_COIN_FREEZE_HIT',
    actorId: 'soren',
    kind: 'GENUINE_HIT',
    microCaption: '24K coin FROZE · Smart-lens lock!',
    accentHex: '#56d4f5',
    moodTint: 'cyan',
  },
  SOREN_COIN_UNEVEN_BLUFF: {
    id: 'SOREN_COIN_UNEVEN_BLUFF',
    actorId: 'soren',
    kind: 'BLUFF_OR_COVERT',
    microCaption: '24K coin uneven · Overclock bluff!',
    accentHex: '#ff6476',
    moodTint: 'crimson',
  },
  SOREN_EARPIECE_JAMMED: {
    id: 'SOREN_EARPIECE_JAMMED',
    actorId: 'soren',
    kind: 'JAMMED',
    microCaption: 'Earpiece jammed · Analog static!',
    accentHex: '#f09d46',
    moodTint: 'crimson',
  },
  TEO_CONSOLE_STEADY: {
    id: 'TEO_CONSOLE_STEADY',
    actorId: 'teo',
    kind: 'GENUINE_HIT',
    microCaption: 'Console uplink clean · Unmonitored',
    accentHex: '#39d49a',
    moodTint: 'emerald',
  },
  TEO_TALLY_BLINK: {
    id: 'TEO_TALLY_BLINK',
    actorId: 'teo',
    kind: 'BLUFF_OR_COVERT',
    microCaption: 'Tally light blinking · Covert whisper',
    accentHex: '#ff5263',
    moodTint: 'crimson',
  },
  LINDQVIST_POISE_FIRM: {
    id: 'LINDQVIST_POISE_FIRM',
    actorId: 'lindqvist',
    kind: 'GENUINE_HIT',
    microCaption: 'Spectacles steady · Sovereign poise',
    accentHex: '#dceaff',
    moodTint: 'platinum',
  },
  LINDQVIST_SPECTACLE_GLINT_FADE: {
    id: 'LINDQVIST_SPECTACLE_GLINT_FADE',
    actorId: 'lindqvist',
    kind: 'BLUFF_OR_COVERT',
    microCaption: 'Spectacle glint fade · Deal or threat',
    accentHex: '#eef5ff',
    moodTint: 'platinum',
  },
  TARIQ_TRIANGLE_RESONANCE: {
    id: 'TARIQ_TRIANGLE_RESONANCE',
    actorId: 'tariq',
    kind: 'GENUINE_HIT',
    microCaption: 'Meridian triangle · 99.4% resonance',
    accentHex: '#f2c166',
    moodTint: 'gold',
  },
  TARIQ_TRIANGLE_HESITATION: {
    id: 'TARIQ_TRIANGLE_HESITATION',
    actorId: 'tariq',
    kind: 'BLUFF_OR_COVERT',
    microCaption: 'Fractured triangle · Testing your nerve',
    accentHex: '#f09d46',
    moodTint: 'gold',
  },
};

export interface CharacterTellsChoreographerOptions {
  actor?: CharacterStageActor | null;
  onCallBluff?: () => BluffCallOutcome | void;
  showMicroCaption?: boolean;
}

interface CoinSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

function stripHistoricalYearCommas(text: string): string {
  if (!text || !text.includes(',')) return text;
  let out = text;
  out = out.replace(/(?<![\d,$+])([12]),(\d{3})(\s*[–—-]\s*)([12]),(\d{3})(?!\d)/g, '$1$2$3$4$5');
  out = out.replace(/(?<![\d,$+])([12]\d{3}\s*[–—-]\s*)([12]),(\d{3})(?!\d)/g, '$1$2$3');
  out = out.replace(
    /(?<![\d,$+])([12]),(\d{3})(?='?s\b|\s*(?:CE|BCE|AD|BC)\b|\s*[–—-]\s*[12]\d{3}\b)/gi,
    '$1$2',
  );
  out = out.replace(/([(\[])([12]),(\d{3})([)\]])/g, '$1$2$3$4');
  out = out.replace(
    /\b(in|of|from|since|circa|c\.|until|by|year|years|around|during|before|after|between|to|through|founded|established|born|died|vanished|missing|trial|act|season)\s+([12]),(\d{3})(?!\d|\s*(?:pts|points|million|billion|thousand|dollars|usd|eur|chf|km|mi|ft)\b)/gi,
    '$1 $2$3',
  );
  return out;
}

let tellsStylesInjected = false;

function ensureTellsStyles(): void {
  if (tellsStylesInjected || typeof document === 'undefined') return;
  tellsStylesInjected = true;
  const style = document.createElement('style');
  style.id = 'ws-character-tells-styles';
  style.textContent = `
    .ws-tell-hud-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px 10px;
      width: 100%;
      max-width: 100%;
      min-width: 0;
      margin-top: 2px;
      background: transparent;
      border: none;
      pointer-events: auto;
    }
    /* Sleek 2026 Frameless Floating Broadcast Whisper Tag (Zero Nested Boxes, Zero Mid-Word Clip!) */
    .ws-tell-micro-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      max-width: 100%;
      padding: 2px 8px 2px 8px;
      border-radius: 2px;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: clamp(10px, 0.95vw, 11px);
      font-weight: 600;
      letter-spacing: 0.02em;
      line-height: 1.28;
      background: linear-gradient(90deg, rgba(242, 207, 126, 0.11) 0%, rgba(242, 207, 126, 0) 94%);
      border: none;
      box-shadow: inset 2px 0 0 rgba(242, 207, 126, 0.68);
      color: var(--gold-bright, #f2cf7e);
      text-shadow: 0 1px 8px rgba(0, 0, 0, 0.90);
      white-space: normal;
      overflow: visible;
      pointer-events: none;
      transition: box-shadow 0.18s ease, color 0.18s ease, background 0.18s ease;
    }
    .ws-actor-tell-cluster .ws-tell-micro-badge {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ws-tell-micro-badge[data-kind="GENUINE_HIT"] {
      background: linear-gradient(90deg, rgba(86, 212, 245, 0.16) 0%, rgba(86, 212, 245, 0) 94%);
      border: none;
      box-shadow: inset 2px 0 0 #56d4f5;
      color: #9beaff;
    }
    .ws-tell-micro-badge[data-kind="BLUFF_OR_COVERT"] {
      background: linear-gradient(90deg, rgba(255, 92, 114, 0.20) 0%, rgba(255, 92, 114, 0) 94%);
      border: none;
      box-shadow: inset 2px 0 0 #ff5c72;
      color: #ffb6c0;
    }
    .ws-tell-micro-badge[data-kind="JAMMED"] {
      background: linear-gradient(90deg, rgba(240, 157, 70, 0.18) 0%, rgba(240, 157, 70, 0) 94%);
      border: none;
      box-shadow: inset 2px 0 0 #f09d46;
      color: #ffc98b;
    }
    .ws-tell-micro-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      flex-shrink: 0;
      background: currentColor;
      box-shadow: 0 0 8px currentColor;
    }
    /* Frameless Floating Broadcast CALL BLUFF Trigger (>= 44px Ergonomic Touch Target, Zero Heavy Box Border!) */
    .ws-call-bluff-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 44px;
      min-width: 118px;
      max-width: 100%;
      padding: 0 16px;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(232, 56, 82, 0.94) 0%, rgba(154, 18, 40, 0.96) 100%);
      border: none;
      color: #fff9fa;
      font-family: var(--font-display, Georgia, serif);
      font-size: clamp(10.5px, 1vw, 12px);
      font-weight: 800;
      letter-spacing: 0.08em;
      font-variant-numeric: tabular-nums;
      text-transform: uppercase;
      white-space: nowrap;
      flex-shrink: 0;
      cursor: pointer;
      touch-action: manipulation;
      box-shadow:
        0 6px 20px rgba(224, 62, 86, 0.46),
        inset 0 1px 0 rgba(255, 226, 230, 0.46);
      animation: wsCallBluffPulse 0.62s ease-in-out infinite alternate;
      pointer-events: auto;
    }
    .ws-call-bluff-btn:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .ws-call-bluff-btn:active:not(:disabled) {
      transform: scale(0.98);
    }
    @keyframes wsCallBluffPulse {
      from {
        box-shadow:
          0 4px 14px rgba(224, 62, 86, 0.38),
          inset 0 1px 0 rgba(255, 226, 230, 0.40);
      }
      to {
        box-shadow:
          0 6px 24px rgba(255, 96, 118, 0.78),
          inset 0 1px 0 rgba(255, 236, 238, 0.62);
      }
    }
    .ws-soren-coin-rail {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 24px;
      pointer-events: none;
      overflow: hidden;
      z-index: 4;
    }
    /* Frameless Broadcast Verdict Ribbon (Zero Closed Box Border!) */
    .ws-bluff-verdict-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 10px 2px 8px;
      border-radius: 2px;
      border: none;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      font-variant-numeric: tabular-nums;
      text-shadow: 0 1px 8px rgba(0, 0, 0, 0.88);
      pointer-events: none;
    }
    .ws-bluff-verdict-pill.is-caught {
      background: linear-gradient(90deg, rgba(57, 212, 154, 0.22) 0%, rgba(57, 212, 154, 0.03) 100%);
      box-shadow: inset 2px 0 0 #39d49a;
      color: #82f9cb;
    }
    .ws-bluff-verdict-pill.is-genuine {
      background: linear-gradient(90deg, rgba(242, 207, 126, 0.22) 0%, rgba(242, 207, 126, 0.03) 100%);
      box-shadow: inset 2px 0 0 #f2cf7e;
      color: #ffe49e;
    }
  `;
  document.head.appendChild(style);
}

export class CharacterTellsChoreographer {
  private actor: CharacterStageActor | null = null;
  private detachActorOverlay: (() => void) | null = null;

  private readonly hudBarEl: HTMLDivElement;
  private readonly badgeEl: HTMLDivElement;
  private readonly badgeDotEl: HTMLSpanElement;
  private readonly badgeTextEl: HTMLSpanElement;
  private readonly callBluffBtn: HTMLButtonElement;
  private readonly verdictPillEl: HTMLSpanElement;

  // Soren's Dedicated Card-Edge 24K Gold Coin Canvas Rail
  private readonly coinRailWrap: HTMLDivElement;
  private readonly coinCanvas: HTMLCanvasElement;
  private readonly coinCtx: CanvasRenderingContext2D | null;
  private coinCardContainer: HTMLElement | null = null;
  private coinResizeObserver: ResizeObserver | null = null;
  private coinWidth = 220;
  private coinHeight = 24;
  private coinDpr = 1;
  private coinRafId = 0;
  private lastCoinMs = 0;

  // Soren 24K Coin Physics State
  private coinNormX = 0.22; // 0.08 .. 0.92 across card edge
  private coinDir: 1 | -1 = 1;
  private coinSpinAngle = 0; // radians; 0 = full obverse face-on!
  private coinTiltRad = 0;
  private coinFreezeFlash01 = 0;
  private readonly coinSparks: CoinSpark[] = [];

  // Active Tell State
  private currentTell: CharacterTellId = 'NONE';
  private tellStartedSec = 0;
  private localClockSec = 0;
  private showMicroCaption: boolean;

  // Call Bluff Interactive State
  private onCallBluffCallback: (() => BluffCallOutcome | void) | null = null;
  private callBluffOpen = false;
  private callBluffRemainingSec = 0;
  private verdictClearTimer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  constructor(options: CharacterTellsChoreographerOptions = {}) {
    ensureTellsStyles();
    this.showMicroCaption = options.showMicroCaption ?? true;
    this.onCallBluffCallback = options.onCallBluff ?? null;

    // 1. Diegetic Micro-Caption + >=44px CALL BLUFF Action Bar
    this.hudBarEl = document.createElement('div');
    this.hudBarEl.className = 'ws-tell-hud-bar';

    this.badgeEl = document.createElement('div');
    this.badgeEl.className = 'ws-tell-micro-badge';
    this.badgeEl.style.display = 'none';

    this.badgeDotEl = document.createElement('span');
    this.badgeDotEl.className = 'ws-tell-micro-dot';
    this.badgeTextEl = document.createElement('span');
    this.badgeTextEl.style.cssText = 'min-width:0;overflow:inherit;text-overflow:inherit;white-space:inherit;';
    this.badgeEl.append(this.badgeDotEl, this.badgeTextEl);

    this.callBluffBtn = document.createElement('button');
    this.callBluffBtn.type = 'button';
    this.callBluffBtn.className = 'ws-call-bluff-btn';
    this.callBluffBtn.style.display = 'none';
    this.callBluffBtn.setAttribute('aria-label', 'Call Rival Overclock Bluff');
    this.callBluffBtn.textContent = '⚡ CALL BLUFF';
    this.callBluffBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.handleCallBluffClicked();
    });

    this.verdictPillEl = document.createElement('span');
    this.verdictPillEl.className = 'ws-bluff-verdict-pill';
    this.verdictPillEl.style.display = 'none';

    this.hudBarEl.append(this.badgeEl, this.callBluffBtn, this.verdictPillEl);

    // 2. Soren's 24K Gold Coin Card-Edge Rail Canvas
    this.coinRailWrap = document.createElement('div');
    this.coinRailWrap.className = 'ws-soren-coin-rail';
    this.coinRailWrap.style.display = 'none';

    this.coinCanvas = document.createElement('canvas');
    this.coinCanvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
    this.coinRailWrap.appendChild(this.coinCanvas);
    this.coinCtx = this.coinCanvas.getContext('2d', { alpha: true });

    if (typeof ResizeObserver !== 'undefined') {
      this.coinResizeObserver = new ResizeObserver(() => this.syncCoinCanvasDimensions());
      this.coinResizeObserver.observe(this.coinRailWrap);
    }

    if (options.actor) {
      this.attachStageActor(options.actor);
    }
  }

  /** Connects to a CharacterStageActor so anatomical glints/ripples project in 1:1 sync! */
  public attachStageActor(actor: CharacterStageActor | null): this {
    this.detachActorOverlay?.();
    this.detachActorOverlay = null;
    this.actor = actor;
    if (actor) {
      this.detachActorOverlay = actor.addOverlayLayer((ctx, metrics) => {
        this.renderActorAnatomicalTell(ctx, metrics);
      });
    }
    return this;
  }

  /**
   * Mounts the diegetic micro-caption & CALL BLUFF bar inside any HUD tell container
   * (e.g. `.ws-tell-copy` or story dialogue header). Zero-blink re-parenting!
   */
  public mountHudBar(container: HTMLElement): this {
    if (this.disposed) return this;
    if (this.hudBarEl.parentElement !== container) {
      container.appendChild(this.hudBarEl);
    }
    return this;
  }

  /**
   * Attaches Soren's animated 24K gold coin edge-track onto the stage card container
   * (e.g. `.ws-actor-tell-cluster` or story card). Automatically ensures `position: relative; overflow: hidden`.
   */
  public attachCardEdgeContainer(cardContainer: HTMLElement): this {
    if (this.disposed) return this;
    this.coinCardContainer = cardContainer;
    const computed = window.getComputedStyle(cardContainer);
    if (computed.position === 'static') {
      cardContainer.style.position = 'relative';
    }
    if (this.coinRailWrap.parentElement !== cardContainer) {
      cardContainer.appendChild(this.coinRailWrap);
    }
    this.syncCoinCanvasDimensions();
    this.updateCoinVisibility();
    return this;
  }

  public getHudBarElement(): HTMLElement {
    return this.hudBarEl;
  }

  public getCoinRailElement(): HTMLElement {
    return this.coinRailWrap;
  }

  public setOnCallBluff(handler: (() => BluffCallOutcome | void) | null): this {
    this.onCallBluffCallback = handler;
    return this;
  }

  public getActiveTell(): CharacterTellId {
    return this.currentTell;
  }

  /** Explicitly triggers any named tell cue */
  public triggerTell(tellId: CharacterTellId): void {
    if (this.currentTell === tellId) return;
    this.currentTell = tellId;
    this.tellStartedSec = this.localClockSec;

    const desc = TELL_DESCRIPTORS[tellId] ?? TELL_DESCRIPTORS.NONE;
    if (this.actor) {
      this.actor.setMoodTint(desc.moodTint);
      if (tellId === 'NADIA_SMIRK_EYE_GLINT' || tellId === 'LINDQVIST_SPECTACLE_GLINT_FADE') {
        this.actor.triggerMicroBlink();
      }
    }

    if (tellId === 'SOREN_COIN_FREEZE_HIT') {
      this.coinFreezeFlash01 = 1.0;
    }

    this.refreshMicroBadgeDom(desc);
    this.updateCoinVisibility();
  }

  private prevRivalStatus: string = 'HIDDEN';

  /**
   * Plug-and-play real-time sync directly from RivalAI's `RivalLiveHUDState`!
   * Strictly honors gameplay timing: never leaks bluff vs genuine before OVERCLOCKING/LOCKED!
   */
  public syncFromRivalHUD(hud: RivalLiveHUDState): void {
    if (hud.status === 'HIDDEN') {
      this.prevRivalStatus = 'HIDDEN';
      this.clearVerdictPill();
      this.triggerTell('NONE');
      this.setCallBluffWindow(false, 0);
      return;
    }

    if (this.prevRivalStatus === 'LOCKED' && hud.status === 'THINKING') {
      this.clearVerdictPill();
    }
    this.prevRivalStatus = hud.status;

    if (this.actor) {
      this.actor.setActor(hud.actorId, hud.expression);
    }

    const nextTell = deduceTellFromRivalHUD(hud);
    this.triggerTell(nextTell);
    this.setCallBluffWindow(hud.callBluffWindowOpen, hud.callBluffRemainingSec);
  }

  /**
   * Plug-and-play sync for Story Dialogue beats & Geneva Vetting Interview!
   * Automatically maps speakerId + tellText/expression to the exact signature animation.
   */
  public syncFromStoryBeat(params: {
    speakerId: string;
    expression?: string;
    tellText?: string;
    text?: string;
  }): void {
    const actorId = normalizeCastId(params.speakerId);
    if (this.actor) {
      this.actor.setActor(actorId, params.expression ?? 'neutral');
    }
    this.setCallBluffWindow(false, 0);

    const combined = `${params.tellText ?? ''} ${params.text ?? ''}`.toLowerCase();
    const expr = (params.expression ?? 'neutral').toLowerCase();

    switch (actorId) {
      case 'vance':
        if (
          combined.includes('cufflink') ||
          combined.includes('withhold') ||
          combined.includes('bluff') ||
          combined.includes('classified')
        ) {
          this.triggerTell('VANCE_CUFFLINK_GLINT');
        } else if (
          combined.includes('stylus') ||
          combined.includes('impressed') ||
          combined.includes('99.4') ||
          expr === 'smirk'
        ) {
          this.triggerTell('VANCE_STYLUS_TAP');
        } else {
          this.triggerTell('VANCE_IDLE_ASTROLABE');
        }
        break;

      case 'nadia':
        if (
          combined.includes('jaw') ||
          combined.includes('rattled') ||
          combined.includes('sabotag') ||
          expr === 'shocked'
        ) {
          this.triggerTell('NADIA_JAW_CRIMSON_PULSE');
        } else if (
          combined.includes('smirk') ||
          combined.includes('blink') ||
          combined.includes('lethal') ||
          expr === 'smirk'
        ) {
          this.triggerTell('NADIA_SMIRK_EYE_GLINT');
        } else {
          this.triggerTell('NADIA_IDLE_ACOUSTIC');
        }
        break;

      case 'soren':
        if (combined.includes('jam') || combined.includes('static')) {
          this.triggerTell('SOREN_EARPIECE_JAMMED');
        } else if (combined.includes('froze') || combined.includes('freeze')) {
          this.triggerTell('SOREN_COIN_FREEZE_HIT');
        } else if (combined.includes('bluff') || combined.includes('rapid')) {
          this.triggerTell('SOREN_COIN_UNEVEN_BLUFF');
        } else {
          this.triggerTell('SOREN_COIN_IDLE_ROLL');
        }
        break;

      case 'teo':
        if (
          combined.includes('whisper') ||
          combined.includes('camera') ||
          combined.includes('tally') ||
          combined.includes('leak') ||
          combined.includes('mirror') ||
          expr === 'intense' ||
          expr === 'shocked'
        ) {
          this.triggerTell('TEO_TALLY_BLINK');
        } else {
          this.triggerTell('TEO_CONSOLE_STEADY');
        }
        break;

      case 'lindqvist':
        if (
          combined.includes('spectacle') ||
          combined.includes('glasses') ||
          combined.includes('deal') ||
          combined.includes('briefing') ||
          combined.includes('threat') ||
          combined.includes('charter') ||
          expr === 'intense'
        ) {
          this.triggerTell('LINDQVIST_SPECTACLE_GLINT_FADE');
        } else {
          this.triggerTell('LINDQVIST_POISE_FIRM');
        }
        break;

      case 'tariq':
        if (combined.includes('pause') || combined.includes('test')) {
          this.triggerTell('TARIQ_TRIANGLE_HESITATION');
        } else {
          this.triggerTell('TARIQ_TRIANGLE_RESONANCE');
        }
        break;
    }
  }

  public setCallBluffWindow(open: boolean, remainingSec = 2.0): void {
    this.callBluffOpen = open;
    this.callBluffRemainingSec = Math.max(0, remainingSec);

    if (open) {
      this.callBluffBtn.style.display = 'inline-flex';
      const secLabel = remainingSec > 0 ? ` · ${remainingSec.toFixed(1)}s` : '';
      this.callBluffBtn.textContent = `⚡ CALL BLUFF${secLabel}`;
    } else {
      this.callBluffBtn.style.display = 'none';
    }
  }

  public notifyBluffCallResult(outcome: BluffCallOutcome): void {
    this.setCallBluffWindow(false, 0);
    if (!outcome.accepted) return;

    if (this.verdictClearTimer) {
      clearTimeout(this.verdictClearTimer);
    }

    this.verdictPillEl.style.display = 'inline-flex';
    if (outcome.wasActuallyBluffing) {
      this.verdictPillEl.className = 'ws-bluff-verdict-pill is-caught';
      this.verdictPillEl.textContent = `✓ BLUFF CAUGHT! +${outcome.playerBonusPoints.toLocaleString()} PTS`;
    } else {
      this.verdictPillEl.className = 'ws-bluff-verdict-pill is-genuine';
      this.verdictPillEl.textContent = '⚠ GENUINE WAGER — SOLVE TO MATCH!';
    }

    this.verdictClearTimer = setTimeout(() => {
      this.verdictPillEl.style.display = 'none';
    }, 3200);
  }

  public dispose(): void {
    this.disposed = true;
    this.detachActorOverlay?.();
    this.detachActorOverlay = null;
    this.stopCoinLoop();
    this.coinResizeObserver?.disconnect();
    this.coinResizeObserver = null;
    if (this.verdictClearTimer) clearTimeout(this.verdictClearTimer);
    this.hudBarEl.remove();
    this.coinRailWrap.remove();
  }

  // --------------------------------------------------------------------------
  // Internal UI & Soren 24K Coin Loop
  // --------------------------------------------------------------------------

  private clearVerdictPill(): void {
    if (this.verdictClearTimer) {
      clearTimeout(this.verdictClearTimer);
      this.verdictClearTimer = null;
    }
    this.verdictPillEl.style.display = 'none';
  }

  private handleCallBluffClicked(): void {
    if (!this.callBluffOpen || !this.onCallBluffCallback) return;
    // Lock immediately before callback to prevent double-tap race conditions!
    this.setCallBluffWindow(false, 0);
    const res = this.onCallBluffCallback();
    if (res && typeof res === 'object' && 'accepted' in res) {
      this.notifyBluffCallResult(res);
    }
  }

  private refreshMicroBadgeDom(desc: TellVisualDescriptor): void {
    if (!this.showMicroCaption || !desc.microCaption || desc.id === 'NONE') {
      this.badgeEl.style.display = 'none';
      return;
    }
    this.badgeEl.style.display = 'inline-flex';
    this.badgeEl.dataset.kind = desc.kind;
    this.badgeTextEl.textContent = stripHistoricalYearCommas(desc.microCaption);
  }

  private isSorenCoinActive(): boolean {
    return (
      this.currentTell === 'SOREN_COIN_IDLE_ROLL' ||
      this.currentTell === 'SOREN_COIN_FREEZE_HIT' ||
      this.currentTell === 'SOREN_COIN_UNEVEN_BLUFF' ||
      this.currentTell === 'SOREN_EARPIECE_JAMMED'
    );
  }

  private updateCoinVisibility(): void {
    const show = Boolean(this.coinCardContainer) && this.isSorenCoinActive();
    this.coinRailWrap.style.display = show ? 'block' : 'none';
    if (show) {
      this.syncCoinCanvasDimensions();
      this.ensureCoinLoopRunning();
    } else {
      this.stopCoinLoop();
    }
  }

  private syncCoinCanvasDimensions(): void {
    if (!this.coinRailWrap.isConnected) return;
    const rect = this.coinRailWrap.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width || this.coinCardContainer?.clientWidth || 220));
    const h = Math.max(1, Math.round(rect.height || 24));
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    if (w !== this.coinWidth || h !== this.coinHeight || dpr !== this.coinDpr) {
      this.coinWidth = w;
      this.coinHeight = h;
      this.coinDpr = dpr;
      this.coinCanvas.width = Math.round(w * dpr);
      this.coinCanvas.height = Math.round(h * dpr);
    }
  }

  private ensureCoinLoopRunning(): void {
    if (this.disposed || this.coinRafId !== 0) return;
    this.lastCoinMs = performance.now();
    const step = (now: number) => {
      if (this.disposed || !this.coinRailWrap.isConnected || !this.isSorenCoinActive()) {
        this.coinRafId = 0;
        return;
      }
      const dt = Math.min(0.064, Math.max(0.001, (now - this.lastCoinMs) / 1000));
      this.lastCoinMs = now;
      this.stepAndRenderSorenCoin(dt);
      this.coinRafId = requestAnimationFrame(step);
    };
    this.coinRafId = requestAnimationFrame(step);
  }

  private stopCoinLoop(): void {
    if (this.coinRafId !== 0) {
      cancelAnimationFrame(this.coinRafId);
      this.coinRafId = 0;
    }
  }

  /**
   * Renders Soren's signature 3D-projected 24K Gold Coin rolling along the card edge:
   * - IDLE: Smooth steady poker knuckle roll across the bottom bezel.
   * - GENUINE HIT: Snaps & FREEZES DEAD face-on inside a cyan Horizon reticle!
   * - BLUFF OVERCLOCK: Spins unevenly with erratic wobble & crimson/gold rim sparks!
   */
  private stepAndRenderSorenCoin(dt: number): void {
    const ctx = this.coinCtx;
    if (!ctx) return;

    const w = this.coinWidth;
    const h = this.coinHeight;
    const t = performance.now() * 0.001;

    if (this.currentTell === 'SOREN_COIN_FREEZE_HIT') {
      // Snap coin spin angle straight to 0 (dead-still face-on) with zero velocity!
      this.coinSpinAngle += (0 - (this.coinSpinAngle % Math.PI)) * Math.min(1, dt * 22);
      this.coinTiltRad *= Math.exp(-18 * dt);
      this.coinFreezeFlash01 = Math.max(0, this.coinFreezeFlash01 - dt * 1.6);
    } else if (this.currentTell === 'SOREN_COIN_UNEVEN_BLUFF') {
      // Uneven erratic poker-bluff spin + wobble + sparks!
      const erraticSpeed = 16.5 + 11.0 * Math.sin(t * 11.3) + 6.5 * Math.cos(t * 19.7);
      this.coinSpinAngle += erraticSpeed * dt;
      const skitterSpeed = 0.42 + 0.32 * Math.abs(Math.sin(t * 8.5));
      this.coinNormX += this.coinDir * skitterSpeed * dt;
      this.coinTiltRad = 0.34 * Math.sin(t * 21.0);

      if (Math.random() < dt * 28) {
        const cx = this.coinNormX * w;
        this.coinSparks.push({
          x: cx,
          y: h - 4,
          vx: (Math.random() - 0.5) * 48 - this.coinDir * 22,
          vy: -(14 + Math.random() * 26),
          life: 0,
          maxLife: 0.28 + Math.random() * 0.22,
          color: Math.random() > 0.45 ? '#ff6476' : '#fae29c',
        });
      }
    } else if (this.currentTell === 'SOREN_EARPIECE_JAMMED') {
      // Stuttering slow roll under signal jammer
      this.coinSpinAngle += 3.2 * dt;
      this.coinNormX += this.coinDir * 0.09 * dt;
      this.coinTiltRad = 0.14 * Math.sin(t * 32);
    } else {
      // Smooth hypnotic poker hustler roll along the card edge
      this.coinSpinAngle += 6.8 * dt;
      this.coinNormX += this.coinDir * 0.20 * dt;
      this.coinTiltRad = 0.05 * Math.sin(t * 4.2);
    }

    if (this.coinNormX >= 0.90) {
      this.coinNormX = 0.90;
      this.coinDir = -1;
    } else if (this.coinNormX <= 0.10) {
      this.coinNormX = 0.10;
      this.coinDir = 1;
    }

    ctx.save();
    ctx.setTransform(this.coinDpr, 0, 0, this.coinDpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Subtle track rail along bottom edge
    const railY = h - 2;
    const isFrozen = this.currentTell === 'SOREN_COIN_FREEZE_HIT';
    const isBluff = this.currentTell === 'SOREN_COIN_UNEVEN_BLUFF';

    ctx.strokeStyle = isFrozen
      ? 'rgba(86, 212, 245, 0.65)'
      : isBluff
        ? 'rgba(255, 92, 112, 0.55)'
        : 'rgba(216, 175, 87, 0.28)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(8, railY);
    ctx.lineTo(w - 8, railY);
    ctx.stroke();

    // Update & render friction sparks
    for (let i = this.coinSparks.length - 1; i >= 0; i--) {
      const sp = this.coinSparks[i];
      sp.life += dt;
      if (sp.life >= sp.maxLife) {
        this.coinSparks.splice(i, 1);
        continue;
      }
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 65 * dt;
      const alpha = 1 - sp.life / sp.maxLife;
      ctx.fillStyle = hexToRgba(sp.color, alpha);
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 1.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw 3D-Projected 24K Gold Coin (responsive radius so compact 390px mobile stays unoccluded)
    const coinR = w < 340 ? 5.8 : Math.min(8.2, h * 0.36);
    const coinX = this.coinNormX * w;
    const wobbleBounceY = isBluff ? Math.abs(Math.sin(t * 24)) * 2.2 : 0;
    const coinY = h - coinR - 2.2 - wobbleBounceY;

    this.drawProjected24KGoldCoin(ctx, coinX, coinY, coinR, this.coinSpinAngle, this.coinTiltRad, isFrozen, isBluff);

    ctx.restore();
  }

  private drawProjected24KGoldCoin(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    spinAngle: number,
    tiltRad: number,
    isFrozen: boolean,
    isBluff: boolean,
  ): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tiltRad);

    const cosA = isFrozen ? 1 : Math.cos(spinAngle);
    const sinA = isFrozen ? 0 : Math.sin(spinAngle);
    const faceRx = Math.max(1.4, Math.abs(cosA) * r);
    const edgeThickness = sinA * 3.1;

    // Outer telemetry halo (cyan freeze reticle vs crimson bluff aura)
    if (isFrozen) {
      const pulse = 0.72 + 0.28 * Math.sin(performance.now() * 0.008);
      ctx.strokeStyle = `rgba(86, 212, 245, ${pulse.toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r + 3.2 + this.coinFreezeFlash01 * 5, 0, Math.PI * 2);
      ctx.stroke();

      // 4 crisp reticle ticks showing the coin is FROZEN DEAD
      for (let k = 0; k < 4; k++) {
        const ang = (k * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * (r + 1.5), Math.sin(ang) * (r + 1.5));
        ctx.lineTo(Math.cos(ang) * (r + 4.8), Math.sin(ang) * (r + 4.8));
        ctx.stroke();
      }
    } else if (isBluff) {
      const glow = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r + 5);
      glow.addColorStop(0, 'rgba(255, 90, 110, 0.38)');
      glow.addColorStop(1, 'rgba(255, 90, 110, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Milled 24K Gold Coin Rim Thickness (3D cylinder side)
    if (Math.abs(edgeThickness) > 0.25) {
      ctx.fillStyle = '#9e721e';
      ctx.beginPath();
      ctx.ellipse(edgeThickness, 0, faceRx, r, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 24K Metallic Specular Coin Face
    const faceGrad = ctx.createLinearGradient(-faceRx, -r, faceRx, r);
    faceGrad.addColorStop(0, '#fff6c7');
    faceGrad.addColorStop(0.35, '#f2c968');
    faceGrad.addColorStop(0.7, '#b58327');
    faceGrad.addColorStop(1, '#ffe499');

    ctx.fillStyle = faceGrad;
    ctx.strokeStyle = isFrozen ? '#8ef0ff' : '#fff2ba';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.ellipse(0, 0, faceRx, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner Meridian Star Emblem when face is sufficiently turned toward viewer
    if (faceRx > r * 0.38) {
      ctx.strokeStyle = 'rgba(92, 58, 10, 0.72)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.ellipse(0, 0, faceRx * 0.7, r * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 4-point Meridian star stamp
      ctx.fillStyle = isFrozen ? '#56d4f5' : 'rgba(110, 70, 12, 0.82)';
      const sx = faceRx * 0.42;
      const sy = r * 0.42;
      ctx.beginPath();
      ctx.moveTo(0, -sy);
      ctx.lineTo(sx * 0.28, -sy * 0.28);
      ctx.lineTo(sx, 0);
      ctx.lineTo(sx * 0.28, sy * 0.28);
      ctx.lineTo(0, sy);
      ctx.lineTo(-sx * 0.28, sy * 0.28);
      ctx.lineTo(-sx, 0);
      ctx.lineTo(-sx * 0.28, -sy * 0.28);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // 60fps Anatomical Character Stage Overlay Renderer (All 6 Cast Members!)
  // --------------------------------------------------------------------------

  private renderActorAnatomicalTell(
    ctx: CanvasRenderingContext2D,
    m: ProjectedStageMetrics,
  ): void {
    this.localClockSec = m.timeSec;
    if (this.currentTell === 'NONE') return;

    const age = Math.max(0, m.timeSec - this.tellStartedSec);
    const minDim = Math.min(m.canvasWidth, m.canvasHeight);

    // If Soren's card-edge coin rail isn't attached to an external card, render a compact
    // 24K gold coin right along the bottom edge of his portrait canvas so it's ALWAYS visible!
    if (
      !this.coinCardContainer &&
      m.actorId === 'soren' &&
      this.isSorenCoinActive()
    ) {
      const dt = m.dtSec;
      const t = m.timeSec;
      if (this.currentTell === 'SOREN_COIN_FREEZE_HIT') {
        this.coinSpinAngle = 0;
        this.coinTiltRad = 0;
      } else if (this.currentTell === 'SOREN_COIN_UNEVEN_BLUFF') {
        this.coinSpinAngle += (16 + 10 * Math.sin(t * 12)) * dt;
        this.coinNormX += this.coinDir * 0.44 * dt;
        this.coinTiltRad = 0.32 * Math.sin(t * 20);
      } else {
        this.coinSpinAngle += 6.5 * dt;
        this.coinNormX += this.coinDir * 0.22 * dt;
        this.coinTiltRad = 0;
      }
      if (this.coinNormX > 0.86) {
        this.coinNormX = 0.86;
        this.coinDir = -1;
      } else if (this.coinNormX < 0.14) {
        this.coinNormX = 0.14;
        this.coinDir = 1;
      }
      const r = Math.max(4.5, Math.min(7.5, minDim * 0.11));
      this.drawProjected24KGoldCoin(
        ctx,
        this.coinNormX * m.canvasWidth,
        m.canvasHeight - r - 2.5,
        r,
        this.coinSpinAngle,
        this.coinTiltRad,
        this.currentTell === 'SOREN_COIN_FREEZE_HIT',
        this.currentTell === 'SOREN_COIN_UNEVEN_BLUFF',
      );
    }

    switch (this.currentTell) {
      // ----------------------------------------------------------------------
      // 1. JULIAN VANCE: Gleaming Brass Cufflink Glint vs Golden Stylus Tap
      // ----------------------------------------------------------------------
      case 'VANCE_CUFFLINK_GLINT': {
        const pin = m.rig.anchors.leftLapelPin ?? { x: 0.732, y: 0.788 };
        const pt = m.projectAnchor(pin.x, pin.y, { clampMarginPx: Math.max(7, minDim * 0.14) });
        const pulse = 0.55 + 0.45 * Math.sin(age * 6.2);
        const flareR = Math.max(6, minDim * 0.17) * (0.78 + pulse * 0.42);

        drawStarGlint(ctx, pt.x, pt.y, flareR, age * 1.4, '#ffe596', '#ff9b42', 0.92);

        // Secondary subtle cuff adjustment arc
        ctx.strokeStyle = hexToRgba('#ffd87a', 0.45 + pulse * 0.35);
        ctx.lineWidth = Math.max(1.1, minDim * 0.02);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, flareR * 0.62, age * 2.4, age * 2.4 + Math.PI * 0.85);
        ctx.stroke();
        break;
      }

      case 'VANCE_STYLUS_TAP': {
        const ear = m.rig.anchors.rightEarStylus ?? { x: 0.278, y: 0.342 };
        const pt = m.projectAnchor(ear.x, ear.y, { clampMarginPx: 6 });

        // Rhythmic double-tap cycle (tap 1 at 0.00s, tap 2 at 0.24s in a 1.15s measure!)
        const cycle = age % 1.15;
        for (const tapStart of [0, 0.24]) {
          const dtTap = cycle - tapStart;
          if (dtTap >= 0 && dtTap <= 0.65) {
            const p = dtTap / 0.65;
            const ringR = Math.max(3, minDim * 0.05) + p * Math.max(10, minDim * 0.22);
            ctx.strokeStyle = hexToRgba('#fae29c', (1 - p) * 0.92);
            ctx.lineWidth = Math.max(1.2, minDim * 0.022 * (1 - p * 0.5));
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, ringR, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Animated golden-silver stylus tip tapping toward right ear
        const tapKick =
          (cycle < 0.12 ? Math.sin((cycle / 0.12) * Math.PI) : 0) +
          (cycle >= 0.24 && cycle < 0.36 ? Math.sin(((cycle - 0.24) / 0.12) * Math.PI) : 0);
        const stylusLen = Math.max(8, minDim * 0.18);
        const tipX = pt.x - (1 - tapKick) * 3.5;
        const tipY = pt.y + (1 - tapKick) * 2.0;

        ctx.strokeStyle = '#fff3c4';
        ctx.lineWidth = Math.max(1.5, minDim * 0.026);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - stylusLen * 0.82, tipY - stylusLen * 0.52);
        ctx.stroke();
        break;
      }

      // ----------------------------------------------------------------------
      // 2. NADIA AL-MANSOOR: Corner Smirk & Amber Eye-Glint vs Jaw Crimson Pulse
      // ----------------------------------------------------------------------
      case 'NADIA_SMIRK_EYE_GLINT': {
        const leftEye = m.projectAnchor(m.rig.leftEye.x, m.rig.leftEye.y);
        const rightEye = m.projectAnchor(m.rig.rightEye.x, m.rig.rightEye.y);
        const smirk = m.rig.anchors.smirkCorner ?? { x: 0.534, y: 0.456 };
        const smirkPt = m.projectAnchor(smirk.x, smirk.y);
        const earCuff = m.rig.anchors.earCuff ?? { x: 0.304, y: 0.352 };
        const cuffPt = m.projectAnchor(earCuff.x, earCuff.y, { clampMarginPx: 5 });

        const gleam = 0.65 + 0.35 * Math.sin(age * 7.2);
        const eyeStarR = Math.max(4.5, minDim * 0.12) * gleam;

        // Twin amber-gold eye glints
        drawStarGlint(ctx, leftEye.x, leftEye.y, eyeStarR, 0.15, '#fff3c4', '#ffae38', 0.94);
        drawStarGlint(ctx, rightEye.x, rightEye.y, eyeStarR * 0.88, -0.15, '#fff3c4', '#ffae38', 0.88);

        // Subtle gold ear-cuff harmonic sparkle
        drawStarGlint(ctx, cuffPt.x, cuffPt.y, eyeStarR * 0.72, age * 1.6, '#fae29c', '#d8af57', 0.72);

        // Luminous warm corner micro-smirk uplift arc
        const arcR = Math.max(3.5, minDim * 0.065);
        ctx.strokeStyle = hexToRgba('#ffd88a', 0.68 + 0.25 * Math.sin(age * 5));
        ctx.lineWidth = Math.max(1.2, minDim * 0.02);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(smirkPt.x, smirkPt.y - arcR * 0.35, arcR, Math.PI * 0.18, Math.PI * 0.78);
        ctx.stroke();
        break;
      }

      case 'NADIA_JAW_CRIMSON_PULSE': {
        const jaw = m.projectAnchor(m.rig.jawContour.x, m.rig.jawContour.y, { clampMarginPx: 6 });
        const beat = Math.pow(0.5 + 0.5 * Math.sin(age * 9.5), 1.6);
        const pulseR = Math.max(7, minDim * 0.18) * (0.8 + beat * 0.45);

        const grad = ctx.createRadialGradient(jaw.x, jaw.y, 1, jaw.x, jaw.y, pulseR);
        grad.addColorStop(0, hexToRgba('#ff3d57', 0.62 * beat + 0.18));
        grad.addColorStop(0.65, hexToRgba('#d91e3a', 0.28 * beat));
        grad.addColorStop(1, 'rgba(217, 30, 58, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(jaw.x, jaw.y, pulseR, 0, Math.PI * 2);
        ctx.fill();

        // Dual crimson jaw-clench tension arcs
        for (let k = 0; k < 2; k++) {
          const waveP = (age * 1.9 + k * 0.5) % 1;
          const rWave = Math.max(4, minDim * 0.07) + waveP * Math.max(8, minDim * 0.15);
          ctx.strokeStyle = hexToRgba('#ff6b7f', (1 - waveP) * 0.85);
          ctx.lineWidth = Math.max(1.15, minDim * 0.02);
          ctx.beginPath();
          ctx.arc(jaw.x, jaw.y, rWave, Math.PI * 0.55, Math.PI * 1.15);
          ctx.stroke();
        }
        break;
      }

      // ----------------------------------------------------------------------
      // 3. SOREN "ECHO" KAEL: Cyan Smart-Lens Glint (Hit) vs Glitch (Bluff/Jam)
      // ----------------------------------------------------------------------
      case 'SOREN_COIN_FREEZE_HIT': {
        const leftLens = m.projectAnchor(m.rig.leftEye.x, m.rig.leftEye.y);
        const rightLens = m.projectAnchor(m.rig.rightEye.x, m.rig.rightEye.y);
        const earpiece = m.rig.anchors.earpiece ?? { x: 0.345, y: 0.322 };
        const earPt = m.projectAnchor(earpiece.x, earpiece.y, { clampMarginPx: 5 });

        const lensW = Math.max(5.5, minDim * 0.115);
        const lensH = lensW * 0.64;
        const sweep = (age * 1.8) % 1.4;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        for (const lens of [leftLens, rightLens]) {
          // Cyan smart-lens HUD frame glow
          ctx.strokeStyle = 'rgba(86, 212, 245, 0.88)';
          ctx.lineWidth = Math.max(1.1, minDim * 0.018);
          ctx.strokeRect(lens.x - lensW * 0.5, lens.y - lensH * 0.5, lensW, lensH);

          // Diagonal cyan laser glint sweep + star flare
          if (sweep <= 1.0) {
            const sx = lens.x - lensW * 0.5 + sweep * lensW;
            ctx.strokeStyle = 'rgba(215, 252, 255, 0.95)';
            ctx.lineWidth = Math.max(1.4, minDim * 0.024);
            ctx.beginPath();
            ctx.moveTo(sx - lensH * 0.35, lens.y + lensH * 0.48);
            ctx.lineTo(sx + lensH * 0.35, lens.y - lensH * 0.48);
            ctx.stroke();
          }
        }

        drawStarGlint(
          ctx,
          leftLens.x + lensW * 0.22,
          leftLens.y - lensH * 0.18,
          Math.max(4.5, minDim * 0.11),
          0,
          '#e4fcff',
          '#56d4f5',
          0.9,
        );

        // Horizon sub-vocal earpiece lock ring
        const earPulse = (age * 1.6) % 1;
        ctx.strokeStyle = hexToRgba('#56d4f5', (1 - earPulse) * 0.85);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(earPt.x, earPt.y, 3 + earPulse * Math.max(7, minDim * 0.13), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'SOREN_COIN_UNEVEN_BLUFF':
      case 'SOREN_EARPIECE_JAMMED': {
        const ear = m.rig.anchors.earpiece ?? { x: 0.345, y: 0.322 };
        const earPt = m.projectAnchor(ear.x, ear.y, { clampMarginPx: 5 });
        const isJam = this.currentTell === 'SOREN_EARPIECE_JAMMED';
        const color = isJam ? '#f09d46' : '#ff596d';

        // Erratic static / bluff interference sparks at earpiece
        ctx.strokeStyle = hexToRgba(color, 0.78);
        ctx.lineWidth = 1.2;
        for (let s = 0; s < 3; s++) {
          const ang = age * 15 + s * 2.1;
          const r0 = 2.5;
          const r1 = Math.max(5.5, minDim * 0.11) * (0.6 + 0.4 * Math.abs(Math.sin(age * 23 + s)));
          ctx.beginPath();
          ctx.moveTo(earPt.x + Math.cos(ang) * r0, earPt.y + Math.sin(ang) * r0);
          ctx.lineTo(earPt.x + Math.cos(ang) * r1, earPt.y + Math.sin(ang) * r1);
          ctx.stroke();
        }
        break;
      }

      // ----------------------------------------------------------------------
      // 4. MATEO "TEO" ROJAS: Control-Room Camera Tally-Light Rapid Blink
      // ----------------------------------------------------------------------
      case 'TEO_TALLY_BLINK': {
        // Rapid broadcast 6.5Hz double-strobe red tally light in top-right camera corner!
        const strobe = Math.sin(age * Math.PI * 2 * 6.5) > -0.15;
        const tx = m.canvasWidth - Math.max(7, m.canvasWidth * 0.14);
        const ty = Math.max(7, m.canvasHeight * 0.13);
        const ledR = Math.max(2.6, minDim * 0.052);

        if (strobe) {
          const halo = ctx.createRadialGradient(tx, ty, 0.5, tx, ty, ledR * 3.4);
          halo.addColorStop(0, 'rgba(255, 62, 82, 0.95)');
          halo.addColorStop(0.5, 'rgba(255, 42, 68, 0.42)');
          halo.addColorStop(1, 'rgba(255, 42, 68, 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(tx, ty, ledR * 3.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ff3b52';
          ctx.beginPath();
          ctx.arc(tx, ty, ledR, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(120, 24, 34, 0.75)';
          ctx.beginPath();
          ctx.arc(tx, ty, ledR * 0.85, 0, Math.PI * 2);
          ctx.fill();
        }

        // Subtle eye-check sightline vector from Teo's eyes toward overhead tally camera
        const rEye = m.projectAnchor(m.rig.rightEye.x, m.rig.rightEye.y);
        ctx.save();
        ctx.setLineDash([2.5, 3]);
        ctx.strokeStyle = hexToRgba('#ff6b7f', strobe ? 0.55 : 0.2);
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(rEye.x, rEye.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 'TEO_CONSOLE_STEADY': {
        const tx = m.canvasWidth - Math.max(7, m.canvasWidth * 0.14);
        const ty = Math.max(7, m.canvasHeight * 0.13);
        const ledR = Math.max(2.2, minDim * 0.042);
        ctx.fillStyle = '#39d49a';
        ctx.beginPath();
        ctx.arc(tx, ty, ledR, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // ----------------------------------------------------------------------
      // 5. CHANCELLOR LINDQVIST: Platinum Spectacle Glint & Slow Lowering Fade
      // ----------------------------------------------------------------------
      case 'LINDQVIST_SPECTACLE_GLINT_FADE': {
        const left = m.projectAnchor(m.rig.leftEye.x, m.rig.leftEye.y);
        const right = m.projectAnchor(m.rig.rightEye.x, m.rig.rightEye.y);
        const eyeSpan = Math.max(10, Math.abs(right.x - left.x));
        const lensW = eyeSpan * 0.74;
        const lensH = lensW * 0.54;

        // 2.6s dramatic cycle:
        // 0.00..0.48s -> blinding cold platinum lens flash
        // 0.48..1.65s -> platinum frame ghost slowly lowers & fades down as she "removes" spectacles!
        const cyc = age % 2.6;
        const glintAlpha =
          cyc < 0.48
            ? Math.sin((cyc / 0.48) * Math.PI * 0.5)
            : Math.max(0, 1 - (cyc - 0.48) / 1.15);
        const lowerOffsetPx =
          cyc < 0.48 ? 0 : Math.min(1, (cyc - 0.48) / 1.15) * Math.max(5, minDim * 0.12);

        if (glintAlpha > 0.02) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          for (const center of [left, right]) {
            const lx = center.x - lensW * 0.5;
            const ly = center.y - lensH * 0.5 + lowerOffsetPx;

            const lGrad = ctx.createLinearGradient(lx, ly, lx + lensW, ly + lensH);
            lGrad.addColorStop(0, hexToRgba('#ffffff', glintAlpha * 0.88));
            lGrad.addColorStop(0.5, hexToRgba('#cde2ff', glintAlpha * 0.62));
            lGrad.addColorStop(1, hexToRgba('#9bb8e0', glintAlpha * 0.22));

            ctx.fillStyle = lGrad;
            ctx.strokeStyle = hexToRgba('#f5f9ff', glintAlpha * 0.95);
            ctx.lineWidth = Math.max(1.0, minDim * 0.018);

            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(lx, ly, lensW, lensH, 2);
            } else {
              ctx.rect(lx, ly, lensW, lensH);
            }
            ctx.fill();
            ctx.stroke();
          }

          // Platinum nose-bridge connecting both lenses
          ctx.strokeStyle = hexToRgba('#f5f9ff', glintAlpha * 0.9);
          ctx.lineWidth = Math.max(1.0, minDim * 0.018);
          ctx.beginPath();
          ctx.moveTo(left.x + lensW * 0.5, left.y + lowerOffsetPx);
          ctx.lineTo(right.x - lensW * 0.5, right.y + lowerOffsetPx);
          ctx.stroke();

          drawStarGlint(
            ctx,
            right.x + lensW * 0.25,
            right.y - lensH * 0.2 + lowerOffsetPx,
            Math.max(5, minDim * 0.13) * glintAlpha,
            0.2,
            '#ffffff',
            '#b8d8ff',
            glintAlpha,
          );

          ctx.restore();
        }
        break;
      }

      case 'LINDQVIST_POISE_FIRM': {
        const bridge = m.rig.anchors.spectacleBridge ?? { x: 0.508, y: 0.300 };
        const pt = m.projectAnchor(bridge.x, bridge.y);
        drawStarGlint(
          ctx,
          pt.x,
          pt.y,
          Math.max(3.5, minDim * 0.08) * (0.7 + 0.3 * Math.sin(age * 3.2)),
          0,
          '#ffffff',
          '#c9e0ff',
          0.68,
        );
        break;
      }

      // ----------------------------------------------------------------------
      // 6. TARIQ AL-MANSOOR: Sacred Meridian Zero Triangle Cipher
      // ----------------------------------------------------------------------
      case 'TARIQ_TRIANGLE_RESONANCE':
      case 'TARIQ_TRIANGLE_HESITATION': {
        const clasp = m.rig.anchors.collarClasp ?? { x: 0.432, y: 0.692 };
        const pt = m.projectAnchor(clasp.x, clasp.y, { clampMarginPx: Math.max(8, minDim * 0.16) });
        const triR = Math.max(5.5, minDim * 0.13);
        const isHesitating = this.currentTell === 'TARIQ_TRIANGLE_HESITATION';
        const progress = isHesitating ? 0.64 : ((age * 0.85) % 1.3);

        ctx.save();
        ctx.strokeStyle = isHesitating ? 'rgba(240, 157, 70, 0.88)' : 'rgba(242, 207, 126, 0.92)';
        ctx.lineWidth = Math.max(1.2, minDim * 0.022);
        if (isHesitating) {
          ctx.setLineDash([3, 2.5]);
        }

        const verts = [0, 1, 2].map((idx) => {
          const ang = -Math.PI / 2 + (idx * Math.PI * 2) / 3;
          return { x: pt.x + Math.cos(ang) * triR, y: pt.y + Math.sin(ang) * triR };
        });

        const maxEdges = Math.min(1, progress) * 3;
        ctx.beginPath();
        for (let e = 0; e < 3; e++) {
          const edgeAmt = Math.max(0, Math.min(1, maxEdges - e));
          if (edgeAmt <= 0) break;
          const v0 = verts[e];
          const v1 = verts[(e + 1) % 3];
          if (e === 0) ctx.moveTo(v0.x, v0.y);
          ctx.lineTo(v0.x + (v1.x - v0.x) * edgeAmt, v0.y + (v1.y - v0.y) * edgeAmt);
        }
        ctx.stroke();
        ctx.restore();
        break;
      }

      default:
        break;
    }
  }
}

// ----------------------------------------------------------------------------
// Deterministic Mapping from RivalLiveHUDState -> CharacterTellId
// (Strictly respects RivalAI state transitions — ZERO pre-Overclock bluff leak!)
// ----------------------------------------------------------------------------

export function deduceTellFromRivalHUD(hud: RivalLiveHUDState): CharacterTellId {
  const pillLower = (hud.tellPillText || '').toLowerCase();

  // Special mid-match states
  if (hud.actorId === 'soren' && pillLower.includes('jammed')) {
    return 'SOREN_EARPIECE_JAMMED';
  }

  // Only reveal genuine vs bluff tell once RivalAI enters OVERCLOCKING or LOCKED!
  const revealTellPhase = hud.status === 'OVERCLOCKING' || hud.status === 'LOCKED';

  switch (hud.actorId) {
    case 'vance':
      if (!revealTellPhase) return 'VANCE_IDLE_ASTROLABE';
      if (hud.isBluffing || pillLower.includes('cufflink')) return 'VANCE_CUFFLINK_GLINT';
      if (pillLower.includes('stylus') || hud.overclockCharge > 0 || hud.expression === 'smirk') {
        return 'VANCE_STYLUS_TAP';
      }
      return 'VANCE_IDLE_ASTROLABE';

    case 'nadia':
      if (!revealTellPhase) return 'NADIA_IDLE_ACOUSTIC';
      if (hud.isBluffing || pillLower.includes('jaw') || hud.expression === 'shocked') {
        return 'NADIA_JAW_CRIMSON_PULSE';
      }
      return 'NADIA_SMIRK_EYE_GLINT';

    case 'soren':
      if (!revealTellPhase) return 'SOREN_COIN_IDLE_ROLL';
      if (hud.isBluffing || pillLower.includes('bluff') || pillLower.includes('rapidly')) {
        return 'SOREN_COIN_UNEVEN_BLUFF';
      }
      if (hud.overclockCharge > 0 || pillLower.includes('froze') || hud.expression === 'smirk') {
        return 'SOREN_COIN_FREEZE_HIT';
      }
      return 'SOREN_COIN_IDLE_ROLL';

    case 'teo':
      if (!revealTellPhase) return 'TEO_CONSOLE_STEADY';
      if (hud.isBluffing || pillLower.includes('tally') || pillLower.includes('camera')) {
        return 'TEO_TALLY_BLINK';
      }
      return 'TEO_CONSOLE_STEADY';

    case 'lindqvist':
      if (!revealTellPhase) return 'LINDQVIST_POISE_FIRM';
      if (hud.isBluffing || pillLower.includes('spectacles')) {
        return 'LINDQVIST_SPECTACLE_GLINT_FADE';
      }
      return 'LINDQVIST_POISE_FIRM';

    case 'tariq':
      if (!revealTellPhase) return 'TARIQ_TRIANGLE_RESONANCE';
      return hud.isBluffing ? 'TARIQ_TRIANGLE_HESITATION' : 'TARIQ_TRIANGLE_RESONANCE';
  }
}

function drawStarGlint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotationRad: number,
  coreHex: string,
  haloHex: string,
  alpha: number,
): void {
  if (radius <= 0.5 || alpha <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(x, y);
  ctx.rotate(rotationRad);

  const glow = ctx.createRadialGradient(0, 0, 0.4, 0, 0, radius);
  glow.addColorStop(0, hexToRgba(coreHex, alpha * 0.95));
  glow.addColorStop(0.45, hexToRgba(haloHex, alpha * 0.48));
  glow.addColorStop(1, hexToRgba(haloHex, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Sharp 4-point horological anamorphic flare spikes
  ctx.fillStyle = hexToRgba(coreHex, alpha);
  const thin = Math.max(0.8, radius * 0.14);
  ctx.beginPath();
  ctx.moveTo(0, -radius * 1.15);
  ctx.lineTo(thin, -thin);
  ctx.lineTo(radius * 1.15, 0);
  ctx.lineTo(thin, thin);
  ctx.lineTo(0, radius * 1.15);
  ctx.lineTo(-thin, thin);
  ctx.lineTo(-radius * 1.15, 0);
  ctx.lineTo(-thin, -thin);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
