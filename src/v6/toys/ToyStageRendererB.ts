// ============================================================================
// WORLD'S SMARTEST v6.0 — Tactile Interactive Toy Stage Renderer B (Toys 51–100)
// Families VI–X:
//   VI.   WAGER_SCALE_CHRONOLOGY (51–60)
//   VII.  CASINO_BLUFF_STAKES    (61–70)
//   VIII. FORENSIC_DETECTIVE     (71–80)
//   IX.   KINETIC_CONTRAPTIONS   (81–90)
//   X.    MIND_GAME_TWISTS       (91–100)
//
// Strict Engineering Mandates:
//   - 100% Zero-Scroll (100dvh bounded flex, automatic Split-Stage in landscape)
//   - Custom pointer-dragged brass calipers/wheels (zero native HTML sliders)
//   - Crisp physical brass, felt, lacquer, and olive steel (zero glass-blur filters)
//   - Pure procedural SVG icons & sculpted badges (zero OS color emojis)
//   - ZERO commas in 4-digit years (1969, never 1,969)
//   - 100% Resilient payload synthesis across all 1,279,399+ CalibratedClueV6 rows
// ============================================================================

import type {
  CalibratedClueV6,
  FoilTrickCardV6,
  FoleySfxIdV6,
  StageAtmosphereThemeV6,
  ToyDefinitionV6,
  ToyResolutionV6,
} from '../contracts_v6';
import {
  getToySpecB,
  TOY_SPECS_051_TO_100,
  type ToySpecBV6,
} from './ToyCatalog051To100';

// ============================================================================
// PUBLIC INTERFACES (Shared with UnifiedToyManagerV6 & Master Director)
// ============================================================================

export interface ToyMountOptionsV6 {
  readonly clue: CalibratedClueV6;
  readonly toyId?: string;
  readonly toyNumber?: number;
  readonly stageTheme?: StageAtmosphereThemeV6;
  readonly timerBonusSeconds?: number;
  readonly baseChips?: number;
  readonly rivalName?: string;
  readonly onSfx?: (sfx: FoleySfxIdV6) => void;
  readonly onResolve: (result: ToyResolutionV6) => void;
  readonly onHintUsed?: () => void;
}

export interface ToyStageHandleV6 {
  readonly toySpec: ToyDefinitionV6;
  triggerHint(): void;
  applyFoilEffect(effectKind: FoilTrickCardV6['effectKind']): boolean;
  forceTimeout(): void;
  getSecondsRemaining(): number;
  dispose(): void;
}

// ============================================================================
// DETERMINISTIC HELPERS & FORMATTING
// ============================================================================

function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}

function escapeHtml(raw: string): string {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function seededRand(seed: number): () => number {
  let s = (seed ^ 0x9e3779b9) >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Never inserts commas into 4-digit years (e.g., 1969 -> "1969"). */
export function formatStageNumberV6(val: number, unit = '', min = 0, max = 2500): string {
  const safe = Number.isFinite(val) ? Math.round(val) : 0;
  const u = unit.trim();
  const isYear = (u === '' || u.toLowerCase() === 'ce' || u.toLowerCase() === 'ad' || u.toLowerCase() === 'yr')
    && min >= 400 && max <= 2400 && safe >= 400 && safe <= 2400;
  const numStr = isYear ? String(safe) : safe.toLocaleString('en-US');
  if (!u) return numStr;
  if (u === '%' || u === '°' || u === '°C' || u === '°F') return `${numStr}${u}`;
  return `${numStr} ${u}`;
}

interface NormalizedChoice {
  label: string;
  isCorrect: boolean;
  origIndex: number;
}

function getNormalizedChoices(clue: CalibratedClueV6): NormalizedChoice[] {
  const raw = Array.isArray(clue.choices) && clue.choices.length > 0
    ? clue.choices.slice(0, 4)
    : ['Alpha', 'Beta', 'Gamma', 'Delta'];
  while (raw.length < 4) {
    raw.push(`Option ${raw.length + 1}`);
  }
  const safeCorrect = clamp(
    Number.isInteger(clue.correctIndex) ? clue.correctIndex : 0,
    0,
    raw.length - 1,
  );
  return raw.map((label, idx) => ({
    label: String(label ?? '').trim() || `Choice ${idx + 1}`,
    isCorrect: idx === safeCorrect,
    origIndex: idx,
  }));
}

interface DerivedNumericPayload {
  target: number;
  min: number;
  max: number;
  unit: string;
  startGuess: number;
  tolerance: number;
}

function deriveNumericPayload(clue: CalibratedClueV6): DerivedNumericPayload {
  const rng = seededRand(clue.qid * 31 + 7);
  if (typeof clue.numericTarget === 'number' && Number.isFinite(clue.numericTarget)) {
    const target = Math.round(clue.numericTarget);
    const min = typeof clue.numericMin === 'number' ? Math.round(clue.numericMin) : Math.max(0, target - 50);
    const max = typeof clue.numericMax === 'number' ? Math.round(clue.numericMax) : target + 50;
    const span = Math.max(10, max - min);
    const offsetDir = rng() > 0.5 ? 1 : -1;
    const startGuess = clamp(Math.round(target + offsetDir * span * (0.26 + rng() * 0.18)), min, max);
    return {
      target,
      min,
      max,
      unit: clue.numericUnit ?? '',
      startGuess,
      tolerance: Math.max(1, Math.round(span * 0.14)),
    };
  }
  // Extract a number from the correct choice if numeric, otherwise synthesize crisp trivia year/scale
  const choices = getNormalizedChoices(clue);
  const correctLabel = choices.find((c) => c.isCorrect)?.label ?? '1969';
  const numMatch = correctLabel.match(/-?\d[\d,]*/);
  if (numMatch) {
    const parsed = Number(numMatch[0].replace(/,/g, ''));
    if (Number.isFinite(parsed)) {
      const isYear = parsed >= 1000 && parsed <= 2030;
      const min = isYear ? Math.max(1000, parsed - 60) : Math.max(0, Math.round(parsed * 0.4));
      const max = isYear ? Math.min(2030, parsed + 60) : Math.max(parsed + 20, Math.round(parsed * 1.6));
      const span = Math.max(12, max - min);
      const startGuess = clamp(Math.round(parsed + (rng() > 0.5 ? 1 : -1) * span * 0.32), min, max);
      return {
        target: parsed,
        min,
        max,
        unit: isYear ? '' : (clue.numericUnit ?? ''),
        startGuess,
        tolerance: Math.max(2, Math.round(span * 0.15)),
      };
    }
  }
  // Fallback deterministic milestone year or score scale
  const fallbackTarget = 1920 + Math.floor(rng() * 98);
  const min = fallbackTarget - 45;
  const max = Math.min(2026, fallbackTarget + 45);
  return {
    target: fallbackTarget,
    min,
    max,
    unit: '',
    startGuess: clamp(fallbackTarget + (rng() > 0.5 ? 24 : -24), min, max),
    tolerance: 12,
  };
}

interface DerivedChronoItem {
  id: number;
  label: string;
  orderVal: number;
  displayVal: string;
}

function deriveChronologyItems(clue: CalibratedClueV6): DerivedChronoItem[] {
  if (Array.isArray(clue.chronologyItems) && clue.chronologyItems.length >= 4) {
    return clue.chronologyItems.slice(0, 4).map((item, idx) => ({
      id: idx,
      label: item.label,
      orderVal: item.yearOrOrder,
      displayVal: formatStageNumberV6(item.yearOrOrder, clue.numericUnit ?? '', 1000, 2200),
    }));
  }
  // Synthesize crisp 4-step milestone set anchored on the clue's choices or domain
  const choices = getNormalizedChoices(clue);
  const rng = seededRand(clue.qid * 17 + 53);
  const baseYear = 1860 + Math.floor(rng() * 80);
  const spans = [0, 14 + Math.floor(rng() * 14), 38 + Math.floor(rng() * 18), 72 + Math.floor(rng() * 24)];
  return choices.map((c, idx) => {
    const val = baseYear + spans[idx];
    return {
      id: idx,
      label: c.label,
      orderVal: val,
      displayVal: String(val),
    };
  });
}

interface DerivedBinaryPayload {
  optionA: string;
  optionB: string;
  items: Array<{ text: string; bucket: 0 | 1 }>;
}

function deriveBinaryPayload(clue: CalibratedClueV6): DerivedBinaryPayload {
  if (clue.binaryPair && clue.binaryPair.items.length >= 3) {
    return {
      optionA: clue.binaryPair.optionA,
      optionB: clue.binaryPair.optionB,
      items: clue.binaryPair.items.slice(0, 4),
    };
  }
  const choices = getNormalizedChoices(clue);
  const correct = choices.find((c) => c.isCorrect)!;
  const wrongs = choices.filter((c) => !c.isCorrect);
  const rng = seededRand(clue.qid * 41 + 9);
  const items: Array<{ text: string; bucket: 0 | 1 }> = [
    { text: correct.label, bucket: 0 },
    { text: wrongs[0]?.label ?? 'Decoy Alpha', bucket: 1 },
    { text: wrongs[1]?.label ?? 'Decoy Beta', bucket: 1 },
    { text: wrongs[2]?.label ?? 'Decoy Gamma', bucket: 1 },
  ];
  // Shuffle deterministically
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return {
    optionA: 'MATCHES CLUE',
    optionB: 'DECOY / FAKE',
    items,
  };
}

interface DerivedLiePayload {
  tokens: string[];
  lieIndex: number;
  lieToken: string;
  truthCorrection: string;
}

function deriveHostLiePayload(clue: CalibratedClueV6): DerivedLiePayload {
  if (clue.corruptedLieWord && clue.corruptedLieWord.sentenceWithLie && clue.corruptedLieWord.lieToken) {
    const rawTokens = clue.corruptedLieWord.sentenceWithLie.split(/\s+/).filter(Boolean);
    const needle = clue.corruptedLieWord.lieToken.toLowerCase().replace(/[^a-z0-9]/g, '');
    let lieIdx = rawTokens.findIndex(
      (t) => t.toLowerCase().replace(/[^a-z0-9]/g, '') === needle,
    );
    if (lieIdx < 0) lieIdx = Math.max(0, rawTokens.length - 1);
    return {
      tokens: rawTokens,
      lieIndex: lieIdx,
      lieToken: rawTokens[lieIdx],
      truthCorrection: clue.corruptedLieWord.truthCorrection,
    };
  }
  // Synthesize a hilarious, unmistakable 1-word host slip using a decoy choice!
  const choices = getNormalizedChoices(clue);
  const truth = choices.find((c) => c.isCorrect)!.label;
  const decoy = choices.find((c) => !c.isCorrect)!.label;
  const cleanPrompt = clue.prompt.replace(/[?.!]+$/, '').trim();
  const shortLead = cleanPrompt.length > 74 ? `${cleanPrompt.slice(0, 72)}...` : cleanPrompt;
  const sentence = `According to Julian's studio notes on ${clue.categoryLabel}, "${shortLead}" actually points directly to ${decoy}.`;
  const tokens = sentence.split(/\s+/).filter(Boolean);
  // Make the decoy phrase a single clickable token so multi-word answers stay 1-tap clean!
  const prefixTokens = `Julian's cue card insists the answer for ${clue.categoryLabel} is`.split(' ');
  const combined = [...prefixTokens, decoy, 'not', 'the', 'real', 'record.'];
  return {
    tokens: combined,
    lieIndex: prefixTokens.length,
    lieToken: decoy,
    truthCorrection: truth,
  };
}

// ============================================================================
// PROCEDURAL SVG MICRO-ICONS (ZERO OS COLOR EMOJIS!)
// ============================================================================

const SVG_ICONS = {
  bolt: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor"/></svg>`,
  star: `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" fill="currentColor"/></svg>`,
  scissors: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="6" cy="6" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V7a4 4 0 018 0v4" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  cross: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 2l8 4v6c0 5.2-3.4 9.6-8 10-4.6-.4-8-4.8-8-10V6l8-4z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  skull: `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 3a8 8 0 00-8 8c0 2.9 1.6 5.4 4 6.7V20h8v-2.3c2.4-1.3 4-3.8 4-6.7a8 8 0 00-8-8z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9.2" cy="11.5" r="1.4" fill="currentColor"/><circle cx="14.8" cy="11.5" r="1.4" fill="currentColor"/></svg>`,
  uv: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  mirror: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><ellipse cx="12" cy="10" rx="6" ry="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 18v4M9 22h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
};

// ============================================================================
// SCOPED STYLESHEET (ZERO SCROLL · AUTO LANDSCAPE SPLIT-STAGE · ZERO BLUR)
// ============================================================================

const STYLE_ID_V6_TOYB = 'v6-toyb-styles';

function ensureToyBStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID_V6_TOYB)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID_V6_TOYB;
  style.textContent = `
.v6tb-root {
  --v6tb-bg: linear-gradient(160deg, #21140d 0%, #140b07 100%);
  --v6tb-panel: linear-gradient(180deg, #2c1b12 0%, #1d110a 100%);
  --v6tb-border: #c89d47;
  --v6tb-accent: #f2c45a;
  --v6tb-accent2: #2ecc87;
  --v6tb-text: #fcf5e5;
  --v6tb-muted: #c9b592;
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: var(--v6tb-bg);
  color: var(--v6tb-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  border: 2px solid var(--v6tb-border);
  border-radius: 14px;
  box-shadow: inset 0 1px 0 rgba(255, 232, 168, 0.32), 0 14px 36px rgba(0, 0, 0, 0.65);
}
.v6tb-root[data-finish="EMERALD_FELT"] {
  --v6tb-bg: radial-gradient(circle at 50% 20%, #114c36 0%, #092c1f 68%, #061c14 100%);
  --v6tb-panel: linear-gradient(180deg, #164431 0%, #0d2b1e 100%);
  --v6tb-border: #d4a84c;
  --v6tb-accent: #ffd166;
}
.v6tb-root[data-finish="OLIVE_BUNKER"] {
  --v6tb-bg: linear-gradient(165deg, #222a1e 0%, #131811 100%);
  --v6tb-panel: linear-gradient(180deg, #2a3326 0%, #1a2017 100%);
  --v6tb-border: #b89a56;
  --v6tb-accent: #f5a63d;
}
.v6tb-root[data-finish="COPPER_CARNIVAL"] {
  --v6tb-bg: linear-gradient(165deg, #2a1714 0%, #150b12 100%);
  --v6tb-panel: linear-gradient(180deg, #381d18 0%, #221010 100%);
  --v6tb-border: #d98245;
  --v6tb-accent: #ffb057;
}
.v6tb-root[data-finish="BRONZE_ABYSS"] {
  --v6tb-bg: linear-gradient(165deg, #10252b 0%, #071317 100%);
  --v6tb-panel: linear-gradient(180deg, #163139 0%, #0c1d22 100%);
  --v6tb-border: #b88b4a;
  --v6tb-accent: #45e3cf;
}
.v6tb-root[data-finish="AURORA_ALABASTER"] {
  --v6tb-bg: linear-gradient(165deg, #131b2e 0%, #0a0f1c 100%);
  --v6tb-panel: linear-gradient(180deg, #1c2742 0%, #11182a 100%);
  --v6tb-border: #d5b268;
  --v6tb-accent: #68f0cf;
}
.v6tb-root[data-finish="CRIMSON_TWIST"] {
  --v6tb-bg: radial-gradient(circle at 50% 18%, #3c101b 0%, #1f070e 70%, #120408 100%);
  --v6tb-panel: linear-gradient(180deg, #471422 0%, #280a13 100%);
  --v6tb-border: #e5a94c;
  --v6tb-accent: #ff667a;
}
.v6tb-root[data-finish="SOVEREIGN_GOLD"] {
  --v6tb-bg: radial-gradient(circle at 50% 16%, #2b210e 0%, #141008 72%, #0a0804 100%);
  --v6tb-panel: linear-gradient(180deg, #382a12 0%, #1f1709 100%);
  --v6tb-border: #f0c453;
  --v6tb-accent: #ffe074;
}

.v6tb-root *, .v6tb-root *::before, .v6tb-root *::after {
  box-sizing: border-box;
}

/* Header Plaque (strict <=24% in portrait) */
.v6tb-header {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px 6px;
  background: var(--v6tb-panel);
  border-bottom: 2px solid rgba(212, 168, 76, 0.55);
  min-width: 0;
}
.v6tb-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-width: 0;
}
.v6tb-badges {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
}
.v6tb-toy-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 999px;
  background: linear-gradient(180deg, #f3ca67 0%, #b88425 100%);
  color: #181006;
  white-space: nowrap;
  flex-shrink: 0;
}
.v6tb-twist-pill {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.07em;
  padding: 2px 6px;
  border-radius: 999px;
  background: #c92642;
  color: #fff6f7;
  border: 1px solid #ff99a8;
  white-space: nowrap;
  flex-shrink: 0;
}
.v6tb-cat-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--v6tb-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.v6tb-timer-box {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 8px;
  background: #0d0805;
  border: 1.5px solid var(--v6tb-border);
  font-variant-numeric: tabular-nums;
}
.v6tb-timer-val {
  font-size: 14px;
  font-weight: 900;
  color: #ffcf64;
  min-width: 34px;
  text-align: right;
}
.v6tb-timer-box.urgent {
  border-color: #ff4757;
  background: #2b090e;
}
.v6tb-timer-box.urgent .v6tb-timer-val {
  color: #ff6b7a;
}
.v6tb-callout-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--v6tb-accent);
}
.v6tb-howto {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: none;
  color: var(--v6tb-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.v6tb-prompt {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(13.5px, 2.25dvh, 17.5px);
  line-height: 1.24;
  font-weight: 700;
  color: #fffaf0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.v6tb-hint-slip {
  display: none;
  margin-top: 2px;
  padding: 3px 8px;
  border-radius: 6px;
  background: #2e240e;
  border: 1px solid #f2c45a;
  color: #ffe8a3;
  font-size: 11px;
  font-weight: 700;
}
.v6tb-hint-slip.visible {
  display: block;
}
.v6tb-timer-track {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 999px;
  overflow: hidden;
}
.v6tb-timer-fill {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #f0b429 0%, #38e49b 100%);
  transition: width 0.1s linear;
}
.v6tb-timer-fill.urgent {
  background: linear-gradient(90deg, #ff3850 0%, #ff8a3d 100%);
}

/* Interactive Gadget Stage */
.v6tb-stage {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 10px 10px;
  position: relative;
}

/* Automatic Split-Stage in Landscape (844x390 / 660x340) */
.v6tb-root.v6tb-landscape {
  flex-direction: row;
}
.v6tb-root.v6tb-landscape .v6tb-header {
  flex: 0 0 38%;
  max-width: 38%;
  height: 100%;
  border-bottom: none;
  border-right: 2px solid rgba(212, 168, 76, 0.55);
  justify-content: space-between;
  padding: 10px 12px;
}
.v6tb-root.v6tb-landscape .v6tb-prompt {
  -webkit-line-clamp: 5;
  font-size: clamp(13px, 3.3dvh, 16px);
}
.v6tb-root.v6tb-landscape .v6tb-howto {
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.v6tb-root.v6tb-landscape .v6tb-stage {
  flex: 1 1 62%;
  height: 100%;
  padding: 8px 10px;
}

/* Sculpted Brass & Enameled Controls */
.v6tb-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  width: 100%;
}
.v6tb-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  width: 100%;
}
.v6tb-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  width: 100%;
}
.v6tb-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-height: 0;
}
.v6tb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
  width: 100%;
}
.v6tb-visual-bay {
  flex: 1 1 0;
  min-height: 82px;
  width: 100%;
  position: relative;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(10, 8, 6, 0.72) 0%, rgba(18, 14, 10, 0.9) 100%);
  border: 1.5px solid rgba(212, 168, 76, 0.55);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.v6tb-plaque {
  appearance: none;
  border: 2px solid #b98e3d;
  border-radius: 10px;
  background: linear-gradient(180deg, #312116 0%, #1c120b 100%);
  color: #fff7e6;
  padding: 8px 9px;
  font-size: clamp(12px, 1.85dvh, 14.5px);
  font-weight: 800;
  line-height: 1.18;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  position: relative;
  box-shadow: inset 0 1px 0 rgba(255, 232, 166, 0.25), 0 3px 0 #0c0704;
  transition: transform 0.08s ease, border-color 0.12s ease, background 0.12s ease;
}
.v6tb-plaque:active {
  transform: translateY(2px);
}
.v6tb-plaque.selected {
  border-color: #ffe074;
  background: linear-gradient(180deg, #563b14 0%, #2d1d08 100%);
  box-shadow: 0 0 0 2px rgba(255, 215, 94, 0.35), inset 0 1px 0 rgba(255, 240, 185, 0.45);
}
.v6tb-plaque.secondary-sel {
  border-color: #54c6f2;
  background: linear-gradient(180deg, #163b4e 0%, #0d2330 100%);
}
.v6tb-plaque.correct {
  border-color: #36e896;
  background: linear-gradient(180deg, #13593a 0%, #0a3321 100%);
  color: #e9fff4;
}
.v6tb-plaque.wrong {
  border-color: #ff4757;
  background: linear-gradient(180deg, #5a131c 0%, #30080d 100%);
  color: #ffdce0;
}
.v6tb-plaque.eliminated {
  opacity: 0.36;
  text-decoration: line-through;
  border-style: dashed;
  pointer-events: none;
}
.v6tb-plaque-key {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(180deg, #e9be5b 0%, #a5721d 100%);
  color: #191005;
  font-size: 11px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.v6tb-plaque-txt {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.v6tb-lever-btn {
  appearance: none;
  border: 2px solid #ffe082;
  border-radius: 10px;
  background: linear-gradient(180deg, #f3c453 0%, #bf831b 100%);
  color: #180f04;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 9px 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: inset 0 1px 0 rgba(255, 250, 224, 0.7), 0 3px 0 #5b3a07;
  transition: transform 0.08s ease;
}
.v6tb-lever-btn:active {
  transform: translateY(2px);
}
.v6tb-lever-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.v6tb-lever-btn.emerald {
  border-color: #79f7ba;
  background: linear-gradient(180deg, #2ed684 0%, #16854d 100%);
  color: #051c10;
  box-shadow: inset 0 1px 0 rgba(208, 255, 232, 0.6), 0 3px 0 #094024;
}
.v6tb-lever-btn.crimson {
  border-color: #ff99a4;
  background: linear-gradient(180deg, #e83b52 0%, #961627 100%);
  color: #fff6f7;
  box-shadow: inset 0 1px 0 rgba(255, 200, 208, 0.5), 0 3px 0 #4d0912;
}
.v6tb-knob-btn {
  appearance: none;
  border: 1.5px solid #c89d47;
  border-radius: 8px;
  background: linear-gradient(180deg, #3c2918 0%, #20140a 100%);
  color: #ffe39b;
  font-size: 12px;
  font-weight: 900;
  padding: 6px 9px;
  cursor: pointer;
  min-width: 36px;
  box-shadow: 0 2px 0 #0b0603;
}
.v6tb-knob-btn:active {
  transform: translateY(1px);
}
.v6tb-nixie {
  font-family: "Courier New", Courier, monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 900;
  font-size: clamp(18px, 3dvh, 26px);
  color: #ff9a3c;
  background: #120905;
  border: 2px solid #b58432;
  border-radius: 8px;
  padding: 4px 12px;
  text-shadow: 0 0 10px rgba(255, 136, 36, 0.72);
  letter-spacing: 0.06em;
}

/* Custom Brass Caliper Track (Pure Pointer-Drag Brass Mechanism) */
.v6tb-caliper-track {
  position: relative;
  width: 100%;
  height: 36px;
  border-radius: 999px;
  background: linear-gradient(180deg, #0d0805 0%, #22160c 100%);
  border: 2px solid #c89d47;
  cursor: pointer;
  touch-action: none;
  display: flex;
  align-items: center;
  padding: 0 16px;
}
.v6tb-caliper-fill {
  position: absolute;
  left: 2px;
  top: 2px;
  bottom: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, #27b376 0%, #f2c14e 65%, #e64558 100%);
  pointer-events: none;
}
.v6tb-caliper-thumb {
  position: absolute;
  top: 50%;
  width: 28px;
  height: 28px;
  margin-left: -14px;
  transform: translateY(-50%);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff3c2 0%, #d49a2a 60%, #7d530e 100%);
  border: 2px solid #fff0b8;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.65);
  pointer-events: none;
}

/* Word Tiles for Spot the Host's Lie */
.v6tb-word-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  justify-content: center;
  padding: 8px;
  width: 100%;
}
.v6tb-word-chip {
  appearance: none;
  border: 1.5px solid #b98e3d;
  border-radius: 7px;
  background: linear-gradient(180deg, #342117 0%, #1d110b 100%);
  color: #fff6e0;
  font-size: clamp(12.5px, 2dvh, 15px);
  font-weight: 800;
  padding: 5px 9px;
  cursor: pointer;
  transition: transform 0.08s ease, border-color 0.1s ease;
}
.v6tb-word-chip:hover {
  border-color: #ffe074;
  transform: translateY(-1px);
}
.v6tb-word-chip.correct {
  background: #145e3d;
  border-color: #42f5a4;
  color: #ffffff;
}
.v6tb-word-chip.wrong {
  background: #61121d;
  border-color: #ff4d63;
}

/* Reveal Ribbon */
.v6tb-reveal-banner {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 2px solid #ffe074;
  background: linear-gradient(180deg, #1b120b 0%, #0f0905 100%);
  color: #fff6df;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  z-index: 20;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.75);
}
.v6tb-reveal-banner.win {
  border-color: #36e896;
  background: linear-gradient(180deg, #0f3f29 0%, #082317 100%);
}
.v6tb-reveal-banner.loss {
  border-color: #ff4d63;
  background: linear-gradient(180deg, #47111a 0%, #24070c 100%);
}
.v6tb-reveal-title {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.v6tb-reveal-sub {
  font-size: 11.5px;
  color: #e9d9b7;
  margin-top: 1px;
}
`;
  document.head.appendChild(style);
}

// ============================================================================
// CUSTOM POINTER-DRAG BRASS CALIPER WIDGET (PURE BRASS MECHANISM)
// ============================================================================

function bindBrassCaliperTrack(
  trackEl: HTMLElement,
  fillEl: HTMLElement,
  thumbEl: HTMLElement,
  initialRatio: number,
  onChange: (ratio: number) => void,
  onDetent?: () => void,
  addCleanup?: (fn: () => void) => void,
): { setRatio: (r: number) => void } {
  let current = clamp(initialRatio, 0, 1);
  let dragging = false;
  let lastBucket = Math.round(current * 20);

  const render = (r: number) => {
    current = clamp(r, 0, 1);
    const pct = `${(current * 100).toFixed(2)}%`;
    fillEl.style.width = pct;
    thumbEl.style.left = pct;
  };
  render(current);

  const updateFromClientX = (clientX: number) => {
    const rect = trackEl.getBoundingClientRect();
    if (rect.width <= 1) return;
    const r = clamp((clientX - rect.left) / rect.width, 0, 1);
    render(r);
    onChange(r);
    const bucket = Math.round(r * 20);
    if (bucket !== lastBucket) {
      lastBucket = bucket;
      onDetent?.();
    }
  };

  const onDown = (e: PointerEvent) => {
    dragging = true;
    try { trackEl.setPointerCapture(e.pointerId); } catch { /* noop */ }
    updateFromClientX(e.clientX);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  };
  const onUp = () => { dragging = false; };

  trackEl.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  addCleanup?.(() => {
    trackEl.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  });

  return { setRatio: render };
}

// ============================================================================
// RUNTIME CONTEXT PASSED INTO EACH TOY MECHANIC BUILDER
// ============================================================================

interface ToyBuildContext {
  readonly spec: ToySpecBV6;
  readonly clue: CalibratedClueV6;
  readonly stageEl: HTMLElement;
  readonly promptEl: HTMLElement;
  readonly rivalName: string;
  readonly baseChips: number;
  readonly sfx: (id: FoleySfxIdV6) => void;
  readonly addCleanup: (fn: () => void) => void;
  readonly getTimeLeft: () => number;
  readonly adjustTime: (deltaSec: number) => void;
  readonly setResolved: (
    correct: boolean,
    accuracyRatio: number,
    specificActionTag: string,
    revealTitle: string,
    revealSub: string,
    multExtra?: number,
    chipsOverride?: number,
  ) => void;
  readonly isResolved: () => boolean;
  readonly registerHintHandler: (fn: () => void) => void;
  readonly registerFoilHandler: (fn: (kind: FoilTrickCardV6['effectKind']) => boolean) => void;
  readonly registerTimeoutHandler: (fn: () => void) => void;
}

// ============================================================================
// FAMILY VI BUILDERS (Toys 51–60: WAGER_SCALE_CHRONOLOGY)
// ============================================================================

function buildCliffhangerDial(ctx: ToyBuildContext): void {
  const num = deriveNumericPayload(ctx.clue);
  let guess = num.startGuess;
  let hiking = false;
  const maxSteps = 25;

  ctx.stageEl.innerHTML = `
    <div class="v6tb-visual-bay" style="flex-direction:column;padding:6px;">
      <svg viewBox="0 0 360 118" width="100%" height="100%" style="max-height:145px;">
        <defs>
          <linearGradient id="v6chSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#192a40"/><stop offset="100%" stop-color="#0b121c"/>
          </linearGradient>
          <linearGradient id="v6chMtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7c6343"/><stop offset="100%" stop-color="#302114"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="360" height="118" fill="url(#v6chSky)" rx="6"/>
        <polygon points="10,112 292,22 292,112" fill="url(#v6chMtn)" stroke="#d9aa4d" stroke-width="2"/>
        <line x1="292" y1="22" x2="352" y2="22" stroke="#ff4757" stroke-width="1.5" stroke-dasharray="4 3"/>
        <text x="322" y="16" fill="#ff7583" font-size="9" font-weight="900" text-anchor="middle">DROP 25</text>
        <text x="292" y="108" fill="#ffe18c" font-size="9" font-weight="800" text-anchor="end">SAFE EDGE</text>
        <g id="v6chTicks"></g>
        <g id="v6chClimber" transform="translate(18, 102)">
          <circle cx="0" cy="-14" r="5" fill="#ffe3a3" stroke="#181006" stroke-width="1.5"/>
          <path d="M-5,-8 L5,-8 L7,2 L-7,2 Z" fill="#e63946" stroke="#fff3c4" stroke-width="1"/>
          <line x1="6" y1="-10" x2="11" y2="3" stroke="#f0c453" stroke-width="2"/>
        </g>
        <text id="v6chStatus" x="14" y="20" fill="#ffe5a3" font-size="11" font-weight="800">STEP 0 / 25 — SET YOUR ESTIMATE</text>
      </svg>
    </div>
    <div class="v6tb-row" style="justify-content:center;gap:8px;">
      <button type="button" class="v6tb-knob-btn" data-step="-10">-10</button>
      <button type="button" class="v6tb-knob-btn" data-step="-1">-1</button>
      <div class="v6tb-nixie" id="v6chReadout">${escapeHtml(formatStageNumberV6(guess, num.unit, num.min, num.max))}</div>
      <button type="button" class="v6tb-knob-btn" data-step="1">+1</button>
      <button type="button" class="v6tb-knob-btn" data-step="10">+10</button>
    </div>
    <div class="v6tb-caliper-track" id="v6chTrack">
      <div class="v6tb-caliper-fill" id="v6chFill"></div>
      <div class="v6tb-caliper-thumb" id="v6chThumb"></div>
    </div>
    <button type="button" class="v6tb-lever-btn" id="v6chLock">LOCK ESTIMATE &amp; START YODEL HIKE</button>
  `;

  const readoutEl = ctx.stageEl.querySelector<HTMLElement>('#v6chReadout')!;
  const climberEl = ctx.stageEl.querySelector<SVGGElement>('#v6chClimber')!;
  const statusEl = ctx.stageEl.querySelector<SVGTextElement>('#v6chStatus')!;
  const lockBtn = ctx.stageEl.querySelector<HTMLButtonElement>('#v6chLock')!;

  const span = Math.max(1, num.max - num.min);
  const updateGuess = (val: number) => {
    guess = clamp(Math.round(val), num.min, num.max);
    readoutEl.textContent = formatStageNumberV6(guess, num.unit, num.min, num.max);
  };

  const caliper = bindBrassCaliperTrack(
    ctx.stageEl.querySelector('#v6chTrack')!,
    ctx.stageEl.querySelector('#v6chFill')!,
    ctx.stageEl.querySelector('#v6chThumb')!,
    (guess - num.min) / span,
    (ratio) => {
      if (hiking || ctx.isResolved()) return;
      updateGuess(num.min + ratio * span);
    },
    () => ctx.sfx('rotary_knob_click'),
    ctx.addCleanup,
  );

  ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (hiking || ctx.isResolved()) return;
      const d = Number(btn.dataset.step);
      const scaleStep = span > 250 ? d * Math.max(1, Math.round(span / 100)) : d;
      updateGuess(guess + scaleStep);
      caliper.setRatio((guess - num.min) / span);
      ctx.sfx('rotary_knob_click');
    });
  });

  const runHike = () => {
    if (hiking || ctx.isResolved()) return;
    hiking = true;
    lockBtn.disabled = true;
    ctx.sfx('brass_gear_detent');

    const rawErr = Math.abs(guess - num.target);
    const scaledSteps = Math.min(28, Math.round((rawErr / Math.max(1, num.tolerance * 2.1)) * maxSteps));
    let step = 0;

    const timer = window.setInterval(() => {
      step += 1;
      const clampedStep = Math.min(step, maxSteps);
      const t = clampedStep / maxSteps;
      const x = 18 + t * 274;
      const y = 102 - t * 80;

      if (step > maxSteps) {
        climberEl.setAttribute('transform', `translate(314, ${38 + (step - maxSteps) * 26}) rotate(45)`);
        statusEl.textContent = `OVER THE CLIFF! TARGET: ${formatStageNumberV6(num.target, num.unit, num.min, num.max)}`;
        ctx.sfx('trapdoor_hinge_drop');
      } else {
        climberEl.setAttribute('transform', `translate(${x.toFixed(1)}, ${y.toFixed(1)})`);
        statusEl.textContent = `YODEL STEP ${step} / ${maxSteps}`;
        ctx.sfx('clock_horology_tick');
      }

      if (step >= Math.max(1, scaledSteps)) {
        window.clearInterval(timer);
        const survived = scaledSteps < maxSteps;
        const acc = survived ? clamp(1 - scaledSteps / maxSteps, 0.25, 1) : 0;
        ctx.setResolved(
          survived,
          acc,
          survived ? 'cliffhanger_survived' : 'cliffhanger_fell',
          survived ? `SAFE AT STEP ${scaledSteps}!` : 'OVER THE CLIFF!',
          `Exact Answer: ${formatStageNumberV6(num.target, num.unit, num.min, num.max)} (Off by ${rawErr})`,
          survived && acc >= 0.85 ? 0.6 : 0,
        );
      }
    }, 65);
    ctx.addCleanup(() => window.clearInterval(timer));
  };

  lockBtn.addEventListener('click', runHike);
  ctx.registerHintHandler(() => {
    const lo = clamp(num.target - Math.round(span * 0.16), num.min, num.max);
    const hi = clamp(num.target + Math.round(span * 0.16), num.min, num.max);
    statusEl.textContent = `BAND HINT: ${formatStageNumberV6(lo, num.unit, num.min, num.max)} TO ${formatStageNumberV6(hi, num.unit, num.min, num.max)}`;
  });
  ctx.registerTimeoutHandler(runHike);
}

function buildHigherLowerCards(ctx: ToyBuildContext): void {
  const num = deriveNumericPayload(ctx.clue);
  const rng = seededRand(ctx.clue.qid * 13 + 3);
  const span = Math.max(12, num.max - num.min);
  // Build 3 rounds: final round compares against the true numeric target!
  const rounds = [
    {
      anchor: clamp(Math.round(num.target + (rng() > 0.5 ? 1 : -1) * Math.max(4, span * 0.22)), num.min, num.max),
      secret: num.target,
      label: 'TARGET ANSWER',
    },
    {
      anchor: clamp(Math.round(num.min + span * 0.5), num.min, num.max),
      secret: clamp(Math.round(num.target + (num.target > num.min + span * 0.5 ? 6 : -6)), num.min, num.max),
      label: 'BONUS CARD',
    },
  ];
  let idx = 0;
  let hits = 0;

  const renderCard = () => {
    const r = rounds[idx];
    const anchorStr = formatStageNumberV6(r.anchor, num.unit, num.min, num.max);
    ctx.stageEl.innerHTML = `
      <div class="v6tb-row" style="justify-content:center;gap:10px;flex:1 1 0;min-height:0;">
        <div style="flex:1;height:100%;max-height:165px;border:2px solid #f0c45c;border-radius:12px;background:linear-gradient(160deg,#2a2010,#130d05);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;">
          <div style="font-size:10px;letter-spacing:0.1em;color:#d6b87a;font-weight:800;">ANCHOR CARD (${idx + 1}/${rounds.length})</div>
          <div class="v6tb-nixie" style="margin-top:8px;">${escapeHtml(anchorStr)}</div>
        </div>
        <div style="font-weight:900;color:#ffe074;font-size:13px;">VS</div>
        <div id="v6hlSecret" style="flex:1;height:100%;max-height:165px;border:2px dashed #5ce0a8;border-radius:12px;background:linear-gradient(160deg,#0e3325,#071b13);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;">
          <div style="font-size:10px;letter-spacing:0.1em;color:#8ff2c7;font-weight:800;">${escapeHtml(r.label)}</div>
          <div style="font-size:26px;font-weight:900;color:#ffe074;margin-top:8px;">? ? ?</div>
        </div>
      </div>
      <div class="v6tb-grid-2">
        <button type="button" class="v6tb-lever-btn emerald" data-dir="HIGH">HIGHER ▲</button>
        <button type="button" class="v6tb-lever-btn crimson" data-dir="LOW">LOWER ▼</button>
      </div>
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-dir]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const pickHigh = btn.dataset.dir === 'HIGH';
        const isActuallyHigh = r.secret >= r.anchor;
        const ok = pickHigh === isActuallyHigh;
        ctx.sfx(ok ? 'paddle_spring_slam' : 'trapdoor_hinge_drop');
        const secretBox = ctx.stageEl.querySelector<HTMLElement>('#v6hlSecret')!;
        secretBox.innerHTML = `<div style="font-size:10px;color:#fff;font-weight:800;">REVEALED</div><div class="v6tb-nixie" style="margin-top:6px;">${escapeHtml(formatStageNumberV6(r.secret, num.unit, num.min, num.max))}</div>`;
        if (ok) hits += 1;
        if (idx + 1 < rounds.length && ok) {
          idx += 1;
          const t = window.setTimeout(renderCard, 480);
          ctx.addCleanup(() => window.clearTimeout(t));
        } else {
          ctx.setResolved(
            hits >= 1,
            hits / rounds.length,
            ok ? 'higher_lower_sweep' : 'higher_lower_miss',
            hits === rounds.length ? 'PERFECT HIGHER/LOWER!' : hits > 0 ? 'ANCHOR CLEARED!' : 'WRONG CALL!',
            `Actual Value: ${formatStageNumberV6(num.target, num.unit, num.min, num.max)}`,
            hits === rounds.length ? 0.5 : 0,
          );
        }
      });
    });
  };

  renderCard();
  ctx.registerTimeoutHandler(() => {
    ctx.setResolved(false, 0, 'higher_lower_timeout', 'TIME EXPIRED!', `Answer: ${formatStageNumberV6(num.target, num.unit, num.min, num.max)}`);
  });
}

function buildChronologyOrTower(ctx: ToyBuildContext, isTower: boolean): void {
  const items = deriveChronologyItems(ctx.clue);
  const rng = seededRand(ctx.clue.qid * 23 + 11);
  const order = [...items];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  // Ensure not trivially sorted
  const sortedIds = [...items].sort((a, b) => a.orderVal - b.orderVal).map((x) => x.id);
  if (order.every((x, i) => x.id === sortedIds[i])) {
    [order[0], order[1]] = [order[1], order[0]];
  }

  let selectedIdx: number | null = null;

  const render = () => {
    const rowsHtml = order.map((item, idx) => {
      const widthPct = isTower ? 68 + idx * 10 : 100;
      return `
        <div class="v6tb-row" style="justify-content:center;">
          <button type="button" class="v6tb-plaque ${selectedIdx === idx ? 'selected' : ''}" data-idx="${idx}" style="width:${widthPct}%;padding:6px 9px;">
            <span class="v6tb-plaque-key">${idx + 1}</span>
            <span class="v6tb-plaque-txt">${escapeHtml(item.label)}</span>
          </button>
          <button type="button" class="v6tb-knob-btn" data-move="${idx}:-1" ${idx === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="v6tb-knob-btn" data-move="${idx}:1" ${idx === order.length - 1 ? 'disabled' : ''}>▼</button>
        </div>
      `;
    }).join('');

    ctx.stageEl.innerHTML = `
      <div style="font-size:10.5px;color:#d6be93;font-weight:800;text-align:center;letter-spacing:0.06em;">
        ${isTower ? 'TAP TWO BLOCKS TO SWAP · SMALLEST TOP -> LARGEST BASE' : 'TAP TWO PLAQUES TO SWAP · #1 EARLIEST -> #4 LATEST'}
      </div>
      <div class="v6tb-stack" style="flex:1 1 0;justify-content:center;">${rowsHtml}</div>
      <button type="button" class="v6tb-lever-btn" id="v6ordLock">${isTower ? 'LOCK TOWER ORDER' : 'LOCK CHRONOLOGY'}</button>
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const idx = Number(btn.dataset.idx);
        if (selectedIdx === null) {
          selectedIdx = idx;
          ctx.sfx('ui_brass_tap');
        } else if (selectedIdx === idx) {
          selectedIdx = null;
        } else {
          [order[selectedIdx], order[idx]] = [order[idx], order[selectedIdx]];
          selectedIdx = null;
          ctx.sfx('brass_gear_detent');
        }
        render();
      });
    });

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-move]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const [iStr, dStr] = (btn.dataset.move ?? '0:0').split(':');
        const i = Number(iStr);
        const target = i + Number(dStr);
        if (target >= 0 && target < order.length) {
          [order[i], order[target]] = [order[target], order[i]];
          selectedIdx = null;
          ctx.sfx('brass_gear_detent');
          render();
        }
      });
    });

    ctx.stageEl.querySelector('#v6ordLock')?.addEventListener('click', submitOrder);
  };

  const submitOrder = () => {
    if (ctx.isResolved()) return;
    let exactMatches = 0;
    for (let i = 0; i < order.length; i++) {
      if (order[i].id === sortedIds[i]) exactMatches += 1;
    }
    const won = exactMatches >= 3;
    ctx.setResolved(
      won,
      exactMatches / order.length,
      isTower ? 'tower_stacked' : 'chronology_snapped',
      exactMatches === 4 ? 'PERFECT ORDER!' : won ? `${exactMatches}/4 ALIGNED!` : `${exactMatches}/4 — OUT OF ORDER`,
      sortedIds.map((id) => {
        const it = items.find((x) => x.id === id)!;
        return `${it.label} (${it.displayVal})`;
      }).join(' → '),
      exactMatches === 4 ? 0.6 : 0,
    );
  };

  render();
  ctx.registerHintHandler(() => {
    // Auto-place slot #1 correctly as a helpful tactile hint!
    const correctFirstIdx = order.findIndex((x) => x.id === sortedIds[0]);
    if (correctFirstIdx > 0) {
      [order[0], order[correctFirstIdx]] = [order[correctFirstIdx], order[0]];
      ctx.sfx('brass_gear_detent');
      render();
    }
  });
  ctx.registerTimeoutHandler(submitOrder);
}

function buildApothecaryBalance(ctx: ToyBuildContext): void {
  const choices = getNormalizedChoices(ctx.clue);
  let placedIdx: number | null = null;
  const eliminated = new Set<number>();

  const render = () => {
    let tiltDeg = -14;
    if (placedIdx !== null) {
      tiltDeg = choices[placedIdx].isCorrect ? 0 : (placedIdx % 2 === 0 ? 11 : -8);
    }
    ctx.stageEl.innerHTML = `
      <div class="v6tb-visual-bay" style="padding:4px;">
        <svg viewBox="0 0 340 105" width="100%" height="100%" style="max-height:130px;">
          <line x1="170" y1="22" x2="170" y2="96" stroke="#d8a846" stroke-width="6" stroke-linecap="round"/>
          <rect x="132" y="92" width="76" height="8" rx="4" fill="#a87622"/>
          <g transform="rotate(${tiltDeg} 170 28)" style="transition: transform 0.25s ease;">
            <line x1="65" y1="28" x2="275" y2="28" stroke="#f2c85b" stroke-width="4.5" stroke-linecap="round"/>
            <line x1="65" y1="28" x2="50" y2="66" stroke="#c89a40" stroke-width="1.5"/>
            <line x1="65" y1="28" x2="80" y2="66" stroke="#c89a40" stroke-width="1.5"/>
            <path d="M38 66 Q65 82 92 66 Z" fill="#b88425" stroke="#ffe599" stroke-width="1.5"/>
            <text x="65" y="60" fill="#fff3cf" font-size="9" font-weight="900" text-anchor="middle">CLUE</text>
            <line x1="275" y1="28" x2="260" y2="66" stroke="#c89a40" stroke-width="1.5"/>
            <line x1="275" y1="28" x2="290" y2="66" stroke="#c89a40" stroke-width="1.5"/>
            <path d="M248 66 Q275 82 302 66 Z" fill="#b88425" stroke="#ffe599" stroke-width="1.5"/>
            <text x="275" y="60" fill="#5cf2be" font-size="9" font-weight="900" text-anchor="middle">${placedIdx === null ? 'EMPTY' : `WT #${placedIdx + 1}`}</text>
          </g>
          <circle cx="170" cy="28" r="6" fill="#ffe494" stroke="#3a2308" stroke-width="2"/>
        </svg>
      </div>
      <div class="v6tb-grid-2">
        ${choices.map((c, idx) => `
          <button type="button" class="v6tb-plaque ${placedIdx === idx ? 'selected' : ''} ${eliminated.has(idx) ? 'eliminated' : ''}" data-pick="${idx}">
            <span class="v6tb-plaque-key">${idx + 1}</span>
            <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
          </button>
        `).join('')}
      </div>
      <button type="button" class="v6tb-lever-btn" id="v6balLock" ${placedIdx === null ? 'disabled' : ''}>WEIGH &amp; SEAL BALANCE</button>
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        placedIdx = Number(btn.dataset.pick);
        ctx.sfx('brass_gear_detent');
        render();
      });
    });
    ctx.stageEl.querySelector('#v6balLock')?.addEventListener('click', submit);
  };

  const submit = () => {
    if (ctx.isResolved()) return;
    const ok = placedIdx !== null && choices[placedIdx].isCorrect;
    const truth = choices.find((c) => c.isCorrect)!.label;
    ctx.setResolved(ok, ok ? 1 : 0, ok ? 'scale_balanced' : 'scale_tipped', ok ? 'PERFECT EQUILIBRIUM!' : 'SCALE TIPPED!', `True Weight: ${truth}`);
  };

  render();
  ctx.registerFoilHandler((kind) => {
    if (kind === 'DEFUSE_ONE_WIRE') {
      const wrong = choices.findIndex((c, i) => !c.isCorrect && !eliminated.has(i));
      if (wrong >= 0) { eliminated.add(wrong); render(); return true; }
    }
    return false;
  });
  ctx.registerHintHandler(() => {
    const wrong = choices.findIndex((c, i) => !c.isCorrect && !eliminated.has(i));
    if (wrong >= 0) { eliminated.add(wrong); render(); }
  });
  ctx.registerTimeoutHandler(submit);
}

function buildBraidedSwitchboard(ctx: ToyBuildContext): void {
  const choices = getNormalizedChoices(ctx.clue);
  let patchedIdx: number | null = null;
  const eliminated = new Set<number>();

  const render = () => {
    const endY = patchedIdx === null ? 55 : 16 + patchedIdx * 28;
    const cordPath = `M 42 55 C 125 55, 130 ${endY}, 238 ${endY}`;
    ctx.stageEl.innerHTML = `
      <div class="v6tb-row" style="flex:1 1 0;min-height:0;align-items:stretch;">
        <div class="v6tb-visual-bay" style="flex:0 0 46%;min-height:0;">
          <svg viewBox="0 0 260 112" width="100%" height="100%">
            <circle cx="34" cy="55" r="14" fill="#3a2811" stroke="#f4c458" stroke-width="3"/>
            <circle cx="34" cy="55" r="5" fill="#38e49b"/>
            <text x="34" y="84" fill="#f7d58b" font-size="9" font-weight="900" text-anchor="middle">LIVE CLUE</text>
            ${[0, 1, 2, 3].map((i) => {
              const cy = 16 + i * 28;
              const active = patchedIdx === i;
              return `<circle cx="238" cy="${cy}" r="9" fill="${active ? '#28c77f' : '#261a10'}" stroke="#e6b64c" stroke-width="2.5"/><text x="220" y="${cy + 3}" fill="#e9d2a2" font-size="9" font-weight="900" text-anchor="end">J${i + 1}</text>`;
            }).join('')}
            ${patchedIdx !== null ? `
              <path d="${cordPath}" fill="none" stroke="rgba(56,228,155,0.35)" stroke-width="11" stroke-linecap="round"/>
              <path d="${cordPath}" fill="none" stroke="#38e49b" stroke-width="5" stroke-linecap="round"/>
              <path d="${cordPath}" fill="none" stroke="#fff3c4" stroke-width="1.5" stroke-dasharray="6 4"/>
            ` : `<text x="135" y="59" fill="#c7b28a" font-size="10" font-weight="800" text-anchor="middle">TAP A JACK TO PATCH →</text>`}
          </svg>
        </div>
        <div class="v6tb-stack" style="flex:1;justify-content:center;">
          ${choices.map((c, idx) => `
            <button type="button" class="v6tb-plaque ${patchedIdx === idx ? 'selected' : ''} ${eliminated.has(idx) ? 'eliminated' : ''}" data-jack="${idx}" style="padding:6px 8px;">
              <span class="v6tb-plaque-key">J${idx + 1}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <button type="button" class="v6tb-lever-btn emerald" id="v6swConnect" ${patchedIdx === null ? 'disabled' : ''}>CONNECT SWITCHBOARD CIRCUIT</button>
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-jack]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        patchedIdx = Number(btn.dataset.jack);
        ctx.sfx('wire_cutter_snip');
        render();
      });
    });
    ctx.stageEl.querySelector('#v6swConnect')?.addEventListener('click', submit);
  };

  const submit = () => {
    if (ctx.isResolved()) return;
    const ok = patchedIdx !== null && choices[patchedIdx].isCorrect;
    const truth = choices.find((c) => c.isCorrect)!.label;
    ctx.setResolved(ok, ok ? 1 : 0, ok ? 'switchboard_connected' : 'switchboard_short', ok ? 'CIRCUIT LOCKED!' : 'SHORT CIRCUIT!', `Live Jack: ${truth}`);
  };

  render();
  ctx.registerHintHandler(() => {
    const wrong = choices.findIndex((c, i) => !c.isCorrect && !eliminated.has(i));
    if (wrong >= 0) { eliminated.add(wrong); render(); }
  });
  ctx.registerTimeoutHandler(submit);
}

function buildConfidenceOrAllIn(ctx: ToyBuildContext, isAllIn: boolean): void {
  const choices = getNormalizedChoices(ctx.clue);
  let confidencePct = isAllIn ? 50 : 60;
  let pickedIdx: number | null = null;
  const eliminated = new Set<number>();

  const render = () => {
    const multKick = Number((0.2 + (confidencePct / 100) * (isAllIn ? 1.8 : 1.1)).toFixed(2));
    const potPreview = Math.round(ctx.baseChips * (0.5 + confidencePct / 55));
    ctx.stageEl.innerHTML = `
      <div class="v6tb-stack" style="gap:5px;">
        <div class="v6tb-row">
          <span style="font-size:11px;font-weight:900;color:#ffe082;letter-spacing:0.06em;">${isAllIn ? 'CHIP BAR STAKE' : 'CONFIDENCE STAKE'}: <span id="v6cfPct">${confidencePct}%</span></span>
          <span style="font-size:11px;font-weight:900;color:#46f0a5;" id="v6cfPayout">WIN +$${potPreview} · +${multKick}x</span>
        </div>
        <div class="v6tb-caliper-track" id="v6cfTrack">
          <div class="v6tb-caliper-fill" id="v6cfFill"></div>
          <div class="v6tb-caliper-thumb" id="v6cfThumb"></div>
        </div>
      </div>
      <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
        ${choices.map((c, idx) => `
          <button type="button" class="v6tb-plaque ${pickedIdx === idx ? 'selected' : ''} ${eliminated.has(idx) ? 'eliminated' : ''}" data-pick="${idx}">
            <span class="v6tb-plaque-key">${String.fromCharCode(65 + idx)}</span>
            <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
          </button>
        `).join('')}
      </div>
      <button type="button" class="v6tb-lever-btn ${confidencePct >= 90 ? 'crimson' : ''}" id="v6cfLock" ${pickedIdx === null ? 'disabled' : ''}>
        ${confidencePct >= 95 ? 'SLAM ALL-IN 100%!' : `LOCK AT ${confidencePct}%`}
      </button>
    `;

    const pctEl = ctx.stageEl.querySelector<HTMLElement>('#v6cfPct')!;
    const payEl = ctx.stageEl.querySelector<HTMLElement>('#v6cfPayout')!;
    const lockBtn = ctx.stageEl.querySelector<HTMLButtonElement>('#v6cfLock')!;

    bindBrassCaliperTrack(
      ctx.stageEl.querySelector('#v6cfTrack')!,
      ctx.stageEl.querySelector('#v6cfFill')!,
      ctx.stageEl.querySelector('#v6cfThumb')!,
      (confidencePct - 10) / 90,
      (r) => {
        confidencePct = Math.round((10 + r * 90) / 5) * 5;
        pctEl.textContent = `${confidencePct}%`;
        const mk = Number((0.2 + (confidencePct / 100) * (isAllIn ? 1.8 : 1.1)).toFixed(2));
        const pp = Math.round(ctx.baseChips * (0.5 + confidencePct / 55));
        payEl.textContent = `WIN +$${pp} · +${mk}x`;
        lockBtn.textContent = confidencePct >= 95 ? 'SLAM ALL-IN 100%!' : `LOCK AT ${confidencePct}%`;
      },
      () => ctx.sfx('chip_stack_riffle'),
      ctx.addCleanup,
    );

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        pickedIdx = Number(btn.dataset.pick);
        ctx.sfx('ui_brass_tap');
        render();
      });
    });

    lockBtn.addEventListener('click', submit);
  };

  const submit = () => {
    if (ctx.isResolved()) return;
    const ok = pickedIdx !== null && choices[pickedIdx].isCorrect;
    const truth = choices.find((c) => c.isCorrect)!.label;
    const multKick = ok ? Number((0.2 + (confidencePct / 100) * (isAllIn ? 1.8 : 1.1)).toFixed(2)) : 0;
    const chipsOut = ok ? Math.round(ctx.baseChips * (0.5 + confidencePct / 55)) : 0;
    ctx.setResolved(
      ok,
      ok ? clamp(0.4 + confidencePct / 160, 0.5, 1) : 0,
      ok && confidencePct >= 90 ? 'all_in_bullseye' : ok ? 'confidence_cash' : 'confidence_bust',
      ok ? `CASHED AT ${confidencePct}%!` : 'STAKE BUSTED!',
      `True Answer: ${truth}`,
      multKick,
      chipsOut,
    );
  };

  render();
  ctx.registerHintHandler(() => {
    const wrong = choices.findIndex((c, i) => !c.isCorrect && !eliminated.has(i));
    if (wrong >= 0) { eliminated.add(wrong); render(); }
  });
  ctx.registerTimeoutHandler(submit);
}

function buildVennSorter(ctx: ToyBuildContext): void {
  const bin = deriveBinaryPayload(ctx.clue);
  const items = bin.items.slice(0, 3);
  let idx = 0;
  let score = 0;

  const render = () => {
    const item = items[idx];
    ctx.stageEl.innerHTML = `
      <div class="v6tb-visual-bay" style="flex-direction:column;gap:6px;padding:8px;">
        <div style="font-size:10px;font-weight:900;color:#b8d7f5;letter-spacing:0.08em;">CARD ${idx + 1} OF ${items.length}</div>
        <div style="font-size:clamp(15px,2.5dvh,20px);font-weight:900;color:#fff7e0;text-align:center;padding:4px 10px;border:1.5px solid #f0c458;border-radius:8px;background:#1e1710;">
          ${escapeHtml(item.text)}
        </div>
        <svg viewBox="0 0 300 72" width="100%" style="max-height:72px;">
          <circle cx="112" cy="36" r="32" fill="rgba(56,228,155,0.22)" stroke="#38e49b" stroke-width="2"/>
          <circle cx="188" cy="36" r="32" fill="rgba(240,196,88,0.22)" stroke="#f0c458" stroke-width="2"/>
          <text x="90" y="39" fill="#9cf7ce" font-size="9" font-weight="900" text-anchor="middle">${escapeHtml(bin.optionA.slice(0, 11))}</text>
          <text x="150" y="39" fill="#fff" font-size="8.5" font-weight="900" text-anchor="middle">BOTH</text>
          <text x="210" y="39" fill="#ffe7a3" font-size="9" font-weight="900" text-anchor="middle">${escapeHtml(bin.optionB.slice(0, 11))}</text>
        </svg>
      </div>
      <div class="v6tb-grid-3">
        <button type="button" class="v6tb-lever-btn emerald" data-z="0">${escapeHtml(bin.optionA.slice(0, 12))}</button>
        <button type="button" class="v6tb-lever-btn" data-z="2">OVERLAP</button>
        <button type="button" class="v6tb-lever-btn crimson" data-z="1">${escapeHtml(bin.optionB.slice(0, 12))}</button>
      </div>
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-z]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const z = Number(btn.dataset.z);
        const ok = z === item.bucket;
        if (ok) score += 1;
        ctx.sfx(ok ? 'crystal_hex_claim' : 'trapdoor_hinge_drop');
        idx += 1;
        if (idx >= items.length) {
          const won = score >= Math.ceil(items.length * 0.66);
          ctx.setResolved(won, score / items.length, 'venn_sorted', `${score}/${items.length} PINNED!`, `Sorted across ${bin.optionA} vs ${bin.optionB}`);
        } else {
          render();
        }
      });
    });
  };

  render();
  ctx.registerTimeoutHandler(() => {
    ctx.setResolved(score >= 2, score / items.length, 'venn_timeout', `${score}/${items.length} SORTED`, 'Time expired!');
  });
}

function buildTimelinePin(ctx: ToyBuildContext): void {
  const num = deriveNumericPayload(ctx.clue);
  const span = Math.max(10, num.max - num.min);
  let val = num.startGuess;

  ctx.stageEl.innerHTML = `
    <div class="v6tb-visual-bay" style="flex-direction:column;gap:8px;padding:10px;">
      <div class="v6tb-nixie" id="v6tlVal">${escapeHtml(formatStageNumberV6(val, num.unit, num.min, num.max))}</div>
      <div style="width:100%;display:flex;justify-content:space-between;font-size:10.5px;font-weight:800;color:#d6bb86;">
        <span>${escapeHtml(formatStageNumberV6(num.min, num.unit, num.min, num.max))}</span>
        <span>${escapeHtml(formatStageNumberV6(Math.round((num.min + num.max) / 2), num.unit, num.min, num.max))}</span>
        <span>${escapeHtml(formatStageNumberV6(num.max, num.unit, num.min, num.max))}</span>
      </div>
      <div class="v6tb-caliper-track" id="v6tlTrack">
        <div class="v6tb-caliper-fill" id="v6tlFill"></div>
        <div class="v6tb-caliper-thumb" id="v6tlThumb"></div>
      </div>
    </div>
    <div class="v6tb-row" style="justify-content:center;">
      <button type="button" class="v6tb-knob-btn" data-d="-5">-5</button>
      <button type="button" class="v6tb-knob-btn" data-d="-1">-1</button>
      <button type="button" class="v6tb-lever-btn" id="v6tlLock" style="flex:1;">DROP RUBY TIMELINE PIN</button>
      <button type="button" class="v6tb-knob-btn" data-d="1">+1</button>
      <button type="button" class="v6tb-knob-btn" data-d="5">+5</button>
    </div>
  `;

  const valEl = ctx.stageEl.querySelector<HTMLElement>('#v6tlVal')!;
  const sync = (v: number) => {
    val = clamp(Math.round(v), num.min, num.max);
    valEl.textContent = formatStageNumberV6(val, num.unit, num.min, num.max);
  };
  const cal = bindBrassCaliperTrack(
    ctx.stageEl.querySelector('#v6tlTrack')!,
    ctx.stageEl.querySelector('#v6tlFill')!,
    ctx.stageEl.querySelector('#v6tlThumb')!,
    (val - num.min) / span,
    (r) => sync(num.min + r * span),
    () => ctx.sfx('rotary_knob_click'),
    ctx.addCleanup,
  );
  ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-d]').forEach((b) => {
    b.addEventListener('click', () => {
      sync(val + Number(b.dataset.d));
      cal.setRatio((val - num.min) / span);
      ctx.sfx('rotary_knob_click');
    });
  });

  const submit = () => {
    if (ctx.isResolved()) return;
    const err = Math.abs(val - num.target);
    const won = err <= num.tolerance * 1.35;
    const acc = clamp(1 - err / Math.max(1, num.tolerance * 2), 0, 1);
    ctx.setResolved(won, acc, won ? 'timeline_pin_hit' : 'timeline_pin_miss', won ? `PINNED WITHIN ${err}!` : `OFF BY ${err}`, `Exact: ${formatStageNumberV6(num.target, num.unit, num.min, num.max)}`);
  };
  ctx.stageEl.querySelector('#v6tlLock')?.addEventListener('click', submit);
  ctx.registerTimeoutHandler(submit);
}

function buildCoinTraySum(ctx: ToyBuildContext): void {
  const num = deriveNumericPayload(ctx.clue);
  const denoms = num.target >= 1500
    ? [1000, 100, 25, 10, 1]
    : num.target >= 200
      ? [100, 25, 10, 5, 1]
      : [25, 10, 5, 2, 1];
  let total = num.target >= 1800 ? 1900 : 0;
  let coinCount = 0;

  const render = () => {
    ctx.stageEl.innerHTML = `
      <div class="v6tb-visual-bay" style="flex-direction:column;gap:6px;padding:8px;">
        <div style="font-size:10px;font-weight:800;color:#e6c98a;letter-spacing:0.08em;">VELVET MINTING TRAY (${coinCount} COINS)</div>
        <div class="v6tb-nixie">${escapeHtml(formatStageNumberV6(total, num.unit, num.min, num.max))}</div>
        <div style="font-size:10.5px;color:#b8a580;">Range: ${formatStageNumberV6(num.min, num.unit, num.min, num.max)} – ${formatStageNumberV6(num.max, num.unit, num.min, num.max)}</div>
      </div>
      <div class="v6tb-row" style="justify-content:center;flex-wrap:wrap;gap:6px;">
        ${denoms.map((d) => `<button type="button" class="v6tb-knob-btn" data-coin="${d}" style="border-radius:999px;padding:7px 11px;border-color:#ffe074;">+${d}</button>`).join('')}
        <button type="button" class="v6tb-knob-btn" data-coin="-10">-10</button>
        <button type="button" class="v6tb-knob-btn" id="v6ctClr">CLR</button>
      </div>
      <button type="button" class="v6tb-lever-btn" id="v6ctLock">WEIGH MINTED TRAY</button>
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-coin]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        total = Math.max(0, total + Number(b.dataset.coin));
        coinCount += 1;
        ctx.sfx('chip_stack_riffle');
        render();
      });
    });
    ctx.stageEl.querySelector('#v6ctClr')?.addEventListener('click', () => {
      total = 0;
      coinCount = 0;
      ctx.sfx('ui_brass_tap');
      render();
    });
    ctx.stageEl.querySelector('#v6ctLock')?.addEventListener('click', submit);
  };

  const submit = () => {
    if (ctx.isResolved()) return;
    const err = Math.abs(total - num.target);
    const won = err <= Math.max(3, num.tolerance);
    const acc = clamp(1 - err / Math.max(5, num.tolerance * 2), 0, 1);
    ctx.setResolved(won, acc, won ? 'coin_tray_exact' : 'coin_tray_short', err === 0 ? 'EXACT CHANGE!' : won ? 'CLOSE MINT!' : 'WRONG TOTAL!', `Exact Target: ${formatStageNumberV6(num.target, num.unit, num.min, num.max)}`);
  };

  render();
  ctx.registerTimeoutHandler(submit);
}

// ============================================================================
// FAMILY VII BUILDERS (Toys 61–70: CASINO_BLUFF_STAKES)
// ============================================================================

function buildTrapdoorChipSplit(ctx: ToyBuildContext): void {
  const allChoices = getNormalizedChoices(ctx.clue);
  const truth = allChoices.find((c) => c.isCorrect)!;
  const decoys = allChoices.filter((c) => !c.isCorrect).slice(0, 2);
  const doors = [truth, ...decoys];
  const rng = seededRand(ctx.clue.qid * 71 + 5);
  for (let i = doors.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [doors[i], doors[j]] = [doors[j], doors[i]];
  }

  const stakes = [0, 0, 0];
  let dropped = false;

  const render = () => {
    const placed = stakes[0] + stakes[1] + stakes[2];
    const bank = 100 - placed;
    const emptyDoors = stakes.filter((s) => s === 0).length;
    const canDrop = bank === 0 && emptyDoors >= 1 && !dropped;

    ctx.stageEl.innerHTML = `
      <div class="v6tb-row" style="padding:2px 4px;">
        <span style="font-size:11.5px;font-weight:900;color:#ffe074;">UNPLACED CHIPS: ${bank} / 100</span>
        <span style="font-size:10.5px;font-weight:800;color:${emptyDoors >= 1 ? '#5cf2be' : '#ff6b7a'};">${emptyDoors >= 1 ? 'RULE OK: >=1 DOOR EMPTY' : 'LEAVE 1 DOOR EMPTY!'}</span>
      </div>
      <div class="v6tb-grid-3" style="flex:1 1 0;align-items:stretch;">
        ${doors.map((d, i) => {
          const isOpen = dropped && !d.isCorrect;
          const isSafe = dropped && d.isCorrect;
          return `
            <div style="border:2px solid ${isSafe ? '#36e896' : isOpen ? '#ff4757' : '#d4a84c'};border-radius:10px;background:${isOpen ? '#120507' : 'linear-gradient(180deg,#1a4834,#0c261b)'};padding:7px;display:flex;flex-direction:column;justify-content:space-between;gap:5px;text-align:center;opacity:${isOpen ? '0.45' : '1'};">
              <div style="font-size:10px;font-weight:900;color:#d6c08d;">DOOR ${i + 1}</div>
              <div style="font-size:12px;font-weight:800;color:#fff7e6;line-height:1.2;">${escapeHtml(d.label)}</div>
              <div class="v6tb-nixie" style="font-size:17px;padding:2px 6px;">${stakes[i]}</div>
              <div class="v6tb-row" style="justify-content:center;gap:4px;">
                <button type="button" class="v6tb-knob-btn" data-door="${i}:-20" style="padding:4px 6px;min-width:28px;">-20</button>
                <button type="button" class="v6tb-knob-btn" data-door="${i}:20" style="padding:4px 6px;min-width:28px;">+20</button>
                <button type="button" class="v6tb-knob-btn" data-door="${i}:100" style="padding:4px 6px;min-width:28px;">ALL</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <button type="button" class="v6tb-lever-btn crimson" id="v6tdDrop" ${canDrop ? '' : 'disabled'}>DROP FALSE TRAPDOORS!</button>
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-door]').forEach((b) => {
      b.addEventListener('click', () => {
        if (dropped || ctx.isResolved()) return;
        const [iS, dS] = (b.dataset.door ?? '0:0').split(':');
        const idx = Number(iS);
        const delta = Number(dS);
        if (delta === 100) {
          stakes[0] = 0; stakes[1] = 0; stakes[2] = 0; stakes[idx] = 100;
        } else if (delta > 0) {
          const add = Math.min(delta, bank);
          stakes[idx] += add;
        } else {
          stakes[idx] = Math.max(0, stakes[idx] + delta);
        }
        ctx.sfx('chip_stack_riffle');
        render();
      });
    });

    ctx.stageEl.querySelector('#v6tdDrop')?.addEventListener('click', resolveDoors);
  };

  const resolveDoors = () => {
    if (dropped || ctx.isResolved()) return;
    dropped = true;
    ctx.sfx('trapdoor_hinge_drop');
    render();
    const safeIdx = doors.findIndex((d) => d.isCorrect);
    const saved = stakes[safeIdx];
    const t = window.setTimeout(() => {
      ctx.setResolved(
        saved > 0,
        saved / 100,
        saved === 100 ? 'trapdoor_100_clean' : saved > 0 ? 'trapdoor_partial_save' : 'trapdoor_wiped',
        saved > 0 ? `SAVED ${saved} / 100 CHIPS!` : 'ALL CHIPS DROPPED!',
        `Safe Trapdoor: ${doors[safeIdx].label}`,
        saved === 100 ? 0.8 : 0,
        Math.round(ctx.baseChips * (saved / 60)),
      );
    }, 450);
    ctx.addCleanup(() => window.clearTimeout(t));
  };

  render();
  ctx.registerTimeoutHandler(resolveDoors);
}

function buildHostsBribeVault(ctx: ToyBuildContext): void {
  const choices = getNormalizedChoices(ctx.clue);
  let vaultOpen = false;
  const eliminated = new Set<number>();

  const render = () => {
    if (!vaultOpen) {
      ctx.stageEl.innerHTML = `
        <div class="v6tb-grid-2" style="flex:1 1 0;align-items:stretch;">
          <div style="border:2px solid #e6b85c;border-radius:12px;background:linear-gradient(160deg,#3d2610,#1a1006);padding:12px;display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center;">
            <div style="font-size:10px;font-weight:900;letter-spacing:0.1em;color:#ffd980;">JULIAN'S WAX ENVELOPE</div>
            <div class="v6tb-nixie" style="color:#4af0a8;">$350</div>
            <div style="font-size:11.5px;color:#ead9b6;">Walk away right now. Zero risk. Streak preserved.</div>
            <button type="button" class="v6tb-lever-btn emerald" id="v6hbBribe" style="width:100%;">TAKE $350 BRIBE</button>
          </div>
          <div style="border:2px solid #ff667a;border-radius:12px;background:linear-gradient(160deg,#47121e,#1e060b);padding:12px;display:flex;flex-direction:column;justify-content:space-between;align-items:center;text-align:center;">
            <div style="font-size:10px;font-weight:900;letter-spacing:0.1em;color:#ff99a8;">HIGH-STAKES STUDIO VAULT</div>
            <div class="v6tb-nixie" style="color:#ffe074;">$1,500</div>
            <div style="font-size:11.5px;color:#f5cfd5;">Refuse the bribe &amp; solve the clue for massive Chips + Mult!</div>
            <button type="button" class="v6tb-lever-btn crimson" id="v6hbVault" style="width:100%;">CRACK $1,500 VAULT</button>
          </div>
        </div>
      `;

      ctx.stageEl.querySelector('#v6hbBribe')?.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        ctx.sfx('chip_stack_riffle');
        ctx.setResolved(true, 0.55, 'took_hosts_bribe', 'POCKETED $350 BRIBE!', 'Safe cash banked & streak preserved!', 0, 350);
      });
      ctx.stageEl.querySelector('#v6hbVault')?.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        vaultOpen = true;
        ctx.sfx('vault_heavy_unlock');
        render();
      });
      return;
    }

    ctx.stageEl.innerHTML = `
      <div style="font-size:11px;font-weight:900;color:#ffe074;text-align:center;letter-spacing:0.08em;">BRIBE REFUSED! PICK THE TRUTH FOR $1,500 + 1.2x MULT</div>
      <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
        ${choices.map((c, idx) => `
          <button type="button" class="v6tb-plaque ${eliminated.has(idx) ? 'eliminated' : ''}" data-pick="${idx}">
            <span class="v6tb-plaque-key">${String.fromCharCode(65 + idx)}</span>
            <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
          </button>
        `).join('')}
      </div>
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const ok = choices[Number(b.dataset.pick)].isCorrect;
        const truth = choices.find((c) => c.isCorrect)!.label;
        ctx.setResolved(ok, ok ? 1 : 0, ok ? 'cracked_1500_vault' : 'vault_busted', ok ? '$1,500 VAULT CRACKED!' : 'SHOULD HAVE TAKEN THE BRIBE!', `Truth: ${truth}`, ok ? 1.2 : 0, ok ? 1500 : 0);
      });
    });
  };

  render();
  ctx.registerHintHandler(() => {
    vaultOpen = true;
    const wrong = choices.findIndex((c, i) => !c.isCorrect && !eliminated.has(i));
    if (wrong >= 0) eliminated.add(wrong);
    render();
  });
  ctx.registerTimeoutHandler(() => {
    ctx.setResolved(false, 0, 'vault_timeout', 'VAULT SEALED SHUT!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`);
  });
}

function buildDoubleSecondGuess(ctx: ToyBuildContext): void {
  const choices = getNormalizedChoices(ctx.clue);
  let lockedIdx: number | null = null;
  const eliminated = new Set<number>();

  const render = () => {
    if (lockedIdx === null) {
      ctx.stageEl.innerHTML = `
        <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
          ${choices.map((c, idx) => `
            <button type="button" class="v6tb-plaque ${eliminated.has(idx) ? 'eliminated' : ''}" data-pick="${idx}">
              <span class="v6tb-plaque-key">${String.fromCharCode(65 + idx)}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `).join('')}
        </div>
      `;
      ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((b) => {
        b.addEventListener('click', () => {
          if (ctx.isResolved()) return;
          lockedIdx = Number(b.dataset.pick);
          ctx.sfx('brass_gear_detent');
          render();
        });
      });
      return;
    }

    ctx.stageEl.innerHTML = `
      <div class="v6tb-visual-bay" style="flex-direction:column;gap:8px;padding:12px;text-align:center;">
        <div style="font-size:11px;font-weight:900;color:#ffe074;letter-spacing:0.08em;">LOCKED SELECTION</div>
        <div style="font-size:17px;font-weight:900;color:#ffffff;">"${escapeHtml(choices[lockedIdx].label)}"</div>
        <div style="font-size:11.5px;color:#d6c094;">Dare to push DOUBLE OR NOTHING for 2X Payout &amp; +1.2x Mult?</div>
      </div>
      <div class="v6tb-grid-2">
        <button type="button" class="v6tb-lever-btn emerald" id="v6dgSafe">PLAY SAFE (1X)</button>
        <button type="button" class="v6tb-lever-btn crimson" id="v6dgDouble">DOUBLE OR NOTHING (2X)!</button>
      </div>
    `;

    const finish = (doubled: boolean) => {
      if (ctx.isResolved() || lockedIdx === null) return;
      const ok = choices[lockedIdx].isCorrect;
      const truth = choices.find((c) => c.isCorrect)!.label;
      ctx.setResolved(
        ok,
        ok ? 1 : 0,
        doubled ? (ok ? 'doubled_and_won' : 'doubled_and_busted') : 'safe_lock',
        ok ? (doubled ? 'DOUBLED JACKPOT!' : 'CLEAN WIN!') : 'BUSTED!',
        `Truth: ${truth}`,
        ok && doubled ? 1.2 : 0,
        ok ? (doubled ? ctx.baseChips * 2 : ctx.baseChips) : 0,
      );
    };
    ctx.stageEl.querySelector('#v6dgSafe')?.addEventListener('click', () => finish(false));
    ctx.stageEl.querySelector('#v6dgDouble')?.addEventListener('click', () => finish(true));
  };

  render();
  ctx.registerHintHandler(() => {
    const wrong = choices.findIndex((c, i) => !c.isCorrect && !eliminated.has(i));
    if (wrong >= 0) { eliminated.add(wrong); render(); }
  });
  ctx.registerTimeoutHandler(() => {
    const ok = lockedIdx !== null && choices[lockedIdx].isCorrect;
    ctx.setResolved(ok, ok ? 1 : 0, 'double_timeout', ok ? 'SAVED AT BUZZER!' : 'TIME UP!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`);
  });
}

function buildCasinoCardOrWheelToy(
  ctx: ToyBuildContext,
  variant: 'BLACKJACK' | 'ROULETTE' | 'POKER' | 'BLIND_CARD' | 'INSURANCE' | 'PRESS_LUCK',
): void {
  const choices = getNormalizedChoices(ctx.clue);
  const rng = seededRand(ctx.clue.qid * 53 + variant.length * 17);

  if (variant === 'POKER') {
    const folded = new Set<number>();
    const render = () => {
      const needFold = Math.max(0, 2 - folded.size);
      ctx.stageEl.innerHTML = `
        <div style="font-size:11px;font-weight:900;text-align:center;color:${needFold > 0 ? '#ff99a8' : '#46f0a5'};letter-spacing:0.08em;">
          ${needFold > 0 ? `STEP 1: FOLD ${needFold} BLUFF CARD${needFold > 1 ? 'S' : ''}` : 'STEP 2: TAP YOUR WINNING SHOWDOWN CARD!'}
        </div>
        <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
          ${choices.map((c, idx) => `
            <button type="button" class="v6tb-plaque ${folded.has(idx) ? 'eliminated' : ''}" data-card="${idx}">
              <span class="v6tb-plaque-key">${['A', 'K', 'Q', 'J'][idx]}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `).join('')}
        </div>
      `;
      ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-card]').forEach((b) => {
        b.addEventListener('click', () => {
          if (ctx.isResolved()) return;
          const i = Number(b.dataset.card);
          if (folded.size < 2) {
            if (choices[i].isCorrect) {
              ctx.sfx('trapdoor_hinge_drop');
              ctx.setResolved(false, 0, 'folded_truth', 'FOLDED THE WINNING HAND!', `Truth was: ${choices[i].label}`);
              return;
            }
            folded.add(i);
            ctx.sfx('foil_card_flick');
            render();
          } else {
            const ok = choices[i].isCorrect;
            ctx.setResolved(ok, ok ? 1 : 0, ok ? 'poker_showdown_win' : 'poker_bluffed', ok ? 'ROYAL SHOWDOWN!' : 'BLUFFED!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`, ok ? 0.65 : 0);
          }
        });
      });
    };
    render();
    ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'poker_timeout', 'FOLDED BY CLOCK!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`));
    return;
  }

  if (variant === 'BLIND_CARD') {
    const multCards = [1.5, 2.0, 3.0];
    for (let i = multCards.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [multCards[i], multCards[j]] = [multCards[j], multCards[i]];
    }
    let drawnMult: number | null = null;
    const render = () => {
      if (drawnMult === null) {
        ctx.stageEl.innerHTML = `
          <div style="font-size:11px;font-weight:900;color:#ffe074;text-align:center;">DRAW 1 BLIND MULTIPLIER CARD FIRST!</div>
          <div class="v6tb-grid-3" style="flex:1 1 0;align-items:stretch;">
            ${multCards.map((_, i) => `
              <button type="button" class="v6tb-plaque" data-draw="${i}" style="flex-direction:column;justify-content:center;text-align:center;border-color:#ffe074;background:linear-gradient(155deg,#4f350f,#1c1205);">
                <div style="font-size:22px;font-weight:900;color:#ffe074;">?X</div>
                <div style="font-size:10px;color:#e5c989;letter-spacing:0.1em;">CARD ${i + 1}</div>
              </button>
            `).join('')}
          </div>
        `;
        ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-draw]').forEach((b) => {
          b.addEventListener('click', () => {
            drawnMult = multCards[Number(b.dataset.draw)];
            ctx.sfx('foil_card_flick');
            render();
          });
        });
        return;
      }
      ctx.stageEl.innerHTML = `
        <div style="font-size:12px;font-weight:900;color:#46f0a5;text-align:center;">ACTIVE DRAW: ${drawnMult.toFixed(1)}X MULTIPLIER! LOCK THE TRUTH:</div>
        <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
          ${choices.map((c, idx) => `
            <button type="button" class="v6tb-plaque" data-pick="${idx}">
              <span class="v6tb-plaque-key">${String.fromCharCode(65 + idx)}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `).join('')}
        </div>
      `;
      ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((b) => {
        b.addEventListener('click', () => {
          if (ctx.isResolved()) return;
          const ok = choices[Number(b.dataset.pick)].isCorrect;
          ctx.setResolved(ok, ok ? 1 : 0, ok ? 'blind_draw_cashed' : 'blind_draw_bust', ok ? `CASHED ${drawnMult!.toFixed(1)}X!` : 'DRAW BUSTED!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`, ok ? drawnMult! - 1 : 0);
        });
      });
    };
    render();
    ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'blind_timeout', 'TIME UP!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`));
    return;
  }

  if (variant === 'INSURANCE') {
    let primary: number | null = null;
    let backup: number | null = null;
    const render = () => {
      ctx.stageEl.innerHTML = `
        <div style="font-size:11px;font-weight:800;color:#e8d3a5;text-align:center;">
          ${primary === null ? 'TAP 1ST: PRIMARY PICK (100%)' : backup === null ? 'TAP 2ND: OPTIONAL BACKUP SHIELD (45%) OR LOCK SOLO (+0.5x)' : 'PRIMARY + BACKUP ARMED!'}
        </div>
        <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
          ${choices.map((c, idx) => `
            <button type="button" class="v6tb-plaque ${primary === idx ? 'selected' : backup === idx ? 'secondary-sel' : ''}" data-pick="${idx}">
              <span class="v6tb-plaque-key">${primary === idx ? '1ST' : backup === idx ? '2ND' : String.fromCharCode(65 + idx)}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `).join('')}
        </div>
        <button type="button" class="v6tb-lever-btn" id="v6insLock" ${primary === null ? 'disabled' : ''}>
          ${backup === null ? 'LOCK SOLO (+0.5X BOLD BONUS)' : 'LOCK INSURED BET'}
        </button>
      `;
      ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((b) => {
        b.addEventListener('click', () => {
          const i = Number(b.dataset.pick);
          if (primary === null) primary = i;
          else if (primary === i) { primary = null; backup = null; }
          else if (backup === i) backup = null;
          else backup = i;
          ctx.sfx('chip_stack_riffle');
          render();
        });
      });
      ctx.stageEl.querySelector('#v6insLock')?.addEventListener('click', submit);
    };
    const submit = () => {
      if (ctx.isResolved()) return;
      const hitPrimary = primary !== null && choices[primary].isCorrect;
      const hitBackup = backup !== null && choices[backup].isCorrect;
      const truth = choices.find((c) => c.isCorrect)!.label;
      ctx.setResolved(
        hitPrimary || hitBackup,
        hitPrimary ? 1 : hitBackup ? 0.55 : 0,
        hitPrimary ? 'insurance_primary_hit' : hitBackup ? 'insurance_saved' : 'insurance_miss',
        hitPrimary ? 'PRIMARY BULLSEYE!' : hitBackup ? 'INSURANCE SAVED YOUR STREAK!' : 'BOTH MISSED!',
        `Truth: ${truth}`,
        hitPrimary && backup === null ? 0.5 : 0,
        hitPrimary ? ctx.baseChips : hitBackup ? Math.round(ctx.baseChips * 0.45) : 0,
      );
    };
    render();
    ctx.registerTimeoutHandler(submit);
    return;
  }

  if (variant === 'PRESS_LUCK') {
    const opened = new Set<number>();
    const payouts = [0, 300, 650, 1250];
    const render = () => {
      const pot = payouts[Math.min(opened.size, 3)];
      ctx.stageEl.innerHTML = `
        <div class="v6tb-row">
          <span style="font-size:11px;font-weight:900;color:#46f0a5;">VAULT POT: $${pot} (${opened.size}/3 DECOYS CRACKED)</span>
          <span style="font-size:10px;color:#ffd166;font-weight:800;">CRACK FALSE SAFES · DODGE TRUTH!</span>
        </div>
        <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
          ${choices.map((c, idx) => `
            <button type="button" class="v6tb-plaque ${opened.has(idx) ? 'correct' : ''}" data-vault="${idx}" ${opened.has(idx) ? 'disabled' : ''}>
              <span class="v6tb-plaque-key">${opened.has(idx) ? 'OK' : `V${idx + 1}`}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `).join('')}
        </div>
        <button type="button" class="v6tb-lever-btn emerald" id="v6plCash" ${opened.size === 0 ? 'disabled' : ''}>CASH OUT $${pot} SAFE</button>
      `;
      ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-vault]').forEach((b) => {
        b.addEventListener('click', () => {
          if (ctx.isResolved()) return;
          const i = Number(b.dataset.vault);
          if (choices[i].isCorrect) {
            ctx.sfx('trapdoor_hinge_drop');
            ctx.setResolved(false, 0, 'vault_alarm_tripped', 'TRIPPED THE TRUTH ALARM!', `The protected truth was: ${choices[i].label}`);
            return;
          }
          opened.add(i);
          ctx.sfx('vault_heavy_unlock');
          if (opened.size >= 3) {
            ctx.setResolved(true, 1, 'press_luck_cleared', 'ALL 3 DECOY VAULTS CLEARED!', `Isolated Truth: ${choices.find((c) => c.isCorrect)!.label}`, 0.9, 1250);
          } else {
            render();
          }
        });
      });
      ctx.stageEl.querySelector('#v6plCash')?.addEventListener('click', () => {
        if (ctx.isResolved() || opened.size === 0) return;
        ctx.setResolved(true, opened.size / 3, 'press_luck_cashed', `BANKED $${pot}!`, `Truth was: ${choices.find((c) => c.isCorrect)!.label}`, opened.size * 0.25, pot);
      });
    };
    render();
    ctx.registerTimeoutHandler(() => {
      const pot = payouts[Math.min(opened.size, 3)];
      ctx.setResolved(opened.size > 0, opened.size / 3, 'press_luck_timeout', opened.size > 0 ? `AUTO-BANKED $${pot}` : 'TIME UP!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`, 0, pot);
    });
    return;
  }

  if (variant === 'BLACKJACK') {
    let hand = 7;
    const dealt = new Set<number>();
    const render = () => {
      ctx.stageEl.innerHTML = `
        <div class="v6tb-row">
          <span class="v6tb-nixie" style="font-size:16px;padding:3px 10px;">HAND: ${hand} / 21</span>
          <span style="font-size:10.5px;color:#a5f0ce;font-weight:800;">TAP TRUTH (+14 -> 21!) · DECOYS BUST!</span>
        </div>
        <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
          ${choices.map((c, idx) => `
            <button type="button" class="v6tb-plaque ${dealt.has(idx) ? 'eliminated' : ''}" data-hit="${idx}">
              <span class="v6tb-plaque-key">${idx + 1}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `).join('')}
        </div>
      `;
      ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-hit]').forEach((b) => {
        b.addEventListener('click', () => {
          if (ctx.isResolved()) return;
          const i = Number(b.dataset.hit);
          if (choices[i].isCorrect) {
            hand = 21;
            ctx.sfx('chip_stack_riffle');
            ctx.setResolved(true, 1, 'blackjack_21', 'BLACKJACK 21!', `Winning Fact: ${choices[i].label}`, 0.75, Math.round(ctx.baseChips * 1.5));
          } else {
            hand = 26;
            ctx.sfx('trapdoor_hinge_drop');
            ctx.setResolved(false, 0, 'blackjack_bust', 'BUST — 26!', `Truth was: ${choices.find((c) => c.isCorrect)!.label}`);
          }
        });
      });
    };
    render();
    ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'blackjack_timeout', 'DEALER WINS!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`));
    return;
  }

  // ROULETTE WHEEL BET
  let betIdx: number | null = null;
  let spinning = false;
  const renderRoulette = () => {
    ctx.stageEl.innerHTML = `
      <div class="v6tb-row" style="flex:1 1 0;min-height:0;">
        <div class="v6tb-visual-bay" style="flex:0 0 38%;min-height:0;">
          <svg viewBox="0 0 120 120" width="96" height="96" id="v6rlWheel" style="transition:transform 0.65s cubic-bezier(.15,.85,.25,1);">
            <circle cx="60" cy="60" r="54" fill="#3a2010" stroke="#f0c453" stroke-width="4"/>
            <path d="M60,60 L60,12 A48,48 0 0,1 108,60 Z" fill="#b81d2d"/>
            <path d="M60,60 L108,60 A48,48 0 0,1 60,108 Z" fill="#18191c"/>
            <path d="M60,60 L60,108 A48,48 0 0,1 12,60 Z" fill="#b81d2d"/>
            <path d="M60,60 L12,60 A48,48 0 0,1 60,12 Z" fill="#18191c"/>
            <circle cx="60" cy="60" r="14" fill="#e6b84c" stroke="#fff3c2" stroke-width="2"/>
            <circle cx="60" cy="22" r="4.5" fill="#fff"/>
          </svg>
        </div>
        <div class="v6tb-stack" style="flex:1;justify-content:center;">
          ${choices.map((c, idx) => `
            <button type="button" class="v6tb-plaque ${betIdx === idx ? 'selected' : ''}" data-bet="${idx}" style="padding:6px 8px;">
              <span class="v6tb-plaque-key" style="background:${idx % 2 === 0 ? '#c92638' : '#1d2026'};color:#fff;">${idx % 2 === 0 ? 'RED' : 'BLK'}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `).join('')}
        </div>
      </div>
      <button type="button" class="v6tb-lever-btn" id="v6rlSpin" ${betIdx === null || spinning ? 'disabled' : ''}>SPIN MONTE CARLO WHEEL</button>
    `;
    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-bet]').forEach((b) => {
      b.addEventListener('click', () => {
        if (spinning || ctx.isResolved()) return;
        betIdx = Number(b.dataset.bet);
        ctx.sfx('chip_stack_riffle');
        renderRoulette();
      });
    });
    ctx.stageEl.querySelector('#v6rlSpin')?.addEventListener('click', spinNow);
  };
  const spinNow = () => {
    if (spinning || ctx.isResolved()) return;
    spinning = true;
    ctx.sfx('brass_gear_detent');
    const wheel = ctx.stageEl.querySelector<SVGSVGElement>('#v6rlWheel');
    if (wheel) wheel.style.transform = `rotate(${720 + (betIdx ?? 0) * 90}deg)`;
    const t = window.setTimeout(() => {
      const ok = betIdx !== null && choices[betIdx].isCorrect;
      ctx.setResolved(ok, ok ? 1 : 0, ok ? 'roulette_hit' : 'roulette_miss', ok ? 'BALL DROPPED ON YOUR POCKET!' : 'HOUSE TAKES THE SPIN!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`, ok ? 0.55 : 0);
    }, 620);
    ctx.addCleanup(() => window.clearTimeout(t));
  };
  renderRoulette();
  ctx.registerTimeoutHandler(spinNow);
}

// ============================================================================
// FAMILY VIII BUILDERS (Toys 71–80: FORENSIC_DETECTIVE)
// ============================================================================

function buildBeamScannerToy(
  ctx: ToyBuildContext,
  mode: 'UV_BLACKLIGHT' | 'XRAY_CRATE' | 'SPOTLIGHT_BLACKOUT',
): void {
  const choices = getNormalizedChoices(ctx.clue);
  let beamX = 50; // percentage 0..100
  let beamY = 50;
  let battery = 100;
  const revealedSet = new Set<number>();

  ctx.stageEl.innerHTML = `
    <div class="v6tb-row" style="padding:0 2px;">
      <span style="font-size:10.5px;font-weight:900;color:${mode === 'UV_BLACKLIGHT' ? '#c29eff' : mode === 'XRAY_CRATE' ? '#5ef5cb' : '#ffe074'};">
        ${mode === 'UV_BLACKLIGHT' ? 'DRAG UV TORCH OVER SLIPS TO EXPOSE INK' : mode === 'XRAY_CRATE' ? 'SLIDE X-RAY SHUTTER OVER CRATES' : 'DRAG SPOTLIGHT BEAM — BATTERY DRAINING!'}
      </span>
      ${mode === 'SPOTLIGHT_BLACKOUT' ? `<span style="font-size:11px;font-weight:900;color:#ff8f5c;" id="v6bmBat">BAT 100%</span>` : ''}
    </div>
    <div id="v6bmField" class="v6tb-visual-bay" style="flex:1 1 0;touch-action:none;cursor:crosshair;padding:10px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-content:center;background:${mode === 'SPOTLIGHT_BLACKOUT' ? '#040305' : mode === 'UV_BLACKLIGHT' ? '#120d1f' : '#0b1914'};">
      ${choices.map((c, idx) => `
        <button type="button" class="v6tb-plaque" data-scan="${idx}" style="height:100%;min-height:54px;border-color:${mode === 'UV_BLACKLIGHT' ? '#6a4fb3' : '#3a7a63'};background:${mode === 'SPOTLIGHT_BLACKOUT' ? '#0a080d' : '#181421'};">
          <span class="v6tb-plaque-key">${idx + 1}</span>
          <span class="v6tb-plaque-txt" data-scantxt="${idx}" style="opacity:0.08;transition:opacity 0.12s ease;">${escapeHtml(c.label)}</span>
        </button>
      `).join('')}
      <div id="v6bmGlow" style="position:absolute;width:150px;height:150px;margin-left:-75px;margin-top:-75px;border-radius:50%;pointer-events:none;border:2px solid ${mode === 'UV_BLACKLIGHT' ? '#b388ff' : mode === 'XRAY_CRATE' ? '#48f5c7' : '#ffe074'};background:radial-gradient(circle, ${mode === 'UV_BLACKLIGHT' ? 'rgba(162,112,255,0.28)' : mode === 'XRAY_CRATE' ? 'rgba(72,245,199,0.25)' : 'rgba(255,224,116,0.26)'} 0%, rgba(0,0,0,0) 70%);left:50%;top:50%;"></div>
    </div>
  `;

  const field = ctx.stageEl.querySelector<HTMLElement>('#v6bmField')!;
  const glow = ctx.stageEl.querySelector<HTMLElement>('#v6bmGlow')!;
  const batEl = ctx.stageEl.querySelector<HTMLElement>('#v6bmBat');

  const updateBeam = (clientX: number, clientY: number) => {
    const rect = field.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) return;
    beamX = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    beamY = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    glow.style.left = `${beamX}%`;
    glow.style.top = `${beamY}%`;

    field.querySelectorAll<HTMLElement>('[data-scan]').forEach((btn) => {
      const idx = Number(btn.dataset.scan);
      const bRect = btn.getBoundingClientRect();
      const bx = bRect.left + bRect.width / 2;
      const by = bRect.top + bRect.height / 2;
      const dist = Math.hypot(clientX - bx, clientY - by);
      const vis = dist < 105 ? 1 : revealedSet.has(idx) ? 0.55 : 0.08;
      if (dist < 95) revealedSet.add(idx);
      const txt = btn.querySelector<HTMLElement>(`[data-scantxt="${idx}"]`);
      if (txt) txt.style.opacity = String(vis);
    });
  };

  let activeDrag = false;
  const onDown = (e: PointerEvent) => { activeDrag = true; updateBeam(e.clientX, e.clientY); };
  const onMove = (e: PointerEvent) => { if (activeDrag || e.pointerType === 'mouse') updateBeam(e.clientX, e.clientY); };
  const onUp = () => { activeDrag = false; };
  field.addEventListener('pointerdown', onDown);
  field.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  ctx.addCleanup(() => {
    field.removeEventListener('pointerdown', onDown);
    field.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  });

  if (mode === 'SPOTLIGHT_BLACKOUT') {
    const drain = window.setInterval(() => {
      if (ctx.isResolved()) return;
      battery = Math.max(0, battery - 2);
      if (batEl) batEl.textContent = `BAT ${battery}%`;
      if (battery <= 0) {
        glow.style.opacity = '0.18';
      }
    }, 320);
    ctx.addCleanup(() => window.clearInterval(drain));
  }

  field.querySelectorAll<HTMLButtonElement>('[data-scan]').forEach((b) => {
    b.addEventListener('click', () => {
      if (ctx.isResolved()) return;
      const idx = Number(b.dataset.scan);
      if (!revealedSet.has(idx)) {
        // First tap illuminates it cleanly on touch screens!
        revealedSet.add(idx);
        const txt = b.querySelector<HTMLElement>(`[data-scantxt="${idx}"]`);
        if (txt) txt.style.opacity = '1';
        ctx.sfx('optical_beam_lock');
        return;
      }
      const ok = choices[idx].isCorrect;
      const truth = choices.find((c) => c.isCorrect)!.label;
      ctx.setResolved(ok, ok ? 1 : 0, `${mode.toLowerCase()}_${ok ? 'hit' : 'miss'}`, ok ? 'HIDDEN TRUTH EXPOSED!' : 'WRONG EVIDENCE!', `Truth: ${truth}`, ok && mode === 'SPOTLIGHT_BLACKOUT' ? 0.8 : 0);
    });
  });

  ctx.registerHintHandler(() => {
    field.querySelectorAll<HTMLElement>('[data-scantxt]').forEach((el) => { el.style.opacity = '1'; });
    choices.forEach((_, i) => revealedSet.add(i));
  });
  ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, `${mode.toLowerCase()}_timeout`, 'LIGHTS OUT!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`));
}

function buildForensicInstrumentToy(
  ctx: ToyBuildContext,
  mode: 'MICROFILM' | 'FINGERPRINT' | 'POLYGRAPH' | 'CIPHER' | 'JIGSAW' | 'PERISCOPE' | 'ALIBI' | 'RED_STRING',
): void {
  const choices = getNormalizedChoices(ctx.clue);

  if (mode === 'MICROFILM' || mode === 'PERISCOPE') {
    let frameIdx = 0;
    const render = () => {
      const cur = choices[frameIdx];
      const bearing = frameIdx * 90 + 45;
      ctx.stageEl.innerHTML = `
        <div class="v6tb-visual-bay" style="flex-direction:column;gap:6px;padding:10px;background:${mode === 'PERISCOPE' ? 'radial-gradient(circle,#123e3b 0%,#051414 78%)' : 'radial-gradient(circle,#262417 0%,#0d0c08 82%)'};">
          <div style="font-size:10px;font-weight:900;color:${mode === 'PERISCOPE' ? '#48f5cb' : '#f5a942'};letter-spacing:0.12em;">
            ${mode === 'PERISCOPE' ? `BEARING ${String(bearing).padStart(3, '0')}° · TARGET ${frameIdx + 1}/4` : `REEL FRAME #0${frameIdx + 1} OF 04`}
          </div>
          <div style="font-size:clamp(15px,2.8dvh,21px);font-weight:900;color:#fff8e6;text-align:center;padding:8px 14px;border:2px solid ${mode === 'PERISCOPE' ? '#48f5cb' : '#f5a942'};border-radius:10px;background:rgba(0,0,0,0.55);max-width:92%;">
            ${escapeHtml(cur.label)}
          </div>
          <div style="display:flex;gap:6px;">
            ${[0, 1, 2, 3].map((i) => `<span style="width:18px;height:5px;border-radius:3px;background:${i === frameIdx ? '#ffe074' : 'rgba(255,255,255,0.2)'};"></span>`).join('')}
          </div>
        </div>
        <div class="v6tb-row">
          <button type="button" class="v6tb-knob-btn" id="v6mfPrev" style="flex:0 0 88px;">◀ CRANK</button>
          <button type="button" class="v6tb-lever-btn emerald" id="v6mfStamp" style="flex:1;">${mode === 'PERISCOPE' ? 'FIRE TARGET LOCK' : 'STAMP EVIDENCE'}</button>
          <button type="button" class="v6tb-knob-btn" id="v6mfNext" style="flex:0 0 88px;">CRANK ▶</button>
        </div>
      `;
      ctx.stageEl.querySelector('#v6mfPrev')?.addEventListener('click', () => {
        frameIdx = (frameIdx + 3) % 4;
        ctx.sfx('rotary_knob_click');
        render();
      });
      ctx.stageEl.querySelector('#v6mfNext')?.addEventListener('click', () => {
        frameIdx = (frameIdx + 1) % 4;
        ctx.sfx('rotary_knob_click');
        render();
      });
      ctx.stageEl.querySelector('#v6mfStamp')?.addEventListener('click', submit);
    };
    const submit = () => {
      if (ctx.isResolved()) return;
      const ok = choices[frameIdx].isCorrect;
      ctx.setResolved(ok, ok ? 1 : 0, `${mode.toLowerCase()}_locked`, ok ? 'TARGET CONFIRMED!' : 'WRONG FRAME!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`);
    };
    render();
    ctx.registerTimeoutHandler(submit);
    return;
  }

  if (mode === 'POLYGRAPH') {
    let probedIdx: number | null = null;
    let phase = 0;
    ctx.stageEl.innerHTML = `
      <div class="v6tb-visual-bay" style="flex-direction:column;padding:6px;gap:4px;">
        <div style="font-size:10px;font-weight:900;color:#46f0a5;letter-spacing:0.08em;" id="v6pgStatus">TAP ANY OPTION TO TEST POLYGRAPH NEEDLE, THEN LOCK TRUTH</div>
        <svg viewBox="0 0 320 56" width="100%" height="56">
          <rect x="0" y="0" width="320" height="56" fill="#101812" stroke="#4f7556" stroke-width="1"/>
          <line x1="0" y1="28" x2="320" y2="28" stroke="rgba(70,240,165,0.2)" stroke-dasharray="4 4"/>
          <path id="v6pgWave" d="M 0 28 L 320 28" fill="none" stroke="#46f0a5" stroke-width="2.2"/>
        </svg>
      </div>
      <div class="v6tb-grid-2">
        ${choices.map((c, idx) => `
          <button type="button" class="v6tb-plaque" data-pg="${idx}">
            <span class="v6tb-plaque-key">${idx + 1}</span>
            <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
          </button>
        `).join('')}
      </div>
      <button type="button" class="v6tb-lever-btn" id="v6pgLock" disabled>LOCK VERIFIED TRUTH</button>
    `;

    const waveEl = ctx.stageEl.querySelector<SVGPathElement>('#v6pgWave')!;
    const statusEl = ctx.stageEl.querySelector<HTMLElement>('#v6pgStatus')!;
    const lockBtn = ctx.stageEl.querySelector<HTMLButtonElement>('#v6pgLock')!;

    let raf = 0;
    const tick = () => {
      phase += 0.22;
      const isCalm = probedIdx !== null && choices[probedIdx].isCorrect;
      const amp = probedIdx === null ? 3 : isCalm ? 5 : 18;
      const freq = probedIdx === null ? 0.08 : isCalm ? 0.09 : 0.34;
      let d = 'M 0 28';
      for (let x = 0; x <= 320; x += 6) {
        const y = 28 + Math.sin(x * freq + phase) * amp * Math.cos(x * 0.03);
        d += ` L ${x} ${y.toFixed(1)}`;
      }
      waveEl.setAttribute('d', d);
      waveEl.setAttribute('stroke', probedIdx === null ? '#7adba8' : isCalm ? '#36e896' : '#ff5266');
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    ctx.addCleanup(() => window.cancelAnimationFrame(raf));

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-pg]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        probedIdx = Number(b.dataset.pg);
        ctx.stageEl.querySelectorAll('.v6tb-plaque').forEach((p) => p.classList.remove('selected'));
        b.classList.add('selected');
        lockBtn.disabled = false;
        statusEl.textContent = `TESTING #${probedIdx + 1}: ${choices[probedIdx].isCorrect ? 'STEADY ALPHA BASELINE' : 'ELEVATED STRESS NEEDLE!'}`;
        ctx.sfx('nixie_spark_crackle');
      });
    });

    const submit = () => {
      if (ctx.isResolved()) return;
      const ok = probedIdx !== null && choices[probedIdx].isCorrect;
      ctx.setResolved(ok, ok ? 1 : 0, ok ? 'polygraph_truth' : 'polygraph_fooled', ok ? 'VERIFIED TRUTH!' : 'FOOLED BY BLUFF!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`);
    };
    lockBtn.addEventListener('click', submit);
    ctx.registerTimeoutHandler(submit);
    return;
  }

  if (mode === 'CIPHER') {
    const truth = choices.find((c) => c.isCorrect)!.label;
    const shiftKey = 3 + (ctx.clue.qid % 4); // 3..6
    let dialOffset = 0;
    const shiftStr = (text: string, delta: number) => text.replace(/[A-Za-z]/g, (ch) => {
      const base = ch >= 'a' ? 97 : 65;
      return String.fromCharCode(((ch.charCodeAt(0) - base + delta + 260) % 26) + base);
    });
    const encoded = shiftStr(truth, shiftKey);

    const render = () => {
      const preview = shiftStr(encoded, -dialOffset);
      const aligned = dialOffset === shiftKey;
      ctx.stageEl.innerHTML = `
        <div class="v6tb-visual-bay" style="flex-direction:column;gap:6px;padding:8px;">
          <div style="font-size:10px;font-weight:900;color:#e6c26e;letter-spacing:0.1em;">CAESAR RING OFFSET: -${dialOffset} ${aligned ? '· SIGNAL LOCKED!' : ''}</div>
          <div class="v6tb-nixie" style="font-size:clamp(14px,2.3dvh,19px);color:${aligned ? '#46f0a5' : '#ff9f43'};">${escapeHtml(preview)}</div>
          <div class="v6tb-row" style="justify-content:center;">
            <button type="button" class="v6tb-knob-btn" id="v6cpDec">◀ ROTATE -1</button>
            <button type="button" class="v6tb-knob-btn" id="v6cpInc">ROTATE +1 ▶</button>
          </div>
        </div>
        <div class="v6tb-grid-2">
          ${choices.map((c, idx) => `
            <button type="button" class="v6tb-plaque" data-pick="${idx}">
              <span class="v6tb-plaque-key">${idx + 1}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `).join('')}
        </div>
      `;
      ctx.stageEl.querySelector('#v6cpDec')?.addEventListener('click', () => { dialOffset = (dialOffset + 7) % 8; ctx.sfx('cryptex_stone_tumbler'); render(); });
      ctx.stageEl.querySelector('#v6cpInc')?.addEventListener('click', () => { dialOffset = (dialOffset + 1) % 8; ctx.sfx('cryptex_stone_tumbler'); render(); });
      ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((b) => {
        b.addEventListener('click', () => {
          if (ctx.isResolved()) return;
          const ok = choices[Number(b.dataset.pick)].isCorrect;
          ctx.setResolved(ok, ok ? 1 : 0, ok ? 'cipher_cracked' : 'cipher_wrong', ok ? 'CIPHER DECODED!' : 'WRONG DECODE!', `Decoded: ${truth}`, ok && aligned ? 0.6 : 0);
        });
      });
    };
    render();
    ctx.registerHintHandler(() => { dialOffset = shiftKey; ctx.sfx('optical_beam_lock'); render(); });
    ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'cipher_timeout', 'SIGNAL LOST!', `Decoded: ${truth}`));
    return;
  }

  // FINGERPRINT / JIGSAW / ALIBI / RED_STRING — Tactile Dossier Investigation Mechanics
  let linkedIdx: number | null = null;
  const straightened = new Set<number>();
  const targetRidgeType = ctx.clue.qid % 3; // 0=WHORL, 1=LOOP, 2=ARCH
  const ridgeNames = ['WHORL', 'LOOP', 'ARCH'];

  const render = () => {
    const headerNote = mode === 'FINGERPRINT'
      ? `CRIME SCENE RIDGE CLASS: ${ridgeNames[targetRidgeType]} — MATCH EVIDENCE CARD`
      : mode === 'JIGSAW'
        ? 'TAP CROOKED SHREDS TO STRAIGHTEN, THEN LOCK THE TRUE SHRED'
        : mode === 'RED_STRING'
          ? 'PIN THE CRIMSON STRING FROM CENTER POLAROID TO TRUTH'
          : 'CROSS-CHECK CASE TIMESTAMPS & STAMP VERIFIED ALIBI';

    ctx.stageEl.innerHTML = `
      <div style="font-size:10.5px;font-weight:900;color:#ffe082;text-align:center;letter-spacing:0.06em;">${headerNote}</div>
      <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
        ${choices.map((c, idx) => {
          const rot = mode === 'JIGSAW' && !straightened.has(idx) ? (idx % 2 === 0 ? -9 : 9) : 0;
          const badge = mode === 'FINGERPRINT'
            ? ridgeNames[c.isCorrect ? targetRidgeType : (targetRidgeType + 1 + (idx % 2)) % 3]
            : mode === 'ALIBI'
              ? (c.isCorrect ? '09:15 VERIFIED' : `0${7 + idx}:40 GAP`)
              : `#${idx + 1}`;
          return `
            <button type="button" class="v6tb-plaque ${linkedIdx === idx ? 'selected' : ''}" data-item="${idx}" style="transform:rotate(${rot}deg);flex-direction:column;align-items:flex-start;gap:4px;">
              <span style="font-size:9.5px;font-weight:900;color:${mode === 'RED_STRING' ? '#ff6b7a' : '#5ef2c6'};letter-spacing:0.08em;">${badge}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `;
        }).join('')}
      </div>
      <button type="button" class="v6tb-lever-btn ${mode === 'RED_STRING' ? 'crimson' : ''}" id="v6frLock" ${linkedIdx === null ? 'disabled' : ''}>
        ${mode === 'RED_STRING' ? 'PIN RED STRING TO CASE' : 'STAMP FORENSIC VERDICT'}
      </button>
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-item]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const i = Number(b.dataset.item);
        if (mode === 'JIGSAW' && !straightened.has(i)) {
          straightened.add(i);
          ctx.sfx('foil_card_flick');
        }
        linkedIdx = i;
        ctx.sfx('ui_brass_tap');
        render();
      });
    });
    ctx.stageEl.querySelector('#v6frLock')?.addEventListener('click', submit);
  };

  const submit = () => {
    if (ctx.isResolved()) return;
    const ok = linkedIdx !== null && choices[linkedIdx].isCorrect;
    ctx.setResolved(ok, ok ? 1 : 0, `${mode.toLowerCase()}_${ok ? 'solved' : 'miss'}`, ok ? 'CASE CLOSED!' : 'FALSE LEAD!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`);
  };
  render();
  ctx.registerTimeoutHandler(submit);
}

// ============================================================================
// FAMILY IX BUILDERS (Toys 81–90: KINETIC_CONTRAPTIONS)
// ============================================================================

function buildKineticTimedContraption(
  ctx: ToyBuildContext,
  mode: 'RING_TOSS' | 'STEAM_HOLD' | 'PENDULUM' | 'SHOOTING_GALLERY',
): void {
  const choices = getNormalizedChoices(ctx.clue);

  if (mode === 'SHOOTING_GALLERY') {
    let phase = 0;
    ctx.stageEl.innerHTML = `
      <div class="v6tb-visual-bay" style="flex:1 1 0;flex-direction:column;justify-content:space-around;padding:8px;overflow:hidden;">
        ${[0, 1].map((row) => `
          <div style="width:100%;display:flex;justify-content:space-around;gap:8px;position:relative;" id="v6sgRow${row}">
            ${choices.slice(row * 2, row * 2 + 2).map((c, j) => {
              const idx = row * 2 + j;
              return `
                <button type="button" class="v6tb-plaque" data-plate="${idx}" style="width:45%;justify-content:center;text-align:center;border-color:#ffaa4c;">
                  <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
                </button>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    `;
    const r0 = ctx.stageEl.querySelector<HTMLElement>('#v6sgRow0')!;
    const r1 = ctx.stageEl.querySelector<HTMLElement>('#v6sgRow1')!;
    let raf = 0;
    const animate = () => {
      phase += 0.032;
      r0.style.transform = `translateX(${(Math.sin(phase) * 18).toFixed(1)}px)`;
      r1.style.transform = `translateX(${(-Math.sin(phase * 1.15) * 18).toFixed(1)}px)`;
      raf = window.requestAnimationFrame(animate);
    };
    raf = window.requestAnimationFrame(animate);
    ctx.addCleanup(() => window.cancelAnimationFrame(raf));

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-plate]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const idx = Number(b.dataset.plate);
        const ok = choices[idx].isCorrect;
        ctx.sfx(ok ? 'paddle_spring_slam' : 'trapdoor_hinge_drop');
        ctx.setResolved(ok, ok ? 1 : 0, ok ? 'gallery_bullseye' : 'gallery_miss', ok ? 'PING! TARGET FLIPPED!' : 'WRONG DUCK!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`, ok ? 0.5 : 0);
      });
    });
    ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'gallery_timeout', 'GALLERY CLOSED!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`));
    return;
  }

  if (mode === 'STEAM_HOLD') {
    let pressure = 0; // 0..100
    let holding = false;
    ctx.stageEl.innerHTML = `
      <div class="v6tb-visual-bay" style="flex-direction:column;gap:8px;padding:10px;">
        <div style="width:100%;height:18px;border-radius:999px;background:#120b07;border:2px solid #d4a84c;overflow:hidden;position:relative;">
          <div id="v6stBar" style="height:100%;width:0%;background:linear-gradient(90deg,#38e49b,#f2c14e,#ff4d5a);"></div>
        </div>
        <div class="v6tb-grid-4">
          ${choices.map((c, i) => `
            <div data-zone="${i}" style="border:1.5px solid #b88e3d;border-radius:8px;padding:5px;text-align:center;font-size:10.5px;font-weight:800;background:#1e130c;cursor:pointer;">
              <div style="color:#f5c754;font-size:9px;">${i * 25}-${(i + 1) * 25}%</div>
              <div>${escapeHtml(c.label)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <button type="button" class="v6tb-lever-btn crimson" id="v6stHold">HOLD STEAM THROTTLE · RELEASE IN ZONE</button>
    `;
    const bar = ctx.stageEl.querySelector<HTMLElement>('#v6stBar')!;
    const holdBtn = ctx.stageEl.querySelector<HTMLButtonElement>('#v6stHold')!;
    let raf = 0;
    const tick = () => {
      if (holding && !ctx.isResolved()) {
        pressure = (pressure + 0.85) % 100;
        bar.style.width = `${pressure.toFixed(1)}%`;
        const activeZone = Math.min(3, Math.floor(pressure / 25));
        ctx.stageEl.querySelectorAll<HTMLElement>('[data-zone]').forEach((z, i) => {
          z.style.borderColor = i === activeZone ? '#46f0a5' : '#b88e3d';
          z.style.background = i === activeZone ? '#12422d' : '#1e130c';
        });
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    ctx.addCleanup(() => window.cancelAnimationFrame(raf));

    const releaseZone = (forcedZone?: number) => {
      if (ctx.isResolved()) return;
      holding = false;
      const zoneIdx = forcedZone ?? Math.min(3, Math.floor(pressure / 25));
      const ok = choices[zoneIdx].isCorrect;
      ctx.sfx('pneumatic_piston_slam');
      ctx.setResolved(ok, ok ? 1 : 0, ok ? 'steam_zone_locked' : 'steam_overpressured', ok ? 'PRESSURE EQUALIZED!' : 'WRONG PRESSURE BAND!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`, ok ? 0.5 : 0);
    };
    holdBtn.addEventListener('pointerdown', () => { holding = true; ctx.sfx('brass_gear_detent'); });
    holdBtn.addEventListener('pointerup', () => { if (holding) releaseZone(); });
    // Accessible direct zone tap fallback for 1-thumb mobile play
    ctx.stageEl.querySelectorAll<HTMLElement>('[data-zone]').forEach((z) => {
      z.addEventListener('click', () => releaseZone(Number(z.dataset.zone)));
    });
    ctx.registerTimeoutHandler(() => releaseZone());
    return;
  }

  // RING_TOSS or PENDULUM (Oscillating cursor sweeping across 4 targets!)
  let t = 0;
  let activeSlot = 0;
  ctx.stageEl.innerHTML = `
    <div class="v6tb-visual-bay" style="flex-direction:column;gap:8px;padding:8px;">
      <svg viewBox="0 0 320 56" width="100%" height="56">
        <line x1="20" y1="48" x2="300" y2="48" stroke="#c89d47" stroke-width="2"/>
        ${mode === 'PENDULUM'
          ? `<line id="v6kpArm" x1="160" y1="4" x2="160" y2="42" stroke="#f2c14e" stroke-width="3"/><circle id="v6kpBob" cx="160" cy="42" r="10" fill="#38bdf8" stroke="#fff3c4" stroke-width="2"/>`
          : `<ellipse id="v6kpRing" cx="160" cy="30" rx="22" ry="8" fill="none" stroke="#ffd166" stroke-width="4"/>`}
      </svg>
      <div class="v6tb-grid-4">
        ${choices.map((c, idx) => `
          <button type="button" class="v6tb-plaque" data-peg="${idx}" style="padding:6px;justify-content:center;text-align:center;">
            <span class="v6tb-plaque-txt" style="font-size:11px;">${escapeHtml(c.label)}</span>
          </button>
        `).join('')}
      </div>
    </div>
    <button type="button" class="v6tb-lever-btn" id="v6kpFire">${mode === 'PENDULUM' ? 'ENERGIZE MAGNET CLAMP!' : 'TOSS BRASS RING!'}</button>
  `;

  const arm = ctx.stageEl.querySelector<SVGLineElement>('#v6kpArm');
  const bob = ctx.stageEl.querySelector<SVGCircleElement>('#v6kpBob');
  const ring = ctx.stageEl.querySelector<SVGEllipseElement>('#v6kpRing');
  const pegs = Array.from(ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-peg]'));

  let raf = 0;
  const tick = () => {
    t += 0.042;
    const norm = (Math.sin(t) + 1) / 2; // 0..1
    const cx = 42 + norm * 236;
    activeSlot = Math.min(3, Math.floor(norm * 4));
    if (arm && bob) {
      arm.setAttribute('x2', cx.toFixed(1));
      bob.setAttribute('cx', cx.toFixed(1));
    }
    if (ring) ring.setAttribute('cx', cx.toFixed(1));
    pegs.forEach((p, i) => p.classList.toggle('selected', i === activeSlot));
    raf = window.requestAnimationFrame(tick);
  };
  raf = window.requestAnimationFrame(tick);
  ctx.addCleanup(() => window.cancelAnimationFrame(raf));

  const fire = (slot: number) => {
    if (ctx.isResolved()) return;
    const ok = choices[slot].isCorrect;
    ctx.sfx(ok ? 'optical_beam_lock' : 'trapdoor_hinge_drop');
    ctx.setResolved(ok, ok ? 1 : 0, `${mode.toLowerCase()}_${ok ? 'hit' : 'miss'}`, ok ? (mode === 'PENDULUM' ? 'MAGNET CLAMPED!' : 'RINGER!') : 'MISSED THE PEG!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`, ok ? 0.55 : 0);
  };
  ctx.stageEl.querySelector('#v6kpFire')?.addEventListener('click', () => fire(activeSlot));
  pegs.forEach((p, i) => p.addEventListener('click', () => fire(i)));
  ctx.registerTimeoutHandler(() => fire(activeSlot));
}

function buildKineticSelectorContraption(
  ctx: ToyBuildContext,
  mode: 'CALLIOPE' | 'DEPTH_VALVE' | 'PRISM_BEAM' | 'GEARS' | 'AIRLOCK' | 'AURORA',
): void {
  const choices = getNormalizedChoices(ctx.clue);
  let aimIdx = 0;
  let boltsSealed = 0;

  const render = () => {
    const beamAngles = [-52, -18, 18, 52];
    const targetX = 48 + aimIdx * 74;
    ctx.stageEl.innerHTML = `
      <div class="v6tb-visual-bay" style="padding:6px;">
        <svg viewBox="0 0 320 88" width="100%" height="100%" style="max-height:110px;">
          ${mode === 'PRISM_BEAM' ? `
            <line x1="160" y1="84" x2="160" y2="52" stroke="#fff4cc" stroke-width="4"/>
            <line x1="160" y1="52" x2="${targetX}" y2="14" stroke="#5ef2c6" stroke-width="5" stroke-linecap="round"/>
            <polygon points="146,60 174,60 160,36" fill="rgba(110,235,245,0.45)" stroke="#fff" stroke-width="2"/>
            ${[0, 1, 2, 3].map((i) => `<circle cx="${48 + i * 74}" cy="14" r="9" fill="${i === aimIdx ? '#ffe074' : '#1b2940'}" stroke="#6ce5f0" stroke-width="2"/>`).join('')}
          ` : mode === 'CALLIOPE' ? `
            ${[0, 1, 2, 3].map((i) => {
              const h = 34 + i * 11;
              const x = 44 + i * 74;
              return `<rect x="${x - 14}" y="${82 - h}" width="28" height="${h}" rx="4" fill="${i === aimIdx ? '#ffba5c' : '#8d5128'}" stroke="#ffe09e" stroke-width="2"/>${i === aimIdx ? `<circle cx="${x}" cy="${74 - h}" r="7" fill="rgba(255,255,255,0.75)"/>` : ''}`;
            }).join('')}
          ` : mode === 'AURORA' ? `
            <line x1="160" y1="74" x2="${targetX}" y2="18" stroke="#5ef2c6" stroke-width="3.5" stroke-dasharray="5 3"/>
            <circle cx="160" cy="74" r="7" fill="#ffe074"/>
            ${[0, 1, 2, 3].map((i) => `<circle cx="${48 + i * 74}" cy="18" r="${i === aimIdx ? 9 : 6}" fill="${i === aimIdx ? '#5ef2c6' : '#8b74d6'}" stroke="#fff" stroke-width="1.5"/>`).join('')}
          ` : `
            <g transform="translate(160 44) rotate(${beamAngles[aimIdx]})">
              <circle cx="0" cy="0" r="32" fill="none" stroke="#e8b852" stroke-width="6" stroke-dasharray="${mode === 'GEARS' ? '8 5' : 'none'}"/>
              <line x1="0" y1="-32" x2="0" y2="32" stroke="#e8b852" stroke-width="4"/>
              <line x1="-32" y1="0" x2="32" y2="0" stroke="#e8b852" stroke-width="4"/>
              <circle cx="0" cy="-24" r="5" fill="#45e3cf"/>
            </g>
            <text x="160" y="84" fill="#ffe082" font-size="10" font-weight="900" text-anchor="middle">CHAMBER #${aimIdx + 1} ALIGNED${mode === 'AIRLOCK' ? ` · BOLTS ${boltsSealed}/2` : ''}</text>
          `}
        </svg>
      </div>
      <div class="v6tb-grid-2">
        ${choices.map((c, idx) => `
          <button type="button" class="v6tb-plaque ${aimIdx === idx ? 'selected' : ''}" data-aim="${idx}">
            <span class="v6tb-plaque-key">${idx + 1}</span>
            <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
          </button>
        `).join('')}
      </div>
      ${mode === 'AIRLOCK' ? `
        <div class="v6tb-grid-2">
          <button type="button" class="v6tb-lever-btn" id="v6alBolt">SEAL BOLT (${boltsSealed}/2)</button>
          <button type="button" class="v6tb-lever-btn emerald" id="v6knLock" ${boltsSealed < 2 ? 'disabled' : ''}>LOCK AIRLOCK</button>
        </div>
      ` : `<button type="button" class="v6tb-lever-btn emerald" id="v6knLock">ENGAGE CONTRAPTION</button>`}
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-aim]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        aimIdx = Number(b.dataset.aim);
        ctx.sfx(mode === 'CALLIOPE' ? 'streak_chord_1' : 'brass_gear_detent');
        render();
      });
    });
    ctx.stageEl.querySelector('#v6alBolt')?.addEventListener('click', () => {
      if (boltsSealed < 2) {
        boltsSealed += 1;
        ctx.sfx('vault_heavy_unlock');
        render();
      }
    });
    ctx.stageEl.querySelector('#v6knLock')?.addEventListener('click', submit);
  };

  const submit = () => {
    if (ctx.isResolved()) return;
    const ok = choices[aimIdx].isCorrect;
    ctx.setResolved(ok, ok ? 1 : 0, `${mode.toLowerCase()}_${ok ? 'engaged' : 'jammed'}`, ok ? 'CONTRAPTION LOCKED!' : 'MECHANISM JAMMED!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`, ok ? 0.45 : 0);
  };
  render();
  ctx.registerTimeoutHandler(submit);
}

// ============================================================================
// FAMILY X BUILDERS (Toys 91–100: MIND_GAME_TWISTS!)
// ============================================================================

function buildSpotHostsLie(ctx: ToyBuildContext): void {
  const lie = deriveHostLiePayload(ctx.clue);
  ctx.promptEl.textContent = `Julian claims the cue card below is 100% factual — TAP THE ONE CORRUPTED WORD!`;

  ctx.stageEl.innerHTML = `
    <div class="v6tb-visual-bay" style="flex:1 1 0;flex-direction:column;padding:10px;gap:8px;">
      <div style="font-size:10px;font-weight:900;color:#ff99a8;letter-spacing:0.1em;">JULIAN'S STUDIO CUE CARD — TAP THE LIE</div>
      <div class="v6tb-word-wrap" id="v6slWords">
        ${lie.tokens.map((tok, idx) => `<button type="button" class="v6tb-word-chip" data-tok="${idx}">${escapeHtml(tok)}</button>`).join('')}
      </div>
    </div>
  `;

  ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-tok]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (ctx.isResolved()) return;
      const idx = Number(btn.dataset.tok);
      const ok = idx === lie.lieIndex;
      btn.classList.add(ok ? 'correct' : 'wrong');
      ctx.sfx(ok ? 'screw_rival_slam' : 'trapdoor_hinge_drop');
      ctx.setResolved(
        ok,
        ok ? 1 : 0,
        ok ? 'caught_hosts_lie' : 'missed_hosts_lie',
        ok ? 'LIAR CAUGHT RED-HANDED!' : 'THAT WORD WAS TRUE!',
        `"${lie.lieToken}" was the lie — Truth: ${lie.truthCorrection}`,
        ok ? 0.9 : 0,
      );
    });
  });

  ctx.registerHintHandler(() => {
    const lieBtn = ctx.stageEl.querySelector<HTMLButtonElement>(`[data-tok="${lie.lieIndex}"]`);
    if (lieBtn) lieBtn.style.borderColor = '#ff5d73';
  });
  ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'host_lie_timeout', 'JULIAN GOT AWAY WITH IT!', `Lie was "${lie.lieToken}" -> ${lie.truthCorrection}`));
}

function buildReverseJeopardy(ctx: ToyBuildContext): void {
  const choices = getNormalizedChoices(ctx.clue);
  const truth = choices.find((c) => c.isCorrect)!;
  const decoys = choices.filter((c) => !c.isCorrect);
  // 3 clues point TO the marquee answer; 1 odd-out clue points to a decoy!
  const oddOutLabel = `Does NOT match "${truth.label}" — points to ${decoys[0]?.label ?? 'an unrelated entry'}`;
  const clueCards = [
    { text: ctx.clue.prompt, isOddOut: false },
    { text: `Studio dossier confirms this belongs under ${ctx.clue.categoryLabel}: ${truth.label.slice(0, 1)}•••`, isOddOut: false },
    { text: `Directly linked to the answer displayed on the marquee above`, isOddOut: false },
    { text: oddOutLabel, isOddOut: true },
  ];
  const rng = seededRand(ctx.clue.qid * 29 + 19);
  for (let i = clueCards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [clueCards[i], clueCards[j]] = [clueCards[j], clueCards[i]];
  }

  ctx.stageEl.innerHTML = `
    <div style="text-align:center;padding:6px 10px;border:2px solid #ffe074;border-radius:10px;background:linear-gradient(180deg,#3d2608,#1d1103);">
      <div style="font-size:9.5px;font-weight:900;color:#e6c47a;letter-spacing:0.12em;">LOCKED MARQUEE ANSWER</div>
      <div style="font-size:clamp(16px,2.7dvh,22px);font-weight:900;color:#ffe47c;">${escapeHtml(truth.label)}</div>
    </div>
    <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
      ${clueCards.map((c, idx) => `
        <button type="button" class="v6tb-plaque" data-rj="${idx}">
          <span class="v6tb-plaque-key">${idx + 1}</span>
          <span class="v6tb-plaque-txt">${escapeHtml(c.text)}</span>
        </button>
      `).join('')}
    </div>
  `;

  ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-rj]').forEach((b) => {
    b.addEventListener('click', () => {
      if (ctx.isResolved()) return;
      const ok = clueCards[Number(b.dataset.rj)].isOddOut;
      ctx.setResolved(ok, ok ? 1 : 0, ok ? 'reverse_jeopardy_clear' : 'reverse_jeopardy_miss', ok ? 'ODD-OUT ELIMINATED!' : 'THAT ONE MATCHED!', `Marquee Answer: ${truth.label}`, ok ? 0.95 : 0);
    });
  });
  ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'reverse_jeopardy_timeout', 'TIME EXPIRED!', `Marquee Answer: ${truth.label}`));
}

function buildRivalCursedWire(ctx: ToyBuildContext): void {
  const choices = getNormalizedChoices(ctx.clue);
  const wrongIndices = choices.map((c, i) => (c.isCorrect ? -1 : i)).filter((i) => i >= 0);
  const cursedIdx = wrongIndices[ctx.clue.qid % wrongIndices.length];
  const cutSet = new Set<number>();
  const wireColors = ['#ff5566', '#45b6fe', '#f7c852', '#46e59c'];

  const render = () => {
    const safeWrongRemaining = wrongIndices.filter((i) => i !== cursedIdx && !cutSet.has(i)).length;
    ctx.stageEl.innerHTML = `
      <div style="font-size:11px;font-weight:900;text-align:center;color:#ff99a8;letter-spacing:0.06em;">
        CUT ${safeWrongRemaining} MORE SAFE DECOY WIRE${safeWrongRemaining === 1 ? '' : 'S'} · DODGE TRUTH &amp; ${escapeHtml(ctx.rivalName.toUpperCase())}'S CURSE!
      </div>
      <div class="v6tb-stack" style="flex:1 1 0;justify-content:center;">
        ${choices.map((c, idx) => {
          const isCut = cutSet.has(idx);
          const isCursed = idx === cursedIdx;
          return `
            <button type="button" class="v6tb-plaque ${isCut ? 'eliminated' : ''}" data-wire="${idx}" style="border-color:${isCursed ? '#ff3850' : wireColors[idx]};justify-content:space-between;">
              <span style="display:flex;align-items:center;gap:7px;min-width:0;">
                <span class="v6tb-plaque-key" style="background:${wireColors[idx]};color:#120a05;">${SVG_ICONS.scissors}</span>
                <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
              </span>
              <span style="font-size:9.5px;font-weight:900;padding:2px 6px;border-radius:6px;background:${isCut ? '#14593a' : isCursed ? '#7d1120' : '#261a10'};color:${isCut ? '#6cf7b8' : isCursed ? '#ffb8c0' : '#e6c989'};flex-shrink:0;">
                ${isCut ? 'SNIPPED' : isCursed ? 'CURSED -3.5s' : 'LIVE'}
              </span>
            </button>
          `;
        }).join('')}
      </div>
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-wire]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const idx = Number(b.dataset.wire);
        if (choices[idx].isCorrect) {
          ctx.sfx('trapdoor_hinge_drop');
          ctx.setResolved(false, 0, 'cut_truth_wire', 'CUT THE LIVE TRUTH WIRE!', `Truth was: ${choices[idx].label}`);
          return;
        }
        if (idx === cursedIdx) {
          ctx.sfx('nixie_spark_crackle');
          ctx.adjustTime(-3.5);
          cutSet.add(idx);
          render();
          return;
        }
        cutSet.add(idx);
        ctx.sfx('wire_cutter_snip');
        const rem = wrongIndices.filter((i) => i !== cursedIdx && !cutSet.has(i)).length;
        if (rem === 0) {
          ctx.setResolved(true, 1, 'cursed_bomb_defused', 'BOMB DEFUSED AROUND CURSE!', `Protected Truth: ${choices.find((c) => c.isCorrect)!.label}`, 1.0);
        } else {
          render();
        }
      });
    });
  };

  render();
  ctx.registerFoilHandler((kind) => {
    if (kind === 'DEFUSE_ONE_WIRE') {
      const target = wrongIndices.find((i) => i !== cursedIdx && !cutSet.has(i));
      if (target !== undefined) { cutSet.add(target); render(); return true; }
    }
    return false;
  });
  ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'cursed_wire_boom', 'DETONATED!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`));
}

function buildTwoTruthsSabotage(ctx: ToyBuildContext): void {
  const choices = getNormalizedChoices(ctx.clue);
  const truth = choices.find((c) => c.isCorrect)!;
  const sabotage = choices.find((c) => !c.isCorrect)!;
  const cards = [
    { text: `REAL RECORD: "${truth.label}" is the verified answer to this ${ctx.clue.categoryLabel} dossier.`, isSabotage: false },
    { text: `STUDIO FACT: Category "${ctx.clue.categoryLabel}" is calibrated at Tier ${ctx.clue.difficultyBadge}.`, isSabotage: false },
    { text: `RECORD CLAIM: "${sabotage.label}" is the true answer to today's clue.`, isSabotage: true },
  ];
  const rng = seededRand(ctx.clue.qid * 19 + 7);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  ctx.stageEl.innerHTML = `
    <div class="v6tb-stack" style="flex:1 1 0;justify-content:center;">
      ${cards.map((c, idx) => `
        <button type="button" class="v6tb-plaque" data-sab="${idx}" style="padding:10px 12px;">
          <span class="v6tb-plaque-key">${idx + 1}</span>
          <span class="v6tb-plaque-txt">${escapeHtml(c.text)}</span>
        </button>
      `).join('')}
    </div>
  `;
  ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-sab]').forEach((b) => {
    b.addEventListener('click', () => {
      if (ctx.isResolved()) return;
      const ok = cards[Number(b.dataset.sab)].isSabotage;
      ctx.setResolved(ok, ok ? 1 : 0, ok ? 'sabotage_exposed' : 'stamped_truth', ok ? 'SABOTAGE EXPOSED!' : 'THAT CLAIM WAS TRUE!', `Sabotage tried to pass off: ${sabotage.label}`, ok ? 0.85 : 0);
    });
  });
  ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'sabotage_timeout', 'SABOTAGE ESCAPED!', `Fake claim used: ${sabotage.label}`));
}

function buildDefibrillatorBlitz(ctx: ToyBuildContext): void {
  const bin = deriveBinaryPayload(ctx.clue);
  let idx = 0;
  let hits = 0;

  const render = () => {
    const item = bin.items[idx];
    ctx.stageEl.innerHTML = `
      <div class="v6tb-visual-bay" style="flex-direction:column;gap:8px;padding:10px;">
        <div style="font-size:10px;font-weight:900;color:#46f0a5;letter-spacing:0.12em;">DEFIBRILLATOR CHARGE ${idx + 1} / ${bin.items.length} · HIT FOR +2.0s!</div>
        <div style="font-size:clamp(16px,2.8dvh,22px);font-weight:900;color:#fff7e0;text-align:center;">${escapeHtml(item.text)}</div>
      </div>
      <div class="v6tb-grid-2">
        <button type="button" class="v6tb-lever-btn emerald" data-defib="0">${SVG_ICONS.bolt} ${escapeHtml(bin.optionA.slice(0, 14))}</button>
        <button type="button" class="v6tb-lever-btn crimson" data-defib="1">${SVG_ICONS.bolt} ${escapeHtml(bin.optionB.slice(0, 14))}</button>
      </div>
    `;
    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-defib]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const ok = Number(b.dataset.defib) === item.bucket;
        if (ok) {
          hits += 1;
          ctx.adjustTime(2.0);
          ctx.sfx('streak_chord_3');
        } else {
          ctx.sfx('trapdoor_hinge_drop');
        }
        idx += 1;
        if (idx >= bin.items.length) {
          const won = hits >= Math.ceil(bin.items.length * 0.75);
          ctx.setResolved(won, hits / bin.items.length, won ? 'defib_blitz_cleared' : 'defib_flatline', won ? `HEARTBEAT SAVED (${hits}/${bin.items.length})!` : 'FLATLINED!', 'Each hit surged +2.0s onto the stage clock!', won ? 1.25 : 0);
        } else {
          render();
        }
      });
    });
  };
  render();
  ctx.registerTimeoutHandler(() => ctx.setResolved(false, hits / bin.items.length, 'defib_flatline', 'FLATLINED AT 0.0s!', `Cleared ${hits}/${bin.items.length} charges`));
}

function buildMirrorScriptTilt(ctx: ToyBuildContext): void {
  const choices = getNormalizedChoices(ctx.clue);
  let angle = 0; // 0 = fully mirrored (-1), 100 = fully readable (+1)
  ctx.promptEl.textContent = 'Angle the brass mirror dial until the backwards clue snaps upright, then pick the truth!';

  ctx.stageEl.innerHTML = `
    <div class="v6tb-visual-bay" style="flex-direction:column;gap:6px;padding:10px;text-align:center;">
      <div id="v6msText" style="font-family:Georgia,serif;font-size:clamp(13px,2.1dvh,16px);font-weight:800;color:#ffe8a6;transform:scaleX(-1);transition:transform 0.08s linear;">
        ${escapeHtml(ctx.clue.prompt)}
      </div>
      <div class="v6tb-caliper-track" id="v6msTrack" style="height:28px;">
        <div class="v6tb-caliper-fill" id="v6msFill"></div>
        <div class="v6tb-caliper-thumb" id="v6msThumb"></div>
      </div>
    </div>
    <div class="v6tb-grid-2">
      ${choices.map((c, idx) => `
        <button type="button" class="v6tb-plaque" data-pick="${idx}">
          <span class="v6tb-plaque-key">${String.fromCharCode(65 + idx)}</span>
          <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
        </button>
      `).join('')}
    </div>
  `;
  const txtEl = ctx.stageEl.querySelector<HTMLElement>('#v6msText')!;
  const cal = bindBrassCaliperTrack(
    ctx.stageEl.querySelector('#v6msTrack')!,
    ctx.stageEl.querySelector('#v6msFill')!,
    ctx.stageEl.querySelector('#v6msThumb')!,
    0,
    (r) => {
      angle = Math.round(r * 100);
      const scaleX = r >= 0.65 ? 1 : -1 + r * 0.5;
      txtEl.style.transform = `scaleX(${scaleX.toFixed(2)})`;
      txtEl.style.color = r >= 0.65 ? '#5ef2c6' : '#ffe8a6';
    },
    () => ctx.sfx('rotary_knob_click'),
    ctx.addCleanup,
  );
  ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((b) => {
    b.addEventListener('click', () => {
      if (ctx.isResolved()) return;
      const ok = choices[Number(b.dataset.pick)].isCorrect;
      ctx.setResolved(ok, ok ? 1 : 0, ok ? 'mirror_script_solved' : 'mirror_script_miss', ok ? 'MIRROR CRACKED!' : 'WRONG REFLECTION!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`, ok && angle < 30 ? 1.1 : ok ? 0.7 : 0);
    });
  });
  ctx.registerHintHandler(() => { cal.setRatio(1); txtEl.style.transform = 'scaleX(1)'; txtEl.style.color = '#5ef2c6'; });
  ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'mirror_timeout', 'MIRROR SHATTERED!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`));
}

function buildDominoDualLink(ctx: ToyBuildContext): void {
  const choices = getNormalizedChoices(ctx.clue);
  const truth = choices.find((c) => c.isCorrect)!;
  const firstLetter = (truth.label.match(/[A-Za-z0-9]/)?.[0] ?? 'A').toUpperCase();
  const fakeLetter = firstLetter === 'A' ? 'M' : firstLetter === 'M' ? 'S' : 'A';
  const stageAOpts = ctx.clue.qid % 2 === 0 ? [firstLetter, fakeLetter] : [fakeLetter, firstLetter];
  let stageBUnlocked = false;

  const render = () => {
    ctx.stageEl.innerHTML = `
      <div class="v6tb-row" style="gap:8px;flex:1 1 0;min-height:0;align-items:stretch;">
        <div style="flex:0 0 40%;border:2px solid ${stageBUnlocked ? '#36e896' : '#ffe074'};border-radius:10px;background:#1d130b;padding:8px;display:flex;flex-direction:column;justify-content:center;gap:8px;text-align:center;">
          <div style="font-size:10px;font-weight:900;color:${stageBUnlocked ? '#46f0a5' : '#ffe074'};">${stageBUnlocked ? 'DOMINO A DROPPED ✓' : 'CLUE A: STARTS WITH?'}</div>
          <div class="v6tb-grid-2">
            ${stageAOpts.map((ch) => `<button type="button" class="v6tb-lever-btn" data-da="${ch}" ${stageBUnlocked ? 'disabled' : ''}>"${ch}"</button>`).join('')}
          </div>
        </div>
        <div style="flex:1;border:2px solid ${stageBUnlocked ? '#ffe074' : '#554632'};border-radius:10px;background:#16100a;padding:8px;display:flex;flex-direction:column;justify-content:center;gap:6px;opacity:${stageBUnlocked ? '1' : '0.42'};">
          <div style="font-size:10px;font-weight:900;color:#ffe074;text-align:center;">${stageBUnlocked ? 'CLUE B UNLOCKED — LOCK TRUTH!' : 'LOCKED BY DOMINO A'}</div>
          <div class="v6tb-stack">
            ${choices.map((c, idx) => `
              <button type="button" class="v6tb-plaque" data-db="${idx}" ${stageBUnlocked ? '' : 'disabled'} style="padding:6px 8px;">
                <span class="v6tb-plaque-key">${idx + 1}</span>
                <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-da]').forEach((b) => {
      b.addEventListener('click', () => {
        if (stageBUnlocked || ctx.isResolved()) return;
        if (b.dataset.da === firstLetter) {
          stageBUnlocked = true;
          ctx.sfx('brass_gear_detent');
          render();
        } else {
          ctx.sfx('trapdoor_hinge_drop');
          ctx.adjustTime(-2);
        }
      });
    });
    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-db]').forEach((b) => {
      b.addEventListener('click', () => {
        if (!stageBUnlocked || ctx.isResolved()) return;
        const ok = choices[Number(b.dataset.db)].isCorrect;
        ctx.setResolved(ok, ok ? 1 : 0, ok ? 'domino_dual_clear' : 'domino_stall', ok ? '2X DOMINO CHAIN!' : 'CHAIN BROKEN!', `Truth: ${truth.label}`, ok ? 1.0 : 0);
      });
    });
  };
  render();
  ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'domino_timeout', 'DOMINO STALLED!', `Truth: ${truth.label}`));
}

function buildBiddingWarRival(ctx: ToyBuildContext): void {
  const bin = deriveBinaryPayload(ctx.clue);
  const items = bin.items.slice(0, 4);
  let targetBid: number | null = null;
  let cleared = 0;
  let idx = 0;

  const render = () => {
    if (targetBid === null) {
      ctx.stageEl.innerHTML = `
        <div class="v6tb-visual-bay" style="flex-direction:column;gap:8px;padding:10px;text-align:center;">
          <div style="font-size:11px;font-weight:900;color:#ff99a8;">${escapeHtml(ctx.rivalName.toUpperCase())} BIDS: "I CAN NAIL 2 OF 4!"</div>
          <div style="font-size:13px;font-weight:700;color:#fff5db;">Raise the auction paddle to take control and prove your bid!</div>
        </div>
        <div class="v6tb-grid-3">
          <button type="button" class="v6tb-lever-btn emerald" data-bid="2">MATCH 2 (+0.5x)</button>
          <button type="button" class="v6tb-lever-btn" data-bid="3">OUTBID 3 (+1.1x)</button>
          <button type="button" class="v6tb-lever-btn crimson" data-bid="4">ALL-IN 4 (+2.0x)</button>
        </div>
      `;
      ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-bid]').forEach((b) => {
        b.addEventListener('click', () => {
          targetBid = Number(b.dataset.bid);
          ctx.sfx('paddle_spring_slam');
          render();
        });
      });
      return;
    }

    const cur = items[idx];
    ctx.stageEl.innerHTML = `
      <div class="v6tb-visual-bay" style="flex-direction:column;gap:6px;padding:10px;">
        <div style="font-size:10.5px;font-weight:900;color:#ffe074;">PROVE YOUR BID: ${cleared} / ${targetBid} NEEDED (CARD ${idx + 1}/${items.length})</div>
        <div style="font-size:clamp(16px,2.7dvh,21px);font-weight:900;color:#fff;">${escapeHtml(cur.text)}</div>
      </div>
      <div class="v6tb-grid-2">
        <button type="button" class="v6tb-lever-btn emerald" data-bw="0">${escapeHtml(bin.optionA.slice(0, 14))}</button>
        <button type="button" class="v6tb-lever-btn crimson" data-bw="1">${escapeHtml(bin.optionB.slice(0, 14))}</button>
      </div>
    `;
    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-bw]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved() || targetBid === null) return;
        const ok = Number(b.dataset.bw) === cur.bucket;
        if (ok) cleared += 1;
        ctx.sfx(ok ? 'crystal_hex_claim' : 'trapdoor_hinge_drop');
        idx += 1;
        if (cleared >= targetBid) {
          const multExtra = targetBid === 4 ? 2.0 : targetBid === 3 ? 1.1 : 0.5;
          ctx.setResolved(true, 1, 'bidding_war_won', `BID OF ${targetBid} PROVEN!`, `Outbid ${ctx.rivalName} cleanly!`, multExtra);
        } else if (idx >= items.length) {
          ctx.setResolved(false, cleared / targetBid, 'bidding_war_failed', `FELL SHORT (${cleared}/${targetBid})!`, `${ctx.rivalName} takes the applause!`);
        } else {
          render();
        }
      });
    });
  };
  render();
  ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'bidding_timeout', 'AUCTION GAVEL DROPPED!', 'Failed to prove bid in time'));
}

function buildSovereignTripleLock(ctx: ToyBuildContext): void {
  const choices = getNormalizedChoices(ctx.clue);
  const wrongIdx = choices.findIndex((c) => !c.isCorrect);
  let phase: 1 | 2 | 3 = 1;
  let pickedIdx: number | null = null;

  const render = () => {
    ctx.stageEl.innerHTML = `
      <div class="v6tb-grid-3" style="gap:5px;">
        <div style="text-align:center;font-size:10px;font-weight:900;padding:4px;border-radius:6px;background:${phase > 1 ? '#14593a' : '#4a320d'};border:1.5px solid ${phase > 1 ? '#46f0a5' : '#ffe074'};">I. SNIP DECOY ${phase > 1 ? '✓' : ''}</div>
        <div style="text-align:center;font-size:10px;font-weight:900;padding:4px;border-radius:6px;background:${phase > 2 ? '#14593a' : phase === 2 ? '#4a320d' : '#1b140b'};border:1.5px solid ${phase > 2 ? '#46f0a5' : phase === 2 ? '#ffe074' : '#554428'};">II. DIAL TRUTH ${phase > 2 ? '✓' : ''}</div>
        <div style="text-align:center;font-size:10px;font-weight:900;padding:4px;border-radius:6px;background:${phase === 3 ? '#6b1420' : '#1b140b'};border:1.5px solid ${phase === 3 ? '#ff8595' : '#554428'};">III. x5 LEVER</div>
      </div>
      ${phase === 1 ? `
        <div style="font-size:11px;font-weight:800;color:#ffe074;text-align:center;">LOCK I: SNIP 1 FALSE WIRE TO CLEAR THE CHAMBER</div>
        <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
          ${choices.map((c, idx) => `
            <button type="button" class="v6tb-plaque" data-l1="${idx}">
              <span class="v6tb-plaque-key">${SVG_ICONS.scissors}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `).join('')}
        </div>
      ` : phase === 2 ? `
        <div style="font-size:11px;font-weight:800;color:#46f0a5;text-align:center;">LOCK II: ALIGN THE SOVEREIGN DIAL ONTO THE TRUTH</div>
        <div class="v6tb-grid-2" style="flex:1 1 0;align-content:center;">
          ${choices.map((c, idx) => idx === wrongIdx ? '' : `
            <button type="button" class="v6tb-plaque ${pickedIdx === idx ? 'selected' : ''}" data-l2="${idx}">
              <span class="v6tb-plaque-key">${idx + 1}</span>
              <span class="v6tb-plaque-txt">${escapeHtml(c.label)}</span>
            </button>
          `).join('')}
        </div>
      ` : `
        <div class="v6tb-visual-bay" style="flex-direction:column;gap:8px;padding:12px;text-align:center;">
          <div style="font-size:11px;font-weight:900;color:#ffe074;">CHAMBER ARMED: "${escapeHtml(pickedIdx !== null ? choices[pickedIdx].label : '')}"</div>
          <button type="button" class="v6tb-lever-btn crimson" id="v6tlSlam" style="font-size:15px;padding:14px 24px;">SLAM SOVEREIGN x5.0 LEVER!</button>
        </div>
      `}
    `;

    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-l1]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        const i = Number(b.dataset.l1);
        if (choices[i].isCorrect) {
          ctx.sfx('trapdoor_hinge_drop');
          ctx.setResolved(false, 0, 'triple_lock_snipped_truth', 'SNIPPED THE TRUTH WIRE!', `Truth was: ${choices[i].label}`);
          return;
        }
        phase = 2;
        ctx.sfx('wire_cutter_snip');
        render();
      });
    });
    ctx.stageEl.querySelectorAll<HTMLButtonElement>('[data-l2]').forEach((b) => {
      b.addEventListener('click', () => {
        if (ctx.isResolved()) return;
        pickedIdx = Number(b.dataset.l2);
        phase = 3;
        ctx.sfx('vault_heavy_unlock');
        render();
      });
    });
    ctx.stageEl.querySelector('#v6tlSlam')?.addEventListener('click', () => {
      if (ctx.isResolved() || pickedIdx === null) return;
      const ok = choices[pickedIdx].isCorrect;
      ctx.sfx(ok ? 'streak_fanfare_5' : 'trapdoor_hinge_drop');
      ctx.setResolved(
        ok,
        ok ? 1 : 0,
        ok ? 'sovereign_triple_lock_x5' : 'triple_lock_fail',
        ok ? 'SOVEREIGN TRIPLE-LOCK — x5.0 MULT!' : 'TRIPLE-LOCK FAILED!',
        `Truth: ${choices.find((c) => c.isCorrect)!.label}`,
        ok ? 4.0 : 0,
        ok ? ctx.baseChips * 2 : 0,
      );
    });
  };
  render();
  ctx.registerTimeoutHandler(() => ctx.setResolved(false, 0, 'triple_lock_timeout', 'LOCKOUT!', `Truth: ${choices.find((c) => c.isCorrect)!.label}`));
}

// ============================================================================
// MAIN MOUNT FUNCTION — mountToyStageRendererB (Toys 051–100)
// ============================================================================

export function mountToyStageRendererB(
  container: HTMLElement,
  options: ToyMountOptionsV6,
): ToyStageHandleV6 {
  ensureToyBStyles();

  const spec: ToySpecBV6 =
    (options.toyId ? getToySpecB(options.toyId) : undefined)
    ?? (typeof options.toyNumber === 'number' ? getToySpecB(options.toyNumber) : undefined)
    ?? TOY_SPECS_051_TO_100[0];

  const clue = options.clue;
  const baseChips = options.baseChips ?? 250;
  const rivalName = options.rivalName ?? 'Frankie Vance';
  const totalSeconds = Math.max(
    3,
    spec.baseSeconds + (spec.mechanic === 'DEFIBRILLATOR_BLITZ' ? 0 : (options.timerBonusSeconds ?? 0)),
  );
  let secondsRemaining = totalSeconds;
  let resolved = false;
  let disposed = false;

  const cleanups: Array<() => void> = [];
  let hintHandler: (() => void) | null = null;
  let foilHandler: ((kind: FoilTrickCardV6['effectKind']) => boolean) | null = null;
  let timeoutHandler: (() => void) | null = null;

  const sfx = (id: FoleySfxIdV6) => {
    if (!disposed) options.onSfx?.(id);
  };

  container.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'v6tb-root';
  root.dataset.finish = spec.materialFinish;
  root.dataset.toyId = spec.toyId;
  root.dataset.toyNumber = String(spec.toyNumber);

  root.innerHTML = `
    <div class="v6tb-header">
      <div class="v6tb-meta-row">
        <div class="v6tb-badges">
          <span class="v6tb-toy-tag">#${String(spec.toyNumber).padStart(3, '0')} · ${escapeHtml(spec.name)}</span>
          ${spec.isTwistToy ? `<span class="v6tb-twist-pill">TWIST</span>` : ''}
          <span class="v6tb-cat-tag">${escapeHtml(clue.categoryLabel)} · ★${clue.difficultyScore.toFixed(1)}</span>
        </div>
        <div class="v6tb-timer-box" id="v6tbTimerBox">
          <span class="v6tb-timer-val" id="v6tbTimerVal">${secondsRemaining.toFixed(1)}s</span>
        </div>
      </div>
      <div class="v6tb-callout-bar">
        <span>${escapeHtml(spec.actionCallout)}</span>
        <span class="v6tb-howto">${escapeHtml(spec.shortHowToPlay)}</span>
      </div>
      <p class="v6tb-prompt" id="v6tbPrompt">${escapeHtml(clue.prompt)}</p>
      <div class="v6tb-hint-slip" id="v6tbHintSlip"></div>
      <div class="v6tb-timer-track"><div class="v6tb-timer-fill" id="v6tbTimerFill"></div></div>
    </div>
    <div class="v6tb-stage" id="v6tbStage"></div>
  `;
  container.appendChild(root);

  const stageEl = root.querySelector<HTMLElement>('#v6tbStage')!;
  const promptEl = root.querySelector<HTMLElement>('#v6tbPrompt')!;
  const hintSlipEl = root.querySelector<HTMLElement>('#v6tbHintSlip')!;
  const timerBoxEl = root.querySelector<HTMLElement>('#v6tbTimerBox')!;
  const timerValEl = root.querySelector<HTMLElement>('#v6tbTimerVal')!;
  const timerFillEl = root.querySelector<HTMLElement>('#v6tbTimerFill')!;

  // Responsive Split-Stage Detector (Zero-Scroll in both Portrait & Landscape!)
  const updateLayoutMode = () => {
    const rect = root.getBoundingClientRect();
    const isLand = rect.width > 480 && rect.height > 120 && rect.width / rect.height > 1.25 && rect.height < 560;
    root.classList.toggle('v6tb-landscape', isLand);
  };
  updateLayoutMode();
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(updateLayoutMode);
    ro.observe(root);
    cleanups.push(() => ro.disconnect());
  }

  // Shot Clock Loop
  let lastTickMs = performance.now();
  let lastUrgentSecond = -1;
  const clockTimer = window.setInterval(() => {
    if (resolved || disposed) return;
    const now = performance.now();
    const dt = Math.min(0.25, (now - lastTickMs) / 1000);
    lastTickMs = now;
    secondsRemaining = Math.max(0, secondsRemaining - dt);
    timerValEl.textContent = `${secondsRemaining.toFixed(1)}s`;
    const pct = clamp((secondsRemaining / Math.max(3, totalSeconds)) * 100, 0, 100);
    timerFillEl.style.width = `${pct.toFixed(1)}%`;
    const isUrgent = secondsRemaining <= 4.0;
    timerBoxEl.classList.toggle('urgent', isUrgent);
    timerFillEl.classList.toggle('urgent', isUrgent);
    if (isUrgent && Math.ceil(secondsRemaining) !== lastUrgentSecond && secondsRemaining > 0) {
      lastUrgentSecond = Math.ceil(secondsRemaining);
      sfx('clock_escapement_urgent');
    }
    if (secondsRemaining <= 0) {
      if (timeoutHandler) timeoutHandler();
      else setResolved(false, 0, 'toy_timeout', 'SHOT CLOCK EXPIRED!', '');
    }
  }, 80);
  cleanups.push(() => window.clearInterval(clockTimer));

  const setResolved: ToyBuildContext['setResolved'] = (
    correct,
    accuracyRatio,
    specificActionTag,
    revealTitle,
    revealSub,
    multExtra = 0,
    chipsOverride,
  ) => {
    if (resolved || disposed) return;
    resolved = true;
    const speedRatio = clamp(secondsRemaining / Math.max(3, totalSeconds), 0, 1);
    const chipsEarned = chipsOverride !== undefined
      ? chipsOverride
      : correct
        ? Math.round(baseChips * (0.6 + accuracyRatio * 0.6 + speedRatio * 0.35))
        : 0;
    const multDelta = correct ? Number((spec.baseMultBonus + multExtra).toFixed(2)) : 0;

    sfx(correct ? 'crowd_warm_applause' : 'crowd_collective_gasp');

    const banner = document.createElement('div');
    banner.className = `v6tb-reveal-banner ${correct ? 'win' : 'loss'}`;
    banner.innerHTML = `
      <div style="min-width:0;">
        <div class="v6tb-reveal-title">${escapeHtml(revealTitle)}</div>
        <div class="v6tb-reveal-sub">${escapeHtml(revealSub || clue.wittyHostAside || '')}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;font-weight:900;font-size:12.5px;color:${correct ? '#6cf7b8' : '#ff99a8'};">
        ${correct ? `+$${chipsEarned}${multDelta > 0 ? ` · +${multDelta}x` : ''}` : 'TRAPDOOR!'}
      </div>
    `;
    stageEl.appendChild(banner);

    options.onResolve({
      correct,
      accuracyRatio: clamp(accuracyRatio, 0, 1),
      secondsRemaining: Number(secondsRemaining.toFixed(2)),
      chipsEarned,
      multDelta,
      specificActionTag,
    });
  };

  const ctx: ToyBuildContext = {
    spec,
    clue,
    stageEl,
    promptEl,
    rivalName,
    baseChips,
    sfx,
    addCleanup: (fn) => cleanups.push(fn),
    getTimeLeft: () => secondsRemaining,
    adjustTime: (delta) => {
      secondsRemaining = clamp(secondsRemaining + delta, 0, totalSeconds + 10);
      timerValEl.textContent = `${secondsRemaining.toFixed(1)}s`;
    },
    setResolved,
    isResolved: () => resolved || disposed,
    registerHintHandler: (fn) => { hintHandler = fn; },
    registerFoilHandler: (fn) => { foilHandler = fn; },
    registerTimeoutHandler: (fn) => { timeoutHandler = fn; },
  };

  // Dispatch exact tactile toy mechanic for Toys 051–100
  switch (spec.mechanic) {
    // Family VI
    case 'CLIFFHANGER_DIAL': buildCliffhangerDial(ctx); break;
    case 'HIGHER_LOWER_CARDS': buildHigherLowerCards(ctx); break;
    case 'CHRONOLOGY_RUNGS': buildChronologyOrTower(ctx, false); break;
    case 'APOTHECARY_BALANCE': buildApothecaryBalance(ctx); break;
    case 'BRAIDED_SWITCHBOARD': buildBraidedSwitchboard(ctx); break;
    case 'CONFIDENCE_CALIPER': buildConfidenceOrAllIn(ctx, false); break;
    case 'TOWER_STACK': buildChronologyOrTower(ctx, true); break;
    case 'VENN_SORTER': buildVennSorter(ctx); break;
    case 'TIMELINE_PIN': buildTimelinePin(ctx); break;
    case 'COIN_TRAY_SUM': buildCoinTraySum(ctx); break;
    // Family VII
    case 'TRAPDOOR_CHIP_SPLIT': buildTrapdoorChipSplit(ctx); break;
    case 'BLACKJACK_21_FACTS': buildCasinoCardOrWheelToy(ctx, 'BLACKJACK'); break;
    case 'HOSTS_BRIBE_VAULT': buildHostsBribeVault(ctx); break;
    case 'DOUBLE_SECOND_GUESS': buildDoubleSecondGuess(ctx); break;
    case 'ROULETTE_WHEEL_BET': buildCasinoCardOrWheelToy(ctx, 'ROULETTE'); break;
    case 'POKER_TRUTH_HAND': buildCasinoCardOrWheelToy(ctx, 'POKER'); break;
    case 'BLIND_HIGH_CARD': buildCasinoCardOrWheelToy(ctx, 'BLIND_CARD'); break;
    case 'INSURANCE_HEDGE': buildCasinoCardOrWheelToy(ctx, 'INSURANCE'); break;
    case 'PRESS_LUCK_VAULTS': buildCasinoCardOrWheelToy(ctx, 'PRESS_LUCK'); break;
    case 'ALL_IN_SHOWDOWN': buildConfidenceOrAllIn(ctx, true); break;
    // Family VIII
    case 'UV_BLACKLIGHT_DRAG': buildBeamScannerToy(ctx, 'UV_BLACKLIGHT'); break;
    case 'MICROFILM_CRANK': buildForensicInstrumentToy(ctx, 'MICROFILM'); break;
    case 'FINGERPRINT_RETICLE': buildForensicInstrumentToy(ctx, 'FINGERPRINT'); break;
    case 'POLYGRAPH_STYLUS': buildForensicInstrumentToy(ctx, 'POLYGRAPH'); break;
    case 'CIPHER_WHEEL': buildForensicInstrumentToy(ctx, 'CIPHER'); break;
    case 'TORN_DOC_JIGSAW': buildForensicInstrumentToy(ctx, 'JIGSAW'); break;
    case 'PERISCOPE_PAN': buildForensicInstrumentToy(ctx, 'PERISCOPE'); break;
    case 'ALIBI_CROSSCHECK': buildForensicInstrumentToy(ctx, 'ALIBI'); break;
    case 'XRAY_FLUOROSCOPE': buildBeamScannerToy(ctx, 'XRAY_CRATE'); break;
    case 'RED_STRING_BOARD': buildForensicInstrumentToy(ctx, 'RED_STRING'); break;
    // Family IX
    case 'CALLIOPE_PIPES': buildKineticSelectorContraption(ctx, 'CALLIOPE'); break;
    case 'DEPTH_VALVE_WHEEL': buildKineticSelectorContraption(ctx, 'DEPTH_VALVE'); break;
    case 'PRISM_BEAM_MIRROR': buildKineticSelectorContraption(ctx, 'PRISM_BEAM'); break;
    case 'CLOCKWORK_GEARS': buildKineticSelectorContraption(ctx, 'GEARS'); break;
    case 'CARNIVAL_RING_TOSS': buildKineticTimedContraption(ctx, 'RING_TOSS'); break;
    case 'STEAM_PRESSURE_HOLD': buildKineticTimedContraption(ctx, 'STEAM_HOLD'); break;
    case 'MAGNETIC_PENDULUM': buildKineticTimedContraption(ctx, 'PENDULUM'); break;
    case 'SHOOTING_GALLERY': buildKineticTimedContraption(ctx, 'SHOOTING_GALLERY'); break;
    case 'AIRLOCK_SEQUENCE': buildKineticSelectorContraption(ctx, 'AIRLOCK'); break;
    case 'AURORA_STAR_WEB': buildKineticSelectorContraption(ctx, 'AURORA'); break;
    // Family X (Mind-Game Twists)
    case 'SPOT_HOSTS_LIE': buildSpotHostsLie(ctx); break;
    case 'REVERSE_JEOPARDY': buildReverseJeopardy(ctx); break;
    case 'RIVAL_CURSED_WIRE': buildRivalCursedWire(ctx); break;
    case 'TWO_TRUTHS_SABOTAGE': buildTwoTruthsSabotage(ctx); break;
    case 'DEFIBRILLATOR_BLITZ': buildDefibrillatorBlitz(ctx); break;
    case 'MIRROR_SCRIPT_TILT': buildMirrorScriptTilt(ctx); break;
    case 'DOMINO_DUAL_LINK': buildDominoDualLink(ctx); break;
    case 'BIDDING_WAR_RIVAL': buildBiddingWarRival(ctx); break;
    case 'SPOTLIGHT_BLACKOUT': buildBeamScannerToy(ctx, 'SPOTLIGHT_BLACKOUT'); break;
    case 'SOVEREIGN_TRIPLE_LOCK': buildSovereignTripleLock(ctx); break;
  }

  return {
    toySpec: spec,
    triggerHint() {
      if (resolved || disposed) return;
      const hintText = clue.progressiveHints?.[0] ?? clue.wittyHostAside ?? `Focus on ${clue.categoryLabel} — eliminate obvious decoys.`;
      hintSlipEl.textContent = `STUDIO HINT: ${hintText}`;
      hintSlipEl.classList.add('visible');
      hintHandler?.();
      sfx('ui_brass_tap');
      options.onHintUsed?.();
    },
    applyFoilEffect(effectKind) {
      if (resolved || disposed) return false;
      if (foilHandler?.(effectKind)) {
        sfx('foil_card_flick');
        return true;
      }
      if (effectKind === 'DEFUSE_ONE_WIRE') {
        hintHandler?.();
        sfx('wire_cutter_snip');
        return true;
      }
      return false;
    },
    forceTimeout() {
      if (resolved || disposed) return;
      if (timeoutHandler) timeoutHandler();
      else setResolved(false, 0, 'forced_timeout', 'TIME EXPIRED!', '');
    },
    getSecondsRemaining() {
      return secondsRemaining;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const fn of cleanups) {
        try { fn(); } catch { /* noop */ }
      }
      cleanups.length = 0;
      root.remove();
    },
  };
}
