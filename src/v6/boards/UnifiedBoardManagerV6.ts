// ============================================================================
// WORLD'S SMARTEST v6.0 — Unified 100-Board Registry & Live Twist Orchestrator
// Seamlessly unifies Boards 001–050 (injected or dynamically hydrated from
// BoardCatalog001To050 / BoardContraptionRendererA without static coupling)
// with Boards 051–100 (BoardCatalog051To100 + BoardContraptionRendererB) and
// BoardTwistDirectorV6 (all 16 live mid-match twist mutations + 9 Foil cards).
// ============================================================================

import type * as THREE from 'three';
import type {
  BoardDefinitionV6,
  BoardFamilyIdV6,
  BoardNodeV6,
  BoardRuntimeStateV6,
  BoardTwistMutationIdV6,
  FoilTrickCardV6,
  StageAtmosphereThemeV6,
  StageWorldIdV6,
} from '../contracts_v6';
import {
  BOARD_CATALOG_051_TO_100,
  DOMAIN_LABELS_V6,
  buildBoardRuntimeStateB,
  getBoardBlueprintB,
} from './BoardCatalog051To100';
import {
  BoardContraptionRendererB,
  type BoardHitResultV6,
  type BoardRendererContractV6,
} from './BoardContraptionRendererB';
import {
  BoardTwistDirectorV6,
  TWIST_MUTATION_SPECS_V6,
  type BlindAuctionResultV6,
  type ClaimTwistResolutionV6,
  type FoilCardOutcomeV6,
  type SplitOrStealResultV6,
  type TwistDirectorSnapshotV6,
  type TwistEventV6,
} from './BoardTwistDirectorV6';

// ----------------------------------------------------------------------------
// 1. Dependency-Injection Contracts for Conflict-Free 001–050 Integration
// ----------------------------------------------------------------------------

export type BoardStateFactoryV6 = (
  definition: BoardDefinitionV6,
  options?: {
    seed?: number;
    rivalName?: string;
    overrideTwist?: BoardTwistMutationIdV6;
    maxTurns?: number;
    stageDifficultyOffset?: number;
  },
) => BoardRuntimeStateV6;

export interface CatalogARegistrationOptionsV6 {
  readonly stateFactoryA?: BoardStateFactoryV6;
  readonly rendererA?: BoardRendererContractV6;
}

export interface StartBoardMatchOptionsV6 {
  readonly boardIdOrNumber: string | number;
  readonly seed?: number;
  readonly rivalName?: string;
  readonly overrideTwist?: BoardTwistMutationIdV6;
  readonly maxTurns?: number;
  readonly stageDifficultyOffset?: number;
  readonly parent3D?: THREE.Object3D;
  readonly stageTheme?: StageAtmosphereThemeV6;
}

export interface BoardCatalogCoverageStatsV6 {
  readonly totalRegistered: number;
  readonly catalogACount: number;
  readonly catalogBCount: number;
  readonly familiesRepresented: BoardFamilyIdV6[];
  readonly stagesRepresented: StageWorldIdV6[];
  readonly defaultTwistsRepresented: BoardTwistMutationIdV6[];
}

export interface EndTurnOptionsV6 {
  readonly runRivalScrew?: boolean;
  readonly rivalAggression?: number;
}

// ----------------------------------------------------------------------------
// 2. Fallback Runtime Builder for Externally Registered Boards 001–050
//    (Used only if caller registers BoardDefinitionV6s without stateFactoryA)
// ----------------------------------------------------------------------------

function buildFallbackRuntimeStateForCatalogA(
  definition: BoardDefinitionV6,
  options: {
    seed?: number;
    rivalName?: string;
    overrideTwist?: BoardTwistMutationIdV6;
    maxTurns?: number;
    stageDifficultyOffset?: number;
  } = {},
): BoardRuntimeStateV6 {
  const n = Math.max(8, definition.nodeCount);
  const nodes: BoardNodeV6[] = [];
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const diffOffset = options.stageDifficultyOffset ?? 0;

  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const angle = (i / n) * Math.PI * 2;
    const isCircular =
      definition.mechanicArchetype === 'CONCENTRIC_RINGS' ||
      definition.mechanicArchetype === 'FERRIS_WHEEL' ||
      definition.mechanicArchetype === 'SONAR_RADAR_SWEEP';
    const radius = i === 0 ? 0 : i <= Math.floor(n / 2) ? 1.55 : 2.7;
    const pos3d: [number, number, number] = isCircular
      ? [Math.cos(angle) * radius, i === 0 ? 0.45 : 0.1, Math.sin(angle) * radius]
      : [(c - (cols - 1) / 2) * 1.35, 0.15, (r - (rows - 1) / 2) * 1.3];

    const domainId = (definition.boardNumber + i * 3) % 12;
    nodes.push({
      nodeId: `${definition.boardId}_n${String(i).padStart(2, '0')}`,
      index: i,
      categoryLabel: DOMAIN_LABELS_V6[domainId] ?? 'GENERAL KNOWLEDGE',
      domainId,
      baseChips: i === 0 ? 350 : 150 + (i % 4) * 55,
      multBonus: i === 0 ? 0.75 : 0.25,
      difficultyOffset: Number((0.25 * (i % 3) + diffOffset).toFixed(2)),
      owner: 'NONE',
      lockedChains: i === 0 ? 1 : 0,
      ringIndex: isCircular ? (i === 0 ? 0 : i <= Math.floor(n / 2) ? 1 : 2) : r,
      tierIndex: rows - 1 - r,
      neighbors: [],
      pos3d,
    });
  }

  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    nodes[i].neighbors.push(nodes[next].nodeId);
    nodes[next].neighbors.push(nodes[i].nodeId);
    if (i > 0 && i <= Math.min(4, n - 1)) {
      nodes[0].neighbors.push(nodes[i].nodeId);
      nodes[i].neighbors.push(nodes[0].nodeId);
    }
  }

  return {
    definition,
    activeTwist: options.overrideTwist ?? definition.defaultTwist,
    nodes,
    turnNumber: 1,
    maxTurns: options.maxTurns ?? 10,
    ringRotationsDeg: [0, 0, 0],
    alignedNodeIds: nodes.slice(0, 3).map((nd) => nd.nodeId),
    playerScoreChips: 0,
    playerMult: 1.0,
    playerTotalCash: 500,
    rivalTotalCash: 500,
    rivalName: options.rivalName ?? 'Frankie DeLuca',
    streakCount: 0,
  };
}

// ----------------------------------------------------------------------------
// 3. UnifiedBoardManagerV6 — 100-Board Registry, Renderer Router & Twist Engine
// ----------------------------------------------------------------------------

export class UnifiedBoardManagerV6 {
  private readonly boardsById = new Map<string, BoardDefinitionV6>();
  private readonly boardsByNumber = new Map<number, BoardDefinitionV6>();
  private catalogACount = 0;
  private catalogBCount = 0;

  private stateFactoryA: BoardStateFactoryV6 | null = null;
  private rendererA: BoardRendererContractV6 | null = null;
  private readonly rendererB: BoardContraptionRendererB;
  private activeRenderer: BoardRendererContractV6 | null = null;

  public readonly twistDirector: BoardTwistDirectorV6;
  private activeState: BoardRuntimeStateV6 | null = null;

  constructor(options?: {
    catalogABoards?: readonly BoardDefinitionV6[];
    stateFactoryA?: BoardStateFactoryV6;
    rendererA?: BoardRendererContractV6;
  }) {
    this.rendererB = new BoardContraptionRendererB();
    this.twistDirector = new BoardTwistDirectorV6();

    // Always register Boards 051–100 natively
    for (const def of BOARD_CATALOG_051_TO_100) {
      this.boardsById.set(def.boardId, def);
      this.boardsByNumber.set(def.boardNumber, def);
    }
    this.catalogBCount = BOARD_CATALOG_051_TO_100.length;

    if (options?.catalogABoards) {
      this.registerCatalogA(options.catalogABoards, {
        stateFactoryA: options.stateFactoryA,
        rendererA: options.rendererA,
      });
    } else {
      if (options?.stateFactoryA) this.stateFactoryA = options.stateFactoryA;
      if (options?.rendererA) this.rendererA = options.rendererA;
    }
  }

  // --------------------------------------------------------------------------
  // Conflict-Free Registration & Optional Dynamic Hydration of Boards 001–050
  // --------------------------------------------------------------------------

  public registerCatalogA(
    boards001To050: readonly BoardDefinitionV6[],
    options?: CatalogARegistrationOptionsV6,
  ): number {
    let added = 0;
    for (const def of boards001To050) {
      if (def.boardNumber >= 1 && def.boardNumber <= 50) {
        this.boardsById.set(def.boardId, def);
        this.boardsByNumber.set(def.boardNumber, def);
        added += 1;
      }
    }
    this.catalogACount = added;
    if (options?.stateFactoryA) {
      this.stateFactoryA = options.stateFactoryA;
    }
    if (options?.rendererA) {
      this.rendererA = options.rendererA;
    }
    return added;
  }

  /**
   * Optional dynamic hydration helper for Boards 001–050 once `BoardCatalog001To050.ts`
   * is merged onto the branch. Uses a runtime variable specifier so standalone builds
   * on `feat/v6-boards-twists-b` compile with zero missing-module errors.
   */
  public async hydrateCatalogAFromModule(
    customModuleLoader?: () => Promise<Record<string, unknown>>,
  ): Promise<number> {
    try {
      const mod: Record<string, unknown> = customModuleLoader
        ? await customModuleLoader()
        : await (async () => {
            const dynamicPath = './BoardCatalog001To050';
            return (await import(/* @vite-ignore */ dynamicPath)) as Record<string, unknown>;
          })();

      const candidate =
        mod.BOARD_CATALOG_001_TO_050 ??
        mod.BOARDS_001_TO_050 ??
        mod.BOARD_DEFINITIONS_001_TO_050 ??
        mod.default;

      if (Array.isArray(candidate)) {
        const validDefs = candidate.filter(
          (item): item is BoardDefinitionV6 =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as BoardDefinitionV6).boardId === 'string' &&
            typeof (item as BoardDefinitionV6).boardNumber === 'number',
        );
        const factory =
          typeof mod.buildBoardRuntimeStateA === 'function'
            ? (mod.buildBoardRuntimeStateA as BoardStateFactoryV6)
            : undefined;
        return this.registerCatalogA(validDefs, { stateFactoryA: factory });
      }
      return 0;
    } catch {
      return 0;
    }
  }

  // --------------------------------------------------------------------------
  // 100-Board Catalog Queries & Campaign Episode Selector
  // --------------------------------------------------------------------------

  public getAllBoards(): BoardDefinitionV6[] {
    return Array.from(this.boardsByNumber.values()).sort(
      (a, b) => a.boardNumber - b.boardNumber,
    );
  }

  public getBoardById(boardId: string): BoardDefinitionV6 | undefined {
    return this.boardsById.get(boardId);
  }

  public getBoardByNumber(boardNumber: number): BoardDefinitionV6 | undefined {
    return this.boardsByNumber.get(boardNumber);
  }

  public getBoardsByFamily(family: BoardFamilyIdV6): BoardDefinitionV6[] {
    return this.getAllBoards().filter((b) => b.family === family);
  }

  public getBoardsByStage(stageId: StageWorldIdV6): BoardDefinitionV6[] {
    return this.getAllBoards().filter((b) => b.signatureStage === stageId);
  }

  public getBoardsByTwist(twistId: BoardTwistMutationIdV6): BoardDefinitionV6[] {
    return this.getAllBoards().filter((b) => b.defaultTwist === twistId);
  }

  public pickBoardForEpisode(
    episodeNumber: number,
    stageId: StageWorldIdV6,
    variantIndex = 0,
  ): BoardDefinitionV6 {
    // Episode 20 Grand Finale always showcases Board 100: Sovereign Mind Reactor!
    if (episodeNumber >= 20) {
      const board100 = this.getBoardByNumber(100);
      if (board100) return board100;
    }

    const stageBoards = this.getBoardsByStage(stageId);
    if (stageBoards.length > 0) {
      const idx = Math.abs(episodeNumber * 3 + variantIndex) % stageBoards.length;
      return stageBoards[idx];
    }

    const all = this.getAllBoards();
    return all[Math.abs(episodeNumber + variantIndex) % all.length];
  }

  public getCatalogCoverageStats(): BoardCatalogCoverageStatsV6 {
    const all = this.getAllBoards();
    const families = new Set<BoardFamilyIdV6>();
    const stages = new Set<StageWorldIdV6>();
    const twists = new Set<BoardTwistMutationIdV6>();
    for (const def of all) {
      families.add(def.family);
      stages.add(def.signatureStage);
      twists.add(def.defaultTwist);
    }
    return {
      totalRegistered: all.length,
      catalogACount: this.catalogACount,
      catalogBCount: this.catalogBCount,
      familiesRepresented: Array.from(families),
      stagesRepresented: Array.from(stages),
      defaultTwistsRepresented: Array.from(twists),
    };
  }

  public getTwistSpec(twistId: BoardTwistMutationIdV6) {
    return TWIST_MUTATION_SPECS_V6[twistId];
  }

  // --------------------------------------------------------------------------
  // Live Match Orchestration (Runtime + Twist Director + 3D WebGL2 PBR Mount)
  // --------------------------------------------------------------------------

  public startBoardMatch(options: StartBoardMatchOptionsV6): {
    state: BoardRuntimeStateV6;
    twistSnapshot: TwistDirectorSnapshotV6;
    mountedGroup: THREE.Group | null;
  } {
    const definition =
      typeof options.boardIdOrNumber === 'number'
        ? this.getBoardByNumber(options.boardIdOrNumber)
        : this.getBoardById(options.boardIdOrNumber);

    if (!definition) {
      throw new Error(
        `[UnifiedBoardManagerV6] Board not registered: ${String(options.boardIdOrNumber)}`,
      );
    }

    // Build runtime state via Catalog B or Catalog A factory
    const isCatalogB = definition.boardNumber >= 51 || getBoardBlueprintB(definition.boardId) !== undefined;
    const state = isCatalogB
      ? buildBoardRuntimeStateB(definition, {
          seed: options.seed,
          rivalName: options.rivalName,
          overrideTwist: options.overrideTwist,
          maxTurns: options.maxTurns,
          stageDifficultyOffset: options.stageDifficultyOffset,
        })
      : this.stateFactoryA
        ? this.stateFactoryA(definition, options)
        : buildFallbackRuntimeStateForCatalogA(definition, options);

    this.activeState = state;
    const twistSnapshot = this.twistDirector.initializeForBoard(state, options.seed);

    let mountedGroup: THREE.Group | null = null;
    if (options.parent3D) {
      this.disposeActiveRenderer();
      const useRendererA =
        this.rendererA !== null &&
        this.rendererA.supportedFamilies.includes(definition.family);
      this.activeRenderer = useRendererA ? this.rendererA : this.rendererB;
      mountedGroup = this.activeRenderer!.mountBoard(
        options.parent3D,
        state,
        twistSnapshot,
        options.stageTheme,
      );
    }

    return { state, twistSnapshot, mountedGroup };
  }

  public getActiveState(): BoardRuntimeStateV6 | null {
    return this.activeState;
  }

  public getTwistSnapshot(): TwistDirectorSnapshotV6 | null {
    if (!this.activeState) return null;
    return this.twistDirector.getSnapshot(this.activeState);
  }

  public canPlayNode(nodeId: string): { playable: boolean; reason?: string } {
    if (!this.activeState) return { playable: false, reason: 'No active board match.' };
    return this.twistDirector.isNodePlayable(this.activeState, nodeId);
  }

  public isNodeVisible(nodeId: string): boolean {
    if (!this.activeState) return false;
    return this.twistDirector.isNodeVisible(this.activeState, nodeId);
  }

  public moveSpotlight(x: number, z: number): string[] {
    if (!this.activeState) return [];
    const lit = this.twistDirector.setSpotlightTarget(this.activeState, x, z);
    this.syncRendererNow();
    return lit;
  }

  public handleNodeClaim(
    nodeId: string,
    correct: boolean,
    answerAccuracy = 1.0,
  ): ClaimTwistResolutionV6 {
    if (!this.activeState) {
      throw new Error('[UnifiedBoardManagerV6] Cannot claim node without active match.');
    }
    const result = this.twistDirector.resolvePlayerClaim(
      this.activeState,
      nodeId,
      correct,
      answerAccuracy,
    );
    this.syncRendererNow();
    return result;
  }

  public handleBlindAuctionBid(nodeId: string, playerBidCash: number): BlindAuctionResultV6 {
    if (!this.activeState) {
      throw new Error('[UnifiedBoardManagerV6] Cannot resolve auction without active match.');
    }
    const result = this.twistDirector.resolveBlindAuctionBid(
      this.activeState,
      nodeId,
      playerBidCash,
    );
    this.syncRendererNow();
    return result;
  }

  public handleSplitOrSteal(playerChoice: 'SPLIT' | 'STEAL'): SplitOrStealResultV6 {
    if (!this.activeState) {
      throw new Error('[UnifiedBoardManagerV6] Cannot resolve Split-or-Steal without active match.');
    }
    const result = this.twistDirector.resolveSplitOrStealDecision(
      this.activeState,
      playerChoice,
    );
    this.syncRendererNow();
    return result;
  }

  public playFoilTrickCard(
    card: FoilTrickCardV6,
    targetNodeId?: string,
  ): FoilCardOutcomeV6 {
    if (!this.activeState) {
      throw new Error('[UnifiedBoardManagerV6] Cannot play Foil card without active match.');
    }
    const outcome = this.twistDirector.applyFoilTrickCard(
      this.activeState,
      card,
      targetNodeId,
    );
    this.syncRendererNow();
    return outcome;
  }

  public endTurn(options: EndTurnOptionsV6 = {}): TwistEventV6[] {
    if (!this.activeState) return [];
    const events = this.twistDirector.advanceTurnAndApplyBoardPhysics(this.activeState);
    if (options.runRivalScrew) {
      events.push(
        this.twistDirector.executeRivalScrewCounterplay(
          this.activeState,
          options.rivalAggression ?? 0.65,
        ),
      );
    }
    this.syncRendererNow();
    return events;
  }

  public updateFrame(dtSeconds: number, elapsedSeconds: number): void {
    this.activeRenderer?.update(dtSeconds, elapsedSeconds);
  }

  public pickAtNdc(
    ndcX: number,
    ndcY: number,
    camera: THREE.Camera,
  ): BoardHitResultV6 {
    if (!this.activeRenderer) {
      return { nodeId: null, boardPlanePoint: null };
    }
    return this.activeRenderer.pickNodeAtNdc(ndcX, ndcY, camera);
  }

  public setHoveredNode(nodeId: string | null): void {
    this.activeRenderer?.setHoveredNode(nodeId);
  }

  public syncRendererNow(): void {
    if (!this.activeState || !this.activeRenderer) return;
    this.activeRenderer.syncState(
      this.activeState,
      this.twistDirector.getSnapshot(this.activeState),
    );
  }

  public dispose(): void {
    this.disposeActiveRenderer();
    this.activeState = null;
  }

  private disposeActiveRenderer(): void {
    if (this.activeRenderer) {
      this.activeRenderer.dispose();
      this.activeRenderer = null;
    }
  }
}
