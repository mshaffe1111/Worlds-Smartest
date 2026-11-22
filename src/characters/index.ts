// ============================================================================
// WORLD'S SMARTEST — Character Acting, Human Tells & Rival Telemetry Barrel
// Strict Disjoint Module Ownership: src/characters/**
// ============================================================================

import type { LiveGhostReplayFrame } from '../modes/CouncilTrialsGhostMode';
import type { BluffCallOutcome, RivalLiveHUDState } from '../narrative/RivalAI';
import {
  CHARACTER_ANATOMY_RIGS,
  CharacterStageActor,
  hexToRgba,
  normalizeCastId,
  normalizeExpression,
  preloadCharacterCutouts,
  type ActorEntranceDirection,
  type ActorFramingMode,
  type ActorMoodTint,
  type CharacterAnatomyRig,
  type CharacterStageActorOptions,
  type NormalizedPoint,
  type ProjectedStageMetrics,
  type StageOverlayLayerCallback,
  type StudioVoiceAudioLike,
} from './CharacterStageActor';
import {
  CharacterTellsChoreographer,
  TELL_DESCRIPTORS,
  deduceTellFromRivalHUD,
  type CharacterTellId,
  type CharacterTellsChoreographerOptions,
  type TellReadabilityKind,
  type TellVisualDescriptor,
} from './CharacterTellsChoreographer';
import {
  RivalPrismTelemetryWidget,
  type RivalPrismTelemetryOptions,
  type TelemetryWidgetVariant,
} from './RivalPrismTelemetryWidget';

export {
  CHARACTER_ANATOMY_RIGS,
  CharacterStageActor,
  CharacterTellsChoreographer,
  RivalPrismTelemetryWidget,
  TELL_DESCRIPTORS,
  deduceTellFromRivalHUD,
  hexToRgba,
  normalizeCastId,
  normalizeExpression,
  preloadCharacterCutouts,
  type ActorEntranceDirection,
  type ActorFramingMode,
  type ActorMoodTint,
  type CharacterAnatomyRig,
  type CharacterStageActorOptions,
  type CharacterTellId,
  type CharacterTellsChoreographerOptions,
  type NormalizedPoint,
  type ProjectedStageMetrics,
  type RivalPrismTelemetryOptions,
  type StageOverlayLayerCallback,
  type StudioVoiceAudioLike,
  type TelemetryWidgetVariant,
  type TellReadabilityKind,
  type TellVisualDescriptor,
};

// ----------------------------------------------------------------------------
// Unified One-Call Coordinator Helper for @sovereign-ui-lead (`SovereignHUD`)
// Keeps persistent warm canvases across DOM rebuilds with zero flicker!
// ----------------------------------------------------------------------------

export interface CharacterStageRigDirectorOptions {
  audioEngine?: StudioVoiceAudioLike | null;
  onCallBluff?: () => BluffCallOutcome | void;
  telemetryVariant?: TelemetryWidgetVariant;
  showMicroCaption?: boolean;
}

export interface GameplayStageDOMSlots {
  /** e.g. `.ws-actor-cutout-wrap` (replaces static `<img>` with 2.5D Canvas!) */
  portraitSlot?: HTMLElement | null;
  /** e.g. `.ws-tell-copy` (appends diegetic micro-caption & >=44px CALL BLUFF button!) */
  tellCopySlot?: HTMLElement | null;
  /** e.g. `.ws-actor-tell-cluster` (attaches Soren's 24K Gold Coin card-edge track!) */
  tellCardContainer?: HTMLElement | null;
  /** e.g. `.ws-rival-score` (prepends live Mini-Rival-Prism Telemetry Indicator!) */
  rivalScoreSlot?: HTMLElement | null;
}

export interface StoryDialogueDOMSlots {
  /** e.g. `.ws-actor-cutout-wrap` inside Story Dialogue or Geneva Registration */
  portraitSlot: HTMLElement;
  /** Optional container for diegetic tell badge below dialogue line */
  tellBadgeSlot?: HTMLElement | null;
  /** Optional outer cinema card container for Soren's rolling 24K coin edge */
  cardContainer?: HTMLElement | null;
}

export class CharacterStageRigDirector {
  public readonly actor: CharacterStageActor;
  public readonly tells: CharacterTellsChoreographer;
  public readonly rivalPrism: RivalPrismTelemetryWidget;

  constructor(options: CharacterStageRigDirectorOptions = {}) {
    this.actor = new CharacterStageActor({
      audioEngine: options.audioEngine ?? null,
      framing: 'auto',
      voiceMatchMode: 'actor-or-cinema',
    });

    this.tells = new CharacterTellsChoreographer({
      actor: this.actor,
      onCallBluff: options.onCallBluff,
      showMicroCaption: options.showMicroCaption ?? true,
    });

    this.rivalPrism = new RivalPrismTelemetryWidget({
      variant: options.telemetryVariant ?? 'compact',
    });
  }

  public attachAudioEngine(audio: StudioVoiceAudioLike | null): this {
    this.actor.attachAudioEngine(audio);
    return this;
  }

  public setOnCallBluff(handler: (() => BluffCallOutcome | void) | null): this {
    this.tells.setOnCallBluff(handler);
    return this;
  }

  /**
   * Call right after `SovereignHUD.renderGameplay()` writes DOM:
   * seamlessly mounts persistent warm canvases with zero reload or blink!
   */
  public mountGameplaySlots(slots: GameplayStageDOMSlots): void {
    if (slots.portraitSlot) {
      this.actor.mount(slots.portraitSlot);
    }
    if (slots.tellCopySlot) {
      this.tells.mountHudBar(slots.tellCopySlot);
    }
    if (slots.tellCardContainer) {
      this.tells.attachCardEdgeContainer(slots.tellCardContainer);
    }
    if (slots.rivalScoreSlot) {
      this.rivalPrism.mount(slots.rivalScoreSlot, true);
    }
  }

  /**
   * Call right after `SovereignHUD.renderStoryDialogue()` or `renderRegistration()`:
   * brings the speaking character cutout to life with 2.5D breathing, VO rim-light & story tells!
   */
  public mountStoryDialogueSlots(
    slots: StoryDialogueDOMSlots,
    beat: { speakerId: string; expression?: string; tellText?: string; text?: string },
  ): void {
    this.rivalPrism.unmount();
    this.actor.mount(slots.portraitSlot);
    this.tells.syncFromStoryBeat(beat);
    if (slots.tellBadgeSlot) {
      this.tells.mountHudBar(slots.tellBadgeSlot);
    }
    if (slots.cardContainer) {
      this.tells.attachCardEdgeContainer(slots.cardContainer);
    }
  }

  /** 60fps sync for Campaign Rival Head-to-Head & Boss Showdowns */
  public syncLiveCampaignRival(hud: RivalLiveHUDState): void {
    this.tells.syncFromRivalHUD(hud);
    this.rivalPrism.syncFromRivalHUD(hud);
  }

  /** 60fps sync for Mode 5 World Council Trials & Black Salon 3D Kinetic Ghosts */
  public syncLiveGhostOpponent(actorId: string, frame: LiveGhostReplayFrame): void {
    const normActor = normalizeCastId(actorId);
    this.actor.setActor(normActor, frame.expression);
    this.tells.setCallBluffWindow(false, 0);
    if (normActor === 'soren') {
      this.tells.triggerTell(
        frame.overclockCharging ? 'SOREN_COIN_FREEZE_HIT' : 'SOREN_COIN_IDLE_ROLL',
      );
    } else {
      this.tells.triggerTell('NONE');
    }
    this.rivalPrism.syncFromGhostFrame(frame);
  }

  /** Sync for solo modes (Geneva Prologue, Daily Global Feed, Briefing Room, Archive Descent) */
  public syncSoloStageHost(actorId: string, expression = 'neutral', tellHint?: string): void {
    this.rivalPrism.reset();
    this.rivalPrism.hide();
    this.tells.syncFromStoryBeat({
      speakerId: actorId,
      expression,
      tellText: tellHint,
    });
  }

  public dispose(): void {
    this.tells.dispose();
    this.rivalPrism.dispose();
    this.actor.dispose();
  }
}
