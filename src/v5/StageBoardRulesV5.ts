// ============================================================================
// WORLD'S SMARTEST v5.0 — Stage Board, 14 Playable Board Topologies & Twists,
// "SCREW RIVAL!", Row/Column Stage Sweep Jackpots & 12 Podium Lucky Charms
// Pure TypeScript rules engine wrapping & extending BoardEngine.ts,
// ChallengerAI.ts, and ScoringV4.ts with strict 1:1 score conservation and
// zero-soft-lock mathematical guarantees across all 14 board topologies.
// ============================================================================

import type { DomainId } from '../forge/types';
import {
  WEDGE_CATALOG_V4,
  domainToWedgeColor,
  type BoardTileStatus,
  type BoardTileV4,
  type BoardTopologyKind,
  type ChallengerProfileV4,
  type EvaluatedAnswerV4,
  type PlayerStatProfileForHost,
  type QuestionFormatV4,
  type StageBoardStateV4,
  type TileTwistKind,
  type WedgeColorId,
  type WheelSliceOutcome,
} from '../v4/contracts';
import {
  ALL_DOMAIN_IDS_V4,
  ALL_QUESTION_FORMATS_V4,
  ALL_WEDGE_IDS_V4,
  DOMAIN_TOPIC_SUBTITLE_V4,
  consumeBoardLifeline,
  createSeededRng,
  createStageBoard,
  ensurePlayableTilesOrStageSurge,
  getBoardDimensions,
  getPlayableTiles,
  getTileById,
  isUnplayedTileStatus,
  resolveTileResult,
  spinCurveballWheel,
  verifyBoardReachability,
  type CreateStageBoardConfigV4,
  type DraftedColumnSpecV4,
  type ResolveTileOptionsV4,
  type ResolveTileOutcomeV4,
  type WheelSpinResultV4,
} from '../v4/BoardEngine';
import {
  buildCategoryDraftPool,
  finalizeDraftToBoardColumns,
  runChallengerTurn,
  type BuildCategoryDraftPoolOptionsV4,
  type CategoryDraftStateV4,
  type ChallengerTurnResultV4,
} from '../v4/ChallengerAI';
import {
  DOUBLE_DOWN_MISS_FRACTION_V4,
  NON_BOARD_BASE_POINTS_V4,
  applyScoreDelta,
  reconcileEvaluatedAnswerForBoard,
  type ScoreResolutionV4,
  type WheelActiveEffectV4,
} from '../v4/ScoringV4';
import type {
  CampaignNodeV5,
  ChallengerIdV5,
  CharmIdV5,
  PodiumCharmSpecV5,
} from './contracts_v5';

// ============================================================================
// 1. V5 RULE CONSTANTS, VISUAL TWIST TAGS & 14-TOPOLOGY CATALOG
// ============================================================================

/** Minimum distinct QuestionFormatV4 types enforced on EVERY v5 board (bans all-CLASSIC forever!). */
export const MIN_DISTINCT_FORMATS_PER_BOARD_V5 = 4;

/** Honest 1:1 Stage Sweep Jackpot payout when completing a full Row or full Column. */
export const LINE_SWEEP_JACKPOT_POINTS_V5 = 300;

/** Maximum Podium Lucky Charms equippable simultaneously on the stage podium. */
export const MAX_EQUIPPED_CHARMS_V5 = 3;

/** Domains considered History / Literature for Denise's Red Pen (`denises_red_pen`). */
export const HISTORY_AND_LIT_DOMAIN_IDS_V5: readonly DomainId[] = [0, 10] as const;

/** Honest 1:1 point constants for the 14 distinct v5 Board Topologies & Twists. */
export const BOARD_TWIST_BONUS_V5 = {
  spiralCoreTargetPoints: 1000,
  pyramidApexTargetPoints: 1000,
  hotPotatoDefuseBonus: 250,
  hotPotatoBlastRivalSpoils: 150,
  hotPotatoInitialFuseTurns: 2,
  tugOfWarMajorityBonus: 500,
  spotlightForcedPoiseBonus: 100,
  powerPlayMinefieldBonus: 100,
  flameThawBonus: 200,
  oxfordPlayerPickBonus: 75,
  oxfordRivalPickUpsetBonus: 125,
  gauntletCrownSurgeBonus: 200,
} as const;

/** Charm balance constants (single source of truth for UI tooltips & runtime math). */
export const CHARM_VALUES_V5 = {
  trevorsHotMicBonus: 75,
  priyasAdrenalineBonus: 120,
  priyasAdrenalineMaxSecRemaining: 5,
  alistairsPocketwatchBonusSec: 8,
  kenjisCyberLinkBonus: 150,
  kenjisCyberLinkMaxElapsedSec: 6,
  nadiasAstrolabeWedgeBonus: 150,
  grassrootsMegaphoneExtraClues: 1,
  syndicateGoldenDicePowerPlayRate: 0.25,
  velvetWaxSealExtraScrews: 1,
  underdogChipTrailingBonus: 100,
  screwShieldCharges: 1,
} as const;

export type VisualTwistTagV5 =
  | 'NONE'
  | 'PADLOCK'
  | 'WHEEL_TRIGGER'
  | 'LIGHTNING_BLITZ'
  | 'CROWN_WEDGE'
  | 'POWER_PLAY'
  | 'RIVAL_BOUNTY'
  | 'SPOTLIGHT_SWEEP';

/**
 * All 14 distinct playable v5 Board Topologies & Live Stage Twists aligned 1:1 with
 * `LivingStageBoardView.ts` and the 88-node branching campaign JSON packs.
 */
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

export interface BoardTopologySpecV5 {
  readonly twistId: BoardTwistIdV5;
  readonly label: string;
  readonly shortPill: string;
  readonly campaignTopology: CampaignNodeV5['topology'];
  readonly v4Topology: BoardTopologyKind;
  readonly defaultCols: 4 | 5 | 6;
  readonly defaultRows: 3 | 4;
  readonly ruleHook: string;
  readonly hostIntroCue: string;
}

export const ALL_BOARD_TWIST_IDS_V5: readonly BoardTwistIdV5[] = [
  'showcase_starter',
  'chain_padlocks',
  'spiral_labyrinth',
  'pyramid_ascent',
  'fog_spotlight',
  'time_bomb_hot_potato',
  'tug_of_war_turf',
  'velvet_x_crossroads',
  'spotlight_roulette',
  'power_play_minefield',
  'ice_fire_columns',
  'gold_fever_contagion',
  'oxford_pick_ban',
  'championship_gauntlet',
] as const;

export const BOARD_TOPOLOGIES_CATALOG_V5: Readonly<Record<BoardTwistIdV5, BoardTopologySpecV5>> = {
  showcase_starter: {
    twistId: 'showcase_starter',
    label: 'SHOWCASE STAGE',
    shortPill: 'SHOWCASE',
    campaignTopology: 'OPEN_TRYOUT',
    v4Topology: 'OPEN_CLASSIC',
    defaultCols: 4,
    defaultRows: 3,
    ruleHook: 'Wide-open opening showcase with chained corner Crown Vaults, Wheel spins, and +300 line sweeps.',
    hostIntroCue: 'Forty-two folding chairs, a sticky brass mic, and two chained corner Crown Vaults waiting to pop.',
  },
  chain_padlocks: {
    twistId: 'chain_padlocks',
    label: 'CHAIN-REACTION VAULTS',
    shortPill: 'CHAIN VAULTS',
    campaignTopology: 'PADLOCK_NEIGHBORS',
    v4Topology: 'PADLOCK_NEIGHBORS',
    defaultCols: 4,
    defaultRows: 4,
    ruleHook: 'Crack neighboring iron chains on every solve; hold a 2+ streak to snap an extra chain link per hit.',
    hostIntroCue: 'Heavy hardware tonight — nail two straight and the shockwave snaps a bonus padlock across the rig.',
  },
  spiral_labyrinth: {
    twistId: 'spiral_labyrinth',
    label: 'SPIRAL LABYRINTH · 1,000 PT CORE',
    shortPill: 'LABYRINTH',
    campaignTopology: 'PADLOCK_NEIGHBORS',
    v4Topology: 'PADLOCK_NEIGHBORS',
    defaultCols: 5,
    defaultRows: 4,
    ruleHook: 'Outer ring starts open; carve inward through locked vaults to claim the 1,000-PT Spiral Core.',
    hostIntroCue: 'Start on the outer apron and drill inward — dead center sits a locked 1,000-point Core.',
  },
  pyramid_ascent: {
    twistId: 'pyramid_ascent',
    label: 'PYRAMID ASCENT · SUMMIT CROWN',
    shortPill: 'PYRAMID',
    campaignTopology: 'PADLOCK_NEIGHBORS',
    v4Topology: 'PADLOCK_NEIGHBORS',
    defaultCols: 5,
    defaultRows: 4,
    ruleHook: 'Base row starts open; climb upward shattering locks to reach the 1,000-PT Crown Summit at the apex.',
    hostIntroCue: 'Flip your usual instincts upside down — tonight we start at the floor and climb to a 1,000-point Summit.',
  },
  fog_spotlight: {
    twistId: 'fog_spotlight',
    label: 'FOG-OF-WAR SPOTLIGHT',
    shortPill: 'STAGE FOG',
    campaignTopology: 'FOG_EXPLORER',
    v4Topology: 'FOG_CROSSROADS',
    defaultCols: 5,
    defaultRows: 4,
    ruleHook: 'Thick theater haze shrouds the flanks; every solved tile swings an 8-neighbor spotlight cone through the fog.',
    hostIntroCue: 'Stage crew went heavy on the dry ice — every answer cuts an eight-tile beam right through the haze.',
  },
  time_bomb_hot_potato: {
    twistId: 'time_bomb_hot_potato',
    label: 'TIME-BOMB HOT POTATO',
    shortPill: 'HOT POTATO',
    campaignTopology: 'SPOTLIGHT_ROULETTE',
    v4Topology: 'SPOTLIGHT_ROULETTE',
    defaultCols: 4,
    defaultRows: 4,
    ruleHook: 'Defuse the ticking Hot Potato tile before its 2-turn fuse hits 0 for +250 PTS, or Rival pockets +150 blast spoils.',
    hostIntroCue: 'Hear that brass kitchen timer? Defuse the sizzling tile before two turns lapse for +250, or eat the blast.',
  },
  tug_of_war_turf: {
    twistId: 'tug_of_war_turf',
    label: 'TERRITORY TURF · +500 MAJORITY',
    shortPill: 'TURF WAR',
    campaignTopology: 'SPOTLIGHT_ROULETTE',
    v4Topology: 'SPOTLIGHT_ROULETTE',
    defaultCols: 5,
    defaultRows: 4,
    ruleHook: 'Every cleared tile shifts the Turf Meter; hold strictly more tiles at the final buzzer for a +500 PTS majority payout.',
    hostIntroCue: 'Points matter, sure, but real estate pays the rent — hold more tiles at the bell for +500 bonus points.',
  },
  velvet_x_crossroads: {
    twistId: 'velvet_x_crossroads',
    label: 'VELVET X-CROSSROADS · 2x DIAGONALS',
    shortPill: 'X-ROADS 2x',
    campaignTopology: 'CROSSROADS_HYBRID',
    v4Topology: 'CHALLENGER_GAUNTLET',
    defaultCols: 4,
    defaultRows: 4,
    ruleHook: 'Crimson-and-gold X-diagonal tracks pay honest 2x base points on every tile along both diagonals.',
    hostIntroCue: 'Candlelight rules in the Velvet Salon — anything sitting on the crimson X pays double straight to your tally.',
  },
  spotlight_roulette: {
    twistId: 'spotlight_roulette',
    label: 'SPOTLIGHT ROULETTE SWEEP',
    shortPill: 'SPOTLIGHT',
    campaignTopology: 'SPOTLIGHT_ROULETTE',
    v4Topology: 'SPOTLIGHT_ROULETTE',
    defaultCols: 5,
    defaultRows: 4,
    ruleHook: 'Overhead follow-spots hijack your pick on alternating turns; survive any forced spotlight clue for +100 PTS poise bonus.',
    hostIntroCue: 'No hiding in comfort categories — when the follow-spot pins a tile, nail it for an extra +100 poise bonus.',
  },
  power_play_minefield: {
    twistId: 'power_play_minefield',
    label: 'POWER-PLAY MINEFIELD',
    shortPill: 'MINEFIELD',
    campaignTopology: 'CROSSROADS_HYBRID',
    v4Topology: 'CHALLENGER_GAUNTLET',
    defaultCols: 5,
    defaultRows: 4,
    ruleHook: 'Four concealed Power-Play wagers lurk across the grid; cash any hidden wager for an extra +100 PTS nerve bonus.',
    hostIntroCue: 'Four hidden Power Plays buried under live enamel — step carefully, wager big, and pocket +100 nerve bonus on hits.',
  },
  ice_fire_columns: {
    twistId: 'ice_fire_columns',
    label: 'ICE & FIRE COLUMNS · THAW +200',
    shortPill: 'ICE & FIRE',
    campaignTopology: 'PADLOCK_NEIGHBORS',
    v4Topology: 'PADLOCK_NEIGHBORS',
    defaultCols: 5,
    defaultRows: 4,
    ruleHook: 'Frozen Ice columns stay sealed for 3 turns unless you solve a glowing Flame-Thaw tile to melt the board for +200 PTS.',
    hostIntroCue: 'The left flank is frozen solid — pop a glowing Flame tile to melt the ice early and bank +200 thermal bonus.',
  },
  gold_fever_contagion: {
    twistId: 'gold_fever_contagion',
    label: 'GOLD FEVER CONTAGION · 2x SPREAD',
    shortPill: 'GOLD FEVER',
    campaignTopology: 'SPOTLIGHT_ROULETTE',
    v4Topology: 'SPOTLIGHT_ROULETTE',
    defaultCols: 5,
    defaultRows: 4,
    ruleHook: 'Gold Fever tiles pay 2x base points; hitting a Gold tile or a 2+ streak spreads 2x Gold Fever to neighboring tiles.',
    hostIntroCue: 'One tile caught Gold Fever at 2x value — string two hits together and watch the gold jump across the brass.',
  },
  oxford_pick_ban: {
    twistId: 'oxford_pick_ban',
    label: 'OXFORD PICK & BAN DRAFT',
    shortPill: 'OXFORD DRAFT',
    campaignTopology: 'CROSSROADS_HYBRID',
    v4Topology: 'CHALLENGER_GAUNTLET',
    defaultCols: 5,
    defaultRows: 4,
    ruleHook: 'Pre-match Pick & Ban draft columns: +75 PTS on your own drafted columns, +125 PTS upset bonus on Rival-picked turf.',
    hostIntroCue: 'Gentlemen and scholars drafted the board backstage — +75 on your own picks, +125 if you raid rival turf.',
  },
  championship_gauntlet: {
    twistId: 'championship_gauntlet',
    label: '6-COLUMN CHAMPIONSHIP GAUNTLET',
    shortPill: 'GAUNTLET',
    campaignTopology: 'FINALE_GAUNTLET',
    v4Topology: 'GRAND_FINALE_VAULT',
    defaultCols: 6,
    defaultRows: 4,
    ruleHook: 'Six columns spanning all 6 Color Wedges, fogged flanks, chained Crown Vaults, a 2x Gold keystone, and +200 Crown Surge on Wedge 4+.',
    hostIntroCue: 'Six columns, all six Crown Wedges, chained vaults, and a billion living rooms tuned in — leave nothing on the lectern.',
  },
};

export const BOARD_TOPOLOGIES_LIST_V5: readonly BoardTopologySpecV5[] = ALL_BOARD_TWIST_IDS_V5.map(
  (id) => BOARD_TOPOLOGIES_CATALOG_V5[id],
);

export function getBoardTopologySpecV5(twistId: BoardTwistIdV5): BoardTopologySpecV5 {
  return BOARD_TOPOLOGIES_CATALOG_V5[twistId];
}

/**
 * Returns the v5 visual twist badge tag for a board tile so UI views can cleanly
 * render chains (`PADLOCK`), `WHEEL_TRIGGER`, `LIGHTNING_BLITZ`, `CROWN_WEDGE`,
 * `POWER_PLAY`, or `RIVAL_BOUNTY` without ever falling back to a flat "CLASSIC" label.
 */
export function getTileVisualTwistTagV5(tile: BoardTileV4): VisualTwistTagV5 {
  if (tile.status === 'PADLOCKED') {
    return 'PADLOCK';
  }
  switch (tile.twist) {
    case 'WHEEL_CURVEBALL':
      return 'WHEEL_TRIGGER';
    case 'LIGHTNING_BLITZ':
      return 'LIGHTNING_BLITZ';
    case 'CROWN_WEDGE':
      return 'CROWN_WEDGE';
    case 'POWER_PLAY':
      return 'POWER_PLAY';
    case 'RIVAL_BOUNTY':
      return 'RIVAL_BOUNTY';
    case 'SPOTLIGHT_SWEEP':
      return 'SPOTLIGHT_SWEEP';
    case 'NONE':
    default:
      return 'NONE';
  }
}

export function isHistoryOrLitDomainV5(domainId: DomainId): boolean {
  return HISTORY_AND_LIT_DOMAIN_IDS_V5.includes(domainId);
}

// ============================================================================
// 2. ALL 12 PODIUM LUCKY CHARMS CATALOG (Balatro x Queen's Gambit)
// ============================================================================

export const ALL_PODIUM_CHARM_IDS_V5: readonly CharmIdV5[] = [
  'frankies_coaster',
  'denises_red_pen',
  'trevors_hot_mic',
  'priyas_adrenaline',
  'alistairs_pocketwatch',
  'kenjis_cyber_link',
  'nadias_astrolabe',
  'grassroots_megaphone',
  'syndicate_golden_dice',
  'velvet_wax_seal',
  'underdog_chip',
  'screw_shield',
] as const;

export const PODIUM_CHARMS_CATALOG_V5: Readonly<Record<CharmIdV5, PodiumCharmSpecV5>> = {
  frankies_coaster: {
    charmId: 'frankies_coaster',
    name: "Frankie's Coaster",
    tagline: 'Ring-stained cardboard from stool four — first spilled double is on the house.',
    effectSummary: 'Your first missed 2x Double Down each match incurs 0 penalty.',
    originSource: 'Frankie "Last Call" Russo Alliance (Act I)',
    accentHex: '#f59e0b',
    svgEmblemKind: 'coaster',
  },
  denises_red_pen: {
    charmId: 'denises_red_pen',
    name: "Denise's Red Pen",
    tagline: 'Thirty-four years of AP margins distilled into one ruthless crimson slash.',
    effectSummary: 'Automatically eliminates 1 wrong option on History & Literature questions.',
    originSource: 'Denise Park Alliance (Act I)',
    accentHex: '#ef4444',
    svgEmblemKind: 'fountain_pen',
  },
  trevors_hot_mic: {
    charmId: 'trevors_hot_mic',
    name: "Trevor's Hot Mic",
    tagline: 'Clip-on Channel 7 lapel condenser that still hums when the crowd gets loud.',
    effectSummary: '+75 bonus points on every correct answer while on an active streak.',
    originSource: 'Trevor "14-Day" Blake Alliance (Act II)',
    accentHex: '#38bdf8',
    svgEmblemKind: 'mic',
  },
  priyas_adrenaline: {
    charmId: 'priyas_adrenaline',
    name: "Priya's Adrenaline",
    tagline: 'Scuffed trauma-bay stop-timer built for steady palms in the final five seconds.',
    effectSummary: '+120 clutch bonus when you answer correctly with 5s or less remaining.',
    originSource: 'Dr. Priya Nair Alliance (Act II)',
    accentHex: '#10b981',
    svgEmblemKind: 'pulse',
  },
  alistairs_pocketwatch: {
    charmId: 'alistairs_pocketwatch',
    name: "Alistair's Pocketwatch",
    tagline: 'Engraved 1923 brass repeater wound tight at Magdalen College.',
    effectSummary: '+8 seconds added to the Shot Clock on every timed clue.',
    originSource: 'Lord Alistair Finch Alliance (Act III)',
    accentHex: '#fbbf24',
    svgEmblemKind: 'watch',
  },
  kenjis_cyber_link: {
    charmId: 'kenjis_cyber_link',
    name: "Kenji's Cyber-Link",
    tagline: 'Custom Akihabara micro-switch keycap calibrated for sub-six-second locks.',
    effectSummary: '+150 fast-lock bonus when you answer correctly in under 6 seconds.',
    originSource: 'Kenji "Zero-Lag" Takahashi Alliance (Act III)',
    accentHex: '#06b6d4',
    svgEmblemKind: 'circuit',
  },
  nadias_astrolabe: {
    charmId: 'nadias_astrolabe',
    name: "Nadia's Astrolabe",
    tagline: 'Hand-etched Cairo brass compass aligned with the six Crown Wedges.',
    effectSummary: '+150 bonus points whenever you win a Crown Wedge tile.',
    originSource: 'Nadia Al-Mansoor Alliance (Act IV)',
    accentHex: '#a78bfa',
    svgEmblemKind: 'astrolabe',
  },
  grassroots_megaphone: {
    charmId: 'grassroots_megaphone',
    name: 'Grassroots Megaphone',
    tagline: 'Dented tin bullhorn from Oakridge night one — the back row always spots a hint.',
    effectSummary: 'Start every match with +1 extra Studio Clue coin.',
    originSource: 'Independent Circuit Sponsor Track',
    accentHex: '#34d399',
    svgEmblemKind: 'megaphone',
  },
  syndicate_golden_dice: {
    charmId: 'syndicate_golden_dice',
    name: 'Syndicate Golden Dice',
    tagline: 'Weighted studio-executive brass cubes minted for prime-time high rollers.',
    effectSummary: '+25% extra payout whenever you win a Power Play wager.',
    originSource: 'Apex Network Prime-Time Sponsor Dare',
    accentHex: '#f5c451',
    svgEmblemKind: 'dice',
  },
  velvet_wax_seal: {
    charmId: 'velvet_wax_seal',
    name: 'Velvet Wax Seal',
    tagline: 'Burgundy signet ring granting one extra red buzzer behind closed doors.',
    effectSummary: 'Start every rival match with +1 extra SCREW RIVAL! token.',
    originSource: 'Secret Velvet Salon Invitation',
    accentHex: '#e11d48',
    svgEmblemKind: 'seal',
  },
  underdog_chip: {
    charmId: 'underdog_chip',
    name: 'Underdog Chip',
    tagline: 'Chipped diner-booth poker token carried out of the 2 AM redemption lane.',
    effectSummary: '+100 comeback bonus on every correct answer while trailing your rival.',
    originSource: 'Late-Night Redemption Wildcard Circuit',
    accentHex: '#fb923c',
    svgEmblemKind: 'chip',
  },
  screw_shield: {
    charmId: 'screw_shield',
    name: 'Screw Shield',
    tagline: 'Riveted brass lectern guard that bounces one sabotage call right back.',
    effectSummary: 'Automatically blocks the first Rival Screw or Column Freeze each match.',
    originSource: 'Velvet Salon Counter-Play Workshop',
    accentHex: '#60a5fa',
    svgEmblemKind: 'shield',
  },
};

export const PODIUM_CHARMS_LIST_V5: readonly PodiumCharmSpecV5[] = ALL_PODIUM_CHARM_IDS_V5.map(
  (id) => PODIUM_CHARMS_CATALOG_V5[id],
);

export function getPodiumCharmSpecV5(charmId: CharmIdV5): PodiumCharmSpecV5 {
  return PODIUM_CHARMS_CATALOG_V5[charmId];
}

export function sanitizeEquippedCharmsV5(
  charms?: readonly CharmIdV5[] | null,
): readonly CharmIdV5[] {
  if (!charms || charms.length === 0) return [];
  const seen = new Set<CharmIdV5>();
  const out: CharmIdV5[] = [];
  for (const id of charms) {
    if (seen.has(id)) continue;
    if (!(id in PODIUM_CHARMS_CATALOG_V5)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_EQUIPPED_CHARMS_V5) break;
  }
  return out;
}

// ============================================================================
// 3. CANON V5 CHALLENGER PROFILES & CHARACTER-SPECIFIC "SCREW RIVAL!" BANTER
// ============================================================================

export interface ChallengerScrewProfileV5 {
  readonly id: ChallengerIdV5 | string;
  readonly name: string;
  readonly title: string;
  readonly strongDomains: readonly DomainId[];
  readonly weakDomains: readonly DomainId[];
  readonly baseAccuracy: number;
  readonly onScrewedChokeLines: readonly string[];
  readonly onScrewedBackfireLines: readonly string[];
  readonly onDeployScrewLines: readonly string[];
  readonly onScrewShieldBlockedLines: readonly string[];
}

const CANON_CHALLENGER_SCREW_SPECS: Readonly<Record<string, ChallengerScrewProfileV5>> = {
  frankie_russo: {
    id: 'frankie_russo',
    name: 'Frankie "Last Call" Russo',
    title: 'Unbeaten Oakridge Pub-Quiz Bartender',
    strongDomains: [4, 5, 9],
    weakDomains: [1, 11],
    baseAccuracy: 0.42,
    onScrewedChokeLines: [
      'Hold on — {category}?! My regulars at stool six never brought THAT up over wings. Take the {points}, I got nothing.',
      'You slid {category} across my bar mat and watched me spill a whole pitcher. Fair pinch.',
    ],
    onScrewedBackfireLines: [
      'Nice try, kid — Sal from the hardware store argued about {category} for forty minutes last Thursday! +{points} to the house!',
      'You threw the red buzzer at the bartender on {category}? Backfire special, on tap — +{points}!',
    ],
    onDeployScrewLines: [
      'Closing the kitchen early on your favorites — pour yourself a tall glass of {category}!',
      'Red button time from behind the tap. Let us see how you drink {category} straight.',
    ],
    onScrewShieldBlockedLines: [
      'Wait, my red button bounced clean off your brass plate? Who wired these Oakridge podiums?!',
      'Brought a Screw Shield to a Tuesday-night pub hall? Alright, I tip my towel to you.',
    ],
  },
  denise_park: {
    id: 'denise_park',
    name: 'Denise Park',
    title: 'Retired AP History Legend & Grammar Enforcer',
    strongDomains: [0, 8, 10],
    weakDomains: [4, 6],
    baseAccuracy: 0.48,
    onScrewedChokeLines: [
      '{category} was strictly omitted from my laminated syllabus! Tell the Evanston library club to change the channel.',
      'Oh bother. I just whiffed {category} in front of three former valedictorians — keep your {points} points.',
    ],
    onScrewedBackfireLines: [
      'Ambushing a thirty-four-year AP chair with {category}? I corrected that exact footnote in red ink in 1998 — +{points}!',
      'Detention for shoddy scouting! I read two monographs on {category} over chamomile tea — +{points} to my column.',
    ],
    onDeployScrewLines: [
      'Unannounced midterm on {category}. Pencils up, no whispering, and no groaning.',
      'I reviewed your transcript backstage and circled {category} twice in red Sharpie. Step up.',
    ],
    onScrewShieldBlockedLines: [
      'A brass Screw Shield? That is the game-show equivalent of a forged gym excuse from your mother.',
      'Hmph. Your little lectern guard deflected my pop quiz — do not expect extra credit for it.',
    ],
  },
  trevor_blake: {
    id: 'trevor_blake',
    name: 'Trevor "14-Day" Blake',
    title: '14-Day Regional TV Streak Holder',
    strongDomains: [4, 2, 5],
    weakDomains: [1, 3],
    baseAccuracy: 0.55,
    onScrewedChokeLines: [
      'Cut to the Orlando Kia dealership spot RIGHT NOW — nobody needs to see me blanking on {category} in 1080p!',
      'Whoa, {category}?! My Broadcast White veneers just fogged up — take the {points}, I folded.',
    ],
    onScrewedBackfireLines: [
      'Camera Two, zoom tight on my grin! You threw a Screw on {category} and gift-wrapped +{points} for Day Fifteen!',
      'Tried to ambush me on {category}? Buddy, I read the noon cue cards upside down between weather segments — +{points}!',
    ],
    onDeployScrewLines: [
      'Floor manager, hit the crimson strobe! I am Screwing you straight into {category} before the commercial break!',
      'You want daytime ratings? Let Orlando watch you sweat through {category} right now.',
    ],
    onScrewShieldBlockedLines: [
      'Hold everything — that Screw Shield just ruined my best clip for tonight at eleven!',
      'Blocked on live daytime TV?! Producer, tell graphics not to replay that angle.',
    ],
  },
  priya_nair: {
    id: 'priya_nair',
    name: 'Dr. Priya Nair',
    title: 'ER Trauma Physician & Speed-Crossword Champ',
    strongDomains: [1, 7, 11],
    weakDomains: [5, 9],
    baseAccuracy: 0.62,
    onScrewedChokeLines: [
      'Alright, clean strike — I can run a 4 AM trauma bay on lukewarm espresso, not guess {category} in five seconds.',
      'Sharp chart-reading, challenger. {category} caught me completely off-shift — {points} earned honestly.',
    ],
    onScrewedBackfireLines: [
      'Resting heart rate at fifty-eight. You tried to rattle an ER doctor with {category} and handed me +{points}!',
      'Five seconds feels like a coffee break after Boston General. Backfire confirmed — +{points} on my board.',
    ],
    onDeployScrewLines: [
      'Writing an urgent consult for {category}. Let us see how your pulse holds under the red lamp.',
      'Your career vitals dip sharply whenever {category} comes up. Time to test your tolerance.',
    ],
    onScrewShieldBlockedLines: [
      'Clean preventive medicine — your Screw Shield neutralized that ambush before symptoms started.',
      'Good prep bolting that shield to your podium. I will revise the care plan next turn.',
    ],
  },
  alistair_finch: {
    id: 'alistair_finch',
    name: 'Lord Alistair Finch',
    title: 'Bone-Dry Oxford Classics Fellow',
    strongDomains: [0, 3, 10],
    weakDomains: [4, 6],
    baseAccuracy: 0.67,
    onScrewedChokeLines: [
      'Good heavens, what ghastly corner of modern life is {category}?! My tweed elbow patches are sweating.',
      'Blast it all — I blinked under that vulgar red spotlight and dropped {category}. Disgracefully clever of you.',
    ],
    onScrewedBackfireLines: [
      'Oh, how terribly awkward for your scoreboard. Even {category} came up over port at Magdalen — +{points}!',
      'Your little mechanical ambush has backfired rather splendidly. Do ring for another tray of scones.',
    ],
    onDeployScrewLines: [
      'Do forgive the lack of manners, but I am pressing this dreadful red button to assign you {category}.',
      'One really cannot allow you to sidestep {category} all evening. Off you trot.',
    ],
    onScrewShieldBlockedLines: [
      'A riveted Screw Shield? Positively unsporting, and yet I rather admire the foresight.',
      'My word — my sabotage bounced right off your brass lectern! Carry on, then.',
    ],
  },
  kenji_takahashi: {
    id: 'kenji_takahashi',
    name: 'Kenji "Zero-Lag" Takahashi',
    title: 'Former Shogi & Quiz-Bowl Prodigy',
    strongDomains: [6, 11, 5],
    weakDomains: [9, 3],
    baseAccuracy: 0.72,
    onScrewedChokeLines: [
      'Gah — frame-trapped on {category}?! You actually dug up the one blind sector in my study sheet.',
      'Clean read. My thumb hovered half a second too long on {category} and you walked away with {points}.',
    ],
    onScrewedBackfireLines: [
      'Counter-hit! Five seconds is forever when you already mapped {category} — +{points} on the punish!',
      'Zero-lag parry! You tossed a Screw into my sweet spot on {category} and paid me +{points} for the favor.',
    ],
    onDeployScrewLines: [
      'Checked your split times backstage — locking you onto {category}. Show me your clutch APM.',
      'Red switch engaged. Let us see if your hand stays steady on {category}.',
    ],
    onScrewShieldBlockedLines: [
      'Frame-one guard! Your Screw Shield parried my opener for zero chip damage.',
      'Respect the loadout tech — burned my Screw token straight into brass plating.',
    ],
  },
  nadia_al_mansoor: {
    id: 'nadia_al_mansoor',
    name: 'Nadia Al-Mansoor',
    title: 'World Memory Champion & Polyglot',
    strongDomains: [2, 0, 8, 10],
    weakDomains: [5, 4],
    baseAccuracy: 0.76,
    onScrewedChokeLines: [
      'Well scouted! Even a memory palace built from Khan el-Khalili alleys has a loose latch in {category}.',
      'You waited for the exact weak corner of my map and took {points} clean off the table. Bravo.',
    ],
    onScrewedBackfireLines: [
      'You assumed I skipped {category}? I filed that fact behind the spice stall on shelf three — +{points}!',
      'Bold gamble under the desert lights, challenger — and a costly backfire for +{points}!',
    ],
    onDeployScrewLines: [
      'I memorized your lowest career percentage before we shook hands. Step directly into {category}.',
      'Slamming the red switch — show half a billion viewers you patched your gap in {category}.',
    ],
    onScrewShieldBlockedLines: [
      'Ah, the Screw Shield! You read my countermove two turns before I touched the dome.',
      'Clean deflection. That bit of brass just spared you a very uncomfortable five seconds.',
    ],
  },
  viktor_volkov: {
    id: 'viktor_volkov',
    name: 'Viktor Volkov',
    title: 'Undefeated 3-Time World Grandmaster',
    strongDomains: [0, 1, 2, 8, 11],
    weakDomains: [4, 9],
    baseAccuracy: 0.8,
    onScrewedChokeLines: [
      'Quiet in the arena... one billion pairs of eyes just watched you catch me cold on {category} for {points}.',
      'A Geneva watchmaker would call that timing surgical. I had nothing on {category} — take the {points}.',
    ],
    onScrewedBackfireLines: [
      'You threw a red buzzer at a three-time champion on {category}? Severe miscalculation — +{points} to the throne.',
      'Five seconds is four seconds more than I required for {category}. Backfire logged: +{points}.',
    ],
    onDeployScrewLines: [
      'Enough circling the edges of the board. I am locking you into {category} before the whole planet.',
      'A champion does not hide behind comfortable columns. Answer {category} now.',
    ],
    onScrewShieldBlockedLines: [
      'A Screw Shield in the World Finale? Disciplined preparation — my strike glances clean off.',
      'Your lectern guard held once, challenger. Now let us see how you survive without it.',
    ],
  },
  julian_vance: {
    id: 'julian_vance',
    name: 'Julian Vance',
    title: 'Undefeated 3-Time "World\'s Smartest" Champion',
    strongDomains: [0, 1, 2, 8, 11],
    weakDomains: [4, 9],
    baseAccuracy: 0.8,
    onScrewedChokeLines: [
      'Three championship rings and you catch me flat-footed on {category} — that steal goes straight on the evening reel.',
      'Sharp timing. I drew a total blank on {category} and handed you {points}.',
    ],
    onScrewedBackfireLines: [
      'Screwing the defending champion on {category}? Bold gamble, expensive backfire — +{points}!',
      'Five seconds was far too generous on {category}. Thanks for the +{points}.',
    ],
    onDeployScrewLines: [
      'Time to test the weak spot on your stat sheet — I am Screwing you onto {category}.',
      'No dodging your roughest category under finale lights. Step up to {category}.',
    ],
    onScrewShieldBlockedLines: [
      'Clean block by your Screw Shield — now we have a genuine championship scrap.',
      'Deflected my Screw without flinching. Respect.',
    ],
  },
};

const MAX_SCREW_CHOKE_LINES: readonly string[] = [
  'SCREW LANDED! {rival} froze under the crimson lamp on "{category}" — you just pocketed +{points} PTS{shatterNote}!',
  'CLEAN HIJACK! {rival} blanked live on air over "{category}" and handed you +{points} PTS{shatterNote}!',
  'BULLSEYE AMBUSH! You shoved "{category}" across the stage, {rival} choked, and +{points} PTS hit your tally{shatterNote}!',
  'SOMEBODY CHECK {rival}\'S MIC! They whiffed "{category}" under the red clock — +{points} PTS stolen{shatterNote}!',
];

const MAX_SCREW_BACKFIRE_LINES: readonly string[] = [
  'SCREW BACKFIRE! {rival} nailed "{category}" with time to spare and stacked +{points} PTS onto their own board!',
  'ROUGH BOUNCE! You tossed the red trap at {rival} on "{category}" and they cashed +{points} PTS right in your face!',
  'ABORT! {rival} chewed straight through "{category}" — your Screw just backfired for +{points} PTS to the rival!',
  'THAT HURT! {rival} stared into the five-second lamp on "{category}" and walked off with +{points} PTS!',
];

const MAX_RIVAL_SCREW_LINES: readonly string[] = [
  'RED BUZZER! {rival} spent their Screw token to pin you onto "{category}" ({weakNote})!',
  'ICE COLD! {rival} slammed the red dome and dragged you straight into "{category}" ({weakNote})!',
  'SIRENS ON STAGE! {rival} just Screwed you onto "{category}" — no backing out ({weakNote})!',
];

const MAX_SCREW_SHIELD_BLOCK_LINES: readonly string[] = [
  'CLANG! SCREW SHIELD HELD! {rival} slammed the red dome for "{category}", and your brass guard bounced it off the stage!',
  'DENIED! {rival} burned their Screw token on "{category}", straight into your podium Screw Shield!',
];

function fillTemplate(template: string, tokens: Readonly<Record<string, string>>): string {
  let out = template;
  for (const [k, v] of Object.entries(tokens)) {
    out = out.split(`{${k}}`).join(v);
  }
  return out;
}

function pickFrom<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

function sanitizeInt(value: number | undefined | null, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.round(value);
}

/**
 * Resolves a canon v5 Challenger spec from either a `ChallengerIdV5`, string ID,
 * `ChallengerScrewProfileV5`, or full `ChallengerProfileV4` object.
 */
export function getChallengerSpecV5(
  challenger?: ChallengerProfileV4 | ChallengerScrewProfileV5 | ChallengerIdV5 | string | null,
): ChallengerScrewProfileV5 {
  if (!challenger) {
    return CANON_CHALLENGER_SCREW_SPECS.frankie_russo;
  }
  if (typeof challenger === 'string') {
    const canon = CANON_CHALLENGER_SCREW_SPECS[challenger];
    if (canon) return canon;
    return {
      ...CANON_CHALLENGER_SCREW_SPECS.frankie_russo,
      id: challenger,
      name: challenger,
    };
  }
  if ('onScrewedChokeLines' in challenger) {
    return challenger;
  }
  const canon = CANON_CHALLENGER_SCREW_SPECS[challenger.id];
  if (canon) {
    return {
      ...canon,
      name: challenger.name,
      title: challenger.title,
      strongDomains: challenger.strongDomains,
      weakDomains: challenger.weakDomains,
      baseAccuracy: challenger.baseAccuracy,
    };
  }
  return {
    id: challenger.id,
    name: challenger.name,
    title: challenger.title,
    strongDomains: challenger.strongDomains,
    weakDomains: challenger.weakDomains,
    baseAccuracy: challenger.baseAccuracy,
    onScrewedChokeLines: [
      'Whoa — {category} caught me completely sideways! Take the {points} points.',
      'Blanked under the five-second lamp on {category}. Sharp scouting.',
    ],
    onScrewedBackfireLines: [
      'Nice try! I actually studied {category} — thanks for the +{points} backfire!',
      'Backfire! You just handed me +{points} points on {category}!',
    ],
    onDeployScrewLines: [
      'Slamming the Screw! Let us see how you handle {category}.',
      'Time to test your blind spot on {category}.',
    ],
    onScrewShieldBlockedLines: [
      'Blocked by a Screw Shield?! Clever podium setup.',
      'My Screw bounced clean off your brass lectern guard.',
    ],
  };
}

// ============================================================================
// 4. V5 STAGE BOARD STATE & 14-TOPOLOGY GENERATOR (`generateStageBoardV5`)
// ============================================================================

export interface CharmRuntimeStateV5 {
  readonly equippedCharms: readonly CharmIdV5[];
  readonly frankiesCoasterUsed: boolean;
  readonly screwShieldChargesLeft: number;
  readonly totalCharmBonusPoints: number;
  readonly totalCharmPenaltySaved: number;
  readonly triggerCounts: Readonly<Partial<Record<CharmIdV5, number>>>;
}

export interface StageBoardStateV5 extends StageBoardStateV4 {
  readonly v5Version: '5.0';
  readonly campaignTopology: CampaignNodeV5['topology'];
  /** Active v5 Board Topology & Twist ID (14 distinct playable board modes!). */
  readonly boardTwistId: BoardTwistIdV5;
  readonly boardTwistLabel: string;
  /** Per-tile visual & live gameplay metadata (Gold Fever, Flame Thaw, X-Crossroads, Spiral Core, Pyramid Apex, Hot Potato). */
  readonly tileMetaById: Readonly<Record<string, BoardTileVisualMetaV5>>;
  /** Live Territory Turf meter for `tug_of_war_turf` (`null` on other boards). */
  readonly tugOfWarTurf: TugOfWarTurfStateV5 | null;
  readonly tugOfWarBonusAwardedTo: 'PLAYER' | 'RIVAL' | 'TIE' | null;
  /** Active Hot Potato ticking tile ID & remaining fuse turns (`time_bomb_hot_potato`). */
  readonly hotPotatoTileId: string | null;
  readonly hotPotatoTurnsLeft: number;
  readonly isOxfordDraftBoard: boolean;
  readonly challengerId: ChallengerIdV5 | string | null;
  readonly playerScrewTokensLeft: number;
  readonly playerScrewTokensMax: number;
  readonly rivalScrewTokensLeft: number;
  readonly playerSuccessfulScrews: number;
  readonly playerBackfiredScrews: number;
  readonly rivalScrewsDeployed: number;
  readonly rivalScrewsBlockedByShield: number;
  readonly paidOutRowIndices: readonly number[];
  readonly paidOutColIndices: readonly number[];
  readonly totalLineSweepJackpotPoints: number;
  readonly charms: CharmRuntimeStateV5;
  readonly bonusShotClockSec: number;
  readonly lifelinesUsedCount: number;
  readonly guaranteedFormats: readonly QuestionFormatV4[];
}

export interface GenerateStageBoardV5Config {
  readonly boardId?: string;
  readonly node?: CampaignNodeV5 & { readonly boardTwistId?: BoardTwistIdV5 | string };
  readonly topology?: CampaignNodeV5['topology'] | BoardTopologyKind;
  /** Explicit 14-mode v5 Board Topology / Twist ID (auto-read from `node.boardTwistId` if present). */
  readonly boardTwistId?: BoardTwistIdV5 | string;
  readonly cols?: 4 | 5 | 6;
  readonly rows?: 3 | 4;
  readonly maxTurns?: number;
  readonly featuredFormats?: readonly QuestionFormatV4[];
  readonly preferredDomains?: readonly DomainId[];
  readonly draftedColumns?: readonly DraftedColumnSpecV4[];
  readonly challengerId?: ChallengerIdV5 | string | null;
  readonly hasActiveRival?: boolean;
  readonly soloTargetScore?: number;
  readonly equippedCharms?: readonly CharmIdV5[];
  readonly initialLifelines5050?: number;
  readonly initialLifelinesHint?: number;
  readonly seed?: number | string;
  readonly rng?: () => number;
}

const TACTILE_FORMAT_PRIORITY_V5: readonly QuestionFormatV4[] = [
  'MATCH_4',
  'SORT_4',
  'PINPOINT_DIAL',
  'CLUE_ESCALATOR',
  'MULTI_STRIKE',
  'VISUAL_SPOTTER',
  'MULTIPLE_CHOICE',
] as const;

export function isBoardTwistIdV5(value: unknown): value is BoardTwistIdV5 {
  return typeof value === 'string' && value in BOARD_TOPOLOGIES_CATALOG_V5;
}

/**
 * Resolves a valid `BoardTwistIdV5` from an explicit twist ID or falls back cleanly
 * from any v5 `CampaignNodeV5['topology']` / v4 `BoardTopologyKind`.
 */
export function resolveBoardTwistIdV5(
  explicitTwist?: BoardTwistIdV5 | string | null,
  topology?: CampaignNodeV5['topology'] | BoardTopologyKind,
): BoardTwistIdV5 {
  if (isBoardTwistIdV5(explicitTwist)) {
    return explicitTwist;
  }
  switch (topology) {
    case 'PADLOCK_NEIGHBORS':
      return 'chain_padlocks';
    case 'FOG_EXPLORER':
    case 'FOG_CROSSROADS':
      return 'fog_spotlight';
    case 'SPOTLIGHT_ROULETTE':
      return 'spotlight_roulette';
    case 'CROSSROADS_HYBRID':
    case 'CHALLENGER_GAUNTLET':
      return 'velvet_x_crossroads';
    case 'FINALE_GAUNTLET':
    case 'GRAND_FINALE_VAULT':
      return 'championship_gauntlet';
    case 'OPEN_TRYOUT':
    case 'OPEN_CLASSIC':
    case undefined:
    default:
      return 'showcase_starter';
  }
}

/**
 * Maps any v5 `CampaignNodeV5['topology']` or v4 `BoardTopologyKind` cleanly into both
 * canonical v4 `BoardTopologyKind` and v5 `CampaignNodeV5['topology']`.
 */
export function mapCampaignTopologyToBoardV4(
  topology: CampaignNodeV5['topology'] | BoardTopologyKind | undefined,
): { readonly v4Topology: BoardTopologyKind; readonly campaignTopology: CampaignNodeV5['topology'] } {
  switch (topology) {
    case 'OPEN_TRYOUT':
    case 'OPEN_CLASSIC':
    case undefined:
      return { v4Topology: 'OPEN_CLASSIC', campaignTopology: 'OPEN_TRYOUT' };
    case 'PADLOCK_NEIGHBORS':
      return { v4Topology: 'PADLOCK_NEIGHBORS', campaignTopology: 'PADLOCK_NEIGHBORS' };
    case 'FOG_EXPLORER':
    case 'FOG_CROSSROADS':
      return { v4Topology: 'FOG_CROSSROADS', campaignTopology: 'FOG_EXPLORER' };
    case 'SPOTLIGHT_ROULETTE':
      return { v4Topology: 'SPOTLIGHT_ROULETTE', campaignTopology: 'SPOTLIGHT_ROULETTE' };
    case 'CROSSROADS_HYBRID':
    case 'CHALLENGER_GAUNTLET':
      return { v4Topology: 'CHALLENGER_GAUNTLET', campaignTopology: 'CROSSROADS_HYBRID' };
    case 'FINALE_GAUNTLET':
    case 'GRAND_FINALE_VAULT':
      return { v4Topology: 'GRAND_FINALE_VAULT', campaignTopology: 'FINALE_GAUNTLET' };
  }
}

function isCampaignNodeV5(
  input: CampaignNodeV5 | GenerateStageBoardV5Config,
): input is CampaignNodeV5 & { readonly boardTwistId?: BoardTwistIdV5 | string } {
  return (
    typeof input === 'object' &&
    input !== null &&
    'nodeId' in input &&
    'boardCols' in input &&
    'boardRows' in input
  );
}

/**
 * Guarantees a rich format pool with AT LEAST `MIN_DISTINCT_FORMATS_PER_BOARD_V5` (4)
 * distinct `QuestionFormatV4` formats — permanently banning all-CLASSIC boards!
 */
function buildGuaranteedFormatPoolV5(
  requested: readonly QuestionFormatV4[] | undefined,
  rng: () => number,
): readonly QuestionFormatV4[] {
  const pool: QuestionFormatV4[] = [];
  if (requested) {
    for (const fmt of requested) {
      if (ALL_QUESTION_FORMATS_V4.includes(fmt) && !pool.includes(fmt)) {
        pool.push(fmt);
      }
    }
  }

  const remaining = TACTILE_FORMAT_PRIORITY_V5.filter((f) => !pool.includes(f));
  const nonMcRemaining = remaining.filter((f) => f !== 'MULTIPLE_CHOICE');
  for (let i = nonMcRemaining.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = nonMcRemaining[i];
    nonMcRemaining[i] = nonMcRemaining[j];
    nonMcRemaining[j] = tmp;
  }

  for (const fmt of nonMcRemaining) {
    if (pool.length >= Math.max(MIN_DISTINCT_FORMATS_PER_BOARD_V5, 5)) break;
    pool.push(fmt);
  }
  if (!pool.includes('MULTIPLE_CHOICE') && pool.length < MIN_DISTINCT_FORMATS_PER_BOARD_V5) {
    pool.push('MULTIPLE_CHOICE');
  }
  for (const fmt of ALL_QUESTION_FORMATS_V4) {
    if (pool.length >= MIN_DISTINCT_FORMATS_PER_BOARD_V5) break;
    if (!pool.includes(fmt)) pool.push(fmt);
  }

  return pool;
}

function expandPreferredDomainsForCols(
  preferred: readonly DomainId[] | undefined,
  cols: 4 | 5 | 6,
  rng: () => number,
): readonly DomainId[] | undefined {
  if (!preferred || preferred.length === 0) return undefined;
  const chosen: DomainId[] = [];
  for (const d of preferred) {
    if (ALL_DOMAIN_IDS_V4.includes(d) && !chosen.includes(d)) {
      chosen.push(d);
      if (chosen.length >= cols) return chosen;
    }
  }
  const usedWedges = new Set<WedgeColorId>(chosen.map((d) => domainToWedgeColor(d)));
  const shuffledWedges = [...ALL_WEDGE_IDS_V4];
  for (let i = shuffledWedges.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = shuffledWedges[i];
    shuffledWedges[i] = shuffledWedges[j];
    shuffledWedges[j] = tmp;
  }
  for (const wedge of shuffledWedges) {
    if (chosen.length >= cols) break;
    if (usedWedges.has(wedge)) continue;
    const candidates = WEDGE_CATALOG_V4[wedge].domainIds.filter((d) => !chosen.includes(d));
    if (candidates.length > 0) {
      chosen.push(pickFrom(candidates, rng));
      usedWedges.add(wedge);
    }
  }
  for (const d of ALL_DOMAIN_IDS_V4) {
    if (chosen.length >= cols) break;
    if (!chosen.includes(d)) chosen.push(d);
  }
  return chosen;
}

function computeXCrossroadsTileIds(cols: number, rows: number, tiles: readonly BoardTileV4[]): Set<string> {
  const diagIds = new Set<string>();
  const denom = Math.max(1, rows - 1);
  for (let r = 0; r < rows; r++) {
    const cMain = Math.round((r * (cols - 1)) / denom);
    const cAnti = cols - 1 - cMain;
    for (const t of tiles) {
      if (t.rowIndex === r && (t.colIndex === cMain || t.colIndex === cAnti)) {
        diagIds.add(t.tileId);
      }
    }
  }
  return diagIds;
}

/**
 * Applies the specific layout geometry, visual metadata (`tileMetaById`), and lively
 * multi-format & twist guarantees for ALL 14 playable v5 Board Topologies!
 */
function applyTopologyGeometryAndRichnessV5(
  baseBoard: StageBoardStateV4,
  boardTwistId: BoardTwistIdV5,
  formatPool: readonly QuestionFormatV4[],
  rng: () => number,
): {
  readonly board: StageBoardStateV4;
  readonly tileMetaById: Readonly<Record<string, BoardTileVisualMetaV5>>;
  readonly tugOfWarTurf: TugOfWarTurfStateV5 | null;
  readonly hotPotatoTileId: string | null;
  readonly hotPotatoTurnsLeft: number;
  readonly isOxfordDraftBoard: boolean;
} {
  const { cols, rows } = getBoardDimensions(baseBoard);
  const columns = baseBoard.columns.map((c) => ({ ...c }));
  const tiles = baseBoard.tiles.map((t) => ({ ...t }));
  const tileMetaById: Record<string, BoardTileVisualMetaV5> = {};
  let hotPotatoTileId: string | null = null;
  let hotPotatoTurnsLeft = 0;
  let tugOfWarTurf: TugOfWarTurfStateV5 | null = null;
  let isOxfordDraftBoard = false;

  const findTileIdx = (c: number, r: number): number =>
    tiles.findIndex((t) => t.colIndex === c && t.rowIndex === r);

  // 1. Apply Topology-Specific Grid Geometry (distinct spatial puzzles for all 14 modes!)
  switch (boardTwistId) {
    case 'spiral_labyrinth': {
      // Outer perimeter OPEN; interior ring + center 1,000-PT Core PADLOCKED!
      const coreCol = Math.floor(cols / 2);
      const coreRow = Math.floor(rows / 2);
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const isPerimeter =
          t.rowIndex === 0 ||
          t.rowIndex === rows - 1 ||
          t.colIndex === 0 ||
          t.colIndex === cols - 1;
        tiles[i] = {
          ...t,
          status: isPerimeter ? 'OPEN' : 'PADLOCKED',
          twistRevealedToPlayer: true,
        };
      }
      const coreIdx = findTileIdx(coreCol, coreRow);
      if (coreIdx >= 0) {
        tiles[coreIdx] = {
          ...tiles[coreIdx],
          status: 'PADLOCKED',
          twist: 'CROWN_WEDGE',
          twistRevealedToPlayer: true,
        };
        tileMetaById[tiles[coreIdx].tileId] = {
          isSpiralCore: true,
          displayPointsOverride: BOARD_TWIST_BONUS_V5.spiralCoreTargetPoints,
        };
      }
      break;
    }

    case 'pyramid_ascent': {
      // Base row (bottom) starts OPEN; climb UPWARD shattering locks to the 1,000-PT Summit Apex at row 0!
      const apexCol = Math.floor((cols - 1) / 2);
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        tiles[i] = {
          ...t,
          status: t.rowIndex === rows - 1 ? 'OPEN' : 'PADLOCKED',
          twistRevealedToPlayer: true,
        };
      }
      const apexIdx = findTileIdx(apexCol, 0);
      if (apexIdx >= 0) {
        tiles[apexIdx] = {
          ...tiles[apexIdx],
          status: 'PADLOCKED',
          twist: 'CROWN_WEDGE',
          twistRevealedToPlayer: true,
        };
        tileMetaById[tiles[apexIdx].tileId] = {
          isPyramidApex: true,
          displayPointsOverride: BOARD_TWIST_BONUS_V5.pyramidApexTargetPoints,
        };
      }
      break;
    }

    case 'velvet_x_crossroads': {
      // X-shaped diagonal tracks glowing at 2x base payout; non-diagonal corners locked/fogged!
      const diagIds = computeXCrossroadsTileIds(cols, rows, tiles);
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const onDiag = diagIds.has(t.tileId);
        if (onDiag) {
          tiles[i] = {
            ...t,
            status: t.rowIndex === rows - 1 ? 'PADLOCKED' : 'OPEN',
            twistRevealedToPlayer: true,
          };
          tileMetaById[t.tileId] = {
            isCrossroadsDiagonal: true,
            displayPointsOverride: t.pointValue * 2,
          };
        } else {
          tiles[i] = {
            ...t,
            status: t.rowIndex === 0 ? 'OPEN' : 'PADLOCKED',
            twistRevealedToPlayer: true,
          };
        }
      }
      break;
    }

    case 'ice_fire_columns': {
      // Column 0 (and last column on 6-col boards) frozen solid in Stage Ice; 2 Flame-Thaw tiles in unfrozen cols!
      const frozenCols = cols >= 6 ? [0, cols - 1] : [0];
      for (const colIdx of frozenCols) {
        columns[colIdx] = { ...columns[colIdx], frozenTurnsRemaining: 3 };
      }
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        if (frozenCols.includes(t.colIndex)) {
          tiles[i] = {
            ...t,
            status: 'FROZEN_BY_RIVAL',
            twistRevealedToPlayer: true,
          };
        } else if (t.rowIndex === rows - 1) {
          tiles[i] = { ...t, status: 'PADLOCKED', twistRevealedToPlayer: true };
        } else {
          tiles[i] = { ...t, status: 'OPEN', twistRevealedToPlayer: true };
        }
      }
      // Plant 2 glowing Flame-Thaw tiles on OPEN unfrozen upper cells
      const flameCandidates = tiles.filter(
        (t) => !frozenCols.includes(t.colIndex) && t.status === 'OPEN' && t.rowIndex < rows - 1,
      );
      const shuffledFlames = [...flameCandidates].sort(() => rng() - 0.5);
      for (const flameTile of shuffledFlames.slice(0, 2)) {
        tileMetaById[flameTile.tileId] = {
          ...tileMetaById[flameTile.tileId],
          isFlameThaw: true,
        };
      }
      break;
    }

    case 'tug_of_war_turf': {
      // Open contested battlefield with 2 chained bottom corner vaults + live +500 Turf Meter
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const isCornerVault =
          t.rowIndex === rows - 1 && (t.colIndex === 0 || t.colIndex === cols - 1);
        tiles[i] = {
          ...t,
          status: isCornerVault ? 'PADLOCKED' : 'OPEN',
          twistRevealedToPlayer: true,
        };
      }
      tugOfWarTurf = {
        playerTiles: 0,
        rivalTiles: 0,
        bonusPts: BOARD_TWIST_BONUS_V5.tugOfWarMajorityBonus,
      };
      break;
    }

    case 'oxford_pick_ban': {
      isOxfordDraftBoard = true;
      // Ensure columns carry PLAYER / RIVAL / SHOW draft markers even if started without a draft dialog
      const allShow = columns.every((c) => c.pickedBy === 'SHOW');
      if (allShow) {
        for (let c = 0; c < columns.length; c++) {
          columns[c] = {
            ...columns[c],
            pickedBy: c % 2 === 0 ? 'PLAYER' : c === columns.length - 1 ? 'SHOW' : 'RIVAL',
          };
        }
      }
      break;
    }

    case 'gold_fever_contagion': {
      // Open upper stage + chained bottom corner vaults; seed 1 starter Gold Fever tile at 2x!
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const isCornerVault =
          t.rowIndex === rows - 1 && (t.colIndex === 0 || t.colIndex === cols - 1);
        tiles[i] = {
          ...t,
          status: isCornerVault ? 'PADLOCKED' : 'OPEN',
          twistRevealedToPlayer: true,
        };
      }
      const starterPool = tiles.filter((t) => t.status === 'OPEN' && t.rowIndex <= 1);
      if (starterPool.length > 0) {
        const starter = pickFrom(starterPool, rng);
        tileMetaById[starter.tileId] = {
          isGoldFever: true,
          displayPointsOverride: starter.pointValue * 2,
        };
      }
      break;
    }

    case 'championship_gauntlet': {
      // Grandmaster 6-column finale: add a golden 2x center keystone on top of GRAND_FINALE_VAULT!
      const keystoneCol = Math.floor(cols / 2);
      const keystoneIdx = findTileIdx(keystoneCol, 1);
      if (keystoneIdx >= 0) {
        tileMetaById[tiles[keystoneIdx].tileId] = {
          isGoldFever: true,
          displayPointsOverride: tiles[keystoneIdx].pointValue * 2,
        };
      }
      break;
    }

    case 'showcase_starter':
    case 'chain_padlocks':
    case 'fog_spotlight':
    case 'time_bomb_hot_potato':
    case 'spotlight_roulette':
    case 'power_play_minefield':
    default:
      break;
  }

  // 2. Guarantee >= 2 PADLOCKED chain vault tiles on EVERY v5 board (even showcase_starter!)
  const padlockCount = tiles.filter((t) => t.status === 'PADLOCKED').length;
  if (padlockCount < 2) {
    const vaultCandidates = [
      tiles.find((t) => t.rowIndex === rows - 1 && t.colIndex === 0),
      tiles.find((t) => t.rowIndex === rows - 1 && t.colIndex === cols - 1),
      tiles.find((t) => t.rowIndex === rows - 1 && t.colIndex === Math.floor(cols / 2)),
    ].filter((t): t is BoardTileV4 => Boolean(t));

    let currentLocks = padlockCount;
    for (const cand of vaultCandidates) {
      if (currentLocks >= 2) break;
      if (cand.status === 'OPEN') {
        const idx = tiles.findIndex((t) => t.tileId === cand.tileId);
        tiles[idx] = {
          ...tiles[idx],
          status: 'PADLOCKED',
          twistRevealedToPlayer: true,
        };
        currentLocks++;
      }
    }
  }

  // 3. Guarantee bottom row carries CROWN_WEDGE (revealed unless FOGGED)
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].rowIndex === rows - 1) {
      tiles[i] = {
        ...tiles[i],
        twist: 'CROWN_WEDGE',
        twistRevealedToPlayer: tiles[i].status !== 'FOGGED',
      };
    }
  }

  // 4. Guarantee lively upper-row twists: POWER_PLAY, WHEEL_CURVEBALL, LIGHTNING_BLITZ, RIVAL_BOUNTY
  const ensureUpperTwist = (
    kind: TileTwistKind,
    preferRow: number,
    minCount = 1,
    revealUnlessFogged = true,
  ): void => {
    const existing = tiles.filter((t) => t.twist === kind);
    for (const t of existing) {
      if (revealUnlessFogged && t.status !== 'FOGGED' && !t.twistRevealedToPlayer) {
        const idx = tiles.findIndex((x) => x.tileId === t.tileId);
        tiles[idx] = { ...tiles[idx], twistRevealedToPlayer: true };
      } else if (!revealUnlessFogged) {
        const idx = tiles.findIndex((x) => x.tileId === t.tileId);
        tiles[idx] = { ...tiles[idx], twistRevealedToPlayer: false };
      }
    }

    let placed = existing.length;
    while (placed < minCount) {
      const upperNone = tiles.filter((t) => t.rowIndex < rows - 1 && t.twist === 'NONE');
      if (upperNone.length === 0) break;
      const preferred = upperNone.filter((t) => t.rowIndex === preferRow && t.status === 'OPEN');
      const openUpper = upperNone.filter((t) => t.status === 'OPEN');
      const pool = preferred.length > 0 ? preferred : openUpper.length > 0 ? openUpper : upperNone;
      const picked = pickFrom(pool, rng);
      const idx = tiles.findIndex((t) => t.tileId === picked.tileId);
      tiles[idx] = {
        ...tiles[idx],
        twist: kind,
        twistRevealedToPlayer: revealUnlessFogged ? tiles[idx].status !== 'FOGGED' : false,
      };
      placed++;
    }
  };

  const midUpperRow = Math.max(0, rows - 2);
  const isMinefield = boardTwistId === 'power_play_minefield';
  ensureUpperTwist('POWER_PLAY', midUpperRow, isMinefield ? 4 : 1, !isMinefield);
  ensureUpperTwist('WHEEL_CURVEBALL', Math.min(1, midUpperRow), 1, true);
  ensureUpperTwist('LIGHTNING_BLITZ', 0, 1, true);
  ensureUpperTwist('RIVAL_BOUNTY', 0, 1, true);

  if (boardTwistId === 'spotlight_roulette' || boardTwistId === 'championship_gauntlet') {
    ensureUpperTwist('SPOTLIGHT_SWEEP', Math.min(1, midUpperRow), 2, true);
  }

  // Reveal all non-FOGGED special twists (except concealed mines in `power_play_minefield`!)
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].twist !== 'NONE' && tiles[i].status !== 'FOGGED') {
      if (isMinefield && tiles[i].twist === 'POWER_PLAY') continue;
      tiles[i] = { ...tiles[i], twistRevealedToPlayer: true };
    }
  }

  // Plant active ticking Hot Potato on an OPEN tile for `time_bomb_hot_potato`
  if (boardTwistId === 'time_bomb_hot_potato') {
    const openBlitz = tiles.find(
      (t) =>
        t.status === 'OPEN' &&
        columns[t.colIndex].frozenTurnsRemaining <= 0 &&
        t.twist === 'LIGHTNING_BLITZ',
    );
    const anyOpen =
      openBlitz ??
      tiles.find((t) => t.status === 'OPEN' && columns[t.colIndex].frozenTurnsRemaining <= 0);
    if (anyOpen) {
      hotPotatoTileId = anyOpen.tileId;
      hotPotatoTurnsLeft = BOARD_TWIST_BONUS_V5.hotPotatoInitialFuseTurns;
      tileMetaById[anyOpen.tileId] = {
        ...tileMetaById[anyOpen.tileId],
        hotPotatoTurnsLeft,
      };
    }
  }

  // 5. Enforce >= 4 distinct QuestionFormatV4 formats AND cap MULTIPLE_CHOICE so boards are NEVER all-CLASSIC!
  const nonMcPool = formatPool.filter((f) => f !== 'MULTIPLE_CHOICE');
  const safeNonMcPool: readonly QuestionFormatV4[] =
    nonMcPool.length >= 3
      ? nonMcPool
      : (['MATCH_4', 'SORT_4', 'PINPOINT_DIAL', 'CLUE_ESCALATOR', 'MULTI_STRIKE'] as const);

  const maxMcTiles = Math.max(1, Math.floor(tiles.length / 3));
  const mcIndices = tiles
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => t.format === 'MULTIPLE_CHOICE');

  if (mcIndices.length > maxMcTiles) {
    mcIndices.sort((a, b) => {
      const aBlitz = a.t.twist === 'LIGHTNING_BLITZ' ? 0 : 1;
      const bBlitz = b.t.twist === 'LIGHTNING_BLITZ' ? 0 : 1;
      return aBlitz - bBlitz;
    });
    const toConvert = mcIndices.slice(maxMcTiles);
    let cursor = 0;
    for (const { idx } of toConvert) {
      const replacement = safeNonMcPool[cursor % safeNonMcPool.length];
      cursor++;
      tiles[idx] = { ...tiles[idx], format: replacement };
    }
  }

  const countFormats = (): Map<QuestionFormatV4, number> => {
    const counts = new Map<QuestionFormatV4, number>();
    for (const t of tiles) {
      counts.set(t.format, (counts.get(t.format) ?? 0) + 1);
    }
    return counts;
  };

  let fmtCounts = countFormats();
  const missingFromPool = formatPool.filter((f) => !fmtCounts.has(f));
  const fallbackPool = ALL_QUESTION_FORMATS_V4.filter(
    (f) => !fmtCounts.has(f) && !missingFromPool.includes(f),
  );
  const injectQueue = [...missingFromPool, ...fallbackPool];

  while (fmtCounts.size < MIN_DISTINCT_FORMATS_PER_BOARD_V5 && injectQueue.length > 0) {
    const neededFmt = injectQueue.shift() as QuestionFormatV4;
    let bestIdx = -1;
    let bestCount = 1;
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      if (t.twist === 'LIGHTNING_BLITZ' && neededFmt !== 'MULTIPLE_CHOICE') continue;
      const c = fmtCounts.get(t.format) ?? 0;
      if (c > bestCount) {
        bestCount = c;
        bestIdx = i;
      }
    }
    if (bestIdx < 0) break;
    tiles[bestIdx] = { ...tiles[bestIdx], format: neededFmt };
    fmtCounts = countFormats();
  }

  let nextBoard: StageBoardStateV4 = {
    ...baseBoard,
    columns,
    tiles,
  };

  // 6. Re-verify 100% BFS reachability & >= 3 open playable tiles (0 soft-locks across all 14 topologies!)
  const reach = verifyBoardReachability(nextBoard);
  if (!reach.ok || getPlayableTiles(nextBoard).length < 3) {
    nextBoard = ensurePlayableTilesOrStageSurge(nextBoard, rng, 4).board;
  }

  return {
    board: nextBoard,
    tileMetaById,
    tugOfWarTurf,
    hotPotatoTileId,
    hotPotatoTurnsLeft,
    isOxfordDraftBoard,
  };
}

/**
 * Computes match-start passive modifiers from equipped Podium Lucky Charms.
 */
export function getMatchStartCharmModifiers(
  equippedCharms?: readonly CharmIdV5[] | null,
  hasActiveRival = true,
): {
  readonly equippedCharms: readonly CharmIdV5[];
  readonly extraClueCoins: number;
  readonly extraScrewTokens: number;
  readonly bonusShotClockSec: number;
  readonly screwShieldCharges: number;
} {
  const sanitized = sanitizeEquippedCharmsV5(equippedCharms);
  const has = (id: CharmIdV5): boolean => sanitized.includes(id);
  return {
    equippedCharms: sanitized,
    extraClueCoins: has('grassroots_megaphone')
      ? CHARM_VALUES_V5.grassrootsMegaphoneExtraClues
      : 0,
    extraScrewTokens:
      hasActiveRival && has('velvet_wax_seal')
        ? CHARM_VALUES_V5.velvetWaxSealExtraScrews
        : 0,
    bonusShotClockSec: has('alistairs_pocketwatch')
      ? CHARM_VALUES_V5.alistairsPocketwatchBonusSec
      : 0,
    screwShieldCharges: has('screw_shield') ? CHARM_VALUES_V5.screwShieldCharges : 0,
  };
}

/**
 * Convenience helper to launch an Oxford Pick & Ban Category Draft (`oxford_pick_ban`)
 * and feed its finalized columns straight into `generateStageBoardV5({ draftedColumns })`.
 */
export function buildOxfordPickBanDraftV5(
  options: BuildCategoryDraftPoolOptionsV4 = {},
): CategoryDraftStateV4 {
  return buildCategoryDraftPool({
    targetColumns: options.targetColumns ?? 5,
    poolSize: options.poolSize ?? 10,
    ...options,
  });
}

export { finalizeDraftToBoardColumns };

/**
 * Generates a rich, multi-format, zero-soft-lock `StageBoardStateV5` across ALL 14
 * playable Board Topologies & Twists:
 * - Permanently BANS all-`"CLASSIC"` boards (`>= 4` distinct `QuestionFormatV4` types even on Act I Node 1!)
 * - Guarantees lively board twists (`PADLOCK` chains, `WHEEL_CURVEBALL`, `LIGHTNING_BLITZ`, `CROWN_WEDGE`, `POWER_PLAY`, `RIVAL_BOUNTY`)
 * - Populates `boardTwistId`, `boardTwistLabel`, `tileMetaById`, and `tugOfWarTurf` 1:1 for `LivingStageBoardView`
 * - Initializes `"SCREW RIVAL!"` token economy (`1` base in rival matches, `+1` via `velvet_wax_seal`)
 * - Initializes match-start Podium Lucky Charm perks (`grassroots_megaphone`, `alistairs_pocketwatch`, `screw_shield`, `frankies_coaster`)
 */
export function generateStageBoardV5(
  configOrNode:
    | (CampaignNodeV5 & { readonly boardTwistId?: BoardTwistIdV5 | string })
    | GenerateStageBoardV5Config = {},
  options?: Omit<GenerateStageBoardV5Config, 'node'>,
): StageBoardStateV5 {
  const node = isCampaignNodeV5(configOrNode) ? configOrNode : configOrNode.node;
  const opts: GenerateStageBoardV5Config = isCampaignNodeV5(configOrNode)
    ? (options ?? {})
    : configOrNode;

  const rng =
    opts.rng ??
    (opts.seed !== undefined ? createSeededRng(opts.seed) : Math.random);

  const boardTwistId = resolveBoardTwistIdV5(
    opts.boardTwistId ?? node?.boardTwistId,
    opts.topology ?? node?.topology,
  );
  const twistSpec = BOARD_TOPOLOGIES_CATALOG_V5[boardTwistId];

  const { v4Topology, campaignTopology } =
    opts.topology || node?.topology
      ? mapCampaignTopologyToBoardV4(opts.topology ?? node?.topology)
      : {
          v4Topology: twistSpec.v4Topology,
          campaignTopology: twistSpec.campaignTopology,
        };

  const cols: 4 | 5 | 6 = opts.cols ?? node?.boardCols ?? twistSpec.defaultCols;
  const rows: 3 | 4 = opts.rows ?? node?.boardRows ?? twistSpec.defaultRows;
  const challengerId =
    opts.challengerId !== undefined ? opts.challengerId : (node?.challengerId ?? null);
  const hasActiveRival =
    opts.hasActiveRival !== undefined ? opts.hasActiveRival : challengerId !== null;
  const soloTargetScore = opts.soloTargetScore ?? node?.soloTargetScore ?? 1000;
  const maxTurns = opts.maxTurns ?? node?.maxTurns;

  const startMods = getMatchStartCharmModifiers(opts.equippedCharms, hasActiveRival);
  const formatPool = buildGuaranteedFormatPoolV5(
    opts.featuredFormats ?? node?.featuredFormats,
    rng,
  );
  const expandedDomains = expandPreferredDomainsForCols(
    opts.preferredDomains ?? node?.preferredDomains,
    cols,
    rng,
  );

  const baseConfig: CreateStageBoardConfigV4 = {
    boardId: opts.boardId ?? (node ? `v5_${node.nodeId}` : `v5_${boardTwistId}_${cols}x${rows}`),
    topology: v4Topology,
    cols,
    rows,
    maxTurns,
    allowedFormats: formatPool,
    domains: opts.draftedColumns ? undefined : expandedDomains,
    draftedColumns: opts.draftedColumns,
    hasActiveRival,
    soloTargetScore,
    initialLifelines5050: opts.initialLifelines5050 ?? 2,
    initialLifelinesHint: (opts.initialLifelinesHint ?? 2) + startMods.extraClueCoins,
    rng,
  };

  const v4Board = createStageBoard(baseConfig);
  const enriched = applyTopologyGeometryAndRichnessV5(v4Board, boardTwistId, formatPool, rng);

  const guaranteedFormats = Array.from(
    new Set(enriched.board.tiles.map((t) => t.format)),
  );

  const playerScrewTokensMax = hasActiveRival ? 1 + startMods.extraScrewTokens : 0;

  return {
    ...enriched.board,
    v5Version: '5.0',
    campaignTopology,
    boardTwistId,
    boardTwistLabel: twistSpec.label,
    tileMetaById: enriched.tileMetaById,
    tugOfWarTurf: enriched.tugOfWarTurf,
    tugOfWarBonusAwardedTo: null,
    hotPotatoTileId: enriched.hotPotatoTileId,
    hotPotatoTurnsLeft: enriched.hotPotatoTurnsLeft,
    isOxfordDraftBoard: enriched.isOxfordDraftBoard,
    challengerId,
    playerScrewTokensLeft: playerScrewTokensMax,
    playerScrewTokensMax,
    rivalScrewTokensLeft: hasActiveRival ? 1 : 0,
    playerSuccessfulScrews: 0,
    playerBackfiredScrews: 0,
    rivalScrewsDeployed: 0,
    rivalScrewsBlockedByShield: 0,
    paidOutRowIndices: [],
    paidOutColIndices: [],
    totalLineSweepJackpotPoints: 0,
    charms: {
      equippedCharms: startMods.equippedCharms,
      frankiesCoasterUsed: false,
      screwShieldChargesLeft: startMods.screwShieldCharges,
      totalCharmBonusPoints: 0,
      totalCharmPenaltySaved: 0,
      triggerCounts: {},
    },
    bonusShotClockSec: startMods.bonusShotClockSec,
    lifelinesUsedCount: 0,
    guaranteedFormats,
  };
}

// ============================================================================
// 5. ROW & COLUMN STAGE SWEEP JACKPOTS (`checkLineSweepJackpots`)
// ============================================================================

export interface LineSweepJackpotEntryV5 {
  readonly kind: 'ROW' | 'COLUMN';
  readonly index: number;
  readonly pointsAwarded: number;
  readonly unlockedWedge: WedgeColorId | null;
  readonly banner: string;
}

export interface LineSweepJackpotResultV5 {
  readonly board: StageBoardStateV5;
  readonly jackpots: readonly LineSweepJackpotEntryV5[];
  readonly totalPointsAwarded: number;
  readonly newlyUnlockedWedges: readonly WedgeColorId[];
  readonly previousPlayerScore: number;
  readonly newPlayerScore: number;
}

function pickUncollectedWedgeForLine(
  board: StageBoardStateV5,
  currentEarned: readonly WedgeColorId[],
  kind: 'ROW' | 'COLUMN',
  lineIndex: number,
): WedgeColorId | null {
  if (kind === 'COLUMN') {
    const colWedge = board.columns[lineIndex]?.wedgeId;
    if (colWedge && !currentEarned.includes(colWedge)) {
      return colWedge;
    }
  }
  for (const col of board.columns) {
    if (!currentEarned.includes(col.wedgeId)) {
      return col.wedgeId;
    }
  }
  for (const wedge of ALL_WEDGE_IDS_V4) {
    if (!currentEarned.includes(wedge)) {
      return wedge;
    }
  }
  return null;
}

/**
 * Checks whether completing `completedTileId` (or any unpaid line on the board if omitted)
 * finishes **all tiles in that column OR all tiles in that row**.
 *
 * For each newly completed unpaid line:
 * - Awards an honest **`+300 PTS`** Stage Sweep Jackpot (`LINE_SWEEP_JACKPOT_POINTS_V5`)
 * - Unlocks an uncollected `WedgeColorId` if available
 * - Records the row/col index so no line ever pays out twice
 * - Guarantees strict 1:1 score conservation (`newPlayerScore === previousPlayerScore + totalPointsAwarded`)
 */
export function checkLineSweepJackpots(
  board: StageBoardStateV5,
  completedTileId?: string,
): LineSweepJackpotResultV5 {
  const { cols, rows } = getBoardDimensions(board);
  const previousPlayerScore = sanitizeInt(board.playerScore, 0);

  const rowCandidates: number[] = [];
  const colCandidates: number[] = [];

  if (completedTileId) {
    const tile = getTileById(board, completedTileId);
    if (tile) {
      rowCandidates.push(tile.rowIndex);
      colCandidates.push(tile.colIndex);
    }
  } else {
    for (let r = 0; r < rows; r++) rowCandidates.push(r);
    for (let c = 0; c < cols; c++) colCandidates.push(c);
  }

  const nextPaidRows = [...board.paidOutRowIndices];
  const nextPaidCols = [...board.paidOutColIndices];
  const nextEarnedWedges = [...board.earnedWedges];
  const jackpots: LineSweepJackpotEntryV5[] = [];
  const newlyUnlockedWedges: WedgeColorId[] = [];
  let totalPointsAwarded = 0;

  for (const colIndex of colCandidates) {
    if (colIndex < 0 || colIndex >= cols) continue;
    if (nextPaidCols.includes(colIndex)) continue;
    const colTiles = board.tiles.filter((t) => t.colIndex === colIndex);
    if (colTiles.length === rows && colTiles.every((t) => !isUnplayedTileStatus(t.status))) {
      nextPaidCols.push(colIndex);
      totalPointsAwarded += LINE_SWEEP_JACKPOT_POINTS_V5;
      const unlockedWedge = pickUncollectedWedgeForLine(board, nextEarnedWedges, 'COLUMN', colIndex);
      if (unlockedWedge) {
        nextEarnedWedges.push(unlockedWedge);
        newlyUnlockedWedges.push(unlockedWedge);
      }
      const colTitle = board.columns[colIndex]?.wittyTitle ?? `Column ${colIndex + 1}`;
      const wedgeNote = unlockedWedge
        ? ` + ${WEDGE_CATALOG_V4[unlockedWedge].shortLabel} Crown Wedge!`
        : '!';
      jackpots.push({
        kind: 'COLUMN',
        index: colIndex,
        pointsAwarded: LINE_SWEEP_JACKPOT_POINTS_V5,
        unlockedWedge,
        banner: `COLUMN SWEEP JACKPOT! Cleared "${colTitle}" for +${LINE_SWEEP_JACKPOT_POINTS_V5} PTS${wedgeNote}`,
      });
    }
  }

  for (const rowIndex of rowCandidates) {
    if (rowIndex < 0 || rowIndex >= rows) continue;
    if (nextPaidRows.includes(rowIndex)) continue;
    const rowTiles = board.tiles.filter((t) => t.rowIndex === rowIndex);
    if (rowTiles.length === cols && rowTiles.every((t) => !isUnplayedTileStatus(t.status))) {
      nextPaidRows.push(rowIndex);
      totalPointsAwarded += LINE_SWEEP_JACKPOT_POINTS_V5;
      const unlockedWedge = pickUncollectedWedgeForLine(board, nextEarnedWedges, 'ROW', rowIndex);
      if (unlockedWedge) {
        nextEarnedWedges.push(unlockedWedge);
        newlyUnlockedWedges.push(unlockedWedge);
      }
      const rowPoints = rowTiles[0]?.pointValue ?? (rowIndex + 1) * 100;
      const wedgeNote = unlockedWedge
        ? ` + ${WEDGE_CATALOG_V4[unlockedWedge].shortLabel} Crown Wedge!`
        : '!';
      jackpots.push({
        kind: 'ROW',
        index: rowIndex,
        pointsAwarded: LINE_SWEEP_JACKPOT_POINTS_V5,
        unlockedWedge,
        banner: `ROW SWEEP JACKPOT! Cleared the ${rowPoints}-PT row for +${LINE_SWEEP_JACKPOT_POINTS_V5} PTS${wedgeNote}`,
      });
    }
  }

  if (jackpots.length === 0) {
    return {
      board,
      jackpots: [],
      totalPointsAwarded: 0,
      newlyUnlockedWedges: [],
      previousPlayerScore,
      newPlayerScore: previousPlayerScore,
    };
  }

  const newPlayerScore = previousPlayerScore + totalPointsAwarded;
  const nextBoard: StageBoardStateV5 = {
    ...board,
    playerScore: newPlayerScore,
    earnedWedges: nextEarnedWedges,
    completedLinesCount: board.completedLinesCount + jackpots.length,
    paidOutRowIndices: nextPaidRows,
    paidOutColIndices: nextPaidCols,
    totalLineSweepJackpotPoints: board.totalLineSweepJackpotPoints + totalPointsAwarded,
  };

  return {
    board: nextBoard,
    jackpots,
    totalPointsAwarded,
    newlyUnlockedWedges,
    previousPlayerScore,
    newPlayerScore,
  };
}

// ============================================================================
// 6. INTERNAL 14-TOPOLOGY LIVE TURN MECHANICS HELPERS
// ============================================================================

interface TopologyPreScoreBonusV5 {
  readonly bonusPoints: number;
  readonly notes: readonly string[];
  readonly defusedHotPotato: boolean;
  readonly triggeredFlameThaw: boolean;
}

function computeTopologyTurnBonusesV5(
  board: StageBoardStateV5,
  targetTile: BoardTileV4,
  isCorrect: boolean,
  wasForcedTile: boolean,
  powerPlayWager: number | null | undefined,
): TopologyPreScoreBonusV5 {
  if (!isCorrect) {
    return { bonusPoints: 0, notes: [], defusedHotPotato: false, triggeredFlameThaw: false };
  }

  const meta = board.tileMetaById[targetTile.tileId];
  let bonusPoints = 0;
  const notes: string[] = [];
  let defusedHotPotato = false;
  let triggeredFlameThaw = false;

  if (meta?.isSpiralCore) {
    const coreBonus = Math.max(0, BOARD_TWIST_BONUS_V5.spiralCoreTargetPoints - targetTile.pointValue);
    if (coreBonus > 0) {
      bonusPoints += coreBonus;
      notes.push(`+${coreBonus} Spiral Core 1,000-PT Vault`);
    }
  }

  if (meta?.isPyramidApex) {
    const apexBonus = Math.max(0, BOARD_TWIST_BONUS_V5.pyramidApexTargetPoints - targetTile.pointValue);
    if (apexBonus > 0) {
      bonusPoints += apexBonus;
      notes.push(`+${apexBonus} Pyramid Summit Crown`);
    }
  }

  if (meta?.isCrossroadsDiagonal && powerPlayWager == null) {
    bonusPoints += targetTile.pointValue;
    notes.push(`+${targetTile.pointValue} Velvet X-Crossroads 2x`);
  }

  if (meta?.isGoldFever && powerPlayWager == null) {
    bonusPoints += targetTile.pointValue;
    notes.push(`+${targetTile.pointValue} Gold Fever 2x`);
  }

  if (meta?.isFlameThaw) {
    triggeredFlameThaw = true;
    bonusPoints += BOARD_TWIST_BONUS_V5.flameThawBonus;
    notes.push(`+${BOARD_TWIST_BONUS_V5.flameThawBonus} Flame-Thaw Bonus`);
  }

  if (board.boardTwistId === 'time_bomb_hot_potato' && board.hotPotatoTileId === targetTile.tileId) {
    defusedHotPotato = true;
    bonusPoints += BOARD_TWIST_BONUS_V5.hotPotatoDefuseBonus;
    notes.push(`+${BOARD_TWIST_BONUS_V5.hotPotatoDefuseBonus} Hot Potato Defused`);
  }

  if (board.boardTwistId === 'spotlight_roulette' && wasForcedTile) {
    bonusPoints += BOARD_TWIST_BONUS_V5.spotlightForcedPoiseBonus;
    notes.push(`+${BOARD_TWIST_BONUS_V5.spotlightForcedPoiseBonus} Spotlight Poise`);
  }

  if (board.boardTwistId === 'power_play_minefield' && targetTile.twist === 'POWER_PLAY') {
    bonusPoints += BOARD_TWIST_BONUS_V5.powerPlayMinefieldBonus;
    notes.push(`+${BOARD_TWIST_BONUS_V5.powerPlayMinefieldBonus} Minefield Nerve`);
  }

  if (board.boardTwistId === 'oxford_pick_ban' || board.isOxfordDraftBoard) {
    const col = board.columns[targetTile.colIndex];
    if (col?.pickedBy === 'PLAYER') {
      bonusPoints += BOARD_TWIST_BONUS_V5.oxfordPlayerPickBonus;
      notes.push(`+${BOARD_TWIST_BONUS_V5.oxfordPlayerPickBonus} Draft Pick Home Turf`);
    } else if (col?.pickedBy === 'RIVAL') {
      bonusPoints += BOARD_TWIST_BONUS_V5.oxfordRivalPickUpsetBonus;
      notes.push(`+${BOARD_TWIST_BONUS_V5.oxfordRivalPickUpsetBonus} Rival-Draft Upset`);
    }
  }

  if (
    board.boardTwistId === 'championship_gauntlet' &&
    targetTile.twist === 'CROWN_WEDGE' &&
    !board.earnedWedges.includes(targetTile.wedgeId) &&
    board.earnedWedges.length >= 3
  ) {
    bonusPoints += BOARD_TWIST_BONUS_V5.gauntletCrownSurgeBonus;
    notes.push(`+${BOARD_TWIST_BONUS_V5.gauntletCrownSurgeBonus} Championship Crown Surge`);
  }

  return { bonusPoints, notes, defusedHotPotato, triggeredFlameThaw };
}

function recomputeTugOfWarTurf(board: StageBoardStateV5): TugOfWarTurfStateV5 | null {
  if (board.boardTwistId !== 'tug_of_war_turf' && !board.tugOfWarTurf) {
    return null;
  }
  let playerTiles = 0;
  let rivalTiles = 0;
  for (const t of board.tiles) {
    if (t.status === 'CLEARED_WIN') playerTiles++;
    else if (t.status === 'CLAIMED_BY_RIVAL') rivalTiles++;
  }
  return {
    playerTiles,
    rivalTiles,
    bonusPts: BOARD_TWIST_BONUS_V5.tugOfWarMajorityBonus,
  };
}

function applyPostTurnTopologyEffectsV5(
  board: StageBoardStateV5,
  resolvedTile: BoardTileV4,
  playerWonTile: boolean,
  newStreak: number,
  triggeredFlameThaw: boolean,
  rng: () => number,
): {
  readonly board: StageBoardStateV5;
  readonly extraUnlockedTileIds: readonly string[];
  readonly topologyEvents: readonly string[];
  readonly extraPlayerBonusPoints: number;
  readonly extraRivalBonusPoints: number;
} {
  const columns = board.columns.map((c) => ({ ...c }));
  const tiles = board.tiles.map((t) => ({ ...t }));
  const tileMetaById: Record<string, BoardTileVisualMetaV5> = { ...board.tileMetaById };
  const extraUnlockedTileIds: string[] = [];
  const topologyEvents: string[] = [];
  let extraPlayerBonusPoints = 0;
  let extraRivalBonusPoints = 0;
  let hotPotatoTileId = board.hotPotatoTileId;
  let hotPotatoTurnsLeft = board.hotPotatoTurnsLeft;
  let tugOfWarBonusAwardedTo = board.tugOfWarBonusAwardedTo;

  const prevMeta = tileMetaById[resolvedTile.tileId];
  // Clear consumed tile's live meta flags (hot potato / flame thaw) cleanly
  if (prevMeta?.hotPotatoTurnsLeft !== undefined || prevMeta?.isFlameThaw) {
    const cleaned: BoardTileVisualMetaV5 = {
      ...prevMeta,
      hotPotatoTurnsLeft: undefined,
      isFlameThaw: undefined,
    };
    tileMetaById[resolvedTile.tileId] = cleaned;
  }

  // 1. `chain_padlocks`: 2+ streak triggers bonus chain-reaction shatter on an adjacent/nearby locked tile!
  if (board.boardTwistId === 'chain_padlocks' && playerWonTile && newStreak >= 2) {
    const lockedNeighbors = tiles
      .filter((t) => t.status === 'PADLOCKED')
      .sort((a, b) => {
        const da =
          Math.abs(a.colIndex - resolvedTile.colIndex) + Math.abs(a.rowIndex - resolvedTile.rowIndex);
        const db =
          Math.abs(b.colIndex - resolvedTile.colIndex) + Math.abs(b.rowIndex - resolvedTile.rowIndex);
        return da - db;
      });
    if (lockedNeighbors.length > 0) {
      const target = lockedNeighbors[0];
      const idx = tiles.findIndex((t) => t.tileId === target.tileId);
      tiles[idx] = {
        ...tiles[idx],
        status: columns[target.colIndex].frozenTurnsRemaining > 0 ? 'FROZEN_BY_RIVAL' : 'OPEN',
        twistRevealedToPlayer: true,
      };
      extraUnlockedTileIds.push(target.tileId);
      topologyEvents.push(
        `CHAIN REACTION! Streak shattered an extra iron vault on ${columns[target.colIndex].wittyTitle}!`,
      );
    }
  }

  // 2. `fog_spotlight`: Solving ANY tile cuts an 8-neighbor spotlight cone (including diagonals!) through Stage Fog!
  if (board.boardTwistId === 'fog_spotlight') {
    const diagDeltas: ReadonlyArray<readonly [number, number]> = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ];
    for (const [dc, dr] of diagDeltas) {
      const nbIdx = tiles.findIndex(
        (t) => t.colIndex === resolvedTile.colIndex + dc && t.rowIndex === resolvedTile.rowIndex + dr,
      );
      if (nbIdx < 0) continue;
      if (tiles[nbIdx].status === 'FOGGED') {
        const colFrozen = columns[tiles[nbIdx].colIndex].frozenTurnsRemaining > 0;
        tiles[nbIdx] = {
          ...tiles[nbIdx],
          status: colFrozen ? 'FROZEN_BY_RIVAL' : 'OPEN',
          twistRevealedToPlayer: true,
        };
        extraUnlockedTileIds.push(tiles[nbIdx].tileId);
      }
    }
    if (extraUnlockedTileIds.length > 0) {
      topologyEvents.push(
        `STAGE SPOTLIGHT! Swept fog off ${extraUnlockedTileIds.length} diagonal tiles!`,
      );
    }
  }

  // 3. `ice_fire_columns`: Solving a Flame-Thaw tile melts ALL frozen Ice columns immediately!
  if (triggeredFlameThaw) {
    let meltedCount = 0;
    for (let c = 0; c < columns.length; c++) {
      if (columns[c].frozenTurnsRemaining > 0) {
        columns[c] = { ...columns[c], frozenTurnsRemaining: 0 };
      }
    }
    for (let i = 0; i < tiles.length; i++) {
      if (tiles[i].status === 'FROZEN_BY_RIVAL') {
        tiles[i] = { ...tiles[i], status: 'OPEN', twistRevealedToPlayer: true };
        extraUnlockedTileIds.push(tiles[i].tileId);
        meltedCount++;
      }
    }
    if (meltedCount > 0) {
      topologyEvents.push(
        `FLAME THAW! Melted ${meltedCount} frozen Ice tiles across the board (+${BOARD_TWIST_BONUS_V5.flameThawBonus} PTS)!`,
      );
    }
  }

  // 4. `gold_fever_contagion` (and Gold keystone on `championship_gauntlet`): Streak/Gold spreads 2x Gold Fever!
  if (
    playerWonTile &&
    (board.boardTwistId === 'gold_fever_contagion' || prevMeta?.isGoldFever) &&
    (prevMeta?.isGoldFever || newStreak >= 2)
  ) {
    const orthDeltas: ReadonlyArray<readonly [number, number]> = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const spreadTargets: BoardTileV4[] = [];
    for (const [dc, dr] of orthDeltas) {
      const nb = tiles.find(
        (t) =>
          t.colIndex === resolvedTile.colIndex + dc &&
          t.rowIndex === resolvedTile.rowIndex + dr &&
          isUnplayedTileStatus(t.status) &&
          !tileMetaById[t.tileId]?.isGoldFever,
      );
      if (nb) spreadTargets.push(nb);
    }
    const chosenSpread = spreadTargets.sort(() => rng() - 0.5).slice(0, 2);
    for (const nb of chosenSpread) {
      tileMetaById[nb.tileId] = {
        ...tileMetaById[nb.tileId],
        isGoldFever: true,
        displayPointsOverride: nb.pointValue * 2,
      };
    }
    if (chosenSpread.length > 0) {
      topologyEvents.push(
        `GOLD FEVER CONTAGION! 2x gold glow jumped to ${chosenSpread.length} neighboring tile${chosenSpread.length === 1 ? '' : 's'}!`,
      );
    }
  }

  // 5. `time_bomb_hot_potato`: Manage fuse countdown, defusal relocation, or detonation blast!
  if (board.boardTwistId === 'time_bomb_hot_potato') {
    const pickNextBombTile = (): BoardTileV4 | null => {
      const openPool = tiles.filter(
        (t) =>
          t.status === 'OPEN' &&
          columns[t.colIndex].frozenTurnsRemaining <= 0 &&
          t.tileId !== resolvedTile.tileId,
      );
      return openPool.length > 0 ? pickFrom(openPool, rng) : null;
    };

    if (hotPotatoTileId === resolvedTile.tileId) {
      // Player engaged the Hot Potato tile directly!
      if (!playerWonTile && board.hasActiveRival) {
        extraRivalBonusPoints += BOARD_TWIST_BONUS_V5.hotPotatoBlastRivalSpoils;
        topologyEvents.push(
          `HOT POTATO DETONATED! Rival scooped +${BOARD_TWIST_BONUS_V5.hotPotatoBlastRivalSpoils} blast spoils!`,
        );
      } else if (playerWonTile) {
        topologyEvents.push(
          `HOT POTATO DEFUSED! +${BOARD_TWIST_BONUS_V5.hotPotatoDefuseBonus} PTS secured!`,
        );
      }
      if (!board.isBoardComplete) {
        const nextBomb = pickNextBombTile();
        if (nextBomb) {
          hotPotatoTileId = nextBomb.tileId;
          hotPotatoTurnsLeft = BOARD_TWIST_BONUS_V5.hotPotatoInitialFuseTurns;
          tileMetaById[nextBomb.tileId] = {
            ...tileMetaById[nextBomb.tileId],
            hotPotatoTurnsLeft,
          };
        } else {
          hotPotatoTileId = null;
          hotPotatoTurnsLeft = 0;
        }
      } else {
        hotPotatoTileId = null;
        hotPotatoTurnsLeft = 0;
      }
    } else if (hotPotatoTileId) {
      const bombTile = tiles.find((t) => t.tileId === hotPotatoTileId);
      if (bombTile && isUnplayedTileStatus(bombTile.status)) {
        const nextFuse = Math.max(0, hotPotatoTurnsLeft - 1);
        if (nextFuse > 0) {
          hotPotatoTurnsLeft = nextFuse;
          tileMetaById[hotPotatoTileId] = {
            ...tileMetaById[hotPotatoTileId],
            hotPotatoTurnsLeft: nextFuse,
          };
        } else {
          // Fuse hit 0 -> DETONATES & JUMPS!
          tileMetaById[hotPotatoTileId] = {
            ...tileMetaById[hotPotatoTileId],
            hotPotatoTurnsLeft: undefined,
          };
          if (board.hasActiveRival) {
            extraRivalBonusPoints += BOARD_TWIST_BONUS_V5.hotPotatoBlastRivalSpoils;
            topologyEvents.push(
              `BOOM! Time-Bomb Hot Potato blew and jumped — Rival pocketed +${BOARD_TWIST_BONUS_V5.hotPotatoBlastRivalSpoils} PTS!`,
            );
          } else {
            topologyEvents.push('BOOM! Time-Bomb Hot Potato detonated and jumped to a new tile!');
          }
          const nextBomb = !board.isBoardComplete ? pickNextBombTile() : null;
          if (nextBomb) {
            hotPotatoTileId = nextBomb.tileId;
            hotPotatoTurnsLeft = BOARD_TWIST_BONUS_V5.hotPotatoInitialFuseTurns;
            tileMetaById[nextBomb.tileId] = {
              ...tileMetaById[nextBomb.tileId],
              hotPotatoTurnsLeft,
            };
          } else {
            hotPotatoTileId = null;
            hotPotatoTurnsLeft = 0;
          }
        }
      } else {
        hotPotatoTileId = null;
        hotPotatoTurnsLeft = 0;
      }
    }
  }

  let nextBoard: StageBoardStateV5 = {
    ...board,
    columns,
    tiles,
    tileMetaById,
    hotPotatoTileId,
    hotPotatoTurnsLeft,
    rivalScore: board.rivalScore + extraRivalBonusPoints,
  };

  // 6. `tug_of_war_turf`: Refresh live Turf Meter & award +500 Majority Bonus on final board completion!
  const nextTurf = recomputeTugOfWarTurf(nextBoard);
  if (nextTurf) {
    nextBoard = { ...nextBoard, tugOfWarTurf: nextTurf };
    if (nextBoard.isBoardComplete && tugOfWarBonusAwardedTo === null) {
      if (nextTurf.playerTiles > nextTurf.rivalTiles) {
        tugOfWarBonusAwardedTo = 'PLAYER';
        extraPlayerBonusPoints += BOARD_TWIST_BONUS_V5.tugOfWarMajorityBonus;
        nextBoard = {
          ...nextBoard,
          playerScore: nextBoard.playerScore + BOARD_TWIST_BONUS_V5.tugOfWarMajorityBonus,
          tugOfWarBonusAwardedTo,
        };
        topologyEvents.push(
          `TERRITORY TURF VICTORY! Controlled ${nextTurf.playerTiles} vs ${nextTurf.rivalTiles} tiles for +${BOARD_TWIST_BONUS_V5.tugOfWarMajorityBonus} PTS!`,
        );
      } else if (nextTurf.rivalTiles > nextTurf.playerTiles && nextBoard.hasActiveRival) {
        tugOfWarBonusAwardedTo = 'RIVAL';
        extraRivalBonusPoints += BOARD_TWIST_BONUS_V5.tugOfWarMajorityBonus;
        nextBoard = {
          ...nextBoard,
          rivalScore: nextBoard.rivalScore + BOARD_TWIST_BONUS_V5.tugOfWarMajorityBonus,
          tugOfWarBonusAwardedTo,
        };
        topologyEvents.push(
          `RIVAL TURF MAJORITY! Challenger held ${nextTurf.rivalTiles} vs ${nextTurf.playerTiles} tiles for +${BOARD_TWIST_BONUS_V5.tugOfWarMajorityBonus} PTS!`,
        );
      } else {
        tugOfWarBonusAwardedTo = 'TIE';
        nextBoard = { ...nextBoard, tugOfWarBonusAwardedTo };
      }
    }
  }

  return {
    board: nextBoard,
    extraUnlockedTileIds,
    topologyEvents,
    extraPlayerBonusPoints,
    extraRivalBonusPoints,
  };
}

// ============================================================================
// 7. AUTHENTIC "SCREW RIVAL!" MECHANIC (`executePlayerScrewOnTile` & `maybeTriggerRivalScrew`)
// ============================================================================

export interface ChallengerScrewOddsV5 {
  readonly challengerId: string;
  readonly challengerName: string;
  readonly domainAffinity: 'STRONG' | 'WEAK' | 'NEUTRAL';
  /** Probability [0.10..0.90] that the Challenger nails the forced tile (Backfire risk). */
  readonly nailProbability: number;
  /** Probability [0.10..0.90] that the Challenger chokes (Player steals +100% of tile value!). */
  readonly chokeProbability: number;
  readonly scoutingBadge: string;
}

/**
 * Evaluates a Challenger's live attempt probability when hit by `"SCREW RIVAL!"` based on
 * their canon specialty domains vs. weak domains + tile row value (`100..800`) under 5s pressure.
 */
export function evaluateChallengerScrewChance(
  challengerOrId:
    | ChallengerProfileV4
    | ChallengerScrewProfileV5
    | ChallengerIdV5
    | string
    | null
    | undefined,
  tile: Pick<BoardTileV4, 'domainId' | 'pointValue'>,
): ChallengerScrewOddsV5 {
  const spec = getChallengerSpecV5(challengerOrId);
  let nailProb = spec.baseAccuracy - 0.08; // 5-second Screw spotlight pressure

  let domainAffinity: 'STRONG' | 'WEAK' | 'NEUTRAL' = 'NEUTRAL';
  if (spec.weakDomains.includes(tile.domainId)) {
    domainAffinity = 'WEAK';
    nailProb -= 0.24;
  } else if (spec.strongDomains.includes(tile.domainId)) {
    domainAffinity = 'STRONG';
    nailProb += 0.18;
  }

  switch (tile.pointValue) {
    case 100:
      nailProb += 0.08;
      break;
    case 200:
      nailProb += 0.02;
      break;
    case 400:
      nailProb -= 0.06;
      break;
    case 800:
      nailProb -= 0.14;
      break;
  }

  const clampedNail = Math.max(0.1, Math.min(0.9, Number(nailProb.toFixed(4))));
  const chokeProbability = Number((1 - clampedNail).toFixed(4));
  const chokePct = Math.round(chokeProbability * 100);

  let scoutingBadge: string;
  if (domainAffinity === 'WEAK') {
    scoutingBadge = `WEAK SPOT · ${chokePct}% CHOKE CHANCE`;
  } else if (domainAffinity === 'STRONG') {
    scoutingBadge = `RIVAL TURF · ${chokePct}% CHOKE CHANCE`;
  } else {
    scoutingBadge = `LIVE TRAP · ${chokePct}% CHOKE CHANCE`;
  }

  return {
    challengerId: spec.id,
    challengerName: spec.name,
    domainAffinity,
    nailProbability: clampedNail,
    chokeProbability,
    scoutingBadge,
  };
}

export interface ExecutePlayerScrewOptionsV5 {
  readonly challenger?: ChallengerProfileV4 | ChallengerIdV5 | string | null;
  readonly rng?: () => number;
  /** Deterministic override for unit testing or tutorial scripts. */
  readonly forcedOutcome?: 'CHOKED' | 'NAILED';
  /** Defaults to true: resolves the tile as the current turn and checks Row/Col sweeps. */
  readonly consumeTurn?: boolean;
  /** Defaults to true: automatically awards +300 PTS + Wedge if a Choke completes a Row/Col. */
  readonly autoCheckLineSweeps?: boolean;
}

export interface PlayerScrewResultV5 {
  readonly executed: boolean;
  readonly errorReason?: string;
  readonly board: StageBoardStateV5;
  readonly targetTile: BoardTileV4 | null;
  readonly odds: ChallengerScrewOddsV5 | null;
  readonly outcome: 'CHOKED' | 'BACKFIRED' | 'REJECTED';
  readonly previousPlayerScore: number;
  readonly newPlayerScore: number;
  /** Exact 1:1 net change to playerScore (`screwStealPoints + lineSweepPoints + topologyPlayerBonus`). */
  readonly playerScoreDelta: number;
  readonly screwStealPoints: number;
  readonly previousRivalScore: number;
  readonly newRivalScore: number;
  /** Exact 1:1 net change to rivalScore (`+tile.pointValue` on Backfire + any topology rival bonus). */
  readonly rivalScoreDelta: number;
  readonly shatteredNeighborTileIds: readonly string[];
  readonly stageSurgeUnlockedIds: readonly string[];
  readonly awardedPlayerWedge: WedgeColorId | null;
  readonly awardedRivalWedge: WedgeColorId | null;
  readonly lineSweepJackpots: readonly LineSweepJackpotEntryV5[];
  readonly topologyEvents: readonly string[];
  readonly challengerLine: string;
  readonly hostLine: string;
}

/**
 * Executes the authentic *You Don't Know Jack*-style `"SCREW RIVAL!"` trap on an open tile:
 * - Requires an active Rival, `playerScrewTokensLeft > 0`, and an `'OPEN'` unfrozen tile.
 * - **Challenger Chokes (Misses):** Player STEALS `+100%` of `tile.pointValue` (strict 1:1 addition),
 *   marks tile `'CLEARED_WIN'`, shatters orthogonal `PADLOCKED`/`FOGGED` neighbors open, awards
 *   Crown Wedge + Row/Column Stage Sweep Jackpots if completed, and delivers custom Max + Challenger lines!
 * - **Challenger Nails It (Backfire!):** Challenger banks `+100%` of `tile.pointValue` onto `rivalScore`,
 *   claims the tile (`'CLAIMED_BY_RIVAL'`), and delivers custom gloat + Max panic lines!
 * - Always protects against soft-locks via `ensurePlayableTilesOrStageSurge`.
 */
export function executePlayerScrewOnTile(
  board: StageBoardStateV5,
  tileId: string,
  options: ExecutePlayerScrewOptionsV5 = {},
): PlayerScrewResultV5 {
  const prevPlayerScore = sanitizeInt(board.playerScore, 0);
  const prevRivalScore = sanitizeInt(board.rivalScore, 0);

  const reject = (errorReason: string): PlayerScrewResultV5 => ({
    executed: false,
    errorReason,
    board,
    targetTile: getTileById(board, tileId) ?? null,
    odds: null,
    outcome: 'REJECTED',
    previousPlayerScore: prevPlayerScore,
    newPlayerScore: prevPlayerScore,
    playerScoreDelta: 0,
    screwStealPoints: 0,
    previousRivalScore: prevRivalScore,
    newRivalScore: prevRivalScore,
    rivalScoreDelta: 0,
    shatteredNeighborTileIds: [],
    stageSurgeUnlockedIds: [],
    awardedPlayerWedge: null,
    awardedRivalWedge: null,
    lineSweepJackpots: [],
    topologyEvents: [],
    challengerLine: '',
    hostLine: errorReason,
  });

  if (board.isBoardComplete) {
    return reject('Cannot use SCREW RIVAL! after the board is complete.');
  }
  if (!board.hasActiveRival) {
    return reject('SCREW RIVAL! is only available in Rival head-to-head matches.');
  }
  if (board.playerScrewTokensLeft <= 0) {
    return reject('No SCREW RIVAL! tokens remaining this match.');
  }

  const tileIndex = board.tiles.findIndex((t) => t.tileId === tileId);
  if (tileIndex < 0) {
    return reject(`Unknown board tile "${tileId}".`);
  }
  const targetTile = board.tiles[tileIndex];
  if (targetTile.status !== 'OPEN') {
    return reject(`Tile "${tileId}" is not OPEN (${targetTile.status}).`);
  }
  const targetCol = board.columns[targetTile.colIndex];
  if (targetCol && targetCol.frozenTurnsRemaining > 0) {
    return reject(`Column "${targetCol.wittyTitle}" is frozen and cannot be targeted.`);
  }

  const rng = options.rng ?? Math.random;
  const consumeTurn = options.consumeTurn ?? true;
  const autoCheckLineSweeps = options.autoCheckLineSweeps ?? true;
  const challengerSpec = getChallengerSpecV5(options.challenger ?? board.challengerId);
  const odds = evaluateChallengerScrewChance(challengerSpec, targetTile);

  const roll = rng();
  const challengerChoked = options.forcedOutcome
    ? options.forcedOutcome === 'CHOKED'
    : roll >= odds.nailProbability;

  const nextColumns = board.columns.map((c) => ({ ...c }));
  const nextTiles = board.tiles.map((t) => ({ ...t }));

  if (consumeTurn) {
    for (const col of nextColumns) {
      if (col.frozenTurnsRemaining > 0) {
        col.frozenTurnsRemaining = Math.max(0, col.frozenTurnsRemaining - 1);
        if (col.frozenTurnsRemaining === 0) {
          for (const t of nextTiles) {
            if (t.colIndex === col.colIndex && t.status === 'FROZEN_BY_RIVAL') {
              t.status = 'OPEN';
            }
          }
        }
      }
    }
  }

  const categoryTitle = targetCol?.wittyTitle ?? DOMAIN_TOPIC_SUBTITLE_V4[targetTile.domainId];
  const pointStr = String(targetTile.pointValue);
  const shatteredNeighborTileIds: string[] = [];
  let awardedPlayerWedge: WedgeColorId | null = null;
  let awardedRivalWedge: WedgeColorId | null = null;
  const nextEarnedWedges = [...board.earnedWedges];
  const nextRivalWedges = [...board.rivalWedges];

  const neighborDeltas: ReadonlyArray<readonly [number, number]> = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  let screwStealPoints = 0;
  let baseRivalDelta = 0;
  let resolvedTile: BoardTileV4;

  if (challengerChoked) {
    screwStealPoints = targetTile.pointValue;
    resolvedTile = {
      ...nextTiles[tileIndex],
      status: 'CLEARED_WIN',
      twistRevealedToPlayer: true,
      forcedByRival: false,
    };
    nextTiles[tileIndex] = resolvedTile;

    for (const [dc, dr] of neighborDeltas) {
      const nbIdx = nextTiles.findIndex(
        (t) => t.colIndex === targetTile.colIndex + dc && t.rowIndex === targetTile.rowIndex + dr,
      );
      if (nbIdx < 0) continue;
      const nb = nextTiles[nbIdx];
      if (nb.status === 'PADLOCKED' || nb.status === 'FOGGED') {
        const nbFrozen = nextColumns[nb.colIndex].frozenTurnsRemaining > 0;
        nextTiles[nbIdx] = {
          ...nb,
          status: nbFrozen ? 'FROZEN_BY_RIVAL' : 'OPEN',
          twistRevealedToPlayer: true,
        };
        shatteredNeighborTileIds.push(nb.tileId);
      }
    }

    if (resolvedTile.twist === 'CROWN_WEDGE' && !nextEarnedWedges.includes(resolvedTile.wedgeId)) {
      nextEarnedWedges.push(resolvedTile.wedgeId);
      awardedPlayerWedge = resolvedTile.wedgeId;
    }
  } else {
    baseRivalDelta = targetTile.pointValue;
    resolvedTile = {
      ...nextTiles[tileIndex],
      status: 'CLAIMED_BY_RIVAL',
      twistRevealedToPlayer: true,
      forcedByRival: false,
    };
    nextTiles[tileIndex] = resolvedTile;

    for (const [dc, dr] of neighborDeltas) {
      const nbIdx = nextTiles.findIndex(
        (t) => t.colIndex === targetTile.colIndex + dc && t.rowIndex === targetTile.rowIndex + dr,
      );
      if (nbIdx < 0) continue;
      const nb = nextTiles[nbIdx];
      if (nb.status === 'PADLOCKED' || nb.status === 'FOGGED') {
        const nbFrozen = nextColumns[nb.colIndex].frozenTurnsRemaining > 0;
        nextTiles[nbIdx] = {
          ...nb,
          status: nbFrozen ? 'FROZEN_BY_RIVAL' : 'OPEN',
          twistRevealedToPlayer: nb.twist === 'POWER_PLAY' ? nb.twistRevealedToPlayer : true,
        };
      }
    }

    if (resolvedTile.twist === 'CROWN_WEDGE' && !nextRivalWedges.includes(resolvedTile.wedgeId)) {
      nextRivalWedges.push(resolvedTile.wedgeId);
      awardedRivalWedge = resolvedTile.wedgeId;
    }
  }

  const nextTurnNumber = consumeTurn ? board.turnNumber + 1 : board.turnNumber;
  const nextTurnsRemaining = consumeTurn
    ? Math.max(0, board.turnsRemaining - 1)
    : board.turnsRemaining;
  const unplayedRemaining = nextTiles.filter((t) => isUnplayedTileStatus(t.status)).length;
  const isBoardComplete = nextTurnsRemaining <= 0 || unplayedRemaining === 0;
  const clearedForced = board.forcedTileId === targetTile.tileId;

  let nextBoard: StageBoardStateV5 = {
    ...board,
    columns: nextColumns,
    tiles: nextTiles,
    turnNumber: nextTurnNumber,
    turnsRemaining: nextTurnsRemaining,
    playerScore: prevPlayerScore + screwStealPoints,
    rivalScore: prevRivalScore + baseRivalDelta,
    earnedWedges: nextEarnedWedges,
    rivalWedges: nextRivalWedges,
    forcedTileId: isBoardComplete || clearedForced ? null : board.forcedTileId,
    forcedReasonBanner: isBoardComplete || clearedForced ? null : board.forcedReasonBanner,
    isBoardComplete,
    playerScrewTokensLeft: board.playerScrewTokensLeft - 1,
    playerSuccessfulScrews: board.playerSuccessfulScrews + (challengerChoked ? 1 : 0),
    playerBackfiredScrews: board.playerBackfiredScrews + (challengerChoked ? 0 : 1),
  };

  // Check Row & Column Stage Sweep Jackpots on successful Player Screw
  let lineSweepJackpots: readonly LineSweepJackpotEntryV5[] = [];
  let lineSweepPoints = 0;
  if (challengerChoked && autoCheckLineSweeps) {
    const sweepRes = checkLineSweepJackpots(nextBoard, targetTile.tileId);
    nextBoard = sweepRes.board;
    lineSweepJackpots = sweepRes.jackpots;
    lineSweepPoints = sweepRes.totalPointsAwarded;
    if (!awardedPlayerWedge && sweepRes.newlyUnlockedWedges.length > 0) {
      awardedPlayerWedge = sweepRes.newlyUnlockedWedges[0];
    }
  }

  // Apply 14-topology live board rules (Turf Meter, Hot Potato, Fog Spotlight, Flame Thaw, Gold Fever)
  const flameThawTriggered = Boolean(challengerChoked && board.tileMetaById[targetTile.tileId]?.isFlameThaw);
  const topoRes = applyPostTurnTopologyEffectsV5(
    nextBoard,
    resolvedTile,
    challengerChoked,
    challengerChoked ? 1 : 0,
    flameThawTriggered,
    rng,
  );
  nextBoard = topoRes.board;
  for (const id of topoRes.extraUnlockedTileIds) {
    if (!shatteredNeighborTileIds.includes(id)) {
      shatteredNeighborTileIds.push(id);
    }
  }

  // Zero-soft-lock Stage Surge check
  let stageSurgeUnlockedIds: readonly string[] = [];
  if (!nextBoard.isBoardComplete) {
    const surge = ensurePlayableTilesOrStageSurge(nextBoard, rng, 2);
    if (surge.triggered || surge.board !== nextBoard) {
      nextBoard = {
        ...nextBoard,
        ...surge.board,
      };
      stageSurgeUnlockedIds = surge.unlockedTileIds;
    }
  }

  const totalPlayerDelta = screwStealPoints + lineSweepPoints + topoRes.extraPlayerBonusPoints;
  const totalRivalDelta = baseRivalDelta + topoRes.extraRivalBonusPoints;
  const shatterNote =
    shatteredNeighborTileIds.length > 0
      ? ` and shattered ${shatteredNeighborTileIds.length} locked vault${shatteredNeighborTileIds.length === 1 ? '' : 's'}`
      : '';

  const challengerLine = fillTemplate(
    pickFrom(
      challengerChoked
        ? challengerSpec.onScrewedChokeLines
        : challengerSpec.onScrewedBackfireLines,
      rng,
    ),
    {
      category: categoryTitle,
      points: pointStr,
      rival: challengerSpec.name,
    },
  );

  const hostLine = fillTemplate(
    pickFrom(challengerChoked ? MAX_SCREW_CHOKE_LINES : MAX_SCREW_BACKFIRE_LINES, rng),
    {
      rival: challengerSpec.name,
      category: categoryTitle,
      points: pointStr,
      shatterNote,
    },
  );

  return {
    executed: true,
    board: nextBoard,
    targetTile: resolvedTile,
    odds,
    outcome: challengerChoked ? 'CHOKED' : 'BACKFIRED',
    previousPlayerScore: prevPlayerScore,
    newPlayerScore: nextBoard.playerScore,
    playerScoreDelta: totalPlayerDelta,
    screwStealPoints,
    previousRivalScore: prevRivalScore,
    newRivalScore: nextBoard.rivalScore,
    rivalScoreDelta: totalRivalDelta,
    shatteredNeighborTileIds,
    stageSurgeUnlockedIds,
    awardedPlayerWedge,
    awardedRivalWedge,
    lineSweepJackpots,
    topologyEvents: topoRes.topologyEvents,
    challengerLine,
    hostLine,
  };
}

export interface RivalScrewOptionsV5 {
  readonly challenger?: ChallengerProfileV4 | ChallengerIdV5 | string | null;
  readonly playerStats?: PlayerStatProfileForHost | null;
  /** Bypass cadence probability and immediately attempt Rival Screw if eligible. */
  readonly forceAttempt?: boolean;
  readonly rng?: () => number;
}

export interface RivalScrewResultV5 {
  readonly board: StageBoardStateV5;
  readonly triggered: boolean;
  readonly blockedByScrewShield: boolean;
  readonly targetTile: BoardTileV4 | null;
  readonly targetDomainId: DomainId | null;
  readonly targetedPlayerWeakness: boolean;
  readonly rivalLine: string | null;
  readonly hostLine: string | null;
  readonly forcedReasonBanner: string | null;
  readonly consumedRivalToken: boolean;
}

function pickRivalScrewTargetTile(
  board: StageBoardStateV5,
  challenger: ChallengerScrewProfileV5,
  playerStats: PlayerStatProfileForHost | null | undefined,
  rng: () => number,
): { readonly tile: BoardTileV4 | null; readonly targetedPlayerWeakness: boolean; readonly weakLabel: string } {
  const playable = getPlayableTiles(board);
  if (playable.length === 0) {
    return { tile: null, targetedPlayerWeakness: false, weakLabel: '' };
  }

  const weakDomainId = playerStats?.weakestDomainId ?? null;
  if (weakDomainId !== null) {
    const exactWeak = playable.filter((t) => t.domainId === weakDomainId);
    if (exactWeak.length > 0) {
      const sorted = [...exactWeak].sort((a, b) => b.pointValue - a.pointValue);
      const topValue = sorted[0].pointValue;
      const topBand = sorted.filter((t) => t.pointValue >= topValue / 2);
      const label =
        playerStats?.weakestDomainName ?? DOMAIN_TOPIC_SUBTITLE_V4[weakDomainId];
      return {
        tile: pickFrom(topBand, rng),
        targetedPlayerWeakness: true,
        weakLabel:
          playerStats && playerStats.totalAnswered > 0
            ? `${Math.round(playerStats.weakestAccuracyPct)}% career accuracy in ${label}`
            : `your weakest career domain: ${label}`,
      };
    }

    const weakWedge = domainToWedgeColor(weakDomainId);
    const wedgeWeak = playable.filter((t) => t.wedgeId === weakWedge);
    if (wedgeWeak.length > 0) {
      const sorted = [...wedgeWeak].sort((a, b) => b.pointValue - a.pointValue);
      const label =
        playerStats?.weakestDomainName ?? DOMAIN_TOPIC_SUBTITLE_V4[weakDomainId];
      return {
        tile: sorted[0],
        targetedPlayerWeakness: true,
        weakLabel: `same wedge family as your weakest domain (${label})`,
      };
    }
  }

  const rivalTurf = playable.filter((t) => challenger.strongDomains.includes(t.domainId));
  if (rivalTurf.length > 0) {
    const sorted = [...rivalTurf].sort((a, b) => b.pointValue - a.pointValue);
    return {
      tile: sorted[0],
      targetedPlayerWeakness: false,
      weakLabel: `${challenger.name}'s specialty turf`,
    };
  }

  const sortedAll = [...playable].sort((a, b) => b.pointValue - a.pointValue);
  return {
    tile: sortedAll[0],
    targetedPlayerWeakness: false,
    weakLabel: 'high-stakes board ambush',
  };
}

/**
 * Challenger AI strategically deploys its 1 `"SCREW!"` token to force the player onto
 * the player's **weakest Career Stats domain** — unless automatically blocked once by
 * the player's equipped `screw_shield` Podium Lucky Charm!
 */
export function maybeTriggerRivalScrew(
  board: StageBoardStateV5,
  options: RivalScrewOptionsV5 = {},
): RivalScrewResultV5 {
  const noTrigger: RivalScrewResultV5 = {
    board,
    triggered: false,
    blockedByScrewShield: false,
    targetTile: null,
    targetDomainId: null,
    targetedPlayerWeakness: false,
    rivalLine: null,
    hostLine: null,
    forcedReasonBanner: null,
    consumedRivalToken: false,
  };

  if (
    board.isBoardComplete ||
    !board.hasActiveRival ||
    board.rivalScrewTokensLeft <= 0 ||
    board.forcedTileId !== null
  ) {
    return noTrigger;
  }

  const rng = options.rng ?? Math.random;
  const challengerSpec = getChallengerSpecV5(options.challenger ?? board.challengerId);
  const picked = pickRivalScrewTargetTile(board, challengerSpec, options.playerStats, rng);
  if (!picked.tile) {
    return noTrigger;
  }

  if (!options.forceAttempt) {
    if (board.turnNumber < 2 && board.turnsRemaining > 3) {
      return noTrigger;
    }
    let deployChance = 0.2;
    if (picked.targetedPlayerWeakness) deployChance += 0.35;
    if (board.rivalScore < board.playerScore) deployChance += 0.25;
    if (board.turnsRemaining <= Math.ceil(board.maxTurns * 0.45)) deployChance += 0.25;
    if (challengerSpec.baseAccuracy >= 0.62) deployChance += 0.1;
    const clampedChance = Math.min(0.88, deployChance);
    if (rng() >= clampedChance) {
      return noTrigger;
    }
  }

  const targetTile = picked.tile;
  const colTitle =
    board.columns[targetTile.colIndex]?.wittyTitle ??
    DOMAIN_TOPIC_SUBTITLE_V4[targetTile.domainId];

  // Check `screw_shield` Podium Lucky Charm interception!
  if (board.charms.screwShieldChargesLeft > 0) {
    const prevCount = board.charms.triggerCounts.screw_shield ?? 0;
    const nextBoard: StageBoardStateV5 = {
      ...board,
      rivalScrewTokensLeft: board.rivalScrewTokensLeft - 1,
      rivalScrewsBlockedByShield: board.rivalScrewsBlockedByShield + 1,
      charms: {
        ...board.charms,
        screwShieldChargesLeft: board.charms.screwShieldChargesLeft - 1,
        triggerCounts: {
          ...board.charms.triggerCounts,
          screw_shield: prevCount + 1,
        },
      },
    };

    const rivalLine = fillTemplate(
      pickFrom(challengerSpec.onScrewShieldBlockedLines, rng),
      { category: colTitle, rival: challengerSpec.name },
    );
    const hostLine = fillTemplate(pickFrom(MAX_SCREW_SHIELD_BLOCK_LINES, rng), {
      rival: challengerSpec.name,
      category: colTitle,
    });

    return {
      board: nextBoard,
      triggered: true,
      blockedByScrewShield: true,
      targetTile,
      targetDomainId: targetTile.domainId,
      targetedPlayerWeakness: picked.targetedPlayerWeakness,
      rivalLine,
      hostLine,
      forcedReasonBanner: null,
      consumedRivalToken: true,
    };
  }

  const nextTiles = board.tiles.map((t) =>
    t.tileId === targetTile.tileId
      ? { ...t, forcedByRival: true }
      : t.forcedByRival
        ? { ...t, forcedByRival: false }
        : t,
  );

  const forcedReasonBanner = `RIVAL SCREW! ${challengerSpec.name} forced you onto "${colTitle}" (${targetTile.pointValue} PTS) — ${picked.weakLabel}!`;
  const nextBoard: StageBoardStateV5 = {
    ...board,
    tiles: nextTiles,
    forcedTileId: targetTile.tileId,
    forcedReasonBanner,
    rivalScrewTokensLeft: board.rivalScrewTokensLeft - 1,
    rivalScrewsDeployed: board.rivalScrewsDeployed + 1,
  };

  const rivalLine = fillTemplate(pickFrom(challengerSpec.onDeployScrewLines, rng), {
    category: colTitle,
    rival: challengerSpec.name,
  });
  const hostLine = fillTemplate(pickFrom(MAX_RIVAL_SCREW_LINES, rng), {
    rival: challengerSpec.name,
    category: colTitle,
    weakNote: picked.weakLabel,
  });

  return {
    board: nextBoard,
    triggered: true,
    blockedByScrewShield: false,
    targetTile: { ...targetTile, forcedByRival: true },
    targetDomainId: targetTile.domainId,
    targetedPlayerWeakness: picked.targetedPlayerWeakness,
    rivalLine,
    hostLine,
    forcedReasonBanner,
    consumedRivalToken: true,
  };
}

// ============================================================================
// 8. BALATRO-STYLE PODIUM LUCKY CHARM PIPELINE (`applyEquippedCharmsToTurn`)
// ============================================================================

export interface CharmTriggerRecordV5 {
  readonly charmId: CharmIdV5;
  readonly name: string;
  readonly effectTag: string;
  /** Positive bonus points granted (strictly included in netPointsDelta). */
  readonly pointsDelta: number;
  /** Penalty points prevented (e.g. Frankie's Coaster waiving missed 2x penalty). */
  readonly penaltySaved: number;
  readonly description: string;
}

export interface PreQuestionCharmModifiersV5 {
  readonly shotClockBonusSec: number;
  readonly autoEliminateWrongCount: number;
  readonly autoEliminatedChoiceIndex: number | null;
  readonly activeCharms: readonly CharmTriggerRecordV5[];
}

/**
 * Evaluates pre-question Podium Lucky Charms before the player answers:
 * - `alistairs_pocketwatch`: `+8s` Shot Clock on every timed clue
 * - `denises_red_pen`: auto-eliminates 1 wrong option on History (0) & Literature (10)
 */
export function getPreQuestionCharmModifiers(
  boardOrCharms: StageBoardStateV5 | readonly CharmIdV5[],
  context: {
    readonly domainId: DomainId;
    readonly format?: QuestionFormatV4;
    readonly choices?: readonly string[];
    readonly correctIndex?: number;
    readonly rng?: () => number;
  },
): PreQuestionCharmModifiersV5 {
  const equipped: readonly CharmIdV5[] =
    'charms' in boardOrCharms
      ? boardOrCharms.charms.equippedCharms
      : sanitizeEquippedCharmsV5(boardOrCharms);
  const rng = context.rng ?? Math.random;
  const activeCharms: CharmTriggerRecordV5[] = [];
  let shotClockBonusSec = 0;
  let autoEliminateWrongCount = 0;
  let autoEliminatedChoiceIndex: number | null = null;

  for (const charmId of equipped) {
    if (charmId === 'alistairs_pocketwatch') {
      shotClockBonusSec += CHARM_VALUES_V5.alistairsPocketwatchBonusSec;
      activeCharms.push({
        charmId,
        name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
        effectTag: `+${CHARM_VALUES_V5.alistairsPocketwatchBonusSec}s CLOCK`,
        pointsDelta: 0,
        penaltySaved: 0,
        description: `Alistair's Pocketwatch added +${CHARM_VALUES_V5.alistairsPocketwatchBonusSec}s to the Shot Clock.`,
      });
    } else if (charmId === 'denises_red_pen' && isHistoryOrLitDomainV5(context.domainId)) {
      autoEliminateWrongCount = 1;
      if (
        context.choices &&
        context.choices.length >= 2 &&
        typeof context.correctIndex === 'number'
      ) {
        const wrongIndices: number[] = [];
        for (let i = 0; i < context.choices.length; i++) {
          if (i !== context.correctIndex) wrongIndices.push(i);
        }
        if (wrongIndices.length > 0) {
          autoEliminatedChoiceIndex = pickFrom(wrongIndices, rng);
        }
      }
      activeCharms.push({
        charmId,
        name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
        effectTag: '-1 WRONG OPTION',
        pointsDelta: 0,
        penaltySaved: 0,
        description: "Denise's Red Pen crossed out 1 wrong answer on History/Literature.",
      });
    }
  }

  return {
    shotClockBonusSec,
    autoEliminateWrongCount,
    autoEliminatedChoiceIndex,
    activeCharms,
  };
}

export interface ApplyEquippedCharmsInputV5 {
  /** Base answer evaluation before v5 charm bonuses (e.g. from QuestionGeneratorV4 or ScoringV4). */
  readonly evalResult: EvaluatedAnswerV4;
  readonly tilePointValue: number;
  readonly tileTwist?: TileTwistKind;
  readonly domainId?: DomainId;
  readonly currentPlayerScore: number;
  readonly currentRivalScore?: number;
  readonly hasActiveRival?: boolean;
  /** Consecutive-hit streak entering this turn (`>= 1` triggers Trevor's Hot Mic `+75`). */
  readonly currentStreak?: number;
  readonly doubleDownArmed?: boolean;
  readonly powerPlayWager?: number | null;
  readonly wheelEffect?: WheelActiveEffectV4;
  /** Elapsed answer seconds (`<= 6` triggers Kenji's Cyber-Link `+150` on hit). */
  readonly elapsedSec?: number;
  /** Seconds left on the Shot Clock (`>= 0 && <= 5` triggers Priya's Adrenaline `+120` on hit). */
  readonly secondsRemaining?: number;
  readonly timedOut?: boolean;
  readonly allowNegative?: boolean;
  /** Optional explicit board-topology bonus cleanly conserved into `bonusPoints` & `netPointsDelta`. */
  readonly extraTopologyBonusPoints?: number;
  readonly extraTopologyNotes?: readonly string[];
  /** Current charm runtime state (or plain equipped charm ID array for stateless checks). */
  readonly charms: CharmRuntimeStateV5 | readonly CharmIdV5[];
}

export interface ApplyEquippedCharmsResultV5 {
  readonly evaluated: EvaluatedAnswerV4;
  readonly baseScoreResolution: ScoreResolutionV4;
  readonly previousPlayerScore: number;
  readonly newPlayerScore: number;
  /** Exact 1:1 player score delta (`newPlayerScore === previousPlayerScore + playerDelta`). */
  readonly playerDelta: number;
  readonly previousRivalScore: number;
  readonly newRivalScore: number;
  readonly rivalDelta: number;
  readonly charmBonusPoints: number;
  readonly charmPenaltySaved: number;
  readonly triggeredCharms: readonly CharmTriggerRecordV5[];
  readonly nextCharmState: CharmRuntimeStateV5;
  readonly shotClockBonusSec: number;
  readonly deniseRedPenActive: boolean;
  readonly newStreak: number;
}

function normalizeCharmState(
  input: CharmRuntimeStateV5 | readonly CharmIdV5[],
): CharmRuntimeStateV5 {
  if ('equippedCharms' in input) {
    return input;
  }
  const equipped = sanitizeEquippedCharmsV5(input);
  return {
    equippedCharms: equipped,
    frankiesCoasterUsed: false,
    screwShieldChargesLeft: equipped.includes('screw_shield')
      ? CHARM_VALUES_V5.screwShieldCharges
      : 0,
    totalCharmBonusPoints: 0,
    totalCharmPenaltySaved: 0,
    triggerCounts: {},
  };
}

/**
 * Evaluates all equipped Podium Lucky Charms in deterministic left-to-right Balatro order
 * and reconciles the turn's score through `ScoringV4` with **strict 1:1 score conservation**:
 *
 * Invariants guaranteed on EVERY call:
 * 1. `evaluated.netPointsDelta === evaluated.basePoints + evaluated.bonusPoints + evaluated.wagerDeltaPoints`
 * 2. `playerDelta === evaluated.netPointsDelta`
 * 3. `newPlayerScore === previousPlayerScore + playerDelta`
 * 4. `newRivalScore === previousRivalScore + rivalDelta`
 */
export function applyEquippedCharmsToTurn(
  input: ApplyEquippedCharmsInputV5,
): ApplyEquippedCharmsResultV5 {
  const charmState = normalizeCharmState(input.charms);
  const equipped = charmState.equippedCharms;
  const hasCharm = (id: CharmIdV5): boolean => equipped.includes(id);

  const tilePointValue = Math.max(
    0,
    sanitizeInt(input.tilePointValue, NON_BOARD_BASE_POINTS_V4),
  );
  const tileTwist: TileTwistKind = input.tileTwist ?? 'NONE';
  const previousPlayerScore = sanitizeInt(input.currentPlayerScore, 0);
  const previousRivalScore = sanitizeInt(input.currentRivalScore, 0);
  const hasActiveRival = Boolean(input.hasActiveRival);
  const currentStreak = Math.max(0, Math.floor(input.currentStreak ?? 0));
  const isPowerPlay = input.powerPlayWager != null;
  const doubleDownArmed = !isPowerPlay && Boolean(input.doubleDownArmed);
  const wheelEffect: WheelActiveEffectV4 = input.wheelEffect ?? 'NONE';
  const allowNegative = Boolean(input.allowNegative);
  const extraTopologyBonus = input.evalResult.isCorrect
    ? Math.max(0, sanitizeInt(input.extraTopologyBonusPoints, 0))
    : 0;

  const triggeredCharms: CharmTriggerRecordV5[] = [];
  const nextTriggerCounts: Partial<Record<CharmIdV5, number>> = {
    ...charmState.triggerCounts,
  };
  const recordTrigger = (rec: CharmTriggerRecordV5): void => {
    triggeredCharms.push(rec);
    nextTriggerCounts[rec.charmId] = (nextTriggerCounts[rec.charmId] ?? 0) + 1;
  };

  // 1. Check Frankie's Coaster BEFORE computing final miss penalty (1st missed 2x per match = 0 penalty!)
  let nextFrankiesCoasterUsed = charmState.frankiesCoasterUsed;
  let charmPenaltySaved = 0;
  let effectiveDoubleDownArmed = doubleDownArmed;

  if (
    !input.evalResult.isCorrect &&
    doubleDownArmed &&
    hasCharm('frankies_coaster') &&
    !charmState.frankiesCoasterUsed
  ) {
    const rawDdPenalty = Math.round(tilePointValue * DOUBLE_DOWN_MISS_FRACTION_V4);
    const unshieldedRes = reconcileEvaluatedAnswerForBoard({
      evalResult: input.evalResult,
      tilePointValue,
      tileTwist,
      currentPlayerScore: previousPlayerScore,
      currentRivalScore: previousRivalScore,
      hasActiveRival,
      currentStreak,
      doubleDownArmed: true,
      powerPlayWager: null,
      wheelEffect,
      allowNegative,
    });
    const shieldedRes = reconcileEvaluatedAnswerForBoard({
      evalResult: input.evalResult,
      tilePointValue,
      tileTwist,
      currentPlayerScore: previousPlayerScore,
      currentRivalScore: previousRivalScore,
      hasActiveRival,
      currentStreak,
      doubleDownArmed: false,
      powerPlayWager: null,
      wheelEffect,
      allowNegative,
    });
    const actualSaved = Math.max(0, shieldedRes.playerDelta - unshieldedRes.playerDelta);
    charmPenaltySaved = actualSaved > 0 ? actualSaved : rawDdPenalty;
    effectiveDoubleDownArmed = false;
    nextFrankiesCoasterUsed = true;

    recordTrigger({
      charmId: 'frankies_coaster',
      name: PODIUM_CHARMS_CATALOG_V5.frankies_coaster.name,
      effectTag: '2x PENALTY WAIVED',
      pointsDelta: 0,
      penaltySaved: charmPenaltySaved,
      description: `Frankie's Coaster absorbed your first missed 2x Double Down (${charmPenaltySaved} PTS saved)!`,
    });
  }

  // 2. Reconcile authoritative base ScoringV4 resolution
  const baseRes = reconcileEvaluatedAnswerForBoard({
    evalResult: input.evalResult,
    tilePointValue,
    tileTwist,
    currentPlayerScore: previousPlayerScore,
    currentRivalScore: previousRivalScore,
    hasActiveRival,
    currentStreak,
    doubleDownArmed: effectiveDoubleDownArmed,
    powerPlayWager: input.powerPlayWager ?? null,
    wheelEffect,
    allowNegative,
  });

  // 3. Evaluate all offensive / situational Podium Lucky Charms in left-to-right equipped order
  let charmBonusPoints = 0;
  const charmBreakdownParts: string[] = [];

  if (extraTopologyBonus > 0 && input.extraTopologyNotes && input.extraTopologyNotes.length > 0) {
    charmBreakdownParts.push(...input.extraTopologyNotes);
  } else if (extraTopologyBonus > 0) {
    charmBreakdownParts.push(`+${extraTopologyBonus} Stage Twist Bonus`);
  }

  if (charmPenaltySaved > 0) {
    charmBreakdownParts.push(`Frankie's Coaster saved ${charmPenaltySaved} DD penalty`);
  }

  if (baseRes.evaluated.isCorrect) {
    for (const charmId of equipped) {
      switch (charmId) {
        case 'trevors_hot_mic': {
          if (currentStreak >= 1) {
            const pts = CHARM_VALUES_V5.trevorsHotMicBonus;
            charmBonusPoints += pts;
            charmBreakdownParts.push(`+${pts} Trevor's Hot Mic`);
            recordTrigger({
              charmId,
              name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
              effectTag: `+${pts} STREAK HEAT`,
              pointsDelta: pts,
              penaltySaved: 0,
              description: `Trevor's Hot Mic fired on a ${currentStreak + 1}-answer streak (+${pts} PTS)!`,
            });
          }
          break;
        }

        case 'priyas_adrenaline': {
          if (
            !input.timedOut &&
            typeof input.secondsRemaining === 'number' &&
            Number.isFinite(input.secondsRemaining) &&
            input.secondsRemaining >= 0 &&
            input.secondsRemaining <= CHARM_VALUES_V5.priyasAdrenalineMaxSecRemaining
          ) {
            const pts = CHARM_VALUES_V5.priyasAdrenalineBonus;
            charmBonusPoints += pts;
            charmBreakdownParts.push(`+${pts} Priya's Adrenaline`);
            recordTrigger({
              charmId,
              name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
              effectTag: `+${pts} CLUTCH`,
              pointsDelta: pts,
              penaltySaved: 0,
              description: `Priya's Adrenaline surged with ${input.secondsRemaining.toFixed(1)}s left (+${pts} PTS)!`,
            });
          }
          break;
        }

        case 'kenjis_cyber_link': {
          if (
            typeof input.elapsedSec === 'number' &&
            Number.isFinite(input.elapsedSec) &&
            input.elapsedSec >= 0 &&
            input.elapsedSec <= CHARM_VALUES_V5.kenjisCyberLinkMaxElapsedSec
          ) {
            const pts = CHARM_VALUES_V5.kenjisCyberLinkBonus;
            charmBonusPoints += pts;
            charmBreakdownParts.push(`+${pts} Kenji's Cyber-Link`);
            recordTrigger({
              charmId,
              name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
              effectTag: `+${pts} FAST LOCK`,
              pointsDelta: pts,
              penaltySaved: 0,
              description: `Kenji's Cyber-Link locked in ${input.elapsedSec.toFixed(1)}s (+${pts} PTS)!`,
            });
          }
          break;
        }

        case 'nadias_astrolabe': {
          if (tileTwist === 'CROWN_WEDGE') {
            const pts = CHARM_VALUES_V5.nadiasAstrolabeWedgeBonus;
            charmBonusPoints += pts;
            charmBreakdownParts.push(`+${pts} Nadia's Astrolabe`);
            recordTrigger({
              charmId,
              name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
              effectTag: `+${pts} WEDGE BONUS`,
              pointsDelta: pts,
              penaltySaved: 0,
              description: `Nadia's Astrolabe aligned on a Crown Wedge tile (+${pts} PTS)!`,
            });
          }
          break;
        }

        case 'syndicate_golden_dice': {
          const wagerForDice =
            baseRes.effectivePowerPlayWager != null && baseRes.effectivePowerPlayWager > 0
              ? baseRes.effectivePowerPlayWager
              : tileTwist === 'POWER_PLAY'
                ? Math.max(tilePointValue, baseRes.evaluated.basePoints)
                : 0;
          if (wagerForDice > 0) {
            const pts = Math.round(
              wagerForDice * CHARM_VALUES_V5.syndicateGoldenDicePowerPlayRate,
            );
            if (pts > 0) {
              charmBonusPoints += pts;
              charmBreakdownParts.push(`+${pts} Syndicate Golden Dice`);
              recordTrigger({
                charmId,
                name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
                effectTag: `+${pts} POWER PLAY +25%`,
                pointsDelta: pts,
                penaltySaved: 0,
                description: `Syndicate Golden Dice boosted your Power Play payout by +25% (+${pts} PTS)!`,
              });
            }
          }
          break;
        }

        case 'underdog_chip': {
          if (hasActiveRival && previousPlayerScore < previousRivalScore) {
            const pts = CHARM_VALUES_V5.underdogChipTrailingBonus;
            charmBonusPoints += pts;
            charmBreakdownParts.push(`+${pts} Underdog Chip`);
            recordTrigger({
              charmId,
              name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
              effectTag: `+${pts} COMEBACK`,
              pointsDelta: pts,
              penaltySaved: 0,
              description: `Underdog Chip sparked while trailing the Rival (+${pts} PTS)!`,
            });
          }
          break;
        }

        default:
          break;
      }
    }
  }

  // 4. Re-assemble strictly 1:1 conserved EvaluatedAnswerV4 + score totals
  const basePoints = baseRes.evaluated.basePoints;
  const bonusPoints = baseRes.evaluated.bonusPoints + charmBonusPoints + extraTopologyBonus;
  let wagerDeltaPoints = baseRes.evaluated.wagerDeltaPoints;

  const rawNetDelta = basePoints + bonusPoints + wagerDeltaPoints;
  const applied = applyScoreDelta(previousPlayerScore, rawNetDelta, allowNegative);
  if (applied.wasClampedAtZero) {
    wagerDeltaPoints += applied.appliedDelta - rawNetDelta;
  }

  const netPointsDelta = basePoints + bonusPoints + wagerDeltaPoints;
  const newPlayerScore = previousPlayerScore + netPointsDelta;
  const detailBreakdown =
    charmBreakdownParts.length > 0
      ? `${baseRes.evaluated.detailBreakdown} | ${charmBreakdownParts.join(' | ')}`
      : baseRes.evaluated.detailBreakdown;

  const evaluated: EvaluatedAnswerV4 = {
    ...baseRes.evaluated,
    basePoints,
    bonusPoints,
    wagerDeltaPoints,
    netPointsDelta,
    detailBreakdown,
  };

  const nextCharmState: CharmRuntimeStateV5 = {
    ...charmState,
    frankiesCoasterUsed: nextFrankiesCoasterUsed,
    totalCharmBonusPoints: charmState.totalCharmBonusPoints + charmBonusPoints,
    totalCharmPenaltySaved: charmState.totalCharmPenaltySaved + charmPenaltySaved,
    triggerCounts: nextTriggerCounts,
  };

  return {
    evaluated,
    baseScoreResolution: baseRes,
    previousPlayerScore,
    newPlayerScore,
    playerDelta: netPointsDelta,
    previousRivalScore,
    newRivalScore: baseRes.newRivalScore,
    rivalDelta: baseRes.rivalDelta,
    charmBonusPoints,
    charmPenaltySaved,
    triggeredCharms,
    nextCharmState,
    shotClockBonusSec: hasCharm('alistairs_pocketwatch')
      ? CHARM_VALUES_V5.alistairsPocketwatchBonusSec
      : 0,
    deniseRedPenActive:
      hasCharm('denises_red_pen') &&
      input.domainId !== undefined &&
      isHistoryOrLitDomainV5(input.domainId),
    newStreak: baseRes.newStreak,
  };
}

// ============================================================================
// 9. FULL V5 TURN WRAPPERS (`resolveTileResultV5`, `runChallengerTurnV5`, etc.)
// ============================================================================

export interface ResolveTileOptionsV5 extends ResolveTileOptionsV4 {
  readonly elapsedSec?: number;
  readonly secondsRemaining?: number;
  readonly timedOut?: boolean;
}

export interface ResolveTileOutcomeV5 extends Omit<ResolveTileOutcomeV4, 'board'> {
  readonly board: StageBoardStateV5;
  readonly charmResult: ApplyEquippedCharmsResultV5;
  readonly lineSweepJackpots: readonly LineSweepJackpotEntryV5[];
  readonly lineSweepJackpotPoints: number;
  readonly lineSweepUnlockedWedges: readonly WedgeColorId[];
  /** Topology-triggered bonus points included cleanly in `turnPlayerScoreDelta` or endgame Turf Majority. */
  readonly topologyBonusPoints: number;
  readonly tugOfWarPlayerBonus: number;
  readonly topologyEvents: readonly string[];
  /** Exact 1:1 delta for the question turn alone (including charms & per-tile topology bonuses, before line sweep/turf endgame). */
  readonly turnPlayerScoreDelta: number;
  /** Exact 1:1 total player score delta (`turnPlayerScoreDelta + lineSweepJackpotPoints + tugOfWarPlayerBonus`). */
  readonly totalPlayerScoreDelta: number;
  readonly previousPlayerScore: number;
  readonly newPlayerScore: number;
}

/**
 * Atomic v5 tile turn resolver uniting:
 * 1. All 14 Board Topologies & Twists bonuses (Spiral Core 1,000, Pyramid Summit 1,000, Velvet X 2x, Gold Fever 2x, Hot Potato Defusal +250, Flame Thaw +200, Spotlight Poise +100, Minefield Nerve +100, Oxford Turf +75/+125, Championship Crown Surge +200)
 * 2. `applyEquippedCharmsToTurn` (all 12 Podium Lucky Charms + `ScoringV4` 1:1 math)
 * 3. `BoardEngine.resolveTileResult` (neighbor padlock shattering, wedges, freezes, anti-soft-lock Stage Surge)
 * 4. `checkLineSweepJackpots` (`+300 PTS` + uncollected Wedge for every newly completed Row / Column)
 * 5. Live post-turn 14-topology mechanics (Gold Fever spread, Hot Potato fuse/jump, Flame Thaw board melt, 8-neighbor Fog Spotlight, Chain-Reaction streak shatter, Tug-of-War +500 Majority)
 *
 * Strictly guarantees `outcome.newPlayerScore === outcome.previousPlayerScore + outcome.totalPlayerScoreDelta`.
 */
export function resolveTileResultV5(
  board: StageBoardStateV5,
  tileId: string,
  evalResult: EvaluatedAnswerV4,
  options: ResolveTileOptionsV5 = {},
): ResolveTileOutcomeV5 {
  const targetTile = getTileById(board, tileId);
  if (!targetTile) {
    throw new Error(`StageBoardRulesV5.resolveTileResultV5: unknown tileId "${tileId}"`);
  }

  const rng = options.rng ?? Math.random;
  const previousPlayerScore = sanitizeInt(board.playerScore, 0);
  const wasForcedTile = board.forcedTileId === tileId;

  // 1. Compute pre-score 14-topology bonuses (cleanly folded into evaluated.bonusPoints)
  const topoPre = computeTopologyTurnBonusesV5(
    board,
    targetTile,
    evalResult.isCorrect,
    wasForcedTile,
    options.powerPlayWager,
  );

  // 2. Resolve ScoringV4 + all equipped Podium Lucky Charms + per-tile topology bonus
  const charmResult = applyEquippedCharmsToTurn({
    evalResult,
    tilePointValue: targetTile.pointValue,
    tileTwist: targetTile.twist,
    domainId: targetTile.domainId,
    currentPlayerScore: previousPlayerScore,
    currentRivalScore: board.rivalScore,
    hasActiveRival: board.hasActiveRival,
    currentStreak: options.currentStreak ?? 0,
    doubleDownArmed: options.doubleDownArmed ?? false,
    powerPlayWager: options.powerPlayWager ?? null,
    wheelEffect: options.wheelEffect ?? 'NONE',
    elapsedSec: options.elapsedSec,
    secondsRemaining: options.secondsRemaining,
    timedOut: options.timedOut,
    allowNegative: options.allowNegative ?? false,
    extraTopologyBonusPoints: topoPre.bonusPoints,
    extraTopologyNotes: topoPre.notes,
    charms: board.charms,
  });

  // 3. Delegate spatial board mechanics & anti-soft-lock surge to BoardEngine.resolveTileResult
  const v4Outcome = resolveTileResult(board, tileId, charmResult.evaluated, {
    currentStreak: options.currentStreak ?? 0,
    allowNegative: options.allowNegative ?? false,
    rng,
    evalResultIsFinalized: true,
    precomputedRivalDelta: charmResult.rivalDelta,
  });

  let nextBoard: StageBoardStateV5 = {
    ...board,
    ...v4Outcome.board,
    charms: charmResult.nextCharmState,
  };

  // 4. Check Row & Column Stage Sweep Jackpots when the player wins the closing tile
  let lineSweepJackpots: readonly LineSweepJackpotEntryV5[] = [];
  let lineSweepJackpotPoints = 0;
  let lineSweepUnlockedWedges: readonly WedgeColorId[] = [];
  if (charmResult.evaluated.isCorrect) {
    const sweepRes = checkLineSweepJackpots(nextBoard, tileId);
    nextBoard = sweepRes.board;
    lineSweepJackpots = sweepRes.jackpots;
    lineSweepJackpotPoints = sweepRes.totalPointsAwarded;
    lineSweepUnlockedWedges = sweepRes.newlyUnlockedWedges;
  }

  // 5. Apply post-turn 14-topology live board mutations (Flame Thaw, Gold Fever spread, Hot Potato fuse/blast, Fog cone, Chain Reaction, Turf Majority)
  const topoPost = applyPostTurnTopologyEffectsV5(
    nextBoard,
    v4Outcome.resolvedTile,
    charmResult.evaluated.isCorrect,
    v4Outcome.newStreak,
    topoPre.triggeredFlameThaw,
    rng,
  );
  nextBoard = topoPost.board;

  // Ensure zero soft-locks if any post-turn topology mutation left a non-complete board locked
  if (!nextBoard.isBoardComplete) {
    const surge = ensurePlayableTilesOrStageSurge(nextBoard, rng, 2);
    if (surge.triggered || surge.board !== nextBoard) {
      nextBoard = { ...nextBoard, ...surge.board };
    }
  }

  const combinedUnlocked = Array.from(
    new Set([...v4Outcome.unlockedTileIds, ...topoPost.extraUnlockedTileIds]),
  );
  const turnPlayerScoreDelta = v4Outcome.playerScoreDelta;
  const tugOfWarPlayerBonus = topoPost.extraPlayerBonusPoints;
  const totalPlayerScoreDelta =
    turnPlayerScoreDelta + lineSweepJackpotPoints + tugOfWarPlayerBonus;
  const totalRivalDelta = v4Outcome.rivalScoreDelta + topoPost.extraRivalBonusPoints;

  return {
    ...v4Outcome,
    board: nextBoard,
    unlockedTileIds: combinedUnlocked,
    playerScoreDelta: totalPlayerScoreDelta,
    rivalScoreDelta: totalRivalDelta,
    turnPlayerScoreDelta,
    totalPlayerScoreDelta,
    topologyBonusPoints: topoPre.bonusPoints + tugOfWarPlayerBonus,
    tugOfWarPlayerBonus,
    topologyEvents: topoPost.topologyEvents,
    previousPlayerScore,
    newPlayerScore: nextBoard.playerScore,
    bountyPlayerDelta: charmResult.baseScoreResolution.bountyPlayerDelta,
    bountyRivalDelta: charmResult.baseScoreResolution.bountyRivalDelta,
    awardedWedge: v4Outcome.awardedWedge ?? lineSweepUnlockedWedges[0] ?? null,
    charmResult,
    lineSweepJackpots,
    lineSweepJackpotPoints,
    lineSweepUnlockedWedges,
  };
}

export interface ChallengerTurnResultV5 extends Omit<ChallengerTurnResultV4, 'board'> {
  readonly board: StageBoardStateV5;
  readonly rivalScrewResult: RivalScrewResultV5 | null;
  readonly blockedFreezeByScrewShield: boolean;
  readonly tugOfWarPlayerBonus: number;
  readonly tugOfWarRivalBonus: number;
}

/**
 * Runs a complete v5 Challenger AI turn:
 * 1. First checks strategic Rival Screw deployment (`maybeTriggerRivalScrew`, respecting `screw_shield`)
 * 2. Otherwise executes `ChallengerAI.runChallengerTurn`, also letting `screw_shield` intercept
 *    a Rival `FREEZE_FAVORITE_COLUMN` attack once per match!
 * 3. Updates live `tugOfWarTurf` meter (and resolves +500 Majority Bonus if Rival closed the final tile!).
 */
export function runChallengerTurnV5(
  board: StageBoardStateV5,
  challengerProfile: ChallengerProfileV4,
  playerStats?: PlayerStatProfileForHost | null,
  rng: () => number = Math.random,
): ChallengerTurnResultV5 {
  if (board.isBoardComplete || !board.hasActiveRival) {
    const v4Idle = runChallengerTurn(board, challengerProfile, playerStats, rng);
    return {
      ...v4Idle,
      board,
      rivalScrewResult: null,
      blockedFreezeByScrewShield: false,
      tugOfWarPlayerBonus: 0,
      tugOfWarRivalBonus: 0,
    };
  }

  // 1. Check Rival's strategic Screw token deployment
  const screwAttempt = maybeTriggerRivalScrew(board, {
    challenger: challengerProfile,
    playerStats,
    rng,
  });
  if (screwAttempt.triggered) {
    return {
      board: screwAttempt.board,
      action: {
        moveKind: 'FORCE_WEAK_TILE',
        targetTileId: screwAttempt.targetTile?.tileId,
        targetColIndex: screwAttempt.targetTile?.colIndex,
        rivalPointsDelta: 0,
        rivalSucceeded: !screwAttempt.blockedByScrewShield,
        banterLine:
          screwAttempt.rivalLine ??
          screwAttempt.hostLine ??
          `${challengerProfile.name} deployed a Rival Screw!`,
      },
      forcedByStageSpotlight: false,
      usedPlayerWeaknessStats: screwAttempt.targetedPlayerWeakness,
      usedPlayerFavoriteStats: false,
      unlockedTileIds: [],
      awardedRivalWedge: null,
      stageSurgeTriggered: false,
      stageSurgeUnlockedIds: [],
      rivalScrewResult: screwAttempt,
      blockedFreezeByScrewShield: false,
      tugOfWarPlayerBonus: 0,
      tugOfWarRivalBonus: 0,
    };
  }

  // 2. Run standard ChallengerAI turn
  const v4Turn = runChallengerTurn(board, challengerProfile, playerStats, rng);

  // 3. Intercept Rival Column Freeze if player holds an active `screw_shield` charge!
  if (
    v4Turn.action.moveKind === 'FREEZE_FAVORITE_COLUMN' &&
    board.charms.screwShieldChargesLeft > 0
  ) {
    const prevCount = board.charms.triggerCounts.screw_shield ?? 0;
    const targetColIndex = v4Turn.action.targetColIndex;
    const colTitle =
      targetColIndex !== undefined
        ? (board.columns[targetColIndex]?.wittyTitle ?? 'your favorite column')
        : 'your favorite column';
    const shieldedBoard: StageBoardStateV5 = {
      ...board,
      rivalScrewsBlockedByShield: board.rivalScrewsBlockedByShield + 1,
      charms: {
        ...board.charms,
        screwShieldChargesLeft: board.charms.screwShieldChargesLeft - 1,
        triggerCounts: {
          ...board.charms.triggerCounts,
          screw_shield: prevCount + 1,
        },
      },
    };
    return {
      ...v4Turn,
      board: shieldedBoard,
      action: {
        ...v4Turn.action,
        rivalSucceeded: false,
        banterLine: `SCREW SHIELD BLOCKED IT! ${challengerProfile.name} tried to freeze "${colTitle}", and your brass lectern guard shattered the ice!`,
      },
      unlockedTileIds: [],
      stageSurgeTriggered: false,
      stageSurgeUnlockedIds: [],
      rivalScrewResult: null,
      blockedFreezeByScrewShield: true,
      tugOfWarPlayerBonus: 0,
      tugOfWarRivalBonus: 0,
    };
  }

  let nextBoard: StageBoardStateV5 = {
    ...board,
    ...v4Turn.board,
  };
  let tugOfWarPlayerBonus = 0;
  let tugOfWarRivalBonus = 0;

  // Refresh live Tug-of-War Turf meter (and resolve majority if Rival claimed the final board tile!)
  const nextTurf = recomputeTugOfWarTurf(nextBoard);
  if (nextTurf) {
    nextBoard = { ...nextBoard, tugOfWarTurf: nextTurf };
    if (nextBoard.isBoardComplete && nextBoard.tugOfWarBonusAwardedTo === null) {
      if (nextTurf.playerTiles > nextTurf.rivalTiles) {
        tugOfWarPlayerBonus = BOARD_TWIST_BONUS_V5.tugOfWarMajorityBonus;
        nextBoard = {
          ...nextBoard,
          playerScore: nextBoard.playerScore + tugOfWarPlayerBonus,
          tugOfWarBonusAwardedTo: 'PLAYER',
        };
      } else if (nextTurf.rivalTiles > nextTurf.playerTiles) {
        tugOfWarRivalBonus = BOARD_TWIST_BONUS_V5.tugOfWarMajorityBonus;
        nextBoard = {
          ...nextBoard,
          rivalScore: nextBoard.rivalScore + tugOfWarRivalBonus,
          tugOfWarBonusAwardedTo: 'RIVAL',
        };
      } else {
        nextBoard = { ...nextBoard, tugOfWarBonusAwardedTo: 'TIE' };
      }
    }
  }

  return {
    ...v4Turn,
    board: nextBoard,
    action: {
      ...v4Turn.action,
      rivalPointsDelta: v4Turn.action.rivalPointsDelta + tugOfWarRivalBonus,
    },
    rivalScrewResult: null,
    blockedFreezeByScrewShield: false,
    tugOfWarPlayerBonus,
    tugOfWarRivalBonus,
  };
}

/**
 * Spins the 6-slice Show Wheel while preserving all `StageBoardStateV5` fields cleanly.
 */
export function spinCurveballWheelV5(
  board: StageBoardStateV5,
  rng: () => number = Math.random,
  forcedOutcome?: WheelSliceOutcome,
): Omit<WheelSpinResultV4, 'board'> & { readonly board: StageBoardStateV5 } {
  const res = spinCurveballWheel(board, rng, forcedOutcome);
  return {
    ...res,
    board: {
      ...board,
      ...res.board,
    },
  };
}

/**
 * Consumes a 50/50 or Clue coin lifeline while preserving `StageBoardStateV5` and
 * tracking `lifelinesUsedCount` for the `NO_LIFELINES_USED` Showman Dare.
 */
export function consumeBoardLifelineV5(
  board: StageBoardStateV5,
  kind: '5050' | 'HINT',
): { readonly board: StageBoardStateV5; readonly consumed: boolean } {
  const res = consumeBoardLifeline(board, kind);
  if (!res.consumed) {
    return { board, consumed: false };
  }
  return {
    board: {
      ...board,
      ...res.board,
      lifelinesUsedCount: board.lifelinesUsedCount + 1,
    },
    consumed: true,
  };
}
