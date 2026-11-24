// ============================================================================
// WORLD'S SMARTEST v5.0 — Voiced Interactive Story Theater View
// Visual target: `mockup_v5_story_scene_1795482537341.jpg`
//  • Full-bleed painted stage/greenroom art + sculpted venue brass crest
//  • Waist-up animated transparent-alpha cutouts (Max Sterling & Challenger)
//  • Angled mahogany-and-brass speech banner with directional pointer tail &
//    live animated audio waveform icon (replayable on tap)
//  • 3 jewel-tipped beveled choice blades (+Bold gold, +Respect emerald,
//    +Witty cyan) displaying live relationship, bankroll & sponsor stakes
//  • Mobile-first ZERO-CLIP layout across Portrait (`390x844`, `360x640`),
//    Phone Landscape (`844x390`, `640x360` -> Characters Left / Banner+Choices Right),
//    and Desktop (`1280x800+`), plus 1-tap Fullscreen button (`data-v5-fullscreen-toggle`)
//  • ZERO glass blur filters, ZERO flat dark-blue SaaS boxes, ZERO OS emojis!
// ============================================================================

import {
  V5_CAST_CUTOUTS,
  V5_VENUE_STAGES,
  type ChallengerIdV5,
  type CharmIdV5,
  type DialogueAttitudeV5,
  type HostPoseV5,
  type InteractiveStorySceneV5,
  type SponsorFactionIdV5,
  type StoryChoiceConsequenceV5,
  type VoicedDialogueBeatV5,
} from './contracts_v5';
import {
  RIVAL_PROFILES_V5,
  SPONSOR_CATALOG_V5,
  formatBankrollUsd,
  type StoryChoiceResolutionV5,
} from './BranchingCampaignEngine';

export interface StoryTheaterVoiceBridgeV5 {
  playVoiceClip?: (clipId: string, expectedText?: string) => Promise<boolean> | boolean;
  stopVoice?: () => void;
  isVoicePlaying?: () => boolean;
  playSfx?: (cue: 'ui_tap' | 'switch_clack' | 'polaroid_pin' | 'cutscene_whoosh' | 'gold_resonance') => void;
}

export interface StoryTheaterChoiceFeedbackV5 {
  readonly summaryBadges?: readonly string[];
  readonly challengerAffinityAfter?: number | null;
  readonly unlockedCharms?: readonly CharmIdV5[];
  readonly queuedAllyCall?: boolean;
  readonly triggeredGrudge?: boolean;
}

export interface StoryTheaterCompletionResultV5 {
  readonly sceneId: string;
  readonly sceneKind: InteractiveStorySceneV5['kind'];
  readonly chosenChoice: StoryChoiceConsequenceV5 | null;
  readonly skipped: boolean;
}

export interface VoicedStoryTheaterCallbacksV5 {
  readonly voiceBridge?: StoryTheaterVoiceBridgeV5;
  readonly onChoiceSelected?: (
    choice: StoryChoiceConsequenceV5,
    scene: InteractiveStorySceneV5,
  ) => StoryTheaterChoiceFeedbackV5 | StoryChoiceResolutionV5 | void;
  readonly onSceneComplete?: (result: StoryTheaterCompletionResultV5) => void;
  readonly onSkipScene?: (scene: InteractiveStorySceneV5) => void;
  readonly onToggleFullscreen?: () => void | Promise<void>;
  readonly continueButtonLabel?: string;
  readonly allowSkip?: boolean;
}

interface ActiveDialogueEntry {
  readonly speaker: VoicedDialogueBeatV5['speaker'];
  readonly speakerName: string;
  readonly speakerRole?: string;
  readonly text: string;
  readonly voiceClipId?: string;
  readonly hostPose?: HostPoseV5;
  readonly backdropUrl?: string;
  readonly isChoicePromptBeat?: boolean;
}

const THEATER_STYLE_ID = 'v5-voiced-story-theater-styles';

function escapeHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getHostPortraitUrl(pose: HostPoseV5 | undefined): string {
  if (pose === 'hype') return V5_CAST_CUTOUTS.maxHype;
  if (pose === 'wince') return V5_CAST_CUTOUTS.maxWince;
  return V5_CAST_CUTOUTS.maxWelcome;
}

function isChallengerSpeaker(speaker: VoicedDialogueBeatV5['speaker']): speaker is ChallengerIdV5 {
  return speaker !== 'max_sterling' && speaker !== 'producer_sam' && speaker !== 'narrator';
}

function resolveCanonicalVoiceAlias(clipId: string): string {
  // Align cleanly with voice-cast-producer (#72) canonical clip IDs while supporting aliases
  return clipId
    .replace(/_intro$/, '_walkout')
    .replace(/_clap_bold$/, '_reply_bold')
    .replace(/_clap_respect$/, '_reply_respect')
    .replace(/_clap_witty$/, '_reply_witty')
    .replace(/_trap$/, '_trap_taunt')
    .replace(/_screwed$/, '_screwed_react');
}

/**
 * Helper adapter wrapping any `StudioAudioEngine`-compatible instance into a
 * `StoryTheaterVoiceBridgeV5` (auto-supports v5 `playV5Voice` when present!).
 */
export function createStoryTheaterVoiceBridge(audioEngine: unknown): StoryTheaterVoiceBridgeV5 {
  if (!audioEngine || typeof audioEngine !== 'object') return {};
  const eng = audioEngine as {
    playV5Voice?: (clipId: string, expectedSubstring?: string) => Promise<boolean>;
    stopVoice?: () => void;
    isVoicePlaying?: () => boolean;
    playSfx?: (cue: string) => void;
  };
  return {
    playVoiceClip: async (clipId: string, expectedText?: string) => {
      if (typeof eng.playV5Voice !== 'function') return false;
      const snippet = expectedText ? expectedText.slice(0, 32) : undefined;
      const canonical = resolveCanonicalVoiceAlias(clipId);
      const played = await eng.playV5Voice(canonical, snippet);
      if (played) return true;
      if (canonical !== clipId) {
        return eng.playV5Voice(clipId, snippet);
      }
      return false;
    },
    stopVoice: () => {
      if (typeof eng.stopVoice === 'function') eng.stopVoice();
    },
    isVoicePlaying: () => (typeof eng.isVoicePlaying === 'function' ? eng.isVoicePlaying() : false),
    playSfx: (cue) => {
      if (typeof eng.playSfx === 'function') {
        try {
          eng.playSfx(cue);
        } catch {
          // Graceful fallback if specific cue isn't registered yet
          eng.playSfx('ui_tap');
        }
      }
    },
  };
}

// ============================================================================
// CUSTOM INLINE SVG CRAFT (ZERO OS EMOJIS! ZERO FLAT BOXES!)
// ============================================================================

function renderVenueBrainCrestSvg(): string {
  return `
    <svg class="v5-venue-brain-svg" viewBox="0 0 36 24" aria-hidden="true">
      <defs>
        <linearGradient id="v5CrestGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff4c4"/>
          <stop offset="50%" stop-color="#e3ad42"/>
          <stop offset="100%" stop-color="#8c5a14"/>
        </linearGradient>
      </defs>
      <path d="M5 17 C2 13, 3 7, 8 6 C9 3, 14 2, 17 5 L17 19 C13 21, 8 20, 5 17 Z" fill="url(#v5CrestGold)" stroke="#4c2c07" stroke-width="1"/>
      <path d="M31 17 C34 13, 33 7, 28 6 C27 3, 22 2, 19 5 L19 19 C23 21, 28 20, 31 17 Z" fill="url(#v5CrestGold)" stroke="#4c2c07" stroke-width="1"/>
      <path d="M10 9 C12 9, 13 11, 12 13 M26 9 C24 9, 23 11, 24 13 M11 15 C13 15, 14 14, 15 16 M25 15 C23 15, 22 14, 21 16" fill="none" stroke="#5b340a" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
  `;
}

function renderAudioWaveformSvg(): string {
  return `
    <svg class="v5-voice-wave-svg" viewBox="0 0 28 22" aria-hidden="true">
      <defs>
        <linearGradient id="v5WaveGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff5cb"/>
          <stop offset="55%" stop-color="#e7b64c"/>
          <stop offset="100%" stop-color="#a86f1c"/>
        </linearGradient>
      </defs>
      <path d="M2 8.2 H6.4 L12.2 3.2 V18.8 L6.4 13.8 H2 Z" fill="url(#v5WaveGold)" stroke="#4c2a08" stroke-width="0.9" stroke-linejoin="round"/>
      <path class="v5-wave-arc v5-wave-arc-1" d="M15.4 7.6 C17.1 9.2, 17.1 12.8, 15.4 14.4" fill="none" stroke="#ffe597" stroke-width="2" stroke-linecap="round"/>
      <path class="v5-wave-arc v5-wave-arc-2" d="M18.6 5.2 C21.5 8.1, 21.5 13.9, 18.6 16.8" fill="none" stroke="#f0be52" stroke-width="2" stroke-linecap="round"/>
      <path class="v5-wave-arc v5-wave-arc-3" d="M21.8 3 C25.8 7.1, 25.8 14.9, 21.8 19" fill="none" stroke="#d4992d" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;
}

function renderFullscreenIconSvg(isFullscreen: boolean): string {
  if (isFullscreen) {
    return `
      <svg class="v5-hud-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 4V9H4M15 4V9H20M9 20V15H4M15 20V15H20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
  return `
    <svg class="v5-hud-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9V4H9M20 9V4H15M4 15V20H9M20 15V20H15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function renderSkipIconSvg(): string {
  return `
    <svg class="v5-hud-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6L13 12L5 18V6Z" fill="currentColor"/>
      <path d="M13 6L20 12L13 18V6Z" fill="currentColor"/>
    </svg>
  `;
}

function renderChevronRightSvg(): string {
  return `
    <svg class="v5-next-chevron-svg" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6 4L15 10L6 16V4Z" fill="currentColor"/>
    </svg>
  `;
}

function renderProducerIntercomSvg(): string {
  return `
    <svg class="v5-intercom-svg" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="v5IntercomRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff2bd"/>
          <stop offset="45%" stop-color="#d89d34"/>
          <stop offset="100%" stop-color="#6b420f"/>
        </linearGradient>
        <radialGradient id="v5IntercomCore" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#4e2915"/>
          <stop offset="100%" stop-color="#1e0e06"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="54" fill="url(#v5IntercomRim)"/>
      <circle cx="60" cy="60" r="47" fill="url(#v5IntercomCore)" stroke="#f6d57a" stroke-width="2"/>
      <path d="M32 62 A28 28 0 0 1 88 62" fill="none" stroke="#f5cb69" stroke-width="4.5" stroke-linecap="round"/>
      <rect x="26" y="57" width="12" height="22" rx="5" fill="url(#v5IntercomRim)" stroke="#4c2c07" stroke-width="1.5"/>
      <rect x="82" y="57" width="12" height="22" rx="5" fill="url(#v5IntercomRim)" stroke="#4c2c07" stroke-width="1.5"/>
      <path d="M84 74 C76 86, 68 88, 60 88" fill="none" stroke="#f5cb69" stroke-width="3" stroke-linecap="round"/>
      <circle cx="58" cy="88" r="5.5" fill="#ffdf84" stroke="#4c2c07" stroke-width="1.5"/>
      <circle cx="60" cy="54" r="6" fill="#2ee09a"/>
      <circle cx="60" cy="54" r="11" fill="none" stroke="#2ee09a" stroke-width="1.6" opacity="0.55"/>
    </svg>
  `;
}

function renderDiamondGemSvg(attitude: DialogueAttitudeV5, index: number): string {
  const uid = `v5Gem_${attitude}_${index}`;
  const palette =
    attitude === 'RUTHLESS_CONFIDENCE'
      ? {
          top: '#fff9cc',
          left: '#ffd44c',
          right: '#d68216',
          bottom: '#8a4606',
          core: '#ffe875',
          stroke: '#fff0ad',
        }
      : attitude === 'WARM_RESPECT'
        ? {
            top: '#c7ffe8',
            left: '#43e8a0',
            right: '#139960',
            bottom: '#065736',
            core: '#6ff7bb',
            stroke: '#b6ffe0',
          }
        : {
            top: '#d4fbff',
            left: '#4ee6ff',
            right: '#1490b8',
            bottom: '#084e6b',
            core: '#7df0ff',
            stroke: '#c4f8ff',
          };

  return `
    <svg class="v5-choice-gem-svg" viewBox="0 0 48 56" aria-hidden="true">
      <defs>
        <linearGradient id="${uid}_bezel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff4c4"/>
          <stop offset="45%" stop-color="#dfaa3f"/>
          <stop offset="100%" stop-color="#6c410d"/>
        </linearGradient>
      </defs>
      <polygon points="24,1 46,28 24,55 2,28" fill="url(#${uid}_bezel)" stroke="#3e2206" stroke-width="1.5"/>
      <polygon points="24,6 40,28 24,50 8,28" fill="${palette.bottom}"/>
      <polygon points="24,6 40,28 24,28" fill="${palette.right}"/>
      <polygon points="24,6 8,28 24,28" fill="${palette.top}"/>
      <polygon points="24,50 8,28 24,28" fill="${palette.left}"/>
      <polygon points="24,14 33,28 24,42 15,28" fill="${palette.core}" opacity="0.88"/>
      <polygon points="24,14 15,28 24,24" fill="#ffffff" opacity="0.65"/>
      <polygon points="24,6 40,28 24,50 8,28" fill="none" stroke="${palette.stroke}" stroke-width="1.1" opacity="0.75"/>
    </svg>
  `;
}

function renderSpeechTailSvg(direction: 'up-left' | 'up-right' | 'left'): string {
  if (direction === 'left') {
    return `
      <svg class="v5-speech-tail-svg is-left-tail" viewBox="0 0 26 32" aria-hidden="true">
        <path d="M26 3 L2 16 L26 29 Z" fill="#e6b653"/>
        <path d="M26 6.5 L7.5 16 L26 25.5 Z" fill="#3a1c11"/>
      </svg>
    `;
  }
  const flip = direction === 'up-right' ? 'transform="scale(-1,1) translate(-42,0)"' : '';
  return `
    <svg class="v5-speech-tail-svg" viewBox="0 0 42 26" aria-hidden="true">
      <g ${flip}>
        <path d="M4 26 L16 2 L38 26 Z" fill="#e6b653"/>
        <path d="M9 26 L17.5 7.5 L33.5 26 Z" fill="#3a1c11"/>
      </g>
    </svg>
  `;
}

function getChoiceAttitudeTag(attitude: DialogueAttitudeV5): {
  readonly badge: string;
  readonly variantClass: string;
  readonly fallbackHint: string;
} {
  switch (attitude) {
    case 'RUTHLESS_CONFIDENCE':
      return {
        badge: '+Bold',
        variantClass: 'is-bold-gold',
        fallbackHint: 'Apex TV Interest',
      };
    case 'WARM_RESPECT':
      return {
        badge: '+Respect',
        variantClass: 'is-respect-emerald',
        fallbackHint: 'Unlocks Ally Tip',
      };
    case 'SHARP_WIT':
    default:
      return {
        badge: '+Witty',
        variantClass: 'is-witty-cyan',
        fallbackHint: 'Crowd Favorite',
      };
  }
}

function formatChoiceConsequenceSubline(choice: StoryChoiceConsequenceV5): string {
  const meta = getChoiceAttitudeTag(choice.attitude);
  const cues: string[] = [];

  if (choice.unlockCharmId) {
    cues.push('Unlocks Podium Charm');
  }
  if (choice.sponsorRepDelta) {
    const entries = Object.entries(choice.sponsorRepDelta)
      .filter(([, v]) => typeof v === 'number' && v !== 0)
      .sort((a, b) => Math.abs(b[1] ?? 0) - Math.abs(a[1] ?? 0));
    if (entries.length > 0) {
      const [sponsorKey, delta] = entries[0] as [SponsorFactionIdV5, number];
      const sponsorName = SPONSOR_CATALOG_V5[sponsorKey]?.shortName ?? sponsorKey;
      cues.push(delta > 0 ? `${sponsorName} +${delta}` : `${sponsorName} ${delta}`);
    }
  }
  if (choice.rivalAffinityDelta >= 15) {
    cues.push(`+${choice.rivalAffinityDelta} Ally Affinity`);
  } else if (choice.rivalAffinityDelta > 0 && cues.length === 0) {
    cues.push(`+${choice.rivalAffinityDelta} Respect`);
  } else if (choice.rivalAffinityDelta <= -15) {
    cues.push(`${choice.rivalAffinityDelta} Rival Grudge`);
  }
  if (typeof choice.bankrollDeltaUsd === 'number' && choice.bankrollDeltaUsd !== 0) {
    cues.push(
      choice.bankrollDeltaUsd > 0
        ? `+${formatBankrollUsd(choice.bankrollDeltaUsd)}`
        : formatBankrollUsd(choice.bankrollDeltaUsd),
    );
  }

  const secondary = cues.length > 0 ? cues.slice(0, 2).join(' · ') : meta.fallbackHint;
  return `${meta.badge} · ${secondary}`;
}

function extractOutcomeBadges(
  feedback: StoryTheaterChoiceFeedbackV5 | StoryChoiceResolutionV5 | void,
  choice: StoryChoiceConsequenceV5,
): string[] {
  if (feedback && 'summaryBadges' in feedback && Array.isArray(feedback.summaryBadges)) {
    return [...feedback.summaryBadges];
  }
  const badges: string[] = [];
  if (feedback && 'newAffinity' in feedback) {
    const res = feedback as StoryChoiceResolutionV5;
    if (res.challengerId && choice.rivalAffinityDelta !== 0) {
      const rivalShort = RIVAL_PROFILES_V5[res.challengerId]?.displayName.split(' ')[0] ?? 'Rival';
      const sign = choice.rivalAffinityDelta > 0 ? '+' : '';
      badges.push(`${sign}${choice.rivalAffinityDelta} ${rivalShort} (${res.newAffinity ?? 0})`);
    }
    if (res.queuedAllyCallSceneId) {
      badges.push('Green-Room Ally Call Queued');
    }
    if (res.triggeredSabotage) {
      badges.push('Rival Grudge Sabotage Armed');
    }
    for (const [k, v] of Object.entries(res.sponsorRepChanges)) {
      if (v) {
        const sName = SPONSOR_CATALOG_V5[k as SponsorFactionIdV5]?.shortName ?? k;
        badges.push(`${sName} ${v > 0 ? '+' : ''}${v}`);
      }
    }
    if (res.bankrollDeltaUsd !== 0) {
      badges.push(
        res.bankrollDeltaUsd > 0
          ? `+${formatBankrollUsd(res.bankrollDeltaUsd)}`
          : formatBankrollUsd(res.bankrollDeltaUsd),
      );
    }
    if (res.unlockedCharms.length > 0) {
      badges.push('Lucky Charm Unlocked');
    }
    if (badges.length > 0) return badges;
  }

  // Fallback directly from the choice spec when no engine resolver is wired
  const meta = getChoiceAttitudeTag(choice.attitude);
  badges.push(meta.badge);
  if (choice.rivalAffinityDelta !== 0) {
    badges.push(
      choice.rivalAffinityDelta > 0
        ? `+${choice.rivalAffinityDelta} Rival Affinity`
        : `${choice.rivalAffinityDelta} Rival Tension`,
    );
  }
  if (choice.sponsorRepDelta) {
    for (const [k, v] of Object.entries(choice.sponsorRepDelta)) {
      if (v) {
        const sName = SPONSOR_CATALOG_V5[k as SponsorFactionIdV5]?.shortName ?? k;
        badges.push(`${sName} ${v > 0 ? '+' : ''}${v}`);
      }
    }
  }
  return badges.slice(0, 3);
}

// ============================================================================
// SELF-CONTAINED SCOPED STYLES (MATCHING `mockup_v5_story_scene_1795482537341.jpg`)
// ZERO glass blur filters, ZERO dark-blue SaaS boxes, ZERO clipping!
// ============================================================================

function ensureTheaterStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(THEATER_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = THEATER_STYLE_ID;
  style.textContent = `
    .v5-story-theater {
      position: fixed;
      inset: 0;
      z-index: 48;
      width: 100%;
      height: 100dvh;
      max-height: 100dvh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #140b06;
      color: #fff6e6;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      box-sizing: border-box;
    }

    .v5-story-theater *,
    .v5-story-theater *::before,
    .v5-story-theater *::after {
      box-sizing: border-box;
    }

    /* Full-bleed painted stage backdrop + warm golden stage vignette */
    .v5-theater-backdrop-layer {
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .v5-theater-backdrop-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 26%;
      display: block;
      transform: scale(1.02);
      transition: opacity 320ms ease;
    }

    .v5-theater-vignette {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 75% 44% at 50% 8%, rgba(255, 210, 120, 0.28) 0%, rgba(255, 180, 82, 0.06) 44%, transparent 72%),
        linear-gradient(180deg, rgba(16, 8, 4, 0.44) 0%, rgba(16, 8, 4, 0.06) 24%, rgba(18, 9, 5, 0.36) 62%, rgba(12, 6, 3, 0.90) 100%);
    }

    /* Main foreground theatrical stage layout */
    .v5-theater-shell {
      position: relative;
      z-index: 2;
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
      max-width: 980px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      padding: max(6px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
      overflow: hidden;
    }

    /* Top HUD rail with Venue Brass Plaque + 1-tap Fullscreen latch */
    .v5-theater-topbar {
      flex: 0 0 auto;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      min-height: 44px;
      z-index: 8;
    }

    .v5-theater-top-left {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 5px;
      justify-content: flex-start;
    }

    .v5-theater-top-right {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: flex-end;
    }

    /* Sculpted Venue Crest matching OAKRIDGE HALL plaque in mockup */
    .v5-theater-venue-crest {
      position: relative;
      flex: 1 1 0;
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .v5-venue-finial {
      width: 34px;
      height: 18px;
      margin-bottom: -4px;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, #4b2a14 0%, #2a1408 100%);
      border: 1.5px solid #e1ae46;
      border-bottom: none;
      border-radius: 14px 14px 0 0;
      box-shadow: 0 -2px 10px rgba(255, 206, 108, 0.25);
    }

    .v5-venue-brain-svg {
      width: 22px;
      height: 14px;
      display: block;
    }

    .v5-venue-plaque {
      padding: 4px 16px;
      background: linear-gradient(180deg, #5c371c 0%, #3a200e 55%, #241106 100%);
      border: 2px solid #dfaa44;
      border-radius: 5px;
      box-shadow:
        inset 0 1px 0 rgba(255, 241, 190, 0.55),
        inset 0 -1px 0 rgba(48, 22, 6, 0.85),
        0 4px 12px rgba(0, 0, 0, 0.6);
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: clamp(11px, 2.8vw, 15px);
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: #f8e2a9;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 410px) {
      .v5-beat-pips {
        display: none;
      }
      .v5-venue-plaque {
        padding: 4px 10px;
        font-size: 10.5px;
      }
    }

    /* Sculpted brushed-brass HUD latches */
    .v5-theater-brass-btn {
      appearance: none;
      border: 1.5px solid #e5b752;
      border-radius: 6px;
      background: linear-gradient(180deg, #4e2b15 0%, #2d1609 55%, #1d0d04 100%);
      color: #fae6b1;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      min-height: 36px;
      min-width: 36px;
      padding: 0 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      cursor: pointer;
      box-shadow:
        inset 0 1px 0 rgba(255, 244, 196, 0.45),
        0 3px 10px rgba(0, 0, 0, 0.55);
      transition: transform 110ms ease, filter 130ms ease, border-color 130ms ease;
    }

    .v5-theater-brass-btn:hover {
      filter: brightness(1.14);
      border-color: #fff0b3;
    }

    .v5-theater-brass-btn:active {
      transform: translateY(1px) scale(0.96);
    }

    .v5-theater-brass-btn.is-icon-only {
      padding: 0;
      width: 38px;
      height: 38px;
    }

    .v5-hud-icon-svg {
      width: 17px;
      height: 17px;
      display: block;
    }

    .v5-beat-pips {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .v5-beat-pip {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(240, 200, 118, 0.28);
      border: 1px solid rgba(240, 200, 118, 0.52);
      transition: transform 180ms ease, background 180ms ease;
    }

    .v5-beat-pip.is-done {
      background: #c89132;
    }

    .v5-beat-pip.is-current {
      background: #ffe99c;
      transform: scale(1.28);
      box-shadow: 0 0 8px rgba(255, 224, 132, 0.85);
    }

    /* Main Content Stage: Portrait stacks Actors top / Dialog+Choices bottom */
    .v5-theater-stage {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      position: relative;
      overflow: hidden;
    }

    /* Waist-up transparent-alpha cast cutouts */
    .v5-theater-actors {
      flex: 1 1 auto;
      min-height: 185px;
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 0;
      margin-bottom: -24px;
      z-index: 2;
      pointer-events: none;
      overflow: hidden;
    }

    .v5-actor-slot {
      flex: 0 1 54%;
      height: 100%;
      max-height: 430px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      position: relative;
      transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), filter 240ms ease, opacity 240ms ease;
      transform-origin: bottom center;
      will-change: transform;
    }

    .v5-actor-slot.is-left {
      margin-right: -4%;
    }

    .v5-actor-slot.is-right {
      margin-left: -4%;
    }

    .v5-actor-slot.is-speaking {
      z-index: 4;
      transform: translateY(-3px) scale(1.035);
      filter: brightness(1.06) drop-shadow(0 0 16px rgba(255, 206, 108, 0.32)) drop-shadow(0 12px 24px rgba(0, 0, 0, 0.72));
    }

    .v5-actor-slot.is-listening {
      z-index: 2;
      transform: translateY(4px) scale(0.965);
      filter: brightness(0.80) saturate(0.90) drop-shadow(0 10px 18px rgba(0, 0, 0, 0.65));
    }

    .v5-actor-slot.is-neutral {
      z-index: 3;
      transform: scale(1);
      filter: brightness(0.96) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.68));
    }

    .v5-actor-img {
      max-height: 100%;
      max-width: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      object-position: bottom center;
      display: block;
      animation: v5ActorBreathe 4.6s ease-in-out infinite;
    }

    .v5-actor-slot.is-right .v5-actor-img {
      animation-delay: -2.1s;
    }

    .v5-intercom-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-bottom: 44px;
    }

    .v5-intercom-svg {
      width: clamp(86px, 22vw, 126px);
      height: clamp(86px, 22vw, 126px);
      display: block;
      filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.65));
    }

    .v5-intercom-caption {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #f8e2a4;
      background: linear-gradient(180deg, #4b2814 0%, #271207 100%);
      border: 1px solid #d9a43b;
      border-radius: 4px;
      padding: 2px 10px;
    }

    @keyframes v5ActorBreathe {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }

    /* Dialog + Choices Lower Column */
    .v5-theater-dialogue-col {
      flex: 0 0 auto;
      position: relative;
      z-index: 6;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
    }

    /* Live Choice Outcome Toast Ribbon */
    .v5-consequence-strip {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      min-height: 0;
      margin-bottom: 12px;
      animation: v5RibbonPop 240ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .v5-consequence-tag {
      padding: 3px 11px;
      border-radius: 999px;
      background: linear-gradient(180deg, #165e41 0%, #0a3624 100%);
      border: 1.5px solid #e6b956;
      color: #fff4d1;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.55);
    }

    .v5-consequence-tag.is-grudge {
      background: linear-gradient(180deg, #7e221b 0%, #4b100b 100%);
      border-color: #f59c4d;
    }

    @keyframes v5RibbonPop {
      from { opacity: 0; transform: translateY(6px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Sculpted Mahogany-and-Brass Speech Banner matching mockup */
    .v5-speech-wrap {
      position: relative;
      padding-top: 22px;
      cursor: pointer;
    }

    .v5-speech-tail-mount {
      position: absolute;
      top: -16px;
      left: 20%;
      width: 44px;
      height: 30px;
      z-index: 8;
      pointer-events: none;
      transition: left 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease;
    }

    .v5-speech-tail-mount.is-tail-right {
      left: 66%;
    }

    .v5-speech-tail-mount.is-tail-hidden {
      opacity: 0;
    }

    .v5-speech-tail-svg {
      width: 100%;
      height: 100%;
      display: block;
      filter: drop-shadow(0 -2px 5px rgba(0, 0, 0, 0.55));
    }

    .v5-speech-nameplate {
      position: absolute;
      top: 7px;
      left: 14px;
      z-index: 9;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      max-width: calc(100% - 28px);
      padding: 4px 12px 4px 14px;
      background: linear-gradient(180deg, #54321c 0%, #341c0d 55%, #231106 100%);
      border: 2px solid #e7b855;
      border-radius: 18px 8px 18px 8px;
      box-shadow:
        inset 0 1px 0 rgba(255, 245, 200, 0.6),
        0 4px 12px rgba(0, 0, 0, 0.68);
    }

    .v5-speech-speaker-name {
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 800;
      font-size: clamp(11.5px, 3vw, 14px);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #fff2cf;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .v5-speech-cue-tag {
      padding: 1px 7px;
      border-radius: 4px;
      background: #14543b;
      border: 1px solid #d9ab48;
      color: #ffe8a1;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .v5-speech-cue-tag.is-warning {
      background: #7c1f16;
      border-color: #f39d4e;
    }

    .v5-voice-wave-btn {
      appearance: none;
      border: none;
      background: transparent;
      padding: 2px;
      margin: -2px 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
      transition: transform 120ms ease, filter 120ms ease;
    }

    .v5-voice-wave-btn:hover {
      transform: scale(1.12);
      filter: brightness(1.18);
    }

    .v5-voice-wave-svg {
      width: 22px;
      height: 18px;
      display: block;
    }

    .v5-voice-wave-btn.is-playing .v5-wave-arc-1 {
      animation: v5WavePulse 650ms ease-in-out infinite;
    }
    .v5-voice-wave-btn.is-playing .v5-wave-arc-2 {
      animation: v5WavePulse 650ms ease-in-out 130ms infinite;
    }
    .v5-voice-wave-btn.is-playing .v5-wave-arc-3 {
      animation: v5WavePulse 650ms ease-in-out 260ms infinite;
    }

    @keyframes v5WavePulse {
      0%, 100% { opacity: 0.35; }
      50% { opacity: 1; }
    }

    /* Angled sculpted double-brass + mahogany banner */
    .v5-speech-brass-frame {
      position: relative;
      padding: 3px;
      background: linear-gradient(155deg, #fff1ba 0%, #e1ab43 32%, #9a6419 68%, #f0c96c 100%);
      clip-path: polygon(1.6% 0%, 100% 0%, 98.2% 100%, 0% 100%);
      border-radius: 10px;
      filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.72));
    }

    .v5-speech-mahogany-body {
      position: relative;
      padding: 20px 20px 16px 22px;
      clip-path: polygon(1.5% 0%, 100% 0%, 98.3% 100%, 0% 100%);
      border-radius: 8px;
      background:
        repeating-linear-gradient(
          -2deg,
          rgba(255, 200, 140, 0.025) 0px,
          rgba(255, 200, 140, 0.025) 2px,
          transparent 2px,
          transparent 8px
        ),
        linear-gradient(180deg, #4b2416 0%, #37190e 52%, #240f08 100%);
      box-shadow:
        inset 0 2px 0 rgba(255, 224, 152, 0.22),
        inset 0 -3px 8px rgba(0, 0, 0, 0.55);
    }

    .v5-speech-text {
      margin: 0;
      font-size: clamp(16px, 4.3vw, 21px);
      line-height: 1.33;
      font-weight: 500;
      color: #fff6e8;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.75);
      letter-spacing: 0.005em;
      overflow-wrap: break-word;
    }

    .v5-speech-advance-row {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .v5-speech-tap-hint {
      font-size: 11px;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #d9b677;
      opacity: 0.85;
    }

    .v5-speech-next-btn {
      appearance: none;
      border: 2px solid #f4cc6c;
      border-radius: 6px;
      background: linear-gradient(180deg, #177b52 0%, #0c5538 55%, #073924 100%);
      color: #fff7df;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      min-height: 44px;
      padding: 0 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      cursor: pointer;
      box-shadow:
        inset 0 1px 0 rgba(255, 248, 204, 0.5),
        0 5px 14px rgba(0, 0, 0, 0.55);
      transition: transform 110ms ease, filter 130ms ease;
    }

    .v5-speech-next-btn:hover {
      filter: brightness(1.12);
    }

    .v5-speech-next-btn:active {
      transform: translateY(1px) scale(0.97);
    }

    .v5-next-chevron-svg {
      width: 14px;
      height: 14px;
      display: block;
    }

    /* 3 Jewel-Tipped Beveled Choice Blades matching mockup */
    .v5-choice-deck {
      display: flex;
      flex-direction: column;
      gap: 9px;
      width: 100%;
    }

    .v5-choice-blade {
      appearance: none;
      border: none;
      background: transparent;
      padding: 0;
      margin: 0;
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      text-align: left;
      cursor: pointer;
      min-height: 62px;
      transition: transform 130ms cubic-bezier(0.22, 1, 0.36, 1), filter 130ms ease;
      filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.65));
    }

    .v5-choice-blade:hover {
      transform: translateX(3px) scale(1.01);
      filter: brightness(1.10) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.72));
    }

    .v5-choice-blade:active {
      transform: translateY(1px) scale(0.985);
    }

    .v5-choice-blade:focus-visible {
      outline: 2px solid #ffe99c;
      outline-offset: 2px;
    }

    .v5-choice-gem-wrap {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 52px;
      z-index: 4;
      pointer-events: none;
      filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.65));
    }

    .v5-choice-gem-svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .v5-choice-bezel {
      width: calc(100% - 18px);
      margin-left: 18px;
      padding: 2.5px;
      background: linear-gradient(180deg, #fff0b6 0%, #e0ab41 38%, #986318 76%, #f0c76a 100%);
      clip-path: polygon(14px 0%, calc(100% - 16px) 0%, 100% 50%, calc(100% - 16px) 100%, 14px 100%, 0% 50%);
    }

    .v5-choice-core {
      width: 100%;
      min-height: 56px;
      padding: 8px 18px 8px 34px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      clip-path: polygon(13px 0%, calc(100% - 15px) 0%, 100% 50%, calc(100% - 15px) 100%, 13px 100%, 0% 50%);
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.24),
        inset 0 -3px 6px rgba(0, 0, 0, 0.42);
    }

    /* Exact 3 Jewel Enamel Gradients from mockup_v5_story_scene */
    .v5-choice-blade.is-bold-gold .v5-choice-core {
      background: linear-gradient(180deg, #a67123 0%, #7d4c14 52%, #55300a 100%);
    }

    .v5-choice-blade.is-respect-emerald .v5-choice-core {
      background: linear-gradient(180deg, #1b8155 0%, #0f5f3d 52%, #073d27 100%);
    }

    .v5-choice-blade.is-witty-cyan .v5-choice-core {
      background: linear-gradient(180deg, #19839f 0%, #105f77 52%, #093d4f 100%);
    }

    .v5-choice-label {
      font-size: clamp(13.5px, 3.55vw, 16px);
      font-weight: 700;
      line-height: 1.2;
      color: #fffaf0;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    }

    .v5-choice-subline {
      font-size: clamp(11.5px, 3vw, 13px);
      font-weight: 600;
      line-height: 1.2;
      color: #f9e4ad;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
    }

    .v5-choice-blade.is-respect-emerald .v5-choice-subline {
      color: #c8ffe4;
    }

    .v5-choice-blade.is-witty-cyan .v5-choice-subline {
      color: #c9f7ff;
    }

    /* ========================================================================
       COMPACT PHONE PORTRAIT (360x640) — ZERO CLIPPING
       ======================================================================== */
    @media (orientation: portrait) and (max-height: 700px) {
      .v5-theater-shell {
        padding: 4px 10px 8px 10px;
      }
      .v5-theater-topbar {
        min-height: 36px;
      }
      .v5-venue-finial {
        width: 28px;
        height: 14px;
      }
      .v5-venue-plaque {
        padding: 3px 12px;
        font-size: 11px;
      }
      .v5-theater-actors {
        min-height: 120px;
        margin-bottom: -14px;
      }
      .v5-actor-slot {
        max-height: 220px;
      }
      .v5-theater-dialogue-col {
        gap: 6px;
      }
      .v5-speech-wrap {
        padding-top: 18px;
      }
      .v5-speech-tail-mount {
        top: -13px;
        width: 38px;
        height: 25px;
      }
      .v5-speech-nameplate {
        top: 5px;
        padding: 2px 10px 2px 12px;
      }
      .v5-speech-mahogany-body {
        padding: 15px 14px 11px 16px;
      }
      .v5-speech-text {
        font-size: 14.5px;
        line-height: 1.26;
      }
      .v5-choice-deck {
        gap: 6px;
      }
      .v5-choice-blade {
        min-height: 50px;
      }
      .v5-choice-gem-wrap {
        width: 36px;
        height: 44px;
      }
      .v5-choice-core {
        min-height: 46px;
        padding: 6px 16px 6px 28px;
      }
      .v5-choice-label {
        font-size: 13.5px;
      }
      .v5-choice-subline {
        font-size: 11px;
      }
    }

    /* ========================================================================
       PHONE LANDSCAPE (844x390, 932x430, 640x360)
       2-COLUMN BROADCAST SPLIT-STAGE:
       CHARACTERS ON LEFT <-> SPEECH BANNER & 3 CHOICE BLADES ON RIGHT!
       ZERO SCROLLING! ZERO CLIPPING!
       ======================================================================== */
    @media (orientation: landscape) and (max-height: 520px) {
      .v5-theater-shell {
        max-width: 100%;
        padding: 4px max(12px, env(safe-area-inset-right)) 6px max(12px, env(safe-area-inset-left));
      }

      .v5-theater-topbar {
        min-height: 34px;
        gap: 6px;
      }

      .v5-venue-finial {
        display: none;
      }

      .v5-venue-plaque {
        padding: 3px 14px;
        font-size: 11.5px;
        max-width: 42vw;
      }

      .v5-theater-brass-btn {
        min-height: 32px;
        min-width: 32px;
        font-size: 10px;
        padding: 0 8px;
      }

      .v5-theater-brass-btn.is-icon-only {
        width: 34px;
        height: 34px;
      }

      .v5-theater-stage {
        display: grid;
        grid-template-columns: minmax(230px, 41%) minmax(0, 1fr);
        align-items: stretch;
        gap: 12px;
        padding-top: 2px;
      }

      .v5-theater-actors {
        height: 100%;
        min-height: 0;
        margin-bottom: 0;
        align-items: flex-end;
        justify-content: center;
      }

      .v5-actor-slot {
        flex: 0 1 54%;
        max-height: 100%;
      }

      .v5-actor-slot.is-left {
        margin-right: -7%;
      }

      .v5-actor-slot.is-right {
        margin-left: -7%;
      }

      .v5-theater-dialogue-col {
        height: 100%;
        max-width: none;
        margin: 0;
        justify-content: center;
        gap: 6px;
        min-height: 0;
        overflow: hidden;
      }

      .v5-speech-wrap {
        padding-top: 12px;
        padding-left: 14px;
      }

      .v5-speech-tail-mount {
        top: 50%;
        left: -2px !important;
        width: 22px;
        height: 28px;
        transform: translateY(-40%);
      }

      .v5-speech-nameplate {
        top: 0;
        left: 26px;
        padding: 2px 10px 2px 11px;
      }

      .v5-speech-speaker-name {
        font-size: 11px;
      }

      .v5-speech-mahogany-body {
        padding: 13px 15px 10px 18px;
      }

      .v5-speech-text {
        font-size: clamp(13px, 1.75vw, 15.5px);
        line-height: 1.25;
      }

      .v5-speech-advance-row {
        margin-top: 7px;
      }

      .v5-speech-next-btn {
        min-height: 36px;
        font-size: 11.5px;
        padding: 0 15px;
      }

      .v5-choice-deck {
        gap: 5px;
        padding-left: 8px;
      }

      .v5-choice-blade {
        min-height: 45px;
      }

      .v5-choice-gem-wrap {
        width: 34px;
        height: 40px;
      }

      .v5-choice-bezel {
        width: calc(100% - 14px);
        margin-left: 14px;
        padding: 2px;
      }

      .v5-choice-core {
        min-height: 42px;
        padding: 4px 16px 4px 26px;
        gap: 1px;
      }

      .v5-choice-label {
        font-size: clamp(12.5px, 1.65vw, 14.5px);
        line-height: 1.15;
      }

      .v5-choice-subline {
        font-size: 10.5px;
        line-height: 1.15;
      }

      .v5-consequence-tag {
        padding: 2px 9px;
        font-size: 10.5px;
      }
    }

    /* Ultra-short phone landscape (640x360) extra tightening */
    @media (orientation: landscape) and (max-height: 372px) {
      .v5-speech-text {
        font-size: 12.5px;
        line-height: 1.2;
      }
      .v5-choice-blade {
        min-height: 41px;
      }
      .v5-choice-core {
        min-height: 38px;
      }
      .v5-choice-label {
        font-size: 12px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .v5-actor-img,
      .v5-voice-wave-btn.is-playing .v5-wave-arc {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// VOICED STORY THEATER VIEW CONTROLLER
// ============================================================================

export class VoicedStoryTheaterView {
  private readonly hostEl: HTMLElement;
  private rootEl: HTMLElement | null = null;
  private currentScene: InteractiveStorySceneV5 | null = null;
  private callbacks: VoicedStoryTheaterCallbacksV5 = {};
  private entries: ActiveDialogueEntry[] = [];
  private entryIndex = 0;
  private chosenChoice: StoryChoiceConsequenceV5 | null = null;
  private outcomeBadges: string[] = [];
  private isPlayingVoice = false;
  private voicePollTimer: number | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private fullscreenChangeHandler: (() => void) | null = null;
  private resizeHandler: (() => void) | null = null;

  constructor(hostEl: HTMLElement) {
    this.hostEl = hostEl;
    ensureTheaterStyles();
  }

  public showScene(
    scene: InteractiveStorySceneV5,
    callbacks: VoicedStoryTheaterCallbacksV5 = {},
  ): void {
    this.stopVoicePlayback();
    this.currentScene = scene;
    this.callbacks = callbacks;
    this.chosenChoice = null;
    this.outcomeBadges = [];

    const hasChoices = Boolean(scene.choices && scene.choices.length > 0);
    const baseBeats = scene.beats.length > 0 ? scene.beats : [];

    this.entries = baseBeats.map((beat, idx) => ({
      ...beat,
      isChoicePromptBeat: hasChoices && idx === baseBeats.length - 1,
    }));

    if (this.entries.length === 0) {
      this.entries = [
        {
          speaker: 'max_sterling',
          speakerName: 'Max Sterling',
          speakerRole: 'Prime-Time Host',
          text: scene.title,
          hostPose: 'welcome',
          isChoicePromptBeat: hasChoices,
        },
      ];
    }

    this.entryIndex = 0;
    this.mountRoot();
    this.renderCurrentState();
    this.playCurrentBeatVoice();
    this.callbacks.voiceBridge?.playSfx?.('cutscene_whoosh');
  }

  public isMounted(): boolean {
    return this.rootEl !== null && this.rootEl.isConnected;
  }

  public unmount(): void {
    this.stopVoicePlayback();
    this.unbindGlobalListeners();
    if (this.rootEl && this.rootEl.parentElement) {
      this.rootEl.parentElement.removeChild(this.rootEl);
    }
    this.rootEl = null;
    this.currentScene = null;
  }

  public dispose(): void {
    this.unmount();
  }

  private mountRoot(): void {
    if (!this.rootEl) {
      const el = document.createElement('section');
      el.className = 'v5-story-theater';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', this.currentScene?.title ?? 'Interactive Story Scene');
      this.hostEl.appendChild(el);
      this.rootEl = el;
      this.bindGlobalListeners();
    }
  }

  private bindGlobalListeners(): void {
    this.unbindGlobalListeners();

    this.keydownHandler = (e: KeyboardEvent) => {
      if (!this.isMounted() || !this.currentScene) return;
      const entry = this.entries[this.entryIndex];
      const showingChoices = Boolean(
        entry?.isChoicePromptBeat && !this.chosenChoice && this.currentScene.choices?.length,
      );

      if (showingChoices && this.currentScene.choices) {
        if (e.key === '1' && this.currentScene.choices[0]) {
          e.preventDefault();
          this.handleChoiceSelect(0);
          return;
        }
        if (e.key === '2' && this.currentScene.choices[1]) {
          e.preventDefault();
          this.handleChoiceSelect(1);
          return;
        }
        if (e.key === '3' && this.currentScene.choices[2]) {
          e.preventDefault();
          this.handleChoiceSelect(2);
          return;
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleAdvance();
      } else if (e.key === 'Escape' && this.callbacks.allowSkip !== false) {
        e.preventDefault();
        this.handleSkip();
      }
    };

    this.fullscreenChangeHandler = () => {
      this.updateFullscreenButtonVisual();
    };

    this.resizeHandler = () => {
      if (this.isMounted()) {
        this.updateTailDirectionForViewport();
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
    window.addEventListener('resize', this.resizeHandler);
  }

  private unbindGlobalListeners(): void {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.fullscreenChangeHandler) {
      document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
      this.fullscreenChangeHandler = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  private isCompactLandscapeViewport(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth > window.innerHeight && window.innerHeight <= 520;
  }

  private getCurrentBackdropUrl(): string {
    const entry = this.entries[this.entryIndex];
    if (entry?.backdropUrl) return entry.backdropUrl;
    if (this.currentScene?.backdropUrl) return this.currentScene.backdropUrl;
    return V5_VENUE_STAGES[1];
  }

  private getFeaturedChallengerId(): ChallengerIdV5 | null {
    const entry = this.entries[this.entryIndex];
    if (entry && isChallengerSpeaker(entry.speaker)) {
      return entry.speaker;
    }
    return this.currentScene?.featuredChallengerId ?? null;
  }

  private getCurrentTailDirection(): 'up-left' | 'up-right' | 'left' | 'hidden' {
    const entry = this.entries[this.entryIndex];
    if (!entry || entry.speaker === 'narrator') return 'hidden';
    if (this.isCompactLandscapeViewport()) return 'left';
    if (entry.speaker === 'max_sterling') return 'up-right';
    return 'up-left';
  }

  private updateTailDirectionForViewport(): void {
    const mount = this.rootEl?.querySelector<HTMLElement>('.v5-speech-tail-mount');
    if (!mount) return;
    const dir = this.getCurrentTailDirection();
    mount.classList.toggle('is-tail-right', dir === 'up-right');
    mount.classList.toggle('is-tail-hidden', dir === 'hidden');
    if (dir !== 'hidden') {
      mount.innerHTML = renderSpeechTailSvg(dir);
    }
  }

  private updateFullscreenButtonVisual(): void {
    const btn = this.rootEl?.querySelector<HTMLButtonElement>('[data-v5-fullscreen-toggle]');
    if (!btn) return;
    const isFs = Boolean(document.fullscreenElement);
    btn.setAttribute('aria-pressed', isFs ? 'true' : 'false');
    btn.setAttribute('title', isFs ? 'Exit Fullscreen' : 'Enter Fullscreen');
    btn.innerHTML = renderFullscreenIconSvg(isFs);
  }

  private async handleToggleFullscreen(): Promise<void> {
    this.callbacks.voiceBridge?.playSfx?.('ui_tap');
    if (typeof this.callbacks.onToggleFullscreen === 'function') {
      await this.callbacks.onToggleFullscreen();
      this.updateFullscreenButtonVisual();
      return;
    }
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (typeof document.documentElement.requestFullscreen === 'function') {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Headless or browser gesture restriction — stay clean
    }
    this.updateFullscreenButtonVisual();
  }

  private stopVoicePlayback(): void {
    if (this.voicePollTimer !== null) {
      window.clearInterval(this.voicePollTimer);
      this.voicePollTimer = null;
    }
    this.isPlayingVoice = false;
    this.callbacks.voiceBridge?.stopVoice?.();
    this.syncVoiceWaveformVisual();
  }

  private syncVoiceWaveformVisual(): void {
    const btn = this.rootEl?.querySelector<HTMLButtonElement>('.v5-voice-wave-btn');
    if (!btn) return;
    btn.classList.toggle('is-playing', this.isPlayingVoice);
  }

  private async playCurrentBeatVoice(): Promise<void> {
    this.stopVoicePlayback();
    const entry = this.entries[this.entryIndex];
    if (!entry?.voiceClipId || !this.callbacks.voiceBridge?.playVoiceClip) return;

    this.isPlayingVoice = true;
    this.syncVoiceWaveformVisual();

    try {
      const started = await this.callbacks.voiceBridge.playVoiceClip(entry.voiceClipId, entry.text);
      if (!started) {
        this.isPlayingVoice = false;
        this.syncVoiceWaveformVisual();
        return;
      }
      if (typeof this.callbacks.voiceBridge.isVoicePlaying === 'function') {
        this.voicePollTimer = window.setInterval(() => {
          const active = this.callbacks.voiceBridge?.isVoicePlaying?.() ?? false;
          if (!active) {
            this.isPlayingVoice = false;
            if (this.voicePollTimer !== null) {
              window.clearInterval(this.voicePollTimer);
              this.voicePollTimer = null;
            }
            this.syncVoiceWaveformVisual();
          }
        }, 180);
      } else {
        // Fallback pulse duration proportional to text length when bridge lacks `isVoicePlaying`
        const estMs = Math.max(1800, Math.min(6000, entry.text.length * 42));
        this.voicePollTimer = window.setTimeout(() => {
          this.isPlayingVoice = false;
          this.voicePollTimer = null;
          this.syncVoiceWaveformVisual();
        }, estMs);
      }
    } catch {
      this.isPlayingVoice = false;
      this.syncVoiceWaveformVisual();
    }
  }

  private handleChoiceSelect(choiceIdx: number): void {
    if (!this.currentScene?.choices || this.chosenChoice) return;
    const choice = this.currentScene.choices[choiceIdx];
    if (!choice) return;

    this.stopVoicePlayback();
    this.callbacks.voiceBridge?.playSfx?.('switch_clack');
    this.chosenChoice = choice;

    const feedback = this.callbacks.onChoiceSelected?.(choice, this.currentScene);
    this.outcomeBadges = extractOutcomeBadges(feedback, choice);

    const challengerId = this.getFeaturedChallengerId();
    const rivalMeta = challengerId ? RIVAL_PROFILES_V5[challengerId] : null;
    const replyEntries: ActiveDialogueEntry[] = [];

    if (choice.rivalReplyText) {
      replyEntries.push({
        speaker: challengerId ?? 'max_sterling',
        speakerName: rivalMeta?.displayName ?? 'Max Sterling',
        speakerRole: rivalMeta?.nicknameTitle,
        text: choice.rivalReplyText,
        voiceClipId: choice.rivalReplyVoiceId,
        hostPose: choice.rivalAffinityDelta >= 0 ? 'hype' : 'wince',
        backdropUrl: this.getCurrentBackdropUrl(),
      });
    }

    if (choice.hostReplyText) {
      replyEntries.push({
        speaker: 'max_sterling',
        speakerName: 'Max Sterling',
        speakerRole: 'Prime-Time Host',
        text: choice.hostReplyText,
        voiceClipId: choice.hostReplyVoiceId,
        hostPose: 'hype',
        backdropUrl: this.getCurrentBackdropUrl(),
      });
    }

    if (this.currentScene.closingBeats?.length) {
      for (const closing of this.currentScene.closingBeats) {
        replyEntries.push({ ...closing });
      }
    }

    if (replyEntries.length === 0) {
      this.finishScene(false);
      return;
    }

    this.entries = [...this.entries.slice(0, this.entryIndex + 1), ...replyEntries];
    this.entryIndex += 1;
    this.renderCurrentState();
    this.playCurrentBeatVoice();
  }

  private handleAdvance(): void {
    if (!this.currentScene) return;
    const entry = this.entries[this.entryIndex];
    const awaitingChoice = Boolean(
      entry?.isChoicePromptBeat && !this.chosenChoice && this.currentScene.choices?.length,
    );
    if (awaitingChoice) return;

    this.callbacks.voiceBridge?.playSfx?.('ui_tap');

    if (this.entryIndex < this.entries.length - 1) {
      this.entryIndex += 1;
      this.renderCurrentState();
      this.playCurrentBeatVoice();
      return;
    }

    // Check if there were closingBeats on a choice-less scene
    const hasUnappendedClosing =
      !this.chosenChoice &&
      (!this.currentScene.choices || this.currentScene.choices.length === 0) &&
      Boolean(this.currentScene.closingBeats?.length) &&
      this.entries.length === this.currentScene.beats.length;

    if (hasUnappendedClosing && this.currentScene.closingBeats) {
      this.entries = [...this.entries, ...this.currentScene.closingBeats.map((b) => ({ ...b }))];
      this.entryIndex += 1;
      this.renderCurrentState();
      this.playCurrentBeatVoice();
      return;
    }

    this.finishScene(false);
  }

  private handleSkip(): void {
    if (!this.currentScene) return;
    this.callbacks.voiceBridge?.playSfx?.('ui_tap');
    this.callbacks.onSkipScene?.(this.currentScene);
    this.finishScene(true);
  }

  private finishScene(skipped: boolean): void {
    const scene = this.currentScene;
    const choice = this.chosenChoice;
    this.stopVoicePlayback();
    this.unmount();
    if (scene) {
      this.callbacks.onSceneComplete?.({
        sceneId: scene.sceneId,
        sceneKind: scene.kind,
        chosenChoice: choice,
        skipped,
      });
    }
  }

  private renderCurrentState(): void {
    if (!this.rootEl || !this.currentScene) return;

    const scene = this.currentScene;
    const entry = this.entries[this.entryIndex];
    const backdropUrl = this.getCurrentBackdropUrl();
    const challengerId = this.getFeaturedChallengerId();
    const hostPortrait = getHostPortraitUrl(entry.hostPose);
    const tailDir = this.getCurrentTailDirection();

    const showingChoices = Boolean(
      entry.isChoicePromptBeat && !this.chosenChoice && scene.choices && scene.choices.length > 0,
    );
    const isFinalBeat =
      !showingChoices &&
      this.entryIndex >= this.entries.length - 1 &&
      (this.chosenChoice !== null ||
        !scene.closingBeats?.length ||
        this.entries.length > scene.beats.length);

    const nextBtnLabel = isFinalBeat
      ? this.callbacks.continueButtonLabel ??
        (scene.kind === 'STAGE_WALKOUT' || scene.kind === 'COLD_OPEN'
          ? 'STEP ON STAGE'
          : scene.kind === 'ENDING'
            ? 'CLAIM CROWN'
            : 'CONTINUE')
      : 'NEXT';

    const leftActorState =
      entry.speaker === 'narrator'
        ? 'is-neutral'
        : entry.speaker === 'max_sterling'
          ? 'is-listening'
          : 'is-speaking';

    const rightActorState =
      entry.speaker === 'narrator'
        ? 'is-neutral'
        : entry.speaker === 'max_sterling'
          ? 'is-speaking'
          : 'is-listening';

    const leftActorHtml = challengerId
      ? `
        <div class="v5-actor-slot is-left ${leftActorState}">
          <img
            class="v5-actor-img"
            src="${escapeHtml(V5_CAST_CUTOUTS.challengers[challengerId])}"
            alt="${escapeHtml(RIVAL_PROFILES_V5[challengerId]?.displayName ?? 'Challenger')}"
            draggable="false"
          />
        </div>
      `
      : entry.speaker === 'producer_sam'
        ? `
        <div class="v5-actor-slot is-left is-speaking">
          <div class="v5-intercom-badge">
            ${renderProducerIntercomSvg()}
            <span class="v5-intercom-caption">PRODUCER SAM · LIVE COMMS</span>
          </div>
        </div>
      `
        : '';

    const specialCueRole =
      entry.speakerRole &&
      /(STAGE|BOARD TWIST|PODIUM|SABOTAGE|GRUDGE|ALLY|SPONSORS|OVERWORLD|LOADOUT|COMBO|CHAIN)/.test(
        entry.speakerRole.toUpperCase(),
      )
        ? entry.speakerRole
        : '';

    const isWarningCue = /GRUDGE|SABOTAGE/.test(specialCueRole.toUpperCase());

    const pipsHtml = this.entries
      .map((_, idx) => {
        const cls = idx < this.entryIndex ? 'is-done' : idx === this.entryIndex ? 'is-current' : '';
        return `<span class="v5-beat-pip ${cls}" aria-hidden="true"></span>`;
      })
      .join('');

    const outcomeHtml =
      this.outcomeBadges.length > 0
        ? `
          <div class="v5-consequence-strip" aria-live="polite">
            ${this.outcomeBadges
              .map((tag) => {
                const grudgeCls = /grudge|sabotage|tension|-\d+/i.test(tag) ? 'is-grudge' : '';
                return `<span class="v5-consequence-tag ${grudgeCls}">${escapeHtml(tag)}</span>`;
              })
              .join('')}
          </div>
        `
        : '';

    const choicesHtml =
      showingChoices && scene.choices
        ? `
          <div class="v5-choice-deck" role="group" aria-label="Dialogue Choices">
            ${scene.choices
              .slice(0, 3)
              .map((choice, idx) => {
                const meta = getChoiceAttitudeTag(choice.attitude);
                const subline = formatChoiceConsequenceSubline(choice);
                return `
                  <button
                    type="button"
                    class="v5-choice-blade ${meta.variantClass}"
                    data-v5-choice-idx="${idx}"
                    data-v5-attitude="${choice.attitude}"
                  >
                    <span class="v5-choice-gem-wrap" aria-hidden="true">
                      ${renderDiamondGemSvg(choice.attitude, idx)}
                    </span>
                    <span class="v5-choice-bezel">
                      <span class="v5-choice-core">
                        <span class="v5-choice-label">${escapeHtml(choice.label)}</span>
                        <span class="v5-choice-subline">${escapeHtml(subline)}</span>
                      </span>
                    </span>
                  </button>
                `;
              })
              .join('')}
          </div>
        `
        : '';

    const advanceRowHtml = showingChoices
      ? ''
      : `
        <div class="v5-speech-advance-row">
          <span class="v5-speech-tap-hint">${isFinalBeat ? 'Ready for curtain up' : 'Tap banner to continue'}</span>
          <button type="button" class="v5-speech-next-btn" data-v5-story-next>
            <span>${escapeHtml(nextBtnLabel)}</span>
            ${renderChevronRightSvg()}
          </button>
        </div>
      `;

    const isFs = typeof document !== 'undefined' && Boolean(document.fullscreenElement);

    this.rootEl.innerHTML = `
      <div class="v5-theater-backdrop-layer" aria-hidden="true">
        <img class="v5-theater-backdrop-img" src="${escapeHtml(backdropUrl)}" alt="" draggable="false" />
        <div class="v5-theater-vignette"></div>
      </div>

      <div class="v5-theater-shell">
        <header class="v5-theater-topbar">
          <div class="v5-theater-top-left">
            ${
              this.callbacks.allowSkip !== false
                ? `
                  <button type="button" class="v5-theater-brass-btn" data-v5-story-skip aria-label="Skip Scene">
                    ${renderSkipIconSvg()}
                    <span>Skip</span>
                  </button>
                `
                : ''
            }
            <div class="v5-beat-pips" aria-label="Scene progress ${this.entryIndex + 1} of ${this.entries.length}">
              ${pipsHtml}
            </div>
          </div>

          <div class="v5-theater-venue-crest">
            <div class="v5-venue-finial" aria-hidden="true">
              ${renderVenueBrainCrestSvg()}
            </div>
            <div class="v5-venue-plaque">${escapeHtml(scene.locationSubhead || scene.title)}</div>
          </div>

          <div class="v5-theater-top-right">
            <button
              type="button"
              class="v5-theater-brass-btn is-icon-only"
              data-v5-fullscreen-toggle
              aria-label="Toggle Fullscreen"
              aria-pressed="${isFs ? 'true' : 'false'}"
              title="${isFs ? 'Exit Fullscreen' : 'Enter Fullscreen'}"
            >
              ${renderFullscreenIconSvg(isFs)}
            </button>
          </div>
        </header>

        <div class="v5-theater-stage">
          <div class="v5-theater-actors" aria-hidden="true">
            ${leftActorHtml}
            <div class="v5-actor-slot is-right ${rightActorState}">
              <img
                class="v5-actor-img"
                src="${escapeHtml(hostPortrait)}"
                alt="Host Max Sterling"
                draggable="false"
              />
            </div>
          </div>

          <div class="v5-theater-dialogue-col">
            ${outcomeHtml}

            <div class="v5-speech-wrap" data-v5-speech-banner>
              <div class="v5-speech-tail-mount ${tailDir === 'up-right' ? 'is-tail-right' : ''} ${tailDir === 'hidden' ? 'is-tail-hidden' : ''}">
                ${tailDir !== 'hidden' ? renderSpeechTailSvg(tailDir) : ''}
              </div>

              <div class="v5-speech-nameplate">
                <span class="v5-speech-speaker-name">${escapeHtml(entry.speakerName)}</span>
                ${
                  specialCueRole
                    ? `<span class="v5-speech-cue-tag ${isWarningCue ? 'is-warning' : ''}">${escapeHtml(specialCueRole)}</span>`
                    : ''
                }
                <button
                  type="button"
                  class="v5-voice-wave-btn ${this.isPlayingVoice ? 'is-playing' : ''}"
                  data-v5-replay-voice
                  aria-label="Replay spoken dialogue"
                  title="Replay voice line"
                >
                  ${renderAudioWaveformSvg()}
                </button>
              </div>

              <div class="v5-speech-brass-frame">
                <div class="v5-speech-mahogany-body">
                  <p class="v5-speech-text">${escapeHtml(entry.text)}</p>
                  ${advanceRowHtml}
                </div>
              </div>
            </div>

            ${choicesHtml}
          </div>
        </div>
      </div>
    `;

    this.bindRenderedDomEvents();
  }

  private bindRenderedDomEvents(): void {
    if (!this.rootEl) return;

    const fsBtn = this.rootEl.querySelector<HTMLButtonElement>('[data-v5-fullscreen-toggle]');
    fsBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      void this.handleToggleFullscreen();
    });

    const skipBtn = this.rootEl.querySelector<HTMLButtonElement>('[data-v5-story-skip]');
    skipBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleSkip();
    });

    const replayBtn = this.rootEl.querySelector<HTMLButtonElement>('[data-v5-replay-voice]');
    replayBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks.voiceBridge?.playSfx?.('ui_tap');
      void this.playCurrentBeatVoice();
    });

    const nextBtn = this.rootEl.querySelector<HTMLButtonElement>('[data-v5-story-next]');
    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleAdvance();
    });

    const bannerEl = this.rootEl.querySelector<HTMLElement>('[data-v5-speech-banner]');
    bannerEl?.addEventListener('click', () => {
      this.handleAdvance();
    });

    const choiceButtons = this.rootEl.querySelectorAll<HTMLButtonElement>('[data-v5-choice-idx]');
    choiceButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(btn.getAttribute('data-v5-choice-idx'));
        if (Number.isInteger(idx)) {
          this.handleChoiceSelect(idx);
        }
      });
    });
  }
}
