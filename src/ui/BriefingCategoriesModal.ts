// ============================================================================
// WORLD'S SMARTEST — The Briefing Room 3-Level Drill-Down Sheet (2026 Mobile-First)
//  • Full-height frameless dark-velvet sheet (zero NinePatch / zero nested boxes)
//  • Sticky 48px header (`← Back` · Title · `✕`), minimal breadcrumb text trail,
//    and sleek underline search (`Search 157 topics, e.g. Baseball...`)
//  • 3-Level Drill-Down: All Domains -> L0 Domain -> L1 Category -> L2 Specialist Topic
//  • Clean frameless hairline list rows (mobile) / flush 2-col hairline grid (desktop)
//  • Pinned bottom launch bar: segmented `5 · 10 · 20 · 50 Qs` + `START BRIEFING ▶`
// ============================================================================

import {
  getAcademicTierSpec,
  normalizeBriefingDifficultyPreset,
  presetToAcademicTier,
} from '../forge/QuestionDifficultyCalibration';
import type { BriefingDifficultyPreset, DomainId, ForgeUniverseCounts } from '../forge/types';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import {
  buildNormalizedTaxonomyTree,
  countTaxonomyNodes,
  prefetchExternalTaxonomyJson,
  searchTaxonomyTree,
  stripYearCommas,
  type BriefingDrillLaunchSpec,
  type BriefingRoundCount,
  type TaxonomyL0Domain,
} from './BriefingTaxonomyAdapter';

export type BriefingLaunchSpec = BriefingDrillLaunchSpec;

export interface BriefingModalOpenOptions {
  initialL0DomainId?: DomainId | null;
  initialL1SubcategoryId?: string | null;
  initialL2TopicId?: string | null;
  initialSearchQuery?: string;
  forgeInstance?: unknown;
}

const BRIEFING_SHEET_STYLE_ID = 'ws-sleek-briefing-sheet-css';
const PREFERRED_DIFFICULTY_STORAGE_KEY = 'ws_preferred_difficulty_v2';

function loadPreferredDifficulty(): BriefingDifficultyPreset {
  try {
    if (typeof localStorage === 'undefined') return 'ADAPTIVE';
    const raw = localStorage.getItem(PREFERRED_DIFFICULTY_STORAGE_KEY);
    if (!raw) return 'ADAPTIVE';
    return normalizeBriefingDifficultyPreset(raw);
  } catch {
    return 'ADAPTIVE';
  }
}

function savePreferredDifficulty(preset: BriefingDifficultyPreset): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PREFERRED_DIFFICULTY_STORAGE_KEY, preset);
    }
  } catch {
    // Ignore storage quota / private mode restrictions
  }
}

function escapeHtml(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatQuestionCount(n: number): string {
  return Math.max(0, Math.round(n)).toLocaleString('en-US');
}

function ensureBriefingSheetStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(BRIEFING_SHEET_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = BRIEFING_SHEET_STYLE_ID;
  style.textContent = `
    .ws-velvet-backdrop.ws-briefing-modal {
      position: fixed;
      inset: 0;
      z-index: 65;
      background: rgba(3, 5, 10, 0.88);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 0;
      pointer-events: auto;
    }

    .ws-velvet-sheet.ws-briefing-sheet {
      position: relative;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      max-height: 100dvh;
      background:
        radial-gradient(ellipse 90% 34% at 50% 0%, rgba(216, 175, 87, 0.085) 0%, rgba(7, 10, 18, 0) 70%),
        #070a12;
      border: none !important;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
    }

    .ws-velvet-sheet.ws-briefing-sheet::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 4%, rgba(232, 197, 116, 0.42) 50%, transparent 96%);
      pointer-events: none;
      z-index: 10;
    }

    @media (min-width: 768px) and (min-height: 560px) {
      .ws-velvet-backdrop.ws-briefing-modal {
        align-items: center;
        padding: 20px;
      }
      .ws-velvet-sheet.ws-briefing-sheet {
        max-width: 840px;
        height: min(88dvh, 840px);
        max-height: min(88dvh, 840px);
        border-radius: 18px;
        box-shadow:
          0 32px 84px rgba(0, 0, 0, 0.84),
          0 0 0 1px rgba(242, 207, 126, 0.14);
      }
    }

    .ws-briefing-sheet .ws-sheet-header {
      position: sticky;
      top: 0;
      z-index: 8;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: minmax(76px, auto) minmax(0, 1fr) minmax(44px, auto);
      align-items: center;
      gap: 6px;
      min-height: calc(48px + env(safe-area-inset-top, 0px));
      padding: env(safe-area-inset-top, 0px) 8px 0 8px;
      background: rgba(7, 10, 18, 0.96);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .ws-briefing-sheet .ws-sheet-nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      gap: 5px;
      min-height: 44px;
      min-width: 44px;
      padding: 0 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--gold-bright, #f2cf7e);
      font-size: 13.5px;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-nav-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffebb8;
    }

    .ws-briefing-sheet .ws-sheet-title {
      margin: 0;
      text-align: center;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: clamp(13.5px, 1.5vw, 16px);
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-sheet .ws-sheet-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(246, 242, 233, 0.66);
      font-size: 17px;
      line-height: 1;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-icon-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-subhead {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      padding: 2px 16px 6px;
      background: rgba(7, 10, 18, 0.94);
      border: none;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 2px;
      min-width: 0;
      overflow-x: auto;
      scrollbar-width: none;
      white-space: nowrap;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs::-webkit-scrollbar {
      display: none;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs .ws-briefing-crumb {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      min-height: 36px;
      min-width: auto;
      padding: 4px 5px;
      border: none;
      border-radius: 0;
      background: transparent !important;
      color: rgba(246, 242, 233, 0.68);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
      font-size: 12.5px;
      font-weight: 500;
      letter-spacing: 0.01em;
      transition: color 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs .ws-briefing-crumb:hover {
      background: transparent !important;
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs .ws-briefing-crumb.is-current {
      background: transparent !important;
      color: var(--gold-bright, #f2cf7e);
      font-weight: 600;
    }

    .ws-briefing-crumb-sep {
      color: rgba(246, 242, 233, 0.56);
      font-size: 13px;
      padding: 0 2px;
      user-select: none;
      flex-shrink: 0;
    }

    .ws-briefing-search-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .ws-briefing-search-icon {
      position: absolute;
      left: 2px;
      width: 15px;
      height: 15px;
      color: rgba(246, 242, 233, 0.62);
      pointer-events: none;
    }

    .ws-briefing-sheet .ws-sheet-search {
      width: 100%;
      max-width: none;
      min-height: 44px;
      padding: 8px 44px 8px 26px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 0;
      background: transparent;
      color: var(--ivory-primary, #f6f2e9);
      font-size: 14.5px;
      font-weight: 400;
      outline: none;
      box-shadow: none;
      transition: border-color 0.16s ease;
    }

    .ws-briefing-sheet .ws-sheet-search::placeholder {
      color: rgba(246, 242, 233, 0.60);
    }

    .ws-briefing-sheet .ws-sheet-search:focus {
      border-bottom-color: rgba(242, 207, 126, 0.78);
    }

    .ws-briefing-sheet .ws-sheet-search::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
    }

    .ws-briefing-search-clear {
      position: absolute;
      right: -4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      border: none;
      background: transparent;
      color: rgba(246, 242, 233, 0.68);
      font-size: 14px;
    }

    .ws-briefing-search-clear:hover {
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      border: none;
    }

    .ws-briefing-section-label {
      padding: 10px 16px 6px;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(246, 242, 233, 0.62);
      font-variant-numeric: tabular-nums;
    }

    .ws-briefing-sheet .ws-sheet-list {
      display: flex;
      flex-direction: column;
      width: 100%;
      border: none;
    }

    @media (min-width: 720px) {
      .ws-briefing-sheet .ws-sheet-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ws-briefing-sheet .ws-sheet-row:nth-child(even) {
        box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.05);
      }
      .ws-briefing-sheet .ws-sheet-row.is-selected:nth-child(even) {
        box-shadow:
          inset 3px 0 0 var(--gold-bright, #f2cf7e),
          inset 1px 0 0 rgba(255, 255, 255, 0.05);
      }
    }

    .ws-briefing-sheet .ws-sheet-row {
      width: 100%;
      min-height: 58px;
      padding: 11px 16px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 0;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 13px;
      text-align: left;
      transition: background 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-row:hover {
      background: rgba(255, 255, 255, 0.036);
    }

    .ws-briefing-sheet .ws-sheet-row:active {
      background: rgba(242, 207, 126, 0.07);
    }

    .ws-briefing-sheet .ws-sheet-row.is-selected {
      background: linear-gradient(90deg, rgba(242, 207, 126, 0.11) 0%, rgba(242, 207, 126, 0.025) 100%);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-row-icon {
      width: 34px;
      height: 34px;
      object-fit: contain;
      flex-shrink: 0;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.55));
    }

    .ws-briefing-row-all-glyph {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(242, 207, 126, 0.12);
      color: var(--gold-bright, #f2cf7e);
      font-size: 14px;
    }

    .ws-briefing-row-copy {
      min-width: 0;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ws-briefing-row-title {
      font-size: 14.5px;
      font-weight: 600;
      line-height: 1.25;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-sheet .ws-sheet-row.is-selected .ws-briefing-row-title {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-row-sub {
      font-size: 11.5px;
      line-height: 1.25;
      color: rgba(246, 242, 233, 0.64);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-row-meta {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      margin-left: 6px;
    }

    .ws-briefing-row-count {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11.5px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: rgba(242, 207, 126, 0.88);
      white-space: nowrap;
    }

    .ws-briefing-row-chevron {
      font-size: 18px;
      line-height: 1;
      color: rgba(246, 242, 233, 0.60);
      width: 14px;
      text-align: center;
    }

    .ws-briefing-row-check {
      font-size: 14px;
      font-weight: 800;
      line-height: 1;
      color: var(--gold-bright, #f2cf7e);
      width: 16px;
      text-align: center;
    }

    .ws-briefing-empty {
      padding: 36px 20px;
      text-align: center;
      color: rgba(246, 242, 233, 0.58);
      font-size: 13.5px;
      line-height: 1.5;
    }

    .ws-briefing-empty-chips {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
    }

    .ws-briefing-suggest-btn {
      min-height: 44px;
      padding: 0 14px;
      border: none;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--gold-bright, #f2cf7e);
      font-size: 12.5px;
      font-weight: 600;
    }

    .ws-briefing-suggest-btn:hover {
      background: rgba(242, 207, 126, 0.16);
    }

    .ws-briefing-sheet .ws-sheet-footer {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
      gap: 8px;
      padding: 10px 16px max(12px, env(safe-area-inset-bottom, 0px));
      background: rgba(6, 9, 16, 0.98);
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: none;
    }

    .ws-briefing-footer-top {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }

    .ws-briefing-target-line {
      min-width: 0;
      flex: 0 0 auto;
      width: 100%;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      font-size: 12px;
      color: rgba(246, 242, 233, 0.62);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-target-name {
      color: var(--ivory-primary, #f6f2e9);
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-target-qs {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      color: var(--gold-bright, #f2cf7e);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .ws-briefing-diff-strip {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 2px;
      width: 100%;
      background: rgba(255, 255, 255, 0.045);
      border-radius: 9px;
      padding: 2px;
      border: none;
      overflow: hidden;
    }

    .ws-briefing-diff-btn {
      flex: 1 0 auto;
      min-height: 36px;
      min-width: 0;
      padding: 0 5px;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: rgba(246, 242, 233, 0.72);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
      text-align: center;
      transition: background 0.14s ease, color 0.14s ease;
    }

    @media (max-width: 399px) {
      .ws-briefing-sheet .ws-sheet-footer {
        padding-left: 10px;
        padding-right: 10px;
      }
      .ws-briefing-diff-btn {
        font-size: 10px;
        padding: 0 3.5px;
        letter-spacing: 0;
      }
    }

    .ws-briefing-diff-btn.is-active {
      background: rgba(242, 207, 126, 0.2);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-diff-indicator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 11px;
      line-height: 1.25;
      color: rgba(246, 242, 233, 0.76);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-diff-indicator strong {
      color: var(--gold-bright, #f2cf7e);
      font-weight: 700;
    }

    .ws-briefing-footer-main {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      gap: 8px;
    }

    .ws-briefing-sheet .ws-segmented-group {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 3px;
      padding: 3px;
      border-radius: 11px;
      background: rgba(255, 255, 255, 0.055);
      border: none;
      flex: 0 0 auto;
      width: 100%;
    }

    .ws-briefing-sheet .ws-segmented-btn {
      min-height: 44px;
      min-width: 44px;
      padding: 0 8px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(246, 242, 233, 0.64);
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 12px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-briefing-sheet .ws-segmented-btn:hover {
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-sheet .ws-segmented-btn.is-active {
      background: rgba(242, 207, 126, 0.2);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-launch-cta {
      flex: 0 0 auto;
      width: 100%;
      min-height: 48px;
      padding: 0 20px;
      border: none !important;
      border-radius: 12px;
      background: linear-gradient(180deg, #fae29c 0%, #d8ab4e 56%, #b5842c 100%);
      color: #0e121a;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      white-space: nowrap;
      box-shadow: 0 8px 24px rgba(216, 175, 87, 0.28);
      transition: filter 0.14s ease, transform 0.12s ease;
    }

    @media (min-width: 640px) {
      .ws-briefing-footer-top {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
      }
      .ws-briefing-target-line {
        flex: 0 0 auto;
        width: 100%;
        justify-content: space-between;
      }
      .ws-briefing-diff-strip {
        display: flex;
        width: 100%;
        gap: 3px;
      }
      .ws-briefing-diff-btn {
        min-width: 56px;
        padding: 0 10px;
        font-size: 11px;
      }
      .ws-briefing-footer-main {
        flex-direction: row;
        align-items: center;
        gap: 10px;
      }
      .ws-briefing-sheet .ws-segmented-group {
        flex: 1 1 260px;
        width: auto;
      }
      .ws-briefing-launch-cta {
        flex: 1.15 1 220px;
        width: auto;
      }
    }

    .ws-briefing-launch-cta:hover {
      filter: brightness(1.06);
    }

    .ws-briefing-launch-cta:active {
      transform: scale(0.99);
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-briefing-sheet .ws-sheet-header {
        min-height: 44px;
      }
      .ws-briefing-subhead {
        flex-direction: row;
        align-items: center;
        gap: 14px;
        padding: 0 16px 4px;
      }
      .ws-briefing-sheet .ws-sheet-breadcrumbs {
        flex: 0 1 auto;
        max-width: 52%;
      }
      .ws-briefing-search-wrap {
        flex: 1 1 220px;
      }
      .ws-briefing-sheet .ws-sheet-search {
        min-height: 40px;
        padding: 4px 36px 4px 24px;
        font-size: 13px;
      }
      .ws-briefing-sheet .ws-sheet-row {
        min-height: 48px;
        padding: 7px 14px;
      }
      .ws-briefing-sheet .ws-sheet-footer {
        padding: 6px 14px max(6px, env(safe-area-inset-bottom, 0px));
        gap: 5px;
      }
      .ws-briefing-footer-top {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .ws-briefing-target-line {
        flex: 0 1 200px;
        width: auto;
        min-width: 0;
        justify-content: flex-start;
      }
      .ws-briefing-diff-strip {
        flex: 1 1 auto;
        width: auto;
        max-width: 540px;
      }
      .ws-briefing-diff-btn {
        min-height: 32px;
        padding: 0 8px;
        font-size: 10.5px;
      }
      .ws-briefing-diff-indicator {
        display: none;
      }
      .ws-briefing-footer-main {
        flex-direction: row;
        align-items: center;
        gap: 8px;
      }
      .ws-briefing-sheet .ws-segmented-group {
        flex: 1 1 220px;
        width: auto;
      }
      .ws-briefing-launch-cta {
        flex: 1.15 1 200px;
        width: auto;
        min-height: 44px;
      }
    }
  `;
  document.head.appendChild(style);
}

export class BriefingCategoriesModal {
  private readonly audio: StudioAudioEngine;
  private readonly haptics: HapticsEngine;
  private modalEl: HTMLElement | null = null;
  private boundKeyDown: ((ev: KeyboardEvent) => void) | null = null;

  constructor(audio: StudioAudioEngine, haptics: HapticsEngine) {
    this.audio = audio;
    this.haptics = haptics;
  }

  public isOpen(): boolean {
    return this.modalEl !== null;
  }

  public open(
    counts: ForgeUniverseCounts,
    onLaunch: (spec: BriefingDrillLaunchSpec) => void,
    onClose?: () => void,
    opts?: BriefingModalOpenOptions,
  ): void {
    this.close();
    ensureBriefingSheetStyles();

    let tree: TaxonomyL0Domain[] = buildNormalizedTaxonomyTree(counts, opts?.forgeInstance);
    let activeL0: DomainId | null = opts?.initialL0DomainId ?? null;
    let activeL1Id: string | null = opts?.initialL1SubcategoryId ?? null;
    let activeL2Id: string | null = opts?.initialL2TopicId ?? null;
    let searchQuery = opts?.initialSearchQuery ?? '';
    let difficulty: BriefingDifficultyPreset = loadPreferredDifficulty();
    let roundCount: BriefingRoundCount = 10;

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-modal-backdrop ws-briefing-modal ws-velvet-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'The Briefing Room 3-Level Category & Subcategory Picker');

    const getCurrentSelection = (): BriefingDrillLaunchSpec & { poolCount: number } => {
      const domNode =
        activeL0 !== null ? tree.find((d) => d.domainId === activeL0) ?? null : null;
      const l1Node =
        domNode && activeL1Id
          ? domNode.subcategories.find((c) => c.id === activeL1Id) ?? null
          : null;
      const l2Node =
        l1Node && activeL2Id
          ? l1Node.topics.find((t) => t.id === activeL2Id) ?? null
          : null;

      if (domNode && l1Node && l2Node) {
        const sameAsL0 =
          domNode.shortName.trim().toLowerCase() === l1Node.name.trim().toLowerCase();
        const label = sameAsL0
          ? `${domNode.name} › ${l2Node.name}`
          : `${domNode.shortName} › ${l1Node.name} › ${l2Node.name}`;
        return {
          domains: [domNode.domainId],
          l0DomainId: domNode.domainId,
          l1SubcategoryId: l1Node.id,
          l2TopicId: l2Node.id,
          selectionLabel: label,
          topicKeywords: l2Node.keywords,
          difficulty,
          count: roundCount,
          poolCount: l2Node.verifiedCount,
        };
      }
      if (domNode && l1Node) {
        const sameAsL0 =
          domNode.shortName.trim().toLowerCase() === l1Node.name.trim().toLowerCase();
        return {
          domains: [domNode.domainId],
          l0DomainId: domNode.domainId,
          l1SubcategoryId: l1Node.id,
          selectionLabel: sameAsL0 ? `${domNode.name} › ${l1Node.name}` : `${domNode.shortName} › ${l1Node.name}`,
          difficulty,
          count: roundCount,
          poolCount: l1Node.verifiedCount,
        };
      }
      if (domNode) {
        return {
          domains: [domNode.domainId],
          l0DomainId: domNode.domainId,
          selectionLabel: domNode.name,
          difficulty,
          count: roundCount,
          poolCount: domNode.verifiedCount,
        };
      }
      const playableTotal = Math.max(
        1000129,
        counts.totalPlayableCount,
        countTaxonomyNodes(tree).totalVerified,
      );
      return {
        domains: [],
        selectionLabel: 'Global Mix (All 12 Domains)',
        difficulty,
        count: roundCount,
        poolCount: playableTotal,
      };
    };

    const stepBackOrClose = () => {
      if (searchQuery.trim().length > 0) {
        searchQuery = '';
        const input = backdrop.querySelector<HTMLInputElement>('#ws-briefing-search');
        if (input) input.value = '';
        renderDynamicZones();
        return;
      }
      if (activeL2Id !== null) {
        activeL2Id = null;
        renderDynamicZones();
        return;
      }
      if (activeL1Id !== null) {
        activeL1Id = null;
        renderDynamicZones();
        return;
      }
      if (activeL0 !== null) {
        activeL0 = null;
        renderDynamicZones();
        return;
      }
      this.close();
      onClose?.();
    };

    const initialTotals = countTaxonomyNodes(tree);

    backdrop.innerHTML = `
      <div class="ws-velvet-sheet ws-briefing-sheet">
        <header class="ws-sheet-header">
          <button type="button" class="ws-sheet-nav-btn" id="ws-cat-back-btn">
            ← Back
          </button>
          <h2 class="ws-sheet-title" id="ws-briefing-title">Briefing Room</h2>
          <button type="button" class="ws-sheet-icon-btn" id="ws-cat-close-btn" aria-label="Close">
            ✕
          </button>
        </header>

        <div class="ws-briefing-subhead">
          <nav class="ws-sheet-breadcrumbs" id="ws-briefing-breadcrumbs" aria-label="Category trail"></nav>
          <div class="ws-briefing-search-wrap">
            <svg class="ws-briefing-search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.8" />
              <path d="M13.6 13.6L17.5 17.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <input
              type="search"
              id="ws-briefing-search"
              class="ws-sheet-search"
              autocomplete="off"
              spellcheck="false"
              placeholder="Search ${initialTotals.l2Count} topics, e.g. Baseball..."
              value="${escapeHtml(searchQuery)}"
            />
            <button
              type="button"
              class="ws-briefing-search-clear"
              id="ws-briefing-search-clear"
              aria-label="Clear search"
              style="display:${searchQuery ? 'inline-flex' : 'none'};"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="ws-briefing-scroll" id="ws-briefing-results"></div>

        <footer class="ws-sheet-footer" id="ws-briefing-footer"></footer>
      </div>
    `;

    const titleEl = backdrop.querySelector<HTMLElement>('#ws-briefing-title')!;
    const breadcrumbsEl = backdrop.querySelector<HTMLElement>('#ws-briefing-breadcrumbs')!;
    const resultsEl = backdrop.querySelector<HTMLElement>('#ws-briefing-results')!;
    const footerEl = backdrop.querySelector<HTMLElement>('#ws-briefing-footer')!;
    const searchInput = backdrop.querySelector<HTMLInputElement>('#ws-briefing-search')!;
    const searchClearBtn = backdrop.querySelector<HTMLButtonElement>('#ws-briefing-search-clear')!;
    const backBtn = backdrop.querySelector<HTMLButtonElement>('#ws-cat-back-btn')!;
    const closeBtn = backdrop.querySelector<HTMLButtonElement>('#ws-cat-close-btn')!;

    const renderDynamicZones = () => {
      const totals = countTaxonomyNodes(tree);
      const playableTotal = Math.max(1000129, counts.totalPlayableCount, totals.totalVerified);
      searchInput.placeholder = `Search ${totals.l2Count} topics, e.g. Baseball...`;
      searchClearBtn.style.display = searchQuery.length > 0 ? 'inline-flex' : 'none';

      const domNode =
        activeL0 !== null ? tree.find((d) => d.domainId === activeL0) ?? null : null;
      const l1Node =
        domNode && activeL1Id
          ? domNode.subcategories.find((c) => c.id === activeL1Id) ?? null
          : null;
      const l2Node =
        l1Node && activeL2Id
          ? l1Node.topics.find((t) => t.id === activeL2Id) ?? null
          : null;

      const qTrim = searchQuery.trim();

      // Dynamic centered header title
      if (qTrim.length > 0) {
        titleEl.textContent = 'Search Topics';
      } else if (l1Node) {
        titleEl.textContent = stripYearCommas(l1Node.name);
      } else if (domNode) {
        titleEl.textContent = stripYearCommas(domNode.name);
      } else {
        titleEl.textContent = 'Briefing Room';
      }

      // 1. Minimal frameless breadcrumb text trail
      const crumbs: string[] = [];
      crumbs.push(`
        <button
          type="button"
          id="ws-cat-global-mix"
          data-ws-allow-compact="1"
          class="ws-briefing-crumb ${!domNode && !qTrim ? 'is-current' : ''}"
          data-crumb="ROOT"
        >All Domains</button>
      `);
      if (domNode) {
        crumbs.push(`<span class="ws-briefing-crumb-sep" aria-hidden="true">›</span>`);
        crumbs.push(`
          <button
            type="button"
            data-ws-allow-compact="1"
            class="ws-briefing-crumb ${!l1Node && !qTrim ? 'is-current' : ''}"
            data-crumb="L0"
          >${escapeHtml(stripYearCommas(domNode.name))}</button>
        `);
      }
      if (domNode && l1Node) {
        crumbs.push(`<span class="ws-briefing-crumb-sep" aria-hidden="true">›</span>`);
        crumbs.push(`
          <button
            type="button"
            data-ws-allow-compact="1"
            class="ws-briefing-crumb ${!l2Node && !qTrim ? 'is-current' : ''}"
            data-crumb="L1"
          >${escapeHtml(stripYearCommas(l1Node.name))}</button>
        `);
      }
      if (domNode && l1Node && l2Node) {
        crumbs.push(`<span class="ws-briefing-crumb-sep" aria-hidden="true">›</span>`);
        crumbs.push(`
          <span class="ws-briefing-crumb is-current">${escapeHtml(stripYearCommas(l2Node.name))}</span>
        `);
      }
      breadcrumbsEl.innerHTML = crumbs.join('');

      breadcrumbsEl.querySelector('[data-crumb="ROOT"]')?.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        activeL0 = null;
        activeL1Id = null;
        activeL2Id = null;
        searchQuery = '';
        searchInput.value = '';
        renderDynamicZones();
      });
      breadcrumbsEl.querySelector('[data-crumb="L0"]')?.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        activeL1Id = null;
        activeL2Id = null;
        searchQuery = '';
        searchInput.value = '';
        renderDynamicZones();
      });
      breadcrumbsEl.querySelector('[data-crumb="L1"]')?.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        activeL2Id = null;
        searchQuery = '';
        searchInput.value = '';
        renderDynamicZones();
      });

      // 2. Results List / Flush Hairline Grid
      if (qTrim.length > 0) {
        const hits = searchTaxonomyTree(tree, qTrim);
        if (hits.length === 0) {
          resultsEl.innerHTML = `
            <div class="ws-briefing-empty">
              No specialist topics matched “<strong style="color:var(--ivory-primary);">${escapeHtml(qTrim)}</strong>”.
              <div class="ws-briefing-empty-chips">
                ${['Baseball', 'World War II', 'Exoplanets', 'Chess', 'Oscars']
                  .map(
                    (term) => `
                  <button type="button" class="ws-briefing-suggest-btn" data-suggest-q="${escapeHtml(term)}">
                    ${escapeHtml(term)}
                  </button>
                `,
                  )
                  .join('')}
              </div>
            </div>
          `;
          resultsEl.querySelectorAll<HTMLButtonElement>('[data-suggest-q]').forEach((btn) => {
            btn.addEventListener('click', () => {
              this.haptics.uiTap();
              this.audio.playSfx('ui_tap');
              searchQuery = btn.dataset.suggestQ || '';
              searchInput.value = searchQuery;
              renderDynamicZones();
            });
          });
        } else {
          resultsEl.innerHTML = `
            <div class="ws-briefing-section-label">
              ${hits.length} Matching ${hits.length === 1 ? 'Topic' : 'Topics'}
            </div>
            <div class="ws-sheet-list">
              ${hits
                .map((h) => {
                  const isPicked =
                    activeL0 === h.domainId &&
                    activeL1Id === h.l1Id &&
                    (h.kind === 'L2' ? activeL2Id === h.l2Id : activeL2Id === null);
                  const title = stripYearCommas(h.l2Name ?? h.l1Name);
                  const crumb = stripYearCommas(h.breadcrumb);
                  return `
                    <button
                      type="button"
                      class="ws-sheet-row ${isPicked ? 'is-selected' : ''}"
                      data-hit-dom="${h.domainId}"
                      data-hit-l1="${escapeHtml(h.l1Id)}"
                      data-hit-l2="${escapeHtml(h.l2Id ?? '')}"
                    >
                      <img class="ws-briefing-row-icon" src="${escapeHtml(h.medallionUrl)}" alt="" />
                      <div class="ws-briefing-row-copy">
                        <div class="ws-briefing-row-title">${escapeHtml(title)}</div>
                        <div class="ws-briefing-row-sub">${escapeHtml(crumb)}</div>
                      </div>
                      <div class="ws-briefing-row-meta">
                        <span class="ws-briefing-row-count">${formatQuestionCount(h.verifiedCount)} Qs</span>
                        <span class="ws-briefing-row-chevron" aria-hidden="true">›</span>
                      </div>
                    </button>
                  `;
                })
                .join('')}
            </div>
          `;

          resultsEl.querySelectorAll<HTMLButtonElement>('[data-hit-dom]').forEach((btn) => {
            btn.addEventListener('click', () => {
              this.haptics.sightlineSnap();
              this.audio.playSfx('sightline_snap');
              activeL0 = Number(btn.dataset.hitDom) as DomainId;
              activeL1Id = btn.dataset.hitL1 || null;
              activeL2Id = btn.dataset.hitL2 || null;
              searchQuery = '';
              searchInput.value = '';
              renderDynamicZones();
            });
          });
        }
      } else if (!domNode) {
        // L0: 12 Sovereign Domains
        resultsEl.innerHTML = `
          <div class="ws-briefing-section-label">
            ${totals.l0Count} Domains · ${totals.l2Count} Topics · ${formatQuestionCount(playableTotal)} Playable Qs
          </div>
          <div class="ws-sheet-list">
            ${tree
              .map((d) => {
                const subPreview = d.subcategories
                  .slice(0, 3)
                  .map((s) => stripYearCommas(s.name))
                  .join(' · ');
                return `
                  <button type="button" class="ws-sheet-row" data-pick-l0="${d.domainId}">
                    <img class="ws-briefing-row-icon" src="${escapeHtml(d.medallionUrl)}" alt="" />
                    <div class="ws-briefing-row-copy">
                      <div class="ws-briefing-row-title">${escapeHtml(stripYearCommas(d.name))}</div>
                      <div class="ws-briefing-row-sub">${escapeHtml(subPreview)}</div>
                    </div>
                    <div class="ws-briefing-row-meta">
                      <span class="ws-briefing-row-count">${formatQuestionCount(d.verifiedCount)} Qs</span>
                      <span class="ws-briefing-row-chevron" aria-hidden="true">›</span>
                    </div>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;

        resultsEl.querySelectorAll<HTMLButtonElement>('[data-pick-l0]').forEach((btn) => {
          btn.addEventListener('click', () => {
            this.haptics.uiTap();
            this.audio.playSfx('ui_tap');
            activeL0 = Number(btn.dataset.pickL0) as DomainId;
            activeL1Id = null;
            activeL2Id = null;
            resultsEl.scrollTop = 0;
            renderDynamicZones();
          });
        });
      } else if (!l1Node) {
        // L1: Categories inside selected L0 Domain (e.g. Sports & Games -> Sports)
        resultsEl.innerHTML = `
          <div class="ws-briefing-section-label">
            ${escapeHtml(stripYearCommas(domNode.name))} · ${domNode.subcategories.length} Categories · ${formatQuestionCount(domNode.verifiedCount)} Qs
          </div>
          <div class="ws-sheet-list">
            ${domNode.subcategories
              .map((c1) => {
                const leafPreview = c1.topics
                  .slice(0, 4)
                  .map((t) => stripYearCommas(t.name))
                  .join(' · ');
                return `
                  <button type="button" class="ws-sheet-row" data-pick-l1="${escapeHtml(c1.id)}">
                    <img class="ws-briefing-row-icon" src="${escapeHtml(domNode.medallionUrl)}" alt="" />
                    <div class="ws-briefing-row-copy">
                      <div class="ws-briefing-row-title">${escapeHtml(stripYearCommas(c1.name))}</div>
                      <div class="ws-briefing-row-sub">${escapeHtml(leafPreview)}</div>
                    </div>
                    <div class="ws-briefing-row-meta">
                      <span class="ws-briefing-row-count">${formatQuestionCount(c1.verifiedCount)} Qs</span>
                      <span class="ws-briefing-row-chevron" aria-hidden="true">›</span>
                    </div>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;

        resultsEl.querySelectorAll<HTMLButtonElement>('[data-pick-l1]').forEach((btn) => {
          btn.addEventListener('click', () => {
            this.haptics.uiTap();
            this.audio.playSfx('ui_tap');
            activeL1Id = btn.dataset.pickL1 || null;
            activeL2Id = null;
            resultsEl.scrollTop = 0;
            renderDynamicZones();
          });
        });
      } else {
        // L2: Specialist Topics inside selected L1 Category (e.g. Sports -> Baseball 34,283 Qs)
        resultsEl.innerHTML = `
          <div class="ws-briefing-section-label">
            ${escapeHtml(stripYearCommas(l1Node.name))} · ${l1Node.topics.length} Specialist Topics
          </div>
          <div class="ws-sheet-list">
            <button
              type="button"
              class="ws-sheet-row ${activeL2Id === null ? 'is-selected' : ''}"
              id="ws-all-l1-topics"
            >
              <span class="ws-briefing-row-all-glyph" aria-hidden="true">✦</span>
              <div class="ws-briefing-row-copy">
                <div class="ws-briefing-row-title">All ${escapeHtml(stripYearCommas(l1Node.name))}</div>
                <div class="ws-briefing-row-sub">Full category mix across ${l1Node.topics.length} topics</div>
              </div>
              <div class="ws-briefing-row-meta">
                <span class="ws-briefing-row-count">${formatQuestionCount(l1Node.verifiedCount)} Qs</span>
                <span class="ws-briefing-row-check" aria-hidden="true">${activeL2Id === null ? '✓' : ''}</span>
              </div>
            </button>
            ${l1Node.topics
              .map((t2) => {
                const isSelected = activeL2Id === t2.id;
                const kwSub = t2.keywords?.length
                  ? t2.keywords.slice(0, 4).map(stripYearCommas).join(' · ')
                  : `${stripYearCommas(domNode.shortName)} › ${stripYearCommas(l1Node.name)}`;
                return `
                  <button
                    type="button"
                    class="ws-sheet-row ${isSelected ? 'is-selected' : ''}"
                    data-pick-l2="${escapeHtml(t2.id)}"
                  >
                    <img class="ws-briefing-row-icon" src="${escapeHtml(domNode.medallionUrl)}" alt="" />
                    <div class="ws-briefing-row-copy">
                      <div class="ws-briefing-row-title">${escapeHtml(stripYearCommas(t2.name))}</div>
                      <div class="ws-briefing-row-sub">${escapeHtml(kwSub)}</div>
                    </div>
                    <div class="ws-briefing-row-meta">
                      <span class="ws-briefing-row-count">${formatQuestionCount(t2.verifiedCount)} Qs</span>
                      <span class="ws-briefing-row-check" aria-hidden="true">${isSelected ? '✓' : ''}</span>
                    </div>
                  </button>
                `;
              })
              .join('')}
          </div>
        `;

        resultsEl.querySelector('#ws-all-l1-topics')?.addEventListener('click', () => {
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          activeL2Id = null;
          renderDynamicZones();
        });

        resultsEl.querySelectorAll<HTMLButtonElement>('[data-pick-l2]').forEach((btn) => {
          btn.addEventListener('click', () => {
            this.haptics.sightlineSnap();
            this.audio.playSfx('sightline_snap');
            const picked = btn.dataset.pickL2 || null;
            activeL2Id = activeL2Id === picked ? null : picked;
            renderDynamicZones();
          });
        });
      }

      // 3. Pinned Bottom Launch Bar
      const sel = getCurrentSelection();
      const lengthOptions: Array<{ val: BriefingRoundCount; label: string }> = [
        { val: 5, label: '5' },
        { val: 10, label: '10' },
        { val: 20, label: '20' },
        { val: 50, label: '50 Qs' },
      ];
      const diffOptions: Array<{ val: BriefingDifficultyPreset; label: string }> = [
        { val: 'ADAPTIVE', label: 'Auto' },
        { val: 'MIDDLE_SCHOOL', label: 'Mid School' },
        { val: 'HIGH_SCHOOL', label: 'High School' },
        { val: 'COLLEGE', label: 'College' },
        { val: 'GRADUATE', label: 'Graduate' },
        { val: 'MENSA', label: 'Mensa' },
      ];
      const normalizedDiff = normalizeBriefingDifficultyPreset(difficulty);
      const activeTier = presetToAcademicTier(normalizedDiff);
      const tierSpec = activeTier ? getAcademicTierSpec(activeTier) : null;
      const multStr = tierSpec
        ? tierSpec.scoreMultiplier.toFixed(
            Math.abs(tierSpec.scoreMultiplier * 10 - Math.round(tierSpec.scoreMultiplier * 10)) < 1e-6
              ? 1
              : 2,
          )
        : '';
      const diffIndicatorHtml = tierSpec
        ? `<span><strong>${escapeHtml(tierSpec.label)}</strong> · ${escapeHtml(tierSpec.subtitle)} (${multStr}x)</span><span>${tierSpec.timerSec}s</span>`
        : `<span><strong>Auto Adaptive</strong> · Scales Live to Your Meridian Elo</span><span>18s</span>`;

      footerEl.innerHTML = `
        <div class="ws-briefing-footer-top">
          <div class="ws-briefing-target-line">
            <span class="ws-briefing-target-name">${escapeHtml(stripYearCommas(sel.selectionLabel))}</span>
            <span class="ws-briefing-target-qs">${formatQuestionCount(sel.poolCount)} Qs</span>
          </div>
          <div class="ws-briefing-diff-strip" role="group" aria-label="Academic difficulty tier">
            ${diffOptions
              .map(
                (d) => `
              <button
                type="button"
                data-ws-allow-compact="1"
                class="ws-briefing-diff-btn ${normalizedDiff === d.val ? 'is-active' : ''}"
                data-diff="${d.val}"
                aria-pressed="${normalizedDiff === d.val ? 'true' : 'false'}"
              >${d.label}</button>
            `,
              )
              .join('')}
          </div>
          <div class="ws-briefing-diff-indicator" id="ws-briefing-diff-indicator">
            ${diffIndicatorHtml}
          </div>
        </div>

        <div class="ws-briefing-footer-main">
          <div class="ws-segmented-group" role="group" aria-label="Round length">
            ${lengthOptions
              .map(
                (opt) => `
              <button
                type="button"
                class="ws-segmented-btn ${roundCount === opt.val ? 'is-active' : ''}"
                data-len="${opt.val}"
              >${opt.label}</button>
            `,
              )
              .join('')}
          </div>

          <button type="button" class="ws-briefing-launch-cta" id="ws-cat-launch">
            START BRIEFING ▶
          </button>
        </div>
      `;

      footerEl.querySelectorAll<HTMLButtonElement>('[data-diff]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          difficulty = normalizeBriefingDifficultyPreset(btn.dataset.diff);
          savePreferredDifficulty(difficulty);
          renderDynamicZones();
        });
      });

      footerEl.querySelectorAll<HTMLButtonElement>('[data-len]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          roundCount = Number(btn.dataset.len) as BriefingRoundCount;
          renderDynamicZones();
        });
      });

      footerEl.querySelector('#ws-cat-launch')?.addEventListener('click', () => {
        this.haptics.sightlineSnap();
        this.audio.playSfx('sightline_snap');
        const { poolCount: _ignoredPoolCount, ...launchSpec } = getCurrentSelection();
        this.close();
        onLaunch(launchSpec);
      });
    };

    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      renderDynamicZones();
    });

    searchClearBtn.addEventListener('click', () => {
      this.haptics.uiTap();
      searchQuery = '';
      searchInput.value = '';
      searchInput.focus();
      renderDynamicZones();
    });

    searchInput.addEventListener('keydown', (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Escape') {
        ev.preventDefault();
        if (searchInput.value) {
          searchInput.value = '';
          searchQuery = '';
          renderDynamicZones();
        } else {
          this.close();
          onClose?.();
        }
      }
    });

    backBtn.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      stepBackOrClose();
    });

    closeBtn.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      this.close();
      onClose?.();
    });

    renderDynamicZones();

    // Hydrate external `./data/shards/taxonomy_tree.json` only if ForgeEngine does not already provide getTaxonomyTree()
    const hasNativeForgeTree =
      typeof (opts?.forgeInstance as { getTaxonomyTree?: () => unknown } | undefined)
        ?.getTaxonomyTree === 'function';
    if (!hasNativeForgeTree) {
      void prefetchExternalTaxonomyJson().then((loaded) => {
        if (loaded && this.modalEl === backdrop) {
          tree = buildNormalizedTaxonomyTree(counts, opts?.forgeInstance);
          renderDynamicZones();
        }
      });
    }

    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) {
        this.close();
        onClose?.();
      }
    });

    this.boundKeyDown = (ev: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (ev.key === 'Escape') {
        ev.preventDefault();
        stepBackOrClose();
      }
    };
    window.addEventListener('keydown', this.boundKeyDown);
    document.body.appendChild(backdrop);
    this.modalEl = backdrop;
  }

  public close(): void {
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
      this.boundKeyDown = null;
    }
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}
