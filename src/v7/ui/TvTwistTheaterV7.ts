/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.7 — 1966 IN LIVING COLOR)
// `src/v7/ui/TvTwistTheaterV7.ts`
// Interactive 1966–1969 Network TV Board Twist Theater (Zero AI Boxes!):
//   1. `playMysteryCurtainDoorPick(outcomesPreview): Promise<1 | 2 | 3>`
//      Let's Make a Deal Curtain #1, #2, #3 velvet proscenium + floor footlights!
//   2. `offerInstantBargainTurntable(spec): Promise<'BUY' | 'PASS'>`
//      1969 Sale of the Century revolving prize spotlight temptation!
//   3. `flashSecretSquareBanner(headline): Promise<void>`
//      1.1s Morton Goldsholl / Saul Bass kinetic Daily Double starburst!
//   4. `playBigWheelSpin(opts?): Promise<BigWheelSpinResultV7>`
//      Flick-to-Spin 20-Wedge 1966 Living Color Studio Wheel + spring flapper!
//   5. `playPressYourLuckGremlinBoard(opts): Promise<PressYourLuckGremlinResultV7>`
//      12-Perimeter-Square Chasing Light-Board + 1966 Cartoon Studio Gremlin Zonk!
// ============================================================================

import '../../styles/tv_twist_theater_v7.css';
import type {
  CategoryIdV7,
  GremlinSkitIdV8,
  GremlinSkitPlayInputV8,
} from '../contracts_v7';
import type {
  MysteryCurtainKindV7,
  MysteryCurtainOutcomeV7,
} from '../boards/BoardTwistsEngineV7';
import {
  playGremlinCartoonSkitV8,
  renderPodiumGremlinMarkersHTMLV8,
} from './GremlinCartoonTheaterV8';

export { playGremlinCartoonSkitV8, renderPodiumGremlinMarkersHTMLV8 };

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

export type BigWheelWedgeKindV7 = 'CASH' | 'DOUBLE' | 'STEAL' | 'LIFELINE' | 'GREMLIN';

export interface BigWheelSpinOptionsV7 {
  readonly autoCpuName?: string;
  readonly seed?: number;
  readonly onPegTick?: (speed01: number) => void;
}

export interface BigWheelSpinResultV7 {
  readonly wedgeLabel: string;
  readonly kind: BigWheelWedgeKindV7;
  readonly cashValue: number;
  readonly multBonus: number;
}

export interface PressYourLuckGremlinOptionsV7 {
  readonly spinsEarned: number;
  readonly playerCash: number;
  readonly rivalCash?: number;
  readonly rivalName: string;
  readonly autoCpuMode?: boolean;
  readonly seed?: number;
  readonly skitSeed?: number;
  readonly gremlinCount?: number;
  readonly initialHotBoard?: boolean;
  readonly onBounceTick?: () => void;
  readonly onGremlinZonk?: () => void;
  readonly onGremlinBoing?: () => void;
  readonly onGremlinVoiceSting?: (skitId: GremlinSkitIdV8) => void;
}

export interface PressYourLuckGremlinResultV7 {
  readonly netCashDelta: number;
  readonly rivalCashDelta: number;
  readonly passedSpinsToRival: number;
  readonly hitGremlin: boolean;
  readonly headline: string;
  readonly skitPlayed?: GremlinSkitIdV8;
  readonly gremlinCount?: number;
}

export interface TvTwistTheaterCallbacksV7 {
  readonly onUiTapSfx?: () => void;
  readonly onCurtainOpenSfx?: (curtainNum: 1 | 2 | 3, kind: MysteryCurtainKindV7) => void;
  readonly onBargainBellSfx?: () => void;
  readonly onBargainBuySfx?: () => void;
  readonly onBargainPassSfx?: () => void;
  readonly onSecretSquareSfx?: () => void;
  readonly onWheelPegTickSfx?: (speed01: number) => void;
  readonly onWheelWinSfx?: (result: BigWheelSpinResultV7) => void;
  readonly onBounceTickSfx?: () => void;
  readonly onGremlinZonkSfx?: () => void;
  readonly onGremlinBoingSfx?: () => void;
  readonly onGremlinVoiceSting?: (skitId: GremlinSkitIdV8) => void;
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

function buildCurtainFootlightBarHtml(count = 9): string {
  const shells: string[] = [];
  for (let i = 0; i < count; i += 1) {
    shells.push(
      `<span class="wst7-footlight-shell wst7-fl-c${i % 3}" aria-hidden="true"><span class="wst7-footlight-glow"></span><span class="wst7-footlight-hood"></span></span>`,
    );
  }
  return `<div class="wst7-footlight-bar" aria-hidden="true">${shells.join('')}</div>`;
}

// ----------------------------------------------------------------------------
// 3B. Deterministic Seeded PRNG + 20-Wedge Studio Wheel & 12-Square Gremlin Board Specs
// ----------------------------------------------------------------------------

function createSeededRng(seed?: number): () => number {
  if (typeof seed !== 'number' || !Number.isFinite(seed)) {
    return () => Math.random();
  }
  let state = (Math.floor(seed) ^ 0x6d2b79f5) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BigWheelWedgeSpecV7 {
  readonly index: number;
  readonly wheelText: string;
  readonly wedgeLabel: string;
  readonly kind: BigWheelWedgeKindV7;
  readonly cashValue: number;
  readonly multBonus: number;
  readonly fillHex: string;
  readonly accentHex: string;
  readonly textHex: string;
}

const BIG_WHEEL_20_WEDGES_V7: readonly BigWheelWedgeSpecV7[] = [
  { index: 0, wheelText: '$1,000 ★', wedgeLabel: '$1,000 JACKPOT', kind: 'CASH', cashValue: 1000, multBonus: 0, fillHex: '#FFD966', accentHex: '#FFF5C2', textHex: '#0B1D30' },
  { index: 1, wheelText: 'GREMLIN!', wedgeLabel: 'GREMLIN (-25% STING)', kind: 'GREMLIN', cashValue: 0, multBonus: 0, fillHex: '#181E2C', accentHex: '#E63B7A', textHex: '#FFD966' },
  { index: 2, wheelText: '$350', wedgeLabel: '$350', kind: 'CASH', cashValue: 350, multBonus: 0, fillHex: '#0096A6', accentHex: '#19BFD0', textHex: '#FFF7E6' },
  { index: 3, wheelText: '$500', wedgeLabel: '$500', kind: 'CASH', cashValue: 500, multBonus: 0, fillHex: '#1E56C5', accentHex: '#4379EA', textHex: '#FFF7E6' },
  { index: 4, wheelText: 'LIFELINE', wedgeLabel: 'FREE LIFELINE', kind: 'LIFELINE', cashValue: 0, multBonus: 0, fillHex: '#169D53', accentHex: '#2ECC71', textHex: '#FFF7E6' },
  { index: 5, wheelText: '$350', wedgeLabel: '$350', kind: 'CASH', cashValue: 350, multBonus: 0, fillHex: '#FF6738', accentHex: '#FF8A65', textHex: '#FFF7E6' },
  { index: 6, wheelText: '2× DOUBLE', wedgeLabel: '2× DOUBLE', kind: 'DOUBLE', cashValue: 0, multBonus: 1.0, fillHex: '#F4A91F', accentHex: '#FFD966', textHex: '#0B1D30' },
  { index: 7, wheelText: '$500', wedgeLabel: '$500', kind: 'CASH', cashValue: 500, multBonus: 0, fillHex: '#E63B7A', accentHex: '#FF6B9E', textHex: '#FFF7E6' },
  { index: 8, wheelText: '$750', wedgeLabel: '$750', kind: 'CASH', cashValue: 750, multBonus: 0, fillHex: '#0C7E8F', accentHex: '#19BFD0', textHex: '#FFF7E6' },
  { index: 9, wheelText: 'STEAL $250', wedgeLabel: 'STEAL $250', kind: 'STEAL', cashValue: 250, multBonus: 0, fillHex: '#C92C58', accentHex: '#FF6738', textHex: '#FFF7E6' },
  { index: 10, wheelText: '$500', wedgeLabel: '$500', kind: 'CASH', cashValue: 500, multBonus: 0, fillHex: '#FFF4DC', accentHex: '#FFFFFF', textHex: '#0B1D30' },
  { index: 11, wheelText: 'GREMLIN!', wedgeLabel: 'GREMLIN (-25% STING)', kind: 'GREMLIN', cashValue: 0, multBonus: 0, fillHex: '#181E2C', accentHex: '#E63B7A', textHex: '#FFD966' },
  { index: 12, wheelText: '$750', wedgeLabel: '$750', kind: 'CASH', cashValue: 750, multBonus: 0, fillHex: '#1E56C5', accentHex: '#4A82F2', textHex: '#FFF7E6' },
  { index: 13, wheelText: '$350', wedgeLabel: '$350', kind: 'CASH', cashValue: 350, multBonus: 0, fillHex: '#E89B16', accentHex: '#FFD966', textHex: '#0B1D30' },
  { index: 14, wheelText: '2× DOUBLE', wedgeLabel: '2× DOUBLE', kind: 'DOUBLE', cashValue: 0, multBonus: 1.0, fillHex: '#0096A6', accentHex: '#40DBE8', textHex: '#FFF7E6' },
  { index: 15, wheelText: '$500', wedgeLabel: '$500', kind: 'CASH', cashValue: 500, multBonus: 0, fillHex: '#FF6738', accentHex: '#FF906B', textHex: '#FFF7E6' },
  { index: 16, wheelText: 'LIFELINE', wedgeLabel: 'FREE LIFELINE', kind: 'LIFELINE', cashValue: 0, multBonus: 0, fillHex: '#169D53', accentHex: '#2ECC71', textHex: '#FFF7E6' },
  { index: 17, wheelText: '$350', wedgeLabel: '$350', kind: 'CASH', cashValue: 350, multBonus: 0, fillHex: '#E63B7A', accentHex: '#FF6B9E', textHex: '#FFF7E6' },
  { index: 18, wheelText: 'STEAL $250', wedgeLabel: 'STEAL $250', kind: 'STEAL', cashValue: 250, multBonus: 0, fillHex: '#1544A4', accentHex: '#FF6738', textHex: '#FFF7E6' },
  { index: 19, wheelText: '$750', wedgeLabel: '$750', kind: 'CASH', cashValue: 750, multBonus: 0, fillHex: '#FFF4DC', accentHex: '#FFFFFF', textHex: '#0B1D30' },
];

function getWedgeAtWheelAngle(angleDeg: number): BigWheelWedgeSpecV7 {
  const localDeg = (((-angleDeg) % 360) + 360) % 360;
  const idx = Math.floor(((localDeg + 9) % 360) / 18) % 20;
  return BIG_WHEEL_20_WEDGES_V7[idx] ?? BIG_WHEEL_20_WEDGES_V7[0];
}

function buildBigWheelOuterBezelSvg(): string {
  const bulbs: string[] = [];
  const cx = 230;
  const cy = 230;
  const bulbR = 213;
  for (let i = 0; i < 24; i += 1) {
    const rad = ((i * 15 - 90) * Math.PI) / 180;
    const x = (cx + Math.cos(rad) * bulbR).toFixed(1);
    const y = (cy + Math.sin(rad) * bulbR).toFixed(1);
    const gx = (cx + Math.cos(rad) * bulbR - 1.3).toFixed(1);
    const gy = (cy + Math.sin(rad) * bulbR - 1.3).toFixed(1);
    const circuit = i % 3;
    bulbs.push(
      `<circle class="wst7-bulb-halo wst7-c${circuit}" cx="${x}" cy="${y}" r="11.5" fill="url(#wst7TungstenHalo)"/>`,
      `<circle cx="${x}" cy="${y}" r="7.2" fill="#2A1708" stroke="#C98314" stroke-width="1.2"/>`,
      `<circle class="wst7-bulb-dot wst7-c${circuit}" cx="${x}" cy="${y}" r="4.8" fill="#FFD966"/>`,
      `<circle cx="${gx}" cy="${gy}" r="1.4" fill="#FFFDF4" fill-opacity="0.9"/>`,
    );
  }
  return `
    <svg class="wst7-wheel-bezel-svg" viewBox="0 0 460 460" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="wst7BezelGrad" cx="50%" cy="46%" r="54%">
          <stop offset="78%" stop-color="#091829"/>
          <stop offset="86%" stop-color="#132D47"/>
          <stop offset="92%" stop-color="#6B371E"/>
          <stop offset="96%" stop-color="#3F1D0E"/>
          <stop offset="98.5%" stop-color="#F4A91F"/>
          <stop offset="100%" stop-color="#8A5205"/>
        </radialGradient>
        <radialGradient id="wst7TungstenHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFF2B2" stop-opacity="0.92"/>
          <stop offset="48%" stop-color="#FFB938" stop-opacity="0.44"/>
          <stop offset="100%" stop-color="#FF9B1A" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="wst7BracketBrass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF5C2"/>
          <stop offset="45%" stop-color="#F4A91F"/>
          <stop offset="100%" stop-color="#8A5104"/>
        </linearGradient>
      </defs>
      <!-- Outer American Walnut & Turned Brass Marquee Cabinet -->
      <circle cx="230" cy="230" r="228" fill="url(#wst7BezelGrad)"/>
      <circle cx="230" cy="230" r="224" stroke="#FFD966" stroke-opacity="0.52" stroke-width="1.6"/>
      <circle cx="230" cy="230" r="201" fill="#061220" stroke="#FFD966" stroke-width="3.2"/>
      <circle cx="230" cy="230" r="197.5" stroke="#081625" stroke-width="2"/>
      ${bulbs.join('')}
      <!-- Bolted 12 O'Clock Brass Flapper Mounting Saddle -->
      <rect x="206" y="1" width="48" height="20" rx="6" fill="url(#wst7BracketBrass)" stroke="#071321" stroke-width="2.2"/>
      <circle cx="215" cy="11" r="3" fill="#0B1D30" stroke="#FFF7E6" stroke-width="1"/>
      <circle cx="245" cy="11" r="3" fill="#0B1D30" stroke="#FFF7E6" stroke-width="1"/>
    </svg>
  `;
}

function buildBigWheelDiscSvg(): string {
  const cx = 230;
  const cy = 230;
  const rOuter = 195;
  const rInner = 50;
  const pegR = 186;

  const wedgesMarkup: string[] = [];
  const pegsMarkup: string[] = [];

  for (const wedge of BIG_WHEEL_20_WEDGES_V7) {
    const centerDeg = wedge.index * 18 - 90;
    const startRad = ((centerDeg - 9) * Math.PI) / 180;
    const endRad = ((centerDeg + 9) * Math.PI) / 180;
    const x1 = (cx + Math.cos(startRad) * rOuter).toFixed(2);
    const y1 = (cy + Math.sin(startRad) * rOuter).toFixed(2);
    const x2 = (cx + Math.cos(endRad) * rOuter).toFixed(2);
    const y2 = (cy + Math.sin(endRad) * rOuter).toFixed(2);
    const xi1 = (cx + Math.cos(startRad) * rInner).toFixed(2);
    const yi1 = (cy + Math.sin(startRad) * rInner).toFixed(2);
    const xi2 = (cx + Math.cos(endRad) * rInner).toFixed(2);
    const yi2 = (cy + Math.sin(endRad) * rInner).toFixed(2);

    // Outer illuminated backlit band inside each wedge
    const rBand = 166;
    const xb1 = (cx + Math.cos(startRad) * rBand).toFixed(2);
    const yb1 = (cy + Math.sin(startRad) * rBand).toFixed(2);
    const xb2 = (cx + Math.cos(endRad) * rBand).toFixed(2);
    const yb2 = (cy + Math.sin(endRad) * rBand).toFixed(2);

    const fillPaint =
      wedge.index === 0
        ? 'url(#wst7JackpotGoldFoil)'
        : wedge.kind === 'GREMLIN'
          ? 'url(#wst7GremlinHazard)'
          : wedge.fillHex;

    const fontSize =
      wedge.wheelText.length <= 4
        ? 18.5
        : wedge.wheelText.length <= 8
          ? 15
          : 14.2;
    const textLenAttr =
      wedge.wheelText.length >= 9 ? ' textLength="90" lengthAdjust="spacingAndGlyphs"' : '';
    const textStroke =
      wedge.textHex === '#0B1D30'
        ? ' stroke="rgba(255,247,230,0.45)" stroke-width="1.2" paint-order="stroke"'
        : ' stroke="rgba(7,19,33,0.58)" stroke-width="2" paint-order="stroke"';

    wedgesMarkup.push(`
      <g class="wst7-wheel-wedge" data-wedge-idx="${wedge.index}" data-kind="${wedge.kind}">
        <path d="M ${xi1} ${yi1} L ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${xi2} ${yi2} A ${rInner} ${rInner} 0 0 0 ${xi1} ${yi1} Z"
              fill="${fillPaint}" stroke="#D99018" stroke-width="1.7"/>
        <path d="M ${xb1} ${yb1} L ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${xb2} ${yb2} A ${rBand} ${rBand} 0 0 0 ${xb1} ${yb1} Z"
              fill="${wedge.accentHex}" fill-opacity="${wedge.kind === 'GREMLIN' ? '0.32' : '0.24'}"/>
        <text x="352" y="230" text-anchor="middle" dominant-baseline="central"
              transform="rotate(${centerDeg.toFixed(1)} 230 230)"
              font-family="Jost, Plus Jakarta Sans, sans-serif" font-weight="900"
              font-size="${fontSize}" letter-spacing="0.015em"${textLenAttr}${textStroke}
              fill="${wedge.textHex}">${wedge.wheelText}</text>
      </g>
    `);

    // 3D Sculpted Brass Rim Pegs with directional cast shadow + bronze collar + specular glint!
    const px = cx + Math.cos(startRad) * pegR;
    const py = cy + Math.sin(startRad) * pegR;
    pegsMarkup.push(`
      <circle cx="${(px + 2.2).toFixed(2)}" cy="${(py + 2.8).toFixed(2)}" r="5.6" fill="#040B14" fill-opacity="0.7"/>
      <circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="5.3" fill="url(#wst7BrassPegBase)" stroke="#4C2B02" stroke-width="0.9"/>
      <circle cx="${(px - 0.5).toFixed(2)}" cy="${(py - 0.5).toFixed(2)}" r="3.8" fill="url(#wst7BrassPegCap)"/>
      <circle cx="${(px - 1.5).toFixed(2)}" cy="${(py - 1.6).toFixed(2)}" r="1.35" fill="#FFFDF4"/>
    `);
  }

  // 6 Recessed Brass Hex Lug Bolts on the Spun-Aluminum Hub Flange
  const hubBolts: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const a = ((i * 60 + 30) * Math.PI) / 180;
    const bx = (cx + Math.cos(a) * 41.5).toFixed(1);
    const by = (cy + Math.sin(a) * 41.5).toFixed(1);
    hubBolts.push(
      `<circle cx="${bx}" cy="${by}" r="3.4" fill="#4C2B02"/>`,
      `<circle cx="${bx}" cy="${by}" r="2.4" fill="#FFD966"/>`,
      `<circle cx="${(Number(bx) - 0.6).toFixed(1)}" cy="${(Number(by) - 0.6).toFixed(1)}" r="0.8" fill="#FFFDF4"/>`,
    );
  }

  return `
    <svg class="wst7-wheel-disc-svg" viewBox="0 0 460 460" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="wst7JackpotGoldFoil" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FFFBE0"/>
          <stop offset="48%" stop-color="#FFD966"/>
          <stop offset="100%" stop-color="#E6950A"/>
        </radialGradient>
        <pattern id="wst7GremlinHazard" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="12" fill="#171C2B"/>
          <rect width="6" height="12" fill="#4B122E"/>
        </pattern>
        <radialGradient id="wst7WheelBacklightVignette" cx="50%" cy="50%" r="50%">
          <stop offset="22%" stop-color="#040B14" stop-opacity="0.34"/>
          <stop offset="68%" stop-color="#FFFFFF" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="#040B14" stop-opacity="0.22"/>
        </radialGradient>
        <radialGradient id="wst7BrassPegBase" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#F6B83A"/>
          <stop offset="65%" stop-color="#A86606"/>
          <stop offset="100%" stop-color="#5B3302"/>
        </radialGradient>
        <radialGradient id="wst7BrassPegCap" cx="32%" cy="28%" r="70%">
          <stop offset="0%" stop-color="#FFFBE6"/>
          <stop offset="38%" stop-color="#FFD966"/>
          <stop offset="82%" stop-color="#D4880D"/>
          <stop offset="100%" stop-color="#7B4703"/>
        </radialGradient>
        <linearGradient id="wst7SpunAluminum" x1="12%" y1="10%" x2="88%" y2="90%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="24%" stop-color="#CAD4E0"/>
          <stop offset="48%" stop-color="#8797AA"/>
          <stop offset="72%" stop-color="#E7EEF6"/>
          <stop offset="100%" stop-color="#6A7A8F"/>
        </linearGradient>
        <radialGradient id="wst7HubInnerShadow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stop-color="#0D2238"/>
          <stop offset="100%" stop-color="#050F1A"/>
        </radialGradient>
      </defs>
      <circle cx="230" cy="230" r="196" fill="#0B1D30"/>
      ${wedgesMarkup.join('')}
      <!-- Subtle Studio Backlight & Edge Depth Overlay -->
      <circle cx="230" cy="230" r="195" fill="url(#wst7WheelBacklightVignette)" pointer-events="none"/>
      <circle cx="230" cy="230" r="195" stroke="#FFD966" stroke-width="3.4"/>
      <circle cx="230" cy="230" r="176" stroke="#FFF7E6" stroke-opacity="0.22" stroke-width="1"/>
      ${pegsMarkup.join('')}
      <!-- Lathe-Turned Spun-Aluminum Central Studio Hubcap -->
      <circle cx="233" cy="234" r="52" fill="#040B14" fill-opacity="0.56"/>
      <circle cx="230" cy="230" r="51" fill="url(#wst7SpunAluminum)" stroke="#FFFDF6" stroke-width="2.2"/>
      <!-- Anisotropic Brushed-Aluminum Specular Sheen Wedges -->
      <path d="M230 230 L194 194 A51 51 0 0 1 245 181 Z" fill="#FFFFFF" fill-opacity="0.42"/>
      <path d="M230 230 L266 266 A51 51 0 0 1 215 279 Z" fill="#FFFFFF" fill-opacity="0.34"/>
      <path d="M230 230 L181 244 A51 51 0 0 1 192 195 Z" fill="#1C2C3E" fill-opacity="0.2"/>
      <path d="M230 230 L279 216 A51 51 0 0 1 268 265 Z" fill="#1C2C3E" fill-opacity="0.2"/>
      <!-- Fine Concentric Lathe Grooves -->
      <circle cx="230" cy="230" r="46" stroke="#FFFFFF" stroke-opacity="0.42" stroke-width="0.9"/>
      <circle cx="230" cy="230" r="37" stroke="#36485D" stroke-opacity="0.45" stroke-width="1.1"/>
      ${hubBolts.join('')}
      <!-- Recessed Peacock-Navy & Gold Atomic Starburst Center Medallion -->
      <circle cx="230" cy="230" r="31" fill="url(#wst7HubInnerShadow)" stroke="#F4A91F" stroke-width="2.8"/>
      <path d="M230 203 L235.5 223.5 L256 230 L235.5 236.5 L230 257 L224.5 236.5 L204 230 L224.5 223.5 Z" fill="#FFD966"/>
      <path d="M230 212 L233 226 L247 230 L233 234 L230 248 L227 234 L213 230 L227 226 Z" fill="#FFFDF4"/>
      <circle cx="230" cy="230" r="8.5" fill="#E63B7A" stroke="#FFF7E6" stroke-width="2"/>
      <circle cx="227.5" cy="227.5" r="2.2" fill="#FFFDF4"/>
    </svg>
  `;
}

function buildBrassFlapperSvg(): string {
  // Authentic 1966 Spring-Loaded Stitched Oxblood Leather & Brushed Brass Flapper Pointer!
  return `
    <svg class="wst7-flapper-svg" viewBox="0 0 60 76" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="wst7FlapBrass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF7CE"/>
          <stop offset="45%" stop-color="#F4A91F"/>
          <stop offset="100%" stop-color="#8A5104"/>
        </linearGradient>
        <linearGradient id="wst7FlapLeather" x1="20%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stop-color="#E63A32"/>
          <stop offset="55%" stop-color="#B01D1E"/>
          <stop offset="100%" stop-color="#6B0E12"/>
        </linearGradient>
      </defs>
      <!-- Coiled Brass Return-Spring Shoulders -->
      <path d="M13 13 C6 15 6 24 14 25 M47 13 C54 15 54 24 46 25" stroke="#FFD966" stroke-width="3.2" stroke-linecap="round"/>
      <!-- Tapered Stitched Leather Paddle Tongue -->
      <path d="M15 20 L45 20 L35 66 C33.5 72 26.5 72 25 66 Z" fill="url(#wst7FlapLeather)" stroke="#071321" stroke-width="3" stroke-linejoin="round"/>
      <!-- Cream Saddle-Stitch Seam Along Leather Edge -->
      <path d="M20 25 L27 60 M40 25 L33 60" stroke="#FFF3D1" stroke-opacity="0.82" stroke-width="1.4" stroke-dasharray="3 3" stroke-linecap="round"/>
      <!-- Gleaming Brass Strike-Tip Cap -->
      <path d="M25.5 57 L34.5 57 L33.2 65.5 C32.2 69 27.8 69 26.8 65.5 Z" fill="url(#wst7FlapBrass)"/>
      <!-- Heavy Brushed-Brass Pivot Collar & Rivet -->
      <rect x="11" y="5" width="38" height="19" rx="9.5" fill="url(#wst7FlapBrass)" stroke="#071321" stroke-width="2.8"/>
      <circle cx="30" cy="14.5" r="6.4" fill="#FFF7E6" stroke="#8A5104" stroke-width="2.2"/>
      <circle cx="30" cy="14.5" r="2.6" fill="#0B1D30"/>
      <line x1="27.8" y1="12.5" x2="32.2" y2="16.5" stroke="#FFD966" stroke-width="1.2"/>
    </svg>
  `;
}

interface GremlinBoardSquareSpecV7 {
  readonly index: number;
  readonly gridCol: number;
  readonly gridRow: number;
  readonly kind: 'CASH' | 'CASH_SPIN' | 'JACKPOT' | 'STEAL' | 'GREMLIN';
  readonly mainLabel: string;
  readonly subLabel: string;
  readonly cashValue: number;
  readonly extraSpin: boolean;
  readonly tone: 'teal' | 'cobalt' | 'gold' | 'tangerine' | 'cerise' | 'gremlin' | 'hot-gremlin';
}

export const GREMLIN_BOARD_12_SQUARES_V7: readonly GremlinBoardSquareSpecV7[] = [
  { index: 0, gridCol: 1, gridRow: 1, kind: 'CASH', mainLabel: '+$250', subLabel: 'CASH', cashValue: 250, extraSpin: false, tone: 'teal' },
  { index: 1, gridCol: 2, gridRow: 1, kind: 'CASH_SPIN', mainLabel: '+$300', subLabel: '+1 SPIN', cashValue: 300, extraSpin: true, tone: 'cobalt' },
  { index: 2, gridCol: 3, gridRow: 1, kind: 'GREMLIN', mainLabel: 'GREMLIN', subLabel: '-40% ZONK', cashValue: 0, extraSpin: false, tone: 'gremlin' },
  { index: 3, gridCol: 4, gridRow: 1, kind: 'JACKPOT', mainLabel: '+$500', subLabel: 'JACKPOT', cashValue: 500, extraSpin: false, tone: 'gold' },
  { index: 4, gridCol: 4, gridRow: 2, kind: 'CASH', mainLabel: '+$200', subLabel: 'CASH', cashValue: 200, extraSpin: false, tone: 'tangerine' },
  { index: 5, gridCol: 4, gridRow: 3, kind: 'STEAL', mainLabel: 'STEAL', subLabel: '$200', cashValue: 200, extraSpin: false, tone: 'cerise' },
  { index: 6, gridCol: 4, gridRow: 4, kind: 'GREMLIN', mainLabel: 'GREMLIN', subLabel: '-40% ZONK', cashValue: 0, extraSpin: false, tone: 'gremlin' },
  { index: 7, gridCol: 3, gridRow: 4, kind: 'CASH', mainLabel: '+$250', subLabel: 'CASH', cashValue: 250, extraSpin: false, tone: 'teal' },
  { index: 8, gridCol: 2, gridRow: 4, kind: 'CASH_SPIN', mainLabel: '+$300', subLabel: '+1 SPIN', cashValue: 300, extraSpin: true, tone: 'cobalt' },
  { index: 9, gridCol: 1, gridRow: 4, kind: 'CASH', mainLabel: '+$150', subLabel: 'CASH', cashValue: 150, extraSpin: false, tone: 'tangerine' },
  { index: 10, gridCol: 1, gridRow: 3, kind: 'GREMLIN', mainLabel: 'GREMLIN', subLabel: '-40% ZONK', cashValue: 0, extraSpin: false, tone: 'gremlin' },
  { index: 11, gridCol: 1, gridRow: 2, kind: 'CASH', mainLabel: '+$150', subLabel: 'CASH', cashValue: 150, extraSpin: false, tone: 'teal' },
];

const HOT_GREMLIN_SQUARE_INDEX_V8 = 4;

function getActiveGremlinBoardSquaresV8(isHotBoard: boolean): readonly GremlinBoardSquareSpecV7[] {
  if (!isHotBoard) return GREMLIN_BOARD_12_SQUARES_V7;
  return GREMLIN_BOARD_12_SQUARES_V7.map((sq) =>
    sq.index === HOT_GREMLIN_SQUARE_INDEX_V8
      ? {
          ...sq,
          kind: 'GREMLIN',
          mainLabel: 'HOT GREMLIN!',
          subLabel: '🔥 -40% ZONK',
          cashValue: 0,
          extraSpin: false,
          tone: 'hot-gremlin',
        }
      : sq,
  );
}

export interface PressYourLuckSpinEvAnalysisV8 {
  readonly isHotBoard: boolean;
  readonly gremlinCount: 3 | 4;
  readonly sumNonGremlinValues: number;
  readonly zapPenalty: number;
  readonly evTake: number;
  readonly evPass: number;
  readonly shouldRecommendPass: boolean;
}

/**
 * Exact 12-square Press-Your-Luck Expected Value calculator (`EV(take)` vs `EV(pass)`):
 * - Spin 1 (`isHotBoard = false`): `3/12` Gremlins, `sumNonGremlin = $2,300` -> `EV(take) > 0` up to `$1,925`.
 * - Spin 2+ (`isHotBoard = true`): `4/12` Gremlins (`HOT GREMLIN` active), `sumNonGremlin = $2,100` ->
 *   `EV(take) = 175 - (4/12) * zapPenalty`, crossing `< 0` cleanly around `$1,325–$1,450`!
 */
export function evaluatePressYourLuckSpinEvV8(params: {
  readonly selfCash: number;
  readonly rivalCash?: number;
  readonly spinsTaken: number;
  readonly spinsRemaining?: number;
  readonly forceHotBoard?: boolean;
}): PressYourLuckSpinEvAnalysisV8 {
  const isHotBoard = Boolean(params.forceHotBoard || params.spinsTaken >= 1);
  const squares = getActiveGremlinBoardSquaresV8(isHotBoard);
  const selfBank = Math.max(0, Math.round(params.selfCash || 0));
  const hasExplicitRivalCash =
    typeof params.rivalCash === 'number' && Number.isFinite(params.rivalCash);
  const effectiveRivalBank = hasExplicitRivalCash
    ? Math.max(0, Math.round(params.rivalCash!))
    : selfBank;

  let gremlinCount = 0;
  let sumNonGremlinValues = 0;
  for (const sq of squares) {
    if (sq.kind === 'GREMLIN') {
      gremlinCount += 1;
    } else if (sq.kind === 'STEAL') {
      const stealAmt = hasExplicitRivalCash
        ? Math.min(sq.cashValue, effectiveRivalBank)
        : sq.cashValue;
      sumNonGremlinValues += stealAmt;
    } else {
      sumNonGremlinValues += sq.cashValue;
    }
  }

  const zapPenalty = Math.round((selfBank * 0.4) / 25) * 25;
  const evTake = sumNonGremlinValues / 12 - (gremlinCount / 12) * zapPenalty;

  // Passing forces the opponent onto the hot 4/12 Gremlin board (risking 40% of rivalBankroll vs safe squares)
  const hotSquares = getActiveGremlinBoardSquaresV8(true);
  let sumRivalSafeValues = 0;
  for (const sq of hotSquares) {
    if (sq.kind === 'GREMLIN') continue;
    if (sq.kind === 'STEAL') {
      sumRivalSafeValues += Math.min(sq.cashValue, selfBank);
    } else {
      sumRivalSafeValues += sq.cashValue;
    }
  }
  const rivalZapRisk = Math.round((effectiveRivalBank * 0.4) / 25) * 25;
  const evPass = ((4 / 12) * rivalZapRisk - sumRivalSafeValues / 12) * 0.35;
  const spinsRem = params.spinsRemaining ?? 1;

  return {
    isHotBoard,
    gremlinCount: (gremlinCount === 4 ? 4 : 3) as 3 | 4,
    sumNonGremlinValues,
    zapPenalty,
    evTake: Math.round(evTake * 100) / 100,
    evPass: Math.round(evPass * 100) / 100,
    shouldRecommendPass: spinsRem >= 1 && evPass > evTake,
  };
}

function buildMiniGremlinBadgeSvg(): string {
  // Precision 1966 RCA Broadcast Monoscope Hazard Reticle & Amber Oscilloscope Spike (Zero Cartoon Clip-Art!)
  return `
    <svg class="wst7-mini-gremlin-svg" viewBox="0 0 60 36" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="56" height="32" rx="6" fill="#091826" stroke="#E63B7A" stroke-width="2"/>
      <rect x="5" y="5" width="50" height="26" rx="4" fill="#06111D" stroke="#FFD966" stroke-opacity="0.4" stroke-width="1"/>
      <!-- Precision Monoscope Crosshair & Concentric Target Rings -->
      <line x1="30" y1="6" x2="30" y2="30" stroke="#FFF7E6" stroke-opacity="0.34" stroke-width="1"/>
      <line x1="8" y1="18" x2="52" y2="18" stroke="#FFF7E6" stroke-opacity="0.34" stroke-width="1"/>
      <circle cx="30" cy="18" r="10.5" stroke="#FFF7E6" stroke-opacity="0.58" stroke-width="1.2"/>
      <circle cx="30" cy="18" r="5" stroke="#E63B7A" stroke-width="1.5"/>
      <!-- Live Amber Phosphor Static Surge Waveform -->
      <path d="M8 18 L16 18 L20 11 L24 25 L28 9 L32 27 L36 12 L40 23 L44 18 L52 18"
            stroke="#FFD966" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Blinking Crimson Signal-Jam Tally Jewel -->
      <circle cx="49" cy="9.5" r="2.6" fill="#FF3B4E"/>
      <circle cx="48.3" cy="8.8" r="0.9" fill="#FFF7E6"/>
    </svg>
  `;
}

function buildBroadcastMonoscopeZonkSvg(): string {
  // Million-Dollar 1966 IBC "PLEASE STAND BY — STUDIO SIGNAL JAMMED"
  // Authentic RCA Broadcast Monoscope Bullseye & Resolution Wedges + Dual-Trace Amber/Cyan
  // Oscilloscope Lissajous Static Surge + Morton Goldsholl Geometric Starburst Sparks!
  const tickMarks: string[] = [];
  for (let x = 28; x <= 252; x += 12) {
    if (Math.abs(x - 140) < 10) continue;
    const h = x % 24 === 4 ? 7 : 4;
    tickMarks.push(`<line x1="${x}" y1="${88 - h}" x2="${x}" y2="${88 + h}" stroke="#FFF7E6" stroke-opacity="0.45" stroke-width="1"/>`);
  }
  for (let y = 20; y <= 156; y += 12) {
    if (Math.abs(y - 88) < 10) continue;
    const w = y % 24 === 16 ? 7 : 4;
    tickMarks.push(`<line x1="${140 - w}" y1="${y}" x2="${140 + w}" y2="${y}" stroke="#FFF7E6" stroke-opacity="0.45" stroke-width="1"/>`);
  }

  // 4-Quadrant RCA Optical Resolution Wedges (North, South, East, West converging test lines)
  const resWedges = `
    <g stroke="#FFF7E6" stroke-opacity="0.44" stroke-width="1.15">
      <!-- Top & Bottom Resolution Fans -->
      <line x1="140" y1="70" x2="128" y2="22"/><line x1="140" y1="70" x2="134" y2="21"/>
      <line x1="140" y1="70" x2="140" y2="20"/><line x1="140" y1="70" x2="146" y2="21"/>
      <line x1="140" y1="70" x2="152" y2="22"/>
      <line x1="140" y1="106" x2="128" y2="154"/><line x1="140" y1="106" x2="134" y2="155"/>
      <line x1="140" y1="106" x2="140" y2="156"/><line x1="140" y1="106" x2="146" y2="155"/>
      <line x1="140" y1="106" x2="152" y2="154"/>
      <!-- Left & Right Resolution Fans -->
      <line x1="122" y1="88" x2="68" y2="76"/><line x1="122" y1="88" x2="67" y2="82"/>
      <line x1="122" y1="88" x2="66" y2="88"/><line x1="122" y1="88" x2="67" y2="94"/>
      <line x1="122" y1="88" x2="68" y2="100"/>
      <line x1="158" y1="88" x2="212" y2="76"/><line x1="158" y1="88" x2="213" y2="82"/>
      <line x1="158" y1="88" x2="214" y2="88"/><line x1="158" y1="88" x2="213" y2="94"/>
      <line x1="158" y1="88" x2="212" y2="100"/>
    </g>
  `;

  // 4 Precision Corner Registration Targets
  const cornerTargets = [
    [26, 24],
    [254, 24],
    [26, 152],
    [254, 152],
  ]
    .map(
      ([cx, cy]) => `
        <g stroke="#FFF7E6" stroke-opacity="0.58" stroke-width="1.2">
          <circle cx="${cx}" cy="${cy}" r="10.5"/>
          <circle cx="${cx}" cy="${cy}" r="5.2" stroke="#FFD966" stroke-opacity="0.72"/>
          <line x1="${cx - 14}" y1="${cy}" x2="${cx + 14}" y2="${cy}"/>
          <line x1="${cx}" y1="${cy - 14}" x2="${cx}" y2="${cy + 14}"/>
        </g>
      `,
    )
    .join('');

  return `
    <svg class="wst7-gremlin-cartoon-svg" viewBox="0 0 280 176" fill="none" aria-hidden="true">
      <defs>
        <pattern id="wst7CrtScanlines" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="2" fill="#030912" fill-opacity="0.28"/>
        </pattern>
        <linearGradient id="wst7RollBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
          <stop offset="40%" stop-color="#FFD966" stop-opacity="0.22"/>
          <stop offset="54%" stop-color="#36F1FF" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="wst7ScopeCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFE27A" stop-opacity="0.42"/>
          <stop offset="48%" stop-color="#E63B7A" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#061220" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="wst7CrtVignette" cx="50%" cy="50%" r="64%">
          <stop offset="56%" stop-color="#040B14" stop-opacity="0"/>
          <stop offset="100%" stop-color="#02070E" stop-opacity="0.72"/>
        </radialGradient>
      </defs>

      <!-- 1. Muted 1966 RCA NTSC 7-Bar Studio Test Pattern + Lower Reverse Castellation -->
      <g opacity="0.44">
        <rect x="0" y="0" width="40" height="142" fill="#F2E8D5"/>
        <rect x="40" y="0" width="40" height="142" fill="#F4C425"/>
        <rect x="80" y="0" width="40" height="142" fill="#18B8CA"/>
        <rect x="120" y="0" width="40" height="142" fill="#21A85B"/>
        <rect x="160" y="0" width="40" height="142" fill="#D93678"/>
        <rect x="200" y="0" width="40" height="142" fill="#D6322B"/>
        <rect x="240" y="0" width="40" height="142" fill="#1B4BB8"/>
        <rect x="0" y="142" width="40" height="12" fill="#1B4BB8"/>
        <rect x="40" y="142" width="40" height="12" fill="#09131F"/>
        <rect x="80" y="142" width="40" height="12" fill="#D93678"/>
        <rect x="120" y="142" width="40" height="12" fill="#09131F"/>
        <rect x="160" y="142" width="40" height="12" fill="#18B8CA"/>
        <rect x="200" y="142" width="40" height="12" fill="#09131F"/>
        <rect x="240" y="142" width="40" height="12" fill="#F2E8D5"/>
      </g>
      <!-- Deep Cathode-Ray Monitor Well Base + Center Phosphor Bloom -->
      <rect x="0" y="0" width="280" height="176" fill="#071525" fill-opacity="0.62"/>
      <circle cx="140" cy="88" r="88" fill="url(#wst7ScopeCoreGlow)"/>

      <!-- 2. Precision 1966 RCA Monoscope Reticle, Calibration Wedges & Corner Targets -->
      <rect x="10" y="10" width="260" height="156" rx="8" stroke="#FFF7E6" stroke-opacity="0.34" stroke-width="1.5"/>
      <line x1="14" y1="88" x2="266" y2="88" stroke="#FFF7E6" stroke-opacity="0.48" stroke-width="1.2"/>
      <line x1="140" y1="14" x2="140" y2="162" stroke="#FFF7E6" stroke-opacity="0.48" stroke-width="1.2"/>
      ${tickMarks.join('')}
      ${resWedges}
      ${cornerTargets}

      <!-- Concentric Monoscope Bullseye Calibration Rings -->
      <circle cx="140" cy="88" r="70" stroke="#FFF7E6" stroke-opacity="0.72" stroke-width="2.2"/>
      <circle cx="140" cy="88" r="56" stroke="#FFD966" stroke-opacity="0.52" stroke-width="1.4" stroke-dasharray="6 5"/>
      <circle cx="140" cy="88" r="38" stroke="#FFF7E6" stroke-opacity="0.65" stroke-width="1.8"/>
      <circle cx="140" cy="88" r="18" fill="#091829" fill-opacity="0.88" stroke="#E63B7A" stroke-width="2.4"/>

      <!-- Engraved 1966 Network Call-Sign Micro-Plaque Clearly Inside CRT Bezel -->
      <rect x="74" y="17" width="132" height="17" rx="3.5" fill="#091829" stroke="#FFD966" stroke-width="1.4"/>
      <text x="140" y="28.5" text-anchor="middle" font-family="Michroma, Jost, sans-serif" font-weight="700" font-size="8.2" letter-spacing="0.09em" fill="#FFD966">IBC · CH-6A · MONOSCOPE</text>

      <!-- 3. Live Dual-Trace Amber & Cyan Phosphor Oscilloscope Static Surge + Lissajous Orbit -->
      <g class="wst7-scope-lissajous">
        <path d="M90 88 C90 52 126 52 140 88 C154 124 190 124 190 88 C190 52 154 52 140 88 C126 124 90 124 90 88 Z"
              stroke="#FF9B1A" stroke-opacity="0.48" stroke-width="6.5" stroke-linecap="round"/>
        <path d="M90 88 C90 52 126 52 140 88 C154 124 190 124 190 88 C190 52 154 52 140 88 C126 124 90 124 90 88 Z"
              stroke="#FFD966" stroke-width="2.4" stroke-linecap="round"/>
      </g>

      <!-- Trace A: Warm 2700K Amber Phosphor Static Surge Waveform -->
      <g class="wst7-scope-trace-a">
        <path d="M10 88 L38 88 L47 68 L56 108 L65 56 L75 118 L86 44 L97 132 L108 38 L120 138 L131 48 L140 126 L151 36 L163 136 L175 46 L186 128 L197 58 L208 114 L218 70 L228 104 L237 88 L270 88"
              stroke="#FF9B1A" stroke-opacity="0.44" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M10 88 L38 88 L47 68 L56 108 L65 56 L75 118 L86 44 L97 132 L108 38 L120 138 L131 48 L140 126 L151 36 L163 136 L175 46 L186 128 L197 58 L208 114 L218 70 L228 104 L237 88 L270 88"
              stroke="#FFF2B2" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
      </g>

      <!-- Trace B: Secondary Cyan Broadcast Carrier Harmonic Wave -->
      <g class="wst7-scope-trace-b">
        <path d="M10 88 Q30 62 50 88 T90 88 Q110 42 130 88 T170 88 Q190 134 210 88 T250 88 L270 88"
              stroke="#36F1FF" stroke-opacity="0.72" stroke-width="1.9" stroke-linecap="round"/>
      </g>

      <!-- 4. Crisp Morton Goldsholl 1966 Geometric Starburst Sparks (Pure Mid-Century Motion Craft!) -->
      <g class="wst7-gremlin-sparks-a">
        <!-- Center Bullseye 8-Point Atomic Starburst Core -->
        <path d="M140 62 L144 82 L166 88 L144 94 L140 114 L136 94 L114 88 L136 82 Z" fill="#FFD966" stroke="#071321" stroke-width="1.6"/>
        <path d="M140 72 L142.5 85 L155 88 L142.5 91 L140 104 L137.5 91 L125 88 L137.5 85 Z" fill="#FFFDF4"/>
        <!-- Corner Atomic Diamonds -->
        <path d="M74 44 L77 52 L85 55 L77 58 L74 66 L71 58 L63 55 L71 52 Z" fill="#36F1FF"/>
        <path d="M206 112 L209 120 L217 123 L209 126 L206 134 L203 126 L195 123 L203 120 Z" fill="#FFD966"/>
      </g>
      <g class="wst7-gremlin-sparks-b">
        <path d="M204 42 L207 51 L216 54 L207 57 L204 66 L201 57 L192 54 L201 51 Z" fill="#E63B7A"/>
        <path d="M76 112 L79 121 L88 124 L79 127 L76 136 L73 127 L64 124 L73 121 Z" fill="#FFD966"/>
        <circle cx="140" cy="88" r="6" fill="#FF3B4E" stroke="#FFFDF4" stroke-width="1.8"/>
      </g>

      <!-- 5. Animated Horizontal-Hold CRT Roll Bar, Scanlines & Curved Glass Vignette -->
      <rect class="wst7-crt-rollbar" x="0" y="-34" width="280" height="34" fill="url(#wst7RollBarGrad)"/>
      <rect x="0" y="0" width="280" height="176" fill="url(#wst7CrtScanlines)" pointer-events="none"/>
      <rect x="0" y="0" width="280" height="176" fill="url(#wst7CrtVignette)" pointer-events="none"/>
    </svg>
  `;
}

function buildButtonGlyphSvg(kind: 'WHEEL' | 'STOP' | 'BELL'): string {
  if (kind === 'STOP') {
    return `
      <svg class="wst7-btn-glyph-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="12" fill="#FFF7E6" stroke="#7B120C" stroke-width="2.2"/>
        <circle cx="14" cy="14" r="7.2" fill="#E03E36"/>
        <circle cx="14" cy="14" r="3.2" fill="#FFD966"/>
      </svg>
    `;
  }
  if (kind === 'BELL') {
    return `
      <svg class="wst7-btn-glyph-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="5.5" r="2.2" fill="#FFF7E6"/>
        <path d="M7.5 19.5 C7.5 12 10 7.5 14 7.5 C18 7.5 20.5 12 20.5 19.5 L23 22 H5 L7.5 19.5 Z" fill="#FFD966" stroke="#7B3E02" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="14" cy="23.5" r="2.4" fill="#FFF7E6"/>
      </svg>
    `;
  }
  return `
    <svg class="wst7-btn-glyph-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="11.5" fill="#0D2238" stroke="#FFD966" stroke-width="2.4"/>
      <path d="M14 14 L14 2.5 A11.5 11.5 0 0 1 24 8.2 Z" fill="#FFD966"/>
      <path d="M14 14 L24 8.2 A11.5 11.5 0 0 1 24 19.8 Z" fill="#E63B7A"/>
      <path d="M14 14 L24 19.8 A11.5 11.5 0 0 1 14 25.5 Z" fill="#19BFD0"/>
      <path d="M14 14 L14 25.5 A11.5 11.5 0 0 1 4 19.8 Z" fill="#2ECC71"/>
      <path d="M14 14 L4 19.8 A11.5 11.5 0 0 1 4 8.2 Z" fill="#1E56C5"/>
      <circle cx="14" cy="14" r="3.6" fill="#FFF7E6" stroke="#0D2238" stroke-width="1.2"/>
    </svg>
  `;
}

function buildSecretSquareDoubleCrestSvg(): string {
  // Morton Goldsholl / Saul Bass 1966 Atomic Orbit & Brushed-Brass 2X Sunburst Medallion
  return `
    <svg class="wst7-secret-crest-svg" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="wst7SecBrass" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFFBE0"/>
          <stop offset="48%" stop-color="#FFD966"/>
          <stop offset="100%" stop-color="#B06B06"/>
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="60" rx="54" ry="20" transform="rotate(-28 60 60)" stroke="#19BFD0" stroke-width="2.5" stroke-opacity="0.88"/>
      <ellipse cx="60" cy="60" rx="54" ry="20" transform="rotate(28 60 60)" stroke="#FFD966" stroke-width="2.5" stroke-opacity="0.88"/>
      <circle cx="16" cy="36" r="4" fill="#FFD966"/>
      <circle cx="104" cy="84" r="4" fill="#19BFD0"/>
      <path d="M60 12 L68 34 L91 27 L80 48 L104 60 L80 72 L91 93 L68 86 L60 108 L52 86 L29 93 L40 72 L16 60 L40 48 L29 27 L52 34 Z" fill="url(#wst7SecBrass)" stroke="#071321" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="60" cy="60" r="27" fill="#0B1D30" stroke="#FFF7E6" stroke-width="3"/>
      <circle cx="60" cy="60" r="21" stroke="#F4A91F" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="60" y="68" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="25" fill="#FFD966">2×</text>
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
        apronPrimary.textContent = formatOrphanProof(chosenCard.fullHeadline);
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
            <div class="wst7-drape-panel wst7-drape-left">
              <span class="wst7-drape-tassel wst7-tassel-left"></span>
            </div>
            <div class="wst7-drape-panel wst7-drape-right">
              <span class="wst7-drape-tassel wst7-tassel-right"></span>
            </div>
          </div>
          <div class="wst7-curtain-uplight-wash" aria-hidden="true"></div>
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

      const footlightsWrap = document.createElement('div');
      footlightsWrap.innerHTML = buildCurtainFootlightBarHtml(9);
      const footlightBar = footlightsWrap.firstElementChild as HTMLElement;

      deck.append(trio, footlightBar, apron);
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
        <div class="wst7-kicker-ribbon">LIVE PRIZE SPOTLIGHT</div>
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
          <span class="wst7-hangtag-grommet" aria-hidden="true"></span>
          <span class="wst7-retail-strike">RETAIL $${retailValue.toLocaleString()}</span>
          <span class="wst7-bargain-price">NOW $${costCash.toLocaleString()}!</span>
        </div>
      `;

      const cuePlaque = document.createElement('article');
      cuePlaque.className = 'wst7-relic-cue-plaque';

      const cornice = document.createElement('div');
      cornice.className = 'wst7-plaque-brass-cornice';
      cornice.setAttribute('aria-hidden', 'true');

      const nameEl = document.createElement('h3');
      nameEl.className = 'wst7-relic-name';
      nameEl.textContent = formatOrphanProof(spec.relicName);

      const plainTradeRule = document.createElement('div');
      plainTradeRule.className = 'wst7-bargain-plain-rule';
      plainTradeRule.textContent = `SPEND $${costCash.toLocaleString()} SCORE · KEEP ALL SHOW`;

      const plainPerkCopy = spec.relicPerk
        .replace(
          /whenever\s+Backstage\s+Cash\s+is\s+\$0\s*\(\+?0\.50×\s+in\s+Clean-Air\s+Season\)/gi,
          'while playing a spotless clean broadcast (+0.50× on full clean-play streaks)',
        )
        .replace(/when\s+Backstage\s+Cash\s+is\s+\$0\s*\(\+?0\.50×\s+in\s+Clean-Air\s+Season\)/gi, 'while playing a spotless clean broadcast (+0.50× on full clean-play streaks)')
        .replace(/in\s+Clean-Air\s+Season/gi, 'during clean-play broadcasts')
        .replace(/Backstage\s+Cash/gi, 'secret bribe cash')
        .replace(/—\s*certified\s+clean-air\s+bonus!?/gi, '!');

      const perkEl = document.createElement('p');
      perkEl.className = 'wst7-relic-perk';
      perkEl.textContent = formatOrphanProof(plainPerkCopy);

      cuePlaque.append(cornice, nameEl, plainTradeRule, perkEl);

      const platter = document.createElement('div');
      platter.className = 'wst7-turntable-platter';
      platter.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < 11; i += 1) {
        const bulb = document.createElement('span');
        bulb.className = `wst7-platter-bulb wst7-bulb-dot wst7-c${i % 3}`;
        platter.appendChild(bulb);
      }

      const pedestal = document.createElement('div');
      pedestal.className = 'wst7-turntable-pedestal';
      pedestal.setAttribute('aria-hidden', 'true');

      const floorReflect = document.createElement('div');
      floorReflect.className = 'wst7-platter-floor-reflection';
      floorReflect.setAttribute('aria-hidden', 'true');

      const soldStamp = document.createElement('div');
      soldStamp.className = 'wst7-sold-stamp';
      soldStamp.textContent = 'SOLD!';

      showcase.append(raysWrap, crestRow, cuePlaque, platter, pedestal, floorReflect, soldStamp);

      const sideCol = document.createElement('div');
      sideCol.className = 'wst7-bargain-side-col';

      const mathStrip = document.createElement('div');
      mathStrip.className = 'wst7-score-math-strip';
      mathStrip.innerHTML = canAfford
        ? `
            <span class="wst7-math-item"><span class="wst7-math-lbl-long">YOUR </span>SCORE <strong>$${playerCash.toLocaleString()}</strong></span>
            <span class="wst7-math-arrow" aria-hidden="true">▸</span>
            <span class="wst7-math-item">AFTER<span class="wst7-math-lbl-long"> BUY</span> <strong>$${afterCash.toLocaleString()}</strong></span>
          `
        : `
            <span class="wst7-math-item"><span class="wst7-math-lbl-long">YOUR </span>SCORE <strong>$${playerCash.toLocaleString()}</strong></span>
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
      buyBtn.innerHTML = canAfford
        ? `${buildButtonGlyphSvg('BELL')}<span>BUY FOR $${costCash.toLocaleString()}</span>`
        : `<span>NEED $${costCash.toLocaleString()} TO BUY</span>`;

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
      overlay.tabIndex = -1;
      overlay.focus({ preventScroll: true });
    });
  }

  // --------------------------------------------------------------------------
  // 3. 1.1s Kinetic 1966 Starburst Secret Square / Daily Double Splash
  // --------------------------------------------------------------------------

  public flashSecretSquareBanner(
    headline = 'SECRET SQUARE · DOUBLE DOLLARS!',
  ): Promise<void> {
    this.cancelActive();
    this.callbacks.onSecretSquareSfx?.();

    const strippedHeadline = headline.replace(/^\s*★+\s*|\s*★+\s*$/g, '').trim();
    const rawHeadline =
      strippedHeadline.length > 0 ? strippedHeadline : 'SECRET SQUARE · DOUBLE DOLLARS!';
    const headlineLines = rawHeadline
      .split(/\s*·\s*/)
      .map((part) => formatOrphanProof(part.trim()))
      .filter((part) => part.length > 0);

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

      const raysCounter = document.createElement('div');
      raysCounter.className = 'wst7-secret-rays-counter';
      raysCounter.innerHTML = buildLivingColorStarburstSvg(12);

      const crest = document.createElement('div');
      crest.className = 'wst7-secret-crest-wrap';
      crest.innerHTML = buildSecretSquareDoubleCrestSvg();

      const crownBulbs = document.createElement('div');
      crownBulbs.className = 'wst7-secret-bulbs-wrap';
      crownBulbs.innerHTML = buildMarqueeCrownBulbsSvg();

      const kicker = document.createElement('div');
      kicker.className = 'wst7-secret-kicker';
      kicker.textContent = 'LIVE STUDIO DAILY DOUBLE';

      const h2 = document.createElement('h2');
      h2.className = 'wst7-secret-headline';
      if (headlineLines.length > 1) {
        for (const line of headlineLines) {
          const lineEl = document.createElement('span');
          lineEl.className = 'wst7-secret-line';
          lineEl.textContent = line;
          h2.appendChild(lineEl);
        }
      } else {
        h2.textContent = headlineLines[0] ?? 'SECRET SQUARE!';
      }

      const pill = document.createElement('div');
      pill.className = 'wst7-secret-pill';
      pill.textContent = '2× DOUBLE DOLLARS IN PLAY!';

      sculpture.append(rays, raysCounter, crest, crownBulbs, kicker, h2, pill);
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

  // --------------------------------------------------------------------------
  // 4. Flick-to-Spin 20-Wedge 1966 Living Color Studio Big Wheel
  // --------------------------------------------------------------------------

  public playBigWheelSpin(opts?: BigWheelSpinOptionsV7): Promise<BigWheelSpinResultV7> {
    this.cancelActive();
    const rng = createSeededRng(opts?.seed);
    const isAutoCpu = Boolean(opts?.autoCpuName && opts.autoCpuName.trim().length > 0);
    const cpuDisplayName = opts?.autoCpuName?.trim() || 'CHAMPION';

    return new Promise<BigWheelSpinResultV7>((resolve) => {
      let wheelAngleDeg = rng() * 360;
      let angularVelDeg = 0;
      let flapperAngleDeg = 0;
      let flapperVelDeg = 0;
      let lastPegBucket = Math.floor((wheelAngleDeg + 9) / 18);

      let phase: 'IDLE' | 'DRAGGING' | 'SPINNING' | 'LANDED' = 'IDLE';
      let finished = false;
      let canTapAdvance = false;
      let landedWedge: BigWheelWedgeSpecV7 | null = null;
      let rafId: number | null = null;
      let lastFrameTs = 0;
      const timers: number[] = [];

      // Drag / flick gesture telemetry
      let activePointerId: number | null = null;
      let lastDragAngleDeg = 0;
      let totalDragDeg = 0;
      const velSamples: Array<{ ts: number; deltaDeg: number }> = [];

      const overlay = document.createElement('section');
      overlay.className = 'wst7-stage-overlay wst7-wheel-backdrop';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute(
        'aria-label',
        isAutoCpu
          ? `${cpuDisplayName} spins the 1966 Studio Big Wheel`
          : '1966 Studio Big Wheel: Drag and flick the wheel or tap Spin',
      );

      const stage = document.createElement('div');
      stage.className = 'wst7-wheel-stage';
      stage.dataset.phase = 'idle';

      const header = document.createElement('header');
      header.className = 'wst7-wheel-header';
      header.innerHTML = `
        ${buildMarqueeCrownBulbsSvg()}
        <div class="wst7-kicker-ribbon">${
          isAutoCpu
            ? `${cpuDisplayName.toUpperCase()} AT THE WHEEL`
            : '1966 STUDIO BIG WHEEL'
        }</div>
        <h2 class="wst7-wheel-headline">${
          isAutoCpu ? `${cpuDisplayName.toUpperCase()} SPINS!` : 'SPIN THE BIG WHEEL!'
        }</h2>
      `;

      // Interactive 20-Wedge Studio Wheel Assembly
      const wheelArena = document.createElement('div');
      wheelArena.className = 'wst7-wheel-arena';

      const wheelCabinet = document.createElement('div');
      wheelCabinet.className = 'wst7-wheel-cabinet';
      wheelCabinet.setAttribute('aria-label', '20-Wedge 1966 Big Wheel — drag to flick');
      wheelCabinet.innerHTML = `
        ${buildBigWheelOuterBezelSvg()}
        <div class="wst7-wheel-rotor">${buildBigWheelDiscSvg()}</div>
        <div class="wst7-wheel-flapper">${buildBrassFlapperSvg()}</div>
        <div class="wst7-wheel-flick-hint" aria-hidden="true">↻ FLICK TO SPIN</div>
      `;

      const rotorEl = wheelCabinet.querySelector<HTMLElement>('.wst7-wheel-rotor')!;
      const flapperEl = wheelCabinet.querySelector<HTMLElement>('.wst7-wheel-flapper')!;
      const flickHintEl = wheelCabinet.querySelector<HTMLElement>('.wst7-wheel-flick-hint')!;
      if (isAutoCpu) {
        flickHintEl.style.display = 'none';
      }

      wheelArena.appendChild(wheelCabinet);

      // Right / Bottom Broadcast Console: Live Pointer Readout + Spin Button + Footlights
      const controlCol = document.createElement('div');
      controlCol.className = 'wst7-wheel-controls';

      const readoutPill = document.createElement('div');
      readoutPill.className = 'wst7-wheel-readout';
      readoutPill.dataset.kind = getWedgeAtWheelAngle(wheelAngleDeg).kind;
      readoutPill.setAttribute('aria-live', 'polite');
      for (const corner of ['tl', 'tr', 'bl', 'br']) {
        const rivet = document.createElement('span');
        rivet.className = `wst7-cabinet-rivet wst7-rivet-${corner}`;
        rivet.setAttribute('aria-hidden', 'true');
        readoutPill.appendChild(rivet);
      }

      const readoutKicker = document.createElement('span');
      readoutKicker.className = 'wst7-wheel-readout-kicker';
      readoutKicker.textContent = isAutoCpu ? 'LIVE POINTER FEED' : 'UNDER THE POINTER';

      const readoutValue = document.createElement('span');
      readoutValue.className = 'wst7-wheel-readout-val';
      readoutValue.textContent = getWedgeAtWheelAngle(wheelAngleDeg).wedgeLabel;

      readoutPill.append(readoutKicker, readoutValue);

      const spinBtn = document.createElement('button');
      spinBtn.type = 'button';
      spinBtn.className = 'wst7-action-btn wst7-btn-wheel-spin';
      spinBtn.dataset.action = 'spin-big-wheel';
      spinBtn.innerHTML = isAutoCpu
        ? `${buildButtonGlyphSvg('WHEEL')}<span>${cpuDisplayName.toUpperCase()} AT THE WHEEL</span>`
        : `${buildButtonGlyphSvg('WHEEL')}<span>SPIN BIG WHEEL!</span>`;
      if (isAutoCpu) {
        spinBtn.disabled = true;
      }

      const subNote = document.createElement('div');
      subNote.className = 'wst7-wheel-subnote';
      subNote.textContent = isAutoCpu
        ? 'TAP ANYWHERE ONCE LANDED TO CONTINUE'
        : 'DRAG & FLICK THE WHEEL WITH YOUR FINGER OR TAP SPIN!';

      controlCol.append(readoutPill, spinBtn, subNote);
      stage.append(header, wheelArena, controlCol);
      overlay.appendChild(stage);

      const emitPegTick = (speed01: number): void => {
        const clamped = Math.max(0.08, Math.min(1, speed01));
        if (opts?.onPegTick) {
          opts.onPegTick(clamped);
        } else {
          this.callbacks.onWheelPegTickSfx?.(clamped);
        }
      };

      const renderWheelTransforms = (): void => {
        rotorEl.style.transform = `rotate(${wheelAngleDeg.toFixed(2)}deg)`;
        flapperEl.style.transform = `translateX(-50%) rotate(${flapperAngleDeg.toFixed(2)}deg)`;
        const currentWedge = getWedgeAtWheelAngle(wheelAngleDeg);
        if (readoutValue.textContent !== currentWedge.wedgeLabel && phase !== 'LANDED') {
          readoutValue.textContent = currentWedge.wedgeLabel;
          readoutPill.dataset.kind = currentWedge.kind;
        }
      };

      const checkPegCrossing = (speedForTick: number, spinSign: number): void => {
        const nextBucket = Math.floor((wheelAngleDeg + 9) / 18);
        if (nextBucket !== lastPegBucket) {
          lastPegBucket = nextBucket;
          const speed01 = Math.min(1, Math.abs(speedForTick) / 1100);
          emitPegTick(speed01);
          // Physical direction: CW wheel (+vel) kicks flapper bottom tip RIGHT (-deg)!
          const dir = spinSign >= 0 ? -1 : 1;
          const kickMag = 24 + speed01 * 22;
          flapperAngleDeg = dir * kickMag;
          flapperVelDeg = dir * (160 + speed01 * 180);
        }
      };

      const buildResult = (w: BigWheelWedgeSpecV7): BigWheelSpinResultV7 => ({
        wedgeLabel: w.wedgeLabel,
        kind: w.kind,
        cashValue: w.cashValue,
        multBonus: w.multBonus,
      });

      const cleanupListeners = (): void => {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
        for (const t of timers) window.clearTimeout(t);
        timers.length = 0;
        wheelCabinet.removeEventListener('pointerdown', onWheelPointerDown);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        overlay.removeEventListener('pointerdown', onTapAdvance);
      };

      const finishWith = (w: BigWheelWedgeSpecV7): void => {
        if (finished) return;
        finished = true;
        cleanupListeners();
        this.activeCleanup = null;
        this.rootEl.innerHTML = '';
        this.rootEl.classList.add('wst7-hidden');
        resolve(buildResult(w));
      };

      const handleLanded = (): void => {
        if (phase === 'LANDED' || finished) return;
        phase = 'LANDED';
        angularVelDeg = 0;

        // Subtle anti-boundary settle if perched right on top of a nickel peg
        const mod18 = ((((wheelAngleDeg + 9) % 18) + 18) % 18);
        if (mod18 < 1.4) {
          wheelAngleDeg += 1.8;
        } else if (mod18 > 16.6) {
          wheelAngleDeg -= 1.8;
        }

        const winner = getWedgeAtWheelAngle(wheelAngleDeg);
        landedWedge = winner;
        stage.dataset.phase = 'landed';
        stage.dataset.landKind = winner.kind;
        readoutPill.dataset.kind = winner.kind;

        // Highlight landed wedge inside SVG
        const allWedgeEls = rotorEl.querySelectorAll<SVGGElement>('.wst7-wheel-wedge');
        allWedgeEls.forEach((el) => {
          el.dataset.landed = el.dataset.wedgeIdx === String(winner.index) ? 'true' : 'false';
        });

        readoutKicker.textContent =
          winner.kind === 'GREMLIN'
            ? '👾 STUDIO GREMLIN STING!'
            : isAutoCpu
              ? `★ ${cpuDisplayName.toUpperCase()} LANDED ON ★`
              : '★ YOU LANDED ON ★';
        readoutValue.textContent = winner.wedgeLabel;
        spinBtn.disabled = true;
        spinBtn.textContent =
          winner.kind === 'GREMLIN'
            ? '👾 GREMLIN (-25% STING)!'
            : `★ ${winner.wedgeLabel} ★`;
        subNote.textContent = 'TAP ANYWHERE TO CONTINUE';

        if (winner.kind === 'GREMLIN') {
          this.callbacks.onGremlinZonkSfx?.();
        } else {
          this.callbacks.onWheelWinSfx?.(buildResult(winner));
        }

        timers.push(
          window.setTimeout(() => {
            canTapAdvance = true;
          }, 220),
        );

        const holdMs = isAutoCpu
          ? this.reducedMotion
            ? 320
            : 520
          : this.reducedMotion
            ? 650
            : 1050;
        timers.push(
          window.setTimeout(() => {
            overlay.dataset.exiting = 'true';
            timers.push(window.setTimeout(() => finishWith(winner), 160));
          }, holdMs),
        );
      };

      const stepPhysics = (ts: number): void => {
        if (finished) return;
        const dt = lastFrameTs > 0 ? Math.min(0.05, Math.max(0.004, (ts - lastFrameTs) / 1000)) : 1 / 60;
        lastFrameTs = ts;

        if (phase === 'SPINNING') {
          const prevSign = angularVelDeg >= 0 ? 1 : -1;
          wheelAngleDeg += angularVelDeg * dt;
          checkPegCrossing(angularVelDeg, prevSign);

          // Authentic bearing drag + dramatic peg slowdown crawl near stop
          const speed = Math.abs(angularVelDeg);
          const baseFriction = isAutoCpu ? 2.45 : this.reducedMotion ? 2.8 : 1.28;
          const lowSpeedDrag = speed < 150 ? 1.55 : 1.0;
          angularVelDeg *= Math.exp(-baseFriction * lowSpeedDrag * dt);

          // Tiny dry Coulomb bearing friction so the wheel comes to a crisp authentic stop
          const coulomb = (isAutoCpu ? 38 : 16) * dt;
          if (Math.abs(angularVelDeg) <= coulomb + 14) {
            angularVelDeg = 0;
          } else {
            angularVelDeg -= Math.sign(angularVelDeg) * coulomb;
          }

          if (Math.abs(angularVelDeg) < 16) {
            handleLanded();
          }
        }

        // Critically-underdamped brass spring flapper physics!
        const springK = 540;
        const springDamp = 17.5;
        const flapAcc = -springK * flapperAngleDeg - springDamp * flapperVelDeg;
        flapperVelDeg += flapAcc * dt;
        flapperAngleDeg += flapperVelDeg * dt;
        if (Math.abs(flapperAngleDeg) < 0.08 && Math.abs(flapperVelDeg) < 0.8) {
          flapperAngleDeg = 0;
          flapperVelDeg = 0;
        }

        renderWheelTransforms();

        if (phase === 'SPINNING' || phase === 'DRAGGING' || Math.abs(flapperAngleDeg) > 0.1) {
          rafId = window.requestAnimationFrame(stepPhysics);
        } else {
          rafId = null;
        }
      };

      const ensureLoop = (): void => {
        if (rafId === null && !finished) {
          lastFrameTs = performance.now();
          rafId = window.requestAnimationFrame(stepPhysics);
        }
      };

      const launchSpin = (initialVelDegPerSec: number): void => {
        if (phase === 'SPINNING' || phase === 'LANDED' || finished) return;
        phase = 'SPINNING';
        stage.dataset.phase = 'spinning';
        flickHintEl.style.opacity = '0';
        spinBtn.disabled = true;
        spinBtn.textContent = isAutoCpu
          ? `🎡 ${cpuDisplayName.toUpperCase()} SPINNING LIVE`
          : '🎡 WHEEL IN MOTION — GOOD LUCK!';
        subNote.textContent = isAutoCpu
          ? 'HOLD ON TO YOUR HAT!'
          : 'WATCH THAT BRASS FLAPPER!';
        angularVelDeg = initialVelDegPerSec;
        ensureLoop();
      };

      const getPointerAngleFromCenter = (clientX: number, clientY: number): number => {
        const rect = wheelCabinet.getBoundingClientRect();
        const cx = rect.left + rect.width * 0.5;
        const cy = rect.top + rect.height * 0.5;
        return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
      };

      const normalizeDeltaDeg = (delta: number): number => {
        let d = delta;
        while (d > 180) d -= 360;
        while (d < -180) d += 360;
        return d;
      };

      const onWheelPointerDown = (ev: PointerEvent): void => {
        if (isAutoCpu || phase !== 'IDLE' || finished) return;
        ev.preventDefault();
        ev.stopPropagation();
        this.callbacks.onUiTapSfx?.();
        activePointerId = ev.pointerId;
        phase = 'DRAGGING';
        stage.dataset.phase = 'dragging';
        lastDragAngleDeg = getPointerAngleFromCenter(ev.clientX, ev.clientY);
        totalDragDeg = 0;
        velSamples.length = 0;
        if (typeof wheelCabinet.setPointerCapture === 'function') {
          try {
            wheelCabinet.setPointerCapture(ev.pointerId);
          } catch {
            // Ignore synthetic test events without active pointer capture
          }
        }
        ensureLoop();
      };

      const onPointerMove = (ev: PointerEvent): void => {
        if (phase !== 'DRAGGING' || ev.pointerId !== activePointerId) return;
        const nextAngle = getPointerAngleFromCenter(ev.clientX, ev.clientY);
        const delta = normalizeDeltaDeg(nextAngle - lastDragAngleDeg);
        lastDragAngleDeg = nextAngle;
        wheelAngleDeg += delta;
        totalDragDeg += Math.abs(delta);
        const now = performance.now();
        velSamples.push({ ts: now, deltaDeg: delta });
        while (velSamples.length > 0 && now - velSamples[0].ts > 120) {
          velSamples.shift();
        }
        checkPegCrossing(delta * 45, delta >= 0 ? 1 : -1);
        renderWheelTransforms();
      };

      const onPointerUp = (ev: PointerEvent): void => {
        if (phase !== 'DRAGGING' || ev.pointerId !== activePointerId) return;
        activePointerId = null;
        const now = performance.now();
        let sumDelta = 0;
        let oldestTs = now;
        for (const s of velSamples) {
          if (now - s.ts <= 130) {
            sumDelta += s.deltaDeg;
            if (s.ts < oldestTs) oldestTs = s.ts;
          }
        }
        const spanSec = Math.max(0.024, (now - oldestTs) / 1000);
        const measuredVel = sumDelta / spanSec;

        if (Math.abs(measuredVel) >= 120 || totalDragDeg >= 16) {
          const dir = measuredVel !== 0 ? Math.sign(measuredVel) : 1;
          const clampedSpeed = Math.max(760, Math.min(1640, Math.abs(measuredVel) * 1.15 + 420));
          launchSpin(dir * clampedSpeed);
        } else {
          // Quick direct tap on the wheel launches a hearty clockwise spin!
          launchSpin(980 + rng() * 340);
        }
      };

      const onTapAdvance = (): void => {
        if (phase === 'LANDED' && canTapAdvance && landedWedge) {
          finishWith(landedWedge);
        }
      };

      const onKeyDown = (ev: KeyboardEvent): void => {
        if (phase === 'IDLE' && !isAutoCpu && (ev.key === ' ' || ev.key === 'Enter')) {
          ev.preventDefault();
          this.callbacks.onUiTapSfx?.();
          launchSpin(1040 + rng() * 380);
        } else if (phase === 'LANDED' && canTapAdvance && landedWedge) {
          if (ev.key === ' ' || ev.key === 'Enter' || ev.key === 'Escape') {
            ev.preventDefault();
            finishWith(landedWedge);
          }
        }
      };

      spinBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (isAutoCpu || phase !== 'IDLE') return;
        this.callbacks.onUiTapSfx?.();
        launchSpin(1060 + rng() * 420);
      });

      wheelCabinet.addEventListener('pointerdown', onWheelPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
      overlay.addEventListener('pointerdown', onTapAdvance);
      window.addEventListener('keydown', onKeyDown);

      this.activeCleanup = () => {
        finished = true;
        cleanupListeners();
        resolve(buildResult(landedWedge ?? getWedgeAtWheelAngle(wheelAngleDeg)));
      };

      this.rootEl.innerHTML = '';
      this.rootEl.appendChild(overlay);
      this.rootEl.classList.remove('wst7-hidden');
      renderWheelTransforms();

      if (isAutoCpu) {
        // Brisk ~1.5s watchable CPU wheel spin!
        timers.push(
          window.setTimeout(() => {
            launchSpin(1240 + rng() * 420);
          }, this.reducedMotion ? 80 : 180),
        );
      } else {
        overlay.tabIndex = -1;
        overlay.focus({ preventScroll: true });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. Press-Your-Luck Bouncing Light-Board + 8 Hanna-Barbera Gremlin Skits
  // --------------------------------------------------------------------------

  /**
   * Plays one of the 8 animated Hanna-Barbera / UPA Studio Gremlin skits as a
   * standalone theater overlay (e.g., when a Big Wheel spin lands on a GREMLIN wedge!).
   */
  public playStandaloneGremlinSkit(
    input: GremlinSkitPlayInputV8,
  ): Promise<GremlinSkitIdV8> {
    this.cancelActive();
    this.rootEl.innerHTML = '';
    this.rootEl.classList.remove('wst7-hidden');

    return new Promise<GremlinSkitIdV8>((resolve) => {
      let settled = false;
      this.activeCleanup = () => {
        if (settled) return;
        settled = true;
        this.rootEl.innerHTML = '';
        this.rootEl.classList.add('wst7-hidden');
        resolve(input.skitId ?? 'REEL_MOWER');
      };

      void playGremlinCartoonSkitV8(this.rootEl, {
        ...input,
        reducedMotion: input.reducedMotion ?? this.reducedMotion,
        onPlayFoghorn: input.onPlayFoghorn ?? (() => this.callbacks.onGremlinZonkSfx?.()),
        onPlayBoing: input.onPlayBoing ?? (() => this.callbacks.onGremlinBoingSfx?.()),
        onPlayVoiceSting:
          input.onPlayVoiceSting ?? ((skitId) => this.callbacks.onGremlinVoiceSting?.(skitId)),
      }).then((playedId) => {
        if (settled) return;
        settled = true;
        this.activeCleanup = null;
        this.rootEl.innerHTML = '';
        this.rootEl.classList.add('wst7-hidden');
        resolve(playedId);
      });
    });
  }

  public playPressYourLuckGremlinBoard(
    opts: PressYourLuckGremlinOptionsV7,
  ): Promise<PressYourLuckGremlinResultV7> {
    this.cancelActive();
    const rng = createSeededRng(opts.seed);
    const isAutoCpu = Boolean(opts.autoCpuMode);
    const rivalFullName = opts.rivalName?.trim() || 'Champion';
    const rivalShortName = rivalFullName.split(/\s+/)[0]?.toUpperCase() || 'CHAMP';
    const hasExplicitRivalCash =
      typeof opts.rivalCash === 'number' && Number.isFinite(opts.rivalCash);

    return new Promise<PressYourLuckGremlinResultV7>((resolve) => {
      let spinsRemaining = Math.max(1, Math.min(6, Math.floor(opts.spinsEarned || 1)));
      let extraSpinsAwarded = 0;
      let spinsTaken = 0;
      let liveCash = Math.max(0, Math.round(opts.playerCash || 0));
      let liveRivalCash = hasExplicitRivalCash ? Math.max(0, Math.round(opts.rivalCash!)) : Infinity;
      let netCashDelta = 0;
      let rivalCashDelta = 0;
      let passedSpinsToRival = 0;
      let hitGremlin = false;
      let skitPlayed: GremlinSkitIdV8 | undefined;
      let updatedGremlinCount: number | undefined = opts.gremlinCount;
      let finalHeadline = 'LIGHT-BOARD BONANZA COMPLETE!';

      const isBoardHotNow = (): boolean => Boolean(opts.initialHotBoard || spinsTaken >= 1);

      let cursorIndex = Math.floor(rng() * 12);
      let state: 'BOUNCING' | 'RESULT_HOLD' | 'GREMLIN_ZONK' | 'DONE' = 'BOUNCING';
      let finished = false;
      let canSkipEnd = false;
      let bounceTimerId: number | null = null;
      const timers: number[] = [];

      const overlay = document.createElement('section');
      overlay.className = 'wst7-stage-overlay wst7-gremlin-backdrop';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute(
        'aria-label',
        isAutoCpu
          ? `${rivalFullName} plays the Studio 6A Light-Board Bonanza`
          : 'Studio 6A Light-Board Bonanza: Hit Stop for Cash or Dodge the Studio Gremlin',
      );

      const stage = document.createElement('div');
      stage.className = 'wst7-gremlin-stage';
      stage.dataset.state = 'bouncing';
      stage.dataset.hotBoard = isBoardHotNow() ? 'true' : 'false';

      const header = document.createElement('header');
      header.className = 'wst7-gremlin-header';
      header.innerHTML = `
        ${buildMarqueeCrownBulbsSvg()}
        <div class="wst7-kicker-ribbon">${
          isAutoCpu
            ? `${rivalFullName.toUpperCase()} ON THE BOARD`
            : 'STUDIO 6A LIGHT-BOARD BONANZA'
        }</div>
        <h2 class="wst7-gremlin-headline">${
          isAutoCpu ? 'WATCH THE CHAMP SWEAT!' : 'BIG BUCKS — NO GREMLINS!'
        }</h2>
        <div class="wst7-pyl-heat-pill" data-hot="${isBoardHotNow() ? 'true' : 'false'}">
          ${isBoardHotNow() ? '🔥 GREMLIN HEAT: 4/12 ON BOARD!' : '⚡ GREMLIN WATCH: 3/12 ON BOARD'}
        </div>
      `;
      const heatPillEl = header.querySelector<HTMLElement>('.wst7-pyl-heat-pill')!;

      // 4x4 Perimeter Light-Board with Center 2x2 Studio Monitor Well
      const boardFrame = document.createElement('div');
      boardFrame.className = 'wst7-gremlin-board-frame';
      for (const corner of ['tl', 'tr', 'bl', 'br']) {
        const rivet = document.createElement('span');
        rivet.className = `wst7-cabinet-rivet wst7-rivet-${corner}`;
        rivet.setAttribute('aria-hidden', 'true');
        boardFrame.appendChild(rivet);
      }

      const renderSquareCellContent = (cell: HTMLDivElement, sq: GremlinBoardSquareSpecV7): void => {
        cell.dataset.tone = sq.tone;
        cell.dataset.kind = sq.kind;
        if (sq.kind === 'GREMLIN') {
          cell.innerHTML = `
            ${buildMiniGremlinBadgeSvg()}
            <span class="wst7-pyl-sq-main">${sq.mainLabel}</span>
            <span class="wst7-pyl-sq-sub">${sq.subLabel}</span>
          `;
        } else {
          cell.innerHTML = `
            <span class="wst7-pyl-sq-main">${sq.mainLabel}</span>
            <span class="wst7-pyl-sq-sub">${sq.subLabel}</span>
          `;
        }
      };

      const squareEls: HTMLDivElement[] = [];
      for (const sq of getActiveGremlinBoardSquaresV8(isBoardHotNow())) {
        const cell = document.createElement('div');
        cell.className = 'wst7-pyl-square';
        cell.dataset.sqIndex = String(sq.index);
        cell.dataset.lit = sq.index === cursorIndex ? 'true' : 'false';
        cell.style.gridColumn = String(sq.gridCol);
        cell.style.gridRow = String(sq.gridRow);
        renderSquareCellContent(cell, sq);
        squareEls.push(cell);
        boardFrame.appendChild(cell);
      }

      const syncBoardHeatVisuals = (): void => {
        const hot = isBoardHotNow();
        stage.dataset.hotBoard = hot ? 'true' : 'false';
        heatPillEl.dataset.hot = hot ? 'true' : 'false';
        heatPillEl.textContent = hot
          ? '🔥 GREMLIN HEAT: 4/12 ON BOARD!'
          : '⚡ GREMLIN WATCH: 3/12 ON BOARD';
        const activeSquares = getActiveGremlinBoardSquaresV8(hot);
        const hotCell = squareEls[HOT_GREMLIN_SQUARE_INDEX_V8];
        const hotSpec = activeSquares[HOT_GREMLIN_SQUARE_INDEX_V8];
        if (hotCell && hotSpec && hotCell.dataset.tone !== hotSpec.tone) {
          renderSquareCellContent(hotCell, hotSpec);
        }
      };

      // Center 2x2 Monitor Well: Live Bankroll + Spins Counter OR Cartoon Gremlin Stand-By Feed!
      const centerWell = document.createElement('div');
      centerWell.className = 'wst7-pyl-center-well';
      centerWell.dataset.mode = 'live';
      centerWell.setAttribute('aria-live', 'polite');

      const liveMonitor = document.createElement('div');
      liveMonitor.className = 'wst7-pyl-live-monitor';
      liveMonitor.innerHTML = `
        <div class="wst7-pyl-spins-pill">
          <span class="wst7-pyl-spins-lbl">SPINS</span>
          <strong class="wst7-pyl-spins-num">${spinsRemaining}</strong>
        </div>
        <div class="wst7-pyl-cash-readout">
          <span class="wst7-pyl-cash-lbl">${isAutoCpu ? `${rivalShortName} BANK` : 'LIVE SCORE'}</span>
          <strong class="wst7-pyl-cash-val">$${liveCash.toLocaleString()}</strong>
        </div>
        <div class="wst7-pyl-status-line">HIT STOP TO LOCK PRIZE!</div>
      `;

      const gremlinTvMonitor = document.createElement('div');
      gremlinTvMonitor.className = 'wst7-pyl-gremlin-monitor';
      gremlinTvMonitor.innerHTML = `
        ${buildBroadcastMonoscopeZonkSvg()}
        <div class="wst7-gremlin-standby-bar">
          <span class="wst7-gremlin-standby-kicker">
            <span class="wst7-jam-lamp" aria-hidden="true"></span>
            <span>PLEASE STAND BY</span>
            <span class="wst7-jam-lamp" aria-hidden="true"></span>
          </span>
          <span class="wst7-standby-extra">TECHNICAL DIFFICULTIES</span>
          <strong class="wst7-gremlin-standby-zap">SIGNAL JAMMED · -40% ZONK!</strong>
        </div>
      `;

      centerWell.append(liveMonitor, gremlinTvMonitor);
      boardFrame.appendChild(centerWell);

      const spinsNumEl = liveMonitor.querySelector<HTMLElement>('.wst7-pyl-spins-num')!;
      const cashValEl = liveMonitor.querySelector<HTMLElement>('.wst7-pyl-cash-val')!;
      const statusLineEl = liveMonitor.querySelector<HTMLElement>('.wst7-pyl-status-line')!;
      const zapTextEl = gremlinTvMonitor.querySelector<HTMLElement>('.wst7-gremlin-standby-zap')!;

      // Controls Column: Big Red STOP! Plunger + Tactical PASS SPINS TO CHAMP Button
      const controls = document.createElement('div');
      controls.className = 'wst7-gremlin-controls';

      const stopBtn = document.createElement('button');
      stopBtn.type = 'button';
      stopBtn.className = 'wst7-action-btn wst7-btn-pyl-stop';
      stopBtn.dataset.action = 'pyl-stop';
      stopBtn.innerHTML = isAutoCpu
        ? `${buildButtonGlyphSvg('STOP')}<span>${rivalShortName} ON THE BIG BOARD</span>`
        : `${buildButtonGlyphSvg('STOP')}<span>STOP THE BOARD!</span>`;
      if (isAutoCpu) {
        stopBtn.disabled = true;
      }

      const passBtn = document.createElement('button');
      passBtn.type = 'button';
      passBtn.className = 'wst7-action-btn wst7-btn-pyl-pass';
      passBtn.dataset.action = 'pyl-pass';
      passBtn.textContent = `PASS ${spinsRemaining} SPIN${spinsRemaining === 1 ? '' : 'S'} TO ${rivalShortName} →`;
      if (isAutoCpu) {
        passBtn.style.display = 'none';
      }

      controls.append(stopBtn, passBtn);
      stage.append(header, boardFrame, controls);
      overlay.appendChild(stage);

      const emitBounceTick = (): void => {
        if (opts.onBounceTick) {
          opts.onBounceTick();
        } else {
          this.callbacks.onBounceTickSfx?.();
        }
      };

      const emitGremlinZonk = (): void => {
        if (opts.onGremlinZonk) {
          opts.onGremlinZonk();
        } else {
          this.callbacks.onGremlinZonkSfx?.();
        }
      };

      const computeCurrentEv = (): PressYourLuckSpinEvAnalysisV8 =>
        evaluatePressYourLuckSpinEvV8({
          selfCash: liveCash,
          rivalCash: Number.isFinite(liveRivalCash) ? liveRivalCash : undefined,
          spinsTaken,
          spinsRemaining,
          forceHotBoard: opts.initialHotBoard,
        });

      const syncHud = (statusText?: string): void => {
        syncBoardHeatVisuals();
        spinsNumEl.textContent = String(spinsRemaining);
        cashValEl.textContent = `$${liveCash.toLocaleString()}`;
        if (statusText) {
          statusLineEl.textContent = statusText;
        }
        if (!isAutoCpu) {
          const ev = computeCurrentEv();
          passBtn.disabled = spinsRemaining < 1 || state === 'GREMLIN_ZONK' || state === 'DONE';
          passBtn.dataset.recommended = ev.shouldRecommendPass ? 'true' : 'false';
          if (spinsRemaining >= 1) {
            const recTag = ev.shouldRecommendPass ? '★ RECOMMENDED: ' : '';
            passBtn.textContent = `${recTag}PASS ${spinsRemaining} SPIN${spinsRemaining === 1 ? '' : 'S'} TO ${rivalShortName} →`;
          } else {
            passBtn.textContent = 'NO SPINS LEFT TO PASS';
          }
        }
      };

      const highlightSquare = (idx: number, locked = false): void => {
        squareEls.forEach((el, i) => {
          el.dataset.lit = i === idx ? 'true' : 'false';
          el.dataset.locked = locked && i === idx ? 'true' : 'false';
        });
      };

      const stopBouncing = (): void => {
        if (bounceTimerId !== null) {
          window.clearTimeout(bounceTimerId);
          bounceTimerId = null;
        }
      };

      const scheduleNextBounce = (): void => {
        if (finished || state !== 'BOUNCING') return;
        const intervalMs = isAutoCpu ? 115 : this.reducedMotion ? 220 : Math.max(125, 168 - spinsTaken * 10);
        bounceTimerId = window.setTimeout(() => {
          if (finished || state !== 'BOUNCING') return;
          // Full uniform 1..11 perimeter step jump (100% of non-self offsets reachable!)
          const stepOffset = 1 + Math.floor(rng() * 11);
          cursorIndex = (cursorIndex + stepOffset) % 12;
          highlightSquare(cursorIndex, false);
          emitBounceTick();
          scheduleNextBounce();
        }, intervalMs);
      };

      const buildResult = (): PressYourLuckGremlinResultV7 => ({
        netCashDelta,
        rivalCashDelta,
        passedSpinsToRival,
        hitGremlin,
        headline: finalHeadline,
        ...(skitPlayed ? { skitPlayed } : {}),
        ...(updatedGremlinCount !== undefined ? { gremlinCount: updatedGremlinCount } : {}),
      });

      const cleanupAll = (): void => {
        stopBouncing();
        for (const t of timers) window.clearTimeout(t);
        timers.length = 0;
        window.removeEventListener('keydown', onKeyDown);
        overlay.removeEventListener('pointerdown', onFastFinishTap);
      };

      const finishBoard = (): void => {
        if (finished) return;
        finished = true;
        cleanupAll();
        this.activeCleanup = null;
        this.rootEl.innerHTML = '';
        this.rootEl.classList.add('wst7-hidden');
        resolve(buildResult());
      };

      const queueExit = (holdMs: number): void => {
        state = 'DONE';
        stopBouncing();
        stopBtn.disabled = true;
        passBtn.disabled = true;
        timers.push(
          window.setTimeout(() => {
            canSkipEnd = true;
          }, Math.min(320, holdMs * 0.4)),
        );
        timers.push(
          window.setTimeout(() => {
            overlay.dataset.exiting = 'true';
            timers.push(window.setTimeout(finishBoard, 160));
          }, holdMs),
        );
      };

      const handleStop = (): void => {
        if (state !== 'BOUNCING' || finished) return;
        stopBouncing();
        const activeSquaresForSpin = getActiveGremlinBoardSquaresV8(isBoardHotNow());
        spinsRemaining = Math.max(0, spinsRemaining - 1);
        spinsTaken += 1;

        const sq = activeSquaresForSpin[cursorIndex] ?? activeSquaresForSpin[0];
        highlightSquare(sq.index, true);

        if (sq.kind === 'GREMLIN') {
          state = 'GREMLIN_ZONK';
          stage.dataset.state = 'gremlin-zonk';
          stopBtn.disabled = true;
          passBtn.disabled = true;
          hitGremlin = true;
          const scoreBeforeZap = liveCash;
          const zapLoss = Math.round((liveCash * 0.4) / 25) * 25;
          netCashDelta -= zapLoss;
          liveCash = Math.max(0, liveCash - zapLoss);
          spinsRemaining = 0;
          updatedGremlinCount = Math.min(4, Math.max(1, Math.floor((opts.gremlinCount ?? 0) + 1)));
          finalHeadline =
            zapLoss > 0
              ? `● STUDIO GREMLIN ZONK! -40% (-$${zapLoss.toLocaleString()}) · PLEASE STAND BY!`
              : '● STUDIO GREMLIN ZONK! CABLE CHEWED — $0 LOST!';
          zapTextEl.textContent =
            zapLoss > 0
              ? `-40% ZONK! (-$${zapLoss.toLocaleString()})`
              : 'CABLE CHEWED! ($0 ZAPPED)';
          centerWell.dataset.mode = 'gremlin';
          syncHud(finalHeadline);

          // Launch full Hanna-Barbera / UPA Animated Studio Gremlin Skit!
          void playGremlinCartoonSkitV8(overlay, {
            seed:
              opts.skitSeed ??
              (((opts.seed ?? 1966) + spinsTaken * 131 + cursorIndex * 17) >>> 0),
            victimName: isAutoCpu ? rivalFullName : 'YOU',
            isPlayerVictim: !isAutoCpu,
            scoreBefore: scoreBeforeZap,
            cashLost: zapLoss,
            newGremlinCount: updatedGremlinCount,
            reducedMotion: this.reducedMotion,
            onPlayFoghorn: () => emitGremlinZonk(),
            onPlayBoing: () => (opts.onGremlinBoing ?? this.callbacks.onGremlinBoingSfx)?.(),
            onPlayVoiceSting: (id) =>
              (opts.onGremlinVoiceSting ?? this.callbacks.onGremlinVoiceSting)?.(id),
          }).then((chosenId) => {
            skitPlayed = chosenId;
            if (!finished) {
              overlay.dataset.exiting = 'true';
              timers.push(window.setTimeout(finishBoard, 120));
            }
          });
          return;
        }

        // Landed on a Cash / Jackpot / Extra Spin / Steal Square!
        state = 'RESULT_HOLD';
        stage.dataset.state = 'prize-hit';
        this.callbacks.onUiTapSfx?.();
        let hitCopy = '';
        if (sq.kind === 'STEAL') {
          const swiped = Number.isFinite(liveRivalCash)
            ? Math.min(sq.cashValue, liveRivalCash)
            : sq.cashValue;
          netCashDelta += swiped;
          liveCash += swiped;
          rivalCashDelta -= swiped;
          if (Number.isFinite(liveRivalCash)) {
            liveRivalCash = Math.max(0, liveRivalCash - swiped);
          }
          hitCopy =
            swiped <= 0
              ? '★ RIVAL BROKE ($0 TO STEAL)!'
              : swiped < sq.cashValue
                ? `★ STEAL $${swiped} (RIVAL CAP)!`
                : `★ STEAL $${swiped}!`;
        } else if (sq.kind === 'CASH_SPIN') {
          netCashDelta += sq.cashValue;
          liveCash += sq.cashValue;
          if (extraSpinsAwarded < 3) {
            spinsRemaining += 1;
            extraSpinsAwarded += 1;
            hitCopy = `★ +$${sq.cashValue} + EXTRA SPIN!`;
          } else {
            hitCopy = `★ +$${sq.cashValue} BONUS!`;
          }
        } else if (sq.kind === 'JACKPOT') {
          netCashDelta += sq.cashValue;
          liveCash += sq.cashValue;
          hitCopy = `★ +$${sq.cashValue} JACKPOT!`;
        } else {
          netCashDelta += sq.cashValue;
          liveCash += sq.cashValue;
          hitCopy = `+$${sq.cashValue} BANKED!`;
        }

        finalHeadline =
          netCashDelta >= 0
            ? `★ LIGHT-BOARD HAUL: +$${netCashDelta.toLocaleString()}!`
            : `● LIGHT-BOARD FINISH: -$${Math.abs(netCashDelta).toLocaleString()}`;
        syncHud(hitCopy);

        if (spinsRemaining <= 0) {
          queueExit(isAutoCpu ? (this.reducedMotion ? 380 : 580) : this.reducedMotion ? 600 : 950);
          return;
        }

        // CPU Auto-Mode strictly obeys true EV math (`EV(pass) > EV(take)`) — never donates +EV spins!
        if (isAutoCpu) {
          const cpuEv = computeCurrentEv();
          if (cpuEv.shouldRecommendPass) {
            passedSpinsToRival = spinsRemaining;
            spinsRemaining = 0;
            finalHeadline = `⚡ ${rivalFullName.toUpperCase()} BANKED +$${netCashDelta.toLocaleString()} & PASSED ${passedSpinsToRival} HOT SPIN${passedSpinsToRival === 1 ? '' : 'S'}!`;
            syncHud(finalHeadline);
            queueExit(this.reducedMotion ? 380 : 560);
          } else {
            timers.push(
              window.setTimeout(() => {
                if (finished) return;
                state = 'BOUNCING';
                stage.dataset.state = 'bouncing';
                syncHud('🔥 HOT BOARD — CHAMP SPINS AGAIN!');
                scheduleNextBounce();
                timers.push(window.setTimeout(() => handleStop(), 440));
              }, 340),
            );
          }
          return;
        }

        // Player has spins left — Spin 2+ escalates to 4/12 HOT GREMLINS!
        stopBtn.disabled = true;
        timers.push(
          window.setTimeout(() => {
            if (finished || state !== 'RESULT_HOLD') return;
            state = 'BOUNCING';
            stage.dataset.state = 'bouncing';
            stopBtn.disabled = false;
            const nextEv = computeCurrentEv();
            syncHud(
              nextEv.shouldRecommendPass
                ? '🔥 4/12 GREMLINS! SMART ODDS: PASS SPINS!'
                : '🔥 4/12 GREMLINS! SPIN OR PASS TO CHAMP!',
            );
            scheduleNextBounce();
          }, this.reducedMotion ? 360 : 720),
        );
      };

      const handlePassSpins = (): void => {
        if (isAutoCpu || finished || spinsRemaining < 1 || state === 'GREMLIN_ZONK' || state === 'DONE') {
          return;
        }
        stopBouncing();
        this.callbacks.onUiTapSfx?.();
        passedSpinsToRival = spinsRemaining;
        spinsRemaining = 0;
        const cashPart = netCashDelta > 0 ? `+$${netCashDelta.toLocaleString()} BANKED · ` : '';
        finalHeadline = `⚡ ${cashPart}PASSED ${passedSpinsToRival} SPIN${passedSpinsToRival === 1 ? '' : 'S'} TO ${rivalShortName}!`;
        stage.dataset.state = 'passed';
        syncHud(finalHeadline);
        queueExit(this.reducedMotion ? 450 : 780);
      };

      const onFastFinishTap = (): void => {
        if ((state === 'DONE' || state === 'GREMLIN_ZONK') && canSkipEnd) {
          finishBoard();
        }
      };

      const onKeyDown = (ev: KeyboardEvent): void => {
        if (!isAutoCpu && state === 'BOUNCING' && (ev.key === ' ' || ev.key === 'Enter')) {
          ev.preventDefault();
          handleStop();
        } else if (!isAutoCpu && (ev.key === 'p' || ev.key === 'P') && spinsRemaining >= 1) {
          ev.preventDefault();
          handlePassSpins();
        } else if ((state === 'DONE' || state === 'GREMLIN_ZONK') && canSkipEnd) {
          if (ev.key === ' ' || ev.key === 'Enter' || ev.key === 'Escape') {
            ev.preventDefault();
            finishBoard();
          }
        }
      };

      stopBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        handleStop();
      });

      passBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        handlePassSpins();
      });

      overlay.addEventListener('pointerdown', onFastFinishTap);
      window.addEventListener('keydown', onKeyDown);

      this.activeCleanup = () => {
        finished = true;
        cleanupAll();
        resolve(buildResult());
      };

      this.rootEl.innerHTML = '';
      this.rootEl.appendChild(overlay);
      this.rootEl.classList.remove('wst7-hidden');
      syncHud();
      highlightSquare(cursorIndex, false);
      scheduleNextBounce();

      if (isAutoCpu) {
        // Brisk ~1.5s watchable CPU beat!
        timers.push(
          window.setTimeout(() => {
            handleStop();
          }, this.reducedMotion ? 320 : 620),
        );
      } else {
        overlay.tabIndex = -1;
        overlay.focus({ preventScroll: true });
      }
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

export function playBigWheelSpin(opts?: BigWheelSpinOptionsV7): Promise<BigWheelSpinResultV7> {
  return getSharedTwistTheater().playBigWheelSpin(opts);
}

export function playPressYourLuckGremlinBoard(
  opts: PressYourLuckGremlinOptionsV7,
): Promise<PressYourLuckGremlinResultV7> {
  return getSharedTwistTheater().playPressYourLuckGremlinBoard(opts);
}

export function playStandaloneGremlinSkit(
  input: GremlinSkitPlayInputV8,
): Promise<GremlinSkitIdV8> {
  return getSharedTwistTheater().playStandaloneGremlinSkit(input);
}
