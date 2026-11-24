// ============================================================================
// WORLD'S SMARTEST v4.0 — Hall of Honours & Unlockables View
//  • Browses & filters all dynamic Trophies & Medals (100 across 5 Rarity Tiers)
//    with exact `tabular-nums` progress bars (`12 / 50`) & `./assets/medals/*.png`
//  • Direct 1-Click Equip Studio for all 48 Gameplay Unlockables:
//      - 16 Stage & 3D Trophy Finishes
//      - 19 Broadcast Show Titles (synced to HUD & Passport)
//      - 13 Stage & Crown HUD Accent Themes
//  • Interactive `◈ 3D` Trophy Showcase toggle (`stage3d.showChampionshipTrophy`)
//  • Deep-link aspect pre-filtering from Career Stats (`initialAspectFilter`)
// ============================================================================

import '../styles/brass_modals_v5.css';
import type { Stage3DDirector } from '../stage3d';
import type { InkBlackboard, PassportSystem } from '../narrative';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import {
  attachMetaEscapeHandler,
  bindVaultJumperEvents,
  ensureMetaStylesInjected,
  escapeMetaHtml,
  renderVaultJumperHtml,
  sanitizeMetaCopy,
  type MetaSuiteSectionId,
} from './DiplomaticPassportBook';
import {
  applyPrismFinishToStage3D,
  evaluatePrismFinishUnlocks,
  saveEquippedPrismFinishId,
  type PrismFinishId,
  type PrismMaterialFinishSpec,
} from './PrismAtelierView';
import {
  BROADCAST_TITLES_CATALOG,
  HUD_ACCENT_THEMES,
  RARITY_TIER_META,
  equipHudAccentTheme,
  getEquippedHudTheme,
  getTotalHonoursCount,
  getTotalUnlockablesCount,
  getUnlockedHudThemeIds,
  type HallOfHonoursSystem,
  type HonourAspectCategory,
  type HonourRarityTier,
  type HudAccentThemeId,
  type HudAccentThemeSpec,
} from './HallOfHonoursSystem';

export type HonoursSubTab = 'TROPHIES_64' | 'UNLOCKABLES_32' | 'TROPHIES' | 'UNLOCKABLES';

function isTrophiesTab(tab: HonoursSubTab): boolean {
  return tab === 'TROPHIES_64' || tab === 'TROPHIES';
}

const BRASS_HONOURS_ICONS = {
  back: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
  close: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  fullscreen: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
  trophy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M6 4h12v6a6 6 0 0 1-12 0V4Z"/><path d="M12 16v4"/><path d="M8 20h8"/></svg>',
  reward: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.1 8.4 22 9.3 17 14.1 18.2 21 12 17.7 5.8 21 7 14.1 2 9.3 8.9 8.4 12 2"/></svg>',
  cube3d: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2"/><path d="m3 7 9 5 9-5"/><path d="M12 12v10"/></svg>',
  orbit: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  lock: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
} as const;

const TIER_DOT_HEX: Record<HonourRarityTier, string> = {
  TIER_1_EASY: '#d49254',
  TIER_2_MEDIUM: '#dce3ee',
  TIER_3_HARD: '#f4ce72',
  TIER_4_VERY_RARE: '#69b8ff',
  TIER_5_MYTHIC: '#d896ff',
};

function toggleHonoursFullscreenSafe(btn: HTMLButtonElement): void {
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

export interface HallOfHonoursViewDependencies {
  honoursSystem: HallOfHonoursSystem;
  passport: PassportSystem;
  blackboard?: InkBlackboard;
  stage3d?: Stage3DDirector;
  audio?: StudioAudioEngine;
  haptics?: HapticsEngine;
}

export interface HallOfHonoursViewCallbacks {
  onEquipSkin?: (skinSpec: PrismMaterialFinishSpec) => void;
  onEquipBroadcastTitle?: (title: string) => void;
  onEquipHudTheme?: (theme: HudAccentThemeSpec) => void;
  onNavigateSection?: (section: MetaSuiteSectionId) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onClose?: () => void;
}

export interface HallOfHonoursOpenOptions extends HallOfHonoursViewCallbacks {
  initialTab?: HonoursSubTab;
  initialTierFilter?: HonourRarityTier | 'ALL';
  initialAspectFilter?: HonourAspectCategory | 'ALL';
  initialContextLabel?: string | null;
}

export class HallOfHonoursView {
  private readonly deps: HallOfHonoursViewDependencies;
  private modalBackdrop: HTMLElement | null = null;
  private mountedContainer: HTMLElement | null = null;
  private detachEscape: (() => void) | null = null;
  private callbacks: HallOfHonoursOpenOptions = {};

  private activeTab: HonoursSubTab = 'TROPHIES_64';
  private tierFilter: HonourRarityTier | 'ALL' = 'ALL';
  private aspectFilter: HonourAspectCategory | 'ALL' = 'ALL';
  private contextLabel: string | null = null;
  private trophy3DDockActive = false;
  private trophyReqToken = 0;

  constructor(deps: HallOfHonoursViewDependencies) {
    this.deps = deps;
    ensureMetaStylesInjected();
  }

  public isOpen(): boolean {
    return this.modalBackdrop !== null || this.mountedContainer !== null;
  }

  public open(options: HallOfHonoursOpenOptions = {}): void {
    this.close();
    this.callbacks = options;
    this.activeTab = options.initialTab ?? 'TROPHIES_64';
    this.tierFilter = options.initialTierFilter ?? 'ALL';
    this.aspectFilter = options.initialAspectFilter ?? 'ALL';
    this.contextLabel = options.initialContextLabel?.trim() || null;
    this.trophy3DDockActive = false;
    this.deps.honoursSystem.evaluateAndUnlock(true);

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-meta-backdrop ws-brass-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute(
      'aria-label',
      `Hall of Honours — ${getTotalHonoursCount()} Trophies & ${getTotalUnlockablesCount()} Unlockables`,
    );
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop && !this.trophy3DDockActive) {
        this.handleClose();
      }
    });

    document.body.appendChild(backdrop);
    this.modalBackdrop = backdrop;
    this.detachEscape = attachMetaEscapeHandler(() => this.handleBackOrClose());
    this.renderInto(backdrop, true);
  }

  public mount(container: HTMLElement, options: HallOfHonoursOpenOptions = {}): void {
    this.unmount();
    this.callbacks = options;
    this.activeTab = options.initialTab ?? 'TROPHIES_64';
    this.tierFilter = options.initialTierFilter ?? 'ALL';
    this.aspectFilter = options.initialAspectFilter ?? 'ALL';
    this.contextLabel = options.initialContextLabel?.trim() || null;
    this.deps.honoursSystem.evaluateAndUnlock(true);
    this.mountedContainer = container;
    this.renderInto(container, false);
  }

  public unmount(): void {
    this.trophyReqToken += 1;
    if (this.detachEscape) {
      this.detachEscape();
      this.detachEscape = null;
    }
    this.syncUiRootVisibility(false);
    if (this.mountedContainer) {
      this.mountedContainer.innerHTML = '';
      this.mountedContainer = null;
    }
  }

  public close(): void {
    this.unmount();
    if (this.modalBackdrop) {
      this.modalBackdrop.remove();
      this.modalBackdrop = null;
    }
  }

  private syncUiRootVisibility(hideBehind3D: boolean): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('ws-3d-showcase-open', hideBehind3D);
    const uiRoot = document.getElementById('ui-root');
    if (uiRoot) {
      uiRoot.style.visibility = hideBehind3D ? 'hidden' : 'visible';
    }
  }

  private async toggle3DTrophyShowcase(): Promise<void> {
    this.trophy3DDockActive = !this.trophy3DDockActive;
    const token = ++this.trophyReqToken;
    this.rerender();
    if (this.trophy3DDockActive && this.deps.stage3d) {
      await this.deps.stage3d.showChampionshipTrophy(0);
      if (token !== this.trophyReqToken || !this.isOpen()) return;
    }
  }

  private handleBackOrClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    if (this.callbacks.canGoBack && this.callbacks.onBack) {
      this.callbacks.onBack();
      return;
    }
    this.handleClose();
  }

  private handleClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    const onClose = this.callbacks.onClose;
    this.close();
    onClose?.();
  }

  private rerender(): void {
    if (this.modalBackdrop) {
      this.modalBackdrop.className = this.trophy3DDockActive
        ? 'ws-meta-backdrop ws-brass-backdrop is-stage-dock'
        : 'ws-meta-backdrop ws-brass-backdrop';
      this.syncUiRootVisibility(this.trophy3DDockActive);
      this.renderInto(this.modalBackdrop, true);
    } else if (this.mountedContainer) {
      this.renderInto(this.mountedContainer, false);
    }
  }

  private renderInto(host: HTMLElement, isModal: boolean): void {
    const allHonours = this.deps.honoursSystem.getAllProgress();
    const totalHonours = allHonours.length;
    const unlockedHonoursCount = allHonours.filter((h) => h.unlocked).length;

    const finishStatuses = evaluatePrismFinishUnlocks(this.deps.passport, this.deps.blackboard);
    const pSnap = this.deps.passport.getSnapshot();
    const unlockedThemeIds = getUnlockedHudThemeIds();
    const totalFinishes = finishStatuses.length;
    const totalTitles = BROADCAST_TITLES_CATALOG.length;
    const totalThemes = HUD_ACCENT_THEMES.length;
    const totalRewards = totalFinishes + totalTitles + totalThemes;
    const unlockedTitlesCount = BROADCAST_TITLES_CATALOG.filter(
      (bt) => bt.order === 1 || pSnap.titleCrests.includes(bt.title),
    ).length;
    const totalUnlockedRewards =
      finishStatuses.filter((f) => f.unlocked).length +
      unlockedTitlesCount +
      unlockedThemeIds.length;

    const onTrophies = isTrophiesTab(this.activeTab);
    const isFsActive = typeof document !== 'undefined' && Boolean(document.fullscreenElement);
    const underlineTabsHtml = `
      <div class="ws-meta-underline-tabs" role="tablist" aria-label="Hall of Honours Sections">
        <button type="button" role="tab" aria-selected="${onTrophies}" class="ws-meta-underline-tab ${onTrophies ? 'is-active' : ''}" data-honours-tab="TROPHIES_64">
          <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.trophy}</span>
          <span>${totalHonours} Trophies (${unlockedHonoursCount}/${totalHonours})</span>
        </button>
        <button type="button" role="tab" aria-selected="${!onTrophies}" class="ws-meta-underline-tab ${!onTrophies ? 'is-active' : ''}" data-honours-tab="UNLOCKABLES_32">
          <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.reward}</span>
          <span>${totalRewards} Rewards (${totalUnlockedRewards}/${totalRewards})</span>
        </button>
      </div>
    `;

    const bodyHtml = onTrophies
      ? this.renderTrophiesGrid(allHonours)
      : this.renderUnlockablesStudio(
          finishStatuses,
          pSnap.titleCrests,
          pSnap.activeTitleCrest,
          unlockedThemeIds,
        );

    if (isModal && this.trophy3DDockActive) {
      const vaultFloatingHtml = renderVaultJumperHtml('HONOURS', {
        isModal: true,
        closeBtnId: 'ws-honours-close',
        canNavigate: Boolean(this.callbacks.onNavigateSection),
        floatingVariant: true,
      });

      host.innerHTML = `
        <div class="ws-meta-stage-zone">
          <div class="ws-meta-stage-top">
            <button type="button" class="ws-meta-float-pill" id="ws-honours-back" data-meta-back="true" aria-label="Back">
              <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.back}</span>
              <span>Back</span>
            </button>
            <div class="ws-meta-stage-actions">
              <button
                type="button"
                class="ws-meta-float-pill ${isFsActive ? 'is-active-gold' : ''}"
                data-v5-fullscreen-toggle="true"
                aria-pressed="${isFsActive}"
                aria-label="Toggle Fullscreen"
              >
                <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.fullscreen}</span>
              </button>
              ${vaultFloatingHtml}
              <button type="button" class="ws-meta-float-pill" data-brass-close="true" aria-label="Close">
                <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.close}</span>
              </button>
            </div>
          </div>
          <div class="ws-meta-stage-bottom">
            <span class="ws-meta-orbit-whisper">
              <span class="ws-brass-ico" aria-hidden="true" style="margin-right:4px;vertical-align:-2px;">${BRASS_HONOURS_ICONS.orbit}</span>Drag 3D to Orbit
            </span>
            <div class="ws-meta-stage-actions">
              <button type="button" class="ws-meta-float-pill is-active-gold" id="ws-honours-3d-toggle">
                Full Hall
              </button>
            </div>
          </div>
        </div>

        <div class="ws-meta-sheet ws-brass-ledger">
          <div class="ws-meta-drag-handle" aria-hidden="true"></div>
          ${underlineTabsHtml}
          <div class="ws-meta-body-scroll">
            ${bodyHtml}
          </div>
        </div>
      `;

      this.bindEvents(host);
      return;
    }

    const vaultJumperHtml = renderVaultJumperHtml('HONOURS', {
      isModal,
      closeBtnId: 'ws-honours-close',
      canNavigate: Boolean(this.callbacks.onNavigateSection),
    });

    host.innerHTML = `
      <div class="ws-meta-shell ws-brass-ledger">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-honours-back" data-meta-back="true" aria-label="Back">
              <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.back}</span>
              <span class="ws-brass-back-lbl">Back</span>
            </button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">
                <span class="ws-brass-ico ws-brass-title-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.trophy}</span>
                <span>HALL OF HONOURS</span>
              </h2>
              <div class="ws-meta-eyebrow">${unlockedHonoursCount}/${totalHonours} Trophies · ${totalUnlockedRewards}/${totalRewards} Rewards</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${
              this.deps.stage3d && isModal
                ? `<button type="button" class="ws-brass-clasp-btn" id="ws-honours-3d-toggle" aria-label="Toggle 3D Trophy Showcase">
                    <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.cube3d}</span>
                    <span>3D</span>
                  </button>`
                : ''
            }
            <button
              type="button"
              class="ws-brass-clasp-btn is-icon-only ${isFsActive ? 'is-active-emerald' : ''}"
              data-v5-fullscreen-toggle="true"
              aria-pressed="${isFsActive}"
              aria-label="Toggle Fullscreen"
              title="Toggle Fullscreen"
            >
              <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.fullscreen}</span>
            </button>
            ${vaultJumperHtml}
            ${
              isModal
                ? `<button type="button" class="ws-brass-clasp-btn is-icon-only is-close-clasp" data-brass-close="true" aria-label="Close Hall of Honours" title="Close">
                    <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.close}</span>
                  </button>`
                : ''
            }
          </div>
        </div>

        ${underlineTabsHtml}

        <div class="ws-meta-body-scroll">
          ${bodyHtml}
        </div>
      </div>
    `;

    this.bindEvents(host);
  }

  private renderTrophiesGrid(allHonours: ReturnType<HallOfHonoursSystem['getAllProgress']>): string {
    const filtered = allHonours.filter((item) => {
      if (this.tierFilter !== 'ALL' && item.def.tier !== this.tierFilter) return false;
      if (this.aspectFilter !== 'ALL' && item.def.aspect !== this.aspectFilter) return false;
      return true;
    });

    const hasActivePreFilter = this.tierFilter !== 'ALL' || this.aspectFilter !== 'ALL';

    return `
      <!-- Carved Mahogany & Brass Filter Ribbons (44px+ Tactile Clasps) -->
      <div class="ws-meta-section" style="gap:8px;" data-honours-active-aspect="${this.aspectFilter}" data-honours-active-tier="${this.tierFilter}">
        ${
          hasActivePreFilter || this.contextLabel
            ? `<div id="ws-honours-context-bar" class="ws-meta-note" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
                <span style="font-family:var(--ws5-font-mono);font-size:11px;color:var(--ws5-parchment-bright);">
                  ${this.contextLabel ? `Related to ${escapeMetaHtml(this.contextLabel)} · ` : ''}Showing <strong>${filtered.length}</strong> of ${allHonours.length} Trophies
                </span>
                <button type="button" class="ws-meta-inline-link" id="ws-honours-clear-filters">
                  <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.close}</span>
                  <span>Show All ${allHonours.length}</span>
                </button>
              </div>`
            : ''
        }
        <div class="ws-meta-hscroll" aria-label="Filter by Rarity Tier">
          ${(
            [
              ['ALL', `All ${allHonours.length}`, null],
              ['TIER_1_EASY', 'Bronze', TIER_DOT_HEX.TIER_1_EASY],
              ['TIER_2_MEDIUM', 'Sterling', TIER_DOT_HEX.TIER_2_MEDIUM],
              ['TIER_3_HARD', '24K Gold', TIER_DOT_HEX.TIER_3_HARD],
              ['TIER_4_VERY_RARE', 'Sapphire', TIER_DOT_HEX.TIER_4_VERY_RARE],
              ['TIER_5_MYTHIC', 'Mythic 0.1%', TIER_DOT_HEX.TIER_5_MYTHIC],
            ] as const
          )
            .map(
              ([id, lbl, dotHex]) => `
                <button type="button" class="ws-meta-chip ${this.tierFilter === id ? 'is-active' : ''}" data-tier-filter="${id}">
                  ${dotHex ? `<span class="ws-brass-tier-dot" style="background:${dotHex};" aria-hidden="true"></span>` : ''}
                  <span>${lbl}</span>
                </button>
              `,
            )
            .join('')}
        </div>

        <div class="ws-meta-hscroll" aria-label="Filter by Aspect">
          ${(
            [
              ['ALL', 'All Aspects'],
              ['PRISM_OVERCLOCK', 'Formats & Wagers'],
              ['STREAK_SPEED', 'Streak & Speed'],
              ['CAMPAIGN_LORE', 'World Tour & Rivals'],
              ['MODES_TRIALS', 'Modes & Boards'],
              ['DOMAINS_POLYMATH', '12 Domains'],
            ] as const
          )
            .map(
              ([id, lbl]) => `
                <button type="button" class="ws-meta-chip ${this.aspectFilter === id ? 'is-active' : ''}" data-aspect-filter="${id}">
                  ${lbl}
                </button>
              `,
            )
            .join('')}
        </div>
      </div>

      <!-- Velvet-Lined Mahogany & Brushed Brass Trophy Medallion Cabinet -->
      <div class="ws-meta-section" style="padding:12px;">
        <div class="ws-brass-trophy-grid">
          ${filtered
            .map((item) => {
              const tm = RARITY_TIER_META[item.def.tier];
              const progressText = item.unlocked
                ? 'EARNED'
                : `${Math.round(item.current)} / ${Math.round(item.target)}`;
              return `
                <article
                  class="ws-brass-trophy-card ${item.unlocked ? 'is-earned' : ''}"
                  data-trophy-id="${escapeMetaHtml(item.def.id)}"
                  style="--trophy-tier-hex:${tm.colorHex};"
                >
                  <div class="ws-brass-medallion-well">
                    <img
                      src="${escapeMetaHtml(item.emblemPngUrl)}"
                      data-fallback-src="${escapeMetaHtml(item.emblemFallbackDataUri)}"
                      alt=""
                    />
                  </div>
                  <div class="ws-brass-trophy-body">
                    <div class="ws-brass-trophy-meta">
                      <span class="ws-brass-trophy-code" style="color:${tm.colorHex};">
                        #${item.def.number} · ${escapeMetaHtml(tm.shortLabel.toUpperCase())}
                      </span>
                      <span class="ws-brass-trophy-status ${item.unlocked ? 'is-earned' : ''}">
                        ${item.unlocked ? `<span class="ws-brass-ico" aria-hidden="true" style="margin-right:3px;vertical-align:-1px;">${BRASS_HONOURS_ICONS.check}</span>` : ''}${progressText}
                      </span>
                    </div>
                    <div class="ws-brass-trophy-title">
                      ${escapeMetaHtml(item.def.title)}
                    </div>
                    <div class="ws-brass-trophy-desc">
                      ${escapeMetaHtml(sanitizeMetaCopy(item.def.description))}
                    </div>
                    <div class="ws-meta-progress-track" style="margin-top:3px;">
                      <div class="ws-meta-progress-fill" style="width:${Math.round(item.ratio * 100)}%;background:${item.unlocked ? 'linear-gradient(90deg, #168260 0%, #57e6ab 100%)' : tm.colorHex};"></div>
                    </div>
                    ${
                      item.def.reward
                        ? `<div class="ws-brass-trophy-reward">
                            <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.reward}</span>
                            <span>${escapeMetaHtml(item.def.reward.rewardLabel)}</span>
                          </div>`
                        : ''
                    }
                  </div>
                </article>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  private renderUnlockablesStudio(
    finishStatuses: ReturnType<typeof evaluatePrismFinishUnlocks>,
    unlockedTitles: readonly string[],
    activeTitle: string,
    unlockedThemeIds: readonly HudAccentThemeId[],
  ): string {
    const equippedTheme = getEquippedHudTheme();
    const totalFinishes = finishStatuses.length;
    const totalTitles = BROADCAST_TITLES_CATALOG.length;
    const totalThemes = HUD_ACCENT_THEMES.length;
    const unlockedTitlesCount = BROADCAST_TITLES_CATALOG.filter(
      (b) => b.order === 1 || unlockedTitles.includes(b.title),
    ).length;

    return `
      <!-- 1. Stage & 3D Trophy Finishes (16 Finishes) -->
      <div class="ws-meta-section">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <h3 class="ws-meta-section-title">1. Stage &amp; 3D Trophy Finishes (${finishStatuses.filter((f) => f.unlocked).length}/${totalFinishes})</h3>
          ${
            this.callbacks.onNavigateSection
              ? `<button type="button" class="ws-meta-inline-link" data-suite-nav="ATELIER">
                  <span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.cube3d}</span>
                  <span>3D Atelier</span>
                </button>`
              : ''
          }
        </div>
        <div class="ws-brass-rewards-grid">
          ${finishStatuses
            .map(
              (st) => `
                <button
                  type="button"
                  class="ws-brass-reward-plaque ${st.equipped ? 'is-focused' : ''}"
                  data-equip-finish="${st.spec.id}"
                  ${st.unlocked ? '' : 'disabled'}
                >
                  <span style="display:inline-flex;align-items:center;gap:10px;min-width:0;">
                    <span style="width:24px;height:24px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,${st.spec.swatchPrimaryCss},${st.spec.swatchSecondaryCss});border:2px solid #d49c3b;box-shadow:inset 0 1px 0 rgba(255,240,184,0.45);"></span>
                    <span style="font-size:12.5px;font-weight:700;color:var(--ws5-parchment-bright);line-height:1.25;">${escapeMetaHtml(st.spec.name)}</span>
                  </span>
                  <span class="ws-brass-equip-badge ${st.equipped ? 'is-equipped' : st.unlocked ? '' : 'is-locked'}">
                    ${st.equipped ? 'EQUIPPED' : st.unlocked ? 'EQUIP' : `<span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.lock}</span>`}
                  </span>
                </button>
              `,
            )
            .join('')}
        </div>
      </div>

      <!-- 2. Broadcast Show Titles (19 Titles) -->
      <div class="ws-meta-section">
        <h3 class="ws-meta-section-title">2. Broadcast Show Titles (${unlockedTitlesCount}/${totalTitles})</h3>
        <div class="ws-brass-rewards-grid">
          ${BROADCAST_TITLES_CATALOG.map((bt) => {
            const isUnl = bt.order === 1 || unlockedTitles.includes(bt.title);
            const isAct = activeTitle === bt.title;
            return `
              <button
                type="button"
                class="ws-brass-reward-plaque ${isAct ? 'is-focused' : ''}"
                data-equip-title="${escapeMetaHtml(bt.title)}"
                ${isUnl ? '' : 'disabled'}
              >
                <span style="min-width:0;display:flex;flex-direction:column;gap:2px;">
                  <span style="font-family:var(--ws5-font-display);font-size:12px;font-weight:800;color:${isAct ? 'var(--ws5-brass-highlight)' : 'var(--ws5-parchment-bright)'};">
                    ${escapeMetaHtml(bt.title)}
                  </span>
                  <span style="font-family:var(--ws5-font-mono);font-size:10px;color:var(--ws5-parchment-muted);">
                    ${escapeMetaHtml(sanitizeMetaCopy(bt.unlockRequirement))}
                  </span>
                </span>
                <span class="ws-brass-equip-badge ${isAct ? 'is-equipped' : isUnl ? '' : 'is-locked'}">
                  ${isAct ? 'EQUIPPED' : isUnl ? 'EQUIP' : `<span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.lock}</span>`}
                </span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. Stage & Crown HUD Themes (13 Themes) -->
      <div class="ws-meta-section">
        <h3 class="ws-meta-section-title">3. Stage &amp; Crown HUD Themes (${unlockedThemeIds.length}/${totalThemes})</h3>
        <div class="ws-brass-rewards-grid">
          ${HUD_ACCENT_THEMES.map((th) => {
            const isUnl = unlockedThemeIds.includes(th.id);
            const isEq = equippedTheme.id === th.id;
            return `
              <button
                type="button"
                class="ws-brass-reward-plaque ${isEq ? 'is-focused' : ''}"
                data-equip-theme="${th.id}"
                ${isUnl ? '' : 'disabled'}
              >
                <span style="display:inline-flex;align-items:center;gap:10px;min-width:0;">
                  <span style="width:22px;height:22px;border-radius:50%;background:${th.primaryHex};border:2px solid #d49c3b;box-shadow:0 0 0 2px ${th.secondaryHex};flex-shrink:0;"></span>
                  <span style="min-width:0;">
                    <span style="display:block;font-size:12.5px;font-weight:700;color:var(--ws5-parchment-bright);line-height:1.25;">${escapeMetaHtml(th.name)}</span>
                    <span style="display:block;font-family:var(--ws5-font-mono);font-size:10px;color:var(--ws5-parchment-muted);">${escapeMetaHtml(sanitizeMetaCopy(th.unlockRequirement))}</span>
                  </span>
                </span>
                <span class="ws-brass-equip-badge ${isEq ? 'is-equipped' : isUnl ? '' : 'is-locked'}">
                  ${isEq ? 'EQUIPPED' : isUnl ? 'EQUIP' : `<span class="ws-brass-ico" aria-hidden="true">${BRASS_HONOURS_ICONS.lock}</span>`}
                </span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  private bindEvents(host: HTMLElement): void {
    host.querySelectorAll<HTMLImageElement>('img[data-fallback-src]').forEach((img) => {
      img.addEventListener(
        'error',
        () => {
          const fb = img.dataset.fallbackSrc;
          if (fb && img.src !== fb) img.src = fb;
        },
        { once: true },
      );
    });

    host.querySelector('#ws-honours-back')?.addEventListener('click', () => this.handleBackOrClose());
    host.querySelector('[data-brass-close="true"]')?.addEventListener('click', () => this.handleClose());
    host.querySelectorAll<HTMLButtonElement>('[data-v5-fullscreen-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        toggleHonoursFullscreenSafe(btn);
      });
    });
    host.querySelector('#ws-honours-3d-toggle')?.addEventListener('click', () => {
      this.deps.haptics?.uiTap();
      this.deps.audio?.playSfx('ui_tap');
      void this.toggle3DTrophyShowcase();
    });

    bindVaultJumperEvents(host, {
      closeBtnId: 'ws-honours-close',
      onNavigate: (target) => this.callbacks.onNavigateSection?.(target),
      onClose: () => this.handleClose(),
      onTapFeedback: () => {
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
      },
    });

    // Inline 3D Atelier link inside Unlockables tab
    host.querySelectorAll<HTMLButtonElement>('.ws-meta-body-scroll [data-suite-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.suiteNav as MetaSuiteSectionId | undefined;
        if (!target) return;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.callbacks.onNavigateSection?.(target);
      });
    });

    host.querySelectorAll<HTMLButtonElement>('[data-honours-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.honoursTab as HonoursSubTab | undefined;
        if (!next || next === this.activeTab) return;
        this.activeTab = next;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.rerender();
      });
    });

    host.querySelectorAll<HTMLButtonElement>('[data-tier-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tf = btn.dataset.tierFilter as HonourRarityTier | 'ALL' | undefined;
        if (!tf) return;
        this.tierFilter = tf;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.rerender();
      });
    });

    host.querySelector('#ws-honours-clear-filters')?.addEventListener('click', () => {
      this.tierFilter = 'ALL';
      this.aspectFilter = 'ALL';
      this.contextLabel = null;
      this.deps.haptics?.uiTap();
      this.deps.audio?.playSfx('ui_tap');
      this.rerender();
    });

    host.querySelectorAll<HTMLButtonElement>('[data-aspect-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const af = btn.dataset.aspectFilter as HonourAspectCategory | 'ALL' | undefined;
        if (!af) return;
        this.aspectFilter = af;
        if (af === 'ALL') this.contextLabel = null;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.rerender();
      });
    });

    // Equip Prism Finish
    host.querySelectorAll<HTMLButtonElement>('[data-equip-finish]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fid = btn.dataset.equipFinish as PrismFinishId | undefined;
        if (!fid) return;
        const spec = saveEquippedPrismFinishId(fid);
        this.deps.blackboard?.unlockSkin(spec.legacyBlackboardSkinId, true);
        if (this.deps.stage3d) {
          applyPrismFinishToStage3D(this.deps.stage3d, spec, { updateDomainPalette: false });
        }
        this.deps.haptics?.lockThunk();
        this.deps.audio?.playSfx('vault_thunk');
        this.callbacks.onEquipSkin?.(spec);
        this.rerender();
      });
    });

    // Equip Diplomatic Broadcast Title
    host.querySelectorAll<HTMLButtonElement>('[data-equip-title]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const title = btn.dataset.equipTitle;
        if (!title) return;
        this.deps.passport.unlockTitleCrest(title, true);
        this.deps.haptics?.passportStamp();
        this.deps.audio?.playSfx('passport_stamp');
        this.callbacks.onEquipBroadcastTitle?.(title);
        this.rerender();
      });
    });

    // Equip Chrono-Ring & HUD Accent Theme
    host.querySelectorAll<HTMLButtonElement>('[data-equip-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tid = btn.dataset.equipTheme as HudAccentThemeId | undefined;
        if (!tid) return;
        const spec = equipHudAccentTheme(tid);
        this.deps.haptics?.sightlineSnap();
        this.deps.audio?.playSfx('sightline_snap');
        this.callbacks.onEquipHudTheme?.(spec);
        this.rerender();
      });
    });
  }
}
