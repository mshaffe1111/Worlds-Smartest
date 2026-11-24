// ============================================================================
// WORLD'S SMARTEST v6.0 — StageCastPortraitsV6.ts
// High-Resolution Stylized 3D/Vector-Painted Broadcast Monitor Cameo Badges
// - Crisp DPR-aware Canvas2D architectural silhouettes & bespoke character props
// - Brushed-brass / gunmetal Sony-PVM control-room monitor bezel + tally lamp
// - ZERO low-res blotchy cutouts, ZERO OS emojis, ZERO SVG blurred text
// ============================================================================

import type { StageWorldIdV6 } from '../contracts_v6.ts';

export type CastPortraitKeyV6 =
  | 'julian_sterling'
  | 'frankie_deluca'
  | 'sloane_mercer'
  | 'rival_01_barnaby'
  | 'rival_02_sabine'
  | 'rival_03_mireille'
  | 'rival_04_alistair'
  | 'rival_05_walter'
  | 'rival_06_kenzo'
  | 'rival_07_delilah'
  | 'rival_08_henrik'
  | 'rival_09_nadia'
  | 'rival_10_arthur';

export type CastPortraitMoodV6 =
  | 'neutral'
  | 'icy'
  | 'wry'
  | 'smug'
  | 'suspicious'
  | 'annoyed'
  | 'scheming'
  | 'shocked'
  | 'tense'
  | 'impressed'
  | 'dramatic'
  | 'triumphant';

export interface CastPortraitPaletteV6 {
  key: CastPortraitKeyV6;
  displayName: string;
  roleTag: string;
  backdropTop: string;
  backdropBottom: string;
  rimHex: string;
  accentHex: string;
  silhouetteHex: string;
  coatHex: string;
  detailHex: string;
}

export interface CastPortraitRenderOptionsV6 {
  portraitKey: CastPortraitKeyV6;
  sizePx?: number;
  speaking?: boolean;
  mood?: CastPortraitMoodV6;
  stageTintHex?: string;
  dpr?: number;
}

export interface CastMonitorBadgeOptionsV6 extends CastPortraitRenderOptionsV6 {
  displayName?: string;
  roleTag?: string;
  showNameplate?: boolean;
  compact?: boolean;
}

export interface CastMonitorBadgeHandleV6 {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  update(patch: Partial<CastMonitorBadgeOptionsV6>): void;
  destroy(): void;
}

const PORTRAIT_PALETTES: Record<CastPortraitKeyV6, CastPortraitPaletteV6> = {
  julian_sterling: {
    key: 'julian_sterling',
    displayName: 'Julian Sterling',
    roleTag: '30-Year Host',
    backdropTop: '#241812',
    backdropBottom: '#0E0907',
    rimHex: '#F3C86A',
    accentHex: '#D9A441',
    silhouetteHex: '#181312',
    coatHex: '#1E1A22',
    detailHex: '#F5E7C4',
  },
  frankie_deluca: {
    key: 'frankie_deluca',
    displayName: 'Frankie "The Fixer" DeLuca',
    roleTag: 'Local 52 Prop Master',
    backdropTop: '#291710',
    backdropBottom: '#110A08',
    rimHex: '#F08B55',
    accentHex: '#C85A32',
    silhouetteHex: '#1A1311',
    coatHex: '#2C221E',
    detailHex: '#E5B46B',
  },
  sloane_mercer: {
    key: 'sloane_mercer',
    displayName: 'Sloane Mercer',
    roleTag: 'VP Standards & Ratings',
    backdropTop: '#10212A',
    backdropBottom: '#081016',
    rimHex: '#7AD4EE',
    accentHex: '#4C8FA8',
    silhouetteHex: '#11181E',
    coatHex: '#1A242B',
    detailHex: '#CDEBF5',
  },
  rival_01_barnaby: {
    key: 'rival_01_barnaby',
    displayName: 'Barnaby "Two-Takes" Vance',
    roleTag: '1987 Soap-Opera Runner-Up',
    backdropTop: '#2E1018',
    backdropBottom: '#12070A',
    rimHex: '#F06A7B',
    accentHex: '#B83A4B',
    silhouetteHex: '#1B1014',
    coatHex: '#2D141D',
    detailHex: '#F2CF8D',
  },
  rival_02_sabine: {
    key: 'rival_02_sabine',
    displayName: 'Dr. Sabine Vogt',
    roleTag: 'Ex-CERN Master Horologist',
    backdropTop: '#26201D',
    backdropBottom: '#120F0E',
    rimHex: '#F0BEA0',
    accentHex: '#D49B7A',
    silhouetteHex: '#1B1817',
    coatHex: '#2A2524',
    detailHex: '#F5DEC8',
  },
  rival_03_mireille: {
    key: 'rival_03_mireille',
    displayName: 'Countess Mireille de Valois',
    roleTag: 'Disinherited Riviera Heiress',
    backdropTop: '#0E261E',
    backdropBottom: '#07120E',
    rimHex: '#6AE0B4',
    accentHex: '#2F9E77',
    silhouetteHex: '#0F1A17',
    coatHex: '#162922',
    detailHex: '#F5E7C1',
  },
  rival_04_alistair: {
    key: 'rival_04_alistair',
    displayName: 'Capt. Alistair Finch-Harrow',
    roleTag: 'Disputed Expedition Author',
    backdropTop: '#122628',
    backdropBottom: '#081214',
    rimHex: '#73CFCB',
    accentHex: '#3A8D8C',
    silhouetteHex: '#141B1A',
    coatHex: '#28261E',
    detailHex: '#DFBE7E',
  },
  rival_05_walter: {
    key: 'rival_05_walter',
    displayName: 'Walter "Redline" Kowalski',
    roleTag: 'Sub-Level 5 Radar Squatter',
    backdropTop: '#222114',
    backdropBottom: '#0E0E08',
    rimHex: '#FF9E44',
    accentHex: '#D9792B',
    silhouetteHex: '#171813',
    coatHex: '#27291E',
    detailHex: '#FFB55E',
  },
  rival_06_kenzo: {
    key: 'rival_06_kenzo',
    displayName: 'Kenzo Taniguchi',
    roleTag: 'Michelin-Snubbed Critic',
    backdropTop: '#2A110E',
    backdropBottom: '#100706',
    rimHex: '#F26C57',
    accentHex: '#C73E2D',
    silhouetteHex: '#141111',
    coatHex: '#1D1818',
    detailHex: '#E8C266',
  },
  rival_07_delilah: {
    key: 'rival_07_delilah',
    displayName: 'Delilah "Nickel-Slot" Kerr',
    roleTag: 'Blacklisted Pier Hustler',
    backdropTop: '#281B0F',
    backdropBottom: '#110B07',
    rimHex: '#F7B45C',
    accentHex: '#D48834',
    silhouetteHex: '#191310',
    coatHex: '#2D2018',
    detailHex: '#F7E7C8',
  },
  rival_08_henrik: {
    key: 'rival_08_henrik',
    displayName: 'Dr. Henrik Lindholm',
    roleTag: 'Tax-Exile Deep-Sea Salvager',
    backdropTop: '#0E202C',
    backdropBottom: '#060E14',
    rimHex: '#6EC8EA',
    accentHex: '#3A88A8',
    silhouetteHex: '#10181F',
    coatHex: '#1B2730',
    detailHex: '#D9A760',
  },
  rival_09_nadia: {
    key: 'rival_09_nadia',
    displayName: 'Nadia Okafor-Voss',
    roleTag: 'Banned Academic Menace',
    backdropTop: '#1A1430',
    backdropBottom: '#0A0816',
    rimHex: '#B69EFF',
    accentHex: '#7A62D4',
    silhouetteHex: '#14111F',
    coatHex: '#211B33',
    detailHex: '#DDF2FF',
  },
  rival_10_arthur: {
    key: 'rival_10_arthur',
    displayName: 'Arthur "The Archivist" Pendelton',
    roleTag: '1994 Retainer Closer',
    backdropTop: '#251D0E',
    backdropBottom: '#0C0905',
    rimHex: '#FCE08B',
    accentHex: '#E3B84F',
    silhouetteHex: '#15120D',
    coatHex: '#221D16',
    detailHex: '#F7E7BE',
  },
};

const STAGE_TO_CHAMPION_PORTRAIT: Record<StageWorldIdV6, CastPortraitKeyV6> = {
  STAGE_01_VAUDEVILLE_PALACE: 'rival_01_barnaby',
  STAGE_02_GENEVA_CONSERVATORY: 'rival_02_sabine',
  STAGE_03_MONTE_CARLO_SALON: 'rival_03_mireille',
  STAGE_04_CARTOGRAPHIC_ROTUNDA: 'rival_04_alistair',
  STAGE_05_ANALOG_BUNKER_1969: 'rival_05_walter',
  STAGE_06_KYOTO_LACQUER_PAVILION: 'rival_06_kenzo',
  STAGE_07_CARNIVAL_CURIOSITIES: 'rival_07_delilah',
  STAGE_08_SUNKEN_BATHYSPHERE: 'rival_08_henrik',
  STAGE_09_ASTRAL_OBSERVATORY: 'rival_09_nadia',
  STAGE_10_SOVEREIGN_COLOSSEUM: 'rival_10_arthur',
};

let portraitStylesInjected = false;

export function getCastPortraitPalette(key: CastPortraitKeyV6): CastPortraitPaletteV6 {
  return PORTRAIT_PALETTES[key];
}

export function getChampionPortraitKeyForStage(stageWorldId: StageWorldIdV6): CastPortraitKeyV6 {
  return STAGE_TO_CHAMPION_PORTRAIT[stageWorldId];
}

export function resolvePortraitKeyForSpeaker(
  speakerId: 'FRANKIE' | 'JULIAN' | 'SLOANE' | 'RIVAL',
  stageWorldId?: StageWorldIdV6,
  rivalId?: string,
): CastPortraitKeyV6 {
  if (speakerId === 'JULIAN') return 'julian_sterling';
  if (speakerId === 'FRANKIE') return 'frankie_deluca';
  if (speakerId === 'SLOANE') return 'sloane_mercer';
  if (rivalId && rivalId in PORTRAIT_PALETTES) {
    return rivalId as CastPortraitKeyV6;
  }
  if (stageWorldId) {
    return STAGE_TO_CHAMPION_PORTRAIT[stageWorldId];
  }
  return 'rival_01_barnaby';
}

export function getAllCastPortraitKeys(): CastPortraitKeyV6[] {
  return Object.keys(PORTRAIT_PALETTES) as CastPortraitKeyV6[];
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function drawScrew(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  grad.addColorStop(0, '#F5DF9F');
  grad.addColorStop(0.55, '#9F7A38');
  grad.addColorStop(1, '#3B2C13');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20, 14, 8, 0.78)';
  ctx.lineWidth = Math.max(0.7, r * 0.34);
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.62, cy - r * 0.25);
  ctx.lineTo(cx + r * 0.62, cy + r * 0.25);
  ctx.stroke();
}

function drawArchitecturalBackdrop(
  ctx: CanvasRenderingContext2D,
  palette: CastPortraitPaletteV6,
  speaking: boolean,
  mood: CastPortraitMoodV6,
  stageTintHex?: string,
): void {
  // Normalized 100x100 internal coordinate space
  const bg = ctx.createLinearGradient(0, 6, 0, 94);
  bg.addColorStop(0, palette.backdropTop);
  bg.addColorStop(1, palette.backdropBottom);
  ctx.fillStyle = bg;
  ctx.fillRect(6, 6, 88, 88);

  // Subtle stage-tinted key halo behind head
  const rimColor = stageTintHex ?? palette.rimHex;
  const halo = ctx.createRadialGradient(50, 40, 4, 50, 44, 42);
  halo.addColorStop(0, speaking ? `${rimColor}66` : `${rimColor}3D`);
  halo.addColorStop(0.55, `${palette.accentHex}1F`);
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(6, 6, 88, 88);

  // Art-Deco broadcast drafting arcs (clean geometric architectural motif)
  ctx.save();
  ctx.strokeStyle = `${palette.rimHex}38`;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(50, 46, 33, Math.PI * 1.12, Math.PI * 1.88);
  ctx.stroke();
  ctx.strokeStyle = `${palette.accentHex}24`;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(50, 46, 38.5, Math.PI * 1.06, Math.PI * 1.94);
  ctx.stroke();

  // Subtle corner broadcast calibration ticks
  ctx.strokeStyle = `${palette.detailHex}44`;
  ctx.lineWidth = 0.8;
  const corners: Array<[number, number, number, number]> = [
    [13, 15, 1, 1],
    [87, 15, -1, 1],
    [13, 86, 1, -1],
    [87, 86, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * 4.5);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * 4.5, y);
    ctx.stroke();
  }

  // Subtle mood accent beam
  if (mood === 'shocked' || mood === 'dramatic' || mood === 'tense') {
    const diag = ctx.createLinearGradient(10, 10, 90, 90);
    diag.addColorStop(0, `${palette.rimHex}2E`);
    diag.addColorStop(0.5, 'rgba(0,0,0,0)');
    diag.addColorStop(1, `${palette.accentHex}22`);
    ctx.fillStyle = diag;
    ctx.fillRect(6, 6, 88, 88);
  }
  ctx.restore();
}

function drawCameoSilhouette(
  ctx: CanvasRenderingContext2D,
  key: CastPortraitKeyV6,
  palette: CastPortraitPaletteV6,
): void {
  ctx.save();

  // Shared sculpted torso base (tailored per cast member below)
  const paintBustBase = (shoulderWidth: number, neckW = 6.2, headY = 39.5, headRx = 12.2, headRy = 15.2) => {
    // Rim highlight shadow offset behind silhouette
    ctx.save();
    ctx.fillStyle = palette.rimHex;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.ellipse(51.3, headY - 0.8, headRx + 0.8, headRy + 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Coat / shoulders
    ctx.fillStyle = palette.coatHex;
    ctx.beginPath();
    ctx.moveTo(50 - shoulderWidth, 94);
    ctx.quadraticCurveTo(50 - shoulderWidth * 0.96, 69, 50 - neckW - 2, 62);
    ctx.lineTo(50 + neckW + 2, 62);
    ctx.quadraticCurveTo(50 + shoulderWidth * 0.96, 69, 50 + shoulderWidth, 94);
    ctx.closePath();
    ctx.fill();

    // Rim edge on right shoulder
    ctx.strokeStyle = `${palette.rimHex}AA`;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(50 + neckW + 2, 62.5);
    ctx.quadraticCurveTo(50 + shoulderWidth * 0.94, 69.5, 50 + shoulderWidth - 0.8, 93);
    ctx.stroke();

    // Neck
    ctx.fillStyle = palette.silhouetteHex;
    ctx.fillRect(50 - neckW, 51, neckW * 2, 14);

    // Sculpted head silhouette
    ctx.fillStyle = palette.silhouetteHex;
    ctx.beginPath();
    ctx.ellipse(50, headY, headRx, headRy, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle Art-Deco cameo jawline & rim-light temple crescent
    ctx.fillStyle = `${palette.rimHex}30`;
    ctx.beginPath();
    ctx.ellipse(54.4, headY + 0.8, headRx * 0.56, headRy * 0.72, 0.14, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.fill();
    ctx.strokeStyle = `${palette.rimHex}CC`;
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.ellipse(50.3, headY, headRx + 0.1, headRy + 0.1, 0, -Math.PI * 0.36, Math.PI * 0.34);
    ctx.stroke();
  };

  switch (key) {
    case 'julian_sterling': {
      paintBustBase(34, 6.4, 39.5, 12.2, 15.0);
      // Swept silver-fox pompadour wave
      ctx.fillStyle = palette.detailHex;
      ctx.beginPath();
      ctx.moveTo(37.5, 34);
      ctx.quadraticCurveTo(40, 19.5, 54.5, 22);
      ctx.quadraticCurveTo(63, 24.5, 62.5, 34.5);
      ctx.quadraticCurveTo(55, 27.5, 42, 29.5);
      ctx.closePath();
      ctx.fill();
      // Tuxedo crisp white V-shirt + satin bow tie
      ctx.fillStyle = palette.detailHex;
      ctx.beginPath();
      ctx.moveTo(43.5, 62);
      ctx.lineTo(50, 77);
      ctx.lineTo(56.5, 62);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = palette.accentHex;
      ctx.beginPath();
      ctx.moveTo(44.2, 63.2);
      ctx.lineTo(50, 66);
      ctx.lineTo(55.8, 63.2);
      ctx.lineTo(55.8, 68.8);
      ctx.lineTo(50, 66);
      ctx.lineTo(44.2, 68.8);
      ctx.closePath();
      ctx.fill();
      // Gold pocket square
      ctx.fillStyle = palette.rimHex;
      ctx.beginPath();
      ctx.moveTo(64, 78);
      ctx.lineTo(71, 75.5);
      ctx.lineTo(72, 80.5);
      ctx.closePath();
      ctx.fill();
      // Iconic vintage ribbon microphone capsule entering lower-left
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(22, 94);
      ctx.lineTo(27.5, 76);
      ctx.stroke();
      ctx.fillStyle = '#382B19';
      roundedRectPath(ctx, 23, 63, 9.5, 14, 4.5);
      ctx.fill();
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.1;
      ctx.stroke();
      for (let ly = 66.5; ly <= 74; ly += 2.5) {
        ctx.beginPath();
        ctx.moveTo(24.8, ly);
        ctx.lineTo(30.7, ly);
        ctx.stroke();
      }
      break;
    }

    case 'frankie_deluca': {
      paintBustBase(31.5, 5.6, 40.5, 11.4, 14.2);
      // Side ponytail + sharp practical bob
      ctx.fillStyle = palette.silhouetteHex;
      ctx.beginPath();
      ctx.moveTo(60, 32);
      ctx.quadraticCurveTo(72, 34, 70, 49);
      ctx.quadraticCurveTo(64, 46, 60.5, 41);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(50, 36.5, 12.8, Math.PI * 0.95, Math.PI * 2.05);
      ctx.fill();
      // Signature brass prop-maker goggles perched on brow!
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.6;
      ctx.fillStyle = '#3B2316';
      ctx.beginPath();
      ctx.arc(44.8, 30.2, 4.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(55.2, 30.2, 4.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = `${palette.rimHex}99`;
      ctx.beginPath();
      ctx.arc(43.8, 29.1, 1.4, 0, Math.PI * 2);
      ctx.arc(54.2, 29.1, 1.4, 0, Math.PI * 2);
      ctx.fill();
      // Union collar flaps + brass wrench lapel badge
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(41, 63);
      ctx.lineTo(48, 76);
      ctx.moveTo(59, 63);
      ctx.lineTo(52, 76);
      ctx.stroke();
      // Coiled brass wire accent at bottom-right
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(71, 82, 5.5, 0, Math.PI * 1.65);
      ctx.stroke();
      break;
    }

    case 'sloane_mercer': {
      paintBustBase(32, 5.4, 40, 11.2, 14.4);
      // Razor-sharp asymmetric architectural bob
      ctx.fillStyle = palette.silhouetteHex;
      ctx.beginPath();
      ctx.moveTo(35.5, 48);
      ctx.lineTo(37.5, 27);
      ctx.quadraticCurveTo(50, 20.5, 62.5, 27.5);
      ctx.lineTo(64.5, 51);
      ctx.lineTo(58.5, 47);
      ctx.lineTo(58.5, 33);
      ctx.lineTo(40.5, 33);
      ctx.lineTo(40.5, 46);
      ctx.closePath();
      ctx.fill();
      // Icy angular executive spectacles with cyan lens glint
      ctx.fillStyle = '#0D2633';
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.3;
      roundedRectPath(ctx, 39.2, 36.2, 9.2, 5.4, 1.2);
      ctx.fill();
      ctx.stroke();
      roundedRectPath(ctx, 51.6, 36.2, 9.2, 5.4, 1.2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(48.4, 38.6);
      ctx.lineTo(51.6, 38.6);
      ctx.stroke();
      // Sharp glare slash on lenses
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(41, 40.5);
      ctx.lineTo(44.8, 37.2);
      ctx.moveTo(53.4, 40.5);
      ctx.lineTo(57.2, 37.2);
      ctx.stroke();
      // Structured high-collar blazer + silver compliance diamond pin
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(39, 63);
      ctx.lineTo(50, 82);
      ctx.lineTo(61, 63);
      ctx.stroke();
      ctx.fillStyle = palette.detailHex;
      ctx.beginPath();
      ctx.moveTo(64, 73);
      ctx.lineTo(67.2, 76.2);
      ctx.lineTo(64, 79.4);
      ctx.lineTo(60.8, 76.2);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'rival_01_barnaby': {
      paintBustBase(34, 6.2, 39.5, 11.8, 14.8);
      // Theatrical swept matinee pompadour (3/4 dramatic flair)
      ctx.fillStyle = palette.silhouetteHex;
      ctx.beginPath();
      ctx.moveTo(37, 34);
      ctx.quadraticCurveTo(36, 17, 56, 20.5);
      ctx.quadraticCurveTo(66, 23, 62.5, 35);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(41, 24);
      ctx.quadraticCurveTo(51, 20.5, 59, 25);
      ctx.stroke();
      // Velvet ascot + gold pin
      ctx.fillStyle = palette.accentHex;
      ctx.beginPath();
      ctx.moveTo(43, 62);
      ctx.quadraticCurveTo(50, 74, 57, 62);
      ctx.lineTo(54, 78);
      ctx.lineTo(46, 78);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = palette.detailHex;
      ctx.beginPath();
      ctx.arc(50, 68.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'rival_02_sabine': {
      paintBustBase(30.5, 5.4, 40.5, 11.2, 14.0);
      // Tight Swiss top-knot bun
      ctx.fillStyle = palette.silhouetteHex;
      ctx.beginPath();
      ctx.arc(50, 21.5, 6.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.0;
      ctx.stroke();
      // Watchmaker brass loupe over right eye
      ctx.fillStyle = '#2B1F19';
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(55, 39, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = `${palette.rimHex}88`;
      ctx.beginPath();
      ctx.arc(53.8, 37.8, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Crisp high turtleneck collar + escapement gear ring behind head
      ctx.strokeStyle = `${palette.detailHex}88`;
      ctx.lineWidth = 1.0;
      ctx.setLineDash([2.4, 2.0]);
      ctx.beginPath();
      ctx.arc(50, 40, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    case 'rival_03_mireille': {
      paintBustBase(30, 5.1, 41.5, 10.8, 13.8);
      // Sculptural 1962 Riviera wide-brim hat!
      ctx.fillStyle = palette.silhouetteHex;
      ctx.beginPath();
      ctx.ellipse(50, 28, 28, 6.2, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(50, 25, 12.2, 7.2, -0.06, Math.PI, Math.PI * 2);
      ctx.fill();
      // Pearl drop earring + emerald stole clasp
      ctx.fillStyle = palette.detailHex;
      ctx.beginPath();
      ctx.arc(38.2, 46.5, 2.0, 0, Math.PI * 2);
      ctx.arc(61.8, 46.5, 2.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(34, 70);
      ctx.quadraticCurveTo(50, 77, 66, 70);
      ctx.stroke();
      break;
    }

    case 'rival_04_alistair': {
      paintBustBase(33.5, 6.4, 41, 11.8, 14.2);
      // Pith expedition helmet dome & brim
      ctx.fillStyle = palette.coatHex;
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(50, 30.5, 15.2, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = palette.silhouetteHex;
      ctx.beginPath();
      ctx.ellipse(50, 31, 21, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Waxed handlebar mustache!
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(50, 47.5);
      ctx.quadraticCurveTo(43, 45.5, 38.5, 49);
      ctx.moveTo(50, 47.5);
      ctx.quadraticCurveTo(57, 45.5, 61.5, 49);
      ctx.stroke();
      // Safari shoulder epaulettes
      ctx.fillStyle = palette.detailHex;
      ctx.fillRect(26, 68, 9, 2.4);
      ctx.fillRect(65, 68, 9, 2.4);
      break;
    }

    case 'rival_05_walter': {
      paintBustBase(34, 6.6, 40.5, 11.8, 14.4);
      // 1969 radar headphones band + dual ear cups + boom mic
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(50, 39, 15.5, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      ctx.fillStyle = '#2B2B1E';
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.3;
      roundedRectPath(ctx, 32.5, 34, 6.2, 12.5, 2.6);
      ctx.fill();
      ctx.stroke();
      roundedRectPath(ctx, 61.3, 34, 6.2, 12.5, 2.6);
      ctx.fill();
      ctx.stroke();
      // Boom mic arm
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(35.5, 45);
      ctx.quadraticCurveTo(40, 52, 48.5, 50.5);
      ctx.stroke();
      ctx.fillStyle = palette.rimHex;
      ctx.beginPath();
      ctx.arc(49.5, 50.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      // Horn-rimmed glasses
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(41, 36.5, 7.2, 4.8);
      ctx.strokeRect(51.8, 36.5, 7.2, 4.8);
      break;
    }

    case 'rival_06_kenzo': {
      paintBustBase(32, 5.8, 40, 11.4, 14.4);
      // Precision side-parted lacquer hair
      ctx.fillStyle = palette.silhouetteHex;
      ctx.beginPath();
      ctx.arc(50, 34.5, 12.5, Math.PI * 0.98, Math.PI * 2.02);
      ctx.fill();
      // Tiny round critic spectacles
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(44.5, 39.2, 3.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(55.5, 39.2, 3.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(48.2, 39.2);
      ctx.lineTo(51.8, 39.2);
      ctx.stroke();
      // Structured mandarin collar with gold Kintsugi diagonal seam
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(43.5, 62.5);
      ctx.lineTo(56.5, 62.5);
      ctx.moveTo(50, 62.5);
      ctx.lineTo(47, 74);
      ctx.lineTo(53.5, 83);
      ctx.lineTo(50.5, 93);
      ctx.stroke();
      break;
    }

    case 'rival_07_delilah': {
      paintBustBase(31, 5.4, 41, 11.2, 14.0);
      // Jaunty tilted boardwalk gambler fedora + tucked playing card corner!
      ctx.save();
      ctx.translate(50, 29);
      ctx.rotate(-0.14);
      ctx.fillStyle = palette.silhouetteHex;
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 2, 22, 4.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      roundedRectPath(ctx, -12, -10, 24, 12, 4);
      ctx.fill();
      ctx.stroke();
      // Tucked ace card in hatband
      ctx.fillStyle = palette.detailHex;
      ctx.fillRect(6, -10.5, 5.5, 7.5);
      ctx.fillStyle = '#C73E2D';
      ctx.beginPath();
      ctx.arc(8.7, -6.8, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Brass vest buttons
      ctx.fillStyle = palette.rimHex;
      ctx.beginPath();
      ctx.arc(50, 72, 1.6, 0, Math.PI * 2);
      ctx.arc(50, 80, 1.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'rival_08_henrik': {
      paintBustBase(34, 6.4, 40.5, 11.8, 14.4);
      // Iconic knit explorer beanie (Cousteau tribute)
      ctx.fillStyle = '#8C2D2D';
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(50, 32, 13.0, Math.PI * 1.02, Math.PI * 1.98);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      roundedRectPath(ctx, 36.5, 29.5, 27, 4.8, 2.2);
      ctx.fill();
      ctx.stroke();
      // Trimmed beard contour
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(50, 44.5, 10.6, Math.PI * 0.16, Math.PI * 0.84);
      ctx.stroke();
      // Heavy riveted bronze diving collar ring!
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(50, 67, 17, 5.4, 0, 0, Math.PI);
      ctx.stroke();
      for (const rx of [37, 43.5, 50, 56.5, 63]) {
        ctx.fillStyle = palette.rimHex;
        ctx.beginPath();
        ctx.arc(rx, 70.5, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'rival_09_nadia': {
      paintBustBase(31.5, 5.4, 41.5, 11.2, 14.0);
      // Sculptural braided updo resting cleanly on crown (non-halo silhouette)
      ctx.fillStyle = palette.silhouetteHex;
      ctx.beginPath();
      ctx.ellipse(50, 27.2, 13.8, 6.2, 0, Math.PI * 0.92, Math.PI * 2.08);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(43.5, 26.2, 3.6, Math.PI, Math.PI * 1.95);
      ctx.arc(50.0, 24.8, 4.0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.arc(56.5, 26.2, 3.6, Math.PI * 1.05, Math.PI * 2.0);
      ctx.stroke();
      // Sharp prism-lit geometric spectacles
      ctx.strokeStyle = palette.detailHex;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(39, 38.5);
      ctx.lineTo(48, 37.5);
      ctx.lineTo(47.5, 43);
      ctx.lineTo(39.5, 42.5);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(52, 37.5);
      ctx.lineTo(61, 38.5);
      ctx.lineTo(60.5, 42.5);
      ctx.lineTo(52.5, 43);
      ctx.closePath();
      ctx.stroke();
      // Prism triangle lapel brooch
      ctx.fillStyle = palette.rimHex;
      ctx.beginPath();
      ctx.moveTo(50, 66);
      ctx.lineTo(54.5, 74);
      ctx.lineTo(45.5, 74);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'rival_10_arthur': {
      paintBustBase(35, 6.6, 39.5, 12.0, 15.0);
      // Sovereign gold arch behind Arthur
      ctx.strokeStyle = `${palette.rimHex}88`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(50, 44, 29, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
      // Distinguished silver-streaked slicked hair
      ctx.fillStyle = palette.detailHex;
      ctx.beginPath();
      ctx.moveTo(38, 33);
      ctx.quadraticCurveTo(50, 20, 62, 33);
      ctx.quadraticCurveTo(50, 27, 38, 33);
      ctx.closePath();
      ctx.fill();
      // Austere square gold spectacles
      ctx.strokeStyle = palette.rimHex;
      ctx.lineWidth = 1.25;
      ctx.strokeRect(40.5, 36.2, 8.0, 5.2);
      ctx.strokeRect(51.5, 36.2, 8.0, 5.2);
      ctx.beginPath();
      ctx.moveTo(48.5, 38.4);
      ctx.lineTo(51.5, 38.4);
      ctx.stroke();
      // Savile Row double-breasted peak lapels + gold tie bar
      ctx.fillStyle = palette.detailHex;
      ctx.beginPath();
      ctx.moveTo(44, 62);
      ctx.lineTo(50, 82);
      ctx.lineTo(56, 62);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = palette.accentHex;
      ctx.beginPath();
      ctx.moveTo(48.2, 63);
      ctx.lineTo(51.8, 63);
      ctx.lineTo(52.4, 82);
      ctx.lineTo(47.6, 82);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFF3C4';
      ctx.fillRect(46.8, 72.5, 6.4, 1.6);
      break;
    }
  }

  ctx.restore();
}

function drawBroadcastMonitorFrame(
  ctx: CanvasRenderingContext2D,
  palette: CastPortraitPaletteV6,
  speaking: boolean,
): void {
  // Ultra-fine broadcast scanline texture inside monitor screen (3.5% alpha for prestige clarity)
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let y = 8; y < 92; y += 3) {
    ctx.fillRect(7, y, 86, 0.9);
  }

  // Subtle curved monitor glass reflection sheen (top-left arc)
  const glass = ctx.createLinearGradient(8, 8, 55, 58);
  glass.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
  glass.addColorStop(0.45, 'rgba(255, 255, 255, 0.03)');
  glass.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glass;
  roundedRectPath(ctx, 7, 7, 86, 86, 8);
  ctx.fill();

  // Outer machined brushed-gunmetal & brass monitor chassis bezel
  ctx.lineWidth = 6.5;
  const bezelGrad = ctx.createLinearGradient(0, 0, 100, 100);
  bezelGrad.addColorStop(0, '#5A4A35');
  bezelGrad.addColorStop(0.32, '#2B2520');
  bezelGrad.addColorStop(0.68, '#171412');
  bezelGrad.addColorStop(1, '#755B34');
  ctx.strokeStyle = bezelGrad;
  roundedRectPath(ctx, 3.5, 3.5, 93, 93, 12);
  ctx.stroke();

  // Inner chamfered brass trim ring (brightens cleanly when speaking)
  ctx.lineWidth = 1.45;
  ctx.strokeStyle = speaking ? palette.rimHex : `${palette.accentHex}CC`;
  roundedRectPath(ctx, 7.2, 7.2, 85.6, 85.6, 8.2);
  ctx.stroke();

  // 4 machined corner hex/slotted screws
  drawScrew(ctx, 6.2, 6.2, 2.0);
  drawScrew(ctx, 93.8, 6.2, 2.0);
  drawScrew(ctx, 6.2, 93.8, 2.0);
  drawScrew(ctx, 93.8, 93.8, 2.0);

  // Live Broadcast Tally Lamp (top-right inside monitor bezel)
  const lampX = 84.5;
  const lampY = 14.5;
  if (speaking) {
    const glow = ctx.createRadialGradient(lampX, lampY, 0.5, lampX, lampY, 7.5);
    glow.addColorStop(0, 'rgba(255, 72, 72, 0.95)');
    glow.addColorStop(0.45, 'rgba(255, 56, 56, 0.4)');
    glow.addColorStop(1, 'rgba(255, 56, 56, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lampX, lampY, 7.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = speaking ? '#FF4B4B' : '#5F4B2C';
  ctx.beginPath();
  ctx.arc(lampX, lampY, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = speaking ? '#FFD4D4' : '#B59663';
  ctx.beginPath();
  ctx.arc(lampX - 0.7, lampY - 0.7, 0.85, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Renders a crisp high-DPI stylized broadcast monitor cameo portrait directly
 * onto the provided `<canvas>` element. Zero external images or blurry cutouts.
 */
export function renderCastPortraitCanvas(
  canvas: HTMLCanvasElement,
  options: CastPortraitRenderOptionsV6,
): void {
  const palette = PORTRAIT_PALETTES[options.portraitKey] ?? PORTRAIT_PALETTES.julian_sterling;
  const sizePx = Math.max(36, Math.round(options.sizePx ?? 72));
  const dpr = Math.min(3, Math.max(1, options.dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2)));
  const pixelSize = Math.round(sizePx * dpr);

  if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
    canvas.width = pixelSize;
    canvas.height = pixelSize;
  }
  canvas.style.width = `${sizePx}px`;
  canvas.style.height = `${sizePx}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.clearRect(0, 0, pixelSize, pixelSize);
  // Scale to crisp 100x100 vector coordinate space
  ctx.scale(pixelSize / 100, pixelSize / 100);

  // Clip interior screen cavity cleanly
  ctx.save();
  roundedRectPath(ctx, 6.8, 6.8, 86.4, 86.4, 8.5);
  ctx.clip();
  drawArchitecturalBackdrop(
    ctx,
    palette,
    Boolean(options.speaking),
    options.mood ?? 'neutral',
    options.stageTintHex,
  );
  drawCameoSilhouette(ctx, palette.key, palette);
  ctx.restore();

  drawBroadcastMonitorFrame(ctx, palette, Boolean(options.speaking));
  ctx.restore();
}

/**
 * Generates an offline PNG data URL for any cast portrait at Retina resolution.
 */
export function createCastPortraitDataUrl(
  portraitKey: CastPortraitKeyV6,
  sizePx = 96,
  options?: Omit<CastPortraitRenderOptionsV6, 'portraitKey' | 'sizePx'>,
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  renderCastPortraitCanvas(canvas, {
    portraitKey,
    sizePx,
    speaking: options?.speaking ?? false,
    mood: options?.mood ?? 'neutral',
    stageTintHex: options?.stageTintHex,
    dpr: options?.dpr ?? 2,
  });
  return canvas.toDataURL('image/png');
}

function ensurePortraitStyles(): void {
  if (portraitStylesInjected || typeof document === 'undefined') return;
  portraitStylesInjected = true;
  const style = document.createElement('style');
  style.id = 'ws-v6-cast-portrait-styles';
  style.textContent = `
    .ws-v6-cast-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: 100%;
      min-width: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #F4EFE4;
      user-select: none;
    }
    .ws-v6-cast-badge--compact {
      gap: 8px;
    }
    .ws-v6-cast-monitor-canvas {
      display: block;
      flex: 0 0 auto;
      border-radius: 10px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.55);
    }
    .ws-v6-cast-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1 1 auto;
      line-height: 1.18;
    }
    .ws-v6-cast-name-row {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #F8F3E8;
    }
    .ws-v6-cast-name-text {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ws-v6-cast-role {
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #B9AD96;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    .ws-v6-cast-tally-pill {
      display: inline-block;
      flex: 0 0 auto;
      padding: 1px 5px;
      border-radius: 3px;
      background: #9E1F24;
      color: #FFF4F4;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Mounts a crisp Broadcast Monitor Cameo Badge into a container with optional
 * Retina OS-font speaker nameplate (opaque brushed bezel, zero blurred SVG text).
 */
export function mountCastMonitorBadge(
  container: HTMLElement,
  options: CastMonitorBadgeOptionsV6,
): CastMonitorBadgeHandleV6 {
  ensurePortraitStyles();

  let current: CastMonitorBadgeOptionsV6 = { ...options };
  const root = document.createElement('div');
  root.className = `ws-v6-cast-badge${current.compact ? ' ws-v6-cast-badge--compact' : ''}`;

  const canvas = document.createElement('canvas');
  canvas.className = 'ws-v6-cast-monitor-canvas';
  root.appendChild(canvas);

  const meta = document.createElement('div');
  meta.className = 'ws-v6-cast-meta';

  const nameRow = document.createElement('div');
  nameRow.className = 'ws-v6-cast-name-row';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'ws-v6-cast-name-text';
  const tallyPill = document.createElement('span');
  tallyPill.className = 'ws-v6-cast-tally-pill';
  tallyPill.textContent = 'ON AIR';

  const roleEl = document.createElement('div');
  roleEl.className = 'ws-v6-cast-role';

  nameRow.appendChild(nameSpan);
  nameRow.appendChild(tallyPill);
  meta.appendChild(nameRow);
  meta.appendChild(roleEl);
  root.appendChild(meta);

  const apply = () => {
    const pal = getCastPortraitPalette(current.portraitKey);
    renderCastPortraitCanvas(canvas, current);
    const showNameplate = current.showNameplate ?? true;
    meta.style.display = showNameplate ? 'flex' : 'none';
    nameSpan.textContent = current.displayName ?? pal.displayName;
    roleEl.textContent = current.roleTag ?? pal.roleTag;
    roleEl.style.color = pal.rimHex;
    tallyPill.style.display = current.speaking ? 'inline-block' : 'none';
    root.className = `ws-v6-cast-badge${current.compact ? ' ws-v6-cast-badge--compact' : ''}`;
  };

  apply();
  container.appendChild(root);

  return {
    root,
    canvas,
    update(patch: Partial<CastMonitorBadgeOptionsV6>) {
      current = { ...current, ...patch };
      apply();
    },
    destroy() {
      root.remove();
    },
  };
}
