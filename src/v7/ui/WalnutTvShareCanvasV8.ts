// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 "Sweeps Week Deluxe")
// `src/v7/ui/WalnutTvShareCanvasV8.ts`
// Museum-Grade 1966 RCA Victor "New Vista" American Walnut Color Console TV
// `1080×1080` High-DPI Social Share Card `<canvas>` Renderer & Share Helpers:
//   - Sunlit Studio 6A Living Color cyclorama + warm American Walnut parquet glow
//   - Hand-rubbed oiled American Walnut cabinet w/ 45° mitered joinery & 24K brass inlay
//   - Brushed champagne-silver right tuning escutcheon w/ 3D metallic VHF/UHF
//     rotary channel dials (Channel 4 lit!), woven gold-thread speaker grille &
//     glowing ruby-red "IN LIVING COLOR" jewel badge
//   - Warm Sunlit Studio 6A Living Color CRT Screen (#FAF2DF -> #F2E5C8 radial
//     studio glow w/ subtle Mid-Century starburst rays & warm CRT glass vignette):
//       * Broadcast Cobalt & Peacock Teal (#1746A2 -> #008B94) curved marquee
//         plaque w/ chasing #FFD166 #11 incandescent bulbs
//       * Gleaming Harvest Gold (#F2A922) / Atomic Tangerine Victory Ribbon w/ #141B29 ink
//       * Dual Contestant Podium Plaques: Peacock Teal crown + Atomic Tangerine crown
//         over Warm Ivory (#FFFDF7) Solari split-flap score cards
//       * Sunlit Walnut & Brushed Brass Tote Frame holding 3D beveled Living Color
//         Trilon squares (Emerald-Teal ✓, Harvest-Gold ★, Vermilion ✕) + #141B29 legend
//       * Warm Cream & Gold Studio Audience Percentile Seal + Carnaby Cerise /
//         Tangerine Daily Streak Plaque (hand-drawn vector flame, zero OS emoji!)
//   - 100% deterministic procedural 2D canvas drawing (zero external images -> zero CORS taint!)
// ============================================================================

import type { DailyPercentileRankV8, SeasonIdV7 } from '../contracts_v7';
import { getAtlasSpriteEntryV9, loadAtlasManifestV9 } from '../../v9/ShowroomAndCatalogsV9';

export interface WalnutConsoleTvShareSpecV8 {
  readonly episodeNumber: number;
  readonly dateLabel: string;
  readonly playerCash: number;
  readonly rivalCash: number;
  readonly rivalName: string;
  readonly stageTitle: string;
  readonly boardModeTitle: string;
  readonly won: boolean;
  readonly streakCount: number;
  readonly isArchiveTape?: boolean;
  readonly season?: SeasonIdV7;
  readonly percentile: DailyPercentileRankV8;
  readonly tileEmojisOrTokens: readonly string[];
}

export type WalnutTvShareResultV8 =
  | 'WEB_SHARED'
  | 'DOWNLOADED_PNG'
  | 'CLIPBOARD_TEXT';

type ParsedTrilonShareTileV8 =
  | 'SECRET_STAR_WIN'
  | 'VAULT_LOCK_WIN'
  | 'SHOWCASE_TWIST_WIN'
  | 'STANDARD_HIT'
  | 'MISS';

const CANVAS_SIZE_PX = 1080;

const FONT_MARQUEE = "'Jost', 'Caprasimo', 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
const FONT_SOLARI = "'Michroma', 'Jost', 'Segoe UI', Arial, sans-serif";
const FONT_BODY = "'Plus Jakarta Sans', 'Jost', 'Segoe UI', Arial, sans-serif";

// ----------------------------------------------------------------------------
// 1. Token & Emoji Normalization (Handles Enum Tokens, Emoji Pairs, or Raw Lines)
// ----------------------------------------------------------------------------

function classifySingleShareToken(rawToken: string): ParsedTrilonShareTileV8 | null {
  const tok = rawToken.trim();
  if (!tok) return null;
  const upper = tok.toUpperCase();

  if (upper === 'MISS') return 'MISS';
  if (upper === 'SECRET_WIN' || upper === 'TWIST_HIT') return 'SECRET_STAR_WIN';
  if (upper === 'VAULT_WIN' || upper === 'VAULT_HIT') return 'VAULT_LOCK_WIN';
  if (upper === 'MYSTERY_WIN' || upper === 'SHOWCASE_WIN') return 'SHOWCASE_TWIST_WIN';
  if (upper === 'WIN' || upper === 'HIT') return 'STANDARD_HIT';

  if (tok.includes('🟥') || tok.includes('❌') || tok.includes('✕')) {
    return 'MISS';
  }
  if (tok.includes('⭐') || tok.includes('🌟') || tok.includes('🎭')) {
    return 'SECRET_STAR_WIN';
  }
  if (tok.includes('🔒') || tok.includes('🔐') || tok.includes('🔑')) {
    return 'VAULT_LOCK_WIN';
  }
  if (
    tok.includes('❓') ||
    tok.includes('🎯') ||
    tok.includes('🎡') ||
    tok.includes('⚡') ||
    tok.includes('🔔')
  ) {
    return 'SHOWCASE_TWIST_WIN';
  }
  if (tok.includes('🟩') || tok.includes('🟦') || tok.includes('✓') || tok.includes('✔')) {
    return 'STANDARD_HIT';
  }

  return 'STANDARD_HIT';
}

export function normalizeWalnutShareTilesV8(
  tileEmojisOrTokens: readonly string[],
): ParsedTrilonShareTileV8[] {
  if (!Array.isArray(tileEmojisOrTokens) || tileEmojisOrTokens.length === 0) {
    return [
      'STANDARD_HIT',
      'SECRET_STAR_WIN',
      'VAULT_LOCK_WIN',
      'STANDARD_HIT',
      'SHOWCASE_TWIST_WIN',
      'STANDARD_HIT',
    ];
  }

  const expanded: string[] = [];
  for (const item of tileEmojisOrTokens) {
    if (typeof item !== 'string') continue;
    const parts = item.trim().split(/\s+/).filter(Boolean);
    for (const part of parts) {
      expanded.push(part);
    }
  }

  const parsed: ParsedTrilonShareTileV8[] = [];
  for (const part of expanded) {
    const kind = classifySingleShareToken(part);
    if (kind) parsed.push(kind);
  }

  if (parsed.length === 0) {
    return [
      'STANDARD_HIT',
      'SECRET_STAR_WIN',
      'VAULT_LOCK_WIN',
      'STANDARD_HIT',
      'SHOWCASE_TWIST_WIN',
      'STANDARD_HIT',
    ];
  }

  return parsed.slice(0, 12);
}

// ----------------------------------------------------------------------------
// 2. Precision 2D Geometry & Typography Primitives
// ----------------------------------------------------------------------------

function formatUsd(amount: number): string {
  const clean = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return `$${clean.toLocaleString('en-US')}`;
}

function formatOrdinalUpper(n: number): string {
  const clean = Math.max(0, Math.floor(Math.abs(n)));
  const mod100 = clean % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${clean}TH`;
  const mod10 = clean % 10;
  if (mod10 === 1) return `${clean}ST`;
  if (mod10 === 2) return `${clean}ND`;
  if (mod10 === 3) return `${clean}RD`;
  return `${clean}TH`;
}

function stripLeadingDecorEmojis(raw: string): string {
  return raw
    .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F\s·•]+/gu, '')
    .trim();
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/** Barrel-curved 1966 25-inch rectangular color CRT tube contour. */
function crtBarrelScreenPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cornerR: number,
  bowPx: number,
): void {
  const r = Math.max(12, Math.min(cornerR, Math.min(w, h) * 0.2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.quadraticCurveTo(x + w * 0.5, y - bowPx, x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.quadraticCurveTo(x + w + bowPx, y + h * 0.5, x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.quadraticCurveTo(x + w * 0.5, y + h + bowPx, x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.quadraticCurveTo(x - bowPx, y + h * 0.5, x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function measureFittedFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontWeight: number | string,
  startSize: number,
  minSize: number,
  fontFamily: string,
): number {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) {
      return size;
    }
    size -= 0.5;
  }
  return minSize;
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  opts: {
    readonly fontWeight?: number | string;
    readonly fontSize: number;
    readonly minFontSize?: number;
    readonly fontFamily?: string;
    readonly fillStyle: string;
    readonly align?: CanvasTextAlign;
    readonly baseline?: CanvasTextBaseline;
    readonly shadowColor?: string;
    readonly shadowBlur?: number;
    readonly shadowOffsetY?: number;
  },
): number {
  const weight = opts.fontWeight ?? 800;
  const family = opts.fontFamily ?? FONT_MARQUEE;
  const minSize = opts.minFontSize ?? 11;

  ctx.save();
  const finalSize = measureFittedFontSize(
    ctx,
    text,
    maxWidth,
    weight,
    opts.fontSize,
    minSize,
    family,
  );
  ctx.font = `${weight} ${finalSize}px ${family}`;
  ctx.textAlign = opts.align ?? 'center';
  ctx.textBaseline = opts.baseline ?? 'middle';
  ctx.fillStyle = opts.fillStyle;

  if (opts.shadowColor) {
    ctx.shadowColor = opts.shadowColor;
    ctx.shadowBlur = opts.shadowBlur ?? 8;
    ctx.shadowOffsetY = opts.shadowOffsetY ?? 2;
  }

  ctx.fillText(text, x, y, maxWidth);
  const drawnWidth = Math.min(maxWidth, ctx.measureText(text).width);
  ctx.restore();
  return drawnWidth;
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length === maxLines - 1) {
        for (let j = i + 1; j < words.length; j += 1) {
          current = `${current} ${words[j]}`;
        }
        break;
      }
    }
  }
  lines.push(current);
  return lines.slice(0, maxLines);
}

// ----------------------------------------------------------------------------
// 3. Bespoke 1966 Vector Icons & Hardware Ornaments (Zero OS Emoji Dependency)
// ----------------------------------------------------------------------------

function drawFivePointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  fill: string,
  stroke?: string,
): void {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  ctx.restore();
}

function drawFourPointSparkle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  fill: string,
): void {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawMarqueeBulb11(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  chaseIdx: number,
): void {
  const lit = chaseIdx % 3 !== 2;
  ctx.save();
  if (lit) {
    const halo = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 2.9);
    halo.addColorStop(0, 'rgba(255, 240, 178, 0.94)');
    halo.addColorStop(0.45, 'rgba(244, 169, 31, 0.42)');
    halo.addColorStop(1, 'rgba(244, 169, 31, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r + 1.8, 0, Math.PI * 2);
  ctx.fillStyle = '#5C3418';
  ctx.fill();

  const bulbGrad = ctx.createRadialGradient(cx - r * 0.28, cy - r * 0.28, 0.5, cx, cy, r);
  bulbGrad.addColorStop(0, '#FFFDF6');
  bulbGrad.addColorStop(0.55, lit ? '#FFE282' : '#E2B45A');
  bulbGrad.addColorStop(1, lit ? '#FFD166' : '#A6721A');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = bulbGrad;
  ctx.fill();
  ctx.restore();
}

function drawVectorTrophyIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  inkStroke: string,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.strokeStyle = inkStroke;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(-9, -4, 5, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(9, -4, 5, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-9, -11);
  ctx.lineTo(9, -11);
  ctx.quadraticCurveTo(8, 2, 0, 4);
  ctx.quadraticCurveTo(-8, 2, -9, -11);
  ctx.closePath();
  const cupGrad = ctx.createLinearGradient(-9, -11, 9, 4);
  cupGrad.addColorStop(0, '#FFFDF7');
  cupGrad.addColorStop(0.5, '#FFE078');
  cupGrad.addColorStop(1, '#C97E08');
  ctx.fillStyle = cupGrad;
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = inkStroke;
  ctx.stroke();

  ctx.fillStyle = '#D98A12';
  ctx.fillRect(-2.2, 4, 4.4, 5);
  ctx.strokeRect(-2.2, 4, 4.4, 5);
  roundedRectPath(ctx, -7.5, 8.5, 15, 4.2, 1.5);
  ctx.fillStyle = '#141B29';
  ctx.fill();
  ctx.restore();
}

function drawVectorClapperboardIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  roundedRectPath(ctx, -11, -3, 22, 14, 2.5);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#141B29';
  ctx.stroke();

  ctx.save();
  ctx.translate(-11, -3);
  ctx.rotate(-0.22);
  roundedRectPath(ctx, 0, -5.5, 22, 5.5, 1.5);
  ctx.fillStyle = '#141B29';
  ctx.fill();
  ctx.fillStyle = '#FFD166';
  for (let s = 3; s < 20; s += 6) {
    ctx.beginPath();
    ctx.moveTo(s, -5.5);
    ctx.lineTo(s + 3, -5.5);
    ctx.lineTo(s + 1, 0);
    ctx.lineTo(s - 2, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

function drawVectorAmpexTapeIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  roundedRectPath(ctx, -14, -9, 28, 18, 3.5);
  ctx.fillStyle = '#6E3B23';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#FFD166';
  ctx.stroke();

  for (const sx of [-6.2, 6.2]) {
    ctx.beginPath();
    ctx.arc(sx, 0, 5.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDF7';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#6E3B23';
    ctx.fill();
  }
  ctx.restore();
}

function drawVectorStreakFlame(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.bezierCurveTo(15, -11, 19, 4, 13, 15.5);
  ctx.bezierCurveTo(8, 23, -8, 23, -13, 15.5);
  ctx.bezierCurveTo(-19, 4, -13, -10, -3.5, -16);
  ctx.bezierCurveTo(-1, -9, 2, -8, 0, -24);
  ctx.closePath();
  const outer = ctx.createLinearGradient(0, -24, 0, 22);
  outer.addColorStop(0, '#FFE484');
  outer.addColorStop(0.48, '#FF6B35');
  outer.addColorStop(1, '#E6397A');
  ctx.fillStyle = outer;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#FFFDF7';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0.8, -9);
  ctx.bezierCurveTo(8, -1, 9.5, 8, 5.5, 15);
  ctx.bezierCurveTo(2.8, 18.5, -2.8, 18.5, -5.5, 15);
  ctx.bezierCurveTo(-9.5, 8, -7, -1, 0.8, -9);
  ctx.closePath();
  ctx.fillStyle = '#FFFDF4';
  ctx.fill();
  ctx.restore();
}

function drawLivingColorSpectrumCrest(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
): void {
  const feathers = ['#F2A922', '#FF6B35', '#E6397A', '#7B3FE4', '#1746A2', '#00B4C6'];
  ctx.save();
  for (let i = 0; i < feathers.length; i += 1) {
    const rad = ((i - 2.5) * 22 * Math.PI) / 180;
    ctx.save();
    ctx.translate(cx, cy + 12);
    ctx.rotate(rad);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-5.5, -12, -4.5, -24, 0, -26);
    ctx.bezierCurveTo(4.5, -24, 5.5, -12, 0, 0);
    ctx.closePath();
    ctx.fillStyle = feathers[i];
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.moveTo(cx, cy + 3);
  ctx.lineTo(cx + 7, cy + 11);
  ctx.lineTo(cx, cy + 18);
  ctx.lineTo(cx - 7, cy + 11);
  ctx.closePath();
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#6E3B23';
  ctx.stroke();
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 4. 3D Machined VHF (Channel 4 Lit!) & UHF Rotary Dials on Champagne Tuner
// ----------------------------------------------------------------------------

function drawNewVistaRotaryDial(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  opts: {
    readonly bandLabel: string;
    readonly channelNumber: string;
    readonly isChannelFourHero: boolean;
    readonly bladeAngleRad: number;
  },
): void {
  ctx.save();

  // Illuminated warm bronze/amber backlit channel window above dial
  const winW = 104;
  const winH = 26;
  const winX = cx - winW / 2;
  const winY = cy - radius - 34;
  roundedRectPath(ctx, winX, winY, winW, winH, 7);
  ctx.fillStyle = '#361E10';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = opts.isChannelFourHero ? '#E5A93B' : '#8C7A65';
  ctx.stroke();

  if (opts.isChannelFourHero) {
    const chGlow = ctx.createRadialGradient(
      cx + 16,
      winY + winH / 2,
      2,
      cx + 16,
      winY + winH / 2,
      36,
    );
    chGlow.addColorStop(0, 'rgba(255, 224, 125, 0.45)');
    chGlow.addColorStop(1, 'rgba(255, 224, 125, 0)');
    ctx.fillStyle = chGlow;
    ctx.fillRect(winX + 2, winY + 2, winW - 4, winH - 4);
  }

  drawFittedText(
    ctx,
    `${opts.bandLabel} · CH ${opts.channelNumber}`,
    cx,
    winY + winH / 2 + 0.5,
    winW - 12,
    {
      fontFamily: FONT_SOLARI,
      fontSize: 11,
      minFontSize: 9,
      fontWeight: 800,
      fillStyle: opts.isChannelFourHero ? '#FFE58F' : '#F7EEDB',
    },
  );

  // Drop shadow on champagne-aluminum escutcheon
  ctx.beginPath();
  ctx.arc(cx, cy + 5, radius + 5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(42, 24, 10, 0.32)';
  ctx.fill();

  // Outer anodized bronze turret skirt ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
  ctx.fillStyle = '#4A2B18';
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#E5D8C1';
  ctx.stroke();

  // 28 machined chrome knurl serrations
  for (let i = 0; i < 28; i += 1) {
    const a = (i * Math.PI * 2) / 28;
    const x1 = cx + Math.cos(a) * (radius - 1);
    const y1 = cy + Math.sin(a) * (radius - 1);
    const x2 = cx + Math.cos(a) * (radius + 4.5);
    const y2 = cy + Math.sin(a) * (radius + 4.5);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = i % 2 === 0 ? '#FFFDF7' : '#857564';
    ctx.stroke();
  }

  // Conical 3D spun champagne-chrome dish
  const dishGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  dishGrad.addColorStop(0, '#FFFDF9');
  dishGrad.addColorStop(0.28, '#E8DFCD');
  dishGrad.addColorStop(0.55, '#ACA18F');
  dishGrad.addColorStop(0.8, '#F5EFE2');
  dishGrad.addColorStop(1, '#7D7160');
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
  ctx.fillStyle = dishGrad;
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  // Recessed oiled walnut & brass center cap
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.66, 0, Math.PI * 2);
  ctx.fillStyle = '#3B2010';
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#E5A93B';
  ctx.stroke();

  // Sculpted 3D fluted RCA selector blade
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(opts.bladeAngleRad);
  ctx.shadowColor = 'rgba(28, 14, 5, 0.45)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  roundedRectPath(ctx, -radius * 0.84, -7, radius * 1.68, 14, 5.5);
  const barGrad = ctx.createLinearGradient(0, -7, 0, 7);
  barGrad.addColorStop(0, '#FFFFFF');
  barGrad.addColorStop(0.48, '#E5DCCA');
  barGrad.addColorStop(1, '#857866');
  ctx.fillStyle = barGrad;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#4A2B18';
  ctx.stroke();

  // Glowing amber/tangerine pointer pip on blade tip
  ctx.beginPath();
  ctx.arc(radius * 0.63, 0, 3.3, 0, Math.PI * 2);
  ctx.fillStyle = opts.isChannelFourHero ? '#FFD166' : '#FF6B35';
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 5. Crisp Vector 3D Beveled Living Color Trilon Tile Renderer (Zero OS Emojis!)
// ----------------------------------------------------------------------------

function drawAcryliteTrilonTileV8(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  kind: ParsedTrilonShareTileV8,
  turnIndex1: number,
): void {
  const isSpecialWin =
    kind === 'SECRET_STAR_WIN' ||
    kind === 'VAULT_LOCK_WIN' ||
    kind === 'SHOWCASE_TWIST_WIN';
  const isHit = kind === 'STANDARD_HIT';

  // Canonical 3-state 1966 Living Color Trilon Squares:
  // - Standard Hit: Radiant Emerald-Teal (#00A896 -> #0C7C6B) w/ crisp #FFFDF7 checkmark
  // - Twist / Vault / Secret Win: Gleaming Harvest Gold (#FFE066 -> #E59812) w/ bold star
  // - Miss: Broadcast Vermilion (#F25749 -> #C92A22) w/ crisp #FFFDF7 `✕`
  const topHex = isSpecialWin
    ? '#FFE270'
    : isHit
      ? '#00B4A2'
      : '#F46054';
  const midHex = isSpecialWin
    ? '#F2A922'
    : isHit
      ? '#008B84'
      : '#E03E36';
  const botHex = isSpecialWin
    ? '#B87308'
    : isHit
      ? '#085E58'
      : '#991E18';
  const borderHex = isSpecialWin
    ? '#9E5E04'
    : isHit
      ? '#054A46'
      : '#7F1611';

  ctx.save();

  // Brass vertical Trilon spindle pins top & bottom linking into walnut rack
  ctx.fillStyle = '#C98A1C';
  ctx.fillRect(x + w / 2 - 3, y - 5, 6, 6);
  ctx.fillRect(x + w / 2 - 3, y + h - 1, 6, 6);

  const r = Math.min(13, Math.round(Math.min(w, h) * 0.18));

  // 3D bottom mechanical Trilon plinth shadow
  roundedRectPath(ctx, x, y + 4, w, h, r);
  ctx.fillStyle = 'rgba(74, 38, 16, 0.28)';
  ctx.fill();

  roundedRectPath(ctx, x, y, w, h, r);
  const faceGrad = ctx.createLinearGradient(x, y, x, y + h);
  faceGrad.addColorStop(0, topHex);
  faceGrad.addColorStop(0.52, midHex);
  faceGrad.addColorStop(1, botHex);
  ctx.fillStyle = faceGrad;
  ctx.fill();

  ctx.lineWidth = 2.2;
  ctx.strokeStyle = borderHex;
  ctx.stroke();

  // 3D beveled Acrylite top glass highlight facet
  roundedRectPath(ctx, x + 4, y + 4, w - 8, h * 0.38, Math.max(4, r - 4));
  ctx.fillStyle = isSpecialWin
    ? 'rgba(255, 255, 255, 0.36)'
    : 'rgba(255, 255, 255, 0.22)';
  ctx.fill();

  // Subtle vertical 3-sided Trilon prism crease line
  ctx.strokeStyle = isSpecialWin
    ? 'rgba(110, 59, 35, 0.14)'
    : 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + 4);
  ctx.lineTo(x + w * 0.5, y + h - 4);
  ctx.stroke();

  const cx = x + w / 2;
  const cy = y + h / 2 + 2;
  const unit = Math.min(w, h);

  if (isSpecialWin) {
    // Bold Harvest-Gold Star w/ crisp #141B29 outline & #FFFDF7 core sheen
    drawFivePointStar(ctx, cx, cy, unit * 0.29, unit * 0.125, '#FFFDF7', '#141B29');
    if (kind === 'VAULT_LOCK_WIN') {
      ctx.fillStyle = '#141B29';
      ctx.beginPath();
      ctx.arc(x + w - 11, y + 11, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x + w - 12.3, y + 12.5, 2.6, 4);
    } else if (kind === 'SHOWCASE_TWIST_WIN') {
      drawFourPointSparkle(ctx, x + w - 11, y + 11, 5, 1.8, '#141B29');
    }
  } else if (isHit) {
    // Crisp bold broadcast checkmark
    ctx.beginPath();
    ctx.moveTo(cx - unit * 0.21, cy + 1);
    ctx.lineTo(cx - unit * 0.05, cy + unit * 0.17);
    ctx.lineTo(cx + unit * 0.23, cy - unit * 0.16);
    ctx.lineWidth = Math.max(4.2, unit * 0.11);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#FFFDF7';
    ctx.stroke();
  } else {
    // Crisp bold geometric miss cross
    const arm = unit * 0.17;
    ctx.beginPath();
    ctx.moveTo(cx - arm, cy - arm);
    ctx.lineTo(cx + arm, cy + arm);
    ctx.moveTo(cx + arm, cy - arm);
    ctx.lineTo(cx - arm, cy + arm);
    ctx.lineWidth = Math.max(4.2, unit * 0.105);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FFFDF7';
    ctx.stroke();
  }

  // Turn index micro-numeral in upper-left
  drawFittedText(ctx, `${turnIndex1}`, x + 10, y + 11, 20, {
    fontFamily: FONT_MARQUEE,
    fontSize: 11.5,
    minFontSize: 9,
    fontWeight: 900,
    fillStyle: isSpecialWin ? '#141B29' : 'rgba(255, 253, 247, 0.92)',
    align: 'left',
  });

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 6. Main 1080×1080 Sunlit Living Color Walnut Console TV Share Card Renderer
// ----------------------------------------------------------------------------

/**
 * Renders a crisp `1080×1080` high-DPI 1966 RCA Victor "New Vista" American Walnut
 * Color Console Television share card PNG canvas (100% procedural, zero CORS taint).
 */
export function renderWalnutConsoleTvShareCanvasV8(
  spec: WalnutConsoleTvShareSpecV8,
): HTMLCanvasElement {
  if (typeof document === 'undefined') {
    throw new Error(
      'renderWalnutConsoleTvShareCanvasV8 requires a browser/DOM <canvas> environment.',
    );
  }

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE_PX;
  canvas.height = CANVAS_SIZE_PX;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }

  const epNum =
    typeof spec.episodeNumber === 'number' && Number.isFinite(spec.episodeNumber)
      ? Math.max(1, Math.floor(spec.episodeNumber))
      : 1;
  const dateLabel = (spec.dateLabel || '1966 EDITION').trim().toUpperCase();
  const playerCash = Number.isFinite(spec.playerCash)
    ? Math.max(0, Math.round(spec.playerCash))
    : 0;
  const rivalCash = Number.isFinite(spec.rivalCash)
    ? Math.max(0, Math.round(spec.rivalCash))
    : 0;
  const rivalName = (spec.rivalName || 'DOTTY VANCE').trim();
  const stageTitle = (spec.stageTitle || 'Studio 6A Living Color').trim();
  const boardModeTitle = (spec.boardModeTitle || '1966 Living Color Tote').trim();
  const isTie = playerCash === rivalCash;
  const won = Boolean(spec.won) || playerCash >= rivalCash;
  const streakCount = Number.isFinite(spec.streakCount)
    ? Math.max(0, Math.floor(spec.streakCount))
    : 0;
  const isArchiveTape = Boolean(spec.isArchiveTape);
  const percentile: DailyPercentileRankV8 = spec.percentile ?? {
    percentile: 98,
    topPercentLabel: 'TOP 2%',
    rankTitle: 'NETWORK SOVEREIGN',
    badgeColorHex: '#F2A922',
    studioNote: `Certified Studio 6A Tote finish on Broadcast #${epNum}!`,
  };
  const tiles = normalizeWalnutShareTilesV8(spec.tileEmojisOrTokens);

  // ==========================================================================
  // LAYER 1: Sunlit Per-Season 1966 Cyclorama + Warm Walnut Parquet Glow
  // ==========================================================================
  const seasonId: SeasonIdV7 = spec.season ?? 1;
  const seasonCycStops: Record<SeasonIdV7, readonly [string, string, string]> = {
    1: ['#00A3AE', '#007C87', '#1746A2'],
    2: ['#FF8C42', '#D95326', '#A81E52'],
    3: ['#1FA364', '#156E44', '#6E3B23'],
    4: ['#3B82E6', '#1E56C5', '#008B94'],
  };
  const [c0, c1, c2] = seasonCycStops[seasonId] ?? seasonCycStops[1];
  const cycGrad = ctx.createRadialGradient(540, 440, 90, 540, 540, 790);
  cycGrad.addColorStop(0, c0);
  cycGrad.addColorStop(0.54, c1);
  cycGrad.addColorStop(1, c2);
  ctx.fillStyle = cycGrad;
  ctx.fillRect(0, 0, CANVAS_SIZE_PX, CANVAS_SIZE_PX);

  // 24-Ray Mid-Century Starburst behind the console
  const burstPalette = ['#FFD166', '#FF6B35', '#FAF2DF', '#F2A922', '#E6397A'];
  ctx.save();
  for (let i = 0; i < 24; i += 1) {
    const a1 = ((i * 15 - 3.8) * Math.PI) / 180;
    const a2 = ((i * 15 + 3.8) * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(540, 495);
    ctx.lineTo(540 + Math.cos(a1) * 820, 495 + Math.sin(a1) * 820);
    ctx.lineTo(540 + Math.cos(a2) * 820, 495 + Math.sin(a2) * 820);
    ctx.closePath();
    ctx.fillStyle = burstPalette[i % burstPalette.length];
    ctx.globalAlpha = 0.11;
    ctx.fill();
  }
  ctx.restore();

  // Sunlit Studio 6A Honey-Walnut Stage Floor Horizon at Bottom
  const floorHorizonY = 972;
  const floorDeckGrad = ctx.createLinearGradient(0, floorHorizonY, 0, CANVAS_SIZE_PX);
  floorDeckGrad.addColorStop(0, '#7B4425');
  floorDeckGrad.addColorStop(0.5, '#5E3219');
  floorDeckGrad.addColorStop(1, '#442210');
  ctx.fillStyle = floorDeckGrad;
  ctx.fillRect(0, floorHorizonY, CANVAS_SIZE_PX, CANVAS_SIZE_PX - floorHorizonY);

  const floorPoolGrad = ctx.createRadialGradient(540, 1018, 30, 540, 1026, 490);
  floorPoolGrad.addColorStop(0, 'rgba(255, 217, 112, 0.42)');
  floorPoolGrad.addColorStop(0.55, 'rgba(255, 107, 53, 0.16)');
  floorPoolGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = floorPoolGrad;
  ctx.fillRect(0, floorHorizonY - 24, CANVAS_SIZE_PX, CANVAS_SIZE_PX - floorHorizonY + 24);

  ctx.fillStyle = '#F2A922';
  ctx.fillRect(0, floorHorizonY, CANVAS_SIZE_PX, 2.5);

  // Top 7px 1966 Living Color Network Spectrum Bar
  const spectrumCols = ['#F2A922', '#FF6B35', '#E6397A', '#7B3FE4', '#1746A2', '#008B94'];
  const segSpan = CANVAS_SIZE_PX / spectrumCols.length;
  for (let i = 0; i < spectrumCols.length; i += 1) {
    ctx.fillStyle = spectrumCols[i];
    ctx.fillRect(i * segSpan, 0, segSpan + 1, 7);
  }

  // Tapered Mid-Century Walnut Console Legs w/ 24K Brass Ferrules & Floor Shadow
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(540, 1052, 445, 17, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(34, 16, 6, 0.55)';
  ctx.fill();

  const drawMidCenturyLeg = (topX: number, splayPx: number): void => {
    ctx.beginPath();
    ctx.moveTo(topX, 996);
    ctx.lineTo(topX + 44, 996);
    ctx.lineTo(topX + 35 + splayPx, 1050);
    ctx.lineTo(topX + 9 + splayPx, 1050);
    ctx.closePath();
    const legWood = ctx.createLinearGradient(topX, 996, topX + 44, 1050);
    legWood.addColorStop(0, '#7A4326');
    legWood.addColorStop(1, '#4A2512');
    ctx.fillStyle = legWood;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(topX + 6 + splayPx * 0.65, 1030);
    ctx.lineTo(topX + 38 + splayPx * 0.65, 1030);
    ctx.lineTo(topX + 35 + splayPx, 1050);
    ctx.lineTo(topX + 9 + splayPx, 1050);
    ctx.closePath();
    const ferruleGrad = ctx.createLinearGradient(topX, 1030, topX + 40, 1050);
    ferruleGrad.addColorStop(0, '#FFE8A3');
    ferruleGrad.addColorStop(0.5, '#D79A2B');
    ferruleGrad.addColorStop(1, '#8C5B10');
    ctx.fillStyle = ferruleGrad;
    ctx.fill();
  };
  drawMidCenturyLeg(136, -12);
  drawMidCenturyLeg(900, 12);
  ctx.restore();

  // ==========================================================================
  // LAYER 2: 1966 RCA Victor "New Vista" American Walnut Console Cabinet
  // ==========================================================================
  const cabX = 36;
  const cabY = 36;
  const cabW = 1008;
  const cabH = 968;

  ctx.save();
  ctx.shadowColor = 'rgba(32, 15, 5, 0.58)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 16;
  roundedRectPath(ctx, cabX, cabY, cabW, cabH, 32);
  const walnutBodyGrad = ctx.createLinearGradient(cabX, cabY, cabX + cabW, cabY + cabH);
  walnutBodyGrad.addColorStop(0, '#93542F');
  walnutBodyGrad.addColorStop(0.26, '#6E3B23');
  walnutBodyGrad.addColorStop(0.68, '#5B301A');
  walnutBodyGrad.addColorStop(1, '#472311');
  ctx.fillStyle = walnutBodyGrad;
  ctx.fill();
  ctx.restore();

  // Hand-rubbed cathedral American Walnut woodgrain + 45° mitered cabinet bevels
  ctx.save();
  roundedRectPath(ctx, cabX, cabY, cabW, cabH, 32);
  ctx.clip();

  const topSheen = ctx.createLinearGradient(cabX, cabY, cabX, cabY + 26);
  topSheen.addColorStop(0, 'rgba(255, 226, 180, 0.28)');
  topSheen.addColorStop(1, 'rgba(255, 226, 180, 0)');
  ctx.fillStyle = topSheen;
  ctx.fillRect(cabX, cabY, cabW, 26);

  for (let i = 0; i < 72; i += 1) {
    const gy = cabY + (i / 71) * cabH;
    ctx.beginPath();
    for (let gx = cabX; gx <= cabX + cabW; gx += 22) {
      const cathedral =
        Math.sin(gx * 0.0075 + i * 0.39) * 5.8 +
        Math.cos(gx * 0.019 - i * 0.21) * 2.5;
      if (gx === cabX) ctx.moveTo(gx, gy + cathedral);
      else ctx.lineTo(gx, gy + cathedral);
    }
    ctx.lineWidth = i % 3 === 0 ? 2.1 : 1.15;
    ctx.strokeStyle =
      i % 4 === 0 ? 'rgba(248, 196, 128, 0.1)' : 'rgba(34, 14, 5, 0.2)';
    ctx.stroke();
  }

  const miterInset = 32;
  const corners: ReadonlyArray<readonly [number, number, number, number]> = [
    [cabX, cabY, cabX + miterInset, cabY + miterInset],
    [cabX + cabW, cabY, cabX + cabW - miterInset, cabY + miterInset],
    [cabX, cabY + cabH, cabX + miterInset, cabY + cabH - miterInset],
    [cabX + cabW, cabY + cabH, cabX + cabW - miterInset, cabY + cabH - miterInset],
  ];
  for (const [x1, y1, x2, y2] of corners) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = 'rgba(28, 11, 4, 0.48)';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x1, y1 + 1.5);
    ctx.lineTo(x2, y2 + 1.5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 214, 158, 0.2)';
    ctx.stroke();
  }
  ctx.restore();

  // Recessed 24K Satin Brass Trim Inlay framing the entire console front
  ctx.save();
  roundedRectPath(ctx, cabX + 20, cabY + 20, cabW - 40, cabH - 40, 22);
  const brassInlay = ctx.createLinearGradient(cabX, cabY, cabX + cabW, cabY + cabH);
  brassInlay.addColorStop(0, '#FFE8A6');
  brassInlay.addColorStop(0.35, '#E5A93B');
  brassInlay.addColorStop(0.7, '#B87D18');
  brassInlay.addColorStop(1, '#F2C15A');
  ctx.lineWidth = 3.2;
  ctx.strokeStyle = brassInlay;
  ctx.stroke();

  roundedRectPath(ctx, cabX + 24, cabY + 24, cabW - 48, cabH - 48, 19);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(34, 14, 5, 0.48)';
  ctx.stroke();
  ctx.restore();

  // ==========================================================================
  // LAYER 3: Right-Hand Brushed Champagne-Silver Tuning Panel & Speaker Grille
  // ==========================================================================
  const ctrlX = 852;
  const ctrlY = 74;
  const ctrlW = 156;
  const tunerH = 556;

  ctx.save();
  roundedRectPath(ctx, ctrlX, ctrlY, ctrlW, tunerH, 16);
  const champAlu = ctx.createLinearGradient(ctrlX, ctrlY, ctrlX + ctrlW, ctrlY + tunerH);
  champAlu.addColorStop(0, '#F7F1E4');
  champAlu.addColorStop(0.28, '#E0D6C2');
  champAlu.addColorStop(0.54, '#F2ECE0');
  champAlu.addColorStop(0.84, '#BEB39D');
  champAlu.addColorStop(1, '#DAD0BC');
  ctx.fillStyle = champAlu;
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#4A2B18';
  ctx.stroke();

  ctx.save();
  roundedRectPath(ctx, ctrlX, ctrlY, ctrlW, tunerH, 16);
  ctx.clip();
  for (let py = ctrlY + 3; py < ctrlY + tunerH; py += 3) {
    ctx.fillStyle =
      py % 6 === 0 ? 'rgba(255, 253, 246, 0.26)' : 'rgba(74, 48, 28, 0.06)';
    ctx.fillRect(ctrlX, py, ctrlW, 1);
  }
  ctx.restore();

  // Warm Oiled-Bronze Escutcheon Crest + Glowing Red "IN LIVING COLOR" Jewel Badge
  const badgeX = ctrlX + 10;
  const badgeY = ctrlY + 12;
  const badgeW = ctrlW - 20;
  const badgeH = 106;
  roundedRectPath(ctx, badgeX, badgeY, badgeW, badgeH, 11);
  ctx.fillStyle = '#3B2112';
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#E5A93B';
  ctx.stroke();

  drawLivingColorSpectrumCrest(ctx, ctrlX + ctrlW / 2, badgeY + 34);

  drawFittedText(ctx, 'NEW VISTA · 6A', ctrlX + ctrlW / 2, badgeY + 63, badgeW - 16, {
    fontFamily: FONT_SOLARI,
    fontSize: 9.5,
    minFontSize: 8,
    fontWeight: 800,
    fillStyle: '#FAF2DF',
  });

  const redX = badgeX + 7;
  const redY = badgeY + 74;
  const redW = badgeW - 14;
  const redH = 24;
  ctx.save();
  ctx.shadowColor = 'rgba(255, 59, 48, 0.72)';
  ctx.shadowBlur = 10;
  roundedRectPath(ctx, redX, redY, redW, redH, 6);
  const rubyGrad = ctx.createLinearGradient(redX, redY, redX, redY + redH);
  rubyGrad.addColorStop(0, '#FF5A4E');
  rubyGrad.addColorStop(0.5, '#DC2626');
  rubyGrad.addColorStop(1, '#991B1B');
  ctx.fillStyle = rubyGrad;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#FECACA';
  ctx.stroke();
  drawFittedText(ctx, 'IN LIVING COLOR', ctrlX + ctrlW / 2, redY + redH / 2 + 0.5, redW - 10, {
    fontFamily: FONT_MARQUEE,
    fontSize: 10.5,
    minFontSize: 8.5,
    fontWeight: 900,
    fillStyle: '#FFFDF7',
  });
  ctx.restore();

  // Dial #1: 3D Metallic VHF Rotary Channel Dial — CHANNEL 4 LIT!
  drawNewVistaRotaryDial(ctx, ctrlX + ctrlW / 2, ctrlY + 226, 44, {
    bandLabel: 'VHF',
    channelNumber: '4',
    isChannelFourHero: true,
    bladeAngleRad: -0.48,
  });

  // Dial #2: 3D Metallic UHF Rotary Channel Dial
  drawNewVistaRotaryDial(ctx, ctrlX + ctrlW / 2, ctrlY + 382, 41, {
    bandLabel: 'UHF',
    channelNumber: '66',
    isChannelFourHero: false,
    bladeAngleRad: 0.56,
  });

  // 3 Machined Brass Color / Tint / Tone Trim Knobs
  const trimLabels = ['COLOR', 'TINT', 'TONE'] as const;
  for (let i = 0; i < 3; i += 1) {
    const kx = ctrlX + 30 + i * 48;
    const ky = ctrlY + 480;
    ctx.beginPath();
    ctx.arc(kx, ky, 11.5, 0, Math.PI * 2);
    ctx.fillStyle = '#4A2B18';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(kx, ky, 8, 0, Math.PI * 2);
    const brassKnob = ctx.createLinearGradient(kx - 8, ky - 8, kx + 8, ky + 8);
    brassKnob.addColorStop(0, '#FFF1B8');
    brassKnob.addColorStop(0.5, '#E5A93B');
    brassKnob.addColorStop(1, '#8C5B10');
    ctx.fillStyle = brassKnob;
    ctx.fill();
    drawFittedText(ctx, trimLabels[i], kx, ky + 20, 42, {
      fontFamily: FONT_MARQUEE,
      fontSize: 9.5,
      minFontSize: 8,
      fontWeight: 900,
      fillStyle: '#2B180C',
    });
  }

  // Bottom Escutcheon Studio Pilot Lamp ("CH 4 LOCKED")
  roundedRectPath(ctx, ctrlX + 14, ctrlY + 516, ctrlW - 28, 28, 8);
  ctx.fillStyle = '#3B2112';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ctrlX + 31, ctrlY + 530, 5.2, 0, Math.PI * 2);
  ctx.fillStyle = '#34D399';
  ctx.fill();
  drawFittedText(ctx, 'CH 4 LOCKED', ctrlX + 88, ctrlY + 530.5, 92, {
    fontFamily: FONT_SOLARI,
    fontSize: 9.5,
    minFontSize: 8,
    fontWeight: 800,
    fillStyle: '#FFFDF7',
  });
  ctx.restore();

  // Lower Woven Gold-Thread Acoustic Speaker Grille
  const spkY = 644;
  const spkH = 322;
  ctx.save();
  roundedRectPath(ctx, ctrlX, spkY, ctrlW, spkH, 16);
  ctx.fillStyle = '#341B0D';
  ctx.fill();
  ctx.clip();

  ctx.fillStyle = 'rgba(20, 9, 3, 0.55)';
  for (let lx = ctrlX + 16; lx < ctrlX + ctrlW - 12; lx += 22) {
    roundedRectPath(ctx, lx, spkY + 18, 12, spkH - 36, 5);
    ctx.fill();
  }

  for (let sy = spkY; sy <= spkY + spkH; sy += 5) {
    const isGoldThread = sy % 15 === 0;
    ctx.fillStyle = isGoldThread ? '#F4C44E' : sy % 10 === 0 ? '#DECBA4' : '#B29668';
    ctx.globalAlpha = isGoldThread ? 0.84 : 0.66;
    ctx.fillRect(ctrlX, sy, ctrlW, isGoldThread ? 2.2 : 2.6);
  }
  for (let sx = ctrlX; sx <= ctrlX + ctrlW; sx += 7) {
    const isGoldWarp = sx % 21 === 0;
    ctx.fillStyle = isGoldWarp ? '#FFE082' : '#8C6F43';
    ctx.globalAlpha = isGoldWarp ? 0.66 : 0.44;
    ctx.fillRect(sx, spkY, 2.4, spkH);
  }
  ctx.globalAlpha = 1;

  roundedRectPath(ctx, ctrlX + 1, spkY + 1, ctrlW - 2, spkH - 2, 15);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#C98E23';
  ctx.stroke();

  const spkCx = ctrlX + ctrlW / 2;
  const spkCy = spkY + spkH / 2;
  ctx.beginPath();
  ctx.arc(spkCx, spkCy, 26, 0, Math.PI * 2);
  ctx.fillStyle = '#4A2812';
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#FFD166';
  ctx.stroke();
  drawFourPointSparkle(ctx, spkCx, spkCy, 17, 5.5, '#FFD966');
  ctx.restore();

  // ==========================================================================
  // LAYER 4: Curved Picture-Tube Bezel & SUNLIT LIVING COLOR CRT SCREEN!
  //   (`#FAF2DF` -> `#F2E5C8` radial warm studio light — ZERO dark-blue boxes!)
  // ==========================================================================
  const maskX = 72;
  const maskY = 74;
  const maskW = 764;
  const maskH = 892;

  ctx.save();
  roundedRectPath(ctx, maskX, maskY, maskW, maskH, 36);
  const bezelMaskGrad = ctx.createLinearGradient(maskX, maskY, maskX + maskW, maskY + maskH);
  bezelMaskGrad.addColorStop(0, '#EFE7D6');
  bezelMaskGrad.addColorStop(0.5, '#D2C8B2');
  bezelMaskGrad.addColorStop(1, '#ABA08A');
  ctx.fillStyle = bezelMaskGrad;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#3B2112';
  ctx.stroke();

  // Warm anodized bronze CRT surround collar
  crtBarrelScreenPath(ctx, maskX + 14, maskY + 14, maskW - 28, maskH - 28, 30, 5);
  ctx.fillStyle = '#4A2916';
  ctx.fill();
  ctx.restore();

  const crtX = maskX + 22; // 94
  const crtY = maskY + 22; // 96
  const crtW = maskW - 44; // 720
  const crtH = maskH - 44; // 848
  const crtCx = crtX + crtW / 2; // 454

  ctx.save();
  crtBarrelScreenPath(ctx, crtX, crtY, crtW, crtH, 26, 6);
  ctx.clip();

  // Sunlit Studio 6A Broadcast Light Backdrop (#FFFDF7 -> #FAF2DF -> #F2E5C8)
  const studioScreenGrad = ctx.createRadialGradient(
    crtCx,
    crtY + 380,
    40,
    crtCx,
    crtY + 424,
    580,
  );
  studioScreenGrad.addColorStop(0, '#FFFDF7');
  studioScreenGrad.addColorStop(0.52, '#FAF2DF');
  studioScreenGrad.addColorStop(1, '#F2E5C8');
  ctx.fillStyle = studioScreenGrad;
  ctx.fillRect(crtX - 12, crtY - 12, crtW + 24, crtH + 24);

  // Subtle Mid-Century Starburst Rays inside CRT Studio Cyclorama
  const crtRayColors = ['#F2A922', '#008B94', '#FF6B35', '#E6397A'];
  ctx.save();
  for (let i = 0; i < 24; i += 1) {
    const a1 = ((i * 15 - 3.2) * Math.PI) / 180;
    const a2 = ((i * 15 + 3.2) * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(crtCx, crtY + 445);
    ctx.lineTo(crtCx + Math.cos(a1) * 640, crtY + 445 + Math.sin(a1) * 640);
    ctx.lineTo(crtCx + Math.cos(a2) * 640, crtY + 445 + Math.sin(a2) * 640);
    ctx.closePath();
    ctx.fillStyle = crtRayColors[i % crtRayColors.length];
    ctx.globalAlpha = 0.055;
    ctx.fill();
  }
  ctx.restore();

  // Warm 2700K Studio Overhead Keylight Wash
  const keylightWash = ctx.createRadialGradient(crtCx, crtY + 80, 16, crtCx, crtY + 120, 420);
  keylightWash.addColorStop(0, 'rgba(255, 224, 130, 0.28)');
  keylightWash.addColorStop(1, 'rgba(255, 224, 130, 0)');
  ctx.fillStyle = keylightWash;
  ctx.fillRect(crtX, crtY, crtW, 460);

  const padX = crtX + 20; // 114
  const innerW = crtW - 40; // 680

  // --------------------------------------------------------------------------
  // CRT BAND 1: Broadcast Cobalt & Peacock Teal (#1746A2 -> #008B94) Marquee Plaque
  // --------------------------------------------------------------------------
  const mqY = crtY + 18; // 114
  const mqH = 116;

  ctx.save();
  ctx.shadowColor = 'rgba(92, 48, 27, 0.22)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  roundedRectPath(ctx, padX, mqY, innerW, mqH, 18);
  const mqBg = ctx.createLinearGradient(padX, mqY, padX + innerW, mqY + mqH);
  mqBg.addColorStop(0, '#1746A2');
  mqBg.addColorStop(0.52, '#008B94');
  mqBg.addColorStop(1, '#1746A2');
  ctx.fillStyle = mqBg;
  ctx.fill();
  ctx.restore();

  roundedRectPath(ctx, padX, mqY, innerW, mqH, 18);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#F2A922';
  ctx.stroke();

  // Chasing #FFD166 #11 incandescent bulbs framing top, bottom & sides
  const railBulbs = 14;
  for (let i = 0; i < railBulbs; i += 1) {
    const bx = padX + 24 + (i / (railBulbs - 1)) * (innerW - 48);
    drawMarqueeBulb11(ctx, bx, mqY + 1, 4.3, i);
    drawMarqueeBulb11(ctx, bx, mqY + mqH - 1, 4.3, i + 1);
  }
  drawMarqueeBulb11(ctx, padX + 1.5, mqY + mqH * 0.34, 4.1, 0);
  drawMarqueeBulb11(ctx, padX + 1.5, mqY + mqH * 0.66, 4.1, 1);
  drawMarqueeBulb11(ctx, padX + innerW - 1.5, mqY + mqH * 0.34, 4.1, 1);
  drawMarqueeBulb11(ctx, padX + innerW - 1.5, mqY + mqH * 0.66, 4.1, 2);

  if (isArchiveTape) {
    const archiveHeadline = `WORLD'S SMARTEST · ARCHIVE REEL #${epNum}`;
    const textW = drawFittedText(ctx, archiveHeadline, crtCx + 15, mqY + 33, innerW - 92, {
      fontFamily: FONT_MARQUEE,
      fontSize: 21.5,
      minFontSize: 13.5,
      fontWeight: 900,
      fillStyle: '#FFE694',
      shadowColor: 'rgba(20, 27, 41, 0.45)',
      shadowBlur: 4,
    });
    drawVectorAmpexTapeIcon(ctx, crtCx + 15 - textW / 2 - 20, mqY + 33, 0.95);
  } else {
    drawFittedText(
      ctx,
      `WORLD'S SMARTEST · 1966 DAILY #${epNum}`,
      crtCx,
      mqY + 33,
      innerW - 56,
      {
        fontFamily: FONT_MARQUEE,
        fontSize: 22.5,
        minFontSize: 14,
        fontWeight: 900,
        fillStyle: '#FFE694',
        shadowColor: 'rgba(20, 27, 41, 0.45)',
        shadowBlur: 4,
      },
    );
  }

  drawFittedText(
    ctx,
    `${dateLabel}  ·  ${stageTitle.toUpperCase()}`,
    crtCx,
    mqY + 64,
    innerW - 56,
    {
      fontFamily: FONT_MARQUEE,
      fontSize: 16.5,
      minFontSize: 11.5,
      fontWeight: 800,
      fillStyle: '#FFFDF7',
    },
  );

  const modeLine = isArchiveTape
    ? `${boardModeTitle.toUpperCase()} · STREAK-SAFE MASTER REEL`
    : `${boardModeTitle.toUpperCase()} · COAST-TO-COAST IN LIVING COLOR`;
  drawFittedText(ctx, modeLine, crtCx, mqY + 92, innerW - 56, {
    fontFamily: FONT_MARQUEE,
    fontSize: 13.5,
    minFontSize: 10.5,
    fontWeight: 900,
    fillStyle: '#FFD166',
  });

  // --------------------------------------------------------------------------
  // CRT BAND 2: Gleaming Harvest Gold (#F2A922) / Atomic Tangerine Result Ribbon
  // --------------------------------------------------------------------------
  const verdictY = mqY + mqH + 11; // 241
  const verdictH = 46;

  ctx.save();
  ctx.shadowColor = 'rgba(92, 48, 27, 0.16)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  roundedRectPath(ctx, padX, verdictY, innerW, verdictH, 13);
  if (won) {
    const winRibbon = ctx.createLinearGradient(padX, verdictY, padX + innerW, verdictY);
    winRibbon.addColorStop(0, '#F2A922');
    winRibbon.addColorStop(0.5, '#FFE27A');
    winRibbon.addColorStop(1, '#F2A922');
    ctx.fillStyle = winRibbon;
  } else {
    const closeRibbon = ctx.createLinearGradient(padX, verdictY, padX + innerW, verdictY);
    closeRibbon.addColorStop(0, '#FF7844');
    closeRibbon.addColorStop(0.5, '#FFB35C');
    closeRibbon.addColorStop(1, '#FF7844');
    ctx.fillStyle = closeRibbon;
  }
  ctx.fill();
  ctx.restore();

  roundedRectPath(ctx, padX, verdictY, innerW, verdictH, 13);
  ctx.lineWidth = 2;
  ctx.strokeStyle = won ? '#9E6206' : '#A6360E';
  ctx.stroke();

  const verdictLabel = isTie
    ? 'VICTORY! · CO-CHAMPION TIE'
    : won
      ? 'VICTORY! · CHAMPION DEFEATED'
      : 'PHOTO FINISH · STUDIO 6A OFFICIAL TOTE';
  const vTextW = drawFittedText(
    ctx,
    verdictLabel,
    crtCx + 14,
    verdictY + verdictH / 2 + 1,
    innerW - 84,
    {
      fontFamily: FONT_MARQUEE,
      fontSize: 20.5,
      minFontSize: 14,
      fontWeight: 900,
      fillStyle: '#141B29',
    },
  );
  if (won) {
    drawVectorTrophyIcon(
      ctx,
      crtCx + 14 - vTextW / 2 - 20,
      verdictY + verdictH / 2 + 1,
      1.05,
      '#141B29',
    );
  } else {
    drawVectorClapperboardIcon(
      ctx,
      crtCx + 14 - vTextW / 2 - 20,
      verdictY + verdictH / 2 + 1,
      1.05,
    );
  }

  // --------------------------------------------------------------------------
  // CRT BAND 3: Dual Sunlit Contestant Podium Plaques (Warm Ivory #FFFDF7!)
  //   Left = Peacock Teal Crown · Right = Atomic Tangerine Crown
  // --------------------------------------------------------------------------
  const sbY = verdictY + verdictH + 11; // 298
  const sbH = 142;
  const drumCardW = 316;
  const leftDrumX = padX;
  const rightDrumX = padX + innerW - drumCardW;

  const drawContestantPodiumPlaque = (
    x: number,
    crownLabel: string,
    scoreLine: string,
    isPlayerSide: boolean,
    isLeading: boolean,
  ): void => {
    ctx.save();

    // Warm sunlit drop shadow onto studio backdrop
    ctx.shadowColor = 'rgba(92, 48, 27, 0.18)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    roundedRectPath(ctx, x, sbY, drumCardW, sbH, 16);
    const bodyGrad = ctx.createLinearGradient(x, sbY, x, sbY + sbH);
    bodyGrad.addColorStop(0, '#FFFDF7');
    bodyGrad.addColorStop(1, '#F6EBCE');
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.lineWidth = isLeading ? 3 : 2.2;
    ctx.strokeStyle = isLeading ? '#E59A14' : isPlayerSide ? '#008B94' : '#FF6B35';
    ctx.stroke();

    // Crown Header Ribbon: Left = Peacock Teal, Right = Atomic Tangerine
    const crownH = 38;
    roundedRectPath(ctx, x + 3, sbY + 3, drumCardW - 6, crownH, 12);
    const crownGrad = ctx.createLinearGradient(x, sbY + 3, x + drumCardW, sbY + crownH);
    if (isPlayerSide) {
      crownGrad.addColorStop(0, '#008B94');
      crownGrad.addColorStop(1, '#006E77');
    } else {
      crownGrad.addColorStop(0, '#FF6B35');
      crownGrad.addColorStop(1, '#D94B18');
    }
    ctx.fillStyle = crownGrad;
    ctx.fill();

    drawFittedText(ctx, crownLabel, x + drumCardW / 2, sbY + 22.5, drumCardW - 24, {
      fontFamily: FONT_MARQUEE,
      fontSize: 15,
      minFontSize: 11,
      fontWeight: 900,
      fillStyle: '#FFFDF7',
    });

    // Warm Ivory Mechanical Split-Flap Plaque Window
    const flapX = x + 12;
    const flapY = sbY + 47;
    const flapW = drumCardW - 24;
    const flapH = 83;
    roundedRectPath(ctx, flapX, flapY, flapW, flapH, 10);
    const flapGrad = ctx.createLinearGradient(flapX, flapY, flapX, flapY + flapH);
    flapGrad.addColorStop(0, '#FFFFFF');
    flapGrad.addColorStop(0.49, '#FFFBF0');
    flapGrad.addColorStop(0.51, '#F8EED8');
    flapGrad.addColorStop(1, '#FFFDF7');
    ctx.fillStyle = flapGrad;
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#D5BC8E';
    ctx.stroke();

    drawFittedText(
      ctx,
      scoreLine,
      x + drumCardW / 2,
      flapY + flapH / 2 + 1.5,
      flapW - 22,
      {
        fontFamily: FONT_MARQUEE,
        fontSize: isPlayerSide ? 40 : 38,
        minFontSize: 22,
        fontWeight: 900,
        fillStyle: '#141B29',
      },
    );

    // Subtle warm brass split-flap axle seam & side brass hinge pins
    const seamY = flapY + flapH / 2;
    ctx.fillStyle = 'rgba(110, 59, 35, 0.14)';
    ctx.fillRect(flapX + 2, seamY - 0.8, flapW - 4, 1.6);
    ctx.fillStyle = '#C98E23';
    ctx.fillRect(flapX + 3, seamY - 4.5, 4, 9);
    ctx.fillRect(flapX + flapW - 7, seamY - 4.5, 4, 9);

    if (isLeading) {
      drawFivePointStar(ctx, x + drumCardW - 18, sbY + 22, 7.5, 3.2, '#FFE27A');
    }
    ctx.restore();
  };

  drawContestantPodiumPlaque(
    leftDrumX,
    'CHALLENGER · STUDIO 6A',
    `YOU ${formatUsd(playerCash)}`,
    true,
    playerCash >= rivalCash,
  );
  drawContestantPodiumPlaque(
    rightDrumX,
    `${rivalName.toUpperCase()}`,
    `${formatUsd(rivalCash)}`,
    false,
    rivalCash > playerCash,
  );

  // Center VS 24K Gold & Warm Ivory Medallion
  ctx.save();
  ctx.shadowColor = 'rgba(92, 48, 27, 0.22)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(crtCx, sbY + sbH / 2 + 6, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#F2A922';
  ctx.stroke();
  drawFittedText(ctx, 'VS', crtCx, sbY + sbH / 2 + 7, 32, {
    fontFamily: FONT_MARQUEE,
    fontSize: 15.5,
    fontWeight: 900,
    fillStyle: '#141B29',
  });
  ctx.restore();

  // --------------------------------------------------------------------------
  // CRT BAND 4: Sunlit Walnut & Brushed Brass Tote Frame + 3D Trilon Squares
  // --------------------------------------------------------------------------
  const tgY = sbY + sbH + 12; // 452
  const tgH = 196;

  // Outer Sunlit American Walnut & Brushed Brass Tote Cabinet Frame
  ctx.save();
  ctx.shadowColor = 'rgba(92, 48, 27, 0.2)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  roundedRectPath(ctx, padX, tgY, innerW, tgH, 16);
  const toteWalnutGrad = ctx.createLinearGradient(padX, tgY, padX + innerW, tgY + tgH);
  toteWalnutGrad.addColorStop(0, '#844A2A');
  toteWalnutGrad.addColorStop(0.5, '#6E3B23');
  toteWalnutGrad.addColorStop(1, '#532A16');
  ctx.fillStyle = toteWalnutGrad;
  ctx.fill();
  ctx.restore();

  roundedRectPath(ctx, padX, tgY, innerW, tgH, 16);
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = '#E5A93B';
  ctx.stroke();

  // Inner Warm Sunlit Ivory-Parchment Tote Recess
  const bayX = padX + 8;
  const bayY = tgY + 8;
  const bayW = innerW - 16;
  const bayH = tgH - 16;
  roundedRectPath(ctx, bayX, bayY, bayW, bayH, 11);
  const bayGrad = ctx.createLinearGradient(bayX, bayY, bayX, bayY + bayH);
  bayGrad.addColorStop(0, '#FFFDF7');
  bayGrad.addColorStop(0.75, '#FAF0D9');
  bayGrad.addColorStop(1, '#F2E2BE');
  ctx.fillStyle = bayGrad;
  ctx.fill();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = '#C99846';
  ctx.stroke();

  // Top Brushed-Brass Tote Nameplate Strip
  roundedRectPath(ctx, bayX + 8, bayY + 6, bayW - 16, 26, 7);
  const brassPlateGrad = ctx.createLinearGradient(bayX, bayY + 6, bayX + bayW, bayY + 6);
  brassPlateGrad.addColorStop(0, '#F5E4BE');
  brassPlateGrad.addColorStop(0.5, '#FFE8A6');
  brassPlateGrad.addColorStop(1, '#E6C685');
  ctx.fillStyle = brassPlateGrad;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#B88428';
  ctx.stroke();

  const hitsCount = tiles.filter((t) => t !== 'MISS').length;
  drawFittedText(
    ctx,
    `ZERO-SPOILER TRILON TOTE RACK  ·  ${hitsCount}/${tiles.length} TURNS WON`,
    crtCx,
    bayY + 19.5,
    bayW - 36,
    {
      fontFamily: FONT_MARQUEE,
      fontSize: 13,
      minFontSize: 10.5,
      fontWeight: 900,
      fillStyle: '#141B29',
    },
  );

  if (tiles.length <= 8) {
    const count = tiles.length;
    const tileSize = count <= 6 ? 82 : 68;
    const gap = count <= 6 ? 14 : 10;
    const rowW = count * tileSize + (count - 1) * gap;
    const startX = crtCx - rowW / 2;
    const rowY = tgY + 47 + (84 - tileSize) / 2;
    for (let i = 0; i < count; i += 1) {
      drawAcryliteTrilonTileV8(
        ctx,
        startX + i * (tileSize + gap),
        rowY,
        tileSize,
        tileSize,
        tiles[i],
        i + 1,
      );
    }
  } else {
    const topCount = Math.ceil(tiles.length / 2);
    const botCount = tiles.length - topCount;
    const tileW = 72;
    const tileH = 48;
    const gapX = 12;
    const gapY = 9;
    const startY = tgY + 44;

    const topRowW = topCount * tileW + (topCount - 1) * gapX;
    const topStartX = crtCx - topRowW / 2;
    for (let i = 0; i < topCount; i += 1) {
      drawAcryliteTrilonTileV8(
        ctx,
        topStartX + i * (tileW + gapX),
        startY,
        tileW,
        tileH,
        tiles[i],
        i + 1,
      );
    }

    const botRowW = botCount * tileW + (botCount - 1) * gapX;
    const botStartX = crtCx - botRowW / 2;
    for (let j = 0; j < botCount; j += 1) {
      const idx = topCount + j;
      drawAcryliteTrilonTileV8(
        ctx,
        botStartX + j * (tileW + gapX),
        startY + tileH + gapY,
        tileW,
        tileH,
        tiles[idx],
        idx + 1,
      );
    }
  }

  // Crisp `#141B29` Legend Strip at bottom of Sunlit Tote Bay
  const legendY = tgY + tgH - 22;
  const legendSpecs: ReadonlyArray<{
    readonly fill: string;
    readonly kind: 'check' | 'star' | 'miss';
    readonly label: string;
  }> = [
    { fill: '#008B84', kind: 'check', label: 'STANDARD HIT' },
    { fill: '#F2A922', kind: 'star', label: 'TWIST / VAULT STAR' },
    { fill: '#E03E36', kind: 'miss', label: 'MISSED CLUE' },
  ];
  const legSegW = 206;
  const legStartX = crtCx - (legendSpecs.length * legSegW) / 2 + 16;
  for (let i = 0; i < legendSpecs.length; i += 1) {
    const lx = legStartX + i * legSegW;
    roundedRectPath(ctx, lx, legendY - 8, 16, 16, 4);
    ctx.fillStyle = legendSpecs[i].fill;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#6E3B23';
    ctx.stroke();

    if (legendSpecs[i].kind === 'star') {
      drawFivePointStar(ctx, lx + 8, legendY, 5.2, 2.2, '#141B29');
    } else if (legendSpecs[i].kind === 'check') {
      ctx.beginPath();
      ctx.moveTo(lx + 4, legendY + 0.5);
      ctx.lineTo(lx + 7, legendY + 3.5);
      ctx.lineTo(lx + 12.2, legendY - 3);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#FFFDF7';
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(lx + 4.8, legendY - 3.2);
      ctx.lineTo(lx + 11.2, legendY + 3.2);
      ctx.moveTo(lx + 11.2, legendY - 3.2);
      ctx.lineTo(lx + 4.8, legendY + 3.2);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#FFFDF7';
      ctx.stroke();
    }

    drawFittedText(ctx, legendSpecs[i].label, lx + 22, legendY + 0.5, legSegW - 28, {
      fontFamily: FONT_MARQUEE,
      fontSize: 12,
      minFontSize: 10,
      fontWeight: 900,
      fillStyle: '#141B29',
      align: 'left',
    });
  }

  // --------------------------------------------------------------------------
  // CRT BAND 5: Warm Cream & Gold Percentile Seal + Carnaby Cerise Streak Plaque
  // --------------------------------------------------------------------------
  const pctY = tgY + tgH + 12; // 660
  const pctH = 164;
  const pctCardW = 462;
  const streakX = padX + pctCardW + 12;
  const streakW = innerW - pctCardW - 12; // 206

  const topPctClean = stripLeadingDecorEmojis(percentile.topPercentLabel || 'TOP 2%');
  const rankTitleClean = stripLeadingDecorEmojis(
    percentile.rankTitle || 'NETWORK SOVEREIGN',
  );

  // Left: Warm Cream & Gold Studio Audience Percentile Seal Plaque
  ctx.save();
  ctx.shadowColor = 'rgba(92, 48, 27, 0.16)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  roundedRectPath(ctx, padX, pctY, pctCardW, pctH, 18);
  const pctBg = ctx.createLinearGradient(padX, pctY, padX, pctY + pctH);
  pctBg.addColorStop(0, '#FFFDF7');
  pctBg.addColorStop(1, '#F8EBD0');
  ctx.fillStyle = pctBg;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#E59A14';
  ctx.stroke();

  // Scalloped 24K Gold Starburst Audience Medallion Seal
  const sealCx = padX + 68;
  const sealCy = pctY + pctH / 2;
  const sealHalo = ctx.createRadialGradient(sealCx, sealCy, 8, sealCx, sealCy, 58);
  sealHalo.addColorStop(0, 'rgba(242, 169, 34, 0.35)');
  sealHalo.addColorStop(1, 'rgba(242, 169, 34, 0)');
  ctx.fillStyle = sealHalo;
  ctx.beginPath();
  ctx.arc(sealCx, sealCy, 58, 0, Math.PI * 2);
  ctx.fill();

  const teeth = 24;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i += 1) {
    const a = (i * Math.PI) / teeth;
    const r = i % 2 === 0 ? 50 : 42;
    const sx = sealCx + Math.cos(a) * r;
    const sy = sealCy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  const goldSealGrad = ctx.createLinearGradient(sealCx - 50, sealCy - 50, sealCx + 50, sealCy + 50);
  goldSealGrad.addColorStop(0, '#FFEBA8');
  goldSealGrad.addColorStop(0.5, '#F2A922');
  goldSealGrad.addColorStop(1, '#B87409');
  ctx.fillStyle = goldSealGrad;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = '#8F5805';
  ctx.stroke();

  // Peacock Teal inner enamel core of starburst seal
  ctx.beginPath();
  ctx.arc(sealCx, sealCy, 36, 0, Math.PI * 2);
  ctx.fillStyle = '#008B94';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFDF7';
  ctx.stroke();

  drawFittedText(ctx, topPctClean, sealCx, sealCy - 6, 62, {
    fontFamily: FONT_MARQUEE,
    fontSize: 16,
    minFontSize: 11,
    fontWeight: 900,
    fillStyle: '#FFE694',
  });
  drawFittedText(ctx, `${formatOrdinalUpper(percentile.percentile)} PCT`, sealCx, sealCy + 13, 60, {
    fontFamily: FONT_MARQUEE,
    fontSize: 10.5,
    minFontSize: 8.5,
    fontWeight: 800,
    fillStyle: '#FFFDF7',
  });

  const ribX = padX + 130;
  const ribW = pctCardW - 144;
  drawFittedText(ctx, 'STUDIO AUDIENCE PERCENTILE SEAL', ribX, pctY + 27, ribW, {
    fontFamily: FONT_MARQUEE,
    fontSize: 12,
    minFontSize: 10,
    fontWeight: 900,
    fillStyle: '#00727A',
    align: 'left',
  });

  // Gleaming 24K Harvest Gold Starburst Ribbon (`TOP 2% · NETWORK SOVEREIGN`)
  const bannerY = pctY + 43;
  const bannerH = 40;
  roundedRectPath(ctx, ribX, bannerY, ribW, bannerH, 10);
  const ribGrad = ctx.createLinearGradient(ribX, bannerY, ribX + ribW, bannerY);
  ribGrad.addColorStop(0, '#F2A922');
  ribGrad.addColorStop(0.5, '#FFE48C');
  ribGrad.addColorStop(1, '#E59A14');
  ctx.fillStyle = ribGrad;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#A66A08';
  ctx.stroke();

  drawFittedText(
    ctx,
    `${topPctClean} · ${rankTitleClean}`,
    ribX + ribW / 2,
    bannerY + bannerH / 2 + 0.5,
    ribW - 18,
    {
      fontFamily: FONT_MARQUEE,
      fontSize: 16.5,
      minFontSize: 11.5,
      fontWeight: 900,
      fillStyle: '#141B29',
    },
  );

  ctx.save();
  ctx.font = `700 13.5px ${FONT_BODY}`;
  ctx.fillStyle = '#3B2818';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const noteLines = wrapTextLines(
    ctx,
    percentile.studioNote || `Outscored ${percentile.percentile}% of Studio 6A broadcasts!`,
    ribW,
    2,
  );
  for (let i = 0; i < noteLines.length; i += 1) {
    ctx.fillText(noteLines[i], ribX, pctY + 107 + i * 21, ribW);
  }
  ctx.restore();
  ctx.restore();

  // Right: Carnaby Cerise / Atomic Tangerine Daily Streak Plaque (Vector Flame!)
  ctx.save();
  ctx.shadowColor = 'rgba(230, 57, 122, 0.22)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  roundedRectPath(ctx, streakX, pctY, streakW, pctH, 18);
  const stBg = ctx.createLinearGradient(streakX, pctY, streakX + streakW, pctY + pctH);
  stBg.addColorStop(0, '#E6397A');
  stBg.addColorStop(0.52, '#F25252');
  stBg.addColorStop(1, '#FF6B35');
  ctx.fillStyle = stBg;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#F2A922';
  ctx.stroke();

  const stCx = streakX + streakW / 2;
  drawVectorStreakFlame(ctx, stCx, pctY + 38, 0.96);

  // Crisp Warm Ivory Streak Readout Pill inside Cerise/Tangerine Plaque
  const pillW = streakW - 22;
  const pillX = streakX + 11;
  const pillY = pctY + 72;
  const pillH = 44;
  roundedRectPath(ctx, pillX, pillY, pillW, pillH, 999);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#FFD166';
  ctx.stroke();

  drawFittedText(
    ctx,
    `${streakCount}-DAY STREAK`,
    stCx,
    pillY + pillH / 2 + 0.5,
    pillW - 16,
    {
      fontFamily: FONT_MARQUEE,
      fontSize: 17,
      minFontSize: 12,
      fontWeight: 900,
      fillStyle: '#141B29',
    },
  );

  drawFittedText(
    ctx,
    isArchiveTape ? 'STREAK-SAFE VAULT' : 'LIVE STUDIO FLAME',
    stCx,
    pctY + 138,
    streakW - 20,
    {
      fontFamily: FONT_MARQUEE,
      fontSize: 12.5,
      minFontSize: 10,
      fontWeight: 900,
      fillStyle: '#FFFDF7',
    },
  );
  ctx.restore();

  // --------------------------------------------------------------------------
  // CRT BAND 6: Crisp Studio 6A Call-to-Action Footer (`y = 836..920`, `h = 84`)
  // --------------------------------------------------------------------------
  const footY = pctY + pctH + 12; // 836
  const footH = 84;

  roundedRectPath(ctx, padX, footY, innerW, footH, 16);
  const footGrad = ctx.createLinearGradient(padX, footY, padX + innerW, footY);
  footGrad.addColorStop(0, '#008B94');
  footGrad.addColorStop(0.5, '#1746A2');
  footGrad.addColorStop(1, '#008B94');
  ctx.fillStyle = footGrad;
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = '#F2A922';
  ctx.stroke();

  drawFittedText(
    ctx,
    'FIFTY MILLION WATCHING · CAN YOU TOP THIS BROADCAST?',
    crtCx,
    footY + 30,
    innerW - 36,
    {
      fontFamily: FONT_MARQUEE,
      fontSize: 19.5,
      minFontSize: 13.5,
      fontWeight: 900,
      fillStyle: '#FFE694',
      shadowColor: 'rgba(20, 27, 41, 0.4)',
      shadowBlur: 4,
    },
  );

  drawFittedText(
    ctx,
    "STUDIO 6A IN LIVING COLOR · SAME DAILY BOARD WORLDWIDE · ZERO SPOILERS",
    crtCx,
    footY + 59,
    innerW - 40,
    {
      fontFamily: FONT_MARQUEE,
      fontSize: 12.8,
      minFontSize: 10,
      fontWeight: 800,
      fillStyle: '#FFFDF7',
    },
  );

  // --------------------------------------------------------------------------
  // CRT LAYER 7: Subtle Warm CRT Scanlines, Vignette & Curved Glass Reflection
  // --------------------------------------------------------------------------
  ctx.fillStyle = 'rgba(110, 59, 35, 0.018)';
  for (let sy = crtY; sy < crtY + crtH; sy += 4) {
    ctx.fillRect(crtX, sy, crtW, 1);
  }

  // Gently curved upper-left sunlit CRT glass reflection arc
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(crtX, crtY + 220);
  ctx.quadraticCurveTo(crtX + 95, crtY + 65, crtX + 340, crtY);
  ctx.lineTo(crtX + 205, crtY);
  ctx.quadraticCurveTo(crtX + 55, crtY + 45, crtX, crtY + 130);
  ctx.closePath();
  const arcSheen = ctx.createLinearGradient(crtX, crtY, crtX + 290, crtY + 200);
  arcSheen.addColorStop(0, 'rgba(255, 255, 255, 0.34)');
  arcSheen.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
  arcSheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = arcSheen;
  ctx.fill();
  ctx.restore();

  // Warm CRT perimeter glass shadow vignette
  crtBarrelScreenPath(ctx, crtX, crtY, crtW, crtH, 26, 6);
  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(92, 48, 27, 0.28)';
  ctx.stroke();

  ctx.restore(); // End CRT clip

  return canvas;
}

function loadSameOriginAtlasImageV9(url: string): Promise<HTMLImageElement | null> {
  if (typeof Image === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Renders the 1080x1080 Walnut Console TV Share Card and, when a packed 1966
 * gouache Prize or VIP sprite ID is provided and available in `atlas_manifest_v9.json`,
 * composites it inside a brass-rimmed collector cameo on the right speaker grille.
 */
export async function renderWalnutConsoleTvShareCardWithAtlasV9(
  spec: WalnutConsoleTvShareSpecV8,
  opts?: { readonly prizeId?: string; readonly vipId?: string },
): Promise<HTMLCanvasElement> {
  const canvas = renderWalnutConsoleTvShareCanvasV8(spec);
  const targetId = opts?.prizeId || opts?.vipId;
  if (!targetId) return canvas;

  try {
    const manifest = await loadAtlasManifestV9();
    const resolved = getAtlasSpriteEntryV9(targetId, manifest);
    if (!resolved) return canvas;

    const img = await loadSameOriginAtlasImageV9(resolved.assetUrl);
    if (!img) return canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const spkCx = 852 + 156 / 2; // 930
    const spkCy = 644 + 322 / 2; // 805
    const r = 48;
    const { sprite } = resolved;

    ctx.save();
    ctx.beginPath();
    ctx.arc(spkCx, spkCy, r + 6, 0, Math.PI * 2);
    ctx.fillStyle = '#4A2812';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#F2A922';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(spkCx, spkCy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#FAF2DF';
    ctx.fillRect(spkCx - r, spkCy - r, r * 2, r * 2);
    ctx.drawImage(
      img,
      sprite.x,
      sprite.y,
      sprite.w,
      sprite.h,
      spkCx - r,
      spkCy - r,
      r * 2,
      r * 2,
    );
    ctx.restore();
  } catch {
    // Graceful fallback: synchronous card remains untainted and complete
  }
  return canvas;
}

// ----------------------------------------------------------------------------
// 7. Native Web Share Level 2 (`navigator.canShare` File) & Clean PNG Download
// ----------------------------------------------------------------------------

function sanitizeSharePngFilename(rawFilename: string | undefined): string {
  const base =
    rawFilename && rawFilename.trim().length > 0
      ? rawFilename.trim()
      : 'worlds-smartest-1966-daily.png';
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, '-');
  return cleaned.toLowerCase().endsWith('.png') ? cleaned : `${cleaned}.png`;
}

function decodeDataUrlToPngBlob(canvas: HTMLCanvasElement): Blob | null {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx < 0) return null;
    const b64 = dataUrl.slice(commaIdx + 1);
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) {
      bytes[i] = bin.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'image/png' });
  } catch {
    return null;
  }
}

function encodeCanvasPngBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
            return;
          }
          resolve(decodeDataUrlToPngBlob(canvas));
        }, 'image/png');
        return;
      }
      resolve(decodeDataUrlToPngBlob(canvas));
    } catch {
      resolve(decodeDataUrlToPngBlob(canvas));
    }
  });
}

async function copyShareCaptionToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to hidden textarea fallback
  }

  try {
    if (typeof document !== 'undefined' && document.body) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', 'true');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.pointerEvents = 'none';
      document.body.appendChild(ta);
      ta.select();
      const copied = document.execCommand('copy');
      ta.remove();
      return copied;
    }
  } catch {
    // Ignore restricted clipboard environments
  }
  return false;
}

function triggerAnchorDownload(href: string, safeName: string, revokeAfterMs = 0): boolean {
  if (typeof document === 'undefined' || !document.body) return false;
  try {
    const link = document.createElement('a');
    link.href = href;
    link.download = safeName;
    link.rel = 'noopener';
    link.style.position = 'fixed';
    link.style.opacity = '0';
    link.style.pointerEvents = 'none';
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      link.remove();
      if (revokeAfterMs > 0 && typeof URL !== 'undefined' && URL.revokeObjectURL) {
        try {
          URL.revokeObjectURL(href);
        } catch {
          // Ignore
        }
      }
    }, Math.max(250, revokeAfterMs));
    return true;
  } catch {
    return false;
  }
}

/**
 * Downloads the `1080×1080` 1966 Walnut Console TV Share Card directly as a crisp `.png`.
 */
export function downloadWalnutTvCardPngV8(
  canvas: HTMLCanvasElement,
  filename?: string,
): void {
  if (typeof document === 'undefined') return;
  const safeName = sanitizeSharePngFilename(filename);

  try {
    const dataUrl = canvas.toDataURL('image/png');
    triggerAnchorDownload(dataUrl, safeName, 0);
  } catch {
    void encodeCanvasPngBlob(canvas).then((blob) => {
      if (blob && typeof URL !== 'undefined' && URL.createObjectURL) {
        const objUrl = URL.createObjectURL(blob);
        triggerAnchorDownload(objUrl, safeName, 1500);
      }
    });
  }
}

/**
 * Shares the `1080×1080` Walnut RCA Console TV PNG via native Web Share Level 2
 * (`canvas.toBlob` -> `navigator.canShare({ files })` on iOS/Android), or triggers
 * a clean PNG download + clipboard caption copy on Desktop browsers.
 */
export async function shareWalnutTvCardImageV8(
  canvas: HTMLCanvasElement,
  shareText: string,
  filename?: string,
): Promise<WalnutTvShareResultV8> {
  const safeName = sanitizeSharePngFilename(filename);
  const blob = await encodeCanvasPngBlob(canvas);

  if (
    blob &&
    typeof File !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'
  ) {
    try {
      const pngFile = new File([blob], safeName, { type: 'image/png' });
      const supportsFileShare =
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [pngFile] });

      if (supportsFileShare) {
        await navigator.share({
          title: "WORLD'S SMARTEST · 1966 Daily Broadcast",
          text: shareText,
          files: [pngFile],
        });
        return 'WEB_SHARED';
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        await copyShareCaptionToClipboard(shareText);
        return 'CLIPBOARD_TEXT';
      }
    }
  }

  await copyShareCaptionToClipboard(shareText);

  if (blob && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    const objUrl = URL.createObjectURL(blob);
    if (triggerAnchorDownload(objUrl, safeName, 1500)) {
      return 'DOWNLOADED_PNG';
    }
  }

  try {
    const dataUrl = canvas.toDataURL('image/png');
    if (triggerAnchorDownload(dataUrl, safeName, 0)) {
      return 'DOWNLOADED_PNG';
    }
  } catch {
    // Ignore and return CLIPBOARD_TEXT
  }

  return 'CLIPBOARD_TEXT';
}
