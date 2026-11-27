// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 "Sweeps Week Deluxe")
// `src/v7/ui/BroadcastTapeVaultDrawerV8.ts`
// 1966 CBS / IBC Studio 6A Ampex 2-Inch Master Tape Logbook Folio:
//   - Warm Broadcast Cream (#FAF2DF) & Sunlit American Walnut (#6E3B23) Folio
//   - Radiant Peacock Teal (#008B94 -> #1746A2) Marquee Crown w/ custom vector
//     Harvest Gold streak/star badges (zero OS emojis!) & single clean `CLOSE ×`
//   - Featured Today Live Hero Plaque (#FFFBF0) w/ spun-aluminum Ampex 2-inch
//     reel SVG + Champion's real gouache portrait (`200% 200%` top-left neutral
//     quadrant of `./assets/v7/portraits/<slug>.jpg`), Peacock Teal & Tangerine
//     metadata tags, and bold Atomic Tangerine `PLAY TODAY'S LIVE BROADCAST` CTA
//   - Paged 2×2 Archive Reel Grid (4 whole cards/page on desktop/tablet, 2 whole
//     cards/page on compact mobile/landscape) on Warm Ivory (#FFFDF7) index-card
//     plaques w/ Brushed-Brass Pager Bar — ZERO scroll-sliced cut-off cards!
// ============================================================================

import {
  BOARD_PLAY_MODE_TITLES_V7,
  type CastIdV7,
  type DailyArchiveEntryV8,
  type StageWorldIdV7,
} from '../contracts_v7';
import {
  CAST_PROFILES_V7,
  PORTRAIT_SPRITE_POSITIONS_V7,
  buildCastMonogramSvgDataUriV7,
} from '../campaign/CastAndRelicsCatalogV7';

export interface BroadcastTapeVaultDrawerOptionsV8 {
  readonly entries: readonly DailyArchiveEntryV8[];
  readonly currentStreak: number;
  readonly bestStreak: number;
  readonly onPlayDateIso: (dateIso: string, isToday: boolean) => void;
  readonly onClose?: () => void;
  readonly onTapSfx?: () => void;
}

type VaultShelfFilterV8 = 'ALL' | 'UNPLAYED' | 'COMPLETED';

interface StageVaultLabelSpec {
  readonly callsign: string;
  readonly title: string;
  readonly accentHex: string;
}

/** Exhaustive 10-Stage Studio 6A Master Logbook Catalog (zero Three.js import overhead). */
const STAGE_VAULT_LABELS_V8: Record<StageWorldIdV7, StageVaultLabelSpec> = {
  STAGE_01_IBC_DAYTIME_FUNK: {
    callsign: 'STG 01',
    title: 'Studio 6A Living Color',
    accentHex: '#008B94',
  },
  STAGE_02_IBC_PRIMETIME_JUBILEE: {
    callsign: 'STG 02',
    title: 'IBC Primetime Jubilee',
    accentHex: '#D48806',
  },
  STAGE_03_1926_VAUDEVILLE_PIT: {
    callsign: 'STG 03',
    title: 'Burbank Pop-Art Deck',
    accentHex: '#E6397A',
  },
  STAGE_04_1958_ISOLATION_VAULT: {
    callsign: 'STG 04',
    title: '$64,000 Isolation Booth',
    accentHex: '#008B94',
  },
  STAGE_05_1984_LARSON_CRT_LAB: {
    callsign: 'STG 05',
    title: 'Apollo Color Control',
    accentHex: '#1746A2',
  },
  STAGE_06_ATLANTIC_CITY_PIER: {
    callsign: 'STG 06',
    title: 'Atlantic City Steel Pier',
    accentHex: '#008B94',
  },
  STAGE_07_1969_MONTE_CARLO_CASINO: {
    callsign: 'STG 07',
    title: 'Monte Carlo Royale',
    accentHex: '#15803D',
  },
  STAGE_08_WORLDS_FAIR_GEODESIC: {
    callsign: 'STG 08',
    title: "World's Fair Pavilion",
    accentHex: '#1746A2',
  },
  STAGE_09_CHANNEL_83_UHF_BARGE: {
    callsign: 'STG 09',
    title: 'Channel 83 Offshore Ship',
    accentHex: '#FF6B35',
  },
  STAGE_10_SOVEREIGN_SANCTUM: {
    callsign: 'STG 10',
    title: '38th-Floor Penthouse',
    accentHex: '#C27803',
  },
};

const VAULT_STYLE_ID_V8 = 'ws8-broadcast-tape-vault-css';

// ----------------------------------------------------------------------------
// 1. Idempotent Scoped 1966 Ampex Master Tape Logbook Stylesheet
// ----------------------------------------------------------------------------

export function ensureBroadcastTapeVaultStylesV8(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(VAULT_STYLE_ID_V8)) return;

  const style = document.createElement('style');
  style.id = VAULT_STYLE_ID_V8;
  style.textContent = `
    .ws8-vault-backdrop,
    .ws8-vault-backdrop * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    .ws8-vault-backdrop {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      z-index: 98;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding:
        max(10px, env(safe-area-inset-top, 0px))
        max(12px, env(safe-area-inset-right, 0px))
        max(10px, env(safe-area-inset-bottom, 0px))
        max(12px, env(safe-area-inset-left, 0px));
      background:
        radial-gradient(circle at 50% 16%, rgba(242, 169, 34, 0.22) 0%, rgba(72, 38, 18, 0.76) 56%, rgba(34, 18, 9, 0.88) 100%);
      backdrop-filter: blur(8px);
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', 'Jost', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #141B29;
      user-select: none;
      animation: ws8-vault-enter 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes ws8-vault-enter {
      from { opacity: 0; transform: translateY(8px) scale(0.985); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes ws8-live-dot-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.55; transform: scale(0.84); }
    }

    /* Sunlit American Walnut (#6E3B23) & 24K Brass Outer Folio Cabinet */
    .ws8-vault-cabinet {
      width: min(1000px, 100%);
      max-height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 22px;
      padding: 6px;
      background:
        repeating-linear-gradient(
          92deg,
          rgba(255, 214, 153, 0.06) 0px,
          rgba(255, 214, 153, 0.06) 2px,
          rgba(42, 19, 7, 0.08) 2px,
          rgba(42, 19, 7, 0.08) 6px
        ),
        linear-gradient(145deg, #864A2B 0%, #6E3B23 48%, #542B16 100%);
      border: 2.5px solid #E5A93B;
      box-shadow:
        0 26px 64px rgba(28, 14, 5, 0.62),
        inset 0 2px 0 rgba(255, 232, 182, 0.45);
      overflow: hidden;
    }

    /* Warm Broadcast Cream (#FAF2DF) Master Logbook Interior */
    .ws8-vault-folio-sheet {
      width: 100%;
      max-height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      overflow: hidden;
      background:
        radial-gradient(circle at 50% 0%, #FFFDF7 0%, #FAF2DF 68%, #F3E5C8 100%);
      border: 2px solid #D9B36C;
      box-shadow: inset 0 1px 0 #FFFFFF;
    }

    /* Radiant Peacock Teal (#008B94 -> #1746A2) Marquee Header Crown */
    .ws8-vault-header {
      flex-shrink: 0;
      padding: 11px 16px 10px;
      background:
        radial-gradient(circle at 18% 15%, rgba(255, 224, 130, 0.18) 0%, transparent 48%),
        linear-gradient(102deg, #008B94 0%, #00798C 46%, #1746A2 100%);
      border-bottom: 3px solid #F2A922;
      box-shadow: 0 3px 10px rgba(20, 27, 41, 0.14);
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .ws8-vault-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: nowrap;
    }

    .ws8-vault-brand {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1 1 auto;
    }

    .ws8-vault-room-kicker {
      display: flex;
      align-items: center;
      gap: 7px;
      font-family: 'Michroma', 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #FFE89E;
      text-transform: uppercase;
    }

    .ws8-vault-bulb-strip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .ws8-vault-bulb {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #FFD166;
      box-shadow: 0 0 6px rgba(255, 209, 102, 0.9);
    }

    .ws8-vault-main-title {
      margin: 0;
      font-family: 'Caprasimo', 'Fraunces', 'Jost', serif;
      font-size: clamp(20px, 2.6vw, 26px);
      font-weight: 900;
      line-height: 1.1;
      color: #FFFDF7;
      text-shadow: 0 2px 6px rgba(20, 27, 41, 0.34);
    }

    .ws8-vault-telemetry {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .ws8-vault-stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 40px;
      padding: 6px 12px;
      border-radius: 999px;
      font-family: 'Jost', sans-serif;
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .ws8-vault-stat-pill[data-kind="streak"] {
      background: linear-gradient(180deg, #FFF7DF 0%, #FFE094 100%);
      border: 2px solid #F2A922;
      color: #141B29;
      box-shadow: 0 3px 8px rgba(20, 27, 41, 0.18);
    }

    .ws8-vault-stat-pill[data-kind="best"] {
      background: linear-gradient(180deg, #FFD970 0%, #F2A922 100%);
      border: 2px solid #FFFDF7;
      color: #141B29;
      box-shadow: 0 3px 8px rgba(20, 27, 41, 0.18);
    }

    .ws8-vault-close-btn {
      appearance: none;
      min-width: 96px;
      min-height: 48px;
      padding: 8px 15px;
      border-radius: 12px;
      border: 2px solid #F2A922;
      background: linear-gradient(180deg, #FFFDF7 0%, #F3E5C8 100%);
      color: #141B29;
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
      box-shadow: 0 3px 0 #B67D14, 0 5px 12px rgba(20, 27, 41, 0.22);
      transition: transform 0.12s ease, filter 0.12s ease;
    }

    .ws8-vault-close-btn:hover,
    .ws8-vault-close-btn:focus-visible {
      transform: translateY(-1px);
      filter: brightness(1.03);
      outline: 2px solid #FFFDF7;
      outline-offset: 2px;
    }

    /* Warm Harvest-Ivory Streak-Safe Guarantee Ribbon inside Header */
    .ws8-vault-safety-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 10px;
      padding: 6px 11px;
      background: rgba(255, 251, 240, 0.94);
      border: 1.5px solid #F2A922;
      color: #141B29;
      font-family: 'Jost', sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.02em;
      line-height: 1.25;
    }

    /* Main Folio Body — Strictly Unclipped Paged Layout (ZERO Scroll Cut-Off!) */
    .ws8-vault-body {
      flex: 1 1 auto;
      min-height: 0;
      padding: 12px 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow: hidden;
    }

    /* Featured Today Live Hero Plaque (#FFFBF0) */
    .ws8-today-hero-card {
      flex-shrink: 0;
      border-radius: 16px;
      padding: 11px 14px;
      background:
        radial-gradient(circle at 12% 50%, rgba(242, 169, 34, 0.18) 0%, transparent 52%),
        linear-gradient(135deg, #FFFDF7 0%, #FFFBF0 60%, #F7E8C6 100%);
      border: 2.5px solid #E5A01D;
      border-bottom: 5px solid #C68310;
      box-shadow:
        0 8px 20px rgba(110, 59, 35, 0.14),
        inset 0 1px 0 #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }

    .ws8-today-hero-left {
      display: flex;
      align-items: center;
      gap: 13px;
      min-width: 0;
      flex: 1 1 auto;
    }

    .ws8-tape-visual-pair {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .ws8-ampex-reel-svg {
      width: 56px;
      height: 56px;
      flex-shrink: 0;
      filter: drop-shadow(0 3px 5px rgba(74, 39, 18, 0.24));
    }

    .ws8-archive-card .ws8-ampex-reel-svg {
      width: 48px;
      height: 48px;
    }

    .ws8-rival-medallion {
      width: 54px;
      height: 54px;
      margin-left: -12px;
      border-radius: 50%;
      border: 2.5px solid var(--ws8-rival-accent, #E5A01D);
      background-color: #F4E6C8;
      background-repeat: no-repeat;
      box-shadow: 0 4px 10px rgba(74, 39, 18, 0.28);
      flex-shrink: 0;
    }

    .ws8-archive-card .ws8-rival-medallion {
      width: 46px;
      height: 46px;
      margin-left: -10px;
    }

    .ws8-today-hero-meta {
      display: flex;
      flex-direction: column;
      gap: 5px;
      min-width: 0;
      flex: 1 1 auto;
    }

    .ws8-tape-top {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .ws8-archive-card .ws8-tape-top {
      justify-content: space-between;
    }

    .ws8-tape-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .ws8-tape-badge[data-kind="live"] {
      background: linear-gradient(135deg, #DC2626 0%, #B42318 100%);
      border: 1.5px solid #FCA5A5;
      color: #FFFDF7;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.28);
    }

    .ws8-live-tally-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #FFFDF7;
      box-shadow: 0 0 6px #FFE4E6;
      animation: ws8-live-dot-pulse 1.2s ease-in-out infinite;
    }

    .ws8-tape-badge[data-kind="archive"] {
      background: #EFE3C8;
      border: 1.5px solid #C49A52;
      color: #4A2812;
    }

    .ws8-tape-date-chip {
      font-family: 'Michroma', 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: #6E3B23;
      letter-spacing: 0.03em;
    }

    .ws8-tape-rival-line {
      font-family: 'Plus Jakarta Sans', 'Jost', sans-serif;
      font-size: 17px;
      font-weight: 900;
      line-height: 1.2;
      color: #141B29;
      overflow-wrap: break-word;
    }

    .ws8-archive-card .ws8-tape-rival-line {
      font-size: 15.5px;
    }

    .ws8-tape-tags {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .ws8-tape-tag {
      display: inline-flex;
      align-items: center;
      padding: 3px 9px;
      border-radius: 7px;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 800;
      line-height: 1.2;
    }

    .ws8-tape-tag[data-tone="teal"] {
      background: #E2F4F5;
      border: 1.5px solid #008B94;
      color: #005A60;
    }

    .ws8-tape-tag[data-tone="tangerine"] {
      background: #FFF0E6;
      border: 1.5px solid #FF6B35;
      color: #9E340D;
    }

    .ws8-today-hero-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      gap: 6px;
      flex-shrink: 0;
    }

    /* Stamped Score Status Badges */
    .ws8-tape-stamp {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 8px;
      font-family: 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .ws8-tape-stamp[data-status="won"] {
      background: #E5F7ED;
      border: 1.5px solid #19A85A;
      color: #0D6838;
    }

    .ws8-tape-stamp[data-status="played"] {
      background: #FFF4D6;
      border: 1.5px solid #D98A12;
      color: #7A4806;
    }

    .ws8-tape-stamp[data-status="unplayed"] {
      background: #F4E9D2;
      border: 1.5px dashed #B89456;
      color: #6E3B23;
    }

    /* Tactile 1966 Broadcast CTA Buttons (>= 48x48px) */
    .ws8-tape-play-btn {
      appearance: none;
      min-height: 50px;
      min-width: 146px;
      padding: 10px 18px;
      border-radius: 13px;
      font-family: 'Jost', sans-serif;
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      touch-action: manipulation;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.12s ease, filter 0.12s ease;
      white-space: nowrap;
    }

    .ws8-tape-play-btn[data-kind="live"] {
      background: linear-gradient(180deg, #FF7D4D 0%, #FF6B35 55%, #E04F1A 100%);
      border: 2px solid #8A2B0A;
      color: #FFFDF7;
      box-shadow:
        0 4px 0 #8A2B0A,
        0 8px 16px rgba(255, 107, 53, 0.34);
    }

    .ws8-tape-play-btn[data-kind="archive"] {
      min-height: 48px;
      min-width: 132px;
      padding: 8px 14px;
      font-size: 13.5px;
      background: linear-gradient(180deg, #009CA6 0%, #008B94 55%, #006B73 100%);
      border: 2px solid #004E54;
      color: #FFFDF7;
      box-shadow:
        0 3px 0 #004E54,
        0 5px 12px rgba(0, 139, 148, 0.24);
      margin-left: auto;
    }

    .ws8-tape-play-btn:hover,
    .ws8-tape-play-btn:focus-visible {
      transform: translateY(-1px);
      filter: brightness(1.05);
      outline: 2px solid #141B29;
      outline-offset: 2px;
    }

    /* Archive Shelf Controls Bar: Filter Tabs + Stamped Tally */
    .ws8-vault-controls-row {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      padding: 4px 6px;
      border-radius: 13px;
      background: #F1E3C6;
      border: 1.5px solid #D5B57D;
    }

    .ws8-vault-filter-group {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .ws8-vault-filter-btn {
      appearance: none;
      min-height: 48px;
      min-width: 64px;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1.8px solid #C7A66B;
      background: #FFFDF7;
      color: #4A2812;
      font-family: 'Jost', sans-serif;
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      touch-action: manipulation;
      transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
    }

    .ws8-vault-filter-btn[aria-pressed="true"] {
      background: linear-gradient(180deg, #008B94 0%, #1746A2 100%);
      border-color: #0D327A;
      color: #FFFDF7;
      box-shadow: 0 3px 8px rgba(23, 70, 162, 0.24);
    }

    .ws8-vault-count-label {
      padding-right: 8px;
      font-family: 'Michroma', 'Jost', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: #6E3B23;
      letter-spacing: 0.04em;
    }

    /* Paged 2×2 Archive Reel Grid (100% Whole Unclipped Warm Ivory Plaques!) */
    .ws8-vault-grid {
      flex: 1 1 auto;
      min-height: 0;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: minmax(0, 1fr);
      gap: 10px;
      width: 100%;
      align-content: stretch;
    }

    .ws8-archive-card {
      position: relative;
      min-width: 0;
      border-radius: 14px;
      padding: 10px 13px;
      background: linear-gradient(180deg, #FFFDF7 0%, #FBF3E2 100%);
      border: 1.8px solid #D4B785;
      border-bottom: 4px solid #B79258;
      box-shadow:
        0 4px 12px rgba(110, 59, 35, 0.1),
        inset 0 1px 0 #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 7px;
    }

    .ws8-archive-card[data-completed="true"] {
      border-color: #34B36E;
      border-bottom-color: #19874B;
    }

    .ws8-tape-body {
      display: flex;
      align-items: center;
      gap: 11px;
      min-width: 0;
    }

    .ws8-tape-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      flex: 1 1 auto;
    }

    .ws8-tape-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-top: 6px;
      border-top: 1px solid #E7D5B3;
    }

    .ws8-vault-empty {
      grid-column: 1 / -1;
      border-radius: 14px;
      padding: 24px 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: #FFFDF7;
      border: 2px dashed #C7A66B;
      font-size: 15px;
      font-weight: 800;
      color: #4A2812;
    }

    /* Sleek Brushed-Brass Pager Bar */
    .ws8-vault-pager-bar {
      flex-shrink: 0;
      padding: 8px 16px;
      background:
        repeating-linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.22) 0px,
          rgba(255, 255, 255, 0.22) 1px,
          transparent 1px,
          transparent 3px
        ),
        linear-gradient(180deg, #F6E6C2 0%, #E6C98E 52%, #D4B06A 100%);
      border-top: 2px solid #B6852E;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .ws8-vault-pager-btn {
      appearance: none;
      min-height: 48px;
      min-width: 148px;
      padding: 8px 16px;
      border-radius: 11px;
      border: 2px solid #6E3B23;
      background: linear-gradient(180deg, #FFFDF7 0%, #F5E8CE 100%);
      color: #141B29;
      font-family: 'Jost', sans-serif;
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
      touch-action: manipulation;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 2px 0 #6E3B23;
      transition: transform 0.12s ease, opacity 0.12s ease;
    }

    .ws8-vault-pager-btn:disabled {
      opacity: 0.45;
      cursor: default;
      box-shadow: none;
    }

    .ws8-vault-pager-btn:not(:disabled):hover,
    .ws8-vault-pager-btn:not(:disabled):focus-visible {
      transform: translateY(-1px);
      background: #FFFFFF;
      outline: 2px solid #1746A2;
      outline-offset: 2px;
    }

    .ws8-vault-pager-status {
      font-family: 'Michroma', 'Jost', sans-serif;
      font-size: 13.5px;
      font-weight: 900;
      color: #141B29;
      letter-spacing: 0.05em;
      text-align: center;
      text-transform: uppercase;
    }

    /* Mobile Portrait & Narrow Viewports (< 680px): 1 Column × 2 Whole Cards! */
    @media (max-width: 679px) {
      .ws8-vault-backdrop {
        padding:
          max(4px, env(safe-area-inset-top, 0px))
          max(6px, env(safe-area-inset-right, 0px))
          max(4px, env(safe-area-inset-bottom, 0px))
          max(6px, env(safe-area-inset-left, 0px));
      }
      .ws8-vault-cabinet {
        padding: 4px;
        border-radius: 18px;
      }
      .ws8-vault-header {
        padding: 8px 10px 7px;
        gap: 5px;
      }
      .ws8-vault-room-kicker {
        display: none;
      }
      .ws8-vault-top-row {
        flex-wrap: wrap;
        gap: 6px;
      }
      .ws8-vault-main-title {
        font-size: 18px;
      }
      .ws8-vault-close-btn {
        min-width: 84px;
        padding: 7px 11px;
        font-size: 13px;
      }
      .ws8-vault-stat-pill {
        min-height: 34px;
        padding: 4px 9px;
        font-size: 13px;
      }
      .ws8-vault-safety-banner {
        display: none;
      }
      .ws8-vault-body {
        padding: 8px 9px;
        gap: 7px;
      }
      .ws8-today-hero-card {
        flex-direction: column;
        align-items: stretch;
        padding: 8px 10px;
        gap: 7px;
      }
      .ws8-today-hero-left {
        gap: 9px;
      }
      .ws8-ampex-reel-svg {
        width: 44px;
        height: 44px;
      }
      .ws8-rival-medallion {
        width: 42px;
        height: 42px;
        margin-left: -10px;
      }
      .ws8-tape-rival-line {
        font-size: 15px;
      }
      .ws8-today-hero-actions {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }
      .ws8-tape-play-btn[data-kind="live"] {
        min-height: 48px;
        padding: 8px 12px;
        font-size: 13px;
        flex: 1 1 auto;
      }
      .ws8-today-hero-actions .ws8-tape-stamp {
        display: none;
      }
      .ws8-vault-controls-row {
        padding: 3px 4px;
      }
      .ws8-vault-filter-group {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 5px;
        width: 100%;
      }
      .ws8-vault-filter-btn {
        width: 100%;
        padding: 6px 4px;
        font-size: 13px;
      }
      .ws8-vault-count-label {
        display: none;
      }
      .ws8-vault-grid {
        grid-template-columns: minmax(0, 1fr);
        gap: 7px;
      }
      .ws8-archive-card {
        padding: 7px 10px;
        gap: 5px;
      }
      .ws8-archive-card .ws8-ampex-reel-svg {
        width: 38px;
        height: 38px;
      }
      .ws8-archive-card .ws8-rival-medallion {
        width: 36px;
        height: 36px;
        margin-left: -8px;
      }
      .ws8-archive-card .ws8-tape-rival-line {
        font-size: 14.5px;
      }
      .ws8-archive-card .ws8-tape-tag[data-tone="tangerine"] {
        display: none;
      }
      .ws8-tape-bottom {
        padding-top: 4px;
      }
      .ws8-vault-pager-bar {
        padding: 6px 9px;
        gap: 6px;
      }
      .ws8-vault-pager-btn {
        min-width: 88px;
        padding: 7px 10px;
        font-size: 13px;
      }
      .ws8-vault-pager-status {
        font-size: 13px;
      }
    }

    /* Mobile Landscape Compact (e.g., 844x390, 932x430): 2 Columns × 1 Whole Row! */
    @media (min-width: 680px) and (max-height: 639px) {
      .ws8-vault-backdrop {
        padding: 4px 8px;
      }
      .ws8-vault-cabinet {
        padding: 4px;
      }
      .ws8-vault-header {
        padding: 6px 12px;
        gap: 0;
      }
      .ws8-vault-room-kicker,
      .ws8-vault-safety-banner {
        display: none;
      }
      .ws8-vault-main-title {
        font-size: 18px;
      }
      .ws8-vault-body {
        padding: 6px 10px;
        gap: 6px;
      }
      .ws8-today-hero-card {
        padding: 6px 10px;
      }
      .ws8-ampex-reel-svg,
      .ws8-rival-medallion {
        width: 40px;
        height: 40px;
      }
      .ws8-today-hero-actions .ws8-tape-stamp {
        display: none;
      }
      .ws8-vault-controls-row {
        padding: 2px 6px;
      }
      .ws8-archive-card {
        padding: 6px 10px;
        gap: 4px;
      }
      .ws8-vault-pager-bar {
        padding: 5px 12px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ws8-vault-backdrop,
      .ws8-live-tally-dot {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// ----------------------------------------------------------------------------
// 2. Bespoke 1966 Vector Icons, Ampex 2-Inch Reel & Gouache Portrait Helpers
// ----------------------------------------------------------------------------

function buildFlameIconSvg(): string {
  return `<svg width="15" height="17" viewBox="0 0 16 18" fill="none" aria-hidden="true"><path d="M8.3 1C11.8 4.2 14.2 7.7 12.8 12.1C11.9 14.9 9.6 16.8 6.9 16.8C4.1 16.8 2 14.7 1.8 11.8C1.6 9.1 3.2 6.8 5.2 5.3C5.1 6.9 6.1 7.6 6.8 6.8C7.5 6 8.5 3.6 8.3 1Z" fill="#FF6B35" stroke="#8A2B0A" stroke-width="1.2"/><path d="M8 7.4C9.8 9.2 10.4 11.5 9.4 13.5C8.8 14.6 7.5 15.2 6.5 14.6C5.3 13.9 5 12.1 5.9 10.6C6.5 9.6 7.4 8.7 8 7.4Z" fill="#FFF7D6"/></svg>`;
}

function buildStarIconSvg(): string {
  return `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.2L10.1 5.5L14.8 6.2L11.4 9.5L12.2 14.2L8 12L3.8 14.2L4.6 9.5L1.2 6.2L5.9 5.5L8 1.2Z" fill="#FFFDF7" stroke="#6E3B23" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
}

function buildTapeBadgeIconSvg(): string {
  return `<svg width="18" height="14" viewBox="0 0 22 16" fill="none" aria-hidden="true"><rect x="1" y="1" width="20" height="14" rx="3" fill="#6E3B23" stroke="#E5A01D" stroke-width="1.4"/><circle cx="7" cy="8" r="3.6" fill="#FAF2DF"/><circle cx="7" cy="8" r="1.3" fill="#6E3B23"/><circle cx="15" cy="8" r="3.6" fill="#FAF2DF"/><circle cx="15" cy="8" r="1.3" fill="#6E3B23"/></svg>`;
}

function buildPlayTriangleSvg(): string {
  return `<svg width="12" height="13" viewBox="0 0 12 14" fill="none" aria-hidden="true"><path d="M1.8 1.4L10.6 7L1.8 12.6V1.4Z" fill="currentColor"/></svg>`;
}

function buildAmpexQuadReelSvg(dailyNumber: number, isToday: boolean): string {
  const outerRim = isToday ? '#D99216' : '#9E855C';
  const flangeFill = isToday ? '#F5ECD7' : '#EAE0CA';
  const hubFill = isToday ? '#F2A922' : '#D9A13B';
  const cutoutFill = '#5E341D';
  return `
    <svg class="ws8-ampex-reel-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="#6E3B23" stroke="${outerRim}" stroke-width="2.6"/>
      <circle cx="32" cy="32" r="24.5" fill="#472412" stroke="#C89B54" stroke-width="1.2"/>
      <circle cx="32" cy="32" r="21" fill="${flangeFill}"/>
      <!-- 3 Classic 1966 Ampex Spun-Aluminum Flange Cutouts -->
      <path d="M32 13.5 A18.5 18.5 0 0 1 48 22.5 L39.5 27.5 A9.5 9.5 0 0 0 32 22.5 Z" fill="${cutoutFill}"/>
      <path d="M48 41.5 A18.5 18.5 0 0 1 20 46 L25.5 38 A9.5 9.5 0 0 0 39.5 36.5 Z" fill="${cutoutFill}"/>
      <path d="M14.5 38 A18.5 18.5 0 0 1 24 15.2 L28 23.6 A9.5 9.5 0 0 0 23 34.5 Z" fill="${cutoutFill}"/>
      <circle cx="32" cy="32" r="10.8" fill="${hubFill}" stroke="#6E3B23" stroke-width="1.8"/>
      <text x="32" y="35" text-anchor="middle" font-family="Jost, sans-serif" font-weight="900" font-size="8.6" fill="#141B29">#${dailyNumber}</text>
    </svg>
  `;
}

function applyRivalMedallionPortrait(el: HTMLElement, castId: CastIdV7): void {
  const profile = CAST_PROFILES_V7[castId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
  const slugPortraitAsset = `./assets/v7/portraits/${castId.toLowerCase()}.jpg`;
  const fallbackDataUri = buildCastMonogramSvgDataUriV7(castId, 'POISED');
  const bgPos = PORTRAIT_SPRITE_POSITIONS_V7.POISED.bgPosition;
  el.style.setProperty('--ws8-rival-accent', profile.accentHex || '#E5A01D');
  el.style.backgroundImage = `url("${slugPortraitAsset}"), url("${profile.portraitAsset}"), url("${fallbackDataUri}")`;
  el.style.backgroundSize = '200% 200%, 200% 200%, cover';
  el.style.backgroundPosition = `${bgPos}, ${bgPos}, center`;
}

function formatVaultUsd(amount: number): string {
  const clean = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return `$${clean.toLocaleString('en-US')}`;
}

interface EntryCompletionSummary {
  readonly completed: boolean;
  readonly won: boolean;
  readonly cash: number;
  readonly stampText: string;
  readonly statusAttr: 'won' | 'played' | 'unplayed';
}

function resolveEntryCompletion(entry: DailyArchiveEntryV8): EntryCompletionSummary {
  if (typeof entry.officialTodayCash === 'number' && Number.isFinite(entry.officialTodayCash)) {
    const won = Boolean(entry.officialTodayWon);
    const cash = Math.max(0, Math.round(entry.officialTodayCash));
    return {
      completed: true,
      won,
      cash,
      stampText: `✓ ${formatVaultUsd(cash)} · ${won ? 'WON' : 'PLAYED'}`,
      statusAttr: won ? 'won' : 'played',
    };
  }

  if (typeof entry.archiveReplayCash === 'number' && Number.isFinite(entry.archiveReplayCash)) {
    const won = Boolean(entry.archiveReplayWon);
    const cash = Math.max(0, Math.round(entry.archiveReplayCash));
    return {
      completed: true,
      won,
      cash,
      stampText: `✓ ${formatVaultUsd(cash)} · ${won ? 'WON' : 'PLAYED'}`,
      statusAttr: won ? 'won' : 'played',
    };
  }

  return {
    completed: false,
    won: false,
    cash: 0,
    stampText: entry.isToday ? 'LIVE MASTER READY' : 'UNPLAYED REEL',
    statusAttr: 'unplayed',
  };
}

function computeArchivePageSize(): number {
  if (typeof window === 'undefined') return 4;
  const vw = window.innerWidth || 1024;
  const vh = window.innerHeight || 768;
  // Desktop & Tablet: 2 columns × 2 rows = 4 whole archive cards per page
  if (vw >= 680 && vh >= 640) return 4;
  // Mobile Landscape Compact (e.g. 844×390): 2 columns × 1 row = 2 whole cards per page
  if (vw >= 680 && vh < 640) return 2;
  // Mobile Portrait (390×844 & 390×660): 1 column × 2 rows = 2 whole cards per page
  if (vh >= 580) return 2;
  return 1;
}

function isCompactMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return (window.innerWidth || 1024) < 680;
}

// ----------------------------------------------------------------------------
// 3. Main Public Controller: `openBroadcastTapeVaultDrawerV8`
// ----------------------------------------------------------------------------

/**
 * Opens the 1966 Studio 6A Ampex Master Tape Vault Folio for Today's Live Daily
 * Broadcast and paged streak-safe Past Archive Reels. Returns an idempotent `dispose`.
 */
export function openBroadcastTapeVaultDrawerV8(
  container: HTMLElement,
  opts: BroadcastTapeVaultDrawerOptionsV8,
): () => void {
  ensureBroadcastTapeVaultStylesV8();

  const prior = container.querySelector('[data-modal="broadcast-tape-vault-v8"]');
  if (prior) prior.remove();

  const currentStreak = Number.isFinite(opts.currentStreak)
    ? Math.max(0, Math.floor(opts.currentStreak))
    : 0;
  const bestStreak = Math.max(
    currentStreak,
    Number.isFinite(opts.bestStreak) ? Math.max(0, Math.floor(opts.bestStreak)) : 0,
  );

  // Pin `#Today` strictly at top, followed by newest-first archive reels
  const orderedEntries = [...(opts.entries ?? [])].sort((a, b) => {
    if (a.isToday !== b.isToday) return a.isToday ? -1 : 1;
    return b.dailyNumber - a.dailyNumber;
  });

  const todayEntry = orderedEntries.find((e) => e.isToday) ?? orderedEntries[0] ?? null;
  const archiveEntriesAll = todayEntry
    ? orderedEntries.filter((e) => e !== todayEntry)
    : [];

  let activeFilter: VaultShelfFilterV8 = 'ALL';
  let currentPageIndex = 0;
  let isDisposed = false;

  const backdrop = document.createElement('div');
  backdrop.className = 'ws8-vault-backdrop';
  backdrop.dataset.modal = 'broadcast-tape-vault-v8';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', '1966 Daily Broadcast Tape Vault');

  const closeAndCleanup = (notifyCloseCallback: boolean): void => {
    if (isDisposed) return;
    isDisposed = true;
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', handleResize);
    backdrop.remove();
    if (notifyCloseCallback) {
      opts.onClose?.();
    }
  };

  const handleKeyDown = (ev: KeyboardEvent): void => {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      opts.onTapSfx?.();
      closeAndCleanup(true);
    } else if (ev.key === 'ArrowLeft') {
      if (currentPageIndex > 0) {
        currentPageIndex -= 1;
        opts.onTapSfx?.();
        renderVaultPage();
      }
    } else if (ev.key === 'ArrowRight') {
      const totalPages = getTotalPages(getFilteredArchiveEntries().length);
      if (currentPageIndex < totalPages - 1) {
        currentPageIndex += 1;
        opts.onTapSfx?.();
        renderVaultPage();
      }
    }
  };

  let lastPageSize = computeArchivePageSize();
  const handleResize = (): void => {
    const nextSize = computeArchivePageSize();
    if (nextSize !== lastPageSize) {
      lastPageSize = nextSize;
      currentPageIndex = 0;
    }
    renderVaultPage();
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('resize', handleResize);

  backdrop.addEventListener('click', (ev) => {
    if (ev.target === backdrop) {
      opts.onTapSfx?.();
      closeAndCleanup(true);
    }
  });

  const cabinet = document.createElement('section');
  cabinet.className = 'ws8-vault-cabinet';

  const folioSheet = document.createElement('div');
  folioSheet.className = 'ws8-vault-folio-sheet';

  // --------------------------------------------------------------------------
  // 1. Radiant Peacock Teal -> Broadcast Cobalt Marquee Header Crown
  // --------------------------------------------------------------------------
  const header = document.createElement('header');
  header.className = 'ws8-vault-header';

  const topRow = document.createElement('div');
  topRow.className = 'ws8-vault-top-row';

  const brand = document.createElement('div');
  brand.className = 'ws8-vault-brand';

  const kicker = document.createElement('div');
  kicker.className = 'ws8-vault-room-kicker';
  kicker.innerHTML = `<span class="ws8-vault-bulb-strip" aria-hidden="true"><span class="ws8-vault-bulb"></span><span class="ws8-vault-bulb"></span><span class="ws8-vault-bulb"></span></span><span>CBS / IBC STUDIO 6A · AMPEX 2-INCH MASTER TAPE LOGBOOK</span>`;

  const title = document.createElement('h2');
  title.className = 'ws8-vault-main-title';
  title.textContent = '1966 Daily Broadcast Tape Vault';
  brand.append(kicker, title);

  const telemetry = document.createElement('div');
  telemetry.className = 'ws8-vault-telemetry';

  const streakBadge = document.createElement('span');
  streakBadge.className = 'ws8-vault-stat-pill';
  streakBadge.dataset.kind = 'streak';
  streakBadge.innerHTML = `${buildFlameIconSvg()}<span>${currentStreak} STREAK</span>`;

  const bestBadge = document.createElement('span');
  bestBadge.className = 'ws8-vault-stat-pill';
  bestBadge.dataset.kind = 'best';
  bestBadge.innerHTML = `${buildStarIconSvg()}<span>BEST ${bestStreak}</span>`;

  const closeTopBtn = document.createElement('button');
  closeTopBtn.type = 'button';
  closeTopBtn.className = 'ws8-vault-close-btn';
  closeTopBtn.dataset.action = 'close-tape-vault';
  closeTopBtn.setAttribute('aria-label', 'Close Master Tape Archive');
  closeTopBtn.textContent = 'CLOSE ×';
  closeTopBtn.addEventListener('click', () => {
    opts.onTapSfx?.();
    closeAndCleanup(true);
  });

  telemetry.append(streakBadge, bestBadge, closeTopBtn);
  topRow.append(brand, telemetry);

  const safetyBanner = document.createElement('div');
  safetyBanner.className = 'ws8-vault-safety-banner';
  safetyBanner.dataset.banner = 'streak-safe-guarantee';
  safetyBanner.innerHTML = `${buildTapeBadgeIconSvg()}<span>MASTER TAPE ARCHIVE — REPLAY ANY PAST 1966 DAILY BROADCAST! (100% STREAK-SAFE)</span>`;

  header.append(topRow, safetyBanner);

  // --------------------------------------------------------------------------
  // 2. Main Sunlit Cream Folio Body: Featured Today Hero + Filter Tabs + 2×2 Grid
  // --------------------------------------------------------------------------
  const body = document.createElement('div');
  body.className = 'ws8-vault-body';

  if (todayEntry) {
    const todayComp = resolveEntryCompletion(todayEntry);
    const todayRival =
      CAST_PROFILES_V7[todayEntry.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const todayStage =
      STAGE_VAULT_LABELS_V8[todayEntry.stageId] ??
      STAGE_VAULT_LABELS_V8.STAGE_01_IBC_DAYTIME_FUNK;
    const todayMode =
      BOARD_PLAY_MODE_TITLES_V7[todayEntry.boardPlayMode] ?? todayEntry.boardPlayMode;

    const heroCard = document.createElement('article');
    heroCard.className = 'ws8-tape-card ws8-today-hero-card';
    heroCard.dataset.today = 'true';
    heroCard.dataset.completed = String(todayComp.completed);
    heroCard.dataset.dateIso = todayEntry.dateIso;
    heroCard.dataset.dailyNumber = String(todayEntry.dailyNumber);

    const heroLeft = document.createElement('div');
    heroLeft.className = 'ws8-today-hero-left';

    const heroVisual = document.createElement('div');
    heroVisual.className = 'ws8-tape-visual-pair';
    heroVisual.innerHTML = buildAmpexQuadReelSvg(todayEntry.dailyNumber, true);

    const heroMedallion = document.createElement('div');
    heroMedallion.className = 'ws8-rival-medallion';
    heroMedallion.setAttribute('title', `${todayRival.name} — ${todayRival.title}`);
    applyRivalMedallionPortrait(heroMedallion, todayEntry.rivalId);
    heroVisual.appendChild(heroMedallion);

    const heroMeta = document.createElement('div');
    heroMeta.className = 'ws8-today-hero-meta';

    const heroTop = document.createElement('div');
    heroTop.className = 'ws8-tape-top';

    const liveBadge = document.createElement('span');
    liveBadge.className = 'ws8-tape-badge';
    liveBadge.dataset.kind = 'live';
    liveBadge.innerHTML = `<span class="ws8-live-tally-dot" aria-hidden="true"></span><span>LIVE TODAY · DAILY #${todayEntry.dailyNumber}</span>`;

    const heroDate = document.createElement('span');
    heroDate.className = 'ws8-tape-date-chip';
    heroDate.textContent = (todayEntry.displayDateShort || todayEntry.dateIso).toUpperCase();

    heroTop.append(liveBadge, heroDate);

    const heroTitle = document.createElement('div');
    heroTitle.className = 'ws8-tape-rival-line';
    heroTitle.textContent = `vs. ${todayRival.name} · ${todayRival.title}`;

    const heroTags = document.createElement('div');
    heroTags.className = 'ws8-tape-tags';

    const stageTag = document.createElement('span');
    stageTag.className = 'ws8-tape-tag';
    stageTag.dataset.tone = 'teal';
    stageTag.textContent = `${todayStage.callsign} · ${todayStage.title}`;

    const modeTag = document.createElement('span');
    modeTag.className = 'ws8-tape-tag';
    modeTag.dataset.tone = 'tangerine';
    modeTag.textContent = todayMode;

    heroTags.append(stageTag, modeTag);
    heroMeta.append(heroTop, heroTitle, heroTags);
    heroLeft.append(heroVisual, heroMeta);

    const heroActions = document.createElement('div');
    heroActions.className = 'ws8-today-hero-actions';

    const heroStamp = document.createElement('span');
    heroStamp.className = 'ws8-tape-stamp';
    heroStamp.dataset.status = todayComp.statusAttr;
    heroStamp.textContent = todayComp.stampText;

    const heroPlayBtn = document.createElement('button');
    heroPlayBtn.type = 'button';
    heroPlayBtn.className = 'ws8-tape-play-btn';
    heroPlayBtn.dataset.kind = 'live';
    heroPlayBtn.dataset.action = 'play-vault-reel';
    heroPlayBtn.dataset.dateIso = todayEntry.dateIso;
    heroPlayBtn.dataset.isToday = 'true';
    const liveBtnCopy = todayComp.completed
      ? "REPLAY TODAY'S LIVE BROADCAST"
      : "PLAY TODAY'S LIVE BROADCAST";
    heroPlayBtn.innerHTML = `<span>${liveBtnCopy}</span>${buildPlayTriangleSvg()}`;
    heroPlayBtn.addEventListener('click', () => {
      opts.onTapSfx?.();
      const targetIso = todayEntry.dateIso;
      closeAndCleanup(false);
      opts.onPlayDateIso(targetIso, true);
    });

    heroActions.append(heroStamp, heroPlayBtn);
    heroCard.append(heroLeft, heroActions);
    body.appendChild(heroCard);
  }

  // Filter Tabs Row (`ALL` / `UNPLAYED` / `COMPLETED`) + Stamped Counter
  const controlsRow = document.createElement('div');
  controlsRow.className = 'ws8-vault-controls-row';

  const filterGroup = document.createElement('div');
  filterGroup.className = 'ws8-vault-filter-group';
  filterGroup.setAttribute('role', 'group');
  filterGroup.setAttribute('aria-label', 'Filter Archive Tape Reels');

  const unplayedArchiveCount = archiveEntriesAll.filter(
    (e) => !resolveEntryCompletion(e).completed,
  ).length;
  const completedArchiveCount = archiveEntriesAll.length - unplayedArchiveCount;

  const countLabel = document.createElement('div');
  countLabel.className = 'ws8-vault-count-label';
  countLabel.textContent = `${completedArchiveCount}/${archiveEntriesAll.length} ARCHIVE REELS STAMPED · 100% STREAK-SAFE`;

  const filterSpecs: ReadonlyArray<{ readonly id: VaultShelfFilterV8; readonly label: string }> = [
    { id: 'ALL', label: `ALL (${archiveEntriesAll.length})` },
    { id: 'UNPLAYED', label: `UNPLAYED (${unplayedArchiveCount})` },
    { id: 'COMPLETED', label: `COMPLETED (${completedArchiveCount})` },
  ];

  const filterButtons: HTMLButtonElement[] = [];

  const grid = document.createElement('div');
  grid.className = 'ws8-vault-grid';

  // --------------------------------------------------------------------------
  // 3. Brushed-Brass Pager Bar (`‹ NEWER REELS · PAGE 1 OF 3 (12 REELS) · OLDER REELS ›`)
  // --------------------------------------------------------------------------
  const pagerBar = document.createElement('footer');
  pagerBar.className = 'ws8-vault-pager-bar';

  const newerBtn = document.createElement('button');
  newerBtn.type = 'button';
  newerBtn.className = 'ws8-vault-pager-btn';
  newerBtn.dataset.action = 'vault-page-prev';
  newerBtn.setAttribute('aria-label', 'Show Newer Broadcast Reels');

  const pagerStatus = document.createElement('div');
  pagerStatus.className = 'ws8-vault-pager-status';
  pagerStatus.dataset.vaultPager = 'status';

  const olderBtn = document.createElement('button');
  olderBtn.type = 'button';
  olderBtn.className = 'ws8-vault-pager-btn';
  olderBtn.dataset.action = 'vault-page-next';
  olderBtn.setAttribute('aria-label', 'Show Older Broadcast Reels');

  const getFilteredArchiveEntries = (): DailyArchiveEntryV8[] => {
    return archiveEntriesAll.filter((entry) => {
      const comp = resolveEntryCompletion(entry);
      if (activeFilter === 'UNPLAYED') return !comp.completed;
      if (activeFilter === 'COMPLETED') return comp.completed;
      return true;
    });
  };

  const getTotalPages = (itemCount: number): number => {
    const pageSize = Math.max(1, computeArchivePageSize());
    return Math.max(1, Math.ceil(itemCount / pageSize));
  };

  newerBtn.addEventListener('click', () => {
    if (currentPageIndex > 0) {
      opts.onTapSfx?.();
      currentPageIndex -= 1;
      renderVaultPage();
    }
  });

  olderBtn.addEventListener('click', () => {
    const totalPages = getTotalPages(getFilteredArchiveEntries().length);
    if (currentPageIndex < totalPages - 1) {
      opts.onTapSfx?.();
      currentPageIndex += 1;
      renderVaultPage();
    }
  });

  pagerBar.append(newerBtn, pagerStatus, olderBtn);

  const renderVaultPage = (): void => {
    grid.innerHTML = '';

    const filtered = getFilteredArchiveEntries();
    const pageSize = Math.max(1, computeArchivePageSize());
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPageIndex >= totalPages) {
      currentPageIndex = totalPages - 1;
    }
    if (currentPageIndex < 0) {
      currentPageIndex = 0;
    }

    const compactMobile = isCompactMobileViewport();
    newerBtn.textContent = compactMobile ? '‹ NEWER' : '‹ NEWER REELS';
    olderBtn.textContent = compactMobile ? 'OLDER ›' : 'OLDER REELS ›';
    newerBtn.disabled = currentPageIndex <= 0;
    olderBtn.disabled = currentPageIndex >= totalPages - 1;

    pagerStatus.textContent = compactMobile
      ? `PAGE ${currentPageIndex + 1}/${totalPages} (${filtered.length})`
      : `PAGE ${currentPageIndex + 1} OF ${totalPages} (${filtered.length} REELS)`;

    if (filtered.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'ws8-vault-empty';
      emptyEl.textContent =
        activeFilter === 'COMPLETED'
          ? 'No completed archive reels stamped yet — load any 1966 master reel to record your score!'
          : 'Every archive reel on this logbook shelf is stamped! Switch to ALL to replay any broadcast.';
      grid.appendChild(emptyEl);
      return;
    }

    const sliceStart = currentPageIndex * pageSize;
    const pageItems = filtered.slice(sliceStart, sliceStart + pageSize);

    for (const entry of pageItems) {
      const comp = resolveEntryCompletion(entry);
      const rival = CAST_PROFILES_V7[entry.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
      const stageMeta =
        STAGE_VAULT_LABELS_V8[entry.stageId] ?? STAGE_VAULT_LABELS_V8.STAGE_01_IBC_DAYTIME_FUNK;
      const modeTitle = BOARD_PLAY_MODE_TITLES_V7[entry.boardPlayMode] ?? entry.boardPlayMode;

      const card = document.createElement('article');
      card.className = 'ws8-tape-card ws8-archive-card';
      card.dataset.today = 'false';
      card.dataset.completed = String(comp.completed);
      card.dataset.dateIso = entry.dateIso;
      card.dataset.dailyNumber = String(entry.dailyNumber);

      // Row 1: Archive Reel Number + Short Broadcast Date
      const cardTop = document.createElement('div');
      cardTop.className = 'ws8-tape-top';

      const badge = document.createElement('span');
      badge.className = 'ws8-tape-badge';
      badge.dataset.kind = 'archive';
      badge.textContent = `ARCHIVE REEL #${entry.dailyNumber}`;

      const dateChip = document.createElement('span');
      dateChip.className = 'ws8-tape-date-chip';
      dateChip.textContent = (entry.displayDateShort || entry.dateIso).toUpperCase();

      cardTop.append(badge, dateChip);

      // Row 2: Brass/Aluminum Ampex Reel + Painted Gouache Champion Portrait + Tags
      const cardBody = document.createElement('div');
      cardBody.className = 'ws8-tape-body';

      const visualPair = document.createElement('div');
      visualPair.className = 'ws8-tape-visual-pair';
      visualPair.innerHTML = buildAmpexQuadReelSvg(entry.dailyNumber, false);

      const medallion = document.createElement('div');
      medallion.className = 'ws8-rival-medallion';
      medallion.setAttribute('title', `${rival.name} — ${rival.title}`);
      applyRivalMedallionPortrait(medallion, entry.rivalId);
      visualPair.appendChild(medallion);

      const metaCol = document.createElement('div');
      metaCol.className = 'ws8-tape-meta';

      const rivalLine = document.createElement('div');
      rivalLine.className = 'ws8-tape-rival-line';
      rivalLine.textContent = `vs. ${rival.name}`;

      const tagsWrap = document.createElement('div');
      tagsWrap.className = 'ws8-tape-tags';

      const stageTag = document.createElement('span');
      stageTag.className = 'ws8-tape-tag';
      stageTag.dataset.tone = 'teal';
      stageTag.textContent = `${stageMeta.callsign} · ${stageMeta.title}`;

      const modeTag = document.createElement('span');
      modeTag.className = 'ws8-tape-tag';
      modeTag.dataset.tone = 'tangerine';
      modeTag.textContent = modeTitle;

      tagsWrap.append(stageTag, modeTag);
      metaCol.append(rivalLine, tagsWrap);
      cardBody.append(visualPair, metaCol);

      // Row 3: Stamped Score Checkmark + >=48x48px Load/Replay CTA
      const cardBottom = document.createElement('div');
      cardBottom.className = 'ws8-tape-bottom';

      const stamp = document.createElement('span');
      stamp.className = 'ws8-tape-stamp';
      stamp.dataset.status = comp.statusAttr;
      stamp.textContent = comp.stampText;

      const playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.className = 'ws8-tape-play-btn';
      playBtn.dataset.kind = 'archive';
      playBtn.dataset.action = 'play-vault-reel';
      playBtn.dataset.dateIso = entry.dateIso;
      playBtn.dataset.isToday = 'false';
      const archiveCopy = comp.completed ? 'REPLAY REEL' : 'LOAD REEL';
      playBtn.innerHTML = `<span>${archiveCopy}</span>${buildPlayTriangleSvg()}`;

      playBtn.addEventListener('click', () => {
        opts.onTapSfx?.();
        const selectedIso = entry.dateIso;
        closeAndCleanup(false);
        opts.onPlayDateIso(selectedIso, false);
      });

      cardBottom.append(stamp, playBtn);
      card.append(cardTop, cardBody, cardBottom);
      grid.appendChild(card);
    }
  };

  for (const fSpec of filterSpecs) {
    const fBtn = document.createElement('button');
    fBtn.type = 'button';
    fBtn.className = 'ws8-vault-filter-btn';
    fBtn.dataset.filter = fSpec.id;
    fBtn.setAttribute('aria-pressed', String(activeFilter === fSpec.id));
    fBtn.textContent = fSpec.label;
    fBtn.addEventListener('click', () => {
      opts.onTapSfx?.();
      activeFilter = fSpec.id;
      currentPageIndex = 0;
      for (const b of filterButtons) {
        b.setAttribute('aria-pressed', String(b.dataset.filter === activeFilter));
      }
      renderVaultPage();
    });
    filterButtons.push(fBtn);
    filterGroup.appendChild(fBtn);
  }

  controlsRow.append(filterGroup, countLabel);
  body.append(controlsRow, grid);

  renderVaultPage();
  folioSheet.append(header, body, pagerBar);
  cabinet.appendChild(folioSheet);
  backdrop.appendChild(cabinet);
  container.appendChild(backdrop);

  return (): void => {
    closeAndCleanup(false);
  };
}
