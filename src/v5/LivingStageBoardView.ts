// ============================================================================
// WORLD'S SMARTEST v5.0 — Living Theatrical Game-Show Stage Board View
// Self-contained prime-time broadcast stage featuring:
//   1. Live Theatrical Stage Upper Vista (Painted Venue Backdrop + Volumetric
//      Spotlights, Transparent-Alpha Host Max Sterling w/ Angled Speech &
//      Onboarding Callouts, Glowing 6-Wedge Faceted Jewel Championship
//      Medallion flanked by Diamond-Tipped Brass/Sapphire Score Plaques,
//      and Waist-Up Challenger behind a Carved Mahogany & Brass Podium)
//   2. Tilted 2.5D Octagonal Crystal-and-Brass Stage Board (Scalloped Brass
//      Category Crests, Multi-Stop Brass Beveled Octagonal Tiles with Custom
//      SVG Category/Format/Twist Emblems — ZERO "CLASSIC" boxes! — Heavy
//      3D-Shaded Crossed Iron Chains & Brass Padlocks with .is-shattering +
//      getTileCenterViewportCoords for StageVfxCanvasV5)
//   3. Curved Mahogany & Brass Contestant Podium Ledge (Glossy 3D Red Dome
//      SCREW RIVAL! Buzzer with Target Mode, 3 Recessed Brass Charm Cups
//      with Bespoke Physical SVG Charms + Tooltips & Trigger Glow, plus
//      Optional Hanging Brass Sponsor Dare Tag)
//   4. Tactile Non-Boxy Broadcast Modals (Draggable Physical Brass 6-Slice
//      Stage Wheel, Interactive Rotary Brass Power-Play Wager Dial, and
//      Broadsheet Newspaper + Studio Call-Sheet Post-Match Curtain Call)
// ZERO glass-blur CSS filters. ZERO OS color emojis. ZERO horizontal overflow.
// ============================================================================

import type { DomainId } from '../forge/types';
import {
  WEDGE_CATALOG_V4,
  type BoardColumnV4,
  type BoardTileV4,
  type ChallengerProfileV4,
  type ChallengerTurnActionV4,
  type QuestionFormatV4,
  type StageBoardStateV4,
  type WedgeColorId,
  type WheelSliceOutcome,
  type WorldTourEpisodeV4,
} from '../v4/contracts';
import {
  V5_CAST_CUTOUTS,
  V5_VENUE_STAGES,
  type ChallengerIdV5,
  type CharmIdV5,
  type HostPoseV5,
  type PodiumCharmSpecV5,
  type ShowmanDareV5,
  type TierNumberV5,
} from './contracts_v5';

// ============================================================================
// 1. PUBLIC VIEW-MODEL & CALLBACK INTERFACES
// ============================================================================

export interface LivingStageOnboardingTipV5 {
  readonly kind: 'CHAINS' | 'WEDGES' | 'SCREW' | 'WHEEL' | 'BOUNTY' | 'CHARMS' | 'GENERAL';
  readonly badgeLabel: string;
  readonly text: string;
}

export type BoardTwistIdV5 =
  | 'showcase_starter'
  | 'chain_padlocks'
  | 'spiral_labyrinth'
  | 'pyramid_ascent'
  | 'fog_spotlight'
  | 'time_bomb_hot_potato'
  | 'tug_of_war_turf'
  | 'velvet_x_crossroads'
  | 'spotlight_roulette'
  | 'power_play_minefield'
  | 'ice_fire_columns'
  | 'gold_fever_contagion'
  | 'oxford_pick_ban'
  | 'championship_gauntlet';

export interface BoardTileVisualMetaV5 {
  readonly isGoldFever?: boolean;
  readonly isFlameThaw?: boolean;
  readonly isCrossroadsDiagonal?: boolean;
  readonly isSpiralCore?: boolean;
  readonly isPyramidApex?: boolean;
  readonly hotPotatoTurnsLeft?: number;
  readonly displayPointsOverride?: number;
}

export interface TugOfWarTurfStateV5 {
  readonly playerTiles: number;
  readonly rivalTiles: number;
  readonly bonusPts?: number;
}

export interface CategoryDraftItemV5 {
  readonly colId: string;
  readonly wedgeId: WedgeColorId;
  readonly domainId?: DomainId;
  readonly wittyTitle: string;
  readonly topicSubtitle: string;
  readonly state: 'AVAILABLE' | 'PLAYER_PICK' | 'RIVAL_PICK' | 'PLAYER_BAN' | 'RIVAL_BAN';
}

export interface CategoryDraftModalModelV5 {
  readonly challenger: ChallengerProfileV4;
  readonly phaseTitle: string;
  readonly instruction: string;
  readonly pool: readonly CategoryDraftItemV5[];
  readonly canConfirm: boolean;
}

export interface CategoryDraftModalCallbacksV5 {
  readonly onSelectDraftItem: (colId: string) => void;
  readonly onConfirmDraft: () => void;
}

export interface LivingStageBoardViewModelV5 {
  readonly episode: WorldTourEpisodeV4;
  readonly board: StageBoardStateV4;
  readonly challenger: ChallengerProfileV4 | null;
  readonly hostLine: string;
  readonly hostPose?: HostPoseV5;
  readonly onboardingTip?: LivingStageOnboardingTipV5 | null;
  readonly rivalReactionLine?: string | null;
  readonly rivalActionBadge?: string | null;
  readonly currentStreak: number;
  readonly audioEnabled: boolean;
  readonly screwsRemaining?: number;
  readonly equippedCharms?: readonly PodiumCharmSpecV5[];
  readonly triggeredCharmIds?: readonly CharmIdV5[];
  readonly activeDare?: ShowmanDareV5 | null;
  readonly dareCompleted?: boolean;
  readonly newlyUnlockedTileIds?: readonly string[];
  readonly lastChallengerAction?: ChallengerTurnActionV4 | null;
  readonly activeWheelBoostLabel?: string | null;
  readonly playerDisplayName?: string;
  /** Optional v5 14+ Board Topology / Twist visual metadata */
  readonly boardTwistId?: BoardTwistIdV5 | string | null;
  readonly boardTwistLabel?: string | null;
  readonly tileMetaById?: Readonly<Record<string, BoardTileVisualMetaV5>>;
  readonly tugOfWarTurf?: TugOfWarTurfStateV5 | null;
}

export interface LivingStageBoardCallbacksV5 {
  readonly onSelectTile: (tileId: string) => void;
  readonly onScrewTile?: (tileId: string) => void;
  readonly onScrewModeChange?: (armed: boolean) => void;
  readonly onCharmInspect?: (charm: PodiumCharmSpecV5) => void;
  readonly onBackToMap: () => void;
  readonly onToggleAudio: () => void;
  readonly onOpenHowToPlay?: () => void;
}

export interface StageWheelModalModelV5 {
  readonly outcome: WheelSliceOutcome;
  readonly outcomeHeadline: string;
  readonly outcomeDescription: string;
  readonly hostPrompt?: string;
}

export interface StageWheelModalCallbacksV5 {
  readonly onSpinStart?: () => void;
  readonly onTick?: () => void;
  readonly onSpinComplete: (outcome: WheelSliceOutcome) => void;
}

export interface PowerPlayDialModalModelV5 {
  readonly column: BoardColumnV4;
  readonly tile: BoardTileV4;
  readonly playerScore: number;
  readonly minWager: number;
  readonly maxWager: number;
  readonly hostLine?: string;
}

export interface PowerPlayDialModalCallbacksV5 {
  readonly onWagerChange?: (wagerPoints: number) => void;
  readonly onLockWager: (wagerPoints: number) => void;
}

export interface PostMatchCurtainCallModelV5 {
  readonly episode: WorldTourEpisodeV4;
  readonly didWin: boolean;
  readonly starsEarned: 0 | 1 | 2 | 3;
  readonly playerScore: number;
  readonly rivalScore: number;
  readonly soloTargetScore: number;
  readonly hasActiveRival: boolean;
  readonly challenger: ChallengerProfileV4 | null;
  readonly earnedWedges: readonly WedgeColorId[];
  readonly accuracyPct: number;
  readonly bestStreak: number;
  readonly audienceDelta: number;
  readonly totalAudienceNow: number;
  readonly prizeEarnedUsd: number;
  readonly headlines: readonly string[];
  readonly hostClosingQuip: string;
  readonly rivalClosingLine?: string;
  readonly hasNextEpisode: boolean;
  readonly dareCompleted?: boolean;
  readonly dareDescription?: string;
  readonly dareBonusUsd?: number;
  readonly newspaperMasthead?: string;
  readonly nextStageLabel?: string;
  readonly redemptionNote?: string;
}

export interface PostMatchCurtainCallCallbacksV5 {
  readonly onNextEpisode?: () => void;
  readonly onRematch: () => void;
  readonly onOpenWorldTourMap: () => void;
  readonly onBackHome: () => void;
}

export interface TileViewportCoordsV5 {
  readonly x: number;
  readonly y: number;
}

// ============================================================================
// 2. CANONICAL PALETTES, WEDGE GEMS & WHEEL SPECS
// ============================================================================

const STYLE_ELEMENT_ID = 'v5-board-stage-styles';

const WEDGE_ORDER_V5: readonly WedgeColorId[] = [
  'EMERALD_SCIENCE',
  'MAGENTA_POP',
  'GOLD_HISTORY',
  'VIOLET_ARTS',
  'SAPPHIRE_GEO',
  'ORANGE_SPORTS',
];

interface JewelFacetPalette {
  readonly id: WedgeColorId;
  readonly jewelName: string;
  readonly litHi: string;
  readonly litMid: string;
  readonly litDeep: string;
  readonly glowHex: string;
}

const JEWEL_PALETTE_V5: Readonly<Record<WedgeColorId, JewelFacetPalette>> = {
  EMERALD_SCIENCE: {
    id: 'EMERALD_SCIENCE',
    jewelName: 'Emerald',
    litHi: '#96ffca',
    litMid: '#18d474',
    litDeep: '#09733c',
    glowHex: '#34f295',
  },
  MAGENTA_POP: {
    id: 'MAGENTA_POP',
    jewelName: 'Ruby',
    litHi: '#ffa3be',
    litMid: '#eb285c',
    litDeep: '#8c0c30',
    glowHex: '#ff4f82',
  },
  SAPPHIRE_GEO: {
    id: 'SAPPHIRE_GEO',
    jewelName: 'Sapphire',
    litHi: '#9be0ff',
    litMid: '#2489ff',
    litDeep: '#0c479e',
    glowHex: '#4cb0ff',
  },
  GOLD_HISTORY: {
    id: 'GOLD_HISTORY',
    jewelName: 'Amber',
    litHi: '#fff3ad',
    litMid: '#f7b928',
    litDeep: '#a66808',
    glowHex: '#ffd452',
  },
  VIOLET_ARTS: {
    id: 'VIOLET_ARTS',
    jewelName: 'Violet',
    litHi: '#e3c7ff',
    litMid: '#9f52f7',
    litDeep: '#561b9e',
    glowHex: '#be7dff',
  },
  ORANGE_SPORTS: {
    id: 'ORANGE_SPORTS',
    jewelName: 'Cyan',
    litHi: '#aef9ff',
    litMid: '#17cfe6',
    litDeep: '#087285',
    glowHex: '#3beeff',
  },
};

interface ColumnEnamelTheme {
  readonly crestTop: string;
  readonly crestBottom: string;
  readonly crestBorder: string;
  readonly tileHi: string;
  readonly tileMid: string;
  readonly tileLow: string;
  readonly inkHex: string;
  readonly iconAccent: string;
}

const COLUMN_THEMES_BY_DOMAIN: Readonly<Record<DomainId, ColumnEnamelTheme>> = {
  // 0: World History — Antique Imperial Crimson/Gold
  0: {
    crestTop: '#8f1d2c',
    crestBottom: '#520c18',
    crestBorder: '#f0c766',
    tileHi: '#fdf9f0',
    tileMid: '#e8e2d8',
    tileLow: '#cfc5b4',
    inkHex: '#4f141e',
    iconAccent: '#992232',
  },
  // 1: Science & Space — Cosmic Royal Purple
  1: {
    crestTop: '#5b2886',
    crestBottom: '#311252',
    crestBorder: '#f0c766',
    tileHi: '#f4e6ff',
    tileMid: '#dfc2fa',
    tileLow: '#c297eb',
    inkHex: '#3c1561',
    iconAccent: '#6928a3',
  },
  // 2: Geography & Wonders — Cartographer Burnished Amber
  2: {
    crestTop: '#9c5a18',
    crestBottom: '#5e3109',
    crestBorder: '#f7d57d',
    tileHi: '#fff3cf',
    tileMid: '#f2d99d',
    tileLow: '#dcb86c',
    inkHex: '#4f2a08',
    iconAccent: '#8a4c11',
  },
  // 3: Arts & Architecture — Regal Burgundy Velvet
  3: {
    crestTop: '#7a1f47',
    crestBottom: '#420d26',
    crestBorder: '#f0c766',
    tileHi: '#fcecf4',
    tileMid: '#edd0df',
    tileLow: '#d7a9c1',
    inkHex: '#471029',
    iconAccent: '#8a2352',
  },
  // 4: Film, Music & Pop — Retro Peacock Teal
  4: {
    crestTop: '#166a6d',
    crestBottom: '#0b3c41',
    crestBorder: '#f0c766',
    tileHi: '#e3fafa',
    tileMid: '#bce8e9',
    tileLow: '#93cfd2',
    inkHex: '#0d4045',
    iconAccent: '#14666b',
  },
  // 5: Sports & Games — Stadium Emerald
  5: {
    crestTop: '#166a45',
    crestBottom: '#0b3c27',
    crestBorder: '#f0c766',
    tileHi: '#e5faef',
    tileMid: '#c1ebd6',
    tileLow: '#96d4b6',
    inkHex: '#0d3d26',
    iconAccent: '#146e46',
  },
  // 6: Tech & Computing — Electric Cobalt Sapphire
  6: {
    crestTop: '#194d8f',
    crestBottom: '#0c2a54',
    crestBorder: '#f0c766',
    tileHi: '#e8f3ff',
    tileMid: '#c5dffa',
    tileLow: '#9bc4f0',
    inkHex: '#0f2f5c',
    iconAccent: '#1b58a6',
  },
  // 7: Nature & Biology — Botanical Deep Jade
  7: {
    crestTop: '#246b38',
    crestBottom: '#113d1e',
    crestBorder: '#f0c766',
    tileHi: '#eafae8',
    tileMid: '#cae8c6',
    tileLow: '#a3d19d',
    inkHex: '#154222',
    iconAccent: '#237039',
  },
  // 8: World Affairs & Law — Navy Chancery Brass
  8: {
    crestTop: '#263a75',
    crestBottom: '#121e42',
    crestBorder: '#f0c766',
    tileHi: '#eef1fc',
    tileMid: '#d3daf2',
    tileLow: '#b1bde3',
    inkHex: '#18254d',
    iconAccent: '#2a4185',
  },
  // 9: Food, Craft & Design — Terracotta Spice
  9: {
    crestTop: '#9c3e1c',
    crestBottom: '#591e0b',
    crestBorder: '#f0c766',
    tileHi: '#fff0e6',
    tileMid: '#f7d6bf',
    tileLow: '#e5b393',
    inkHex: '#4f1c0b',
    iconAccent: '#9e3b19',
  },
  // 10: Myth & Literature — Theater Velvet Crimson
  10: {
    crestTop: '#85182d',
    crestBottom: '#4a0b19',
    crestBorder: '#f5cf73',
    tileHi: '#f7f8fc',
    tileMid: '#e1e4ee',
    tileLow: '#c4cadb',
    inkHex: '#4a111d',
    iconAccent: '#8c1d30',
  },
  // 11: Logic & Math — Obsidian Indigo
  11: {
    crestTop: '#3c2d85',
    crestBottom: '#1e154a',
    crestBorder: '#f0c766',
    tileHi: '#eeeafd',
    tileMid: '#d4cbf7',
    tileLow: '#b4a5eb',
    inkHex: '#251a57',
    iconAccent: '#4834a6',
  },
};

interface WheelSliceSpecV5 {
  readonly outcome: WheelSliceOutcome;
  readonly shortLabel: string;
  readonly topFill: string;
  readonly botFill: string;
  readonly inkHex: string;
}

const WHEEL_SLICES_V5: readonly WheelSliceSpecV5[] = [
  { outcome: 'DOUBLE_POT', shortLabel: '2X NEXT TILE', topFill: '#ffe385', botFill: '#d99a1e', inkHex: '#241403' },
  { outcome: 'FREE_WEDGE_SHARD', shortLabel: 'FREE WEDGE', topFill: '#ca94ff', botFill: '#7a34cf', inkHex: '#ffffff' },
  { outcome: 'STEAL_RIVAL_POINTS', shortLabel: 'STEAL +250', topFill: '#ff7da4', botFill: '#c72053', inkHex: '#ffffff' },
  { outcome: 'RECHARGE_LIFELINES', shortLabel: 'REFILL LIFE', topFill: '#6ef2b8', botFill: '#11915a', inkHex: '#042416' },
  { outcome: 'SHATTER_ALL_LOCKS', shortLabel: 'CRACK LOCKS', topFill: '#7ac7ff', botFill: '#1a68c7', inkHex: '#ffffff' },
  { outcome: 'HOT_SEAT_ALL_IN', shortLabel: 'ALL-IN 2X', topFill: '#ffb36b', botFill: '#cf5a10', inkHex: '#260d02' },
];

// ============================================================================
// 3. SAFE FORMATTERS & ASSET RESOLVERS
// ============================================================================

function escapeHtml(raw: string): string {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatAudienceCompact(viewers: number): string {
  if (viewers >= 1_000_000_000) {
    const b = viewers / 1_000_000_000;
    return `${b >= 10 ? b.toFixed(0) : b.toFixed(1)}B`;
  }
  if (viewers >= 1_000_000) {
    const m = viewers / 1_000_000;
    return `${m >= 10 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (viewers >= 1_000) {
    const k = viewers / 1_000;
    return `${k >= 10 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return Math.max(0, Math.round(viewers)).toLocaleString('en-US');
}

function formatUsdCompact(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `$${Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  return `$${Math.max(0, Math.round(amount)).toLocaleString('en-US')}`;
}

function clampTier(tier: number): TierNumberV5 {
  const n = Math.max(1, Math.min(8, Math.round(tier)));
  return n as TierNumberV5;
}

function resolveMaxCutoutUrl(pose: HostPoseV5 = 'welcome'): string {
  if (pose === 'hype') return V5_CAST_CUTOUTS.maxHype;
  if (pose === 'wince') return V5_CAST_CUTOUTS.maxWince;
  return V5_CAST_CUTOUTS.maxWelcome;
}

function resolveChallengerCutoutUrl(challenger: ChallengerProfileV4 | null): string | null {
  if (!challenger) return null;
  const id = challenger.id as ChallengerIdV5;
  if (id in V5_CAST_CUTOUTS.challengers) {
    return V5_CAST_CUTOUTS.challengers[id];
  }
  // Graceful bridge for v4 Tier 8 boss id or shortened keys
  const norm = challenger.id.toLowerCase();
  if (norm.includes('frankie')) return V5_CAST_CUTOUTS.challengers.frankie_russo;
  if (norm.includes('denise')) return V5_CAST_CUTOUTS.challengers.denise_park;
  if (norm.includes('trevor')) return V5_CAST_CUTOUTS.challengers.trevor_blake;
  if (norm.includes('priya')) return V5_CAST_CUTOUTS.challengers.priya_nair;
  if (norm.includes('alistair')) return V5_CAST_CUTOUTS.challengers.alistair_finch;
  if (norm.includes('kenji')) return V5_CAST_CUTOUTS.challengers.kenji_takahashi;
  if (norm.includes('nadia')) return V5_CAST_CUTOUTS.challengers.nadia_al_mansoor;
  if (norm.includes('viktor') || norm.includes('julian')) {
    return V5_CAST_CUTOUTS.challengers.viktor_volkov;
  }
  return challenger.avatarPortraitUrl || null;
}

function shortChallengerBadgeName(challenger: ChallengerProfileV4): string {
  const first = challenger.name.trim().split(/\s+/)[0] || challenger.name;
  return first.toUpperCase();
}

function describeFormatAccessible(format: QuestionFormatV4): string {
  switch (format) {
    case 'MULTIPLE_CHOICE':
      return 'Showdown Question';
    case 'MATCH_4':
      return 'Cable Match-4';
    case 'SORT_4':
      return 'Chronology Sort-4';
    case 'MULTI_STRIKE':
      return 'Multi-Strike Grid';
    case 'PINPOINT_DIAL':
      return 'Pinpoint Dial';
    case 'CLUE_ESCALATOR':
      return '3-Clue Escalator';
    case 'VISUAL_SPOTTER':
      return 'Visual Spotter';
  }
}

// ============================================================================
// 4. BESPOKE SVG ARTWORK LIBRARY (ZERO OS EMOJIS)
// ============================================================================

const BOARD_TWIST_DEFAULT_LABELS: Readonly<Record<BoardTwistIdV5, string>> = {
  showcase_starter: 'SHOWCASE STAGE',
  chain_padlocks: 'CHAIN-REACTION VAULTS',
  spiral_labyrinth: 'SPIRAL LABYRINTH · 1,000 PT CORE',
  pyramid_ascent: 'PYRAMID ASCENT · SUMMIT CROWN',
  fog_spotlight: 'FOG-OF-WAR SPOTLIGHT',
  time_bomb_hot_potato: 'TIME-BOMB HOT POTATO',
  tug_of_war_turf: 'TERRITORY TURF · +500 MAJORITY',
  velvet_x_crossroads: 'VELVET X-CROSSROADS · 2× DIAGONALS',
  spotlight_roulette: 'SPOTLIGHT ROULETTE SWEEP',
  power_play_minefield: 'POWER-PLAY MINEFIELD',
  ice_fire_columns: 'ICE & FIRE COLUMNS · THAW +200',
  gold_fever_contagion: 'GOLD FEVER CONTAGION · 2× SPREAD',
  oxford_pick_ban: 'OXFORD PICK & BAN DRAFT',
  championship_gauntlet: '6-COLUMN CHAMPIONSHIP GAUNTLET',
};

const BOARD_TWIST_SHORT_PILLS: Readonly<Record<BoardTwistIdV5, string>> = {
  showcase_starter: 'SHOWCASE',
  chain_padlocks: 'CHAIN VAULTS',
  spiral_labyrinth: 'LABYRINTH',
  pyramid_ascent: 'PYRAMID',
  fog_spotlight: 'STAGE FOG',
  time_bomb_hot_potato: 'HOT POTATO',
  tug_of_war_turf: 'TURF WAR',
  velvet_x_crossroads: 'X-ROADS 2×',
  spotlight_roulette: 'SPOTLIGHT',
  power_play_minefield: 'MINEFIELD',
  ice_fire_columns: 'ICE & FIRE',
  gold_fever_contagion: 'GOLD FEVER',
  oxford_pick_ban: 'OXFORD DRAFT',
  championship_gauntlet: 'GAUNTLET',
};

function resolveBoardTwistShortPill(twistId: BoardTwistIdV5 | string | null | undefined): string | null {
  if (!twistId || twistId === 'showcase_starter') return null;
  if (twistId in BOARD_TWIST_SHORT_PILLS) {
    return BOARD_TWIST_SHORT_PILLS[twistId as BoardTwistIdV5];
  }
  return twistId.replace(/_/g, ' ').toUpperCase().slice(0, 14);
}

function resolveBoardTwistLabel(
  twistId: BoardTwistIdV5 | string | null | undefined,
  explicitLabel?: string | null,
): string | null {
  if (explicitLabel && explicitLabel.trim()) return explicitLabel.trim();
  if (!twistId) return null;
  if (twistId in BOARD_TWIST_DEFAULT_LABELS) {
    return BOARD_TWIST_DEFAULT_LABELS[twistId as BoardTwistIdV5];
  }
  return twistId.replace(/_/g, ' ').toUpperCase();
}

function renderUtilityIconSvg(
  kind: 'back' | 'eye' | 'sound_on' | 'sound_off' | 'help' | 'flame' | 'wheel' | 'check' | 'cross' | 'shield' | 'star' | 'star_dim' | 'share' | 'play' | 'mic' | 'frost' | 'fog' | 'spark' | 'fullscreen_enter' | 'fullscreen_exit',
  size = 16,
): string {
  const s = `${size}`;
  const open = `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`;
  switch (kind) {
    case 'back':
      return `${open}<polyline points="15 18 9 12 15 6"/></svg>`;
    case 'eye':
      return `${open}<path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></svg>`;
    case 'sound_on':
      return `${open}<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.28"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.8 5.5a9.2 9.2 0 0 1 0 13"/></svg>`;
    case 'sound_off':
      return `${open}<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.2"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>`;
    case 'help':
      return `${open}<circle cx="12" cy="12" r="9"/><path d="M9.4 9.2a2.7 2.7 0 0 1 5.2 1c0 1.8-2.6 2.3-2.6 3.8"/><circle cx="12" cy="17.2" r="0.9" fill="currentColor"/></svg>`;
    case 'flame':
      return `${open}<path d="M12 2c.7 3.6-2.4 5.4-2.4 8.4 0 1.5 1.1 2.5 2.4 2.5 1.9 0 3.2-1.8 2.8-4.1 2.4 1.6 4.2 4.3 4.2 7.2a7 7 0 1 1-14 0c0-3.6 2.7-7.1 7-14z" fill="currentColor" fill-opacity="0.36"/></svg>`;
    case 'wheel':
      return `${open}<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M12 3v6.8M12 14.2V21M4.2 7.5l5.9 3.4M13.9 13.1l5.9 3.4M19.8 7.5l-5.9 3.4M10.1 13.1l-5.9 3.4"/></svg>`;
    case 'check':
      return `${open}<polyline points="20 6 9 17 4 12" stroke-width="2.8"/></svg>`;
    case 'cross':
      return `${open}<line x1="18" y1="6" x2="6" y2="18" stroke-width="2.5"/><line x1="6" y1="6" x2="18" y2="18" stroke-width="2.5"/></svg>`;
    case 'shield':
      return `${open}<path d="M12 3l8 3.5V12c0 4.8-3.4 8.2-8 9.5C7.4 20.2 4 16.8 4 12V6.5L12 3z" fill="currentColor" fill-opacity="0.28"/></svg>`;
    case 'star':
      return `${open}<polygon points="12 2.4 15 8.7 22 9.6 16.9 14.5 18.2 21.4 12 18 5.8 21.4 7.1 14.5 2 9.6 9 8.7 12 2.4" fill="currentColor"/></svg>`;
    case 'star_dim':
      return `${open}<polygon points="12 2.4 15 8.7 22 9.6 16.9 14.5 18.2 21.4 12 18 5.8 21.4 7.1 14.5 2 9.6 9 8.7 12 2.4" fill="currentColor" fill-opacity="0.14"/></svg>`;
    case 'share':
      return `${open}<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><line x1="8.4" y1="13.3" x2="15.6" y2="17.7"/><line x1="15.6" y1="6.3" x2="8.4" y2="10.7"/></svg>`;
    case 'play':
      return `${open}<polygon points="6 4 20 12 6 20 6 4" fill="currentColor"/></svg>`;
    case 'mic':
      return `${open}<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" fill-opacity="0.3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"/></svg>`;
    case 'frost':
      return `${open}<path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1M10 4l2 2 2-2M10 20l2-2 2 2M4 10l2 2-2 2M20 10l-2 2 2 2"/></svg>`;
    case 'fog':
      return `${open}<path d="M4 15h16M3 19h14M6 11a4 4 0 0 1 7.6-1.7A3.5 3.5 0 0 1 18.5 12H6a2.5 2.5 0 0 1 0-1z" fill="currentColor" fill-opacity="0.26"/></svg>`;
    case 'spark':
      return `${open}<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" fill="currentColor" fill-opacity="0.35"/></svg>`;
    case 'fullscreen_enter':
      return `${open}<polyline points="4 9 4 4 9 4"/><polyline points="15 4 20 4 20 9"/><polyline points="20 15 20 20 15 20"/><polyline points="9 20 4 20 4 15"/></svg>`;
    case 'fullscreen_exit':
      return `${open}<polyline points="9 4 9 9 4 9"/><polyline points="20 9 15 9 15 4"/><polyline points="15 20 15 15 20 15"/><polyline points="4 15 9 15 9 20"/></svg>`;
  }
}

/**
 * 6-Wedge Faceted Jewel Championship Medallion SVG (emerald, ruby, sapphire, amber, violet, cyan).
 */
function renderJewelMedallionSvg(
  earnedWedges: readonly WedgeColorId[],
  uid: string,
  sizePx = 104,
): string {
  const earnedSet = new Set(earnedWedges);
  const cx = 60;
  const cy = 60;
  const outerR = 45;
  const midR = 29;
  const innerR = 11;

  const defsParts: string[] = [
    `<linearGradient id="v5m-brass-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff5c0"/>
      <stop offset="28%" stop-color="#e4b34a"/>
      <stop offset="56%" stop-color="#875914"/>
      <stop offset="82%" stop-color="#f7d577"/>
      <stop offset="100%" stop-color="#69430c"/>
    </linearGradient>`,
    `<radialGradient id="v5m-empty-${uid}" cx="45%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#443728"/>
      <stop offset="62%" stop-color="#221b13"/>
      <stop offset="100%" stop-color="#120d08"/>
    </radialGradient>`,
    `<radialGradient id="v5m-ring-${uid}" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#2858b0"/>
      <stop offset="100%" stop-color="#0b1d45"/>
    </radialGradient>`,
  ];

  const slicesHtml = WEDGE_ORDER_V5.map((wedgeId, i) => {
    const pal = JEWEL_PALETTE_V5[wedgeId];
    const meta = WEDGE_CATALOG_V4[wedgeId];
    const earned = earnedSet.has(wedgeId);

    const startDeg = -150 + i * 60 + 3.2;
    const endDeg = -150 + (i + 1) * 60 - 3.2;
    const midDeg = (startDeg + endDeg) / 2;

    const a1 = (startDeg * Math.PI) / 180;
    const a2 = (endDeg * Math.PI) / 180;
    const am = (midDeg * Math.PI) / 180;

    const x1 = cx + outerR * Math.cos(a1);
    const y1 = cy + outerR * Math.sin(a1);
    const x2 = cx + outerR * Math.cos(a2);
    const y2 = cy + outerR * Math.sin(a2);
    const xm = cx + outerR * Math.cos(am);
    const ym = cy + outerR * Math.sin(am);

    const ix1 = cx + innerR * Math.cos(a1);
    const iy1 = cy + innerR * Math.sin(a1);
    const ix2 = cx + innerR * Math.cos(a2);
    const iy2 = cy + innerR * Math.sin(a2);

    const mx1 = cx + midR * Math.cos(a1 + 0.1);
    const my1 = cy + midR * Math.sin(a1 + 0.1);
    const mx2 = cx + midR * Math.cos(a2 - 0.1);
    const my2 = cy + midR * Math.sin(a2 - 0.1);
    const cmx = cx + (innerR + 9) * Math.cos(am);
    const cmy = cy + (innerR + 9) * Math.sin(am);

    const basePath = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${outerR} ${outerR} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${ix2.toFixed(1)} ${iy2.toFixed(1)} A ${innerR} ${innerR} 0 0 0 ${ix1.toFixed(1)} ${iy1.toFixed(1)} Z`;

    if (!earned) {
      return `
        <g class="v5b-jewel-slice is-unlit">
          <path d="${basePath}" fill="url(#v5m-empty-${uid})" stroke="#7c5a27" stroke-width="1.35"/>
          <path d="M ${mx1.toFixed(1)} ${my1.toFixed(1)} L ${mx2.toFixed(1)} ${my2.toFixed(1)} L ${cmx.toFixed(1)} ${cmy.toFixed(1)} Z" fill="rgba(255,224,150,0.06)"/>
          <title>${escapeHtml(meta.shortLabel)} — ${pal.jewelName} Wedge (Unearned)</title>
        </g>
      `;
    }

    const gradId = `v5m-gem-${uid}-${i}`;
    defsParts.push(`
      <radialGradient id="${gradId}" cx="45%" cy="35%" r="68%">
        <stop offset="0%" stop-color="${pal.litHi}"/>
        <stop offset="46%" stop-color="${pal.litMid}"/>
        <stop offset="100%" stop-color="${pal.litDeep}"/>
      </radialGradient>
    `);

    const topFacet = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${outerR} ${outerR} 0 0 1 ${xm.toFixed(1)} ${ym.toFixed(1)} L ${cmx.toFixed(1)} ${cmy.toFixed(1)} L ${mx1.toFixed(1)} ${my1.toFixed(1)} Z`;
    const glintFacet = `M ${mx1.toFixed(1)} ${my1.toFixed(1)} L ${mx2.toFixed(1)} ${my2.toFixed(1)} L ${cmx.toFixed(1)} ${cmy.toFixed(1)} Z`;

    return `
      <g class="v5b-jewel-slice is-lit">
        <path d="${basePath}" fill="url(#${gradId})" stroke="#fff3c4" stroke-width="1.45"/>
        <path d="${topFacet}" fill="rgba(255,255,255,0.28)"/>
        <path d="${glintFacet}" fill="${pal.litHi}" fill-opacity="0.46"/>
        <title>${escapeHtml(meta.shortLabel)} — ${pal.jewelName} Wedge (Earned!)</title>
      </g>
    `;
  }).join('');

  return `
    <svg class="v5b-medallion-svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 120 120" role="img" aria-label="${earnedSet.size} of 6 Championship Jewel Wedges earned">
      <defs>${defsParts.join('')}</defs>
      <circle cx="60" cy="60" r="57.5" fill="url(#v5m-brass-${uid})" stroke="#54340a" stroke-width="1.5"/>
      <circle cx="60" cy="60" r="53" fill="url(#v5m-ring-${uid})" stroke="#f9df8e" stroke-width="1.2"/>
      <circle cx="60" cy="60" r="48.2" fill="url(#v5m-brass-${uid})" stroke="#4c2e08" stroke-width="1.2"/>
      <circle cx="60" cy="60" r="45.6" fill="#18120c"/>
      ${slicesHtml}
      <circle cx="60" cy="60" r="10.2" fill="url(#v5m-brass-${uid})" stroke="#5a380c" stroke-width="1.4"/>
      <circle cx="60" cy="60" r="4.6" fill="#fff3c2" stroke="#99681a" stroke-width="1"/>
    </svg>
  `;
}

/**
 * Carved Mahogany & Brass Contestant Podium behind which the Stage-Right Challenger stands.
 */
function renderContestantPodiumSvg(hasRival: boolean, accentHex: string): string {
  return `
    <svg class="v5b-challenger-podium-svg" viewBox="0 0 180 126" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5p-wood-top" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#5d2d16"/>
          <stop offset="35%" stop-color="#9e562d"/>
          <stop offset="68%" stop-color="#7c3e1d"/>
          <stop offset="100%" stop-color="#471e0d"/>
        </linearGradient>
        <linearGradient id="v5p-wood-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3c1a0c"/>
          <stop offset="28%" stop-color="#7e4020"/>
          <stop offset="52%" stop-color="#9c542b"/>
          <stop offset="78%" stop-color="#6b3418"/>
          <stop offset="100%" stop-color="#2e1308"/>
        </linearGradient>
        <linearGradient id="v5p-brass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff0b5"/>
          <stop offset="40%" stop-color="#d6a03b"/>
          <stop offset="75%" stop-color="#7c5013"/>
          <stop offset="100%" stop-color="#f2cb6c"/>
        </linearGradient>
      </defs>
      <!-- Podium Crown Ledge -->
      <path d="M12 12 L168 12 L162 24 L18 24 Z" fill="url(#v5p-wood-top)" stroke="url(#v5p-brass)" stroke-width="2.5"/>
      <rect x="20" y="24" width="140" height="8" rx="2" fill="#46200f" stroke="#d9a845" stroke-width="1.2"/>
      <!-- Carved Tapered Body -->
      <path d="M30 32 L150 32 L138 124 L42 124 Z" fill="url(#v5p-wood-body)" stroke="#3d1b0c" stroke-width="2"/>
      <!-- Recessed Fluted Brass Panel -->
      <path d="M46 40 L134 40 L126 118 L54 118 Z" fill="#4a2210" stroke="url(#v5p-brass)" stroke-width="2"/>
      <!-- Central Vertical Brass Strip -->
      <rect x="85" y="42" width="10" height="74" rx="2" fill="url(#v5p-brass)" opacity="0.88"/>
      <!-- Crest Emblem -->
      <polygon points="90,54 106,68 90,82 74,68" fill="${hasRival ? accentHex : '#28529e'}" stroke="#ffe699" stroke-width="2"/>
      <circle cx="90" cy="68" r="5" fill="#fff1ba"/>
      <!-- Top Specular Highlight -->
      <line x1="22" y1="15" x2="158" y2="15" stroke="rgba(255,244,204,0.6)" stroke-width="1.5"/>
    </svg>
  `;
}

/**
 * Rich Category / Domain SVG Emblems (Theater Masks, Ringed Planet, Retro Cassette, Compass Rose, etc.).
 */
function renderDomainEmblemSvg(domainId: DomainId, inkHex: string, size = 34): string {
  const s = `${size}`;
  const open = `<svg class="v5b-tile-emblem-svg" width="${s}" height="${s}" viewBox="0 0 48 48" fill="none" aria-hidden="true">`;
  switch (domainId) {
    case 0: // World History — Imperial Crown & Scroll
      return `${open}
        <path d="M8 31L11 16L18.5 22L24 12L29.5 22L37 16L40 31H8Z" fill="${inkHex}" fill-opacity="0.88" stroke="${inkHex}" stroke-width="2" stroke-linejoin="round"/>
        <rect x="9" y="34" width="30" height="5" rx="2.5" fill="${inkHex}"/>
        <circle cx="24" cy="10" r="2.6" fill="${inkHex}"/>
        <circle cx="11" cy="14" r="2" fill="${inkHex}"/>
        <circle cx="37" cy="14" r="2" fill="${inkHex}"/>
        <circle cx="24" cy="25" r="2.4" fill="#fff7dc"/>
      </svg>`;
    case 1: // Science & Space — Iconic Ringed Planet (matches Cosmic Weirdos!)
      return `${open}
        <ellipse cx="24" cy="25" rx="21" ry="7.2" transform="rotate(-22 24 25)" stroke="${inkHex}" stroke-width="3.2"/>
        <circle cx="24" cy="24" r="11.2" fill="${inkHex}"/>
        <path d="M15 21.5C18.5 18.5 26 17.5 32 19.5" stroke="#f7eaff" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
        <path d="M6.2 31.6C12.5 31.5 27.5 26 41.8 18.4" stroke="${inkHex}" stroke-width="3.4" stroke-linecap="round"/>
        <circle cx="38" cy="10" r="2" fill="${inkHex}"/>
        <circle cx="10" cy="12" r="1.5" fill="${inkHex}"/>
      </svg>`;
    case 2: // Geography & Wonders — Ornate Compass Rose (matches Map Traps!)
      return `${open}
        <circle cx="24" cy="24" r="17" stroke="${inkHex}" stroke-width="2.8" fill="${inkHex}" fill-opacity="0.1"/>
        <circle cx="24" cy="24" r="12.5" stroke="${inkHex}" stroke-width="1.3" stroke-dasharray="2.5 2.5"/>
        <polygon points="24,8 28,21 24,24 20,21" fill="${inkHex}"/>
        <polygon points="24,40 28,27 24,24 20,27" fill="${inkHex}" fill-opacity="0.45"/>
        <polygon points="40,24 27,28 24,24 27,20" fill="${inkHex}" fill-opacity="0.65"/>
        <polygon points="8,24 21,28 24,24 21,20" fill="${inkHex}" fill-opacity="0.65"/>
        <circle cx="24" cy="24" r="3" fill="#fff4d2" stroke="${inkHex}" stroke-width="1.8"/>
      </svg>`;
    case 3: // Arts & Architecture — Artist Palette & Brush
      return `${open}
        <path d="M24 8C14.5 8 7 15 7 24C7 32.5 13.8 39 22 39C25 39 26.8 37 26.8 34.8C26.8 33.4 26.1 32.4 26.1 31.3C26.1 29.7 27.5 28.6 29.5 28.6H33.5C38.2 28.6 41 25.5 41 21.5C41 13.6 33.4 8 24 8Z" fill="${inkHex}" fill-opacity="0.88"/>
        <circle cx="16.5" cy="19" r="2.7" fill="#fff3f8"/>
        <circle cx="24.5" cy="15.5" r="2.7" fill="#fff3f8"/>
        <circle cx="32" cy="19.5" r="2.7" fill="#fff3f8"/>
        <circle cx="16" cy="27.5" r="2.7" fill="#fff3f8"/>
      </svg>`;
    case 4: // Film, Music & Pop — Iconic Retro Cassette (matches 90s Rewind!)
      return `${open}
        <rect x="6" y="12" width="36" height="24" rx="4" fill="${inkHex}"/>
        <rect x="10" y="15.5" width="28" height="11" rx="2" fill="#e8fcfc" fill-opacity="0.92"/>
        <circle cx="17.5" cy="21" r="3.4" stroke="${inkHex}" stroke-width="2.2" fill="none"/>
        <circle cx="30.5" cy="21" r="3.4" stroke="${inkHex}" stroke-width="2.2" fill="none"/>
        <line x1="21" y1="21" x2="27" y2="21" stroke="${inkHex}" stroke-width="2"/>
        <path d="M13 36L16 30H32L35 36" fill="#bce6e7" stroke="${inkHex}" stroke-width="1.4"/>
        <circle cx="19" cy="33" r="1.4" fill="${inkHex}"/>
        <circle cx="29" cy="33" r="1.4" fill="${inkHex}"/>
      </svg>`;
    case 5: // Sports & Games — Championship Laurel Cup
      return `${open}
        <path d="M14 10H34V20C34 25.8 29.5 30 24 30C18.5 30 14 25.8 14 20V10Z" fill="${inkHex}"/>
        <path d="M14 13H8.5C8.5 19 10.5 22.5 14 23M34 13H39.5C39.5 19 37.5 22.5 34 23" stroke="${inkHex}" stroke-width="2.8" stroke-linecap="round"/>
        <rect x="21" y="29" width="6" height="7" fill="${inkHex}"/>
        <rect x="14" y="35.5" width="20" height="4.5" rx="2" fill="${inkHex}"/>
        <polygon points="24,14 25.5,17.6 29.4,18 26.4,20.5 27.3,24.3 24,22.2 20.7,24.3 21.6,20.5 18.6,18 22.5,17.6" fill="#e9fcf3"/>
      </svg>`;
    case 6: // Tech & Computing — Broadcast Circuit Microchip
      return `${open}
        <rect x="13" y="13" width="22" height="22" rx="4" fill="${inkHex}"/>
        <rect x="18" y="18" width="12" height="12" rx="2" fill="#e6f3ff"/>
        <path d="M18 7V13M24 7V13M30 7V13M18 35V41M24 35V41M30 35V41M7 18H13M7 24H13M7 30H13M35 18H41M35 24H41M35 30H41" stroke="${inkHex}" stroke-width="2.8" stroke-linecap="round"/>
        <circle cx="24" cy="24" r="2.8" fill="${inkHex}"/>
      </svg>`;
    case 7: // Nature & Biology — Botanical Leaf & DNA Helix
      return `${open}
        <path d="M38 10C22 10 11 19 10 37C27 36 38 26 38 10Z" fill="${inkHex}"/>
        <path d="M10 38C16 30 24 22 34 14" stroke="#ebfceb" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M19 28L27 26M23 23L22 16" stroke="#ebfceb" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    case 8: // World Affairs & Law — Balanced Scales of Justice
      return `${open}
        <line x1="24" y1="8" x2="24" y2="38" stroke="${inkHex}" stroke-width="3" stroke-linecap="round"/>
        <line x1="11" y1="15" x2="37" y2="15" stroke="${inkHex}" stroke-width="3" stroke-linecap="round"/>
        <path d="M11 15L6.5 27H15.5L11 15Z" fill="${inkHex}" fill-opacity="0.22" stroke="${inkHex}" stroke-width="2"/>
        <path d="M37 15L32.5 27H41.5L37 15Z" fill="${inkHex}" fill-opacity="0.22" stroke="${inkHex}" stroke-width="2"/>
        <rect x="15" y="36.5" width="18" height="4" rx="2" fill="${inkHex}"/>
        <circle cx="24" cy="11" r="2.8" fill="${inkHex}"/>
      </svg>`;
    case 9: // Food, Craft & Design — Silver Culinary Cloche
      return `${open}
        <circle cx="24" cy="12" r="3" fill="${inkHex}"/>
        <path d="M9 32C9 22.5 15.7 15 24 15C32.3 15 39 22.5 39 32H9Z" fill="${inkHex}"/>
        <path d="M16 26C16.8 21.5 19.8 18.8 23.5 18.2" stroke="#fff0e6" stroke-width="2.2" stroke-linecap="round"/>
        <rect x="6" y="33.5" width="36" height="4.5" rx="2.2" fill="${inkHex}"/>
      </svg>`;
    case 10: // Myth & Literature — Iconic Drama Theater Masks (matches Plot Twists!)
      return `${open}
        <path d="M7 13C12 10 19 10 24 13V25C24 31.5 19.5 36.5 15.5 38C11.5 36.5 7 31.5 7 25V13Z" fill="${inkHex}"/>
        <path d="M24 16C28.5 13.5 35.5 13.5 41 16V27C41 33 36.8 37.5 32.5 39C28.2 37.5 24 33 24 27V16Z" fill="${inkHex}" fill-opacity="0.82" stroke="#fff7f7" stroke-width="1.3"/>
        <path d="M11 20.5C12.2 19 13.8 19 14.8 20.5M17.2 20.5C18.2 19 19.8 19 21 20.5" stroke="#fff7f7" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M11.5 27.5C13.5 30.5 17.8 30.5 19.8 27.5" stroke="#fff7f7" stroke-width="2" stroke-linecap="round"/>
        <path d="M28 23.5L30.8 24.5M37 23.5L34.2 24.5" stroke="#fff7f7" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M28.5 32.5C30.5 30 34.5 30 36.5 32.5" stroke="#fff7f7" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    case 11: // Logic & Math — Faceted Geometric Prism & Pi
    default:
      return `${open}
        <polygon points="24,7 41,35 7,35" fill="${inkHex}" fill-opacity="0.88" stroke="${inkHex}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="24,14 34,31 14,31" fill="#f1edff" fill-opacity="0.9"/>
        <line x1="24" y1="7" x2="24" y2="35" stroke="${inkHex}" stroke-width="2"/>
        <circle cx="24" cy="24" r="3" fill="${inkHex}"/>
      </svg>`;
  }
}

/**
 * Custom SVG Emblems for Non-Classic Interactive Formats (Cable Plugs, Timeline Hourglass,
 * Speedometer Dial, Multi-Strike Grid, Clue Spotlight, Visual Spyglass).
 */
function renderFormatEmblemSvg(format: QuestionFormatV4, inkHex: string, size = 34): string {
  const s = `${size}`;
  const open = `<svg class="v5b-tile-emblem-svg" width="${s}" height="${s}" viewBox="0 0 48 48" fill="none" aria-hidden="true">`;
  switch (format) {
    case 'MATCH_4': // Braided Broadcast Patch Cable Plugs
      return `${open}
        <path d="M12 16C20 16 20 32 36 32" stroke="${inkHex}" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M12 32C22 32 24 16 36 16" stroke="${inkHex}" stroke-width="3.6" stroke-linecap="round" stroke-opacity="0.55"/>
        <rect x="5" y="12" width="9" height="8" rx="2" fill="${inkHex}"/>
        <rect x="5" y="28" width="9" height="8" rx="2" fill="${inkHex}"/>
        <rect x="34" y="12" width="9" height="8" rx="2" fill="${inkHex}"/>
        <rect x="34" y="28" width="9" height="8" rx="2" fill="${inkHex}"/>
        <circle cx="9.5" cy="16" r="1.6" fill="#fff7dc"/>
        <circle cx="38.5" cy="32" r="1.6" fill="#fff7dc"/>
      </svg>`;
    case 'SORT_4': // Timeline Chronology Hourglass
      return `${open}
        <rect x="11" y="7" width="26" height="4.5" rx="2" fill="${inkHex}"/>
        <rect x="11" y="36.5" width="26" height="4.5" rx="2" fill="${inkHex}"/>
        <path d="M14 11.5H34C34 18.5 27.5 22 26 24C27.5 26 34 29.5 34 36.5H14C14 29.5 20.5 26 22 24C20.5 22 14 18.5 14 11.5Z" fill="${inkHex}" fill-opacity="0.22" stroke="${inkHex}" stroke-width="2.6" stroke-linejoin="round"/>
        <polygon points="18,15 30,15 24,21.5" fill="${inkHex}"/>
        <polygon points="17.5,35 30.5,35 24,29" fill="${inkHex}"/>
      </svg>`;
    case 'PINPOINT_DIAL': // Precision Brass Speedometer / Pinpoint Dial
      return `${open}
        <path d="M8 33A16 16 0 1 1 40 33" stroke="${inkHex}" stroke-width="3.8" stroke-linecap="round"/>
        <path d="M13 31A11.5 11.5 0 0 1 35 31" stroke="${inkHex}" stroke-width="1.6" stroke-dasharray="3 3"/>
        <line x1="24" y1="32" x2="34.5" y2="18.5" stroke="${inkHex}" stroke-width="3.2" stroke-linecap="round"/>
        <circle cx="24" cy="32" r="4.2" fill="${inkHex}"/>
        <circle cx="24" cy="32" r="1.6" fill="#fff7dc"/>
      </svg>`;
    case 'MULTI_STRIKE': // 2x2 Strike Switch Matrix
      return `${open}
        <rect x="8" y="8" width="14" height="14" rx="3.2" fill="${inkHex}"/>
        <polyline points="11.5,15.5 14.2,18.2 19,12.5" stroke="#fff7dc" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="26" y="8" width="14" height="14" rx="3.2" fill="${inkHex}" fill-opacity="0.22" stroke="${inkHex}" stroke-width="2.2"/>
        <rect x="8" y="26" width="14" height="14" rx="3.2" fill="${inkHex}" fill-opacity="0.22" stroke="${inkHex}" stroke-width="2.2"/>
        <rect x="26" y="26" width="14" height="14" rx="3.2" fill="${inkHex}"/>
        <polyline points="29.5,33.5 32.2,36.2 37,30.5" stroke="#fff7dc" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    case 'CLUE_ESCALATOR': // 3-Tier Escalating Spotlight Bars
      return `${open}
        <rect x="8" y="28" width="8.5" height="12" rx="2.5" fill="${inkHex}" fill-opacity="0.5"/>
        <rect x="19.8" y="20" width="8.5" height="20" rx="2.5" fill="${inkHex}" fill-opacity="0.75"/>
        <rect x="31.5" y="11" width="8.5" height="29" rx="2.5" fill="${inkHex}"/>
        <polygon points="35.8,4 37.3,7.3 41,7.8 38.3,10.2 39,13.6 35.8,11.9 32.6,13.6 33.3,10.2 30.6,7.8 34.3,7.3" fill="${inkHex}"/>
      </svg>`;
    case 'VISUAL_SPOTTER': // Broadcast Viewfinder Lens
      return `${open}
        <path d="M8 16V10H15M33 10H40V16M8 32V38H15M33 38H40V32" stroke="${inkHex}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="24" cy="24" r="9.5" fill="${inkHex}" fill-opacity="0.2" stroke="${inkHex}" stroke-width="2.8"/>
        <circle cx="24" cy="24" r="4" fill="${inkHex}"/>
      </svg>`;
    case 'MULTIPLE_CHOICE':
    default:
      return renderDomainEmblemSvg(0, inkHex, size);
  }
}

/**
 * Heavy Crossed 3D-Shaded Iron Chains & Central Gold Brass Padlock overlay for LOCKED tiles!
 */
function renderChainsAndPadlockSvg(uid: string): string {
  const linkOffsets = [-28, -16, -4, 8, 20, 32];
  const diagA = linkOffsets
    .map(
      (d) =>
        `<rect x="${50 + d - 7}" y="${39 + d * 0.72 - 4}" width="14" height="8" rx="4" transform="rotate(35 ${50 + d} ${39 + d * 0.72})" fill="url(#v5ch-iron-${uid})" stroke="#171b22" stroke-width="1.5"/>
         <ellipse cx="${50 + d}" cy="${39 + d * 0.72}" rx="3.4" ry="1.4" transform="rotate(35 ${50 + d} ${39 + d * 0.72})" fill="#1c2029"/>`,
    )
    .join('');
  const diagB = linkOffsets
    .map(
      (d) =>
        `<rect x="${50 + d - 7}" y="${39 - d * 0.72 - 4}" width="14" height="8" rx="4" transform="rotate(-35 ${50 + d} ${39 - d * 0.72})" fill="url(#v5ch-iron-${uid})" stroke="#171b22" stroke-width="1.5"/>
         <ellipse cx="${50 + d}" cy="${39 - d * 0.72}" rx="3.4" ry="1.4" transform="rotate(-35 ${50 + d} ${39 - d * 0.72})" fill="#1c2029"/>`,
    )
    .join('');

  return `
    <svg class="v5b-chains-overlay" viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5ch-iron-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#c9d2df"/>
          <stop offset="35%" stop-color="#6e7785"/>
          <stop offset="72%" stop-color="#353b47"/>
          <stop offset="100%" stop-color="#8b95a6"/>
        </linearGradient>
        <linearGradient id="v5ch-lock-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff4b8"/>
          <stop offset="32%" stop-color="#e3b144"/>
          <stop offset="70%" stop-color="#966316"/>
          <stop offset="100%" stop-color="#f2cd6d"/>
        </linearGradient>
      </defs>
      <!-- Shadow under crossed chains -->
      <line x1="6" y1="8" x2="94" y2="70" stroke="rgba(0,0,0,0.55)" stroke-width="11" stroke-linecap="round"/>
      <line x1="94" y1="8" x2="6" y2="70" stroke="rgba(0,0,0,0.55)" stroke-width="11" stroke-linecap="round"/>
      <g class="v5b-chain-strand-a">${diagA}</g>
      <g class="v5b-chain-strand-b">${diagB}</g>
      <!-- Central 3D Gold Brass Padlock (lifted slightly so point value gleams cleanly below) -->
      <g class="v5b-padlock-body" transform="translate(0, -6)">
        <path d="M41 29V21.5C41 16 45 12 50 12C55 12 59 16 59 21.5V29" fill="none" stroke="url(#v5ch-iron-${uid})" stroke-width="5" stroke-linecap="round"/>
        <path d="M41 29V21.5C41 16 45 12 50 12C55 12 59 16 59 21.5V29" fill="none" stroke="#181c24" stroke-width="1.2"/>
        <rect x="35.5" y="27" width="29" height="22" rx="4.5" fill="url(#v5ch-lock-${uid})" stroke="#4c2e09" stroke-width="1.8"/>
        <line x1="39" y1="30.5" x2="61" y2="30.5" stroke="#fff7cf" stroke-width="1.4" opacity="0.8"/>
        <circle cx="50" cy="36.5" r="3.1" fill="#2b1905"/>
        <polygon points="48.4,38 51.6,38 52.5,44.5 47.5,44.5" fill="#2b1905"/>
      </g>
    </svg>
  `;
}

/**
 * Special Twist Tile Emblems (Spinning Golden Wheel, Sizzling Time-Bomb, Fiery Crosshair Bounty,
 * Power-Play Double Diamond, Crown Wedge Jewel).
 */
function renderSpecialTwistSvg(
  twist: 'WHEEL' | 'TIME_BOMB' | 'RIVAL_BOUNTY' | 'POWER_PLAY' | 'CROWN_WEDGE' | 'FLAME_THAW' | 'SPIRAL_CORE' | 'PYRAMID_APEX',
  wedgeId: WedgeColorId,
): string {
  switch (twist) {
    case 'WHEEL':
      return `
        <svg class="v5b-twist-svg is-wheel-spin" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="19.5" fill="#5e3204" stroke="#fff2b0" stroke-width="2.4"/>
          <path d="M24 24L24 5.5A18.5 18.5 0 0 1 40 14.8Z" fill="#ffd866"/>
          <path d="M24 24L40 14.8A18.5 18.5 0 0 1 40 33.2Z" fill="#d97b16"/>
          <path d="M24 24L40 33.2A18.5 18.5 0 0 1 24 42.5Z" fill="#fff099"/>
          <path d="M24 24L24 42.5A18.5 18.5 0 0 1 8 33.2Z" fill="#b8610a"/>
          <path d="M24 24L8 33.2A18.5 18.5 0 0 1 8 14.8Z" fill="#f5b72b"/>
          <path d="M24 24L8 14.8A18.5 18.5 0 0 1 24 5.5Z" fill="#994b06"/>
          <circle cx="24" cy="24" r="18.5" stroke="#5e3204" stroke-width="1.4"/>
          <circle cx="24" cy="24" r="5" fill="#fff6cc" stroke="#663705" stroke-width="2"/>
          <polygon points="24,1.5 27.5,8.5 20.5,8.5" fill="#fff7d1" stroke="#5e3204" stroke-width="1.2"/>
        </svg>
      `;
    case 'TIME_BOMB':
      return `
        <svg class="v5b-twist-svg" viewBox="0 0 54 46" fill="none" aria-hidden="true">
          <!-- Fuse -->
          <path d="M29 14C32 9 37 8 41 11" stroke="#804a17" stroke-width="3" stroke-linecap="round"/>
          <!-- Flickering Spark Burst -->
          <g class="v5b-fuse-spark">
            <polygon points="42,3 44,9 50,8 45.5,12.5 49,17 43,15 41,20 39.5,14.5 34,15.5 38.5,11 35,6.5 40.5,8.5" fill="#ff9d1c"/>
            <circle cx="42" cy="11.5" r="3.4" fill="#fff6b8"/>
          </g>
          <!-- Bomb Collar & Body -->
          <rect x="21" y="11.5" width="9" height="5" rx="1.6" fill="#6b441f" stroke="#261408" stroke-width="1.5"/>
          <circle cx="24" cy="28" r="14" fill="#2d1d18" stroke="#69422b" stroke-width="2"/>
          <path d="M16 23C16.8 19.5 19.6 17.5 23 17" stroke="#ffb36b" stroke-width="2.6" stroke-linecap="round" opacity="0.85"/>
          <circle cx="19" cy="22" r="2.2" fill="#fff0cc" opacity="0.7"/>
        </svg>
      `;
    case 'RIVAL_BOUNTY':
      return `
        <svg class="v5b-twist-svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="16" stroke="#ffcf54" stroke-width="3"/>
          <circle cx="24" cy="24" r="9.5" stroke="#ff7a2e" stroke-width="2.4"/>
          <line x1="24" y1="3" x2="24" y2="14" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/>
          <line x1="24" y1="34" x2="24" y2="45" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/>
          <line x1="3" y1="24" x2="14" y2="24" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/>
          <line x1="34" y1="24" x2="45" y2="24" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/>
          <circle cx="24" cy="24" r="3.4" fill="#fff5b8"/>
        </svg>
      `;
    case 'POWER_PLAY':
      return `
        <svg class="v5b-twist-svg" viewBox="0 0 52 44" fill="none" aria-hidden="true">
          <polygon points="18,6 31,22 18,38 5,22" fill="#ffe17d" stroke="#5e3906" stroke-width="2"/>
          <polygon points="18,12 25.5,22 18,32 10.5,22" fill="#fff9db" fill-opacity="0.7"/>
          <polygon points="34,6 47,22 34,38 21,22" fill="#f5b324" stroke="#5e3906" stroke-width="2"/>
          <polygon points="34,12 41.5,22 34,32 26.5,22" fill="#fff5c0" fill-opacity="0.8"/>
          <circle cx="26" cy="22" r="3.5" fill="#ffffff"/>
        </svg>
      `;
    case 'CROWN_WEDGE': {
      const pal = JEWEL_PALETTE_V5[wedgeId];
      return `
        <svg class="v5b-twist-svg" viewBox="0 0 50 44" fill="none" aria-hidden="true">
          <path d="M7 33L11 13L19.5 21L25 8L30.5 21L39 13L43 33H7Z" fill="${pal.litMid}" stroke="#fff4c4" stroke-width="2.2" stroke-linejoin="round"/>
          <polygon points="25,11 29,21 25,29 21,21" fill="${pal.litHi}" fill-opacity="0.85"/>
          <rect x="8" y="34" width="34" height="5" rx="2.4" fill="#f5c654" stroke="#5c3807" stroke-width="1.4"/>
          <circle cx="25" cy="7" r="2.6" fill="#fff6cc"/>
        </svg>
      `;
    }
    case 'FLAME_THAW':
      return `
        <svg class="v5b-twist-svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M25 5C27 14 19 18 19 25C19 28.5 21.5 31 24.5 31C28.8 31 31.5 27.2 30.8 22.4C35.8 26 39 31.5 39 37C39 42 32.5 44 24 44C15.5 44 9 39.2 9 31.5C9 21.5 16.2 13.5 25 5Z" fill="#ff741c" stroke="#fff0a6" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M24 22C25.2 26.5 20.5 29 20.5 33.5C20.5 36.5 22.8 39 25.5 39C28.8 39 31.5 36.2 31.5 32.5C31.5 28.5 28.5 24.8 24 22Z" fill="#fff29e"/>
        </svg>
      `;
    case 'SPIRAL_CORE':
      return `
        <svg class="v5b-twist-svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="18" stroke="#ffe485" stroke-width="2.6" stroke-dasharray="6 3"/>
          <polygon points="24,8 37,24 24,40 11,24" fill="#1cd987" stroke="#fff4bf" stroke-width="2.2"/>
          <polygon points="24,14 31,24 24,34 17,24" fill="#9dffcf"/>
          <circle cx="24" cy="24" r="3.5" fill="#ffffff"/>
        </svg>
      `;
    case 'PYRAMID_APEX':
      return `
        <svg class="v5b-twist-svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <polygon points="24,6 43,39 5,39" fill="#f5be36" stroke="#fff4c4" stroke-width="2.2" stroke-linejoin="round"/>
          <polygon points="24,6 32,39 24,39" fill="#c78312" fill-opacity="0.45"/>
          <line x1="12" y1="28" x2="36" y2="28" stroke="#6b4006" stroke-width="1.8"/>
          <circle cx="24" cy="18" r="3.4" fill="#fff7d1" stroke="#6b4006" stroke-width="1.4"/>
        </svg>
      `;
  }
}

/**
 * Physical Sculpted Podium Lucky Charm SVGs resting inside the 3 Recessed Brass Cups!
 */
function renderPhysicalCharmSvg(kind: PodiumCharmSpecV5['svgEmblemKind'], accentHex: string): string {
  const open = `<svg class="v5b-charm-prop-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">`;
  switch (kind) {
    case 'watch': // Antique Brass Pocket Watch (matches mockup cup 1!)
      return `${open}
        <circle cx="32" cy="11" r="5" stroke="#f5d072" stroke-width="3.2"/>
        <rect x="28.5" y="14" width="7" height="5" rx="1.6" fill="#d9a43b"/>
        <circle cx="32" cy="36" r="20" fill="#c7922e" stroke="#fff0b3" stroke-width="2.5"/>
        <circle cx="32" cy="36" r="15.5" fill="#fcf5e3" stroke="#7d5214" stroke-width="2"/>
        <path d="M32 23V25.5M32 46.5V49M19 36H21.5M42.5 36H45" stroke="#472d12" stroke-width="2" stroke-linecap="round"/>
        <line x1="32" y1="36" x2="25" y2="29" stroke="#24160a" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="32" y1="36" x2="41" y2="33" stroke="#8c1c28" stroke-width="2" stroke-linecap="round"/>
        <circle cx="32" cy="36" r="2.4" fill="#c7922e"/>
      </svg>`;
    case 'fountain_pen': // Denise's Red & Gold Fountain Pen (matches mockup cup 2!)
      return `${open}
        <g transform="rotate(36 32 32)">
          <rect x="26" y="10" width="12" height="31" rx="5" fill="#a81628" stroke="#f7d577" stroke-width="2"/>
          <rect x="26" y="23" width="12" height="4.5" fill="#f5cd69"/>
          <line x1="30" y1="13" x2="30" y2="37" stroke="#ff7a8b" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
          <polygon points="27,41 37,41 32,57" fill="#f5cd69" stroke="#5e3a09" stroke-width="1.5"/>
          <line x1="32" y1="44" x2="32" y2="54" stroke="#4a2c05" stroke-width="1.6"/>
          <circle cx="32" cy="46" r="1.6" fill="#4a2c05"/>
        </g>
      </svg>`;
    case 'chip': // Golden Lucky Clover Medallion Coin (matches mockup cup 3!)
      return `${open}
        <circle cx="32" cy="33" r="21" fill="#c9932c" stroke="#fff0b0" stroke-width="2.6"/>
        <circle cx="32" cy="33" r="16.5" fill="#e6b74c" stroke="#855813" stroke-width="1.8"/>
        <circle cx="27" cy="28" r="5.5" fill="#9c6a15"/>
        <circle cx="37" cy="28" r="5.5" fill="#9c6a15"/>
        <circle cx="27" cy="37" r="5.5" fill="#9c6a15"/>
        <circle cx="37" cy="37" r="5.5" fill="#9c6a15"/>
        <circle cx="27.5" cy="28.5" r="4" fill="#fae08c"/>
        <circle cx="36.5" cy="28.5" r="4" fill="#fae08c"/>
        <circle cx="27.5" cy="36.5" r="4" fill="#fae08c"/>
        <circle cx="36.5" cy="36.5" r="4" fill="#fae08c"/>
        <path d="M32 39C32 44 30 47 26.5 48" stroke="#7d500d" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`;
    case 'coaster': // Frankie's Vintage Pub Coaster
      return `${open}
        <circle cx="32" cy="32" r="21" fill="#8f5023" stroke="#f7d57c" stroke-width="2.6" stroke-dasharray="6 3"/>
        <circle cx="32" cy="32" r="15.5" fill="#f7ebd2" stroke="#6b3413" stroke-width="2"/>
        <path d="M25 25H39V34C39 38 36 41 32 41C28 41 25 38 25 34V25Z" fill="#d99021" stroke="#4f260b" stroke-width="1.8"/>
        <path d="M24 25C24 22 27 21 29 22.5C31 20.5 34.5 21 36 22.5C38 21.5 40 23 40 25H24Z" fill="#ffffff"/>
      </svg>`;
    case 'mic': // Trevor's Hot Studio Mic
      return `${open}
        <rect x="23" y="10" width="18" height="26" rx="9" fill="#d9a63b" stroke="#fff3be" stroke-width="2.4"/>
        <line x1="25" y1="18" x2="39" y2="18" stroke="#4f3107" stroke-width="2"/>
        <line x1="25" y1="23" x2="39" y2="23" stroke="#4f3107" stroke-width="2"/>
        <line x1="25" y1="28" x2="39" y2="28" stroke="#4f3107" stroke-width="2"/>
        <path d="M17 29C17 37.5 23.7 44 32 44C40.3 44 47 37.5 47 29" stroke="#f2ca6b" stroke-width="3.2" stroke-linecap="round"/>
        <line x1="32" y1="44" x2="32" y2="54" stroke="#f2ca6b" stroke-width="3.6"/>
        <rect x="21" y="52" width="22" height="4.5" rx="2.2" fill="#e3b144"/>
      </svg>`;
    case 'pulse': // Priya's Adrenaline Ampoule
      return `${open}
        <circle cx="32" cy="32" r="20" fill="#5e1023" stroke="#ff9db6" stroke-width="2.6"/>
        <polyline points="14,33 22,33 26,21 31,43 36,27 40,33 50,33" stroke="#fff0b8" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    case 'circuit': // Kenji's Cyber Neural Link
      return `${open}
        <polygon points="32,10 51,21 51,43 32,54 13,43 13,21" fill="#103661" stroke="#6ee2ff" stroke-width="2.6"/>
        <circle cx="32" cy="32" r="7" fill="#32d9ff" stroke="#ffffff" stroke-width="2"/>
        <path d="M32 14V25M32 39V50M17 23L26 28.5M38 35.5L47 41M47 23L38 28.5M26 35.5L17 41" stroke="#f5d376" stroke-width="2.2"/>
      </svg>`;
    case 'astrolabe': // Nadia's Celestial Brass Astrolabe
      return `${open}
        <circle cx="32" cy="32" r="20" stroke="#f7d577" stroke-width="3.2" fill="#1c2f59"/>
        <circle cx="32" cy="32" r="13" stroke="#e0ad42" stroke-width="2" stroke-dasharray="4 3"/>
        <ellipse cx="32" cy="32" rx="19" ry="7.5" transform="rotate(-28 32 32)" stroke="#fff0b8" stroke-width="2"/>
        <circle cx="32" cy="32" r="4.5" fill="#ffd454"/>
      </svg>`;
    case 'megaphone': // Grassroots Brass Megaphone
      return `${open}
        <path d="M16 28L45 14V46L16 36V28Z" fill="#e3ad3b" stroke="#fff3c4" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="11" y="27" width="7" height="10" rx="2" fill="#8f202c" stroke="#f5cd69" stroke-width="1.6"/>
        <path d="M19 37L23 50H29L25 38" fill="#5e2a14" stroke="#f5cd69" stroke-width="1.6"/>
        <line x1="48" y1="22" x2="54" y2="19" stroke="#fff2b5" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="48" y1="30" x2="55" y2="30" stroke="#fff2b5" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="48" y1="38" x2="54" y2="41" stroke="#fff2b5" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`;
    case 'dice': // Syndicate Golden Dice
      return `${open}
        <rect x="12" y="21" width="24" height="24" rx="5" transform="rotate(-12 24 33)" fill="#f2c452" stroke="#66400a" stroke-width="2"/>
        <rect x="28" y="17" width="24" height="24" rx="5" transform="rotate(14 40 29)" fill="#ffe38a" stroke="#66400a" stroke-width="2"/>
        <circle cx="21" cy="30" r="2.2" fill="#472a05"/>
        <circle cx="27" cy="36" r="2.2" fill="#472a05"/>
        <circle cx="36" cy="24" r="2.2" fill="#472a05"/>
        <circle cx="44" cy="27" r="2.2" fill="#472a05"/>
        <circle cx="39" cy="33" r="2.2" fill="#472a05"/>
      </svg>`;
    case 'seal': // Velvet Crimson Wax Seal
      return `${open}
        <circle cx="32" cy="32" r="21" fill="#a8132c" stroke="#ff94a8" stroke-width="2.2"/>
        <circle cx="32" cy="32" r="15" fill="#7d0b1f" stroke="#f7d374" stroke-width="2.2"/>
        <path d="M23 36L25.5 24L30 29L32 22L34 29L38.5 24L41 36H23Z" fill="#ffe18c"/>
      </svg>`;
    case 'shield': // Riveted Brass Screw-Shield
    default:
      return `${open}
        <path d="M32 9L50 17V32C50 43.5 42.5 51.5 32 55C21.5 51.5 14 43.5 14 32V17L32 9Z" fill="${accentHex || '#2759a8'}" stroke="#ffe699" stroke-width="3"/>
        <path d="M32 15L44 20.5V31.5C44 39.5 39 45.5 32 48.2V15Z" fill="rgba(255,255,255,0.2)"/>
        <polygon points="32,23 34.4,28.5 40,29 35.8,33 37,38.5 32,35.6 27,38.5 28.2,33 24,29 29.6,28.5" fill="#fff2b5"/>
      </svg>`;
  }
}

// ============================================================================
// 5. SCOPED CSS STYLESHEET (ZERO glass-blur filters, ZERO overflow, AAA CRAFT)
// ============================================================================

const SCOPED_STYLES_CSS = `
/* === WORLD'S SMARTEST v5.0 — LIVING STAGE BOARD VIEW === */
.v5b-root {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  max-width: 100%;
  overflow-x: clip;
  overflow-y: auto;
  pointer-events: auto;
  touch-action: pan-y;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #fff9eb;
  background: #061026;
  box-sizing: border-box;
  max-width: 100vw;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
.v5b-root *, .v5b-root *::before, .v5b-root *::after {
  box-sizing: border-box;
}
.v5b-root [hidden] {
  display: none !important;
}

/* Full-bleed painted theatrical venue backdrop */
.v5b-stage-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: #061026;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}
.v5b-stage-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 46% 42% at 18% 0%, rgba(255, 206, 118, 0.34) 0%, rgba(255, 206, 118, 0) 72%),
    radial-gradient(ellipse 46% 42% at 82% 0%, rgba(105, 198, 255, 0.34) 0%, rgba(105, 198, 255, 0) 72%),
    radial-gradient(ellipse 38% 36% at 50% 24%, rgba(255, 214, 102, 0.24) 0%, rgba(255, 214, 102, 0) 72%),
    linear-gradient(180deg, rgba(6, 14, 34, 0.22) 0%, rgba(7, 17, 42, 0.56) 44%, rgba(5, 13, 32, 0.92) 78%, #050c1f 100%);
}
.v5b-stage-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(112deg, rgba(255, 214, 128, 0.14) 0%, transparent 28%),
    linear-gradient(248deg, rgba(96, 186, 255, 0.16) 0%, transparent 28%);
}

/* Main stacked stage layout */
.v5b-stage-canvas {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: min(100%, 1180px);
  min-height: 100dvh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 8px 0;
  overflow-x: hidden;
}
.v5b-landscape-left-col,
.v5b-landscape-right-col {
  display: contents;
}
.v5b-top-rail { order: 1; }
.v5b-stage-vista { order: 2; }
.v5b-score-plaques-row { order: 3; }
.v5b-speech-strip { order: 4; }
.v5b-alert-slot { order: 5; }
.v5b-board-stage-wrap { order: 6; }
.v5b-podium-ledge-wrap { order: 7; }

/* Top Floating Brass Broadcast Controls */
.v5b-top-rail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 4px 2px;
  position: relative;
  z-index: 18;
}
.v5b-rail-group {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.v5b-brass-pill-btn, .v5b-brass-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 32px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1.5px solid #d9ab4c;
  background: linear-gradient(180deg, #1b3161 0%, #0b1836 100%);
  color: #fff6dc;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 240, 190, 0.4);
  white-space: nowrap;
}
.v5b-brass-pill-btn {
  cursor: pointer;
  transition: transform 0.14s ease, filter 0.14s ease;
}
.v5b-brass-pill-btn:hover {
  filter: brightness(1.14);
  transform: translateY(-1px);
}
.v5b-brass-pill-btn:active {
  transform: translateY(1px);
}
.v5b-brass-icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
}
.v5b-brass-badge.is-gold {
  background: linear-gradient(180deg, #ffe799 0%, #c98f24 100%);
  color: #241403;
  border-color: #fff3c4;
}
.v5b-venue-chip {
  display: none;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  color: #ffe399;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.85);
}

/* ============================================================================
   UPPER THEATRICAL STAGE VISTA (HOST LEFT + MEDALLION CENTER + RIVAL RIGHT)
   ============================================================================ */
.v5b-stage-vista {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: end;
  width: 100%;
  min-height: 152px;
  margin-top: -8px;
  padding-bottom: 2px;
  z-index: 10;
}

/* Stage Left: Host Max Sterling */
.v5b-host-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  min-width: 0;
  z-index: 6;
}
.v5b-actor-wrap {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  pointer-events: none;
}
.v5b-host-cutout {
  height: 150px;
  width: auto;
  max-width: 132px;
  object-fit: contain;
  object-position: bottom center;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.72));
  transform-origin: bottom center;
  animation: v5b-actor-breathe 4.2s ease-in-out infinite;
  margin-bottom: -14px;
  margin-left: -4px;
}

/* Stage Right: Challenger behind Mahogany & Brass Podium */
.v5b-rival-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  min-width: 0;
  z-index: 6;
}
.v5b-rival-stage-stack {
  position: relative;
  width: 128px;
  height: 148px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
  margin-bottom: -14px;
  margin-right: -2px;
}
.v5b-rival-cutout {
  position: absolute;
  bottom: 38px;
  left: 50%;
  transform: translateX(-50%);
  height: 108px;
  width: auto;
  max-width: 106px;
  object-fit: contain;
  object-position: bottom center;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.72));
  z-index: 1;
  animation: v5b-actor-breathe 4.6s ease-in-out infinite reverse;
}
.v5b-challenger-podium-svg {
  position: relative;
  z-index: 2;
  width: 114px;
  height: auto;
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.78));
}
.v5b-solo-podium-spotlight {
  position: absolute;
  bottom: 58px;
  left: 50%;
  transform: translateX(-50%);
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 224, 130, 0.36) 0%, rgba(255, 224, 130, 0) 70%);
  z-index: 1;
}

/* Center: Glowing 6-Wedge Jewel Championship Medallion + Turn Ribbon */
.v5b-center-medallion-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  z-index: 16;
  margin: 0 -10px;
  padding-bottom: 10px;
}
.v5b-medallion-halo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.v5b-medallion-halo::before {
  content: '';
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 214, 102, 0.62) 0%, rgba(255, 190, 66, 0.22) 48%, rgba(255, 190, 66, 0) 74%);
  animation: v5b-medallion-pulse 3.2s ease-in-out infinite;
  pointer-events: none;
}
.v5b-medallion-svg {
  position: relative;
  z-index: 2;
  display: block;
  width: 84px;
  height: 84px;
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.78));
}
.v5b-turn-ribbon {
  position: relative;
  z-index: 4;
  margin-top: -6px;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1.5px solid #f2c968;
  background: linear-gradient(180deg, #1b2f5c 0%, #0b1633 100%);
  color: #ffe7a3;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.78);
  white-space: nowrap;
}

/* Diamond-Tipped Brass-and-Sapphire Score Plaques Row */
.v5b-score-plaques-row {
  position: relative;
  z-index: 14;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
  max-width: 780px;
  margin: -6px auto 4px;
  padding: 0 2px;
}
.v5b-score-plaque-wrap {
  position: relative;
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.78));
}
.v5b-score-plaque-rim {
  padding: 2.5px;
  background: linear-gradient(180deg, #fff2b8 0%, #d9a43d 34%, #7c5012 66%, #f0c969 100%);
  clip-path: polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%);
}
.v5b-score-plaque-face {
  position: relative;
  padding: 4px 12px;
  background: linear-gradient(180deg, #1d356b 0%, #0c1b3e 100%);
  clip-path: polygon(11px 0%, calc(100% - 11px) 0%, 100% 50%, calc(100% - 11px) 100%, 11px 100%, 0% 50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 36px;
}
.v5b-score-plaque-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff6dc;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.85);
  white-space: nowrap;
}
.v5b-score-plaque-pts {
  color: #ffe182;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13.5px;
  font-weight: 800;
}
.v5b-score-plaque-sub {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 1px;
  font-size: 10px;
  font-weight: 700;
  color: #b7cbed;
  letter-spacing: 0.04em;
}
.v5b-streak-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #ffd666;
  font-weight: 800;
}
.v5b-solo-bar-track {
  width: 82%;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  margin-top: 3px;
  overflow: hidden;
}
.v5b-solo-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f5b932, #fff1a8);
}

/* Sculpted Angled Speech Bubbles (Host + Rival + Onboarding Callout) */
.v5b-speech-strip {
  position: relative;
  z-index: 15;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: center;
  gap: 5px;
  width: 100%;
  max-width: 820px;
  margin: 0 auto 3px;
  padding: 0 2px;
}
.v5b-speech-bubble {
  position: relative;
  flex: 1 1 220px;
  padding: 4px 10px 4px 11px;
  border-radius: 10px 12px 10px 4px;
  border: 1.8px solid #d9a843;
  background: linear-gradient(180deg, #fffdf5 0%, #f3e4c3 100%);
  color: #1f160d;
  font-size: 11px;
  line-height: 1.24;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.52), inset 0 1px 0 #ffffff;
  transform: rotate(-0.4deg);
}
.v5b-speech-bubble::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 22px;
  width: 12px;
  height: 10px;
  background: #fffdf5;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  border-bottom: none;
}
.v5b-speech-bubble.is-rival {
  border-color: #d64560;
  background: linear-gradient(180deg, #fff5f7 0%, #f7d7de 100%);
  color: #2b0c14;
  border-radius: 14px 12px 4px 12px;
  transform: rotate(0.5deg);
}
.v5b-speech-bubble.is-rival::before {
  left: auto;
  right: 22px;
  background: #fff5f7;
}
.v5b-speech-speaker {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #7d4a08;
  margin-right: 5px;
}
.v5b-speech-bubble.is-rival .v5b-speech-speaker {
  color: #9e1530;
}
.v5b-onboarding-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
  padding: 2px 7px;
  border-radius: 6px;
  background: #1b2f5e;
  color: #ffe28a;
  font-size: 10.5px;
  font-weight: 700;
}

/* Screw Armed / Forced Stage Banner */
.v5b-alert-ribbon {
  position: relative;
  z-index: 16;
  width: 100%;
  max-width: 780px;
  margin: 0 auto 6px;
  padding: 6px 12px;
  border-radius: 10px;
  border: 2px solid #ff946b;
  background: linear-gradient(90deg, #5e0c14 0%, #9c1622 50%, #5e0c14 100%);
  color: #fff5dc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-shadow: 0 4px 18px rgba(224, 38, 52, 0.55);
  animation: v5b-alert-pulse 1.3s ease-in-out infinite;
}
.v5b-alert-ribbon.is-forced {
  border-color: #ffe07d;
  background: linear-gradient(90deg, #1b2d5c 0%, #2f4b8f 50%, #1b2d5c 100%);
  box-shadow: 0 4px 18px rgba(245, 196, 81, 0.42);
}
.v5b-alert-title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #ffe89e;
}
.v5b-alert-sub {
  font-size: 11px;
  color: #ffe8e8;
  opacity: 0.94;
}

/* ============================================================================
   TILTED 2.5D OCTAGONAL CRYSTAL-AND-BRASS STAGE BOARD
   ============================================================================ */
.v5b-board-stage-wrap {
  position: relative;
  z-index: 8;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  perspective: 1200px;
  padding: 14px 2px 6px;
}
.v5b-board-tray {
  position: relative;
  width: 100%;
  border-radius: 18px;
  padding: 5px;
  background: linear-gradient(155deg, #fff1b8 0%, #d49f3a 22%, #6e4810 48%, #e8c062 76%, #7d5214 100%);
  box-shadow:
    0 18px 36px rgba(2, 6, 20, 0.85),
    0 0 0 1px rgba(255, 240, 185, 0.45),
    inset 0 2px 1px rgba(255, 250, 224, 0.72);
  transform: rotateX(4deg);
  transform-origin: center 35%;
}
.v5b-board-enamel {
  position: relative;
  border-radius: 14px;
  padding: 34px 7px 9px;
  background:
    radial-gradient(ellipse 90% 45% at 50% 8%, rgba(72, 136, 245, 0.42) 0%, rgba(16, 44, 102, 0) 70%),
    linear-gradient(180deg, #173a7d 0%, #0d2559 55%, #08183d 100%);
  box-shadow:
    inset 0 4px 14px rgba(0, 0, 0, 0.7),
    inset 0 0 0 1.5px rgba(242, 202, 107, 0.38);
}

/* Ornate Scalloped Brass-and-Enamel Category Crests */
.v5b-crests-grid {
  position: absolute;
  top: -16px;
  left: 7px;
  right: 7px;
  display: grid;
  grid-template-columns: repeat(var(--v5b-cols, 4), minmax(0, 1fr));
  gap: 5px;
  z-index: 12;
  pointer-events: none;
}
.v5b-col-crest {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 4px 6px;
  border-radius: 10px 10px 14px 14px;
  border: 2px solid var(--v5b-crest-border, #f0c766);
  background: linear-gradient(180deg, var(--v5b-crest-top) 0%, var(--v5b-crest-bot) 100%);
  box-shadow:
    0 5px 12px rgba(0, 0, 0, 0.68),
    inset 0 1px 0 rgba(255, 244, 200, 0.55),
    inset 0 -2px 4px rgba(0, 0, 0, 0.45);
  text-align: center;
}
.v5b-col-crest::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: var(--v5b-crest-bot);
  border-right: 2px solid var(--v5b-crest-border, #f0c766);
  border-bottom: 2px solid var(--v5b-crest-border, #f0c766);
}
.v5b-crest-medallion {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid #fff0b3;
  background: linear-gradient(180deg, #f5cd6b 0%, #996414 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.65);
}
.v5b-crest-medallion svg {
  width: 14px;
  height: 14px;
}
.v5b-crest-title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(9.5px, 2.6vw, 13px);
  font-weight: 800;
  line-height: 1.1;
  color: #fff6de;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.85);
  word-break: normal;
  overflow-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.v5b-col-crest.is-frozen {
  border-color: #9beeff;
  background: linear-gradient(180deg, #1b5c80 0%, #0d324d 100%);
}
.v5b-crest-flag {
  position: absolute;
  bottom: -9px;
  z-index: 3;
  padding: 1px 5px;
  border-radius: 999px;
  background: #0d2b45;
  border: 1px solid #8be8ff;
  color: #ccf6ff;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

/* 4..6 Column Tile Grid */
.v5b-tiles-grid {
  display: grid;
  grid-template-columns: repeat(var(--v5b-cols, 4), minmax(0, 1fr));
  gap: 6px 5px;
  position: relative;
  z-index: 4;
}

/* Beveled Octagonal Tile */
.v5b-tile-btn {
  position: relative;
  appearance: none;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  width: 100%;
  aspect-ratio: 1.34 / 1;
  min-height: 58px;
  cursor: pointer;
  filter: drop-shadow(0 5px 7px rgba(0, 0, 0, 0.72));
  transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), filter 0.16s ease;
  -webkit-tap-highlight-color: transparent;
}
.v5b-tile-btn:not(:disabled):hover {
  transform: translateY(-3px) scale(1.03);
  filter: drop-shadow(0 9px 14px rgba(255, 206, 92, 0.45));
  z-index: 8;
}
.v5b-tile-btn:not(:disabled):active {
  transform: translateY(1px) scale(0.98);
}
.v5b-tile-btn:focus-visible {
  outline: 2px solid #ffe48f;
  outline-offset: 2px;
}
.v5b-tile-btn:disabled {
  cursor: default;
}

.v5b-tile-rim {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 3.5px;
  clip-path: polygon(16% 0%, 84% 0%, 100% 21%, 100% 79%, 84% 100%, 16% 100%, 0% 79%, 0% 21%);
  background: linear-gradient(148deg, #fff5c4 0%, #e3b249 24%, #825514 54%, #f4d072 80%, #6b430d 100%);
}
.v5b-tile-face {
  position: relative;
  width: 100%;
  height: 100%;
  clip-path: polygon(15.5% 0%, 84.5% 0%, 100% 20.5%, 100% 79.5%, 84.5% 100%, 15.5% 100%, 0% 79.5%, 0% 20.5%);
  background: radial-gradient(ellipse 88% 72% at 50% 24%, var(--v5b-tile-hi) 0%, var(--v5b-tile-mid) 56%, var(--v5b-tile-low) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 3px 4px;
  overflow: hidden;
}
.v5b-tile-face::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 36%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}
.v5b-tile-emblem-svg {
  position: relative;
  z-index: 2;
  width: clamp(24px, 6.8vw, 34px);
  height: clamp(24px, 6.8vw, 34px);
  flex-shrink: 0;
}
.v5b-tile-points {
  position: relative;
  z-index: 2;
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(14px, 3.8vw, 20px);
  font-weight: 800;
  line-height: 1;
  color: var(--v5b-tile-ink, #2d1c0c);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55);
  letter-spacing: 0.02em;
}

/* Higher-Value 400 / 800 Gold Burnished Tiles */
.v5b-tile-btn.is-tier-gold .v5b-tile-face {
  background: radial-gradient(ellipse 90% 76% at 50% 22%, #fff3bd 0%, #e9bf62 56%, #bf8b2e 100%);
}
.v5b-tile-btn.is-tier-gold .v5b-tile-points {
  color: #3d2204;
}

/* Special Twist: Radiant Spinning Wheel Tile */
.v5b-tile-btn.is-twist-wheel {
  filter: drop-shadow(0 0 12px rgba(255, 208, 66, 0.8));
}
.v5b-tile-btn.is-twist-wheel .v5b-tile-rim {
  background: linear-gradient(145deg, #ffffff 0%, #ffe680 30%, #d48911 65%, #fff0a6 100%);
}
.v5b-tile-btn.is-twist-wheel .v5b-tile-face {
  background: radial-gradient(circle at 50% 34%, #fff8c4 0%, #ffcb3b 48%, #d47b08 100%);
}
.v5b-tile-btn.is-twist-wheel .v5b-tile-points {
  color: #421f02;
}
.v5b-twist-svg {
  position: relative;
  z-index: 2;
  width: clamp(26px, 7.2vw, 36px);
  height: clamp(26px, 7.2vw, 36px);
  flex-shrink: 0;
}
.v5b-twist-svg.is-wheel-spin {
  animation: v5b-wheel-idle 14s linear infinite;
}

/* Special Twist: Time-Bomb Blitz Tile */
.v5b-tile-btn.is-twist-blitz {
  filter: drop-shadow(0 0 10px rgba(255, 168, 56, 0.65));
}
.v5b-tile-btn.is-twist-blitz .v5b-tile-face {
  background: radial-gradient(ellipse 88% 76% at 50% 24%, #fff7e0 0%, #f5d39b 58%, #cf9a65 100%);
}
.v5b-twist-label {
  position: relative;
  z-index: 2;
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(7.6px, 2.05vw, 10.5px);
  font-weight: 800;
  line-height: 1.05;
  text-align: center;
  letter-spacing: 0.03em;
  color: #3b1704;
  text-transform: uppercase;
}
.v5b-mini-pts-tag {
  position: absolute;
  top: 2px;
  right: 12%;
  z-index: 4;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  font-weight: 800;
  color: #fff5d6;
  background: rgba(34, 15, 4, 0.72);
  padding: 0px 4px;
  border-radius: 4px;
}

/* Special Twist: Fiery Rival Bounty Tile */
.v5b-tile-btn.is-twist-bounty {
  filter: drop-shadow(0 0 14px rgba(255, 98, 20, 0.92));
  animation: v5b-bounty-flicker 1.8s ease-in-out infinite;
}
.v5b-tile-btn.is-twist-bounty .v5b-tile-rim {
  background: linear-gradient(145deg, #fff2a1 0%, #ff821c 35%, #b51f05 68%, #ffbe47 100%);
}
.v5b-tile-btn.is-twist-bounty .v5b-tile-face {
  background: radial-gradient(circle at 50% 35%, #9e2908 0%, #4d0d04 65%, #260502 100%);
}
.v5b-tile-btn.is-twist-bounty .v5b-twist-label {
  color: #ffe28a;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
}

/* Special Twist: Power Play Double-Diamond Tile */
.v5b-tile-btn.is-twist-power {
  filter: drop-shadow(0 0 12px rgba(255, 204, 72, 0.78));
}
.v5b-tile-btn.is-twist-power .v5b-tile-face {
  background: radial-gradient(circle at 50% 30%, #2a5dc4 0%, #102a69 65%, #071538 100%);
}
.v5b-tile-btn.is-twist-power .v5b-twist-label {
  color: #ffe382;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
}

/* Special Twist: Crown Wedge Jewel Tile */
.v5b-tile-btn.is-twist-wedge {
  filter: drop-shadow(0 0 11px rgba(247, 206, 94, 0.72));
}
.v5b-tile-btn.is-twist-wedge .v5b-tile-face {
  background: radial-gradient(circle at 50% 25%, #29467f 0%, #102045 68%, #09132b 100%);
}
.v5b-tile-btn.is-twist-wedge .v5b-tile-points {
  color: #ffe899;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.85);
}
.v5b-tile-btn.is-twist-wedge .v5b-twist-label {
  color: #fff3c7;
  font-size: clamp(7px, 1.8vw, 9px);
}

/* 14+ Board Topology Special Modifiers (Gold Fever, Flame Thaw, X-Crossroads, Spiral Core, Pyramid Apex, Hot Potato, Turf Bar) */
.v5b-tile-btn.is-gold-fever {
  filter: drop-shadow(0 0 13px rgba(255, 215, 64, 0.94));
}
.v5b-tile-btn.is-gold-fever .v5b-tile-rim {
  background: linear-gradient(145deg, #ffffff 0%, #ffe97d 32%, #d9910e 66%, #fff5b3 100%);
}
.v5b-tile-btn.is-gold-fever .v5b-tile-face {
  background: radial-gradient(circle at 50% 25%, #fff9c9 0%, #f5c33b 58%, #bd7a08 100%);
}
.v5b-tile-btn.is-flame-thaw {
  filter: drop-shadow(0 0 13px rgba(255, 114, 28, 0.9));
}
.v5b-tile-btn.is-flame-thaw .v5b-tile-face {
  background: radial-gradient(circle at 50% 35%, #b33809 0%, #5e1504 68%, #2e0702 100%);
}
.v5b-tile-btn.is-flame-thaw .v5b-twist-label {
  color: #ffe399;
}
.v5b-tile-btn.is-crossroads-diag .v5b-tile-rim {
  background: linear-gradient(145deg, #ffd1e0 0%, #d43f6a 38%, #f5c654 74%, #7a1431 100%);
}
.v5b-tile-btn.is-spiral-core {
  filter: drop-shadow(0 0 16px rgba(46, 232, 152, 0.92));
}
.v5b-tile-btn.is-spiral-core .v5b-tile-face {
  background: radial-gradient(circle at 50% 30%, #177851 0%, #093d29 66%, #041f14 100%);
}
.v5b-tile-btn.is-spiral-core .v5b-tile-points {
  color: #fff2a6;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.9);
}
.v5b-tile-btn.is-pyramid-apex {
  filter: drop-shadow(0 0 15px rgba(255, 208, 72, 0.95));
}
.v5b-tile-btn.is-pyramid-apex .v5b-tile-face {
  background: radial-gradient(circle at 50% 28%, #ffe899 0%, #d48d1a 58%, #704104 100%);
}
.v5b-tile-btn.is-pyramid-apex .v5b-tile-points {
  color: #2b1402;
}
.v5b-modifier-pip {
  position: absolute;
  top: 2px;
  left: 12%;
  z-index: 5;
  padding: 0 4px;
  border-radius: 4px;
  background: #8f1629;
  border: 1px solid #ffe285;
  color: #fff5d1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  font-weight: 800;
  line-height: 1.25;
}
.v5b-modifier-pip.is-gold {
  background: #472804;
  color: #ffe380;
}
.v5b-turf-bar {
  margin-top: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1.5px solid #e6be63;
  background: linear-gradient(180deg, #162a57 0%, #0a1633 100%);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 800;
  color: #ffe7a1;
}
.v5b-turf-track {
  flex: 1;
  height: 7px;
  border-radius: 999px;
  background: #5c1324;
  overflow: hidden;
  border: 1px solid rgba(255, 232, 165, 0.45);
}
.v5b-turf-fill {
  height: 100%;
  background: linear-gradient(90deg, #21c97b, #80ffbe);
}
.v5b-draft-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
}
.v5b-draft-plaque {
  appearance: none;
  text-align: left;
  padding: 9px 11px;
  border-radius: 10px;
  border: 2px solid #d9ab4c;
  background: linear-gradient(180deg, #1b3266 0%, #0d1d42 100%);
  color: #fff7e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
}
.v5b-draft-plaque.is-picked {
  border-color: #5ef0a7;
  background: linear-gradient(180deg, #114730 0%, #082418 100%);
}
.v5b-draft-plaque.is-banned {
  border-color: #d94c64;
  background: linear-gradient(180deg, #471420 0%, #24080f 100%);
  opacity: 0.65;
  text-decoration: line-through;
}
.v5b-draft-plaque:disabled {
  cursor: default;
}

/* Locked Tile (Heavy Crossed Iron Chains & Central Gold Brass Padlock) */
.v5b-tile-btn.is-padlocked .v5b-tile-rim {
  background: linear-gradient(148deg, #cfb176 0%, #7d5b2d 34%, #3d2a12 68%, #9c743c 100%);
}
.v5b-tile-btn.is-padlocked .v5b-tile-face {
  background: radial-gradient(circle at 50% 35%, #755838 0%, #45321e 62%, #261a0f 100%);
  justify-content: flex-end;
  padding-bottom: 5px;
}
.v5b-tile-btn.is-padlocked .v5b-tile-points {
  color: #ffe39e;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.92);
  font-size: clamp(13px, 3.6vw, 18px);
}
.v5b-chains-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

/* Shattering Chain Animation (.is-shattering) */
.v5b-tile-btn.is-shattering {
  animation: v5b-tile-shatter-shake 0.72s cubic-bezier(0.22, 1, 0.36, 1);
  filter: drop-shadow(0 0 18px rgba(255, 214, 92, 0.98));
  z-index: 12;
}
.v5b-tile-btn.is-shattering::after {
  content: '';
  position: absolute;
  inset: -6px;
  background: radial-gradient(circle, rgba(255, 244, 179, 0.92) 0%, rgba(255, 178, 46, 0.45) 45%, rgba(255, 178, 46, 0) 74%);
  pointer-events: none;
  animation: v5b-shatter-flash 0.72s ease-out forwards;
}
.v5b-tile-btn.is-shattering .v5b-chain-strand-a {
  transform-origin: center;
  animation: v5b-chain-fly-left 0.68s ease-out forwards;
}
.v5b-tile-btn.is-shattering .v5b-chain-strand-b {
  transform-origin: center;
  animation: v5b-chain-fly-right 0.68s ease-out forwards;
}
.v5b-tile-btn.is-shattering .v5b-padlock-body {
  transform-origin: center;
  animation: v5b-padlock-pop 0.65s ease-out forwards;
}

/* Fogged, Frozen, and Cleared States */
.v5b-tile-btn.is-fogged .v5b-tile-face {
  background: radial-gradient(circle at 50% 35%, #463a75 0%, #231b45 70%, #140f2b 100%);
  color: #dfd6ff;
}
.v5b-tile-btn.is-frozen .v5b-tile-rim {
  background: linear-gradient(145deg, #e0fbff 0%, #52c6f2 45%, #16659c 100%);
}
.v5b-tile-btn.is-frozen .v5b-tile-face {
  background: radial-gradient(circle at 50% 30%, #7adfff 0%, #216e9e 68%, #0f3a5c 100%);
  color: #e8fcff;
}
.v5b-tile-btn.is-cleared-win .v5b-tile-rim {
  background: linear-gradient(145deg, #86e3b3 0%, #267850 60%, #123d28 100%);
  opacity: 0.78;
}
.v5b-tile-btn.is-cleared-win .v5b-tile-face {
  background: radial-gradient(circle, #134a31 0%, #092418 100%);
  color: #7df2b8;
}
.v5b-tile-btn.is-cleared-miss .v5b-tile-rim {
  background: linear-gradient(145deg, #6b7285 0%, #343b4a 100%);
  opacity: 0.56;
}
.v5b-tile-btn.is-cleared-miss .v5b-tile-face {
  background: #141b2b;
  color: #8b95ab;
}
.v5b-tile-btn.is-rival-claimed .v5b-tile-rim {
  background: linear-gradient(145deg, #ff8599 0%, #8f1d32 65%, #470a16 100%);
  opacity: 0.84;
}
.v5b-tile-btn.is-rival-claimed .v5b-tile-face {
  background: radial-gradient(circle, #5e1222 0%, #2b070f 100%);
  color: #ffb8c4;
}
.v5b-cleared-label {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

/* Forced Tile & Spotlight Sweep */
.v5b-tile-btn.is-forced {
  filter: drop-shadow(0 0 16px rgba(255, 224, 102, 0.98));
  transform: scale(1.04);
  z-index: 10;
  animation: v5b-forced-bounce 1.2s ease-in-out infinite;
}
.v5b-tile-btn.is-dimmed {
  opacity: 0.42;
  filter: grayscale(0.35);
}
.v5b-tile-btn.is-spotlight-sweep {
  filter: drop-shadow(0 0 18px #fff2a6) brightness(1.22);
  transform: scale(1.06);
  z-index: 11;
}

/* SCREW RIVAL Target Mode */
.v5b-tile-btn.is-screw-target {
  cursor: crosshair;
  filter: drop-shadow(0 0 14px rgba(255, 58, 74, 0.92));
  animation: v5b-screw-target-pulse 0.95s ease-in-out infinite;
}
.v5b-tile-btn.is-screw-target .v5b-tile-rim {
  background: linear-gradient(145deg, #ff99a1 0%, #e62232 45%, #8a0815 100%);
}
.v5b-screw-reticle {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(168, 12, 24, 0.28);
  pointer-events: none;
}

/* ============================================================================
   BOTTOM CURVED MAHOGANY & BRASS CONTESTANT PODIUM LEDGE
   ============================================================================ */
.v5b-podium-ledge-wrap {
  position: relative;
  z-index: 14;
  width: 100%;
  max-width: 860px;
  margin: 2px auto 0;
  padding-top: 4px;
}
.v5b-podium-ledge {
  position: relative;
  border-radius: 24px 24px 0 0;
  padding: 4px 4px 0;
  background: linear-gradient(180deg, #fff0b3 0%, #d49f3a 35%, #754b10 80%, #523209 100%);
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.68);
}
.v5b-podium-wood {
  position: relative;
  border-radius: 20px 20px 0 0;
  padding: 8px 12px max(8px, env(safe-area-inset-bottom));
  background:
    radial-gradient(ellipse 60% 70% at 24% 15%, rgba(214, 126, 62, 0.34) 0%, rgba(110, 48, 22, 0) 68%),
    repeating-linear-gradient(92deg, rgba(255, 196, 130, 0.04) 0px, rgba(255, 196, 130, 0.04) 2px, transparent 2px, transparent 9px),
    linear-gradient(180deg, #7a3c1d 0%, #52230f 55%, #341407 100%);
  box-shadow: inset 0 4px 10px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* Chunky Glossy 3D Red Dome SCREW RIVAL! Buzzer */
.v5b-screw-station {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.v5b-screw-collar {
  position: relative;
  padding: 5px 8px 7px;
  border-radius: 999px;
  background: linear-gradient(180deg, #f7d983 0%, #b58024 45%, #5c3a0b 100%);
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.72),
    inset 0 2px 1px rgba(255, 249, 214, 0.85);
}
.v5b-screw-btn {
  position: relative;
  appearance: none;
  border: 2px solid #ff9191;
  border-radius: 999px;
  min-width: 106px;
  min-height: 48px;
  padding: 6px 13px;
  background: radial-gradient(ellipse 75% 58% at 38% 26%, #ff8585 0%, #e02026 38%, #990a10 80%, #610408 100%);
  color: #fff7e6;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(64, 0, 4, 0.9);
  box-shadow:
    0 6px 0 #590408,
    0 10px 16px rgba(0, 0, 0, 0.65),
    inset 0 4px 8px rgba(255, 224, 224, 0.42);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, filter 0.14s ease;
}
.v5b-screw-btn::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 16%;
  right: 16%;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.56) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}
.v5b-screw-btn:not(:disabled):hover {
  filter: brightness(1.1);
}
.v5b-screw-btn:not(:disabled):active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #590408, 0 4px 8px rgba(0, 0, 0, 0.6);
}
.v5b-screw-btn.is-armed {
  border-color: #ffe885;
  box-shadow:
    0 0 20px rgba(255, 58, 68, 0.95),
    0 4px 0 #590408,
    inset 0 4px 10px rgba(255, 240, 200, 0.55);
  animation: v5b-buzzer-armed 0.9s ease-in-out infinite;
}
.v5b-screw-btn:disabled {
  background: radial-gradient(ellipse 75% 58% at 38% 26%, #7d6864 0%, #4d3b38 52%, #2b1f1d 100%);
  border-color: #786258;
  color: #bdaea8;
  box-shadow: 0 4px 0 #1f1513, 0 6px 10px rgba(0, 0, 0, 0.5);
  cursor: not-allowed;
}
.v5b-screw-count-pip {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 24px;
  height: 24px;
  padding: 0 5px;
  border-radius: 999px;
  border: 1.5px solid #fff3c2;
  background: linear-gradient(180deg, #ffe285 0%, #c98614 100%);
  color: #291302;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.65);
}

/* Optional Sponsor Dare Brass Tag */
.v5b-dare-tag {
  display: none;
  align-items: center;
  gap: 7px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1.5px solid #e6be63;
  background: linear-gradient(180deg, #2d1e0d 0%, #1a1006 100%);
  color: #ffe8a6;
  font-size: 11px;
  line-height: 1.2;
  max-width: 220px;
  box-shadow: inset 0 1px 0 rgba(255, 240, 190, 0.35), 0 3px 8px rgba(0, 0, 0, 0.55);
}
.v5b-dare-tag.is-completed {
  border-color: #5ee8a4;
  background: linear-gradient(180deg, #0d3b26 0%, #072115 100%);
  color: #a6ffd2;
}
.v5b-dare-kicker {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: #ffd36b;
  text-transform: uppercase;
}

/* 3 Recessed Circular Brass Cups for Podium Lucky Charms */
.v5b-charm-cups-row {
  display: flex;
  align-items: center;
  gap: 9px;
  position: relative;
}
.v5b-charm-cup-btn {
  position: relative;
  appearance: none;
  border: none;
  padding: 4px;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: linear-gradient(160deg, #fff1b8 0%, #cc9633 38%, #633e0d 78%, #d9a743 100%);
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.72),
    inset 0 2px 2px rgba(255, 250, 224, 0.75);
  cursor: pointer;
  transition: transform 0.14s ease, filter 0.14s ease;
}
.v5b-charm-cup-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
}
.v5b-charm-cup-well {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 62%, #4a3113 0%, #241608 68%, #120a03 100%);
  box-shadow: inset 0 5px 10px rgba(0, 0, 0, 0.88), inset 0 -1px 2px rgba(255, 224, 138, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.v5b-charm-prop-svg {
  width: 50px;
  height: 50px;
  margin-top: -6px;
  filter: drop-shadow(0 5px 6px rgba(0, 0, 0, 0.8));
  transition: transform 0.18s ease;
}
.v5b-charm-cup-btn:hover .v5b-charm-prop-svg {
  transform: translateY(-3px) scale(1.06);
}
.v5b-charm-cup-empty {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(235, 200, 126, 0.42);
  text-transform: uppercase;
}
.v5b-charm-cup-btn.is-triggered {
  box-shadow:
    0 0 22px rgba(255, 214, 79, 0.95),
    0 0 40px rgba(255, 196, 56, 0.65);
  animation: v5b-charm-trigger 1.1s ease-out;
}

/* Tactile Brass Tooltip Popover for Lucky Charms */
.v5b-charm-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  width: min(280px, calc(100vw - 24px));
  padding: 10px 12px;
  border-radius: 12px;
  border: 2px solid #f0c969;
  background: linear-gradient(180deg, #1b2f5e 0%, #0b1633 100%);
  color: #fff6e0;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.85);
  z-index: 40;
  text-align: left;
}
.v5b-charm-tooltip-title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 13.5px;
  font-weight: 800;
  color: #ffe28a;
  margin-bottom: 2px;
}
.v5b-charm-tooltip-tag {
  font-size: 11px;
  font-style: italic;
  color: #bfd4f7;
  margin-bottom: 5px;
}
.v5b-charm-tooltip-effect {
  font-size: 12px;
  font-weight: 700;
  color: #88f7c0;
  line-height: 1.3;
}
.v5b-charm-tooltip-origin {
  font-size: 10.5px;
  color: #d6c198;
  margin-top: 4px;
}

/* ============================================================================
   NON-BOXY PHYSICAL BROADCAST MODALS (WHEEL, WAGER DIAL, CURTAIN CALL)
   Solid radial theater scrims + sculpted brass/print UI (zero glass-blur filters).
   ============================================================================ */
.v5b-modal-layer {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  overflow-y: auto;
  background: radial-gradient(circle at 50% 42%, rgba(16, 30, 68, 0.90) 0%, rgba(4, 8, 20, 0.96) 100%);
}
.v5b-modal-layer:empty {
  display: none;
}

/* Shared Tactile Brass Stage Buttons */
.v5b-cta-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 20px;
  border-radius: 999px;
  border: 2px solid #fff0b3;
  background: linear-gradient(180deg, #ffe58f 0%, #e0a326 52%, #ad700d 100%);
  color: #261403;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: 0 5px 0 #5e3804, 0 10px 20px rgba(0, 0, 0, 0.65);
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease;
}
.v5b-cta-btn:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}
.v5b-cta-btn:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #5e3804;
}
.v5b-cta-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.v5b-cta-btn.is-emerald {
  border-color: #a8ffd6;
  background: linear-gradient(180deg, #5ef0a7 0%, #19a864 55%, #0c6b3d 100%);
  color: #032112;
  box-shadow: 0 5px 0 #074225, 0 10px 20px rgba(0, 0, 0, 0.65);
}
.v5b-cta-btn.is-secondary {
  border-color: #d4a648;
  background: linear-gradient(180deg, #1d356b 0%, #0d1c3d 100%);
  color: #fff4d9;
  box-shadow: 0 4px 0 #060f24, 0 8px 16px rgba(0, 0, 0, 0.55);
}

/* --- A. PHYSICAL BRASS STAGE WHEEL MODAL --- */
.v5b-wheel-console {
  position: relative;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}
.v5b-marquee-ribbon {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 18px;
  background: linear-gradient(180deg, #8c1a2e 0%, #520c1a 100%);
  border: 2px solid #f5cf73;
  clip-path: polygon(10px 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0% 50%);
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.09em;
  color: #ffe699;
}
.v5b-modal-headline {
  margin: 0;
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(20px, 5vw, 27px);
  font-weight: 800;
  color: #fff4d2;
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.85);
}
.v5b-wheel-housing {
  position: relative;
  width: min(306px, 78vw);
  height: min(306px, 78vw);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;
  cursor: grab;
}
.v5b-wheel-housing:active {
  cursor: grabbing;
}
.v5b-wheel-clapper {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  width: 38px;
  height: 44px;
  z-index: 8;
  transform-origin: 50% 18%;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.75));
  transition: transform 0.07s ease-out;
}
.v5b-wheel-clapper.is-tick {
  transform: translateX(-50%) rotate(-24deg);
}
.v5b-wheel-rotor {
  width: 100%;
  height: 100%;
  will-change: transform;
  filter: drop-shadow(0 16px 28px rgba(0, 0, 0, 0.8));
}
.v5b-wheel-hint {
  font-size: 12px;
  color: #d6e4ff;
  font-weight: 600;
}
.v5b-wheel-outcome-plaque {
  width: 100%;
  padding: 12px 18px;
  background: linear-gradient(180deg, #fff8e3 0%, #edd9ab 100%);
  border: 2.5px solid #d49e35;
  border-radius: 14px;
  color: #241607;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.72);
}
.v5b-wheel-outcome-plaque h3 {
  margin: 0 0 4px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 18px;
  color: #7d4506;
}
.v5b-wheel-outcome-plaque p {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}

/* --- B. BRASS POWER-PLAY WAGER DIAL MODAL --- */
.v5b-dial-console {
  position: relative;
  width: 100%;
  max-width: 470px;
  padding: 5px;
  border-radius: 26px;
  background: linear-gradient(155deg, #fff1b8 0%, #d49f3a 28%, #6d4710 62%, #e8c062 100%);
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.85);
}
.v5b-dial-inner {
  border-radius: 22px;
  padding: 18px 18px 20px;
  background:
    radial-gradient(ellipse 90% 55% at 50% 10%, rgba(44, 96, 196, 0.42) 0%, transparent 72%),
    linear-gradient(180deg, #162b5c 0%, #091533 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 11px;
  text-align: center;
}
.v5b-dial-gauge-wrap {
  position: relative;
  width: min(290px, 82vw);
  touch-action: none;
  user-select: none;
  cursor: pointer;
}
.v5b-dial-readout-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: -12px;
}
.v5b-knurled-step-btn {
  appearance: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #ffe89e;
  background: linear-gradient(180deg, #e8bc58 0%, #8f5c14 100%);
  color: #211203;
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
}
.v5b-knurled-step-btn:active {
  transform: translateY(2px);
}
.v5b-dial-digital-plate {
  min-width: 158px;
  padding: 7px 14px;
  border-radius: 10px;
  border: 2px solid #d9a843;
  background: #071024;
  color: #ffe285;
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 800;
  box-shadow: inset 0 3px 10px rgba(0, 0, 0, 0.85);
}
.v5b-chip-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}
.v5b-stake-chip {
  appearance: none;
  min-width: 60px;
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 2px dashed #f5d073;
  background: linear-gradient(180deg, #274485 0%, #11224a 100%);
  color: #fff3cf;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.55);
}
.v5b-stake-chip.is-allin {
  background: linear-gradient(180deg, #b82531 0%, #6b0d17 100%);
  border-style: solid;
  border-color: #ffe38f;
  color: #fff6d9;
}
.v5b-wager-stakes-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
}
.v5b-stake-plaque {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1.5px solid #48d994;
  background: linear-gradient(180deg, #0d3b27 0%, #072116 100%);
  color: #9cffcf;
}
.v5b-stake-plaque.is-risk {
  border-color: #f06578;
  background: linear-gradient(180deg, #4a121d 0%, #26070d 100%);
  color: #ffb8c3;
}
.v5b-stake-plaque-lbl {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  opacity: 0.9;
}
.v5b-stake-plaque-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 19px;
  font-weight: 800;
}

/* --- C. POST-MATCH BROADSHEET NEWSPAPER & CALL-SHEET CURTAIN CALL --- */
.v5b-curtain-spread {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 960px;
  margin: 12px auto 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  padding: 0 6px;
}
.v5b-broadsheet-paper {
  position: relative;
  padding: 16px 18px 18px;
  border-radius: 4px;
  background:
    repeating-linear-gradient(180deg, rgba(112, 82, 38, 0.03) 0px, rgba(112, 82, 38, 0.03) 1px, transparent 1px, transparent 22px),
    linear-gradient(180deg, #faf1dc 0%, #ede0c2 100%);
  color: #1f170f;
  border: 2px solid #c9a66b;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.72), inset 0 0 0 4px #faf1dc, inset 0 0 0 5px rgba(84, 58, 24, 0.25);
  transform: rotate(-0.45deg);
}
.v5b-paper-masthead {
  border-top: 3px double #2b1f14;
  border-bottom: 3px double #2b1f14;
  padding: 5px 0;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.v5b-paper-name {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(14px, 3.6vw, 20px);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a120b;
}
.v5b-paper-edition {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 700;
  color: #634928;
  text-transform: uppercase;
}
.v5b-paper-headline {
  margin: 0 0 8px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(19px, 4.8vw, 28px);
  font-weight: 800;
  line-height: 1.15;
  color: #1c120a;
}
.v5b-verdict-stamp {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 2.5px solid #0e7040;
  border-radius: 6px;
  color: #0b5932;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transform: rotate(-2deg);
  margin-bottom: 8px;
}
.v5b-verdict-stamp.is-loss {
  border-color: #9e1b2d;
  color: #8c1425;
}
.v5b-paper-quotes {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(64, 42, 18, 0.28);
}
.v5b-paper-quote-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.v5b-paper-bust {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #b5842e;
  background: radial-gradient(circle, #1f3970, #0c1836);
  overflow: hidden;
  flex-shrink: 0;
}
.v5b-paper-bust img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}
.v5b-wire-list {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed rgba(64, 42, 18, 0.35);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;
  color: #362617;
}

/* Studio Production Call-Sheet Clipboard */
.v5b-callsheet-card {
  position: relative;
  padding: 20px 16px 16px;
  border-radius: 12px;
  background: linear-gradient(180deg, #fffdf7 0%, #f2e8d3 100%);
  color: #1f170f;
  border: 2.5px solid #c99838;
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.72);
  transform: rotate(0.4deg);
}
.v5b-callsheet-clip {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  width: 84px;
  height: 20px;
  border-radius: 8px;
  border: 2px solid #6b450f;
  background: linear-gradient(180deg, #fff0b8 0%, #c9922c 100%);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.45);
}
.v5b-callsheet-tally {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 10px 0;
}
.v5b-tally-box {
  padding: 10px;
  border-radius: 8px;
  border: 1.5px solid #cbb183;
  background: #fffaf0;
  text-align: center;
}
.v5b-tally-box.is-win {
  border-color: #c9922c;
  background: linear-gradient(180deg, #fff7d6 0%, #f7e4a8 100%);
}
.v5b-tally-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b4e29;
}
.v5b-tally-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 800;
  color: #1a120a;
}
.v5b-callsheet-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 10px 0;
}
.v5b-cs-stat {
  padding: 8px 6px;
  border-radius: 8px;
  background: #14254d;
  border: 1.5px solid #d9ab4c;
  color: #fff5da;
  text-align: center;
}
.v5b-cs-stat-k {
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #bcd0f5;
}
.v5b-cs-stat-v {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 800;
  color: #ffe38a;
  margin-top: 2px;
}
.v5b-curtain-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

/* ============================================================================
   KEYFRAME ANIMATIONS (RESPECTING REDUCED MOTION)
   ============================================================================ */
@keyframes v5b-actor-breathe {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}
@keyframes v5b-medallion-pulse {
  0%, 100% { opacity: 0.84; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.07); }
}
@keyframes v5b-wheel-idle {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes v5b-bounty-flicker {
  0%, 100% { filter: drop-shadow(0 0 11px rgba(255, 96, 18, 0.85)); }
  50% { filter: drop-shadow(0 0 18px rgba(255, 162, 46, 1)); }
}
@keyframes v5b-forced-bounce {
  0%, 100% { transform: scale(1.04); }
  50% { transform: scale(1.08); }
}
@keyframes v5b-screw-target-pulse {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 48, 66, 0.85)); }
  50% { filter: drop-shadow(0 0 19px rgba(255, 92, 102, 1)); }
}
@keyframes v5b-buzzer-armed {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes v5b-alert-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.12); }
}
@keyframes v5b-charm-trigger {
  0% { transform: scale(1); }
  30% { transform: scale(1.16); }
  100% { transform: scale(1); }
}
@keyframes v5b-tile-shatter-shake {
  0% { transform: translate(0, 0) scale(1); }
  15% { transform: translate(-4px, -2px) rotate(-2.5deg) scale(1.06); }
  30% { transform: translate(4px, 2px) rotate(2.5deg) scale(1.08); }
  45% { transform: translate(-3px, 1px) rotate(-1.5deg) scale(1.06); }
  70% { transform: scale(1.04); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes v5b-shatter-flash {
  0% { opacity: 0.95; transform: scale(0.7); }
  45% { opacity: 0.85; transform: scale(1.18); }
  100% { opacity: 0; transform: scale(1.42); }
}
@keyframes v5b-chain-fly-left {
  0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
  100% { opacity: 0; transform: translate(-28px, -18px) rotate(-24deg); }
}
@keyframes v5b-chain-fly-right {
  0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
  100% { opacity: 0; transform: translate(28px, -18px) rotate(24deg); }
}
@keyframes v5b-padlock-pop {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  35% { opacity: 1; transform: translateY(-10px) scale(1.18); }
  100% { opacity: 0; transform: translateY(24px) scale(0.65); }
}

/* ============================================================================
   RESPONSIVE BREAKPOINTS: DESKTOP (>= 768px) & LANDSCAPE PHONE (844x390)
   ============================================================================ */
@media (min-width: 768px) and (min-height: 501px) {
  .v5b-stage-canvas {
    padding: 0 22px 0;
  }
  .v5b-venue-chip {
    display: inline-block;
  }
  .v5b-stage-vista {
    min-height: 162px;
    margin-top: -14px;
    padding: 0 20px 2px;
  }
  .v5b-host-cutout {
    height: 170px;
    max-width: 158px;
    margin-bottom: -22px;
    margin-left: 24px;
  }
  .v5b-rival-stage-stack {
    width: 156px;
    height: 168px;
    margin-bottom: -22px;
    margin-right: 24px;
  }
  .v5b-rival-cutout {
    bottom: 46px;
    height: 122px;
    max-width: 120px;
  }
  .v5b-challenger-podium-svg {
    width: 136px;
  }
  .v5b-center-medallion-zone {
    padding-bottom: 4px;
  }
  .v5b-medallion-svg {
    width: 104px;
    height: 104px;
  }
  .v5b-turn-ribbon {
    font-size: 10.5px;
    padding: 2px 12px;
  }
  .v5b-score-plaques-row {
    max-width: 820px;
    gap: 134px;
    margin: -52px auto 8px;
  }
  .v5b-score-plaque-face {
    padding: 5px 14px;
    min-height: 40px;
  }
  .v5b-score-plaque-main {
    font-size: 14px;
  }
  .v5b-score-plaque-pts {
    font-size: 15px;
  }
  .v5b-speech-strip {
    max-width: 820px;
    margin-bottom: 4px;
  }
  .v5b-speech-bubble {
    font-size: 12px;
    padding: 5px 12px;
  }
  /* True 2.5D perspective tilt on desktop fitting 100% above 800px fold! */
  .v5b-board-stage-wrap {
    perspective: 1050px;
    max-width: 790px;
    padding: 12px 6px 4px;
  }
  .v5b-board-tray {
    transform: rotateX(9deg);
    padding: 6px;
  }
  .v5b-board-enamel {
    padding: 34px 12px 10px;
  }
  .v5b-crests-grid {
    top: -17px;
    left: 12px;
    right: 12px;
    gap: 9px;
  }
  .v5b-col-crest {
    min-height: 44px;
    padding: 10px 6px 5px;
  }
  .v5b-crest-medallion {
    width: 24px;
    height: 24px;
    top: -12px;
  }
  .v5b-crest-medallion svg {
    width: 14px;
    height: 14px;
  }
  .v5b-tiles-grid {
    gap: 7px 9px;
  }
  .v5b-tile-btn {
    aspect-ratio: auto;
    height: clamp(60px, 8.8vh, 74px);
    min-height: 60px;
  }
  .v5b-tile-rim {
    padding: 3.5px;
  }
  .v5b-tile-emblem-svg, .v5b-twist-svg {
    width: 28px;
    height: 28px;
  }
  .v5b-tile-points {
    font-size: 18px;
  }
  .v5b-podium-ledge-wrap {
    margin-top: 2px;
    padding-top: 2px;
  }
  .v5b-podium-wood {
    padding: 8px 20px 8px;
  }
  .v5b-screw-btn {
    min-width: 134px;
    min-height: 48px;
    font-size: 13px;
  }
  .v5b-dare-tag {
    display: flex;
  }
  .v5b-charm-cup-btn {
    width: 60px;
    height: 60px;
  }
  .v5b-charm-prop-svg {
    width: 48px;
    height: 48px;
  }
  .v5b-curtain-spread {
    grid-template-columns: 1.12fr 0.88fr;
    align-items: start;
    gap: 18px;
  }
}

/* ============================================================================
   PHONE LANDSCAPE 2-COLUMN SIDE-BY-SIDE BROADCAST SPLIT-STAGE (844x390, 932x430, 640x360)
   Left Column: Stage Vista + Score Plaques + Speech + Mahogany Podium (Screw + 3 Charms)
   Right Column: Full Tilted 2.5D Octagonal Stage Board — ZERO clipped buttons!
   ============================================================================ */
@media (max-height: 500px) and (orientation: landscape) {
  .v5b-root {
    height: 100dvh;
    overflow: hidden;
  }
  .v5b-stage-canvas {
    display: grid;
    grid-template-columns: minmax(248px, 39%) minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    column-gap: 10px;
    row-gap: 2px;
    height: 100dvh;
    min-height: 0;
    max-height: 100dvh;
    max-width: 100%;
    padding: 3px 10px 4px;
    overflow: hidden;
  }
  .v5b-top-rail {
    grid-column: 1 / -1;
    grid-row: 1;
    padding: 2px 2px 0;
    order: unset;
  }
  .v5b-brass-pill-btn, .v5b-brass-badge {
    min-height: 26px;
    padding: 2px 8px;
    font-size: 11px;
  }
  .v5b-brass-icon-btn {
    width: 26px;
    height: 26px;
  }
  .v5b-venue-chip {
    display: inline-block;
    font-size: 10.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 240px;
  }
  .v5b-landscape-left-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    grid-column: 1;
    grid-row: 2;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    gap: 2px;
  }
  .v5b-landscape-right-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    grid-column: 2;
    grid-row: 2;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    gap: 3px;
  }
  .v5b-stage-vista,
  .v5b-score-plaques-row,
  .v5b-speech-strip,
  .v5b-alert-slot,
  .v5b-board-stage-wrap,
  .v5b-podium-ledge-wrap {
    order: unset;
  }
  .v5b-stage-vista {
    min-height: 98px;
    margin-top: 0;
    padding: 0;
  }
  .v5b-host-cutout {
    height: 96px;
    max-width: 82px;
    margin-bottom: -10px;
    margin-left: 0;
  }
  .v5b-rival-stage-stack {
    width: 86px;
    height: 96px;
    margin-bottom: -10px;
    margin-right: 0;
  }
  .v5b-rival-cutout {
    bottom: 24px;
    height: 70px;
    max-width: 72px;
  }
  .v5b-challenger-podium-svg {
    width: 76px;
  }
  .v5b-medallion-svg {
    width: 68px;
    height: 68px;
  }
  .v5b-turn-ribbon {
    font-size: 9px;
    padding: 1px 8px;
    margin-top: -5px;
  }
  .v5b-score-plaques-row {
    max-width: 100%;
    gap: 5px;
    margin: -6px 0 0;
    padding: 0;
  }
  .v5b-score-plaque-face {
    min-height: 30px;
    padding: 3px 8px;
  }
  .v5b-score-plaque-main {
    font-size: 10px;
  }
  .v5b-score-plaque-pts {
    font-size: 11px;
  }
  .v5b-score-plaque-sub {
    font-size: 8.5px;
    gap: 5px;
  }
  .v5b-speech-strip {
    margin: 0;
    padding: 0;
    max-width: 100%;
  }
  .v5b-speech-bubble {
    padding: 4px 8px;
    font-size: 10px;
    line-height: 1.22;
    flex-basis: 100%;
    max-height: 54px;
    overflow: hidden;
  }
  .v5b-speech-bubble.is-rival {
    display: none;
  }
  .v5b-onboarding-tag {
    display: none;
  }
  .v5b-podium-ledge-wrap {
    margin: 0;
    padding-top: 0;
    max-width: 100%;
  }
  .v5b-podium-ledge {
    border-radius: 16px;
    padding: 3px;
  }
  .v5b-podium-wood {
    border-radius: 13px;
    padding: 5px 8px;
    gap: 6px;
  }
  .v5b-screw-collar {
    padding: 4px 5px 5px;
  }
  .v5b-screw-btn {
    min-height: 38px;
    min-width: 78px;
    padding: 4px 8px;
    font-size: 9.5px;
    box-shadow: 0 3px 0 #590408, 0 5px 8px rgba(0, 0, 0, 0.6);
  }
  .v5b-screw-count-pip {
    width: 19px;
    height: 19px;
    min-width: 19px;
    font-size: 9.5px;
  }
  .v5b-dare-tag {
    display: none !important;
  }
  .v5b-charm-cups-row {
    gap: 5px;
  }
  .v5b-charm-cup-btn {
    width: 42px;
    height: 42px;
    padding: 3px;
  }
  .v5b-charm-prop-svg {
    width: 34px;
    height: 34px;
    margin-top: -3px;
  }
  .v5b-charm-cup-empty {
    font-size: 6.5px;
  }
  .v5b-alert-ribbon {
    margin: 0;
    padding: 3px 9px;
  }
  .v5b-alert-title {
    font-size: 10.5px;
  }
  .v5b-alert-sub {
    display: none;
  }
  .v5b-board-stage-wrap {
    max-width: 100%;
    padding: 12px 2px 2px;
    perspective: 1100px;
  }
  .v5b-board-tray {
    transform: rotateX(4deg);
    padding: 4px;
    border-radius: 14px;
  }
  .v5b-board-enamel {
    padding: 24px 6px 6px;
    border-radius: 11px;
  }
  .v5b-crests-grid {
    top: -13px;
    left: 6px;
    right: 6px;
    gap: 4px;
  }
  .v5b-col-crest {
    min-height: 32px;
    padding: 7px 3px 3px;
  }
  .v5b-crest-medallion {
    width: 18px;
    height: 18px;
    top: -9px;
  }
  .v5b-crest-medallion svg {
    width: 11px;
    height: 11px;
  }
  .v5b-crest-title {
    font-size: 9.5px;
    -webkit-line-clamp: 1;
  }
  .v5b-tiles-grid {
    gap: 4px 5px;
  }
  .v5b-tile-btn {
    aspect-ratio: auto;
    height: clamp(50px, 16.5vh, 66px);
    min-height: 48px;
  }
  .v5b-tile-rim {
    padding: 2.5px;
  }
  .v5b-tile-emblem-svg, .v5b-twist-svg {
    width: 21px;
    height: 21px;
  }
  .v5b-tile-points {
    font-size: 13.5px;
  }
  .v5b-twist-label {
    font-size: 7.5px;
  }
}

/* Compact 360x640 small portrait phone support */
@media (max-width: 375px) and (orientation: portrait) {
  .v5b-stage-vista {
    min-height: 148px;
  }
  .v5b-host-cutout {
    height: 142px;
    max-width: 122px;
  }
  .v5b-rival-stage-stack {
    width: 118px;
    height: 140px;
  }
  .v5b-rival-cutout {
    bottom: 36px;
    height: 102px;
  }
  .v5b-challenger-podium-svg {
    width: 108px;
  }
  .v5b-medallion-svg {
    width: 80px;
    height: 80px;
  }
  .v5b-tile-btn {
    min-height: 54px;
  }
  .v5b-screw-btn {
    min-width: 96px;
    min-height: 48px;
    font-size: 11px;
  }
  .v5b-charm-cup-btn {
    width: 54px;
    height: 54px;
  }
  .v5b-charm-prop-svg {
    width: 44px;
    height: 44px;
  }
}

/* Very narrow mobile portrait (360px) or 5-6 column late-tier boards */
.v5b-board-tray.is-dense-cols .v5b-crest-title {
  font-size: clamp(8.2px, 2vw, 11.5px);
}
.v5b-board-tray.is-dense-cols .v5b-tile-btn {
  min-height: 54px;
}
.v5b-board-tray.is-dense-cols .v5b-tile-emblem-svg,
.v5b-board-tray.is-dense-cols .v5b-twist-svg {
  width: clamp(19px, 5vw, 28px);
  height: clamp(19px, 5vw, 28px);
}
.v5b-board-tray.is-dense-cols .v5b-tile-points {
  font-size: clamp(11.5px, 3vw, 17px);
}

@media (prefers-reduced-motion: reduce) {
  .v5b-host-cutout,
  .v5b-rival-cutout,
  .v5b-medallion-halo::before,
  .v5b-twist-svg.is-wheel-spin,
  .v5b-tile-btn.is-twist-bounty,
  .v5b-tile-btn.is-forced,
  .v5b-tile-btn.is-screw-target,
  .v5b-screw-btn.is-armed,
  .v5b-alert-ribbon {
    animation: none !important;
  }
}
`;

// ============================================================================
// 6. LIVING STAGE BOARD VIEW CONTROLLER
// ============================================================================

export class LivingStageBoardView {
  private readonly rootEl: HTMLElement;
  private readonly stageHostEl: HTMLElement;
  private readonly modalLayerEl: HTMLElement;

  private activeModel: LivingStageBoardViewModelV5 | null = null;
  private activeCallbacks: LivingStageBoardCallbacksV5 | null = null;
  private screwArmed = false;
  private inspectedCharmId: CharmIdV5 | null = null;
  private timerIds: number[] = [];
  private rafIds: number[] = [];
  private modalCleanups: Array<() => void> = [];
  private keydownHandler: ((ev: KeyboardEvent) => void) | null = null;
  private fullscreenHandler: (() => void) | null = null;
  private renderCounter = 0;

  constructor(rootEl: HTMLElement) {
    this.rootEl = rootEl;
    this.injectScopedStyles();

    this.rootEl.innerHTML = '';
    this.rootEl.classList.add('v5b-root');

    this.stageHostEl = document.createElement('div');
    this.stageHostEl.setAttribute('data-v5b-stage', 'true');
    this.rootEl.appendChild(this.stageHostEl);

    this.modalLayerEl = document.createElement('div');
    this.modalLayerEl.className = 'v5b-modal-layer';
    this.modalLayerEl.setAttribute('data-v5b-modal-layer', 'true');
    this.rootEl.appendChild(this.modalLayerEl);

    this.keydownHandler = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        if (this.screwArmed) {
          this.setScrewArmed(false);
        } else if (this.inspectedCharmId) {
          this.inspectedCharmId = null;
          this.renderCharmTooltip();
        }
      }
    };
    window.addEventListener('keydown', this.keydownHandler);

    this.fullscreenHandler = () => this.syncFullscreenButtonState();
    document.addEventListener('fullscreenchange', this.fullscreenHandler);
  }

  private injectScopedStyles(): void {
    if (typeof document === 'undefined') return;
    let styleEl = document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ELEMENT_ID;
      document.head.appendChild(styleEl);
    }
    if (styleEl.textContent !== SCOPED_STYLES_CSS) {
      styleEl.textContent = SCOPED_STYLES_CSS;
    }
  }

  private clearAsyncHooks(): void {
    for (const id of this.timerIds) window.clearTimeout(id);
    this.timerIds = [];
    for (const id of this.rafIds) window.cancelAnimationFrame(id);
    this.rafIds = [];
  }

  private runModalCleanups(): void {
    for (const fn of this.modalCleanups) {
      try {
        fn();
      } catch {
        // Ignore cleanup errors
      }
    }
    this.modalCleanups = [];
  }

  // ==========================================================================
  // PUBLIC GEOMETRY & STAGE INTERACTION API (FOR StageVfxCanvasV5 & ORCHESTRATOR)
  // ==========================================================================

  /**
   * Returns exact viewport center coordinates of any board tile so StageVfxCanvasV5
   * can fire chain-shatter electric arcs, Screw slams, and Wedge gems pixel-accurately!
   */
  public getTileCenterViewportCoords(tileId: string): TileViewportCoordsV5 | null {
    const safeId =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(tileId)
        : tileId.replace(/"/g, '\\"');
    const el = this.stageHostEl.querySelector<HTMLElement>(`[data-tile-id="${safeId}"]`);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  public getMedallionCenterViewportCoords(): TileViewportCoordsV5 | null {
    const el = this.stageHostEl.querySelector<HTMLElement>('[data-v5b-medallion]');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  public getScrewButtonViewportCoords(): TileViewportCoordsV5 | null {
    const el = this.stageHostEl.querySelector<HTMLElement>('[data-v5b-screw-btn]');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  /**
   * Triggers the `.is-shattering` chain-break animation on a tile by ID.
   */
  public triggerTileShatter(tileId: string): void {
    const safeId =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(tileId)
        : tileId.replace(/"/g, '\\"');
    const el = this.stageHostEl.querySelector<HTMLElement>(`[data-tile-id="${safeId}"]`);
    if (!el) return;
    el.classList.remove('is-shattering');
    void el.offsetWidth; // Force reflow so re-trigger replays cleanly
    el.classList.add('is-shattering');
    const tid = window.setTimeout(() => el.classList.remove('is-shattering'), 780);
    this.timerIds.push(tid);
  }

  /**
   * Pulses a Podium Lucky Charm brass cup with a golden trigger burst.
   */
  public pulseCharm(charmId: CharmIdV5): void {
    const el = this.stageHostEl.querySelector<HTMLElement>(`[data-charm-id="${charmId}"]`);
    if (!el) return;
    el.classList.remove('is-triggered');
    void el.offsetWidth;
    el.classList.add('is-triggered');
    const tid = window.setTimeout(() => el.classList.remove('is-triggered'), 1200);
    this.timerIds.push(tid);
  }

  public isScrewArmed(): boolean {
    return this.screwArmed;
  }

  public setScrewArmed(armed: boolean): void {
    const canArm = this.canUseScrewNow();
    const next = armed && canArm;
    if (this.screwArmed === next) return;
    this.screwArmed = next;
    this.syncScrewTargetDom();
    this.activeCallbacks?.onScrewModeChange?.(this.screwArmed);
  }

  public setHostSpeech(
    line: string,
    pose?: HostPoseV5,
    onboardingTip?: LivingStageOnboardingTipV5 | null,
  ): void {
    if (pose) {
      const img = this.stageHostEl.querySelector<HTMLImageElement>('[data-v5b-host-img]');
      if (img) img.src = resolveMaxCutoutUrl(pose);
    }
    const textEl = this.stageHostEl.querySelector<HTMLElement>('[data-v5b-host-line]');
    if (textEl) textEl.textContent = line;
    const tipSlot = this.stageHostEl.querySelector<HTMLElement>('[data-v5b-onboarding-slot]');
    if (tipSlot) {
      tipSlot.innerHTML = onboardingTip
        ? `<div class="v5b-onboarding-tag">${renderUtilityIconSvg('spark', 12)} <strong>${escapeHtml(onboardingTip.badgeLabel)}:</strong> ${escapeHtml(onboardingTip.text)}</div>`
        : '';
    }
  }

  public setRivalReaction(line: string | null, badge?: string | null): void {
    const slot = this.stageHostEl.querySelector<HTMLElement>('[data-v5b-rival-bubble-slot]');
    if (!slot) return;
    if (!line || !this.activeModel?.challenger) {
      slot.innerHTML = '';
      return;
    }
    const label = badge ? `${shortChallengerBadgeName(this.activeModel.challenger)} · ${badge}` : this.activeModel.challenger.name;
    slot.innerHTML = `
      <div class="v5b-speech-bubble is-rival" role="status">
        <span class="v5b-speech-speaker">${renderUtilityIconSvg('flame', 11)} ${escapeHtml(label)}</span>
        <span>${escapeHtml(line)}</span>
      </div>
    `;
  }

  public closeModal(): void {
    this.runModalCleanups();
    this.modalLayerEl.innerHTML = '';
  }

  public dispose(): void {
    this.clearAsyncHooks();
    this.runModalCleanups();
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.fullscreenHandler) {
      document.removeEventListener('fullscreenchange', this.fullscreenHandler);
      this.fullscreenHandler = null;
    }
    this.stageHostEl.innerHTML = '';
    this.modalLayerEl.innerHTML = '';
    this.rootEl.classList.remove('v5b-root');
  }

  private isFullscreenActive(): boolean {
    return typeof document !== 'undefined' && Boolean(document.fullscreenElement);
  }

  private syncFullscreenButtonState(): void {
    const btn = this.stageHostEl.querySelector<HTMLButtonElement>('[data-v5-fullscreen-toggle]');
    if (!btn) return;
    const active = this.isFullscreenActive();
    btn.setAttribute('aria-pressed', String(active));
    btn.setAttribute('aria-label', active ? 'Exit Fullscreen' : 'Enter Fullscreen');
    btn.title = active ? 'Exit Fullscreen' : 'Fullscreen Stage';
    btn.innerHTML = renderUtilityIconSvg(active ? 'fullscreen_exit' : 'fullscreen_enter', 15);
  }

  private toggleFullscreen(): void {
    if (typeof document === 'undefined') return;
    if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch(() => undefined);
    } else {
      void document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
  }

  // ==========================================================================
  // 7. MAIN LIVING STAGE BOARD RENDERER
  // ==========================================================================

  private ensureAttached(): void {
    this.injectScopedStyles();
    if (!this.stageHostEl.isConnected || !this.modalLayerEl.isConnected) {
      this.rootEl.innerHTML = '';
      this.rootEl.classList.add('v5b-root');
      this.rootEl.appendChild(this.stageHostEl);
      this.rootEl.appendChild(this.modalLayerEl);
    }
  }

  public render(
    model: LivingStageBoardViewModelV5,
    callbacks: LivingStageBoardCallbacksV5,
  ): void {
    this.ensureAttached();
    this.clearAsyncHooks();
    this.activeModel = model;
    this.activeCallbacks = callbacks;
    this.screwArmed = false;
    this.inspectedCharmId = null;
    this.renderCounter += 1;

    const uid = `b${this.renderCounter}`;
    const { board, episode, challenger } = model;
    const tier = clampTier(episode.tierNumber);
    const venueBgUrl = V5_VENUE_STAGES[tier];
    const maxCutoutUrl = resolveMaxCutoutUrl(model.hostPose ?? 'welcome');
    const rivalCutoutUrl = resolveChallengerCutoutUrl(challenger);
    const colsCount = board.columns.length;
    const maxRow = board.tiles.reduce((acc, t) => Math.max(acc, t.rowIndex), 0);

    const tileByKey = new Map<string, BoardTileV4>();
    for (const t of board.tiles) {
      tileByKey.set(`${t.rowIndex}:${t.colIndex}`, t);
    }

    const newlyUnlockedSet = new Set(model.newlyUnlockedTileIds ?? []);
    const triggeredCharmsSet = new Set(model.triggeredCharmIds ?? []);
    const screwsRemaining =
      model.screwsRemaining !== undefined
        ? Math.max(0, model.screwsRemaining)
        : board.hasActiveRival
          ? 1
          : 0;
    const canScrew = board.hasActiveRival && screwsRemaining > 0 && board.forcedTileId === null;

    const playerName = (model.playerDisplayName || 'YOU').toUpperCase();
    const soloPct = Math.min(
      100,
      Math.round((board.playerScore / Math.max(1, board.soloTargetScore)) * 100),
    );

    const rivalReaction =
      model.rivalReactionLine ?? model.lastChallengerAction?.banterLine ?? null;
    const rivalBadge =
      model.rivalActionBadge ??
      (model.lastChallengerAction
        ? this.formatChallengerBadge(model.lastChallengerAction)
        : null);

    // Build Category Crests
    const crestsHtml = board.columns
      .map((col) => {
        const theme = COLUMN_THEMES_BY_DOMAIN[col.domainId] ?? COLUMN_THEMES_BY_DOMAIN[0];
        const isFrozen = col.frozenTurnsRemaining > 0;
        return `
          <div
            class="v5b-col-crest ${isFrozen ? 'is-frozen' : ''}"
            style="--v5b-crest-top:${theme.crestTop};--v5b-crest-bot:${theme.crestBottom};--v5b-crest-border:${theme.crestBorder}"
            data-col-index="${col.colIndex}"
            title="${escapeHtml(col.wittyTitle)} (${escapeHtml(col.topicSubtitle)})"
          >
            <span class="v5b-crest-medallion">${renderDomainEmblemSvg(col.domainId, '#3b2104', 15)}</span>
            <span class="v5b-crest-title">${escapeHtml(col.wittyTitle)}</span>
            ${
              isFrozen
                ? `<span class="v5b-crest-flag">${renderUtilityIconSvg('frost', 9)} FROZEN</span>`
                : col.pickedBy === 'RIVAL'
                  ? `<span class="v5b-crest-flag" style="background:#5c1122;border-color:#ff94a8;color:#ffd6de;">RIVAL</span>`
                  : ''
            }
          </div>
        `;
      })
      .join('');

    const twistBadgeLabel = resolveBoardTwistLabel(model.boardTwistId, model.boardTwistLabel);
    const twistShortPill = resolveBoardTwistShortPill(model.boardTwistId);
    const fsActive = this.isFullscreenActive();

    // Build Octagonal Tiles (row-major)
    const tilesHtml: string[] = [];
    for (let r = 0; r <= maxRow; r++) {
      for (let c = 0; c < colsCount; c++) {
        const tile = tileByKey.get(`${r}:${c}`);
        if (!tile) {
          tilesHtml.push('<div></div>');
          continue;
        }
        const col = board.columns[c];
        tilesHtml.push(
          this.renderOctagonalTileHtml(
            tile,
            col,
            board.forcedTileId,
            newlyUnlockedSet.has(tile.tileId),
            `${uid}_${r}_${c}`,
            model.tileMetaById?.[tile.tileId],
          ),
        );
      }
    }

    // Build 3 Recessed Brass Charm Cups
    const equippedCharms = (model.equippedCharms ?? []).slice(0, 3);
    const charmCupsHtml = [0, 1, 2]
      .map((slotIdx) => {
        const charm = equippedCharms[slotIdx];
        if (!charm) {
          return `
            <button type="button" class="v5b-charm-cup-btn" disabled aria-label="Empty podium charm cup ${slotIdx + 1}" title="Unlock Podium Lucky Charms on your World Tour!">
              <span class="v5b-charm-cup-well">
                <span class="v5b-charm-cup-empty">SLOT ${slotIdx + 1}</span>
              </span>
            </button>
          `;
        }
        const triggeredCls = triggeredCharmsSet.has(charm.charmId) ? 'is-triggered' : '';
        return `
          <button
            type="button"
            class="v5b-charm-cup-btn ${triggeredCls}"
            data-charm-id="${escapeHtml(charm.charmId)}"
            aria-label="${escapeHtml(charm.name)} — ${escapeHtml(charm.effectSummary)}"
            title="${escapeHtml(charm.name)}: ${escapeHtml(charm.effectSummary)}"
          >
            <span class="v5b-charm-cup-well">
              ${renderPhysicalCharmSvg(charm.svgEmblemKind, charm.accentHex)}
            </span>
          </button>
        `;
      })
      .join('');

    // Optional Active Sponsor Dare Brass Tag
    const dareHtml = model.activeDare
      ? `
        <div class="v5b-dare-tag ${model.dareCompleted ? 'is-completed' : ''}" title="${escapeHtml(model.activeDare.description)}">
          <div>
            <div class="v5b-dare-kicker">${model.dareCompleted ? 'DARE COMPLETE!' : 'SPONSOR DARE'} · +${formatUsdCompact(model.activeDare.bonusPurseUsd)}</div>
            <div>${escapeHtml(model.activeDare.description)}</div>
          </div>
        </div>
      `
      : '';

    // Optional Tug-of-War Territory Turf Meter
    const turfHtml = model.tugOfWarTurf
      ? (() => {
          const p = Math.max(0, model.tugOfWarTurf.playerTiles);
          const r = Math.max(0, model.tugOfWarTurf.rivalTiles);
          const total = Math.max(1, p + r);
          const pct = Math.round((p / total) * 100);
          return `
            <div class="v5b-turf-bar" aria-label="Territory Turf You ${p} vs Rival ${r}">
              <span>YOU ${p}</span>
              <div class="v5b-turf-track"><div class="v5b-turf-fill" style="width:${pct}%"></div></div>
              <span>RIVAL ${r}${model.tugOfWarTurf.bonusPts ? ` · +${model.tugOfWarTurf.bonusPts}` : ''}</span>
            </div>
          `;
        })()
      : '';

    this.stageHostEl.innerHTML = `
      <div class="v5b-stage-bg" style="background-image:url('${escapeHtml(venueBgUrl)}')" aria-hidden="true"></div>

      <div class="v5b-stage-canvas">
        <!-- Top Floating Broadcast Controls -->
        <header class="v5b-top-rail">
          <div class="v5b-rail-group">
            <button type="button" class="v5b-brass-pill-btn" data-v5b-action="back">
              ${renderUtilityIconSvg('back', 14)} <span>Tour</span>
            </button>
            <span class="v5b-venue-chip">${escapeHtml(episode.venueName)} &middot; ${escapeHtml(twistBadgeLabel || episode.title)}</span>
          </div>

          <div class="v5b-rail-group">
            ${
              model.activeWheelBoostLabel
                ? `<span class="v5b-brass-badge is-gold">${renderUtilityIconSvg('wheel', 13)} ${escapeHtml(model.activeWheelBoostLabel)}</span>`
                : twistShortPill
                  ? `<span class="v5b-brass-badge is-gold">${renderUtilityIconSvg('spark', 12)} ${escapeHtml(twistShortPill)}</span>`
                  : ''
            }
            <span class="v5b-brass-badge" title="Live World Audience Watching">
              ${renderUtilityIconSvg('eye', 13)} ${formatAudienceCompact(episode.baseAudienceWatching)}
            </span>
            <button type="button" class="v5b-brass-pill-btn v5b-brass-icon-btn" data-v5b-action="audio" aria-label="${model.audioEnabled ? 'Mute Audio' : 'Unmute Audio'}" title="${model.audioEnabled ? 'Audio ON' : 'Audio OFF'}">
              ${renderUtilityIconSvg(model.audioEnabled ? 'sound_on' : 'sound_off', 15)}
            </button>
            <button type="button" class="v5b-brass-pill-btn v5b-brass-icon-btn" data-v5b-action="howto" aria-label="Show Rules" title="How To Play">
              ${renderUtilityIconSvg('help', 15)}
            </button>
            <button
              type="button"
              class="v5b-brass-pill-btn v5b-brass-icon-btn"
              data-v5-fullscreen-toggle
              aria-pressed="${fsActive}"
              aria-label="${fsActive ? 'Exit Fullscreen' : 'Enter Fullscreen'}"
              title="${fsActive ? 'Exit Fullscreen' : 'Fullscreen Stage'}"
            >
              ${renderUtilityIconSvg(fsActive ? 'fullscreen_exit' : 'fullscreen_enter', 15)}
            </button>
          </div>
        </header>

        <!-- Landscape Left Column (display: contents on Portrait & Desktop!) -->
        <div class="v5b-landscape-left-col">
          <!-- Live Theatrical Stage Upper Vista -->
          <section class="v5b-stage-vista" aria-label="Broadcast Stage">
            <!-- Stage Left: Host Max Sterling -->
            <div class="v5b-host-zone">
              <div class="v5b-actor-wrap">
                <img
                  class="v5b-host-cutout"
                  data-v5b-host-img
                  src="${escapeHtml(maxCutoutUrl)}"
                  alt="Host Max Sterling"
                  decoding="async"
                />
              </div>
            </div>

            <!-- Stage Center: Glowing 6-Wedge Jewel Championship Medallion -->
            <div class="v5b-center-medallion-zone">
              <div class="v5b-medallion-halo" data-v5b-medallion>
                ${renderJewelMedallionSvg(board.earnedWedges, uid, 108)}
              </div>
              <span class="v5b-turn-ribbon">TURN ${Math.min(board.turnNumber + 1, board.maxTurns)} / ${board.maxTurns}</span>
            </div>

            <!-- Stage Right: Challenger behind Carved Mahogany & Brass Podium -->
            <div class="v5b-rival-zone">
              <div class="v5b-rival-stage-stack">
                ${
                  board.hasActiveRival && challenger && rivalCutoutUrl
                    ? `<img
                         class="v5b-rival-cutout"
                         src="${escapeHtml(rivalCutoutUrl)}"
                         alt="${escapeHtml(challenger.name)}"
                         decoding="async"
                       />`
                    : `<div class="v5b-solo-podium-spotlight" aria-hidden="true"></div>`
                }
                ${renderContestantPodiumSvg(Boolean(board.hasActiveRival && challenger), challenger?.accentHex ?? '#2c5bb5')}
              </div>
            </div>
          </section>

          <!-- Sculpted Diamond-Tipped Brass & Sapphire Score Plaques -->
          <section class="v5b-score-plaques-row" aria-label="Scoreboard">
            <div class="v5b-score-plaque-wrap">
              <div class="v5b-score-plaque-rim">
                <div class="v5b-score-plaque-face">
                  <div class="v5b-score-plaque-main">
                    <span>${escapeHtml(playerName)} &middot;</span>
                    <span class="v5b-score-plaque-pts">${board.playerScore.toLocaleString('en-US')}</span>
                    <span>PTS</span>
                  </div>
                  <div class="v5b-score-plaque-sub">
                    <span>50/50: ${board.lifelines5050Left}</span>
                    <span>CLUE: ${board.lifelinesHintLeft}</span>
                    ${
                      model.currentStreak >= 2
                        ? `<span class="v5b-streak-chip">${renderUtilityIconSvg('flame', 11)} ${model.currentStreak}x</span>`
                        : ''
                    }
                  </div>
                </div>
              </div>
            </div>

            <div class="v5b-score-plaque-wrap">
              <div class="v5b-score-plaque-rim">
                <div class="v5b-score-plaque-face">
                  ${
                    board.hasActiveRival && challenger
                      ? `
                        <div class="v5b-score-plaque-main">
                          <span>${escapeHtml(shortChallengerBadgeName(challenger))} &middot;</span>
                          <span class="v5b-score-plaque-pts" style="color:#ffb8c6;">${board.rivalScore.toLocaleString('en-US')}</span>
                          <span>PTS</span>
                        </div>
                        <div class="v5b-score-plaque-sub">
                          <span>WEDGES: ${board.rivalWedges.length}/6</span>
                        </div>
                      `
                      : `
                        <div class="v5b-score-plaque-main">
                          <span>HOUSE TARGET &middot;</span>
                          <span class="v5b-score-plaque-pts">${board.soloTargetScore.toLocaleString('en-US')}</span>
                          <span>PTS</span>
                        </div>
                        <div class="v5b-solo-bar-track" aria-label="${soloPct}% of qualifying target">
                          <div class="v5b-solo-bar-fill" style="width:${soloPct}%"></div>
                        </div>
                      `
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- Sculpted Angled Speech Bubbles (Max Sterling + Optional Onboarding + Rival Reaction) -->
          <section class="v5b-speech-strip" aria-live="polite">
            <div class="v5b-speech-bubble">
              <span class="v5b-speech-speaker">${renderUtilityIconSvg('mic', 11)} Max Sterling</span>
              <span data-v5b-host-line>${escapeHtml(model.hostLine)}</span>
              <div data-v5b-onboarding-slot>
                ${
                  model.onboardingTip
                    ? `<div class="v5b-onboarding-tag">${renderUtilityIconSvg('spark', 11)} <strong>${escapeHtml(model.onboardingTip.badgeLabel)}:</strong> ${escapeHtml(model.onboardingTip.text)}</div>`
                    : ''
                }
              </div>
            </div>
            <div data-v5b-rival-bubble-slot style="display:contents;">
              ${
                board.hasActiveRival && challenger && rivalReaction
                  ? `<div class="v5b-speech-bubble is-rival">
                       <span class="v5b-speech-speaker">${renderUtilityIconSvg('flame', 11)} ${escapeHtml(rivalBadge ? `${shortChallengerBadgeName(challenger)} · ${rivalBadge}` : challenger.name)}</span>
                       <span>${escapeHtml(rivalReaction)}</span>
                     </div>`
                  : ''
              }
            </div>
          </section>

          <!-- Bottom Carved Mahogany & Brass Contestant Podium Ledge -->
          <footer class="v5b-podium-ledge-wrap" aria-label="Contestant Podium Controls">
            <div class="v5b-podium-ledge">
              <div class="v5b-podium-wood">
                <!-- Left: Glossy 3D Red Dome SCREW RIVAL! Buzzer -->
                <div class="v5b-screw-station">
                  <div class="v5b-screw-collar">
                    <button
                      type="button"
                      class="v5b-screw-btn"
                      data-v5b-screw-btn
                      ${canScrew ? '' : 'disabled'}
                      title="${
                        canScrew
                          ? 'Force an open tile onto your Rival! If they choke, you steal 100% of its points!'
                          : board.hasActiveRival
                            ? 'No Screw tokens left this match'
                            : 'Screw Rival unlocks in head-to-head Rival matches'
                      }"
                    >
                      <span data-v5b-screw-label>${board.hasActiveRival ? 'SCREW<br/>RIVAL!' : 'SOLO<br/>STAGE'}</span>
                    </button>
                    ${
                      board.hasActiveRival
                        ? `<span class="v5b-screw-count-pip" aria-label="${screwsRemaining} Screws remaining">&times;${screwsRemaining}</span>`
                        : ''
                    }
                  </div>
                </div>

                <!-- Center: Optional Active Sponsor Dare Brass Tag -->
                ${dareHtml}

                <!-- Right: 3 Recessed Circular Brass Charm Cups -->
                <div class="v5b-charm-cups-row" data-v5b-charm-row>
                  ${charmCupsHtml}
                  <div data-v5b-charm-tooltip-slot></div>
                </div>
              </div>
            </div>
          </footer>
        </div>

        <!-- Landscape Right Column (display: contents on Portrait & Desktop!) -->
        <div class="v5b-landscape-right-col">
          <!-- Dynamic Alert Ribbon (Screw Armed OR Forced Stage Pick) -->
          <div class="v5b-alert-slot" data-v5b-alert-slot>
            ${
              board.forcedTileId
                ? `<div class="v5b-alert-ribbon is-forced" role="alert">
                     <div>
                       <div class="v5b-alert-title">FORCED STAGE PICK — NO BACKING OUT!</div>
                       <div class="v5b-alert-sub">${escapeHtml(board.forcedReasonBanner || 'The studio spotlight locked your tile! Tap the glowing octagon.')}</div>
                     </div>
                   </div>`
                : ''
            }
          </div>

          <!-- Tilted 2.5D Octagonal Crystal-and-Brass Stage Board -->
          <main class="v5b-board-stage-wrap" aria-label="Game Show Stage Board">
            <div class="v5b-board-tray ${colsCount >= 5 ? 'is-dense-cols' : ''}" style="--v5b-cols:${colsCount}">
              <div class="v5b-board-enamel">
                <div class="v5b-crests-grid">
                  ${crestsHtml}
                </div>
                <div class="v5b-tiles-grid" data-v5b-tiles-grid>
                  ${tilesHtml.join('')}
                </div>
                ${turfHtml}
              </div>
            </div>
          </main>
        </div>
      </div>
    `;

    this.bindStageEvents();
  }

  private renderOctagonalTileHtml(
    tile: BoardTileV4,
    column: BoardColumnV4 | undefined,
    forcedTileId: string | null,
    justUnlocked: boolean,
    uid: string,
    visualMeta?: BoardTileVisualMetaV5,
  ): string {
    const theme = COLUMN_THEMES_BY_DOMAIN[tile.domainId] ?? COLUMN_THEMES_BY_DOMAIN[0];
    const colTitle = column?.wittyTitle ?? 'Category';
    const displayPts = visualMeta?.displayPointsOverride ?? tile.pointValue;
    const isForced = forcedTileId === tile.tileId;
    const dimmedByOtherForced = forcedTileId !== null && !isForced;
    const baseStyle = `--v5b-tile-hi:${theme.tileHi};--v5b-tile-mid:${theme.tileMid};--v5b-tile-low:${theme.tileLow};--v5b-tile-ink:${theme.inkHex}`;

    // Cleared / Claimed States
    if (tile.status === 'CLEARED_WIN') {
      return `
        <button type="button" class="v5b-tile-btn is-cleared-win" style="${baseStyle}" data-tile-id="${escapeHtml(tile.tileId)}" disabled aria-label="${escapeHtml(colTitle)} ${tile.pointValue} points won">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${renderUtilityIconSvg('check', 22)}
            <span class="v5b-cleared-label">WON</span>
          </div></div>
        </button>
      `;
    }

    if (tile.status === 'CLEARED_MISS') {
      return `
        <button type="button" class="v5b-tile-btn is-cleared-miss" style="${baseStyle}" data-tile-id="${escapeHtml(tile.tileId)}" disabled aria-label="${escapeHtml(colTitle)} ${tile.pointValue} points played">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${renderUtilityIconSvg('cross', 18)}
            <span class="v5b-cleared-label">PLAYED</span>
          </div></div>
        </button>
      `;
    }

    if (tile.status === 'CLAIMED_BY_RIVAL') {
      return `
        <button type="button" class="v5b-tile-btn is-rival-claimed" style="${baseStyle}" data-tile-id="${escapeHtml(tile.tileId)}" disabled aria-label="${escapeHtml(colTitle)} claimed by Rival">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${renderUtilityIconSvg('shield', 18)}
            <span class="v5b-cleared-label">RIVAL</span>
          </div></div>
        </button>
      `;
    }

    // Padlocked Tile (Heavy Crossed 3D Iron Chains + Gold Brass Padlock)
    if (tile.status === 'PADLOCKED') {
      return `
        <button type="button" class="v5b-tile-btn is-padlocked" style="${baseStyle}" data-tile-id="${escapeHtml(tile.tileId)}" disabled title="Solve an adjacent tile to shatter the iron chains!" aria-label="Locked ${escapeHtml(colTitle)} ${displayPts} points">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${renderChainsAndPadlockSvg(uid)}
            <span class="v5b-tile-points">${displayPts}</span>
          </div></div>
        </button>
      `;
    }

    if (tile.status === 'FOGGED') {
      return `
        <button type="button" class="v5b-tile-btn is-fogged" style="${baseStyle}" data-tile-id="${escapeHtml(tile.tileId)}" disabled title="Solve an adjacent tile to lift the stage fog!" aria-label="Fogged mystery tile">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${renderUtilityIconSvg('fog', 24)}
            <span class="v5b-cleared-label">MYSTERY</span>
          </div></div>
        </button>
      `;
    }

    if (tile.status === 'FROZEN_BY_RIVAL') {
      return `
        <button type="button" class="v5b-tile-btn is-frozen" style="${baseStyle}" data-tile-id="${escapeHtml(tile.tileId)}" disabled title="Frozen by Rival for 1 turn" aria-label="Frozen ${tile.pointValue} points">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${renderUtilityIconSvg('frost', 22)}
            <span class="v5b-tile-points" style="color:#e6fbff;text-shadow:0 2px 4px rgba(0,0,0,0.75);">${tile.pointValue}</span>
          </div></div>
        </button>
      `;
    }

    // OPEN Tile — NEVER write "CLASSIC"! Show rich SVG Twist / Format / Domain Emblem + Bold Value
    const extraClasses: string[] = [];
    if (justUnlocked) extraClasses.push('is-shattering');
    if (isForced) extraClasses.push('is-forced');
    if (dimmedByOtherForced) extraClasses.push('is-dimmed');
    if (visualMeta?.isGoldFever) extraClasses.push('is-gold-fever');
    if (visualMeta?.isCrossroadsDiagonal) extraClasses.push('is-crossroads-diag');

    let innerHtml = '';
    const formatNote = describeFormatAccessible(tile.format);
    let ariaDetail = `${colTitle}, ${displayPts} points, ${formatNote}`;

    const modPipHtml = visualMeta?.hotPotatoTurnsLeft !== undefined
      ? `<span class="v5b-modifier-pip">${visualMeta.hotPotatoTurnsLeft}T</span>`
      : visualMeta?.isGoldFever
        ? `<span class="v5b-modifier-pip is-gold">2&times;</span>`
        : visualMeta?.isCrossroadsDiagonal
          ? `<span class="v5b-modifier-pip">2&times;X</span>`
          : '';

    const showWheel = tile.twist === 'WHEEL_CURVEBALL' && tile.twistRevealedToPlayer;
    const showBlitz = tile.twist === 'LIGHTNING_BLITZ';
    const showBounty = tile.twist === 'RIVAL_BOUNTY';
    const showPower = tile.twist === 'POWER_PLAY' && tile.twistRevealedToPlayer;
    const showCrown = tile.twist === 'CROWN_WEDGE';

    if (visualMeta?.isSpiralCore) {
      extraClasses.push('is-spiral-core');
      ariaDetail = `${colTitle}, ${displayPts} points, Spiral Labyrinth Core Vault`;
      innerHtml = `
        ${modPipHtml}
        ${renderSpecialTwistSvg('SPIRAL_CORE', tile.wedgeId)}
        <span class="v5b-tile-points">${displayPts.toLocaleString('en-US')}</span>
      `;
    } else if (visualMeta?.isPyramidApex) {
      extraClasses.push('is-pyramid-apex');
      ariaDetail = `${colTitle}, ${displayPts} points, Pyramid Ascent Summit Crown`;
      innerHtml = `
        ${modPipHtml}
        ${renderSpecialTwistSvg('PYRAMID_APEX', tile.wedgeId)}
        <span class="v5b-tile-points">${displayPts}</span>
      `;
    } else if (visualMeta?.isFlameThaw) {
      extraClasses.push('is-flame-thaw');
      ariaDetail = `${colTitle}, ${displayPts} points, Flame Thaw Tile (+200 Thaw Bonus)`;
      innerHtml = `
        <span class="v5b-mini-pts-tag">${displayPts}</span>
        ${renderSpecialTwistSvg('FLAME_THAW', tile.wedgeId)}
        <span class="v5b-twist-label">FLAME THAW</span>
      `;
    } else if (showWheel) {
      extraClasses.push('is-twist-wheel');
      ariaDetail = `${colTitle}, ${displayPts} points, Spinning Stage Wheel Twist`;
      innerHtml = `
        ${modPipHtml}
        ${renderSpecialTwistSvg('WHEEL', tile.wedgeId)}
        <span class="v5b-tile-points">${displayPts}</span>
      `;
    } else if (showBlitz) {
      extraClasses.push('is-twist-blitz');
      ariaDetail = `${colTitle}, ${displayPts} points, Time-Bomb Blitz`;
      innerHtml = `
        ${modPipHtml}
        <span class="v5b-mini-pts-tag">${displayPts}</span>
        ${renderSpecialTwistSvg('TIME_BOMB', tile.wedgeId)}
        <span class="v5b-twist-label">TIME-BOMB<br/>BLITZ</span>
      `;
    } else if (showBounty) {
      extraClasses.push('is-twist-bounty');
      ariaDetail = `${colTitle}, ${displayPts} points, Rival Bounty Crosshair`;
      innerHtml = `
        ${modPipHtml}
        <span class="v5b-mini-pts-tag">${displayPts}</span>
        ${renderSpecialTwistSvg('RIVAL_BOUNTY', tile.wedgeId)}
        <span class="v5b-twist-label">RIVAL BOUNTY</span>
      `;
    } else if (showPower) {
      extraClasses.push('is-twist-power');
      ariaDetail = `${colTitle}, ${displayPts} points, Power Play Wager`;
      innerHtml = `
        ${modPipHtml}
        ${renderSpecialTwistSvg('POWER_PLAY', tile.wedgeId)}
        <span class="v5b-twist-label">POWER PLAY</span>
      `;
    } else if (showCrown) {
      extraClasses.push('is-twist-wedge');
      ariaDetail = `${colTitle}, ${displayPts} points, Crown Wedge Jewel Tile`;
      innerHtml = `
        ${modPipHtml}
        ${renderSpecialTwistSvg('CROWN_WEDGE', tile.wedgeId)}
        <span class="v5b-tile-points">${displayPts}</span>
      `;
    } else {
      if (displayPts >= 400) {
        extraClasses.push('is-tier-gold');
      }
      const emblemSvg =
        tile.format === 'MULTIPLE_CHOICE'
          ? renderDomainEmblemSvg(tile.domainId, displayPts >= 400 ? '#4d2b06' : theme.iconAccent, 32)
          : renderFormatEmblemSvg(tile.format, displayPts >= 400 ? '#4d2b06' : theme.iconAccent, 32);

      innerHtml = `
        ${modPipHtml}
        ${emblemSvg}
        <span class="v5b-tile-points">${displayPts}</span>
      `;
    }

    return `
      <button
        type="button"
        class="v5b-tile-btn ${extraClasses.join(' ')}"
        style="${baseStyle}"
        data-tile-id="${escapeHtml(tile.tileId)}"
        data-tile-open="true"
        title="${escapeHtml(ariaDetail)}"
        aria-label="${escapeHtml(ariaDetail)}"
        ${dimmedByOtherForced ? 'disabled' : ''}
      >
        <div class="v5b-tile-rim">
          <div class="v5b-tile-face">
            ${innerHtml}
          </div>
        </div>
      </button>
    `;
  }

  private bindStageEvents(): void {
    const callbacks = this.activeCallbacks;
    if (!callbacks) return;

    this.stageHostEl
      .querySelector('[data-v5b-action="back"]')
      ?.addEventListener('click', () => callbacks.onBackToMap());
    this.stageHostEl
      .querySelector('[data-v5b-action="audio"]')
      ?.addEventListener('click', () => callbacks.onToggleAudio());
    this.stageHostEl
      .querySelector('[data-v5b-action="howto"]')
      ?.addEventListener('click', () => {
        if (callbacks.onOpenHowToPlay) callbacks.onOpenHowToPlay();
        else this.openHowToPlayModal();
      });
    this.stageHostEl
      .querySelector('[data-v5-fullscreen-toggle]')
      ?.addEventListener('click', () => this.toggleFullscreen());

    // Screw Rival Dome Buzzer
    this.stageHostEl
      .querySelector<HTMLButtonElement>('[data-v5b-screw-btn]')
      ?.addEventListener('click', () => {
        if (!this.canUseScrewNow()) return;
        this.setScrewArmed(!this.screwArmed);
      });

    // Board Octagonal Tile Clicks (normal pick vs Screw Target execution)
    this.stageHostEl.querySelectorAll<HTMLButtonElement>('[data-tile-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const tileId = btn.dataset.tileId;
        if (!tileId) return;
        if (this.screwArmed && btn.dataset.tileOpen === 'true') {
          this.setScrewArmed(false);
          if (callbacks.onScrewTile) {
            callbacks.onScrewTile(tileId);
          } else {
            callbacks.onSelectTile(tileId);
          }
          return;
        }
        callbacks.onSelectTile(tileId);
      });
    });

    // Podium Lucky Charm Cups (hover + tap inspect tooltip)
    this.stageHostEl.querySelectorAll<HTMLButtonElement>('[data-charm-id]').forEach((btn) => {
      const charmId = btn.dataset.charmId as CharmIdV5;
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.inspectedCharmId = this.inspectedCharmId === charmId ? null : charmId;
        this.renderCharmTooltip();
        const found = this.activeModel?.equippedCharms?.find((c) => c.charmId === charmId);
        if (found) callbacks.onCharmInspect?.(found);
      });
    });
  }

  private canUseScrewNow(): boolean {
    if (!this.activeModel) return false;
    const { board } = this.activeModel;
    const rem =
      this.activeModel.screwsRemaining !== undefined
        ? this.activeModel.screwsRemaining
        : board.hasActiveRival
          ? 1
          : 0;
    return board.hasActiveRival && rem > 0 && board.forcedTileId === null;
  }

  private syncScrewTargetDom(): void {
    const screwBtn = this.stageHostEl.querySelector<HTMLButtonElement>('[data-v5b-screw-btn]');
    const screwLabel = this.stageHostEl.querySelector<HTMLElement>('[data-v5b-screw-label]');
    const alertSlot = this.stageHostEl.querySelector<HTMLElement>('[data-v5b-alert-slot]');

    if (screwBtn) {
      screwBtn.classList.toggle('is-armed', this.screwArmed);
    }
    if (screwLabel) {
      screwLabel.innerHTML = this.screwArmed ? 'CANCEL<br/>SCREW' : 'SCREW<br/>RIVAL!';
    }

    if (alertSlot) {
      if (this.screwArmed) {
        alertSlot.innerHTML = `
          <div class="v5b-alert-ribbon" role="alert">
            <div>
              <div class="v5b-alert-title">SELECT A TILE TO FORCE ONTO RIVAL!</div>
              <div class="v5b-alert-sub">If they choke, you STEAL 100% of the points &amp; shatter chains! If they nail it, they bank it!</div>
            </div>
            <button type="button" class="v5b-brass-pill-btn" data-v5b-cancel-screw>Cancel</button>
          </div>
        `;
        alertSlot
          .querySelector('[data-v5b-cancel-screw]')
          ?.addEventListener('click', () => this.setScrewArmed(false));
      } else if (this.activeModel?.board.forcedTileId) {
        alertSlot.innerHTML = `
          <div class="v5b-alert-ribbon is-forced" role="alert">
            <div>
              <div class="v5b-alert-title">FORCED STAGE PICK — NO BACKING OUT!</div>
              <div class="v5b-alert-sub">${escapeHtml(this.activeModel.board.forcedReasonBanner || 'Tap the glowing tile to answer!')}</div>
            </div>
          </div>
        `;
      } else {
        alertSlot.innerHTML = '';
      }
    }

    this.stageHostEl.querySelectorAll<HTMLButtonElement>('[data-tile-open="true"]').forEach((btn) => {
      if (btn.disabled) return;
      btn.classList.toggle('is-screw-target', this.screwArmed);
      const face = btn.querySelector('.v5b-tile-face');
      if (!face) return;
      const existing = face.querySelector('.v5b-screw-reticle');
      if (this.screwArmed && !existing) {
        const ret = document.createElement('span');
        ret.className = 'v5b-screw-reticle';
        ret.setAttribute('aria-hidden', 'true');
        ret.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 100 80" preserveAspectRatio="none" fill="none"><path d="M18 6H8V18M82 6H92V18M18 74H8V62M82 74H92V62" stroke="#ffe485" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="84" cy="16" r="5" fill="#e62232" stroke="#ffe485" stroke-width="2"/></svg>`;
        face.appendChild(ret);
      } else if (!this.screwArmed && existing) {
        existing.remove();
      }
    });
  }

  private renderCharmTooltip(): void {
    const slot = this.stageHostEl.querySelector<HTMLElement>('[data-v5b-charm-tooltip-slot]');
    if (!slot) return;
    if (!this.inspectedCharmId || !this.activeModel?.equippedCharms) {
      slot.innerHTML = '';
      return;
    }
    const charm = this.activeModel.equippedCharms.find(
      (c) => c.charmId === this.inspectedCharmId,
    );
    if (!charm) {
      slot.innerHTML = '';
      return;
    }
    slot.innerHTML = `
      <div class="v5b-charm-tooltip" role="tooltip">
        <div class="v5b-charm-tooltip-title">${escapeHtml(charm.name)}</div>
        <div class="v5b-charm-tooltip-tag">${escapeHtml(charm.tagline)}</div>
        <div class="v5b-charm-tooltip-effect">${escapeHtml(charm.effectSummary)}</div>
        <div class="v5b-charm-tooltip-origin">Earned from: ${escapeHtml(charm.originSource)}</div>
      </div>
    `;
  }

  private formatChallengerBadge(action: ChallengerTurnActionV4): string {
    switch (action.moveKind) {
      case 'FORCE_WEAK_TILE':
        return 'FORCED PICK';
      case 'FREEZE_FAVORITE_COLUMN':
        return 'FROZE COLUMN';
      case 'PLANT_BOUNTY':
        return 'BOUNTY PLANTED';
      case 'CLAIM_TILE':
        return action.rivalSucceeded ? `+${action.rivalPointsDelta} PTS` : 'MISSED!';
    }
  }

  // ==========================================================================
  // 8. SPOTLIGHT ROULETTE SWEEP ANIMATION
  // ==========================================================================

  public animateSpotlightRoulette(targetTileId: string, durationMs = 1500): Promise<void> {
    const tiles = Array.from(
      this.stageHostEl.querySelectorAll<HTMLButtonElement>('[data-tile-open="true"]:not(:disabled)'),
    );
    const safeId =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(targetTileId)
        : targetTileId.replace(/"/g, '\\"');
    const targetEl = this.stageHostEl.querySelector<HTMLButtonElement>(`[data-tile-id="${safeId}"]`);
    if (!targetEl || tiles.length === 0) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const steps = 11;
      const stepMs = Math.max(70, Math.floor(durationMs / steps));
      let prevEl: HTMLElement | null = null;

      for (let i = 0; i < steps; i++) {
        const tid = window.setTimeout(() => {
          if (prevEl) prevEl.classList.remove('is-spotlight-sweep');
          const el = i === steps - 1 ? targetEl : tiles[i % tiles.length];
          el.classList.add('is-spotlight-sweep');
          prevEl = el;
          if (i === steps - 1) {
            el.classList.add('is-forced');
            resolve();
          }
        }, i * stepMs);
        this.timerIds.push(tid);
      }
    });
  }

  // ==========================================================================
  // 9. MODAL A: PHYSICAL DRAGGABLE BRASS 6-SLICE STAGE WHEEL
  // ==========================================================================

  public openStageWheelModal(
    model: StageWheelModalModelV5,
    callbacks: StageWheelModalCallbacksV5,
  ): void {
    this.closeModal();
    const targetIdx = Math.max(
      0,
      WHEEL_SLICES_V5.findIndex((s) => s.outcome === model.outcome),
    );
    const wheelSvg = this.buildPhysicalBrassWheelSvg();

    this.modalLayerEl.innerHTML = `
      <div class="v5b-wheel-console" role="dialog" aria-modal="true" aria-label="Physical Brass Stage Wheel">
        <span class="v5b-marquee-ribbon">${renderUtilityIconSvg('wheel', 14)} CURVEBALL STAGE WHEEL</span>
        <h2 class="v5b-modal-headline">${escapeHtml(model.hostPrompt || 'GIVE THE BRASS WHEEL A SPIN!')}</h2>

        <div class="v5b-wheel-housing" data-v5b-wheel-housing>
          <svg class="v5b-wheel-clapper" data-v5b-wheel-clapper viewBox="0 0 38 44" aria-hidden="true">
            <defs>
              <linearGradient id="v5w-clap-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff5c0"/>
                <stop offset="50%" stop-color="#e3ad3b"/>
                <stop offset="100%" stop-color="#87550e"/>
              </linearGradient>
            </defs>
            <polygon points="19,42 5,11 33,11" fill="url(#v5w-clap-g)" stroke="#3d2204" stroke-width="2.4" stroke-linejoin="round"/>
            <circle cx="19" cy="11" r="7.5" fill="#fff0b5" stroke="#5c3608" stroke-width="2.2"/>
            <circle cx="19" cy="11" r="2.8" fill="#6b3e08"/>
          </svg>
          <div class="v5b-wheel-rotor" data-v5b-wheel-rotor style="transform:rotate(0deg);">
            ${wheelSvg}
          </div>
        </div>

        <div class="v5b-wheel-hint" data-v5b-wheel-hint>Drag &amp; flick the brass rim, or tap SPIN below!</div>

        <div class="v5b-wheel-outcome-plaque" data-v5b-wheel-result hidden>
          <h3>${escapeHtml(model.outcomeHeadline)}</h3>
          <p>${escapeHtml(model.outcomeDescription)}</p>
        </div>

        <button type="button" class="v5b-cta-btn" data-v5b-wheel-spin>
          ${renderUtilityIconSvg('wheel', 17)} <span>SPIN THE BRASS WHEEL</span>
        </button>

        <button type="button" class="v5b-cta-btn is-emerald" data-v5b-wheel-claim hidden>
          <span>CLAIM &amp; CONTINUE</span> ${renderUtilityIconSvg('play', 15)}
        </button>
      </div>
    `;

    const housing = this.modalLayerEl.querySelector<HTMLElement>('[data-v5b-wheel-housing]')!;
    const rotor = this.modalLayerEl.querySelector<HTMLElement>('[data-v5b-wheel-rotor]')!;
    const clapper = this.modalLayerEl.querySelector<HTMLElement>('[data-v5b-wheel-clapper]')!;
    const spinBtn = this.modalLayerEl.querySelector<HTMLButtonElement>('[data-v5b-wheel-spin]')!;
    const claimBtn = this.modalLayerEl.querySelector<HTMLButtonElement>('[data-v5b-wheel-claim]')!;
    const hintEl = this.modalLayerEl.querySelector<HTMLElement>('[data-v5b-wheel-hint]')!;
    const resultEl = this.modalLayerEl.querySelector<HTMLElement>('[data-v5b-wheel-result]')!;

    let currentDeg = 0;
    let isSpinning = false;
    let isFinished = false;
    let dragging = false;
    let lastPointerAngle = 0;
    let dragVelocityDeg = 0;
    let lastPegBucket = 0;

    const triggerClapperTick = (): void => {
      clapper.classList.add('is-tick');
      callbacks.onTick?.();
      const tid = window.setTimeout(() => clapper.classList.remove('is-tick'), 85);
      this.timerIds.push(tid);
    };

    const launchWeightedSpin = (extraTurns = 5): void => {
      if (isSpinning || isFinished) return;
      isSpinning = true;
      spinBtn.disabled = true;
      spinBtn.textContent = 'SPINNING...';
      hintEl.textContent = 'Watch the golden clapper...';
      callbacks.onSpinStart?.();

      // Target slice center under 12 o'clock pointer (0 deg)
      const desiredMod = (360 - (targetIdx * 60 + 30)) % 360;
      const startDeg = currentDeg;
      const baseTurns = Math.max(4, Math.min(8, extraTurns));
      const curMod = ((startDeg % 360) + 360) % 360;
      const deltaMod = (desiredMod - curMod + 360) % 360;
      const totalDelta = baseTurns * 360 + deltaMod;
      const endDeg = startDeg + totalDelta;

      const durationMs = 3400;
      const startTime = performance.now();

      const step = (now: number): void => {
        const t = Math.min(1, (now - startTime) / durationMs);
        // Weighted quintic ease-out for physical heavy brass flywheel inertia
        const eased = 1 - Math.pow(1 - t, 4.2);
        currentDeg = startDeg + totalDelta * eased;
        rotor.style.transform = `rotate(${currentDeg.toFixed(2)}deg)`;

        const bucket = Math.floor(currentDeg / 60);
        if (bucket !== lastPegBucket) {
          lastPegBucket = bucket;
          triggerClapperTick();
        }

        if (t < 1) {
          const id = window.requestAnimationFrame(step);
          this.rafIds.push(id);
        } else {
          currentDeg = endDeg;
          rotor.style.transform = `rotate(${endDeg.toFixed(2)}deg)`;
          isSpinning = false;
          isFinished = true;
          spinBtn.hidden = true;
          hintEl.hidden = true;
          resultEl.hidden = false;
          claimBtn.hidden = false;
        }
      };
      const id = window.requestAnimationFrame(step);
      this.rafIds.push(id);
    };

    const pointerAngle = (ev: PointerEvent): number => {
      const rect = housing.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI;
    };

    const onPointerDown = (ev: PointerEvent): void => {
      if (isSpinning || isFinished) return;
      dragging = true;
      dragVelocityDeg = 0;
      lastPointerAngle = pointerAngle(ev);
      housing.setPointerCapture?.(ev.pointerId);
    };
    const onPointerMove = (ev: PointerEvent): void => {
      if (!dragging || isSpinning || isFinished) return;
      const nextAngle = pointerAngle(ev);
      let diff = nextAngle - lastPointerAngle;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      lastPointerAngle = nextAngle;
      dragVelocityDeg = diff;
      currentDeg += diff;
      rotor.style.transform = `rotate(${currentDeg.toFixed(2)}deg)`;
      const bucket = Math.floor(currentDeg / 60);
      if (bucket !== lastPegBucket) {
        lastPegBucket = bucket;
        triggerClapperTick();
      }
    };
    const onPointerUp = (): void => {
      if (!dragging) return;
      dragging = false;
      const speedBoost = Math.abs(dragVelocityDeg) > 6 ? 6 : 5;
      launchWeightedSpin(speedBoost);
    };

    housing.addEventListener('pointerdown', onPointerDown);
    housing.addEventListener('pointermove', onPointerMove);
    housing.addEventListener('pointerup', onPointerUp);
    housing.addEventListener('pointercancel', onPointerUp);

    this.modalCleanups.push(() => {
      housing.removeEventListener('pointerdown', onPointerDown);
      housing.removeEventListener('pointermove', onPointerMove);
      housing.removeEventListener('pointerup', onPointerUp);
      housing.removeEventListener('pointercancel', onPointerUp);
    });

    spinBtn.addEventListener('click', () => launchWeightedSpin(5));
    claimBtn.addEventListener('click', () => {
      this.closeModal();
      callbacks.onSpinComplete(model.outcome);
    });
  }

  private buildPhysicalBrassWheelSvg(): string {
    const cx = 160;
    const cy = 160;
    const r = 136;

    const defs: string[] = [
      `<linearGradient id="v5w-bezel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff4bd"/>
        <stop offset="28%" stop-color="#dfaa3f"/>
        <stop offset="58%" stop-color="#7c5012"/>
        <stop offset="85%" stop-color="#f7d577"/>
        <stop offset="100%" stop-color="#613b0a"/>
      </linearGradient>`,
    ];

    const wedges = WHEEL_SLICES_V5.map((slice, i) => {
      const startDeg = -90 + i * 60;
      const endDeg = startDeg + 60;
      const midDeg = startDeg + 30;
      const a1 = (startDeg * Math.PI) / 180;
      const a2 = (endDeg * Math.PI) / 180;
      const am = (midDeg * Math.PI) / 180;

      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2);
      const y2 = cy + r * Math.sin(a2);
      const tx = cx + r * 0.62 * Math.cos(am);
      const ty = cy + r * 0.62 * Math.sin(am);
      // Keep bottom-half labels upright and effortlessly legible
      const rawRot = midDeg + 90;
      const labelRot = midDeg > 15 && midDeg < 165 ? rawRot + 180 : rawRot;

      defs.push(`
        <linearGradient id="v5w-sl-${i}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${slice.topFill}"/>
          <stop offset="100%" stop-color="${slice.botFill}"/>
        </linearGradient>
      `);

      const d = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
      return `
        <path d="${d}" fill="url(#v5w-sl-${i})" stroke="#4d3108" stroke-width="2.6"/>
        <text
          x="${tx.toFixed(1)}"
          y="${ty.toFixed(1)}"
          fill="${slice.inkHex}"
          font-family="Cinzel, Georgia, serif"
          font-size="11.5"
          font-weight="800"
          text-anchor="middle"
          dominant-baseline="middle"
          transform="rotate(${labelRot}, ${tx.toFixed(1)}, ${ty.toFixed(1)})"
        >${escapeHtml(slice.shortLabel)}</text>
      `;
    }).join('');

    const bulbs = Array.from({ length: 18 }, (_, idx) => {
      const ang = (idx * 20 * Math.PI) / 180;
      const bx = cx + 148 * Math.cos(ang);
      const by = cy + 148 * Math.sin(ang);
      const isPeg = idx % 3 === 0;
      return `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${isPeg ? 4.4 : 2.8}" fill="${isPeg ? '#fff8d4' : '#ffe082'}" stroke="#6b420b" stroke-width="1"/>`;
    }).join('');

    return `
      <svg viewBox="0 0 320 320" width="100%" height="100%" role="img" aria-label="6-Slice Physical Brass Stage Wheel">
        <defs>${defs.join('')}</defs>
        <circle cx="160" cy="160" r="158" fill="url(#v5w-bezel)" stroke="#4d2e07" stroke-width="2"/>
        <circle cx="160" cy="160" r="141" fill="#101f42" stroke="#ffe79e" stroke-width="2"/>
        ${wedges}
        ${bulbs}
        <circle cx="160" cy="160" r="30" fill="url(#v5w-bezel)" stroke="#4f3007" stroke-width="2.4"/>
        <circle cx="160" cy="160" r="17" fill="#12244d" stroke="#fff0b5" stroke-width="2"/>
        <polygon points="160,148 163.5,156.5 172,157.5 165.5,163 167.5,171.5 160,167 152.5,171.5 154.5,163 148,157.5 156.5,156.5" fill="#ffe285"/>
      </svg>
    `;
  }

  // ==========================================================================
  // 10. MODAL B: INTERACTIVE ROTARY BRASS POWER-PLAY WAGER DIAL
  // ==========================================================================

  public openPowerPlayDialModal(
    model: PowerPlayDialModalModelV5,
    callbacks: PowerPlayDialModalCallbacksV5,
  ): void {
    this.closeModal();
    const wedge = WEDGE_CATALOG_V4[model.column.wedgeId];
    const minW = Math.max(50, Math.round(model.minWager));
    const maxW = Math.max(minW, Math.round(model.maxWager));
    const step = maxW - minW >= 500 ? 50 : 25;
    let wager = Math.min(maxW, Math.max(minW, Math.round((minW + maxW) / 2 / step) * step));

    // Build dial tick marks along the 180-deg upper semicircle
    const tickMarks = Array.from({ length: 19 }, (_, idx) => {
      const deg = 180 + idx * 10;
      const rad = (deg * Math.PI) / 180;
      const r1 = idx % 3 === 0 ? 96 : 102;
      const r2 = 112;
      const x1 = 140 + r1 * Math.cos(rad);
      const y1 = 136 + r1 * Math.sin(rad);
      const x2 = 140 + r2 * Math.cos(rad);
      const y2 = 136 + r2 * Math.sin(rad);
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${idx % 3 === 0 ? '#ffe599' : 'rgba(255,232,165,0.45)'}" stroke-width="${idx % 3 === 0 ? 2.4 : 1.3}" stroke-linecap="round"/>`;
    }).join('');

    this.modalLayerEl.innerHTML = `
      <div class="v5b-dial-console" role="dialog" aria-modal="true" aria-label="Power Play Brass Wager Dial">
        <div class="v5b-dial-inner">
          <span class="v5b-marquee-ribbon">${renderUtilityIconSvg('star', 13)} POWER PLAY &middot; DAILY DOUBLE</span>
          <h2 class="v5b-modal-headline">SET THE BRASS WAGER DIAL</h2>
          <div style="font-size:13px;color:#d6e4ff;line-height:1.35;">
            Category: <strong style="color:${wedge.accentHex}">${escapeHtml(model.column.wittyTitle)}</strong> (${escapeHtml(model.column.topicSubtitle)})
            ${model.hostLine ? `<div style="font-style:italic;color:#ffe6a3;margin-top:3px;">"${escapeHtml(model.hostLine)}"</div>` : ''}
          </div>

          <div class="v5b-dial-gauge-wrap" data-v5b-dial-gauge title="Drag along the brass gauge to set your stake">
            <svg viewBox="0 0 280 154" width="100%" height="auto" role="img" aria-label="Brass Power Play Wager Gauge">
              <defs>
                <linearGradient id="v5d-arc-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#34d993"/>
                  <stop offset="52%" stop-color="#f7c844"/>
                  <stop offset="100%" stop-color="#f24455"/>
                </linearGradient>
                <linearGradient id="v5d-brass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#fff4bf"/>
                  <stop offset="48%" stop-color="#d49e35"/>
                  <stop offset="100%" stop-color="#784e10"/>
                </linearGradient>
              </defs>
              <!-- Outer brass housing arc -->
              <path d="M 20 136 A 120 120 0 0 1 260 136" fill="none" stroke="url(#v5d-brass)" stroke-width="14" stroke-linecap="round"/>
              <path d="M 28 136 A 112 112 0 0 1 252 136" fill="#08132b" stroke="#5c3b0c" stroke-width="2"/>
              <!-- Background & active risk meter track -->
              <path d="M 46 136 A 94 94 0 0 1 234 136" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="10" stroke-linecap="round"/>
              <path data-v5b-dial-arc d="M 46 136 A 94 94 0 0 1 234 136" fill="none" stroke="url(#v5d-arc-grad)" stroke-width="10" stroke-linecap="round" stroke-dasharray="295.3" stroke-dashoffset="147.6"/>
              ${tickMarks}
              <!-- Rotating Brass Needle -->
              <g data-v5b-dial-needle transform="rotate(0 140 136)">
                <polygon points="140,34 145,136 135,136" fill="url(#v5d-brass)" stroke="#3d2204" stroke-width="1.5"/>
                <circle cx="140" cy="136" r="13" fill="url(#v5d-brass)" stroke="#4f2f06" stroke-width="2"/>
                <circle cx="140" cy="136" r="5" fill="#fff4c4"/>
              </g>
              <text x="36" y="151" fill="#bcd0f2" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="700" text-anchor="middle">${minW.toLocaleString('en-US')}</text>
              <text x="244" y="151" fill="#ffe182" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="700" text-anchor="middle">${maxW.toLocaleString('en-US')}</text>
            </svg>
          </div>

          <div class="v5b-dial-readout-row">
            <button type="button" class="v5b-knurled-step-btn" data-v5b-step="-1" aria-label="Decrease wager">&minus;</button>
            <div class="v5b-dial-digital-plate" data-v5b-wager-val>${wager.toLocaleString('en-US')} PTS</div>
            <button type="button" class="v5b-knurled-step-btn" data-v5b-step="1" aria-label="Increase wager">+</button>
          </div>

          <div class="v5b-chip-row">
            <button type="button" class="v5b-stake-chip" data-v5b-pct="0.25">25%</button>
            <button type="button" class="v5b-stake-chip" data-v5b-pct="0.5">50%</button>
            <button type="button" class="v5b-stake-chip" data-v5b-pct="0.75">75%</button>
            <button type="button" class="v5b-stake-chip is-allin" data-v5b-pct="1">ALL-IN</button>
          </div>

          <div class="v5b-wager-stakes-split">
            <div class="v5b-stake-plaque">
              <div class="v5b-stake-plaque-lbl">If Right</div>
              <div class="v5b-stake-plaque-val" data-v5b-win-val>+${wager.toLocaleString('en-US')}</div>
            </div>
            <div class="v5b-stake-plaque is-risk">
              <div class="v5b-stake-plaque-lbl">If Wrong</div>
              <div class="v5b-stake-plaque-val" data-v5b-miss-val>-${wager.toLocaleString('en-US')}</div>
            </div>
          </div>

          <button type="button" class="v5b-cta-btn" style="width:100%;" data-v5b-lock-wager>
            <span>LOCK WAGER &amp; SEE CLUE</span> ${renderUtilityIconSvg('play', 15)}
          </button>
        </div>
      </div>
    `;

    const gaugeEl = this.modalLayerEl.querySelector<HTMLElement>('[data-v5b-dial-gauge]')!;
    const arcEl = this.modalLayerEl.querySelector<SVGPathElement>('[data-v5b-dial-arc]')!;
    const needleEl = this.modalLayerEl.querySelector<SVGGElement>('[data-v5b-dial-needle]')!;
    const valEl = this.modalLayerEl.querySelector<HTMLElement>('[data-v5b-wager-val]')!;
    const winEl = this.modalLayerEl.querySelector<HTMLElement>('[data-v5b-win-val]')!;
    const missEl = this.modalLayerEl.querySelector<HTMLElement>('[data-v5b-miss-val]')!;

    const ARC_LEN = 295.3;

    const syncDial = (nextVal: number): void => {
      wager = Math.max(minW, Math.min(maxW, Math.round(nextVal)));
      const ratio = maxW > minW ? (wager - minW) / (maxW - minW) : 1;
      const needleAngle = -90 + ratio * 180;
      needleEl.setAttribute('transform', `rotate(${needleAngle.toFixed(1)} 140 136)`);
      arcEl.setAttribute('stroke-dashoffset', (ARC_LEN * (1 - ratio)).toFixed(1));
      valEl.textContent = `${wager.toLocaleString('en-US')} PTS`;
      winEl.textContent = `+${wager.toLocaleString('en-US')}`;
      missEl.textContent = `-${wager.toLocaleString('en-US')}`;
      callbacks.onWagerChange?.(wager);
    };

    syncDial(wager);

    let draggingDial = false;
    const applyPointerToDial = (ev: PointerEvent): void => {
      const rect = gaugeEl.getBoundingClientRect();
      const pivotX = rect.left + rect.width / 2;
      const pivotY = rect.top + rect.height * (136 / 154);
      const dx = ev.clientX - pivotX;
      const dy = ev.clientY - pivotY;
      let deg = (Math.atan2(dy, dx) * 180) / Math.PI; // -180 (left) .. 0 (right)
      if (deg > 0) deg = dx < 0 ? -180 : 0;
      const ratio = Math.max(0, Math.min(1, (deg + 180) / 180));
      const raw = minW + (maxW - minW) * ratio;
      syncDial(Math.round(raw / step) * step);
    };

    const onDown = (ev: PointerEvent): void => {
      draggingDial = true;
      gaugeEl.setPointerCapture?.(ev.pointerId);
      applyPointerToDial(ev);
    };
    const onMove = (ev: PointerEvent): void => {
      if (!draggingDial) return;
      applyPointerToDial(ev);
    };
    const onUp = (): void => {
      draggingDial = false;
    };

    gaugeEl.addEventListener('pointerdown', onDown);
    gaugeEl.addEventListener('pointermove', onMove);
    gaugeEl.addEventListener('pointerup', onUp);
    gaugeEl.addEventListener('pointercancel', onUp);
    this.modalCleanups.push(() => {
      gaugeEl.removeEventListener('pointerdown', onDown);
      gaugeEl.removeEventListener('pointermove', onMove);
      gaugeEl.removeEventListener('pointerup', onUp);
      gaugeEl.removeEventListener('pointercancel', onUp);
    });

    this.modalLayerEl.querySelectorAll<HTMLButtonElement>('[data-v5b-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = Number(btn.dataset.v5bStep || 0);
        syncDial(wager + dir * step);
      });
    });

    this.modalLayerEl.querySelectorAll<HTMLButtonElement>('[data-v5b-pct]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pct = Number(btn.dataset.v5bPct || 0.5);
        const computed = pct >= 1 ? maxW : minW + (maxW - minW) * pct;
        syncDial(Math.round(computed / step) * step);
      });
    });

    this.modalLayerEl.querySelector('[data-v5b-lock-wager]')?.addEventListener('click', () => {
      this.closeModal();
      callbacks.onLockWager(wager);
    });
  }

  // ==========================================================================
  // 11. MODAL / SCREEN C: POST-MATCH CALL-SHEET & NEWSPAPER CURTAIN CALL
  // ==========================================================================

  public renderPostMatchCurtainCall(
    model: PostMatchCurtainCallModelV5,
    callbacks: PostMatchCurtainCallCallbacksV5,
  ): void {
    this.ensureAttached();
    this.clearAsyncHooks();
    this.closeModal();
    this.renderCounter += 1;

    const uid = `cc${this.renderCounter}`;
    const tier = clampTier(model.episode.tierNumber);
    const venueBgUrl = V5_VENUE_STAGES[tier];
    const maxBustUrl = resolveMaxCutoutUrl(model.didWin ? 'hype' : 'wince');
    const rivalBustUrl = resolveChallengerCutoutUrl(model.challenger);
    const leadHeadline =
      model.headlines[0] ||
      (model.didWin
        ? `SENSATION AT ${model.episode.venueName.toUpperCase()}!`
        : `DRAMATIC SHOWDOWN ROCKS ${model.episode.venueName.toUpperCase()}!`);
    const secondaryHeadlines = model.headlines.slice(1);

    const starsHtml = [1, 2, 3]
      .map((i) =>
        `<span style="color:${i <= model.starsEarned ? '#c98810' : 'rgba(64,42,18,0.22)'}">${renderUtilityIconSvg(i <= model.starsEarned ? 'star' : 'star_dim', 20)}</span>`,
      )
      .join('');

    const shareText = [
      `WORLD'S SMARTEST — ${model.episode.venueName} (${model.episode.title})`,
      `${model.didWin ? 'STAGE VICTORY' : 'CURTAIN CALL'} | Score: ${model.playerScore.toLocaleString('en-US')} PTS${
        model.hasActiveRival && model.challenger
          ? ` vs ${model.challenger.name} (${model.rivalScore.toLocaleString('en-US')})`
          : ` (Target ${model.soloTargetScore.toLocaleString('en-US')})`
      }`,
      `Accuracy: ${model.accuracyPct}% | Best Streak: ${model.bestStreak} | Jewels: ${model.earnedWedges.length}/6`,
      `World Audience: ${formatAudienceCompact(model.totalAudienceNow)}`,
    ].join('\n');

    this.stageHostEl.innerHTML = `
      <div class="v5b-stage-bg" style="background-image:url('${escapeHtml(venueBgUrl)}')" aria-hidden="true"></div>
      <div class="v5b-stage-canvas" style="justify-content:center;padding-top:12px;padding-bottom:18px;">
        <div class="v5b-curtain-spread">
          <!-- Left: Broadsheet Newspaper Front Page -->
          <article class="v5b-broadsheet-paper" aria-label="Post-Match Newspaper Edition">
            <div class="v5b-paper-masthead">
              <span class="v5b-paper-name">${escapeHtml(model.newspaperMasthead || 'THE WORLD BROADCAST CHRONICLE')}</span>
              <span class="v5b-paper-edition">FINAL EDITION &middot; TIER ${tier}</span>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
              <span class="v5b-verdict-stamp ${model.didWin ? '' : 'is-loss'}">
                ${renderUtilityIconSvg(model.didWin ? 'check' : 'shield', 13)}
                <span>${model.didWin ? 'STAGE VICTORY' : 'CURTAIN CALL · REDEMPTION OPEN'}</span>
              </span>
              <div aria-label="${model.starsEarned} of 3 stars">${starsHtml}</div>
            </div>

            <h2 class="v5b-paper-headline">${escapeHtml(leadHeadline)}</h2>
            <div style="font-size:12.5px;color:#523c22;font-weight:600;">
              ${escapeHtml(model.episode.venueName)} &mdash; ${escapeHtml(model.episode.title)}
            </div>

            ${
              model.dareCompleted && model.dareDescription
                ? `<div style="margin-top:8px;padding:6px 10px;border:1.5px solid #0e7040;background:#e6faef;color:#0a4d2c;border-radius:6px;font-size:12px;font-weight:700;">
                     SPONSOR DARE CLEARED! ${escapeHtml(model.dareDescription)}${model.dareBonusUsd ? ` (+${formatUsdCompact(model.dareBonusUsd)})` : ''}
                   </div>`
                : ''
            }

            ${
              !model.didWin && model.redemptionNote
                ? `<div style="margin-top:8px;padding:6px 10px;border:1.5px dashed #8f3c12;background:#fff3e0;color:#5e2508;border-radius:6px;font-size:12px;font-weight:700;">
                     ${escapeHtml(model.redemptionNote)}
                   </div>`
                : ''
            }

            <div class="v5b-paper-quotes">
              <div class="v5b-paper-quote-row">
                <div class="v5b-paper-bust"><img src="${escapeHtml(maxBustUrl)}" alt="Max Sterling" /></div>
                <div style="font-size:12.5px;line-height:1.35;">
                  <strong style="font-family:Cinzel,Georgia,serif;color:#734206;">MAX STERLING:</strong>
                  "${escapeHtml(model.hostClosingQuip)}"
                </div>
              </div>
              ${
                model.challenger && model.rivalClosingLine
                  ? `<div class="v5b-paper-quote-row">
                       <div class="v5b-paper-bust">${rivalBustUrl ? `<img src="${escapeHtml(rivalBustUrl)}" alt="${escapeHtml(model.challenger.name)}" />` : ''}</div>
                       <div style="font-size:12.5px;line-height:1.35;">
                         <strong style="font-family:Cinzel,Georgia,serif;color:#8c162b;">${escapeHtml(model.challenger.name.toUpperCase())}:</strong>
                         "${escapeHtml(model.rivalClosingLine)}"
                       </div>
                     </div>`
                  : ''
              }
            </div>

            ${
              secondaryHeadlines.length > 0
                ? `<div class="v5b-wire-list">
                     <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#735634;font-weight:800;">WIRE BULLETINS</div>
                     ${secondaryHeadlines.map((h) => `<div>&bull; ${escapeHtml(h)}</div>`).join('')}
                   </div>`
                : ''
            }
          </article>

          <!-- Right: Pinned Studio Production Call-Sheet -->
          <aside class="v5b-callsheet-card" aria-label="Studio Production Call Sheet">
            <div class="v5b-callsheet-clip" aria-hidden="true"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
              <div>
                <div style="font-family:JetBrains Mono,monospace;font-size:10px;font-weight:800;letter-spacing:0.1em;color:#755326;">STUDIO CALL-SHEET // OFFICIAL TALLY</div>
                <div style="font-family:Cinzel,Georgia,serif;font-size:16px;font-weight:800;color:#1f150a;">CURTAIN CALL LEDGER</div>
              </div>
              ${renderJewelMedallionSvg(model.earnedWedges, uid, 56)}
            </div>

            <div class="v5b-callsheet-tally">
              <div class="v5b-tally-box ${model.didWin ? 'is-win' : ''}">
                <div class="v5b-tally-label">Your Final</div>
                <div class="v5b-tally-num">${model.playerScore.toLocaleString('en-US')}</div>
                <div style="font-size:11px;color:#5c4426;font-weight:700;">${model.accuracyPct}% Acc &middot; ${model.bestStreak} Streak</div>
              </div>
              <div class="v5b-tally-box ${!model.didWin ? 'is-win' : ''}">
                <div class="v5b-tally-label">${model.hasActiveRival && model.challenger ? escapeHtml(model.challenger.name) : 'House Target'}</div>
                <div class="v5b-tally-num" style="color:${model.hasActiveRival ? '#8c1428' : '#1f150a'};">
                  ${(model.hasActiveRival ? model.rivalScore : model.soloTargetScore).toLocaleString('en-US')}
                </div>
                <div style="font-size:11px;color:#5c4426;font-weight:700;">${model.earnedWedges.length}/6 Jewel Wedges</div>
              </div>
            </div>

            <div class="v5b-callsheet-stats">
              <div class="v5b-cs-stat">
                <div class="v5b-cs-stat-k">Audience</div>
                <div class="v5b-cs-stat-v">${formatAudienceCompact(model.totalAudienceNow)}</div>
                ${model.audienceDelta > 0 ? `<div style="font-size:10px;color:#7ef2b6;font-weight:700;">+${formatAudienceCompact(model.audienceDelta)}</div>` : ''}
              </div>
              <div class="v5b-cs-stat">
                <div class="v5b-cs-stat-k">Purse Won</div>
                <div class="v5b-cs-stat-v">${model.prizeEarnedUsd > 0 ? `+${formatUsdCompact(model.prizeEarnedUsd)}` : '$0'}</div>
              </div>
              <div class="v5b-cs-stat">
                <div class="v5b-cs-stat-k">Jewels</div>
                <div class="v5b-cs-stat-v">${model.earnedWedges.length} / 6</div>
              </div>
            </div>

            <div style="margin-top:8px;">
              <button type="button" class="v5b-brass-pill-btn" style="width:100%;justify-content:center;" data-v5b-share-card>
                ${renderUtilityIconSvg('share', 14)} <span data-v5b-share-label>Copy Broadcast Share Ticket</span>
              </button>
            </div>

            <div class="v5b-curtain-actions">
              <button type="button" class="v5b-cta-btn is-secondary" style="min-height:38px;padding:7px 14px;font-size:11.5px;" data-v5b-cc="home">Green Room</button>
              <button type="button" class="v5b-cta-btn is-secondary" style="min-height:38px;padding:7px 14px;font-size:11.5px;" data-v5b-cc="map">Tour Trunk</button>
              <button type="button" class="v5b-cta-btn is-secondary" style="min-height:38px;padding:7px 14px;font-size:11.5px;" data-v5b-cc="rematch">Rematch</button>
              ${
                model.didWin && model.hasNextEpisode && callbacks.onNextEpisode
                  ? `<button type="button" class="v5b-cta-btn" style="flex:1 1 150px;" data-v5b-cc="next">
                       <span>${escapeHtml(model.nextStageLabel || 'NEXT STAGE')}</span> ${renderUtilityIconSvg('play', 14)}
                     </button>`
                  : ''
              }
            </div>
          </aside>
        </div>
      </div>
    `;

    const shareBtn = this.stageHostEl.querySelector<HTMLButtonElement>('[data-v5b-share-card]');
    const shareLabel = this.stageHostEl.querySelector<HTMLElement>('[data-v5b-share-label]');
    shareBtn?.addEventListener('click', () => {
      const ack = (): void => {
        if (shareLabel) shareLabel.textContent = 'Ticket Copied to Clipboard!';
        const tid = window.setTimeout(() => {
          if (shareLabel) shareLabel.textContent = 'Copy Broadcast Share Ticket';
        }, 2000);
        this.timerIds.push(tid);
      };
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        void navigator.clipboard.writeText(shareText).then(ack).catch(ack);
      } else {
        ack();
      }
    });

    this.stageHostEl
      .querySelector('[data-v5b-cc="home"]')
      ?.addEventListener('click', () => callbacks.onBackHome());
    this.stageHostEl
      .querySelector('[data-v5b-cc="map"]')
      ?.addEventListener('click', () => callbacks.onOpenWorldTourMap());
    this.stageHostEl
      .querySelector('[data-v5b-cc="rematch"]')
      ?.addEventListener('click', () => callbacks.onRematch());
    this.stageHostEl
      .querySelector('[data-v5b-cc="next"]')
      ?.addEventListener('click', () => callbacks.onNextEpisode?.());
  }

  // ==========================================================================
  // 12. OXFORD PICK & BAN CATEGORY DRAFT MODAL + QUICK RULES MODAL
  // ==========================================================================

  public openCategoryDraftModal(
    model: CategoryDraftModalModelV5,
    callbacks: CategoryDraftModalCallbacksV5,
  ): void {
    this.closeModal();
    const rivalCutout = resolveChallengerCutoutUrl(model.challenger);

    this.modalLayerEl.innerHTML = `
      <div class="v5b-dial-console" style="max-width:620px;" role="dialog" aria-modal="true" aria-label="Oxford Pick and Ban Category Draft">
        <div class="v5b-dial-inner" style="text-align:left;align-items:stretch;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <div>
              <span class="v5b-marquee-ribbon">${renderUtilityIconSvg('star', 13)} OXFORD STAGE DRAFT</span>
              <h2 class="v5b-modal-headline" style="font-size:20px;margin-top:6px;">${escapeHtml(model.phaseTitle)}</h2>
            </div>
            ${
              rivalCutout
                ? `<div class="v5b-paper-bust" style="width:54px;height:54px;"><img src="${escapeHtml(rivalCutout)}" alt="${escapeHtml(model.challenger.name)}" /></div>`
                : ''
            }
          </div>
          <div style="font-size:13px;color:#d6e4ff;line-height:1.35;">${escapeHtml(model.instruction)}</div>

          <div class="v5b-draft-grid">
            ${model.pool
              .map((item) => {
                const wedge = WEDGE_CATALOG_V4[item.wedgeId];
                const cls =
                  item.state === 'PLAYER_PICK' || item.state === 'RIVAL_PICK'
                    ? 'is-picked'
                    : item.state === 'PLAYER_BAN' || item.state === 'RIVAL_BAN'
                      ? 'is-banned'
                      : '';
                const badge =
                  item.state === 'PLAYER_PICK'
                    ? 'YOUR PICK'
                    : item.state === 'RIVAL_PICK'
                      ? 'RIVAL PICK'
                      : item.state === 'PLAYER_BAN'
                        ? 'BANNED'
                        : item.state === 'RIVAL_BAN'
                          ? 'RIVAL BAN'
                          : 'OPEN';
                return `
                  <button
                    type="button"
                    class="v5b-draft-plaque ${cls}"
                    data-v5b-draft-id="${escapeHtml(item.colId)}"
                    ${item.state !== 'AVAILABLE' ? 'disabled' : ''}
                  >
                    <div style="min-width:0;">
                      <div style="font-family:Cinzel,Georgia,serif;font-size:13px;font-weight:800;">${escapeHtml(item.wittyTitle)}</div>
                      <div style="font-size:11px;font-weight:700;color:${wedge.accentHex};">${escapeHtml(item.topicSubtitle)}</div>
                    </div>
                    <span class="v5b-brass-badge" style="min-height:22px;padding:2px 7px;font-size:9.5px;">${badge}</span>
                  </button>
                `;
              })
              .join('')}
          </div>

          <button type="button" class="v5b-cta-btn" data-v5b-draft-confirm ${model.canConfirm ? '' : 'disabled'}>
            <span>LOCK STAGE BOARD</span> ${renderUtilityIconSvg('play', 15)}
          </button>
        </div>
      </div>
    `;

    this.modalLayerEl.querySelectorAll<HTMLButtonElement>('[data-v5b-draft-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const colId = btn.dataset.v5bDraftId;
        if (colId) callbacks.onSelectDraftItem(colId);
      });
    });
    this.modalLayerEl.querySelector('[data-v5b-draft-confirm]')?.addEventListener('click', () => {
      this.closeModal();
      callbacks.onConfirmDraft();
    });
  }

  public openHowToPlayModal(onClose?: () => void): void {
    this.closeModal();
    this.modalLayerEl.innerHTML = `
      <div class="v5b-dial-console" style="max-width:540px;" role="dialog" aria-modal="true" aria-label="Stage Board Rules">
        <div class="v5b-dial-inner" style="text-align:left;align-items:stretch;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span class="v5b-marquee-ribbon">${renderUtilityIconSvg('help', 13)} BROADCAST RULES</span>
            <button type="button" class="v5b-brass-pill-btn" data-v5b-close-howto>Close</button>
          </div>
          <h2 class="v5b-modal-headline" style="font-size:21px;">MASTER THE LIVING STAGE</h2>
          <div style="display:grid;gap:8px;font-size:13px;line-height:1.4;color:#e6efff;">
            <div><strong style="color:#ffe285;">1. Shatter Iron Chains:</strong> Clear any open octagon adjacent to a chained vault tile to blast its padlock open and unlock 400 &amp; 800-point jackpots.</div>
            <div><strong style="color:#ffe285;">2. Light the 6-Wedge Jewel Medallion:</strong> Win Crown Wedge tiles or sweep an entire row/column (+300 PTS) to illuminate emerald, ruby, sapphire, amber, violet &amp; cyan jewels.</div>
            <div><strong style="color:#ffe285;">3. Hit SCREW RIVAL!:</strong> Smash the red dome buzzer to force any open tile onto your Challenger! If they choke, you steal 100% of its points — if they nail it, they bank it!</div>
            <div><strong style="color:#ffe285;">4. Podium Lucky Charms:</strong> Tap any of your 3 brass podium cups to inspect passive perks earned from rivals, salons, and sponsor dares.</div>
          </div>
          <button type="button" class="v5b-cta-btn" style="margin-top:6px;" data-v5b-close-howto-cta>BACK TO THE STAGE</button>
        </div>
      </div>
    `;

    const dismiss = (): void => {
      this.closeModal();
      onClose?.();
    };
    this.modalLayerEl.querySelector('[data-v5b-close-howto]')?.addEventListener('click', dismiss);
    this.modalLayerEl.querySelector('[data-v5b-close-howto-cta]')?.addEventListener('click', dismiss);
  }
}
