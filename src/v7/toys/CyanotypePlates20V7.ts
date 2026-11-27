// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 — 1966 "IN LIVING COLOR")
// `src/v7/toys/CyanotypePlates20V7.ts`
//
// 20 Museum-Grade Hand-Painted 1966 Mid-Century Gouache & Serigraph Specimen
// Boards (`./assets/v7/plates/<slug>.jpg`, Charley Harper / Golden Book / LIFE
// 1966 visual aesthetic) mounted in an interactive 4x2 (8-compartment) RCA
// Color Studio Monitor (`viewBox="0 0 480 264"`).
//
// Strict Safety & Ergonomic Invariants:
//   - 100% backward-compatible TypeScript exports (`renderCyanotypePlateSVG`,
//     `CYANOTYPE_PLATES_20_V7`, `CYANOTYPE_PLATE_SPECS_V7`, `CyanotypePlateSpecV7`,
//     `CyanotypeRenderOptionsV7`, `CYANOTYPE_PALETTE_V7`,
//     `CATEGORY_PLATE_IMAGE_PATHS_V8`, `getCategoryPlateImageUrlV8`).
//   - ZERO dark-blue `#0B1D30` / `#081830` boxes and ZERO programmer stick-art:
//     all 8 interactive `[data-zone-idx="0..7"]` chambers use transparent
//     Acrylite hit-frames directly over the genuine painted 1966 gouache art!
//   - Strictly disjoint 4x2 geometry (`w = 116 >= 86`, `h = 126 >= 80`).
//   - >= 14:1 contrast Warm-Cream & Brass corner numeral medallions (1..8)
//     using pure vector stroke paths (ZERO `<text>` tags, ZERO spoiler words!).
// ============================================================================

import type { CategoryIdV7 } from '../contracts_v7';

export type CyanotypeZoneIndexV7 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CyanotypeChamberBoxV7 {
  readonly idx: CyanotypeZoneIndexV7;
  /** Center X in 480x264 monitor viewBox space. */
  readonly cx: number;
  /** Center Y in 480x264 monitor viewBox space. */
  readonly cy: number;
  /** Width >= 86 viewBox units (116 units -> >= 56px CSS on mobile portrait & landscape). */
  readonly w: number;
  /** Height >= 80 viewBox units (126 units -> >= 58px CSS on mobile portrait & landscape). */
  readonly h: number;
  /** Legacy compatibility field (empty when painted gouache plate is rendered). */
  readonly motifSvg: string;
}

export interface LivingColorHarmonyV8 {
  readonly groundTopHex: string;
  readonly groundMidHex: string;
  readonly groundBotHex: string;
  readonly gridHex: string;
  readonly chamberFillHex: string;
  readonly chamberStrokeHex: string;
  readonly rivetHex: string;
  readonly accentGlowHex: string;
}

export interface CyanotypePlateSpecV7 {
  readonly category: CategoryIdV7;
  readonly architecturalTitle: string; // Metadata only — NEVER rendered inside SVG!
  readonly imagePath?: string;
  readonly harmony: LivingColorHarmonyV8;
  readonly structuralDraftingSvg: string;
  readonly chambers: readonly [
    CyanotypeChamberBoxV7,
    CyanotypeChamberBoxV7,
    CyanotypeChamberBoxV7,
    CyanotypeChamberBoxV7,
    CyanotypeChamberBoxV7,
    CyanotypeChamberBoxV7,
    CyanotypeChamberBoxV7,
    CyanotypeChamberBoxV7,
  ];
}

export interface CyanotypeRenderOptionsV7 {
  /** Chamber index (0..7) currently flashing with #FFFDF5 tungsten starburst lock. */
  readonly activeZoneIdx?: number | null;
  /** Optional post-answer revealed true chamber index (0..7). */
  readonly revealedTargetIdx?: number | null;
  /** PATENT_CLERK dayJob / relic perk: highlights chamfer witness ticks on target zone. */
  readonly patentClerkHintIdx?: number | null;
  /** Fact-checker / 50-50 pruned distractor chamber index (stamps vermilion crosshatch). */
  readonly pruneZoneIdx?: number | null;
  /** Canary grease-pencil tick chamber index. */
  readonly canaryZoneIdx?: number | null;
  /** UV Loupe poisoned-fix chamber index. */
  readonly poisonedZoneIdx?: number | null;
  readonly uvLoupeActive?: boolean;
  readonly className?: string;
  /** Optional asset base override for standalone capture harnesses. */
  readonly assetBaseUrl?: string;
}

export const CYANOTYPE_PALETTE_V7 = {
  prussianGround: '#FAF2DF',
  prussianGrid: '#D9A441',
  prussianChamberFill: '#FFFDF7',
  boneDrafting: '#FFF6E3',
  giltBrass: '#D9A441',
  giltBrassShadow: '#B87D1E',
  peacockTeal: '#008B94',
  peacockBright: '#00C4D4',
  atomicTangerine: '#FF6B35',
  carnabyCerise: '#E6397A',
  broadcastCobalt: '#1746A2',
  warmWalnut: '#6E3B23',
  specularIris: '#FFFDF5',
  vermilionVoid: '#D92B3A',
  canaryBlue: '#008B94',
  uvIndigo: '#9D5CFF',
} as const;

export const CATEGORY_PLATE_IMAGE_PATHS_V8: Record<CategoryIdV7, string> = {
  MEDICINE: './assets/v7/plates/medicine.jpg',
  CHEMISTRY: './assets/v7/plates/chemistry.jpg',
  PHYSICS: './assets/v7/plates/physics.jpg',
  GADGETS: './assets/v7/plates/gadgets.jpg',
  ENGINES: './assets/v7/plates/engines.jpg',
  LITERATURE: './assets/v7/plates/literature.jpg',
  LEXICON: './assets/v7/plates/lexicon.jpg',
  'FINE ARTS': './assets/v7/plates/fine_arts.jpg',
  SCREEN: './assets/v7/plates/screen.jpg',
  JUKEBOX: './assets/v7/plates/jukebox.jpg',
  FINANCE: './assets/v7/plates/finance.jpg',
  PRICING: './assets/v7/plates/pricing.jpg',
  ODDS: './assets/v7/plates/odds.jpg',
  ATLAS: './assets/v7/plates/atlas.jpg',
  SPORTS: './assets/v7/plates/sports.jpg',
  DYNASTIES: './assets/v7/plates/dynasties.jpg',
  HEADLINES: './assets/v7/plates/headlines.jpg',
  FOLKLORE: './assets/v7/plates/folklore.jpg',
  FALLACIES: './assets/v7/plates/fallacies.jpg',
  CUISINE: './assets/v7/plates/cuisine.jpg',
};

export function getCategoryPlateImageUrlV8(
  category: CategoryIdV7,
  assetBaseUrl?: string,
): string {
  const rel = CATEGORY_PLATE_IMAGE_PATHS_V8[category] ?? CATEGORY_PLATE_IMAGE_PATHS_V8.PHYSICS;
  if (!assetBaseUrl) return rel;
  return rel.replace(/^\.\//, assetBaseUrl.endsWith('/') ? assetBaseUrl : `${assetBaseUrl}/`);
}

const PLATE_ORDER_INDEX_V8: Record<CategoryIdV7, number> = {
  MEDICINE: 0,
  CHEMISTRY: 1,
  PHYSICS: 2,
  GADGETS: 3,
  ENGINES: 4,
  LITERATURE: 5,
  LEXICON: 6,
  'FINE ARTS': 7,
  SCREEN: 8,
  JUKEBOX: 9,
  FINANCE: 10,
  PRICING: 11,
  ODDS: 12,
  ATLAS: 13,
  SPORTS: 14,
  DYNASTIES: 15,
  HEADLINES: 16,
  FOLKLORE: 17,
  FALLACIES: 18,
  CUISINE: 19,
};

/**
 * Pure vector stroke paths for digits 1..8 (zero `<text>` tags, >= 14:1 contrast
 * dark ink `#141B29` on Warm Broadcast Cream `#FAF2DF` corner medallions).
 */
const ZONE_NUMERAL_PATHS_V8: readonly string[] = [
  'M3.5,3 L6.2,1.2 L6.2,12.8 M3.5,12.8 L9,12.8', // 1
  'M2.2,4 C2.2,1.2 9.2,1.2 9.2,4.5 C9.2,7.8 2.2,9.5 2.2,12.8 L9.5,12.8', // 2
  'M2.2,3 C2.2,1.2 9.2,1.2 9.2,4 C9.2,6.4 5.5,6.9 5.5,6.9 C5.5,6.9 9.5,7.4 9.5,10.3 C9.5,13.2 2.2,13.2 2.2,10.8', // 3
  'M8,12.8 L8,1.2 L1.8,9 L9.8,9', // 4
  'M9,1.5 L2.6,1.5 L2.6,6.4 C5,5.5 9.4,6.4 9.4,9.8 C9.4,13 3,13.2 2.2,11', // 5
  'M8.5,2.4 C5,0.8 2.2,3.6 2.2,8.4 C2.2,12.4 9,12.8 9,9.4 C9,6.5 2.6,6.5 2.2,8.6', // 6
  'M2.2,1.5 L9.4,1.5 L4.6,12.8', // 7
  'M5.8,6.8 C2.6,6.8 2.6,1.5 5.8,1.5 C9,1.5 9,6.8 5.8,6.8 Z M5.8,6.8 C2.2,6.8 2.2,12.8 5.8,12.8 C9.4,12.8 9.4,6.8 5.8,6.8 Z', // 8
];

const SUNLIT_HARMONY_V8: LivingColorHarmonyV8 = {
  groundTopHex: '#FAF2DF',
  groundMidHex: '#F5E8CA',
  groundBotHex: '#EAD8B3',
  gridHex: '#D9A441',
  chamberFillHex: '#FFFDF7',
  chamberStrokeHex: '#E5C167',
  rivetHex: '#D9A441',
  accentGlowHex: '#FF6B35',
};

/**
 * 8 strictly disjoint 116x126 chambers aligned 1-to-1 with the painted 4x2
 * champagne-brass specimen grid inside `viewBox="0 0 480 264"`:
 *  - Cols x0 = 2, 122, 242, 362 (w = 116 -> right edges 118, 238, 358, 478; gap = 4 units)
 *  - Rows y0 = 3, 135 (h = 126 -> bottom edges 129, 261; gap = 6 units)
 */
const ALIGNED_4X2_CHAMBERS_V8: CyanotypePlateSpecV7['chambers'] = [
  { idx: 0, cx: 60, cy: 66, w: 116, h: 126, motifSvg: '' },
  { idx: 1, cx: 180, cy: 66, w: 116, h: 126, motifSvg: '' },
  { idx: 2, cx: 300, cy: 66, w: 116, h: 126, motifSvg: '' },
  { idx: 3, cx: 420, cy: 66, w: 116, h: 126, motifSvg: '' },
  { idx: 4, cx: 60, cy: 198, w: 116, h: 126, motifSvg: '' },
  { idx: 5, cx: 180, cy: 198, w: 116, h: 126, motifSvg: '' },
  { idx: 6, cx: 300, cy: 198, w: 116, h: 126, motifSvg: '' },
  { idx: 7, cx: 420, cy: 198, w: 116, h: 126, motifSvg: '' },
];

function makePlateSpec(category: CategoryIdV7, architecturalTitle: string): CyanotypePlateSpecV7 {
  return {
    category,
    architecturalTitle,
    imagePath: CATEGORY_PLATE_IMAGE_PATHS_V8[category],
    harmony: SUNLIT_HARMONY_V8,
    structuralDraftingSvg: '',
    chambers: ALIGNED_4X2_CHAMBERS_V8,
  };
}

export const CYANOTYPE_PLATE_SPECS_V7: Record<CategoryIdV7, CyanotypePlateSpecV7> = {
  MEDICINE: makePlateSpec('MEDICINE', '1966 Golden Book Anatomical Cutaways & Vital Valves'),
  CHEMISTRY: makePlateSpec('CHEMISTRY', '1966 Mid-Century Laboratory Glassware & Retorts'),
  PHYSICS: makePlateSpec('PHYSICS', '1966 Space & Forces Optical Prism & Pendulum Specimen Board'),
  GADGETS: makePlateSpec('GADGETS', '1966 Precision Cameras, Optics & Electronics Cutaways'),
  ENGINES: makePlateSpec('ENGINES', '1966 Great Machines, Turbines & Escapement Cutaways'),
  LITERATURE: makePlateSpec('LITERATURE', '1966 Bookmaking, Marbled Endpapers & Printing Press'),
  LEXICON: makePlateSpec('LEXICON', '1966 Typography Mechanics, Matrices & Writing Tools'),
  'FINE ARTS': makePlateSpec('FINE ARTS', '1966 Classical Architecture, Rose Window & Fine Arts'),
  SCREEN: makePlateSpec('SCREEN', '1966 Hollywood Cinematography, Technicolor & Multiplane Rig'),
  JUKEBOX: makePlateSpec('JUKEBOX', '1966 Acoustic & Electric Musical Instrument Mechanisms'),
  FINANCE: makePlateSpec('FINANCE', '1966 Stock Ticker, Bank Time-Locks & Vault Engineering'),
  PRICING: makePlateSpec('PRICING', '1966 Mechanical Scales, Cash Registers & Retail Contraptions'),
  ODDS: makePlateSpec('ODDS', '1966 Monte Carlo Probability, Galton Board & Casino Mechanics'),
  ATLAS: makePlateSpec('ATLAS', '1966 Marine Navigation, Sextant, Astrolabe & Cartography'),
  SPORTS: makePlateSpec('SPORTS', '1966 Sports Aerodynamics, Chronographs & Athletic Gear'),
  DYNASTIES: makePlateSpec('DYNASTIES', '1966 Ancient Empires, Castles & Aqueduct Engineering'),
  HEADLINES: makePlateSpec('HEADLINES', '1966 Rotary Press, Telegraph & Space Recovery History'),
  FOLKLORE: makePlateSpec('FOLKLORE', '1966 Myths, Clockwork Automata & Wonder Cabinet'),
  FALLACIES: makePlateSpec('FALLACIES', '1966 Optical Illusions, Paradoxes & Logic Machines'),
  CUISINE: makePlateSpec('CUISINE', '1966 Culinary Science, Espresso Pressure & Classic Vessels'),
};

export const CYANOTYPE_PLATES_20_V7: Record<CategoryIdV7, CyanotypePlateSpecV7> =
  CYANOTYPE_PLATE_SPECS_V7;

/**
 * Renders one of 20 genuine hand-painted 1966 Mid-Century gouache & serigraph
 * specimen boards (`viewBox="0 0 480 264"`) with 8 strictly disjoint,
 * crystal-clear interactive touch compartments (`data-zone-idx="0..7"`).
 *
 * STRICT INVARIANT: Contains ZERO `<text>` elements, ZERO HTML comments,
 * ZERO `#0B1D30` dark-blue boxes, and ZERO spoiler English words!
 */
export function renderCyanotypePlateSVG(
  category: CategoryIdV7,
  opts: CyanotypeRenderOptionsV7 = {},
): string {
  const spec = CYANOTYPE_PLATE_SPECS_V7[category] ?? CYANOTYPE_PLATE_SPECS_V7.PHYSICS;
  const plateIdx = PLATE_ORDER_INDEX_V8[spec.category] ?? 0;
  const imgUrl = getCategoryPlateImageUrlV8(spec.category, opts.assetBaseUrl);

  const activeIdx = opts.activeZoneIdx ?? null;
  const revealedIdx = opts.revealedTargetIdx ?? null;
  const hintIdx = opts.patentClerkHintIdx ?? null;
  const pruneIdx = opts.pruneZoneIdx ?? null;
  const canaryIdx = opts.canaryZoneIdx ?? null;
  const uvIdx = opts.uvLoupeActive ? (opts.poisonedZoneIdx ?? null) : null;
  const cls = opts.className ? ` ${opts.className}` : '';

  const clipId = `ws8PlateClip${plateIdx}`;
  const sheenId = `ws8PlateSheen${plateIdx}`;

  const chambersSvg = spec.chambers
    .map((c) => {
      const x0 = Number((c.cx - c.w * 0.5).toFixed(1));
      const y0 = Number((c.cy - c.h * 0.5).toFixed(1));
      const isFlash = activeIdx === c.idx;
      const isRevealed = revealedIdx === c.idx;
      const isHint = hintIdx === c.idx;
      const isPruned = pruneIdx === c.idx;
      const isCanary = canaryIdx === c.idx;
      const isPoison = uvIdx === c.idx;

      // Transparent over the painted gouache artwork in normal state!
      const fillHex = isFlash
        ? '#FFFDF5'
        : isRevealed
          ? '#22C55E'
          : isPruned
            ? '#FAF2DF'
            : '#FFFFFF';
      const fillOpacity = isFlash
        ? '0.42'
        : isRevealed
          ? '0.16'
          : isPruned
            ? '0.68'
            : '0.001';

      const strokeHex = isFlash
        ? '#FFFDF5'
        : isRevealed
          ? '#16A34A'
          : isPruned
            ? '#D92B3A'
            : '#D9A441';
      const strokeOpacity = isFlash || isRevealed || isPruned ? '1' : '0.45';
      const strokeWidth = isFlash || isRevealed ? '3.6' : isPruned ? '2.8' : '1.4';

      const numeralPath = ZONE_NUMERAL_PATHS_V8[c.idx] ?? ZONE_NUMERAL_PATHS_V8[0];
      const badgeW = 20;
      const badgeH = 19;
      const badgeX = Number((x0 + c.w - badgeW - 4).toFixed(1));
      const badgeY = Number((y0 + c.h - badgeH - 4).toFixed(1));
      const numX = Number((badgeX + 4.2).toFixed(1));
      const numY = Number((badgeY + 2.4).toFixed(1));

      const extraSvg: string[] = [];
      if (isHint) {
        extraSvg.push(
          `<rect x="${x0 + 2}" y="${y0 + 2}" width="${c.w - 4}" height="${c.h - 4}" rx="7" fill="none" stroke="#008B94" stroke-width="3" stroke-dasharray="7 4"/>`,
        );
      }
      if (isRevealed) {
        extraSvg.push(
          `<rect x="${x0 + 1.5}" y="${y0 + 1.5}" width="${c.w - 3}" height="${c.h - 3}" rx="7" fill="none" stroke="#FFFDF5" stroke-width="1.8"/>`,
          `<circle cx="${x0 + c.w - 14}" cy="${y0 + 14}" r="10" fill="#16A34A" stroke="#FFFDF5" stroke-width="2"/>`,
          `<path d="M${x0 + c.w - 19},${y0 + 14} L${x0 + c.w - 15.2},${y0 + 18} L${x0 + c.w - 8.8},${y0 + 10}" fill="none" stroke="#FFFDF5" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
        );
      }
      if (isPruned) {
        extraSvg.push(
          `<path d="M${x0 + 12},${y0 + 12} L${x0 + c.w - 12},${y0 + c.h - 12} M${x0 + c.w - 12},${y0 + 12} L${x0 + 12},${y0 + c.h - 12}" stroke="#D92B3A" stroke-width="4.2" stroke-linecap="round"/>`,
        );
      }
      if (isCanary) {
        extraSvg.push(
          `<circle cx="${x0 + c.w - 15}" cy="${y0 + 15}" r="10" fill="#FAF2DF" stroke="#008B94" stroke-width="2.2"/>`,
          `<path d="M${x0 + c.w - 20},${y0 + 15} L${x0 + c.w - 16},${y0 + 19} L${x0 + c.w - 9.5},${y0 + 10.5}" fill="none" stroke="#008B94" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`,
        );
      }
      if (isPoison) {
        extraSvg.push(
          `<circle cx="${x0 + 16}" cy="${y0 + 36}" r="9.5" fill="#6D28D9" stroke="#FAF2DF" stroke-width="1.8"/>`,
          `<polygon points="${x0 + 16},${y0 + 30} ${x0 + 21},${y0 + 36} ${x0 + 16},${y0 + 42} ${x0 + 11},${y0 + 36}" fill="#FAF2DF"/>`,
        );
      }
      if (isFlash) {
        extraSvg.push(
          `<rect x="${x0 + 2}" y="${y0 + 2}" width="${c.w - 4}" height="${c.h - 4}" rx="7" fill="none" stroke="#FFD166" stroke-width="4"/>`,
        );
      }

      return `<g class="ws7-cyano-chamber${isFlash ? ' is-iris-flash' : ''}" data-zone-idx="${c.idx}" data-cx="${c.cx}" data-cy="${c.cy}" data-x0="${x0}" data-y0="${y0}" data-w="${c.w}" data-h="${c.h}" role="button" tabindex="0" style="cursor:pointer;"><rect x="${x0}" y="${y0}" width="${c.w}" height="${c.h}" rx="6" fill="${fillHex}" fill-opacity="${fillOpacity}" stroke="${strokeHex}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}"/><rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="5" fill="#FAF2DF" fill-opacity="0.94" stroke="#8A5A1E" stroke-width="1.4" pointer-events="none"/><g transform="translate(${numX},${numY})" pointer-events="none"><path d="${numeralPath}" fill="none" stroke="#141B29" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>${extraSvg.join('')}</g>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" class="ws7-cyanotype-svg${cls}" data-plate-idx="${plateIdx}" viewBox="0 0 480 264" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;max-height:100%;display:block;touch-action:manipulation;user-select:none;"><defs><clipPath id="${clipId}"><rect x="0" y="0" width="480" height="264" rx="11"/></clipPath><linearGradient id="${sheenId}" x1="0%" y1="0%" x2="25%" y2="100%"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.14"/><stop offset="36%" stop-color="#FFFFFF" stop-opacity="0.02"/><stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient></defs><g clip-path="url(#${clipId})"><rect x="0" y="0" width="480" height="264" fill="#FAF2DF"/><image href="${imgUrl}" x="0" y="0" width="480" height="264" preserveAspectRatio="none"/><line x1="120" y1="0" x2="120" y2="264" stroke="#D9A441" stroke-width="2.2" stroke-opacity="0.85" pointer-events="none"/><line x1="240" y1="0" x2="240" y2="264" stroke="#D9A441" stroke-width="2.2" stroke-opacity="0.85" pointer-events="none"/><line x1="360" y1="0" x2="360" y2="264" stroke="#D9A441" stroke-width="2.2" stroke-opacity="0.85" pointer-events="none"/><line x1="0" y1="132" x2="480" y2="132" stroke="#D9A441" stroke-width="2.4" stroke-opacity="0.88" pointer-events="none"/><rect x="1" y="1" width="478" height="262" rx="10.5" fill="none" stroke="#D9A441" stroke-width="2.4" pointer-events="none"/><path d="M4,10 Q240,2 476,10 L476,74 Q240,54 4,82 Z" fill="url(#${sheenId})" pointer-events="none"/></g><g class="ws7-cyano-chambers">${chambersSvg}</g></svg>`;
}
