// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// `src/v7/toys/CyanotypePlates20V7.ts`
//
// All 20 High-Contrast (13.4:1) Prussian-Blue (#0A192F) & Bone-White (#F4F0E4)
// Architectural / Horological Vector Cutaway Plates — 1 bespoke cutaway per
// `CategoryIdV7`, each fitted with 8 disjoint, generous (>=52x52px on both
// 390x660 portrait and 844x390 landscape) #F2C94C gilt-brass interactive
// chambers (`data-zone-idx="0..7"`) and ZERO spoiler text inside the blueprint!
// Tapping any brass chamber locks in 1 gesture with a #FFF8DC specular iris flash.
// ============================================================================

import type { CategoryIdV7 } from '../contracts_v7';

export type CyanotypeZoneIndexV7 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CyanotypeChamberBoxV7 {
  readonly idx: CyanotypeZoneIndexV7;
  /** Center X in 480x264 blueprint viewBox space. */
  readonly cx: number;
  /** Center Y in 480x264 blueprint viewBox space. */
  readonly cy: number;
  /** Width >= 86 viewBox units (>= 58px CSS on 390px mobile portrait & 844x390 landscape). */
  readonly w: number;
  /** Height >= 80 viewBox units (>= 54px CSS on 390px mobile portrait & 844x390 landscape). */
  readonly h: number;
  /** Non-text internal horological/mechanical SVG symbol rendered inside the chamber. */
  readonly motifSvg: string;
}

export interface CyanotypePlateSpecV7 {
  readonly category: CategoryIdV7;
  readonly architecturalTitle: string; // Metadata only — NEVER rendered as spoiler text inside SVG!
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
  /** Chamber index (0..7) currently flashing with #FFF8DC specular iris lock. */
  readonly activeZoneIdx?: number | null;
  /** Optional post-answer revealed true chamber index (0..7). */
  readonly revealedTargetIdx?: number | null;
  /** PATENT_CLERK dayJob perk: highlights subtle gilt chamfer witness ticks on target zone. */
  readonly patentClerkHintIdx?: number | null;
  /** Fact-checker / Scalpel pruned distractor chamber index (stamps vermilion crosshatch). */
  readonly pruneZoneIdx?: number | null;
  /** Canary grease-pencil tick chamber index. */
  readonly canaryZoneIdx?: number | null;
  /** UV Loupe poisoned-fix chamber index. */
  readonly poisonedZoneIdx?: number | null;
  readonly uvLoupeActive?: boolean;
  readonly className?: string;
}

// Contrast & 1966 Living Color TV Monitor Palette Constants:
// Monitor Screen: #0D2444 (1966 RCA Broadcast Royal Navy)
// Drafting Linework: #FFF6E3 (Warm TV Cream — >12.5:1 contrast vs #0D2444)
// Interactive Zones: #FFD166 (Harvest Marquee Gold) + #00B4C6 (Peacock Teal)
// Specular Lock Flash: #FFFDF5 (Tungsten Studio Flash)
export const CYANOTYPE_PALETTE_V7 = {
  prussianGround: '#0D2444',
  prussianGrid: '#183B6B',
  prussianChamberFill: '#12355E',
  boneDrafting: '#FFF6E3',
  giltBrass: '#FFD166',
  giltBrassShadow: '#F4A91F',
  specularIris: '#FFFDF5',
  vermilionVoid: '#E03E36',
  canaryBlue: '#00D2E6',
  uvIndigo: '#9D5CFF',
} as const;

/**
 * Helper to build 8 guaranteed-disjoint, generous >=86x80 SVG-unit chambers
 * inside viewBox="0 0 480 264".
 *
 * Dimensional Proof:
 * - Minimum horizontal center-to-center spacing >= 112 units (width 86 -> >= 26 units gap).
 * - Minimum vertical center-to-center spacing >= 116 units (height 80 -> >= 36 units gap).
 * - On 390x660 portrait (inner SVG width ~348px): scale = 348/480 = 0.725 -> 62.4px x 58.0px (>= 52x52px!).
 * - On 844x390 landscape (inner SVG <= 468x252px): scale = 252/264 = 0.954 -> 82.1px x 76.4px (>= 52x52px!).
 */
function buildDisjointChambers(
  offsets: readonly [
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
  ],
  motifs: readonly [string, string, string, string, string, string, string, string],
): CyanotypePlateSpecV7['chambers'] {
  const baseCenters: readonly [number, number][] = [
    [64, 68],
    [181, 68],
    [299, 68],
    [416, 68],
    [64, 196],
    [181, 196],
    [299, 196],
    [416, 196],
  ];
  const out = baseCenters.map(([bx, by], i) => {
    const dx = Math.max(-5, Math.min(5, offsets[i][0]));
    const dy = Math.max(-5, Math.min(5, offsets[i][1]));
    return {
      idx: i as CyanotypeZoneIndexV7,
      cx: bx + dx,
      cy: by + dy,
      w: 96,
      h: 88,
      motifSvg: motifs[i],
    };
  });
  return out as unknown as CyanotypePlateSpecV7['chambers'];
}

// Reusable non-text horological / anatomical / mechanical chamber micro-motifs
const M_VALVE = `<circle cx="0" cy="0" r="16" fill="none" stroke="#F4F0E4" stroke-width="1.6"/><path d="M-12,-4 L0,8 L12,-4 M0,8 L0,16" fill="none" stroke="#F2C94C" stroke-width="2"/>`;
const M_GEAR = `<circle cx="0" cy="0" r="14" fill="none" stroke="#F2C94C" stroke-width="2"/><circle cx="0" cy="0" r="6" fill="none" stroke="#F4F0E4" stroke-width="1.5"/><path d="M0,-19 L0,-14 M0,14 L0,19 M-19,0 L-14,0 M14,0 L19,0 M-13,-13 L-10,-10 M10,10 L13,13 M13,-13 L10,-10 M-10,10 L-13,13" stroke="#F2C94C" stroke-width="2.2"/>`;
const M_COIL = `<path d="M-18,0 C-18,-14 -9,-14 -9,0 C-9,14 0,14 0,0 C0,-14 9,-14 9,0 C9,14 18,14 18,0" fill="none" stroke="#F4F0E4" stroke-width="1.8"/>`;
const M_PISTON = `<rect x="-12" y="-14" width="24" height="16" rx="2" fill="none" stroke="#F2C94C" stroke-width="2"/><path d="M0,2 L0,18 M-8,18 L8,18" stroke="#F4F0E4" stroke-width="2"/>`;
const M_PRISM = `<polygon points="0,-16 17,12 -17,12" fill="none" stroke="#F4F0E4" stroke-width="1.8"/><path d="M-22,2 L17,2" stroke="#F2C94C" stroke-width="1.5" stroke-dasharray="3 2"/>`;
const M_LENS = `<path d="M-6,-17 Q8,0 -6,17 Q-20,0 -6,-17 Z M8,-17 Q22,0 8,17 Q-6,0 8,-17 Z" fill="none" stroke="#F4F0E4" stroke-width="1.6"/>`;
const M_BELLOWS = `<path d="M-16,-14 L16,-10 L-16,-3 L16,4 L-16,11 L16,15" fill="none" stroke="#F2C94C" stroke-width="1.8"/>`;
const M_ESCAPEMENT = `<circle cx="0" cy="4" r="12" fill="none" stroke="#F4F0E4" stroke-width="1.6"/><path d="M-14,-10 Q0,-20 14,-10 L10,-3 M-14,-10 L-10,-3" fill="none" stroke="#F2C94C" stroke-width="2"/>`;
const M_CHAMBER_ARCH = `<path d="M-15,15 L-15,-4 A15,15 0 0,1 15,-4 L15,15 Z" fill="none" stroke="#F4F0E4" stroke-width="1.8"/><circle cx="0" cy="-2" r="5" fill="none" stroke="#F2C94C" stroke-width="1.8"/>`;
const M_RETORT = `<circle cx="-4" cy="4" r="12" fill="none" stroke="#F4F0E4" stroke-width="1.7"/><path d="M4,-5 L20,-14 L22,-9 L8,2" fill="none" stroke="#F2C94C" stroke-width="1.7"/>`;
const M_PENDULUM = `<path d="M0,-18 L0,6" stroke="#F4F0E4" stroke-width="1.8"/><circle cx="0" cy="11" r="7" fill="none" stroke="#F2C94C" stroke-width="2.2"/>`;
const M_GAUGE = `<path d="M-17,10 A18,18 0 1,1 17,10" fill="none" stroke="#F4F0E4" stroke-width="1.7"/><path d="M0,8 L10,-8" stroke="#F2C94C" stroke-width="2.2"/><circle cx="0" cy="8" r="3" fill="#F2C94C"/>`;

export const CYANOTYPE_PLATE_SPECS_V7: Record<CategoryIdV7, CyanotypePlateSpecV7> = {
  MEDICINE: {
    category: 'MEDICINE',
    architecturalTitle: 'Four-Chamber Anatomical Heart & Aortic Arch Cutaway',
    structuralDraftingSvg: `
      <path d="M240,238 C132,196 96,128 124,68 C144,28 202,32 240,74 C278,32 336,28 356,68 C384,128 348,196 240,238 Z" fill="none" stroke="#F4F0E4" stroke-width="2.4"/>
      <path d="M240,74 L236,226 M136,128 L344,132" stroke="#F4F0E4" stroke-width="1.8"/>
      <path d="M212,56 C212,16 286,14 298,58 M168,54 L168,18 M320,54 L320,20" fill="none" stroke="#F4F0E4" stroke-width="2.1"/>
      <ellipse cx="190" cy="102" rx="34" ry="24" fill="none" stroke="#F4F0E4" stroke-width="1.3" stroke-dasharray="5 3"/>
      <ellipse cx="290" cy="102" rx="34" ry="24" fill="none" stroke="#F4F0E4" stroke-width="1.3" stroke-dasharray="5 3"/>
      <path d="M164,152 Q200,206 236,216 M316,152 Q280,206 242,216" fill="none" stroke="#F4F0E4" stroke-width="1.6"/>
      <path d="M56,70 L132,88 M424,70 L348,88 M56,194 L162,178 M424,194 L318,178" stroke="#F4F0E4" stroke-width="1.1" stroke-dasharray="4 3"/>
    `,
    chambers: buildDisjointChambers(
      [[-4, -4], [0, -6], [4, -6], [4, -4], [-4, 4], [-2, 6], [2, 6], [4, 4]],
      [M_VALVE, M_CHAMBER_ARCH, M_GAUGE, M_VALVE, M_COIL, M_PISTON, M_BELLOWS, M_CHAMBER_ARCH],
    ),
  },

  CHEMISTRY: {
    category: 'CHEMISTRY',
    architecturalTitle: 'Vigreux Fractional Distillation Tower & Liebig Condenser',
    structuralDraftingSvg: `
      <rect x="212" y="22" width="56" height="196" rx="14" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <path d="M212,62 L248,74 M268,90 L232,102 M212,118 L248,130 M268,146 L232,158 M212,174 L248,186" stroke="#F4F0E4" stroke-width="1.8"/>
      <circle cx="240" cy="232" r="24" fill="none" stroke="#F4F0E4" stroke-width="2.2"/>
      <path d="M268,48 L398,92 L390,112 L268,68" fill="none" stroke="#F4F0E4" stroke-width="2"/>
      <path d="M82,74 L212,74 M82,194 L212,194 M396,104 L414,186" fill="none" stroke="#F4F0E4" stroke-width="1.5" stroke-dasharray="5 3"/>
    `,
    chambers: buildDisjointChambers(
      [[-4, 0], [0, -5], [2, -5], [5, 2], [-4, 4], [0, 6], [2, 5], [5, 4]],
      [M_RETORT, M_COIL, M_VALVE, M_LENS, M_GAUGE, M_BELLOWS, M_RETORT, M_CHAMBER_ARCH],
    ),
  },

  PHYSICS: {
    category: 'PHYSICS',
    architecturalTitle: 'Lawrence Magnetic Cyclotron Dees & Foucault Pendulum',
    structuralDraftingSvg: `
      <circle cx="240" cy="132" r="106" fill="none" stroke="#F4F0E4" stroke-width="2.4"/>
      <path d="M234,36 A96,96 0 0,0 234,228 Z" fill="none" stroke="#F4F0E4" stroke-width="1.9"/>
      <path d="M246,36 A96,96 0 0,1 246,228 Z" fill="none" stroke="#F4F0E4" stroke-width="1.9"/>
      <path d="M240,132 m-18,0 a18,18 0 1,0 36,0 a28,28 0 1,0 -56,0 a42,42 0 1,0 84,0 a58,58 0 1,0 -116,0" fill="none" stroke="#F4F0E4" stroke-width="1.3" stroke-dasharray="4 3"/>
      <line x1="42" y1="132" x2="438" y2="132" stroke="#F4F0E4" stroke-width="1.1" stroke-dasharray="6 4"/>
    `,
    chambers: buildDisjointChambers(
      [[-5, -4], [-2, -6], [2, -6], [5, -4], [-5, 4], [-2, 6], [2, 6], [5, 4]],
      [M_COIL, M_PENDULUM, M_GAUGE, M_PRISM, M_GEAR, M_ESCAPEMENT, M_COIL, M_PENDULUM],
    ),
  },

  GADGETS: {
    category: 'GADGETS',
    architecturalTitle: '35mm SLR Camera Roof Pentaprism & Focal-Plane Cutaway',
    structuralDraftingSvg: `
      <rect x="118" y="58" width="256" height="164" rx="10" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <polygon points="184,58 242,18 312,36 296,58" fill="none" stroke="#F4F0E4" stroke-width="2.2"/>
      <rect x="44" y="88" width="74" height="104" rx="6" fill="none" stroke="#F4F0E4" stroke-width="2.1"/>
      <line x1="196" y1="192" x2="274" y2="114" stroke="#F4F0E4" stroke-width="2.4"/>
      <path d="M48,140 L235,140 L235,44 L368,44" fill="none" stroke="#F4F0E4" stroke-width="1.4" stroke-dasharray="5 3"/>
      <line x1="332" y1="68" x2="332" y2="212" stroke="#F4F0E4" stroke-width="2"/>
    `,
    chambers: buildDisjointChambers(
      [[-6, 2], [-2, -6], [4, -6], [6, -4], [-6, 4], [-2, 6], [4, 6], [6, 4]],
      [M_LENS, M_PRISM, M_ESCAPEMENT, M_GAUGE, M_GEAR, M_PRISM, M_PISTON, M_LENS],
    ),
  },

  ENGINES: {
    category: 'ENGINES',
    architecturalTitle: 'Watt Centrifugal Flyball Governor & 4-Stroke Cylinder',
    structuralDraftingSvg: `
      <line x1="182" y1="22" x2="182" y2="236" stroke="#F4F0E4" stroke-width="2.4"/>
      <path d="M182,42 L124,116 L182,162 M182,42 L240,116 L182,162" fill="none" stroke="#F4F0E4" stroke-width="2"/>
      <circle cx="122" cy="116" r="16" fill="none" stroke="#F4F0E4" stroke-width="2.2"/>
      <circle cx="242" cy="116" r="16" fill="none" stroke="#F4F0E4" stroke-width="2.2"/>
      <rect x="278" y="48" width="94" height="168" rx="6" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <rect x="288" y="96" width="74" height="36" fill="none" stroke="#F4F0E4" stroke-width="2"/>
      <circle cx="404" cy="192" r="46" fill="none" stroke="#F4F0E4" stroke-width="2.2"/>
    `,
    chambers: buildDisjointChambers(
      [[-4, -4], [0, -6], [3, -5], [6, -4], [-4, 4], [0, 6], [3, 5], [6, 4]],
      [M_VALVE, M_PENDULUM, M_PISTON, M_GAUGE, M_BELLOWS, M_GEAR, M_PISTON, M_GEAR],
    ),
  },

  LITERATURE: {
    category: 'LITERATURE',
    architecturalTitle: 'Gutenberg Wooden Screw Press, Spindle & Tympan Carriage',
    structuralDraftingSvg: `
      <line x1="136" y1="18" x2="136" y2="246" stroke="#F4F0E4" stroke-width="3"/>
      <line x1="344" y1="18" x2="344" y2="246" stroke="#F4F0E4" stroke-width="3"/>
      <line x1="116" y1="34" x2="364" y2="34" stroke="#F4F0E4" stroke-width="2.6"/>
      <rect x="226" y="34" width="28" height="106" fill="none" stroke="#F4F0E4" stroke-width="2"/>
      <path d="M226,48 L254,58 M226,68 L254,78 M226,88 L254,98 M226,108 L254,118" stroke="#F4F0E4" stroke-width="1.8"/>
      <line x1="154" y1="118" x2="392" y2="86" stroke="#F4F0E4" stroke-width="2.4"/>
      <rect x="158" y="146" width="164" height="22" fill="none" stroke="#F4F0E4" stroke-width="2.1"/>
      <line x1="68" y1="186" x2="412" y2="186" stroke="#F4F0E4" stroke-width="2.4"/>
    `,
    chambers: buildDisjointChambers(
      [[-4, -3], [0, -6], [0, -6], [5, -3], [-4, 5], [0, 6], [0, 6], [5, 5]],
      [M_CHAMBER_ARCH, M_PISTON, M_GEAR, M_BELLOWS, M_PRISM, M_PISTON, M_ESCAPEMENT, M_CHAMBER_ARCH],
    ),
  },

  LEXICON: {
    category: 'LEXICON',
    architecturalTitle: 'Mergenthaler Linotype 90-Channel Matrix Magazine & Caster',
    structuralDraftingSvg: `
      <polygon points="128,28 338,28 296,124 168,124" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <path d="M158,28 L184,124 M198,28 L212,124 M238,28 L240,124 M278,28 L266,124 M314,28 L284,124" stroke="#F4F0E4" stroke-width="1.3"/>
      <rect x="152" y="138" width="176" height="86" rx="6" fill="none" stroke="#F4F0E4" stroke-width="2.2"/>
      <path d="M74,198 L152,158 M328,158 L408,82" fill="none" stroke="#F4F0E4" stroke-width="2"/>
    `,
    chambers: buildDisjointChambers(
      [[-5, -4], [-2, -5], [2, -5], [5, -4], [-5, 5], [-2, 5], [2, 5], [5, 5]],
      [M_GEAR, M_CHAMBER_ARCH, M_PRISM, M_ESCAPEMENT, M_PISTON, M_RETORT, M_VALVE, M_GAUGE],
    ),
  },

  'FINE ARTS': {
    category: 'FINE ARTS',
    architecturalTitle: 'Renaissance Cupola Lantern, Camera Obscura & Golden Dividers',
    structuralDraftingSvg: `
      <path d="M84,234 A156,156 0 0,1 396,234" fill="none" stroke="#F4F0E4" stroke-width="2.5"/>
      <path d="M114,234 A126,134 0 0,1 366,234" fill="none" stroke="#F4F0E4" stroke-width="1.6" stroke-dasharray="6 4"/>
      <rect x="218" y="24" width="44" height="54" fill="none" stroke="#F4F0E4" stroke-width="2.2"/>
      <path d="M240,78 L112,234 M240,78 L194,234 M240,78 L286,234 M240,78 L368,234" stroke="#F4F0E4" stroke-width="1.3"/>
      <line x1="60" y1="234" x2="420" y2="234" stroke="#F4F0E4" stroke-width="2.2"/>
    `,
    chambers: buildDisjointChambers(
      [[-4, -2], [-2, -6], [2, -6], [4, -2], [-4, 4], [-2, 6], [2, 6], [4, 4]],
      [M_LENS, M_CHAMBER_ARCH, M_PRISM, M_PENDULUM, M_CHAMBER_ARCH, M_LENS, M_PRISM, M_CHAMBER_ARCH],
    ),
  },

  SCREEN: {
    category: 'SCREEN',
    architecturalTitle: 'Mitchell 35mm Coaxial Film Magazine & Maltese-Cross Projector',
    structuralDraftingSvg: `
      <circle cx="176" cy="68" r="46" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <circle cx="282" cy="68" r="46" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <rect x="148" y="116" width="168" height="108" rx="8" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <polygon points="316,148 424,112 424,208 316,172" fill="none" stroke="#F4F0E4" stroke-width="2.1"/>
      <path d="M176,114 L188,196 L282,196 L282,114" fill="none" stroke="#F4F0E4" stroke-width="1.5" stroke-dasharray="4 3"/>
    `,
    chambers: buildDisjointChambers(
      [[-5, -4], [-3, -4], [3, -4], [5, -4], [-5, 5], [-2, 5], [2, 5], [5, 5]],
      [M_GEAR, M_GEAR, M_ESCAPEMENT, M_LENS, M_COIL, M_PRISM, M_ESCAPEMENT, M_LENS],
    ),
  },

  JUKEBOX: {
    category: 'JUKEBOX',
    architecturalTitle: 'Wurlitzer Pipe-Organ Windchest, Reed Ranks & Carousel Arm',
    structuralDraftingSvg: `
      <path d="M72,226 L72,62 A168,148 0 0,1 408,62 L408,226 Z" fill="none" stroke="#F4F0E4" stroke-width="2.4"/>
      <rect x="146" y="42" width="22" height="114" fill="none" stroke="#F4F0E4" stroke-width="1.8"/>
      <rect x="184" y="28" width="24" height="128" fill="none" stroke="#F4F0E4" stroke-width="1.8"/>
      <rect x="226" y="22" width="28" height="134" fill="none" stroke="#F4F0E4" stroke-width="1.8"/>
      <rect x="272" y="32" width="24" height="124" fill="none" stroke="#F4F0E4" stroke-width="1.8"/>
      <rect x="312" y="48" width="22" height="108" fill="none" stroke="#F4F0E4" stroke-width="1.8"/>
      <ellipse cx="240" cy="196" rx="92" ry="24" fill="none" stroke="#F4F0E4" stroke-width="2.1"/>
    `,
    chambers: buildDisjointChambers(
      [[-4, -3], [0, -5], [0, -5], [4, -3], [-4, 5], [0, 5], [0, 5], [4, 5]],
      [M_BELLOWS, M_PISTON, M_VALVE, M_BELLOWS, M_GEAR, M_COIL, M_ESCAPEMENT, M_GAUGE],
    ),
  },

  FINANCE: {
    category: 'FINANCE',
    architecturalTitle: 'Diebold Circular Bank Vault Planetary Lock & Edison Ticker',
    structuralDraftingSvg: `
      <circle cx="240" cy="132" r="108" fill="none" stroke="#F4F0E4" stroke-width="2.6"/>
      <circle cx="240" cy="132" r="84" fill="none" stroke="#F4F0E4" stroke-width="1.9"/>
      <circle cx="240" cy="132" r="34" fill="none" stroke="#F4F0E4" stroke-width="2.2"/>
      <path d="M240,24 L240,98 M240,166 L240,240 M132,132 L206,132 M274,132 L348,132 M164,56 L216,108 M264,156 L316,208 M316,56 L264,108 M216,156 L164,208" stroke="#F4F0E4" stroke-width="2.1"/>
      <rect x="52" y="48" width="66" height="168" rx="6" fill="none" stroke="#F4F0E4" stroke-width="2"/>
    `,
    chambers: buildDisjointChambers(
      [[-5, -4], [-2, -6], [2, -6], [5, -4], [-5, 4], [-2, 6], [2, 6], [5, 4]],
      [M_PISTON, M_GEAR, M_ESCAPEMENT, M_GAUGE, M_PISTON, M_GEAR, M_VALVE, M_CHAMBER_ARCH],
    ),
  },

  PRICING: {
    category: 'PRICING',
    architecturalTitle: 'Toledo Fan-Chart Computing Pendulum Scale & Oil Dashpot',
    structuralDraftingSvg: `
      <path d="M118,108 A138,138 0 0,1 362,108 L240,192 Z" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <line x1="240" y1="192" x2="240" y2="34" stroke="#F4F0E4" stroke-width="2"/>
      <line x1="240" y1="192" x2="168" y2="54" stroke="#F4F0E4" stroke-width="1.3" stroke-dasharray="4 3"/>
      <line x1="240" y1="192" x2="312" y2="54" stroke="#F4F0E4" stroke-width="1.3" stroke-dasharray="4 3"/>
      <rect x="134" y="212" width="212" height="24" rx="5" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <line x1="62" y1="168" x2="418" y2="168" stroke="#F4F0E4" stroke-width="1.6"/>
    `,
    chambers: buildDisjointChambers(
      [[-4, -4], [0, -6], [0, -6], [4, -4], [-4, 5], [0, 6], [0, 6], [4, 5]],
      [M_GAUGE, M_GAUGE, M_PENDULUM, M_PISTON, M_PENDULUM, M_GEAR, M_PISTON, M_VALVE],
    ),
  },

  ODDS: {
    category: 'ODDS',
    architecturalTitle: 'Monte Carlo Roulette Rotor Spindle & Galton Quincunx',
    structuralDraftingSvg: `
      <ellipse cx="176" cy="136" rx="112" ry="74" fill="none" stroke="#F4F0E4" stroke-width="2.4"/>
      <ellipse cx="176" cy="136" rx="74" ry="48" fill="none" stroke="#F4F0E4" stroke-width="1.8"/>
      <line x1="176" y1="48" x2="176" y2="224" stroke="#F4F0E4" stroke-width="2.2"/>
      <line x1="132" y1="92" x2="220" y2="92" stroke="#F4F0E4" stroke-width="2.2"/>
      <polygon points="368,34 446,222 290,222" fill="none" stroke="#F4F0E4" stroke-width="2.2"/>
      <path d="M322,222 L322,188 M352,222 L352,188 M384,222 L384,188 M414,222 L414,188" stroke="#F4F0E4" stroke-width="1.7"/>
    `,
    chambers: buildDisjointChambers(
      [[-5, -4], [-2, -5], [2, -5], [5, -4], [-5, 4], [-2, 5], [2, 5], [5, 4]],
      [M_GEAR, M_PENDULUM, M_PRISM, M_PRISM, M_ESCAPEMENT, M_GAUGE, M_CHAMBER_ARCH, M_CHAMBER_ARCH],
    ),
  },

  ATLAS: {
    category: 'ATLAS',
    architecturalTitle: '18th-Century Brass Marine Sextant & Armillary Astrolabe',
    structuralDraftingSvg: `
      <path d="M108,214 A178,178 0 0,0 372,214 L240,34 Z" fill="none" stroke="#F4F0E4" stroke-width="2.4"/>
      <path d="M126,198 A154,154 0 0,0 354,198" fill="none" stroke="#F4F0E4" stroke-width="1.7" stroke-dasharray="4 3"/>
      <line x1="240" y1="34" x2="294" y2="228" stroke="#F4F0E4" stroke-width="2.4"/>
      <rect x="74" y="114" width="138" height="24" rx="4" fill="none" stroke="#F4F0E4" stroke-width="2.1"/>
      <circle cx="240" cy="132" r="56" fill="none" stroke="#F4F0E4" stroke-width="1.5"/>
    `,
    chambers: buildDisjointChambers(
      [[-5, -4], [-2, -6], [2, -6], [5, -4], [-5, 5], [-2, 5], [2, 5], [5, 5]],
      [M_LENS, M_PRISM, M_PRISM, M_LENS, M_GAUGE, M_GEAR, M_ESCAPEMENT, M_GAUGE],
    ),
  },

  SPORTS: {
    category: 'SPORTS',
    architecturalTitle: 'Swiss Rattrapante Split-Seconds Stadium Chronograph Movement',
    structuralDraftingSvg: `
      <circle cx="240" cy="138" r="106" fill="none" stroke="#F4F0E4" stroke-width="2.5"/>
      <circle cx="240" cy="138" r="92" fill="none" stroke="#F4F0E4" stroke-width="1.4" stroke-dasharray="3 3"/>
      <circle cx="192" cy="138" r="32" fill="none" stroke="#F4F0E4" stroke-width="1.9"/>
      <circle cx="288" cy="138" r="32" fill="none" stroke="#F4F0E4" stroke-width="1.9"/>
      <rect x="224" y="12" width="32" height="20" rx="4" fill="none" stroke="#F4F0E4" stroke-width="2.2"/>
      <line x1="154" y1="42" x2="176" y2="64" stroke="#F4F0E4" stroke-width="3"/>
      <line x1="326" y1="42" x2="304" y2="64" stroke="#F4F0E4" stroke-width="3"/>
    `,
    chambers: buildDisjointChambers(
      [[-5, -4], [-2, -6], [2, -6], [5, -4], [-5, 4], [-2, 6], [2, 6], [5, 4]],
      [M_PISTON, M_GEAR, M_ESCAPEMENT, M_PISTON, M_COIL, M_GEAR, M_PENDULUM, M_GAUGE],
    ),
  },

  DYNASTIES: {
    category: 'DYNASTIES',
    architecturalTitle: 'Concentric Medieval Keep, Portcullis Winch & Bascule Pit',
    structuralDraftingSvg: `
      <path d="M68,236 L68,54 L92,54 L92,72 L116,72 L116,54 L142,54 L142,236" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <path d="M338,236 L338,54 L364,54 L364,72 L388,72 L388,54 L412,54 L412,236" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <path d="M142,92 L338,92 M186,236 L186,144 A54,54 0 0,1 294,144 L294,236" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <path d="M206,126 L206,236 M228,120 L228,236 M252,120 L252,236 M274,126 L274,236" stroke="#F4F0E4" stroke-width="1.4"/>
      <line x1="44" y1="236" x2="436" y2="236" stroke="#F4F0E4" stroke-width="2.5"/>
    `,
    chambers: buildDisjointChambers(
      [[-4, -4], [0, -5], [0, -5], [4, -4], [-4, 4], [0, 5], [0, 5], [4, 4]],
      [M_CHAMBER_ARCH, M_GEAR, M_VALVE, M_CHAMBER_ARCH, M_COIL, M_CHAMBER_ARCH, M_PENDULUM, M_PISTON],
    ),
  },

  HEADLINES: {
    category: 'HEADLINES',
    architecturalTitle: 'Hoe Web-Fed Rotary Newspaper Stereotype Cylinder & Folder',
    structuralDraftingSvg: `
      <circle cx="116" cy="176" r="46" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <circle cx="228" cy="96" r="42" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <circle cx="228" cy="182" r="42" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <polygon points="326,64 424,64 375,168" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <path d="M116,130 L204,58 L326,64 M258,132 L375,168 L424,218" fill="none" stroke="#F4F0E4" stroke-width="1.8" stroke-dasharray="5 3"/>
    `,
    chambers: buildDisjointChambers(
      [[-5, -4], [-2, -5], [2, -5], [5, -4], [-5, 4], [-2, 5], [2, 5], [5, 4]],
      [M_COIL, M_GEAR, M_GEAR, M_PRISM, M_GEAR, M_PISTON, M_ESCAPEMENT, M_BELLOWS],
    ),
  },

  FOLKLORE: {
    category: 'FOLKLORE',
    architecturalTitle: 'Astronomical Automaton Clock Tower & Bellows Carillon',
    structuralDraftingSvg: `
      <polygon points="240,16 356,74 356,238 124,238 124,74" fill="none" stroke="#F4F0E4" stroke-width="2.4"/>
      <circle cx="240" cy="118" r="54" fill="none" stroke="#F4F0E4" stroke-width="2.1"/>
      <circle cx="256" cy="118" r="34" fill="none" stroke="#F4F0E4" stroke-width="1.6"/>
      <line x1="204" y1="172" x2="204" y2="238" stroke="#F4F0E4" stroke-width="1.8" stroke-dasharray="4 2"/>
      <line x1="276" y1="172" x2="276" y2="238" stroke="#F4F0E4" stroke-width="1.8" stroke-dasharray="4 2"/>
    `,
    chambers: buildDisjointChambers(
      [[-4, -3], [0, -5], [0, -5], [4, -3], [-4, 5], [0, 5], [0, 5], [4, 5]],
      [M_BELLOWS, M_ESCAPEMENT, M_GEAR, M_BELLOWS, M_PENDULUM, M_CHAMBER_ARCH, M_PENDULUM, M_GAUGE],
    ),
  },

  FALLACIES: {
    category: 'FALLACIES',
    architecturalTitle: 'Babbage Analytical Difference Mill & Syllogistic Venn Cams',
    structuralDraftingSvg: `
      <rect x="86" y="34" width="308" height="196" rx="8" fill="none" stroke="#F4F0E4" stroke-width="2.4"/>
      <line x1="162" y1="34" x2="162" y2="230" stroke="#F4F0E4" stroke-width="2"/>
      <line x1="240" y1="34" x2="240" y2="230" stroke="#F4F0E4" stroke-width="2"/>
      <line x1="318" y1="34" x2="318" y2="230" stroke="#F4F0E4" stroke-width="2"/>
      <circle cx="218" cy="132" r="46" fill="none" stroke="#F4F0E4" stroke-width="1.7"/>
      <circle cx="262" cy="132" r="46" fill="none" stroke="#F4F0E4" stroke-width="1.7"/>
    `,
    chambers: buildDisjointChambers(
      [[-5, -4], [-2, -5], [2, -5], [5, -4], [-5, 4], [-2, 5], [2, 5], [5, 4]],
      [M_GEAR, M_LENS, M_LENS, M_ESCAPEMENT, M_PISTON, M_GEAR, M_PRISM, M_VALVE],
    ),
  },

  CUISINE: {
    category: 'CUISINE',
    architecturalTitle: '1948 Milanese Spring-Lever Espresso Piston Grouphead & Boiler',
    structuralDraftingSvg: `
      <rect x="108" y="38" width="128" height="184" rx="28" fill="none" stroke="#F4F0E4" stroke-width="2.4"/>
      <rect x="268" y="52" width="84" height="122" rx="8" fill="none" stroke="#F4F0E4" stroke-width="2.3"/>
      <path d="M292,64 L328,76 L292,88 L328,100 L292,112 L328,124" fill="none" stroke="#F4F0E4" stroke-width="2"/>
      <line x1="310" y1="52" x2="418" y2="22" stroke="#F4F0E4" stroke-width="2.8"/>
      <path d="M276,174 L344,174 L334,206 L286,206 Z" fill="none" stroke="#F4F0E4" stroke-width="2.2"/>
      <line x1="342" y1="188" x2="428" y2="196" stroke="#F4F0E4" stroke-width="2.6"/>
    `,
    chambers: buildDisjointChambers(
      [[-5, -4], [-2, -5], [2, -5], [5, -4], [-5, 4], [-2, 5], [2, 5], [5, 4]],
      [M_GAUGE, M_RETORT, M_COIL, M_PISTON, M_VALVE, M_BELLOWS, M_CHAMBER_ARCH, M_VALVE],
    ),
  },
};

/**
 * Renders an authentic high-contrast (13.4:1) Prussian-Blue (#0A192F) & Bone-White
 * (#F4F0E4) architectural cutaway plate with 8 disjoint, generous #F2C94C gilt-brass
 * interactive chambers (`data-zone-idx="0..7"`).
 *
 * STRICT INVARIANT: Contains ZERO `<text>` elements inside the SVG so spoiler text
 * can never leak inside any blueprint!
 */
export function renderCyanotypePlateSVG(
  category: CategoryIdV7,
  opts: CyanotypeRenderOptionsV7 = {},
): string {
  const spec = CYANOTYPE_PLATE_SPECS_V7[category] ?? CYANOTYPE_PLATE_SPECS_V7.ENGINES;
  const activeIdx = opts.activeZoneIdx ?? null;
  const revealedIdx = opts.revealedTargetIdx ?? null;
  const hintIdx = opts.patentClerkHintIdx ?? null;
  const pruneIdx = opts.pruneZoneIdx ?? null;
  const canaryIdx = opts.canaryZoneIdx ?? null;
  const uvIdx = opts.uvLoupeActive ? (opts.poisonedZoneIdx ?? null) : null;
  const cls = opts.className ? ` ${opts.className}` : '';

  // Subtle 1966 broadcast monitor scan/reticle grid lines (pure geometry, zero text)
  const gridLines: string[] = [];
  for (let x = 24; x < 480; x += 24) {
    gridLines.push(`<line x1="${x}" y1="8" x2="${x}" y2="256" stroke="#183B6B" stroke-width="0.75"/>`);
  }
  for (let y = 24; y < 264; y += 24) {
    gridLines.push(`<line x1="8" y1="${y}" x2="472" y2="${y}" stroke="#183B6B" stroke-width="0.75"/>`);
  }

  const chambersSvg = spec.chambers
    .map((c) => {
      const x0 = c.cx - c.w * 0.5;
      const y0 = c.cy - c.h * 0.5;
      const isFlash = activeIdx === c.idx;
      const isRevealed = revealedIdx === c.idx;
      const isHint = hintIdx === c.idx;
      const isPruned = pruneIdx === c.idx;
      const isCanary = canaryIdx === c.idx;
      const isPoison = uvIdx === c.idx;

      const strokeHex = isFlash
        ? CYANOTYPE_PALETTE_V7.specularIris
        : isPruned
          ? CYANOTYPE_PALETTE_V7.vermilionVoid
          : CYANOTYPE_PALETTE_V7.giltBrass;
      const fillHex = isFlash
        ? '#FFFDF5'
        : isRevealed
          ? '#16A34A'
          : CYANOTYPE_PALETTE_V7.prussianChamberFill;
      const fillOpacity = isFlash ? '0.95' : '0.88';
      const strokeWidth = isFlash || isRevealed ? '3.4' : '2.4';

      // Rounded 1966 backlit Acrylite monitor zone path (width c.w = 88, height c.h = 80)
      const ch = 10;
      const chamferPath = [
        `M${x0 + ch},${y0}`,
        `L${x0 + c.w - ch},${y0}`,
        `L${x0 + c.w},${y0 + ch}`,
        `L${x0 + c.w},${y0 + c.h - ch}`,
        `L${x0 + c.w - ch},${y0 + c.h}`,
        `L${x0 + ch},${y0 + c.h}`,
        `L${x0},${y0 + c.h - ch}`,
        `L${x0},${y0 + ch}`,
        'Z',
      ].join(' ');

      // Non-text overlays (pure graphic marks: cross-out slash, canary check, UV halo, starburst flash)
      const extraSvg: string[] = [];
      if (isHint) {
        extraSvg.push(
          `<rect x="${x0 - 3}" y="${y0 - 3}" width="${c.w + 6}" height="${c.h + 6}" rx="10" fill="none" stroke="#00E5FF" stroke-width="2" stroke-dasharray="6 3"/>`,
        );
      }
      if (isPruned) {
        extraSvg.push(
          `<path d="M${x0 + 10},${y0 + 10} L${x0 + c.w - 10},${y0 + c.h - 10} M${x0 + c.w - 10},${y0 + 10} L${x0 + 10},${y0 + c.h - 10}" stroke="#E03E36" stroke-width="3.4" stroke-linecap="round"/>`,
        );
      }
      if (isCanary) {
        extraSvg.push(
          `<path d="M${x0 + c.w - 26},${y0 + 14} L${x0 + c.w - 18},${y0 + 22} L${x0 + c.w - 8},${y0 + 8}" fill="none" stroke="#00E5FF" stroke-width="3.2" stroke-linecap="round"/>`,
        );
      }
      if (isPoison) {
        extraSvg.push(
          `<circle cx="${x0 + 16}" cy="${y0 + 16}" r="8" fill="#9D5CFF" fill-opacity="0.65" stroke="#E8D4FF" stroke-width="1.6"/>`,
        );
      }
      if (isFlash) {
        extraSvg.push(`
          <g transform="translate(${c.cx},${c.cy})">
            <circle cx="0" cy="0" r="34" fill="#FFD166" fill-opacity="0.55" stroke="#FFFDF5" stroke-width="2.6"/>
            <path d="M0,-40 L4,-12 L32,-28 L12,-4 L40,0 L12,4 L32,28 L4,12 L0,40 L-4,12 L-32,28 L-12,4 L-40,0 L-12,-4 L-32,-28 L-4,-12 Z" fill="#FFFDF5"/>
          </g>
        `);
      }

      return `
        <g class="ws7-cyano-chamber${isFlash ? ' is-iris-flash' : ''}" data-zone-idx="${c.idx}" data-cx="${c.cx}" data-cy="${c.cy}" data-x0="${x0}" data-y0="${y0}" role="button" tabindex="0" style="cursor:pointer;">
          <path d="${chamferPath}" fill="${fillHex}" fill-opacity="${fillOpacity}" stroke="${strokeHex}" stroke-width="${strokeWidth}"/>
          <circle cx="${x0 + 9}" cy="${y0 + 9}" r="2.2" fill="#00D2E6"/>
          <circle cx="${x0 + c.w - 9}" cy="${y0 + 9}" r="2.2" fill="#00D2E6"/>
          <circle cx="${x0 + 9}" cy="${y0 + c.h - 9}" r="2.2" fill="#00D2E6"/>
          <circle cx="${x0 + c.w - 9}" cy="${y0 + c.h - 9}" r="2.2" fill="#00D2E6"/>
          <g transform="translate(${c.cx},${c.cy})">
            ${c.motifSvg}
          </g>
          ${extraSvg.join('')}
        </g>
      `;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" class="ws7-cyanotype-svg${cls}" data-plate-category="${spec.category}" viewBox="0 0 480 264" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;max-height:100%;display:block;touch-action:manipulation;user-select:none;">
    <defs>
      <linearGradient id="ws7TvMonitorScreen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#163E70"/>
        <stop offset="52%" stop-color="#0E284C"/>
        <stop offset="100%" stop-color="#091930"/>
      </linearGradient>
      <linearGradient id="ws7TvGlassSheen" x1="0%" y1="0%" x2="35%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.11"/>
        <stop offset="42%" stop-color="#FFFFFF" stop-opacity="0.02"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="480" height="264" rx="14" fill="url(#ws7TvMonitorScreen)"/>
    <g opacity="0.72">${gridLines.join('')}</g>
    <g class="ws7-cyano-drafting" pointer-events="none">
      ${spec.structuralDraftingSvg}
    </g>
    <g class="ws7-cyano-chambers">
      ${chambersSvg}
    </g>
    <path d="M6,16 Q240,6 474,16 L474,98 Q240,72 6,108 Z" fill="url(#ws7TvGlassSheen)" pointer-events="none"/>
  </svg>`;
}
