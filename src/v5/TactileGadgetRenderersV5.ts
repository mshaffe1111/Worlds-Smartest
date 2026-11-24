// ============================================================================
// WORLD'S SMARTEST v5.0 — Tactile Format Gadget Renderers
// Pure sculpted physical stage gadgets (ZERO HTML slider inputs, ZERO
// glass-blur filters, ZERO OS color emojis, ZERO flat navy dashboard boxes):
//   1. PINPOINT_DIAL — 270° Brushed-Brass & Sapphire Analog Speedometer Gauge
//      with glowing WIN ARC + 2× BULLSEYE arcs, spun-brass hub, illuminated
//      tapered brass needle, Nixie-tube readout, knurled step knobs, and
//      sculpted gold LOCK DIAL plunger lever.
//   2. MATCH_4 — Mahogany & Riveted-Brass Stage Switchboard with 4×4 scalloped
//      emerald-and-brass enameled plaques, 3D protruding brass plug sockets,
//      thick multi-stroke braided glowing SVG Bezier power cables (tap-pair
//      AND live pointer-drag!), knurled brass LOCK 4 CABLES drum switch, and
//      Unplug reset latch.
//   3. SORT_4 — Mahogany & Brass Chronology Slotted Track (#1 TOP -> #4 BOTTOM)
//      with 4 beveled emerald-and-brass sliding plaques, smooth in-place
//      pointer drag-reorder + tactile brass ▲/▼ latch buttons, and sculpted gold
//      LOCK ORDER stage lever.
// ============================================================================

import type {
  AnswerSubmissionV4,
  EvaluatedAnswerV4,
  QuestionCardV4,
} from '../v4/contracts';

export type GadgetFeedbackKindV5 = 'tap' | 'lock_in';

export interface TactileGadgetOptionsV5 {
  /** Fired on rotary dial detents, cable snaps/unplugs, rack reorders, or lock-in plunges. */
  readonly onInteractionFeedback?: (kind: GadgetFeedbackKindV5) => void;
  /** Fired once when the contestant locks in their answer via the physical stage lever/drum. */
  readonly onSubmit: (submission: AnswerSubmissionV4) => void | Promise<void>;
  /** Optional getter bridged from the outer stage podium 2× Double Down switch. */
  readonly getDoubleDownArmed?: () => boolean;
  /** Optional getter bridged from the outer stage Clue coin state. */
  readonly getUsedHint?: () => boolean;
  /** Optional timestamp override (`performance.now()`) for accurate `elapsedSec` reporting. */
  readonly startedAtMs?: number;
}

export interface TactileGadgetHandleV5 {
  /** Surgically reveals a diegetic studio hint slip inside the gadget without resetting controls. */
  revealHint(text: string): void;
  /** Transitions the gadget into post-lock grading & truth reveal visuals. */
  showGadgetReveal(evalResult: EvaluatedAnswerV4): void;
  /** Disables interaction on Shot Clock timeout and returns the draft timeout submission. */
  lockForTimeout(): AnswerSubmissionV4;
  /** Returns the current live draft submission without locking or submitting. */
  getCurrentSubmission(): AnswerSubmissionV4;
  /** Cleans up global pointer, resize, timer, and keyboard listeners cleanly. */
  dispose(): void;
}

// ============================================================================
// SHARED HELPERS & FORMATTING (NEVER COMMAS IN 4-DIGIT YEARS!)
// ============================================================================

let gadgetUidCounter = 0;

function nextGadgetUid(prefix: string): string {
  gadgetUidCounter += 1;
  return `${prefix}${gadgetUidCounter}`;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isYearLikeDial(unitLabel: string, minVal: number, maxVal: number): boolean {
  const cleanUnit = unitLabel.trim().toLowerCase();
  if (cleanUnit !== '' && cleanUnit !== 'ce' && cleanUnit !== 'ad') {
    return false;
  }
  return minVal >= 500 && maxVal <= 2300;
}

/**
 * Formats a Pinpoint Dial value cleanly for ticks, Nixie readout, and reveal pins.
 * IRONCLAD RULE: NEVER puts commas in 4-digit years like `1969`!
 */
export function formatPinpointDialValueV5(
  value: number,
  unitLabel: string,
  minVal: number,
  maxVal: number,
  includeUnit = true,
): string {
  const safeVal = Number.isFinite(value) ? value : minVal;
  const isYear = isYearLikeDial(unitLabel, minVal, maxVal) && Number.isInteger(safeVal);
  let numStr: string;
  if (isYear) {
    numStr = String(Math.round(safeVal));
  } else if (Number.isInteger(safeVal)) {
    numStr = safeVal.toLocaleString('en-US');
  } else {
    numStr = Number(safeVal.toFixed(2)).toLocaleString('en-US');
  }
  const cleanUnit = unitLabel.trim();
  if (!includeUnit || !cleanUnit) {
    return numStr;
  }
  if (cleanUnit === '%' || cleanUnit === '°' || cleanUnit === '°C' || cleanUnit === '°F') {
    return `${numStr}${cleanUnit}`;
  }
  if (cleanUnit === 'C' || cleanUnit === 'F') {
    return `${numStr}°${cleanUnit}`;
  }
  return `${numStr} ${cleanUnit}`;
}

function formatStepDeltaLabel(delta: number): string {
  const sign = delta > 0 ? '+' : '-';
  const abs = Math.abs(delta);
  if (abs >= 1000 && abs % 1000 === 0) {
    return `${sign}${abs / 1000}k`;
  }
  return `${sign}${Number.isInteger(abs) ? abs : Number(abs.toFixed(2))}`;
}

function clampAndSnap(val: number, minVal: number, maxVal: number, step: number): number {
  const safeStep = step > 0 && Number.isFinite(step) ? step : 1;
  const snapped = minVal + Math.round((val - minVal) / safeStep) * safeStep;
  const clamped = Math.max(minVal, Math.min(maxVal, snapped));
  return Number.isInteger(safeStep) ? Math.round(clamped) : Number(clamped.toFixed(2));
}

function polarToCartesian(cx: number, cy: number, r: number, degFromTop: number): { x: number; y: number } {
  const rad = ((degFromTop - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const span = Math.max(0.25, endDeg - startDeg);
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const largeArc = span > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

// ============================================================================
// SELF-CONTAINED SCOPED STYLES (`<style id="v5-gadget-styles">`)
// ZERO glass-blur filters, ZERO flat navy CSS boxes, ZERO horizontal overflow!
// ============================================================================

const V5_GADGET_STYLES_ID = 'v5-gadget-styles';

const V5_GADGET_CSS = `
/* ==========================================================================
   WORLD'S SMARTEST v5.0 — Scoped Tactile Gadget Styles (#v5-gadget-styles)
   ========================================================================== */

.v5g-root,
.v5g-root * {
  box-sizing: border-box;
}

.v5g-root {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #fce9b8;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  user-select: none;
  -webkit-user-select: none;
}

/* Diegetic Brushed-Brass & Parchment Studio Clue Ribbon (hidden until revealed) */
.v5g-hint-slip {
  display: none;
  width: 100%;
  max-width: 560px;
  padding: 7px 14px;
  border-radius: 8px;
  background: linear-gradient(180deg, #322112 0%, #1d1209 100%);
  border: 1.5px solid #d7a347;
  box-shadow:
    inset 0 1px 0 rgba(255, 238, 178, 0.42),
    0 5px 14px rgba(0, 0, 0, 0.55);
  color: #ffefc4;
  font-size: clamp(11.5px, 3vw, 13.5px);
  line-height: 1.32;
  align-items: center;
  gap: 9px;
}

.v5g-hint-slip.is-open {
  display: flex;
  animation: v5gHintGlide 240ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes v5gHintGlide {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v5g-hint-tag {
  flex: 0 0 auto;
  padding: 2px 7px;
  border-radius: 4px;
  background: linear-gradient(180deg, #f3ca6e 0%, #b77c1f 100%);
  color: #1f1204;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: inset 0 1px 0 rgba(255, 250, 224, 0.7);
}

.v5g-hint-text {
  flex: 1 1 auto;
  min-width: 0;
}

/* ==========================================================================
   1. PINPOINT_DIAL — 270° Brushed-Brass & Sapphire Analog Speedometer Gauge
   ========================================================================== */

.v5g-dial-shell {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.v5g-dial-stage {
  position: relative;
  width: min(100%, 342px);
  aspect-ratio: 420 / 356;
  display: flex;
  align-items: center;
  justify-content: center;
}

.v5g-dial-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
  touch-action: none;
  cursor: grab;
  filter: drop-shadow(0 12px 22px rgba(2, 6, 18, 0.72));
}

.v5g-dial-svg.is-dragging {
  cursor: grabbing;
}

.v5g-dial-svg.is-locked {
  cursor: default;
}

/* Nixie-Tube Numeric Readout nestled cleanly in the lower dial window */
.v5g-nixie-bezel {
  position: absolute;
  left: 50%;
  top: 72.5%;
  transform: translate(-50%, -50%);
  padding: 4px 7px;
  border-radius: 13px;
  background: linear-gradient(180deg, #f0c96f 0%, #9b6b21 48%, #5b3a0c 100%);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.72),
    inset 0 1px 1px rgba(255, 248, 210, 0.85),
    inset 0 -1px 2px rgba(42, 22, 4, 0.9);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 3;
}

.v5g-nixie-window {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 3px 6px;
  border-radius: 9px;
  background: linear-gradient(180deg, #1b0f08 0%, #0d0704 65%, #231107 100%);
  border: 1.5px solid #43280d;
  box-shadow:
    inset 0 3px 7px rgba(0, 0, 0, 0.92),
    inset 0 -2px 6px rgba(255, 134, 38, 0.16);
}

.v5g-nixie-tube {
  position: relative;
  min-width: 22px;
  height: 31px;
  padding: 0 2px;
  border-radius: 5px;
  background:
    radial-gradient(ellipse at 50% 42%, rgba(255, 132, 32, 0.22) 0%, rgba(28, 12, 4, 0.92) 78%),
    repeating-linear-gradient(
      60deg,
      rgba(255, 194, 120, 0.04) 0px,
      rgba(255, 194, 120, 0.04) 1px,
      transparent 1px,
      transparent 4px
    );
  border: 1px solid rgba(196, 122, 52, 0.34);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.88),
    inset 0 -1px 3px rgba(255, 150, 56, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 22px;
  line-height: 1;
  color: #ffb14a;
  text-shadow:
    0 0 3px #fff1c2,
    0 0 8px #ff8a1f,
    0 0 16px rgba(255, 92, 0, 0.9);
  letter-spacing: 0;
}

.v5g-nixie-tube::after {
  content: '';
  position: absolute;
  inset: 1px 2px auto 2px;
  height: 7px;
  border-radius: 3px;
  background: linear-gradient(180deg, rgba(255, 240, 210, 0.22), rgba(255, 240, 210, 0));
  pointer-events: none;
}

.v5g-nixie-tube.is-compact {
  min-width: 17px;
  height: 27px;
  font-size: 18px;
}

.v5g-nixie-tube.is-punct {
  min-width: 11px;
  font-size: 18px;
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}

.v5g-nixie-unit {
  padding: 1px 7px;
  border-radius: 4px;
  background: linear-gradient(180deg, #2d1b0c 0%, #180d05 100%);
  border: 1px solid rgba(232, 184, 92, 0.55);
  color: #ffe299;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.15;
}

/* Knurled Brass Rotary Step Knobs flanking the lower bezel shoulders */
.v5g-knob-btn {
  position: absolute;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background:
    repeating-conic-gradient(
      from 0deg,
      #ffe9a6 0deg 4deg,
      #7c4f13 4deg 8deg,
      #d69b3a 8deg 12deg
    );
  box-shadow:
    0 7px 14px rgba(0, 0, 0, 0.72),
    0 0 0 2px #51320b,
    inset 0 2px 3px rgba(255, 248, 210, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: transform 90ms ease, filter 120ms ease;
  touch-action: manipulation;
}

.v5g-knob-btn::before {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  background: radial-gradient(circle at 36% 30%, #ffeab0 0%, #c68a2b 55%, #6b4310 100%);
  border: 1.5px solid #fff0bc;
  box-shadow:
    inset 0 2px 4px rgba(255, 248, 215, 0.65),
    inset 0 -3px 5px rgba(56, 32, 5, 0.8);
}

.v5g-knob-btn span {
  position: relative;
  z-index: 1;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #2f1b05;
  text-shadow: 0 1px 0 rgba(255, 239, 184, 0.72);
  letter-spacing: -0.02em;
}

.v5g-knob-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.v5g-knob-btn:active:not(:disabled),
.v5g-knob-btn.is-pressed {
  transform: scale(0.93) rotate(-9deg);
}

.v5g-knob-btn.is-plus:active:not(:disabled),
.v5g-knob-btn.is-plus.is-pressed {
  transform: scale(0.93) rotate(9deg);
}

.v5g-knob-btn:disabled {
  opacity: 0.56;
  cursor: default;
  filter: saturate(0.65);
}

.v5g-knob-fine-left {
  left: 4.5%;
  bottom: 5.5%;
}

.v5g-knob-fine-right {
  right: 4.5%;
  bottom: 5.5%;
}

/* Optional coarse -10 / +10 satellite knurled knobs when span > 150 */
.v5g-knob-coarse {
  width: 40px;
  height: 40px;
  z-index: 6;
}

.v5g-knob-coarse::before {
  inset: 4px;
}

.v5g-knob-coarse span {
  font-size: 11.5px;
}

.v5g-knob-coarse-left {
  left: 0%;
  bottom: 24.5%;
}

.v5g-knob-coarse-right {
  right: 0%;
  bottom: 24.5%;
}

/* Dial Reveal Verdict Strip (appears cleanly on reveal) */
.v5g-dial-reveal-strip {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 5px 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, #1b2844 0%, #0d162a 100%);
  border: 1.5px solid #e3b24c;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.55);
  font-size: 12.5px;
  font-weight: 700;
  color: #fff2cc;
}

.v5g-dial-reveal-strip.is-visible {
  display: inline-flex;
}

.v5g-dial-reveal-strip.is-bullseye {
  border-color: #ffd54f;
  background: linear-gradient(180deg, #4b340a 0%, #241703 100%);
  color: #ffea9e;
}

.v5g-dial-reveal-strip.is-win {
  border-color: #36f29c;
  background: linear-gradient(180deg, #0c4430 0%, #062419 100%);
  color: #b4ffdc;
}

.v5g-dial-reveal-strip.is-miss {
  border-color: #f06772;
  background: linear-gradient(180deg, #47151d 0%, #24090e 100%);
  color: #ffd2d6;
}

/* Sculpted Gold LOCK DIAL T-Plunger Lever */
.v5g-plunger-mount {
  position: relative;
  width: min(100%, 300px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2px;
}

.v5g-plunger-btn {
  position: relative;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  touch-action: manipulation;
}

.v5g-plunger-btn:focus-visible {
  outline: 2px solid #ffd86b;
  outline-offset: 4px;
  border-radius: 10px;
}

.v5g-plunger-handle {
  position: relative;
  width: 96px;
  height: 17px;
  border-radius: 9px;
  background: linear-gradient(180deg, #fff5c4 0%, #dfa63f 42%, #805212 85%, #bc8428 100%);
  border: 1.5px solid #593608;
  box-shadow:
    0 5px 10px rgba(0, 0, 0, 0.65),
    inset 0 2px 2px rgba(255, 252, 232, 0.9);
  transition: transform 130ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 3;
}

.v5g-plunger-handle::before,
.v5g-plunger-handle::after {
  content: '';
  position: absolute;
  top: 2px;
  bottom: 2px;
  width: 5px;
  border-radius: 3px;
  background: linear-gradient(180deg, #fff2a8 0%, #ff9d1c 50%, #ffcb47 100%);
  box-shadow: 0 0 8px rgba(255, 174, 38, 0.95);
}

.v5g-plunger-handle::before {
  left: 11px;
}

.v5g-plunger-handle::after {
  right: 11px;
}

.v5g-plunger-shaft {
  width: 24px;
  height: 12px;
  margin-top: -2px;
  background: linear-gradient(90deg, #5e3b0d 0%, #f5ce74 36%, #fff1ba 52%, #b0781f 74%, #4f2f08 100%);
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.55);
  transition: transform 130ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 2;
}

.v5g-plunger-housing {
  position: relative;
  min-width: 176px;
  height: 40px;
  margin-top: -2px;
  padding: 5px 18px;
  border-radius: 10px 10px 7px 7px;
  background: linear-gradient(180deg, #f3cc73 0%, #b77e23 45%, #69410d 100%);
  border: 1.5px solid #4d2e07;
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.72),
    inset 0 1px 1px rgba(255, 248, 212, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 3;
}

.v5g-plunger-lightbar {
  width: 6px;
  height: 24px;
  border-radius: 3px;
  background: linear-gradient(180deg, #fff5b8 0%, #ffaa24 55%, #e86b08 100%);
  box-shadow:
    0 0 9px rgba(255, 176, 38, 0.95),
    inset 0 1px 1px #ffffff;
}

.v5g-plunger-plate {
  padding: 5px 16px;
  border-radius: 6px;
  background: linear-gradient(180deg, #32210d 0%, #1c1105 60%, #2a1a08 100%);
  border: 1.5px solid #f0c76b;
  box-shadow:
    inset 0 2px 5px rgba(0, 0, 0, 0.86),
    0 0 10px rgba(255, 186, 62, 0.28);
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 14.5px;
  letter-spacing: 0.08em;
  color: #ffe9a8;
  text-shadow: 0 0 10px rgba(255, 198, 72, 0.55);
  white-space: nowrap;
}

.v5g-plunger-base {
  width: 244px;
  height: 10px;
  margin-top: -3px;
  border-radius: 4px 4px 12px 12px;
  background: linear-gradient(180deg, #d7a041 0%, #805214 60%, #422707 100%);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.72);
  z-index: 1;
}

.v5g-plunger-btn:hover:not(:disabled) .v5g-plunger-plate {
  color: #fff6d2;
  border-color: #ffe591;
  box-shadow:
    inset 0 2px 5px rgba(0, 0, 0, 0.8),
    0 0 16px rgba(255, 206, 86, 0.55);
}

.v5g-plunger-btn:active:not(:disabled) .v5g-plunger-handle,
.v5g-plunger-btn.is-plunged .v5g-plunger-handle {
  transform: translateY(7px);
}

.v5g-plunger-btn:active:not(:disabled) .v5g-plunger-shaft,
.v5g-plunger-btn.is-plunged .v5g-plunger-shaft {
  transform: translateY(5px);
}

.v5g-plunger-btn.is-plunged .v5g-plunger-lightbar {
  background: linear-gradient(180deg, #c6ffe4 0%, #2ef29a 55%, #0c9c59 100%);
  box-shadow: 0 0 11px rgba(46, 242, 154, 0.95);
}

.v5g-plunger-btn:disabled {
  cursor: default;
}

/* ==========================================================================
   2. MATCH_4 — Mahogany & Riveted Brass Stage Switchboard
   ========================================================================== */

.v5g-mahogany-frame {
  position: relative;
  width: 100%;
  border-radius: 12px;
  padding: 5px;
  background: linear-gradient(145deg, #f3cf7b 0%, #9b681d 28%, #5e380c 52%, #d59d3d 78%, #6d4410 100%);
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.76),
    inset 0 1px 1px rgba(255, 249, 218, 0.85);
}

.v5g-mahogany-board {
  position: relative;
  width: 100%;
  border-radius: 8px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 198, 96, 0.22) 0%, rgba(255, 198, 96, 0) 56%),
    repeating-linear-gradient(
      90deg,
      rgba(96, 36, 17, 0.34) 0px,
      rgba(56, 17, 8, 0.44) 6px,
      rgba(112, 42, 19, 0.22) 13px,
      rgba(44, 12, 5, 0.5) 21px
    ),
    linear-gradient(180deg, #4b1d10 0%, #2f1008 55%, #200904 100%);
  border: 1.5px solid #2a0e06;
  box-shadow:
    inset 0 0 22px rgba(0, 0, 0, 0.72),
    inset 0 1px 0 rgba(255, 214, 140, 0.22);
  overflow: visible;
}

/* 4 Riveted Brass Corner L-Brackets */
.v5g-corner-bracket {
  position: absolute;
  width: 24px;
  height: 24px;
  pointer-events: none;
  z-index: 8;
}

.v5g-corner-tl { top: -2px; left: -2px; }
.v5g-corner-tr { top: -2px; right: -2px; transform: scaleX(-1); }
.v5g-corner-bl { bottom: -2px; left: -2px; transform: scaleY(-1); }
.v5g-corner-br { bottom: -2px; right: -2px; transform: scale(-1); }

/* Switchboard Arena Grid */
.v5g-match-arena {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(112px, 0.92fr) minmax(0, 1.08fr);
  align-items: stretch;
  padding: 14px 12px 16px;
  gap: 0;
  touch-action: none;
}

.v5g-match-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 6;
  overflow: visible;
}

.v5g-match-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  position: relative;
  z-index: 4;
}

.v5g-match-row-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.v5g-match-row-wrap.is-left {
  flex-direction: row;
}

.v5g-match-row-wrap.is-right {
  flex-direction: row-reverse;
}

.v5g-match-plaque {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 58px;
  padding: 8px 13px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fce8b2;
  touch-action: none;
  transition: transform 110ms ease, filter 130ms ease;
}

.v5g-match-plaque:focus-visible {
  outline: 2px solid #ffe27a;
  outline-offset: 2px;
  border-radius: 6px;
}

.v5g-plaque-svg-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  filter: drop-shadow(0 5px 8px rgba(0, 0, 0, 0.65));
}

.v5g-plaque-label {
  position: relative;
  z-index: 2;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: clamp(11.5px, 2.5vw, 15px);
  line-height: 1.18;
  color: #fce9b8;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
  overflow-wrap: break-word;
  word-break: normal;
  max-width: 100%;
}

.v5g-plaque-correction {
  position: relative;
  z-index: 2;
  margin-top: 3px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(24, 12, 4, 0.88);
  border: 1px solid #f5c65c;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: #ffe391;
  line-height: 1.2;
}

.v5g-match-plaque:hover:not(:disabled) {
  filter: brightness(1.1);
}

.v5g-match-plaque.is-active-pick {
  transform: scale(1.03);
  filter: brightness(1.22) drop-shadow(0 0 10px rgba(255, 214, 92, 0.72));
}

.v5g-match-plaque.is-drop-target {
  transform: scale(1.04);
  filter: brightness(1.25) drop-shadow(0 0 12px rgba(64, 240, 255, 0.8));
}

.v5g-match-plaque.is-correct .v5g-plaque-svg-bg {
  filter: drop-shadow(0 0 10px rgba(46, 242, 154, 0.72));
}

.v5g-match-plaque.is-wrong .v5g-plaque-svg-bg {
  filter: drop-shadow(0 0 9px rgba(242, 86, 102, 0.72));
}

.v5g-match-plaque:disabled {
  cursor: default;
}

/* Protruding 3D Brass Plug Socket */
.v5g-socket-btn {
  position: relative;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  margin: 0 -2px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  transition: transform 110ms ease;
}

.v5g-socket-btn svg {
  width: 32px;
  height: 32px;
  display: block;
  overflow: visible;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.7));
}

.v5g-socket-btn.is-active-pick {
  transform: scale(1.14);
}

.v5g-socket-btn.is-drop-target {
  transform: scale(1.18);
}

/* Bottom Knurled Brass LOCK 4 CABLES Drum Switch + Unplug Latch */
.v5g-switchboard-footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: -10px;
  padding: 0 10px 4px;
  z-index: 9;
}

.v5g-drum-btn {
  position: relative;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  transition: transform 110ms ease, filter 140ms ease;
}

.v5g-drum-btn:focus-visible {
  outline: 2px solid #ffe080;
  outline-offset: 4px;
  border-radius: 10px;
}

.v5g-drum-wheel {
  width: 18px;
  height: 44px;
  border-radius: 5px;
  background: repeating-linear-gradient(
    180deg,
    #fff1b8 0px,
    #d89d3b 2px,
    #5f3a0b 4px,
    #a56e1d 6px
  );
  border: 1.5px solid #492a06;
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.72),
    inset 0 1px 1px rgba(255, 250, 224, 0.8);
}

.v5g-drum-body {
  position: relative;
  min-width: 168px;
  padding: 5px 10px 6px;
  border-radius: 11px;
  background: linear-gradient(180deg, #f8d888 0%, #c68a2b 32%, #6d430d 84%, #a8711e 100%);
  border: 1.5px solid #4d2d06;
  box-shadow:
    0 9px 18px rgba(0, 0, 0, 0.78),
    inset 0 2px 2px rgba(255, 250, 220, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.v5g-drum-leds {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.v5g-drum-led {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #231407;
  border: 1px solid #6b4514;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.85);
  transition: background-color 160ms ease, box-shadow 160ms ease;
}

.v5g-drum-led.is-lit {
  border-color: #fff6d1;
}

.v5g-drum-faceplate {
  width: 100%;
  padding: 6px 14px;
  border-radius: 7px;
  background: linear-gradient(180deg, #106950 0%, #094534 55%, #062b21 100%);
  border: 1.5px solid #f0c76b;
  box-shadow:
    inset 0 2px 4px rgba(130, 255, 212, 0.25),
    inset 0 -3px 6px rgba(0, 0, 0, 0.65);
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.06em;
  color: #ffe599;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
  text-align: center;
  line-height: 1.1;
  white-space: nowrap;
}

.v5g-drum-btn:disabled {
  cursor: not-allowed;
  filter: saturate(0.55) brightness(0.84);
}

.v5g-drum-btn:not(:disabled) .v5g-drum-faceplate {
  box-shadow:
    inset 0 2px 6px rgba(120, 255, 206, 0.42),
    0 0 14px rgba(46, 242, 154, 0.42);
  color: #fff4c4;
}

.v5g-drum-btn:hover:not(:disabled) {
  filter: brightness(1.09);
}

.v5g-drum-btn:active:not(:disabled),
.v5g-drum-btn.is-locked {
  transform: translateY(2px) scale(0.98);
}

.v5g-unplug-btn {
  position: relative;
  height: 36px;
  padding: 0 11px;
  border-radius: 7px;
  background: linear-gradient(180deg, #714a1e 0%, #42270c 55%, #2a1706 100%);
  border: 1.5px solid #c9923a;
  box-shadow:
    0 5px 12px rgba(0, 0, 0, 0.65),
    inset 0 1px 0 rgba(255, 232, 166, 0.45);
  color: #f6d98f;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  touch-action: manipulation;
  transition: transform 90ms ease, filter 120ms ease;
}

.v5g-unplug-btn:hover:not(:disabled) {
  filter: brightness(1.16);
}

.v5g-unplug-btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.96);
}

.v5g-unplug-btn:disabled {
  opacity: 0.44;
  cursor: default;
}

/* ==========================================================================
   3. SORT_4 — Mahogany & Brass Chronology Slotted Track
   ========================================================================== */

.v5g-sort-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 14px 7px;
  background: linear-gradient(180deg, #5d3a12 0%, #372009 55%, #251405 100%);
  border-bottom: 1.5px solid #c99238;
  border-radius: 7px 7px 0 0;
  box-shadow: inset 0 1px 0 rgba(255, 235, 174, 0.35);
}

.v5g-sort-axis-tag {
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 4px;
  background: linear-gradient(180deg, #f3ca6e 0%, #b57b1e 100%);
  color: #211204;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: 10.5px;
  letter-spacing: 0.04em;
  box-shadow: inset 0 1px 0 rgba(255, 250, 224, 0.75);
}

.v5g-sort-axis-title {
  flex: 1 1 auto;
  min-width: 0;
  text-align: center;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: clamp(11px, 2.7vw, 13.5px);
  color: #ffe7a4;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v5g-sort-track-area {
  position: relative;
  padding: 12px 12px 16px;
}

/* Recessed Vertical Machined-Brass Slotted Track Guide behind plaques */
.v5g-sort-rail {
  position: absolute;
  top: 12px;
  bottom: 16px;
  left: 33px;
  width: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, #1b0b04 0%, #7d5218 22%, #311a08 50%, #a57022 78%, #1a0a04 100%);
  border: 1px solid rgba(242, 198, 102, 0.45);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.88);
  pointer-events: none;
  z-index: 1;
}

.v5g-sort-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 9px;
  z-index: 3;
}

.v5g-sort-plaque {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 56px;
  padding: 6px 8px 6px 7px;
  border-radius: 9px;
  background: linear-gradient(180deg, #115c47 0%, #0a3c2f 55%, #072920 100%);
  border: 2px solid #d59d3d;
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.62),
    inset 0 1px 0 rgba(255, 240, 184, 0.52),
    inset 0 0 0 1px rgba(10, 26, 20, 0.72);
  cursor: grab;
  touch-action: none;
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
}

.v5g-sort-plaque:hover:not(.is-locked) {
  border-color: #ffe28a;
  filter: brightness(1.07);
}

.v5g-sort-plaque.is-dragging {
  cursor: grabbing;
  z-index: 12;
  transform: scale(1.025);
  border-color: #fff0ad;
  box-shadow:
    0 14px 26px rgba(0, 0, 0, 0.8),
    0 0 16px rgba(255, 212, 92, 0.58),
    inset 0 1px 0 rgba(255, 248, 214, 0.8);
}

.v5g-sort-plaque.is-locked {
  cursor: default;
}

.v5g-sort-plaque.is-correct {
  background: linear-gradient(180deg, #127051 0%, #094a34 100%);
  border-color: #46f5a4;
  box-shadow: 0 0 14px rgba(46, 242, 154, 0.45), 0 6px 12px rgba(0, 0, 0, 0.62);
}

.v5g-sort-plaque.is-wrong {
  background: linear-gradient(180deg, #651c27 0%, #3d0f17 100%);
  border-color: #f4727d;
  box-shadow: 0 0 12px rgba(244, 114, 125, 0.42), 0 6px 12px rgba(0, 0, 0, 0.62);
}

.v5g-sort-rank-badge {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 28%, #fff1b8 0%, #d49936 56%, #74480e 100%);
  border: 1.5px solid #492a06;
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.62),
    inset 0 1px 1px rgba(255, 250, 224, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: 13px;
  color: #241304;
}

.v5g-sort-grip {
  flex: 0 0 auto;
  width: 12px;
  height: 28px;
  border-radius: 3px;
  background: repeating-linear-gradient(
    180deg,
    #f2cb72 0px,
    #f2cb72 2px,
    #523209 2px,
    #523209 5px
  );
  opacity: 0.78;
}

.v5g-sort-copy {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.v5g-sort-label {
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: clamp(12px, 3vw, 15px);
  line-height: 1.2;
  color: #fce9b8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.82);
  overflow-wrap: break-word;
}

.v5g-sort-reveal-pill {
  display: none;
  align-self: flex-start;
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(20, 10, 4, 0.86);
  border: 1px solid #f0c25d;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: #ffe394;
}

.v5g-sort-reveal-pill.is-visible {
  display: inline-block;
}

.v5g-sort-latches {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 5px;
}

.v5g-latch-btn {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: 1.5px solid #4c2d06;
  background: linear-gradient(180deg, #fae096 0%, #c98f2e 52%, #7d4e11 100%);
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.6),
    inset 0 1px 1px rgba(255, 250, 224, 0.85);
  color: #261404;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  touch-action: manipulation;
  transition: transform 80ms ease, filter 110ms ease;
}

.v5g-latch-btn:hover:not(:disabled) {
  filter: brightness(1.12);
}

.v5g-latch-btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.93);
}

.v5g-latch-btn:disabled {
  opacity: 0.36;
  cursor: default;
  filter: saturate(0.5);
}

/* Sculpted Gold LOCK ORDER Stage Lever */
.v5g-lever-footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
  padding-bottom: 4px;
  z-index: 9;
}

.v5g-gold-lever-btn {
  position: relative;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  transition: transform 110ms ease, filter 130ms ease;
}

.v5g-gold-lever-btn:focus-visible {
  outline: 2px solid #ffe48a;
  outline-offset: 4px;
  border-radius: 10px;
}

.v5g-gold-lever-housing {
  position: relative;
  min-width: 210px;
  height: 46px;
  padding: 6px 18px;
  border-radius: 10px;
  background: linear-gradient(180deg, #fff0b4 0%, #dfa43c 38%, #855413 84%, #be8426 100%);
  border: 1.5px solid #4e2e06;
  box-shadow:
    0 9px 18px rgba(0, 0, 0, 0.78),
    inset 0 2px 2px rgba(255, 252, 228, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
}

.v5g-gold-lever-plate {
  padding: 5px 18px;
  border-radius: 6px;
  background: linear-gradient(180deg, #2e1d0a 0%, #170e04 60%, #271707 100%);
  border: 1.5px solid #f7d176;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.86),
    0 0 12px rgba(255, 198, 72, 0.35);
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 14.5px;
  letter-spacing: 0.08em;
  color: #ffecac;
  text-shadow: 0 0 10px rgba(255, 198, 72, 0.55);
  white-space: nowrap;
}

.v5g-gold-lever-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.v5g-gold-lever-btn:active:not(:disabled),
.v5g-gold-lever-btn.is-locked {
  transform: translateY(2px) scale(0.98);
}

.v5g-gold-lever-btn.is-locked .v5g-plunger-lightbar {
  background: linear-gradient(180deg, #c6ffe4 0%, #2ef29a 55%, #0c9c59 100%);
  box-shadow: 0 0 11px rgba(46, 242, 154, 0.95);
}

.v5g-gold-lever-btn:disabled {
  cursor: default;
}

/* ==========================================================================
   MOBILE PORTRAIT TUNING (390x844 & 360x640 — 100% ABOVE y=844px, 0px H-OVERFLOW!)
   ========================================================================== */

@media (max-width: 480px) {
  .v5g-root {
    gap: 5px;
  }

  .v5g-dial-stage {
    width: min(100%, 296px);
  }

  .v5g-nixie-bezel {
    padding: 3px 5px;
    border-radius: 10px;
  }

  .v5g-nixie-window {
    gap: 2px;
    padding: 2px 5px;
  }

  .v5g-nixie-tube {
    min-width: 18px;
    height: 26px;
    font-size: 18px;
  }

  .v5g-nixie-tube.is-compact {
    min-width: 14px;
    height: 23px;
    font-size: 15px;
  }

  .v5g-knob-btn {
    width: 48px;
    height: 48px;
  }

  .v5g-knob-btn span {
    font-size: 14px;
  }

  .v5g-knob-fine-left {
    left: 3.5%;
    bottom: 5%;
  }

  .v5g-knob-fine-right {
    right: 3.5%;
    bottom: 5%;
  }

  .v5g-knob-coarse {
    width: 36px;
    height: 36px;
  }

  .v5g-knob-coarse span {
    font-size: 10.5px;
  }

  .v5g-knob-coarse-left {
    left: 0%;
    bottom: 23.5%;
  }

  .v5g-knob-coarse-right {
    right: 0%;
    bottom: 23.5%;
  }

  .v5g-plunger-handle {
    width: 82px;
    height: 15px;
  }

  .v5g-plunger-shaft {
    height: 9px;
  }

  .v5g-plunger-housing {
    min-width: 162px;
    height: 36px;
    padding: 4px 14px;
  }

  .v5g-plunger-plate {
    padding: 4px 13px;
    font-size: 13px;
  }

  .v5g-plunger-base {
    width: 210px;
    height: 8px;
  }

  /* Match-4 mobile portrait: generous plaques + crisp center cable channel */
  .v5g-match-arena {
    grid-template-columns: minmax(0, 1.15fr) minmax(72px, 0.72fr) minmax(0, 1.15fr);
    padding: 10px 7px 14px;
  }

  .v5g-match-col {
    gap: 8px;
  }

  .v5g-match-plaque {
    min-height: 52px;
    padding: 6px 8px;
  }

  .v5g-plaque-label {
    font-size: clamp(10.5px, 2.95vw, 13px);
    line-height: 1.15;
  }

  .v5g-socket-btn {
    width: 26px;
    height: 26px;
    margin: 0 -2px;
  }

  .v5g-socket-btn svg {
    width: 26px;
    height: 26px;
  }

  .v5g-drum-wheel {
    width: 14px;
    height: 38px;
  }

  .v5g-drum-body {
    min-width: 148px;
    padding: 4px 8px 5px;
  }

  .v5g-drum-faceplate {
    padding: 5px 10px;
    font-size: 12.5px;
  }

  .v5g-unplug-btn {
    height: 32px;
    padding: 0 8px;
    font-size: 10px;
  }

  /* Sort-4 mobile portrait */
  .v5g-sort-header {
    padding: 6px 9px;
    gap: 5px;
  }

  .v5g-sort-axis-tag {
    padding: 2px 6px;
    font-size: 9.5px;
  }

  .v5g-sort-track-area {
    padding: 9px 8px 13px;
  }

  .v5g-sort-rail {
    left: 26px;
    width: 12px;
  }

  .v5g-sort-list {
    gap: 7px;
  }

  .v5g-sort-plaque {
    min-height: 50px;
    padding: 5px 6px 5px 6px;
    gap: 6px;
  }

  .v5g-sort-rank-badge {
    width: 28px;
    height: 28px;
    font-size: 11.5px;
  }

  .v5g-sort-grip {
    width: 9px;
    height: 24px;
  }

  .v5g-sort-label {
    font-size: clamp(11.5px, 3.2vw, 13.5px);
  }

  .v5g-latch-btn {
    width: 30px;
    height: 30px;
  }

  .v5g-gold-lever-housing {
    min-width: 184px;
    height: 40px;
    padding: 5px 14px;
  }

  .v5g-gold-lever-plate {
    padding: 4px 14px;
    font-size: 13px;
  }
}

@media (max-width: 365px) {
  .v5g-dial-stage {
    width: min(100%, 268px);
  }

  .v5g-match-arena {
    grid-template-columns: minmax(0, 1.18fr) minmax(60px, 0.62fr) minmax(0, 1.18fr);
    padding: 8px 5px 12px;
  }

  .v5g-match-plaque {
    min-height: 48px;
    padding: 5px 6px;
  }
}

/* ==========================================================================
   PHONE LANDSCAPE TUNING (844x390, 932x430, 640x360 — ZERO CLIPPING!)
   Designed to sit crisply inside the right half of a 2-column split-stage!
   ========================================================================== */

@media (max-height: 500px) and (orientation: landscape) {
  .v5g-root {
    gap: 4px;
    max-width: 100%;
  }

  .v5g-hint-slip {
    padding: 4px 10px;
    font-size: 11px;
  }

  /* Pinpoint Dial compact landscape fit (total height ~248px <= 360px!) */
  .v5g-dial-shell {
    gap: 2px;
    max-width: 340px;
  }

  .v5g-dial-stage {
    width: min(100%, 236px);
  }

  .v5g-nixie-bezel {
    padding: 2px 4px;
    border-radius: 8px;
  }

  .v5g-nixie-window {
    gap: 2px;
    padding: 2px 4px;
  }

  .v5g-nixie-tube {
    min-width: 15px;
    height: 22px;
    font-size: 15px;
  }

  .v5g-nixie-tube.is-compact {
    min-width: 12px;
    height: 19px;
    font-size: 13px;
  }

  .v5g-nixie-unit {
    font-size: 8px;
    padding: 0 5px;
  }

  .v5g-knob-btn {
    width: 40px;
    height: 40px;
  }

  .v5g-knob-btn span {
    font-size: 12px;
  }

  .v5g-knob-coarse {
    width: 32px;
    height: 32px;
  }

  .v5g-knob-coarse span {
    font-size: 10px;
  }

  .v5g-plunger-mount {
    padding-top: 0;
  }

  .v5g-plunger-handle {
    width: 72px;
    height: 12px;
  }

  .v5g-plunger-shaft {
    width: 18px;
    height: 7px;
  }

  .v5g-plunger-housing {
    min-width: 146px;
    height: 30px;
    padding: 3px 12px;
    gap: 7px;
  }

  .v5g-plunger-lightbar {
    width: 5px;
    height: 18px;
  }

  .v5g-plunger-plate {
    padding: 3px 11px;
    font-size: 11.5px;
  }

  .v5g-plunger-base {
    width: 180px;
    height: 6px;
  }

  /* Match-4 compact landscape fit (total height ~236px <= 360px!) */
  .v5g-mahogany-frame {
    padding: 4px;
  }

  .v5g-corner-bracket {
    width: 18px;
    height: 18px;
  }

  .v5g-match-arena {
    grid-template-columns: minmax(0, 1.12fr) minmax(68px, 0.72fr) minmax(0, 1.12fr);
    padding: 7px 7px 11px;
  }

  .v5g-match-col {
    gap: 5px;
  }

  .v5g-match-plaque {
    min-height: 40px;
    padding: 4px 8px;
  }

  .v5g-plaque-label {
    font-size: 11px;
    line-height: 1.12;
  }

  .v5g-socket-btn {
    width: 24px;
    height: 24px;
  }

  .v5g-socket-btn svg {
    width: 24px;
    height: 24px;
  }

  .v5g-switchboard-footer {
    margin-top: -8px;
    gap: 7px;
  }

  .v5g-drum-wheel {
    width: 12px;
    height: 32px;
  }

  .v5g-drum-body {
    min-width: 136px;
    padding: 3px 7px 4px;
    gap: 2px;
  }

  .v5g-drum-led {
    width: 6px;
    height: 6px;
  }

  .v5g-drum-faceplate {
    padding: 4px 9px;
    font-size: 11px;
  }

  .v5g-unplug-btn {
    height: 28px;
    padding: 0 8px;
    font-size: 9.5px;
  }

  /* Sort-4 compact landscape fit (total height ~246px <= 360px!) */
  .v5g-sort-header {
    padding: 5px 8px;
  }

  .v5g-sort-axis-tag {
    padding: 1px 6px;
    font-size: 9px;
  }

  .v5g-sort-axis-title {
    font-size: 11px;
  }

  .v5g-sort-track-area {
    padding: 7px 8px 11px;
  }

  .v5g-sort-rail {
    top: 7px;
    bottom: 11px;
    left: 24px;
    width: 10px;
  }

  .v5g-sort-list {
    gap: 5px;
  }

  .v5g-sort-plaque {
    min-height: 40px;
    padding: 4px 6px;
    gap: 6px;
  }

  .v5g-sort-rank-badge {
    width: 25px;
    height: 25px;
    font-size: 10.5px;
  }

  .v5g-sort-grip {
    width: 8px;
    height: 20px;
  }

  .v5g-sort-label {
    font-size: 11.5px;
    line-height: 1.12;
  }

  .v5g-latch-btn {
    width: 27px;
    height: 27px;
  }

  .v5g-lever-footer {
    margin-top: -8px;
  }

  .v5g-gold-lever-housing {
    min-width: 164px;
    height: 34px;
    padding: 4px 12px;
  }

  .v5g-gold-lever-plate {
    padding: 3px 12px;
    font-size: 11.5px;
  }
}
`;

/**
 * Ensures the scoped `<style id="v5-gadget-styles">` block is mounted once in `<head>`.
 */
export function ensureGadgetStylesV5(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(V5_GADGET_STYLES_ID)) return;
  const style = document.createElement('style');
  style.id = V5_GADGET_STYLES_ID;
  style.textContent = V5_GADGET_CSS;
  document.head.appendChild(style);
}

// ============================================================================
// SHARED DECORATIVE SVG BUILDERS (RIVETED CORNER BRACKETS, PLAQUES, SOCKETS)
// ============================================================================

function renderRivetedBrassCornerSvg(posClass: string, uid: string): string {
  return `
    <svg class="v5g-corner-bracket ${posClass}" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M 1 1 L 26 1 L 26 7 L 11 7 Q 7 7 7 11 L 7 26 L 1 26 Z" fill="url(#${uid}-brass-bevel)" stroke="#3f2406" stroke-width="1.2"/>
      <circle cx="5.8" cy="5.8" r="2.2" fill="#ffeaa2" stroke="#4a2b07" stroke-width="0.9"/>
      <circle cx="19.5" cy="4.2" r="1.5" fill="#f5cc6c" stroke="#4a2b07" stroke-width="0.8"/>
      <circle cx="4.2" cy="19.5" r="1.5" fill="#f5cc6c" stroke="#4a2b07" stroke-width="0.8"/>
    </svg>
  `;
}

function renderScallopedPlaqueSvg(uid: string): string {
  // Ornate Victorian / Art-Deco notched-corner scalloped emerald-and-brass plaque
  return `
    <svg class="v5g-plaque-svg-bg" viewBox="0 0 180 68" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M 16 3 L 76 3 L 90 1 L 104 3 L 164 3 A 12 12 0 0 0 177 16 L 177 52 A 12 12 0 0 0 164 65 L 104 65 L 90 67 L 76 65 L 16 65 A 12 12 0 0 0 3 52 L 3 16 A 12 12 0 0 0 16 3 Z"
        fill="url(#${uid}-brass-bevel)"
        stroke="#432606"
        stroke-width="1.6"
      />
      <path
        d="M 18 7 L 162 7 A 10 10 0 0 0 172 17 L 172 51 A 10 10 0 0 0 162 61 L 18 61 A 10 10 0 0 0 8 51 L 8 17 A 10 10 0 0 0 18 7 Z"
        fill="url(#${uid}-emerald-enamel)"
        stroke="#f3cc71"
        stroke-width="1.2"
      />
      <path
        d="M 22 10.5 L 158 10.5 A 7 7 0 0 0 168 19 L 168 49 A 7 7 0 0 0 158 57.5 L 22 57.5 A 7 7 0 0 0 12 49 L 12 19 A 7 7 0 0 0 22 10.5 Z"
        fill="none"
        stroke="rgba(255, 229, 150, 0.36)"
        stroke-width="0.9"
      />
      <circle cx="90" cy="4.2" r="1.8" fill="#fff1ba"/>
      <circle cx="90" cy="63.8" r="1.8" fill="#fff1ba"/>
    </svg>
  `;
}

function renderBrassSocketSvg(uid: string, side: 'left' | 'right'): string {
  // Protruding 3D-shaded coaxial brass plug socket facing inward toward the cable channel
  const barrelX = side === 'left' ? 14 : 2;
  return `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="${barrelX}" y="8" width="16" height="16" rx="4" fill="url(#${uid}-brass-bevel)" stroke="#3d2205" stroke-width="1.2"/>
      <circle cx="16" cy="16" r="12.5" fill="url(#${uid}-socket-flange)" stroke="#3e2306" stroke-width="1.3"/>
      <circle cx="16" cy="16" r="9" fill="url(#${uid}-brass-bevel)" stroke="#fff0b8" stroke-opacity="0.65" stroke-width="1"/>
      <circle class="v5g-socket-ring" cx="16" cy="16" r="7.2" fill="none" stroke="rgba(255,220,128,0.35)" stroke-width="2.2"/>
      <circle cx="16" cy="16" r="4.8" fill="#170b04" stroke="#7d5216" stroke-width="1.1"/>
      <circle class="v5g-socket-core" cx="16" cy="16" r="2.1" fill="#462809"/>
    </svg>
  `;
}

function renderBrassTriangleIconSvg(dir: 'up' | 'down'): string {
  if (dir === 'up') {
    return `<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M 8 3.2 L 13.6 11.8 L 2.4 11.8 Z" fill="currentColor"/></svg>`;
  }
  return `<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M 8 12.8 L 13.6 4.2 L 2.4 4.2 Z" fill="currentColor"/></svg>`;
}

function renderUnplugIconSvg(): string {
  return `<svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 3v4M12 3v4M4 7h10v2.5a5 5 0 0 1-10 0V7zM9 14.5V17"/></svg>`;
}

function renderFallbackNotice(container: HTMLElement, message: string): TactileGadgetHandleV5 {
  ensureGadgetStylesV5();
  container.innerHTML = `<div class="v5g-root"><div class="v5g-hint-slip is-open"><span class="v5g-hint-tag">STAGE</span><span class="v5g-hint-text">${escapeHtml(message)}</span></div></div>`;
  return {
    revealHint: () => undefined,
    showGadgetReveal: () => undefined,
    lockForTimeout: () => ({ format: 'PINPOINT_DIAL', elapsedSec: 0, timedOut: true }),
    getCurrentSubmission: () => ({ format: 'PINPOINT_DIAL', elapsedSec: 0 }),
    dispose: () => {
      container.innerHTML = '';
    },
  };
}

// ============================================================================
// GADGET 1: PINPOINT_DIAL (270° Circular Brushed-Brass & Sapphire Speedometer)
// ============================================================================

const DIAL_MIN_DEG = -135;
const DIAL_MAX_DEG = 135;
const DIAL_SWEEP_DEG = DIAL_MAX_DEG - DIAL_MIN_DEG; // 270°
const DIAL_CX = 210;
const DIAL_CY = 186;

export function mountPinpointDialGadget(
  container: HTMLElement,
  card: QuestionCardV4,
  options: TactileGadgetOptionsV5,
): TactileGadgetHandleV5 {
  ensureGadgetStylesV5();
  const spec = card.pinpoint;
  if (!spec) {
    return renderFallbackNotice(container, 'Pinpoint calibration spec unavailable for this card.');
  }

  const uid = nextGadgetUid('v5dial');
  const startedAtMs = options.startedAtMs ?? performance.now();
  const minVal = spec.minVal;
  const maxVal = Math.max(spec.minVal + (spec.step || 1), spec.maxVal);
  const step = spec.step > 0 && Number.isFinite(spec.step) ? spec.step : 1;
  const span = Math.max(step, maxVal - minVal);

  const fineStep = step;
  const showCoarse = span > 150 && fineStep * 10 < span;
  const coarseStep = fineStep * 10;

  let currentValue = clampAndSnap(minVal + span * 0.22, minVal, maxVal, step);
  if (Math.abs(currentValue - spec.exactVal) <= Math.max(spec.winRadius * 1.4, step * 2)) {
    currentValue = clampAndSnap(minVal + span * 0.78, minVal, maxVal, step);
  }
  let locked = false;
  let dragging = false;
  let activePointerId: number | null = null;
  let lastDragDeg = 0;
  let usedHintLocal = false;
  let holdDelayTimer: number | null = null;
  let holdRepeatTimer: number | null = null;

  const valueToDeg = (v: number): number => {
    const frac = Math.max(0, Math.min(1, (v - minVal) / span));
    return DIAL_MIN_DEG + frac * DIAL_SWEEP_DEG;
  };

  const degToValue = (deg: number): number => {
    const clampedDeg = Math.max(DIAL_MIN_DEG, Math.min(DIAL_MAX_DEG, deg));
    const frac = (clampedDeg - DIAL_MIN_DEG) / DIAL_SWEEP_DEG;
    return clampAndSnap(minVal + frac * span, minVal, maxVal, step);
  };

  // Build radial tick marks + 5 crisp scale labels (0%, 25%, 50%, 75%, 100%)
  const ticksSvgParts: string[] = [];
  const totalTickSteps = 40;
  for (let i = 0; i <= totalTickSteps; i += 1) {
    const frac = i / totalTickSteps;
    const deg = DIAL_MIN_DEG + frac * DIAL_SWEEP_DEG;
    const isMajor = i % 10 === 0;
    const isMed = !isMajor && i % 5 === 0;
    const rOuter = 140;
    const rInner = isMajor ? 127 : isMed ? 131 : 134.5;
    const p1 = polarToCartesian(DIAL_CX, DIAL_CY, rInner, deg);
    const p2 = polarToCartesian(DIAL_CX, DIAL_CY, rOuter, deg);
    const stroke = isMajor ? '#ffe7a0' : isMed ? '#d7ae5b' : 'rgba(229, 192, 114, 0.56)';
    const width = isMajor ? 2.6 : isMed ? 1.65 : 1.05;
    ticksSvgParts.push(
      `<line x1="${p1.x.toFixed(2)}" y1="${p1.y.toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${p2.y.toFixed(2)}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`,
    );
  }

  // 5 major scale labels positioned cleanly like the mockup (1950, 1960, 1970, 1980, 1990)
  const labelFracs = [0, 0.25, 0.5, 0.75, 1] as const;
  const labelHaloStyle = 'paint-order:stroke;stroke:#071328;stroke-width:4.5px;stroke-linejoin:round;';
  const scaleLabelsSvg = labelFracs
    .map((frac, idx) => {
      const rawVal = minVal + frac * span;
      const snappedVal = clampAndSnap(rawVal, minVal, maxVal, step);
      const labelStr = formatPinpointDialValueV5(snappedVal, spec.unitLabel, minVal, maxVal, false);
      const isLongLabel = labelStr.length >= 5;
      const fontSize = isLongLabel ? 12.8 : 15;

      // Exact ergonomic placement matching the approved analog speedometer mockup
      if (idx === 0) {
        return `<text x="111" y="246" text-anchor="middle" fill="#f7e2a8" style="${labelHaloStyle}" font-family="Inter, sans-serif" font-weight="700" font-size="${fontSize}">${escapeHtml(labelStr)}</text>`;
      }
      if (idx === 4) {
        return `<text x="309" y="246" text-anchor="middle" fill="#f7e2a8" style="${labelHaloStyle}" font-family="Inter, sans-serif" font-weight="700" font-size="${fontSize}">${escapeHtml(labelStr)}</text>`;
      }
      if (idx === 2) {
        return `<text x="${DIAL_CX}" y="82" text-anchor="middle" fill="#fff0be" style="${labelHaloStyle}" font-family="Inter, sans-serif" font-weight="800" font-size="${fontSize + 1}">${escapeHtml(labelStr)}</text>`;
      }
      const deg = DIAL_MIN_DEG + frac * DIAL_SWEEP_DEG;
      const pos = polarToCartesian(DIAL_CX, DIAL_CY, 108, deg);
      const rot = idx === 1 ? -54 : 54;
      return `<text x="${pos.x.toFixed(1)}" y="${pos.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${rot} ${pos.x.toFixed(1)} ${pos.y.toFixed(1)})" fill="#f7e2a8" style="${labelHaloStyle}" font-family="Inter, sans-serif" font-weight="700" font-size="${fontSize}">${escapeHtml(labelStr)}</text>`;
    })
    .join('');

  // Pre-build spun brass decorative lathe rings for central hub
  const latheRings = [14, 21, 28, 35, 42, 48]
    .map(
      (r) =>
        `<circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="${r}" fill="none" stroke="rgba(255,244,200,0.16)" stroke-width="0.9"/>`,
    )
    .join('');

  const unitBadgeText = spec.unitLabel.trim()
    ? spec.unitLabel.trim() === 'C'
      ? '°C'
      : spec.unitLabel.trim() === 'F'
        ? '°F'
        : spec.unitLabel.trim()
    : '';

  container.innerHTML = `
    <div class="v5g-root" data-v5g-format="PINPOINT_DIAL">
      <div class="v5g-hint-slip" data-v5g-hint-slip role="status">
        <span class="v5g-hint-tag">CLUE</span>
        <span class="v5g-hint-text" data-v5g-hint-text></span>
      </div>

      <div class="v5g-dial-shell">
        <div class="v5g-dial-stage" data-v5g-dial-stage>
          <svg
            class="v5g-dial-svg"
            data-v5g-dial-svg
            viewBox="0 0 420 356"
            role="slider"
            tabindex="0"
            aria-label="Pinpoint Brass Analog Speedometer Dial"
            aria-valuemin="${minVal}"
            aria-valuemax="${maxVal}"
            aria-valuenow="${currentValue}"
          >
            <defs>
              <linearGradient id="${uid}-brass-outer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff4c4"/>
                <stop offset="22%" stop-color="#dfb04b"/>
                <stop offset="48%" stop-color="#7c4f13"/>
                <stop offset="76%" stop-color="#f2cb6d"/>
                <stop offset="100%" stop-color="#5d380a"/>
              </linearGradient>
              <linearGradient id="${uid}-brass-inner" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stop-color="#fff0b6"/>
                <stop offset="45%" stop-color="#c3872a"/>
                <stop offset="100%" stop-color="#613b0c"/>
              </linearGradient>
              <linearGradient id="${uid}-sapphire-ring" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#4e94f7"/>
                <stop offset="35%" stop-color="#1d4ea1"/>
                <stop offset="75%" stop-color="#0e2a62"/>
                <stop offset="100%" stop-color="#091a3f"/>
              </linearGradient>
              <radialGradient id="${uid}-dial-face" cx="50%" cy="44%" r="58%">
                <stop offset="0%" stop-color="#17305c"/>
                <stop offset="62%" stop-color="#0b1a36"/>
                <stop offset="100%" stop-color="#060f21"/>
              </radialGradient>
              <radialGradient id="${uid}-spun-hub" cx="38%" cy="30%" r="72%">
                <stop offset="0%" stop-color="#f5d584"/>
                <stop offset="34%" stop-color="#b6812d"/>
                <stop offset="68%" stop-color="#784f18"/>
                <stop offset="100%" stop-color="#4a2e0a"/>
              </radialGradient>
              <linearGradient id="${uid}-needle-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#a86d16"/>
                <stop offset="35%" stop-color="#ffefad"/>
                <stop offset="55%" stop-color="#ffffff"/>
                <stop offset="80%" stop-color="#e3a63b"/>
                <stop offset="100%" stop-color="#7d4c0c"/>
              </linearGradient>
              <filter id="${uid}-emerald-glow" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="4.5" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="${uid}-gold-glow" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="3.8" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="${uid}-needle-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="2" dy="4" stdDeviation="3.2" flood-color="#02060f" flood-opacity="0.78"/>
              </filter>
              <path id="${uid}-bullseye-text-arc" d="${describeArcPath(DIAL_CX, DIAL_CY, 75, -42, 42)}"/>
            </defs>

            <!-- Outer Brushed-Brass Bezel & Sapphire Enamel Housing -->
            <circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="172" fill="#2d1a05"/>
            <circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="169" fill="url(#${uid}-brass-outer)" stroke="#4c2c06" stroke-width="1.6"/>
            <circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="161" fill="url(#${uid}-sapphire-ring)" stroke="#fff0bd" stroke-opacity="0.45" stroke-width="1.2"/>
            <circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="147" fill="url(#${uid}-brass-inner)" stroke="#3e2306" stroke-width="1.4"/>
            <circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="142" fill="url(#${uid}-dial-face)" stroke="#23457e" stroke-opacity="0.55" stroke-width="1.2"/>

            <!-- Subtle Dial Face Glass Ring Highlights -->
            <path d="${describeArcPath(DIAL_CX, DIAL_CY, 154, -72, 72)}" fill="none" stroke="rgba(196, 228, 255, 0.35)" stroke-width="2.2" stroke-linecap="round"/>

            <!-- Top 12-O'Clock Beveled Brass & Sapphire WIN ARC Cartouche -->
            <g data-v5g-win-badge>
              <rect x="148" y="18" width="124" height="26" rx="13" fill="url(#${uid}-brass-outer)" stroke="#3d2205" stroke-width="1.3"/>
              <rect x="151.5" y="21.2" width="117" height="19.6" rx="9.8" fill="#0b2244" stroke="#f0c86d" stroke-opacity="0.55" stroke-width="1"/>
              <text
                data-v5g-win-badge-text
                x="${DIAL_CX}"
                y="35"
                text-anchor="middle"
                fill="#4effb0"
                font-family="Inter, sans-serif"
                font-weight="800"
                font-size="13.5"
                letter-spacing="0.08em"
                filter="url(#${uid}-emerald-glow)"
              >WIN ARC</text>
            </g>

            <!-- Glowing Emerald WIN ARC & Inner Golden 2× BULLSEYE Tolerance Zones -->
            <g data-v5g-tolerance-layer>
              <!-- Soft Backlit Sector Bands -->
              <path data-v5g-win-sector fill="rgba(46, 242, 154, 0.1)" stroke="none"/>
              <path data-v5g-bull-sector fill="rgba(255, 206, 72, 0.14)" stroke="none"/>
              <!-- Outer Emerald WIN ARC Glow + Crisp Filament + Radial Gates -->
              <path data-v5g-win-arc-outer-glow fill="none" stroke="#1cf28f" stroke-opacity="0.34" stroke-width="12" stroke-linecap="round" filter="url(#${uid}-emerald-glow)"/>
              <path data-v5g-win-arc-outer fill="none" stroke="#4effb2" stroke-width="3.2" stroke-linecap="round"/>
              <path data-v5g-win-arc-inner fill="none" stroke="#28e88f" stroke-opacity="0.78" stroke-width="2.4" stroke-linecap="round" filter="url(#${uid}-emerald-glow)"/>
              <line data-v5g-win-gate-left stroke="#4effb2" stroke-width="2.8" stroke-linecap="round" filter="url(#${uid}-emerald-glow)"/>
              <line data-v5g-win-gate-right stroke="#4effb2" stroke-width="2.8" stroke-linecap="round" filter="url(#${uid}-emerald-glow)"/>

              <!-- Inner Golden 2× BULLSEYE Arc -->
              <path data-v5g-bull-arc-glow fill="none" stroke="#ffb824" stroke-opacity="0.38" stroke-width="12" stroke-linecap="round" filter="url(#${uid}-gold-glow)"/>
              <path data-v5g-bull-arc fill="none" stroke="#ffe175" stroke-width="3.4" stroke-linecap="round"/>
              <line data-v5g-bull-gate-left stroke="#ffe175" stroke-width="2.8" stroke-linecap="round"/>
              <line data-v5g-bull-gate-right stroke="#ffe175" stroke-width="2.8" stroke-linecap="round"/>
              <text
                data-v5g-bull-label
                fill="#ffefa8"
                style="paint-order:stroke;stroke:#071328;stroke-width:3.5px;stroke-linejoin:round;"
                font-family="Inter, sans-serif"
                font-weight="800"
                font-size="11.4"
                letter-spacing="0.06em"
                filter="url(#${uid}-gold-glow)"
              >
                <textPath href="#${uid}-bullseye-text-arc" startOffset="50%" text-anchor="middle">2× BULLSEYE</textPath>
              </text>
            </g>

            <!-- Radial Tick Marks & Year-Safe Scale Labels -->
            <g pointer-events="none">
              ${ticksSvgParts.join('')}
              ${scaleLabelsSvg}
            </g>

            <!-- Central Spun-Brass Hub Medallion -->
            <g pointer-events="none">
              <circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="64" fill="#050b18" fill-opacity="0.82"/>
              <circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="60" fill="url(#${uid}-brass-outer)" stroke="#3b2105" stroke-width="1.6"/>
              <circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="53" fill="url(#${uid}-spun-hub)" stroke="#ffe89f" stroke-opacity="0.58" stroke-width="1.3"/>
              ${latheRings}
            </g>

            <!-- Reveal Exact Answer Pin Marker (hidden until showGadgetReveal) -->
            <g data-v5g-exact-marker style="display:none" pointer-events="none">
              <line x1="${DIAL_CX}" y1="62" x2="${DIAL_CX}" y2="122" stroke="#3cffaa" stroke-width="3.2" stroke-dasharray="4 3" filter="url(#${uid}-emerald-glow)"/>
              <polygon points="${DIAL_CX},47 ${DIAL_CX - 9},63 ${DIAL_CX + 9},63" fill="#46ffad" stroke="#08301e" stroke-width="1.5" filter="url(#${uid}-emerald-glow)"/>
            </g>

            <!-- Sweeping Illuminated Tapered Brass Needle -->
            <g data-v5g-dial-needle transform="rotate(0 ${DIAL_CX} ${DIAL_CY})" filter="url(#${uid}-needle-shadow)" pointer-events="none">
              <!-- Needle Blade -->
              <polygon
                points="${DIAL_CX},57 ${DIAL_CX - 6.8},${DIAL_CY + 14} ${DIAL_CX},${DIAL_CY + 24} ${DIAL_CX + 6.8},${DIAL_CY + 14}"
                fill="url(#${uid}-needle-gold)"
                stroke="#4d2e07"
                stroke-width="1.1"
              />
              <!-- Illuminated Amber Spine Filament -->
              <line
                x1="${DIAL_CX}"
                y1="66"
                x2="${DIAL_CX}"
                y2="${DIAL_CY - 8}"
                stroke="#fff6c9"
                stroke-width="2.1"
                stroke-linecap="round"
                filter="url(#${uid}-gold-glow)"
              />
              <!-- Central Pivot Boss Cap -->
              <circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="14.5" fill="url(#${uid}-brass-outer)" stroke="#3e2206" stroke-width="1.4"/>
              <circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="9.2" fill="url(#${uid}-spun-hub)" stroke="#fff1ba" stroke-opacity="0.6" stroke-width="1"/>
              <circle cx="${DIAL_CX}" cy="${DIAL_CY}" r="3.2" fill="#ffe79c"/>
            </g>
          </svg>

          <!-- Warm Glowing Nixie-Tube Numeric Readout Window -->
          <div class="v5g-nixie-bezel" aria-live="polite">
            <div class="v5g-nixie-window" data-v5g-nixie-window></div>
            ${unitBadgeText ? `<span class="v5g-nixie-unit">${escapeHtml(unitBadgeText)}</span>` : ''}
          </div>

          <!-- Flanking Knurled Brass Rotary Step Buttons (-1 / +1, plus -10 / +10 if span > 150) -->
          ${
            showCoarse
              ? `<button type="button" class="v5g-knob-btn v5g-knob-coarse v5g-knob-coarse-left" data-v5g-step="${-coarseStep}" aria-label="Decrease dial by ${coarseStep}"><span>${escapeHtml(formatStepDeltaLabel(-coarseStep))}</span></button>`
              : ''
          }
          <button type="button" class="v5g-knob-btn v5g-knob-fine-left" data-v5g-step="${-fineStep}" aria-label="Decrease dial by ${fineStep}">
            <span>${escapeHtml(formatStepDeltaLabel(-fineStep))}</span>
          </button>
          <button type="button" class="v5g-knob-btn v5g-knob-fine-right is-plus" data-v5g-step="${fineStep}" aria-label="Increase dial by ${fineStep}">
            <span>${escapeHtml(formatStepDeltaLabel(fineStep))}</span>
          </button>
          ${
            showCoarse
              ? `<button type="button" class="v5g-knob-btn v5g-knob-coarse v5g-knob-coarse-right is-plus" data-v5g-step="${coarseStep}" aria-label="Increase dial by ${coarseStep}"><span>${escapeHtml(formatStepDeltaLabel(coarseStep))}</span></button>`
              : ''
          }
        </div>

        <div class="v5g-dial-reveal-strip" data-v5g-dial-reveal-strip></div>

        <!-- Heavy Sculpted Gold LOCK DIAL Plunger Lever -->
        <div class="v5g-plunger-mount">
          <button type="button" class="v5g-plunger-btn" data-v5g-dial-lock>
            <span class="v5g-plunger-handle" aria-hidden="true"></span>
            <span class="v5g-plunger-shaft" aria-hidden="true"></span>
            <span class="v5g-plunger-housing">
              <span class="v5g-plunger-lightbar" aria-hidden="true"></span>
              <span class="v5g-plunger-plate" data-v5g-dial-lock-label>LOCK DIAL</span>
              <span class="v5g-plunger-lightbar" aria-hidden="true"></span>
            </span>
            <span class="v5g-plunger-base" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Cache surgical DOM references
  const svgEl = container.querySelector<SVGSVGElement>('[data-v5g-dial-svg]')!;
  const needleGroup = container.querySelector<SVGGElement>('[data-v5g-dial-needle]')!;
  const exactMarkerGroup = container.querySelector<SVGGElement>('[data-v5g-exact-marker]')!;
  const winBadgeText = container.querySelector<SVGTextElement>('[data-v5g-win-badge-text]')!;
  const winSector = container.querySelector<SVGPathElement>('[data-v5g-win-sector]')!;
  const bullSector = container.querySelector<SVGPathElement>('[data-v5g-bull-sector]')!;
  const winArcOuterGlow = container.querySelector<SVGPathElement>('[data-v5g-win-arc-outer-glow]')!;
  const winArcOuter = container.querySelector<SVGPathElement>('[data-v5g-win-arc-outer]')!;
  const winArcInner = container.querySelector<SVGPathElement>('[data-v5g-win-arc-inner]')!;
  const winGateLeft = container.querySelector<SVGLineElement>('[data-v5g-win-gate-left]')!;
  const winGateRight = container.querySelector<SVGLineElement>('[data-v5g-win-gate-right]')!;
  const bullArcGlow = container.querySelector<SVGPathElement>('[data-v5g-bull-arc-glow]')!;
  const bullArc = container.querySelector<SVGPathElement>('[data-v5g-bull-arc]')!;
  const bullGateLeft = container.querySelector<SVGLineElement>('[data-v5g-bull-gate-left]')!;
  const bullGateRight = container.querySelector<SVGLineElement>('[data-v5g-bull-gate-right]')!;
  const bullTextArcPath = container.querySelector<SVGPathElement>(`#${uid}-bullseye-text-arc`)!;
  const bullLabelEl = container.querySelector<SVGTextElement>('[data-v5g-bull-label]')!;
  const nixieWindow = container.querySelector<HTMLElement>('[data-v5g-nixie-window]')!;
  const lockBtn = container.querySelector<HTMLButtonElement>('[data-v5g-dial-lock]')!;
  const lockLabel = container.querySelector<HTMLElement>('[data-v5g-dial-lock-label]')!;
  const revealStrip = container.querySelector<HTMLElement>('[data-v5g-dial-reveal-strip]')!;
  const hintSlip = container.querySelector<HTMLElement>('[data-v5g-hint-slip]')!;
  const hintTextEl = container.querySelector<HTMLElement>('[data-v5g-hint-text]')!;
  const knobBtns = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-v5g-step]'));

  const setLineCoords = (
    line: SVGLineElement,
    p1: { x: number; y: number },
    p2: { x: number; y: number },
  ): void => {
    line.setAttribute('x1', p1.x.toFixed(2));
    line.setAttribute('y1', p1.y.toFixed(2));
    line.setAttribute('x2', p2.x.toFixed(2));
    line.setAttribute('y2', p2.y.toFixed(2));
  };

  /**
   * Draws the glowing emerald WIN ARC & golden 2× BULLSEYE tolerance arcs.
   * Pre-submit: centered around the live dial needle (showing exact tolerance caliper width without spoiling exactVal!).
   * On reveal: snaps & blazes directly onto `exactVal ± winRadius` and `exactVal ± bullseyeRadius`!
   */
  const renderToleranceArcs = (centerVal: number, isReveal: boolean): void => {
    const rawWinStart = valueToDeg(centerVal - spec.winRadius);
    const rawWinEnd = valueToDeg(centerVal + spec.winRadius);
    const rawBullStart = valueToDeg(centerVal - spec.bullseyeRadius);
    const rawBullEnd = valueToDeg(centerVal + spec.bullseyeRadius);

    // Ensure visual arcs are always crisp & readable even when tolerance radii are very tight
    const centerDeg = valueToDeg(centerVal);
    const minWinHalf = isReveal ? 4 : 26;
    const minBullHalf = isReveal ? 2.5 : 15;

    const winHalf = Math.max(minWinHalf, (rawWinEnd - rawWinStart) / 2);
    const bullHalf = Math.max(minBullHalf, (rawBullEnd - rawBullStart) / 2);

    const winStart = Math.max(DIAL_MIN_DEG, isReveal ? rawWinStart : centerDeg - winHalf);
    const winEnd = Math.min(DIAL_MAX_DEG, isReveal ? rawWinEnd : centerDeg + winHalf);
    const bullStart = Math.max(DIAL_MIN_DEG, isReveal ? rawBullStart : centerDeg - bullHalf);
    const bullEnd = Math.min(DIAL_MAX_DEG, isReveal ? rawBullEnd : centerDeg + bullHalf);

    const safeWinStart = Math.min(winStart, winEnd - 1.5);
    const safeWinEnd = Math.max(winEnd, safeWinStart + 1.5);
    const safeBullStart = Math.min(bullStart, bullEnd - 1.2);
    const safeBullEnd = Math.max(bullEnd, safeBullStart + 1.2);

    const describeSectorBand = (rIn: number, rOut: number, sDeg: number, eDeg: number): string => {
      const spanDeg = Math.max(0.5, eDeg - sDeg);
      const large = spanDeg > 180 ? 1 : 0;
      const o1 = polarToCartesian(DIAL_CX, DIAL_CY, rOut, sDeg);
      const o2 = polarToCartesian(DIAL_CX, DIAL_CY, rOut, eDeg);
      const i2 = polarToCartesian(DIAL_CX, DIAL_CY, rIn, eDeg);
      const i1 = polarToCartesian(DIAL_CX, DIAL_CY, rIn, sDeg);
      return `M ${o1.x.toFixed(1)} ${o1.y.toFixed(1)} A ${rOut} ${rOut} 0 ${large} 1 ${o2.x.toFixed(1)} ${o2.y.toFixed(1)} L ${i2.x.toFixed(1)} ${i2.y.toFixed(1)} A ${rIn} ${rIn} 0 ${large} 0 ${i1.x.toFixed(1)} ${i1.y.toFixed(1)} Z`;
    };

    const outerPath = describeArcPath(DIAL_CX, DIAL_CY, 126, safeWinStart, safeWinEnd);
    const innerPath = describeArcPath(DIAL_CX, DIAL_CY, 95, safeWinStart, safeWinEnd);
    winSector.setAttribute('d', describeSectorBand(95, 126, safeWinStart, safeWinEnd));
    winArcOuterGlow.setAttribute('d', outerPath);
    winArcOuter.setAttribute('d', outerPath);
    winArcInner.setAttribute('d', innerPath);

    setLineCoords(
      winGateLeft,
      polarToCartesian(DIAL_CX, DIAL_CY, 95, safeWinStart),
      polarToCartesian(DIAL_CX, DIAL_CY, 126, safeWinStart),
    );
    setLineCoords(
      winGateRight,
      polarToCartesian(DIAL_CX, DIAL_CY, 95, safeWinEnd),
      polarToCartesian(DIAL_CX, DIAL_CY, 126, safeWinEnd),
    );

    const bPath = describeArcPath(DIAL_CX, DIAL_CY, 87, safeBullStart, safeBullEnd);
    bullSector.setAttribute('d', describeSectorBand(64, 87, safeBullStart, safeBullEnd));
    bullArcGlow.setAttribute('d', bPath);
    bullArc.setAttribute('d', bPath);
    setLineCoords(
      bullGateLeft,
      polarToCartesian(DIAL_CX, DIAL_CY, 67, safeBullStart),
      polarToCartesian(DIAL_CX, DIAL_CY, 87, safeBullStart),
    );
    setLineCoords(
      bullGateRight,
      polarToCartesian(DIAL_CX, DIAL_CY, 67, safeBullEnd),
      polarToCartesian(DIAL_CX, DIAL_CY, 87, safeBullEnd),
    );

    // Keep the curved "2× BULLSEYE" label centered neatly in the top half of the dial
    const textCenter = Math.max(-72, Math.min(72, (safeBullStart + safeBullEnd) / 2));
    const textStart = Math.max(-118, textCenter - 44);
    const textEnd = Math.min(118, textCenter + 44);
    bullTextArcPath.setAttribute('d', describeArcPath(DIAL_CX, DIAL_CY, 73, textStart, textEnd));
    bullLabelEl.style.opacity = isReveal ? '1' : '0.96';
  };

  const renderNixieDigits = (val: number): void => {
    const rawStr = formatPinpointDialValueV5(val, spec.unitLabel, minVal, maxVal, false);
    const chars = Array.from(rawStr);
    const compact = chars.length > 4;
    nixieWindow.innerHTML = chars
      .map((ch) => {
        const isPunct = ch === ',' || ch === '.';
        const cls = `v5g-nixie-tube${compact ? ' is-compact' : ''}${isPunct ? ' is-punct' : ''}`;
        return `<span class="${cls}">${escapeHtml(ch)}</span>`;
      })
      .join('');
  };

  const syncDialVisuals = (emitFeedback: boolean): void => {
    const deg = valueToDeg(currentValue);
    needleGroup.setAttribute('transform', `rotate(${deg.toFixed(2)} ${DIAL_CX} ${DIAL_CY})`);
    svgEl.setAttribute('aria-valuenow', String(currentValue));
    svgEl.setAttribute(
      'aria-valuetext',
      formatPinpointDialValueV5(currentValue, spec.unitLabel, minVal, maxVal, true),
    );
    renderNixieDigits(currentValue);
    if (!locked) {
      renderToleranceArcs(currentValue, false);
    }
    if (emitFeedback) {
      options.onInteractionFeedback?.('tap');
    }
  };

  const setDialValue = (nextVal: number, emitFeedback: boolean): void => {
    if (locked) return;
    const clamped = clampAndSnap(nextVal, minVal, maxVal, step);
    if (clamped === currentValue) return;
    currentValue = clamped;
    syncDialVisuals(emitFeedback);
  };

  // Initial render
  syncDialVisuals(false);

  // Rotary pointer angle calculation (supports drag AND instant click-on-arc!)
  const updateFromPointerEvent = (ev: PointerEvent, isInitialDown: boolean): boolean => {
    const rect = svgEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const svgX = ((ev.clientX - rect.left) / rect.width) * 420;
    const svgY = ((ev.clientY - rect.top) / rect.height) * 356;
    const dx = svgX - DIAL_CX;
    const dy = svgY - DIAL_CY;
    const dist = Math.hypot(dx, dy);

    // Ignore initial clicks directly over the bottom Nixie window or outside outer bezel
    if (isInitialDown && (dist > 176 || (svgY > 246 && Math.abs(dx) < 82))) {
      return false;
    }

    // Angle in degrees where 0° = 12 o'clock, -90° = 9 o'clock, +90° = 3 o'clock
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;

    // Smart dead-zone clamping across the bottom 90° window so needle never violently wraps
    if (deg < DIAL_MIN_DEG || deg > DIAL_MAX_DEG) {
      if (!isInitialDown) {
        deg = lastDragDeg < 0 ? DIAL_MIN_DEG : DIAL_MAX_DEG;
      } else {
        deg = deg < 0 ? DIAL_MIN_DEG : DIAL_MAX_DEG;
      }
    }
    lastDragDeg = deg;
    setDialValue(degToValue(deg), true);
    return true;
  };

  const onSvgPointerDown = (ev: PointerEvent): void => {
    if (locked || ev.button === 2) return;
    lastDragDeg = valueToDeg(currentValue);
    if (!updateFromPointerEvent(ev, true)) return;
    ev.preventDefault();
    dragging = true;
    activePointerId = ev.pointerId;
    svgEl.classList.add('is-dragging');
    svgEl.setPointerCapture?.(ev.pointerId);
  };

  const onWinPointerMove = (ev: PointerEvent): void => {
    if (!dragging || locked || ev.pointerId !== activePointerId) return;
    updateFromPointerEvent(ev, false);
  };

  const onWinPointerUp = (ev: PointerEvent): void => {
    if (!dragging || ev.pointerId !== activePointerId) return;
    dragging = false;
    activePointerId = null;
    svgEl.classList.remove('is-dragging');
  };

  svgEl.addEventListener('pointerdown', onSvgPointerDown);
  window.addEventListener('pointermove', onWinPointerMove);
  window.addEventListener('pointerup', onWinPointerUp);
  window.addEventListener('pointercancel', onWinPointerUp);

  // Keyboard support on the SVG dial
  const onSvgKeyDown = (ev: KeyboardEvent): void => {
    if (locked) return;
    const mult = ev.shiftKey ? 10 : 1;
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') {
      ev.preventDefault();
      setDialValue(currentValue - fineStep * mult, true);
    } else if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      setDialValue(currentValue + fineStep * mult, true);
    } else if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      commitLockIn();
    }
  };
  svgEl.addEventListener('keydown', onSvgKeyDown);

  // Flanking knurled brass step knobs (click + smooth hold-to-step)
  const stopHoldTimers = (): void => {
    if (holdDelayTimer !== null) {
      window.clearTimeout(holdDelayTimer);
      holdDelayTimer = null;
    }
    if (holdRepeatTimer !== null) {
      window.clearInterval(holdRepeatTimer);
      holdRepeatTimer = null;
    }
    knobBtns.forEach((b) => b.classList.remove('is-pressed'));
  };

  knobBtns.forEach((btn) => {
    const delta = Number(btn.dataset.v5gStep || 0);
    btn.addEventListener('pointerdown', (ev) => {
      if (locked || ev.button === 2) return;
      ev.preventDefault();
      stopHoldTimers();
      btn.classList.add('is-pressed');
      setDialValue(currentValue + delta, true);
      holdDelayTimer = window.setTimeout(() => {
        holdRepeatTimer = window.setInterval(() => {
          if (locked) {
            stopHoldTimers();
            return;
          }
          setDialValue(currentValue + delta, true);
        }, 85);
      }, 340);
    });
    btn.addEventListener('keydown', (ev) => {
      if (locked) return;
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        setDialValue(currentValue + delta, true);
      }
    });
  });

  window.addEventListener('pointerup', stopHoldTimers);
  window.addEventListener('pointercancel', stopHoldTimers);

  const buildSubmission = (timedOut = false): AnswerSubmissionV4 => ({
    format: 'PINPOINT_DIAL',
    timedOut: timedOut || undefined,
    elapsedSec: Math.max(0.1, Number(((performance.now() - startedAtMs) / 1000).toFixed(2))),
    usedHint: usedHintLocal || options.getUsedHint?.() || undefined,
    doubleDownArmed: options.getDoubleDownArmed?.() || undefined,
    pinpointValue: currentValue,
  });

  const disableControls = (): void => {
    locked = true;
    dragging = false;
    stopHoldTimers();
    svgEl.classList.add('is-locked');
    svgEl.classList.remove('is-dragging');
    knobBtns.forEach((b) => {
      b.disabled = true;
    });
    lockBtn.disabled = true;
    lockBtn.classList.add('is-plunged');
    lockLabel.textContent = 'LOCKED';
  };

  const commitLockIn = (): void => {
    if (locked) return;
    disableControls();
    options.onInteractionFeedback?.('lock_in');
    void options.onSubmit(buildSubmission(false));
  };

  lockBtn.addEventListener('click', commitLockIn);

  return {
    revealHint(text: string): void {
      usedHintLocal = true;
      hintTextEl.textContent = text;
      hintSlip.classList.add('is-open');
    },

    showGadgetReveal(evalResult: EvaluatedAnswerV4): void {
      disableControls();
      // Snap glowing tolerance arcs to exact mathematical target zones!
      renderToleranceArcs(spec.exactVal, true);

      const exactDeg = valueToDeg(spec.exactVal);
      exactMarkerGroup.style.display = 'block';
      exactMarkerGroup.setAttribute('transform', `rotate(${exactDeg.toFixed(2)} ${DIAL_CX} ${DIAL_CY})`);

      const diff = Math.abs(currentValue - spec.exactVal);
      const isBullseye = evalResult.isBullseyeOrSweep || diff <= spec.bullseyeRadius;
      const isWin = evalResult.isCorrect || diff <= spec.winRadius;

      const exactLabel = formatPinpointDialValueV5(spec.exactVal, spec.unitLabel, minVal, maxVal, true);
      const lockedLabel = formatPinpointDialValueV5(currentValue, spec.unitLabel, minVal, maxVal, true);
      const diffFormatted = formatPinpointDialValueV5(diff, '', 0, span, false);

      if (isBullseye) {
        winBadgeText.textContent = '2× BULLSEYE!';
        winBadgeText.setAttribute('fill', '#ffe77a');
        revealStrip.className = 'v5g-dial-reveal-strip is-visible is-bullseye';
        revealStrip.textContent = `BULLSEYE · Exact: ${exactLabel} (Your Dial: ${lockedLabel})`;
      } else if (isWin) {
        winBadgeText.textContent = 'WIN ARC HIT!';
        winBadgeText.setAttribute('fill', '#52ffb6');
        revealStrip.className = 'v5g-dial-reveal-strip is-visible is-win';
        revealStrip.textContent = `IN WIN ARC · Exact: ${exactLabel} (Off by ${diffFormatted})`;
      } else {
        winBadgeText.textContent = `EXACT ${formatPinpointDialValueV5(spec.exactVal, spec.unitLabel, minVal, maxVal, false)}`;
        winBadgeText.setAttribute('fill', '#ff9885');
        revealStrip.className = 'v5g-dial-reveal-strip is-visible is-miss';
        revealStrip.textContent = `Exact: ${exactLabel} · Your Dial: ${lockedLabel} (Off by ${diffFormatted})`;
      }
    },

    lockForTimeout(): AnswerSubmissionV4 {
      disableControls();
      return buildSubmission(true);
    },

    getCurrentSubmission(): AnswerSubmissionV4 {
      return buildSubmission(false);
    },

    dispose(): void {
      stopHoldTimers();
      svgEl.removeEventListener('pointerdown', onSvgPointerDown);
      svgEl.removeEventListener('keydown', onSvgKeyDown);
      window.removeEventListener('pointermove', onWinPointerMove);
      window.removeEventListener('pointerup', onWinPointerUp);
      window.removeEventListener('pointercancel', onWinPointerUp);
      window.removeEventListener('pointerup', stopHoldTimers);
      window.removeEventListener('pointercancel', stopHoldTimers);
      container.innerHTML = '';
    },
  };
}

// ============================================================================
// GADGET 2: MATCH_4 (Mahogany & Riveted Brass Stage Switchboard + Braided Cables)
// ============================================================================

interface BraidedCablePalette {
  readonly name: string;
  readonly core: string;
  readonly mid: string;
  readonly dark: string;
  readonly glow: string;
}

const BRAIDED_CABLE_PALETTES: readonly BraidedCablePalette[] = [
  { name: 'gold', core: '#fff1a6', mid: '#f5be36', dark: '#915c08', glow: '#ffc938' },
  { name: 'emerald', core: '#9bffcf', mid: '#22e68c', dark: '#087240', glow: '#2ef59a' },
  { name: 'cyan', core: '#b3f9ff', mid: '#24d9f7', dark: '#076885', glow: '#36e6ff' },
  { name: 'amber', core: '#ffd194', mid: '#f28722', dark: '#8c3f05', glow: '#ff962e' },
];

const REVEAL_CORRECT_CABLE: BraidedCablePalette = {
  name: 'correct',
  core: '#b8ffdd',
  mid: '#28ea90',
  dark: '#076e3e',
  glow: '#34f79e',
};

const REVEAL_WRONG_CABLE: BraidedCablePalette = {
  name: 'wrong',
  core: '#ffc2c8',
  mid: '#eb4d5e',
  dark: '#75131f',
  glow: '#ff5265',
};

export function mountMatch4SwitchboardGadget(
  container: HTMLElement,
  card: QuestionCardV4,
  options: TactileGadgetOptionsV5,
): TactileGadgetHandleV5 {
  ensureGadgetStylesV5();
  const spec = card.match4;
  if (!spec) {
    return renderFallbackNotice(container, 'Match-4 switchboard wiring spec unavailable for this card.');
  }

  const uid = nextGadgetUid('v5m4');
  const startedAtMs = options.startedAtMs ?? performance.now();

  const links = new Map<string, string>(); // leftPairId -> rightPairId
  const paletteByLeft = new Map<string, BraidedCablePalette>();
  let selectedSide: 'left' | 'right' | null = null;
  let selectedId: string | null = null;
  let locked = false;
  let revealMode = false;
  let usedHintLocal = false;

  let dragState: {
    side: 'left' | 'right';
    pairId: string;
    pointerId: number;
    startX: number;
    startY: number;
    currX: number;
    currY: number;
    moved: boolean;
    hoverTargetId: string | null;
  } | null = null;

  container.innerHTML = `
    <div class="v5g-root" data-v5g-format="MATCH_4">
      <div class="v5g-hint-slip" data-v5g-hint-slip role="status">
        <span class="v5g-hint-tag">CLUE</span>
        <span class="v5g-hint-text" data-v5g-hint-text></span>
      </div>

      <!-- Hidden shared SVG gradients referenced by scalloped plaques, sockets, and corner brackets -->
      <svg width="0" height="0" style="position:absolute;pointer-events:none" aria-hidden="true">
        <defs>
          <linearGradient id="${uid}-brass-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff2b8"/>
            <stop offset="28%" stop-color="#d89e3c"/>
            <stop offset="56%" stop-color="#875814"/>
            <stop offset="84%" stop-color="#f2ca6e"/>
            <stop offset="100%" stop-color="#653d0b"/>
          </linearGradient>
          <radialGradient id="${uid}-emerald-enamel" cx="50%" cy="28%" r="74%">
            <stop offset="0%" stop-color="#146a52"/>
            <stop offset="60%" stop-color="#0b4636"/>
            <stop offset="100%" stop-color="#06281f"/>
          </radialGradient>
          <radialGradient id="${uid}-socket-flange" cx="35%" cy="28%" r="70%">
            <stop offset="0%" stop-color="#fff4c4"/>
            <stop offset="45%" stop-color="#c98e2e"/>
            <stop offset="100%" stop-color="#583409"/>
          </radialGradient>
        </defs>
      </svg>

      <div class="v5g-mahogany-frame">
        ${renderRivetedBrassCornerSvg('v5g-corner-tl', uid)}
        ${renderRivetedBrassCornerSvg('v5g-corner-tr', uid)}
        ${renderRivetedBrassCornerSvg('v5g-corner-bl', uid)}
        ${renderRivetedBrassCornerSvg('v5g-corner-br', uid)}

        <div class="v5g-mahogany-board">
          <div class="v5g-match-arena" data-v5g-match-arena>
            <svg class="v5g-match-svg" data-v5g-match-svg aria-hidden="true"></svg>

            <div class="v5g-match-col" data-v5g-col-left>
              ${spec.pairs
                .map(
                  (p) => `
                <div class="v5g-match-row-wrap is-left" data-side="left" data-pair-id="${escapeHtml(p.pairId)}">
                  <button type="button" class="v5g-match-plaque" data-v5g-plaque data-side="left" data-pair-id="${escapeHtml(p.pairId)}">
                    ${renderScallopedPlaqueSvg(uid)}
                    <span class="v5g-plaque-label">${escapeHtml(p.leftPrompt)}</span>
                  </button>
                  <button type="button" class="v5g-socket-btn" data-v5g-socket data-side="left" data-pair-id="${escapeHtml(p.pairId)}" aria-label="Wire socket for ${escapeHtml(p.leftPrompt)}">
                    ${renderBrassSocketSvg(uid, 'left')}
                  </button>
                </div>`,
                )
                .join('')}
            </div>

            <div aria-hidden="true"></div>

            <div class="v5g-match-col" data-v5g-col-right>
              ${spec.shuffledRight
                .map(
                  (r) => `
                <div class="v5g-match-row-wrap is-right" data-side="right" data-pair-id="${escapeHtml(r.pairId)}">
                  <button type="button" class="v5g-match-plaque" data-v5g-plaque data-side="right" data-pair-id="${escapeHtml(r.pairId)}">
                    ${renderScallopedPlaqueSvg(uid)}
                    <span class="v5g-plaque-label">${escapeHtml(r.text)}</span>
                  </button>
                  <button type="button" class="v5g-socket-btn" data-v5g-socket data-side="right" data-pair-id="${escapeHtml(r.pairId)}" aria-label="Wire socket for ${escapeHtml(r.text)}">
                    ${renderBrassSocketSvg(uid, 'right')}
                  </button>
                </div>`,
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Knurled Brass LOCK 4 CABLES Drum Switch + Subtle Unplug Reset Latch -->
      <div class="v5g-switchboard-footer">
        <button type="button" class="v5g-drum-btn" data-v5g-match-lock disabled>
          <span class="v5g-drum-wheel" aria-hidden="true"></span>
          <span class="v5g-drum-body">
            <span class="v5g-drum-leds" data-v5g-drum-leds aria-hidden="true">
              <span class="v5g-drum-led"></span>
              <span class="v5g-drum-led"></span>
              <span class="v5g-drum-led"></span>
              <span class="v5g-drum-led"></span>
            </span>
            <span class="v5g-drum-faceplate" data-v5g-match-lock-label>LOCK 4 CABLES</span>
          </span>
          <span class="v5g-drum-wheel" aria-hidden="true"></span>
        </button>

        <button type="button" class="v5g-unplug-btn" data-v5g-unplug disabled aria-label="Unplug all cables">
          ${renderUnplugIconSvg()}
          <span>Unplug</span>
        </button>
      </div>
    </div>
  `;

  const arenaEl = container.querySelector<HTMLElement>('[data-v5g-match-arena]')!;
  const svgEl = container.querySelector<SVGSVGElement>('[data-v5g-match-svg]')!;
  const lockBtn = container.querySelector<HTMLButtonElement>('[data-v5g-match-lock]')!;
  const lockLabel = container.querySelector<HTMLElement>('[data-v5g-match-lock-label]')!;
  const unplugBtn = container.querySelector<HTMLButtonElement>('[data-v5g-unplug]')!;
  const ledEls = Array.from(container.querySelectorAll<HTMLElement>('.v5g-drum-led'));
  const hintSlip = container.querySelector<HTMLElement>('[data-v5g-hint-slip]')!;
  const hintTextEl = container.querySelector<HTMLElement>('[data-v5g-hint-text]')!;

  const leftPlaques = new Map<string, HTMLButtonElement>();
  const rightPlaques = new Map<string, HTMLButtonElement>();
  const leftSockets = new Map<string, HTMLButtonElement>();
  const rightSockets = new Map<string, HTMLButtonElement>();

  container.querySelectorAll<HTMLButtonElement>('[data-v5g-plaque]').forEach((btn) => {
    const side = btn.dataset.side as 'left' | 'right';
    const pairId = btn.dataset.pairId || '';
    if (side === 'left') leftPlaques.set(pairId, btn);
    else rightPlaques.set(pairId, btn);
  });

  container.querySelectorAll<HTMLButtonElement>('[data-v5g-socket]').forEach((btn) => {
    const side = btn.dataset.side as 'left' | 'right';
    const pairId = btn.dataset.pairId || '';
    if (side === 'left') leftSockets.set(pairId, btn);
    else rightSockets.set(pairId, btn);
  });

  const findLeftByRight = (rightId: string): string | null => {
    for (const [lId, rId] of links.entries()) {
      if (rId === rightId) return lId;
    }
    return null;
  };

  const assignPaletteForLeft = (leftId: string): BraidedCablePalette => {
    const existing = paletteByLeft.get(leftId);
    if (existing) return existing;
    const used = new Set(paletteByLeft.values());
    const free =
      BRAIDED_CABLE_PALETTES.find((p) => !used.has(p)) ??
      BRAIDED_CABLE_PALETTES[links.size % BRAIDED_CABLE_PALETTES.length];
    paletteByLeft.set(leftId, free);
    return free;
  };

  const linkPair = (leftId: string, rightId: string): void => {
    const prevLeft = findLeftByRight(rightId);
    if (prevLeft && prevLeft !== leftId) {
      links.delete(prevLeft);
      paletteByLeft.delete(prevLeft);
    }
    assignPaletteForLeft(leftId);
    links.set(leftId, rightId);
    options.onInteractionFeedback?.('tap');
  };

  const getSocketCenter = (side: 'left' | 'right', pairId: string, arenaRect: DOMRect): { x: number; y: number } | null => {
    const sock = side === 'left' ? leftSockets.get(pairId) : rightSockets.get(pairId);
    if (!sock) return null;
    const r = sock.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - arenaRect.left,
      y: r.top + r.height / 2 - arenaRect.top,
    };
  };

  const buildBraidedCableSvg = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    palette: BraidedCablePalette,
    isDraft: boolean,
  ): string => {
    const horizDist = Math.abs(x2 - x1);
    const ctrlOffset = Math.max(38, horizDist * 0.54);
    const c1x = x1 < x2 ? x1 + ctrlOffset : x1 - ctrlOffset;
    const c2x = x1 < x2 ? x2 - ctrlOffset : x2 + ctrlOffset;
    // Slight natural physical cable drape on horizontal runs so cables look weighty & alive
    const sag = Math.abs(y2 - y1) < 16 ? 14 : 0;
    const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${c1x.toFixed(1)} ${(y1 + sag).toFixed(1)}, ${c2x.toFixed(1)} ${(y2 + sag).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    const shadowD = `M ${x1.toFixed(1)} ${(y1 + 4).toFixed(1)} C ${c1x.toFixed(1)} ${(y1 + sag + 6).toFixed(1)}, ${c2x.toFixed(1)} ${(y2 + sag + 6).toFixed(1)}, ${x2.toFixed(1)} ${(y2 + 4).toFixed(1)}`;

    const plugCap = (cx: number, cy: number): string => `
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="7.5" fill="${palette.glow}" fill-opacity="0.32" filter="url(#${uid}-cable-glow)"/>
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5.3" fill="url(#${uid}-jack-brass)" stroke="#3d2205" stroke-width="1"/>
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.6" fill="${palette.core}"/>
    `;

    return `
      <g opacity="${isDraft ? '0.88' : '1'}">
        <path d="${shadowD}" fill="none" stroke="rgba(10, 3, 1, 0.72)" stroke-width="11.5" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="${palette.glow}" stroke-opacity="0.36" stroke-width="16.5" stroke-linecap="round" filter="url(#${uid}-cable-glow)"/>
        <path d="${d}" fill="none" stroke="${palette.dark}" stroke-width="9.4" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="${palette.mid}" stroke-width="7.6" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="${palette.dark}" stroke-width="6.8" stroke-dasharray="4 3" stroke-linecap="butt" stroke-opacity="0.58"/>
        <path d="${d}" fill="none" stroke="${palette.core}" stroke-width="5.0" stroke-dasharray="3.2 3.8" stroke-dashoffset="1.6" stroke-linecap="butt" stroke-opacity="0.62"/>
        <path d="${d}" fill="none" stroke="${palette.core}" stroke-width="2.5" stroke-opacity="0.72" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="#ffffff" stroke-width="1.15" stroke-opacity="0.52" stroke-linecap="round"/>
        ${plugCap(x1, y1)}
        ${isDraft ? `<circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="6" fill="${palette.core}" stroke="#3d2205" stroke-width="1.2"/>` : plugCap(x2, y2)}
      </g>
    `;
  };

  const redrawCablesSvg = (): void => {
    const arenaRect = arenaEl.getBoundingClientRect();
    if (arenaRect.width <= 0 || arenaRect.height <= 0) return;

    svgEl.setAttribute('viewBox', `0 0 ${arenaRect.width.toFixed(1)} ${arenaRect.height.toFixed(1)}`);

    const cablePieces: string[] = [
      `<defs>
        <filter id="${uid}-cable-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4.2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="${uid}-jack-brass" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fff4c4"/>
          <stop offset="50%" stop-color="#d49935"/>
          <stop offset="100%" stop-color="#613a0a"/>
        </radialGradient>
      </defs>`,
    ];

    links.forEach((rightId, leftId) => {
      const p1 = getSocketCenter('left', leftId, arenaRect);
      const p2 = getSocketCenter('right', rightId, arenaRect);
      if (!p1 || !p2) return;
      const palette = revealMode
        ? leftId === rightId
          ? REVEAL_CORRECT_CABLE
          : REVEAL_WRONG_CABLE
        : paletteByLeft.get(leftId) ?? BRAIDED_CABLE_PALETTES[0];
      cablePieces.push(buildBraidedCableSvg(p1.x, p1.y, p2.x, p2.y, palette, false));
    });

    if (dragState && dragState.moved) {
      const p1 = getSocketCenter(dragState.side, dragState.pairId, arenaRect);
      if (p1) {
        const draftPalette =
          dragState.side === 'left'
            ? paletteByLeft.get(dragState.pairId) ??
              BRAIDED_CABLE_PALETTES[links.size % BRAIDED_CABLE_PALETTES.length]
            : BRAIDED_CABLE_PALETTES[links.size % BRAIDED_CABLE_PALETTES.length];
        const x2 = dragState.currX - arenaRect.left;
        const y2 = dragState.currY - arenaRect.top;
        cablePieces.push(buildBraidedCableSvg(p1.x, p1.y, x2, y2, draftPalette, true));
      }
    }

    svgEl.innerHTML = cablePieces.join('');
  };

  const syncVisualStates = (): void => {
    const rightPaletteMap = new Map<string, BraidedCablePalette>();
    links.forEach((rId, lId) => {
      rightPaletteMap.set(rId, paletteByLeft.get(lId) ?? BRAIDED_CABLE_PALETTES[0]);
    });

    leftPlaques.forEach((btn, lId) => {
      const isPick = selectedSide === 'left' && selectedId === lId;
      const isDrop = dragState?.moved && dragState.side === 'right' && dragState.hoverTargetId === lId;
      btn.classList.toggle('is-active-pick', isPick);
      btn.classList.toggle('is-drop-target', Boolean(isDrop));
      const sock = leftSockets.get(lId);
      if (sock) {
        sock.classList.toggle('is-active-pick', isPick);
        sock.classList.toggle('is-drop-target', Boolean(isDrop));
        const ring = sock.querySelector<SVGCircleElement>('.v5g-socket-ring');
        const pal = paletteByLeft.get(lId);
        if (ring) {
          ring.setAttribute(
            'stroke',
            isPick ? '#ffe680' : pal ? pal.glow : 'rgba(255,220,128,0.35)',
          );
        }
      }
    });

    rightPlaques.forEach((btn, rId) => {
      const isPick = selectedSide === 'right' && selectedId === rId;
      const isDrop = dragState?.moved && dragState.side === 'left' && dragState.hoverTargetId === rId;
      btn.classList.toggle('is-active-pick', isPick);
      btn.classList.toggle('is-drop-target', Boolean(isDrop));
      const sock = rightSockets.get(rId);
      if (sock) {
        sock.classList.toggle('is-active-pick', isPick);
        sock.classList.toggle('is-drop-target', Boolean(isDrop));
        const ring = sock.querySelector<SVGCircleElement>('.v5g-socket-ring');
        const pal = rightPaletteMap.get(rId);
        if (ring) {
          ring.setAttribute(
            'stroke',
            isPick ? '#ffe680' : pal ? pal.glow : 'rgba(255,220,128,0.35)',
          );
        }
      }
    });

    const connectedPalettes = Array.from(links.keys()).map(
      (lId) => paletteByLeft.get(lId) ?? BRAIDED_CABLE_PALETTES[0],
    );
    ledEls.forEach((led, idx) => {
      const pal = connectedPalettes[idx];
      if (pal) {
        led.classList.add('is-lit');
        led.style.backgroundColor = pal.core;
        led.style.boxShadow = `0 0 8px ${pal.glow}`;
      } else {
        led.classList.remove('is-lit');
        led.style.backgroundColor = '#231407';
        led.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.85)';
      }
    });

    const count = links.size;
    lockBtn.disabled = locked || count < 4;
    unplugBtn.disabled = locked || count === 0;
    if (!locked) {
      lockLabel.textContent = count === 4 ? 'LOCK 4 CABLES' : `LOCK 4 CABLES (${count}/4)`;
    }

    redrawCablesSvg();
  };

  const handleTapSelect = (side: 'left' | 'right', pairId: string): void => {
    if (locked) return;

    // Nothing selected yet: tapping an already-paired terminal unplugs it!
    if (selectedSide === null) {
      if (side === 'left' && links.has(pairId)) {
        links.delete(pairId);
        paletteByLeft.delete(pairId);
        options.onInteractionFeedback?.('tap');
        syncVisualStates();
        return;
      }
      if (side === 'right') {
        const existingLeft = findLeftByRight(pairId);
        if (existingLeft) {
          links.delete(existingLeft);
          paletteByLeft.delete(existingLeft);
          options.onInteractionFeedback?.('tap');
          syncVisualStates();
          return;
        }
      }
      selectedSide = side;
      selectedId = pairId;
      options.onInteractionFeedback?.('tap');
      syncVisualStates();
      return;
    }

    // Tapping same terminal cancels selection
    if (selectedSide === side && selectedId === pairId) {
      selectedSide = null;
      selectedId = null;
      syncVisualStates();
      return;
    }

    // Tapping another terminal on the same side switches selection
    if (selectedSide === side) {
      selectedId = pairId;
      options.onInteractionFeedback?.('tap');
      syncVisualStates();
      return;
    }

    // Opposite side -> snap braided cable across!
    const leftId = side === 'left' ? pairId : selectedId!;
    const rightId = side === 'right' ? pairId : selectedId!;
    linkPair(leftId, rightId);
    selectedSide = null;
    selectedId = null;
    syncVisualStates();
  };

  const findTerminalAtPoint = (
    clientX: number,
    clientY: number,
  ): { side: 'left' | 'right'; pairId: string } | null => {
    const hit = document.elementFromPoint(clientX, clientY);
    const wrap = hit?.closest<HTMLElement>('.v5g-match-row-wrap');
    if (wrap && wrap.dataset.side && wrap.dataset.pairId) {
      return {
        side: wrap.dataset.side as 'left' | 'right',
        pairId: wrap.dataset.pairId,
      };
    }
    return null;
  };

  const bindTerminalEvents = (el: HTMLButtonElement): void => {
    const side = el.dataset.side as 'left' | 'right';
    const pairId = el.dataset.pairId || '';

    el.addEventListener('pointerdown', (ev) => {
      if (locked || ev.button === 2) return;
      ev.preventDefault();
      dragState = {
        side,
        pairId,
        pointerId: ev.pointerId,
        startX: ev.clientX,
        startY: ev.clientY,
        currX: ev.clientX,
        currY: ev.clientY,
        moved: false,
        hoverTargetId: null,
      };
    });

    el.addEventListener('keydown', (ev) => {
      if (locked) return;
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        handleTapSelect(side, pairId);
      }
    });
  };

  leftPlaques.forEach(bindTerminalEvents);
  rightPlaques.forEach(bindTerminalEvents);
  leftSockets.forEach(bindTerminalEvents);
  rightSockets.forEach(bindTerminalEvents);

  const onWinPointerMove = (ev: PointerEvent): void => {
    if (!dragState || ev.pointerId !== dragState.pointerId || locked) return;
    if (!dragState.moved && Math.hypot(ev.clientX - dragState.startX, ev.clientY - dragState.startY) > 7) {
      dragState.moved = true;
    }
    dragState.currX = ev.clientX;
    dragState.currY = ev.clientY;
    if (dragState.moved) {
      const hit = findTerminalAtPoint(ev.clientX, ev.clientY);
      const nextHover = hit && hit.side !== dragState.side ? hit.pairId : null;
      if (nextHover !== dragState.hoverTargetId) {
        dragState.hoverTargetId = nextHover;
        syncVisualStates();
      } else {
        redrawCablesSvg();
      }
    }
  };

  const onWinPointerUp = (ev: PointerEvent): void => {
    const drag = dragState;
    if (!drag || ev.pointerId !== drag.pointerId) return;
    dragState = null;

    if (drag.moved) {
      const hit = findTerminalAtPoint(ev.clientX, ev.clientY);
      if (hit && hit.side !== drag.side) {
        const leftId = drag.side === 'left' ? drag.pairId : hit.pairId;
        const rightId = drag.side === 'right' ? drag.pairId : hit.pairId;
        linkPair(leftId, rightId);
        selectedSide = null;
        selectedId = null;
      }
      syncVisualStates();
      return;
    }

    handleTapSelect(drag.side, drag.pairId);
  };

  window.addEventListener('pointermove', onWinPointerMove);
  window.addEventListener('pointerup', onWinPointerUp);
  window.addEventListener('pointercancel', onWinPointerUp);

  unplugBtn.addEventListener('click', () => {
    if (locked || links.size === 0) return;
    links.clear();
    paletteByLeft.clear();
    selectedSide = null;
    selectedId = null;
    options.onInteractionFeedback?.('tap');
    syncVisualStates();
  });

  const buildSubmission = (timedOut = false): AnswerSubmissionV4 => {
    const linksObj: Record<string, string> = {};
    links.forEach((rId, lId) => {
      linksObj[lId] = rId;
    });
    return {
      format: 'MATCH_4',
      timedOut: timedOut || undefined,
      elapsedSec: Math.max(0.1, Number(((performance.now() - startedAtMs) / 1000).toFixed(2))),
      usedHint: usedHintLocal || options.getUsedHint?.() || undefined,
      doubleDownArmed: options.getDoubleDownArmed?.() || undefined,
      match4Links: linksObj,
    };
  };

  const disableControls = (): void => {
    locked = true;
    dragState = null;
    selectedSide = null;
    selectedId = null;
    leftPlaques.forEach((b) => {
      b.disabled = true;
    });
    rightPlaques.forEach((b) => {
      b.disabled = true;
    });
    leftSockets.forEach((b) => {
      b.disabled = true;
    });
    rightSockets.forEach((b) => {
      b.disabled = true;
    });
    lockBtn.disabled = true;
    lockBtn.classList.add('is-locked');
    lockLabel.textContent = 'CABLES LOCKED';
    unplugBtn.disabled = true;
  };

  lockBtn.addEventListener('click', () => {
    if (locked || links.size < 4) return;
    disableControls();
    options.onInteractionFeedback?.('lock_in');
    void options.onSubmit(buildSubmission(false));
  });

  // Keep braided cables pixel-aligned across layout / viewport resizes
  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      redrawCablesSvg();
    });
    resizeObserver.observe(arenaEl);
  }
  const onWinResize = (): void => redrawCablesSvg();
  window.addEventListener('resize', onWinResize, { passive: true });

  syncVisualStates();
  window.requestAnimationFrame(() => redrawCablesSvg());

  return {
    revealHint(text: string): void {
      usedHintLocal = true;
      hintTextEl.textContent = text;
      hintSlip.classList.add('is-open');
      window.requestAnimationFrame(() => redrawCablesSvg());
    },

    showGadgetReveal(_evalResult: EvaluatedAnswerV4): void {
      disableControls();
      revealMode = true;
      const rightLabelByPair = new Map(spec.pairs.map((p) => [p.pairId, p.rightAnswer]));

      leftPlaques.forEach((btn, lId) => {
        btn.classList.remove('is-active-pick', 'is-drop-target');
        const chosenRight = links.get(lId);
        const isOk = chosenRight === lId;
        btn.classList.add(isOk ? 'is-correct' : 'is-wrong');
        if (!isOk && !btn.querySelector('.v5g-plaque-correction')) {
          const trueAns = rightLabelByPair.get(lId);
          if (trueAns) {
            const note = document.createElement('span');
            note.className = 'v5g-plaque-correction';
            note.textContent = `→ ${trueAns}`;
            btn.appendChild(note);
          }
        }
      });

      rightPlaques.forEach((btn, rId) => {
        btn.classList.remove('is-active-pick', 'is-drop-target');
        const pairedLeft = findLeftByRight(rId);
        btn.classList.add(pairedLeft === rId ? 'is-correct' : 'is-wrong');
      });

      window.requestAnimationFrame(() => redrawCablesSvg());
    },

    lockForTimeout(): AnswerSubmissionV4 {
      disableControls();
      return buildSubmission(true);
    },

    getCurrentSubmission(): AnswerSubmissionV4 {
      return buildSubmission(false);
    },

    dispose(): void {
      resizeObserver?.disconnect();
      window.removeEventListener('pointermove', onWinPointerMove);
      window.removeEventListener('pointerup', onWinPointerUp);
      window.removeEventListener('pointercancel', onWinPointerUp);
      window.removeEventListener('resize', onWinResize);
      container.innerHTML = '';
    },
  };
}

// ============================================================================
// GADGET 3: SORT_4 (Mahogany & Brass Chronology Slotted Track)
// ============================================================================

export function mountSort4BrassRackGadget(
  container: HTMLElement,
  card: QuestionCardV4,
  options: TactileGadgetOptionsV5,
): TactileGadgetHandleV5 {
  ensureGadgetStylesV5();
  const spec = card.sort4;
  if (!spec) {
    return renderFallbackNotice(container, 'Sort-4 chronology rack spec unavailable for this card.');
  }

  const uid = nextGadgetUid('v5s4');
  const startedAtMs = options.startedAtMs ?? performance.now();

  const itemById = new Map(spec.correctOrder.map((item) => [item.itemId, item]));
  const correctRankById = new Map(spec.correctOrder.map((item, idx) => [item.itemId, idx]));
  const orderIds: string[] = spec.initialOrder.map((item) => item.itemId);

  let locked = false;
  let usedHintLocal = false;
  let activeDrag: {
    itemId: string;
    pointerId: number;
    el: HTMLElement;
    startY: number;
  } | null = null;

  const cleanDirectionLabel = spec.orderDirectionLabel.replace(/->/g, '→');

  container.innerHTML = `
    <div class="v5g-root" data-v5g-format="SORT_4">
      <div class="v5g-hint-slip" data-v5g-hint-slip role="status">
        <span class="v5g-hint-tag">CLUE</span>
        <span class="v5g-hint-text" data-v5g-hint-text></span>
      </div>

      <svg width="0" height="0" style="position:absolute;pointer-events:none" aria-hidden="true">
        <defs>
          <linearGradient id="${uid}-brass-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff2b8"/>
            <stop offset="30%" stop-color="#d89e3c"/>
            <stop offset="58%" stop-color="#875814"/>
            <stop offset="85%" stop-color="#f2ca6e"/>
            <stop offset="100%" stop-color="#653d0b"/>
          </linearGradient>
        </defs>
      </svg>

      <div class="v5g-mahogany-frame">
        ${renderRivetedBrassCornerSvg('v5g-corner-tl', uid)}
        ${renderRivetedBrassCornerSvg('v5g-corner-tr', uid)}
        ${renderRivetedBrassCornerSvg('v5g-corner-bl', uid)}
        ${renderRivetedBrassCornerSvg('v5g-corner-br', uid)}

        <div class="v5g-mahogany-board">
          <div class="v5g-sort-header">
            <span class="v5g-sort-axis-tag">#1 TOP</span>
            <span class="v5g-sort-axis-title">${escapeHtml(cleanDirectionLabel)}</span>
            <span class="v5g-sort-axis-tag">#4 BOTTOM</span>
          </div>

          <div class="v5g-sort-track-area">
            <div class="v5g-sort-rail" aria-hidden="true"></div>
            <div class="v5g-sort-list" data-v5g-sort-list></div>
          </div>
        </div>
      </div>

      <!-- Sculpted Gold LOCK ORDER Stage Lever -->
      <div class="v5g-lever-footer">
        <button type="button" class="v5g-gold-lever-btn" data-v5g-sort-lock>
          <span class="v5g-gold-lever-housing">
            <span class="v5g-plunger-lightbar" aria-hidden="true"></span>
            <span class="v5g-gold-lever-plate" data-v5g-sort-lock-label>LOCK ORDER</span>
            <span class="v5g-plunger-lightbar" aria-hidden="true"></span>
          </span>
        </button>
      </div>
    </div>
  `;

  const listEl = container.querySelector<HTMLElement>('[data-v5g-sort-list]')!;
  const lockBtn = container.querySelector<HTMLButtonElement>('[data-v5g-sort-lock]')!;
  const lockLabel = container.querySelector<HTMLElement>('[data-v5g-sort-lock-label]')!;
  const hintSlip = container.querySelector<HTMLElement>('[data-v5g-hint-slip]')!;
  const hintTextEl = container.querySelector<HTMLElement>('[data-v5g-hint-text]')!;

  const plaqueById = new Map<string, HTMLElement>();

  // Sync DOM node order in-place so active pointer capture NEVER drops during drag!
  const syncPlaqueDomOrder = (): void => {
    orderIds.forEach((id, idx) => {
      const el = plaqueById.get(id);
      if (!el) return;
      el.dataset.index = String(idx);
      const badge = el.querySelector<HTMLElement>('[data-v5g-rank]');
      if (badge) badge.textContent = `#${idx + 1}`;
      const upBtn = el.querySelector<HTMLButtonElement>('[data-v5g-move="up"]');
      const downBtn = el.querySelector<HTMLButtonElement>('[data-v5g-move="down"]');
      if (upBtn) upBtn.disabled = locked || idx === 0;
      if (downBtn) downBtn.disabled = locked || idx === orderIds.length - 1;
      listEl.appendChild(el);
    });
  };

  const moveItemByDelta = (itemId: string, delta: -1 | 1): void => {
    if (locked) return;
    const idx = orderIds.indexOf(itemId);
    const targetIdx = idx + delta;
    if (idx < 0 || targetIdx < 0 || targetIdx >= orderIds.length) return;
    const tmp = orderIds[idx];
    orderIds[idx] = orderIds[targetIdx];
    orderIds[targetIdx] = tmp;
    options.onInteractionFeedback?.('tap');
    syncPlaqueDomOrder();
  };

  // Mount the 4 beveled emerald-and-brass sliding plaques ONCE
  orderIds.forEach((id) => {
    const item = itemById.get(id);
    if (!item) return;

    const plaque = document.createElement('div');
    plaque.className = 'v5g-sort-plaque';
    plaque.dataset.itemId = id;
    plaque.innerHTML = `
      <span class="v5g-sort-rank-badge" data-v5g-rank>#1</span>
      <span class="v5g-sort-grip" aria-hidden="true"></span>
      <div class="v5g-sort-copy">
        <span class="v5g-sort-label">${escapeHtml(item.label)}</span>
        <span class="v5g-sort-reveal-pill" data-v5g-reveal-pill></span>
      </div>
      <div class="v5g-sort-latches">
        <button type="button" class="v5g-latch-btn" data-v5g-move="up" aria-label="Move ${escapeHtml(item.label)} up">
          ${renderBrassTriangleIconSvg('up')}
        </button>
        <button type="button" class="v5g-latch-btn" data-v5g-move="down" aria-label="Move ${escapeHtml(item.label)} down">
          ${renderBrassTriangleIconSvg('down')}
        </button>
      </div>
    `;

    const upBtn = plaque.querySelector<HTMLButtonElement>('[data-v5g-move="up"]')!;
    const downBtn = plaque.querySelector<HTMLButtonElement>('[data-v5g-move="down"]')!;
    upBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      moveItemByDelta(id, -1);
    });
    downBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      moveItemByDelta(id, 1);
    });

    plaque.addEventListener('pointerdown', (ev) => {
      if (locked || ev.button === 2) return;
      const target = ev.target as HTMLElement | null;
      if (target?.closest('button')) return;
      ev.preventDefault();
      activeDrag = {
        itemId: id,
        pointerId: ev.pointerId,
        el: plaque,
        startY: ev.clientY,
      };
      plaque.classList.add('is-dragging');
      plaque.setPointerCapture?.(ev.pointerId);
    });

    plaqueById.set(id, plaque);
  });

  syncPlaqueDomOrder();

  const onWinPointerMove = (ev: PointerEvent): void => {
    if (!activeDrag || locked || ev.pointerId !== activeDrag.pointerId) return;
    const currentIdx = orderIds.indexOf(activeDrag.itemId);
    if (currentIdx < 0) return;

    for (let j = 0; j < orderIds.length; j += 1) {
      if (j === currentIdx) continue;
      const neighborEl = plaqueById.get(orderIds[j]);
      if (!neighborEl) continue;
      const rect = neighborEl.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if ((j < currentIdx && ev.clientY < midY) || (j > currentIdx && ev.clientY > midY)) {
        const [moved] = orderIds.splice(currentIdx, 1);
        orderIds.splice(j, 0, moved);
        options.onInteractionFeedback?.('tap');
        syncPlaqueDomOrder();
        break;
      }
    }
  };

  const onWinPointerUp = (ev: PointerEvent): void => {
    if (!activeDrag || ev.pointerId !== activeDrag.pointerId) return;
    activeDrag.el.classList.remove('is-dragging');
    activeDrag = null;
  };

  window.addEventListener('pointermove', onWinPointerMove);
  window.addEventListener('pointerup', onWinPointerUp);
  window.addEventListener('pointercancel', onWinPointerUp);

  const buildSubmission = (timedOut = false): AnswerSubmissionV4 => ({
    format: 'SORT_4',
    timedOut: timedOut || undefined,
    elapsedSec: Math.max(0.1, Number(((performance.now() - startedAtMs) / 1000).toFixed(2))),
    usedHint: usedHintLocal || options.getUsedHint?.() || undefined,
    doubleDownArmed: options.getDoubleDownArmed?.() || undefined,
    sort4Ids: [...orderIds],
  });

  const disableControls = (): void => {
    locked = true;
    if (activeDrag) {
      activeDrag.el.classList.remove('is-dragging');
      activeDrag = null;
    }
    plaqueById.forEach((el) => {
      el.classList.add('is-locked');
      el.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
        b.disabled = true;
      });
    });
    lockBtn.disabled = true;
    lockBtn.classList.add('is-locked');
    lockLabel.textContent = 'ORDER LOCKED';
  };

  lockBtn.addEventListener('click', () => {
    if (locked) return;
    disableControls();
    options.onInteractionFeedback?.('lock_in');
    void options.onSubmit(buildSubmission(false));
  });

  return {
    revealHint(text: string): void {
      usedHintLocal = true;
      hintTextEl.textContent = text;
      hintSlip.classList.add('is-open');
    },

    showGadgetReveal(_evalResult: EvaluatedAnswerV4): void {
      disableControls();
      orderIds.forEach((id, idx) => {
        const el = plaqueById.get(id);
        const item = itemById.get(id);
        const trueRank = correctRankById.get(id) ?? idx;
        if (!el || !item) return;
        const isOk = trueRank === idx;
        el.classList.add(isOk ? 'is-correct' : 'is-wrong');
        const pill = el.querySelector<HTMLElement>('[data-v5g-reveal-pill]');
        if (pill) {
          pill.classList.add('is-visible');
          pill.textContent = isOk
            ? `${item.formattedValue} · Exact #${trueRank + 1}`
            : `${item.formattedValue} · True #${trueRank + 1}`;
        }
      });
    },

    lockForTimeout(): AnswerSubmissionV4 {
      disableControls();
      return buildSubmission(true);
    },

    getCurrentSubmission(): AnswerSubmissionV4 {
      return buildSubmission(false);
    },

    dispose(): void {
      window.removeEventListener('pointermove', onWinPointerMove);
      window.removeEventListener('pointerup', onWinPointerUp);
      window.removeEventListener('pointercancel', onWinPointerUp);
      container.innerHTML = '';
    },
  };
}

// ============================================================================
// CONVENIENCE DISPATCHER FOR STAGE SHELLS (`SpotlightLozengeRendererV5`)
// ============================================================================

export function mountTactileGadgetV5(
  container: HTMLElement,
  card: QuestionCardV4,
  options: TactileGadgetOptionsV5,
): TactileGadgetHandleV5 | null {
  switch (card.format) {
    case 'PINPOINT_DIAL':
      return mountPinpointDialGadget(container, card, options);
    case 'MATCH_4':
      return mountMatch4SwitchboardGadget(container, card, options);
    case 'SORT_4':
      return mountSort4BrassRackGadget(container, card, options);
    default:
      return null;
  }
}
