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
    backdrop.className = 'ws-meta-backdrop';
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
        ? 'ws-meta-backdrop is-stage-dock'
        : 'ws-meta-backdrop';
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
    const underlineTabsHtml = `
      <div class="ws-meta-underline-tabs" role="tablist" aria-label="Hall of Honours Sections">
        <button type="button" role="tab" aria-selected="${onTrophies}" class="ws-meta-underline-tab ${onTrophies ? 'is-active' : ''}" data-honours-tab="TROPHIES_64">
          ${totalHonours} Trophies (${unlockedHonoursCount}/${totalHonours})
        </button>
        <button type="button" role="tab" aria-selected="${!onTrophies}" class="ws-meta-underline-tab ${!onTrophies ? 'is-active' : ''}" data-honours-tab="UNLOCKABLES_32">
          ${totalRewards} Rewards (${totalUnlockedRewards}/${totalRewards})
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
            <button type="button" class="ws-meta-float-pill" id="ws-honours-back" data-meta-back="true" aria-label="Back">← Back</button>
            ${vaultFloatingHtml}
          </div>
          <div class="ws-meta-stage-bottom">
            <span class="ws-meta-orbit-whisper">↻ Drag 3D to Orbit</span>
            <div class="ws-meta-stage-actions">
              <button type="button" class="ws-meta-float-pill is-active-gold" id="ws-honours-3d-toggle">
                ⤢ Full Hall
              </button>
            </div>
          </div>
        </div>

        <div class="ws-meta-sheet">
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
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-honours-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">HONOURS</h2>
              <div class="ws-meta-eyebrow">${unlockedHonoursCount}/${totalHonours} Trophies · ${totalUnlockedRewards}/${totalRewards} Rewards</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${
              this.deps.stage3d && isModal
                ? `<button type="button" class="ws-meta-vault-btn" id="ws-honours-3d-toggle" aria-label="Toggle 3D Trophy Showcase">◈ 3D</button>`
                : ''
            }
            ${vaultJumperHtml}
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
      <!-- Single-Line Horizontal Scrollable Tier & Aspect Filters (Zero Boxed Filter Cards!) -->
      <div class="ws-meta-section" style="padding-top:0;gap:7px;" data-honours-active-aspect="${this.aspectFilter}" data-honours-active-tier="${this.tierFilter}">
        ${
          hasActivePreFilter || this.contextLabel
            ? `<div id="ws-honours-context-bar" class="ws-meta-note" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:6px 0 6px 12px;">
                <span style="font-family:var(--font-mono);font-size:11px;color:var(--ivory-primary);">
                  ◆ ${this.contextLabel ? `Related to ${escapeMetaHtml(this.contextLabel)} · ` : ''}Showing <strong>${filtered.length}</strong> of ${allHonours.length} Trophies
                </span>
                <button type="button" class="ws-meta-inline-link" id="ws-honours-clear-filters" style="min-height:44px;padding:0 8px;">
                  ✕ Show All ${allHonours.length}
                </button>
              </div>`
            : ''
        }
        <div class="ws-meta-hscroll" aria-label="Filter by Rarity Tier">
          ${(
            [
              ['ALL', `All ${allHonours.length}`],
              ['TIER_1_EASY', 'Bronze'],
              ['TIER_2_MEDIUM', 'Sterling'],
              ['TIER_3_HARD', '24K Gold'],
              ['TIER_4_VERY_RARE', 'Sapphire'],
              ['TIER_5_MYTHIC', 'Mythic 0.1%'],
            ] as const
          )
            .map(
              ([id, lbl]) => `
                <button type="button" class="ws-meta-chip ${this.tierFilter === id ? 'is-active' : ''}" data-tier-filter="${id}">
                  ${lbl}
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

      <!-- Hairline-Divided Trophy List / 2-Column Wide Grid (Zero Nested Boxes!) -->
      <div class="ws-meta-section" style="border-bottom:none;padding-top:4px;gap:0;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:0 22px;">
          ${filtered
            .map((item) => {
              const tm = RARITY_TIER_META[item.def.tier];
              const progressText = item.unlocked
                ? '✓ EARNED'
                : `${Math.round(item.current)} / ${Math.round(item.target)}`;
              return `
                <div data-trophy-id="${escapeMetaHtml(item.def.id)}" style="display:flex;gap:11px;align-items:flex-start;padding:12px 4px;border-bottom:1px solid rgba(255,255,255,0.07);${item.unlocked ? `box-shadow:inset 3px 0 0 ${tm.colorHex};padding-left:10px;background:rgba(255,255,255,0.02);` : ''}">
                  <img
                    src="${escapeMetaHtml(item.emblemPngUrl)}"
                    data-fallback-src="${escapeMetaHtml(item.emblemFallbackDataUri)}"
                    alt=""
                    style="width:42px;height:42px;object-fit:contain;flex-shrink:0;${item.unlocked ? '' : 'filter:grayscale(0.82) opacity(0.55);'}"
                  />
                  <div style="min-width:0;flex:1 1 auto;display:flex;flex-direction:column;gap:4px;">
                    <div style="display:flex;justify-content:space-between;gap:6px;align-items:baseline;">
                      <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${tm.colorHex};letter-spacing:0.06em;">
                        #${item.def.number} · ${escapeMetaHtml(tm.shortLabel.toUpperCase())}
                      </span>
                      <span style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:${item.unlocked ? 'var(--emerald-win)' : 'var(--ivory-muted)'};flex-shrink:0;">
                        ${progressText}
                      </span>
                    </div>
                    <div style="font-family:var(--font-display);font-size:13.5px;font-weight:800;color:var(--ivory-primary);line-height:1.22;">
                      ${escapeMetaHtml(item.def.title)}
                    </div>
                    <div style="font-size:11.5px;color:var(--ivory-muted);line-height:1.35;">
                      ${escapeMetaHtml(sanitizeMetaCopy(item.def.description))}
                    </div>
                    <div class="ws-meta-progress-track" style="margin-top:2px;">
                      <div class="ws-meta-progress-fill" style="width:${Math.round(item.ratio * 100)}%;background:${item.unlocked ? 'var(--emerald-win)' : tm.colorHex};"></div>
                    </div>
                    ${
                      item.def.reward
                        ? `<div style="font-family:var(--font-mono);font-size:10px;color:var(--gold-bright);margin-top:1px;">
                            ✦ ${escapeMetaHtml(item.def.reward.rewardLabel)}
                          </div>`
                        : ''
                    }
                  </div>
                </div>
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
      <!-- 1. Stage & 3D Trophy Finishes (Dynamic Total) -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <h3 class="ws-meta-section-title">1. Stage &amp; 3D Trophy Finishes (${finishStatuses.filter((f) => f.unlocked).length}/${totalFinishes})</h3>
          ${
            this.callbacks.onNavigateSection
              ? `<button type="button" class="ws-meta-inline-link" data-suite-nav="ATELIER">◈ 3D Atelier ›</button>`
              : ''
          }
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0 20px;">
          ${finishStatuses
            .map(
              (st) => `
                <button
                  type="button"
                  class="ws-meta-row is-interactive ${st.equipped ? 'is-focused' : ''}"
                  data-equip-finish="${st.spec.id}"
                  ${st.unlocked ? '' : 'disabled'}
                  style="width:100%;text-align:left;"
                >
                  <span style="display:inline-flex;align-items:center;gap:9px;min-width:0;">
                    <span style="width:18px;height:18px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,${st.spec.swatchPrimaryCss},${st.spec.swatchSecondaryCss});box-shadow:0 0 0 1px rgba(255,255,255,0.45);"></span>
                    <span style="font-size:12px;font-weight:600;color:var(--ivory-primary);line-height:1.25;">${escapeMetaHtml(st.spec.name)}</span>
                  </span>
                  <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${st.equipped ? 'var(--emerald-win)' : st.unlocked ? 'var(--gold-bright)' : '#9aa4b7'};flex-shrink:0;">
                    ${st.equipped ? '✓ ON' : st.unlocked ? 'EQUIP' : '◇'}
                  </span>
                </button>
              `,
            )
            .join('')}
        </div>
      </div>

      <!-- 2. Broadcast Show Titles (Dynamic Total) -->
      <div class="ws-meta-section">
        <h3 class="ws-meta-section-title">2. Broadcast Show Titles (${unlockedTitlesCount}/${totalTitles})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0 20px;">
          ${BROADCAST_TITLES_CATALOG.map((bt) => {
            const isUnl = bt.order === 1 || unlockedTitles.includes(bt.title);
            const isAct = activeTitle === bt.title;
            return `
              <button
                type="button"
                class="ws-meta-row is-interactive ${isAct ? 'is-focused' : ''}"
                data-equip-title="${escapeMetaHtml(bt.title)}"
                ${isUnl ? '' : 'disabled'}
                style="width:100%;text-align:left;"
              >
                <span style="min-width:0;display:flex;flex-direction:column;gap:2px;">
                  <span style="font-family:var(--font-display);font-size:11.5px;font-weight:700;color:${isAct ? 'var(--gold-bright)' : 'var(--ivory-primary)'};">
                    ${escapeMetaHtml(bt.title)}
                  </span>
                  <span style="font-family:var(--font-mono);font-size:10px;color:#9aa4b7;">
                    ${escapeMetaHtml(sanitizeMetaCopy(bt.unlockRequirement))}
                  </span>
                </span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${isAct ? 'var(--emerald-win)' : isUnl ? 'var(--gold-bright)' : '#9aa4b7'};flex-shrink:0;">
                  ${isAct ? '✓ ON' : isUnl ? 'EQUIP' : '◇'}
                </span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. Stage & Crown HUD Themes (Dynamic Total) -->
      <div class="ws-meta-section" style="border-bottom:none;">
        <h3 class="ws-meta-section-title">3. Stage &amp; Crown HUD Themes (${unlockedThemeIds.length}/${totalThemes})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0 20px;">
          ${HUD_ACCENT_THEMES.map((th) => {
            const isUnl = unlockedThemeIds.includes(th.id);
            const isEq = equippedTheme.id === th.id;
            return `
              <button
                type="button"
                class="ws-meta-row is-interactive ${isEq ? 'is-focused' : ''}"
                data-equip-theme="${th.id}"
                ${isUnl ? '' : 'disabled'}
                style="width:100%;text-align:left;"
              >
                <span style="display:inline-flex;align-items:center;gap:9px;min-width:0;">
                  <span style="width:16px;height:16px;border-radius:50%;background:${th.primaryHex};box-shadow:0 0 0 2px ${th.secondaryHex};flex-shrink:0;"></span>
                  <span style="min-width:0;">
                    <span style="display:block;font-size:12px;font-weight:600;color:var(--ivory-primary);line-height:1.25;">${escapeMetaHtml(th.name)}</span>
                    <span style="display:block;font-family:var(--font-mono);font-size:10px;color:#9aa4b7;">${escapeMetaHtml(sanitizeMetaCopy(th.unlockRequirement))}</span>
                  </span>
                </span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${isEq ? 'var(--emerald-win)' : isUnl ? 'var(--gold-bright)' : '#9aa4b7'};flex-shrink:0;">
                  ${isEq ? '✓ ON' : isUnl ? 'EQUIP' : '◇'}
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
