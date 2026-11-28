/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 — SWEEPS WEEK DELUXE)
// `src/v7/ui/CurtainCallBargainShowpieceV8.ts`
// Upgrade #6 — 1966–1969 "Sale of the Century" Sunlit Stage Turntable Desk
//  - Sunlit American Walnut (#6E3B23), Brushed Champagne Brass (#D9A441),
//    and Warm Broadcast Cream (#FAF2DF) Proscenium Stage Desk
//  - Parted Crimson & Gold Velvet Theater Curtains (#B8253E / #8C182C) +
//    Chasing #11 2700K Incandescent Marquee Bulbs
//  - Grant Bellamy Gouache Portrait (200% 200%, 0% 0% top-left grin quadrant)
//    + Brushed Champagne-Aluminum & Ivory Scoreboard Strip w/ Lead Gauge
//  - 3 Sunlit Warm Ivory (#FFFDF7) Beveled Acrylite Prize Turntable Placards:
//      1. Carnaby Cerise (#E6397A) — GOLD_PROP ($400 / $350)
//      2. Broadcast Cobalt/Teal (#008B94) — NEXT_TILE_2X ($300)
//      3. Harvest Gold (#E59A18) — FINAL_WAGER_SHIELD ($250)
//  - Zero dark-navy boxes, zero text inside prop SVGs, zero OS emojis!
// ============================================================================

import type {
  InstantBargainChoiceResultV8,
  InstantBargainItemV8,
  InstantBargainKindV8,
} from '../contracts_v7';
import {
  EMCEE_PORTRAIT_ASSET_V7,
  RELIC_CATALOG_V7,
} from '../campaign/CastAndRelicsCatalogV7';
import {
  getAtlasSpriteEntryV9,
  loadAtlasManifestV9,
} from '../../v9/ShowroomAndCatalogsV9';

export interface CurtainCallBargainShowpieceOptsV8 {
  playerCash: number;
  rivalCash: number;
  rivalName: string;
  turnNumber: number;
  isCampaign: boolean;
  isCouch2P?: boolean;
  activePlayerName?: string;
  candidateRelic?: { relicId: string; name: string; summary: string };
  overrideItems?: readonly [InstantBargainItemV8, InstantBargainItemV8, InstantBargainItemV8];
  reducedMotion?: boolean;
  onBellSfx?: () => void;
  onBuySfx?: (item: InstantBargainItemV8) => void;
  onNoSaleSfx?: () => void;
}

interface StrategicLeadPreviewV8 {
  readonly tone: 'safe' | 'tie' | 'danger' | 'locked';
  readonly iconKind: 'check' | 'tie' | 'warn' | 'lock';
  readonly pedestalLabel: string;
  readonly headerLabel: string;
  readonly youRatioPct: number;
  readonly isDangerBar: boolean;
}

const CURTAIN_BARGAIN_STYLE_ID_V8 = 'wsv8-curtain-bargain-sunlit-styles';

const CURTAIN_BARGAIN_CSS_V8 = `
html body .wsv8-ccb-overlay,
html body .wsv8-ccb-overlay * {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html body .wsv8-ccb-overlay {
  --ccb-walnut: #6E3B23;
  --ccb-walnut-deep: #4A2412;
  --ccb-walnut-warm: #874B2D;
  --ccb-brass: #D9A441;
  --ccb-brass-bright: #F6D379;
  --ccb-brass-deep: #8F6014;
  --ccb-cream-stage: #FAF2DF;
  --ccb-cream-warm: #F2E4C6;
  --ccb-ivory: #FFFDF7;
  --ccb-champagne: #EBE0C8;
  --ccb-curtain-crimson: #B8253E;
  --ccb-curtain-deep: #8C182C;
  --ccb-cerise: #E6397A;
  --ccb-cerise-deep: #B51E58;
  --ccb-peacock: #008B94;
  --ccb-peacock-deep: #00666E;
  --ccb-cobalt: #1746A2;
  --ccb-gold: #E59A18;
  --ccb-gold-bright: #FFD166;
  --ccb-gold-deep: #A66806;
  --ccb-tangerine: #FF6B35;
  --ccb-tangerine-deep: #C84012;
  --ccb-emerald: #138A4B;
  --ccb-emerald-soft: #E3F7EC;
  --ccb-ink: #141B29;
  --ccb-ink-soft: #364154;

  --ccb-font-show: 'Caprasimo', Georgia, serif;
  --ccb-font-broadcast: 'Jost', 'League Spartan', 'Plus Jakarta Sans', sans-serif;
  --ccb-font-solari: 'Michroma', 'Chakra Petch', 'Jost', sans-serif;
  --ccb-font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;

  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  z-index: 95;
  pointer-events: auto;
  user-select: none;
  font-family: var(--ccb-font-body);
  font-size: 14px;
  color: var(--ccb-ink);
  font-variant-numeric: tabular-nums;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding:
    max(8px, env(safe-area-inset-top, 0px))
    max(10px, env(safe-area-inset-right, 0px))
    max(10px, env(safe-area-inset-bottom, 0px))
    max(10px, env(safe-area-inset-left, 0px));
  background:
    radial-gradient(ellipse 88% 68% at 50% 34%, rgba(255, 241, 204, 0.56) 0%, rgba(128, 70, 38, 0.76) 58%, rgba(62, 30, 16, 0.90) 100%);
  backdrop-filter: blur(5px);
  animation: wsv8-ccb-stage-in 0.26s cubic-bezier(0.22, 1, 0.36, 1) both;
}

html body .wsv8-ccb-overlay::before,
html body .wsv8-ccb-overlay::after {
  content: '';
  position: fixed;
  top: -10%;
  width: 60vw;
  height: 114dvh;
  pointer-events: none;
  z-index: 0;
  transform-origin: 50% 0%;
}

html body .wsv8-ccb-overlay::before {
  left: -6%;
  background: conic-gradient(
    from 154deg at 50% 0%,
    transparent 0deg,
    rgba(255, 219, 128, 0.30) 14deg,
    rgba(250, 242, 223, 0.16) 22deg,
    transparent 36deg
  );
  animation: wsv8-ccb-spot-left 4.8s ease-in-out infinite alternate;
}

html body .wsv8-ccb-overlay::after {
  right: -6%;
  background: conic-gradient(
    from 172deg at 50% 0%,
    transparent 0deg,
    rgba(255, 198, 110, 0.26) 14deg,
    rgba(230, 57, 122, 0.12) 22deg,
    transparent 36deg
  );
  animation: wsv8-ccb-spot-right 5.2s ease-in-out infinite alternate;
}

html body .wsv8-ccb-overlay[data-exiting='true'] {
  animation: wsv8-ccb-stage-out 0.16s ease-in forwards;
}

/* 1. Sunlit American Walnut, Brushed Brass & Warm Broadcast Cream Stage Desk */
html body .wsv8-ccb-proscenium {
  position: relative;
  z-index: 2;
  width: min(1080px, 100%);
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.25dvh, 13px);
  padding: clamp(12px, 1.6dvh, 18px) clamp(14px, 2vw, 24px) clamp(12px, 1.5dvh, 18px);
  border-radius: 26px 26px 20px 20px;
  background:
    radial-gradient(ellipse 85% 50% at 50% 0%, rgba(255, 253, 247, 0.92) 0%, transparent 68%),
    linear-gradient(180deg, #FAF2DF 0%, #F5E9CE 62%, #EDE0C2 100%);
  border: 4px solid var(--ccb-brass);
  box-shadow:
    inset 0 2px 0 #FFFDF7,
    inset 0 -3px 0 rgba(217, 164, 65, 0.45),
    0 0 0 6px var(--ccb-walnut),
    0 8px 0 var(--ccb-walnut-deep),
    0 22px 48px rgba(48, 22, 10, 0.52);
  overflow: hidden;
}

/* Parted Crimson & Gold Velvet Theater Curtains (1966 Gouache Stage Backdrop Crop) */
html body .wsv8-ccb-curtain-drape {
  position: absolute;
  top: 0;
  width: clamp(90px, 13vw, 152px);
  height: clamp(64px, 9.5dvh, 102px);
  pointer-events: none;
  z-index: 3;
  background-color: #B8253E;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: left top;
  border-bottom: 3px solid #D9A441;
  box-shadow:
    inset 0 0 18px rgba(74, 16, 28, 0.36),
    0 5px 12px rgba(74, 36, 18, 0.28);
  clip-path: polygon(0 0, 100% 0, 74% 48%, 38% 78%, 12% 100%, 0 100%);
  filter: drop-shadow(0 4px 8px rgba(74, 36, 18, 0.26));
}

html body .wsv8-ccb-curtain-drape--left {
  left: 0;
  border-bottom-right-radius: 90%;
}

html body .wsv8-ccb-curtain-drape--right {
  right: 0;
  border-bottom-right-radius: 90%;
  transform: scaleX(-1);
}

html body .wsv8-ccb-bulbs-svg {
  position: relative;
  z-index: 4;
  width: min(760px, 84%);
  height: 22px;
  align-self: center;
  display: block;
  margin-top: -4px;
  margin-bottom: -4px;
  pointer-events: none;
  overflow: visible;
}

html body .wsv8-ccb-bulb-core {
  animation: wsv8-ccb-bulb-chase 0.9s steps(1, end) infinite;
}

html body .wsv8-ccb-bulb-halo {
  animation: wsv8-ccb-halo-chase 0.9s steps(1, end) infinite;
}

html body .wsv8-ccb-c0 { animation-delay: 0s; }
html body .wsv8-ccb-c1 { animation-delay: 0.3s; }
html body .wsv8-ccb-c2 { animation-delay: 0.6s; }

/* 2. Header Banner, Grant Bellamy 0% 0% Portrait & Champagne-Ivory Scoreboard */
html body .wsv8-ccb-header-deck {
  position: relative;
  z-index: 4;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

html body .wsv8-ccb-host-cluster {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 6px 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #FFFDF7 0%, #F9EBD0 100%);
  border: 2px solid var(--ccb-brass);
  box-shadow:
    inset 0 1px 0 #FFFFFF,
    0 3px 10px rgba(110, 59, 35, 0.12);
}

html body .wsv8-ccb-emcee-medallion {
  position: relative;
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #FAF2DF;
  border: 3px solid var(--ccb-brass);
  box-shadow:
    0 0 0 3px var(--ccb-walnut),
    0 5px 12px rgba(74, 36, 18, 0.28);
  overflow: hidden;
}

html body .wsv8-ccb-emcee-portrait {
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  background-size: 200% 200%;
  background-position: 0% 0%;
}

html body .wsv8-ccb-title-block {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

html body .wsv8-ccb-kicker-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

html body .wsv8-ccb-kicker-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 11px;
  border-radius: 999px;
  background: linear-gradient(95deg, #E59A18 0%, #E6397A 100%);
  color: #FFFDF7;
  font-family: var(--ccb-font-broadcast);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  box-shadow: 0 2px 5px rgba(110, 59, 35, 0.22);
}

html body .wsv8-ccb-headline-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

html body .wsv8-ccb-bell-svg {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  transform-origin: 50% 10%;
  animation: wsv8-ccb-bell-swing 0.62s ease-in-out 3;
  filter: drop-shadow(0 2px 4px rgba(143, 96, 20, 0.35));
}

html body .wsv8-ccb-headline {
  margin: 0;
  font-family: var(--ccb-font-show);
  font-size: clamp(20px, 2.5vw, 29px);
  font-weight: 400;
  line-height: 1.06;
  letter-spacing: 0.01em;
  color: var(--ccb-walnut-deep);
  text-shadow:
    0 1px 0 #FFFDF7,
    0 2px 0 rgba(217, 164, 65, 0.55);
}

html body .wsv8-ccb-pitch-quote {
  margin: 1px 0 0;
  font-family: var(--ccb-font-body);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.32;
  color: var(--ccb-ink-soft);
}

/* Brushed Champagne-Aluminum & Ivory Scoreboard Strip */
html body .wsv8-ccb-scoreboard-bar {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 7px 12px;
  border-radius: 14px;
  background:
    linear-gradient(180deg, #FBF6E9 0%, #EAE0C8 52%, #DFD2B5 100%);
  border: 2px solid var(--ccb-brass);
  box-shadow:
    inset 0 1px 0 #FFFFFF,
    0 3px 8px rgba(110, 59, 35, 0.14);
}

html body .wsv8-ccb-flap-pair {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

html body .wsv8-ccb-flap-drum {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  padding: 4px 11px;
  border-radius: 9px;
  background: var(--ccb-ivory);
  border: 2px solid var(--ccb-brass);
  box-shadow:
    inset 0 1px 0 #FFFFFF,
    0 2px 0 rgba(110, 59, 35, 0.16);
}

html body .wsv8-ccb-flap-drum[data-side='you'] {
  border-color: var(--ccb-peacock);
  border-left-width: 5px;
}

html body .wsv8-ccb-flap-drum[data-side='rival'] {
  border-color: var(--ccb-tangerine);
  border-left-width: 5px;
}

html body .wsv8-ccb-flap-label {
  font-family: var(--ccb-font-broadcast);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ccb-ink-soft);
}

html body .wsv8-ccb-flap-cash {
  font-family: var(--ccb-font-solari);
  font-size: clamp(14px, 1.45vw, 17px);
  font-weight: 700;
  color: var(--ccb-ink);
  letter-spacing: 0.02em;
}

html body .wsv8-ccb-flap-drum[data-side='you'] .wsv8-ccb-flap-cash {
  color: var(--ccb-peacock-deep);
}

html body .wsv8-ccb-flap-drum[data-side='rival'] .wsv8-ccb-flap-cash {
  color: var(--ccb-tangerine-deep);
}

html body .wsv8-ccb-vs-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--ccb-walnut);
  color: var(--ccb-cream-stage);
  font-family: var(--ccb-font-broadcast);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.06em;
}

html body .wsv8-ccb-lead-meter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 240px;
  justify-content: flex-end;
}

html body .wsv8-ccb-tug-track {
  position: relative;
  flex: 1 1 100px;
  max-width: 170px;
  height: 12px;
  border-radius: 999px;
  background: #F5DEC9;
  border: 1.5px solid var(--ccb-brass-deep);
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(74, 36, 18, 0.22);
}

html body .wsv8-ccb-tug-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--ccb-peacock) 0%, var(--ccb-emerald) 100%);
  transition: width 0.22s cubic-bezier(0.22, 1, 0.36, 1), background 0.22s ease;
}

html body .wsv8-ccb-tug-fill[data-danger='true'] {
  background: linear-gradient(90deg, var(--ccb-tangerine) 0%, var(--ccb-cerise) 100%);
}

html body .wsv8-ccb-tug-midline {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: var(--ccb-walnut-deep);
}

html body .wsv8-ccb-lead-status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  font-family: var(--ccb-font-broadcast);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(--ccb-emerald-soft);
  border: 2px solid var(--ccb-emerald);
  color: #0B5D31;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

html body .wsv8-ccb-lead-status-pill[data-tone='tie'] {
  background: #FFF2C6;
  border-color: var(--ccb-gold);
  color: #7A4800;
}

html body .wsv8-ccb-lead-status-pill[data-tone='danger'] {
  background: #FFE3EE;
  border-color: var(--ccb-cerise);
  color: #8F1042;
}

html body .wsv8-ccb-lead-status-pill[data-previewing='true'] {
  transform: scale(1.02);
}

/* 3. Three Sunlit Warm Ivory (#FFFDF7) Beveled Acrylite Prize Turntable Placards */
html body .wsv8-ccb-pedestals-grid {
  position: relative;
  z-index: 4;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(10px, 1.4vw, 16px);
  align-items: stretch;
}

html body .wsv8-ccb-pedestal {
  --ped-ribbon-bg: linear-gradient(135deg, #E6397A 0%, #B81D58 100%);
  --ped-ribbon-border: #9E1448;
  --ped-velvet-hi: #D4286A;
  --ped-velvet-lo: #7D123B;
  --ped-alcove-hi: #FFFDF7;
  --ped-alcove-mid: #FDECC8;
  --ped-alcove-rim: #F3D9A4;

  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
  border-radius: 18px;
  background: linear-gradient(180deg, #FFFDF7 0%, #FAF1DC 100%);
  border: 2.5px solid var(--ccb-brass);
  box-shadow:
    inset 0 2px 0 #FFFFFF,
    0 5px 0 var(--ccb-walnut),
    0 12px 24px rgba(74, 36, 18, 0.22);
  transition:
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  overflow: hidden;
}

/* Card 1 = Carnaby Cerise (#E6397A) */
html body .wsv8-ccb-pedestal[data-pedestal-idx='0'],
html body .wsv8-ccb-pedestal[data-kind='GOLD_PROP'] {
  --ped-ribbon-bg: linear-gradient(135deg, #E6397A 0%, #C2205E 100%);
  --ped-ribbon-border: #991347;
  --ped-velvet-hi: #E6397A;
  --ped-velvet-lo: #8C1843;
  --ped-alcove-mid: #FDE9EE;
  --ped-alcove-rim: #F7D4BE;
}

/* Card 2 = Broadcast Cobalt / Peacock Teal (#008B94) */
html body .wsv8-ccb-pedestal[data-pedestal-idx='1'],
html body .wsv8-ccb-pedestal[data-kind='NEXT_TILE_2X'] {
  --ped-ribbon-bg: linear-gradient(135deg, #008B94 0%, #1746A2 100%);
  --ped-ribbon-border: #0F357A;
  --ped-velvet-hi: #0099A4;
  --ped-velvet-lo: #12408A;
  --ped-alcove-mid: #E8F8F7;
  --ped-alcove-rim: #D7ECF2;
}

/* Card 3 = Harvest Gold (#E59A18) */
html body .wsv8-ccb-pedestal[data-pedestal-idx='2'],
html body .wsv8-ccb-pedestal[data-kind='FINAL_WAGER_SHIELD'] {
  --ped-ribbon-bg: linear-gradient(135deg, #E59A18 0%, #C27808 100%);
  --ped-ribbon-border: #8F5604;
  --ped-velvet-hi: #E59A18;
  --ped-velvet-lo: #9A5E06;
  --ped-alcove-mid: #FFF3CF;
  --ped-alcove-rim: #F5DFA6;
}

html body .wsv8-ccb-pedestal[data-affordable='true']:hover,
html body .wsv8-ccb-pedestal[data-affordable='true']:focus-within {
  transform: translateY(-4px);
  border-color: var(--ccb-tangerine);
  box-shadow:
    inset 0 2px 0 #FFFFFF,
    0 8px 0 var(--ccb-walnut),
    0 0 0 2px rgba(255, 107, 53, 0.35),
    0 18px 30px rgba(74, 36, 18, 0.30);
}

html body .wsv8-ccb-pedestal[data-affordable='false'] {
  background: linear-gradient(180deg, #F8F2E4 0%, #EDE2CA 100%);
  border-color: #C7B28A;
}

/* Vibrant Color Top Header Ribbon */
html body .wsv8-ccb-ped-top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 11px;
  background: var(--ped-ribbon-bg);
  border-bottom: 2px solid var(--ccb-brass);
  color: #FFFDF7;
}

html body .wsv8-ccb-hangtag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #FFFDF7;
  font-family: var(--ccb-font-broadcast);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.15;
  text-shadow: 0 1px 2px rgba(20, 27, 41, 0.35);
}

html body .wsv8-ccb-price-tag {
  flex: 0 0 auto;
  padding: 3px 9px;
  border-radius: 999px;
  background: #FFFDF7;
  border: 1.5px solid var(--ccb-brass);
  color: var(--ccb-ink);
  font-family: var(--ccb-font-solari);
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 2px 4px rgba(20, 27, 41, 0.18);
}

html body .wsv8-ccb-ped-body {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 10px 11px 8px;
  flex: 1 1 auto;
}

/* Sunlit Cream-Gold Radial Spotlight Showcase Alcove (ZERO Dark Navy!) */
html body .wsv8-ccb-turntable-stage {
  position: relative;
  width: 100%;
  height: 104px;
  border-radius: 13px;
  background:
    radial-gradient(ellipse 74% 68% at 50% 38%, var(--ped-alcove-hi) 0%, var(--ped-alcove-mid) 62%, var(--ped-alcove-rim) 100%);
  border: 1.5px solid rgba(217, 164, 65, 0.68);
  box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 11px;
  overflow: hidden;
}

html body .wsv8-ccb-showcase-sprite {
  position: relative;
  z-index: 3;
  width: 78px;
  height: 78px;
  border-radius: 16px;
  border: 2.5px solid var(--ccb-brass);
  background-color: #FAF2DF;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  display: block;
  box-shadow:
    inset 0 1.5px 0 rgba(255, 253, 247, 0.9),
    0 6px 12px rgba(110, 59, 35, 0.26);
  animation: wsv8-ccb-prop-hover 2.8s ease-in-out infinite;
}

html body .wsv8-ccb-velvet-plinth {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: min(148px, 82%);
  height: 24px;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at 50% 36%, var(--ped-velvet-hi) 0%, var(--ped-velvet-lo) 84%);
  border: 2.5px solid var(--ccb-brass-bright);
  box-shadow:
    0 4px 0 var(--ccb-brass-deep),
    0 6px 10px rgba(74, 36, 18, 0.28);
  z-index: 1;
  overflow: hidden;
}

html body .wsv8-ccb-velvet-plinth::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  border: 1.5px dashed rgba(255, 253, 247, 0.72);
  animation: wsv8-ccb-platter-spin 12s linear infinite;
}

html body .wsv8-ccb-copy-plaque {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1 1 auto;
}

html body .wsv8-ccb-item-title {
  margin: 0;
  font-family: var(--ccb-font-broadcast);
  font-size: clamp(15px, 1.4vw, 17.5px);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--ccb-ink);
}

html body .wsv8-ccb-item-sub {
  margin: 0;
  font-family: var(--ccb-font-body);
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.32;
  color: var(--ccb-ink-soft);
}

html body .wsv8-ccb-sweat-pill {
  margin-top: auto;
  padding: 5px 8px;
  border-radius: 8px;
  font-family: var(--ccb-font-broadcast);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-align: center;
  line-height: 1.16;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

html body .wsv8-ccb-sweat-icon {
  width: 15px;
  height: 15px;
  flex: 0 0 15px;
}

html body .wsv8-ccb-sweat-pill[data-sweat='safe'] {
  background: #E2F7EC;
  color: #0B5D31;
  border: 1.5px solid #189853;
}

html body .wsv8-ccb-sweat-pill[data-sweat='tie'] {
  background: #FFF1C4;
  color: #7A4700;
  border: 1.5px solid #DE9410;
}

html body .wsv8-ccb-sweat-pill[data-sweat='danger'] {
  background: #FFE2EE;
  color: #8F1042;
  border: 1.5px solid var(--ccb-cerise);
}

html body .wsv8-ccb-sweat-pill[data-sweat='locked'] {
  background: #EFE6D2;
  color: #5C4728;
  border: 1.5px solid #B89B6C;
}

/* Tactile Atomic Tangerine (#FF6B35) Purchase Button */
html body .wsv8-ccb-ped-cta-wrap {
  padding: 0 11px 11px;
}

html body .wsv8-ccb-buy-btn {
  position: relative;
  z-index: 2;
  appearance: none;
  width: 100%;
  min-height: 50px;
  padding: 7px 10px;
  border-radius: 12px;
  border: 2px solid #FFFDF7;
  background: linear-gradient(180deg, #FF7E4D 0%, var(--ccb-tangerine) 52%, var(--ccb-tangerine-deep) 100%);
  color: #FFFDF7;
  font-family: var(--ccb-font-broadcast);
  cursor: pointer;
  touch-action: manipulation;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  box-shadow:
    0 4px 0 #8C2706,
    0 6px 14px rgba(110, 59, 35, 0.25);
  transition: transform 0.14s ease, filter 0.14s ease;
}

html body .wsv8-ccb-buy-btn:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

html body .wsv8-ccb-buy-btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #8C2706;
}

html body .wsv8-ccb-buy-btn:focus-visible,
html body .wsv8-ccb-nosale-btn:focus-visible {
  outline: 3px solid var(--ccb-walnut);
  outline-offset: 2px;
}

html body .wsv8-ccb-buy-main {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14.5px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.12;
}

html body .wsv8-ccb-buy-sub {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #FFF3CC;
  line-height: 1.1;
}

html body .wsv8-ccb-buy-btn:disabled {
  cursor: not-allowed;
  border-color: #C7B28A;
  background: linear-gradient(180deg, #E5DAC2 0%, #D2C2A2 100%);
  color: #5C4728;
  box-shadow: inset 0 1px 0 #FFFDF7, 0 3px 0 #A38D68;
}

/* 4. "SOLD!" Stamp & Gold Confetti */
html body .wsv8-ccb-sold-stamp {
  position: absolute;
  top: 44%;
  left: 50%;
  z-index: 12;
  transform: translate(-50%, -50%) rotate(-12deg) scale(2.2);
  padding: 7px 20px;
  border-radius: 10px;
  border: 4px solid var(--ccb-gold-bright);
  background: linear-gradient(135deg, #E6397A 0%, #C91E2A 100%);
  color: #FFFDF7;
  font-family: var(--ccb-font-show);
  font-size: 28px;
  letter-spacing: 0.06em;
  text-shadow: 0 2px 0 #6E1024;
  box-shadow:
    0 0 0 3px var(--ccb-walnut),
    0 10px 24px rgba(74, 36, 18, 0.45);
  opacity: 0;
  pointer-events: none;
}

html body .wsv8-ccb-pedestal[data-sold='true'] {
  border-color: var(--ccb-gold);
  box-shadow:
    0 0 0 3px var(--ccb-gold-bright),
    0 12px 28px rgba(143, 96, 20, 0.38);
}

html body .wsv8-ccb-pedestal[data-sold='true'] .wsv8-ccb-sold-stamp {
  animation: wsv8-ccb-stamp-slam 0.42s cubic-bezier(0.18, 1.35, 0.32, 1) forwards;
}

html body .wsv8-ccb-confetti-burst {
  position: absolute;
  inset: 0;
  z-index: 11;
  pointer-events: none;
  overflow: hidden;
  opacity: 0;
}

html body .wsv8-ccb-pedestal[data-sold='true'] .wsv8-ccb-confetti-burst {
  opacity: 1;
}

html body .wsv8-ccb-confetti-piece {
  position: absolute;
  left: 50%;
  top: 45%;
  width: 9px;
  height: 9px;
  border-radius: 2px;
  background: var(--conf-bg, #FFD166);
}

html body .wsv8-ccb-pedestal[data-sold='true'] .wsv8-ccb-confetti-piece {
  animation: wsv8-ccb-confetti-fly 0.45s cubic-bezier(0.16, 0.9, 0.3, 1) forwards;
}

/* 5. Full-Width Peacock Teal (#008B94) & Brushed Brass Decline Bar */
html body .wsv8-ccb-footer {
  position: relative;
  z-index: 4;
  width: 100%;
  display: flex;
  justify-content: center;
}

html body .wsv8-ccb-nosale-btn {
  appearance: none;
  width: 100%;
  min-height: 52px;
  padding: 10px 18px;
  border-radius: 14px;
  border: 2.5px solid var(--ccb-brass-bright);
  background: linear-gradient(180deg, #009EA8 0%, var(--ccb-peacock) 54%, var(--ccb-peacock-deep) 100%);
  color: #FFFDF7;
  font-family: var(--ccb-font-broadcast);
  font-size: clamp(14.5px, 1.65vw, 18px);
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  touch-action: manipulation;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  box-shadow:
    inset 0 2px 0 rgba(255, 253, 247, 0.45),
    0 5px 0 #004950,
    0 10px 20px rgba(74, 36, 18, 0.24);
  transition: transform 0.14s ease, filter 0.14s ease;
}

html body .wsv8-ccb-nosale-btn:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

html body .wsv8-ccb-nosale-btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #004950;
}

/* 6. Mobile Portrait (390x660 / 390x844) */
@media (max-width: 760px) and (min-height: 521px) {
  html body .wsv8-ccb-overlay {
    padding:
      max(5px, env(safe-area-inset-top, 0px))
      max(7px, env(safe-area-inset-right, 0px))
      max(6px, env(safe-area-inset-bottom, 0px))
      max(7px, env(safe-area-inset-left, 0px));
  }

  html body .wsv8-ccb-proscenium {
    padding: 8px 9px 9px;
    gap: 5px;
    border-radius: 18px;
    border-width: 3px;
    box-shadow:
      inset 0 1px 0 #FFFDF7,
      0 0 0 4px var(--ccb-walnut),
      0 12px 28px rgba(48, 22, 10, 0.48);
  }

  html body .wsv8-ccb-curtain-drape {
    width: 58px;
    height: 46px;
  }

  html body .wsv8-ccb-bulbs-svg {
    height: 14px;
    margin-top: -2px;
    margin-bottom: -2px;
  }

  html body .wsv8-ccb-header-deck {
    gap: 5px;
  }

  html body .wsv8-ccb-host-cluster {
    padding: 4px 8px;
    gap: 8px;
  }

  html body .wsv8-ccb-emcee-medallion {
    width: 42px;
    height: 42px;
    border-width: 2px;
  }

  html body .wsv8-ccb-kicker-row,
  html body .wsv8-ccb-pitch-quote,
  html body .wsv8-ccb-tug-track {
    display: none;
  }

  html body .wsv8-ccb-bell-svg {
    width: 20px;
    height: 20px;
  }

  html body .wsv8-ccb-headline {
    font-size: 16.5px;
    line-height: 1.06;
  }

  html body .wsv8-ccb-scoreboard-bar {
    padding: 4px 8px;
    gap: 4px 6px;
    border-radius: 10px;
  }

  html body .wsv8-ccb-flap-pair {
    gap: 5px;
  }

  html body .wsv8-ccb-flap-drum {
    padding: 2px 7px;
    gap: 4px;
  }

  html body .wsv8-ccb-flap-cash {
    font-size: 13.5px;
  }

  html body .wsv8-ccb-lead-meter-group {
    flex: 1 1 auto;
  }

  html body .wsv8-ccb-lead-status-pill {
    padding: 2px 8px;
    font-size: 13px;
  }

  html body .wsv8-ccb-pedestals-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  html body .wsv8-ccb-pedestal {
    border-radius: 13px;
    box-shadow: 0 3px 0 var(--ccb-walnut);
    display: grid;
    grid-template-columns: minmax(0, 1fr) 124px;
    grid-template-rows: auto auto;
    align-items: center;
  }

  html body .wsv8-ccb-ped-top {
    grid-column: 1 / -1;
    padding: 4px 8px;
  }

  html body .wsv8-ccb-hangtag,
  html body .wsv8-ccb-price-tag {
    font-size: 13px;
  }

  html body .wsv8-ccb-ped-body {
    grid-column: 1 / 2;
    padding: 5px 7px;
    flex-direction: row;
    align-items: center;
    gap: 7px;
  }

  html body .wsv8-ccb-turntable-stage {
    flex: 0 0 48px;
    width: 48px;
    height: 52px;
    padding-bottom: 5px;
  }

  html body .wsv8-ccb-showcase-sprite {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border-width: 1.8px;
  }

  html body .wsv8-ccb-velvet-plinth {
    width: 42px;
    height: 11px;
    bottom: 2px;
  }

  html body .wsv8-ccb-copy-plaque {
    gap: 2px;
  }

  html body .wsv8-ccb-item-title {
    font-size: 13.5px;
    line-height: 1.1;
  }

  html body .wsv8-ccb-item-sub {
    font-size: 13px;
    line-height: 1.15;
  }

  html body .wsv8-ccb-sweat-pill {
    font-size: 13px;
    padding: 2px 6px;
    line-height: 1.1;
  }

  html body .wsv8-ccb-ped-cta-wrap {
    grid-column: 2 / 3;
    padding: 5px 7px 5px 0;
    height: 100%;
    display: flex;
    align-items: center;
  }

  html body .wsv8-ccb-buy-btn {
    min-height: 50px;
    height: 100%;
    padding: 5px 6px;
    border-radius: 10px;
  }

  html body .wsv8-ccb-buy-main {
    font-size: 13px;
    text-align: center;
  }

  html body .wsv8-ccb-buy-sub {
    font-size: 13px;
  }

  html body .wsv8-ccb-nosale-btn {
    min-height: 50px;
    padding: 7px 10px;
    font-size: 14px;
    box-shadow: 0 3px 0 #004950;
  }
}

/* 7. Compact Mobile Landscape (844x390) */
@media (max-height: 520px) {
  html body .wsv8-ccb-overlay {
    padding:
      max(4px, env(safe-area-inset-top, 0px))
      max(8px, env(safe-area-inset-right, 0px))
      max(4px, env(safe-area-inset-bottom, 0px))
      max(8px, env(safe-area-inset-left, 0px));
  }

  html body .wsv8-ccb-proscenium {
    padding: 6px 10px 7px;
    gap: 5px;
    border-radius: 16px;
    border-width: 2.5px;
    box-shadow:
      inset 0 1px 0 #FFFDF7,
      0 0 0 3px var(--ccb-walnut),
      0 10px 24px rgba(48, 22, 10, 0.45);
  }

  html body .wsv8-ccb-curtain-drape,
  html body .wsv8-ccb-bulbs-svg,
  html body .wsv8-ccb-pitch-quote,
  html body .wsv8-ccb-kicker-row,
  html body .wsv8-ccb-tug-track,
  html body .wsv8-ccb-price-tag {
    display: none;
  }

  html body .wsv8-ccb-header-deck {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  html body .wsv8-ccb-host-cluster {
    flex: 0 1 auto;
    padding: 3px 8px;
    gap: 7px;
  }

  html body .wsv8-ccb-emcee-medallion {
    width: 34px;
    height: 34px;
    border-width: 2px;
  }

  html body .wsv8-ccb-bell-svg {
    width: 18px;
    height: 18px;
  }

  html body .wsv8-ccb-headline {
    font-size: 15.5px;
    line-height: 1.05;
  }

  html body .wsv8-ccb-scoreboard-bar {
    width: auto;
    flex: 1 1 auto;
    justify-content: flex-end;
    padding: 3px 8px;
    gap: 5px 8px;
    border-radius: 9px;
  }

  html body .wsv8-ccb-flap-drum {
    padding: 2px 6px;
    gap: 4px;
  }

  html body .wsv8-ccb-flap-label,
  html body .wsv8-ccb-vs-badge,
  html body .wsv8-ccb-flap-cash {
    font-size: 13px;
  }

  html body .wsv8-ccb-lead-meter-group {
    flex: 0 1 auto;
  }

  html body .wsv8-ccb-lead-status-pill {
    padding: 2px 7px;
    font-size: 13px;
  }

  html body .wsv8-ccb-pedestals-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  html body .wsv8-ccb-pedestal {
    border-radius: 11px;
    box-shadow: 0 2px 0 var(--ccb-walnut);
  }

  html body .wsv8-ccb-ped-top {
    padding: 3px 6px;
  }

  html body .wsv8-ccb-hangtag {
    width: 100%;
    justify-content: center;
    font-size: 13px;
  }

  html body .wsv8-ccb-ped-body {
    padding: 5px 6px 4px;
    flex-direction: row;
    align-items: center;
    gap: 5px;
  }

  html body .wsv8-ccb-turntable-stage {
    flex: 0 0 40px;
    width: 40px;
    height: 46px;
    padding-bottom: 4px;
  }

  html body .wsv8-ccb-showcase-sprite {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    border-width: 1.5px;
  }

  html body .wsv8-ccb-velvet-plinth {
    width: 36px;
    height: 10px;
  }

  html body .wsv8-ccb-copy-plaque {
    gap: 2px;
  }

  html body .wsv8-ccb-item-title {
    font-size: 13.5px;
    line-height: 1.1;
  }

  html body .wsv8-ccb-item-sub {
    font-size: 13px;
    line-height: 1.13;
  }

  html body .wsv8-ccb-sweat-pill {
    font-size: 13px;
    padding: 2px 4px;
    line-height: 1.1;
  }

  html body .wsv8-ccb-ped-cta-wrap {
    padding: 0 6px 6px;
  }

  html body .wsv8-ccb-buy-btn {
    min-height: 48px;
    padding: 4px 6px;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 2px 6px;
    box-shadow: 0 2px 0 #8C2706;
  }

  html body .wsv8-ccb-buy-main,
  html body .wsv8-ccb-buy-sub {
    font-size: 13px;
  }

  html body .wsv8-ccb-nosale-btn {
    min-height: 48px;
    padding: 6px 12px;
    font-size: 14px;
    box-shadow: 0 2px 0 #004950;
  }
}

/* 8. Reduced Motion & Keyframes */
html body .wsv8-ccb-overlay[data-reduced-motion='true'],
html body .wsv8-ccb-overlay[data-reduced-motion='true'] *,
html body .wsv8-ccb-overlay[data-reduced-motion='true']::before,
html body .wsv8-ccb-overlay[data-reduced-motion='true']::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

html body .wsv8-ccb-overlay[data-reduced-motion='true'] .wsv8-ccb-pedestal[data-sold='true'] .wsv8-ccb-sold-stamp {
  opacity: 1;
  transform: translate(-50%, -50%) rotate(-12deg) scale(1);
}

@keyframes wsv8-ccb-stage-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes wsv8-ccb-stage-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes wsv8-ccb-spot-left {
  from { transform: rotate(-6deg); }
  to { transform: rotate(7deg); }
}

@keyframes wsv8-ccb-spot-right {
  from { transform: rotate(6deg); }
  to { transform: rotate(-7deg); }
}

@keyframes wsv8-ccb-bulb-chase {
  0%, 33% { fill: #FFFDF2; }
  34%, 100% { fill: #D9951A; }
}

@keyframes wsv8-ccb-halo-chase {
  0%, 33% { opacity: 0.92; }
  34%, 100% { opacity: 0.22; }
}

@keyframes wsv8-ccb-bell-swing {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-13deg); }
  60% { transform: rotate(9deg); }
  80% { transform: rotate(-5deg); }
}

@keyframes wsv8-ccb-prop-hover {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes wsv8-ccb-platter-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes wsv8-ccb-stamp-slam {
  0% { opacity: 0; transform: translate(-50%, -50%) rotate(-24deg) scale(2.4); }
  68% { opacity: 1; transform: translate(-50%, -50%) rotate(-10deg) scale(0.94); }
  100% { opacity: 1; transform: translate(-50%, -50%) rotate(-12deg) scale(1); }
}

@keyframes wsv8-ccb-confetti-fly {
  0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5) rotate(0deg); }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--conf-tx, 60px), var(--conf-ty, -70px)) scale(1.1) rotate(var(--conf-rot, 210deg)); }
}
`;

export function ensureCurtainBargainStylesV8(): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(CURTAIN_BARGAIN_STYLE_ID_V8);
  if (existing) {
    if (existing.parentElement === document.head && document.head.lastElementChild !== existing) {
      document.head.appendChild(existing);
    }
    return;
  }
  const styleEl = document.createElement('style');
  styleEl.id = CURTAIN_BARGAIN_STYLE_ID_V8;
  styleEl.textContent = CURTAIN_BARGAIN_CSS_V8;
  document.head.appendChild(styleEl);
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanPlainRelicPerk(raw: string): string {
  const normalized = raw
    .replace(/Backstage\s+Cash/gi, 'secret bribe cash')
    .replace(/in\s+Clean-Air\s+Season/gi, 'during clean-play broadcasts')
    .replace(/\.{3}|\u2026/g, '—')
    .trim();
  const dashIdx = normalized.indexOf('—');
  if (dashIdx > 24) {
    return `${normalized.slice(0, dashIdx).trim().replace(/[.,;:]$/, '')}!`;
  }
  return normalized;
}

function resolveCampaignRelicCandidate(
  turnNumber: number,
  candidateRelic?: { relicId: string; name: string; summary: string },
): { relicId: string; name: string; summary: string } {
  if (candidateRelic && candidateRelic.relicId && candidateRelic.name) {
    const catalogMatch = RELIC_CATALOG_V7.find(
      (r) => r.relicId === candidateRelic.relicId,
    );
    const rawSummary =
      candidateRelic.summary?.trim() ||
      catalogMatch?.triggerSummary ||
      'Permanent Gold-Foil Studio Prop active every turn!';
    return {
      relicId: candidateRelic.relicId,
      name: candidateRelic.name.trim(),
      summary: cleanPlainRelicPerk(rawSummary),
    };
  }

  const cleanPool = RELIC_CATALOG_V7.filter((r) => r.ledgerKind === 'CLEAN');
  const pool = cleanPool.length > 0 ? cleanPool : RELIC_CATALOG_V7;
  const pick =
    pool[Math.abs(Math.max(1, Math.floor(turnNumber || 1)) * 3 - 1) % pool.length];
  return {
    relicId: pick.relicId,
    name: pick.name,
    summary: cleanPlainRelicPerk(pick.triggerSummary),
  };
}

/**
 * Deterministically builds the 3 sunlit Acrylite turntable items for the
 * 1966–1969 *Sale of the Century* Curtain Call Instant Bargain Desk.
 */
export function buildCurtainCallShowpieceItemsV8(
  opts: Pick<
    CurtainCallBargainShowpieceOptsV8,
    'isCampaign' | 'isCouch2P' | 'turnNumber' | 'candidateRelic'
  >,
): readonly [InstantBargainItemV8, InstantBargainItemV8, InstantBargainItemV8] {
  const useCampaignProp = Boolean(opts.isCampaign && !opts.isCouch2P);

  let pedestal1: InstantBargainItemV8;
  if (useCampaignProp) {
    const relic = resolveCampaignRelicCandidate(
      opts.turnNumber,
      opts.candidateRelic,
    );
    pedestal1 = {
      kind: 'GOLD_PROP',
      title: relic.name.toUpperCase(),
      subtitle: `Gold-Foil Prop: ${relic.summary}`,
      costLiveCash: 400,
      badgeTag: 'LIST VALUE $900 · YOURS FOR $400',
      relicId: relic.relicId,
    };
  } else {
    pedestal1 = {
      kind: 'GOLD_PROP',
      title: 'MYSTERY VAULT ENVELOPE',
      subtitle:
        'Pay $350 now for a guaranteed $550–$750 Certified Bonus Envelope at Final Ceremony!',
      costLiveCash: 350,
      badgeTag: 'CERTIFIED $550–$750 VAULT',
    };
  }

  const pedestal2: InstantBargainItemV8 = {
    kind: 'NEXT_TILE_2X',
    title: '2.0× DOUBLE-WATTS BOOSTER',
    subtitle: 'Electrifies your very next board claim for 2.0× cash!',
    costLiveCash: 300,
    badgeTag: 'NEXT SQUARE 2.0× BOOST',
  };

  const pedestal3: InstantBargainItemV8 = {
    kind: 'FINAL_WAGER_SHIELD',
    title: 'FINAL BROADCAST INSURANCE',
    subtitle:
      'Solid-brass crest refunds 50% of your Act III Final Broadcast Wager if missed!',
    costLiveCash: 250,
    badgeTag: '50% ACT III WAGER REFUND',
  };

  return [pedestal1, pedestal2, pedestal3];
}

function computeYouBarPct(youCash: number, rivalCash: number): number {
  const total = Math.max(1, youCash + rivalCash);
  if (youCash === 0 && rivalCash === 0) return 50;
  return Math.max(12, Math.min(88, Math.round((youCash / total) * 100)));
}

function computeBaselineLeadState(
  playerCash: number,
  rivalCash: number,
  rivalShort: string,
): {
  readonly tone: 'safe' | 'tie' | 'danger';
  readonly label: string;
  readonly youRatioPct: number;
} {
  const delta = playerCash - rivalCash;
  const youRatioPct = computeYouBarPct(playerCash, rivalCash);
  if (delta > 0) {
    return {
      tone: 'safe',
      label: `+$${delta.toLocaleString()} LEAD`,
      youRatioPct,
    };
  }
  if (delta === 0) {
    return {
      tone: 'tie',
      label: 'DEAD TIE ON BOARD',
      youRatioPct: 50,
    };
  }
  return {
    tone: 'danger',
    label: `TRAILING ${rivalShort} (-$${Math.abs(delta).toLocaleString()})`,
    youRatioPct,
  };
}

function evaluateStrategicPurchaseSweat(
  playerCash: number,
  rivalCash: number,
  costLiveCash: number,
  rivalShort: string,
): StrategicLeadPreviewV8 {
  if (playerCash < costLiveCash) {
    const shortBy = costLiveCash - playerCash;
    return {
      tone: 'locked',
      iconKind: 'lock',
      pedestalLabel: `NEED $${costLiveCash} ($${shortBy} MORE)`,
      headerLabel: `LOCKED · NEED $${costLiveCash} LIVE SCORE`,
      youRatioPct: computeYouBarPct(playerCash, rivalCash),
      isDangerBar: playerCash < rivalCash,
    };
  }

  const afterCash = playerCash - costLiveCash;
  const leadBefore = playerCash - rivalCash;
  const leadAfter = afterCash - rivalCash;
  const youRatioPct = computeYouBarPct(afterCash, rivalCash);

  if (leadAfter > 0) {
    return {
      tone: 'safe',
      iconKind: 'check',
      pedestalLabel: `KEEPS +$${leadAfter.toLocaleString()} LEAD`,
      headerLabel: `AFTER -$${costLiveCash}: KEEPS +$${leadAfter.toLocaleString()} LEAD`,
      youRatioPct,
      isDangerBar: false,
    };
  }

  if (leadAfter === 0) {
    return {
      tone: 'tie',
      iconKind: 'tie',
      pedestalLabel: `DROPS TO DEAD TIE ($${afterCash.toLocaleString()})`,
      headerLabel: `AFTER -$${costLiveCash}: DEAD TIE AT $${afterCash.toLocaleString()}`,
      youRatioPct: 50,
      isDangerBar: false,
    };
  }

  if (leadBefore >= 0) {
    return {
      tone: 'danger',
      iconKind: 'warn',
      pedestalLabel: `HANDS LEAD TO ${rivalShort} (-$${Math.abs(leadAfter).toLocaleString()})`,
      headerLabel: `HANDS +$${Math.abs(leadAfter).toLocaleString()} LEAD TO ${rivalShort}!`,
      youRatioPct,
      isDangerBar: true,
    };
  }

  return {
    tone: 'danger',
    iconKind: 'warn',
    pedestalLabel: `WIDENS GAP TO -$${Math.abs(leadAfter).toLocaleString()}`,
    headerLabel: `AFTER -$${costLiveCash}: TRAILS ${rivalShort} (-$${Math.abs(leadAfter).toLocaleString()})`,
    youRatioPct,
    isDangerBar: true,
  };
}

function renderSweatIconSvg(kind: StrategicLeadPreviewV8['iconKind']): string {
  if (kind === 'warn') {
    return `
      <svg class="wsv8-ccb-sweat-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 2 L16.8 15.5 H1.2 Z" fill="#E6397A" stroke="#8F1042" stroke-width="1.4" stroke-linejoin="round"/>
        <line x1="9" y1="6.8" x2="9" y2="11.2" stroke="#FFFDF7" stroke-width="1.9" stroke-linecap="round"/>
        <circle cx="9" cy="13.6" r="1.1" fill="#FFFDF7"/>
      </svg>
    `;
  }
  if (kind === 'tie') {
    return `
      <svg class="wsv8-ccb-sweat-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 2 L16 9 L9 16 L2 9 Z" fill="#F2A922" stroke="#7A4700" stroke-width="1.4" stroke-linejoin="round"/>
        <line x1="5.8" y1="9" x2="12.2" y2="9" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }
  if (kind === 'lock') {
    return `
      <svg class="wsv8-ccb-sweat-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M5.5 8 V5.8 C5.5 3.8 7 2.4 9 2.4 C11 2.4 12.5 3.8 12.5 5.8 V8" stroke="#6E3B23" stroke-width="1.8" stroke-linecap="round"/>
        <rect x="3.5" y="8" width="11" height="8" rx="2.2" fill="#D9A441" stroke="#6E3B23" stroke-width="1.4"/>
        <circle cx="9" cy="12" r="1.3" fill="#4A2412"/>
      </svg>
    `;
  }
  return `
    <svg class="wsv8-ccb-sweat-icon" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.2" fill="#138A4B" stroke="#0B5D31" stroke-width="1.3"/>
      <path d="M5.5 9.2 L7.8 11.5 L12.6 6.6" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function buildAtlasSpriteInlineStyleV8(targetId: string): string {
  const entry = getAtlasSpriteEntryV9(targetId);
  if (!entry) return '';
  const { sprite, assetUrl } = entry;
  const sizeX = ((sprite.sheetW / Math.max(1, sprite.w)) * 100).toFixed(4);
  const sizeY = ((sprite.sheetH / Math.max(1, sprite.h)) * 100).toFixed(4);
  const posX =
    sprite.sheetW <= sprite.w
      ? '0.0000'
      : ((sprite.x / (sprite.sheetW - sprite.w)) * 100).toFixed(4);
  const posY =
    sprite.sheetH <= sprite.h
      ? '0.0000'
      : ((sprite.y / (sprite.sheetH - sprite.h)) * 100).toFixed(4);
  const safeUrl = assetUrl.replace(/'/g, '%27');
  return `background-image: url('${safeUrl}'); background-size: ${sizeX}% ${sizeY}%; background-position: ${posX}% ${posY}%;`;
}

function hydrateAtlasSpritesInRootV8(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[data-atlas-target]').forEach((el) => {
    const targetId = el.dataset.atlasTarget;
    if (!targetId) return;
    const entry = getAtlasSpriteEntryV9(targetId);
    if (!entry) return;
    const { sprite, assetUrl } = entry;
    const sizeX = ((sprite.sheetW / Math.max(1, sprite.w)) * 100).toFixed(4);
    const sizeY = ((sprite.sheetH / Math.max(1, sprite.h)) * 100).toFixed(4);
    const posX =
      sprite.sheetW <= sprite.w
        ? '0.0000'
        : ((sprite.x / (sprite.sheetW - sprite.w)) * 100).toFixed(4);
    const posY =
      sprite.sheetH <= sprite.h
        ? '0.0000'
        : ((sprite.y / (sprite.sheetH - sprite.h)) * 100).toFixed(4);
    el.style.backgroundImage = `url("${assetUrl}")`;
    el.style.backgroundSize = `${sizeX}% ${sizeY}%`;
    el.style.backgroundPosition = `${posX}% ${posY}%`;
  });
}

function renderVelvetCurtainCornerSprite(side: 'left' | 'right'): string {
  const inlineStyle = buildAtlasSpriteInlineStyleV8('curtain_backdrop_stage');
  return `<div class="wsv8-ccb-curtain-drape wsv8-ccb-curtain-drape--${side}" data-atlas-target="curtain_backdrop_stage" style="${inlineStyle}" aria-hidden="true"></div>`;
}

function renderMarqueeBulbsArchSvg(): string {
  const totalBulbs = 21;
  const bulbs: string[] = [];
  for (let i = 0; i < totalBulbs; i += 1) {
    const t = i / (totalBulbs - 1);
    const x = Math.round(24 + t * 712);
    const archCurve = Math.sin(t * Math.PI);
    const y = Math.round(18 - archCurve * 10);
    const circuit = `wsv8-ccb-c${i % 3}`;
    bulbs.push(
      `<circle class="wsv8-ccb-bulb-halo ${circuit}" cx="${x}" cy="${y}" r="7.8" fill="#FFD166"/>` +
        `<circle cx="${x}" cy="${y}" r="4.6" fill="#B57B1C"/>` +
        `<circle class="wsv8-ccb-bulb-core ${circuit}" cx="${x}" cy="${y}" r="3.4" fill="#FFFDF2"/>`,
    );
  }
  return `
    <svg class="wsv8-ccb-bulbs-svg" viewBox="0 0 760 26" fill="none" aria-hidden="true">
      <path d="M18 19 Q380 2 742 19" stroke="#C9922C" stroke-width="3.2" stroke-linecap="round"/>
      ${bulbs.join('')}
    </svg>
  `;
}

function renderSolenoidBellSvg(): string {
  return `
    <svg class="wsv8-ccb-bell-svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="7" r="4" fill="#FFF6E3" stroke="#8F5605" stroke-width="1.8"/>
      <path d="M11 33 C11 19 15.5 11 24 11 C32.5 11 37 19 37 33 L42 37 H6 L11 33 Z"
            fill="#FFD166" stroke="#8F5605" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M16 19 C17.5 15.5 20.5 14 24 14" stroke="#FFFDF7" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="24" cy="40.5" r="4.5" fill="#FF6B35" stroke="#6E3B23" stroke-width="1.6"/>
    </svg>
  `;
}

/**
 * 1966 Gouache Atlas Sprites for Instant Bargain Pedestals
 * (`prize_bar_cart`, `prize_transistor_pocket`, `prize_diamond_watch`).
 */
function resolvePedestalAtlasTargetId(
  kind: InstantBargainKindV8,
): string {
  if (kind === 'GOLD_PROP') {
    return 'prize_bar_cart';
  }
  if (kind === 'NEXT_TILE_2X') {
    return 'prize_transistor_pocket';
  }
  return 'prize_diamond_watch';
}

function renderPedestalShowcaseSprite(
  kind: InstantBargainKindV8,
): string {
  const targetId = resolvePedestalAtlasTargetId(kind);
  const inlineStyle = buildAtlasSpriteInlineStyleV8(targetId);
  return `<div class="wsv8-ccb-showcase-sprite" data-atlas-target="${targetId}" data-kind="${kind}" style="${inlineStyle}" aria-hidden="true"></div>`;
}

function renderButtonPadlockSvg(): string {
  return `
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5.5 8 V5.8 C5.5 3.8 7 2.4 9 2.4 C11 2.4 12.5 3.8 12.5 5.8 V8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      <rect x="3.5" y="8" width="11" height="8" rx="2.2" fill="#D9A441" stroke="currentColor" stroke-width="1.5"/>
    </svg>
  `;
}

function renderConfettiPiecesHtml(): string {
  const palette = ['#FFD166', '#FF6B35', '#008B94', '#E6397A', '#FFFDF7', '#18A957'];
  const pieces: string[] = [];
  const count = 16;
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const dist = 62 + (i % 3) * 24;
    const tx = Math.round(Math.cos(angle) * dist);
    const ty = Math.round(Math.sin(angle) * dist - 14);
    const rot = (i % 2 === 0 ? 1 : -1) * (150 + i * 22);
    const bg = palette[i % palette.length];
    pieces.push(
      `<span class="wsv8-ccb-confetti-piece" style="--conf-tx:${tx}px;--conf-ty:${ty}px;--conf-rot:${rot}deg;--conf-bg:${bg};"></span>`,
    );
  }
  return `<div class="wsv8-ccb-confetti-burst" aria-hidden="true">${pieces.join('')}</div>`;
}

function buildBellamyHostPitch(
  turnNumber: number,
  leadDelta: number,
  rivalShort: string,
  activePlayerName?: string,
  isCouch2P?: boolean,
): string {
  const turn = Math.max(1, Math.floor(turnNumber || 1));
  const greetingName =
    isCouch2P && activePlayerName?.trim() ? `, ${activePlayerName.trim()}` : '';
  if (leadDelta >= 400) {
    return `“Hold the board on Turn ${turn}${greetingName}! Trade a slice of your +$${leadDelta.toLocaleString()} lead for prime-time firepower—or guard every dollar?”`;
  }
  if (leadDelta >= 0) {
    return `“Careful on Turn ${turn}${greetingName}! Ringing up a bargain right now could hand ${rivalShort} the scoreboard lead!”`;
  }
  return `“Turn ${turn} temptation${greetingName}! Invest live cash now to spark a comeback—or protect your bank for Act III?”`;
}

/**
 * Launches Grant Bellamy's sunlit 1966 *Sale of the Century* Stage Turntable Desk.
 * Resolves cleanly with `{ accepted: true, chosenItem }` or `{ accepted: false, chosenItem: null }`,
 * detaching all DOM nodes, timers, and keyboard listeners on completion.
 */
export function runCurtainCallBargainShowpieceV8(
  container: HTMLElement,
  opts: CurtainCallBargainShowpieceOptsV8,
): Promise<InstantBargainChoiceResultV8> {
  ensureCurtainBargainStylesV8();

  const playerCash = Math.max(0, Math.round(opts.playerCash || 0));
  const rivalCash = Math.max(0, Math.round(opts.rivalCash || 0));
  const turnNumber = Math.max(1, Math.floor(opts.turnNumber || 1));
  const youLabel =
    opts.isCouch2P && opts.activePlayerName?.trim()
      ? opts.activePlayerName.trim().toUpperCase()
      : 'YOU';
  const rivalFull = (opts.rivalName?.trim() || 'CHAMPION').toUpperCase();
  const rivalShort = rivalFull.split(/\s+/)[0] || 'RIVAL';
  const reduced = Boolean(opts.reducedMotion);

  const items = opts.overrideItems ?? buildCurtainCallShowpieceItemsV8(opts);
  const baseline = computeBaselineLeadState(playerCash, rivalCash, rivalShort);
  const previews = items.map((item) =>
    evaluateStrategicPurchaseSweat(
      playerCash,
      rivalCash,
      item.costLiveCash,
      rivalShort,
    ),
  );
  const pitchCopy = buildBellamyHostPitch(
    turnNumber,
    playerCash - rivalCash,
    rivalShort,
    opts.activePlayerName,
    opts.isCouch2P,
  );
  const leadDelta = playerCash - rivalCash;
  const noSaleLabel =
    leadDelta > 0
      ? `NO SALE — PROTECT MY +$${leadDelta.toLocaleString()} LEAD!`
      : `NO SALE — KEEP MY $${playerCash.toLocaleString()} PURSE!`;

  opts.onBellSfx?.();

  return new Promise<InstantBargainChoiceResultV8>((resolve) => {
    let settled = false;
    const timers: number[] = [];

    const overlay = document.createElement('section');
    overlay.className = 'wsv8-ccb-overlay';
    overlay.dataset.reducedMotion = reduced ? 'true' : 'false';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute(
      'aria-label',
      "Grant Bellamy's Instant Bargain Desk",
    );

    const pedestalsHtml = items
      .map((item, idx) => {
        const canAfford = playerCash >= item.costLiveCash;
        const afterCash = Math.max(0, playerCash - item.costLiveCash);
        const sweat = previews[idx];

        return `
          <article class="wsv8-ccb-pedestal"
                   data-pedestal-idx="${idx}"
                   data-kind="${item.kind}"
                   data-affordable="${canAfford ? 'true' : 'false'}">
            <div class="wsv8-ccb-ped-top">
              <span class="wsv8-ccb-hangtag">${escapeHtml(item.badgeTag)}</span>
              <span class="wsv8-ccb-price-tag">$${item.costLiveCash}</span>
            </div>

            <div class="wsv8-ccb-ped-body">
              <div class="wsv8-ccb-turntable-stage">
                ${renderPedestalShowcaseSprite(item.kind)}
                <div class="wsv8-ccb-velvet-plinth" aria-hidden="true"></div>
              </div>

              <div class="wsv8-ccb-copy-plaque">
                <h3 class="wsv8-ccb-item-title">${escapeHtml(item.title)}</h3>
                <p class="wsv8-ccb-item-sub">${escapeHtml(item.subtitle)}</p>
                <div class="wsv8-ccb-sweat-pill" data-sweat="${sweat.tone}">
                  ${renderSweatIconSvg(sweat.iconKind)}
                  <span>${escapeHtml(sweat.pedestalLabel)}</span>
                </div>
              </div>
            </div>

            <div class="wsv8-ccb-ped-cta-wrap">
              <button type="button"
                      class="wsv8-ccb-buy-btn"
                      data-item-idx="${idx}"
                      data-bargain-kind="${item.kind}"
                      ${canAfford ? '' : 'disabled'}>
                ${
                  canAfford
                    ? `<span class="wsv8-ccb-buy-main">RING UP BARGAIN · -$${item.costLiveCash}</span>
                       <span class="wsv8-ccb-buy-sub">KEEP $${afterCash.toLocaleString()} LIVE</span>`
                    : `<span class="wsv8-ccb-buy-main">${renderButtonPadlockSvg()}<span>NEED $${item.costLiveCash}</span></span>`
                }
              </button>
            </div>

            <div class="wsv8-ccb-sold-stamp" aria-hidden="true">SOLD!</div>
            ${renderConfettiPiecesHtml()}
          </article>
        `;
      })
      .join('');

    overlay.innerHTML = `
      <div class="wsv8-ccb-proscenium">
        ${renderVelvetCurtainCornerSprite('left')}
        ${renderVelvetCurtainCornerSprite('right')}
        ${renderMarqueeBulbsArchSvg()}

        <header class="wsv8-ccb-header-deck">
          <div class="wsv8-ccb-host-cluster">
            <div class="wsv8-ccb-emcee-medallion" aria-hidden="true">
              <div class="wsv8-ccb-emcee-portrait"
                   style="background-image: url('${EMCEE_PORTRAIT_ASSET_V7}'); background-size: 200% 200%; background-position: 0% 0%;"></div>
            </div>
            <div class="wsv8-ccb-title-block">
              <div class="wsv8-ccb-kicker-row">
                <span class="wsv8-ccb-kicker-pill">TURN ${turnNumber} CURTAIN CALL · INSTANT BARGAIN DESK</span>
              </div>
              <div class="wsv8-ccb-headline-wrap">
                ${renderSolenoidBellSvg()}
                <h2 class="wsv8-ccb-headline">GRANT BELLAMY’S INSTANT BARGAIN DESK!</h2>
              </div>
              <p class="wsv8-ccb-pitch-quote">${escapeHtml(pitchCopy)}</p>
            </div>
          </div>

          <div class="wsv8-ccb-scoreboard-bar" aria-label="Live Scoreboard Lead Meter">
            <div class="wsv8-ccb-flap-pair">
              <div class="wsv8-ccb-flap-drum" data-side="you">
                <span class="wsv8-ccb-flap-label">${escapeHtml(youLabel)}</span>
                <strong class="wsv8-ccb-flap-cash" data-role="you-cash">$${playerCash.toLocaleString()}</strong>
              </div>
              <span class="wsv8-ccb-vs-badge">VS</span>
              <div class="wsv8-ccb-flap-drum" data-side="rival">
                <span class="wsv8-ccb-flap-label">${escapeHtml(rivalShort)}</span>
                <strong class="wsv8-ccb-flap-cash">$${rivalCash.toLocaleString()}</strong>
              </div>
            </div>

            <div class="wsv8-ccb-lead-meter-group">
              <div class="wsv8-ccb-tug-track" aria-hidden="true">
                <div class="wsv8-ccb-tug-fill"
                     data-role="tug-fill"
                     data-danger="${playerCash < rivalCash ? 'true' : 'false'}"
                     style="width: ${baseline.youRatioPct}%;"></div>
                <span class="wsv8-ccb-tug-midline"></span>
              </div>
              <span class="wsv8-ccb-lead-status-pill"
                    data-role="lead-pill"
                    data-tone="${baseline.tone}"
                    data-previewing="false">${escapeHtml(baseline.label)}</span>
            </div>
          </div>
        </header>

        <div class="wsv8-ccb-pedestals-grid">
          ${pedestalsHtml}
        </div>

        <footer class="wsv8-ccb-footer">
          <button type="button" class="wsv8-ccb-nosale-btn" data-action="bargain-no-sale">
            <span>${escapeHtml(noSaleLabel)}</span>
          </button>
        </footer>
      </div>
    `;

    const youCashEl = overlay.querySelector<HTMLElement>('[data-role="you-cash"]');
    const tugFillEl = overlay.querySelector<HTMLElement>('[data-role="tug-fill"]');
    const leadPillEl = overlay.querySelector<HTMLElement>('[data-role="lead-pill"]');

    const showLeadPreview = (idx: number | null): void => {
      if (settled) return;
      if (idx === null || !items[idx] || !previews[idx]) {
        if (tugFillEl) {
          tugFillEl.style.width = `${baseline.youRatioPct}%`;
          tugFillEl.dataset.danger = playerCash < rivalCash ? 'true' : 'false';
        }
        if (leadPillEl) {
          leadPillEl.textContent = baseline.label;
          leadPillEl.dataset.tone = baseline.tone;
          leadPillEl.dataset.previewing = 'false';
        }
        return;
      }

      const preview = previews[idx];
      if (tugFillEl) {
        tugFillEl.style.width = `${preview.youRatioPct}%`;
        tugFillEl.dataset.danger = preview.isDangerBar ? 'true' : 'false';
      }
      if (leadPillEl) {
        leadPillEl.textContent = preview.headerLabel;
        leadPillEl.dataset.tone =
          preview.tone === 'locked' ? baseline.tone : preview.tone;
        leadPillEl.dataset.previewing = 'true';
      }
    };

    const cleanup = (): void => {
      for (const timerId of timers) {
        if (typeof window !== 'undefined') {
          window.clearTimeout(timerId);
        }
      }
      timers.length = 0;
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', onKeyDown);
      }
      overlay.remove();
    };

    const finish = (result: InstantBargainChoiceResultV8): void => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const selectPedestal = (idx: number): void => {
      if (settled) return;
      const chosen = items[idx];
      if (!chosen || playerCash < chosen.costLiveCash) return;

      showLeadPreview(idx);
      overlay.querySelectorAll<HTMLButtonElement>('button').forEach((btn) => {
        btn.disabled = true;
      });

      const pedEl = overlay.querySelector<HTMLElement>(
        `.wsv8-ccb-pedestal[data-pedestal-idx="${idx}"]`,
      );
      if (pedEl) {
        pedEl.dataset.sold = 'true';
      }
      const afterCash = Math.max(0, playerCash - chosen.costLiveCash);
      if (youCashEl) {
        youCashEl.textContent = `$${afterCash.toLocaleString()}`;
      }
      if (leadPillEl) {
        leadPillEl.textContent = `SOLD! NEW SCORE: $${afterCash.toLocaleString()}`;
      }

      opts.onBuySfx?.(chosen);

      if (typeof window === 'undefined') {
        finish({ accepted: true, chosenItem: chosen });
        return;
      }

      const celebrateMs = reduced ? 140 : 450;
      timers.push(
        window.setTimeout(() => {
          finish({ accepted: true, chosenItem: chosen });
        }, celebrateMs),
      );
    };

    const chooseNoSale = (): void => {
      if (settled) return;
      overlay.querySelectorAll<HTMLButtonElement>('button').forEach((btn) => {
        btn.disabled = true;
      });
      overlay.dataset.exiting = 'true';
      opts.onNoSaleSfx?.();

      if (typeof window === 'undefined') {
        finish({ accepted: false, chosenItem: null });
        return;
      }

      timers.push(
        window.setTimeout(() => {
          finish({ accepted: false, chosenItem: null });
        }, reduced ? 60 : 140),
      );
    };

    overlay.querySelectorAll<HTMLElement>('.wsv8-ccb-pedestal').forEach((pedEl) => {
      const idx = Number(pedEl.dataset.pedestalIdx);
      if (!Number.isInteger(idx)) return;
      pedEl.addEventListener('pointerenter', () => showLeadPreview(idx));
      pedEl.addEventListener('pointerleave', () => showLeadPreview(null));
      pedEl.addEventListener('focusin', () => showLeadPreview(idx));
      pedEl.addEventListener('focusout', () => showLeadPreview(null));
    });

    overlay.querySelectorAll<HTMLButtonElement>('.wsv8-ccb-buy-btn').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const idx = Number(btn.dataset.itemIdx);
        if (Number.isInteger(idx)) {
          selectPedestal(idx);
        }
      });
    });

    const noSaleBtn = overlay.querySelector<HTMLButtonElement>(
      '.wsv8-ccb-nosale-btn',
    );
    noSaleBtn?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      chooseNoSale();
    });

    const onKeyDown = (ev: KeyboardEvent): void => {
      if (settled) return;
      if (
        ev.key === 'Escape' ||
        ev.key.toLowerCase() === 'n' ||
        ev.key.toLowerCase() === 'p'
      ) {
        ev.preventDefault();
        chooseNoSale();
      } else if (ev.key === '1' || ev.key === '2' || ev.key === '3') {
        const idx = Number(ev.key) - 1;
        if (items[idx] && playerCash >= items[idx].costLiveCash) {
          ev.preventDefault();
          selectPedestal(idx);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', onKeyDown);
    }

    if (container && typeof container.appendChild === 'function') {
      container.appendChild(overlay);
    }
    hydrateAtlasSpritesInRootV8(overlay);
    void loadAtlasManifestV9().then((manifest) => {
      if (manifest && !settled && overlay.isConnected) {
        hydrateAtlasSpritesInRootV8(overlay);
      }
    });
    noSaleBtn?.focus?.({ preventScroll: true });
  });
}
