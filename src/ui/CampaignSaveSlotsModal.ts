// ============================================================================
// WORLD'S SMARTEST — 5-Slot Campaign Save Dossier Sheet (2026 Mobile-First)
//  • Sleek full-height dark-velvet frameless sheet (zero nested bordered boxes)
//  • Sticky 48px header (`← Back` · Campaign Saves · `✕`) + Escape support
//  • 5 independent Campaign Save Slots separated by `1px` hairline dividers
//  • Comfortable >= 44px touch actions: Load/New, Export, Import, Reset, Delete
//  • Zero commas inside 4-digit years across timestamps & dossier telemetry
// ============================================================================

import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';

export type CampaignSlotId = 1 | 2 | 3 | 4 | 5;

export interface CampaignSlotCardView {
  slotId: CampaignSlotId;
  isEmpty: boolean;
  isActive: boolean;
  challengerName: string;
  personaLabel: string;
  currentActOrCity: string;
  visasCleared: number;
  relicsUnlocked: number;
  missionsCompleted: number;
  totalMissions?: number;
  completionPct?: number;
  completionLabel?: string;
  estimatedRemainingLabel?: string;
  failedAttemptsCount?: number;
  accuracyPct: number;
  updatedAtLabel: string;
}

export interface CampaignSaveSlotsModalActions {
  getSlots: () => CampaignSlotCardView[];
  onSwitchOrStartSlot: (slotId: CampaignSlotId) => void;
  onExportSlot: (slotId: CampaignSlotId) => void;
  onImportSlotJson: (
    slotId: CampaignSlotId,
    rawJson: string,
  ) => { ok: boolean; message?: string };
  onResetSlotToStart: (slotId: CampaignSlotId) => void;
  onDeleteSlot: (slotId: CampaignSlotId) => void;
  onClose?: () => void;
}

const SAVES_SHEET_STYLE_ID = 'ws-sleek-saves-sheet-css';
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function escapeHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Strips stray commas inside 4-digit calendar/historical years (`2,026` -> `2026`, `1,984` -> `1984`).
 */
function stripYearCommas(raw: string): string {
  const str = String(raw ?? '');
  if (!str.includes(',')) return str;
  return str
    .replace(
      /\b(in|circa|c\.|from|until|since|year|dated|trial|season|series|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+([12]),(\d{3})\b/gi,
      '$1 $2$3',
    )
    .replace(/\b([12]),(\d{3})(\s*(?:CE|BCE|AD|BC))\b/gi, '$1$2$3')
    .replace(/\(([b.\s]*)([12]),(\d{3})\)/gi, '($1$2$3)')
    .replace(/(\d{1,2}[/-]\d{1,2}[/-])([12]),(\d{3})\b/g, '$1$2$3')
    .replace(/(?<![\d,.])([12]),(\d{3})(?![\d,])(?!\s*(?:qs?|questions?|pts?|points?|missions?|hrs?|hours?)\b)/gi, '$1$2');
}

/**
 * Formats save slot timestamps crisply for mobile with guaranteed zero commas inside 4-digit years.
 */
function formatCleanSaveTimestamp(rawLabel: string): string {
  const cleaned = stripYearCommas(rawLabel).trim();
  if (!cleaned || cleaned.toUpperCase() === 'EMPTY') return 'Unassigned';

  const looksLikeTimestamp =
    /\d{4}/.test(cleaned) && (/[/:T-]/.test(cleaned) || /[A-Za-z]{3}/.test(cleaned));
  if (looksLikeTimestamp) {
    const parsed = new Date(cleaned);
    if (!Number.isNaN(parsed.getTime())) {
      const month = SHORT_MONTHS[parsed.getMonth()] ?? 'Jan';
      const day = parsed.getDate();
      const year = String(parsed.getFullYear()); // Plain 4-digit year, never comma-grouped
      const hh = String(parsed.getHours()).padStart(2, '0');
      const mm = String(parsed.getMinutes()).padStart(2, '0');
      return `${month} ${day} ${year} · ${hh}:${mm}`;
    }
  }
  return cleaned;
}

function ensureSavesSheetStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(SAVES_SHEET_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SAVES_SHEET_STYLE_ID;
  style.textContent = `
    .ws-velvet-backdrop.ws-save-modal {
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

    .ws-velvet-sheet.ws-saves-sheet {
      position: relative;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      max-height: 100dvh;
      background:
        radial-gradient(ellipse 90% 34% at 50% 0%, rgba(216, 175, 87, 0.08) 0%, rgba(7, 10, 18, 0) 70%),
        #070a12;
      border: none !important;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
    }

    .ws-velvet-sheet.ws-saves-sheet::before {
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
      .ws-velvet-backdrop.ws-save-modal {
        align-items: center;
        padding: 20px;
      }
      .ws-velvet-sheet.ws-saves-sheet {
        max-width: 780px;
        height: min(88dvh, 840px);
        max-height: min(88dvh, 840px);
        border-radius: 18px;
        box-shadow:
          0 32px 84px rgba(0, 0, 0, 0.84),
          0 0 0 1px rgba(242, 207, 126, 0.14);
      }
    }

    .ws-saves-sheet .ws-sheet-header {
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

    .ws-saves-sheet .ws-sheet-nav-btn {
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

    .ws-saves-sheet .ws-sheet-nav-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffebb8;
    }

    .ws-saves-sheet .ws-sheet-title {
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

    .ws-saves-sheet .ws-sheet-icon-btn {
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

    .ws-saves-sheet .ws-sheet-icon-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-saves-subhead {
      flex-shrink: 0;
      padding: 9px 16px;
      font-size: 12px;
      line-height: 1.35;
      color: rgba(246, 242, 233, 0.68);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(7, 10, 18, 0.92);
    }

    .ws-saves-subhead code {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      color: rgba(242, 207, 126, 0.85);
    }

    .ws-saves-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      padding-bottom: max(16px, env(safe-area-inset-bottom, 0px));
      border: none;
    }

    .ws-saves-banner {
      padding: 11px 16px;
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.35;
      border: none;
      background: rgba(57, 212, 154, 0.1);
      color: #9ff5d1;
      box-shadow: inset 3px 0 0 var(--emerald-win, #39d49a);
    }

    .ws-saves-banner.is-error {
      background: rgba(224, 82, 99, 0.13);
      color: #ffb4be;
      box-shadow: inset 3px 0 0 var(--crimson-alert, #e05263);
    }

    .ws-save-slot-row {
      padding: 15px 16px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: transparent;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: background 0.14s ease;
    }

    .ws-save-slot-row.is-active {
      background: linear-gradient(90deg, rgba(242, 207, 126, 0.095) 0%, rgba(242, 207, 126, 0.015) 100%);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-save-slot-top {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 6px 12px;
    }

    .ws-save-slot-identity {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .ws-save-slot-num {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 2px 7px;
      border-radius: 5px;
      border: none;
      background: rgba(255, 255, 255, 0.07);
      color: rgba(246, 242, 233, 0.72);
      font-variant-numeric: tabular-nums;
    }

    .ws-save-slot-row.is-active .ws-save-slot-num {
      background: rgba(242, 207, 126, 0.22);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-save-slot-name {
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: 15.5px;
      font-weight: 700;
      color: var(--ivory-primary, #f6f2e9);
      letter-spacing: 0.02em;
    }

    .ws-save-slot-row.is-empty .ws-save-slot-name {
      font-family: var(--font-sans, 'Inter', sans-serif);
      font-weight: 500;
      color: rgba(246, 242, 233, 0.68);
    }

    .ws-save-slot-persona {
      font-size: 12px;
      color: var(--cyan-clue, #56d4f5);
      font-weight: 500;
    }

    .ws-save-slot-time {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      color: rgba(246, 242, 233, 0.66);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .ws-save-progress-track {
      width: 100%;
      height: 2px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    .ws-save-progress-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #b5842c 0%, #f2cf7e 100%);
    }

    .ws-save-slot-stats {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 12px;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11.5px;
      line-height: 1.4;
      color: rgba(246, 242, 233, 0.68);
      font-variant-numeric: tabular-nums;
    }

    .ws-save-slot-stats strong {
      color: var(--ivory-primary, #f6f2e9);
      font-weight: 600;
    }

    .ws-save-slot-stats .is-gold {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-save-slot-stats .is-emerald {
      color: var(--emerald-win, #39d49a);
    }

    .ws-save-slot-stats .is-cyan {
      color: var(--cyan-clue, #56d4f5);
    }

    .ws-save-slot-stats .is-alert {
      color: #ff8e9b;
      font-weight: 700;
    }

    .ws-save-empty-note {
      font-size: 12.5px;
      line-height: 1.4;
      color: rgba(246, 242, 233, 0.66);
    }

    .ws-save-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 7px;
      margin-top: 2px;
    }

    .ws-save-cta-primary {
      min-height: 44px;
      min-width: 116px;
      padding: 0 16px;
      border: none !important;
      border-radius: 10px;
      background: linear-gradient(180deg, #fae29c 0%, #d8ab4e 56%, #b5842c 100%);
      color: #0e121a;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: filter 0.14s ease, transform 0.12s ease;
    }

    .ws-save-cta-primary:hover {
      filter: brightness(1.06);
    }

    .ws-save-cta-primary:active {
      transform: scale(0.99);
    }

    .ws-save-action-btn {
      min-height: 44px;
      min-width: 44px;
      padding: 0 13px;
      border: none !important;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--ivory-primary, #f6f2e9);
      font-size: 12.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-save-action-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.11);
    }

    .ws-save-action-btn:disabled {
      opacity: 0.34;
      cursor: not-allowed;
    }

    .ws-save-action-btn.is-warn {
      background: rgba(240, 157, 70, 0.1);
      color: var(--amber-warn, #f09d46);
    }

    .ws-save-action-btn.is-warn:hover {
      background: rgba(240, 157, 70, 0.18);
    }

    .ws-save-action-btn.is-danger {
      background: rgba(224, 82, 99, 0.11);
      color: #ff8e9b;
    }

    .ws-save-action-btn.is-danger:hover {
      background: rgba(224, 82, 99, 0.2);
    }

    .ws-save-confirm-strip {
      margin-top: 2px;
      padding: 10px 12px;
      border: none;
      border-radius: 8px;
      background: rgba(224, 82, 99, 0.13);
      box-shadow: inset 3px 0 0 var(--crimson-alert, #e05263);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px 12px;
    }

    .ws-save-confirm-msg {
      font-size: 12.5px;
      font-weight: 600;
      color: #ffb4be;
      line-height: 1.35;
    }

    .ws-save-confirm-btns {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .ws-save-confirm-exec {
      min-height: 44px;
      padding: 0 14px;
      border: none !important;
      border-radius: 9px;
      background: linear-gradient(180deg, #ef6676 0%, #c23345 100%);
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-saves-sheet .ws-sheet-header {
        min-height: 44px;
      }
      .ws-saves-subhead {
        display: none;
      }
      .ws-save-slot-row {
        padding: 10px 14px;
        gap: 7px;
      }
    }
  `;
  document.head.appendChild(style);
}

export class CampaignSaveSlotsModal {
  private readonly audio: StudioAudioEngine;
  private readonly haptics: HapticsEngine;
  private modalEl: HTMLElement | null = null;
  private boundKeyDown: ((ev: KeyboardEvent) => void) | null = null;
  private statusBanner: { text: string; isError: boolean } | null = null;
  private pendingConfirm: {
    slotId: CampaignSlotId;
    kind: 'DELETE' | 'RESET';
  } | null = null;

  constructor(audio: StudioAudioEngine, haptics: HapticsEngine) {
    this.audio = audio;
    this.haptics = haptics;
  }

  public isOpen(): boolean {
    return this.modalEl !== null;
  }

  public open(actions: CampaignSaveSlotsModalActions): void {
    this.close();
    ensureSavesSheetStyles();
    this.statusBanner = null;
    this.pendingConfirm = null;

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-modal-backdrop ws-save-modal ws-velvet-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Campaign Save Slots Dossier');

    const render = () => {
      const prevScroll = backdrop.querySelector<HTMLElement>('.ws-saves-scroll')?.scrollTop ?? 0;
      const slots = actions.getSlots();

      const rowsHtml = slots
        .map((s) => {
          const totalMissions = s.totalMissions ?? 96;
          const pct =
            typeof s.completionPct === 'number'
              ? Math.max(0, Math.min(100, s.completionPct))
              : Math.round((s.missionsCompleted / Math.max(1, totalMissions)) * 100);
          const cleanName = stripYearCommas(s.challengerName);
          const cleanPersona = stripYearCommas(s.personaLabel);
          const cleanActOrCity = stripYearCommas(s.currentActOrCity);
          const cleanCompletion = stripYearCommas(
            s.completionLabel ?? `${s.missionsCompleted}/${totalMissions} Missions`,
          );
          const cleanRemaining = s.estimatedRemainingLabel
            ? stripYearCommas(s.estimatedRemainingLabel)
            : '';
          const cleanTime = formatCleanSaveTimestamp(s.updatedAtLabel);

          const confirmStrip =
            this.pendingConfirm && this.pendingConfirm.slotId === s.slotId
              ? `
                <div class="ws-save-confirm-strip">
                  <span class="ws-save-confirm-msg">
                    ${
                      this.pendingConfirm.kind === 'DELETE'
                        ? `Permanently delete Slot ${s.slotId} campaign dossier?`
                        : `Reset Slot ${s.slotId} back to Act 0 Geneva Start?`
                    }
                  </span>
                  <div class="ws-save-confirm-btns">
                    <button type="button" class="ws-save-action-btn" data-cancel-confirm="${s.slotId}">
                      Cancel
                    </button>
                    <button
                      type="button"
                      class="ws-save-confirm-exec"
                      data-exec-confirm="${s.slotId}"
                      data-confirm-kind="${this.pendingConfirm.kind}"
                    >
                      Confirm ${this.pendingConfirm.kind === 'DELETE' ? 'Delete' : 'Reset'}
                    </button>
                  </div>
                </div>
              `
              : '';

          return `
            <section class="ws-save-slot-row ${s.isActive ? 'is-active' : ''} ${s.isEmpty ? 'is-empty' : ''}">
              <div class="ws-save-slot-top">
                <div class="ws-save-slot-identity">
                  <span class="ws-save-slot-num">
                    SLOT 0${s.slotId}${s.isActive ? ' · ACTIVE' : ''}
                  </span>
                  <span class="ws-save-slot-name">
                    ${s.isEmpty ? 'Empty Dossier' : escapeHtml(cleanName)}
                  </span>
                  ${
                    !s.isEmpty
                      ? `<span class="ws-save-slot-persona">· ${escapeHtml(cleanPersona)}</span>`
                      : ''
                  }
                </div>
                <span class="ws-save-slot-time">${escapeHtml(cleanTime)}</span>
              </div>

              ${
                s.isEmpty
                  ? `<div class="ws-save-empty-note">Unassigned slot — launch a fresh Act 0 Geneva Vetting campaign or import a saved <code>.ws-save.json</code> file.</div>`
                  : `
                    <div class="ws-save-progress-track" aria-hidden="true">
                      <div class="ws-save-progress-fill" style="width:${pct}%;"></div>
                    </div>
                    <div class="ws-save-slot-stats">
                      <span><strong class="is-gold">${escapeHtml(cleanActOrCity)}</strong></span>
                      <span>Visas <strong class="is-emerald">${s.visasCleared}/8</strong></span>
                      <span>Relics <strong class="is-cyan">${s.relicsUnlocked}/8</strong></span>
                      <span><strong>${escapeHtml(cleanCompletion)}</strong></span>
                      ${cleanRemaining ? `<span><strong class="is-gold">${escapeHtml(cleanRemaining)}</strong></span>` : ''}
                      <span>Acc <strong>${s.accuracyPct}%</strong></span>
                      ${
                        (s.failedAttemptsCount ?? 0) > 0
                          ? `<span class="is-alert">⚠ ${s.failedAttemptsCount} Retryable</span>`
                          : ''
                      }
                    </div>
                  `
              }

              <div class="ws-save-actions">
                <button type="button" class="ws-save-cta-primary" data-slot-load="${s.slotId}">
                  ${s.isEmpty ? '▶ Start New' : s.isActive ? '▶ Continue' : '▶ Load Slot'}
                </button>
                <button type="button" class="ws-save-action-btn" data-slot-export="${s.slotId}" ${s.isEmpty ? 'disabled' : ''}>
                  ⬇ Export
                </button>
                <button type="button" class="ws-save-action-btn" data-slot-import="${s.slotId}">
                  ⬆ Import
                </button>
                ${
                  !s.isEmpty
                    ? `
                      <button type="button" class="ws-save-action-btn is-warn" data-slot-reset="${s.slotId}">
                        ↺ Reset
                      </button>
                      <button type="button" class="ws-save-action-btn is-danger" data-slot-delete="${s.slotId}">
                        ✕ Delete
                      </button>
                    `
                    : ''
                }
              </div>

              ${confirmStrip}
            </section>
          `;
        })
        .join('');

      backdrop.innerHTML = `
        <div class="ws-velvet-sheet ws-saves-sheet">
          <header class="ws-sheet-header">
            <button type="button" class="ws-sheet-nav-btn" id="ws-saves-close">
              ← Back
            </button>
            <h2 class="ws-sheet-title">Campaign Saves</h2>
            <button type="button" class="ws-sheet-icon-btn" id="ws-saves-close-x" aria-label="Close">
              ✕
            </button>
          </header>

          <div class="ws-saves-subhead">
            Maintain up to 5 independent dossiers — switch anytime or exchange portable <code>.ws-save.json</code> backups.
          </div>

          <input type="file" id="ws-saves-file-input" hidden accept=".json,.ws-save.json,application/json" style="display:none;" />

          <div class="ws-saves-scroll">
            ${
              this.statusBanner
                ? `
                  <div class="ws-saves-banner ${this.statusBanner.isError ? 'is-error' : ''}">
                    ${escapeHtml(stripYearCommas(this.statusBanner.text))}
                  </div>
                `
                : ''
            }
            ${rowsHtml}
          </div>
        </div>
      `;

      const scrollEl = backdrop.querySelector<HTMLElement>('.ws-saves-scroll');
      if (scrollEl && prevScroll > 0) {
        scrollEl.scrollTop = prevScroll;
      }

      const fileInput = backdrop.querySelector<HTMLInputElement>('#ws-saves-file-input');
      let pendingImportSlot: CampaignSlotId = 1;

      fileInput?.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const text = typeof reader.result === 'string' ? reader.result : '';
          const res = actions.onImportSlotJson(pendingImportSlot, text);
          this.statusBanner = {
            text:
              res.message ||
              (res.ok
                ? `✓ Imported save file into Slot ${pendingImportSlot} successfully.`
                : 'Invalid campaign save JSON file.'),
            isError: !res.ok,
          };
          if (res.ok) {
            this.haptics.passportStamp();
            this.audio.playSfx('passport_stamp');
          } else {
            this.haptics.wrongThud(false);
          }
          render();
        };
        reader.readAsText(file);
        fileInput.value = '';
      });

      const handleClose = () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.close();
        actions.onClose?.();
      };
      backdrop.querySelector('#ws-saves-close')?.addEventListener('click', handleClose);
      backdrop.querySelector('#ws-saves-close-x')?.addEventListener('click', handleClose);

      backdrop.querySelectorAll<HTMLButtonElement>('[data-slot-load]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const slotId = Number(btn.dataset.slotLoad) as CampaignSlotId;
          this.haptics.sightlineSnap();
          this.audio.playSfx('sightline_snap');
          this.close();
          actions.onSwitchOrStartSlot(slotId);
        });
      });

      backdrop.querySelectorAll<HTMLButtonElement>('[data-slot-export]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const slotId = Number(btn.dataset.slotExport) as CampaignSlotId;
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          actions.onExportSlot(slotId);
          this.statusBanner = {
            text: `⬇ Exported Slot ${slotId} backup (.ws-save.json).`,
            isError: false,
          };
          render();
        });
      });

      backdrop.querySelectorAll<HTMLButtonElement>('[data-slot-import]').forEach((btn) => {
        btn.addEventListener('click', () => {
          pendingImportSlot = Number(btn.dataset.slotImport) as CampaignSlotId;
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          fileInput?.click();
        });
      });

      backdrop.querySelectorAll<HTMLButtonElement>('[data-slot-reset]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const slotId = Number(btn.dataset.slotReset) as CampaignSlotId;
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          this.pendingConfirm = { slotId, kind: 'RESET' };
          render();
        });
      });

      backdrop.querySelectorAll<HTMLButtonElement>('[data-slot-delete]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const slotId = Number(btn.dataset.slotDelete) as CampaignSlotId;
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          this.pendingConfirm = { slotId, kind: 'DELETE' };
          render();
        });
      });

      backdrop.querySelectorAll<HTMLButtonElement>('[data-cancel-confirm]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.haptics.uiTap();
          this.pendingConfirm = null;
          render();
        });
      });

      backdrop.querySelectorAll<HTMLButtonElement>('[data-exec-confirm]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const slotId = Number(btn.dataset.execConfirm) as CampaignSlotId;
          const kind = btn.dataset.confirmKind as 'DELETE' | 'RESET';
          this.pendingConfirm = null;
          this.haptics.shatterPlate();
          this.audio.playSfx('glass_shatter');
          if (kind === 'DELETE') {
            actions.onDeleteSlot(slotId);
            this.statusBanner = {
              text: `🗑 Deleted Slot ${slotId}.`,
              isError: false,
            };
          } else {
            actions.onResetSlotToStart(slotId);
            this.statusBanner = {
              text: `↺ Reset Slot ${slotId} to Act 0 Geneva Start.`,
              isError: false,
            };
          }
          render();
        });
      });
    };

    render();
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) {
        this.close();
        actions.onClose?.();
      }
    });
    this.boundKeyDown = (ev: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (ev.key === 'Escape') {
        ev.preventDefault();
        this.close();
        actions.onClose?.();
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
