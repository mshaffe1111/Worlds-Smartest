// ============================================================================
// WORLD'S SMARTEST — Meridian Diplomatic Passport & 3D Trophy Observatory
// Features:
//  • Native editable HTML <input> Challenger Name (never calls player "YOU"!)
//  • Stamped Cognitive Persona Seal + Origin + Alignment Meters
//  • 8 Country Diplomatic Visas
//  • Live SVG 12-Domain Mastery Radar Polygon
//  • 3D Trophy & Country Relic Observatory Switcher (rotates championship_trophy.glb!)
// ============================================================================

import type { DomainSkillEntry, HeroRelicId } from '../forge/types';
import { FORGE_DOMAINS } from '../forge/types';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';

export interface PassportVisaEntry {
  code: string;
  city: string;
  cleared: boolean;
  stars: number;
}

export interface PassportBookmarkEntry {
  qid: number;
  prompt: string;
  answer: string;
  why: string;
}

export interface PassportObservatoryViewModel {
  challengerName: string;
  personaTitle: string;
  personaTagline: string;
  originTitle: string;
  globalElo: number;
  totalAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  integrity: number;
  publicTrust: number;
  councilFavor: number;
  visas: PassportVisaEntry[];
  domainSkills: DomainSkillEntry[];
  unlockedRelics: HeroRelicId[];
  activePerks: Array<{ id: string; name: string; desc: string }>;
  bookmarks: PassportBookmarkEntry[];
}

export interface PassportModalCallbacks {
  onRenameChallenger: (newName: string) => void;
  onInspect3DTrophy: (relicOrTrophy: 'championship_trophy' | HeroRelicId) => void;
  onClose: () => void;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildRadarSvg(skills: DomainSkillEntry[]): string {
  const cx = 185;
  const cy = 148;
  const maxR = 96;
  const rings = [0.25, 0.5, 0.75, 1.0];

  const ringPolys = rings
    .map((r) => {
      const pts: string[] = [];
      for (let i = 0; i < 12; i++) {
        const ang = (Math.PI * 2 * i) / 12 - Math.PI / 2;
        pts.push(`${(cx + Math.cos(ang) * maxR * r).toFixed(1)},${(cy + Math.sin(ang) * maxR * r).toFixed(1)}`);
      }
      return `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(216,175,87,0.22)" stroke-width="1" />`;
    })
    .join('');

  const spokes: string[] = [];
  const labels: string[] = [];
  const dataPts: string[] = [];
  const dots: string[] = [];

  for (let i = 0; i < 12; i++) {
    const ang = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    const cosA = Math.cos(ang);
    const sinA = Math.sin(ang);
    const ox = cx + cosA * maxR;
    const oy = cy + sinA * maxR;
    spokes.push(`<line x1="${cx}" y1="${cy}" x2="${ox.toFixed(1)}" y2="${oy.toFixed(1)}" stroke="rgba(216,175,87,0.18)" stroke-width="1" />`);

    const skill = skills[i];
    const pct = Math.max(18, Math.min(100, skill?.masteryPct ?? 50)) / 100;
    const vx = cx + cosA * maxR * pct;
    const vy = cy + sinA * maxR * pct;
    dataPts.push(`${vx.toFixed(1)},${vy.toFixed(1)}`);
    dots.push(`<circle cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" r="3.5" fill="#f2cf7e" stroke="#080b11" stroke-width="1.2" />`);

    const lx = cx + cosA * (maxR + 14);
    const ly = cy + sinA * (maxR + 15);
    const anchor = cosA < -0.25 ? 'end' : cosA > 0.25 ? 'start' : 'middle';
    const shortName = FORGE_DOMAINS[i]?.shortName ?? `D${i}`;
    labels.push(
      `<text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${anchor}" fill="#d8d2c5" font-size="9.5" font-family="Inter, sans-serif" font-weight="600">${escapeHtml(shortName)}</text>`,
    );
  }

  return `
    <svg viewBox="0 0 370 296" style="width:100%;max-width:340px;height:auto;display:block;margin:0 auto;">
      ${ringPolys}
      ${spokes.join('')}
      <polygon points="${dataPts.join(' ')}" fill="rgba(242, 207, 126, 0.26)" stroke="#f2cf7e" stroke-width="2.2" />
      ${dots.join('')}
      ${labels.join('')}
    </svg>
  `;
}

const RELIC_LABELS: Array<{ id: 'championship_trophy' | HeroRelicId; label: string; city: string }> = [
  { id: 'championship_trophy', label: 'Meridian Championship Trophy', city: 'World Arbiter Crown' },
  { id: 'meridian_astrolabe', label: 'Meridian Brass Astrolabe', city: 'Geneva' },
  { id: 'armillary_orrery', label: 'Locked Armillary Orrery', city: 'London' },
  { id: 'origami_prism', label: 'Folding Origami Prism', city: 'Tokyo' },
  { id: 'emerald_sphere', label: 'Emerald Resonance Sphere', city: 'Rio de Janeiro' },
  { id: 'cipher_box', label: 'Meridian Zero Cipher Box', city: 'Cairo' },
  { id: 'cryo_relay', label: 'Cryo-Core Relay', city: 'Reykjavik' },
  { id: 'council_seal', label: 'Fractured Council Seal', city: 'Singapore' },
  { id: 'master_ledger', label: 'Master Ledger Core', city: 'Apex Forum' },
];

export class PassportObservatoryModal {
  private audio: StudioAudioEngine;
  private haptics: HapticsEngine;
  private modalEl: HTMLElement | null = null;

  constructor(audio: StudioAudioEngine, haptics: HapticsEngine) {
    this.audio = audio;
    this.haptics = haptics;
  }

  public isOpen(): boolean {
    return this.modalEl !== null;
  }

  public open(vm: PassportObservatoryViewModel, callbacks: PassportModalCallbacks): void {
    this.close();

    let observatoryMode = false;
    let activeShowcase: 'championship_trophy' | HeroRelicId = 'championship_trophy';
    callbacks.onInspect3DTrophy('championship_trophy');

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-label', 'Meridian Diplomatic Passport and 3D Observatory');

    const render = () => {
      const uiRootEl = document.getElementById('ui-root');
      if (uiRootEl) {
        uiRootEl.style.visibility = observatoryMode ? 'hidden' : 'visible';
      }
      backdrop.className = observatoryMode
        ? 'ws-modal-backdrop is-observatory-peek'
        : 'ws-modal-backdrop';

      const accPct =
        vm.totalAnswered > 0 ? Math.round((vm.totalCorrect / vm.totalAnswered) * 100) : 0;

      backdrop.innerHTML = `
        <div class="ws-modal-panel ws-frame-cinema" style="${observatoryMode ? 'max-width:500px;margin:0;' : 'max-width:1020px;'}">
          <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
            <div>
              <div style="font-family:var(--font-display);font-size:clamp(15px,1.8vw,20px);font-weight:800;color:var(--gold-bright);letter-spacing:0.07em;">
                MERIDIAN DIPLOMATIC PASSPORT
              </div>
              <div style="font-size:11.5px;color:var(--ivory-muted);">
                Geneva Charter Credentials · 12-Domain Radar · 3D Trophy Observatory
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" class="ws-btn-obsidian" id="ws-toggle-observatory">
                ${observatoryMode ? '◀ FULL PASSPORT' : '🏆 3D TROPHY VIEW'}
              </button>
              <button type="button" class="ws-btn-obsidian" id="ws-passport-close">✕ CLOSE</button>
            </div>
          </div>

          <div class="ws-modal-scroll-body">
          <!-- Challenger Identity & Native Name Input -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;align-items:center;padding:12px;border-radius:11px;background:rgba(12,17,28,0.88);border:1px solid rgba(216,175,87,0.36);">
            <div>
              <label for="ws-passport-name-input" style="display:block;font-family:var(--font-mono);font-size:10.5px;color:var(--gold-bright);margin-bottom:5px;letter-spacing:0.06em;">
                REGISTERED CHALLENGER NAME (EDITABLE)
              </label>
              <div style="display:flex;gap:8px;align-items:center;">
                <input
                  id="ws-passport-name-input"
                  class="ws-name-input"
                  type="text"
                  maxlength="22"
                  autocomplete="off"
                  spellcheck="false"
                  placeholder="Enter your name, Challenger..."
                  value="${escapeHtml(vm.challengerName)}"
                />
                <button type="button" class="ws-btn-gold" id="ws-passport-save-name" style="padding:10px 14px;font-size:11.5px;">
                  STAMP
                </button>
              </div>
            </div>

            <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;">
              <div>
                <div style="font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);">STAMPED PERSONA</div>
                <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--gold-bright);">
                  ${escapeHtml(vm.personaTitle)}
                </div>
                <div style="font-size:11px;color:var(--cyan-clue);">${escapeHtml(vm.originTitle)}</div>
              </div>
              <div style="text-align:right;font-family:var(--font-mono);font-size:11.5px;">
                <div style="color:var(--gold-bright);font-weight:700;">ELO ${vm.globalElo}</div>
                <div style="color:var(--ivory-muted);">${vm.totalCorrect}/${vm.totalAnswered} (${accPct}%) · STREAK ${vm.bestStreak}</div>
              </div>
            </div>
          </div>

          ${
            !observatoryMode
              ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;align-items:start;">
              <!-- Left: SVG 12-Domain Mastery Radar -->
              <div style="padding:10px;border-radius:11px;background:rgba(10,14,23,0.88);border:1px solid rgba(216,175,87,0.28);">
                <div style="font-family:var(--font-display);font-size:12.5px;font-weight:700;color:var(--gold-bright);text-align:center;margin-bottom:4px;">
                  12-DOMAIN COGNITIVE RADAR
                </div>
                ${buildRadarSvg(vm.domainSkills)}
              </div>

              <!-- Right: 8 Diplomatic Visas + Alignment + Active Perks -->
              <div style="display:flex;flex-direction:column;gap:10px;">
                <div style="padding:10px 12px;border-radius:11px;background:rgba(10,14,23,0.88);border:1px solid rgba(216,175,87,0.28);">
                  <div style="font-family:var(--font-display);font-size:12.5px;font-weight:700;color:var(--gold-bright);margin-bottom:8px;">
                    DIPLOMATIC CIRCUIT VISAS (${vm.visas.filter((v) => v.cleared).length} / 8)
                  </div>
                  <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;">
                    ${vm.visas
                      .map(
                        (v) => `
                      <div style="padding:6px;border-radius:8px;text-align:center;background:${v.cleared ? 'rgba(57,212,154,0.14)' : 'rgba(18,24,38,0.75)'};border:1px solid ${v.cleared ? 'rgba(57,212,154,0.55)' : 'rgba(125,133,148,0.28)'};">
                        <div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${v.cleared ? 'var(--emerald-win)' : 'var(--ivory-dim)'};">${escapeHtml(v.code)}</div>
                        <div style="font-size:10px;color:var(--ivory-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(v.city)}</div>
                      </div>
                    `,
                      )
                      .join('')}
                  </div>
                </div>

                <div style="padding:10px 12px;border-radius:11px;background:rgba(10,14,23,0.88);border:1px solid rgba(216,175,87,0.28);font-family:var(--font-mono);font-size:11px;display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;">
                  <span>INTEGRITY: <strong style="color:var(--gold-bright);">${vm.integrity >= 0 ? `+${vm.integrity}` : vm.integrity}</strong></span>
                  <span>PUBLIC TRUST: <strong style="color:var(--cyan-clue);">${vm.publicTrust}%</strong></span>
                  <span>COUNCIL FAVOR: <strong style="color:var(--emerald-win);">${vm.councilFavor}%</strong></span>
                </div>

                <div style="padding:10px 12px;border-radius:11px;background:rgba(10,14,23,0.88);border:1px solid rgba(216,175,87,0.28);">
                  <div style="font-family:var(--font-display);font-size:12px;font-weight:700;color:var(--gold-bright);margin-bottom:6px;">
                    3D TROPHY & HERO RELIC OBSERVATORY
                  </div>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${RELIC_LABELS.map((item) => {
                      const unlocked =
                        item.id === 'championship_trophy' ||
                        vm.unlockedRelics.includes(item.id as HeroRelicId);
                      const isSel = activeShowcase === item.id;
                      return `
                        <button
                          type="button"
                          class="ws-util-pill ${isSel ? 'is-active' : ''} ${unlocked ? '' : 'is-muted'}"
                          data-showcase-id="${item.id}"
                        >
                          ${item.id === 'championship_trophy' ? '🏆' : unlocked ? '◆' : '🔒'} ${escapeHtml(item.city)}
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>
            </div>
          `
              : `
            <!-- Sleek Side-Dock Mode so rotating 3D championship_trophy.glb shines unobstructed! -->
            <div style="padding:12px;border-radius:11px;background:rgba(10,14,23,0.9);border:1px solid rgba(242,207,126,0.45);">
              <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--gold-bright);margin-bottom:6px;">
                LIVE 3D OBSERVATORY SHOWCASE
              </div>
              <p style="margin:0 0 10px;font-size:12.5px;color:var(--ivory-muted);line-height:1.4;">
                Drag on the open 3D stage to orbit and inspect the sculpted 24K Championship Trophy and your recovered Meridian Relics under studio HDRI reflections.
              </p>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${RELIC_LABELS.map((item) => {
                  const isSel = activeShowcase === item.id;
                  return `
                    <button
                      type="button"
                      class="ws-util-pill ${isSel ? 'is-active' : ''}"
                      data-showcase-id="${item.id}"
                    >
                      ${item.id === 'championship_trophy' ? '🏆 Crown Trophy' : escapeHtml(item.label)}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          `
          }
          </div>
        </div>
      `;

      const nameInput = backdrop.querySelector<HTMLInputElement>('#ws-passport-name-input');
      const commitName = () => {
        const cleaned = (nameInput?.value ?? '').trim().slice(0, 22);
        if (cleaned.length >= 1) {
          vm.challengerName = cleaned;
          this.haptics.passportStamp();
          this.audio.playSfx('passport_stamp');
          callbacks.onRenameChallenger(cleaned);
        }
      };

      backdrop.querySelector('#ws-passport-save-name')?.addEventListener('click', commitName);
      nameInput?.addEventListener('keydown', (ev) => {
        ev.stopPropagation();
        if (ev.key === 'Enter') {
          commitName();
          nameInput.blur();
        }
      });

      backdrop.querySelector('#ws-toggle-observatory')?.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        observatoryMode = !observatoryMode;
        callbacks.onInspect3DTrophy(activeShowcase);
        render();
      });

      backdrop.querySelectorAll<HTMLButtonElement>('[data-showcase-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.showcaseId as 'championship_trophy' | HeroRelicId;
          if (!id) return;
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          activeShowcase = id;
          observatoryMode = true;
          callbacks.onInspect3DTrophy(id);
          render();
        });
      });

      backdrop.querySelector('#ws-passport-close')?.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        this.close();
        callbacks.onClose();
      });
    };

    render();
    document.body.appendChild(backdrop);
    this.modalEl = backdrop;
  }

  public close(): void {
    const uiRootEl = document.getElementById('ui-root');
    if (uiRootEl) {
      uiRootEl.style.visibility = 'visible';
    }
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}
