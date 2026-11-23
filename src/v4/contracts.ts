// ============================================================================
// WORLD'S SMARTEST v4.0 — Master Game-Show Architecture Contracts
// Single source of TypeScript truth across Content, Board, Challenger AI,
// Witty Host/Campaign, Broadcast Audio, Stage UI, and Salvaged Modes/Stats.
// ============================================================================

import type { DomainId, PrismQuestion } from '../forge/types';

/**
 * All 7 tactile, anti-repetition question formats in World's Smartest v4.0.
 */
export type QuestionFormatV4 =
  | 'MULTIPLE_CHOICE' // Big-font 4-plaque broadcast showdown
  | 'MATCH_4'         // 4 Left prompts <-> 4 Right answers (drag line OR 1-tap pair)
  | 'SORT_4'          // Put 4 cards in order (Earliest->Latest, Smallest->Largest, etc.)
  | 'MULTI_STRIKE'    // Pick all K true items OR eliminate the 1 imposter
  | 'PINPOINT_DIAL'   // Slider + step buttons for year/number with Target & Bullseye zones
  | 'CLUE_ESCALATOR'  // 3 progressive clues (3x -> 2x -> 1x payout) before 4 choices
  | 'VISUAL_SPOTTER'; // Illustrated visual diagram OR regional map pin-drop

export type BriefingFormatModeV4 = 'VARIETY_MIX' | 'CLASSIC_4_ONLY';
export type TimerPaceModeV4 = 'STANDARD' | 'RELAXED_UNTIMED';

/**
 * 6 Iconic Trivial-Pursuit-style Color Wedges mapping cleanly across all 12 Forge Domains.
 */
export type WedgeColorId =
  | 'GOLD_HISTORY'     // Domains 0 (History), 8 (World Affairs & Law)
  | 'SAPPHIRE_GEO'     // Domain 2 (Geography & Wonders)
  | 'EMERALD_SCIENCE'  // Domains 1 (Science & Space), 6 (Tech), 7 (Nature & Biology)
  | 'MAGENTA_POP'      // Domain 4 (Film, Music & Pop)
  | 'ORANGE_SPORTS'    // Domains 5 (Sports & Games), 11 (Logic & Math)
  | 'VIOLET_ARTS';     // Domains 3 (Arts & Arch), 9 (Food & Design), 10 (Myth & Lit)

export interface WedgeMetaV4 {
  readonly id: WedgeColorId;
  readonly shortLabel: string;
  readonly fullLabel: string;
  readonly accentHex: string;
  readonly surfaceHex: string;
  readonly domainIds: readonly DomainId[];
}

export const WEDGE_CATALOG_V4: Readonly<Record<WedgeColorId, WedgeMetaV4>> = {
  GOLD_HISTORY: {
    id: 'GOLD_HISTORY',
    shortLabel: 'History',
    fullLabel: 'History & World Affairs',
    accentHex: '#f5c451',
    surfaceHex: '#3a2b10',
    domainIds: [0, 8],
  },
  SAPPHIRE_GEO: {
    id: 'SAPPHIRE_GEO',
    shortLabel: 'Geography',
    fullLabel: 'Geography & Wonders',
    accentHex: '#46a8ff',
    surfaceHex: '#0f2947',
    domainIds: [2],
  },
  EMERALD_SCIENCE: {
    id: 'EMERALD_SCIENCE',
    shortLabel: 'Science',
    fullLabel: 'Science, Tech & Nature',
    accentHex: '#34d993',
    surfaceHex: '#0e3327',
    domainIds: [1, 6, 7],
  },
  MAGENTA_POP: {
    id: 'MAGENTA_POP',
    shortLabel: 'Entertainment',
    fullLabel: 'Film, Music & Pop Culture',
    accentHex: '#f26498',
    surfaceHex: '#3b1528',
    domainIds: [4],
  },
  ORANGE_SPORTS: {
    id: 'ORANGE_SPORTS',
    shortLabel: 'Sports & Logic',
    fullLabel: 'Sports, Games & Logic',
    accentHex: '#ff9347',
    surfaceHex: '#3d2010',
    domainIds: [5, 11],
  },
  VIOLET_ARTS: {
    id: 'VIOLET_ARTS',
    shortLabel: 'Arts & Culture',
    fullLabel: 'Arts, Literature & Culinary',
    accentHex: '#b47cff',
    surfaceHex: '#281845',
    domainIds: [3, 9, 10],
  },
};

export function domainToWedgeColor(domainId: DomainId): WedgeColorId {
  switch (domainId) {
    case 0:
    case 8:
      return 'GOLD_HISTORY';
    case 2:
      return 'SAPPHIRE_GEO';
    case 1:
    case 6:
    case 7:
      return 'EMERALD_SCIENCE';
    case 4:
      return 'MAGENTA_POP';
    case 5:
    case 11:
      return 'ORANGE_SPORTS';
    case 3:
    case 9:
    case 10:
    default:
      return 'VIOLET_ARTS';
  }
}

// ============================================================================
// 1. UNIFIED 7-FORMAT QUESTION PAYLOAD (`QuestionCardV4`)
// ============================================================================

export interface Match4PairItem {
  readonly pairId: string;
  readonly leftPrompt: string;
  readonly rightAnswer: string;
}

export interface Sort4CardItem {
  readonly itemId: string;
  readonly label: string;
  readonly numericValue: number;
  readonly formattedValue: string; // Shown on reveal, e.g. "1969" or "8,849 m"
}

export interface MultiStrikeOption {
  readonly optionId: string;
  readonly label: string;
  readonly isTarget: boolean; // True = player SHOULD tap this option
}

export interface PinpointDialSpec {
  readonly minVal: number;
  readonly maxVal: number;
  readonly step: number;
  readonly exactVal: number;
  readonly unitLabel: string;        // e.g. "" for years, "km", "%", "bones"
  readonly bullseyeRadius: number;   // +/- for 2x Bullseye
  readonly winRadius: number;        // +/- for 1x Standard Win
}

export interface ClueEscalatorSpec {
  readonly clues: readonly [string, string, string]; // Hard (3x), Medium (2x), Clear (1x)
  readonly choices: readonly [string, string, string, string];
  readonly correctIndex: 0 | 1 | 2 | 3;
}

export interface VisualSpotterSpec {
  readonly visualKind: 'SVG_DIAGRAM' | 'WORLD_REGION_MAP';
  readonly imageUrl?: string;
  readonly caption?: string;
  readonly targetLat?: number;
  readonly targetLon?: number;
  readonly choices: readonly [string, string, string, string];
  readonly correctIndex: 0 | 1 | 2 | 3;
}

export interface QuestionCardV4 {
  readonly qid: number;
  readonly format: QuestionFormatV4;
  readonly domainId: DomainId;
  readonly wedgeId: WedgeColorId;
  readonly categoryLabel: string;     // Clean topic label, e.g. "Space Exploration"
  readonly wittyHeader?: string;      // Playful TV board pun, e.g. "One Giant Leap"
  readonly subcategoryId?: string;
  readonly difficultyTier: 'MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'COLLEGE' | 'GRADUATE' | 'MENSA';
  readonly recommendedSec: number;    // 25-35s standard (12s ONLY for <=7-word LIGHTNING_BLITZ)
  readonly readInGraceSec: number;    // Default 2.0s untimed read-in before clock ticks
  readonly prompt: string;            // Crisp, human-grade headline clue (NEVER exam slop)
  readonly funFactWhy: string;        // Punchy 1-sentence cocktail-party reveal insight
  readonly helpfulHint: string;       // Genuine lateral hint (never robotic filler)

  // Format-specific specs (populated matching `format`):
  readonly choices?: readonly [string, string, string, string];
  readonly correctIndex?: 0 | 1 | 2 | 3;

  readonly match4?: {
    readonly instruction: string; // e.g. "Match each landmark to its home country"
    readonly pairs: readonly [Match4PairItem, Match4PairItem, Match4PairItem, Match4PairItem];
    readonly shuffledRight: readonly [
      { pairId: string; text: string },
      { pairId: string; text: string },
      { pairId: string; text: string },
      { pairId: string; text: string },
    ];
  };

  readonly sort4?: {
    readonly orderDirectionLabel: string; // e.g. "Earliest Year -> Latest Year"
    /** Canonical correct order from slot 0 (top) to slot 3 (bottom) */
    readonly correctOrder: readonly [Sort4CardItem, Sort4CardItem, Sort4CardItem, Sort4CardItem];
    /** Initial shuffled order presented to player */
    readonly initialOrder: readonly [Sort4CardItem, Sort4CardItem, Sort4CardItem, Sort4CardItem];
  };

  readonly multiStrike?: {
    readonly strikeMode: 'PICK_ALL_TRUE' | 'SPOT_THE_IMPOSTER';
    readonly targetCount: number; // e.g. 3 true out of 6, or 1 imposter out of 4
    readonly options: readonly MultiStrikeOption[];
  };

  readonly pinpoint?: PinpointDialSpec;
  readonly escalator?: ClueEscalatorSpec;
  readonly visualSpotter?: VisualSpotterSpec;

  /** Optional bridge back to legacy PrismQuestion for SRS / Analytics ledger compatibility */
  readonly legacySource?: PrismQuestion;
}

export interface AnswerSubmissionV4 {
  readonly format: QuestionFormatV4;
  readonly timedOut?: boolean;
  readonly elapsedSec: number;
  readonly used5050?: boolean;
  readonly usedHint?: boolean;
  readonly doubleDownArmed?: boolean;
  // Format-specific user input:
  readonly chosenIndex?: number;
  /** Map of left `pairId` -> chosen right `pairId` */
  readonly match4Links?: Readonly<Record<string, string>>;
  /** Ordered array of 4 `itemId`s from top to bottom */
  readonly sort4Ids?: readonly string[];
  /** Selected `optionId`s */
  readonly multiStrikeIds?: readonly string[];
  readonly pinpointValue?: number;
  /** 1 = solved on Clue 1 (3x), 2 = Clue 2 (2x), 3 = Clue 3 (1x) */
  readonly escalatorCluesRevealed?: 1 | 2 | 3;
}

export interface EvaluatedAnswerV4 {
  readonly isCorrect: boolean;
  /** 0..1 partial accuracy for Match-4 / Sort-4 / Pinpoint */
  readonly accuracyRatio: number;
  readonly isBullseyeOrSweep: boolean;
  readonly basePoints: number;
  readonly bonusPoints: number;
  readonly wagerDeltaPoints: number;
  /** Exact total delta applied to scoreboard (ALWAYS matches UI badge math 1:1) */
  readonly netPointsDelta: number;
  readonly correctSummaryLabel: string;
  readonly detailBreakdown: string;
}

// ============================================================================
// 2. LIVING JEOPARDY x TRIVIAL PURSUIT GIMMICK BOARD & CHALLENGER AI
// ============================================================================

export type BoardTopologyKind =
  | 'OPEN_CLASSIC'        // Tier 1: clean welcoming board
  | 'PADLOCK_NEIGHBORS'   // Solve adjacent tiles to shatter locks on 400/800 vaults
  | 'FOG_CROSSROADS'      // Center tiles open; solving illuminates outward through fog
  | 'SPOTLIGHT_ROULETTE'  // Periodic stage-forced turns + hidden warp tiles
  | 'CHALLENGER_GAUNTLET' // Rival actively freezes columns, plants bounties & forces picks
  | 'GRAND_FINALE_VAULT'; // Master 6-Wedge championship board combining all twists

export type BoardTileStatus =
  | 'OPEN'
  | 'PADLOCKED'
  | 'FOGGED'
  | 'FROZEN_BY_RIVAL'
  | 'CLEARED_WIN'
  | 'CLEARED_MISS'
  | 'CLAIMED_BY_RIVAL';

export type TileTwistKind =
  | 'NONE'
  | 'CROWN_WEDGE'         // Awards the column's Trivial Pursuit Color Wedge!
  | 'POWER_PLAY'          // Daily Double: wager points BEFORE seeing the clue
  | 'WHEEL_CURVEBALL'     // Spins the 6-slice Show Wheel (2x, Steal Wedge, Free 50/50, etc.)
  | 'SPOTLIGHT_SWEEP'     // Triggers a bonus forced spotlight jump
  | 'LIGHTNING_BLITZ'     // Short punchy rapid-fire clue
  | 'RIVAL_BOUNTY';       // Beat it to steal +300 from Rival; miss and Rival gains +200

export type WheelSliceOutcome =
  | 'DOUBLE_POT'
  | 'FREE_WEDGE_SHARD'
  | 'STEAL_RIVAL_POINTS'
  | 'RECHARGE_LIFELINES'
  | 'SHATTER_ALL_LOCKS'
  | 'HOT_SEAT_ALL_IN';

export interface BoardColumnV4 {
  readonly colIndex: number;
  readonly wedgeId: WedgeColorId;
  readonly domainId: DomainId;
  readonly subcategoryId?: string;
  readonly wittyTitle: string;    // e.g. "Famous Last Mistakes"
  readonly topicSubtitle: string; // e.g. "World History"
  readonly frozenTurnsRemaining: number;
  readonly pickedBy: 'PLAYER' | 'RIVAL' | 'SHOW';
}

export interface BoardTileV4 {
  readonly tileId: string;
  readonly colIndex: number;
  readonly rowIndex: number;
  readonly pointValue: 100 | 200 | 400 | 800;
  readonly wedgeId: WedgeColorId;
  readonly domainId: DomainId;
  readonly format: QuestionFormatV4;
  readonly status: BoardTileStatus;
  readonly twist: TileTwistKind;
  readonly twistRevealedToPlayer: boolean;
  readonly forcedByRival?: boolean;
}

export type ChallengerMoveKind =
  | 'FORCE_WEAK_TILE'        // Rival forces player to immediately answer a tile in player's weak domain!
  | 'FREEZE_FAVORITE_COLUMN' // Rival freezes player's comfort-zone column for 1 turn
  | 'PLANT_BOUNTY'           // Rival drops a high-stakes bounty on an open tile
  | 'CLAIM_TILE';            // Rival answers a tile on the board to build real score pressure

export interface ChallengerTurnActionV4 {
  readonly moveKind: ChallengerMoveKind;
  readonly targetTileId?: string;
  readonly targetColIndex?: number;
  readonly rivalPointsDelta: number;
  readonly rivalSucceeded: boolean;
  readonly banterLine: string;
}

export interface StageBoardStateV4 {
  readonly boardId: string;
  readonly topology: BoardTopologyKind;
  readonly columns: readonly BoardColumnV4[];
  readonly tiles: readonly BoardTileV4[]; // Row-major or indexed by col/row
  readonly turnNumber: number;
  readonly maxTurns: number;
  readonly turnsRemaining: number;
  readonly playerScore: number;
  readonly rivalScore: number;
  readonly soloTargetScore: number;
  readonly hasActiveRival: boolean;
  readonly earnedWedges: readonly WedgeColorId[];
  readonly rivalWedges: readonly WedgeColorId[];
  readonly lifelines5050Left: number;
  readonly lifelinesHintLeft: number;
  readonly forcedTileId: string | null;       // Non-null when Spotlight or Rival forces your pick!
  readonly forcedReasonBanner: string | null; // Explains WHY this tile was forced
  readonly completedLinesCount: number;
  readonly isBoardComplete: boolean;
}

// ============================================================================
// 3. 8-TIER WORLD SEARCH CAMPAIGN & WITTY SHOWRUNNER CONTRACTS
// ============================================================================

export type VenueStageThemeId =
  | 'TIER1_COMMUNITY_HALL'
  | 'TIER2_CIVIC_THEATER'
  | 'TIER3_REGIONAL_TV'
  | 'TIER4_NATIONAL_ARENA'
  | 'TIER5_LONDON_ROTUNDA'
  | 'TIER6_TOKYO_SKYDOME'
  | 'TIER7_CAIRO_PAVILION'
  | 'TIER8_GLOBAL_FINALE';

export interface ChallengerProfileV4 {
  readonly id: string;
  readonly name: string;
  readonly title: string;          // e.g. "Unbeaten Brooklyn Pub-Quiz Bartender"
  readonly hometown: string;
  readonly avatarPortraitUrl: string;
  readonly accentHex: string;
  readonly strongDomains: readonly DomainId[];
  readonly weakDomains: readonly DomainId[];
  readonly baseAccuracy: number;   // Scales gently from 0.42 (Tier 1/2) to 0.80 (Tier 8)
  readonly signatureGimmick: ChallengerMoveKind;
  readonly introLines: readonly [string, string];
  readonly onForceCategoryLines: readonly string[];
  readonly onFreezeColumnLines: readonly string[];
  readonly onPlayerBigPlayLines: readonly string[];
  readonly onPlayerMissLines: readonly string[];
  readonly winMatchLine: string;
  readonly loseMatchLine: string;
}

export interface WorldTourEpisodeV4 {
  readonly episodeId: string;      // e.g. "t1_ep1" .. "t8_ep4"
  readonly tierNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  readonly episodeInTier: 1 | 2 | 3 | 4;
  readonly title: string;
  readonly subtitle: string;
  readonly venueName: string;
  readonly themeId: VenueStageThemeId;
  readonly baseAudienceWatching: number; // 42 -> 1,400,000,000
  readonly prizePurseUsd: number;        // $250 -> $10,000,000
  readonly difficultyTier: 'MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'COLLEGE' | 'GRADUATE' | 'MENSA';
  readonly topology: BoardTopologyKind;
  readonly boardCols: 4 | 5 | 6;
  readonly boardRows: 3 | 4;
  readonly maxTurns: number;
  readonly allowedFormats: readonly QuestionFormatV4[];
  readonly hasCategoryDraft?: boolean;
  readonly challengerId: string | null; // null on Episode 1 local open tryout -> solo score target
  readonly soloTargetScore: number;
  readonly rulesHookSummary: string;    // 1 crisp plain-English sentence explaining the stage twist
}

export interface PlayerStatProfileForHost {
  readonly totalAnswered: number;
  readonly overallAccuracyPct: number;
  readonly bestStreak: number;
  readonly strongestDomainId: DomainId | null;
  readonly strongestDomainName: string | null;
  readonly strongestAccuracyPct: number;
  readonly weakestDomainId: DomainId | null;
  readonly weakestDomainName: string | null;
  readonly weakestAccuracyPct: number;
  readonly mostPlayedDomainId: DomainId | null;
  readonly mostPlayedDomainName: string | null;
}
