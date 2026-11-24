// ============================================================================
// WORLD'S SMARTEST v5.0 — 5-Slot Contestant Dossier Folio (`CampaignSaveSlotsModal.ts`)
//  • Carved Mahogany, Brushed Brass Filigree & Deep Emerald Baize Dossier Sheet
//  • Sticky >= 44px brass rail (`Back` · Contestant Dossiers · Fullscreen · `Close`)
//  • 5 independent Campaign Save Folios with 2-col Phone Landscape spread
//  • Comfortable >= 44px brass latches: Load/New, Export, Import, Reset, Delete
//  • Zero OS color emojis · Zero backdrop-filter · Zero year commas
// ============================================================================

import '../styles/brass_modals_v5.css';
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

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const BRASS_SAVES_ICONS = {
  back: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
  close: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  fullscreen: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
  dossier: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z"/><path d="M8 12h8"/><path d="M8 16h5"/></svg>',
  play: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>',
  download: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/></svg>',
  upload: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M4 20h16"/></svg>',
  reset: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
  alert: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
} as const;

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

function toggleSavesFullscreenSafe(btn: HTMLButtonElement): void {
  if (typeof document === 'undefined') return;
  try {
    if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch(() => {});
      btn.setAttribute('aria-pressed', 'false');
      btn.classList.remove('is-active-emerald');
    } else {
      void document.documentElement.requestFullscreen?.().catch(() => {});
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('is-active-emerald');
    }
  } catch {
    // Fullscreen unavailable in restricted context
  }
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
    this.statusBanner = null;
    this.pendingConfirm = null;

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-modal-backdrop ws-save-modal ws-velvet-backdrop ws-brass-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Contestant Dossier Save Slots');

    const render = () => {
      const prevScroll = backdrop.querySelector<HTMLElement>('.ws-saves-scroll')?.scrollTop ?? 0;
      const slots = actions.getSlots();
      const isFsActive = typeof document !== 'undefined' && Boolean(document.fullscreenElement);

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
                        ? `Permanently delete Slot 0${s.slotId} contestant dossier?`
                        : `Reset Slot 0${s.slotId} back to Episode 1?`
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
                  ? `<div class="ws-save-empty-note">Unassigned contestant ledger — launch a fresh World Tour run or import a portable <code>.ws-save.json</code> dossier.</div>`
                  : `
                    <div class="ws-save-progress-track" aria-hidden="true">
                      <div class="ws-save-progress-fill" style="width:${pct}%;"></div>
                    </div>
                    <div class="ws-save-slot-stats">
                      <span><strong class="is-gold">${escapeHtml(cleanActOrCity)}</strong></span>
                      <span>Tiers <strong class="is-emerald">${s.visasCleared}/8</strong></span>
                      <span>Stars <strong class="is-cyan">${s.relicsUnlocked}</strong></span>
                      <span><strong>${escapeHtml(cleanCompletion)}</strong></span>
                      ${cleanRemaining ? `<span><strong class="is-gold">${escapeHtml(cleanRemaining)}</strong></span>` : ''}
                      <span>Acc <strong>${s.accuracyPct}%</strong></span>
                      ${
                        (s.failedAttemptsCount ?? 0) > 0
                          ? `<span class="is-alert"><span class="ws-brass-ico" aria-hidden="true">${BRASS_SAVES_ICONS.alert}</span>${s.failedAttemptsCount} Retryable</span>`
                          : ''
                      }
                    </div>
                  `
              }

              <div class="ws-save-actions">
                <button type="button" class="ws-save-cta-primary" data-slot-load="${s.slotId}">
                  <span class="ws-brass-ico" aria-hidden="true">${BRASS_SAVES_ICONS.play}</span>
                  <span>${s.isEmpty ? 'Start New' : s.isActive ? 'Continue' : 'Load Slot'}</span>
                </button>
                <button type="button" class="ws-save-action-btn" data-slot-export="${s.slotId}" ${s.isEmpty ? 'disabled' : ''}>
                  <span class="ws-brass-ico" aria-hidden="true">${BRASS_SAVES_ICONS.download}</span>
                  <span>Export</span>
                </button>
                <button type="button" class="ws-save-action-btn" data-slot-import="${s.slotId}">
                  <span class="ws-brass-ico" aria-hidden="true">${BRASS_SAVES_ICONS.upload}</span>
                  <span>Import</span>
                </button>
                ${
                  !s.isEmpty
                    ? `
                      <button type="button" class="ws-save-action-btn is-warn" data-slot-reset="${s.slotId}">
                        <span class="ws-brass-ico" aria-hidden="true">${BRASS_SAVES_ICONS.reset}</span>
                        <span>Reset</span>
                      </button>
                      <button type="button" class="ws-save-action-btn is-danger" data-slot-delete="${s.slotId}">
                        <span class="ws-brass-ico" aria-hidden="true">${BRASS_SAVES_ICONS.trash}</span>
                        <span>Delete</span>
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
        <div class="ws-velvet-sheet ws-saves-sheet ws-brass-ledger">
          <header class="ws-sheet-header">
            <div class="ws-meta-topbar-left">
              <button type="button" class="ws-sheet-nav-btn" id="ws-saves-close" aria-label="Back">
                <span class="ws-brass-ico" aria-hidden="true">${BRASS_SAVES_ICONS.back}</span>
                <span class="ws-brass-back-lbl">Back</span>
              </button>
              <div class="ws-meta-topbar-titles">
                <h2 class="ws-sheet-title">
                  <span class="ws-brass-ico ws-brass-title-ico" aria-hidden="true">${BRASS_SAVES_ICONS.dossier}</span>
                  <span>CONTESTANT DOSSIERS</span>
                </h2>
                <div class="ws-meta-eyebrow">5 Independent Campaign Save Folios</div>
              </div>
            </div>
            <div class="ws-meta-topbar-right">
              <button
                type="button"
                class="ws-brass-clasp-btn is-icon-only ${isFsActive ? 'is-active-emerald' : ''}"
                data-v5-fullscreen-toggle="true"
                aria-pressed="${isFsActive}"
                aria-label="Toggle Fullscreen"
                title="Toggle Fullscreen"
              >
                <span class="ws-brass-ico" aria-hidden="true">${BRASS_SAVES_ICONS.fullscreen}</span>
              </button>
              <button type="button" class="ws-sheet-icon-btn" id="ws-saves-close-x" aria-label="Close">
                <span class="ws-brass-ico" aria-hidden="true">${BRASS_SAVES_ICONS.close}</span>
              </button>
            </div>
          </header>

          <div class="ws-saves-subhead">
            Maintain up to 5 independent contestant dossiers — switch anytime or exchange portable <code>.ws-save.json</code> backups.
          </div>

          <input type="file" id="ws-saves-file-input" hidden accept=".json,.ws-save.json,application/json" style="display:none;" />

          <div class="ws-saves-scroll">
            ${
              this.statusBanner
                ? `
                  <div class="ws-saves-banner ${this.statusBanner.isError ? 'is-error' : ''}">
                    <span class="ws-brass-ico" aria-hidden="true">${this.statusBanner.isError ? BRASS_SAVES_ICONS.alert : BRASS_SAVES_ICONS.check}</span>
                    <span>${escapeHtml(stripYearCommas(this.statusBanner.text))}</span>
                  </div>
                `
                : ''
            }
            <div class="ws-brass-slots-grid">
              ${rowsHtml}
            </div>
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
                ? `Imported save file into Slot 0${pendingImportSlot} successfully.`
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

      backdrop.querySelectorAll<HTMLButtonElement>('[data-v5-fullscreen-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          toggleSavesFullscreenSafe(btn);
        });
      });

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
            text: `Exported Slot 0${slotId} backup (.ws-save.json).`,
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
              text: `Deleted Slot 0${slotId} contestant dossier.`,
              isError: false,
            };
          } else {
            actions.onResetSlotToStart(slotId);
            this.statusBanner = {
              text: `Reset Slot 0${slotId} to start.`,
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
