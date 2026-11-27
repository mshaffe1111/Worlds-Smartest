/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 — SWEEPS WEEK DELUXE)
// `src/v7/ui/KlaxonAndReboundStageV8.ts`
//
// Upgrade #7 — Three Sunlit 1966 Broadcast Showpieces (Zero Dark-Navy Boxes,
// Zero Chopped Quotes, Zero OS Emojis!):
//   1. *QI* Popular-Myth Klaxon Flash-Bulletin Plaque (`flashPopularMythKlaxonV8`)
//      Warm Broadcast Cream (#FAF2DF) & Brushed Brass Studio Plaque crowned by
//      an angled Atomic Tangerine-to-Vermilion (#FF6B35 -> #D92B3A) backlit
//      Acrylite Alarm Marquee flanked by twin Chrome-and-Ruby Rotating Studio
//      Beacons + `✗ BUSTED DINNER-TABLE MYTH` + `✓ TRUE STUDIO FACT` +
//      Grant Bellamy 0% 0% portrait w/ 100% UN-TRUNCATED witty quote!
//   2. Gleaming Brushed Champagne Gold & Emerald Rebound Pot HUD Badge
//      (`renderReboundPotHudPill` & `StudioReboundPotControllerV8`) with custom
//      SVG Silver-Dollar Stack Icon (`REBOUND POT: +$200 NEXT HIT!`) + flying
//      coins to LEFT/RIGHT Solari drum!
//   3. Post-Answer Highlight Stamp & Tailored *YDKJ* Comedy Engine
//      (`evaluatePostAnswerFlavorV8`) with 120 bespoke category-aware wrong-pick
//      banter lines across all 20 `CategoryIdV7` categories!
// ============================================================================

import type {
  CategoryIdV7,
  ClueRecordV7,
  PostAnswerFlavorKindV8,
  StudioVoiceCueIdV8,
  ToyIdV7,
  ToyResolutionV7,
} from '../contracts_v7';

const GRANT_BELLAMY_PORTRAIT_ASSET_V8 = './assets/v7/portraits/grant_bellamy.jpg';
const KLAXON_REBOUND_STYLE_ID_V8 = 'wsv8-klaxon-rebound-sunlit-styles';

const KLAXON_REBOUND_CSS_V8 = `
html body .wsv8-klaxon-stage,
html body .wsv8-klaxon-stage *,
html body .wsv8-rebound-pot-root *,
html body .wsv8-rebound-pot-pill,
html body .wsv8-rebound-pot-pill *,
html body .wsv8-flavor-stamp-wrap,
html body .wsv8-flavor-stamp-wrap *,
html body .wsv8-flavor-stamp,
html body .wsv8-flavor-stamp * {
  box-sizing: border-box;
}

/* 1. Sunlit Studio Flash-Bulletin Klaxon Stage */
html body .wsv8-klaxon-stage {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  z-index: 215;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:
    calc(var(--ws7-safe-top, 0px) + 10px)
    calc(var(--ws7-safe-right, 0px) + 10px)
    calc(var(--ws7-safe-bottom, 0px) + 10px)
    calc(var(--ws7-safe-left, 0px) + 10px);
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 107, 53, 0.44) 0%, transparent 48%),
    radial-gradient(circle at 82% 22%, rgba(217, 43, 58, 0.42) 0%, transparent 48%),
    radial-gradient(ellipse 90% 72% at 50% 46%, rgba(255, 238, 198, 0.46) 0%, rgba(110, 59, 35, 0.78) 62%, rgba(62, 28, 15, 0.90) 100%);
  backdrop-filter: blur(5px);
  overflow-x: hidden;
  overflow-y: auto;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  animation: wsv8KlaxonBackdropIn 0.18s cubic-bezier(0.2, 0.85, 0.3, 1) both;
}

html body .wsv8-klaxon-stage[data-mode='DRAMATIC_BANNER'] {
  inset: auto 0 auto 0;
  top: calc(var(--ws7-safe-top, 0px) + 58px);
  height: auto;
  background: transparent;
  backdrop-filter: none;
  pointer-events: none;
  cursor: default;
  padding: 4px 10px;
}

/* Warm Rotating Studio Beacon Light-Cone Beams */
html body .wsv8-klaxon-sweep-layer {
  position: fixed;
  inset: -20%;
  pointer-events: none;
  overflow: hidden;
  opacity: 0.78;
}

html body .wsv8-klaxon-beam {
  position: absolute;
  top: 50%;
  width: 78vmax;
  height: 78vmax;
  margin-top: -39vmax;
  border-radius: 50%;
  mix-blend-mode: screen;
  filter: blur(8px);
  will-change: transform;
}

html body .wsv8-klaxon-beam--left {
  left: -18vmax;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 107, 53, 0.56) 26deg,
    rgba(255, 209, 102, 0.38) 52deg,
    transparent 84deg,
    transparent 180deg,
    rgba(217, 43, 58, 0.52) 208deg,
    rgba(255, 209, 102, 0.34) 232deg,
    transparent 264deg
  );
  animation: wsv8SirenSpinCW 1.2s linear infinite;
}

html body .wsv8-klaxon-beam--right {
  right: -18vmax;
  background: conic-gradient(
    from 90deg,
    transparent 0deg,
    rgba(217, 43, 58, 0.52) 26deg,
    rgba(255, 198, 92, 0.38) 52deg,
    transparent 84deg,
    transparent 180deg,
    rgba(255, 107, 53, 0.52) 208deg,
    rgba(255, 219, 128, 0.36) 232deg,
    transparent 264deg
  );
  animation: wsv8SirenSpinCCW 1.2s linear infinite;
}

/* Warm Broadcast Cream (#FAF2DF) & Brushed Brass Studio Flash-Bulletin Plaque */
html body .wsv8-klaxon-plaque {
  position: relative;
  z-index: 2;
  width: min(690px, 100%);
  max-height: calc(100dvh - var(--ws7-safe-top, 0px) - var(--ws7-safe-bottom, 0px) - 20px);
  border-radius: 22px;
  padding: 16px 20px 14px;
  background:
    radial-gradient(ellipse 90% 55% at 50% 0%, #FFFDF7 0%, transparent 66%),
    linear-gradient(180deg, #FAF2DF 0%, #F4E7CC 65%, #EDE0C2 100%);
  border: 3.5px solid #D9A441;
  box-shadow:
    inset 0 2px 0 #FFFDF7,
    0 0 0 5px #6E3B23,
    0 8px 0 #4A2412,
    0 22px 52px rgba(58, 24, 12, 0.54);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 11px;
  overflow-x: hidden;
  overflow-y: auto;
  animation:
    wsv8KlaxonCardPop 0.26s cubic-bezier(0.2, 1.18, 0.34, 1) both,
    wsv8KlaxonBorderPulse 0.6s ease-in-out infinite alternate;
}

html body .wsv8-klaxon-stage[data-mode='DRAMATIC_BANNER'] .wsv8-klaxon-plaque {
  width: min(640px, calc(100vw - 20px));
  padding: 10px 14px;
  gap: 8px;
}

/* Top Twin Chrome-and-Ruby Rotating Studio Beacons + Angled Acrylite Alarm Marquee */
html body .wsv8-klaxon-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

html body .wsv8-siren-dome-svg {
  width: 64px;
  height: 68px;
  flex: 0 0 64px;
  overflow: visible;
  filter: drop-shadow(0 4px 10px rgba(184, 37, 62, 0.38));
}

html body .wsv8-siren-rotor {
  transform-origin: 36px 32px;
  animation: wsv8BeaconFilamentPulse 0.36s ease-in-out infinite alternate;
}

html body .wsv8-klaxon-banner-tilt {
  flex: 1 1 auto;
  min-width: 0;
  transform: rotate(-1.6deg);
  background: linear-gradient(96deg, #FF6B35 0%, #E83E33 52%, #D92B3A 100%);
  border: 2.5px solid #FFD166;
  border-radius: 14px;
  padding: 8px 14px;
  text-align: center;
  box-shadow:
    inset 0 2px 0 rgba(255, 253, 247, 0.52),
    0 4px 0 #8C1826,
    0 8px 18px rgba(140, 24, 38, 0.28);
  animation: wsv8KlaxonWordFlash 0.48s ease-in-out infinite alternate;
}

html body .wsv8-klaxon-kicker {
  font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #FFF3C4;
  line-height: 1.12;
}

html body .wsv8-klaxon-headline {
  margin: 2px 0 0;
  font-family: var(--ws7-font-show, 'Caprasimo', 'Jost', serif);
  font-size: clamp(19px, 3.6vw, 28px);
  font-weight: 400;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #FFFDF7;
  line-height: 1.08;
  text-shadow: 0 2px 0 #7A141D;
}

/* Busted Dinner-Table Myth vs. True Studio Fact Plaque */
html body .wsv8-klaxon-cream-body {
  background: #FFFDF7;
  color: #141B29;
  border-radius: 15px;
  padding: 12px 14px;
  border: 2px solid #D9A441;
  box-shadow: inset 0 1px 0 #FFFFFF, 0 3px 8px rgba(110, 59, 35, 0.10);
  display: flex;
  flex-direction: column;
  gap: 9px;
}

html body .wsv8-klaxon-myth-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  padding: 6px 10px;
  border-radius: 10px;
  background: #FFF2F2;
  border: 1.5px solid rgba(217, 43, 58, 0.34);
}

html body .wsv8-klaxon-myth-stamp {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 6px;
  background: #C92432;
  border: 1.5px solid #8C1420;
  color: #FFFDF7;
  font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transform: rotate(-1.2deg);
  flex: 0 0 auto;
}

html body .wsv8-klaxon-trap-struck {
  position: relative;
  display: inline;
  font-family: var(--ws7-font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: clamp(15.5px, 2.3vw, 18.5px);
  font-weight: 800;
  color: #7D1720;
  line-height: 1.32;
  text-decoration: line-through;
  text-decoration-color: #D92B3A;
  text-decoration-thickness: 2.2px;
}

html body .wsv8-klaxon-truth-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  padding: 7px 10px;
  border-radius: 10px;
  background: #EBF9F3;
  border: 1.5px solid rgba(19, 138, 75, 0.42);
}

html body .wsv8-klaxon-truth-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 6px;
  background: linear-gradient(135deg, #008B94 0%, #138A4B 100%);
  color: #FFFDF7;
  font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex: 0 0 auto;
}

html body .wsv8-klaxon-truth-copy {
  font-family: var(--ws7-font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: clamp(16px, 2.5vw, 19.5px);
  font-weight: 800;
  color: #141B29;
  line-height: 1.3;
}

/* Grant Bellamy 0% 0% Gouache Portrait + 100% Un-Truncated Quote */
html body .wsv8-klaxon-host-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #FAF2DF 0%, #F4E6C8 100%);
  border: 1.5px solid #DFBE78;
  border-left: 5px solid #008B94;
  border-radius: 11px;
  padding: 8px 12px;
}

html body .wsv8-klaxon-host-avatar {
  width: 52px;
  height: 52px;
  min-width: 52px;
  min-height: 52px;
  border-radius: 50%;
  border: 2.5px solid #D9A441;
  background-color: #FAF2DF;
  background-size: 200% 200%;
  background-position: 0% 0%;
  background-repeat: no-repeat;
  box-shadow: 0 0 0 2px #6E3B23, 0 3px 8px rgba(74, 36, 18, 0.22);
  flex: 0 0 52px;
}

html body .wsv8-klaxon-host-quip {
  font-family: var(--ws7-font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 14.5px;
  font-weight: 700;
  color: #141B29;
  line-height: 1.4;
  overflow-wrap: break-word;
}

html body .wsv8-klaxon-host-name {
  font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
  font-weight: 900;
  letter-spacing: 0.05em;
  color: #00727A;
  margin-right: 6px;
}

/* Footer Bar with Silver-Dollar Rebound Callout & >= 48x48px Skip Button */
html body .wsv8-klaxon-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

html body .wsv8-klaxon-rebound-note {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 999px;
  background: linear-gradient(180deg, #FFF8E3 0%, #F7DC88 100%);
  border: 1.5px solid #C98A1E;
  font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
  font-size: 13.5px;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #5C3604;
  text-transform: uppercase;
}

html body .wsv8-klaxon-skip-btn {
  min-height: 48px;
  min-width: 112px;
  padding: 8px 18px;
  border-radius: 999px;
  border: 2px solid #F6D379;
  background: linear-gradient(180deg, #009EA8 0%, #008B94 55%, #00666E 100%);
  color: #FFFDF7;
  font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  box-shadow: 0 4px 0 #004950, 0 6px 14px rgba(74, 36, 18, 0.24);
  transition: transform 0.12s ease, filter 0.12s ease;
  flex: 0 0 auto;
}

html body .wsv8-klaxon-skip-btn:hover,
html body .wsv8-klaxon-skip-btn:focus-visible {
  filter: brightness(1.07);
  outline: none;
}

html body .wsv8-klaxon-skip-btn:active {
  transform: translateY(2px);
}

html body .wsv8-klaxon-stage[data-mode='DRAMATIC_BANNER'] .wsv8-klaxon-footer,
html body .wsv8-klaxon-stage[data-mode='DRAMATIC_BANNER'] .wsv8-klaxon-sweep-layer {
  display: none;
}

/* 2. Gleaming Brushed Champagne Gold (#F2A922 / #FFF6E3) & Emerald Rebound Pot HUD Pill */
html body .wsv8-rebound-pot-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  pointer-events: none !important;
  z-index: 56;
  overflow: hidden;
}

body:has(.ws7-top-bug-wrap.ws7-hidden) .wsv8-rebound-pot-pill-anchor,
body:has(.ws7-modal-stage:not(.ws7-hidden)) .wsv8-rebound-pot-pill-anchor,
body:has(.ws7-utility-stage:not(.ws7-hidden)) .wsv8-rebound-pot-pill-anchor,
body:has(.ws7-question-stage:not(.ws7-hidden)) .wsv8-rebound-pot-pill-anchor {
  display: none !important;
}

html body .wsv8-rebound-pot-pill-anchor {
  position: fixed;
  top: calc(var(--ws7-safe-top, 0px) + 58px);
  left: calc(var(--ws7-safe-left, 0px) + 8px);
  right: calc(var(--ws7-safe-right, 0px) + 8px);
  margin: 0 auto;
  width: fit-content;
  max-width: calc(100vw - 16px);
  pointer-events: none !important;
  z-index: 56;
}

html body .wsv8-rebound-pot-pill-anchor[data-empty='true'],
html body .wsv8-rebound-pot-root[data-hidden='true'] .wsv8-rebound-pot-pill-anchor {
  display: none !important;
}

html body .wsv8-rebound-pot-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 28px;
  padding: 3px 13px 3px 11px;
  border-radius: 999px;
  background:
    linear-gradient(180deg, #FFF8E6 0%, #FCE29A 48%, #F2A922 100%);
  border: 2px solid #8F5605;
  box-shadow:
    inset 0 1px 0 #FFFFFF,
    0 0 0 1.5px #FFF6E3,
    0 5px 14px rgba(74, 36, 18, 0.34),
    0 0 18px rgba(242, 169, 34, 0.52);
  color: #141B29;
  font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1.12;
  white-space: nowrap;
  pointer-events: none !important;
  animation: wsv8PotIdleGlow 1.9s ease-in-out infinite alternate;
}

html body .wsv8-rebound-pot-pill[data-bump='true'] {
  animation: wsv8PotCoinDropBump 0.44s cubic-bezier(0.2, 1.35, 0.36, 1) both;
}

html body .wsv8-rebound-coins-svg {
  width: 21px;
  height: 21px;
  flex: 0 0 21px;
  filter: drop-shadow(0 1px 2px rgba(92, 52, 4, 0.35));
}

html body .wsv8-rebound-pot-label {
  color: #4A2412;
  text-transform: uppercase;
}

html body .wsv8-rebound-pot-amount {
  color: #FFFDF7;
  background: linear-gradient(180deg, #18A957 0%, #0E7A3D 100%);
  border: 1.5px solid #095429;
  border-radius: 999px;
  padding: 1px 9px;
  font-family: var(--ws7-font-mono, 'Michroma', 'Jost', sans-serif);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.02em;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

html body .wsv8-rebound-pot-next {
  color: #0B5D31;
  text-transform: uppercase;
  font-weight: 900;
}

/* FX Overlay for Flying Gold $ Coins & Scoop Celebration Banner */
html body .wsv8-rebound-fx-layer {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  pointer-events: none !important;
  z-index: 168;
  overflow: hidden;
}

html body .wsv8-flying-coin {
  position: fixed;
  width: 28px;
  height: 28px;
  margin-left: -14px;
  margin-top: -14px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #FFFDF2 0%, #FFD166 42%, #D98A12 100%);
  border: 2px solid #FFFDF7;
  box-shadow: 0 4px 10px rgba(74, 36, 18, 0.38), 0 0 12px rgba(242, 169, 34, 0.85);
  color: #141B29;
  font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
  font-size: 15px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none !important;
  will-change: transform, opacity;
  animation: wsv8CoinFlyToDrum var(--wsv8-coin-dur, 680ms) cubic-bezier(0.22, 0.86, 0.34, 1) var(--wsv8-coin-delay, 0ms) both;
}

html body .wsv8-drum-hit-ring {
  position: fixed;
  width: 66px;
  height: 66px;
  margin-left: -33px;
  margin-top: -33px;
  border-radius: 50%;
  border: 3px solid #FFD166;
  box-shadow: 0 0 22px rgba(242, 169, 34, 0.9);
  pointer-events: none !important;
  animation: wsv8DrumRingBurst 0.58s cubic-bezier(0.16, 0.84, 0.34, 1) forwards;
}

html body .wsv8-rebound-scoop-banner {
  position: fixed;
  top: calc(var(--ws7-safe-top, 0px) + 58px);
  left: calc(var(--ws7-safe-left, 0px) + 8px);
  right: calc(var(--ws7-safe-right, 0px) + 8px);
  margin: 0 auto;
  width: fit-content;
  max-width: calc(100vw - 16px);
  padding: 6px 16px;
  border-radius: 999px;
  background: linear-gradient(95deg, #0E7A3D 0%, #18A957 52%, #E59A18 100%);
  border: 2px solid #FFF6E3;
  box-shadow:
    0 8px 22px rgba(74, 36, 18, 0.42),
    0 0 22px rgba(242, 169, 34, 0.65);
  color: #FFFDF7;
  font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
  font-size: 14.5px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  white-space: nowrap;
  pointer-events: none !important;
  animation: wsv8ScoopBannerPop 1.55s cubic-bezier(0.2, 0.9, 0.28, 1) forwards;
}

/* 3. Sunlit Post-Answer Highlight Stamp Badges (Zero Dark-Navy!) */
html body .wsv8-flavor-stamp-wrap {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 100%;
}

html body .wsv8-flavor-stamp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.05em;
  line-height: 1.2;
  text-transform: uppercase;
  box-shadow: 0 3px 10px rgba(74, 36, 18, 0.20);
  border: 2px solid #D9A441;
  background: linear-gradient(180deg, #FFF8E6 0%, #F4E4C1 100%);
  color: #141B29;
}

html body .wsv8-flavor-stamp-icon {
  width: 15px;
  height: 15px;
  flex: 0 0 15px;
}

html body .wsv8-flavor-stamp[data-flavor='MYTH_KLAXON'] {
  background: linear-gradient(95deg, #FF6B35 0%, #E03E36 55%, #C92432 100%);
  color: #FFFDF7;
  border-color: #FFD166;
  transform: rotate(-1.2deg);
}

html body .wsv8-flavor-stamp[data-flavor='QUICK_DRAW'] {
  background: linear-gradient(95deg, #008B94 0%, #00A3B5 52%, #1746A2 100%);
  color: #FFFDF7;
  border-color: #FFD166;
}

html body .wsv8-flavor-stamp[data-flavor='DIAL_BULLSEYE'] {
  background: linear-gradient(95deg, #0E7A3D 0%, #18A957 55%, #0E7A3D 100%);
  color: #FFFDF7;
  border-color: #FFD166;
}

html body .wsv8-flavor-stamp[data-flavor='DIAL_NEAR_MISS'] {
  background: linear-gradient(95deg, #1746A2 0%, #008B94 100%);
  color: #FFFDF7;
  border-color: #FFD166;
}

html body .wsv8-flavor-stamp[data-flavor='SHUTTER_EARLY_SOLVE'] {
  background: linear-gradient(95deg, #F2A922 0%, #FF6B35 100%);
  color: #FFFDF7;
  border-color: #FFF6E3;
}

html body .wsv8-flavor-stamp[data-flavor='REBOUND_SCOOP'] {
  background: linear-gradient(95deg, #0E7A3D 0%, #18A957 48%, #E59A18 100%);
  color: #FFFDF7;
  border-color: #FFF6E3;
}

html body .wsv8-flavor-stamp[data-flavor='STANDARD'][data-correct='true'] {
  background: linear-gradient(95deg, #0E7A3D 0%, #18A957 100%);
  color: #FFFDF7;
  border-color: #FFD166;
}

html body .wsv8-flavor-stamp[data-flavor='STANDARD'][data-correct='false'] {
  background: linear-gradient(95deg, #FFF2EC 0%, #FDE2D6 100%);
  color: #8F1D24;
  border-color: #E0533C;
}

html body .wsv8-flavor-subpill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  background: linear-gradient(180deg, #FFF8E6 0%, #F5CA5B 100%);
  color: #141B29;
  border: 1.5px solid #8F5605;
  font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* 4. Compact Portrait (390x660) & Landscape (844x390) Zero-Overlap Bounds */
@media (max-width: 520px), (max-height: 710px) {
  html body .wsv8-rebound-pot-pill-anchor {
    top: calc(var(--ws7-safe-top, 0px) + 56px);
  }

  html body .wsv8-rebound-pot-pill {
    min-height: 25px;
    padding: 2px 10px 2px 8px;
    gap: 5px;
    font-size: 13.5px;
  }

  html body .wsv8-rebound-coins-svg {
    width: 17px;
    height: 17px;
    flex-basis: 17px;
  }

  html body .wsv8-rebound-pot-amount {
    font-size: 13px;
    padding: 1px 6px;
  }

  html body .wsv8-rebound-scoop-banner {
    top: calc(var(--ws7-safe-top, 0px) + 56px);
    padding: 5px 12px;
    font-size: 13.5px;
    white-space: normal;
  }

  html body .wsv8-klaxon-plaque {
    padding: 12px 12px 11px;
    gap: 8px;
    border-radius: 17px;
  }

  html body .wsv8-siren-dome-svg {
    width: 42px;
    height: 46px;
    flex-basis: 42px;
  }

  html body .wsv8-klaxon-header {
    gap: 7px;
  }

  html body .wsv8-klaxon-banner-tilt {
    padding: 6px 9px;
    transform: rotate(-1.2deg);
  }

  html body .wsv8-klaxon-kicker {
    font-size: 12px;
    letter-spacing: 0.06em;
  }

  html body .wsv8-klaxon-headline {
    font-size: clamp(16px, 4.4vw, 20px);
    letter-spacing: 0.02em;
    text-wrap: balance;
  }

  html body .wsv8-klaxon-cream-body {
    padding: 9px 10px;
    gap: 7px;
  }

  html body .wsv8-klaxon-host-avatar {
    width: 42px;
    height: 42px;
    min-width: 42px;
    min-height: 42px;
    flex-basis: 42px;
  }

  html body .wsv8-klaxon-host-quip {
    font-size: 14px;
    line-height: 1.4;
  }
}

@media (max-height: 480px) and (orientation: landscape) {
  html body .wsv8-rebound-pot-pill-anchor {
    top: calc(var(--ws7-safe-top, 0px) + 46px);
  }

  html body .wsv8-rebound-pot-pill {
    min-height: 22px;
    max-height: 22px;
    padding: 1px 10px 1px 8px;
    gap: 5px;
    font-size: 13px;
    border-width: 1.5px;
  }

  html body .wsv8-rebound-coins-svg {
    width: 15px;
    height: 15px;
    flex-basis: 15px;
  }

  html body .wsv8-rebound-pot-amount {
    font-size: 12.5px;
    padding: 0 6px;
  }

  html body .wsv8-rebound-scoop-banner {
    top: calc(var(--ws7-safe-top, 0px) + 47px);
    padding: 4px 12px;
    font-size: 13px;
  }

  html body .wsv8-klaxon-stage {
    padding:
      calc(var(--ws7-safe-top, 0px) + 6px)
      calc(var(--ws7-safe-right, 0px) + 10px)
      calc(var(--ws7-safe-bottom, 0px) + 6px)
      calc(var(--ws7-safe-left, 0px) + 10px);
  }

  html body .wsv8-klaxon-plaque {
    width: min(760px, 100%);
    padding: 9px 14px;
    gap: 6px;
    border-radius: 15px;
  }

  html body .wsv8-siren-dome-svg {
    width: 38px;
    height: 40px;
    flex-basis: 38px;
  }

  html body .wsv8-klaxon-banner-tilt {
    padding: 4px 10px;
    transform: rotate(-1deg);
  }

  html body .wsv8-klaxon-headline {
    font-size: 18px;
  }

  html body .wsv8-klaxon-cream-body {
    padding: 7px 10px;
    gap: 5px;
  }

  html body .wsv8-klaxon-myth-row,
  html body .wsv8-klaxon-truth-row {
    padding: 4px 8px;
  }

  html body .wsv8-klaxon-host-row {
    padding: 5px 9px;
  }

  html body .wsv8-klaxon-host-avatar {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    flex-basis: 36px;
  }

  html body .wsv8-klaxon-skip-btn {
    min-height: 48px;
    padding: 6px 14px;
  }
}

/* 5. Reduced Motion & Keyframes */
html body .wsv8-klaxon-stage[data-reduced-motion='true'] .wsv8-klaxon-beam,
html body .wsv8-klaxon-stage[data-reduced-motion='true'] .wsv8-siren-rotor,
html body .wsv8-klaxon-stage[data-reduced-motion='true'] .wsv8-klaxon-plaque,
html body .wsv8-klaxon-stage[data-reduced-motion='true'] .wsv8-klaxon-banner-tilt,
html body .wsv8-rebound-pot-root[data-reduced-motion='true'] .wsv8-rebound-pot-pill {
  animation: none !important;
}

@media (prefers-reduced-motion: reduce) {
  html body .wsv8-klaxon-beam,
  html body .wsv8-siren-rotor,
  html body .wsv8-klaxon-plaque,
  html body .wsv8-klaxon-banner-tilt,
  html body .wsv8-rebound-pot-pill {
    animation: none !important;
  }
}

@keyframes wsv8KlaxonBackdropIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes wsv8KlaxonCardPop {
  from { opacity: 0; transform: scale(0.92) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes wsv8KlaxonBorderPulse {
  from {
    border-color: #D9A441;
    box-shadow:
      inset 0 2px 0 #FFFDF7,
      0 0 0 5px #6E3B23,
      0 8px 0 #4A2412,
      0 22px 52px rgba(58, 24, 12, 0.54);
  }
  to {
    border-color: #FF6B35;
    box-shadow:
      inset 0 2px 0 #FFFDF7,
      0 0 0 5px #8C2B18,
      0 8px 0 #4A2412,
      0 22px 52px rgba(140, 32, 24, 0.54);
  }
}

@keyframes wsv8KlaxonWordFlash {
  from { filter: brightness(1); }
  to { filter: brightness(1.09); }
}

@keyframes wsv8SirenSpinCW {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes wsv8SirenSpinCCW {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes wsv8BeaconFilamentPulse {
  from { transform: scale(0.92); opacity: 0.85; }
  to { transform: scale(1.12); opacity: 1; }
}

@keyframes wsv8PotIdleGlow {
  from {
    box-shadow:
      inset 0 1px 0 #FFFFFF,
      0 0 0 1.5px #FFF6E3,
      0 5px 14px rgba(74, 36, 18, 0.34),
      0 0 12px rgba(242, 169, 34, 0.40);
  }
  to {
    box-shadow:
      inset 0 1px 0 #FFFFFF,
      0 0 0 1.5px #FFF6E3,
      0 5px 14px rgba(74, 36, 18, 0.34),
      0 0 24px rgba(242, 169, 34, 0.74);
  }
}

@keyframes wsv8PotCoinDropBump {
  0% { transform: scale(0.92) translateY(-4px); }
  55% { transform: scale(1.08) translateY(2px); }
  100% { transform: scale(1) translateY(0); }
}

@keyframes wsv8CoinFlyToDrum {
  0% {
    opacity: 0;
    transform: translate3d(0, 8px, 0) scale(0.55) rotate(-18deg);
  }
  16% {
    opacity: 1;
    transform: translate3d(calc(var(--wsv8-coin-dx, 0px) * 0.16), calc(var(--wsv8-coin-dy, 0px) * 0.16 - 22px), 0)
      scale(1.08) rotate(8deg);
  }
  84% {
    opacity: 1;
    transform: translate3d(calc(var(--wsv8-coin-dx, 0px) * 0.94), calc(var(--wsv8-coin-dy, 0px) * 0.94 - 6px), 0)
      scale(0.96) rotate(190deg);
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--wsv8-coin-dx, 0px), var(--wsv8-coin-dy, 0px), 0) scale(0.45) rotate(240deg);
  }
}

@keyframes wsv8DrumRingBurst {
  0% { opacity: 0.95; transform: scale(0.35); }
  100% { opacity: 0; transform: scale(1.45); }
}

@keyframes wsv8ScoopBannerPop {
  0% { opacity: 0; transform: translateY(8px) scale(0.9); }
  14% { opacity: 1; transform: translateY(0) scale(1.03); }
  78% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-8px) scale(0.96); }
}
`;

export function ensureKlaxonReboundStylesV8(): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(KLAXON_REBOUND_STYLE_ID_V8);
  if (existing) {
    if (existing.parentElement === document.head && document.head.lastElementChild !== existing) {
      document.head.appendChild(existing);
    }
    return;
  }
  const styleEl = document.createElement('style');
  styleEl.id = KLAXON_REBOUND_STYLE_ID_V8;
  styleEl.textContent = KLAXON_REBOUND_CSS_V8;
  document.head.appendChild(styleEl);
}

// ----------------------------------------------------------------------------
// HTML & Whole-Sentence Text Helpers (ZERO Mid-Word Chopping!)
// ----------------------------------------------------------------------------

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanChosenTextDisplay(raw: string | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/^\s*\[[^\]]+\]\s*/, '')
    .replace(/^\s*[A-D][.:)]\s*/i, '')
    .trim();
}

/**
 * Ensures full, complete sentence boundaries with ZERO mid-word slicing (`"at 5 ft—"`)!
 */
function formatWholeSentencesV8(raw: string): string {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (/[.!?”"]$/.test(cleaned)) return cleaned;
  return `${cleaned}.`;
}

// ----------------------------------------------------------------------------
// DELIVERABLE 1 — Sunlit *QI* Popular-Myth Klaxon Flash-Bulletin Plaque
// ----------------------------------------------------------------------------

export type KlaxonPresentationModeV8 = 'STAGE_SPECTACLE' | 'DRAMATIC_BANNER';

export interface FlashPopularMythKlaxonOptionsV8 {
  chosenTrapText?: string;
  trueAnswerText: string;
  ahaFactoid?: string;
  reducedMotion?: boolean;
  onKlaxonSfx?: () => void;
  /** 'STAGE_SPECTACLE' (~1.35s 1-tap skippable) or 'DRAMATIC_BANNER' (non-blocking). */
  mode?: KlaxonPresentationModeV8;
  /** Optional custom dwell time in milliseconds (default 1350ms; 980ms if reducedMotion). */
  durationMs?: number;
  /** Optional custom Grant Bellamy misconception callout override. */
  wittyCallout?: string;
}

const KLAXON_MISCONCEPTION_CALLOUTS_V8: readonly string[] = [
  'Sound the Studio 6A Klaxon! Half the dinner tables in America swear by "{TRAP}"—and our researchers love busting it!',
  'WHOOP-WHOOP! That classic barbershop legend ("{TRAP}") claims another prime-time victim!',
  'Stop the orchestra! "{TRAP}" is Grade-A cocktail-party folklore—light up "{TRUE}" on the Tote Board!',
  'There goes the ruby dome beacon! Even my uncle in Toledo still argues "{TRAP}" at Thanksgiving!',
  'Busted in Living Color! Our writers baited the hook with "{TRAP}" and fifty million viewers just gasped!',
  'Ring the Myth Bell! Textbooks repeated "{TRAP}" for decades before somebody finally checked the receipts!',
  'Classic Popular-Myth ambush! "{TRAP}" sounds so deliciously plausible it oughta carry a warning label!',
  'Aha—the famous "{TRAP}" mirage! File "{TRUE}" in your back pocket and win every parlor bet in town!',
];

let klaxonCalloutCursor = 0;

function pickKlaxonMisconceptionCallout(trapText: string, trueText: string): string {
  const template =
    KLAXON_MISCONCEPTION_CALLOUTS_V8[klaxonCalloutCursor % KLAXON_MISCONCEPTION_CALLOUTS_V8.length];
  klaxonCalloutCursor += 1;
  const safeTrap = trapText.trim() || 'that famous old wives’ tale';
  const safeTrue = trueText.trim() || 'the verified studio fact';
  return template.replace(/\{TRAP\}/g, safeTrap).replace(/\{TRUE\}/g, safeTrue);
}

/**
 * Multi-layered SVG Chrome-and-Ruby Rotating Studio Beacon with warm light-cone beams!
 */
function renderChromeRubyBeaconSvg(side: 'LEFT' | 'RIGHT'): string {
  const domeId = `wsv8RubyDome_${side}`;
  const chromeId = `wsv8ChromeBase_${side}`;
  const coneLeft = side === 'LEFT' ? 'M22 28 L-6 14 L-4 40 Z' : 'M22 28 L-4 16 L-2 38 Z';
  const coneRight = side === 'LEFT' ? 'M50 28 L76 16 L74 38 Z' : 'M50 28 L78 14 L76 40 Z';
  return `
    <svg class="wsv8-siren-dome-svg" viewBox="0 0 72 74" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="${domeId}" x1="20" y1="12" x2="52" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FF785A"/>
          <stop offset="48%" stop-color="#E62E3D"/>
          <stop offset="100%" stop-color="#9A1121"/>
        </linearGradient>
        <linearGradient id="${chromeId}" x1="10" y1="52" x2="62" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FFFDF7"/>
          <stop offset="38%" stop-color="#D7DFE6"/>
          <stop offset="72%" stop-color="#8C99A6"/>
          <stop offset="100%" stop-color="#E8EEF2"/>
        </linearGradient>
      </defs>
      <!-- Warm Tungsten Light-Cone Beams -->
      <path d="${coneLeft}" fill="#FFD166" opacity="0.55"/>
      <path d="${coneRight}" fill="#FF8A47" opacity="0.55"/>
      <line x1="36" y1="2" x2="36" y2="9" stroke="#E59A18" stroke-width="2.6" stroke-linecap="round"/>
      <line x1="15" y1="9" x2="20" y2="14" stroke="#FF6B35" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="57" y1="9" x2="52" y2="14" stroke="#FF6B35" stroke-width="2.4" stroke-linecap="round"/>
      <!-- Fluted Ruby Fresnel Glass Dome -->
      <path d="M19 52 V31 C19 19.5 26.5 12.5 36 12.5 C45.5 12.5 53 19.5 53 31 V52 Z"
            fill="url(#${domeId})" stroke="#D9A441" stroke-width="2.2"/>
      <line x1="25" y1="26" x2="47" y2="26" stroke="#FF9E8A" stroke-opacity="0.45" stroke-width="1.4"/>
      <line x1="22" y1="36" x2="50" y2="36" stroke="#FF9E8A" stroke-opacity="0.45" stroke-width="1.4"/>
      <!-- Internal Chrome Parabolic Rotor & Warm 2700K Filament -->
      <g class="wsv8-siren-rotor">
        <ellipse cx="36" cy="34" rx="8.5" ry="10.5" fill="#FFE082" fill-opacity="0.92"/>
        <circle cx="36" cy="34" r="4.8" fill="#FFFDF7"/>
      </g>
      <!-- Curved Specular Glass Highlight -->
      <path d="M24 48 V30 C24 22.8 28.2 18 33.5 17" stroke="#FFFDF7" stroke-opacity="0.78" stroke-width="2.6" stroke-linecap="round"/>
      <!-- Multi-Stepped Spun-Chrome & Brass Pedestal Bezel -->
      <rect x="14" y="51" width="44" height="8" rx="3.5" fill="url(#${chromeId})" stroke="#6E3B23" stroke-width="1.8"/>
      <rect x="9" y="59" width="54" height="8" rx="4" fill="url(#${chromeId})" stroke="#6E3B23" stroke-width="1.8"/>
      <circle cx="18" cy="63" r="1.6" fill="#D9A441"/>
      <circle cx="54" cy="63" r="1.6" fill="#D9A441"/>
    </svg>
  `;
}

/**
 * Custom SVG Silver-Dollar & Champagne-Gold Coin Stack Icon (Zero OS Emojis!).
 */
function renderSilverDollarStackSvg(className = 'wsv8-rebound-coins-svg'): string {
  return `
    <svg class="${className}" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <!-- Bottom Milled Coin -->
      <ellipse cx="13" cy="21.5" rx="8.5" ry="3.4" fill="#C98A1E" stroke="#5C3604" stroke-width="1.3"/>
      <ellipse cx="13" cy="19.8" rx="8.5" ry="3.4" fill="#F6D379" stroke="#5C3604" stroke-width="1.3"/>
      <!-- Middle Silver-Champagne Dollar -->
      <ellipse cx="15" cy="15.8" rx="8.5" ry="3.4" fill="#9AA8B5" stroke="#4A2412" stroke-width="1.3"/>
      <ellipse cx="15" cy="14.1" rx="8.5" ry="3.4" fill="#F2F6FA" stroke="#4A2412" stroke-width="1.3"/>
      <!-- Top Gleaming Gold-Rimmed Silver Dollar -->
      <ellipse cx="13.5" cy="10.1" rx="8.5" ry="3.5" fill="#D9A441" stroke="#5C3604" stroke-width="1.3"/>
      <ellipse cx="13.5" cy="8.3" rx="8.5" ry="3.5" fill="#FFFDF7" stroke="#5C3604" stroke-width="1.3"/>
      <ellipse cx="13.5" cy="8.3" rx="5.6" ry="2.0" stroke="#D9A441" stroke-width="1.1"/>
    </svg>
  `;
}

function renderSkipChevronsSvg(): string {
  return `
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3.2 L8.8 8 L3 12.8 V3.2 Z" fill="currentColor"/>
      <path d="M8.8 3.2 L14.6 8 L8.8 12.8 V3.2 Z" fill="currentColor"/>
    </svg>
  `;
}

/**
 * Flashes the sunlit 1966 *QI*-inspired Popular-Myth Klaxon Studio Flash-Bulletin Plaque
 * (~1.35s, 1-tap skippable) with twin rotating chrome-and-ruby studio beacons,
 * `✗ BUSTED DINNER-TABLE MYTH`, `✓ TRUE STUDIO FACT`, and Grant Bellamy's un-truncated quote.
 */
export function flashPopularMythKlaxonV8(
  container: HTMLElement,
  opts: FlashPopularMythKlaxonOptionsV8,
): Promise<void> {
  ensureKlaxonReboundStylesV8();

  const mode: KlaxonPresentationModeV8 = opts.mode ?? 'STAGE_SPECTACLE';
  const reduced = Boolean(opts.reducedMotion);
  const defaultMs = reduced ? 980 : 1350;
  const durationMs = Math.max(420, Math.round(opts.durationMs ?? defaultMs));

  const cleanedTrap = cleanChosenTextDisplay(opts.chosenTrapText);
  const trapDisplay = cleanedTrap || 'Popular Cocktail-Party Myth';
  const trueDisplay = opts.trueAnswerText.trim() || 'Verified Studio Fact';
  const calloutCopy = opts.wittyCallout?.trim()
    ? opts.wittyCallout.trim()
    : opts.ahaFactoid?.trim()
      ? `${pickKlaxonMisconceptionCallout(cleanedTrap, trueDisplay)} ${formatWholeSentencesV8(opts.ahaFactoid)}`
      : pickKlaxonMisconceptionCallout(cleanedTrap, trueDisplay);

  opts.onKlaxonSfx?.();

  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    let settled = false;
    const mountedAt = typeof performance !== 'undefined' ? performance.now() : 0;

    const stageEl = document.createElement('section');
    stageEl.className = 'wsv8-klaxon-stage';
    stageEl.dataset.mode = mode;
    stageEl.dataset.reducedMotion = reduced ? 'true' : 'false';
    stageEl.setAttribute('role', mode === 'DRAMATIC_BANNER' ? 'status' : 'dialog');
    stageEl.setAttribute('aria-live', 'assertive');
    stageEl.setAttribute('aria-label', 'Popular Myth Klaxon Alert');

    stageEl.innerHTML = `
      <div class="wsv8-klaxon-sweep-layer" aria-hidden="true">
        <div class="wsv8-klaxon-beam wsv8-klaxon-beam--left"></div>
        <div class="wsv8-klaxon-beam wsv8-klaxon-beam--right"></div>
      </div>

      <div class="wsv8-klaxon-plaque">
        <header class="wsv8-klaxon-header">
          ${renderChromeRubyBeaconSvg('LEFT')}
          <div class="wsv8-klaxon-banner-tilt">
            <div class="wsv8-klaxon-kicker">STUDIO 6A MISCONCEPTION ALARM</div>
            <h2 class="wsv8-klaxon-headline">POPULAR MYTH KLAXON!</h2>
          </div>
          ${renderChromeRubyBeaconSvg('RIGHT')}
        </header>

        <div class="wsv8-klaxon-cream-body">
          <div class="wsv8-klaxon-myth-row">
            <span class="wsv8-klaxon-myth-stamp">✗ BUSTED DINNER-TABLE MYTH</span>
            <span class="wsv8-klaxon-trap-struck">“${escapeHtml(trapDisplay)}”</span>
          </div>
          <div class="wsv8-klaxon-truth-row">
            <span class="wsv8-klaxon-truth-pill">✓ TRUE STUDIO FACT</span>
            <span class="wsv8-klaxon-truth-copy">${escapeHtml(trueDisplay)}</span>
          </div>
          <div class="wsv8-klaxon-host-row">
            <div class="wsv8-klaxon-host-avatar"
                 style="background-image:url('${GRANT_BELLAMY_PORTRAIT_ASSET_V8}'); background-size: 200% 200%; background-position: 0% 0%;"
                 aria-hidden="true"></div>
            <div class="wsv8-klaxon-host-quip">
              <span class="wsv8-klaxon-host-name">GRANT BELLAMY:</span>${escapeHtml(calloutCopy)}
            </div>
          </div>
        </div>

        <footer class="wsv8-klaxon-footer">
          <span class="wsv8-klaxon-rebound-note">
            ${renderSilverDollarStackSvg('wsv8-rebound-coins-svg')}
            <span>FEEDS +$100 INTO STUDIO REBOUND POT!</span>
          </span>
          <button type="button" class="wsv8-klaxon-skip-btn" data-action="skip-klaxon">
            <span>SKIP</span>
            ${renderSkipChevronsSvg()}
          </button>
        </footer>
      </div>
    `;

    const cleanup = (): void => {
      if (typeof window !== 'undefined') {
        window.clearTimeout(autoTimer);
        window.removeEventListener('keydown', onKeyDown);
      }
      stageEl.remove();
    };

    const finish = (): void => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const onKeyDown = (ev: KeyboardEvent): void => {
      if (mode === 'DRAMATIC_BANNER') return;
      if (ev.key === 'Escape' || ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        finish();
      }
    };

    if (mode === 'STAGE_SPECTACLE') {
      stageEl.addEventListener('click', (ev) => {
        const elapsed = typeof performance !== 'undefined' ? performance.now() - mountedAt : 999;
        const target = ev.target as HTMLElement | null;
        const isExplicitSkipBtn = Boolean(target?.closest('[data-action="skip-klaxon"]'));
        if (!isExplicitSkipBtn && elapsed < 160) return;
        finish();
      });
      if (typeof window !== 'undefined') {
        window.addEventListener('keydown', onKeyDown);
      }
    }

    container.appendChild(stageEl);
    const autoTimer = typeof window !== 'undefined' ? window.setTimeout(finish, durationMs) : 0;
  });
}

// ----------------------------------------------------------------------------
// DELIVERABLE 2 — Gleaming Champagne-Gold & Emerald Studio Rebound Pot HUD Pill
// ----------------------------------------------------------------------------

export type ReboundWinnerSideV8 = 'LEFT' | 'RIGHT';

export interface StudioReboundPotOptionsV8 {
  reducedMotion?: boolean;
  initialCash?: number;
  onDropSfx?: () => void;
  onScoopSfx?: () => void;
}

/**
 * Renders the gleaming Brushed Champagne Gold (`#F2A922` / `#FFF6E3`) & Emerald
 * HUD Rebound Pot pill (`REBOUND POT: +$200 NEXT HIT!`) with custom SVG silver-dollar stack.
 */
export function renderReboundPotHudPill(
  potCash: number,
  opts: { bump?: boolean; nextLabel?: string } = {},
): string {
  ensureKlaxonReboundStylesV8();
  const cleanCash = Math.max(0, Math.round(potCash || 0));
  const bumpAttr = opts.bump ? 'true' : 'false';
  const nextText = (opts.nextLabel?.trim() || 'NEXT HIT!').toUpperCase();
  return `
    <div class="wsv8-rebound-pot-pill"
         data-bump="${bumpAttr}"
         role="status"
         aria-live="polite"
         aria-label="Studio Rebound Pot: plus ${cleanCash} dollars on next hit">
      ${renderSilverDollarStackSvg('wsv8-rebound-coins-svg')}
      <span class="wsv8-rebound-pot-label">REBOUND POT:</span>
      <span class="wsv8-rebound-pot-amount">+$${cleanCash.toLocaleString()}</span>
      <span class="wsv8-rebound-pot-next">${escapeHtml(nextText)}</span>
    </div>
  `.trim();
}

export const renderReboundPotHudPillV8 = renderReboundPotHudPill;

/**
 * Persistent, non-blocking 1966 Champagne-Gold & Emerald Rebound Pot HUD Pill controller.
 * Docks cleanly beneath the center Turn counter (`pointer-events: none`, hidden at $0,
 * guaranteed `0px` 3D board tile overlap on `390x660` & `844x390`!) and bursts
 * golden `$` coins straight into the winning LEFT or RIGHT scoreboard drum on scoop!
 */
export class StudioReboundPotControllerV8 {
  private readonly container: HTMLElement;
  private readonly rootEl: HTMLDivElement;
  private readonly pillAnchorEl: HTMLDivElement;
  private readonly pillEl: HTMLDivElement;
  private readonly amountSpanEl: HTMLSpanElement;
  private readonly fxLayerEl: HTMLDivElement;
  private readonly activeTimers = new Set<number>();

  private potCash = 0;
  private reducedMotion = false;
  private readonly onDropSfx?: () => void;
  private readonly onScoopSfx?: () => void;

  constructor(container: HTMLElement, opts: StudioReboundPotOptionsV8 = {}) {
    ensureKlaxonReboundStylesV8();

    this.container = container;
    this.reducedMotion = Boolean(opts.reducedMotion);
    this.onDropSfx = opts.onDropSfx;
    this.onScoopSfx = opts.onScoopSfx;

    this.rootEl = document.createElement('div');
    this.rootEl.className = 'wsv8-rebound-pot-root';
    this.rootEl.dataset.reducedMotion = this.reducedMotion ? 'true' : 'false';
    this.rootEl.dataset.hidden = 'false';

    this.pillAnchorEl = document.createElement('div');
    this.pillAnchorEl.className = 'wsv8-rebound-pot-pill-anchor';
    this.pillAnchorEl.dataset.empty = 'true';

    this.pillEl = document.createElement('div');
    this.pillEl.className = 'wsv8-rebound-pot-pill';
    this.pillEl.dataset.bump = 'false';
    this.pillEl.setAttribute('role', 'status');
    this.pillEl.setAttribute('aria-live', 'polite');

    const coinsWrap = document.createElement('span');
    coinsWrap.innerHTML = renderSilverDollarStackSvg('wsv8-rebound-coins-svg').trim();

    const labelEl = document.createElement('span');
    labelEl.className = 'wsv8-rebound-pot-label';
    labelEl.textContent = 'REBOUND POT:';

    this.amountSpanEl = document.createElement('span');
    this.amountSpanEl.className = 'wsv8-rebound-pot-amount';
    this.amountSpanEl.textContent = '+$0';

    const nextEl = document.createElement('span');
    nextEl.className = 'wsv8-rebound-pot-next';
    nextEl.textContent = 'NEXT HIT!';

    this.pillEl.append(
      coinsWrap.firstElementChild ?? coinsWrap,
      labelEl,
      this.amountSpanEl,
      nextEl,
    );
    this.pillAnchorEl.appendChild(this.pillEl);

    this.fxLayerEl = document.createElement('div');
    this.fxLayerEl.className = 'wsv8-rebound-fx-layer';

    this.rootEl.append(this.pillAnchorEl, this.fxLayerEl);
    this.container.appendChild(this.rootEl);

    if (opts.initialCash && opts.initialCash > 0) {
      this.setPotCash(opts.initialCash);
    }
  }

  /** Returns live integer `$` currently sitting in the Studio Rebound Pot. */
  public getPotCash(): number {
    return this.potCash;
  }

  /** True whenever `$100+` is waiting to be scooped on the next correct answer. */
  public hasActivePot(): boolean {
    return this.potCash > 0;
  }

  /** Updates reduced-motion accessibility mode live. */
  public setReducedMotion(reducedMotion: boolean): void {
    this.reducedMotion = Boolean(reducedMotion);
    this.rootEl.dataset.reducedMotion = this.reducedMotion ? 'true' : 'false';
  }

  /** Explicitly hides/shows the idle Rebound Pot pill (e.g., outside live match play). */
  public setVisible(visible: boolean): void {
    this.rootEl.dataset.hidden = visible ? 'false' : 'true';
  }

  /** Directly sets the pot cash (clamped to integer >= 0) and syncs the pill UI. */
  public setPotCash(cash: number): void {
    this.potCash = Math.max(0, Math.round(cash || 0));
    this.syncPillDom(false);
  }

  /** Resets the Rebound Pot to `$0` immediately without playing scoop VFX. */
  public resetPot(): void {
    this.potCash = 0;
    this.syncPillDom(false);
  }

  /**
   * Increments the Studio Rebound Pot (`+$100` default) whenever ANY clue is missed,
   * illuminating the Champagne-Gold & Emerald Rebound Pot Pill beneath the Turn counter.
   */
  public addMissToPot(amount = 100): number {
    const delta = Math.max(0, Math.round(amount));
    if (delta <= 0) return this.potCash;
    this.potCash += delta;
    this.syncPillDom(true);
    this.onDropSfx?.();
    return this.potCash;
  }

  /**
   * Scoops the entire Studio Rebound Pot when the next podium answers correctly!
   * Bursts golden `$` coins toward the winning scoreboard drum (`LEFT` or `RIGHT`),
   * flashes the Emerald & Gold Scoop Banner, resets pot to `$0`, and returns `$` scooped!
   */
  public scoopPot(winnerSide: ReboundWinnerSideV8, winnerLabel: string): number {
    const amount = this.potCash;
    if (amount <= 0) {
      return 0;
    }

    const origin = this.resolvePotOriginPoint();
    const target = this.resolveScoreboardDrumPoint(winnerSide);

    this.potCash = 0;
    this.syncPillDom(false);
    this.onScoopSfx?.();

    const cleanWinner = (winnerLabel.trim() || (winnerSide === 'LEFT' ? 'YOU' : 'RIVAL')).toUpperCase();
    this.spawnScoopCelebration(origin, target, cleanWinner, amount);

    return amount;
  }

  /** Removes DOM nodes and cancels all pending coin/banner cleanup timers. */
  public dispose(): void {
    if (typeof window !== 'undefined') {
      for (const id of this.activeTimers) {
        window.clearTimeout(id);
      }
    }
    this.activeTimers.clear();
    this.rootEl.remove();
  }

  private syncPillDom(animateBump: boolean): void {
    if (this.potCash <= 0) {
      this.pillAnchorEl.dataset.empty = 'true';
      this.amountSpanEl.textContent = '+$0';
      this.pillEl.dataset.bump = 'false';
      return;
    }

    this.amountSpanEl.textContent = `+$${this.potCash.toLocaleString()}`;
    this.pillEl.setAttribute(
      'aria-label',
      `Studio Rebound Pot: plus ${this.potCash} dollars on next hit`,
    );
    this.pillAnchorEl.dataset.empty = 'false';

    if (animateBump && !this.reducedMotion && typeof window !== 'undefined') {
      this.pillEl.dataset.bump = 'false';
      void this.pillEl.offsetWidth;
      this.pillEl.dataset.bump = 'true';
      this.scheduleCleanup(() => {
        this.pillEl.dataset.bump = 'false';
      }, 480);
    }
  }

  private resolvePotOriginPoint(): { x: number; y: number } {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 390;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 844;
    const rect = this.pillEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.5,
      };
    }
    return {
      x: vw * 0.5,
      y: vh <= 480 && vw > vh ? 57 : 70,
    };
  }

  private resolveScoreboardDrumPoint(side: ReboundWinnerSideV8): { x: number; y: number } {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 390;
    if (typeof document !== 'undefined') {
      const selector =
        side === 'LEFT'
          ? '.ws7-solari-box[data-side="player"] .ws7-solari-drum, .ws7-solari-box[data-side="player"], [data-podium-side="left"]'
          : '.ws7-solari-box[data-side="rival"] .ws7-solari-drum, .ws7-solari-box[data-side="rival"], [data-podium-side="right"]';
      const el =
        this.container.querySelector<HTMLElement>(selector) ??
        document.querySelector<HTMLElement>(selector);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          return {
            x: r.left + r.width * 0.5,
            y: r.top + r.height * 0.5,
          };
        }
      }
    }
    return {
      x: side === 'LEFT' ? Math.max(48, vw * 0.16) : Math.min(vw - 64, vw * 0.66),
      y: 28,
    };
  }

  private spawnScoopCelebration(
    origin: { x: number; y: number },
    target: { x: number; y: number },
    winnerUpper: string,
    amount: number,
  ): void {
    const banner = document.createElement('div');
    banner.className = 'wsv8-rebound-scoop-banner';
    const bannerCopy =
      winnerUpper === 'YOU'
        ? `YOU SCOOP +$${amount.toLocaleString()} REBOUND POT!`
        : `${winnerUpper} SCOOPS +$${amount.toLocaleString()} REBOUND POT!`;
    banner.innerHTML = `${renderSilverDollarStackSvg('wsv8-rebound-coins-svg')}<span>${escapeHtml(bannerCopy)}</span>`;
    this.fxLayerEl.appendChild(banner);
    this.scheduleCleanup(() => banner.remove(), 1600);

    if (this.reducedMotion) {
      const ring = document.createElement('div');
      ring.className = 'wsv8-drum-hit-ring';
      ring.style.left = `${target.x.toFixed(1)}px`;
      ring.style.top = `${target.y.toFixed(1)}px`;
      this.fxLayerEl.appendChild(ring);
      this.scheduleCleanup(() => ring.remove(), 620);
      return;
    }

    const coinCount = Math.min(16, Math.max(10, Math.round(amount / 25)));
    for (let i = 0; i < coinCount; i += 1) {
      const coin = document.createElement('div');
      coin.className = 'wsv8-flying-coin';
      coin.textContent = '$';

      const spreadX = ((i % 5) - 2) * 11;
      const spreadY = (Math.floor(i / 5) - 1) * 6;
      const startX = origin.x + spreadX;
      const startY = origin.y + spreadY;
      const dx = target.x - startX;
      const dy = target.y - startY;
      const delayMs = i * 28;
      const durMs = 620 + (i % 3) * 45;

      coin.style.left = `${startX.toFixed(1)}px`;
      coin.style.top = `${startY.toFixed(1)}px`;
      coin.style.setProperty('--wsv8-coin-dx', `${dx.toFixed(1)}px`);
      coin.style.setProperty('--wsv8-coin-dy', `${dy.toFixed(1)}px`);
      coin.style.setProperty('--wsv8-coin-delay', `${delayMs}ms`);
      coin.style.setProperty('--wsv8-coin-dur', `${durMs}ms`);

      this.fxLayerEl.appendChild(coin);
      this.scheduleCleanup(() => coin.remove(), delayMs + durMs + 80);
    }

    this.scheduleCleanup(() => {
      const ring = document.createElement('div');
      ring.className = 'wsv8-drum-hit-ring';
      ring.style.left = `${target.x.toFixed(1)}px`;
      ring.style.top = `${target.y.toFixed(1)}px`;
      this.fxLayerEl.appendChild(ring);
      this.scheduleCleanup(() => ring.remove(), 620);
    }, 520);
  }

  private scheduleCleanup(fn: () => void, ms: number): void {
    if (typeof window === 'undefined') {
      fn();
      return;
    }
    const id = window.setTimeout(() => {
      this.activeTimers.delete(id);
      fn();
    }, ms);
    this.activeTimers.add(id);
  }
}

// ----------------------------------------------------------------------------
// DELIVERABLE 3 — Post-Answer Highlight Stamp & Tailored *YDKJ* Comedy Engine
// 120 Category-Aware Wrong-Pick Lines (6 Bespoke Lines × All 20 Categories!)
// ----------------------------------------------------------------------------

export const CATEGORY_WRONG_PICK_QUIPS_V8: Readonly<Record<CategoryIdV7, readonly string[]>> = {
  MEDICINE: [
    'Paging Dr. Kildare to Studio 6A! Prescribing “{CHOICE}” just made our staff nurse drop her clipboard!',
    'Say “Ahhh”—“{CHOICE}” is a bold bedside diagnosis, though Bellevue Hospital begs for a second opinion!',
    'Ooh, “{CHOICE}”! Even a 1966 TV doctor in a freshly ironed lab coat wouldn’t sign that chart!',
    'Hold the stethoscope! “{CHOICE}” cures hiccups in comic strips, not questions on the Tote Board!',
    'Our studio pharmacist squinted at “{CHOICE}” and offered you two aspirin and a Mulligan!',
    'Paging Operating Room B—someone just tapped “{CHOICE}” without scrubbing in first!',
  ],
  CHEMISTRY: [
    'Duck behind the lab bench! Mixing in “{CHOICE}” just turned our Studio 6A beaker bright purple!',
    'Dmitri Mendeleev called from the periodic table—“{CHOICE}” has been evicted from Group VIII!',
    'Safety goggles on, folks! Tapping “{CHOICE}” singed the eyebrows right off our cue-card boy!',
    '“{CHOICE}”? Lovely try if we were brewing medieval alchemy, slightly explosive in 1966 Chemistry!',
    'Our Bunsen burner just coughed polite turquoise smoke at “{CHOICE}”—wrong reagent, great confidence!',
    'Erlenmeyer flask says no cigar on “{CHOICE}”, though it’d make a terrific hair tonic!',
  ],
  PHYSICS: [
    'Sir Isaac Newton just rubbed his noggin in Row C—“{CHOICE}” breaks at least two laws of motion!',
    'Cape Kennedy ran “{CHOICE}” on the brass slide rule and our capsule splashed down in Hoboken!',
    'Whoa, “{CHOICE}”! Even Einstein’s chalkboard needed an eraser after that relativistic curveball!',
    'Hold onto your protons—“{CHOICE}” only works in a frictionless vacuum on alternate Tuesdays!',
    'Our studio pendulum took one look at “{CHOICE}” and swung straight into the velvet curtains!',
    '“{CHOICE}” is bold quantum optimism—in another universe you nailed it, in Studio 6A the buzzer rang!',
  ],
  GADGETS: [
    'The U.S. Patent Office stamped “{CHOICE}” *RETURN TO INVENTOR*—check the wiring diagram!',
    'Bzzzt! Plugging “{CHOICE}” into Studio 6A just blew three vintage RCA vacuum tubes in the booth!',
    '“{CHOICE}” sounds like a swell midnight TV veg-o-matic pitch, just not the contraption on our card!',
    'Hold the soldering iron—“{CHOICE}” still needs two D-cell batteries and a miracle to pass inspection!',
    'Our prop-department tinkerer tapped “{CHOICE}” with a wrench and a cuckoo spring popped out!',
    'Sears Roebuck called—“{CHOICE}” is on backorder till the 21st century, folks!',
  ],
  ENGINES: [
    'Clang-clatter-hiss! Shifting into “{CHOICE}” just left our transmission in the studio parking lot!',
    'Detroit’s finest engineers peeked under the hood at “{CHOICE}” and whistled through their teeth!',
    'All aboard the wrong siding—“{CHOICE}” has plenty of chrome, just zero horsepower on this clue!',
    'Pull the choke! “{CHOICE}” flooded the carburetor three yards past the starting line!',
    'Even the Wright brothers kept the receipt when somebody tried flying on “{CHOICE}”!',
    'Pit stop on Aisle 6—“{CHOICE}” revved like a Mustang and stalled like a lawnmower!',
  ],
  LITERATURE: [
    'Overdue library fine on “{CHOICE}”! The New York Public Library lions just raised both stone eyebrows!',
    'Ernest Hemingway took one sip, crossed out “{CHOICE}” in red grease pencil, and ordered another round!',
    'Did somebody slip a fake page into your CliffNotes? “{CHOICE}” belongs in a whole different book club!',
    'Plot twist in Chapter Twelve—“{CHOICE}” was a charming red herring in a tweed dust jacket!',
    'Our studio bookworm adjusted her spectacles at “{CHOICE}” and whispered, “Great title, wrong shelf!”',
    'Put down the bookmark—“{CHOICE}” sounds like a Pulitzer contender, right up until the buzzer buzzes!',
  ],
  LEXICON: [
    'Noah Webster just spun in his leather armchair—“{CHOICE}” wouldn’t survive a Scrabble challenge!',
    'Ooh, working the Sunday crossword in fountain pen? “{CHOICE}” just smudged four squares across!',
    'Hold the rotary linotype! “{CHOICE}” rolls off the tongue like velvet and lands six pages off in the dictionary!',
    'Our Studio 6A etymologist tipped his fedora to “{CHOICE}”—grade-A bluff, zero dictionary points!',
    'Put a nickel in the swear jar—picking “{CHOICE}” in Words & Wit is pure parlor-game audacity!',
    'Spelling-bee bell! “{CHOICE}” had marvelous posture at the microphone, wrong definition!',
  ],
  'FINE ARTS': [
    'Careful with the velvet rope! Hanging “{CHOICE}” in the Guggenheim upside-down still won’t fool the curator!',
    'Sotheby’s gave “{CHOICE}” a very polite golf clap before dropping the gavel on the real masterpiece!',
    'Our beret-wearing Greenwich Village critic squinted at “{CHOICE}” and called it “boldly incorrect!”',
    'Step back from the easel—“{CHOICE}” has lovely brushwork, wrong century in the gallery wing!',
    'Louvre security just straightened the gilt frame after you tried signing “{CHOICE}” in the corner!',
    '“{CHOICE}” belongs over a sunlit sunken sofa in Palm Springs, just not on our Fine Arts plaque!',
  ],
  SCREEN: [
    'Cut! Print nothing! “{CHOICE}” just landed squarely on Paramount’s cutting-room floor!',
    'Snap the clapperboard for Take Two—“{CHOICE}” wandered onto the wrong Technicolor soundstage!',
    'Alfred Hitchcock stepped out of the shadow to warn you—“{CHOICE}” was the decoy script!',
    'Check the marquee letters out front! “{CHOICE}” is playing at the drive-in across town, not here!',
    'Price Waterhouse double-checked the sealed envelope and “{CHOICE}” didn’t even get nominated!',
    'Roll the blooper reel—“{CHOICE}” had movie-star hair and a stunt-double fact check!',
  ],
  JUKEBOX: [
    'Scrrratch goes the phonograph needle! Dropping a dime on “{CHOICE}” spun the wrong 45rpm B-side!',
    'Dick Clark gave “{CHOICE}” a 38 on *Bandstand*—“snappy title, folks, tough to score points to!”',
    'Somebody bumped the Wurlitzer! “{CHOICE}” is a toe-tapper in Tin Pan Alley, wrong chart-topper here!',
    'Hold the brass section—Milton DeLugg waved off “{CHOICE}” before the downbeat even landed!',
    'Flip that vinyl pancake over! “{CHOICE}” was hiding in the bargain crate behind the polka singles!',
    'Our jukebox bubble tubes blinked twice at “{CHOICE}” and politely refunded a wooden nickel!',
  ],
  FINANCE: [
    'Sell! Sell! Ring the Broad Street bell—putting margin on “{CHOICE}” just jammed the glass ticker dome!',
    'Even {RIVAL} winced at that portfolio move—“{CHOICE}” pays dividends strictly in Monopoly cash!',
    'Our Wall Street actuary adjusted his green eyeshade—“{CHOICE}” bounced higher than a rubber check!',
    'Tuck it back in the mattress! Banking on “{CHOICE}” wouldn’t pass a friendly neighborhood audit!',
    'The bulls and the bears shook hands and agreed—“{CHOICE}” belongs in the paper shredder!',
    'Open the brass vault and check the ledger—“{CHOICE}” came up three doubloons short of legal tender!',
  ],
  PRICING: [
    'Price check on Register Four! Ringing up “{CHOICE}” made our chrome cash register pop a spring!',
    'Sticker shock in Aisle Seven—“{CHOICE}” missed the manufacturer’s retail tag by a country mile!',
    'Save your Green Stamps, folks! “{CHOICE}” was the window-display teaser, not the real price tag!',
    'Our department-store floorwalker tipped his carnation—“{CHOICE}” is marked down to zero dollars!',
    'Clipped the wrong Sunday coupon! “{CHOICE}” looks like a bargain right till you reach the checkout lane!',
    'No sale on the brass key! Even a 1966 Sears catalog wouldn’t print “{CHOICE}” on that tag!',
  ],
  ODDS: [
    'Snake eyes on the green felt! Putting your chips on “{CHOICE}” just bought the Vegas pit boss a boat!',
    'Monte Carlo’s croupier raked “{CHOICE}” off the layout without ruffling a single tuxedo pleat!',
    'Never tell you the odds? Maybe we should’ve—“{CHOICE}” was a 40-to-1 nag still eating oats in the paddock!',
    'Blow on the ivory dice next time—“{CHOICE}” bounced off the backboard and straight into the soup!',
    'Our studio statistician crunched “{CHOICE}” and his pocket protector spontaneously popped a button!',
    'Lady Luck winked from the balcony and stepped right past “{CHOICE}” on her way to the cashier!',
  ],
  ATLAS: [
    'Attention Pan Am passengers: picking “{CHOICE}” just sent your suitcases to the wrong hemisphere!',
    'Spin the brass globe again—“{CHOICE}” is a lovely spot for postcards, thousand miles from the pin!',
    'Fighting a refolded Rand McNally highway map? “{CHOICE}” took a scenic left turn at Albuquerque!',
    'Magellan’s lookout squinted through the brass spyglass and shouted, “Definitely NOT {CHOICE}!”',
    'Stamp your passport *REROUTED*—“{CHOICE}” missed the meridian, though the beaches are swell!',
    'Paging Studio Cartography—somebody just planted a flag on “{CHOICE}” with their eyes half-shut!',
  ],
  SPORTS: [
    'Foul ball into the upper deck! Swinging at “{CHOICE}” just knocked the mustard off a ballpark frank!',
    'Yellow hankie on the play! The head linesman called five yards for illegal use of “{CHOICE}”!',
    'Cue the *Wide World of Sports* ski-jump ramp—“{CHOICE}” had championship form right till the landing!',
    'Howard Cosell leaned into the ribbon mic: “Down goes ‘{CHOICE}’! A heartbreaking whiff at the plate!”',
    'Gutter ball on Lane Twelve—“{CHOICE}” hooked left right before the headpin!',
    'Check the instant-replay telestrator—“{CHOICE}” stepped half a cleat out of bounds!',
  ],
  DYNASTIES: [
    'Raise the castle drawbridge! Claiming “{CHOICE}” just got you uninvited from the royal banquet!',
    'The court herald unrolled six yards of parchment and “{CHOICE}” wasn’t on a single family tree!',
    'Careful with the ermine robe—crowning “{CHOICE}” just started a minor succession crisis in Row F!',
    'Versailles gossip travels fast: “{CHOICE}” sat on the wrong velvet cushion at the coronation!',
    'Off to the polite end of the moat—“{CHOICE}” had regal bearing, wrong century on the throne!',
    'Our royal numismatist flipped the gold sovereign and “{CHOICE}” wasn’t stamped on either side!',
  ],
  HEADLINES: [
    'Stop the rotary presses! Printing “{CHOICE}” is our biggest front-page oops since *DEWEY DEFEATS TRUMAN*!',
    'Flashbulb popped too early—our cub reporter wired in “{CHOICE}” without checking the city desk!',
    'Walter Cronkite just raised one polite eyebrow over his glasses at “{CHOICE}”—and that’s NOT the way it was!',
    'Rip it off the Associated Press teletype—“{CHOICE}” belongs in the Sunday funny papers, not Page One!',
    'Extra! Extra! Read all about how “{CHOICE}” nearly fooled Studio 6A before the fact-checker arrived!',
    'Spike that copy on the brass spindle—“{CHOICE}” is a juicy rumor, wrong historical dateline!',
  ],
  FOLKLORE: [
    'Tall-tale alert around the campfire! Even Paul Bunyan blushed when you tried passing off “{CHOICE}”!',
    'Zeus tapped a polite warning spark on Mount Olympus—“{CHOICE}” mixed up two completely different scrolls!',
    'The Brothers Grimm checked their leather notebook and left “{CHOICE}” out in the enchanted woods!',
    'Blurry Loch Ness snapshot! “{CHOICE}” makes a dandy bedtime yarn, wrong legend in the vault!',
    'Rub the brass lamp again—the genie popped out, saw “{CHOICE}”, and asked for another wish!',
    'Sailors’ knot on the lore deck! “{CHOICE}” sang like a siren and steered straight onto the rocks!',
  ],
  FALLACIES: [
    'Aha—you stepped right onto the painted tunnel on the wall! “{CHOICE}” was textbook logic bait!',
    'Socrates just poured himself a stiff cup of diner coffee—“{CHOICE}” tied your premises in a bowline knot!',
    'Look at that Carnaby-red herring swim by! Our writers polished “{CHOICE}” specifically to tickle fast thumbs!',
    'M.C. Escher built that staircase: “{CHOICE}” feels like you’re climbing up while walking straight down!',
    'Three-card monte on the brain! “{CHOICE}” winked from under the walnut shell and picked your pocket!',
    'Classic parlor-trick ambush—“{CHOICE}” sounds 100% airtight for three seconds until gravity kicks in!',
  ],
  CUISINE: [
    'Mon Dieu in Kitchen B! Tossing “{CHOICE}” into the copper skillet just collapsed our prize French soufflé!',
    'Julia Child caught the pancake mid-air and chuckled—“save ‘{CHOICE}’ for a very adventurous casserole!”',
    'Send compliments—and an apology—to the chef! “{CHOICE}” belongs behind the wrong Horn & Hardart glass door!',
    'Hold the flambé match! Ordering “{CHOICE}” got raise-of-the-eyebrow service from our tuxedoed maître d’!',
    'Five-alarm spice swap! “{CHOICE}” sounded delicious on the blackboard menu, wrong secret ingredient!',
    'The Michelin inspector tucked away his napkin—zero stars for “{CHOICE}”, ten points for appetite!',
  ],
};

const CATEGORY_NON_CHOICE_MISS_QUIPS_V8: Readonly<Record<CategoryIdV7, string>> = {
  MEDICINE: 'The Studio 6A pulse monitor beat the buzzer—Bellevue drops +$100 straight into the Rebound Pot!',
  CHEMISTRY: 'Bunsen burner cooled before the reaction finished—+$100 bubbles into the Studio Rebound Pot!',
  PHYSICS: 'Time dilation favors nobody on network TV—+$100 drops into the center-stage Rebound Pot!',
  GADGETS: 'Spring wound down a hair shy of the patent mark—+$100 clinks into the Rebound Pot!',
  ENGINES: 'Checkered flag waved while we were still tuning the carburetor—+$100 joins the Rebound Pot!',
  LITERATURE: 'Caught mid-chapter when the studio clock chimed—+$100 sweetens the next clue’s Rebound Pot!',
  LEXICON: 'Tip-of-the-tongue syndrome strikes in Living Color—+$100 drops into the Rebound Pot!',
  'FINE ARTS': 'Gallery closing bell rang mid-brushstroke—+$100 gleams inside the Studio Rebound Pot!',
  SCREEN: 'Director yelled “Cut!” a split-second early—+$100 rolls into the center Rebound Pot!',
  JUKEBOX: 'Record finished spinning before the dime dropped—+$100 lights up the Studio Rebound Pot!',
  FINANCE: 'Closing bell on Broad Street caught us flat-footed—+$100 stacks into the Rebound Pot!',
  PRICING: 'Checkout lane closed by a whisker—+$100 drops into the gleaming Gold Rebound Pot!',
  ODDS: 'No more bets on the felt—that miss feeds +$100 straight into the Studio Rebound Pot!',
  ATLAS: 'Missed the departure gate by inches—+$100 lands in the center-stage Rebound Pot!',
  SPORTS: 'Shot-clock buzzer from mid-court—+$100 bounces into the live Rebound Pot for the next play!',
  DYNASTIES: 'Hourglass ran dry in the throne room—+$100 gold sovereigns drop into the Rebound Pot!',
  HEADLINES: 'Missed the late-edition deadline—+$100 sweetens the next headline via the Rebound Pot!',
  FOLKLORE: 'Midnight chime turned the carriage back into a pumpkin—+$100 joins the Rebound Pot!',
  FALLACIES: 'Paradox tied up the clock—and fed a juicy +$100 into the Studio Rebound Pot!',
  CUISINE: 'Kitchen timer dinged before plating—+$100 simmers inside the center-stage Rebound Pot!',
};

const QUICK_DRAW_HOST_LINES_V8: readonly string[] = [
  'Quick-Draw lightning ({SEC}s)! The ink wasn’t even dry on my cue card and you smoked the buzzer!',
  'Fastest thumb East of Burbank—{SEC} seconds flat! Control Booth A barely got the camera switched!',
  'Mercy, {SEC}s on the clock! Did you read my mind backstage or are you wired into the RCA teleprompter?',
  'Bang-zoom in {SEC} seconds! {RIVAL} hadn’t even finished exhaling before you banked those dollars!',
  'Electric reflex ({SEC}s)! Milton DeLugg’s band barely played two notes of the *Think!* vamp!',
];

const DIAL_BULLSEYE_HOST_LINES_V8: readonly string[] = [
  'Dead-center pinpoint bullseye! Give that contestant a gold slide rule and a box of cigars!',
  'Right on the brass hairline! Our studio calibration engineers are standing up and applauding!',
  'Surgical precision! You parked that needle right in the prime-time sweet spot!',
  'Pinpoint telemetry! Cape Kennedy couldn’t have dialed that number in any cleaner!',
];

const DIAL_NEAR_MISS_HOST_LINES_V8: readonly string[] = [
  'Razor-close estimate! Right in the neighborhood—our judges happily pay out studio partial credit!',
  'Just a coat of paint off the bullseye! Brilliant gut instinct on a tough estimation clue!',
  'Ooh, within shouting distance of the exact mark! Smart read—stack those well-earned dollars!',
  'Right on the green tolerance rim! Most folks miss that by a mile and you parked it next door!',
];

const SHUTTER_EARLY_HOST_LINES_V8: readonly string[] = [
  'Solved on {MULT}× before the shutters even cleared! Pure Sherlock Holmes prime-time wizardry!',
  'STOP THE REEL AT {MULT}×! You nailed it off the toughest lateral clue in the canister!',
  '{MULT}× Early-Shutter Jackpot! Half the studio hadn’t connected word one and you rang the bell!',
  'Magnificent {MULT}× read! Saving those closed shutters just supercharged your payout!',
];

const REBOUND_SCOOP_HOST_LINES_V8: readonly string[] = [
  'Cash in the pot and into your pocket! You scoop +${POT} from the gleaming Studio Rebound Pot!',
  'Opportunistic brilliance! One miss feeds the pot, and you sweep the +${POT} Rebound Jackpot clean!',
  'Listen to those silver dollars pour! +${POT} Rebound Pot bonus straight onto your Split-Flap drum!',
  'Nothing sweeter in game-show television—nailing the follow-up and scooping +${POT} off the Rebound Pot!',
];

const STANDARD_RIGHT_HOST_LINES_V8: readonly string[] = [
  'Right on the money! Crisp, cool, and straight onto the Living Color Tote Board!',
  'Bingo! Clean as a whistle—our research department tips their fedoras to you!',
  'Spot on! You made that curveball look like Sunday morning coffee!',
  'Ding-ding! Stack those crisp broadcast dollars and keep {RIVAL} sweating!',
];

const categoryQuipCursors: Partial<Record<CategoryIdV7, number>> = {};

function pickCategoryWrongQuip(
  category: CategoryIdV7,
  chosenChoiceText: string,
  rivalName: string,
  qidSeed: number,
): string {
  const pool = CATEGORY_WRONG_PICK_QUIPS_V8[category] ?? CATEGORY_WRONG_PICK_QUIPS_V8.FALLACIES;
  const prev = categoryQuipCursors[category];
  const baseIdx = prev === undefined ? Math.abs(qidSeed) % pool.length : (prev + 1) % pool.length;
  categoryQuipCursors[category] = baseIdx;
  const template = pool[baseIdx] ?? pool[0];
  const cleanChoice = chosenChoiceText.trim();
  const cleanRival = rivalName.trim() || 'the Champion';
  return template.replace(/\{CHOICE\}/g, cleanChoice).replace(/\{RIVAL\}/g, cleanRival);
}

export interface EvaluatePostAnswerFlavorInputV8 {
  clue: Pick<ClueRecordV7, 'qid' | 'category' | 'choices' | 'answerIdx' | 'isKlaxonMyth'> &
    Partial<Pick<ClueRecordV7, 'poisonedFixIdx' | 'numeric' | 'geo' | 'shutters'>>;
  resolution: ToyResolutionV7 & {
    readonly correct?: boolean;
    readonly shutterSolvedAtCount?: number;
    readonly detail?: string;
  };
  responseTimeSec: number;
  reboundScoopedCash: number;
  playerStreak: number;
  rivalName: string;
  toyId?: ToyIdV7;
  chosenChoiceIdx?: number | null;
  distanceKm?: number | null;
}

export interface PostAnswerFlavorEvaluationV8 {
  readonly flavorKind: PostAnswerFlavorKindV8;
  readonly stampBadgeHtml: string;
  readonly wittyHostLine: string;
  readonly suggestedVoiceCue: StudioVoiceCueIdV8 | null;
}

function resolveWrongChoiceIndex(
  clue: Pick<ClueRecordV7, 'choices' | 'answerIdx'>,
  chosenSummary: string,
  explicitIdx?: number | null,
): number {
  if (
    typeof explicitIdx === 'number' &&
    Number.isInteger(explicitIdx) &&
    explicitIdx >= 0 &&
    explicitIdx < clue.choices.length &&
    explicitIdx !== clue.answerIdx
  ) {
    return explicitIdx;
  }

  const cleaned = cleanChosenTextDisplay(chosenSummary);
  if (!cleaned) return -1;

  for (let i = 0; i < clue.choices.length; i += 1) {
    if (i === clue.answerIdx) continue;
    if (clue.choices[i].trim() === cleaned) return i;
  }

  const lower = cleaned.toLowerCase();
  for (let i = 0; i < clue.choices.length; i += 1) {
    if (i === clue.answerIdx) continue;
    if (clue.choices[i].trim().toLowerCase() === lower) return i;
  }

  return -1;
}

function parseGlobeDistanceKm(
  chosenSummary: string,
  explicitDistanceKm?: number | null,
): number | null {
  if (typeof explicitDistanceKm === 'number' && Number.isFinite(explicitDistanceKm)) {
    return Math.max(0, explicitDistanceKm);
  }
  const m = chosenSummary.match(/(\d+(?:\.\d+)?)\s*KM\s+from\b/i);
  if (!m) return null;
  const val = Number.parseFloat(m[1]);
  return Number.isFinite(val) ? Math.max(0, val) : null;
}

function detectShutterEarlyMultiplier(
  resolution: EvaluatePostAnswerFlavorInputV8['resolution'],
  clue: EvaluatePostAnswerFlavorInputV8['clue'],
  toyId?: ToyIdV7,
): number | null {
  const prefixMatch = resolution.chosenSummary.match(/^\s*\[(\d+(?:\.\d+)?)[x×]\]/i);
  if (prefixMatch) {
    const parsed = Number.parseFloat(prefixMatch[1]);
    if (Number.isFinite(parsed) && parsed >= 1.5) {
      return parsed;
    }
  }
  const shutterTagMatch = `${resolution.chosenSummary} ${resolution.detail ?? ''}`.match(
    /(\d+(?:\.\d+)?)\s*[x×]\s*SHUTTER/i,
  );
  if (shutterTagMatch) {
    const parsed = Number.parseFloat(shutterTagMatch[1]);
    if (Number.isFinite(parsed) && parsed >= 1.5) {
      return parsed;
    }
  }
  if (
    typeof resolution.shutterSolvedAtCount === 'number' &&
    resolution.shutterSolvedAtCount >= 1 &&
    resolution.shutterSolvedAtCount <= 2 &&
    resolution.chipMultiplier >= 1.5
  ) {
    return resolution.chipMultiplier;
  }
  if (toyId === 'TOY_14_FOUR_SHUTTER_REEL' && resolution.chipMultiplier >= 1.5) {
    return resolution.chipMultiplier;
  }
  if (
    Math.abs(resolution.chipMultiplier - 1.6) < 0.02 ||
    (Boolean(clue.shutters) && resolution.chipMultiplier >= 1.59)
  ) {
    return resolution.chipMultiplier;
  }
  return null;
}

function detectEstimationToy(
  input: EvaluatePostAnswerFlavorInputV8,
  parsedDistanceKm: number | null,
): boolean {
  if (
    input.toyId === 'TOY_03_VERNIER_DIAL' ||
    input.toyId === 'TOY_10_CLIFFHANGERS_THROTTLE' ||
    input.toyId === 'TOY_05_RELIEF_GLOBE_3D'
  ) {
    return true;
  }
  if (parsedDistanceKm !== null) return true;
  if (/\(\d+\s+steps\s+off\)/i.test(input.resolution.chosenSummary)) return true;

  const cleaned = cleanChosenTextDisplay(input.resolution.chosenSummary);
  const matchesExactChoice = input.clue.choices.some((c) => c.trim() === cleaned);
  if (
    !matchesExactChoice &&
    input.resolution.accuracyRatio > 0 &&
    input.resolution.accuracyRatio < 1
  ) {
    return true;
  }
  return false;
}

type StampVectorIconIdV8 = 'SIREN' | 'BOLT' | 'TARGET' | 'DIAL' | 'STAR' | 'COINS' | 'BUZZER';

function renderStampVectorIconSvg(icon: StampVectorIconIdV8): string {
  switch (icon) {
    case 'SIREN':
      return `<svg class="wsv8-flavor-stamp-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4.5 12 V7.2 C4.5 4.9 6.1 3.5 8 3.5 C9.9 3.5 11.5 4.9 11.5 7.2 V12 Z" fill="#FFD166" stroke="currentColor" stroke-width="1.4"/><rect x="3" y="12" width="10" height="2.4" rx="1" fill="currentColor"/></svg>`;
    case 'BOLT':
      return `<svg class="wsv8-flavor-stamp-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9.2 1.5 L4 8.6 H8 L6.8 14.5 L12 7.4 H8 Z" fill="#FFD166" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>`;
    case 'TARGET':
      return `<svg class="wsv8-flavor-stamp-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="2.4" fill="#FFD166"/></svg>`;
    case 'DIAL':
      return `<svg class="wsv8-flavor-stamp-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 11.5 A6 6 0 0 1 13.5 11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="8" y1="11.5" x2="10.8" y2="5.6" stroke="#FFD166" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    case 'COINS':
      return `<svg class="wsv8-flavor-stamp-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><ellipse cx="8" cy="11.5" rx="5.5" ry="2.2" fill="#FFD166" stroke="currentColor" stroke-width="1.2"/><ellipse cx="8" cy="7.8" rx="5.5" ry="2.2" fill="#FFFDF7" stroke="currentColor" stroke-width="1.2"/></svg>`;
    case 'BUZZER':
      return `<svg class="wsv8-flavor-stamp-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="#E0533C" stroke="currentColor" stroke-width="1.3"/><path d="M5.6 5.6 L10.4 10.4 M10.4 5.6 L5.6 10.4" stroke="#FFFDF7" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    case 'STAR':
    default:
      return `<svg class="wsv8-flavor-stamp-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><polygon points="8,1.6 9.9,5.7 14.4,6.2 11,9.3 11.9,13.8 8,11.5 4.1,13.8 5,9.3 1.6,6.2 6.1,5.7" fill="#FFD166" stroke="currentColor" stroke-width="1.1"/></svg>`;
  }
}

function renderStampBadgeHtml(
  flavorKind: PostAnswerFlavorKindV8,
  primaryText: string,
  opts: { isCorrect?: boolean; icon?: StampVectorIconIdV8; secondaryPillText?: string } = {},
): string {
  ensureKlaxonReboundStylesV8();
  const correctAttr =
    typeof opts.isCorrect === 'boolean' ? ` data-correct="${opts.isCorrect ? 'true' : 'false'}"` : '';
  const iconHtml = opts.icon ? renderStampVectorIconSvg(opts.icon) : '';
  const mainBadge = `<span class="wsv8-flavor-stamp" data-flavor="${flavorKind}"${correctAttr}>${iconHtml}<span>${escapeHtml(primaryText)}</span></span>`;
  if (!opts.secondaryPillText) {
    return mainBadge;
  }
  return `<span class="wsv8-flavor-stamp-wrap">${mainBadge}<span class="wsv8-flavor-subpill">${escapeHtml(opts.secondaryPillText)}</span></span>`;
}

/**
 * Evaluates post-answer highlight stamps, Grant Bellamy / *YDKJ* comedy quips,
 * and pre-baked `StudioVoiceCueIdV8` triggers for every turn outcome.
 */
export function evaluatePostAnswerFlavorV8(
  input: EvaluatePostAnswerFlavorInputV8,
): PostAnswerFlavorEvaluationV8 {
  const { clue, resolution } = input;
  const isCorrect =
    typeof resolution.correct === 'boolean'
      ? resolution.correct
      : Boolean(resolution.isCorrect);
  const timeSec = Number.isFinite(input.responseTimeSec)
    ? Math.max(0.1, input.responseTimeSec)
    : 99;
  const scooped = Math.max(0, Math.round(input.reboundScoopedCash || 0));
  const streak = Math.max(0, Math.round(input.playerStreak || 0));
  const rivalClean = input.rivalName?.trim() || 'the Champion';
  const seed = Math.abs(Math.round(clue.qid || 0));

  const distanceKm = parseGlobeDistanceKm(resolution.chosenSummary, input.distanceKm);
  const isEstimation = detectEstimationToy(input, distanceKm);
  const shutterMult = isCorrect
    ? detectShutterEarlyMultiplier(resolution, clue, input.toyId)
    : null;
  const reboundSubPill = scooped > 0 ? `+$${scooped.toLocaleString()} REBOUND` : undefined;

  // 1. Estimation Near-Miss Rescue (<300 km Globe or 0.60..0.89 Dial/Throttle)
  if (
    isEstimation &&
    ((resolution.accuracyRatio >= 0.6 && resolution.accuracyRatio < 0.9) ||
      (distanceKm !== null && distanceKm > 120 && distanceKm < 300) ||
      (!isCorrect && distanceKm !== null && distanceKm < 300))
  ) {
    const stampLabel =
      distanceKm !== null
        ? `RAZOR-CLOSE NEAR-MISS (${Math.round(distanceKm)} KM)!`
        : 'RAZOR-CLOSE NEAR-MISS!';
    const quip = DIAL_NEAR_MISS_HOST_LINES_V8[seed % DIAL_NEAR_MISS_HOST_LINES_V8.length];
    return {
      flavorKind: 'DIAL_NEAR_MISS',
      stampBadgeHtml: renderStampBadgeHtml('DIAL_NEAR_MISS', stampLabel, {
        isCorrect: true,
        icon: 'DIAL',
        secondaryPillText: reboundSubPill,
      }),
      wittyHostLine: quip,
      suggestedVoiceCue: 'VO_DIAL_NEAR_MISS',
    };
  }

  // 2. Wrong / Miss Outcomes: Popular-Myth Klaxon OR 120-Line YDKJ Category Wit
  if (!isCorrect) {
    const wrongIdx = resolveWrongChoiceIndex(clue, resolution.chosenSummary, input.chosenChoiceIdx);
    const wrongChoiceText = wrongIdx >= 0 ? clue.choices[wrongIdx] : cleanChosenTextDisplay(resolution.chosenSummary);
    const trueChoiceText = resolution.trueAnswerDisplay || clue.choices[clue.answerIdx];

    if (resolution.triggeredKlaxon || clue.isKlaxonMyth) {
      const mythCue: StudioVoiceCueIdV8 = seed % 2 === 0 ? 'VO_MYTH_KLAXON_1' : 'VO_MYTH_KLAXON_2';
      return {
        flavorKind: 'MYTH_KLAXON',
        stampBadgeHtml: renderStampBadgeHtml('MYTH_KLAXON', 'POPULAR MYTH KLAXON!', {
          isCorrect: false,
          icon: 'SIREN',
          secondaryPillText: '+$100 REBOUND POT',
        }),
        wittyHostLine: pickKlaxonMisconceptionCallout(wrongChoiceText, trueChoiceText),
        suggestedVoiceCue: mythCue,
      };
    }

    const wrongVoiceCues: readonly StudioVoiceCueIdV8[] = [
      'VO_HOST_WRONG_1',
      'VO_HOST_WRONG_2',
      'VO_HOST_WRONG_3',
      'VO_HOST_WRONG_4',
    ];
    const suggestedWrongCue = wrongVoiceCues[seed % wrongVoiceCues.length];

    const isTimeout =
      !wrongChoiceText || /\b(time\s*expired|timeout|out\s*of\s*time|no\s*answer)\b/i.test(wrongChoiceText);

    const wittyLine =
      wrongIdx >= 0 && !isTimeout
        ? pickCategoryWrongQuip(clue.category, clue.choices[wrongIdx], rivalClean, seed)
        : !isTimeout && wrongChoiceText.length <= 56
          ? pickCategoryWrongQuip(clue.category, wrongChoiceText, rivalClean, seed)
          : CATEGORY_NON_CHOICE_MISS_QUIPS_V8[clue.category] ??
            CATEGORY_NON_CHOICE_MISS_QUIPS_V8.FALLACIES;

    const missStamp = resolution.fellForPoisonedFix
      ? 'RIGGED CANARY TRAP · +$100 TO REBOUND POT!'
      : isTimeout
        ? 'STUDIO CLOCK BUZZER · +$100 TO REBOUND POT!'
        : 'CURVEBALL TRAP · +$100 TO REBOUND POT!';

    return {
      flavorKind: 'STANDARD',
      stampBadgeHtml: renderStampBadgeHtml('STANDARD', missStamp, {
        isCorrect: false,
        icon: 'BUZZER',
      }),
      wittyHostLine: wittyLine,
      suggestedVoiceCue: suggestedWrongCue,
    };
  }

  // 3. Correct Showcase Highlights: 4-Shutter Early Genius & Dial/Globe Bullseye
  if (shutterMult !== null) {
    const multLabel = shutterMult >= 1.95 ? '2.0' : shutterMult >= 1.55 ? '1.6' : shutterMult.toFixed(1);
    const quipTemplate = SHUTTER_EARLY_HOST_LINES_V8[seed % SHUTTER_EARLY_HOST_LINES_V8.length];
    return {
      flavorKind: 'SHUTTER_EARLY_SOLVE',
      stampBadgeHtml: renderStampBadgeHtml(
        'SHUTTER_EARLY_SOLVE',
        `${multLabel}× EARLY-SHUTTER GENIUS!`,
        { isCorrect: true, icon: 'STAR', secondaryPillText: reboundSubPill },
      ),
      wittyHostLine: quipTemplate.replace(/\{MULT\}/g, multLabel),
      suggestedVoiceCue: 'VO_SHUTTER_EARLY_JACKPOT',
    };
  }

  if (
    isEstimation &&
    (resolution.accuracyRatio >= 0.9 || (distanceKm !== null && distanceKm <= 120))
  ) {
    const bullseyeLabel =
      distanceKm !== null
        ? `PINPOINT ESTIMATE (${Math.round(distanceKm)} KM)!`
        : 'PINPOINT ESTIMATE!';
    const quip = DIAL_BULLSEYE_HOST_LINES_V8[seed % DIAL_BULLSEYE_HOST_LINES_V8.length];
    return {
      flavorKind: 'DIAL_BULLSEYE',
      stampBadgeHtml: renderStampBadgeHtml('DIAL_BULLSEYE', bullseyeLabel, {
        isCorrect: true,
        icon: 'TARGET',
        secondaryPillText: reboundSubPill,
      }),
      wittyHostLine: quip,
      suggestedVoiceCue: 'VO_DIAL_BULLSEYE',
    };
  }

  // 4. Rebound Pot Scoop & Quick-Draw Buzzer Beater (<= 3.0s)
  const isQuickDraw = timeSec <= 3.0;

  if (scooped > 0) {
    const scoopTemplate = REBOUND_SCOOP_HOST_LINES_V8[seed % REBOUND_SCOOP_HOST_LINES_V8.length];
    return {
      flavorKind: 'REBOUND_SCOOP',
      stampBadgeHtml: renderStampBadgeHtml(
        'REBOUND_SCOOP',
        `SCOOPED +$${scooped.toLocaleString()} REBOUND POT!`,
        {
          isCorrect: true,
          icon: 'COINS',
          secondaryPillText: isQuickDraw ? `${timeSec.toFixed(1)}s QUICK-DRAW` : undefined,
        },
      ),
      wittyHostLine: scoopTemplate.replace(/\$\{POT\}|\{POT\}/g, scooped.toLocaleString()),
      suggestedVoiceCue: 'VO_REBOUND_POT_SCOOP',
    };
  }

  if (isQuickDraw) {
    const secLabel = timeSec.toFixed(1);
    const qdTemplate = QUICK_DRAW_HOST_LINES_V8[seed % QUICK_DRAW_HOST_LINES_V8.length];
    const qdCue: StudioVoiceCueIdV8 = seed % 2 === 0 ? 'VO_QUICK_DRAW_1' : 'VO_QUICK_DRAW_2';
    return {
      flavorKind: 'QUICK_DRAW',
      stampBadgeHtml: renderStampBadgeHtml(
        'QUICK_DRAW',
        `QUICK-DRAW BUZZER BEATER (${secLabel}s)!`,
        { isCorrect: true, icon: 'BOLT' },
      ),
      wittyHostLine: qdTemplate
        .replace(/\{SEC\}/g, secLabel)
        .replace(/\{RIVAL\}/g, rivalClean),
      suggestedVoiceCue: qdCue,
    };
  }

  // 5. Standard Correct (With 3+ & 5+ Hot-Streak Escalation)
  if (streak >= 5) {
    return {
      flavorKind: 'STANDARD',
      stampBadgeHtml: renderStampBadgeHtml(
        'STANDARD',
        `${streak}-IN-A-ROW UNSTOPPABLE HEATER!`,
        { isCorrect: true, icon: 'STAR' },
      ),
      wittyHostLine: `${streak} straight on the Tote Board! Somebody check the studio thermostat—${rivalClean} is running out of answers!`,
      suggestedVoiceCue: 'VO_STREAK_5_UNSTOPPABLE',
    };
  }

  if (streak >= 3) {
    return {
      flavorKind: 'STANDARD',
      stampBadgeHtml: renderStampBadgeHtml('STANDARD', `${streak}-CLUE HOT STREAK!`, {
        isCorrect: true,
        icon: 'STAR',
      }),
      wittyHostLine: `Three-alarm heater at the podium! ${streak} in a row and stacking Living Color cash!`,
      suggestedVoiceCue: streak === 3 ? 'VO_STREAK_3_HOT' : 'VO_HOST_RIGHT_2',
    };
  }

  const rightVoiceCues: readonly StudioVoiceCueIdV8[] = [
    'VO_HOST_RIGHT_1',
    'VO_HOST_RIGHT_2',
    'VO_HOST_RIGHT_3',
    'VO_HOST_RIGHT_4',
  ];
  const stdTemplate = STANDARD_RIGHT_HOST_LINES_V8[seed % STANDARD_RIGHT_HOST_LINES_V8.length];

  return {
    flavorKind: 'STANDARD',
    stampBadgeHtml: renderStampBadgeHtml('STANDARD', 'STUDIO DING · SPOT ON!', {
      isCorrect: true,
      icon: 'STAR',
    }),
    wittyHostLine: stdTemplate.replace(/\{RIVAL\}/g, rivalClean),
    suggestedVoiceCue: rightVoiceCues[seed % rightVoiceCues.length],
  };
}
