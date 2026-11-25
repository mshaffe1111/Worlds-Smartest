// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master — Wave 2 Polish)
// `src/v7/toys/TactileContraptions14V7.ts`
//
// Sleek 75/25 Classic 4-Choice Studio Push-Button Console + 1966 TV Showcase Props:
//  - `TOY_01_KNIFE_SWITCH` (75% Primary Trivia Input): 4 luminous 1966 Backlit
//    Acrylite Studio Push-Button Pads (`A`, `B`, `C`, `D`) with specular softbox
//    sheen, spun-anodized Living Color medallions, tungsten tally lamps, physical
//    key-travel press depression & 2700K light flash!
//    1-column stack on Mobile Portrait (<700px); 2x2 grid on Tablet/Desktop/Landscape (>=700px).
//  - `TOY_02`..`TOY_14` (25% Special TV Showcase Formats): Authentic 1966 Network
//    TV Props with real 60fps damped spring-damper needle/rotor/beam/slider physics,
//    gravity-plumb scale pans + Weston Zero-Balance needle, chasing #11 dial bulbs,
//    animated shutter louvers, >=48x48px touch targets on EVERY viewport, >=14px
//    typography floor, ZERO monospace, ZERO dark-mud AI boxes, and ZERO scrollbars
//    across 375x667, 390x660, 390x844, 768x1024, 1024x768, and 844x390!
// ============================================================================

import type {
  BalanceScalePayloadV7,
  ChronologyPayloadV7,
  ClueRecordV7,
  ConspiracyLassoPayloadV7,
  CyanotypePlatePayloadV7,
  DayJobIdV7,
  GeoTargetPayloadV7,
  MailSorterPayloadV7,
  MissingVowelsPayloadV7,
  NumericDialPayloadV7,
  PatchbayPayloadV7,
  ShutterReelPayloadV7,
  ToyIdV7,
  ToyResolutionV7,
} from '../contracts_v7';
import { renderCyanotypePlateSVG, type CyanotypeZoneIndexV7 } from './CyanotypePlates20V7';
import { mountReliefGlobeContraptionV7 } from './ReliefGlobeContraptionV7';

export type TactileSfxEventV7 =
  | 'TICK'
  | 'DETENT'
  | 'THROW_SNAP'
  | 'PNEUMATIC_THUNK'
  | 'WIRE_SNIP'
  | 'SHUTTER_CLACK'
  | 'PIN_PLANT'
  | 'IRIS_FLASH'
  | 'CHUTE_SWOOSH'
  | 'TWINE_TAUT';

export interface TactileContraptionContextV7 {
  /** Stamps Vermilion VOID / KLAXON BAIT on clue.waiverPruneIdx. */
  readonly pruneActive?: boolean;
  /** Canary studio grease-pencil tick on choice index (0..3) or zone (0..7). */
  readonly canaryTickIdx?: number | null;
  /** Shows Blacklight-Indigo RIGGED TRAP UV badge on clue.poisonedFixIdx. */
  readonly uvLoupeActive?: boolean;
  /** Contestant Waiver DayJob (PATENT_CLERK chamfer hint, MONOLOGUE_WRITER free shutter, VEGAS_ACTUARY EV tag). */
  readonly dayJob?: DayJobIdV7 | null;
  /** Accessibility reduced-motion toggle. */
  readonly reducedMotion?: boolean;
  /** Accessibility high-contrast badge border boost. */
  readonly highContrastBadges?: boolean;
  /** Optional stage metallic trim accent hex. */
  readonly brassAccentHex?: string;
  /** Optional live studio micro-SFX callback. */
  readonly onTactileSfx?: (event: TactileSfxEventV7) => void;
}

export interface MountedTactileContraptionV7 {
  readonly toyId: ToyIdV7;
  dispose(): void;
}

export interface ToyContraptionMetaV7 {
  readonly toyId: ToyIdV7;
  readonly name: string;
  readonly verbCue: string;
  readonly isBlitzLegal: boolean;
}

export const ALL_TOY_IDS_V7: readonly ToyIdV7[] = [
  'TOY_01_KNIFE_SWITCH',
  'TOY_02_CONFIDENCE_PNEUMATIC',
  'TOY_03_VERNIER_DIAL',
  'TOY_04_BALANCE_SCALE',
  'TOY_05_RELIEF_GLOBE_3D',
  'TOY_06_FUSE_WIRE_SNIPPER',
  'TOY_07_MAIL_SORTER',
  'TOY_08_CHRONOLOGY_RAIL',
  'TOY_09_SWITCHBOARD_PATCHBAY',
  'TOY_10_CLIFFHANGERS_THROTTLE',
  'TOY_11_MISSING_VOWELS_WHEEL',
  'TOY_12_CONSPIRACY_LASSO',
  'TOY_13_CYANOTYPE_LOUPE',
  'TOY_14_FOUR_SHUTTER_REEL',
] as const;

export const TOY_CONTRAPTION_META_V7: Record<ToyIdV7, ToyContraptionMetaV7> = {
  TOY_01_KNIFE_SWITCH: {
    toyId: 'TOY_01_KNIFE_SWITCH',
    name: '1966 Studio Push-Button Desk',
    verbCue: 'Tap A, B, C, or D to lock in!',
    isBlitzLegal: true,
  },
  TOY_02_CONFIDENCE_PNEUMATIC: {
    toyId: 'TOY_02_CONFIDENCE_PNEUMATIC',
    name: 'Double-or-Safe Wager Desk',
    verbCue: 'Tap SAFE 0.75× or BOLD 1.25×!',
    isBlitzLegal: false,
  },
  TOY_03_VERNIER_DIAL: {
    toyId: 'TOY_03_VERNIER_DIAL',
    name: 'Studio Range Dial',
    verbCue: 'Spin the Range Dial & tap LOCK IN!',
    isBlitzLegal: true,
  },
  TOY_04_BALANCE_SCALE: {
    toyId: 'TOY_04_BALANCE_SCALE',
    name: 'Golden Twin-Pan Scale',
    verbCue: 'Tap 2 Gold Weights to match Target!',
    isBlitzLegal: false,
  },
  TOY_05_RELIEF_GLOBE_3D: {
    toyId: 'TOY_05_RELIEF_GLOBE_3D',
    name: '1966 World Atlas Globe',
    verbCue: 'Tap the spot on the World Globe!',
    isBlitzLegal: true,
  },
  TOY_06_FUSE_WIRE_SNIPPER: {
    toyId: 'TOY_06_FUSE_WIRE_SNIPPER',
    name: 'Studio Cable Cutout',
    verbCue: 'Cut wrong cables or tap BANK CASH!',
    isBlitzLegal: false,
  },
  TOY_07_MAIL_SORTER: {
    toyId: 'TOY_07_MAIL_SORTER',
    name: 'Studio Mailbag Twin-Chute',
    verbCue: 'Tap Chute A or B to sort all 4 cards!',
    isBlitzLegal: false,
  },
  TOY_08_CHRONOLOGY_RAIL: {
    toyId: 'TOY_08_CHRONOLOGY_RAIL',
    name: 'Time-Tunnel Timeline',
    verbCue: 'Tap plaques from Earliest to Latest!',
    isBlitzLegal: false,
  },
  TOY_09_SWITCHBOARD_PATCHBAY: {
    toyId: 'TOY_09_SWITCHBOARD_PATCHBAY',
    name: 'Network Control Patchboard',
    verbCue: 'Match all 3 Left Lines to Right Jacks!',
    isBlitzLegal: false,
  },
  TOY_10_CLIFFHANGERS_THROTTLE: {
    toyId: 'TOY_10_CLIFFHANGERS_THROTTLE',
    name: 'Alpine Mountain Range Slider',
    verbCue: 'Slide Mountain Pointer & tap LOCK IN!',
    isBlitzLegal: true,
  },
  TOY_11_MISSING_VOWELS_WHEEL: {
    toyId: 'TOY_11_MISSING_VOWELS_WHEEL',
    name: 'Illuminated Vowel Board',
    verbCue: 'Tap the Vowel Strip to solve the board!',
    isBlitzLegal: true,
  },
  TOY_12_CONSPIRACY_LASSO: {
    toyId: 'TOY_12_CONSPIRACY_LASSO',
    name: '3-Match Studio Lightboard',
    verbCue: 'Tap the 3 connected Studio Cards!',
    isBlitzLegal: false,
  },
  TOY_13_CYANOTYPE_LOUPE: {
    toyId: 'TOY_13_CYANOTYPE_LOUPE',
    name: '1966 TV Visual Monitor',
    verbCue: 'Tap the matching Zone on the TV Monitor!',
    isBlitzLegal: false,
  },
  TOY_14_FOUR_SHUTTER_REEL: {
    toyId: 'TOY_14_FOUR_SHUTTER_REEL',
    name: 'Pop-Art 4-Shutter Wall',
    verbCue: 'Answer for 2.0× or open next Shutter!',
    isBlitzLegal: false,
  },
};

const STUDIO_LETTERS_V7 = ['A', 'B', 'C', 'D'] as const;

const STYLES_ID_V7 = 'ws7-tactile-contraptions-styles';

function ensureTactileContraptionsStylesV7(): void {
  if (typeof document === 'undefined') return;
  let style = document.getElementById(STYLES_ID_V7) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLES_ID_V7;
    document.head.appendChild(style);
  }
  if (style.dataset.version === '1966-living-color-wave5') {
    return;
  }
  style.dataset.version = '1966-living-color-wave5';
  style.textContent = `
    @keyframes ws7PadSlideIn {
      from {
        opacity: 0;
        transform: translateY(7px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes ws7ShutterOpen {
      from {
        opacity: 0.45;
        transform: scaleY(0.86);
      }
      to {
        opacity: 1;
        transform: scaleY(1);
      }
    }
    @keyframes ws7VowelPop {
      0% {
        transform: rotateX(-75deg) scale(0.92);
      }
      70% {
        transform: rotateX(12deg) scale(1.06);
      }
      100% {
        transform: rotateX(0deg) scale(1);
      }
    }
    @keyframes ws7GoldPulse {
      from {
        box-shadow:
          inset 0 2px 0 rgba(255, 255, 255, 0.8),
          0 4px 0 #9E6300,
          0 0 12px rgba(244, 169, 31, 0.45);
      }
      to {
        box-shadow:
          inset 0 2px 0 #FFFFFF,
          0 4px 0 #9E6300,
          0 0 24px rgba(255, 209, 102, 0.85);
      }
    }

    .ws7-toy-root {
      --ws7-toy-sans: 'Plus Jakarta Sans', 'Jost', system-ui, -apple-system, 'Segoe UI', sans-serif;
      --ws7-toy-caps: 'Jost', 'Plus Jakarta Sans', system-ui, sans-serif;
      --ws7-toy-num: 'Michroma', 'Jost', 'Plus Jakarta Sans', sans-serif;
      position: relative;
      width: 100%;
      height: auto;
      min-height: 0;
      box-sizing: border-box;
      overflow: visible;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;
      padding: 0;
      font-family: var(--ws7-toy-sans);
      font-size: 15px;
      font-variant-numeric: tabular-nums;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }
    .ws7-toy-root *, .ws7-toy-root *::before, .ws7-toy-root *::after {
      box-sizing: border-box;
    }

    /* Sleek 1-Line 1966 TV Showcase Prompt Cue (TOY_02..TOY_14 only; ZERO box clutter!) */
    .ws7-showcase-prompt {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 4px 2px;
      background: transparent;
      color: #FFF6E3;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: 0.02em;
      text-align: center;
      flex: 0 0 auto;
    }
    .ws7-showcase-star {
      color: #FFD166;
      font-weight: 900;
      letter-spacing: 0.04em;
      flex: 0 0 auto;
    }

    /* Illuminated 1966 Backlit Acrylite Warm TV Cream Plaque (ZERO nested border soup!) */
    .ws7-cream-plaque {
      position: relative;
      overflow: hidden;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 44%),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 68%, #F2E2C4 100%);
      color: #141B29;
      border: none;
      border-radius: 13px;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 0 -1px 0 rgba(198, 175, 134, 0.55),
        0 3px 0 #C4AC82,
        0 6px 14px rgba(6, 18, 34, 0.26);
    }

    .ws7-choice-copy {
      font-family: var(--ws7-toy-sans);
      font-size: clamp(15px, 1.8vw, 17px);
      font-weight: 700;
      line-height: 1.22;
      color: #141B29;
      overflow-wrap: normal;
      word-break: normal;
      hyphens: none;
      -webkit-hyphens: none;
      white-space: normal;
    }

    /* Diegetic Studio Overlays (>= 14px hard floor, zero monospace!) */
    .ws7-meta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: 3px;
    }
    .ws7-stamp-void {
      display: inline-flex;
      align-items: center;
      padding: 1px 7px;
      border-radius: 5px;
      background: #FDE8E8;
      color: #B51722;
      font-family: var(--ws7-toy-caps);
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.15;
      transform: rotate(-2deg);
      box-shadow: inset 0 0 0 2px #B51722;
    }
    .ws7-canary-tick {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 1px 7px;
      border-radius: 5px;
      background: #E0F4FF;
      color: #005A9C;
      font-family: var(--ws7-toy-caps);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.15;
      transform: rotate(1.5deg);
      box-shadow: inset 0 0 0 1.8px #0077B6;
    }
    .ws7-uv-poison {
      display: inline-flex;
      align-items: center;
      padding: 1px 7px;
      border-radius: 5px;
      background: #F1E6FF;
      color: #5B189A;
      font-family: var(--ws7-toy-caps);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.15;
      box-shadow: inset 0 0 0 1.8px #7B2CBF, 0 0 10px rgba(123, 44, 191, 0.25);
    }

    /* ========================================================================
       1. TOY_01_KNIFE_SWITCH — 75% Classic 4-Option 1966 Studio Push-Button Pads
          Mobile Portrait (<700px): Clean 1-column stack (min-height: 56px, 17-19px)
          Tablet / Desktop / Landscape (>=700px): Crisp 2x2 desk grid (min-height: 64px, 19-21px)
       ======================================================================== */
    .ws7-classic-pads-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 9px;
      width: 100%;
    }
    .ws7-studio-pad {
      --pad-accent: #0096A6;
      --pad-accent-top: #00C2D6;
      --pad-accent-lip: #005F6B;
      --pad-medallion-ink: #FFFDF7;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      min-height: 56px;
      padding: 8px 14px 8px 10px;
      border: none;
      border-radius: 14px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 46%),
        linear-gradient(180deg, #FFFDF9 0%, #FFF6E3 66%, #F2E2C3 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 5px 0 0 var(--pad-accent),
        0 4px 0 #C2AA7E,
        0 8px 18px rgba(5, 16, 32, 0.3);
      color: #141B29;
      cursor: pointer;
      text-align: left;
      transition: transform 0.1s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.12s ease, background 0.12s ease;
    }
    .ws7-studio-pad[data-animated="true"] {
      animation: ws7PadSlideIn 0.22s cubic-bezier(0.2, 0.85, 0.3, 1) both;
    }
    .ws7-studio-pad[data-pad-tone="0"] {
      --pad-accent: #0096A6;
      --pad-accent-top: #00C2D6;
      --pad-accent-lip: #005F6B;
      --pad-medallion-ink: #FFFDF7;
    }
    .ws7-studio-pad[data-pad-tone="1"] {
      --pad-accent: #F4A91F;
      --pad-accent-top: #FFCB52;
      --pad-accent-lip: #AD6F00;
      --pad-medallion-ink: #141B29;
    }
    .ws7-studio-pad[data-pad-tone="2"] {
      --pad-accent: #1E56C5;
      --pad-accent-top: #3B79F2;
      --pad-accent-lip: #11347D;
      --pad-medallion-ink: #FFFDF7;
    }
    .ws7-studio-pad[data-pad-tone="3"] {
      --pad-accent: #FF6738;
      --pad-accent-top: #FF8964;
      --pad-accent-lip: #B33712;
      --pad-medallion-ink: #FFFDF7;
    }
    .ws7-studio-pad:hover,
    .ws7-studio-pad:focus-visible {
      transform: translateY(-1.5px);
      background:
        linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.15) 50%),
        linear-gradient(180deg, #FFFFFF 0%, #FFF9EC 70%, #F7E9CE 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 var(--pad-accent-top),
        0 5px 0 #D8A948,
        0 10px 24px rgba(5, 16, 32, 0.36);
      outline: none;
    }
    .ws7-studio-pad:active,
    .ws7-studio-pad.is-thrown {
      transform: translateY(3px);
      background:
        radial-gradient(circle at 50% 45%, #FFFDF7 0%, #FFF1B0 58%, #FFD166 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 1px 0 #A86B00,
        0 0 0 3px #FFD166,
        0 0 30px rgba(255, 209, 102, 0.9);
    }
    .ws7-pad-medallion {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      border-radius: 11px;
      background: linear-gradient(180deg, var(--pad-accent-top) 0%, var(--pad-accent) 100%);
      color: var(--pad-medallion-ink);
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.52),
        0 0 0 1.5px rgba(255, 255, 255, 0.65),
        0 3px 0 var(--pad-accent-lip);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--ws7-toy-caps);
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 1;
    }
    .ws7-pad-body {
      flex: 1 1 auto;
      min-width: 0;
      padding-right: 4px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .ws7-pad-label {
      font-family: var(--ws7-toy-sans);
      font-size: clamp(17px, 4.3vw, 19px);
      font-weight: 700;
      line-height: 1.24;
      color: #141B29;
      overflow-wrap: normal;
      word-break: normal;
      hyphens: none;
      -webkit-hyphens: none;
      white-space: normal;
    }
    .ws7-pad-lamp {
      flex: 0 0 14px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: radial-gradient(circle at 38% 35%, #FFFDF5 0%, #E5D3B3 65%, #B39D78 100%);
      box-shadow: inset 0 1px 2px rgba(20, 27, 41, 0.28), 0 0 0 2px rgba(255, 255, 255, 0.65);
      transition: background 0.1s ease, box-shadow 0.1s ease, transform 0.1s ease;
    }
    .ws7-studio-pad:hover .ws7-pad-lamp {
      background: radial-gradient(circle at 38% 35%, #FFFFFF 0%, #FFD166 68%, #F4A91F 100%);
      box-shadow: 0 0 12px rgba(244, 169, 31, 0.85);
    }
    .ws7-studio-pad.is-thrown .ws7-pad-lamp {
      transform: scale(1.28);
      background: radial-gradient(circle at 40% 40%, #FFFFFF 0%, #FFF3B0 55%, #FF9F1C 100%);
      box-shadow: 0 0 16px #FFD166, 0 0 28px #FF9F1C;
    }

    @media (min-width: 700px) {
      .ws7-classic-pads-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .ws7-studio-pad {
        min-height: 64px;
        padding: 10px 16px 10px 12px;
        border-radius: 16px;
      }
      .ws7-pad-medallion {
        flex: 0 0 44px;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        font-size: 20px;
      }
      .ws7-pad-label {
        font-size: clamp(19px, 1.85vw, 21px);
        line-height: 1.24;
      }
    }

    @media (max-width: 699px) and (max-height: 700px) {
      .ws7-classic-pads-grid {
        gap: 7px;
      }
      .ws7-studio-pad {
        min-height: 54px;
        padding: 6px 12px 6px 9px;
      }
    }

    /* ========================================================================
       2. TOY_02_CONFIDENCE_PNEUMATIC — 1966 Double-or-Safe Wager Desk
       ======================================================================== */
    .ws7-pneumatic-rack {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 7px;
      width: 100%;
    }
    @media (min-width: 720px) and (min-height: 501px) {
      .ws7-pneumatic-rack {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
    }
    .ws7-pneumatic-row {
      display: grid;
      grid-template-columns: 78px minmax(0, 1fr) 78px;
      align-items: stretch;
      gap: 6px;
      padding: 4px;
      border-radius: 14px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0) 45%),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 72%, #F2E3C6 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 3px 0 #C5AE84,
        0 6px 14px rgba(8, 22, 42, 0.24);
    }
    .ws7-pneumatic-port {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      min-width: 68px;
      padding: 4px 6px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-family: var(--ws7-toy-caps);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: 0.02em;
      transition: transform 0.1s ease, filter 0.1s ease;
    }
    .ws7-pneumatic-port:hover {
      filter: brightness(1.08);
    }
    .ws7-pneumatic-port:active {
      transform: translateY(2px);
    }
    .ws7-port-insured {
      background: linear-gradient(180deg, #00C2D6 0%, #008B9A 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 3px 0 #005E69;
    }
    .ws7-port-spike {
      background: linear-gradient(180deg, #FF855E 0%, #EB5525 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 3px 0 #A8340E;
    }
    .ws7-pneumatic-slip {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 4px 6px;
      min-width: 0;
      text-align: center;
    }
    .ws7-pneumatic-row.is-dispatched {
      background: radial-gradient(circle at 50% 50%, #FFFDF5 0%, #FFEFA8 100%);
      box-shadow: 0 0 0 3px #FFD166, 0 0 24px rgba(255, 209, 102, 0.85);
    }

    /* ========================================================================
       3. TOY_03_VERNIER_DIAL — *Price Is Right* Living Color Range Dial
       ======================================================================== */
    .ws7-vernier-layout {
      display: grid;
      grid-template-columns: 152px minmax(0, 1fr);
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
    }
    @media (min-width: 520px) {
      .ws7-vernier-layout {
        grid-template-columns: 186px minmax(0, 1fr);
        gap: 16px;
      }
    }
    .ws7-vernier-wheel-box {
      position: relative;
      width: 152px;
      height: 152px;
      margin: 0 auto;
      touch-action: none;
      cursor: grab;
    }
    @media (min-width: 520px) {
      .ws7-vernier-wheel-box {
        width: 186px;
        height: 186px;
      }
    }
    .ws7-vernier-wheel-box:active {
      cursor: grabbing;
    }
    .ws7-vernier-readout-card {
      width: 100%;
      padding: 2px 0;
      border: none;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      color: #FFF6E3;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ws7-dial-solari-plaque {
      padding: 7px 10px;
      border-radius: 12px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 48%),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 70%, #F0DFBF 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 3px 0 #C2AA7E,
        0 5px 12px rgba(5, 16, 32, 0.28);
      color: #141B29;
      font-family: var(--ws7-toy-num);
      font-size: clamp(20px, 2.6vw, 25px);
      font-weight: 800;
      text-align: center;
      line-height: 1.15;
    }
    .ws7-dial-nudge-pair {
      display: grid;
      grid-template-columns: repeat(2, minmax(48px, 1fr));
      gap: 8px;
    }
    .ws7-step-nudge-btn {
      min-width: 48px;
      min-height: 48px;
      border: none;
      border-radius: 11px;
      background: linear-gradient(180deg, #00C2D6 0%, #008B9A 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 3px 0 #005B66;
      font-family: var(--ws7-toy-caps);
      font-size: 22px;
      font-weight: 900;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.08s ease, filter 0.1s ease;
    }
    .ws7-step-nudge-btn:hover {
      filter: brightness(1.08);
    }
    .ws7-step-nudge-btn:active {
      transform: translateY(2px);
    }
    .ws7-studio-lock-btn {
      min-height: 48px;
      min-width: 96px;
      width: 100%;
      padding: 8px 14px;
      border: none;
      border-radius: 12px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0) 48%),
        linear-gradient(180deg, #FF855E 0%, #EB5525 100%);
      color: #FFFDF7;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.52),
        0 4px 0 #A8340E,
        0 6px 14px rgba(235, 85, 37, 0.38);
      font-family: var(--ws7-toy-caps);
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.05em;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: transform 0.1s ease, filter 0.1s ease;
    }
    .ws7-studio-lock-btn:hover {
      filter: brightness(1.07);
    }
    .ws7-studio-lock-btn:active {
      transform: translateY(3px);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 1px 0 #A8340E;
    }

    /* ========================================================================
       4. TOY_04_BALANCE_SCALE — Golden Studio Twin-Pan Scale (Zero Inner Box!)
       ======================================================================== */
    .ws7-scale-stage {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }
    .ws7-scale-svg-wrap {
      width: 100%;
      height: clamp(98px, 24vh, 124px);
      background: transparent;
      border: none;
      border-radius: 0;
      box-shadow: none;
      overflow: visible;
    }
    .ws7-weights-rack {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 7px;
      width: 100%;
    }
    @media (min-width: 560px) {
      .ws7-weights-rack {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
    .ws7-brass-weight {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 52px;
      min-width: 52px;
      padding: 6px 6px;
      border: none;
      border-radius: 12px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0) 45%),
        linear-gradient(180deg, #FFD875 0%, #F4A91F 72%, #D48806 100%);
      color: #141B29;
      cursor: pointer;
      text-align: center;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.8),
        0 3px 0 #9E6300,
        0 5px 12px rgba(0, 0, 0, 0.28);
      transition: transform 0.12s cubic-bezier(0.22, 1.3, 0.36, 1), box-shadow 0.12s ease;
    }
    .ws7-brass-weight.is-on-pan {
      transform: translateY(-4px);
      background: linear-gradient(180deg, #FFFDF5 0%, #FFE484 65%, #F4A91F 100%);
      box-shadow:
        0 0 0 3px #00E5FF,
        0 6px 16px rgba(0, 229, 255, 0.48);
    }

    /* ========================================================================
       6. TOY_06_FUSE_WIRE_SNIPPER — Studio Cable Cutout + Bank Cash Lever
       ======================================================================== */
    .ws7-fuse-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 110px;
      gap: 8px;
      width: 100%;
      align-items: stretch;
    }
    .ws7-fuse-wires-col {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 6px;
    }
    @media (min-width: 720px) and (min-height: 501px) {
      .ws7-fuse-wires-col {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }
    }
    .ws7-fuse-wire-btn {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      min-height: 48px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      text-align: left;
      transition: transform 0.1s ease, opacity 0.14s ease;
    }
    .ws7-fuse-wire-btn:active {
      transform: translateY(2px);
    }
    .ws7-fuse-wire-btn.is-snipped {
      opacity: 0.56;
      background: linear-gradient(180deg, #DCE6F0 0%, #C5D3E2 100%);
      cursor: default;
    }
    .ws7-bailout-latch {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      min-height: 52px;
      min-width: 96px;
      padding: 8px 8px;
      border: none;
      border-radius: 14px;
      background: linear-gradient(180deg, #1B4D66 0%, #113448 100%);
      color: #E2F3FA;
      box-shadow: 0 4px 0 #071926;
      cursor: not-allowed;
      text-align: center;
      font-family: var(--ws7-toy-caps);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.18;
    }
    .ws7-bailout-latch.is-armed {
      cursor: pointer;
      background: linear-gradient(180deg, #FFD875 0%, #F4A91F 70%, #D48806 100%);
      color: #141B29;
      animation: ws7GoldPulse 0.7s ease-in-out infinite alternate;
    }

    /* ========================================================================
       7. TOY_07_MAIL_SORTER — Studio Mailbag Twin-Chute Sorter
       ======================================================================== */
    .ws7-sorter-layout {
      display: grid;
      grid-template-columns: minmax(88px, 120px) minmax(0, 1fr) minmax(88px, 120px);
      gap: 8px;
      width: 100%;
      min-height: 148px;
      align-items: stretch;
    }
    .ws7-chute-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 56px;
      min-width: 84px;
      padding: 10px 8px;
      border: none;
      border-radius: 14px;
      color: #FFFDF7;
      cursor: pointer;
      text-align: center;
      font-family: var(--ws7-toy-caps);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.2;
      transition: transform 0.1s ease, filter 0.1s ease;
    }
    .ws7-chute-btn[data-chute="0"] {
      background: linear-gradient(180deg, #00C2D6 0%, #008B9A 100%);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.48), 0 4px 0 #005C66;
    }
    .ws7-chute-btn[data-chute="1"] {
      background: linear-gradient(180deg, #FF855E 0%, #EB5525 100%);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.48), 0 4px 0 #A8340E;
    }
    .ws7-chute-btn:hover {
      filter: brightness(1.08);
    }
    .ws7-chute-btn:active {
      transform: translateY(2px);
    }

    /* ========================================================================
       8. TOY_08_CHRONOLOGY_RAIL — 1966 Time-Tunnel Broadcast Timeline
       ======================================================================== */
    .ws7-chrono-layout {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .ws7-sleepers-row {
      display: grid;
      gap: 6px;
      width: 100%;
    }
    .ws7-sleeper-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 52px;
      min-width: 52px;
      padding: 5px 6px;
      border: none;
      border-bottom: 4px solid #F4A91F;
      border-radius: 10px 10px 4px 4px;
      background: rgba(255, 246, 227, 0.08);
      color: #FFD166;
      text-align: center;
      font-family: var(--ws7-toy-caps);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.16;
      transition: transform 0.14s cubic-bezier(0.22, 1.3, 0.36, 1);
    }
    .ws7-sleeper-slot.is-filled {
      border: none;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 45%),
        linear-gradient(180deg, #FFFDF7 0%, #FFF6E3 72%, #F2E3C6 100%);
      box-shadow: inset 0 2px 0 #FFFFFF, 0 3px 0 #C5AE84;
      color: #141B29;
      cursor: pointer;
    }
    .ws7-plaques-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
      width: 100%;
    }
    .ws7-plaque-btn {
      min-height: 50px;
      padding: 7px 10px;
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.1s ease, opacity 0.14s ease;
    }
    .ws7-plaque-btn:active {
      transform: translateY(2px);
    }
    .ws7-plaque-btn.is-placed {
      opacity: 0.32;
      pointer-events: none;
    }

    /* ========================================================================
       9. TOY_09_SWITCHBOARD_PATCHBAY — 1966 Network Control Patchboard (Zero Box!)
       ======================================================================== */
    .ws7-patchbay-stage {
      position: relative;
      display: grid;
      grid-template-columns: minmax(110px, 1fr) 48px minmax(110px, 1fr);
      gap: 0;
      width: 100%;
      padding: 2px 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      align-items: stretch;
    }
    .ws7-patch-col {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      gap: 5px;
      z-index: 2;
    }
    .ws7-caller-plug, .ws7-jack-socket {
      min-height: 48px;
      padding: 6px 9px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      text-align: left;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.18;
    }
    .ws7-caller-plug.is-armed {
      box-shadow:
        0 0 0 3px #FFD166,
        0 0 18px rgba(255, 209, 102, 0.78);
    }

    /* ========================================================================
       10. TOY_10_CLIFFHANGERS_THROTTLE — Alpine Mountain Range Slider
       ======================================================================== */
    .ws7-cliff-layout {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .ws7-cliff-controls-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 124px;
      gap: 10px;
      align-items: center;
    }
    .ws7-throttle-track {
      position: relative;
      width: 100%;
      min-height: 52px;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      touch-action: none;
      cursor: ew-resize;
      display: flex;
      align-items: center;
      padding: 0 24px;
    }

    /* ========================================================================
       11. TOY_11_MISSING_VOWELS_WHEEL — *Concentration / Wheel* Letter Board
       ======================================================================== */
    .ws7-vowels-layout {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .ws7-solari-rack {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 6px 14px;
      padding: 6px 4px 8px;
      min-height: 52px;
      border-radius: 0;
      background: transparent;
      border-bottom: 3px solid rgba(244, 169, 31, 0.55);
      box-shadow: none;
    }
    .ws7-solari-word {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-wrap: nowrap;
    }
    .ws7-flap-tile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 34px;
      padding: 0 5px;
      border-radius: 6px;
      background: linear-gradient(180deg, #FFFFFF 0%, #FFF6E3 100%);
      box-shadow: inset 0 1.5px 0 #FFFFFF, 0 2px 0 #B8A27A;
      color: #141B29;
      font-family: var(--ws7-toy-caps);
      font-size: 16px;
      font-weight: 900;
      line-height: 1;
    }
    .ws7-flap-tile.is-blank {
      background: linear-gradient(180deg, #FFE896 0%, #F4A91F 100%);
      box-shadow: 0 2px 0 #A86B00, 0 0 10px rgba(255, 209, 102, 0.6);
      color: #141B29;
    }
    .ws7-flap-tile.is-revealed {
      background: linear-gradient(180deg, #FFFDF5 0%, #7EF2AD 100%);
      animation: ws7VowelPop 0.24s ease-out both;
    }
    .ws7-drums-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      width: 100%;
    }
    .ws7-vowel-drum {
      min-height: 52px;
      padding: 8px 10px;
      border: none;
      border-radius: 13px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 45%),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 70%, #F2E3C6 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 5px 0 0 #F4A91F,
        0 3px 0 #C5AE84,
        0 6px 14px rgba(8, 22, 42, 0.24);
      color: #141B29;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: var(--ws7-toy-num);
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.05em;
      line-height: 1.2;
      transition: transform 0.1s ease, box-shadow 0.1s ease;
    }
    .ws7-vowel-drum:hover {
      transform: translateY(-1px);
    }
    .ws7-vowel-drum:active {
      transform: translateY(2px);
    }

    /* ========================================================================
       12. TOY_12_CONSPIRACY_LASSO — 3x3 Pop-Modernist TV Lightboard (Zero Box!)
       ======================================================================== */
    .ws7-corkboard {
      position: relative;
      width: 100%;
      padding: 2px 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-rows: repeat(3, minmax(48px, 1fr));
      gap: 7px;
      touch-action: none;
    }
    .ws7-pin-card {
      position: relative;
      min-height: 50px;
      padding: 10px 6px 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      z-index: 1;
      font-family: var(--ws7-toy-sans);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.16;
      color: #141B29;
      transition: transform 0.1s ease, box-shadow 0.12s ease;
    }
    .ws7-pin-card.is-lassoed {
      transform: translateY(-2px);
      background: linear-gradient(180deg, #FFFDF5 0%, #FFE89E 100%);
      box-shadow: 0 0 0 3px #FF6738, 0 5px 14px rgba(255, 103, 56, 0.5);
    }
    .ws7-brass-tack {
      position: absolute;
      top: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #FFFDF5, #00C2D6 70%, #006875 100%);
    }

    /* ========================================================================
       13. TOY_13_CYANOTYPE_LOUPE — 1966 RCA Color TV Visual Monitor
       ======================================================================== */
    .ws7-cyano-outer {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    @media (min-width: 760px) and (min-height: 501px) {
      .ws7-cyano-outer[data-has-legend="true"] {
        display: grid;
        grid-template-columns: minmax(310px, 1.18fr) minmax(240px, 1fr);
        gap: 12px;
        align-items: center;
      }
    }
    .ws7-cyanotype-wrap {
      position: relative;
      width: 100%;
      height: clamp(162px, 27vh, 222px);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(8, 22, 42, 0.35);
    }
    .ws7-cyano-legend-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
      width: 100%;
    }
    @media (min-width: 760px) and (min-height: 501px) {
      .ws7-cyano-legend-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    .ws7-cyano-legend-btn {
      min-height: 48px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 7px;
      cursor: pointer;
      text-align: left;
      transition: transform 0.1s ease;
    }
    .ws7-cyano-legend-btn:active {
      transform: translateY(2px);
    }

    /* ========================================================================
       14. TOY_14_FOUR_SHUTTER_REEL — 1966 *Laugh-In* Pop-Color 4-Shutter Wall
       ======================================================================== */
    .ws7-shutter-layout {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .ws7-shutter-top {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 108px;
      gap: 8px;
      align-items: stretch;
    }
    .ws7-shutters-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-rows: repeat(2, minmax(44px, 1fr));
      gap: 6px;
    }
    .ws7-shutter-window {
      padding: 6px 8px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-family: var(--ws7-toy-sans);
      font-size: 14px;
      font-weight: 800;
      line-height: 1.18;
      min-height: 44px;
    }
    .ws7-shutter-window.is-newly-opened {
      animation: ws7ShutterOpen 0.22s cubic-bezier(0.22, 1.2, 0.36, 1) both;
    }
    .ws7-shutter-window.is-closed[data-shutter-tone="0"] {
      background: linear-gradient(180deg, #00C2D6 0%, #008594 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 3px 0 #005863;
    }
    .ws7-shutter-window.is-closed[data-shutter-tone="1"] {
      background: linear-gradient(180deg, #FFCB52 0%, #E89B0C 100%);
      color: #141B29;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.6), 0 3px 0 #A36800;
    }
    .ws7-shutter-window.is-closed[data-shutter-tone="2"] {
      background: linear-gradient(180deg, #3B79F2 0%, #1746A2 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 3px 0 #0F2E6E;
    }
    .ws7-shutter-window.is-closed[data-shutter-tone="3"] {
      background: linear-gradient(180deg, #F45B96 0%, #C92663 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), 0 3px 0 #8C1541;
    }
    .ws7-crack-lever {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-height: 52px;
      min-width: 96px;
      padding: 6px 6px;
      border: none;
      border-radius: 13px;
      background: linear-gradient(180deg, #FF855E 0%, #EB5525 100%);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.48), 0 4px 0 #A8340E;
      color: #FFFDF7;
      cursor: pointer;
      text-align: center;
      font-family: var(--ws7-toy-caps);
      font-size: 14px;
      font-weight: 900;
      line-height: 1.15;
    }
    .ws7-crack-lever:disabled {
      opacity: 0.58;
      background: linear-gradient(180deg, #15455B 0%, #0D263D 100%);
      box-shadow: none;
      cursor: default;
    }
    .ws7-shutter-keys {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
    }
    .ws7-shutter-key-btn {
      min-height: 48px;
      padding: 6px 10px;
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ========================================================================
       Compact Mobile Landscape (e.g. 844x390 / <=500px height):
       ZERO scrollbars inside <=306px right column, EVERY button >=48px, >=14px text!
       ======================================================================== */
    @media (max-height: 500px) and (orientation: landscape) {
      .ws7-toy-root {
        gap: 5px;
      }
      .ws7-showcase-prompt {
        padding: 0 2px;
        font-size: 14px;
      }
      .ws7-choice-copy {
        font-size: 14.5px;
        line-height: 1.15;
      }
      .ws7-classic-pads-grid {
        gap: 8px;
      }
      .ws7-studio-pad {
        min-height: 56px;
        gap: 9px;
        padding: 7px 11px 7px 8px;
      }
      .ws7-pad-medallion {
        flex: 0 0 34px;
        width: 34px;
        height: 34px;
        border-radius: 9px;
        font-size: 16px;
      }
      .ws7-pad-body {
        padding-right: 6px;
      }
      .ws7-pad-label {
        font-size: clamp(14.5px, 1.75vw, 16.5px);
        line-height: 1.18;
      }
      .ws7-studio-pad[data-long-word="true"] .ws7-pad-label {
        font-size: 14px;
        letter-spacing: -0.01em;
      }
      .ws7-pad-lamp {
        flex: 0 0 10px;
        width: 10px;
        height: 10px;
        margin-left: 2px;
      }
      .ws7-pneumatic-rack {
        gap: 5px;
      }
      .ws7-pneumatic-row {
        padding: 3px;
      }
      .ws7-vernier-layout {
        grid-template-columns: 162px minmax(0, 1fr);
        gap: 10px;
      }
      .ws7-vernier-wheel-box {
        width: 162px;
        height: 162px;
      }
      .ws7-vernier-readout-card {
        padding: 8px 10px;
        gap: 5px;
      }
      .ws7-scale-svg-wrap {
        height: 92px;
      }
      .ws7-brass-weight {
        min-height: 48px;
        padding: 4px;
      }
      .ws7-fuse-wires-col {
        gap: 5px;
      }
      .ws7-sorter-layout {
        min-height: 132px;
      }
      .ws7-sleeper-slot {
        min-height: 48px;
        padding: 4px 5px;
      }
      .ws7-plaques-grid {
        gap: 5px;
      }
      .ws7-plaque-btn {
        min-height: 48px;
        padding: 5px 8px;
      }
      .ws7-patchbay-stage {
        padding: 4px 6px;
      }
      .ws7-patch-col {
        gap: 4px;
      }
      .ws7-caller-plug, .ws7-jack-socket {
        min-height: 48px;
        padding: 4px 7px;
      }
      .ws7-solari-rack {
        min-height: 50px;
        padding: 6px 8px;
      }
      .ws7-flap-tile {
        height: 28px;
        font-size: 15px;
      }
      .ws7-drums-grid {
        gap: 5px;
      }
      .ws7-vowel-drum {
        min-height: 48px;
        padding: 5px 8px;
      }
      .ws7-corkboard {
        padding: 5px;
        gap: 5px;
        grid-template-rows: repeat(3, minmax(48px, 1fr));
      }
      .ws7-pin-card {
        min-height: 48px;
        padding: 8px 4px 3px;
      }
      .ws7-cyanotype-wrap {
        height: 152px;
      }
      .ws7-cyano-legend-grid {
        gap: 5px;
      }
      .ws7-shutters-grid {
        grid-template-rows: repeat(2, minmax(38px, 1fr));
        gap: 4px;
      }
      .ws7-shutter-window {
        min-height: 38px;
        padding: 3px 6px;
      }
      .ws7-shutter-keys {
        gap: 5px;
      }
      .ws7-shutter-key-btn {
        min-height: 48px;
        padding: 4px 8px;
      }
    }
  `;
}

// ----------------------------------------------------------------------------
// HTML Escaping, Prompt Helper & Diegetic Metadata Badge Rendering
// ----------------------------------------------------------------------------

function escHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function appendShowcasePromptBanner(root: HTMLElement, text: string): HTMLDivElement {
  const banner = document.createElement('div');
  banner.className = 'ws7-showcase-prompt';
  banner.innerHTML = `<span class="ws7-showcase-star">★ TV BONUS</span><span>${escHtml(text)}</span>`;
  root.appendChild(banner);
  return banner;
}

/**
 * Renders the 3 diegetic metadata overlays on Warm TV Cream choices (>= 14px):
 *  1. `#B51722` Vermilion rubber-stamped `VOID` / `KLAXON BAIT`
 *  2. `#005A9C` Studio Canary grease-pencil `CANARY TIP`
 *  3. `#5B189A` Blacklight-Indigo `RIGGED TRAP` UV badge
 */
function renderDiegeticChoiceOverlaysHtml(
  clue: ClueRecordV7,
  choiceIdx: number,
  context: TactileContraptionContextV7,
): string {
  const badges: string[] = [];

  if (context.pruneActive && choiceIdx === clue.waiverPruneIdx) {
    const label = clue.isKlaxonMyth ? 'KLAXON BAIT' : 'VOID';
    badges.push(`<span class="ws7-stamp-void">${label}</span>`);
  }

  if (typeof context.canaryTickIdx === 'number' && choiceIdx === context.canaryTickIdx) {
    badges.push(
      `<span class="ws7-canary-tick"><svg width="14" height="13" viewBox="0 0 14 12" fill="none" aria-hidden="true"><path d="M1.5 6.5L5.2 10L12.5 1.8" stroke="#005A9C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>CANARY TIP</span>`,
    );
  }

  if (context.uvLoupeActive && choiceIdx === clue.poisonedFixIdx) {
    badges.push(`<span class="ws7-uv-poison">RIGGED TRAP</span>`);
  }

  if (badges.length === 0) return '';
  return `<div class="ws7-meta-row">${badges.join('')}</div>`;
}

function buildChoiceResolution(
  clue: ClueRecordV7,
  chosenIdx: number,
  chipMultiplier: number,
  chosenPrefix = '',
): ToyResolutionV7 {
  const isCorrect = chosenIdx === clue.answerIdx;
  const rawChoice = clue.choices[chosenIdx] ?? '';
  const trueAnswerDisplay = clue.choices[clue.answerIdx];
  return {
    isCorrect,
    accuracyRatio: isCorrect ? 1.0 : 0.0,
    chipMultiplier,
    chosenSummary: chosenPrefix ? `${chosenPrefix} ${rawChoice}` : rawChoice,
    trueAnswerDisplay,
    triggeredKlaxon: !isCorrect && Boolean(clue.isKlaxonMyth),
    fellForPoisonedFix: !isCorrect && chosenIdx === clue.poisonedFixIdx,
  };
}

// ----------------------------------------------------------------------------
// Safe Deterministic Payload Fallbacks (Zero Undefined Crashes!)
// ----------------------------------------------------------------------------

function resolveNumericPayload(clue: ClueRecordV7): NumericDialPayloadV7 {
  if (clue.numeric) return clue.numeric;
  const parsed = Number.parseFloat(clue.choices[clue.answerIdx].replace(/[^0-9.-]/g, ''));
  const target = Number.isFinite(parsed) ? parsed : 50;
  const span = Math.max(20, Math.abs(target) * 0.8);
  const min = Math.round(target - span * 0.5);
  const max = Math.round(target + span * 0.5);
  return { target, min, max: Math.max(min + 10, max), step: 1, unit: '' };
}

function resolveBalancePayload(clue: ClueRecordV7): BalanceScalePayloadV7 {
  if (clue.balance) return clue.balance;
  return {
    unit: 'G',
    targetSum: 100,
    weights: [
      { label: clue.choices[clue.answerIdx], value: 60 },
      { label: 'Counterweight', value: 40 },
      { label: clue.choices[(clue.answerIdx + 1) % 4], value: 25 },
      { label: clue.choices[(clue.answerIdx + 2) % 4], value: 55 },
      { label: clue.choices[(clue.answerIdx + 3) % 4], value: 85 },
    ],
    validPair: [0, 1],
  };
}

function resolveGeoPayload(clue: ClueRecordV7): GeoTargetPayloadV7 {
  if (clue.geo) return clue.geo;
  return {
    lat: 37.9715,
    lng: 23.7257,
    landmarkLabel: clue.choices[clue.answerIdx],
    regionHint: 'MEDITERRANEAN BASIN',
  };
}

function resolveSorterPayload(clue: ClueRecordV7): MailSorterPayloadV7 {
  if (clue.sorter && clue.sorter.items.length >= 4) return clue.sorter;
  return {
    chuteALabel: 'TRUE FACT',
    chuteBLabel: 'FALSE CLAIM',
    items: [
      { label: clue.choices[clue.answerIdx], chute: 0 },
      { label: clue.choices[(clue.answerIdx + 1) % 4], chute: 1 },
      { label: clue.choices[(clue.answerIdx + 2) % 4], chute: 1 },
      { label: clue.choices[(clue.answerIdx + 3) % 4], chute: 1 },
    ],
  };
}

function resolveChronologyPayload(clue: ClueRecordV7): ChronologyPayloadV7 {
  if (clue.chronology && clue.chronology.events.length >= 3) return clue.chronology;
  return {
    events: [
      { label: clue.choices[0], year: 1850, displayYear: '1850' },
      { label: clue.choices[1], year: 1905, displayYear: '1905' },
      { label: clue.choices[2], year: 1957, displayYear: '1957' },
      { label: clue.choices[3], year: 1989, displayYear: '1989' },
    ],
  };
}

function resolvePatchbayPayload(clue: ClueRecordV7): PatchbayPayloadV7 {
  if (clue.patchbay) return clue.patchbay;
  return {
    callers: ['CHANNEL 1', 'CHANNEL 2', 'CHANNEL 3'],
    jacks: clue.choices,
    correctMapping: [
      clue.answerIdx,
      (clue.answerIdx + 1) % 4,
      (clue.answerIdx + 2) % 4,
    ],
  };
}

function resolveMissingVowelsPayload(clue: ClueRecordV7): MissingVowelsPayloadV7 {
  if (clue.vowels) return clue.vowels;
  const full = clue.choices[clue.answerIdx].toUpperCase();
  const vowelsExtracted: string[] = [];
  const maskedChars = Array.from(full).map((ch) => {
    if ('AEIOU'.includes(ch)) {
      vowelsExtracted.push(ch);
      return '_';
    }
    return ch;
  });
  const baseVowels = vowelsExtracted.length > 0 ? vowelsExtracted : ['A', 'E', 'I'];
  const trueCluster = baseVowels.join('-');
  const ring = ['A', 'E', 'I', 'O', 'U'] as const;
  const distractors: string[] = [];
  const used = new Set<string>([trueCluster]);
  for (let shift = 1; shift <= 8 && distractors.length < 3; shift++) {
    const cand = baseVowels
      .map((v, idx) => {
        const pos = Math.max(0, ring.indexOf(v as (typeof ring)[number]));
        return ring[(pos + shift + (idx % 2)) % 5];
      })
      .join('-');
    if (!used.has(cand)) {
      used.add(cand);
      distractors.push(cand);
    }
  }
  while (distractors.length < 3) {
    distractors.push(`A-O-U-${distractors.length + 1}`);
  }
  const drums: [string, string, string, string] = ['', '', '', ''];
  let dIdx = 0;
  for (let i = 0; i < 4; i++) {
    drums[i] = i === clue.answerIdx ? trueCluster : distractors[dIdx++];
  }
  return {
    maskedDisplay: maskedChars.join(''),
    fullAnswer: full,
    vowelChoices: drums,
    correctChoiceIdx: clue.answerIdx,
  };
}

function resolveLassoPayload(clue: ClueRecordV7): ConspiracyLassoPayloadV7 {
  if (clue.lasso && clue.lasso.cards.length >= 9) return clue.lasso;
  const ans = clue.choices[clue.answerIdx];
  return {
    connectionPrompt: 'Tap the 3 connected Studio Cards!',
    cards: [
      ans,
      clue.choices[(clue.answerIdx + 1) % 4],
      `${ans} II`,
      clue.choices[(clue.answerIdx + 2) % 4],
      `${ans} III`,
      clue.choices[(clue.answerIdx + 3) % 4],
      'Studio Decoy A',
      'Studio Decoy B',
      'Studio Decoy C',
    ],
    triadIndices: [0, 2, 4],
  };
}

function resolveCyanotypePayload(clue: ClueRecordV7): CyanotypePlatePayloadV7 {
  if (clue.cyanotype) return clue.cyanotype;
  return {
    plateId: clue.category,
    targetZoneIdx: (Math.abs(clue.qid) % 8) as CyanotypeZoneIndexV7,
    targetZoneName: clue.choices[clue.answerIdx],
  };
}

function resolveShuttersPayload(clue: ClueRecordV7): ShutterReelPayloadV7 {
  if (clue.shutters) return clue.shutters;
  return {
    shutters: [
      `Show Desk: ${clue.domain.replace('_', ' & ')}`,
      `Topic: ${clue.category}`,
      `Tier ${clue.difficulty} Studio Hint`,
      clue.stem,
    ],
  };
}

// ============================================================================
// MAIN ENTRYPOINT: `mountTactileContraptionV7`
// ============================================================================

export function mountTactileContraptionV7(
  container: HTMLElement,
  clue: ClueRecordV7,
  toyId: ToyIdV7,
  context: TactileContraptionContextV7 = {},
  onResolve: (res: ToyResolutionV7) => void = () => {},
): MountedTactileContraptionV7 {
  ensureTactileContraptionsStylesV7();
  container.innerHTML = '';

  const root = document.createElement('div');
  root.className = `ws7-toy-root ws7-toy-${toyId.toLowerCase()}`;
  root.dataset.toyId = toyId;
  container.appendChild(root);

  let resolved = false;
  let disposed = false;
  const timers: number[] = [];
  const cleanups: Array<() => void> = [];

  const schedule = (fn: () => void, ms: number): void => {
    const delay = context.reducedMotion ? Math.min(60, ms) : ms;
    const id = window.setTimeout(() => {
      if (!disposed) fn();
    }, delay);
    timers.push(id);
  };

  const emitOnce = (res: ToyResolutionV7): void => {
    if (resolved || disposed) return;
    resolved = true;
    onResolve(res);
  };

  switch (toyId) {
    // ------------------------------------------------------------------------
    // 1. TOY_01_KNIFE_SWITCH (75% Primary Classic 4-Option TV Monitor):
    //    4 Sleek, Luminous 1966 Studio Push-Button Pads (A, B, C, D)
    //    ZERO decorative headers above options, ZERO nested AI boxes!
    // ------------------------------------------------------------------------
    case 'TOY_01_KNIFE_SWITCH': {
      const grid = document.createElement('div');
      grid.className = 'ws7-classic-pads-grid ws7-knife-grid';
      root.appendChild(grid);

      const hasLongUnbrokenWord = clue.choices.some((c) => /\S{15,}/.test(c));

      clue.choices.forEach((choiceText, idx) => {
        const letter = STUDIO_LETTERS_V7[idx] ?? String(idx + 1);
        const pad = document.createElement('button');
        pad.type = 'button';
        pad.className = 'ws7-studio-pad ws7-knife-bay';
        pad.dataset.choiceIdx = String(idx);
        pad.dataset.padTone = String(idx % 4);
        if (hasLongUnbrokenWord || /\S{15,}/.test(choiceText)) {
          pad.dataset.longWord = 'true';
        }
        if (!context.reducedMotion) {
          pad.dataset.animated = 'true';
          pad.style.animationDelay = `${idx * 32}ms`;
        }
        pad.setAttribute('aria-label', `Option ${letter}: ${choiceText}`);
        pad.innerHTML = `
          <span class="ws7-pad-medallion" aria-hidden="true">${letter}</span>
          <span class="ws7-pad-body">
            <span class="ws7-pad-label">${escHtml(choiceText)}</span>
            ${renderDiegeticChoiceOverlaysHtml(clue, idx, context)}
          </span>
          <span class="ws7-pad-lamp" aria-hidden="true"></span>
        `;

        pad.addEventListener('pointerenter', (e: PointerEvent) => {
          if (e.pointerType === 'mouse' && !resolved && !disposed) {
            context.onTactileSfx?.('TICK');
          }
        });

        pad.addEventListener('click', () => {
          if (resolved || disposed) return;
          pad.classList.add('is-thrown');
          context.onTactileSfx?.('THROW_SNAP');
          const res = buildChoiceResolution(clue, idx, 1.0);
          schedule(() => emitOnce(res), 190);
        });

        grid.appendChild(pad);
      });
      break;
    }

    // ------------------------------------------------------------------------
    // 2. TOY_02_CONFIDENCE_PNEUMATIC: 1966 Double-or-Safe Wager Desk
    // ------------------------------------------------------------------------
    case 'TOY_02_CONFIDENCE_PNEUMATIC': {
      appendShowcasePromptBanner(root, 'Tap SAFE 0.75× or BOLD 1.25× beside your answer!');

      const rack = document.createElement('div');
      rack.className = 'ws7-pneumatic-rack';
      root.appendChild(rack);

      const actuaryBonusHint = context.dayJob === 'VEGAS_ACTUARY' ? ' +EV' : '';

      clue.choices.forEach((choiceText, idx) => {
        const row = document.createElement('div');
        row.className = 'ws7-pneumatic-row';
        row.dataset.choiceIdx = String(idx);

        const insuredBtn = document.createElement('button');
        insuredBtn.type = 'button';
        insuredBtn.className = 'ws7-pneumatic-port ws7-port-insured';
        insuredBtn.dataset.portKind = 'INSURED';
        insuredBtn.dataset.choiceIdx = String(idx);
        insuredBtn.innerHTML = `<span>0.75×</span><span>SAFE</span>`;

        const slip = document.createElement('div');
        slip.className = 'ws7-pneumatic-slip';
        slip.innerHTML = `
          <div class="ws7-choice-copy">${escHtml(choiceText)}</div>
          ${renderDiegeticChoiceOverlaysHtml(clue, idx, context)}
        `;

        const spikeBtn = document.createElement('button');
        spikeBtn.type = 'button';
        spikeBtn.className = 'ws7-pneumatic-port ws7-port-spike';
        spikeBtn.dataset.portKind = 'SPIKE';
        spikeBtn.dataset.choiceIdx = String(idx);
        spikeBtn.innerHTML = `<span>1.25×</span><span>BOLD${actuaryBonusHint}</span>`;

        const dispatch = (mult: 0.75 | 1.25, tag: string): void => {
          if (resolved || disposed) return;
          row.classList.add('is-dispatched');
          context.onTactileSfx?.('PNEUMATIC_THUNK');
          const res = buildChoiceResolution(clue, idx, mult, `[${tag}]`);
          schedule(() => emitOnce(res), 190);
        };

        insuredBtn.addEventListener('click', () => dispatch(0.75, '0.75x SAFE'));
        spikeBtn.addEventListener('click', () => dispatch(1.25, '1.25x BOLD'));

        row.append(insuredBtn, slip, spikeBtn);
        rack.appendChild(row);
      });
      break;
    }

    // ------------------------------------------------------------------------
    // 3. TOY_03_VERNIER_DIAL: *The Price Is Right* Living Color Range Dial
    //    Now with 60fps Damped Spring-Damper Rotor + Progressive #11 Marquee Bulbs!
    // ------------------------------------------------------------------------
    case 'TOY_03_VERNIER_DIAL': {
      appendShowcasePromptBanner(root, 'Spin the Range Dial & tap LOCK IN!');

      const num = resolveNumericPayload(clue);
      const span = Math.max(1e-6, num.max - num.min);
      const step = num.step > 0 ? num.step : 1;
      const decimals = step < 1 ? (String(step).split('.')[1]?.length ?? 1) : 0;

      let currentVal = num.min + span * 0.5;
      currentVal = Math.min(num.max, Math.max(num.min, Math.round(currentVal / step) * step));

      const layout = document.createElement('div');
      layout.className = 'ws7-vernier-layout';
      root.appendChild(layout);

      const wheelBox = document.createElement('div');
      wheelBox.className = 'ws7-vernier-wheel-box';

      const readoutCard = document.createElement('div');
      readoutCard.className = 'ws7-vernier-readout-card';

      const circumference = 2 * Math.PI * 92;
      const ticksSvg: string[] = [];
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        const r1 = i % 5 === 0 ? 60 : 68;
        const r2 = 77;
        ticksSvg.push(
          `<line x1="${(100 + Math.cos(a) * r1).toFixed(1)}" y1="${(100 + Math.sin(a) * r1).toFixed(1)}" x2="${(100 + Math.cos(a) * r2).toFixed(1)}" y2="${(100 + Math.sin(a) * r2).toFixed(1)}" stroke="#141B29" stroke-width="${i % 5 === 0 ? 2.6 : 1.3}" stroke-linecap="round"/>`,
        );
      }

      // 17 Perimeter #11 Tungsten Marquee Bulbs across [-140deg .. +140deg]
      const bulbsSvg: string[] = [];
      const bulbCount = 17;
      for (let b = 0; b < bulbCount; b++) {
        const deg = -140 + (b / (bulbCount - 1)) * 280;
        const rad = ((deg - 90) * Math.PI) / 180;
        const bx = 100 + Math.cos(rad) * 89;
        const by = 100 + Math.sin(rad) * 89;
        bulbsSvg.push(
          `<circle class="ws7-dial-bulb" data-bulb-idx="${b}" cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="3.3" fill="#234863" stroke="#091929" stroke-width="1"/>`,
        );
      }

      wheelBox.innerHTML = `
        <svg viewBox="0 0 200 200" width="100%" height="100%" style="display:block;overflow:visible;">
          <defs>
            <radialGradient id="ws7RangeDialCream" cx="46%" cy="38%" r="60%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="68%" stop-color="#FFF4DA"/>
              <stop offset="100%" stop-color="#EBD7B2"/>
            </radialGradient>
          </defs>
          <!-- Living Color Bezel Halo + #11 Marquee Bulbs -->
          <circle cx="100" cy="100" r="95" fill="#0D2238" stroke="#00B2C4" stroke-width="2.5"/>
          <circle class="ws7-dial-lock-arc" cx="100" cy="100" r="92" fill="none" stroke="#16A34A" stroke-width="6" stroke-linecap="round"
            stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${circumference.toFixed(1)}" transform="rotate(-90 100 100)"/>
          <g class="ws7-dial-bulbs">${bulbsSvg.join('')}</g>
          <!-- Top Atomic Tangerine Studio Pointer -->
          <polygon points="100,21 91,3 109,3" fill="#FF6738" stroke="#FFFDF7" stroke-width="1.6"/>
          <!-- Rotating 1966 Tricolor Studio Rotor -->
          <g class="ws7-dial-rotor" transform="rotate(0 100 100)">
            <circle cx="100" cy="100" r="80" fill="url(#ws7RangeDialCream)" stroke="#F4A91F" stroke-width="3.5"/>
            <path d="M100,100 L45,45 A78,78 0 0,1 155,45 Z" fill="#0096A6" fill-opacity="0.22"/>
            <path d="M100,100 L155,45 A78,78 0 0,1 171,131 Z" fill="#F4A91F" fill-opacity="0.25"/>
            ${ticksSvg.join('')}
            <!-- Sculpted Needle Arm & Hub -->
            <polygon points="100,26 95,94 105,94" fill="#FF6738"/>
            <circle cx="100" cy="40" r="9.5" fill="#FFFDF7" stroke="#FF6738" stroke-width="2.5"/>
            <circle cx="100" cy="100" r="22" fill="#0D2238" stroke="#FFD166" stroke-width="3"/>
            <circle cx="100" cy="100" r="8" fill="#00C2D6"/>
          </g>
        </svg>
      `;

      const unitSuffix = num.unit ? ` ${escHtml(num.unit)}` : '';
      readoutCard.innerHTML = `
        <div style="font-family:var(--ws7-toy-caps);font-size:14px;font-weight:800;color:#FFD166;letter-spacing:0.04em;text-align:center;">
          ${num.min} – ${num.max}${unitSuffix}
        </div>
        <div class="ws7-dial-value ws7-dial-solari-plaque"></div>
        <div class="ws7-dial-nudge-pair">
          <button type="button" class="ws7-step-nudge-btn" data-step-dir="-1" aria-label="Decrease value">−</button>
          <button type="button" class="ws7-step-nudge-btn" data-step-dir="1" aria-label="Increase value">+</button>
        </div>
        <button type="button" class="ws7-studio-lock-btn ws7-dial-lock-btn">LOCK IN!</button>
      `;

      layout.append(wheelBox, readoutCard);

      const rotorEl = wheelBox.querySelector('.ws7-dial-rotor') as SVGGElement;
      const lockArcEl = wheelBox.querySelector('.ws7-dial-lock-arc') as SVGCircleElement;
      const bulbEls = Array.from(wheelBox.querySelectorAll<SVGCircleElement>('.ws7-dial-bulb'));
      const valEl = readoutCard.querySelector('.ws7-dial-value') as HTMLDivElement;
      const lockBtn = readoutCard.querySelector('.ws7-dial-lock-btn') as HTMLButtonElement;
      const nudgeBtns = readoutCard.querySelectorAll<HTMLButtonElement>('.ws7-step-nudge-btn');

      const formatVal = (v: number): string =>
        `${v.toFixed(decimals)}${num.unit ? ` ${num.unit}` : ''}`;

      // Damped Spring-Damper Rotor State
      const initialRatio = (currentVal - num.min) / span;
      let targetDeg = -140 + initialRatio * 280;
      let visualDeg = targetDeg;
      let velDeg = 0;
      let springRaf = 0;
      let lastSpringMs = 0;

      const applyRotorAngle = (deg: number): void => {
        rotorEl.setAttribute('transform', `rotate(${deg.toFixed(2)} 100 100)`);
        const norm = Math.max(0, Math.min(1, (deg + 140) / 280));
        const litCount = Math.round(norm * (bulbCount - 1));
        bulbEls.forEach((bEl, idx) => {
          const lit = idx <= litCount;
          bEl.setAttribute('fill', lit ? '#FFD166' : '#234863');
          bEl.setAttribute('r', lit ? '3.8' : '3.1');
        });
      };

      const stepRotorSpring = (now: number): void => {
        if (disposed) return;
        const dt = Math.min(0.032, Math.max(0.001, (now - lastSpringMs) * 0.001));
        lastSpringMs = now;
        const force = (targetDeg - visualDeg) * 280;
        velDeg = (velDeg + force * dt) * Math.exp(-20 * dt);
        visualDeg += velDeg * dt;

        if (Math.abs(targetDeg - visualDeg) < 0.08 && Math.abs(velDeg) < 0.4) {
          visualDeg = targetDeg;
          velDeg = 0;
          applyRotorAngle(visualDeg);
          springRaf = 0;
          return;
        }
        applyRotorAngle(visualDeg);
        springRaf = requestAnimationFrame(stepRotorSpring);
      };

      const syncVisual = (immediate = false): void => {
        const ratio = (currentVal - num.min) / span;
        targetDeg = -140 + ratio * 280;
        valEl.textContent = formatVal(currentVal);
        if (immediate || context.reducedMotion) {
          visualDeg = targetDeg;
          velDeg = 0;
          applyRotorAngle(visualDeg);
          return;
        }
        if (!springRaf) {
          lastSpringMs = performance.now();
          springRaf = requestAnimationFrame(stepRotorSpring);
        }
      };
      syncVisual(true);
      cleanups.push(() => {
        if (springRaf) cancelAnimationFrame(springRaf);
      });

      let dragging = false;
      let lastAngle: number | null = null;
      let lastX = 0;

      const commitDialSelection = (): void => {
        if (resolved || disposed) return;
        context.onTactileSfx?.('THROW_SNAP');
        lockArcEl.style.strokeDashoffset = '0';
        lockBtn.textContent = 'LOCKED IN!';
        lockBtn.style.background = 'linear-gradient(180deg, #16A34A 0%, #117A37 100%)';

        const errRatio = Math.abs(currentVal - num.target) / span;
        let accuracyRatio = 0;
        let chipMultiplier = 0;
        if (errRatio <= 0.08) {
          accuracyRatio = 1.0;
          chipMultiplier = 1.0;
        } else if (errRatio <= 0.18) {
          accuracyRatio = 0.6;
          chipMultiplier = 0.6;
        }
        schedule(() => {
          emitOnce({
            isCorrect: accuracyRatio > 0,
            accuracyRatio,
            chipMultiplier,
            chosenSummary: formatVal(currentVal),
            trueAnswerDisplay: formatVal(num.target),
            triggeredKlaxon: accuracyRatio === 0 && Boolean(clue.isKlaxonMyth),
            fellForPoisonedFix: false,
          });
        }, 180);
      };

      nudgeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          if (resolved || disposed) return;
          const dir = Number(btn.dataset.stepDir ?? 1);
          const fineStep = Math.max(step, Number((span / 40).toFixed(decimals)) || step);
          const snapped = Math.round((currentVal + dir * fineStep) / step) * step;
          currentVal = Math.max(num.min, Math.min(num.max, Number(snapped.toFixed(decimals))));
          context.onTactileSfx?.('DETENT');
          syncVisual(false);
        });
      });

      lockBtn.addEventListener('click', commitDialSelection);

      const updateFromPointer = (clientX: number, clientY: number, snapDirectAngle: boolean): void => {
        const rect = wheelBox.getBoundingClientRect();
        const cx = rect.left + rect.width * 0.5;
        const cy = rect.top + rect.height * 0.5;
        const dx = clientX - cx;
        const dy = clientY - cy;
        const r = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        if (snapDirectAngle && r > 18) {
          let relDeg = ((angle + Math.PI * 0.5) * 180) / Math.PI;
          if (relDeg > 180) relDeg -= 360;
          if (relDeg < -180) relDeg += 360;
          const clampedRatio = Math.max(0, Math.min(1, (relDeg + 140) / 280));
          const stepped = Math.round((num.min + clampedRatio * span) / step) * step;
          currentVal = Math.max(num.min, Math.min(num.max, Number(stepped.toFixed(decimals))));
          lastAngle = angle;
          context.onTactileSfx?.('DETENT');
          syncVisual(false);
          return;
        }

        if (lastAngle !== null && r > 16) {
          let dAng = angle - lastAngle;
          if (dAng > Math.PI) dAng -= Math.PI * 2;
          if (dAng < -Math.PI) dAng += Math.PI * 2;
          const deltaVal = (dAng / ((280 * Math.PI) / 180)) * span;
          const next = Math.max(num.min, Math.min(num.max, currentVal + deltaVal));
          const snapped = Math.round(next / step) * step;
          if (snapped !== currentVal) {
            currentVal = Number(snapped.toFixed(decimals));
            context.onTactileSfx?.('DETENT');
            syncVisual(false);
          }
          lastAngle = angle;
        } else {
          const dxMove = clientX - lastX;
          const next = Math.max(num.min, Math.min(num.max, currentVal + (dxMove / 160) * span));
          const snapped = Math.round(next / step) * step;
          if (snapped !== currentVal) {
            currentVal = Number(snapped.toFixed(decimals));
            context.onTactileSfx?.('DETENT');
            syncVisual(false);
          }
        }
        lastX = clientX;
      };

      wheelBox.addEventListener('pointerdown', (e: PointerEvent) => {
        if (resolved || disposed) return;
        dragging = true;
        lastX = e.clientX;
        lastAngle = null;
        try {
          wheelBox.setPointerCapture(e.pointerId);
        } catch {
          // Synthetic test pointer safety
        }
        updateFromPointer(e.clientX, e.clientY, true);
      });

      wheelBox.addEventListener('pointermove', (e: PointerEvent) => {
        if (!dragging || resolved || disposed) return;
        updateFromPointer(e.clientX, e.clientY, false);
      });

      const finishTurn = (e: PointerEvent): void => {
        if (!dragging || resolved || disposed) return;
        dragging = false;
        try {
          if (wheelBox.hasPointerCapture(e.pointerId)) {
            wheelBox.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Safe release
        }
      };

      wheelBox.addEventListener('pointerup', finishTurn);
      wheelBox.addEventListener('pointercancel', finishTurn);
      break;
    }

    // ------------------------------------------------------------------------
    // 4. TOY_04_BALANCE_SCALE: Golden Studio Twin-Pan Scale
    //    Damped Pendulum Beam + Gravity-Plumb Pans + Weston Zero-Balance Needle!
    // ------------------------------------------------------------------------
    case 'TOY_04_BALANCE_SCALE': {
      const bal = resolveBalancePayload(clue);
      const isCuratedBalanceClue = Boolean(clue.balance);
      const unitStr = bal.unit ? ` ${bal.unit}` : '';
      appendShowcasePromptBanner(
        root,
        isCuratedBalanceClue
          ? `Tap the 2 Studio Weights whose values sum to ${bal.targetSum}${unitStr}!`
          : `Pair the True Answer (60 G) + Counterweight (40 G) to balance 100 G!`,
      );

      const selected: number[] = [];

      const stage = document.createElement('div');
      stage.className = 'ws7-scale-svg-wrap';
      const wrapper = document.createElement('div');
      wrapper.className = 'ws7-scale-stage';

      stage.innerHTML = `
        <svg viewBox="0 0 420 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <!-- Weston Zero-Balance Dial Arc -->
          <path d="M182,24 A34,34 0 0,1 238,24" fill="none" stroke="#FFF6E3" stroke-width="2" stroke-opacity="0.5"/>
          <path d="M204,13 A34,34 0 0,1 216,13" fill="none" stroke="#2ECC71" stroke-width="4" stroke-linecap="round"/>
          <!-- Center Studio Pillar -->
          <polygon points="200,114 220,114 214,34 206,34" fill="#F4A91F" stroke="#FFFDF7" stroke-width="1.4"/>
          <rect x="164" y="109" width="92" height="8" rx="4" fill="#00B2C4"/>
          <!-- Damped Tilting Beam Group (Pivot at 210, 38) -->
          <g class="ws7-scale-beam" transform="rotate(-12 210 38)">
            <rect x="64" y="35" width="292" height="6.5" rx="3.2" fill="#FFD166" stroke="#FFFDF7" stroke-width="1.2"/>
            <!-- Center Balance Pointer Needle -->
            <polygon class="ws7-scale-needle" points="210,11 206,36 214,36" fill="#FF6738"/>
            <circle cx="210" cy="38" r="5.5" fill="#0D2238" stroke="#FFFDF7" stroke-width="1.6"/>
            <!-- Gravity-Plumb Left Target Pan (Counter-Rotates around 84, 38!) -->
            <g class="ws7-left-pan-plumb" transform="rotate(12 84 38)">
              <line x1="84" y1="38" x2="62" y2="80" stroke="#FFF6E3" stroke-width="1.8"/>
              <line x1="84" y1="38" x2="106" y2="80" stroke="#FFF6E3" stroke-width="1.8"/>
              <path d="M44,80 Q84,92 124,80 Z" fill="#F4A91F" stroke="#FFFDF7" stroke-width="1.4"/>
              <rect x="34" y="52" width="100" height="28" rx="8" fill="#FF6738"/>
              <text x="84" y="71" text-anchor="middle" fill="#FFFDF7" font-family="Jost, sans-serif" font-size="15" font-weight="900">GOAL ${bal.targetSum}</text>
            </g>
            <!-- Gravity-Plumb Right Player Sum Pan (Counter-Rotates around 336, 38!) -->
            <g class="ws7-right-pan-plumb" transform="rotate(12 336 38)">
              <line x1="336" y1="38" x2="314" y2="80" stroke="#FFF6E3" stroke-width="1.8"/>
              <line x1="336" y1="38" x2="358" y2="80" stroke="#FFF6E3" stroke-width="1.8"/>
              <path d="M296,80 Q336,92 376,80 Z" fill="#F4A91F" stroke="#FFFDF7" stroke-width="1.4"/>
              <rect class="ws7-right-pan-badge" x="286" y="52" width="100" height="28" rx="8" fill="#0096A6"/>
              <text class="ws7-right-pan-sum" x="336" y="71" text-anchor="middle" fill="#FFFDF7" font-family="Jost, sans-serif" font-size="15" font-weight="900">SUM 0</text>
            </g>
          </g>
        </svg>
      `;

      const rack = document.createElement('div');
      rack.className = 'ws7-weights-rack';

      const beamEl = stage.querySelector('.ws7-scale-beam') as SVGGElement;
      const leftPlumbEl = stage.querySelector('.ws7-left-pan-plumb') as SVGGElement;
      const rightPlumbEl = stage.querySelector('.ws7-right-pan-plumb') as SVGGElement;
      const needleEl = stage.querySelector('.ws7-scale-needle') as SVGPolygonElement;
      const rightBadgeEl = stage.querySelector('.ws7-right-pan-badge') as SVGRectElement;
      const panSumEl = stage.querySelector('.ws7-right-pan-sum') as SVGTextElement;
      const weightBtns: HTMLButtonElement[] = [];

      let targetBeamDeg = -12;
      let curBeamDeg = -12;
      let beamVel = 0;
      let beamRaf = 0;
      let lastBeamMs = 0;

      const applyBeamAngle = (deg: number): void => {
        beamEl.setAttribute('transform', `rotate(${deg.toFixed(2)} 210 38)`);
        leftPlumbEl.setAttribute('transform', `rotate(${(-deg).toFixed(2)} 84 38)`);
        rightPlumbEl.setAttribute('transform', `rotate(${(-deg).toFixed(2)} 336 38)`);
        const balanced = Math.abs(deg) < 1.2;
        needleEl.setAttribute('fill', balanced ? '#2ECC71' : '#FF6738');
        rightBadgeEl.setAttribute('fill', balanced ? '#16A34A' : '#0096A6');
      };

      const stepBeamSpring = (now: number): void => {
        if (disposed) return;
        const dt = Math.min(0.032, Math.max(0.001, (now - lastBeamMs) * 0.001));
        lastBeamMs = now;
        const accel = (targetBeamDeg - curBeamDeg) * 150;
        beamVel = (beamVel + accel * dt) * Math.exp(-11 * dt);
        curBeamDeg += beamVel * dt;

        if (Math.abs(targetBeamDeg - curBeamDeg) < 0.05 && Math.abs(beamVel) < 0.2) {
          curBeamDeg = targetBeamDeg;
          beamVel = 0;
          applyBeamAngle(curBeamDeg);
          beamRaf = 0;
          return;
        }
        applyBeamAngle(curBeamDeg);
        beamRaf = requestAnimationFrame(stepBeamSpring);
      };

      cleanups.push(() => {
        if (beamRaf) cancelAnimationFrame(beamRaf);
      });

      const updateScale = (): void => {
        const sum = selected.reduce((acc, idx) => acc + bal.weights[idx].value, 0);
        panSumEl.textContent = `SUM ${sum}`;
        const diff = sum - bal.targetSum;
        targetBeamDeg = Math.max(-14, Math.min(14, (diff / Math.max(1, bal.targetSum)) * 26));
        if (context.reducedMotion) {
          curBeamDeg = targetBeamDeg;
          applyBeamAngle(curBeamDeg);
        } else if (!beamRaf) {
          lastBeamMs = performance.now();
          beamRaf = requestAnimationFrame(stepBeamSpring);
        }

        weightBtns.forEach((btn, idx) => {
          btn.classList.toggle('is-on-pan', selected.includes(idx));
        });

        if (selected.length === 2) {
          const isExact =
            Math.abs(sum - bal.targetSum) < 0.01 ||
            (selected.includes(bal.validPair[0]) && selected.includes(bal.validPair[1]));
          const chosenLabels = `${bal.weights[selected[0]].label} + ${bal.weights[selected[1]].label} (${sum}${bal.unit ? ` ${bal.unit}` : ''})`;
          const trueLabels = `${bal.weights[bal.validPair[0]].label} + ${bal.weights[bal.validPair[1]].label} (${bal.targetSum}${bal.unit ? ` ${bal.unit}` : ''})`;
          schedule(() => {
            emitOnce({
              isCorrect: isExact,
              accuracyRatio: isExact ? 1.0 : 0.0,
              chipMultiplier: isExact ? 1.0 : 0.0,
              chosenSummary: chosenLabels,
              trueAnswerDisplay: trueLabels,
              triggeredKlaxon: !isExact && Boolean(clue.isKlaxonMyth),
              fellForPoisonedFix: false,
            });
          }, 280);
        }
      };

      bal.weights.forEach((w, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ws7-brass-weight';
        btn.dataset.weightIdx = String(idx);
        btn.innerHTML = `
          <span style="font-family:var(--ws7-toy-caps);font-size:15px;font-weight:900;line-height:1.12;">${w.value}${bal.unit ? ` ${escHtml(bal.unit)}` : ''}</span>
          <span style="font-size:14px;font-weight:700;line-height:1.15;margin-top:2px;overflow-wrap:break-word;">${escHtml(w.label)}</span>
        `;
        btn.addEventListener('click', () => {
          if (resolved || disposed || selected.length >= 2) return;
          const pos = selected.indexOf(idx);
          if (pos >= 0) {
            selected.splice(pos, 1);
          } else {
            selected.push(idx);
          }
          context.onTactileSfx?.('TICK');
          updateScale();
        });
        weightBtns.push(btn);
        rack.appendChild(btn);
      });

      wrapper.append(stage, rack);
      root.appendChild(wrapper);
      break;
    }

    // ------------------------------------------------------------------------
    // 5. TOY_05_RELIEF_GLOBE_3D: 1966 Mid-Century World Atlas Studio Globe
    // ------------------------------------------------------------------------
    case 'TOY_05_RELIEF_GLOBE_3D': {
      appendShowcasePromptBanner(root, 'Tap the spot on the World Globe!');

      const geo = resolveGeoPayload(clue);
      const globeHost = document.createElement('div');
      globeHost.style.cssText = 'width:100%;height:clamp(192px,32vh,252px);';
      root.appendChild(globeHost);

      const globe = mountReliefGlobeContraptionV7(globeHost, {
        targetLat: geo.lat,
        targetLng: geo.lng,
        landmarkLabel: geo.landmarkLabel,
        regionHint: geo.regionHint,
        reducedMotion: context.reducedMotion,
        confirmLockMs: 280,
        revealDwellMs: 360,
        onPinPlanted: () => context.onTactileSfx?.('PIN_PLANT'),
        onLock: (result) => {
          const isHit = result.accuracyRatio > 0;
          emitOnce({
            isCorrect: isHit,
            accuracyRatio: result.accuracyRatio,
            chipMultiplier: result.chipMultiplier,
            chosenSummary: `${result.distanceKm} KM from ${geo.landmarkLabel}`,
            trueAnswerDisplay: geo.landmarkLabel,
            triggeredKlaxon: !isHit && Boolean(clue.isKlaxonMyth),
            fellForPoisonedFix: false,
          });
        },
      });
      cleanups.push(() => globe.dispose());
      break;
    }

    // ------------------------------------------------------------------------
    // 6. TOY_06_FUSE_WIRE_SNIPPER: Studio Cable Cutout + Bank Cash Lever
    // ------------------------------------------------------------------------
    case 'TOY_06_FUSE_WIRE_SNIPPER': {
      appendShowcasePromptBanner(root, 'Cut wrong Studio Cables for 1.5× — or tap BANK CASH!');

      const snippedSet = new Set<number>();
      const wireColors = ['#FF6738', '#0096A6', '#1E56C5', '#E63B7A'];

      const layout = document.createElement('div');
      layout.className = 'ws7-fuse-layout';

      const wiresCol = document.createElement('div');
      wiresCol.className = 'ws7-fuse-wires-col';

      const bailoutBtn = document.createElement('button');
      bailoutBtn.type = 'button';
      bailoutBtn.className = 'ws7-bailout-latch';
      bailoutBtn.disabled = true;

      const syncBailout = (): void => {
        const count = snippedSet.size;
        const mult = count === 1 ? 0.85 : count === 2 ? 1.15 : 0;
        if (count >= 1 && count <= 2) {
          bailoutBtn.disabled = false;
          bailoutBtn.classList.add('is-armed');
          bailoutBtn.innerHTML = `
            <span style="font-size:14px;">BANK CASH!</span>
            <span style="font-size:20px;font-weight:900;">${mult.toFixed(2)}×</span>
            <span style="font-size:14px;">SAFE LOCK</span>
          `;
        } else {
          bailoutBtn.disabled = true;
          bailoutBtn.classList.remove('is-armed');
          bailoutBtn.innerHTML = `
            <span style="font-size:14px;color:#FFD166;">BANK CASH</span>
            <span style="font-size:14px;">CUT 1 WRONG FIRST</span>
          `;
        }
      };
      syncBailout();

      clue.choices.forEach((choiceText, idx) => {
        const wireBtn = document.createElement('button');
        wireBtn.type = 'button';
        wireBtn.className = 'ws7-fuse-wire-btn ws7-cream-plaque';
        wireBtn.dataset.wireIdx = String(idx);
        const wireHex = wireColors[idx % wireColors.length];

        const renderWireGraphic = (cut: boolean): string =>
          cut
            ? `<svg width="44" height="24" viewBox="0 0 44 24" aria-hidden="true"><circle cx="6" cy="12" r="4.5" fill="#0D2238"/><path d="M10,12 Q15,5 18,16" fill="none" stroke="${wireHex}" stroke-width="4.5" stroke-linecap="round"/><path d="M34,12 Q29,19 26,8" fill="none" stroke="${wireHex}" stroke-width="4.5" stroke-linecap="round"/><circle cx="22" cy="12" r="3" fill="#FFD166"/><circle cx="38" cy="12" r="4.5" fill="#0D2238"/></svg>`
            : `<svg width="44" height="24" viewBox="0 0 44 24" aria-hidden="true"><circle cx="6" cy="12" r="4.5" fill="#0D2238"/><line x1="10" y1="12" x2="34" y2="12" stroke="${wireHex}" stroke-width="5.2" stroke-linecap="round"/><line x1="12" y1="10.8" x2="32" y2="10.8" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="1.2"/><circle cx="38" cy="12" r="4.5" fill="#0D2238"/></svg>`;

        const updateWireContent = (cut: boolean): void => {
          wireBtn.innerHTML = `
            <div style="flex:0 0 44px;display:flex;align-items:center;">${renderWireGraphic(cut)}</div>
            <div style="flex:1 1 auto;min-width:0;">
              <div class="ws7-choice-copy">${escHtml(choiceText)}</div>
              ${renderDiegeticChoiceOverlaysHtml(clue, idx, context)}
            </div>
          `;
        };
        updateWireContent(false);

        wireBtn.addEventListener('click', () => {
          if (resolved || disposed || snippedSet.has(idx)) return;
          context.onTactileSfx?.('WIRE_SNIP');
          updateWireContent(true);
          wireBtn.classList.add('is-snipped');

          if (idx === clue.answerIdx) {
            wireBtn.style.boxShadow = '0 0 0 3px #E03E36';
            schedule(() => {
              emitOnce({
                isCorrect: false,
                accuracyRatio: 0.0,
                chipMultiplier: 0.0,
                chosenSummary: `Cut true cable: ${choiceText}`,
                trueAnswerDisplay: clue.choices[clue.answerIdx],
                triggeredKlaxon: Boolean(clue.isKlaxonMyth),
                fellForPoisonedFix: false,
              });
            }, 200);
            return;
          }

          snippedSet.add(idx);
          if (snippedSet.size >= 3) {
            schedule(() => {
              emitOnce({
                isCorrect: true,
                accuracyRatio: 1.0,
                chipMultiplier: 1.5,
                chosenSummary: `Isolated ${clue.choices[clue.answerIdx]} (1.50×)`,
                trueAnswerDisplay: clue.choices[clue.answerIdx],
                triggeredKlaxon: false,
                fellForPoisonedFix: false,
              });
            }, 200);
          } else {
            syncBailout();
          }
        });

        wiresCol.appendChild(wireBtn);
      });

      bailoutBtn.addEventListener('click', () => {
        if (resolved || disposed || snippedSet.size === 0) return;
        const mult = snippedSet.size === 1 ? 0.85 : 1.15;
        context.onTactileSfx?.('THROW_SNAP');
        emitOnce({
          isCorrect: true,
          accuracyRatio: 1.0,
          chipMultiplier: mult,
          chosenSummary: `Banked Cash (${mult.toFixed(2)}× after ${snippedSet.size} cut${snippedSet.size > 1 ? 's' : ''})`,
          trueAnswerDisplay: clue.choices[clue.answerIdx],
          triggeredKlaxon: false,
          fellForPoisonedFix: false,
        });
      });

      layout.append(wiresCol, bailoutBtn);
      root.appendChild(layout);
      break;
    }

    // ------------------------------------------------------------------------
    // 7. TOY_07_MAIL_SORTER: 1966 Studio Mailbag Twin-Chute Sorter
    // ------------------------------------------------------------------------
    case 'TOY_07_MAIL_SORTER': {
      appendShowcasePromptBanner(root, 'Tap Left or Right Chute (or swipe card) to sort all 4!');

      const sorter = resolveSorterPayload(clue);
      const cards = sorter.items.slice(0, 4);
      let cardIdx = 0;
      let correctCount = 0;

      const layout = document.createElement('div');
      layout.className = 'ws7-sorter-layout';

      const leftBtn = document.createElement('button');
      leftBtn.type = 'button';
      leftBtn.className = 'ws7-chute-btn';
      leftBtn.dataset.chute = '0';
      leftBtn.innerHTML = `<span style="color:#FFE89E;font-size:14px;">&larr; CHUTE A</span><span style="font-size:15px;">${escHtml(sorter.chuteALabel)}</span>`;

      const centerDeck = document.createElement('div');
      centerDeck.className = 'ws7-cream-plaque';
      centerDeck.style.cssText =
        'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center;position:relative;touch-action:pan-y;cursor:grab;transition:transform 0.14s ease, opacity 0.14s ease;';

      const rightBtn = document.createElement('button');
      rightBtn.type = 'button';
      rightBtn.className = 'ws7-chute-btn';
      rightBtn.dataset.chute = '1';
      rightBtn.innerHTML = `<span style="color:#FFE89E;font-size:14px;">CHUTE B &rarr;</span><span style="font-size:15px;">${escHtml(sorter.chuteBLabel)}</span>`;

      const renderActiveCard = (): void => {
        if (cardIdx >= cards.length) return;
        const item = cards[cardIdx];
        const dots = cards
          .map(
            (_, dIdx) =>
              `<span style="width:9px;height:9px;border-radius:50%;display:inline-block;background:${dIdx < cardIdx ? '#16A34A' : dIdx === cardIdx ? '#1E56C5' : '#C8B99B'};"></span>`,
          )
          .join('');
        centerDeck.style.transform = 'translateX(0) rotate(0deg)';
        centerDeck.style.opacity = '1';
        centerDeck.innerHTML = `
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;" aria-hidden="true">${dots}</div>
          <div style="font-family:var(--ws7-toy-caps);font-size:14px;font-weight:900;color:#1E56C5;margin-bottom:4px;">CARD ${cardIdx + 1} OF ${cards.length}</div>
          <div class="ws7-choice-copy" style="font-size:clamp(16px,2.2vw,18px);">${escHtml(item.label)}</div>
        `;
      };
      renderActiveCard();

      let sorting = false;
      const sortInto = (chute: 0 | 1): void => {
        if (resolved || disposed || sorting || cardIdx >= cards.length) return;
        sorting = true;
        if (cards[cardIdx].chute === chute) {
          correctCount += 1;
        }
        context.onTactileSfx?.('CHUTE_SWOOSH');
        if (!context.reducedMotion) {
          centerDeck.style.transform =
            chute === 0 ? 'translateX(-22px) rotate(-3deg)' : 'translateX(22px) rotate(3deg)';
          centerDeck.style.opacity = '0.45';
        }
        cardIdx += 1;

        if (cardIdx >= cards.length) {
          const passed = correctCount >= 3;
          const accuracyRatio = passed ? correctCount / cards.length : 0.0;
          const chipMultiplier = correctCount === 4 ? 1.15 : passed ? 0.85 : 0.0;
          schedule(() => {
            emitOnce({
              isCorrect: passed,
              accuracyRatio,
              chipMultiplier,
              chosenSummary: `Sorted ${correctCount}/${cards.length} cue cards`,
              trueAnswerDisplay: `${sorter.chuteALabel} vs ${sorter.chuteBLabel} (${correctCount}/${cards.length})`,
              triggeredKlaxon: !passed && Boolean(clue.isKlaxonMyth),
              fellForPoisonedFix: false,
            });
          }, 160);
        } else {
          schedule(() => {
            sorting = false;
            renderActiveCard();
          }, 95);
        }
      };

      leftBtn.addEventListener('click', () => sortInto(0));
      rightBtn.addEventListener('click', () => sortInto(1));

      let swipeStartX: number | null = null;
      centerDeck.addEventListener('pointerdown', (e: PointerEvent) => {
        swipeStartX = e.clientX;
      });
      centerDeck.addEventListener('pointerup', (e: PointerEvent) => {
        if (swipeStartX === null) return;
        const dx = e.clientX - swipeStartX;
        swipeStartX = null;
        if (dx <= -32) sortInto(0);
        else if (dx >= 32) sortInto(1);
      });

      layout.append(leftBtn, centerDeck, rightBtn);
      root.appendChild(layout);
      break;
    }

    // ------------------------------------------------------------------------
    // 8. TOY_08_CHRONOLOGY_RAIL: 1966 Time-Tunnel Broadcast Timeline
    // ------------------------------------------------------------------------
    case 'TOY_08_CHRONOLOGY_RAIL': {
      appendShowcasePromptBanner(root, 'Tap the plaques in order from EARLIEST to LATEST!');

      const chrono = resolveChronologyPayload(clue);
      const count = Math.min(4, Math.max(3, chrono.events.length));
      const trueOrder = chrono.events
        .slice(0, count)
        .map((ev, origIdx) => ({ ...ev, origIdx }))
        .sort((a, b) => a.year - b.year);

      const displayPlaques = [...trueOrder];
      const shift = (Math.abs(clue.qid) % (count - 1)) + 1;
      const rotated = displayPlaques.slice(shift).concat(displayPlaques.slice(0, shift));

      const placedRotatedIndices: number[] = [];
      const ordinals = ['1ST →', '2ND →', '3RD →', '4TH'];

      const layout = document.createElement('div');
      layout.className = 'ws7-chrono-layout';

      const sleepersRow = document.createElement('div');
      sleepersRow.className = 'ws7-sleepers-row';
      sleepersRow.style.gridTemplateColumns = `repeat(${count}, minmax(0, 1fr))`;

      const plaquesGrid = document.createElement('div');
      plaquesGrid.className = 'ws7-plaques-grid';

      const sleeperEls: HTMLButtonElement[] = [];
      const plaqueBtns: HTMLButtonElement[] = [];

      const refreshRail = (): void => {
        sleeperEls.forEach((slotEl, slotIdx) => {
          const rotIdx = placedRotatedIndices[slotIdx];
          const ordLabel = slotIdx === count - 1 ? `${slotIdx + 1}TH` : ordinals[slotIdx];
          if (rotIdx !== undefined) {
            const item = rotated[rotIdx];
            slotEl.classList.add('is-filled');
            slotEl.innerHTML = `<span style="font-size:14px;font-weight:900;color:#008B9A;">${ordLabel}</span><span style="font-size:14px;font-weight:700;">${escHtml(item.label)}</span>`;
          } else {
            slotEl.classList.remove('is-filled');
            slotEl.innerHTML = `<span style="font-size:14px;">${ordLabel}</span><span style="font-size:14px;color:#FFF6E3;">${slotIdx === 0 ? 'EARLIEST' : slotIdx === count - 1 ? 'LATEST' : 'NEXT'}</span>`;
          }
        });

        plaqueBtns.forEach((btn, rIdx) => {
          btn.classList.toggle('is-placed', placedRotatedIndices.includes(rIdx));
        });

        if (placedRotatedIndices.length === count) {
          const ranks = placedRotatedIndices.map((rIdx) => trueOrder.indexOf(rotated[rIdx]));
          let inversions = 0;
          for (let i = 0; i < ranks.length; i++) {
            for (let j = i + 1; j < ranks.length; j++) {
              if (ranks[i] > ranks[j]) inversions += 1;
            }
          }
          const accuracyRatio = inversions === 0 ? 1.0 : inversions === 1 ? 0.5 : 0.0;
          const chipMultiplier = inversions === 0 ? 1.0 : inversions === 1 ? 0.5 : 0.0;
          const summary = placedRotatedIndices.map((rIdx) => rotated[rIdx].label).join(' -> ');
          const truthSummary = trueOrder
            .map((e) => `${e.label} (${e.displayYear})`)
            .join(' -> ');

          schedule(() => {
            emitOnce({
              isCorrect: accuracyRatio > 0,
              accuracyRatio,
              chipMultiplier,
              chosenSummary: summary,
              trueAnswerDisplay: truthSummary,
              triggeredKlaxon: accuracyRatio === 0 && Boolean(clue.isKlaxonMyth),
              fellForPoisonedFix: false,
            });
          }, 220);
        }
      };

      for (let s = 0; s < count; s++) {
        const slotBtn = document.createElement('button');
        slotBtn.type = 'button';
        slotBtn.className = 'ws7-sleeper-slot';
        slotBtn.addEventListener('click', () => {
          if (resolved || disposed || placedRotatedIndices.length >= count) return;
          if (placedRotatedIndices[s] !== undefined) {
            placedRotatedIndices.splice(s, 1);
            refreshRail();
          }
        });
        sleeperEls.push(slotBtn);
        sleepersRow.appendChild(slotBtn);
      }

      rotated.forEach((item, rIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ws7-plaque-btn ws7-cream-plaque';
        btn.dataset.plaqueIdx = String(rIdx);
        btn.innerHTML = `<div class="ws7-choice-copy">${escHtml(item.label)}</div>`;
        btn.addEventListener('click', () => {
          if (resolved || disposed || placedRotatedIndices.includes(rIdx)) return;
          placedRotatedIndices.push(rIdx);
          context.onTactileSfx?.('THROW_SNAP');
          refreshRail();
        });
        plaqueBtns.push(btn);
        plaquesGrid.appendChild(btn);
      });

      refreshRail();
      layout.append(sleepersRow, plaquesGrid);
      root.appendChild(layout);
      break;
    }

    // ------------------------------------------------------------------------
    // 9. TOY_09_SWITCHBOARD_PATCHBAY: 1966 Network Control Patchboard
    // ------------------------------------------------------------------------
    case 'TOY_09_SWITCHBOARD_PATCHBAY': {
      appendShowcasePromptBanner(root, 'Tap a Left Line, then tap its matching Right Studio Jack!');

      const patch = resolvePatchbayPayload(clue);
      const connections: Array<number | null> = [null, null, null];
      let armedCaller = 0;

      const stage = document.createElement('div');
      stage.className = 'ws7-patchbay-stage';

      const leftCol = document.createElement('div');
      leftCol.className = 'ws7-patch-col';

      const alleySpacer = document.createElement('div');
      alleySpacer.style.cssText = 'width:48px;height:100%;';

      const rightCol = document.createElement('div');
      rightCol.className = 'ws7-patch-col';

      const cordSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      cordSvg.setAttribute(
        'style',
        'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;',
      );

      const callerBtns: HTMLButtonElement[] = [];
      const jackBtns: HTMLButtonElement[] = [];
      const jackLampEls: HTMLSpanElement[] = [];
      const cordColors = ['#FF6738', '#F4A91F', '#00C2D1'];

      const drawCatenaryCords = (dragPt?: { x: number; y: number }): void => {
        const hostRect = stage.getBoundingClientRect();
        if (hostRect.width <= 0) return;
        const paths: string[] = [];

        jackLampEls.forEach((lampEl, jIdx) => {
          const pluggedCaller = connections.indexOf(jIdx);
          if (pluggedCaller >= 0) {
            lampEl.style.background = cordColors[pluggedCaller];
            lampEl.style.boxShadow = `0 0 10px ${cordColors[pluggedCaller]}`;
          } else {
            lampEl.style.background = '#0D2238';
            lampEl.style.boxShadow = 'inset 0 0 0 3px #F4A91F';
          }
        });

        connections.forEach((jackIdx, cIdx) => {
          if (jackIdx === null) return;
          const cRect = callerBtns[cIdx].getBoundingClientRect();
          const jRect = jackBtns[jackIdx].getBoundingClientRect();
          const x1 = cRect.right - hostRect.left - 6;
          const y1 = cRect.top + cRect.height * 0.5 - hostRect.top;
          const x2 = jRect.left - hostRect.left + 6;
          const y2 = jRect.top + jRect.height * 0.5 - hostRect.top;
          const sag = Math.min(36, 16 + Math.abs(x2 - x1) * 0.2);
          const mx = (x1 + x2) * 0.5;
          const my = Math.max(y1, y2) + sag;
          paths.push(
            `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${cordColors[cIdx]}" stroke-width="5.5" stroke-linecap="round"/>`,
            `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="#FFFDF7" stroke-width="1.4" stroke-dasharray="4 4" stroke-linecap="round"/>`,
          );
        });

        if (dragPt) {
          const cRect = callerBtns[armedCaller].getBoundingClientRect();
          const x1 = cRect.right - hostRect.left - 6;
          const y1 = cRect.top + cRect.height * 0.5 - hostRect.top;
          const x2 = dragPt.x - hostRect.left;
          const y2 = dragPt.y - hostRect.top;
          const mx = (x1 + x2) * 0.5;
          const my = Math.max(y1, y2) + 20;
          paths.push(
            `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${cordColors[armedCaller]}" stroke-width="4.5" stroke-linecap="round"/>`,
          );
        }

        cordSvg.innerHTML = paths.join('');
      };

      const syncArmedState = (): void => {
        callerBtns.forEach((btn, cIdx) => {
          btn.classList.toggle('is-armed', cIdx === armedCaller && !resolved);
        });
        drawCatenaryCords();
      };

      const connectCallerToJack = (cIdx: number, jIdx: number): void => {
        if (resolved || disposed) return;
        for (let i = 0; i < 3; i++) {
          if (connections[i] === jIdx) connections[i] = null;
        }
        connections[cIdx] = jIdx;
        context.onTactileSfx?.('THROW_SNAP');

        const nextOpen = connections.findIndex((v) => v === null);
        if (nextOpen >= 0) {
          armedCaller = nextOpen;
          syncArmedState();
        } else {
          syncArmedState();
          const allCorrect =
            connections[0] === patch.correctMapping[0] &&
            connections[1] === patch.correctMapping[1] &&
            connections[2] === patch.correctMapping[2];
          const chosenSummary = connections
            .map((j, i) => `${patch.callers[i]} -> ${patch.jacks[j ?? 0]}`)
            .join(', ');
          const trueSummary = patch.correctMapping
            .map((j, i) => `${patch.callers[i]} -> ${patch.jacks[j]}`)
            .join(', ');

          schedule(() => {
            emitOnce({
              isCorrect: allCorrect,
              accuracyRatio: allCorrect ? 1.0 : 0.0,
              chipMultiplier: allCorrect ? 1.0 : 0.0,
              chosenSummary,
              trueAnswerDisplay: trueSummary,
              triggeredKlaxon: !allCorrect && Boolean(clue.isKlaxonMyth),
              fellForPoisonedFix: false,
            });
          }, 220);
        }
      };

      patch.callers.forEach((callerLabel, cIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ws7-caller-plug ws7-cream-plaque';
        btn.dataset.callerIdx = String(cIdx);
        btn.innerHTML = `
          <span class="ws7-choice-copy" style="font-size:14px;">${escHtml(callerLabel)}</span>
          <span style="width:16px;height:16px;border-radius:50%;background:${cordColors[cIdx]};box-shadow:inset 0 0 0 2px #0D2238;flex:0 0 16px;"></span>
        `;
        btn.addEventListener('pointerdown', () => {
          if (resolved || disposed) return;
          armedCaller = cIdx;
          syncArmedState();
          const onMove = (me: PointerEvent): void =>
            drawCatenaryCords({ x: me.clientX, y: me.clientY });
          const onUp = (ue: PointerEvent): void => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            const hitEl = document
              .elementFromPoint(ue.clientX, ue.clientY)
              ?.closest('[data-jack-idx]') as HTMLElement | null;
            if (hitEl && hitEl.dataset.jackIdx !== undefined) {
              connectCallerToJack(cIdx, Number(hitEl.dataset.jackIdx));
            } else {
              drawCatenaryCords();
            }
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        });
        callerBtns.push(btn);
        leftCol.appendChild(btn);
      });

      patch.jacks.forEach((jackLabel, jIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ws7-jack-socket ws7-cream-plaque';
        btn.dataset.jackIdx = String(jIdx);
        btn.innerHTML = `
          <span class="ws7-jack-lamp" style="width:16px;height:16px;border-radius:50%;background:#0D2238;box-shadow:inset 0 0 0 3px #F4A91F;flex:0 0 16px;transition:background 0.14s ease,box-shadow 0.14s ease;"></span>
          <div style="flex:1 1 auto;min-width:0;">
            <div class="ws7-choice-copy" style="font-size:14px;">${escHtml(jackLabel)}</div>
            ${renderDiegeticChoiceOverlaysHtml(clue, jIdx, context)}
          </div>
        `;
        jackLampEls.push(btn.querySelector('.ws7-jack-lamp') as HTMLSpanElement);
        btn.addEventListener('click', () => connectCallerToJack(armedCaller, jIdx));
        jackBtns.push(btn);
        rightCol.appendChild(btn);
      });

      stage.append(leftCol, alleySpacer, rightCol, cordSvg);
      root.appendChild(stage);
      requestAnimationFrame(() => syncArmedState());
      break;
    }

    // ------------------------------------------------------------------------
    // 10. TOY_10_CLIFFHANGERS_THROTTLE: *Price Is Right* Alpine Mountain Slider
    //     60fps Damped Slider Tracking + Serrated 25-Step Ridge + Peak Pennant!
    // ------------------------------------------------------------------------
    case 'TOY_10_CLIFFHANGERS_THROTTLE': {
      appendShowcasePromptBanner(root, 'Slide the Mountain Pointer & tap LOCK IN!');

      const num = resolveNumericPayload(clue);
      const span = Math.max(1e-6, num.max - num.min);
      const truthNorm = Math.round(
        Math.max(0, Math.min(100, ((num.target - num.min) / span) * 100)),
      );
      let guessNorm = 50;

      const layout = document.createElement('div');
      layout.className = 'ws7-cliff-layout';

      const inclineBox = document.createElement('div');
      inclineBox.style.cssText =
        'width:100%;height:clamp(106px,23vh,140px);padding:2px 4px;position:relative;overflow:visible;';

      // Tick notches along the incline
      const stepTicksSvg: string[] = [];
      for (let s = 1; s <= 15; s++) {
        const t = s / 15;
        const sx = 24 + t * 296;
        const sy = 96 - t * 72;
        stepTicksSvg.push(
          `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${sx.toFixed(1)}" y2="${(sy + 6).toFixed(1)}" stroke="#FFD166" stroke-width="${s % 5 === 0 ? 2.2 : 1.2}"/>`,
        );
      }

      const unitSuffix = num.unit ? ` ${escHtml(num.unit)}` : '';
      inclineBox.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;font-family:var(--ws7-toy-caps);font-size:14px;font-weight:800;color:#FFF6E3;gap:8px;">
          <span class="ws7-cliff-readout" style="font-family:var(--ws7-toy-num);font-size:16px;color:#FFFDF7;"></span>
          <span style="color:#FFD166;">${num.min}–${num.max}${unitSuffix}</span>
        </div>
        <svg viewBox="0 0 420 104" width="100%" height="80%" preserveAspectRatio="xMidYMid meet">
          <!-- Living Color Alpine Ridge + Peak Pennant -->
          <polygon points="24,98 320,24 320,98" fill="#0096A6" stroke="#FFF6E3" stroke-width="2.5"/>
          <polygon points="238,44 320,24 320,56 268,58" fill="#FFF6E3" fill-opacity="0.9"/>
          ${stepTicksSvg.join('')}
          <line x1="320" y1="6" x2="320" y2="98" stroke="#FF6738" stroke-width="3" stroke-dasharray="5 3"/>
          <polygon points="320,6 344,13 320,20" fill="#FF6738"/>
          <!-- Studio Mountain Climber Token -->
          <g class="ws7-mountaineer" transform="translate(24,84)">
            <circle cx="0" cy="-15" r="6.5" fill="#FFFDF7" stroke="#0D2238" stroke-width="1.6"/>
            <path d="M-8,0 L0,-10 L8,0 Z" fill="#FF6738" stroke="#FFFDF7" stroke-width="1.4"/>
            <line x1="7" y1="-14" x2="12" y2="2" stroke="#FFD166" stroke-width="2.2"/>
          </g>
        </svg>
      `;

      const controlsRow = document.createElement('div');
      controlsRow.className = 'ws7-cliff-controls-row';

      const track = document.createElement('div');
      track.className = 'ws7-throttle-track';
      track.innerHTML = `
        <div style="position:relative;width:100%;height:14px;border-radius:7px;background:rgba(255,246,227,0.22);box-shadow:inset 0 2px 4px rgba(0,0,0,0.45);">
          <div class="ws7-throttle-fill" style="width:50%;height:100%;border-radius:7px;background:linear-gradient(90deg,#00C2D6 0%,#FFD166 70%,#FF6738 100%);"></div>
          <div class="ws7-throttle-knob" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:13px;background:linear-gradient(180deg,#FFFDF7 0%,#FFD166 72%,#F4A91F 100%);box-shadow:inset 0 2px 0 #FFFFFF,0 3px 0 #9E6300,0 4px 10px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;">
            <span style="width:4px;height:18px;border-radius:2px;background:#9E6300;"></span>
          </div>
        </div>
      `;

      const lockBtn = document.createElement('button');
      lockBtn.type = 'button';
      lockBtn.className = 'ws7-studio-lock-btn';
      lockBtn.textContent = 'LOCK IN!';

      controlsRow.append(track, lockBtn);

      const readoutEl = inclineBox.querySelector('.ws7-cliff-readout') as HTMLSpanElement;
      const mountaineerEl = inclineBox.querySelector('.ws7-mountaineer') as SVGGElement;
      const fillEl = track.querySelector('.ws7-throttle-fill') as HTMLDivElement;
      const knobEl = track.querySelector('.ws7-throttle-knob') as HTMLDivElement;

      const mapNormToDisplay = (norm: number): string => {
        const mapped = num.min + (norm / 100) * span;
        const rounded = num.step >= 1 ? Math.round(mapped) : Number(mapped.toFixed(1));
        return `${rounded}${num.unit ? ` ${num.unit}` : ''}`;
      };

      let visualPct = 50;
      let velPct = 0;
      let sliderRaf = 0;
      let lastSliderMs = 0;

      const applySliderVisual = (pct: number): void => {
        fillEl.style.width = `${pct.toFixed(2)}%`;
        knobEl.style.left = `${pct.toFixed(2)}%`;
      };

      const stepSliderSpring = (now: number): void => {
        if (disposed) return;
        const dt = Math.min(0.032, Math.max(0.001, (now - lastSliderMs) * 0.001));
        lastSliderMs = now;
        const force = (guessNorm - visualPct) * 320;
        velPct = (velPct + force * dt) * Math.exp(-24 * dt);
        visualPct += velPct * dt;
        if (Math.abs(guessNorm - visualPct) < 0.06 && Math.abs(velPct) < 0.25) {
          visualPct = guessNorm;
          velPct = 0;
          applySliderVisual(visualPct);
          sliderRaf = 0;
          return;
        }
        applySliderVisual(visualPct);
        sliderRaf = requestAnimationFrame(stepSliderSpring);
      };

      cleanups.push(() => {
        if (sliderRaf) cancelAnimationFrame(sliderRaf);
      });

      const syncThrottle = (immediate = false): void => {
        readoutEl.textContent = mapNormToDisplay(guessNorm);
        if (immediate || context.reducedMotion) {
          visualPct = guessNorm;
          applySliderVisual(visualPct);
          return;
        }
        if (!sliderRaf) {
          lastSliderMs = performance.now();
          sliderRaf = requestAnimationFrame(stepSliderSpring);
        }
      };
      syncThrottle(true);

      let sliding = false;
      const setFromClientX = (clientX: number): void => {
        const r = track.getBoundingClientRect();
        const pad = 24;
        const usable = Math.max(40, r.width - pad * 2);
        const pct = Math.round(
          Math.max(0, Math.min(100, ((clientX - (r.left + pad)) / usable) * 100)),
        );
        if (pct !== guessNorm) {
          guessNorm = pct;
          context.onTactileSfx?.('DETENT');
          syncThrottle(false);
        }
      };

      const commitCliffGuess = (): void => {
        if (resolved || disposed) return;
        context.onTactileSfx?.('THROW_SNAP');
        lockBtn.textContent = 'CLIMBING!';
        lockBtn.style.background = 'linear-gradient(180deg, #16A34A 0%, #117A37 100%)';

        const deltaTicks = Math.abs(guessNorm - truthNorm);
        const staysOnCliff = deltaTicks <= 15;
        mountaineerEl.style.transition = context.reducedMotion
          ? 'none'
          : 'transform 0.34s cubic-bezier(0.22, 1.18, 0.36, 1)';
        if (staysOnCliff) {
          const t = deltaTicks / 15;
          const mx = 24 + t * 290;
          const my = 84 - t * 60;
          mountaineerEl.setAttribute('transform', `translate(${mx.toFixed(1)},${my.toFixed(1)})`);
        } else {
          mountaineerEl.setAttribute('transform', 'translate(358,94) rotate(68)');
        }

        const accuracyRatio = deltaTicks <= 8 ? 1.0 : staysOnCliff ? 0.75 : 0.0;
        const chipMultiplier = deltaTicks <= 8 ? 1.0 : staysOnCliff ? 0.85 : 0.0;

        schedule(() => {
          emitOnce({
            isCorrect: staysOnCliff,
            accuracyRatio,
            chipMultiplier,
            chosenSummary: `${mapNormToDisplay(guessNorm)} (${deltaTicks} steps off)`,
            trueAnswerDisplay: `${num.target}${num.unit ? ` ${num.unit}` : ''}`,
            triggeredKlaxon: !staysOnCliff && Boolean(clue.isKlaxonMyth),
            fellForPoisonedFix: false,
          });
        }, 360);
      };

      lockBtn.addEventListener('click', commitCliffGuess);

      track.addEventListener('pointerdown', (e: PointerEvent) => {
        if (resolved || disposed) return;
        sliding = true;
        try {
          track.setPointerCapture(e.pointerId);
        } catch {
          // Synthetic pointer safety
        }
        setFromClientX(e.clientX);
      });

      track.addEventListener('pointermove', (e: PointerEvent) => {
        if (!sliding || resolved || disposed) return;
        setFromClientX(e.clientX);
      });

      const stopSlide = (e: PointerEvent): void => {
        if (!sliding) return;
        sliding = false;
        try {
          if (track.hasPointerCapture(e.pointerId)) {
            track.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Safe release
        }
      };

      track.addEventListener('pointerup', stopSlide);
      track.addEventListener('pointercancel', stopSlide);

      layout.append(inclineBox, controlsRow);
      root.appendChild(layout);
      break;
    }

    // ------------------------------------------------------------------------
    // 11. TOY_11_MISSING_VOWELS_WHEEL: *Concentration / Wheel* Letter Board
    // ------------------------------------------------------------------------
    case 'TOY_11_MISSING_VOWELS_WHEEL': {
      appendShowcasePromptBanner(root, 'Tap the Vowel Strip that solves the Puzzle Board!');

      const vow = resolveMissingVowelsPayload(clue);

      const layout = document.createElement('div');
      layout.className = 'ws7-vowels-layout';

      const rack = document.createElement('div');
      rack.className = 'ws7-solari-rack';

      const maskedArr = Array.from(vow.maskedDisplay);
      const renderSolari = (decodedText: string | null): void => {
        const src = decodedText ?? vow.maskedDisplay;
        const words = src.split(/\s+/).filter(Boolean);
        let globalIdx = 0;
        rack.innerHTML = words
          .map((word) => {
            // Advance globalIdx past any spaces before this word
            while (globalIdx < src.length && src[globalIdx] === ' ') {
              globalIdx++;
            }
            const tiles = Array.from(word)
              .map((ch) => {
                const charIdx = globalIdx++;
                const isBlank = ch === '_';
                const wasBlank = decodedText !== null && maskedArr[charIdx] === '_';
                return `<span class="ws7-flap-tile${isBlank ? ' is-blank' : ''}${wasBlank ? ' is-revealed' : ''}">${escHtml(isBlank ? '?' : ch)}</span>`;
              })
              .join('');
            return `<span class="ws7-solari-word">${tiles}</span>`;
          })
          .join('');
      };
      renderSolari(null);

      const drumsGrid = document.createElement('div');
      drumsGrid.className = 'ws7-drums-grid';

      const safePruneIdx =
        clue.waiverPruneIdx !== vow.correctChoiceIdx
          ? clue.waiverPruneIdx
          : (vow.correctChoiceIdx + 1) % 4;
      const safePoisonIdx =
        clue.poisonedFixIdx !== vow.correctChoiceIdx
          ? clue.poisonedFixIdx
          : (vow.correctChoiceIdx + 2) % 4;
      const safeCanaryIdx =
        typeof context.canaryTickIdx === 'number'
          ? context.canaryTickIdx === clue.answerIdx
            ? vow.correctChoiceIdx
            : safePoisonIdx
          : null;
      const vowelClueOverlay = {
        ...clue,
        answerIdx: vow.correctChoiceIdx as 0 | 1 | 2 | 3,
        waiverPruneIdx: safePruneIdx as 0 | 1 | 2 | 3,
        poisonedFixIdx: safePoisonIdx as 0 | 1 | 2 | 3,
      };
      const vowelContext: TactileContraptionContextV7 = {
        ...context,
        canaryTickIdx: safeCanaryIdx,
      };

      vow.vowelChoices.forEach((cluster, idx) => {
        const drum = document.createElement('button');
        drum.type = 'button';
        drum.className = 'ws7-vowel-drum';
        drum.dataset.drumIdx = String(idx);
        drum.dataset.choiceIdx = String(idx);
        drum.innerHTML = `
          <span>${escHtml(cluster)}</span>
          ${renderDiegeticChoiceOverlaysHtml(vowelClueOverlay, idx, vowelContext)}
        `;

        drum.addEventListener('click', () => {
          if (resolved || disposed) return;
          context.onTactileSfx?.('SHUTTER_CLACK');
          const isCorrect = idx === vow.correctChoiceIdx;
          if (isCorrect) {
            renderSolari(vow.fullAnswer);
          }
          drum.style.transform = 'translateY(2px)';
          drum.style.boxShadow = '0 0 0 3px #FFD166, 0 0 20px rgba(255,209,102,0.8)';
          schedule(() => {
            emitOnce({
              isCorrect,
              accuracyRatio: isCorrect ? 1.0 : 0.0,
              chipMultiplier: 1.0,
              chosenSummary: `${cluster} -> ${isCorrect ? vow.fullAnswer : vow.maskedDisplay}`,
              trueAnswerDisplay: vow.fullAnswer,
              triggeredKlaxon: !isCorrect && Boolean(clue.isKlaxonMyth),
              fellForPoisonedFix: !isCorrect && idx === clue.poisonedFixIdx,
            });
          }, 240);
        });

        drumsGrid.appendChild(drum);
      });

      layout.append(rack, drumsGrid);
      root.appendChild(layout);
      break;
    }

    // ------------------------------------------------------------------------
    // 12. TOY_12_CONSPIRACY_LASSO: 3x3 Pop-Modernist TV Lightboard
    // ------------------------------------------------------------------------
    case 'TOY_12_CONSPIRACY_LASSO': {
      const lasso = resolveLassoPayload(clue);
      appendShowcasePromptBanner(
        root,
        lasso.connectionPrompt || 'Tap or drag across the 3 matching Studio Cards!',
      );

      const picked: number[] = [];

      const board = document.createElement('div');
      board.className = 'ws7-corkboard';

      const twineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      twineSvg.setAttribute(
        'style',
        'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;',
      );

      const cardEls: HTMLButtonElement[] = [];

      const updateTwine = (): void => {
        cardEls.forEach((el, idx) => el.classList.toggle('is-lassoed', picked.includes(idx)));
        const bRect = board.getBoundingClientRect();
        if (bRect.width <= 0 || picked.length < 2) {
          twineSvg.innerHTML = '';
          return;
        }
        const pts = picked.map((idx) => {
          const r = cardEls[idx].getBoundingClientRect();
          return {
            x: r.left + r.width * 0.5 - bRect.left,
            y: r.top + 8 - bRect.top,
          };
        });
        const closed = picked.length === 3 ? [...pts, pts[0]] : pts;
        const poly = closed.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        twineSvg.innerHTML = `
          <polyline points="${poly}" fill="${picked.length === 3 ? 'rgba(255,103,56,0.18)' : 'none'}" stroke="#FF6738" stroke-width="4.2" stroke-linejoin="round" stroke-linecap="round"/>
          <polyline points="${poly}" fill="none" stroke="#FFD166" stroke-width="1.6" stroke-dasharray="5 3"/>
        `;
      };

      const checkTriadComplete = (): void => {
        if (picked.length < 3 || resolved || disposed) return;
        context.onTactileSfx?.('TWINE_TAUT');
        const targetSet = new Set<number>(lasso.triadIndices);
        const isCorrect = picked.every((idx) => targetSet.has(idx));
        const chosenText = picked.map((idx) => lasso.cards[idx]).join(' + ');
        const trueText = lasso.triadIndices.map((idx) => lasso.cards[idx]).join(' + ');

        schedule(() => {
          emitOnce({
            isCorrect,
            accuracyRatio: isCorrect ? 1.0 : 0.0,
            chipMultiplier: isCorrect ? 1.15 : 0.0,
            chosenSummary: chosenText,
            trueAnswerDisplay: trueText,
            triggeredKlaxon: !isCorrect && Boolean(clue.isKlaxonMyth),
            fellForPoisonedFix: false,
          });
        }, 230);
      };

      let lassoDragging = false;

      lasso.cards.slice(0, 9).forEach((cardLabel, idx) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'ws7-pin-card ws7-cream-plaque';
        card.dataset.cardIdx = String(idx);
        card.innerHTML = `<span class="ws7-brass-tack" aria-hidden="true"></span><span>${escHtml(cardLabel)}</span>`;

        card.addEventListener('pointerdown', () => {
          if (resolved || disposed || picked.length >= 3) return;
          lassoDragging = true;
          const existing = picked.indexOf(idx);
          if (existing >= 0) {
            picked.splice(existing, 1);
          } else {
            picked.push(idx);
            context.onTactileSfx?.('TICK');
          }
          updateTwine();
          checkTriadComplete();
        });

        cardEls.push(card);
        board.appendChild(card);
      });

      board.addEventListener('pointermove', (e: PointerEvent) => {
        if (!lassoDragging || resolved || disposed || picked.length >= 3) return;
        const el = document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest('[data-card-idx]') as HTMLElement | null;
        if (!el || el.dataset.cardIdx === undefined) return;
        const idx = Number(el.dataset.cardIdx);
        if (!picked.includes(idx)) {
          picked.push(idx);
          context.onTactileSfx?.('TICK');
          updateTwine();
          checkTriadComplete();
        }
      });

      const onWindowPointerUp = (): void => {
        lassoDragging = false;
      };
      window.addEventListener('pointerup', onWindowPointerUp);
      cleanups.push(() => window.removeEventListener('pointerup', onWindowPointerUp));

      board.appendChild(twineSvg);
      root.appendChild(board);
      break;
    }

    // ------------------------------------------------------------------------
    // 13. TOY_13_CYANOTYPE_LOUPE: 1966 RCA Color TV Visual Monitor Plates
    // ------------------------------------------------------------------------
    case 'TOY_13_CYANOTYPE_LOUPE': {
      const cyano = resolveCyanotypePayload(clue);
      const isSpatialStem = /\b(upper|lower|top|bottom)[ -](left|right|mid)/i.test(
        clue.stem,
      );

      appendShowcasePromptBanner(
        root,
        isSpatialStem
          ? 'Tap the matching glowing Zone right on the TV Monitor!'
          : 'Tap Zone A–D on the TV Monitor or tap its Answer Pad!',
      );

      const outerLayout = document.createElement('div');
      outerLayout.className = 'ws7-cyano-outer';
      outerLayout.dataset.hasLegend = isSpatialStem ? 'false' : 'true';
      root.appendChild(outerLayout);

      const wrap = document.createElement('div');
      wrap.className = 'ws7-cyanotype-wrap';
      outerLayout.appendChild(wrap);

      const distractorZones = [
        (cyano.targetZoneIdx + 2) % 8,
        (cyano.targetZoneIdx + 5) % 8,
        (cyano.targetZoneIdx + 7) % 8,
      ];
      const choiceToZone: number[] = [];
      let dPtr = 0;
      for (let c = 0; c < 4; c++) {
        if (c === clue.answerIdx) choiceToZone.push(cyano.targetZoneIdx);
        else choiceToZone.push(distractorZones[dPtr++]);
      }
      const zoneToChoice = new Map<number, number>();
      choiceToZone.forEach((z, cIdx) => zoneToChoice.set(z, cIdx));

      const patentHintIdx =
        context.dayJob === 'PATENT_CLERK' ? cyano.targetZoneIdx : null;
      const pruneZoneIdx = context.pruneActive
        ? isSpatialStem
          ? ((cyano.targetZoneIdx + 3) % 8)
          : choiceToZone[clue.waiverPruneIdx]
        : null;
      const poisonedZoneIdx = isSpatialStem
        ? (cyano.targetZoneIdx + 5) % 8
        : choiceToZone[clue.poisonedFixIdx];
      const canaryZoneIdx =
        typeof context.canaryTickIdx === 'number'
          ? isSpatialStem
            ? (context.canaryTickIdx % 8)
            : choiceToZone[context.canaryTickIdx] ?? cyano.targetZoneIdx
          : null;

      const selectZoneByIndex = (zIdx: number): void => {
        if (resolved || disposed) return;
        context.onTactileSfx?.('IRIS_FLASH');
        mountBlueprint(zIdx);

        const isCorrect = zIdx === cyano.targetZoneIdx;
        const cIdx = zoneToChoice.get(zIdx);
        const pickedLabel =
          !isSpatialStem && cIdx !== undefined
            ? clue.choices[cIdx]
            : isCorrect
              ? cyano.targetZoneName
              : `Zone #${zIdx + 1}`;
        schedule(() => {
          emitOnce({
            isCorrect,
            accuracyRatio: isCorrect ? 1.0 : 0.0,
            chipMultiplier: 1.15,
            chosenSummary: pickedLabel,
            trueAnswerDisplay: cyano.targetZoneName,
            triggeredKlaxon: !isCorrect && Boolean(clue.isKlaxonMyth),
            fellForPoisonedFix: !isCorrect && zIdx === poisonedZoneIdx,
          });
        }, 220);
      };

      const mountBlueprint = (flashIdx: number | null): void => {
        wrap.innerHTML = renderCyanotypePlateSVG(cyano.plateId, {
          activeZoneIdx: flashIdx,
          patentClerkHintIdx: patentHintIdx,
          pruneZoneIdx,
          canaryZoneIdx,
          poisonedZoneIdx,
          uvLoupeActive: context.uvLoupeActive,
        });

        const chambers = wrap.querySelectorAll<SVGGElement>('[data-zone-idx]');
        chambers.forEach((g) => {
          const zIdx = Number(g.dataset.zoneIdx ?? 0);
          if (!isSpatialStem) {
            const cIdx = zoneToChoice.get(zIdx);
            if (cIdx !== undefined) {
              const x0 = Number(g.dataset.x0 ?? 24);
              const y0 = Number(g.dataset.y0 ?? 30);
              const pill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              pill.setAttribute('x', String(x0 + 6));
              pill.setAttribute('y', String(y0 + 6));
              pill.setAttribute('width', '26');
              pill.setAttribute('height', '23');
              pill.setAttribute('rx', '6');
              pill.setAttribute('fill', '#FFD166');
              g.appendChild(pill);

              const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              badge.setAttribute('x', String(x0 + 19));
              badge.setAttribute('y', String(y0 + 23));
              badge.setAttribute('text-anchor', 'middle');
              badge.setAttribute('fill', '#141B29');
              badge.setAttribute('font-family', 'Jost, sans-serif');
              badge.setAttribute('font-size', '16');
              badge.setAttribute('font-weight', '900');
              badge.textContent = STUDIO_LETTERS_V7[cIdx];
              g.appendChild(badge);
            } else {
              g.style.opacity = '0.26';
              g.style.pointerEvents = 'none';
            }
          }

          if (flashIdx !== null) return;

          g.addEventListener('click', () => selectZoneByIndex(zIdx));
          g.addEventListener('keydown', (ke: KeyboardEvent) => {
            if (ke.key === 'Enter' || ke.key === ' ') {
              ke.preventDefault();
              selectZoneByIndex(zIdx);
            }
          });
        });
      };

      mountBlueprint(null);

      if (!isSpatialStem) {
        const legendGrid = document.createElement('div');
        legendGrid.className = 'ws7-cyano-legend-grid';
        clue.choices.forEach((label, cIdx) => {
          const zIdx = choiceToZone[cIdx];
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ws7-cyano-legend-btn ws7-cream-plaque';
          btn.dataset.choiceIdx = String(cIdx);
          btn.innerHTML = `
            <span class="ws7-choice-copy" style="font-size:14.5px;"><strong style="color:#008B9A;font-family:var(--ws7-toy-caps);">${STUDIO_LETTERS_V7[cIdx]}.</strong> ${escHtml(label)}</span>
            ${renderDiegeticChoiceOverlaysHtml(clue, cIdx, context)}
          `;
          btn.addEventListener('click', () => selectZoneByIndex(zIdx));
          legendGrid.appendChild(btn);
        });
        outerLayout.appendChild(legendGrid);
      }
      break;
    }

    // ------------------------------------------------------------------------
    // 14. TOY_14_FOUR_SHUTTER_REEL: 1966 *Laugh-In* Pop-Color 4-Shutter Wall
    // ------------------------------------------------------------------------
    case 'TOY_14_FOUR_SHUTTER_REEL': {
      appendShowcasePromptBanner(
        root,
        'Tap A–D now for 2.0× — or tap OPEN SHUTTER for more clues!',
      );

      const reel = resolveShuttersPayload(clue);
      const multSchedule: readonly [number, number, number, number] = [2.0, 1.5, 1.2, 1.0];
      const freeSecondShutter = context.dayJob === 'MONOLOGUE_WRITER';
      let openCount = freeSecondShutter ? 2 : 1;
      let lastOpenedIdx = -1;
      let paidCracks = 0;

      const getCurrentMult = (): number => multSchedule[Math.min(3, paidCracks)];

      const layout = document.createElement('div');
      layout.className = 'ws7-shutter-layout';

      const topRow = document.createElement('div');
      topRow.className = 'ws7-shutter-top';

      const shuttersGrid = document.createElement('div');
      shuttersGrid.className = 'ws7-shutters-grid';

      const crackBtn = document.createElement('button');
      crackBtn.type = 'button';
      crackBtn.className = 'ws7-crack-lever';

      const renderShutters = (): void => {
        const curMult = getCurrentMult();
        shuttersGrid.innerHTML = reel.shutters
          .map((clueLine, sIdx) => {
            const isOpen = sIdx < openCount;
            if (isOpen) {
              const animCls =
                sIdx === lastOpenedIdx && !context.reducedMotion ? ' is-newly-opened' : '';
              return `<div class="ws7-shutter-window ws7-cream-plaque${animCls}"><span>${escHtml(clueLine)}</span></div>`;
            }
            return `<div class="ws7-shutter-window is-closed" data-shutter-tone="${sIdx % 4}"><span>SHUTTER ${sIdx + 1}</span></div>`;
          })
          .join('');

        if (openCount >= 4) {
          crackBtn.disabled = true;
          crackBtn.innerHTML = `<span>ALL OPEN</span><span style="font-size:16px;">${curMult.toFixed(1)}×</span>`;
        } else {
          const nextMult = multSchedule[Math.min(3, paidCracks + 1)];
          crackBtn.disabled = false;
          crackBtn.innerHTML = `
            <span style="font-size:15px;color:#FFE89E;">${curMult.toFixed(1)}× NOW</span>
            <span>OPEN #${openCount + 1}</span>
            <span style="font-size:14px;opacity:0.9;">(${nextMult.toFixed(1)}×)</span>
          `;
        }
      };
      renderShutters();

      crackBtn.addEventListener('click', () => {
        if (resolved || disposed || openCount >= 4) return;
        lastOpenedIdx = openCount;
        openCount += 1;
        paidCracks += 1;
        context.onTactileSfx?.('SHUTTER_CLACK');
        renderShutters();
      });

      const keysGrid = document.createElement('div');
      keysGrid.className = 'ws7-shutter-keys';

      clue.choices.forEach((choiceText, idx) => {
        const keyBtn = document.createElement('button');
        keyBtn.type = 'button';
        keyBtn.className = 'ws7-shutter-key-btn ws7-cream-plaque';
        keyBtn.dataset.choiceIdx = String(idx);
        keyBtn.innerHTML = `
          <span style="font-family:var(--ws7-toy-caps);font-size:15px;font-weight:900;color:#008B9A;flex:0 0 auto;">${STUDIO_LETTERS_V7[idx]}.</span>
          <div style="flex:1 1 auto;min-width:0;">
            <div class="ws7-choice-copy">${escHtml(choiceText)}</div>
            ${renderDiegeticChoiceOverlaysHtml(clue, idx, context)}
          </div>
        `;
        keyBtn.addEventListener('click', () => {
          if (resolved || disposed) return;
          const mult = getCurrentMult();
          context.onTactileSfx?.('THROW_SNAP');
          keyBtn.style.boxShadow = '0 0 0 3px #FFD166, 0 0 20px rgba(255,209,102,0.8)';
          const res = buildChoiceResolution(clue, idx, mult, `[${mult.toFixed(1)}x]`);
          schedule(() => emitOnce(res), 180);
        });
        keysGrid.appendChild(keyBtn);
      });

      topRow.append(shuttersGrid, crackBtn);
      layout.append(topRow, keysGrid);
      root.appendChild(layout);
      break;
    }
  }

  return {
    toyId,
    dispose(): void {
      if (disposed) return;
      disposed = true;
      for (const id of timers) window.clearTimeout(id);
      for (const fn of cleanups) fn();
      if (root.parentElement === container) {
        container.removeChild(root);
      }
    },
  };
}
