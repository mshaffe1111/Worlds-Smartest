/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.1 — SUNLIT 1966 STUDIO POLISH)
// `src/v7/ui/ReactionPipMonitorV8.ts`
// Deliverables:
//   1. `resolvePaintedPortraitAssetV8` + `preloadMatchPortraitsV8` — Canonical
//      27/27 CastIdV7 -> verified `./assets/v7/portraits/<snake_case_id>.jpg`
//      gouache 2x2 sheet resolver with match-scoped non-blocking warmup &
//      sunlit cream-and-brass monogram underlayer (zero dark-navy hexes).
//   2. `ReactionPipMonitorV8` — Sleek 148x148px (96x96px mobile) Sunlit
//      American Walnut (`#6E3B23`) & Brushed Spun-Aluminum (`#DFD5BE`) 1966
//      RCA Studio "CAM 2" Monitor with glowing ruby `● CAM 2` tally light,
//      clean 2x2 portrait quadrant framing (`background-size: 200% 200%`), and
//      Warm Broadcast Cream (`#FFFDF7`, `#141B29` ink, Peacock Teal / Atomic
//      Tangerine left accent bar) speech-callout ribbon.
//   3. `renderTvGuideCloseUpCardHTMLV8` & `createTvGuideCloseUpElementV8` —
//      Authentic 1966 TV Guide Magazine "CLOSE-UP" Cast Bio Card on crisp
//      Warm Editorial Creamprint (`#FAF2DF`), crimson `TV GUIDE` masthead,
//      Sunlit Walnut & Spun-Brass photo frame, and Backstage Wire clues.
// ============================================================================

import {
  ALL_RIVAL_IDS_V7,
  type BrokerIdV7,
  type CastIdV7,
  type CategoryIdV7,
  type PortraitEmotionV7,
  type ReactionPipSpecV8,
  type RivalIdV7,
} from '../contracts_v7';
import {
  BROKER_IDS_V7,
  CAST_PROFILES_V7,
  CAST_TV_GUIDE_BIOS_V7,
  CHAMPION_VOICE_KITS_V7,
  PORTRAIT_SPRITE_POSITIONS_V7,
} from '../campaign/CastAndRelicsCatalogV7';

// ----------------------------------------------------------------------------
// 0. Self-Contained Sunlit 1966 RCA Cam-2 & TV Guide Stylesheet (Zero Navy!)
// ----------------------------------------------------------------------------

const REACTION_PIP_STYLE_ID_V8 = 'wsv8-reaction-pip-sunlit-styles';

function ensureReactionPipSunlitStylesV8(): void {
  if (typeof document === 'undefined') return;
  let styleEl = document.getElementById(REACTION_PIP_STYLE_ID_V8) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = REACTION_PIP_STYLE_ID_V8;
    document.head.appendChild(styleEl);
  }
  if (styleEl.dataset.version === 'v9.1-sunlit-cam2-tvguide') {
    return;
  }
  styleEl.dataset.version = 'v9.1-sunlit-cam2-tvguide';
  styleEl.textContent = `
    .wsv8-pip-stage,
    .wsv8-pip-stage *,
    .wsv8-tvguide-card,
    .wsv8-tvguide-card * {
      box-sizing: border-box;
    }

    /* ========================================================================
       1. 1966 RCA STUDIO "CAM 2" MONITOR (148x148 DESKTOP / 96x96 MOBILE)
          + WARM BROADCAST CREAM SPEECH-CALLOUT RIBBON
       ======================================================================== */
    .wsv8-pip-stage {
      position: fixed;
      top: auto;
      bottom: var(--wsv8-pip-bottom, calc(var(--ws7-safe-bottom, env(safe-area-inset-bottom, 0px)) + 14px));
      right: calc(var(--ws7-safe-right, env(safe-area-inset-right, 0px)) + 14px);
      width: min(352px, calc(100vw - 24px));
      z-index: 55;
      pointer-events: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .wsv8-pip-stage.wsv8-pip-hidden,
    .wsv8-pip-stage[data-open='false'] {
      display: none !important;
    }

    /* Never float lingering PiP reactions over full-screen overlays */
    body:has(.ws7-eye-stage:not(.ws7-hidden)) .wsv8-pip-stage,
    body:has(.ws7-utility-stage:not(.ws7-hidden)) .wsv8-pip-stage,
    body:has(.wsv8-bd-overlay) .wsv8-pip-stage,
    body:has(.wsv8-gc-overlay) .wsv8-pip-stage,
    body:has(.ws9-modal-backdrop) .wsv8-pip-stage,
    body:has(.wsc8-backdrop) .wsv8-pip-stage {
      display: none !important;
    }

    .wsv8-pip-stage[data-interactive='true'] {
      pointer-events: auto;
      cursor: pointer;
    }

    .wsv8-pip-stage[data-has-quip='false'] {
      width: auto;
    }

    .wsv8-pip-chassis {
      --wsv8-pip-accent: #008B94;
      --wsv8-pip-ribbon-bar: #008B94;
      display: flex;
      align-items: center;
      gap: 9px;
      transform-origin: bottom right;
      animation: wsv8PipSnapIn 0.22s cubic-bezier(0.2, 0.88, 0.28, 1.04) both;
    }

    /* Compact 148x148px Sunlit American Walnut (#6E3B23) 1966 RCA Monitor Cabinet */
    .wsv8-pip-monitor-cabinet {
      position: relative;
      width: 148px;
      height: 148px;
      min-width: 148px;
      min-height: 148px;
      flex: 0 0 148px;
      padding: 5px;
      border-radius: 16px;
      background:
        repeating-linear-gradient(
          94deg,
          rgba(255, 232, 194, 0.06) 0px,
          rgba(255, 232, 194, 0.06) 3px,
          rgba(56, 26, 10, 0.08) 3px,
          rgba(56, 26, 10, 0.08) 9px
        ),
        linear-gradient(145deg, #8B4E2E 0%, #6E3B23 54%, #522915 100%);
      box-shadow:
        0 12px 28px rgba(48, 24, 10, 0.34),
        0 0 0 1.6px #D9A441,
        inset 0 1.5px 0 rgba(255, 236, 200, 0.46);
    }

    /* Brushed Spun-Aluminum (#DFD5BE) RCA Inner Bezel */
    .wsv8-pip-aluminum-bezel {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      padding: 4px 5px 5px 5px;
      overflow: hidden;
      background: linear-gradient(180deg, #F2EBDC 0%, #DFD5BE 52%, #CFC1A3 100%);
      border: 1px solid #B39E78;
      box-shadow:
        inset 0 1.5px 0 #FFFDF7,
        inset 0 -1px 0 rgba(120, 92, 50, 0.28);
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    /* Spun-Aluminum Top Tally Strip with Glowing Ruby "● CAM 2" Lamp */
    .wsv8-pip-tally-rail {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      padding: 1px 3px 2px 3px;
      background: linear-gradient(180deg, #FAF5E8 0%, #E5DCC6 100%);
      border-radius: 6px;
      border: 1px solid rgba(138, 104, 52, 0.36);
      box-shadow: inset 0 1px 0 #FFFFFF;
    }

    .wsv8-pip-cam-cluster {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
    }

    /* Glowing Ruby-Red Faceted Studio Tally Light */
    .wsv8-pip-tally-jewel {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex: 0 0 auto;
      background: radial-gradient(circle at 35% 35%, #FFB4AE 0%, #E52521 50%, #9E110C 100%);
      box-shadow:
        0 0 0 1.5px rgba(255, 250, 240, 0.85),
        0 0 9px rgba(229, 37, 33, 0.92);
      animation: wsv8TallyBlink 1.15s ease-in-out infinite alternate;
    }

    .wsv8-pip-cam-tag {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.05em;
      line-height: 1.05;
      color: #7A1812;
      white-space: nowrap;
    }

    .wsv8-pip-ch-etched {
      font-family: var(--ws7-font-mono, 'Michroma', 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 800;
      line-height: 1;
      color: #6E3B23;
      opacity: 0.88;
      white-space: nowrap;
    }

    /* Rounded 1966 RCA CRT Mask inside the 148x148 Monitor */
    .wsv8-pip-crt-well {
      position: relative;
      flex: 1 1 auto;
      width: 100%;
      min-height: 0;
      border-radius: 9px;
      padding: 2.5px;
      background: linear-gradient(145deg, #7C4727 0%, #593018 100%);
      box-shadow:
        inset 0 0 0 1.4px #D9A441,
        0 1px 3px rgba(68, 35, 16, 0.24);
    }

    .wsv8-pip-crt-screen {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 7px;
      overflow: hidden;
      background-color: #EFE3C8;
      background-size: 200% 200%, 100% 100%;
      background-position: 0% 0%, center;
      background-repeat: no-repeat, no-repeat;
    }

    /* Exact 2x2 Hand-Painted Gouache Quadrant Crops */
    .wsv8-pip-crt-screen[data-emotion='POISED'] {
      background-position: 0% 0%, center;
    }

    .wsv8-pip-crt-screen[data-emotion='TELL'] {
      background-position: 100% 0%, center;
    }

    .wsv8-pip-crt-screen[data-emotion='RATTLED'] {
      background-position: 0% 100%, center;
    }

    .wsv8-pip-crt-screen[data-emotion='BREAKDOWN'] {
      background-position: 100% 100%, center;
    }

    /* Warm Curved 1966 CRT Glass Highlight */
    .wsv8-pip-crt-glass {
      position: absolute;
      inset: 0;
      border-radius: 7px;
      pointer-events: none;
      background:
        linear-gradient(
          132deg,
          rgba(255, 253, 245, 0.32) 0%,
          rgba(255, 253, 245, 0.08) 30%,
          rgba(255, 253, 245, 0) 52%
        ),
        repeating-linear-gradient(
          0deg,
          rgba(92, 52, 24, 0) 0px,
          rgba(92, 52, 24, 0) 2px,
          rgba(92, 52, 24, 0.045) 3px
        );
      box-shadow: inset 0 0 8px rgba(72, 38, 16, 0.22);
    }

    /* Warm Broadcast Cream (#FFFDF7) Speech-Callout Ribbon with Peacock Teal / Tangerine Left Bar */
    .wsv8-pip-copy-col {
      position: relative;
      flex: 1 1 auto;
      min-width: 0;
      padding: 9px 12px 9px 14px;
      border-radius: 13px;
      background: linear-gradient(180deg, #FFFDF7 0%, #FAF2DF 100%);
      border: 1.5px solid #D8C299;
      box-shadow:
        inset 5px 0 0 var(--wsv8-pip-ribbon-bar, #008B94),
        inset 0 1.5px 0 #FFFFFF,
        0 10px 24px rgba(48, 24, 10, 0.25);
      color: #141B29;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 5px;
    }

    .wsv8-pip-stage[data-has-quip='false'] .wsv8-pip-copy-col {
      display: none;
    }

    .wsv8-pip-ribbon-head {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 4px 6px;
    }

    .wsv8-pip-cast-name {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #6E3B23;
      line-height: 1.15;
      white-space: normal;
    }

    .wsv8-pip-head-right {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .wsv8-pip-dismiss-tag {
      display: none;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 14px;
      font-weight: 900;
      color: #6E3B23;
      background: #EFE4CA;
      border: 1px solid #C8A252;
      border-radius: 999px;
      padding: 0 6px;
      line-height: 1.2;
    }

    .wsv8-pip-stage[data-interactive='true'] .wsv8-pip-dismiss-tag {
      display: inline-block;
    }

    /* Sunlit Living Color Event Badge Pills (Zero Dark-Navy Fill!) */
    .wsv8-pip-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 999px;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.05em;
      line-height: 1.18;
      text-transform: uppercase;
      background: linear-gradient(90deg, #008B94 0%, #006E78 100%);
      color: #FFFDF7;
      border: 1px solid #005C64;
      max-width: 100%;
      white-space: normal;
    }

    .wsv8-pip-chassis[data-event-tone='tell'] {
      --wsv8-pip-ribbon-bar: #FF6B35;
    }

    .wsv8-pip-chassis[data-event-tone='tell'] .wsv8-pip-badge-pill {
      background: linear-gradient(90deg, #FFE484 0%, #F2A922 100%);
      color: #141B29;
      border-color: #B87400;
    }

    .wsv8-pip-chassis[data-event-tone='busted'] {
      --wsv8-pip-ribbon-bar: #008B94;
    }

    .wsv8-pip-chassis[data-event-tone='busted'] .wsv8-pip-badge-pill {
      background: linear-gradient(90deg, #0F8A49 0%, #18A957 100%);
      color: #FFFDF7;
      border-color: #0B6B38;
    }

    .wsv8-pip-chassis[data-event-tone='zonk'] {
      --wsv8-pip-ribbon-bar: #FF6B35;
    }

    .wsv8-pip-chassis[data-event-tone='zonk'] .wsv8-pip-badge-pill {
      background: linear-gradient(90deg, #E6397A 0%, #FF6B35 100%);
      color: #FFFDF7;
      border-color: #A81D53;
    }

    .wsv8-pip-chassis[data-event-tone='clutch'] {
      --wsv8-pip-ribbon-bar: #008B94;
    }

    .wsv8-pip-chassis[data-event-tone='clutch'] .wsv8-pip-badge-pill {
      background: linear-gradient(90deg, #008B94 0%, #1746A2 100%);
      color: #FFFDF7;
      border-color: #0E347A;
    }

    .wsv8-pip-chassis[data-event-tone='rattled'] {
      --wsv8-pip-ribbon-bar: #FF6B35;
    }

    .wsv8-pip-chassis[data-event-tone='rattled'] .wsv8-pip-badge-pill {
      background: linear-gradient(90deg, #FF6B35 0%, #D9381E 100%);
      color: #FFFDF7;
      border-color: #9E2611;
    }

    /* Speech Quote Copy — Crisp #141B29 Ink, Whole-Word Wrap */
    .wsv8-pip-quote {
      margin: 0;
      font-family: var(--ws7-font-sans, 'Plus Jakarta Sans', sans-serif);
      font-size: 14.5px;
      font-weight: 700;
      line-height: 1.28;
      color: #141B29;
      white-space: normal;
      overflow-wrap: break-word;
      word-break: normal;
    }

    /* Special Emotion States on RCA Monitor Cabinet (TELL Spotlight, RATTLED & BREAKDOWN Jitter) */
    .wsv8-pip-chassis[data-emotion='TELL'] .wsv8-pip-monitor-cabinet {
      box-shadow:
        0 12px 28px rgba(48, 24, 10, 0.38),
        0 0 0 2.5px #F2A922,
        0 0 22px rgba(242, 169, 34, 0.78);
    }

    .wsv8-pip-chassis[data-emotion='TELL'] .wsv8-pip-crt-well {
      animation: wsv8TellSpotlightPulse 0.72s ease-in-out infinite alternate;
    }

    .wsv8-pip-chassis[data-emotion='RATTLED'] {
      animation: wsv8PipJitterRattled 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    .wsv8-pip-chassis[data-emotion='RATTLED'] .wsv8-pip-monitor-cabinet {
      box-shadow:
        0 12px 28px rgba(48, 24, 10, 0.38),
        0 0 0 2px #FF6B35,
        0 0 18px rgba(255, 107, 53, 0.52);
    }

    .wsv8-pip-chassis[data-emotion='BREAKDOWN'] {
      animation: wsv8PipJitterBreakdown 0.54s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    .wsv8-pip-chassis[data-emotion='BREAKDOWN'] .wsv8-pip-monitor-cabinet {
      box-shadow:
        0 14px 30px rgba(48, 24, 10, 0.42),
        0 0 0 2.5px #E6397A,
        0 0 22px rgba(230, 57, 122, 0.62);
    }

    /* ========================================================================
       Responsive Mobile & Landscape PiP Rules (Exact 96x96px RCA Monitor!)
       ======================================================================== */
    @media (max-width: 1419px) {
      body:has(.ws7-rival-chyron:not(.ws7-hidden)) .wsv8-pip-stage,
      body:has(.ws7-board-mode-ribbon) .wsv8-pip-stage {
        bottom: var(--wsv8-pip-bottom, calc(var(--ws7-safe-bottom, env(safe-area-inset-bottom, 0px)) + 82px));
      }
    }

    @media (max-width: 680px) {
      .wsv8-pip-stage {
        top: auto;
        bottom: var(--wsv8-pip-bottom, calc(var(--ws7-safe-bottom, env(safe-area-inset-bottom, 0px)) + 48px));
        right: calc(var(--ws7-safe-right, env(safe-area-inset-right, 0px)) + 8px);
        width: min(340px, calc(100vw - 16px));
      }

      body:has(.ws7-live-toast-pill:not(.ws7-hidden)) .wsv8-pip-stage {
        bottom: var(--wsv8-pip-bottom, calc(var(--ws7-safe-bottom, env(safe-area-inset-bottom, 0px)) + 84px));
      }

      body:has(.ws7-rival-chyron:not(.ws7-hidden)) .wsv8-pip-stage {
        bottom: var(--wsv8-pip-bottom, calc(var(--ws7-safe-bottom, env(safe-area-inset-bottom, 0px)) + 186px));
      }

      .wsv8-pip-chassis {
        gap: 7px;
      }

      .wsv8-pip-monitor-cabinet {
        width: 96px;
        height: 96px;
        min-width: 96px;
        min-height: 96px;
        flex: 0 0 96px;
        padding: 3.5px;
        border-radius: 13px;
      }

      .wsv8-pip-aluminum-bezel {
        border-radius: 10px;
        padding: 3px 3.5px 3.5px 3.5px;
        gap: 2px;
      }

      .wsv8-pip-tally-rail {
        padding: 1px 3px;
        justify-content: center;
      }

      .wsv8-pip-ch-etched {
        display: none;
      }

      .wsv8-pip-crt-well {
        border-radius: 7px;
        padding: 2px;
      }

      .wsv8-pip-crt-screen,
      .wsv8-pip-crt-glass {
        border-radius: 5.5px;
      }

      .wsv8-pip-copy-col {
        padding: 6px 9px 6px 11px;
        gap: 3px;
      }

      .wsv8-pip-quote {
        font-size: 13.5px;
        line-height: 1.23;
      }
    }

    @media (max-width: 440px) {
      .wsv8-pip-stage {
        top: auto;
        bottom: var(--wsv8-pip-bottom, calc(var(--ws7-safe-bottom, env(safe-area-inset-bottom, 0px)) + 48px));
        right: calc(var(--ws7-safe-right, env(safe-area-inset-right, 0px)) + 6px);
        width: min(326px, calc(100vw - 12px));
      }

      body:has(.ws7-live-toast-pill:not(.ws7-hidden)) .wsv8-pip-stage {
        bottom: var(--wsv8-pip-bottom, calc(var(--ws7-safe-bottom, env(safe-area-inset-bottom, 0px)) + 84px));
      }

      body:has(.ws7-rival-chyron:not(.ws7-hidden)) .wsv8-pip-stage {
        bottom: var(--wsv8-pip-bottom, calc(var(--ws7-safe-bottom, env(safe-area-inset-bottom, 0px)) + 186px));
      }

      .wsv8-pip-badge-pill {
        padding: 1px 7px;
      }
    }

    @media (max-height: 500px) {
      .wsv8-pip-stage {
        top: auto;
        bottom: calc(var(--ws7-safe-bottom, env(safe-area-inset-bottom, 0px)) + 12px);
        right: calc(var(--ws7-safe-right, env(safe-area-inset-right, 0px)) + 10px);
        width: min(336px, calc(100vw - 20px));
      }

      body:has(.ws7-rival-chyron:not(.ws7-hidden)) .wsv8-pip-stage,
      body:has(.ws7-live-toast-pill:not(.ws7-hidden)) .wsv8-pip-stage {
        bottom: calc(var(--ws7-safe-bottom, env(safe-area-inset-bottom, 0px)) + 74px);
      }

      body:has(.ws7-question-stage:not(.ws7-hidden)) .wsv8-pip-stage {
        right: auto;
        left: calc(var(--ws7-safe-left, env(safe-area-inset-left, 0px)) + 10px);
      }

      .wsv8-pip-monitor-cabinet {
        width: 96px;
        height: 96px;
        min-width: 96px;
        min-height: 96px;
        flex: 0 0 96px;
        padding: 3.5px;
        border-radius: 13px;
      }

      .wsv8-pip-aluminum-bezel {
        border-radius: 10px;
        padding: 3px 3.5px 3.5px 3.5px;
        gap: 2px;
      }

      .wsv8-pip-ch-etched {
        display: none;
      }

      .wsv8-pip-copy-col {
        padding: 6px 9px 6px 11px;
        gap: 3px;
      }

      .wsv8-pip-quote {
        font-size: 13.5px;
        line-height: 1.2;
      }
    }

    /* ========================================================================
       2. AUTHENTIC 1966 TV GUIDE CAST BIO CARD ("CLOSE-UP")
          Warm Editorial Creamprint (#FAF2DF), Crimson TV GUIDE Masthead,
          Sunlit Walnut & Brass Photo Frame — Zero Dark-Blue Boxes!
       ======================================================================== */
    .wsv8-tvguide-card {
      position: relative;
      width: 100%;
      max-width: 100%;
      background:
        radial-gradient(circle at 15% 10%, rgba(255, 253, 247, 0.85) 0%, rgba(250, 242, 223, 0) 60%),
        linear-gradient(180deg, #FAF2DF 0%, #F4E8CD 100%);
      color: #141B29;
      border-top: 4px solid #6E3B23;
      border-bottom: 4px solid #6E3B23;
      border-left: 1.5px solid #8A5430;
      border-right: 1.5px solid #8A5430;
      border-radius: 8px;
      padding: 11px 14px 12px 14px;
      box-shadow:
        0 8px 22px rgba(58, 30, 12, 0.2),
        inset 0 0 0 1px #DEC799;
      font-family: var(--ws7-font-sans, 'Plus Jakarta Sans', Georgia, serif);
      display: flex;
      flex-direction: column;
      gap: 9px;
      text-align: left;
    }

    /* Crimson 1966 TV GUIDE Masthead Bar */
    .wsv8-tvg-masthead {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 6px 10px;
      padding-bottom: 8px;
      border-bottom: 2px solid #6E3B23;
    }

    .wsv8-tvg-stamp-group {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 7px;
    }

    /* Iconic 1966 Crimson Rounded-CRT "TV GUIDE" Crest */
    .wsv8-tvg-logo-crest {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 9px;
      background: linear-gradient(180deg, #D9232A 0%, #B5181E 100%);
      color: #FFFDF7;
      border: 1.5px solid #5E0E12;
      border-radius: 7px / 9px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.35),
        1.5px 1.5px 0 #6E3B23;
      font-family: var(--ws7-font-display, 'Caprasimo', 'Fraunces', Georgia, serif);
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      line-height: 1.18;
    }

    .wsv8-tvg-closeup-stamp {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      background: #FFFDF7;
      color: #B5181E;
      border: 1.5px solid #B5181E;
      border-radius: 4px;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      line-height: 1.18;
    }

    .wsv8-tvg-timeslot {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #4E2714;
    }

    .wsv8-tvg-meta-right {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .wsv8-tvg-color-box {
      display: inline-flex;
      align-items: center;
      padding: 1px 6px;
      border: 1.5px solid #8A5A2B;
      border-radius: 3px;
      background: #FFFDF7;
      color: #4E2714;
      font-family: var(--ws7-font-mono, 'Michroma', 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
      line-height: 1.22;
    }

    .wsv8-tvg-ep-tag {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #6E3B23;
      text-transform: uppercase;
    }

    /* Main Editorial Listing Row: Sunlit Walnut/Brass Portrait Frame + Bio */
    .wsv8-tvg-body-row {
      display: flex;
      align-items: flex-start;
      gap: 13px;
    }

    .wsv8-tvg-portrait-col {
      flex: 0 0 82px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .wsv8-tvg-portrait-frame {
      width: 82px;
      height: 82px;
      min-width: 82px;
      min-height: 82px;
      border-radius: 12px;
      border: 3px solid #6E3B23;
      box-shadow:
        0 0 0 1.5px #D9A441,
        inset 0 0 0 1.5px #F5DC9C,
        0 3px 9px rgba(68, 35, 16, 0.24);
      background-color: #EFE3C8;
      background-size: 200% 200%, 100% 100%;
      background-position: 0% 0%, center;
      background-repeat: no-repeat, no-repeat;
    }

    .wsv8-tvg-ch-pill {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      color: #4E2714;
      background: linear-gradient(180deg, #FFFDF7 0%, #ECDAB6 100%);
      border: 1px solid #B58B42;
      border-radius: 4px;
      padding: 1px 6px;
      line-height: 1.15;
      white-space: nowrap;
    }

    .wsv8-tvg-listing-col {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .wsv8-tvg-program-head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px 8px;
      line-height: 1.24;
    }

    .wsv8-tvg-champ-name {
      font-family: var(--ws7-font-display, 'Fraunces', Georgia, serif);
      font-size: 18px;
      font-weight: 900;
      color: #141B29;
      letter-spacing: -0.01em;
    }

    .wsv8-tvg-champ-role {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #8C2F14;
    }

    .wsv8-tvg-bio-copy {
      margin: 0;
      font-size: 14.5px;
      font-weight: 600;
      line-height: 1.38;
      color: #141B29;
      white-space: normal;
      overflow-wrap: break-word;
    }

    .wsv8-tvg-leadin {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-weight: 900;
      letter-spacing: 0.04em;
      color: #B5181E;
    }

    /* Warm Creamprint "Backstage Wire" Pre-Turn-1 Deduction Clues */
    .wsv8-tvg-wire-box {
      border-top: 1px solid rgba(110, 59, 35, 0.32);
      padding-top: 7px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px 12px;
    }

    .wsv8-tvg-wire-item {
      margin: 0;
      padding: 5px 8px;
      border-radius: 6px;
      background: rgba(255, 253, 247, 0.72);
      border: 1px solid rgba(181, 139, 66, 0.38);
      font-size: 13.5px;
      line-height: 1.32;
      color: #141B29;
    }

    .wsv8-tvg-wire-kicker {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 900;
      font-style: normal;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-right: 4px;
    }

    .wsv8-tvg-wire-item[data-wire='strong'] .wsv8-tvg-wire-kicker {
      color: #9E164A;
    }

    .wsv8-tvg-wire-item[data-wire='weak'] .wsv8-tvg-wire-kicker {
      color: #0B6B3A;
    }

    .wsv8-tvg-wire-clue {
      font-style: italic;
      font-weight: 600;
    }

    /* Stamped Emerald & Cerise Confirmed Scouting Notebook Badges */
    .wsv8-tvg-stamps-row {
      border-top: 1px dashed rgba(110, 59, 35, 0.36);
      padding-top: 7px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }

    .wsv8-tvg-stamps-label {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #5A361E;
      margin-right: 2px;
    }

    .wsv8-tvg-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1.22;
    }

    .wsv8-tvg-badge[data-kind='weak'] {
      background: #E3F7EC;
      color: #095E33;
      border: 1.5px solid #148F50;
    }

    .wsv8-tvg-badge[data-kind='strong'] {
      background: #FCE6EF;
      color: #9B1348;
      border: 1.5px solid #D62868;
    }

    .wsv8-tvg-badge[data-kind='unscouted'] {
      background: #FFFDF7;
      color: #5A4632;
      border: 1px dashed #B58B42;
    }

    @media (max-width: 620px) {
      .wsv8-tvg-wire-box {
        grid-template-columns: minmax(0, 1fr);
        gap: 5px;
      }
    }

    @media (max-width: 440px) {
      .wsv8-tvguide-card {
        padding: 9px 10px 10px 10px;
        gap: 7px;
      }

      .wsv8-tvg-portrait-col {
        flex: 0 0 76px;
      }

      .wsv8-tvg-portrait-frame {
        width: 76px;
        height: 76px;
        min-width: 76px;
        min-height: 76px;
      }

      .wsv8-tvg-champ-name {
        font-size: 16.5px;
      }

      .wsv8-tvg-bio-copy {
        font-size: 14px;
        line-height: 1.34;
      }
    }

    @media (max-height: 500px) {
      .wsv8-tvguide-card {
        padding: 7px 10px 8px 10px;
        gap: 5px;
      }

      .wsv8-tvg-masthead {
        padding-bottom: 5px;
      }

      .wsv8-tvg-bio-copy {
        font-size: 13.5px;
        line-height: 1.26;
      }

      .wsv8-tvg-wire-box {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding-top: 5px;
        gap: 4px 10px;
      }
    }

    /* ========================================================================
       3. STUDIO CAMERA MOTION KEYFRAMES & REDUCED MOTION ACCESSIBILITY
       ======================================================================== */
    @keyframes wsv8PipSnapIn {
      0% {
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes wsv8TallyBlink {
      0% {
        opacity: 0.72;
        transform: scale(0.94);
      }
      100% {
        opacity: 1;
        transform: scale(1.08);
      }
    }

    @keyframes wsv8TellSpotlightPulse {
      0% {
        box-shadow:
          0 0 0 2px #F2A922,
          0 0 10px rgba(242, 169, 34, 0.58);
      }
      100% {
        box-shadow:
          0 0 0 3.5px #FFE89E,
          0 0 22px rgba(255, 107, 53, 0.92);
      }
    }

    @keyframes wsv8PipJitterRattled {
      0% { transform: translate3d(0, 0, 0) rotate(0deg); }
      20% { transform: translate3d(-4px, 1px, 0) rotate(-0.8deg); }
      42% { transform: translate3d(4px, -1px, 0) rotate(0.8deg); }
      65% { transform: translate3d(-2.5px, 1px, 0) rotate(-0.45deg); }
      84% { transform: translate3d(2px, 0, 0) rotate(0.3deg); }
      100% { transform: translate3d(0, 0, 0) rotate(0deg); }
    }

    @keyframes wsv8PipJitterBreakdown {
      0% { transform: translate3d(0, 0, 0) rotate(0deg); }
      15% { transform: translate3d(-6px, 2px, 0) rotate(-1.3deg); }
      32% { transform: translate3d(6px, -2px, 0) rotate(1.2deg); }
      48% { transform: translate3d(-5px, -1px, 0) rotate(-1deg); }
      66% { transform: translate3d(4px, 2px, 0) rotate(0.8deg); }
      82% { transform: translate3d(-2.5px, 0, 0) rotate(-0.4deg); }
      100% { transform: translate3d(0, 0, 0) rotate(0deg); }
    }

    .wsv8-pip-stage[data-reduced-motion='true'] *,
    .wsv8-pip-stage[data-reduced-motion='true'] *::before,
    .wsv8-pip-stage[data-reduced-motion='true'] *::after,
    .ws7-chrome-root[data-reduced-motion='true'] .wsv8-pip-stage *,
    .ws7-chrome-root[data-reduced-motion='true'] .wsv8-pip-chassis {
      animation: none !important;
      transition: none !important;
    }

    @media (prefers-reduced-motion: reduce) {
      .wsv8-pip-stage *,
      .wsv8-pip-chassis {
        animation: none !important;
        transition: none !important;
      }
    }
  `;
}

if (typeof document !== 'undefined') {
  ensureReactionPipSunlitStylesV8();
}

// ----------------------------------------------------------------------------
// 1. Canonical 27-Portrait Gouache Sheet Resolver & Match-Scoped Preloader
// ----------------------------------------------------------------------------

/**
 * Exhaustive 1:1 mapping from all 27 `CastIdV7` IDs (24 Rivals + 3 Booth Brokers)
 * to their verified hand-painted 1966 gouache 2x2 `.jpg` sheets on disk.
 */
export const CANONICAL_PAINTED_PORTRAITS_V8 = {
  // Season 1 Champions
  CARMEN_DELGADO: './assets/v7/portraits/carmen_delgado.jpg',
  TOBY_OKAFOR: './assets/v7/portraits/toby_okafor.jpg',
  INEZ_CALLAHAN: './assets/v7/portraits/inez_callahan.jpg',
  DOTTY_VANCE: './assets/v7/portraits/dotty_vance.jpg',
  CHET_KOWALSKI: './assets/v7/portraits/chet_kowalski.jpg',
  PEGGY_SUE_CONNORS: './assets/v7/portraits/peggy_sue_connors.jpg',
  // Season 2 Champions
  BUZZ_HALVORSEN: './assets/v7/portraits/buzz_halvorsen.jpg',
  GIGI_ST_CLAIR: './assets/v7/portraits/gigi_st_clair.jpg',
  WALTER_PRINGLE: './assets/v7/portraits/walter_pringle.jpg',
  BETTY_LOU_HARPER: './assets/v7/portraits/betty_lou_harper.jpg',
  MILES_ELLINGTON: './assets/v7/portraits/miles_ellington.jpg',
  SYLVIE_BEAUMONT: './assets/v7/portraits/sylvie_beaumont.jpg',
  // Season 3 Champions
  MARGO_STERLING: './assets/v7/portraits/margo_sterling.jpg',
  HANK_MCCOY: './assets/v7/portraits/hank_mccoy.jpg',
  ALASTAIR_KERR: './assets/v7/portraits/alastair_kerr.jpg',
  LANA_STARLING: './assets/v7/portraits/lana_starling.jpg',
  VINCE_CASTELLANO: './assets/v7/portraits/vince_castellano.jpg',
  REX_CALLOWAY: './assets/v7/portraits/rex_calloway.jpg',
  // Season 4 Masterminds
  ARTHUR_PENDLETON: './assets/v7/portraits/arthur_pendleton.jpg',
  NORMA_JEAN_BAKER: './assets/v7/portraits/norma_jean_baker.jpg',
  STERLING_VANCE: './assets/v7/portraits/sterling_vance.jpg',
  SEO_YUN_KANG: './assets/v7/portraits/seo_yun_kang.jpg',
  CLARA_VON_BERG: './assets/v7/portraits/clara_von_berg.jpg',
  VICTOR_LAZAR: './assets/v7/portraits/victor_lazar.jpg',
  // 3 Control Booth Power Brokers
  GRANT_BELLAMY: './assets/v7/portraits/grant_bellamy.jpg',
  ROZ_KORMAN: './assets/v7/portraits/roz_korman.jpg',
  VERA_KARP: './assets/v7/portraits/vera_karp.jpg',
} as const satisfies Record<CastIdV7, string>;

export const ALL_CAST_IDS_V8: readonly CastIdV7[] = [
  ...ALL_RIVAL_IDS_V7,
  ...(BROKER_IDS_V7 as readonly BrokerIdV7[]),
];

const warmedPortraitUrlsV8 = new Set<string>();

/**
 * Resolves any of the 27 `CastIdV7` characters to their exact dedicated
 * hand-painted 1966 gouache `2x2` sheet (`./assets/v7/portraits/<id>.jpg`).
 */
export function resolvePaintedPortraitAssetV8(castId: CastIdV7): string {
  return (
    CANONICAL_PAINTED_PORTRAITS_V8[castId] ??
    CANONICAL_PAINTED_PORTRAITS_V8.CARMEN_DELGADO
  );
}

/**
 * Non-blocking `new Image()` warmup for ONLY the 1–2 characters participating
 * in the current match (zero boot payload bloat; safe no-op in Node tests).
 */
export function preloadMatchPortraitsV8(castIds: readonly CastIdV7[]): void {
  if (typeof Image === 'undefined' || !Array.isArray(castIds)) {
    return;
  }
  for (const castId of castIds) {
    const assetUrl = resolvePaintedPortraitAssetV8(castId);
    if (!assetUrl || warmedPortraitUrlsV8.has(assetUrl)) {
      continue;
    }
    warmedPortraitUrlsV8.add(assetUrl);
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = assetUrl;
    } catch {
      // Ignore image decode warmup errors in restricted/headless environments.
    }
  }
}

/**
 * Builds a sunlit Warm Broadcast Cream & Brass SVG monogram underlayer
 * (replacing legacy dark-navy monogram fills so zero dark-blue flashes occur).
 */
function buildSunlitCastMonogramDataUriV8(
  castId: CastIdV7,
  emotion: PortraitEmotionV7 = 'POISED',
): string {
  const profile = CAST_PROFILES_V7[castId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
  const initials = profile.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const ringHex =
    emotion === 'TELL'
      ? '#F2A922'
      : emotion === 'RATTLED'
        ? '#FF6B35'
        : emotion === 'BREAKDOWN'
          ? '#E6397A'
          : '#008B94';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96"><rect width="96" height="96" rx="14" fill="#F5E9CE"/><circle cx="48" cy="48" r="38" fill="${profile.accentHex}" fill-opacity="0.22" stroke="${ringHex}" stroke-width="3"/><text x="48" y="57" text-anchor="middle" font-family="Jost,sans-serif" font-weight="800" font-size="28" fill="#141B29" letter-spacing="1">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`.replace(/'/g, '%27');
}

/**
 * Builds multi-layer CSS background values pairing the character's painted
 * `2x2` gouache sheet over an instant sunlit cream-and-brass monogram underlayer.
 */
export function buildPaintedPortraitCssLayersV8(
  castId: CastIdV7,
  emotion: PortraitEmotionV7 = 'POISED',
): {
  readonly assetUrl: string;
  readonly fallbackDataUri: string;
  readonly backgroundImage: string;
  readonly backgroundSize: string;
  readonly backgroundPosition: string;
  readonly badgeLabel: string;
} {
  const assetUrl = resolvePaintedPortraitAssetV8(castId);
  const fallbackDataUri = buildSunlitCastMonogramDataUriV8(castId, emotion);
  const sprite = PORTRAIT_SPRITE_POSITIONS_V7[emotion] ?? PORTRAIT_SPRITE_POSITIONS_V7.POISED;
  return {
    assetUrl,
    fallbackDataUri,
    backgroundImage: `url("${assetUrl}"), url("${fallbackDataUri}")`,
    backgroundSize: '200% 200%, 100% 100%',
    backgroundPosition: `${sprite.bgPosition}, center`,
    badgeLabel: sprite.badgeLabel,
  };
}

// ----------------------------------------------------------------------------
// 2. Copy Sanitization & Friendly Category Helpers (Zero Copy Truncation!)
// ----------------------------------------------------------------------------

function escapeHtmlV8(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats live speech/reaction quips for the CAM 2 monitor with zero
 * truncation markers and clean clause-level bounding if oversized copy arrives.
 */
export function formatCleanPipQuipV8(raw: string): string {
  const cleaned = raw
    .replace(/\.{3,}|\u2026/g, '—')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return '“Watch Camera Two!”';
  }

  let bounded = cleaned;
  if (bounded.length > 116) {
    const windowSlice = bounded.slice(0, 114);
    const sentenceEnd = Math.max(
      windowSlice.lastIndexOf('!'),
      windowSlice.lastIndexOf('?'),
      windowSlice.lastIndexOf('.'),
      windowSlice.lastIndexOf('—'),
    );
    if (sentenceEnd >= 48) {
      bounded = windowSlice.slice(0, sentenceEnd + 1).trim();
    } else {
      const lastSpace = windowSlice.lastIndexOf(' ');
      bounded = (lastSpace > 44 ? windowSlice.slice(0, lastSpace) : windowSlice).replace(
        /[,:;—-]+$/,
        '',
      );
      if (!/[.!?”"]$/.test(bounded)) {
        bounded = `${bounded}!`;
      }
    }
  }

  const startsQuoted = /^[“"']/.test(bounded);
  const endsQuoted = /[”"']$/.test(bounded);
  if (!startsQuoted && !endsQuoted) {
    return `“${bounded}”`;
  }
  if (startsQuoted && !endsQuoted) {
    return `${bounded}”`;
  }
  return bounded;
}

type PipEventToneV8 = 'poised' | 'tell' | 'busted' | 'zonk' | 'clutch' | 'rattled';

function classifyPipEventToneV8(
  emotion: PortraitEmotionV7,
  badgeLabel: string,
): PipEventToneV8 {
  const upper = badgeLabel.toUpperCase();
  if (upper.includes('BUSTED') || upper.includes('INTERCEPT') || upper.includes('CAUGHT')) {
    return 'busted';
  }
  if (upper.includes('ZONK') || upper.includes('GREMLIN') || upper.includes('WIPEOUT')) {
    return 'zonk';
  }
  if (emotion === 'TELL' || upper.includes('TELL')) {
    return 'tell';
  }
  if (upper.includes('CLUTCH') || upper.includes('SURGE') || upper.includes('STREAK')) {
    return 'clutch';
  }
  if (emotion === 'RATTLED' || emotion === 'BREAKDOWN') {
    return 'rattled';
  }
  return 'poised';
}

// ----------------------------------------------------------------------------
// 3. Deliverable 2 — `ReactionPipMonitorV8` (1966 RCA Studio "CAM 2" Monitor)
// ----------------------------------------------------------------------------

export interface ReactionPipMonitorOptionsV8 {
  /** HUD overlay host (defaults to `.ws7-chrome-root` or `document.body`). */
  readonly container?: HTMLElement;
  /** Disables pulsing/jitter motion when true. */
  readonly reducedMotion?: boolean;
  /** Optional 1-tap dismiss (`false` by default -> strict `pointer-events: none`). */
  readonly interactiveDismiss?: boolean;
  /** Fallback auto-hide duration in ms when `spec.durationMs` is omitted (default `3200`). */
  readonly defaultDurationMs?: number;
  /** Optional callback invoked when dismissed via tap. */
  readonly onDismiss?: () => void;
}

export class ReactionPipMonitorV8 {
  private readonly hostContainer: HTMLElement | null;
  private readonly stageEl: HTMLElement;
  private readonly chassisEl: HTMLElement;
  private readonly castNameEl: HTMLElement;
  private readonly crtScreenEl: HTMLElement;
  private readonly badgePillEl: HTMLElement;
  private readonly quoteEl: HTMLParagraphElement;

  private reducedMotion: boolean;
  private interactiveDismiss: boolean;
  private readonly defaultDurationMs: number;
  private readonly onDismiss?: () => void;
  private hideTimerId: ReturnType<typeof setTimeout> | null = null;
  private clearanceRafId: number | null = null;
  private blockerObserver: MutationObserver | null = null;
  private disposed = false;

  private readonly handleStageClick = (): void => {
    if (!this.interactiveDismiss) return;
    this.hide();
    this.onDismiss?.();
  };

  public constructor(
    containerOrOptions?: HTMLElement | ReactionPipMonitorOptionsV8,
    maybeOptions?: ReactionPipMonitorOptionsV8,
  ) {
    ensureReactionPipSunlitStylesV8();

    const isElement =
      typeof HTMLElement !== 'undefined' && containerOrOptions instanceof HTMLElement;
    const opts: ReactionPipMonitorOptionsV8 = isElement
      ? (maybeOptions ?? {})
      : ((containerOrOptions as ReactionPipMonitorOptionsV8 | undefined) ?? {});

    const resolvedHost = isElement
      ? containerOrOptions
      : (opts.container ??
        (typeof document !== 'undefined'
          ? ((document.querySelector('.ws7-chrome-root') as HTMLElement | null) ?? document.body)
          : null));

    this.hostContainer = resolvedHost;
    this.reducedMotion = Boolean(opts.reducedMotion);
    this.interactiveDismiss = Boolean(opts.interactiveDismiss);
    this.defaultDurationMs = Math.max(1200, opts.defaultDurationMs ?? 3200);
    this.onDismiss = opts.onDismiss;

    this.stageEl = document.createElement('aside');
    this.stageEl.className = 'wsv8-pip-stage wsv8-pip-hidden';
    this.stageEl.dataset.open = 'false';
    this.stageEl.dataset.hasQuip = 'true';
    this.stageEl.dataset.interactive = this.interactiveDismiss ? 'true' : 'false';
    this.stageEl.dataset.reducedMotion = this.reducedMotion ? 'true' : 'false';
    this.stageEl.setAttribute('role', 'status');
    this.stageEl.setAttribute('aria-live', 'polite');
    this.stageEl.setAttribute('aria-hidden', 'true');

    this.chassisEl = document.createElement('div');
    this.chassisEl.className = 'wsv8-pip-chassis';
    this.chassisEl.dataset.emotion = 'POISED';
    this.chassisEl.dataset.eventTone = 'poised';

    // Left: 148x148px (96x96px mobile) Sunlit American Walnut & Spun-Aluminum RCA Monitor
    const monitorCabinet = document.createElement('div');
    monitorCabinet.className = 'wsv8-pip-monitor-cabinet';

    const bezelEl = document.createElement('div');
    bezelEl.className = 'wsv8-pip-aluminum-bezel';

    const tallyRail = document.createElement('div');
    tallyRail.className = 'wsv8-pip-tally-rail';

    const camCluster = document.createElement('div');
    camCluster.className = 'wsv8-pip-cam-cluster';

    const tallyJewel = document.createElement('span');
    tallyJewel.className = 'wsv8-pip-tally-jewel';
    tallyJewel.setAttribute('aria-hidden', 'true');

    const camTag = document.createElement('span');
    camTag.className = 'wsv8-pip-cam-tag';
    camTag.textContent = '● CAM 2';

    camCluster.append(tallyJewel, camTag);

    const chEtched = document.createElement('span');
    chEtched.className = 'wsv8-pip-ch-etched';
    chEtched.setAttribute('aria-hidden', 'true');
    chEtched.textContent = 'RCA';

    tallyRail.append(camCluster, chEtched);

    const crtWell = document.createElement('div');
    crtWell.className = 'wsv8-pip-crt-well';

    this.crtScreenEl = document.createElement('div');
    this.crtScreenEl.className = 'wsv8-pip-crt-screen';
    this.crtScreenEl.dataset.emotion = 'POISED';

    const crtGlass = document.createElement('div');
    crtGlass.className = 'wsv8-pip-crt-glass';
    crtGlass.setAttribute('aria-hidden', 'true');

    crtWell.append(this.crtScreenEl, crtGlass);
    bezelEl.append(tallyRail, crtWell);
    monitorCabinet.appendChild(bezelEl);

    // Right: Warm Broadcast Cream (#FFFDF7) Speech-Callout Ribbon
    const copyCol = document.createElement('div');
    copyCol.className = 'wsv8-pip-copy-col';

    const ribbonHead = document.createElement('div');
    ribbonHead.className = 'wsv8-pip-ribbon-head';

    this.castNameEl = document.createElement('span');
    this.castNameEl.className = 'wsv8-pip-cast-name';
    this.castNameEl.textContent = 'CHAMPION';

    const headRight = document.createElement('div');
    headRight.className = 'wsv8-pip-head-right';

    this.badgePillEl = document.createElement('span');
    this.badgePillEl.className = 'wsv8-pip-badge-pill';
    this.badgePillEl.textContent = 'PODIUM 2';

    const dismissTag = document.createElement('span');
    dismissTag.className = 'wsv8-pip-dismiss-tag';
    dismissTag.setAttribute('aria-hidden', 'true');
    dismissTag.textContent = '×';

    headRight.append(this.badgePillEl, dismissTag);
    ribbonHead.append(this.castNameEl, headRight);

    this.quoteEl = document.createElement('p');
    this.quoteEl.className = 'wsv8-pip-quote';
    this.quoteEl.textContent = '';

    copyCol.append(ribbonHead, this.quoteEl);

    this.chassisEl.append(monitorCabinet, copyCol);
    this.stageEl.appendChild(this.chassisEl);

    this.stageEl.addEventListener('click', this.handleStageClick);

    if (this.hostContainer) {
      this.hostContainer.appendChild(this.stageEl);
    }
  }

  public getElement(): HTMLElement {
    return this.stageEl;
  }

  public isVisible(): boolean {
    return this.stageEl.dataset.open === 'true';
  }

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = Boolean(reduced);
    this.stageEl.dataset.reducedMotion = this.reducedMotion ? 'true' : 'false';
  }

  public setInteractiveDismiss(enabled: boolean): void {
    this.interactiveDismiss = Boolean(enabled);
    this.stageEl.dataset.interactive = this.interactiveDismiss ? 'true' : 'false';
  }

  /**
   * Displays a live 1966 RCA Studio "CAM 2" Picture-in-Picture reaction cut-in
   * cropped to the exact `200% 200%` gouache emotion quadrant.
   */
  public showReaction(
    spec: ReactionPipSpecV8 & { readonly rivalId?: RivalIdV7 },
  ): void {
    if (this.disposed) return;
    ensureReactionPipSunlitStylesV8();

    this.clearHideTimer();

    if (!this.stageEl.parentElement && this.hostContainer) {
      this.hostContainer.appendChild(this.stageEl);
    }

    // Ensure Rival quotes/misses/taunts always resolve to the Rival's portrait rather than host/default fallback!
    let resolvedCastId: CastIdV7 = spec.rivalId ?? spec.castId;
    if (
      !spec.rivalId &&
      resolvedCastId === 'GRANT_BELLAMY' &&
      spec.displayName?.trim()
    ) {
      const needle = spec.displayName.trim().toLowerCase();
      const matched = (Object.keys(CAST_PROFILES_V7) as CastIdV7[]).find(
        (id) =>
          CAST_PROFILES_V7[id].role !== 'BOOTH_BROKER' &&
          CAST_PROFILES_V7[id].name.trim().toLowerCase() === needle,
      );
      if (matched) resolvedCastId = matched;
    }

    const profile = CAST_PROFILES_V7[resolvedCastId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const emotion: PortraitEmotionV7 = PORTRAIT_SPRITE_POSITIONS_V7[spec.emotion]
      ? spec.emotion
      : 'POISED';

    preloadMatchPortraitsV8([resolvedCastId]);
    const layers = buildPaintedPortraitCssLayersV8(resolvedCastId, emotion);

    const rawName = (spec.displayName?.trim() || profile.name).replace(/\.{3,}|\u2026/g, '').trim();
    const badgeText = (spec.badgeLabel?.trim() || layers.badgeLabel)
      .replace(/\.{3,}|\u2026/g, '')
      .toUpperCase();
    const accent = spec.accentHex?.trim() || profile.accentHex || '#008B94';
    const eventTone = classifyPipEventToneV8(emotion, badgeText);
    const ribbonBarHex =
      eventTone === 'tell' || eventTone === 'rattled' || eventTone === 'zonk'
        ? '#FF6B35'
        : '#008B94';

    this.castNameEl.textContent = rawName.toUpperCase();
    this.badgePillEl.textContent = badgeText;
    this.quoteEl.textContent = formatCleanPipQuipV8(spec.quipText);
    this.stageEl.dataset.hasQuip = 'true';

    this.chassisEl.style.setProperty('--wsv8-pip-accent', accent);
    this.chassisEl.style.setProperty('--wsv8-pip-ribbon-bar', ribbonBarHex);
    this.crtScreenEl.style.backgroundImage = layers.backgroundImage;
    this.crtScreenEl.style.backgroundSize = layers.backgroundSize;
    this.crtScreenEl.style.backgroundPosition = layers.backgroundPosition;
    this.crtScreenEl.dataset.emotion = emotion;
    this.crtScreenEl.dataset.castId = resolvedCastId;

    const hostReduced =
      this.reducedMotion ||
      Boolean(this.stageEl.closest('[data-reduced-motion="true"]'));
    this.stageEl.dataset.reducedMotion = hostReduced ? 'true' : 'false';

    // Cleanly re-trigger emotion entrance / cartoon jitter when back-to-back cues fire
    if (!hostReduced && this.stageEl.dataset.open === 'true') {
      this.chassisEl.style.animation = 'none';
      void this.chassisEl.offsetWidth;
      this.chassisEl.style.animation = '';
    }

    this.chassisEl.dataset.emotion = emotion;
    this.chassisEl.dataset.eventTone = eventTone;

    this.stageEl.classList.remove('wsv8-pip-hidden');
    this.stageEl.dataset.open = 'true';
    this.stageEl.setAttribute('aria-hidden', 'false');

    this.updateMobileClearance();
    this.attachBlockerObserver();
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      if (this.clearanceRafId !== null) {
        window.cancelAnimationFrame(this.clearanceRafId);
      }
      this.clearanceRafId = window.requestAnimationFrame(() => {
        this.clearanceRafId = null;
        this.updateMobileClearance();
      });
    }

    const durationMs = Math.max(
      1200,
      Math.min(12000, Math.round(spec.durationMs ?? this.defaultDurationMs)),
    );
    this.hideTimerId = setTimeout(() => {
      this.hide();
    }, durationMs);
  }

  public hide(): void {
    this.clearHideTimer();
    this.clearMobileClearanceTracking();
    this.stageEl.dataset.open = 'false';
    this.stageEl.classList.add('wsv8-pip-hidden');
    this.stageEl.setAttribute('aria-hidden', 'true');
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.clearHideTimer();
    this.clearMobileClearanceTracking();
    this.stageEl.removeEventListener('click', this.handleStageClick);
    this.stageEl.remove();
  }

  private clearHideTimer(): void {
    if (this.hideTimerId !== null) {
      clearTimeout(this.hideTimerId);
      this.hideTimerId = null;
    }
  }

  private clearMobileClearanceTracking(): void {
    if (this.clearanceRafId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.clearanceRafId);
      this.clearanceRafId = null;
    }
    if (this.blockerObserver) {
      this.blockerObserver.disconnect();
      this.blockerObserver = null;
    }
    this.stageEl.style.removeProperty('--wsv8-pip-bottom');
  }

  private attachBlockerObserver(): void {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    if (this.blockerObserver) {
      this.blockerObserver.disconnect();
      this.blockerObserver = null;
    }
    const targets = document.querySelectorAll<HTMLElement>('.ws7-rival-chyron, .ws7-live-toast-pill');
    if (targets.length === 0) return;
    const observer = new MutationObserver(() => {
      if (!this.disposed && this.stageEl.dataset.open === 'true') {
        this.updateMobileClearance();
      }
    });
    targets.forEach((el) => {
      observer.observe(el, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        childList: true,
        subtree: true,
        characterData: true,
      });
    });
    this.blockerObserver = observer;
  }

  private updateMobileClearance(): void {
    if (this.disposed || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    if (window.innerWidth > 680 || window.innerHeight <= 500) {
      this.stageEl.style.removeProperty('--wsv8-pip-bottom');
      return;
    }
    const blockers = document.querySelectorAll<HTMLElement>(
      '.ws7-rival-chyron:not(.ws7-hidden), .ws7-live-toast-pill:not(.ws7-hidden)',
    );
    let minTop = window.innerHeight;
    let hasVisibleBlocker = false;
    blockers.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight) {
        hasVisibleBlocker = true;
        if (rect.top < minTop) {
          minTop = rect.top;
        }
      }
    });
    if (!hasVisibleBlocker) {
      this.stageEl.style.removeProperty('--wsv8-pip-bottom');
      return;
    }
    const neededBottom = Math.ceil(window.innerHeight - minTop + 14);
    const maxSafeBottom = Math.max(120, Math.floor(window.innerHeight * 0.42));
    const clampedBottom = Math.min(maxSafeBottom, Math.max(84, neededBottom));
    this.stageEl.style.setProperty('--wsv8-pip-bottom', `${clampedBottom}px`);
  }
}

// ----------------------------------------------------------------------------
// 4. Deliverable 3 — Authentic 1966 TV Guide Pre-Match "CLOSE-UP" Card
// ----------------------------------------------------------------------------

export interface TvGuideCloseUpCardOptionsV8 {
  readonly episodeCode?: string;
  readonly showTime?: string;
  readonly scoutedStrong?: readonly CategoryIdV7[];
  readonly scoutedWeak?: readonly CategoryIdV7[];
}

function renderTvGuideBioMarkupV8(rawBio: string): string {
  const sanitized = rawBio.replace(/\.{3,}|\u2026/g, '—').trim();
  const prefixMatch = sanitized.match(/^(TV GUIDE CLOSE-UP:)\s*(.*)$/i);
  if (prefixMatch) {
    return `<span class="wsv8-tvg-leadin">${escapeHtmlV8(prefixMatch[1])}</span> ${escapeHtmlV8(prefixMatch[2])}`;
  }
  return escapeHtmlV8(sanitized);
}

/**
 * Renders an authentic 1966 *TV Guide* Magazine `"CLOSE-UP · FRIDAY 8:00 PM [COLOR]"`
 * Warm Editorial Creamprint (`#FAF2DF`) clipping with crimson `TV GUIDE` masthead,
 * Sunlit American Walnut & Brass `POISED` gouache portrait frame, vibrant
 * `CAST_TV_GUIDE_BIOS_V7` listing, subtle italicized `"Backstage Wire"` clues,
 * and Emerald/Cerise stamps for confirmed Scouting Notebook categories.
 */
export function renderTvGuideCloseUpCardHTMLV8(
  rivalId: RivalIdV7,
  opts?: TvGuideCloseUpCardOptionsV8,
): string {
  ensureReactionPipSunlitStylesV8();

  const profile = CAST_PROFILES_V7[rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
  const voiceKit =
    CHAMPION_VOICE_KITS_V7[rivalId] ?? CHAMPION_VOICE_KITS_V7.CARMEN_DELGADO;
  const rawTvGuideBio =
    CAST_TV_GUIDE_BIOS_V7[rivalId] ??
    profile.bio ??
    profile.signatureTellText;

  preloadMatchPortraitsV8([rivalId]);
  const portraitLayers = buildPaintedPortraitCssLayersV8(rivalId, 'POISED');

  const showTimeLabel = (opts?.showTime?.trim() || 'FRIDAY 8:00 PM')
    .replace(/\.{3,}|\u2026/g, '')
    .toUpperCase();
  const episodeCode = opts?.episodeCode?.trim();

  const confirmedWeak = Array.from(new Set(opts?.scoutedWeak ?? []));
  const confirmedStrong = Array.from(new Set(opts?.scoutedStrong ?? []));

  const weakBadgesHtml = confirmedWeak
    .map(
      (cat) =>
        `<span class="wsv8-tvg-badge" data-kind="weak" data-category="${escapeHtmlV8(cat)}">✓ WEAK: ${escapeHtmlV8(cat)} (+0.5×)</span>`,
    )
    .join('');

  const strongBadgesHtml = confirmedStrong
    .map(
      (cat) =>
        `<span class="wsv8-tvg-badge" data-kind="strong" data-category="${escapeHtmlV8(cat)}">★ STRONG: ${escapeHtmlV8(cat)}</span>`,
    )
    .join('');

  const hasConfirmedBadges = confirmedWeak.length > 0 || confirmedStrong.length > 0;
  const notebookStampsHtml = hasConfirmedBadges
    ? `
      <div class="wsv8-tvg-stamps-row" aria-label="Confirmed Scouting Notebook Categories">
        <span class="wsv8-tvg-stamps-label">SCOUTED NOTEBOOK:</span>
        ${weakBadgesHtml}${strongBadgesHtml}
      </div>
    `
    : `
      <div class="wsv8-tvg-stamps-row" aria-label="Scouting Notebook Status">
        <span class="wsv8-tvg-stamps-label">SCOUTED NOTEBOOK:</span>
        <span class="wsv8-tvg-badge" data-kind="unscouted">READ BACKSTAGE WIRE TO DEDUCE TURF BEFORE TURN 1</span>
      </div>
    `;

  const inlinePortraitStyle = [
    `background-image: ${portraitLayers.backgroundImage.replace(/"/g, "'")}`,
    `background-size: ${portraitLayers.backgroundSize}`,
    `background-position: ${portraitLayers.backgroundPosition}`,
  ].join('; ');

  return `
    <article class="wsv8-tvguide-card" data-rival-id="${escapeHtmlV8(rivalId)}" aria-label="1966 TV Guide Close-Up Scouting Card for ${escapeHtmlV8(profile.name)}">
      <header class="wsv8-tvg-masthead">
        <div class="wsv8-tvg-stamp-group">
          <span class="wsv8-tvg-logo-crest">TV GUIDE</span>
          <span class="wsv8-tvg-closeup-stamp">CLOSE-UP</span>
          <span class="wsv8-tvg-timeslot">${escapeHtmlV8(showTimeLabel)}</span>
        </div>
        <div class="wsv8-tvg-meta-right">
          ${episodeCode ? `<span class="wsv8-tvg-ep-tag">${escapeHtmlV8(episodeCode)}</span>` : ''}
          <span class="wsv8-tvg-color-box">[4] IBC</span>
          <span class="wsv8-tvg-color-box">[COLOR]</span>
        </div>
      </header>

      <div class="wsv8-tvg-body-row">
        <div class="wsv8-tvg-portrait-col">
          <div class="wsv8-tvg-portrait-frame"
               data-emotion="POISED"
               data-portrait-asset="${escapeHtmlV8(portraitLayers.assetUrl)}"
               style="${inlinePortraitStyle}"
               role="img"
               aria-label="${escapeHtmlV8(profile.name)} 1966 TV Guide Portrait"></div>
          <span class="wsv8-tvg-ch-pill">S${profile.seasonTier ?? 1} CHAMP</span>
        </div>

        <div class="wsv8-tvg-listing-col">
          <div class="wsv8-tvg-program-head">
            <span class="wsv8-tvg-champ-name">${escapeHtmlV8(profile.name)}</span>
            <span class="wsv8-tvg-champ-role">${escapeHtmlV8(profile.title)} · AGE ${profile.age}</span>
          </div>
          <p class="wsv8-tvg-bio-copy">${renderTvGuideBioMarkupV8(rawTvGuideBio)}</p>
        </div>
      </div>

      <div class="wsv8-tvg-wire-box" aria-label="Backstage Wire Scouting Clues">
        <p class="wsv8-tvg-wire-item" data-wire="strong">
          <span class="wsv8-tvg-wire-kicker">Backstage Wire · Wheelhouse:</span>
          <span class="wsv8-tvg-wire-clue">“${escapeHtmlV8(voiceKit.dossierHintStrong.replace(/\.{3,}|\u2026/g, '—'))}”</span>
        </p>
        <p class="wsv8-tvg-wire-item" data-wire="weak">
          <span class="wsv8-tvg-wire-kicker">Backstage Wire · Blind Spot:</span>
          <span class="wsv8-tvg-wire-clue">“${escapeHtmlV8(voiceKit.dossierHintWeak.replace(/\.{3,}|\u2026/g, '—'))}”</span>
        </p>
      </div>

      ${notebookStampsHtml}
    </article>
  `.trim();
}

/**
 * Creates a live DOM element for the 1966 *TV Guide* Pre-Match Close-Up Card.
 */
export function createTvGuideCloseUpElementV8(
  rivalId: RivalIdV7,
  opts?: TvGuideCloseUpCardOptionsV8,
): HTMLElement {
  ensureReactionPipSunlitStylesV8();
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderTvGuideCloseUpCardHTMLV8(rivalId, opts);
  const article = wrapper.firstElementChild as HTMLElement | null;
  return article ?? wrapper;
}
