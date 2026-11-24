// ============================================================================
// WORLD'S SMARTEST v6.0 — Unified 100-Toy Stage Manager & Director
// Coordinates Pack A (Toys 001–050, Families I–V) + Pack B (Toys 051–100,
// Families VI–X) under a single zero-scroll stage mount interface, with:
//   - Smart Clue-Payload + Stage-World Affinity Toy Selection
//   - 20-Toy Rolling Anti-Repeat Ledger + Consecutive Family Cooldown
//   - Climax / Twist Toy Escalation & SWAP_CLUE_TOY Foil Card Support
//   - Clean Pack-A Plug-In Adapter (zero circular imports / zero compile coupling)
// ============================================================================

import type {
  CalibratedClueV6,
  FoilTrickCardV6,
  FoleySfxIdV6,
  StageAtmosphereThemeV6,
  StageWorldIdV6,
  ToyDefinitionV6,
  ToyFamilyIdV6,
  ToyResolutionV6,
} from '../contracts_v6';
import {
  getToySpecB,
  TOY_CATALOG_051_TO_100,
  TOY_SPECS_051_TO_100,
} from './ToyCatalog051To100';
import {
  mountToyStageRendererB,
  type ToyMountOptionsV6,
  type ToyStageHandleV6,
} from './ToyStageRendererB';

export {
  TOY_CATALOG_051_TO_100,
  TOY_SPECS_051_TO_100,
  mountToyStageRendererB,
  type ToyMountOptionsV6,
  type ToyStageHandleV6,
};

export type ToyPackMountFnV6 = (
  container: HTMLElement,
  toy: ToyDefinitionV6,
  clue: CalibratedClueV6,
  options: ToyMountOptionsV6,
) => ToyStageHandleV6;

export interface RegisteredToyPackV6 {
  readonly packId: string;
  readonly catalog: readonly ToyDefinitionV6[];
  readonly mount: ToyPackMountFnV6;
}

export interface ToySelectionCriteriaV6 {
  readonly clue: CalibratedClueV6;
  readonly stageWorldId?: StageWorldIdV6;
  readonly forceTwistToy?: boolean;
  readonly isClimaxTurn?: boolean;
  readonly excludeToyIds?: readonly string[];
  readonly seed?: number;
}

// Stage-World -> Preferred Toy Families for bespoke architectural & thematic cohesion
const STAGE_FAMILY_AFFINITY: Readonly<Record<StageWorldIdV6, readonly ToyFamilyIdV6[]>> = {
  STAGE_01_VAUDEVILLE_PALACE: ['WAGER_SCALE_CHRONOLOGY', 'DEFUSAL_ELIMINATION', 'RAPID_PADDLES_REFLEX', 'MIND_GAME_TWISTS'],
  STAGE_02_GENEVA_CONSERVATORY: ['DIALS_CRYPTEX_LOCKS', 'WAGER_SCALE_CHRONOLOGY', 'KINETIC_CONTRAPTIONS'],
  STAGE_03_MONTE_CARLO_SALON: ['CASINO_BLUFF_STAKES', 'WAGER_SCALE_CHRONOLOGY', 'MIND_GAME_TWISTS'],
  STAGE_04_CARTOGRAPHIC_ROTUNDA: ['ATLAS_RELIEF_SPATIAL', 'FORENSIC_DETECTIVE', 'WAGER_SCALE_CHRONOLOGY'],
  STAGE_05_ANALOG_BUNKER_1969: ['FORENSIC_DETECTIVE', 'DEFUSAL_ELIMINATION', 'MIND_GAME_TWISTS'],
  STAGE_06_KYOTO_LACQUER_PAVILION: ['MIND_GAME_TWISTS', 'PROGRESSIVE_AUDIO_REVEAL', 'WAGER_SCALE_CHRONOLOGY'],
  STAGE_07_CARNIVAL_CURIOSITIES: ['KINETIC_CONTRAPTIONS', 'RAPID_PADDLES_REFLEX', 'CASINO_BLUFF_STAKES'],
  STAGE_08_SUNKEN_BATHYSPHERE: ['KINETIC_CONTRAPTIONS', 'FORENSIC_DETECTIVE', 'ATLAS_RELIEF_SPATIAL'],
  STAGE_09_ASTRAL_OBSERVATORY: ['KINETIC_CONTRAPTIONS', 'DIALS_CRYPTEX_LOCKS', 'MIND_GAME_TWISTS'],
  STAGE_10_SOVEREIGN_COLOSSEUM: ['MIND_GAME_TWISTS', 'CASINO_BLUFF_STAKES', 'DEFUSAL_ELIMINATION'],
};

export class UnifiedToyManagerV6 {
  private readonly packs = new Map<string, RegisteredToyPackV6>();
  private readonly toyById = new Map<string, { def: ToyDefinitionV6; packId: string }>();
  private readonly toyByNumber = new Map<number, { def: ToyDefinitionV6; packId: string }>();
  private readonly recentToyIds: string[] = [];
  private lastFamily: ToyFamilyIdV6 | null = null;
  private readonly historyWindowSize = 20;

  constructor() {
    // Auto-register Pack B (Toys 051–100, Families VI–X) immediately out of the box
    this.registerToyPack({
      packId: 'pack_b_051_100',
      catalog: TOY_CATALOG_051_TO_100,
      mount: (container, toy, clue, options) =>
        mountToyStageRendererB(container, {
          ...options,
          clue,
          toyId: toy.toyId,
          toyNumber: toy.toyNumber,
        }),
    });
  }

  /**
   * Plugs in an additional Toy Pack (e.g. Pack A Toys 001–050 + 3D Relief Atlas).
   * Safe to call multiple times; replaces any existing registration with the same packId.
   */
  public registerToyPack(pack: RegisteredToyPackV6): void {
    this.packs.set(pack.packId, pack);
    for (const def of pack.catalog) {
      this.toyById.set(def.toyId, { def, packId: pack.packId });
      this.toyByNumber.set(def.toyNumber, { def, packId: pack.packId });
    }
  }

  /**
   * Convenience bridge tailored for Pack A's signature:
   * `mountToyStageA(container, toy, clue, options): ToyStageHandleV6`.
   */
  public registerPackA(
    catalogA: readonly ToyDefinitionV6[],
    mountToyStageA: ToyPackMountFnV6,
  ): void {
    this.registerToyPack({
      packId: 'pack_a_001_050',
      catalog: catalogA,
      mount: mountToyStageA,
    });
  }

  public getRegisteredCount(): number {
    return this.toyById.size;
  }

  public getAllToys(): ToyDefinitionV6[] {
    return Array.from(this.toyByNumber.values())
      .map((entry) => entry.def)
      .sort((a, b) => a.toyNumber - b.toyNumber);
  }

  public getToy(toyIdOrNumber: string | number): ToyDefinitionV6 | undefined {
    if (typeof toyIdOrNumber === 'number') {
      return this.toyByNumber.get(toyIdOrNumber)?.def;
    }
    return this.toyById.get(toyIdOrNumber)?.def;
  }

  public getRecentToyIds(): readonly string[] {
    return [...this.recentToyIds];
  }

  public hydrateRecentHistory(recentIds: readonly string[]): void {
    this.recentToyIds.length = 0;
    for (const id of recentIds.slice(-this.historyWindowSize)) {
      this.recentToyIds.push(id);
    }
    const lastId = this.recentToyIds[this.recentToyIds.length - 1];
    this.lastFamily = lastId ? (this.toyById.get(lastId)?.def.family ?? null) : null;
  }

  public recordToyPlayed(toyId: string): void {
    const def = this.toyById.get(toyId)?.def;
    if (def) this.lastFamily = def.family;
    this.recentToyIds.push(toyId);
    while (this.recentToyIds.length > this.historyWindowSize) {
      this.recentToyIds.shift();
    }
  }

  /**
   * Selects the single most exciting, payload-compatible, non-repeating Toy
   * for the active clue, stage world, and match drama level.
   */
  public selectToyForClue(criteria: ToySelectionCriteriaV6): ToyDefinitionV6 {
    const all = this.getAllToys();
    if (all.length === 0) {
      return TOY_SPECS_051_TO_100[0];
    }

    const { clue, stageWorldId, forceTwistToy, isClimaxTurn } = criteria;
    const excluded = new Set<string>([
      ...(criteria.excludeToyIds ?? []),
      ...this.recentToyIds,
    ]);

    // Climax Finale Special: Stage 10 Sovereign Colosseum climax -> Sovereign Triple-Lock (#100)!
    if (isClimaxTurn && stageWorldId === 'STAGE_10_SOVEREIGN_COLOSSEUM' && !excluded.has('toy_100_sovereign_triple_lock')) {
      const tripleLock = this.getToy('toy_100_sovereign_triple_lock');
      if (tripleLock) return tripleLock;
    }

    // 1. Honor bespoke clue recommendations when registered & not on cooldown
    if (!forceTwistToy && Array.isArray(clue.recommendedToyIds)) {
      for (const recId of clue.recommendedToyIds) {
        const match = this.getToy(recId);
        if (match && !excluded.has(match.toyId) && match.family !== this.lastFamily) {
          return match;
        }
      }
    }

    // 2. Score every candidate toy on payload synergy, stage affinity, twist mandate & freshness
    const preferredFamilies = stageWorldId ? STAGE_FAMILY_AFFINITY[stageWorldId] : [];
    const rngSeed = ((criteria.seed ?? (clue.qid * 2654435761)) ^ (this.recentToyIds.length * 97)) >>> 0;

    let bestToy: ToyDefinitionV6 = all[0];
    let bestScore = -1e9;

    for (let i = 0; i < all.length; i++) {
      const toy = all[i];
      if (criteria.excludeToyIds?.includes(toy.toyId)) continue;
      if (forceTwistToy && !toy.isTwistToy) continue;

      let score = 0;
      if (!excluded.has(toy.toyId)) score += 60;
      if (toy.family !== this.lastFamily) score += 28;
      if (preferredFamilies.includes(toy.family)) score += 22;

      // Payload synergy scoring
      if (clue.geoTarget && toy.family === 'ATLAS_RELIEF_SPATIAL') score += 45;
      if (clue.cryptexWord && toy.family === 'DIALS_CRYPTEX_LOCKS') score += 42;
      if (clue.corruptedLieWord && toy.toyId === 'toy_91_spot_hosts_lie') score += 55;
      if (clue.chronologyItems && (toy.toyId === 'toy_53_chronology_snap' || toy.toyId === 'toy_57_tower_stack')) score += 48;
      if (typeof clue.numericTarget === 'number' && toy.family === 'WAGER_SCALE_CHRONOLOGY') score += 38;
      if (clue.binaryPair && (toy.family === 'RAPID_PADDLES_REFLEX' || toy.toyId === 'toy_58_venn_sorter' || toy.toyId === 'toy_95_defibrillator_blitz' || toy.toyId === 'toy_98_bidding_war_rival')) {
        score += 40;
      }

      if (isClimaxTurn && toy.isTwistToy) score += 32;

      // Pack B spec stage-specific boost
      const specB = getToySpecB(toy.toyId);
      if (specB && stageWorldId && specB.preferredStages.includes(stageWorldId)) {
        score += 14;
      }

      // Deterministic jitter so variety stays lively across sessions
      const hash = (Math.imul((rngSeed ^ (toy.toyNumber * 40503)) >>> 0, 1664525) + 1013904223) >>> 0;
      score += (hash % 1000) / 100;

      if (score > bestScore) {
        bestScore = score;
        bestToy = toy;
      }
    }

    return bestToy;
  }

  /**
   * Handles the SWAP_CLUE_TOY / DEALER'S WILD SWITCH Foil Dirty-Trick Card cleanly.
   */
  public swapToyForActiveClue(
    currentToyId: string,
    criteria: ToySelectionCriteriaV6,
  ): ToyDefinitionV6 {
    return this.selectToyForClue({
      ...criteria,
      excludeToyIds: [...(criteria.excludeToyIds ?? []), currentToyId],
    });
  }

  /**
   * Mounts ANY Toy (001–100) cleanly inside `container` with strict zero-scroll framing.
   * Automatically routes to Pack A or Pack B based on registered packs, with graceful
   * Pack B fallback if a Pack A toy is requested before Pack A is mounted.
   */
  public mountToy(
    container: HTMLElement,
    options: ToyMountOptionsV6 & {
      readonly stageWorldId?: StageWorldIdV6;
      readonly forceTwistToy?: boolean;
      readonly isClimaxTurn?: boolean;
    },
  ): ToyStageHandleV6 {
    let targetEntry =
      (options.toyId ? this.toyById.get(options.toyId) : undefined)
      ?? (typeof options.toyNumber === 'number' ? this.toyByNumber.get(options.toyNumber) : undefined);

    if (!targetEntry) {
      const selected = this.selectToyForClue({
        clue: options.clue,
        stageWorldId: options.stageWorldId,
        forceTwistToy: options.forceTwistToy,
        isClimaxTurn: options.isClimaxTurn,
      });
      targetEntry = this.toyById.get(selected.toyId);
    }

    if (!targetEntry) {
      // Absolute last-resort safe fallback to Pack B Toy #51
      const fallback = TOY_SPECS_051_TO_100[0];
      this.recordToyPlayed(fallback.toyId);
      return mountToyStageRendererB(container, {
        ...options,
        toyId: fallback.toyId,
        toyNumber: fallback.toyNumber,
      });
    }

    const pack = this.packs.get(targetEntry.packId);
    this.recordToyPlayed(targetEntry.def.toyId);

    if (!pack) {
      return mountToyStageRendererB(container, {
        ...options,
        toyId: targetEntry.def.toyId,
        toyNumber: targetEntry.def.toyNumber,
      });
    }

    return pack.mount(container, targetEntry.def, options.clue, options);
  }
}

export const unifiedToyManagerV6 = new UnifiedToyManagerV6();
