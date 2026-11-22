// ============================================================================
// WORLD'S SMARTEST — Interactive 12-Clue Conspiracy Evidence Sheet (2026 Mobile-First)
//  • Sleek full-height dark-velvet frameless sheet (zero NinePatch / zero nested boxes)
//  • Sticky 48px header (`← Back` · Meridian Dossier · `✕`) + Escape support
//  • Frameless 6-Suspect horizontal portrait rail (tap to filter/highlight threads)
//  • Seamless underline tabs: `12 Clues` (mobile-first hairline list) & `Thread Web`
//    (interactive SVG crimson/gold Bezier conspiracy graph)
//  • Pinned frameless Clue Inspector with connected-thread jump links + zero year commas
// ============================================================================

import { resolvePortraitCutoutUrl } from './CutscenePlayer';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';

export interface DossierSuspectItem {
  id: string;
  name: string;
  role: string;
  status_hint: string;
  bondLabel?: string;
}

export interface DossierClueItem {
  id: string;
  number: number;
  title: string;
  city_id: string;
  city_label: string;
  unlock_mission: string;
  suspect_id: string;
  category: string;
  summary: string;
  red_thread_to: string[];
  board_pos: [number, number];
  unlocked: boolean;
}

export interface DossierBoardViewModel {
  challengerName: string;
  boardTitle: string;
  boardSubtitle: string;
  suspects: DossierSuspectItem[];
  clues: DossierClueItem[];
  act3Branch?: string | null;
}

const DOSSIER_SHEET_STYLE_ID = 'ws-sleek-dossier-sheet-css';

function escapeHtml(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Strips stray commas inside 4-digit historical/calendar years (`2,019` -> `2019`, `1,984` -> `1984`).
 */
function stripYearCommas(text: string): string {
  const raw = String(text ?? '');
  if (!raw.includes(',')) return raw;
  return raw
    .replace(
      /\b(in|circa|c\.|from|until|since|year|dated|trial|season|series|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+([12]),(\d{3})\b/gi,
      '$1 $2$3',
    )
    .replace(/\b([12]),(\d{3})(\s*(?:CE|BCE|AD|BC))\b/gi, '$1$2$3')
    .replace(/\(([b.\s]*)([12]),(\d{3})\)/gi, '($1$2$3)')
    .replace(/\b([12]),(\d{3})s\b/g, '$1$2s')
    .replace(/\b([12]),(\d{3})\s*([–—-])\s*([12]),(\d{3})\b/g, '$1$2$3$4$5')
    .replace(/(?<![\d,.])([12]),(\d{3})(?![\d,])(?!\s*(?:qs?|questions?|pts?|points?|km|mi|m|ft)\b)/gi, '$1$2');
}

function padClueNum(n: number): string {
  return String(n).padStart(2, '0');
}

function ensureDossierSheetStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(DOSSIER_SHEET_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = DOSSIER_SHEET_STYLE_ID;
  style.textContent = `
    .ws-velvet-backdrop.ws-dossier-modal {
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

    .ws-velvet-sheet.ws-dossier-sheet {
      position: relative;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      max-height: 100dvh;
      background:
        radial-gradient(ellipse 90% 34% at 50% 0%, rgba(224, 82, 99, 0.08) 0%, rgba(216, 175, 87, 0.04) 40%, rgba(7, 10, 18, 0) 75%),
        #070a12;
      border: none !important;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
    }

    .ws-velvet-sheet.ws-dossier-sheet::before {
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
      .ws-velvet-backdrop.ws-dossier-modal {
        align-items: center;
        padding: 20px;
      }
      .ws-velvet-sheet.ws-dossier-sheet {
        max-width: 960px;
        height: min(90dvh, 860px);
        max-height: min(90dvh, 860px);
        border-radius: 18px;
        box-shadow:
          0 32px 84px rgba(0, 0, 0, 0.84),
          0 0 0 1px rgba(242, 207, 126, 0.14);
      }
    }

    .ws-dossier-sheet .ws-sheet-header {
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

    .ws-dossier-sheet .ws-sheet-nav-btn {
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
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-dossier-sheet .ws-sheet-nav-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffebb8;
    }

    .ws-dossier-sheet .ws-sheet-title {
      margin: 0;
      text-align: center;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: clamp(13px, 1.5vw, 16px);
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-dossier-sheet .ws-sheet-icon-btn {
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

    .ws-dossier-sheet .ws-sheet-icon-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-dossier-meta-bar {
      flex-shrink: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 4px 12px;
      padding: 0 16px;
      background: rgba(7, 10, 18, 0.94);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .ws-dossier-meta-copy {
      padding: 8px 0;
      font-size: 12px;
      color: rgba(246, 242, 233, 0.58);
      font-variant-numeric: tabular-nums;
    }

    .ws-dossier-meta-copy strong {
      color: var(--ivory-primary, #f6f2e9);
      font-weight: 600;
    }

    .ws-dossier-meta-copy .is-gold {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-meta-copy .is-cyan {
      color: var(--cyan-clue, #56d4f5);
    }

    .ws-dossier-tabs {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .ws-dossier-tab {
      min-height: 44px;
      min-width: 44px;
      padding: 0 12px;
      border: none;
      background: transparent;
      color: rgba(246, 242, 233, 0.66);
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: 0.03em;
      white-space: nowrap;
      transition: color 0.14s ease;
    }

    .ws-dossier-tab:hover {
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-dossier-tab.is-active {
      color: var(--gold-bright, #f2cf7e);
      box-shadow: inset 0 -2px 0 var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-suspects-rail {
      flex-shrink: 0;
      display: flex;
      align-items: stretch;
      gap: 2px;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 6px 12px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(9, 13, 22, 0.85);
      scrollbar-width: none;
    }

    .ws-dossier-suspects-rail::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: 820px) {
      .ws-dossier-suspects-rail {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 4px;
      }
    }

    .ws-dossier-suspect-btn {
      flex: 0 0 auto;
      min-width: 140px;
      min-height: 48px;
      padding: 6px 9px;
      border: none;
      border-radius: 10px;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 9px;
      text-align: left;
      transition: background 0.14s ease;
    }

    @media (min-width: 820px) {
      .ws-dossier-suspect-btn {
        min-width: 0;
      }
    }

    .ws-dossier-suspect-btn:hover {
      background: rgba(255, 255, 255, 0.045);
    }

    .ws-dossier-suspect-btn.is-active {
      background: rgba(242, 207, 126, 0.12);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      object-position: top center;
      flex-shrink: 0;
      border: none;
      background: rgba(216, 175, 87, 0.12);
      box-shadow: 0 0 0 1.5px rgba(242, 207, 126, 0.34);
    }

    .ws-dossier-suspect-btn.is-active .ws-dossier-avatar {
      box-shadow: 0 0 0 2px var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-suspect-copy {
      min-width: 0;
      flex: 1 1 auto;
    }

    .ws-dossier-suspect-name {
      font-size: 12px;
      font-weight: 700;
      line-height: 1.2;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-dossier-suspect-btn.is-active .ws-dossier-suspect-name {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-suspect-role {
      font-size: 10.5px;
      line-height: 1.25;
      color: rgba(246, 242, 233, 0.64);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 1px;
    }

    .ws-dossier-filter-banner {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 6px 16px;
      background: rgba(242, 207, 126, 0.06);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      font-size: 12px;
      color: rgba(246, 242, 233, 0.78);
    }

    .ws-dossier-clear-filter {
      min-height: 44px;
      min-width: 44px;
      padding: 0 12px;
      border: none;
      border-radius: 7px;
      background: rgba(255, 255, 255, 0.08);
      color: var(--gold-bright, #f2cf7e);
      font-size: 11.5px;
      font-weight: 600;
      white-space: nowrap;
    }

    .ws-dossier-workspace {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: none;
    }

    .ws-dossier-main-pane {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      border: none;
    }

    .ws-dossier-sheet .ws-sheet-list {
      display: flex;
      flex-direction: column;
      border: none;
    }

    @media (min-width: 720px) {
      .ws-dossier-sheet .ws-sheet-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ws-dossier-sheet .ws-sheet-row:nth-child(even) {
        box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.05);
      }
      .ws-dossier-sheet .ws-sheet-row.is-selected:nth-child(even) {
        box-shadow:
          inset 3px 0 0 var(--gold-bright, #f2cf7e),
          inset 1px 0 0 rgba(255, 255, 255, 0.05);
      }
    }

    .ws-dossier-sheet .ws-sheet-row {
      width: 100%;
      min-height: 58px;
      padding: 11px 16px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 0;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 12px;
      text-align: left;
      transition: background 0.14s ease;
    }

    .ws-dossier-sheet .ws-sheet-row:hover {
      background: rgba(255, 255, 255, 0.036);
    }

    .ws-dossier-sheet .ws-sheet-row.is-selected {
      background: linear-gradient(90deg, rgba(242, 207, 126, 0.11) 0%, rgba(242, 207, 126, 0.02) 100%);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-sheet .ws-sheet-row.is-locked .ws-dossier-row-title {
      color: rgba(246, 242, 233, 0.68);
    }

    .ws-dossier-clue-num {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 12px;
      font-weight: 700;
      color: var(--gold-bright, #f2cf7e);
      font-variant-numeric: tabular-nums;
      width: 24px;
      flex-shrink: 0;
    }

    .ws-dossier-sheet .ws-sheet-row.is-locked .ws-dossier-clue-num {
      color: rgba(246, 242, 233, 0.62);
    }

    .ws-dossier-row-copy {
      min-width: 0;
      flex: 1 1 auto;
    }

    .ws-dossier-row-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.25;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-dossier-sheet .ws-sheet-row.is-selected .ws-dossier-row-title {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-row-sub {
      margin-top: 2px;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      color: rgba(246, 242, 233, 0.64);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-dossier-row-status {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: rgba(246, 242, 233, 0.62);
    }

    .ws-dossier-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--gold-bright, #f2cf7e);
      box-shadow: 0 0 8px rgba(242, 207, 126, 0.65);
    }

    /* Frameless Interactive Conspiracy Thread Web */
    .ws-dossier-web-scroll {
      width: 100%;
      height: 100%;
      min-height: 320px;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      background: radial-gradient(circle at 50% 48%, rgba(28, 35, 54, 0.52) 0%, rgba(7, 10, 18, 0.98) 78%);
      border: none;
    }

    .ws-dossier-web-canvas {
      position: relative;
      width: 100%;
      min-width: 660px;
      height: 100%;
      min-height: 330px;
      border: none;
    }

    .ws-dossier-web-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .ws-dossier-node {
      position: absolute;
      transform: translate(-50%, -50%);
      min-height: 44px;
      min-width: 96px;
      max-width: 164px;
      padding: 6px 10px;
      border: none !important;
      border-radius: 10px;
      background: rgba(11, 16, 28, 0.94);
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.65),
        0 0 0 1px rgba(242, 207, 126, 0.28);
      color: var(--ivory-primary, #f6f2e9);
      font-size: 11px;
      font-weight: 600;
      line-height: 1.22;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 7px;
      transition: transform 0.14s ease, box-shadow 0.14s ease, opacity 0.14s ease;
    }

    .ws-dossier-node:hover {
      transform: translate(-50%, -50%) scale(1.04);
      box-shadow:
        0 10px 24px rgba(0, 0, 0, 0.72),
        0 0 0 1.5px rgba(242, 207, 126, 0.72);
      z-index: 4;
    }

    .ws-dossier-node.is-selected {
      transform: translate(-50%, -50%) scale(1.06);
      background: rgba(34, 27, 14, 0.96);
      box-shadow:
        0 10px 26px rgba(0, 0, 0, 0.75),
        0 0 0 1.5px var(--gold-bright, #f2cf7e),
        0 0 18px rgba(242, 207, 126, 0.25);
      color: var(--gold-bright, #f2cf7e);
      z-index: 6;
    }

    .ws-dossier-node.is-locked {
      background: rgba(10, 14, 23, 0.90);
      box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.52),
        0 0 0 1px rgba(255, 255, 255, 0.14);
      color: rgba(246, 242, 233, 0.64);
    }

    .ws-dossier-node.is-dimmed {
      opacity: 0.34;
    }

    .ws-dossier-node-num {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      font-weight: 800;
      color: var(--gold-bright, #f2cf7e);
      flex-shrink: 0;
    }

    .ws-dossier-node.is-locked .ws-dossier-node-num {
      color: rgba(246, 242, 233, 0.62);
    }

    .ws-dossier-node-label {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Frameless Clue Inspector */
    .ws-dossier-inspector {
      flex-shrink: 0;
      max-height: 35dvh;
      overflow-y: auto;
      padding: 12px 16px max(12px, env(safe-area-inset-bottom, 0px));
      background: rgba(8, 11, 20, 0.98);
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.09);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .ws-dossier-inspector-top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 6px 12px;
    }

    .ws-dossier-inspector-kicker {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.07em;
      color: var(--cyan-clue, #56d4f5);
      text-transform: uppercase;
    }

    .ws-dossier-inspector-suspect {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      color: rgba(246, 242, 233, 0.72);
    }

    .ws-dossier-inspector-suspect img {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      object-fit: cover;
      object-position: top center;
      border: none;
    }

    .ws-dossier-inspector-title {
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: 15px;
      font-weight: 700;
      color: var(--gold-bright, #f2cf7e);
      line-height: 1.25;
    }

    .ws-dossier-inspector-summary {
      margin: 0;
      font-size: 13px;
      line-height: 1.45;
      color: rgba(246, 242, 233, 0.88);
    }

    .ws-dossier-links-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }

    .ws-dossier-links-label {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      letter-spacing: 0.06em;
      color: rgba(246, 242, 233, 0.62);
      text-transform: uppercase;
    }

    .ws-dossier-link-chip {
      min-height: 44px;
      min-width: 44px;
      padding: 0 12px;
      border: none !important;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--ivory-primary, #f6f2e9);
      font-size: 11.5px;
      font-weight: 600;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-dossier-link-chip:hover {
      background: rgba(242, 207, 126, 0.16);
      color: var(--gold-bright, #f2cf7e);
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-dossier-sheet .ws-sheet-header {
        min-height: 44px;
      }
      .ws-dossier-suspects-rail {
        display: none;
      }
      .ws-dossier-workspace {
        display: grid;
        grid-template-columns: 1.25fr 1fr;
      }
      .ws-dossier-inspector {
        max-height: none;
        height: 100%;
        border-top: none;
        box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.08);
      }
    }
  `;
  document.head.appendChild(style);
}

export class EvidenceDossierModal {
  private audio: StudioAudioEngine;
  private haptics: HapticsEngine;
  private modalEl: HTMLElement | null = null;
  private boundKeyDown: ((ev: KeyboardEvent) => void) | null = null;

  constructor(audio: StudioAudioEngine, haptics: HapticsEngine) {
    this.audio = audio;
    this.haptics = haptics;
  }

  public isOpen(): boolean {
    return this.modalEl !== null;
  }

  public open(vm: DossierBoardViewModel, onClose?: () => void): void {
    this.close();
    ensureDossierSheetStyles();

    // Ensure all 6 core cast members appear in the suspect rail
    const knownSuspects = new Map<string, DossierSuspectItem>();
    for (const s of vm.suspects) {
      knownSuspects.set(s.id, s);
    }
    const fullSixDefaults: DossierSuspectItem[] = [
      {
        id: 'vance',
        name: 'Julian Vance',
        role: 'Chief Adjudicator',
        status_hint: 'Handpicked your 99.4% anomaly file—architect or secret ally?',
      },
      {
        id: 'nadia',
        name: 'Nadia Al-Mansoor',
        role: 'Acoustic Prodigy',
        status_hint: 'Searching the Meridian vaults for her vanished brother, Tariq.',
      },
      {
        id: 'soren',
        name: "Soren 'Echo' Kael",
        role: 'Horizon Wildcard',
        status_hint: 'Sub-vocal telemetry earpiece caught in Tokyo.',
      },
      {
        id: 'teo',
        name: "Mateo 'Teo' Rojas",
        role: 'Rogue Producer',
        status_hint: 'Runs the pirate Black Salon feed behind Studio Control.',
      },
      {
        id: 'lindqvist',
        name: 'Chancellor Lindqvist',
        role: 'Sovereign Chair',
        status_hint: 'Guards the sealed Trial 00 — 2019 diplomatic drawers.',
      },
      {
        id: 'tariq',
        name: 'Tariq Al-Mansoor',
        role: '2019 Trial Zero Winner',
        status_hint: 'Erased after uncovering faction weaponization of The Ledger.',
      },
    ];
    for (const d of fullSixDefaults) {
      if (!knownSuspects.has(d.id)) {
        knownSuspects.set(d.id, d);
      }
    }
    const suspectList = Array.from(knownSuspects.values());
    const clueById = new Map(vm.clues.map((c) => [c.id, c]));

    let selectedClue: DossierClueItem | null =
      vm.clues.find((c) => c.unlocked) ?? vm.clues[0] ?? null;
    let activeSuspectFilter: string | null = null;
    let activeView: 'LIST' | 'WEB' =
      typeof window !== 'undefined' && window.innerWidth >= 720 ? 'WEB' : 'LIST';

    const unlockedCount = vm.clues.filter((c) => c.unlocked).length;

    // Build reverse adjacency map so connected-thread jump links are bidirectional
    const connectedByClue = new Map<string, Set<string>>();
    for (const c of vm.clues) {
      if (!connectedByClue.has(c.id)) connectedByClue.set(c.id, new Set());
      for (const tId of c.red_thread_to ?? []) {
        if (!clueById.has(tId)) continue;
        connectedByClue.get(c.id)!.add(tId);
        if (!connectedByClue.has(tId)) connectedByClue.set(tId, new Set());
        connectedByClue.get(tId)!.add(c.id);
      }
    }

    const buildSvgPaths = (): string => {
      const svgPaths: string[] = [];
      const drawnPairs = new Set<string>();

      for (const clue of vm.clues) {
        const [x1N, y1N] = clue.board_pos ?? [0.2, 0.3];
        const x1 = Math.round(Math.max(0.11, Math.min(0.89, x1N)) * 1000);
        const y1 = Math.round(Math.max(0.14, Math.min(0.86, y1N)) * 420);

        for (const targetId of clue.red_thread_to ?? []) {
          const target = clueById.get(targetId);
          if (!target) continue;
          const pairKey =
            clue.id < target.id ? `${clue.id}::${target.id}` : `${target.id}::${clue.id}`;
          if (drawnPairs.has(pairKey)) continue;
          drawnPairs.add(pairKey);

          const [x2N, y2N] = target.board_pos ?? [0.7, 0.6];
          const x2 = Math.round(Math.max(0.11, Math.min(0.89, x2N)) * 1000);
          const y2 = Math.round(Math.max(0.14, Math.min(0.86, y2N)) * 420);
          const mx = Math.round((x1 + x2) * 0.5);
          const my = Math.round((y1 + y2) * 0.5 + 24);

          const touchesSelected =
            selectedClue && (selectedClue.id === clue.id || selectedClue.id === target.id);
          const bothActive = clue.unlocked && target.unlocked;
          const stroke = bothActive
            ? '#f2cf7e'
            : touchesSelected
              ? 'rgba(242, 207, 126, 0.82)'
              : 'rgba(224, 82, 99, 0.52)';
          const width = touchesSelected ? 2.8 : bothActive ? 2.2 : 1.5;
          const dash = bothActive ? '' : 'stroke-dasharray="6 5"';

          svgPaths.push(
            `<path d="M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}" ${dash} />`,
          );
        }
      }
      return svgPaths.join('\n');
    };

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-modal-backdrop ws-dossier-modal ws-velvet-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Meridian Zero Conspiracy Evidence Board');

    const renderContent = () => {
      const prevScroll = backdrop.querySelector<HTMLElement>('.ws-dossier-main-pane')?.scrollTop ?? 0;
      const filteredSuspect = activeSuspectFilter
        ? knownSuspects.get(activeSuspectFilter) ?? null
        : null;
      const visibleClues = activeSuspectFilter
        ? vm.clues.filter((c) => c.suspect_id === activeSuspectFilter)
        : vm.clues;

      const selectedSuspectObj = selectedClue
        ? knownSuspects.get(selectedClue.suspect_id) ?? null
        : null;
      const linkedNeighborIds = selectedClue
        ? Array.from(connectedByClue.get(selectedClue.id) ?? [])
        : [];
      const linkedNeighbors = linkedNeighborIds
        .map((id) => clueById.get(id))
        .filter((c): c is DossierClueItem => Boolean(c));

      const mainViewHtml =
        activeView === 'LIST'
          ? `
            <div class="ws-sheet-list">
              ${visibleClues
                .map((c) => {
                  const isSel = selectedClue?.id === c.id;
                  const susp = knownSuspects.get(c.suspect_id);
                  const titleText = c.unlocked
                    ? stripYearCommas(c.title)
                    : `Classified · ${stripYearCommas(c.city_label)} Archive`;
                  const subText = `${stripYearCommas(c.city_label)} · ${stripYearCommas(c.category)} · ${stripYearCommas(susp?.name ?? c.suspect_id)}`;
                  return `
                    <button
                      type="button"
                      class="ws-sheet-row ${c.unlocked ? '' : 'is-locked'} ${isSel ? 'is-selected' : ''}"
                      data-clue-id="${escapeHtml(c.id)}"
                    >
                      <span class="ws-dossier-clue-num">${padClueNum(c.number)}</span>
                      <div class="ws-dossier-row-copy">
                        <div class="ws-dossier-row-title">${escapeHtml(titleText)}</div>
                        <div class="ws-dossier-row-sub">${escapeHtml(subText)}</div>
                      </div>
                      <div class="ws-dossier-row-status">
                        ${
                          c.unlocked
                            ? `<span class="ws-dossier-dot" aria-label="Decrypted"></span>`
                            : `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-label="Locked" style="flex-shrink:0;"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
                        }
                        <span aria-hidden="true" style="font-size:17px;">›</span>
                      </div>
                    </button>
                  `;
                })
                .join('')}
            </div>
          `
          : `
            <div class="ws-dossier-web-scroll">
              <div class="ws-dossier-web-canvas">
                <svg class="ws-dossier-web-svg" viewBox="0 0 1000 420" preserveAspectRatio="none">
                  ${buildSvgPaths()}
                </svg>
                ${vm.clues
                  .map((c) => {
                    const [rawPx, rawPy] = c.board_pos ?? [0.5, 0.5];
                    const px = Math.max(0.11, Math.min(0.89, rawPx));
                    const py = Math.max(0.14, Math.min(0.86, rawPy));
                    const isSel = selectedClue?.id === c.id;
                    const isDimmed =
                      activeSuspectFilter !== null && c.suspect_id !== activeSuspectFilter;
                    const label = c.unlocked
                      ? stripYearCommas(c.title)
                      : `${stripYearCommas(c.city_label)} (Locked)`;
                    return `
                      <button
                        type="button"
                        class="ws-dossier-node ${c.unlocked ? '' : 'is-locked'} ${isSel ? 'is-selected' : ''} ${isDimmed ? 'is-dimmed' : ''}"
                        data-clue-id="${escapeHtml(c.id)}"
                        style="left:${(px * 100).toFixed(1)}%;top:${(py * 100).toFixed(1)}%;"
                      >
                        <span class="ws-dossier-node-num">${padClueNum(c.number)}</span>
                        <span class="ws-dossier-node-label">${escapeHtml(label)}</span>
                      </button>
                    `;
                  })
                  .join('')}
              </div>
            </div>
          `;

      const rawTitle = stripYearCommas(vm.boardTitle || '').trim();
      const headerTitle =
        rawTitle.length > 0 && rawTitle.length <= 20 ? rawTitle : 'CONSPIRACY DOSSIER';

      backdrop.innerHTML = `
        <div class="ws-velvet-sheet ws-dossier-sheet">
          <header class="ws-sheet-header">
            <button type="button" class="ws-sheet-nav-btn" id="ws-dossier-close">
              ← Back
            </button>
            <h2 class="ws-sheet-title">${escapeHtml(headerTitle)}</h2>
            <button type="button" class="ws-sheet-icon-btn" id="ws-dossier-close-x" aria-label="Close">
              ✕
            </button>
          </header>

          <div class="ws-dossier-meta-bar">
            <div class="ws-dossier-meta-copy">
              <strong>${escapeHtml(stripYearCommas(vm.challengerName))}</strong> ·
              <strong class="is-gold">${unlockedCount}/${vm.clues.length}</strong> Decrypted
              ${
                vm.act3Branch
                  ? ` · <strong class="is-cyan">${escapeHtml(stripYearCommas(vm.act3Branch))}</strong>`
                  : ''
              }
            </div>
            <div class="ws-dossier-tabs" role="tablist" aria-label="Dossier view">
              <button
                type="button"
                role="tab"
                aria-selected="${activeView === 'LIST'}"
                class="ws-dossier-tab ${activeView === 'LIST' ? 'is-active' : ''}"
                data-dossier-view="LIST"
              >
                ${vm.clues.length} Clues
              </button>
              <button
                type="button"
                role="tab"
                aria-selected="${activeView === 'WEB'}"
                class="ws-dossier-tab ${activeView === 'WEB' ? 'is-active' : ''}"
                data-dossier-view="WEB"
              >
                Thread Web
              </button>
            </div>
          </div>

          <div class="ws-dossier-suspects-rail" aria-label="Suspect dossiers">
            ${suspectList
              .map((s) => {
                const isActive = activeSuspectFilter === s.id;
                return `
                  <button
                    type="button"
                    class="ws-dossier-suspect-btn ${isActive ? 'is-active' : ''}"
                    data-suspect-filter="${escapeHtml(s.id)}"
                  >
                    <img
                      class="ws-dossier-avatar"
                      src="${resolvePortraitCutoutUrl(s.id)}"
                      alt="${escapeHtml(stripYearCommas(s.name))}"
                    />
                    <div class="ws-dossier-suspect-copy">
                      <div class="ws-dossier-suspect-name">${escapeHtml(stripYearCommas(s.name))}</div>
                      <div class="ws-dossier-suspect-role">${escapeHtml(stripYearCommas(s.bondLabel || s.role))}</div>
                    </div>
                  </button>
                `;
              })
              .join('')}
          </div>

          ${
            filteredSuspect
              ? `
                <div class="ws-dossier-filter-banner">
                  <span>
                    <strong style="color:var(--gold-bright);">${escapeHtml(stripYearCommas(filteredSuspect.name))}:</strong>
                    ${escapeHtml(stripYearCommas(filteredSuspect.status_hint))}
                  </span>
                  <button type="button" data-ws-allow-compact="1" class="ws-dossier-clear-filter" id="ws-dossier-clear-filter">
                    Show All ${vm.clues.length}
                  </button>
                </div>
              `
              : ''
          }

          <div class="ws-dossier-workspace">
            <div class="ws-dossier-main-pane">
              ${mainViewHtml}
            </div>

            ${
              selectedClue
                ? `
                  <section class="ws-dossier-inspector" aria-label="Selected clue details">
                    <div class="ws-dossier-inspector-top">
                      <span class="ws-dossier-inspector-kicker">
                        Clue #${padClueNum(selectedClue.number)} · ${escapeHtml(stripYearCommas(selectedClue.city_label))} · ${escapeHtml(stripYearCommas(selectedClue.category))}
                      </span>
                      <span class="ws-dossier-inspector-suspect">
                        <img src="${resolvePortraitCutoutUrl(selectedClue.suspect_id)}" alt="" />
                        <span>${escapeHtml(stripYearCommas(selectedSuspectObj?.name ?? selectedClue.suspect_id))}</span>
                      </span>
                    </div>
                    <div class="ws-dossier-inspector-title">
                      ${escapeHtml(
                        selectedClue.unlocked
                          ? stripYearCommas(selectedClue.title)
                          : 'Classified Meridian Archive Entry',
                      )}
                    </div>
                    <p class="ws-dossier-inspector-summary">
                      ${escapeHtml(
                        selectedClue.unlocked
                          ? stripYearCommas(selectedClue.summary)
                          : `Complete mission ${selectedClue.unlock_mission.toUpperCase()} in ${stripYearCommas(selectedClue.city_label)} to decrypt this physical evidence and illuminate its conspiracy links.`,
                      )}
                    </p>
                    ${
                      linkedNeighbors.length > 0
                        ? `
                          <div class="ws-dossier-links-row">
                            <span class="ws-dossier-links-label">Threads:</span>
                            ${linkedNeighbors
                              .map(
                                (n) => `
                              <button
                                type="button"
                                data-ws-allow-compact="1"
                                class="ws-dossier-link-chip"
                                data-jump-clue="${escapeHtml(n.id)}"
                              >
                                → #${padClueNum(n.number)} ${escapeHtml(
                                  n.unlocked ? stripYearCommas(n.title) : stripYearCommas(n.city_label),
                                )}
                              </button>
                            `,
                              )
                              .join('')}
                          </div>
                        `
                        : ''
                    }
                  </section>
                `
                : ''
            }
          </div>
        </div>
      `;

      const mainPane = backdrop.querySelector<HTMLElement>('.ws-dossier-main-pane');
      if (mainPane && prevScroll > 0) {
        mainPane.scrollTop = prevScroll;
      }

      const handleClose = () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.close();
        onClose?.();
      };
      backdrop.querySelector('#ws-dossier-close')?.addEventListener('click', handleClose);
      backdrop.querySelector('#ws-dossier-close-x')?.addEventListener('click', handleClose);

      backdrop.querySelectorAll<HTMLButtonElement>('[data-dossier-view]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const next = btn.dataset.dossierView as 'LIST' | 'WEB';
          if (next === activeView) return;
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          activeView = next;
          renderContent();
        });
      });

      backdrop.querySelectorAll<HTMLButtonElement>('[data-suspect-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const sid = btn.dataset.suspectFilter || null;
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          activeSuspectFilter = activeSuspectFilter === sid ? null : sid;
          if (activeSuspectFilter) {
            const firstMatch = vm.clues.find((c) => c.suspect_id === activeSuspectFilter);
            if (firstMatch) selectedClue = firstMatch;
          }
          renderContent();
        });
      });

      backdrop.querySelector('#ws-dossier-clear-filter')?.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        activeSuspectFilter = null;
        renderContent();
      });

      backdrop.querySelectorAll<HTMLButtonElement>('[data-clue-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cid = btn.dataset.clueId;
          const found = vm.clues.find((item) => item.id === cid);
          if (found) {
            this.haptics.uiTap();
            this.audio.playSfx('ui_tap');
            selectedClue = found;
            renderContent();
          }
        });
      });

      backdrop.querySelectorAll<HTMLButtonElement>('[data-jump-clue]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cid = btn.dataset.jumpClue;
          const found = vm.clues.find((item) => item.id === cid);
          if (found) {
            this.haptics.uiTap();
            this.audio.playSfx('ui_tap');
            selectedClue = found;
            if (activeSuspectFilter && found.suspect_id !== activeSuspectFilter) {
              activeSuspectFilter = null;
            }
            renderContent();
          }
        });
      });
    };

    renderContent();
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close();
        onClose?.();
      }
    });
    this.boundKeyDown = (ev: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (ev.key === 'Escape') {
        ev.preventDefault();
        this.close();
        onClose?.();
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
