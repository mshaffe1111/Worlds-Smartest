// ============================================================================
// WORLD'S SMARTEST — Meta-Progression, Career Analytics, Hall of Honours,
// 3D Intel Observatory & Prism Atelier (`src/meta`)
// Implements `docs/PITCH_BIBLE.md` §2.1, §4, §5.2 & §7.1 + Wave-3 `#166` & `#168`
// (100% Zero Pay-to-Win · Deterministic Return Stack · Live Portrait/Landscape)
// ============================================================================

export * from './DiplomaticPassportBook';
export * from './IntelObservatoryView';
export * from './PrismAtelierView';
export * from './FactionLeagueView';
export * from './CareerAnalyticsStore';
export * from './CareerAnalyticsDashboardView';
export * from './HallOfHonoursSystem';
export * from './HallOfHonoursView';
export * from './HonourToastOverlay';

import type { Stage3DDirector } from '../stage3d';
import type { CouncilTrialsGhostMode } from '../modes';
import type {
  EndingId,
  FactionId,
  HeroRelicId,
  HubId,
  InkBlackboard,
  PassportSystem,
} from '../narrative';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';

import {
  DiplomaticPassportBook,
  type MetaSuiteSectionId,
  type PassportTabId,
} from './DiplomaticPassportBook';
import {
  IntelObservatoryView,
  type ObservatoryTabId,
  type ShowcaseArtifactId,
} from './IntelObservatoryView';
import {
  PrismAtelierView,
  applyEquippedPrismFinishToStage3D,
  loadEquippedPrismFinish,
  type PrismMaterialFinishSpec,
} from './PrismAtelierView';
import { FactionLeagueView } from './FactionLeagueView';
import {
  CareerAnalyticsStore,
  type AnalyticsTimeRange,
  type CareerAnalyticsState,
  type MatchCompletedAnalyticsInput,
  type QuestionAnalyticsInput,
  type SpecialFeatKind,
} from './CareerAnalyticsStore';
import { CareerAnalyticsDashboardView } from './CareerAnalyticsDashboardView';
import {
  HallOfHonoursSystem,
  getEquippedHudTheme,
  type HonourProgressItem,
  type HonourRarityTier,
  type HudAccentThemeSpec,
} from './HallOfHonoursSystem';
import { HallOfHonoursView, type HonoursSubTab } from './HallOfHonoursView';
import { HonourToastOverlay } from './HonourToastOverlay';

export interface MetaProgressionSuiteDependencies {
  passport: PassportSystem;
  blackboard: InkBlackboard;
  stage3d?: Stage3DDirector;
  trialsMode?: CouncilTrialsGhostMode;
  audio?: StudioAudioEngine;
  haptics?: HapticsEngine;
  visaStampUrls?: Partial<Record<HubId, string>>;
  factionCrestUrls?: Partial<Record<FactionId, string>>;
}

export interface MetaProgressionSuiteCallbacks {
  onRenameChallenger?: (newName: string) => void;
  onEquipSkin?: (skinSpec: PrismMaterialFinishSpec) => void;
  onEquipBroadcastTitle?: (title: string) => void;
  onEquipHudTheme?: (theme: HudAccentThemeSpec) => void;
  onPledgeFaction?: (faction: FactionId) => void;
  onInspectRelic?: (artifactId: ShowcaseArtifactId) => void;
  onHonourUnlocked?: (items: readonly HonourProgressItem[]) => void;
  onLaunchGhostDuel?: (contenderId?: string) => void;
  onLaunchBlackSalon?: () => void;
  onCloseSuite?: () => void;
}

/**
 * Unified coordinator uniting all 6 Meta-Progression & Prestige pillars:
 *  1. `DiplomaticPassportBook` (Meridian Passport 2.0)
 *  2. `IntelObservatoryView` (360° 3D Trophy & Relic Study + Intel Flash Recall Quiz)
 *  3. `PrismAtelierView` (12 Zero-Pay-to-Win Prestige PBR Material Finishes)
 *  4. `FactionLeagueView` (World Council Factions & Async Seasonal Cup)
 *  5. `CareerAnalyticsDashboardView` (5 High-DPI Right/Wrong & ELO Trajectory Graphs)
 *  6. `HallOfHonoursView` (64 Trophies & Medals + 32 Equippable Unlockables + 24K Toasts)
 *
 * Enforces `#168` Deterministic Sub-Navigation Return Stack + Browser/Hardware Back Guard!
 */
export class MetaProgressionSuite {
  public readonly passportBook: DiplomaticPassportBook;
  public readonly observatory: IntelObservatoryView;
  public readonly atelier: PrismAtelierView;
  public readonly factions: FactionLeagueView;
  public readonly analyticsStore: CareerAnalyticsStore;
  public readonly analyticsView: CareerAnalyticsDashboardView;
  public readonly honoursSystem: HallOfHonoursSystem;
  public readonly honoursView: HallOfHonoursView;
  public readonly toastOverlay: HonourToastOverlay;

  private readonly deps: MetaProgressionSuiteDependencies;
  private callbacks: MetaProgressionSuiteCallbacks;
  private navStack: MetaSuiteSectionId[] = [];
  private currentSection: MetaSuiteSectionId | null = null;
  private historyGuardArmed = false;
  private readonly boundPopState: () => void;

  constructor(
    deps: MetaProgressionSuiteDependencies,
    callbacks: MetaProgressionSuiteCallbacks = {},
  ) {
    this.deps = deps;
    this.callbacks = callbacks;

    this.analyticsStore = new CareerAnalyticsStore(deps.passport);
    this.honoursSystem = new HallOfHonoursSystem(
      this.analyticsStore,
      deps.passport,
      deps.blackboard,
    );

    this.toastOverlay = new HonourToastOverlay({
      audio: deps.audio,
      haptics: deps.haptics,
      onInspectHonour: () => {
        this.openHonours('TROPHIES_64');
      },
    });

    this.passportBook = new DiplomaticPassportBook({
      passport: deps.passport,
      blackboard: deps.blackboard,
      audio: deps.audio,
      haptics: deps.haptics,
      visaStampUrls: deps.visaStampUrls,
    });

    this.observatory = new IntelObservatoryView({
      passport: deps.passport,
      stage3d: deps.stage3d,
      blackboard: deps.blackboard,
      audio: deps.audio,
      haptics: deps.haptics,
    });

    this.atelier = new PrismAtelierView({
      passport: deps.passport,
      stage3d: deps.stage3d,
      blackboard: deps.blackboard,
      audio: deps.audio,
      haptics: deps.haptics,
    });

    this.factions = new FactionLeagueView({
      passport: deps.passport,
      blackboard: deps.blackboard,
      trialsMode: deps.trialsMode,
      audio: deps.audio,
      haptics: deps.haptics,
      factionCrestUrls: deps.factionCrestUrls,
    });

    this.analyticsView = new CareerAnalyticsDashboardView({
      store: this.analyticsStore,
      passport: deps.passport,
      audio: deps.audio,
      haptics: deps.haptics,
    });

    this.honoursView = new HallOfHonoursView({
      honoursSystem: this.honoursSystem,
      passport: deps.passport,
      blackboard: deps.blackboard,
      stage3d: deps.stage3d,
      audio: deps.audio,
      haptics: deps.haptics,
    });

    this.boundPopState = () => {
      if (!this.isOpen()) {
        this.historyGuardArmed = false;
        return;
      }
      if (this.navStack.length > 0) {
        // Re-arm browser history guard so subsequent hardware Back presses keep unwinding stack
        this.armHistoryGuard(true);
        this.goBack();
      } else {
        this.historyGuardArmed = false;
        this.closeAll(true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.boundPopState);
    }
  }

  public dispose(): void {
    this.closeAll(false);
    this.toastOverlay.dispose();
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.boundPopState);
    }
  }

  public setCallbacks(callbacks: MetaProgressionSuiteCallbacks): void {
    this.callbacks = callbacks;
  }

  public isOpen(): boolean {
    return (
      this.passportBook.isOpen() ||
      this.observatory.isOpen() ||
      this.atelier.isOpen() ||
      this.factions.isOpen() ||
      this.analyticsView.isOpen() ||
      this.honoursView.isOpen()
    );
  }

  public canGoBack(): boolean {
    return this.navStack.length > 0;
  }

  /**
   * Unwinds one step in the sub-navigation stack (`#168` §1a), or closes the suite if at root.
   */
  public goBack(): boolean {
    const prev = this.navStack.pop();
    if (!prev) {
      this.closeAll(true);
      return false;
    }
    this.openSectionInternal(prev, false);
    return true;
  }

  private armHistoryGuard(forcePush = false): void {
    if (typeof window === 'undefined' || !window.history?.pushState) return;
    if (!this.historyGuardArmed || forcePush) {
      try {
        window.history.pushState({ __wsMetaSuite: true }, '');
        this.historyGuardArmed = true;
      } catch {
        // Ignore sandboxed history errors
      }
    }
  }

  private prepareTransitionTo(target: MetaSuiteSectionId, recordHistory: boolean): void {
    const wasOpen = this.isOpen();
    if (recordHistory && wasOpen && this.currentSection && this.currentSection !== target) {
      if (this.navStack[this.navStack.length - 1] !== this.currentSection) {
        this.navStack.push(this.currentSection);
        if (this.navStack.length > 16) {
          this.navStack.shift();
        }
      }
    } else if (!wasOpen) {
      this.navStack = [];
      this.historyGuardArmed = false;
    }
    this.armHistoryGuard(false);
    this.closeViewsOnly();
    this.currentSection = target;
  }

  private sync3DShowcaseClass(is3DShowcase: boolean): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('ws-3d-showcase-open', is3DShowcase);
  }

  private resetSuiteNavigationState(fireCloseCallback = false): void {
    this.navStack = [];
    this.currentSection = null;
    this.historyGuardArmed = false;
    this.sync3DShowcaseClass(false);
    if (fireCloseCallback) {
      this.callbacks.onCloseSuite?.();
    }
  }

  private closeViewsOnly(): void {
    this.passportBook.close();
    this.observatory.close();
    this.atelier.close();
    this.factions.close();
    this.analyticsView.close();
    this.honoursView.close();
  }

  public closeAll(fireCloseCallback = false): void {
    this.closeViewsOnly();
    this.resetSuiteNavigationState(fireCloseCallback);
  }

  public openSection(section: MetaSuiteSectionId): void {
    this.openSectionInternal(section, true);
  }

  private openSectionInternal(section: MetaSuiteSectionId, recordHistory: boolean): void {
    switch (section) {
      case 'PASSPORT':
        this.openPassport('CREDENTIALS', false, recordHistory);
        break;
      case 'OBSERVATORY':
        this.openObservatory('RELICS_3D', 'championship_trophy', recordHistory);
        break;
      case 'ATELIER':
        this.openAtelier(recordHistory);
        break;
      case 'FACTIONS':
        this.openFactions(recordHistory);
        break;
      case 'ANALYTICS':
        this.openAnalytics('ALL_TIME', recordHistory);
        break;
      case 'HONOURS':
        this.openHonours('TROPHIES_64', 'ALL', recordHistory);
        break;
    }
  }

  public openPassport(
    initialTab: PassportTabId = 'CREDENTIALS',
    playStampCeremonyOnOpen = false,
    recordHistory = true,
  ): void {
    this.prepareTransitionTo('PASSPORT', recordHistory);
    if (playStampCeremonyOnOpen) {
      this.recordSpecialFeat('PASSPORT_STAMPED');
    }
    this.passportBook.open({
      initialTab,
      playStampCeremonyOnOpen,
      canGoBack: this.canGoBack(),
      onBack: () => {
        this.goBack();
      },
      onPassportStamped: () => {
        this.recordSpecialFeat('PASSPORT_STAMPED');
      },
      onRenameChallenger: (name) => {
        this.recordSpecialFeat('PASSPORT_STAMPED');
        this.callbacks.onRenameChallenger?.(name);
      },
      onInspectRelicInObservatory: (relicId: HeroRelicId | 'championship_trophy') =>
        this.openObservatory('RELICS_3D', relicId, true),
      onNavigateSection: (sec) => this.openSection(sec),
      onClose: () => {
        this.resetSuiteNavigationState(true);
      },
    });
  }

  public openObservatory(
    initialTab: ObservatoryTabId = 'RELICS_3D',
    initialArtifactId: ShowcaseArtifactId = 'championship_trophy',
    recordHistory = true,
  ): void {
    this.prepareTransitionTo('OBSERVATORY', recordHistory);
    this.sync3DShowcaseClass(initialTab === 'RELICS_3D');
    this.observatory.open({
      initialTab,
      initialArtifactId,
      canGoBack: this.canGoBack(),
      onBack: () => {
        this.goBack();
      },
      onInspectRelic: (id) => this.callbacks.onInspectRelic?.(id),
      onUvScan: (artifactId) => {
        this.recordSpecialFeat('UV_RELIC_SCANNED', { relicId: artifactId });
      },
      onLatchesOpened: (artifactId) => {
        if (artifactId !== 'championship_trophy') {
          this.recordSpecialFeat('RELIC_LATCH_OPENED', {
            relicId: artifactId,
            latchCount: 3,
          });
        }
      },
      onNavigateSection: (sec) => this.openSection(sec),
      onClose: () => {
        this.resetSuiteNavigationState(true);
      },
    });
  }

  public openAtelier(recordHistory = true): void {
    this.prepareTransitionTo('ATELIER', recordHistory);
    this.sync3DShowcaseClass(true);
    this.atelier.open({
      canGoBack: this.canGoBack(),
      onBack: () => {
        this.goBack();
      },
      onEquipSkin: (skin) => {
        this.recordSpecialFeat('ATELIER_SKIN_EQUIPPED');
        this.callbacks.onEquipSkin?.(skin);
      },
      onNavigateSection: (sec) => this.openSection(sec),
      onClose: () => {
        this.resetSuiteNavigationState(true);
      },
    });
  }

  public openFactions(recordHistory = true): void {
    this.prepareTransitionTo('FACTIONS', recordHistory);
    this.sync3DShowcaseClass(false);
    this.factions.open({
      canGoBack: this.canGoBack(),
      onBack: () => {
        this.goBack();
      },
      onPledgeFaction: (f) => {
        this.recordSpecialFeat('FACTION_PLEDGED');
        this.callbacks.onPledgeFaction?.(f);
      },
      onLaunchGhostDuel: (cid) => {
        this.resetSuiteNavigationState(false);
        this.callbacks.onLaunchGhostDuel?.(cid);
      },
      onLaunchBlackSalon: () => {
        this.resetSuiteNavigationState(false);
        this.callbacks.onLaunchBlackSalon?.();
      },
      onNavigateSection: (sec) => this.openSection(sec),
      onClose: () => {
        this.resetSuiteNavigationState(true);
      },
    });
  }

  public openAnalytics(
    initialRange: AnalyticsTimeRange = 'ALL_TIME',
    recordHistory = true,
  ): void {
    this.prepareTransitionTo('ANALYTICS', recordHistory);
    this.sync3DShowcaseClass(false);
    this.analyticsView.open({
      initialRange,
      canGoBack: this.canGoBack(),
      onBack: () => {
        this.goBack();
      },
      onNavigateSection: (sec) => this.openSection(sec),
      onClose: () => {
        this.resetSuiteNavigationState(true);
      },
    });
  }

  public openHonours(
    initialTab: HonoursSubTab = 'TROPHIES_64',
    initialTierFilter: HonourRarityTier | 'ALL' = 'ALL',
    recordHistory = true,
  ): void {
    this.prepareTransitionTo('HONOURS', recordHistory);
    this.sync3DShowcaseClass(false);
    this.honoursView.open({
      initialTab,
      initialTierFilter,
      canGoBack: this.canGoBack(),
      onBack: () => {
        this.goBack();
      },
      onEquipSkin: (skin) => {
        this.recordSpecialFeat('ATELIER_SKIN_EQUIPPED');
        this.callbacks.onEquipSkin?.(skin);
      },
      onEquipBroadcastTitle: (title) => {
        this.callbacks.onEquipBroadcastTitle?.(title);
      },
      onEquipHudTheme: (theme) => {
        this.callbacks.onEquipHudTheme?.(theme);
      },
      onNavigateSection: (sec) => this.openSection(sec),
      onClose: () => {
        this.resetSuiteNavigationState(true);
      },
    });
  }

  /**
   * Evaluates all 64 Trophies & Medals and pops the non-blocking 24K Gold Citation Toast
   * for any newly earned Honours + 32 Unlockables (`#166` §2.2 & §3).
   */
  public evaluateHonoursAndToast(): HonourProgressItem[] {
    const unlocked = this.honoursSystem.evaluateAndUnlock(false);
    if (unlocked.length > 0) {
      this.toastOverlay.enqueue(unlocked);
      this.callbacks.onHonourUnlocked?.(unlocked);
    }
    return unlocked;
  }

  /**
   * Records a resolved question into `CareerAnalyticsStore` (`ws_career_analytics_v1`)
   * and evaluates all 64 Trophies & Medals live!
   */
  public recordQuestionOutcome(input: QuestionAnalyticsInput): HonourProgressItem[] {
    this.analyticsStore.recordQuestionOutcome(input);
    return this.evaluateHonoursAndToast();
  }

  /**
   * Records a completed match/session into `CareerAnalyticsStore` and evaluates all 64 Honours!
   */
  public recordMatchCompleted(input: MatchCompletedAnalyticsInput): HonourProgressItem[] {
    this.analyticsStore.recordMatchCompleted(input);
    return this.evaluateHonoursAndToast();
  }

  /**
   * Records a narrative, forensic, or bluff feat and evaluates all 64 Honours!
   */
  public recordSpecialFeat(
    kind: SpecialFeatKind,
    detail?: { relicId?: string; latchCount?: number; endingId?: EndingId; depth?: number },
  ): HonourProgressItem[] {
    this.analyticsStore.recordSpecialFeat(kind, detail);
    return this.evaluateHonoursAndToast();
  }

  public getAnalyticsSnapshot(): CareerAnalyticsState {
    return this.analyticsStore.getSnapshot();
  }

  public getEquippedHudAccentTheme(): HudAccentThemeSpec {
    return getEquippedHudTheme();
  }

  /**
   * Re-applies the player's currently equipped Prism Atelier PBR finish onto `Stage3DDirector`.
   */
  public applyEquippedFinish(): PrismMaterialFinishSpec {
    if (this.deps.stage3d) {
      return applyEquippedPrismFinishToStage3D(this.deps.stage3d);
    }
    return loadEquippedPrismFinish();
  }
}
