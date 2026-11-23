// ============================================================================
// WORLD'S SMARTEST v4.0 — Living Jeopardy x Trivial Pursuit Game Board Engine
// Supports all 6 topologies, Padlocks, Fog-of-War, Spotlight Roulette,
// Power Plays, 6-Slice Show Wheel Curveballs, Line-Clear Combos, 6 Color
// Crown Wedges, 72 Witty Jeopardy-Style Column Headers, & 0-Soft-Lock Proof.
// ============================================================================

import type { DomainId } from '../forge/types';
import {
  WEDGE_CATALOG_V4,
  domainToWedgeColor,
  type BoardColumnV4,
  type BoardTileStatus,
  type BoardTileV4,
  type BoardTopologyKind,
  type EvaluatedAnswerV4,
  type QuestionFormatV4,
  type StageBoardStateV4,
  type TileTwistKind,
  type WedgeColorId,
  type WheelSliceOutcome,
  type WorldTourEpisodeV4,
} from './contracts';
import {
  WHEEL_SOLO_POT_BONUS_V4,
  WHEEL_STEAL_RIVAL_POINTS_V4,
  WHEEL_WEDGE_MAXED_BONUS_V4,
  applyScoreDelta,
  reconcileEvaluatedAnswerForBoard,
  type TilePointValueV4,
  type WheelActiveEffectV4,
} from './ScoringV4';

// ============================================================================
// 1. CANONICAL CATALOGS: FORMATS, DOMAINS, 72 WITTY HEADERS, 6 WHEEL SLICES
// ============================================================================

export const ALL_QUESTION_FORMATS_V4: readonly QuestionFormatV4[] = [
  'MULTIPLE_CHOICE',
  'MATCH_4',
  'SORT_4',
  'MULTI_STRIKE',
  'PINPOINT_DIAL',
  'CLUE_ESCALATOR',
  'VISUAL_SPOTTER',
] as const;

export const ALL_BOARD_TOPOLOGIES_V4: readonly BoardTopologyKind[] = [
  'OPEN_CLASSIC',
  'PADLOCK_NEIGHBORS',
  'FOG_CROSSROADS',
  'SPOTLIGHT_ROULETTE',
  'CHALLENGER_GAUNTLET',
  'GRAND_FINALE_VAULT',
] as const;

export const ALL_WEDGE_IDS_V4: readonly WedgeColorId[] = [
  'GOLD_HISTORY',
  'SAPPHIRE_GEO',
  'EMERALD_SCIENCE',
  'MAGENTA_POP',
  'ORANGE_SPORTS',
  'VIOLET_ARTS',
] as const;

export const ALL_DOMAIN_IDS_V4: readonly DomainId[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
] as const;

export const DOMAIN_TOPIC_SUBTITLE_V4: Readonly<Record<DomainId, string>> = {
  0: 'World History',
  1: 'Science & Space',
  2: 'Geography & Wonders',
  3: 'Arts & Architecture',
  4: 'Film, Music & Pop',
  5: 'Sports & Games',
  6: 'Tech & Computing',
  7: 'Nature & Biology',
  8: 'World Affairs & Law',
  9: 'Food, Craft & Design',
  10: 'Myth & Literature',
  11: 'Logic & Math',
};

export interface WittyColumnHeaderEntryV4 {
  readonly domainId: DomainId;
  readonly wedgeId: WedgeColorId;
  readonly wittyTitle: string;
  readonly topicSubtitle: string;
}

/**
 * 72 crisp, playful Jeopardy!-style column headers (6 per Domain across all 12 Domains / 6 Wedges).
 */
export const WITTY_COLUMN_HEADERS_BY_DOMAIN_V4: Readonly<Record<DomainId, readonly string[]>> = {
  0: [
    'Famous Last Mistakes',
    'Empires That Ghosted',
    'Crown Jewels & Coups',
    'Before It Was Cool',
    'Signed, Sealed, Regretted',
    'Plot Twists Of History',
  ],
  1: [
    'Wait, They Invented What?',
    'Sounds Fake, Is True',
    'Space Is Trying To Kill You',
    'Periodic Table Drama',
    'Lab Accidents That Worked',
    'Cosmic Next-Door Neighbors',
  ],
  2: [
    'Geography Dropouts',
    'Wait, That Is An Island?',
    'Borders Gone Wild',
    'Capitals You Always Miss',
    'Seven-Wonder Club',
    'Rivers, Peaks & Detours',
  ],
  3: [
    'Museum Heist Targets',
    'Skyline Showoffs',
    'Brushstrokes & Big Egos',
    'Marble, Bronze & Drama',
    'Built To Outlive Us',
    'Art School Confidential',
  ],
  4: [
    '90s Rewind',
    'Oscar Snubs & Sweeps',
    'One-Hit Legends',
    'Box Office Monsters',
    'Choruses You Cannot Unhear',
    'Plot Holes & Cameos',
  ],
  5: [
    'Buzzer Beaters',
    'Championship Curses',
    'Rules Nobody Reads',
    'Checkmates & Comebacks',
    'Olympic Oddities',
    'Underdog Miracles',
  ],
  6: [
    '404 Not Found',
    'Silicon Valley Folklore',
    'Ctrl+Alt+History',
    'Gadgets We Buried',
    'Code Breakers',
    'Bugs That Made Millions',
  ],
  7: [
    'Evolution Got Weird',
    'Apex Predators',
    'Plants With Attitude',
    'Deep-Sea Nightmares',
    'Your Body Fine Print',
    'Animal Kingdom Flexes',
  ],
  8: [
    'Courtroom Drama',
    'Wait, That Is Legal?',
    'Summit Showdowns',
    'Follow The Money',
    'Treaties & Loopholes',
    'Front-Page Scandals',
  ],
  9: [
    'Chef Kiss Classics',
    'Street Food Passport',
    'Secret Ingredients',
    'Icons Of Everyday Design',
    'Sweet Tooth Science',
    'Fermented & Famous',
  ],
  10: [
    'Olympus Group Chat',
    'Banned & Beloved',
    'Unreliable Narrators',
    'Plot Twists Since Antiquity',
    'Dragons, Quests & Curses',
    'Famous First Lines',
  ],
  11: [
    'Math Without Tears',
    'Brain-Bending Paradoxes',
    'Odds Are Against You',
    'Patterns In Plain Sight',
    'Riddle Me This',
    'Zero To Infinity',
  ],
};

export function getAllWittyColumnHeaders(): readonly WittyColumnHeaderEntryV4[] {
  const out: WittyColumnHeaderEntryV4[] = [];
  for (const domainId of ALL_DOMAIN_IDS_V4) {
    const wedgeId = domainToWedgeColor(domainId);
    const topicSubtitle = DOMAIN_TOPIC_SUBTITLE_V4[domainId];
    for (const wittyTitle of WITTY_COLUMN_HEADERS_BY_DOMAIN_V4[domainId]) {
      out.push({ domainId, wedgeId, wittyTitle, topicSubtitle });
    }
  }
  return out;
}

export function getWittyColumnHeader(
  domainId: DomainId,
  rngOrIndex: (() => number) | number = 0,
  excludeTitles?: ReadonlySet<string>,
): WittyColumnHeaderEntryV4 {
  const bank = WITTY_COLUMN_HEADERS_BY_DOMAIN_V4[domainId];
  const candidates = excludeTitles
    ? bank.filter((title) => !excludeTitles.has(title))
    : [...bank];
  const pool = candidates.length > 0 ? candidates : bank;
  const idx =
    typeof rngOrIndex === 'function'
      ? Math.floor(rngOrIndex() * pool.length) % pool.length
      : Math.abs(Math.trunc(rngOrIndex)) % pool.length;
  return {
    domainId,
    wedgeId: domainToWedgeColor(domainId),
    wittyTitle: pool[idx],
    topicSubtitle: DOMAIN_TOPIC_SUBTITLE_V4[domainId],
  };
}

export interface WheelSliceMetaV4 {
  readonly outcome: WheelSliceOutcome;
  readonly label: string;
  readonly shortLabel: string;
  readonly accentHex: string;
  readonly description: string;
}

export const WHEEL_SLICES_V4: readonly WheelSliceMetaV4[] = [
  {
    outcome: 'DOUBLE_POT',
    label: '2x Double Pot',
    shortLabel: '2x POT',
    accentHex: '#f5c451',
    description: 'Your next tile pays 2x base points with zero miss penalty!',
  },
  {
    outcome: 'FREE_WEDGE_SHARD',
    label: 'Free Crown Wedge',
    shortLabel: 'WEDGE',
    accentHex: '#b47cff',
    description: 'Instant free Color Crown Wedge toward your 6-wedge crown!',
  },
  {
    outcome: 'STEAL_RIVAL_POINTS',
    label: 'Rival Heist',
    shortLabel: 'STEAL',
    accentHex: '#f26498',
    description: 'Swipe up to 250 points straight off the Challenger scoreboard!',
  },
  {
    outcome: 'RECHARGE_LIFELINES',
    label: 'Lifeline Surge',
    shortLabel: 'RECHARGE',
    accentHex: '#34d993',
    description: 'Restore +1 50/50 and +1 Hint to your studio console!',
  },
  {
    outcome: 'SHATTER_ALL_LOCKS',
    label: 'Vault Breaker',
    shortLabel: 'UNLOCK ALL',
    accentHex: '#46a8ff',
    description: 'Shatter every Padlock and clear every Fog cloud on the board!',
  },
  {
    outcome: 'HOT_SEAT_ALL_IN',
    label: 'Hot Seat All-In',
    shortLabel: 'HOT SEAT',
    accentHex: '#ff9347',
    description: 'Next tile is high-voltage: +2x base on hit, -1x base on miss!',
  },
] as const;

// ============================================================================
// 2. DETERMINISTIC SEEDED PRNG
// ============================================================================

function hashSeedString(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic Mulberry32 PRNG returning floats in `[0, 1)`.
 */
export function createSeededRng(seed: number | string): () => number {
  let a = (typeof seed === 'string' ? hashSeedString(seed) : Math.trunc(seed) >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function pickRandom<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

// ============================================================================
// 3. BOARD CREATION (`createStageBoard`) & REACHABILITY VERIFICATION
// ============================================================================

export interface DraftedColumnSpecV4 {
  readonly domainId: DomainId;
  readonly wittyTitle?: string;
  readonly topicSubtitle?: string;
  readonly subcategoryId?: string;
  readonly pickedBy: 'PLAYER' | 'RIVAL' | 'SHOW';
}

export interface CreateStageBoardConfigV4 {
  readonly boardId?: string;
  readonly topology: BoardTopologyKind;
  readonly cols?: 4 | 5 | 6;
  readonly rows?: 3 | 4;
  readonly maxTurns?: number;
  readonly allowedFormats?: readonly QuestionFormatV4[];
  /** Explicit domain list per column (overrides random wedge-balanced selection). */
  readonly domains?: readonly DomainId[];
  /** Pre-board Category Pick & Ban Draft result columns. */
  readonly draftedColumns?: readonly DraftedColumnSpecV4[];
  readonly hasActiveRival?: boolean;
  readonly soloTargetScore?: number;
  readonly initialLifelines5050?: number;
  readonly initialLifelinesHint?: number;
  readonly seed?: number | string;
  readonly rng?: () => number;
}

export interface BoardReachabilityReportV4 {
  readonly ok: boolean;
  readonly initialOpenCount: number;
  readonly totalUnplayedCount: number;
  readonly unreachableTileIds: readonly string[];
}

function defaultColsForTopology(topology: BoardTopologyKind): 4 | 5 | 6 {
  switch (topology) {
    case 'GRAND_FINALE_VAULT':
      return 6;
    case 'FOG_CROSSROADS':
    case 'SPOTLIGHT_ROULETTE':
    case 'CHALLENGER_GAUNTLET':
      return 5;
    case 'OPEN_CLASSIC':
    case 'PADLOCK_NEIGHBORS':
    default:
      return 4;
  }
}

function rowPointValuesForHeight(rows: 3 | 4): readonly TilePointValueV4[] {
  return rows === 3 ? [100, 400, 800] : [100, 200, 400, 800];
}

export function getBoardDimensions(board: StageBoardStateV4): { cols: number; rows: number } {
  const cols = board.columns.length;
  const rows = cols > 0 ? Math.max(1, Math.round(board.tiles.length / cols)) : 0;
  return { cols, rows };
}

export function makeTileId(colIndex: number, rowIndex: number): string {
  return `c${colIndex}_r${rowIndex}`;
}

export function getTileById(board: StageBoardStateV4, tileId: string): BoardTileV4 | undefined {
  return board.tiles.find((t) => t.tileId === tileId);
}

export function getTileAt(
  board: StageBoardStateV4,
  colIndex: number,
  rowIndex: number,
): BoardTileV4 | undefined {
  return board.tiles.find((t) => t.colIndex === colIndex && t.rowIndex === rowIndex);
}

export function getOrthogonalNeighbors(
  board: StageBoardStateV4,
  colIndex: number,
  rowIndex: number,
): BoardTileV4[] {
  const deltas: ReadonlyArray<readonly [number, number]> = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  const out: BoardTileV4[] = [];
  for (const [dc, dr] of deltas) {
    const neighbor = getTileAt(board, colIndex + dc, rowIndex + dr);
    if (neighbor) out.push(neighbor);
  }
  return out;
}

export function isUnplayedTileStatus(status: BoardTileStatus): boolean {
  return (
    status === 'OPEN' ||
    status === 'PADLOCKED' ||
    status === 'FOGGED' ||
    status === 'FROZEN_BY_RIVAL'
  );
}

/**
 * Returns every tile that is currently `'OPEN'` AND in an unfrozen column.
 */
export function getPlayableTiles(board: StageBoardStateV4): BoardTileV4[] {
  return board.tiles.filter((tile) => {
    if (tile.status !== 'OPEN') return false;
    const col = board.columns[tile.colIndex];
    return !col || col.frozenTurnsRemaining <= 0;
  });
}

/**
 * Returns the exact set of tiles the player may click right now (length 1 if `forcedTileId` is active).
 */
export function getSelectableTiles(board: StageBoardStateV4): BoardTileV4[] {
  if (board.isBoardComplete) return [];
  const playable = getPlayableTiles(board);
  if (board.forcedTileId) {
    const forced = playable.find((t) => t.tileId === board.forcedTileId);
    if (forced) return [forced];
  }
  return playable;
}

/**
 * BFS reachability verifier: proves every `'PADLOCKED'` and `'FOGGED'` tile can be reached
 * via 4-neighbor orthogonal chain from currently `'OPEN'` tiles.
 */
export function verifyBoardReachability(board: StageBoardStateV4): BoardReachabilityReportV4 {
  const openTiles = board.tiles.filter((t) => t.status === 'OPEN');
  const unplayed = board.tiles.filter((t) => isUnplayedTileStatus(t.status));
  const visited = new Set<string>();
  const queue: BoardTileV4[] = [];

  for (const tile of openTiles) {
    visited.add(tile.tileId);
    queue.push(tile);
  }

  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    for (const nb of getOrthogonalNeighbors(board, cur.colIndex, cur.rowIndex)) {
      if (visited.has(nb.tileId)) continue;
      if (isUnplayedTileStatus(nb.status)) {
        visited.add(nb.tileId);
        queue.push(nb);
      }
    }
  }

  const unreachableTileIds: string[] = [];
  for (const tile of unplayed) {
    if ((tile.status === 'PADLOCKED' || tile.status === 'FOGGED') && !visited.has(tile.tileId)) {
      unreachableTileIds.push(tile.tileId);
    }
  }

  return {
    ok: openTiles.length > 0 && unreachableTileIds.length === 0,
    initialOpenCount: openTiles.length,
    totalUnplayedCount: unplayed.length,
    unreachableTileIds,
  };
}

function buildBalancedColumns(
  cols: 4 | 5 | 6,
  config: CreateStageBoardConfigV4,
  rng: () => number,
): BoardColumnV4[] {
  const usedTitles = new Set<string>();
  const columns: BoardColumnV4[] = [];

  if (config.draftedColumns && config.draftedColumns.length > 0) {
    const chosen = config.draftedColumns.slice(0, cols);
    const usedDomains = new Set<DomainId>(chosen.map((c) => c.domainId));
    const extraWedges = shuffleWithRng(ALL_WEDGE_IDS_V4, rng);

    for (let i = 0; i < chosen.length; i++) {
      const spec = chosen[i];
      const header = getWittyColumnHeader(spec.domainId, rng, usedTitles);
      const wittyTitle = spec.wittyTitle ?? header.wittyTitle;
      usedTitles.add(wittyTitle);
      columns.push({
        colIndex: i,
        wedgeId: domainToWedgeColor(spec.domainId),
        domainId: spec.domainId,
        subcategoryId: spec.subcategoryId,
        wittyTitle,
        topicSubtitle: spec.topicSubtitle ?? DOMAIN_TOPIC_SUBTITLE_V4[spec.domainId],
        frozenTurnsRemaining: 0,
        pickedBy: spec.pickedBy,
      });
    }

    // Pad any remaining slots if draftedColumns had fewer than `cols`
    while (columns.length < cols) {
      const usedWedges = new Set(columns.map((c) => c.wedgeId));
      const candidateWedge =
        extraWedges.find((w) => !usedWedges.has(w)) ?? extraWedges[columns.length % extraWedges.length];
      const wedgeDomains = WEDGE_CATALOG_V4[candidateWedge].domainIds;
      const domainId =
        wedgeDomains.find((d) => !usedDomains.has(d)) ??
        ALL_DOMAIN_IDS_V4.find((d) => !usedDomains.has(d)) ??
        wedgeDomains[0];
      usedDomains.add(domainId);
      const header = getWittyColumnHeader(domainId, rng, usedTitles);
      usedTitles.add(header.wittyTitle);
      columns.push({
        colIndex: columns.length,
        wedgeId: domainToWedgeColor(domainId),
        domainId,
        wittyTitle: header.wittyTitle,
        topicSubtitle: header.topicSubtitle,
        frozenTurnsRemaining: 0,
        pickedBy: 'SHOW',
      });
    }
    return columns;
  }

  if (config.domains && config.domains.length >= cols) {
    for (let i = 0; i < cols; i++) {
      const domainId = config.domains[i];
      const header = getWittyColumnHeader(domainId, rng, usedTitles);
      usedTitles.add(header.wittyTitle);
      columns.push({
        colIndex: i,
        wedgeId: domainToWedgeColor(domainId),
        domainId,
        wittyTitle: header.wittyTitle,
        topicSubtitle: header.topicSubtitle,
        frozenTurnsRemaining: 0,
        pickedBy: 'SHOW',
      });
    }
    return columns;
  }

  // Default: maximize distinct WedgeColorIds (guarantees all 6 Color Wedges on 6-col boards!)
  const shuffledWedges = shuffleWithRng(ALL_WEDGE_IDS_V4, rng);
  const selectedWedges = shuffledWedges.slice(0, cols);
  for (let i = 0; i < cols; i++) {
    const wedgeId = selectedWedges[i];
    const domainsInWedge = WEDGE_CATALOG_V4[wedgeId].domainIds;
    const domainId = pickRandom(domainsInWedge, rng);
    const header = getWittyColumnHeader(domainId, rng, usedTitles);
    usedTitles.add(header.wittyTitle);
    columns.push({
      colIndex: i,
      wedgeId,
      domainId,
      wittyTitle: header.wittyTitle,
      topicSubtitle: header.topicSubtitle,
      frozenTurnsRemaining: 0,
      pickedBy: 'SHOW',
    });
  }
  return columns;
}

function assignInitialStatuses(
  topology: BoardTopologyKind,
  cols: 4 | 5 | 6,
  rows: 3 | 4,
): BoardTileStatus[][] {
  // Grid indexed as grid[row][col]
  const grid: BoardTileStatus[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 'OPEN' as BoardTileStatus),
  );

  const midRow = Math.floor((rows - 1) / 2); // 1 on both 3-row and 4-row boards
  const midLeft = Math.floor((cols - 1) / 2); // 1 (cols=4), 2 (cols=5), 2 (cols=6)
  const midRight = Math.ceil((cols - 1) / 2); // 2 (cols=4), 2 (cols=5), 3 (cols=6)

  switch (topology) {
    case 'OPEN_CLASSIC': {
      // Every tile open right away — welcoming classic board.
      break;
    }

    case 'PADLOCK_NEIGHBORS': {
      for (let r = 1; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          grid[r][c] = 'PADLOCKED';
        }
      }
      // Open a center keystone in row 1 so the board branches dynamically instead of flat top-down!
      grid[1][midLeft] = 'OPEN';
      if (midRight !== midLeft && cols >= 6) {
        grid[1][midRight] = 'OPEN';
      }
      break;
    }

    case 'FOG_CROSSROADS': {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          grid[r][c] = 'FOGGED';
        }
      }
      // Center crossroads starts illuminated & open (>= 4 open tiles!)
      if (midLeft === midRight) {
        // Odd width (5 cols): true plus-sign crossroads (5 open tiles)
        grid[midRow][midLeft] = 'OPEN';
        grid[midRow][midLeft - 1] = 'OPEN';
        grid[midRow][midLeft + 1] = 'OPEN';
        if (midRow > 0) grid[midRow - 1][midLeft] = 'OPEN';
        if (midRow + 1 < rows) grid[midRow + 1][midLeft] = 'OPEN';
      } else {
        // Even width (4 or 6 cols): illuminated central 2x2 crossroads (4 open tiles)
        grid[midRow][midLeft] = 'OPEN';
        grid[midRow][midRight] = 'OPEN';
        grid[Math.max(0, midRow - 1)][midLeft] = 'OPEN';
        grid[Math.max(0, midRow - 1)][midRight] = 'OPEN';
        if (cols === 6 && midRow + 1 < rows) {
          grid[midRow + 1][midLeft] = 'OPEN';
          grid[midRow + 1][midRight] = 'OPEN';
        }
      }
      // Outer bottom-row Crown Vault corners add padlock tension on 4-row boards
      if (rows === 4) {
        grid[rows - 1][0] = 'PADLOCKED';
        grid[rows - 1][cols - 1] = 'PADLOCKED';
      }
      break;
    }

    case 'SPOTLIGHT_ROULETTE': {
      // Mostly open for fast studio spotlight jumps, with outer bottom vaults locked/fogged
      grid[rows - 1][0] = 'PADLOCKED';
      grid[rows - 1][cols - 1] = 'PADLOCKED';
      if (cols >= 5 && rows >= 4) {
        grid[rows - 2][0] = 'FOGGED';
        grid[rows - 2][cols - 1] = 'FOGGED';
      }
      break;
    }

    case 'CHALLENGER_GAUNTLET': {
      // Top row open + staggered mid-board footholds; bottom Crown Wedges padlocked; mid flanks fogged
      for (let r = 1; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r === rows - 1) {
            grid[r][c] = 'PADLOCKED';
          } else if (c === 0 || c === cols - 1) {
            grid[r][c] = 'FOGGED';
          } else if (r === 1 && (c === midLeft || c === midRight)) {
            grid[r][c] = 'OPEN';
          } else {
            grid[r][c] = 'PADLOCKED';
          }
        }
      }
      break;
    }

    case 'GRAND_FINALE_VAULT': {
      // Master championship vault: central runway + top corners open, flanks fogged, 800 Crowns padlocked
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r === rows - 1) {
            grid[r][c] = 'PADLOCKED';
          } else if (r === 0) {
            grid[r][c] =
              c === 0 || c === cols - 1 || c === midLeft || c === midRight ? 'OPEN' : 'FOGGED';
          } else if (r === 1 && (c === midLeft || c === midRight)) {
            grid[r][c] = 'OPEN';
          } else if (c === 0 || c === cols - 1) {
            grid[r][c] = 'FOGGED';
          } else {
            grid[r][c] = 'PADLOCKED';
          }
        }
      }
      break;
    }
  }

  return grid;
}

function assignTwists(
  topology: BoardTopologyKind,
  cols: 4 | 5 | 6,
  rows: 3 | 4,
  statusGrid: BoardTileStatus[][],
  hasActiveRival: boolean,
  rng: () => number,
): { twists: TileTwistKind[][]; revealed: boolean[][] } {
  const twists: TileTwistKind[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 'NONE' as TileTwistKind),
  );
  const revealed: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false),
  );

  // Every column's bottom (800) tile is a CROWN_WEDGE!
  for (let c = 0; c < cols; c++) {
    twists[rows - 1][c] = 'CROWN_WEDGE';
    // Visible behind padlocks so players see the Crown Wedge goal; shrouded under Fog until cleared!
    revealed[rows - 1][c] = statusGrid[rows - 1][c] !== 'FOGGED';
  }

  // Non-bottom candidate cells
  const upperCells: Array<{ c: number; r: number }> = [];
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      upperCells.push({ c, r });
    }
  }
  const shuffledUpper = shuffleWithRng(upperCells, rng);
  let cursor = 0;

  const hasAdjacentSameTwist = (c: number, r: number, kind: TileTwistKind): boolean => {
    if (c > 0 && twists[r][c - 1] === kind) return true;
    if (c + 1 < cols && twists[r][c + 1] === kind) return true;
    if (r > 0 && twists[r - 1][c] === kind) return true;
    if (r + 1 < rows && twists[r + 1][c] === kind) return true;
    return false;
  };

  const placeTwist = (
    kind: TileTwistKind,
    count: number,
    preferRow?: number,
    revealRule: 'ALWAYS' | 'IF_OPEN' | 'HIDDEN' = 'IF_OPEN',
  ): void => {
    let placed = 0;
    // Pass 1: try preferred row if specified, avoiding adjacent duplicate twists
    if (preferRow !== undefined && preferRow < rows - 1) {
      for (const cell of shuffledUpper) {
        if (placed >= count) break;
        if (cell.r !== preferRow) continue;
        if (twists[cell.r][cell.c] !== 'NONE') continue;
        if (hasAdjacentSameTwist(cell.c, cell.r, kind)) continue;
        twists[cell.r][cell.c] = kind;
        revealed[cell.r][cell.c] =
          revealRule === 'ALWAYS'
            ? true
            : revealRule === 'IF_OPEN'
              ? statusGrid[cell.r][cell.c] === 'OPEN'
              : false;
        placed++;
      }
    }
    // Pass 2: any remaining upper cell avoiding adjacent duplicate twists
    while (placed < count && cursor < shuffledUpper.length) {
      const cell = shuffledUpper[cursor++];
      if (twists[cell.r][cell.c] !== 'NONE') continue;
      if (hasAdjacentSameTwist(cell.c, cell.r, kind)) continue;
      twists[cell.r][cell.c] = kind;
      revealed[cell.r][cell.c] =
        revealRule === 'ALWAYS'
          ? true
          : revealRule === 'IF_OPEN'
            ? statusGrid[cell.r][cell.c] === 'OPEN'
            : false;
      placed++;
    }
    // Fallback sweep in case cursor passed earlier skipped cells
    if (placed < count) {
      for (const cell of shuffledUpper) {
        if (placed >= count) break;
        if (twists[cell.r][cell.c] !== 'NONE') continue;
        twists[cell.r][cell.c] = kind;
        revealed[cell.r][cell.c] =
          revealRule === 'ALWAYS'
            ? true
            : revealRule === 'IF_OPEN'
              ? statusGrid[cell.r][cell.c] === 'OPEN'
              : false;
        placed++;
      }
    }
  };

  const midRow = rows === 4 ? 2 : 1;
  const largeBoard = cols * rows >= 16;

  switch (topology) {
    case 'OPEN_CLASSIC':
      placeTwist('POWER_PLAY', 1, midRow, 'HIDDEN');
      placeTwist('WHEEL_CURVEBALL', 1, 1, 'IF_OPEN');
      placeTwist('LIGHTNING_BLITZ', 1, 0, 'IF_OPEN');
      break;

    case 'PADLOCK_NEIGHBORS':
      placeTwist('POWER_PLAY', largeBoard ? 2 : 1, midRow, 'HIDDEN');
      placeTwist('WHEEL_CURVEBALL', largeBoard ? 2 : 1, 1, 'IF_OPEN');
      placeTwist('LIGHTNING_BLITZ', 1, 0, 'IF_OPEN');
      break;

    case 'FOG_CROSSROADS':
      placeTwist('POWER_PLAY', largeBoard ? 2 : 1, midRow, 'HIDDEN');
      placeTwist('WHEEL_CURVEBALL', largeBoard ? 2 : 1, 1, 'IF_OPEN');
      placeTwist('SPOTLIGHT_SWEEP', 1, 1, 'HIDDEN');
      placeTwist('LIGHTNING_BLITZ', 1, 0, 'IF_OPEN');
      break;

    case 'SPOTLIGHT_ROULETTE':
      placeTwist('SPOTLIGHT_SWEEP', largeBoard ? 2 : 1, 1, 'HIDDEN');
      placeTwist('POWER_PLAY', largeBoard ? 2 : 1, midRow, 'HIDDEN');
      placeTwist('WHEEL_CURVEBALL', largeBoard ? 2 : 1, 1, 'IF_OPEN');
      placeTwist('LIGHTNING_BLITZ', 1, 0, 'IF_OPEN');
      break;

    case 'CHALLENGER_GAUNTLET':
      placeTwist('POWER_PLAY', largeBoard ? 2 : 1, midRow, 'HIDDEN');
      placeTwist('WHEEL_CURVEBALL', largeBoard ? 2 : 1, 1, 'IF_OPEN');
      placeTwist('LIGHTNING_BLITZ', 1, 0, 'IF_OPEN');
      if (hasActiveRival) {
        placeTwist('RIVAL_BOUNTY', 1, 0, 'ALWAYS');
      }
      break;

    case 'GRAND_FINALE_VAULT':
      placeTwist('POWER_PLAY', 2, midRow, 'HIDDEN');
      placeTwist('WHEEL_CURVEBALL', 2, 1, 'IF_OPEN');
      placeTwist('SPOTLIGHT_SWEEP', largeBoard ? 2 : 1, 1, 'IF_OPEN');
      placeTwist('LIGHTNING_BLITZ', largeBoard ? 2 : 1, 0, 'IF_OPEN');
      if (hasActiveRival) {
        placeTwist('RIVAL_BOUNTY', 1, 0, 'ALWAYS');
      }
      break;
  }

  return { twists, revealed };
}

function assignVariedFormats(
  cols: 4 | 5 | 6,
  rows: 3 | 4,
  allowedFormats: readonly QuestionFormatV4[],
  twistGrid: TileTwistKind[][],
  rng: () => number,
): QuestionFormatV4[][] {
  const uniqueAllowed: QuestionFormatV4[] = [];
  for (const fmt of allowedFormats) {
    if (!uniqueAllowed.includes(fmt)) uniqueAllowed.push(fmt);
  }
  const formats: readonly QuestionFormatV4[] =
    uniqueAllowed.length > 0 ? uniqueAllowed : ALL_QUESTION_FORMATS_V4;

  const usage = new Map<QuestionFormatV4, number>();
  for (const f of formats) usage.set(f, 0);

  const grid: Array<Array<QuestionFormatV4 | null>> = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null),
  );

  // Pass 1: LIGHTNING_BLITZ tiles prefer punchy MULTIPLE_CHOICE (or MULTI_STRIKE)
  const blitzPreferred: QuestionFormatV4 | null = formats.includes('MULTIPLE_CHOICE')
    ? 'MULTIPLE_CHOICE'
    : formats.includes('MULTI_STRIKE')
      ? 'MULTI_STRIKE'
      : null;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (twistGrid[r][c] === 'LIGHTNING_BLITZ' && blitzPreferred) {
        grid[r][c] = blitzPreferred;
        usage.set(blitzPreferred, (usage.get(blitzPreferred) ?? 0) + 1);
      }
    }
  }

  // Pass 2: Assign remaining tiles avoiding orthogonal neighbor collisions & balancing all formats
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== null) continue;
      const forbidden = new Set<QuestionFormatV4>();
      if (c > 0 && grid[r][c - 1]) forbidden.add(grid[r][c - 1] as QuestionFormatV4);
      if (c + 1 < cols && grid[r][c + 1]) forbidden.add(grid[r][c + 1] as QuestionFormatV4);
      if (r > 0 && grid[r - 1][c]) forbidden.add(grid[r - 1][c] as QuestionFormatV4);
      if (r + 1 < rows && grid[r + 1][c]) forbidden.add(grid[r + 1][c] as QuestionFormatV4);

      const nonAdjacent = formats.filter((f) => !forbidden.has(f));
      const pool = nonAdjacent.length > 0 ? nonAdjacent : formats;

      let minCount = Infinity;
      for (const f of pool) {
        const count = usage.get(f) ?? 0;
        if (count < minCount) minCount = count;
      }
      const leastUsed = pool.filter((f) => (usage.get(f) ?? 0) === minCount);
      const chosen = pickRandom(leastUsed, rng);
      grid[r][c] = chosen;
      usage.set(chosen, (usage.get(chosen) ?? 0) + 1);
    }
  }

  return grid as QuestionFormatV4[][];
}

/**
 * Builds a complete, guaranteed-solvable `StageBoardStateV4` for any of the 6 topologies
 * (`4..6` cols x `3..4` rows).
 */
export function createStageBoard(config: CreateStageBoardConfigV4): StageBoardStateV4 {
  const rng =
    config.rng ??
    (config.seed !== undefined ? createSeededRng(config.seed) : Math.random);
  const cols: 4 | 5 | 6 = config.cols ?? defaultColsForTopology(config.topology);
  const rows: 3 | 4 = config.rows ?? 4;
  const hasActiveRival = config.hasActiveRival ?? true;
  const soloTargetScore = config.soloTargetScore ?? 1200;
  const defaultTurns = Math.min(cols * rows, Math.max(8, Math.round(cols * rows * 0.65)));
  const maxTurns = Math.max(1, config.maxTurns ?? defaultTurns);

  const columns = buildBalancedColumns(cols, config, rng);
  const statusGrid = assignInitialStatuses(config.topology, cols, rows);
  const { twists, revealed } = assignTwists(
    config.topology,
    cols,
    rows,
    statusGrid,
    hasActiveRival,
    rng,
  );
  const formatGrid = assignVariedFormats(
    cols,
    rows,
    config.allowedFormats ?? ALL_QUESTION_FORMATS_V4,
    twists,
    rng,
  );
  const rowValues = rowPointValuesForHeight(rows);

  const tiles: BoardTileV4[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const col = columns[c];
      tiles.push({
        tileId: makeTileId(c, r),
        colIndex: c,
        rowIndex: r,
        pointValue: rowValues[r],
        wedgeId: col.wedgeId,
        domainId: col.domainId,
        format: formatGrid[r][c],
        status: statusGrid[r][c],
        twist: twists[r][c],
        twistRevealedToPlayer: revealed[r][c],
      });
    }
  }

  const boardId =
    config.boardId ??
    `board_${config.topology.toLowerCase()}_${cols}x${rows}_${Math.floor(rng() * 1e6)}`;

  let board: StageBoardStateV4 = {
    boardId,
    topology: config.topology,
    columns,
    tiles,
    turnNumber: 0,
    maxTurns,
    turnsRemaining: maxTurns,
    playerScore: 0,
    rivalScore: 0,
    soloTargetScore,
    hasActiveRival,
    earnedWedges: [],
    rivalWedges: [],
    lifelines5050Left: config.initialLifelines5050 ?? 2,
    lifelinesHintLeft: config.initialLifelinesHint ?? 2,
    forcedTileId: null,
    forcedReasonBanner: null,
    completedLinesCount: 0,
    isBoardComplete: false,
  };

  // Guarantee at least 3-4 starter OPEN tiles and 100% reachability at Turn 1
  const reach = verifyBoardReachability(board);
  if (!reach.ok || reach.initialOpenCount < 3) {
    const fixed = ensurePlayableTilesOrStageSurge(board, rng, 4);
    board = fixed.board;
  }

  return board;
}

/**
 * Convenience constructor directly from a `WorldTourEpisodeV4` campaign episode.
 */
export function createStageBoardFromEpisode(
  episode: WorldTourEpisodeV4,
  overrides?: Partial<CreateStageBoardConfigV4>,
): StageBoardStateV4 {
  return createStageBoard({
    boardId: `ep_${episode.episodeId}`,
    topology: episode.topology,
    cols: episode.boardCols,
    rows: episode.boardRows,
    maxTurns: episode.maxTurns,
    allowedFormats: episode.allowedFormats,
    hasActiveRival: episode.challengerId !== null,
    soloTargetScore: episode.soloTargetScore,
    ...overrides,
  });
}

// ============================================================================
// 4. ANTI-SOFT-LOCK STAGE SURGE & SPOTLIGHT PICKER
// ============================================================================

export interface StageSurgeResultV4 {
  readonly board: StageBoardStateV4;
  readonly triggered: boolean;
  readonly unlockedTileIds: readonly string[];
  readonly thawedColIndices: readonly number[];
}

/**
 * Guarantees ZERO soft-locks at any point during a match:
 * If unplayed tiles exist yet zero tiles are currently selectable (all remaining tiles
 * are padlocked, fogged, or inside frozen columns), triggers a dramatic Stage Surge
 * that cracks up to `crackTarget` padlocks/fog tiles (default 2) or thaws columns so
 * the player ALWAYS has legal moves.
 */
export function ensurePlayableTilesOrStageSurge(
  board: StageBoardStateV4,
  rng: () => number = Math.random,
  crackTarget = 2,
): StageSurgeResultV4 {
  if (board.isBoardComplete) {
    return { board, triggered: false, unlockedTileIds: [], thawedColIndices: [] };
  }

  const unplayed = board.tiles.filter((t) => isUnplayedTileStatus(t.status));
  if (unplayed.length === 0) {
    return {
      board: { ...board, isBoardComplete: true, forcedTileId: null, forcedReasonBanner: null },
      triggered: false,
      unlockedTileIds: [],
      thawedColIndices: [],
    };
  }

  const playableNow = getPlayableTiles(board);
  if (playableNow.length > 0) {
    // Also verify forcedTileId (if any) is still playable; clear stale forcedTileId if not
    if (board.forcedTileId && !playableNow.some((t) => t.tileId === board.forcedTileId)) {
      return {
        board: { ...board, forcedTileId: null, forcedReasonBanner: null },
        triggered: false,
        unlockedTileIds: [],
        thawedColIndices: [],
      };
    }
    return { board, triggered: false, unlockedTileIds: [], thawedColIndices: [] };
  }

  // Zero playable tiles despite remaining unplayed tiles -> STAGE SURGE!
  let columns = board.columns.map((c) => ({ ...c }));
  const tiles = board.tiles.map((t) => ({ ...t }));
  const unlockedTileIds: string[] = [];
  const thawedColIndices: number[] = [];

  // Step 1: Crack up to `crackTarget` PADLOCKED / FOGGED tiles in unfrozen columns first
  const lockedInUnfrozen = tiles.filter(
    (t) =>
      (t.status === 'PADLOCKED' || t.status === 'FOGGED') &&
      columns[t.colIndex].frozenTurnsRemaining <= 0,
  );
  const lockedAnywhere = tiles.filter(
    (t) => t.status === 'PADLOCKED' || t.status === 'FOGGED',
  );
  const crackCandidates = shuffleWithRng(
    lockedInUnfrozen.length > 0 ? lockedInUnfrozen : lockedAnywhere,
    rng,
  ).sort((a, b) => a.rowIndex - b.rowIndex);

  for (const cand of crackCandidates) {
    if (unlockedTileIds.length >= crackTarget) break;
    const target = tiles.find((t) => t.tileId === cand.tileId);
    if (!target) continue;
    if (columns[target.colIndex].frozenTurnsRemaining > 0) {
      columns[target.colIndex].frozenTurnsRemaining = 0;
      if (!thawedColIndices.includes(target.colIndex)) {
        thawedColIndices.push(target.colIndex);
      }
    }
    target.status = 'OPEN';
    if (target.twist !== 'POWER_PLAY') {
      target.twistRevealedToPlayer = true;
    }
    unlockedTileIds.push(target.tileId);
  }

  // Step 2: If still zero playable (all remaining tiles were FROZEN_BY_RIVAL), thaw frozen columns!
  const anyPlayableNow = tiles.some(
    (t) => t.status === 'OPEN' && columns[t.colIndex].frozenTurnsRemaining <= 0,
  );
  if (!anyPlayableNow) {
    columns = columns.map((col) => {
      if (col.frozenTurnsRemaining > 0) {
        if (!thawedColIndices.includes(col.colIndex)) thawedColIndices.push(col.colIndex);
        return { ...col, frozenTurnsRemaining: 0 };
      }
      return col;
    });
    for (const tile of tiles) {
      if (tile.status === 'FROZEN_BY_RIVAL') {
        tile.status = 'OPEN';
        unlockedTileIds.push(tile.tileId);
      }
    }
  }

  // Clear any stale forcedTileId that is no longer playable
  const nextBoardBase: StageBoardStateV4 = {
    ...board,
    columns,
    tiles,
  };
  const validPlayable = getPlayableTiles(nextBoardBase);
  const keepForced =
    board.forcedTileId !== null && validPlayable.some((t) => t.tileId === board.forcedTileId);

  return {
    board: {
      ...nextBoardBase,
      forcedTileId: keepForced ? board.forcedTileId : null,
      forcedReasonBanner: keepForced ? board.forcedReasonBanner : null,
    },
    triggered: true,
    unlockedTileIds,
    thawedColIndices,
  };
}

/**
 * Picks a dramatic playable tile for Stage Spotlight Roulette or Spotlight Sweep.
 */
export function pickStageSpotlightTile(
  board: StageBoardStateV4,
  rng: () => number = Math.random,
  avoidColIndex?: number,
): BoardTileV4 | null {
  const playable = getPlayableTiles(board);
  if (playable.length === 0) return null;

  const diffCol =
    avoidColIndex !== undefined
      ? playable.filter((t) => t.colIndex !== avoidColIndex)
      : playable;
  const pool = diffCol.length > 0 ? diffCol : playable;

  // Slightly favor dramatic mid/high-value or twist tiles for great broadcast TV energy
  const exciting = pool.filter(
    (t) => t.twist !== 'NONE' || t.pointValue >= 200,
  );
  const chosenPool = exciting.length > 0 && rng() < 0.72 ? exciting : pool;
  return pickRandom(chosenPool, rng);
}

// ============================================================================
// 5. LINE-CLEAR COMBO DETECTION & TILE RESOLUTION (`resolveTileResult`)
// ============================================================================

export interface ResolveTileOptionsV4 {
  readonly currentStreak?: number;
  readonly doubleDownArmed?: boolean;
  readonly powerPlayWager?: number | null;
  readonly wheelEffect?: WheelActiveEffectV4;
  readonly allowNegative?: boolean;
  readonly rng?: () => number;
  /** Set true if `evalResult` was already produced by `ScoringV4.scoreAnswerV4`. */
  readonly evalResultIsFinalized?: boolean;
  /** Optional precomputed rival delta when `evalResultIsFinalized` is true. */
  readonly precomputedRivalDelta?: number;
}

export interface LineClearRewardV4 {
  readonly kind: 'ROW' | 'COLUMN';
  readonly index: number;
  readonly rewardType: 'CRACK_LOCK' | 'RECHARGE_LIFELINE';
  readonly unlockedTileId?: string;
  readonly lifelineRecharged?: '5050' | 'HINT';
  readonly banner: string;
}

export interface ResolveTileOutcomeV4 {
  readonly board: StageBoardStateV4;
  readonly resolvedTile: BoardTileV4;
  readonly playerScoreDelta: number;
  readonly rivalScoreDelta: number;
  readonly bountyPlayerDelta: number;
  readonly bountyRivalDelta: number;
  readonly evaluated: EvaluatedAnswerV4;
  readonly unlockedTileIds: readonly string[];
  readonly awardedWedge: WedgeColorId | null;
  readonly lineClearTriggered: boolean;
  readonly lineClearRewards: readonly LineClearRewardV4[];
  readonly triggeredSpotlightSweep: boolean;
  readonly triggeredWheelCurveball: boolean;
  readonly stageSurgeTriggered: boolean;
  readonly stageSurgeUnlockedIds: readonly string[];
  readonly stageSpotlightForced: boolean;
  readonly newStreak: number;
}

function longestWinRunInLine(statuses: readonly BoardTileStatus[]): number {
  let best = 0;
  let cur = 0;
  for (const s of statuses) {
    if (s === 'CLEARED_WIN') {
      cur++;
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
  }
  return best;
}

function countRowWinMilestones(
  tiles: readonly BoardTileV4[],
  cols: number,
  rowIndex: number,
): number {
  const rowStatuses: BoardTileStatus[] = [];
  for (let c = 0; c < cols; c++) {
    const t = tiles.find((tile) => tile.colIndex === c && tile.rowIndex === rowIndex);
    rowStatuses.push(t ? t.status : 'CLEARED_MISS');
  }
  const run = longestWinRunInLine(rowStatuses);
  let milestones = 0;
  if (run >= 3) milestones++;
  if (cols >= 6 && run >= 6) milestones++;
  return milestones;
}

function countColWinMilestones(
  tiles: readonly BoardTileV4[],
  rows: number,
  colIndex: number,
): number {
  const colStatuses: BoardTileStatus[] = [];
  for (let r = 0; r < rows; r++) {
    const t = tiles.find((tile) => tile.colIndex === colIndex && tile.rowIndex === r);
    colStatuses.push(t ? t.status : 'CLEARED_MISS');
  }
  const run = longestWinRunInLine(colStatuses);
  return run >= 3 ? 1 : 0;
}

/**
 * Resolves a player's answer on `tileId`:
 * - Applies 100% honest 1:1 score & rival bounty updates via `ScoringV4`
 * - Unlocks orthogonal `'PADLOCKED'` and `'FOGGED'` neighbors
 * - Awards the column's `WedgeColorId` on winning a `CROWN_WEDGE` tile
 * - Triggers Line-Clear Combos (3/4 in a row cracks a lock or recharges a lifeline!)
 * - Decrements Rival column freezes (thawing frozen tiles cleanly)
 * - Triggers Spotlight Sweep / solo Spotlight Roulette forced picks when applicable
 * - Enforces zero-soft-lock Stage Surge protection & checks board completion
 */
export function resolveTileResult(
  board: StageBoardStateV4,
  tileId: string,
  evalResult: EvaluatedAnswerV4,
  options: ResolveTileOptionsV4 = {},
): ResolveTileOutcomeV4 {
  const rng = options.rng ?? Math.random;
  const tileIndex = board.tiles.findIndex((t) => t.tileId === tileId);
  if (tileIndex < 0) {
    throw new Error(`BoardEngine.resolveTileResult: unknown tileId "${tileId}"`);
  }
  const targetTile = board.tiles[tileIndex];
  if (!isUnplayedTileStatus(targetTile.status)) {
    throw new Error(
      `BoardEngine.resolveTileResult: tile "${tileId}" is already resolved (${targetTile.status})`,
    );
  }
  if (targetTile.status !== 'OPEN') {
    throw new Error(
      `BoardEngine.resolveTileResult: tile "${tileId}" is not OPEN (${targetTile.status})`,
    );
  }
  const targetCol = board.columns[targetTile.colIndex];
  if (targetCol && targetCol.frozenTurnsRemaining > 0) {
    throw new Error(
      `BoardEngine.resolveTileResult: column ${targetTile.colIndex} ("${targetCol.wittyTitle}") is currently frozen`,
    );
  }

  const { cols, rows } = getBoardDimensions(board);

  // 1. Score resolution (100% exact 1:1 conservation)
  const scoreRes = reconcileEvaluatedAnswerForBoard({
    evalResult,
    tilePointValue: targetTile.pointValue,
    tileTwist: targetTile.twist,
    currentPlayerScore: board.playerScore,
    currentRivalScore: board.rivalScore,
    hasActiveRival: board.hasActiveRival,
    currentStreak: options.currentStreak ?? 0,
    doubleDownArmed: options.doubleDownArmed ?? false,
    powerPlayWager: options.powerPlayWager ?? null,
    wheelEffect: options.wheelEffect ?? 'NONE',
    allowNegative: options.allowNegative ?? false,
    evalResultIsFinalized: options.evalResultIsFinalized ?? false,
  });

  const extraRivalDelta =
    options.evalResultIsFinalized && typeof options.precomputedRivalDelta === 'number'
      ? Math.round(options.precomputedRivalDelta)
      : 0;
  const rivalScoreApplied =
    extraRivalDelta !== 0
      ? applyScoreDelta(
          scoreRes.newRivalScore,
          extraRivalDelta,
          options.allowNegative ?? false,
        )
      : { newScore: scoreRes.newRivalScore, appliedDelta: 0 };

  const totalRivalDelta = scoreRes.rivalDelta + rivalScoreApplied.appliedDelta;
  const nextRivalScore = rivalScoreApplied.newScore;

  // Baseline line milestones BEFORE flipping this tile
  const beforeRowLines = countRowWinMilestones(board.tiles, cols, targetTile.rowIndex);
  const beforeColLines = countColWinMilestones(board.tiles, rows, targetTile.colIndex);

  // 2. Clone mutable working arrays
  const nextColumns = board.columns.map((c) => ({ ...c }));
  const nextTiles = board.tiles.map((t) => ({ ...t }));

  // 3. Decrement existing column freeze counters FIRST so thawed columns open cleanly for next turn
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

  // 4. Mark resolved tile
  const resolvedTile: BoardTileV4 = {
    ...nextTiles[tileIndex],
    status: evalResult.isCorrect ? 'CLEARED_WIN' : 'CLEARED_MISS',
    twistRevealedToPlayer: true,
    forcedByRival: false,
  };
  nextTiles[tileIndex] = resolvedTile;

  // 5. Unlock orthogonal PADLOCKED & FOGGED neighbors!
  const unlockedTileIds: string[] = [];
  const neighborDeltas: ReadonlyArray<readonly [number, number]> = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dc, dr] of neighborDeltas) {
    const nc = resolvedTile.colIndex + dc;
    const nr = resolvedTile.rowIndex + dr;
    const nbIdx = nextTiles.findIndex((t) => t.colIndex === nc && t.rowIndex === nr);
    if (nbIdx < 0) continue;
    const nb = nextTiles[nbIdx];
    if (nb.status === 'PADLOCKED' || nb.status === 'FOGGED') {
      const nbColFrozen = nextColumns[nb.colIndex].frozenTurnsRemaining > 0;
      nextTiles[nbIdx] = {
        ...nb,
        status: nbColFrozen ? 'FROZEN_BY_RIVAL' : 'OPEN',
        twistRevealedToPlayer: nb.twist === 'POWER_PLAY' ? nb.twistRevealedToPlayer : true,
      };
      unlockedTileIds.push(nb.tileId);
    }
  }

  // 6. Award Crown Wedge if CROWN_WEDGE won
  let awardedWedge: WedgeColorId | null = null;
  const nextEarnedWedges = [...board.earnedWedges];
  if (evalResult.isCorrect && resolvedTile.twist === 'CROWN_WEDGE') {
    if (!nextEarnedWedges.includes(resolvedTile.wedgeId)) {
      nextEarnedWedges.push(resolvedTile.wedgeId);
      awardedWedge = resolvedTile.wedgeId;
    }
  }

  // 7. Line-Clear Combos (3 or 4 in a row cracks a lock or recharges a lifeline!)
  let lifelines5050Left = board.lifelines5050Left;
  let lifelinesHintLeft = board.lifelinesHintLeft;
  let completedLinesCount = board.completedLinesCount;
  const lineClearRewards: LineClearRewardV4[] = [];

  if (evalResult.isCorrect) {
    const afterRowLines = countRowWinMilestones(nextTiles, cols, resolvedTile.rowIndex);
    const afterColLines = countColWinMilestones(nextTiles, rows, resolvedTile.colIndex);
    const newLineSpecs: Array<{ kind: 'ROW' | 'COLUMN'; index: number }> = [];
    for (let i = beforeRowLines; i < afterRowLines; i++) {
      newLineSpecs.push({ kind: 'ROW', index: resolvedTile.rowIndex });
    }
    for (let i = beforeColLines; i < afterColLines; i++) {
      newLineSpecs.push({ kind: 'COLUMN', index: resolvedTile.colIndex });
    }

    for (const spec of newLineSpecs) {
      completedLinesCount++;
      // Reward Priority 1: Crack a remaining PADLOCKED or FOGGED tile (prefer unfrozen highest value!)
      const lockedPool = nextTiles
        .filter((t) => t.status === 'PADLOCKED' || t.status === 'FOGGED')
        .sort((a, b) => {
          const aFrozen = nextColumns[a.colIndex].frozenTurnsRemaining > 0 ? 1 : 0;
          const bFrozen = nextColumns[b.colIndex].frozenTurnsRemaining > 0 ? 1 : 0;
          if (aFrozen !== bFrozen) return aFrozen - bFrozen;
          return b.pointValue - a.pointValue;
        });

      if (lockedPool.length > 0) {
        const crackTarget = lockedPool[0];
        const idx = nextTiles.findIndex((t) => t.tileId === crackTarget.tileId);
        const colFrozen = nextColumns[crackTarget.colIndex].frozenTurnsRemaining > 0;
        nextTiles[idx] = {
          ...crackTarget,
          status: colFrozen ? 'FROZEN_BY_RIVAL' : 'OPEN',
          twistRevealedToPlayer:
            crackTarget.twist === 'POWER_PLAY' ? crackTarget.twistRevealedToPlayer : true,
        };
        if (!unlockedTileIds.includes(crackTarget.tileId)) {
          unlockedTileIds.push(crackTarget.tileId);
        }
        const colTitle = nextColumns[crackTarget.colIndex].wittyTitle;
        lineClearRewards.push({
          kind: spec.kind,
          index: spec.index,
          rewardType: 'CRACK_LOCK',
          unlockedTileId: crackTarget.tileId,
          banner: `LINE CLEAR COMBO! Shattered the vault on ${colTitle} (${crackTarget.pointValue} pts)!`,
        });
      } else {
        // Reward Priority 2: Recharge a lifeline!
        const rechargeKind: '5050' | 'HINT' =
          lifelines5050Left <= lifelinesHintLeft ? '5050' : 'HINT';
        if (rechargeKind === '5050') {
          lifelines5050Left = Math.min(4, lifelines5050Left + 1);
        } else {
          lifelinesHintLeft = Math.min(4, lifelinesHintLeft + 1);
        }
        lineClearRewards.push({
          kind: spec.kind,
          index: spec.index,
          rewardType: 'RECHARGE_LIFELINE',
          lifelineRecharged: rechargeKind,
          banner: `LINE CLEAR COMBO! Recharged +1 ${rechargeKind === '5050' ? '50/50 Split' : 'Studio Hint'}!`,
        });
      }
    }
  }

  // 8. Advance turn & check completion
  const nextTurnNumber = board.turnNumber + 1;
  const nextTurnsRemaining = Math.max(0, board.turnsRemaining - 1);
  const unplayedRemaining = nextTiles.filter((t) => isUnplayedTileStatus(t.status)).length;
  const isBoardComplete = nextTurnsRemaining <= 0 || unplayedRemaining === 0;

  let nextBoard: StageBoardStateV4 = {
    ...board,
    columns: nextColumns,
    tiles: nextTiles,
    turnNumber: nextTurnNumber,
    turnsRemaining: nextTurnsRemaining,
    playerScore: scoreRes.newPlayerScore,
    rivalScore: nextRivalScore,
    earnedWedges: nextEarnedWedges,
    lifelines5050Left,
    lifelinesHintLeft,
    forcedTileId: null,
    forcedReasonBanner: null,
    completedLinesCount,
    isBoardComplete,
  };

  // 9. Anti-soft-lock Stage Surge check
  let stageSurgeTriggered = false;
  let stageSurgeUnlockedIds: readonly string[] = [];
  if (!nextBoard.isBoardComplete) {
    const surge = ensurePlayableTilesOrStageSurge(nextBoard, rng, 2);
    nextBoard = surge.board;
    stageSurgeTriggered = surge.triggered;
    stageSurgeUnlockedIds = surge.unlockedTileIds;
    for (const id of surge.unlockedTileIds) {
      if (!unlockedTileIds.includes(id)) unlockedTileIds.push(id);
    }
  }

  // 10. Spotlight Sweep twist OR solo Spotlight Roulette cadence
  let triggeredSpotlightSweep = false;
  let stageSpotlightForced = false;
  if (!nextBoard.isBoardComplete) {
    if (resolvedTile.twist === 'SPOTLIGHT_SWEEP') {
      const jumped = pickStageSpotlightTile(nextBoard, rng, resolvedTile.colIndex);
      if (jumped) {
        const col = nextBoard.columns[jumped.colIndex];
        triggeredSpotlightSweep = true;
        stageSpotlightForced = true;
        nextBoard = {
          ...nextBoard,
          forcedTileId: jumped.tileId,
          forcedReasonBanner: `SPOTLIGHT SWEEP! The studio beam snapped straight to "${col.wittyTitle}" (${jumped.pointValue} pts)!`,
        };
      }
    } else if (
      !nextBoard.hasActiveRival &&
      (nextBoard.topology === 'SPOTLIGHT_ROULETTE' ||
        nextBoard.topology === 'GRAND_FINALE_VAULT') &&
      nextBoard.turnNumber % 2 === 0
    ) {
      const picked = pickStageSpotlightTile(nextBoard, rng, resolvedTile.colIndex);
      if (picked) {
        const col = nextBoard.columns[picked.colIndex];
        stageSpotlightForced = true;
        nextBoard = {
          ...nextBoard,
          forcedTileId: picked.tileId,
          forcedReasonBanner: `SPOTLIGHT ROULETTE! No choosing this turn — you're live on "${col.wittyTitle}" (${picked.pointValue} pts)!`,
        };
      }
    }
  }

  const triggeredWheelCurveball =
    resolvedTile.twist === 'WHEEL_CURVEBALL' && evalResult.isCorrect;

  return {
    board: nextBoard,
    resolvedTile,
    playerScoreDelta: scoreRes.playerDelta,
    rivalScoreDelta: totalRivalDelta,
    bountyPlayerDelta: scoreRes.bountyPlayerDelta,
    bountyRivalDelta: scoreRes.bountyRivalDelta,
    evaluated: scoreRes.evaluated,
    unlockedTileIds,
    awardedWedge,
    lineClearTriggered: lineClearRewards.length > 0,
    lineClearRewards,
    triggeredSpotlightSweep,
    triggeredWheelCurveball,
    stageSurgeTriggered,
    stageSurgeUnlockedIds,
    stageSpotlightForced,
    newStreak: scoreRes.newStreak,
  };
}

// ============================================================================
// 6. 6-SLICE SHOW WHEEL CURVEBALL (`spinCurveballWheel`)
// ============================================================================

export interface WheelSpinResultV4 {
  readonly board: StageBoardStateV4;
  readonly outcome: WheelSliceOutcome;
  readonly sliceMeta: WheelSliceMetaV4;
  readonly nextTileEffect: WheelActiveEffectV4;
  readonly playerScoreDelta: number;
  readonly rivalScoreDelta: number;
  readonly awardedWedge: WedgeColorId | null;
  readonly unlockedTileIds: readonly string[];
  readonly lifelinesAdded5050: number;
  readonly lifelinesAddedHint: number;
  readonly banner: string;
}

/**
 * Spins the 6-slice Show Wheel and cleanly applies whichever `WheelSliceOutcome` lands.
 * Pass `forcedOutcome` only for deterministic tests or tutorial demonstrations.
 */
export function spinCurveballWheel(
  board: StageBoardStateV4,
  rng: () => number = Math.random,
  forcedOutcome?: WheelSliceOutcome,
): WheelSpinResultV4 {
  const sliceMeta = forcedOutcome
    ? (WHEEL_SLICES_V4.find((s) => s.outcome === forcedOutcome) ?? WHEEL_SLICES_V4[0])
    : pickRandom(WHEEL_SLICES_V4, rng);

  let nextBoard: StageBoardStateV4 = board;
  let nextTileEffect: WheelActiveEffectV4 = 'NONE';
  let playerScoreDelta = 0;
  let rivalScoreDelta = 0;
  let awardedWedge: WedgeColorId | null = null;
  const unlockedTileIds: string[] = [];
  let lifelinesAdded5050 = 0;
  let lifelinesAddedHint = 0;
  let banner = '';

  switch (sliceMeta.outcome) {
    case 'DOUBLE_POT': {
      nextTileEffect = 'DOUBLE_POT';
      banner = 'SHOW WHEEL: 2x DOUBLE POT! Your next tile pays double base points with zero penalty!';
      break;
    }

    case 'FREE_WEDGE_SHARD': {
      const boardWedges = Array.from(new Set(board.columns.map((c) => c.wedgeId)));
      const missingBoardWedge = boardWedges.find((w) => !board.earnedWedges.includes(w));
      const missingGlobalWedge = ALL_WEDGE_IDS_V4.find((w) => !board.earnedWedges.includes(w));
      const granted = missingBoardWedge ?? missingGlobalWedge ?? null;

      if (granted) {
        awardedWedge = granted;
        nextBoard = {
          ...board,
          earnedWedges: [...board.earnedWedges, granted],
        };
        const label = WEDGE_CATALOG_V4[granted].shortLabel;
        banner = `SHOW WHEEL: FREE CROWN WEDGE! You claimed the ${label} Crown Wedge!`;
      } else {
        // Player already holds all 6 wedges -> clean cashout bonus
        playerScoreDelta = WHEEL_WEDGE_MAXED_BONUS_V4;
        nextBoard = {
          ...board,
          playerScore: board.playerScore + playerScoreDelta,
        };
        banner = `SHOW WHEEL: CROWN MASTERY BONUS! All 6 wedges already owned — +${playerScoreDelta} pts!`;
      }
      break;
    }

    case 'STEAL_RIVAL_POINTS': {
      if (board.hasActiveRival && board.rivalScore > 0) {
        const stolen = Math.min(WHEEL_STEAL_RIVAL_POINTS_V4, board.rivalScore);
        playerScoreDelta = stolen;
        rivalScoreDelta = -stolen;
        nextBoard = {
          ...board,
          playerScore: board.playerScore + playerScoreDelta,
          rivalScore: board.rivalScore + rivalScoreDelta,
        };
        banner = `SHOW WHEEL: RIVAL HEIST! Swiped +${stolen} points straight from the Challenger!`;
      } else {
        playerScoreDelta = WHEEL_SOLO_POT_BONUS_V4;
        nextBoard = {
          ...board,
          playerScore: board.playerScore + playerScoreDelta,
        };
        banner = `SHOW WHEEL: STUDIO BONUS POT! +${playerScoreDelta} points added to your score!`;
      }
      break;
    }

    case 'RECHARGE_LIFELINES': {
      lifelinesAdded5050 = 1;
      lifelinesAddedHint = 1;
      nextBoard = {
        ...board,
        lifelines5050Left: board.lifelines5050Left + 1,
        lifelinesHintLeft: board.lifelinesHintLeft + 1,
      };
      banner = 'SHOW WHEEL: LIFELINE SURGE! +1 50/50 Split and +1 Studio Hint restored!';
      break;
    }

    case 'SHATTER_ALL_LOCKS': {
      const nextColumns = board.columns.map((c) => ({ ...c, frozenTurnsRemaining: 0 }));
      const nextTiles = board.tiles.map((t) => {
        if (t.status === 'PADLOCKED' || t.status === 'FOGGED' || t.status === 'FROZEN_BY_RIVAL') {
          unlockedTileIds.push(t.tileId);
          return {
            ...t,
            status: 'OPEN' as BoardTileStatus,
            twistRevealedToPlayer: t.twist === 'POWER_PLAY' ? t.twistRevealedToPlayer : true,
          };
        }
        return t;
      });
      nextBoard = {
        ...board,
        columns: nextColumns,
        tiles: nextTiles,
      };
      banner =
        unlockedTileIds.length > 0
          ? `SHOW WHEEL: VAULT BREAKER! Shattered ${unlockedTileIds.length} locks & fog clouds across the board!`
          : 'SHOW WHEEL: VAULT BREAKER! The entire board is wide open — take your pick!';
      break;
    }

    case 'HOT_SEAT_ALL_IN': {
      nextTileEffect = 'HOT_SEAT_ALL_IN';
      banner = 'SHOW WHEEL: HOT SEAT ALL-IN! Next tile is high-voltage: +2x base on hit, -1x base on miss!';
      break;
    }
  }

  return {
    board: nextBoard,
    outcome: sliceMeta.outcome,
    sliceMeta,
    nextTileEffect,
    playerScoreDelta,
    rivalScoreDelta,
    awardedWedge,
    unlockedTileIds,
    lifelinesAdded5050,
    lifelinesAddedHint,
    banner,
  };
}

// ============================================================================
// 7. LIFELINE CONSUMPTION HELPER
// ============================================================================

export function consumeBoardLifeline(
  board: StageBoardStateV4,
  kind: '5050' | 'HINT',
): { readonly board: StageBoardStateV4; readonly consumed: boolean } {
  if (kind === '5050') {
    if (board.lifelines5050Left <= 0) return { board, consumed: false };
    return {
      board: { ...board, lifelines5050Left: board.lifelines5050Left - 1 },
      consumed: true,
    };
  }
  if (board.lifelinesHintLeft <= 0) return { board, consumed: false };
  return {
    board: { ...board, lifelinesHintLeft: board.lifelinesHintLeft - 1 },
    consumed: true,
  };
}
