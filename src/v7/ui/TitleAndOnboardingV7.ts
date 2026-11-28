/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.6 — 1966 IN LIVING COLOR)
// `src/v7/ui/TitleAndOnboardingV7.ts`
// AAA Broadcast Motion & Onboarding Controller:
//  0. Crisp 0.85s Skippable 1966 IBC Living Color Kaleidoscope Cold-Boot Tune-In
//  1. Animated 1966 "IN LIVING COLOR" Title Screen Hub (Zero AI Boxes!)
//  2. Immediate 3-Beat Campaign Story Cold-Open & 30-Second Host Rules Sequence
//     + Reusable Interactive `openHowToPlaySheet()` Studio Guide
//  3. Shareable Daily 1966 Broadcast Post-Show TV Guide / Solari Result Card
// ============================================================================

import '../../styles/title_1966_v7.css';
import {
  ALL_BOARD_PLAY_MODES_R7_V9,
  ALL_BOARD_PLAY_MODES_V7,
  ALL_CATEGORIES_V7,
  CAREER_MEDAL_SPECS_V7,
  type BoardPlayModeV7,
  type BoardPlayModeV9,
  type BroadcastBoothConfigV9,
  type CampaignSaveStateV7,
  type CareerMedalIdV7,
  type CategoryIdV7,
  type DailyBroadcastSaveV7,
  type DifficultyModeV7,
  type EpisodeBlueprintV7,
  type QuestionTimerModeV8,
  type VibePackIdV9,
} from '../contracts_v7';
import {
  VIBE_PACK_CATALOG_V9,
  VIBE_PACK_CATEGORIES_V9,
  loadShowroomLedgerV9,
  loadSweepsStateV9,
} from '../../v9/ShowroomAndCatalogsV9';
import {
  mountQuestionTimerSelectorV8,
  normalizeQuestionTimerModeV8,
} from './SmartStudioCoachV8';
import {
  CAST_PROFILES_V7,
  MAX_TRUNK_SLOTS_V7,
  RELIC_CATALOG_V7,
  TROPHY_CATALOG_V7,
  type TrophySpecV7,
} from '../campaign/CastAndRelicsCatalogV7';
import {
  getTrophyCatalogSummaryV7,
  getTrophyDisplayMetaV7,
} from '../engine/LitTrophyVaultV7';
import { LIEN_SEGMENT_COST_CASH_V7 } from '../campaign/FiftyMillionCampaignV7';
import {
  getFriendlyTvCategoryLabelV7,
  isDocumentFullscreenV7,
  toggleDocumentFullscreenV7,
} from './BroadcastChromeUIV7';

const COLD_OPEN_SEEN_STORAGE_KEY = 'ws_v7_cold_open_seen_1';
const DEFAULT_TUNEIN_DURATION_MS = 850;

// ----------------------------------------------------------------------------
// 1. Public Contracts & Callback Interfaces
// ----------------------------------------------------------------------------

export type QuickPlayBoardModeV7 =
  | 'CLASSIC_TOTE'
  | 'TIC_TAC_LINE'
  | 'COAST_HEX_BRIDGE'
  | 'EYE_GUESS_MEMORY'
  | 'CONCENTRATION_PRIZE_MATCH'
  | 'MONTY_CURTAIN_DEAL'
  | 'PRESS_YOUR_LUCK_GREMLIN'
  | 'BIG_WHEEL_SHOWCASE';

export interface QuickPlaySelectionV7 {
  /** Legacy v7 board format (when one of the 8 classic formats is chosen). */
  readonly preferredMode?: QuickPlayBoardModeV7;
  /** Full v9 board format supporting all 16 classic + R7 BoardPlayModeV9 modes. */
  readonly preferredModeV9?: BoardPlayModeV9;
  readonly difficultyMode?: DifficultyModeV7;
  readonly questionTimerMode?: QuestionTimerModeV8;
  readonly boothConfig?: BroadcastBoothConfigV9;
}

export type DailyTileOutcomeV7 =
  | 'WIN'
  | 'SECRET_WIN'
  | 'VAULT_WIN'
  | 'MYSTERY_WIN'
  | 'SHOWCASE_WIN'
  | 'MISS';

export interface TitleAndOnboardingCallbacksV7 {
  readonly onPlayCampaign?: () => void;
  readonly onPlayDailyBroadcast?: () => void;
  readonly onPlayBlitz60?: (boothConfig?: BroadcastBoothConfigV9) => void;
  readonly onOpenSweepsWeek?: () => void;
  readonly onOpenShowroom?: () => void;
  readonly onToggleSound?: () => void;
  readonly onQuickShow?: (selection?: QuickPlaySelectionV7) => void;
  readonly onQuickPlaySelected?: (selection: QuickPlaySelectionV7) => void;
  readonly onOpenHowToPlay?: () => void;
  readonly onOpenTrophiesAndSound?: () => void;
  readonly onOpenTrophyVault?: () => void;
  readonly onOpenAudioSettings?: () => void;
  readonly onOpenPropShop?: () => void;
  readonly onOpenEpisodeJump?: () => void;
  readonly onToggleFullscreen?: () => void;
  readonly onStartCouchParty?: () => void;
  readonly onOpenCareerStats?: () => void;
  readonly onOpenDailyTapeVault?: () => void;
  readonly onOpenWalnutShareCard?: () => void;
  readonly onPlayEndCredits?: () => void;
  readonly countUnseenAvailableClues?: (opts: {
    readonly vibePackId?: VibePackIdV9;
    readonly vetoedCategories?: readonly CategoryIdV7[];
    readonly isBlitz?: boolean;
  }) => number;
  readonly isAudioUnlocked?: () => boolean;
  readonly onRequestAudioUnlock?: () => void | Promise<void>;
  readonly onUiTapSfx?: () => void;
  readonly onBellSfx?: () => void;
  readonly onCelebrateSfx?: () => void;
  readonly onBootTuneInSfx?: () => void;
}

export interface TitleHubViewDataV7 {
  readonly save?: CampaignSaveStateV7;
  readonly episodeBlueprint?: EpisodeBlueprintV7;
  readonly dailySave?: DailyBroadcastSaveV7 | null;
  readonly dailyEpisodeNumber?: number;
  readonly dailyDateLabel?: string;
  readonly playBootTuneIn?: boolean;
  readonly isAudioUnlocked?: boolean;
  readonly showroomCash?: number;
  readonly plinkoTokens?: number;
  readonly soundEnabled?: boolean;
  readonly pendingRematchEpisode?: number | null;
  readonly sweepsActiveNight?: number | null;
}

export interface StoryColdOpenOptionsV7 {
  readonly episodeBlueprint?: EpisodeBlueprintV7;
  readonly rivalName?: string;
  readonly startBeat?: 0 | 1 | 2;
  readonly boardModeSummary?: { readonly modeTitle: string; readonly ruleSummary: string };
  readonly onBeatChanged?: (beatIndex: 0 | 1 | 2) => void;
}

export interface HowToPlaySheetOptionsV7 {
  readonly initialTab?: 0 | 1 | 2;
  readonly episodeBlueprint?: EpisodeBlueprintV7;
  readonly boardModeSummary?: { readonly modeTitle: string; readonly ruleSummary: string };
  readonly onClose?: () => void;
}

export interface DailyBroadcastResultModalOptionsV7 {
  readonly save: DailyBroadcastSaveV7;
  readonly rivalName?: string;
  readonly stageName?: string;
  readonly dateLabel?: string;
  readonly allowReplay?: boolean;
  readonly onPlayAgain?: () => void;
  readonly onBackToStudio?: () => void;
  readonly onShareComplete?: (method: 'WEB_SHARE' | 'CLIPBOARD') => void;
}

export type DailyModalActionResultV7 = 'PLAY_AGAIN' | 'BACK_TO_STUDIO';

// ----------------------------------------------------------------------------
// 2. Orphan-Proof Typography & Daily Emoji Formatting Helpers
// ----------------------------------------------------------------------------

function formatOrphanProof(raw: string): string {
  const cleaned = raw.replace(/\.{3}|\u2026/g, '—').trim();
  const lastSpace = cleaned.lastIndexOf(' ');
  if (lastSpace <= 0 || lastSpace >= cleaned.length - 1) {
    return cleaned;
  }
  return `${cleaned.slice(0, lastSpace)}\u00A0${cleaned.slice(lastSpace + 1)}`;
}

function getLocalTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatReadableDateFromIso(dateIso: string): string {
  const parts = dateIso.split('-').map((n) => Number.parseInt(n, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return dateIso;
  }
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const DAILY_TILE_EMOJI_MAP: Record<DailyTileOutcomeV7, { readonly emoji: string; readonly label: string }> = {
  WIN: { emoji: '🟦🟩', label: 'Standard Tile Won' },
  SECRET_WIN: { emoji: '⭐🟩', label: 'Secret Square Double Won' },
  VAULT_WIN: { emoji: '🔒🟩', label: 'Locked Vault Jackpot Won' },
  MYSTERY_WIN: { emoji: '❓🟩', label: 'Mystery Curtain Won' },
  SHOWCASE_WIN: { emoji: '🎯🟩', label: 'TV Showcase Bonus Won' },
  MISS: { emoji: '🟥', label: 'Missed Clue' },
};

export function formatDailyShareTextFallbackV7(save: DailyBroadcastSaveV7): string {
  const res = save.todayResult;
  const epNum = res?.episodeNumber ?? 1;
  const dateLabel = res?.dateIso ? formatReadableDateFromIso(res.dateIso) : formatReadableDateFromIso(getLocalTodayIso());
  const pCash = Math.max(0, Math.floor(res?.playerCash ?? 0));
  const rCash = Math.max(0, Math.floor(res?.rivalCash ?? 0));
  const isExactTie = pCash === rCash;
  const won = Boolean(res?.won) || pCash >= rCash;
  const history = res?.tileHistory?.length
    ? res.tileHistory
    : (['WIN', 'SECRET_WIN', 'VAULT_WIN', 'MYSTERY_WIN', 'SHOWCASE_WIN'] as const);
  const canonicalTiles = history.map((t) => DAILY_TILE_EMOJI_MAP[t]?.emoji ?? '🟦🟩').join(' ');

  if (res?.shareText && res.shareText.trim().length > 0 && !isExactTie) {
    const normalized = res.shareText.trim().replace(/🟦🟥/g, '🟥');
    const lines = normalized.split('\n');
    const lastLineTokens = (lines[lines.length - 1] ?? '').trim().split(/\s+/).filter(Boolean);
    if (lastLineTokens.length === history.length) {
      return normalized;
    }
  }

  const verdict = isExactTie ? 'CO-CHAMPION!' : won ? 'WON!' : 'CLOSE SHOW!';
  const streakPart = save.currentStreak > 0 ? ` (🔥 Streak: ${save.currentStreak})` : '';
  return [
    `📺 WORLD'S SMARTEST · 1966 Daily Broadcast #${epNum} (${dateLabel})`,
    `${won ? '🏆' : '🎬'} $${pCash.toLocaleString()} vs Champ $${rCash.toLocaleString()} · ${verdict}${streakPart}`,
    canonicalTiles,
  ].join('\n');
}

// ----------------------------------------------------------------------------
// 3. Bespoke 1966 Inline SVG Motion Artwork (Zero External Asset Fragility)
// ----------------------------------------------------------------------------

function buildPeacockEmblemSvg(className = 'ws66-peacock-svg'): string {
  // Original 1966 IBC Living Color 6-Prism Spectrum Fan Emblem (Zero external network trademarks)
  return `
    <svg class="${className}" viewBox="0 0 88 56" fill="none" aria-hidden="true">
      <path d="M44 45 L10 34 C7 29 12 22 20 25 Z" fill="#F4A91F"/>
      <path d="M44 45 L17 17 C16 11 24 8 30 14 Z" fill="#FF6738"/>
      <path d="M44 45 L33 7 C35 3 43 3 44 10 Z" fill="#E63B7A"/>
      <path d="M44 45 L44 10 C45 3 53 3 55 7 Z" fill="#7B3FE4"/>
      <path d="M44 45 L58 14 C64 8 72 11 71 17 Z" fill="#1E56C5"/>
      <path d="M44 45 L68 25 C76 22 81 29 78 34 Z" fill="#00A5B5"/>
      <polygon points="44,21 59,36 44,51 29,36" fill="#5C301B" stroke="#FFD966" stroke-width="2.2"/>
      <text x="44" y="39" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="7.8" letter-spacing="0.04em" fill="#FFF7E6">IBC</text>
    </svg>
  `;
}

function buildKaleidoscopePrismSvg(): string {
  const facets: string[] = [];
  const colors = ['#F4A91F', '#FF6738', '#E63B7A', '#7B3FE4', '#1E56C5', '#00A5B5'];
  const petals = 12;
  for (let i = 0; i < petals; i += 1) {
    const a0 = (i * 30 - 13) * (Math.PI / 180);
    const aMid = i * 30 * (Math.PI / 180);
    const a1 = (i * 30 + 13) * (Math.PI / 180);
    const innerR = 46;
    const outerR = i % 2 === 0 ? 196 : 164;
    const midR = i % 2 === 0 ? 216 : 182;
    const ix = (220 + Math.cos(aMid) * innerR).toFixed(1);
    const iy = (220 + Math.sin(aMid) * innerR).toFixed(1);
    const x1 = (220 + Math.cos(a0) * outerR).toFixed(1);
    const y1 = (220 + Math.sin(a0) * outerR).toFixed(1);
    const xm = (220 + Math.cos(aMid) * midR).toFixed(1);
    const ym = (220 + Math.sin(aMid) * midR).toFixed(1);
    const x2 = (220 + Math.cos(a1) * outerR).toFixed(1);
    const y2 = (220 + Math.sin(a1) * outerR).toFixed(1);
    const col = colors[i % colors.length];
    facets.push(
      `<polygon points="${ix},${iy} ${x1},${y1} ${xm},${ym} ${x2},${y2}" fill="${col}" fill-opacity="0.72"/>`,
    );
  }
  return `
    <svg class="ws66-tunein-kaleidoscope" viewBox="0 0 440 440" fill="none" aria-hidden="true">
      <circle cx="220" cy="220" r="204" stroke="#FFD966" stroke-width="3" stroke-opacity="0.52" stroke-dasharray="10 12"/>
      ${facets.join('')}
      <circle cx="220" cy="220" r="88" fill="#3E2012" fill-opacity="0.88" stroke="#FFD966" stroke-width="4"/>
    </svg>
  `;
}

function buildStarburstBackdropSvg(): string {
  const rays: string[] = [];
  const palette = ['#0096A6', '#F4A91F', '#FF6738', '#E63B7A', '#1E56C5', '#19BFD0'];
  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const a1 = ((i * 360) / count - 7) * (Math.PI / 180);
    const a2 = ((i * 360) / count + 7) * (Math.PI / 180);
    const r = i % 2 === 0 ? 290 : 255;
    const x1 = (300 + Math.cos(a1) * r).toFixed(1);
    const y1 = (300 + Math.sin(a1) * r).toFixed(1);
    const x2 = (300 + Math.cos(a2) * r).toFixed(1);
    const y2 = (300 + Math.sin(a2) * r).toFixed(1);
    const color = palette[i % palette.length];
    rays.push(`<polygon points="300,300 ${x1},${y1} ${x2},${y2}" fill="${color}" fill-opacity="0.22"/>`);
  }
  return `
    <svg class="ws66-starburst-svg" viewBox="0 0 600 600" aria-hidden="true">
      <defs>
        <radialGradient id="ws66StarMask" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFE27A" stop-opacity="0.32"/>
          <stop offset="48%" stop-color="#0096A6" stop-opacity="0.14"/>
          <stop offset="100%" stop-color="#5C301B" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="245" fill="url(#ws66StarMask)"/>
      ${rays.join('')}
      <circle cx="300" cy="300" r="144" fill="none" stroke="#FFD966" stroke-opacity="0.28" stroke-width="2" stroke-dasharray="6 10"/>
    </svg>
  `;
}

function buildAtomicStarSvg(fillHex: string): string {
  return `
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 0 L23.6 16.4 L40 20 L23.6 23.6 L20 40 L16.4 23.6 L0 20 L16.4 16.4 Z" fill="${fillHex}"/>
    </svg>
  `;
}

function buildMarqueeArchBulbsSvg(): string {
  const bulbs: string[] = [];
  const total = 15;
  for (let i = 0; i < total; i += 1) {
    const t = i / (total - 1);
    const x = 22 + t * 416;
    const archOffset = Math.sin(t * Math.PI) * 18;
    const y = 26 - archOffset;
    const circuit = i % 3;
    bulbs.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.4" fill="#4A2614"/>`,
      `<circle class="ws66-bulb-dot ws66-c${circuit}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="#FFD966"/>`,
    );
  }
  return `
    <svg class="ws66-bulb-arch" viewBox="0 0 460 36" fill="none" aria-hidden="true">
      <path d="M 16 26 Q 230 -4 444 26" stroke="#F4A91F" stroke-width="3" stroke-linecap="round" opacity="0.65"/>
      ${bulbs.join('')}
    </svg>
  `;
}

function buildMarqueeBottomBulbsSvg(): string {
  const bulbs: string[] = [];
  const total = 11;
  for (let i = 0; i < total; i += 1) {
    const t = i / (total - 1);
    const x = 28 + t * 334;
    const y = 10;
    const circuit = (i + 1) % 3;
    bulbs.push(
      `<circle cx="${x.toFixed(1)}" cy="${y}" r="5.4" fill="#4A2614"/>`,
      `<circle class="ws66-bulb-dot ws66-c${circuit}" cx="${x.toFixed(1)}" cy="${y}" r="3.8" fill="#FFD966"/>`,
    );
  }
  return `
    <svg class="ws66-bulb-rail-bottom" viewBox="0 0 390 20" fill="none" aria-hidden="true">
      <line x1="20" y1="10" x2="370" y2="10" stroke="#19BFD0" stroke-width="2.2" opacity="0.65"/>
      ${bulbs.join('')}
    </svg>
  `;
}

function buildMarqueeRainbowFanSvg(): string {
  const rays: string[] = [];
  const palette = ['#FFD166', '#F2A922', '#FF6B35', '#E6397A', '#1E56C5', '#008B94'];
  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const a1 = ((i * 360) / count - 6.5) * (Math.PI / 180);
    const a2 = ((i * 360) / count + 6.5) * (Math.PI / 180);
    const rx = 380;
    const ry = 220;
    const cx = 320;
    const cy = 112;
    const x1 = (cx + Math.cos(a1) * rx).toFixed(1);
    const y1 = (cy + Math.sin(a1) * ry).toFixed(1);
    const x2 = (cx + Math.cos(a2) * rx).toFixed(1);
    const y2 = (cy + Math.sin(a2) * ry).toFixed(1);
    const col = palette[i % palette.length];
    rays.push(`<polygon points="${cx},${cy} ${x1},${y1} ${x2},${y2}" fill="${col}" fill-opacity="0.24"/>`);
  }
  return `
    <svg class="ws9-marquee-fan-svg" viewBox="0 0 640 200" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="ws9FanCore" cx="50%" cy="56%" r="54%">
          <stop offset="0%" stop-color="#FFD166" stop-opacity="0.42"/>
          <stop offset="45%" stop-color="#008B94" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#5C301B" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="640" height="200" fill="url(#ws9FanCore)"/>
      ${rays.join('')}
      <ellipse cx="320" cy="112" rx="190" ry="74" stroke="#FFD166" stroke-opacity="0.34" stroke-width="2" stroke-dasharray="7 10"/>
    </svg>
  `;
}

function buildEightPointStarburstSvg(): string {
  return `
    <svg class="ws9-starburst-glyph" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 1 L18.7 12.2 L26.6 5.4 L19.8 13.3 L31 16 L19.8 18.7 L26.6 26.6 L18.7 19.8 L16 31 L13.3 19.8 L5.4 26.6 L12.2 18.7 L1 16 L12.2 13.3 L5.4 5.4 L13.3 12.2 Z" fill="#FFD166" stroke="#432111" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="16" cy="16" r="3" fill="#FFFDF7"/>
    </svg>
  `;
}

function buildHeroMarqueeBulbPerimeterHtml(): string {
  const topCount = 16;
  const sideCount = 4;
  const bottomCount = 16;
  const topBulbs = Array.from({ length: topCount }, (_, i) => {
    const c = i % 3;
    return `<span class="ws9-bulb ws9-bulb-c${c}"></span>`;
  }).join('');
  const rightBulbs = Array.from({ length: sideCount }, (_, i) => {
    const c = (topCount + i) % 3;
    return `<span class="ws9-bulb ws9-bulb-c${c}"></span>`;
  }).join('');
  const bottomBulbs = Array.from({ length: bottomCount }, (_, i) => {
    const c = (topCount + sideCount + (bottomCount - 1 - i)) % 3;
    return `<span class="ws9-bulb ws9-bulb-c${c}"></span>`;
  }).join('');
  const leftBulbs = Array.from({ length: sideCount }, (_, i) => {
    const c = (topCount + sideCount + bottomCount + (sideCount - 1 - i)) % 3;
    return `<span class="ws9-bulb ws9-bulb-c${c}"></span>`;
  }).join('');
  return `
    <div class="ws9-bulb-rail ws9-bulb-rail-top" aria-hidden="true">${topBulbs}</div>
    <div class="ws9-bulb-rail ws9-bulb-rail-right" aria-hidden="true">${rightBulbs}</div>
    <div class="ws9-bulb-rail ws9-bulb-rail-bottom" aria-hidden="true">${bottomBulbs}</div>
    <div class="ws9-bulb-rail ws9-bulb-rail-left" aria-hidden="true">${leftBulbs}</div>
  `;
}

function buildKineticHeroWordHtml(word: string): string {
  const tilts = [-2.5, 2.2, -1.8, 2.4, -2.2, 2.1, -2.4, 2.5];
  const yOffsets = [1.5, -2, 1, -1.5, 2, -2, 1.5, -1];
  return Array.from(word)
    .map((ch, i) => {
      const tilt = tilts[i % tilts.length];
      const y0 = yOffsets[i % yOffsets.length];
      return `<span class="ws9-hero-letter" style="--li:${i};--tilt:${tilt}deg;--y0:${y0}px">${ch}</span>`;
    })
    .join('');
}

function buildOrchestraWaveSvg(): string {
  return `
    <svg class="ws66-orchestra-vu-svg" viewBox="0 0 28 22" fill="none" aria-hidden="true">
      <rect class="ws66-vu-bar ws66-vu-1" x="2" y="9" width="4" height="11" rx="2" fill="#121A2B"/>
      <rect class="ws66-vu-bar ws66-vu-2" x="8" y="3" width="4" height="17" rx="2" fill="#121A2B"/>
      <rect class="ws66-vu-bar ws66-vu-3" x="14" y="6" width="4" height="14" rx="2" fill="#121A2B"/>
      <rect class="ws66-vu-bar ws66-vu-4" x="20" y="10" width="4" height="10" rx="2" fill="#121A2B"/>
    </svg>
  `;
}

function buildSurpriseMixKaleidoscopeSvg(): string {
  return `
    <svg class="ws66-qp-diagram-svg ws66-qp-surprise-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="46" height="34" rx="7" fill="#3E2012" stroke="#FFD966" stroke-width="1.8"/>
      <polygon points="24,18 14,5 24,5" fill="#F4A91F"/>
      <polygon points="24,18 24,5 34,5" fill="#FF6738"/>
      <polygon points="24,18 34,5 41,18" fill="#E63B7A"/>
      <polygon points="24,18 41,18 34,31" fill="#1E56C5"/>
      <polygon points="24,18 34,31 14,31" fill="#00A5B5"/>
      <polygon points="24,18 14,31 7,18" fill="#2ECC71"/>
      <polygon points="24,18 7,18 14,5" fill="#FFD966"/>
      <circle cx="24" cy="18" r="7.5" fill="#3E2012" stroke="#FFF7E6" stroke-width="1.6"/>
      <path d="M24 12.5 L25.6 16.4 L29.5 18 L25.6 19.6 L24 23.5 L22.4 19.6 L18.5 18 L22.4 16.4 Z" fill="#FFD966"/>
    </svg>
  `;
}

function buildBoardModeMiniDiagramSvg(mode: BoardPlayModeV9): string {
  switch (mode) {
    case 'LOUVER_SHUTTER':
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#00A5B5" stroke-width="1.6"/>
          <rect x="6" y="5" width="36" height="4" rx="1.5" fill="#00A5B5"/>
          <rect x="6" y="11" width="36" height="4" rx="1.5" fill="#19BFD0"/>
          <rect x="6" y="17" width="36" height="4" rx="1.5" fill="#00A5B5"/>
          <rect x="8" y="24" width="32" height="7" rx="2" fill="#FFD966"/>
        </svg>
      `;
    case 'BLIND_PURSE':
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#E63B7A" stroke-width="1.6"/>
          <rect x="6" y="5" width="36" height="8" rx="2" fill="#FFF7E6"/>
          <rect x="6" y="16" width="36" height="15" rx="3" fill="#E63B7A" stroke="#FFD966" stroke-width="1.4"/>
          <circle cx="24" cy="23.5" r="4.5" fill="#FFD966"/>
        </svg>
      `;
    case 'BLACKOUT_VAULT':
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#5C301B" stroke="#FFD966" stroke-width="1.8"/>
          <circle cx="24" cy="18" r="10.5" fill="#3E2012" stroke="#FFD966" stroke-width="2"/>
          <circle cx="24" cy="18" r="3.5" fill="#FF6738"/>
          <line x1="24" y1="7.5" x2="24" y2="12" stroke="#FFD966" stroke-width="2"/>
          <line x1="24" y1="24" x2="24" y2="28.5" stroke="#FFD966" stroke-width="2"/>
        </svg>
      `;
    case 'LIVE_WIRE_FUSE':
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#FF6738" stroke-width="1.6"/>
          <path d="M9 18 H20 L24 10 L28 26 L32 18 H39" stroke="#FFD966" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="9" cy="18" r="3.2" fill="#19BFD0"/>
          <circle cx="39" cy="18" r="3.2" fill="#FF6738"/>
        </svg>
      `;
    case 'SHIFTING_SPOTLIGHT':
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#FFD966" stroke-width="1.6"/>
          <polygon points="24,4 38,31 10,31" fill="#FFD966" fill-opacity="0.32"/>
          <circle cx="24" cy="21" r="6.5" fill="#FFD966" stroke="#FFF7E6" stroke-width="1.5"/>
        </svg>
      `;
    case 'GOLDEN_DOMINO_CASCADE':
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#2ECC71" stroke-width="1.6"/>
          <rect x="6" y="10" width="9" height="16" rx="2" fill="#2ECC71"/>
          <rect x="19.5" y="10" width="9" height="16" rx="2" fill="#FFD966"/>
          <rect x="33" y="10" width="9" height="16" rx="2" fill="#2ECC71"/>
          <line x1="15" y1="18" x2="33" y2="18" stroke="#FFF7E6" stroke-width="2.2"/>
        </svg>
      `;
    case 'PRESSURE_COOKER':
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#FF6738" stroke-width="1.6"/>
          <circle cx="24" cy="20" r="11" fill="#FFF7E6" stroke="#FF6738" stroke-width="2"/>
          <path d="M24 20 L31 13" stroke="#E03E36" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="24" cy="20" r="2.5" fill="#1E140E"/>
        </svg>
      `;
    case 'HOLLYWOOD_MARQUEE_LINE':
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#F4A91F" stroke-width="1.6"/>
          <circle cx="11" cy="18" r="4.5" fill="#FFD966"/>
          <circle cx="24" cy="18" r="4.5" fill="#FFD966"/>
          <circle cx="37" cy="18" r="4.5" fill="#FFD966"/>
          <line x1="7" y1="18" x2="41" y2="18" stroke="#FFF7E6" stroke-width="2"/>
        </svg>
      `;
    case 'CLASSIC_TOTE':
      // 3x3 Tote Board with Glowing Gold Vault & Starburst Daily Double
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#19BFD0" stroke-width="1.6"/>
          <rect x="5" y="5" width="11" height="7" rx="1.8" fill="#FFF7E6"/>
          <rect x="18.5" y="5" width="11" height="7" rx="1.8" fill="#FFD966"/>
          <rect x="32" y="5" width="11" height="7" rx="1.8" fill="#FFF7E6"/>
          <rect x="5" y="14.5" width="11" height="7" rx="1.8" fill="#19BFD0"/>
          <rect x="18.5" y="14.5" width="11" height="7" rx="1.8" fill="#FF6738"/>
          <rect x="32" y="14.5" width="11" height="7" rx="1.8" fill="#FFF7E6"/>
          <rect x="5" y="24" width="11" height="7" rx="1.8" fill="#FFF7E6"/>
          <rect x="18.5" y="24" width="11" height="7" rx="1.8" fill="#FFF7E6"/>
          <rect x="32" y="24" width="11" height="7" rx="1.8" fill="#1E56C5"/>
          <circle cx="24" cy="8.5" r="2.2" fill="#1E140E"/>
          <path d="M24 15.5 L25.2 17.5 L27.3 18 L25.2 18.8 L24 20.8 L22.8 18.8 L20.7 18 L22.8 17.5 Z" fill="#FFF7E6"/>
        </svg>
      `;
    case 'TIC_TAC_LINE':
      // Hollywood Squares 3x3 Grid with Diagonal Gold Winning Line
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#4A82F2" stroke-width="1.6"/>
          <rect x="6" y="4.5" width="10" height="7.5" rx="1.6" fill="#FFD966"/>
          <rect x="19" y="4.5" width="10" height="7.5" rx="1.6" fill="#5C301B"/>
          <rect x="32" y="4.5" width="10" height="7.5" rx="1.6" fill="#E63B7A"/>
          <rect x="6" y="14.2" width="10" height="7.5" rx="1.6" fill="#5C301B"/>
          <rect x="19" y="14.2" width="10" height="7.5" rx="1.6" fill="#FFD966"/>
          <rect x="32" y="14.2" width="10" height="7.5" rx="1.6" fill="#5C301B"/>
          <rect x="6" y="24" width="10" height="7.5" rx="1.6" fill="#E63B7A"/>
          <rect x="19" y="24" width="10" height="7.5" rx="1.6" fill="#5C301B"/>
          <rect x="32" y="24" width="10" height="7.5" rx="1.6" fill="#FFD966"/>
          <line x1="8" y1="6.5" x2="40" y2="29.5" stroke="#FFF7E6" stroke-width="3.2" stroke-linecap="round"/>
          <line x1="8" y1="6.5" x2="40" y2="29.5" stroke="#FF6738" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `;
    case 'COAST_HEX_BRIDGE':
      // Interlocking Hex Chain Connecting Left (NYC) to Right (LA)
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#19BFD0" stroke-width="1.6"/>
          <rect x="3.5" y="6" width="3" height="24" rx="1.5" fill="#19BFD0"/>
          <rect x="41.5" y="6" width="3" height="24" rx="1.5" fill="#FFD966"/>
          <polygon points="14,10 19,13 19,19 14,22 9,19 9,13" fill="#19BFD0" stroke="#FFF7E6" stroke-width="1.2"/>
          <polygon points="24,14 29,17 29,23 24,26 19,23 19,17" fill="#FFD966" stroke="#FFF7E6" stroke-width="1.2"/>
          <polygon points="34,10 39,13 39,19 34,22 29,19 29,13" fill="#19BFD0" stroke="#FFF7E6" stroke-width="1.2"/>
          <path d="M14 16 L24 20 L34 16" stroke="#FFF7E6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    case 'EYE_GUESS_MEMORY':
      // Mid-Century 1966 Eye Aperture Peeking at Hidden 2X & Cash Icons
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#FFD966" stroke-width="1.6"/>
          <path d="M6 18 Q24 4 42 18 Q24 32 6 18 Z" fill="#FFF7E6" stroke="#F4A91F" stroke-width="2"/>
          <circle cx="24" cy="18" r="7.2" fill="#0096A6"/>
          <circle cx="24" cy="18" r="3.4" fill="#1E140E"/>
          <circle cx="26" cy="16" r="1.4" fill="#FFF7E6"/>
          <path d="M9 9 L12 12 M39 9 L36 12 M24 4 L24 7" stroke="#FFD966" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      `;
    case 'CONCENTRATION_PRIZE_MATCH':
      // Twin Split-Trilon Matching Prize Halves Linked by Gold Arc
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#FF6738" stroke-width="1.6"/>
          <rect x="5" y="7" width="16" height="22" rx="3" fill="#FFF7E6" stroke="#FF6738" stroke-width="1.8"/>
          <rect x="27" y="7" width="16" height="22" rx="3" fill="#FFF7E6" stroke="#FF6738" stroke-width="1.8"/>
          <rect x="8.5" y="13" width="9" height="8" rx="1.6" fill="#0096A6"/>
          <rect x="30.5" y="13" width="9" height="8" rx="1.6" fill="#0096A6"/>
          <path d="M16 9 Q24 2 32 9" stroke="#FFD966" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="24" cy="18" r="3.2" fill="#FFD966"/>
        </svg>
      `;
    case 'MONTY_CURTAIN_DEAL':
      // Triple Velvet Proscenium Arches (#1, #2, #3) with Center Parted
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#E63B7A" stroke-width="1.6"/>
          <path d="M5 31 V12 C5 8 15 8 15 12 V31 Z" fill="#E63B7A"/>
          <path d="M19 31 V11 C19 7 29 7 29 11 V31 Z" fill="#FFD966"/>
          <path d="M19 11 L22 31 H19 Z M29 11 L26 31 H29 Z" fill="#0096A6"/>
          <path d="M33 31 V12 C33 8 43 8 43 12 V31 Z" fill="#1E56C5"/>
          <circle cx="24" cy="19" r="3" fill="#1E140E"/>
          <rect x="4" y="30" width="40" height="3" rx="1.5" fill="#F4A91F"/>
        </svg>
      `;
    case 'PRESS_YOUR_LUCK_GREMLIN':
      // 4x4 Perimeter Light-Board with Glowing Corner Square & Gremlin Center
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#E63B7A" stroke-width="1.6"/>
          <rect x="5" y="4.5" width="8.5" height="6" rx="1.2" fill="#19BFD0"/>
          <rect x="15" y="4.5" width="8.5" height="6" rx="1.2" fill="#FFD966" stroke="#FFF7E6" stroke-width="1.5"/>
          <rect x="25" y="4.5" width="8.5" height="6" rx="1.2" fill="#E63B7A"/>
          <rect x="35" y="4.5" width="8.5" height="6" rx="1.2" fill="#1E56C5"/>
          <rect x="5" y="15" width="8.5" height="6" rx="1.2" fill="#FF6738"/>
          <rect x="35" y="15" width="8.5" height="6" rx="1.2" fill="#19BFD0"/>
          <rect x="5" y="25.5" width="8.5" height="6" rx="1.2" fill="#E63B7A"/>
          <rect x="15" y="25.5" width="8.5" height="6" rx="1.2" fill="#1E56C5"/>
          <rect x="25" y="25.5" width="8.5" height="6" rx="1.2" fill="#FFD966"/>
          <rect x="35" y="25.5" width="8.5" height="6" rx="1.2" fill="#FF6738"/>
          <rect x="15.5" y="12.5" width="17" height="11" rx="2.5" fill="#5C301B" stroke="#FFD966" stroke-width="1.1"/>
          <path d="M24 14.5 L21 19.5 H24.5 L23 23 L27.5 17.8 H24.2 Z" fill="#FFD966"/>
        </svg>
      `;
    case 'BIG_WHEEL_SHOWCASE':
    default:
      // 1966 Living Color Studio Wheel + Brass Top Flapper
      return `
        <svg class="ws66-qp-diagram-svg" viewBox="0 0 48 36" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="46" height="34" rx="6" fill="#3E2012" stroke="#FFD966" stroke-width="1.6"/>
          <circle cx="24" cy="19" r="13.5" fill="#1E56C5" stroke="#FFD966" stroke-width="2"/>
          <path d="M24 19 L24 5.5 A13.5 13.5 0 0 1 35.5 12 Z" fill="#FFD966"/>
          <path d="M24 19 L35.5 12 A13.5 13.5 0 0 1 35.5 26 Z" fill="#FF6738"/>
          <path d="M24 19 L35.5 26 A13.5 13.5 0 0 1 24 32.5 Z" fill="#E63B7A"/>
          <path d="M24 19 L24 32.5 A13.5 13.5 0 0 1 12.5 26 Z" fill="#00A5B5"/>
          <path d="M24 19 L12.5 26 A13.5 13.5 0 0 1 12.5 12 Z" fill="#2ECC71"/>
          <circle cx="24" cy="19" r="4" fill="#DCE4EE" stroke="#1E140E" stroke-width="1.2"/>
          <polygon points="21,4 27,4 24,10.5" fill="#E03E36" stroke="#FFF7E6" stroke-width="1"/>
        </svg>
      `;
  }
}

function buildDailyShareIconSvg(): string {
  return `
    <svg class="ws66-share-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 L17 8 H13.8 V15 H10.2 V8 H7 L12 3 Z" fill="#121A2B"/>
      <path d="M5 14 V19 C5 20.1 5.9 21 7 21 H17 C18.1 21 19 20.1 19 19 V14" stroke="#121A2B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function buildBroadcastUpdateSyncSvg(): string {
  return `
    <svg class="ws66-update-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M16.4 8.2 A6.8 6.8 0 0 0 4.9 5.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>
      <path d="M16.9 4.3 L16.7 8.4 L12.6 8.1" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3.6 11.8 A6.8 6.8 0 0 0 15.1 14.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>
      <path d="M3.1 15.7 L3.3 11.6 L7.4 11.9" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function buildShowcaseGlyphSvg(
  kind:
    | 'CROWN'
    | 'TROPHY'
    | 'MEDAL'
    | 'PROP'
    | 'TURNTABLE'
    | 'AUDIO'
    | 'TV'
    | 'GUIDE'
    | 'SAVE'
    | 'MIC'
    | 'FLAME',
): string {
  switch (kind) {
    case 'MIC':
      return `
        <svg class="ws66-glyph-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="6.8" y="2.2" width="6.4" height="9.6" rx="3.2" fill="#FFD966" stroke="#1E140E" stroke-width="1.4"/>
          <line x1="7.5" y1="5.6" x2="12.5" y2="5.6" stroke="#1E140E" stroke-width="1.2"/>
          <line x1="7.5" y1="8.2" x2="12.5" y2="8.2" stroke="#1E140E" stroke-width="1.2"/>
          <path d="M4.5 9.2 C4.5 12.6 7 14.8 10 14.8 C13 14.8 15.5 12.6 15.5 9.2" stroke="#1E140E" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M10 14.8 V17.6 M6.8 17.8 H13.2" stroke="#1E140E" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      `;
    case 'FLAME':
      return `
        <svg class="ws66-glyph-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10.4 2.2 C13.2 5.4 15.4 8.2 15.4 11.6 C15.4 15 13 17.6 10 17.6 C7 17.6 4.6 15 4.6 11.8 C4.6 9.2 6.3 7.1 7.6 5.4 C7.7 7.2 8.6 8.2 9.4 8.4 C9.1 6.2 9.5 4 10.4 2.2 Z" fill="#FF6738" stroke="#1E140E" stroke-width="1.3" stroke-linejoin="round"/>
          <path d="M10.1 9.4 C11.4 10.9 12.2 12.1 12.2 13.5 C12.2 14.9 11.2 16 10 16 C8.8 16 7.8 14.9 7.8 13.5 C7.8 12.2 8.7 11 10.1 9.4 Z" fill="#FFD966"/>
        </svg>
      `;
    case 'SAVE':
      return `
        <svg class="ws66-glyph-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="2.5" y="2.5" width="15" height="15" rx="3" fill="#FFD966" stroke="#1E140E" stroke-width="1.4"/>
          <path d="M6 10.2 L8.8 13 L14.2 7.2" stroke="#1E140E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    case 'CROWN':
      return `
        <svg class="ws66-glyph-svg" viewBox="0 0 20 18" fill="none" aria-hidden="true">
          <path d="M2 13 L4 5 L8.5 9.2 L10 3 L11.5 9.2 L16 5 L18 13 Z" fill="#1E140E" stroke="#9C5B04" stroke-width="1.2" stroke-linejoin="round"/>
          <rect x="3" y="14" width="14" height="2.4" rx="1.2" fill="#1E140E"/>
        </svg>
      `;
    case 'TROPHY':
      return `
        <svg class="ws66-glyph-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 3 H15 V8 C15 11 12.8 13 10 13 C7.2 13 5 11 5 8 Z" fill="#FFD966" stroke="#FFF7E6" stroke-width="1.3"/>
          <path d="M5 5 H2.5 C2.5 8 3.6 9.5 5 9.5 M15 5 H17.5 C17.5 8 16.4 9.5 15 9.5" stroke="#FFD966" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M10 13 V16 M6.5 17 H13.5" stroke="#FFD966" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    case 'MEDAL':
      return `
        <svg class="ws66-glyph-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="6" y="2" width="8" height="6" rx="1.2" fill="#19BFD0" stroke="#FFF7E6" stroke-width="1.2"/>
          <circle cx="10" cy="13" r="5" fill="#FFD966" stroke="#FFF7E6" stroke-width="1.2"/>
          <circle cx="10" cy="13" r="1.8" fill="#1E140E"/>
        </svg>
      `;
    case 'PROP':
      return `
        <svg class="ws66-glyph-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="3" y="6" width="14" height="11" rx="2.5" fill="#E63B7A" stroke="#FFF7E6" stroke-width="1.3"/>
          <path d="M7 6 V4.5 C7 3.4 8 3 10 3 C12 3 13 3.4 13 4.5 V6" stroke="#FFD966" stroke-width="1.6"/>
          <line x1="3.5" y1="11" x2="16.5" y2="11" stroke="#FFD966" stroke-width="1.4"/>
        </svg>
      `;
    case 'TURNTABLE':
      return `
        <svg class="ws66-glyph-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 2 L12.2 7.8 L18 10 L12.2 12.2 L10 18 L7.8 12.2 L2 10 L7.8 7.8 Z" fill="#FFD966"/>
          <circle cx="10" cy="10" r="2.2" fill="#1E140E"/>
        </svg>
      `;
    case 'AUDIO':
      return `
        <svg class="ws66-glyph-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="2.5" y="9" width="2.8" height="8" rx="1.4" fill="#007D8C"/>
          <rect x="6.8" y="4" width="2.8" height="13" rx="1.4" fill="#F4A91F"/>
          <rect x="11.1" y="6.5" width="2.8" height="10.5" rx="1.4" fill="#E63B7A"/>
          <rect x="15.4" y="10" width="2.8" height="7" rx="1.4" fill="#1E56C5"/>
        </svg>
      `;
    case 'TV':
      return `
        <svg class="ws66-glyph-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="2.5" y="5" width="15" height="11.5" rx="2.5" fill="#1E56C5" stroke="#1E140E" stroke-width="1.4"/>
          <rect x="4.5" y="7" width="9" height="7.5" rx="1.5" fill="#19BFD0"/>
          <path d="M7 2.5 L10 5 L13 2.5" stroke="#1E140E" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `;
    case 'GUIDE':
    default:
      return `
        <svg class="ws66-glyph-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="14" height="14" rx="2.5" fill="#FF6738" stroke="#1E140E" stroke-width="1.3"/>
          <line x1="6.5" y1="7.5" x2="13.5" y2="7.5" stroke="#FFF7E6" stroke-width="1.6" stroke-linecap="round"/>
          <line x1="6.5" y1="10.8" x2="13.5" y2="10.8" stroke="#FFF7E6" stroke-width="1.6" stroke-linecap="round"/>
          <line x1="6.5" y1="14" x2="11" y2="14" stroke="#FFD966" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `;
  }
}

type HubUiSvgIconKind =
  | 'RULES'
  | 'STATS'
  | 'SOUND_ON'
  | 'SOUND_OFF'
  | 'OPTIONS'
  | 'PLAY'
  | 'ANTENNA'
  | 'BOLT'
  | 'BOOTH'
  | 'CROWN'
  | 'SHOWROOM'
  | 'MIC'
  | 'COUCH_DUO'
  | 'PROP_WHEEL'
  | 'TV_GUIDE'
  | 'DAILY_ARCHIVE';

function buildHubUiSvgIcon(kind: HubUiSvgIconKind): string {
  switch (kind) {
    case 'RULES':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#008B94" stroke="#432111" stroke-width="1.5"/><path d="M8.1 7.6C8.1 6.4 9 5.6 10.1 5.6C11.3 5.6 12.2 6.4 12.2 7.5C12.2 8.4 11.6 8.9 10.8 9.4C10.2 9.8 9.9 10.2 9.9 11" stroke="#FAF2DF" stroke-width="1.9" stroke-linecap="round"/><circle cx="10" cy="13.7" r="1.2" fill="#F2A922"/></svg>`;
    case 'STATS':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="10.5" width="3.5" height="6.5" rx="1" fill="#008B94" stroke="#432111" stroke-width="1.1"/><rect x="8.25" y="5" width="3.5" height="12" rx="1" fill="#F2A922" stroke="#432111" stroke-width="1.1"/><rect x="13.5" y="7.5" width="3.5" height="9.5" rx="1" fill="#E6397A" stroke="#432111" stroke-width="1.1"/></svg>`;
    case 'SOUND_ON':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 7.8H6.8L11.2 4.3V15.7L6.8 12.2H3.5V7.8Z" fill="#008B94" stroke="#432111" stroke-width="1.4" stroke-linejoin="round"/><path d="M13.6 7.1C14.7 8.1 15.2 9 15.2 10C15.2 11 14.7 11.9 13.6 12.9" stroke="#5C301B" stroke-width="1.8" stroke-linecap="round"/><path d="M15.8 4.9C17.4 6.3 18.2 8 18.2 10C18.2 12 17.4 13.7 15.8 15.1" stroke="#F2A922" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    case 'SOUND_OFF':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 7.8H6.8L11.2 4.3V15.7L6.8 12.2H3.5V7.8Z" fill="#8B5E3C" stroke="#432111" stroke-width="1.4" stroke-linejoin="round"/><path d="M13.5 7.5L17.5 12.5M17.5 7.5L13.5 12.5" stroke="#E6397A" stroke-width="2" stroke-linecap="round"/></svg>`;
    case 'OPTIONS':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="6.8" fill="#F2A922" stroke="#432111" stroke-width="1.5"/><circle cx="10" cy="10" r="2.7" fill="#FAF2DF" stroke="#432111" stroke-width="1.3"/><path d="M10 1.8V3.7M10 16.3V18.2M1.8 10H3.7M16.3 10H18.2M4.2 4.2L5.6 5.6M14.4 14.4L15.8 15.8M15.8 4.2L14.4 5.6M5.6 14.4L4.2 15.8" stroke="#432111" stroke-width="1.6" stroke-linecap="round"/></svg>`;
    case 'PLAY':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#FAF2DF" fill-opacity="0.22" stroke="#F2A922" stroke-width="1.5"/><polygon points="8,5.8 15,10 8,14.2" fill="#FAF2DF"/></svg>`;
    case 'ANTENNA':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="6.2" width="14" height="10.5" rx="2.5" fill="#FAF2DF" stroke="#432111" stroke-width="1.4"/><rect x="5" y="8.2" width="8.5" height="6.5" rx="1.2" fill="#008B94"/><path d="M6.8 3L10 6.2L13.2 3" stroke="#FAF2DF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15.1" cy="10" r="0.9" fill="#FF6B35"/><circle cx="15.1" cy="12.6" r="0.9" fill="#F2A922"/></svg>`;
    case 'BOLT':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M11.6 2L4.8 11H9.8L8.4 18L15.2 9H10.2L11.6 2Z" fill="#FF6B35" stroke="#432111" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
    case 'BOOTH':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><line x1="6" y1="3.5" x2="6" y2="16.5" stroke="#FAF2DF" stroke-width="1.8" stroke-linecap="round"/><line x1="10" y1="3.5" x2="10" y2="16.5" stroke="#FAF2DF" stroke-width="1.8" stroke-linecap="round"/><line x1="14" y1="3.5" x2="14" y2="16.5" stroke="#FAF2DF" stroke-width="1.8" stroke-linecap="round"/><circle cx="6" cy="7.5" r="2.2" fill="#F2A922" stroke="#432111" stroke-width="1.1"/><circle cx="10" cy="12.5" r="2.2" fill="#008B94" stroke="#FAF2DF" stroke-width="1.1"/><circle cx="14" cy="8.5" r="2.2" fill="#F2A922" stroke="#432111" stroke-width="1.1"/></svg>`;
    case 'CROWN':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 13.5L4.8 6L8.8 10L10 4.5L11.2 10L15.2 6L17 13.5H3Z" fill="#F2A922" stroke="#FAF2DF" stroke-width="1.3" stroke-linejoin="round"/><rect x="3.5" y="14.5" width="13" height="2.4" rx="1.1" fill="#FAF2DF"/></svg>`;
    case 'SHOWROOM':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="7.5" width="14" height="9.5" rx="2" fill="#E6397A" stroke="#432111" stroke-width="1.3"/><rect x="2.3" y="5.2" width="15.4" height="3" rx="1.1" fill="#F2A922" stroke="#432111" stroke-width="1.2"/><line x1="10" y1="5.2" x2="10" y2="17" stroke="#FAF2DF" stroke-width="2"/><path d="M10 5.2C8.2 3 5.8 3.2 6 4.8C6.2 5.6 8.5 5.4 10 5.2ZM10 5.2C11.8 3 14.2 3.2 14 4.8C13.8 5.6 11.5 5.4 10 5.2Z" fill="#FAF2DF"/></svg>`;
    case 'MIC':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="6.8" y="2.2" width="6.4" height="9.6" rx="3.2" fill="#F2A922" stroke="#FAF2DF" stroke-width="1.3"/><line x1="7.8" y1="5.6" x2="12.2" y2="5.6" stroke="#432111" stroke-width="1.2"/><line x1="7.8" y1="8.2" x2="12.2" y2="8.2" stroke="#432111" stroke-width="1.2"/><path d="M4.6 9.4C4.6 12.6 7 14.8 10 14.8C13 14.8 15.4 12.6 15.4 9.4" stroke="#FAF2DF" stroke-width="1.6" stroke-linecap="round"/><path d="M10 14.8V17.6M6.8 17.8H13.2" stroke="#FAF2DF" stroke-width="1.7" stroke-linecap="round"/></svg>`;
    case 'COUCH_DUO':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="7" cy="6.6" r="2.7" fill="#FAF2DF" stroke="#432111" stroke-width="1.1"/><path d="M2.6 16.2C2.6 13.1 4.5 11.2 7 11.2C9.5 11.2 11.4 13.1 11.4 16.2H2.6Z" fill="#FAF2DF" stroke="#432111" stroke-width="1.1" stroke-linejoin="round"/><circle cx="13.4" cy="7.2" r="2.4" fill="#F2A922" stroke="#432111" stroke-width="1.1"/><path d="M10.4 16.2C10.5 13.5 12 11.8 13.8 11.8C15.8 11.8 17.4 13.5 17.4 16.2H10.4Z" fill="#F2A922" stroke="#432111" stroke-width="1.1" stroke-linejoin="round"/></svg>`;
    case 'PROP_WHEEL':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="#F2A922" stroke="#FAF2DF" stroke-width="1.4"/><path d="M10 2.5V17.5M2.5 10H17.5M4.7 4.7L15.3 15.3M15.3 4.7L4.7 15.3" stroke="#432111" stroke-width="1.2"/><circle cx="10" cy="10" r="2.6" fill="#FAF2DF" stroke="#432111" stroke-width="1.2"/></svg>`;
    case 'TV_GUIDE':
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="3.5" width="14" height="13" rx="2.3" fill="#008B94" stroke="#FAF2DF" stroke-width="1.4"/><line x1="6" y1="7.3" x2="14" y2="7.3" stroke="#F2A922" stroke-width="1.8" stroke-linecap="round"/><line x1="6" y1="10.4" x2="14" y2="10.4" stroke="#FAF2DF" stroke-width="1.6" stroke-linecap="round"/><line x1="6" y1="13.4" x2="11.5" y2="13.4" stroke="#FAF2DF" stroke-width="1.6" stroke-linecap="round"/></svg>`;
    case 'DAILY_ARCHIVE':
    default:
      return `<svg class="ws9-ui-svg" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2.6" y="4.5" width="14.8" height="11" rx="2.4" fill="#FAF2DF" stroke="#432111" stroke-width="1.3"/><circle cx="7.1" cy="10" r="2.5" fill="#FF6B35" stroke="#432111" stroke-width="1.1"/><circle cx="12.9" cy="10" r="2.5" fill="#008B94" stroke="#432111" stroke-width="1.1"/><circle cx="7.1" cy="10" r="0.8" fill="#FAF2DF"/><circle cx="12.9" cy="10" r="0.8" fill="#FAF2DF"/></svg>`;
  }
}

function buildColdOpenTwistBadgeSvg(
  kind: 'vault' | 'secret' | 'opponent' | 'mystery',
): string {
  switch (kind) {
    case 'vault':
      return `
        <svg class="ws66-twist-badge-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M9.5 12.5 V9.5 C9.5 6.8 18.5 6.8 18.5 9.5 V12.5" stroke="#FFF7E6" stroke-width="2.8" stroke-linecap="round"/>
          <rect x="6.2" y="12" width="15.6" height="11.5" rx="2.8" fill="#FFF7E6" stroke="#121A2B" stroke-width="1.5"/>
          <circle cx="14" cy="17.2" r="2" fill="#121A2B"/>
          <path d="M14 18.8 V21" stroke="#121A2B" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    case 'secret':
      return `
        <svg class="ws66-twist-badge-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M14 2.8 L16.9 9.5 L24.2 10.2 L18.6 14.9 L20.4 22.1 L14 18.2 L7.6 22.1 L9.4 14.9 L3.8 10.2 L11.1 9.5 Z" fill="#FFF7E6" stroke="#121A2B" stroke-width="1.4" stroke-linejoin="round"/>
          <circle cx="14" cy="13.5" r="2.6" fill="#FF6738"/>
        </svg>
      `;
    case 'opponent':
      return `
        <svg class="ws66-twist-badge-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M5.5 10.5 H19.5 L16 7 M22.5 17.5 H8.5 L12 21" stroke="#FFF7E6" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="7.5" cy="10.5" r="2.2" fill="#FFD966"/>
          <circle cx="20.5" cy="17.5" r="2.2" fill="#FFD966"/>
        </svg>
      `;
    case 'mystery':
    default:
      return `
        <svg class="ws66-twist-badge-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M10.2 10.2 C10.2 7.6 12 6.2 14.4 6.2 C16.9 6.2 18.6 7.7 18.6 9.9 C18.6 11.8 17.3 12.7 15.8 13.7 C14.6 14.5 14 15.2 14 16.8" stroke="#FFF7E6" stroke-width="3" stroke-linecap="round"/>
          <circle cx="14" cy="21.2" r="2.1" fill="#FFD966"/>
        </svg>
      `;
  }
}

function buildDailyRecapTileGlyphSvg(outcome: DailyTileOutcomeV7): string {
  switch (outcome) {
    case 'SECRET_WIN':
      return `
        <svg class="ws66-recap-glyph-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M14 3.2 L16.8 9.6 L23.8 10.3 L18.4 14.8 L20.1 21.8 L14 18 L7.9 21.8 L9.6 14.8 L4.2 10.3 L11.2 9.6 Z" fill="#121A2B"/>
          <path d="M11.2 13.8 L13.2 15.8 L17 11.4" stroke="#FFF7E6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    case 'VAULT_WIN':
      return `
        <svg class="ws66-recap-glyph-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M10.2 12 V8.8 C10.2 6.2 17.8 6.2 17.8 8.8" stroke="#FFF7E6" stroke-width="2.5" stroke-linecap="round"/>
          <rect x="6.5" y="12" width="15" height="11" rx="2.6" fill="#FFF7E6"/>
          <path d="M11 17.5 L13.2 19.7 L17.4 15.1" stroke="#128044" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    case 'MYSTERY_WIN':
      return `
        <svg class="ws66-recap-glyph-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M10.4 9.8 C10.4 7.4 12.1 6 14.4 6 C16.8 6 18.4 7.5 18.4 9.6 C18.4 11.5 17 12.4 15.5 13.4 C14.5 14.1 14 14.8 14 16.3" stroke="#FFF7E6" stroke-width="2.9" stroke-linecap="round"/>
          <circle cx="14" cy="20.8" r="2.1" fill="#FFD966"/>
        </svg>
      `;
    case 'SHOWCASE_WIN':
      return `
        <svg class="ws66-recap-glyph-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="9.2" stroke="#FFF7E6" stroke-width="2.4"/>
          <circle cx="14" cy="14" r="5" stroke="#FFD966" stroke-width="2.2"/>
          <circle cx="14" cy="14" r="2.2" fill="#FFF7E6"/>
        </svg>
      `;
    case 'MISS':
      return `
        <svg class="ws66-recap-glyph-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M8.2 8.2 L19.8 19.8 M19.8 8.2 L8.2 19.8" stroke="#FFF7E6" stroke-width="3.6" stroke-linecap="round"/>
        </svg>
      `;
    case 'WIN':
    default:
      return `
        <svg class="ws66-recap-glyph-svg" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M7.2 14.4 L12 19.2 L21 9.2" stroke="#FFF7E6" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
  }
}

type TrophyCategoryGroupV7 = 'SHOWMANSHIP' | 'BOARD MASTERY' | 'SCOUTING & WIT' | 'DYNASTY';
type TrophyTierBadgeV7 = 'BRONZE MEDAL' | 'SILVER MEDAL' | 'GOLD TROPHY' | 'PLATINUM CROWN';
type MedalRibbonBadgeV7 = 'BRONZE RIBBON' | 'SILVER MEDAL' | 'GOLD MEDAL' | 'PLATINUM SEAL';
type TrophyTierKeyV7 = 'bronze' | 'silver' | 'gold' | 'platinum';

interface ResolvedTrophyShowcaseMetaV7 {
  readonly tierKey: TrophyTierKeyV7;
  readonly tierBadge: TrophyTierBadgeV7;
  readonly categoryGroup: TrophyCategoryGroupV7;
  readonly grindHint: string;
  readonly accentHex: string;
  readonly formLabel: string;
  readonly rarityPoints: number;
}

interface CareerMedalShowcaseItemV7 {
  readonly id: string;
  readonly name: string;
  readonly tierKey: TrophyTierKeyV7;
  readonly tierBadge: MedalRibbonBadgeV7;
  readonly emblemKind:
    | 'STREAK'
    | 'VAULT'
    | 'WHEEL'
    | 'BOLT'
    | 'CLOCK'
    | 'SCOUT'
    | 'TARGET'
    | 'CROWN'
    | 'CALENDAR'
    | 'BADGE'
    | 'TRUNK'
    | 'CASH';
  readonly unlocked: boolean;
  readonly progressText: string;
  readonly progressPct: number;
  readonly unlockRule: string;
}

const TROPHY_CATEGORY_ORDER_V7: readonly ('ALL' | TrophyCategoryGroupV7)[] = [
  'ALL',
  'SHOWMANSHIP',
  'BOARD MASTERY',
  'SCOUTING & WIT',
  'DYNASTY',
];

function resolveTrophyShowcaseMetaV7(spec: TrophySpecV7): ResolvedTrophyShowcaseMetaV7 {
  const canonical = getTrophyDisplayMetaV7(spec.trophyId);
  const tierBadge = canonical.tierBadge;
  const tierKey: TrophyTierKeyV7 =
    tierBadge === 'PLATINUM CROWN'
      ? 'platinum'
      : tierBadge === 'GOLD TROPHY'
        ? 'gold'
        : tierBadge === 'SILVER MEDAL'
          ? 'silver'
          : 'bronze';
  const categoryGroup: TrophyCategoryGroupV7 =
    canonical.categoryGroup === 'CHAMPIONSHIP DYNASTY'
      ? 'DYNASTY'
      : canonical.categoryGroup;

  const rawHint = (spec.unlockRuleText || canonical.grindHint).replace(/^Quick Win:\s*/i, '').trim();

  return {
    tierKey,
    tierBadge,
    categoryGroup,
    grindHint: rawHint || spec.unlockRuleText,
    accentHex: canonical.accentHex || '#FFD966',
    formLabel: canonical.formLabel || spec.subtitle,
    rarityPoints: canonical.rarityPoints || 25,
  };
}

function buildTrophySunlitBadgeHtml(
  sculptKind: TrophySpecV7['sculptKind'],
  unlocked: boolean,
  tierKey: TrophyTierKeyV7,
  accentHex: string,
): string {
  const glyphBySculpt: Record<TrophySpecV7['sculptKind'], string> = {
    RIBBON_MIC: '🎙️',
    TURNTABLE_PLATTER: '📀',
    HEX_STARBURST: '✦',
    VAUDEVILLE_RATCHET: '🎡',
    ISOLATION_RELAY: '📻',
    LARSON_OSCILLOSCOPE: '📺',
    WURLITZER_LYRE: '🎶',
    ROULETTE_ASTROLABE: '🧭',
    GEODESIC_ARMILLARY: '🌐',
    PIRATE_KLYSTRON: '📡',
    SUBPOENA_PENDULUM: '⚖️',
    ESCAPEMENT_CROWN: '👑',
  };
  const glyph = unlocked ? (glyphBySculpt[sculptKind] ?? '🏆') : '🔒';
  const tag = unlocked ? tierKey.toUpperCase().slice(0, 4) : 'LOCK';
  const borderStyle = unlocked ? `border-color:${accentHex};` : '';
  return `
    <div class="ws9-trophy-medallion" data-unlocked="${unlocked}" data-tier="${tierKey}" style="${borderStyle}" aria-hidden="true">
      <span class="ws9-trophy-medallion-glyph">${glyph}</span>
      <span class="ws9-trophy-medallion-tag">${tag}</span>
    </div>
  `;
}

function buildCareerMedalRibbonSvg(
  tierKey: TrophyTierKeyV7,
  unlocked: boolean,
  emblemKind: CareerMedalShowcaseItemV7['emblemKind'] = 'CROWN',
): string {
  const stripeMap: Record<TrophyTierKeyV7, [string, string, string]> = {
    bronze: ['#A85A28', '#F2B279', '#6E3514'],
    silver: ['#1E56C5', '#E3EEF9', '#0D2C68'],
    gold: ['#008B94', '#FFD966', '#E63B7A'],
    platinum: ['#E63B7A', '#FFFFFF', '#19BFD0'],
  };
  const [c1, c2, c3] = unlocked ? stripeMap[tierKey] : ['#8B5E3C', '#EDE0C4', '#5C301B'];
  const coinFill = unlocked
    ? tierKey === 'platinum'
      ? '#EEF4FC'
      : tierKey === 'gold'
        ? '#FFD966'
        : tierKey === 'silver'
          ? '#D6E4F2'
          : '#E89D5B'
    : '#DECBB0';
  const ink = unlocked ? '#1E140E' : '#5C301B';

  let centerGlyph = '';
  switch (emblemKind) {
    case 'STREAK':
      centerGlyph = `<path d="M26 28 C29 31 31 34 30 38 C29.2 40.5 27.8 42 26 42 C23.6 42 22 40 22 37.5 C22 35 24 33 24.4 31.2 C25.2 32 25.4 32.8 25.4 32.8 C25.4 32.8 25.4 30 26 28 Z" fill="${ink}"/>`;
      break;
    case 'VAULT':
      centerGlyph = `<rect x="21" y="34" width="10" height="7" rx="1.6" fill="${ink}"/><path d="M23 34 V31.8 C23 29.8 29 29.8 29 31.8 V34" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>`;
      break;
    case 'WHEEL':
      centerGlyph = `<circle cx="26" cy="36" r="6.5" stroke="${ink}" stroke-width="1.8"/><path d="M26 29.5 V42.5 M19.5 36 H32.5 M21.5 31.5 L30.5 40.5 M30.5 31.5 L21.5 40.5" stroke="${ink}" stroke-width="1.3"/>`;
      break;
    case 'BOLT':
      centerGlyph = `<path d="M27.5 28.5 L21.5 36.8 H25.8 L24.5 43.2 L30.5 34.8 H26.2 Z" fill="${ink}"/>`;
      break;
    case 'CLOCK':
      centerGlyph = `<circle cx="26" cy="36" r="6.4" stroke="${ink}" stroke-width="1.8"/><path d="M26 32 V36.2 L29.2 38" stroke="${ink}" stroke-width="1.8" stroke-linecap="round"/>`;
      break;
    case 'SCOUT':
      centerGlyph = `<circle cx="24.5" cy="34.5" r="4.5" stroke="${ink}" stroke-width="1.9"/><line x1="27.8" y1="37.8" x2="31.5" y2="41.5" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`;
      break;
    case 'TARGET':
      centerGlyph = `<circle cx="26" cy="36" r="6.4" stroke="${ink}" stroke-width="1.6"/><circle cx="26" cy="36" r="3.4" stroke="${ink}" stroke-width="1.5"/><circle cx="26" cy="36" r="1.4" fill="${ink}"/>`;
      break;
    case 'CALENDAR':
      centerGlyph = `<rect x="20" y="31" width="12" height="10" rx="1.8" stroke="${ink}" stroke-width="1.8"/><line x1="20" y1="34.5" x2="32" y2="34.5" stroke="${ink}" stroke-width="1.6"/><text x="26" y="39.8" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="6.5" fill="${ink}">7</text>`;
      break;
    case 'BADGE':
      centerGlyph = `<path d="M26 29 L31.5 31.5 V36.5 C31.5 39.5 29 41.5 26 42.5 C23 41.5 20.5 39.5 20.5 36.5 V31.5 Z" stroke="${ink}" stroke-width="1.8" fill="none"/><path d="M23.5 36 L25.3 37.8 L28.8 34" stroke="${ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;
    case 'TRUNK':
      centerGlyph = `<rect x="20" y="33" width="12" height="8" rx="1.6" stroke="${ink}" stroke-width="1.8"/><path d="M23.5 33 V31 C23.5 30 28.5 30 28.5 31 V33 M20 36.8 H32" stroke="${ink}" stroke-width="1.5"/>`;
      break;
    case 'CASH':
      centerGlyph = `<text x="26" y="40.5" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="13.5" fill="${ink}">$</text>`;
      break;
    case 'CROWN':
    default:
      centerGlyph = `<path d="M20 39 L21.5 32 L24.8 35.5 L26 30.5 L27.2 35.5 L30.5 32 L32 39 Z" fill="${ink}"/>`;
      break;
  }

  return `
    <svg class="ws66-medal-ribbon-svg" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect x="10" y="4" width="32" height="18" rx="3" fill="${c1}" stroke="${unlocked ? '#FFD966' : '#6E3B23'}" stroke-width="1.6"/>
      <rect x="19" y="4" width="14" height="18" fill="${c2}"/>
      <rect x="23.5" y="4" width="5" height="18" fill="${c3}"/>
      <rect x="8" y="19" width="36" height="4" rx="2" fill="${unlocked ? '#F4A91F' : '#8B5E3C'}"/>
      <circle cx="26" cy="36" r="12" fill="${coinFill}" stroke="${unlocked ? '#1E140E' : '#6E3B23'}" stroke-width="2"/>
      ${centerGlyph}
    </svg>
  `;
}

function computeCareerMedalsV7(
  save?: CampaignSaveStateV7,
  dailySave?: DailyBroadcastSaveV7 | null,
): readonly CareerMedalShowcaseItemV7[] {
  const played = Math.max(0, save?.episodesPlayed ?? 0);
  const won = Math.max(0, save?.episodesWon ?? 0);
  const crown = Math.max(0, save?.returningChampStreak ?? 0);
  const dailyPlayed = Math.max(0, dailySave?.gamesPlayed ?? 0);
  const dailyBest = Math.max(0, dailySave?.bestStreak ?? dailySave?.currentStreak ?? 0);
  const arrests = Math.max(0, save?.boothArrestsCount ?? 0);
  const burned = Math.max(0, save?.canaryBurnedCount ?? 0);
  const relics = save?.equippedRelics.length ?? 0;
  const purse = Math.max(0, Math.floor(save?.cleanPurseCash ?? 0));
  const retiredLiens = Math.max(0, Math.min(12, Math.floor(save?.lienSegmentsPaid ?? 0)));
  const totalCleanEarned = purse + retiredLiens * LIEN_SEGMENT_COST_CASH_V7;
  const endings = save?.unlockedEndings.length ?? 0;

  let scoutedWeakCount = 0;
  if (save?.scoutingNotebook) {
    for (const entry of Object.values(save.scoutingNotebook)) {
      scoutedWeakCount += entry.revealedWeak?.length ?? 0;
    }
  }

  const pct = (cur: number, target: number): number =>
    Math.max(0, Math.min(100, Math.round((cur / Math.max(1, target)) * 100)));

  // 8 Canonical In-Match Broadcast Medals (synced 1:1 with Winner's Check Ceremony!)
  const matchMedalOrder: readonly {
    readonly id: CareerMedalIdV7;
    readonly emblemKind: CareerMedalShowcaseItemV7['emblemKind'];
  }[] = [
    { id: 'SHUTOUT_STREAK', emblemKind: 'STREAK' },
    { id: 'SAFE_CRACKER', emblemKind: 'VAULT' },
    { id: 'WHEEL_HIGH_ROLLER', emblemKind: 'WHEEL' },
    { id: 'GREMLIN_DODGER', emblemKind: 'BOLT' },
    { id: 'CLUTCH_TURN10_WINNER', emblemKind: 'CLOCK' },
    { id: 'SCOUTING_DETECTIVE', emblemKind: 'SCOUT' },
    { id: 'NO_LIFELINE_PURIST', emblemKind: 'TARGET' },
    { id: 'RETURNING_CHAMP_CROWN', emblemKind: 'CROWN' },
  ];
  const medalRibbonLabel = (tierKey: TrophyTierKeyV7): MedalRibbonBadgeV7 =>
    tierKey === 'platinum'
      ? 'PLATINUM SEAL'
      : tierKey === 'gold'
        ? 'GOLD MEDAL'
        : tierKey === 'silver'
          ? 'SILVER MEDAL'
          : 'BRONZE RIBBON';

  const liveMatchMedals: CareerMedalShowcaseItemV7[] = matchMedalOrder.map(({ id: medalId, emblemKind }) => {
    const spec = CAREER_MEDAL_SPECS_V7[medalId];
    const count = Math.max(0, save?.careerMedalCounts?.[medalId] ?? 0);
    const tierKey: TrophyTierKeyV7 =
      spec.tier === 'PLATINUM CROWN'
        ? 'platinum'
        : spec.tier === 'GOLD TROPHY'
          ? 'gold'
          : spec.tier === 'SILVER MEDAL'
            ? 'silver'
            : 'bronze';
    const inferredUnlocked =
      count > 0 ||
      (medalId === 'RETURNING_CHAMP_CROWN' && crown >= 2) ||
      (medalId === 'SCOUTING_DETECTIVE' && scoutedWeakCount >= 1);
    return {
      id: `match_${medalId}`,
      name: spec.name.toUpperCase(),
      tierKey,
      tierBadge: medalRibbonLabel(tierKey),
      emblemKind,
      unlocked: inferredUnlocked,
      progressText:
        count > 0
          ? `×${count} EARNED · +$${spec.bonusCash}`
          : inferredUnlocked
            ? `AWARDED · +$${spec.bonusCash}`
            : `+$${spec.bonusCash} PURSE BONUS`,
      progressPct: inferredUnlocked ? 100 : 0,
      unlockRule: spec.summary,
    };
  });

  // Plus 4 Long-Arc Career Dynasty & Daily Milestones
  const dynastyMilestones: CareerMedalShowcaseItemV7[] = [
    {
      id: 'medal_daily_week',
      name: 'SEVEN-DAY LIVING COLOR STREAK',
      tierKey: 'gold',
      tierBadge: 'GOLD MEDAL',
      emblemKind: 'CALENDAR',
      unlocked: dailyBest >= 7,
      progressText: `${Math.min(dailyBest, 7)} / 7 DAYS`,
      progressPct: pct(dailyBest, 7),
      unlockRule: 'Reach a 7-day Global Daily 1966 Broadcast streak.',
    },
    {
      id: 'medal_whistleblower',
      name: 'CONTROL BOOTH DETECTIVE',
      tierKey: 'silver',
      tierBadge: 'SILVER MEDAL',
      emblemKind: 'BADGE',
      unlocked: arrests >= 1 || burned >= 1,
      progressText: `${Math.min(arrests + burned, 1)} / 1 EXPOSED`,
      progressPct: pct(arrests + burned, 1),
      unlockRule: 'Bust a live Control Booth cheat tell or burn a poisoned Canary note.',
    },
    {
      id: 'medal_full_trunk',
      name: 'FIVE-SLOT SYNERGY BUILDER',
      tierKey: 'gold',
      tierBadge: 'GOLD MEDAL',
      emblemKind: 'TRUNK',
      unlocked: relics >= MAX_TRUNK_SLOTS_V7,
      progressText: `${Math.min(relics, MAX_TRUNK_SLOTS_V7)} / ${MAX_TRUNK_SLOTS_V7} PROPS`,
      progressPct: pct(relics, MAX_TRUNK_SLOTS_V7),
      unlockRule: 'Fill all 5 Velvet Prop Trunk slots for maximum Chips × Mult synergy.',
    },
    {
      id: 'medal_quarter_million',
      name: '$222K GRAND PURSE LEGEND',
      tierKey: 'platinum',
      tierBadge: 'PLATINUM SEAL',
      emblemKind: 'CASH',
      unlocked: totalCleanEarned >= 222000 || endings >= 1,
      progressText: `$${Math.min(totalCleanEarned, 222000).toLocaleString()} / $222,000`,
      progressPct: endings >= 1 ? 100 : pct(totalCleanEarned, 222000),
      unlockRule: 'Earn $222,000 cumulative Clean Purse cash (including Buyout spokes) or unlock a Season 4 Finale ending.',
    },
  ];

  // Keep local telemetry variables utilized cleanly
  void played;
  void won;
  void dailyPlayed;

  return [...liveMatchMedals, ...dynastyMilestones];
}

function buildColdOpenBeatArtSvg(beat: 0 | 1 | 2): string {
  if (beat === 0) {
    return `
      <svg viewBox="0 0 110 80" fill="none" aria-hidden="true">
        <circle cx="55" cy="40" r="34" fill="#3E2012" fill-opacity="0.35"/>
        <path d="M24 26 A36 36 0 0 1 86 26" stroke="#FFD966" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M33 34 A24 24 0 0 1 77 34" stroke="#FF6738" stroke-width="3.5" stroke-linecap="round"/>
        <rect x="30" y="38" width="50" height="28" rx="6" fill="#FFF7E6"/>
        <circle cx="55" cy="52" r="9.5" fill="#1E56C5"/>
        <circle cx="55" cy="52" r="4.5" fill="#19BFD0"/>
        <circle cx="71" cy="44" r="3.5" fill="#E03E36"/>
        <path d="M46 38 L55 24 L64 38" stroke="#FFF7E6" stroke-width="3" stroke-linejoin="round"/>
      </svg>
    `;
  }
  if (beat === 1) {
    return `
      <svg viewBox="0 0 110 80" fill="none" aria-hidden="true">
        <rect x="10" y="10" width="42" height="27" rx="6" fill="#FFF7E6"/>
        <text x="31" y="29" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="14" fill="#121A2B">$300</text>
        <rect x="58" y="10" width="42" height="27" rx="6" fill="#F4A91F"/>
        <text x="79" y="29" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="15" fill="#121A2B">★2X</text>
        <rect x="10" y="43" width="42" height="27" rx="6" fill="#E63B7A"/>
        <text x="31" y="62" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="16" fill="#FFF7E6">?</text>
        <rect x="58" y="43" width="42" height="27" rx="6" fill="#1E56C5"/>
        <text x="79" y="62" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="14" fill="#FFD966">$500</text>
      </svg>
    `;
  }
  return `
    <svg viewBox="0 0 110 80" fill="none" aria-hidden="true">
      <circle cx="42" cy="42" r="27" fill="#FFF7E6"/>
      <circle cx="42" cy="42" r="22" fill="#3E2012"/>
      <path d="M42 25 A17 17 0 1 1 26 48" stroke="#19BFD0" stroke-width="5" stroke-linecap="round"/>
      <text x="42" y="47" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="14" fill="#FFD966">30s</text>
      <path d="M84 14 L88 27 L101 27 L91 35 L95 48 L84 40 L73 48 L77 35 L67 27 L80 27 Z" fill="#FFD966"/>
      <rect x="64" y="52" width="40" height="18" rx="4" fill="#FFF7E6"/>
      <text x="84" y="66" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="14" fill="#121A2B">WIN!</text>
    </svg>
  `;
}

// ----------------------------------------------------------------------------
// 3B. R3 Custom Broadcast Booth (6 Vibe Packs + 3 Red Category Veto Stamps)
// ----------------------------------------------------------------------------

export interface CustomBroadcastBoothOptionsV9 {
  readonly modeLabel?: string;
  readonly isDailyBroadcast?: boolean;
  readonly isBlitz?: boolean;
  readonly initialConfig?: BroadcastBoothConfigV9;
  readonly countUnseenAvailableClues?: (opts: {
    readonly vibePackId?: VibePackIdV9;
    readonly vetoedCategories?: readonly CategoryIdV7[];
    readonly isBlitz?: boolean;
  }) => number;
  readonly onTapSfx?: () => void;
  readonly onChange?: (config: BroadcastBoothConfigV9) => void;
  readonly onLaunch?: (config: BroadcastBoothConfigV9) => void;
  readonly onClose?: () => void;
}

const DEFAULT_BOOTH_CONFIG_V9: BroadcastBoothConfigV9 = {
  vibePackId: 'PRIMETIME_LIVING_COLOR',
  vetoedCategories: [],
};

export function mountCustomBroadcastBoothPanelV9(
  container: HTMLElement,
  opts: CustomBroadcastBoothOptionsV9 = {},
): { readonly getConfig: () => BroadcastBoothConfigV9 } {
  const isDaily = Boolean(opts.isDailyBroadcast);
  let activePackId: VibePackIdV9 =
    opts.initialConfig?.vibePackId ?? DEFAULT_BOOTH_CONFIG_V9.vibePackId;
  let vetoed: CategoryIdV7[] = [...(opts.initialConfig?.vetoedCategories ?? [])].slice(0, 3);

  const root = document.createElement('div');
  root.className = 'ws9-booth-panel';
  root.style.display = 'flex';
  root.style.flexDirection = 'column';
  root.style.gap = '10px';

  const getPackCategories = (packId: VibePackIdV9): readonly CategoryIdV7[] =>
    VIBE_PACK_CATEGORIES_V9[packId] ?? ALL_CATEGORIES_V7;

  const sanitizeVetosForPack = (packId: VibePackIdV9, list: CategoryIdV7[]): CategoryIdV7[] => {
    const allowed = new Set(getPackCategories(packId));
    const filtered = list.filter((c) => allowed.has(c));
    while (getPackCategories(packId).length - filtered.length < 3 && filtered.length > 0) {
      filtered.pop();
    }
    return filtered.slice(0, 3);
  };

  vetoed = sanitizeVetosForPack(activePackId, vetoed);

  const currentConfig = (): BroadcastBoothConfigV9 => ({
    vibePackId: activePackId,
    vetoedCategories: [...vetoed],
  });

  const render = (warningMsg?: string): void => {
    root.innerHTML = '';

    if (isDaily) {
      const lockBanner = document.createElement('div');
      lockBanner.className = 'ws9-pill-badge';
      lockBanner.style.width = '100%';
      lockBanner.style.justifyContent = 'center';
      lockBanner.style.padding = '10px 12px';
      lockBanner.textContent =
        '📡 GLOBAL DAILY SEED · IDENTICAL FOR ALL PLAYERS (VIBE & VETOS LOCKED)';
      root.appendChild(lockBanner);
      return;
    }

    const headRow = document.createElement('div');
    headRow.style.display = 'flex';
    headRow.style.flexWrap = 'wrap';
    headRow.style.alignItems = 'center';
    headRow.style.justifyContent = 'space-between';
    headRow.style.gap = '6px';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'ws66-qp-label';
    titleSpan.textContent = 'CUSTOM BROADCAST BOOTH · 6 VIBE PACKS';

    const poolCats = getPackCategories(activePackId);
    const remainingCats = poolCats.length - vetoed.length;
    const unseenCount = opts.countUnseenAvailableClues
      ? opts.countUnseenAvailableClues({
          vibePackId: activePackId,
          vetoedCategories: vetoed,
          isBlitz: opts.isBlitz,
        })
      : Math.max(120, remainingCats * 480);

    const statusPill = document.createElement('span');
    statusPill.className = 'ws9-pill-badge';
    statusPill.textContent = `${vetoed.length}/3 VETOED · ${remainingCats} TOPICS · ${unseenCount.toLocaleString()} CLUES`;
    headRow.append(titleSpan, statusPill);
    root.appendChild(headRow);

    if (warningMsg) {
      const warn = document.createElement('div');
      warn.className = 'ws9-pill-badge';
      warn.style.background = '#fde8e8';
      warn.style.borderColor = '#b91c1c';
      warn.style.color = '#7f1d1d';
      warn.textContent = warningMsg;
      root.appendChild(warn);
    }

    const vibeGrid = document.createElement('div');
    vibeGrid.className = 'ws9-vibe-grid';

    for (const pack of VIBE_PACK_CATALOG_V9) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'ws9-vibe-card';
      card.dataset.vibePack = pack.packId;
      card.dataset.active = String(pack.packId === activePackId);
      card.style.borderTop = `4px solid ${pack.accentHex}`;
      card.innerHTML = `
        <strong style="font-size:13px;line-height:1.15;">${pack.title}</strong>
        <span style="font-size:11.5px;opacity:0.86;line-height:1.25;">${pack.tagline}</span>
      `;
      card.addEventListener('click', () => {
        opts.onTapSfx?.();
        activePackId = pack.packId;
        vetoed = sanitizeVetosForPack(activePackId, vetoed);
        opts.onChange?.(currentConfig());
        render();
      });
      vibeGrid.appendChild(card);
    }
    root.appendChild(vibeGrid);

    const vetoLabel = document.createElement('div');
    vetoLabel.style.fontSize = '12px';
    vetoLabel.style.fontWeight = '800';
    vetoLabel.style.color = 'var(--ws9-walnut-deep, #5c301b)';
    vetoLabel.textContent =
      'RED CATEGORY VETO STAMPS (TAP UP TO 3 TO EXCLUDE · KEEPS >= 3 TOPICS & >= 120 UNSEEN CLUES):';
    root.appendChild(vetoLabel);

    const vetoGrid = document.createElement('div');
    vetoGrid.className = 'ws9-veto-grid';

    for (const cat of poolCats) {
      const isVetoed = vetoed.includes(cat);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'ws9-veto-chip';
      chip.dataset.category = cat;
      chip.dataset.vetoed = String(isVetoed);
      chip.innerHTML = `
        <span>${getFriendlyTvCategoryLabelV7(cat)}</span>
        ${isVetoed ? '<span class="ws9-veto-stamp" aria-hidden="true">VETOED</span>' : ''}
      `;
      chip.addEventListener('click', () => {
        opts.onTapSfx?.();
        if (isVetoed) {
          vetoed = vetoed.filter((c) => c !== cat);
          opts.onChange?.(currentConfig());
          render();
          return;
        }
        if (vetoed.length >= 3) {
          render('MAX 3 RED VETO STAMPS ALLOWED — TAP A STAMPED TOPIC TO UNDO.');
          return;
        }
        if (poolCats.length - (vetoed.length + 1) < 3) {
          render('AT LEAST 3 CATEGORIES MUST REMAIN ACTIVE IN THE SHOW.');
          return;
        }
        const nextVetos = [...vetoed, cat];
        if (opts.countUnseenAvailableClues) {
          const nextUnseen = opts.countUnseenAvailableClues({
            vibePackId: activePackId,
            vetoedCategories: nextVetos,
            isBlitz: opts.isBlitz,
          });
          if (nextUnseen < 120) {
            render(
              `CANNOT VETO ${getFriendlyTvCategoryLabelV7(cat)} — POOL WOULD DROP TO ${nextUnseen} (< 120 UNSEEN CLUES).`,
            );
            return;
          }
        }
        vetoed = nextVetos;
        opts.onChange?.(currentConfig());
        render();
      });
      vetoGrid.appendChild(chip);
    }
    root.appendChild(vetoGrid);
  };

  render();
  container.appendChild(root);

  return {
    getConfig: currentConfig,
  };
}

export function openCustomBroadcastBoothV9(
  host: HTMLElement,
  opts: CustomBroadcastBoothOptionsV9 = {},
): Promise<BroadcastBoothConfigV9 | null> {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'ws9-modal-backdrop';

    const sheet = document.createElement('section');
    sheet.className = 'ws9-booth-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Custom Broadcast Booth');

    const header = document.createElement('header');
    header.className = 'ws9-shell-header';
    header.innerHTML = `
      <div>
        <div class="ws9-shell-kicker">STUDIO 6A CONTROL BOOTH · ${opts.modeLabel ?? 'SHOW SETUP'}</div>
        <h2 class="ws9-shell-title">CUSTOM BROADCAST BOOTH</h2>
      </div>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ws9-btn ws9-btn-cream';
    closeBtn.textContent = '✕ BACK';

    let settled = false;
    const finish = (cfg: BroadcastBoothConfigV9 | null): void => {
      if (settled) return;
      settled = true;
      window.removeEventListener('keydown', onKey);
      backdrop.remove();
      if (cfg) {
        opts.onLaunch?.(cfg);
      } else {
        opts.onClose?.();
      }
      resolve(cfg);
    };

    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        finish(null);
      }
    };
    window.addEventListener('keydown', onKey);

    closeBtn.addEventListener('click', () => {
      opts.onTapSfx?.();
      finish(null);
    });
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'ws9-shell-body';

    const boothHandle = mountCustomBroadcastBoothPanelV9(body, opts);

    const footer = document.createElement('footer');
    footer.className = 'ws9-shell-footer';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'ws9-btn ws9-btn-cream';
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.addEventListener('click', () => {
      opts.onTapSfx?.();
      finish(null);
    });

    const launchBtn = document.createElement('button');
    launchBtn.type = 'button';
    launchBtn.className = 'ws9-btn ws9-btn-tangerine';
    launchBtn.dataset.action = 'launch-booth';
    launchBtn.textContent = opts.isBlitz ? '⚡ START 60s BLITZ ▸' : '🎙️ LOCK BOOTH & PLAY ▸';
    launchBtn.addEventListener('click', () => {
      opts.onTapSfx?.();
      finish(boothHandle.getConfig());
    });

    footer.append(cancelBtn, launchBtn);
    sheet.append(header, body, footer);
    backdrop.appendChild(sheet);
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) finish(null);
    });
    host.appendChild(backdrop);
  });
}

// ----------------------------------------------------------------------------
// 4. TitleAndOnboardingControllerV7 — Master Controller
// ----------------------------------------------------------------------------

export class TitleAndOnboardingControllerV7 {
  private readonly host: HTMLElement;
  private callbacks: TitleAndOnboardingCallbacksV7;
  private readonly rootEl: HTMLDivElement;
  private readonly spectrumEl: HTMLDivElement;
  private readonly stageLayerEl: HTMLDivElement;
  private readonly toastEl: HTMLDivElement;

  private lastHubData: TitleHubViewDataV7 = {};
  private hasPlayedColdBootIntro = false;
  private audioUnlocked = false;
  private detachAudioUnlockListeners: (() => void) | null = null;
  private selectedQuickMode: BoardPlayModeV9 | 'SURPRISE_MIX' = 'SURPRISE_MIX';
  private selectedQuickDifficulty: DifficultyModeV7 = 'PRIMETIME_NORMAL';
  private selectedQuickTimerMode: QuestionTimerModeV8 = 30;
  private selectedBoothConfig: BroadcastBoothConfigV9 = { ...DEFAULT_BOOTH_CONFIG_V9 };
  private hasUserChosenDifficulty = false;
  private hasUserChosenTimer = false;
  private activeTuneInEl: HTMLDivElement | null = null;
  private activeTuneInTimerId: number | null = null;
  private activeTuneInCleanup: (() => void) | null = null;
  private toastTimerId: number | null = null;
  private activeKeyHandler: ((ev: KeyboardEvent) => void) | null = null;
  private activeColdOpenResolve: (() => void) | null = null;
  private activeDailyResolve: ((res: DailyModalActionResultV7) => void) | null = null;
  private activeView: 'NONE' | 'TITLE_HUB' | 'COLD_OPEN' | 'HOW_TO_PLAY' | 'BACKSTAGE' | 'QUICK_PLAY' | 'DAILY_RESULT' = 'NONE';

  constructor(host: HTMLElement, callbacks: TitleAndOnboardingCallbacksV7 = {}) {
    this.host = host;
    this.callbacks = callbacks;

    this.rootEl = document.createElement('div');
    this.rootEl.className = 'ws66-root ws66-hidden';
    this.rootEl.dataset.reducedMotion = 'false';

    this.spectrumEl = document.createElement('div');
    this.spectrumEl.className = 'ws66-spectrum-bar';

    this.stageLayerEl = document.createElement('div');
    this.stageLayerEl.className = 'ws66-stage-layer';

    this.toastEl = document.createElement('div');
    this.toastEl.className = 'ws66-toast ws66-hidden';
    this.toastEl.setAttribute('role', 'status');
    this.toastEl.setAttribute('aria-live', 'polite');

    this.rootEl.append(this.spectrumEl, this.stageLayerEl, this.toastEl);
    this.host.appendChild(this.rootEl);

    if (typeof document !== 'undefined') {
      const onFsChange = (): void => {
        this.syncTitleFullscreenButtons();
      };
      document.addEventListener('fullscreenchange', onFsChange);
      document.addEventListener('webkitfullscreenchange', onFsChange as EventListener);
      this.detachFsListener = () => {
        document.removeEventListener('fullscreenchange', onFsChange);
        document.removeEventListener('webkitfullscreenchange', onFsChange as EventListener);
      };
    }
  }

  private detachFsListener: (() => void) | null = null;
  private isCheckingForUpdate = false;
  private hasConsumedPostUpdateBanner = false;

  private extractModuleAssetBasename(srcValue: string): string {
    const clean = srcValue.split('?')[0]?.split('#')[0] ?? '';
    const parts = clean.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : clean;
  }

  private checkAndConsumeUpdatedUrlFlag(): void {
    if (this.hasConsumedPostUpdateBanner || typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('ws_updated')) return;
      this.hasConsumedPostUpdateBanner = true;
      url.searchParams.delete('ws_updated');
      const cleanedSearch = url.searchParams.toString();
      const cleanedTarget = `${url.pathname}${cleanedSearch ? `?${cleanedSearch}` : ''}${url.hash || ''}`;
      if (window.history && typeof window.history.replaceState === 'function') {
        window.history.replaceState(window.history.state, '', cleanedTarget);
      }
      this.showToast('✓ STUDIO BUILD UPDATED & READY', 2800);
    } catch {
      // Ignore restricted history/URL environments (e.g., sandboxed frames)
    }
  }

  private async triggerCheckForUpdate(btn: HTMLButtonElement): Promise<void> {
    if (this.isCheckingForUpdate) return;
    this.isCheckingForUpdate = true;
    this.callbacks.onUiTapSfx?.();

    btn.classList.add('is-checking');
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    const longLabel = btn.querySelector<HTMLElement>('.ws66-update-label-long');
    const shortLabel = btn.querySelector<HTMLElement>('.ws66-update-label-short');
    if (longLabel) longLabel.textContent = 'CHECKING FEED...';
    if (shortLabel) shortLabel.textContent = 'CHECKING...';

    let hasNewHash = false;
    try {
      const runningModuleScript = Array.from(
        document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]'),
      ).find((s) => Boolean(s.getAttribute('src')));
      const runningAsset = runningModuleScript
        ? this.extractModuleAssetBasename(runningModuleScript.getAttribute('src') ?? '')
        : '';

      if (typeof fetch === 'function' && window.location.protocol !== 'file:') {
        const controller = typeof AbortController === 'function' ? new AbortController() : null;
        const abortTimer = controller
          ? window.setTimeout(() => controller.abort(), 4500)
          : null;
        try {
          const resp = await fetch(`./index.html?_ws_chk=${Date.now()}`, {
            cache: 'no-store',
            ...(controller ? { signal: controller.signal } : {}),
          });
          if (resp.ok) {
            const html = await resp.text();
            const matchA = html.match(
              /<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["']/i,
            );
            const matchB = html.match(
              /<script[^>]+src=["']([^"']+)["'][^>]+type=["']module["']/i,
            );
            const liveSrc = matchA?.[1] ?? matchB?.[1] ?? '';
            const liveAsset = liveSrc ? this.extractModuleAssetBasename(liveSrc) : '';
            if (runningAsset && liveAsset && runningAsset !== liveAsset) {
              hasNewHash = true;
            }
          }
        } finally {
          if (abortTimer !== null) window.clearTimeout(abortTimer);
        }
      }
    } catch {
      // Fall through cleanly to cache purge + fresh network reload
    }

    // 100% Save-Safe: NEVER touch localStorage! Unregister SWs & clear asset caches under a strict 1.2s ceiling
    // (avoiding reg.update(), which can hang indefinitely on activated localhost/PWA Service Workers!).
    const purgeSwAndCaches = (async () => {
      if (typeof navigator !== 'undefined' && navigator.serviceWorker?.getRegistrations) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.allSettled(regs.map((reg) => reg.unregister()));
        } catch {
          // Ignore SW errors in restricted environments
        }
      }

      if (typeof window !== 'undefined' && 'caches' in window && window.caches?.keys) {
        try {
          const cacheKeys = await window.caches.keys();
          await Promise.allSettled(cacheKeys.map((key) => window.caches.delete(key)));
        } catch {
          // Ignore Cache API errors in restricted environments
        }
      }
    })();

    await Promise.race([
      purgeSwAndCaches,
      new Promise<void>((resolve) => window.setTimeout(resolve, 1200)),
    ]);

    this.showToast(
      hasNewHash
        ? '✓ NEW UPDATE READY — REFRESHING STUDIO FEED!'
        : '✓ REFRESHING LATEST STUDIO BUILD — PROGRESS SAVED!',
      2000,
    );

    window.setTimeout(() => {
      try {
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('ws_updated', String(Date.now()));
        window.location.replace(nextUrl.toString());
      } catch {
        window.location.reload();
      }
    }, 450);
  }

  private syncTitleFullscreenButtons(): void {
    const active = isDocumentFullscreenV7();
    const btns = this.rootEl.querySelectorAll<HTMLButtonElement>('[data-action="toggle-fullscreen"]');
    btns.forEach((btn) => {
      btn.dataset.active = active ? 'true' : 'false';
      btn.title = active ? 'Exit Full Screen (Esc / F)' : 'Enter Full Screen (F)';
      const lbl = btn.querySelector('.ws66-fs-label');
      if (lbl) {
        lbl.textContent = active ? 'EXIT FULL' : 'FULL SCREEN';
      }
      const ico = btn.querySelector('.ws66-fs-icon');
      if (ico) {
        ico.textContent = active ? '🗗' : '⛶';
      }
    });
  }

  private async triggerTitleFullscreenToggle(): Promise<void> {
    this.callbacks.onUiTapSfx?.();
    if (this.callbacks.onToggleFullscreen) {
      this.callbacks.onToggleFullscreen();
      window.setTimeout(() => this.syncTitleFullscreenButtons(), 100);
      return;
    }
    const res = await toggleDocumentFullscreenV7();
    this.syncTitleFullscreenButtons();
    if (!res.ok && res.reason === 'UNSUPPORTED_IOS') {
      this.showToast('📱 ON IPHONE: TAP SHARE → “ADD TO HOME SCREEN” FOR FULL SCREEN!');
    }
  }

  public setCallbacks(callbacks: TitleAndOnboardingCallbacksV7): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public setReducedMotion(reduced: boolean): void {
    this.rootEl.dataset.reducedMotion = reduced ? 'true' : 'false';
  }

  private isReducedMotionActive(): boolean {
    if (this.rootEl.dataset.reducedMotion === 'true') return true;
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }

  public isVisible(): boolean {
    return this.activeView !== 'NONE';
  }

  public hasCompletedColdOpen(): boolean {
    try {
      return window.localStorage.getItem(COLD_OPEN_SEEN_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  public markColdOpenCompleted(): void {
    try {
      window.localStorage.setItem(COLD_OPEN_SEEN_STORAGE_KEY, '1');
    } catch {
      // Ignore private browsing storage restrictions
    }
  }

  public resetColdOpenSeen(): void {
    try {
      window.localStorage.removeItem(COLD_OPEN_SEEN_STORAGE_KEY);
    } catch {
      // Ignore private browsing storage restrictions
    }
  }

  public setAudioUnlocked(unlocked: boolean): void {
    this.audioUnlocked = Boolean(unlocked);
    if (this.audioUnlocked) {
      this.dismissOrchestraUnlockPill();
    }
  }

  private dismissOrchestraUnlockPill(): void {
    this.detachAudioUnlockListeners?.();
    this.detachAudioUnlockListeners = null;
    const pill = this.rootEl.querySelector<HTMLElement>('[data-role="orchestra-unlock-pill"]');
    if (!pill || pill.dataset.unlocked === 'true') return;
    pill.dataset.unlocked = 'true';
    window.setTimeout(() => {
      pill.remove();
    }, 280);
  }

  public hideTitleHub(): void {
    if (
      this.activeView === 'TITLE_HUB' ||
      this.activeView === 'BACKSTAGE' ||
      this.activeView === 'QUICK_PLAY'
    ) {
      this.hideAll();
    }
  }

  public hideAll(): void {
    this.dismissTuneInCurtain();
    this.detachAudioUnlockListeners?.();
    this.detachAudioUnlockListeners = null;
    this.detachKeyHandler();
    this.resolvePendingColdOpen();
    this.resolvePendingDaily('BACK_TO_STUDIO');
    this.stageLayerEl.innerHTML = '';
    this.activeView = 'NONE';
    this.rootEl.classList.add('ws66-hidden');
  }

  public dispose(): void {
    this.hideAll();
    this.detachFsListener?.();
    this.detachFsListener = null;
    if (this.toastTimerId !== null) {
      window.clearTimeout(this.toastTimerId);
      this.toastTimerId = null;
    }
    this.rootEl.remove();
  }

  // --------------------------------------------------------------------------
  // Deliverable 0 (Wave 2): Crisp 0.85s Skippable 1966 Peacock Kaleidoscope Intro
  // --------------------------------------------------------------------------

  public playLivingColorTuneIn(durationMs = DEFAULT_TUNEIN_DURATION_MS): Promise<void> {
    this.dismissTuneInCurtain();
    if (this.isReducedMotionActive()) {
      return Promise.resolve();
    }

    const clampedMs = Math.max(320, Math.min(1400, durationMs));
    this.rootEl.classList.remove('ws66-hidden');
    this.callbacks.onBootTuneInSfx?.();

    return new Promise<void>((resolve) => {
      const curtain = document.createElement('div');
      curtain.className = 'ws66-tunein-curtain';
      curtain.setAttribute('role', 'presentation');
      curtain.setAttribute('aria-label', '1966 In Living Color Broadcast Tune-In — tap to skip');
      curtain.style.animationDuration = `${clampedMs}ms`;
      curtain.innerHTML = `
        <button type="button" class="ws66-tunein-skip-hint">TAP TO SKIP ▸</button>
        <div class="ws66-tunein-aperture" style="animation-duration:${clampedMs}ms;">
          ${buildKaleidoscopePrismSvg()}
          ${buildPeacockEmblemSvg('ws66-tunein-peacock')}
        </div>
        <div class="ws66-tunein-word" style="animation-duration:${clampedMs}ms;">IN LIVING COLOR</div>
      `;

      const kaleidoscopeSvg = curtain.querySelector<SVGElement>('.ws66-tunein-kaleidoscope');
      const peacockSvg = curtain.querySelector<SVGElement>('.ws66-tunein-peacock');
      if (kaleidoscopeSvg) kaleidoscopeSvg.style.animationDuration = `${clampedMs}ms`;
      if (peacockSvg) peacockSvg.style.animationDuration = `${clampedMs}ms`;

      let settled = false;
      const finish = (): void => {
        if (settled) return;
        settled = true;
        if (this.activeTuneInTimerId !== null) {
          window.clearTimeout(this.activeTuneInTimerId);
          this.activeTuneInTimerId = null;
        }
        curtain.removeEventListener('pointerdown', onSkip);
        window.removeEventListener('keydown', onKeySkip);
        curtain.remove();
        if (this.activeTuneInEl === curtain) {
          this.activeTuneInEl = null;
        }
        this.activeTuneInCleanup = null;
        resolve();
      };

      const onSkip = (): void => {
        finish();
      };
      const onKeySkip = (): void => {
        finish();
      };

      curtain.addEventListener('pointerdown', onSkip, { once: true });
      window.addEventListener('keydown', onKeySkip, { once: true });

      this.activeTuneInEl = curtain;
      this.activeTuneInCleanup = finish;
      this.rootEl.appendChild(curtain);
      this.activeTuneInTimerId = window.setTimeout(finish, clampedMs + 30);
    });
  }

  private dismissTuneInCurtain(): void {
    if (this.activeTuneInCleanup) {
      this.activeTuneInCleanup();
      return;
    }
    if (this.activeTuneInTimerId !== null) {
      window.clearTimeout(this.activeTuneInTimerId);
      this.activeTuneInTimerId = null;
    }
    if (this.activeTuneInEl) {
      this.activeTuneInEl.remove();
      this.activeTuneInEl = null;
    }
  }

  // --------------------------------------------------------------------------
  // Deliverable 1: Animated 1966 "IN LIVING COLOR" Option 5A Sleek 3-Tier Hub
  // --------------------------------------------------------------------------

  public showTitleHub(data: TitleHubViewDataV7 = {}): void {
    this.lastHubData = { ...this.lastHubData, ...data };
    this.detachKeyHandler();
    this.resolvePendingColdOpen();
    this.resolvePendingDaily('BACK_TO_STUDIO');

    const save = this.lastHubData.save;
    const bp = this.lastHubData.episodeBlueprint;
    const dailySave = this.lastHubData.dailySave ?? null;

    if (save?.settings) {
      this.setReducedMotion(save.settings.reducedMotion);
      if (!this.hasUserChosenDifficulty && save.settings.difficultyMode) {
        this.selectedQuickDifficulty = save.settings.difficultyMode;
      }
      if (!this.hasUserChosenTimer && save.settings.questionTimerMode !== undefined) {
        this.selectedQuickTimerMode = normalizeQuestionTimerModeV8(
          save.settings.questionTimerMode,
        );
      }
    }

    if (this.lastHubData.isAudioUnlocked === true || this.callbacks.isAudioUnlocked?.() === true) {
      this.audioUnlocked = true;
    }

    const ledger = loadShowroomLedgerV9();
    const sweeps = loadSweepsStateV9();
    const showroomCash = Math.max(0, Math.floor(this.lastHubData.showroomCash ?? ledger.showroomCash));
    const plinkoTokens = Math.max(0, Math.floor(this.lastHubData.plinkoTokens ?? ledger.plinkoTokens));
    const pendingRematchEp =
      this.lastHubData.pendingRematchEpisode !== undefined
        ? this.lastHubData.pendingRematchEpisode
        : (save?.pendingRematchEpisode ?? null);
    const sweepsActiveNight =
      this.lastHubData.sweepsActiveNight !== undefined
        ? this.lastHubData.sweepsActiveNight
        : sweeps.activeRun
          ? sweeps.currentNight
          : null;
    const soundOn =
      this.lastHubData.soundEnabled !== undefined
        ? this.lastHubData.soundEnabled
        : (save?.settings?.masterVolume ?? 80) > 0;

    const epCode = bp?.code ?? 'S01E01';
    const purseCash = Math.max(0, Math.floor(save?.cleanPurseCash ?? 0));
    const isFreshCampaign =
      !save ||
      (save.currentEpisode <= 1 && save.episodesPlayed === 0 && purseCash === 0 && !save.waiver);
    const winsCount = Math.max(0, save?.episodesWon ?? 0);
    const todayIso = getLocalTodayIso();
    const playedDailyToday =
      Boolean(dailySave?.todayResult && dailySave.todayResult.dateIso === todayIso) ||
      dailySave?.lastPlayedDateIso === todayIso;
    const streakCount = Math.max(0, dailySave?.currentStreak ?? 0);
    const dailyEpTag = this.lastHubData.dailyEpisodeNumber
      ? `EP #${this.lastHubData.dailyEpisodeNumber}`
      : 'TODAY’S SHOW';
    const nextRivalName = bp
      ? (CAST_PROFILES_V7[bp.rivalId]?.name ?? 'Dotty Vance')
      : 'Dotty Vance';

    const stage = document.createElement('section');
    stage.className = 'ws66-title-stage ws9-hub-stage ws9-hub-3tier';
    stage.dataset.ctaHover = 'none';
    stage.setAttribute('aria-label', "World's Smartest 1966 Title Broadcast Hub");

    // 1. Top 48px Utility Bar (Split SOUND quick-mute from dedicated OPTIONS button + crisp SVG icons)
    const topBar = document.createElement('header');
    topBar.className = 'ws9-hub-top-bar';
    topBar.innerHTML = `
      <span class="ws9-hub-brand-badge">
        <span class="ws9-hub-live-dot" aria-hidden="true"></span>
        <span>1966 IN LIVING COLOR</span>
      </span>
      <div class="ws9-hub-util-actions">
        <button type="button" class="ws9-hub-util-btn" data-action="how-to-play" title="How to Play &amp; Rules" aria-label="How to Play and Rules">
          ${buildHubUiSvgIcon('RULES')}<span class="ws9-util-txt">Rules</span>
        </button>
        <button type="button" class="ws9-hub-util-btn" data-action="career-stats" title="Career Stats &amp; Charts" aria-label="Career Stats and Charts">
          ${buildHubUiSvgIcon('STATS')}<span class="ws9-util-txt">Stats</span>
        </button>
        <button type="button" class="ws9-hub-util-btn" data-action="toggle-sound" aria-pressed="${soundOn}" title="Mute / Unmute Studio Sound" aria-label="${soundOn ? 'Mute Studio Sound' : 'Unmute Studio Sound'}">
          ${buildHubUiSvgIcon(soundOn ? 'SOUND_ON' : 'SOUND_OFF')}<span class="ws9-util-txt">Sound</span>
        </button>
        <button type="button" class="ws9-hub-util-btn" data-action="open-options" title="Options, Mixer &amp; Reset Save" aria-label="Studio Options and Audio Mixer">
          ${buildHubUiSvgIcon('OPTIONS')}<span class="ws9-util-txt ws9-util-full">Options</span><span class="ws9-util-txt ws9-util-short" aria-hidden="true">Opt</span>
        </button>
      </div>
    `;

    topBar.querySelector('[data-action="how-to-play"]')?.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      if (this.callbacks.onOpenHowToPlay) {
        this.callbacks.onOpenHowToPlay();
      } else {
        this.openHowToPlaySheet({
          episodeBlueprint: bp,
          onClose: () => this.showTitleHub(this.lastHubData),
        });
      }
    });
    topBar.querySelector('[data-action="career-stats"]')?.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      if (this.callbacks.onOpenCareerStats) {
        this.callbacks.onOpenCareerStats();
      } else {
        this.openTrophyAndMedalsShowcase('MEDALS');
      }
    });
    topBar.querySelector('[data-action="toggle-sound"]')?.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      if (this.callbacks.onToggleSound) {
        this.callbacks.onToggleSound();
      } else if (this.callbacks.onOpenAudioSettings) {
        this.callbacks.onOpenAudioSettings();
      } else {
        this.openTrophyAndMedalsShowcase('STUDIO');
      }
    });
    topBar.querySelector('[data-action="open-options"]')?.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      if (this.callbacks.onOpenAudioSettings) {
        this.callbacks.onOpenAudioSettings();
      } else {
        this.openTrophyAndMedalsShowcase('STUDIO');
      }
    });

    // 2. Animated 1966 Studio 6A / Broadway Hero Title Marquee
    const marquee = document.createElement('div');
    marquee.className = 'ws9-hub-marquee';
    marquee.innerHTML = `
      <div class="ws9-marquee-cartouche">
        <div class="ws9-marquee-fan-wrap" aria-hidden="true">
          ${buildMarqueeRainbowFanSvg()}
        </div>
        <div class="ws9-marquee-spotlight" aria-hidden="true"></div>
        ${buildHeroMarqueeBulbPerimeterHtml()}
        <div class="ws9-marquee-face">
          <h1 class="ws66-wordmark">
            <span class="ws66-wordmark-top-row">
              <span class="ws9-title-starburst ws9-star-left" aria-hidden="true">${buildEightPointStarburstSvg()}</span>
              <span class="ws66-wordmark-top">WORLD’S</span>
              <span class="ws9-title-starburst ws9-star-right" aria-hidden="true">${buildEightPointStarburstSvg()}</span>
            </span>
            <span class="ws66-wordmark-hero" aria-label="SMARTEST">${buildKineticHeroWordHtml('SMARTEST')}</span>
          </h1>
        </div>
      </div>
      <div class="ws9-hub-hook-line">FIFTY MILLION WATCHING · VS. ${nextRivalName.toUpperCase()}</div>
    `;

    // 3. Sleek 3-Tier Card Grid
    const tiersGrid = document.createElement('div');
    tiersGrid.className = 'ws9-hub-3tier-grid';

    // TIER 1: CAMPAIGN (Peacock Teal) | DAILY SHOW (Atomic Tangerine)
    const tier1 = document.createElement('div');
    tier1.className = 'ws9-hub-tier-row ws9-hub-tier1';

    const campaignBtn = document.createElement('button');
    campaignBtn.type = 'button';
    campaignBtn.className = 'ws9-hub-tier-card ws9-card-campaign';
    campaignBtn.dataset.action = 'play-campaign';
    const rematchFlag = pendingRematchEp
      ? `<span class="ws9-rematch-badge">RETURN CHAMPION REMATCH</span>`
      : `<span class="ws9-card-tag">${epCode}</span>`;
    campaignBtn.innerHTML = `
      <span class="ws9-card-kicker-row">
        ${rematchFlag}
        ${!pendingRematchEp ? `<span class="ws9-card-tag">${winsCount} WINS</span>` : ''}
      </span>
      <span class="ws9-card-title">${buildHubUiSvgIcon('PLAY')}<span>${isFreshCampaign ? 'CAMPAIGN' : 'CAMPAIGN'}</span></span>
      <span class="ws9-card-sub">${
        pendingRematchEp
          ? `Rematch Ep ${pendingRematchEp} · Fresh clues`
          : isFreshCampaign
            ? '90 Episodes · $222K Purse'
            : `$${purseCash.toLocaleString()} / $222K Purse`
      }</span>
    `;
    campaignBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      this.callbacks.onPlayCampaign?.();
    });

    const dailyBtn = document.createElement('button');
    dailyBtn.type = 'button';
    dailyBtn.className = 'ws9-hub-tier-card ws9-card-daily';
    dailyBtn.dataset.action = 'play-daily';
    dailyBtn.dataset.dailyDone = String(playedDailyToday);
    dailyBtn.innerHTML = `
      <span class="ws9-card-kicker-row">
        <span class="ws9-card-tag">${dailyEpTag}</span>
        ${streakCount > 0 ? `<span class="ws9-card-tag">STREAK ${streakCount}</span>` : ''}
      </span>
      <span class="ws9-card-title">${buildHubUiSvgIcon('ANTENNA')}<span>DAILY SHOW</span></span>
      <span class="ws9-card-sub">${
        playedDailyToday ? 'Completed Today · Share Card' : 'Global 1966 Board · Streak'
      }</span>
    `;
    dailyBtn.addEventListener('click', () => {
      this.callbacks.onBellSfx?.();
      if (playedDailyToday && dailySave?.todayResult) {
        void this.showDailyBroadcastResultModal({
          save: dailySave,
          dateLabel: this.lastHubData.dailyDateLabel,
          allowReplay: true,
          onPlayAgain: () => {
            this.callbacks.onPlayDailyBroadcast?.();
          },
          onBackToStudio: () => {
            this.showTitleHub({ ...this.lastHubData, playBootTuneIn: false });
          },
        });
      } else {
        this.callbacks.onPlayDailyBroadcast?.();
      }
    });

    tier1.append(campaignBtn, dailyBtn);

    // TIER 2: 60s BLITZ (Un-nested sibling <button> shell + Booth Customize) | SWEEPS STREAK (Cerise & Brass)
    const tier2 = document.createElement('div');
    tier2.className = 'ws9-hub-tier-row ws9-hub-tier2';

    const blitzWrap = document.createElement('div');
    blitzWrap.className = 'ws9-card-shell ws9-card-blitz-wrap';

    const blitzBtn = document.createElement('button');
    blitzBtn.type = 'button';
    blitzBtn.className = 'ws9-hub-tier-card ws9-card-blitz';
    blitzBtn.dataset.action = 'play-blitz';
    blitzBtn.innerHTML = `
      <span class="ws9-card-kicker-row">
        <span class="ws9-card-tag">+3s HIT · PASS</span>
      </span>
      <span class="ws9-card-title">${buildHubUiSvgIcon('BOLT')}<span>60s BLITZ</span></span>
      <span class="ws9-card-sub">Zero AI wait · Beat the clock</span>
    `;
    blitzBtn.addEventListener('click', () => {
      this.callbacks.onBellSfx?.();
      if (this.callbacks.onPlayBlitz60) {
        this.callbacks.onPlayBlitz60(this.selectedBoothConfig);
      } else {
        this.openBlitzBoothSheet();
      }
    });

    const blitzBoothBtn = document.createElement('button');
    blitzBoothBtn.type = 'button';
    blitzBoothBtn.className = 'ws9-card-booth-chip';
    blitzBoothBtn.dataset.action = 'blitz-booth';
    blitzBoothBtn.title = 'Customize 60s Blitz Vibe Pack & Red Veto Stamps';
    blitzBoothBtn.setAttribute('aria-label', 'Customize 60s Blitz Booth');
    blitzBoothBtn.innerHTML = `${buildHubUiSvgIcon('BOOTH')}<span>CUSTOMIZE BOOTH</span>`;
    blitzBoothBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.callbacks.onUiTapSfx?.();
      this.openBlitzBoothSheet();
    });
    blitzWrap.append(blitzBtn, blitzBoothBtn);

    const sweepsBtn = document.createElement('button');
    sweepsBtn.type = 'button';
    sweepsBtn.className = 'ws9-hub-tier-card ws9-card-sweeps';
    sweepsBtn.dataset.action = 'open-sweeps';
    sweepsBtn.innerHTML = `
      <span class="ws9-card-kicker-row">
        <span class="ws9-card-tag">${
          sweepsActiveNight ? `NIGHT ${sweepsActiveNight}/5` : 'MON–FRI'
        }</span>
      </span>
      <span class="ws9-card-title">${buildHubUiSvgIcon('CROWN')}<span>SWEEPS STREAK</span></span>
      <span class="ws9-card-sub">5-Night Gauntlet · Plinko</span>
    `;
    sweepsBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      this.callbacks.onOpenSweepsWeek?.();
    });

    tier2.append(blitzWrap, sweepsBtn);

    // TIER 3: Full-Width Unified PRIZE SHOWROOM
    const tier3 = document.createElement('div');
    tier3.className = 'ws9-hub-tier3';

    const showroomBtn = document.createElement('button');
    showroomBtn.type = 'button';
    showroomBtn.className = 'ws9-hub-tier-card ws9-card-showroom';
    showroomBtn.dataset.action = 'open-showroom';
    showroomBtn.innerHTML = `
      <span class="ws9-showroom-copy">
        <span class="ws9-card-kicker-row">
          <span class="ws9-card-tag">1966 CATALOG · CURTAIN GAMBLE</span>
        </span>
        <span class="ws9-card-title">${buildHubUiSvgIcon('SHOWROOM')}<span>PRIZE SHOWROOM</span></span>
        <span class="ws9-card-sub">Den · 36 Trophies · Style · Plinko</span>
      </span>
      <span class="ws9-showroom-badges">
        <span class="ws9-sc-pill">$${showroomCash.toLocaleString()} SHOWROOM CASH</span>
        <span class="ws9-plinko-pill">★ ${plinkoTokens} PLINKO</span>
      </span>
    `;
    showroomBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      if (this.callbacks.onOpenShowroom) {
        this.callbacks.onOpenShowroom();
      } else if (this.callbacks.onOpenTrophiesAndSound) {
        this.callbacks.onOpenTrophiesAndSound();
      } else {
        this.openTrophyAndMedalsShowcase('TROPHIES');
      }
    });
    tier3.appendChild(showroomBtn);

    tiersGrid.append(tier1, tier2, tier3);

    // 4. Slim Bottom Studio Floor Strip + Compact Secondary Utility Pills
    const floorDock = document.createElement('div');
    floorDock.className = 'ws9-hub-floor-dock';

    const floorStrip = document.createElement('nav');
    floorStrip.className = 'ws9-hub-floor-strip';
    floorStrip.setAttribute('aria-label', 'Studio Floor Quick Modes');

    const quickFloorBtn = document.createElement('button');
    quickFloorBtn.type = 'button';
    quickFloorBtn.className = 'ws9-floor-btn';
    quickFloorBtn.dataset.action = 'quick-show';
    quickFloorBtn.innerHTML = `${buildHubUiSvgIcon('MIC')}<span>QUICK SHOW</span>`;
    quickFloorBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      this.openQuickPlayPicker();
    });

    const couchFloorBtn = document.createElement('button');
    couchFloorBtn.type = 'button';
    couchFloorBtn.className = 'ws9-floor-btn';
    couchFloorBtn.dataset.action = 'couch-party';
    couchFloorBtn.innerHTML = `${buildHubUiSvgIcon('COUCH_DUO')}<span>2P COUCH</span>`;
    couchFloorBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      this.hideAll();
      this.callbacks.onStartCouchParty?.();
    });

    floorStrip.append(quickFloorBtn, couchFloorBtn);

    const secondaryStrip = document.createElement('nav');
    secondaryStrip.className = 'ws9-hub-secondary-strip';
    secondaryStrip.setAttribute('aria-label', 'Studio Trunk, TV Guide and Daily Archive');

    const propTrunkPill = document.createElement('button');
    propTrunkPill.type = 'button';
    propTrunkPill.className = 'ws9-hub-sec-pill';
    propTrunkPill.dataset.action = 'prop-trunk';
    propTrunkPill.innerHTML = `${buildHubUiSvgIcon('PROP_WHEEL')}<span>PROP TRUNK &amp; $222K WHEEL</span>`;
    propTrunkPill.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      if (this.callbacks.onOpenPropShop) {
        this.callbacks.onOpenPropShop();
      } else {
        this.openTrophyAndMedalsShowcase('MEDALS');
      }
    });

    const tvGuidePill = document.createElement('button');
    tvGuidePill.type = 'button';
    tvGuidePill.className = 'ws9-hub-sec-pill';
    tvGuidePill.dataset.action = 'tv-guide';
    tvGuidePill.innerHTML = `${buildHubUiSvgIcon('TV_GUIDE')}<span>TV GUIDE</span>`;
    tvGuidePill.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      if (this.callbacks.onOpenEpisodeJump) {
        this.callbacks.onOpenEpisodeJump();
      } else {
        this.openTrophyAndMedalsShowcase('STUDIO');
      }
    });

    const dailyArchivePill = document.createElement('button');
    dailyArchivePill.type = 'button';
    dailyArchivePill.className = 'ws9-hub-sec-pill';
    dailyArchivePill.dataset.action = 'daily-archive';
    dailyArchivePill.innerHTML = `${buildHubUiSvgIcon('DAILY_ARCHIVE')}<span>DAILY ARCHIVE</span>`;
    dailyArchivePill.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      if (this.callbacks.onOpenDailyTapeVault) {
        this.callbacks.onOpenDailyTapeVault();
      } else {
        this.callbacks.onPlayDailyBroadcast?.();
      }
    });

    secondaryStrip.append(propTrunkPill, tvGuidePill, dailyArchivePill);
    floorDock.append(floorStrip, secondaryStrip);

    stage.append(topBar, marquee, tiersGrid, floorDock);
    this.mountView('TITLE_HUB', stage);
    this.checkAndConsumeUpdatedUrlFlag();

    if (!this.audioUnlocked) {
      const onFirstGesture = (ev: Event): void => {
        const target = ev.target as HTMLElement | null;
        const tappedOtherButton = Boolean(target?.closest('button'));
        this.triggerAudioUnlockFromHub(!tappedOtherButton);
      };
      window.addEventListener('pointerdown', onFirstGesture, { capture: true, once: true });
      window.addEventListener('keydown', onFirstGesture, { capture: true, once: true });
      this.detachAudioUnlockListeners = () => {
        window.removeEventListener('pointerdown', onFirstGesture, { capture: true });
        window.removeEventListener('keydown', onFirstGesture, { capture: true });
      };
    }

    const shouldPlayTuneIn =
      data.playBootTuneIn !== false && (!this.hasPlayedColdBootIntro || data.playBootTuneIn === true);
    if (shouldPlayTuneIn) {
      this.hasPlayedColdBootIntro = true;
      void this.playLivingColorTuneIn(DEFAULT_TUNEIN_DURATION_MS);
    }
  }

  private openBlitzBoothSheet(): void {
    void openCustomBroadcastBoothV9(this.host, {
      modeLabel: '60-SECOND BLITZ BOOTH',
      isBlitz: true,
      initialConfig: this.selectedBoothConfig,
      countUnseenAvailableClues: this.callbacks.countUnseenAvailableClues,
      onTapSfx: () => this.callbacks.onUiTapSfx?.(),
      onChange: (cfg) => {
        this.selectedBoothConfig = cfg;
      },
      onLaunch: (cfg) => {
        this.selectedBoothConfig = cfg;
        this.callbacks.onBellSfx?.();
        this.callbacks.onPlayBlitz60?.(cfg);
      },
    });
  }

  private triggerAudioUnlockFromHub(playGentleTapIfNoDedicatedCallback: boolean): void {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;
    this.dismissOrchestraUnlockPill();
    if (this.callbacks.onRequestAudioUnlock) {
      void this.callbacks.onRequestAudioUnlock();
    } else if (playGentleTapIfNoDedicatedCallback) {
      this.callbacks.onUiTapSfx?.();
    }
  }

  // Sleek Optional Quick-Play Format & CPU Difficulty Broadcast Setup Sheet
  public openQuickPlayPicker(): void {
    const difficultySpecs: ReadonlyArray<{
      readonly id: DifficultyModeV7;
      readonly label: string;
      readonly accuracyTag: string;
      readonly profileCopy: string;
    }> = [
      {
        id: 'MATINEE_EASY',
        label: 'MATINEE',
        accuracyTag: '~42–52% ACCURACY · RELAXED',
        profileCopy:
          'Champs play straight, pick safe mid-value tiles, and rarely set blocks — ideal for warm-ups & exploring new boards.',
      },
      {
        id: 'PRIMETIME_NORMAL',
        label: 'PRIME-TIME',
        accuracyTag: '~55–68% ACCURACY · HONEST AI',
        profileCopy:
          'True 1966 studio rivalry: Gamblers hunt Wheels & Curtains, Professors sweep strong topics, and Blockers guard lines — pure, honest Champion instincts.',
      },
      {
        id: 'ALLSTAR_HARD',
        label: 'ALL-STAR',
        accuracyTag: '~68–79% ACCURACY · TACTICAL',
        profileCopy:
          'Tournament-grade Champions actively cut off 3-in-a-row & bridge paths, press high-value tiles, and surge in Turns 8–10.',
      },
      {
        id: 'MASTERMIND',
        label: 'MASTERMIND',
        accuracyTag: '~78–88% ACCURACY · RUTHLESS',
        profileCopy:
          'Ice-veined Grand Champions punish weak spots, snipe Blind/Vault jackpots, and push bold studio gambles on razor-sharp, honest Champion instincts.',
      },
    ];

    const formatSpecs: ReadonlyArray<{
      readonly id: BoardPlayModeV9;
      readonly label: string;
      readonly hook: string;
      readonly tone: string;
    }> = [
      {
        id: 'CLASSIC_TOTE',
        label: 'CLASSIC TOTE',
        hook: 'Climb $150–$400 rows, reveal the 2× Secret Square & crack the $500 Vault.',
        tone: 'peacock',
      },
      {
        id: 'TIC_TAC_LINE',
        label: '3-IN-A-ROW',
        hook: 'Connect 3 claimed squares in any line for +$600 — watch Rival blocks!',
        tone: 'cobalt',
      },
      {
        id: 'COAST_HEX_BRIDGE',
        label: 'COAST BRIDGE',
        hook: 'Link adjacent wins Coast-to-Coast (NYC to LA) for a +$750 Bridge Bonus.',
        tone: 'peacock',
      },
      {
        id: 'EYE_GUESS_MEMORY',
        label: 'EYE GUESS ’66',
        hook: 'Memorize the 2.4s board flash to grab hidden 2× & +$300 tiles safely.',
        tone: 'gold',
      },
      {
        id: 'CONCENTRATION_PRIZE_MATCH',
        label: 'PRIZE MATCH',
        hook: 'Match twin luxury prize halves for +$500 — or hit TAKE! to steal $200.',
        tone: 'tangerine',
      },
      {
        id: 'MONTY_CURTAIN_DEAL',
        label: 'CURTAIN DEAL',
        hook: 'Triple Velvet Mystery Curtains (#1–#3) + Instant Bargains & steals.',
        tone: 'cerise',
      },
      {
        id: 'PRESS_YOUR_LUCK_GREMLIN',
        label: 'GREMLIN BOARD',
        hook: 'Slam STOP! for huge bucks, pass risky spins, or dodge the -40% Gremlin!',
        tone: 'cerise',
      },
      {
        id: 'BIG_WHEEL_SHOWCASE',
        label: 'BIG WHEEL',
        hook: 'Flick the 20-wedge Wheel for $1,000 Jackpots, 2× Doubles & Lifelines!',
        tone: 'gold',
      },
      {
        id: 'LOUVER_SHUTTER',
        label: 'LOUVER SHUTTER',
        hook: 'Mystery Topics — dollars glow bright while categories stay shuttered until tapped.',
        tone: 'peacock',
      },
      {
        id: 'BLIND_PURSE',
        label: 'BLIND PURSE',
        hook: 'Mystery Dollars — topics visible, shuffled $150–$750 wax-seal purses hidden.',
        tone: 'cerise',
      },
      {
        id: 'BLACKOUT_VAULT',
        label: 'BLACKOUT VAULT',
        hook: 'Total Mystery — numbered #1–#12 safe trilons hide both topic and cash!',
        tone: 'gold',
      },
      {
        id: 'LIVE_WIRE_FUSE',
        label: 'LIVE-WIRE FUSE',
        hook: 'All locked but 1 starter tile — win to spark orthogonal neighbors open!',
        tone: 'tangerine',
      },
      {
        id: 'SHIFTING_SPOTLIGHT',
        label: 'SHIFTING SPOTLIGHT',
        hook: 'Gliding 1.5× / 2× Harvest Gold spotlight jumps across the rails every turn.',
        tone: 'gold',
      },
      {
        id: 'GOLDEN_DOMINO_CASCADE',
        label: 'GOLDEN DOMINO',
        hook: 'Link 3 contiguous claimed tiles to trigger a +$350 Domino Cascade!',
        tone: 'peacock',
      },
      {
        id: 'PRESSURE_COOKER',
        label: 'PRESSURE COOKER',
        hook: 'Shared gauge climbs ×1.0 to ×2.0 on hits; any miss blasts steam back to ×1.0!',
        tone: 'cerise',
      },
      {
        id: 'HOLLYWOOD_MARQUEE_LINE',
        label: 'HOLLYWOOD MARQUEE',
        hook: 'O/X chasing bulbs — light any 3-in-a-row marquee bar for +$300 Line Bonus!',
        tone: 'cobalt',
      },
    ];
    void ALL_BOARD_PLAY_MODES_R7_V9;

    const stage = document.createElement('section');
    stage.className = 'ws66-theater-stage';
    stage.setAttribute('role', 'dialog');
    stage.setAttribute('aria-modal', 'true');
    stage.setAttribute('aria-label', 'Quick Show Format and CPU Difficulty Selector');

    const sheet = document.createElement('div');
    sheet.className = 'ws66-quickplay-sheet';

    const head = document.createElement('header');
    head.className = 'ws66-quickplay-head';
    head.innerHTML = `
      <div class="ws66-quickplay-head-copy">
        <span class="ws66-cue-kicker">STUDIO 6A · INSTANT SHOWTIME</span>
        <h2 class="ws66-quickplay-title">QUICK PLAY SETUP</h2>
      </div>
    `;

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'ws66-skip-btn';
    backBtn.textContent = 'BACK ✕';
    backBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      this.showTitleHub({ ...this.lastHubData, playBootTuneIn: false });
    });
    head.appendChild(backBtn);

    const scrollBody = document.createElement('div');
    scrollBody.className = 'ws66-quickplay-body';

    // 1. CPU Difficulty 4-Segment Control Bar + Honest Mind-Game Profile Readout
    const diffSection = document.createElement('div');
    diffSection.className = 'ws66-qp-section';

    const diffLabelRow = document.createElement('div');
    diffLabelRow.className = 'ws66-qp-section-head';
    diffLabelRow.innerHTML = `<span class="ws66-qp-label">CPU CHAMPION DIFFICULTY</span>`;

    const diffAccBadge = document.createElement('span');
    diffAccBadge.className = 'ws66-qp-acc-pill';
    diffLabelRow.appendChild(diffAccBadge);

    const diffRail = document.createElement('div');
    diffRail.className = 'ws66-qp-diff-rail';
    diffRail.setAttribute('role', 'radiogroup');
    diffRail.setAttribute('aria-label', 'CPU Champion Difficulty');

    const diffProfileBox = document.createElement('div');
    diffProfileBox.className = 'ws66-qp-diff-profile';
    diffProfileBox.setAttribute('aria-live', 'polite');

    const diffButtons: HTMLButtonElement[] = [];
    const syncDiffSelection = (): void => {
      const spec =
        difficultySpecs.find((d) => d.id === this.selectedQuickDifficulty) ?? difficultySpecs[1];
      diffAccBadge.textContent = spec.accuracyTag;
      diffProfileBox.textContent = formatOrphanProof(spec.profileCopy);
      diffButtons.forEach((btn) => {
        const active = btn.dataset.difficulty === this.selectedQuickDifficulty;
        btn.dataset.active = String(active);
        btn.setAttribute('aria-checked', String(active));
      });
    };

    for (const d of difficultySpecs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ws66-qp-diff-btn';
      btn.setAttribute('role', 'radio');
      btn.dataset.difficulty = d.id;
      btn.textContent = d.label;
      btn.addEventListener('click', () => {
        this.callbacks.onUiTapSfx?.();
        this.selectedQuickDifficulty = d.id;
        this.hasUserChosenDifficulty = true;
        syncDiffSelection();
      });
      diffButtons.push(btn);
      diffRail.appendChild(btn);
    }

    diffSection.append(diffLabelRow, diffRail, diffProfileBox);

    // 1b. 5-Speed Studio Question Clock Selector (NO TIMER · 90s · 45s · 30s · 15s)
    const timerSection = document.createElement('div');
    timerSection.className = 'ws66-qp-section';
    mountQuestionTimerSelectorV8(timerSection, {
      value: this.selectedQuickTimerMode,
      showHeader: true,
      showSummary: true,
      onTapSfx: () => this.callbacks.onUiTapSfx?.(),
      onChange: (nextMode) => {
        this.selectedQuickTimerMode = nextMode;
        this.hasUserChosenTimer = true;
      },
    });

    // 2. 1966 Board Format Picker (Surprise No-Repeat Mix Default + All 16 Board Formats)
    const fmtSection = document.createElement('div');
    fmtSection.className = 'ws66-qp-section';
    fmtSection.innerHTML = `
      <div class="ws66-qp-section-head">
        <span class="ws66-qp-label">1966 BOARD FORMAT (${formatSpecs.length} MODES)</span>
        <span class="ws66-qp-subdesc">Pick any classic or R7 board or Surprise Mix</span>
      </div>
    `;

    const surpriseBtn = document.createElement('button');
    surpriseBtn.type = 'button';
    surpriseBtn.className = 'ws66-qp-surprise-btn';
    surpriseBtn.dataset.mode = 'SURPRISE_MIX';
    surpriseBtn.innerHTML = `
      ${buildSurpriseMixKaleidoscopeSvg()}
      <span class="ws66-qp-surprise-copy">
        <span class="ws66-qp-surprise-main"><span class="ws66-seg">SURPRISE NO-REPEAT MIX</span><span class="ws66-qp-rec-badge">RECOMMENDED</span></span>
        <span class="ws66-qp-surprise-sub">Cycles fresh 1966 Board Formats &amp; Board Rack Layouts automatically</span>
      </span>
    `;

    const formatGrid = document.createElement('div');
    formatGrid.className = 'ws66-qp-format-grid';

    const modeButtons: HTMLButtonElement[] = [surpriseBtn];
    const syncModeSelection = (): void => {
      modeButtons.forEach((btn) => {
        const active = btn.dataset.mode === this.selectedQuickMode;
        btn.dataset.active = String(active);
        btn.setAttribute('aria-pressed', String(active));
      });
    };

    surpriseBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      this.selectedQuickMode = 'SURPRISE_MIX';
      syncModeSelection();
    });

    for (const f of formatSpecs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ws66-qp-format-btn';
      btn.dataset.mode = f.id;
      btn.dataset.tone = f.tone;
      btn.innerHTML = `
        <span class="ws66-qp-fmt-diagram">${buildBoardModeMiniDiagramSvg(f.id)}</span>
        <span class="ws66-qp-fmt-copy">
          <span class="ws66-qp-fmt-lbl">${f.label}</span>
          <span class="ws66-qp-fmt-hook">${f.hook}</span>
        </span>
      `;
      btn.addEventListener('click', () => {
        this.callbacks.onUiTapSfx?.();
        this.selectedQuickMode = f.id;
        syncModeSelection();
      });
      modeButtons.push(btn);
      formatGrid.appendChild(btn);
    }

    fmtSection.append(surpriseBtn, formatGrid);

    // 2b. R3 Custom Broadcast Booth (6 Vibe Packs + 3 Red Category Veto Stamps)
    const boothSection = document.createElement('div');
    boothSection.className = 'ws66-qp-section';
    const boothHandle = mountCustomBroadcastBoothPanelV9(boothSection, {
      modeLabel: 'QUICK SHOW',
      initialConfig: this.selectedBoothConfig,
      countUnseenAvailableClues: this.callbacks.countUnseenAvailableClues,
      onTapSfx: () => this.callbacks.onUiTapSfx?.(),
      onChange: (cfg) => {
        this.selectedBoothConfig = cfg;
      },
    });

    const isClassicV7Mode = (mode: BoardPlayModeV9): mode is BoardPlayModeV7 =>
      (ALL_BOARD_PLAY_MODES_V7 as readonly string[]).includes(mode);

    // 3. Pinned Bottom Launch Dock (Always 1-Tap Reachable on Every Phone & Tablet!)
    const launchQuickShow = (): void => {
      this.callbacks.onBellSfx?.();
      this.selectedBoothConfig = boothHandle.getConfig();
      const chosenMode =
        this.selectedQuickMode === 'SURPRISE_MIX' ? undefined : this.selectedQuickMode;
      const selection: QuickPlaySelectionV7 = {
        preferredMode: chosenMode && isClassicV7Mode(chosenMode) ? chosenMode : undefined,
        preferredModeV9: chosenMode,
        difficultyMode: this.selectedQuickDifficulty,
        questionTimerMode: this.selectedQuickTimerMode,
        boothConfig: this.selectedBoothConfig,
      };
      this.hideAll();
      if (this.callbacks.onQuickPlaySelected) {
        this.callbacks.onQuickPlaySelected(selection);
      } else {
        this.callbacks.onQuickShow?.(selection);
      }
    };

    const launchDock = document.createElement('div');
    launchDock.className = 'ws66-qp-launch-dock';

    const launchBtn = document.createElement('button');
    launchBtn.type = 'button';
    launchBtn.className = 'ws66-push-btn ws66-push-hero ws66-qp-launch-btn';
    launchBtn.dataset.action = 'launch-quick-show';
    launchBtn.innerHTML = `
      <span class="ws66-push-copy">
        <span class="ws66-push-lead-row">
          <span class="ws66-pilot-bulb" aria-hidden="true"></span>
          <span class="ws66-push-label">ROLL CAMERA · START QUICK SHOW</span>
        </span>
      </span>
      <span class="ws66-push-arrow" aria-hidden="true">▸</span>
    `;
    launchBtn.addEventListener('click', launchQuickShow);
    launchDock.appendChild(launchBtn);

    scrollBody.append(diffSection, timerSection, fmtSection, boothSection);
    sheet.append(head, scrollBody, launchDock);
    stage.appendChild(sheet);

    syncDiffSelection();
    syncModeSelection();

    this.mountView('QUICK_PLAY', stage);
    this.attachKeyHandler((ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        this.showTitleHub({ ...this.lastHubData, playBootTuneIn: false });
      } else if (ev.key === 'Enter') {
        const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
        if (activeTag !== 'BUTTON') {
          ev.preventDefault();
          launchQuickShow();
        }
      }
    });
  }

  // Sleek Backstage Studio Drawer alias -> 1966 Championship Trophy, Medal & Unlockables Showcase
  private openBackstageStudioDrawer(): void {
    this.openTrophyAndMedalsShowcase('TROPHIES');
  }

  /**
   * 1966 Championship Trophy, Medal & Unlockables Showcase (Balatro/Hades Grind Psychology):
   *  - Tab 1 (`TROPHIES`): Categorized 36-Trophy Gallery with 4 Metallic Tier Badges,
   *    silhouetted locked items with explicit "HOW TO UNLOCK" goals, Next-Up spotlight & 3D Vault launch.
   *  - Tab 2 (`MEDALS`): 12 Live Career Broadcast Ribbons + 8 Balatro-Style Board-Mode Mastery
   *    Stickers (with 4-Difficulty pips + 1-tap play) + Unlockable Studio Props Preview.
   *  - Tab 3 (`STUDIO`): Dedicated, uncramped Sound/Mixer, 3D Vault, Prop Shop & Episode Jump Console.
   */
  public openTrophyAndMedalsShowcase(
    initialTab: 'TROPHIES' | 'MEDALS' | 'STUDIO' = 'TROPHIES',
  ): void {
    const save = this.lastHubData.save;
    const dailySave = this.lastHubData.dailySave ?? null;
    const unlockedSet = new Set(save?.unlockedTrophyIds ?? []);
    const trophiesUnlocked = unlockedSet.size;
    const totalTrophies = TROPHY_CATALOG_V7.length;
    const relicsEquipped = save?.equippedRelics.length ?? 0;
    const equippedRelicIds = new Set((save?.equippedRelics ?? []).map((r) => r.relicId));
    const currentEp = save?.currentEpisode ?? 1;

    const catalogSummary = getTrophyCatalogSummaryV7(unlockedSet);
    const careerMedals = computeCareerMedalsV7(save, dailySave);
    const medalsEarned = careerMedals.filter((m) => m.unlocked).length;
    const overallTotal = totalTrophies + careerMedals.length;
    const overallEarned = trophiesUnlocked + medalsEarned;
    const overallPct = Math.round((overallEarned / Math.max(1, overallTotal)) * 100);

    let activeTab: 'TROPHIES' | 'MEDALS' | 'STUDIO' = initialTab;
    let activeCategory: 'ALL' | TrophyCategoryGroupV7 = 'ALL';

    const stage = document.createElement('section');
    stage.className = 'ws66-theater-stage';
    stage.setAttribute('role', 'dialog');
    stage.setAttribute('aria-modal', 'true');
    stage.setAttribute('aria-label', '1966 Championship Trophy, Medal and Unlockables Showcase');

    const sheet = document.createElement('div');
    sheet.className = 'ws66-vault-sheet';

    // Top Broadcast Masthead + Master Completion Progress Meter + Canonical Rank Title
    const head = document.createElement('header');
    head.className = 'ws66-vault-head';
    head.innerHTML = `
      <div class="ws66-vault-head-top">
        <div class="ws66-vault-head-copy">
          <span class="ws66-cue-kicker ws66-vault-rank-line"><span class="ws66-seg">${catalogSummary.rankTitle.toUpperCase()}</span><span class="ws66-sub-dot ws66-purse-cap" aria-hidden="true">·</span><span class="ws66-seg">${catalogSummary.earnedPoints}/${catalogSummary.totalPoints}&nbsp;PTS</span></span>
          <h2 class="ws66-vault-title">TROPHIES &amp; MEDALS</h2>
        </div>
      </div>
      <div class="ws66-vault-progress-strip">
        <div class="ws66-vault-counters">
          <span class="ws66-vault-counter-chip" data-tone="gold">${buildShowcaseGlyphSvg('TROPHY')}<span>${trophiesUnlocked}/${totalTrophies}<span class="ws66-chip-word"> TROPHIES</span></span></span>
          <span class="ws66-vault-counter-chip" data-tone="peacock">${buildShowcaseGlyphSvg('MEDAL')}<span>${medalsEarned}/${careerMedals.length}<span class="ws66-chip-word"> MEDALS</span></span></span>
          <span class="ws66-vault-counter-chip" data-tone="cerise">${buildShowcaseGlyphSvg('PROP')}<span>${relicsEquipped}/${RELIC_CATALOG_V7.length}<span class="ws66-chip-word"> PROPS</span></span></span>
        </div>
        <div class="ws66-vault-progress-track" role="progressbar" aria-valuenow="${overallPct}" aria-valuemin="0" aria-valuemax="100">
          <div class="ws66-vault-progress-fill" style="width:${Math.max(4, overallPct)}%"></div>
        </div>
      </div>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ws66-skip-btn';
    closeBtn.textContent = 'BACK ✕';
    closeBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      this.showTitleHub({ ...this.lastHubData, playBootTuneIn: false });
    });
    head.querySelector('.ws66-vault-head-top')?.appendChild(closeBtn);

    // 3 Crisp Segmented Studio Tabs (NEVER cramped together!)
    const tabBar = document.createElement('div');
    tabBar.className = 'ws66-vault-tabs';
    tabBar.setAttribute('role', 'tablist');

    const tabSpecs: ReadonlyArray<{
      readonly id: 'TROPHIES' | 'MEDALS' | 'STUDIO';
      readonly label: string;
    }> = [
      { id: 'TROPHIES', label: `TROPHIES (${trophiesUnlocked}/${totalTrophies})` },
      { id: 'MEDALS', label: `MEDALS & STAMPS` },
      { id: 'STUDIO', label: `SOUND & STUDIO` },
    ];
    const tabButtons: HTMLButtonElement[] = [];

    const scrollBody = document.createElement('div');
    scrollBody.className = 'ws66-vault-body';

    // Shared 8 Board Mode specs for Balatro-style mastery stickers
    const boardModeSpecs: ReadonlyArray<{
      readonly id: QuickPlayBoardModeV7;
      readonly label: string;
      readonly unlockEp: number;
    }> = [
      { id: 'CLASSIC_TOTE', label: 'CLASSIC TOTE', unlockEp: 1 },
      { id: 'TIC_TAC_LINE', label: '3-IN-A-ROW', unlockEp: 1 },
      { id: 'COAST_HEX_BRIDGE', label: 'COAST BRIDGE', unlockEp: 2 },
      { id: 'EYE_GUESS_MEMORY', label: 'EYE GUESS ’66', unlockEp: 3 },
      { id: 'CONCENTRATION_PRIZE_MATCH', label: 'PRIZE MATCH', unlockEp: 4 },
      { id: 'MONTY_CURTAIN_DEAL', label: 'CURTAIN DEAL', unlockEp: 5 },
      { id: 'PRESS_YOUR_LUCK_GREMLIN', label: 'GREMLIN BOARD', unlockEp: 6 },
      { id: 'BIG_WHEEL_SHOWCASE', label: 'BIG WHEEL', unlockEp: 7 },
    ];

    const renderActiveTab = (): void => {
      tabButtons.forEach((btn) => {
        const isActive = btn.dataset.tab === activeTab;
        btn.dataset.active = String(isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
      scrollBody.innerHTML = '';
      scrollBody.scrollTop = 0;

      if (activeTab === 'TROPHIES') {
        // 1. Category Filter Pills + 3D Turntable Vault Launch
        const topControls = document.createElement('div');
        topControls.className = 'ws66-vault-filter-bar';

        const filterPills = document.createElement('div');
        filterPills.className = 'ws66-vault-filters';
        for (const cat of TROPHY_CATEGORY_ORDER_V7) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ws66-vault-filter-btn';
          btn.dataset.active = String(activeCategory === cat);
          const count =
            cat === 'ALL'
              ? TROPHY_CATALOG_V7.length
              : TROPHY_CATALOG_V7.filter((t) => resolveTrophyShowcaseMetaV7(t).categoryGroup === cat)
                  .length;
          btn.textContent =
            cat === 'SHOWMANSHIP'
              ? `SHOW (${count})`
              : cat === 'SCOUTING & WIT'
                ? `SCOUT (${count})`
                : cat === 'BOARD MASTERY'
                  ? `BOARDS (${count})`
                  : `${cat} (${count})`;
          btn.addEventListener('click', () => {
            this.callbacks.onUiTapSfx?.();
            activeCategory = cat;
            renderActiveTab();
          });
          filterPills.appendChild(btn);
        }
        topControls.appendChild(filterPills);

        const open3dBtn = document.createElement('button');
        open3dBtn.type = 'button';
        open3dBtn.className = 'ws66-vault-3d-banner';
        open3dBtn.innerHTML = `
          <span class="ws66-vault-3d-copy">
            <strong>${buildShowcaseGlyphSvg('TURNTABLE')}<span>3D TROPHY TURNTABLE</span></strong>
            <span>Spin &amp; inspect all 36 sculpted 1966 studio awards up close</span>
          </span>
          <span class="ws66-push-arrow" aria-hidden="true">▸</span>
        `;
        open3dBtn.addEventListener('click', () => {
          this.callbacks.onUiTapSfx?.();
          this.hideAll();
          this.callbacks.onOpenTrophyVault?.();
        });
        topControls.appendChild(open3dBtn);
        scrollBody.appendChild(topControls);

        // 2. Categorized 36-Trophy Pool + Zeigarnik "NEXT UP TO UNLOCK" Spotlight (Zero Duplicate Card Below!)
        const filtered = TROPHY_CATALOG_V7.filter((spec) => {
          if (activeCategory === 'ALL') return true;
          return resolveTrophyShowcaseMetaV7(spec).categoryGroup === activeCategory;
        });

        const nextLocked = filtered.find((t) => !unlockedSet.has(t.trophyId));
        if (nextLocked) {
          const nextMeta = resolveTrophyShowcaseMetaV7(nextLocked);
          const spotlight = document.createElement('div');
          spotlight.className = 'ws66-next-grind-card';
          spotlight.dataset.trophyId = nextLocked.trophyId;
          spotlight.innerHTML = `
            <div class="ws66-next-grind-icon">${buildTrophySunlitBadgeHtml(nextLocked.sculptKind, false, nextMeta.tierKey, nextMeta.accentHex)}</div>
            <div class="ws66-next-grind-copy">
              <div class="ws66-next-grind-kicker"><span class="ws66-seg">NEXT UP TO UNLOCK</span><span class="ws66-sub-dot ws66-purse-cap" aria-hidden="true">·</span><span class="ws66-seg">SEASON ${nextLocked.season} · ${nextMeta.tierBadge}</span></div>
              <div class="ws66-next-grind-name">${nextLocked.name}</div>
              <div class="ws66-next-grind-rule">HOW TO UNLOCK: ${formatOrphanProof(nextMeta.grindHint)}</div>
            </div>
          `;
          scrollBody.appendChild(spotlight);
        }

        // 3. Remaining Trophy Grid (Deduplicated against Spotlight so Card #1 is NEVER repeated!)
        const gridItems = nextLocked
          ? filtered.filter((spec) => spec.trophyId !== nextLocked.trophyId)
          : filtered;

        const grid = document.createElement('div');
        grid.className = 'ws66-trophy-grid';

        for (const spec of gridItems) {
          const isUnlocked = unlockedSet.has(spec.trophyId);
          const meta = resolveTrophyShowcaseMetaV7(spec);
          const card = document.createElement('article');
          card.className = 'ws66-trophy-card';
          card.dataset.unlocked = String(isUnlocked);
          card.dataset.tier = meta.tierKey;
          card.innerHTML = `
            <div class="ws66-trophy-card-top">
              ${buildTrophySunlitBadgeHtml(spec.sculptKind, isUnlocked, meta.tierKey, meta.accentHex)}
              <div class="ws66-trophy-card-meta">
                <div class="ws66-trophy-badges">
                  <span class="ws66-tier-pill" data-tier="${meta.tierKey}">${meta.tierBadge}</span>
                  <span class="ws66-season-pill">S${spec.season} · +${meta.rarityPoints}</span>
                  ${isUnlocked ? '<span class="ws66-earned-seal">✓ EARNED</span>' : ''}
                </div>
                <h3 class="ws66-trophy-name">${spec.name}</h3>
                <div class="ws66-trophy-sub">${isUnlocked ? spec.engraving : meta.formLabel}</div>
              </div>
            </div>
            <div class="ws66-trophy-rule">
              <span class="ws66-rule-tag">${isUnlocked ? 'UNLOCKED:' : 'HOW TO UNLOCK:'}</span>
              ${formatOrphanProof(meta.grindHint)}
            </div>
          `;
          grid.appendChild(card);
        }

        scrollBody.appendChild(grid);
      } else if (activeTab === 'MEDALS') {
        // 1. 12 Career Broadcast Medals / Service Ribbons
        const medalHeading = document.createElement('div');
        medalHeading.className = 'ws66-vault-section-head';
        medalHeading.innerHTML = `
          <span class="ws66-vault-section-title">1966 CAREER BROADCAST MEDALS (${medalsEarned}/${careerMedals.length})</span>
          <span class="ws66-vault-section-sub">Earn striped service ribbons across Campaign, Scouting &amp; Daily shows</span>
        `;
        scrollBody.appendChild(medalHeading);

        const medalGrid = document.createElement('div');
        medalGrid.className = 'ws66-medal-grid';
        for (const medal of careerMedals) {
          const card = document.createElement('article');
          card.className = 'ws66-medal-card';
          card.dataset.unlocked = String(medal.unlocked);
          card.dataset.tier = medal.tierKey;
          card.innerHTML = `
            <div class="ws66-medal-card-top">
              ${buildCareerMedalRibbonSvg(medal.tierKey, medal.unlocked, medal.emblemKind)}
              <div class="ws66-medal-copy">
                <div class="ws66-trophy-badges">
                  <span class="ws66-tier-pill" data-tier="${medal.tierKey}">${medal.tierBadge}</span>
                  ${medal.unlocked ? '<span class="ws66-earned-seal">✓ AWARDED</span>' : ''}
                </div>
                <h3 class="ws66-trophy-name">${medal.name}</h3>
                <div class="ws66-medal-rule">${formatOrphanProof(medal.unlockRule)}</div>
              </div>
            </div>
            <div class="ws66-medal-progress-row">
              <div class="ws66-medal-bar"><div class="ws66-medal-bar-fill" style="width:${medal.progressPct}%"></div></div>
              <span class="ws66-medal-ratio">${medal.progressText}</span>
            </div>
          `;
          medalGrid.appendChild(card);
        }
        scrollBody.appendChild(medalGrid);

        // 2. Balatro-Style 8 Board-Mode Mastery Stamp Rack (4 Difficulty Stakes!)
        const stampHeading = document.createElement('div');
        stampHeading.className = 'ws66-vault-section-head';
        stampHeading.innerHTML = `
          <span class="ws66-vault-section-title">8 BOARD-FORMAT MASTERY STAMPS</span>
          <span class="ws66-vault-section-sub">Stakes: M Matinee · P Prime-Time · A All-Star · ★ Mastermind</span>
        `;
        scrollBody.appendChild(stampHeading);

        const masteredPairsRaw = (
          save as (CampaignSaveStateV7 & { readonly masteredModeDifficulties?: readonly string[] }) | undefined
        )?.masteredModeDifficulties;
        const masteredPairSet = new Set(
          Array.isArray(masteredPairsRaw)
            ? masteredPairsRaw.map((entry) => String(entry).trim().toUpperCase())
            : [],
        );
        const masteredModeSet = new Set(save?.masteredBoardModes ?? []);
        const masteredDiffSet = new Set(save?.masteredDifficulties ?? []);
        const hasPerModePairs = masteredPairSet.size > 0;

        const stampGrid = document.createElement('div');
        stampGrid.className = 'ws66-mode-stamp-grid';
        for (const mode of boardModeSpecs) {
          const modeKey = mode.id.toUpperCase();
          const pairM = masteredPairSet.has(`${modeKey}:MATINEE_EASY`);
          const pairP = masteredPairSet.has(`${modeKey}:PRIMETIME_NORMAL`);
          const pairA = masteredPairSet.has(`${modeKey}:ALLSTAR_HARD`);
          const pairS = masteredPairSet.has(`${modeKey}:MASTERMIND`);
          const hasModePair = pairM || pairP || pairA || pairS;
          const legacyModeWon = masteredModeSet.has(mode.id);

          let litMastermind = false;
          let litAllstar = false;
          let litPrimetime = false;
          let litMatinee = false;

          if (hasModePair) {
            litMastermind = pairS;
            litAllstar = pairA || litMastermind;
            litPrimetime = pairP || litAllstar;
            litMatinee = pairM || litPrimetime;
          } else if (legacyModeWon && !hasPerModePairs) {
            // Clean fallback for pre-pair legacy saves that genuinely recorded a win on this mode
            litMastermind = masteredDiffSet.has('MASTERMIND');
            litAllstar = masteredDiffSet.has('ALLSTAR_HARD') || litMastermind;
            litPrimetime = masteredDiffSet.has('PRIMETIME_NORMAL') || litAllstar;
            litMatinee =
              masteredDiffSet.size === 0 || masteredDiffSet.has('MATINEE_EASY') || litPrimetime;
          } else if (legacyModeWon) {
            // Mode was won before per-mode pair tracking: award base Matinee stamp without bleeding higher stakes
            litMatinee = true;
          }

          const modeConquered = litMatinee || litPrimetime || litAllstar || litMastermind;
          const pipsEarned =
            (litMatinee ? 1 : 0) +
            (litPrimetime ? 1 : 0) +
            (litAllstar ? 1 : 0) +
            (litMastermind ? 1 : 0);

          const card = document.createElement('div');
          card.className = 'ws66-mode-stamp-card';
          card.dataset.stamped = String(modeConquered);
          card.innerHTML = `
            <div class="ws66-mode-stamp-top">
              ${buildBoardModeMiniDiagramSvg(mode.id)}
              <div class="ws66-mode-stamp-copy">
                <div class="ws66-mode-stamp-name">${mode.label}</div>
                <div class="ws66-stake-pips" aria-label="${pipsEarned} of 4 difficulty stamps">
                  <span class="ws66-stake-pip" data-stake="bronze" data-lit="${litMatinee}">M</span>
                  <span class="ws66-stake-pip" data-stake="peacock" data-lit="${litPrimetime}">P</span>
                  <span class="ws66-stake-pip" data-stake="gold" data-lit="${litAllstar}">A</span>
                  <span class="ws66-stake-pip" data-stake="platinum" data-lit="${litMastermind}">★</span>
                </div>
              </div>
            </div>
          `;
          const playModeBtn = document.createElement('button');
          playModeBtn.type = 'button';
          playModeBtn.className = 'ws66-mode-play-btn';
          playModeBtn.textContent = pipsEarned > 0 ? 'PLAY AGAIN ▸' : 'PLAY FORMAT ▸';
          playModeBtn.addEventListener('click', () => {
            this.callbacks.onBellSfx?.();
            this.selectedQuickMode = mode.id;
            const sel: QuickPlaySelectionV7 = {
              preferredMode: mode.id,
              difficultyMode: this.selectedQuickDifficulty,
            };
            this.hideAll();
            if (this.callbacks.onQuickPlaySelected) {
              this.callbacks.onQuickPlaySelected(sel);
            } else {
              this.callbacks.onQuickShow?.(sel);
            }
          });
          card.appendChild(playModeBtn);
          stampGrid.appendChild(card);
        }
        scrollBody.appendChild(stampGrid);

        // 3. Unlockable Studio Props Preview (28 Relics -> 1-Tap Prop Shop!)
        const propHeading = document.createElement('div');
        propHeading.className = 'ws66-vault-section-head';
        propHeading.innerHTML = `
          <span class="ws66-vault-section-title">UNLOCKABLE STUDIO PROPS (${relicsEquipped}/${MAX_TRUNK_SLOTS_V7} EQUIPPED · ${RELIC_CATALOG_V7.length} TOTAL)</span>
          <span class="ws66-vault-section-sub">Collect Clean &amp; Contraband relics across 4 metallic foil finishes</span>
        `;
        scrollBody.appendChild(propHeading);

        const propPreviewGrid = document.createElement('div');
        propPreviewGrid.className = 'ws66-prop-preview-grid';
        const sampleProps = [
          ...RELIC_CATALOG_V7.filter((r) => equippedRelicIds.has(r.relicId)).slice(0, 2),
          ...RELIC_CATALOG_V7.filter((r) => !equippedRelicIds.has(r.relicId)).slice(0, 4),
        ].slice(0, 4);

        for (const relic of sampleProps) {
          const isEq = equippedRelicIds.has(relic.relicId);
          const pCard = document.createElement('div');
          pCard.className = 'ws66-prop-mini-card';
          pCard.dataset.equipped = String(isEq);
          pCard.innerHTML = `
            <div class="ws66-trophy-badges">
              <span class="ws66-tier-pill" data-tier="${relic.ledgerKind === 'CONTRABAND' ? 'platinum' : 'gold'}">${relic.ledgerKind}</span>
              <span class="ws66-season-pill">$${relic.costCash.toLocaleString()}</span>
              ${isEq ? '<span class="ws66-earned-seal">EQUIPPED</span>' : ''}
            </div>
            <div class="ws66-trophy-name">${relic.name}</div>
            <div class="ws66-medal-rule">${formatOrphanProof(relic.triggerSummary)}</div>
          `;
          propPreviewGrid.appendChild(pCard);
        }
        scrollBody.appendChild(propPreviewGrid);

        const openPropBtn = document.createElement('button');
        openPropBtn.type = 'button';
        openPropBtn.className = 'ws66-vault-3d-banner';
        openPropBtn.innerHTML = `
          <span class="ws66-vault-3d-copy">
            <strong>${buildShowcaseGlyphSvg('PROP')}<span>OPEN VELVET PROP SHOP (${RELIC_CATALOG_V7.length} STUDIO RELICS)</span></strong>
            <span>Buy, foil-upgrade &amp; build 5-slot Chips × Mult synergies</span>
          </span>
          <span class="ws66-push-arrow" aria-hidden="true">▸</span>
        `;
        openPropBtn.addEventListener('click', () => {
          this.callbacks.onUiTapSfx?.();
          this.hideAll();
          this.callbacks.onOpenPropShop?.();
        });
        scrollBody.appendChild(openPropBtn);
      } else {
        // Tab 3: Clean, Uncramped Sound, Mixer & Studio Backstage Console
        const consoleGrid = document.createElement('div');
        consoleGrid.className = 'ws66-studio-console-grid';

        const consoleItems: ReadonlyArray<{
          readonly badge: string;
          readonly glyph: 'AUDIO' | 'TURNTABLE' | 'PROP' | 'TV' | 'GUIDE';
          readonly title: string;
          readonly sub: string;
          readonly tone: string;
          readonly onClick?: () => void;
        }> = [
          {
            badge: 'AUDIO & MOTION',
            glyph: 'AUDIO',
            title: 'SOUND, MIXER & OPTIONS',
            sub: 'Live 1966 Showband Orchestra, SFX, Studio Crowd, Haptics & Reduced Motion.',
            tone: 'peacock',
            onClick: () => {
              this.hideAll();
              this.callbacks.onOpenAudioSettings?.();
            },
          },
          {
            badge: `${trophiesUnlocked} / ${totalTrophies} UNLOCKED`,
            glyph: 'TURNTABLE',
            title: '3D REVOLVING TROPHY VAULT',
            sub: 'Spin every sculpted 24K Gold & Platinum award on the live 3D showcase turntable.',
            tone: 'gold',
            onClick: () => {
              this.hideAll();
              this.callbacks.onOpenTrophyVault?.();
            },
          },
          {
            badge: `${relicsEquipped} / ${MAX_TRUNK_SLOTS_V7} EQUIPPED`,
            glyph: 'PROP',
            title: 'VELVET PROP SHOP (28 RELICS)',
            sub: 'Browse Clean & Contraband broadcast relics across 4 metallic foil finishes.',
            tone: 'cerise',
            onClick: () => {
              this.hideAll();
              this.callbacks.onOpenPropShop?.();
            },
          },
          {
            badge: `EPISODE ${currentEp} OF 90`,
            glyph: 'TV',
            title: 'EPISODE JUMP (SEASONS 1–4)',
            sub: 'Jump straight to any unlocked Stage, Board & Champion across all 4 Seasons.',
            tone: 'cobalt',
            onClick: () => {
              this.hideAll();
              this.callbacks.onOpenEpisodeJump?.();
            },
          },
          {
            badge: '30-SECOND BRIEFING',
            glyph: 'GUIDE',
            title: 'HOW TO PLAY & TV TWISTS',
            sub: 'Review the Tote Board twists, 30-second clock, Lifelines & scoring rules.',
            tone: 'tangerine',
            onClick: () => {
              this.openHowToPlaySheet({
                episodeBlueprint: this.lastHubData.episodeBlueprint,
                onClose: () => this.showTitleHub({ ...this.lastHubData, playBootTuneIn: false }),
              });
            },
          },
        ];

        for (const item of consoleItems) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ws66-console-card-btn';
          btn.dataset.tone = item.tone;
          btn.innerHTML = `
            <span class="ws66-console-card-badge">${item.badge}</span>
            <span class="ws66-console-card-title">${buildShowcaseGlyphSvg(item.glyph)}<span>${item.title}</span></span>
            <span class="ws66-console-card-sub">${formatOrphanProof(item.sub)}</span>
          `;
          btn.addEventListener('click', () => {
            this.callbacks.onUiTapSfx?.();
            item.onClick?.();
          });
          consoleGrid.appendChild(btn);
        }

        scrollBody.appendChild(consoleGrid);
      }
    };

    for (const tab of tabSpecs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ws66-vault-tab-btn';
      btn.dataset.tab = tab.id;
      btn.setAttribute('role', 'tab');
      btn.textContent = tab.label;
      btn.addEventListener('click', () => {
        this.callbacks.onUiTapSfx?.();
        activeTab = tab.id;
        renderActiveTab();
      });
      tabButtons.push(btn);
      tabBar.appendChild(btn);
    }

    sheet.append(head, tabBar, scrollBody);
    stage.appendChild(sheet);

    this.mountView('BACKSTAGE', stage);
    renderActiveTab();

    this.attachKeyHandler((ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        this.showTitleHub({ ...this.lastHubData, playBootTuneIn: false });
      }
    });
  }

  // --------------------------------------------------------------------------
  // Deliverable 2: Immediate Campaign Story Cold-Open & 30-Second Host Rules
  // --------------------------------------------------------------------------

  public playStoryAndRulesColdOpen(options: StoryColdOpenOptionsV7 = {}): Promise<void> {
    this.resolvePendingColdOpen();
    return new Promise<void>((resolve) => {
      this.activeColdOpenResolve = resolve;
      this.renderCueCardSequence({
        mode: 'COLD_OPEN',
        initialBeat: options.startBeat ?? 0,
        episodeBlueprint: options.episodeBlueprint ?? this.lastHubData.episodeBlueprint,
        rivalName: options.rivalName,
        boardModeSummary: options.boardModeSummary,
        onBeatChanged: options.onBeatChanged,
        onFinish: () => {
          this.markColdOpenCompleted();
          this.activeColdOpenResolve = null;
          this.hideAll();
          resolve();
        },
      });
    });
  }

  public openHowToPlaySheet(optionsOrOnClose?: HowToPlaySheetOptionsV7 | (() => void)): void {
    const opts: HowToPlaySheetOptionsV7 =
      typeof optionsOrOnClose === 'function'
        ? { onClose: optionsOrOnClose }
        : optionsOrOnClose ?? {};

    this.renderCueCardSequence({
      mode: 'HOW_TO_PLAY',
      initialBeat: opts.initialTab ?? 0,
      episodeBlueprint: opts.episodeBlueprint ?? this.lastHubData.episodeBlueprint,
      boardModeSummary: opts.boardModeSummary,
      onFinish: () => {
        this.hideAll();
        opts.onClose?.();
      },
    });
  }

  private renderCueCardSequence(cfg: {
    readonly mode: 'COLD_OPEN' | 'HOW_TO_PLAY';
    readonly initialBeat: 0 | 1 | 2;
    readonly episodeBlueprint?: EpisodeBlueprintV7;
    readonly rivalName?: string;
    readonly boardModeSummary?: { readonly modeTitle: string; readonly ruleSummary: string };
    readonly onBeatChanged?: (beatIndex: 0 | 1 | 2) => void;
    readonly onFinish: () => void;
  }): void {
    let currentBeat: 0 | 1 | 2 = cfg.initialBeat;
    const isColdOpen = cfg.mode === 'COLD_OPEN';

    const rivalProfile = cfg.episodeBlueprint
      ? (CAST_PROFILES_V7[cfg.episodeBlueprint.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO)
      : CAST_PROFILES_V7.CARMEN_DELGADO;
    const tonightRival = cfg.rivalName ?? rivalProfile?.name ?? 'Dotty Vance';

    const stage = document.createElement('section');
    stage.className = 'ws66-theater-stage';
    stage.setAttribute('role', 'dialog');
    stage.setAttribute('aria-modal', 'true');
    stage.setAttribute(
      'aria-label',
      isColdOpen ? '1966 Broadcast Story Cold Open and Rules' : 'How to Play Studio Guide',
    );

    const shell = document.createElement('div');
    shell.className = 'ws66-cue-shell';

    // Top Monitor Strip: 3 Interactive Cue Lamps + Skip / Close
    const topbar = document.createElement('div');
    topbar.className = 'ws66-cue-topbar';

    const lampsWrap = document.createElement('div');
    lampsWrap.className = 'ws66-beat-lamps';
    lampsWrap.setAttribute('role', 'tablist');

    const beatTitles: readonly [string, string, string] = [
      '1·STORY',
      '2·BOARD',
      '3·RULES',
    ];
    const lampButtons: HTMLButtonElement[] = [];

    const cardHost = document.createElement('div');

    const renderBeat = (beat: 0 | 1 | 2): void => {
      currentBeat = beat;
      cfg.onBeatChanged?.(beat);
      lampButtons.forEach((btn, idx) => {
        btn.dataset.active = String(idx === beat);
        btn.setAttribute('aria-selected', String(idx === beat));
      });

      const card = document.createElement('article');
      card.className = 'ws66-cue-card';

      if (beat === 0) {
        card.innerHTML = `
          <div class="ws66-cue-band" data-theme="story">
            <div class="ws66-cue-band-copy">
              <span class="ws66-cue-kicker">${isColdOpen ? 'LIVE COLD OPEN · 1 OF 3' : 'STUDIO GUIDE · 1 OF 3'}</span>
              <h2 class="ws66-cue-title">FIFTY MILLION WATCHING</h2>
            </div>
            <div class="ws66-cue-art">${buildColdOpenBeatArtSvg(0)}</div>
          </div>
          <div class="ws66-cue-body">
            <p class="ws66-cue-lead">
              ${formatOrphanProof(
                'Live from Studio 6A in New York City, fifty million viewers are tuned in coast-to-coast in Living Color. You are the unvetted challenger facing IBC’s undefeated Champions for the $222,000 Grand Purse—while rumors swirl that Control Booth A is secretly rigging the boards.',
              )}
            </p>
            <div class="ws66-announcer-line">
              <span class="ws66-announcer-speaker">${buildShowcaseGlyphSvg('MIC')}<span>STUDIO ANNOUNCER · TONIGHT’S MATCHUP</span></span>
              ${formatOrphanProof(
                `Step under the lights against ${tonightRival}. Win episodes to bank your purse and uncover who is pulling the strings upstairs.`,
              )}
            </div>
          </div>
        `;
      } else if (beat === 1) {
        card.innerHTML = `
          <div class="ws66-cue-band" data-theme="board">
            <div class="ws66-cue-band-copy">
              <span class="ws66-cue-kicker">${isColdOpen ? 'THE GAME BOARD · 2 OF 3' : 'STUDIO GUIDE · 2 OF 3'}</span>
              <h2 class="ws66-cue-title">GIANT TOTE BOARD &amp; TV TWISTS</h2>
            </div>
            <div class="ws66-cue-art">${buildColdOpenBeatArtSvg(1)}</div>
          </div>
          <div class="ws66-cue-body">
            <p class="ws66-cue-lead">
              ${formatOrphanProof(
                'Tap any bright dollar tile ($150 to $500) on the illuminated board. Watch for four classic 1966 TV twists built right into the rack:',
              )}
            </p>
            <div class="ws66-twist-list">
              <div class="ws66-twist-row">
                <span class="ws66-twist-badge" data-kind="vault" aria-hidden="true">${buildColdOpenTwistBadgeSvg('vault')}</span>
                <div class="ws66-twist-text">
                  <span class="ws66-twist-name">Locked Vault ($500)</span>
                  <span class="ws66-twist-desc">Win any adjacent tile or hit a 2-streak to crack the gold jackpot open.</span>
                </div>
              </div>
              <div class="ws66-twist-row">
                <span class="ws66-twist-badge" data-kind="secret" aria-hidden="true">${buildColdOpenTwistBadgeSvg('secret')}</span>
                <div class="ws66-twist-text">
                  <span class="ws66-twist-name">Secret Square (2×)</span>
                  <span class="ws66-twist-desc">Hidden Daily Double chime! Play immediately for double dollars.</span>
                </div>
              </div>
              <div class="ws66-twist-row">
                <span class="ws66-twist-badge" data-kind="opponent" aria-hidden="true">${buildColdOpenTwistBadgeSvg('opponent')}</span>
                <div class="ws66-twist-text">
                  <span class="ws66-twist-name">Opponent’s Choice</span>
                  <span class="ws66-twist-desc">Force a tough category on your Rival—or beat their pick for a bonus.</span>
                </div>
              </div>
              <div class="ws66-twist-row">
                <span class="ws66-twist-badge" data-kind="mystery" aria-hidden="true">${buildColdOpenTwistBadgeSvg('mystery')}</span>
                <div class="ws66-twist-text">
                  <span class="ws66-twist-name">Mystery Curtain</span>
                  <span class="ws66-twist-desc">Door #1, #2, or #3! Reveal instant cash, a rival steal, or a wild bonus.</span>
                </div>
              </div>
            </div>
            ${
              cfg.boardModeSummary
                ? `<div class="ws66-announcer-line"><span class="ws66-announcer-speaker">${buildShowcaseGlyphSvg('TV')}<span>ACTIVE STAGE FORMAT · ${cfg.boardModeSummary.modeTitle.toUpperCase()}</span></span>${formatOrphanProof(cfg.boardModeSummary.ruleSummary)}</div>`
                : ''
            }
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="ws66-cue-band" data-theme="win">
            <div class="ws66-cue-band-copy">
              <span class="ws66-cue-kicker">${isColdOpen ? 'HOW TO WIN · 3 OF 3' : 'STUDIO GUIDE · 3 OF 3'}</span>
              <h2 class="ws66-cue-title">OUTBANK THE CHAMPION</h2>
            </div>
            <div class="ws66-cue-art">${buildColdOpenBeatArtSvg(2)}</div>
          </div>
          <div class="ws66-cue-body">
            <div class="ws66-rules-trio">
              <div class="ws66-rule-pillar" data-tone="peacock">
                <div class="ws66-rule-head-row">
                  <span class="ws66-rule-num">10 TURNS</span>
                  <span class="ws66-rule-heading">HEAD-TO-HEAD</span>
                </div>
                <span class="ws66-rule-detail">Trade picks with the Champion across one brisk broadcast.</span>
              </div>
              <div class="ws66-rule-pillar" data-tone="cobalt">
                <div class="ws66-rule-head-row">
                  <span class="ws66-rule-num">30 SEC</span>
                  <span class="ws66-rule-heading">STUDIO CLOCK</span>
                </div>
                <span class="ws66-rule-detail">Generous thinking time—calm groove until the final 5 seconds.</span>
              </div>
              <div class="ws66-rule-pillar" data-tone="cerise">
                <div class="ws66-rule-head-row">
                  <span class="ws66-rule-num">75 / 25</span>
                  <span class="ws66-rule-heading">TRIVIA MIX</span>
                </div>
                <span class="ws66-rule-detail">75% classic 4-option trivia plus 25% special TV bonus rounds.</span>
              </div>
            </div>
            <p class="ws66-cue-lead">
              ${formatOrphanProof(
                'Hold more cash than the Champion after Turn 10 to win the episode, pocket your purse, and advance the backstage story!',
              )}
            </p>
          </div>
        `;
      }

      // Action Strip inside the Cue Card Body
      const bodyEl = card.querySelector('.ws66-cue-body');
      const actions = document.createElement('div');
      actions.className = 'ws66-cue-actions';

      if (beat > 0) {
        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'ws66-back-btn';
        backBtn.textContent = '◂ BACK';
        backBtn.addEventListener('click', () => {
          this.callbacks.onUiTapSfx?.();
          renderBeat((beat - 1) as 0 | 1 | 2);
        });
        actions.appendChild(backBtn);
      } else if (!isColdOpen && this.callbacks.onOpenAudioSettings) {
        const soundBtn = document.createElement('button');
        soundBtn.type = 'button';
        soundBtn.className = 'ws66-back-btn ws66-sound-jump-btn';
        soundBtn.innerHTML = `${buildShowcaseGlyphSvg('AUDIO')}<span>SOUND</span>`;
        soundBtn.addEventListener('click', () => {
          this.callbacks.onUiTapSfx?.();
          this.hideAll();
          this.callbacks.onOpenAudioSettings?.();
        });
        actions.appendChild(soundBtn);
      }

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      if (beat < 2) {
        nextBtn.className = 'ws66-push-btn ws66-push-hero';
        const nextLabel = beat === 0 ? 'NEXT: THE BOARD & TWISTS' : 'NEXT: RULES';
        nextBtn.innerHTML = `
          <span class="ws66-push-copy">
            <span class="ws66-push-lead-row">
              <span class="ws66-pilot-bulb" aria-hidden="true"></span>
              <span class="ws66-push-label">${nextLabel}</span>
            </span>
          </span>
          <span class="ws66-push-arrow" aria-hidden="true">▸</span>
        `;
        nextBtn.addEventListener('click', () => {
          this.callbacks.onUiTapSfx?.();
          renderBeat((beat + 1) as 0 | 1 | 2);
        });
      } else {
        nextBtn.className = 'ws66-push-btn ws66-push-gold';
        const doneLabel = isColdOpen ? 'STEP ONTO STAGE 6A ▸' : 'GOT IT — BACK TO STUDIO';
        nextBtn.innerHTML = `
          <span class="ws66-push-lead-row">
            <span class="ws66-pilot-bulb" aria-hidden="true"></span>
            <span class="ws66-push-label">${doneLabel}</span>
          </span>
        `;
        nextBtn.addEventListener('click', () => {
          this.callbacks.onBellSfx?.();
          cfg.onFinish();
        });
      }

      actions.appendChild(nextBtn);
      bodyEl?.appendChild(actions);

      cardHost.innerHTML = '';
      cardHost.appendChild(card);
    };

    beatTitles.forEach((label, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ws66-beat-lamp-btn';
      btn.setAttribute('role', 'tab');
      btn.innerHTML = `<span class="ws66-pilot-bulb" aria-hidden="true"></span><span>${label}</span>`;
      btn.addEventListener('click', () => {
        this.callbacks.onUiTapSfx?.();
        renderBeat(idx as 0 | 1 | 2);
      });
      lampButtons.push(btn);
      lampsWrap.appendChild(btn);
    });

    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'ws66-skip-btn';
    skipBtn.dataset.action = 'skip-cold-open';
    skipBtn.innerHTML = isColdOpen
      ? `SKIP<span class="ws66-skip-long"> TO STAGE</span> ▸`
      : 'CLOSE ✕';
    skipBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      cfg.onFinish();
    });

    topbar.append(lampsWrap, skipBtn);
    shell.append(topbar, cardHost);
    stage.appendChild(shell);

    this.mountView(isColdOpen ? 'COLD_OPEN' : 'HOW_TO_PLAY', stage);
    renderBeat(currentBeat);

    this.attachKeyHandler((ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        cfg.onFinish();
      } else if (ev.key === 'ArrowRight' || ev.key === 'Enter') {
        ev.preventDefault();
        if (currentBeat < 2) {
          this.callbacks.onUiTapSfx?.();
          renderBeat((currentBeat + 1) as 0 | 1 | 2);
        } else {
          this.callbacks.onBellSfx?.();
          cfg.onFinish();
        }
      } else if (ev.key === 'ArrowLeft' && currentBeat > 0) {
        ev.preventDefault();
        this.callbacks.onUiTapSfx?.();
        renderBeat((currentBeat - 1) as 0 | 1 | 2);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Deliverable 3: Shareable Daily 1966 Broadcast Post-Show Result Card
  // --------------------------------------------------------------------------

  public showDailyBroadcastResultModal(
    saveOrOptions: DailyBroadcastSaveV7 | DailyBroadcastResultModalOptionsV7,
  ): Promise<DailyModalActionResultV7> {
    this.resolvePendingDaily('BACK_TO_STUDIO');

    const opts: DailyBroadcastResultModalOptionsV7 =
      'save' in saveOrOptions ? saveOrOptions : { save: saveOrOptions };

    const { save } = opts;
    const result = save.todayResult;
    const episodeNumber = result?.episodeNumber ?? 1;
    const dateLabel =
      opts.dateLabel ??
      (result?.dateIso
        ? formatReadableDateFromIso(result.dateIso)
        : formatReadableDateFromIso(getLocalTodayIso()));
    const playerCash = Math.max(0, Math.floor(result?.playerCash ?? 0));
    const rivalCash = Math.max(0, Math.floor(result?.rivalCash ?? 0));
    const isExactTie = playerCash === rivalCash;
    const won = Boolean(result?.won) || playerCash >= rivalCash;
    const tileHistory: readonly DailyTileOutcomeV7[] = result?.tileHistory?.length
      ? result.tileHistory
      : ['WIN', 'SECRET_WIN', 'VAULT_WIN', 'MYSTERY_WIN', 'SHOWCASE_WIN'];
    const shareText = formatDailyShareTextFallbackV7(save);
    const winPct =
      save.gamesPlayed > 0
        ? Math.round((save.gamesWon / save.gamesPlayed) * 100)
        : won
          ? 100
          : 0;

    if (won) {
      this.callbacks.onCelebrateSfx?.();
    }

    return new Promise<DailyModalActionResultV7>((resolve) => {
      this.activeDailyResolve = resolve;

      const stage = document.createElement('section');
      stage.className = 'ws66-theater-stage';
      stage.setAttribute('role', 'dialog');
      stage.setAttribute('aria-modal', 'true');
      stage.setAttribute('aria-label', 'Daily 1966 Broadcast Results and Share Card');

      const card = document.createElement('article');
      card.className = 'ws66-daily-card';

      const masthead = document.createElement('header');
      masthead.className = 'ws66-daily-masthead';
      masthead.dataset.won = String(won);
      const verdictHeading = isExactTie
        ? '★ CO-CHAMPION FINISH!'
        : won
          ? '★ CHAMPION DEFEATED!'
          : 'STUDIO PHOTO FINISH';
      masthead.innerHTML = `
        <div class="ws66-daily-edition">${buildShowcaseGlyphSvg('TV')}<span class="ws66-seg">DAILY 1966 BROADCAST #${episodeNumber}</span><span class="ws66-sub-dot ws66-purse-cap" aria-hidden="true">·</span><span class="ws66-seg">${dateLabel.toUpperCase()}</span></div>
        <h2 class="ws66-daily-verdict">${verdictHeading}</h2>
        <div class="ws66-daily-saved-pill">✓ DAILY STREAK &amp; SCORE SAVED</div>
      `;

      const body = document.createElement('div');
      body.className = 'ws66-daily-body';

      // Solari Split-Flap Scoreboard
      const rivalLabel = (opts.rivalName ?? 'CHAMPION').toUpperCase();
      const scoreboard = document.createElement('div');
      scoreboard.className = 'ws66-solari-scoreboard';
      scoreboard.innerHTML = `
        <div class="ws66-solari-side" data-side="player">
          <span class="ws66-solari-who">YOUR PURSE</span>
          <span class="ws66-solari-cash">$${playerCash.toLocaleString()}</span>
        </div>
        <div class="ws66-solari-vs">VS</div>
        <div class="ws66-solari-side" data-side="rival">
          <span class="ws66-solari-who">${rivalLabel}</span>
          <span class="ws66-solari-cash">$${rivalCash.toLocaleString()}</span>
        </div>
      `;

      // Glowing 1966 High-Contrast Broadcast Tote Recap Strip (Exact 1:1 Turn Parity with Share Card!)
      const emojiWrap = document.createElement('div');
      emojiWrap.className = 'ws66-emoji-strip-wrap';
      const tilesMarkup = tileHistory
        .map((outcome, idx) => {
          const info = DAILY_TILE_EMOJI_MAP[outcome] ?? DAILY_TILE_EMOJI_MAP.WIN;
          return `<span class="ws66-recap-tile" data-kind="${outcome}" data-turn-index="${idx + 1}" title="Turn ${idx + 1}: ${info.label}" aria-label="Turn ${idx + 1}: ${info.label}">${buildDailyRecapTileGlyphSvg(outcome)}</span>`;
        })
        .join('');
      emojiWrap.innerHTML = `
        <span class="ws66-emoji-strip-label">TODAY’S TOTE BOARD RECAP</span>
        <div class="ws66-tile-recap-row">${tilesMarkup}</div>
      `;

      // Unified Horizontal Streak & Stats Band
      const statsBand = document.createElement('div');
      statsBand.className = 'ws66-daily-stats-band';
      statsBand.innerHTML = `
        <div class="ws66-daily-stat">
          <span class="ws66-daily-stat-val">${buildShowcaseGlyphSvg('FLAME')}<span>${save.currentStreak}</span></span>
          <span class="ws66-daily-stat-lbl">Streak</span>
        </div>
        <div class="ws66-daily-stat">
          <span class="ws66-daily-stat-val">${buildShowcaseGlyphSvg('TROPHY')}<span>${save.bestStreak}</span></span>
          <span class="ws66-daily-stat-lbl">Best</span>
        </div>
        <div class="ws66-daily-stat">
          <span class="ws66-daily-stat-val">${winPct}%</span>
          <span class="ws66-daily-stat-lbl">Win Rate</span>
        </div>
      `;

      // Spoiler-Free Share Clipping Preview
      const preview = document.createElement('div');
      preview.className = 'ws66-share-preview';
      preview.textContent = shareText;

      // Actions: 1-Tap Share Daily Card + Play Again / Back to Studio
      const actions = document.createElement('div');
      actions.className = 'ws66-daily-actions';

      const shareBtn = document.createElement('button');
      shareBtn.type = 'button';
      shareBtn.className = 'ws66-push-btn ws66-push-gold';
      shareBtn.dataset.action = 'share-daily-card';
      shareBtn.innerHTML = `
        <span class="ws66-push-lead-row">
          <span class="ws66-pilot-bulb" aria-hidden="true"></span>
          ${buildDailyShareIconSvg()}
          <span class="ws66-push-label">SHARE DAILY CARD</span>
        </span>
      `;
      shareBtn.addEventListener('click', () => {
        this.callbacks.onBellSfx?.();
        void this.executeDailyShare(shareText, opts.onShareComplete);
      });

      const showReplayBtn = opts.allowReplay !== false;
      const secondaryRow = document.createElement('div');
      secondaryRow.className = 'ws66-daily-secondary-row';
      secondaryRow.dataset.single = showReplayBtn ? 'false' : 'true';

      const finishDaily = (choice: DailyModalActionResultV7): void => {
        this.callbacks.onUiTapSfx?.();
        this.activeDailyResolve = null;
        this.hideAll();
        if (choice === 'PLAY_AGAIN') {
          opts.onPlayAgain?.();
        } else {
          opts.onBackToStudio?.();
          this.showToast('✓ DAILY SCORE & STREAK SAVED!');
        }
        resolve(choice);
      };

      if (showReplayBtn) {
        const replayBtn = document.createElement('button');
        replayBtn.type = 'button';
        replayBtn.className = 'ws66-push-btn ws66-push-daily ws66-daily-replay-btn';
        replayBtn.dataset.action = 'replay-daily';
        replayBtn.innerHTML = `<span class="ws66-push-label ws66-replay-label">↻ REPLAY FOR FUN</span>`;
        replayBtn.addEventListener('click', () => finishDaily('PLAY_AGAIN'));
        secondaryRow.appendChild(replayBtn);
      }

      const studioBtn = document.createElement('button');
      studioBtn.type = 'button';
      studioBtn.className = 'ws66-back-btn ws66-save-exit-btn';
      studioBtn.dataset.action = 'back-to-studio';
      studioBtn.innerHTML = `${buildShowcaseGlyphSvg('SAVE')}<span>SAVE &amp; EXIT</span>`;
      studioBtn.addEventListener('click', () => finishDaily('BACK_TO_STUDIO'));
      secondaryRow.appendChild(studioBtn);

      actions.append(shareBtn, secondaryRow);
      if (this.callbacks.onOpenWalnutShareCard || this.callbacks.onPlayEndCredits) {
        const deluxeRow = document.createElement('div');
        deluxeRow.className = 'ws66-daily-secondary-row';
        deluxeRow.dataset.single =
          this.callbacks.onOpenWalnutShareCard && this.callbacks.onPlayEndCredits
            ? 'false'
            : 'true';
        if (this.callbacks.onOpenWalnutShareCard) {
          const tvPngBtn = document.createElement('button');
          tvPngBtn.type = 'button';
          tvPngBtn.className = 'ws66-back-btn ws66-save-exit-btn';
          tvPngBtn.innerHTML = '<span>★ WALNUT TV CARD (PNG)</span>';
          tvPngBtn.addEventListener('click', () => {
            this.callbacks.onUiTapSfx?.();
            this.callbacks.onOpenWalnutShareCard?.();
          });
          deluxeRow.appendChild(tvPngBtn);
        }
        if (this.callbacks.onPlayEndCredits) {
          const creditsBtn = document.createElement('button');
          creditsBtn.type = 'button';
          creditsBtn.className = 'ws66-back-btn ws66-save-exit-btn';
          creditsBtn.innerHTML = '<span>1966 CREDITS ▶</span>';
          creditsBtn.addEventListener('click', () => {
            this.callbacks.onUiTapSfx?.();
            this.callbacks.onPlayEndCredits?.();
          });
          deluxeRow.appendChild(creditsBtn);
        }
        actions.appendChild(deluxeRow);
      }

      const officialNote = document.createElement('div');
      officialNote.className = 'ws66-daily-official-note';
      officialNote.textContent = 'OFFICIAL SCORE LOCKED · REPLAYS ARE JUST FOR FUN';

      body.append(scoreboard, emojiWrap, statsBand, preview, actions, officialNote);
      card.append(masthead, body);
      stage.appendChild(card);

      this.mountView('DAILY_RESULT', stage);
      this.attachKeyHandler((ev) => {
        if (ev.key === 'Escape') {
          ev.preventDefault();
          finishDaily('BACK_TO_STUDIO');
        }
      });
    });
  }

  private async executeDailyShare(
    shareText: string,
    onShareComplete?: (method: 'WEB_SHARE' | 'CLIPBOARD') => void,
  ): Promise<void> {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: "World's Smartest · Daily 1966 Broadcast",
          text: shareText,
        });
        this.showToast('✓ SHARED LIVE FROM STUDIO 6A!');
        onShareComplete?.('WEB_SHARE');
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
      }
    }

    const copied = await this.copyTextToClipboard(shareText);
    if (copied) {
      this.showToast('✓ DAILY CARD COPIED — READY TO PASTE & SHARE!');
      onShareComplete?.('CLIPBOARD');
    } else {
      this.showToast('SELECT THE CARD ABOVE TO COPY YOUR RESULT!');
    }
  }

  private async copyTextToClipboard(text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall back to execCommand below
      }
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', 'true');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.pointerEvents = 'none';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }

  public showToast(message: string, durationMs = 2600): void {
    if (this.toastTimerId !== null) {
      window.clearTimeout(this.toastTimerId);
      this.toastTimerId = null;
    }
    this.toastEl.textContent = message;
    this.toastEl.classList.remove('ws66-hidden');
    this.toastTimerId = window.setTimeout(() => {
      this.toastEl.classList.add('ws66-hidden');
      this.toastTimerId = null;
    }, Math.max(1000, durationMs));
  }

  // --------------------------------------------------------------------------
  // Internal View & Event Lifecycle Helpers
  // --------------------------------------------------------------------------

  private mountView(
    view: 'TITLE_HUB' | 'COLD_OPEN' | 'HOW_TO_PLAY' | 'BACKSTAGE' | 'QUICK_PLAY' | 'DAILY_RESULT',
    contentEl: HTMLElement,
  ): void {
    this.dismissTuneInCurtain();
    this.detachAudioUnlockListeners?.();
    this.detachAudioUnlockListeners = null;
    this.detachKeyHandler();
    this.activeView = view;
    if (view === 'TITLE_HUB') {
      const strayHubs = this.host.querySelectorAll('.ws66-title-stage, .ws9-hub-stage');
      strayHubs.forEach((el) => el.remove());
    }
    this.stageLayerEl.innerHTML = '';
    this.stageLayerEl.appendChild(contentEl);
    this.rootEl.classList.remove('ws66-hidden');
  }

  private attachKeyHandler(fn: (ev: KeyboardEvent) => void): void {
    this.detachKeyHandler();
    this.activeKeyHandler = fn;
    window.addEventListener('keydown', fn);
  }

  private detachKeyHandler(): void {
    if (this.activeKeyHandler) {
      window.removeEventListener('keydown', this.activeKeyHandler);
      this.activeKeyHandler = null;
    }
  }

  private resolvePendingColdOpen(): void {
    if (this.activeColdOpenResolve) {
      const r = this.activeColdOpenResolve;
      this.activeColdOpenResolve = null;
      r();
    }
  }

  private resolvePendingDaily(result: DailyModalActionResultV7): void {
    if (this.activeDailyResolve) {
      const r = this.activeDailyResolve;
      this.activeDailyResolve = null;
      r(result);
    }
  }
}
