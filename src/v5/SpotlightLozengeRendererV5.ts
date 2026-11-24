// ============================================================================
// WORLD'S SMARTEST v5.0 — Spotlight Question Stage Shell & Sculpted Lozenges
// Matches `mockup_v5_question_classic` 1:1:
//  - Center multi-ring brushed-brass SVG Chronometer + winged gold category ribbon
//  - Frameless volumetric spotlight prompt typography + subtle waist-up actors
//  - 4 Pointed hexagonal brass-and-sapphire light-beam lozenges w/ edge wires
//  - CLUE_ESCALATOR wax-sealed envelopes + BREAK NEXT SEAL brass opener
//  - MULTI_STRIKE 6 illuminated brass target plaques + LOCK PICKS plunger
//  - VISUAL_SPOTTER ornate riveted brass monitor frame (diagrams + world map)
//  - mountCustomGadgetBody slot for TactileGadgetRenderersV5 (PINPOINT/MATCH/SORT)
//  - Curved brushed-brass bottom podium (50/50 & CLUE coins + 2x throw-switch)
//  - Sculpted Mahogany & Brass Reveal Banner (100% unclipped before & after!)
// Rules enforced: 0 flat navy boxes, 0 CSS blur filters, 0 OS emojis, 0 H-overflow,
// and surgical-only DOM updates on timer ticks.
// ============================================================================

import {
  WEDGE_CATALOG_V4,
  type AnswerSubmissionV4,
  type EvaluatedAnswerV4,
  type QuestionCardV4,
  type TimerPaceModeV4,
  type WedgeColorId,
} from '../v4/contracts';
import type {
  QuestionClockTickState,
  QuestionRevealPayload,
  QuestionStageCallbacks,
  QuestionStageContext,
} from '../v4/FormatRenderers';
import {
  V5_CAST_CUTOUTS,
  V5_VENUE_STAGES,
  type ChallengerIdV5,
  type HostPoseV5,
  type TierNumberV5,
} from './contracts_v5';

// ============================================================================
// PUBLIC v5 INTERFACES & CUSTOM GADGET SLOT CONTRACTS
// ============================================================================

export interface CustomGadgetHandleV5 {
  readonly revealHint?: (hintText: string) => void;
  readonly showGadgetReveal?: (evaluation: EvaluatedAnswerV4) => void;
  readonly dispose?: () => void;
}

export interface CustomGadgetHostApiV5 {
  readonly card: QuestionCardV4;
  readonly tilePointValue: number;
  readonly submit: (partial: Omit<AnswerSubmissionV4, 'elapsedSec'>) => void;
  readonly emitFeedback: (kind: 'tap' | 'pair' | 'reorder' | 'dial' | 'lock_in') => void;
  readonly isSubmitted: () => boolean;
}

export type CustomGadgetMountFnV5 = (
  container: HTMLElement,
  hostApi: CustomGadgetHostApiV5,
) => CustomGadgetHandleV5 | void;

export interface SpotlightStageContextV5 extends QuestionStageContext {
  readonly tierNumber?: TierNumberV5;
  readonly venueBackdropUrl?: string;
  readonly challengerId?: ChallengerIdV5 | null;
  readonly challengerName?: string;
  readonly hostPose?: HostPoseV5;
  /** Optional diegetic whisper ribbon for Story Cold-Open lessons (2s Read-In, 2x, Clue) */
  readonly coachWhisper?: string | null;
  /** Optional gadget mounter for PINPOINT_DIAL, MATCH_4, SORT_4 */
  readonly customGadgetMounter?: CustomGadgetMountFnV5;
  /** Override lock-in orange suspense duration in ms (default 380ms) */
  readonly lockInSuspenseMs?: number;
  readonly allow5050Override?: boolean;
  readonly allowHintOverride?: boolean;
  readonly allowDoubleDownOverride?: boolean;
}

export type SpotlightStageCallbacksV5 = QuestionStageCallbacks;

export interface SpotlightRevealPayloadV5 extends QuestionRevealPayload {
  readonly hostPoseOverride?: HostPoseV5;
  readonly charmingTagLabel?: string;
}

// ============================================================================
// CONSTANTS & PURE HELPERS
// ============================================================================

const STYLE_ELEMENT_ID = 'v5-spotlight-lozenge-styles';
const CHOICE_LETTERS = ['A', 'B', 'C', 'D'] as const;

// Concentric SVG arc radii inside 120x120 brass chronometer viewBox
const AMBER_ARC_RADIUS = 44;
const CYAN_ARC_RADIUS = 38.5;
const AMBER_ARC_CIRC = 2 * Math.PI * AMBER_ARC_RADIUS;
const CYAN_ARC_CIRC = 2 * Math.PI * CYAN_ARC_RADIUS;

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPoints(pts: number): string {
  return Math.round(pts).toLocaleString('en-US');
}

/**
 * Splits category/witty title cleanly across the Left and Right bevel-pointed
 * golden wings flanking the circular brass chronometer — ZERO pill clusters!
 */
function splitCategoryIntoWings(
  rawTitle: string,
  pointsText: string,
  stakeTag: string | null,
): { leftWing: string; rightWing: string } {
  const clean = rawTitle.trim().replace(/\s+/g, ' ');
  if (stakeTag) {
    return {
      leftWing: clean.toUpperCase(),
      rightWing: `${stakeTag.toUpperCase()} · ${pointsText}`,
    };
  }

  const words = clean.split(' ').filter(Boolean);
  if (words.length >= 3) {
    // Match mockup_v5_question_classic: "COSMIC NEXT-DOOR" | [26s] | "NEIGHBORS · 400 PTS"
    const splitAt = Math.ceil(words.length * 0.6);
    const leftText = words.slice(0, splitAt).join(' ').toUpperCase();
    const rightPrefix = words.slice(splitAt).join(' ').toUpperCase();
    return {
      leftWing: leftText,
      rightWing: `${rightPrefix} · ${pointsText}`,
    };
  }

  return {
    leftWing: clean.toUpperCase() || 'SPOTLIGHT ROUND',
    rightWing: pointsText,
  };
}

// ============================================================================
// STANDALONE HELPER FOR CUSTOM GADGET SLOT MOUNTING
// ============================================================================

/**
 * Standalone helper allowing external modules (`TactileGadgetRenderersV5` or a v5
 * controller) to mount a custom gadget element or callback directly into a stage slot.
 */
export function mountCustomGadgetBody(
  container: HTMLElement,
  content?: HTMLElement | ((slot: HTMLElement) => CustomGadgetHandleV5 | void),
): CustomGadgetHandleV5 | null {
  container.classList.add('v5sl-custom-gadget-slot');
  if (!content) return null;
  container.innerHTML = '';
  if (content instanceof HTMLElement) {
    container.appendChild(content);
    return null;
  }
  const handle = content(container);
  return handle ?? null;
}

// ============================================================================
// BESPOKE INLINE SVG ART GENERATORS (ZERO OS EMOJIS)
// ============================================================================

function renderChronometerSvg(initialReadout: string, initialSubLabel: string): string {
  // Amber arc sweeps clockwise from top (12 o'clock); Cyan arc sweeps counter-complement
  const amberLen = (AMBER_ARC_CIRC * 0.52).toFixed(2);
  const cyanLen = (CYAN_ARC_CIRC * 0.44).toFixed(2);

  return `
    <svg class="v5sl-chrono-svg" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="v5slBrassOuter" x1="12%" y1="4%" x2="88%" y2="96%">
          <stop offset="0%" stop-color="#fff4c4"/>
          <stop offset="22%" stop-color="#dfb252"/>
          <stop offset="50%" stop-color="#7c5517"/>
          <stop offset="76%" stop-color="#e7be62"/>
          <stop offset="100%" stop-color="#603e0d"/>
        </linearGradient>
        <linearGradient id="v5slBrassInner" x1="85%" y1="10%" x2="15%" y2="92%">
          <stop offset="0%" stop-color="#6a4612"/>
          <stop offset="35%" stop-color="#f8dc8c"/>
          <stop offset="68%" stop-color="#a57624"/>
          <stop offset="100%" stop-color="#fff0b5"/>
        </linearGradient>
        <radialGradient id="v5slDialFace" cx="50%" cy="38%" r="64%">
          <stop offset="0%" stop-color="#143269"/>
          <stop offset="62%" stop-color="#09193c"/>
          <stop offset="100%" stop-color="#030a1b"/>
        </radialGradient>
        <linearGradient id="v5slArcAmber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff0a6"/>
          <stop offset="48%" stop-color="#f7b93e"/>
          <stop offset="100%" stop-color="#ea8415"/>
        </linearGradient>
        <linearGradient id="v5slArcCyan" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#33a8ff"/>
          <stop offset="55%" stop-color="#5ae4ff"/>
          <stop offset="100%" stop-color="#b8f7ff"/>
        </linearGradient>
      </defs>

      <!-- Sculpted Multi-Ring Brushed Brass Housing -->
      <circle cx="60" cy="60" r="57" fill="url(#v5slBrassOuter)" stroke="#382307" stroke-width="1.4"/>
      <circle cx="60" cy="60" r="52.5" fill="#18120a" stroke="url(#v5slBrassInner)" stroke-width="2.2"/>
      <circle cx="60" cy="60" r="49" fill="url(#v5slDialFace)"/>

      <!-- Recessed Precision Track Grooves -->
      <circle cx="60" cy="60" r="${AMBER_ARC_RADIUS}" fill="none" stroke="rgba(255, 221, 138, 0.14)" stroke-width="4.2"/>
      <circle cx="60" cy="60" r="${CYAN_ARC_RADIUS}" fill="none" stroke="rgba(88, 210, 255, 0.14)" stroke-width="3.4"/>

      <!-- Glowing Warm Amber Outer Progress Ring (surgical stroke-dashoffset) -->
      <circle
        class="v5sl-chrono-arc-amber"
        data-v5sl-arc-amber
        cx="60"
        cy="60"
        r="${AMBER_ARC_RADIUS}"
        fill="none"
        stroke="url(#v5slArcAmber)"
        stroke-width="4.5"
        stroke-linecap="round"
        stroke-dasharray="${AMBER_ARC_CIRC.toFixed(2)}"
        stroke-dashoffset="${(AMBER_ARC_CIRC - Number(amberLen)).toFixed(2)}"
        transform="rotate(-90 60 60)"
      />

      <!-- Glowing Neon Cyan Inner Complement Ring (surgical stroke-dashoffset) -->
      <circle
        class="v5sl-chrono-arc-cyan"
        data-v5sl-arc-cyan
        cx="60"
        cy="60"
        r="${CYAN_ARC_RADIUS}"
        fill="none"
        stroke="url(#v5slArcCyan)"
        stroke-width="3.6"
        stroke-linecap="round"
        stroke-dasharray="${CYAN_ARC_CIRC.toFixed(2)}"
        stroke-dashoffset="${(CYAN_ARC_CIRC - Number(cyanLen)).toFixed(2)}"
        transform="rotate(95 60 60)"
      />

      <!-- Inner Delicate Gold Hairline Rim -->
      <circle cx="60" cy="60" r="33.2" fill="none" stroke="rgba(244, 207, 114, 0.34)" stroke-width="1"/>
    </svg>
    <div class="v5sl-chrono-center">
      <span class="v5sl-chrono-readout" data-v5sl-clock-readout>${escapeHtml(initialReadout)}</span>
      <span class="v5sl-chrono-sub" data-v5sl-clock-sub>${escapeHtml(initialSubLabel)}</span>
    </div>
  `;
}

function renderDiamondLetterSvg(letter: string): string {
  return `
    <span class="v5sl-diamond-badge" aria-hidden="true">
      <svg class="v5sl-diamond-svg" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="v5slDiaRim_${letter}" x1="12%" y1="6%" x2="88%" y2="94%">
            <stop offset="0%" stop-color="#fff5c8"/>
            <stop offset="35%" stop-color="#dfb14e"/>
            <stop offset="70%" stop-color="#8b5e17"/>
            <stop offset="100%" stop-color="#f2cd72"/>
          </linearGradient>
          <linearGradient id="v5slDiaFace_${letter}" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stop-color="#fce59a"/>
            <stop offset="48%" stop-color="#d8a33a"/>
            <stop offset="100%" stop-color="#9e6d1c"/>
          </linearGradient>
        </defs>
        <!-- Outer Beveled Brass Diamond -->
        <polygon class="v5sl-dia-outer" points="32,2 62,32 32,62 2,32" fill="url(#v5slDiaRim_${letter})" stroke="#382206" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Dark Recessed Trim Channel -->
        <polygon class="v5sl-dia-channel" points="32,7 57,32 32,57 7,32" fill="#1b1207"/>
        <!-- Inner Radiant Gold Face -->
        <polygon class="v5sl-dia-face" points="32,10.5 53.5,32 32,53.5 10.5,32" fill="url(#v5slDiaFace_${letter})" stroke="#fff3c4" stroke-width="0.9"/>
      </svg>
      <span class="v5sl-diamond-letter">${letter}</span>
    </span>
  `;
}

function renderHexFrameSvg(uid: string): string {
  // Crisp non-clipped pointed hexagonal double-brass metallic border + sapphire interior
  return `
    <svg class="v5sl-hex-svg" viewBox="0 0 400 62" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5slHexBrass_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff2ba"/>
          <stop offset="28%" stop-color="#d8a53d"/>
          <stop offset="56%" stop-color="#7c5416"/>
          <stop offset="82%" stop-color="#ecc668"/>
          <stop offset="100%" stop-color="#9a6c1d"/>
        </linearGradient>
        <linearGradient id="v5slHexFill_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#133378"/>
          <stop offset="46%" stop-color="#091d4c"/>
          <stop offset="100%" stop-color="#040d27"/>
        </linearGradient>
      </defs>
      <!-- Outer Brushed Brass Pointed Hexagon -->
      <polygon
        class="v5sl-hex-outer"
        points="20,2 380,2 398,31 380,60 20,60 2,31"
        fill="url(#v5slHexBrass_${uid})"
      />
      <!-- Dark Recessed Inner Groove -->
      <polygon
        class="v5sl-hex-groove"
        points="21.5,4.8 378.5,4.8 394.5,31 378.5,57.2 21.5,57.2 5.5,31"
        fill="#0b1224"
      />
      <!-- Deep Sapphire Enameled Body + Inner Gold Hairline -->
      <polygon
        class="v5sl-hex-body"
        points="23,6.8 377,6.8 391.8,31 377,55.2 23,55.2 8.2,31"
        fill="url(#v5slHexFill_${uid})"
        stroke="rgba(255, 224, 134, 0.55)"
        stroke-width="1.15"
      />
      <!-- Subtle Top Specular Sheen -->
      <line x1="28" y1="8.2" x2="372" y2="8.2" stroke="rgba(255, 248, 220, 0.34)" stroke-width="1"/>
    </svg>
  `;
}

function renderClueBulbSvg(size = 20): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 18h6M10 21h4"/>
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.2 1.1 2.2h5c0-1 .4-1.7 1.1-2.2A6 6 0 0 0 12 3z" fill="currentColor" fill-opacity="0.18"/>
      <line x1="12" y1="7.5" x2="12" y2="11.5" stroke-width="1.6"/>
      <line x1="9.8" y1="9.6" x2="14.2" y2="9.6" stroke-width="1.6"/>
    </svg>
  `;
}

function renderWaxSealSvg(multText: string): string {
  return `
    <svg class="v5sl-wax-seal-svg" viewBox="0 0 56 56" aria-hidden="true">
      <defs>
        <radialGradient id="v5slWaxGrad" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stop-color="#e04352"/>
          <stop offset="55%" stop-color="#9e1928"/>
          <stop offset="100%" stop-color="#590914"/>
        </radialGradient>
      </defs>
      <path d="M28 3 C34 2, 41 5, 45 10 C50 14, 53 21, 52 28 C53 35, 49 42, 44 46 C39 51, 33 53, 27 52 C20 53, 13 50, 9 44 C4 39, 3 32, 4 26 C3 19, 7 12, 12 8 C17 4, 22 2, 28 3 Z" fill="url(#v5slWaxGrad)" stroke="#3a050c" stroke-width="1.6"/>
      <circle cx="28" cy="28" r="17.5" fill="none" stroke="rgba(255, 212, 148, 0.58)" stroke-width="1.4" stroke-dasharray="2.5 2"/>
      <text x="28" y="33" text-anchor="middle" fill="#ffe6b0" font-family="Cinzel, Georgia, serif" font-weight="800" font-size="14">${escapeHtml(multText)}</text>
    </svg>
  `;
}

function renderCheckBulbSvg(): string {
  return `
    <svg class="v5sl-bulb-svg" viewBox="0 0 28 28" aria-hidden="true">
      <circle class="v5sl-bulb-ring" cx="14" cy="14" r="12.2" fill="#23190b" stroke="#c89a3b" stroke-width="1.6"/>
      <circle class="v5sl-bulb-glass" cx="14" cy="14" r="9" fill="#0d1b36"/>
      <ellipse cx="11.4" cy="10.8" rx="3" ry="1.8" transform="rotate(-28 11.4 10.8)" fill="rgba(255,255,255,0.28)"/>
      <polyline class="v5sl-bulb-check" points="9.5,14.2 12.8,17.4 19,10.8" fill="none" stroke="#1d1103" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="v5sl-bulb-cross" stroke="#fff0f2" stroke-width="2.4" stroke-linecap="round">
        <line x1="10" y1="10" x2="18" y2="18"/>
        <line x1="18" y1="10" x2="10" y2="18"/>
      </g>
    </svg>
  `;
}

function renderPlayArrowSvg(): string {
  return `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="6,4 20,12 6,20"/>
    </svg>
  `;
}

function renderCrownSvg(size = 15): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 18h18l-1.5-10-4.5 4-3-6-3 6-4.5-4L3 18z" fill="currentColor" fill-opacity="0.28"/>
      <path d="M3 20.5h18"/>
    </svg>
  `;
}

function renderWhisperEarpieceSvg(): string {
  return `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3a7 7 0 0 0-7 7v4a3 3 0 0 0 3 3h1v-6H7"/>
      <path d="M12 3a7 7 0 0 1 7 7v4a3 3 0 0 1-3 3h-1v-6h2"/>
      <path d="M16 17v1a3 3 0 0 1-3 3h-2"/>
    </svg>
  `;
}

function renderFullscreenIconSvg(isExit = false): string {
  if (isExit) {
    return `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="4 14 10 14 10 20"/>
        <polyline points="20 10 14 10 14 4"/>
        <line x1="14" y1="10" x2="21" y2="3"/>
        <line x1="3" y1="21" x2="10" y2="14"/>
      </svg>
    `;
  }
  return `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9"/>
      <polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
      <line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  `;
}

function renderChallengerPodiumSvg(): string {
  return `
    <svg class="v5sl-stage-podium-svg" viewBox="0 0 150 110" aria-hidden="true">
      <defs>
        <linearGradient id="v5slPodBrass" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f7da88"/>
          <stop offset="45%" stop-color="#c69130"/>
          <stop offset="100%" stop-color="#694511"/>
        </linearGradient>
        <linearGradient id="v5slPodBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2c1d13"/>
          <stop offset="55%" stop-color="#17121b"/>
          <stop offset="100%" stop-color="#0b0d18"/>
        </linearGradient>
      </defs>
      <!-- Angled Broadcast Podium Desk Top -->
      <polygon points="8,14 116,6 144,24 28,32" fill="url(#v5slPodBrass)" stroke="#3b2408" stroke-width="1.5"/>
      <polygon points="14,17 113,10 135,23 30,29" fill="#1b141a"/>
      <!-- Podium Pedestal -->
      <polygon points="30,32 130,25 120,108 42,108" fill="url(#v5slPodBody)" stroke="url(#v5slPodBrass)" stroke-width="1.6"/>
      <line x1="56" y1="30" x2="62" y2="108" stroke="rgba(244, 206, 114, 0.42)" stroke-width="2"/>
      <line x1="102" y1="27" x2="96" y2="108" stroke="rgba(244, 206, 114, 0.28)" stroke-width="1.5"/>
    </svg>
  `;
}

function renderSoloSilhouetteSvg(): string {
  return `
    <svg class="v5sl-solo-silhouette" viewBox="0 0 120 170" aria-hidden="true">
      <defs>
        <linearGradient id="v5slSilRim" x1="0%" y1="0%" x2="100%" y2="85%">
          <stop offset="0%" stop-color="#75b6ff" stop-opacity="0.58"/>
          <stop offset="50%" stop-color="#192e57" stop-opacity="0.72"/>
          <stop offset="100%" stop-color="#081229" stop-opacity="0.88"/>
        </linearGradient>
      </defs>
      <circle cx="60" cy="40" r="22" fill="url(#v5slSilRim)" stroke="rgba(166, 212, 255, 0.42)" stroke-width="1.4"/>
      <path d="M22,168 L26,96 C27,76 42,66 60,66 C78,66 93,76 94,96 L98,168 Z" fill="url(#v5slSilRim)" stroke="rgba(244, 208, 118, 0.28)" stroke-width="1.2"/>
    </svg>
  `;
}

function renderWorldMapMonitorSvg(lat: number, lon: number): string {
  const clampedLat = Math.max(-85, Math.min(85, lat));
  const clampedLon = Math.max(-180, Math.min(180, lon));
  const px = ((clampedLon + 180) / 360) * 600;
  const py = ((90 - clampedLat) / 180) * 300;

  return `
    <svg class="v5sl-map-svg" viewBox="0 0 600 300" role="img" aria-label="Broadcast world map showing target location beacon">
      <defs>
        <radialGradient id="v5slMapSea" cx="50%" cy="44%" r="68%">
          <stop offset="0%" stop-color="#163b72"/>
          <stop offset="65%" stop-color="#0a2044"/>
          <stop offset="100%" stop-color="#040e24"/>
        </radialGradient>
        <linearGradient id="v5slLandFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2c678d"/>
          <stop offset="100%" stop-color="#1a4166"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="600" height="300" fill="url(#v5slMapSea)"/>
      <!-- Brass Navigation Graticule -->
      <g stroke="rgba(148, 198, 255, 0.16)" stroke-width="0.9">
        <line x1="0" y1="75" x2="600" y2="75"/>
        <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(247, 202, 92, 0.34)" stroke-dasharray="5 4"/>
        <line x1="0" y1="225" x2="600" y2="225"/>
        <line x1="100" y1="0" x2="100" y2="300"/>
        <line x1="200" y1="0" x2="200" y2="300"/>
        <line x1="300" y1="0" x2="300" y2="300" stroke="rgba(247, 202, 92, 0.3)" stroke-dasharray="5 4"/>
        <line x1="400" y1="0" x2="400" y2="300"/>
        <line x1="500" y1="0" x2="500" y2="300"/>
      </g>
      <!-- Continents -->
      <g fill="url(#v5slLandFill)" stroke="#72b7ee" stroke-width="1.2" stroke-linejoin="round">
        <path d="M52 54 L94 42 L152 46 L184 70 L176 92 L156 105 L146 128 L134 134 L126 122 L106 112 L88 94 L66 78 Z"/>
        <path d="M210 24 L244 22 L252 44 L228 56 L210 42 Z"/>
        <path d="M168 144 L196 150 L224 176 L214 206 L194 246 L180 260 L174 236 L166 196 L158 164 Z"/>
        <path d="M276 54 L318 46 L354 54 L360 76 L338 88 L308 86 L284 94 L274 78 Z"/>
        <path d="M274 108 L314 102 L352 114 L374 146 L362 184 L344 226 L320 232 L304 196 L296 164 L268 144 Z"/>
        <path d="M356 48 L434 40 L512 52 L538 72 L514 96 L494 118 L466 144 L436 148 L412 126 L388 134 L362 110 L352 84 Z"/>
        <path d="M524 84 L536 92 L528 106 L518 98 Z"/>
        <path d="M474 156 L504 162 L512 172 L476 168 Z"/>
        <path d="M478 192 L524 186 L544 210 L534 236 L492 234 L474 214 Z"/>
        <path d="M560 228 L572 242 L564 252 L554 238 Z"/>
      </g>
      <!-- Illuminated Crosshair -->
      <line x1="${px.toFixed(1)}" y1="0" x2="${px.toFixed(1)}" y2="300" stroke="rgba(255, 224, 130, 0.45)" stroke-width="1.1" stroke-dasharray="4 4"/>
      <line x1="0" y1="${py.toFixed(1)}" x2="600" y2="${py.toFixed(1)}" stroke="rgba(255, 224, 130, 0.45)" stroke-width="1.1" stroke-dasharray="4 4"/>
      <!-- Pulsing Target Beacon -->
      <circle class="v5sl-map-pulse" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="15" fill="none" stroke="#ffe082" stroke-width="2.2"/>
      <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="10.5" fill="rgba(255, 210, 88, 0.26)" stroke="#ffe599" stroke-width="1.8"/>
      <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.8" fill="#ff4c63" stroke="#ffffff" stroke-width="1.8"/>
    </svg>
  `;
}

// ============================================================================
// SELF-CONTAINED SCOPED CSS INJECTOR (`#v5-spotlight-lozenge-styles`)
// ZERO CSS blur filters, ZERO flat navy form boxes, ZERO horizontal overflow!
// ============================================================================

function ensureScopedStylesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = `
/* ============================================================================
   WORLD'S SMARTEST v5.0 — SpotlightLozengeRendererV5 Scoped Styles
   ============================================================================ */

.v5sl-stage {
  position: relative;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-x: clip;
  overflow-y: visible;
  color: #fff8e6;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: radial-gradient(ellipse 90% 60% at 50% 18%, #0e285f 0%, #061332 54%, #030816 100%);
  isolation: isolate;
  box-sizing: border-box;
}

.v5sl-stage *,
.v5sl-stage *::before,
.v5sl-stage *::after {
  box-sizing: border-box;
}

/* --- LAYER 0: PAINTED VENUE STAGE & VOLUMETRIC SPOTLIGHTS --- */

.v5sl-backdrop-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.v5sl-venue-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 34%;
  opacity: 0.44;
  filter: saturate(1.08) contrast(1.06) brightness(0.86);
}

.v5sl-spotlight-cones {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 52% 48% at 50% 8%, rgba(124, 198, 255, 0.34) 0%, rgba(42, 108, 224, 0.16) 44%, transparent 74%),
    conic-gradient(from 164deg at 50% -4%, transparent 0deg, rgba(160, 214, 255, 0.22) 10deg, rgba(255, 226, 150, 0.08) 18deg, rgba(160, 214, 255, 0.20) 26deg, transparent 36deg),
    linear-gradient(180deg, rgba(3, 9, 24, 0.52) 0%, rgba(4, 12, 32, 0.18) 38%, rgba(3, 10, 28, 0.64) 76%, rgba(2, 6, 16, 0.90) 100%);
}

/* Curved Golden Stage Truss Ribs (matching mockup_v5_question_classic background architecture) */
.v5sl-stage-arches {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 46% 78% at 50% 54%, transparent 56%, rgba(218, 166, 68, 0.19) 59%, rgba(218, 166, 68, 0.05) 64%, transparent 70%),
    radial-gradient(ellipse 84% 26% at 50% 78%, rgba(25, 84, 186, 0.26) 0%, rgba(232, 180, 74, 0.12) 48%, transparent 72%);
}

/* --- LAYER 1: SUBTLE WAIST-UP STAGE ACTORS (MAX LEFT, CHALLENGER RIGHT) --- */

.v5sl-actors-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.v5sl-actor-host {
  position: absolute;
  left: -8px;
  bottom: 86px;
  width: clamp(92px, 24vw, 148px);
  height: auto;
  max-height: 36%;
  object-fit: contain;
  object-position: bottom center;
  opacity: 0.72;
  filter: drop-shadow(0 0 18px rgba(88, 168, 255, 0.3)) brightness(0.92);
  mask-image: linear-gradient(180deg, #000 0%, #000 72%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 72%, transparent 100%);
  transition: opacity 0.28s ease, transform 0.35s ease;
}

.v5sl-actor-challenger-wrap {
  position: absolute;
  right: -8px;
  bottom: 84px;
  width: clamp(94px, 25vw, 152px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  opacity: 0.72;
}

.v5sl-actor-challenger-img,
.v5sl-solo-silhouette {
  width: 82%;
  height: auto;
  max-height: 220px;
  object-fit: contain;
  filter: drop-shadow(0 0 18px rgba(102, 174, 255, 0.28)) brightness(0.9);
  margin-bottom: -24px;
  mask-image: linear-gradient(180deg, #000 0%, #000 78%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 78%, transparent 100%);
}

.v5sl-stage-podium-svg {
  width: 96%;
  height: auto;
  display: block;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.72));
}

@media (min-width: 820px) {
  .v5sl-actor-host {
    left: clamp(8px, 2.2vw, 42px);
    bottom: 204px;
    width: clamp(150px, 15vw, 208px);
    max-height: 48%;
    opacity: 0.88;
  }
  .v5sl-actor-challenger-wrap {
    right: clamp(8px, 2.2vw, 42px);
    bottom: 132px;
    width: clamp(156px, 15.6vw, 218px);
    opacity: 0.88;
  }
}

/* 1-Tap Tactile Brass Fullscreen Toggle (Top-Right Stage Corner) */
.v5sl-fullscreen-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 9;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1.5px solid #e6ba58;
  background: linear-gradient(180deg, #271a09 0%, #140c03 100%);
  color: #fce296;
  clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.75);
  transition: transform 0.14s ease, border-color 0.18s ease, color 0.18s ease;
}

.v5sl-fullscreen-btn:hover {
  transform: scale(1.06);
  border-color: #fff2ba;
  color: #ffffff;
}

/* --- LAYER 2: TOP SCULPTED BRASS CHRONOMETER & WINGED CATEGORY RIBBON --- */

.v5sl-top-ribbon {
  position: relative;
  z-index: 6;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0 4px;
  flex-shrink: 0;
}

/* Glowing Edge-to-Edge Brass Horizon Wire Behind Wings */
.v5sl-top-wire {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, rgba(255, 224, 130, 0.55) 0%, #fff4c6 20%, #f5ba42 50%, #fff4c6 80%, rgba(255, 224, 130, 0.55) 100%);
  box-shadow: 0 0 10px rgba(255, 204, 84, 0.85), 0 0 22px rgba(242, 166, 36, 0.45);
  pointer-events: none;
  z-index: 0;
}

.v5sl-ribbon-inner {
  position: relative;
  z-index: 1;
  width: min(calc(100% - 16px), 840px);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.v5sl-wing {
  position: relative;
  min-width: 0;
  min-height: 36px;
  display: flex;
  align-items: center;
  padding: 6px 14px;
  background: linear-gradient(180deg, #fae297 0%, #d8a642 46%, #ae7a1e 85%, #d6a543 100%);
  color: #1f1304;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(10.5px, 2.5vw, 13.5px);
  letter-spacing: 0.055em;
  text-transform: uppercase;
  line-height: 1.12;
  text-shadow: 0 1px 0 rgba(255, 246, 208, 0.55);
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.65));
}

.v5sl-wing::after {
  content: '';
  position: absolute;
  inset: 2.5px;
  border: 1.2px solid rgba(255, 248, 214, 0.65);
  pointer-events: none;
}

.v5sl-wing-left {
  justify-content: flex-end;
  text-align: right;
  padding-left: 20px;
  padding-right: 16px;
  margin-right: -12px;
  clip-path: polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 50%);
}

.v5sl-wing-left::after {
  clip-path: polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%);
}

.v5sl-wing-right {
  justify-content: flex-start;
  text-align: left;
  padding-left: 16px;
  padding-right: 20px;
  margin-left: -12px;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%);
}

.v5sl-wing-right::after {
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%);
}

.v5sl-wing-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Center Multi-Ring Brushed-Brass Chronometer */
.v5sl-chronometer {
  position: relative;
  z-index: 3;
  width: 94px;
  height: 94px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.8));
}

@media (min-width: 820px) {
  .v5sl-chronometer {
    width: 108px;
    height: 108px;
  }
  .v5sl-wing {
    min-height: 40px;
    padding-top: 7px;
    padding-bottom: 7px;
  }
}

.v5sl-chrono-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.v5sl-chrono-arc-amber {
  transition: stroke-dashoffset 0.14s linear;
  filter: drop-shadow(0 0 4px rgba(255, 198, 72, 0.85));
}

.v5sl-chrono-arc-cyan {
  transition: stroke-dashoffset 0.14s linear;
  filter: drop-shadow(0 0 5px rgba(72, 214, 255, 0.9));
}

.v5sl-chrono-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.v5sl-chrono-readout {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(24px, 5vw, 31px);
  line-height: 1;
  letter-spacing: -0.03em;
  color: #fff6dc;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(255, 224, 138, 0.35);
}

.v5sl-chrono-sub {
  margin-top: 2px;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8ad8ff;
  line-height: 1;
}

.v5sl-chrono-sub:empty {
  display: none;
}

/* Chronometer Dynamic States (mutated via dataset.phase only!) */
.v5sl-chronometer[data-phase="READ_IN"] .v5sl-chrono-arc-amber,
.v5sl-chronometer[data-phase="READ_IN"] .v5sl-chrono-arc-cyan {
  animation: v5slReadShimmer 1.3s ease-in-out infinite;
}
.v5sl-chronometer[data-phase="READ_IN"] .v5sl-chrono-sub {
  color: #ffe28c;
}

.v5sl-chronometer[data-phase="RELAXED"] .v5sl-chrono-readout {
  font-size: clamp(30px, 6vw, 38px);
  color: #9ceeff;
}
.v5sl-chronometer[data-phase="RELAXED"] .v5sl-chrono-sub {
  color: #9ceeff;
}

.v5sl-chronometer[data-phase="LOCKED"] .v5sl-chrono-arc-amber,
.v5sl-chronometer[data-phase="LOCKED"] .v5sl-chrono-arc-cyan {
  stroke: #ffa629;
}
.v5sl-chronometer[data-phase="LOCKED"] .v5sl-chrono-sub {
  color: #ffbd59;
}

.v5sl-chronometer[data-phase="URGENT"] {
  animation: v5slUrgentBeat 0.65s ease-in-out infinite;
}
.v5sl-chronometer[data-phase="URGENT"] .v5sl-chrono-arc-amber,
.v5sl-chronometer[data-phase="URGENT"] .v5sl-chrono-arc-cyan {
  stroke: #ff425b;
  filter: drop-shadow(0 0 7px rgba(255, 66, 91, 0.95));
}
.v5sl-chronometer[data-phase="URGENT"] .v5sl-chrono-readout,
.v5sl-chronometer[data-phase="URGENT"] .v5sl-chrono-sub {
  color: #ff7e8e;
}

@keyframes v5slReadShimmer {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}

@keyframes v5slUrgentBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.045); }
}

/* --- LAYER 3: MAIN SPOTLIGHT STAGE BODY (PROMPT + FORMAT BODY) --- */

.v5sl-stage-main {
  position: relative;
  z-index: 4;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 2px 0 8px;
  gap: clamp(8px, 1.5vh, 14px);
}

/* FRAMELESS SPOTLIGHT PROMPT TYPOGRAPHY (ZERO BOXES OR BORDERS!) */
.v5sl-prompt-zone {
  width: min(calc(100% - 28px), 780px);
  text-align: center;
  padding: clamp(4px, 1.2vh, 12px) clamp(8px, 2vw, 20px) 2px;
  background: transparent;
  border: none;
  box-shadow: none;
}

.v5sl-prompt-heading {
  margin: 0 auto;
  max-width: 24ch;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-weight: 800;
  font-size: clamp(22px, 3.6vw, 34px);
  line-height: 1.18;
  letter-spacing: -0.018em;
  color: #fff6dc;
  text-wrap: balance;
  text-shadow:
    0 3px 18px rgba(2, 6, 18, 0.96),
    0 1px 4px rgba(0, 0, 0, 0.92),
    0 0 28px rgba(105, 174, 255, 0.24);
}

@media (min-width: 820px) {
  .v5sl-prompt-heading {
    max-width: 30ch;
  }
}

.v5sl-format-subcue {
  margin: 6px auto 0;
  font-size: clamp(11.5px, 1.8vw, 13.5px);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f6d57f;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
}

/* Optional Diegetic Coach Whisper Ribbon (Story Cold-Open Teaching Cue) */
.v5sl-coach-whisper {
  margin: 8px auto 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: min(100%, 560px);
  padding: 5px 16px;
  background: linear-gradient(90deg, rgba(44, 21, 12, 0.92) 0%, rgba(64, 33, 16, 0.96) 50%, rgba(44, 21, 12, 0.92) 100%);
  border-top: 1.5px solid #e6ba58;
  border-bottom: 1.5px solid #9c6e1f;
  clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%);
  color: #ffefc4;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.25;
  text-align: left;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.72));
}

.v5sl-coach-whisper[hidden] {
  display: none;
}

.v5sl-coach-whisper-icon {
  color: #f8cf6c;
  flex-shrink: 0;
  display: inline-flex;
}

/* Diegetic Producer Clue Slip (Unfurls on CLUE coin tap) */
.v5sl-clue-slip {
  display: none;
  margin: 8px auto 0;
  max-width: min(100%, 600px);
  padding: 7px 14px;
  background: linear-gradient(180deg, #271a0e 0%, #191008 100%);
  border: 1.5px solid #dfae4b;
  clip-path: polygon(9px 0, calc(100% - 9px) 0, 100% 9px, 100% calc(100% - 9px), calc(100% - 9px) 100%, 9px 100%, 0 calc(100% - 9px), 0 9px);
  color: #fff3cf;
  font-size: clamp(12.5px, 2vw, 14.5px);
  font-weight: 600;
  line-height: 1.28;
  text-align: left;
  align-items: center;
  justify-content: center;
  gap: 8px;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.75));
}

.v5sl-clue-slip.is-open {
  display: inline-flex;
  animation: v5slSlipIn 0.25s ease-out;
}

.v5sl-clue-slip-tag {
  color: #ffd772;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

@keyframes v5slSlipIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- FORMAT MOUNT BODY CONTAINER --- */

.v5sl-format-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.v5sl-custom-gadget-slot {
  width: min(calc(100% - 20px), 820px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ============================================================================
   FORMAT 1: POINTED HEXAGONAL BRASS-AND-SAPPHIRE LIGHT-BEAM LOZENGES
   ============================================================================ */

.v5sl-lozenge-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 11px;
  overflow-x: clip;
}

@media (max-width: 819px) {
  .v5sl-lozenge-stack.is-pairable .v5sl-lozenge-row > .v5sl-light-wire {
    display: none;
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-hex-btn::before {
    content: '';
    position: absolute;
    left: -50vw;
    right: -50vw;
    top: 50%;
    height: 3px;
    transform: translateY(-50%);
    z-index: -1;
    pointer-events: none;
    background: linear-gradient(90deg, #ffdd7e 0%, #fff8dc 25%, #f5b93d 50%, #fff8dc 75%, #ffdd7e 100%);
    box-shadow: 0 0 10px rgba(255, 200, 74, 0.9), 0 0 22px rgba(242, 160, 28, 0.52);
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-hex-btn.is-locked::before {
    background: linear-gradient(90deg, #ff9918 0%, #fff0a8 50%, #ff9918 100%);
    box-shadow: 0 0 14px rgba(255, 156, 24, 0.98);
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-hex-btn.is-correct::before {
    background: linear-gradient(90deg, #2be89a 0%, #d4ffea 50%, #2be89a 100%);
    box-shadow: 0 0 16px rgba(46, 232, 154, 0.98);
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-hex-btn.is-wrong::before {
    background: linear-gradient(90deg, #ff4b64 0%, #ffc2cb 50%, #ff4b64 100%);
    box-shadow: 0 0 12px rgba(255, 75, 100, 0.92);
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-hex-btn.is-eliminated::before {
    opacity: 0.2;
  }
}

.v5sl-lozenge-row {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
}

/* Edge-to-Edge Horizontal Stage Light Wire */
.v5sl-light-wire {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 3px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, #ffdd7e 0%, #fff8dc 25%, #f5b93d 50%, #fff8dc 75%, #ffdd7e 100%);
  box-shadow: 0 0 10px rgba(255, 200, 74, 0.9), 0 0 24px rgba(242, 160, 28, 0.52);
  pointer-events: none;
  z-index: 0;
  transition: background 0.2s ease, box-shadow 0.2s ease, opacity 0.25s ease;
}

.v5sl-lozenge-pair-wrap {
  position: relative;
  z-index: 1;
  width: min(100%, 440px);
  display: grid;
  grid-template-columns: 1fr;
  gap: 11px;
}

/* On widescreen desktop (820px+), pair A+B and C+D onto two sweeping WWTBAM stage wire rows */
@media (min-width: 820px) {
  .v5sl-lozenge-stack.is-pairable {
    gap: 16px;
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-lozenge-pair-wrap {
    width: min(calc(100% - 40px), 860px);
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
}

.v5sl-hex-btn {
  position: relative;
  width: 100%;
  min-height: 58px;
  padding: 10px 26px 10px 66px;
  margin: 0;
  border: none;
  background: transparent;
  color: #fffaf0;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(16px, 2.5vw, 21px);
  line-height: 1.22;
  text-align: left;
  display: flex;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.14s ease, filter 0.18s ease, opacity 0.24s ease;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.72));
}

.v5sl-hex-btn:hover:not(:disabled),
.v5sl-hex-btn:focus-visible:not(:disabled) {
  transform: scale(1.018);
  filter: drop-shadow(0 0 16px rgba(255, 212, 102, 0.72)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.76));
  outline: none;
}

.v5sl-hex-btn:active:not(:disabled) {
  transform: scale(0.985);
}

.v5sl-hex-svg {
  position: absolute;
  inset: 0 0 0 18px;
  width: calc(100% - 18px);
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.v5sl-diamond-badge {
  position: absolute;
  left: 0;
  top: 50%;
  width: 58px;
  height: 58px;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.78));
}

.v5sl-diamond-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.v5sl-diamond-letter {
  position: absolute;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 900;
  font-size: 23px;
  line-height: 1;
  color: #1f1305;
  text-shadow: 0 1px 0 rgba(255, 245, 200, 0.7);
}

.v5sl-hex-text {
  position: relative;
  z-index: 2;
  color: #fffaf0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.88);
  word-break: break-word;
}

/* --- LOZENGE STATE CHOREOGRAPHY (WWTBAM ORANGE LOCK -> EMERALD REVEAL) --- */

.v5sl-hex-btn.is-locked {
  transform: scale(1.024);
  filter: drop-shadow(0 0 22px rgba(255, 162, 24, 0.92));
  animation: v5slOrangeLockPulse 0.42s ease-in-out infinite;
}
.v5sl-hex-btn.is-locked .v5sl-hex-body {
  fill: #cc6d09;
  stroke: #ffe699;
  stroke-width: 1.8;
}
.v5sl-hex-btn.is-locked .v5sl-dia-face {
  fill: #ffbe42;
}
.v5sl-hex-btn.is-locked .v5sl-hex-text {
  color: #ffffff;
}

.v5sl-hex-btn.is-correct {
  transform: scale(1.022);
  filter: drop-shadow(0 0 24px rgba(46, 232, 154, 0.92));
}
.v5sl-hex-btn.is-correct .v5sl-hex-body {
  fill: #0d7a4f;
  stroke: #8affcc;
  stroke-width: 2;
}
.v5sl-hex-btn.is-correct .v5sl-dia-face {
  fill: #45e8a3;
}
.v5sl-hex-btn.is-correct .v5sl-hex-text {
  color: #ffffff;
}

.v5sl-hex-btn.is-wrong {
  animation: v5slWrongShake 0.36s ease;
  filter: drop-shadow(0 0 18px rgba(255, 68, 96, 0.82));
}
.v5sl-hex-btn.is-wrong .v5sl-hex-body {
  fill: #8c172b;
  stroke: #ff94a4;
  stroke-width: 1.8;
}
.v5sl-hex-btn.is-wrong .v5sl-dia-face {
  fill: #ff7086;
}

.v5sl-hex-btn.is-eliminated {
  opacity: 0.25;
  pointer-events: none;
  filter: grayscale(0.55);
}
.v5sl-hex-btn.is-eliminated .v5sl-hex-text {
  text-decoration: line-through;
}

.v5sl-hex-btn.is-dim-after {
  opacity: 0.56;
}

/* Wire reactions per row state */
.v5sl-lozenge-row.has-locked .v5sl-light-wire {
  background: linear-gradient(90deg, #ff9918 0%, #fff0a8 50%, #ff9918 100%);
  box-shadow: 0 0 14px rgba(255, 156, 24, 0.98), 0 0 28px rgba(255, 128, 0, 0.72);
}
.v5sl-lozenge-row.has-correct .v5sl-light-wire {
  background: linear-gradient(90deg, #2be89a 0%, #d4ffea 50%, #2be89a 100%);
  box-shadow: 0 0 16px rgba(46, 232, 154, 0.98), 0 0 30px rgba(24, 200, 126, 0.72);
}
.v5sl-lozenge-row.has-wrong .v5sl-light-wire {
  background: linear-gradient(90deg, #ff4b64 0%, #ffc2cb 50%, #ff4b64 100%);
  box-shadow: 0 0 12px rgba(255, 75, 100, 0.92);
}
.v5sl-lozenge-row.all-eliminated .v5sl-light-wire {
  opacity: 0.22;
}

@keyframes v5slOrangeLockPulse {
  0%, 100% { filter: drop-shadow(0 0 16px rgba(255, 158, 22, 0.85)); }
  50% { filter: drop-shadow(0 0 28px rgba(255, 210, 92, 1)); }
}

@keyframes v5slWrongShake {
  0%, 100% { transform: translateX(0); }
  22% { transform: translateX(-6px); }
  48% { transform: translateX(5px); }
  74% { transform: translateX(-3px); }
}

/* ============================================================================
   FORMAT 2: CLUE_ESCALATOR (3 WAX-SEALED BRASS ENVELOPES + BREAK NEXT SEAL)
   ============================================================================ */

.v5sl-escalator-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.v5sl-envelopes-bar {
  width: min(calc(100% - 24px), 840px);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

@media (max-width: 640px) {
  .v5sl-envelopes-bar {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}

.v5sl-envelope {
  position: relative;
  min-height: 62px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 2px solid #cfa042;
  background: linear-gradient(165deg, #3c171c 0%, #240c10 60%, #19070a 100%);
  clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px);
  box-shadow: inset 0 1px 0 rgba(255, 232, 166, 0.34), 0 6px 14px rgba(0, 0, 0, 0.65);
  transition: transform 0.16s ease, border-color 0.2s ease, background 0.25s ease;
}

.v5sl-envelope.is-open {
  background: linear-gradient(170deg, #fdf3d8 0%, #efe0b4 100%);
  border-color: #e4b856;
  color: #1f1407;
}

.v5sl-envelope.is-sealed {
  cursor: pointer;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 12px;
}

.v5sl-envelope.is-sealed:hover:not([aria-disabled="true"]) {
  transform: translateY(-2px);
  border-color: #ffe28e;
}

.v5sl-env-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 3px;
}

.v5sl-env-kicker {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7c4d12;
}

.v5sl-env-mult {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 11px;
  font-weight: 800;
  padding: 1px 7px;
  background: linear-gradient(180deg, #3a2308 0%, #1e1103 100%);
  color: #ffe28c;
  border: 1px solid #d4a13c;
}

.v5sl-env-text {
  font-size: clamp(12.5px, 1.8vw, 14px);
  font-weight: 700;
  line-height: 1.28;
  color: #1c1205;
}

.v5sl-env-sealed-label {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.v5sl-env-sealed-title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #fce29a;
}

.v5sl-env-sealed-sub {
  font-size: 10.5px;
  font-weight: 600;
  color: #d9b59e;
}

.v5sl-wax-seal-svg {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.72));
}

/* Tactile Brass Letter-Opener Button */
.v5sl-seal-opener-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 7px 22px;
  border: 2px solid #ffe49c;
  background: linear-gradient(180deg, #f3cd6e 0%, #c6902c 52%, #8e5f14 100%);
  color: #1c1003;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 12.5px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%);
  cursor: pointer;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.7));
  transition: transform 0.14s ease, filter 0.18s ease, opacity 0.2s ease;
}

.v5sl-seal-opener-btn:hover:not(:disabled) {
  transform: scale(1.03);
  filter: drop-shadow(0 0 14px rgba(255, 212, 98, 0.85));
}

.v5sl-seal-opener-btn:disabled {
  opacity: 0.42;
  cursor: default;
  filter: grayscale(0.45);
}

/* ============================================================================
   FORMAT 3: MULTI_STRIKE (6 ILLUMINATED BRASS TARGET PLAQUES + LOCK PLUNGER)
   ============================================================================ */

.v5sl-strike-wrap {
  width: min(calc(100% - 24px), 840px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.v5sl-strike-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 9px;
}

@media (min-width: 720px) {
  .v5sl-strike-grid.is-six {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

.v5sl-strike-plaque {
  position: relative;
  min-height: 58px;
  padding: 9px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid #c59537;
  background: linear-gradient(175deg, #132e68 0%, #091a42 58%, #040d24 100%);
  clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
  color: #fff8e8;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(13.5px, 2.2vw, 17px);
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 232, 168, 0.3), 0 5px 12px rgba(0, 0, 0, 0.7);
  transition: transform 0.14s ease, border-color 0.18s ease, background 0.2s ease, filter 0.18s ease;
}

.v5sl-strike-plaque:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #ffe396;
}

.v5sl-bulb-svg {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
}

.v5sl-bulb-check,
.v5sl-bulb-cross {
  opacity: 0;
  transition: opacity 0.16s ease;
}

.v5sl-strike-plaque.is-selected {
  border-color: #ffe58f;
  background: linear-gradient(175deg, #3c2a0b 0%, #261805 65%, #160e03 100%);
  filter: drop-shadow(0 0 12px rgba(255, 196, 62, 0.6));
}
.v5sl-strike-plaque.is-selected .v5sl-bulb-glass {
  fill: #ffbe3b;
}
.v5sl-strike-plaque.is-selected .v5sl-bulb-check {
  opacity: 1;
}

.v5sl-strike-plaque.is-hit {
  border-color: #6df7bd;
  background: linear-gradient(175deg, #106342 0%, #093b27 100%);
  filter: drop-shadow(0 0 14px rgba(46, 232, 154, 0.72));
}
.v5sl-strike-plaque.is-hit .v5sl-bulb-glass {
  fill: #4bf5ae;
}
.v5sl-strike-plaque.is-hit .v5sl-bulb-check {
  opacity: 1;
}

.v5sl-strike-plaque.is-missed-target {
  border-color: #f6c959;
  background: linear-gradient(175deg, #2e240c 0%, #1c1406 100%);
}
.v5sl-strike-plaque.is-missed-target .v5sl-bulb-glass {
  fill: #e8b038;
}
.v5sl-strike-plaque.is-missed-target .v5sl-bulb-check {
  opacity: 1;
}

.v5sl-strike-plaque.is-wrong-pick {
  border-color: #ff7e92;
  background: linear-gradient(175deg, #6e1525 0%, #3d0a14 100%);
}
.v5sl-strike-plaque.is-wrong-pick .v5sl-bulb-glass {
  fill: #ff4762;
}
.v5sl-strike-plaque.is-wrong-pick .v5sl-bulb-cross {
  opacity: 1;
}

.v5sl-strike-footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 2px;
}

.v5sl-strike-counter {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #fce296;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
}

/* Sculpted Gold Plunger Lever */
.v5sl-gold-plunger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 9px 26px;
  border: 2px solid #fff2ba;
  background: linear-gradient(180deg, #fbe296 0%, #d8a238 48%, #9b6914 96%);
  color: #1f1203;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: clamp(13.5px, 2.2vw, 16px);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0 50%);
  cursor: pointer;
  filter: drop-shadow(0 5px 12px rgba(0, 0, 0, 0.78));
  transition: transform 0.14s ease, filter 0.18s ease, opacity 0.2s ease;
}

.v5sl-gold-plunger:hover:not(:disabled) {
  transform: scale(1.035);
  filter: drop-shadow(0 0 18px rgba(255, 214, 102, 0.92));
}

.v5sl-gold-plunger:active:not(:disabled) {
  transform: scale(0.97);
}

.v5sl-gold-plunger:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  filter: grayscale(0.45);
}

/* ============================================================================
   FORMAT 4: VISUAL_SPOTTER (ORNATE RIVETED BRASS STAGE MONITOR + 4 LOZENGES)
   ============================================================================ */

.v5sl-visual-layout {
  width: min(calc(100% - 20px), 960px);
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  align-items: center;
}

@media (min-width: 820px) {
  .v5sl-visual-layout {
    grid-template-columns: minmax(300px, 1.05fr) minmax(320px, 1fr);
    gap: 20px;
  }
}

.v5sl-brass-monitor {
  position: relative;
  margin: 0;
  padding: 10px;
  background: linear-gradient(145deg, #e7bf62 0%, #9b6c1c 35%, #5c3b0c 68%, #d6a43e 100%);
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
  box-shadow: inset 0 2px 1px rgba(255, 246, 204, 0.6), 0 10px 24px rgba(0, 0, 0, 0.8);
}

.v5sl-monitor-rivet {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff4c6, #8f6015 70%, #3a2305 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
  z-index: 3;
}
.v5sl-monitor-rivet.r-tl { top: 6px; left: 10px; }
.v5sl-monitor-rivet.r-tr { top: 6px; right: 10px; }
.v5sl-monitor-rivet.r-bl { bottom: 6px; left: 10px; }
.v5sl-monitor-rivet.r-br { bottom: 6px; right: 10px; }

.v5sl-monitor-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 175px;
  overflow: hidden;
  border: 2px solid #2b1a07;
  background: radial-gradient(ellipse at center, #0d2042 0%, #050d1e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.75);
}

@media (min-width: 820px) {
  .v5sl-monitor-screen {
    max-height: 260px;
  }
}

.v5sl-brass-monitor.is-map .v5sl-monitor-screen {
  background: #06132b;
}

.v5sl-monitor-screen img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2px;
}

.v5sl-map-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.v5sl-map-pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: v5slMapBeacon 1.6s ease-out infinite;
}

@keyframes v5slMapBeacon {
  0% { opacity: 0.95; transform: scale(0.75); }
  100% { opacity: 0; transform: scale(1.8); }
}

.v5sl-monitor-plate {
  margin-top: 6px;
  padding: 3px 10px;
  background: linear-gradient(180deg, #271808 0%, #160c03 100%);
  border: 1px solid rgba(255, 224, 134, 0.5);
  color: #fce29a;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
}

.v5sl-visual-choices {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.v5sl-visual-choices .v5sl-lozenge-row {
  padding: 0;
}

.v5sl-visual-choices .v5sl-lozenge-pair-wrap {
  width: 100%;
}

.v5sl-visual-choices .v5sl-hex-btn {
  min-height: 50px;
  padding-top: 7px;
  padding-bottom: 7px;
  font-size: clamp(15px, 2.2vw, 18.5px);
}

.v5sl-visual-choices .v5sl-diamond-badge {
  width: 50px;
  height: 50px;
}

.v5sl-visual-choices .v5sl-diamond-letter {
  font-size: 20px;
}

/* ============================================================================
   BOTTOM CURVED BRUSHED-BRASS PODIUM LEDGE (50/50 & CLUE COINS + 2x SWITCH)
   ============================================================================ */

.v5sl-bottom-bay {
  position: relative;
  z-index: 6;
  width: 100%;
  flex-shrink: 0;
  margin-top: auto;
}

.v5sl-podium-ledge {
  position: relative;
  width: 100%;
  padding: 14px 12px max(12px, env(safe-area-inset-bottom, 12px));
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse 100% 145% at 50% 12%, #f1cf7a 0%, #c89639 28%, #825917 72%, #3a2407 100%);
  border-top: 2.5px solid #fff2be;
  border-radius: 50% 50% 0 0 / 22px 22px 0 0;
  box-shadow: 0 -10px 28px rgba(0, 0, 0, 0.72), inset 0 3px 6px rgba(255, 248, 212, 0.52);
  transition: opacity 0.2s ease;
}

.v5sl-stage.is-revealed .v5sl-podium-ledge {
  display: none;
}

.v5sl-podium-controls {
  width: min(100%, 560px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(10px, 3vw, 22px);
}

/* Embossed Circular Brushed-Brass Coins (50/50 & CLUE) */
.v5sl-brass-coin {
  position: relative;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  border: 2.5px solid #fff0b4;
  padding: 0;
  background: radial-gradient(circle at 32% 26%, #fff5c8 0%, #e4b653 38%, #ad7b21 82%, #6e4a0d 100%);
  color: #241505;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow:
    0 5px 0 #5b3b09,
    0 8px 14px rgba(0, 0, 0, 0.75),
    inset 0 0 0 3px rgba(105, 68, 13, 0.42),
    inset 0 2px 3px rgba(255, 250, 224, 0.85);
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.18s ease, opacity 0.2s ease;
}

@media (min-width: 820px) {
  .v5sl-brass-coin {
    width: 72px;
    height: 72px;
  }
}

.v5sl-brass-coin:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.08) drop-shadow(0 0 12px rgba(255, 226, 128, 0.65));
}

.v5sl-brass-coin:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow:
    0 2px 0 #5b3b09,
    0 4px 8px rgba(0, 0, 0, 0.75),
    inset 0 0 0 3px rgba(105, 68, 13, 0.5);
}

.v5sl-brass-coin:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  filter: grayscale(0.45) contrast(0.9);
  box-shadow: 0 2px 0 #3f2806, 0 4px 8px rgba(0, 0, 0, 0.55);
}

.v5sl-coin-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 900;
  font-size: 14px;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #241505;
  text-shadow: 0 1px 0 rgba(255, 245, 200, 0.68);
}

.v5sl-coin-icon {
  display: inline-flex;
  color: #2a1806;
  margin-top: 1px;
}

.v5sl-coin-count {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 21px;
  height: 21px;
  padding: 0 5px;
  border-radius: 999px;
  background: linear-gradient(180deg, #1b2f60 0%, #09132b 100%);
  border: 1.6px solid #ffe49c;
  color: #fff6d8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.78);
}

/* Physical Brushed-Steel & Amber 2x DOUBLE DOWN Sliding Throw-Switch */
.v5sl-double-switch {
  position: relative;
  height: 54px;
  padding: 5px 14px 5px 7px;
  border-radius: 999px;
  border: 2.5px solid #d5dce6;
  background: linear-gradient(180deg, #272e3a 0%, #12161e 55%, #1d222c 100%);
  box-shadow:
    0 5px 0 #3d311f,
    0 8px 16px rgba(0, 0, 0, 0.78),
    inset 0 2px 5px rgba(0, 0, 0, 0.85),
    0 0 0 2px rgba(72, 52, 22, 0.65);
  display: inline-flex;
  align-items: center;
  gap: 11px;
  cursor: pointer;
  color: #fff4d2;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.v5sl-double-switch:hover:not(:disabled) {
  border-color: #ffe69e;
}

.v5sl-double-switch:disabled {
  opacity: 0.44;
  cursor: not-allowed;
}

.v5sl-switch-track {
  position: relative;
  width: 72px;
  height: 38px;
  border-radius: 999px;
  background: linear-gradient(180deg, #0b0e14 0%, #1c222e 100%);
  border: 1.5px solid #6c7788;
  box-shadow: inset 0 3px 7px rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
  gap: 5px;
  flex-shrink: 0;
}

.v5sl-switch-led {
  width: 6px;
  height: 15px;
  border-radius: 3px;
  background: #4e310a;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.8);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.v5sl-switch-knob {
  position: absolute;
  left: 3px;
  top: 50%;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transform: translateY(-50%);
  background: radial-gradient(circle at 32% 28%, #ffffff 0%, #cfd7e3 42%, #7d8796 82%, #4a525e 100%);
  border: 1.5px solid #eef3fa;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.85), inset 0 1px 2px #ffffff;
  transition: transform 0.22s cubic-bezier(0.22, 1.25, 0.36, 1), box-shadow 0.2s ease;
}

.v5sl-switch-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  line-height: 1.08;
}

.v5sl-switch-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(11.5px, 2.7vw, 13.5px);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #fff6dc;
}

.v5sl-switch-stakes {
  margin-top: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 700;
  color: #f3c868;
}

/* Armed State: Chrome Plunger Slides Right & Amber LEDs Ignite! */
.v5sl-double-switch[aria-pressed="true"] {
  border-color: #ffcf5c;
  box-shadow:
    0 5px 0 #5b3b09,
    0 0 22px rgba(255, 174, 34, 0.8),
    inset 0 0 12px rgba(255, 166, 26, 0.28);
}

.v5sl-double-switch[aria-pressed="true"] .v5sl-switch-track {
  justify-content: flex-start;
  border-color: #f6b640;
}

.v5sl-double-switch[aria-pressed="true"] .v5sl-switch-knob {
  transform: translate(34px, -50%);
  box-shadow: 0 0 10px rgba(255, 212, 102, 0.9), 0 3px 6px rgba(0, 0, 0, 0.85);
}

.v5sl-double-switch[aria-pressed="true"] .v5sl-switch-led {
  background: linear-gradient(180deg, #fff1a6 0%, #ffa01a 100%);
  box-shadow: 0 0 8px #ffb229, 0 0 14px rgba(255, 148, 0, 0.85);
}

/* Ambient glowing LED idle pilot even before armed (matches mockup's warm dual amber bars!) */
.v5sl-double-switch[aria-pressed="false"] .v5sl-switch-led {
  background: linear-gradient(180deg, #ffd470 0%, #d97a12 100%);
  box-shadow: 0 0 6px rgba(255, 166, 38, 0.72);
  opacity: 0.82;
}

/* ============================================================================
   THEATRICAL MAHOGANY & BRASS STAGE REVEAL BANNER (100% UNCLIPPED!)
   ============================================================================ */

.v5sl-reveal-dock {
  display: none;
  width: 100%;
  padding: 0 10px max(10px, env(safe-area-inset-bottom, 10px));
}

.v5sl-reveal-dock.is-visible {
  display: flex;
  justify-content: center;
  animation: v5slBannerRise 0.3s cubic-bezier(0.2, 0.9, 0.25, 1);
}

@keyframes v5slBannerRise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

.v5sl-reveal-banner {
  position: relative;
  width: min(100%, 880px);
  padding: 11px 14px;
  background: linear-gradient(175deg, #3f1a13 0%, #260f0b 58%, #170806 100%);
  border: 2.5px solid #d9a843;
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
  box-shadow: inset 0 2px 0 rgba(255, 232, 164, 0.42), 0 -6px 26px rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.v5sl-reveal-dock.is-win .v5sl-reveal-banner {
  border-color: #4be8a4;
  box-shadow: inset 0 2px 0 rgba(162, 255, 214, 0.48), 0 -4px 26px rgba(22, 168, 108, 0.38);
}

.v5sl-reveal-dock.is-miss .v5sl-reveal-banner {
  border-color: #e66a78;
}

.v5sl-reveal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.v5sl-reveal-verdict-row {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.v5sl-verdict-stamp {
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: clamp(13px, 2.6vw, 16px);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 11px;
  clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%);
}

.v5sl-reveal-dock.is-win .v5sl-verdict-stamp {
  background: linear-gradient(180deg, #32d991 0%, #12784d 100%);
  color: #041d12;
}

.v5sl-reveal-dock.is-miss .v5sl-verdict-stamp {
  background: linear-gradient(180deg, #f05a6f 0%, #8f182a 100%);
  color: #fff4f6;
}

.v5sl-delta-readout {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: clamp(15px, 3vw, 20px);
  color: #ffe38f;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
}

.v5sl-reveal-dock.is-win .v5sl-delta-readout {
  color: #70ffbf;
}

.v5sl-reveal-dock.is-miss .v5sl-delta-readout {
  color: #ff9ba8;
}

.v5sl-wedge-award {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border: 1.5px solid #ffe082;
  background: rgba(20, 12, 5, 0.85);
  color: #ffe7a3;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.v5sl-reveal-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
}

.v5sl-max-medallion {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 2.5px solid #e6ba58;
  background: radial-gradient(circle at 50% 30%, #1c396e 0%, #09152e 100%);
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.78);
}

.v5sl-max-medallion img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.v5sl-reveal-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.v5sl-host-quip {
  margin: 0;
  font-size: clamp(13px, 2vw, 15px);
  font-weight: 700;
  line-height: 1.28;
  color: #fff5db;
}

.v5sl-host-name {
  color: #f6cd6d;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.08em;
  margin-right: 6px;
}

.v5sl-did-you-know {
  margin: 0;
  padding-top: 4px;
  border-top: 1px solid rgba(242, 198, 98, 0.25);
  font-size: clamp(12px, 1.8vw, 13.5px);
  line-height: 1.3;
  color: #e8dcc4;
}

.v5sl-dyk-kicker {
  color: #7ee9ff;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  margin-right: 6px;
}

.v5sl-answer-note {
  font-size: 12px;
  font-weight: 600;
  color: #f3d598;
}

/* Compact mobile refinement to keep 100% above 844px fold */
@media (max-width: 460px) {
  .v5sl-fullscreen-btn {
    top: 5px;
    right: 6px;
    width: 28px;
    height: 28px;
  }
  .v5sl-top-ribbon {
    padding: 12px 0 2px;
  }
  .v5sl-chronometer {
    width: 86px;
    height: 86px;
  }
  .v5sl-wing {
    min-height: 32px;
    font-size: 10px;
    padding: 5px 12px;
  }
  .v5sl-wing-left {
    padding-left: 16px;
    padding-right: 13px;
  }
  .v5sl-wing-right {
    padding-left: 13px;
    padding-right: 16px;
  }
  .v5sl-prompt-heading {
    font-size: clamp(21px, 5.4vw, 26px);
  }
  .v5sl-lozenge-stack {
    gap: 8px;
  }
  .v5sl-hex-btn {
    min-height: 52px;
    padding: 8px 20px 8px 58px;
    font-size: 16.5px;
  }
  .v5sl-diamond-badge {
    width: 52px;
    height: 52px;
  }
  .v5sl-diamond-letter {
    font-size: 21px;
  }
  .v5sl-podium-ledge {
    padding: 11px 8px max(10px, env(safe-area-inset-bottom, 10px));
  }
  .v5sl-brass-coin {
    width: 60px;
    height: 60px;
  }
  .v5sl-coin-title {
    font-size: 13px;
  }
  .v5sl-double-switch {
    height: 48px;
    padding: 4px 10px 4px 6px;
    gap: 8px;
  }
  .v5sl-switch-track {
    width: 62px;
    height: 34px;
  }
  .v5sl-switch-knob {
    width: 26px;
    height: 26px;
  }
  .v5sl-double-switch[aria-pressed="true"] .v5sl-switch-knob {
    transform: translate(28px, -50%);
  }
  .v5sl-strike-plaque {
    min-height: 50px;
    padding: 7px 9px;
    font-size: 13px;
    gap: 7px;
  }
  .v5sl-bulb-svg {
    width: 22px;
    height: 22px;
  }
  .v5sl-gold-plunger {
    min-height: 40px;
    padding: 7px 18px;
    font-size: 13px;
  }
  .v5sl-reveal-banner {
    padding: 9px 11px;
    gap: 6px;
  }
  .v5sl-reveal-top {
    flex-wrap: nowrap;
    gap: 6px;
  }
  .v5sl-verdict-stamp {
    font-size: 11px;
    padding: 3px 8px;
  }
  .v5sl-delta-readout {
    font-size: 14px;
  }
  .v5sl-reveal-banner .v5sl-gold-plunger {
    min-height: 34px;
    padding: 5px 14px;
    font-size: 11.5px;
    flex-shrink: 0;
  }
  .v5sl-max-medallion {
    width: 46px;
    height: 46px;
  }
}

/* Dedicated Phone Landscape Layout (844x390 and short wide viewports) */
@media (max-height: 460px) and (min-width: 560px) {
  .v5sl-top-ribbon {
    padding: 3px 0 0;
  }
  .v5sl-ribbon-inner {
    width: min(calc(100% - 82px), 740px);
  }
  .v5sl-chronometer {
    width: 62px;
    height: 62px;
  }
  .v5sl-chrono-readout {
    font-size: 20px;
  }
  .v5sl-chrono-sub {
    font-size: 7px;
  }
  .v5sl-wing {
    min-height: 26px;
    font-size: 10px;
    padding: 3px 12px;
  }
  .v5sl-actor-host {
    left: 2px;
    bottom: 102px;
    width: 82px;
    max-height: 52%;
    opacity: 0.68;
  }
  .v5sl-actor-challenger-wrap {
    right: 2px;
    bottom: 66px;
    width: 88px;
    opacity: 0.68;
  }
  .v5sl-stage-main {
    padding: 0 0 3px;
    gap: 5px;
  }
  .v5sl-prompt-zone {
    width: min(calc(100% - 140px), 680px);
    padding: 2px 8px 0;
  }
  .v5sl-prompt-heading {
    max-width: 44ch;
    font-size: clamp(16px, 2.3vw, 21px);
    line-height: 1.15;
  }
  .v5sl-format-subcue {
    margin-top: 2px;
    font-size: 10px;
  }
  .v5sl-coach-whisper,
  .v5sl-clue-slip {
    margin-top: 3px;
    padding: 3px 12px;
    font-size: 11px;
  }
  .v5sl-lozenge-stack.is-pairable {
    gap: 7px;
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-lozenge-pair-wrap {
    width: min(calc(100% - 160px), 680px);
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .v5sl-hex-btn {
    min-height: 40px;
    padding: 5px 16px 5px 46px;
    font-size: 14.5px;
  }
  .v5sl-diamond-badge {
    width: 40px;
    height: 40px;
  }
  .v5sl-diamond-letter {
    font-size: 17px;
  }
  .v5sl-strike-wrap {
    width: min(calc(100% - 150px), 680px);
    gap: 6px;
  }
  .v5sl-strike-grid.is-six {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .v5sl-strike-plaque {
    min-height: 38px;
    padding: 5px 8px;
    font-size: 12.5px;
  }
  .v5sl-bulb-svg {
    width: 20px;
    height: 20px;
  }
  .v5sl-gold-plunger {
    min-height: 32px;
    padding: 4px 16px;
    font-size: 11.5px;
  }
  .v5sl-visual-layout {
    width: min(calc(100% - 140px), 700px);
    grid-template-columns: minmax(220px, 0.95fr) minmax(260px, 1fr);
    gap: 12px;
  }
  .v5sl-monitor-screen {
    max-height: 128px;
  }
  .v5sl-visual-choices {
    gap: 4px;
  }
  .v5sl-visual-choices .v5sl-hex-btn {
    min-height: 34px;
    font-size: 13.5px;
  }
  .v5sl-visual-choices .v5sl-diamond-badge {
    width: 34px;
    height: 34px;
  }
  .v5sl-podium-ledge {
    padding: 6px 10px 6px;
    border-radius: 50% 50% 0 0 / 12px 12px 0 0;
  }
  .v5sl-brass-coin {
    width: 46px;
    height: 46px;
  }
  .v5sl-coin-title {
    font-size: 10.5px;
  }
  .v5sl-coin-count {
    top: -6px;
    right: -6px;
    min-width: 17px;
    height: 17px;
    font-size: 9.5px;
  }
  .v5sl-double-switch {
    height: 40px;
    padding: 3px 10px 3px 5px;
    gap: 8px;
  }
  .v5sl-switch-track {
    width: 54px;
    height: 28px;
  }
  .v5sl-switch-knob {
    width: 22px;
    height: 22px;
  }
  .v5sl-double-switch[aria-pressed="true"] .v5sl-switch-knob {
    transform: translate(24px, -50%);
  }
  .v5sl-switch-title {
    font-size: 10px;
  }
  .v5sl-switch-stakes {
    font-size: 8.5px;
  }
  .v5sl-reveal-dock {
    padding: 0 10px 5px;
  }
  .v5sl-reveal-banner {
    padding: 6px 12px;
    gap: 4px;
  }
  .v5sl-max-medallion {
    width: 36px;
    height: 36px;
  }
  .v5sl-host-quip,
  .v5sl-did-you-know {
    font-size: 11.5px;
    line-height: 1.22;
  }
}

@media (prefers-reduced-motion: reduce) {
  .v5sl-chronometer,
  .v5sl-chrono-arc-amber,
  .v5sl-chrono-arc-cyan,
  .v5sl-hex-btn,
  .v5sl-map-pulse,
  .v5sl-reveal-dock {
    animation: none !important;
    transition: none !important;
  }
}
`;
  document.head.appendChild(style);
}

// ============================================================================
// SPOTLIGHT LOZENGE & QUESTION STAGE SHELL RENDERER V5
// ============================================================================

export class SpotlightLozengeRendererV5 {
  private readonly mountEl: HTMLElement;
  private ctx: SpotlightStageContextV5 | null = null;
  private callbacks: SpotlightStageCallbacksV5 | null = null;
  private mountedAtMs = 0;
  private submitted = false;
  private revealed = false;

  // Lifelines & Double-Down state
  private used5050 = false;
  private usedHint = false;
  private doubleDownArmed = false;

  // Surgical DOM refs (NEVER rebuilt on timer ticks!)
  private stageEl: HTMLElement | null = null;
  private chronoWrapEl: HTMLElement | null = null;
  private chronoReadoutEl: HTMLElement | null = null;
  private chronoSubEl: HTMLElement | null = null;
  private chronoAmberArcEl: SVGCircleElement | null = null;
  private chronoCyanArcEl: SVGCircleElement | null = null;
  private rightWingTextEl: HTMLElement | null = null;
  private hostActorImgEl: HTMLImageElement | null = null;
  private coachWhisperEl: HTMLElement | null = null;
  private coachWhisperTextEl: HTMLElement | null = null;
  private clueSlipEl: HTMLElement | null = null;
  private clueSlipTextEl: HTMLElement | null = null;
  private revealDockEl: HTMLElement | null = null;
  private customGadgetSlotEl: HTMLElement | null = null;

  // Podium controls
  private coin5050El: HTMLButtonElement | null = null;
  private coinClueEl: HTMLButtonElement | null = null;
  private doubleSwitchEl: HTMLButtonElement | null = null;

  // Format-specific refs
  private choiceButtons: HTMLButtonElement[] = [];
  private chosenChoiceIndex: number | null = null;
  private lockPulseTimer: number | null = null;

  // CLUE_ESCALATOR state
  private escalatorRevealedCount: 1 | 2 | 3 = 1;
  private escalatorEnvelopes: HTMLElement[] = [];
  private escalatorOpenerBtn: HTMLButtonElement | null = null;

  // MULTI_STRIKE state
  private multiSelectedIds = new Set<string>();
  private multiButtons = new Map<string, HTMLButtonElement>();
  private multiCounterEl: HTMLElement | null = null;
  private multiLockBtn: HTMLButtonElement | null = null;

  // Custom gadget integration handle (PINPOINT_DIAL, MATCH_4, SORT_4)
  private activeGadgetHandle: CustomGadgetHandleV5 | null = null;

  // Event cleanup registry
  private cleanupFns: Array<() => void> = [];

  constructor(mountEl: HTMLElement) {
    this.mountEl = mountEl;
    ensureScopedStylesInjected();
  }

  /**
   * Mounts the Spotlight Question Stage Shell + format-appropriate body.
   * Drop-in compatible with `FormatQuestionStageRenderer.mountQuestion`.
   */
  public mountQuestion(
    ctx: SpotlightStageContextV5,
    callbacks: SpotlightStageCallbacksV5,
  ): void {
    ensureScopedStylesInjected();
    this.teardownActiveState();

    this.ctx = ctx;
    this.callbacks = callbacks;
    this.mountedAtMs = performance.now();
    this.submitted = false;
    this.revealed = false;
    this.used5050 = false;
    this.usedHint = false;
    this.doubleDownArmed = false;

    const { card } = ctx;
    const tier: TierNumberV5 = ctx.tierNumber ?? 4;
    const venueUrl = ctx.venueBackdropUrl || V5_VENUE_STAGES[tier];
    const hostPose: HostPoseV5 = ctx.hostPose ?? 'welcome';
    const hostCutoutUrl = this.getHostCutoutUrl(hostPose);
    const challengerUrl = ctx.challengerId ? V5_CAST_CUTOUTS.challengers[ctx.challengerId] : null;

    const effectiveBase = this.getEffectivePointBase();
    const initialPointsText =
      card.format === 'CLUE_ESCALATOR'
        ? `${formatPoints(effectiveBase * 3)} PTS (3×)`
        : `${formatPoints(effectiveBase)} PTS`;
    const stakeTag = this.getPrimaryStakeTag(ctx);
    const titleSource = card.wittyHeader?.trim() || card.categoryLabel || 'Spotlight Round';
    const { leftWing, rightWing } = splitCategoryIntoWings(
      titleSource,
      initialPointsText,
      stakeTag,
    );

    const initialPhase =
      ctx.timerMode === 'RELAXED_UNTIMED'
        ? 'RELAXED'
        : card.readInGraceSec > 0
          ? 'READ_IN'
          : 'ACTIVE';
    const initialReadout =
      initialPhase === 'RELAXED' ? '∞' : `${Math.ceil(card.recommendedSec)}s`;
    const initialSub =
      initialPhase === 'RELAXED' ? 'UNTIMED' : initialPhase === 'READ_IN' ? 'READ' : '';

    const subCueText = this.getFormatSubCue(card);

    // Podium capability flags per format
    const is4Choice =
      card.format === 'MULTIPLE_CHOICE' ||
      card.format === 'CLUE_ESCALATOR' ||
      card.format === 'VISUAL_SPOTTER';
    const hasPowerPlay = Boolean(ctx.activeWagerPoints && ctx.activeWagerPoints > 0);
    const allow5050 = ctx.allow5050Override ?? is4Choice;
    const allowHint = ctx.allowHintOverride ?? card.format !== 'CLUE_ESCALATOR';
    const allowDoubleDown =
      ctx.allowDoubleDownOverride ?? (card.format !== 'CLUE_ESCALATOR' && !hasPowerPlay);

    const doubleWin = effectiveBase * 2;
    const doubleMiss = Math.round(effectiveBase * 0.5);

    this.mountEl.innerHTML = `
      <div class="v5sl-stage" data-v5sl-stage data-format="${escapeHtml(card.format)}">
        <!-- Layer 0: Painted Venue Vista & Volumetric Overhead Spotlights -->
        <div class="v5sl-backdrop-layer" aria-hidden="true">
          <img class="v5sl-venue-img" src="${escapeHtml(venueUrl)}" alt="" />
          <div class="v5sl-spotlight-cones"></div>
          <div class="v5sl-stage-arches"></div>
        </div>

        <!-- Layer 1: Waist-Up Broadcast Stage Actors (Max Sterling & Challenger) -->
        <div class="v5sl-actors-layer" aria-hidden="true">
          <img
            class="v5sl-actor-host"
            data-v5sl-host-img
            src="${escapeHtml(hostCutoutUrl)}"
            alt=""
          />
          <div class="v5sl-actor-challenger-wrap">
            ${
              challengerUrl
                ? `<img class="v5sl-actor-challenger-img" src="${escapeHtml(challengerUrl)}" alt="" />`
                : renderSoloSilhouetteSvg()
            }
            ${renderChallengerPodiumSvg()}
          </div>
        </div>

        <!-- Layer 2: Top Sculpted Brass Chronometer & Winged Category Ribbon -->
        <button
          type="button"
          class="v5sl-fullscreen-btn"
          data-v5sl-fullscreen-btn
          aria-label="Toggle Fullscreen"
          title="Fullscreen"
        >
          ${renderFullscreenIconSvg(false)}
        </button>
        <header class="v5sl-top-ribbon">
          <div class="v5sl-top-wire" aria-hidden="true"></div>
          <div class="v5sl-ribbon-inner">
            <div class="v5sl-wing v5sl-wing-left">
              <span class="v5sl-wing-text" data-v5sl-left-wing>${escapeHtml(leftWing)}</span>
            </div>
            <div
              class="v5sl-chronometer"
              data-v5sl-chrono
              data-phase="${initialPhase}"
              role="timer"
              aria-live="off"
              aria-label="Question Shot Clock"
            >
              ${renderChronometerSvg(initialReadout, initialSub)}
            </div>
            <div class="v5sl-wing v5sl-wing-right">
              <span class="v5sl-wing-text" data-v5sl-right-wing>${escapeHtml(rightWing)}</span>
            </div>
          </div>
        </header>

        <!-- Layer 3: Frameless Spotlight Prompt + Interactive Format Body -->
        <main class="v5sl-stage-main">
          <section class="v5sl-prompt-zone" aria-label="Question Prompt">
            <h2 class="v5sl-prompt-heading" data-v5sl-prompt>${escapeHtml(card.prompt)}</h2>
            ${subCueText ? `<div class="v5sl-format-subcue" data-v5sl-subcue>${escapeHtml(subCueText)}</div>` : ''}
            <div class="v5sl-coach-whisper" data-v5sl-coach-whisper ${ctx.coachWhisper ? '' : 'hidden'} role="note">
              <span class="v5sl-coach-whisper-icon">${renderWhisperEarpieceSvg()}</span>
              <span data-v5sl-coach-text>${escapeHtml(ctx.coachWhisper ?? '')}</span>
            </div>
            <div class="v5sl-clue-slip" data-v5sl-clue-slip role="status">
              <span class="v5sl-clue-slip-tag">Studio Clue</span>
              <span data-v5sl-clue-text>${escapeHtml(card.helpfulHint)}</span>
            </div>
          </section>

          <div class="v5sl-format-body" data-v5sl-format-body></div>
        </main>

        <!-- Layer 4: Bottom Curved Brushed-Brass Podium Ledge & Reveal Curtain -->
        <footer class="v5sl-bottom-bay">
          <div class="v5sl-podium-ledge" data-v5sl-podium-ledge>
            <div class="v5sl-podium-controls">
              <button
                type="button"
                class="v5sl-brass-coin"
                data-v5sl-coin-5050
                aria-label="50/50 Lifeline (${ctx.lifelines5050Left} remaining)"
                ${!allow5050 || ctx.lifelines5050Left <= 0 ? 'disabled' : ''}
              >
                <span class="v5sl-coin-title">50/50</span>
                <span class="v5sl-coin-count" data-v5sl-count-5050>${ctx.lifelines5050Left}</span>
              </button>

              <button
                type="button"
                class="v5sl-brass-coin"
                data-v5sl-coin-clue
                aria-label="Clue Lifeline (${ctx.lifelinesHintLeft} remaining)"
                ${!allowHint || ctx.lifelinesHintLeft <= 0 ? 'disabled' : ''}
              >
                <span class="v5sl-coin-title">CLUE</span>
                <span class="v5sl-coin-icon">${renderClueBulbSvg(18)}</span>
                <span class="v5sl-coin-count" data-v5sl-count-clue>${ctx.lifelinesHintLeft}</span>
              </button>

              <button
                type="button"
                class="v5sl-double-switch"
                data-v5sl-double-switch
                aria-pressed="false"
                aria-label="2x Double Down (+${formatPoints(doubleWin)} on hit, -${formatPoints(doubleMiss)} on miss)"
                ${!allowDoubleDown ? 'disabled' : ''}
              >
                <span class="v5sl-switch-track" aria-hidden="true">
                  <span class="v5sl-switch-knob"></span>
                  <span class="v5sl-switch-led"></span>
                  <span class="v5sl-switch-led"></span>
                </span>
                <span class="v5sl-switch-copy">
                  <span class="v5sl-switch-title">2× DOUBLE<br/>DOWN</span>
                  <span class="v5sl-switch-stakes">+${formatPoints(doubleWin)} / -${formatPoints(doubleMiss)}</span>
                </span>
              </button>
            </div>
          </div>

          <section class="v5sl-reveal-dock" data-v5sl-reveal-dock aria-live="polite"></section>
        </footer>
      </div>
    `;

    // Cache surgical DOM refs ONCE (never rebuilt on clock ticks!)
    this.stageEl = this.mountEl.querySelector('[data-v5sl-stage]');
    this.chronoWrapEl = this.mountEl.querySelector('[data-v5sl-chrono]');
    this.chronoReadoutEl = this.mountEl.querySelector('[data-v5sl-clock-readout]');
    this.chronoSubEl = this.mountEl.querySelector('[data-v5sl-clock-sub]');
    this.chronoAmberArcEl = this.mountEl.querySelector('[data-v5sl-arc-amber]');
    this.chronoCyanArcEl = this.mountEl.querySelector('[data-v5sl-arc-cyan]');
    this.rightWingTextEl = this.mountEl.querySelector('[data-v5sl-right-wing]');
    this.hostActorImgEl = this.mountEl.querySelector('[data-v5sl-host-img]');
    this.coachWhisperEl = this.mountEl.querySelector('[data-v5sl-coach-whisper]');
    this.coachWhisperTextEl = this.mountEl.querySelector('[data-v5sl-coach-text]');
    this.clueSlipEl = this.mountEl.querySelector('[data-v5sl-clue-slip]');
    this.clueSlipTextEl = this.mountEl.querySelector('[data-v5sl-clue-text]');
    this.revealDockEl = this.mountEl.querySelector('[data-v5sl-reveal-dock]');

    this.coin5050El = this.mountEl.querySelector('[data-v5sl-coin-5050]');
    this.coinClueEl = this.mountEl.querySelector('[data-v5sl-coin-clue]');
    this.doubleSwitchEl = this.mountEl.querySelector('[data-v5sl-double-switch]');

    this.bindFullscreenButton();
    this.bindPodiumControls();

    const bodyEl = this.mountEl.querySelector('[data-v5sl-format-body]') as HTMLElement;

    // Route format body
    switch (card.format) {
      case 'MULTIPLE_CHOICE':
        this.mountMultipleChoiceBody(bodyEl);
        break;
      case 'CLUE_ESCALATOR':
        this.mountClueEscalatorBody(bodyEl);
        break;
      case 'MULTI_STRIKE':
        this.mountMultiStrikeBody(bodyEl);
        break;
      case 'VISUAL_SPOTTER':
        this.mountVisualSpotterBody(bodyEl);
        break;
      case 'PINPOINT_DIAL':
      case 'MATCH_4':
      case 'SORT_4':
        this.prepareCustomGadgetSlot(bodyEl, ctx.customGadgetMounter);
        break;
    }

    this.attachKeyboardShortcuts();
  }

  /**
   * Returns the live custom gadget slot element inside the Spotlight Stage Shell
   * so `TactileGadgetRenderersV5` (`PINPOINT_DIAL`, `MATCH_4`, `SORT_4`) shares the
   * exact same Top Chronometer, Frameless Prompt, Brass Podium, and Reveal Banner!
   */
  public getCustomGadgetSlot(): HTMLElement | null {
    return this.customGadgetSlotEl;
  }

  /**
   * Mounts a tactile gadget (either an HTMLElement or a mount callback receiving
   * `(container, hostApi)`) into the shared Spotlight Stage Shell's central body slot.
   */
  public mountCustomGadgetBody(
    content?: HTMLElement | CustomGadgetMountFnV5,
  ): HTMLElement | null {
    if (!this.customGadgetSlotEl) {
      const bodyEl = this.mountEl.querySelector<HTMLElement>('[data-v5sl-format-body]');
      if (!bodyEl) return null;
      this.prepareCustomGadgetSlot(bodyEl);
    }
    const slot = this.customGadgetSlotEl;
    if (!slot) return null;

    if (!content) {
      return slot;
    }

    this.activeGadgetHandle?.dispose?.();
    this.activeGadgetHandle = null;
    slot.innerHTML = '';

    if (content instanceof HTMLElement) {
      slot.appendChild(content);
      return slot;
    }

    if (this.ctx) {
      const hostApi: CustomGadgetHostApiV5 = {
        card: this.ctx.card,
        tilePointValue: this.getEffectivePointBase(),
        submit: (partial) => this.submitExternalAnswer(partial),
        emitFeedback: (kind) => this.callbacks?.onInteractionFeedback?.(kind),
        isSubmitted: () => this.submitted,
      };
      const handle = content(slot, hostApi);
      if (handle) {
        this.activeGadgetHandle = handle;
      }
    }
    return slot;
  }

  /**
   * Registers an external gadget handle (`revealHint`, `showGadgetReveal`, `dispose`)
   * when mounted manually into `getCustomGadgetSlot()`.
   */
  public attachGadgetHandle(handle: CustomGadgetHandleV5): void {
    this.activeGadgetHandle?.dispose?.();
    this.activeGadgetHandle = handle;
  }

  /**
   * Allows a mounted tactile gadget (`PINPOINT_DIAL`, `MATCH_4`, `SORT_4`) to submit
   * through the shared stage shell so lifelines, double-down, and elapsed time stay 1:1.
   */
  public submitExternalAnswer(partial: Omit<AnswerSubmissionV4, 'elapsedSec'>): void {
    if (this.submitted) return;
    this.submitted = true;
    this.disablePodiumControls();
    if (this.chronoWrapEl) {
      this.chronoWrapEl.dataset.phase = 'LOCKED';
    }
    if (this.chronoSubEl) {
      this.chronoSubEl.textContent = 'LOCKED';
    }
    this.callbacks?.onInteractionFeedback?.('lock_in');
    this.emitSubmission(partial);
  }

  /**
   * Dynamically updates or clears the diegetic Story Cold-Open Coach Whisper ribbon.
   */
  public setCoachWhisper(text: string | null): void {
    if (!this.coachWhisperEl || !this.coachWhisperTextEl) return;
    if (text && text.trim()) {
      this.coachWhisperTextEl.textContent = text.trim();
      this.coachWhisperEl.hidden = false;
    } else {
      this.coachWhisperEl.hidden = true;
    }
  }

  /**
   * SURGICAL clock tick update — NEVER rebuilds DOM or touches `innerHTML`!
   * Safe at 10-60Hz during active pointer drags, rotary dials, or lozenge focus.
   */
  public updateClock(state: QuestionClockTickState): void {
    if (
      !this.chronoWrapEl ||
      !this.chronoReadoutEl ||
      !this.chronoSubEl ||
      !this.chronoAmberArcEl ||
      !this.chronoCyanArcEl
    ) {
      return;
    }

    if (state.phase === 'RELAXED') {
      this.chronoWrapEl.dataset.phase = 'RELAXED';
      this.chronoReadoutEl.textContent = '∞';
      this.chronoSubEl.textContent = 'UNTIMED';
      this.chronoAmberArcEl.style.strokeDashoffset = (AMBER_ARC_CIRC * 0.45).toFixed(2);
      this.chronoCyanArcEl.style.strokeDashoffset = (CYAN_ARC_CIRC * 0.52).toFixed(2);
      return;
    }

    if (state.phase === 'READ_IN') {
      this.chronoWrapEl.dataset.phase = 'READ_IN';
      this.chronoReadoutEl.textContent = `${Math.ceil(Math.max(0, state.totalSec))}s`;
      this.chronoSubEl.textContent = 'READ';
      this.chronoAmberArcEl.style.strokeDashoffset = (AMBER_ARC_CIRC * 0.48).toFixed(2);
      this.chronoCyanArcEl.style.strokeDashoffset = (CYAN_ARC_CIRC * 0.56).toFixed(2);
      return;
    }

    if (state.phase === 'LOCKED') {
      this.chronoWrapEl.dataset.phase = 'LOCKED';
      this.chronoSubEl.textContent = 'LOCKED';
      return;
    }

    if (state.phase === 'TIMEOUT') {
      this.chronoWrapEl.dataset.phase = 'URGENT';
      this.chronoReadoutEl.textContent = '0s';
      this.chronoSubEl.textContent = 'TIME UP';
      this.chronoAmberArcEl.style.strokeDashoffset = AMBER_ARC_CIRC.toFixed(2);
      this.chronoCyanArcEl.style.strokeDashoffset = CYAN_ARC_CIRC.toFixed(2);
      return;
    }

    // ACTIVE smooth SVG ring drain
    const clampedRem = Math.max(0, state.remainingSec);
    const total = Math.max(1, state.totalSec);
    const frac = Math.max(0, Math.min(1, clampedRem / total));
    const isUrgent = clampedRem <= 6;

    // Dual rings drain smoothly in tandem (amber covers up to 62%, cyan sweeps complement up to 52%)
    const amberVisible = frac * (AMBER_ARC_CIRC * 0.62);
    const cyanVisible = frac * (CYAN_ARC_CIRC * 0.52);

    this.chronoWrapEl.dataset.phase = isUrgent ? 'URGENT' : 'ACTIVE';
    this.chronoReadoutEl.textContent =
      clampedRem < 5 ? `${clampedRem.toFixed(1)}s` : `${Math.ceil(clampedRem)}s`;
    this.chronoSubEl.textContent = isUrgent ? 'HURRY!' : '';
    this.chronoAmberArcEl.style.strokeDashoffset = (AMBER_ARC_CIRC - amberVisible).toFixed(2);
    this.chronoCyanArcEl.style.strokeDashoffset = (CYAN_ARC_CIRC - cyanVisible).toFixed(2);
  }

  public getDoubleDownArmed(): boolean {
    return this.doubleDownArmed;
  }

  /**
   * Surgically eliminates 2 wrong lozenges for 50/50 lifeline on 4-choice formats.
   */
  public apply5050Elimination(indicesToEliminate?: readonly number[]): void {
    if (!this.ctx || this.submitted || this.used5050 || this.choiceButtons.length < 4) return;
    const correctIdx = this.get4ChoiceCorrectIndex(this.ctx.card);
    if (correctIdx === null) return;

    let targets: number[];
    if (indicesToEliminate && indicesToEliminate.length > 0) {
      targets = indicesToEliminate.filter((idx) => idx !== correctIdx).slice(0, 2);
    } else {
      const wrong = [0, 1, 2, 3].filter((i) => i !== correctIdx);
      const offset = Math.abs(this.ctx.card.qid) % wrong.length;
      targets = [wrong[offset], wrong[(offset + 1) % wrong.length]];
    }

    this.used5050 = true;
    for (const idx of targets) {
      const btn = this.choiceButtons[idx];
      if (btn) {
        btn.disabled = true;
        btn.classList.add('is-eliminated');
        btn.setAttribute('aria-disabled', 'true');
      }
    }
    this.syncRowWireStates();

    if (this.coin5050El) {
      this.coin5050El.disabled = true;
      const countEl = this.coin5050El.querySelector('[data-v5sl-count-5050]');
      if (countEl) {
        countEl.textContent = String(Math.max(0, this.ctx.lifelines5050Left - 1));
      }
    }
  }

  /**
   * Surgically unfurls the gold-edged Producer Clue Slip (and notifies mounted gadget if any).
   */
  public revealHint(hintText?: string): void {
    if (!this.ctx) return;
    const resolvedHint = hintText || this.ctx.card.helpfulHint;
    this.usedHint = true;

    if (this.clueSlipEl && this.clueSlipTextEl) {
      this.clueSlipTextEl.textContent = resolvedHint;
      this.clueSlipEl.classList.add('is-open');
    }
    this.activeGadgetHandle?.revealHint?.(resolvedHint);

    if (this.coinClueEl) {
      this.coinClueEl.disabled = true;
      const countEl = this.coinClueEl.querySelector('[data-v5sl-count-clue]');
      if (countEl) {
        countEl.textContent = String(Math.max(0, this.ctx.lifelinesHintLeft - 1));
      }
    }
  }

  /**
   * Reveals emerald-gold correct lozenge / plaques / gadget outcome and smoothly raises
   * the sculpted Mahogany & Brass Stage Reveal Banner with Max Sterling + Did You Know +
   * honest 1:1 point delta + glowing gold CONTINUE lever — keeping prompt & answers 100% unclipped!
   */
  public showReveal(payload: SpotlightRevealPayloadV5): void {
    if (!this.ctx || !this.revealDockEl) return;
    this.submitted = true;
    this.revealed = true;
    this.disablePodiumControls();
    this.stageEl?.classList.add('is-revealed');

    const { card } = this.ctx;
    const { evaluation } = payload;

    // 1. Update stage actor Max Sterling pose reactively!
    const revealPose: HostPoseV5 =
      payload.hostPoseOverride ?? (evaluation.isCorrect ? 'hype' : 'wince');
    const maxPortraitUrl = this.getHostCutoutUrl(revealPose);
    if (this.hostActorImgEl) {
      this.hostActorImgEl.src = maxPortraitUrl;
    }

    // 2. Format-specific reveal highlight
    switch (card.format) {
      case 'MULTIPLE_CHOICE':
      case 'CLUE_ESCALATOR':
      case 'VISUAL_SPOTTER':
        this.reveal4ChoiceOutcome(card);
        break;
      case 'MULTI_STRIKE':
        this.revealMultiStrikeOutcome(card);
        break;
      case 'PINPOINT_DIAL':
      case 'MATCH_4':
      case 'SORT_4':
        this.activeGadgetHandle?.showGadgetReveal?.(evaluation);
        break;
    }

    // 3. Honest 1:1 Point Delta + Verdict
    const sign = evaluation.netPointsDelta > 0 ? '+' : '';
    const deltaLabel =
      evaluation.netPointsDelta === 0
        ? '0 PTS'
        : `${sign}${formatPoints(evaluation.netPointsDelta)} PTS`;
    const verdictHeadline = evaluation.isBullseyeOrSweep
      ? 'BULLSEYE SWEEP!'
      : evaluation.isCorrect
        ? 'NAILED IT!'
        : 'MISSED THE MARK';
    const hostName = payload.hostSpeakerName || 'Max Sterling';
    const funFact = payload.funFactWhy || card.funFactWhy;
    const nextLabel = payload.nextButtonLabel || 'CONTINUE';

    const wedgeAwardHtml = payload.wedgeAwarded
      ? `<span class="v5sl-wedge-award" style="border-color:${WEDGE_CATALOG_V4[payload.wedgeAwarded].accentHex}">
           ${renderCrownSvg(14)}
           <span>${escapeHtml(WEDGE_CATALOG_V4[payload.wedgeAwarded].shortLabel)} WEDGE</span>
         </span>`
      : '';

    const answerLineHtml =
      !evaluation.isCorrect || evaluation.detailBreakdown
        ? `<div class="v5sl-answer-note"><strong>Answer:</strong> ${escapeHtml(evaluation.correctSummaryLabel)}${
            evaluation.detailBreakdown ? ` · ${escapeHtml(evaluation.detailBreakdown)}` : ''
          }</div>`
        : '';

    this.revealDockEl.className = `v5sl-reveal-dock is-visible ${evaluation.isCorrect ? 'is-win' : 'is-miss'}`;
    this.revealDockEl.innerHTML = `
      <div class="v5sl-reveal-banner">
        <div class="v5sl-reveal-top">
          <div class="v5sl-reveal-verdict-row">
            <span class="v5sl-verdict-stamp">${verdictHeadline}</span>
            <span class="v5sl-delta-readout" data-v5sl-delta>${deltaLabel}</span>
          </div>
          <button type="button" class="v5sl-gold-plunger" data-v5sl-next-btn>
            <span>${escapeHtml(nextLabel)}</span>
            ${renderPlayArrowSvg()}
          </button>
        </div>

        <div class="v5sl-reveal-grid">
          <div class="v5sl-max-medallion">
            <img src="${escapeHtml(maxPortraitUrl)}" alt="${escapeHtml(hostName)}" />
          </div>
          <div class="v5sl-reveal-copy">
            <p class="v5sl-host-quip">
              <span class="v5sl-host-name">${escapeHtml(hostName)}</span>
              &ldquo;${escapeHtml(payload.hostQuip)}&rdquo;
            </p>
            ${
              answerLineHtml || wedgeAwardHtml
                ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">${wedgeAwardHtml}${answerLineHtml}</div>`
                : ''
            }
            <p class="v5sl-did-you-know">
              <span class="v5sl-dyk-kicker">Did You Know?</span>
              <span>${escapeHtml(funFact)}</span>
            </p>
          </div>
        </div>
      </div>
    `;

    const nextBtn = this.revealDockEl.querySelector<HTMLButtonElement>('[data-v5sl-next-btn]');
    nextBtn?.addEventListener('click', () => {
      this.callbacks?.onNext?.();
    });
  }

  public dispose(): void {
    this.teardownActiveState();
    this.mountEl.innerHTML = '';
  }

  // ==========================================================================
  // FORMAT 1: MULTIPLE_CHOICE (4 POINTED HEXAGONAL LIGHT-BEAM LOZENGES)
  // ==========================================================================

  private mountMultipleChoiceBody(bodyEl: HTMLElement): void {
    const choices = this.ctx?.card.choices ?? ['', '', '', ''];
    bodyEl.innerHTML = this.renderHexLozengeGroupHtml(choices, { pairOnDesktop: true });
    this.bind4ChoiceButtons(bodyEl, 'MULTIPLE_CHOICE');
  }

  // ==========================================================================
  // FORMAT 2: CLUE_ESCALATOR (3 WAX-SEALED ENVELOPES + BREAK NEXT SEAL)
  // ==========================================================================

  private mountClueEscalatorBody(bodyEl: HTMLElement): void {
    const spec = this.ctx?.card.escalator;
    if (!spec) {
      this.mountMultipleChoiceBody(bodyEl);
      return;
    }

    this.escalatorRevealedCount = 1;
    const base = this.getEffectivePointBase();

    bodyEl.innerHTML = `
      <div class="v5sl-escalator-wrap">
        <div class="v5sl-envelopes-bar" data-v5sl-envelopes-bar>
          <article class="v5sl-envelope is-open" data-clue-slot="1">
            <div class="v5sl-env-head">
              <span class="v5sl-env-kicker">Clue 1 · Opening</span>
              <span class="v5sl-env-mult">3×</span>
            </div>
            <div class="v5sl-env-text">${escapeHtml(spec.clues[0])}</div>
          </article>

          <article class="v5sl-envelope is-sealed" data-clue-slot="2" role="button" tabindex="0" aria-label="Break Seal for Clue 2 (2x payout)">
            <div class="v5sl-env-sealed-label">
              <span class="v5sl-env-sealed-title">CLUE 2 · SEALED</span>
              <span class="v5sl-env-sealed-sub">Tap to unseal · 2× Payout</span>
            </div>
            ${renderWaxSealSvg('2×')}
          </article>

          <article class="v5sl-envelope is-sealed" data-clue-slot="3" role="button" tabindex="0" aria-label="Break Seal for Clue 3 (1x payout)">
            <div class="v5sl-env-sealed-label">
              <span class="v5sl-env-sealed-title">CLUE 3 · SEALED</span>
              <span class="v5sl-env-sealed-sub">Tap to unseal · 1× Payout</span>
            </div>
            ${renderWaxSealSvg('1×')}
          </article>
        </div>

        <button type="button" class="v5sl-seal-opener-btn" data-v5sl-break-seal>
          <span>BREAK NEXT SEAL (CLUE 2 · 2×)</span>
        </button>

        ${this.renderHexLozengeGroupHtml(spec.choices, { pairOnDesktop: true })}
      </div>
    `;

    this.escalatorEnvelopes = Array.from(bodyEl.querySelectorAll<HTMLElement>('[data-clue-slot]'));
    this.escalatorOpenerBtn = bodyEl.querySelector<HTMLButtonElement>('[data-v5sl-break-seal]');

    const breakUpTo = (targetSlot: 2 | 3): void => {
      if (this.submitted) return;
      if (targetSlot > this.escalatorRevealedCount) {
        this.escalatorRevealedCount = targetSlot;
      }

      for (let s = 2; s <= this.escalatorRevealedCount; s++) {
        const envEl = this.escalatorEnvelopes[s - 1];
        if (!envEl || envEl.classList.contains('is-open')) continue;
        envEl.classList.remove('is-sealed');
        envEl.classList.add('is-open');
        envEl.removeAttribute('role');
        envEl.removeAttribute('tabindex');
        const multText = s === 2 ? '2×' : '1×';
        const kickerText = s === 2 ? 'Clue 2 · Sharper' : 'Clue 3 · Clear';
        envEl.innerHTML = `
          <div class="v5sl-env-head">
            <span class="v5sl-env-kicker">${kickerText}</span>
            <span class="v5sl-env-mult">${multText}</span>
          </div>
          <div class="v5sl-env-text">${escapeHtml(spec.clues[s - 1])}</div>
        `;
      }

      // Surgically update right golden wing payout label
      const mult = this.escalatorRevealedCount === 1 ? 3 : this.escalatorRevealedCount === 2 ? 2 : 1;
      if (this.rightWingTextEl && this.ctx) {
        const stakeTag = this.getPrimaryStakeTag(this.ctx);
        const titleSource =
          this.ctx.card.wittyHeader?.trim() || this.ctx.card.categoryLabel || 'Spotlight Round';
        const { rightWing } = splitCategoryIntoWings(
          titleSource,
          `${formatPoints(base * mult)} PTS (${mult}×)`,
          stakeTag,
        );
        this.rightWingTextEl.textContent = rightWing;
      }

      // Update BREAK NEXT SEAL opener state
      if (this.escalatorOpenerBtn) {
        if (this.escalatorRevealedCount === 2) {
          this.escalatorOpenerBtn.innerHTML = '<span>BREAK NEXT SEAL (CLUE 3 · 1×)</span>';
        } else if (this.escalatorRevealedCount >= 3) {
          this.escalatorOpenerBtn.innerHTML = '<span>ALL 3 SEALS UNSEALED</span>';
          this.escalatorOpenerBtn.disabled = true;
        }
      }

      this.callbacks?.onInteractionFeedback?.('tap');
      this.callbacks?.onEscalatorDealClue?.(targetSlot);
    };

    this.escalatorOpenerBtn?.addEventListener('click', () => {
      if (this.submitted) return;
      if (this.escalatorRevealedCount === 1) breakUpTo(2);
      else if (this.escalatorRevealedCount === 2) breakUpTo(3);
    });

    const bindSealEl = (slot: 2 | 3): void => {
      const el = this.escalatorEnvelopes[slot - 1];
      if (!el) return;
      el.addEventListener('click', () => {
        if (el.classList.contains('is-sealed')) breakUpTo(slot);
      });
      el.addEventListener('keydown', (ev) => {
        if ((ev.key === 'Enter' || ev.key === ' ') && el.classList.contains('is-sealed')) {
          ev.preventDefault();
          breakUpTo(slot);
        }
      });
    };
    bindSealEl(2);
    bindSealEl(3);

    this.bind4ChoiceButtons(bodyEl, 'CLUE_ESCALATOR');
  }

  // ==========================================================================
  // FORMAT 3: MULTI_STRIKE (6 ILLUMINATED BRASS TARGET PLAQUES + LOCK PLUNGER)
  // ==========================================================================

  private mountMultiStrikeBody(bodyEl: HTMLElement): void {
    const spec = this.ctx?.card.multiStrike;
    if (!spec) {
      this.mountMultipleChoiceBody(bodyEl);
      return;
    }

    this.multiSelectedIds.clear();
    this.multiButtons.clear();
    const isSixGrid = spec.options.length >= 5;

    bodyEl.innerHTML = `
      <div class="v5sl-strike-wrap">
        <div class="v5sl-strike-grid ${isSixGrid ? 'is-six' : ''}" data-v5sl-strike-grid>
          ${spec.options
            .map(
              (opt) => `
            <button
              type="button"
              class="v5sl-strike-plaque"
              data-option-id="${escapeHtml(opt.optionId)}"
              aria-pressed="false"
            >
              ${renderCheckBulbSvg()}
              <span>${escapeHtml(opt.label)}</span>
            </button>`,
            )
            .join('')}
        </div>

        <div class="v5sl-strike-footer">
          <span class="v5sl-strike-counter" data-v5sl-strike-counter>
            0 / ${spec.targetCount} LIT
          </span>
          <button type="button" class="v5sl-gold-plunger" data-v5sl-strike-lock disabled>
            <span>LOCK PICKS</span>
          </button>
        </div>
      </div>
    `;

    this.multiCounterEl = bodyEl.querySelector('[data-v5sl-strike-counter]');
    this.multiLockBtn = bodyEl.querySelector<HTMLButtonElement>('[data-v5sl-strike-lock]');

    bodyEl.querySelectorAll<HTMLButtonElement>('.v5sl-strike-plaque').forEach((btn) => {
      const optId = btn.dataset.optionId || '';
      this.multiButtons.set(optId, btn);
      btn.addEventListener('click', () => {
        if (this.submitted) return;
        if (this.multiSelectedIds.has(optId)) {
          this.multiSelectedIds.delete(optId);
        } else {
          if (spec.strikeMode === 'SPOT_THE_IMPOSTER' && spec.targetCount === 1) {
            this.multiSelectedIds.clear();
          }
          this.multiSelectedIds.add(optId);
        }
        this.callbacks?.onInteractionFeedback?.('tap');
        this.syncMultiStrikeVisuals(spec.targetCount);
      });
    });

    this.multiLockBtn?.addEventListener('click', () => {
      if (this.submitted || this.multiSelectedIds.size === 0) return;
      this.submitted = true;
      this.disablePodiumControls();
      if (this.multiLockBtn) this.multiLockBtn.disabled = true;
      if (this.chronoWrapEl) this.chronoWrapEl.dataset.phase = 'LOCKED';
      if (this.chronoSubEl) this.chronoSubEl.textContent = 'LOCKED';
      this.callbacks?.onInteractionFeedback?.('lock_in');
      this.emitSubmission({
        format: 'MULTI_STRIKE',
        multiStrikeIds: Array.from(this.multiSelectedIds),
      });
    });
  }

  private syncMultiStrikeVisuals(targetCount: number): void {
    this.multiButtons.forEach((btn, id) => {
      const selected = this.multiSelectedIds.has(id);
      btn.classList.toggle('is-selected', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
    if (this.multiCounterEl) {
      this.multiCounterEl.textContent = `${this.multiSelectedIds.size} / ${targetCount} LIT`;
    }
    if (this.multiLockBtn) {
      this.multiLockBtn.disabled = this.submitted || this.multiSelectedIds.size === 0;
    }
  }

  private revealMultiStrikeOutcome(card: QuestionCardV4): void {
    const spec = card.multiStrike;
    if (!spec) return;
    spec.options.forEach((opt) => {
      const btn = this.multiButtons.get(opt.optionId);
      if (!btn) return;
      btn.disabled = true;
      const picked = this.multiSelectedIds.has(opt.optionId);
      btn.classList.remove('is-selected');
      if (opt.isTarget && picked) {
        btn.classList.add('is-hit');
      } else if (opt.isTarget && !picked) {
        btn.classList.add('is-missed-target');
      } else if (!opt.isTarget && picked) {
        btn.classList.add('is-wrong-pick');
      }
    });
    if (this.multiLockBtn) this.multiLockBtn.disabled = true;
  }

  // ==========================================================================
  // FORMAT 4: VISUAL_SPOTTER (RIVETED BRASS MONITOR + 4 HEXAGONAL LOZENGES)
  // ==========================================================================

  private mountVisualSpotterBody(bodyEl: HTMLElement): void {
    const spec = this.ctx?.card.visualSpotter;
    if (!spec) {
      this.mountMultipleChoiceBody(bodyEl);
      return;
    }

    const isMap = spec.visualKind === 'WORLD_REGION_MAP';
    const mediaHtml = isMap
      ? renderWorldMapMonitorSvg(spec.targetLat ?? 0, spec.targetLon ?? 0)
      : `<img src="${escapeHtml(spec.imageUrl || './assets/visuals/arch_eiffel_tower.svg')}" alt="${escapeHtml(spec.caption || 'Visual stage diagram')}" data-v5sl-visual-img />`;

    const plateCaption =
      spec.caption ||
      (isMap
        ? `STAGE BEACON · ${Math.abs(spec.targetLat ?? 0).toFixed(1)}°${(spec.targetLat ?? 0) >= 0 ? 'N' : 'S'}, ${Math.abs(spec.targetLon ?? 0).toFixed(1)}°${(spec.targetLon ?? 0) >= 0 ? 'E' : 'W'}`
        : 'STUDIO VISUAL MONITOR');

    bodyEl.innerHTML = `
      <div class="v5sl-visual-layout">
        <figure class="v5sl-brass-monitor ${isMap ? 'is-map' : ''}">
          <span class="v5sl-monitor-rivet r-tl" aria-hidden="true"></span>
          <span class="v5sl-monitor-rivet r-tr" aria-hidden="true"></span>
          <span class="v5sl-monitor-rivet r-bl" aria-hidden="true"></span>
          <span class="v5sl-monitor-rivet r-br" aria-hidden="true"></span>
          <div class="v5sl-monitor-screen">${mediaHtml}</div>
          <figcaption class="v5sl-monitor-plate">${escapeHtml(plateCaption)}</figcaption>
        </figure>

        <div class="v5sl-visual-choices">
          ${this.renderHexLozengeGroupHtml(spec.choices, { pairOnDesktop: false })}
        </div>
      </div>
    `;

    const imgEl = bodyEl.querySelector<HTMLImageElement>('[data-v5sl-visual-img]');
    imgEl?.addEventListener('error', () => {
      const parent = imgEl.parentElement;
      if (parent) {
        parent.innerHTML = `<div style="color:#2b1b08;text-align:center;padding:16px;font-weight:800;font-size:14px;">${escapeHtml(plateCaption)}</div>`;
      }
    });

    this.bind4ChoiceButtons(bodyEl, 'VISUAL_SPOTTER');
  }

  // ==========================================================================
  // CUSTOM GADGET BODY SLOT (PINPOINT_DIAL, MATCH_4, SORT_4)
  // ==========================================================================

  private prepareCustomGadgetSlot(
    bodyEl: HTMLElement,
    mounter?: CustomGadgetMountFnV5,
  ): void {
    bodyEl.innerHTML = `<div class="v5sl-custom-gadget-slot" data-v5sl-gadget-slot></div>`;
    this.customGadgetSlotEl = bodyEl.querySelector<HTMLElement>('[data-v5sl-gadget-slot]');
    if (mounter) {
      this.mountCustomGadgetBody(mounter);
    }
  }

  // ==========================================================================
  // SHARED HEXAGONAL LOZENGE GROUP BUILDER & LOCK-IN SUSPENSE CHOREOGRAPHY
  // ==========================================================================

  private renderHexLozengeGroupHtml(
    choices: readonly [string, string, string, string],
    opts: { pairOnDesktop: boolean },
  ): string {
    const qidTag = String(this.ctx?.card.qid ?? 0).replace(/[^a-zA-Z0-9]/g, '');

    const renderButton = (text: string, idx: number): string => {
      const letter = CHOICE_LETTERS[idx] ?? 'A';
      const uid = `${qidTag}_${idx}`;
      return `
        <button type="button" class="v5sl-hex-btn" data-choice-index="${idx}">
          ${renderHexFrameSvg(uid)}
          ${renderDiamondLetterSvg(letter)}
          <span class="v5sl-hex-text">${escapeHtml(text)}</span>
        </button>
      `;
    };

    if (opts.pairOnDesktop) {
      // Mobile (<820px): 4 separate visual rows; wait — for edge-to-edge wires on BOTH mobile
      // AND desktop, let's check: on mobile if two buttons share one `.v5sl-lozenge-row`, a single
      // centered wire would sit between them! Instead, give EVERY button its own `.v5sl-light-wire`
      // on mobile, OR pair row 1 (A+B) and row 2 (C+D) with per-button edge wires that span cleanly!
      // Let's render 2 paired rows on desktop and 4 wired rows on mobile? Even simpler & cleaner:
      // Each button sits inside `.v5sl-lozenge-row` with its OWN full-bleed `.v5sl-light-wire`,
      // and on desktop `>= 820px` our 2-column `.v5sl-lozenge-stack.is-pairable` places row 1+2
      // side-by-side so their horizontal wires connect seamlessly edge-to-edge across the screen!
      return `
        <div class="v5sl-lozenge-stack is-pairable" data-v5sl-choices-grid>
          <div class="v5sl-lozenge-row" data-v5sl-row="0">
            <div class="v5sl-light-wire" aria-hidden="true"></div>
            <div class="v5sl-lozenge-pair-wrap">
              ${renderButton(choices[0], 0)}
              ${renderButton(choices[1], 1)}
            </div>
          </div>
          <div class="v5sl-lozenge-row" data-v5sl-row="1">
            <div class="v5sl-light-wire" aria-hidden="true"></div>
            <div class="v5sl-lozenge-pair-wrap">
              ${renderButton(choices[2], 2)}
              ${renderButton(choices[3], 3)}
            </div>
          </div>
        </div>
      `;
    }

    // Stacked 4-row layout (used alongside Visual Spotter brass monitor)
    return `
      <div class="v5sl-lozenge-stack" data-v5sl-choices-grid>
        ${choices
          .map(
            (text, idx) => `
          <div class="v5sl-lozenge-row" data-v5sl-row="${idx}">
            <div class="v5sl-light-wire" aria-hidden="true"></div>
            <div class="v5sl-lozenge-pair-wrap">
              ${renderButton(text, idx)}
            </div>
          </div>`,
          )
          .join('')}
      </div>
    `;
  }

  private bind4ChoiceButtons(
    scope: HTMLElement,
    format: 'MULTIPLE_CHOICE' | 'CLUE_ESCALATOR' | 'VISUAL_SPOTTER',
  ): void {
    this.choiceButtons = Array.from(scope.querySelectorAll<HTMLButtonElement>('[data-choice-index]'));
    this.chosenChoiceIndex = null;

    this.choiceButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.submitted || btn.disabled) return;
        const idx = Number(btn.dataset.choiceIndex);
        this.commit4Choice(idx, format);
      });
    });
  }

  private commit4Choice(
    idx: number,
    format: 'MULTIPLE_CHOICE' | 'CLUE_ESCALATOR' | 'VISUAL_SPOTTER',
  ): void {
    if (this.submitted) return;
    this.submitted = true;
    this.chosenChoiceIndex = idx;
    this.disablePodiumControls();
    if (this.escalatorOpenerBtn) this.escalatorOpenerBtn.disabled = true;

    if (this.chronoWrapEl) this.chronoWrapEl.dataset.phase = 'LOCKED';
    if (this.chronoSubEl) this.chronoSubEl.textContent = 'LOCKED';

    // WWTBAM Orange Final-Answer Suspense Hold!
    this.choiceButtons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === idx) {
        btn.classList.add('is-locked');
      }
    });
    this.syncRowWireStates();
    this.callbacks?.onInteractionFeedback?.('lock_in');

    const suspenseMs = this.ctx?.lockInSuspenseMs ?? 380;
    const emit = (): void => {
      this.emitSubmission({
        format,
        chosenIndex: idx,
        escalatorCluesRevealed:
          format === 'CLUE_ESCALATOR' ? this.escalatorRevealedCount : undefined,
      });
    };

    if (suspenseMs <= 0) {
      emit();
    } else {
      this.lockPulseTimer = window.setTimeout(() => {
        this.lockPulseTimer = null;
        emit();
      }, suspenseMs);
    }
  }

  private reveal4ChoiceOutcome(card: QuestionCardV4): void {
    const correctIdx = this.get4ChoiceCorrectIndex(card);
    this.choiceButtons.forEach((btn, idx) => {
      btn.disabled = true;
      btn.classList.remove('is-locked');
      if (idx === correctIdx) {
        btn.classList.add('is-correct');
      } else if (idx === this.chosenChoiceIndex) {
        btn.classList.add('is-wrong');
      } else {
        btn.classList.add('is-dim-after');
      }
    });
    this.syncRowWireStates();
  }

  private syncRowWireStates(): void {
    const rows = this.mountEl.querySelectorAll<HTMLElement>('.v5sl-lozenge-row');
    rows.forEach((row) => {
      const btns = Array.from(row.querySelectorAll<HTMLButtonElement>('.v5sl-hex-btn'));
      row.classList.toggle('has-locked', btns.some((b) => b.classList.contains('is-locked')));
      row.classList.toggle('has-correct', btns.some((b) => b.classList.contains('is-correct')));
      row.classList.toggle(
        'has-wrong',
        !btns.some((b) => b.classList.contains('is-correct')) &&
          btns.some((b) => b.classList.contains('is-wrong')),
      );
      row.classList.toggle(
        'all-eliminated',
        btns.length > 0 && btns.every((b) => b.classList.contains('is-eliminated')),
      );
    });
  }

  private get4ChoiceCorrectIndex(card: QuestionCardV4): number | null {
    if (card.format === 'MULTIPLE_CHOICE') return card.correctIndex ?? 0;
    if (card.format === 'CLUE_ESCALATOR') return card.escalator?.correctIndex ?? 0;
    if (card.format === 'VISUAL_SPOTTER') return card.visualSpotter?.correctIndex ?? 0;
    return null;
  }

  // ==========================================================================
  // 1-TAP FULLSCREEN TOGGLE & BOTTOM BRASS PODIUM CONTROLS BINDING
  // ==========================================================================

  private bindFullscreenButton(): void {
    const fsBtn = this.mountEl.querySelector<HTMLButtonElement>('[data-v5sl-fullscreen-btn]');
    if (!fsBtn || typeof document === 'undefined') return;

    const syncIcon = (): void => {
      const isFs = Boolean(document.fullscreenElement);
      fsBtn.innerHTML = renderFullscreenIconSvg(isFs);
      fsBtn.setAttribute('aria-pressed', String(isFs));
    };

    syncIcon();
    fsBtn.addEventListener('click', () => {
      this.callbacks?.onInteractionFeedback?.('tap');
      try {
        if (document.fullscreenElement) {
          void document.exitFullscreen?.();
        } else {
          void document.documentElement.requestFullscreen?.();
        }
      } catch {
        // Ignore browser fullscreen policy restrictions
      }
    });

    const onFsChange = (): void => syncIcon();
    document.addEventListener('fullscreenchange', onFsChange);
    this.cleanupFns.push(() => document.removeEventListener('fullscreenchange', onFsChange));
  }

  private bindPodiumControls(): void {
    this.coin5050El?.addEventListener('click', () => {
      if (this.submitted || this.used5050 || this.coin5050El?.disabled) return;
      this.apply5050Elimination();
      this.callbacks?.onInteractionFeedback?.('tap');
      this.callbacks?.onUse5050?.();
    });

    this.coinClueEl?.addEventListener('click', () => {
      if (this.submitted || this.usedHint || this.coinClueEl?.disabled) return;
      this.revealHint();
      this.callbacks?.onInteractionFeedback?.('tap');
      this.callbacks?.onUseHint?.();
    });

    this.doubleSwitchEl?.addEventListener('click', () => {
      if (this.submitted || !this.doubleSwitchEl || this.doubleSwitchEl.disabled) return;
      this.doubleDownArmed = !this.doubleDownArmed;
      this.doubleSwitchEl.setAttribute('aria-pressed', String(this.doubleDownArmed));
      this.callbacks?.onInteractionFeedback?.('tap');
      this.callbacks?.onDoubleDownToggle?.(this.doubleDownArmed);
    });
  }

  private disablePodiumControls(): void {
    if (this.coin5050El) this.coin5050El.disabled = true;
    if (this.coinClueEl) this.coinClueEl.disabled = true;
    if (this.doubleSwitchEl) this.doubleSwitchEl.disabled = true;
  }

  // ==========================================================================
  // SUBMISSION, KEYBOARD SHORTCUTS, HELPERS & CLEANUP
  // ==========================================================================

  private emitSubmission(partial: Omit<AnswerSubmissionV4, 'elapsedSec'>): void {
    const elapsedSec = Math.max(
      0.1,
      Number(((performance.now() - this.mountedAtMs) / 1000).toFixed(2)),
    );
    const submission: AnswerSubmissionV4 = {
      ...partial,
      elapsedSec,
      used5050: this.used5050,
      usedHint: this.usedHint,
      doubleDownArmed: this.doubleDownArmed,
    };
    void this.callbacks?.onSubmit(submission);
  }

  private attachKeyboardShortcuts(): void {
    const onKeyDown = (ev: KeyboardEvent): void => {
      if (!this.ctx) return;
      const target = ev.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (this.revealed && (ev.key === 'Enter' || ev.key === ' ')) {
        ev.preventDefault();
        this.callbacks?.onNext?.();
        return;
      }

      if (
        !this.submitted &&
        (this.ctx.card.format === 'MULTIPLE_CHOICE' ||
          this.ctx.card.format === 'CLUE_ESCALATOR' ||
          this.ctx.card.format === 'VISUAL_SPOTTER')
      ) {
        const keyMap: Record<string, number> = {
          '1': 0,
          '2': 1,
          '3': 2,
          '4': 3,
          a: 0,
          b: 1,
          c: 2,
          d: 3,
        };
        const idx = keyMap[ev.key.toLowerCase()];
        if (idx !== undefined && this.choiceButtons[idx] && !this.choiceButtons[idx].disabled) {
          ev.preventDefault();
          this.commit4Choice(idx, this.ctx.card.format);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    this.cleanupFns.push(() => window.removeEventListener('keydown', onKeyDown));
  }

  private getEffectivePointBase(): number {
    if (!this.ctx) return 200;
    if (this.ctx.activeWagerPoints && this.ctx.activeWagerPoints > 0) {
      return this.ctx.activeWagerPoints;
    }
    const mult =
      this.ctx.doublePotMultiplier && this.ctx.doublePotMultiplier > 1
        ? this.ctx.doublePotMultiplier
        : 1;
    return this.ctx.tilePointValue * mult;
  }

  private getPrimaryStakeTag(ctx: SpotlightStageContextV5): string | null {
    if (ctx.activeWagerPoints && ctx.activeWagerPoints > 0) return 'POWER PLAY';
    if (ctx.isCrownWedgeTile) return 'CROWN WEDGE';
    if (ctx.isRivalBountyTile) return 'RIVAL BOUNTY';
    if (ctx.isLightningBlitz) return 'LIGHTNING BLITZ';
    if (ctx.doublePotMultiplier && ctx.doublePotMultiplier > 1) {
      return `${ctx.doublePotMultiplier}× WHEEL POT`;
    }
    return null;
  }

  private getFormatSubCue(card: QuestionCardV4): string | null {
    if (card.format === 'CLUE_ESCALATOR') {
      return 'ANSWER EARLY FOR 3× POINTS · BREAK SEALS FOR SHARPER CLUES';
    }
    if (card.format === 'MULTI_STRIKE' && card.multiStrike) {
      return card.multiStrike.strikeMode === 'SPOT_THE_IMPOSTER'
        ? 'SPOT THE SINGLE IMPOSTER & LOCK YOUR PICK'
        : `ILLUMINATE ALL ${card.multiStrike.targetCount} TRUE TARGETS & LOCK PICKS`;
    }
    if (card.format === 'VISUAL_SPOTTER' && card.visualSpotter) {
      return card.visualSpotter.visualKind === 'WORLD_REGION_MAP'
        ? 'LOCATE THE GLOWING STAGE BEACON ON THE WORLD MONITOR'
        : 'INSPECT THE STAGE MONITOR PLATE & LOCK YOUR ANSWER';
    }
    if (card.format === 'MATCH_4' && card.match4) {
      return card.match4.instruction;
    }
    if (card.format === 'SORT_4' && card.sort4) {
      return card.sort4.orderDirectionLabel;
    }
    return null;
  }

  private getHostCutoutUrl(pose: HostPoseV5): string {
    if (pose === 'hype') return V5_CAST_CUTOUTS.maxHype;
    if (pose === 'wince') return V5_CAST_CUTOUTS.maxWince;
    return V5_CAST_CUTOUTS.maxWelcome;
  }

  private teardownActiveState(): void {
    if (this.lockPulseTimer !== null) {
      window.clearTimeout(this.lockPulseTimer);
      this.lockPulseTimer = null;
    }
    this.activeGadgetHandle?.dispose?.();
    this.activeGadgetHandle = null;
    for (const fn of this.cleanupFns) {
      fn();
    }
    this.cleanupFns = [];
    this.choiceButtons = [];
    this.escalatorEnvelopes = [];
    this.multiButtons.clear();
    this.multiSelectedIds.clear();
    this.customGadgetSlotEl = null;
  }
}

export type {
  QuestionClockTickState,
  QuestionRevealPayload,
  QuestionStageCallbacks,
  QuestionStageContext,
  TimerPaceModeV4,
};
