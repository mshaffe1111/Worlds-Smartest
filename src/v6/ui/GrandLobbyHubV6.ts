// ============================================================================
// WORLD'S SMARTEST v6.0 — Grand Lobby Hub & 10-Stage World Tour Carousel
// Transparent Proscenium Framing · Machined Brass-and-Glass Action Plates
// Zero-Scroll Mobile Budget (360x560, 390x660, 660x340, 844x390+)
// ============================================================================

import type {
  BroadcastOptionsStateV6,
  FoleySfxIdV6,
  StageAtmosphereThemeV6,
  StageWorldIdV6,
  SymphonyTrackIdV6,
} from '../contracts_v6';

export type LobbyActionIdV6 =
  | 'CAMPAIGN_ROAD'
  | 'QUICK_SHOW_100'
  | 'TRAPDOOR_GAUNTLET'
  | 'PROP_TRUNK'
  | 'TROPHY_VAULT'
  | 'OPTIONS_CONSOLE';

export interface StageEpisodeDescriptorV6 {
  episodeNumber: number; // 1 .. 20
  kind: 'VENUE_SHOWCASE' | 'TITLE_BOUT';
  title: string;
  boardTag: string;
}

export interface StageWorldSummaryV6 {
  stageId: StageWorldIdV6;
  stageNumber: number; // 1 .. 10
  title: string;
  eraSubtitle: string;
  difficultyBand: [number, number];
  symphonyTrack: SymphonyTrackIdV6;
  symphonyTitle: string;
  crestSvgMarkup: string; // Pure geometric vector strokes (zero SVG text nodes)
  episodes: [StageEpisodeDescriptorV6, StageEpisodeDescriptorV6];
  hudTheme: StageAtmosphereThemeV6['hudTheme'];
}

export interface GrandLobbyTelemetryV6 {
  bankrollCash: number;
  currentEpisode: number; // 1 .. 20
  completedEpisodes: number; // 0 .. 20
  unlockedStages: number; // 1 .. 10
  earnedHonorCount: number; // 0 .. 36
  pinnedMedalCount: number; // 0 .. 3
}

export interface GrandLobbyHubCallbacksV6 {
  onSelectAction: (action: LobbyActionIdV6) => void;
  onLaunchEpisode: (stageId: StageWorldIdV6, episodeNumber: number) => void;
  onPreviewStageWorld?: (stageId: StageWorldIdV6) => void;
  onToggleSymphony?: (enabled: boolean) => void;
  onToggleFullscreen?: (isFullscreen: boolean) => void;
  onPlayFoley?: (sfxId: FoleySfxIdV6) => void;
}

export interface GrandLobbyHubConfigV6 {
  activeStageId?: StageWorldIdV6;
  symphonyEnabled?: boolean;
  telemetry?: Partial<GrandLobbyTelemetryV6>;
  stageThemesOverride?: ReadonlyArray<StageAtmosphereThemeV6>;
  optionsState?: Partial<BroadcastOptionsStateV6>;
  callbacks: GrandLobbyHubCallbacksV6;
}

// ----------------------------------------------------------------------------
// 10 Distinct Architectural Stage Worlds + 20 Campaign Episodes (Venue -> Bout)
// ----------------------------------------------------------------------------
export const STAGE_WORLD_PRESETS_V6: readonly StageWorldSummaryV6[] = [
  {
    stageId: 'STAGE_01_VAUDEVILLE_PALACE',
    stageNumber: 1,
    title: 'Vaudeville Palace',
    eraSubtitle: '1928 Broadway Mahogany, Crimson Velvet & Edison Brass',
    difficultyBand: [1.0, 1.9],
    symphonyTrack: 'curtain_overture',
    symphonyTitle: 'Curtain Overture in D Major',
    crestSvgMarkup:
      '<path d="M4 20h16M6 20V10a6 6 0 0 1 12 0v10"/><path d="M9 20v-7a3 3 0 0 1 6 0v7"/><circle cx="12" cy="7" r="1.2"/>',
    episodes: [
      {
        episodeNumber: 1,
        kind: 'VENUE_SHOWCASE',
        title: 'Opening Night Curtain Call',
        boardTag: 'CLOCKWORK ORRERY',
      },
      {
        episodeNumber: 2,
        kind: 'TITLE_BOUT',
        title: 'Marquee Headliner Bout',
        boardTag: 'REVOLVING STAGE',
      },
    ],
    hudTheme: {
      surfaceCss: 'rgba(26, 11, 14, 0.91)',
      borderCss: '#d8a547',
      accentCss: '#f5cd75',
      badgeBgCss: '#4c101e',
      badgeTextCss: '#fff5df',
      fontHeadingFamily: "'Cinzel', Georgia, serif",
    },
  },
  {
    stageId: 'STAGE_02_GENEVA_CONSERVATORY',
    stageNumber: 2,
    title: 'Geneva Conservatory',
    eraSubtitle: 'Carrara Marble, Rose-Gold Horology Gears & Sunlit Glass',
    difficultyBand: [2.0, 2.9],
    symphonyTrack: 'geneva_horology',
    symphonyTitle: 'Swiss Conservatory Scherzo',
    crestSvgMarkup:
      '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"/>',
    episodes: [
      {
        episodeNumber: 3,
        kind: 'VENUE_SHOWCASE',
        title: 'Escapement Calibration',
        boardTag: 'TOURBILLON ESCAPEMENT',
      },
      {
        episodeNumber: 4,
        kind: 'TITLE_BOUT',
        title: 'Master Horologist Duel',
        boardTag: 'MIDNIGHT CARILLON',
      },
    ],
    hudTheme: {
      surfaceCss: 'rgba(22, 19, 23, 0.9)',
      borderCss: '#d49a89',
      accentCss: '#f4c5b5',
      badgeBgCss: '#3f2428',
      badgeTextCss: '#fff6f0',
      fontHeadingFamily: "'Cinzel', Georgia, serif",
    },
  },
  {
    stageId: 'STAGE_03_MONTE_CARLO_SALON',
    stageNumber: 3,
    title: 'Monte Carlo Salon',
    eraSubtitle: '1962 Riviera Emerald Felt, Walnut Burl & Crystal',
    difficultyBand: [3.0, 3.9],
    symphonyTrack: 'riviera_caprice',
    symphonyTitle: 'Riviera High-Limit Caprice',
    crestSvgMarkup:
      '<path d="M12 3l7 9-7 9-7-9 7-9z"/><path d="M12 7.5l3.5 4.5-3.5 4.5-3.5-4.5 3.5-4.5z"/>',
    episodes: [
      {
        episodeNumber: 5,
        kind: 'VENUE_SHOWCASE',
        title: 'Emerald Felt Warm-Up',
        boardTag: 'BLACKJACK 21 FELT',
      },
      {
        episodeNumber: 6,
        kind: 'TITLE_BOUT',
        title: 'Riviera High-Roller Bout',
        boardTag: 'VIP HIGH-LIMIT TABLE',
      },
    ],
    hudTheme: {
      surfaceCss: 'rgba(9, 24, 20, 0.91)',
      borderCss: '#cfa852',
      accentCss: '#52e0aa',
      badgeBgCss: '#0c3f30',
      badgeTextCss: '#e8fff5',
      fontHeadingFamily: "'Cinzel', Georgia, serif",
    },
  },
  {
    stageId: 'STAGE_04_CARTOGRAPHIC_ROTUNDA',
    stageNumber: 4,
    title: 'Cartographic Rotunda',
    eraSubtitle: "Explorer's Teak Deck, Verdigris Copper & Sapphire Globes",
    difficultyBand: [4.0, 4.9],
    symphonyTrack: 'explorer_odyssey',
    symphonyTitle: 'Meridian Horns & Strings Odyssey',
    crestSvgMarkup:
      '<circle cx="12" cy="12" r="8"/><path d="M12 4l2.2 5.8L20 12l-5.8 2.2L12 20l-2.2-5.8L4 12l5.8-2.2L12 4z"/><circle cx="12" cy="12" r="1.4"/>',
    episodes: [
      {
        episodeNumber: 7,
        kind: 'VENUE_SHOWCASE',
        title: 'Prime Meridian Survey',
        boardTag: 'ATLAS EXPEDITION',
      },
      {
        episodeNumber: 8,
        kind: 'TITLE_BOUT',
        title: 'Royal Geographer Bout',
        boardTag: 'COMPASS GYROSCOPE',
      },
    ],
    hudTheme: {
      surfaceCss: 'rgba(11, 21, 28, 0.91)',
      borderCss: '#65b4a7',
      accentCss: '#8ce3d5',
      badgeBgCss: '#143845',
      badgeTextCss: '#ebfcff',
      fontHeadingFamily: "'Cinzel', Georgia, serif",
    },
  },
  {
    stageId: 'STAGE_05_ANALOG_BUNKER_1969',
    stageNumber: 5,
    title: 'Analog Bunker 1969',
    eraSubtitle: 'Cold-War Olive Steel, Orange Nixie Tubes & Phosphor Radar',
    difficultyBand: [5.0, 5.9],
    symphonyTrack: 'bunker_espionage',
    symphonyTitle: 'Classified 1969 Espionage Fugue',
    crestSvgMarkup:
      '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 3.5V12l6 4M3.5 12h17"/>',
    episodes: [
      {
        episodeNumber: 9,
        kind: 'VENUE_SHOWCASE',
        title: 'Sub-Level Radar Sweep',
        boardTag: 'SONAR PHOSPHOR SWEEP',
      },
      {
        episodeNumber: 10,
        kind: 'TITLE_BOUT',
        title: 'Cipher Clearance Bout',
        boardTag: 'LASER MIRROR VAULT',
      },
    ],
    hudTheme: {
      surfaceCss: 'rgba(17, 20, 14, 0.93)',
      borderCss: '#d9843b',
      accentCss: '#ff9d3b',
      badgeBgCss: '#3b240c',
      badgeTextCss: '#ffedd6',
      fontHeadingFamily: "'JetBrains Mono', monospace",
    },
  },
  {
    stageId: 'STAGE_06_KYOTO_LACQUER_PAVILION',
    stageNumber: 6,
    title: 'Kyoto Lacquer Pavilion',
    eraSubtitle: 'Vermilion & Black Urushi Lacquer, Kintsugi Gold & Lanterns',
    difficultyBand: [6.0, 6.9],
    symphonyTrack: 'kyoto_nocturne',
    symphonyTitle: 'Moonlit Urushi Nocturne Presto',
    crestSvgMarkup:
      '<path d="M3.5 7.5c5.5 1.2 11.5 1.2 17 0M5.5 11.5h13M8 8v12M16 8v12M10.5 11.5v8.5M13.5 11.5v8.5"/>',
    episodes: [
      {
        episodeNumber: 11,
        kind: 'VENUE_SHOWCASE',
        title: 'Golden Seam Ceremony',
        boardTag: 'KINTSUGI GO-WEB',
      },
      {
        episodeNumber: 12,
        kind: 'TITLE_BOUT',
        title: 'Lantern Bridge Title Bout',
        boardTag: 'DOMINO CHAIN PAVILION',
      },
    ],
    hudTheme: {
      surfaceCss: 'rgba(22, 10, 11, 0.92)',
      borderCss: '#e0533c',
      accentCss: '#f6c864',
      badgeBgCss: '#4c1210',
      badgeTextCss: '#fff4e3',
      fontHeadingFamily: "'Cinzel', Georgia, serif",
    },
  },
  {
    stageId: 'STAGE_07_CARNIVAL_CURIOSITIES',
    stageNumber: 7,
    title: 'Carnival of Curiosities',
    eraSubtitle: 'Midnight Pier Timber, Copper Pinball & Calliope Fog',
    difficultyBand: [7.0, 7.9],
    symphonyTrack: 'carnival_accelerando',
    symphonyTitle: 'Midnight Pier Accelerando',
    crestSvgMarkup:
      '<circle cx="12" cy="11" r="7"/><circle cx="12" cy="11" r="2"/><path d="M12 4v14M5 11h14M7 6l10 10M17 6L7 16M8 20l4-4 4 4"/>',
    episodes: [
      {
        episodeNumber: 13,
        kind: 'VENUE_SHOWCASE',
        title: 'Boardwalk Bumper Trials',
        boardTag: 'PINBALL BUMPER DROP',
      },
      {
        episodeNumber: 14,
        kind: 'TITLE_BOUT',
        title: 'Ringmaster Showdown Bout',
        boardTag: 'CARNIVAL GALLERY',
      },
    ],
    hudTheme: {
      surfaceCss: 'rgba(18, 13, 25, 0.92)',
      borderCss: '#d98952',
      accentCss: '#ffbc6b',
      badgeBgCss: '#3c1e3a',
      badgeTextCss: '#fff3e6',
      fontHeadingFamily: "'Cinzel', Georgia, serif",
    },
  },
  {
    stageId: 'STAGE_08_SUNKEN_BATHYSPHERE',
    stageNumber: 8,
    title: 'Sunken Bathysphere',
    eraSubtitle: 'Volcanic Basalt, Riveted Bronze Portholes & Caustics',
    difficultyBand: [8.0, 8.5],
    symphonyTrack: 'bathysphere_cathedral',
    symphonyTitle: 'Abyssal Basalt Deep Chorale',
    crestSvgMarkup:
      '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><path d="M8.5 13.5c1.2-1 2.3-1 3.5 0s2.3 1 3.5 0M12 3.5v1.5M12 19v1.5M3.5 12H5M19 12h1.5"/>',
    episodes: [
      {
        episodeNumber: 15,
        kind: 'VENUE_SHOWCASE',
        title: 'Hadal Airlock Descent',
        boardTag: 'PRESSURE AIRLOCKS',
      },
      {
        episodeNumber: 16,
        kind: 'TITLE_BOUT',
        title: 'Abyssal Pressure Bout',
        boardTag: 'RISING FLOOD STAGE',
      },
    ],
    hudTheme: {
      surfaceCss: 'rgba(8, 18, 26, 0.93)',
      borderCss: '#b6864f',
      accentCss: '#5ed9f5',
      badgeBgCss: '#0c2f44',
      badgeTextCss: '#e5faff',
      fontHeadingFamily: "'Cinzel', Georgia, serif",
    },
  },
  {
    stageId: 'STAGE_09_ASTRAL_OBSERVATORY',
    stageNumber: 9,
    title: 'Astral Observatory',
    eraSubtitle: 'Open Copper Telescope Dome, Alabaster & Live Aurora',
    difficultyBand: [8.6, 9.2],
    symphonyTrack: 'astral_storm_presto',
    symphonyTitle: 'Aurora Prism Storm Presto',
    crestSvgMarkup:
      '<path d="M12 3l2.4 6.2L21 12l-6.6 2.8L12 21l-2.4-6.2L3 12l6.6-2.8L12 3z"/><circle cx="12" cy="12" r="2.2"/><path d="M4.5 19.5A11 11 0 0 1 19.5 4.5"/>',
    episodes: [
      {
        episodeNumber: 17,
        kind: 'VENUE_SHOWCASE',
        title: 'Celestial Prism Alignment',
        boardTag: 'ASTRAL CONSTELLATION',
      },
      {
        episodeNumber: 18,
        kind: 'TITLE_BOUT',
        title: 'Zenith Equinox Bout',
        boardTag: 'PRISM SPLITTER',
      },
    ],
    hudTheme: {
      surfaceCss: 'rgba(13, 13, 28, 0.92)',
      borderCss: '#9d8df2',
      accentCss: '#74f0d1',
      badgeBgCss: '#231d4d',
      badgeTextCss: '#eff5ff',
      fontHeadingFamily: "'Cinzel', Georgia, serif",
    },
  },
  {
    stageId: 'STAGE_10_SOVEREIGN_COLOSSEUM',
    stageNumber: 10,
    title: 'Sovereign Colosseum',
    eraSubtitle: 'Veined Nero Marble, Live Fire Braziers & 24K Gold Altar',
    difficultyBand: [9.3, 10.0],
    symphonyTrack: 'colosseum_finale',
    symphonyTitle: 'Sovereign Colosseum Finale',
    crestSvgMarkup:
      '<path d="M4 18l1.6-9.5L9.5 12 12 5.5 14.5 12l3.9-3.5L20 18H4z"/><path d="M4 20h16"/>',
    episodes: [
      {
        episodeNumber: 19,
        kind: 'VENUE_SHOWCASE',
        title: 'Braziers of the Semi-Final',
        boardTag: 'SPLIT OR STEAL ARENA',
      },
      {
        episodeNumber: 20,
        kind: 'TITLE_BOUT',
        title: 'The World Sovereign Crown',
        boardTag: 'COLOSSEUM ALTAR',
      },
    ],
    hudTheme: {
      surfaceCss: 'rgba(16, 12, 10, 0.94)',
      borderCss: '#f0c250',
      accentCss: '#ffe082',
      badgeBgCss: '#422c07',
      badgeTextCss: '#fff7de',
      fontHeadingFamily: "'Cinzel', Georgia, serif",
    },
  },
];

/**
 * Applies StageAtmosphereThemeV6.hudTheme CSS custom properties cleanly to a root element.
 */
export function applyStageHudThemeToRootV6(
  rootEl: HTMLElement,
  hudTheme: StageAtmosphereThemeV6['hudTheme'],
): void {
  rootEl.style.setProperty('--v6-stage-surface', hudTheme.surfaceCss);
  rootEl.style.setProperty('--v6-stage-border', hudTheme.borderCss);
  rootEl.style.setProperty('--v6-stage-accent', hudTheme.accentCss);
  rootEl.style.setProperty('--v6-stage-badge-bg', hudTheme.badgeBgCss);
  rootEl.style.setProperty('--v6-stage-badge-text', hudTheme.badgeTextCss);
  rootEl.style.setProperty('--v6-stage-font-heading', hudTheme.fontHeadingFamily);
}

// Pure Geometric Icon Markup (zero SVG text nodes, zero OS emojis)
const ICONS = {
  crown:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18l2-10 4.5 4L12 5l2.5 7L19 8l2 10H3z"/><path d="M4 20.5h16"/></svg>',
  board:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/></svg>',
  trapdoor:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="M12 6v12M8 12l-2-1.5M16 12l2-1.5"/></svg>',
  trunk:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="12" rx="1.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></svg>',
  trophy:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v5M8 19h8"/></svg>',
  console:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v16M12 4v16M18 4v16"/><rect x="4" y="8" width="4" height="3"/><rect x="10" y="13" width="4" height="3"/><rect x="16" y="6" width="4" height="3"/></svg>',
  globe:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></svg>',
  fullscreen:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  note:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>',
  chevronLeft:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  chevronRight:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  close:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

function formatCurrency(cash: number): string {
  return '$' + Math.max(0, Math.round(cash)).toLocaleString('en-US');
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export class GrandLobbyHubV6 {
  private readonly callbacks: GrandLobbyHubCallbacksV6;
  private readonly worlds: StageWorldSummaryV6[];

  private mountParent: HTMLElement | null = null;
  private rootEl: HTMLElement | null = null;
  private drawerBackdropEl: HTMLElement | null = null;

  private activeStageIndex = 0;
  private carouselStageIndex = 0;
  private symphonyEnabled = true;
  private isFullscreen = false;
  private drawerOpen = false;
  private visible = true;

  private telemetry: GrandLobbyTelemetryV6 = {
    bankrollCash: 1250,
    currentEpisode: 1,
    completedEpisodes: 0,
    unlockedStages: 10,
    earnedHonorCount: 0,
    pinnedMedalCount: 0,
  };

  // Cached interactive elements for zero-flicker live updates
  private symphonyBtn: HTMLButtonElement | null = null;
  private symphonyLed: HTMLElement | null = null;
  private symphonyText: HTMLElement | null = null;
  private stagePillBtn: HTMLButtonElement | null = null;
  private stagePillLabel: HTMLElement | null = null;
  private fullscreenBtn: HTMLButtonElement | null = null;
  private fullscreenLabel: HTMLElement | null = null;
  private stageRibbonEl: HTMLElement | null = null;
  private bankrollValueEl: HTMLElement | null = null;
  private episodeValueEl: HTMLElement | null = null;
  private honorValueEl: HTMLElement | null = null;
  private campaignSubEl: HTMLElement | null = null;
  private honorTagEl: HTMLElement | null = null;

  // Carousel Drawer dynamic elements
  private drawerCrestEl: HTMLElement | null = null;
  private drawerKickerEl: HTMLElement | null = null;
  private drawerNameEl: HTMLElement | null = null;
  private drawerEraEl: HTMLElement | null = null;
  private drawerSymphonyEl: HTMLElement | null = null;
  private drawerEpisodesEl: HTMLElement | null = null;
  private drawerPipBtns: HTMLButtonElement[] = [];

  private swipeStartX: number | null = null;
  private readonly boundFullscreenHandler: () => void;
  private readonly boundKeydownHandler: (e: KeyboardEvent) => void;

  constructor(config: GrandLobbyHubConfigV6) {
    this.callbacks = config.callbacks;
    this.symphonyEnabled = config.symphonyEnabled ?? true;

    const themeByStage = new Map<StageWorldIdV6, StageAtmosphereThemeV6>();
    if (config.stageThemesOverride) {
      for (const theme of config.stageThemesOverride) {
        themeByStage.set(theme.stageId, theme);
      }
    }

    this.worlds = STAGE_WORLD_PRESETS_V6.map((preset) => {
      const override = themeByStage.get(preset.stageId);
      if (!override) return preset;
      return {
        ...preset,
        title: override.title || preset.title,
        eraSubtitle: override.eraSubtitle || preset.eraSubtitle,
        difficultyBand: override.difficultyBand || preset.difficultyBand,
        symphonyTrack: override.symphonyTrack || preset.symphonyTrack,
        hudTheme: override.hudTheme || preset.hudTheme,
      };
    });

    if (config.activeStageId) {
      const idx = this.worlds.findIndex((w) => w.stageId === config.activeStageId);
      if (idx >= 0) {
        this.activeStageIndex = idx;
        this.carouselStageIndex = idx;
      }
    }

    if (config.telemetry) {
      this.telemetry = { ...this.telemetry, ...config.telemetry };
    }

    this.boundFullscreenHandler = () => {
      this.isFullscreen = Boolean(document.fullscreenElement);
      this.syncTopbar();
      this.callbacks.onToggleFullscreen?.(this.isFullscreen);
    };

    this.boundKeydownHandler = (e: KeyboardEvent) => {
      if (!this.visible || !this.drawerOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        this.openWorldCarousel(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.stepCarousel(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.stepCarousel(1);
      }
    };
  }

  public mount(parent: HTMLElement): void {
    this.dispose();
    this.mountParent = parent;
    parent.classList.add('v6-ultrahd-root');

    const screen = document.createElement('section');
    screen.className = 'v6-screen v6-hub-screen';
    screen.setAttribute('aria-label', "World's Smartest v6.0 Grand Lobby");
    this.rootEl = screen;

    // 1) Top Utility Rail + Proscenium Marquee Header
    const headerBlock = document.createElement('header');
    headerBlock.className = 'v6-hub-header-block';

    const topbar = document.createElement('div');
    topbar.className = 'v6-topbar';

    const leftGroup = document.createElement('div');
    leftGroup.className = 'v6-topbar-group';

    // Pill 1: LIVE SYMPHONY: ON/OFF
    this.symphonyBtn = document.createElement('button');
    this.symphonyBtn.type = 'button';
    this.symphonyBtn.className = 'v6-hardware-pill';
    this.symphonyLed = document.createElement('span');
    this.symphonyLed.className = 'v6-led-jewel';
    this.symphonyText = document.createElement('span');
    this.symphonyBtn.append(this.symphonyLed, this.symphonyText);
    this.symphonyBtn.addEventListener('click', () => {
      this.symphonyEnabled = !this.symphonyEnabled;
      this.playFoley('ui_brass_tap');
      this.syncTopbar();
      this.callbacks.onToggleSymphony?.(this.symphonyEnabled);
    });

    // Pill 2: STAGE WORLD 01/10 (opens carousel drawer)
    this.stagePillBtn = document.createElement('button');
    this.stagePillBtn.type = 'button';
    this.stagePillBtn.className = 'v6-hardware-pill is-active';
    const globeWrap = document.createElement('span');
    globeWrap.innerHTML = ICONS.globe;
    this.stagePillLabel = document.createElement('span');
    this.stagePillBtn.append(globeWrap, this.stagePillLabel);
    this.stagePillBtn.addEventListener('click', () => {
      this.playFoley('brass_gear_detent');
      this.openWorldCarousel(!this.drawerOpen);
    });

    leftGroup.append(this.symphonyBtn, this.stagePillBtn);

    const rightGroup = document.createElement('div');
    rightGroup.className = 'v6-topbar-group';

    // Pill 3: FULLSCREEN
    this.fullscreenBtn = document.createElement('button');
    this.fullscreenBtn.type = 'button';
    this.fullscreenBtn.className = 'v6-hardware-pill';
    const fsIcon = document.createElement('span');
    fsIcon.innerHTML = ICONS.fullscreen;
    this.fullscreenLabel = document.createElement('span');
    this.fullscreenBtn.append(fsIcon, this.fullscreenLabel);
    this.fullscreenBtn.addEventListener('click', () => {
      this.playFoley('ui_brass_tap');
      void this.toggleFullscreen();
    });

    rightGroup.append(this.fullscreenBtn);
    topbar.append(leftGroup, rightGroup);

    // Floating Razor-Sharp Serif Proscenium Wordmark (no card box!)
    const marquee = document.createElement('div');
    marquee.className = 'v6-hub-marquee';
    const eyebrow = document.createElement('div');
    eyebrow.className = 'v6-hub-eyebrow';
    eyebrow.textContent = 'SEASON VI · ULTRA-HD BROADCAST STAGE';
    const wordmark = document.createElement('h1');
    wordmark.className = 'v6-hub-wordmark';
    wordmark.textContent = "WORLD'S SMARTEST";
    this.stageRibbonEl = document.createElement('div');
    this.stageRibbonEl.className = 'v6-hub-stage-ribbon';
    marquee.append(eyebrow, wordmark, this.stageRibbonEl);

    headerBlock.append(topbar, marquee);

    // 2) Open Center Proscenium Aperture (lets the 3D world breathe!)
    const aperture = document.createElement('div');
    aperture.className = 'v6-hub-stage-aperture';

    // 3) Bottom Machined Brass-and-Glass Action Deck
    const deck = document.createElement('nav');
    deck.className = 'v6-hub-deck';
    deck.setAttribute('aria-label', 'Main Stage Controls');

    // Slim Career Telemetry Strip
    const telemetryStrip = document.createElement('div');
    telemetryStrip.className = 'v6-hub-telemetry-strip';

    const bankItem = document.createElement('span');
    bankItem.className = 'v6-hub-telemetry-item';
    bankItem.append('PURSE ');
    this.bankrollValueEl = document.createElement('strong');
    this.bankrollValueEl.className = 'v6-tabular';
    bankItem.append(this.bankrollValueEl);

    const epItem = document.createElement('span');
    epItem.className = 'v6-hub-telemetry-item';
    epItem.append('TOUR ');
    this.episodeValueEl = document.createElement('strong');
    this.episodeValueEl.className = 'v6-tabular';
    epItem.append(this.episodeValueEl);

    const honorItem = document.createElement('span');
    honorItem.className = 'v6-hub-telemetry-item';
    honorItem.append('HONORS ');
    this.honorValueEl = document.createElement('strong');
    this.honorValueEl.className = 'v6-tabular';
    honorItem.append(this.honorValueEl);

    telemetryStrip.append(bankItem, epItem, honorItem);

    // 6 Machined Brass-and-Glass Plates
    const grid = document.createElement('div');
    grid.className = 'v6-hub-actions-grid';

    const heroPlate = this.createActionPlate({
      action: 'CAMPAIGN_ROAD',
      title: 'CAMPAIGN ROAD • 20 EPISODES',
      subtitle: 'EP 01 · OPENING NIGHT CURTAIN CALL',
      tag: 'PLAY',
      iconSvg: ICONS.crown,
      hero: true,
    });
    this.campaignSubEl = heroPlate.querySelector('.v6-plate-sub');

    const quickShowPlate = this.createActionPlate({
      action: 'QUICK_SHOW_100',
      title: '100-BOARD QUICK SHOW',
      subtitle: 'ANY CONTRAPTION · INSTANT SHOW',
      tag: '100',
      iconSvg: ICONS.board,
    });

    const trapdoorPlate = this.createActionPlate({
      action: 'TRAPDOOR_GAUNTLET',
      title: 'TRAPDOOR GAUNTLET',
      subtitle: '8-SEC SURVIVAL PIT BLITZ',
      tag: '10 PITS',
      iconSvg: ICONS.trapdoor,
    });

    const trunkPlate = this.createActionPlate({
      action: 'PROP_TRUNK',
      title: "FRANKIE'S PROP TRUNK",
      subtitle: '3D RELICS & FOIL TRICK CARDS',
      tag: 'VAULT',
      iconSvg: ICONS.trunk,
    });

    const trophyPlate = this.createActionPlate({
      action: 'TROPHY_VAULT',
      title: 'HALL OF TROPHIES & MEDALS',
      subtitle: '360° 3D TURNTABLE & PODIUM PINS',
      tag: '0/36',
      iconSvg: ICONS.trophy,
    });
    this.honorTagEl = trophyPlate.querySelector('.v6-plate-tag');

    const optionsPlate = this.createActionPlate({
      action: 'OPTIONS_CONSOLE',
      title: 'BROADCAST CONTROL DESK',
      subtitle: '4-BAY MIXER · 3X 3D · 1.27M LEDGER',
      tag: 'DESK',
      iconSvg: ICONS.console,
      wideOnTwoCol: true,
    });

    grid.append(
      heroPlate,
      quickShowPlate,
      trapdoorPlate,
      trunkPlate,
      trophyPlate,
      optionsPlate,
    );

    deck.append(telemetryStrip, grid);

    // 4) Zero-Scroll 10-Stage World & Episode Carousel Drawer
    this.drawerBackdropEl = this.buildWorldCarouselDrawer();

    screen.append(headerBlock, aperture, deck, this.drawerBackdropEl);
    parent.appendChild(screen);

    this.isFullscreen = Boolean(document.fullscreenElement);
    document.addEventListener('fullscreenchange', this.boundFullscreenHandler);
    window.addEventListener('keydown', this.boundKeydownHandler);

    this.applyActiveStageTheme();
    this.syncTopbar();
    this.syncTelemetry();
    this.syncCarouselDrawer();
  }

  public setStageWorld(stageId: StageWorldIdV6, themeOverride?: StageAtmosphereThemeV6): void {
    const idx = this.worlds.findIndex((w) => w.stageId === stageId);
    if (idx < 0) return;
    if (themeOverride) {
      this.worlds[idx] = {
        ...this.worlds[idx],
        title: themeOverride.title || this.worlds[idx].title,
        eraSubtitle: themeOverride.eraSubtitle || this.worlds[idx].eraSubtitle,
        difficultyBand: themeOverride.difficultyBand || this.worlds[idx].difficultyBand,
        symphonyTrack: themeOverride.symphonyTrack || this.worlds[idx].symphonyTrack,
        hudTheme: themeOverride.hudTheme || this.worlds[idx].hudTheme,
      };
    }
    this.activeStageIndex = idx;
    this.carouselStageIndex = idx;
    this.applyActiveStageTheme();
    this.syncTopbar();
    this.syncCarouselDrawer();
  }

  public setSymphonyState(enabled: boolean): void {
    this.symphonyEnabled = enabled;
    this.syncTopbar();
  }

  public setCareerTelemetry(partial: Partial<GrandLobbyTelemetryV6>): void {
    this.telemetry = { ...this.telemetry, ...partial };
    this.syncTelemetry();
    this.syncCarouselDrawer();
  }

  public openWorldCarousel(open = true): void {
    this.drawerOpen = open;
    if (open) {
      this.carouselStageIndex = this.activeStageIndex;
      this.syncCarouselDrawer();
    }
    this.drawerBackdropEl?.classList.toggle('is-open', open);
  }

  public setVisible(visible: boolean): void {
    this.visible = visible;
    this.rootEl?.classList.toggle('is-hidden', !visible);
    if (!visible && this.drawerOpen) {
      this.openWorldCarousel(false);
    }
  }

  public dispose(): void {
    document.removeEventListener('fullscreenchange', this.boundFullscreenHandler);
    window.removeEventListener('keydown', this.boundKeydownHandler);
    this.rootEl?.remove();
    this.rootEl = null;
    this.drawerBackdropEl = null;
    this.drawerPipBtns = [];
  }

  // --------------------------------------------------------------------------
  // Internal Builders & Synchronizers
  // --------------------------------------------------------------------------

  private createActionPlate(opts: {
    action: LobbyActionIdV6;
    title: string;
    subtitle: string;
    tag: string;
    iconSvg: string;
    hero?: boolean;
    wideOnTwoCol?: boolean;
  }): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'v6-brass-plate';
    if (opts.hero) btn.classList.add('v6-brass-plate--hero');
    if (opts.wideOnTwoCol) btn.classList.add('v6-plate-wide');
    btn.dataset.action = opts.action;

    const iconWrap = document.createElement('span');
    iconWrap.className = 'v6-plate-icon';
    iconWrap.innerHTML = opts.iconSvg;

    const copy = document.createElement('span');
    copy.className = 'v6-plate-copy';
    const titleEl = document.createElement('span');
    titleEl.className = 'v6-plate-title';
    titleEl.textContent = opts.title;
    const subEl = document.createElement('span');
    subEl.className = 'v6-plate-sub';
    subEl.textContent = opts.subtitle;
    copy.append(titleEl, subEl);

    const tagEl = document.createElement('span');
    tagEl.className = 'v6-plate-tag';
    tagEl.textContent = opts.tag;

    btn.append(iconWrap, copy, tagEl);
    btn.addEventListener('click', () => {
      this.playFoley(opts.hero ? 'vault_heavy_unlock' : 'ui_brass_tap');
      this.callbacks.onSelectAction(opts.action);
    });
    return btn;
  }

  private buildWorldCarouselDrawer(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'v6-world-drawer-backdrop';
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.playFoley('ui_brass_tap');
        this.openWorldCarousel(false);
      }
    });

    const drawer = document.createElement('div');
    drawer.className = 'v6-world-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', '10-Stage World Tour Carousel');

    // Horizontal swipe support for effortless phone carousel navigation
    drawer.addEventListener('pointerdown', (e) => {
      this.swipeStartX = e.clientX;
    });
    drawer.addEventListener('pointerup', (e) => {
      if (this.swipeStartX === null) return;
      const dx = e.clientX - this.swipeStartX;
      this.swipeStartX = null;
      if (Math.abs(dx) >= 42) {
        this.stepCarousel(dx < 0 ? 1 : -1);
      }
    });

    const header = document.createElement('div');
    header.className = 'v6-drawer-header';

    const title = document.createElement('h2');
    title.className = 'v6-drawer-title';
    title.textContent = 'WORLD TOUR · 10 STAGE WORLDS & 20 EPISODES';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'v6-hardware-pill';
    closeBtn.innerHTML = `${ICONS.close}<span>CLOSE</span>`;
    closeBtn.addEventListener('click', () => {
      this.playFoley('ui_brass_tap');
      this.openWorldCarousel(false);
    });
    header.append(title, closeBtn);

    // Stage Showcase Plate
    const card = document.createElement('div');
    card.className = 'v6-world-stage-card';

    this.drawerCrestEl = document.createElement('div');
    this.drawerCrestEl.className = 'v6-world-crest-frame';

    const meta = document.createElement('div');
    meta.className = 'v6-world-meta';

    this.drawerKickerEl = document.createElement('div');
    this.drawerKickerEl.className = 'v6-world-kicker v6-tabular';

    this.drawerNameEl = document.createElement('h3');
    this.drawerNameEl.className = 'v6-world-name';

    this.drawerEraEl = document.createElement('p');
    this.drawerEraEl.className = 'v6-world-era';

    this.drawerSymphonyEl = document.createElement('div');
    this.drawerSymphonyEl.className = 'v6-world-symphony-chip';

    meta.append(
      this.drawerKickerEl,
      this.drawerNameEl,
      this.drawerEraEl,
      this.drawerSymphonyEl,
    );
    card.append(this.drawerCrestEl, meta);

    // Two Campaign Episode Plates for active Stage World
    this.drawerEpisodesEl = document.createElement('div');
    this.drawerEpisodesEl.className = 'v6-episode-pair';

    // 10-Stage Index Rail (◀ 01..10 ▶)
    const rail = document.createElement('div');
    rail.className = 'v6-world-rail';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'v6-hardware-pill';
    prevBtn.setAttribute('aria-label', 'Previous Stage World');
    prevBtn.innerHTML = ICONS.chevronLeft;
    prevBtn.addEventListener('click', () => this.stepCarousel(-1));

    const pips = document.createElement('div');
    pips.className = 'v6-world-pips';
    this.drawerPipBtns = this.worlds.map((world, index) => {
      const pip = document.createElement('button');
      pip.type = 'button';
      pip.className = 'v6-world-pip v6-tabular';
      pip.textContent = pad2(world.stageNumber);
      pip.setAttribute('aria-label', `Stage ${world.stageNumber}: ${world.title}`);
      pip.addEventListener('click', () => {
        this.selectCarouselStage(index);
      });
      pips.appendChild(pip);
      return pip;
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'v6-hardware-pill';
    nextBtn.setAttribute('aria-label', 'Next Stage World');
    nextBtn.innerHTML = ICONS.chevronRight;
    nextBtn.addEventListener('click', () => this.stepCarousel(1));

    rail.append(prevBtn, pips, nextBtn);

    drawer.append(header, card, this.drawerEpisodesEl, rail);
    backdrop.appendChild(drawer);
    return backdrop;
  }

  private stepCarousel(delta: -1 | 1): void {
    const nextIdx = (this.carouselStageIndex + delta + this.worlds.length) % this.worlds.length;
    this.selectCarouselStage(nextIdx);
  }

  private selectCarouselStage(index: number): void {
    this.carouselStageIndex = index;
    this.activeStageIndex = index;
    this.playFoley('brass_gear_detent');
    this.applyActiveStageTheme();
    this.syncTopbar();
    this.syncCarouselDrawer();
    this.callbacks.onPreviewStageWorld?.(this.worlds[index].stageId);
  }

  private applyActiveStageTheme(): void {
    const world = this.worlds[this.activeStageIndex];
    if (!world || !this.mountParent) return;
    applyStageHudThemeToRootV6(this.mountParent, world.hudTheme);
  }

  private syncTopbar(): void {
    const world = this.worlds[this.activeStageIndex];
    if (this.symphonyLed) {
      this.symphonyLed.classList.toggle('is-on', this.symphonyEnabled);
    }
    if (this.symphonyText) {
      this.symphonyText.innerHTML = this.symphonyEnabled
        ? '<span class="v6-hide-xs">LIVE </span>SYMPHONY: ON'
        : '<span class="v6-hide-xs">LIVE </span>SYMPHONY: OFF';
    }
    if (this.symphonyBtn) {
      this.symphonyBtn.classList.toggle('is-active', this.symphonyEnabled);
    }
    if (this.stagePillLabel && world) {
      this.stagePillLabel.innerHTML = `<span class="v6-hide-xs">STAGE </span>WORLD ${pad2(world.stageNumber)}/10`;
    }
    if (this.fullscreenLabel) {
      this.fullscreenLabel.textContent = this.isFullscreen ? 'EXIT FULL' : 'FULLSCREEN';
    }
    if (this.stageRibbonEl && world) {
      const [dMin, dMax] = world.difficultyBand;
      this.stageRibbonEl.innerHTML = '';
      const stg = document.createElement('strong');
      stg.textContent = `STAGE ${pad2(world.stageNumber)} · ${world.title.toUpperCase()}`;
      const sep = document.createElement('span');
      sep.textContent = '·';
      const band = document.createElement('span');
      band.className = 'v6-tabular';
      band.textContent = `★ ${dMin.toFixed(1)}–${dMax.toFixed(1)}`;
      this.stageRibbonEl.append(stg, sep, band);
    }
  }

  private syncTelemetry(): void {
    if (this.bankrollValueEl) {
      this.bankrollValueEl.textContent = formatCurrency(this.telemetry.bankrollCash);
    }
    if (this.episodeValueEl) {
      this.episodeValueEl.textContent = `EP ${pad2(this.telemetry.currentEpisode)}/20`;
    }
    if (this.honorValueEl) {
      this.honorValueEl.textContent = `${this.telemetry.earnedHonorCount}/36`;
    }
    if (this.honorTagEl) {
      this.honorTagEl.textContent = `${this.telemetry.earnedHonorCount}/36`;
    }
    if (this.campaignSubEl) {
      const world = this.worlds[this.activeStageIndex];
      const ep = world?.episodes[0];
      if (world && ep) {
        this.campaignSubEl.textContent = `STAGE ${pad2(world.stageNumber)} · ${world.title.toUpperCase()} · ★ ${world.difficultyBand[0].toFixed(1)}–${world.difficultyBand[1].toFixed(1)}`;
      }
    }
  }

  private syncCarouselDrawer(): void {
    const world = this.worlds[this.carouselStageIndex];
    if (!world) return;

    if (this.drawerCrestEl) {
      this.drawerCrestEl.innerHTML = `<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true">${world.crestSvgMarkup}</svg>`;
    }
    if (this.drawerKickerEl) {
      const [dMin, dMax] = world.difficultyBand;
      this.drawerKickerEl.textContent = `STAGE WORLD ${pad2(world.stageNumber)} / 10  ·  DIFFICULTY ★ ${dMin.toFixed(1)} – ${dMax.toFixed(1)}`;
    }
    if (this.drawerNameEl) {
      this.drawerNameEl.textContent = world.title.toUpperCase();
    }
    if (this.drawerEraEl) {
      this.drawerEraEl.textContent = world.eraSubtitle;
    }
    if (this.drawerSymphonyEl) {
      this.drawerSymphonyEl.innerHTML = `${ICONS.note}<span>SYMPHONY: ${world.symphonyTitle.toUpperCase()}</span>`;
    }

    if (this.drawerEpisodesEl) {
      this.drawerEpisodesEl.innerHTML = '';
      const stageUnlocked = world.stageNumber <= this.telemetry.unlockedStages;
      for (const ep of world.episodes) {
        const epBtn = document.createElement('button');
        epBtn.type = 'button';
        epBtn.className = 'v6-brass-plate';
        if (ep.kind === 'TITLE_BOUT') {
          epBtn.classList.add('v6-brass-plate--hero');
        }
        epBtn.disabled = !stageUnlocked;

        const copy = document.createElement('span');
        copy.className = 'v6-plate-copy';
        const t = document.createElement('span');
        t.className = 'v6-plate-title';
        t.textContent = `EP ${pad2(ep.episodeNumber)} · ${ep.title}`;
        const s = document.createElement('span');
        s.className = 'v6-plate-sub';
        s.textContent = `${ep.kind === 'TITLE_BOUT' ? 'CHAMPION TITLE BOUT' : 'VENUE SHOWCASE'} · ${ep.boardTag}`;
        copy.append(t, s);

        const tag = document.createElement('span');
        tag.className = 'v6-plate-tag';
        const isCompleted = ep.episodeNumber <= this.telemetry.completedEpisodes;
        tag.textContent = !stageUnlocked ? 'LOCKED' : isCompleted ? 'CLEARED' : 'LAUNCH';

        epBtn.append(copy, tag);
        epBtn.addEventListener('click', () => {
          this.playFoley('vault_heavy_unlock');
          this.openWorldCarousel(false);
          this.callbacks.onLaunchEpisode(world.stageId, ep.episodeNumber);
        });
        this.drawerEpisodesEl.appendChild(epBtn);
      }
    }

    this.drawerPipBtns.forEach((pip, idx) => {
      pip.classList.toggle('is-active', idx === this.carouselStageIndex);
      pip.classList.toggle('is-locked', idx + 1 > this.telemetry.unlockedStages);
    });
  }

  private async toggleFullscreen(): Promise<void> {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Gracefully ignore browser gesture or iframe fullscreen restrictions
      this.isFullscreen = Boolean(document.fullscreenElement);
      this.syncTopbar();
    }
  }

  private playFoley(sfxId: FoleySfxIdV6): void {
    this.callbacks.onPlayFoley?.(sfxId);
  }
}
