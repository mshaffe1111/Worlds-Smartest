// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 "Sweeps Week Deluxe")
// `src/v7/ui/CareerStatsDashboardV8.ts`
// 1966 Nielsen Television Index & IBC Research Dept. Career Analytics Folio:
//   - Sculpted Warm Broadcast Cream (#FAF2DF -> #F3E6C8) & Warm Ivory (#FFFDF7)
//     ledger framed in Sunlit American Walnut (#6E3B23) & Champagne Brass (#D9A441)
//   - Radiant Peacock-to-Cobalt Header Ribbon (#008B94 -> #1746A2) w/ single CLOSE x
//   - 4 Interactive Drill-Down Tabs (zero dark-navy boxes, zero OS emojis!):
//       1. OVERVIEW & RATINGS CURVE (SVG Multi-Ring Donut + 6 Split-Flap KPIs
//          + Interactive 20-Match Cash & Accuracy Trend Graph)
//       2. CATEGORIES & DRILL-DOWN (Clickable 5-Domain Horizontal Bar Chart
//          dynamically filtering all 20 Categories + 4 Sort Pills)
//       3. QUESTION TYPES & CHEATS (Classic 4-Option vs Showcase Contraptions
//          + 3 Illuminated Lifeline ROI Cards)
//       4. STREAKS & BOARD MODES (Visual Streak Milestone Thermometer
//          + 8 TV Board Formats Mastery Grid)
//   - Responsive across 1440x900 Desktop, 768x1024 Tablet & 390x844 Mobile.
// ============================================================================

import {
  computeBoardModesBreakdownV8,
  computeDomainBreakdownV8,
  computeFormatAndLifelineBreakdownV8,
  computeSortedCategoriesV8,
  computeWheelhouseAndPracticeCalloutsV8,
  loadCareerStatsLedgerV8,
  type BroadcastAnalyticsDomainIdV8,
  type CategoryBreakdownItemV8,
  type CategorySortModeV8,
} from '../campaign/CareerStatsLedgerV8';
import type {
  CareerStatsLedgerV8,
  CategoryIdV7,
  MatchHistoryPointV8,
} from '../contracts_v7';

export type CareerStatsDashboardTabIdV8 =
  | 'OVERVIEW'
  | 'CATEGORIES'
  | 'FORMATS_CHEATS'
  | 'STREAKS_BOARDS';

export interface CareerStatsDashboardModalOptionsV8 {
  readonly ledger?: CareerStatsLedgerV8;
  readonly dailyStreak?: number;
  readonly bestDailyStreak?: number;
  readonly initialTab?: CareerStatsDashboardTabIdV8;
  readonly onClose?: () => void;
  readonly onPracticeCategory?: (cat: CategoryIdV7) => void;
}

const CAREER_STATS_STYLE_ID_V8 = 'ws8-career-stats-dashboard-css';

// ----------------------------------------------------------------------------
// 1. Idempotent Sunlit 1966 Nielsen Television Index Stylesheet
// ----------------------------------------------------------------------------

export function ensureCareerStatsDashboardStylesV8(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(CAREER_STATS_STYLE_ID_V8)) return;

  const style = document.createElement('style');
  style.id = CAREER_STATS_STYLE_ID_V8;
  style.textContent = `
    .ws8-cs-backdrop,
    .ws8-cs-backdrop * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    .ws8-cs-backdrop {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 99;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding:
        max(8px, env(safe-area-inset-top, 0px))
        max(10px, env(safe-area-inset-right, 0px))
        max(8px, env(safe-area-inset-bottom, 0px))
        max(10px, env(safe-area-inset-left, 0px));
      background:
        radial-gradient(circle at 50% 14%, rgba(242, 169, 34, 0.24) 0%, rgba(110, 59, 35, 0.72) 55%, rgba(44, 23, 11, 0.88) 100%);
      backdrop-filter: blur(8px);
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', 'Jost', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #23180F;
      user-select: none;
      animation: ws8-cs-fade-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes ws8-cs-fade-in {
      from { opacity: 0; transform: translateY(8px) scale(0.985); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Sunlit American Walnut (#6E3B23) & Brushed Champagne Brass (#D9A441) Outer Folio */
    .ws8-cs-walnut-frame {
      width: min(1080px, 100%);
      max-height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 22px;
      padding: 6px;
      background:
        repeating-linear-gradient(
          92deg,
          rgba(255, 224, 166, 0.06) 0px,
          rgba(255, 224, 166, 0.06) 2px,
          rgba(52, 26, 12, 0.08) 2px,
          rgba(52, 26, 12, 0.08) 6px
        ),
        linear-gradient(145deg, #864A2B 0%, #6E3B23 50%, #542B16 100%);
      border: 2.5px solid #D9A441;
      box-shadow:
        0 26px 64px rgba(36, 18, 7, 0.58),
        inset 0 2px 0 rgba(255, 238, 196, 0.48);
      overflow: hidden;
    }

    /* Warm Broadcast Cream (#FAF2DF -> #F3E6C8) Interior Ledger Sheet */
    .ws8-cs-folio-sheet {
      width: 100%;
      max-height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      overflow: hidden;
      background:
        radial-gradient(circle at 50% 0%, #FFFDF7 0%, #FAF2DF 64%, #F3E6C8 100%);
      border: 2px solid #D9A441;
      box-shadow: inset 0 1px 0 #FFFDF7;
    }

    /* Radiant Peacock-to-Cobalt Header Ribbon (#008B94 -> #1746A2) */
    .ws8-cs-header {
      flex-shrink: 0;
      padding: 11px 16px 10px;
      background:
        radial-gradient(circle at 16% 18%, rgba(255, 226, 148, 0.2) 0%, transparent 50%),
        linear-gradient(102deg, #008B94 0%, #00798C 46%, #1746A2 100%);
      border-bottom: 3px solid #F2A922;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .ws8-cs-header-titles {
      min-width: 0;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ws8-cs-kicker {
      display: flex;
      align-items: center;
      gap: 7px;
      font-family: 'Michroma', 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #FFE89E;
      text-transform: uppercase;
      line-height: 1.2;
    }

    .ws8-cs-bulb-trio {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .ws8-cs-bulb {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #FFD166;
      box-shadow: 0 0 6px rgba(255, 209, 102, 0.92);
    }

    .ws8-cs-title {
      margin: 0;
      font-family: 'Caprasimo', 'Fraunces', 'Jost', serif;
      font-size: clamp(19px, 2.5vw, 25px);
      font-weight: 900;
      line-height: 1.1;
      color: #FFFDF7;
      text-shadow: 0 2px 6px rgba(35, 24, 15, 0.34);
    }

    .ws8-cs-close-btn {
      appearance: none;
      flex-shrink: 0;
      min-width: 102px;
      min-height: 48px;
      padding: 8px 16px;
      border-radius: 12px;
      border: 2px solid #F2A922;
      background: linear-gradient(180deg, #FFFDF7 0%, #F3E6C8 100%);
      color: #23180F;
      font-family: 'Jost', sans-serif;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      touch-action: manipulation;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 3px 0 #B67D14, 0 5px 12px rgba(35, 24, 15, 0.22);
      transition: transform 0.12s ease, filter 0.12s ease;
    }

    .ws8-cs-close-btn:hover,
    .ws8-cs-close-btn:focus-visible {
      transform: translateY(-1px);
      filter: brightness(1.03);
      outline: 2px solid #FFFDF7;
      outline-offset: 2px;
    }

    /* 4-Tab Sunlit Brass & Cream Index Bar */
    .ws8-cs-tab-bar {
      flex-shrink: 0;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;
      padding: 8px 14px;
      background: linear-gradient(180deg, #F6E9CE 0%, #EFE0BE 100%);
      border-bottom: 2px solid #D9A441;
    }

    .ws8-cs-tab-btn {
      appearance: none;
      min-height: 48px;
      padding: 6px 10px;
      border-radius: 11px;
      border: 1.5px solid #D9A441;
      background: linear-gradient(180deg, #FFFDF7 0%, #FAF2DF 100%);
      color: #4A321F;
      font-family: 'Jost', sans-serif;
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1.15;
      cursor: pointer;
      touch-action: manipulation;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 6px;
      transition: transform 0.12s ease, background 0.12s ease, box-shadow 0.12s ease;
    }

    .ws8-cs-tab-btn:hover {
      background: #FFFDF7;
    }

    .ws8-cs-tab-btn[aria-selected="true"] {
      background: linear-gradient(135deg, #008B94 0%, #1746A2 100%);
      color: #FFFDF7;
      border-color: #F2A922;
      box-shadow: 0 3px 8px rgba(0, 139, 148, 0.28), inset 0 1px 0 rgba(255, 253, 247, 0.35);
    }

    /* Scrollable Folio Body */
    .ws8-cs-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Shared Sunlit Ivory Plaque Card */
    .ws8-cs-plaque {
      background: linear-gradient(180deg, #FFFDF7 0%, #FAF2DF 100%);
      border: 1.5px solid #D9A441;
      border-radius: 14px;
      padding: 10px 13px;
      box-shadow: 0 4px 12px rgba(110, 59, 35, 0.08), inset 0 1px 0 #FFFDF7;
    }

    .ws8-cs-section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .ws8-cs-section-title {
      margin: 0;
      font-family: 'Jost', sans-serif;
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #6E3B23;
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }

    .ws8-cs-section-sub {
      font-size: 13px;
      font-weight: 700;
      color: #5C432E;
    }

    /* TAB 1: OVERVIEW & RATINGS CURVE */
    .ws8-cs-overview-top {
      display: grid;
      grid-template-columns: minmax(270px, 340px) minmax(0, 1fr);
      gap: 14px;
      align-items: stretch;
    }

    .ws8-cs-donut-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      gap: 7px;
    }

    .ws8-cs-donut-wrap {
      width: min(172px, 100%);
      aspect-ratio: 1 / 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ws8-cs-donut-wrap svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .ws8-cs-donut-legend {
      width: 100%;
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      font-size: 13px;
      font-weight: 800;
      color: #3A2718;
    }

    .ws8-cs-legend-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 5px;
      vertical-align: middle;
    }

    .ws8-cs-callout-stack {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .ws8-cs-callout-chip {
      width: 100%;
      border-radius: 10px;
      padding: 8px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      border: 1.5px solid #D9A441;
      background: #FFFDF7;
    }

    .ws8-cs-callout-chip[data-kind="wheelhouse"] {
      border-color: #008B94;
      background: linear-gradient(90deg, rgba(0, 139, 148, 0.1) 0%, #FFFDF7 100%);
    }

    .ws8-cs-callout-chip[data-kind="practice"] {
      border-color: #FF6B35;
      background: linear-gradient(90deg, rgba(255, 107, 53, 0.11) 0%, #FFFDF7 100%);
    }

    .ws8-cs-callout-copy {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .ws8-cs-callout-kicker {
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #6E3B23;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .ws8-cs-callout-val {
      font-size: 14px;
      font-weight: 800;
      color: #23180F;
    }

    .ws8-cs-practice-btn {
      appearance: none;
      min-height: 40px;
      padding: 6px 11px;
      border-radius: 9px;
      border: 1.5px solid #FF6B35;
      background: linear-gradient(180deg, #FF7B47 0%, #FF6B35 100%);
      color: #FFFDF7;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      flex-shrink: 0;
    }

    /* 6 Warm Ivory (#FFFDF7) Split-Flap KPI Plaques */
    .ws8-cs-kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      align-content: stretch;
    }

    .ws8-cs-kpi-card {
      background: #FFFDF7;
      border: 1.5px solid #D9A441;
      border-top: 4px solid var(--ws8-kpi-accent, #008B94);
      border-radius: 13px;
      padding: 11px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 6px;
      box-shadow: 0 3px 9px rgba(110, 59, 35, 0.08);
    }

    .ws8-cs-kpi-label {
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #6E3B23;
      line-height: 1.2;
    }

    .ws8-cs-kpi-flap {
      background: linear-gradient(180deg, #FAF2DF 0%, #F3E6C8 49%, #FFFDF7 51%, #FAF2DF 100%);
      border: 1.5px solid #D9A441;
      border-radius: 9px;
      padding: 7px 10px;
      font-family: 'Chakra Petch', 'Jost', sans-serif;
      font-variant-numeric: tabular-nums;
      font-size: clamp(20px, 2.3vw, 26px);
      font-weight: 800;
      color: #23180F;
      line-height: 1.1;
    }

    .ws8-cs-kpi-foot {
      font-size: 13px;
      font-weight: 700;
      color: #5C432E;
      line-height: 1.2;
    }

    /* Interactive Trend Graph */
    .ws8-cs-trend-wrap {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ws8-cs-trend-tooltip-bar {
      min-height: 40px;
      border-radius: 10px;
      padding: 7px 12px;
      background: #FFFDF7;
      border: 1.5px solid #D9A441;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      font-size: 13.5px;
      font-weight: 800;
      color: #23180F;
    }

    .ws8-cs-trend-svg-box {
      width: 100%;
      position: relative;
      border-radius: 12px;
      background: linear-gradient(180deg, #FFFDF7 0%, #FAF2DF 100%);
      border: 1.5px solid #D9A441;
      padding: 8px;
    }

    .ws8-cs-trend-svg-box svg {
      width: 100%;
      height: auto;
      display: block;
      overflow: visible;
    }

    .ws8-cs-node-hit {
      cursor: pointer;
    }

    .ws8-cs-brass-ribbon {
      margin-top: 4px;
      border-radius: 10px;
      padding: 9px 14px;
      background: linear-gradient(90deg, #FFF7DF 0%, #FFE4A0 50%, #FFF7DF 100%);
      border: 2px solid #D9A441;
      color: #542B16;
      font-family: 'Jost', sans-serif;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      text-align: center;
      box-shadow: 0 3px 8px rgba(110, 59, 35, 0.12);
    }

    /* TAB 2: CATEGORIES & DRILL-DOWN */
    .ws8-cs-domain-bars {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .ws8-cs-domain-btn {
      appearance: none;
      width: 100%;
      min-height: 48px;
      padding: 8px 12px;
      border-radius: 11px;
      border: 1.5px solid #D9A441;
      background: #FFFDF7;
      color: #23180F;
      cursor: pointer;
      touch-action: manipulation;
      display: grid;
      grid-template-columns: minmax(140px, 195px) minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      text-align: left;
      transition: transform 0.1s ease, border-color 0.12s ease, box-shadow 0.12s ease;
    }

    .ws8-cs-domain-btn:hover {
      border-color: #6E3B23;
    }

    .ws8-cs-domain-btn[data-active="true"] {
      border: 2.5px solid #008B94;
      background: linear-gradient(90deg, rgba(0, 139, 148, 0.1) 0%, #FFFDF7 55%);
      box-shadow: 0 3px 10px rgba(0, 139, 148, 0.18);
    }

    .ws8-cs-domain-name {
      font-family: 'Jost', sans-serif;
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: #23180F;
    }

    .ws8-cs-track {
      width: 100%;
      height: 14px;
      border-radius: 999px;
      background: #EFE0BE;
      border: 1px solid #D9A441;
      overflow: hidden;
      position: relative;
    }

    .ws8-cs-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .ws8-cs-domain-metrics {
      font-family: 'Chakra Petch', 'Jost', sans-serif;
      font-variant-numeric: tabular-nums;
      font-size: 13.5px;
      font-weight: 800;
      color: #23180F;
      white-space: nowrap;
    }

    .ws8-cs-sort-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .ws8-cs-sort-pills {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .ws8-cs-sort-pill {
      appearance: none;
      min-height: 42px;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1.5px solid #D9A441;
      background: #FFFDF7;
      color: #4A321F;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      touch-action: manipulation;
    }

    .ws8-cs-sort-pill[data-active="true"] {
      background: #6E3B23;
      border-color: #D9A441;
      color: #FFFDF7;
    }

    .ws8-cs-cat-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 9px;
    }

    .ws8-cs-cat-row {
      background: #FFFDF7;
      border: 1.5px solid #D9A441;
      border-radius: 11px;
      padding: 9px 11px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .ws8-cs-cat-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }

    .ws8-cs-cat-title {
      font-family: 'Jost', sans-serif;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.03em;
      color: #23180F;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .ws8-cs-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 999px;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.03em;
    }

    .ws8-cs-badge[data-status="★ WHEELHOUSE"] {
      background: rgba(0, 139, 148, 0.15);
      border: 1px solid #008B94;
      color: #00666E;
    }

    .ws8-cs-badge[data-status="SOLID"] {
      background: rgba(242, 169, 34, 0.2);
      border: 1px solid #D9A441;
      color: #6E3B23;
    }

    .ws8-cs-badge[data-status="NEEDS PRACTICE"] {
      background: rgba(230, 57, 122, 0.14);
      border: 1px solid #E6397A;
      color: #A61B50;
    }

    .ws8-cs-badge[data-status="UNEXPLORED"] {
      background: #FAF2DF;
      border: 1px solid #D9A441;
      color: #6E3B23;
    }

    .ws8-cs-cat-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
      font-size: 13px;
      font-weight: 800;
      color: #4A321F;
      font-variant-numeric: tabular-nums;
    }

    /* TAB 3: QUESTION TYPES & CHEATS */
    .ws8-cs-split-compare {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .ws8-cs-compare-hero {
      background: #FFFDF7;
      border: 2px solid #D9A441;
      border-radius: 13px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .ws8-cs-format-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .ws8-cs-format-item {
      background: #FFFDF7;
      border: 1.5px solid #D9A441;
      border-radius: 10px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .ws8-cs-lifeline-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    .ws8-cs-lifeline-card {
      background: radial-gradient(circle at 50% 0%, #FFFDF7 0%, #FAF2DF 100%);
      border: 2px solid var(--ws8-ll-color, #008B94);
      border-radius: 13px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 8px;
      box-shadow: 0 4px 10px rgba(110, 59, 35, 0.1);
    }

    /* TAB 4: STREAKS & BOARD MODES */
    .ws8-cs-thermo-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    .ws8-cs-thermo-card {
      background: #FFFDF7;
      border: 1.5px solid #D9A441;
      border-radius: 13px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ws8-cs-thermo-tube {
      width: 100%;
      height: 18px;
      border-radius: 999px;
      background: #EFE0BE;
      border: 1.5px solid #6E3B23;
      padding: 2px;
      overflow: hidden;
    }

    .ws8-cs-thermo-mercury {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #F2A922 0%, #FF6B35 60%, #E6397A 100%);
      transition: width 0.3s ease;
    }

    .ws8-cs-board-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }

    .ws8-cs-board-card {
      background: #FFFDF7;
      border: 1.5px solid #D9A441;
      border-top: 4px solid var(--ws8-bm-color, #008B94);
      border-radius: 12px;
      padding: 10px 11px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 7px;
    }

    /* Responsive Tablet (<= 960px) & Mobile Portrait (<= 640px) */
    @media (max-width: 960px) {
      .ws8-cs-overview-top {
        grid-template-columns: 1fr;
      }
      .ws8-cs-kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ws8-cs-board-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ws8-cs-lifeline-grid,
      .ws8-cs-thermo-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .ws8-cs-backdrop {
        padding:
          max(4px, env(safe-area-inset-top, 0px))
          max(4px, env(safe-area-inset-right, 0px))
          max(4px, env(safe-area-inset-bottom, 0px))
          max(4px, env(safe-area-inset-left, 0px));
      }
      .ws8-cs-header {
        padding: 9px 11px;
      }
      .ws8-cs-close-btn {
        min-width: 84px;
        padding: 6px 11px;
      }
      .ws8-cs-tab-bar {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding: 7px 10px;
      }
      .ws8-cs-body {
        padding: 10px 10px 14px;
      }
      .ws8-cs-kpi-grid,
      .ws8-cs-cat-list,
      .ws8-cs-split-compare,
      .ws8-cs-format-grid,
      .ws8-cs-board-grid {
        grid-template-columns: 1fr;
      }
      .ws8-cs-domain-btn {
        grid-template-columns: 1fr auto;
      }
      .ws8-cs-domain-btn .ws8-cs-track {
        grid-column: 1 / -1;
      }
    }
  `;
  document.head.appendChild(style);
}

// ----------------------------------------------------------------------------
// 2. Formatting & Custom 1966 Vector SVG Builders (Zero OS Emojis!)
// ----------------------------------------------------------------------------

function escapeHtmlV8(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDollarsV8(amount: number): string {
  const safe = Math.max(0, Math.round(Number.isFinite(amount) ? amount : 0));
  return `$${safe.toLocaleString('en-US')}`;
}

function renderBullseyeTargetSvgV8(hex = '#FF6B35'): string {
  return `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" style="flex-shrink:0"><circle cx="10" cy="10" r="8" stroke="${hex}" stroke-width="2.2"/><circle cx="10" cy="10" r="4.5" stroke="${hex}" stroke-width="2"/><circle cx="10" cy="10" r="1.8" fill="${hex}"/></svg>`;
}

function renderStarCrestSvgV8(hex = '#008B94'): string {
  return `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" style="flex-shrink:0"><path d="M10 1.8L12.45 6.85L18 7.65L13.98 11.55L14.95 17.1L10 14.48L5.05 17.1L6.02 11.55L2 7.65L7.55 6.85L10 1.8Z" fill="${hex}" stroke="#6E3B23" stroke-width="1.1"/></svg>`;
}

function renderMultiRingDonutSvgV8(
  clueAccPct: number,
  matchWinPct: number,
  hasData: boolean,
): string {
  const rOuter = 82;
  const rInner = 62;
  const cOuter = 2 * Math.PI * rOuter;
  const cInner = 2 * Math.PI * rInner;

  const clampedClue = Math.min(100, Math.max(0, clueAccPct));
  const clampedWin = Math.min(100, Math.max(0, matchWinPct));

  const dashOuter = (clampedClue / 100) * cOuter;
  const dashInner = (clampedWin / 100) * cInner;

  const centerPrimary = hasData ? `${clampedClue}%` : 'READY';
  const centerSub = hasData ? 'CLUE ACCURACY' : 'NEW LEDGER';
  const centerWinLine = hasData ? `${clampedWin}% WIN RATE` : 'STUDIO 6A';

  return `
    <svg viewBox="0 0 200 200" role="img" aria-label="Clue Accuracy ${clampedClue} percent and Match Win Rate ${clampedWin} percent">
      <circle cx="100" cy="100" r="94" fill="#FFFDF7" stroke="#D9A441" stroke-width="2" />
      <circle cx="100" cy="100" r="${rOuter}" fill="none" stroke="#EFE0BE" stroke-width="13" />
      <circle cx="100" cy="100" r="${rInner}" fill="none" stroke="#F6E9CE" stroke-width="11" />
      ${
        clampedClue > 0
          ? `<circle cx="100" cy="100" r="${rOuter}" fill="none" stroke="#008B94" stroke-width="13" stroke-linecap="round" stroke-dasharray="${dashOuter.toFixed(2)} ${cOuter.toFixed(2)}" transform="rotate(-90 100 100)" />`
          : ''
      }
      ${
        clampedWin > 0
          ? `<circle cx="100" cy="100" r="${rInner}" fill="none" stroke="#F2A922" stroke-width="11" stroke-linecap="round" stroke-dasharray="${dashInner.toFixed(2)} ${cInner.toFixed(2)}" transform="rotate(-90 100 100)" />`
          : ''
      }
      <circle cx="100" cy="100" r="49" fill="#FAF2DF" stroke="#D9A441" stroke-width="1.5" />
      <text x="100" y="91" text-anchor="middle" font-family="'Chakra Petch', 'Jost', sans-serif" font-size="${hasData ? '24' : '18'}" font-weight="800" fill="#23180F">${centerPrimary}</text>
      <text x="100" y="106" text-anchor="middle" font-family="'Jost', sans-serif" font-size="9.0" font-weight="900" letter-spacing="0.4" fill="#6E3B23">${centerSub}</text>
      <text x="100" y="119" text-anchor="middle" font-family="'Jost', sans-serif" font-size="9.2" font-weight="800" fill="#008B94">${centerWinLine}</text>
    </svg>
  `;
}

function buildSmoothSvgPathV8(
  pts: readonly { readonly x: number; readonly y: number }[],
): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function renderTrendGraphSvgV8(
  matches: readonly MatchHistoryPointV8[],
  selectedIdx: number,
): string {
  const W = 760;
  const H = 164;
  const padL = 60;
  const padR = 50;
  const padT = 15;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxCashRaw = matches.reduce(
    (acc, m) => Math.max(acc, m.playerCash),
    2000,
  );
  const maxCashScale = Math.max(1000, Math.ceil(maxCashRaw / 500) * 500);

  const gridRows = [0, 0.25, 0.5, 0.75, 1];
  const gridSvg = gridRows
    .map((ratio) => {
      const y = padT + plotH * (1 - ratio);
      const cashLabel = `$${Math.round(maxCashScale * ratio).toLocaleString('en-US')}`;
      const pctLabel = `${Math.round(100 * ratio)}%`;
      return `
        <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="#DFC795" stroke-width="1" stroke-dasharray="${ratio === 0 ? 'none' : '4 4'}" />
        <text x="${padL - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-family="'Chakra Petch', 'Jost', sans-serif" font-size="12.5" font-weight="700" fill="#6E3B23">${cashLabel}</text>
        <text x="${W - padR + 8}" y="${(y + 4).toFixed(1)}" text-anchor="start" font-family="'Chakra Petch', 'Jost', sans-serif" font-size="12.5" font-weight="700" fill="#B84214">${pctLabel}</text>
      `;
    })
    .join('');

  if (matches.length < 2) {
    const singleMarker =
      matches.length === 1
        ? (() => {
            const m = matches[0];
            const acc =
              m.cluesAnswered > 0
                ? Math.round((m.cluesCorrect / m.cluesAnswered) * 100)
                : 0;
            const cx = padL + plotW * 0.5;
            const cyCash =
              padT + plotH * (1 - Math.min(1, m.playerCash / maxCashScale));
            const cyAcc = padT + plotH * (1 - acc / 100);
            return `
              <circle cx="${cx}" cy="${cyCash.toFixed(1)}" r="7" fill="#008B94" stroke="#FFFDF7" stroke-width="2.5" />
              <circle cx="${cx}" cy="${cyAcc.toFixed(1)}" r="6" fill="#FF6B35" stroke="#FFFDF7" stroke-width="2" />
              <text x="${cx}" y="${H - 9}" text-anchor="middle" font-family="'Jost', sans-serif" font-size="12.5" font-weight="800" fill="#4A321F">EPISODE 1: ${escapeHtmlV8(m.label)} (${formatDollarsV8(m.playerCash)})</text>
            `;
          })()
        : `<text x="${padL + plotW / 2}" y="${padT + plotH / 2 + 5}" text-anchor="middle" font-family="'Jost', sans-serif" font-size="14" font-weight="900" letter-spacing="0.8" fill="#6E3B23">CALIBRATED 20-EPISODE NIELSEN RATINGS GRID</text>`;

    return `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Broadcast Earnings and Accuracy Trend Chart">
        <rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" rx="6" fill="#FFFDF7" fill-opacity="0.7" />
        ${gridSvg}
        ${singleMarker}
      </svg>
    `;
  }

  const cashPts = matches.map((m, idx) => {
    const x = padL + (idx / (matches.length - 1)) * plotW;
    const y = padT + plotH * (1 - Math.min(1, m.playerCash / maxCashScale));
    return { x, y };
  });

  const accPts = matches.map((m, idx) => {
    const acc =
      m.cluesAnswered > 0
        ? Math.min(100, Math.max(0, (m.cluesCorrect / m.cluesAnswered) * 100))
        : 0;
    const x = padL + (idx / (matches.length - 1)) * plotW;
    const y = padT + plotH * (1 - acc / 100);
    return { x, y };
  });

  const cashCurve = buildSmoothSvgPathV8(cashPts);
  const cashArea = `${cashCurve} L ${cashPts[cashPts.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${cashPts[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;
  const accCurve = buildSmoothSvgPathV8(accPts);

  const nodesSvg = matches
    .map((m, idx) => {
      const cp = cashPts[idx];
      const ap = accPts[idx];
      const isSel = idx === selectedIdx;
      const showTick =
        matches.length <= 8 ||
        idx === 0 ||
        idx === matches.length - 1 ||
        idx % 3 === 0 ||
        isSel;
      return `
        <g class="ws8-cs-node-hit" data-match-idx="${idx}" tabindex="0" role="button" aria-label="${escapeHtmlV8(m.label)}: ${formatDollarsV8(m.playerCash)}">
          ${
            isSel
              ? `<line x1="${cp.x.toFixed(1)}" y1="${padT}" x2="${cp.x.toFixed(1)}" y2="${padT + plotH}" stroke="#D9A441" stroke-width="2" />`
              : ''
          }
          <circle cx="${cp.x.toFixed(1)}" cy="${cp.y.toFixed(1)}" r="${isSel ? '7.5' : '5.2'}" fill="${m.won ? '#008B94' : '#E6397A'}" stroke="#FFFDF7" stroke-width="2" />
          <circle cx="${ap.x.toFixed(1)}" cy="${ap.y.toFixed(1)}" r="${isSel ? '6.5' : '4.4'}" fill="#FF6B35" stroke="#FFFDF7" stroke-width="1.8" />
          <rect x="${(cp.x - 14).toFixed(1)}" y="${padT}" width="28" height="${plotH}" fill="transparent" />
          ${
            showTick
              ? `<text x="${cp.x.toFixed(1)}" y="${H - 8}" text-anchor="middle" font-family="'Jost', sans-serif" font-size="12" font-weight="${isSel ? '900' : '700'}" fill="#4A321F">#${idx + 1}</text>`
              : ''
          }
        </g>
      `;
    })
    .join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="20-Episode Broadcast Earnings and Accuracy Trend Graph">
      <defs>
        <linearGradient id="ws8-cs-teal-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#008B94" stop-opacity="0.34" />
          <stop offset="100%" stop-color="#008B94" stop-opacity="0.03" />
        </linearGradient>
      </defs>
      <rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" rx="6" fill="#FFFDF7" fill-opacity="0.72" />
      ${gridSvg}
      <path d="${cashArea}" fill="url(#ws8-cs-teal-area)" />
      <path d="${cashCurve}" fill="none" stroke="#008B94" stroke-width="3.2" stroke-linecap="round" />
      <path d="${accCurve}" fill="none" stroke="#FF6B35" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="6 3" />
      ${nodesSvg}
    </svg>
  `;
}

// ----------------------------------------------------------------------------
// 3. Main Modal Controller (`openCareerStatsDashboardModalV8`)
// ----------------------------------------------------------------------------

export function openCareerStatsDashboardModalV8(
  container: HTMLElement,
  opts?: CareerStatsDashboardModalOptionsV8,
): { close: () => void; element: HTMLElement } {
  ensureCareerStatsDashboardStylesV8();

  const existing = container.querySelector('.ws8-cs-backdrop');
  if (existing) existing.remove();

  const ledger = opts?.ledger ?? loadCareerStatsLedgerV8();
  const dailyStreak = Math.max(0, Math.floor(opts?.dailyStreak ?? 0));
  const bestDailyStreak = Math.max(
    dailyStreak,
    Math.floor(opts?.bestDailyStreak ?? 0),
  );

  let activeTab: CareerStatsDashboardTabIdV8 = opts?.initialTab ?? 'OVERVIEW';
  let activeDomainFilter: BroadcastAnalyticsDomainIdV8 | 'ALL' = 'ALL';
  let activeCategorySort: CategorySortModeV8 = 'ACCURACY_DESC';

  const last20Matches = ledger.recentMatches.slice(-20);
  let selectedMatchIdx = Math.max(0, last20Matches.length - 1);

  const backdrop = document.createElement('div');
  backdrop.className = 'ws8-cs-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute(
    'aria-label',
    'IBC Research Department Historical Ratings and Career Analytics',
  );

  let closed = false;
  const handleKeyDown = (ev: KeyboardEvent): void => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      close();
    }
  };

  function close(): void {
    if (closed) return;
    closed = true;
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
    }
    backdrop.remove();
    opts?.onClose?.();
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }

  backdrop.addEventListener('click', (ev) => {
    if (ev.target === backdrop) {
      close();
    }
  });

  function renderOverviewTabHtml(): string {
    const clueAccPct =
      ledger.totalCluesAnswered > 0
        ? Math.round(
            (ledger.totalCluesCorrect / ledger.totalCluesAnswered) * 100,
          )
        : 0;
    const matchWinPct =
      ledger.totalMatchesPlayed > 0
        ? Math.round(
            (ledger.totalMatchesWon / ledger.totalMatchesPlayed) * 100,
          )
        : 0;
    const avgBuzzSec =
      ledger.totalCluesAnswered > 0 && ledger.totalResponseMs > 0
        ? `${(ledger.totalResponseMs / ledger.totalCluesAnswered / 1000).toFixed(1)}s`
        : '--';
    const clutchWagerPct =
      ledger.finalWagersAttempted > 0
        ? `${Math.round((ledger.finalWagersWon / ledger.finalWagersAttempted) * 100)}%`
        : '--';

    const hasAnyData =
      ledger.totalMatchesPlayed > 0 || ledger.totalCluesAnswered > 0;
    const callouts = computeWheelhouseAndPracticeCalloutsV8(ledger);

    const wheelhouseChipHtml = callouts.wheelhouse
      ? `
        <div class="ws8-cs-callout-chip" data-kind="wheelhouse">
          <div class="ws8-cs-callout-copy">
            <span class="ws8-cs-callout-kicker">${renderStarCrestSvgV8('#008B94')} TOP WHEELHOUSE</span>
            <span class="ws8-cs-callout-val">${escapeHtmlV8(callouts.wheelhouse.friendlyName)} · ${callouts.wheelhouse.accuracyPct}% (${callouts.wheelhouse.correct}/${callouts.wheelhouse.attempts})</span>
          </div>
        </div>
      `
      : `
        <div class="ws8-cs-callout-chip" data-kind="wheelhouse">
          <div class="ws8-cs-callout-copy">
            <span class="ws8-cs-callout-kicker">${renderStarCrestSvgV8('#008B94')} TOP WHEELHOUSE</span>
            <span class="ws8-cs-callout-val">Answer clues on air to crown your #1 turf</span>
          </div>
        </div>
      `;

    const practiceTarget: CategoryBreakdownItemV8 | null =
      callouts.practiceTarget;
    const practiceChipHtml = practiceTarget
      ? `
        <div class="ws8-cs-callout-chip" data-kind="practice">
          <div class="ws8-cs-callout-copy">
            <span class="ws8-cs-callout-kicker">${renderBullseyeTargetSvgV8('#FF6B35')} TOP PRACTICE TARGET</span>
            <span class="ws8-cs-callout-val">${escapeHtmlV8(practiceTarget.friendlyName)} · ${practiceTarget.attempts > 0 ? `${practiceTarget.accuracyPct}% (${practiceTarget.correct}/${practiceTarget.attempts})` : 'Unexplored Turf'}</span>
          </div>
          ${
            opts?.onPracticeCategory
              ? `<button type="button" class="ws8-cs-practice-btn" data-practice-cat="${escapeHtmlV8(practiceTarget.category)}">PRACTICE</button>`
              : ''
          }
        </div>
      `
      : `
        <div class="ws8-cs-callout-chip" data-kind="practice">
          <div class="ws8-cs-callout-copy">
            <span class="ws8-cs-callout-kicker">${renderBullseyeTargetSvgV8('#FF6B35')} TOP PRACTICE TARGET</span>
            <span class="ws8-cs-callout-val">Play your debut broadcast to spot weak turf</span>
          </div>
        </div>
      `;

    const selectedMatch = last20Matches[selectedMatchIdx] ?? null;
    const selectedMatchAcc =
      selectedMatch && selectedMatch.cluesAnswered > 0
        ? Math.round(
            (selectedMatch.cluesCorrect / selectedMatch.cluesAnswered) * 100,
          )
        : 0;

    const tooltipBarHtml = selectedMatch
      ? `
        <div class="ws8-cs-trend-tooltip-bar" data-role="trend-readout">
          <span><strong>${escapeHtmlV8(selectedMatch.label)}</strong> vs ${escapeHtmlV8(selectedMatch.rivalName)} · <strong style="color:${selectedMatch.won ? '#008B94' : '#E6397A'}">${selectedMatch.won ? 'VICTORY' : 'CHALLENGER LOSS'}</strong></span>
          <span>BANKED: <strong>${formatDollarsV8(selectedMatch.playerCash)}</strong> · ACCURACY: <strong>${selectedMatchAcc}%</strong> (${selectedMatch.cluesCorrect}/${selectedMatch.cluesAnswered}) · STREAK: <strong>${selectedMatch.bestMatchStreak}x</strong></span>
        </div>
      `
      : `
        <div class="ws8-cs-trend-tooltip-bar" data-role="trend-readout">
          <span><strong>IBC RESEARCH LOGBOOK STANDBY</strong> · Last 20 Broadcasts</span>
          <span><span class="ws8-cs-legend-dot" style="background:#008B94"></span>Cash Banked &nbsp; <span class="ws8-cs-legend-dot" style="background:#FF6B35"></span>Clue Accuracy %</span>
        </div>
      `;

    return `
      <div class="ws8-cs-overview-top">
        <section class="ws8-cs-plaque ws8-cs-donut-card">
          <div class="ws8-cs-section-head" style="width:100%;margin-bottom:2px">
            <h3 class="ws8-cs-section-title">1966 NIELSEN COMPOSITE</h3>
          </div>
          <div class="ws8-cs-donut-wrap">
            ${renderMultiRingDonutSvgV8(clueAccPct, matchWinPct, hasAnyData)}
          </div>
          <div class="ws8-cs-donut-legend">
            <span><span class="ws8-cs-legend-dot" style="background:#008B94"></span>Clue Acc (${clueAccPct}%)</span>
            <span><span class="ws8-cs-legend-dot" style="background:#F2A922"></span>Match Win (${matchWinPct}%)</span>
          </div>
          <div class="ws8-cs-callout-stack">
            ${wheelhouseChipHtml}
            ${practiceChipHtml}
          </div>
        </section>

        <section class="ws8-cs-kpi-grid" aria-label="Career Key Performance Indicators">
          <div class="ws8-cs-kpi-card" style="--ws8-kpi-accent:#008B94">
            <span class="ws8-cs-kpi-label">LIFETIME EARNINGS</span>
            <div class="ws8-cs-kpi-flap">${formatDollarsV8(ledger.lifetimeCashEarned)}</div>
            <span class="ws8-cs-kpi-foot">Best Single Show: ${formatDollarsV8(ledger.highestSingleMatchCash)}</span>
          </div>
          <div class="ws8-cs-kpi-card" style="--ws8-kpi-accent:#F2A922">
            <span class="ws8-cs-kpi-label">EPISODES WON</span>
            <div class="ws8-cs-kpi-flap">${ledger.totalMatchesWon} / ${ledger.totalMatchesPlayed}</div>
            <span class="ws8-cs-kpi-foot">${matchWinPct}% Network Win Share</span>
          </div>
          <div class="ws8-cs-kpi-card" style="--ws8-kpi-accent:#1746A2">
            <span class="ws8-cs-kpi-label">CLUE ACCURACY</span>
            <div class="ws8-cs-kpi-flap">${clueAccPct}%</div>
            <span class="ws8-cs-kpi-foot">${ledger.totalCluesCorrect} / ${ledger.totalCluesAnswered} Clues Solved</span>
          </div>
          <div class="ws8-cs-kpi-card" style="--ws8-kpi-accent:#FF6B35">
            <span class="ws8-cs-kpi-label">BEST ANSWER STREAK</span>
            <div class="ws8-cs-kpi-flap">${ledger.bestAnswerStreakEver}x</div>
            <span class="ws8-cs-kpi-foot">Current Live Run: ${ledger.currentAnswerStreak}x</span>
          </div>
          <div class="ws8-cs-kpi-card" style="--ws8-kpi-accent:#009E73">
            <span class="ws8-cs-kpi-label">AVG BUZZ SPEED</span>
            <div class="ws8-cs-kpi-flap">${avgBuzzSec}</div>
            <span class="ws8-cs-kpi-foot">Vaults:&nbsp;${ledger.vaultsCracked} · Bargains:&nbsp;${ledger.bargainsBought}</span>
          </div>
          <div class="ws8-cs-kpi-card" style="--ws8-kpi-accent:#E6397A">
            <span class="ws8-cs-kpi-label">FINAL WAGER CLUTCH %</span>
            <div class="ws8-cs-kpi-flap">${clutchWagerPct}</div>
            <span class="ws8-cs-kpi-foot">${ledger.finalWagersWon} / ${ledger.finalWagersAttempted} Act III Wagers Won</span>
          </div>
        </section>
      </div>

      <section class="ws8-cs-plaque ws8-cs-trend-wrap">
        <div class="ws8-cs-section-head" style="margin-bottom:2px">
          <h3 class="ws8-cs-section-title">BROADCAST EARNINGS &amp; ACCURACY TREND (LAST 20 SHOWS)</h3>
          <span class="ws8-cs-section-sub"><span class="ws8-cs-legend-dot" style="background:#008B94"></span>Cash Banked &nbsp; <span class="ws8-cs-legend-dot" style="background:#FF6B35"></span>Accuracy % (Tap node to inspect)</span>
        </div>
        ${tooltipBarHtml}
        <div class="ws8-cs-trend-svg-box">
          ${renderTrendGraphSvgV8(last20Matches, selectedMatchIdx)}
        </div>
        ${
          last20Matches.length < 2
            ? `<div class="ws8-cs-brass-ribbon">PLAY EPISODES TO PLOT YOUR LIVE RATINGS CURVE!</div>`
            : ''
        }
      </section>
    `;
  }

  function renderCategoriesTabHtml(): string {
    const domains = computeDomainBreakdownV8(ledger);
    const totalAttempts = ledger.totalCluesAnswered;
    const totalCorrect = ledger.totalCluesCorrect;
    const allAccPct =
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    const sortedCategories = computeSortedCategoriesV8(
      ledger,
      activeDomainFilter,
      activeCategorySort,
    );

    const allRowHtml = `
      <button type="button" class="ws8-cs-domain-btn" data-domain-filter="ALL" data-active="${activeDomainFilter === 'ALL'}">
        <span class="ws8-cs-domain-name"><span class="ws8-cs-legend-dot" style="background:#008B94"></span>ALL 5 DOMAINS</span>
        <div class="ws8-cs-track"><div class="ws8-cs-fill" style="width:${allAccPct}%;background:linear-gradient(90deg,#008B94,#F2A922)"></div></div>
        <span class="ws8-cs-domain-metrics">${allAccPct}% · ${totalCorrect}/${totalAttempts}</span>
      </button>
    `;

    const domainBarsHtml = domains
      .map(
        (d) => `
        <button type="button" class="ws8-cs-domain-btn" data-domain-filter="${d.domainId}" data-active="${activeDomainFilter === d.domainId}">
          <span class="ws8-cs-domain-name"><span class="ws8-cs-legend-dot" style="background:${d.hexColor}"></span>${escapeHtmlV8(d.title)}</span>
          <div class="ws8-cs-track"><div class="ws8-cs-fill" style="width:${d.accuracyPct}%;background:${d.hexColor}"></div></div>
          <span class="ws8-cs-domain-metrics">${d.accuracyPct}% · ${d.correct}/${d.attempts}</span>
        </button>
      `,
      )
      .join('');

    const sortButtons: readonly {
      readonly id: CategorySortModeV8;
      readonly label: string;
    }[] = [
      { id: 'ACCURACY_DESC', label: 'BEST %' },
      { id: 'WEAKEST_FIRST', label: 'WEAKEST FIRST' },
      { id: 'MOST_PLAYED', label: 'MOST PLAYED' },
      { id: 'BEST_STREAK', label: 'BEST STREAK' },
    ];

    const sortPillsHtml = sortButtons
      .map(
        (s) =>
          `<button type="button" class="ws8-cs-sort-pill" data-cat-sort="${s.id}" data-active="${activeCategorySort === s.id}">${s.label}</button>`,
      )
      .join('');

    const categoryRowsHtml = sortedCategories
      .map((cat) => {
        const speedText = cat.attempts > 0 ? `${cat.avgSec.toFixed(1)}s` : '--';
        return `
          <div class="ws8-cs-cat-row">
            <div class="ws8-cs-cat-top">
              <span class="ws8-cs-cat-title">
                <span class="ws8-cs-legend-dot" style="background:${cat.domainHex}"></span>
                ${escapeHtmlV8(cat.friendlyName)}
              </span>
              <span class="ws8-cs-badge" data-status="${cat.statusBadge}">${cat.statusBadge}</span>
            </div>
            <div class="ws8-cs-track">
              <div class="ws8-cs-fill" style="width:${cat.accuracyPct}%;background:${cat.domainHex}"></div>
            </div>
            <div class="ws8-cs-cat-meta">
              <span><strong>${cat.accuracyPct}%</strong> (${cat.correct}/${cat.attempts} Correct)</span>
              <span>Speed: <strong>${speedText}</strong> · Streak: <strong>${cat.bestStreak}x</strong> · ${formatDollarsV8(cat.cashEarned)}</span>
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <section class="ws8-cs-plaque">
        <div class="ws8-cs-section-head">
          <h3 class="ws8-cs-section-title">5-DOMAIN BROADCAST INDEX (CLICK ANY BAR TO DRILL DOWN)</h3>
          <span class="ws8-cs-section-sub">Showing ${sortedCategories.length} of 20 Categories</span>
        </div>
        <div class="ws8-cs-domain-bars">
          ${allRowHtml}
          ${domainBarsHtml}
        </div>
      </section>

      <section class="ws8-cs-plaque">
        <div class="ws8-cs-sort-bar">
          <h3 class="ws8-cs-section-title">CATEGORY TELEMETRY LEDGER</h3>
          <div class="ws8-cs-sort-pills" role="group" aria-label="Sort Categories">
            ${sortPillsHtml}
          </div>
        </div>
        <div class="ws8-cs-cat-list">
          ${categoryRowsHtml}
        </div>
      </section>
    `;
  }

  function renderFormatsAndCheatsTabHtml(): string {
    const breakdown = computeFormatAndLifelineBreakdownV8(ledger);
    const cSum = breakdown.classicSummary;
    const sSum = breakdown.showcaseSummary;

    const classicRowsHtml = breakdown.classicCardStyles
      .map(
        (row) => `
        <div class="ws8-cs-format-item">
          <div class="ws8-cs-cat-top">
            <span class="ws8-cs-cat-title">${escapeHtmlV8(row.title)}</span>
            <strong style="font-size:13.5px;color:#23180F">${row.accuracyPct}%</strong>
          </div>
          <div class="ws8-cs-track"><div class="ws8-cs-fill" style="width:${row.accuracyPct}%;background:${row.hexColor}"></div></div>
          <div class="ws8-cs-cat-meta">
            <span>${row.correct}/${row.attempts} Correct</span>
            <span>${row.attempts > 0 ? `${row.avgSec.toFixed(1)}s` : '--'} · ${formatDollarsV8(row.cashEarned)}</span>
          </div>
        </div>
      `,
      )
      .join('');

    const showcaseSorted = [...breakdown.showcaseContraptions].sort(
      (a, b) => b.attempts - a.attempts || b.accuracyPct - a.accuracyPct,
    );
    const showcaseRowsHtml = showcaseSorted
      .map(
        (row) => `
        <div class="ws8-cs-format-item">
          <div class="ws8-cs-cat-top">
            <span class="ws8-cs-cat-title">${escapeHtmlV8(row.title)}</span>
            <strong style="font-size:13.5px;color:#23180F">${row.accuracyPct}%</strong>
          </div>
          <div class="ws8-cs-track"><div class="ws8-cs-fill" style="width:${row.accuracyPct}%;background:${row.hexColor}"></div></div>
          <div class="ws8-cs-cat-meta">
            <span>${row.correct}/${row.attempts} Correct</span>
            <span>${row.attempts > 0 ? `${row.avgSec.toFixed(1)}s` : '--'} · ${formatDollarsV8(row.cashEarned)}</span>
          </div>
        </div>
      `,
      )
      .join('');

    const lifelinesHtml = breakdown.lifelines
      .map(
        (ll) => `
        <div class="ws8-cs-lifeline-card" style="--ws8-ll-color:${ll.hexColor}">
          <div>
            <div class="ws8-cs-kpi-label" style="color:${ll.hexColor}">${escapeHtmlV8(ll.title)}</div>
            <div style="font-size:13px;font-weight:700;color:#5C432E;margin-top:2px">${escapeHtmlV8(ll.subtitle)}</div>
          </div>
          <div class="ws8-cs-kpi-flap">${ll.used > 0 ? `${ll.winConversionPct}% WIN` : '0 USED'}</div>
          <div class="ws8-cs-track"><div class="ws8-cs-fill" style="width:${ll.winConversionPct}%;background:${ll.hexColor}"></div></div>
          <div class="ws8-cs-cat-meta">
            <span>Uses: <strong>${ll.used}</strong></span>
            <span>Converted Wins: <strong>${ll.wins}</strong></span>
          </div>
        </div>
      `,
      )
      .join('');

    return `
      <section class="ws8-cs-plaque">
        <div class="ws8-cs-section-head">
          <h3 class="ws8-cs-section-title">75% CLASSIC MONITOR CARDS VS 25% SHOWCASE CONTRAPTIONS</h3>
        </div>
        <div class="ws8-cs-split-compare">
          <div class="ws8-cs-compare-hero" style="border-top:4px solid #008B94">
            <span class="ws8-cs-kpi-label">CLASSIC 4-OPTION MONITORS</span>
            <div class="ws8-cs-kpi-flap">${cSum.accuracyPct}% (${cSum.correct}/${cSum.attempts})</div>
            <div class="ws8-cs-track"><div class="ws8-cs-fill" style="width:${cSum.accuracyPct}%;background:#008B94"></div></div>
            <span class="ws8-cs-kpi-foot">Avg Speed: ${cSum.attempts > 0 ? `${cSum.avgSec.toFixed(1)}s` : '--'} · Banked: ${formatDollarsV8(cSum.cashEarned)}</span>
          </div>
          <div class="ws8-cs-compare-hero" style="border-top:4px solid #FF6B35">
            <span class="ws8-cs-kpi-label">SPECIAL SHOWCASE CONTRAPTIONS</span>
            <div class="ws8-cs-kpi-flap">${sSum.accuracyPct}% (${sSum.correct}/${sSum.attempts})</div>
            <div class="ws8-cs-track"><div class="ws8-cs-fill" style="width:${sSum.accuracyPct}%;background:#FF6B35"></div></div>
            <span class="ws8-cs-kpi-foot">Avg Speed: ${sSum.attempts > 0 ? `${sSum.avgSec.toFixed(1)}s` : '--'} · Banked: ${formatDollarsV8(sSum.cashEarned)}</span>
          </div>
        </div>
      </section>

      <section class="ws8-cs-plaque">
        <div class="ws8-cs-section-head">
          <h3 class="ws8-cs-section-title">ILLUMINATED STUDIO LIFELINE ROI</h3>
          <span class="ws8-cs-section-sub">Uses &amp; Clue Win Conversion Rate</span>
        </div>
        <div class="ws8-cs-lifeline-grid">
          ${lifelinesHtml}
        </div>
      </section>

      <section class="ws8-cs-plaque">
        <div class="ws8-cs-section-head">
          <h3 class="ws8-cs-section-title">CLASSIC 4-OPTION MONITOR STYLES (5)</h3>
        </div>
        <div class="ws8-cs-format-grid">
          ${classicRowsHtml}
        </div>
      </section>

      <section class="ws8-cs-plaque">
        <div class="ws8-cs-section-head">
          <h3 class="ws8-cs-section-title">SHOWCASE CONTRAPTION TELEMETRY (13)</h3>
        </div>
        <div class="ws8-cs-format-grid">
          ${showcaseRowsHtml}
        </div>
      </section>
    `;
  }

  function renderStreaksAndBoardsTabHtml(): string {
    const boardModes = computeBoardModesBreakdownV8(ledger);
    const ansTarget = Math.max(10, ledger.bestAnswerStreakEver, 1);
    const ansFillPct = Math.min(
      100,
      Math.round((ledger.bestAnswerStreakEver / ansTarget) * 100),
    );

    const winTarget = Math.max(5, ledger.bestMatchWinStreakEver, 1);
    const winFillPct = Math.min(
      100,
      Math.round((ledger.bestMatchWinStreakEver / winTarget) * 100),
    );

    const dailyTarget = Math.max(7, bestDailyStreak, 1);
    const dailyFillPct = Math.min(
      100,
      Math.round((bestDailyStreak / dailyTarget) * 100),
    );

    const boardsHtml = boardModes
      .map(
        (bm) => `
        <div class="ws8-cs-board-card" style="--ws8-bm-color:${bm.hexColor}">
          <div>
            <div class="ws8-cs-kpi-label" style="color:${bm.hexColor}">${escapeHtmlV8(bm.shortTitle)}</div>
            <div style="font-size:13px;font-weight:700;color:#5C432E;margin-top:2px">${escapeHtmlV8(bm.fullTitle)}</div>
          </div>
          <div class="ws8-cs-kpi-flap" style="font-size:20px">${bm.played > 0 ? `${bm.winPct}% WIN` : 'UNPLAYED'}</div>
          <div class="ws8-cs-track"><div class="ws8-cs-fill" style="width:${bm.winPct}%;background:${bm.hexColor}"></div></div>
          <div class="ws8-cs-cat-meta">
            <span>Won: <strong>${bm.won}/${bm.played}</strong></span>
            <span>Best: <strong>${formatDollarsV8(bm.bestCash)}</strong></span>
          </div>
        </div>
      `,
      )
      .join('');

    return `
      <section class="ws8-cs-plaque">
        <div class="ws8-cs-section-head">
          <h3 class="ws8-cs-section-title">STREAK MILESTONE THERMOMETERS</h3>
          <span class="ws8-cs-section-sub">Gremlins Survived: ${ledger.gremlinsSurvived} · Gold Vaults Cracked: ${ledger.vaultsCracked}</span>
        </div>
        <div class="ws8-cs-thermo-grid">
          <div class="ws8-cs-thermo-card">
            <span class="ws8-cs-kpi-label">CONSECUTIVE CLUE STREAK</span>
            <div class="ws8-cs-kpi-flap">${ledger.currentAnswerStreak}x NOW · ${ledger.bestAnswerStreakEver}x RECORD</div>
            <div class="ws8-cs-thermo-tube"><div class="ws8-cs-thermo-mercury" style="width:${ansFillPct}%"></div></div>
            <span class="ws8-cs-kpi-foot">Next Studio Milestone: ${ansTarget}x Hot-Streak</span>
          </div>
          <div class="ws8-cs-thermo-card">
            <span class="ws8-cs-kpi-label">CHAMPION EPISODE STREAK</span>
            <div class="ws8-cs-kpi-flap">${ledger.currentMatchWinStreak}x NOW · ${ledger.bestMatchWinStreakEver}x RECORD</div>
            <div class="ws8-cs-thermo-tube"><div class="ws8-cs-thermo-mercury" style="width:${winFillPct}%"></div></div>
            <span class="ws8-cs-kpi-foot">Returning Champion Title Defenses</span>
          </div>
          <div class="ws8-cs-thermo-card">
            <span class="ws8-cs-kpi-label">DAILY 1966 BROADCAST STREAK</span>
            <div class="ws8-cs-kpi-flap">${dailyStreak}d NOW · ${bestDailyStreak}d RECORD</div>
            <div class="ws8-cs-thermo-tube"><div class="ws8-cs-thermo-mercury" style="width:${dailyFillPct}%"></div></div>
            <span class="ws8-cs-kpi-foot">Global Seeded Matinee Tape Run</span>
          </div>
        </div>
      </section>

      <section class="ws8-cs-plaque">
        <div class="ws8-cs-section-head">
          <h3 class="ws8-cs-section-title">8 TV BOARD FORMATS MASTERY GRID</h3>
          <span class="ws8-cs-section-sub">Win Share &amp; Personal High Score per Studio Rack</span>
        </div>
        <div class="ws8-cs-board-grid">
          ${boardsHtml}
        </div>
      </section>
    `;
  }

  function renderActiveTabContent(): string {
    if (activeTab === 'CATEGORIES') return renderCategoriesTabHtml();
    if (activeTab === 'FORMATS_CHEATS') return renderFormatsAndCheatsTabHtml();
    if (activeTab === 'STREAKS_BOARDS') return renderStreaksAndBoardsTabHtml();
    return renderOverviewTabHtml();
  }

  function renderShell(): void {
    const tabs: readonly {
      readonly id: CareerStatsDashboardTabIdV8;
      readonly label: string;
    }[] = [
      { id: 'OVERVIEW', label: 'OVERVIEW & RATINGS CURVE' },
      { id: 'CATEGORIES', label: 'CATEGORIES & DRILL-DOWN' },
      { id: 'FORMATS_CHEATS', label: 'QUESTION TYPES & CHEATS' },
      { id: 'STREAKS_BOARDS', label: 'STREAKS & BOARD MODES' },
    ];

    backdrop.innerHTML = `
      <div class="ws8-cs-walnut-frame">
        <div class="ws8-cs-folio-sheet">
          <header class="ws8-cs-header">
            <div class="ws8-cs-header-titles">
              <div class="ws8-cs-kicker">
                <span class="ws8-cs-bulb-trio"><span class="ws8-cs-bulb"></span><span class="ws8-cs-bulb"></span><span class="ws8-cs-bulb"></span></span>
                <span>IBC RESEARCH DEPT. · HISTORICAL RATINGS &amp; CAREER ANALYTICS</span>
              </div>
              <h2 class="ws8-cs-title">STUDIO 6A CONTESTANT RATINGS LEDGER</h2>
            </div>
            <button type="button" class="ws8-cs-close-btn" data-action="close-modal">CLOSE ×</button>
          </header>

          <nav class="ws8-cs-tab-bar" role="tablist" aria-label="Career Analytics Sections">
            ${tabs
              .map(
                (t) =>
                  `<button type="button" role="tab" class="ws8-cs-tab-btn" data-tab-id="${t.id}" aria-selected="${activeTab === t.id}">${t.label}</button>`,
              )
              .join('')}
          </nav>

          <main class="ws8-cs-body" data-role="tab-body">
            ${renderActiveTabContent()}
          </main>
        </div>
      </div>
    `;

    wireInteractiveEvents();
  }

  function refreshTabBodyOnly(): void {
    const bodyEl = backdrop.querySelector<HTMLElement>('[data-role="tab-body"]');
    if (!bodyEl) {
      renderShell();
      return;
    }
    bodyEl.innerHTML = renderActiveTabContent();
    wireBodyEvents(bodyEl);
  }

  function wireBodyEvents(scope: ParentNode): void {
    // Trend chart interactive nodes
    scope.querySelectorAll<SVGGElement>('[data-match-idx]').forEach((node) => {
      const selectNode = (): void => {
        const idx = Number(node.getAttribute('data-match-idx'));
        if (
          Number.isFinite(idx) &&
          idx >= 0 &&
          idx < last20Matches.length &&
          idx !== selectedMatchIdx
        ) {
          selectedMatchIdx = idx;
          refreshTabBodyOnly();
        }
      };
      node.addEventListener('click', selectNode);
      node.addEventListener('mouseenter', selectNode);
      node.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          selectNode();
        }
      });
    });

    // Practice CTA button
    scope
      .querySelectorAll<HTMLButtonElement>('[data-practice-cat]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const cat = btn.getAttribute('data-practice-cat') as CategoryIdV7 | null;
          if (cat && opts?.onPracticeCategory) {
            close();
            opts.onPracticeCategory(cat);
          }
        });
      });

    // Domain drill-down bar buttons
    scope
      .querySelectorAll<HTMLButtonElement>('[data-domain-filter]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const dom = btn.getAttribute('data-domain-filter') as
            | BroadcastAnalyticsDomainIdV8
            | 'ALL'
            | null;
          if (dom) {
            activeDomainFilter = dom;
            refreshTabBodyOnly();
          }
        });
      });

    // Category sort pills
    scope
      .querySelectorAll<HTMLButtonElement>('[data-cat-sort]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const sortMode = btn.getAttribute(
            'data-cat-sort',
          ) as CategorySortModeV8 | null;
          if (sortMode) {
            activeCategorySort = sortMode;
            refreshTabBodyOnly();
          }
        });
      });
  }

  function wireInteractiveEvents(): void {
    const closeBtn = backdrop.querySelector<HTMLButtonElement>(
      '[data-action="close-modal"]',
    );
    closeBtn?.addEventListener('click', () => close());

    const tabButtons = Array.from(
      backdrop.querySelectorAll<HTMLButtonElement>('[data-tab-id]'),
    );
    tabButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const nextTab = btn.getAttribute(
          'data-tab-id',
        ) as CareerStatsDashboardTabIdV8 | null;
        if (nextTab && nextTab !== activeTab) {
          activeTab = nextTab;
          tabButtons.forEach((b) =>
            b.setAttribute(
              'aria-selected',
              String(b.getAttribute('data-tab-id') === activeTab),
            ),
          );
          refreshTabBodyOnly();
        }
      });
      btn.addEventListener('keydown', (ev) => {
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
          ev.preventDefault();
          const delta = ev.key === 'ArrowRight' ? 1 : -1;
          const nextIdx =
            (idx + delta + tabButtons.length) % tabButtons.length;
          tabButtons[nextIdx]?.focus();
          tabButtons[nextIdx]?.click();
        }
      });
    });

    const bodyEl = backdrop.querySelector<HTMLElement>('[data-role="tab-body"]');
    if (bodyEl) wireBodyEvents(bodyEl);
  }

  renderShell();
  container.appendChild(backdrop);

  return {
    close,
    element: backdrop,
  };
}
