/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 — SWEEPS WEEK DELUXE)
// `src/v7/ui/SmartStudioCoachV8.ts`
//
// First-5-Minutes Zero-Assumption UX, Plain-English 26-Guide Studio Coach,
// Glowing Studio Cheats Console & 5-Speed Question Timer Selector:
//   1. Persistent Non-Nagging Tutorial Ledger (`ws8_smart_coach_seen_v1` in
//      `localStorage`) — strict 1st-occurrence-ONLY rule + mute toggle.
//   2. Complete 26-Guide Plain-English Catalog (5 Classic Question Card Styles,
//      13 Showcase Contraptions `TOY_02..TOY_14`, 8 TV Board Play Modes) +
//      Tile Twist & Studio Cheat micro-tips — zero trivia jargon!
//   3. Sunlit 1966 Studio Cue-Card Explainer Modal (`maybeOpenFirstTimeCoachV8`
//      & `openStudioCoachOnDemandV8`) in Warm Broadcast Cream (#FAF2DF),
//      Sunlit American Walnut (#6E3B23), Brushed Brass (#D9A441), Peacock Teal
//      (#008B94) & Atomic Tangerine (#FF6B35) with 26 bespoke Mid-Century
//      vector diagrams (zero SVG text overlaps, zero dark-navy boxes, zero OS emojis!).
//   4. Reusable 5-Speed Question Timer Selector (`renderQuestionTimerSelectorV8`
//      & `mountQuestionTimerSelectorV8`) for Quick Play, Settings & Couch 2P.
// ============================================================================

import {
  QUESTION_TIMER_MODES_V8,
  type BoardPlayModeV7,
  type ClassicTvTileTwistV7,
  type QuestionCardStyleV7,
  type QuestionTimerModeV8,
  type ToyIdV7,
} from '../contracts_v7';

/** Canonical `contracts_v7` alias for TV board tile twists. */
export type BoardTileTwistV7 = ClassicTvTileTwistV7;

export const SMART_COACH_STORAGE_KEY_V8 = 'ws8_smart_coach_seen_v1';

const SMART_COACH_STYLE_ID_V8 = 'ws8-smart-studio-coach-sunlit-styles';

// ----------------------------------------------------------------------------
// 1. Canonical 26-Guide Keys & Shared Data Structures
// ----------------------------------------------------------------------------

export type StudioQuestionStyleGuideKeyV8 =
  | 'STYLE_CLASSIC_CUE'
  | 'STYLE_SPOT_THE_MYTH'
  | 'STYLE_HEADLINE_BLANK'
  | 'STYLE_PICTURE_MONITOR'
  | 'STYLE_BINARY_SPLIT';

export type StudioShowcaseToyGuideKeyV8 =
  | 'TOY_02_CONFIDENCE_PNEUMATIC'
  | 'TOY_03_VERNIER_DIAL'
  | 'TOY_04_BALANCE_SCALE'
  | 'TOY_05_RELIEF_GLOBE_3D'
  | 'TOY_06_FUSE_WIRE_SNIPPER'
  | 'TOY_07_MAIL_SORTER'
  | 'TOY_08_CHRONOLOGY_RAIL'
  | 'TOY_09_SWITCHBOARD_PATCHBAY'
  | 'TOY_10_CLIFFHANGERS_THROTTLE'
  | 'TOY_11_MISSING_VOWELS_WHEEL'
  | 'TOY_12_CONSPIRACY_LASSO'
  | 'TOY_13_CYANOTYPE_LOUPE'
  | 'TOY_14_FOUR_SHUTTER_REEL';

export type StudioBoardModeGuideKeyV8 =
  | 'BOARD_CLASSIC_TOTE'
  | 'BOARD_TIC_TAC_LINE'
  | 'BOARD_COAST_HEX_BRIDGE'
  | 'BOARD_CONCENTRATION_PRIZE'
  | 'BOARD_EYE_GUESS_MEMORY'
  | 'BOARD_PRESS_YOUR_LUCK'
  | 'BOARD_BIG_WHEEL_SHOW'
  | 'BOARD_CURTAIN_DEAL_SHOW';

export type StudioGuideKeyV8 =
  | StudioQuestionStyleGuideKeyV8
  | StudioShowcaseToyGuideKeyV8
  | StudioBoardModeGuideKeyV8;

export type StudioGuideCategoryV8 = 'QUESTION_STYLE' | 'SHOWCASE_TOY' | 'BOARD_MODE';

export interface PlainMicroTipV8 {
  readonly badge: string;
  readonly plainInstruction: string;
}

export interface StudioGuideSpecV8 {
  readonly guideKey: StudioGuideKeyV8;
  readonly category: StudioGuideCategoryV8;
  readonly kickerLabel: string;
  readonly title: string;
  readonly badge: string;
  readonly plainInstruction: string;
  readonly whatsHappening: string;
  readonly howToPlay: string;
  readonly goodToKnow: string;
  readonly crownTheme: 'PEACOCK' | 'TANGERINE' | 'GOLD' | 'CERISE';
}

export interface SmartCoachLedgerStateV8 {
  seenKeys: Record<string, true>;
  muteAutoTips: boolean;
}

export interface StudioCoachModalCallbacksV8 {
  readonly onPauseClock?: () => void;
  readonly onResumeClock?: () => void;
  readonly muteGlobalSetting?: boolean;
  readonly onMuteAutoTipsChange?: (muted: boolean) => void;
  readonly onTapSfx?: () => void;
  readonly reducedMotion?: boolean;
}

export interface QuestionTimerModeSpecV8 {
  readonly mode: QuestionTimerModeV8;
  readonly shortCode: string;
  readonly label: string;
  readonly fullPillLabel: string;
  readonly seconds: number | null;
  readonly plainSummary: string;
}

export interface QuestionTimerSelectorRenderOptionsV8 {
  readonly value?: QuestionTimerModeV8;
  readonly selected?: QuestionTimerModeV8;
  readonly compact?: boolean;
  readonly showHeader?: boolean;
  readonly headerLabel?: string;
  readonly showSummary?: boolean;
  readonly idPrefix?: string;
}

export interface MountQuestionTimerSelectorOptionsV8
  extends QuestionTimerSelectorRenderOptionsV8 {
  readonly initialMode?: QuestionTimerModeV8;
  readonly onChange?: (mode: QuestionTimerModeV8) => void;
  readonly onTapSfx?: () => void;
}

export interface MountedQuestionTimerSelectorV8 {
  readonly rootEl: HTMLElement;
  getValue(): QuestionTimerModeV8;
  setValue(mode: QuestionTimerModeV8, silent?: boolean): void;
  dispose(): void;
}

export type StudioCheatIdV8 = 'FIFTY_FIFTY' | 'AUDIENCE_POLL' | 'FREE_SWAP';

export interface StudioCheatSpecV8 {
  readonly id: StudioCheatIdV8;
  readonly badge: string;
  readonly buttonLabel: string;
  readonly plainInstruction: string;
}

// ----------------------------------------------------------------------------
// 2. Alias Normalization & Persistent Non-Nagging Ledger (`localStorage`)
// ----------------------------------------------------------------------------

const BOARD_MODE_TO_GUIDE_KEY_V8: Record<BoardPlayModeV7, StudioBoardModeGuideKeyV8> = {
  CLASSIC_TOTE: 'BOARD_CLASSIC_TOTE',
  TIC_TAC_LINE: 'BOARD_TIC_TAC_LINE',
  COAST_HEX_BRIDGE: 'BOARD_COAST_HEX_BRIDGE',
  CONCENTRATION_PRIZE_MATCH: 'BOARD_CONCENTRATION_PRIZE',
  EYE_GUESS_MEMORY: 'BOARD_EYE_GUESS_MEMORY',
  PRESS_YOUR_LUCK_GREMLIN: 'BOARD_PRESS_YOUR_LUCK',
  BIG_WHEEL_SHOWCASE: 'BOARD_BIG_WHEEL_SHOW',
  MONTY_CURTAIN_DEAL: 'BOARD_CURTAIN_DEAL_SHOW',
};

const CARD_STYLE_TO_GUIDE_KEY_V8: Record<QuestionCardStyleV7, StudioQuestionStyleGuideKeyV8> = {
  CLASSIC_CUE: 'STYLE_CLASSIC_CUE',
  SPOT_THE_MYTH: 'STYLE_SPOT_THE_MYTH',
  HEADLINE_BLANK: 'STYLE_HEADLINE_BLANK',
  PICTURE_MONITOR: 'STYLE_PICTURE_MONITOR',
  BINARY_SPLIT: 'STYLE_BINARY_SPLIT',
};

const EXTRA_GUIDE_KEY_ALIASES_V8: Readonly<Record<string, StudioGuideKeyV8>> = {
  // Raw QuestionCardStyleV7 aliases
  CLASSIC_CUE: 'STYLE_CLASSIC_CUE',
  SPOT_THE_MYTH: 'STYLE_SPOT_THE_MYTH',
  HEADLINE_BLANK: 'STYLE_HEADLINE_BLANK',
  PICTURE_MONITOR: 'STYLE_PICTURE_MONITOR',
  BINARY_SPLIT: 'STYLE_BINARY_SPLIT',
  TOY_01_KNIFE_SWITCH: 'STYLE_CLASSIC_CUE',
  // Raw & prefixed BoardPlayModeV7 aliases
  CLASSIC_TOTE: 'BOARD_CLASSIC_TOTE',
  TIC_TAC_LINE: 'BOARD_TIC_TAC_LINE',
  COAST_HEX_BRIDGE: 'BOARD_COAST_HEX_BRIDGE',
  CONCENTRATION_PRIZE_MATCH: 'BOARD_CONCENTRATION_PRIZE',
  BOARD_CONCENTRATION_PRIZE_MATCH: 'BOARD_CONCENTRATION_PRIZE',
  EYE_GUESS_MEMORY: 'BOARD_EYE_GUESS_MEMORY',
  PRESS_YOUR_LUCK_GREMLIN: 'BOARD_PRESS_YOUR_LUCK',
  BOARD_PRESS_YOUR_LUCK_GREMLIN: 'BOARD_PRESS_YOUR_LUCK',
  BIG_WHEEL_SHOWCASE: 'BOARD_BIG_WHEEL_SHOW',
  BOARD_BIG_WHEEL_SHOWCASE: 'BOARD_BIG_WHEEL_SHOW',
  MONTY_CURTAIN_DEAL: 'BOARD_CURTAIN_DEAL_SHOW',
  BOARD_MONTY_CURTAIN_DEAL: 'BOARD_CURTAIN_DEAL_SHOW',
};

let memoryLedgerFallbackV8: SmartCoachLedgerStateV8 = {
  seenKeys: {},
  muteAutoTips: false,
};

function readSmartCoachLedgerV8(): SmartCoachLedgerStateV8 {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(SMART_COACH_STORAGE_KEY_V8);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SmartCoachLedgerStateV8> | null;
        if (parsed && typeof parsed === 'object') {
          const cleanSeen: Record<string, true> = {};
          if (parsed.seenKeys && typeof parsed.seenKeys === 'object') {
            for (const [k, v] of Object.entries(parsed.seenKeys)) {
              if (v === true && k.trim().length > 0) {
                cleanSeen[k.trim()] = true;
              }
            }
          }
          const state: SmartCoachLedgerStateV8 = {
            seenKeys: cleanSeen,
            muteAutoTips: Boolean(parsed.muteAutoTips),
          };
          memoryLedgerFallbackV8 = state;
          return state;
        }
      }
    }
  } catch {
    // Fall back cleanly to in-memory ledger if storage is restricted.
  }
  return {
    seenKeys: { ...memoryLedgerFallbackV8.seenKeys },
    muteAutoTips: memoryLedgerFallbackV8.muteAutoTips,
  };
}

function writeSmartCoachLedgerV8(next: SmartCoachLedgerStateV8): void {
  memoryLedgerFallbackV8 = {
    seenKeys: { ...next.seenKeys },
    muteAutoTips: Boolean(next.muteAutoTips),
  };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        SMART_COACH_STORAGE_KEY_V8,
        JSON.stringify(memoryLedgerFallbackV8),
      );
    }
  } catch {
    // Ignore quota/sandbox storage exceptions; memoryLedgerFallbackV8 stays authoritative.
  }
}

function toLedgerCanonicalKey(guideKey: string): string {
  const trimmed = (guideKey ?? '').trim();
  if (!trimmed) return '';
  const upper = trimmed.toUpperCase();
  if (upper in STUDIO_GUIDE_CATALOG_V8) {
    return upper;
  }
  const alias = EXTRA_GUIDE_KEY_ALIASES_V8[upper];
  return alias ?? trimmed;
}

export function hasSeenStudioGuideV8(guideKey: string): boolean {
  const normalized = toLedgerCanonicalKey(guideKey);
  if (!normalized) return false;
  const ledger = readSmartCoachLedgerV8();
  return ledger.seenKeys[normalized] === true || ledger.seenKeys[guideKey.trim()] === true;
}

export function markStudioGuideSeenV8(guideKey: string): void {
  const normalized = toLedgerCanonicalKey(guideKey);
  if (!normalized) return;
  const ledger = readSmartCoachLedgerV8();
  if (ledger.seenKeys[normalized] === true) return;
  ledger.seenKeys[normalized] = true;
  writeSmartCoachLedgerV8(ledger);
}

export function isAutoTipsMutedV8(): boolean {
  return readSmartCoachLedgerV8().muteAutoTips;
}

export function setAutoTipsMutedV8(muted: boolean): void {
  const ledger = readSmartCoachLedgerV8();
  ledger.muteAutoTips = Boolean(muted);
  writeSmartCoachLedgerV8(ledger);
}

export function resetSeenStudioGuidesV8(): void {
  memoryLedgerFallbackV8 = {
    seenKeys: {},
    muteAutoTips: false,
  };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(SMART_COACH_STORAGE_KEY_V8);
    }
  } catch {
    // Ignore storage removal errors in restricted contexts.
  }
}

// ----------------------------------------------------------------------------
// 3. Complete Plain-English 26-Guide Studio Catalog (Zero Jargon!)
// ----------------------------------------------------------------------------

export const STUDIO_GUIDE_CATALOG_V8: Readonly<Record<StudioGuideKeyV8, StudioGuideSpecV8>> = {
  // --- A. 5 Classic Question Card Styles (`STYLE_*`) ---
  STYLE_CLASSIC_CUE: {
    guideKey: 'STYLE_CLASSIC_CUE',
    category: 'QUESTION_STYLE',
    kickerLabel: '1966 STUDIO MONITOR · 4-CHOICE CUE CARD',
    title: 'Classic 4-Choice Cue Card',
    badge: 'CLASSIC 4-CHOICE',
    plainInstruction: 'Tap A, B, C, or D — or use glowing Studio Cheats below if unsure!',
    whatsHappening:
      'Four backlit studio answer pads sit right below Grant Bellamy’s question clue.',
    howToPlay:
      'Tap A, B, C, or D once to lock in the answer you believe is right.',
    goodToKnow:
      'Stumped? Tap the glowing Studio Cheats bar (50/50 Cut, Ask Audience, or Free Swap) before choosing!',
    crownTheme: 'PEACOCK',
  },
  STYLE_SPOT_THE_MYTH: {
    guideKey: 'STYLE_SPOT_THE_MYTH',
    category: 'QUESTION_STYLE',
    kickerLabel: 'KLAXON ALERT · REVERSE FACT CHECK',
    title: 'Spot the False Myth!',
    badge: 'SPOT THE MYTH',
    plainInstruction: '3 of these 4 statements are TRUE facts — tap the 1 BOGUS MYTH!',
    whatsHappening:
      'Three of these four pads are 100% TRUE facts, and one is a bogus dinner-table myth.',
    howToPlay:
      'Tap the 1 FALSE MYTH that is NOT true to silence the alarm and bank the cash!',
    goodToKnow:
      'Watch your instinct — tapping a true statement triggers the Popular-Myth Klaxon!',
    crownTheme: 'CERISE',
  },
  STYLE_HEADLINE_BLANK: {
    guideKey: 'STYLE_HEADLINE_BLANK',
    category: 'QUESTION_STYLE',
    kickerLabel: 'TELETYPE PRESS DESK · MISSING WORD',
    title: 'Fill in the Missing Headline Word',
    badge: 'HEADLINE BLANK',
    plainInstruction: 'Pick the choice that completes the blank [ ___ ] in the headline!',
    whatsHappening:
      'A 1966 front-page press bulletin has one crucial word blanked out as [ ___ ].',
    howToPlay:
      'Tap choice A, B, C, or D that cleanly fills in the missing [ ___ ] word.',
    goodToKnow:
      'Read the whole headline with your word slotted in — Studio Cheats work here too!',
    crownTheme: 'PEACOCK',
  },
  STYLE_PICTURE_MONITOR: {
    guideKey: 'STYLE_PICTURE_MONITOR',
    category: 'QUESTION_STYLE',
    kickerLabel: 'CAMERA 1 CLOSE-UP · VISUAL CLUE',
    title: '1966 Color Picture Monitor',
    badge: 'PICTURE MONITOR',
    plainInstruction: 'Use the painted category monitor clue + stem to pick A, B, C, or D!',
    whatsHappening:
      'Studio Camera 1 frames a painted 1966 color illustration right alongside your question.',
    howToPlay:
      'Pair the visual clue on the TV screen with the question text to tap A, B, C, or D.',
    goodToKnow:
      'Look closely at the painted monitor — visual details often nudge you toward the winner!',
    crownTheme: 'PEACOCK',
  },
  STYLE_BINARY_SPLIT: {
    guideKey: 'STYLE_BINARY_SPLIT',
    category: 'QUESTION_STYLE',
    kickerLabel: 'HEAD-TO-HEAD · RAPID 2-CHOICE DUEL',
    title: '50/50 Rapid Either-Or',
    badge: '50/50 EITHER-OR',
    plainInstruction: 'Just 2 choices — tap Left or Right for a straight head-to-head pick!',
    whatsHappening:
      'Only two giant backlit studio paddles stand between you and the prize dollars.',
    howToPlay:
      'Tap either the Left paddle or the Right paddle for a straight 50/50 decision.',
    goodToKnow:
      'Even a pure hunch gives you a clean 50% shot — trust your gut and fire!',
    crownTheme: 'TANGERINE',
  },

  // --- B. All 13 Showcase Contraptions (`TOY_02`..`TOY_14`) ---
  TOY_02_CONFIDENCE_PNEUMATIC: {
    guideKey: 'TOY_02_CONFIDENCE_PNEUMATIC',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · WAGER LEVER',
    title: 'Confidence Wager Lever',
    badge: 'CONFIDENCE LEVER',
    plainInstruction: 'Pick Low, Medium, or High confidence before locking your answer!',
    whatsHappening:
      'A 3-notch brass wager lever lets you size your confidence before you pick an answer.',
    howToPlay:
      'Select Low (0.75× Safe), Medium (1.0×), or High (1.25× Bold), then tap your answer pad!',
    goodToKnow:
      'Feeling unsure? Low Confidence cushions tough topics, while High Confidence boosts sure wins!',
    crownTheme: 'GOLD',
  },
  TOY_03_VERNIER_DIAL: {
    guideKey: 'TOY_03_VERNIER_DIAL',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · NUMBER ESTIMATE',
    title: 'Closest-Number Dial',
    badge: 'CLOSEST-NUMBER DIAL',
    plainInstruction:
      'Drag the brass dial to estimate — you do not need the exact number; close estimates still win cash!',
    whatsHappening:
      'This precision brass studio dial asks you to estimate a real-world number on a scale.',
    howToPlay:
      'Drag or tap along the dial to set your best number estimate, then press LOCK IN.',
    goodToKnow:
      'You never need the exact figure — landing near the answer inside the green zone still wins cash!',
    crownTheme: 'TANGERINE',
  },
  TOY_04_BALANCE_SCALE: {
    guideKey: 'TOY_04_BALANCE_SCALE',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · TWO-WEIGHT SUM',
    title: 'Twin-Weight Balance Scale',
    badge: 'BALANCE SCALE',
    plainInstruction: 'Tap 2 brass weights whose numbers add up to the target total!',
    whatsHappening:
      'Five stamped brass weights rest below a balance beam displaying one Target Total.',
    howToPlay:
      'Tap the 2 brass weights that add up together to match the exact Target Total.',
    goodToKnow:
      'Picked the wrong first weight? Just tap it again to put it back before picking your second!',
    crownTheme: 'GOLD',
  },
  TOY_05_RELIEF_GLOBE_3D: {
    guideKey: 'TOY_05_RELIEF_GLOBE_3D',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · 3D ATLAS PIN',
    title: '3D World Globe Pin',
    badge: '3D WORLD GLOBE',
    plainInstruction:
      'Spin the 3D Earth and drop your pin near the target place — nearby pins still score partial cash!',
    whatsHappening:
      'An interactive 3D studio globe asks you to pinpoint a famous city, landmark, or country.',
    howToPlay:
      'Drag to spin the 3D Earth, tap to drop your pin on the target spot, and lock it in.',
    goodToKnow:
      'Zero pinpoint stress — dropping your pin in the right region still scores generous partial cash!',
    crownTheme: 'PEACOCK',
  },
  TOY_06_FUSE_WIRE_SNIPPER: {
    guideKey: 'TOY_06_FUSE_WIRE_SNIPPER',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · COLORED CABLES',
    title: 'Bomb-Squad Wire Snipper',
    badge: 'WIRE SNIPPER',
    plainInstruction: 'Snip the 1 correct colored wire tied to the true answer!',
    whatsHappening:
      'Four color-coded studio fuse wires connect to the four possible answers.',
    howToPlay:
      'Tap the 1 colored wire that matches the TRUE answer to snip it cleanly!',
    goodToKnow:
      'Need a hand? Use 50/50 Studio Cut first to safely disconnect two wrong wires!',
    crownTheme: 'CERISE',
  },
  TOY_07_MAIL_SORTER: {
    guideKey: 'TOY_07_MAIL_SORTER',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · TWO-BIN SORT',
    title: 'Two-Chute Sorter',
    badge: 'TWO-CHUTE SORTER',
    plainInstruction: 'Sort each card cleanly into either the Left chute or the Right chute!',
    whatsHappening:
      'A quick stack of clue cards needs to be routed between two labeled brass chutes.',
    howToPlay:
      'Read the top card and tap either the Left chute button or the Right chute button.',
    goodToKnow:
      'Take a breath and check the two chute headers first — the studio clock pauses while you read this!',
    crownTheme: 'PEACOCK',
  },
  TOY_08_CHRONOLOGY_RAIL: {
    guideKey: 'TOY_08_CHRONOLOGY_RAIL',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · HISTORY ORDER',
    title: 'Earliest-to-Latest Timeline',
    badge: 'TIMELINE ORDER',
    plainInstruction: 'Tap or order the events from the oldest year to the newest year!',
    whatsHappening:
      'Famous milestones sit scrambled out of sequence along a brass timeline track.',
    howToPlay:
      'Place the events in order starting from the EARLIEST (oldest) year to the LATEST (newest) year.',
    goodToKnow:
      'Spot the oldest and newest anchors first — close timeline orders can still earn partial credit!',
    crownTheme: 'GOLD',
  },
  TOY_09_SWITCHBOARD_PATCHBAY: {
    guideKey: 'TOY_09_SWITCHBOARD_PATCHBAY',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · CORD MATCHING',
    title: '3-Cord Operator Switchboard',
    badge: '3-CORD SWITCHBOARD',
    plainInstruction: 'Match each left caller plug into its matching right-side socket!',
    whatsHappening:
      'Three left caller plugs wait to be patched into four right-side switchboard sockets.',
    howToPlay:
      'Tap a left plug, then tap its matching right socket until all 3 cords are patched in.',
    goodToKnow:
      'One right socket is an extra decoy — re-tap any plug before locking in to move its cord!',
    crownTheme: 'PEACOCK',
  },
  TOY_10_CLIFFHANGERS_THROTTLE: {
    guideKey: 'TOY_10_CLIFFHANGERS_THROTTLE',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · MOUNTAIN RANGE GAME',
    title: 'Mountain Climber Range Finder',
    badge: 'MOUNTAIN CLIMBER',
    plainInstruction:
      'Slide the throttle to estimate the number without sending the climber over the cliff!',
    whatsHappening:
      'Our studio mountaineer hikes up the peak based on how close your number estimate lands.',
    howToPlay:
      'Slide the brass throttle to dial in your estimate and lock it in before the cliff edge!',
    goodToKnow:
      'Close estimates keep the climber safely on the green mountain ridge and win real cash!',
    crownTheme: 'TANGERINE',
  },
  TOY_11_MISSING_VOWELS_WHEEL: {
    guideKey: 'TOY_11_MISSING_VOWELS_WHEEL',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · WORD DECODER',
    title: 'Missing Vowels Puzzle',
    badge: 'MISSING VOWELS',
    plainInstruction:
      'All vowels A E I O U were removed from the phrase — pick the vowel sequence that decodes it!',
    whatsHappening:
      'Every vowel (A, E, I, O, U) has vanished from the mystery answer on the letter rack.',
    howToPlay:
      'Sound out the remaining consonants and tap the vowel sequence pad that rebuilds the phrase!',
    goodToKnow:
      'Say the consonant cluster softly to yourself — the matching vowel rhythm clicks right into place!',
    crownTheme: 'GOLD',
  },
  TOY_12_CONSPIRACY_LASSO: {
    guideKey: 'TOY_12_CONSPIRACY_LASSO',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · HIDDEN TRIAD',
    title: '3-of-9 Secret Link',
    badge: '3-OF-9 SECRET LINK',
    plainInstruction: 'Tap the 3 cards on the 3×3 board that share the hidden connection!',
    whatsHappening:
      'Nine clue cards sit on a 3×3 studio board, and exactly 3 share the named theme.',
    howToPlay:
      'Tap the 3 matching cards on the grid to link them together with red studio twine.',
    goodToKnow:
      'Tap any highlighted card a second time to unselect it before you lock in your third pick!',
    crownTheme: 'CERISE',
  },
  TOY_13_CYANOTYPE_LOUPE: {
    guideKey: 'TOY_13_CYANOTYPE_LOUPE',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · ILLUSTRATED DIAGRAM',
    title: '8-Panel Visual Monitor',
    badge: '8-PANEL MONITOR',
    plainInstruction: 'Tap the matching illustrated panel 1–8 on the painted TV screen or pad!',
    whatsHappening:
      'An illustrated 8-panel studio diagram numbers eight distinct spots from 1 through 8.',
    howToPlay:
      'Tap the matching panel (1–8) directly on the painted TV diagram or its numbered button.',
    goodToKnow:
      '50/50 Studio Cut works here too — it dims decoy zones so you can zero in fast!',
    crownTheme: 'PEACOCK',
  },
  TOY_14_FOUR_SHUTTER_REEL: {
    guideKey: 'TOY_14_FOUR_SHUTTER_REEL',
    category: 'SHOWCASE_TOY',
    kickerLabel: 'STUDIO SHOWCASE · PROGRESSIVE MULTIPLIER',
    title: '4-Shutter 2.0× Connection Wall',
    badge: '4-SHUTTER 2.0× WALL',
    plainInstruction:
      'Solve on Clue 1 for 2.0× Double Cash, or tap Peek Next Shutter for easier hints (1.6× -> 1.3× -> 1.0×)!',
    whatsHappening:
      'Four brass louvers hide progressive clues pointing to one shared connection.',
    howToPlay:
      'Answer on Clue 1 for 2.0× Double Cash, or tap PEEK NEXT SHUTTER to reveal clearer hints.',
    goodToKnow:
      'Peeking never forfeits your turn — each extra shutter simply steps the bonus from 2.0× down to 1.0×!',
    crownTheme: 'GOLD',
  },

  // --- C. 8 TV Board Modes (`BOARD_*`) ---
  BOARD_CLASSIC_TOTE: {
    guideKey: 'BOARD_CLASSIC_TOTE',
    category: 'BOARD_MODE',
    kickerLabel: 'TONIGHT’S TV BOARD FORMAT · CLASSIC TOTE',
    title: '1964 Classic Tote & Gold Vault',
    badge: 'CLASSIC TOTE',
    plainInstruction:
      'Pick $150–$400 tiles, uncover the hidden 2× Secret Square & unlock the $500 Gold Vault!',
    whatsHappening:
      'Tonight’s tote rack pairs $150–$400 category tiles with a hidden 2× Secret Square and a $500 Gold Vault.',
    howToPlay:
      'Tap any lit tile to answer for its cash; win a neighbor tile or a 2-streak to pop open Locked Vaults!',
    goodToKnow:
      'Hitting the hidden Secret Square doubles that tile’s cash payout automatically!',
    crownTheme: 'PEACOCK',
  },
  BOARD_TIC_TAC_LINE: {
    guideKey: 'BOARD_TIC_TAC_LINE',
    category: 'BOARD_MODE',
    kickerLabel: 'TONIGHT’S TV BOARD FORMAT · 3-IN-A-ROW',
    title: 'Hollywood Squares 3-in-a-Row',
    badge: '3-IN-A-ROW LINE',
    plainInstruction:
      'Connect 3 of your won tiles in a straight or diagonal line for a +$600 Line Jackpot!',
    whatsHappening:
      'Every tile you win stamps your glowing Contestant mark onto the grid toward a 3-in-a-Row line.',
    howToPlay:
      'Link 3 claimed tiles across, down, or diagonally to score an instant +$600 Line Jackpot!',
    goodToKnow:
      'Watch your Rival’s claimed squares — grabbing their third spot blocks their +$600 bonus!',
    crownTheme: 'GOLD',
  },
  BOARD_COAST_HEX_BRIDGE: {
    guideKey: 'BOARD_COAST_HEX_BRIDGE',
    category: 'BOARD_MODE',
    kickerLabel: 'TONIGHT’S TV BOARD FORMAT · COAST BRIDGE',
    title: 'Coast-to-Coast Light Bridge',
    badge: 'COAST BRIDGE',
    plainInstruction:
      'Connect adjacent wins from the Left edge to the Right edge for link boosts and a +$750 Jackpot!',
    whatsHappening:
      'Neighboring tiles you claim ignite glowing light-bridges spanning from New York (Left) to Hollywood (Right).',
    howToPlay:
      'Pick connected neighbor hexes to stack +0.25× link boosts and complete a Left-to-Right bridge for +$750!',
    goodToKnow:
      'Blocked in the center? Angled hex neighbors let you route around your Rival cleanly!',
    crownTheme: 'PEACOCK',
  },
  BOARD_CONCENTRATION_PRIZE: {
    guideKey: 'BOARD_CONCENTRATION_PRIZE',
    category: 'BOARD_MODE',
    kickerLabel: 'TONIGHT’S TV BOARD FORMAT · PRIZE MATCH',
    title: 'Concentration ’65 Prize Match',
    badge: 'PRIZE MATCH',
    plainInstruction:
      'Win tiles to uncover hidden luxury prizes — match 2 identical prizes for a +$500 bonus!',
    whatsHappening:
      'Hidden behind tonight’s trivia tiles are matching halves of 1965 luxury studio prizes.',
    howToPlay:
      'Win tiles to reveal their prize tags; match 2 identical prizes for +$500, or hit TAKE! to swipe $200!',
    goodToKnow:
      'Keep track of prize icons your Rival uncovers so you can scoop the matching twin on your turn!',
    crownTheme: 'GOLD',
  },
  BOARD_EYE_GUESS_MEMORY: {
    guideKey: 'BOARD_EYE_GUESS_MEMORY',
    category: 'BOARD_MODE',
    kickerLabel: 'TONIGHT’S TV BOARD FORMAT · MEMORY FLASH',
    title: 'Eye Guess ’66 Memory Flash',
    badge: 'MEMORY FLASH',
    plainInstruction:
      'Watch the 2.4-second opening board flash to remember where 2× Stars and +$300 Bags hide!',
    whatsHappening:
      'Before play begins, the studio shutters flash open briefly to reveal hidden bonus and trap tiles.',
    howToPlay:
      'Memorize 1 or 2 juicy 2× or +$300 squares during the flash, then tap them once the shutters close!',
    goodToKnow:
      'Blink during the flash? Every tile still shows its category clearly, so your favorite topics stay safe!',
    crownTheme: 'PEACOCK',
  },
  BOARD_PRESS_YOUR_LUCK: {
    guideKey: 'BOARD_PRESS_YOUR_LUCK',
    category: 'BOARD_MODE',
    kickerLabel: 'TONIGHT’S TV BOARD FORMAT · LIGHT-BOARD SPINS',
    title: 'Press Your Luck ’66 Gremlin Board',
    badge: 'PRESS YOUR LUCK',
    plainInstruction:
      'Win Lightning tiles to spin the chasing Light-Board for cash — or PASS SPINS to dodge the Gremlin!',
    whatsHappening:
      'Lightning squares award live spins on the chasing studio Light-Board packed with cash and Studio Gremlins.',
    howToPlay:
      'Stop the chasing light for bonus dollars, or tap PASS SPINS while ahead to hand risky spins to your Rival!',
    goodToKnow:
      'A Studio Gremlin shaves match cash with a slapstick gag — passing hot spins when leading is smart TV play!',
    crownTheme: 'TANGERINE',
  },
  BOARD_BIG_WHEEL_SHOW: {
    guideKey: 'BOARD_BIG_WHEEL_SHOW',
    category: 'BOARD_MODE',
    kickerLabel: 'TONIGHT’S TV BOARD FORMAT · 20-WEDGE WHEEL',
    title: '1966 Big Wheel Showcase',
    badge: 'BIG WHEEL SHOW',
    plainInstruction:
      'Claim Big Wheel tiles to spin the giant 20-wedge Studio Wheel for up to $1,000 & 2× boosts!',
    whatsHappening:
      'Marked Big Wheel squares roll out the towering 20-wedge Studio Wheel right after a correct answer.',
    howToPlay:
      'Win a Big Wheel tile, then flick the wheel for $1,000 Jackpots, 2.0× Double Next Claim, or Free Lifelines!',
    goodToKnow:
      'Spinning 2.0× DOUBLE automatically doubles the cash value of the very next board tile you claim!',
    crownTheme: 'GOLD',
  },
  BOARD_CURTAIN_DEAL_SHOW: {
    guideKey: 'BOARD_CURTAIN_DEAL_SHOW',
    category: 'BOARD_MODE',
    kickerLabel: 'TONIGHT’S TV BOARD FORMAT · CURTAIN DEALS',
    title: 'Let’s Make a Deal Curtain Show',
    badge: 'CURTAIN DEAL SHOW',
    plainInstruction:
      'Win Mystery Curtain tiles to pick Velvet Curtain #1, #2, or #3 for cash envelopes, 2× boosts & steals!',
    whatsHappening:
      'Velvet Mystery Curtains (#1, #2, #3) and mid-show Instant Bargains turn the stage into a trading floor.',
    howToPlay:
      'Claim Curtain tiles to choose behind Curtain #1, #2, or #3, and weigh Instant Bargain offers mid-show!',
    goodToKnow:
      'On Instant Bargain desks, glance at the Lead Gauge first so you never trade away a winning lead!',
    crownTheme: 'CERISE',
  },
};

export const ALL_STUDIO_GUIDE_KEYS_V8: readonly StudioGuideKeyV8[] = Object.keys(
  STUDIO_GUIDE_CATALOG_V8,
) as StudioGuideKeyV8[];

export function normalizeStudioGuideKeyV8(rawKey: string): StudioGuideKeyV8 | null {
  const trimmed = (rawKey ?? '').trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  if (upper in STUDIO_GUIDE_CATALOG_V8) {
    return upper as StudioGuideKeyV8;
  }
  return EXTRA_GUIDE_KEY_ALIASES_V8[upper] ?? null;
}

export function getStudioGuideSpecV8(guideKey: string): StudioGuideSpecV8 | null {
  const canonical = normalizeStudioGuideKeyV8(guideKey);
  return canonical ? STUDIO_GUIDE_CATALOG_V8[canonical] : null;
}

export function resolveQuestionGuideKeyV8(
  toyId: ToyIdV7,
  cardStyle?: QuestionCardStyleV7,
): StudioGuideKeyV8 {
  if (toyId !== 'TOY_01_KNIFE_SWITCH') {
    return toyId as StudioShowcaseToyGuideKeyV8;
  }
  const style: QuestionCardStyleV7 = cardStyle ?? 'CLASSIC_CUE';
  return CARD_STYLE_TO_GUIDE_KEY_V8[style] ?? 'STYLE_CLASSIC_CUE';
}

export function resolveBoardModeGuideKeyV8(
  boardMode: BoardPlayModeV7,
): StudioBoardModeGuideKeyV8 {
  return BOARD_MODE_TO_GUIDE_KEY_V8[boardMode] ?? 'BOARD_CLASSIC_TOTE';
}

export function getQuestionPlainMicroTipV8(
  toyId: ToyIdV7,
  cardStyle?: QuestionCardStyleV7,
): PlainMicroTipV8 {
  const key = resolveQuestionGuideKeyV8(toyId, cardStyle);
  const spec = STUDIO_GUIDE_CATALOG_V8[key];
  return {
    badge: spec.badge,
    plainInstruction: spec.plainInstruction,
  };
}

export function getBoardModePlainMicroTipV8(boardMode: BoardPlayModeV7): PlainMicroTipV8 {
  const key = resolveBoardModeGuideKeyV8(boardMode);
  const spec = STUDIO_GUIDE_CATALOG_V8[key];
  return {
    badge: spec.badge,
    plainInstruction: spec.plainInstruction,
  };
}

const TILE_TWIST_MICRO_TIPS_V8: Readonly<Record<ClassicTvTileTwistV7, PlainMicroTipV8>> = {
  NONE: {
    badge: 'STANDARD TILE',
    plainInstruction: 'Answer before the studio clock expires to bank this tile’s cash!',
  },
  LOCKED_VAULT: {
    badge: 'LOCKED GOLD VAULT',
    plainInstruction: 'Win an adjacent neighbor tile or hit a 2-streak to crack this $500 Vault!',
  },
  SECRET_SQUARE: {
    badge: '2× SECRET SQUARE',
    plainInstruction: 'Hidden Daily-Double square — answer right for 2.0× Double Cash!',
  },
  OPPONENT_CHOICE: {
    badge: 'OPPONENT’S CHOICE',
    plainInstruction: 'High-reward dare tile — conquer a Rival-picked topic for bonus cash!',
  },
  MYSTERY_CURTAIN: {
    badge: 'MYSTERY CURTAIN',
    plainInstruction: 'Win this clue to pick Velvet Curtain #1, #2, or #3 for a bonus deal!',
  },
  INSTANT_BARGAIN: {
    badge: 'INSTANT BARGAIN',
    plainInstruction: 'Unlocks Grant Bellamy’s mid-show Bargain Desk to trade cash for perks!',
  },
  SHOWCASE_BONUS: {
    badge: 'STUDIO SHOWCASE',
    plainInstruction: 'Special tactile studio contraption — first-time guide pauses the clock!',
  },
  BIG_WHEEL_SPIN: {
    badge: 'BIG WHEEL SPIN',
    plainInstruction: 'Win this tile to spin the 20-wedge Studio Wheel for up to $1,000!',
  },
  BLIND_CATEGORY: {
    badge: 'MYSTERY SUBJECT',
    plainInstruction: 'Cash is boosted while the category stays hidden until you tap!',
  },
  MYSTERY_CASH: {
    badge: 'MYSTERY PAYOUT',
    plainInstruction: 'Known subject, surprise mystery cash envelope revealed on lock-in!',
  },
  BRASS_KEY: {
    badge: 'BRASS SAFE KEY',
    plainInstruction: 'Win this Key tile to unseal high-stakes Safe squares across the board!',
  },
  PRESS_LUCK_SPIN: {
    badge: 'LIGHT-BOARD SPIN',
    plainInstruction: 'Win this tile to earn live cash spins on the chasing Light-Board!',
  },
};

export function getTileTwistPlainMicroTipV8(twist: ClassicTvTileTwistV7): PlainMicroTipV8 {
  return TILE_TWIST_MICRO_TIPS_V8[twist] ?? TILE_TWIST_MICRO_TIPS_V8.NONE;
}

export const STUDIO_CHEAT_SPECS_V8: Readonly<Record<StudioCheatIdV8, StudioCheatSpecV8>> = {
  FIFTY_FIFTY: {
    id: 'FIFTY_FIFTY',
    badge: '50/50 STUDIO CUT',
    buttonLabel: '50/50 CUT',
    plainInstruction: 'Removes 2 wrong answers immediately so you choose between 2!',
  },
  AUDIENCE_POLL: {
    id: 'AUDIENCE_POLL',
    badge: 'STUDIO AUDIENCE POLL',
    buttonLabel: 'ASK AUDIENCE',
    plainInstruction: 'Polls the live Studio 6A crowd and shows % vote bars on every choice!',
  },
  FREE_SWAP: {
    id: 'FREE_SWAP',
    badge: 'FREE QUESTION SWAP',
    buttonLabel: 'FREE SWAP',
    plainInstruction: 'Trades this clue for a fresh backup question on the spot with zero penalty!',
  },
};

// ----------------------------------------------------------------------------
// 4. 5-Speed Question Timer Specifications & Helpers
// ----------------------------------------------------------------------------

export const QUESTION_TIMER_SPECS_V8: Readonly<
  Record<string, QuestionTimerModeSpecV8>
> = {
  OFF: {
    mode: 'OFF',
    shortCode: '∞',
    label: 'NO TIMER',
    fullPillLabel: '∞ NO TIMER',
    seconds: null,
    plainSummary: 'No countdown clock — read and play at your own unhurried pace.',
  },
  '90': {
    mode: 90,
    shortCode: '90s',
    label: 'RELAXED',
    fullPillLabel: '90s RELAXED',
    seconds: 90,
    plainSummary: '90 seconds per clue — extra-generous lounge & group conversation pace.',
  },
  '45': {
    mode: 45,
    shortCode: '45s',
    label: 'EASY',
    fullPillLabel: '45s EASY',
    seconds: 45,
    plainSummary: '45 seconds per clue — comfortable prime-time reading with zero rush.',
  },
  '30': {
    mode: 30,
    shortCode: '30s',
    label: 'TV CLASSIC',
    fullPillLabel: '30s TV CLASSIC',
    seconds: 30,
    plainSummary: '30 seconds per clue — authentic 1966 network game-show broadcast rhythm.',
  },
  '15': {
    mode: 15,
    shortCode: '15s',
    label: 'BLITZ',
    fullPillLabel: '15s BLITZ',
    seconds: 15,
    plainSummary: '15 seconds per clue — rapid-fire Studio 6A lightning reflex challenge!',
  },
};

export function normalizeQuestionTimerModeV8(raw: unknown): QuestionTimerModeV8 {
  if (raw === 'OFF') return 'OFF';
  const num = typeof raw === 'string' ? Number(raw) : raw;
  if (num === 90 || num === 45 || num === 30 || num === 15) {
    return num;
  }
  return 30;
}

export function getQuestionTimerSpecV8(
  mode: QuestionTimerModeV8 | undefined,
): QuestionTimerModeSpecV8 {
  const clean = normalizeQuestionTimerModeV8(mode);
  return QUESTION_TIMER_SPECS_V8[String(clean)] ?? QUESTION_TIMER_SPECS_V8['30'];
}

export function resolveQuestionTimerSecondsV8(
  mode: QuestionTimerModeV8 | undefined,
  opts?: { readonly isBlitzPhase?: boolean },
): number | null {
  const clean = normalizeQuestionTimerModeV8(mode);
  if (clean === 'OFF') return null;
  if (opts?.isBlitzPhase) {
    return Math.min(clean, 20);
  }
  return clean;
}

// ----------------------------------------------------------------------------
// 5. Custom Mid-Century Vector Icons & 26 Bespoke Guide Diagrams (Zero SVG Text!)
// ----------------------------------------------------------------------------

const SVG_PAUSE_TWIN_BARS_V8 = `<svg class="ws8-coach-pause-svg" viewBox="0 0 18 18" width="15" height="15" aria-hidden="true" focusable="false">
  <circle cx="9" cy="9" r="8" fill="#FFE8A3" stroke="#B8760E" stroke-width="1.6"/>
  <rect x="5.6" y="5" width="2.4" height="8" rx="1" fill="#5A3306"/>
  <rect x="10" y="5" width="2.4" height="8" rx="1" fill="#5A3306"/>
</svg>`;

const SVG_PLAY_WEDGE_V8 = `<svg class="ws8-coach-play-svg" viewBox="0 0 18 18" width="16" height="16" aria-hidden="true" focusable="false">
  <polygon points="4,2.6 15.4,9 4,15.4" fill="#FFFDF7" stroke="#FFE2B8" stroke-width="1" stroke-linejoin="round"/>
</svg>`;

const SVG_CLOCK_CREST_V8 = `<svg class="ws8-timer-crest-svg" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
  <circle cx="10" cy="10.5" r="7.5" fill="#FFF6E0" stroke="#B87914" stroke-width="1.8"/>
  <rect x="7.5" y="1" width="5" height="2" rx="1" fill="#B87914"/>
  <line x1="10" y1="10.5" x2="10" y2="6.2" stroke="#6E3B23" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="10" y1="10.5" x2="13.6" y2="12.2" stroke="#FF6B35" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="10" cy="10.5" r="1.4" fill="#6E3B23"/>
</svg>`;

export function renderGuideDiagramSvgV8(guideKey: StudioGuideKeyV8): string {
  const frameBg = `<rect x="4" y="4" width="312" height="84" rx="12" fill="#FAF2DF" stroke="#D9A441" stroke-width="2"/>`;

  switch (guideKey) {
    case 'STYLE_CLASSIC_CUE':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Four backlit choice pads with glowing Studio Cheats above">
        ${frameBg}
        <rect x="56" y="11" width="96" height="15" rx="7.5" fill="#FFF3C4" stroke="#D99B26" stroke-width="1.5"/>
        <circle cx="67" cy="18.5" r="4" fill="#FF6B35"/>
        <rect x="76" y="16" width="66" height="5" rx="2.5" fill="#8C5216"/>
        <rect x="168" y="11" width="96" height="15" rx="7.5" fill="#E3F6F7" stroke="#008B94" stroke-width="1.5"/>
        <circle cx="179" cy="18.5" r="4" fill="#008B94"/>
        <rect x="188" y="16" width="66" height="5" rx="2.5" fill="#0E5A61"/>
        <rect x="28" y="33" width="126" height="22" rx="7" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.6"/>
        <circle cx="42" cy="44" r="6" fill="#008B94"/>
        <rect x="55" y="41" width="84" height="6" rx="3" fill="#5A4632"/>
        <rect x="166" y="33" width="126" height="22" rx="7" fill="#E6F8EE" stroke="#15803D" stroke-width="2.4"/>
        <circle cx="180" cy="44" r="6.5" fill="#15803D"/>
        <polyline points="177,44 179.3,46.6 183.6,41.4" fill="none" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="193" y="41" width="84" height="6" rx="3" fill="#14532D"/>
        <rect x="28" y="60" width="126" height="22" rx="7" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.6"/>
        <circle cx="42" cy="71" r="6" fill="#F2A922"/>
        <rect x="55" y="68" width="76" height="6" rx="3" fill="#5A4632"/>
        <rect x="166" y="60" width="126" height="22" rx="7" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.6"/>
        <circle cx="180" cy="71" r="6" fill="#FF6B35"/>
        <rect x="193" y="68" width="78" height="6" rx="3" fill="#5A4632"/>
      </svg>`;

    case 'STYLE_SPOT_THE_MYTH':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Three true fact pads and one highlighted false myth pad">
        ${frameBg}
        <rect x="22" y="16" width="122" height="26" rx="7" fill="#ECF8F1" stroke="#2F855A" stroke-width="1.6"/>
        <circle cx="37" cy="29" r="6.5" fill="#2F855A"/>
        <polyline points="33.8,29 36.2,31.5 40.4,26.5" fill="none" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round"/>
        <rect x="50" y="26" width="80" height="6" rx="3" fill="#276749"/>
        <rect x="176" y="16" width="122" height="26" rx="7" fill="#ECF8F1" stroke="#2F855A" stroke-width="1.6"/>
        <circle cx="191" cy="29" r="6.5" fill="#2F855A"/>
        <polyline points="187.8,29 190.2,31.5 194.4,26.5" fill="none" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round"/>
        <rect x="204" y="26" width="80" height="6" rx="3" fill="#276749"/>
        <rect x="22" y="50" width="122" height="26" rx="7" fill="#ECF8F1" stroke="#2F855A" stroke-width="1.6"/>
        <circle cx="37" cy="63" r="6.5" fill="#2F855A"/>
        <polyline points="33.8,63 36.2,65.5 40.4,60.5" fill="none" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round"/>
        <rect x="50" y="60" width="80" height="6" rx="3" fill="#276749"/>
        <rect x="176" y="48" width="122" height="30" rx="8" fill="#FFF0EB" stroke="#FF6B35" stroke-width="2.8"/>
        <circle cx="192" cy="63" r="8" fill="#E6397A"/>
        <line x1="188.8" y1="59.8" x2="195.2" y2="66.2" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="195.2" y1="59.8" x2="188.8" y2="66.2" stroke="#FFFDF7" stroke-width="2.2" stroke-linecap="round"/>
        <rect x="206" y="60" width="76" height="6.5" rx="3.2" fill="#B8253E"/>
        <polygon points="160,34 164,42 172,42 166,47 168,55 160,50 152,55 154,47 148,42 156,42" fill="#F2A922" stroke="#B8760E" stroke-width="1.2"/>
      </svg>`;

    case 'STYLE_HEADLINE_BLANK':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Press headline strip with highlighted blank slot filled by winning choice">
        ${frameBg}
        <rect x="24" y="14" width="272" height="34" rx="8" fill="#FFFDF7" stroke="#6E3B23" stroke-width="2"/>
        <rect x="36" y="22" width="68" height="7" rx="3.5" fill="#5A4632"/>
        <rect x="112" y="19" width="78" height="22" rx="6" fill="#FFF2B8" stroke="#FF6B35" stroke-width="2.2" stroke-dasharray="5 3"/>
        <rect x="198" y="22" width="84" height="7" rx="3.5" fill="#5A4632"/>
        <rect x="36" y="34" width="60" height="5" rx="2.5" fill="#9C8468"/>
        <rect x="198" y="34" width="68" height="5" rx="2.5" fill="#9C8468"/>
        <rect x="42" y="58" width="68" height="20" rx="6" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="126" y="56" width="74" height="23" rx="7" fill="#FF6B35" stroke="#9E2F0B" stroke-width="1.8"/>
        <rect x="140" y="64.5" width="46" height="6" rx="3" fill="#FFFDF7"/>
        <path d="M163 54 L154 43" stroke="#FF6B35" stroke-width="2.4" stroke-linecap="round"/>
        <polygon points="151,41 159,42 153,48" fill="#FF6B35"/>
        <rect x="216" y="58" width="68" height="20" rx="6" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
      </svg>`;

    case 'STYLE_PICTURE_MONITOR':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="1966 walnut color TV monitor beside four choice buttons">
        ${frameBg}
        <rect x="24" y="14" width="124" height="64" rx="11" fill="#6E3B23" stroke="#D9A441" stroke-width="2"/>
        <rect x="32" y="20" width="92" height="52" rx="8" fill="#008B94"/>
        <circle cx="98" cy="34" r="9" fill="#FFD166"/>
        <polygon points="36,70 62,42 86,70" fill="#F2A922"/>
        <polygon points="68,70 94,48 120,70" fill="#FF6B35"/>
        <circle cx="136" cy="33" r="4.5" fill="#D9A441"/>
        <circle cx="136" cy="48" r="4.5" fill="#D9A441"/>
        <rect x="166" y="16" width="130" height="14" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="166" y="34" width="130" height="16" rx="6" fill="#E6F8EE" stroke="#15803D" stroke-width="2.2"/>
        <circle cx="178" cy="42" r="4.5" fill="#15803D"/>
        <rect x="188" y="39.5" width="90" height="5" rx="2.5" fill="#14532D"/>
        <rect x="166" y="54" width="130" height="12" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="166" y="69" width="130" height="11" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
      </svg>`;

    case 'STYLE_BINARY_SPLIT':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Two giant Left versus Right 50/50 studio paddles">
        ${frameBg}
        <rect x="24" y="18" width="122" height="56" rx="12" fill="#008B94" stroke="#0B5D63" stroke-width="2.2"/>
        <rect x="44" y="38" width="82" height="8" rx="4" fill="#FFFDF7"/>
        <rect x="56" y="51" width="58" height="5" rx="2.5" fill="#B8F0F4"/>
        <circle cx="160" cy="46" r="13" fill="#FFF3C4" stroke="#D99B26" stroke-width="2.2"/>
        <polygon points="162,36 155,46 160,46 158,56 165,45 160,45" fill="#FF6B35"/>
        <rect x="174" y="18" width="122" height="56" rx="12" fill="#FF6B35" stroke="#B33A10" stroke-width="2.2"/>
        <rect x="194" y="38" width="82" height="8" rx="4" fill="#FFFDF7"/>
        <rect x="206" y="51" width="58" height="5" rx="2.5" fill="#FFE0CF"/>
      </svg>`;

    case 'TOY_02_CONFIDENCE_PNEUMATIC':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Three-step brass confidence wager lever beside answer pads">
        ${frameBg}
        <path d="M44 70 A46 46 0 0 1 136 70" fill="none" stroke="#E5D4B3" stroke-width="12" stroke-linecap="round"/>
        <path d="M44 70 A46 46 0 0 1 74 30" fill="none" stroke="#008B94" stroke-width="10" stroke-linecap="round"/>
        <path d="M76 29 A46 46 0 0 1 108 29" fill="none" stroke="#F2A922" stroke-width="10" stroke-linecap="round"/>
        <path d="M110 30 A46 46 0 0 1 136 70" fill="none" stroke="#FF6B35" stroke-width="10" stroke-linecap="round"/>
        <line x1="90" y1="70" x2="122" y2="34" stroke="#6E3B23" stroke-width="5" stroke-linecap="round"/>
        <circle cx="124" cy="32" r="8" fill="#FF6B35" stroke="#FFFDF7" stroke-width="2"/>
        <circle cx="90" cy="70" r="9" fill="#D9A441" stroke="#6E3B23" stroke-width="2"/>
        <rect x="168" y="20" width="124" height="22" rx="7" fill="#E6F8EE" stroke="#15803D" stroke-width="2.2"/>
        <circle cx="182" cy="31" r="5.5" fill="#15803D"/>
        <rect x="194" y="28" width="82" height="6" rx="3" fill="#14532D"/>
        <rect x="168" y="50" width="124" height="22" rx="7" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.6"/>
        <circle cx="182" cy="61" r="5.5" fill="#008B94"/>
        <rect x="194" y="58" width="76" height="6" rx="3" fill="#5A4632"/>
      </svg>`;

    case 'TOY_03_VERNIER_DIAL':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Brass number estimation dial with wide green winning range">
        ${frameBg}
        <path d="M78 76 A82 62 0 0 1 242 76" fill="none" stroke="#E5D4B3" stroke-width="14" stroke-linecap="round"/>
        <path d="M148 16 A82 62 0 0 1 218 40" fill="none" stroke="#22C55E" stroke-width="14" stroke-linecap="round"/>
        <circle cx="186" cy="24" r="6" fill="#FFD166" stroke="#9A6208" stroke-width="1.8"/>
        <line x1="160" y1="76" x2="178" y2="27" stroke="#FF6B35" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="160" cy="76" r="11" fill="#D9A441" stroke="#6E3B23" stroke-width="2.4"/>
        <circle cx="160" cy="76" r="4" fill="#FFFDF7"/>
      </svg>`;

    case 'TOY_04_BALANCE_SCALE':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Two-pan brass balance scale with two matching weights">
        ${frameBg}
        <polygon points="150,78 170,78 160,44" fill="#6E3B23" stroke="#D9A441" stroke-width="1.8"/>
        <line x1="74" y1="42" x2="246" y2="42" stroke="#D9A441" stroke-width="5" stroke-linecap="round"/>
        <line x1="88" y1="42" x2="88" y2="58" stroke="#8C5828" stroke-width="2"/>
        <path d="M62 58 Q88 68 114 58 Z" fill="#D9A441" stroke="#6E3B23" stroke-width="1.6"/>
        <rect x="70" y="45" width="15" height="13" rx="3" fill="#008B94"/>
        <rect x="89" y="43" width="17" height="15" rx="3" fill="#FF6B35"/>
        <line x1="232" y1="42" x2="232" y2="58" stroke="#8C5828" stroke-width="2"/>
        <path d="M206 58 Q232 68 258 58 Z" fill="#D9A441" stroke="#6E3B23" stroke-width="1.6"/>
        <circle cx="232" cy="49" r="9" fill="#F2A922" stroke="#6E3B23" stroke-width="1.8"/>
      </svg>`;

    case 'TOY_05_RELIEF_GLOBE_3D':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Spinning 3D Earth globe with golden tolerance ring and dropped pin">
        ${frameBg}
        <path d="M126 14 A38 38 0 0 0 126 78" fill="none" stroke="#D9A441" stroke-width="3.5"/>
        <line x1="112" y1="80" x2="152" y2="80" stroke="#6E3B23" stroke-width="4" stroke-linecap="round"/>
        <circle cx="160" cy="46" r="31" fill="#008B94" stroke="#0B5D63" stroke-width="2"/>
        <path d="M142 28 Q156 24 164 35 Q172 46 158 58 Q145 55 142 40 Z" fill="#22C55E" opacity="0.9"/>
        <path d="M172 32 Q184 36 182 52 Q174 62 168 50 Z" fill="#22C55E" opacity="0.85"/>
        <ellipse cx="160" cy="46" rx="31" ry="11" fill="none" stroke="#FFFDF7" stroke-width="1.2" opacity="0.55"/>
        <circle cx="168" cy="39" r="11" fill="rgba(255, 209, 102, 0.35)" stroke="#FFD166" stroke-width="2" stroke-dasharray="3 2"/>
        <path d="M168 39 L163 23 A6 6 0 1 1 173 23 Z" fill="#FF6B35" stroke="#FFFDF7" stroke-width="1.5"/>
      </svg>`;

    case 'TOY_06_FUSE_WIRE_SNIPPER':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Four colored fuse cables with brass cutters snipping the correct cable">
        ${frameBg}
        <rect x="24" y="16" width="18" height="60" rx="4" fill="#6E3B23"/>
        <rect x="278" y="16" width="18" height="60" rx="4" fill="#6E3B23"/>
        <path d="M42 25 C110 20, 210 30, 278 25" fill="none" stroke="#008B94" stroke-width="4.5"/>
        <path d="M42 40 C95 43, 128 40, 150 40" fill="none" stroke="#FF6B35" stroke-width="5" stroke-linecap="round"/>
        <path d="M174 40 C205 40, 240 37, 278 40" fill="none" stroke="#FF6B35" stroke-width="5" stroke-linecap="round"/>
        <path d="M42 55 C110 60, 210 50, 278 55" fill="none" stroke="#F2A922" stroke-width="4.5"/>
        <path d="M42 70 C110 66, 210 74, 278 70" fill="none" stroke="#E6397A" stroke-width="4.5"/>
        <polygon points="162,28 165,36 173,36 167,41 169,49 162,44 155,49 157,41 151,36 159,36" fill="#FFD166" stroke="#D97706" stroke-width="1.2"/>
        <line x1="146" y1="18" x2="168" y2="44" stroke="#8C5828" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="178" y1="18" x2="156" y2="44" stroke="#8C5828" stroke-width="3.5" stroke-linecap="round"/>
      </svg>`;

    case 'TOY_07_MAIL_SORTER':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Center envelope card sorting into Left or Right brass mail chutes">
        ${frameBg}
        <rect x="22" y="34" width="76" height="42" rx="8" fill="#008B94" stroke="#0B5D63" stroke-width="2"/>
        <rect x="34" y="42" width="52" height="7" rx="3.5" fill="#FFFDF7"/>
        <rect x="122" y="16" width="76" height="44" rx="8" fill="#FFFDF7" stroke="#6E3B23" stroke-width="2.2"/>
        <polyline points="126,20 160,40 194,20" fill="none" stroke="#D9A441" stroke-width="2"/>
        <path d="M116 40 Q96 32 82 38" fill="none" stroke="#008B94" stroke-width="2.6" stroke-linecap="round"/>
        <polygon points="79,39 87,33 86,42" fill="#008B94"/>
        <path d="M204 40 Q224 32 238 38" fill="none" stroke="#FF6B35" stroke-width="2.6" stroke-linecap="round"/>
        <polygon points="241,39 233,33 234,42" fill="#FF6B35"/>
        <rect x="222" y="34" width="76" height="42" rx="8" fill="#FF6B35" stroke="#B33A10" stroke-width="2"/>
        <rect x="234" y="42" width="52" height="7" rx="3.5" fill="#FFFDF7"/>
      </svg>`;

    case 'TOY_08_CHRONOLOGY_RAIL':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Four milestone cards ordered left-to-right along a brass timeline">
        ${frameBg}
        <line x1="34" y1="58" x2="286" y2="58" stroke="#D9A441" stroke-width="5" stroke-linecap="round"/>
        <polygon points="292,58 281,52 281,64" fill="#FF6B35"/>
        <rect x="34" y="22" width="50" height="24" rx="6" fill="#008B94"/>
        <circle cx="59" cy="58" r="7" fill="#FFFDF7" stroke="#008B94" stroke-width="3"/>
        <rect x="98" y="22" width="50" height="24" rx="6" fill="#22C55E"/>
        <circle cx="123" cy="58" r="7" fill="#FFFDF7" stroke="#22C55E" stroke-width="3"/>
        <rect x="162" y="22" width="50" height="24" rx="6" fill="#F2A922"/>
        <circle cx="187" cy="58" r="7" fill="#FFFDF7" stroke="#F2A922" stroke-width="3"/>
        <rect x="226" y="22" width="50" height="24" rx="6" fill="#FF6B35"/>
        <circle cx="251" cy="58" r="7" fill="#FFFDF7" stroke="#FF6B35" stroke-width="3"/>
      </svg>`;

    case 'TOY_09_SWITCHBOARD_PATCHBAY':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Three left switchboard plugs patched by cords into matching right sockets">
        ${frameBg}
        <circle cx="58" cy="24" r="8" fill="#008B94" stroke="#FFFDF7" stroke-width="2"/>
        <circle cx="58" cy="46" r="8" fill="#F2A922" stroke="#FFFDF7" stroke-width="2"/>
        <circle cx="58" cy="68" r="8" fill="#FF6B35" stroke="#FFFDF7" stroke-width="2"/>
        <circle cx="262" cy="19" r="7.5" fill="#FFFDF7" stroke="#008B94" stroke-width="3"/>
        <circle cx="262" cy="37" r="7.5" fill="#EFE4CA" stroke="#B8A382" stroke-width="2"/>
        <circle cx="262" cy="55" r="7.5" fill="#FFFDF7" stroke="#FF6B35" stroke-width="3"/>
        <circle cx="262" cy="73" r="7.5" fill="#FFFDF7" stroke="#F2A922" stroke-width="3"/>
        <path d="M66 24 C140 24, 180 19, 254 19" fill="none" stroke="#008B94" stroke-width="4" stroke-linecap="round"/>
        <path d="M66 46 C142 46, 182 73, 254 73" fill="none" stroke="#F2A922" stroke-width="4" stroke-linecap="round"/>
        <path d="M66 68 C142 68, 182 55, 254 55" fill="none" stroke="#FF6B35" stroke-width="4" stroke-linecap="round"/>
      </svg>`;

    case 'TOY_10_CLIFFHANGERS_THROTTLE':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Mountain slope with green safe summit ridge, flag, and brass throttle slider">
        ${frameBg}
        <polygon points="36,74 228,18 228,74" fill="#DFC9A3" stroke="#8C6239" stroke-width="2"/>
        <polygon points="168,35.5 228,18 228,35.5" fill="#22C55E" opacity="0.85"/>
        <line x1="228" y1="18" x2="228" y2="78" stroke="#E6397A" stroke-width="3" stroke-dasharray="4 3"/>
        <circle cx="192" cy="21" r="5.5" fill="#FF6B35"/>
        <line x1="192" y1="26" x2="192" y2="35" stroke="#6E3B23" stroke-width="3"/>
        <line x1="216" y1="10" x2="216" y2="22" stroke="#6E3B23" stroke-width="2"/>
        <polygon points="216,10 227,14 216,18" fill="#FFD166"/>
        <rect x="252" y="20" width="14" height="54" rx="7" fill="#E5D4B3" stroke="#8C6239" stroke-width="1.6"/>
        <rect x="246" y="34" width="26" height="12" rx="5" fill="#FF6B35" stroke="#FFFDF7" stroke-width="1.5"/>
      </svg>`;

    case 'TOY_11_MISSING_VOWELS_WHEEL':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Phrase rack with missing vowel slots and golden vowel wheel">
        ${frameBg}
        <rect x="26" y="18" width="24" height="24" rx="5" fill="#008B94"/>
        <rect x="56" y="18" width="24" height="24" rx="5" fill="#FFF3C4" stroke="#FF6B35" stroke-width="2" stroke-dasharray="4 2"/>
        <rect x="86" y="18" width="24" height="24" rx="5" fill="#008B94"/>
        <rect x="116" y="18" width="24" height="24" rx="5" fill="#008B94"/>
        <rect x="146" y="18" width="24" height="24" rx="5" fill="#FFF3C4" stroke="#FF6B35" stroke-width="2" stroke-dasharray="4 2"/>
        <rect x="176" y="18" width="24" height="24" rx="5" fill="#008B94"/>
        <rect x="42" y="54" width="144" height="22" rx="7" fill="#FF6B35"/>
        <circle cx="64" cy="65" r="5" fill="#FFFDF7"/>
        <circle cx="96" cy="65" r="5" fill="#FFD166"/>
        <circle cx="128" cy="65" r="5" fill="#FFFDF7"/>
        <circle cx="160" cy="65" r="5" fill="#FFD166"/>
        <circle cx="256" cy="46" r="26" fill="#F2A922" stroke="#6E3B23" stroke-width="2.4"/>
        <circle cx="256" cy="46" r="9" fill="#FFFDF7" stroke="#6E3B23" stroke-width="2"/>
      </svg>`;

    case 'TOY_12_CONSPIRACY_LASSO':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Three-by-three grid of nine clue cards with three linked by crimson twine">
        ${frameBg}
        <rect x="78" y="12" width="46" height="20" rx="5" fill="#FFF3C4" stroke="#FF6B35" stroke-width="2.2"/>
        <rect x="137" y="12" width="46" height="20" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="196" y="12" width="46" height="20" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="78" y="36" width="46" height="20" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="137" y="36" width="46" height="20" rx="5" fill="#FFF3C4" stroke="#FF6B35" stroke-width="2.2"/>
        <rect x="196" y="36" width="46" height="20" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="78" y="60" width="46" height="20" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="137" y="60" width="46" height="20" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="196" y="60" width="46" height="20" rx="5" fill="#FFF3C4" stroke="#FF6B35" stroke-width="2.2"/>
        <polyline points="101,22 160,46 219,70" fill="none" stroke="#E6397A" stroke-width="3" stroke-linecap="round"/>
        <circle cx="101" cy="22" r="4.5" fill="#E6397A"/>
        <circle cx="160" cy="46" r="4.5" fill="#E6397A"/>
        <circle cx="219" cy="70" r="4.5" fill="#E6397A"/>
      </svg>`;

    case 'TOY_13_CYANOTYPE_LOUPE':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Eight-panel visual diagram with magnifying loupe highlighting target panel">
        ${frameBg}
        <rect x="44" y="14" width="232" height="64" rx="10" fill="#0072B2" stroke="#6E3B23" stroke-width="2.2"/>
        <rect x="52" y="20" width="50" height="24" rx="4" fill="#1B8AC6"/>
        <rect x="107" y="20" width="50" height="24" rx="4" fill="#1B8AC6"/>
        <rect x="162" y="20" width="50" height="24" rx="4" fill="#FFD166" stroke="#FFFDF7" stroke-width="2.2"/>
        <rect x="217" y="20" width="50" height="24" rx="4" fill="#1B8AC6"/>
        <rect x="52" y="48" width="50" height="24" rx="4" fill="#1B8AC6"/>
        <rect x="107" y="48" width="50" height="24" rx="4" fill="#1B8AC6"/>
        <rect x="162" y="48" width="50" height="24" rx="4" fill="#1B8AC6"/>
        <rect x="217" y="48" width="50" height="24" rx="4" fill="#1B8AC6"/>
        <circle cx="187" cy="32" r="16" fill="rgba(255,253,247,0.22)" stroke="#D9A441" stroke-width="3.5"/>
        <line x1="199" y1="43" x2="215" y2="59" stroke="#6E3B23" stroke-width="5" stroke-linecap="round"/>
      </svg>`;

    case 'TOY_14_FOUR_SHUTTER_REEL':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Four progressive hint shutters with Clue 1 lit at double cash">
        ${frameBg}
        <rect x="30" y="13" width="194" height="17" rx="5" fill="#FFF3C4" stroke="#FF6B35" stroke-width="2.2"/>
        <rect x="42" y="19" width="136" height="5" rx="2.5" fill="#8C3B0C"/>
        <polygon points="256,12 260,19 268,19 262,24 264,31 256,27 248,31 250,24 244,19 252,19" fill="#FF6B35"/>
        <rect x="30" y="34" width="194" height="14" rx="4.5" fill="#EDE0C4" stroke="#B89B67" stroke-width="1.5"/>
        <rect x="30" y="51" width="194" height="14" rx="4.5" fill="#EDE0C4" stroke="#B89B67" stroke-width="1.5"/>
        <rect x="30" y="68" width="194" height="12" rx="4.5" fill="#EDE0C4" stroke="#B89B67" stroke-width="1.5"/>
        <rect x="236" y="38" width="56" height="38" rx="8" fill="#008B94" stroke="#0B5D63" stroke-width="1.8"/>
        <circle cx="264" cy="52" r="6" fill="#FFD166"/>
        <rect x="261.5" y="56" width="5" height="10" rx="2" fill="#FFD166"/>
      </svg>`;

    case 'BOARD_CLASSIC_TOTE':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Classic tote grid featuring unlocked Gold Vault and Secret Square">
        ${frameBg}
        <rect x="54" y="14" width="64" height="19" rx="5" fill="#008B94"/>
        <rect x="128" y="14" width="64" height="19" rx="5" fill="#FFD166" stroke="#B8760E" stroke-width="2.2"/>
        <circle cx="160" cy="23.5" r="5" fill="#6E3B23"/>
        <rect x="202" y="14" width="64" height="19" rx="5" fill="#008B94"/>
        <rect x="54" y="37" width="64" height="19" rx="5" fill="#22C55E"/>
        <rect x="128" y="37" width="64" height="19" rx="5" fill="#FF6B35"/>
        <polygon points="160,40 162.5,45 168,45 163.5,48.5 165,53.5 160,50.5 155,53.5 156.5,48.5 152,45 157.5,45" fill="#FFFDF7"/>
        <rect x="202" y="37" width="64" height="19" rx="5" fill="#008B94"/>
        <rect x="54" y="60" width="64" height="18" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.6"/>
        <rect x="128" y="60" width="64" height="18" rx="5" fill="#22C55E"/>
        <rect x="202" y="60" width="64" height="18" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.6"/>
      </svg>`;

    case 'BOARD_TIC_TAC_LINE':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Three-in-a-row line connected diagonally across the board">
        ${frameBg}
        <rect x="86" y="12" width="44" height="20" rx="5" fill="#008B94" stroke="#FFD166" stroke-width="2.2"/>
        <rect x="138" y="12" width="44" height="20" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="190" y="12" width="44" height="20" rx="5" fill="#FF6B35"/>
        <rect x="86" y="36" width="44" height="20" rx="5" fill="#FF6B35"/>
        <rect x="138" y="36" width="44" height="20" rx="5" fill="#008B94" stroke="#FFD166" stroke-width="2.2"/>
        <rect x="190" y="36" width="44" height="20" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="86" y="60" width="44" height="20" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="138" y="60" width="44" height="20" rx="5" fill="#FFFDF7" stroke="#C9B286" stroke-width="1.5"/>
        <rect x="190" y="60" width="44" height="20" rx="5" fill="#008B94" stroke="#FFD166" stroke-width="2.2"/>
        <line x1="98" y1="18" x2="222" y2="74" stroke="#FFD166" stroke-width="4.5" stroke-linecap="round"/>
      </svg>`;

    case 'BOARD_COAST_HEX_BRIDGE':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Connected light-bridge spanning from left coast to right coast">
        ${frameBg}
        <rect x="20" y="16" width="16" height="60" rx="6" fill="#008B94"/>
        <rect x="284" y="16" width="16" height="60" rx="6" fill="#FF6B35"/>
        <polyline points="28,46 78,34 132,52 188,34 242,50 292,46" fill="none" stroke="#F2A922" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="78" cy="34" r="12" fill="#008B94" stroke="#FFD166" stroke-width="2.4"/>
        <circle cx="132" cy="52" r="12" fill="#008B94" stroke="#FFD166" stroke-width="2.4"/>
        <circle cx="188" cy="34" r="12" fill="#008B94" stroke="#FFD166" stroke-width="2.4"/>
        <circle cx="242" cy="50" r="12" fill="#008B94" stroke="#FFD166" stroke-width="2.4"/>
      </svg>`;

    case 'BOARD_CONCENTRATION_PRIZE':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Two flipped Trilon tiles revealing matching golden luxury prizes">
        ${frameBg}
        <rect x="48" y="24" width="84" height="46" rx="9" fill="#FFF3C4" stroke="#D99B26" stroke-width="2.4"/>
        <polygon points="90,32 95,43 107,43 97,50 101,62 90,55 79,62 83,50 73,43 85,43" fill="#FF6B35"/>
        <rect x="188" y="24" width="84" height="46" rx="9" fill="#FFF3C4" stroke="#D99B26" stroke-width="2.4"/>
        <polygon points="230,32 235,43 247,43 237,50 241,62 230,55 219,62 223,50 213,43 225,43" fill="#FF6B35"/>
        <path d="M132 34 Q160 12 188 34" fill="none" stroke="#15803D" stroke-width="3.2" stroke-dasharray="4 3" stroke-linecap="round"/>
      </svg>`;

    case 'BOARD_EYE_GUESS_MEMORY':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Memory flash board briefly revealing hidden star and cash squares">
        ${frameBg}
        <rect x="52" y="16" width="64" height="26" rx="6" fill="#FFF3C4" stroke="#F2A922" stroke-width="2.2"/>
        <polygon points="84,20 87,27 94,27 88,31 90,38 84,34 78,38 80,31 74,27 81,27" fill="#FF6B35"/>
        <rect x="128" y="16" width="64" height="26" rx="6" fill="#008B94"/>
        <rect x="204" y="16" width="64" height="26" rx="6" fill="#E6F8EE" stroke="#15803D" stroke-width="2.2"/>
        <circle cx="236" cy="29" r="8" fill="#22C55E"/>
        <rect x="52" y="50" width="64" height="26" rx="6" fill="#008B94"/>
        <rect x="128" y="50" width="64" height="26" rx="6" fill="#FFF0EB" stroke="#E6397A" stroke-width="2"/>
        <circle cx="160" cy="63" r="7" fill="#E6397A"/>
        <rect x="204" y="50" width="64" height="26" rx="6" fill="#008B94"/>
      </svg>`;

    case 'BOARD_PRESS_YOUR_LUCK':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Chasing perimeter light-board with glowing jackpot square and Pass Spins button">
        ${frameBg}
        <rect x="44" y="12" width="48" height="20" rx="5" fill="#008B94"/>
        <rect x="98" y="12" width="48" height="20" rx="5" fill="#FFD166" stroke="#FF6B35" stroke-width="2.6"/>
        <rect x="152" y="12" width="48" height="20" rx="5" fill="#22C55E"/>
        <rect x="206" y="12" width="48" height="20" rx="5" fill="#E6397A"/>
        <rect x="44" y="60" width="48" height="20" rx="5" fill="#F2A922"/>
        <rect x="98" y="60" width="48" height="20" rx="5" fill="#008B94"/>
        <rect x="152" y="60" width="48" height="20" rx="5" fill="#FF6B35"/>
        <rect x="206" y="60" width="48" height="20" rx="5" fill="#22C55E"/>
        <rect x="94" y="37" width="110" height="18" rx="9" fill="#6E3B23" stroke="#D9A441" stroke-width="1.8"/>
        <rect x="112" y="43.5" width="74" height="5" rx="2.5" fill="#FFFDF7"/>
      </svg>`;

    case 'BOARD_BIG_WHEEL_SHOW':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Multi-colored 1966 Studio Big Wheel with brass pointer">
        ${frameBg}
        <circle cx="160" cy="48" r="34" fill="#F2A922" stroke="#6E3B23" stroke-width="3"/>
        <path d="M160 48 L160 14 A34 34 0 0 1 190 32 Z" fill="#FF6B35"/>
        <path d="M160 48 L190 32 A34 34 0 0 1 190 64 Z" fill="#008B94"/>
        <path d="M160 48 L190 64 A34 34 0 0 1 160 82 Z" fill="#22C55E"/>
        <path d="M160 48 L160 82 A34 34 0 0 1 130 64 Z" fill="#E6397A"/>
        <path d="M160 48 L130 64 A34 34 0 0 1 130 32 Z" fill="#1746A2"/>
        <circle cx="160" cy="48" r="9" fill="#FFFDF7" stroke="#6E3B23" stroke-width="2.2"/>
        <polygon points="160,18 153,7 167,7" fill="#FFD166" stroke="#6E3B23" stroke-width="1.6"/>
      </svg>`;

    case 'BOARD_CURTAIN_DEAL_SHOW':
      return `<svg class="ws8-coach-diagram-svg" viewBox="0 0 320 92" role="img" aria-label="Three crimson velvet stage curtains with Curtain 2 parting on a golden prize burst">
        ${frameBg}
        <line x1="28" y1="15" x2="292" y2="15" stroke="#D9A441" stroke-width="4" stroke-linecap="round"/>
        <rect x="38" y="17" width="66" height="60" rx="6" fill="#B8253E" stroke="#D9A441" stroke-width="1.8"/>
        <line x1="60" y1="19" x2="60" y2="75" stroke="#8C182C" stroke-width="2"/>
        <line x1="82" y1="19" x2="82" y2="75" stroke="#8C182C" stroke-width="2"/>
        <rect x="127" y="17" width="66" height="60" rx="6" fill="#FFF3C4" stroke="#FF6B35" stroke-width="2.4"/>
        <path d="M127 17 Q145 45 133 77 L127 77 Z" fill="#B8253E"/>
        <path d="M193 17 Q175 45 187 77 L193 77 Z" fill="#B8253E"/>
        <polygon points="160,31 164,42 176,42 166,49 170,60 160,53 150,60 154,49 144,42 156,42" fill="#FF6B35"/>
        <rect x="216" y="17" width="66" height="60" rx="6" fill="#B8253E" stroke="#D9A441" stroke-width="1.8"/>
        <line x1="238" y1="19" x2="238" y2="75" stroke="#8C182C" stroke-width="2"/>
        <line x1="260" y1="19" x2="260" y2="75" stroke="#8C182C" stroke-width="2"/>
      </svg>`;
  }
}

// ----------------------------------------------------------------------------
// 6. Sunlit 1966 Studio Cue-Card & 5-Speed Timer Scoped Stylesheet
// ----------------------------------------------------------------------------

function escapeHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ensureSmartStudioCoachStylesV8(doc?: Document): void {
  const targetDoc = doc ?? (typeof document !== 'undefined' ? document : undefined);
  if (!targetDoc || targetDoc.getElementById(SMART_COACH_STYLE_ID_V8)) return;

  const style = targetDoc.createElement('style');
  style.id = SMART_COACH_STYLE_ID_V8;
  style.textContent = `
    .ws8-coach-backdrop,
    .ws8-coach-backdrop *,
    .ws8-timer-selector,
    .ws8-timer-selector *,
    .ws8-cheats-bar,
    .ws8-cheats-bar * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    /* 1. Sunlit 1966 Studio Cue-Card Modal Backdrop */
    .ws8-coach-backdrop {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 230;
      display: flex;
      align-items: center;
      justify-content: center;
      padding:
        max(10px, env(safe-area-inset-top, 0px))
        max(12px, env(safe-area-inset-right, 0px))
        max(10px, env(safe-area-inset-bottom, 0px))
        max(12px, env(safe-area-inset-left, 0px));
      background:
        radial-gradient(circle at 50% 22%, rgba(255, 232, 178, 0.36) 0%, rgba(110, 59, 35, 0.76) 58%, rgba(58, 29, 14, 0.88) 100%);
      backdrop-filter: blur(5px);
      overflow-y: auto;
      font-family: 'Plus Jakarta Sans', 'Jost', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #141B29;
      animation: ws8CoachFadeIn 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .ws8-coach-backdrop[data-reduced-motion='true'] {
      animation: none;
    }

    @keyframes ws8CoachFadeIn {
      from { opacity: 0; transform: scale(0.985); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Sunlit Warm Cream (#FAF2DF), Sunlit Walnut & Brushed Brass Cue-Card Cabinet */
    .ws8-coach-card {
      position: relative;
      width: min(560px, 100%);
      max-height: calc(100dvh - 20px);
      overflow-y: auto;
      border-radius: 20px;
      background:
        radial-gradient(ellipse 90% 50% at 50% 0%, #FFFDF7 0%, transparent 68%),
        linear-gradient(180deg, #FAF2DF 0%, #F4E7CC 68%, #EDE0C2 100%);
      border: 3px solid #D9A441;
      box-shadow:
        inset 0 2px 0 #FFFDF7,
        0 0 0 5px #6E3B23,
        0 8px 0 #4A2412,
        0 22px 48px rgba(56, 24, 10, 0.5);
      padding: 14px 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Backlit 1966 Acrylite Crown Header */
    .ws8-coach-crown {
      border-radius: 13px;
      padding: 10px 14px 9px;
      color: #FFFDF7;
      border: 2px solid rgba(255, 246, 214, 0.72);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 3px 10px rgba(82, 40, 14, 0.22);
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .ws8-coach-crown[data-theme='PEACOCK'] {
      background: linear-gradient(135deg, #008B94 0%, #1746A2 100%);
    }

    .ws8-coach-crown[data-theme='TANGERINE'] {
      background: linear-gradient(135deg, #FF6B35 0%, #D94814 100%);
    }

    .ws8-coach-crown[data-theme='GOLD'] {
      background: linear-gradient(135deg, #D98A12 0%, #B8650A 100%);
    }

    .ws8-coach-crown[data-theme='CERISE'] {
      background: linear-gradient(135deg, #E6397A 0%, #B8253E 100%);
    }

    .ws8-coach-kicker-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }

    .ws8-coach-kicker {
      font-family: 'Chakra Petch', 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #FFEBB8;
    }

    .ws8-coach-bulbs {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .ws8-coach-bulb {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #FFD166;
      box-shadow: 0 0 6px rgba(255, 209, 102, 0.9);
    }

    .ws8-coach-title {
      margin: 0;
      font-family: 'Fraunces', 'Caprasimo', Georgia, serif;
      font-size: clamp(20px, 4.4vw, 25px);
      font-weight: 900;
      line-height: 1.15;
      color: #FFFDF7;
      text-shadow: 0 2px 4px rgba(34, 16, 6, 0.32);
    }

    /* Warm Harvest-Gold Paused-Clock Reassurance Pill */
    .ws8-coach-paused-pill {
      align-self: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 5px 13px;
      border-radius: 999px;
      background: linear-gradient(180deg, #FFF5CF 0%, #F7DA7E 100%);
      border: 1.5px solid #C88719;
      box-shadow: inset 0 1px 0 #FFFDF7, 0 2px 5px rgba(110, 59, 35, 0.14);
      font-family: 'Chakra Petch', 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: #4A2B09;
      text-align: center;
    }

    /* Mid-Century Vector Diagram Stage Box */
    .ws8-coach-diagram-stage {
      border-radius: 13px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F5EBD4 100%);
      border: 2px solid #DEC48E;
      padding: 6px 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ws8-coach-diagram-svg {
      display: block;
      width: 100%;
      max-width: 340px;
      height: auto;
      max-height: 92px;
    }

    /* 3 Plain-English Instruction Strips */
    .ws8-coach-rows {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .ws8-coach-row {
      border-radius: 11px;
      background: #FFFDF7;
      border: 1.5px solid #E2CCA0;
      border-left: 5px solid #008B94;
      padding: 8px 11px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      box-shadow: 0 2px 5px rgba(110, 59, 35, 0.07);
    }

    .ws8-coach-row[data-step='HOW'] {
      border-left-color: #FF6B35;
    }

    .ws8-coach-row[data-step='TIP'] {
      border-left-color: #D98A12;
      background: linear-gradient(180deg, #FFFDF7 0%, #FFF8E6 100%);
    }

    .ws8-coach-row-label {
      font-family: 'Chakra Petch', 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #00747C;
    }

    .ws8-coach-row[data-step='HOW'] .ws8-coach-row-label {
      color: #C84312;
    }

    .ws8-coach-row[data-step='TIP'] .ws8-coach-row-label {
      color: #9E6208;
    }

    .ws8-coach-row-copy {
      margin: 0;
      font-size: clamp(14.5px, 3.5vw, 16px);
      font-weight: 600;
      line-height: 1.35;
      color: #141B29;
    }

    /* Footer: Non-Nag Skip Checkbox + Glowing Atomic Tangerine CTA */
    .ws8-coach-footer {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 2px;
    }

    .ws8-coach-skip-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 36px;
      padding: 4px 8px;
      border-radius: 8px;
      cursor: pointer;
      align-self: center;
      font-size: 13.5px;
      font-weight: 600;
      color: #4E3620;
      user-select: none;
    }

    .ws8-coach-skip-checkbox {
      width: 18px;
      height: 18px;
      accent-color: #008B94;
      cursor: pointer;
      flex-shrink: 0;
    }

    .ws8-coach-cta-btn {
      width: 100%;
      min-height: 52px;
      border-radius: 13px;
      border: 2px solid #FFE2B8;
      background: linear-gradient(180deg, #FF7B47 0%, #FF6B35 52%, #E04B16 100%);
      color: #FFFDF7;
      font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
      font-size: clamp(16px, 4vw, 18.5px);
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      cursor: pointer;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.45),
        0 4px 0 #9E2F0B,
        0 10px 22px rgba(255, 107, 53, 0.36);
      transition: transform 0.1s ease, filter 0.12s ease;
    }

    .ws8-coach-cta-btn:hover {
      filter: brightness(1.05);
    }

    .ws8-coach-cta-btn:active {
      transform: translateY(2px);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.35),
        0 2px 0 #9E2F0B,
        0 5px 12px rgba(255, 107, 53, 0.28);
    }

    .ws8-coach-cta-btn:focus-visible,
    .ws8-timer-seg-btn:focus-visible {
      outline: 3px solid #008B94;
      outline-offset: 2px;
    }

    /* 2. Reusable 5-Speed Question Timer Selector Widget */
    .ws8-timer-selector {
      width: 100%;
      border-radius: 15px;
      background: linear-gradient(180deg, #FAF2DF 0%, #F1E3C5 100%);
      border: 2px solid #D49B35;
      box-shadow:
        inset 0 1px 0 #FFFDF7,
        0 3px 10px rgba(110, 59, 35, 0.12);
      padding: 10px 11px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-family: 'Plus Jakarta Sans', 'Jost', sans-serif;
      color: #141B29;
    }

    .ws8-timer-selector[data-compact='true'] {
      padding: 8px 9px;
      gap: 6px;
    }

    .ws8-timer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }

    .ws8-timer-title {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: 'Chakra Petch', 'Jost', sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #5C301B;
    }

    .ws8-timer-active-pill {
      padding: 2px 9px;
      border-radius: 999px;
      background: #FFFDF7;
      border: 1.5px solid #D49B35;
      font-family: 'Chakra Petch', 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: #00747C;
    }

    .ws8-timer-track {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 6px;
    }

    .ws8-timer-seg-btn {
      min-height: 50px;
      padding: 5px 4px;
      border-radius: 10px;
      border: 1.8px solid #CDAE74;
      background: linear-gradient(180deg, #FFFDF7 0%, #F5EBD3 100%);
      color: #3E2412;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      box-shadow: inset 0 1px 0 #FFFDF7, 0 2px 0 #B9965B;
      transition: transform 0.1s ease, background 0.12s ease, border-color 0.12s ease;
    }

    .ws8-timer-seg-btn:hover {
      border-color: #008B94;
      background: linear-gradient(180deg, #FFFDF7 0%, #FFF5DC 100%);
    }

    .ws8-timer-seg-btn[aria-checked='true'],
    .ws8-timer-seg-btn[data-active='true'] {
      background: linear-gradient(180deg, #FF7B47 0%, #FF6B35 58%, #DF4B16 100%);
      border-color: #9E2F0B;
      color: #FFFDF7;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.42),
        0 3px 0 #8E2908,
        0 5px 12px rgba(255, 107, 53, 0.3);
    }

    .ws8-timer-seg-code {
      font-family: 'Chakra Petch', 'Jost', sans-serif;
      font-size: 15.5px;
      font-weight: 800;
      line-height: 1.05;
    }

    .ws8-timer-seg-label {
      font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: 0.02em;
      text-align: center;
    }

    .ws8-timer-summary {
      margin: 0;
      font-size: 13.5px;
      font-weight: 600;
      line-height: 1.3;
      color: #4E3620;
      text-align: center;
    }

    @media (max-width: 460px) {
      .ws8-coach-card {
        padding: 11px 12px 12px;
        gap: 8px;
      }
      .ws8-coach-diagram-svg {
        max-height: 76px;
      }
      .ws8-timer-track {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `;
  targetDoc.head.appendChild(style);
}

// ----------------------------------------------------------------------------
// 7. Sunlit 1966 Studio Cue-Card Explainer Modal (`maybeOpenFirstTimeCoachV8`
//    & `openStudioCoachOnDemandV8`)
// ----------------------------------------------------------------------------

let activeCoachDismissFnV8: (() => void) | null = null;

function openStudioCoachModalInternalV8(
  container: HTMLElement,
  spec: StudioGuideSpecV8,
  isFirstTimeAuto: boolean,
  callbacks?: StudioCoachModalCallbacksV8,
): Promise<void> {
  const ownerDoc =
    container?.ownerDocument ?? (typeof document !== 'undefined' ? document : undefined);
  if (!ownerDoc) {
    return Promise.resolve();
  }
  ensureSmartStudioCoachStylesV8(ownerDoc);

  // Cleanly close any prior open cue-card so modals never stack.
  if (activeCoachDismissFnV8) {
    activeCoachDismissFnV8();
    activeCoachDismissFnV8 = null;
  }

  callbacks?.onPauseClock?.();

  return new Promise<void>((resolve) => {
    let settled = false;

    const backdrop = ownerDoc.createElement('div');
    backdrop.className = 'ws8-coach-backdrop';
    backdrop.dataset.guideKey = spec.guideKey;
    backdrop.dataset.coachMode = isFirstTimeAuto ? 'FIRST_TIME' : 'ON_DEMAND';
    if (callbacks?.reducedMotion) {
      backdrop.dataset.reducedMotion = 'true';
    }
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', `${spec.title} Studio Cue Card`);

    const modeTag = isFirstTimeAuto
      ? `${spec.kickerLabel} · FIRST-TIME CUE`
      : `${spec.kickerLabel} · STUDIO GUIDE`;

    const initiallyMuted = isAutoTipsMutedV8();

    backdrop.innerHTML = `
      <div class="ws8-coach-card" data-guide-card="${escapeHtml(spec.guideKey)}">
        <header class="ws8-coach-crown" data-theme="${spec.crownTheme}">
          <div class="ws8-coach-kicker-row">
            <span class="ws8-coach-kicker">${escapeHtml(modeTag)}</span>
            <span class="ws8-coach-bulbs" aria-hidden="true">
              <span class="ws8-coach-bulb"></span>
              <span class="ws8-coach-bulb"></span>
              <span class="ws8-coach-bulb"></span>
            </span>
          </div>
          <h2 class="ws8-coach-title">${escapeHtml(spec.title)}</h2>
        </header>

        <div class="ws8-coach-paused-pill" role="status">
          ${SVG_PAUSE_TWIN_BARS_V8}
          <span>STUDIO CLOCK PAUSED WHILE YOU READ</span>
        </div>

        <div class="ws8-coach-diagram-stage">
          ${renderGuideDiagramSvgV8(spec.guideKey)}
        </div>

        <div class="ws8-coach-rows">
          <div class="ws8-coach-row" data-step="WHAT">
            <span class="ws8-coach-row-label">WHAT'S HAPPENING</span>
            <p class="ws8-coach-row-copy">${escapeHtml(spec.whatsHappening)}</p>
          </div>
          <div class="ws8-coach-row" data-step="HOW">
            <span class="ws8-coach-row-label">HOW TO PLAY</span>
            <p class="ws8-coach-row-copy">${escapeHtml(spec.howToPlay)}</p>
          </div>
          <div class="ws8-coach-row" data-step="TIP">
            <span class="ws8-coach-row-label">GOOD TO KNOW</span>
            <p class="ws8-coach-row-copy">${escapeHtml(spec.goodToKnow)}</p>
          </div>
        </div>

        <footer class="ws8-coach-footer">
          <label class="ws8-coach-skip-label">
            <input type="checkbox"
                   class="ws8-coach-skip-checkbox"
                   data-coach-mute-toggle="true"
                   ${initiallyMuted ? 'checked' : ''} />
            <span>Got the hang of it — skip future first-time cards</span>
          </label>
          <button type="button"
                  class="ws8-coach-cta-btn"
                  data-coach-confirm="true">
            <span>GOT IT — LET'S PLAY!</span>
            ${SVG_PLAY_WEDGE_V8}
          </button>
        </footer>
      </div>
    `;

    const muteCheckbox = backdrop.querySelector<HTMLInputElement>(
      '[data-coach-mute-toggle="true"]',
    );
    const confirmBtn = backdrop.querySelector<HTMLButtonElement>(
      '[data-coach-confirm="true"]',
    );

    const onKeyDown = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape' || ev.key === 'Enter' || ev.key === ' ') {
        if (ownerDoc.activeElement === muteCheckbox && ev.key === ' ') {
          return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        dismiss(true);
      }
    };

    const dismiss = (playTapSfx: boolean): void => {
      if (settled) return;
      settled = true;
      if (activeCoachDismissFnV8 === silentDismiss) {
        activeCoachDismissFnV8 = null;
      }
      ownerDoc.removeEventListener('keydown', onKeyDown, true);
      backdrop.remove();
      if (playTapSfx) {
        callbacks?.onTapSfx?.();
      }
      callbacks?.onResumeClock?.();
      resolve();
    };

    const silentDismiss = (): void => dismiss(false);
    activeCoachDismissFnV8 = silentDismiss;

    muteCheckbox?.addEventListener('change', () => {
      const nextMuted = Boolean(muteCheckbox.checked);
      setAutoTipsMutedV8(nextMuted);
      callbacks?.onMuteAutoTipsChange?.(nextMuted);
      callbacks?.onTapSfx?.();
    });

    confirmBtn?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      dismiss(true);
    });

    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) {
        dismiss(true);
      }
    });

    ownerDoc.addEventListener('keydown', onKeyDown, true);
    container.appendChild(backdrop);

    // Focus primary CTA so keyboard/gamepad players can dismiss in 1 press.
    queueMicrotask(() => {
      if (!settled) {
        confirmBtn?.focus({ preventScroll: true });
      }
    });
  });
}

/**
 * Opens a Sunlit 1966 Cue-Card Explainer ONLY on the very first encounter with
 * `guideKey` (strict 1st-time-ONLY anti-nag law!). Immediately resolves `false`
 * with zero DOM popup and zero interruption on every subsequent encounter or
 * when auto-tips are muted.
 */
export async function maybeOpenFirstTimeCoachV8(
  container: HTMLElement,
  guideKey: string,
  callbacks?: StudioCoachModalCallbacksV8,
): Promise<boolean> {
  if (!container) return false;
  const spec = getStudioGuideSpecV8(guideKey);
  if (!spec) return false;

  if (
    callbacks?.muteGlobalSetting === true ||
    isAutoTipsMutedV8() ||
    hasSeenStudioGuideV8(spec.guideKey)
  ) {
    return false;
  }

  // Mark seen immediately upon opening so concurrent calls can never nag twice.
  markStudioGuideSeenV8(spec.guideKey);
  await openStudioCoachModalInternalV8(container, spec, true, callbacks);
  return true;
}

/**
 * Opens a Sunlit 1966 Studio Cue-Card Explainer on demand (e.g. when a player
 * taps a `? How This Works` button), regardless of seen history or mute toggle.
 */
export async function openStudioCoachOnDemandV8(
  container: HTMLElement,
  guideKey: string,
  callbacks?: StudioCoachModalCallbacksV8,
): Promise<void> {
  if (!container) return;
  const spec = getStudioGuideSpecV8(guideKey) ?? STUDIO_GUIDE_CATALOG_V8.STYLE_CLASSIC_CUE;
  markStudioGuideSeenV8(spec.guideKey);
  await openStudioCoachModalInternalV8(container, spec, false, callbacks);
}

// ----------------------------------------------------------------------------
// 8. Reusable 5-Speed Question Timer Selector (`renderQuestionTimerSelectorV8`
//    & `mountQuestionTimerSelectorV8`)
// ----------------------------------------------------------------------------

function resolveTimerRenderOpts(
  modeOrOpts?: QuestionTimerModeV8 | QuestionTimerSelectorRenderOptionsV8,
  maybeOpts?: QuestionTimerSelectorRenderOptionsV8,
): { mode: QuestionTimerModeV8; opts: QuestionTimerSelectorRenderOptionsV8 } {
  if (
    modeOrOpts !== undefined &&
    typeof modeOrOpts === 'object' &&
    modeOrOpts !== null
  ) {
    const mode = normalizeQuestionTimerModeV8(modeOrOpts.value ?? modeOrOpts.selected ?? 30);
    return { mode, opts: modeOrOpts };
  }
  const mode = normalizeQuestionTimerModeV8(
    modeOrOpts ?? maybeOpts?.value ?? maybeOpts?.selected ?? 30,
  );
  return { mode, opts: maybeOpts ?? {} };
}

/**
 * Renders the sunlit Warm Ivory & Brushed Brass 5-Segment Studio Clock Selector
 * (`∞ NO TIMER` · `90s RELAXED` · `45s EASY` · `30s TV CLASSIC` · `15s BLITZ`)
 * as clean HTML ready to embed into Quick Play Setup, Settings Drawer, or Couch 2P.
 */
export function renderQuestionTimerSelectorV8(
  selectedModeOrOpts?: QuestionTimerModeV8 | QuestionTimerSelectorRenderOptionsV8,
  maybeOpts?: QuestionTimerSelectorRenderOptionsV8,
): string {
  ensureSmartStudioCoachStylesV8();
  const { mode: activeMode, opts } = resolveTimerRenderOpts(selectedModeOrOpts, maybeOpts);
  const activeSpec = getQuestionTimerSpecV8(activeMode);
  const compact = Boolean(opts.compact);
  const showHeader = opts.showHeader ?? true;
  const showSummary = opts.showSummary ?? true;
  const headerLabel = (opts.headerLabel?.trim() || 'STUDIO QUESTION CLOCK').toUpperCase();

  const segmentButtonsHtml = QUESTION_TIMER_MODES_V8.map((candidate) => {
    const spec = getQuestionTimerSpecV8(candidate);
    const isActive = candidate === activeMode;
    const rawVal = String(candidate);
    return `
      <button type="button"
              class="ws8-timer-seg-btn"
              role="radio"
              aria-checked="${isActive ? 'true' : 'false'}"
              aria-label="${escapeHtml(spec.fullPillLabel)} — ${escapeHtml(spec.plainSummary)}"
              data-timer-mode="${escapeHtml(rawVal)}"
              data-active="${isActive ? 'true' : 'false'}">
        <span class="ws8-timer-seg-code">${escapeHtml(spec.shortCode)}</span>
        <span class="ws8-timer-seg-label">${escapeHtml(spec.label)}</span>
      </button>
    `.trim();
  }).join('');

  return `
    <div class="ws8-timer-selector"
         data-compact="${compact ? 'true' : 'false'}"
         data-selected-timer="${escapeHtml(String(activeMode))}"
         role="radiogroup"
         aria-label="${escapeHtml(headerLabel)}">
      ${
        showHeader
          ? `<div class="ws8-timer-header">
              <span class="ws8-timer-title">${SVG_CLOCK_CREST_V8}<span>${escapeHtml(headerLabel)}</span></span>
              <span class="ws8-timer-active-pill" data-timer-active-pill="true">${escapeHtml(activeSpec.fullPillLabel)}</span>
            </div>`
          : ''
      }
      <div class="ws8-timer-track">
        ${segmentButtonsHtml}
      </div>
      ${
        showSummary
          ? `<p class="ws8-timer-summary" data-timer-summary="true">${escapeHtml(activeSpec.plainSummary)}</p>`
          : ''
      }
    </div>
  `.trim();
}

/**
 * Imperatively mounts an interactive 5-Segment Studio Clock Selector into
 * `container` with click + arrow-key radiogroup navigation and live state sync.
 */
export function mountQuestionTimerSelectorV8(
  container: HTMLElement,
  opts: MountQuestionTimerSelectorOptionsV8 = {},
): MountedQuestionTimerSelectorV8 {
  const ownerDoc =
    container?.ownerDocument ?? (typeof document !== 'undefined' ? document : undefined);
  ensureSmartStudioCoachStylesV8(ownerDoc);

  let currentMode = normalizeQuestionTimerModeV8(
    opts.value ?? opts.selected ?? opts.initialMode ?? 30,
  );

  const hostWrap = (ownerDoc ?? document).createElement('div');
  hostWrap.innerHTML = renderQuestionTimerSelectorV8(currentMode, opts);
  const rootEl = (hostWrap.firstElementChild as HTMLElement) ?? hostWrap;

  const syncDom = (): void => {
    const spec = getQuestionTimerSpecV8(currentMode);
    rootEl.dataset.selectedTimer = String(currentMode);

    const activePill = rootEl.querySelector<HTMLElement>('[data-timer-active-pill="true"]');
    if (activePill) {
      activePill.textContent = spec.fullPillLabel;
    }

    const summaryEl = rootEl.querySelector<HTMLElement>('[data-timer-summary="true"]');
    if (summaryEl) {
      summaryEl.textContent = spec.plainSummary;
    }

    const buttons = rootEl.querySelectorAll<HTMLButtonElement>('[data-timer-mode]');
    buttons.forEach((btn) => {
      const btnMode = normalizeQuestionTimerModeV8(btn.dataset.timerMode);
      const active = btnMode === currentMode;
      btn.dataset.active = active ? 'true' : 'false';
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
  };

  const setValue = (nextMode: QuestionTimerModeV8, silent = false): void => {
    const clean = normalizeQuestionTimerModeV8(nextMode);
    const changed = clean !== currentMode;
    currentMode = clean;
    syncDom();
    if (changed && !silent) {
      opts.onTapSfx?.();
      opts.onChange?.(currentMode);
    }
  };

  const onClick = (ev: Event): void => {
    const target = ev.target as HTMLElement | null;
    const btn = target?.closest<HTMLButtonElement>('[data-timer-mode]');
    if (!btn) return;
    const picked = normalizeQuestionTimerModeV8(btn.dataset.timerMode);
    if (picked === currentMode) {
      opts.onTapSfx?.();
      return;
    }
    setValue(picked, false);
  };

  const onKeyDown = (ev: KeyboardEvent): void => {
    if (
      ev.key !== 'ArrowRight' &&
      ev.key !== 'ArrowDown' &&
      ev.key !== 'ArrowLeft' &&
      ev.key !== 'ArrowUp'
    ) {
      return;
    }
    const idx = QUESTION_TIMER_MODES_V8.indexOf(currentMode);
    if (idx < 0) return;
    ev.preventDefault();
    const delta = ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : -1;
    const nextIdx =
      (idx + delta + QUESTION_TIMER_MODES_V8.length) % QUESTION_TIMER_MODES_V8.length;
    const nextMode = QUESTION_TIMER_MODES_V8[nextIdx];
    setValue(nextMode, false);
    const nextBtn = rootEl.querySelector<HTMLButtonElement>(
      `[data-timer-mode="${String(nextMode)}"]`,
    );
    nextBtn?.focus();
  };

  rootEl.addEventListener('click', onClick);
  rootEl.addEventListener('keydown', onKeyDown);
  container.appendChild(rootEl);

  return {
    rootEl,
    getValue: () => currentMode,
    setValue,
    dispose: () => {
      rootEl.removeEventListener('click', onClick);
      rootEl.removeEventListener('keydown', onKeyDown);
      rootEl.remove();
    },
  };
}
