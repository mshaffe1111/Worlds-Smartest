// ============================================================================
// WORLD'S SMARTEST v6.0 — Master Showtime Director & State Machine
// Dependency-Injected Spine Across All 11 v6.0 Subsystems
// States: LOBBY_HUB <-> TROPHY_VAULT <-> OPTIONS_CONSOLE <-> BACKSTAGE_TRUNK
//         <-> STAGE_CURTAIN_INTRO -> BOARD_TURN -> TWIST_MUTATION ->
//         TOY_ENCOUNTER -> [TRAPDOOR_GAMBIT on miss!] -> EPISODE_CEREMONY
// Features: Universal Top Stage-Bar + 1-Tap Fullscreen · Zero-Scroll Shell ·
//           Deterministic QA Deep-Link Harness (?v6view=...&stage=&board=&toy=)
// ============================================================================

import type {
  BoardDefinitionV6,
  BoardFamilyIdV6,
  BoardNodeV6,
  BoardRuntimeStateV6,
  BoardTwistMutationIdV6,
  BroadcastOptionsStateV6,
  CalibratedClueV6,
  CameraStageZoneV6,
  FoilTrickCardV6,
  FoleySfxIdV6,
  HonorAwardDefinitionV6,
  MatchEventMemoryV6,
  ReactiveDialogueBeatV6,
  StageAtmosphereThemeV6,
  StageWorldIdV6,
  SymphonyTrackIdV6,
  ToyDefinitionV6,
  ToyFamilyIdV6,
  ToyResolutionV6,
} from '../contracts_v6.ts';
import {
  CareerSaveStoreV6,
  STAGE_WORLD_CATALOG_V6,
  getEpisodeBlueprintV6,
  getStageMetaByIdV6,
  getStageMetaByNumberV6,
  type CareerStateV6,
  type EpisodeBlueprintV6,
  type StageWorldMetaV6,
} from './CareerSaveStoreV6.ts';
import {
  RivalStageAIV6,
  type RivalTelegraphedIntentV6,
  type RivalTurnExecutionResultV6,
} from './RivalStageAIV6.ts';

// ----------------------------------------------------------------------------
// Core State Machine & Mode Types
// ----------------------------------------------------------------------------
export type ShowtimePhaseV6 =
  | 'LOBBY_HUB'
  | 'TROPHY_VAULT'
  | 'OPTIONS_CONSOLE'
  | 'BACKSTAGE_TRUNK'
  | 'STAGE_CURTAIN_INTRO'
  | 'BOARD_TURN'
  | 'TWIST_MUTATION'
  | 'TOY_ENCOUNTER'
  | 'TRAPDOOR_GAMBIT'
  | 'EPISODE_CEREMONY';

export type ShowtimePlayModeV6 = 'CAMPAIGN' | 'QUICK_SHOW' | 'TRAPDOOR_GAUNTLET';

export type DeepLinkViewKeyV6 =
  | 'lobby'
  | 'board'
  | 'toy'
  | 'trapdoor'
  | 'trunk'
  | 'trophies'
  | 'options'
  | 'ceremony';

export interface ShowtimeDeepLinkParamsV6 {
  view: DeepLinkViewKeyV6 | null;
  stageNumber: number | null; // 1 .. 10
  boardNumber: number | null; // 1 .. 100
  toyNumber: number | null; // 1 .. 100
  episodeNumber: number | null; // 1 .. 20
  twistId: BoardTwistMutationIdV6 | null;
  ceremonyOutcome: 'win' | 'loss' | null;
}

export interface DisposableHandleV6 {
  dispose(): void;
}

// ----------------------------------------------------------------------------
// Dependency-Injection Adapter Interfaces (Zero-Conflict Wiring for src/main.ts)
// ----------------------------------------------------------------------------
export interface StageEngineAdapterV6 {
  loadStageWorld(stageId: StageWorldIdV6): void | Promise<void>;
  applyOptions?(options: BroadcastOptionsStateV6): void;
  setTrapdoorOpen?(open: boolean): void;
  getStageTheme?(stageId: StageWorldIdV6): StageAtmosphereThemeV6 | undefined;
  triggerSparkBurst?(kind?: 'GOLD' | 'RUBY' | 'ELECTRIC'): void;
  dispose?(): void;
}

export interface CameraDirectorAdapterV6 {
  transitionTo(zone: CameraStageZoneV6, instant?: boolean): void;
  setMotionMode?(mode: BroadcastOptionsStateV6['cameraMotion']): void;
}

export interface AudioEngineAdapterV6 {
  playSymphony(trackId: SymphonyTrackIdV6): void;
  playFoley(sfxId: FoleySfxIdV6): void;
  applyOptions(options: BroadcastOptionsStateV6): void;
  duckForVoice?(durationMs?: number): void;
  getChannelLevels?(): { left: number; right: number; peak: number };
  dispose?(): void;
}

export interface QuestionDrawRequestV6 {
  stageNumber: number;
  difficultyTarget: number;
  difficultyBand: [number, number];
  domainId?: number;
  toyFamily?: ToyFamilyIdV6;
  toyId?: string;
}

export interface QuestionEngineAdapterV6 {
  drawCalibratedClue(req: QuestionDrawRequestV6): Promise<CalibratedClueV6> | CalibratedClueV6;
  getSeenCount?(): number;
  getTotalPoolSize?(): number;
  wipeSeenMemory?(): Promise<void> | void;
}

export interface BoardMountHandlersV6 {
  onSelectNode: (nodeId: string) => void;
  onUseFoilCard: (cardId: string, targetNodeId?: string) => void;
  onRotateRing?: (ringIndex: number, deltaDeg: number) => void;
}

export interface BoardManagerAdapterV6 {
  getAllBoards(): readonly BoardDefinitionV6[];
  getBoardByNumber?(boardNumber: number): BoardDefinitionV6 | undefined;
  createRuntimeState?(
    def: BoardDefinitionV6,
    rivalName: string,
    maxTurns: number,
  ): BoardRuntimeStateV6;
  mountBoard(
    container: HTMLElement,
    state: BoardRuntimeStateV6,
    stageTheme: StageAtmosphereThemeV6,
    rivalIntent: RivalTelegraphedIntentV6 | null,
    heldFoils: readonly FoilTrickCardV6[],
    handlers: BoardMountHandlersV6,
  ): DisposableHandleV6 | void;
}

export interface TwistDirectorAdapterV6 {
  pickHalftimeTwist(board: BoardRuntimeStateV6, stageId: StageWorldIdV6): BoardTwistMutationIdV6;
  applyTwistMutation(board: BoardRuntimeStateV6, twistId: BoardTwistMutationIdV6): string;
  applyFoilEffect?(
    board: BoardRuntimeStateV6,
    card: FoilTrickCardV6,
    targetNodeId?: string,
  ): { applied: boolean; message: string; frozeRival?: boolean; screwedRival?: boolean; doubleMult?: boolean };
}

export interface ToyMountOptionsV6 {
  stageTheme: StageAtmosphereThemeV6;
  options: BroadcastOptionsStateV6;
  heldFoils: readonly FoilTrickCardV6[];
  onPlayFoil?: (cardId: string) => void;
  onPlayFoley?: (sfxId: FoleySfxIdV6) => void;
  onResolve: (resolution: ToyResolutionV6) => void;
}

export interface ToyManagerAdapterV6 {
  getAllToys(): readonly ToyDefinitionV6[];
  getToyByNumber?(toyNumber: number): ToyDefinitionV6 | undefined;
  mountToy(
    container: HTMLElement,
    toy: ToyDefinitionV6,
    clue: CalibratedClueV6,
    opts: ToyMountOptionsV6,
  ): DisposableHandleV6 | void;
}

export interface TrapdoorResultV6 {
  trapdoorId: string;
  survived: boolean;
  secondsRemaining: number;
  summaryText?: string;
}

export interface TrapdoorEngineAdapterV6 {
  getTrapdoorIds?(): readonly string[];
  mountTrapdoor(
    container: HTMLElement,
    opts: {
      trapdoorId: string;
      stageTheme: StageAtmosphereThemeV6;
      options: BroadcastOptionsStateV6;
      onPlayFoley?: (sfxId: FoleySfxIdV6) => void;
      onComplete: (result: TrapdoorResultV6) => void;
    },
  ): DisposableHandleV6 | void;
}

export interface RelicCascadeResultV6 {
  totalChips: number;
  finalMult: number;
  cashEarned: number;
  triggeredRelicIds: string[];
}

export interface PropTrunkAdapterV6 {
  evaluateRelicCascade?(params: {
    baseChips: number;
    baseMult: number;
    equippedRelicIds: readonly string[];
    clueDomainId: number;
    streakCount: number;
    stageId: StageWorldIdV6;
  }): RelicCascadeResultV6;
  mountTrunk(
    container: HTMLElement,
    opts: {
      career: Readonly<CareerStateV6>;
      nextEpisode: EpisodeBlueprintV6;
      upcomingTwistPreview: BoardTwistMutationIdV6;
      backstageBeat: ReactiveDialogueBeatV6 | null;
      stageTheme: StageAtmosphereThemeV6;
      onBuyEquipRelic: (relicId: string, costCash: number) => boolean;
      onUnequipRelic: (relicId: string) => void;
      onReorderRelics: (fromIndex: number, toIndex: number) => void;
      onBuyFoilCard: (card: FoilTrickCardV6) => boolean;
      onExpandRelicSlots: (costCash: number) => boolean;
      onLaunchNextBroadcast: () => void;
      onReturnLobby: () => void;
    },
  ): DisposableHandleV6 | void;
}

export interface ShowrunnerAdapterV6 {
  pickLiveQuip(triggerTags: readonly string[], memory: Readonly<MatchEventMemoryV6>): ReactiveDialogueBeatV6 | null;
  pickBackstageBeat(memory: Readonly<MatchEventMemoryV6>): ReactiveDialogueBeatV6 | null;
}

export interface LobbyViewAdapterV6 {
  mount(
    container: HTMLElement,
    opts: {
      career: Readonly<CareerStateV6>;
      activeStage: StageWorldMetaV6;
      stageTheme: StageAtmosphereThemeV6;
      onSelectStagePreview: (stageId: StageWorldIdV6) => void;
      onStartCampaign: (episodeNumber?: number) => void;
      onStartQuickShow: (stageId: StageWorldIdV6) => void;
      onStartTrapdoorGauntlet: () => void;
      onOpenTrunk: () => void;
      onOpenTrophyVault: () => void;
      onOpenOptions: () => void;
    },
  ): DisposableHandleV6 | void;
}

export interface TrophyVaultAdapterV6 {
  mount(
    container: HTMLElement,
    opts: {
      career: Readonly<CareerStateV6>;
      awards: readonly HonorAwardDefinitionV6[];
      stageTheme: StageAtmosphereThemeV6;
      onTogglePinMedal: (awardId: string) => string[];
      onBack: () => void;
    },
  ): DisposableHandleV6 | void;
}

export interface OptionsConsoleAdapterV6 {
  mount(
    container: HTMLElement,
    opts: {
      options: Readonly<BroadcastOptionsStateV6>;
      stageTheme: StageAtmosphereThemeV6;
      seenClueCount: number;
      totalCluePool: number;
      onUpdateOptions: (patch: Partial<BroadcastOptionsStateV6>) => BroadcastOptionsStateV6;
      onAuditionSymphony: (trackId: SymphonyTrackIdV6) => void;
      onResetCampaign: () => void;
      onWipeClueMemory: () => Promise<void> | void;
      onGetVuLevels?: () => { left: number; right: number; peak: number };
      onBack: () => void;
    },
  ): DisposableHandleV6 | void;
}

export interface CeremonySummaryV6 {
  episode: EpisodeBlueprintV6;
  mode: ShowtimePlayModeV6;
  won: boolean;
  playerCash: number;
  rivalCash: number;
  rivalName: string;
  purseAwarded: number;
  maxStreak: number;
  episodeMisses: number;
  trapdoorsSurvived: number;
  newlyUnlockedAwards: HonorAwardDefinitionV6[];
  unlockedStage: StageWorldIdV6 | null;
  expandedRelicSlots: boolean;
}

export interface CeremonyViewAdapterV6 {
  mount(
    container: HTMLElement,
    opts: {
      summary: CeremonySummaryV6;
      stageTheme: StageAtmosphereThemeV6;
      onGoToTrunk: () => void;
      onPlayNextOrRematch: () => void;
      onReturnLobby: () => void;
    },
  ): DisposableHandleV6 | void;
}

export interface ShowtimeDependenciesV6 {
  careerStore?: CareerSaveStoreV6;
  stageEngine?: StageEngineAdapterV6;
  cameraDirector?: CameraDirectorAdapterV6;
  audioEngine?: AudioEngineAdapterV6;
  questionEngine?: QuestionEngineAdapterV6;
  boardManager?: BoardManagerAdapterV6;
  twistDirector?: TwistDirectorAdapterV6;
  toyManager?: ToyManagerAdapterV6;
  trapdoorEngine?: TrapdoorEngineAdapterV6;
  propTrunk?: PropTrunkAdapterV6;
  showrunner?: ShowrunnerAdapterV6;
  lobbyView?: LobbyViewAdapterV6;
  trophyVaultView?: TrophyVaultAdapterV6;
  optionsConsoleView?: OptionsConsoleAdapterV6;
  ceremonyView?: CeremonyViewAdapterV6;
  rng?: () => number;
}

// ----------------------------------------------------------------------------
// URL Deep-Link / QA Harness Parser
// Supports: ?v6view=lobby|board|toy|trapdoor|trunk|trophies|options|ceremony
//           &stage=1..10&board=1..100&toy=1..100&ep=1..20&twist=...
// ----------------------------------------------------------------------------
const VALID_VIEWS = new Set<string>([
  'lobby',
  'board',
  'toy',
  'trapdoor',
  'trunk',
  'trophies',
  'options',
  'ceremony',
]);

const VALID_TWISTS = new Set<string>([
  'NONE',
  'BLACKOUT_SPOTLIGHT',
  'GRAVITY_INVERSION',
  'HOST_BLIND_AUCTION',
  'CHAIN_FUSE_DETONATION',
  'MIRROR_TWIN_LINK',
  'RISING_FLOOD_STAGE',
  'DOUBLE_AGENT_MOLE',
  'SPLIT_OR_STEAL_VAULT',
  'MAGNETIC_REPULSOR',
  'CURSED_MULTIPLIER_DECAY',
  'OVERCLOCK_DOUBLE_SPEED',
  'RIVAL_FOG_JAMMER',
  'GOLDEN_BOUNTY_HUNT',
  'SUDDEN_TRAPDOOR_HAZARD',
  'RICOCHET_LASER_BONUS',
  'HIGH_VOLTAGE_CHAIN',
]);

function parseBoundedInt(raw: string | null, min: number, max: number): number | null {
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(min, Math.min(max, parsed));
}

export function parseDeepLinkParamsV6(search: string): ShowtimeDeepLinkParamsV6 {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const rawView = params.get('v6view')?.toLowerCase().trim() ?? null;
  const view = rawView && VALID_VIEWS.has(rawView) ? (rawView as DeepLinkViewKeyV6) : null;
  const rawTwist = params.get('twist')?.toUpperCase().trim() ?? null;
  const twistId = rawTwist && VALID_TWISTS.has(rawTwist) ? (rawTwist as BoardTwistMutationIdV6) : null;
  const rawCeremony = (params.get('outcome') ?? params.get('ceremony'))?.toLowerCase().trim() ?? null;
  const ceremonyOutcome = rawCeremony === 'win' || rawCeremony === 'loss' ? rawCeremony : null;

  return {
    view,
    stageNumber: parseBoundedInt(params.get('stage'), 1, 10),
    boardNumber: parseBoundedInt(params.get('board'), 1, 100),
    toyNumber: parseBoundedInt(params.get('toy'), 1, 100),
    episodeNumber: parseBoundedInt(params.get('ep'), 1, 20),
    twistId,
    ceremonyOutcome,
  };
}

// ----------------------------------------------------------------------------
// Cross-Browser 1-Tap Fullscreen Helper (Standard + WebKit + MS fallback)
// ----------------------------------------------------------------------------
interface VendorFullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
}

interface VendorFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

export function isDocumentFullscreenV6(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as VendorFullscreenDocument;
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement);
}

export async function toggleDocumentFullscreenV6(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const doc = document as VendorFullscreenDocument;
  const el = document.documentElement as VendorFullscreenElement;
  try {
    if (isDocumentFullscreenV6()) {
      if (typeof doc.exitFullscreen === 'function') {
        await doc.exitFullscreen();
      } else if (typeof doc.webkitExitFullscreen === 'function') {
        await doc.webkitExitFullscreen();
      } else if (typeof doc.msExitFullscreen === 'function') {
        await doc.msExitFullscreen();
      }
      return false;
    }
    if (typeof el.requestFullscreen === 'function') {
      await el.requestFullscreen();
      return true;
    }
    if (typeof el.webkitRequestFullscreen === 'function') {
      await el.webkitRequestFullscreen();
      return true;
    }
    if (typeof el.msRequestFullscreen === 'function') {
      await el.msRequestFullscreen();
      return true;
    }
  } catch {
    // Some embedded contexts reject programmatic fullscreen without gesture
  }
  return isDocumentFullscreenV6();
}

// ----------------------------------------------------------------------------
// Built-In Fallback Stage Themes, Boards, Toys & Clues (For Standalone Resilience)
// ----------------------------------------------------------------------------
const FALLBACK_STAGE_HUD_THEMES: Readonly<Record<StageWorldIdV6, StageAtmosphereThemeV6['hudTheme']>> = {
  STAGE_01_VAUDEVILLE_PALACE: {
    surfaceCss: 'rgba(26, 12, 16, 0.92)',
    borderCss: '#d4a34a',
    accentCss: '#f4c76b',
    badgeBgCss: '#6e1423',
    badgeTextCss: '#fff6e0',
    fontHeadingFamily: '"Cinzel", Georgia, serif',
  },
  STAGE_02_GENEVA_CONSERVATORY: {
    surfaceCss: 'rgba(22, 26, 34, 0.92)',
    borderCss: '#d9a18c',
    accentCss: '#f3c6b3',
    badgeBgCss: '#2c3d59',
    badgeTextCss: '#fbf8f3',
    fontHeadingFamily: '"Cinzel", Georgia, serif',
  },
  STAGE_03_MONTE_CARLO_SALON: {
    surfaceCss: 'rgba(9, 28, 22, 0.92)',
    borderCss: '#d9b45a',
    accentCss: '#52e0a5',
    badgeBgCss: '#0f4c3a',
    badgeTextCss: '#fff8e5',
    fontHeadingFamily: '"Cinzel", Georgia, serif',
  },
  STAGE_04_CARTOGRAPHIC_ROTUNDA: {
    surfaceCss: 'rgba(18, 24, 30, 0.92)',
    borderCss: '#58b4a0',
    accentCss: '#e0b363',
    badgeBgCss: '#1e4246',
    badgeTextCss: '#f4f0e2',
    fontHeadingFamily: '"Cinzel", Georgia, serif',
  },
  STAGE_05_ANALOG_BUNKER_1969: {
    surfaceCss: 'rgba(20, 24, 18, 0.94)',
    borderCss: '#f08a24',
    accentCss: '#ffaa44',
    badgeBgCss: '#384029',
    badgeTextCss: '#ffe7c4',
    fontHeadingFamily: '"JetBrains Mono", monospace',
  },
  STAGE_06_KYOTO_LACQUER_PAVILION: {
    surfaceCss: 'rgba(20, 10, 12, 0.93)',
    borderCss: '#e0b84c',
    accentCss: '#eb523b',
    badgeBgCss: '#7d1c19',
    badgeTextCss: '#fff4dc',
    fontHeadingFamily: '"Cinzel", Georgia, serif',
  },
  STAGE_07_CARNIVAL_CURIOSITIES: {
    surfaceCss: 'rgba(18, 16, 30, 0.93)',
    borderCss: '#e3874f',
    accentCss: '#4ed9d2',
    badgeBgCss: '#5c233a',
    badgeTextCss: '#fff4e4',
    fontHeadingFamily: '"Cinzel", Georgia, serif',
  },
  STAGE_08_SUNKEN_BATHYSPHERE: {
    surfaceCss: 'rgba(10, 22, 30, 0.94)',
    borderCss: '#b98952',
    accentCss: '#46d8df',
    badgeBgCss: '#12394a',
    badgeTextCss: '#e5fbff',
    fontHeadingFamily: '"Cinzel", Georgia, serif',
  },
  STAGE_09_ASTRAL_OBSERVATORY: {
    surfaceCss: 'rgba(13, 18, 34, 0.93)',
    borderCss: '#65e0b8',
    accentCss: '#a89cff',
    badgeBgCss: '#1f2b57',
    badgeTextCss: '#f2f6ff',
    fontHeadingFamily: '"Cinzel", Georgia, serif',
  },
  STAGE_10_SOVEREIGN_COLOSSEUM: {
    surfaceCss: 'rgba(14, 12, 12, 0.95)',
    borderCss: '#f2c14e',
    accentCss: '#ff7043',
    badgeBgCss: '#4a1b12',
    badgeTextCss: '#fff6da',
    fontHeadingFamily: '"Cinzel", Georgia, serif',
  },
};

function buildFallbackStageTheme(stageId: StageWorldIdV6): StageAtmosphereThemeV6 {
  const meta = getStageMetaByIdV6(stageId);
  return {
    stageId,
    stageNumber: meta.stageNumber,
    title: meta.title,
    eraSubtitle: meta.eraSubtitle,
    difficultyBand: meta.difficultyBand,
    symphonyTrack: meta.symphonyTrack,
    materials: {
      floorColorHex: 0x1b1512,
      floorRoughness: 0.45,
      floorMetalness: 0.25,
      trimMetalHex: 0xd4a34a,
      trimRoughness: 0.28,
      trimMetalness: 0.88,
      stoneOrWoodHex: 0x2b1d17,
      jewelPrimaryHex: 0xc92c3e,
      jewelSecondaryHex: 0x3ac9b0,
    },
    lighting: {
      skyTopHex: 0x0b1224,
      fogHex: 0x0a0e19,
      fogDensity: 0.018,
      keyLightHex: 0xffe4b5,
      keyIntensity: 2.2,
      rimLightHex: 0x6ad6ff,
      rimIntensity: 1.4,
      ambientHex: 0x252c3f,
      particleKind: 'GOLDEN_DUST',
    },
    hudTheme: FALLBACK_STAGE_HUD_THEMES[stageId],
  };
}

const FALLBACK_BOARD_FAMILIES: readonly BoardFamilyIdV6[] = [
  'CLOCKWORK_ROTARY',
  'TURF_WAR_BRIDGES',
  'GRAVITY_PHYSICS',
  'CASINO_PUSH_LUCK',
  'STEALTH_OPTICS_RADAR',
  'MONUMENT_INDUSTRIAL',
  'CARTOGRAPHY_EXPEDITION',
  'CARNIVAL_ARCADE',
  'ASTRAL_QUANTUM',
  'RULE_BENDER_TWISTS',
];

const FALLBACK_ARCHETYPES: readonly BoardDefinitionV6['mechanicArchetype'][] = [
  'CONCENTRIC_RINGS',
  'HEX_TURF_BRIDGE',
  'PINBALL_DROP',
  'BLACKJACK_21_FELT',
  'LASER_MIRROR_GRID',
  'STEPPED_PYRAMID',
  'SUBWAY_NETWORK',
  'FERRIS_WHEEL',
  'ASTRAL_CONSTELLATION',
  'SPLIT_OR_STEAL_ARENA',
];

const FALLBACK_TWISTS_BY_STAGE: readonly BoardTwistMutationIdV6[] = [
  'GOLDEN_BOUNTY_HUNT',
  'OVERCLOCK_DOUBLE_SPEED',
  'HOST_BLIND_AUCTION',
  'MIRROR_TWIN_LINK',
  'DOUBLE_AGENT_MOLE',
  'HIGH_VOLTAGE_CHAIN',
  'CHAIN_FUSE_DETONATION',
  'RISING_FLOOD_STAGE',
  'RICOCHET_LASER_BONUS',
  'SPLIT_OR_STEAL_VAULT',
];

const FALLBACK_TOY_FAMILIES: readonly ToyFamilyIdV6[] = [
  'DEFUSAL_ELIMINATION',
  'ATLAS_RELIEF_SPATIAL',
  'DIALS_CRYPTEX_LOCKS',
  'RAPID_PADDLES_REFLEX',
  'PROGRESSIVE_AUDIO_REVEAL',
  'WAGER_SCALE_CHRONOLOGY',
  'CASINO_BLUFF_STAKES',
  'FORENSIC_DETECTIVE',
  'KINETIC_CONTRAPTIONS',
  'MIND_GAME_TWISTS',
];

const FALLBACK_TRAPDOOR_IDS: readonly string[] = [
  'trapdoor_01_rock_bands',
  'trapdoor_02_closing_blades',
  'trapdoor_03_live_green_fuse',
  'trapdoor_04_real_countries',
  'trapdoor_05_lava_piston',
  'trapdoor_06_element_vs_potion',
  'trapdoor_07_counterfeit_shredder',
  'trapdoor_08_oscilloscope_hold',
  'trapdoor_09_boiler_steam_vent',
  'trapdoor_10_mirrored_animals',
];

function createFallbackBoardCatalog(): BoardDefinitionV6[] {
  const out: BoardDefinitionV6[] = [];
  for (let i = 1; i <= 100; i += 1) {
    const familyIdx = Math.floor((i - 1) / 10);
    const stageMeta = STAGE_WORLD_CATALOG_V6[familyIdx % 10];
    out.push({
      boardId: `board_${String(i).padStart(3, '0')}_${FALLBACK_BOARD_FAMILIES[familyIdx].toLowerCase()}`,
      boardNumber: i,
      name: `${stageMeta.title} Contraption #${String(i).padStart(2, '0')}`,
      family: FALLBACK_BOARD_FAMILIES[familyIdx],
      signatureStage: stageMeta.stageId,
      tagline: 'Claim aligned vaults before the Stage Champion locks the bridge.',
      symphonyTrack: stageMeta.symphonyTrack,
      defaultTwist: FALLBACK_TWISTS_BY_STAGE[familyIdx % 10],
      targetWinCondition: 'Outscore the Stage Champion across 5-6 tactical turns.',
      nodeCount: 12,
      mechanicArchetype: FALLBACK_ARCHETYPES[familyIdx % 10],
      accentPalette: { primaryHex: 0xd4a34a, secondaryHex: 0x3ac9b0, gemHex: 0xc92c3e },
    });
  }
  return out;
}

function createFallbackToyCatalog(): ToyDefinitionV6[] {
  const callouts: Record<ToyFamilyIdV6, string> = {
    DEFUSAL_ELIMINATION: 'CUT 3 WRONG WIRES',
    ATLAS_RELIEF_SPATIAL: 'DROP RUBY GLOBE PIN',
    DIALS_CRYPTEX_LOCKS: 'ALIGN BRASS TUMBLERS',
    RAPID_PADDLES_REFLEX: 'SLAM LEFT OR RIGHT',
    PROGRESSIVE_AUDIO_REVEAL: 'CALL IT EARLY',
    WAGER_SCALE_CHRONOLOGY: 'BALANCE THE SCALE',
    CASINO_BLUFF_STAKES: 'SPLIT YOUR CHIPS',
    FORENSIC_DETECTIVE: 'SWEEP UV LIGHT',
    KINETIC_CONTRAPTIONS: 'LOCK THE GAUGE',
    MIND_GAME_TWISTS: 'SPOT THE RIGGED LIE',
  };
  const out: ToyDefinitionV6[] = [];
  for (let i = 1; i <= 100; i += 1) {
    const familyIdx = Math.floor((i - 1) / 10);
    const family = FALLBACK_TOY_FAMILIES[familyIdx];
    out.push({
      toyId: `toy_${String(i).padStart(3, '0')}_${family.toLowerCase()}`,
      toyNumber: i,
      name: `${family.replace(/_/g, ' ')} #${String(i).padStart(2, '0')}`,
      family,
      actionCallout: callouts[family],
      baseSeconds: family === 'MIND_GAME_TWISTS' ? 14 : 16,
      isTwistToy: i >= 91,
    });
  }
  return out;
}

const NODE_CATEGORY_LABELS = [
  'MOVIES',
  'WORLD ATLAS',
  'INVENTIONS',
  'MUSIC',
  'SCIENCE',
  'HISTORY',
  'SPORTS',
  'FOOD & CRAFT',
  'ARTS',
  'NATURE',
  'TECH',
  'MYTH & LIT',
] as const;

function createFallbackBoardRuntime(
  def: BoardDefinitionV6,
  rivalName: string,
  maxTurns: number,
): BoardRuntimeStateV6 {
  const count = Math.max(8, Math.min(16, def.nodeCount || 12));
  const nodes: BoardNodeV6[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const ringIndex = i < 4 ? 0 : i < 8 ? 1 : 2;
    const radius = 1.1 + ringIndex * 0.85;
    const prevIdx = (i - 1 + count) % count;
    const nextIdx = (i + 1) % count;
    const crossIdx = (i + Math.floor(count / 2)) % count;
    nodes.push({
      nodeId: `node_${String(i + 1).padStart(2, '0')}`,
      index: i,
      categoryLabel: NODE_CATEGORY_LABELS[i % NODE_CATEGORY_LABELS.length],
      domainId: i % 12,
      baseChips: 150 + (i % 4) * 75 + (ringIndex === 0 ? 100 : 0),
      multBonus: ringIndex === 0 ? 1.5 : ringIndex === 1 ? 1.0 : 0.5,
      difficultyOffset: ringIndex === 0 ? 0.6 : ringIndex === 1 ? 0.15 : -0.25,
      owner: 'NONE',
      lockedChains: i === 0 || i === 5 ? 1 : 0,
      hasTrapFuse: i === count - 1,
      isMysteryAuction: i === 2,
      ringIndex,
      tierIndex: 2 - ringIndex,
      neighbors: [
        `node_${String(prevIdx + 1).padStart(2, '0')}`,
        `node_${String(nextIdx + 1).padStart(2, '0')}`,
        `node_${String(crossIdx + 1).padStart(2, '0')}`,
      ],
      pos3d: [
        Number((Math.cos(angle) * radius).toFixed(2)),
        0,
        Number((Math.sin(angle) * radius).toFixed(2)),
      ],
    });
  }

  return {
    definition: def,
    activeTwist: 'NONE',
    nodes,
    turnNumber: 1,
    maxTurns,
    ringRotationsDeg: [0, 120, 240],
    alignedNodeIds: [nodes[0].nodeId, nodes[4]?.nodeId ?? nodes[1].nodeId],
    playerScoreChips: 0,
    playerMult: 1,
    playerTotalCash: 0,
    rivalTotalCash: 0,
    rivalName,
    streakCount: 0,
  };
}

function createFallbackClue(req: QuestionDrawRequestV6): CalibratedClueV6 {
  const diff = Number(Math.max(1, Math.min(10, req.difficultyTarget)).toFixed(1));
  const badge: CalibratedClueV6['difficultyBadge'] =
    diff < 2.0
      ? 'WARMUP'
      : diff <= 3.5
        ? 'EASY'
        : diff <= 5.4
          ? 'CONTENDER'
          : diff <= 7.3
            ? 'SHARP'
            : diff <= 9.0
              ? 'CHAMPIONSHIP'
              : 'LEGEND';

  return {
    qid: 1280000 + Math.round(diff * 100) + (req.domainId ?? 0),
    domainId: req.domainId ?? 1,
    categoryLabel: NODE_CATEGORY_LABELS[(req.domainId ?? 1) % NODE_CATEGORY_LABELS.length],
    difficultyScore: diff,
    difficultyBadge: badge,
    fameScore: Number(Math.max(0.15, 1 - diff * 0.08).toFixed(2)),
    prompt: 'Which precision brass escapement regulates a classic Swiss mechanical pocket watch?',
    choices: ['Tourbillon Cage', 'Carburetor Float', 'Tuning Peg', 'Bimetallic Relay'],
    correctIndex: 0,
    wrongWireIndices: [1, 2, 3],
    numericTarget: 1801,
    numericMin: 1700,
    numericMax: 1950,
    numericUnit: 'yr',
    geoTarget: { lat: 46.2044, lng: 6.1432, regionHint: 'Western Alps', landmarkLabel: 'Geneva' },
    cryptexWord: 'GENEVA',
    wittyHostAside: 'Breguet patented it in 1801 so gravity would stop embarrassing pocket watches.',
  };
}

// ----------------------------------------------------------------------------
// Scoped Baseline Zero-Scroll Shell CSS (Cleanly Extended by ultrahd_v6.css)
// ----------------------------------------------------------------------------
const DIRECTOR_SHELL_STYLE_ID = 'ws-v6-director-shell-css';

const DIRECTOR_SHELL_CSS = `
.v6-director-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  max-width: 100vw;
  max-height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  color: #fff8ea;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
  pointer-events: none;
  z-index: 20;
}
.v6-director-root * {
  box-sizing: border-box;
}
.v6-top-stage-bar {
  flex: 0 0 auto;
  width: 100%;
  max-width: 100%;
  min-height: clamp(36px, 5.8dvh, 46px);
  padding: 4px clamp(6px, 2vw, 14px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  background: var(--v6-hud-surface, rgba(16, 14, 18, 0.92));
  border-bottom: 1.5px solid var(--v6-hud-border, #d4a34a);
  pointer-events: auto;
  overflow: hidden;
  z-index: 30;
}
.v6-bar-left, .v6-bar-right {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}
.v6-bar-left {
  flex: 1 1 0;
  overflow: hidden;
}
.v6-bar-right {
  flex: 0 0 auto;
}
.v6-stage-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--v6-hud-badge-bg, #5c1922);
  color: var(--v6-hud-badge-text, #fff6e0);
  border: 1px solid var(--v6-hud-border, #d4a34a);
  font-family: var(--v6-hud-heading-font, "Cinzel", Georgia, serif);
  font-size: clamp(9.5px, 2.2vw, 12px);
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  max-width: min(52vw, 280px);
}
.v6-meta-pill {
  font-family: "JetBrains Mono", monospace;
  font-size: clamp(9.5px, 2.1vw, 12px);
  font-weight: 600;
  color: var(--v6-hud-accent, #f4c76b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex-shrink: 1;
  padding: 2px 6px;
  border: 1px solid rgba(255, 232, 180, 0.25);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.42);
}
@media (max-width: 440px) {
  .v6-meta-pill {
    display: none;
  }
}
.v6-bar-btn {
  appearance: none;
  border: 1px solid var(--v6-hud-border, #d4a34a);
  background: rgba(18, 16, 22, 0.9);
  color: #fff8ea;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: clamp(10px, 2.1vw, 11px);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.v6-bar-btn:active {
  transform: translateY(1px);
}
.v6-screen-viewport {
  position: relative;
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  pointer-events: auto;
}
.v6-live-quip-ribbon {
  position: absolute;
  left: 50%;
  top: 6px;
  transform: translateX(-50%);
  max-width: min(94%, 560px);
  padding: 5px 12px;
  border-radius: 4px;
  background: rgba(12, 10, 14, 0.94);
  border: 1.5px solid var(--v6-hud-accent, #f4c76b);
  color: #fff8ea;
  font-size: clamp(11px, 2.4vw, 13px);
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  opacity: 0;
  transition: opacity 180ms ease;
  z-index: 45;
}
.v6-live-quip-ribbon.is-visible {
  opacity: 1;
}
.v6-award-toast {
  position: absolute;
  right: 8px;
  bottom: 8px;
  max-width: min(88%, 340px);
  padding: 7px 11px;
  border-radius: 4px;
  background: rgba(18, 14, 10, 0.96);
  border: 1.5px solid #f2c14e;
  color: #fff6da;
  font-size: 12px;
  pointer-events: none;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 200ms ease, transform 200ms ease;
  z-index: 50;
}
.v6-award-toast.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.v6-fallback-panel {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(8px, 2dvh, 18px) clamp(10px, 3vw, 22px);
  gap: 8px;
  background: radial-gradient(circle at 50% 20%, rgba(28, 22, 34, 0.72), rgba(7, 8, 14, 0.92));
}
.v6-fallback-title {
  margin: 0;
  font-family: var(--v6-hud-heading-font, "Cinzel", Georgia, serif);
  font-size: clamp(16px, 3.6vw, 24px);
  color: var(--v6-hud-accent, #f4c76b);
  letter-spacing: 0.05em;
}
.v6-fallback-sub {
  margin: 2px 0 0 0;
  font-size: clamp(11px, 2.3vw, 13px);
  color: rgba(255, 246, 224, 0.84);
}
.v6-fallback-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(130px, 44%), 1fr));
  gap: 6px;
  min-height: 0;
  overflow: hidden;
}
.v6-fallback-action {
  appearance: none;
  border: 1.5px solid var(--v6-hud-border, #d4a34a);
  background: var(--v6-hud-surface, rgba(20, 16, 22, 0.92));
  color: #fff8ea;
  border-radius: 6px;
  padding: clamp(7px, 1.4dvh, 12px) 10px;
  font-size: clamp(11px, 2.4vw, 13px);
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.v6-fallback-action small {
  display: block;
  margin-top: 2px;
  font-weight: 500;
  font-size: 10px;
  color: var(--v6-hud-accent, #f4c76b);
}
@media (max-height: 460px) {
  .v6-top-stage-bar {
    min-height: 32px;
    padding: 2px 8px;
  }
  .v6-meta-pill.v6-hide-short {
    display: none;
  }
}
`;

// ----------------------------------------------------------------------------
// QA Harness Window Augmentation
// ----------------------------------------------------------------------------
export interface ShowtimeQaHandleV6 {
  getPhase(): ShowtimePhaseV6;
  getActiveStageId(): StageWorldIdV6;
  getActiveEpisode(): EpisodeBlueprintV6;
  getActiveBoard(): BoardRuntimeStateV6 | null;
  getActiveToy(): ToyDefinitionV6 | null;
  getCareerState(): Readonly<CareerStateV6>;
  jumpToDeepLink(params: Partial<ShowtimeDeepLinkParamsV6>): Promise<void>;
  toggleFullscreen(): Promise<boolean>;
}

declare global {
  interface Window {
    __WS_V6_DIRECTOR__?: ShowtimeQaHandleV6;
  }
}

// ----------------------------------------------------------------------------
// ShowtimeMasterDirectorV6 Class
// ----------------------------------------------------------------------------
export class ShowtimeMasterDirectorV6 {
  private readonly uiRoot: HTMLElement;
  private readonly deps: ShowtimeDependenciesV6;
  private readonly career: CareerSaveStoreV6;
  private readonly rng: () => number;

  // Persistent two-layer DOM shell (Prevents P0-1 HUD detachment forever)
  private readonly hudBarEl: HTMLElement;
  private readonly stagePillEl: HTMLElement;
  private readonly metaPillEl: HTMLElement;
  private readonly cashPillEl: HTMLElement;
  private readonly backBtnEl: HTMLButtonElement;
  private readonly soundBtnEl: HTMLButtonElement;
  private readonly fullscreenBtnEl: HTMLButtonElement;
  private readonly viewportHostEl: HTMLElement;
  private readonly quipRibbonEl: HTMLElement;
  private readonly awardToastEl: HTMLElement;

  // Fallback catalogs if sibling managers are not yet wired
  private readonly fallbackBoards: readonly BoardDefinitionV6[];
  private readonly fallbackToys: readonly ToyDefinitionV6[];

  // Live Runtime Session State
  private phase: ShowtimePhaseV6 = 'LOBBY_HUB';
  private playMode: ShowtimePlayModeV6 = 'CAMPAIGN';
  private activeStageId: StageWorldIdV6 = 'STAGE_01_VAUDEVILLE_PALACE';
  private activeEpisode: EpisodeBlueprintV6 = getEpisodeBlueprintV6(1);
  private rivalAI: RivalStageAIV6 = new RivalStageAIV6('STAGE_01_VAUDEVILLE_PALACE');
  private boardState: BoardRuntimeStateV6 | null = null;
  private activeNodeId: string | null = null;
  private activeToy: ToyDefinitionV6 | null = null;
  private activeClue: CalibratedClueV6 | null = null;
  private activeTrapdoorId: string | null = null;
  private lastCeremony: CeremonySummaryV6 | null = null;

  // Per-episode transient tactical flags
  private episodeMisses = 0;
  private episodeTrapdoorSurvivals = 0;
  private episodeMaxStreak = 0;
  private halftimeTwistTriggered = false;
  private doubleMultArmed = false;
  private screwRivalArmed = false;
  private rivalFrozenNextTurn = false;
  private frozenNodeIds = new Set<string>();
  private qaForcedToyNumber: number | null = null;

  // Active view & timer cleanup handles
  private activeViewHandle: DisposableHandleV6 | null = null;
  private quipTimeoutId: number | null = null;
  private toastTimeoutId: number | null = null;
  private curtainTimeoutId: number | null = null;
  private readonly unsubscribeCareer: () => void;
  private readonly onFullscreenChangeBound: () => void;
  private disposed = false;

  constructor(uiRoot: HTMLElement, deps: ShowtimeDependenciesV6 = {}) {
    this.uiRoot = uiRoot;
    this.deps = deps;
    this.career = deps.careerStore ?? new CareerSaveStoreV6();
    this.rng = deps.rng ?? Math.random;
    this.fallbackBoards = createFallbackBoardCatalog();
    this.fallbackToys = createFallbackToyCatalog();

    // Sync initial stage & episode from persisted career save
    const initialCareer = this.career.getState();
    this.activeEpisode = getEpisodeBlueprintV6(initialCareer.currentEpisode);
    this.activeStageId = this.activeEpisode.stageMeta.stageId;
    this.rivalAI = new RivalStageAIV6(this.activeStageId);

    this.ensureShellStylesheet();

    // Build zero-scroll root shell cleanly
    this.uiRoot.innerHTML = '';
    this.uiRoot.classList.add('v6-ultrahd-root', 'v6-director-root');
    this.uiRoot.dataset.v6Phase = this.phase;

    // 1) Persistent Top Stage-Bar HUD (lives on EVERY screen, never detached)
    this.hudBarEl = document.createElement('header');
    this.hudBarEl.className = 'v6-top-stage-bar';
    this.hudBarEl.dataset.v6Role = 'top-stage-bar';

    const leftGroup = document.createElement('div');
    leftGroup.className = 'v6-bar-left';

    this.backBtnEl = document.createElement('button');
    this.backBtnEl.type = 'button';
    this.backBtnEl.className = 'v6-bar-btn';
    this.backBtnEl.dataset.v6Action = 'hub-back';
    this.backBtnEl.textContent = 'LOBBY';
    this.backBtnEl.addEventListener('click', () => {
      this.playFoley('ui_brass_tap');
      void this.enterLobbyHub();
    });

    this.stagePillEl = document.createElement('span');
    this.stagePillEl.className = 'v6-stage-pill';
    this.stagePillEl.dataset.v6Role = 'stage-pill';

    this.metaPillEl = document.createElement('span');
    this.metaPillEl.className = 'v6-meta-pill v6-hide-short';
    this.metaPillEl.dataset.v6Role = 'meta-pill';

    leftGroup.append(this.backBtnEl, this.stagePillEl, this.metaPillEl);

    const rightGroup = document.createElement('div');
    rightGroup.className = 'v6-bar-right';

    this.cashPillEl = document.createElement('span');
    this.cashPillEl.className = 'v6-meta-pill';
    this.cashPillEl.dataset.v6Role = 'cash-pill';

    this.soundBtnEl = document.createElement('button');
    this.soundBtnEl.type = 'button';
    this.soundBtnEl.className = 'v6-bar-btn';
    this.soundBtnEl.dataset.v6Action = 'toggle-music';
    this.soundBtnEl.addEventListener('click', () => {
      const curr = this.career.getOptions();
      this.applyOptionsPatch({ musicEnabled: !curr.musicEnabled });
      this.playFoley('ui_brass_tap');
    });

    this.fullscreenBtnEl = document.createElement('button');
    this.fullscreenBtnEl.type = 'button';
    this.fullscreenBtnEl.className = 'v6-bar-btn';
    this.fullscreenBtnEl.dataset.v6Action = 'fullscreen';
    this.fullscreenBtnEl.setAttribute('aria-label', 'Toggle Fullscreen');
    this.fullscreenBtnEl.textContent = 'FULLSCREEN';
    this.fullscreenBtnEl.addEventListener('click', () => {
      this.playFoley('ui_brass_tap');
      void toggleDocumentFullscreenV6().then(() => this.refreshFullscreenLabel());
    });

    rightGroup.append(this.cashPillEl, this.soundBtnEl, this.fullscreenBtnEl);
    this.hudBarEl.append(leftGroup, rightGroup);

    // 2) Dedicated Screen Viewport Layer
    this.viewportHostEl = document.createElement('main');
    this.viewportHostEl.className = 'v6-screen-viewport';
    this.viewportHostEl.dataset.v6Role = 'screen-viewport';

    this.quipRibbonEl = document.createElement('div');
    this.quipRibbonEl.className = 'v6-live-quip-ribbon';
    this.quipRibbonEl.dataset.v6Role = 'live-quip';

    this.awardToastEl = document.createElement('div');
    this.awardToastEl.className = 'v6-award-toast';
    this.awardToastEl.dataset.v6Role = 'award-toast';

    this.uiRoot.append(this.hudBarEl, this.viewportHostEl, this.quipRibbonEl, this.awardToastEl);

    // Fullscreen change listener
    this.onFullscreenChangeBound = () => this.refreshFullscreenLabel();
    if (typeof document !== 'undefined') {
      document.addEventListener('fullscreenchange', this.onFullscreenChangeBound);
      document.addEventListener('webkitfullscreenchange', this.onFullscreenChangeBound);
    }

    // Apply persisted options across CSS, GPU & Audio immediately
    this.syncOptionsToSubsystems(this.career.getOptions());
    this.unsubscribeCareer = this.career.subscribe(() => {
      this.refreshTopStageBar();
    });

    // Attach deterministic QA harness handle on window
    if (typeof window !== 'undefined') {
      window.__WS_V6_DIRECTOR__ = {
        getPhase: () => this.phase,
        getActiveStageId: () => this.activeStageId,
        getActiveEpisode: () => this.activeEpisode,
        getActiveBoard: () => this.boardState,
        getActiveToy: () => this.activeToy,
        getCareerState: () => this.career.getState(),
        jumpToDeepLink: (p) => this.applyDeepLink(p),
        toggleFullscreen: () => toggleDocumentFullscreenV6(),
      };
    }

    this.refreshTopStageBar();
    this.refreshFullscreenLabel();
  }

  // ---- Boot & QA Deep-Link Entry Point -------------------------------------

  public async start(searchString?: string): Promise<void> {
    const query =
      searchString !== undefined
        ? searchString
        : typeof window !== 'undefined'
          ? window.location.search
          : '';
    const deep = parseDeepLinkParamsV6(query);

    if (deep.view || deep.stageNumber || deep.boardNumber || deep.toyNumber || deep.episodeNumber) {
      await this.applyDeepLink(deep);
      return;
    }

    await this.loadStageAtmosphere(this.activeStageId);
    await this.enterLobbyHub();
  }

  /**
   * Deterministic QA Deep-Link Jump:
   * `?v6view=lobby|board|toy|trapdoor|trunk|trophies|options|ceremony&stage=1..10&board=1..100&toy=1..100`
   */
  public async applyDeepLink(params: Partial<ShowtimeDeepLinkParamsV6>): Promise<void> {
    if (params.episodeNumber) {
      this.activeEpisode = getEpisodeBlueprintV6(params.episodeNumber);
      this.activeStageId = this.activeEpisode.stageMeta.stageId;
    } else if (params.stageNumber) {
      const meta = getStageMetaByNumberV6(params.stageNumber);
      this.activeStageId = meta.stageId;
      this.activeEpisode = getEpisodeBlueprintV6(meta.episodes[0]);
    }

    if (params.toyNumber) {
      this.qaForcedToyNumber = params.toyNumber;
    }

    this.rivalAI = new RivalStageAIV6(this.activeStageId);
    await this.loadStageAtmosphere(this.activeStageId);

    const view = params.view ?? (params.toyNumber ? 'toy' : params.boardNumber ? 'board' : 'lobby');

    switch (view) {
      case 'lobby':
        await this.enterLobbyHub();
        break;
      case 'trophies':
        await this.enterTrophyVault();
        break;
      case 'options':
        await this.enterOptionsConsole();
        break;
      case 'trunk':
        await this.enterBackstageTrunk();
        break;
      case 'board': {
        const boardDef = this.resolveBoardDefinition(params.boardNumber ?? undefined);
        this.prepareEpisodeRuntime(boardDef, params.twistId ?? undefined);
        await this.enterBoardTurn();
        break;
      }
      case 'toy': {
        const boardDef = this.resolveBoardDefinition(params.boardNumber ?? undefined);
        this.prepareEpisodeRuntime(boardDef, params.twistId ?? undefined);
        const targetNode = this.boardState?.nodes[0];
        this.activeNodeId = targetNode?.nodeId ?? 'node_01';
        await this.enterToyEncounter(params.toyNumber ?? undefined);
        break;
      }
      case 'trapdoor': {
        const boardDef = this.resolveBoardDefinition(params.boardNumber ?? undefined);
        this.prepareEpisodeRuntime(boardDef, params.twistId ?? undefined);
        await this.enterTrapdoorGambit();
        break;
      }
      case 'ceremony': {
        const won = params.ceremonyOutcome !== 'loss';
        this.lastCeremony = {
          episode: this.activeEpisode,
          mode: this.playMode,
          won,
          playerCash: won ? 2450 : 1120,
          rivalCash: won ? 1680 : 1940,
          rivalName: this.rivalAI.getPersonality().displayName,
          purseAwarded: won ? this.activeEpisode.basePurseCash : Math.round(this.activeEpisode.basePurseCash * 0.35),
          maxStreak: won ? 4 : 2,
          episodeMisses: won ? 0 : 2,
          trapdoorsSurvived: won ? 1 : 0,
          newlyUnlockedAwards: [],
          unlockedStage: null,
          expandedRelicSlots: false,
        };
        await this.enterEpisodeCeremony(this.lastCeremony);
        break;
      }
    }
  }

  // ---- Public State Accessors ----------------------------------------------

  public getPhase(): ShowtimePhaseV6 {
    return this.phase;
  }

  public getCareerStore(): CareerSaveStoreV6 {
    return this.career;
  }

  public getActiveStageId(): StageWorldIdV6 {
    return this.activeStageId;
  }

  public getStageTheme(stageId: StageWorldIdV6 = this.activeStageId): StageAtmosphereThemeV6 {
    return this.deps.stageEngine?.getStageTheme?.(stageId) ?? buildFallbackStageTheme(stageId);
  }

  // ---- Stage Atmosphere, Audio & Options Sync ------------------------------

  private async loadStageAtmosphere(stageId: StageWorldIdV6): Promise<void> {
    this.activeStageId = stageId;
    if (this.deps.stageEngine) {
      await this.deps.stageEngine.loadStageWorld(stageId);
    }
    const theme = this.getStageTheme(stageId);
    this.applyHudThemeTokens(theme);
    this.refreshTopStageBar();
  }

  private applyHudThemeTokens(theme: StageAtmosphereThemeV6): void {
    const style = this.uiRoot.style;
    style.setProperty('--v6-hud-surface', theme.hudTheme.surfaceCss);
    style.setProperty('--v6-hud-border', theme.hudTheme.borderCss);
    style.setProperty('--v6-hud-accent', theme.hudTheme.accentCss);
    style.setProperty('--v6-hud-badge-bg', theme.hudTheme.badgeBgCss);
    style.setProperty('--v6-hud-badge-text', theme.hudTheme.badgeTextCss);
    style.setProperty('--v6-hud-heading-font', theme.hudTheme.fontHeadingFamily);
    this.uiRoot.dataset.v6Stage = theme.stageId;
  }

  public applyOptionsPatch(patch: Partial<BroadcastOptionsStateV6>): BroadcastOptionsStateV6 {
    const updated = this.career.updateOptions(patch);
    this.syncOptionsToSubsystems(updated);
    return updated;
  }

  private syncOptionsToSubsystems(options: Readonly<BroadcastOptionsStateV6>): void {
    this.uiRoot.dataset.v6ColorLens = options.colorVisionLens;
    this.uiRoot.dataset.v6ThumbDock = options.thumbDock;
    this.uiRoot.dataset.v6Resolution = options.resolutionTier;
    this.uiRoot.style.setProperty('--v6-text-scale', String(options.textScale));
    this.deps.stageEngine?.applyOptions?.(options);
    this.deps.cameraDirector?.setMotionMode?.(options.cameraMotion);
    this.deps.audioEngine?.applyOptions(options);
    this.soundBtnEl.textContent = options.musicEnabled ? 'SCORE: ON' : 'SCORE: OFF';
  }

  private playSymphony(trackId: SymphonyTrackIdV6): void {
    if (!this.career.getOptions().musicEnabled) return;
    this.deps.audioEngine?.playSymphony(trackId);
  }

  private playFoley(sfxId: FoleySfxIdV6): void {
    if (!this.career.getOptions().sfxEnabled) return;
    this.deps.audioEngine?.playFoley(sfxId);
  }

  private playStreakStinger(streak: number): void {
    const cues: FoleySfxIdV6[] = [
      'streak_chord_1',
      'streak_chord_2',
      'streak_chord_3',
      'streak_chord_4',
      'streak_fanfare_5',
    ];
    const idx = Math.max(0, Math.min(cues.length - 1, streak - 1));
    this.playFoley(cues[idx]);
  }

  // ---- Screen Mounting & Transition Lifecycle ------------------------------

  private setPhase(nextPhase: ShowtimePhaseV6): void {
    this.disposeActiveView();
    this.phase = nextPhase;
    this.uiRoot.dataset.v6Phase = nextPhase;
    this.refreshTopStageBar();
  }

  private disposeActiveView(): void {
    if (this.curtainTimeoutId !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.curtainTimeoutId);
      this.curtainTimeoutId = null;
    }
    if (this.activeViewHandle) {
      try {
        this.activeViewHandle.dispose();
      } catch {
        // Isolate child view cleanup errors
      }
      this.activeViewHandle = null;
    }
    this.viewportHostEl.innerHTML = '';
  }

  private refreshTopStageBar(): void {
    const meta = getStageMetaByIdV6(this.activeStageId);
    const state = this.career.getState();
    const isCompact = typeof window !== 'undefined' && window.innerWidth < 540;
    const shortTitle = meta.title.split(/\s+/).slice(0, 2).join(' ').toUpperCase();

    this.stagePillEl.textContent = isCompact
      ? `S${String(meta.stageNumber).padStart(2, '0')} · ${shortTitle}`
      : `STAGE ${String(meta.stageNumber).padStart(2, '0')}/10 • ${meta.title.toUpperCase()}`;

    const activeEpNum = this.activeEpisode?.episodeNumber ?? state.currentEpisode;

    if (this.phase === 'BOARD_TURN' || this.phase === 'TOY_ENCOUNTER' || this.phase === 'TWIST_MUTATION') {
      const turnStr = this.boardState
        ? isCompact
          ? `T${this.boardState.turnNumber}/${this.boardState.maxTurns}`
          : `TURN ${this.boardState.turnNumber}/${this.boardState.maxTurns}`
        : `EP ${String(activeEpNum).padStart(2, '0')}`;
      this.metaPillEl.textContent =
        this.playMode === 'QUICK_SHOW'
          ? isCompact
            ? turnStr
            : `QUICK • ${turnStr}`
          : isCompact
            ? `EP${String(activeEpNum).padStart(2, '0')} · ${turnStr}`
            : `EP ${String(activeEpNum).padStart(2, '0')} • ${turnStr}`;
    } else if (this.phase === 'TRAPDOOR_GAMBIT') {
      this.metaPillEl.textContent = isCompact ? '8S PIT' : 'TRAPDOOR PIT • 8S SURVIVAL';
    } else {
      this.metaPillEl.textContent = isCompact
        ? `EP ${String(activeEpNum).padStart(2, '0')}/20`
        : `EP ${String(activeEpNum).padStart(2, '0')}/20 • ★ ${meta.difficultyBand[0].toFixed(1)}-${meta.difficultyBand[1].toFixed(1)}`;
    }

    this.cashPillEl.textContent = `$${state.bankrollCash.toLocaleString()}`;
    this.backBtnEl.textContent = isCompact ? 'HUB' : 'STAGE HUB';
    this.backBtnEl.style.display = this.phase === 'LOBBY_HUB' ? 'none' : 'inline-flex';
    this.soundBtnEl.textContent = state.options.musicEnabled
      ? isCompact
        ? 'SND'
        : 'SCORE: ON'
      : isCompact
        ? 'MUTE'
        : 'SCORE: OFF';
  }

  private refreshFullscreenLabel(): void {
    const isCompact = typeof window !== 'undefined' && window.innerWidth < 540;
    this.fullscreenBtnEl.textContent = isDocumentFullscreenV6()
      ? isCompact
        ? 'EXIT'
        : 'EXIT FS'
      : isCompact
        ? 'FS'
        : 'FULLSCREEN';
  }

  private showLiveQuip(speaker: string, line: string, durationMs = 3400): void {
    if (!line) return;
    this.quipRibbonEl.textContent = `${speaker}: "${line}"`;
    this.quipRibbonEl.classList.add('is-visible');
    this.deps.audioEngine?.duckForVoice?.(Math.min(2500, durationMs));
    if (this.quipTimeoutId !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.quipTimeoutId);
    }
    if (typeof window !== 'undefined') {
      this.quipTimeoutId = window.setTimeout(() => {
        this.quipRibbonEl.classList.remove('is-visible');
        this.quipTimeoutId = null;
      }, durationMs);
    }
  }

  private announceUnlockedAwards(awards: readonly HonorAwardDefinitionV6[]): void {
    if (awards.length === 0) return;
    const first = awards[0];
    this.playFoley(first.kind === 'TROPHY' ? 'trophy_pedestal_chime' : 'medal_enamel_clink');
    this.awardToastEl.textContent = `${first.kind === 'TROPHY' ? 'TROPHY' : 'MEDAL'} UNLOCKED: ${first.name}${awards.length > 1 ? ` (+${awards.length - 1} more)` : ''}`;
    this.awardToastEl.classList.add('is-visible');
    if (this.toastTimeoutId !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.toastTimeoutId);
    }
    if (typeof window !== 'undefined') {
      this.toastTimeoutId = window.setTimeout(() => {
        this.awardToastEl.classList.remove('is-visible');
        this.toastTimeoutId = null;
      }, 3600);
    }
  }

  // ---- STATE 1: LOBBY_HUB --------------------------------------------------

  public async enterLobbyHub(): Promise<void> {
    this.setPhase('LOBBY_HUB');
    this.deps.stageEngine?.setTrapdoorOpen?.(false);
    this.deps.cameraDirector?.transitionTo('LOBBY_PROSCENIUM');
    const theme = this.getStageTheme(this.activeStageId);
    this.playSymphony(theme.symphonyTrack);

    if (this.deps.lobbyView) {
      const handle = this.deps.lobbyView.mount(this.viewportHostEl, {
        career: this.career.getState(),
        activeStage: getStageMetaByIdV6(this.activeStageId),
        stageTheme: theme,
        onSelectStagePreview: (stageId) => {
          this.playFoley('rotary_knob_click');
          void this.loadStageAtmosphere(stageId).then(() => {
            this.playSymphony(this.getStageTheme(stageId).symphonyTrack);
          });
        },
        onStartCampaign: (ep) => {
          this.playFoley('ui_brass_tap');
          void this.startCampaignEpisode(ep ?? this.career.getState().currentEpisode);
        },
        onStartQuickShow: (stageId) => {
          this.playFoley('ui_brass_tap');
          void this.startQuickShow(stageId);
        },
        onStartTrapdoorGauntlet: () => {
          this.playFoley('trapdoor_hinge_drop');
          void this.startTrapdoorGauntlet();
        },
        onOpenTrunk: () => {
          this.playFoley('velvet_trunk_clasp');
          void this.enterBackstageTrunk();
        },
        onOpenTrophyVault: () => {
          this.playFoley('trophy_pedestal_chime');
          void this.enterTrophyVault();
        },
        onOpenOptions: () => {
          this.playFoley('neve_fader_detent');
          void this.enterOptionsConsole();
        },
      });
      this.activeViewHandle = handle ?? null;
      return;
    }

    // Zero-scroll native fallback Lobby Hub
    const career = this.career.getState();
    const meta = getStageMetaByIdV6(this.activeStageId);
    const panel = document.createElement('section');
    panel.className = 'v6-fallback-panel';
    panel.dataset.v6Screen = 'lobby';
    panel.innerHTML = `
      <div>
        <h1 class="v6-fallback-title">WORLD'S SMARTEST v6.0</h1>
        <p class="v6-fallback-sub">${meta.title} — ${meta.eraSubtitle} · Champion: ${meta.championName}</p>
      </div>
      <div class="v6-fallback-grid">
        <button type="button" class="v6-fallback-action" data-act="campaign">CAMPAIGN ROAD<small>Episode ${career.currentEpisode} of 20 · ★ ${meta.difficultyBand[0].toFixed(1)}-${meta.difficultyBand[1].toFixed(1)}</small></button>
        <button type="button" class="v6-fallback-action" data-act="quick">100-BOARD QUICK SHOW<small>Non-repeating Stage Contraption</small></button>
        <button type="button" class="v6-fallback-action" data-act="gauntlet">TRAPDOOR GAUNTLET<small>8-Second Survival Pit Blitz</small></button>
        <button type="button" class="v6-fallback-action" data-act="trunk">FRANKIE'S PROP TRUNK<small>${career.equippedRelicIds.length}/${career.maxRelicSlots} Relics · ${career.heldFoilCards.length}/3 Foils</small></button>
        <button type="button" class="v6-fallback-action" data-act="trophies">HALL OF TROPHIES<small>${career.unlockedAwardIds.length}/36 Honors Unlocked</small></button>
        <button type="button" class="v6-fallback-action" data-act="options">BROADCAST OPTIONS DESK<small>4-Bay Audio, 3x GPU & Accessibility</small></button>
      </div>
    `;
    panel.querySelector('[data-act="campaign"]')?.addEventListener('click', () => void this.startCampaignEpisode(career.currentEpisode));
    panel.querySelector('[data-act="quick"]')?.addEventListener('click', () => void this.startQuickShow(this.activeStageId));
    panel.querySelector('[data-act="gauntlet"]')?.addEventListener('click', () => void this.startTrapdoorGauntlet());
    panel.querySelector('[data-act="trunk"]')?.addEventListener('click', () => void this.enterBackstageTrunk());
    panel.querySelector('[data-act="trophies"]')?.addEventListener('click', () => void this.enterTrophyVault());
    panel.querySelector('[data-act="options"]')?.addEventListener('click', () => void this.enterOptionsConsole());
    this.viewportHostEl.append(panel);
  }

  // ---- STATE 2: TROPHY_VAULT -----------------------------------------------

  public async enterTrophyVault(): Promise<void> {
    this.setPhase('TROPHY_VAULT');
    this.deps.cameraDirector?.transitionTo('TROPHY_MEDAL_VAULT');
    this.playSymphony('trophy_hall_majesty');
    const theme = this.getStageTheme(this.activeStageId);
    const awards = this.career.getAwardCatalog();

    if (this.deps.trophyVaultView) {
      const handle = this.deps.trophyVaultView.mount(this.viewportHostEl, {
        career: this.career.getState(),
        awards,
        stageTheme: theme,
        onTogglePinMedal: (awardId) => {
          this.playFoley('medal_enamel_clink');
          return this.career.togglePinnedPodiumMedal(awardId);
        },
        onBack: () => {
          this.playFoley('ui_brass_tap');
          void this.enterLobbyHub();
        },
      });
      this.activeViewHandle = handle ?? null;
      return;
    }

    const career = this.career.getState();
    const panel = document.createElement('section');
    panel.className = 'v6-fallback-panel';
    panel.dataset.v6Screen = 'trophies';
    panel.innerHTML = `
      <div>
        <h2 class="v6-fallback-title">HALL OF TROPHIES & CAST MEDALS</h2>
        <p class="v6-fallback-sub">${career.unlockedAwardIds.length} / ${awards.length} Unlocked · Pinned Podium Medals: ${career.pinnedPodiumMedalIds.length}/3</p>
      </div>
      <div class="v6-fallback-grid">
        ${awards
          .slice(0, 6)
          .map((a) => {
            const unlocked = career.unlockedAwardIds.includes(a.awardId);
            return `<button type="button" class="v6-fallback-action" data-award="${a.awardId}">${a.name}<small>${unlocked ? a.engraving : a.unlockRequirement}</small></button>`;
          })
          .join('')}
      </div>
      <button type="button" class="v6-fallback-action" data-act="back">RETURN TO PROSCENIUM LOBBY</button>
    `;
    panel.querySelector('[data-act="back"]')?.addEventListener('click', () => void this.enterLobbyHub());
    this.viewportHostEl.append(panel);
  }

  // ---- STATE 3: OPTIONS_CONSOLE --------------------------------------------

  public async enterOptionsConsole(): Promise<void> {
    this.setPhase('OPTIONS_CONSOLE');
    this.deps.cameraDirector?.transitionTo('OPTIONS_MIXING_BOOTH');
    const theme = this.getStageTheme(this.activeStageId);

    if (this.deps.optionsConsoleView) {
      const handle = this.deps.optionsConsoleView.mount(this.viewportHostEl, {
        options: this.career.getOptions(),
        stageTheme: theme,
        seenClueCount: this.deps.questionEngine?.getSeenCount?.() ?? 0,
        totalCluePool: this.deps.questionEngine?.getTotalPoolSize?.() ?? 1279399,
        onUpdateOptions: (patch) => {
          this.playFoley('neve_fader_detent');
          return this.applyOptionsPatch(patch);
        },
        onAuditionSymphony: (trackId) => {
          this.playFoley('rotary_knob_click');
          this.playSymphony(trackId);
        },
        onResetCampaign: () => {
          this.playFoley('vault_heavy_unlock');
          this.career.resetCampaignProgress();
          this.activeEpisode = getEpisodeBlueprintV6(1);
          this.activeStageId = this.activeEpisode.stageMeta.stageId;
        },
        onWipeClueMemory: async () => {
          this.playFoley('vault_heavy_unlock');
          await this.deps.questionEngine?.wipeSeenMemory?.();
        },
        onGetVuLevels: this.deps.audioEngine?.getChannelLevels
          ? () => this.deps.audioEngine!.getChannelLevels!()
          : undefined,
        onBack: () => {
          this.playFoley('ui_brass_tap');
          void this.enterLobbyHub();
        },
      });
      this.activeViewHandle = handle ?? null;
      return;
    }

    const opts = this.career.getOptions();
    const panel = document.createElement('section');
    panel.className = 'v6-fallback-panel';
    panel.dataset.v6Screen = 'options';
    panel.innerHTML = `
      <div>
        <h2 class="v6-fallback-title">BROADCAST CONTROL DESK</h2>
        <p class="v6-fallback-sub">Resolution: ${opts.resolutionTier} · Shadows: ${opts.shadowQuality} · Camera: ${opts.cameraMotion}</p>
      </div>
      <div class="v6-fallback-grid">
        <button type="button" class="v6-fallback-action" data-tier="ULTRA_3X">3X SUPER RETINA<small>Crisp Ultra-HD 3D</small></button>
        <button type="button" class="v6-fallback-action" data-tier="HIGH_2X">2X HIGH CLARITY<small>Balanced Mobile GPU</small></button>
        <button type="button" class="v6-fallback-action" data-tier="BATTERY_1X">1X BATTERY SAVER<small>Low-Power Mode</small></button>
        <button type="button" class="v6-fallback-action" data-act="back">RETURN TO LOBBY</button>
      </div>
    `;
    panel.querySelectorAll<HTMLButtonElement>('[data-tier]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tier = btn.dataset.tier as BroadcastOptionsStateV6['resolutionTier'];
        this.applyOptionsPatch({ resolutionTier: tier });
        void this.enterOptionsConsole();
      });
    });
    panel.querySelector('[data-act="back"]')?.addEventListener('click', () => void this.enterLobbyHub());
    this.viewportHostEl.append(panel);
  }

  // ---- STATE 4: BACKSTAGE_TRUNK --------------------------------------------

  public async enterBackstageTrunk(): Promise<void> {
    this.setPhase('BACKSTAGE_TRUNK');
    this.deps.stageEngine?.setTrapdoorOpen?.(false);
    this.deps.cameraDirector?.transitionTo('BACKSTAGE_PROP_TRUNK');
    this.playSymphony('backstage_velvet');

    const career = this.career.getState();
    const nextEp = getEpisodeBlueprintV6(this.activeEpisode?.episodeNumber ?? career.currentEpisode);
    this.activeStageId = nextEp.stageMeta.stageId;
    this.refreshTopStageBar();
    const theme = this.getStageTheme(nextEp.stageMeta.stageId);
    const upcomingTwist = FALLBACK_TWISTS_BY_STAGE[(nextEp.stageMeta.stageNumber - 1) % 10];
    const beat = this.deps.showrunner?.pickBackstageBeat(career.matchMemory) ?? null;

    if (this.deps.propTrunk) {
      const handle = this.deps.propTrunk.mountTrunk(this.viewportHostEl, {
        career,
        nextEpisode: nextEp,
        upcomingTwistPreview: upcomingTwist,
        backstageBeat: beat,
        stageTheme: theme,
        onBuyEquipRelic: (relicId, costCash) => {
          const res = this.career.purchaseAndEquipRelic(relicId, costCash);
          if (res.ok) {
            this.playFoley('relic_pedestal_hum');
            this.announceUnlockedAwards(res.newlyUnlockedAwards);
          }
          return res.ok;
        },
        onUnequipRelic: (relicId) => {
          this.playFoley('ui_brass_tap');
          this.career.unequipRelic(relicId);
        },
        onReorderRelics: (fromIdx, toIdx) => {
          this.playFoley('brass_gear_detent');
          this.career.reorderEquippedRelics(fromIdx, toIdx);
        },
        onBuyFoilCard: (card) => {
          const ok = this.career.addFoilCard(card, card.costCash);
          if (ok) this.playFoley('foil_card_flick');
          return ok;
        },
        onExpandRelicSlots: (costCash) => {
          const ok = this.career.expandRelicSlots(costCash);
          if (ok) this.playFoley('vault_heavy_unlock');
          return ok;
        },
        onLaunchNextBroadcast: () => {
          this.playFoley('velvet_trunk_clasp');
          void this.startCampaignEpisode(this.career.getState().currentEpisode);
        },
        onReturnLobby: () => {
          this.playFoley('ui_brass_tap');
          void this.enterLobbyHub();
        },
      });
      this.activeViewHandle = handle ?? null;
      return;
    }

    const panel = document.createElement('section');
    panel.className = 'v6-fallback-panel';
    panel.dataset.v6Screen = 'trunk';
    const beatText = beat ? `${beat.speakerDisplayName}: "${beat.lines.join(' ')}"` : `Frankie: "Next stage is ${nextEp.stageMeta.title}. Stack +Chips left, xMult right."`;
    panel.innerHTML = `
      <div>
        <h2 class="v6-fallback-title">FRANKIE'S BACKSTAGE PROP TRUNK</h2>
        <p class="v6-fallback-sub">${beatText}</p>
      </div>
      <div class="v6-fallback-grid">
        <button type="button" class="v6-fallback-action" data-act="buy-foil">BUY FOIL: SCREW RIVAL ($200)<small>Held Foils: ${career.heldFoilCards.length}/3</small></button>
        <button type="button" class="v6-fallback-action" data-act="launch">STEP ON STAGE: ${nextEp.episodeLabel}<small>Forecast Twist: ${upcomingTwist.replace(/_/g, ' ')}</small></button>
        <button type="button" class="v6-fallback-action" data-act="lobby">RETURN TO LOBBY</button>
      </div>
    `;
    panel.querySelector('[data-act="buy-foil"]')?.addEventListener('click', () => {
      this.career.addFoilCard(
        {
          cardId: `foil_screw_${Date.now()}`,
          name: 'Rigged Screw Switch',
          shortEffect: 'Sabotage Rival accuracy this turn',
          costCash: 200,
          effectKind: 'SCREW_RIVAL',
        },
        200,
      );
      void this.enterBackstageTrunk();
    });
    panel.querySelector('[data-act="launch"]')?.addEventListener('click', () => void this.startCampaignEpisode(nextEp.episodeNumber));
    panel.querySelector('[data-act="lobby"]')?.addEventListener('click', () => void this.enterLobbyHub());
    this.viewportHostEl.append(panel);
  }

  // ---- Campaign / Quick Show / Trapdoor Gauntlet Launchers -----------------

  public async startCampaignEpisode(episodeNumber: number): Promise<void> {
    this.playMode = 'CAMPAIGN';
    this.qaForcedToyNumber = null;
    this.activeEpisode = getEpisodeBlueprintV6(episodeNumber);
    this.activeStageId = this.activeEpisode.stageMeta.stageId;
    this.rivalAI = new RivalStageAIV6(this.activeStageId);

    await this.loadStageAtmosphere(this.activeStageId);
    const boardDef = this.resolveBoardDefinition();
    this.prepareEpisodeRuntime(boardDef);
    await this.enterStageCurtainIntro();
  }

  public async startQuickShow(stageId: StageWorldIdV6): Promise<void> {
    this.playMode = 'QUICK_SHOW';
    this.qaForcedToyNumber = null;
    const meta = getStageMetaByIdV6(stageId);
    this.activeStageId = meta.stageId;
    this.activeEpisode = getEpisodeBlueprintV6(meta.episodes[0]);
    this.rivalAI = new RivalStageAIV6(this.activeStageId);

    await this.loadStageAtmosphere(this.activeStageId);
    const boardDef = this.resolveBoardDefinition();
    this.prepareEpisodeRuntime(boardDef);
    await this.enterStageCurtainIntro();
  }

  public async startTrapdoorGauntlet(): Promise<void> {
    this.playMode = 'TRAPDOOR_GAUNTLET';
    this.episodeMisses = 0;
    this.episodeTrapdoorSurvivals = 0;
    this.boardState = null;
    await this.loadStageAtmosphere(this.activeStageId);
    await this.enterTrapdoorGambit();
  }

  private resolveBoardDefinition(forcedBoardNumber?: number): BoardDefinitionV6 {
    const allBoards = this.deps.boardManager?.getAllBoards() ?? this.fallbackBoards;
    if (forcedBoardNumber !== undefined) {
      const exact =
        this.deps.boardManager?.getBoardByNumber?.(forcedBoardNumber) ??
        allBoards.find((b) => b.boardNumber === forcedBoardNumber);
      if (exact) return exact;
    }
    return this.career.selectNextBoard(allBoards, this.activeStageId, this.rng);
  }

  private prepareEpisodeRuntime(
    boardDef: BoardDefinitionV6,
    forcedTwist?: BoardTwistMutationIdV6,
  ): void {
    const championName = this.rivalAI.getPersonality().displayName;
    this.rivalAI.resetMatchCounters();
    this.career.recordBoardPlayed(boardDef.boardId, boardDef.family);

    this.boardState = this.deps.boardManager?.createRuntimeState
      ? this.deps.boardManager.createRuntimeState(boardDef, championName, this.activeEpisode.turnCount)
      : createFallbackBoardRuntime(boardDef, championName, this.activeEpisode.turnCount);

    this.episodeMisses = 0;
    this.episodeTrapdoorSurvivals = 0;
    this.episodeMaxStreak = 0;
    this.halftimeTwistTriggered = false;
    this.doubleMultArmed = false;
    this.screwRivalArmed = false;
    this.rivalFrozenNextTurn = false;
    this.frozenNodeIds.clear();

    if (forcedTwist && forcedTwist !== 'NONE') {
      this.boardState.activeTwist = forcedTwist;
      this.halftimeTwistTriggered = true;
    } else if (this.activeEpisode.isTitleBout && boardDef.defaultTwist !== 'NONE') {
      this.boardState.activeTwist = boardDef.defaultTwist;
    }

    // Plan opening telegraphed Rival intent before Turn 1
    this.rivalAI.planNextIntent(this.boardState, {
      isTitleBout: this.activeEpisode.isTitleBout,
      rng: this.rng,
    });
  }

  // ---- STATE 5: STAGE_CURTAIN_INTRO ----------------------------------------

  public async enterStageCurtainIntro(): Promise<void> {
    this.setPhase('STAGE_CURTAIN_INTRO');
    this.deps.stageEngine?.setTrapdoorOpen?.(false);
    this.deps.cameraDirector?.transitionTo('BOARD_OVERHEAD_ANGLED');
    const theme = this.getStageTheme(this.activeStageId);
    this.playSymphony(theme.symphonyTrack);
    this.playFoley('crowd_warm_applause');

    const rival = this.rivalAI.getPersonality();
    const boardName = this.boardState?.definition.name ?? 'Studio Contraption';
    const panel = document.createElement('section');
    panel.className = 'v6-fallback-panel';
    panel.dataset.v6Screen = 'curtain-intro';
    panel.innerHTML = `
      <div>
        <h2 class="v6-fallback-title">${this.activeEpisode.episodeLabel}</h2>
        <p class="v6-fallback-sub">Board: ${boardName} · Opponent: ${rival.displayName} (${rival.titleTag})</p>
      </div>
      <div class="v6-fallback-sub">"${rival.introQuips[0]}"</div>
      <button type="button" class="v6-fallback-action" data-act="go">TAKE YOUR PODIUM</button>
    `;
    panel.querySelector('[data-act="go"]')?.addEventListener('click', () => {
      this.playFoley('ui_brass_tap');
      void this.enterBoardTurn();
    });
    this.viewportHostEl.append(panel);
  }

  // ---- STATE 6: BOARD_TURN -------------------------------------------------

  public async enterBoardTurn(): Promise<void> {
    if (!this.boardState) {
      const def = this.resolveBoardDefinition();
      this.prepareEpisodeRuntime(def);
    }
    const board = this.boardState!;
    this.setPhase('BOARD_TURN');
    this.deps.stageEngine?.setTrapdoorOpen?.(false);
    this.deps.cameraDirector?.transitionTo('BOARD_OVERHEAD_ANGLED');
    const theme = this.getStageTheme(this.activeStageId);
    this.playSymphony(theme.symphonyTrack);

    const intent =
      this.rivalAI.getActiveIntent() ??
      this.rivalAI.planNextIntent(board, {
        isTitleBout: this.activeEpisode.isTitleBout,
        frozenNodeIds: Array.from(this.frozenNodeIds),
        rng: this.rng,
      });

    if (this.deps.boardManager) {
      const handle = this.deps.boardManager.mountBoard(
        this.viewportHostEl,
        board,
        theme,
        intent,
        this.career.getState().heldFoilCards,
        {
          onSelectNode: (nodeId) => void this.handlePlayerSelectNode(nodeId),
          onUseFoilCard: (cardId, targetNodeId) => this.handleUseFoilCard(cardId, targetNodeId),
          onRotateRing: (ringIdx, deltaDeg) => {
            this.playFoley('brass_gear_detent');
            if (ringIdx >= 0 && ringIdx < 3) {
              board.ringRotationsDeg[ringIdx] = (board.ringRotationsDeg[ringIdx] + deltaDeg + 360) % 360;
            }
          },
        },
      );
      this.activeViewHandle = handle ?? null;
      return;
    }

    // Zero-scroll fallback interactive board view
    const openNodes = board.nodes.filter((n) => n.owner === 'NONE');
    const panel = document.createElement('section');
    panel.className = 'v6-fallback-panel';
    panel.dataset.v6Screen = 'board';
    panel.innerHTML = `
      <div>
        <h2 class="v6-fallback-title">${board.definition.name}</h2>
        <p class="v6-fallback-sub">YOU $${board.playerTotalCash} vs ${board.rivalName} $${board.rivalTotalCash} · Rival Intent: ${intent.intentBadgeText}</p>
      </div>
      <div class="v6-fallback-grid">
        ${openNodes
          .slice(0, 8)
          .map(
            (n) =>
              `<button type="button" class="v6-fallback-action" data-node="${n.nodeId}">${n.categoryLabel} (+${n.baseChips})<small>x${(1 + n.multBonus).toFixed(1)}${n.lockedChains > 0 ? ` · CHAINED(${n.lockedChains})` : ''}</small></button>`,
          )
          .join('')}
      </div>
    `;
    panel.querySelectorAll<HTMLButtonElement>('[data-node]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.node) void this.handlePlayerSelectNode(btn.dataset.node);
      });
    });
    this.viewportHostEl.append(panel);
  }

  private async handlePlayerSelectNode(nodeId: string): Promise<void> {
    if (!this.boardState) return;
    const node = this.boardState.nodes.find((n) => n.nodeId === nodeId && n.owner === 'NONE');
    if (!node) return;
    this.activeNodeId = node.nodeId;
    this.playFoley('optical_beam_lock');
    await this.enterToyEncounter(this.qaForcedToyNumber ?? undefined);
  }

  private handleUseFoilCard(cardId: string, targetNodeId?: string): void {
    if (!this.boardState) return;
    const { card, newlyUnlockedAwards } = this.career.consumeFoilCard(cardId);
    if (!card) return;
    this.playFoley(card.effectKind === 'SCREW_RIVAL' ? 'screw_rival_slam' : 'foil_card_flick');
    this.announceUnlockedAwards(newlyUnlockedAwards);

    if (this.deps.twistDirector?.applyFoilEffect) {
      const res = this.deps.twistDirector.applyFoilEffect(this.boardState, card, targetNodeId);
      if (res.frozeRival) this.rivalFrozenNextTurn = true;
      if (res.screwedRival) this.screwRivalArmed = true;
      if (res.doubleMult) this.doubleMultArmed = true;
      this.showLiveQuip('FRANKIE', res.message);
    } else {
      // Native tactical Foil execution
      switch (card.effectKind) {
        case 'DOUBLE_MULT':
          this.doubleMultArmed = true;
          this.showLiveQuip('FRANKIE', 'Double multiplier armed for your next clue!');
          break;
        case 'SCREW_RIVAL':
          this.screwRivalArmed = true;
          this.showLiveQuip('FRANKIE', 'Rival buzzer rigged—good luck to them!');
          break;
        case 'FREEZE_NODE':
          if (targetNodeId) this.frozenNodeIds.add(targetNodeId);
          else this.rivalFrozenNextTurn = true;
          this.showLiveQuip('FRANKIE', 'Node frozen solid against the Rival!');
          break;
        case 'SHATTER_CHAINS':
          for (const n of this.boardState.nodes) n.lockedChains = 0;
          this.playFoley('iron_chain_shatter');
          this.showLiveQuip('FRANKIE', 'Every iron chain on the board just snapped!');
          break;
        case 'ROTATE_RING_FREE':
          this.boardState.ringRotationsDeg[0] = (this.boardState.ringRotationsDeg[0] + 60) % 360;
          this.playFoley('brass_gear_detent');
          this.showLiveQuip('FRANKIE', 'Outer brass ring spun on the house!');
          break;
        case 'STEAL_RIVAL_POT': {
          const stolen = Math.min(350, Math.round(this.boardState.rivalTotalCash * 0.25));
          this.boardState.rivalTotalCash -= stolen;
          this.boardState.playerTotalCash += stolen;
          this.showLiveQuip('FRANKIE', `Lifted $${stolen} right off the Rival podium!`);
          break;
        }
        default:
          this.showLiveQuip('FRANKIE', `${card.name} deployed on live air!`);
          break;
      }
    }

    if (this.phase === 'BOARD_TURN') {
      void this.enterBoardTurn();
    }
  }

  // ---- STATE 7: TWIST_MUTATION (Halftime Broadcast Siren Shakeup) ----------

  public async enterTwistMutation(twistId: BoardTwistMutationIdV6): Promise<void> {
    if (!this.boardState) return;
    this.setPhase('TWIST_MUTATION');
    this.halftimeTwistTriggered = true;
    this.boardState.activeTwist = twistId;
    this.playFoley('twist_siren_chime');
    this.deps.stageEngine?.triggerSparkBurst?.('ELECTRIC');

    const summary =
      this.deps.twistDirector?.applyTwistMutation(this.boardState, twistId) ??
      `Stage Mutation Active: ${twistId.replace(/_/g, ' ')}!`;

    this.showLiveQuip('SLOANE', `Compliance Twist triggered: ${twistId.replace(/_/g, ' ')}!`, 3000);

    const panel = document.createElement('section');
    panel.className = 'v6-fallback-panel';
    panel.dataset.v6Screen = 'twist-mutation';
    panel.innerHTML = `
      <div>
        <h2 class="v6-fallback-title">HALFTIME BROADCAST TWIST</h2>
        <p class="v6-fallback-sub">${twistId.replace(/_/g, ' ')} — ${summary}</p>
      </div>
      <button type="button" class="v6-fallback-action" data-act="continue">PLAY THROUGH THE TWIST</button>
    `;
    panel.querySelector('[data-act="continue"]')?.addEventListener('click', () => {
      this.playFoley('ui_brass_tap');
      void this.enterBoardTurn();
    });
    this.viewportHostEl.append(panel);
  }

  // ---- STATE 8: TOY_ENCOUNTER ----------------------------------------------

  public async enterToyEncounter(forcedToyNumber?: number): Promise<void> {
    this.setPhase('TOY_ENCOUNTER');
    this.deps.cameraDirector?.transitionTo('TOY_CLOSEUP_STAGE');
    const theme = this.getStageTheme(this.activeStageId);

    const allToys = this.deps.toyManager?.getAllToys() ?? this.fallbackToys;
    let toy: ToyDefinitionV6;
    if (forcedToyNumber !== undefined) {
      toy =
        this.deps.toyManager?.getToyByNumber?.(forcedToyNumber) ??
        allToys.find((t) => t.toyNumber === forcedToyNumber) ??
        allToys[0];
    } else {
      const preferTwist =
        this.activeEpisode.isTitleBout && (this.boardState?.turnNumber ?? 1) >= this.activeEpisode.turnCount - 1;
      toy = this.career.selectNextToy(allToys, { preferTwist, rng: this.rng });
    }
    this.activeToy = toy;

    const node = this.boardState?.nodes.find((n) => n.nodeId === this.activeNodeId);
    const [minDiff, maxDiff] = this.activeEpisode.difficultyRange;
    const turnProgress = this.boardState
      ? (this.boardState.turnNumber - 1) / Math.max(1, this.boardState.maxTurns - 1)
      : 0;
    const targetDiff = Math.max(
      1.0,
      Math.min(10.0, minDiff + (maxDiff - minDiff) * turnProgress + (node?.difficultyOffset ?? 0)),
    );

    const drawReq: QuestionDrawRequestV6 = {
      stageNumber: this.activeEpisode.stageMeta.stageNumber,
      difficultyTarget: Number(targetDiff.toFixed(2)),
      difficultyBand: this.activeEpisode.stageMeta.difficultyBand,
      domainId: node?.domainId,
      toyFamily: toy.family,
      toyId: toy.toyId,
    };

    this.activeClue = this.deps.questionEngine
      ? await this.deps.questionEngine.drawCalibratedClue(drawReq)
      : createFallbackClue(drawReq);

    if (this.deps.toyManager) {
      const handle = this.deps.toyManager.mountToy(this.viewportHostEl, toy, this.activeClue, {
        stageTheme: theme,
        options: this.career.getOptions(),
        heldFoils: this.career.getState().heldFoilCards,
        onPlayFoil: (cardId) => {
          const { card } = this.career.consumeFoilCard(cardId);
          if (card?.effectKind === 'SWAP_CLUE_TOY') {
            this.playFoley('foil_card_flick');
            void this.enterToyEncounter();
          }
        },
        onPlayFoley: (sfx) => this.playFoley(sfx),
        onResolve: (res) => void this.handleToyResolved(res),
      });
      this.activeViewHandle = handle ?? null;
      return;
    }

    // Zero-scroll fallback Toy screen
    const clue = this.activeClue;
    const panel = document.createElement('section');
    panel.className = 'v6-fallback-panel';
    panel.dataset.v6Screen = 'toy';
    panel.innerHTML = `
      <div>
        <h2 class="v6-fallback-title">${toy.actionCallout} · ${toy.name}</h2>
        <p class="v6-fallback-sub">[${clue.categoryLabel} · ★ ${clue.difficultyScore.toFixed(1)}] ${clue.prompt}</p>
      </div>
      <div class="v6-fallback-grid">
        ${clue.choices
          .map(
            (choice, idx) =>
              `<button type="button" class="v6-fallback-action" data-choice="${idx}">${choice}</button>`,
          )
          .join('')}
      </div>
    `;
    panel.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.choice);
        const correct = idx === clue.correctIndex;
        void this.handleToyResolved({
          correct,
          accuracyRatio: correct ? 1 : 0,
          secondsRemaining: 9.5,
          chipsEarned: correct ? (node?.baseChips ?? 200) : 0,
          multDelta: correct ? 0.5 : 0,
          specificActionTag: correct ? 'toy_clean_hit' : 'toy_missed_clue',
        });
      });
    });
    this.viewportHostEl.append(panel);
  }

  private async handleToyResolved(resolution: ToyResolutionV6): Promise<void> {
    const board = this.boardState;
    const toy = this.activeToy;
    const node = board?.nodes.find((n) => n.nodeId === this.activeNodeId);
    const brokeChain = Boolean(node && node.lockedChains > 0 && resolution.correct);

    if (toy) {
      const unlocked = this.career.recordClueResolution({
        toy,
        resolution,
        brokeLockedChain: brokeChain,
      });
      this.announceUnlockedAwards(unlocked);
    }

    if (resolution.correct) {
      if (board) {
        board.streakCount += 1;
        this.episodeMaxStreak = Math.max(this.episodeMaxStreak, board.streakCount);
        this.playStreakStinger(board.streakCount);

        const baseChips = Math.max(100, resolution.chipsEarned || (node?.baseChips ?? 175));
        const alignedMult = node && board.alignedNodeIds.includes(node.nodeId) ? 3.0 : 1.0;
        const baseMult =
          (1 + (node?.multBonus ?? 0.5) + resolution.multDelta + board.streakCount * 0.25) *
          alignedMult *
          (this.doubleMultArmed ? 2 : 1);
        this.doubleMultArmed = false;

        let cashEarned: number;
        if (this.deps.propTrunk?.evaluateRelicCascade) {
          const cascade = this.deps.propTrunk.evaluateRelicCascade({
            baseChips,
            baseMult,
            equippedRelicIds: this.career.getState().equippedRelicIds,
            clueDomainId: this.activeClue?.domainId ?? 0,
            streakCount: board.streakCount,
            stageId: this.activeStageId,
          });
          board.playerScoreChips += cascade.totalChips;
          board.playerMult = cascade.finalMult;
          cashEarned = cascade.cashEarned;
        } else {
          board.playerScoreChips += baseChips;
          board.playerMult = Number(baseMult.toFixed(2));
          cashEarned = Math.round(baseChips * board.playerMult);
        }

        board.playerTotalCash += cashEarned;
        if (node) {
          node.owner = 'PLAYER';
          node.lockedChains = 0;
        }
        this.playFoley(brokeChain ? 'iron_chain_shatter' : 'crystal_hex_claim');
        this.deps.stageEngine?.triggerSparkBurst?.('GOLD');
      }

      const quip = this.deps.showrunner?.pickLiveQuip(
        [resolution.specificActionTag, 'clue_hit'],
        this.career.getMatchMemory(),
      );
      if (quip) {
        this.showLiveQuip(quip.speakerDisplayName, quip.lines[0]);
      } else if (this.activeClue?.wittyHostAside) {
        this.showLiveQuip('JULIAN', this.activeClue.wittyHostAside);
      }

      await this.advanceAfterPlayerResolution();
      return;
    }

    // Wrong Answer -> Trigger 8-Second 3D Stage Trapdoor Gambit!
    this.episodeMisses += 1;
    await this.enterTrapdoorGambit();
  }

  // ---- STATE 9: TRAPDOOR_GAMBIT (8-Second Survival Pit on Wrong Clues!) ----

  public async enterTrapdoorGambit(): Promise<void> {
    this.setPhase('TRAPDOOR_GAMBIT');
    this.playFoley('trapdoor_hinge_drop');
    this.deps.stageEngine?.setTrapdoorOpen?.(true);
    this.deps.cameraDirector?.transitionTo('TRAPDOOR_PIT_PLUNGE');
    this.playSymphony('trapdoor_survival_blitz');

    const pool = this.deps.trapdoorEngine?.getTrapdoorIds?.() ?? FALLBACK_TRAPDOOR_IDS;
    const trapdoorId = this.career.selectNextTrapdoorId(pool, this.rng);
    this.activeTrapdoorId = trapdoorId;
    const theme = this.getStageTheme(this.activeStageId);

    if (this.deps.trapdoorEngine) {
      const handle = this.deps.trapdoorEngine.mountTrapdoor(this.viewportHostEl, {
        trapdoorId,
        stageTheme: theme,
        options: this.career.getOptions(),
        onPlayFoley: (sfx) => this.playFoley(sfx),
        onComplete: (res) => void this.handleTrapdoorCompleted(res),
      });
      this.activeViewHandle = handle ?? null;
      return;
    }

    // Zero-scroll fallback 8s Trapdoor Survival Pit
    const panel = document.createElement('section');
    panel.className = 'v6-fallback-panel';
    panel.dataset.v6Screen = 'trapdoor';
    panel.innerHTML = `
      <div>
        <h2 class="v6-fallback-title">STAGE TRAPDOOR GAMBIT (8S PIT!)</h2>
        <p class="v6-fallback-sub">Pit Challenge: ${trapdoorId.replace(/_/g, ' ').toUpperCase()} — Survive to save your xMult streak!</p>
      </div>
      <div class="v6-fallback-grid">
        <button type="button" class="v6-fallback-action" data-survive="1">CLUTCH SURVIVAL ESCAPE<small>Keep xMult Streak + Salvage Chips</small></button>
        <button type="button" class="v6-fallback-action" data-survive="0">TAKE THE DROP<small>Reset Streak & Climb Back Up</small></button>
      </div>
    `;
    panel.querySelector('[data-survive="1"]')?.addEventListener('click', () => {
      void this.handleTrapdoorCompleted({ trapdoorId, survived: true, secondsRemaining: 1.2 });
    });
    panel.querySelector('[data-survive="0"]')?.addEventListener('click', () => {
      void this.handleTrapdoorCompleted({ trapdoorId, survived: false, secondsRemaining: 0 });
    });
    this.viewportHostEl.append(panel);
  }

  private async handleTrapdoorCompleted(result: TrapdoorResultV6): Promise<void> {
    this.deps.stageEngine?.setTrapdoorOpen?.(false);
    const unlocked = this.career.recordTrapdoorResult({
      trapdoorId: result.trapdoorId,
      survived: result.survived,
      secondsRemaining: result.secondsRemaining,
    });
    this.announceUnlockedAwards(unlocked);

    if (result.survived) {
      this.episodeTrapdoorSurvivals += 1;
      this.playFoley('crowd_studio_roar');
      if (this.boardState) {
        const node = this.boardState.nodes.find((n) => n.nodeId === this.activeNodeId);
        const salvage = Math.round((node?.baseChips ?? 150) * 0.4);
        this.boardState.playerTotalCash += salvage;
      }
      this.showLiveQuip('JULIAN', 'Climbed right out of the clockwork pit—streak still alive!');
    } else {
      this.playFoley('crowd_collective_gasp');
      if (this.boardState) {
        this.boardState.streakCount = 0;
        this.boardState.rivalTotalCash += 120 * this.activeEpisode.stageMeta.stageNumber;
      }
      this.showLiveQuip('JULIAN', 'Down goes the streak! Sloane is smiling in the booth.');
    }

    if (this.playMode === 'TRAPDOOR_GAUNTLET') {
      if (result.survived) {
        await this.enterTrapdoorGambit();
      } else {
        await this.enterLobbyHub();
      }
      return;
    }

    await this.advanceAfterPlayerResolution();
  }

  // ---- Turn Advancement, Rival Turn & Halftime Twist Choreography ----------

  private async advanceAfterPlayerResolution(): Promise<void> {
    const board = this.boardState;
    if (!board) {
      await this.enterLobbyHub();
      return;
    }

    // Execute Stage Champion Rival AI turn
    const rivalTurn: RivalTurnExecutionResultV6 = this.rivalAI.executeTurn(board, {
      isTitleBout: this.activeEpisode.isTitleBout,
      playerScrewedRival: this.screwRivalArmed,
      rivalFrozenThisTurn: this.rivalFrozenNextTurn,
      frozenNodeIds: Array.from(this.frozenNodeIds),
      rng: this.rng,
    });
    this.screwRivalArmed = false;
    this.rivalFrozenNextTurn = false;

    if (rivalTurn.barkLine) {
      this.showLiveQuip(rivalTurn.championName, rivalTurn.barkLine, 2600);
    }

    const openRemaining = board.nodes.filter((n) => n.owner === 'NONE').length;
    if (board.turnNumber >= board.maxTurns || openRemaining === 0) {
      await this.concludeEpisode();
      return;
    }

    board.turnNumber += 1;

    // Fire Halftime Twist Mutation on Turn 3 (if not yet active)
    if (!this.halftimeTwistTriggered && board.turnNumber === this.activeEpisode.halftimeTurn) {
      const twistId =
        this.deps.twistDirector?.pickHalftimeTwist(board, this.activeStageId) ??
        (board.definition.defaultTwist !== 'NONE'
          ? board.definition.defaultTwist
          : FALLBACK_TWISTS_BY_STAGE[(this.activeEpisode.stageMeta.stageNumber - 1) % 10]);
      await this.enterTwistMutation(twistId);
      return;
    }

    await this.enterBoardTurn();
  }

  // ---- STATE 10: EPISODE_CEREMONY ------------------------------------------

  private async concludeEpisode(): Promise<void> {
    const board = this.boardState!;
    const won = board.playerTotalCash >= board.rivalTotalCash;
    const purseAwarded = won
      ? this.activeEpisode.basePurseCash + Math.round(board.playerTotalCash * 0.25)
      : Math.round(this.activeEpisode.basePurseCash * 0.35);

    const outcome =
      this.playMode === 'CAMPAIGN'
        ? this.career.recordEpisodeOutcome({
            episodeNumber: this.activeEpisode.episodeNumber,
            won,
            cashEarned: purseAwarded,
            episodeMisses: this.episodeMisses,
            hadActiveTwist: board.activeTwist !== 'NONE',
            activeTwistId: board.activeTwist,
            boardId: board.definition.boardId,
          })
        : {
            newlyUnlockedAwards: (() => {
              this.career.adjustBankroll(purseAwarded);
              return this.career.evaluateAndUnlockAwards({ kind: 'EPISODE_FINISHED', wonEpisode: won });
            })(),
            unlockedStage: null,
            expandedRelicSlots: false,
          };

    const summary: CeremonySummaryV6 = {
      episode: this.activeEpisode,
      mode: this.playMode,
      won,
      playerCash: board.playerTotalCash,
      rivalCash: board.rivalTotalCash,
      rivalName: board.rivalName,
      purseAwarded,
      maxStreak: this.episodeMaxStreak,
      episodeMisses: this.episodeMisses,
      trapdoorsSurvived: this.episodeTrapdoorSurvivals,
      newlyUnlockedAwards: outcome.newlyUnlockedAwards,
      unlockedStage: outcome.unlockedStage,
      expandedRelicSlots: outcome.expandedRelicSlots,
    };
    this.lastCeremony = summary;
    if (this.playMode === 'CAMPAIGN' && won) {
      this.activeEpisode = getEpisodeBlueprintV6(this.career.getState().currentEpisode);
    }
    this.announceUnlockedAwards(outcome.newlyUnlockedAwards);
    await this.enterEpisodeCeremony(summary);
  }

  public async enterEpisodeCeremony(summary: CeremonySummaryV6): Promise<void> {
    this.setPhase('EPISODE_CEREMONY');
    this.deps.cameraDirector?.transitionTo('VICTORY_PODIUM_CEREMONY');
    this.playSymphony(summary.won ? 'crown_victory_fanfare' : 'backstage_velvet');
    this.playFoley(summary.won ? 'crowd_studio_roar' : 'crowd_warm_applause');

    const theme = this.getStageTheme(this.activeStageId);

    if (this.deps.ceremonyView) {
      const handle = this.deps.ceremonyView.mount(this.viewportHostEl, {
        summary,
        stageTheme: theme,
        onGoToTrunk: () => {
          this.playFoley('velvet_trunk_clasp');
          void this.enterBackstageTrunk();
        },
        onPlayNextOrRematch: () => {
          this.playFoley('ui_brass_tap');
          void this.startCampaignEpisode(this.career.getState().currentEpisode);
        },
        onReturnLobby: () => {
          this.playFoley('ui_brass_tap');
          void this.enterLobbyHub();
        },
      });
      this.activeViewHandle = handle ?? null;
      return;
    }

    const panel = document.createElement('section');
    panel.className = 'v6-fallback-panel';
    panel.dataset.v6Screen = 'ceremony';
    panel.innerHTML = `
      <div>
        <h2 class="v6-fallback-title">${summary.won ? 'BROADCAST VICTORY!' : 'CURTAIN FALL — REMATCH READY'}</h2>
        <p class="v6-fallback-sub">YOU $${summary.playerCash} vs ${summary.rivalName} $${summary.rivalCash} · Purse +$${summary.purseAwarded}</p>
      </div>
      <div class="v6-fallback-grid">
        <button type="button" class="v6-fallback-action" data-act="trunk">VISIT FRANKIE'S PROP TRUNK<small>Spend Warm Cash on Relics & Foils</small></button>
        <button type="button" class="v6-fallback-action" data-act="next">${summary.won ? 'NEXT EPISODE' : 'REMATCH STAGE'}<small>Fresh Non-Repeating Board & Toys</small></button>
        <button type="button" class="v6-fallback-action" data-act="lobby">RETURN TO LOBBY</button>
      </div>
    `;
    panel.querySelector('[data-act="trunk"]')?.addEventListener('click', () => void this.enterBackstageTrunk());
    panel.querySelector('[data-act="next"]')?.addEventListener('click', () =>
      void this.startCampaignEpisode(this.career.getState().currentEpisode),
    );
    panel.querySelector('[data-act="lobby"]')?.addEventListener('click', () => void this.enterLobbyHub());
    this.viewportHostEl.append(panel);
  }

  // ---- Cleanup -------------------------------------------------------------

  private ensureShellStylesheet(): void {
    if (typeof document === 'undefined') return;
    if (document.getElementById(DIRECTOR_SHELL_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = DIRECTOR_SHELL_STYLE_ID;
    style.textContent = DIRECTOR_SHELL_CSS;
    document.head.appendChild(style);
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.disposeActiveView();
    this.unsubscribeCareer();
    if (typeof window !== 'undefined') {
      if (this.quipTimeoutId !== null) window.clearTimeout(this.quipTimeoutId);
      if (this.toastTimeoutId !== null) window.clearTimeout(this.toastTimeoutId);
      if (window.__WS_V6_DIRECTOR__) {
        delete window.__WS_V6_DIRECTOR__;
      }
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('fullscreenchange', this.onFullscreenChangeBound);
      document.removeEventListener('webkitfullscreenchange', this.onFullscreenChangeBound);
    }
    this.deps.stageEngine?.dispose?.();
    this.deps.audioEngine?.dispose?.();
  }
}
