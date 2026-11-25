/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.6 — 1966 IN LIVING COLOR)
// `src/v7/ui/TitleAndOnboardingV7.ts`
// AAA Broadcast Motion & Onboarding Controller:
//  0. Crisp 0.85s Skippable 1966 NBC/CBS Peacock Kaleidoscope Cold-Boot Tune-In
//  1. Animated 1966 "IN LIVING COLOR" Title Screen Hub (Zero AI Boxes!)
//  2. Immediate 3-Beat Campaign Story Cold-Open & 30-Second Host Rules Sequence
//     + Reusable Interactive `openHowToPlaySheet()` Studio Guide
//  3. Shareable Daily 1966 Broadcast Post-Show TV Guide / Solari Result Card
// ============================================================================

import '../../styles/title_1966_v7.css';
import {
  type CampaignSaveStateV7,
  type DailyBroadcastSaveV7,
  type EpisodeBlueprintV7,
} from '../contracts_v7';
import { CAST_PROFILES_V7, MAX_TRUNK_SLOTS_V7 } from '../campaign/CastAndRelicsCatalogV7';

const COLD_OPEN_SEEN_STORAGE_KEY = 'ws_v7_cold_open_seen_1';
const DEFAULT_TUNEIN_DURATION_MS = 850;

// ----------------------------------------------------------------------------
// 1. Public Contracts & Callback Interfaces
// ----------------------------------------------------------------------------

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
  readonly onQuickShow?: () => void;
  readonly onOpenHowToPlay?: () => void;
  readonly onOpenTrophiesAndSound?: () => void;
  readonly onOpenTrophyVault?: () => void;
  readonly onOpenAudioSettings?: () => void;
  readonly onOpenPropShop?: () => void;
  readonly onOpenEpisodeJump?: () => void;
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
  if (res?.shareText && res.shareText.trim().length > 0) {
    return res.shareText.trim();
  }
  const epNum = res?.episodeNumber ?? 1;
  const dateLabel = res?.dateIso ? formatReadableDateFromIso(res.dateIso) : formatReadableDateFromIso(getLocalTodayIso());
  const pCash = Math.max(0, Math.floor(res?.playerCash ?? 0));
  const rCash = Math.max(0, Math.floor(res?.rivalCash ?? 0));
  const won = Boolean(res?.won);
  const tiles = res?.tileHistory?.length
    ? res.tileHistory.map((t) => DAILY_TILE_EMOJI_MAP[t]?.emoji ?? '🟦🟩').join(' ')
    : '🟦🟩 ⭐🟩 🔒🟩 ❓🟩 🎯🟩';
  const verdict = won ? 'BEAT THE CHAMP!' : 'CLOSE FINISH!';
  const streakPart = save.currentStreak > 0 ? ` · 🔥 Streak: ${save.currentStreak}` : '';
  return [
    `📺 WORLD'S SMARTEST · 1966 Daily Broadcast #${epNum} (${dateLabel})`,
    `${won ? '🏆' : '🎙️'} $${pCash.toLocaleString()} vs Champ $${rCash.toLocaleString()} · ${verdict}${streakPart}`,
    tiles,
    `Play today's 1966 Living Color TV board!`,
  ].join('\n');
}

// ----------------------------------------------------------------------------
// 3. Bespoke 1966 Inline SVG Motion Artwork (Zero External Asset Fragility)
// ----------------------------------------------------------------------------

function buildPeacockEmblemSvg(className = 'ws66-peacock-svg'): string {
  return `
    <svg class="${className}" viewBox="0 0 88 56" fill="none" aria-hidden="true">
      <path d="M44 46 C37 28 19 25 10 34 C5 39 10 47 21 46 Z" fill="#F4A91F"/>
      <path d="M44 46 C34 22 18 11 16 17 C13 24 23 36 37 45 Z" fill="#FF6738"/>
      <path d="M44 45 C39 18 32 5 35 6 C41 8 44 25 44 45 Z" fill="#E63B7A"/>
      <path d="M44 45 C44 25 47 8 53 6 C56 5 49 18 44 45 Z" fill="#7B3FE4"/>
      <path d="M44 46 C51 36 69 24 72 17 C70 11 54 22 44 46 Z" fill="#1E56C5"/>
      <path d="M44 46 C51 28 69 25 78 34 C83 39 78 47 67 46 Z" fill="#00A5B5"/>
      <path d="M41 47 L44 24 C45 21 48 22 47 25 L47 47 Z" fill="#FFF7E6"/>
      <circle cx="44" cy="21" r="3.4" fill="#FFF7E6"/>
      <path d="M47 21 L52 22.5 L47 24 Z" fill="#F4A91F"/>
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
      <circle cx="220" cy="220" r="88" fill="#0D2238" fill-opacity="0.88" stroke="#FFD966" stroke-width="4"/>
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
          <stop offset="100%" stop-color="#081524" stop-opacity="0"/>
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
      `<circle cx="${x.toFixed(1)}" cy="${y}" r="5.4" fill="#0D2238"/>`,
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

function buildColdOpenBeatArtSvg(beat: 0 | 1 | 2): string {
  if (beat === 0) {
    return `
      <svg viewBox="0 0 110 80" fill="none" aria-hidden="true">
        <circle cx="55" cy="40" r="34" fill="#0D2238" fill-opacity="0.35"/>
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
      <circle cx="42" cy="42" r="22" fill="#0D2238"/>
      <path d="M42 25 A17 17 0 1 1 26 48" stroke="#19BFD0" stroke-width="5" stroke-linecap="round"/>
      <text x="42" y="47" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="14" fill="#FFD966">30s</text>
      <path d="M84 14 L88 27 L101 27 L91 35 L95 48 L84 40 L73 48 L77 35 L67 27 L80 27 Z" fill="#FFD966"/>
      <rect x="64" y="52" width="40" height="18" rx="4" fill="#FFF7E6"/>
      <text x="84" y="66" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="14" fill="#121A2B">WIN!</text>
    </svg>
  `;
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
  private activeTuneInEl: HTMLDivElement | null = null;
  private activeTuneInTimerId: number | null = null;
  private activeTuneInCleanup: (() => void) | null = null;
  private toastTimerId: number | null = null;
  private activeKeyHandler: ((ev: KeyboardEvent) => void) | null = null;
  private activeColdOpenResolve: (() => void) | null = null;
  private activeDailyResolve: ((res: DailyModalActionResultV7) => void) | null = null;
  private activeView: 'NONE' | 'TITLE_HUB' | 'COLD_OPEN' | 'HOW_TO_PLAY' | 'BACKSTAGE' | 'DAILY_RESULT' = 'NONE';

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

  public hideTitleHub(): void {
    if (this.activeView === 'TITLE_HUB' || this.activeView === 'BACKSTAGE') {
      this.hideAll();
    }
  }

  public hideAll(): void {
    this.dismissTuneInCurtain();
    this.detachKeyHandler();
    this.resolvePendingColdOpen();
    this.resolvePendingDaily('BACK_TO_STUDIO');
    this.stageLayerEl.innerHTML = '';
    this.activeView = 'NONE';
    this.rootEl.classList.add('ws66-hidden');
  }

  public dispose(): void {
    this.hideAll();
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
  // Deliverable 1: Animated 1966 "IN LIVING COLOR" Title Screen Hub
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
    }

    const epCode = bp?.code ?? 'S01E01';
    const purseCash = Math.max(0, Math.floor(save?.cleanPurseCash ?? 0));
    const isFreshCampaign =
      !save ||
      (save.currentEpisode <= 1 && save.episodesPlayed === 0 && purseCash === 0 && !save.waiver);
    const winsCount = Math.max(0, save?.episodesWon ?? 0);
    const winsText = winsCount === 1 ? '1 WIN' : `${winsCount} WINS`;
    const campaignSubText = isFreshCampaign
      ? `${epCode} · $250,000 GRAND PURSE`
      : `$${purseCash.toLocaleString()} PURSE · ${winsCount > 0 ? winsText : `SEASON ${save?.season ?? 1}`}`;
    const epBadgeHtml = isFreshCampaign
      ? ''
      : `<span class="ws66-ep-flag" aria-label="Current episode ${epCode}">${epCode}</span>`;

    const todayIso = getLocalTodayIso();
    const playedDailyToday =
      Boolean(dailySave?.todayResult && dailySave.todayResult.dateIso === todayIso) ||
      dailySave?.lastPlayedDateIso === todayIso;
    const streakCount = Math.max(0, dailySave?.currentStreak ?? 0);
    const dailyEpTag = this.lastHubData.dailyEpisodeNumber
      ? `SHOW #${this.lastHubData.dailyEpisodeNumber}`
      : 'TODAY’S SHOW';
    const dailySubMarkup = playedDailyToday
      ? `<span class="ws66-done-badge">✓ COMPLETED TODAY · SHARE CARD</span>`
      : `<span class="ws66-push-sub">${dailyEpTag} · SAME 1966 BOARD WORLDWIDE</span>`;

    const stage = document.createElement('section');
    stage.className = 'ws66-title-stage';
    stage.dataset.ctaHover = 'none';
    stage.setAttribute('aria-label', "World's Smartest 1966 Title Broadcast Hub");

    // Floating Top Studio Bug
    const topStrip = document.createElement('header');
    topStrip.className = 'ws66-title-topstrip';
    topStrip.innerHTML = `
      <div class="ws66-onair-cluster">
        <span class="ws66-onair-lamp">
          <span class="ws66-onair-dot" aria-hidden="true"></span>
          <span>ON THE AIR</span>
        </span>
        <span class="ws66-studio-callsign">IBC STUDIO 6A · NEW YORK</span>
      </div>
      <div class="ws66-livingcolor-emblem">
        ${buildPeacockEmblemSvg()}
        <span class="ws66-livingcolor-tag">IN LIVING COLOR</span>
      </div>
    `;

    // Main Composition: Kinetic Marquee Sculpture + Sculpted Push-Button Deck
    const main = document.createElement('div');
    main.className = 'ws66-title-main';

    const hero = document.createElement('div');
    hero.className = 'ws66-hero-sculpture';
    hero.innerHTML = `
      <div class="ws66-starburst-wrap">${buildStarburstBackdropSvg()}</div>
      <span class="ws66-atomic-glint-a">${buildAtomicStarSvg('#FFD966')}</span>
      <span class="ws66-atomic-glint-b">${buildAtomicStarSvg('#19BFD0')}</span>
      ${buildMarqueeArchBulbsSvg()}
      <h1 class="ws66-wordmark">
        <span class="ws66-wordmark-top">WORLD’S</span>
        <span class="ws66-wordmark-hero">SMARTEST</span>
      </h1>
      <div class="ws66-ribbon-banner">FIFTY MILLION WATCHING · LIVE IN LIVING COLOR</div>
      ${buildMarqueeBottomBulbsSvg()}
    `;

    const deck = document.createElement('div');
    deck.className = 'ws66-cta-deck';

    const bindMarqueeHoverJuice = (btn: HTMLButtonElement, kind: 'hero' | 'daily'): void => {
      btn.addEventListener('pointerenter', () => {
        stage.dataset.ctaHover = kind;
      });
      btn.addEventListener('pointerleave', () => {
        if (stage.dataset.ctaHover === kind) {
          stage.dataset.ctaHover = 'none';
        }
      });
      btn.addEventListener('focus', () => {
        stage.dataset.ctaHover = kind;
      });
      btn.addEventListener('blur', () => {
        if (stage.dataset.ctaHover === kind) {
          stage.dataset.ctaHover = 'none';
        }
      });
    };

    // 1. Primary Hero CTA: PLAY CAMPAIGN / CONTINUE CAMPAIGN
    const campaignBtn = document.createElement('button');
    campaignBtn.type = 'button';
    campaignBtn.className = 'ws66-push-btn ws66-push-hero';
    campaignBtn.dataset.action = 'play-campaign';
    campaignBtn.dataset.returning = String(!isFreshCampaign);
    campaignBtn.innerHTML = `
      <span class="ws66-push-copy">
        <span class="ws66-push-lead-row">
          <span class="ws66-pilot-bulb" aria-hidden="true"></span>
          <span class="ws66-push-label">${isFreshCampaign ? 'PLAY CAMPAIGN' : 'CONTINUE CAMPAIGN'}</span>
        </span>
        <span class="ws66-push-sub">${campaignSubText}</span>
      </span>
      <span class="ws66-push-right">
        ${epBadgeHtml}
        <span class="ws66-push-arrow" aria-hidden="true">▸</span>
      </span>
    `;
    bindMarqueeHoverJuice(campaignBtn, 'hero');
    campaignBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      this.callbacks.onPlayCampaign?.();
    });

    // 2. Featured Daily CTA: DAILY 1966 BROADCAST (Completed Today opens Share Card + Replay For Fun!)
    const dailyBtn = document.createElement('button');
    dailyBtn.type = 'button';
    dailyBtn.className = 'ws66-push-btn ws66-push-daily';
    dailyBtn.dataset.action = 'play-daily';
    dailyBtn.dataset.dailyDone = String(playedDailyToday);
    const streakHtml =
      streakCount > 0
        ? `<span class="ws66-streak-flag" aria-label="${streakCount} day streak">🔥 ${streakCount}</span>`
        : '';
    dailyBtn.innerHTML = `
      <span class="ws66-push-copy">
        <span class="ws66-push-lead-row">
          <span class="ws66-pilot-bulb" aria-hidden="true"></span>
          <span class="ws66-push-label">★ DAILY 1966 BROADCAST</span>
        </span>
        ${dailySubMarkup}
      </span>
      <span class="ws66-push-right">
        ${streakHtml}
        <span class="ws66-push-arrow" aria-hidden="true">▸</span>
      </span>
    `;
    bindMarqueeHoverJuice(dailyBtn, 'daily');
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

    // 3. Secondary Sleek Sculpted Console Bar: QUICK SHOW · HOW TO PLAY · TROPHIES & SOUND
    const rail = document.createElement('nav');
    rail.className = 'ws66-utility-rail';
    rail.setAttribute('aria-label', 'Broadcast Secondary Modes');

    const quickBtn = document.createElement('button');
    quickBtn.type = 'button';
    quickBtn.className = 'ws66-rail-btn';
    quickBtn.dataset.action = 'quick-show';
    quickBtn.textContent = 'QUICK SHOW';
    quickBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      this.callbacks.onQuickShow?.();
    });

    const howToBtn = document.createElement('button');
    howToBtn.type = 'button';
    howToBtn.className = 'ws66-rail-btn';
    howToBtn.dataset.action = 'how-to-play';
    howToBtn.textContent = 'HOW TO PLAY';
    howToBtn.addEventListener('click', () => {
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

    const backstageBtn = document.createElement('button');
    backstageBtn.type = 'button';
    backstageBtn.className = 'ws66-rail-btn';
    backstageBtn.dataset.action = 'trophies-sound';
    backstageBtn.textContent = 'TROPHIES & SOUND';
    backstageBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      if (this.callbacks.onOpenTrophiesAndSound) {
        this.callbacks.onOpenTrophiesAndSound();
      } else {
        this.openBackstageStudioDrawer();
      }
    });

    rail.append(quickBtn, howToBtn, backstageBtn);
    deck.append(campaignBtn, dailyBtn, rail);
    main.append(hero, deck);

    // Clean Broadcast Footer Line
    const footer = document.createElement('footer');
    footer.className = 'ws66-title-footer';
    const nextRivalName = bp ? CAST_PROFILES_V7[bp.rivalId].name : 'Carmen Delgado';
    const epNumber = bp?.episodeNumber ?? save?.currentEpisode ?? 1;
    footer.textContent = isFreshCampaign
      ? `TONIGHT’S CHALLENGER MATCH: YOU VS. ${nextRivalName.toUpperCase()} · TAP PLAY TO STEP UNDER THE LIGHTS`
      : `SEASON ${save?.season ?? 1} · EPISODE ${epNumber} OF 90 · NEXT UP: ${nextRivalName.toUpperCase()}`;

    stage.append(topStrip, main, footer);
    this.mountView('TITLE_HUB', stage);

    const shouldPlayTuneIn =
      data.playBootTuneIn !== false && (!this.hasPlayedColdBootIntro || data.playBootTuneIn === true);
    if (shouldPlayTuneIn) {
      this.hasPlayedColdBootIntro = true;
      void this.playLivingColorTuneIn(DEFAULT_TUNEIN_DURATION_MS);
    }
  }

  // Sleek Backstage Studio Drawer when player taps TROPHIES & SOUND
  private openBackstageStudioDrawer(): void {
    const save = this.lastHubData.save;
    const trophiesUnlocked = save?.unlockedTrophyIds.length ?? 0;
    const relicsEquipped = save?.equippedRelics.length ?? 0;
    const currentEp = save?.currentEpisode ?? 1;

    const stage = document.createElement('div');
    stage.className = 'ws66-theater-stage';

    const sheet = document.createElement('div');
    sheet.className = 'ws66-backstage-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Trophies, Sound and Studio Backstage');

    const head = document.createElement('div');
    head.className = 'ws66-backstage-head';
    head.innerHTML = `<h2 class="ws66-backstage-title">STUDIO BACKSTAGE</h2>`;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ws66-skip-btn';
    closeBtn.textContent = 'BACK ✕';
    closeBtn.addEventListener('click', () => {
      this.callbacks.onUiTapSfx?.();
      this.showTitleHub({ ...this.lastHubData, playBootTuneIn: false });
    });
    head.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'ws66-backstage-body';

    const grid = document.createElement('div');
    grid.className = 'ws66-backstage-grid';

    const items: ReadonlyArray<{
      readonly title: string;
      readonly sub: string;
      readonly onClick?: () => void;
    }> = [
      {
        title: '🏆 36-TROPHY VAULT',
        sub: `${trophiesUnlocked} / 36 Sovereign Awards Unlocked`,
        onClick: () => {
          this.hideAll();
          this.callbacks.onOpenTrophyVault?.();
        },
      },
      {
        title: '🎺 SOUND & OPTIONS',
        sub: 'Showband Orchestra, SFX & Motion',
        onClick: () => {
          this.hideAll();
          this.callbacks.onOpenAudioSettings?.();
        },
      },
      {
        title: '🧳 VELVET PROP SHOP',
        sub: `${relicsEquipped} / ${MAX_TRUNK_SLOTS_V7} Relics Equipped`,
        onClick: () => {
          this.hideAll();
          this.callbacks.onOpenPropShop?.();
        },
      },
      {
        title: '📺 EPISODE JUMP',
        sub: `On Episode ${currentEp} of 90 (Seasons 1–4)`,
        onClick: () => {
          this.hideAll();
          this.callbacks.onOpenEpisodeJump?.();
        },
      },
    ];

    for (const item of items) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ws66-backstage-action';
      btn.innerHTML = `
        <span class="ws66-backstage-action-title">${item.title}</span>
        <span class="ws66-backstage-action-sub">${item.sub}</span>
      `;
      btn.addEventListener('click', () => {
        this.callbacks.onUiTapSfx?.();
        item.onClick?.();
      });
      grid.appendChild(btn);
    }

    body.appendChild(grid);
    sheet.append(head, body);
    stage.appendChild(sheet);

    this.mountView('BACKSTAGE', stage);
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
      ? CAST_PROFILES_V7[cfg.episodeBlueprint.rivalId]
      : CAST_PROFILES_V7.CARMEN_DELGADO;
    const tonightRival = cfg.rivalName ?? rivalProfile.name;

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
              <span class="ws66-cue-kicker">${isColdOpen ? 'LIVE COLD OPEN · CUE CARD 1 OF 3' : 'STUDIO GUIDE · PART 1 OF 3'}</span>
              <h2 class="ws66-cue-title">FIFTY MILLION WATCHING</h2>
            </div>
            <div class="ws66-cue-art">${buildColdOpenBeatArtSvg(0)}</div>
          </div>
          <div class="ws66-cue-body">
            <p class="ws66-cue-lead">
              ${formatOrphanProof(
                'Live from Studio 6A in New York City, fifty million viewers are tuned in coast-to-coast in Living Color. You are the unvetted challenger facing IBC’s undefeated Champions for the $250,000 Grand Purse—while rumors swirl that Control Booth A is secretly rigging the boards.',
              )}
            </p>
            <div class="ws66-announcer-line">
              <span class="ws66-announcer-speaker">🎙️ STUDIO ANNOUNCER · TONIGHT’S MATCHUP</span>
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
              <span class="ws66-cue-kicker">${isColdOpen ? 'THE GAME BOARD · CUE CARD 2 OF 3' : 'STUDIO GUIDE · PART 2 OF 3'}</span>
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
                <span class="ws66-twist-badge" data-kind="vault" aria-hidden="true">🔒</span>
                <div class="ws66-twist-text">
                  <span class="ws66-twist-name">Locked Vault ($500)</span>
                  <span class="ws66-twist-desc">Win any adjacent tile or hit a 2-streak to crack the gold jackpot open.</span>
                </div>
              </div>
              <div class="ws66-twist-row">
                <span class="ws66-twist-badge" data-kind="secret" aria-hidden="true">⭐</span>
                <div class="ws66-twist-text">
                  <span class="ws66-twist-name">Secret Square (2×)</span>
                  <span class="ws66-twist-desc">Hidden Daily Double chime! Play immediately for double dollars.</span>
                </div>
              </div>
              <div class="ws66-twist-row">
                <span class="ws66-twist-badge" data-kind="opponent" aria-hidden="true">🎭</span>
                <div class="ws66-twist-text">
                  <span class="ws66-twist-name">Opponent’s Choice</span>
                  <span class="ws66-twist-desc">Force a tough category on your Rival—or beat their pick for a bonus.</span>
                </div>
              </div>
              <div class="ws66-twist-row">
                <span class="ws66-twist-badge" data-kind="mystery" aria-hidden="true">❓</span>
                <div class="ws66-twist-text">
                  <span class="ws66-twist-name">Mystery Curtain</span>
                  <span class="ws66-twist-desc">Door #1, #2, or #3! Reveal instant cash, a rival steal, or a wild bonus.</span>
                </div>
              </div>
            </div>
            ${
              cfg.boardModeSummary
                ? `<div class="ws66-announcer-line"><span class="ws66-announcer-speaker">📺 ACTIVE STAGE FORMAT · ${cfg.boardModeSummary.modeTitle.toUpperCase()}</span>${formatOrphanProof(cfg.boardModeSummary.ruleSummary)}</div>`
                : ''
            }
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="ws66-cue-band" data-theme="win">
            <div class="ws66-cue-band-copy">
              <span class="ws66-cue-kicker">${isColdOpen ? 'HOW TO WIN · CUE CARD 3 OF 3' : 'STUDIO GUIDE · PART 3 OF 3'}</span>
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
      }

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      if (beat < 2) {
        nextBtn.className = 'ws66-push-btn ws66-push-hero';
        const nextLabel = beat === 0 ? 'NEXT: THE BOARD & TWISTS' : 'NEXT: HOW TO WIN';
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
    const won = Boolean(result?.won ?? playerCash >= rivalCash);
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
      masthead.innerHTML = `
        <div class="ws66-daily-edition">📺 DAILY 1966 BROADCAST #${episodeNumber} · ${dateLabel.toUpperCase()}</div>
        <h2 class="ws66-daily-verdict">${won ? '★ CHAMPION DEFEATED!' : 'STUDIO PHOTO FINISH'}</h2>
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

      // Glowing 1966 Emoji Tile Grid
      const emojiWrap = document.createElement('div');
      emojiWrap.className = 'ws66-emoji-strip-wrap';
      const tilesMarkup = tileHistory
        .map((outcome) => {
          const info = DAILY_TILE_EMOJI_MAP[outcome] ?? DAILY_TILE_EMOJI_MAP.WIN;
          return `<span class="ws66-recap-tile" data-kind="${outcome}" title="${info.label}" aria-label="${info.label}">${info.emoji}</span>`;
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
          <span class="ws66-daily-stat-val">🔥 ${save.currentStreak}</span>
          <span class="ws66-daily-stat-lbl">Streak</span>
        </div>
        <div class="ws66-daily-stat">
          <span class="ws66-daily-stat-val">🏆 ${save.bestStreak}</span>
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
          <span class="ws66-push-label">📤 SHARE DAILY CARD</span>
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
      studioBtn.className = 'ws66-back-btn';
      studioBtn.dataset.action = 'back-to-studio';
      studioBtn.textContent = 'BACK TO STUDIO';
      studioBtn.addEventListener('click', () => finishDaily('BACK_TO_STUDIO'));
      secondaryRow.appendChild(studioBtn);

      actions.append(shareBtn, secondaryRow);

      const officialNote = document.createElement('div');
      officialNote.className = 'ws66-daily-official-note';
      officialNote.textContent = 'OFFICIAL DAILY SCORE SAVED · REPLAYS ARE JUST FOR FUN';

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
    view: 'TITLE_HUB' | 'COLD_OPEN' | 'HOW_TO_PLAY' | 'BACKSTAGE' | 'DAILY_RESULT',
    contentEl: HTMLElement,
  ): void {
    this.dismissTuneInCurtain();
    this.detachKeyHandler();
    this.activeView = view;
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
