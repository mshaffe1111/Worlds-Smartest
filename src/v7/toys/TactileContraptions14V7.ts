// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.6 Gold Master — Wave 7 Polish)
// `src/v7/toys/TactileContraptions14V7.ts`
//
// 1966 "In Living Color" Question Console Visual Variety & 14 Tactile Props:
//  - `TOY_01_KNIFE_SWITCH` (75% Primary Trivia Input): 5 Unmistakable 1966 TV
//    Visual Card Presentations (`QuestionCardStyleV7`):
//      1. `CLASSIC_CUE`     — Radiant Backlit Acrylite Studio Push-Button Pads
//      2. `HEADLINE_BLANK`  — 1966 AP Teletype / Front-Page Press Clipping Slugs
//      3. `PICTURE_MONITOR` — Bespoke Mid-Century 20-Category Vector TV Monitor
//      4. `SPOT_THE_MYTH`   — Cerise/Vermilion Klaxon Alert Studio Frame
//      5. `BINARY_SPLIT`    — Giant 2-Paddle 50/50 Left-vs-Right TV Showdown
//  - Dynamic 2-Beat Studio Desk Lock-In & True-Answer Tally Reveal:
//      • Beat 1: Warm 2700K Amber Lock-In (`160ms` normal / `600ms` pulsing
//        heartbeat amber glow + `LOCKED IN...` badge when `isClutchMoment`)
//      • Beat 2 (`290ms` / `300ms`): Radiant Emerald (`✓`) true answer +
//        Broadcast Vermilion (`✗`) wrong pick flash right on the pads BEFORE
//        emitting `onResolve(...)`!
//      • Price-Is-Right Range Game Reveal (`420ms`) on `TOY_03_VERNIER_DIAL` &
//        `TOY_10_CLIFFHANGERS_THROTTLE`: Glowing Gold Exact-Answer Marker +
//        Green Tolerance Band animated right onto the dial arc & mountain slope!
//  - Live Studio Lifeline Hooks on `MountedTactileContraptionV7`:
//      • `applyFiftyFiftyPrune()` across all 14 contraptions (`[50/50 CUT]`)
//      • `showAudiencePollOverlay(percentages)` Solari Tote `%` bar badges
//  - Full `v7.5.1` `220ms` fresh-`pointerdown` capture input-arming safety,
//    `>= 48x48px` touch targets, `>= 14.5px` typography floor, ZERO `...`
//    truncation, and ZERO scrollbars across `390x660`..`1440x900`!
// ============================================================================

import type {
  BalanceScalePayloadV7,
  CategoryIdV7,
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
  QuestionCardStyleV7,
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
  /** True when `relic_patent_cyanotype_tube` is equipped (grants TOY_13 Cyanotype chamfer hint alongside PATENT_CLERK). */
  readonly hasPatentCyanotypeTube?: boolean;
  /** Optional equipped relic IDs list (also grants TOY_13 Cyanotype chamfer hint when `relic_patent_cyanotype_tube` is present). */
  readonly equippedRelicIds?: readonly string[];
  /** Explicit 1966 TV Visual Card Style override (defaults to clue.cardStyle ?? deterministic qid fallback). */
  readonly cardStyle?: QuestionCardStyleV7;
  /** Match-point / high-stakes suspense mode: 600ms pulsing heartbeat amber lock-in + 'LOCKED IN...' badge! */
  readonly isClutchMoment?: boolean;
  /** Accessibility reduced-motion toggle. */
  readonly reducedMotion?: boolean;
  /** Accessibility high-contrast badge border boost. */
  readonly highContrastBadges?: boolean;
  /** Optional stage metallic trim accent hex. */
  readonly brassAccentHex?: string;
  /** Optional live studio micro-SFX callback. */
  readonly onTactileSfx?: (event: TactileSfxEventV7) => void;
  /** Optional callback fired at Beat 1 when player locks in an answer (ideal for Showband lock-in sting). */
  readonly onLockInStart?: (isClutch: boolean) => void;
  /** Optional callback fired at Beat 2 when Emerald/Vermilion on-pad true-answer tally flashes. */
  readonly onRevealFlash?: (isCorrect: boolean) => void;
}

export interface MountedTactileContraptionV7 {
  readonly toyId: ToyIdV7;
  readonly cardStyle: QuestionCardStyleV7;
  /**
   * Studio Lifeline #1 — 50/50 Studio Cut:
   * Visibly dims & disables 2 wrong choice pads (or narrows range/weights/cards on showcase toys)
   * with a crisp `[50/50 CUT]` stamp and returns the pruned indices.
   */
  applyFiftyFiftyPrune(): readonly number[];
  /**
   * Studio Lifeline #2 — Studio Audience Poll:
   * Renders sleek, non-blocking 1966 Solari Tote Percentage Bar Badges (e.g. `64%`)
   * right onto each live option pad (or audience consensus overlay on showcase toys).
   */
  showAudiencePollOverlay(percentages: readonly number[]): void;
  dispose(): void;
}

export interface ToyContraptionMetaV7 {
  readonly toyId: ToyIdV7;
  readonly name: string;
  readonly verbCue: string;
  readonly isBlitzLegal: boolean;
}

export const ALL_QUESTION_CARD_STYLES_V7: readonly QuestionCardStyleV7[] = [
  'CLASSIC_CUE',
  'HEADLINE_BLANK',
  'PICTURE_MONITOR',
  'SPOT_THE_MYTH',
  'BINARY_SPLIT',
] as const;

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

const PICTURE_MONITOR_CHANNEL_LABELS_V7: Record<CategoryIdV7, string> = {
  MEDICINE: 'BODY & MEDICINE',
  CHEMISTRY: 'CHEMISTRY LAB',
  PHYSICS: 'SCIENCE & SPACE',
  GADGETS: 'INVENTIONS',
  ENGINES: 'MACHINES & FLIGHT',
  LITERATURE: 'BOOKS & AUTHORS',
  LEXICON: 'WORDS & WIT',
  'FINE ARTS': 'ART & STAGE',
  SCREEN: 'SILVER SCREEN',
  JUKEBOX: 'HIT PARADE',
  FINANCE: 'MONEY & MARKETS',
  PRICING: 'PRICE TAG',
  ODDS: 'LUCK & ODDS',
  ATLAS: 'WORLD ATLAS',
  SPORTS: 'WIDE WORLD SPORTS',
  DYNASTIES: 'EMPIRES & KINGS',
  HEADLINES: 'FRONT PAGE NEWS',
  FOLKLORE: 'MYTHS & LEGENDS',
  FALLACIES: 'BRAIN TWISTERS',
  CUISINE: 'FOOD & FLAVOR',
};

/**
 * Resolves the 1966 Visual TV Card Presentation Style deterministically:
 *  `context.cardStyle ?? clue.cardStyle ?? semantic/qid fallback`.
 */
export function resolveQuestionCardStyleV7(
  clue: ClueRecordV7,
  context: TactileContraptionContextV7 = {},
): QuestionCardStyleV7 {
  if (context.cardStyle) return context.cardStyle;
  if (clue.cardStyle) return clue.cardStyle;

  if (
    clue.isKlaxonMyth ||
    /\b(myth|bogus|fake|hoax|never happened|odd one out|false claim|not true)\b/i.test(clue.stem)
  ) {
    return 'SPOT_THE_MYTH';
  }
  if (/_{2,}|\[\s*_+\s*\]|fill in the blank/i.test(clue.stem)) {
    return 'HEADLINE_BLANK';
  }

  const bucket = Math.abs(clue.qid * 7 + clue.category.length * 3 + clue.answerIdx) % 5;
  const candidate = ALL_QUESTION_CARD_STYLES_V7[bucket] ?? 'CLASSIC_CUE';
  // Avoid fallback 2-paddle cut if the stem explicitly counts "four" options
  if (candidate === 'BINARY_SPLIT' && /\b(four|4)\b/i.test(clue.stem)) {
    return 'PICTURE_MONITOR';
  }
  return candidate;
}

/**
 * Renders a museum-grade 1966 Charley Harper / Saul Bass / Morton Goldsholl
 * editorial vector illustration (`viewBox="0 0 160 100"`) for ALL 20 categories
 * inside a curved RCA Color CRT aperture with halftone dot-screen & glass sheen.
 * Zero text spoilers inside the artwork!
 */
function renderCategoryPictureEmblemSvgV7(category: CategoryIdV7): string {
  const artworkByCat: Record<CategoryIdV7, string> = {
    MEDICINE: `
      <!-- Charley Harper Botanical-Anatomical Poster -->
      <rect width="160" height="100" fill="#0B2742"/>
      <polygon points="0,0 92,0 64,100 0,100" fill="#007E8C"/>
      <circle cx="80" cy="50" r="44" fill="url(#ws7PicHalftone)" opacity="0.45"/>
      <circle cx="80" cy="50" r="37" fill="#0E2238" stroke="#FFD166" stroke-width="2.2"/>
      <!-- Stethoscope Brass Tubing Arc -->
      <path d="M36,30 C32,68 54,84 80,84 C106,84 128,68 124,30" fill="none" stroke="#F4A91F" stroke-width="3.6" stroke-linecap="round"/>
      <circle cx="36" cy="27" r="4.5" fill="#FFF6E3" stroke="#141B29" stroke-width="1.6"/>
      <circle cx="124" cy="27" r="4.5" fill="#FFF6E3" stroke="#141B29" stroke-width="1.6"/>
      <circle cx="80" cy="84" r="6.5" fill="#FFD166" stroke="#FFFDF7" stroke-width="1.8"/>
      <!-- Faceted Mid-Century Geometric Heart -->
      <path d="M80,73 C50,58 43,39 53,27 C61,18 73,21 80,32 C87,21 99,18 107,27 C117,39 110,58 80,73 Z" fill="#E6397A" stroke="#FFF6E3" stroke-width="2.2"/>
      <path d="M80,32 C87,21 99,18 107,27 C117,39 110,58 80,73 Z" fill="#C41E5C" opacity="0.65"/>
      <path d="M58,31 C63,25 71,26 75,33" fill="none" stroke="#FFD0E2" stroke-width="2.6" stroke-linecap="round"/>
      <!-- Luminous Golden EKG Pulse Waveform -->
      <polyline points="12,50 48,50 56,34 65,64 75,26 84,59 93,44 102,50 148,50" fill="none" stroke="#FFD166" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="75" cy="26" r="3.4" fill="#FFFDF7"/><circle cx="102" cy="50" r="3" fill="#00E5FF"/>
    `,
    CHEMISTRY: `
      <!-- Morton Goldsholl Atomic Lab Poster -->
      <rect width="160" height="100" fill="#102949"/>
      <polygon points="84,0 160,0 160,100 58,100" fill="#15467A"/>
      <rect x="0" y="76" width="160" height="24" fill="#091B30"/>
      <circle cx="82" cy="48" r="46" fill="url(#ws7PicHalftone)" opacity="0.38"/>
      <!-- Sweeping Atomic Orbitals -->
      <ellipse cx="80" cy="48" rx="60" ry="18" fill="none" stroke="#00C2D6" stroke-width="2" transform="rotate(-22 80 48)"/>
      <ellipse cx="80" cy="48" rx="60" ry="18" fill="none" stroke="#FFD166" stroke-width="2" transform="rotate(22 80 48)"/>
      <circle cx="29" cy="67" r="4.2" fill="#FF6738" stroke="#FFF6E3" stroke-width="1.3"/>
      <circle cx="131" cy="29" r="4.2" fill="#00E5FF" stroke="#FFF6E3" stroke-width="1.3"/>
      <!-- Secondary Round Retort Flask (Left) -->
      <circle cx="42" cy="62" r="16" fill="#0C243D" stroke="#FFF6E3" stroke-width="2"/>
      <path d="M27,64 A15,15 0 0,0 57,64 Z" fill="#FF6738"/>
      <path d="M42,46 L42,30 L56,22" fill="none" stroke="#FFF6E3" stroke-width="2.6" stroke-linecap="round"/>
      <!-- Hero Faceted Erlenmeyer Flask (Center) -->
      <path d="M70,14 L92,14 L92,34 L111,76 Q113,82 106,82 L56,82 Q49,82 51,76 L70,34 Z" fill="#0D2C4A" stroke="#FFF6E3" stroke-width="2.4"/>
      <path d="M58,58 L104,58 L110,76 Q111,80 106,80 L56,80 Q51,80 52,76 Z" fill="#00C2D6"/>
      <polygon points="81,58 104,58 110,80 81,80" fill="#0096A6" opacity="0.65"/>
      <rect x="66" y="10" width="30" height="5" rx="2.5" fill="#F4A91F"/>
      <!-- Graduation Ticks & Rising Bubbles -->
      <line x1="65" y1="64" x2="73" y2="64" stroke="#FFFDF7" stroke-width="1.6"/>
      <line x1="62" y1="71" x2="71" y2="71" stroke="#FFFDF7" stroke-width="1.6"/>
      <circle cx="75" cy="70" r="3.6" fill="#FFFDF7"/><circle cx="88" cy="65" r="2.8" fill="#FFD166"/>
      <circle cx="81" cy="46" r="3.2" fill="#00E5FF"/><circle cx="77" cy="30" r="2.4" fill="#FFD166"/>
      <!-- Test Tube Accent (Right) -->
      <rect x="118" y="34" width="12" height="44" rx="6" fill="#0C243D" stroke="#FFF6E3" stroke-width="2"/>
      <rect x="120" y="54" width="8" height="22" rx="4" fill="#E6397A"/>
    `,
    PHYSICS: `
      <!-- Saul Bass / 1964 World's Fair Atomic Prism Poster -->
      <rect width="160" height="100" fill="#0A1D36"/>
      <polygon points="0,0 64,0 92,100 0,100" fill="#123158"/>
      <circle cx="76" cy="54" r="44" fill="url(#ws7PicHalftone)" opacity="0.35"/>
      <!-- Refracted 5-Band Living Color Spectrum Fan -->
      <polygon points="94,45 160,18 160,30 96,49" fill="#E6397A"/>
      <polygon points="96,49 160,30 160,43 98,53" fill="#FF6738"/>
      <polygon points="98,53 160,43 160,57 100,57" fill="#FFD166"/>
      <polygon points="100,57 160,57 160,71 102,61" fill="#22C55E"/>
      <polygon points="102,61 160,71 160,84 104,65" fill="#00C2D6"/>
      <!-- Incoming White Light Beam -->
      <line x1="0" y1="62" x2="62" y2="50" stroke="#FFFDF7" stroke-width="4.5" stroke-linecap="round"/>
      <!-- Equilateral Faceted Glass Prism -->
      <polygon points="78,16 112,82 44,82" fill="#184B78" fill-opacity="0.88" stroke="#FFF6E3" stroke-width="2.6" stroke-linejoin="round"/>
      <polygon points="78,16 112,82 78,82" fill="#00C2D6" fill-opacity="0.32"/>
      <line x1="62" y1="50" x2="96" y2="52" stroke="#FFFDF7" stroke-width="2.4" stroke-opacity="0.85"/>
      <!-- Orbiting Atomic Nucleus Starburst Above -->
      <ellipse cx="42" cy="28" rx="22" ry="8" fill="none" stroke="#FFD166" stroke-width="1.8" transform="rotate(-28 42 28)"/>
      <ellipse cx="42" cy="28" rx="22" ry="8" fill="none" stroke="#00E5FF" stroke-width="1.8" transform="rotate(28 42 28)"/>
      <circle cx="42" cy="28" r="4.6" fill="#FFD166" stroke="#FFFDF7" stroke-width="1.4"/>
    `,
    GADGETS: `
      <!-- 1966 Industrial Design 35mm SLR Studio Poster -->
      <rect width="160" height="100" fill="#133354"/>
      <polygon points="0,0 160,0 160,42 0,68" fill="#F4A91F"/>
      <polygon points="0,68 160,42 160,100 0,100" fill="#0D2238"/>
      <rect x="0" y="0" width="160" height="100" fill="url(#ws7PicHalftone)" opacity="0.22"/>
      <!-- 35mm Sprocket Film Strip Along Bottom -->
      <rect x="0" y="84" width="160" height="16" fill="#141B29"/>
      <g fill="#FFF6E3" opacity="0.82">
        <rect x="8" y="88" width="9" height="7" rx="1.5"/><rect x="26" y="88" width="9" height="7" rx="1.5"/>
        <rect x="44" y="88" width="9" height="7" rx="1.5"/><rect x="62" y="88" width="9" height="7" rx="1.5"/>
        <rect x="80" y="88" width="9" height="7" rx="1.5"/><rect x="98" y="88" width="9" height="7" rx="1.5"/>
        <rect x="116" y="88" width="9" height="7" rx="1.5"/><rect x="134" y="88" width="9" height="7" rx="1.5"/>
      </g>
      <!-- Streamlined 1966 Chrome & Leatherette Camera Body -->
      <polygon points="56,28 66,14 96,14 106,28" fill="#E8EEF5" stroke="#141B29" stroke-width="2"/>
      <rect x="34" y="26" width="92" height="52" rx="8" fill="#1E56C5" stroke="#FFF6E3" stroke-width="2.4"/>
      <rect x="34" y="26" width="92" height="14" rx="5" fill="#DCE7F2"/>
      <rect x="42" y="19" width="14" height="7" rx="2" fill="#FF6738" stroke="#141B29" stroke-width="1.4"/>
      <rect x="106" y="20" width="12" height="6" rx="2" fill="#FFD166" stroke="#141B29" stroke-width="1.4"/>
      <!-- Multi-Ring Coated Glass Camera Lens -->
      <circle cx="80" cy="54" r="21" fill="#0D2238" stroke="#FFD166" stroke-width="3.2"/>
      <circle cx="80" cy="54" r="15" fill="#13385A" stroke="#00C2D6" stroke-width="2"/>
      <circle cx="80" cy="54" r="8.5" fill="#071628" stroke="#E6397A" stroke-width="1.8"/>
      <path d="M72,46 A10,10 0 0,1 86,44" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="85" cy="59" r="2.2" fill="#00E5FF"/>
      <!-- Flash Starburst Top Right -->
      <polygon points="134,10 137,20 147,20 139,26 142,36 134,30 126,36 129,26 121,20 131,20" fill="#FFFDF7" stroke="#FF6738" stroke-width="1.4"/>
    `,
    ENGINES: `
      <!-- Charley Harper / 1966 Jet-Age Airline Poster -->
      <rect width="160" height="100" fill="#008594"/>
      <rect x="0" y="0" width="160" height="44" fill="#1746A2"/>
      <circle cx="122" cy="28" r="22" fill="#FFD166"/>
      <path d="M0,74 Q42,60 84,74 T160,72 L160,100 L0,100 Z" fill="#0D2238"/>
      <rect width="160" height="100" fill="url(#ws7PicHalftone)" opacity="0.22"/>
      <!-- Supersonic Contrail Ribbons -->
      <path d="M0,62 L62,48" stroke="#FFF6E3" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
      <path d="M0,72 L70,56" stroke="#FF6738" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M0,82 L54,68" stroke="#FFD166" stroke-width="2.6" stroke-linecap="round"/>
      <!-- Banking Delta-Wing Jetliner Silhouette -->
      <polygon points="56,42 104,16 112,35" fill="#FF6738" stroke="#FFF6E3" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M28,58 L78,37 L142,24 Q152,23 146,32 L106,51 L38,63 Z" fill="#FFF6E3" stroke="#141B29" stroke-width="2"/>
      <polygon points="36,56 46,34 62,47" fill="#E6397A" stroke="#FFF6E3" stroke-width="1.5"/>
      <polygon points="74,47 116,58 100,66 64,53" fill="#00C2D6" stroke="#141B29" stroke-width="1.4"/>
      <!-- Cockpit & Portholes -->
      <polygon points="122,29 135,27 131,32 120,33" fill="#0D2238"/>
      <circle cx="106" cy="36" r="2.6" fill="#1746A2"/><circle cx="94" cy="39" r="2.6" fill="#1746A2"/>
      <circle cx="82" cy="42" r="2.6" fill="#1746A2"/><circle cx="70" cy="45" r="2.6" fill="#1746A2"/>
    `,
    LITERATURE: `
      <!-- Saul Bass Mid-Century Book-Jacket Poster -->
      <rect width="160" height="100" fill="#112A46"/>
      <rect x="0" y="0" width="80" height="100" fill="#6E3B23"/>
      <circle cx="80" cy="40" r="36" fill="#F4A91F" opacity="0.88"/>
      <circle cx="80" cy="40" r="36" fill="url(#ws7PicHalftone)" opacity="0.32"/>
      <!-- Open Hardcover Folio with Layered Pages -->
      <path d="M16,38 Q48,26 80,40 L80,82 Q48,70 16,80 Z" fill="#FFF8E8" stroke="#141B29" stroke-width="2.2"/>
      <path d="M144,38 Q112,26 80,40 L80,82 Q112,70 144,80 Z" fill="#F0DFBE" stroke="#141B29" stroke-width="2.2"/>
      <path d="M22,42 Q50,32 78,44 M138,42 Q110,32 82,44" fill="none" stroke="#C4AC82" stroke-width="1.6"/>
      <!-- Crisp Editorial Text Bars -->
      <line x1="28" y1="50" x2="66" y2="52" stroke="#008B9A" stroke-width="3" stroke-linecap="round"/>
      <line x1="28" y1="59" x2="64" y2="61" stroke="#141B29" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="28" y1="68" x2="58" y2="69" stroke="#141B29" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="94" y1="52" x2="132" y2="50" stroke="#E6397A" stroke-width="3" stroke-linecap="round"/>
      <line x1="96" y1="61" x2="132" y2="59" stroke="#141B29" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="98" y1="69" x2="124" y2="68" stroke="#141B29" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Silk Ribbon Bookmark -->
      <polygon points="75,78 85,78 85,96 80,90 75,96" fill="#E6397A"/>
      <!-- Sculpted Brass Fountain Pen Nib Obelisk -->
      <polygon points="80,8 92,32 86,44 74,44 68,32" fill="#FFD166" stroke="#141B29" stroke-width="2" stroke-linejoin="round"/>
      <line x1="80" y1="8" x2="80" y2="27" stroke="#141B29" stroke-width="2"/>
      <circle cx="80" cy="29" r="3" fill="#0D2238"/>
    `,
    LEXICON: `
      <!-- Push Pin Studios / 1966 Typographic Wit Poster -->
      <rect width="160" height="100" fill="#0E2642"/>
      <polygon points="0,0 108,0 74,100 0,100" fill="#008B9A"/>
      <polygon points="108,0 160,0 160,100 74,100" fill="#1A3D6E"/>
      <rect width="160" height="100" fill="url(#ws7PicHalftone)" opacity="0.28"/>
      <!-- Left Teal/Cream Speech Bubble with Giant Serif Quotation Sculptures -->
      <rect x="14" y="14" width="68" height="44" rx="12" fill="#FFF6E3" stroke="#141B29" stroke-width="2.2"/>
      <polygon points="30,58 22,74 46,58" fill="#FFF6E3" stroke="#141B29" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="34" cy="34" r="7.5" fill="#E6397A"/>
      <path d="M41,34 Q42,46 31,48" fill="none" stroke="#E6397A" stroke-width="4.2" stroke-linecap="round"/>
      <circle cx="57" cy="34" r="7.5" fill="#E6397A"/>
      <path d="M64,34 Q65,46 54,48" fill="none" stroke="#E6397A" stroke-width="4.2" stroke-linecap="round"/>
      <!-- Right Harvest Gold Speech Bubble -->
      <rect x="74" y="34" width="72" height="44" rx="12" fill="#F4A91F" stroke="#FFFDF7" stroke-width="2.2"/>
      <polygon points="122,78 134,93 108,78" fill="#F4A91F" stroke="#FFFDF7" stroke-width="2" stroke-linejoin="round"/>
      <!-- Brass Letter-Tile Blocks (Non-spoiler geometric glyphs) -->
      <rect x="85" y="45" width="16" height="20" rx="4" fill="#FFF6E3" stroke="#141B29" stroke-width="1.6"/>
      <rect x="104" y="45" width="16" height="20" rx="4" fill="#0D2238" stroke="#FFF6E3" stroke-width="1.6"/>
      <rect x="123" y="45" width="16" height="20" rx="4" fill="#FF6738" stroke="#141B29" stroke-width="1.6"/>
      <circle cx="93" cy="55" r="3.5" fill="#141B29"/>
      <rect x="109" y="51" width="6" height="8" rx="1" fill="#FFD166"/>
      <polygon points="131,49 135,59 127,59" fill="#FFFDF7"/>
    `,
    'FINE ARTS': `
      <!-- Matisse Cut-Out / Mondrian Studio Gallery Poster -->
      <rect width="160" height="100" fill="#102540"/>
      <rect x="0" y="0" width="46" height="58" fill="#E6397A"/>
      <rect x="46" y="0" width="114" height="32" fill="#1E56C5"/>
      <rect x="116" y="32" width="44" height="68" fill="#F4A91F"/>
      <line x1="46" y1="0" x2="46" y2="100" stroke="#0D2238" stroke-width="3.5"/>
      <line x1="0" y1="58" x2="116" y2="58" stroke="#0D2238" stroke-width="3.5"/>
      <rect width="160" height="100" fill="url(#ws7PicHalftone)" opacity="0.22"/>
      <!-- Sculpted Artist Palette -->
      <path d="M84,16 C48,16 26,34 29,56 C32,76 53,86 76,82 C88,80 87,66 98,64 C116,62 132,55 132,40 C132,24 110,16 84,16 Z" fill="#FFF6E3" stroke="#141B29" stroke-width="2.6"/>
      <circle cx="101" cy="51" r="8.5" fill="#102540" stroke="#C4AC82" stroke-width="2"/>
      <!-- 6 Luminous Living Color Pigment Dabs -->
      <circle cx="52" cy="40" r="7.5" fill="#E6397A"/><circle cx="72" cy="29" r="7.5" fill="#0096A6"/>
      <circle cx="96" cy="29" r="7.5" fill="#F4A91F"/><circle cx="114" cy="39" r="6.8" fill="#1E56C5"/>
      <circle cx="49" cy="60" r="7" fill="#FF6738"/><circle cx="69" cy="69" r="6.5" fill="#22C55E"/>
      <!-- Angled Sable Brush with Brass Ferrule -->
      <line x1="88" y1="86" x2="136" y2="18" stroke="#6E3B23" stroke-width="5.5" stroke-linecap="round"/>
      <line x1="125" y1="33" x2="134" y2="21" stroke="#FFD166" stroke-width="6"/>
      <polygon points="136,18 148,7 142,24" fill="#00E5FF" stroke="#141B29" stroke-width="1.4"/>
    `,
    SCREEN: `
      <!-- Saul Bass Hollywood Premiere Marquee Poster -->
      <rect width="160" height="100" fill="#0B192E"/>
      <!-- Twin Premiere Searchlight Beams -->
      <polygon points="18,100 72,0 98,0 38,100" fill="#FFD166" opacity="0.24"/>
      <polygon points="142,100 62,0 88,0 122,100" fill="#00E5FF" opacity="0.2"/>
      <!-- Spoked 35mm Cinema Film Reel Behind -->
      <circle cx="122" cy="38" r="28" fill="#1E56C5" stroke="#FFD166" stroke-width="3"/>
      <circle cx="122" cy="24" r="5.5" fill="#0B192E"/><circle cx="135" cy="34" r="5.5" fill="#0B192E"/>
      <circle cx="130" cy="49" r="5.5" fill="#0B192E"/><circle cx="114" cy="49" r="5.5" fill="#0B192E"/>
      <circle cx="109" cy="34" r="5.5" fill="#0B192E"/><circle cx="122" cy="38" r="5" fill="#FFFDF7"/>
      <!-- Foreground Hollywood Director Clapboard -->
      <rect x="20" y="38" width="84" height="48" rx="6" fill="#141B29" stroke="#FFF6E3" stroke-width="2.4"/>
      <polygon points="20,38 104,38 98,22 14,28" fill="#FFF6E3" stroke="#141B29" stroke-width="2"/>
      <polygon points="28,38 41,38 36,26 23,27" fill="#E6397A"/>
      <polygon points="52,38 65,38 60,24 47,25" fill="#00C2D6"/>
      <polygon points="76,38 89,38 84,22 71,23" fill="#FF6738"/>
      <line x1="28" y1="54" x2="96" y2="54" stroke="#FFF6E3" stroke-width="2" stroke-opacity="0.45"/>
      <polygon points="54,59 54,79 74,69" fill="#FFD166"/>
      <polygon points="26,12 29,18 35,18 30,22 32,28 26,24 20,28 22,22 17,18 23,18" fill="#FFD166"/>
    `,
    JUKEBOX: `
      <!-- 1966 Burbank Pop-Art Wurlitzer Jukebox Poster -->
      <rect width="160" height="100" fill="#151D36"/>
      <!-- Radiating Concentric Pop-Art Sound Rays -->
      <polygon points="80,52 0,0 38,0" fill="#E6397A" opacity="0.4"/>
      <polygon points="80,52 122,0 160,0" fill="#00C2D6" opacity="0.38"/>
      <polygon points="80,52 160,44 160,82" fill="#F4A91F" opacity="0.35"/>
      <polygon points="80,52 0,44 0,82" fill="#FF6738" opacity="0.35"/>
      <!-- Iconic Chrome & Neon Arched Jukebox Cabinet -->
      <path d="M36,92 L36,46 A44,36 0 0,1 124,46 L124,92 Z" fill="#E6397A" stroke="#FFD166" stroke-width="4"/>
      <path d="M44,88 L44,47 A36,29 0 0,1 116,47 L116,88 Z" fill="#0D2238" stroke="#00E5FF" stroke-width="2.4"/>
      <!-- Glossy 45rpm Vinyl Record Inside Showcase Arch -->
      <circle cx="80" cy="48" r="22" fill="#141B29" stroke="#FFF6E3" stroke-width="2"/>
      <circle cx="80" cy="48" r="16" fill="none" stroke="#364A66" stroke-width="1.3"/>
      <circle cx="80" cy="48" r="9.5" fill="#FF6738"/>
      <circle cx="80" cy="48" r="3.2" fill="#FFFDF7"/>
      <path d="M64,39 A18,18 0 0,1 78,31" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.55" stroke-linecap="round"/>
      <!-- Illuminated Selector Grille -->
      <rect x="52" y="74" width="56" height="10" rx="4" fill="#FFD166" stroke="#141B29" stroke-width="1.6"/>
      <line x1="62" y1="74" x2="62" y2="84" stroke="#141B29" stroke-width="1.8"/>
      <line x1="74" y1="74" x2="74" y2="84" stroke="#141B29" stroke-width="1.8"/>
      <line x1="86" y1="74" x2="86" y2="84" stroke="#141B29" stroke-width="1.8"/>
      <line x1="98" y1="74" x2="98" y2="84" stroke="#141B29" stroke-width="1.8"/>
      <!-- Dancing Beamed Eighth-Notes -->
      <path d="M18,32 L18,16 L32,12 L32,27" fill="none" stroke="#FFD166" stroke-width="3" stroke-linecap="round"/>
      <circle cx="14" cy="33" r="4.5" fill="#FFD166"/><circle cx="28" cy="28" r="4.5" fill="#FFD166"/>
      <path d="M138,34 L138,16 L149,19" fill="none" stroke="#00E5FF" stroke-width="3" stroke-linecap="round"/>
      <circle cx="134" cy="35" r="4.5" fill="#00E5FF"/>
    `,
    FINANCE: `
      <!-- 1966 Fortune Magazine Wall Street Ticker & Bullion Vault Poster -->
      <rect width="160" height="100" fill="#0A1E36"/>
      <polygon points="0,0 78,0 44,100 0,100" fill="#103254"/>
      <polygon points="94,100 160,42 160,100" fill="#0D4B59" opacity="0.72"/>
      <rect width="160" height="100" fill="url(#ws7PicHalftone)" opacity="0.28"/>
      <!-- Precision Architectural Grid & Baseline -->
      <line x1="10" y1="22" x2="150" y2="22" stroke="#FFF6E3" stroke-opacity="0.16" stroke-width="1"/>
      <line x1="10" y1="44" x2="150" y2="44" stroke="#FFF6E3" stroke-opacity="0.16" stroke-width="1"/>
      <line x1="10" y1="66" x2="150" y2="66" stroke="#FFF6E3" stroke-opacity="0.16" stroke-width="1"/>
      <line x1="10" y1="86" x2="150" y2="86" stroke="#FFD166" stroke-width="2"/>
      <!-- 3 Faceted Mid-Century Skyscraper Bar Monoliths with Shadow Planes -->
      <rect x="14" y="58" width="16" height="28" fill="#00B4C7"/>
      <rect x="24" y="58" width="6" height="28" fill="#006D7A"/>
      <polygon points="14,58 18,54 34,54 30,58" fill="#7EF2F8"/>
      <rect x="38" y="42" width="16" height="44" fill="#2A6CE8"/>
      <rect x="48" y="42" width="6" height="44" fill="#123682"/>
      <polygon points="38,42 42,38 58,38 54,42" fill="#82B4FF"/>
      <rect x="62" y="24" width="16" height="62" fill="#F4A91F"/>
      <rect x="72" y="24" width="6" height="62" fill="#B87000"/>
      <polygon points="62,24 66,20 82,20 78,24" fill="#FFE694"/>
      <!-- Luminous Emerald Trendline with Diamond Data Nodes -->
      <polyline points="14,48 46,32 70,15 104,17" fill="none" stroke="#34D378" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="110,17 98,10 100,24" fill="#7EF2AD"/>
      <polygon points="46,27 51,32 46,37 41,32" fill="#FFFDF7" stroke="#141B29" stroke-width="1.4"/>
      <polygon points="70,10 75,15 70,20 65,15" fill="#FFD166" stroke="#141B29" stroke-width="1.4"/>
      <!-- Iconic 1966 Glass-Dome Brass Edison Stock Ticker & Curling Paper Tape -->
      <path d="M98,66 L98,42 A22,22 0 0,1 142,42 L142,66 Z" fill="#00E5FF" fill-opacity="0.18" stroke="#FFF6E3" stroke-width="2"/>
      <path d="M104,42 A16,16 0 0,1 120,26" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-opacity="0.65" stroke-linecap="round"/>
      <rect x="108" y="42" width="24" height="20" rx="3" fill="#FFD166" stroke="#141B29" stroke-width="1.6"/>
      <circle cx="120" cy="52" r="6" fill="#0A1E36" stroke="#F4A91F" stroke-width="2"/>
      <rect x="93" y="64" width="54" height="9" rx="3" fill="#B87000" stroke="#FFD166" stroke-width="1.8"/>
      <!-- Flowing Cream Ticker-Tape Ribbon -->
      <path d="M102,73 Q88,82 104,88 T148,84" fill="none" stroke="#FFF6E3" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M102,73 Q88,82 104,88 T148,84" fill="none" stroke="#E6397A" stroke-width="1.5" stroke-dasharray="3 4" stroke-linecap="round"/>
      <!-- Faceted 24K Gold Bullion Ingot Foreground -->
      <polygon points="116,86 122,76 146,76 152,86" fill="#FFD166" stroke="#141B29" stroke-width="1.6"/>
      <polygon points="122,76 146,76 142,80 126,80" fill="#FFF6E3"/>
    `,
    PRICING: `
      <!-- 1966 Saul Bass Retail Showcase, Brass Cash-Register Flags & Price Tag -->
      <rect width="160" height="100" fill="#0C233D"/>
      <!-- Mid-Century Sunburst & Carnaby Diagonal Geometry -->
      <polygon points="0,0 56,0 18,100 0,100" fill="#007E8C"/>
      <polygon points="118,0 160,0 160,64" fill="#F4A91F" opacity="0.88"/>
      <polygon points="94,100 160,52 160,100" fill="#E6397A" opacity="0.55"/>
      <rect width="160" height="100" fill="url(#ws7PicHalftone)" opacity="0.26"/>
      <!-- Vintage Mechanical Cash-Register Brass Pop-Up Key Flags (Behind) -->
      <line x1="78" y1="36" x2="78" y2="16" stroke="#FFD166" stroke-width="3"/>
      <rect x="66" y="10" width="24" height="16" rx="3" fill="#00C2D6" stroke="#FFFDF7" stroke-width="1.8"/>
      <rect x="70" y="15" width="16" height="6" rx="1.5" fill="#0C233D"/>
      <line x1="106" y1="36" x2="106" y2="12" stroke="#FFD166" stroke-width="3"/>
      <rect x="94" y="6" width="24" height="18" rx="3" fill="#FFD166" stroke="#141B29" stroke-width="1.8"/>
      <polygon points="106,9 109,14 114,14 110,17 111,22 106,19 101,22 102,17 98,14 103,14" fill="#E6397A"/>
      <line x1="134" y1="36" x2="134" y2="18" stroke="#FFD166" stroke-width="3"/>
      <rect x="122" y="12" width="24" height="16" rx="3" fill="#E6397A" stroke="#FFFDF7" stroke-width="1.8"/>
      <circle cx="134" cy="20" r="4" fill="#FFD166"/>
      <!-- Cast Drop Shadow Behind Hang-Tag -->
      <polygon points="28,62 58,34 138,34 138,88 58,88" fill="#061222" opacity="0.55"/>
      <!-- Braided Silk Tag Cord & Brass Grommet Loop -->
      <path d="M8,46 Q18,36 28,50 Q35,58 46,56" fill="none" stroke="#FFD166" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M12,68 Q22,74 32,60" fill="none" stroke="#FFF6E3" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Sculpted Atomic Tangerine Retail Hang-Tag with Two-Tone Shadow Plane -->
      <polygon points="24,57 54,29 134,29 134,83 54,83" fill="#FF6738" stroke="#FFF6E3" stroke-width="2.6" stroke-linejoin="round"/>
      <polygon points="54,29 134,29 134,56 24,57" fill="#FF855E" opacity="0.42"/>
      <polygon points="31,57 56,35 128,35 128,77 56,77" fill="none" stroke="#FFD166" stroke-width="1.5" stroke-dasharray="5 3"/>
      <!-- Brass Reinforced Grommet Eyelet -->
      <circle cx="48" cy="56" r="8" fill="#F4A91F" stroke="#141B29" stroke-width="1.8"/>
      <circle cx="48" cy="56" r="4" fill="#0C233D"/>
      <!-- Layered Morton Goldsholl 8-Point Price Starburst Medallion -->
      <polygon points="94,37 99,49 112,45 103,56 112,67 99,63 94,75 89,63 76,67 85,56 76,45 89,49" fill="#FFD166" stroke="#141B29" stroke-width="1.6"/>
      <circle cx="94" cy="56" r="9.5" fill="#0C233D" stroke="#FFFDF7" stroke-width="1.8"/>
      <polygon points="94,49 97,56 94,63 91,56" fill="#00E5FF"/>
      <!-- Brass Barcode/Keying Ribs -->
      <line x1="118" y1="42" x2="118" y2="70" stroke="#FFF6E3" stroke-width="2.6" stroke-linecap="round"/>
      <line x1="123" y1="46" x2="123" y2="66" stroke="#FFD166" stroke-width="2" stroke-linecap="round"/>
    `,
    ODDS: `
      <!-- 1969 Monte Carlo Mid-Century Casino Graphic -->
      <rect width="160" height="100" fill="#0B3B36"/>
      <polygon points="0,0 80,0 44,100 0,100" fill="#0E2540"/>
      <circle cx="132" cy="50" r="46" fill="none" stroke="#F4A91F" stroke-width="10" stroke-dasharray="10 10" opacity="0.45"/>
      <circle cx="132" cy="50" r="34" fill="none" stroke="#E6397A" stroke-width="4" opacity="0.65"/>
      <!-- Geometric Playing-Card Diamond Crest -->
      <polygon points="80,10 92,26 80,42 68,26" fill="#E6397A" stroke="#FFF6E3" stroke-width="2"/>
      <!-- Tumbling Mid-Century Ivory Die (Left) -->
      <g transform="rotate(-12 52 56)">
        <rect x="28" y="32" width="46" height="46" rx="10" fill="#FFF6E3" stroke="#141B29" stroke-width="2.4"/>
        <circle cx="41" cy="45" r="4.2" fill="#141B29"/><circle cx="61" cy="65" r="4.2" fill="#141B29"/>
        <circle cx="51" cy="55" r="4.6" fill="#E6397A"/>
      </g>
      <!-- Tumbling Peacock Die (Right) -->
      <g transform="rotate(14 108 58)">
        <rect x="85" y="34" width="46" height="46" rx="10" fill="#0096A6" stroke="#FFFDF7" stroke-width="2.4"/>
        <circle cx="98" cy="47" r="4" fill="#FFD166"/><circle cx="118" cy="47" r="4" fill="#FFD166"/>
        <circle cx="98" cy="67" r="4" fill="#FFD166"/><circle cx="118" cy="67" r="4" fill="#FFD166"/>
        <circle cx="108" cy="57" r="4" fill="#FFFDF7"/>
      </g>
    `,
    ATLAS: `
      <!-- Charley Harper Cartographic Globe & Compass Poster -->
      <rect width="160" height="100" fill="#0E2C4D"/>
      <path d="M0,78 Q20,70 40,78 T80,78 T120,78 T160,78 L160,100 L0,100 Z" fill="#007E8C" opacity="0.72"/>
      <circle cx="80" cy="50" r="44" fill="url(#ws7PicHalftone)" opacity="0.32"/>
      <!-- Sculpted Peacock Ocean Globe -->
      <circle cx="80" cy="50" r="38" fill="#0096A6" stroke="#FFD166" stroke-width="3"/>
      <!-- Stylized Geometric Continents -->
      <path d="M54,30 Q66,24 72,34 Q68,46 58,48 Q50,42 54,30 Z" fill="#F4A91F"/>
      <path d="M88,26 Q104,28 108,42 Q96,50 86,44 Z" fill="#FF6738"/>
      <path d="M86,54 Q100,56 102,72 Q90,76 84,66 Z" fill="#FFD166"/>
      <!-- Graticule Arcs -->
      <ellipse cx="80" cy="50" rx="19" ry="38" fill="none" stroke="#FFF6E3" stroke-width="1.5" stroke-opacity="0.78"/>
      <line x1="42" y1="50" x2="118" y2="50" stroke="#FFF6E3" stroke-width="1.6" stroke-opacity="0.82"/>
      <line x1="48" y1="32" x2="112" y2="32" stroke="#FFF6E3" stroke-width="1.2" stroke-opacity="0.55"/>
      <line x1="48" y1="68" x2="112" y2="68" stroke="#FFF6E3" stroke-width="1.2" stroke-opacity="0.55"/>
      <!-- Sharp 8-Point Brass & Crimson Compass Rose -->
      <polygon points="80,14 87,43 116,50 87,57 80,86 73,57 44,50 73,43" fill="#FFFDF7" stroke="#141B29" stroke-width="1.6"/>
      <polygon points="80,14 87,43 80,50" fill="#FF6738"/>
      <polygon points="116,50 87,57 80,50" fill="#FFD166"/>
      <circle cx="80" cy="50" r="5" fill="#0D2238" stroke="#FFD166" stroke-width="2"/>
    `,
    SPORTS: `
      <!-- 1964 Tokyo / 1968 Mexico City Olympic Stadium Poster -->
      <rect width="160" height="100" fill="#0D2442"/>
      <!-- Sweeping Olympic Track Stripes -->
      <path d="M0,78 L160,34" stroke="#E6397A" stroke-width="8"/>
      <path d="M0,88 L160,44" stroke="#FF6738" stroke-width="8"/>
      <path d="M0,98 L160,54" stroke="#00C2D6" stroke-width="8"/>
      <rect width="160" height="100" fill="url(#ws7PicHalftone)" opacity="0.22"/>
      <!-- Symmetrical Charley Harper Emerald Laurel Branches -->
      <path d="M36,78 Q24,52 44,24" fill="none" stroke="#22C55E" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M124,78 Q136,52 116,24" fill="none" stroke="#22C55E" stroke-width="3.2" stroke-linecap="round"/>
      <ellipse cx="30" cy="56" rx="7" ry="4" fill="#7EF2AD" transform="rotate(-30 30 56)"/>
      <ellipse cx="32" cy="40" rx="7" ry="4" fill="#22C55E" transform="rotate(-20 32 40)"/>
      <ellipse cx="130" cy="56" rx="7" ry="4" fill="#7EF2AD" transform="rotate(30 130 56)"/>
      <ellipse cx="128" cy="40" rx="7" ry="4" fill="#22C55E" transform="rotate(20 128 40)"/>
      <!-- 24K Gold Sculpted Olympic Trophy Chalice -->
      <path d="M54,22 Q36,24 40,42 Q44,54 58,52" fill="none" stroke="#F4A91F" stroke-width="4.2"/>
      <path d="M106,22 Q124,24 120,42 Q116,54 102,52" fill="none" stroke="#F4A91F" stroke-width="4.2"/>
      <path d="M52,16 L108,16 L102,50 Q96,67 80,67 Q64,67 58,50 Z" fill="#FFD166" stroke="#FFFDF7" stroke-width="2.4"/>
      <path d="M80,16 L108,16 L102,50 Q96,67 80,67 Z" fill="#F4A91F" opacity="0.55"/>
      <rect x="74" y="66" width="12" height="14" fill="#F4A91F"/>
      <rect x="56" y="78" width="48" height="11" rx="4" fill="#141B29" stroke="#FFD166" stroke-width="2"/>
      <polygon points="80,26 84,36 95,36 86,42 89,52 80,46 71,52 74,42 65,36 76,36" fill="#008B9A"/>
    `,
    DYNASTIES: `
      <!-- Mid-Century Museum Heraldry & Royal Crown Poster -->
      <rect width="160" height="100" fill="#132554"/>
      <polygon points="0,0 50,0 30,100 0,100" fill="#9E1649"/>
      <polygon points="110,0 160,0 160,100 130,100" fill="#9E1649"/>
      <rect width="160" height="100" fill="url(#ws7PicHalftone)" opacity="0.28"/>
      <!-- Velvet Cap Dome Behind Crown -->
      <path d="M40,66 Q80,14 120,66 Z" fill="#E6397A" stroke="#FFD166" stroke-width="2"/>
      <!-- Grand 5-Point Sovereign Gold Crown -->
      <polygon points="30,72 24,28 54,48 80,16 106,48 136,28 130,72" fill="#FFD166" stroke="#FFFDF7" stroke-width="2.6" stroke-linejoin="round"/>
      <polygon points="80,16 106,48 136,28 130,72 80,72" fill="#F4A91F" opacity="0.55"/>
      <circle cx="24" cy="25" r="4.5" fill="#FFFDF7"/><circle cx="80" cy="13" r="5.5" fill="#FFFDF7"/>
      <circle cx="136" cy="25" r="4.5" fill="#FFFDF7"/>
      <!-- Jeweled Band & Cabochons -->
      <rect x="28" y="68" width="104" height="16" rx="6" fill="#0D2238" stroke="#FFD166" stroke-width="2.4"/>
      <circle cx="80" cy="52" r="7" fill="#00C2D6" stroke="#FFFDF7" stroke-width="1.8"/>
      <circle cx="52" cy="76" r="4.5" fill="#E6397A"/><circle cx="80" cy="76" r="5" fill="#FFD166"/><circle cx="108" cy="76" r="4.5" fill="#00E5FF"/>
    `,
    HEADLINES: `
      <!-- 1966 Network Newsroom RCA 44-BX Ribbon Mic & Broadsheet -->
      <rect width="160" height="100" fill="#123059"/>
      <circle cx="116" cy="48" r="46" fill="none" stroke="#FFD166" stroke-width="2" stroke-opacity="0.35"/>
      <circle cx="116" cy="48" r="32" fill="none" stroke="#00E5FF" stroke-width="2.2" stroke-opacity="0.5"/>
      <rect width="160" height="100" fill="url(#ws7PicHalftone)" opacity="0.24"/>
      <!-- Front-Page Broadsheet (Left) -->
      <rect x="14" y="16" width="76" height="68" rx="5" fill="#FFF6E3" stroke="#141B29" stroke-width="2.2"/>
      <rect x="20" y="22" width="64" height="12" rx="2" fill="#141B29"/>
      <rect x="20" y="39" width="28" height="24" rx="2" fill="#0096A6"/>
      <line x1="54" y1="42" x2="82" y2="42" stroke="#141B29" stroke-width="3" stroke-linecap="round"/>
      <line x1="54" y1="50" x2="82" y2="50" stroke="#141B29" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="54" y1="58" x2="76" y2="58" stroke="#FF6738" stroke-width="3" stroke-linecap="round"/>
      <line x1="20" y1="71" x2="82" y2="71" stroke="#141B29" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="20" y1="78" x2="66" y2="78" stroke="#141B29" stroke-width="2.4" stroke-linecap="round"/>
      <!-- Iconic 1966 RCA 44-BX Broadcast Ribbon Microphone (Right) -->
      <rect x="102" y="16" width="28" height="48" rx="14" fill="#DCE7F2" stroke="#141B29" stroke-width="2.2"/>
      <line x1="104" y1="28" x2="128" y2="28" stroke="#141B29" stroke-width="2"/>
      <line x1="103" y1="36" x2="129" y2="36" stroke="#141B29" stroke-width="2"/>
      <line x1="103" y1="44" x2="129" y2="44" stroke="#141B29" stroke-width="2"/>
      <line x1="104" y1="52" x2="128" y2="52" stroke="#141B29" stroke-width="2"/>
      <rect x="107" y="64" width="18" height="7" rx="2" fill="#E6397A"/>
      <line x1="116" y1="71" x2="116" y2="88" stroke="#FFD166" stroke-width="4"/>
      <rect x="98" y="85" width="36" height="7" rx="3.5" fill="#F4A91F"/>
    `,
    FOLKLORE: `
      <!-- Charley Harper Nocturnal Myth, Armillary Astrolabe & Lantern Print -->
      <rect width="160" height="100" fill="#081632"/>
      <!-- Concentric Nocturnal Sky Halos & Astrolabe Arcs -->
      <circle cx="62" cy="46" r="46" fill="#0F2A54"/>
      <circle cx="62" cy="46" r="34" fill="none" stroke="#FFD166" stroke-width="1.2" stroke-opacity="0.4" stroke-dasharray="4 4"/>
      <ellipse cx="62" cy="46" rx="44" ry="18" transform="rotate(-18 62 46)" fill="none" stroke="#00E5FF" stroke-width="1.3" stroke-opacity="0.45"/>
      <rect width="160" height="100" fill="url(#ws7PicHalftone)" opacity="0.22"/>
      <!-- 3-Tier Charley Harper Mountain & Pine Silhouette Ridge -->
      <polygon points="0,78 24,52 48,78" fill="#12385B"/>
      <polygon points="96,80 126,46 156,80" fill="#12385B"/>
      <path d="M0,74 Q42,54 88,76 T160,70 L160,100 L0,100 Z" fill="#0F4D66"/>
      <path d="M0,86 Q56,68 112,86 T160,82 L160,100 L0,100 Z" fill="#007E8C"/>
      <!-- Geometric Mid-Century Pine Trees Along Left Ridge -->
      <polygon points="18,62 11,80 25,80" fill="#09293D"/>
      <polygon points="31,68 25,84 37,84" fill="#09293D"/>
      <polygon points="142,64 135,82 149,82" fill="#09293D"/>
      <!-- Luminous Two-Tone Sculpted Crescent Moon -->
      <path d="M58,12 A31,31 0 1,0 92,62 A23,23 0 1,1 58,12 Z" fill="#FFD166" stroke="#FFFDF7" stroke-width="2"/>
      <path d="M58,12 A31,31 0 0,0 38,54 A25,25 0 0,1 58,12 Z" fill="#F4A91F" opacity="0.6"/>
      <!-- Faceted Pagoda Storyteller's Brass Lantern + Radial Light Aura -->
      <circle cx="76" cy="48" r="16" fill="#FF6738" fill-opacity="0.25"/>
      <line x1="76" y1="22" x2="76" y2="33" stroke="#FFD166" stroke-width="2.2"/>
      <polygon points="64,34 88,34 84,30 68,30" fill="#FFD166" stroke="#141B29" stroke-width="1.2"/>
      <polygon points="67,34 85,34 89,56 63,56" fill="#FF6738" stroke="#FFFDF7" stroke-width="1.8"/>
      <polygon points="76,34 85,34 89,56 76,56" fill="#D9381E" opacity="0.55"/>
      <rect x="65" y="56" width="22" height="5" rx="2" fill="#FFD166" stroke="#141B29" stroke-width="1.2"/>
      <polygon points="76,39 81,46 76,53 71,46" fill="#FFFDF7"/>
      <!-- Constellation Starburst & Sightlines -->
      <polyline points="106,20 126,38 144,18 134,54" fill="none" stroke="#00E5FF" stroke-width="1.5" stroke-dasharray="3 3"/>
      <polygon points="106,10 109,18 117,20 109,22 106,30 103,22 95,20 103,18" fill="#00E5FF"/>
      <polygon points="144,12 146,17 151,18 146,19 144,24 142,19 137,18 142,17" fill="#E6397A"/>
      <circle cx="126" cy="38" r="4" fill="#FFD166" stroke="#FFFDF7" stroke-width="1.2"/>
      <circle cx="20" cy="24" r="3" fill="#FFF6E3"/>
      <circle cx="134" cy="54" r="3.4" fill="#FFD166"/>
    `,
    FALLACIES: `
      <!-- M.C. Escher / Saul Bass Optical Paradox & Brass Loupe Plate -->
      <rect width="160" height="100" fill="#0B1B34"/>
      <polygon points="0,0 160,0 0,100" fill="#16325C"/>
      <!-- Perspective Checkered Optical Floor & Concentric Target Arcs -->
      <polygon points="0,78 160,78 160,100 0,100" fill="#0E2547"/>
      <line x1="0" y1="78" x2="160" y2="78" stroke="#00E5FF" stroke-width="1.5" stroke-opacity="0.5"/>
      <line x1="36" y1="78" x2="10" y2="100" stroke="#FFF6E3" stroke-opacity="0.2" stroke-width="1.2"/>
      <line x1="68" y1="78" x2="58" y2="100" stroke="#FFF6E3" stroke-opacity="0.2" stroke-width="1.2"/>
      <line x1="100" y1="78" x2="112" y2="100" stroke="#FFF6E3" stroke-opacity="0.2" stroke-width="1.2"/>
      <line x1="132" y1="78" x2="156" y2="100" stroke="#FFF6E3" stroke-opacity="0.2" stroke-width="1.2"/>
      <circle cx="72" cy="52" r="42" fill="none" stroke="#FFD166" stroke-width="1.2" stroke-opacity="0.28" stroke-dasharray="6 4"/>
      <circle cx="72" cy="52" r="30" fill="none" stroke="#E6397A" stroke-width="1.2" stroke-opacity="0.32"/>
      <rect width="160" height="100" fill="url(#ws7PicHalftone)" opacity="0.24"/>
      <!-- Cast Shadow Beneath Penrose Paradox Tribar -->
      <ellipse cx="76" cy="89" rx="48" ry="6" fill="#040B17" opacity="0.65"/>
      <!-- 3-Plane Faceted Penrose Impossible Tribar with Specular Miter Edges -->
      <polygon points="72,10 118,86 100,86 72,39 44,86 26,86" fill="#FFD166" stroke="#141B29" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="72,10 84,10 130,86 118,86" fill="#E6397A" stroke="#141B29" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="26,86 118,86 110,73 44,73" fill="#00C2D6" stroke="#141B29" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="72,39 87,64 57,64" fill="#0B1B34" stroke="#141B29" stroke-width="1.6"/>
      <!-- Inner Bevel Highlights for Architectural Precision -->
      <line x1="72" y1="15" x2="36" y2="75" stroke="#FFFDF7" stroke-width="1.6" stroke-opacity="0.7"/>
      <line x1="81" y1="15" x2="122" y2="82" stroke="#FF8AB5" stroke-width="1.6" stroke-opacity="0.75"/>
      <line x1="34" y1="81" x2="110" y2="81" stroke="#7EF2F8" stroke-width="1.6" stroke-opacity="0.75"/>
      <!-- Sculpted Brass-Collared Detective Loupe with Chromatic Lens Glint -->
      <line x1="125" y1="67" x2="148" y2="90" stroke="#9E6300" stroke-width="9" stroke-linecap="round"/>
      <line x1="125" y1="67" x2="147" y2="89" stroke="#F4A91F" stroke-width="5.5" stroke-linecap="round"/>
      <circle cx="111" cy="53" r="22" fill="#00E5FF" fill-opacity="0.22" stroke="#141B29" stroke-width="2"/>
      <circle cx="111" cy="53" r="20" fill="none" stroke="#FFD166" stroke-width="4.2"/>
      <circle cx="111" cy="53" r="16" fill="none" stroke="#E6397A" stroke-width="1.2" stroke-opacity="0.65"/>
      <path d="M99,44 A14,14 0 0,1 119,40" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="111" cy="53" r="3" fill="#FFFDF7" opacity="0.85"/>
    `,
    CUISINE: `
      <!-- 1966 Suppers-of-the-World Mid-Century Bistro & Silver Cloche Poster -->
      <rect width="160" height="100" fill="#0C243D"/>
      <!-- Architectural Bistro Arch & Warm Terracotta/Walnut Table -->
      <path d="M22,72 L22,28 A58,28 0 0,1 138,28 L138,72 Z" fill="#133A59"/>
      <rect x="0" y="72" width="160" height="28" fill="#6E3B23"/>
      <rect x="0" y="78" width="160" height="22" fill="#522916"/>
      <line x1="0" y1="72" x2="160" y2="72" stroke="#FFD166" stroke-width="2.6"/>
      <!-- Subtle Bistro Tablecloth Runner & Cast Platter Shadow -->
      <polygon points="34,72 126,72 138,100 22,100" fill="#8C1E44" opacity="0.58"/>
      <ellipse cx="80" cy="82" rx="54" ry="5.5" fill="#1E0C04" opacity="0.6"/>
      <rect width="160" height="72" fill="url(#ws7PicHalftone)" opacity="0.22"/>
      <!-- Triple Rising Cyan & Gold Aromatic Steam Curves -->
      <path d="M58,28 Q64,19 56,11" fill="none" stroke="#00E5FF" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M80,22 Q86,13 78,6" fill="none" stroke="#FFD166" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M102,28 Q108,19 100,11" fill="none" stroke="#00E5FF" stroke-width="2.6" stroke-linecap="round"/>
      <!-- Fluted Brass Finial & Faceted Silver Gourmet Cloche Dome -->
      <rect x="75" y="30" width="10" height="5" rx="2" fill="#B87000"/>
      <circle cx="80" cy="28" r="5.8" fill="#FFD166" stroke="#141B29" stroke-width="1.6"/>
      <circle cx="78" cy="26" r="1.8" fill="#FFFDF7"/>
      <path d="M36,70 A44,35 0 0,1 124,70 Z" fill="#FFF6E3" stroke="#141B29" stroke-width="2.4"/>
      <path d="M80,35 A44,35 0 0,1 124,70 L80,70 Z" fill="#DFCCA6" opacity="0.78"/>
      <path d="M98,42 A44,35 0 0,1 124,70 L106,70 Z" fill="#B8A37D" opacity="0.48"/>
      <path d="M48,59 A32,23 0 0,1 74,41" fill="none" stroke="#FFFFFF" stroke-width="3.8" stroke-linecap="round"/>
      <line x1="37" y1="65" x2="123" y2="65" stroke="#D4B886" stroke-width="1.8"/>
      <!-- Scalloped Atomic Tangerine Charger Platter -->
      <rect x="24" y="68" width="112" height="11" rx="5.5" fill="#FF6738" stroke="#FFFDF7" stroke-width="2"/>
      <line x1="36" y1="72" x2="124" y2="72" stroke="#FFD166" stroke-width="1.6" stroke-linecap="round"/>
      <!-- Left: Precision 3-Prong Mid-Century Brass Fork -->
      <line x1="16" y1="42" x2="16" y2="67" stroke="#FFD166" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M11,28 L11,39 Q11,43 16,43 Q21,43 21,39 L21,28 M16,28 L16,42" fill="none" stroke="#FFD166" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="16" cy="67" r="2.6" fill="#F4A91F"/>
      <!-- Right: Sculpted Supper-Club Champagne Coupe with Ruby Meniscus -->
      <path d="M134,30 L154,30 Q154,46 144,48 Q134,46 134,30 Z" fill="#FFFDF7" fill-opacity="0.22" stroke="#FFFDF7" stroke-width="1.8"/>
      <path d="M136,37 L152,37 Q151,45 144,46.5 Q137,45 136,37 Z" fill="#E6397A"/>
      <line x1="144" y1="48" x2="144" y2="66" stroke="#FFD166" stroke-width="2.6"/>
      <line x1="137" y1="66" x2="151" y2="66" stroke="#FFD166" stroke-width="2.8" stroke-linecap="round"/>
    `,
  };

  return `
    <svg class="ws7-pic-emblem-svg" viewBox="0 0 160 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id="ws7PicHalftone" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.25" fill="#FFF6E3" fill-opacity="0.42"/>
        </pattern>
        <pattern id="ws7CrtScan" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2" x2="4" y2="2" stroke="#040C18" stroke-opacity="0.16" stroke-width="1"/>
        </pattern>
        <clipPath id="ws7CrtPillowMask">
          <path d="M14,2 Q80,0 146,2 Q158,2 158,14 Q160,50 158,86 Q158,98 146,98 Q80,100 14,98 Q2,98 2,86 Q0,50 2,14 Q2,2 14,2 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#ws7CrtPillowMask)">
        ${artworkByCat[category] ?? artworkByCat.ATLAS}
        <!-- Subtle 1966 RCA Color CRT Scanline & Curved Glass Reflection -->
        <rect width="160" height="100" fill="url(#ws7CrtScan)"/>
        <path d="M16,9 Q80,3 144,9" fill="none" stroke="#FFFFFF" stroke-opacity="0.28" stroke-width="3.2" stroke-linecap="round"/>
      </g>
      <path d="M14,2 Q80,0 146,2 Q158,2 158,14 Q160,50 158,86 Q158,98 146,98 Q80,100 14,98 Q2,98 2,86 Q0,50 2,14 Q2,2 14,2 Z" fill="none" stroke="#081524" stroke-width="2.5"/>
    </svg>
  `;
}

/**
 * Generates an SVG arc path centered at (cx, cy) of radius r from startDeg to endDeg,
 * where 0deg is 12 o'clock top, -140deg is lower-left, and +140deg is lower-right.
 */
function describeDialArcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const s = Math.max(-140, Math.min(140, startDeg));
  const e = Math.max(-140, Math.min(140, endDeg));
  const a0 = Math.min(s, e);
  const a1 = Math.max(s, e);
  const spanDeg = Math.max(2, a1 - a0);
  const rad0 = ((a0 - 90) * Math.PI) / 180;
  const rad1 = ((a0 + spanDeg - 90) * Math.PI) / 180;
  const x0 = cx + Math.cos(rad0) * r;
  const y0 = cy + Math.sin(rad0) * r;
  const x1 = cx + Math.cos(rad1) * r;
  const y1 = cy + Math.sin(rad1) * r;
  const largeArc = spanDeg > 180 ? 1 : 0;
  return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${largeArc},1 ${x1.toFixed(1)},${y1.toFixed(1)}`;
}

const STYLES_ID_V7 = 'ws7-tactile-contraptions-styles';

function ensureTactileContraptionsStylesV7(): void {
  if (typeof document === 'undefined') return;
  let style = document.getElementById(STYLES_ID_V7) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLES_ID_V7;
    document.head.appendChild(style);
  }
  if (style.dataset.version === '1966-living-color-wave7-gallery-w5c') {
    return;
  }
  style.dataset.version = '1966-living-color-wave7-gallery-w5c';
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
      0% {
        opacity: 0.4;
        transform: perspective(520px) rotateX(-78deg) scaleY(0.84);
      }
      70% {
        opacity: 1;
        transform: perspective(520px) rotateX(8deg) scaleY(1.03);
      }
      100% {
        opacity: 1;
        transform: perspective(520px) rotateX(0deg) scaleY(1);
      }
    }
    @keyframes ws7SparkBurst {
      0% {
        opacity: 1;
        transform: scale(0.35) rotate(-18deg);
      }
      55% {
        opacity: 1;
        transform: scale(1.25) rotate(12deg);
      }
      100% {
        opacity: 0;
        transform: scale(1.55) rotate(24deg);
      }
    }
    @keyframes ws7RailMagneticSnap {
      0% {
        transform: translateY(-9px) scale(0.92);
        box-shadow: 0 0 0 4px #FFD166, 0 0 24px rgba(255, 209, 102, 0.9);
      }
      65% {
        transform: translateY(2px) scale(1.03);
      }
      100% {
        transform: translateY(0) scale(1);
      }
    }
    @keyframes ws7ChuteRecoil {
      0% { transform: scale(1); }
      40% { transform: scale(0.93); filter: brightness(1.18); }
      100% { transform: scale(1); filter: brightness(1); }
    }
    @keyframes ws7CardDealIn {
      0% {
        opacity: 0;
        transform: translateY(10px) scale(0.94);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    @keyframes ws7SolariTickPop {
      0% { transform: scale(1); }
      45% { transform: scale(1.04); }
      100% { transform: scale(1); }
    }
    @keyframes ws7TwineDraw {
      from { stroke-dashoffset: 100; }
      to { stroke-dashoffset: 0; }
    }
    @keyframes ws7LoupeReticleLock {
      0% {
        opacity: 0;
        transform: scale(1.55);
      }
      65% {
        opacity: 1;
        transform: scale(0.94);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
    .ws7-wire-spark-burst {
      transform-box: fill-box;
      transform-origin: center;
      animation: ws7SparkBurst 0.36s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .ws7-sleeper-slot.is-magnetic-snap {
      animation: ws7RailMagneticSnap 0.28s cubic-bezier(0.22, 1.32, 0.36, 1) both;
    }
    .ws7-chute-btn.is-chute-recoil {
      animation: ws7ChuteRecoil 0.2s cubic-bezier(0.22, 1.25, 0.36, 1) both;
    }
    .ws7-sorter-deck.is-card-deal-in {
      animation: ws7CardDealIn 0.18s cubic-bezier(0.22, 1.15, 0.36, 1) both;
    }
    .ws7-dial-solari-plaque.is-detent-pop,
    .ws7-cliff-readout.is-detent-pop {
      animation: ws7SolariTickPop 0.14s ease-out;
    }
    .ws7-twine-animated {
      stroke-dasharray: 100;
      stroke-dashoffset: 0;
      animation: ws7TwineDraw 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .ws7-loupe-reticle {
      transform-box: fill-box;
      transform-origin: center;
      animation: ws7LoupeReticleLock 0.26s cubic-bezier(0.22, 1.25, 0.36, 1) both;
    }
    .ws7-pneumatic-gauge {
      display: inline-flex;
      align-items: center;
      flex: 0 0 auto;
    }
    .ws7-pneumatic-gauge-needle {
      transform-origin: 21px 19px;
      transition: transform 0.22s cubic-bezier(0.22, 1.45, 0.36, 1);
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
    @keyframes ws7ClutchHeartbeat {
      0% {
        transform: translateY(3px) scale(1);
        box-shadow:
          inset 0 2px 0 #FFFFFF,
          0 1px 0 #9E6300,
          0 0 0 3px #FFD166,
          0 0 18px rgba(255, 209, 102, 0.72);
      }
      100% {
        transform: translateY(2px) scale(1.015);
        box-shadow:
          inset 0 2px 0 #FFFFFF,
          0 1px 0 #9E6300,
          0 0 0 4px #FFF3B0,
          0 0 38px rgba(255, 190, 46, 0.98);
      }
    }
    @keyframes ws7KlaxonBeacon {
      from {
        opacity: 0.55;
        transform: scale(0.88);
      }
      to {
        opacity: 1;
        transform: scale(1.16);
      }
    }
    @keyframes ws7RevealPop {
      0% {
        transform: scale(0.82);
        opacity: 0;
      }
      70% {
        transform: scale(1.08);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes ws7PollGrow {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(1);
      }
    }
    @keyframes ws7FiftyStampSlam {
      0% {
        opacity: 0;
        transform: scale(1.42) rotate(-9deg);
      }
      65% {
        opacity: 1;
        transform: scale(0.95) rotate(-1deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(-1.5deg);
      }
    }
    @keyframes ws7PollLeaderSweep {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }

    /* Subtle 1966 Backlit Cotton Cue-Card Micro-Grain on Upper Vellum Pane */
    .ws7-clue-vellum-pane:has(~ .ws7-toy-bay > .ws7-toy-root) {
      background-image:
        repeating-linear-gradient(
          0deg,
          rgba(138, 98, 42, 0.025) 0px,
          rgba(138, 98, 42, 0.025) 1px,
          transparent 1px,
          transparent 5px
        ),
        repeating-linear-gradient(
          90deg,
          rgba(138, 98, 42, 0.018) 0px,
          rgba(138, 98, 42, 0.018) 1px,
          transparent 1px,
          transparent 6px
        ),
        linear-gradient(180deg, #fffdf9 0%, #f7eedb 100%);
    }

    /* High-contrast >=10:1 Question Header Cash & Stakes Pills across Amber/Teal/Cobalt/Vermilion ribbons */
    .ws7-clue-vellum-pane:has(~ .ws7-toy-bay > .ws7-toy-root) .ws7-cat-cash-pill {
      background: rgba(8, 21, 36, 0.92) !important;
      color: #FFF6DC !important;
      padding: 2px 9px;
      border-radius: 6px;
      box-shadow: inset 0 0 0 1.5px rgba(255, 213, 107, 0.78), 0 1px 4px rgba(0, 0, 0, 0.25);
      white-space: nowrap;
    }
    .ws7-clue-vellum-pane:has(~ .ws7-toy-bay > .ws7-toy-root) .ws7-clue-stakes-chip {
      background: rgba(8, 21, 36, 0.9) !important;
      color: #FFD56B !important;
      box-shadow: inset 0 0 0 1.5px rgba(255, 213, 107, 0.68);
    }
    .ws7-blank-nowrap {
      white-space: nowrap;
      display: inline-block;
    }

    /* Safe-centering law: centers when content fits, NEVER clips top above scrollTop=0 on extreme 185-char stems! */
    .ws7-toy-bay:has(> .ws7-toy-root) {
      justify-content: flex-start !important;
      min-height: 0;
    }

    .ws7-toy-root {
      --ws7-toy-sans: 'Plus Jakarta Sans', 'Jost', system-ui, -apple-system, 'Segoe UI', sans-serif;
      --ws7-toy-caps: 'Jost', 'Plus Jakarta Sans', system-ui, sans-serif;
      --ws7-toy-num: 'Michroma', 'Jost', 'Plus Jakarta Sans', sans-serif;
      container-type: inline-size;
      container-name: ws7toy;
      position: relative;
      flex: 0 0 auto;
      width: 100%;
      height: auto;
      min-height: 0;
      margin: auto 0;
      box-sizing: border-box;
      overflow: visible;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
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

    /* Sleek 1-Line 1966 TV Showcase Prompt Cue (TOY_02..TOY_14) */
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

    /* Illuminated 1966 Backlit Acrylite Warm TV Cream Plaque w/ Fine Cotton Micro-Grain */
    .ws7-cream-plaque {
      position: relative;
      overflow: hidden;
      background:
        repeating-linear-gradient(
          0deg,
          rgba(148, 112, 54, 0.028) 0px,
          rgba(148, 112, 54, 0.028) 1px,
          transparent 1px,
          transparent 4px
        ),
        linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0) 44%),
        linear-gradient(180deg, #FFFDF8 0%, #FFF6E3 68%, #F0DFBF 100%);
      color: #141B29;
      border: none;
      border-radius: 13px;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 0 -1.5px 0 rgba(186, 158, 108, 0.6),
        0 3.5px 0 #BFA576,
        0 7px 15px rgba(6, 18, 34, 0.28);
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

    /* Diegetic Studio Overlays & Lifeline Stamps (>= 14.5px hard floor!) */
    .ws7-meta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: 3px;
    }
    .ws7-meta-row:empty {
      display: none;
    }
    .ws7-stamp-void {
      display: inline-flex;
      align-items: center;
      padding: 1px 7px;
      border-radius: 5px;
      background: #FDE8E8;
      color: #B51722;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.15;
      transform: rotate(-2deg);
      box-shadow: inset 0 0 0 2px #B51722;
    }
    .ws7-stamp-void[data-myth-elim="true"] {
      background: #E8EFF7;
      color: #2B3E54;
      box-shadow: inset 0 0 0 2px #4A6480;
    }
    .ws7-stamp-fifty {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1px 7px;
      border-radius: 5px;
      background: #1B2838;
      color: #FFD166;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      line-height: 1.15;
      transform: rotate(-1.5deg);
      box-shadow: inset 0 0 0 1.8px #FFD166, 0 2px 6px rgba(0, 0, 0, 0.35);
      animation: ws7FiftyStampSlam 0.24s cubic-bezier(0.22, 1.32, 0.36, 1) both;
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
      font-size: 14.5px;
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
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.15;
      box-shadow: inset 0 0 0 1.8px #7B2CBF, 0 0 10px rgba(123, 44, 191, 0.25);
    }

    /* 50/50 Cut Dimmed State */
    .is-fifty-cut {
      opacity: 0.42 !important;
      filter: saturate(0.24);
      pointer-events: none !important;
      cursor: not-allowed !important;
    }
    .is-fifty-cut .ws7-pad-label,
    .is-fifty-cut .ws7-choice-copy {
      text-decoration: line-through;
      text-decoration-thickness: 2px;
      text-decoration-color: #B51722;
    }

    /* 1966 Solari Tote Audience Poll Percentage Bar Badge */
    .ws7-poll-slot {
      display: none;
      margin-top: 4px;
      width: 100%;
    }
    .ws7-poll-slot.is-visible {
      display: block;
    }
    .ws7-poll-badge {
      display: flex;
      align-items: center;
      gap: 7px;
      width: 100%;
      padding: 2px 6px;
      border-radius: 7px;
      background: #0D2238;
      box-shadow: inset 0 0 0 1.5px rgba(0, 194, 214, 0.55);
    }
    .ws7-poll-badge[data-leader="true"] {
      box-shadow: inset 0 0 0 1.8px #FFD166, 0 0 10px rgba(255, 209, 102, 0.35);
    }
    .ws7-poll-track {
      flex: 1 1 auto;
      min-width: 28px;
      height: 8px;
      border-radius: 999px;
      background: rgba(255, 246, 227, 0.16);
      overflow: hidden;
    }
    .ws7-poll-fill {
      display: block;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #0096A6 0%, #22D3EE 100%);
      transform-origin: left center;
      animation: ws7PollGrow 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .ws7-poll-badge[data-leader="true"] .ws7-poll-fill {
      background: linear-gradient(90deg, #E5980B 0%, #FFE484 42%, #FFFDF5 50%, #FFE484 58%, #E5980B 100%);
      background-size: 200% 100%;
      animation:
        ws7PollGrow 0.34s cubic-bezier(0.22, 1, 0.36, 1) both,
        ws7PollLeaderSweep 2.4s linear 0.4s infinite;
    }
    .ws7-poll-pct {
      flex: 0 0 auto;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      color: #FFF6E3;
      letter-spacing: 0.02em;
      line-height: 1.1;
      min-width: 38px;
      text-align: right;
      white-space: nowrap;
    }
    .ws7-poll-badge[data-leader="true"] .ws7-poll-pct {
      color: #FFD166;
    }

    /* Non-blocking Showcase Lifeline Ribbon (for Dial, Globe, Chrono, Patchbay, Cliffhangers) */
    .ws7-lifeline-ribbon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 9px;
      background: linear-gradient(90deg, #0C2A45 0%, #143D60 50%, #0C2A45 100%);
      box-shadow: inset 0 0 0 1.8px #00C2D6, 0 4px 12px rgba(4, 12, 24, 0.35);
      color: #FFF6E3;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-align: center;
      line-height: 1.2;
      animation: ws7RevealPop 0.22s ease-out both;
    }
    .ws7-lifeline-ribbon[data-kind="poll"] {
      box-shadow: inset 0 0 0 1.8px #FFD166, 0 4px 12px rgba(4, 12, 24, 0.35);
    }

    /* ========================================================================
       DYNAMIC 2-BEAT LOCK-IN & TRUE-ANSWER TALLY REVEAL STATES
       ======================================================================== */
    .is-console-locked .ws7-studio-pad:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong),
    .is-console-locked .ws7-pneumatic-row:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong),
    .is-console-locked .ws7-fuse-wire-btn:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong),
    .is-console-locked .ws7-vowel-drum:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong),
    .is-console-locked .ws7-shutter-key-btn:not(.is-amber-lock):not(.is-reveal-correct):not(.is-reveal-wrong) {
      opacity: 0.62;
      pointer-events: none;
    }
    .is-console-locked button {
      pointer-events: none;
    }

    /* Beat 1: Warm 2700K Amber Lock-In */
    .ws7-studio-pad.is-amber-lock,
    .ws7-pneumatic-row.is-amber-lock,
    .ws7-fuse-wire-btn.is-amber-lock,
    .ws7-vowel-drum.is-amber-lock,
    .ws7-shutter-key-btn.is-amber-lock {
      transform: translateY(3px);
      background:
        radial-gradient(circle at 50% 45%, #FFFDF7 0%, #FFF0A8 56%, #F7B728 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 1px 0 #A86B00,
        0 0 0 3px #FFD166,
        0 0 28px rgba(255, 209, 102, 0.9) !important;
    }
    .ws7-studio-pad.is-clutch-lock,
    .ws7-pneumatic-row.is-clutch-lock,
    .ws7-fuse-wire-btn.is-clutch-lock,
    .ws7-vowel-drum.is-clutch-lock,
    .ws7-shutter-key-btn.is-clutch-lock {
      animation: ws7ClutchHeartbeat 0.28s ease-in-out infinite alternate !important;
    }

    /* Beat 2: Radiant Broadcast Emerald (True Answer) */
    .ws7-studio-pad.is-reveal-correct,
    .ws7-pneumatic-row.is-reveal-correct,
    .ws7-fuse-wire-btn.is-reveal-correct,
    .ws7-vowel-drum.is-reveal-correct,
    .ws7-shutter-key-btn.is-reveal-correct {
      opacity: 1 !important;
      filter: none !important;
      transform: translateY(-1px);
      background:
        linear-gradient(180deg, #E8FFF1 0%, #B8F7D2 62%, #7CEBA8 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 #0F9D58,
        0 3px 0 #0B7A42,
        0 0 0 3px #22C55E,
        0 0 30px rgba(34, 197, 94, 0.88) !important;
    }

    /* Beat 2: Broadcast Vermilion (Wrong Pick) */
    .ws7-studio-pad.is-reveal-wrong,
    .ws7-pneumatic-row.is-reveal-wrong,
    .ws7-fuse-wire-btn.is-reveal-wrong,
    .ws7-vowel-drum.is-reveal-wrong,
    .ws7-shutter-key-btn.is-reveal-wrong {
      opacity: 1 !important;
      transform: translateY(2px);
      background:
        linear-gradient(180deg, #FFF0F0 0%, #FFD0CE 62%, #FCA5A5 100%) !important;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 #C81E1E,
        0 2px 0 #991B1B,
        0 0 0 3px #EF4444,
        0 0 26px rgba(239, 68, 68, 0.8) !important;
    }

    .ws7-lock-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 8px;
      border-radius: 999px;
      background: #141B29;
      color: #FFD166;
      box-shadow: 0 0 0 2px #FFD166, 0 0 14px rgba(255, 209, 102, 0.85);
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      line-height: 1.1;
      white-space: nowrap;
      flex: 0 0 auto;
      animation: ws7RevealPop 0.18s ease-out both;
    }
    .ws7-tally-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      min-width: 30px;
      height: 30px;
      padding: 0 8px;
      border-radius: 999px;
      font-family: var(--ws7-toy-caps);
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.03em;
      line-height: 1;
      white-space: nowrap;
      flex: 0 0 auto;
      animation: ws7RevealPop 0.18s ease-out both;
    }
    .ws7-tally-badge.is-correct {
      background: #0F8A49;
      color: #FFFFFF;
      box-shadow: 0 0 0 2px #FFFFFF, 0 0 14px rgba(34, 197, 94, 0.8);
    }
    .ws7-tally-badge.is-wrong {
      background: #C81E1E;
      color: #FFFFFF;
      box-shadow: 0 0 0 2px #FFFFFF, 0 0 14px rgba(239, 68, 68, 0.78);
    }

    /* ========================================================================
       1. TOY_01_KNIFE_SWITCH — 5 DISTINCT 1966 VISUAL TV CARD PRESENTATIONS
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
      gap: 11px;
      width: 100%;
      min-height: 56px;
      padding: 8px 13px 8px 10px;
      border: none;
      border-radius: 14px;
      background:
        radial-gradient(circle at 10px 7px, rgba(212, 165, 68, 0.55) 1.4px, transparent 1.8px),
        radial-gradient(circle at calc(100% - 7px) 7px, rgba(212, 165, 68, 0.55) 1.4px, transparent 1.8px),
        radial-gradient(circle at 10px calc(100% - 7px), rgba(212, 165, 68, 0.55) 1.4px, transparent 1.8px),
        radial-gradient(circle at calc(100% - 7px) calc(100% - 7px), rgba(212, 165, 68, 0.55) 1.4px, transparent 1.8px),
        repeating-linear-gradient(
          0deg,
          rgba(150, 114, 56, 0.025) 0px,
          rgba(150, 114, 56, 0.025) 1px,
          transparent 1px,
          transparent 4px
        ),
        linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0) 46%),
        linear-gradient(180deg, #FFFDF9 0%, #FFF6E3 66%, #EEDBB8 100%);
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 0 -2px 0 rgba(176, 146, 94, 0.48),
        inset 5.5px 0 0 var(--pad-accent),
        0 4.5px 0 #BDA273,
        0 6px 0 #7E6842,
        0 10px 20px rgba(4, 12, 24, 0.36);
      color: #141B29;
      cursor: pointer;
      text-align: left;
      transition: transform 0.1s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.12s ease, background 0.12s ease, opacity 0.14s ease;
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
    .ws7-studio-pad:hover:not(:disabled),
    .ws7-studio-pad:focus-visible:not(:disabled) {
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
    .ws7-studio-pad:active:not(:disabled),
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
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 48%, rgba(0, 0, 0, 0.14) 100%),
        linear-gradient(180deg, var(--pad-accent-top) 0%, var(--pad-accent) 100%);
      color: var(--pad-medallion-ink);
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.62),
        inset 0 -1.5px 0 rgba(0, 0, 0, 0.22),
        0 0 0 1.5px rgba(255, 255, 255, 0.72),
        0 3.5px 0 var(--pad-accent-lip);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--ws7-toy-caps);
      font-size: 19px;
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 1;
      transition: transform 0.08s ease;
    }
    .ws7-studio-pad:active:not(:disabled) .ws7-pad-medallion {
      transform: translateY(1.5px) scale(0.96);
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
    .ws7-studio-pad[data-long-word="true"] .ws7-pad-label {
      overflow-wrap: anywhere;
    }
    .ws7-pad-tail {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
    }
    .ws7-pad-lamp {
      flex: 0 0 15px;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: radial-gradient(circle at 34% 30%, #FFFFFF 0%, #FFF7E0 32%, #DFC89F 68%, #9B835B 100%);
      box-shadow:
        inset 0 1.5px 2px rgba(255, 255, 255, 0.8),
        inset 0 -1.5px 2px rgba(20, 27, 41, 0.36),
        0 0 0 2px #9AAEC2,
        0 0 0 3px rgba(20, 27, 41, 0.22);
      transition: background 0.1s ease, box-shadow 0.1s ease, transform 0.1s ease;
    }
    .ws7-studio-pad:hover:not(:disabled) .ws7-pad-lamp {
      background: radial-gradient(circle at 38% 35%, #FFFFFF 0%, #FFD166 68%, #F4A91F 100%);
      box-shadow: 0 0 12px rgba(244, 169, 31, 0.85);
    }
    .ws7-studio-pad.is-thrown .ws7-pad-lamp,
    .ws7-studio-pad.is-amber-lock .ws7-pad-lamp {
      transform: scale(1.28);
      background: radial-gradient(circle at 40% 40%, #FFFFFF 0%, #FFF3B0 55%, #FF9F1C 100%);
      box-shadow: 0 0 16px #FFD166, 0 0 28px #FF9F1C;
    }
    .ws7-studio-pad.is-reveal-correct .ws7-pad-lamp,
    .ws7-studio-pad.is-reveal-wrong .ws7-pad-lamp,
    .ws7-studio-pad.is-clutch-lock .ws7-pad-lamp {
      display: none;
    }

    /* --- CARD STYLE 2: HEADLINE_BLANK (1966 AP Teletype / Press Clipping) --- */
    .ws7-wire-masthead {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 5px 20px;
      border-radius: 9px;
      background:
        radial-gradient(circle at 7px 50%, #0D2238 2.4px, transparent 2.8px),
        radial-gradient(circle at calc(100% - 7px) 50%, #0D2238 2.4px, transparent 2.8px),
        linear-gradient(180deg, #FCF6E3 0%, #EFE2C0 100%);
      color: #141B29;
      border-top: 3px double #141B29;
      border-bottom: 3px double #141B29;
      box-shadow: inset 0 1px 0 #FFFFFF, 0 4px 12px rgba(4, 12, 24, 0.35);
      flex: 0 0 auto;
    }
    .ws7-wire-stamp {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.015em;
      color: #B51722;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .ws7-wire-sprocket {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #B51722;
      box-shadow: 0 0 8px rgba(181, 23, 34, 0.65);
      flex: 0 0 auto;
    }
    .ws7-wire-edition {
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      color: #2B3648;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .ws7-style-headline_blank .ws7-studio-pad {
      border-radius: 9px;
      background:
        linear-gradient(180deg, #FDF8EA 0%, #F4E9CC 72%, #E8D7B0 100%);
      box-shadow:
        inset 0 0 0 1.5px rgba(20, 27, 41, 0.24),
        inset 0 4px 0 #141B29,
        0 4px 0 #9E8A63,
        0 7px 15px rgba(4, 12, 24, 0.32);
    }
    .ws7-style-headline_blank .ws7-pad-medallion {
      border-radius: 6px;
      background: linear-gradient(180deg, #283347 0%, #141B29 100%);
      color: #FBF4E0;
      box-shadow:
        inset 0 0 0 1.5px #FFD166,
        0 3px 0 #090D16;
    }
    .ws7-style-headline_blank .ws7-studio-pad:hover:not(:disabled) {
      box-shadow:
        inset 0 0 0 2px #B51722,
        inset 0 4px 0 #B51722,
        0 5px 0 #9E8A63,
        0 10px 22px rgba(4, 12, 24, 0.38);
    }

    /* --- CARD STYLE 3: PICTURE_MONITOR (1966 American Walnut & Chrome RCA CRT) --- */
    .ws7-picture-shell {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
    .ws7-picture-crt {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      border-radius: 14px;
      background:
        repeating-linear-gradient(
          92deg,
          rgba(255, 224, 178, 0.06) 0px,
          rgba(255, 224, 178, 0.06) 3px,
          rgba(34, 14, 4, 0.09) 3px,
          rgba(34, 14, 4, 0.09) 8px
        ),
        linear-gradient(180deg, #8A4D2A 0%, #63341A 56%, #4A2410 100%);
      box-shadow:
        inset 0 2px 0 rgba(255, 224, 178, 0.5),
        inset 0 0 0 2px #D6B485,
        0 4px 0 #321608,
        0 8px 18px rgba(4, 12, 24, 0.44);
      flex: 0 0 auto;
    }
    .ws7-picture-screen {
      flex: 0 0 98px;
      width: 98px;
      height: 61px;
      border-radius: 11px;
      padding: 3px;
      background: linear-gradient(155deg, #EEF4FA 0%, #9EB2C7 52%, #5D7085 100%);
      box-shadow:
        inset 0 2px 6px rgba(4, 12, 24, 0.72),
        0 1px 0 rgba(255, 240, 214, 0.45);
      overflow: hidden;
    }
    .ws7-picture-meta {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
    }
    .ws7-picture-ch-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #FFD166;
      text-transform: uppercase;
      line-height: 1.15;
    }
    .ws7-picture-onair-led {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #FF4A3D;
      box-shadow: 0 0 8px #FF4A3D;
      flex: 0 0 auto;
    }
    .ws7-picture-sub {
      font-family: var(--ws7-toy-sans);
      font-size: 14.5px;
      font-weight: 700;
      color: #FFF6E3;
      line-height: 1.18;
    }
    .ws7-picture-dials {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 0 0 auto;
    }
    .ws7-crt-knob {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background:
        conic-gradient(from 45deg, #E2ECF5 0deg, #8DA0B5 90deg, #FFFDF7 180deg, #6A7D92 270deg, #E2ECF5 360deg);
      box-shadow:
        inset 0 0 0 2.5px #1E2C3E,
        0 2px 4px rgba(0, 0, 0, 0.5);
      position: relative;
    }
    .ws7-crt-knob::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 50%;
      width: 2px;
      height: 6px;
      transform: translateX(-50%);
      background: #141B29;
      border-radius: 1px;
    }
    .ws7-style-picture_monitor .ws7-studio-pad {
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 5px 0 0 #00B2C4,
        0 4px 0 #9BB3C9,
        0 7px 16px rgba(5, 16, 32, 0.32);
    }

    /* --- CARD STYLE 4: SPOT_THE_MYTH (Cerise/Vermilion Klaxon Alert Frame) --- */
    .ws7-klaxon-banner {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      padding: 6px 12px;
      border-radius: 10px;
      background:
        repeating-linear-gradient(
          -45deg,
          rgba(255, 209, 102, 0.14) 0px,
          rgba(255, 209, 102, 0.14) 8px,
          transparent 8px,
          transparent 16px
        ),
        linear-gradient(90deg, #B4124A 0%, #E6397A 50%, #D92626 100%);
      color: #FFFFFF;
      border: 2px solid #FFD166;
      box-shadow: 0 0 18px rgba(230, 57, 122, 0.55), 0 4px 12px rgba(4, 12, 24, 0.35);
      font-family: var(--ws7-toy-caps);
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      text-align: center;
      line-height: 1.18;
      flex: 0 0 auto;
    }
    .ws7-klaxon-dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #FFD166;
      box-shadow: 0 0 10px #FFD166;
      flex: 0 0 auto;
      animation: ws7KlaxonBeacon 0.52s ease-in-out infinite alternate;
    }
    .ws7-style-spot_the_myth .ws7-classic-pads-grid {
      padding: 6px;
      border-radius: 15px;
      background: linear-gradient(135deg, rgba(230, 57, 122, 0.24) 0%, rgba(217, 38, 38, 0.22) 100%);
      box-shadow: inset 0 0 0 2px rgba(230, 57, 122, 0.65);
    }
    .ws7-style-spot_the_myth .ws7-studio-pad {
      --pad-accent: #D61F5E;
      --pad-accent-top: #F24B86;
      --pad-accent-lip: #8C113B;
      --pad-medallion-ink: #FFFDF7;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        inset 6px 0 0 #E6397A,
        0 4px 0 #B3687E,
        0 7px 16px rgba(42, 6, 20, 0.34);
    }

    /* --- CARD STYLE 5: BINARY_SPLIT (Giant 2-Paddle 50/50 TV Showdown) --- */
    .ws7-binary-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 5px 12px;
      border-radius: 10px;
      background: linear-gradient(90deg, #007E8C 0%, #0D2238 50%, #D9461A 100%);
      color: #FFFDF7;
      box-shadow: inset 0 0 0 1.8px #FFD166, 0 4px 12px rgba(4, 12, 24, 0.36);
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      text-align: center;
      flex: 0 0 auto;
    }
    .ws7-binary-arena {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 36px minmax(0, 1fr);
      align-items: stretch;
      gap: 6px;
      width: 100%;
    }
    .ws7-binary-vs {
      align-self: center;
      justify-self: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(180deg, #FFE484 0%, #F4A91F 100%);
      color: #141B29;
      box-shadow: inset 0 2px 0 #FFFFFF, 0 3px 0 #9E6300, 0 0 14px rgba(244, 169, 31, 0.65);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--ws7-toy-caps);
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.02em;
      z-index: 2;
    }
    .ws7-studio-pad.ws7-binary-paddle {
      flex-direction: column;
      align-items: stretch;
      justify-content: space-between;
      gap: 8px;
      min-height: 118px;
      padding: 0 0 10px 0;
      border-radius: 16px;
      text-align: center;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 5px 0 #BFA576,
        0 10px 22px rgba(4, 12, 24, 0.36);
    }
    .ws7-binary-cap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: 6px 11px;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #FFFDF7;
    }
    .ws7-binary-paddle[data-side="left"] .ws7-binary-cap {
      background: linear-gradient(180deg, #00C2D6 0%, #008B9A 100%);
    }
    .ws7-binary-paddle[data-side="right"] .ws7-binary-cap {
      background: linear-gradient(180deg, #FF855E 0%, #E04B1E 100%);
    }
    .ws7-binary-paddle .ws7-pad-body {
      padding: 2px 11px;
      align-items: center;
      text-align: center;
    }
    .ws7-binary-paddle .ws7-pad-label {
      font-size: clamp(18px, 4.5vw, 22px);
      font-weight: 800;
      line-height: 1.2;
      text-align: center;
    }
    .ws7-binary-paddle[data-long-word="true"] .ws7-pad-label {
      font-size: 14.5px;
      letter-spacing: -0.02em;
      overflow-wrap: break-word;
    }
    .ws7-binary-paddle[data-long-word="true"] .ws7-pad-label {
      font-size: clamp(15.5px, 3.8vw, 19px);
      letter-spacing: -0.01em;
    }
    .ws7-toy-root[data-reduced-motion="true"] .ws7-klaxon-dot,
    .ws7-toy-root[data-reduced-motion="true"] .ws7-bailout-latch.is-armed {
      animation: none !important;
    }
    .ws7-binary-paddle .ws7-pad-tail {
      justify-content: center;
      padding: 0 10px;
      min-height: 22px;
    }

    @container ws7toy (min-width: 540px) {
      .ws7-classic-pads-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .ws7-studio-pad:not(.ws7-binary-paddle) {
        min-height: 64px;
        padding: 10px 15px 10px 12px;
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
      .ws7-studio-pad.ws7-binary-paddle {
        min-height: 136px;
      }
      .ws7-binary-paddle .ws7-pad-label {
        font-size: clamp(20px, 2.2vw, 24px);
      }
    }

    /* Side-by-side CRT Picture Monitor + 2x2 Desk ONLY when bay itself >= 600px (and height > 500px)! */
    @media (min-height: 501px) {
      @container ws7toy (min-width: 600px) {
        .ws7-picture-shell {
          display: grid;
          grid-template-columns: 198px minmax(0, 1fr);
          gap: 12px;
          align-items: stretch;
        }
        .ws7-picture-crt {
          flex-direction: column;
          justify-content: center;
          text-align: center;
          padding: 10px;
          gap: 7px;
        }
        .ws7-picture-screen {
          flex: 0 0 auto;
          width: 160px;
          height: 100px;
        }
        .ws7-picture-meta {
          align-items: center;
          text-align: center;
        }
      }
    }

    @container ws7toy (max-width: 539px) {
      .ws7-classic-pads-grid {
        gap: 7px;
      }
      .ws7-studio-pad:not(.ws7-binary-paddle) {
        min-height: 54px;
        padding: 6px 11px 6px 9px;
      }
      .ws7-picture-crt {
        padding: 5px 9px;
      }
      .ws7-picture-screen {
        flex: 0 0 88px;
        width: 88px;
        height: 55px;
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
    @media (min-height: 501px) {
      @container ws7toy (min-width: 600px) {
        .ws7-pneumatic-rack {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
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
      transition: transform 0.1s ease, box-shadow 0.12s ease, opacity 0.14s ease;
    }
    @container ws7toy (max-width: 400px) {
      .ws7-pneumatic-row {
        grid-template-columns: 74px minmax(0, 1fr) 74px;
        gap: 4px;
      }
    }
    .ws7-pneumatic-port {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      min-width: 64px;
      padding: 4px 5px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: 0.02em;
      transition: transform 0.1s ease, filter 0.1s ease, box-shadow 0.1s ease;
    }
    .ws7-pneumatic-port:hover:not(:disabled) {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
    .ws7-pneumatic-port:active:not(:disabled) {
      transform: translateY(2px);
    }
    .ws7-port-insured {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 46%),
        linear-gradient(180deg, #00C2D6 0%, #008B9A 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.52), 0 3px 0 #005E69;
    }
    .ws7-port-spike {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 46%),
        linear-gradient(180deg, #FF855E 0%, #EB5525 100%);
      color: #FFFDF7;
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.52), 0 3px 0 #A8340E;
    }
    .ws7-pneumatic-slip {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 4px 6px;
      min-width: 0;
      text-align: center;
      gap: 2px;
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
    .ws7-vernier-wheel-box {
      position: relative;
      width: 152px;
      height: 152px;
      margin: 0 auto;
      touch-action: none;
      cursor: grab;
    }
    @container ws7toy (min-width: 460px) {
      .ws7-vernier-layout {
        grid-template-columns: 186px minmax(0, 1fr);
        gap: 16px;
      }
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
      gap: 7px;
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
    .ws7-range-exact-pill {
      display: none;
      padding: 4px 8px;
      border-radius: 8px;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.03em;
      text-align: center;
      line-height: 1.15;
      animation: ws7RevealPop 0.2s ease-out both;
    }
    .ws7-range-exact-pill.is-hit {
      display: block;
      background: #128547;
      color: #FFFFFF;
      box-shadow: 0 0 0 2px #86EFAC, 0 0 14px rgba(34, 197, 94, 0.65);
    }
    .ws7-range-exact-pill.is-miss {
      display: block;
      background: #B91C1C;
      color: #FFFFFF;
      box-shadow: 0 0 0 2px #FFD166, 0 0 14px rgba(239, 68, 68, 0.65);
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
       4. TOY_04_BALANCE_SCALE — Golden Studio Twin-Pan Scale
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
    @container ws7toy (min-width: 500px) {
      .ws7-weights-rack {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }
    .ws7-brass-weight {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 54px;
      min-width: 52px;
      padding: 10px 6px 6px;
      border: none;
      border-radius: 12px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0) 45%),
        linear-gradient(180deg, #FFE082 0%, #F4A91F 72%, #D48806 100%);
      color: #141B29;
      cursor: pointer;
      text-align: center;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.82),
        0 3px 0 #9E6300,
        0 5px 12px rgba(0, 0, 0, 0.28);
      transition: transform 0.12s cubic-bezier(0.22, 1.3, 0.36, 1), box-shadow 0.12s ease, opacity 0.14s ease;
    }
    .ws7-brass-weight::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(180deg, #9E6300 0%, #6E4300 100%);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
    }
    .ws7-brass-weight:hover:not(:disabled) {
      transform: translateY(-2px);
      filter: brightness(1.05);
    }
    .ws7-brass-weight.is-on-pan {
      transform: translateY(-4px);
      background: linear-gradient(180deg, #FFFDF5 0%, #FFE484 65%, #F4A91F 100%);
      box-shadow:
        0 0 0 3px #00E5FF,
        0 6px 16px rgba(0, 229, 255, 0.48);
    }
    .ws7-brass-weight.is-reveal-correct,
    .ws7-sleeper-slot.is-reveal-correct,
    .ws7-jack-socket.is-reveal-correct,
    .ws7-pin-card.is-reveal-correct,
    .ws7-cyano-legend-btn.is-reveal-correct {
      opacity: 1 !important;
      background: linear-gradient(180deg, #E8FFF1 0%, #B8F7D2 62%, #7CEBA8 100%) !important;
      color: #141B29 !important;
      box-shadow: 0 0 0 3px #22C55E, 0 0 22px rgba(34, 197, 94, 0.8) !important;
    }
    .ws7-brass-weight.is-reveal-wrong,
    .ws7-sleeper-slot.is-reveal-wrong,
    .ws7-jack-socket.is-reveal-wrong,
    .ws7-pin-card.is-reveal-wrong,
    .ws7-cyano-legend-btn.is-reveal-wrong {
      opacity: 1 !important;
      background: linear-gradient(180deg, #FFF0F0 0%, #FFD0CE 62%, #FCA5A5 100%) !important;
      color: #141B29 !important;
      box-shadow: 0 0 0 3px #EF4444, 0 0 20px rgba(239, 68, 68, 0.78) !important;
    }

    /* 5. TOY_05_RELIEF_GLOBE_3D Walnut & Brushed-Brass Turntable Rim */
    .ws7-globe-cradle-frame {
      width: 100%;
      height: clamp(192px, 32vh, 252px);
      border-radius: 15px;
      padding: 4px;
      background:
        linear-gradient(180deg, #7A4426 0%, #4E2712 100%);
      box-shadow:
        inset 0 2px 0 rgba(255, 224, 178, 0.42),
        inset 0 0 0 2px #D6B485,
        0 6px 18px rgba(4, 12, 24, 0.44);
      overflow: hidden;
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
    @container ws7toy (max-width: 400px) {
      .ws7-fuse-layout {
        grid-template-columns: minmax(0, 1fr);
        gap: 7px;
      }
      .ws7-bailout-latch {
        flex-direction: row !important;
        min-height: 48px !important;
        padding: 6px 14px !important;
        gap: 10px !important;
      }
    }
    .ws7-fuse-wires-col {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 6px;
    }
    @media (min-height: 501px) {
      @container ws7toy (min-width: 600px) {
        .ws7-fuse-wires-col {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
      }
    }
    .ws7-fuse-wire-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 6px 10px;
      min-height: 48px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      text-align: left;
      transition: transform 0.1s ease, opacity 0.14s ease, box-shadow 0.12s ease;
    }
    .ws7-fuse-wire-btn:active:not(:disabled) {
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
      font-size: 14.5px;
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
      grid-template-columns: minmax(88px, 124px) minmax(0, 1fr) minmax(88px, 124px);
      gap: 8px;
      width: 100%;
      min-height: 148px;
      align-items: stretch;
    }
    @container ws7toy (max-width: 400px) {
      .ws7-sorter-layout {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-areas:
          "deck deck"
          "left right";
        min-height: 0;
        gap: 8px;
      }
      .ws7-sorter-layout .ws7-sorter-deck {
        grid-area: deck;
        min-height: 92px;
      }
      .ws7-sorter-layout .ws7-chute-btn[data-chute="0"] {
        grid-area: left;
      }
      .ws7-sorter-layout .ws7-chute-btn[data-chute="1"] {
        grid-area: right;
      }
    }
    .ws7-sorter-deck {
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 3px 0 #C4AC82,
        0 6px 0 #EFE1C6,
        0 8px 0 #AD956B,
        0 12px 18px rgba(4, 12, 24, 0.34) !important;
    }
    .ws7-sorter-deck.is-sort-hit {
      box-shadow: 0 0 0 3px #22C55E, 0 0 22px rgba(34, 197, 94, 0.72) !important;
    }
    .ws7-sorter-deck.is-sort-miss {
      box-shadow: 0 0 0 3px #EF4444, 0 0 22px rgba(239, 68, 68, 0.72) !important;
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
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.2;
      transition: transform 0.1s ease, filter 0.1s ease, box-shadow 0.14s ease;
    }
    .ws7-chute-btn[data-chute="0"] {
      background: linear-gradient(180deg, #00C2D6 0%, #008B9A 100%);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.48), 0 4px 0 #005C66;
    }
    .ws7-chute-btn[data-chute="1"] {
      background: linear-gradient(180deg, #FF855E 0%, #EB5525 100%);
      box-shadow: inset 0 2px 0 rgba(255,255,255,0.48), 0 4px 0 #A8340E;
    }
    .ws7-chute-btn.is-lifeline-hint {
      box-shadow: 0 0 0 3px #FFD166, 0 0 22px rgba(255, 209, 102, 0.85);
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
      position: relative;
      display: grid;
      gap: 6px;
      width: 100%;
    }
    .ws7-sleepers-row::before {
      content: '';
      position: absolute;
      left: 6px;
      right: 6px;
      bottom: 2px;
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(90deg, #9E6300 0%, #FFD166 50%, #9E6300 100%);
      opacity: 0.55;
      pointer-events: none;
    }
    @container ws7toy (max-width: 400px) {
      .ws7-sleepers-row {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    }
    .ws7-chrono-year-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
      padding: 1px 6px;
      border-radius: 5px;
      background: #0D2238;
      color: #FFD166;
      font-family: var(--ws7-toy-caps);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.03em;
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
      font-size: 14.5px;
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
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 4px;
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
       9. TOY_09_SWITCHBOARD_PATCHBAY — 1966 Network Control Patchboard
       ======================================================================== */
    .ws7-patchbay-stage {
      position: relative;
      display: grid;
      grid-template-columns: minmax(110px, 1fr) 48px minmax(110px, 1fr);
      gap: 0;
      width: 100%;
      padding: 6px;
      border-radius: 13px;
      background:
        radial-gradient(circle at 8px 8px, #FFD166 1.8px, #7A4426 2.6px, transparent 3px),
        radial-gradient(circle at calc(100% - 8px) 8px, #FFD166 1.8px, #7A4426 2.6px, transparent 3px),
        radial-gradient(circle at 8px calc(100% - 8px), #FFD166 1.8px, #7A4426 2.6px, transparent 3px),
        radial-gradient(circle at calc(100% - 8px) calc(100% - 8px), #FFD166 1.8px, #7A4426 2.6px, transparent 3px),
        linear-gradient(180deg, rgba(110, 59, 35, 0.38) 0%, rgba(13, 34, 56, 0.58) 100%);
      box-shadow: inset 0 0 0 1.8px rgba(244, 169, 31, 0.45), 0 5px 14px rgba(4, 12, 24, 0.34);
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
      font-size: 14.5px;
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
    @container ws7toy (max-width: 400px) {
      .ws7-cliff-controls-row {
        grid-template-columns: minmax(0, 1fr) 110px;
        gap: 8px;
      }
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
      padding: 8px 10px;
      min-height: 54px;
      border-radius: 12px;
      background: linear-gradient(180deg, rgba(8, 21, 36, 0.72) 0%, rgba(16, 43, 68, 0.55) 100%);
      border-bottom: 3px solid #F4A91F;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.45);
    }
    .ws7-solari-word {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-wrap: nowrap;
    }
    .ws7-flap-tile {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 34px;
      padding: 0 5px;
      border-radius: 6px;
      background: linear-gradient(180deg, #FFFFFF 0%, #FFF6E3 48%, #EFE0BE 52%, #FFF6E3 100%);
      box-shadow: inset 0 1.5px 0 #FFFFFF, 0 2px 0 #B8A27A;
      color: #141B29;
      font-family: var(--ws7-toy-caps);
      font-size: 16px;
      font-weight: 900;
      line-height: 1;
    }
    .ws7-flap-tile::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 1.2px;
      background:
        radial-gradient(circle at 3px 50%, #7E6842 1.4px, transparent 1.7px),
        radial-gradient(circle at calc(100% - 3px) 50%, #7E6842 1.4px, transparent 1.7px),
        rgba(20, 27, 41, 0.28);
      pointer-events: none;
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
      gap: 3px;
      font-family: var(--ws7-toy-num);
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.05em;
      line-height: 1.2;
      transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.14s ease;
    }
    .ws7-vowel-drum:hover:not(:disabled) {
      transform: translateY(-1px);
    }
    .ws7-vowel-drum:active:not(:disabled) {
      transform: translateY(2px);
    }

    /* ========================================================================
       12. TOY_12_CONSPIRACY_LASSO — 3x3 Pop-Modernist TV Lightboard
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
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      text-align: center;
      cursor: pointer;
      z-index: 1;
      font-family: var(--ws7-toy-sans);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.16;
      color: #141B29;
      transition: transform 0.1s ease, box-shadow 0.12s ease, opacity 0.14s ease;
    }
    .ws7-pin-card.is-lassoed {
      transform: translateY(-2px);
      background: linear-gradient(180deg, #FFFDF5 0%, #FFE89E 100%);
      box-shadow: 0 0 0 3px #FF6738, 0 5px 14px rgba(255, 103, 56, 0.5);
    }
    .ws7-brass-tack {
      position: absolute;
      top: 3px;
      left: 50%;
      transform: translateX(-50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: radial-gradient(circle at 32% 30%, #FFFFFF 0%, #FF6738 48%, #9E1F0C 100%);
      box-shadow: 0 0 0 1.5px #FFD166, 0 2px 3px rgba(10, 18, 32, 0.55);
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
    @media (min-height: 501px) {
      @container ws7toy (min-width: 580px) {
        .ws7-cyano-outer[data-has-legend="true"] {
          display: grid;
          grid-template-columns: minmax(300px, 1.18fr) minmax(220px, 1fr);
          gap: 12px;
          align-items: center;
        }
        .ws7-cyano-legend-grid {
          grid-template-columns: minmax(0, 1fr);
        }
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
      padding: 4px;
      background:
        radial-gradient(circle at 7px 7px, #FFE484 1.6px, #4E2712 2.4px, transparent 2.8px),
        radial-gradient(circle at calc(100% - 7px) 7px, #FFE484 1.6px, #4E2712 2.4px, transparent 2.8px),
        radial-gradient(circle at 7px calc(100% - 7px), #FFE484 1.6px, #4E2712 2.4px, transparent 2.8px),
        radial-gradient(circle at calc(100% - 7px) calc(100% - 7px), #FFE484 1.6px, #4E2712 2.4px, transparent 2.8px),
        repeating-linear-gradient(
          92deg,
          rgba(255, 224, 178, 0.06) 0px,
          rgba(255, 224, 178, 0.06) 3px,
          rgba(34, 14, 4, 0.09) 3px,
          rgba(34, 14, 4, 0.09) 8px
        ),
        linear-gradient(180deg, #8A4D2A 0%, #63341A 56%, #4A2410 100%);
      box-shadow:
        inset 0 2px 0 rgba(255, 224, 178, 0.45),
        inset 0 0 0 2px #D6B485,
        0 6px 18px rgba(8, 22, 42, 0.45);
    }
    .ws7-cyanotype-wrap::after {
      content: '';
      position: absolute;
      inset: 4px 4px auto 4px;
      height: 22%;
      border-radius: 10px 10px 40% 40%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 100%);
      pointer-events: none;
    }
    .ws7-cyano-legend-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
      width: 100%;
    }
    .ws7-cyano-legend-btn {
      min-height: 48px;
      padding: 6px 10px;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      gap: 3px;
      cursor: pointer;
      text-align: left;
      transition: transform 0.1s ease, opacity 0.14s ease;
    }
    .ws7-cyano-legend-btn:active:not(:disabled) {
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
    @container ws7toy (max-width: 400px) {
      .ws7-shutter-top {
        grid-template-columns: minmax(0, 1fr) 98px;
        gap: 6px;
      }
    }
    .ws7-shutters-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-template-rows: repeat(2, minmax(44px, 1fr));
      gap: 6px;
    }
    .ws7-shutter-window {
      position: relative;
      padding: 6px 8px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-family: var(--ws7-toy-sans);
      font-size: 14.5px;
      font-weight: 800;
      line-height: 1.18;
      min-height: 44px;
    }
    .ws7-shutter-window.is-closed::before {
      content: '';
      position: absolute;
      inset: 4px 6px;
      border-radius: 6px;
      background: repeating-linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.14) 0px,
        rgba(255, 255, 255, 0.14) 2px,
        rgba(0, 0, 0, 0.12) 2px,
        rgba(0, 0, 0, 0.12) 7px
      );
      pointer-events: none;
    }
    .ws7-shutter-window.is-closed::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 14px;
      height: 4px;
      border-radius: 999px;
      background: linear-gradient(180deg, #FFE484 0%, #B87000 100%);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
      pointer-events: none;
    }
    .ws7-shutter-window.is-closed > span {
      position: relative;
      z-index: 1;
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
      font-size: 14.5px;
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
      justify-content: space-between;
      gap: 8px;
      transition: transform 0.1s ease, box-shadow 0.12s ease, opacity 0.14s ease;
    }

    /* ========================================================================
       Compact Mobile Portrait (390x660 / <=700px height WITH Lifeline Bar + Twist Flare):
       ZERO scrollY/scrollX overflow AND generous breathing room across ALL 14 toys!
       ======================================================================== */
    @media (max-height: 700px) and (orientation: portrait) {
      .ws7-toy-root {
        gap: 5px;
      }
      .ws7-lifeline-ribbon {
        padding: 3px 8px;
        gap: 5px;
        line-height: 1.15;
      }
      .ws7-studio-pad:not(.ws7-binary-paddle) {
        min-height: 48px;
        padding: 5px 10px 5px 8px;
      }
      .ws7-picture-crt {
        padding: 4px 8px;
        gap: 8px;
      }
      .ws7-picture-screen {
        flex: 0 0 82px;
        width: 82px;
        height: 52px;
      }
      .ws7-chrono-layout {
        gap: 5px;
      }
      .ws7-sleeper-slot {
        min-height: 48px;
        padding: 4px 5px;
      }
      .ws7-plaque-btn {
        min-height: 48px;
        padding: 5px 8px;
      }
      .ws7-patchbay-stage {
        padding: 4px 7px;
      }
      .ws7-patch-col {
        gap: 4px;
      }
      .ws7-caller-plug, .ws7-jack-socket {
        min-height: 48px;
        padding: 3px 8px;
      }
      .ws7-cyano-outer {
        gap: 5px;
      }
      .ws7-cyanotype-wrap {
        height: 132px;
      }
      .ws7-cyano-legend-grid {
        gap: 5px;
      }
      .ws7-cyano-legend-btn {
        min-height: 48px;
        padding: 4px 8px;
        gap: 2px;
      }
    }

    /* ========================================================================
       Compact Mobile Landscape (844x390 / <=500px height):
       ZERO scrollbars inside <=326px right column, EVERY button >=48px, >=14.5px!
       ======================================================================== */
    @media (max-height: 500px) and (orientation: landscape) {
      .ws7-toy-root {
        gap: 4px;
      }
      .ws7-lifeline-ribbon {
        padding: 2px 7px;
        gap: 4px;
        line-height: 1.12;
      }
      .ws7-showcase-prompt {
        padding: 0 2px;
        font-size: 14.5px;
      }
      .ws7-wire-masthead,
      .ws7-klaxon-banner,
      .ws7-binary-banner {
        padding: 3px 9px;
      }
      .ws7-picture-crt {
        padding: 4px 8px;
        gap: 8px;
      }
      .ws7-picture-screen {
        flex: 0 0 68px;
        width: 68px;
        height: 44px;
      }
      .ws7-choice-copy {
        font-size: 14.5px;
        line-height: 1.15;
      }
      .ws7-classic-pads-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
      }
      .ws7-studio-pad:not(.ws7-binary-paddle) {
        min-height: 54px;
        gap: 8px;
        padding: 6px 10px 6px 8px;
      }
      .ws7-studio-pad.ws7-binary-paddle {
        min-height: 98px;
      }
      .ws7-pad-medallion {
        flex: 0 0 34px;
        width: 34px;
        height: 34px;
        border-radius: 9px;
        font-size: 16px;
      }
      .ws7-pad-body {
        padding-right: 4px;
      }
      .ws7-pad-label {
        font-size: clamp(14.5px, 1.75vw, 16.5px);
        line-height: 1.18;
      }
      .ws7-studio-pad[data-long-word="true"] .ws7-pad-label {
        font-size: 14.5px;
        letter-spacing: -0.02em;
        overflow-wrap: break-word;
      }
      .ws7-pad-lamp {
        flex: 0 0 10px;
        width: 10px;
        height: 10px;
      }
      .ws7-pneumatic-rack {
        gap: 4px;
      }
      .ws7-pneumatic-row {
        padding: 2px 3px;
        gap: 4px;
      }
      .ws7-pneumatic-port {
        min-height: 48px;
        padding: 2px 4px;
      }
      .ws7-pneumatic-slip {
        padding: 2px 4px;
      }
      .ws7-vernier-layout {
        grid-template-columns: 158px minmax(0, 1fr);
        gap: 10px;
      }
      .ws7-vernier-wheel-box {
        width: 158px;
        height: 158px;
      }
      .ws7-vernier-readout-card {
        padding: 4px 6px;
        gap: 5px;
      }
      .ws7-scale-svg-wrap {
        height: 90px;
      }
      .ws7-brass-weight {
        min-height: 48px;
        padding: 4px;
      }
      .ws7-fuse-wires-col {
        gap: 5px;
      }
      .ws7-sorter-layout {
        min-height: 130px;
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
        padding: 3px 6px;
      }
      .ws7-patch-col {
        gap: 3px;
      }
      .ws7-caller-plug, .ws7-jack-socket {
        min-height: 48px;
        padding: 2px 7px;
      }
      .ws7-solari-rack {
        min-height: 48px;
        padding: 5px 8px;
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
        padding: 4px;
        gap: 5px;
        grid-template-rows: repeat(3, minmax(48px, 1fr));
      }
      .ws7-pin-card {
        min-height: 48px;
        padding: 8px 4px 3px;
      }
      .ws7-cyano-outer {
        gap: 4px;
      }
      .ws7-cyanotype-wrap {
        height: 118px;
      }
      .ws7-cyano-legend-grid {
        gap: 4px;
      }
      .ws7-cyano-legend-btn {
        min-height: 48px;
        padding: 3px 7px;
        gap: 1px;
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
// HTML Escaping, Prompt Helper, Lifeline Renderers & Diegetic Badges
// ----------------------------------------------------------------------------

function escHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderDomainCrestMicroSvgV7(domain: ClueRecordV7['domain']): string {
  const glyphs: Record<ClueRecordV7['domain'], string> = {
    SCI_TECH:
      '<ellipse cx="9" cy="9" rx="7" ry="3.2" transform="rotate(-32 9 9)" fill="none" stroke="#00B4C7" stroke-width="1.5"/><ellipse cx="9" cy="9" rx="7" ry="3.2" transform="rotate(32 9 9)" fill="none" stroke="#D48806" stroke-width="1.5"/><circle cx="9" cy="9" r="2.2" fill="#141B29"/>',
    POP_LIT:
      '<polygon points="9,1.5 11,6.8 16.5,7 12.2,10.5 13.7,16 9,12.8 4.3,16 5.8,10.5 1.5,7 7,6.8" fill="#F4A91F" stroke="#141B29" stroke-width="1.1"/>',
    NUM_GEO:
      '<circle cx="9" cy="9" r="7" fill="#0096A6" stroke="#141B29" stroke-width="1.3"/><ellipse cx="9" cy="9" rx="3.3" ry="7" fill="none" stroke="#FFFDF7" stroke-width="1.1"/><line x1="2" y1="9" x2="16" y2="9" stroke="#FFFDF7" stroke-width="1.1"/>',
    HIST_FACT:
      '<polygon points="9,1 10.8,7.2 17,9 10.8,10.8 9,17 7.2,10.8 1,9 7.2,7.2" fill="#E6397A" stroke="#141B29" stroke-width="1"/><circle cx="9" cy="9" r="2.3" fill="#FFD166"/>',
  };
  return `<svg width="15" height="15" viewBox="0 0 18 18" style="flex:0 0 auto;display:inline-block;" aria-hidden="true">${glyphs[domain] ?? glyphs.SCI_TECH}</svg>`;
}

function renderScissorsIconMicroSvgV7(): string {
  return '<svg width="15" height="15" viewBox="0 0 18 18" fill="none" style="flex:0 0 auto;display:inline-block;vertical-align:-2px;" aria-hidden="true"><circle cx="4.6" cy="4.8" r="2.3" stroke="currentColor" stroke-width="1.8"/><circle cx="4.6" cy="13.2" r="2.3" stroke="currentColor" stroke-width="1.8"/><path d="M6.6,6.1 L15.5,12.8 M6.6,11.9 L15.5,5.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
}

function renderPollIconMicroSvgV7(): string {
  return '<svg width="15" height="15" viewBox="0 0 18 18" fill="currentColor" style="flex:0 0 auto;display:inline-block;vertical-align:-2px;" aria-hidden="true"><rect x="2" y="9" width="3.6" height="7" rx="1"/><rect x="7.2" y="3" width="3.6" height="13" rx="1"/><rect x="12.4" y="6.2" width="3.6" height="9.8" rx="1"/></svg>';
}

const PREFIX_NUMERIC_UNIT_RE =
  /^(?:u\.?\s*s\.?\s*(?:highway|hwy|route|rte)|interstate|i-|highway|hwy|route|rte|state\s+route|sr|channel|ch\.?|apollo|studio|stage|floor|pier|no\.?|#|flight|sts-|episode|ep\.?|season|act|round|turn|level|tier|grade|class|mark|mk\.?|type|model|room|suite|deck|gate|track|line|platform|exit|milepost|ward|district|precinct|station|base|zone|sector|box|curtain|door|vault|safe|number)\b/i;

function formatNumericWithUnitV7(valueStr: string, rawUnit: string): string {
  const unit = rawUnit.trim();
  if (!unit) return valueStr;
  if (/^[$£€¥]$/.test(unit)) {
    return `${unit}${valueStr}`;
  }
  if (/^(?:%|¢|°[FC]?|′|″)$/.test(unit)) {
    return `${valueStr}${unit}`;
  }
  if (unit === '#' || /^i-$/i.test(unit) || /^sts-$/i.test(unit)) {
    return `${unit}${valueStr}`;
  }
  if (PREFIX_NUMERIC_UNIT_RE.test(unit)) {
    return `${unit} ${valueStr}`;
  }
  return `${valueStr} ${unit}`;
}

function formatNumericRangeWithUnitV7(
  minVal: number,
  maxVal: number,
  rawUnit: string,
  sep = ' – ',
): string {
  const unit = rawUnit.trim();
  if (!unit) return `${minVal}${sep}${maxVal}`;
  if (/^[$£€¥]$/.test(unit) || unit === '#' || /^i-$/i.test(unit) || /^sts-$/i.test(unit)) {
    return `${unit}${minVal}${sep}${unit}${maxVal}`;
  }
  if (/^(?:%|¢|°[FC]?|′|″)$/.test(unit)) {
    return `${minVal}${unit}${sep}${maxVal}${unit}`;
  }
  if (PREFIX_NUMERIC_UNIT_RE.test(unit)) {
    return `${unit} ${minVal}${sep}${maxVal}`;
  }
  return `${minVal}${sep}${maxVal} ${unit}`;
}

function enhanceMountedQuestionChassisV7(container: HTMLElement): void {
  const chassis = container.closest('.ws7-question-chassis');
  if (!chassis) return;

  // 1. Keep `[ _____ ]` fill-in-the-blank tokens non-breaking so `]` never orphans on mobile!
  const stemEl = chassis.querySelector('.ws7-balanced-copy') as HTMLElement | null;
  if (stemEl && !stemEl.querySelector('.ws7-blank-nowrap')) {
    const rawText = stemEl.textContent ?? '';
    const blankRe = /(\[\s*_+\s*\])/g;
    if (blankRe.test(rawText)) {
      blankRe.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let cursor = 0;
      let match: RegExpExecArray | null;
      while ((match = blankRe.exec(rawText)) !== null) {
        if (match.index > cursor) {
          frag.appendChild(document.createTextNode(rawText.slice(cursor, match.index)));
        }
        const span = document.createElement('span');
        span.className = 'ws7-blank-nowrap';
        span.textContent = match[1].replace(/\s+/g, '\u00A0');
        frag.appendChild(span);
        cursor = match.index + match[0].length;
      }
      if (cursor < rawText.length) {
        frag.appendChild(document.createTextNode(rawText.slice(cursor)));
      }
      stemEl.textContent = '';
      stemEl.appendChild(frag);
    }
  }

  // 2. Replace raw OS emojis (`✂️`, `📊`) on Lifeline buttons with crisp 1966 vector SVG icons!
  const lifelineBtns = chassis.querySelectorAll<HTMLButtonElement>('.ws7-lifeline-btn');
  lifelineBtns.forEach((btn) => {
    const txt = (btn.textContent ?? '').trim();
    if (!txt) return;
    if (btn.dataset.lifeline === 'fifty-fifty' || /✂/.test(txt)) {
      const clean = txt.replace(/✂\uFE0F?\s*/g, '').trim();
      btn.innerHTML = `<span style="display:inline-flex;align-items:center;justify-content:center;gap:6px;">${renderScissorsIconMicroSvgV7()}<span>${escHtml(clean)}</span></span>`;
    } else if (btn.dataset.lifeline === 'audience-poll' || /📊/.test(txt)) {
      const clean = txt.replace(/📊\s*/g, '').trim();
      btn.innerHTML = `<span style="display:inline-flex;align-items:center;justify-content:center;gap:6px;">${renderPollIconMicroSvgV7()}<span>${escHtml(clean)}</span></span>`;
    }
  });
}

function appendShowcasePromptBanner(root: HTMLElement, text: string): HTMLDivElement {
  const banner = document.createElement('div');
  banner.className = 'ws7-showcase-prompt';
  const starburstSvg = `<svg width="15" height="15" viewBox="0 0 18 18" style="flex:0 0 auto;vertical-align:-2px;" aria-hidden="true"><polygon points="9,0.5 11,6.2 17.5,5 12.6,9 17.5,13 11,11.8 9,17.5 7,11.8 0.5,13 5.4,9 0.5,5 7,6.2" fill="#FFD166"/><circle cx="9" cy="9" r="2.2" fill="#FFFDF7"/></svg>`;
  banner.innerHTML = `<span class="ws7-showcase-star" style="display:inline-flex;align-items:center;gap:4px;">${starburstSvg}TV BONUS</span><span>${escHtml(text)}</span>`;
  root.appendChild(banner);
  return banner;
}

function renderPollBarBadgeHtml(pct: number, isLeader: boolean): string {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  return `
    <div class="ws7-poll-badge" data-leader="${isLeader ? 'true' : 'false'}">
      <span class="ws7-poll-track"><span class="ws7-poll-fill" style="width:${clamped}%"></span></span>
      <span class="ws7-poll-pct">${isLeader ? '★ ' : ''}${clamped}%</span>
    </div>
  `;
}

function pickTwoWrongChoiceIndices(
  correctIdx: number,
  clue: ClueRecordV7,
  alreadyExcluded: ReadonlySet<number> = new Set(),
): number[] {
  const candidates: number[] = [];
  // Prefer waiverPruneIdx and non-poisoned decoy first so remaining showdown stays tense!
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

function normalizeLivePollPercentages(
  rawPercentages: readonly number[],
  liveIndices: readonly number[],
): Map<number, number> {
  const out = new Map<number, number>();
  if (liveIndices.length === 0) return out;

  // Support either full 4-slot arrays indexed by choiceIdx or compact live-length arrays
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
  // Ensure sum equals exact 100%
  if (running !== 100) {
    rounded[maxPos] = Math.max(0, rounded[maxPos] + (100 - running));
  }
  liveIndices.forEach((idx, pos) => {
    out.set(idx, rounded[pos]);
  });
  return out;
}

function appendFiftyStampToMeta(hostEl: HTMLElement): void {
  let meta = hostEl.querySelector('.ws7-meta-row') as HTMLDivElement | null;
  if (!meta) {
    meta = document.createElement('div');
    meta.className = 'ws7-meta-row';
    const body = hostEl.querySelector('.ws7-pad-body') ?? hostEl;
    body.appendChild(meta);
  }
  // Remove redundant VOID / ELIMINATED stamp when 50/50 CUT claims the same decoy pad
  meta.querySelector('.ws7-stamp-void')?.remove();
  if (!meta.querySelector('.ws7-stamp-fifty')) {
    const stamp = document.createElement('span');
    stamp.className = 'ws7-stamp-fifty';
    stamp.textContent = '50/50 CUT';
    meta.appendChild(stamp);
  }
}

/**
 * Renders the 3 diegetic metadata overlays on Warm TV Cream choices (>= 14.5px):
 *  1. `#B51722` Vermilion rubber-stamped `VOID` (or slate `ELIMINATED` on `SPOT_THE_MYTH` clues!)
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
    const isMythCard =
      Boolean(clue.isKlaxonMyth) ||
      context.cardStyle === 'SPOT_THE_MYTH' ||
      clue.cardStyle === 'SPOT_THE_MYTH';
    const label = isMythCard ? 'ELIMINATED' : 'VOID';
    badges.push(
      `<span class="ws7-stamp-void"${isMythCard ? ' data-myth-elim="true"' : ''}>${label}</span>`,
    );
  }

  if (typeof context.canaryTickIdx === 'number' && choiceIdx === context.canaryTickIdx) {
    badges.push(
      `<span class="ws7-canary-tick"><svg width="14" height="13" viewBox="0 0 14 12" fill="none" aria-hidden="true"><path d="M1.5 6.5L5.2 10L12.5 1.8" stroke="#005A9C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>CANARY TIP</span>`,
    );
  }

  if (context.uvLoupeActive && choiceIdx === clue.poisonedFixIdx) {
    badges.push(`<span class="ws7-uv-poison">RIGGED TRAP</span>`);
  }

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
  enhanceMountedQuestionChassisV7(container);

  const resolvedCardStyle: QuestionCardStyleV7 =
    toyId === 'TOY_01_KNIFE_SWITCH'
      ? resolveQuestionCardStyleV7(clue, context)
      : 'CLASSIC_CUE';
  const isClutch = Boolean(context.isClutchMoment);

  const root = document.createElement('div');
  root.className = `ws7-toy-root ws7-toy-${toyId.toLowerCase()} ws7-style-${resolvedCardStyle.toLowerCase()}`;
  root.dataset.toyId = toyId;
  root.dataset.cardStyle = resolvedCardStyle;
  root.dataset.reducedMotion = context.reducedMotion ? 'true' : 'false';
  container.appendChild(root);

  let resolved = false;
  let locking = false;
  let disposed = false;
  const mountedAtMs = typeof performance !== 'undefined' ? performance.now() : 0;
  let sawFreshPointerDown = false;
  const timers: number[] = [];
  const cleanups: Array<() => void> = [];

  // --------------------------------------------------------------------------
  // v7.5.1 Capture-Phase Input-Arming Safety (220ms + fresh pointerdown gate!)
  // Preserves keyboard Enter/Space & synthetic `.click()` (`ev.detail === 0`)
  // after 220ms while 100% blocking stale tile-tap click/pointerup bleed!
  // --------------------------------------------------------------------------
  const onRootPointerDownCapture = (ev: PointerEvent): void => {
    const elapsed = typeof performance !== 'undefined' ? performance.now() - mountedAtMs : 999;
    if (elapsed < 220) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      return;
    }
    sawFreshPointerDown = true;
  };
  const onRootClickCapture = (ev: MouseEvent): void => {
    const elapsed = typeof performance !== 'undefined' ? performance.now() - mountedAtMs : 999;
    if (elapsed < 220 || (ev.detail > 0 && !sawFreshPointerDown)) {
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

  const isInputArmed = (): boolean => {
    if (typeof performance === 'undefined') return true;
    return performance.now() - mountedAtMs >= 220;
  };

  const schedule = (fn: () => void, ms: number): void => {
    const delay = context.reducedMotion ? Math.min(80, ms) : ms;
    const id = window.setTimeout(() => {
      if (!disposed) fn();
    }, delay);
    timers.push(id);
  };

  /** Keeps Beat 1/Beat 2 lock-in & Range Game reveal clearly visible even in reduced-motion mode. */
  const scheduleReveal = (fn: () => void, ms: number, reducedFloorMs = 140): void => {
    const delay = context.reducedMotion ? Math.min(ms, reducedFloorMs) : ms;
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

  /**
   * Shared 2-Beat Studio Desk Lock-In & True-Answer Tally Flash orchestrator:
   *  - Beat 1: Warm 2700K Amber Lock-In (`160ms` normal; `600ms` pulsing heartbeat + `LOCKED IN...` when Clutch)
   *  - Beat 2: Radiant Emerald (`✓`) on true answer + Broadcast Vermilion (`✗`) on wrong pick (`290ms` / `300ms`)
   *  - Emits `emitOnce(res)` cleanly right at `~450ms` normal / `~900ms` clutch!
   */
  const runTwoBeatChoiceReveal = (opts: {
    containerEl: HTMLElement;
    chosenEl: HTMLElement;
    correctEl: HTMLElement | null;
    chosenTailSlot: HTMLElement | null;
    correctTailSlot: HTMLElement | null;
    isCorrect: boolean;
    sfx: TactileSfxEventV7;
    resolution: ToyResolutionV7;
    onBeat2Extra?: () => void;
  }): void => {
    if (resolved || locking || disposed) return;
    locking = true;
    opts.containerEl.classList.add('is-console-locked');

    // Beat 1: Warm 2700K Amber Lock-In
    opts.chosenEl.classList.add('is-thrown', 'is-amber-lock');
    if (isClutch && !context.reducedMotion) {
      opts.chosenEl.classList.add('is-clutch-lock');
    }

    let lockBadgeEl: HTMLSpanElement | null = null;
    if (isClutch && opts.chosenTailSlot) {
      lockBadgeEl = document.createElement('span');
      lockBadgeEl.className = 'ws7-lock-badge';
      lockBadgeEl.textContent = 'LOCKED IN...';
      opts.chosenTailSlot.prepend(lockBadgeEl);
    }

    context.onLockInStart?.(isClutch);
    context.onTactileSfx?.(opts.sfx);

    const beat1Ms = isClutch ? 600 : 160;
    const beat2Ms = isClutch ? 300 : 290;

    scheduleReveal(
      () => {
        if (disposed || resolved) return;
        opts.chosenEl.classList.remove('is-amber-lock', 'is-clutch-lock');
        if (lockBadgeEl && lockBadgeEl.parentElement) {
          lockBadgeEl.remove();
        }

        const placeTallyBadge = (
          slot: HTMLElement | null,
          kind: 'correct' | 'wrong',
          label: string,
        ): void => {
          if (!slot) return;
          slot.querySelectorAll('.ws7-tally-badge, .ws7-lock-badge').forEach((n) => n.remove());
          const badge = document.createElement('span');
          badge.className = `ws7-tally-badge ${kind === 'correct' ? 'is-correct' : 'is-wrong'}`;
          badge.textContent = label;
          slot.prepend(badge);
        };

        if (opts.isCorrect) {
          opts.chosenEl.classList.add('is-reveal-correct');
          placeTallyBadge(opts.chosenTailSlot, 'correct', '✓');
        } else {
          opts.chosenEl.classList.add('is-reveal-wrong');
          placeTallyBadge(opts.chosenTailSlot, 'wrong', '✗');
          if (opts.correctEl && opts.correctEl !== opts.chosenEl) {
            opts.correctEl.classList.add('is-reveal-correct');
            placeTallyBadge(opts.correctTailSlot, 'correct', '✓');
          }
        }

        opts.onBeat2Extra?.();
        context.onRevealFlash?.(opts.isCorrect);

        scheduleReveal(
          () => {
            emitOnce(opts.resolution);
          },
          beat2Ms,
          160,
        );
      },
      beat1Ms,
      isClutch ? 220 : 100,
    );
  };

  // Lifeline handler hooks populated by each toy case below
  let fiftyFiftyPruned: readonly number[] | null = null;
  let applyFiftyFiftyImpl: () => readonly number[] = () => [];
  let showAudiencePollImpl: (percentages: readonly number[]) => void = () => {};

  const upsertLifelineRibbon = (kind: 'fifty' | 'poll', html: string): void => {
    const existing = root.querySelector(`.ws7-lifeline-ribbon[data-kind="${kind}"]`) as HTMLDivElement | null;
    if (existing) {
      existing.innerHTML = html;
      return;
    }
    const ribbon = document.createElement('div');
    ribbon.className = 'ws7-lifeline-ribbon';
    ribbon.dataset.kind = kind;
    ribbon.innerHTML = html;
    const prompt = root.querySelector('.ws7-showcase-prompt');
    if (prompt && prompt.nextSibling) {
      root.insertBefore(ribbon, prompt.nextSibling);
    } else if (prompt) {
      prompt.after(ribbon);
    } else {
      root.prepend(ribbon);
    }
  };

  switch (toyId) {
    // ------------------------------------------------------------------------
    // 1. TOY_01_KNIFE_SWITCH — 5 DISTINCT 1966 VISUAL TV CARD STYLES!
    //    `CLASSIC_CUE` | `HEADLINE_BLANK` | `PICTURE_MONITOR` |
    //    `SPOT_THE_MYTH` | `BINARY_SPLIT`
    // ------------------------------------------------------------------------
    case 'TOY_01_KNIFE_SWITCH': {
      const cutIndices = new Set<number>();
      const padByChoiceIdx = new Map<number, HTMLButtonElement>();
      const tailByChoiceIdx = new Map<number, HTMLSpanElement>();
      const pollSlotByChoiceIdx = new Map<number, HTMLDivElement>();
      const visibleChoiceIndices: number[] = [];

      let optionsHostEl: HTMLElement;

      if (resolvedCardStyle === 'BINARY_SPLIT') {
        const banner = document.createElement('div');
        banner.className = 'ws7-binary-banner';
        const boltSvg = `<svg width="15" height="15" viewBox="0 0 18 18" style="flex:0 0 auto;" aria-hidden="true"><polygon points="10.5,1 3,10.5 8.8,10.5 7.5,17 15,7.5 9.2,7.5" fill="#FFD166" stroke="#141B29" stroke-width="1"/></svg>`;
        banner.innerHTML = `${boltSvg}<span style="white-space:nowrap;">50/50 SHOWDOWN · PICK ONE!</span>${renderDomainCrestMicroSvgV7(clue.domain)}`;
        root.appendChild(banner);

        const arena = document.createElement('div');
        arena.className = 'ws7-binary-arena ws7-knife-grid';
        root.appendChild(arena);
        optionsHostEl = arena;

        const foilIdx =
          clue.poisonedFixIdx !== clue.answerIdx
            ? clue.poisonedFixIdx
            : (((clue.answerIdx + 1) % 4) as 0 | 1 | 2 | 3);
        const trueOnLeft = (Math.abs(clue.qid) + clue.answerIdx) % 2 === 0;
        const pairIndices: readonly [number, number] = trueOnLeft
          ? [clue.answerIdx, foilIdx]
          : [foilIdx, clue.answerIdx];

        const sides: readonly ('left' | 'right')[] = ['left', 'right'];
        pairIndices.forEach((choiceIdx, pos) => {
          visibleChoiceIndices.push(choiceIdx);
          const side = sides[pos];
          const choiceText = clue.choices[choiceIdx];
          const leftTriSvg = '<svg width="9" height="10" viewBox="0 0 10 12" fill="currentColor" style="flex:0 0 auto;" aria-hidden="true"><polygon points="9,1 1,6 9,11"/></svg>';
          const rightTriSvg = '<svg width="9" height="10" viewBox="0 0 10 12" fill="currentColor" style="flex:0 0 auto;" aria-hidden="true"><polygon points="1,1 9,6 1,11"/></svg>';
          const sideTagHtml =
            side === 'left'
              ? `<span style="display:inline-flex;align-items:center;gap:5px;">${leftTriSvg}<span>CHOICE A</span></span>`
              : `<span style="display:inline-flex;align-items:center;gap:5px;"><span>CHOICE B</span>${rightTriSvg}</span>`;

          const pad = document.createElement('button');
          pad.type = 'button';
          pad.className = 'ws7-studio-pad ws7-knife-bay ws7-binary-paddle';
          pad.dataset.choiceIdx = String(choiceIdx);
          pad.dataset.padTone = side === 'left' ? '0' : '3';
          pad.dataset.side = side;
          if (/\S{13,}/.test(choiceText)) {
            pad.dataset.longWord = 'true';
          }
          if (!context.reducedMotion) {
            pad.dataset.animated = 'true';
            pad.style.animationDelay = `${pos * 45}ms`;
          }
          pad.setAttribute('aria-label', `${side === 'left' ? 'Left' : 'Right'} Choice: ${choiceText}`);
          pad.innerHTML = `
            <span class="ws7-binary-cap" aria-hidden="true">
              ${sideTagHtml}
            </span>
            <span class="ws7-pad-body">
              <span class="ws7-pad-label">${escHtml(choiceText)}</span>
              ${renderDiegeticChoiceOverlaysHtml(clue, choiceIdx, context)}
              <div class="ws7-poll-slot"></div>
            </span>
            <span class="ws7-pad-tail"><span class="ws7-pad-lamp" aria-hidden="true"></span></span>
          `;

          const tailEl = pad.querySelector('.ws7-pad-tail') as HTMLSpanElement;
          const pollSlot = pad.querySelector('.ws7-poll-slot') as HTMLDivElement;
          padByChoiceIdx.set(choiceIdx, pad);
          tailByChoiceIdx.set(choiceIdx, tailEl);
          pollSlotByChoiceIdx.set(choiceIdx, pollSlot);

          pad.addEventListener('pointerenter', (e: PointerEvent) => {
            if (e.pointerType === 'mouse' && !resolved && !locking && !disposed) {
              context.onTactileSfx?.('TICK');
            }
          });

          pad.addEventListener('click', () => {
            if (resolved || locking || disposed || cutIndices.has(choiceIdx) || !isInputArmed()) {
              return;
            }
            const res = buildChoiceResolution(clue, choiceIdx, 1.0);
            runTwoBeatChoiceReveal({
              containerEl: arena,
              chosenEl: pad,
              correctEl: padByChoiceIdx.get(clue.answerIdx) ?? null,
              chosenTailSlot: tailEl,
              correctTailSlot: tailByChoiceIdx.get(clue.answerIdx) ?? null,
              isCorrect: res.isCorrect,
              sfx: 'THROW_SNAP',
              resolution: res,
            });
          });

          arena.appendChild(pad);
          if (pos === 0) {
            const vsBadge = document.createElement('div');
            vsBadge.className = 'ws7-binary-vs';
            vsBadge.setAttribute('aria-hidden', 'true');
            vsBadge.textContent = 'VS';
            arena.appendChild(vsBadge);
          }
        });
      } else {
        // Style-specific 1966 TV visual frame header / picture monitor shell
        let padsParent: HTMLElement = root;

        if (resolvedCardStyle === 'HEADLINE_BLANK') {
          const masthead = document.createElement('div');
          masthead.className = 'ws7-wire-masthead';
          const wireEditionLabel = /_{2,}|\[\s*_+\s*\]|blank/i.test(clue.stem)
            ? 'FILL BLANK'
            : 'FRONT PAGE';
          masthead.innerHTML = `
            <span class="ws7-wire-stamp"><span class="ws7-wire-sprocket" aria-hidden="true"></span>STUDIO WIRE</span>
            <span class="ws7-wire-edition" style="display:inline-flex;align-items:center;gap:5px;letter-spacing:0.02em;">${renderDomainCrestMicroSvgV7(clue.domain)}<span>${wireEditionLabel}</span></span>
          `;
          root.appendChild(masthead);
        } else if (resolvedCardStyle === 'SPOT_THE_MYTH') {
          const klaxon = document.createElement('div');
          klaxon.className = 'ws7-klaxon-banner';
          const isOddOneOut = /\bodd one out\b/i.test(clue.stem);
          const isMythPrompt =
            clue.isKlaxonMyth ||
            /\b(myth|bogus|fake|hoax|never happened|false|not true|lie)\b/i.test(clue.stem);
          const klaxonCallout = isOddOneOut
            ? 'SPOT THE ODD ONE!'
            : isMythPrompt
              ? 'SPOT THE MYTH!'
              : 'BUZZER TRAP!';
          const beaconSvg = `<svg width="18" height="18" viewBox="0 0 20 20" style="flex:0 0 auto;vertical-align:-3px;" aria-hidden="true"><line x1="10" y1="1.5" x2="10" y2="4" stroke="#FFD166" stroke-width="1.8" stroke-linecap="round"/><line x1="3.2" y1="4.8" x2="5.2" y2="6.4" stroke="#FFD166" stroke-width="1.8" stroke-linecap="round"/><line x1="16.8" y1="4.8" x2="14.8" y2="6.4" stroke="#FFD166" stroke-width="1.8" stroke-linecap="round"/><path d="M5.5,14 L6.5,8.2 A3.5,3.5 0 0,1 13.5,8.2 L14.5,14 Z" fill="#FFD166" stroke="#141B29" stroke-width="1.3"/><rect x="4" y="14" width="12" height="3.2" rx="1.2" fill="#141B29" stroke="#FFFDF7" stroke-width="1"/><circle cx="9.2" cy="9.4" r="1.4" fill="#FFFDF7"/></svg>`;
          klaxon.innerHTML = `
            <span class="ws7-klaxon-dot" aria-hidden="true"></span>
            <span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;">${beaconSvg}<span>KLAXON · ${klaxonCallout}</span></span>
            <span class="ws7-klaxon-dot" aria-hidden="true"></span>
          `;
          root.appendChild(klaxon);
        } else if (resolvedCardStyle === 'PICTURE_MONITOR') {
          const shell = document.createElement('div');
          shell.className = 'ws7-picture-shell';

          const crt = document.createElement('div');
          crt.className = 'ws7-picture-crt';
          const chLabel = PICTURE_MONITOR_CHANNEL_LABELS_V7[clue.category] ?? clue.category;
          crt.innerHTML = `
            <div class="ws7-picture-screen">${renderCategoryPictureEmblemSvgV7(clue.category)}</div>
            <div class="ws7-picture-meta">
              <span class="ws7-picture-ch-tag"><span class="ws7-picture-onair-led" aria-hidden="true"></span>CH 6 · PICTURE MONITOR</span>
              <span class="ws7-picture-sub">${escHtml(chLabel)}</span>
            </div>
            <div class="ws7-picture-dials" aria-hidden="true">
              <span class="ws7-crt-knob"></span>
              <span class="ws7-crt-knob"></span>
            </div>
          `;
          shell.appendChild(crt);
          root.appendChild(shell);
          padsParent = shell;
        }

        const grid = document.createElement('div');
        grid.className = 'ws7-classic-pads-grid ws7-knife-grid';
        padsParent.appendChild(grid);
        optionsHostEl = grid;

        const hasLongUnbrokenWord = clue.choices.some((c) => /\S{15,}/.test(c));

        clue.choices.forEach((choiceText, idx) => {
          visibleChoiceIndices.push(idx);
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
              <div class="ws7-poll-slot"></div>
            </span>
            <span class="ws7-pad-tail"><span class="ws7-pad-lamp" aria-hidden="true"></span></span>
          `;

          const tailEl = pad.querySelector('.ws7-pad-tail') as HTMLSpanElement;
          const pollSlot = pad.querySelector('.ws7-poll-slot') as HTMLDivElement;
          padByChoiceIdx.set(idx, pad);
          tailByChoiceIdx.set(idx, tailEl);
          pollSlotByChoiceIdx.set(idx, pollSlot);

          pad.addEventListener('pointerenter', (e: PointerEvent) => {
            if (e.pointerType === 'mouse' && !resolved && !locking && !disposed) {
              context.onTactileSfx?.('TICK');
            }
          });

          pad.addEventListener('click', () => {
            if (resolved || locking || disposed || cutIndices.has(idx) || !isInputArmed()) {
              return;
            }
            const res = buildChoiceResolution(clue, idx, 1.0);
            runTwoBeatChoiceReveal({
              containerEl: optionsHostEl,
              chosenEl: pad,
              correctEl: padByChoiceIdx.get(clue.answerIdx) ?? null,
              chosenTailSlot: tailEl,
              correctTailSlot: tailByChoiceIdx.get(clue.answerIdx) ?? null,
              isCorrect: res.isCorrect,
              sfx: 'THROW_SNAP',
              resolution: res,
            });
          });

          grid.appendChild(pad);
        });
      }

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        const toCut =
          resolvedCardStyle === 'BINARY_SPLIT'
            ? visibleChoiceIndices.filter((i) => i !== clue.answerIdx).slice(0, 1)
            : pickTwoWrongChoiceIndices(clue.answerIdx, clue, cutIndices);

        for (const idx of toCut) {
          cutIndices.add(idx);
          const pad = padByChoiceIdx.get(idx);
          if (pad) {
            pad.classList.add('is-fifty-cut');
            pad.disabled = true;
            pad.setAttribute('aria-disabled', 'true');
            appendFiftyStampToMeta(pad);
            const slot = pollSlotByChoiceIdx.get(idx);
            if (slot) {
              slot.classList.remove('is-visible');
              slot.innerHTML = '';
            }
          }
        }
        context.onTactileSfx?.('SHUTTER_CLACK');
        return toCut;
      };

      showAudiencePollImpl = (percentages) => {
        if (resolved || locking || disposed) return;
        const live = visibleChoiceIndices.filter((i) => !cutIndices.has(i));
        const normalized = normalizeLivePollPercentages(percentages, live);
        let maxPct = -1;
        normalized.forEach((v) => {
          if (v > maxPct) maxPct = v;
        });

        visibleChoiceIndices.forEach((idx) => {
          const slot = pollSlotByChoiceIdx.get(idx);
          if (!slot) return;
          if (cutIndices.has(idx)) {
            slot.classList.remove('is-visible');
            slot.innerHTML = '';
            return;
          }
          const pct = normalized.get(idx) ?? 0;
          slot.innerHTML = renderPollBarBadgeHtml(pct, pct === maxPct && maxPct > 0);
          slot.classList.add('is-visible');
        });
        context.onTactileSfx?.('DETENT');
      };

      break;
    }

    // ------------------------------------------------------------------------
    // 2. TOY_02_CONFIDENCE_PNEUMATIC: 1966 Double-or-Safe Wager Desk
    // ------------------------------------------------------------------------
    case 'TOY_02_CONFIDENCE_PNEUMATIC': {
      const pneuBanner = appendShowcasePromptBanner(
        root,
        'Pick SAFE 0.75× or BOLD 1.25×!',
      );
      const gaugeWrap = document.createElement('span');
      gaugeWrap.className = 'ws7-pneumatic-gauge';
      gaugeWrap.setAttribute('aria-hidden', 'true');
      gaugeWrap.innerHTML = `
        <svg width="42" height="22" viewBox="0 0 42 22">
          <path d="M5,19 A16,16 0 0,1 37,19" fill="#0B1F33" stroke="#FFD166" stroke-width="2"/>
          <path d="M7,19 A14,14 0 0,1 21,5" fill="none" stroke="#00C2D6" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M21,5 A14,14 0 0,1 35,19" fill="none" stroke="#FF6738" stroke-width="3.2" stroke-linecap="round"/>
          <line class="ws7-pneumatic-gauge-needle" x1="21" y1="19" x2="21" y2="7" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="21" cy="19" r="3" fill="#FFD166"/>
        </svg>
      `;
      pneuBanner.appendChild(gaugeWrap);
      const gaugeNeedleEl = gaugeWrap.querySelector('.ws7-pneumatic-gauge-needle') as SVGLineElement | null;

      const rack = document.createElement('div');
      rack.className = 'ws7-pneumatic-rack';
      root.appendChild(rack);

      const actuaryBonusHint = context.dayJob === 'VEGAS_ACTUARY' ? ' +EV' : '';
      const cutIndices = new Set<number>();
      const rowEls: HTMLDivElement[] = [];
      const slipTailEls: HTMLDivElement[] = [];
      const pollSlots: HTMLDivElement[] = [];

      clue.choices.forEach((choiceText, idx) => {
        const row = document.createElement('div');
        row.className = 'ws7-pneumatic-row';
        row.dataset.choiceIdx = String(idx);

        const insuredBtn = document.createElement('button');
        insuredBtn.type = 'button';
        insuredBtn.className = 'ws7-pneumatic-port ws7-port-insured';
        insuredBtn.dataset.portKind = 'INSURED';
        insuredBtn.dataset.choiceIdx = String(idx);
        insuredBtn.innerHTML = `<span style="white-space:nowrap;">0.75×</span><span style="white-space:nowrap;">SAFE</span>`;

        const slip = document.createElement('div');
        slip.className = 'ws7-pneumatic-slip';
        slip.innerHTML = `
          <div class="ws7-choice-copy">${escHtml(choiceText)}</div>
          ${renderDiegeticChoiceOverlaysHtml(clue, idx, context)}
          <div class="ws7-poll-slot"></div>
          <div class="ws7-pneumatic-tail"></div>
        `;

        const spikeBtn = document.createElement('button');
        spikeBtn.type = 'button';
        spikeBtn.className = 'ws7-pneumatic-port ws7-port-spike';
        spikeBtn.dataset.portKind = 'SPIKE';
        spikeBtn.dataset.choiceIdx = String(idx);
        spikeBtn.innerHTML = `<span style="white-space:nowrap;">1.25×</span><span style="white-space:nowrap;">BOLD${actuaryBonusHint}</span>`;

        const slipTail = slip.querySelector('.ws7-pneumatic-tail') as HTMLDivElement;
        const pollSlot = slip.querySelector('.ws7-poll-slot') as HTMLDivElement;
        rowEls.push(row);
        slipTailEls.push(slipTail);
        pollSlots.push(pollSlot);

        const dispatch = (mult: 0.75 | 1.25, tag: string): void => {
          if (resolved || locking || disposed || cutIndices.has(idx) || !isInputArmed()) return;
          if (gaugeNeedleEl) {
            gaugeNeedleEl.style.transform = mult === 0.75 ? 'rotate(-50deg)' : 'rotate(54deg)';
          }
          const res = buildChoiceResolution(clue, idx, mult, `[${tag}]`);
          runTwoBeatChoiceReveal({
            containerEl: rack,
            chosenEl: row,
            correctEl: rowEls[clue.answerIdx] ?? null,
            chosenTailSlot: slipTail,
            correctTailSlot: slipTailEls[clue.answerIdx] ?? null,
            isCorrect: res.isCorrect,
            sfx: 'PNEUMATIC_THUNK',
            resolution: res,
          });
        };

        insuredBtn.addEventListener('click', () => dispatch(0.75, '0.75x SAFE'));
        spikeBtn.addEventListener('click', () => dispatch(1.25, '1.25x BOLD'));

        row.append(insuredBtn, slip, spikeBtn);
        rack.appendChild(row);
      });

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        const toCut = pickTwoWrongChoiceIndices(clue.answerIdx, clue, cutIndices);
        for (const idx of toCut) {
          cutIndices.add(idx);
          const row = rowEls[idx];
          if (row) {
            row.classList.add('is-fifty-cut');
            row.querySelectorAll('button').forEach((b) => {
              b.disabled = true;
            });
            appendFiftyStampToMeta(row);
            pollSlots[idx].classList.remove('is-visible');
            pollSlots[idx].innerHTML = '';
          }
        }
        context.onTactileSfx?.('SHUTTER_CLACK');
        return toCut;
      };

      showAudiencePollImpl = (percentages) => {
        if (resolved || locking || disposed) return;
        const live = [0, 1, 2, 3].filter((i) => !cutIndices.has(i));
        const normalized = normalizeLivePollPercentages(percentages, live);
        let maxPct = -1;
        normalized.forEach((v) => {
          if (v > maxPct) maxPct = v;
        });
        [0, 1, 2, 3].forEach((idx) => {
          const slot = pollSlots[idx];
          if (cutIndices.has(idx)) {
            slot.classList.remove('is-visible');
            slot.innerHTML = '';
            return;
          }
          const pct = normalized.get(idx) ?? 0;
          slot.innerHTML = renderPollBarBadgeHtml(pct, pct === maxPct && maxPct > 0);
          slot.classList.add('is-visible');
        });
        context.onTactileSfx?.('DETENT');
      };

      break;
    }

    // ------------------------------------------------------------------------
    // 3. TOY_03_VERNIER_DIAL: *The Price Is Right* Living Color Range Dial
    //    60fps Spring-Damper Rotor + #11 Bulbs + 420ms Range Game Exact Reveal!
    // ------------------------------------------------------------------------
    case 'TOY_03_VERNIER_DIAL': {
      appendShowcasePromptBanner(root, 'Spin the Range Dial & tap LOCK IN!');

      const num = resolveNumericPayload(clue);
      const span = Math.max(1e-6, num.max - num.min);
      const step = num.step > 0 ? num.step : 1;
      const decimals = step < 1 ? (String(step).split('.')[1]?.length ?? 1) : 0;

      let currentVal = num.min + span * 0.5;
      currentVal = Math.min(num.max, Math.max(num.min, Math.round(currentVal / step) * step));

      const formatVal = (v: number): string =>
        formatNumericWithUnitV7(v.toFixed(decimals), num.unit ?? '');

      const valToDeg = (v: number): number => {
        const norm = Math.max(0, Math.min(1, (v - num.min) / span));
        return -140 + norm * 280;
      };

      const targetDialDeg = valToDeg(num.target);
      const tolOuterStartDeg = valToDeg(num.target - span * 0.18);
      const tolOuterEndDeg = valToDeg(num.target + span * 0.18);
      const tolInnerStartDeg = valToDeg(num.target - span * 0.08);
      const tolInnerEndDeg = valToDeg(num.target + span * 0.08);
      const targetRad = ((targetDialDeg - 90) * Math.PI) / 180;
      const exactMarkerX = 100 + Math.cos(targetRad) * 82;
      const exactMarkerY = 100 + Math.sin(targetRad) * 82;

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
            <filter id="ws7GoldMarkerGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.2" flood-color="#FFD166" flood-opacity="0.95"/>
            </filter>
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
          <!-- Curved Acrylic Crystal Specular Reflection -->
          <path d="M46,56 A68,68 0 0,1 146,48" fill="none" stroke="#FFFFFF" stroke-opacity="0.42" stroke-width="4" stroke-linecap="round" pointer-events="none"/>
          <!-- 50/50 Narrowed Range Zone Arc (hidden until lifeline triggered) -->
          <path class="ws7-dial-fifty-arc" d="" fill="none" stroke="#00E5FF" stroke-width="7.5" stroke-opacity="0" stroke-linecap="round"/>
          <!-- Audience Poll Crowd Estimate Pin (hidden until lifeline triggered) -->
          <g class="ws7-dial-poll-pin" opacity="0">
            <polygon points="100,8 93,20 107,20" fill="#00E5FF" stroke="#FFFFFF" stroke-width="1.4"/>
          </g>
          <!-- Price-Is-Right Range Game Reveal: Green Tolerance Band + Glowing Gold Exact Marker -->
          <g class="ws7-dial-reveal-group" opacity="0" style="transition:opacity 0.22s ease-out;">
            <path class="ws7-dial-tol-outer" d="${describeDialArcPath(100, 100, 82, tolOuterStartDeg, tolOuterEndDeg)}" fill="none" stroke="#4ADE80" stroke-width="10" stroke-opacity="0.62" stroke-linecap="round"/>
            <path class="ws7-dial-tol-inner" d="${describeDialArcPath(100, 100, 82, tolInnerStartDeg, tolInnerEndDeg)}" fill="none" stroke="#16A34A" stroke-width="10.5" stroke-linecap="round"/>
            <g class="ws7-dial-exact-marker" filter="url(#ws7GoldMarkerGlow)">
              <line x1="100" y1="100" x2="${exactMarkerX.toFixed(1)}" y2="${exactMarkerY.toFixed(1)}" stroke="#FFD166" stroke-width="3.6" stroke-linecap="round"/>
              <circle cx="${exactMarkerX.toFixed(1)}" cy="${exactMarkerY.toFixed(1)}" r="8.2" fill="#FFD166" stroke="#FFFFFF" stroke-width="2.2"/>
              <circle cx="${exactMarkerX.toFixed(1)}" cy="${exactMarkerY.toFixed(1)}" r="3.2" fill="#0D2238"/>
            </g>
          </g>
        </svg>
      `;

      readoutCard.innerHTML = `
        <div class="ws7-dial-range-label" style="font-family:var(--ws7-toy-caps);font-size:14.5px;font-weight:800;color:#FFD166;letter-spacing:0.04em;text-align:center;">
          ${escHtml(formatNumericRangeWithUnitV7(num.min, num.max, num.unit ?? ''))}
        </div>
        <div class="ws7-dial-value ws7-dial-solari-plaque"></div>
        <div class="ws7-range-exact-pill"></div>
        <div class="ws7-dial-nudge-pair">
          <button type="button" class="ws7-step-nudge-btn" data-step-dir="-1" aria-label="Decrease value">−</button>
          <button type="button" class="ws7-step-nudge-btn" data-step-dir="1" aria-label="Increase value">+</button>
        </div>
        <button type="button" class="ws7-studio-lock-btn ws7-dial-lock-btn">LOCK IN!</button>
      `;

      layout.append(wheelBox, readoutCard);

      const rotorEl = wheelBox.querySelector('.ws7-dial-rotor') as SVGGElement;
      const lockArcEl = wheelBox.querySelector('.ws7-dial-lock-arc') as SVGCircleElement;
      const revealGroupEl = wheelBox.querySelector('.ws7-dial-reveal-group') as SVGGElement;
      const fiftyArcEl = wheelBox.querySelector('.ws7-dial-fifty-arc') as SVGPathElement;
      const pollPinEl = wheelBox.querySelector('.ws7-dial-poll-pin') as SVGGElement;
      const bulbEls = Array.from(wheelBox.querySelectorAll<SVGCircleElement>('.ws7-dial-bulb'));
      const valEl = readoutCard.querySelector('.ws7-dial-value') as HTMLDivElement;
      const exactPillEl = readoutCard.querySelector('.ws7-range-exact-pill') as HTMLDivElement;
      const lockBtn = readoutCard.querySelector('.ws7-dial-lock-btn') as HTMLButtonElement;
      const nudgeBtns = readoutCard.querySelectorAll<HTMLButtonElement>('.ws7-step-nudge-btn');

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
        if (!immediate && !context.reducedMotion) {
          valEl.classList.remove('is-detent-pop');
          void valEl.offsetWidth;
          valEl.classList.add('is-detent-pop');
        }
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
        if (resolved || locking || disposed || !isInputArmed()) return;
        locking = true;
        context.onLockInStart?.(isClutch);
        context.onTactileSfx?.('THROW_SNAP');

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
        const isHit = accuracyRatio > 0;

        // Animate Glowing Gold Exact-Answer Marker + Green Tolerance Band for 420ms!
        lockArcEl.style.stroke = isHit ? '#22C55E' : '#EF4444';
        lockArcEl.style.strokeDashoffset = '0';
        revealGroupEl.setAttribute('opacity', '1');
        lockBtn.disabled = true;
        lockBtn.textContent = isHit ? '✓ IN THE RANGE!' : '✗ OFF RANGE';
        lockBtn.style.background = isHit
          ? 'linear-gradient(180deg, #16A34A 0%, #0E7A3D 100%)'
          : 'linear-gradient(180deg, #DC2626 0%, #991B1B 100%)';

        exactPillEl.textContent = `★ EXACT: ${formatVal(num.target)}`;
        exactPillEl.className = `ws7-range-exact-pill ${isHit ? 'is-hit' : 'is-miss'}`;
        context.onRevealFlash?.(isHit);

        scheduleReveal(
          () => {
            emitOnce({
              isCorrect: isHit,
              accuracyRatio,
              chipMultiplier,
              chosenSummary: formatVal(currentVal),
              trueAnswerDisplay: formatVal(num.target),
              triggeredKlaxon: !isHit && Boolean(clue.isKlaxonMyth),
              fellForPoisonedFix: false,
            });
          },
          420,
          240,
        );
      };

      nudgeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          if (resolved || locking || disposed || !isInputArmed()) return;
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
        if (resolved || locking || disposed || !isInputArmed()) return;
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
        if (!dragging || resolved || locking || disposed) return;
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

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        const bias = ((Math.abs(clue.qid) % 5) - 2) * 0.04 * span;
        const low = Math.max(num.min, Math.round((num.target - span * 0.18 + bias) / step) * step);
        const high = Math.min(num.max, Math.round((num.target + span * 0.18 + bias) / step) * step);
        fiftyArcEl.setAttribute('d', describeDialArcPath(100, 100, 82, valToDeg(low), valToDeg(high)));
        fiftyArcEl.setAttribute('stroke-opacity', '0.88');
        upsertLifelineRibbon(
          'fifty',
          `<span class="ws7-stamp-fifty">50/50 CUT</span><span>NARROWED ZONE: ${escHtml(formatVal(low))} – ${escHtml(formatVal(high))}</span>`,
        );
        context.onTactileSfx?.('SHUTTER_CLACK');
        return [0, 1];
      };

      showAudiencePollImpl = (percentages) => {
        if (resolved || locking || disposed) return;
        const jitterSign = clue.qid % 2 === 0 ? 1 : -1;
        const crowdEst = Math.max(
          num.min,
          Math.min(num.max, Math.round((num.target + jitterSign * span * 0.045) / step) * step),
        );
        const confidence = Math.max(58, Math.min(88, Math.round(Math.max(...percentages, 68))));
        pollPinEl.setAttribute('transform', `rotate(${valToDeg(crowdEst).toFixed(1)} 100 100)`);
        pollPinEl.setAttribute('opacity', '1');
        upsertLifelineRibbon(
          'poll',
          `<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${renderPollIconMicroSvgV7()} STUDIO POLL (${confidence}% CONSENSUS): AROUND <strong style="color:#FFD166;">${escHtml(formatVal(crowdEst))}</strong></span>`,
        );
        context.onTactileSfx?.('DETENT');
      };

      break;
    }

    // ------------------------------------------------------------------------
    // 4. TOY_04_BALANCE_SCALE: Golden Studio Twin-Pan Scale
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
      const cutWeights = new Set<number>();

      const stage = document.createElement('div');
      stage.className = 'ws7-scale-svg-wrap';
      const wrapper = document.createElement('div');
      wrapper.className = 'ws7-scale-stage';

      stage.innerHTML = `
        <svg viewBox="0 0 420 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <path d="M180,25 A36,36 0 0,1 240,25" fill="none" stroke="#FFF6E3" stroke-width="2" stroke-opacity="0.55"/>
          <path d="M204,12 A36,36 0 0,1 216,12" fill="none" stroke="#2ECC71" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="187" y1="21" x2="191" y2="25" stroke="#FFD166" stroke-width="1.6"/>
          <line x1="196" y1="15" x2="199" y2="20" stroke="#FFD166" stroke-width="1.6"/>
          <line x1="210" y1="7" x2="210" y2="14" stroke="#7EF2AD" stroke-width="2.2"/>
          <line x1="224" y1="15" x2="221" y2="20" stroke="#FFD166" stroke-width="1.6"/>
          <line x1="233" y1="21" x2="229" y2="25" stroke="#FFD166" stroke-width="1.6"/>
          <polygon points="198,108 222,108 214,34 206,34" fill="#F4A91F" stroke="#FFFDF7" stroke-width="1.4"/>
          <rect x="176" y="104" width="68" height="6" rx="3" fill="#FFD166" stroke="#9E6300" stroke-width="1.2"/>
          <rect x="160" y="109" width="100" height="8.5" rx="4" fill="#00B2C4" stroke="#FFFDF7" stroke-width="1.2"/>
          <g class="ws7-scale-beam" transform="rotate(-12 210 38)">
            <rect x="64" y="35" width="292" height="6.5" rx="3.2" fill="#FFD166" stroke="#FFFDF7" stroke-width="1.2"/>
            <line x1="72" y1="36.8" x2="348" y2="36.8" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="1.2"/>
            <polygon class="ws7-scale-needle" points="210,11 206,36 214,36" fill="#FF6738"/>
            <circle cx="210" cy="38" r="5.5" fill="#0D2238" stroke="#FFFDF7" stroke-width="1.6"/>
            <circle class="ws7-scale-eq-halo" cx="210" cy="38" r="13" fill="none" stroke="#22C55E" stroke-width="3" stroke-opacity="0"/>
            <g class="ws7-left-pan-plumb" transform="rotate(12 84 38)">
              <line x1="84" y1="38" x2="62" y2="80" stroke="#FFF6E3" stroke-width="1.8"/>
              <line x1="84" y1="38" x2="106" y2="80" stroke="#FFF6E3" stroke-width="1.8"/>
              <path d="M44,80 Q84,92 124,80 Z" fill="#F4A91F" stroke="#FFFDF7" stroke-width="1.4"/>
              <rect x="34" y="52" width="100" height="28" rx="8" fill="#FF6738"/>
              <text x="84" y="71" text-anchor="middle" fill="#FFFDF7" font-family="Jost, sans-serif" font-size="15" font-weight="900">GOAL ${bal.targetSum}</text>
            </g>
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
      const eqHaloEl = stage.querySelector('.ws7-scale-eq-halo') as SVGCircleElement | null;
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
        eqHaloEl?.setAttribute('stroke-opacity', balanced ? '0.92' : '0');
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

      const weighedIndices = new Set<number>();
      const formatWeightBadge = (val: number, revealed: boolean): string => {
        const suffix = bal.unit ? ` ${escHtml(bal.unit)}` : '';
        return revealed ? `${val}${suffix}` : `?${suffix}`;
      };

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
          const isSelected = selected.includes(idx);
          if (isSelected) weighedIndices.add(idx);
          btn.classList.toggle('is-on-pan', isSelected);
          const badgeEl = btn.querySelector('.ws7-weight-val-badge');
          if (badgeEl) {
            badgeEl.innerHTML = formatWeightBadge(bal.weights[idx].value, weighedIndices.has(idx));
          }
        });

        if (selected.length === 2 && !locking) {
          locking = true;
          const isExact =
            Math.abs(sum - bal.targetSum) < 0.01 ||
            (selected.includes(bal.validPair[0]) && selected.includes(bal.validPair[1]));
          const chosenLabels = `${bal.weights[selected[0]].label} + ${bal.weights[selected[1]].label} (${sum}${bal.unit ? ` ${bal.unit}` : ''})`;
          const trueLabels = `${bal.weights[bal.validPair[0]].label} + ${bal.weights[bal.validPair[1]].label} (${bal.targetSum}${bal.unit ? ` ${bal.unit}` : ''})`;
          context.onLockInStart?.(isClutch);

          // Highlight the true pair in Radiant Emerald (✓) & any wrong picks in Broadcast Vermilion (✗)!
          const validPairSet = new Set<number>(bal.validPair);
          weightBtns.forEach((btn, idx) => {
            btn.disabled = true;
            const badgeEl = btn.querySelector('.ws7-weight-val-badge');
            if (badgeEl) {
              badgeEl.innerHTML = formatWeightBadge(bal.weights[idx].value, true);
            }
            if (isExact && selected.includes(idx)) {
              btn.classList.add('is-reveal-correct');
            } else if (!isExact && validPairSet.has(idx)) {
              btn.classList.add('is-reveal-correct');
            } else if (!isExact && selected.includes(idx)) {
              btn.classList.add('is-reveal-wrong');
            }
          });
          if (isExact) {
            panSumEl.textContent = `✓ ${sum}`;
          }
          context.onRevealFlash?.(isExact);

          scheduleReveal(
            () => {
              emitOnce({
                isCorrect: isExact,
                accuracyRatio: isExact ? 1.0 : 0.0,
                chipMultiplier: isExact ? 1.0 : 0.0,
                chosenSummary: chosenLabels,
                trueAnswerDisplay: trueLabels,
                triggeredKlaxon: !isExact && Boolean(clue.isKlaxonMyth),
                fellForPoisonedFix: false,
              });
            },
            420,
            220,
          );
        }
      };

      bal.weights.forEach((w, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ws7-brass-weight';
        btn.dataset.weightIdx = String(idx);
        btn.innerHTML = `
          <span class="ws7-weight-val-badge" style="font-family:var(--ws7-toy-caps);font-size:15px;font-weight:900;line-height:1.12;">${formatWeightBadge(w.value, false)}</span>
          <span style="font-size:14.5px;font-weight:700;line-height:1.15;margin-top:2px;overflow-wrap:break-word;">${escHtml(w.label)}</span>
        `;
        btn.addEventListener('click', () => {
          if (resolved || locking || disposed || cutWeights.has(idx) || selected.length >= 2 || !isInputArmed()) {
            return;
          }
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

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        const validSet = new Set<number>(bal.validPair);
        const decoys = [0, 1, 2, 3, 4].filter((i) => !validSet.has(i) && !cutWeights.has(i)).slice(0, 2);
        for (const idx of decoys) {
          cutWeights.add(idx);
          const selPos = selected.indexOf(idx);
          if (selPos >= 0) selected.splice(selPos, 1);
          const btn = weightBtns[idx];
          if (btn) {
            btn.classList.add('is-fifty-cut');
            btn.disabled = true;
            appendFiftyStampToMeta(btn);
          }
        }
        updateScale();
        context.onTactileSfx?.('SHUTTER_CLACK');
        return decoys;
      };

      showAudiencePollImpl = () => {
        if (resolved || locking || disposed) return;
        const a = bal.weights[bal.validPair[0]];
        const b = bal.weights[bal.validPair[1]];
        upsertLifelineRibbon(
          'poll',
          `<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${renderPollIconMicroSvgV7()} STUDIO POLL: CROWD FAVORS <strong style="color:#FFD166;">${escHtml(a.label)} (${a.value})</strong> + PARTNER TO HIT ${bal.targetSum}${escHtml(unitStr)}!</span>`,
        );
        context.onTactileSfx?.('DETENT');
      };

      break;
    }

    // ------------------------------------------------------------------------
    // 5. TOY_05_RELIEF_GLOBE_3D: 1966 Mid-Century World Atlas Studio Globe
    // ------------------------------------------------------------------------
    case 'TOY_05_RELIEF_GLOBE_3D': {
      appendShowcasePromptBanner(root, 'Tap the spot on the World Globe!');

      const geo = resolveGeoPayload(clue);
      const cradleFrame = document.createElement('div');
      cradleFrame.className = 'ws7-globe-cradle-frame';
      const globeHost = document.createElement('div');
      globeHost.style.cssText = 'width:100%;height:100%;border-radius:11px;overflow:hidden;';
      cradleFrame.appendChild(globeHost);
      root.appendChild(cradleFrame);

      const globe = mountReliefGlobeContraptionV7(globeHost, {
        targetLat: geo.lat,
        targetLng: geo.lng,
        landmarkLabel: geo.landmarkLabel,
        regionHint: geo.regionHint,
        reducedMotion: context.reducedMotion,
        confirmLockMs: 280,
        revealDwellMs: 360,
        onPinPlanted: () => {
          context.onLockInStart?.(isClutch);
          context.onTactileSfx?.('PIN_PLANT');
        },
        onLock: (result) => {
          const isHit = result.accuracyRatio > 0;
          context.onRevealFlash?.(isHit);
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

      applyFiftyFiftyImpl = () => {
        if (resolved || disposed) return [];
        const ns = geo.lat >= 0 ? 'NORTHERN' : 'SOUTHERN';
        const ew = geo.lng >= 0 ? 'EASTERN' : 'WESTERN';
        upsertLifelineRibbon(
          'fifty',
          `<span class="ws7-stamp-fifty">50/50 CUT</span><span>HEMISPHERE LOCK: ${ns}-${ew} · ${escHtml(geo.regionHint)}</span>`,
        );
        context.onTactileSfx?.('SHUTTER_CLACK');
        return [0, 1];
      };

      showAudiencePollImpl = () => {
        if (resolved || disposed) return;
        const latRounded = Math.round(geo.lat / 5) * 5;
        const lngRounded = Math.round(geo.lng / 5) * 5;
        const latStr = `${Math.abs(latRounded)}°${latRounded >= 0 ? 'N' : 'S'}`;
        const lngStr = `${Math.abs(lngRounded)}°${lngRounded >= 0 ? 'E' : 'W'}`;
        upsertLifelineRibbon(
          'poll',
          `<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${renderPollIconMicroSvgV7()} STUDIO POLL: CROWD PINS CLUSTER NEAR <strong style="color:#FFD166;">${latStr}, ${lngStr}</strong> (${escHtml(geo.regionHint)})</span>`,
        );
        context.onTactileSfx?.('DETENT');
      };

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

      const wireBtns: HTMLButtonElement[] = [];
      const wireTails: HTMLSpanElement[] = [];
      const wirePollSlots: HTMLDivElement[] = [];
      const updateWireFns: Array<(cut: boolean, withFiftyStamp?: boolean) => void> = [];

      const syncBailout = (): void => {
        const count = snippedSet.size;
        const mult = count === 1 ? 0.85 : count === 2 ? 1.15 : 0;
        if (count >= 1 && count <= 2) {
          bailoutBtn.disabled = false;
          bailoutBtn.classList.add('is-armed');
          bailoutBtn.innerHTML = `
            <span style="font-size:14.5px;">BANK CASH!</span>
            <span style="font-size:20px;font-weight:900;">${mult.toFixed(2)}×</span>
            <span style="font-size:14.5px;">SAFE LOCK</span>
          `;
        } else {
          bailoutBtn.disabled = true;
          bailoutBtn.classList.remove('is-armed');
          bailoutBtn.innerHTML = `
            <span style="font-size:14.5px;color:#FFD166;">BANK CASH</span>
            <span style="font-size:14.5px;">CUT 1 WRONG FIRST</span>
          `;
        }
      };
      syncBailout();

      clue.choices.forEach((choiceText, idx) => {
        const wireBtn = document.createElement('button');
        wireBtn.type = 'button';
        wireBtn.className = 'ws7-fuse-wire-btn ws7-cream-plaque';
        wireBtn.dataset.wireIdx = String(idx);
        wireBtn.dataset.choiceIdx = String(idx);
        const wireHex = wireColors[idx % wireColors.length];

        const renderWireGraphic = (cut: boolean, spark = false): string => {
          const leftPost = `<circle cx="6" cy="12" r="5" fill="#F4A91F" stroke="#141B29" stroke-width="1.3"/><line x1="3.5" y1="9.5" x2="8.5" y2="14.5" stroke="#141B29" stroke-width="1.3"/>`;
          const rightPost = `<circle cx="38" cy="12" r="5" fill="#F4A91F" stroke="#141B29" stroke-width="1.3"/><line x1="35.5" y1="14.5" x2="40.5" y2="9.5" stroke="#141B29" stroke-width="1.3"/>`;
          return cut
            ? `<svg width="44" height="24" viewBox="0 0 44 24" style="overflow:visible;" aria-hidden="true">
                ${leftPost}
                <path d="M11,12 Q15,5 18,16" fill="none" stroke="${wireHex}" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M33,12 Q29,19 26,8" fill="none" stroke="${wireHex}" stroke-width="4.5" stroke-linecap="round"/>
                <circle cx="22" cy="12" r="2.8" fill="#FFD166"/>
                ${
                  spark && !context.reducedMotion
                    ? `<g class="ws7-wire-spark-burst">
                        <line x1="22" y1="2" x2="22" y2="7" stroke="#FFD166" stroke-width="2.2" stroke-linecap="round"/>
                        <line x1="22" y1="17" x2="22" y2="22" stroke="#FFD166" stroke-width="2.2" stroke-linecap="round"/>
                        <line x1="13" y1="6" x2="17" y2="9" stroke="#00E5FF" stroke-width="2" stroke-linecap="round"/>
                        <line x1="27" y1="15" x2="31" y2="18" stroke="#00E5FF" stroke-width="2" stroke-linecap="round"/>
                        <line x1="31" y1="6" x2="27" y2="9" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round"/>
                        <line x1="17" y1="15" x2="13" y2="18" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="22" cy="12" r="5.2" fill="#FFFDF7" fill-opacity="0.85"/>
                      </g>`
                    : ''
                }
                ${rightPost}
              </svg>`
            : `<svg width="44" height="24" viewBox="0 0 44 24" aria-hidden="true">${leftPost}<line x1="11" y1="12" x2="33" y2="12" stroke="${wireHex}" stroke-width="5.2" stroke-linecap="round"/><line x1="12" y1="10.8" x2="32" y2="10.8" stroke="#FFFFFF" stroke-opacity="0.48" stroke-width="1.2"/>${rightPost}</svg>`;
        };

        wireBtn.innerHTML = `
          <div class="ws7-wire-svg-host" style="flex:0 0 44px;display:flex;align-items:center;">${renderWireGraphic(false)}</div>
          <div class="ws7-pad-body" style="flex:1 1 auto;min-width:0;">
            <div class="ws7-choice-copy">${escHtml(choiceText)}</div>
            ${renderDiegeticChoiceOverlaysHtml(clue, idx, context)}
            <div class="ws7-poll-slot"></div>
          </div>
          <span class="ws7-pad-tail"></span>
        `;

        const svgHost = wireBtn.querySelector('.ws7-wire-svg-host') as HTMLDivElement;
        const tailEl = wireBtn.querySelector('.ws7-pad-tail') as HTMLSpanElement;
        const pollSlot = wireBtn.querySelector('.ws7-poll-slot') as HTMLDivElement;

        const updateWireVisual = (cut: boolean, withFiftyStamp = false): void => {
          svgHost.innerHTML = renderWireGraphic(cut, cut && !withFiftyStamp);
          if (cut) {
            wireBtn.classList.add('is-snipped');
          }
          if (withFiftyStamp) {
            wireBtn.classList.add('is-fifty-cut');
            wireBtn.disabled = true;
            appendFiftyStampToMeta(wireBtn);
            pollSlot.classList.remove('is-visible');
            pollSlot.innerHTML = '';
          }
        };

        wireBtns.push(wireBtn);
        wireTails.push(tailEl);
        wirePollSlots.push(pollSlot);
        updateWireFns.push(updateWireVisual);

        wireBtn.addEventListener('click', () => {
          if (resolved || locking || disposed || snippedSet.has(idx) || !isInputArmed()) return;
          updateWireVisual(true);

          if (idx === clue.answerIdx) {
            runTwoBeatChoiceReveal({
              containerEl: layout,
              chosenEl: wireBtn,
              correctEl: wireBtns[clue.answerIdx] ?? null,
              chosenTailSlot: tailEl,
              correctTailSlot: wireTails[clue.answerIdx] ?? null,
              isCorrect: false,
              sfx: 'WIRE_SNIP',
              resolution: {
                isCorrect: false,
                accuracyRatio: 0.0,
                chipMultiplier: 0.0,
                chosenSummary: `Cut true cable: ${choiceText}`,
                trueAnswerDisplay: clue.choices[clue.answerIdx],
                triggeredKlaxon: Boolean(clue.isKlaxonMyth),
                fellForPoisonedFix: false,
              },
            });
            return;
          }

          context.onTactileSfx?.('WIRE_SNIP');
          snippedSet.add(idx);
          if (snippedSet.size >= 3) {
            const trueWire = wireBtns[clue.answerIdx];
            runTwoBeatChoiceReveal({
              containerEl: layout,
              chosenEl: trueWire,
              correctEl: trueWire,
              chosenTailSlot: wireTails[clue.answerIdx] ?? null,
              correctTailSlot: wireTails[clue.answerIdx] ?? null,
              isCorrect: true,
              sfx: 'THROW_SNAP',
              resolution: {
                isCorrect: true,
                accuracyRatio: 1.0,
                chipMultiplier: 1.5,
                chosenSummary: `Isolated ${clue.choices[clue.answerIdx]} (1.50×)`,
                trueAnswerDisplay: clue.choices[clue.answerIdx],
                triggeredKlaxon: false,
                fellForPoisonedFix: false,
              },
            });
          } else {
            syncBailout();
          }
        });

        wiresCol.appendChild(wireBtn);
      });

      bailoutBtn.addEventListener('click', () => {
        if (resolved || locking || disposed || snippedSet.size === 0 || !isInputArmed()) return;
        const mult = snippedSet.size === 1 ? 0.85 : 1.15;
        const trueWire = wireBtns[clue.answerIdx];
        runTwoBeatChoiceReveal({
          containerEl: layout,
          chosenEl: trueWire,
          correctEl: trueWire,
          chosenTailSlot: wireTails[clue.answerIdx] ?? null,
          correctTailSlot: wireTails[clue.answerIdx] ?? null,
          isCorrect: true,
          sfx: 'THROW_SNAP',
          resolution: {
            isCorrect: true,
            accuracyRatio: 1.0,
            chipMultiplier: mult,
            chosenSummary: `Banked Cash (${mult.toFixed(2)}× after ${snippedSet.size} cut${snippedSet.size > 1 ? 's' : ''})`,
            trueAnswerDisplay: clue.choices[clue.answerIdx],
            triggeredKlaxon: false,
            fellForPoisonedFix: false,
          },
        });
      });

      layout.append(wiresCol, bailoutBtn);
      root.appendChild(layout);

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        const maxSafeCuts = Math.max(0, 2 - snippedSet.size);
        const candidates = pickTwoWrongChoiceIndices(clue.answerIdx, clue, snippedSet).slice(
          0,
          Math.max(1, maxSafeCuts),
        );
        // Never exceed 2 snipped wires automatically so player keeps agency to Bank 1.15x or cut #3 for 1.5x
        const applied: number[] = [];
        for (const idx of candidates) {
          if (snippedSet.size >= 2) break;
          snippedSet.add(idx);
          updateWireFns[idx]?.(true, true);
          applied.push(idx);
        }
        syncBailout();
        context.onTactileSfx?.('WIRE_SNIP');
        return applied;
      };

      showAudiencePollImpl = (percentages) => {
        if (resolved || locking || disposed) return;
        const live = [0, 1, 2, 3].filter((i) => !snippedSet.has(i));
        const normalized = normalizeLivePollPercentages(percentages, live);
        let maxPct = -1;
        normalized.forEach((v) => {
          if (v > maxPct) maxPct = v;
        });
        [0, 1, 2, 3].forEach((idx) => {
          const slot = wirePollSlots[idx];
          if (snippedSet.has(idx)) {
            slot.classList.remove('is-visible');
            slot.innerHTML = '';
            return;
          }
          const pct = normalized.get(idx) ?? 0;
          slot.innerHTML = renderPollBarBadgeHtml(pct, pct === maxPct && maxPct > 0);
          slot.classList.add('is-visible');
        });
        upsertLifelineRibbon(
          'poll',
          `<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${renderPollIconMicroSvgV7()} STUDIO POLL: HIGHEST % = <strong style="color:#FFD166;">TRUE CABLE (KEEP UNCUT!)</strong></span>`,
        );
        context.onTactileSfx?.('DETENT');
      };

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
      const cardOutcomes: Array<'hit' | 'miss'> = [];
      let fiftyHintActive = false;
      let pollActive = false;

      const layout = document.createElement('div');
      layout.className = 'ws7-sorter-layout';

      const leftBtn = document.createElement('button');
      leftBtn.type = 'button';
      leftBtn.className = 'ws7-chute-btn';
      leftBtn.dataset.chute = '0';

      const centerDeck = document.createElement('div');
      centerDeck.className = 'ws7-cream-plaque ws7-sorter-deck';
      centerDeck.style.cssText =
        'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center;position:relative;touch-action:pan-y;cursor:grab;transition:transform 0.14s ease, opacity 0.14s ease, box-shadow 0.14s ease;';

      const rightBtn = document.createElement('button');
      rightBtn.type = 'button';
      rightBtn.className = 'ws7-chute-btn';
      rightBtn.dataset.chute = '1';

      const renderChuteLabels = (): void => {
        const curItem = cards[cardIdx];
        const pollA = curItem ? (curItem.chute === 0 ? 78 : 22) : 50;
        const pollB = 100 - pollA;
        leftBtn.classList.toggle('is-lifeline-hint', Boolean(fiftyHintActive && curItem?.chute === 0));
        rightBtn.classList.toggle('is-lifeline-hint', Boolean(fiftyHintActive && curItem?.chute === 1));

        leftBtn.innerHTML = `
          <span style="color:#FFE89E;font-size:14.5px;">&larr; CHUTE A</span>
          <span style="font-size:15px;">${escHtml(sorter.chuteALabel)}</span>
          ${pollActive ? `<span style="background:#0D2238;color:#FFD166;padding:2px 7px;border-radius:6px;font-size:14.5px;">${pollA}%</span>` : ''}
        `;
        rightBtn.innerHTML = `
          <span style="color:#FFE89E;font-size:14.5px;">CHUTE B &rarr;</span>
          <span style="font-size:15px;">${escHtml(sorter.chuteBLabel)}</span>
          ${pollActive ? `<span style="background:#0D2238;color:#FFD166;padding:2px 7px;border-radius:6px;font-size:14.5px;">${pollB}%</span>` : ''}
        `;
      };

      const renderActiveCard = (): void => {
        if (cardIdx >= cards.length) return;
        const item = cards[cardIdx];
        const dots = cards
          .map((_, dIdx) => {
            const bg =
              dIdx < cardOutcomes.length
                ? cardOutcomes[dIdx] === 'hit'
                  ? '#16A34A'
                  : '#DC2626'
                : dIdx === cardIdx
                  ? '#1E56C5'
                  : '#C8B99B';
            return `<span style="width:10px;height:10px;border-radius:50%;display:inline-block;background:${bg};box-shadow:inset 0 1px 0 rgba(255,255,255,0.45);"></span>`;
          })
          .join('');
        centerDeck.classList.remove('is-sort-hit', 'is-sort-miss', 'is-card-deal-in');
        centerDeck.style.transform = 'translateX(0) rotate(0deg)';
        centerDeck.style.opacity = '1';
        centerDeck.innerHTML = `
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;" aria-hidden="true">${dots}</div>
          <div style="font-family:var(--ws7-toy-caps);font-size:14.5px;font-weight:900;color:#1E56C5;margin-bottom:4px;">CARD ${cardIdx + 1} OF ${cards.length}</div>
          <div class="ws7-choice-copy" style="font-size:clamp(16px,2.2vw,18px);">${escHtml(item.label)}</div>
        `;
        if (cardIdx > 0 && !context.reducedMotion) {
          void centerDeck.offsetWidth;
          centerDeck.classList.add('is-card-deal-in');
        }
        renderChuteLabels();
      };
      renderActiveCard();

      let sorting = false;
      const sortInto = (chute: 0 | 1): void => {
        if (resolved || disposed || sorting || cardIdx >= cards.length || !isInputArmed()) return;
        sorting = true;
        const wasRight = cards[cardIdx].chute === chute;
        if (wasRight) {
          correctCount += 1;
        }
        cardOutcomes.push(wasRight ? 'hit' : 'miss');
        centerDeck.classList.add(wasRight ? 'is-sort-hit' : 'is-sort-miss');
        context.onTactileSfx?.('CHUTE_SWOOSH');
        if (!context.reducedMotion) {
          const hitChuteBtn = chute === 0 ? leftBtn : rightBtn;
          hitChuteBtn.classList.remove('is-chute-recoil');
          void hitChuteBtn.offsetWidth;
          hitChuteBtn.classList.add('is-chute-recoil');
          centerDeck.style.transform =
            chute === 0 ? 'translateX(-78px) rotate(-11deg) scale(0.92)' : 'translateX(78px) rotate(11deg) scale(0.92)';
          centerDeck.style.opacity = '0.28';
        }
        cardIdx += 1;

        if (cardIdx >= cards.length) {
          locking = true;
          const passed = correctCount >= 3;
          const accuracyRatio = passed ? correctCount / cards.length : 0.0;
          const chipMultiplier = correctCount === 4 ? 1.15 : passed ? 0.85 : 0.0;
          context.onRevealFlash?.(passed);
          scheduleReveal(
            () => {
              emitOnce({
                isCorrect: passed,
                accuracyRatio,
                chipMultiplier,
                chosenSummary: `Sorted ${correctCount}/${cards.length} cue cards`,
                trueAnswerDisplay: `${sorter.chuteALabel} vs ${sorter.chuteBLabel} (${correctCount}/${cards.length})`,
                triggeredKlaxon: !passed && Boolean(clue.isKlaxonMyth),
                fellForPoisonedFix: false,
              });
            },
            240,
            130,
          );
        } else {
          schedule(() => {
            sorting = false;
            renderActiveCard();
          }, 120);
        }
      };

      leftBtn.addEventListener('click', () => sortInto(0));
      rightBtn.addEventListener('click', () => sortInto(1));

      let swipeStartX: number | null = null;
      centerDeck.addEventListener('pointerdown', (e: PointerEvent) => {
        if (!isInputArmed()) return;
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

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        fiftyHintActive = true;
        renderChuteLabels();
        upsertLifelineRibbon(
          'fifty',
          `<span class="ws7-stamp-fifty">50/50 CUT</span><span>GOLD HALO HIGHLIGHTS THE VERIFIED CHUTE!</span>`,
        );
        context.onTactileSfx?.('SHUTTER_CLACK');
        return [0];
      };

      showAudiencePollImpl = () => {
        if (resolved || locking || disposed) return;
        pollActive = true;
        renderChuteLabels();
        context.onTactileSfx?.('DETENT');
      };

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
      let lastSnappedSlotIdx = -1;

      const refreshRail = (): void => {
        sleeperEls.forEach((slotEl, slotIdx) => {
          const rotIdx = placedRotatedIndices[slotIdx];
          const ordLabel = slotIdx === count - 1 ? `${slotIdx + 1}TH` : ordinals[slotIdx];
          slotEl.classList.remove('is-magnetic-snap');
          if (rotIdx !== undefined) {
            const item = rotated[rotIdx];
            slotEl.classList.add('is-filled');
            slotEl.innerHTML = `<span style="font-size:14.5px;font-weight:900;color:#008B9A;">${ordLabel}</span><span style="font-size:14.5px;font-weight:700;">${escHtml(item.label)}</span>`;
            if (slotIdx === lastSnappedSlotIdx && !context.reducedMotion) {
              void slotEl.offsetWidth;
              slotEl.classList.add('is-magnetic-snap');
            }
          } else {
            slotEl.classList.remove('is-filled');
            slotEl.innerHTML = `<span style="font-size:14.5px;">${ordLabel}</span><span style="font-size:14.5px;color:#FFF6E3;">${slotIdx === 0 ? 'EARLIEST' : slotIdx === count - 1 ? 'LATEST' : 'NEXT'}</span>`;
          }
        });
        lastSnappedSlotIdx = -1;

        plaqueBtns.forEach((btn, rIdx) => {
          btn.classList.toggle('is-placed', placedRotatedIndices.includes(rIdx));
        });

        if (placedRotatedIndices.length === count && !locking) {
          locking = true;
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

          // Flip open brass Year plaques & Emerald (✓) / Vermilion (✗) slot tally!
          sleeperEls.forEach((slotEl, slotIdx) => {
            const rIdx = placedRotatedIndices[slotIdx];
            const item = rotated[rIdx];
            const isSlotRight = ranks[slotIdx] === slotIdx;
            slotEl.classList.add(isSlotRight ? 'is-reveal-correct' : 'is-reveal-wrong');
            slotEl.innerHTML = `
              <span style="font-size:14.5px;font-weight:900;">${isSlotRight ? '✓' : '✗'} ${escHtml(item.label)}</span>
              <span class="ws7-chrono-year-pill">${escHtml(item.displayYear)}</span>
            `;
          });

          context.onRevealFlash?.(accuracyRatio > 0);
          scheduleReveal(
            () => {
              emitOnce({
                isCorrect: accuracyRatio > 0,
                accuracyRatio,
                chipMultiplier,
                chosenSummary: summary,
                trueAnswerDisplay: truthSummary,
                triggeredKlaxon: accuracyRatio === 0 && Boolean(clue.isKlaxonMyth),
                fellForPoisonedFix: false,
              });
            },
            440,
            220,
          );
        }
      };

      for (let s = 0; s < count; s++) {
        const slotBtn = document.createElement('button');
        slotBtn.type = 'button';
        slotBtn.className = 'ws7-sleeper-slot';
        slotBtn.addEventListener('click', () => {
          if (resolved || locking || disposed || placedRotatedIndices.length >= count || !isInputArmed()) {
            return;
          }
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
          if (resolved || locking || disposed || placedRotatedIndices.includes(rIdx) || !isInputArmed()) {
            return;
          }
          lastSnappedSlotIdx = placedRotatedIndices.length;
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

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        const earliestItem = trueOrder[0];
        const earliestRotIdx = rotated.indexOf(earliestItem);
        const targetBtn = plaqueBtns[earliestRotIdx];
        if (targetBtn && !targetBtn.querySelector('.ws7-stamp-fifty')) {
          const hint = document.createElement('span');
          hint.className = 'ws7-stamp-fifty';
          hint.textContent = `1ST · ${earliestItem.displayYear}`;
          targetBtn.appendChild(hint);
        }
        upsertLifelineRibbon(
          'fifty',
          `<span class="ws7-stamp-fifty">50/50 CUT</span><span>EARLIEST ANCHOR: <strong style="color:#FFD166;">${escHtml(earliestItem.label)} (${escHtml(earliestItem.displayYear)})</strong></span>`,
        );
        context.onTactileSfx?.('SHUTTER_CLACK');
        return [earliestRotIdx];
      };

      showAudiencePollImpl = () => {
        if (resolved || locking || disposed) return;
        const earliestItem = trueOrder[0];
        const latestItem = trueOrder[trueOrder.length - 1];
        upsertLifelineRibbon(
          'poll',
          `<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${renderPollIconMicroSvgV7()} STUDIO POLL: <strong style="color:#FFD166;">${escHtml(earliestItem.label)}</strong> FIRST → <strong style="color:#7EF2AD;">${escHtml(latestItem.label)}</strong> LAST</span>`,
        );
        context.onTactileSfx?.('DETENT');
      };

      break;
    }

    // ------------------------------------------------------------------------
    // 9. TOY_09_SWITCHBOARD_PATCHBAY: 1966 Network Control Patchboard
    // ------------------------------------------------------------------------
    case 'TOY_09_SWITCHBOARD_PATCHBAY': {
      appendShowcasePromptBanner(root, 'Match each Left Line to its Right Studio Jack!');

      const patch = resolvePatchbayPayload(clue);
      const connections: Array<number | null> = [null, null, null];
      const cutJacks = new Set<number>();
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
          btn.classList.toggle('is-armed', cIdx === armedCaller && !resolved && !locking);
        });
        drawCatenaryCords();
      };

      const connectCallerToJack = (cIdx: number, jIdx: number): void => {
        if (resolved || locking || disposed || cutJacks.has(jIdx) || !isInputArmed()) return;
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
          locking = true;
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

          // Illuminate each patched jack in Radiant Emerald (✓) vs Broadcast Vermilion (✗)!
          connections.forEach((jIdx, cIdx) => {
            if (jIdx === null) return;
            const matchOk = jIdx === patch.correctMapping[cIdx];
            jackBtns[jIdx]?.classList.add(matchOk ? 'is-reveal-correct' : 'is-reveal-wrong');
            callerBtns[cIdx]?.classList.add(matchOk ? 'is-reveal-correct' : 'is-reveal-wrong');
          });

          context.onRevealFlash?.(allCorrect);
          scheduleReveal(
            () => {
              emitOnce({
                isCorrect: allCorrect,
                accuracyRatio: allCorrect ? 1.0 : 0.0,
                chipMultiplier: allCorrect ? 1.0 : 0.0,
                chosenSummary,
                trueAnswerDisplay: trueSummary,
                triggeredKlaxon: !allCorrect && Boolean(clue.isKlaxonMyth),
                fellForPoisonedFix: false,
              });
            },
            420,
            220,
          );
        }
      };

      let cancelActiveCordDrag: (() => void) | null = null;
      const clearCordDrag = (): void => {
        if (cancelActiveCordDrag) {
          const fn = cancelActiveCordDrag;
          cancelActiveCordDrag = null;
          fn();
        }
      };
      cleanups.push(clearCordDrag);

      patch.callers.forEach((callerLabel, cIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ws7-caller-plug ws7-cream-plaque';
        btn.dataset.callerIdx = String(cIdx);
        btn.innerHTML = `
          <span class="ws7-choice-copy" style="font-size:14.5px;">${escHtml(callerLabel)}</span>
          <span style="width:16px;height:16px;border-radius:50%;background:${cordColors[cIdx]};box-shadow:inset 0 0 0 2px #0D2238;flex:0 0 16px;"></span>
        `;
        btn.addEventListener('pointerdown', () => {
          if (resolved || locking || disposed || !isInputArmed()) return;
          clearCordDrag();
          armedCaller = cIdx;
          syncArmedState();
          const onMove = (me: PointerEvent): void => {
            if (disposed || resolved || locking) {
              clearCordDrag();
              return;
            }
            drawCatenaryCords({ x: me.clientX, y: me.clientY });
          };
          const onUp = (ue: PointerEvent): void => {
            clearCordDrag();
            if (disposed || resolved || locking) return;
            const hitEl = document
              .elementFromPoint(ue.clientX, ue.clientY)
              ?.closest('[data-jack-idx]') as HTMLElement | null;
            if (hitEl && hitEl.dataset.jackIdx !== undefined) {
              connectCallerToJack(cIdx, Number(hitEl.dataset.jackIdx));
            } else {
              drawCatenaryCords();
            }
          };
          const onCancel = (): void => {
            clearCordDrag();
            if (!disposed) drawCatenaryCords();
          };
          cancelActiveCordDrag = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onCancel);
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
          window.addEventListener('pointercancel', onCancel);
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
            <div class="ws7-choice-copy" style="font-size:14.5px;">${escHtml(jackLabel)}</div>
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

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        const usedJacks = new Set<number>(patch.correctMapping);
        const decoyJacks = [0, 1, 2, 3].filter((j) => !usedJacks.has(j));
        for (const jIdx of decoyJacks) {
          cutJacks.add(jIdx);
          const btn = jackBtns[jIdx];
          if (btn) {
            btn.classList.add('is-fifty-cut');
            btn.disabled = true;
            appendFiftyStampToMeta(btn);
          }
        }
        upsertLifelineRibbon(
          'fifty',
          `<span class="ws7-stamp-fifty">50/50 CUT</span><span>DECOY JACK ELIMINATED · ${escHtml(patch.callers[0])} → <strong style="color:#FFD166;">${escHtml(patch.jacks[patch.correctMapping[0]])}</strong></span>`,
        );
        context.onTactileSfx?.('SHUTTER_CLACK');
        return decoyJacks;
      };

      showAudiencePollImpl = () => {
        if (resolved || locking || disposed) return;
        const targetJackIdx = patch.correctMapping[armedCaller] ?? patch.correctMapping[0];
        upsertLifelineRibbon(
          'poll',
          `<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${renderPollIconMicroSvgV7()} STUDIO POLL: <strong style="color:#FFD166;">${escHtml(patch.callers[armedCaller])}</strong> → <strong style="color:#7EF2AD;">${escHtml(patch.jacks[targetJackIdx])}</strong> (79%)</span>`,
        );
        context.onTactileSfx?.('DETENT');
      };

      break;
    }

    // ------------------------------------------------------------------------
    // 10. TOY_10_CLIFFHANGERS_THROTTLE: *Price Is Right* Alpine Mountain Slider
    //     60fps Damped Slider + 420ms Range Game Gold Marker & Green Band Reveal!
    // ------------------------------------------------------------------------
    case 'TOY_10_CLIFFHANGERS_THROTTLE': {
      appendShowcasePromptBanner(root, 'Slide the Mountain Pointer & tap LOCK IN!');

      const num = resolveNumericPayload(clue);
      const span = Math.max(1e-6, num.max - num.min);
      const truthNorm = Math.round(
        Math.max(0, Math.min(100, ((num.target - num.min) / span) * 100)),
      );
      let guessNorm = 50;

      const mapNormToDisplay = (norm: number): string => {
        const mapped = num.min + (norm / 100) * span;
        const rounded = num.step >= 1 ? Math.round(mapped) : Number(mapped.toFixed(1));
        return formatNumericWithUnitV7(String(rounded), num.unit ?? '');
      };

      // Slope geometry helpers: ridge goes from (24, 98) at 0% to (320, 24) at 100%
      const slopePt = (pct: number): { x: number; y: number } => {
        const t = Math.max(0, Math.min(1, pct / 100));
        return { x: 24 + t * 296, y: 98 - t * 74 };
      };
      const tolOuterLow = Math.max(0, truthNorm - 15);
      const tolOuterHigh = Math.min(100, truthNorm + 15);
      const tolInnerLow = Math.max(0, truthNorm - 8);
      const tolInnerHigh = Math.min(100, truthNorm + 8);
      const pOuter0 = slopePt(tolOuterLow);
      const pOuter1 = slopePt(tolOuterHigh);
      const pInner0 = slopePt(tolInnerLow);
      const pInner1 = slopePt(tolInnerHigh);
      const pExact = slopePt(truthNorm);
      const exactLabelX = Math.max(54, Math.min(350, pExact.x));

      const layout = document.createElement('div');
      layout.className = 'ws7-cliff-layout';

      const inclineBox = document.createElement('div');
      inclineBox.style.cssText =
        'width:100%;height:clamp(108px,23vh,144px);padding:2px 4px;position:relative;overflow:visible;';

      const stepTicksSvg: string[] = [];
      for (let s = 1; s <= 15; s++) {
        const t = s / 15;
        const sx = 24 + t * 296;
        const sy = 96 - t * 72;
        stepTicksSvg.push(
          `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${sx.toFixed(1)}" y2="${(sy + 6).toFixed(1)}" stroke="#FFD166" stroke-width="${s % 5 === 0 ? 2.2 : 1.2}"/>`,
        );
      }

      inclineBox.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;font-family:var(--ws7-toy-caps);font-size:14.5px;font-weight:800;color:#FFF6E3;gap:8px;">
          <span class="ws7-cliff-readout" style="font-family:var(--ws7-toy-num);font-size:16px;color:#FFFDF7;"></span>
          <span style="color:#FFD166;">${escHtml(formatNumericRangeWithUnitV7(num.min, num.max, num.unit ?? '', '–'))}</span>
        </div>
        <svg viewBox="0 0 420 104" width="100%" height="80%" preserveAspectRatio="xMidYMid meet" style="overflow:visible;">
          <defs>
            <filter id="ws7CliffGoldGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.8" flood-color="#FFD166" flood-opacity="0.95"/>
            </filter>
          </defs>
          <!-- Charley Harper Layered Mid-Century Alpine Peaks & Living Color Ridge -->
          <polygon points="8,98 118,38 228,98" fill="#133D5E" opacity="0.72"/>
          <polygon points="154,98 258,28 360,98" fill="#184C6E" opacity="0.68"/>
          <polygon points="24,98 320,24 320,98" fill="#0096A6" stroke="#FFF6E3" stroke-width="2.5"/>
          <polygon points="238,44 320,24 320,56 268,58" fill="#FFF6E3" fill-opacity="0.92"/>
          <polygon points="274,35 320,24 320,40 294,42" fill="#E0F4FF" fill-opacity="0.7"/>
          ${stepTicksSvg.join('')}
          <line x1="320" y1="6" x2="320" y2="98" stroke="#FF6738" stroke-width="3" stroke-dasharray="5 3"/>
          <polygon points="320,6 344,13 320,20" fill="#FF6738"/>
          <!-- 50/50 Narrowed Ridge Bracket (hidden until lifeline triggered) -->
          <line class="ws7-cliff-fifty-band" x1="24" y1="98" x2="24" y2="98" stroke="#00E5FF" stroke-width="8" stroke-opacity="0" stroke-linecap="round"/>
          <!-- Price-Is-Right Range Game Reveal: Green Tolerance Band + Glowing Gold Exact Marker on Mountain Slope! -->
          <g class="ws7-cliff-reveal-group" opacity="0" style="transition:opacity 0.22s ease-out;">
            <line class="ws7-cliff-tol-band" x1="${pOuter0.x.toFixed(1)}" y1="${pOuter0.y.toFixed(1)}" x2="${pOuter1.x.toFixed(1)}" y2="${pOuter1.y.toFixed(1)}" stroke="#4ADE80" stroke-width="11" stroke-opacity="0.72" stroke-linecap="round"/>
            <line x1="${pInner0.x.toFixed(1)}" y1="${pInner0.y.toFixed(1)}" x2="${pInner1.x.toFixed(1)}" y2="${pInner1.y.toFixed(1)}" stroke="#16A34A" stroke-width="11" stroke-linecap="round"/>
            <g class="ws7-cliff-exact-marker" filter="url(#ws7CliffGoldGlow)">
              <line x1="${pExact.x.toFixed(1)}" y1="${pExact.y.toFixed(1)}" x2="${pExact.x.toFixed(1)}" y2="${Math.max(10, pExact.y - 26).toFixed(1)}" stroke="#FFD166" stroke-width="3.2" stroke-linecap="round"/>
              <circle cx="${pExact.x.toFixed(1)}" cy="${pExact.y.toFixed(1)}" r="6.5" fill="#FFD166" stroke="#FFFFFF" stroke-width="2"/>
              <rect x="${(exactLabelX - 49).toFixed(1)}" y="${Math.max(2, pExact.y - 46).toFixed(1)}" width="98" height="22" rx="6" fill="#0D2238" stroke="#FFD166" stroke-width="1.8"/>
              <text x="${exactLabelX.toFixed(1)}" y="${(Math.max(2, pExact.y - 46) + 16).toFixed(1)}" text-anchor="middle" fill="#FFD166" font-family="Jost, sans-serif" font-size="14.5" font-weight="900">★ ${escHtml(String(num.target))}</text>
            </g>
          </g>
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
        <div style="position:relative;width:100%;height:16px;border-radius:8px;background:rgba(255,246,227,0.22);box-shadow:inset 0 2px 4px rgba(0,0,0,0.45);">
          <div class="ws7-throttle-fill" style="width:50%;height:100%;border-radius:8px;background:linear-gradient(90deg,#00C2D6 0%,#FFD166 70%,#FF6738 100%);"></div>
          <!-- Green Tolerance Band + Glowing Gold Exact Marker right on the Slider Track! -->
          <div class="ws7-track-tol-band" style="display:none;position:absolute;top:-3px;bottom:-3px;left:${tolOuterLow}%;width:${Math.max(4, tolOuterHigh - tolOuterLow)}%;border-radius:999px;background:rgba(34,197,94,0.68);border:2px solid #86EFAC;box-shadow:0 0 12px rgba(34,197,94,0.85);pointer-events:none;z-index:2;"></div>
          <div class="ws7-track-exact-pin" style="display:none;position:absolute;top:50%;left:${truthNorm}%;transform:translate(-50%,-50%) rotate(45deg);width:18px;height:18px;border-radius:4px;background:#FFD166;border:2.5px solid #FFFFFF;box-shadow:0 0 16px #FFD166;pointer-events:none;z-index:4;"></div>
          <div class="ws7-throttle-knob" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:13px;background:linear-gradient(180deg,#FFFDF7 0%,#FFD166 72%,#F4A91F 100%);box-shadow:inset 0 2px 0 #FFFFFF,0 3px 0 #9E6300,0 4px 10px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;gap:4px;z-index:3;">
            <span style="width:3px;height:16px;border-radius:2px;background:#9E6300;opacity:0.7;"></span>
            <span style="width:4px;height:22px;border-radius:2px;background:#7A4B00;"></span>
            <span style="width:3px;height:16px;border-radius:2px;background:#9E6300;opacity:0.7;"></span>
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
      const cliffRevealEl = inclineBox.querySelector('.ws7-cliff-reveal-group') as SVGGElement;
      const cliffFiftyEl = inclineBox.querySelector('.ws7-cliff-fifty-band') as SVGLineElement;
      const fillEl = track.querySelector('.ws7-throttle-fill') as HTMLDivElement;
      const knobEl = track.querySelector('.ws7-throttle-knob') as HTMLDivElement;
      const trackTolBandEl = track.querySelector('.ws7-track-tol-band') as HTMLDivElement;
      const trackExactPinEl = track.querySelector('.ws7-track-exact-pin') as HTMLDivElement;

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
        if (!immediate && !context.reducedMotion) {
          readoutEl.classList.remove('is-detent-pop');
          void readoutEl.offsetWidth;
          readoutEl.classList.add('is-detent-pop');
        }
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
        if (resolved || locking || disposed || !isInputArmed()) return;
        locking = true;
        context.onLockInStart?.(isClutch);
        context.onTactileSfx?.('THROW_SNAP');

        const deltaTicks = Math.abs(guessNorm - truthNorm);
        const staysOnCliff = deltaTicks <= 15;
        lockBtn.disabled = true;
        lockBtn.textContent = staysOnCliff ? '✓ SAFE!' : '✗ OVER EDGE!';
        lockBtn.style.background = staysOnCliff
          ? 'linear-gradient(180deg, #16A34A 0%, #117A37 100%)'
          : 'linear-gradient(180deg, #DC2626 0%, #991B1B 100%)';

        // Reveal Glowing Gold Exact-Answer Marker + Green Tolerance Band on BOTH mountain slope & track!
        cliffRevealEl.setAttribute('opacity', '1');
        trackTolBandEl.style.display = 'block';
        trackExactPinEl.style.display = 'block';

        mountaineerEl.style.transition = context.reducedMotion
          ? 'none'
          : 'transform 0.36s cubic-bezier(0.22, 1.18, 0.36, 1)';
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
        context.onRevealFlash?.(staysOnCliff);

        scheduleReveal(
          () => {
            emitOnce({
              isCorrect: staysOnCliff,
              accuracyRatio,
              chipMultiplier,
              chosenSummary: `${mapNormToDisplay(guessNorm)} (${deltaTicks} steps off)`,
              trueAnswerDisplay: formatNumericWithUnitV7(String(num.target), num.unit ?? ''),
              triggeredKlaxon: !staysOnCliff && Boolean(clue.isKlaxonMyth),
              fellForPoisonedFix: false,
            });
          },
          420,
          240,
        );
      };

      lockBtn.addEventListener('click', commitCliffGuess);

      track.addEventListener('pointerdown', (e: PointerEvent) => {
        if (resolved || locking || disposed || !isInputArmed()) return;
        sliding = true;
        try {
          track.setPointerCapture(e.pointerId);
        } catch {
          // Synthetic pointer safety
        }
        setFromClientX(e.clientX);
      });

      track.addEventListener('pointermove', (e: PointerEvent) => {
        if (!sliding || resolved || locking || disposed) return;
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

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        const bias = ((Math.abs(clue.qid) % 5) - 2) * 3;
        const lowPct = Math.max(0, truthNorm - 14 + bias);
        const highPct = Math.min(100, truthNorm + 14 + bias);
        const p0 = slopePt(lowPct);
        const p1 = slopePt(highPct);
        cliffFiftyEl.setAttribute('x1', p0.x.toFixed(1));
        cliffFiftyEl.setAttribute('y1', p0.y.toFixed(1));
        cliffFiftyEl.setAttribute('x2', p1.x.toFixed(1));
        cliffFiftyEl.setAttribute('y2', p1.y.toFixed(1));
        cliffFiftyEl.setAttribute('stroke-opacity', '0.9');
        upsertLifelineRibbon(
          'fifty',
          `<span class="ws7-stamp-fifty">50/50 CUT</span><span>SAFE ZONE: ${escHtml(mapNormToDisplay(lowPct))} – ${escHtml(mapNormToDisplay(highPct))}</span>`,
        );
        context.onTactileSfx?.('SHUTTER_CLACK');
        return [0, 1];
      };

      showAudiencePollImpl = (percentages) => {
        if (resolved || locking || disposed) return;
        const offset = clue.qid % 2 === 0 ? 4 : -4;
        const crowdPct = Math.max(0, Math.min(100, truthNorm + offset));
        const confidence = Math.max(60, Math.min(89, Math.round(Math.max(...percentages, 71))));
        upsertLifelineRibbon(
          'poll',
          `<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${renderPollIconMicroSvgV7()} STUDIO POLL (${confidence}%): SLIDE NEAR <strong style="color:#FFD166;">${escHtml(mapNormToDisplay(crowdPct))}</strong></span>`,
        );
        context.onTactileSfx?.('DETENT');
      };

      break;
    }

    // ------------------------------------------------------------------------
    // 11. TOY_11_MISSING_VOWELS_WHEEL: *Concentration / Wheel* Letter Board
    // ------------------------------------------------------------------------
    case 'TOY_11_MISSING_VOWELS_WHEEL': {
      appendShowcasePromptBanner(root, 'Tap the Vowel Strip that solves the Puzzle Board!');

      const vow = resolveMissingVowelsPayload(clue);
      const cutDrums = new Set<number>();

      const layout = document.createElement('div');
      layout.className = 'ws7-vowels-layout';

      const rack = document.createElement('div');
      rack.className = 'ws7-solari-rack';

      const maskedArr = Array.from(vow.maskedDisplay);
      const renderSolari = (decodedText: string | null): void => {
        const src = decodedText ?? vow.maskedDisplay;
        const words = src.split(/\s+/).filter(Boolean);
        let globalIdx = 0;
        let revealOrdinal = 0;
        rack.innerHTML = words
          .map((word) => {
            while (globalIdx < src.length && src[globalIdx] === ' ') {
              globalIdx++;
            }
            const tiles = Array.from(word)
              .map((ch) => {
                const charIdx = globalIdx++;
                const isBlank = ch === '_';
                const wasBlank = decodedText !== null && maskedArr[charIdx] === '_';
                const delayStyle =
                  wasBlank && !context.reducedMotion
                    ? ` style="animation-delay:${revealOrdinal++ * 36}ms;"`
                    : '';
                return `<span class="ws7-flap-tile${isBlank ? ' is-blank' : ''}${wasBlank ? ' is-revealed' : ''}"${delayStyle}>${escHtml(isBlank ? '?' : ch)}</span>`;
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

      const drumEls: HTMLButtonElement[] = [];
      const drumTails: HTMLSpanElement[] = [];
      const drumPollSlots: HTMLDivElement[] = [];

      vow.vowelChoices.forEach((cluster, idx) => {
        const drum = document.createElement('button');
        drum.type = 'button';
        drum.className = 'ws7-vowel-drum';
        drum.dataset.drumIdx = String(idx);
        drum.dataset.choiceIdx = String(idx);
        drum.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;">
            <span class="ws7-choice-copy" style="font-family:var(--ws7-toy-num);font-size:16px;font-weight:800;">${escHtml(cluster)}</span>
            <span class="ws7-pad-tail"></span>
          </div>
          ${renderDiegeticChoiceOverlaysHtml(vowelClueOverlay, idx, vowelContext)}
          <div class="ws7-poll-slot"></div>
        `;

        const tailEl = drum.querySelector('.ws7-pad-tail') as HTMLSpanElement;
        const pollSlot = drum.querySelector('.ws7-poll-slot') as HTMLDivElement;
        drumEls.push(drum);
        drumTails.push(tailEl);
        drumPollSlots.push(pollSlot);

        drum.addEventListener('click', () => {
          if (resolved || locking || disposed || cutDrums.has(idx) || !isInputArmed()) return;
          const isCorrect = idx === vow.correctChoiceIdx;
          runTwoBeatChoiceReveal({
            containerEl: drumsGrid,
            chosenEl: drum,
            correctEl: drumEls[vow.correctChoiceIdx] ?? null,
            chosenTailSlot: tailEl,
            correctTailSlot: drumTails[vow.correctChoiceIdx] ?? null,
            isCorrect,
            sfx: 'SHUTTER_CLACK',
            onBeat2Extra: () => {
              renderSolari(vow.fullAnswer);
            },
            resolution: {
              isCorrect,
              accuracyRatio: isCorrect ? 1.0 : 0.0,
              chipMultiplier: 1.0,
              chosenSummary: `${cluster} -> ${isCorrect ? vow.fullAnswer : vow.maskedDisplay}`,
              trueAnswerDisplay: vow.fullAnswer,
              triggeredKlaxon: !isCorrect && Boolean(clue.isKlaxonMyth),
              fellForPoisonedFix: !isCorrect && idx === safePoisonIdx,
            },
          });
        });

        drumsGrid.appendChild(drum);
      });

      layout.append(rack, drumsGrid);
      root.appendChild(layout);

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        const toCut = pickTwoWrongChoiceIndices(vow.correctChoiceIdx, vowelClueOverlay, cutDrums);
        for (const idx of toCut) {
          cutDrums.add(idx);
          const drum = drumEls[idx];
          if (drum) {
            drum.classList.add('is-fifty-cut');
            drum.disabled = true;
            appendFiftyStampToMeta(drum);
            drumPollSlots[idx].classList.remove('is-visible');
            drumPollSlots[idx].innerHTML = '';
          }
        }
        context.onTactileSfx?.('SHUTTER_CLACK');
        return toCut;
      };

      showAudiencePollImpl = (percentages) => {
        if (resolved || locking || disposed) return;
        // Map percentages cleanly so the highest percentage aligns with vow.correctChoiceIdx if caller indexed by clue.answerIdx
        const remapped = [...percentages];
        if (remapped.length >= 4 && clue.answerIdx !== vow.correctChoiceIdx) {
          const tmp = remapped[clue.answerIdx];
          remapped[clue.answerIdx] = remapped[vow.correctChoiceIdx];
          remapped[vow.correctChoiceIdx] = tmp;
        }
        const live = [0, 1, 2, 3].filter((i) => !cutDrums.has(i));
        const normalized = normalizeLivePollPercentages(remapped, live);
        let maxPct = -1;
        normalized.forEach((v) => {
          if (v > maxPct) maxPct = v;
        });
        [0, 1, 2, 3].forEach((idx) => {
          const slot = drumPollSlots[idx];
          if (cutDrums.has(idx)) {
            slot.classList.remove('is-visible');
            slot.innerHTML = '';
            return;
          }
          const pct = normalized.get(idx) ?? 0;
          slot.innerHTML = renderPollBarBadgeHtml(pct, pct === maxPct && maxPct > 0);
          slot.classList.add('is-visible');
        });
        context.onTactileSfx?.('DETENT');
      };

      break;
    }

    // ------------------------------------------------------------------------
    // 12. TOY_12_CONSPIRACY_LASSO: 3x3 Pop-Modernist TV Lightboard
    // ------------------------------------------------------------------------
    case 'TOY_12_CONSPIRACY_LASSO': {
      const lasso = resolveLassoPayload(clue);
      const lassoBanner = appendShowcasePromptBanner(
        root,
        lasso.connectionPrompt || 'Tap or drag across the 3 matching Studio Cards!',
      );
      const lassoCountChip = document.createElement('span');
      lassoCountChip.style.cssText =
        'padding:1px 8px;border-radius:999px;background:#0D2238;color:#FFD166;box-shadow:inset 0 0 0 1.5px #FFD166;font-size:14.5px;font-weight:900;';
      lassoCountChip.textContent = '0 / 3';
      lassoBanner.appendChild(lassoCountChip);

      const picked: number[] = [];
      const cutCards = new Set<number>();

      const board = document.createElement('div');
      board.className = 'ws7-corkboard';

      const twineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      twineSvg.setAttribute(
        'style',
        'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;',
      );

      const cardEls: HTMLButtonElement[] = [];

      const updateTwine = (revealTone?: 'correct' | 'wrong'): void => {
        lassoCountChip.textContent = `${picked.length} / 3`;
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
        const strokeCol =
          revealTone === 'correct' ? '#22C55E' : revealTone === 'wrong' ? '#EF4444' : '#FF6738';
        const fillCol =
          revealTone === 'correct'
            ? 'rgba(34,197,94,0.22)'
            : revealTone === 'wrong'
              ? 'rgba(239,68,68,0.22)'
              : picked.length === 3
                ? 'rgba(255,103,56,0.18)'
                : 'none';
        const drawCls = !context.reducedMotion ? ' class="ws7-twine-animated"' : '';
        twineSvg.innerHTML = `
          <polyline${drawCls} pathLength="100" points="${poly}" fill="${fillCol}" stroke="${strokeCol}" stroke-width="4.6" stroke-linejoin="round" stroke-linecap="round"/>
          <polyline points="${poly}" fill="none" stroke="#FFD166" stroke-width="1.8" stroke-dasharray="5 3"/>
        `;
      };

      const checkTriadComplete = (): void => {
        if (picked.length < 3 || resolved || locking || disposed) return;
        locking = true;
        context.onTactileSfx?.('TWINE_TAUT');
        const targetSet = new Set<number>(lasso.triadIndices);
        const isCorrect = picked.every((idx) => targetSet.has(idx));
        const chosenText = picked.map((idx) => lasso.cards[idx]).join(' + ');
        const trueText = lasso.triadIndices.map((idx) => lasso.cards[idx]).join(' + ');

        // Illuminate true triad cards in Radiant Emerald & wrong picks in Broadcast Vermilion!
        updateTwine(isCorrect ? 'correct' : 'wrong');
        cardEls.forEach((el, idx) => {
          el.disabled = true;
          if (targetSet.has(idx)) {
            el.classList.add('is-reveal-correct');
          } else if (picked.includes(idx)) {
            el.classList.add('is-reveal-wrong');
          }
        });

        context.onRevealFlash?.(isCorrect);
        scheduleReveal(
          () => {
            emitOnce({
              isCorrect,
              accuracyRatio: isCorrect ? 1.0 : 0.0,
              chipMultiplier: isCorrect ? 1.15 : 0.0,
              chosenSummary: chosenText,
              trueAnswerDisplay: trueText,
              triggeredKlaxon: !isCorrect && Boolean(clue.isKlaxonMyth),
              fellForPoisonedFix: false,
            });
          },
          420,
          220,
        );
      };

      let lassoDragging = false;

      lasso.cards.slice(0, 9).forEach((cardLabel, idx) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'ws7-pin-card ws7-cream-plaque';
        card.dataset.cardIdx = String(idx);
        card.innerHTML = `<span class="ws7-brass-tack" aria-hidden="true"></span><span>${escHtml(cardLabel)}</span>`;

        card.addEventListener('pointerdown', () => {
          if (resolved || locking || disposed || cutCards.has(idx) || picked.length >= 3 || !isInputArmed()) {
            return;
          }
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
        if (!lassoDragging || resolved || locking || disposed || picked.length >= 3) return;
        const el = document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest('[data-card-idx]') as HTMLElement | null;
        if (!el || el.dataset.cardIdx === undefined) return;
        const idx = Number(el.dataset.cardIdx);
        if (!cutCards.has(idx) && !picked.includes(idx)) {
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

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        const triadSet = new Set<number>(lasso.triadIndices);
        const decoys = cardEls
          .map((_, idx) => idx)
          .filter((idx) => !triadSet.has(idx) && !cutCards.has(idx))
          .slice(0, 3);
        for (const idx of decoys) {
          cutCards.add(idx);
          const pos = picked.indexOf(idx);
          if (pos >= 0) picked.splice(pos, 1);
          const card = cardEls[idx];
          if (card) {
            card.classList.add('is-fifty-cut');
            card.disabled = true;
            appendFiftyStampToMeta(card);
          }
        }
        updateTwine();
        context.onTactileSfx?.('SHUTTER_CLACK');
        return decoys;
      };

      showAudiencePollImpl = () => {
        if (resolved || locking || disposed) return;
        const firstAnchor = lasso.cards[lasso.triadIndices[0]] ?? '';
        upsertLifelineRibbon(
          'poll',
          `<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${renderPollIconMicroSvgV7()} STUDIO POLL: 81% OF THE AUDIENCE LINKED <strong style="color:#FFD166;">${escHtml(firstAnchor)}</strong> INTO THE TRIAD!</span>`,
        );
        context.onTactileSfx?.('DETENT');
      };

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

      const cutChoices = new Set<number>();
      const cutZones = new Set<number>();
      const legendBtns: HTMLButtonElement[] = [];
      const legendPollSlots: HTMLDivElement[] = [];

      const hasPatentTube =
        Boolean(context.hasPatentCyanotypeTube) ||
        Boolean(context.equippedRelicIds?.includes('relic_patent_cyanotype_tube'));
      const patentHintIdx =
        context.dayJob === 'PATENT_CLERK' || hasPatentTube
          ? cyano.targetZoneIdx
          : null;
      const pruneZoneIdx = context.pruneActive
        ? isSpatialStem
          ? (cyano.targetZoneIdx + 3) % 8
          : choiceToZone[clue.waiverPruneIdx]
        : null;
      const poisonedZoneIdx = isSpatialStem
        ? (cyano.targetZoneIdx + 5) % 8
        : choiceToZone[clue.poisonedFixIdx];
      const canaryZoneIdx =
        typeof context.canaryTickIdx === 'number'
          ? isSpatialStem
            ? context.canaryTickIdx % 8
            : (choiceToZone[context.canaryTickIdx] ?? cyano.targetZoneIdx)
          : null;

      const selectZoneByIndex = (zIdx: number): void => {
        if (resolved || locking || disposed || cutZones.has(zIdx) || !isInputArmed()) return;
        locking = true;
        context.onLockInStart?.(isClutch);
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
        // Highlight chosen & true legend button in Emerald (✓) / Vermilion (✗)!
        if (!isSpatialStem) {
          legendBtns.forEach((btn, idx) => {
            btn.disabled = true;
            if (idx === clue.answerIdx) {
              btn.classList.add('is-reveal-correct');
            } else if (!isCorrect && idx === cIdx) {
              btn.classList.add('is-reveal-wrong');
            }
          });
        }
        context.onRevealFlash?.(isCorrect);
        scheduleReveal(
          () => {
            emitOnce({
              isCorrect,
              accuracyRatio: isCorrect ? 1.0 : 0.0,
              chipMultiplier: 1.15,
              chosenSummary: pickedLabel,
              trueAnswerDisplay: cyano.targetZoneName,
              triggeredKlaxon: !isCorrect && Boolean(clue.isKlaxonMyth),
              fellForPoisonedFix: !isCorrect && zIdx === poisonedZoneIdx,
            });
          },
          400,
          200,
        );
      };

      const mountBlueprint = (flashIdx: number | null): void => {
        wrap.innerHTML = renderCyanotypePlateSVG(cyano.plateId, {
          activeZoneIdx: flashIdx,
          revealedTargetIdx: flashIdx !== null ? cyano.targetZoneIdx : null,
          patentClerkHintIdx: patentHintIdx,
          pruneZoneIdx,
          canaryZoneIdx,
          poisonedZoneIdx,
          uvLoupeActive: context.uvLoupeActive,
        });

        const chambers = wrap.querySelectorAll<SVGGElement>('[data-zone-idx]');
        chambers.forEach((g) => {
          const zIdx = Number(g.dataset.zoneIdx ?? 0);
          if (cutZones.has(zIdx)) {
            g.style.opacity = '0.2';
            g.style.pointerEvents = 'none';
            return;
          }
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

          if (flashIdx !== null) {
            if (zIdx === flashIdx) {
              const x0 = Number(g.dataset.x0 ?? 24);
              const y0 = Number(g.dataset.y0 ?? 30);
              const cx = x0 + 50;
              const cy = y0 + 44;
              const reticle = document.createElementNS('http://www.w3.org/2000/svg', 'g');
              reticle.setAttribute('class', context.reducedMotion ? '' : 'ws7-loupe-reticle');
              const ringColor = zIdx === cyano.targetZoneIdx ? '#22C55E' : '#FFD166';
              reticle.innerHTML = `
                <circle cx="${cx}" cy="${cy}" r="26" fill="none" stroke="${ringColor}" stroke-width="3" stroke-dasharray="7 4"/>
                <line x1="${cx - 34}" y1="${cy}" x2="${cx - 18}" y2="${cy}" stroke="#FFFDF7" stroke-width="2.2"/>
                <line x1="${cx + 18}" y1="${cy}" x2="${cx + 34}" y2="${cy}" stroke="#FFFDF7" stroke-width="2.2"/>
                <line x1="${cx}" y1="${cy - 34}" x2="${cx}" y2="${cy - 18}" stroke="#FFFDF7" stroke-width="2.2"/>
                <line x1="${cx}" y1="${cy + 18}" x2="${cx}" y2="${cy + 34}" stroke="#FFFDF7" stroke-width="2.2"/>
              `;
              g.appendChild(reticle);
            }
            return;
          }

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
            <div class="ws7-poll-slot"></div>
          `;
          btn.addEventListener('click', () => selectZoneByIndex(zIdx));
          legendBtns.push(btn);
          legendPollSlots.push(btn.querySelector('.ws7-poll-slot') as HTMLDivElement);
          legendGrid.appendChild(btn);
        });
        outerLayout.appendChild(legendGrid);
      }

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        if (!isSpatialStem) {
          const toCut = pickTwoWrongChoiceIndices(clue.answerIdx, clue, cutChoices);
          for (const cIdx of toCut) {
            cutChoices.add(cIdx);
            cutZones.add(choiceToZone[cIdx]);
            const btn = legendBtns[cIdx];
            if (btn) {
              btn.classList.add('is-fifty-cut');
              btn.disabled = true;
              appendFiftyStampToMeta(btn);
              legendPollSlots[cIdx].classList.remove('is-visible');
              legendPollSlots[cIdx].innerHTML = '';
            }
          }
          mountBlueprint(null);
          context.onTactileSfx?.('SHUTTER_CLACK');
          return toCut;
        }
        const wrongZones = [0, 1, 2, 3, 4, 5, 6, 7]
          .filter((z) => z !== cyano.targetZoneIdx && !cutZones.has(z))
          .slice(0, 4);
        wrongZones.forEach((z) => cutZones.add(z));
        mountBlueprint(null);
        upsertLifelineRibbon(
          'fifty',
          `<span class="ws7-stamp-fifty">50/50 CUT</span><span>4 DECOY MONITOR ZONES POWERED DOWN!</span>`,
        );
        context.onTactileSfx?.('SHUTTER_CLACK');
        return wrongZones;
      };

      showAudiencePollImpl = (percentages) => {
        if (resolved || locking || disposed) return;
        if (!isSpatialStem) {
          const live = [0, 1, 2, 3].filter((i) => !cutChoices.has(i));
          const normalized = normalizeLivePollPercentages(percentages, live);
          let maxPct = -1;
          normalized.forEach((v) => {
            if (v > maxPct) maxPct = v;
          });
          [0, 1, 2, 3].forEach((idx) => {
            const slot = legendPollSlots[idx];
            if (cutChoices.has(idx)) {
              slot.classList.remove('is-visible');
              slot.innerHTML = '';
              return;
            }
            const pct = normalized.get(idx) ?? 0;
            slot.innerHTML = renderPollBarBadgeHtml(pct, pct === maxPct && maxPct > 0);
            slot.classList.add('is-visible');
          });
        } else {
          const rowName = cyano.targetZoneIdx < 4 ? 'UPPER ROW' : 'LOWER ROW';
          upsertLifelineRibbon(
            'poll',
            `<span style="display:inline-flex;align-items:center;gap:5px;flex-wrap:wrap;justify-content:center;">${renderPollIconMicroSvgV7()} STUDIO POLL: 74% POINT TO <strong style="color:#FFD166;">${rowName} · ZONE #${cyano.targetZoneIdx + 1}</strong></span>`,
          );
        }
        context.onTactileSfx?.('DETENT');
      };

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
            <span style="font-size:14.5px;opacity:0.92;">(${nextMult.toFixed(1)}×)</span>
          `;
        }
      };
      renderShutters();

      crackBtn.addEventListener('click', () => {
        if (resolved || locking || disposed || openCount >= 4 || !isInputArmed()) return;
        lastOpenedIdx = openCount;
        openCount += 1;
        paidCracks += 1;
        context.onTactileSfx?.('SHUTTER_CLACK');
        renderShutters();
      });

      const keysGrid = document.createElement('div');
      keysGrid.className = 'ws7-shutter-keys';

      const cutKeys = new Set<number>();
      const keyBtns: HTMLButtonElement[] = [];
      const keyTails: HTMLSpanElement[] = [];
      const keyPollSlots: HTMLDivElement[] = [];

      clue.choices.forEach((choiceText, idx) => {
        const keyBtn = document.createElement('button');
        keyBtn.type = 'button';
        keyBtn.className = 'ws7-shutter-key-btn ws7-cream-plaque';
        keyBtn.dataset.choiceIdx = String(idx);
        keyBtn.innerHTML = `
          <span style="font-family:var(--ws7-toy-caps);font-size:15.5px;font-weight:900;color:#008B9A;flex:0 0 auto;">${STUDIO_LETTERS_V7[idx]}.</span>
          <div class="ws7-pad-body" style="flex:1 1 auto;min-width:0;">
            <div class="ws7-choice-copy">${escHtml(choiceText)}</div>
            ${renderDiegeticChoiceOverlaysHtml(clue, idx, context)}
            <div class="ws7-poll-slot"></div>
          </div>
          <span class="ws7-pad-tail"></span>
        `;

        const tailEl = keyBtn.querySelector('.ws7-pad-tail') as HTMLSpanElement;
        const pollSlot = keyBtn.querySelector('.ws7-poll-slot') as HTMLDivElement;
        keyBtns.push(keyBtn);
        keyTails.push(tailEl);
        keyPollSlots.push(pollSlot);

        keyBtn.addEventListener('click', () => {
          if (resolved || locking || disposed || cutKeys.has(idx) || !isInputArmed()) return;
          const mult = getCurrentMult();
          const res = buildChoiceResolution(clue, idx, mult, `[${mult.toFixed(1)}x]`);
          runTwoBeatChoiceReveal({
            containerEl: keysGrid,
            chosenEl: keyBtn,
            correctEl: keyBtns[clue.answerIdx] ?? null,
            chosenTailSlot: tailEl,
            correctTailSlot: keyTails[clue.answerIdx] ?? null,
            isCorrect: res.isCorrect,
            sfx: 'THROW_SNAP',
            resolution: res,
          });
        });
        keysGrid.appendChild(keyBtn);
      });

      topRow.append(shuttersGrid, crackBtn);
      layout.append(topRow, keysGrid);
      root.appendChild(layout);

      applyFiftyFiftyImpl = () => {
        if (resolved || locking || disposed) return [];
        const toCut = pickTwoWrongChoiceIndices(clue.answerIdx, clue, cutKeys);
        for (const idx of toCut) {
          cutKeys.add(idx);
          const btn = keyBtns[idx];
          if (btn) {
            btn.classList.add('is-fifty-cut');
            btn.disabled = true;
            appendFiftyStampToMeta(btn);
            keyPollSlots[idx].classList.remove('is-visible');
            keyPollSlots[idx].innerHTML = '';
          }
        }
        context.onTactileSfx?.('SHUTTER_CLACK');
        return toCut;
      };

      showAudiencePollImpl = (percentages) => {
        if (resolved || locking || disposed) return;
        const live = [0, 1, 2, 3].filter((i) => !cutKeys.has(i));
        const normalized = normalizeLivePollPercentages(percentages, live);
        let maxPct = -1;
        normalized.forEach((v) => {
          if (v > maxPct) maxPct = v;
        });
        [0, 1, 2, 3].forEach((idx) => {
          const slot = keyPollSlots[idx];
          if (cutKeys.has(idx)) {
            slot.classList.remove('is-visible');
            slot.innerHTML = '';
            return;
          }
          const pct = normalized.get(idx) ?? 0;
          slot.innerHTML = renderPollBarBadgeHtml(pct, pct === maxPct && maxPct > 0);
          slot.classList.add('is-visible');
        });
        context.onTactileSfx?.('DETENT');
      };

      break;
    }
  }

  queueMicrotask(() => {
    if (!disposed) enhanceMountedQuestionChassisV7(container);
  });

  return {
    toyId,
    cardStyle: resolvedCardStyle,
    applyFiftyFiftyPrune(): readonly number[] {
      if (fiftyFiftyPruned !== null) return fiftyFiftyPruned;
      fiftyFiftyPruned = applyFiftyFiftyImpl();
      queueMicrotask(() => {
        if (!disposed) enhanceMountedQuestionChassisV7(container);
      });
      return fiftyFiftyPruned;
    },
    showAudiencePollOverlay(percentages: readonly number[]): void {
      showAudiencePollImpl(percentages);
      queueMicrotask(() => {
        if (!disposed) enhanceMountedQuestionChassisV7(container);
      });
    },
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
