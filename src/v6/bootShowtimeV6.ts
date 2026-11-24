// ============================================================================
// WORLD'S SMARTEST v6.0 — Generational Ultra-HD 3D Master Runtime Bootstrapper
// Wires all 12 brand-new v6.0 subsystems into ShowtimeMasterDirectorV6:
//  - StageWebGL2Engine (10 Distinct 3D Architectural Stage Worlds, 3x DPR PBR)
//  - UnifiedBoardManagerV6 (All 100 3D Playing Boards + 16 Live Stage Twists)
//  - UnifiedToyManagerV6 (All 100 Zero-Scroll Question Toys + 4K 3D Relief Globe)
//  - StageTrapdoorGambitV6 (10 Frantic 8s 3D Pit Survival Mini-Games)
//  - PropTrunkRelicEngineV6 (24 3D Relics w/ L->R Balatro Math + 18 Holo Foils)
//  - QuestionEngineV6 & SeenQuestionBitsetLedger (1.28M Clues, 1.0->10.0, 0 Repeats)
//  - ReactiveShowrunnerV6 & StageCastPortraitsV6 ("Clause 14-B" Dramedy + PVM Cameos)
//  - StudioAudioEngineV6 (14 Original Abbey-Road Symphonies + 33 Horology Foley Cues)
//  - GrandLobbyHubV6, TrophyMedalVault3DV6 (36 3D Honors), BroadcastOptionsConsoleV6
//    (4-Bay Rupert-Neve Desk), & PostMatchCeremonyV6
// ============================================================================

import type {
  BoardTwistMutationIdV6,
  BroadcastOptionsStateV6,
  FoilTrickCardV6,
  ReactiveDialogueBeatV6,
  StageAtmosphereThemeV6,
  StageWorldIdV6,
} from './contracts_v6';
import { getSharedStudioAudioEngineV6 } from './audio/StudioAudioEngineV6';
import {
  BOARD_CATALOG_001_TO_050,
  buildBoardRuntimeStateA,
  getBoardContraptionSpecA,
} from './boards/BoardCatalog001To050';
import { getBoardBlueprintB } from './boards/BoardCatalog051To100';
import { BoardContraptionRendererA } from './boards/BoardContraptionRendererA';
import { TWIST_MUTATION_SPECS_V6 } from './boards/BoardTwistDirectorV6';
import { UnifiedBoardManagerV6 } from './boards/UnifiedBoardManagerV6';
import {
  CareerSaveStoreV6,
  getEpisodeBlueprintV6,
} from './core/CareerSaveStoreV6';
import {
  ShowtimeMasterDirectorV6,
  toggleDocumentFullscreenV6,
  type DisposableHandleV6,
} from './core/ShowtimeMasterDirectorV6';
import { sharedQuestionEngineV6 } from './corpus/QuestionEngineV6';
import { sharedSeenLedgerV6 } from './corpus/SeenQuestionBitsetLedger';
import { getStageThemeV6 } from './engine/StageThemesCatalogV6';
import { StageWebGL2Engine } from './engine/StageWebGL2Engine';
import {
  FOIL_CARDS_BY_ID,
  FOIL_TRICK_CATALOG_V6,
  RELIC_SPECS_BY_ID,
  evaluateRelicScoringCascadeV6,
  mountPropTrunkViewV6,
  type PropTrunkStateV6,
} from './fun/PropTrunkRelicEngineV6';
import {
  TRAPDOOR_PIT_CATALOG_V6,
  mountStageTrapdoorGambitV6,
  type TrapdoorPitIdV6,
} from './fun/StageTrapdoorGambitV6';
import { ReactiveShowrunnerV6 } from './story/ReactiveShowrunnerV6';
import {
  getChampionPortraitKeyForStage,
  mountCastMonitorBadge,
} from './story/StageCastPortraitsV6';
import { TOY_CATALOG_001_TO_050 } from './toys/ToyCatalog001To050';
import { mountToyStageA } from './toys/ToyStageRendererA';
import { UnifiedToyManagerV6 } from './toys/UnifiedToyManagerV6';
import {
  BroadcastOptionsConsoleV6,
  applyBroadcastOptionsToDomV6,
  saveBroadcastOptionsV6,
} from './ui/BroadcastOptionsConsoleV6';
import { GrandLobbyHubV6 } from './ui/GrandLobbyHubV6';
import { PostMatchCeremonyV6 } from './ui/PostMatchCeremonyV6';
import {
  HONOR_AWARDS_CATALOG_V6,
  TrophyMedalVault3DV6,
} from './ui/TrophyMedalVault3DV6';

const INTEGRATION_STYLE_ID = 'ws-v6-master-integration-css';

const INTEGRATION_CSS = `
/* Seamless Phase Coordination Between ShowtimeMasterDirectorV6 & Fullscreen V6 Screens */
#ui-root.v6-director-root[data-v6-phase="LOBBY_HUB"] > .v6-top-stage-bar,
#ui-root.v6-director-root[data-v6-phase="TROPHY_VAULT"] > .v6-top-stage-bar,
#ui-root.v6-director-root[data-v6-phase="OPTIONS_CONSOLE"] > .v6-top-stage-bar,
#ui-root.v6-director-root[data-v6-phase="EPISODE_CEREMONY"] > .v6-top-stage-bar {
  display: none !important;
}

#ui-root.v6-director-root > .v6-top-stage-bar,
#ui-root.v6-director-root .v6-fallback-panel,
#ui-root.v6-director-root .v6tr-root {
  pointer-events: auto;
}

#ui-root.v6-director-root > .v6-viewport-host {
  pointer-events: none;
}

#ui-root.v6-director-root[data-v6-phase="TOY_ENCOUNTER"] > .v6-viewport-host,
#ui-root.v6-director-root[data-v6-phase="TRAPDOOR_GAMBIT"] > .v6-viewport-host,
#ui-root.v6-director-root[data-v6-phase="BACKSTAGE_TRUNK"] > .v6-viewport-host,
#ui-root.v6-director-root[data-v6-phase="TWIST_MUTATION"] > .v6-viewport-host,
#ui-root.v6-director-root[data-v6-phase="STAGE_CURTAIN_INTRO"] > .v6-viewport-host {
  pointer-events: auto;
}

/* Zero-Scroll 3D Board HUD Frame (Transparent 3D Center + Top Rule/Rival Strip + Bottom Thumb Dock) */
.v6-board-hud-shell {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px 10px max(8px, env(safe-area-inset-bottom, 6px));
  pointer-events: none;
}

.v6-board-top-deck {
  pointer-events: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 7px 11px;
  border-radius: 12px;
  background: var(--v6-stage-surface, rgba(16, 12, 16, 0.9));
  border: 1.5px solid var(--v6-stage-border, #d8a547);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.62);
}

.v6-board-identity {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.v6-board-kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--v6-stage-accent, #f5cd75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v6-board-title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.v6-board-title {
  margin: 0;
  font-family: var(--v6-font-display, 'Cinzel', Georgia, serif);
  font-size: clamp(13px, 2.1dvh, 18px);
  font-weight: 800;
  color: #fff8eb;
  letter-spacing: 0.03em;
}

.v6-board-rule-pill {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--v6-stage-badge-bg, #3d0f1a);
  color: var(--v6-stage-badge-text, #fff5de);
  border: 1px solid rgba(255, 232, 180, 0.32);
}

.v6-board-duel-strip {
  display: flex;
  align-items: center;
  gap: 8px;
}

.v6-board-score-chip {
  font-family: var(--v6-font-mono, monospace);
  font-size: 11.5px;
  font-weight: 800;
  padding: 4px 9px;
  border-radius: 8px;
  background: rgba(8, 10, 14, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #f8f4ea;
  white-space: nowrap;
}

.v6-board-score-chip.is-you {
  border-color: var(--v6-signal-good, #35d495);
  color: #b7ffdf;
}

.v6-board-score-chip.is-rival {
  border-color: var(--v6-signal-danger, #e84c5c);
  color: #ffd0d6;
}

.v6-board-rival-cameo {
  display: flex;
  align-items: center;
  gap: 6px;
}

.v6-board-stage-window {
  flex: 1 1 0;
  min-height: 0;
  position: relative;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
}

.v6-board-hover-readout {
  pointer-events: none;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(10, 9, 13, 0.88);
  border: 1px solid var(--v6-stage-border, #d8a547);
  font-size: 11px;
  font-weight: 700;
  color: #fff6e3;
  letter-spacing: 0.03em;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.58);
}

.v6-board-bottom-dock {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 12px;
  background: var(--v6-stage-surface-deep, rgba(10, 8, 12, 0.94));
  border: 1.5px solid var(--v6-stage-border, #d8a547);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.72);
}

.v6-board-node-scroller {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.v6-board-node-btn {
  appearance: none;
  border: 1px solid rgba(243, 202, 114, 0.44);
  border-radius: 9px;
  background: linear-gradient(180deg, rgba(36, 30, 38, 0.95) 0%, rgba(16, 13, 19, 0.98) 100%);
  color: #fff7e8;
  padding: 5px 6px;
  cursor: pointer;
  text-align: left;
  transition: transform 120ms ease, border-color 120ms ease;
  min-width: 0;
}

.v6-board-node-btn:hover,
.v6-board-node-btn.is-aligned {
  border-color: var(--v6-signal-good, #35d495);
  transform: translateY(-1px);
}

.v6-board-node-cat {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v6-board-node-val {
  display: block;
  font-family: var(--v6-font-mono, monospace);
  font-size: 9.5px;
  font-weight: 700;
  color: var(--v6-stage-accent, #f3ca72);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v6-board-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.v6-board-tactical-btn {
  appearance: none;
  border: 1.5px solid var(--v6-stage-border, #d8a547);
  border-radius: 9px;
  padding: 6px 10px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  color: #161006;
  background: var(--v6-grad-brass-rim, linear-gradient(180deg, #f5cd75, #b8842b));
  white-space: nowrap;
}

.v6-board-tactical-btn.is-secondary {
  background: rgba(28, 23, 31, 0.95);
  color: #fff3d8;
}

.v6-board-tactical-btn.is-foil {
  background: linear-gradient(135deg, #3b1736 0%, #1d2f47 52%, #4a2d14 100%);
  border-color: #9be8ff;
  color: #f4fbff;
}

@media (max-height: 430px) and (orientation: landscape) {
  .v6-board-hud-shell {
    padding: 4px 8px;
  }
  .v6-board-top-deck {
    padding: 4px 8px;
  }
  .v6-board-bottom-dock {
    flex-direction: row;
    align-items: center;
    padding: 4px 8px;
  }
  .v6-board-node-scroller {
    flex: 1 1 0;
  }
}

.v6-trunk-stage-wrap {
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  padding: 6px 10px max(8px, env(safe-area-inset-bottom, 6px));
  display: flex;
  flex-direction: column;
}
`;

function injectMasterIntegrationStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(INTEGRATION_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = INTEGRATION_STYLE_ID;
  style.textContent = INTEGRATION_CSS;
  document.head.appendChild(style);
}

export interface RunningShowtimeV6Handle {
  director: ShowtimeMasterDirectorV6;
  stageEngine: StageWebGL2Engine;
  dispose(): void;
}

export function bootShowtimeV6(
  canvasRoot: HTMLElement,
  vfxCanvas: HTMLCanvasElement | null,
  uiRoot: HTMLElement,
): RunningShowtimeV6Handle {
  injectMasterIntegrationStyles();

  // Hide legacy v5 2D VFX overlay canvas cleanly so WebGL2 PBR shines unobstructed
  if (vfxCanvas) {
    vfxCanvas.style.display = 'none';
    vfxCanvas.style.pointerEvents = 'none';
  }
  canvasRoot.innerHTML = '';

  // 1. Career Save Store & Persisted Options
  const careerStore = new CareerSaveStoreV6();
  const initialCareer = careerStore.getState();
  const initialEp = getEpisodeBlueprintV6(initialCareer.currentEpisode);
  applyBroadcastOptionsToDomV6(uiRoot, initialCareer.options);

  // 2. Ultra-HD Three.js WebGL2 PBR Stage Engine (10 Distinct Worlds)
  const stageEngine = new StageWebGL2Engine({
    container: canvasRoot,
    initialStage: initialEp.stageMeta.stageId,
    initialZone: 'LOBBY_PROSCENIUM',
    resolutionTier: initialCareer.options.resolutionTier,
    shadowQuality: initialCareer.options.shadowQuality,
    cameraMotion: initialCareer.options.cameraMotion,
    syncHudThemeVars: true,
  });
  stageEngine.start();

  // 3. Rupert-Neve 5-Bus Broadcast Audio Engine (14 Symphonies + 33 Horology Foley Cues)
  const audioEngine = getSharedStudioAudioEngineV6(initialCareer.options);
  audioEngine.applyOptions(initialCareer.options);

  const unlockAudioOnce = (): void => {
    void audioEngine.unlock();
    void audioEngine.prewarmPriorityFoley();
  };
  window.addEventListener('pointerdown', unlockAudioOnce, { once: true, passive: true });
  window.addEventListener('keydown', unlockAudioOnce, { once: true });

  // 4. 100-Board Contraption Manager (Boards 001-050 + Boards 051-100 + 16 Live Twists)
  const rendererA = new BoardContraptionRendererA();
  const unifiedBoardManager = new UnifiedBoardManagerV6({
    catalogABoards: BOARD_CATALOG_001_TO_050,
    stateFactoryA: buildBoardRuntimeStateA,
    rendererA,
  });

  // Drive live 60fps 3D board contraption physics on the StageWebGL2Engine frame loop
  const removeBoardFrameListener = stageEngine.addFrameListener((dtSec, elapsedSec) => {
    unifiedBoardManager.updateFrame(dtSec, elapsedSec);
  });

  // 5. 100-Toy Stage Manager (Toys 001-050 + 4K Relief Globe + Toys 051-100)
  const unifiedToyManager = new UnifiedToyManagerV6();
  unifiedToyManager.registerPackA(TOY_CATALOG_001_TO_050, (container, toy, clue, opts) =>
    mountToyStageA(container, toy, clue, {
      stageTheme: opts.stageTheme,
      timerBonusSeconds: opts.timerBonusSeconds,
      onPlayFoley: opts.onSfx,
      onResolve: opts.onResolve,
    }),
  );

  // 6. 1.28M Calibrated Corpus + 160 KB Zero-Repeat Bitset + Clause 14-B Showrunner
  const showrunner = new ReactiveShowrunnerV6();
  void sharedSeenLedgerV6.hydrate();
  void sharedQuestionEngineV6.init();
  void showrunner.loadScript();

  // 7. Assemble Master Showtime Director Across All 12 Subsystems
  const director = new ShowtimeMasterDirectorV6(uiRoot, {
    careerStore,

    stageEngine: {
      loadStageWorld: (stageId: StageWorldIdV6) => {
        stageEngine.setStageWorld(stageId);
        audioEngine.setStageAmbience(stageId);
      },
      applyOptions: (opts: BroadcastOptionsStateV6) => {
        stageEngine.applyBroadcastOptions(opts);
        applyBroadcastOptionsToDomV6(uiRoot, opts);
      },
      setTrapdoorOpen: (open: boolean) => {
        stageEngine.setTrapdoorOpen(open);
      },
      getStageTheme: (stageId: StageWorldIdV6): StageAtmosphereThemeV6 => getStageThemeV6(stageId),
      triggerSparkBurst: () => {
        stageEngine.emitSparks([0, 0.85, 0], 48, 5.2);
      },
    },

    cameraDirector: {
      transitionTo: (zone, instant) => {
        stageEngine.setCameraZone(zone, { immediate: Boolean(instant) });
      },
      setMotionMode: (mode) => {
        stageEngine.cameraDirector.setMotionMode(mode);
      },
    },

    audioEngine: {
      playSymphony: (trackId) => {
        void audioEngine.auditionSymphonyTrack(trackId);
      },
      playFoley: (sfxId) => {
        audioEngine.playFoley(sfxId);
      },
      applyOptions: (opts) => {
        audioEngine.applyOptions(opts);
      },
      duckForVoice: (durationMs = 2600) => {
        audioEngine.setVoiceDucking(true);
        window.setTimeout(() => audioEngine.setVoiceDucking(false), durationMs);
      },
      getChannelLevels: () => {
        const ch = audioEngine.getChannelLevels();
        return {
          left: ch.masterL,
          right: ch.masterR,
          peak: Math.max(ch.masterL, ch.masterR),
        };
      },
    },

    questionEngine: {
      drawCalibratedClue: async (req) =>
        sharedQuestionEngineV6.drawClue({
          stageNumber: req.stageNumber,
          difficultyRange: req.difficultyBand,
          domainId: req.domainId,
          toyFamily: req.toyFamily,
          toyId: req.toyId,
          markSeen: true,
        }),
      getSeenCount: () => sharedSeenLedgerV6.getSeenCount(),
      getTotalPoolSize: () => 1_282_554,
      wipeSeenMemory: async () => {
        await sharedSeenLedgerV6.reset(true);
      },
    },

    boardManager: {
      getAllBoards: () => unifiedBoardManager.getAllBoards(),
      getBoardByNumber: (boardNumber) => unifiedBoardManager.getBoardByNumber(boardNumber),
      createRuntimeState: (def, rivalName, maxTurns) => {
        const { state } = unifiedBoardManager.startBoardMatch({
          boardIdOrNumber: def.boardNumber,
          rivalName,
          maxTurns,
        });
        return state;
      },
      mountBoard: (container, state, stageTheme, rivalIntent, heldFoils, handlers) => {
        stageEngine.setPresenterPodiumVisible(false);

        // Mount live 3D PBR contraption inside StageWebGL2Engine.boardMount!
        unifiedBoardManager.startBoardMatch({
          boardIdOrNumber: state.definition.boardNumber,
          rivalName: state.rivalName,
          overrideTwist: state.activeTwist,
          maxTurns: state.maxTurns,
          parent3D: stageEngine.boardMount,
          stageTheme,
        });
        // Preserve live match node/score mutations across turns
        const managedState = unifiedBoardManager.getActiveState();
        if (managedState) {
          managedState.nodes = state.nodes;
          managedState.turnNumber = state.turnNumber;
          managedState.ringRotationsDeg = [...state.ringRotationsDeg] as [number, number, number];
          managedState.playerScoreChips = state.playerScoreChips;
          managedState.playerMult = state.playerMult;
          managedState.playerTotalCash = state.playerTotalCash;
          managedState.rivalTotalCash = state.rivalTotalCash;
          managedState.streakCount = state.streakCount;
          unifiedBoardManager.syncRendererNow();
        }

        const specA = getBoardContraptionSpecA(state.definition.boardId);
        const specB = getBoardBlueprintB(state.definition.boardId);
        const winRuleBanner =
          specA?.ruleBannerShort ??
          specB?.customRuleSummary ??
          state.definition.targetWinCondition;

        const shell = document.createElement('section');
        shell.className = 'v6-board-hud-shell';
        shell.dataset.v6Screen = 'board-3d';

        const twistLabel =
          state.activeTwist !== 'NONE'
            ? TWIST_MUTATION_SPECS_V6[state.activeTwist]?.stageCallout ??
              state.activeTwist.replace(/_/g, ' ')
            : null;

        const openNodes = state.nodes.filter((n) => n.owner === 'NONE');
        const quickNodes = openNodes.slice(0, 4);

        shell.innerHTML = `
          <div class="v6-board-top-deck">
            <div class="v6-board-identity">
              <div class="v6-board-kicker">BOARD ${String(state.definition.boardNumber).padStart(3, '0')}/100 · TURN ${state.turnNumber}/${state.maxTurns}${twistLabel ? ` · TWIST: ${twistLabel}` : ''}</div>
              <div class="v6-board-title-row">
                <h2 class="v6-board-title">${state.definition.name}</h2>
                <span class="v6-board-rule-pill">${winRuleBanner}</span>
              </div>
            </div>
            <div class="v6-board-duel-strip">
              <span class="v6-board-score-chip is-you">YOU $${state.playerTotalCash.toLocaleString('en-US')} · x${state.playerMult.toFixed(1)}</span>
              <div class="v6-board-rival-cameo" id="v6BoardRivalCameo"></div>
              <span class="v6-board-score-chip is-rival">${state.rivalName.split(' ')[0].toUpperCase()} $${state.rivalTotalCash.toLocaleString('en-US')}</span>
            </div>
          </div>

          <div class="v6-board-stage-window">
            <div class="v6-board-hover-readout" id="v6BoardHoverReadout">
              ${rivalIntent ? `RIVAL TARGET: ${rivalIntent.intentBadgeText} · TAP ANY 3D GEM OR QUICK CLUE` : 'TAP ANY 3D CONTRAPTION GEM OR CHOOSE BELOW'}
            </div>
          </div>

          <div class="v6-board-bottom-dock">
            <div class="v6-board-node-scroller">
              ${quickNodes
                .map((n, idx) => {
                  const aligned = state.alignedNodeIds.includes(n.nodeId) || idx === 0;
                  return `<button type="button" class="v6-board-node-btn ${aligned ? 'is-aligned' : ''}" data-node-id="${n.nodeId}">
                    <span class="v6-board-node-cat">${n.categoryLabel}</span>
                    <span class="v6-board-node-val">+${n.baseChips} CHIPS · x${(1 + n.multBonus).toFixed(1)}${n.lockedChains > 0 ? ' · LOCKED' : ''}</span>
                  </button>`;
                })
                .join('')}
            </div>
            <div class="v6-board-controls-row">
              <button type="button" class="v6-board-tactical-btn is-secondary" data-act="rotate-ring">ROTATE 3D RING</button>
              ${heldFoils
                .slice(0, 2)
                .map(
                  (f) =>
                    `<button type="button" class="v6-board-tactical-btn is-foil" data-foil-id="${f.cardId}">${f.name}</button>`,
                )
                .join('')}
              ${
                quickNodes[0]
                  ? `<button type="button" class="v6-board-tactical-btn" data-node-id="${quickNodes[0].nodeId}">PLAY $${quickNodes[0].baseChips} CLUE</button>`
                  : ''
              }
            </div>
          </div>
        `;

        container.appendChild(shell);

        // Mount crisp 3x Retina Sony-PVM Rival Monitor Badge
        const cameoSlot = shell.querySelector<HTMLElement>('#v6BoardRivalCameo');
        const cameoHandle = cameoSlot
          ? mountCastMonitorBadge(cameoSlot, {
              portraitKey: getChampionPortraitKeyForStage(stageTheme.stageId),
              sizePx: 34,
              mood: 'smug',
            })
          : null;

        const hoverReadout = shell.querySelector<HTMLElement>('#v6BoardHoverReadout');

        // Bind 1-tap thumb dock buttons
        shell.querySelectorAll<HTMLButtonElement>('[data-node-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const nid = btn.dataset.nodeId;
            if (nid) handlers.onSelectNode(nid);
          });
        });

        shell.querySelector<HTMLButtonElement>('[data-act="rotate-ring"]')?.addEventListener('click', () => {
          handlers.onRotateRing?.(0, 60);
          if (managedState) {
            managedState.ringRotationsDeg = [...state.ringRotationsDeg] as [number, number, number];
            unifiedBoardManager.syncRendererNow();
          }
        });

        shell.querySelectorAll<HTMLButtonElement>('[data-foil-id]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const fid = btn.dataset.foilId;
            if (fid) handlers.onUseFoilCard(fid, quickNodes[0]?.nodeId);
          });
        });

        // Direct 3D WebGL2 Raycast Hover & Tap on the Live 3D Contraption!
        const domCanvas = stageEngine.renderer.domElement;
        const toNdc = (e: PointerEvent): [number, number] => {
          const rect = domCanvas.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
          const y = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
          return [x, y];
        };

        const onCanvasMove = (e: PointerEvent): void => {
          const [nx, ny] = toNdc(e);
          const hit = unifiedBoardManager.pickAtNdc(nx, ny, stageEngine.camera);
          unifiedBoardManager.setHoveredNode(hit.nodeId);
          if (hit.boardPlanePoint && state.activeTwist === 'BLACKOUT_SPOTLIGHT') {
            unifiedBoardManager.moveSpotlight(hit.boardPlanePoint[0], hit.boardPlanePoint[2]);
          }
          if (hit.nodeId && hoverReadout) {
            const nd = state.nodes.find((n) => n.nodeId === hit.nodeId);
            if (nd) {
              hoverReadout.textContent = `${nd.categoryLabel} · +${nd.baseChips} CHIPS · x${(1 + nd.multBonus).toFixed(1)}${nd.owner !== 'NONE' ? ` (${nd.owner})` : ' — TAP GEM TO PLAY'}`;
            }
          }
        };

        const onCanvasTap = (e: PointerEvent): void => {
          const [nx, ny] = toNdc(e);
          const hit = unifiedBoardManager.pickAtNdc(nx, ny, stageEngine.camera);
          if (hit.nodeId) {
            const nd = state.nodes.find((n) => n.nodeId === hit.nodeId && n.owner === 'NONE');
            if (nd) {
              stageEngine.emitSparks(nd.pos3d, 36, 4.4);
              handlers.onSelectNode(nd.nodeId);
            }
          }
        };

        domCanvas.addEventListener('pointermove', onCanvasMove, { passive: true });
        domCanvas.addEventListener('pointerup', onCanvasTap);

        return {
          dispose(): void {
            domCanvas.removeEventListener('pointermove', onCanvasMove);
            domCanvas.removeEventListener('pointerup', onCanvasTap);
            cameoHandle?.destroy();
            unifiedBoardManager.dispose();
            stageEngine.setPresenterPodiumVisible(null);
            shell.remove();
          },
        };
      },
    },

    twistDirector: {
      pickHalftimeTwist: (board): BoardTwistMutationIdV6 => {
        if (board.definition.defaultTwist !== 'NONE') return board.definition.defaultTwist;
        return 'HIGH_VOLTAGE_CHAIN';
      },
      applyTwistMutation: (board, twistId): string => {
        board.activeTwist = twistId;
        const spec = TWIST_MUTATION_SPECS_V6[twistId];
        return spec ? `${spec.title} — ${spec.rulesSummary}` : `Stage Twist: ${twistId}`;
      },
      applyFoilEffect: (board, card, targetNodeId) => {
        const outcome = unifiedBoardManager.twistDirector.applyFoilTrickCard(
          board,
          card,
          targetNodeId,
        );
        return {
          applied: outcome.applied,
          message: outcome.summary,
          frozeRival: card.effectKind === 'FREEZE_NODE',
          screwedRival: card.effectKind === 'SCREW_RIVAL',
          doubleMult: card.effectKind === 'DOUBLE_MULT',
        };
      },
    },

    toyManager: {
      getAllToys: () => unifiedToyManager.getAllToys(),
      getToyByNumber: (num) => unifiedToyManager.getToy(num),
      mountToy: (container, toy, clue, opts): DisposableHandleV6 => {
        stageEngine.setPresenterPodiumVisible(false);
        const bonusSec = opts.options.timerPaceMode === 'RELAXED_PLUS_4S' ? 4 : 0;
        const handle = unifiedToyManager.mountToy(container, {
          clue,
          toyId: toy.toyId,
          toyNumber: toy.toyNumber,
          stageTheme: opts.stageTheme,
          stageWorldId: opts.stageTheme.stageId,
          timerBonusSeconds: bonusSec,
          onSfx: opts.onPlayFoley,
          onResolve: (res) => {
            if (res.correct) {
              stageEngine.emitSparks([0, 1.0, 0], 44, 5.0);
            }
            opts.onResolve(res);
          },
        });
        return {
          dispose(): void {
            handle.dispose();
            stageEngine.setPresenterPodiumVisible(null);
          },
        };
      },
    },

    trapdoorEngine: {
      getTrapdoorIds: () => TRAPDOOR_PIT_CATALOG_V6.map((p) => p.pitId),
      mountTrapdoor: (container, opts): DisposableHandleV6 => {
        stageEngine.setPresenterPodiumVisible(false);
        const validPitId = TRAPDOOR_PIT_CATALOG_V6.some((p) => p.pitId === opts.trapdoorId)
          ? (opts.trapdoorId as TrapdoorPitIdV6)
          : undefined;
        const handle = mountStageTrapdoorGambitV6(container, {
          pitId: validPitId,
          onSfx: opts.onPlayFoley,
          onComplete: (res) => {
            if (res.survived) {
              stageEngine.emitSparks([0, -2.5, 0], 56, 5.8);
            }
            opts.onComplete({
              trapdoorId: res.pitId,
              survived: res.survived,
              secondsRemaining: res.secondsRemaining,
              summaryText: `${res.pitName} (${res.actionTag})`,
            });
          },
        });
        return {
          dispose(): void {
            handle.dispose();
            stageEngine.setPresenterPodiumVisible(null);
          },
        };
      },
    },

    propTrunk: {
      evaluateRelicCascade: (params) => {
        const res = evaluateRelicScoringCascadeV6({
          baseChips: params.baseChips,
          baseMult: params.baseMult,
          equippedRelicIds: [...params.equippedRelicIds],
          streakCount: params.streakCount,
          survivedTrapdoorCount: careerStore.getState().matchMemory.survivedTrapdoorCount,
          bankrollCash: careerStore.getState().bankrollCash,
          stageHeat: 25,
        });
        return {
          totalChips: res.finalChips,
          finalMult: res.finalMult,
          cashEarned: res.totalPayout,
          triggeredRelicIds: res.steps.map((s) => s.relicId),
        };
      },
      mountTrunk: (container, opts): DisposableHandleV6 => {
        stageEngine.setPresenterPodiumVisible(false);
        const wrap = document.createElement('div');
        wrap.className = 'v6-trunk-stage-wrap';
        container.appendChild(wrap);

        let syncedState: PropTrunkStateV6 = {
          bankrollCash: opts.career.bankrollCash,
          equippedRelicIds: [...opts.career.equippedRelicIds],
          ownedFoilCardIds: opts.career.heldFoilCards.map((f) => f.cardId),
          maxRelicSlots: opts.career.maxRelicSlots,
          maxFoilSlots: 3,
          streakCount: opts.career.matchMemory.maxStreakReached,
          survivedTrapdoorCount: opts.career.matchMemory.survivedTrapdoorCount,
          stageHeat: opts.nextEpisode.stageMeta.stageNumber * 10,
        };

        const greeting = opts.backstageBeat
          ? opts.backstageBeat.lines.join(' ')
          : 'Grab a rigged relic and order +MULT left of xMULT before Sloane flips the stage breakers.';

        const syncToCareer = (nextState: PropTrunkStateV6): void => {
          for (const rid of nextState.equippedRelicIds) {
            if (!syncedState.equippedRelicIds.includes(rid)) {
              const spec = RELIC_SPECS_BY_ID.get(rid);
              if (spec) opts.onBuyEquipRelic(rid, spec.costCash);
            }
          }
          for (const rid of syncedState.equippedRelicIds) {
            if (!nextState.equippedRelicIds.includes(rid)) {
              opts.onUnequipRelic(rid);
              const spec = RELIC_SPECS_BY_ID.get(rid);
              if (spec) careerStore.adjustBankroll(Math.round(spec.costCash * 0.5));
            }
          }
          careerStore.setEquippedRelicOrder(nextState.equippedRelicIds);

          for (const cid of nextState.ownedFoilCardIds) {
            if (!syncedState.ownedFoilCardIds.includes(cid)) {
              const foil: FoilTrickCardV6 | undefined =
                FOIL_CARDS_BY_ID.get(cid) ??
                FOIL_TRICK_CATALOG_V6.find((c) => c.cardId === cid);
              if (foil) opts.onBuyFoilCard(foil);
            }
          }
          syncedState = {
            ...nextState,
            equippedRelicIds: [...nextState.equippedRelicIds],
            ownedFoilCardIds: [...nextState.ownedFoilCardIds],
          };
        };

        const handle = mountPropTrunkViewV6(wrap, {
          state: syncedState,
          seed: opts.nextEpisode.episodeNumber * 9973,
          nextTwistPreview: opts.upcomingTwistPreview.replace(/_/g, ' '),
          frankieGreeting: greeting,
          onSfx: (sfx) => audioEngine.playFoley(sfx),
          onStateChange: syncToCareer,
          onContinueToStage: (finalState) => {
            syncToCareer(finalState);
            opts.onLaunchNextBroadcast();
          },
        });

        return {
          dispose(): void {
            handle.dispose();
            wrap.remove();
            stageEngine.setPresenterPodiumVisible(null);
          },
        };
      },
    },

    showrunner: {
      pickLiveQuip: (triggerTags, memory): ReactiveDialogueBeatV6 | null => {
        const primaryTag = triggerTags[0] ?? 'clue_correct';
        const ep = getEpisodeBlueprintV6(memory.episodeNumber);
        return showrunner.selectLiveQuip(primaryTag, {
          stageWorldId: ep.stageMeta.stageId,
          episodeNumber: memory.episodeNumber,
        });
      },
      pickBackstageBeat: (memory): ReactiveDialogueBeatV6 | null => {
        const ep = getEpisodeBlueprintV6(memory.episodeNumber);
        const beat = showrunner.selectBackstageBeat(memory, {
          stageWorldId: ep.stageMeta.stageId,
        });
        showrunner.markBeatPlayed(beat.beatId);
        return beat;
      },
    },

    lobbyView: {
      mount: (container, opts): DisposableHandleV6 => {
        stageEngine.setPresenterPodiumVisible(true);
        const lobby = new GrandLobbyHubV6({
          activeStageId: opts.activeStage.stageId,
          symphonyEnabled: opts.career.options.musicEnabled,
          optionsState: opts.career.options,
          telemetry: {
            bankrollCash: opts.career.bankrollCash,
            currentEpisode: opts.career.currentEpisode,
            completedEpisodes: opts.career.completedEpisodes.length,
            unlockedStages: opts.career.unlockedStageWorlds.length,
            earnedHonorCount: opts.career.unlockedAwardIds.length,
            pinnedMedalCount: opts.career.pinnedPodiumMedalIds.length,
          },
          callbacks: {
            onSelectAction: (action) => {
              switch (action) {
                case 'CAMPAIGN_ROAD':
                  opts.onStartCampaign(opts.career.currentEpisode);
                  break;
                case 'QUICK_SHOW_100':
                  opts.onStartQuickShow(opts.activeStage.stageId);
                  break;
                case 'TRAPDOOR_GAUNTLET':
                  opts.onStartTrapdoorGauntlet();
                  break;
                case 'PROP_TRUNK':
                  opts.onOpenTrunk();
                  break;
                case 'TROPHY_VAULT':
                  opts.onOpenTrophyVault();
                  break;
                case 'OPTIONS_CONSOLE':
                  opts.onOpenOptions();
                  break;
              }
            },
            onLaunchEpisode: (_stageId, epNum) => {
              opts.onStartCampaign(epNum);
            },
            onPreviewStageWorld: (stageId) => {
              opts.onSelectStagePreview(stageId);
              const th = getStageThemeV6(stageId);
              void audioEngine.auditionSymphonyTrack(th.symphonyTrack);
            },
            onToggleSymphony: (enabled) => {
              const updated = careerStore.updateOptions({ musicEnabled: enabled });
              saveBroadcastOptionsV6(updated);
              audioEngine.applyOptions(updated);
            },
            onToggleFullscreen: () => {
              void toggleDocumentFullscreenV6();
            },
            onPlayFoley: (sfx) => audioEngine.playFoley(sfx),
          },
        });
        lobby.mount(container);
        return {
          dispose: () => lobby.dispose(),
        };
      },
    },

    trophyVaultView: {
      mount: (container, opts): DisposableHandleV6 => {
        stageEngine.setPresenterPodiumVisible(false);
        const vault = new TrophyMedalVault3DV6({
          unlockedAwardIds: opts.career.unlockedAwardIds,
          pinnedMedalIds: opts.career.pinnedPodiumMedalIds,
          resolutionTier: opts.career.options.resolutionTier,
          onPinnedMedalsChange: (pinnedIds) => {
            const current = new Set<string>(careerStore.getState().pinnedPodiumMedalIds);
            const target = new Set<string>(pinnedIds);
            for (const id of current) {
              if (!target.has(id)) opts.onTogglePinMedal(id);
            }
            for (const id of target) {
              if (!current.has(id)) opts.onTogglePinMedal(id);
            }
          },
          onPlayFoley: (sfx) => audioEngine.playFoley(sfx),
          onClose: () => opts.onBack(),
        });
        vault.mount(container);
        return {
          dispose: () => {
            vault.dispose();
            stageEngine.setPresenterPodiumVisible(null);
          },
        };
      },
    },

    optionsConsoleView: {
      mount: (container, opts): DisposableHandleV6 => {
        stageEngine.setPresenterPodiumVisible(false);
        const currentEpMeta = getEpisodeBlueprintV6(careerStore.getState().currentEpisode);
        const consoleView = new BroadcastOptionsConsoleV6({
          initialState: opts.options,
          corpusTelemetry: {
            seenCount: opts.seenClueCount,
            totalCount: opts.totalCluePool,
            currentCampaignStage: currentEpMeta.stageMeta.stageNumber,
            currentCampaignEpisode: careerStore.getState().currentEpisode,
          },
          activeTrackId: opts.stageTheme.symphonyTrack,
          onChange: (nextState) => {
            saveBroadcastOptionsV6(nextState);
            opts.onUpdateOptions(nextState);
          },
          onAuditionTrack: (trackId, playing) => {
            if (playing) opts.onAuditionSymphony(trackId);
            else audioEngine.stopSymphony();
          },
          onPlayFoley: (sfx) => audioEngine.playFoley(sfx),
          onResetCampaign: () => opts.onResetCampaign(),
          onWipeLifetimeMemory: () => {
            void opts.onWipeClueMemory();
          },
          onClose: () => opts.onBack(),
        });
        consoleView.mount(container);
        return {
          dispose: () => {
            consoleView.dispose();
            stageEngine.setPresenterPodiumVisible(null);
          },
        };
      },
    },

    ceremonyView: {
      mount: (container, opts): DisposableHandleV6 => {
        stageEngine.setPresenterPodiumVisible(true);
        const s = opts.summary;
        const ceremony = new PostMatchCeremonyV6({
          resolutionTier: careerStore.getOptions().resolutionTier,
          data: {
            won: s.won,
            stageId: s.episode.stageMeta.stageId,
            stageTitle: s.episode.stageMeta.title,
            episodeNumber: s.episode.episodeNumber,
            boardName: s.episode.episodeLabel,
            baseChips: Math.max(200, Math.round(s.playerCash * 0.5)),
            streakMult: Math.max(1, 1 + s.maxStreak * 0.25),
            relicMult: Math.max(1, 1 + careerStore.getState().equippedRelicIds.length * 0.4),
            trapdoorSaves: s.trapdoorsSurvived,
            trapdoorBonusCash: s.trapdoorsSurvived * 150,
            finalPayoutCash: s.purseAwarded,
            newBankrollCash: careerStore.getState().bankrollCash,
            rivalName: s.rivalName,
            rivalCash: s.rivalCash,
            cluesSolved: Math.max(1, s.episode.turnCount - s.episodeMisses),
            cluesTotal: s.episode.turnCount,
            maxStreak: s.maxStreak,
            newlyUnlockedHonorIds: s.newlyUnlockedAwards.map((a) => a.awardId),
            nextTargetHonorId: HONOR_AWARDS_CATALOG_V6.find(
              (a) => !careerStore.getState().unlockedAwardIds.includes(a.awardId),
            )?.awardId,
            hostClosingLine: s.won
              ? 'Julian Sterling: "Sloane just snapped another pencil in the control booth. Spend that purse wisely."'
              : 'Frankie DeLuca: "Shake it off, kid. Step behind the velvet curtain and let us rig the next board."',
          },
          callbacks: {
            onEnterPropTrunk: () => opts.onGoToTrunk(),
            onNextOrReplay: () => opts.onPlayNextOrRematch(),
            onReturnHub: () => opts.onReturnLobby(),
            onPlayFoley: (sfx) => audioEngine.playFoley(sfx),
          },
        });
        ceremony.mount(container);
        return {
          dispose: () => ceremony.dispose(),
        };
      },
    },
  });

  // Boot directly into initial view or deterministic QA deep-link (?v6view=...)
  void director.start(window.location.search);

  return {
    director,
    stageEngine,
    dispose(): void {
      removeBoardFrameListener();
      unifiedBoardManager.dispose();
      director.dispose();
    },
  };
}
