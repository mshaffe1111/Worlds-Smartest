// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 "Sweeps Week Deluxe")
// `src/v7/toys/FourShutterLadderDeluxeV8.ts` — Upgrade #8b
//
// Deluxe 1966 Pop-Art 4-Shutter *Only Connect* Multiplier Wall:
//  - Illuminated 4-Step 1966 Studio Tube Multiplier Marquee Header:
//      `[★ 2.0× CLUE 1] → [1.6× CLUE 2] → [1.3× CLUE 3] → [1.0× ALL 4]`
//      driven by `SHUTTER_REEL_MULTIPLIER_LADDER_V8` (`[2.0, 1.6, 1.3, 1.0]`).
//  - Special `MONOLOGUE_WRITER` DayJob Perk:
//      Starts with Shutters 1 & 2 already open while locking the `2.0×` top
//      multiplier (`"★ WRITER PERK: 2 CLUES OPEN AT 2.0×!"`).
//  - 4 Physical Brass-and-Walnut Motorized Louver Shutters:
//      • Open shutters glow on Warm Broadcast Cream (`#FFF6E3`, >= 15px crisp
//        `#141B29` ink, zero `...` truncation, retracted painted louver lip).
//      • Unopened Shutters 2, 3, 4 are vibrant 1966 *Laugh-In* Mid-Century
//        painted studio doors (Peacock Teal, Harvest Gold, Carnaby Cerise) with
//        horizontal louver slats, brass barrel hinges & 3D brass pull handles.
//      • Tapping either an unopened shutter OR the dedicated
//        brass-key `PEEK NEXT SHUTTER (DROPS TO ${nextMult}×)` button retracts
//        the next motorized louver door upward with `SHUTTER_CLACK` SFX!
//  - 4 Crisp Backlit Acrylite Push-Button Choice Pads (`A / B / C / D`):
//      • 2-Beat Studio Desk Lock-In (`LOCKED IN...` warm 2700K amber glow ->
//        Radiant Emerald `✓` true answer / Broadcast Vermilion `✗` wrong pick)
//      • Full `applyFiftyFiftyPrune()` (`[50/50 CUT]`) &
//        `showAudiencePollOverlay(percentages)` Solari `%` bar badges
//      • Emits `chipMultiplier: activeMult` (when correct, `0` when wrong) +
//        descriptive `summaryText` (e.g. `"2.0× SHUTTER-1 GENIUS SOLVE!"`)
//  - Compact Viewport Mastery:
//      Fits `390x660` mobile portrait AND `844x390` mobile landscape (2-column
//      split: 4 shutters on left, 2x2 choice pads on right in landscape!) with
//      `0px` overflow and `>= 48x48px` tap targets!
// ============================================================================

import {
  SHUTTER_REEL_MULTIPLIER_LADDER_V8,
  type ClueRecordV7,
  type QuestionCardStyleV7,
  type ShutterReelPayloadV7,
  type ToyResolutionV7,
} from '../contracts_v7';
import type {
  MountedTactileContraptionV7,
  TactileContraptionContextV7,
} from './TactileContraptions14V7';

export interface ShutterLadderResolutionV8 extends ToyResolutionV7 {
  /** Descriptive broadcast solve stamp, e.g. `"2.0× SHUTTER-1 GENIUS SOLVE!"`. */
  readonly summaryText: string;
  /** Number of shutters open (`1..4`) at the moment the player locked in. */
  readonly shutterSolvedAtCount: 1 | 2 | 3 | 4;
  /** Zero-based choice index (`0..3`) selected by the player. */
  readonly chosenChoiceIdx: 0 | 1 | 2 | 3;
}

const STUDIO_LETTERS_V8 = ['A', 'B', 'C', 'D'] as const;

const SHUTTER_DOOR_SPECS_V8 = [
  {
    tone: 'cream',
    doorName: 'SHUTTER 1',
    lipHex: '#008B94',
  },
  {
    tone: 'teal',
    doorName: 'SHUTTER 2',
    lipHex: '#008B94',
  },
  {
    tone: 'gold',
    doorName: 'SHUTTER 3',
    lipHex: '#F2A922',
  },
  {
    tone: 'cerise',
    doorName: 'SHUTTER 4',
    lipHex: '#E6397A',
  },
] as const;

const STYLES_ID_V8 = 'ws8-four-shutter-deluxe-styles';
let activeStyleMountCountV8 = 0;

function acquireFourShutterDeluxeStylesV8(): void {
  activeStyleMountCountV8 += 1;
  if (typeof document === 'undefined') return;
  let styleEl = document.getElementById(STYLES_ID_V8) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLES_ID_V8;
    document.head.appendChild(styleEl);
  }
  if (styleEl.dataset.version === 'v8.1-sunlit-shutter-wall') {
    return;
  }
  styleEl.dataset.version = 'v8.1-sunlit-shutter-wall';
  styleEl.textContent = `
    @keyframes ws8LouverSlideUp {
      0% {
        opacity: 1;
        transform: perspective(560px) rotateX(0deg) translateY(0%);
      }
      55% {
        opacity: 0.92;
        transform: perspective(560px) rotateX(62deg) translateY(-58%);
      }
      100% {
        opacity: 0;
        transform: perspective(560px) rotateX(84deg) translateY(-102%);
      }
    }

    @keyframes ws8CreamBloomIn {
      0% {
        background-color: #FFE7A8;
        box-shadow:
          inset 0 0 0 2px #FFD166,
          0 0 18px rgba(255, 209, 102, 0.65);
      }
      100% {
        background-color: #FFF6E3;
      }
    }

    @keyframes ws8ActiveTubePulse {
      from {
        box-shadow:
          inset 0 1.5px 0 #FFFDF7,
          0 2px 0 #A84D10,
          0 0 0 1.5px #FF6B35,
          0 0 10px rgba(242, 169, 34, 0.52);
      }
      to {
        box-shadow:
          inset 0 1.5px 0 #FFFFFF,
          0 2px 0 #A84D10,
          0 0 0 2px #F2A922,
          0 0 18px rgba(255, 107, 53, 0.78);
      }
    }

    @keyframes ws8ClutchPulse {
      from {
        transform: translateY(2px) scale(1);
        box-shadow:
          inset 0 2px 0 #FFFFFF,
          0 1px 0 #9E6300,
          0 0 0 3px #FFD166,
          0 0 16px rgba(255, 209, 102, 0.75);
      }
      to {
        transform: translateY(1px) scale(1.012);
        box-shadow:
          inset 0 2px 0 #FFFFFF,
          0 1px 0 #9E6300,
          0 0 0 4px #FFF3B0,
          0 0 30px rgba(255, 190, 46, 0.98);
      }
    }

    @keyframes ws8BadgePop {
      0% {
        opacity: 0;
        transform: scale(0.84);
      }
      70% {
        opacity: 1;
        transform: scale(1.06);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes ws8PollBarGrow {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }

    /* Safe-centering inside Question Chassis Toy Bay */
    .ws7-toy-bay:has(> .ws8-shutter-deluxe-root) {
      justify-content: flex-start !important;
      min-height: 0;
    }

    .ws8-shutter-deluxe-root {
      --ws8-sans: 'Plus Jakarta Sans', 'Jost', system-ui, -apple-system, 'Segoe UI', sans-serif;
      --ws8-caps: 'Jost', 'League Spartan', 'Plus Jakarta Sans', system-ui, sans-serif;
      --ws8-num: 'Michroma', 'Chakra Petch', 'Jost', sans-serif;
      container-type: inline-size;
      container-name: ws8shutter;
      position: relative;
      width: 100%;
      min-width: 0;
      margin: auto 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 7px;
      font-family: var(--ws8-sans);
      font-variant-numeric: tabular-nums;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      color: #141B29;
    }

    .ws8-shutter-deluxe-root *,
    .ws8-shutter-deluxe-root *::before,
    .ws8-shutter-deluxe-root *::after {
      box-sizing: border-box;
    }

    /* ========================================================================
       1. SUNLIT 1966 BRUSHED CHAMPAGNE-ALUMINUM & WARM IVORY STEP TRACK
       ======================================================================== */
    .ws8-shutter-marquee {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 5px 7px;
      border-radius: 12px;
      background:
        radial-gradient(circle at 14% 0%, rgba(255, 253, 247, 0.94) 0%, transparent 58%),
        radial-gradient(circle at 86% 0%, rgba(242, 169, 34, 0.24) 0%, transparent 58%),
        linear-gradient(180deg, #FFFDF7 0%, #EFE4CA 56%, #E2D2AE 100%);
      box-shadow:
        inset 0 1.5px 0 #FFFFFF,
        inset 0 0 0 1.6px #C89E4C,
        0 3px 10px rgba(74, 42, 18, 0.18);
    }

    .ws8-shutter-ladder-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
      align-items: center;
      gap: 3px;
      width: 100%;
    }

    .ws8-ladder-arrow {
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      color: #8A5A19;
      opacity: 0.92;
      line-height: 1;
      padding: 0 1px;
    }

    .ws8-ladder-tube {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 34px;
      padding: 3px 4px;
      border-radius: 8px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F5ECD8 68%, #EADBC0 100%);
      box-shadow:
        inset 0 1px 0 #FFFFFF,
        inset 0 0 0 1.3px #C9A458,
        0 1.5px 0 #B58F46;
      color: #5A4632;
      text-align: center;
      transition: transform 0.16s ease, background 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
    }

    .ws8-ladder-tube-mult {
      font-family: var(--ws8-caps);
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.03em;
      line-height: 1.05;
      white-space: nowrap;
    }

    .ws8-ladder-tube-sub {
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.03em;
      line-height: 1.05;
      opacity: 0.92;
      white-space: nowrap;
    }

    .ws8-ladder-tube[data-state="active"] {
      background: linear-gradient(135deg, #FFF2B2 0%, #F2A922 52%, #FF7838 100%);
      color: #141B29;
      transform: translateY(-1px);
      box-shadow:
        inset 0 1.5px 0 #FFFDF7,
        0 2px 0 #A84D10,
        0 0 0 1.8px #FF6B35,
        0 0 14px rgba(242, 169, 34, 0.68);
    }

    .ws8-shutter-deluxe-root[data-reduced-motion="false"] .ws8-ladder-tube[data-state="active"] {
      animation: ws8ActiveTubePulse 1.35s ease-in-out infinite alternate;
    }

    .ws8-ladder-tube[data-state="spent"] {
      opacity: 0.68;
      background: linear-gradient(180deg, #F0E7D4 0%, #E3D6BC 100%);
      color: #85725B;
      box-shadow: inset 0 0 0 1px rgba(162, 128, 68, 0.44);
    }

    .ws8-ladder-tube[data-state="spent"] .ws8-ladder-tube-mult {
      text-decoration: line-through;
      text-decoration-thickness: 1.5px;
    }

    .ws8-writer-perk-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 2px 8px;
      border-radius: 7px;
      background: linear-gradient(90deg, #006E78 0%, #008B94 50%, #006E78 100%);
      box-shadow: inset 0 0 0 1.5px #FFD166;
      color: #FFFDF7;
      font-family: var(--ws8-caps);
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.15;
      text-align: center;
    }

    /* ========================================================================
       2. MAIN BODY (STACKED IN PORTRAIT, 2-COLUMN SPLIT IN LANDSCAPE / WIDE)
       ======================================================================== */
    .ws8-shutter-deluxe-body {
      display: flex;
      flex-direction: column;
      gap: 7px;
      width: 100%;
      min-width: 0;
    }

    .ws8-shutter-left-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    /* Sunlit 1966 American Walnut & Spun-Brass Motorized Shutter Frame */
    .ws8-walnut-cabinet {
      position: relative;
      padding: 6px;
      border-radius: 13px;
      background:
        radial-gradient(circle at 6px 6px, #FFE484 1.6px, #4A2410 2.5px, transparent 3px),
        radial-gradient(circle at calc(100% - 6px) 6px, #FFE484 1.6px, #4A2410 2.5px, transparent 3px),
        radial-gradient(circle at 6px calc(100% - 6px), #FFE484 1.6px, #4A2410 2.5px, transparent 3px),
        radial-gradient(circle at calc(100% - 6px) calc(100% - 6px), #FFE484 1.6px, #4A2410 2.5px, transparent 3px),
        repeating-linear-gradient(
          94deg,
          rgba(255, 226, 182, 0.06) 0px,
          rgba(255, 226, 182, 0.06) 3px,
          rgba(42, 18, 6, 0.08) 3px,
          rgba(42, 18, 6, 0.08) 9px
        ),
        linear-gradient(180deg, #7E4529 0%, #6E3B23 55%, #552B17 100%);
      box-shadow:
        inset 0 1.5px 0 rgba(255, 232, 192, 0.42),
        inset 0 0 0 1.8px #D9AE62,
        0 5px 14px rgba(5, 14, 26, 0.38);
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }

    .ws8-shutter-bay {
      position: relative;
      min-height: 56px;
      border-radius: 10px;
      overflow: hidden;
      background: #552B17;
      display: flex;
      align-items: stretch;
      justify-content: stretch;
    }

    /* Warm Broadcast Cream (#FFF6E3) Backlit Acrylite Clue Plaque */
    .ws8-shutter-plaque {
      position: relative;
      width: 100%;
      min-height: 56px;
      padding: 8px 9px 7px 9px;
      border-radius: 10px;
      background:
        repeating-linear-gradient(
          0deg,
          rgba(148, 112, 54, 0.025) 0px,
          rgba(148, 112, 54, 0.025) 1px,
          transparent 1px,
          transparent 4px
        ),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 72%, #F1DFBE 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 0 -1.5px 0 rgba(186, 154, 98, 0.55);
      color: #141B29;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
    }

    .ws8-shutter-plaque.is-fresh-bloom {
      animation: ws8CreamBloomIn 0.36s ease-out both;
    }

    /* Retracted Painted Louver Lip tucked at top of open window */
    .ws8-retracted-lip {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--shutter-lip-hex, #008B94);
      box-shadow: 0 1px 2px rgba(20, 27, 41, 0.25);
      pointer-events: none;
    }

    .ws8-shutter-clue-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
    }

    .ws8-shutter-clue-tag {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 4px;
      background: linear-gradient(180deg, #008B94 0%, #006E78 100%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
      color: #FFFDF7;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.1;
    }

    .ws8-shutter-inline-idx {
      display: none;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      color: #006E78;
      margin-right: 4px;
    }

    @media (max-height: 700px) and (orientation: portrait),
           (max-height: 500px) and (orientation: landscape) {
      .ws8-shutter-inline-idx {
        display: inline;
      }
    }

    .ws8-shutter-clue-copy {
      font-family: var(--ws8-sans);
      font-size: 15px;
      font-weight: 700;
      line-height: 1.22;
      color: #141B29;
      white-space: normal;
      overflow-wrap: break-word;
      word-break: normal;
      hyphens: none;
    }

    /* Colorful 1966 Laugh-In Painted Motorized Louver Door Button */
    .ws8-louver-door {
      position: relative;
      z-index: 2;
      width: 100%;
      min-height: 56px;
      padding: 6px 8px 11px 8px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      text-align: center;
      transform-origin: top center;
      transition: filter 0.12s ease, transform 0.12s ease;
    }

    /* Horizontal Motorized Louver Slat Grooves */
    .ws8-louver-door::before {
      content: '';
      position: absolute;
      inset: 4px 7px 11px 7px;
      border-radius: 6px;
      background: repeating-linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.16) 0px,
        rgba(255, 255, 255, 0.16) 2px,
        transparent 2px,
        transparent 6px,
        rgba(8, 18, 32, 0.16) 6px,
        rgba(8, 18, 32, 0.16) 8px
      );
      pointer-events: none;
    }

    /* Left Brass Barrel Hinge Pins on Unopened Studio Doors */
    .ws8-louver-hinges {
      position: absolute;
      left: 3px;
      top: 8px;
      bottom: 10px;
      width: 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: none;
      z-index: 2;
    }

    .ws8-louver-hinges::before,
    .ws8-louver-hinges::after {
      content: '';
      display: block;
      width: 4px;
      height: 10px;
      border-radius: 2px;
      background: linear-gradient(90deg, #FFF3B0 0%, #D99B1E 60%, #7D5200 100%);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
    }

    /* 3D Sculpted Spun-Brass Pull Handle at Bottom Center */
    .ws8-louver-door::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 34px;
      height: 6px;
      border-radius: 999px;
      background: linear-gradient(180deg, #FFF6C4 0%, #F2A922 55%, #9E6200 100%);
      box-shadow:
        0 0 0 1.2px rgba(20, 27, 41, 0.58),
        0 2px 3px rgba(0, 0, 0, 0.48);
      pointer-events: none;
    }

    .ws8-louver-door[data-tone="teal"] {
      background: linear-gradient(180deg, #00B4C0 0%, #008B94 65%, #00666E 100%);
      color: #FFFDF7;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.42),
        inset 0 0 0 1.5px rgba(255, 228, 132, 0.55),
        0 3px 0 #004A50;
    }

    .ws8-louver-door[data-tone="gold"] {
      background: linear-gradient(180deg, #FFD25A 0%, #F2A922 65%, #C98208 100%);
      color: #141B29;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.62),
        inset 0 0 0 1.5px rgba(20, 27, 41, 0.28),
        0 3px 0 #8F5900;
    }

    .ws8-louver-door[data-tone="cerise"] {
      background: linear-gradient(180deg, #F55391 0%, #E6397A 65%, #B31E57 100%);
      color: #FFFDF7;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.42),
        inset 0 0 0 1.5px rgba(255, 228, 132, 0.52),
        0 3px 0 #7D113B;
    }

    .ws8-louver-door[data-next="true"] {
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.68),
        0 0 0 2px #FFD166,
        0 3px 10px rgba(255, 209, 102, 0.48);
    }

    .ws8-louver-door:hover:not(:disabled) {
      filter: brightness(1.06);
      transform: translateY(-1px);
    }

    .ws8-louver-door:active:not(:disabled) {
      transform: translateY(1px);
    }

    .ws8-louver-door.is-retracting {
      position: absolute;
      inset: 0;
      pointer-events: none;
      animation: ws8LouverSlideUp 0.26s cubic-bezier(0.22, 1.12, 0.36, 1) forwards;
    }

    .ws8-louver-title {
      position: relative;
      z-index: 1;
      font-family: var(--ws8-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      line-height: 1.1;
    }

    .ws8-louver-sub {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      padding: 1px 7px;
      border-radius: 999px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F5ECD8 100%);
      box-shadow:
        inset 0 1px 0 #FFFFFF,
        0 0 0 1.2px rgba(142, 92, 14, 0.65),
        0 1px 3px rgba(32, 16, 6, 0.25);
      color: #141B29;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.03em;
      line-height: 1.15;
    }

    .ws8-peek-shutter-icon {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 19px;
      height: 19px;
    }

    /* Dedicated Peek Next Shutter Studio Lever Bar (>= 48x48px guaranteed at all DPIs) */
    .ws8-peek-shutter-btn {
      width: 100%;
      min-height: 50px;
      padding: 6px 12px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(180deg, #FF8354 0%, #FF6B35 58%, #D94B1A 100%);
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.5),
        inset 0 0 0 1.5px rgba(255, 209, 102, 0.62),
        0 3.5px 0 #962E0A,
        0 6px 14px rgba(6, 16, 30, 0.34);
      color: #FFFDF7;
      font-family: var(--ws8-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.15;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      text-align: center;
      transition: transform 0.1s ease, filter 0.12s ease, opacity 0.14s ease;
    }

    .ws8-peek-shutter-btn:hover:not(:disabled) {
      filter: brightness(1.06);
      transform: translateY(-1px);
    }

    .ws8-peek-shutter-btn:active:not(:disabled) {
      transform: translateY(2px);
    }

    .ws8-peek-shutter-btn[data-all-open="true"] {
      display: none;
    }

    /* ========================================================================
       3. 4 CRISP PUSH-BUTTON CHOICE PADS (A / B / C / D) + 2-BEAT LOCK-IN
       ======================================================================== */
    .ws8-shutter-choices-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
      width: 100%;
      min-width: 0;
      align-content: stretch;
    }

    .ws8-choice-pad {
      --ws8-pad-accent: #008B94;
      position: relative;
      min-height: 52px;
      padding: 6px 9px 6px 8px;
      border: none;
      border-radius: 12px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(255, 255, 255, 0) 45%),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 68%, #EEDBB8 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 5px 0 0 var(--ws8-pad-accent),
        0 3.5px 0 #B89D6E,
        0 6px 14px rgba(5, 14, 26, 0.3);
      color: #141B29;
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 7px;
      min-width: 0;
      transition: transform 0.1s ease, box-shadow 0.12s ease, background 0.12s ease, opacity 0.14s ease;
    }

    .ws8-choice-pad[data-pad-tone="0"] { --ws8-pad-accent: #008B94; }
    .ws8-choice-pad[data-pad-tone="1"] { --ws8-pad-accent: #F2A922; }
    .ws8-choice-pad[data-pad-tone="2"] { --ws8-pad-accent: #1746A2; }
    .ws8-choice-pad[data-pad-tone="3"] { --ws8-pad-accent: #E6397A; }

    .ws8-choice-pad:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .ws8-choice-pad:active:not(:disabled) {
      transform: translateY(2px);
    }

    .ws8-pad-medallion {
      flex: 0 0 28px;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--ws8-pad-accent);
      color: #FFFDF7;
      font-family: var(--ws8-caps);
      font-size: 15px;
      font-weight: 900;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1.5px 3px rgba(10, 20, 34, 0.28);
    }

    .ws8-choice-pad[data-pad-tone="1"] .ws8-pad-medallion {
      color: #141B29;
    }

    .ws8-pad-body {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ws8-pad-inline-letter {
      display: none;
      font-family: var(--ws8-caps);
      font-weight: 900;
      color: var(--ws8-pad-accent);
      margin-right: 4px;
    }

    .ws8-choice-pad[data-pad-tone="1"] .ws8-pad-inline-letter {
      color: #B87400;
    }

    .ws8-pad-label {
      font-family: var(--ws8-sans);
      font-size: 15px;
      font-weight: 700;
      line-height: 1.2;
      color: #141B29;
      white-space: normal;
      overflow-wrap: normal;
      word-break: normal;
      hyphens: none;
    }

    .ws8-choice-pad[data-long-token="true"] .ws8-pad-label {
      overflow-wrap: break-word;
      letter-spacing: -0.02em;
    }

    .ws8-pad-tail {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* High-Contrast Badge Boost */
    .ws8-shutter-deluxe-root[data-high-contrast="true"] .ws8-choice-pad,
    .ws8-shutter-deluxe-root[data-high-contrast="true"] .ws8-shutter-plaque {
      outline: 2px solid #141B29;
      outline-offset: -2px;
    }

    /* Diegetic Stamps & 50/50 Cut + Solari Poll Bars */
    .ws8-meta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
    }

    .ws8-meta-row:empty {
      display: none;
    }

    .ws8-stamp-void {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 4px;
      background: #FDE8E8;
      color: #B51722;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.1;
      white-space: nowrap;
      box-shadow: inset 0 0 0 1.6px #B51722;
    }

    .ws8-stamp-fifty {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 4px;
      background: linear-gradient(180deg, #6E3B23 0%, #4E2714 100%);
      color: #FFE484;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.1;
      white-space: nowrap;
      box-shadow: inset 0 0 0 1.5px #FFD166;
      animation: ws8BadgePop 0.2s ease-out both;
    }

    .ws8-canary-tick {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1px 6px;
      border-radius: 4px;
      background: #E0F4FF;
      color: #005A9C;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 800;
      line-height: 1.1;
      white-space: nowrap;
      box-shadow: inset 0 0 0 1.5px #0077B6;
    }

    .ws8-uv-poison {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border-radius: 4px;
      background: #F1E6FF;
      color: #5B189A;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 800;
      line-height: 1.1;
      white-space: nowrap;
      box-shadow: inset 0 0 0 1.5px #7B2CBF;
    }

    .ws8-choice-pad.is-fifty-cut {
      opacity: 0.42 !important;
      filter: saturate(0.24);
      pointer-events: none !important;
      cursor: not-allowed !important;
    }

    .ws8-choice-pad.is-fifty-cut .ws8-pad-label {
      text-decoration: line-through;
      text-decoration-thickness: 2px;
      text-decoration-color: #B51722;
    }

    .ws8-poll-slot {
      display: none;
      margin-top: 2px;
      width: 100%;
    }

    .ws8-poll-slot.is-visible {
      display: block;
    }

    .ws8-poll-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      width: 100%;
      padding: 2px 5px;
      border-radius: 6px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F3E6CA 100%);
      box-shadow: inset 0 0 0 1.3px #C8A252;
    }

    .ws8-poll-badge[data-leader="true"] {
      box-shadow: inset 0 0 0 1.6px #D9860B, 0 0 8px rgba(242, 169, 34, 0.35);
    }

    .ws8-poll-track {
      flex: 1 1 auto;
      min-width: 22px;
      height: 7px;
      border-radius: 999px;
      background: #E2D3B3;
      overflow: hidden;
    }

    .ws8-poll-fill {
      display: block;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #008B94 0%, #00B4C0 100%);
      transform-origin: left center;
      animation: ws8PollBarGrow 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .ws8-poll-badge[data-leader="true"] .ws8-poll-fill {
      background: linear-gradient(90deg, #D9860B 0%, #F2A922 100%);
    }

    .ws8-poll-pct {
      flex: 0 0 auto;
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      color: #141B29;
      line-height: 1;
      white-space: nowrap;
    }

    .ws8-poll-badge[data-leader="true"] .ws8-poll-pct {
      color: #8A4E00;
    }

    /* 2-Beat Studio Lock-In & True-Answer Tally States */
    .ws8-shutter-deluxe-root.is-console-locked button {
      pointer-events: none;
    }

    .ws8-shutter-deluxe-root.is-console-locked .ws8-choice-pad:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong) {
      opacity: 0.6;
    }

    .ws8-choice-pad.is-amber-lock {
      transform: translateY(2px);
      background: radial-gradient(circle at 50% 45%, #FFFDF7 0%, #FFF0A8 56%, #F7B728 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 1px 0 #A86B00,
        0 0 0 3px #FFD166,
        0 0 24px rgba(255, 209, 102, 0.9) !important;
    }

    .ws8-choice-pad.is-clutch-lock {
      animation: ws8ClutchPulse 0.28s ease-in-out infinite alternate !important;
    }

    .ws8-choice-pad.is-reveal-correct {
      opacity: 1 !important;
      filter: none !important;
      transform: translateY(-1px);
      background: linear-gradient(180deg, #E8FFF1 0%, #B8F7D2 62%, #7CEBA8 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 #0F9D58,
        0 3px 0 #0B7A42,
        0 0 0 3px #22C55E,
        0 0 26px rgba(34, 197, 94, 0.88) !important;
    }

    .ws8-choice-pad.is-reveal-wrong {
      opacity: 1 !important;
      transform: translateY(2px);
      background: linear-gradient(180deg, #FFF0F0 0%, #FFD0CE 62%, #FCA5A5 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 #C81E1E,
        0 2px 0 #991B1B,
        0 0 0 3px #EF4444,
        0 0 22px rgba(239, 68, 68, 0.8) !important;
    }

    .ws8-lock-badge {
      position: absolute;
      top: 4px;
      right: 6px;
      z-index: 3;
      padding: 2px 7px;
      border-radius: 999px;
      background: linear-gradient(180deg, #7A3E18 0%, #52260C 100%);
      color: #FFF3B0;
      box-shadow: 0 0 0 1.8px #FFD166, 0 2px 8px rgba(48, 22, 6, 0.38);
      font-family: var(--ws8-caps);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.05;
      white-space: nowrap;
      animation: ws8BadgePop 0.16s ease-out both;
    }

    .ws8-tally-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 26px;
      height: 26px;
      padding: 0 6px;
      border-radius: 999px;
      font-family: var(--ws8-caps);
      font-size: 14.5px;
      font-weight: 900;
      line-height: 1;
      color: #FFFFFF;
      animation: ws8BadgePop 0.16s ease-out both;
    }

    .ws8-tally-badge.is-correct {
      background: #0F8A49;
      box-shadow: 0 0 0 2px #FFFFFF, 0 0 12px rgba(34, 197, 94, 0.8);
    }

    .ws8-tally-badge.is-wrong {
      background: #C81E1E;
      box-shadow: 0 0 0 2px #FFFFFF, 0 0 12px rgba(239, 68, 68, 0.78);
    }

    /* ========================================================================
       4. WIDE CONTAINER & LANDSCAPE 2-COLUMN SPLIT:
          Left Column = 4 Motorized Shutters + Peek Lever
          Right Column = 2x2 Choice Pads (A / B / C / D)
       ======================================================================== */
    @container ws8shutter (min-width: 560px) {
      .ws8-shutter-deluxe-body {
        display: grid;
        grid-template-columns: minmax(0, 1.12fr) minmax(0, 1fr);
        gap: 10px;
        align-items: stretch;
      }

      .ws8-shutter-choices-grid {
        align-content: center;
      }
    }

    /* Compact Mobile Portrait (390x660 / <= 700px height): Zero Scroll, >= 48px Targets! */
    @media (max-height: 700px) and (orientation: portrait) {
      .ws7-question-chassis:has(.ws8-shutter-deluxe-root) .ws7-clue-body {
        padding: 6px 12px 5px 12px;
      }
      .ws7-question-chassis:has(.ws8-shutter-deluxe-root) .ws7-toy-bay {
        padding: 5px 9px 7px 9px;
      }
      .ws8-shutter-deluxe-root {
        gap: 4px;
      }
      .ws8-shutter-marquee {
        padding: 3px 6px;
        gap: 2px;
      }
      .ws8-ladder-tube {
        min-height: 28px;
        padding: 2px 3px;
      }
      .ws8-shutter-deluxe-body {
        gap: 4px;
      }
      .ws8-shutter-left-col {
        gap: 4px;
      }
      .ws8-walnut-cabinet {
        padding: 4px;
        gap: 4px;
      }
      .ws8-shutter-bay,
      .ws8-shutter-plaque {
        min-height: 48px;
      }
      .ws8-louver-door {
        min-height: 50px;
      }
      .ws8-shutter-plaque {
        padding: 5px 7px 4px 7px;
      }
      .ws8-shutter-clue-head {
        display: none;
      }
      .ws8-shutter-clue-copy {
        font-size: 15px;
        line-height: 1.15;
      }
      .ws8-peek-shutter-btn {
        min-height: 50px;
        padding: 5px 10px;
      }
      .ws8-shutter-choices-grid {
        gap: 5px;
      }
      .ws8-choice-pad {
        min-height: 50px;
        padding: 5px 7px;
        gap: 6px;
      }
      .ws8-pad-medallion {
        flex: 0 0 25px;
        width: 25px;
        height: 25px;
        font-size: 14px;
      }
      .ws8-pad-label {
        font-size: 15px;
        line-height: 1.15;
      }
    }

    /* Compact Mobile Landscape (844x390 / <= 500px height):
       Enforces 2-Column Split (4 Shutters Left | 2x2 Choice Pads Right), 0px Overflow, >= 48px Targets! */
    @media (max-height: 500px) and (orientation: landscape) {
      .ws7-question-chassis:has(.ws8-shutter-deluxe-root) {
        grid-template-columns: minmax(0, 32%) minmax(0, 68%);
      }
      .ws7-question-chassis:has(.ws8-shutter-deluxe-root) .ws7-toy-bay {
        padding: 5px 8px;
      }
      .ws8-shutter-deluxe-root {
        gap: 4px;
      }
      .ws8-shutter-marquee {
        padding: 3px 6px;
        gap: 2px;
      }
      .ws8-ladder-tube {
        min-height: 27px;
        padding: 2px 3px;
      }
      .ws8-ladder-tube-mult {
        font-size: 13.5px;
      }
      .ws8-ladder-tube-sub {
        font-size: 13px;
      }
      .ws8-shutter-deluxe-body {
        display: grid;
        grid-template-columns: minmax(0, 1.04fr) minmax(0, 1fr);
        gap: 7px;
        align-items: center;
      }
      .ws8-shutter-left-col {
        gap: 4px;
      }
      .ws8-walnut-cabinet {
        padding: 4px;
        gap: 4px;
      }
      .ws8-shutter-bay,
      .ws8-shutter-plaque {
        min-height: 48px;
      }
      .ws8-louver-door {
        min-height: 50px;
      }
      .ws8-shutter-plaque {
        padding: 5px 6px 4px 6px;
      }
      .ws8-shutter-clue-head {
        display: none;
      }
      .ws8-shutter-clue-copy {
        font-size: 15px;
        line-height: 1.13;
      }
      .ws8-peek-shutter-btn {
        min-height: 50px;
        padding: 4px 8px;
        font-size: 13.5px;
      }
      .ws8-shutter-choices-grid {
        gap: 5px;
      }
      .ws8-choice-pad {
        min-height: 50px;
        padding: 4px 7px 4px 8px;
        gap: 4px;
      }
      .ws8-pad-medallion {
        display: none;
      }
      .ws8-pad-inline-letter {
        display: inline;
      }
      .ws8-pad-label {
        font-size: 14.5px;
        line-height: 1.15;
      }
    }
  `;
}

function releaseFourShutterDeluxeStylesV8(): void {
  activeStyleMountCountV8 = Math.max(0, activeStyleMountCountV8 - 1);
  if (activeStyleMountCountV8 === 0 && typeof document !== 'undefined') {
    document.getElementById(STYLES_ID_V8)?.remove();
  }
}

function escHtmlV8(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface FourShutterMountOptionsV8 extends TactileContraptionContextV7 {
  /** Optional direct 4-clue override array or ShutterReelPayloadV7 object. */
  readonly shutters?: readonly string[] | ShutterReelPayloadV7;
  /** Optional progressive clues alias supported for mockup/test harnesses. */
  readonly clues?: readonly string[];
  /** Optional nested shutterReel payload alias. */
  readonly shutterReel?: {
    readonly clues?: readonly string[];
    readonly shutters?: readonly string[];
  };
}

const SHUTTER_KEY_LOUVER_ICON_SVG_V8 = `<span class="ws8-peek-shutter-icon" aria-hidden="true"><svg width="19" height="19" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="2.5" width="11" height="17" rx="2.2" fill="#FFF6E3" stroke="#6E3B23" stroke-width="1.5"/><line x1="3.5" y1="6.5" x2="10.5" y2="6.5" stroke="#B87400" stroke-width="1.6" stroke-linecap="round"/><line x1="3.5" y1="10.5" x2="10.5" y2="10.5" stroke="#008B94" stroke-width="1.6" stroke-linecap="round"/><line x1="3.5" y1="14.5" x2="10.5" y2="14.5" stroke="#E6397A" stroke-width="1.6" stroke-linecap="round"/><circle cx="16.5" cy="7.5" r="3.4" fill="#FFE694" stroke="#6E3B23" stroke-width="1.5"/><circle cx="16.5" cy="7.5" r="1.15" fill="#6E3B23"/><path d="M16.5 10.9V18.5M16.5 15.2H19.4M16.5 17.8H18.8" stroke="#FFE694" stroke-width="2" stroke-linecap="round"/><path d="M16.5 10.9V18.5M16.5 15.2H19.4M16.5 17.8H18.8" stroke="#6E3B23" stroke-width="1.1" stroke-linecap="round"/></svg></span>`;

function extractCleanShutterStringsV8(candidate: unknown): string[] | null {
  if (!Array.isArray(candidate)) return null;
  const cleaned = candidate
    .filter((item): item is string => typeof item === 'string')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return cleaned.length > 0 ? cleaned : null;
}

function isPlainRecordV8(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * Resolves the 4 progressive lateral-to-clincher shutter clues from `ClueRecordV7`:
 *  1. `clue.shutters?.shutters` (canonical `contracts_v7.ts` `ShutterReelPayloadV7`)
 *  2. Direct `string[]` on `clue.shutters`
 *  3. Legacy/harness aliases `(clue as any).shutterReel?.clues` / `.shutters` / `.shutterClues` / `.clues`
 *  4. Direct `string[]` or `{ shutters, clues, shutterReel }` passed in `ctxOrClues`
 * Always prioritizes real progressive lateral clues over generic category hints.
 */
export function resolveShuttersPayloadV8(
  clue: ClueRecordV7,
  ctxOrClues?: FourShutterMountOptionsV8 | readonly string[],
): ShutterReelPayloadV7 {
  const clueAny = clue as unknown as Record<string, unknown>;
  const clueShuttersObj = isPlainRecordV8(clueAny.shutters) ? clueAny.shutters : null;
  const clueShutterReelObj = isPlainRecordV8(clueAny.shutterReel) ? clueAny.shutterReel : null;

  const ctxIsArray = Array.isArray(ctxOrClues);
  const ctxObj = isPlainRecordV8(ctxOrClues) ? ctxOrClues : null;
  const ctxShuttersObj = isPlainRecordV8(ctxObj?.shutters) ? ctxObj.shutters : null;
  const ctxShutterReelObj = isPlainRecordV8(ctxObj?.shutterReel) ? ctxObj.shutterReel : null;

  const candidates: unknown[] = [
    // 1. Canonical ClueRecordV7 `clue.shutters?.shutters` FIRST:
    clue.shutters?.shutters,
    clueShuttersObj?.shutters,
    // 2. Direct string[] on `clue.shutters`:
    clueAny.shutters,
    // 3. `(clue as any).shutterReel?.clues` / `.shutters` / array:
    clueShutterReelObj?.clues,
    clueShutterReelObj?.shutters,
    clueAny.shutterReel,
    // 4. Additional clue-level progressive array aliases:
    clueAny.shutterClues,
    clueAny.progressiveClues,
    clueAny.clues,
    // 5. Direct `string[]` or options object passed to mountFourShutterLadderDeluxeV8:
    ctxIsArray ? ctxOrClues : undefined,
    ctxShuttersObj?.shutters,
    ctxObj?.shutters,
    ctxShutterReelObj?.clues,
    ctxShutterReelObj?.shutters,
    ctxObj?.clues,
    ctxObj?.shutterClues,
  ];

  for (const cand of candidates) {
    const extracted = extractCleanShutterStringsV8(cand);
    if (extracted) {
      if (extracted.length >= 4) {
        return {
          shutters: [extracted[0], extracted[1], extracted[2], extracted[3]],
        };
      }
      const padded = [...extracted];
      while (padded.length < 3) {
        padded.push(clue.ahaFactoid?.trim() || clue.stem);
      }
      padded.push(clue.stem);
      return {
        shutters: [padded[0], padded[1], padded[2], padded[3]],
      };
    }
  }

  const friendlyCat = clue.category.replace(/_/g, ' ');
  return {
    shutters: [
      `Opening Lead (${friendlyCat}): ${clue.stem}`,
      `Second Look: Narrow the four ${friendlyCat.toLowerCase()} contenders on the studio desk.`,
      clue.ahaFactoid?.trim() || `Third Lead: Spot the clincher hidden in "${clue.stem}"`,
      clue.stem,
    ],
  };
}

/**
 * Computes the active payout multiplier from `SHUTTER_REEL_MULTIPLIER_LADDER_V8`
 * (`[2.0, 1.6, 1.3, 1.0]`) given how many paid peeks the contestant has taken.
 * Note: `MONOLOGUE_WRITER` starts with 2 shutters open at `paidPeeks = 0` (`2.0×`)!
 */
export function computeActiveShutterMultiplierV8(paidPeeks: number): number {
  const clampedStep = Math.max(
    0,
    Math.min(SHUTTER_REEL_MULTIPLIER_LADDER_V8.length - 1, paidPeeks),
  );
  return SHUTTER_REEL_MULTIPLIER_LADDER_V8[clampedStep];
}

/**
 * Formats a celebratory 1966 broadcast solve summary for `ToyResolutionV7` / `ShutterLadderResolutionV8`.
 */
export function formatShutterSolveSummaryV8(opts: {
  isCorrect: boolean;
  activeMult: number;
  openCount: 1 | 2 | 3 | 4;
  hasWriterPerk: boolean;
}): string {
  const multStr = `${opts.activeMult.toFixed(1)}×`;
  if (!opts.isCorrect) {
    return `0.0× SHUTTER-${opts.openCount} MISS`;
  }
  if (opts.openCount === 1) {
    return `${multStr} SHUTTER-1 GENIUS SOLVE!`;
  }
  if (opts.openCount === 2 && opts.hasWriterPerk && opts.activeMult >= 1.95) {
    return `${multStr} WRITER-PERK SHUTTER-2 GENIUS SOLVE!`;
  }
  if (opts.openCount === 2) {
    return `${multStr} SHUTTER-2 SHARP SOLVE!`;
  }
  if (opts.openCount === 3) {
    return `${multStr} SHUTTER-3 CLUTCH SOLVE!`;
  }
  return `${multStr} ALL-4 SHUTTER SOLVE!`;
}

function pickTwoWrongChoiceIndicesV8(
  correctIdx: number,
  clue: ClueRecordV7,
  alreadyExcluded: ReadonlySet<number>,
): number[] {
  const candidates: number[] = [];
  const preferredOrder = [
    clue.waiverPruneIdx,
    clue.anchorIdx,
    (correctIdx + 1) % 4,
    (correctIdx + 2) % 4,
    (correctIdx + 3) % 4,
    clue.poisonedFixIdx,
  ];
  for (const idx of preferredOrder) {
    if (
      idx >= 0 &&
      idx < 4 &&
      idx !== correctIdx &&
      !alreadyExcluded.has(idx) &&
      !candidates.includes(idx)
    ) {
      candidates.push(idx);
      if (candidates.length === 2) break;
    }
  }
  return candidates;
}

function normalizeLivePollPercentagesV8(
  rawPercentages: readonly number[],
  liveIndices: readonly number[],
): Map<number, number> {
  const out = new Map<number, number>();
  if (liveIndices.length === 0) return out;

  const rawByLive = liveIndices.map((choiceIdx, pos) => {
    const val =
      rawPercentages.length === liveIndices.length && liveIndices.length < 4
        ? rawPercentages[pos]
        : rawPercentages[choiceIdx];
    return typeof val === 'number' && Number.isFinite(val) ? Math.max(0, val) : 0;
  });

  const sum = rawByLive.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    const equal = Math.floor(100 / liveIndices.length);
    let rem = 100 - equal * liveIndices.length;
    liveIndices.forEach((idx) => {
      out.set(idx, equal + (rem > 0 ? 1 : 0));
      if (rem > 0) rem -= 1;
    });
    return out;
  }

  let running = 0;
  let maxPos = 0;
  const rounded = rawByLive.map((v, pos) => {
    const pct = Math.round((v / sum) * 100);
    running += pct;
    if (v > rawByLive[maxPos]) maxPos = pos;
    return pct;
  });
  if (running !== 100) {
    rounded[maxPos] = Math.max(0, rounded[maxPos] + (100 - running));
  }
  liveIndices.forEach((idx, pos) => {
    out.set(idx, rounded[pos]);
  });
  return out;
}

function renderDiegeticChoiceOverlaysHtmlV8(
  clue: ClueRecordV7,
  choiceIdx: number,
  context: TactileContraptionContextV7,
): string {
  const badges: string[] = [];

  if (context.pruneActive && choiceIdx === clue.waiverPruneIdx) {
    const isMythCard =
      Boolean(clue.isKlaxonMyth) ||
      context.cardStyle === 'SPOT_THE_MYTH' ||
      clue.cardStyle === 'SPOT_THE_MYTH';
    badges.push(`<span class="ws8-stamp-void">${isMythCard ? 'ELIMINATED' : 'VOID'}</span>`);
  }

  if (typeof context.canaryTickIdx === 'number' && choiceIdx === context.canaryTickIdx) {
    badges.push(
      `<span class="ws8-canary-tick"><svg width="12" height="11" viewBox="0 0 14 12" fill="none" aria-hidden="true"><path d="M1.5 6.5L5.2 10L12.5 1.8" stroke="#005A9C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>CANARY TIP</span>`,
    );
  }

  if (context.uvLoupeActive && choiceIdx === clue.poisonedFixIdx) {
    badges.push(`<span class="ws8-uv-poison">RIGGED TRAP</span>`);
  }

  return `<div class="ws8-meta-row">${badges.join('')}</div>`;
}

/**
 * Mounts the Deluxe 1966 Pop-Art 4-Shutter *Only Connect* Multiplier Wall (`TOY_14_FOUR_SHUTTER_REEL`).
 */
export function mountFourShutterLadderDeluxeV8(
  container: HTMLElement,
  clue: ClueRecordV7,
  onResolve: (res: ToyResolutionV7) => void,
  ctx?: FourShutterMountOptionsV8 | readonly string[],
): MountedTactileContraptionV7 {
  const context: TactileContraptionContextV7 =
    ctx && !Array.isArray(ctx) ? (ctx as TactileContraptionContextV7) : {};
  acquireFourShutterDeluxeStylesV8();
  container.innerHTML = '';

  const resolvedCardStyle: QuestionCardStyleV7 = context.cardStyle ?? clue.cardStyle ?? 'CLASSIC_CUE';
  const isClutch = Boolean(context.isClutchMoment);
  const reducedMotion = Boolean(context.reducedMotion);
  const hasWriterPerk = context.dayJob === 'MONOLOGUE_WRITER';
  const payload = resolveShuttersPayloadV8(clue, ctx);

  let openCount: 1 | 2 | 3 | 4 = hasWriterPerk ? 2 : 1;
  let paidPeeks = 0;
  let resolved = false;
  let locking = false;
  let disposed = false;
  let fiftyFiftyPruned: readonly number[] | null = null;
  let lastPollPercentages: readonly number[] | null = null;

  const timers: number[] = [];
  const cleanups: Array<() => void> = [];
  const mountedAtMs = typeof performance !== 'undefined' ? performance.now() : 0;
  let sawFreshPointerDown = false;

  const root = document.createElement('div');
  root.className = 'ws8-shutter-deluxe-root';
  root.dataset.toyId = 'TOY_14_FOUR_SHUTTER_REEL';
  root.dataset.cardStyle = resolvedCardStyle;
  root.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
  root.dataset.highContrast = context.highContrastBadges ? 'true' : 'false';
  container.appendChild(root);

  // Physical pointer-bleed protection (blocks trailing 3D board tile taps while
  // allowing keyboard Enter/Space and programmatic `.click()` where `ev.detail === 0`).
  const onRootPointerDownCapture = (ev: PointerEvent): void => {
    const elapsed = typeof performance !== 'undefined' ? performance.now() - mountedAtMs : 999;
    if (elapsed < 180) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      return;
    }
    sawFreshPointerDown = true;
  };
  const onRootClickCapture = (ev: MouseEvent): void => {
    const elapsed = typeof performance !== 'undefined' ? performance.now() - mountedAtMs : 999;
    if (ev.detail > 0 && (elapsed < 180 || !sawFreshPointerDown)) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
    }
  };
  root.addEventListener('pointerdown', onRootPointerDownCapture, true);
  root.addEventListener('click', onRootClickCapture, true);
  cleanups.push(() => {
    root.removeEventListener('pointerdown', onRootPointerDownCapture, true);
    root.removeEventListener('click', onRootClickCapture, true);
  });

  const scheduleReveal = (fn: () => void, ms: number, reducedFloorMs = 120): void => {
    const delay = reducedMotion ? Math.min(ms, reducedFloorMs) : ms;
    const id = window.setTimeout(() => {
      if (!disposed) fn();
    }, delay);
    timers.push(id);
  };

  // --------------------------------------------------------------------------
  // 1. Live Multiplier Marquee Header (`2.0× -> 1.6× -> 1.3× -> 1.0×`)
  // --------------------------------------------------------------------------
  const marqueeEl = document.createElement('div');
  marqueeEl.className = 'ws8-shutter-marquee';
  marqueeEl.setAttribute('role', 'status');
  marqueeEl.setAttribute('aria-live', 'polite');

  const ladderRowEl = document.createElement('div');
  ladderRowEl.className = 'ws8-shutter-ladder-row';

  const tubeStepLabels = ['CLUE 1', 'CLUE 2', 'CLUE 3', 'ALL 4'] as const;
  const tubeEls: HTMLDivElement[] = [];

  SHUTTER_REEL_MULTIPLIER_LADDER_V8.forEach((multVal, stepIdx) => {
    if (stepIdx > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'ws8-ladder-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      ladderRowEl.appendChild(arrow);
    }
    const tube = document.createElement('div');
    tube.className = 'ws8-ladder-tube';
    tube.dataset.stepIdx = String(stepIdx);
    tube.innerHTML = `
      <span class="ws8-ladder-tube-mult">${multVal.toFixed(1)}×</span>
      <span class="ws8-ladder-tube-sub">${tubeStepLabels[stepIdx]}</span>
    `;
    tubeEls.push(tube);
    ladderRowEl.appendChild(tube);
  });
  marqueeEl.appendChild(ladderRowEl);

  let writerPerkBannerEl: HTMLDivElement | null = null;
  if (hasWriterPerk) {
    writerPerkBannerEl = document.createElement('div');
    writerPerkBannerEl.className = 'ws8-writer-perk-banner';
    writerPerkBannerEl.textContent = '★ WRITER PERK: 2 CLUES OPEN AT 2.0×!';
    marqueeEl.appendChild(writerPerkBannerEl);
  }

  root.appendChild(marqueeEl);

  // --------------------------------------------------------------------------
  // 2. Main Body: Left (4 Brass & Walnut Shutters + Peek Button) | Right (A-D)
  // --------------------------------------------------------------------------
  const bodyEl = document.createElement('div');
  bodyEl.className = 'ws8-shutter-deluxe-body';
  root.appendChild(bodyEl);

  const leftColEl = document.createElement('div');
  leftColEl.className = 'ws8-shutter-left-col';
  bodyEl.appendChild(leftColEl);

  const cabinetEl = document.createElement('div');
  cabinetEl.className = 'ws8-walnut-cabinet';
  leftColEl.appendChild(cabinetEl);

  const peekBtnEl = document.createElement('button');
  peekBtnEl.type = 'button';
  peekBtnEl.className = 'ws8-peek-shutter-btn';
  leftColEl.appendChild(peekBtnEl);

  const shutterBays: HTMLDivElement[] = [];

  const syncMarqueeAndPeekButton = (): void => {
    const activeStepIdx = Math.min(SHUTTER_REEL_MULTIPLIER_LADDER_V8.length - 1, paidPeeks);
    const activeMult = computeActiveShutterMultiplierV8(paidPeeks);

    tubeEls.forEach((tube, stepIdx) => {
      const multVal = SHUTTER_REEL_MULTIPLIER_LADDER_V8[stepIdx];
      const multEl = tube.querySelector('.ws8-ladder-tube-mult') as HTMLSpanElement;
      if (stepIdx === activeStepIdx) {
        tube.dataset.state = 'active';
        multEl.textContent = `★ ${multVal.toFixed(1)}×`;
      } else if (stepIdx < activeStepIdx) {
        tube.dataset.state = 'spent';
        multEl.textContent = `${multVal.toFixed(1)}×`;
      } else {
        tube.dataset.state = 'upcoming';
        multEl.textContent = `${multVal.toFixed(1)}×`;
      }
    });

    if (writerPerkBannerEl) {
      writerPerkBannerEl.textContent =
        paidPeeks === 0
          ? '★ WRITER PERK: 2 CLUES OPEN AT 2.0×!'
          : `★ WRITER PERK ACTIVE · ${openCount} CLUES OPEN AT ${activeMult.toFixed(1)}×!`;
    }

    if (openCount >= 4) {
      peekBtnEl.disabled = true;
      peekBtnEl.dataset.allOpen = 'true';
      peekBtnEl.setAttribute('aria-hidden', 'true');
      peekBtnEl.textContent = `ALL 4 SHUTTERS OPEN (${activeMult.toFixed(1)}×)`;
    } else {
      const nextMult = computeActiveShutterMultiplierV8(paidPeeks + 1);
      peekBtnEl.disabled = false;
      peekBtnEl.dataset.allOpen = 'false';
      peekBtnEl.removeAttribute('aria-hidden');
      peekBtnEl.innerHTML = `${SHUTTER_KEY_LOUVER_ICON_SVG_V8}<span>PEEK NEXT SHUTTER (DROPS TO ${nextMult.toFixed(1)}×)</span>`;
      peekBtnEl.setAttribute(
        'aria-label',
        `Peek Shutter ${openCount + 1}. Multiplier drops from ${activeMult.toFixed(1)}x to ${nextMult.toFixed(1)}x`,
      );
    }
  };

  const renderOpenPlaqueIntoBay = (sIdx: number, animateBloom: boolean): void => {
    const bay = shutterBays[sIdx];
    if (!bay) return;
    const spec = SHUTTER_DOOR_SPECS_V8[sIdx] ?? SHUTTER_DOOR_SPECS_V8[1];
    const existingPlaque = bay.querySelector('.ws8-shutter-plaque');
    if (existingPlaque) return;

    const plaque = document.createElement('div');
    plaque.className = `ws8-shutter-plaque${animateBloom && !reducedMotion ? ' is-fresh-bloom' : ''}`;
    plaque.style.setProperty('--shutter-lip-hex', spec.lipHex);
    plaque.innerHTML = `
      <span class="ws8-retracted-lip" aria-hidden="true"></span>
      <div class="ws8-shutter-clue-head">
        <span class="ws8-shutter-clue-tag">CLUE ${sIdx + 1}</span>
      </div>
      <div class="ws8-shutter-clue-copy"><span class="ws8-shutter-inline-idx">#${sIdx + 1}</span>${escHtmlV8(payload.shutters[sIdx] ?? '')}</div>
    `;
    bay.prepend(plaque);
  };

  const syncClosedDoorBadges = (): void => {
    shutterBays.forEach((bay, sIdx) => {
      const doorBtn = bay.querySelector<HTMLButtonElement>('.ws8-louver-door:not(.is-retracting)');
      if (!doorBtn) return;
      const isNext = sIdx === openCount;
      doorBtn.dataset.next = isNext ? 'true' : 'false';
      const subEl = doorBtn.querySelector('.ws8-louver-sub') as HTMLSpanElement | null;
      if (subEl) {
        if (isNext) {
          const nextMult = computeActiveShutterMultiplierV8(paidPeeks + 1);
          subEl.textContent = `PEEK · ${nextMult.toFixed(1)}×`;
        } else {
          const stepsAhead = sIdx - openCount + 1;
          const futureMult = computeActiveShutterMultiplierV8(paidPeeks + stepsAhead);
          subEl.textContent = `${futureMult.toFixed(1)}×`;
        }
      }
      const nextMultForAria = computeActiveShutterMultiplierV8(paidPeeks + 1);
      doorBtn.setAttribute(
        'aria-label',
        `Peek next shutter (Shutter ${openCount + 1}, drops to ${nextMultForAria.toFixed(1)}x)`,
      );
    });
  };

  const peekNextShutter = (): void => {
    if (resolved || locking || disposed || openCount >= 4) return;
    const newlyOpenedIdx = openCount;
    openCount = Math.min(4, openCount + 1) as 1 | 2 | 3 | 4;
    paidPeeks += 1;

    context.onTactileSfx?.('SHUTTER_CLACK');

    // Reveal the Warm Broadcast Cream clue plaque underneath, then retract the painted louver door!
    renderOpenPlaqueIntoBay(newlyOpenedIdx, true);
    const bay = shutterBays[newlyOpenedIdx];
    const doorBtn = bay?.querySelector<HTMLButtonElement>('.ws8-louver-door');
    if (doorBtn) {
      doorBtn.disabled = true;
      if (reducedMotion) {
        doorBtn.remove();
      } else {
        doorBtn.classList.add('is-retracting');
        const id = window.setTimeout(() => {
          if (!disposed) doorBtn.remove();
        }, 280);
        timers.push(id);
      }
    }

    syncClosedDoorBadges();
    syncMarqueeAndPeekButton();
  };

  // Mount the 4 physical shutter bays (only revealing clue copy for open shutters!)
  for (let sIdx = 0; sIdx < 4; sIdx++) {
    const bay = document.createElement('div');
    bay.className = 'ws8-shutter-bay';
    bay.dataset.shutterIdx = String(sIdx);
    shutterBays.push(bay);
    cabinetEl.appendChild(bay);

    if (sIdx < openCount) {
      renderOpenPlaqueIntoBay(sIdx, false);
    } else {
      const spec = SHUTTER_DOOR_SPECS_V8[sIdx] ?? SHUTTER_DOOR_SPECS_V8[1];
      const doorBtn = document.createElement('button');
      doorBtn.type = 'button';
      doorBtn.className = 'ws8-louver-door';
      doorBtn.dataset.tone = spec.tone;
      doorBtn.dataset.shutterDoorIdx = String(sIdx);
      doorBtn.innerHTML = `
        <span class="ws8-louver-hinges" aria-hidden="true"></span>
        <span class="ws8-louver-title">${spec.doorName}</span>
        <span class="ws8-louver-sub">PEEK</span>
      `;
      doorBtn.addEventListener('click', () => {
        peekNextShutter();
      });
      bay.appendChild(doorBtn);
    }
  }

  peekBtnEl.addEventListener('click', () => {
    peekNextShutter();
  });

  syncClosedDoorBadges();
  syncMarqueeAndPeekButton();

  // --------------------------------------------------------------------------
  // 3. 4 Crisp Push-Button Choice Pads (`A / B / C / D`) + 2-Beat Lock-In
  // --------------------------------------------------------------------------
  const choicesGridEl = document.createElement('div');
  choicesGridEl.className = 'ws8-shutter-choices-grid';
  bodyEl.appendChild(choicesGridEl);

  const cutChoiceIndices = new Set<number>();
  const padBtns: HTMLButtonElement[] = [];
  const padTails: HTMLSpanElement[] = [];
  const padPollSlots: HTMLDivElement[] = [];

  const emitResolutionOnce = (res: ShutterLadderResolutionV8): void => {
    if (resolved || disposed) return;
    resolved = true;
    onResolve(res);
  };

  const lockInChoice = (chosenIdx: 0 | 1 | 2 | 3): void => {
    if (resolved || locking || disposed || cutChoiceIndices.has(chosenIdx)) return;
    locking = true;
    root.classList.add('is-console-locked');

    const activeMult = computeActiveShutterMultiplierV8(paidPeeks);
    const isCorrect = chosenIdx === clue.answerIdx;
    const summaryText = formatShutterSolveSummaryV8({
      isCorrect,
      activeMult,
      openCount,
      hasWriterPerk,
    });
    const rawChoice = clue.choices[chosenIdx] ?? '';
    const resolution: ShutterLadderResolutionV8 = {
      isCorrect,
      accuracyRatio: isCorrect ? 1.0 : 0.0,
      chipMultiplier: isCorrect ? activeMult : 0,
      chosenSummary: isCorrect ? `${rawChoice} · ${summaryText}` : rawChoice,
      trueAnswerDisplay: clue.choices[clue.answerIdx],
      triggeredKlaxon: !isCorrect && Boolean(clue.isKlaxonMyth),
      fellForPoisonedFix: !isCorrect && chosenIdx === clue.poisonedFixIdx,
      summaryText,
      shutterSolvedAtCount: openCount,
      chosenChoiceIdx: chosenIdx,
    };

    const chosenPad = padBtns[chosenIdx];
    const correctPad = padBtns[clue.answerIdx] ?? null;
    const chosenTail = padTails[chosenIdx] ?? null;
    const correctTail = padTails[clue.answerIdx] ?? null;

    // Beat 1: Warm 2700K Studio Amber Lock-In + `LOCKED IN...` badge
    chosenPad.classList.add('is-amber-lock');
    if (isClutch && !reducedMotion) {
      chosenPad.classList.add('is-clutch-lock');
    }
    const lockBadge = document.createElement('span');
    lockBadge.className = 'ws8-lock-badge';
    lockBadge.textContent = 'LOCKED IN...';
    chosenPad.appendChild(lockBadge);

    context.onLockInStart?.(isClutch);
    context.onTactileSfx?.('THROW_SNAP');

    const dramaticClutch = isClutch && !context.turboMode && !reducedMotion;
    const beat1Ms = dramaticClutch ? 950 : isClutch ? 160 : 170;
    const beat2Ms = dramaticClutch ? 280 : isClutch ? 240 : 290;

    scheduleReveal(
      () => {
        if (disposed || resolved) return;
        chosenPad.classList.remove('is-amber-lock', 'is-clutch-lock');
        lockBadge.remove();

        const placeTallyBadge = (
          slot: HTMLSpanElement | null,
          kind: 'correct' | 'wrong',
          glyph: string,
        ): void => {
          if (!slot) return;
          slot.innerHTML = '';
          const badge = document.createElement('span');
          badge.className = `ws8-tally-badge ${kind === 'correct' ? 'is-correct' : 'is-wrong'}`;
          badge.textContent = glyph;
          slot.appendChild(badge);
        };

        // Beat 2: Radiant Emerald (`✓`) on true answer + Broadcast Vermilion (`✗`) on wrong pick
        if (isCorrect) {
          chosenPad.classList.add('is-reveal-correct');
          placeTallyBadge(chosenTail, 'correct', '✓');
        } else {
          chosenPad.classList.add('is-reveal-wrong');
          placeTallyBadge(chosenTail, 'wrong', '✗');
          if (correctPad && correctPad !== chosenPad) {
            correctPad.classList.add('is-reveal-correct');
            placeTallyBadge(correctTail, 'correct', '✓');
          }
        }

        context.onRevealFlash?.(isCorrect);

        scheduleReveal(
          () => {
            emitResolutionOnce(resolution);
          },
          beat2Ms,
          150,
        );
      },
      beat1Ms,
      isClutch ? 220 : 100,
    );
  };

  clue.choices.forEach((choiceText, idx) => {
    const choiceIdx = idx as 0 | 1 | 2 | 3;
    const letter = STUDIO_LETTERS_V8[choiceIdx];
    const padBtn = document.createElement('button');
    padBtn.type = 'button';
    padBtn.className = 'ws8-choice-pad';
    padBtn.dataset.choiceIdx = String(choiceIdx);
    padBtn.dataset.padTone = String(choiceIdx % 4);
    if (/\S{15,}/.test(choiceText)) {
      padBtn.dataset.longToken = 'true';
    }
    padBtn.setAttribute('aria-label', `Option ${letter}: ${choiceText}`);
    padBtn.innerHTML = `
      <span class="ws8-pad-medallion" aria-hidden="true">${letter}</span>
      <span class="ws8-pad-body">
        <span class="ws8-pad-label"><span class="ws8-pad-inline-letter" aria-hidden="true">${letter}.</span>${escHtmlV8(choiceText)}</span>
        ${renderDiegeticChoiceOverlaysHtmlV8(clue, choiceIdx, context)}
        <div class="ws8-poll-slot"></div>
      </span>
      <span class="ws8-pad-tail"></span>
    `;

    const tailEl = padBtn.querySelector('.ws8-pad-tail') as HTMLSpanElement;
    const pollSlot = padBtn.querySelector('.ws8-poll-slot') as HTMLDivElement;
    padBtns.push(padBtn);
    padTails.push(tailEl);
    padPollSlots.push(pollSlot);

    padBtn.addEventListener('pointerenter', (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !resolved && !locking && !disposed) {
        context.onTactileSfx?.('TICK');
      }
    });

    padBtn.addEventListener('click', () => {
      lockInChoice(choiceIdx);
    });

    choicesGridEl.appendChild(padBtn);
  });

  const renderPollBars = (percentages: readonly number[]): void => {
    const live = [0, 1, 2, 3].filter((i) => !cutChoiceIndices.has(i));
    const normalized = normalizeLivePollPercentagesV8(percentages, live);
    let maxPct = -1;
    normalized.forEach((v) => {
      if (v > maxPct) maxPct = v;
    });

    [0, 1, 2, 3].forEach((idx) => {
      const slot = padPollSlots[idx];
      if (!slot) return;
      if (cutChoiceIndices.has(idx)) {
        slot.classList.remove('is-visible');
        slot.innerHTML = '';
        return;
      }
      const pct = normalized.get(idx) ?? 0;
      const isLeader = pct === maxPct && maxPct > 0;
      slot.innerHTML = `
        <div class="ws8-poll-badge" data-leader="${isLeader ? 'true' : 'false'}">
          <span class="ws8-poll-track"><span class="ws8-poll-fill" style="width:${pct}%"></span></span>
          <span class="ws8-poll-pct">${isLeader ? '★ ' : ''}${pct}%</span>
        </div>
      `;
      slot.classList.add('is-visible');
    });
  };

  return {
    toyId: 'TOY_14_FOUR_SHUTTER_REEL',
    cardStyle: resolvedCardStyle,

    applyFiftyFiftyPrune(): readonly number[] {
      if (fiftyFiftyPruned !== null) return fiftyFiftyPruned;
      if (resolved || locking || disposed) return [];

      const toCut = pickTwoWrongChoiceIndicesV8(clue.answerIdx, clue, cutChoiceIndices);
      for (const idx of toCut) {
        cutChoiceIndices.add(idx);
        const btn = padBtns[idx];
        if (btn) {
          btn.classList.add('is-fifty-cut');
          btn.disabled = true;
          btn.setAttribute('aria-disabled', 'true');
          let meta = btn.querySelector('.ws8-meta-row') as HTMLDivElement | null;
          if (!meta) {
            meta = document.createElement('div');
            meta.className = 'ws8-meta-row';
            (btn.querySelector('.ws8-pad-body') ?? btn).appendChild(meta);
          }
          meta.querySelector('.ws8-stamp-void')?.remove();
          if (!meta.querySelector('.ws8-stamp-fifty')) {
            const stamp = document.createElement('span');
            stamp.className = 'ws8-stamp-fifty';
            stamp.textContent = '50/50 CUT';
            meta.appendChild(stamp);
          }
        }
        const pollSlot = padPollSlots[idx];
        if (pollSlot) {
          pollSlot.classList.remove('is-visible');
          pollSlot.innerHTML = '';
        }
      }

      if (lastPollPercentages !== null) {
        renderPollBars(lastPollPercentages);
      }

      fiftyFiftyPruned = toCut;
      context.onTactileSfx?.('SHUTTER_CLACK');
      return fiftyFiftyPruned;
    },

    showAudiencePollOverlay(percentages: readonly number[]): void {
      if (resolved || locking || disposed) return;
      lastPollPercentages = percentages;
      renderPollBars(percentages);
      context.onTactileSfx?.('DETENT');
    },

    dispose(): void {
      if (disposed) return;
      disposed = true;
      for (const id of timers) {
        window.clearTimeout(id);
      }
      timers.length = 0;
      for (const fn of cleanups) {
        fn();
      }
      cleanups.length = 0;
      if (root.parentElement === container) {
        container.removeChild(root);
      }
      releaseFourShutterDeluxeStylesV8();
    },
  };
}
