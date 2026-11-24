// ============================================================================
// WORLD'S SMARTEST v5.0 — Tactile Sculpted SVG & DOM Craft Library
// Strictly typed against `src/v5/contracts_v5.ts` & `src/v4/contracts.ts`
// Zero OS Color Emojis · Collision-Free Unique Gradient IDs · 100% Pure SVG
// ============================================================================

import type { TileTwistKind, WedgeColorId } from '../v4/contracts';
import type { DialogueAttitudeV5, PodiumCharmSpecV5 } from './contracts_v5';

export type LuckyCharmEmblemKindV5 = PodiumCharmSpecV5['svgEmblemKind'];

export type TwistEmblemInputV5 =
  | TileTwistKind
  | 'TIME_BOMB'
  | 'WHEEL'
  | 'BOUNTY'
  | 'POWER_PLAY'
  | 'WEDGE';

let _svgUidCounter = 0;

function uid(prefix: string): string {
  _svgUidCounter = (_svgUidCounter + 1) & 0x7fffffff;
  return `v5_${prefix}_${_svgUidCounter}`;
}

function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function annularWedgePath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number,
): string {
  const oStart = polarToCartesian(cx, cy, rOuter, startDeg);
  const oEnd = polarToCartesian(cx, cy, rOuter, endDeg);
  const iEnd = polarToCartesian(cx, cy, rInner, endDeg);
  const iStart = polarToCartesian(cx, cy, rInner, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${oStart.x.toFixed(2)} ${oStart.y.toFixed(2)}`,
    `A ${rOuter.toFixed(2)} ${rOuter.toFixed(2)} 0 ${largeArc} 1 ${oEnd.x.toFixed(2)} ${oEnd.y.toFixed(2)}`,
    `L ${iEnd.x.toFixed(2)} ${iEnd.y.toFixed(2)}`,
    `A ${rInner.toFixed(2)} ${rInner.toFixed(2)} 0 ${largeArc} 0 ${iStart.x.toFixed(2)} ${iStart.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// ============================================================================
// 1. SIX-WEDGE JEWEL CHAMPIONSHIP MEDALLION (mockup_v5_game_board centerpiece)
// ============================================================================

interface WedgeJewelPalette {
  readonly id: WedgeColorId;
  readonly label: string;
  readonly startDeg: number;
  readonly endDeg: number;
  readonly hi: string;
  readonly mid: string;
  readonly deep: string;
  readonly rim: string;
}

const SIX_WEDGE_LAYOUT: readonly WedgeJewelPalette[] = [
  {
    id: 'EMERALD_SCIENCE',
    label: 'Science',
    startDeg: -147,
    endDeg: -93,
    hi: '#a8ffd6',
    mid: '#1fd67d',
    deep: '#075c34',
    rim: '#62f5b1',
  },
  {
    id: 'MAGENTA_POP',
    label: 'Entertainment',
    startDeg: -87,
    endDeg: -33,
    hi: '#ffb8d4',
    mid: '#e82d74',
    deep: '#6b0a2f',
    rim: '#ff7db0',
  },
  {
    id: 'GOLD_HISTORY',
    label: 'History',
    startDeg: -27,
    endDeg: 27,
    hi: '#fff5b8',
    mid: '#f0b429',
    deep: '#7d4d07',
    rim: '#ffe17a',
  },
  {
    id: 'ORANGE_SPORTS',
    label: 'Sports & Logic',
    startDeg: 33,
    endDeg: 87,
    hi: '#ffd5a8',
    mid: '#f57722',
    deep: '#782c05',
    rim: '#ffb06b',
  },
  {
    id: 'SAPPHIRE_GEO',
    label: 'Geography',
    startDeg: 93,
    endDeg: 147,
    hi: '#b5e8ff',
    mid: '#1f8cff',
    deep: '#073578',
    rim: '#6ecaff',
  },
  {
    id: 'VIOLET_ARTS',
    label: 'Arts & Culture',
    startDeg: 153,
    endDeg: 207,
    hi: '#e4ccff',
    mid: '#9b59f6',
    deep: '#3f157a',
    rim: '#c89eff',
  },
];

/**
 * Renders the circular brushed-brass & sapphire 6-Wedge Jewel Championship
 * Medallion matching `mockup_v5_game_board_1795482505080.jpg`.
 */
export function renderSixWedgeMedallionSvg(
  earnedWedges: readonly WedgeColorId[],
  sizePx = 112,
): string {
  const earnedSet = new Set<WedgeColorId>(earnedWedges);
  const earnedCount = earnedSet.size;
  const px = Math.max(36, Math.round(sizePx));

  const gBrass = uid('wm_brass');
  const gRim = uid('wm_rim');
  const gSapphire = uid('wm_saph');
  const gEmpty = uid('wm_empty');
  const gHub = uid('wm_hub');
  const gHalo = uid('wm_halo');

  const sliceDefs: string[] = [];
  const sliceMarkup: string[] = [];

  for (const spec of SIX_WEDGE_LAYOUT) {
    const isLit = earnedSet.has(spec.id);
    const midDeg = (spec.startDeg + spec.endDeg) / 2;
    const outerPath = annularWedgePath(60, 60, 10.5, 42.5, spec.startDeg, spec.endDeg);

    if (isLit) {
      const gJewel = uid('wm_j');
      const gFacet = uid('wm_f');
      const hiPt = polarToCartesian(60, 60, 29, spec.startDeg + 14);
      const innerFacet = annularWedgePath(60, 60, 14.5, 36.5, spec.startDeg + 6, spec.endDeg - 6);
      const glintStart = polarToCartesian(60, 60, 39, spec.startDeg + 8);
      const glintEnd = polarToCartesian(60, 60, 39, midDeg + 5);
      const ridgeTip = polarToCartesian(60, 60, 42, midDeg);
      const ridgeBase = polarToCartesian(60, 60, 11, midDeg);

      sliceDefs.push(`
        <radialGradient id="${gJewel}" cx="${(hiPt.x / 120).toFixed(3)}" cy="${(hiPt.y / 120).toFixed(3)}" r="0.44">
          <stop offset="0%" stop-color="${spec.hi}" />
          <stop offset="46%" stop-color="${spec.mid}" />
          <stop offset="100%" stop-color="${spec.deep}" />
        </radialGradient>
        <linearGradient id="${gFacet}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.58" />
          <stop offset="55%" stop-color="${spec.rim}" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.34" />
        </linearGradient>
      `);

      sliceMarkup.push(`
        <g data-v5-wedge="${spec.id}" data-earned="true">
          <path d="${outerPath}" fill="url(#${gJewel})" stroke="${spec.rim}" stroke-width="1.35" />
          <path d="${innerFacet}" fill="url(#${gFacet})" stroke="#ffffff" stroke-opacity="0.32" stroke-width="0.7" />
          <line x1="${ridgeBase.x.toFixed(2)}" y1="${ridgeBase.y.toFixed(2)}" x2="${ridgeTip.x.toFixed(2)}" y2="${ridgeTip.y.toFixed(2)}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.9" />
          <path d="M ${glintStart.x.toFixed(2)} ${glintStart.y.toFixed(2)} A 39 39 0 0 1 ${glintEnd.x.toFixed(2)} ${glintEnd.y.toFixed(2)}" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-opacity="0.78" />
        </g>
      `);
    } else {
      sliceMarkup.push(`
        <g data-v5-wedge="${spec.id}" data-earned="false">
          <path d="${outerPath}" fill="url(#${gEmpty})" stroke="#5c3b15" stroke-width="1.15" />
          <path d="${annularWedgePath(60, 60, 14, 38.5, spec.startDeg + 4, spec.endDeg - 4)}" fill="none" stroke="#0d0703" stroke-opacity="0.7" stroke-width="1.1" />
        </g>
      `);
    }
  }

  const haloOpacity = (0.18 + (earnedCount / 6) * 0.54).toFixed(2);
  const rivetAngles = [0, 90, 180, 270];
  const rivets = rivetAngles
    .map((deg) => {
      const p = polarToCartesian(60, 60, 52.5, deg);
      return `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="2.2" fill="#fff3b5" stroke="#5b3408" stroke-width="0.8" />`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${px}" height="${px}" class="v5-svg-wedge-medallion" role="img" aria-label="${earnedCount} of 6 Championship Wedges Earned">
  <defs>
    <radialGradient id="${gHalo}" cx="50%" cy="50%" r="50%">
      <stop offset="56%" stop-color="#ffd966" stop-opacity="${haloOpacity}" />
      <stop offset="86%" stop-color="#f59e0b" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="${gBrass}" x1="12%" y1="6%" x2="88%" y2="94%">
      <stop offset="0%" stop-color="#fff5c4" />
      <stop offset="28%" stop-color="#e3a840" />
      <stop offset="56%" stop-color="#7c4b11" />
      <stop offset="82%" stop-color="#f0c360" />
      <stop offset="100%" stop-color="#5c3508" />
    </linearGradient>
    <linearGradient id="${gRim}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff3b8" />
      <stop offset="50%" stop-color="#b87a1f" />
      <stop offset="100%" stop-color="#4e2c07" />
    </linearGradient>
    <linearGradient id="${gSapphire}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a6ae8" />
      <stop offset="50%" stop-color="#0d296e" />
      <stop offset="100%" stop-color="#061238" />
    </linearGradient>
    <radialGradient id="${gEmpty}" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#3a2513" />
      <stop offset="68%" stop-color="#1e1208" />
      <stop offset="100%" stop-color="#110904" />
    </radialGradient>
    <radialGradient id="${gHub}" cx="36%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fff9d6" />
      <stop offset="45%" stop-color="#df9e34" />
      <stop offset="100%" stop-color="#5e3609" />
    </radialGradient>
    ${sliceDefs.join('')}
  </defs>
  <circle cx="60" cy="60" r="59.5" fill="url(#${gHalo})" />
  <circle cx="60" cy="60" r="55" fill="url(#${gBrass})" stroke="#3b2004" stroke-width="1.5" />
  <circle cx="60" cy="60" r="50.5" fill="url(#${gSapphire})" stroke="#ffe591" stroke-width="1.2" />
  <circle cx="60" cy="60" r="46.2" fill="url(#${gRim})" stroke="#3b2004" stroke-width="1" />
  <circle cx="60" cy="60" r="43.8" fill="#180e06" />
  ${sliceMarkup.join('')}
  <circle cx="60" cy="60" r="10.2" fill="url(#${gHub})" stroke="#4a2805" stroke-width="1.3" />
  <circle cx="60" cy="60" r="4.8" fill="#fff6cc" fill-opacity="0.65" />
  ${rivets}
</svg>`;
}

// ============================================================================
// 2. CROSSED 3D IRON CHAINS & GOLD PADLOCK OVERLAY (mockup_v5_game_board)
// ============================================================================

function renderChainStrand(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  gradId: string,
  linkCount: number,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const parts: string[] = [];

  for (let i = 0; i < linkCount; i++) {
    const t = (i + 0.5) / linkCount;
    const cx = x1 + dx * t;
    const cy = y1 + dy * t;
    const isBroad = i % 2 === 0;

    if (isBroad) {
      parts.push(`
        <g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${angleDeg.toFixed(1)})">
          <rect x="-9.5" y="-5.2" width="19" height="10.4" rx="5.2" fill="none" stroke="#080c14" stroke-opacity="0.68" stroke-width="4.4" transform="translate(1.4 2.4)" />
          <rect x="-9.5" y="-5.2" width="19" height="10.4" rx="5.2" fill="none" stroke="url(#${gradId})" stroke-width="3.6" />
          <path d="M -5.5 -3.6 H 5.5" stroke="#eef4fc" stroke-opacity="0.7" stroke-width="1.15" stroke-linecap="round" />
        </g>
      `);
    } else {
      parts.push(`
        <g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${angleDeg.toFixed(1)})">
          <rect x="-8.2" y="-2.2" width="16.4" height="4.4" rx="2.2" fill="#080c14" fill-opacity="0.65" transform="translate(1.2 2.2)" />
          <rect x="-8.2" y="-2.2" width="16.4" height="4.4" rx="2.2" fill="url(#${gradId})" stroke="#1c2433" stroke-width="0.9" />
          <line x1="-5.2" y1="-0.9" x2="5.2" y2="-0.9" stroke="#f1f5f9" stroke-opacity="0.72" stroke-width="1" stroke-linecap="round" />
        </g>
      `);
    }
  }
  return parts.join('');
}

/**
 * Renders heavy crossed 3D-shaded forged iron chains with a central brushed-gold
 * padlock (plus golden fracture lightning & sparks when `shattering === true`).
 */
export function renderChainPadlockOverlaySvg(shattering = false): string {
  const gIron = uid('ch_iron');
  const gLock = uid('ch_lock');
  const gShackle = uid('ch_shkl');
  const gSpark = uid('ch_sprk');

  const strandA1 = renderChainStrand(6, 12, 54, 41, gIron, 5);
  const strandA2 = renderChainStrand(114, 12, 66, 41, gIron, 5);
  const strandB1 = renderChainStrand(6, 86, 48, 49, gIron, 5);
  const strandB2 = renderChainStrand(114, 86, 72, 49, gIron, 5);

  const shackleTransform = shattering ? ' transform="translate(6 -7) rotate(26 60 33)"' : '';
  const shatterFx = shattering
    ? `
      <g class="v5-chain-shatter-burst">
        <circle cx="60" cy="43" r="24" fill="url(#${gSpark})" />
        <path d="M 46 23 L 58 38 L 52 42 L 68 61 M 76 21 L 62 39 L 70 44 L 50 63" fill="none" stroke="#fff8c4" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
        <g stroke="#ffd25a" stroke-width="2" stroke-linecap="round">
          <line x1="60" y1="14" x2="60" y2="5" />
          <line x1="86" y1="24" x2="96" y2="16" />
          <line x1="92" y1="49" x2="104" y2="52" />
          <line x1="34" y1="24" x2="24" y2="15" />
          <line x1="28" y1="51" x2="16" y2="55" />
          <line x1="60" y1="71" x2="60" y2="80" />
        </g>
        <circle cx="88" cy="34" r="2.2" fill="#fff6bd" />
        <circle cx="32" cy="38" r="2" fill="#ffd25a" />
        <circle cx="77" cy="66" r="2.3" fill="#ff9e2c" />
        <circle cx="43" cy="67" r="1.9" fill="#fff6bd" />
      </g>
    `
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" class="v5-svg-chain${shattering ? ' v5-svg-chain--shattering' : ''}" aria-hidden="true">
  <defs>
    <linearGradient id="${gIron}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0" />
      <stop offset="35%" stop-color="#7c8aa1" />
      <stop offset="72%" stop-color="#334155" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="${gShackle}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff4c4" />
      <stop offset="42%" stop-color="#d69c38" />
      <stop offset="100%" stop-color="#5c3608" />
    </linearGradient>
    <linearGradient id="${gLock}" x1="12%" y1="0%" x2="88%" y2="100%">
      <stop offset="0%" stop-color="#fff5be" />
      <stop offset="32%" stop-color="#e5aa3f" />
      <stop offset="70%" stop-color="#9c6116" />
      <stop offset="100%" stop-color="#573107" />
    </linearGradient>
    <radialGradient id="${gSpark}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="42%" stop-color="#ffd55a" stop-opacity="0.72" />
      <stop offset="100%" stop-color="#ff7a00" stop-opacity="0" />
    </radialGradient>
  </defs>
  <g class="v5-chain-half-a">
    ${strandA1}
    ${strandB2}
  </g>
  <g class="v5-chain-half-b">
    ${strandA2}
    ${strandB1}
  </g>
  <g class="v5-padlock-body">
    <path d="M 49 36 V 25 A 11 11 0 0 1 71 25 V 36" fill="none" stroke="#140c04" stroke-opacity="0.72" stroke-width="6.6" stroke-linecap="round" transform="translate(1.4 2.2)"${shackleTransform} />
    <path d="M 49 36 V 25 A 11 11 0 0 1 71 25 V 36" fill="none" stroke="url(#${gShackle})" stroke-width="5.1" stroke-linecap="round"${shackleTransform} />
    <path d="M 50.5 31 V 25 A 9.5 9.5 0 0 1 67 19" fill="none" stroke="#fffbe0" stroke-opacity="0.68" stroke-width="1.3" stroke-linecap="round"${shackleTransform} />
    <rect x="44" y="35.5" width="35" height="25.5" rx="5.5" fill="#0d0703" fill-opacity="0.64" />
    <rect x="42.5" y="33.5" width="35" height="25.5" rx="5.5" fill="url(#${gLock})" stroke="#452405" stroke-width="1.5" />
    <rect x="45.8" y="36.8" width="28.4" height="19" rx="3.2" fill="none" stroke="#fff4bf" stroke-opacity="0.46" stroke-width="1.05" />
    <circle cx="60" cy="44" r="3.6" fill="#231204" stroke="#ffe799" stroke-opacity="0.45" stroke-width="0.85" />
    <path d="M 58.3 46.8 L 57.1 53.6 H 62.9 L 61.7 46.8 Z" fill="#231204" />
  </g>
  ${shatterFx}
</svg>`;
}

// ============================================================================
// 3. GLOSSY 3D RED DOME "SCREW RIVAL!" BUZZER (mockup_v5_game_board bottom-left)
// ============================================================================

/**
 * Renders the chunky glossy 3D ruby-red dome `SCREW RIVAL!` podium buzzer set
 * into a tiered brushed-brass collar.
 */
export function renderScrewBuzzerSvg(
  armed: boolean,
  disabled: boolean,
  label = 'SCREW RIVAL!',
): string {
  const gBase = uid('bz_base');
  const gCollar = uid('bz_col');
  const gDome = uid('bz_dome');
  const gSkirt = uid('bz_skrt');
  const gHalo = uid('bz_halo');

  const safeRaw = label.trim() || 'SCREW RIVAL!';
  const words = safeRaw.split(/\s+/);
  let line1 = safeRaw;
  let line2 = '';
  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(' ');
    line2 = words.slice(mid).join(' ');
  }

  const domeHi = disabled ? '#8d535c' : armed ? '#ff9fa8' : '#ff7a88';
  const domeMid = disabled ? '#5a242c' : armed ? '#f71b38' : '#de1732';
  const domeDeep = disabled ? '#2c0f14' : armed ? '#9e081c' : '#850a1b';
  const domeDark = disabled ? '#1c080b' : '#4a040e';

  const baseOpacity = disabled ? '0.68' : '1';
  const textFill = disabled ? '#c4aeb2' : '#fffaf0';
  const armedRing =
    armed && !disabled
      ? `
        <ellipse class="v5-buzzer-halo" cx="70" cy="68" rx="66" ry="54" fill="url(#${gHalo})" />
        <ellipse cx="70" cy="68" rx="61.5" ry="49.5" fill="none" stroke="#ff5268" stroke-width="2.5" stroke-dasharray="9 6" stroke-opacity="0.92" />
      `
      : '';

  const textBlock = line2
    ? `
      <text x="70" y="51" text-anchor="middle" fill="#3a030a" font-family="Cinzel, Georgia, serif" font-size="14.5" font-weight="800" letter-spacing="0.6" transform="translate(0 1.6)">${escapeXml(line1)}</text>
      <text x="70" y="51" text-anchor="middle" fill="${textFill}" font-family="Cinzel, Georgia, serif" font-size="14.5" font-weight="800" letter-spacing="0.6">${escapeXml(line1)}</text>
      <text x="70" y="68" text-anchor="middle" fill="#3a030a" font-family="Cinzel, Georgia, serif" font-size="14.5" font-weight="800" letter-spacing="0.6" transform="translate(0 1.6)">${escapeXml(line2)}</text>
      <text x="70" y="68" text-anchor="middle" fill="${textFill}" font-family="Cinzel, Georgia, serif" font-size="14.5" font-weight="800" letter-spacing="0.6">${escapeXml(line2)}</text>
    `
    : `
      <text x="70" y="61" text-anchor="middle" fill="#3a030a" font-family="Cinzel, Georgia, serif" font-size="15.5" font-weight="800" letter-spacing="0.6" transform="translate(0 1.6)">${escapeXml(line1)}</text>
      <text x="70" y="61" text-anchor="middle" fill="${textFill}" font-family="Cinzel, Georgia, serif" font-size="15.5" font-weight="800" letter-spacing="0.6">${escapeXml(line1)}</text>
    `;

  const stateClass = disabled
    ? ' v5-svg-buzzer--disabled'
    : armed
      ? ' v5-svg-buzzer--armed'
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 128" width="100%" height="100%" class="v5-svg-buzzer${stateClass}" role="img" aria-label="${escapeXml(safeRaw)}${armed ? ' (Armed)' : disabled ? ' (Unavailable)' : ''}">
  <defs>
    <radialGradient id="${gHalo}" cx="50%" cy="50%" r="50%">
      <stop offset="58%" stop-color="#ff3b54" stop-opacity="0.58" />
      <stop offset="100%" stop-color="#ff3b54" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="${gBase}" x1="12%" y1="4%" x2="88%" y2="96%">
      <stop offset="0%" stop-color="#fff1b0" />
      <stop offset="32%" stop-color="#d89b36" />
      <stop offset="68%" stop-color="#7c4a10" />
      <stop offset="100%" stop-color="#422405" />
    </linearGradient>
    <linearGradient id="${gCollar}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#462507" />
      <stop offset="48%" stop-color="#a86d1c" />
      <stop offset="100%" stop-color="#f6cc68" />
    </linearGradient>
    <linearGradient id="${gSkirt}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${domeDark}" />
      <stop offset="30%" stop-color="${domeDeep}" />
      <stop offset="65%" stop-color="${domeMid}" />
      <stop offset="100%" stop-color="${domeDark}" />
    </linearGradient>
    <radialGradient id="${gDome}" cx="38%" cy="28%" r="68%">
      <stop offset="0%" stop-color="${domeHi}" />
      <stop offset="42%" stop-color="${domeMid}" />
      <stop offset="82%" stop-color="${domeDeep}" />
      <stop offset="100%" stop-color="${domeDark}" />
    </radialGradient>
  </defs>
  <g opacity="${baseOpacity}">
    ${armedRing}
    <ellipse cx="70" cy="79" rx="60" ry="44" fill="#090504" fill-opacity="0.62" />
    <ellipse cx="70" cy="72" rx="59" ry="44" fill="url(#${gBase})" stroke="#3c2005" stroke-width="2" />
    <ellipse cx="70" cy="69" rx="52" ry="38" fill="url(#${gCollar})" stroke="#ffe591" stroke-opacity="0.52" stroke-width="1.2" />
    <ellipse cx="70" cy="67" rx="46.5" ry="33.5" fill="#210907" />
    <path d="M 26 57 V 68 A 44 31 0 0 0 114 68 V 57 Z" fill="url(#${gSkirt})" />
    <ellipse cx="70" cy="56" rx="44" ry="33" fill="url(#${gDome})" stroke="${armed ? '#ffadb7' : '#ff6b7d'}" stroke-opacity="0.55" stroke-width="1.4" />
    <path d="M 38 42 Q 68 23 102 38 Q 73 33 44 48 Z" fill="#ffffff" fill-opacity="${disabled ? '0.16' : '0.44'}" />
    <ellipse cx="52" cy="36" rx="11" ry="4.5" fill="#ffffff" fill-opacity="${disabled ? '0.14' : '0.34'}" transform="rotate(-16 52 36)" />
    ${textBlock}
  </g>
</svg>`;
}

// ============================================================================
// 4. CIRCULAR BRASS & NEON-ARC SHOT CLOCK CHRONOMETER (mockup_v5_question_classic)
// ============================================================================

/**
 * Renders the circular multi-ring brushed-brass & glowing neon-arc broadcast
 * Shot Clock Chronometer (`26s`, `READING`, or `∞`).
 * Exposes `data-v5-clock-arc="true"`, `data-v5-clock-circumference`, and
 * `data-v5-clock-text="true"` so timers can update surgically without DOM rebuilds.
 */
export function renderBrassChronometerSvg(
  secondsText: string,
  progress01: number,
  isGrace: boolean,
  isUntimed: boolean,
): string {
  const pct = clamp01(progress01);
  const effectivePct = isUntimed || isGrace ? 1 : pct;
  const isUrgent = !isGrace && !isUntimed && pct <= 0.25;

  const rMain = 41.5;
  const circumference = 2 * Math.PI * rMain;
  const dashOffset = circumference * (1 - effectivePct);

  const gBezel = uid('ck_bzl');
  const gFace = uid('ck_face');
  const gArc = uid('ck_arc');
  const gCyan = uid('ck_cyan');

  const arcStartColor = isUntimed
    ? '#75ffbe'
    : isGrace
      ? '#a8f2ff'
      : isUrgent
        ? '#ff5268'
        : '#fff3ad';
  const arcEndColor = isUntimed
    ? '#f7c948'
    : isGrace
      ? '#ffe07d'
      : isUrgent
        ? '#ff9d2e'
        : '#f29f24';

  const displayLabel = (secondsText || (isUntimed ? '∞' : isGrace ? 'READ' : '0s')).trim();
  const fontSize =
    displayLabel.length >= 5 ? 16 : displayLabel.length >= 4 ? 20 : displayLabel === '∞' ? 36 : 29;
  const textY = displayLabel === '∞' ? 71 : 69;

  const ticks: string[] = [];
  for (let i = 0; i < 12; i++) {
    const deg = i * 30;
    const isMajor = i % 3 === 0;
    const p1 = polarToCartesian(60, 60, isMajor ? 45.2 : 46.2, deg);
    const p2 = polarToCartesian(60, 60, 48.2, deg);
    ticks.push(
      `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="#ffe69c" stroke-opacity="${isMajor ? '0.8' : '0.42'}" stroke-width="${isMajor ? '1.6' : '1'}" stroke-linecap="round" />`,
    );
  }

  const rInner = 35.5;
  const innerCirc = 2 * Math.PI * rInner;
  const innerArcLen = innerCirc * 0.44;
  const innerGapLen = innerCirc - innerArcLen;

  const modeClass = isUntimed
    ? ' v5-svg-clock--untimed'
    : isGrace
      ? ' v5-svg-clock--grace'
      : isUrgent
        ? ' v5-svg-clock--urgent'
        : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%" class="v5-svg-chronometer${modeClass}" role="img" aria-label="Shot Clock ${escapeXml(displayLabel)}">
  <defs>
    <linearGradient id="${gBezel}" x1="12%" y1="6%" x2="88%" y2="94%">
      <stop offset="0%" stop-color="#fff6c7" />
      <stop offset="28%" stop-color="#e5aa40" />
      <stop offset="56%" stop-color="#7c4b11" />
      <stop offset="82%" stop-color="#f2c462" />
      <stop offset="100%" stop-color="#573107" />
    </linearGradient>
    <radialGradient id="${gFace}" cx="50%" cy="34%" r="68%">
      <stop offset="0%" stop-color="#14326e" />
      <stop offset="62%" stop-color="#08173b" />
      <stop offset="100%" stop-color="#040b1f" />
    </radialGradient>
    <linearGradient id="${gArc}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${arcStartColor}" />
      <stop offset="100%" stop-color="${arcEndColor}" />
    </linearGradient>
    <linearGradient id="${gCyan}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#69e4ff" />
      <stop offset="100%" stop-color="#2275ff" />
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="57" fill="url(#${gBezel})" stroke="#381e04" stroke-width="2" />
  <circle cx="60" cy="60" r="51.2" fill="#432607" stroke="#fff0b5" stroke-opacity="0.48" stroke-width="1.1" />
  <circle cx="60" cy="60" r="48.8" fill="url(#${gFace})" />
  ${ticks.join('')}
  <circle cx="60" cy="60" r="${rMain}" fill="none" stroke="#18346e" stroke-opacity="0.58" stroke-width="5.2" />
  <circle cx="60" cy="60" r="${rInner}" fill="none" stroke="url(#${gCyan})" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="${innerArcLen.toFixed(2)} ${innerGapLen.toFixed(2)}" transform="rotate(64 60 60)" stroke-opacity="${isUrgent ? '0.35' : '0.86'}" />
  <circle
    data-v5-clock-arc="true"
    data-v5-clock-circumference="${circumference.toFixed(2)}"
    cx="60"
    cy="60"
    r="${rMain}"
    fill="none"
    stroke="url(#${gArc})"
    stroke-width="5.2"
    stroke-linecap="round"
    stroke-dasharray="${circumference.toFixed(2)}"
    stroke-dashoffset="${dashOffset.toFixed(2)}"
    transform="rotate(-90 60 60)"
  />
  <path d="M 22 48 A 42 42 0 0 1 98 48 Q 60 36 22 48 Z" fill="#ffffff" fill-opacity="0.1" />
  <text
    data-v5-clock-text="true"
    x="60"
    y="${textY}"
    text-anchor="middle"
    fill="#fffaf0"
    font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    font-size="${fontSize}"
    font-weight="800"
    letter-spacing="-0.02em"
  >${escapeXml(displayLabel)}</text>
</svg>`;
}

// ============================================================================
// 5. ALL 12 SCULPTED PODIUM LUCKY CHARM TRINKETS (PodiumCharmSpecV5)
// ============================================================================

/**
 * Renders any of the 12 distinct multi-gradient sculpted Podium Lucky Charm
 * trinkets (`coaster`, `fountain_pen`, `watch`, `mic`, `pulse`, `circuit`,
 * `astrolabe`, `megaphone`, `dice`, `seal`, `chip`, `shield`).
 */
export function renderLuckyCharmSvg(
  charmKind: LuckyCharmEmblemKindV5,
  sizePx = 48,
): string {
  const px = Math.max(20, Math.round(sizePx));
  const gA = uid(`chm_${charmKind}_a`);
  const gB = uid(`chm_${charmKind}_b`);
  const gC = uid(`chm_${charmKind}_c`);

  let defs = '';
  let body = '';
  let ariaLabel = 'Lucky Charm';

  switch (charmKind) {
    case 'coaster': {
      ariaLabel = "Frankie's Lucky Pub Coaster";
      defs = `
        <radialGradient id="${gA}" cx="36%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#f7d288" />
          <stop offset="52%" stop-color="#c48335" />
          <stop offset="100%" stop-color="#6b3e11" />
        </radialGradient>
        <linearGradient id="${gB}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff2bd" />
          <stop offset="100%" stop-color="#8a5214" />
        </linearGradient>
      `;
      body = `
        <circle cx="32" cy="34" r="25" fill="#170b03" fill-opacity="0.55" />
        <circle cx="32" cy="32" r="25" fill="url(#${gA})" stroke="url(#${gB})" stroke-width="2.4" />
        <circle cx="32" cy="32" r="20" fill="none" stroke="#57310a" stroke-width="1.4" stroke-dasharray="3.2 2.4" />
        <circle cx="32" cy="32" r="16" fill="none" stroke="#ffe79e" stroke-opacity="0.5" stroke-width="1" />
        <g fill="#4d2807" stroke="#ffe599" stroke-opacity="0.45" stroke-width="0.6">
          <circle cx="32" cy="24.5" r="5.3" />
          <circle cx="26.2" cy="33.2" r="5.3" />
          <circle cx="37.8" cy="33.2" r="5.3" />
          <path d="M 32 33 Q 32.5 41 28 45" fill="none" stroke="#4d2807" stroke-width="2.6" stroke-linecap="round" />
        </g>
      `;
      break;
    }

    case 'fountain_pen': {
      ariaLabel = "Denise's Red Fountain Pen";
      defs = `
        <linearGradient id="${gA}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff5c6c" />
          <stop offset="45%" stop-color="#b81428" />
          <stop offset="100%" stop-color="#520611" />
        </linearGradient>
        <linearGradient id="${gB}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff6c7" />
          <stop offset="50%" stop-color="#df9e34" />
          <stop offset="100%" stop-color="#6b3d08" />
        </linearGradient>
      `;
      body = `
        <g transform="rotate(-42 32 32)">
          <rect x="26" y="10" width="12" height="34" rx="5.5" fill="url(#${gA})" stroke="#3b050c" stroke-width="1.3" />
          <rect x="25.2" y="25" width="13.6" height="4.2" rx="1" fill="url(#${gB})" stroke="#4c2b06" stroke-width="0.9" />
          <path d="M 32 12 V 25" stroke="url(#${gB})" stroke-width="2.6" stroke-linecap="round" />
          <circle cx="32" cy="24.8" r="1.9" fill="#fff2b5" />
          <rect x="28" y="42" width="8" height="5" rx="1.5" fill="#211815" />
          <path d="M 28.5 47 L 32 58 L 35.5 47 Z" fill="url(#${gB})" stroke="#4c2b06" stroke-width="1" />
          <line x1="32" y1="51.5" x2="32" y2="57.5" stroke="#2c1703" stroke-width="1" />
          <circle cx="32" cy="51.2" r="1.2" fill="#2c1703" />
          <line x1="29" y1="13" x2="29" y2="39" stroke="#ffffff" stroke-opacity="0.34" stroke-width="1.5" stroke-linecap="round" />
        </g>
      `;
      break;
    }

    case 'watch': {
      ariaLabel = "Alistair's Antique Pocketwatch";
      defs = `
        <linearGradient id="${gA}" x1="12%" y1="6%" x2="88%" y2="94%">
          <stop offset="0%" stop-color="#fff5c0" />
          <stop offset="45%" stop-color="#d89b34" />
          <stop offset="100%" stop-color="#613709" />
        </linearGradient>
        <radialGradient id="${gB}" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fffdf4" />
          <stop offset="76%" stop-color="#e8d8b5" />
          <stop offset="100%" stop-color="#bda578" />
        </radialGradient>
      `;
      body = `
        <circle cx="32" cy="10" r="5" fill="none" stroke="url(#${gA})" stroke-width="2.4" />
        <rect x="28.5" y="13.5" width="7" height="4.5" rx="1.5" fill="url(#${gA})" stroke="#4d2c07" stroke-width="0.9" />
        <circle cx="32" cy="38" r="21" fill="url(#${gA})" stroke="#452506" stroke-width="1.6" />
        <circle cx="32" cy="38" r="16.4" fill="url(#${gB})" stroke="#8c5816" stroke-width="1.2" />
        <g stroke="#362312" stroke-width="1.3" stroke-linecap="round">
          <line x1="32" y1="24" x2="32" y2="26.5" />
          <line x1="32" y1="49.5" x2="32" y2="52" />
          <line x1="18" y1="38" x2="20.5" y2="38" />
          <line x1="43.5" y1="38" x2="46" y2="38" />
        </g>
        <line x1="32" y1="38" x2="32" y2="27.5" stroke="#18243d" stroke-width="2.1" stroke-linecap="round" />
        <line x1="32" y1="38" x2="40.5" y2="34" stroke="#18243d" stroke-width="1.7" stroke-linecap="round" />
        <line x1="32" y1="38" x2="25" y2="43.5" stroke="#b81d2c" stroke-width="1" stroke-linecap="round" />
        <circle cx="32" cy="38" r="2.2" fill="#d89b34" stroke="#362312" stroke-width="0.8" />
      `;
      break;
    }

    case 'mic': {
      ariaLabel = "Trevor's Vintage Hot Mic";
      defs = `
        <linearGradient id="${gA}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="35%" stop-color="#f8fafc" />
          <stop offset="70%" stop-color="#64748b" />
          <stop offset="100%" stop-color="#334155" />
        </linearGradient>
        <linearGradient id="${gB}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff2b5" />
          <stop offset="55%" stop-color="#d6952e" />
          <stop offset="100%" stop-color="#693c09" />
        </linearGradient>
      `;
      body = `
        <rect x="20" y="9" width="24" height="31" rx="12" fill="url(#${gA})" stroke="#1e293b" stroke-width="1.5" />
        <g stroke="#334155" stroke-width="1.7" stroke-linecap="round">
          <line x1="23.5" y1="17" x2="40.5" y2="17" />
          <line x1="22" y1="22.5" x2="42" y2="22.5" />
          <line x1="22" y1="28" x2="42" y2="28" />
          <line x1="24" y1="33.5" x2="40" y2="33.5" />
        </g>
        <circle cx="32" cy="25" r="3.4" fill="#ff3850" fill-opacity="0.72" />
        <path d="M 15.5 28 V 33 A 16.5 16.5 0 0 0 48.5 33 V 28" fill="none" stroke="url(#${gB})" stroke-width="3.2" stroke-linecap="round" />
        <line x1="32" y1="49.5" x2="32" y2="56" stroke="url(#${gB})" stroke-width="3.6" />
        <rect x="21" y="54.5" width="22" height="4.5" rx="2.2" fill="url(#${gB})" stroke="#4c2b06" stroke-width="1" />
      `;
      break;
    }

    case 'pulse': {
      ariaLabel = "Priya's Adrenaline Pulse Medallion";
      defs = `
        <linearGradient id="${gA}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff1b5" />
          <stop offset="50%" stop-color="#d69531" />
          <stop offset="100%" stop-color="#63390a" />
        </linearGradient>
        <radialGradient id="${gB}" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#19438a" />
          <stop offset="70%" stop-color="#091a42" />
          <stop offset="100%" stop-color="#040c24" />
        </radialGradient>
        <linearGradient id="${gC}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38f2a4" />
          <stop offset="55%" stop-color="#58e0ff" />
          <stop offset="100%" stop-color="#ff5a70" />
        </linearGradient>
      `;
      body = `
        <polygon points="32,6 54,19 54,45 32,58 10,45 10,19" fill="url(#${gA})" stroke="#452406" stroke-width="1.5" />
        <polygon points="32,10.5 50,21 50,43 32,53.5 14,43 14,21" fill="url(#${gB})" />
        <polyline points="15,34 23,34 27,21 33,45 38,27 42,34 49,34" fill="none" stroke="url(#${gC})" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="48.5" cy="34" r="2.4" fill="#ff7386" />
      `;
      break;
    }

    case 'circuit': {
      ariaLabel = "Kenji's Cyber Link Microchip";
      defs = `
        <linearGradient id="${gA}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#222a3d" />
          <stop offset="100%" stop-color="#0b101d" />
        </linearGradient>
        <linearGradient id="${gB}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff2b5" />
          <stop offset="100%" stop-color="#c98422" />
        </linearGradient>
        <linearGradient id="${gC}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8bf5ff" />
          <stop offset="100%" stop-color="#19a7e8" />
        </linearGradient>
      `;
      body = `
        <g stroke="url(#${gB})" stroke-width="2.4" stroke-linecap="round">
          <line x1="22" y1="8" x2="22" y2="15" />
          <line x1="32" y1="8" x2="32" y2="15" />
          <line x1="42" y1="8" x2="42" y2="15" />
          <line x1="22" y1="49" x2="22" y2="56" />
          <line x1="32" y1="49" x2="32" y2="56" />
          <line x1="42" y1="49" x2="42" y2="56" />
          <line x1="8" y1="22" x2="15" y2="22" />
          <line x1="8" y1="32" x2="15" y2="32" />
          <line x1="8" y1="42" x2="15" y2="42" />
          <line x1="49" y1="22" x2="56" y2="22" />
          <line x1="49" y1="32" x2="56" y2="32" />
          <line x1="49" y1="42" x2="56" y2="42" />
        </g>
        <rect x="14" y="14" width="36" height="36" rx="5" fill="url(#${gA})" stroke="url(#${gB})" stroke-width="2.2" />
        <path d="M 20 23 H 27 L 32 28 L 37 23 H 44 M 20 41 H 27 L 32 36 L 37 41 H 44" fill="none" stroke="url(#${gC})" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        <polygon points="32,24 40,32 32,40 24,32" fill="url(#${gC})" stroke="#ffffff" stroke-opacity="0.7" stroke-width="1" />
      `;
      break;
    }

    case 'astrolabe': {
      ariaLabel = "Nadia's Celestial Astrolabe";
      defs = `
        <linearGradient id="${gA}" x1="10%" y1="6%" x2="90%" y2="94%">
          <stop offset="0%" stop-color="#fff4bf" />
          <stop offset="48%" stop-color="#dea138" />
          <stop offset="100%" stop-color="#693d09" />
        </linearGradient>
        <radialGradient id="${gB}" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#87dcff" />
          <stop offset="55%" stop-color="#1c6ee8" />
          <stop offset="100%" stop-color="#0a2461" />
        </radialGradient>
      `;
      body = `
        <circle cx="32" cy="9" r="3.6" fill="none" stroke="url(#${gA})" stroke-width="2" />
        <circle cx="32" cy="34" r="22" fill="none" stroke="url(#${gA})" stroke-width="3.6" />
        <circle cx="32" cy="34" r="16" fill="none" stroke="url(#${gA})" stroke-width="1.6" stroke-dasharray="2.5 2.5" />
        <ellipse cx="32" cy="34" rx="18" ry="8" fill="none" stroke="url(#${gA})" stroke-width="1.7" transform="rotate(-26 32 34)" />
        <ellipse cx="32" cy="34" rx="18" ry="8" fill="none" stroke="url(#${gA})" stroke-width="1.7" transform="rotate(34 32 34)" />
        <line x1="15" y1="45" x2="49" y2="23" stroke="#fff3bc" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="32" cy="34" r="5.5" fill="url(#${gB})" stroke="#fff3b5" stroke-width="1.3" />
      `;
      break;
    }

    case 'megaphone': {
      ariaLabel = 'Grassroots Stage Megaphone';
      defs = `
        <linearGradient id="${gA}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#35d999" />
          <stop offset="55%" stop-color="#0d6e4e" />
          <stop offset="100%" stop-color="#053827" />
        </linearGradient>
        <linearGradient id="${gB}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff4bd" />
          <stop offset="55%" stop-color="#df9e34" />
          <stop offset="100%" stop-color="#6b3e0a" />
        </linearGradient>
      `;
      body = `
        <path d="M 18 39 L 22 52 H 28 L 25 38 Z" fill="url(#${gB})" stroke="#4a2805" stroke-width="1.2" />
        <path d="M 11 26 L 45 14 V 46 L 11 35 Z" fill="url(#${gA})" stroke="url(#${gB})" stroke-width="2.2" stroke-linejoin="round" />
        <ellipse cx="45" cy="30" rx="4.5" ry="16" fill="url(#${gB})" stroke="#4a2805" stroke-width="1.3" />
        <ellipse cx="45" cy="30" rx="2.1" ry="11" fill="#180e06" />
        <rect x="8.5" y="25" width="6" height="11" rx="2.5" fill="url(#${gB})" stroke="#4a2805" stroke-width="1.1" />
        <path d="M 52 22 Q 57 30 52 38 M 56 17 Q 62 30 56 43" fill="none" stroke="#ffe58c" stroke-width="2" stroke-linecap="round" />
      `;
      break;
    }

    case 'dice': {
      ariaLabel = 'Syndicate Golden Dice';
      defs = `
        <linearGradient id="${gA}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff6c4" />
          <stop offset="50%" stop-color="#e3a63b" />
          <stop offset="100%" stop-color="#87500e" />
        </linearGradient>
        <linearGradient id="${gB}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd970" />
          <stop offset="100%" stop-color="#693b08" />
        </linearGradient>
      `;
      body = `
        <g transform="rotate(-14 23 36)">
          <rect x="9" y="21" width="26" height="26" rx="5" fill="url(#${gA})" stroke="#4f2d06" stroke-width="1.6" />
          <circle cx="16.5" cy="28.5" r="2.2" fill="#3a1c05" />
          <circle cx="27.5" cy="28.5" r="2.2" fill="#3a1c05" />
          <circle cx="22" cy="34" r="2.2" fill="#a81326" />
          <circle cx="16.5" cy="39.5" r="2.2" fill="#3a1c05" />
          <circle cx="27.5" cy="39.5" r="2.2" fill="#3a1c05" />
        </g>
        <g transform="rotate(14 42 28)">
          <rect x="29" y="14" width="25" height="25" rx="5" fill="url(#${gB})" stroke="#4f2d06" stroke-width="1.6" />
          <circle cx="36.5" cy="21.5" r="2.2" fill="#2c1504" />
          <circle cx="41.5" cy="26.5" r="2.2" fill="#2c1504" />
          <circle cx="46.5" cy="31.5" r="2.2" fill="#2c1504" />
        </g>
      `;
      break;
    }

    case 'seal': {
      ariaLabel = 'Velvet Society Wax Seal';
      defs = `
        <radialGradient id="${gA}" cx="36%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#ff6b7c" />
          <stop offset="48%" stop-color="#b8162a" />
          <stop offset="100%" stop-color="#570611" />
        </radialGradient>
        <linearGradient id="${gB}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff2b8" />
          <stop offset="100%" stop-color="#c98422" />
        </linearGradient>
      `;
      body = `
        <path d="M 22 42 L 18 58 L 26 53 L 31 58 L 32 45 M 42 42 L 46 58 L 38 53 L 33 58 L 32 45" fill="#7c0e1e" stroke="#3b050d" stroke-width="1" />
        <path d="M 32 8 C 38 8 42 11 46 14 C 52 17 55 23 54 30 C 55 37 51 43 45 46 C 40 50 35 52 30 51 C 23 51 17 48 14 42 C 9 37 9 29 12 22 C 14 14 23 8 32 8 Z" fill="url(#${gA})" stroke="#42050d" stroke-width="1.5" />
        <circle cx="32" cy="29.5" r="14.5" fill="none" stroke="#ff9ea9" stroke-opacity="0.45" stroke-width="1.4" />
        <path d="M 24 34 L 26 24 L 32 29 L 38 24 L 40 34 Z" fill="url(#${gB})" stroke="#4d1409" stroke-width="0.9" />
      `;
      break;
    }

    case 'chip': {
      ariaLabel = 'Underdog Comeback Chip';
      defs = `
        <radialGradient id="${gA}" cx="35%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#3ce8a2" />
          <stop offset="56%" stop-color="#0d6e4c" />
          <stop offset="100%" stop-color="#053020" />
        </radialGradient>
        <linearGradient id="${gB}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff4be" />
          <stop offset="100%" stop-color="#bd7a1c" />
        </linearGradient>
      `;
      body = `
        <circle cx="32" cy="34" r="24" fill="#09120d" fill-opacity="0.58" />
        <circle cx="32" cy="32" r="24" fill="url(#${gA})" stroke="url(#${gB})" stroke-width="3" />
        <circle cx="32" cy="32" r="20.5" fill="none" stroke="#fff6db" stroke-width="3.6" stroke-dasharray="6.5 9.6" />
        <circle cx="32" cy="32" r="14.5" fill="#073d2a" stroke="url(#${gB})" stroke-width="1.8" />
        <polygon points="32,20.5 35.1,27.8 43,28.4 37,33.5 38.8,41.2 32,37.1 25.2,41.2 27,33.5 21,28.4 28.9,27.8" fill="url(#${gB})" stroke="#3f2204" stroke-width="0.9" />
      `;
      break;
    }

    case 'shield':
    default: {
      ariaLabel = 'Screw Deflector Shield';
      defs = `
        <linearGradient id="${gA}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff4bd" />
          <stop offset="48%" stop-color="#da9b34" />
          <stop offset="100%" stop-color="#613708" />
        </linearGradient>
        <linearGradient id="${gB}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2260cc" />
          <stop offset="60%" stop-color="#0d296e" />
          <stop offset="100%" stop-color="#061238" />
        </linearGradient>
      `;
      body = `
        <path d="M 32 6 L 53 14 V 32 C 53 45 43.5 54 32 59 C 20.5 54 11 45 11 32 V 14 Z" fill="url(#${gA})" stroke="#422405" stroke-width="1.6" />
        <path d="M 32 10.5 L 48.5 17 V 31.5 C 48.5 42 41 49.5 32 54 C 23 49.5 15.5 42 15.5 31.5 V 17 Z" fill="url(#${gB})" />
        <polygon points="35,16 23,33 31.5,33 28.5,48 42,29 33.5,29" fill="url(#${gA})" stroke="#ffffff" stroke-opacity="0.55" stroke-width="0.9" />
      `;
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${px}" height="${px}" class="v5-svg-charm v5-svg-charm--${charmKind}" role="img" aria-label="${escapeXml(ariaLabel)}">
  <defs>${defs}</defs>
  ${body}
</svg>`;
}

// ============================================================================
// 6. ALL 12 THEATRICAL DOMAIN EMBLEMS (0..11 — NEVER PLAIN "CLASSIC" TEXT!)
// ============================================================================

const DOMAIN_NAMES_V5: readonly string[] = [
  'World History',
  'Science & Space',
  'Geography & Wonders',
  'Arts & Architecture',
  'Film, Music & Pop',
  'Sports & Games',
  'Tech & Computing',
  'Nature & Biology',
  'World Affairs & Law',
  'Food, Craft & Design',
  'Myth & Literature',
  'Logic & Math',
];

/**
 * Renders 1 of 12 crisp sculpted theatrical SVG domain emblems (`domainId` 0..11)
 * matching `FORGE_DOMAINS` and the approved game-board & jukebox mockups.
 */
export function renderDomainEmblemSvg(domainId: number, sizePx = 38): string {
  const normalized = Number.isFinite(domainId) ? (((Math.trunc(domainId) % 12) + 12) % 12) : 0;
  const px = Math.max(18, Math.round(sizePx));
  const label = DOMAIN_NAMES_V5[normalized] ?? 'Trivia Domain';
  const g1 = uid(`dom_${normalized}_1`);
  const g2 = uid(`dom_${normalized}_2`);

  let defs = '';
  let shapes = '';

  switch (normalized) {
    case 0: // World History — Imperial Crown & Laurel
      defs = `
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8c4e0e" />
          <stop offset="55%" stop-color="#5e3007" />
          <stop offset="100%" stop-color="#361903" />
        </linearGradient>
        <linearGradient id="${g2}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffe794" />
          <stop offset="100%" stop-color="#b87216" />
        </linearGradient>
      `;
      shapes = `
        <path d="M 12 44 L 9 22 L 22 31 L 32 15 L 42 31 L 55 22 L 52 44 Z" fill="url(#${g1})" stroke="#2a1303" stroke-width="1.5" stroke-linejoin="round" />
        <rect x="12" y="45" width="40" height="7" rx="3" fill="url(#${g1})" stroke="#2a1303" stroke-width="1.3" />
        <circle cx="32" cy="14" r="3.4" fill="url(#${g2})" stroke="#3b1d04" stroke-width="1" />
        <circle cx="9.5" cy="21" r="2.7" fill="url(#${g2})" stroke="#3b1d04" stroke-width="0.9" />
        <circle cx="54.5" cy="21" r="2.7" fill="url(#${g2})" stroke="#3b1d04" stroke-width="0.9" />
        <circle cx="32" cy="36" r="3" fill="url(#${g2})" />
        <circle cx="21" cy="38" r="2" fill="url(#${g2})" />
        <circle cx="43" cy="38" r="2" fill="url(#${g2})" />
      `;
      break;

    case 1: // Science & Space — Ringed Saturn Planet (matches Cosmic Weirdos mockup!)
      defs = `
        <radialGradient id="${g1}" cx="36%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#8f45d6" />
          <stop offset="60%" stop-color="#581c87" />
          <stop offset="100%" stop-color="#2e0c4d" />
        </radialGradient>
        <linearGradient id="${g2}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#c084fc" />
          <stop offset="50%" stop-color="#6b21a8" />
          <stop offset="100%" stop-color="#3b0764" />
        </linearGradient>
      `;
      shapes = `
        <ellipse cx="32" cy="33" rx="26" ry="8.5" fill="none" stroke="url(#${g2})" stroke-width="4.4" transform="rotate(-22 32 33)" />
        <circle cx="32" cy="32" r="14.5" fill="url(#${g1})" stroke="#260842" stroke-width="1.4" />
        <path d="M 19 29 Q 32 23 45 27" fill="none" stroke="#e9d5ff" stroke-opacity="0.45" stroke-width="2" />
        <path d="M 9 42 A 26 8.5 -22 0 0 55 24" fill="none" stroke="#6b21a8" stroke-width="4.6" stroke-linecap="round" />
        <path d="M 10 41.5 A 26 8.5 -22 0 0 54 24.5" fill="none" stroke="#e9d5ff" stroke-opacity="0.65" stroke-width="1.4" stroke-linecap="round" />
        <polygon points="51,12 52.5,15.5 56,17 52.5,18.5 51,22 49.5,18.5 46,17 49.5,15.5" fill="#581c87" />
      `;
      break;

    case 2: // Geography & Wonders — Nautical Compass Rose (matches Map Traps mockup!)
      defs = `
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7c440d" />
          <stop offset="100%" stop-color="#3b1d04" />
        </linearGradient>
      `;
      shapes = `
        <circle cx="32" cy="32" r="22.5" fill="none" stroke="url(#${g1})" stroke-width="3.6" />
        <circle cx="32" cy="32" r="18" fill="none" stroke="#7c440d" stroke-opacity="0.45" stroke-width="1.1" />
        <polygon points="32,12 37,28 32,32 27,28" fill="#572c06" />
        <polygon points="32,52 37,36 32,32 27,36" fill="#9c5c19" />
        <polygon points="12,32 28,27 32,32 28,37" fill="#9c5c19" />
        <polygon points="52,32 36,27 32,32 36,37" fill="#572c06" />
        <polygon points="19,19 29,26 26,29" fill="#6b380a" />
        <polygon points="45,19 35,26 38,29" fill="#6b380a" />
        <polygon points="19,45 29,38 26,35" fill="#6b380a" />
        <polygon points="45,45 35,38 38,35" fill="#6b380a" />
        <circle cx="32" cy="32" r="4.2" fill="#ffe794" stroke="#452104" stroke-width="1.5" />
      `;
      break;

    case 3: // Arts & Architecture — Classical Ionic Column
      defs = `
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6b3c2c" />
          <stop offset="48%" stop-color="#a86a4c" />
          <stop offset="100%" stop-color="#452216" />
        </linearGradient>
      `;
      shapes = `
        <rect x="13" y="11" width="38" height="6" rx="2" fill="url(#${g1})" stroke="#2e150d" stroke-width="1.3" />
        <circle cx="17" cy="19" r="5" fill="#8f533a" stroke="#2e150d" stroke-width="1.4" />
        <circle cx="47" cy="19" r="5" fill="#8f533a" stroke="#2e150d" stroke-width="1.4" />
        <rect x="20" y="19" width="24" height="29" fill="url(#${g1})" stroke="#2e150d" stroke-width="1.4" />
        <line x1="26" y1="22" x2="26" y2="45" stroke="#f5dfbe" stroke-opacity="0.55" stroke-width="1.8" />
        <line x1="32" y1="22" x2="32" y2="45" stroke="#f5dfbe" stroke-opacity="0.55" stroke-width="1.8" />
        <line x1="38" y1="22" x2="38" y2="45" stroke="#f5dfbe" stroke-opacity="0.55" stroke-width="1.8" />
        <rect x="14" y="48" width="36" height="6.5" rx="2" fill="url(#${g1})" stroke="#2e150d" stroke-width="1.3" />
      `;
      break;

    case 4: // Film, Music & Pop — Comedy & Tragedy Theater Masks (matches Plot Twists mockup!)
      defs = `
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b52336" />
          <stop offset="100%" stop-color="#690e1c" />
        </linearGradient>
        <linearGradient id="${g2}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8c192b" />
          <stop offset="100%" stop-color="#470812" />
        </linearGradient>
      `;
      shapes = `
        <g transform="rotate(-11 23 32)">
          <path d="M 10 17 Q 23 13 35 19 L 33 38 C 31 46 25 50 19 49 C 13 48 9 43 9 35 Z" fill="url(#${g1})" stroke="#38060e" stroke-width="1.4" />
          <path d="M 15 28 Q 18 25 21 28 M 25 29 Q 28 26 31 29" fill="none" stroke="#fff4e6" stroke-width="2" stroke-linecap="round" />
          <path d="M 16 37 Q 22 43 29 38" fill="none" stroke="#fff4e6" stroke-width="2.2" stroke-linecap="round" />
        </g>
        <g transform="rotate(11 42 33)">
          <path d="M 29 19 Q 41 14 54 19 L 53 38 C 52 46 47 50 40 50 C 34 49 29 44 29 36 Z" fill="url(#${g2})" stroke="#38060e" stroke-width="1.4" />
          <line x1="35" y1="28" x2="39" y2="30" stroke="#fff4e6" stroke-width="2" stroke-linecap="round" />
          <line x1="48" y1="28" x2="44" y2="30" stroke="#fff4e6" stroke-width="2" stroke-linecap="round" />
          <path d="M 35 42 Q 41 37 47 42" fill="none" stroke="#fff4e6" stroke-width="2.1" stroke-linecap="round" />
        </g>
      `;
      break;

    case 5: // Sports & Games — Championship Chalice Trophy
      defs = `
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c95b12" />
          <stop offset="55%" stop-color="#8c3608" />
          <stop offset="100%" stop-color="#4d1a03" />
        </linearGradient>
      `;
      shapes = `
        <path d="M 19 15 H 45 V 27 C 45 36 39 42 32 42 C 25 42 19 36 19 27 Z" fill="url(#${g1})" stroke="#361202" stroke-width="1.5" />
        <path d="M 19 18 H 12 C 11 26 14 32 20 32 M 45 18 H 52 C 53 26 50 32 44 32" fill="none" stroke="#7c2e06" stroke-width="3.2" stroke-linecap="round" />
        <rect x="29" y="42" width="6" height="8" fill="#6b2705" />
        <rect x="20" y="49" width="24" height="6" rx="2.5" fill="url(#${g1})" stroke="#361202" stroke-width="1.4" />
        <polygon points="32,20 33.8,24.4 38.5,24.8 34.9,27.8 36,32.4 32,29.9 28,32.4 29.1,27.8 25.5,24.8 30.2,24.4" fill="#ffe694" />
      `;
      break;

    case 6: // Tech & Computing — Retro Audio Cassette (matches 90s Rewind mockup!)
      defs = `
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#116e78" />
          <stop offset="100%" stop-color="#073b42" />
        </linearGradient>
      `;
      shapes = `
        <rect x="8" y="16" width="48" height="32" rx="4.5" fill="url(#${g1})" stroke="#042429" stroke-width="1.6" />
        <rect x="13" y="21" width="38" height="16" rx="2.5" fill="#d8f8fa" fill-opacity="0.88" stroke="#063138" stroke-width="1.1" />
        <circle cx="22.5" cy="29" r="4.5" fill="#094a52" stroke="#042429" stroke-width="1.1" />
        <circle cx="41.5" cy="29" r="4.5" fill="#094a52" stroke="#042429" stroke-width="1.1" />
        <circle cx="22.5" cy="29" r="1.7" fill="#e6fcff" />
        <circle cx="41.5" cy="29" r="1.7" fill="#e6fcff" />
        <rect x="28" y="26.2" width="8" height="5.6" rx="1" fill="#094a52" />
        <polygon points="18,48 21,41 43,41 46,48" fill="#052b30" />
      `;
      break;

    case 7: // Nature & Biology — Botanical Leaf & DNA Helix
      defs = `
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#15804f" />
          <stop offset="100%" stop-color="#073d24" />
        </linearGradient>
      `;
      shapes = `
        <path d="M 14 50 C 12 24 28 11 52 12 C 52 36 39 51 14 50 Z" fill="url(#${g1})" stroke="#042918" stroke-width="1.6" />
        <path d="M 13 51 Q 31 33 49 15" fill="none" stroke="#a8ffcf" stroke-width="2.2" stroke-linecap="round" />
        <path d="M 24 40 L 24 28 M 33 31 L 33 21 M 31 33 L 42 33 M 23 41 L 34 41" fill="none" stroke="#a8ffcf" stroke-opacity="0.72" stroke-width="1.6" stroke-linecap="round" />
      `;
      break;

    case 8: // World Affairs & Law — Scales of Justice
      defs = `
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#7c5218" />
          <stop offset="100%" stop-color="#3b2307" />
        </linearGradient>
      `;
      shapes = `
        <line x1="32" y1="11" x2="32" y2="49" stroke="url(#${g1})" stroke-width="3.6" stroke-linecap="round" />
        <line x1="12" y1="20" x2="52" y2="20" stroke="url(#${g1})" stroke-width="3.2" stroke-linecap="round" />
        <circle cx="32" cy="14" r="3.4" fill="#ffe58c" stroke="#3b2307" stroke-width="1.2" />
        <path d="M 15 20 L 9 35 H 21 Z M 49 20 L 43 35 H 55 Z" fill="none" stroke="#5c390e" stroke-width="1.6" stroke-linejoin="round" />
        <path d="M 8 35 A 7 6 0 0 0 22 35 Z M 42 35 A 7 6 0 0 0 56 35 Z" fill="url(#${g1})" stroke="#2e1a05" stroke-width="1.1" />
        <rect x="20" y="48" width="24" height="5.5" rx="2.5" fill="url(#${g1})" stroke="#2e1a05" stroke-width="1.3" />
      `;
      break;

    case 9: // Food, Craft & Design — Domed Culinary Cloche
      defs = `
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b85826" />
          <stop offset="100%" stop-color="#5c230a" />
        </linearGradient>
      `;
      shapes = `
        <circle cx="32" cy="17" r="4" fill="url(#${g1})" stroke="#3b1506" stroke-width="1.3" />
        <path d="M 11 43 A 21 21 0 0 1 53 43 Z" fill="url(#${g1})" stroke="#3b1506" stroke-width="1.6" />
        <path d="M 19 36 A 14 14 0 0 1 32 24" fill="none" stroke="#ffdfb8" stroke-opacity="0.65" stroke-width="2.2" stroke-linecap="round" />
        <rect x="7" y="43" width="50" height="6.5" rx="3" fill="#4f1e09" stroke="#2e1004" stroke-width="1.2" />
      `;
      break;

    case 10: // Myth & Literature — Winged Olympian Helmet (matches Topic Jukebox!)
      defs = `
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6b37b8" />
          <stop offset="100%" stop-color="#2e125c" />
        </linearGradient>
        <linearGradient id="${g2}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffe794" />
          <stop offset="100%" stop-color="#b87618" />
        </linearGradient>
      `;
      shapes = `
        <path d="M 20 34 C 20 18 26 12 32 12 C 38 12 44 18 44 34 L 46 50 L 36 47 V 34 H 28 V 47 L 18 50 Z" fill="url(#${g1})" stroke="#1d093d" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M 22 25 L 8 15 L 12 24 L 9 29 L 21 31 Z M 42 25 L 56 15 L 52 24 L 55 29 L 43 31 Z" fill="url(#${g2})" stroke="#3b2004" stroke-width="1.1" stroke-linejoin="round" />
        <line x1="32" y1="14" x2="32" y2="33" stroke="#e9d5ff" stroke-opacity="0.55" stroke-width="2" />
      `;
      break;

    case 11: // Logic & Math — Faceted Isometric Geometric Prism
    default:
      defs = `
        <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#9e6d12" />
          <stop offset="100%" stop-color="#4a2e04" />
        </linearGradient>
        <linearGradient id="${g2}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff0a8" />
          <stop offset="100%" stop-color="#c9891e" />
        </linearGradient>
      `;
      shapes = `
        <polygon points="32,8 54,21 54,43 32,56 10,43 10,21" fill="url(#${g1})" stroke="#331c03" stroke-width="1.6" />
        <polygon points="32,8 54,21 32,33 10,21" fill="url(#${g2})" fill-opacity="0.78" />
        <line x1="32" y1="33" x2="32" y2="56" stroke="#fff3c2" stroke-opacity="0.7" stroke-width="1.8" />
        <line x1="32" y1="33" x2="10" y2="21" stroke="#fff3c2" stroke-opacity="0.65" stroke-width="1.5" />
        <line x1="32" y1="33" x2="54" y2="21" stroke="#fff3c2" stroke-opacity="0.65" stroke-width="1.5" />
      `;
      break;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${px}" height="${px}" class="v5-svg-domain-emblem v5-svg-domain--${normalized}" role="img" aria-label="${escapeXml(label)}">
  <defs>${defs}</defs>
  ${shapes}
</svg>`;
}

// ============================================================================
// 7. SPECIAL BOARD TWIST EMBLEMS & STORY CHOICE GEMSTONES (Peer Helpers)
// ============================================================================

/**
 * Renders crisp sculpted SVG emblems for special stage board twist tiles
 * (`WHEEL_CURVEBALL`, `LIGHTNING_BLITZ` time-bomb, `RIVAL_BOUNTY` crosshair,
 * `POWER_PLAY` double diamond, `CROWN_WEDGE` jewel crown).
 */
export function renderTwistEmblemSvg(
  twist: TwistEmblemInputV5,
  sizePx = 40,
): string {
  const px = Math.max(18, Math.round(sizePx));
  const g1 = uid('tw_1');
  const g2 = uid('tw_2');

  switch (twist) {
    case 'WHEEL_CURVEBALL':
    case 'WHEEL':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${px}" height="${px}" class="v5-svg-twist v5-svg-twist--wheel" role="img" aria-label="Spin the Show Wheel">
  <defs>
    <radialGradient id="${g1}" cx="45%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fff8cc" />
      <stop offset="55%" stop-color="#f0a824" />
      <stop offset="100%" stop-color="#874807" />
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="24" fill="url(#${g1})" stroke="#4d2604" stroke-width="2.4" />
  <g stroke="#5c2d06" stroke-width="2">
    <line x1="32" y1="8" x2="32" y2="56" />
    <line x1="11.2" y1="20" x2="52.8" y2="44" />
    <line x1="52.8" y1="20" x2="11.2" y2="44" />
  </g>
  <circle cx="32" cy="32" r="6" fill="#fff4bd" stroke="#4d2604" stroke-width="1.8" />
  <polygon points="32,3 37,13 27,13" fill="#fff5be" stroke="#4d2604" stroke-width="1.3" />
</svg>`;

    case 'LIGHTNING_BLITZ':
    case 'TIME_BOMB':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${px}" height="${px}" class="v5-svg-twist v5-svg-twist--blitz" role="img" aria-label="Time-Bomb Blitz">
  <defs>
    <radialGradient id="${g1}" cx="35%" cy="32%" r="66%">
      <stop offset="0%" stop-color="#9e4d2c" />
      <stop offset="55%" stop-color="#4d1c0e" />
      <stop offset="100%" stop-color="#1f0904" />
    </radialGradient>
  </defs>
  <circle cx="29" cy="38" r="18.5" fill="url(#${g1})" stroke="#2b0c05" stroke-width="1.8" />
  <rect x="24" y="16" width="10" height="6" rx="2" fill="#7c4614" stroke="#2b0c05" stroke-width="1.2" />
  <path d="M 30 16 Q 35 8 44 12" fill="none" stroke="#7c4614" stroke-width="3" stroke-linecap="round" />
  <polygon points="48,7 50,12 56,12 51,15.5 53,21 48,17.5 43,21 45,15.5 40,12 46,12" fill="#ffb82e" stroke="#b8250e" stroke-width="1" />
  <ellipse cx="22" cy="31" rx="5.5" ry="3.2" fill="#ffffff" fill-opacity="0.34" transform="rotate(-32 22 31)" />
</svg>`;

    case 'RIVAL_BOUNTY':
    case 'BOUNTY':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${px}" height="${px}" class="v5-svg-twist v5-svg-twist--bounty" role="img" aria-label="Rival Bounty">
  <defs>
    <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff4b0" />
      <stop offset="55%" stop-color="#ff9924" />
      <stop offset="100%" stop-color="#e03212" />
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="20" fill="none" stroke="url(#${g1})" stroke-width="3.6" />
  <circle cx="32" cy="32" r="10.5" fill="none" stroke="url(#${g1})" stroke-width="2.4" />
  <circle cx="32" cy="32" r="3.6" fill="#fff4b0" />
  <g stroke="url(#${g1})" stroke-width="3.2" stroke-linecap="round">
    <line x1="32" y1="6" x2="32" y2="18" />
    <line x1="32" y1="46" x2="32" y2="58" />
    <line x1="6" y1="32" x2="18" y2="32" />
    <line x1="46" y1="32" x2="58" y2="32" />
  </g>
</svg>`;

    case 'POWER_PLAY':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${px}" height="${px}" class="v5-svg-twist v5-svg-twist--power" role="img" aria-label="Power Play Wager">
  <defs>
    <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff6c7" />
      <stop offset="50%" stop-color="#4dc3ff" />
      <stop offset="100%" stop-color="#f2b838" />
    </linearGradient>
  </defs>
  <polygon points="32,6 56,32 32,58 8,32" fill="url(#${g1})" stroke="#0b245c" stroke-width="2" />
  <polygon points="32,14 48,32 32,50 16,32" fill="#0d2a73" stroke="#fff2b5" stroke-width="1.6" />
  <text x="32" y="38" text-anchor="middle" fill="#fff6c4" font-family="Cinzel, Georgia, serif" font-size="16" font-weight="800">2×</text>
</svg>`;

    case 'CROWN_WEDGE':
    case 'WEDGE':
    case 'SPOTLIGHT_SWEEP':
    case 'NONE':
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${px}" height="${px}" class="v5-svg-twist v5-svg-twist--wedge" role="img" aria-label="Crown Wedge Jewel">
  <defs>
    <linearGradient id="${g1}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff7c4" />
      <stop offset="50%" stop-color="#f0b429" />
      <stop offset="100%" stop-color="#874d09" />
    </linearGradient>
    <radialGradient id="${g2}" cx="40%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#b8ffdf" />
      <stop offset="55%" stop-color="#1fd67d" />
      <stop offset="100%" stop-color="#075933" />
    </radialGradient>
  </defs>
  <polygon points="32,7 55,24 46,54 18,54 9,24" fill="url(#${g1})" stroke="#452405" stroke-width="1.8" />
  <polygon points="32,14 48,26 42,48 22,48 16,26" fill="url(#${g2})" stroke="#fff4c4" stroke-width="1.3" />
  <polygon points="32,18 42,27 32,37 22,27" fill="#ffffff" fill-opacity="0.34" />
</svg>`;
  }
}

/**
 * Renders the faceted 3D diamond gemstone (Topaz Gold, Emerald, or Aquamarine
 * Cyan) set in brushed brass for `.v5-choice-blade` story choices.
 */
export function renderChoiceGemSvg(
  attitude: DialogueAttitudeV5,
  sizePx = 40,
): string {
  const px = Math.max(20, Math.round(sizePx));
  const gBrass = uid('cg_br');
  const gGem = uid('cg_gm');

  const palette =
    attitude === 'WARM_RESPECT'
      ? { hi: '#d6ffea', mid: '#1ed17d', deep: '#065732', label: 'Respect' }
      : attitude === 'SHARP_WIT'
        ? { hi: '#d8fbff', mid: '#22d3ee', deep: '#085770', label: 'Witty' }
        : { hi: '#fff6ba', mid: '#f5a623', deep: '#8a4104', label: 'Bold' };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 54" width="${px}" height="${Math.round(px * 1.125)}" class="v5-svg-choice-gem" role="img" aria-label="${palette.label} Attitude Jewel">
  <defs>
    <linearGradient id="${gBrass}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff4bf" />
      <stop offset="50%" stop-color="#d6952e" />
      <stop offset="100%" stop-color="#5c3508" />
    </linearGradient>
    <radialGradient id="${gGem}" cx="36%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${palette.hi}" />
      <stop offset="50%" stop-color="${palette.mid}" />
      <stop offset="100%" stop-color="${palette.deep}" />
    </radialGradient>
  </defs>
  <polygon points="24,2 46,27 24,52 2,27" fill="url(#${gBrass})" stroke="#3b1f04" stroke-width="1.8" />
  <polygon points="24,8 40,27 24,46 8,27" fill="url(#${gGem})" stroke="#ffffff" stroke-opacity="0.48" stroke-width="1" />
  <polygon points="24,13 34,27 24,33 14,27" fill="#ffffff" fill-opacity="0.34" />
  <line x1="24" y1="8" x2="24" y2="46" stroke="#ffffff" stroke-opacity="0.24" stroke-width="0.9" />
</svg>`;
}

// ============================================================================
// 8. SAFE DOM MOUNTING HELPERS
// ============================================================================

/**
 * Parses a sculpted SVG string from this module into a live detached
 * `SVGSVGElement` node without mutating any parent container.
 */
export function createSvgElementFromMarkup(svgMarkup: string): SVGSVGElement {
  const host = document.createElement('div');
  host.innerHTML = svgMarkup.trim();
  const svg = host.firstElementChild;
  if (!(svg instanceof SVGSVGElement)) {
    throw new Error('TactileSvgCraft: markup did not produce a root <svg> element.');
  }
  return svg;
}

/**
 * Safely mounts a sculpted SVG string into `container`, replacing its children
 * and returning the mounted `SVGSVGElement`.
 */
export function mountSvgInto(container: HTMLElement, svgMarkup: string): SVGSVGElement {
  const svg = createSvgElementFromMarkup(svgMarkup);
  container.replaceChildren(svg);
  return svg;
}
