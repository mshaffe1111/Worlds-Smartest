// ============================================================================
// WORLD'S SMARTEST — Meridian Diplomatic Passport 2.0 (`PITCH_BIBLE.md` §2.2, §6.3, §7.1)
// Leather-and-24K-Gold Multi-Tab Interactive Diplomatic Credentials Book:
//  1. Native `<input>` Challenger Name Editor (1–22 chars, never "YOU"!)
//  2. Animated Diplomatic Ink-Stamp Ceremony for Cognitive Persona
//     (Maverick / Diplomat / Analyst / Prodigy) + Origin & Title Crests
//  3. 8 Country Visa Stamps (`visa_ch..visa_global` vector guilloche ink seals + optional PNG override)
//  4. Interactive SVG 12-Domain Mastery Radar (`thetaDomain[0..11]` + Domain Elo Badges)
//  5. Historical Daily Global Feed Percentile Sparkline & Broadcast Ledger
// ============================================================================

import { forgeEngine, FORGE_DOMAINS, type DomainSkillEntry } from '../forge';
import {
  ORIGIN_DEFINITIONS,
  PERK_CATALOG,
  PERSONA_DEFINITIONS,
  RELIC_CATALOG,
  SOVEREIGN_DOMAINS,
  sanitizeLiveChallengerInput,
  validateChallengerName,
  type CountryVisaRecord,
  type DailyPercentileEntry,
  type DomainId,
  type HeroRelicId,
  type HubId,
  type InkBlackboard,
  type PassportStateSnapshot,
  type PassportSystem,
} from '../narrative';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';

export type PassportTabId = 'CREDENTIALS' | 'VISAS' | 'RADAR' | 'GLOBAL_FEED';

export type MetaSuiteSectionId =
  | 'PASSPORT'
  | 'OBSERVATORY'
  | 'ATELIER'
  | 'FACTIONS'
  | 'ANALYTICS'
  | 'HONOURS';

export interface DiplomaticPassportDependencies {
  passport: PassportSystem;
  blackboard?: InkBlackboard;
  audio?: StudioAudioEngine;
  haptics?: HapticsEngine;
  /** Optional external PNG overrides for `visa_ch..visa_global`; defaults to zero-404 crisp SVG data-URIs */
  visaStampUrls?: Partial<Record<HubId, string>>;
}

export interface DiplomaticPassportCallbacks {
  onRenameChallenger?: (newName: string) => void;
  onPassportStamped?: () => void;
  onInspectRelicInObservatory?: (relicOrTrophy: HeroRelicId | 'championship_trophy') => void;
  onNavigateSection?: (section: MetaSuiteSectionId) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onClose?: () => void;
}

export interface DiplomaticPassportOpenOptions extends DiplomaticPassportCallbacks {
  initialTab?: PassportTabId;
  /** Automatically triggers the ink-stamp ceremony animation on open when true */
  playStampCeremonyOnOpen?: boolean;
}

interface DailyStorageReadout {
  dailyStreak: number;
  bestScore: number;
  bestPercentile: number;
  shareCardsByDate: Record<string, string>;
}

const DAILY_STORAGE_KEY = 'ws_daily_global_feed_v2';
const HUB_ORDER: readonly HubId[] = ['ch', 'gb', 'jp', 'br', 'eg', 'is', 'sg', 'global'];

const PERSONA_CEREMONY_QUOTES: Record<
  string,
  { tellCaption: string; spokenQuote: string }
> = {
  MAVERICK: {
    tellCaption:
      'Vance taps his silver stylus twice beside his right ear before pressing the brass seal.',
    spokenQuote:
      'High risk, fearless Overclocks, zero hesitation. Your Meridian Passport is stamped: The Maverick.',
  },
  DIPLOMAT: {
    tellCaption:
      'Vance inclines his head a single measured degree as warm wax meets leather.',
    spokenQuote:
      'Measured judgment, strategic alliances, composure under fire. Your Meridian Passport is stamped: The Diplomat.',
  },
  ANALYST: {
    tellCaption:
      'Vance aligns the brass astrolabe crosshairs dead center over your dossier.',
    spokenQuote:
      'Methodical clue-peeling, surgical precision, zero wasted motion. Your Meridian Passport is stamped: The Analyst.',
  },
  PRODIGY: {
    tellCaption:
      'Vance’s fingers brush his left brass cufflink—startled by how closely your chart mirrors 2019.',
    spokenQuote:
      'Cold instinct at three-point-zero, razor accuracy, unshakable nerve. Your Meridian Passport is stamped: The Prodigy.',
  },
};

export function escapeMetaHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats a calendar year with ZERO thousands commas (`1984`, `2026`, never `1,984`).
 */
export function formatMetaYear(year: number | string): string {
  if (typeof year === 'number' && Number.isFinite(year)) {
    return String(Math.round(year));
  }
  return String(year ?? '').replace(/\b([12]),(\d{3})\b/g, '$1$2');
}

/**
 * Sanitizes prose/copy shown in meta sheets so 4-digit years (`1000..2150`) NEVER render
 * with commas (e.g. `in 1,984`, `(1,903)`, `1,864 CE` -> `in 1984`, `(1903)`, `1864 CE`).
 */
export function sanitizeMetaCopy(text: string): string {
  return String(text ?? '')
    .replace(/\b(in|from|since|circa|c\.|by|until|around|year|founded|born|died)\s+([12]),(\d{3})\b/gi, '$1 $2$3')
    .replace(/\(([12]),(\d{3})([–\-]([12]),?(\d{3}))?\)/g, (_m, y1a, y1b, rangePart, y2a, y2b) =>
      rangePart && y2a && y2b ? `(${y1a}${y1b}–${y2a}${y2b})` : `(${y1a}${y1b})`,
    )
    .replace(/\b([12]),(\d{3})\s*(CE|BCE|AD|BC)\b/g, '$1$2 $3')
    .replace(/\b([12]),(\d{3})([–\-])([12]),(\d{3})\b/g, '$1$2$3$4$5');
}

export interface VaultJumperOption {
  id: MetaSuiteSectionId;
  icon: string;
  label: string;
}

const VAULT_ICON_SVGS: Record<MetaSuiteSectionId, string> = {
  PASSPORT:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="11" r="3.5"/><path d="M8.5 17.5h7"/></svg>',
  OBSERVATORY:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="8" ry="3.2"/><path d="M12 4v16"/></svg>',
  ATELIER:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 21 9 12 22 3 9 12 2"/><path d="M3 9h18M12 2v20"/></svg>',
  ANALYTICS:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19h16"/><path d="M7 16v-5M12 16V7M17 16v-8"/></svg>',
  HONOURS:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.8 7 21l5-2.6L17 21l-1.5-7.2"/></svg>',
  FACTIONS:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7ZM17 7l-3 7h6l-3-7Z"/></svg>',
};

const VAULT_JUMPER_SECTIONS: readonly VaultJumperOption[] = [
  { id: 'PASSPORT', icon: VAULT_ICON_SVGS.PASSPORT, label: 'Passport' },
  { id: 'OBSERVATORY', icon: VAULT_ICON_SVGS.OBSERVATORY, label: '3D Observatory' },
  { id: 'ATELIER', icon: VAULT_ICON_SVGS.ATELIER, label: 'Prism Atelier' },
  { id: 'ANALYTICS', icon: VAULT_ICON_SVGS.ANALYTICS, label: 'Career Stats' },
  { id: 'HONOURS', icon: VAULT_ICON_SVGS.HONOURS, label: 'Honours' },
  { id: 'FACTIONS', icon: VAULT_ICON_SVGS.FACTIONS, label: 'Council Blocs' },
];

/**
 * Renders the sleek `Vault ▾` quick-jumper pill + floating obsidian popover,
 * eliminating the 6-button boxed navigation header wall across all `src/meta/**` views.
 */
export function renderVaultJumperHtml(
  activeSection: MetaSuiteSectionId,
  options: {
    isModal?: boolean;
    closeBtnId?: string;
    canNavigate?: boolean;
    floatingVariant?: boolean;
  } = {},
): string {
  const { isModal = true, closeBtnId = 'ws-meta-close', canNavigate = true, floatingVariant = false } = options;
  if (!canNavigate && !isModal) return '';

  const triggerClass = floatingVariant ? 'ws-meta-float-pill' : 'ws-meta-vault-btn';
  const rowsHtml = canNavigate
    ? VAULT_JUMPER_SECTIONS.map((sec) => {
        const isCurrent = sec.id === activeSection;
        return `
          <button
            type="button"
            class="ws-meta-vault-row ${isCurrent ? 'is-current' : ''}"
            data-suite-nav="${sec.id}"
            role="menuitem"
            ${isCurrent ? 'aria-current="page"' : ''}
          >
            <span class="ws-meta-vault-row-ico">${sec.icon}</span>
            <span class="ws-meta-vault-row-lbl">${escapeMetaHtml(sec.label)}</span>
            ${isCurrent ? '<span class="ws-meta-vault-dot" aria-hidden="true"></span>' : ''}
          </button>
        `;
      }).join('')
    : '';

  const exitRowHtml = isModal
    ? `
      <div class="ws-meta-vault-sep"></div>
      <button type="button" class="ws-meta-vault-row is-exit" id="${escapeMetaHtml(closeBtnId)}" role="menuitem">
        <span class="ws-meta-vault-row-ico">✕</span>
        <span class="ws-meta-vault-row-lbl">Exit Vault</span>
      </button>
    `
    : '';

  return `
    <div class="ws-meta-vault-wrap" data-vault-wrap>
      <button
        type="button"
        class="${triggerClass}"
        data-vault-trigger
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span>Vault</span>
        <span class="ws-meta-vault-caret" aria-hidden="true">▾</span>
      </button>
      <div class="ws-meta-vault-menu" data-vault-menu role="menu" hidden>
        ${rowsHtml}
        ${exitRowHtml}
      </div>
    </div>
  `;
}

/**
 * Binds open/close + click-outside behavior for `renderVaultJumperHtml` with automatic cleanup.
 */
export function bindVaultJumperEvents(
  host: HTMLElement,
  options: {
    onNavigate?: (section: MetaSuiteSectionId) => void;
    onClose?: () => void;
    closeBtnId?: string;
    onTapFeedback?: () => void;
  } = {},
): void {
  const wrap = host.querySelector<HTMLElement>('[data-vault-wrap]');
  const trigger = host.querySelector<HTMLButtonElement>('[data-vault-trigger]');
  const menu = host.querySelector<HTMLElement>('[data-vault-menu]');
  if (!wrap || !trigger || !menu) return;

  let outsideListener: ((ev: PointerEvent) => void) | null = null;

  const setOpen = (open: boolean) => {
    menu.hidden = !open;
    menu.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');

    if (outsideListener) {
      document.removeEventListener('pointerdown', outsideListener, true);
      outsideListener = null;
    }
    if (open) {
      outsideListener = (ev: PointerEvent) => {
        if (!wrap.isConnected) {
          if (outsideListener) {
            document.removeEventListener('pointerdown', outsideListener, true);
            outsideListener = null;
          }
          return;
        }
        const target = ev.target as Node | null;
        if (target && wrap.contains(target)) return;
        setOpen(false);
      };
      document.addEventListener('pointerdown', outsideListener, true);
    }
  };

  trigger.addEventListener('click', (ev) => {
    ev.stopPropagation();
    options.onTapFeedback?.();
    setOpen(menu.hidden);
  });

  menu.querySelectorAll<HTMLButtonElement>('[data-suite-nav]').forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const target = btn.dataset.suiteNav as MetaSuiteSectionId | undefined;
      setOpen(false);
      if (!target) return;
      if (btn.classList.contains('is-current')) {
        options.onTapFeedback?.();
        return;
      }
      options.onTapFeedback?.();
      options.onNavigate?.(target);
    });
  });

  if (options.closeBtnId) {
    const closeEl = menu.querySelector<HTMLButtonElement>(`#${options.closeBtnId}`);
    closeEl?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      setOpen(false);
      options.onClose?.();
    });
  }
}

/**
 * Attaches a clean window `Escape` key handler for Meta-Progression modals (#145 P2),
 * ignoring `Escape` when focus is inside an `<input>` or `<textarea>` and returning an idempotent disposer.
 */
export function attachMetaEscapeHandler(onEscapeClose: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (ev: KeyboardEvent) => {
    if (ev.key !== 'Escape') return;
    const active = document.activeElement;
    if (active) {
      const tag = active.tagName.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (active as HTMLElement).isContentEditable) {
        return;
      }
    }
    ev.preventDefault();
    ev.stopPropagation();
    onEscapeClose();
  };
  window.addEventListener('keydown', handler);
  return () => {
    window.removeEventListener('keydown', handler);
  };
}

function clampNum(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function readDailyFeedStorage(): DailyStorageReadout {
  const fallback: DailyStorageReadout = {
    dailyStreak: 0,
    bestScore: 0,
    bestPercentile: 0,
    shareCardsByDate: {},
  };
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as {
      dailyStreak?: number;
      bestScore?: number;
      bestPercentile?: number;
      completedRunsByDate?: Record<string, { shareText?: string }>;
    } | null;
    if (!parsed || typeof parsed !== 'object') return fallback;
    const shareCardsByDate: Record<string, string> = {};
    if (parsed.completedRunsByDate && typeof parsed.completedRunsByDate === 'object') {
      for (const [dt, val] of Object.entries(parsed.completedRunsByDate)) {
        if (val && typeof val.shareText === 'string') {
          shareCardsByDate[dt] = val.shareText;
        }
      }
    }
    return {
      dailyStreak: Math.max(0, Math.floor(Number(parsed.dailyStreak) || 0)),
      bestScore: Math.max(0, Math.floor(Number(parsed.bestScore) || 0)),
      bestPercentile: clampNum(Math.floor(Number(parsed.bestPercentile) || 0), 0, 99),
      shareCardsByDate,
    };
  } catch {
    return fallback;
  }
}

/**
 * Injects shared 2026 Mobile-First Sleek Obsidian CSS for `src/meta/**` once per document.
 * Strictly zero `backdrop-filter: blur` over 60fps WebGL2, zero nested bordered boxes,
 * 50dvh Portrait / 50vw Landscape unobstructed 3D viewport pass-through (`pointer-events: none`),
 * and ergonomic touch targets across 360×640 .. 1920×1080!
 */
export function ensureMetaStylesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('ws-meta-progression-styles')) return;

  const style = document.createElement('style');
  style.id = 'ws-meta-progression-styles';
  style.textContent = `
    /* Zero backdrop-filter blur per #137 P1(c) so 60fps WebGL2 canvas never stalls GPU compositing! */
    .ws-meta-backdrop {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      z-index: 65;
      background: rgba(5, 8, 15, 0.92);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      padding: 0;
      display: flex;
      align-items: stretch;
      justify-content: center;
      pointer-events: auto;
      box-sizing: border-box;
      max-width: 100vw;
      overflow: hidden;
      font-variant-numeric: tabular-nums;
    }

    @media (min-width: 768px) and (min-height: 521px) {
      .ws-meta-backdrop:not(.is-stage-dock) {
        padding: 20px;
        align-items: center;
      }
    }

    /* =====================================================================
       OPEN 3D STAGE SPLIT MODE (Portrait: Top 54–55dvh 3D / Bottom 45–46dvh Sheet;
       Landscape: Left 50vw 3D / Right 50vw Sheet) — 100% Pointer Pass-Through!
       ===================================================================== */
    .ws-meta-backdrop.is-stage-dock {
      background: transparent;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: stretch;
      pointer-events: none;
    }

    .ws-meta-stage-zone {
      position: relative;
      flex: 0 0 54vh;
      flex: 0 0 54dvh;
      height: 54vh;
      height: 54dvh;
      width: 100%;
      pointer-events: none;
      box-sizing: border-box;
      z-index: 4;
    }

    .ws-meta-stage-top {
      position: absolute;
      top: max(10px, env(safe-area-inset-top, 10px));
      left: max(12px, env(safe-area-inset-left, 12px));
      right: max(12px, env(safe-area-inset-right, 12px));
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      pointer-events: none;
      z-index: 25;
    }

    .ws-meta-stage-bottom {
      position: absolute;
      bottom: 8px;
      left: max(12px, env(safe-area-inset-left, 12px));
      right: max(12px, env(safe-area-inset-right, 12px));
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      pointer-events: none;
      z-index: 15;
    }

    .ws-meta-stage-actions {
      display: flex;
      align-items: center;
      gap: 7px;
      pointer-events: auto;
    }

    .ws-meta-orbit-whisper {
      pointer-events: none;
      font-family: var(--font-mono, monospace);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: rgba(246, 242, 233, 0.86);
      background: rgba(8, 12, 22, 0.74);
      padding: 4px 10px;
      border-radius: 999px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.42), inset 0 0 0 1px rgba(255, 255, 255, 0.12);
      white-space: nowrap;
    }

    .ws-meta-float-pill {
      pointer-events: auto;
      min-height: 36px;
      min-width: 36px;
      padding: 0 12px;
      border-radius: 999px;
      background: rgba(8, 12, 22, 0.74);
      border: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.14);
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease, box-shadow 0.14s ease, transform 0.12s ease;
    }

    .ws-meta-float-pill:hover {
      background: rgba(16, 22, 36, 0.9);
      color: var(--gold-bright, #f2cf7e);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(232, 197, 116, 0.42);
    }

    .ws-meta-float-pill.is-active-gold {
      background: rgba(56, 44, 18, 0.9);
      color: var(--gold-bright, #f2cf7e);
      box-shadow: 0 4px 18px rgba(242, 207, 126, 0.24), inset 0 0 0 1px rgba(242, 207, 126, 0.65);
    }

    .ws-meta-float-pill.is-active-cyan {
      background: rgba(12, 38, 54, 0.9);
      color: var(--cyan-clue, #56d4f5);
      box-shadow: 0 4px 18px rgba(86, 212, 245, 0.26), inset 0 0 0 1px rgba(86, 212, 245, 0.65);
    }

    /* Bottom 46dvh Dark-Obsidian Sheet (Standard Portrait >= 741px) */
    .ws-meta-backdrop.is-stage-dock .ws-meta-sheet {
      pointer-events: auto;
      position: relative;
      flex: 0 0 46vh;
      flex: 0 0 46dvh;
      height: 46vh;
      height: 46dvh;
      max-height: 46vh;
      max-height: 46dvh;
      width: 100%;
      background: linear-gradient(180deg, rgba(10, 14, 24, 0.96) 0%, rgba(6, 9, 16, 0.99) 100%);
      border: none;
      border-top: 1px solid rgba(232, 197, 116, 0.28);
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -16px 40px rgba(0, 0, 0, 0.65);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;
      color: var(--ivory-primary, #f6f2e9);
      z-index: 6;
    }

    /* Compact Portrait Phones (360×640, 375×667): 55dvh Open 3D / 45dvh Sheet (#252 P0) */
    @media (orientation: portrait) and (max-height: 740px) {
      .ws-meta-stage-zone {
        flex: 0 0 55vh;
        flex: 0 0 55dvh;
        height: 55vh;
        height: 55dvh;
      }
      .ws-meta-backdrop.is-stage-dock .ws-meta-sheet {
        flex: 0 0 45vh;
        flex: 0 0 45dvh;
        height: 45vh;
        height: 45dvh;
        max-height: 45vh;
        max-height: 45dvh;
      }
      .ws-meta-stage-bottom {
        bottom: 6px;
      }
    }

    .ws-meta-drag-handle {
      width: 36px;
      height: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.22);
      margin: 8px auto 3px;
      flex-shrink: 0;
    }

    /* Landscape / Desktop 3D Split: Left >=50vw Open 3D · Right <=50vw Obsidian Sheet */
    @media (orientation: landscape) and (min-width: 600px) {
      .ws-meta-backdrop.is-stage-dock {
        flex-direction: row;
        justify-content: flex-end;
        align-items: stretch;
      }
      .ws-meta-stage-zone {
        flex: 1 1 50vw;
        min-width: 50vw;
        height: 100vh;
        height: 100dvh;
      }
      .ws-meta-backdrop.is-stage-dock .ws-meta-sheet {
        flex: 0 0 min(50vw, 500px);
        width: min(50vw, 500px);
        height: 100vh;
        height: 100dvh;
        max-height: 100vh;
        max-height: 100dvh;
        border-top: none;
        border-left: 1px solid rgba(232, 197, 116, 0.28);
        border-radius: 20px 0 0 20px;
        box-shadow: -16px 0 40px rgba(0, 0, 0, 0.65);
        padding-top: max(6px, env(safe-area-inset-top, 6px));
      }
      .ws-meta-drag-handle {
        display: none;
      }
    }

    /* =====================================================================
       FULL-SCREEN FRAMELESS OBSIDIAN SHEET (Stats, Honours, Passport, Factions)
       ===================================================================== */
    .ws-meta-shell {
      position: relative;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      overflow: hidden;
      border-radius: 0;
      background: linear-gradient(180deg, rgba(11, 15, 25, 0.98) 0%, rgba(6, 9, 16, 0.99) 100%);
      border: none;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      color: var(--ivory-primary, #f6f2e9);
      font-variant-numeric: tabular-nums;
    }

    @media (min-width: 768px) and (min-height: 521px) {
      .ws-meta-backdrop:not(.is-stage-dock) .ws-meta-shell {
        max-width: 980px;
        height: auto;
        max-height: calc(100dvh - 40px);
        border-radius: 20px;
        border-top: 1px solid rgba(232, 197, 116, 0.28);
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.82);
      }
    }

    /* Diplomatic Leather Tonal Variant (Frameless, zero triple inset borders) */
    .ws-meta-shell.is-passport-leather {
      background:
        radial-gradient(circle at 84% 0%, rgba(232, 197, 116, 0.08) 0%, transparent 48%),
        linear-gradient(168deg, #101626 0%, #090d18 55%, #110f1a 100%);
    }

    /* Sticky Single-Row 48px Sheet Header */
    .ws-meta-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 48px;
      padding:
        max(8px, env(safe-area-inset-top, 8px))
        max(14px, env(safe-area-inset-right, 14px))
        8px
        max(12px, env(safe-area-inset-left, 12px));
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(9, 13, 22, 0.98);
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 22;
      box-sizing: border-box;
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-meta-topbar {
        min-height: 42px;
        padding: 4px 12px;
      }
    }

    .ws-meta-topbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1 1 auto;
    }

    .ws-meta-topbar-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .ws-meta-back-btn {
      min-height: 38px;
      padding: 0 8px 0 4px;
      border-radius: 8px;
      background: transparent;
      border: none;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 13px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: color 0.14s ease, background 0.14s ease;
    }

    .ws-meta-back-btn:hover {
      color: var(--gold-bright, #f2cf7e);
      background: rgba(255, 255, 255, 0.05);
    }

    .ws-meta-topbar-titles {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .ws-meta-title {
      font-family: var(--font-display, Georgia, serif);
      font-size: clamp(14px, 1.7vw, 17px);
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--gold-bright, #f2cf7e);
      margin: 0;
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-meta-eyebrow {
      font-family: var(--font-mono, monospace);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--ivory-dim, #7d8594);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Vault ▾ Compact Dropdown Quick-Jumper */
    .ws-meta-vault-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      pointer-events: auto;
      z-index: 30;
    }

    .ws-meta-vault-btn {
      min-height: 36px;
      padding: 0 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.055);
      border: none;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-meta-vault-btn:hover {
      background: rgba(232, 197, 116, 0.14);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-meta-vault-caret {
      font-size: 10px;
      opacity: 0.78;
    }

    .ws-meta-vault-menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 196px;
      padding: 5px;
      border-radius: 14px;
      background: #0c111e;
      border: none;
      box-shadow: 0 18px 44px rgba(0, 0, 0, 0.85), inset 0 0 0 1px rgba(232, 197, 116, 0.22);
      display: flex;
      flex-direction: column;
      gap: 2px;
      z-index: 60;
      pointer-events: auto;
    }

    .ws-meta-vault-menu[hidden] {
      display: none !important;
    }

    .ws-meta-vault-row {
      width: 100%;
      min-height: 40px;
      padding: 0 11px;
      border-radius: 9px;
      background: transparent;
      border: none;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 9px;
      text-align: left;
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease;
    }

    .ws-meta-vault-row:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-meta-vault-row.is-current {
      color: var(--gold-bright, #f2cf7e);
      background: rgba(232, 197, 116, 0.09);
      font-weight: 700;
    }

    .ws-meta-vault-row.is-exit {
      color: var(--ivory-muted, #b8b2a6);
    }

    .ws-meta-vault-row.is-exit:hover {
      color: var(--crimson-alert, #e05263);
      background: rgba(224, 82, 99, 0.1);
    }

    .ws-meta-vault-row-ico {
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--gold-bright, #f2cf7e);
      flex-shrink: 0;
    }

    .ws-meta-vault-row-lbl {
      flex: 1 1 auto;
    }

    .ws-meta-vault-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--gold-bright, #f2cf7e);
      flex-shrink: 0;
    }

    .ws-meta-vault-sep {
      height: 1px;
      background: rgba(255, 255, 255, 0.07);
      margin: 4px 8px;
    }

    /* Clean Borderless Underline Tabs (Single Horizontal Row, Zero Wrapping Boxes) */
    .ws-meta-underline-tabs {
      display: flex;
      align-items: stretch;
      gap: 4px;
      padding: 0 max(14px, env(safe-area-inset-right, 14px)) 0 max(14px, env(safe-area-inset-left, 14px));
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      flex-shrink: 0;
    }

    .ws-meta-underline-tabs::-webkit-scrollbar {
      display: none;
    }

    .ws-meta-underline-tab {
      flex: 1 0 auto;
      min-height: 40px;
      padding: 8px 10px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      color: var(--ivory-muted, #b8b2a6);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: 0.02em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      white-space: nowrap;
      cursor: pointer;
      transition: color 0.14s ease, border-color 0.14s ease;
    }

    .ws-meta-underline-tab:hover {
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-meta-underline-tab.is-active {
      color: var(--gold-bright, #f2cf7e);
      border-bottom-color: var(--gold-bright, #f2cf7e);
    }

    /* Horizontal Scrollable Strip (Relics, Finishes, Domain/Tier Filters) */
    .ws-meta-hscroll {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 2px 0;
      flex-shrink: 0;
    }

    .ws-meta-hscroll::-webkit-scrollbar {
      display: none;
    }

    .ws-meta-chip {
      flex: 0 0 auto;
      min-height: 34px;
      padding: 0 11px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.045);
      border: none;
      color: var(--ivory-muted, #b8b2a6);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      cursor: pointer;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-meta-chip:hover {
      background: rgba(255, 255, 255, 0.09);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-meta-chip.is-active {
      background: rgba(232, 197, 116, 0.16);
      color: var(--gold-bright, #f2cf7e);
      box-shadow: inset 0 -2px 0 var(--gold-bright, #f2cf7e);
    }

    /* Scrollable Frameless Body */
    .ws-meta-body-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      padding:
        12px
        max(16px, env(safe-area-inset-right, 16px))
        max(20px, env(safe-area-inset-bottom, 20px))
        max(16px, env(safe-area-inset-left, 16px));
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
      z-index: 2;
      box-sizing: border-box;
    }

    /* Frameless Editorial Section (Hairline Divider Only — Zero Nested Boxes!) */
    .ws-meta-section {
      padding: 14px 0;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: transparent;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
      box-sizing: border-box;
    }

    .ws-meta-section:first-child {
      padding-top: 2px;
    }

    .ws-meta-section:last-child {
      border-bottom: none;
      padding-bottom: 4px;
    }

    .ws-meta-section-title {
      font-family: var(--font-mono, monospace);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--gold-bright, #f2cf7e);
      margin: 0;
    }

    @media (max-width: 460px) {
      .ws-meta-underline-tabs {
        padding: 0 8px;
        gap: 2px;
      }
      .ws-meta-underline-tab {
        padding: 8px 6px;
        font-size: 12px;
      }
    }

    /* Frameless KPI Metric Strip (Hairline Vertical Separators) */
    .ws-meta-kpi-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(108px, 1fr));
      gap: 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      padding-bottom: 12px;
    }

    .ws-meta-kpi-strip.is-four-col {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media (max-width: 560px) {
      .ws-meta-kpi-strip.is-four-col {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ws-meta-kpi-strip.is-four-col .ws-meta-kpi-cell:nth-child(odd) {
        border-left: none;
        padding-left: 0;
      }
      .ws-meta-kpi-strip.is-four-col .ws-meta-kpi-cell:nth-child(n + 3) {
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding-top: 10px;
        margin-top: 4px;
      }
    }

    .ws-meta-kpi-cell {
      padding: 6px 10px;
      border-left: 1px solid rgba(255, 255, 255, 0.07);
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .ws-meta-kpi-cell:first-child {
      border-left: none;
      padding-left: 0;
    }

    .ws-meta-kpi-lbl {
      font-family: var(--font-mono, monospace);
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--ivory-dim, #7d8594);
    }

    .ws-meta-kpi-val {
      font-family: var(--font-mono, monospace);
      font-size: 16px;
      font-weight: 800;
      color: var(--ivory-primary, #f6f2e9);
      font-variant-numeric: tabular-nums;
      line-height: 1.2;
    }

    /* Frameless Hairline List Row */
    .ws-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 9px 4px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      background: transparent;
      min-width: 0;
      transition: background 0.12s ease;
    }

    .ws-meta-row:last-child {
      border-bottom: none;
    }

    .ws-meta-row.is-interactive {
      cursor: pointer;
    }

    .ws-meta-row.is-interactive:hover {
      background: rgba(255, 255, 255, 0.035);
    }

    .ws-meta-row.is-focused {
      background: rgba(232, 197, 116, 0.07);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
      padding-left: 10px;
    }

    /* Left-Bar Editorial Callout (Zero 4-Sided Box) */
    .ws-meta-note {
      padding: 6px 0 6px 12px;
      border: none;
      box-shadow: inset 2px 0 0 var(--gold-bright, #f2cf7e);
      font-size: 12px;
      color: var(--ivory-muted, #b8b2a6);
      line-height: 1.45;
    }

    .ws-meta-note.is-cyan {
      box-shadow: inset 2px 0 0 var(--cyan-clue, #56d4f5);
      color: #dff6ff;
    }

    .ws-meta-note.is-emerald {
      box-shadow: inset 2px 0 0 var(--emerald-win, #39d49a);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-meta-note.is-crimson {
      box-shadow: inset 2px 0 0 var(--crimson-alert, #e05263);
    }

    /* Sleek Underline Input */
    .ws-meta-input {
      width: 100%;
      min-height: 42px;
      padding: 8px 2px;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 0;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .ws-meta-input::placeholder {
      color: var(--ivory-dim, #7d8594);
    }

    .ws-meta-input:focus {
      border-bottom-color: var(--gold-bright, #f2cf7e);
    }

    /* Sleek Borderless Buttons & Gold Primary CTA */
    .ws-meta-btn {
      min-height: 40px;
      min-width: 40px;
      padding: 8px 14px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.055);
      border: none;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: 0.02em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease, transform 0.12s ease;
    }

    .ws-meta-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.11);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-meta-btn.is-active {
      background: rgba(232, 197, 116, 0.16);
      color: var(--gold-bright, #f2cf7e);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-meta-btn-gold {
      min-height: 42px;
      min-width: 44px;
      padding: 8px 18px;
      border-radius: 999px;
      background: linear-gradient(180deg, #fae29c 0%, #d8ab4e 55%, #b5842c 100%);
      border: none;
      color: #10141e;
      font-family: var(--font-display, Georgia, serif);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 6px 20px rgba(216, 175, 87, 0.28);
      transition: transform 0.14s ease, filter 0.15s ease;
    }

    .ws-meta-btn-gold:hover:not(:disabled) {
      filter: brightness(1.07);
      transform: translateY(-1px);
    }

    .ws-meta-inline-link {
      background: transparent;
      border: none;
      padding: 6px 4px;
      color: var(--gold-bright, #f2cf7e);
      font-family: var(--font-mono, monospace);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .ws-meta-inline-link:hover {
      text-decoration: underline;
    }

    /* Flush Hairline 8-Country Visa Grid (Zero Bordered Cards!) */
    .ws-visa-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1px;
      background: rgba(255, 255, 255, 0.07);
      width: 100%;
    }

    @media (max-width: 759px) {
      .ws-visa-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .ws-visa-card {
      position: relative;
      min-width: 0;
      padding: 14px 10px;
      background: #0a0f1a;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 5px;
      transition: background 0.15s ease;
    }

    .ws-visa-card.is-cleared {
      background: radial-gradient(circle at 50% 24%, rgba(57, 212, 154, 0.09), #0a0f1a 74%);
    }

    .ws-visa-card.is-locked {
      opacity: 0.78;
    }

    .ws-visa-stamp-img {
      width: clamp(62px, 7vw, 80px);
      height: clamp(62px, 7vw, 80px);
      object-fit: contain;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5));
      transition: transform 0.22s ease;
    }

    .ws-visa-card.is-cleared .ws-visa-stamp-img {
      transform: rotate(-5deg);
    }

    /* Animated Persona Diplomatic Ink-Stamp Ceremony (Frameless Radial Halo) */
    .ws-persona-seal-stage {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 8px;
      background: radial-gradient(circle at 50% 42%, rgba(242, 207, 126, 0.11) 0%, transparent 66%);
      border: none;
      overflow: hidden;
    }

    .ws-persona-seal-disc {
      position: relative;
      width: 132px;
      height: 132px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 12px;
      border: 2.5px double var(--seal-accent, #f2cf7e);
      background: radial-gradient(circle, rgba(20, 26, 42, 0.96) 0%, rgba(8, 11, 20, 0.98) 100%);
      box-shadow: 0 0 28px rgba(242, 207, 126, 0.2);
      transform: rotate(-4deg);
    }

    .ws-persona-seal-disc.is-stamping {
      animation: wsPassportStampSlam 0.68s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .ws-ink-ring-burst {
      position: absolute;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      border: 2px solid var(--seal-accent, #f2cf7e);
      opacity: 0;
      pointer-events: none;
    }

    .ws-ink-ring-burst.is-stamping {
      animation: wsInkShockwave 0.72s ease-out forwards;
    }

    @keyframes wsPassportStampSlam {
      0% {
        opacity: 0.15;
        transform: scale(2.15) rotate(8deg);
        filter: brightness(1.8);
      }
      42% {
        opacity: 1;
        transform: scale(0.91) rotate(-6deg);
        filter: brightness(1.35);
      }
      68% {
        transform: scale(1.04) rotate(-3.5deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(-4deg);
        filter: brightness(1);
      }
    }

    @keyframes wsInkShockwave {
      0% {
        opacity: 0.92;
        transform: scale(0.82);
      }
      100% {
        opacity: 0;
        transform: scale(1.68);
      }
    }

    /* Frameless 2-Column Editorial Split on Wide Screens */
    .ws-meta-two-col {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 18px 24px;
      align-items: start;
    }

    /* Subtle Hairline Progress Track */
    .ws-meta-progress-track {
      width: 100%;
      height: 3px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.09);
      overflow: hidden;
    }

    .ws-meta-progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.25s ease;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Generates a razor-sharp diplomatic guilloche SVG data-URI representing `visa_ch..visa_global`
 * with zero network 404s (and honors optional external PNG overrides if supplied).
 */
export function getVisaStampDataUri(
  hubId: HubId,
  cleared: boolean,
  overrides?: Partial<Record<HubId, string>>,
): string {
  const custom = overrides?.[hubId];
  if (custom) return custom;

  const inkPrimary = cleared ? '#39d49a' : '#7b8599';
  const inkGold = cleared ? '#f2cf7e' : '#596273';
  const fillBg = cleared ? 'rgba(14, 42, 34, 0.72)' : 'rgba(14, 19, 30, 0.65)';

  const motifs: Record<HubId, { code: string; city: string; glyph: string }> = {
    ch: {
      code: 'CH · GENEVA',
      city: '46.20°N 6.14°E',
      glyph: `<circle cx="60" cy="56" r="15" fill="none" stroke="${inkGold}" stroke-width="2"/><path d="M60 45v22M49 56h22" stroke="${inkPrimary}" stroke-width="3.2" stroke-linecap="round"/>`,
    },
    gb: {
      code: 'GB · LONDON',
      city: '51.51°N 0.13°W',
      glyph: `<circle cx="60" cy="56" r="15" fill="none" stroke="${inkGold}" stroke-width="1.8"/><ellipse cx="60" cy="56" rx="15" ry="6.5" fill="none" stroke="${inkPrimary}" stroke-width="1.8" transform="rotate(-26 60 56)"/><ellipse cx="60" cy="56" rx="15" ry="6.5" fill="none" stroke="${inkPrimary}" stroke-width="1.8" transform="rotate(26 60 56)"/>`,
    },
    jp: {
      code: 'JP · TOKYO',
      city: '35.68°N 139.65°E',
      glyph: `<path d="M43 47h34M46 52h28M51 47v21M69 47v21" stroke="${inkPrimary}" stroke-width="2.4" stroke-linecap="round"/><circle cx="60" cy="59" r="5" fill="${inkGold}"/>`,
    },
    br: {
      code: 'BR · RIO',
      city: '22.91°S 43.17°W',
      glyph: `<path d="M44 66a16 16 0 0 1 32 0Z" fill="none" stroke="${inkPrimary}" stroke-width="2"/><path d="M60 44v22M49 57h22" stroke="${inkGold}" stroke-width="1.6"/>`,
    },
    eg: {
      code: 'EG · CAIRO',
      city: '30.04°N 31.24°E',
      glyph: `<polygon points="60,41 76,67 44,67" fill="none" stroke="${inkGold}" stroke-width="2.2"/><circle cx="60" cy="57" r="4.2" fill="${inkPrimary}"/>`,
    },
    is: {
      code: 'IS · REYKJAVIK',
      city: '64.15°N 21.94°W',
      glyph: `<path d="M45 64l8-18 7 11 7-14 8 21" fill="none" stroke="${inkPrimary}" stroke-width="2.2" stroke-linejoin="round"/><path d="M46 43q14-6 28 0" fill="none" stroke="${inkGold}" stroke-width="1.8"/>`,
    },
    sg: {
      code: 'SG · SINGAPORE',
      city: '1.35°N 103.82°E',
      glyph: `<rect x="48" y="47" width="6" height="20" stroke="${inkGold}" stroke-width="1.8" fill="none"/><rect x="66" y="47" width="6" height="20" stroke="${inkGold}" stroke-width="1.8" fill="none"/><path d="M44 47q16-5 32 0" fill="none" stroke="${inkPrimary}" stroke-width="2.4"/>`,
    },
    global: {
      code: 'APEX CITADEL',
      city: 'INTL WATERS',
      glyph: `<polygon points="60,40 65,51 77,52 68,60 70,71 60,65 50,71 52,60 43,52 55,51" fill="none" stroke="${inkGold}" stroke-width="2"/><circle cx="60" cy="56" r="3.5" fill="${inkPrimary}"/>`,
    },
  };

  const m = motifs[hubId];
  const statusWord = cleared ? 'VISA STAMPED' : 'UNSTAMPED';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="55" fill="${fillBg}" stroke="${inkPrimary}" stroke-width="2.5" stroke-dasharray="5 2.5"/>
    <circle cx="60" cy="60" r="48" fill="none" stroke="${inkGold}" stroke-width="1.2"/>
    <circle cx="60" cy="60" r="33" fill="none" stroke="${inkPrimary}" stroke-width="1" stroke-dasharray="2 2"/>
    <text x="60" y="25" text-anchor="middle" fill="${inkGold}" font-family="Cinzel,Georgia,serif" font-size="8.5" font-weight="700" letter-spacing="1.1">${m.code}</text>
    ${m.glyph}
    <text x="60" y="84" text-anchor="middle" fill="${inkPrimary}" font-family="monospace" font-size="7.2" font-weight="700" letter-spacing="0.8">${statusWord}</text>
    <text x="60" y="99" text-anchor="middle" fill="${inkGold}" font-family="monospace" font-size="6.4">${m.city}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Interactive SVG 12-Domain Mastery Radar builder with clickable domain vertex targets.
 */
function buildInteractiveRadarSvg(
  skills: readonly DomainSkillEntry[],
  focusedDomainId: DomainId,
): string {
  const cx = 190;
  const cy = 154;
  const maxR = 100;
  const rings = [0.25, 0.5, 0.75, 1.0];

  const ringPolys = rings
    .map((r) => {
      const pts: string[] = [];
      for (let i = 0; i < 12; i++) {
        const ang = (Math.PI * 2 * i) / 12 - Math.PI / 2;
        pts.push(
          `${(cx + Math.cos(ang) * maxR * r).toFixed(1)},${(cy + Math.sin(ang) * maxR * r).toFixed(1)}`,
        );
      }
      return `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(216,175,87,${r === 1 ? '0.36' : '0.18'})" stroke-width="${r === 1 ? '1.3' : '1'}" />`;
    })
    .join('');

  const spokes: string[] = [];
  const dataPts: string[] = [];
  const vertexNodes: string[] = [];
  const labels: string[] = [];

  for (let i = 0; i < 12; i++) {
    const ang = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    const cosA = Math.cos(ang);
    const sinA = Math.sin(ang);
    const ox = cx + cosA * maxR;
    const oy = cy + sinA * maxR;
    const isFocused = i === focusedDomainId;

    spokes.push(
      `<line x1="${cx}" y1="${cy}" x2="${ox.toFixed(1)}" y2="${oy.toFixed(1)}" stroke="${isFocused ? 'rgba(242,207,126,0.75)' : 'rgba(216,175,87,0.18)'}" stroke-width="${isFocused ? '1.8' : '1'}" />`,
    );

    const skill = skills[i];
    const pct = clampNum(skill?.masteryPct ?? 50, 18, 100) / 100;
    const vx = cx + cosA * maxR * pct;
    const vy = cy + sinA * maxR * pct;
    dataPts.push(`${vx.toFixed(1)},${vy.toFixed(1)}`);

    const accent = SOVEREIGN_DOMAINS[i]?.accentHex ?? '#f2cf7e';
    vertexNodes.push(`
      <g data-radar-domain="${i}" style="cursor:pointer;">
        <circle cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" r="12" fill="transparent" />
        <circle cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" r="${isFocused ? '6.2' : '4.0'}" fill="${isFocused ? accent : '#f2cf7e'}" stroke="#080b11" stroke-width="1.5" />
      </g>
    `);

    const lx = cx + cosA * (maxR + 18);
    const ly = cy + sinA * (maxR + 16);
    const anchor = cosA < -0.25 ? 'end' : cosA > 0.25 ? 'start' : 'middle';
    const shortName = FORGE_DOMAINS[i]?.shortName ?? SOVEREIGN_DOMAINS[i]?.shortName ?? `D${i}`;
    labels.push(
      `<text data-radar-domain="${i}" x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${anchor}" fill="${isFocused ? '#f2cf7e' : '#d8d2c5'}" font-size="${isFocused ? '10.5' : '9.5'}" font-family="Inter, sans-serif" font-weight="${isFocused ? '800' : '600'}" style="cursor:pointer;">${escapeMetaHtml(shortName)}</text>`,
    );
  }

  return `
    <svg viewBox="0 0 380 308" style="width:100%;max-width:360px;height:auto;display:block;margin:0 auto;overflow:visible;">
      <defs>
        <radialGradient id="wsRadarPolyGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#56d4f5" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#f2cf7e" stop-opacity="0.34"/>
        </radialGradient>
      </defs>
      ${ringPolys}
      ${spokes.join('')}
      <polygon points="${dataPts.join(' ')}" fill="url(#wsRadarPolyGrad)" stroke="#f2cf7e" stroke-width="2.2" stroke-linejoin="round" />
      ${labels.join('')}
      ${vertexNodes.join('')}
    </svg>
  `;
}

/**
 * Builds an SVG sparkline for Historical Global Feed Percentiles (`1..99%`).
 */
function buildPercentileSparklineSvg(entries: readonly DailyPercentileEntry[]): string {
  if (entries.length === 0) return '';
  const ordered = [...entries].slice(-14);
  const w = 440;
  const h = 92;
  const padX = 22;
  const padY = 14;
  const spanW = w - padX * 2;
  const spanH = h - padY * 2;

  const pts = ordered.map((e, idx) => {
    const x =
      ordered.length === 1 ? w / 2 : padX + (idx / (ordered.length - 1)) * spanW;
    const pct = clampNum(e.percentile, 1, 99);
    const y = padY + (1 - pct / 100) * spanH;
    return { x, y, entry: e };
  });

  const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${pts[0].x.toFixed(1)},${h - padY} ${polyline} ${pts[pts.length - 1].x.toFixed(1)},${h - padY}`;

  const circles = pts
    .map(
      (p) =>
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#39d49a" stroke="#080b11" stroke-width="1.4" />`,
    )
    .join('');

  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;">
      <line x1="${padX}" y1="${padY}" x2="${w - padX}" y2="${padY}" stroke="rgba(57,212,154,0.25)" stroke-dasharray="3 3" />
      <line x1="${padX}" y1="${h / 2}" x2="${w - padX}" y2="${h / 2}" stroke="rgba(216,175,87,0.18)" stroke-dasharray="3 3" />
      <line x1="${padX}" y1="${h - padY}" x2="${w - padX}" y2="${h - padY}" stroke="rgba(184,178,166,0.2)" />
      <polygon points="${area}" fill="rgba(57,212,154,0.14)" />
      <polyline points="${polyline}" fill="none" stroke="#f2cf7e" stroke-width="2.2" />
      ${circles}
    </svg>
  `;
}

export class DiplomaticPassportBook {
  private readonly deps: DiplomaticPassportDependencies;
  private modalBackdrop: HTMLElement | null = null;
  private mountedContainer: HTMLElement | null = null;
  private unsubscribePassport: (() => void) | null = null;
  private detachEscape: (() => void) | null = null;

  private activeTab: PassportTabId = 'CREDENTIALS';
  private focusedDomainId: DomainId = 0;
  private stampAnimating = false;
  private nameFeedbackMsg: { text: string; isError: boolean } | null = null;
  private copiedDateToast: string | null = null;
  private callbacks: DiplomaticPassportCallbacks = {};

  constructor(deps: DiplomaticPassportDependencies) {
    this.deps = deps;
    ensureMetaStylesInjected();
  }

  public isOpen(): boolean {
    return this.modalBackdrop !== null || this.mountedContainer !== null;
  }

  /**
   * Opens the Meridian Diplomatic Passport 2.0 as a full-screen luxury leather-and-gold modal.
   */
  public open(options: DiplomaticPassportOpenOptions = {}): void {
    this.close();
    this.activeTab = options.initialTab ?? 'CREDENTIALS';
    this.callbacks = options;
    this.stampAnimating = Boolean(options.playStampCeremonyOnOpen);
    this.nameFeedbackMsg = null;

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-meta-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Meridian Diplomatic Passport 2.0');
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) {
        this.handleClose();
      }
    });

    document.body.appendChild(backdrop);
    this.modalBackdrop = backdrop;
    this.detachEscape = attachMetaEscapeHandler(() => this.handleBackOrClose());

    if (this.stampAnimating) {
      this.playPersonaStampAudio();
    }

    this.renderInto(backdrop, true);
  }

  private handleBackOrClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    if (this.callbacks.canGoBack && this.callbacks.onBack) {
      this.callbacks.onBack();
      return;
    }
    const onClose = this.callbacks.onClose;
    this.close();
    onClose?.();
  }

  private handleClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    const onClose = this.callbacks.onClose;
    this.close();
    onClose?.();
  }

  private playPersonaStampAudio(): void {
    this.deps.haptics?.passportStamp();
    this.deps.audio?.playSfx('passport_stamp');
    const persona = this.deps.passport.getSnapshot().persona;
    if (persona) {
      this.deps.audio?.playVoice(`vance_persona_${persona.toLowerCase()}.mp3`);
    } else {
      this.deps.audio?.playVoice('vance_stamp.mp3');
    }
  }

  /**
   * Embeds the Meridian Diplomatic Passport 2.0 directly inside any host container.
   */
  public mount(container: HTMLElement, options: DiplomaticPassportOpenOptions = {}): void {
    this.unmount();
    this.activeTab = options.initialTab ?? 'CREDENTIALS';
    this.callbacks = options;
    this.stampAnimating = Boolean(options.playStampCeremonyOnOpen);
    this.mountedContainer = container;
    this.renderInto(container, false);
  }

  public unmount(): void {
    const wasMounted = this.mountedContainer !== null;
    if (this.detachEscape) {
      this.detachEscape();
      this.detachEscape = null;
    }
    if (this.unsubscribePassport) {
      this.unsubscribePassport();
      this.unsubscribePassport = null;
    }
    if (this.mountedContainer) {
      this.mountedContainer.innerHTML = '';
      this.mountedContainer = null;
    }
    if (wasMounted || this.modalBackdrop !== null) {
      this.deps.audio?.stopVoice();
    }
  }

  public close(): void {
    this.unmount();
    if (this.modalBackdrop) {
      this.modalBackdrop.remove();
      this.modalBackdrop = null;
    }
  }

  public setActiveTab(tab: PassportTabId): void {
    this.activeTab = tab;
    this.rerender();
  }

  public triggerStampCeremony(): void {
    this.activeTab = 'CREDENTIALS';
    this.stampAnimating = true;
    this.playPersonaStampAudio();
    this.callbacks.onPassportStamped?.();
    this.rerender();
  }

  private rerender(): void {
    if (this.modalBackdrop) {
      this.renderInto(this.modalBackdrop, true);
    } else if (this.mountedContainer) {
      this.renderInto(this.mountedContainer, false);
    }
  }

  private collectDomainSkills(pSnap: PassportStateSnapshot): DomainSkillEntry[] {
    const forgeVec = forgeEngine.getSkillVector();
    // Sync latest Forge IRT theta vector back into PassportSystem domainElo seamlessly
    const skillSnap = forgeEngine.getSkillSnapshot();
    if (skillSnap.totalAnswered > 0) {
      return forgeVec;
    }
    // Blend PassportSystem baseline Elo (including Geneva Origin +45 domain affinity lifts!)
    return forgeVec.map((entry, idx) => {
      const passportElo = pSnap.domainElo[idx] ?? entry.elo;
      const theta = Number(((passportElo - 1200) / 260).toFixed(2));
      const masteryPct = Math.round(clampNum(((passportElo - 800) / 1400) * 100, 18, 100));
      return {
        ...entry,
        elo: passportElo,
        theta,
        masteryPct,
      };
    });
  }

  private renderInto(host: HTMLElement, isModal: boolean): void {
    const pSnap = this.deps.passport.getSnapshot();
    const bSnap = this.deps.blackboard?.getSnapshot() ?? null;
    const skillSnap = forgeEngine.getSkillSnapshot();
    const domainSkills = this.collectDomainSkills(pSnap);

    const challengerName = this.deps.passport.getChallengerName();
    const personaDef = pSnap.persona ? PERSONA_DEFINITIONS[pSnap.persona] : null;
    const originDef = pSnap.origin ? ORIGIN_DEFINITIONS[pSnap.origin] : null;
    const clearedVisasCount = HUB_ORDER.filter((h) => pSnap.visas[h]?.cleared).length;

    const avgElo = Math.round(
      domainSkills.reduce((acc, s) => acc + s.elo, 0) / Math.max(1, domainSkills.length),
    );
    const displayGlobalElo = skillSnap.totalAnswered > 0 ? skillSnap.globalElo : avgElo;
    const accuracyPct =
      skillSnap.totalAnswered > 0
        ? Math.round((skillSnap.totalCorrect / skillSnap.totalAnswered) * 100)
        : 0;

    const vaultJumperHtml = renderVaultJumperHtml('PASSPORT', {
      isModal,
      closeBtnId: 'ws-passport2-close',
      canNavigate: Boolean(this.callbacks.onNavigateSection),
    });

    host.innerHTML = `
      <div class="ws-meta-shell is-passport-leather">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-passport2-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">PASSPORT</h2>
              <div class="ws-meta-eyebrow">${escapeMetaHtml(challengerName)} · ${escapeMetaHtml(pSnap.passportNumber)}</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${vaultJumperHtml}
          </div>
        </div>

        <!-- 4 Single-Row Borderless Underline Tabs (Fits 360px/390px cleanly with zero edge clip) -->
        <div class="ws-meta-underline-tabs" role="tablist" aria-label="Passport Sections">
          <button type="button" role="tab" aria-selected="${this.activeTab === 'CREDENTIALS'}" class="ws-meta-underline-tab ${this.activeTab === 'CREDENTIALS' ? 'is-active' : ''}" data-passport-tab="CREDENTIALS">
            Credentials
          </button>
          <button type="button" role="tab" aria-selected="${this.activeTab === 'VISAS'}" class="ws-meta-underline-tab ${this.activeTab === 'VISAS' ? 'is-active' : ''}" data-passport-tab="VISAS">
            Visas (${clearedVisasCount}/8)
          </button>
          <button type="button" role="tab" aria-selected="${this.activeTab === 'RADAR'}" class="ws-meta-underline-tab ${this.activeTab === 'RADAR' ? 'is-active' : ''}" data-passport-tab="RADAR">
            12 Domains
          </button>
          <button type="button" role="tab" aria-selected="${this.activeTab === 'GLOBAL_FEED'}" class="ws-meta-underline-tab ${this.activeTab === 'GLOBAL_FEED' ? 'is-active' : ''}" data-passport-tab="GLOBAL_FEED">
            Global
          </button>
        </div>

        <div class="ws-meta-body-scroll">
          ${this.renderActiveTabBody(pSnap, bSnap, domainSkills, personaDef, originDef, displayGlobalElo, accuracyPct, skillSnap.totalAnswered, skillSnap.totalCorrect, skillSnap.bestStreak)}
        </div>
      </div>
    `;

    this.stampAnimating = false;
    this.bindEvents(host);
  }

  private renderActiveTabBody(
    pSnap: PassportStateSnapshot,
    bSnap: ReturnType<InkBlackboard['getSnapshot']> | null,
    domainSkills: DomainSkillEntry[],
    personaDef: (typeof PERSONA_DEFINITIONS)[keyof typeof PERSONA_DEFINITIONS] | null,
    originDef: (typeof ORIGIN_DEFINITIONS)[keyof typeof ORIGIN_DEFINITIONS] | null,
    globalElo: number,
    accuracyPct: number,
    totalAnswered: number,
    totalCorrect: number,
    bestStreak: number,
  ): string {
    if (this.activeTab === 'VISAS') {
      return this.renderVisasTab(pSnap);
    }
    if (this.activeTab === 'RADAR') {
      return this.renderRadarTab(domainSkills);
    }
    if (this.activeTab === 'GLOBAL_FEED') {
      return this.renderGlobalFeedTab(pSnap);
    }
    return this.renderCredentialsTab(
      pSnap,
      bSnap,
      personaDef,
      originDef,
      globalElo,
      accuracyPct,
      totalAnswered,
      totalCorrect,
      bestStreak,
    );
  }

  private renderCredentialsTab(
    pSnap: PassportStateSnapshot,
    bSnap: ReturnType<InkBlackboard['getSnapshot']> | null,
    personaDef: (typeof PERSONA_DEFINITIONS)[keyof typeof PERSONA_DEFINITIONS] | null,
    originDef: (typeof ORIGIN_DEFINITIONS)[keyof typeof ORIGIN_DEFINITIONS] | null,
    globalElo: number,
    accuracyPct: number,
    totalAnswered: number,
    totalCorrect: number,
    bestStreak: number,
  ): string {
    const challengerName = this.deps.passport.getChallengerName();
    const sealAccent = personaDef?.accentHex ?? '#f2cf7e';
    const stampAnimClass = this.stampAnimating ? 'is-stamping' : '';

    const integrity = bSnap?.axisIntegrity ?? 0;
    const publicTrust = bSnap?.publicTrust ?? 50;
    const councilFavor = bSnap?.councilFavor ?? 50;
    const pledgedFaction = bSnap?.pledgedFaction ?? 'UNALIGNED';

    const activePerks = (bSnap?.activePerks ?? []).map((pid) => PERK_CATALOG[pid]).filter(Boolean);

    return `
      <!-- Frameless KPI Telemetry Strip (2x2 on mobile < 560px, 4-col on desktop) -->
      <div class="ws-meta-kpi-strip is-four-col">
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Global ELO</span>
          <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${globalElo}</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Solved</span>
          <span class="ws-meta-kpi-val">${totalCorrect}/${totalAnswered} <span style="font-size:11px;color:var(--ivory-muted);">(${accuracyPct}%)</span></span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Peak Streak</span>
          <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${bestStreak}</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Trust · Favor</span>
          <span class="ws-meta-kpi-val" style="font-size:14px;"><span style="color:var(--cyan-clue);">${publicTrust}%</span> · <span style="color:var(--emerald-win);">${councilFavor}%</span></span>
        </div>
      </div>

      <div class="ws-meta-two-col" style="padding-top:14px;">
        <!-- Left Spread: Challenger Identity & Diplomatic Crests -->
        <div style="display:flex;flex-direction:column;gap:0;">
          <div class="ws-meta-section" style="padding-top:0;">
            <label for="ws-passport-name-input" class="ws-meta-section-title">
              Registered Challenger Name
            </label>
            <div style="display:flex;gap:10px;align-items:center;">
              <input
                id="ws-passport-name-input"
                class="ws-meta-input ws-name-input"
                style="flex:1 1 auto;"
                type="text"
                maxlength="22"
                autocomplete="off"
                spellcheck="false"
                placeholder="Enter your name, Challenger..."
                value="${escapeMetaHtml(challengerName)}"
              />
              <button type="button" class="ws-meta-btn-gold" id="ws-passport2-save-name">
                ✒ Stamp
              </button>
            </div>
            ${
              this.nameFeedbackMsg
                ? `<div style="font-size:11.5px;color:${this.nameFeedbackMsg.isError ? 'var(--crimson-alert)' : 'var(--emerald-win)'};">${escapeMetaHtml(this.nameFeedbackMsg.text)}</div>`
                : `<div style="font-size:11.5px;color:var(--ivory-dim);">Appears on broadcast scoreboards, Vance dialogue &amp; Daily Share Cards.</div>`
            }
          </div>

          <div class="ws-meta-section">
            <div class="ws-meta-row" style="padding-top:0;">
              <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">VETTING ORIGIN</span>
              <span style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--cyan-clue);">${escapeMetaHtml(originDef?.title ?? 'Independent Outsider')}</span>
            </div>
            <div class="ws-meta-row">
              <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">COUNCIL ALLEGIANCE</span>
              <span style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--gold-bright);">${escapeMetaHtml(pledgedFaction)}</span>
            </div>
            <div class="ws-meta-row" style="border-bottom:none;padding-bottom:0;">
              <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">INTEGRITY AXIS</span>
              <span style="font-family:var(--font-mono);font-size:12.5px;font-weight:700;color:var(--ivory-primary);">${integrity >= 0 ? `+${integrity}` : integrity}</span>
            </div>
          </div>

          <div class="ws-meta-section" style="border-bottom:none;">
            <div class="ws-meta-section-title">Diplomatic Title Crests (${pSnap.titleCrests.length})</div>
            <div class="ws-meta-hscroll">
              ${pSnap.titleCrests
                .map((crest) => {
                  const isAct = crest === pSnap.activeTitleCrest;
                  return `
                    <button type="button" class="ws-meta-chip ${isAct ? 'is-active' : ''}" data-select-crest="${escapeMetaHtml(crest)}">
                      ${isAct ? '✦ ' : ''}${escapeMetaHtml(crest)}
                    </button>
                  `;
                })
                .join('')}
            </div>
          </div>
        </div>

        <!-- Right Spread: Cognitive Persona Seal Ceremony & Signature Perk -->
        <div style="display:flex;flex-direction:column;gap:12px;--seal-accent:${sealAccent};">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div>
              <div class="ws-meta-section-title" style="color:var(--ivory-dim);">Psychometric Vetting Seal</div>
              <div style="font-family:var(--font-display);font-size:17px;font-weight:800;color:${sealAccent};margin-top:2px;">
                ${escapeMetaHtml(personaDef?.title ?? 'Unstamped Candidate')}
              </div>
            </div>
            <button type="button" class="ws-meta-inline-link" id="ws-passport2-restamp">
              ✒ Re-Stamp
            </button>
          </div>

          <div class="ws-persona-seal-stage" style="--seal-accent:${sealAccent};">
            <div class="ws-ink-ring-burst ${stampAnimClass}"></div>
            <div class="ws-persona-seal-disc ${stampAnimClass}">
              <div style="font-family:var(--font-mono);font-size:8.5px;font-weight:700;color:${sealAccent};letter-spacing:0.1em;">
                GENEVA SEAL
              </div>
              <div style="font-family:var(--font-display);font-size:14px;font-weight:800;color:var(--ivory-primary);margin:5px 0 3px;line-height:1.15;">
                ${escapeMetaHtml((personaDef?.title ?? 'CANDIDATE').toUpperCase())}
              </div>
              <div style="font-family:var(--font-mono);font-size:8px;color:var(--ivory-muted);">
                ${escapeMetaHtml(personaDef?.stampCode ?? 'MRD-00 // PENDING')}
              </div>
              <div style="margin-top:6px;font-family:var(--font-mono);font-size:8px;color:var(--emerald-win);">
                ${pSnap.stampedAtIso ? `STAMPED ${escapeMetaHtml(pSnap.stampedAtIso.slice(0, 10))}` : 'AWAITING Q1–Q4'}
              </div>
            </div>
            <div style="margin-top:10px;font-size:12.5px;color:var(--ivory-primary);font-style:italic;text-align:center;max-width:380px;line-height:1.42;">
              “${escapeMetaHtml(
                sanitizeMetaCopy(
                  (pSnap.persona && PERSONA_CEREMONY_QUOTES[pSnap.persona]?.spokenQuote) ||
                    personaDef?.motto ||
                    'Complete Julian Vance’s 4-Question Geneva Vetting Assessment to stamp your Cognitive Persona.',
                ),
              )}”
            </div>
            ${
              pSnap.persona && PERSONA_CEREMONY_QUOTES[pSnap.persona]
                ? `<div style="margin-top:4px;font-size:11px;color:var(--cyan-clue);text-align:center;max-width:380px;">
                    ✦ ${escapeMetaHtml(sanitizeMetaCopy(PERSONA_CEREMONY_QUOTES[pSnap.persona].tellCaption))}
                  </div>`
                : ''
            }
          </div>

          <div class="ws-meta-note">
            <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;">
              SIGNATURE PERK · ${escapeMetaHtml(personaDef?.startingPerkName ?? 'Clean Calibration')}
            </div>
            <div style="font-size:12px;color:var(--ivory-muted);margin-top:3px;">
              ${escapeMetaHtml(personaDef?.startingPerkDesc ?? personaDef?.dossierAssessment ?? 'Your Spin, Peel, and Overclock instincts in Geneva determine your permanent starting signature perk.')}
            </div>
            ${
              activePerks.length > 0
                ? `<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:8px;font-family:var(--font-mono);font-size:10.5px;color:var(--cyan-clue);">
                    ${activePerks.map((pk) => `<span>◆ ${escapeMetaHtml(pk.name)}</span>`).join('')}
                  </div>`
                : ''
            }
          </div>
        </div>
      </div>
    `;
  }

  private renderVisasTab(pSnap: PassportStateSnapshot): string {
    const cardsHtml = HUB_ORDER.map((hubId) => {
      const visa: CountryVisaRecord | undefined = pSnap.visas[hubId];
      if (!visa) return '';
      const primaryPngUrl = this.deps.visaStampUrls?.[hubId] ?? `./assets/visas/visa_${hubId}.png`;
      const fallbackSvgUri = getVisaStampDataUri(hubId, visa.cleared);
      const relicEntry = RELIC_CATALOG[visa.relicId];
      const starPx = visa.totalMissions > 6 ? 10 : 12;
      const starsHtml = Array.from({ length: Math.min(12, visa.totalMissions) }, (_, idx) => {
        const filled = visa.cleared || idx < visa.missionsCompleted;
        return `<img src="./assets/ui/${filled ? 'star_filled' : 'star_empty'}.png" alt="" style="width:${starPx}px;height:${starPx}px;object-fit:contain;" />`;
      }).join('');

      return `
        <div class="ws-visa-card ${visa.cleared ? 'is-cleared' : 'is-locked'}">
          <img
            class="ws-visa-stamp-img"
            src="${escapeMetaHtml(primaryPngUrl)}"
            data-fallback-src="${escapeMetaHtml(fallbackSvgUri)}"
            alt="${escapeMetaHtml(visa.city)} Diplomatic Visa Stamp"
            style="${visa.cleared ? '' : 'filter:grayscale(0.85) opacity(0.6);'}"
          />
          <div style="font-family:var(--font-display);font-size:12.5px;font-weight:800;color:var(--ivory-primary);letter-spacing:0.04em;">
            ${escapeMetaHtml(visa.city.toUpperCase())}
          </div>
          <div style="font-family:var(--font-mono);font-size:9.5px;color:${visa.cleared ? 'var(--emerald-win)' : 'var(--ivory-dim)'};font-weight:700;">
            ${escapeMetaHtml(visa.stampSerial)} · ${visa.cleared ? 'CLEARED' : `${visa.missionsCompleted}/${visa.totalMissions}`}
          </div>
          <div style="font-size:10.5px;color:var(--ivory-muted);line-height:1.25;">
            ${escapeMetaHtml(visa.visaTitle)}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:2px;align-items:center;justify-content:center;margin:2px auto;max-width:136px;">
            ${starsHtml}
          </div>
          ${
            this.callbacks.onInspectRelicInObservatory
              ? `
                <button type="button" class="ws-meta-inline-link" data-inspect-relic="${visa.relicId}" style="margin-top:auto;font-size:10.5px;justify-content:center;">
                  ${visa.relicUnlocked || visa.cleared ? '🏆' : '🔒'} ${escapeMetaHtml(relicEntry?.name ?? 'Relic')} ›
                </button>
              `
              : ''
          }
        </div>
      `;
    }).join('');

    return `
      <div class="ws-meta-section" style="border-bottom:none;">
        <div>
          <div class="ws-meta-section-title">Eight Sovereign Hub Visas</div>
          <div style="font-size:12px;color:var(--ivory-muted);margin-top:3px;">
            Clear each World Venue to stamp your Diplomatic Visa &amp; recover its 3D Tier-3 Boss Relic.
          </div>
        </div>
        <div class="ws-visa-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  private renderRadarTab(domainSkills: DomainSkillEntry[]): string {
    const focused = domainSkills[this.focusedDomainId] ?? domainSkills[0];
    const focusedMeta = SOVEREIGN_DOMAINS[this.focusedDomainId] ?? SOVEREIGN_DOMAINS[0];

    let strongest = domainSkills[0];
    let weakest = domainSkills[0];
    for (const s of domainSkills) {
      if (s.elo > strongest.elo) strongest = s;
      if (s.elo < weakest.elo) weakest = s;
    }

    const thetaSign = focused.theta >= 0 ? `+${focused.theta.toFixed(2)}` : focused.theta.toFixed(2);

    return `
      <div class="ws-meta-two-col">
        <!-- Left: Interactive SVG 12-Domain Radar -->
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="text-align:center;">
            <div class="ws-meta-section-title">12-Domain IRT Cognitive Radar (θ)</div>
            <div style="font-size:11.5px;color:var(--ivory-muted);margin-top:2px;">
              Tap any spoke or domain row to inspect telemetry
            </div>
          </div>

          ${buildInteractiveRadarSvg(domainSkills, this.focusedDomainId)}

          <div class="ws-meta-note" style="box-shadow:inset 3px 0 0 ${focusedMeta.accentHex};display:flex;align-items:center;gap:10px;padding:8px 0 8px 12px;">
            <img src="./${escapeMetaHtml(focusedMeta.medallionUrl)}" alt="" style="width:36px;height:36px;object-fit:contain;flex-shrink:0;" />
            <div style="min-width:0;flex:1 1 auto;">
              <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;align-items:baseline;">
                <span style="font-family:var(--font-display);font-size:14px;font-weight:800;color:${focusedMeta.accentHex};">
                  ${escapeMetaHtml(focused.name)}
                </span>
                <span style="font-family:var(--font-mono);font-size:11.5px;font-weight:700;color:var(--gold-bright);">
                  ELO ${focused.elo} · θ ${thetaSign}
                </span>
              </div>
              <div style="font-size:11.5px;color:var(--ivory-muted);margin-top:2px;">
                ${escapeMetaHtml(focused.rankTitle)} · Mastery ${focused.masteryPct}% · <strong style="color:var(--cyan-clue);">${escapeMetaHtml(focusedMeta.factionAffinity)}</strong>
              </div>
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--ivory-muted);padding-top:6px;border-top:1px solid rgba(255,255,255,0.07);">
            <span>★ APEX: <strong style="color:var(--emerald-win);">${escapeMetaHtml(strongest.shortName)} (${strongest.elo})</strong></span>
            <span>⚠ TARGET: <strong style="color:var(--amber-warn);">${escapeMetaHtml(weakest.shortName)} (${weakest.elo})</strong></span>
          </div>
        </div>

        <!-- Right: Hairline 12-Domain ELO List -->
        <div style="display:flex;flex-direction:column;">
          <div class="ws-meta-section-title" style="margin-bottom:6px;">Domain ELO &amp; Mastery</div>
          ${domainSkills
            .map((s, idx) => {
              const meta = SOVEREIGN_DOMAINS[idx];
              const isFoc = idx === this.focusedDomainId;
              return `
                <button type="button" class="ws-meta-row is-interactive ${isFoc ? 'is-focused' : ''}" data-focus-domain="${idx}" style="width:100%;text-align:left;">
                  <span style="display:inline-flex;align-items:center;gap:9px;min-width:0;">
                    <img src="./${escapeMetaHtml(meta.medallionUrl)}" alt="" style="width:24px;height:24px;object-fit:contain;flex-shrink:0;" />
                    <span style="font-size:12.5px;font-weight:600;color:var(--ivory-primary);">${escapeMetaHtml(s.shortName)}</span>
                  </span>
                  <span style="font-family:var(--font-mono);font-size:11.5px;font-weight:700;color:${meta.accentHex};flex-shrink:0;">
                    ${s.elo} <span style="color:var(--ivory-dim);font-weight:500;">· ${s.masteryPct}%</span>
                  </span>
                </button>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  private renderGlobalFeedTab(pSnap: PassportStateSnapshot): string {
    const dailyStore = readDailyFeedStorage();
    const history = [...pSnap.dailyHistory].sort((a, b) => b.utcDate.localeCompare(a.utcDate));

    const bestPercentile = Math.max(
      dailyStore.bestPercentile,
      ...history.map((h) => h.percentile),
      0,
    );
    const bestTopPct = bestPercentile > 0 ? Math.max(1, 100 - bestPercentile) : null;
    const bestScore = Math.max(dailyStore.bestScore, ...history.map((h) => h.score), 0);

    return `
      <div class="ws-meta-kpi-strip">
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Daily Streak</span>
          <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${dailyStore.dailyStreak}d 🔥</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Peak Percentile</span>
          <span class="ws-meta-kpi-val" style="color:var(--emerald-win);">${bestTopPct !== null ? `TOP ${bestTopPct}%` : 'UNRANKED'}</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Peak Broadcast</span>
          <span class="ws-meta-kpi-val">${Math.round(bestScore).toLocaleString('en-US')} <span style="font-size:10.5px;color:var(--ivory-dim);">PTS</span></span>
        </div>
      </div>

      ${
        history.length > 0
          ? `
            <div class="ws-meta-section">
              <div class="ws-meta-section-title">Percentile Trajectory (Last ${Math.min(14, history.length)} UTC Broadcasts)</div>
              ${buildPercentileSparklineSvg([...pSnap.dailyHistory])}
            </div>

            <div class="ws-meta-section" style="border-bottom:none;">
              <div class="ws-meta-section-title">Broadcast Ledger (00:00 UTC)</div>
              <div>
                ${history
                  .map((entry) => {
                    const topPct = Math.max(1, 100 - clampNum(entry.percentile, 1, 99));
                    const savedShare = dailyStore.shareCardsByDate[entry.utcDate];
                    const wasCopied = this.copiedDateToast === entry.utcDate;
                    return `
                      <div class="ws-meta-row" style="flex-wrap:wrap;">
                        <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
                          <span style="font-family:var(--font-mono);font-size:12.5px;font-weight:700;color:var(--gold-bright);">
                            ${escapeMetaHtml(entry.utcDate)}
                          </span>
                          <span style="font-family:var(--font-mono);font-size:12px;color:var(--ivory-primary);">
                            ${Math.round(entry.score).toLocaleString('en-US')} PTS
                          </span>
                          <span style="font-size:11.5px;color:var(--ivory-muted);">
                            ${entry.correctCount}/7
                          </span>
                        </div>
                        <div style="display:flex;align-items:center;gap:10px;">
                          <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--emerald-win);">
                            TOP ${topPct}%
                          </span>
                          ${
                            savedShare
                              ? `<button type="button" class="ws-meta-inline-link" data-copy-daily="${escapeMetaHtml(entry.utcDate)}">
                                  ${wasCopied ? '✓ Copied' : 'Share'}
                                </button>`
                              : ''
                          }
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            </div>
          `
          : `
            <div class="ws-meta-section" style="text-align:center;padding:32px 12px;border-bottom:none;">
              <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--gold-bright);margin-bottom:6px;">
                No Global Feed Broadcasts Yet
              </div>
              <div style="font-size:12.5px;color:var(--ivory-muted);max-width:420px;margin:0 auto;line-height:1.45;">
                Complete today’s synchronized 00:00 UTC World Broadcast in <strong>The Global Feed</strong> to record your Global Percentile and Share Card.
              </div>
            </div>
          `
      }
    `;
  }

  private bindEvents(host: HTMLElement): void {
    host.querySelectorAll<HTMLImageElement>('img[data-fallback-src]').forEach((img) => {
      img.addEventListener(
        'error',
        () => {
          const fb = img.dataset.fallbackSrc;
          if (fb && img.src !== fb) {
            img.src = fb;
          }
        },
        { once: true },
      );
    });

    host.querySelector('#ws-passport2-back')?.addEventListener('click', () => {
      this.handleBackOrClose();
    });

    bindVaultJumperEvents(host, {
      closeBtnId: 'ws-passport2-close',
      onNavigate: (target) => this.callbacks.onNavigateSection?.(target),
      onClose: () => this.handleClose(),
      onTapFeedback: () => {
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
      },
    });

    host.querySelectorAll<HTMLButtonElement>('[data-passport-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextTab = btn.dataset.passportTab as PassportTabId | undefined;
        if (!nextTab || nextTab === this.activeTab) return;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.activeTab = nextTab;
        this.nameFeedbackMsg = null;
        this.rerender();
      });
    });

    // Native Challenger Name <input> with full hotkey isolation!
    const nameInput = host.querySelector<HTMLInputElement>('#ws-passport-name-input');
    if (nameInput) {
      const stopKeys = (ev: KeyboardEvent) => ev.stopPropagation();
      nameInput.addEventListener('keyup', stopKeys);
      nameInput.addEventListener('keypress', stopKeys);
      nameInput.addEventListener('input', () => {
        const cleanLive = sanitizeLiveChallengerInput(nameInput.value);
        if (nameInput.value !== cleanLive) {
          nameInput.value = cleanLive;
        }
      });

      const commitName = () => {
        const check = validateChallengerName(nameInput.value);
        if (!check.valid) {
          this.nameFeedbackMsg = {
            text: check.error ?? 'Enter a valid name (1–22 characters).',
            isError: true,
          };
          this.rerender();
          return;
        }
        this.deps.passport.setChallengerName(check.cleaned);
        this.nameFeedbackMsg = {
          text: `Credentials stamped for ${check.cleaned}.`,
          isError: false,
        };
        this.stampAnimating = true;
        this.deps.haptics?.passportStamp();
        this.deps.audio?.playSfx('passport_stamp');
        this.callbacks.onPassportStamped?.();
        this.callbacks.onRenameChallenger?.(check.cleaned);
        this.rerender();
      };

      host.querySelector('#ws-passport2-save-name')?.addEventListener('click', commitName);
      nameInput.addEventListener('keydown', (ev) => {
        ev.stopPropagation();
        if (ev.key === 'Enter') {
          ev.preventDefault();
          commitName();
        }
      });
    }

    host.querySelector('#ws-passport2-restamp')?.addEventListener('click', () => {
      this.triggerStampCeremony();
    });

    host.querySelectorAll<HTMLButtonElement>('[data-select-crest]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const crest = btn.dataset.selectCrest;
        if (!crest) return;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.deps.passport.unlockTitleCrest(crest, true);
        this.rerender();
      });
    });

    host.querySelectorAll<HTMLButtonElement>('[data-inspect-relic]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const relicId = btn.dataset.inspectRelic as HeroRelicId | undefined;
        if (!relicId) return;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.callbacks.onInspectRelicInObservatory?.(relicId);
      });
    });

    const selectDomain = (idxRaw: string | undefined) => {
      const idx = Number(idxRaw);
      if (!Number.isFinite(idx) || idx < 0 || idx > 11) return;
      this.deps.haptics?.spinTick();
      this.deps.audio?.playSfx('spin_tick');
      this.focusedDomainId = idx as DomainId;
      this.rerender();
    };

    host.querySelectorAll<HTMLElement>('[data-focus-domain]').forEach((el) => {
      el.addEventListener('click', () => selectDomain(el.dataset.focusDomain));
    });
    host.querySelectorAll<SVGElement>('[data-radar-domain]').forEach((el) => {
      el.addEventListener('click', () => selectDomain(el.getAttribute('data-radar-domain') ?? undefined));
    });

    host.querySelectorAll<HTMLButtonElement>('[data-copy-daily]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dt = btn.dataset.copyDaily;
        if (!dt) return;
        const share = readDailyFeedStorage().shareCardsByDate[dt];
        if (share) {
          void navigator.clipboard?.writeText(share).catch(() => {});
          this.copiedDateToast = dt;
          this.deps.haptics?.uiTap();
          this.deps.audio?.playSfx('ui_tap');
          this.rerender();
        }
      });
    });
  }
}
