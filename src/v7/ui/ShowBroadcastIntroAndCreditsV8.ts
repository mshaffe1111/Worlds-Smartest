/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.1 — SUNLIT 1966 NETWORK DELUXE)
// `src/v7/ui/ShowBroadcastIntroAndCreditsV8.ts`
//
// Principal 1966 Network Television Opening Title Sequence & Closing Credits
// (Saul Bass, Morton Goldsholl, John J. Graham "In Living Color" Peacock,
// Goodson-Todman / Merv Griffin Studio 6A Prime-Time Broadcast Unit):
//   1. `playBroadcastShowIntroV8(container, opts)` — Exhilarating 10.0s 60fps
//      4-Act 1966 Network Television Opening Title Sequence inside a sculpted
//      Sunlit American Walnut (`#6E3B23`), Brushed Champagne Brass (`#D9A441`)
//      & Warm Broadcast Cream (`#FAF2DF` / `#FFF6E3`) RCA Living Color Monitor,
//      with `SKIP INTRO` brass/cream paddle, `"Auto-Intro: ON"` toggle pill,
//      and `seekShowIntroProgressV8` / `setGremlinLikeProgress` QA scrubbing.
//   2. `play1966EndCreditsV8(container, opts)` — ~9.5s 1966 Prime-Time Closing
//      Super-Title Crawl over sunlit golden-hour Studio 6A crane footage with
//      `DONE · BACK TO STUDIO` paddle, keyboard dismiss, and QA scrubbing via
//      `seekEndCreditsProgressV8`.
// ============================================================================

import type {
  CastIdV7,
  ShowBroadcastIntroOptsV8,
  ShowEndCreditsOptsV8,
} from '../contracts_v7';
import {
  preloadMatchPortraitsV8,
  resolvePaintedPortraitAssetV8,
} from './ReactionPipMonitorV8';

// ----------------------------------------------------------------------------
// 0. Canonical Painted 1966 Gouache Stage Plates & Cast Portrait Constants
// ----------------------------------------------------------------------------

export const IBC_PEACOCK_TELEVISION_CITY_PLATE_V8 =
  './assets/v7/intro/ibc_peacock_television_city.jpg' as const;

export const STUDIO_6A_CAMERAS_MARQUEE_PLATE_V8 =
  './assets/v7/intro/studio_6a_cameras_marquee.jpg' as const;

export const GRANT_BELLAMY_PORTRAIT_SHEET_V8 =
  './assets/v7/portraits/grant_bellamy.jpg' as const;

export const AUTO_PLAY_SHOW_INTRO_STORAGE_KEY_V8 =
  'ws_v8_auto_play_show_intro' as const;

export interface ShowBroadcastIntroResultV8 {
  readonly skipped: boolean;
  readonly autoPlayToggled?: boolean;
}

const STYLE_ELEMENT_ID_V8 = 'wsv8-show-broadcast-intro-credits-styles';
const warmedStagePlateUrlsV8 = new Set<string>();
const activeContainerCleanupsV8 = new WeakMap<HTMLElement, () => void>();
const introSeekControllersV8 = new WeakMap<HTMLElement, (progress01: number) => void>();
const creditsSeekControllersV8 = new WeakMap<HTMLElement, (progress01: number) => void>();

// ----------------------------------------------------------------------------
// 1. Auto-Intro Preference Helpers & Non-Blocking Gouache Plate Preloader
// ----------------------------------------------------------------------------

function getSafeLocalStorageV8(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    const g = globalThis as { localStorage?: Storage };
    return g.localStorage ?? null;
  } catch {
    return null;
  }
}

export function isAutoPlayShowIntroEnabledV8(): boolean {
  const store = getSafeLocalStorageV8();
  if (!store) return true;
  try {
    const raw = store.getItem(AUTO_PLAY_SHOW_INTRO_STORAGE_KEY_V8);
    if (raw === '0' || raw === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export function setAutoPlayShowIntroEnabledV8(enabled: boolean): void {
  const store = getSafeLocalStorageV8();
  if (!store) return;
  try {
    store.setItem(AUTO_PLAY_SHOW_INTRO_STORAGE_KEY_V8, enabled ? '1' : '0');
  } catch {
    // Ignore storage quota errors in private/sandboxed browsing contexts.
  }
}

export function preloadBroadcastIntroPlatesV8(castIds: readonly CastIdV7[] = []): void {
  preloadMatchPortraitsV8(['GRANT_BELLAMY', ...castIds]);
  if (typeof Image === 'undefined') return;
  const plates = [
    IBC_PEACOCK_TELEVISION_CITY_PLATE_V8,
    STUDIO_6A_CAMERAS_MARQUEE_PLATE_V8,
  ];
  for (const url of plates) {
    if (warmedStagePlateUrlsV8.has(url)) continue;
    warmedStagePlateUrlsV8.add(url);
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    } catch {
      // Safe no-op in headless/non-DOM environments.
    }
  }
}

// ----------------------------------------------------------------------------
// 2. Utility & Pure Vector Mid-Century Broadcast Icon Builders (Zero Emojis!)
// ----------------------------------------------------------------------------

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

function easeOutCubic(t: number): number {
  const u = clamp01(t);
  return 1 - Math.pow(1 - u, 3);
}

function easeInOutCubic(t: number): number {
  const u = clamp01(t);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

function escapeHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPlayTriangleSvg(fillHex = '#141B29'): string {
  return `<svg class="wsv8-ic-tri-svg" viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true"><path d="M2.2 1.4L10.6 6L2.2 10.6V1.4Z" fill="${fillHex}"/></svg>`;
}

/**
 * Morton Goldsholl / John J. Graham 1966 11-Feather "In Living Color" Peacock
 * Translucent SVG Fan — blossoms dynamically via `--wsv8-peacock-bloom` (`0..1`).
 */
function renderLivingColorPeacockSvg(compact = false): string {
  const feathers: ReadonlyArray<{
    readonly idx: number;
    readonly targetDeg: number;
    readonly fill: string;
    readonly inner: string;
  }> = [
    { idx: 0, targetDeg: -75, fill: '#F2A922', inner: '#FFE599' },
    { idx: 1, targetDeg: -60, fill: '#FF8A2B', inner: '#FFD166' },
    { idx: 2, targetDeg: -45, fill: '#FF6B35', inner: '#FFC2A6' },
    { idx: 3, targetDeg: -30, fill: '#E6397A', inner: '#FFADD2' },
    { idx: 4, targetDeg: -15, fill: '#C83E8B', inner: '#F7B5DC' },
    { idx: 5, targetDeg: 0, fill: '#1E56C5', inner: '#9CC2FF' },
    { idx: 6, targetDeg: 15, fill: '#008B94', inner: '#8CE8EE' },
    { idx: 7, targetDeg: 30, fill: '#00A693', inner: '#A3F5E8' },
    { idx: 8, targetDeg: 45, fill: '#16A34A', inner: '#A7F3C1' },
    { idx: 9, targetDeg: 60, fill: '#7FB828', inner: '#DCF7A1' },
    { idx: 10, targetDeg: 75, fill: '#F2A922', inner: '#FFF0B3' },
  ];

  const featherMarkup = feathers
    .map(
      (f) => `
      <g class="wsv8-peacock-feather" style="--feather-deg: ${f.targetDeg}deg; --feather-idx: ${f.idx};">
        <path d="M160 156 C143 116, 136 58, 160 22 C184 58, 177 116, 160 156 Z"
              fill="${f.fill}" fill-opacity="${compact ? '0.90' : '0.28'}" stroke="#FFF6E3" stroke-opacity="${compact ? '0.95' : '0.55'}" stroke-width="${compact ? '1.4' : '1.1'}" />
        <ellipse cx="160" cy="58" rx="9.5" ry="15" fill="${f.inner}" fill-opacity="${compact ? '0.92' : '0.32'}" />
        ${compact ? '<ellipse cx="160" cy="55" rx="4.5" ry="7.5" fill="#FFFDF7" fill-opacity="0.95" />' : ''}
      </g>`,
    )
    .join('');

  const bodyMarkup = compact
    ? `
      <path d="M160 98 C153 98, 149 104, 151 112 C153 121, 146 136, 146 150 C146 161, 152 168, 160 168 C168 168, 174 161, 174 150 C174 136, 167 121, 169 112 C171 104, 167 98, 160 98 Z"
            fill="#FFFDF7" stroke="#6E3B23" stroke-width="2.2" />
      <path d="M156 90 L160 80 L164 90" stroke="#FFD166" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="156" cy="80" r="2.2" fill="#FFD166" />
      <circle cx="160" cy="77" r="2.5" fill="#FFFDF7" />
      <circle cx="164" cy="80" r="2.2" fill="#FFD166" />
      <path d="M160 105 L167 108 L160 111 Z" fill="#FF6B35" />`
    : `
      <path d="M84 44 L87 54 L97 57 L87 60 L84 70 L81 60 L71 57 L81 54 Z" fill="#FFFDF7" fill-opacity="0.88" />
      <path d="M236 48 L239 57 L248 60 L239 63 L236 72 L233 63 L224 60 L233 57 Z" fill="#FFFDF7" fill-opacity="0.88" />`;

  return `
    <svg class="wsv8-peacock-svg ${compact ? 'wsv8-peacock-svg--compact' : 'wsv8-peacock-svg--bloom-overlay'}"
         viewBox="0 0 320 186"
         fill="none"
         aria-hidden="true">
      <defs>
        <radialGradient id="wsv8PeacockHalo${compact ? 'Sm' : 'Lg'}" cx="50%" cy="78%" r="65%">
          <stop offset="0%" stop-color="#FFF6CC" stop-opacity="${compact ? '0.92' : '0.38'}" />
          <stop offset="52%" stop-color="#FFD166" stop-opacity="${compact ? '0.38' : '0.16'}" />
          <stop offset="100%" stop-color="#F2A922" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="160" cy="144" rx="142" ry="96" fill="url(#wsv8PeacockHalo${compact ? 'Sm' : 'Lg'})" />
      <g class="wsv8-peacock-fan">
        ${featherMarkup}
      </g>
      ${bodyMarkup}
    </svg>
  `;
}

/**
 * Radiant 24-spoke 1966 Goodson-Todman / Goldsholl Atomic Golden Starburst SVG.
 */
function renderGrandStarburstSvg(): string {
  const rays: string[] = [];
  for (let i = 0; i < 24; i++) {
    const deg = i * 15;
    const longRay = i % 2 === 0;
    const tipY = longRay ? 10 : 38;
    const halfBase = longRay ? 9 : 5.5;
    const fill = i % 4 === 0 ? '#FFF4C2' : i % 2 === 0 ? '#FFD166' : '#F2A922';
    rays.push(
      `<polygon points="200,${tipY} ${200 - halfBase},200 ${200 + halfBase},200" transform="rotate(${deg} 200 200)" fill="${fill}" fill-opacity="${longRay ? '0.92' : '0.72'}" />`,
    );
  }
  return `
    <svg class="wsv8-starburst-svg" viewBox="0 0 400 400" fill="none" aria-hidden="true">
      <g class="wsv8-starburst-wheel">
        ${rays.join('')}
      </g>
      <circle cx="200" cy="200" r="64" fill="#FFF6E3" stroke="#D9A441" stroke-width="4" />
    </svg>
  `;
}

/**
 * Crisp 1966 IBC Standards & Practices Vector Compliance Seal (Title 47 U.S.C. § 509).
 */
function renderComplianceSealSvg(): string {
  return `
    <svg class="wsv8-compliance-seal-svg" viewBox="0 0 44 44" width="38" height="38" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="20" fill="#FFF6E3" stroke="#D9A441" stroke-width="2.4" />
      <circle cx="22" cy="22" r="15.5" fill="none" stroke="#6E3B23" stroke-width="1.2" stroke-dasharray="2.5 2" />
      <path d="M22 10L25.1 16.4L32.2 17.4L27.1 22.3L28.3 29.4L22 26L15.7 29.4L16.9 22.3L11.8 17.4L18.9 16.4L22 10Z"
            fill="#F2A922" stroke="#6E3B23" stroke-width="1.3" stroke-linejoin="round" />
    </svg>
  `;
}

function attachGracefulPlateFallback(root: ParentNode): void {
  const imgs = root.querySelectorAll<HTMLImageElement>('img.wsv8-plate-img');
  imgs.forEach((img) => {
    const markMissing = (): void => {
      img.dataset.plateMissing = 'true';
    };
    const markReady = (): void => {
      if (img.naturalWidth > 0) {
        delete img.dataset.plateMissing;
      }
    };
    img.addEventListener('error', markMissing);
    img.addEventListener('load', markReady);
    if (img.complete && img.naturalWidth === 0) {
      markMissing();
    }
  });
}

// ----------------------------------------------------------------------------
// 3. Sunlit 1966 RCA Living Color Stylesheet (Zero Dark-Blue Hexes!)
// ----------------------------------------------------------------------------

function ensureBroadcastIntroAndCreditsStylesV8(ownerDoc?: Document): void {
  const doc = ownerDoc ?? (typeof document !== 'undefined' ? document : undefined);
  if (!doc) return;

  let styleEl = doc.getElementById(STYLE_ELEMENT_ID_V8) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.id = STYLE_ELEMENT_ID_V8;
    doc.head.appendChild(styleEl);
  }
  if (styleEl.dataset.version === 'v8.1-sunlit-1966-intro-credits') {
    return;
  }
  styleEl.dataset.version = 'v8.1-sunlit-1966-intro-credits';

  styleEl.textContent = `
    .wsv8-intro-overlay,
    .wsv8-intro-overlay *,
    .wsv8-credits-overlay,
    .wsv8-credits-overlay * {
      box-sizing: border-box;
    }

    /* Hide floating Cam-2 PiP reactions while Full-Broadcast Intro or Credits run */
    body:has(.wsv8-intro-overlay) .wsv8-pip-stage,
    body:has(.wsv8-credits-overlay) .wsv8-pip-stage {
      display: none !important;
    }

    /* ========================================================================
       SHARED 1966 RCA LIVING COLOR WALNUT, SPUN-BRASS & CREAM PROSCENIUM
       ======================================================================== */
    .wsv8-intro-overlay,
    .wsv8-credits-overlay {
      --wsv8-progress: 0;
      --wsv8-peacock-bloom: 0;
      --wsv8-leader-opacity: 0;
      --wsv8-leader-sweep-deg: 0deg;
      --wsv8-act1-opacity: 1;
      --wsv8-act2-opacity: 0;
      --wsv8-act3-opacity: 0;
      --wsv8-act4-opacity: 0;
      --wsv8-crane-x: 0%;
      --wsv8-crane-y: 0%;
      --wsv8-crane-scale: 1.06;
      --wsv8-bass-slide: 0;
      --wsv8-starburst-deg: 0deg;
      --wsv8-curtain-open: 0;
      --wsv8-credits-scroll-px: 0px;

      position: fixed;
      inset: 0;
      z-index: 9400;
      display: flex;
      align-items: center;
      justify-content: center;
      padding:
        max(10px, env(safe-area-inset-top, 0px))
        max(10px, env(safe-area-inset-right, 0px))
        max(10px, env(safe-area-inset-bottom, 0px))
        max(10px, env(safe-area-inset-left, 0px));
      background:
        radial-gradient(circle at 50% 38%, rgba(255, 214, 118, 0.34) 0%, rgba(139, 78, 46, 0.84) 56%, rgba(68, 34, 16, 0.95) 100%);
      backdrop-filter: blur(8px) saturate(1.12);
      -webkit-backdrop-filter: blur(8px) saturate(1.12);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      overflow: hidden;
    }

    /* Smooth iris/curtain reveal out at the end of Beat 4 */
    .wsv8-intro-overlay[data-curtain-part='true'] {
      background:
        radial-gradient(
          circle at 50% 45%,
          rgba(255, 232, 178, calc(0.28 * (1 - var(--wsv8-curtain-open)))) 0%,
          rgba(92, 48, 27, calc(0.88 * (1 - var(--wsv8-curtain-open)))) 100%
        );
    }

    .wsv8-tv-console {
      position: relative;
      width: min(1160px, 100%);
      max-height: calc(100dvh - 20px);
      display: flex;
      flex-direction: column;
      border-radius: 26px;
      padding: 10px 12px 12px 12px;
      background:
        repeating-linear-gradient(
          92deg,
          rgba(255, 236, 200, 0.06) 0px,
          rgba(255, 236, 200, 0.06) 4px,
          rgba(58, 27, 11, 0.09) 4px,
          rgba(58, 27, 11, 0.09) 10px
        ),
        linear-gradient(155deg, #8F5231 0%, #6E3B23 52%, #4E2714 100%);
      box-shadow:
        0 26px 64px rgba(52, 24, 9, 0.52),
        0 0 0 2.5px #D9A441,
        inset 0 2px 0 rgba(255, 242, 212, 0.48),
        inset 0 -3px 8px rgba(42, 18, 6, 0.45);
      transition: transform 0.16s ease-out, opacity 0.16s ease-out;
    }

    .wsv8-intro-overlay[data-curtain-part='true'] .wsv8-tv-console {
      transform: scale(calc(1 + var(--wsv8-curtain-open) * 0.045));
      opacity: calc(1 - var(--wsv8-curtain-open) * 0.92);
    }

    /* Spun Champagne-Aluminum Inner Bezel */
    .wsv8-tv-bezel {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      min-height: 0;
      flex: 1 1 auto;
      border-radius: 19px;
      padding: 8px 10px 10px 10px;
      background: linear-gradient(180deg, #FAF5E8 0%, #E8DEC8 52%, #D7C7A8 100%);
      border: 1.5px solid #B59B70;
      box-shadow:
        inset 0 2px 0 #FFFDF7,
        inset 0 -2px 0 rgba(122, 92, 46, 0.32);
    }

    /* Chasing #11 2700K Incandescent Marquee Bulb Crown */
    .wsv8-marquee-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      background: linear-gradient(180deg, #6E3B23 0%, #4E2714 100%);
      box-shadow:
        inset 0 1px 3px rgba(32, 14, 4, 0.6),
        0 1px 0 #FFFDF7;
    }

    .wsv8-bulb {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: radial-gradient(circle at 38% 38%, #FFFDF5 0%, #FFD166 55%, #D9880F 100%);
      box-shadow:
        0 0 6px rgba(255, 209, 102, 0.92),
        0 0 12px rgba(242, 169, 34, 0.58);
      animation: wsv8MarqueeChase 0.78s ease-in-out infinite alternate;
    }

    .wsv8-bulb:nth-child(3n + 1) { animation-delay: 0s; }
    .wsv8-bulb:nth-child(3n + 2) { animation-delay: 0.26s; }
    .wsv8-bulb:nth-child(3n) { animation-delay: 0.52s; }

    @keyframes wsv8MarqueeChase {
      0% { opacity: 0.42; transform: scale(0.86); }
      100% { opacity: 1; transform: scale(1.12); }
    }

    /* Top Broadcast Control Header Rail */
    .wsv8-top-rail {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px 12px;
      padding: 4px 8px;
      border-radius: 12px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F2E7CE 100%);
      border: 1.5px solid #C8AA72;
      box-shadow: inset 0 1px 0 #FFFFFF;
    }

    .wsv8-on-air-cluster {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex-wrap: wrap;
    }

    .wsv8-on-air-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 11px;
      border-radius: 999px;
      background: linear-gradient(180deg, #D92B27 0%, #A31612 100%);
      color: #FFFDF7;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      box-shadow:
        0 2px 6px rgba(163, 22, 18, 0.35),
        inset 0 1px 0 rgba(255, 220, 214, 0.55);
    }

    .wsv8-tally-lamp {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #FFE5DF;
      box-shadow: 0 0 8px #FF9E94;
      animation: wsv8MarqueeChase 0.9s ease-in-out infinite alternate;
    }

    .wsv8-channel-tag {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #5C301B;
    }

    /* Tactile "Auto-Intro: ON/OFF" Toggle Pill (>= 48px Touch Target!) */
    .wsv8-autointro-pill {
      appearance: none;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 48px;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1.8px solid #B58B42;
      background: linear-gradient(180deg, #FFFDF7 0%, #EFE1C0 100%);
      color: #141B29;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.03em;
      cursor: pointer;
      box-shadow:
        0 2px 5px rgba(82, 44, 18, 0.16),
        inset 0 1px 0 #FFFFFF;
      transition: transform 0.12s ease, border-color 0.15s ease, background 0.15s ease;
    }

    .wsv8-autointro-pill:hover {
      border-color: #008B94;
      transform: translateY(-1px);
    }

    .wsv8-autointro-pill:focus-visible {
      outline: 3px solid #008B94;
      outline-offset: 2px;
    }

    .wsv8-autointro-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #16A34A;
      box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.25);
      transition: background 0.15s ease;
    }

    .wsv8-autointro-pill[aria-checked='false'] .wsv8-autointro-dot {
      background: #A37B4C;
      box-shadow: none;
    }

    /* ========================================================================
       CURVED 1966 RCA LIVING COLOR BROADCAST SCREEN APERTURE
       ======================================================================== */
    .wsv8-screen-well {
      position: relative;
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      width: 100%;
      aspect-ratio: 16 / 9;
      min-height: 310px;
      max-height: calc(100dvh - 210px);
      border-radius: 16px;
      padding: 4px;
      background: linear-gradient(145deg, #7A4424 0%, #522915 100%);
      box-shadow:
        inset 0 0 0 2px #D9A441,
        0 4px 14px rgba(68, 35, 16, 0.28);
      overflow: hidden;
    }

    .wsv8-screen-aperture {
      position: relative;
      flex: 1 1 auto;
      width: 100%;
      min-height: 100%;
      height: 100%;
      border-radius: 13px;
      overflow: hidden;
      background:
        radial-gradient(circle at 50% 42%, #FFF5DC 0%, #F4D58D 48%, #D99B38 100%);
      isolation: isolate;
    }

    /* Shared Painted 16:9 Gouache Stage Plate Styling */
    .wsv8-plate-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
      pointer-events: none;
      will-change: transform, opacity;
    }

    .wsv8-plate-img[data-plate-missing='true'] {
      opacity: 0 !important;
    }

    /* ========================================================================
       ACT 1 (0.00 - 0.22): ACADEMY 2-LEADER FLASH & IBC LIVING COLOR PEACOCK
       ======================================================================== */
    .wsv8-act {
      position: absolute;
      inset: 0;
      pointer-events: none;
      will-change: opacity, transform;
    }

    .wsv8-act--1 {
      opacity: var(--wsv8-act1-opacity);
      z-index: 4;
      background:
        radial-gradient(circle at 50% 62%, #FFF9E6 0%, #FCE097 38%, #008B94 78%, #1746A2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: clamp(12px, 2.5vw, 24px);
    }

    .wsv8-act1-plate {
      transform: scale(var(--wsv8-act1-plate-scale, 1.04));
      filter: saturate(1.12) contrast(1.03);
    }

    .wsv8-act1-sun-wash {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(
          180deg,
          rgba(255, 248, 228, 0.22) 0%,
          rgba(255, 232, 175, 0.12) 48%,
          rgba(98, 48, 20, 0.56) 100%
        );
    }

    .wsv8-act1-top-badge {
      position: relative;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 999px;
      background: rgba(255, 253, 247, 0.94);
      border: 2px solid #D9A441;
      color: #6E3B23;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(13px, 1.4vw, 15px);
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      box-shadow: 0 6px 18px rgba(68, 35, 16, 0.28);
    }

    .wsv8-peacock-stage {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1 1 auto;
      width: 100%;
      min-height: 0;
    }

    .wsv8-peacock-svg {
      width: min(370px, 68vw);
      max-height: 100%;
      height: auto;
      filter: drop-shadow(0 10px 24px rgba(68, 34, 14, 0.38));
    }

    .wsv8-peacock-svg--bloom-overlay {
      width: min(480px, 78vw);
      mix-blend-mode: screen;
      filter: none;
    }

    .wsv8-peacock-svg--compact {
      width: 138px;
      height: auto;
    }

    .wsv8-peacock-feather {
      transform-origin: 160px 156px;
      transform:
        rotate(calc(var(--feather-deg) * var(--wsv8-peacock-bloom)))
        scale(calc(0.55 + 0.45 * var(--wsv8-peacock-bloom)));
    }

    .wsv8-ibc-crest-card {
      position: relative;
      z-index: 2;
      width: min(720px, 96%);
      padding: clamp(8px, 1.3vw, 12px) clamp(14px, 2.4vw, 24px);
      border-radius: 16px;
      background: linear-gradient(180deg, rgba(255, 253, 247, 0.96) 0%, rgba(248, 236, 208, 0.95) 100%);
      border: 2.5px solid #D9A441;
      box-shadow:
        0 12px 28px rgba(58, 28, 12, 0.36),
        inset 0 0 0 1.5px #FFFDF7;
      text-align: center;
    }

    .wsv8-ibc-crest-kicker {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(13px, 1.45vw, 16px);
      font-weight: 900;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #008B94;
      margin: 0 0 3px 0;
    }

    .wsv8-ibc-crest-title {
      font-family: var(--ws7-font-display, 'Caprasimo', 'Fraunces', Georgia, serif);
      font-size: clamp(20px, 3.1vw, 36px);
      font-weight: 400;
      line-height: 1.1;
      letter-spacing: 0.02em;
      color: #6E3B23;
      text-shadow: 0 2px 0 #FFE6A3;
      margin: 0;
    }

    .wsv8-ibc-crest-sub {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(13px, 1.3vw, 14.5px);
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #8C3B19;
      margin: 4px 0 0 0;
    }

    /* Warm Parchment 0.35s SMPTE "2" Academy Leader Flash */
    .wsv8-academy-leader {
      position: absolute;
      inset: 0;
      z-index: 9;
      opacity: var(--wsv8-leader-opacity);
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(circle at 50% 50%, #FFF8E6 0%, #EFE0BE 62%, #D5BC8A 100%);
      pointer-events: none;
    }

    .wsv8-leader-dial {
      position: relative;
      width: min(250px, 56vmin);
      height: min(250px, 56vmin);
      border-radius: 50%;
      border: 4px solid #6E3B23;
      box-shadow:
        0 0 0 10px rgba(110, 59, 35, 0.14),
        inset 0 0 0 12px rgba(217, 164, 65, 0.28);
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        conic-gradient(
          from 0deg,
          rgba(242, 169, 34, 0.38) 0deg,
          rgba(242, 169, 34, 0.38) var(--wsv8-leader-sweep-deg),
          transparent var(--wsv8-leader-sweep-deg),
          transparent 360deg
        );
    }

    .wsv8-leader-cross-h,
    .wsv8-leader-cross-v {
      position: absolute;
      background: rgba(110, 59, 35, 0.45);
    }

    .wsv8-leader-cross-h {
      left: 0;
      right: 0;
      height: 2px;
      top: 50%;
      transform: translateY(-50%);
    }

    .wsv8-leader-cross-v {
      top: 0;
      bottom: 0;
      width: 2px;
      left: 50%;
      transform: translateX(-50%);
    }

    .wsv8-leader-num {
      position: relative;
      z-index: 2;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(72px, 14vmin, 128px);
      font-weight: 900;
      line-height: 1;
      color: #4E2714;
      text-shadow: 0 2px 0 #FFFDF7;
    }

    .wsv8-leader-stamp {
      position: absolute;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 14px;
      border-radius: 999px;
      background: #FFFDF7;
      border: 1.5px solid #8B4E2E;
      font-family: var(--ws7-font-mono, 'Michroma', 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #4E2714;
      white-space: nowrap;
    }

    /* ========================================================================
       ACT 2 (0.22 - 0.54): STUDIO 6A CAMERA CRANE PAN & TONIGHT'S SHOW FORMAT
       ======================================================================== */
    .wsv8-act--2 {
      opacity: var(--wsv8-act2-opacity);
      z-index: 5;
      background:
        radial-gradient(circle at 60% 35%, #FFE7A8 0%, #E8983A 46%, #7C3D1C 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: clamp(12px, 2.4vw, 24px);
    }

    .wsv8-act2-plate {
      transform:
        translate3d(var(--wsv8-crane-x), var(--wsv8-crane-y), 0)
        scale(var(--wsv8-crane-scale));
      filter: saturate(1.1) contrast(1.03);
    }

    .wsv8-act2-vignette {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(
          180deg,
          rgba(88, 42, 16, 0.24) 0%,
          rgba(255, 214, 128, 0.06) 45%,
          rgba(72, 34, 12, 0.62) 100%
        );
    }

    .wsv8-act2-crane-tag {
      position: relative;
      z-index: 2;
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(255, 253, 247, 0.94);
      border: 2px solid #D9A441;
      color: #141B29;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      box-shadow: 0 6px 18px rgba(58, 28, 12, 0.28);
    }

    /* Warm Cream & Peacock Teal Lower-Third Super-Title Card */
    .wsv8-lower-third {
      position: relative;
      z-index: 2;
      width: min(690px, 100%);
      align-self: flex-start;
      border-radius: 16px;
      overflow: hidden;
      background: linear-gradient(180deg, rgba(255, 253, 247, 0.96) 0%, rgba(247, 238, 219, 0.95) 100%);
      border: 2.5px solid #D9A441;
      box-shadow:
        0 16px 34px rgba(54, 25, 10, 0.42),
        inset 0 1px 0 #FFFFFF;
      transform: translate3d(0, calc((1 - var(--wsv8-act2-card, 1)) * 22px), 0);
    }

    .wsv8-lt-teal-crown {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 6px 12px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #008B94 0%, #006E78 65%, #1746A2 100%);
      color: #FFFDF7;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(13.5px, 1.5vw, 16px);
      font-weight: 900;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .wsv8-lt-body {
      padding: clamp(10px, 1.8vw, 16px) clamp(14px, 2.2vw, 20px);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .wsv8-lt-format-line {
      margin: 0;
      font-family: var(--ws7-font-display, 'Caprasimo', 'Fraunces', Georgia, serif);
      font-size: clamp(19px, 2.7vw, 31px);
      font-weight: 400;
      line-height: 1.15;
      color: #141B29;
      overflow-wrap: break-word;
    }

    .wsv8-lt-format-kicker {
      color: #D94E1F;
    }

    .wsv8-lt-sub-line {
      margin: 0;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(13px, 1.35vw, 15px);
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #6E3B23;
    }

    /* ========================================================================
       ACT 3 (0.54 - 0.80): SAUL BASS KINETIC COLOR-BLOCK STAR BILLING
       ======================================================================== */
    .wsv8-act--3 {
      opacity: var(--wsv8-act3-opacity);
      z-index: 6;
      background: linear-gradient(135deg, #FAF2DF 0%, #F4E4C1 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: clamp(10px, 2vw, 20px);
      overflow: hidden;
    }

    /* Angled Mid-Century Cut-Paper Geometric Planes */
    .wsv8-bass-planes {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .wsv8-bass-plane {
      position: absolute;
      will-change: transform;
    }

    .wsv8-bass-plane--gold {
      top: -12%;
      left: -8%;
      width: 58%;
      height: 125%;
      background: linear-gradient(160deg, #F5B731 0%, #E59816 100%);
      clip-path: polygon(0 0, 88% 0, 68% 100%, 0 100%);
      transform: translate3d(calc((1 - var(--wsv8-bass-slide)) * -18%), 0, 0);
    }

    .wsv8-bass-plane--teal {
      top: -12%;
      right: -8%;
      width: 60%;
      height: 125%;
      background: linear-gradient(160deg, #0098A3 0%, #00757F 100%);
      clip-path: polygon(24% 0, 100% 0, 100% 100%, 4% 100%);
      transform: translate3d(calc((1 - var(--wsv8-bass-slide)) * 18%), 0, 0);
    }

    .wsv8-bass-plane--tangerine {
      bottom: -14%;
      left: 22%;
      width: 56%;
      height: 46%;
      background: linear-gradient(180deg, #FF7542 0%, #E3501C 100%);
      clip-path: polygon(14% 0, 92% 8%, 100% 100%, 0 100%);
      transform: translate3d(0, calc((1 - var(--wsv8-bass-slide)) * 26%), 0);
    }

    .wsv8-bass-header {
      position: relative;
      z-index: 2;
      align-self: center;
      padding: 6px 18px;
      border-radius: 999px;
      background: #FFFDF7;
      border: 2px solid #6E3B23;
      box-shadow:
        0 4px 14px rgba(68, 35, 16, 0.22),
        0 0 0 2px #FFD166;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(13px, 1.4vw, 15px);
      font-weight: 900;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #141B29;
      text-align: center;
    }

    .wsv8-billing-grid {
      position: relative;
      z-index: 2;
      flex: 1 1 auto;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(10px, 2vw, 22px);
      align-items: center;
      width: min(940px, 100%);
      margin: auto;
      padding: 6px 0;
    }

    .wsv8-billing-card {
      display: flex;
      align-items: center;
      gap: clamp(10px, 1.6vw, 16px);
      padding: clamp(10px, 1.8vw, 16px);
      border-radius: 18px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F7EEDB 100%);
      border: 2.5px solid #6E3B23;
      box-shadow:
        0 12px 26px rgba(58, 28, 12, 0.28),
        0 0 0 2px #D9A441,
        inset 0 1px 0 #FFFFFF;
      min-width: 0;
    }

    .wsv8-billing-card--host {
      border-top: 6px solid #F2A922;
    }

    .wsv8-billing-card--rival {
      border-top: 6px solid #008B94;
    }

    .wsv8-billing-card--challenger {
      border-top: 6px solid #FF6B35;
    }

    /* 2x2 Painted Gouache Top-Left Quadrant Medallion */
    .wsv8-medallion-frame {
      flex: 0 0 auto;
      width: clamp(72px, 9.5vw, 108px);
      height: clamp(72px, 9.5vw, 108px);
      border-radius: 50%;
      padding: 4px;
      background: linear-gradient(145deg, #FFE6A3 0%, #D9A441 52%, #8B5E1A 100%);
      box-shadow:
        0 6px 16px rgba(68, 35, 16, 0.3),
        0 0 0 2.5px #6E3B23;
    }

    .wsv8-medallion-portrait {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #F5E9CE;
      background-size: 200% 200%;
      background-position: 0% 0%;
      background-repeat: no-repeat;
      box-shadow: inset 0 2px 6px rgba(58, 28, 12, 0.24);
    }

    .wsv8-billing-copy {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .wsv8-billing-kicker {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #007780;
    }

    .wsv8-billing-card--host .wsv8-billing-kicker {
      color: #9C5708;
    }

    .wsv8-billing-card--challenger .wsv8-billing-kicker {
      color: #C94114;
    }

    .wsv8-billing-name {
      margin: 0;
      font-family: var(--ws7-font-display, 'Caprasimo', 'Fraunces', Georgia, serif);
      font-size: clamp(18px, 2.3vw, 27px);
      font-weight: 400;
      line-height: 1.12;
      color: #141B29;
      overflow-wrap: break-word;
    }

    .wsv8-billing-title {
      margin: 0;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(13px, 1.3vw, 15px);
      font-weight: 700;
      line-height: 1.25;
      color: #5C301B;
      overflow-wrap: break-word;
    }

    .wsv8-host-mini-ribbon {
      position: relative;
      z-index: 2;
      align-self: center;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 5px 14px;
      border-radius: 999px;
      background: #FFFDF7;
      border: 2px solid #D9A441;
      box-shadow: 0 4px 12px rgba(58, 28, 12, 0.24);
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #141B29;
    }

    .wsv8-host-mini-portrait {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1.5px solid #6E3B23;
      background-color: #F5E9CE;
      background-size: 200% 200%;
      background-position: 0% 0%;
      background-repeat: no-repeat;
    }

    /* ========================================================================
       ACT 4 (0.80 - 1.00): GRAND KINETIC STARBURST TITLE LOCKUP & CURTAIN PART
       ======================================================================== */
    .wsv8-act--4 {
      opacity: var(--wsv8-act4-opacity);
      z-index: 7;
      background:
        radial-gradient(circle at 50% 48%, #FFF7DC 0%, #F7B733 44%, #D95326 82%, #7D3316 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(12px, 2.5vw, 24px);
    }

    .wsv8-act4-plate {
      opacity: 0.42;
      transform: scale(1.05);
      filter: saturate(1.18) brightness(1.06);
    }

    .wsv8-starburst-wrap {
      position: absolute;
      inset: -18%;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .wsv8-starburst-svg {
      width: min(760px, 120vmin);
      height: min(760px, 120vmin);
      transform: rotate(var(--wsv8-starburst-deg));
    }

    .wsv8-hero-lockup-arch {
      position: relative;
      z-index: 2;
      width: min(780px, 96%);
      padding: clamp(14px, 2.6vw, 26px) clamp(16px, 3vw, 34px);
      border-radius: 24px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F8EBD0 100%);
      border: 3px solid #6E3B23;
      box-shadow:
        0 18px 42px rgba(62, 28, 10, 0.42),
        0 0 0 4px #FFD166,
        inset 0 2px 0 #FFFFFF;
      text-align: center;
      transform: scale(var(--wsv8-lockup-scale, 1));
    }

    .wsv8-lockup-kicker {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 999px;
      background: linear-gradient(135deg, #008B94 0%, #006E78 100%);
      color: #FFFDF7;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(13px, 1.35vw, 15px);
      font-weight: 900;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .wsv8-lockup-heading {
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .wsv8-lockup-main-title {
      display: block;
      font-family: var(--ws7-font-display, 'Caprasimo', 'Fraunces', Georgia, serif);
      font-size: clamp(28px, 5.2vw, 58px);
      font-weight: 400;
      line-height: 1.03;
      letter-spacing: 0.015em;
      color: #6E3B23;
      text-shadow:
        0 3px 0 #FFD166,
        0 6px 16px rgba(110, 59, 35, 0.22);
    }

    .wsv8-lockup-sep {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }

    .wsv8-lockup-sub-banner {
      display: inline-block;
      padding: 6px 20px;
      border-radius: 10px;
      background: linear-gradient(180deg, #FF7542 0%, #E3501C 100%);
      border: 2px solid #FFF6E3;
      box-shadow: 0 4px 12px rgba(180, 56, 16, 0.34);
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(14px, 1.8vw, 20px);
      font-weight: 900;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: #FFFDF7;
    }

    /* Warm Velvet & Gold Curtain Wings Parting at 9.3s -> 10.0s */
    .wsv8-curtain-wing {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 52%;
      z-index: 8;
      pointer-events: none;
      opacity: calc(var(--wsv8-curtain-wing-alpha, 0));
      background:
        repeating-linear-gradient(
          90deg,
          #B8292F 0px,
          #9E1C22 18px,
          #C93B3B 36px
        );
      box-shadow: inset 0 0 32px rgba(62, 14, 12, 0.45);
    }

    .wsv8-curtain-wing--left {
      left: 0;
      border-right: 5px solid #FFD166;
      transform: translate3d(calc(var(--wsv8-curtain-open) * -105%), 0, 0);
    }

    .wsv8-curtain-wing--right {
      right: 0;
      border-left: 5px solid #FFD166;
      transform: translate3d(calc(var(--wsv8-curtain-open) * 105%), 0, 0);
    }

    /* Subtle Warm 1966 Telecine Film-Grain & Sunlight Glass Sheen */
    .wsv8-telecine-grain {
      position: absolute;
      inset: 0;
      z-index: 10;
      pointer-events: none;
      background:
        radial-gradient(circle at 22% 16%, rgba(255, 250, 232, 0.18) 0%, transparent 46%),
        repeating-linear-gradient(
          0deg,
          rgba(255, 244, 214, 0.035) 0px,
          rgba(255, 244, 214, 0.035) 1px,
          transparent 1px,
          transparent 3px
        );
    }

    /* ========================================================================
       BOTTOM PROGRESS BAR & TACTILE BRASS/CREAM ACTION DECK
       ======================================================================== */
    .wsv8-bottom-deck {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px 14px;
      padding: 6px 10px;
      border-radius: 13px;
      background: linear-gradient(180deg, #FFFDF7 0%, #F2E5C7 100%);
      border: 1.5px solid #C8AA72;
      box-shadow: inset 0 1px 0 #FFFFFF;
    }

    .wsv8-progress-cluster {
      flex: 1 1 220px;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .wsv8-progress-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #5C301B;
    }

    .wsv8-timecode {
      font-family: var(--ws7-font-mono, 'Michroma', 'Jost', sans-serif);
      font-size: 13px;
      font-weight: 700;
      color: #6E3B23;
    }

    .wsv8-progress-track {
      position: relative;
      width: 100%;
      height: 10px;
      border-radius: 999px;
      background: #E5D4B3;
      border: 1px solid #B59257;
      overflow: hidden;
      box-shadow: inset 0 1px 3px rgba(78, 42, 16, 0.22);
    }

    .wsv8-progress-fill {
      height: 100%;
      width: 100%;
      transform-origin: left center;
      transform: scaleX(var(--wsv8-progress));
      background: linear-gradient(90deg, #008B94 0%, #F2A922 52%, #FF6B35 100%);
      border-radius: 999px;
    }

    /* Tactile Brass/Cream SKIP INTRO & Atomic Tangerine DONE Buttons (>= 48px!) */
    .wsv8-skip-btn,
    .wsv8-done-btn {
      appearance: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      min-height: 48px;
      padding: 8px 20px;
      border-radius: 12px;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: 14.5px;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      white-space: nowrap;
      transition: transform 0.12s ease, box-shadow 0.15s ease, filter 0.15s ease;
    }

    .wsv8-skip-btn {
      background: linear-gradient(180deg, #FFFDF7 0%, #F4DFB0 55%, #E3BE74 100%);
      border: 2px solid #9E7024;
      color: #141B29;
      box-shadow:
        0 4px 10px rgba(82, 44, 16, 0.22),
        inset 0 1.5px 0 #FFFFFF;
    }

    .wsv8-done-btn {
      background: linear-gradient(180deg, #FF7B47 0%, #E8531E 100%);
      border: 2px solid #9E2F0B;
      color: #FFFDF7;
      box-shadow:
        0 5px 14px rgba(184, 58, 18, 0.34),
        inset 0 1.5px 0 rgba(255, 230, 214, 0.65);
    }

    .wsv8-skip-btn:hover,
    .wsv8-done-btn:hover {
      transform: translateY(-1.5px);
      filter: brightness(1.04);
    }

    .wsv8-skip-btn:active,
    .wsv8-done-btn:active {
      transform: translateY(1px);
    }

    .wsv8-skip-btn:focus-visible,
    .wsv8-done-btn:focus-visible {
      outline: 3px solid #008B94;
      outline-offset: 2px;
    }

    /* ========================================================================
       1966 PRIME-TIME CLOSING SUPER-TITLE CRAWL (play1966EndCreditsV8)
       ======================================================================== */
    .wsv8-credits-stage {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background:
        radial-gradient(circle at 50% 35%, #FFD782 0%, #C97A2B 52%, #6E3B23 100%);
    }

    .wsv8-credits-plate {
      transform: scale(var(--wsv8-credits-cam-scale, 1.06));
      filter: saturate(1.12) sepia(0.12) brightness(0.92);
    }

    /* Warm Golden-Hour Studio Applause Lighting Wash (High Contrast for #FFF6E3!) */
    .wsv8-credits-golden-wash {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 50% 18%, rgba(255, 214, 112, 0.34) 0%, transparent 58%),
        linear-gradient(
          180deg,
          rgba(92, 44, 16, 0.62) 0%,
          rgba(76, 35, 13, 0.66) 50%,
          rgba(64, 29, 10, 0.78) 100%
        );
    }

    .wsv8-credits-viewport {
      position: absolute;
      inset: 0;
      z-index: 3;
      overflow: hidden;
      display: flex;
      justify-content: center;
      padding: 0 clamp(12px, 3vw, 32px);
      mask-image: linear-gradient(
        180deg,
        transparent 0%,
        #000000 9%,
        #000000 91%,
        transparent 100%
      );
      -webkit-mask-image: linear-gradient(
        180deg,
        transparent 0%,
        #000000 9%,
        #000000 91%,
        transparent 100%
      );
    }

    .wsv8-credits-roll {
      width: min(780px, 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: clamp(18px, 2.8vh, 28px);
      padding: 36px 0 48px 0;
      text-align: center;
      transform: translate3d(0, var(--wsv8-credits-scroll-px), 0);
      will-change: transform;
    }

    .wsv8-credits-standings-plaque {
      width: 100%;
      padding: clamp(12px, 2vw, 20px);
      border-radius: 18px;
      background: rgba(94, 46, 20, 0.76);
      border: 2px solid #FFD166;
      box-shadow:
        0 12px 30px rgba(42, 18, 6, 0.48),
        inset 0 1px 0 rgba(255, 246, 227, 0.35);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }

    .wsv8-credits-kicker {
      margin: 0 0 6px 0;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(13px, 1.35vw, 15px);
      font-weight: 900;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: #FFD166;
      text-shadow: 0 2px 6px rgba(42, 18, 6, 0.85);
    }

    .wsv8-credits-standings-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .wsv8-credits-mini-medallion {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: 2.5px solid #FFD166;
      background-color: #F5E9CE;
      background-size: 200% 200%;
      background-position: 0% 0%;
      background-repeat: no-repeat;
      box-shadow: 0 4px 12px rgba(42, 18, 6, 0.5);
      flex: 0 0 auto;
    }

    .wsv8-credits-standings-headline {
      margin: 0;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(15px, 1.85vw, 20px);
      font-weight: 800;
      line-height: 1.35;
      color: #FFF6E3;
      text-shadow: 0 2px 8px rgba(42, 18, 6, 0.9);
    }

    .wsv8-credits-standings-vs {
      margin: 4px 0 0 0;
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(14px, 1.55vw, 17px);
      font-weight: 800;
      color: #FFD166;
      text-shadow: 0 2px 8px rgba(42, 18, 6, 0.9);
    }

    .wsv8-credit-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      max-width: 680px;
    }

    .wsv8-credit-role {
      font-family: var(--ws7-font-broadcast, 'Jost', sans-serif);
      font-size: clamp(13px, 1.3vw, 14.5px);
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #FFD166;
      text-shadow:
        0 2px 0 #3A1B0A,
        0 3px 10px rgba(42, 18, 6, 0.88);
    }

    .wsv8-credit-name {
      font-family: var(--ws7-font-display, 'Fraunces', 'Caprasimo', Georgia, serif);
      font-size: clamp(19px, 2.5vw, 29px);
      font-weight: 700;
      font-style: italic;
      line-height: 1.2;
      color: #FFF6E3;
      text-shadow:
        0 2px 0 #3A1B0A,
        0 4px 14px rgba(42, 18, 6, 0.92);
    }

    .wsv8-credit-sponsor-copy {
      font-family: var(--ws7-font-sans, 'Plus Jakarta Sans', 'Jost', sans-serif);
      font-size: clamp(14.5px, 1.6vw, 18px);
      font-weight: 700;
      font-style: italic;
      line-height: 1.38;
      color: #FFF6E3;
      text-shadow:
        0 2px 0 #3A1B0A,
        0 4px 12px rgba(42, 18, 6, 0.92);
    }

    .wsv8-credit-compliance {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      padding: 8px 16px;
      border-radius: 999px;
      background: rgba(94, 46, 20, 0.72);
      border: 1.5px solid rgba(255, 209, 102, 0.75);
    }

    .wsv8-credit-signoff-crest {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding-top: 6px;
    }

    .wsv8-signoff-title {
      font-family: var(--ws7-font-display, 'Caprasimo', 'Fraunces', Georgia, serif);
      font-size: clamp(20px, 2.8vw, 32px);
      font-weight: 400;
      letter-spacing: 0.04em;
      color: #FFF6E3;
      text-shadow:
        0 2px 0 #4E2714,
        0 4px 16px rgba(42, 18, 6, 0.92);
    }

    /* ========================================================================
       MOBILE PORTRAIT & COMPACT VIEWPORT ERGONOMICS (390x844 / 390x660)
       ======================================================================== */
    @media (max-width: 760px) {
      .wsv8-tv-console {
        padding: 7px 8px 9px 8px;
        border-radius: 20px;
      }

      .wsv8-tv-bezel {
        padding: 6px 7px 8px 7px;
        gap: 6px;
      }

      .wsv8-screen-well {
        aspect-ratio: auto;
        height: clamp(340px, 58dvh, 540px);
        min-height: clamp(340px, 58dvh, 540px);
      }

      /* Pan Studio 6A wide painting directly onto the Host & Contestant Podiums on Portrait phones
         and keep the lower-third compact in the bottom 32% so the cast shines unobstructed! */
      .wsv8-act2-plate {
        object-position: 86% 36% !important;
      }

      .wsv8-act--2 {
        padding: 8px 10px 10px 10px;
      }

      .wsv8-act2-crane-tag {
        padding: 4px 10px;
        font-size: 11.5px;
      }

      .wsv8-lower-third {
        border-radius: 12px;
      }

      .wsv8-lt-teal-crown {
        padding: 5px 10px;
        font-size: 11.5px;
        gap: 3px 8px;
      }

      .wsv8-lt-body {
        padding: 7px 11px 8px 11px;
        gap: 2px;
      }

      .wsv8-lt-format-line {
        font-size: 16.5px;
        line-height: 1.12;
      }

      .wsv8-lt-sub-line {
        font-size: 11.5px;
      }

      .wsv8-billing-grid {
        grid-template-columns: minmax(0, 1fr);
        gap: 10px;
      }

      .wsv8-medallion-frame {
        width: 68px;
        height: 68px;
      }

      .wsv8-bulb:nth-child(n + 13) {
        display: none;
      }
    }

    @media (max-height: 700px) and (max-width: 520px) {
      .wsv8-screen-well {
        min-height: 280px;
      }

      .wsv8-peacock-svg {
        width: min(240px, 60vw);
      }
    }

    .wsv8-intro-overlay[data-reduced-motion='true'] .wsv8-bulb,
    .wsv8-intro-overlay[data-reduced-motion='true'] .wsv8-tally-lamp,
    .wsv8-credits-overlay[data-reduced-motion='true'] .wsv8-bulb,
    .wsv8-credits-overlay[data-reduced-motion='true'] .wsv8-tally-lamp {
      animation: none !important;
    }
  `;
}

// ----------------------------------------------------------------------------
// 4. Deterministic 4-Act Intro Frame Renderer & QA Progress Scrubber
// ----------------------------------------------------------------------------

function resolveIntroOverlayElement(elOrContainer: HTMLElement | null | undefined): HTMLElement | null {
  if (!elOrContainer) return null;
  if (elOrContainer.classList?.contains('wsv8-intro-overlay')) {
    return elOrContainer;
  }
  return elOrContainer.querySelector?.<HTMLElement>('.wsv8-intro-overlay') ?? null;
}

function resolveCreditsOverlayElement(elOrContainer: HTMLElement | null | undefined): HTMLElement | null {
  if (!elOrContainer) return null;
  if (elOrContainer.classList?.contains('wsv8-credits-overlay')) {
    return elOrContainer;
  }
  return elOrContainer.querySelector?.<HTMLElement>('.wsv8-credits-overlay') ?? null;
}

function applyIntroVisualFrameAtProgress(
  overlay: HTMLElement,
  progress01: number,
  totalDurationMs: number,
): void {
  const p = clamp01(progress01);
  const reduced = overlay.dataset.reducedMotion === 'true';

  // 4 Choreographed Broadcast Acts across 0.00 .. 1.00:
  //   Beat 1: 0.00 - 0.22 (Academy 2-Leader Flash 0.00-0.035 + IBC Peacock ID)
  //   Beat 2: 0.22 - 0.54 (Studio 6A Camera Crane Pan & Tonight's Show Format)
  //   Beat 3: 0.54 - 0.80 (Saul Bass Kinetic Color-Block Star Billing)
  //   Beat 4: 0.80 - 1.00 (Grand Kinetic Starburst Title Lockup + 0.93-1.00 Curtain Reveal)
  const act: '1' | '2' | '3' | '4' =
    p < 0.22 ? '1' : p < 0.54 ? '2' : p < 0.8 ? '3' : '4';

  overlay.dataset.act = act;
  overlay.dataset.progress = p.toFixed(4);
  overlay.style.setProperty('--wsv8-progress', p.toFixed(4));

  // Leader flash: 0.000 -> 0.035 (0.0s -> 0.35s on 10s intro)
  const inLeader = !reduced && p < 0.035;
  overlay.dataset.leaderFlash = inLeader ? 'true' : 'false';
  const leaderOpacity = inLeader
    ? p < 0.026
      ? 1
      : 1 - (p - 0.026) / 0.009
    : 0;
  const leaderSweepDeg = inLeader ? (p / 0.035) * 360 : 360;
  overlay.style.setProperty('--wsv8-leader-opacity', clamp01(leaderOpacity).toFixed(3));
  overlay.style.setProperty('--wsv8-leader-sweep-deg', `${leaderSweepDeg.toFixed(1)}deg`);

  // Cross-dissolve act opacities cleanly
  const act1Opacity =
    p < 0.2
      ? 1
      : p < 0.24
        ? 1 - (p - 0.2) / 0.04
        : 0;
  const act2Opacity =
    p < 0.2
      ? 0
      : p < 0.24
        ? (p - 0.2) / 0.04
        : p < 0.52
          ? 1
          : p < 0.56
            ? 1 - (p - 0.52) / 0.04
            : 0;
  const act3Opacity =
    p < 0.52
      ? 0
      : p < 0.56
        ? (p - 0.52) / 0.04
        : p < 0.78
          ? 1
          : p < 0.82
            ? 1 - (p - 0.78) / 0.04
            : 0;
  const act4Opacity =
    p < 0.78
      ? 0
      : p < 0.82
        ? (p - 0.78) / 0.04
        : 1;

  overlay.style.setProperty('--wsv8-act1-opacity', clamp01(act1Opacity).toFixed(3));
  overlay.style.setProperty('--wsv8-act2-opacity', clamp01(act2Opacity).toFixed(3));
  overlay.style.setProperty('--wsv8-act3-opacity', clamp01(act3Opacity).toFixed(3));
  overlay.style.setProperty('--wsv8-act4-opacity', clamp01(act4Opacity).toFixed(3));

  // Beat 1: Blossoming SVG Peacock Feathers + Plate Scale
  const peacockBloom = reduced ? 1 : easeOutCubic((p - 0.03) / 0.12);
  const act1PlateScale = reduced ? 1.03 : lerp(1.02, 1.08, p / 0.22);
  overlay.style.setProperty('--wsv8-peacock-bloom', peacockBloom.toFixed(3));
  overlay.style.setProperty('--wsv8-act1-plate-scale', act1PlateScale.toFixed(3));

  // Beat 2: Studio 6A Camera Crane Pan & Lower-Third Entrance
  const t2 = clamp01((p - 0.22) / 0.32);
  const craneEased = easeInOutCubic(t2);
  const craneX = reduced ? 0 : lerp(3.2, -3.2, craneEased);
  const craneY = reduced ? 0 : lerp(1.4, -1.0, craneEased);
  const craneScale = reduced ? 1.04 : lerp(1.12, 1.04, craneEased);
  const act2Card = reduced ? 1 : easeOutCubic((p - 0.24) / 0.08);
  overlay.style.setProperty('--wsv8-crane-x', `${craneX.toFixed(2)}%`);
  overlay.style.setProperty('--wsv8-crane-y', `${craneY.toFixed(2)}%`);
  overlay.style.setProperty('--wsv8-crane-scale', craneScale.toFixed(3));
  overlay.style.setProperty('--wsv8-act2-card', act2Card.toFixed(3));

  // Beat 3: Saul Bass Kinetic Color-Block Slide-In
  const bassSlide = reduced ? 1 : easeOutCubic((p - 0.54) / 0.09);
  overlay.style.setProperty('--wsv8-bass-slide', bassSlide.toFixed(3));

  // Beat 4: Starburst Rotation + Curtain-Part Reveal Out (0.93 -> 1.00)
  const t4 = clamp01((p - 0.8) / 0.2);
  const starburstDeg = reduced ? 0 : t4 * 28;
  const lockupScale = reduced ? 1 : lerp(0.92, 1.0, easeOutCubic(t4 / 0.35));
  const inCurtainPart = p >= 0.93;
  const curtainOpen = inCurtainPart ? easeInOutCubic((p - 0.93) / 0.07) : 0;
  const curtainWingAlpha = p >= 0.91 ? clamp01((p - 0.91) / 0.025) : 0;

  overlay.dataset.curtainPart = inCurtainPart ? 'true' : 'false';
  overlay.style.setProperty('--wsv8-starburst-deg', `${starburstDeg.toFixed(1)}deg`);
  overlay.style.setProperty('--wsv8-lockup-scale', lockupScale.toFixed(3));
  overlay.style.setProperty('--wsv8-curtain-open', curtainOpen.toFixed(3));
  overlay.style.setProperty('--wsv8-curtain-wing-alpha', curtainWingAlpha.toFixed(3));

  // Live Act Status Label & Broadcast Timecode
  const actLabelEl = overlay.querySelector<HTMLElement>('[data-role="intro-act-label"]');
  if (actLabelEl) {
    actLabelEl.textContent =
      act === '1'
        ? 'ACT I · IBC LIVING COLOR ID'
        : act === '2'
          ? 'ACT II · STUDIO 6A CRANE'
          : act === '3'
            ? 'ACT III · STAR BILLING'
            : 'ACT IV · FIFTY MILLION WATCHING';
  }
  const timecodeEl = overlay.querySelector<HTMLElement>('[data-role="intro-timecode"]');
  if (timecodeEl) {
    const secTotal = totalDurationMs / 1000;
    const secNow = p * secTotal;
    timecodeEl.textContent = `${secNow.toFixed(1)}s / ${secTotal.toFixed(1)}s`;
  }
}

/**
 * Deterministic QA timestamp scrubber for `playBroadcastShowIntroV8` (`progress01` in `0..1`).
 * Accepts either the `.wsv8-intro-overlay` element or its host container.
 */
export function seekShowIntroProgressV8(
  elOrContainer: HTMLElement,
  progress01: number,
): void {
  const overlay = resolveIntroOverlayElement(elOrContainer);
  if (!overlay) return;
  const controller = introSeekControllersV8.get(overlay);
  if (controller) {
    controller(progress01);
    return;
  }
  const durationMs = Number(overlay.dataset.durationMs) || 10000;
  applyIntroVisualFrameAtProgress(overlay, progress01, durationMs);
}

export const applyBroadcastShowIntroProgressV8 = seekShowIntroProgressV8;

// ----------------------------------------------------------------------------
// 5. Deterministic End-Credits Crawl Frame Renderer & QA Scrubber
// ----------------------------------------------------------------------------

function applyEndCreditsVisualFrameAtProgress(
  overlay: HTMLElement,
  progress01: number,
  totalDurationMs: number,
): void {
  const p = clamp01(progress01);
  const reduced = overlay.dataset.reducedMotion === 'true';

  overlay.dataset.progress = p.toFixed(4);
  overlay.style.setProperty('--wsv8-progress', p.toFixed(4));
  overlay.style.setProperty(
    '--wsv8-peacock-bloom',
    reduced ? '1' : clamp01(0.55 + p * 0.45).toFixed(3),
  );
  overlay.style.setProperty(
    '--wsv8-credits-cam-scale',
    (reduced ? 1.03 : lerp(1.09, 1.01, p)).toFixed(3),
  );

  const viewportEl = overlay.querySelector<HTMLElement>('.wsv8-credits-viewport');
  const rollEl = overlay.querySelector<HTMLElement>('.wsv8-credits-roll');
  if (viewportEl && rollEl) {
    const vpHeight = viewportEl.clientHeight || 420;
    const rollHeight = rollEl.scrollHeight || 760;
    // Start with Tonight's Broadcast Standings prominently framed in the upper/mid viewport,
    // glide smoothly upward across 0.00 -> 0.88, and hold the IBC Sign-Off Crest centered at the end!
    const startOffsetPx = Math.round(vpHeight * 0.12);
    const endOffsetPx = -Math.max(0, Math.round(rollHeight - vpHeight * 0.82));
    const crawlT = clamp01(p / 0.88);
    const scrollPx = lerp(startOffsetPx, endOffsetPx, crawlT);
    overlay.style.setProperty('--wsv8-credits-scroll-px', `${scrollPx.toFixed(1)}px`);
  }

  const timecodeEl = overlay.querySelector<HTMLElement>('[data-role="credits-timecode"]');
  if (timecodeEl) {
    const secTotal = totalDurationMs / 1000;
    const secNow = p * secTotal;
    timecodeEl.textContent = `${secNow.toFixed(1)}s / ${secTotal.toFixed(1)}s`;
  }
}

/**
 * Deterministic QA timestamp scrubber for `play1966EndCreditsV8` (`progress01` in `0..1`).
 * Accepts either the `.wsv8-credits-overlay` element or its host container.
 */
export function seekEndCreditsProgressV8(
  elOrContainer: HTMLElement,
  progress01: number,
): void {
  const overlay = resolveCreditsOverlayElement(elOrContainer);
  if (!overlay) return;
  const controller = creditsSeekControllersV8.get(overlay);
  if (controller) {
    controller(progress01);
    return;
  }
  const durationMs = Number(overlay.dataset.durationMs) || 9500;
  applyEndCreditsVisualFrameAtProgress(overlay, progress01, durationMs);
}

export const applyEndCreditsProgressV8 = seekEndCreditsProgressV8;

/**
 * Universal QA harness timestamp seeker (`setGremlinLikeProgress(el, progress01)`):
 * scrubs whichever broadcast overlay (Opening Intro or End Credits) is mounted in `el`.
 */
export function setGremlinLikeProgress(
  elOrContainer: HTMLElement,
  progress01: number,
): void {
  const introEl = resolveIntroOverlayElement(elOrContainer);
  if (introEl) {
    seekShowIntroProgressV8(introEl, progress01);
    return;
  }
  const creditsEl = resolveCreditsOverlayElement(elOrContainer);
  if (creditsEl) {
    seekEndCreditsProgressV8(creditsEl, progress01);
  }
}

// ----------------------------------------------------------------------------
// 6. Main 10.0s 1966 Network Television Opening (`playBroadcastShowIntroV8`)
// ----------------------------------------------------------------------------

export function playBroadcastShowIntroV8(
  container: HTMLElement,
  opts: ShowBroadcastIntroOptsV8,
): Promise<ShowBroadcastIntroResultV8> {
  const ownerDoc =
    container?.ownerDocument ?? (typeof document !== 'undefined' ? document : undefined);
  ensureBroadcastIntroAndCreditsStylesV8(ownerDoc);

  const prevCleanup = container ? activeContainerCleanupsV8.get(container) : undefined;
  if (prevCleanup) {
    prevCleanup();
  }

  const preloadCast: CastIdV7[] = [opts.rivalCastId];
  if (opts.challengerCastId) {
    preloadCast.push(opts.challengerCastId);
  }
  preloadBroadcastIntroPlatesV8(preloadCast);

  const prefersReduced =
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const reduced = Boolean(opts.reducedMotion ?? prefersReduced);
  const totalDurationMs = Math.max(400, Math.round(opts.durationMs ?? 10000));

  const initialAutoIntro = isAutoPlayShowIntroEnabledV8();
  let currentAutoIntro = initialAutoIntro;

  const modeLabel = (opts.modeLabel || 'PRIME-TIME BROADCAST').trim();
  const crownModePrefix = modeLabel.toUpperCase().includes('STUDIO')
    ? modeLabel
    : `LIVE IN LIVING COLOR · ${modeLabel}`;
  const episodeSubtitle = (opts.episodeSubtitle || 'IBC STUDIO 6A · NEW YORK').trim();
  const boardFormatLabel = (opts.boardFormatLabel || 'CLASSIC 1966 TRILON TOTE').trim();
  const rivalName = (opts.rivalName || 'REIGNING CHAMPION').trim();
  const rivalTitle = (opts.rivalTitle || 'Undefeated Studio Champion').trim();
  const rivalPortraitUrl = resolvePaintedPortraitAssetV8(opts.rivalCastId);

  const hasChallenger = Boolean(opts.challengerName && opts.challengerName.trim().length > 0);
  const challengerName = (opts.challengerName || 'PODIUM 1 CHALLENGER').trim();
  const challengerPortraitUrl = resolvePaintedPortraitAssetV8(
    opts.challengerCastId ?? 'CARMEN_DELGADO',
  );

  const bulbsHtml = Array.from({ length: 20 }, () => '<span class="wsv8-bulb"></span>').join('');

  const starBillingBodyHtml = hasChallenger
    ? `
      <div class="wsv8-billing-grid" data-billing-mode="podium-duel">
        <article class="wsv8-billing-card wsv8-billing-card--challenger">
          <div class="wsv8-medallion-frame">
            <div class="wsv8-medallion-portrait"
                 data-cast-id="${escapeHtml(opts.challengerCastId ?? 'CARMEN_DELGADO')}"
                 style="background-image: url('${escapeHtml(challengerPortraitUrl)}'); background-size: 200% 200%; background-position: 0% 0%;"></div>
          </div>
          <div class="wsv8-billing-copy">
            <span class="wsv8-billing-kicker">PODIUM 1 · CHALLENGER</span>
            <h3 class="wsv8-billing-name">${escapeHtml(challengerName)}</h3>
            <p class="wsv8-billing-title">Live Studio Contender</p>
          </div>
        </article>

        <article class="wsv8-billing-card wsv8-billing-card--rival">
          <div class="wsv8-medallion-frame">
            <div class="wsv8-medallion-portrait"
                 data-cast-id="${escapeHtml(opts.rivalCastId)}"
                 style="background-image: url('${escapeHtml(rivalPortraitUrl)}'); background-size: 200% 200%; background-position: 0% 0%;"></div>
          </div>
          <div class="wsv8-billing-copy">
            <span class="wsv8-billing-kicker">PODIUM 2 · ${escapeHtml(rivalTitle)}</span>
            <h3 class="wsv8-billing-name">${escapeHtml(rivalName)}</h3>
            <p class="wsv8-billing-title">${escapeHtml(episodeSubtitle)}</p>
          </div>
        </article>
      </div>
      <div class="wsv8-host-mini-ribbon">
        <span class="wsv8-host-mini-portrait"
              data-cast-id="GRANT_BELLAMY"
              style="background-image: url('${GRANT_BELLAMY_PORTRAIT_SHEET_V8}'); background-size: 200% 200%; background-position: 0% 0%;"></span>
        <span>MASTER OF CEREMONIES · GRANT BELLAMY</span>
      </div>
    `
    : `
      <div class="wsv8-billing-grid" data-billing-mode="host-and-champion">
        <article class="wsv8-billing-card wsv8-billing-card--host">
          <div class="wsv8-medallion-frame">
            <div class="wsv8-medallion-portrait"
                 data-cast-id="GRANT_BELLAMY"
                 style="background-image: url('${GRANT_BELLAMY_PORTRAIT_SHEET_V8}'); background-size: 200% 200%; background-position: 0% 0%;"></div>
          </div>
          <div class="wsv8-billing-copy">
            <span class="wsv8-billing-kicker">MASTER OF CEREMONIES</span>
            <h3 class="wsv8-billing-name">GRANT BELLAMY</h3>
            <p class="wsv8-billing-title">Host of Studio 6A · Coast-to-Coast</p>
          </div>
        </article>

        <article class="wsv8-billing-card wsv8-billing-card--rival">
          <div class="wsv8-medallion-frame">
            <div class="wsv8-medallion-portrait"
                 data-cast-id="${escapeHtml(opts.rivalCastId)}"
                 style="background-image: url('${escapeHtml(rivalPortraitUrl)}'); background-size: 200% 200%; background-position: 0% 0%;"></div>
          </div>
          <div class="wsv8-billing-copy">
            <span class="wsv8-billing-kicker">TONIGHT'S CHAMPION</span>
            <h3 class="wsv8-billing-name">${escapeHtml(rivalName)}</h3>
            <p class="wsv8-billing-title">${escapeHtml(rivalTitle)}</p>
          </div>
        </article>
      </div>
    `;

  return new Promise<ShowBroadcastIntroResultV8>((resolve) => {
    if (!ownerDoc) {
      opts.onPlayIntroFanfare?.();
      opts.onPlayIntroVoice?.();
      resolve({ skipped: false });
      return;
    }

    let finished = false;
    let manualSeekLocked = false;
    let rafId: number | null = null;
    let heartbeatIntervalId: number | null = null;
    const timers: number[] = [];

    const overlay = ownerDoc.createElement('section');
    overlay.className = 'wsv8-intro-overlay';
    overlay.dataset.act = '1';
    overlay.dataset.durationMs = String(totalDurationMs);
    overlay.dataset.reducedMotion = reduced ? 'true' : 'false';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', "World's Smartest 1966 Network Television Opening");

    overlay.innerHTML = `
      <div class="wsv8-tv-console">
        <div class="wsv8-tv-bezel">
          <div class="wsv8-marquee-strip" aria-hidden="true">${bulbsHtml}</div>

          <header class="wsv8-top-rail">
            <div class="wsv8-on-air-cluster">
              <span class="wsv8-on-air-pill">
                <span class="wsv8-tally-lamp" aria-hidden="true"></span>
                <span>ON THE AIR</span>
              </span>
              <span class="wsv8-channel-tag">CH 6A · ${escapeHtml(episodeSubtitle)}</span>
            </div>

            <button type="button"
                    class="wsv8-autointro-pill"
                    role="switch"
                    data-action="toggle-auto-intro"
                    aria-checked="${currentAutoIntro ? 'true' : 'false'}"
                    aria-label="Toggle automatic 1966 opening title sequence">
              <span class="wsv8-autointro-dot" aria-hidden="true"></span>
              <span data-role="auto-intro-text">Auto-Intro: ${currentAutoIntro ? 'ON' : 'OFF'}</span>
            </button>
          </header>

          <div class="wsv8-screen-well">
            <div class="wsv8-screen-aperture">
              <!-- ACT 1 (0.00 - 0.22): Academy Leader Flash & IBC Living Color Peacock -->
              <div class="wsv8-act wsv8-act--1" data-intro-act="1">
                <img class="wsv8-plate-img wsv8-act1-plate"
                     src="${IBC_PEACOCK_TELEVISION_CITY_PLATE_V8}"
                     alt="1966 IBC Living Color Peacock-Starburst and Television City Plaza"
                     decoding="sync"
                     loading="eager"
                     draggable="false" />
                <div class="wsv8-act1-sun-wash" aria-hidden="true"></div>

                <div class="wsv8-act1-top-badge">
                  <span>COAST-TO-COAST COLOR TELECAST · MCMLXVI</span>
                </div>

                <div class="wsv8-peacock-stage">
                  ${renderLivingColorPeacockSvg(false)}
                </div>

                <div class="wsv8-ibc-crest-card">
                  <p class="wsv8-ibc-crest-kicker">THE FULL-COLOR NETWORK · TELEVISION CITY</p>
                  <h2 class="wsv8-ibc-crest-title">IBC TELEVISION NETWORK · PRESENTED IN LIVING COLOR</h2>
                  <p class="wsv8-ibc-crest-sub">${escapeHtml(episodeSubtitle)}</p>
                </div>

                <div class="wsv8-academy-leader" aria-hidden="true">
                  <div class="wsv8-leader-dial">
                    <span class="wsv8-leader-cross-h"></span>
                    <span class="wsv8-leader-cross-v"></span>
                    <span class="wsv8-leader-num">2</span>
                  </div>
                  <span class="wsv8-leader-stamp">IBC TELECINE · REEL 6A</span>
                </div>
              </div>

              <!-- ACT 2 (0.22 - 0.54): Studio 6A Camera Crane Pan & Tonight's Format -->
              <div class="wsv8-act wsv8-act--2" data-intro-act="2">
                <img class="wsv8-plate-img wsv8-act2-plate"
                     src="${STUDIO_6A_CAMERAS_MARQUEE_PLATE_V8}"
                     alt="1966 Sunlit Studio 6A Wide Crane Shot with TK-41 Color Cameras and Audience"
                     decoding="sync"
                     loading="eager"
                     draggable="false" />
                <div class="wsv8-act2-vignette" aria-hidden="true"></div>

                <div class="wsv8-act2-crane-tag">
                  <span>TK-41 COLOR CRANE A · APPLAUSE UP</span>
                </div>

                <div class="wsv8-lower-third">
                  <div class="wsv8-lt-teal-crown">
                    <span>${escapeHtml(crownModePrefix)}</span>
                    <span>${escapeHtml(episodeSubtitle)}</span>
                  </div>
                  <div class="wsv8-lt-body">
                    <h2 class="wsv8-lt-format-line">
                      <span class="wsv8-lt-format-kicker">TONIGHT'S FORMAT:</span>
                      ${escapeHtml(boardFormatLabel)}
                    </h2>
                    <p class="wsv8-lt-sub-line">IBC FULL-COLOR SOUNDSTAGE · FIFTY MILLION VIEWERS TUNED IN</p>
                  </div>
                </div>
              </div>

              <!-- ACT 3 (0.54 - 0.80): Saul Bass Kinetic Color-Block Star Billing -->
              <div class="wsv8-act wsv8-act--3" data-intro-act="3">
                <div class="wsv8-bass-planes" aria-hidden="true">
                  <div class="wsv8-bass-plane wsv8-bass-plane--gold"></div>
                  <div class="wsv8-bass-plane wsv8-bass-plane--teal"></div>
                  <div class="wsv8-bass-plane wsv8-bass-plane--tangerine"></div>
                </div>

                <div class="wsv8-bass-header">TONIGHT'S PRIME-TIME STAR BILLING</div>
                ${starBillingBodyHtml}
              </div>

              <!-- ACT 4 (0.80 - 1.00): Grand Kinetic Starburst Title Lockup & Curtain Part -->
              <div class="wsv8-act wsv8-act--4" data-intro-act="4">
                <img class="wsv8-plate-img wsv8-act4-plate"
                     src="${STUDIO_6A_CAMERAS_MARQUEE_PLATE_V8}"
                     alt=""
                     aria-hidden="true"
                     decoding="sync"
                     loading="eager"
                     draggable="false" />
                <div class="wsv8-starburst-wrap">
                  ${renderGrandStarburstSvg()}
                </div>

                <div class="wsv8-hero-lockup-arch">
                  <span class="wsv8-lockup-kicker">${escapeHtml(modeLabel)}</span>
                  <h1 class="wsv8-lockup-heading"><span class="wsv8-lockup-main-title">WORLD'S SMARTEST</span><span class="wsv8-lockup-sep"> · </span><span class="wsv8-lockup-sub-banner">FIFTY MILLION WATCHING</span></h1>
                </div>
              </div>

              <div class="wsv8-curtain-wing wsv8-curtain-wing--left" aria-hidden="true"></div>
              <div class="wsv8-curtain-wing wsv8-curtain-wing--right" aria-hidden="true"></div>
              <div class="wsv8-telecine-grain" aria-hidden="true"></div>
            </div>
          </div>

          <footer class="wsv8-bottom-deck">
            <div class="wsv8-progress-cluster">
              <div class="wsv8-progress-meta">
                <span data-role="intro-act-label">ACT I · IBC LIVING COLOR ID</span>
                <span class="wsv8-timecode" data-role="intro-timecode">0.0s / ${(totalDurationMs / 1000).toFixed(1)}s</span>
              </div>
              <div class="wsv8-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                <div class="wsv8-progress-fill"></div>
              </div>
            </div>

            <button type="button"
                    class="wsv8-skip-btn"
                    data-action="skip-show-intro"
                    aria-label="Skip Intro">
              <span>SKIP INTRO</span>
              ${renderPlayTriangleSvg('#141B29')}
            </button>
          </footer>
        </div>
      </div>
    `;

    attachGracefulPlateFallback(overlay);

    const autoIntroBtn = overlay.querySelector<HTMLButtonElement>('[data-action="toggle-auto-intro"]');
    const autoIntroTextEl = overlay.querySelector<HTMLElement>('[data-role="auto-intro-text"]');
    const skipBtn = overlay.querySelector<HTMLButtonElement>('[data-action="skip-show-intro"]');

    const stopAutoTimers = (): void => {
      if (rafId !== null && typeof window !== 'undefined') {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (heartbeatIntervalId !== null && typeof window !== 'undefined') {
        window.clearInterval(heartbeatIntervalId);
        heartbeatIntervalId = null;
      }
      for (const t of timers) {
        if (typeof window !== 'undefined') window.clearTimeout(t);
      }
      timers.length = 0;
    };

    introSeekControllersV8.set(overlay, (progress01: number) => {
      manualSeekLocked = true;
      stopAutoTimers();
      applyIntroVisualFrameAtProgress(overlay, progress01, totalDurationMs);
    });

    const cleanup = (): void => {
      stopAutoTimers();
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', onKeyDown);
      }
      introSeekControllersV8.delete(overlay);
      if (container && activeContainerCleanupsV8.get(container) === preemptFinish) {
        activeContainerCleanupsV8.delete(container);
      }
      overlay.remove();
    };

    const finishWith = (skipped: boolean): void => {
      if (finished) return;
      finished = true;
      if (skipped) {
        opts.onStopIntroAudio?.();
      }
      cleanup();
      const autoPlayToggled = currentAutoIntro !== initialAutoIntro ? true : undefined;
      resolve(autoPlayToggled ? { skipped, autoPlayToggled: true } : { skipped });
    };

    const preemptFinish = (): void => {
      finishWith(true);
    };

    const onKeyDown = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        finishWith(true);
        return;
      }
      if (ev.key === ' ' || ev.key === 'Enter') {
        if (ev.target === autoIntroBtn) {
          return;
        }
        ev.preventDefault();
        finishWith(true);
      }
    };

    autoIntroBtn?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      currentAutoIntro = !currentAutoIntro;
      setAutoPlayShowIntroEnabledV8(currentAutoIntro);
      autoIntroBtn.setAttribute('aria-checked', currentAutoIntro ? 'true' : 'false');
      if (autoIntroTextEl) {
        autoIntroTextEl.textContent = `Auto-Intro: ${currentAutoIntro ? 'ON' : 'OFF'}`;
      }
    });

    skipBtn?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      finishWith(true);
    });

    if (container && typeof container.appendChild === 'function') {
      activeContainerCleanupsV8.set(container, preemptFinish);
      container.appendChild(overlay);
    }

    // Initial t=0ms frame & Brass Fanfare cue
    applyIntroVisualFrameAtProgress(overlay, 0, totalDurationMs);
    opts.onPlayIntroFanfare?.();

    if (typeof window === 'undefined') {
      opts.onPlayIntroVoice?.();
      finishWith(false);
      return;
    }

    window.addEventListener('keydown', onKeyDown);
    skipBtn?.focus({ preventScroll: true });

    // t=280ms Studio Booth Announcer Intro Voice cue
    timers.push(
      window.setTimeout(() => {
        if (!finished) {
          opts.onPlayIntroVoice?.();
        }
      }, 280),
    );

    const startTs = performance.now();
    const advanceAtNow = (now: number): boolean => {
      if (finished || manualSeekLocked) return false;
      if (!overlay.isConnected && container?.isConnected) {
        finishWith(true);
        return false;
      }
      const elapsed = Math.max(0, now - startTs);
      const progress01 = Math.min(1, elapsed / totalDurationMs);
      applyIntroVisualFrameAtProgress(overlay, progress01, totalDurationMs);
      if (progress01 >= 1) {
        finishWith(false);
        return false;
      }
      return true;
    };

    const tick = (now: number): void => {
      if (advanceAtNow(now)) {
        rafId = window.requestAnimationFrame(tick);
      }
    };
    rafId = window.requestAnimationFrame(tick);
    heartbeatIntervalId = window.setInterval(() => {
      advanceAtNow(performance.now());
    }, 50);

    timers.push(
      window.setTimeout(() => {
        if (!manualSeekLocked) {
          finishWith(false);
        }
      }, totalDurationMs + 80),
    );
  });
}

// ----------------------------------------------------------------------------
// 7. 1966 Prime-Time Closing Credits Crawl (`play1966EndCreditsV8`)
// ----------------------------------------------------------------------------

export function play1966EndCreditsV8(
  container: HTMLElement,
  opts: ShowEndCreditsOptsV8,
): Promise<void> {
  const ownerDoc =
    container?.ownerDocument ?? (typeof document !== 'undefined' ? document : undefined);
  ensureBroadcastIntroAndCreditsStylesV8(ownerDoc);

  const prevCleanup = container ? activeContainerCleanupsV8.get(container) : undefined;
  if (prevCleanup) {
    prevCleanup();
  }

  preloadBroadcastIntroPlatesV8([opts.rivalCastId]);

  const prefersReduced =
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const reduced = Boolean(opts.reducedMotion ?? prefersReduced);
  const totalDurationMs = Math.max(400, Math.round(opts.durationMs ?? 9500));

  const modeLabel = (opts.modeLabel || 'STUDIO 6A PRIME-TIME TELECAST').trim();
  const playerName = (opts.playerName || 'CHALLENGER').trim();
  const rivalName = (opts.rivalName || 'CHAMPION').trim();
  const playerCash = Math.max(0, Math.round(opts.playerCash || 0));
  const rivalCash = Math.max(0, Math.round(opts.rivalCash || 0));
  const accuracyPct = Math.max(0, Math.min(100, Math.round(opts.accuracyPct || 0)));
  const bestStreak = Math.max(0, Math.round(opts.bestStreakInMatch || 0));
  const rivalPortraitUrl = resolvePaintedPortraitAssetV8(opts.rivalCastId);

  const championStatusPrefix = opts.didWin
    ? 'NEW / RETURNING CHAMPION'
    : 'HONORABLE CHALLENGER';
  const playerSummaryLine = `${championStatusPrefix}: ${playerName} — $${playerCash.toLocaleString()} · ${accuracyPct}% ACCURACY · ${bestStreak}× STREAK`;
  const rivalSummaryLine = `vs ${rivalName} — $${rivalCash.toLocaleString()}`;
  const bulbsHtml = Array.from({ length: 20 }, () => '<span class="wsv8-bulb"></span>').join('');

  return new Promise<void>((resolve) => {
    if (!ownerDoc) {
      opts.onPlayCreditsTheme?.();
      opts.onPlaySignoffVoice?.();
      resolve();
      return;
    }

    let finished = false;
    let manualSeekLocked = false;
    let rafId: number | null = null;
    let heartbeatIntervalId: number | null = null;
    const timers: number[] = [];

    const overlay = ownerDoc.createElement('section');
    overlay.className = 'wsv8-credits-overlay';
    overlay.dataset.durationMs = String(totalDurationMs);
    overlay.dataset.reducedMotion = reduced ? 'true' : 'false';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', "World's Smartest 1966 Closing Broadcast Credits");

    overlay.innerHTML = `
      <div class="wsv8-tv-console">
        <div class="wsv8-tv-bezel">
          <div class="wsv8-marquee-strip" aria-hidden="true">${bulbsHtml}</div>

          <header class="wsv8-top-rail">
            <div class="wsv8-on-air-cluster">
              <span class="wsv8-on-air-pill">
                <span class="wsv8-tally-lamp" aria-hidden="true"></span>
                <span>SIGN-OFF REEL</span>
              </span>
              <span class="wsv8-channel-tag">${escapeHtml(modeLabel)} · IBC STUDIO 6A</span>
            </div>
            <span class="wsv8-channel-tag">GOOD NIGHT FROM TELEVISION CITY</span>
          </header>

          <div class="wsv8-screen-well">
            <div class="wsv8-screen-aperture">
              <div class="wsv8-credits-stage">
                <img class="wsv8-plate-img wsv8-credits-plate"
                     src="${STUDIO_6A_CAMERAS_MARQUEE_PLATE_V8}"
                     alt="Studio 6A Golden-Hour Applause Wide Crane Shot"
                     decoding="sync"
                     loading="eager"
                     draggable="false" />
                <div class="wsv8-credits-golden-wash" aria-hidden="true"></div>

                <div class="wsv8-credits-viewport">
                  <div class="wsv8-credits-roll">
                    <!-- 1. TONIGHT'S BROADCAST STANDINGS -->
                    <section class="wsv8-credits-standings-plaque">
                      <p class="wsv8-credits-kicker">TONIGHT'S BROADCAST STANDINGS</p>
                      <div class="wsv8-credits-standings-row">
                        <div class="wsv8-credits-mini-medallion"
                             data-cast-id="${escapeHtml(opts.rivalCastId)}"
                             style="background-image: url('${escapeHtml(rivalPortraitUrl)}'); background-size: 200% 200%; background-position: 0% 0%;"></div>
                        <div>
                          <p class="wsv8-credits-standings-headline">${escapeHtml(playerSummaryLine)}</p>
                          <p class="wsv8-credits-standings-vs">${escapeHtml(rivalSummaryLine)}</p>
                        </div>
                      </div>
                    </section>

                    <!-- 2. STARRING MASTER OF CEREMONIES -->
                    <div class="wsv8-credit-block">
                      <span class="wsv8-credit-role">STARRING MASTER OF CEREMONIES</span>
                      <div class="wsv8-credits-standings-row">
                        <span class="wsv8-host-mini-portrait"
                              data-cast-id="GRANT_BELLAMY"
                              style="background-image: url('${GRANT_BELLAMY_PORTRAIT_SHEET_V8}'); background-size: 200% 200%; background-position: 0% 0%;"></span>
                        <span class="wsv8-credit-name">Grant Bellamy</span>
                      </div>
                    </div>

                    <!-- 3. STUDIO 6A BOOTH ANNOUNCER -->
                    <div class="wsv8-credit-block">
                      <span class="wsv8-credit-role">STUDIO 6A BOOTH ANNOUNCER</span>
                      <span class="wsv8-credit-name">Johnny Pardo</span>
                    </div>

                    <!-- 4. ORCHESTRA & TIJUANA BRASS -->
                    <div class="wsv8-credit-block">
                      <span class="wsv8-credit-role">ORCHESTRA &amp; TIJUANA BRASS</span>
                      <span class="wsv8-credit-name">Conducted by Milton DeLugg</span>
                    </div>

                    <!-- 5. EXECUTIVE PRODUCTION -->
                    <div class="wsv8-credit-block">
                      <span class="wsv8-credit-role">EXECUTIVE PRODUCTION</span>
                      <span class="wsv8-credit-name">Goodson-Griffin-6A Television Associates</span>
                    </div>

                    <!-- 6. CONTESTANT ACCOMMODATIONS & CONSOLATION PRIZES -->
                    <div class="wsv8-credit-block">
                      <span class="wsv8-credit-role">CONTESTANT ACCOMMODATIONS &amp; CONSOLATION PRIZES</span>
                      <span class="wsv8-credit-sponsor-copy">Furnished by The Beverly Continental Motor Hotel, Sunbeam Vista Appliances &amp; Polaroid Color-Pack Cameras</span>
                    </div>

                    <!-- 7. COMPLIANCE SEAL -->
                    <div class="wsv8-credit-block">
                      <span class="wsv8-credit-role">COMPLIANCE SEAL</span>
                      <div class="wsv8-credit-compliance">
                        ${renderComplianceSealSvg()}
                        <span class="wsv8-credit-sponsor-copy">Monitored Live by IBC Standards &amp; Practices (Title 47 U.S.C. § 509)</span>
                      </div>
                    </div>

                    <!-- 8. CLOSING SIGN-OFF CREST -->
                    <div class="wsv8-credit-signoff-crest">
                      <span class="wsv8-credit-role">CLOSING SIGN-OFF CREST</span>
                      ${renderLivingColorPeacockSvg(true)}
                      <div class="wsv8-signoff-title">IBC TELEVISION CITY · IN LIVING COLOR · MCMLXVI</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="wsv8-telecine-grain" aria-hidden="true"></div>
            </div>
          </div>

          <footer class="wsv8-bottom-deck">
            <div class="wsv8-progress-cluster">
              <div class="wsv8-progress-meta">
                <span>CLOSING BROADCAST CREDITS · STUDIO 6A</span>
                <span class="wsv8-timecode" data-role="credits-timecode">0.0s / ${(totalDurationMs / 1000).toFixed(1)}s</span>
              </div>
              <div class="wsv8-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                <div class="wsv8-progress-fill"></div>
              </div>
            </div>

            <button type="button"
                    class="wsv8-done-btn"
                    data-action="done-end-credits"
                    aria-label="Done, Back to Studio">
              <span>DONE · BACK TO STUDIO</span>
              ${renderPlayTriangleSvg('#FFFDF7')}
            </button>
          </footer>
        </div>
      </div>
    `;

    attachGracefulPlateFallback(overlay);

    const doneBtn = overlay.querySelector<HTMLButtonElement>('[data-action="done-end-credits"]');

    const stopAutoTimers = (): void => {
      if (rafId !== null && typeof window !== 'undefined') {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (heartbeatIntervalId !== null && typeof window !== 'undefined') {
        window.clearInterval(heartbeatIntervalId);
        heartbeatIntervalId = null;
      }
      for (const t of timers) {
        if (typeof window !== 'undefined') window.clearTimeout(t);
      }
      timers.length = 0;
    };

    creditsSeekControllersV8.set(overlay, (progress01: number) => {
      manualSeekLocked = true;
      stopAutoTimers();
      applyEndCreditsVisualFrameAtProgress(overlay, progress01, totalDurationMs);
    });

    const cleanup = (): void => {
      stopAutoTimers();
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', onKeyDown);
      }
      creditsSeekControllersV8.delete(overlay);
      if (container && activeContainerCleanupsV8.get(container) === finish) {
        activeContainerCleanupsV8.delete(container);
      }
      overlay.remove();
    };

    const finish = (): void => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve();
    };

    const onKeyDown = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape' || ev.key === ' ' || ev.key === 'Enter') {
        ev.preventDefault();
        finish();
      }
    };

    doneBtn?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      finish();
    });

    if (container && typeof container.appendChild === 'function') {
      activeContainerCleanupsV8.set(container, finish);
      container.appendChild(overlay);
    }

    // Initial t=0ms frame & Closing Showband Theme cue
    applyEndCreditsVisualFrameAtProgress(overlay, 0, totalDurationMs);
    opts.onPlayCreditsTheme?.();

    if (typeof window === 'undefined') {
      opts.onPlaySignoffVoice?.();
      finish();
      return;
    }

    window.addEventListener('keydown', onKeyDown);
    doneBtn?.focus({ preventScroll: true });

    // t=350ms Studio Sign-Off Voice cue
    timers.push(
      window.setTimeout(() => {
        if (!finished) {
          opts.onPlaySignoffVoice?.();
        }
      }, 350),
    );

    const startTs = performance.now();
    const advanceAtNow = (now: number): boolean => {
      if (finished || manualSeekLocked) return false;
      if (!overlay.isConnected && container?.isConnected) {
        finish();
        return false;
      }
      const elapsed = Math.max(0, now - startTs);
      const progress01 = Math.min(1, elapsed / totalDurationMs);
      applyEndCreditsVisualFrameAtProgress(overlay, progress01, totalDurationMs);
      if (progress01 >= 1) {
        finish();
        return false;
      }
      return true;
    };

    const tick = (now: number): void => {
      if (advanceAtNow(now)) {
        rafId = window.requestAnimationFrame(tick);
      }
    };
    rafId = window.requestAnimationFrame(tick);
    heartbeatIntervalId = window.setInterval(() => {
      advanceAtNow(performance.now());
    }, 50);

    timers.push(
      window.setTimeout(() => {
        if (!manualSeekLocked) {
          finish();
        }
      }, totalDurationMs + 80),
    );
  });
}
