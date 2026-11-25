/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.5 — 1966 IN LIVING COLOR)
// `src/v7/ui/TvTwistTheaterV7.ts`
// Interactive 1966–1969 Network TV Board Twist Theater (Zero AI Boxes!):
//   1. `playMysteryCurtainDoorPick(outcomesPreview): Promise<1 | 2 | 3>`
//      Let's Make a Deal Curtain #1, #2, #3 velvet proscenium stage reveal!
//   2. `offerInstantBargainTurntable(spec): Promise<'BUY' | 'PASS'>`
//      1969 Sale of the Century revolving prize spotlight temptation!
//   3. `flashSecretSquareBanner(headline): Promise<void>`
//      1.1s Morton Goldsholl / Saul Bass kinetic Daily Double starburst!
// ============================================================================

import '../../styles/tv_twist_theater_v7.css';
import type { CategoryIdV7 } from '../contracts_v7';
import type {
  MysteryCurtainKindV7,
  MysteryCurtainOutcomeV7,
} from '../boards/BoardTwistsEngineV7';

// ----------------------------------------------------------------------------
// 1. Public Contracts & Flexible Input Types
// ----------------------------------------------------------------------------

export interface MysteryCurtainOutcomeLikeV7 {
  readonly curtainNumber?: 1 | 2 | 3;
  readonly kind?: MysteryCurtainKindV7;
  readonly headline: string;
  readonly detail?: string;
  readonly instantCashDelta?: number;
  readonly rivalCashDelta?: number;
  readonly chipsMultiplier?: number;
  readonly swappedCategory?: CategoryIdV7;
}

export type MysteryCurtainPreviewInputItemV7 =
  | MysteryCurtainOutcomeV7
  | MysteryCurtainOutcomeLikeV7
  | string;

export type MysteryCurtainOutcomesPreviewV7 =
  | readonly [
      MysteryCurtainPreviewInputItemV7,
      MysteryCurtainPreviewInputItemV7,
      MysteryCurtainPreviewInputItemV7,
    ]
  | readonly MysteryCurtainPreviewInputItemV7[];

export interface InstantBargainSpecV7 {
  readonly playerCash: number;
  readonly costCash: number;
  readonly relicName: string;
  readonly relicPerk: string;
  readonly listPriceCash?: number;
}

export type InstantBargainDecisionV7 = 'BUY' | 'PASS';

export interface TvTwistTheaterCallbacksV7 {
  readonly onUiTapSfx?: () => void;
  readonly onCurtainOpenSfx?: (curtainNum: 1 | 2 | 3, kind: MysteryCurtainKindV7) => void;
  readonly onBargainBellSfx?: () => void;
  readonly onBargainBuySfx?: () => void;
  readonly onBargainPassSfx?: () => void;
  readonly onSecretSquareSfx?: () => void;
}

interface NormalizedCurtainCardV7 {
  readonly curtainNumber: 1 | 2 | 3;
  readonly kind: MysteryCurtainKindV7;
  readonly tone: 'cash' | 'steal' | 'double' | 'swap';
  readonly shortAmount: string;
  readonly shortSub: string;
  readonly fullHeadline: string;
  readonly fullDetail: string;
}

// ----------------------------------------------------------------------------
// 2. Orphan-Proof Copy & Outcome Normalization Helpers
// ----------------------------------------------------------------------------

function formatOrphanProof(raw: string): string {
  const cleaned = raw.replace(/\.{3}|\u2026/g, '—').trim();
  const lastSpace = cleaned.lastIndexOf(' ');
  if (lastSpace <= 0 || lastSpace >= cleaned.length - 1) {
    return cleaned;
  }
  return `${cleaned.slice(0, lastSpace)}\u00A0${cleaned.slice(lastSpace + 1)}`;
}

const DEFAULT_CURTAIN_FALLBACKS: readonly [
  MysteryCurtainOutcomeLikeV7,
  MysteryCurtainOutcomeLikeV7,
  MysteryCurtainOutcomeLikeV7,
] = [
  {
    curtainNumber: 1,
    kind: 'BONUS_ENVELOPE',
    headline: 'CURTAIN #1 · +$250 CASH ENVELOPE!',
    detail: 'Crisp studio greenbacks wired straight onto your live scoreboard!',
    instantCashDelta: 250,
    rivalCashDelta: 0,
    chipsMultiplier: 1.0,
  },
  {
    curtainNumber: 2,
    kind: 'STEAL_FROM_RIVAL',
    headline: 'CURTAIN #2 · STEAL $150 FROM CHAMP!',
    detail: 'Concentration TAKE! You swipe $150 right off the Champion’s tote board!',
    instantCashDelta: 150,
    rivalCashDelta: -150,
    chipsMultiplier: 1.0,
  },
  {
    curtainNumber: 3,
    kind: 'DOUBLE_CHIPS',
    headline: 'CURTAIN #3 · 2× DOUBLE CHIPS!',
    detail: 'Live dollar stake doubled on this clue!',
    instantCashDelta: 0,
    rivalCashDelta: 0,
    chipsMultiplier: 2.0,
  },
];

function inferKindFromHeadline(headline: string): MysteryCurtainKindV7 {
  const upper = headline.toUpperCase();
  if (upper.includes('STEAL') || upper.includes('TAKE')) return 'STEAL_FROM_RIVAL';
  if (upper.includes('DOUBLE') || upper.includes('2X') || upper.includes('2×')) return 'DOUBLE_CHIPS';
  if (upper.includes('SWAP') || upper.includes('WILD')) return 'WILD_CATEGORY_SWAP';
  return 'BONUS_ENVELOPE';
}

function normalizeCurtainItem(
  item: MysteryCurtainPreviewInputItemV7 | undefined,
  curtainNumber: 1 | 2 | 3,
): NormalizedCurtainCardV7 {
  const fallback = DEFAULT_CURTAIN_FALLBACKS[curtainNumber - 1];
  if (!item) {
    return normalizeCurtainItem(fallback, curtainNumber);
  }

  if (typeof item === 'string') {
    const kind = inferKindFromHeadline(item);
    return normalizeCurtainItem(
      {
        curtainNumber,
        kind,
        headline: item,
        detail: '1966 Studio Mystery Curtain bonus locked in for this turn!',
      },
      curtainNumber,
    );
  }

  const kind: MysteryCurtainKindV7 = item.kind ?? inferKindFromHeadline(item.headline);
  const cashGain = Math.max(0, Math.round(item.instantCashDelta ?? 0));
  const rivalLoss = Math.abs(Math.round(item.rivalCashDelta ?? 0));

  switch (kind) {
    case 'STEAL_FROM_RIVAL': {
      const amt = rivalLoss > 0 ? rivalLoss : cashGain > 0 ? cashGain : 150;
      return {
        curtainNumber,
        kind,
        tone: 'steal',
        shortAmount: `STEAL $${amt}`,
        shortSub: 'FROM CHAMP',
        fullHeadline: item.headline || `CURTAIN #${curtainNumber} · STEAL $${amt} FROM CHAMP!`,
        fullDetail:
          item.detail ??
          `Concentration TAKE! You swipe $${amt} straight off the Champion’s scoreboard!`,
      };
    }
    case 'DOUBLE_CHIPS': {
      return {
        curtainNumber,
        kind,
        tone: 'double',
        shortAmount: '2× DOUBLE',
        shortSub: 'LIVE STAKE',
        fullHeadline: item.headline || `CURTAIN #${curtainNumber} · 2× DOUBLE CHIPS!`,
        fullDetail: item.detail ?? 'Your live dollar stake is doubled on this question!',
      };
    }
    case 'WILD_CATEGORY_SWAP': {
      const swapCat = item.swappedCategory ?? 'WILD PICK';
      const bonusSuffix = cashGain > 0 ? ` +$${cashGain}` : '';
      return {
        curtainNumber,
        kind,
        tone: 'swap',
        shortAmount: 'WILD SWAP',
        shortSub: `${swapCat}${bonusSuffix}`,
        fullHeadline:
          item.headline || `CURTAIN #${curtainNumber} · WILD SWAP TO ${swapCat}!`,
        fullDetail:
          item.detail ??
          `Trilon Wild Spin flipped this tile to ${swapCat}${cashGain > 0 ? ` plus +$${cashGain} instant cash` : ''}!`,
      };
    }
    case 'BONUS_ENVELOPE':
    default: {
      const envAmt = cashGain > 0 ? cashGain : 250;
      return {
        curtainNumber,
        kind: 'BONUS_ENVELOPE',
        tone: 'cash',
        shortAmount: `+$${envAmt}`,
        shortSub: 'CASH ENVELOPE',
        fullHeadline: item.headline || `CURTAIN #${curtainNumber} · +$${envAmt} CASH ENVELOPE!`,
        fullDetail:
          item.detail ?? `Monty’s gold studio envelope adds +$${envAmt} straight to your score!`,
      };
    }
  }
}

function normalizeThreeCurtains(
  outcomesPreview?: MysteryCurtainOutcomesPreviewV7,
): readonly [NormalizedCurtainCardV7, NormalizedCurtainCardV7, NormalizedCurtainCardV7] {
  return [
    normalizeCurtainItem(outcomesPreview?.[0], 1),
    normalizeCurtainItem(outcomesPreview?.[1], 2),
    normalizeCurtainItem(outcomesPreview?.[2], 3),
  ];
}

// ----------------------------------------------------------------------------
// 3. Bespoke 1966 Network Broadcast SVG Props (Zero External Image Dependency)
// ----------------------------------------------------------------------------

function buildMarqueeCrownBulbsSvg(): string {
  const bulbs: string[] = [];
  const count = 15;
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    const x = 18 + t * 424;
    const y = 24 - Math.sin(t * Math.PI) * 16;
    const circuit = i % 3;
    bulbs.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#0B1D30"/>`,
      `<circle class="wst7-bulb-dot wst7-c${circuit}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.3" fill="#FFD966"/>`,
    );
  }
  return `
    <svg class="wst7-crown-bulbs-svg" viewBox="0 0 460 32" fill="none" aria-hidden="true">
      <path d="M 14 24 Q 230 -2 446 24" stroke="#F4A91F" stroke-width="2.8" stroke-linecap="round" opacity="0.72"/>
      ${bulbs.join('')}
    </svg>
  `;
}

function buildLivingColorStarburstSvg(rayCount = 20): string {
  const palette = ['#FFD966', '#FF6738', '#E63B7A', '#19BFD0', '#1E56C5', '#F4A91F'];
  const rays: string[] = [];
  for (let i = 0; i < rayCount; i += 1) {
    const a1 = ((i * 360) / rayCount - 6.5) * (Math.PI / 180);
    const a2 = ((i * 360) / rayCount + 6.5) * (Math.PI / 180);
    const r = i % 2 === 0 ? 285 : 240;
    const x1 = (300 + Math.cos(a1) * r).toFixed(1);
    const y1 = (300 + Math.sin(a1) * r).toFixed(1);
    const x2 = (300 + Math.cos(a2) * r).toFixed(1);
    const y2 = (300 + Math.sin(a2) * r).toFixed(1);
    const fill = palette[i % palette.length];
    rays.push(`<polygon points="300,300 ${x1},${y1} ${x2},${y2}" fill="${fill}" fill-opacity="0.34"/>`);
  }
  return `
    <svg viewBox="0 0 600 600" fill="none" aria-hidden="true">
      <circle cx="300" cy="300" r="220" fill="#FFD966" fill-opacity="0.12"/>
      ${rays.join('')}
      <circle cx="300" cy="300" r="148" stroke="#FFD966" stroke-opacity="0.42" stroke-width="2.5" stroke-dasharray="8 10"/>
    </svg>
  `;
}

function buildCurtainPrizePropSvg(kind: MysteryCurtainKindV7): string {
  switch (kind) {
    case 'STEAL_FROM_RIVAL':
      // 1966 Concentration "TAKE!" Magnet & Lightning Heist Emblem
      return `
        <svg class="wst7-alcove-prop-svg" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="48" r="40" fill="#0D2238" fill-opacity="0.5"/>
          <path d="M26 30 V50 C26 63 36 72 48 72 C60 72 70 63 70 50 V30 H58 V49 C58 55 54 60 48 60 C42 60 38 55 38 49 V30 Z" fill="#FF6738" stroke="#FFF7E6" stroke-width="3"/>
          <rect x="24" y="22" width="16" height="11" rx="3" fill="#FFF7E6"/>
          <rect x="56" y="22" width="16" height="11" rx="3" fill="#FFF7E6"/>
          <path d="M49 12 L41 28 H50 L45 43 L60 25 H50 Z" fill="#FFD966"/>
        </svg>
      `;
    case 'DOUBLE_CHIPS':
      // Twin 1966 Gold Starburst 2X Medallions
      return `
        <svg class="wst7-alcove-prop-svg" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <path d="M48 6 L57 28 L80 20 L68 41 L90 48 L68 55 L80 76 L57 68 L48 90 L39 68 L16 76 L28 55 L6 48 L28 41 L16 20 L39 28 Z" fill="#FFD966" stroke="#9E6206" stroke-width="2.5"/>
          <circle cx="48" cy="48" r="24" fill="#0D2238"/>
          <text x="48" y="56" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="24" fill="#FFD966">2×</text>
        </svg>
      `;
    case 'WILD_CATEGORY_SWAP':
      // Motorized 3-Sided Trilon Prism Flip
      return `
        <svg class="wst7-alcove-prop-svg" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="48" r="39" fill="#0D2238" fill-opacity="0.45"/>
          <polygon points="48,14 80,68 16,68" fill="#19BFD0" stroke="#FFF7E6" stroke-width="3" stroke-linejoin="round"/>
          <polygon points="48,14 80,68 48,56" fill="#E63B7A" fill-opacity="0.88"/>
          <path d="M22 76 Q48 88 74 76" stroke="#FFD966" stroke-width="4" stroke-linecap="round"/>
          <polygon points="75,71 82,76 73,82" fill="#FFD966"/>
        </svg>
      `;
    case 'BONUS_ENVELOPE':
    default:
      // Gold Wax-Sealed IBC Cash Envelope Fanning Greenbacks
      return `
        <svg class="wst7-alcove-prop-svg" viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <rect x="20" y="16" width="56" height="34" rx="5" transform="rotate(-7 48 33)" fill="#2ECC71" stroke="#FFF7E6" stroke-width="2.5"/>
          <rect x="14" y="34" width="68" height="44" rx="8" fill="#FFF7E6" stroke="#F4A91F" stroke-width="3"/>
          <path d="M16 36 L48 59 L80 36" stroke="#F4A91F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="48" cy="57" r="11" fill="#E63B7A"/>
          <text x="48" y="62" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="14" fill="#FFF7E6">$</text>
        </svg>
      `;
  }
}

function buildBargainBellSvg(): string {
  return `
    <svg class="wst7-bargain-bell-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="10" r="5" fill="#FFF7E6"/>
      <path d="M14 44 C14 26 20 16 32 16 C44 16 50 26 50 44 L56 50 H8 L14 44 Z" fill="#FFD966" stroke="#9E6206" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="32" cy="54" r="6" fill="#FF6738"/>
      <path d="M8 22 Q4 30 8 38" stroke="#19BFD0" stroke-width="3" stroke-linecap="round"/>
      <path d="M56 22 Q60 30 56 38" stroke="#19BFD0" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `;
}

function buildRelicShowcaseCrestSvg(): string {
  return `
    <svg class="wst7-relic-crest-svg" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M48 6 L58 24 L79 19 L71 39 L89 51 L70 61 L75 81 L55 74 L48 92 L41 74 L21 81 L26 61 L7 51 L25 39 L17 19 L38 24 Z" fill="#F4A91F"/>
      <circle cx="48" cy="49" r="28" fill="#0D2238" stroke="#FFF7E6" stroke-width="3"/>
      <rect x="40" y="29" width="16" height="24" rx="8" fill="#19BFD0" stroke="#FFF7E6" stroke-width="2.5"/>
      <path d="M34 43 C34 52 40 58 48 58 C56 58 62 52 62 43" stroke="#FFD966" stroke-width="3" stroke-linecap="round"/>
      <line x1="48" y1="58" x2="48" y2="68" stroke="#FFD966" stroke-width="3" stroke-linecap="round"/>
      <line x1="39" y1="68" x2="57" y2="68" stroke="#FFF7E6" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `;
}

// ----------------------------------------------------------------------------
// 4. `TvTwistTheaterV7` — Stateful Studio Stage Overlay Controller
// ----------------------------------------------------------------------------

export class TvTwistTheaterV7 {
  private readonly host: HTMLElement;
  private readonly rootEl: HTMLDivElement;
  private callbacks: TvTwistTheaterCallbacksV7;
  private reducedMotion = false;

  private activeCleanup: (() => void) | null = null;
  private disposed = false;

  constructor(
    host?: HTMLElement | null,
    callbacks: TvTwistTheaterCallbacksV7 = {},
  ) {
    this.host =
      host ??
      (typeof document !== 'undefined'
        ? document.getElementById('ui-root') ?? document.body
        : ({} as HTMLElement));
    this.callbacks = callbacks;

    this.rootEl = document.createElement('div');
    this.rootEl.className = 'wst7-root wst7-hidden';
    this.rootEl.dataset.reducedMotion = 'false';

    if (this.host && typeof this.host.appendChild === 'function') {
      this.host.appendChild(this.rootEl);
    }
  }

  public setCallbacks(callbacks: TvTwistTheaterCallbacksV7): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = Boolean(reduced);
    this.rootEl.dataset.reducedMotion = this.reducedMotion ? 'true' : 'false';
  }

  public isActive(): boolean {
    return this.activeCleanup !== null;
  }

  public cancelActive(): void {
    if (this.activeCleanup) {
      const fn = this.activeCleanup;
      this.activeCleanup = null;
      fn();
    }
    this.rootEl.innerHTML = '';
    this.rootEl.classList.add('wst7-hidden');
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.cancelActive();
    this.rootEl.remove();
  }

  // --------------------------------------------------------------------------
  // 1. Let's Make a Deal — Curtain #1, Curtain #2, Curtain #3 Door Pick
  // --------------------------------------------------------------------------

  public playMysteryCurtainDoorPick(
    outcomesPreview?: MysteryCurtainOutcomesPreviewV7,
  ): Promise<1 | 2 | 3> {
    this.cancelActive();
    const cards = normalizeThreeCurtains(outcomesPreview);

    return new Promise<1 | 2 | 3>((resolve) => {
      let picked: 1 | 2 | 3 | null = null;
      let canFastAdvance = false;
      let finished = false;
      const timers: number[] = [];

      const overlay = document.createElement('section');
      overlay.className = 'wst7-stage-overlay wst7-curtain-backdrop';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Mystery Curtain Stage Pick: Choose Curtain 1, 2, or 3');

      const proscenium = document.createElement('div');
      proscenium.className = 'wst7-curtain-proscenium';

      const crown = document.createElement('header');
      crown.className = 'wst7-curtain-crown';
      crown.innerHTML = `
        ${buildMarqueeCrownBulbsSvg()}
        <div class="wst7-kicker-ribbon">★ LET’S MAKE A STUDIO DEAL ★</div>
        <h2 class="wst7-curtain-headline">PICK A MYSTERY CURTAIN!</h2>
      `;

      const deck = document.createElement('div');
      deck.className = 'wst7-curtain-stage-deck';

      const trio = document.createElement('div');
      trio.className = 'wst7-curtain-trio';

      const apron = document.createElement('div');
      apron.className = 'wst7-stage-apron';
      apron.dataset.revealed = 'false';
      apron.setAttribute('aria-live', 'polite');

      const apronPrimary = document.createElement('div');
      apronPrimary.className = 'wst7-apron-primary';
      apronPrimary.textContent = 'TAP CURTAIN #1, #2, OR #3 TO PART THE VELVET DRAPES';

      const apronSecondary = document.createElement('div');
      apronSecondary.className = 'wst7-apron-secondary';
      apronSecondary.textContent = formatOrphanProof(
        'Hiding behind these curtains: Cash Envelope, Steal from Champ, 2× Double Chips, or Wild Swap!',
      );

      apron.append(apronPrimary, apronSecondary);

      const archButtons: HTMLButtonElement[] = [];

      const finishWith = (choice: 1 | 2 | 3): void => {
        if (finished) return;
        finished = true;
        for (const t of timers) window.clearTimeout(t);
        timers.length = 0;
        window.removeEventListener('keydown', onKeyDown);
        overlay.removeEventListener('pointerdown', onFastForwardTap);
        this.activeCleanup = null;
        this.rootEl.innerHTML = '';
        this.rootEl.classList.add('wst7-hidden');
        resolve(choice);
      };

      const selectCurtain = (choice: 1 | 2 | 3): void => {
        if (picked !== null || finished) return;
        picked = choice;

        const chosenCard = cards[choice - 1];
        this.callbacks.onUiTapSfx?.();
        this.callbacks.onCurtainOpenSfx?.(choice, chosenCard.kind);

        archButtons.forEach((btn, idx) => {
          const num = (idx + 1) as 1 | 2 | 3;
          const peekTag = btn.querySelector<HTMLElement>('.wst7-alcove-peek-tag');
          if (num === choice) {
            btn.dataset.state = 'chosen';
            if (peekTag) peekTag.textContent = '★ YOUR PICK ★';
          } else {
            btn.disabled = true;
            if (peekTag) peekTag.textContent = `BEHIND #${num}`;
          }
        });

        apron.dataset.revealed = 'true';
        apronPrimary.textContent = chosenCard.fullHeadline;
        apronSecondary.textContent = formatOrphanProof(chosenCard.fullDetail);

        // Monty Hall peek of the other two doors 300ms later!
        const peekDelay = this.reducedMotion ? 120 : 300;
        timers.push(
          window.setTimeout(() => {
            archButtons.forEach((btn, idx) => {
              if (idx + 1 !== choice) {
                btn.dataset.state = 'peek';
              }
            });
            canFastAdvance = true;
          }, peekDelay),
        );

        const revealHoldMs = this.reducedMotion ? 1100 : 1450;
        timers.push(
          window.setTimeout(() => {
            overlay.dataset.exiting = 'true';
            timers.push(window.setTimeout(() => finishWith(choice), 180));
          }, revealHoldMs),
        );
      };

      for (const card of cards) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wst7-curtain-arch-btn';
        btn.dataset.curtain = String(card.curtainNumber);
        btn.dataset.state = 'closed';
        btn.setAttribute('aria-label', `Pick Mystery Curtain Number ${card.curtainNumber}`);

        btn.innerHTML = `
          <div class="wst7-curtain-valance" aria-hidden="true"></div>
          <div class="wst7-curtain-alcove" data-tone="${card.tone}">
            <span class="wst7-alcove-peek-tag">CURTAIN #${card.curtainNumber}</span>
            ${buildCurtainPrizePropSvg(card.kind)}
            <div class="wst7-alcove-plaque">
              <span class="wst7-alcove-amount">${card.shortAmount}</span>
              <span class="wst7-alcove-sub">${card.shortSub}</span>
            </div>
          </div>
          <div class="wst7-curtain-drapes" aria-hidden="true">
            <div class="wst7-drape-panel wst7-drape-left"></div>
            <div class="wst7-drape-panel wst7-drape-right"></div>
          </div>
          <div class="wst7-curtain-badge-stack" aria-hidden="true">
            <span class="wst7-curtain-medallion">${card.curtainNumber}</span>
            <span class="wst7-curtain-door-title">CURTAIN #${card.curtainNumber}</span>
          </div>
        `;

        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          selectCurtain(card.curtainNumber);
        });

        archButtons.push(btn);
        trio.appendChild(btn);
      }

      const onFastForwardTap = (): void => {
        if (picked !== null && canFastAdvance) {
          finishWith(picked);
        }
      };

      const onKeyDown = (ev: KeyboardEvent): void => {
        if (picked === null) {
          if (ev.key === '1' || ev.key === '2' || ev.key === '3') {
            ev.preventDefault();
            selectCurtain(Number(ev.key) as 1 | 2 | 3);
          }
        } else if (canFastAdvance && (ev.key === ' ' || ev.key === 'Enter' || ev.key === 'Escape')) {
          ev.preventDefault();
          finishWith(picked);
        }
      };

      deck.append(trio, apron);
      proscenium.append(crown, deck);
      overlay.appendChild(proscenium);
      overlay.addEventListener('pointerdown', onFastForwardTap);
      window.addEventListener('keydown', onKeyDown);

      this.activeCleanup = () => {
        finished = true;
        for (const t of timers) window.clearTimeout(t);
        timers.length = 0;
        window.removeEventListener('keydown', onKeyDown);
        overlay.removeEventListener('pointerdown', onFastForwardTap);
        resolve(picked ?? 1);
      };

      this.rootEl.innerHTML = '';
      this.rootEl.appendChild(overlay);
      this.rootEl.classList.remove('wst7-hidden');
      archButtons[0]?.focus({ preventScroll: true });
    });
  }

  // --------------------------------------------------------------------------
  // 2. 1969 Sale of the Century — Instant Bargain Revolving Prize Turntable
  // --------------------------------------------------------------------------

  public offerInstantBargainTurntable(
    spec: InstantBargainSpecV7,
  ): Promise<InstantBargainDecisionV7> {
    this.cancelActive();
    this.callbacks.onBargainBellSfx?.();

    const playerCash = Math.max(0, Math.round(spec.playerCash));
    const costCash = Math.max(0, Math.round(spec.costCash));
    const canAfford = playerCash >= costCash;
    const afterCash = Math.max(0, playerCash - costCash);
    const retailValue = spec.listPriceCash ?? Math.max(450, Math.round((costCash * 2.6) / 25) * 25);

    return new Promise<InstantBargainDecisionV7>((resolve) => {
      let decided: InstantBargainDecisionV7 | null = null;
      let finished = false;
      const timers: number[] = [];

      const overlay = document.createElement('section');
      overlay.className = 'wst7-stage-overlay wst7-bargain-backdrop';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', `Instant Bargain Turntable: ${spec.relicName} for $${costCash}`);

      const ensemble = document.createElement('div');
      ensemble.className = 'wst7-bargain-ensemble';

      const header = document.createElement('header');
      header.className = 'wst7-bargain-header';
      header.innerHTML = `
        ${buildMarqueeCrownBulbsSvg()}
        <div class="wst7-kicker-ribbon">🔔 STOP THE BOARD · PRIZE SPOTLIGHT</div>
        <div class="wst7-bell-row">
          ${buildBargainBellSvg()}
          <h2 class="wst7-bargain-headline">INSTANT BARGAIN!</h2>
        </div>
      `;

      const showcase = document.createElement('div');
      showcase.className = 'wst7-turntable-showcase';

      const raysWrap = document.createElement('div');
      raysWrap.className = 'wst7-turntable-rays';
      raysWrap.innerHTML = buildLivingColorStarburstSvg(20);

      const crestRow = document.createElement('div');
      crestRow.className = 'wst7-turntable-crest-row';
      crestRow.innerHTML = `
        ${buildRelicShowcaseCrestSvg()}
        <div class="wst7-price-hangtag">
          <span class="wst7-retail-strike">RETAIL $${retailValue.toLocaleString()}</span>
          <span class="wst7-bargain-price">NOW $${costCash.toLocaleString()}!</span>
        </div>
      `;

      const cuePlaque = document.createElement('article');
      cuePlaque.className = 'wst7-relic-cue-plaque';

      const nameEl = document.createElement('h3');
      nameEl.className = 'wst7-relic-name';
      nameEl.textContent = spec.relicName;

      const perkEl = document.createElement('p');
      perkEl.className = 'wst7-relic-perk';
      perkEl.textContent = formatOrphanProof(spec.relicPerk);

      cuePlaque.append(nameEl, perkEl);

      const platter = document.createElement('div');
      platter.className = 'wst7-turntable-platter';
      platter.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 9; i += 1) {
        const bulb = document.createElement('span');
        bulb.className = `wst7-platter-bulb wst7-bulb-dot wst7-c${i % 3}`;
        platter.appendChild(bulb);
      }

      const soldStamp = document.createElement('div');
      soldStamp.className = 'wst7-sold-stamp';
      soldStamp.textContent = 'SOLD!';

      showcase.append(raysWrap, crestRow, cuePlaque, platter, soldStamp);

      const sideCol = document.createElement('div');
      sideCol.className = 'wst7-bargain-side-col';

      const mathStrip = document.createElement('div');
      mathStrip.className = 'wst7-score-math-strip';
      mathStrip.innerHTML = canAfford
        ? `
            <span class="wst7-math-item">YOUR SCORE <strong>$${playerCash.toLocaleString()}</strong></span>
            <span class="wst7-math-arrow" aria-hidden="true">▸</span>
            <span class="wst7-math-item">AFTER BUY <strong>$${afterCash.toLocaleString()}</strong></span>
          `
        : `
            <span class="wst7-math-item">YOUR SCORE <strong>$${playerCash.toLocaleString()}</strong></span>
            <span class="wst7-math-arrow" aria-hidden="true">▸</span>
            <span class="wst7-math-item">NEED <strong>$${costCash.toLocaleString()}</strong></span>
          `;

      const actions = document.createElement('div');
      actions.className = 'wst7-bargain-actions';

      const buyBtn = document.createElement('button');
      buyBtn.type = 'button';
      buyBtn.className = 'wst7-action-btn wst7-btn-buy';
      buyBtn.dataset.action = 'bargain-buy';
      buyBtn.disabled = !canAfford;
      buyBtn.textContent = canAfford
        ? `🔔 BUY FOR $${costCash.toLocaleString()}`
        : `NEED $${costCash.toLocaleString()} TO BUY`;

      const passBtn = document.createElement('button');
      passBtn.type = 'button';
      passBtn.className = 'wst7-action-btn wst7-btn-pass';
      passBtn.dataset.action = 'bargain-pass';
      passBtn.textContent = `PASS · KEEP $${playerCash.toLocaleString()}`;

      const finishDecision = (choice: InstantBargainDecisionV7): void => {
        if (finished) return;
        finished = true;
        for (const t of timers) window.clearTimeout(t);
        timers.length = 0;
        window.removeEventListener('keydown', onKeyDown);
        this.activeCleanup = null;
        this.rootEl.innerHTML = '';
        this.rootEl.classList.add('wst7-hidden');
        resolve(choice);
      };

      const commitDecision = (choice: InstantBargainDecisionV7): void => {
        if (decided !== null || finished) return;
        if (choice === 'BUY' && !canAfford) return;
        decided = choice;
        buyBtn.disabled = true;
        passBtn.disabled = true;
        ensemble.dataset.decision = choice;

        if (choice === 'BUY') {
          this.callbacks.onBargainBuySfx?.();
          const holdMs = this.reducedMotion ? 180 : 380;
          timers.push(
            window.setTimeout(() => {
              overlay.dataset.exiting = 'true';
              timers.push(window.setTimeout(() => finishDecision('BUY'), 150));
            }, holdMs),
          );
        } else {
          this.callbacks.onUiTapSfx?.();
          this.callbacks.onBargainPassSfx?.();
          overlay.dataset.exiting = 'true';
          timers.push(window.setTimeout(() => finishDecision('PASS'), 150));
        }
      };

      buyBtn.addEventListener('click', () => commitDecision('BUY'));
      passBtn.addEventListener('click', () => commitDecision('PASS'));

      const onKeyDown = (ev: KeyboardEvent): void => {
        if (decided !== null) return;
        if (ev.key === 'Escape' || ev.key.toLowerCase() === 'p') {
          ev.preventDefault();
          commitDecision('PASS');
        } else if ((ev.key === 'b' || ev.key === 'B') && canAfford) {
          ev.preventDefault();
          commitDecision('BUY');
        }
      };

      actions.append(buyBtn, passBtn);
      sideCol.append(mathStrip, actions);
      ensemble.append(header, showcase, sideCol);
      overlay.appendChild(ensemble);
      window.addEventListener('keydown', onKeyDown);

      this.activeCleanup = () => {
        finished = true;
        for (const t of timers) window.clearTimeout(t);
        timers.length = 0;
        window.removeEventListener('keydown', onKeyDown);
        resolve(decided ?? 'PASS');
      };

      this.rootEl.innerHTML = '';
      this.rootEl.appendChild(overlay);
      this.rootEl.classList.remove('wst7-hidden');
      (canAfford ? buyBtn : passBtn).focus({ preventScroll: true });
    });
  }

  // --------------------------------------------------------------------------
  // 3. 1.1s Kinetic 1966 Starburst Secret Square / Daily Double Splash
  // --------------------------------------------------------------------------

  public flashSecretSquareBanner(
    headline = '★ SECRET SQUARE · DOUBLE DOLLARS! ★',
  ): Promise<void> {
    this.cancelActive();
    this.callbacks.onSecretSquareSfx?.();

    const cleanHeadline =
      headline.trim().length > 0 ? headline.trim() : '★ SECRET SQUARE · DOUBLE DOLLARS! ★';

    return new Promise<void>((resolve) => {
      let finished = false;
      let canSkip = false;
      const timers: number[] = [];

      const overlay = document.createElement('section');
      overlay.className = 'wst7-stage-overlay wst7-secret-backdrop';
      overlay.setAttribute('role', 'status');
      overlay.setAttribute('aria-live', 'assertive');

      const sculpture = document.createElement('div');
      sculpture.className = 'wst7-secret-sculpture';

      const rays = document.createElement('div');
      rays.className = 'wst7-secret-rays-wrap';
      rays.innerHTML = buildLivingColorStarburstSvg(24);

      const crownBulbs = document.createElement('div');
      crownBulbs.innerHTML = buildMarqueeCrownBulbsSvg();

      const kicker = document.createElement('div');
      kicker.className = 'wst7-secret-kicker';
      kicker.textContent = '★ LIVE STUDIO DAILY DOUBLE ★';

      const h2 = document.createElement('h2');
      h2.className = 'wst7-secret-headline';
      h2.textContent = cleanHeadline;

      const pill = document.createElement('div');
      pill.className = 'wst7-secret-pill';
      pill.textContent = '2× DOUBLE DOLLARS IN PLAY!';

      sculpture.append(rays, crownBulbs, kicker, h2, pill);
      overlay.appendChild(sculpture);

      const finishSplash = (): void => {
        if (finished) return;
        finished = true;
        for (const t of timers) window.clearTimeout(t);
        timers.length = 0;
        overlay.removeEventListener('pointerdown', onTapSkip);
        window.removeEventListener('keydown', onKeySkip);
        this.activeCleanup = null;
        this.rootEl.innerHTML = '';
        this.rootEl.classList.add('wst7-hidden');
        resolve();
      };

      const onTapSkip = (): void => {
        if (canSkip) finishSplash();
      };

      const onKeySkip = (ev: KeyboardEvent): void => {
        if (canSkip && (ev.key === ' ' || ev.key === 'Enter' || ev.key === 'Escape')) {
          ev.preventDefault();
          finishSplash();
        }
      };

      timers.push(
        window.setTimeout(() => {
          canSkip = true;
        }, 260),
      );

      // Exact 1.1s (1100ms) brisk kinetic 1966 starburst duration!
      timers.push(window.setTimeout(finishSplash, 1100));

      overlay.addEventListener('pointerdown', onTapSkip);
      window.addEventListener('keydown', onKeySkip);

      this.activeCleanup = () => {
        finished = true;
        for (const t of timers) window.clearTimeout(t);
        timers.length = 0;
        overlay.removeEventListener('pointerdown', onTapSkip);
        window.removeEventListener('keydown', onKeySkip);
        resolve();
      };

      this.rootEl.innerHTML = '';
      this.rootEl.appendChild(overlay);
      this.rootEl.classList.remove('wst7-hidden');
    });
  }
}

export { TvTwistTheaterV7 as TvTwistTheaterControllerV7 };

// ----------------------------------------------------------------------------
// 5. Convenience Singleton Exports (Supports Both Class & Direct Function Calls)
// ----------------------------------------------------------------------------

let sharedTwistTheaterInstance: TvTwistTheaterV7 | null = null;

function getSharedTwistTheater(): TvTwistTheaterV7 {
  if (!sharedTwistTheaterInstance) {
    sharedTwistTheaterInstance = new TvTwistTheaterV7();
  }
  return sharedTwistTheaterInstance;
}

export function playMysteryCurtainDoorPick(
  outcomesPreview?: MysteryCurtainOutcomesPreviewV7,
): Promise<1 | 2 | 3> {
  return getSharedTwistTheater().playMysteryCurtainDoorPick(outcomesPreview);
}

export function offerInstantBargainTurntable(
  spec: InstantBargainSpecV7,
): Promise<InstantBargainDecisionV7> {
  return getSharedTwistTheater().offerInstantBargainTurntable(spec);
}

export function flashSecretSquareBanner(headline?: string): Promise<void> {
  return getSharedTwistTheater().flashSecretSquareBanner(headline);
}
