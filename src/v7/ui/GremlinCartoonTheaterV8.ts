/// <reference types="vite/client" />
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 — SWEEPS WEEK DELUXE)
// `src/v7/ui/GremlinCartoonTheaterV8.ts`
//
// Sleek 1966 Hanna-Barbera / UPA "In Living Color" Studio Gremlin Slapstick
// Broadcast Monitor Proscenium & Spring-Loaded Podium Gremlin Standee:
//   - All 8 genuine hand-painted 16:9 cel-gouache Studio Gremlin illustrations
//     (`./assets/v7/gremlins/skit_<slug>.jpg`) with 3-beat Ken-Burns + slapstick
//     camera jolt choreography, warm CRT glass sheen, and golden coin/confetti
//     bezel burst!
//   - Sculpted sunlit American Walnut (`#6E3B23` -> `#4A2513`), Brushed Spun-Brass
//     & Champagne-Aluminum (`#E6DEC8`) RCA "Living Color" TV cabinet with chasing
//     `#11` 2700K tungsten marquee crown, rotary brass VHF/UHF turret knobs, and
//     Warm Broadcast Cream (`#FAF2DF`, `#141B29` ink) split-flap scoreboard apron!
//   - Die-cut gold-and-cream Spring-Loaded Podium Gremlin Standee medallion
//     (`./assets/v7/gremlins/gremlin_podium_badge.jpg`, `transform-origin: bottom center`
//     elastic `*BOING!*` + brushed-brass `GREMLIN HIT #N` ribbon).
// ============================================================================

import {
  ALL_GREMLIN_SKIT_IDS_V8,
  type GremlinSkitIdV8,
  type GremlinSkitPlayInputV8,
  type StudioVoiceCueIdV8,
} from '../contracts_v7';

export const GREMLIN_PODIUM_BADGE_ASSET_V8 =
  './assets/v7/gremlins/gremlin_podium_badge.jpg' as const;

export const GREMLIN_SKIT_ARTWORK_PATHS_V8 = {
  REEL_MOWER: './assets/v7/gremlins/skit_reel_mower.jpg',
  CANISTER_VAC: './assets/v7/gremlins/skit_canister_vac.jpg',
  JACKHAMMER_SANDBAG: './assets/v7/gremlins/skit_jackhammer_sandbag.jpg',
  TNT_PLUNGER: './assets/v7/gremlins/skit_tnt_plunger.jpg',
  CABLE_SHEARS: './assets/v7/gremlins/skit_cable_shears.jpg',
  WATUSI_BROOM: './assets/v7/gremlins/skit_watusi_broom.jpg',
  CATWALK_MAGNET: './assets/v7/gremlins/skit_catwalk_magnet.jpg',
  TIN_UFO: './assets/v7/gremlins/skit_tin_ufo.jpg',
} as const satisfies Readonly<Record<GremlinSkitIdV8, string>>;

export interface GremlinSkitSpecV8 {
  readonly id: GremlinSkitIdV8;
  readonly reelCode: string;
  readonly kicker: string;
  readonly headline: string;
  readonly gagSummary: string;
  readonly captionBeat1: string;
  readonly captionBeat2: string;
  readonly captionBeat3: string;
  readonly voiceCueId: StudioVoiceCueIdV8;
  readonly stageAccentHex: string;
  readonly artworkSrc: string;
}

export const GREMLIN_SKIT_SPECS_V8: Readonly<Record<GremlinSkitIdV8, GremlinSkitSpecV8>> = {
  REEL_MOWER: {
    id: 'REEL_MOWER',
    reelCode: 'S01 · REEL 01',
    kicker: 'STAGE 6A GROUNDSKEEPING GAG',
    headline: 'LAWN CARE AT EIGHT SHARP!',
    gagSummary: 'Green-visor Gremlin mulches your live bankroll with a chattering 1966 reel mower!',
    captionBeat1: 'Green eyeshade on—the Studio Gremlin revs a chattering 1966 reel mower across Stage 6A!',
    captionBeat2: 'WHIRRR-CHOP! Spinning steel blades mulch your live cash into flying greenback confetti!',
    captionBeat3: 'Freshly trimmed winnings! Never leave loose dollars on the soundstage floor!',
    voiceCueId: 'VO_GREMLIN_REEL_MOWER',
    stageAccentHex: '#1F9D55',
    artworkSrc: GREMLIN_SKIT_ARTWORK_PATHS_V8.REEL_MOWER,
  },
  CANISTER_VAC: {
    id: 'CANISTER_VAC',
    reelCode: 'S01 · REEL 02',
    kicker: 'JANITORIAL SUCTION HAZARD',
    headline: 'TURBO CANISTER CLEAN-SWEEP!',
    gagSummary: 'A turbo-charged 1966 turquoise canister vac whirls your cash into a suction tornado!',
    captionBeat1: 'Between Cameras 1 & 2, the Gremlin cranks a turquoise 1966 canister vac to MAX!',
    captionBeat2: 'SHHHWOOOP! A cyclone suction vortex slurps bills and gold coins down the hose!',
    captionBeat3: 'POOF! The overstuffed chrome canister pops its seam in a cloud of studio dust!',
    voiceCueId: 'VO_GREMLIN_CANISTER_VAC',
    stageAccentHex: '#008B94',
    artworkSrc: GREMLIN_SKIT_ARTWORK_PATHS_V8.CANISTER_VAC,
  },
  JACKHAMMER_SANDBAG: {
    id: 'JACKHAMMER_SANDBAG',
    reelCode: 'S01 · REEL 03',
    kicker: 'SOUNDSTAGE CONSTRUCTION ZONE',
    headline: 'JACKHAMMER & STAGE 6A SANDBAG!',
    gagSummary: 'Hardhat Gremlin jackhammers your golden plinth—right under a falling stage sandbag!',
    captionBeat1: 'Yellow hardhat crooked, the Gremlin plants a pneumatic jackhammer on your prize plinth!',
    captionBeat2: 'RAT-A-TAT-TAT! Studio floorboards rattle as he pounds crisp broadcast dollars to rubble!',
    captionBeat3: 'INSTANT KARMA! A knotted Stage 6A counterweight sandbag plummets from the grid!',
    voiceCueId: 'VO_GREMLIN_JACKHAMMER',
    stageAccentHex: '#D9880F',
    artworkSrc: GREMLIN_SKIT_ARTWORK_PATHS_V8.JACKHAMMER_SANDBAG,
  },
  TNT_PLUNGER: {
    id: 'TNT_PLUNGER',
    reelCode: 'S01 · REEL 04',
    kicker: 'SPECIAL EFFECTS PYROTECHNICS',
    headline: 'PROP DEPT. PLUNGER KABOOM!',
    gagSummary: 'A wooden FX plunger box blasts coins sky-high and leaves two bent smoking antennas!',
    captionBeat1: 'Trailing blasting cord across the deck, the Gremlin grins over a wooden FX plunger box!',
    captionBeat2: 'KA-BLAM! The brass T-handle slams down—blasting coins and greenbacks sky-high!',
    captionBeat3: 'Soot-smudged grin and bent smoking antennas—courtesy of Special Effects 6A!',
    voiceCueId: 'VO_GREMLIN_TNT_PLUNGER',
    stageAccentHex: '#FF6B35',
    artworkSrc: GREMLIN_SKIT_ARTWORK_PATHS_V8.TNT_PLUNGER,
  },
  CABLE_SHEARS: {
    id: 'CABLE_SHEARS',
    reelCode: 'S01 · REEL 05',
    kicker: 'CAMERA 1 TRUNK SABOTAGE',
    headline: 'CAM\u00A01 CABLE SHEARS SHORT-OUT!',
    gagSummary: 'Peeking from crimson velvet drapes, insulated shears snip the live studio camera trunk!',
    captionBeat1: 'Peeking through the crimson velvet drape with giant red-handled studio cable shears!',
    captionBeat2: 'SNIP-BZZZT! Cutting the live camera trunk unleashes a shower of electric sparks!',
    captionBeat3: 'Twin rabbit-ear antennas arcing wildly while your live bankroll shorts out!',
    voiceCueId: 'VO_GREMLIN_CABLE_SHEARS',
    stageAccentHex: '#1746A2',
    artworkSrc: GREMLIN_SKIT_ARTWORK_PATHS_V8.CABLE_SHEARS,
  },
  WATUSI_BROOM: {
    id: 'WATUSI_BROOM',
    reelCode: 'S01 · REEL 06',
    kicker: 'CARNABY GO-GO CLEAN SWEEP',
    headline: 'MOD SHADES WATUSI SWEEP!',
    gagSummary: 'Carnaby sunglasses on, the Gremlin dances the Watusi while sweeping cash into his pan!',
    captionBeat1: 'White-rimmed mod shades on—the Gremlin hits the Watusi under the go-go lights!',
    captionBeat2: 'SWISH-GROOVE! Sweeping crisp greenbacks and gold coins straight into his brass dustpan!',
    captionBeat3: 'One smooth prime-time shuffle and your cash dances right out the stage door!',
    voiceCueId: 'VO_GREMLIN_WATUSI_BROOM',
    stageAccentHex: '#E6397A',
    artworkSrc: GREMLIN_SKIT_ARTWORK_PATHS_V8.WATUSI_BROOM,
  },
  CATWALK_MAGNET: {
    id: 'CATWALK_MAGNET',
    reelCode: 'S01 · REEL 07',
    kicker: 'FRESNEL RIGGING AERIAL HEIST',
    headline: 'STICKY FINGERS FROM GRID B!',
    gagSummary: 'Dangling upside-down from the spotlight truss with a giant red horseshoe magnet!',
    captionBeat1: 'Dangling upside-down by his ankles from the spotlight grid with a giant U-magnet!',
    captionBeat2: 'THRRUM-CLANK! Turquoise magnetic arcs yank coins and gold plaques off the podium!',
    captionBeat3: 'Hoisting back into the studio rafters with your winnings stuck fast to the poles!',
    voiceCueId: 'VO_GREMLIN_CATWALK_MAGNET',
    stageAccentHex: '#D93829',
    artworkSrc: GREMLIN_SKIT_ARTWORK_PATHS_V8.CATWALK_MAGNET,
  },
  TIN_UFO: {
    id: 'TIN_UFO',
    reelCode: 'S01 · REEL 08',
    kicker: 'PROP DEPT. SCI-FI SPECIAL',
    headline: 'TIN SAUCER TRACTOR-BEAM HEIST!',
    gagSummary: 'A 1966 tin flying saucer on a visible prop wire beams your bankroll into orbit!',
    captionBeat1: 'Wobbling in on a visible studio wire inside a riveted 1966 tin-toy flying saucer!',
    captionBeat2: 'WOO-OOO-WOO! A glowing turquoise tractor beam levitates bills and coins off the deck!',
    captionBeat3: 'Paws up under the bubble dome—your bankroll just entered soundstage orbit!',
    voiceCueId: 'VO_GREMLIN_TIN_UFO',
    stageAccentHex: '#008B94',
    artworkSrc: GREMLIN_SKIT_ARTWORK_PATHS_V8.TIN_UFO,
  },
};

export interface PodiumGremlinStandeeOptionsV8 {
  readonly compact?: boolean;
  readonly justAdded?: boolean;
  readonly hitNumber?: number;
  readonly ribbonLabel?: string;
}

export interface MountPodiumGremlinStandeeOptionsV8 {
  readonly hitNumber?: number;
  readonly count?: number;
  readonly compact?: boolean;
  readonly animateBoing?: boolean;
  readonly reducedMotion?: boolean;
  readonly ribbonText?: string;
  readonly onPlayBoing?: () => void;
}

export interface PodiumGremlinStandeeHandleV8 {
  readonly element: HTMLElement;
  triggerBoing(): void;
  updateCount(newCount: number, animateBoing?: boolean): void;
  dispose(): void;
}

const STYLE_ELEMENT_ID_V8 = 'ws8-sleek-gremlin-theater-css';
const preloadedUrls = new Set<string>();
const activeContainerCleanups = new WeakMap<HTMLElement, () => void>();
let rollingUnseededSkitBag: GremlinSkitIdV8[] = [];

export function resolveGremlinSkitArtworkV8(skitId: GremlinSkitIdV8): string {
  return GREMLIN_SKIT_ARTWORK_PATHS_V8[skitId] ?? GREMLIN_SKIT_ARTWORK_PATHS_V8.REEL_MOWER;
}

export function preloadGremlinTheaterArtV8(
  skitIds: readonly GremlinSkitIdV8[] = ALL_GREMLIN_SKIT_IDS_V8,
): void {
  if (typeof Image === 'undefined') return;
  const targets = [
    GREMLIN_PODIUM_BADGE_ASSET_V8,
    ...skitIds.map((id) => resolveGremlinSkitArtworkV8(id)),
  ];
  for (const src of targets) {
    if (preloadedUrls.has(src)) continue;
    preloadedUrls.add(src);
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  }
}

function chooseGremlinSkitId(input: GremlinSkitPlayInputV8): GremlinSkitIdV8 {
  if (input.skitId && ALL_GREMLIN_SKIT_IDS_V8.includes(input.skitId)) {
    return input.skitId;
  }
  if (typeof input.seed === 'number' && Number.isFinite(input.seed)) {
    const idx =
      (((Math.floor(input.seed) >>> 0) * 2654435761) >>> 0) % ALL_GREMLIN_SKIT_IDS_V8.length;
    return ALL_GREMLIN_SKIT_IDS_V8[idx] ?? 'REEL_MOWER';
  }
  if (rollingUnseededSkitBag.length === 0) {
    rollingUnseededSkitBag = [...ALL_GREMLIN_SKIT_IDS_V8];
    for (let i = rollingUnseededSkitBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = rollingUnseededSkitBag[i];
      rollingUnseededSkitBag[i] = rollingUnseededSkitBag[j];
      rollingUnseededSkitBag[j] = tmp;
    }
  }
  return rollingUnseededSkitBag.pop() ?? 'REEL_MOWER';
}

function escapeHtml(raw: string): string {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clampInt(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, Math.round(val)));
}

function formatLossBadgeCopy(scoreBefore: number, cashLost: number): string {
  if (cashLost <= 0) return '$0 (0%)';
  if (scoreBefore > 0) {
    const pct = Math.max(1, Math.min(100, Math.round((cashLost / scoreBefore) * 100)));
    return `-$${cashLost.toLocaleString()} (-${pct}%)`;
  }
  return `-$${cashLost.toLocaleString()}`;
}

// ============================================================================
// 1. Authoritative Sleek 1966 RCA "Living Color" Walnut, Brass & Cream CSS
// ============================================================================

export function ensureGremlinTheaterStylesV8(doc?: Document): void {
  const targetDoc = doc ?? (typeof document !== 'undefined' ? document : null);
  if (!targetDoc || targetDoc.getElementById(STYLE_ELEMENT_ID_V8)) {
    return;
  }

  const styleEl = targetDoc.createElement('style');
  styleEl.id = STYLE_ELEMENT_ID_V8;
  styleEl.textContent = `
    .ws8gt-overlay,
    .ws8gt-overlay *,
    .ws8gt-standee-rack,
    .ws8gt-standee-rack * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    /* Warm Sunlit 1966 Studio Spotlight Backdrop (Zero Dark-Blue Boxes!) */
    .ws8gt-overlay {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100dvh;
      max-width: 100vw;
      max-height: 100dvh;
      z-index: 9660;
      display: flex;
      align-items: center;
      justify-content: center;
      padding:
        max(8px, calc(env(safe-area-inset-top, 0px) + 6px))
        max(10px, calc(env(safe-area-inset-right, 0px) + 8px))
        max(8px, calc(env(safe-area-inset-bottom, 0px) + 6px))
        max(10px, calc(env(safe-area-inset-left, 0px) + 8px));
      background:
        radial-gradient(
          ellipse 84% 72% at 50% 44%,
          rgba(126, 70, 38, 0.56) 0%,
          rgba(56, 30, 17, 0.82) 60%,
          rgba(28, 15, 9, 0.91) 100%
        );
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      overflow: hidden;
      user-select: none;
      pointer-events: auto;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #141B29;
      --ws8gt-cam-x: 0px;
      --ws8gt-cam-y: 0px;
      --ws8gt-cam-scale: 1.03;
      --ws8gt-cam-rot: 0deg;
      --ws8gt-knob-deg: -24deg;
      animation: ws8gt-fade-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .ws8gt-overlay[data-exiting='true'] {
      animation: ws8gt-fade-out 0.13s ease-in forwards;
    }

    /* Sculpted Sunlit American Walnut (#6E3B23 -> #4A2513) & Spun-Brass Console */
    .ws8gt-cabinet {
      position: relative;
      width: min(760px, 100%);
      max-height: 100%;
      display: flex;
      flex-direction: column;
      gap: clamp(6px, 1.1dvh, 10px);
      padding: clamp(8px, 1.4vw, 14px);
      border-radius: 24px;
      background:
        repeating-linear-gradient(
          94deg,
          rgba(255, 226, 182, 0.035) 0px,
          rgba(255, 226, 182, 0.035) 3px,
          rgba(42, 18, 8, 0.05) 3px,
          rgba(42, 18, 8, 0.05) 9px
        ),
        linear-gradient(168deg, #7B4429 0%, #6E3B23 46%, #4A2513 100%);
      border: 3px solid #F2A922;
      box-shadow:
        inset 0 2px 0 rgba(255, 244, 218, 0.56),
        inset 0 -3px 0 rgba(36, 16, 7, 0.72),
        0 0 0 1.5px #3B1C0D,
        0 20px 48px rgba(24, 11, 5, 0.72);
      overflow: hidden;
      animation: ws8gt-cabinet-pop 0.26s cubic-bezier(0.2, 1.16, 0.34, 1) both;
    }

    /* Top Marquee Crown with Chasing #11 2700K Tungsten Bulbs */
    .ws8gt-crown {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 6px 12px 7px;
      border-radius: 15px;
      background:
        linear-gradient(180deg, #FFF8E6 0%, #F5E6C4 58%, #E8D2A0 100%);
      border: 2px solid #D99216;
      box-shadow:
        inset 0 1.5px 0 #FFFFFF,
        0 3px 0 #3E1E0F;
    }

    .ws8gt-bulb-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 5px;
      padding: 0 2px;
      pointer-events: none;
    }

    .ws8gt-bulb {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: radial-gradient(circle at 38% 35%, #FFFDF5 0%, #FFD166 55%, #F2A922 100%);
      border: 1px solid #8A520B;
      box-shadow:
        0 0 6px rgba(255, 209, 102, 0.95),
        0 0 12px rgba(242, 169, 34, 0.7);
      animation: ws8gt-bulb-chase 0.75s steps(3, end) infinite;
    }

    .ws8gt-bulb:nth-child(3n + 2) { animation-delay: 0.25s; }
    .ws8gt-bulb:nth-child(3n) { animation-delay: 0.5s; }

    .ws8gt-crown-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 6px 10px;
    }

    .ws8gt-crown-left {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
      flex-wrap: wrap;
    }

    .ws8gt-strike-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 999px;
      background: linear-gradient(90deg, #D93829 0%, #FF6B35 100%);
      color: #FFFDF7;
      font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
      font-weight: 900;
      font-size: 13px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      line-height: 1.15;
      box-shadow: 0 2px 0 #5C2210;
    }

    .ws8gt-bolt-svg {
      width: 13px;
      height: 13px;
      flex: 0 0 auto;
      display: block;
    }

    .ws8gt-crown-reel {
      font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #5C301B;
    }

    .ws8gt-victim-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 999px;
      background: #FAF2DF;
      border: 1.5px solid #C98512;
      color: #141B29;
      font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      line-height: 1.15;
    }

    .ws8gt-victim-pill[data-victim-kind='rival'] {
      background: #E5F5F6;
      border-color: #008B94;
      color: #0B4F55;
    }

    .ws8gt-tally-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #D93829;
      box-shadow: 0 0 6px rgba(217, 56, 41, 0.8);
      flex: 0 0 auto;
    }

    .ws8gt-victim-pill[data-victim-kind='rival'] .ws8gt-tally-dot {
      background: #008B94;
      box-shadow: 0 0 6px rgba(0, 139, 148, 0.7);
    }

    /* Brushed Champagne-Aluminum (#E6DEC8) Inner Bezel + Side VHF Control Strip */
    .ws8gt-bezel-deck {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 74px;
      gap: 8px;
      padding: 8px;
      border-radius: 18px;
      background:
        repeating-linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.22) 0px,
          rgba(255, 255, 255, 0.22) 1px,
          rgba(186, 173, 144, 0.14) 1px,
          rgba(186, 173, 144, 0.14) 3px
        ),
        linear-gradient(180deg, #F2ECDC 0%, #E6DEC8 52%, #D4C8AC 100%);
      border: 2px solid #C89B3C;
      box-shadow:
        inset 0 2px 0 #FFFDF8,
        inset 0 -2px 0 rgba(92, 48, 27, 0.28),
        0 5px 14px rgba(38, 18, 8, 0.38);
      align-items: stretch;
    }

    /* 16:9 Curved CRT Picture Tube Holding Real Hand-Painted Hanna-Barbera Art */
    .ws8gt-crt-mask {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      max-height: min(370px, calc(100dvh - 248px));
      margin: 0 auto;
      border-radius: 14px;
      overflow: hidden;
      background: #4A2513;
      border: 3px solid #6E3B23;
      box-shadow:
        0 0 0 1.5px #F2A922,
        inset 0 0 24px rgba(34, 16, 7, 0.52);
    }

    .ws8gt-overlay[data-beat='2'][data-reduced-motion='false'] .ws8gt-crt-mask {
      animation: ws8gt-slapstick-jolt 0.34s cubic-bezier(0.22, 0.88, 0.34, 1) 2;
    }

    .ws8gt-stage-wrap {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #5C301B;
    }

    .ws8gt-cel-art {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
      display: block;
      transform-origin: 50% 50%;
      transform:
        translate3d(var(--ws8gt-cam-x, 0px), var(--ws8gt-cam-y, 0px), 0)
        scale(var(--ws8gt-cam-scale, 1.03))
        rotate(var(--ws8gt-cam-rot, 0deg));
      transition: transform 0.14s ease-out, filter 0.18s ease;
      will-change: transform;
    }

    .ws8gt-overlay[data-beat='2'] .ws8gt-cel-art {
      filter: saturate(1.08) contrast(1.04);
    }

    /* Warm CRT Curved Glass Sheen & Subtle Phosphor Aperture Grille */
    .ws8gt-crt-sheen {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        linear-gradient(
          126deg,
          rgba(255, 252, 242, 0.25) 0%,
          rgba(255, 250, 236, 0.07) 24%,
          rgba(255, 250, 236, 0) 45%
        ),
        repeating-linear-gradient(
          180deg,
          rgba(255, 248, 231, 0.03) 0px,
          rgba(255, 248, 231, 0.03) 2px,
          rgba(42, 20, 9, 0.045) 2px,
          rgba(42, 20, 9, 0.045) 4px
        ),
        radial-gradient(
          ellipse 95% 92% at 50% 50%,
          rgba(255, 248, 231, 0) 64%,
          rgba(58, 28, 14, 0.34) 100%
        );
    }

    /* Golden Vector Coin & Festive Confetti Burst Overlay Around Bezel */
    .ws8gt-coin-burst-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0;
      transform: scale(0.92);
      transition: opacity 0.2s ease, transform 0.28s cubic-bezier(0.2, 1.28, 0.36, 1);
    }

    .ws8gt-overlay[data-beat='2'] .ws8gt-coin-burst-svg,
    .ws8gt-overlay[data-beat='3'] .ws8gt-coin-burst-svg {
      opacity: 1;
      transform: scale(1);
    }

    /* Corner Channel 6A Live Glass Bug */
    .ws8gt-crt-corner-tag {
      position: absolute;
      top: 8px;
      left: 10px;
      padding: 3px 9px;
      border-radius: 999px;
      background: rgba(250, 242, 223, 0.92);
      border: 1.5px solid #D99216;
      color: #4A2513;
      font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
      font-weight: 900;
      font-size: 12px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      box-shadow: 0 2px 6px rgba(36, 16, 7, 0.28);
      pointer-events: none;
    }

    /* Side Strip: Rotary Brass VHF / UHF Turret Knobs + Walnut Speaker Louvers */
    .ws8gt-vhf-strip {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: 8px 6px;
      border-radius: 12px;
      background: linear-gradient(180deg, #FAF2DF 0%, #DFD4BA 100%);
      border: 1.5px solid #BBA882;
      box-shadow: inset 0 1px 0 #FFFFFF;
    }

    .ws8gt-knob-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .ws8gt-knob-lbl {
      font-family: 'Jost', sans-serif;
      font-weight: 900;
      font-size: 11px;
      letter-spacing: 0.07em;
      color: #4A2513;
      text-transform: uppercase;
    }

    .ws8gt-rotary-knob {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background:
        conic-gradient(
          from 20deg,
          #FFE599 0deg,
          #D99216 70deg,
          #FFF3CC 145deg,
          #B8730B 225deg,
          #FFE599 310deg,
          #D99216 360deg
        );
      border: 2px solid #5C301B;
      box-shadow:
        inset 0 1.5px 2px rgba(255, 255, 255, 0.8),
        0 3px 5px rgba(42, 20, 9, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ws8gt-rotary-knob--uhf {
      width: 38px;
      height: 38px;
    }

    .ws8gt-knob-bar {
      width: 7px;
      height: 28px;
      border-radius: 4px;
      background: linear-gradient(180deg, #FFFDF7 0%, #FAF2DF 100%);
      border: 1.5px solid #4A2513;
      box-shadow: 0 1px 2px rgba(20, 10, 4, 0.4);
      transform: rotate(var(--ws8gt-knob-deg, -24deg));
      transition: transform 0.22s cubic-bezier(0.22, 1.3, 0.36, 1);
    }

    .ws8gt-rotary-knob--uhf .ws8gt-knob-bar {
      height: 22px;
      transform: rotate(calc(var(--ws8gt-knob-deg, -24deg) * -0.8));
    }

    .ws8gt-speaker-grille {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 4px 5px;
    }

    .ws8gt-louver {
      height: 3px;
      border-radius: 999px;
      background: linear-gradient(90deg, #6E3B23 0%, #4A2513 50%, #6E3B23 100%);
      box-shadow: 0 1px 0 rgba(255, 252, 240, 0.75);
    }

    .ws8gt-color-jewel {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-family: 'Jost', sans-serif;
      font-weight: 900;
      font-size: 10.5px;
      letter-spacing: 0.05em;
      color: #006E75;
      text-transform: uppercase;
    }

    .ws8gt-color-jewel-lamp {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #00A8B5;
      box-shadow: 0 0 6px rgba(0, 168, 181, 0.85);
    }

    /* Warm Broadcast Cream (#FAF2DF) Lower Scoreboard Apron */
    .ws8gt-apron {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas:
        'copy bank'
        'foot foot';
      align-items: center;
      gap: 8px 12px;
      padding: 10px 14px;
      border-radius: 16px;
      background: linear-gradient(180deg, #FFFDF6 0%, #FAF2DF 62%, #EFE1C0 100%);
      color: #141B29;
      border: 2px solid #D99216;
      box-shadow:
        inset 0 2px 0 #FFFFFF,
        0 4px 0 #3E1E0F;
    }

    .ws8gt-copy-block {
      grid-area: copy;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .ws8gt-headline {
      margin: 0;
      font-family: 'Caprasimo', 'Fraunces', Georgia, serif;
      font-weight: 400;
      font-size: clamp(17px, 2.7vw, 23px);
      line-height: 1.08;
      letter-spacing: 0.01em;
      color: #141B29;
    }

    .ws8gt-caption-line {
      margin: 0;
      font-family: 'Plus Jakarta Sans', 'Jost', sans-serif;
      font-weight: 700;
      font-size: clamp(13.5px, 1.9vw, 15px);
      line-height: 1.28;
      color: #141B29;
    }

    /* Crisp Mechanical Split-Flap Bankroll Drop ($1,650 -> -$660 (-40%) -> $990) */
    .ws8gt-flap-strip {
      grid-area: bank;
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      padding: 5px 8px;
      border-radius: 12px;
      background: #F3E5C3;
      border: 1.5px solid #C89228;
      box-shadow: inset 0 1px 2px rgba(74, 37, 19, 0.16);
    }

    .ws8gt-flap-card {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 9px;
      border-radius: 8px;
      background: linear-gradient(180deg, #FFFDF9 0%, #FFF7E4 49%, #F4E6C6 51%, #FAF0D7 100%);
      border: 1.5px solid #6E3B23;
      color: #141B29;
      font-family: 'Michroma', 'Chakra Petch', 'Jost', sans-serif;
      font-weight: 700;
      font-size: clamp(13px, 2vw, 15px);
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
      box-shadow: 0 2px 0 rgba(74, 37, 19, 0.25);
    }

    .ws8gt-flap-card--before {
      color: #5C301B;
      text-decoration: line-through;
      text-decoration-color: rgba(217, 56, 41, 0.75);
      text-decoration-thickness: 2px;
    }

    .ws8gt-flap-card--after {
      background: linear-gradient(180deg, #FFF3C4 0%, #FDE28A 49%, #F6CB52 51%, #FFE79E 100%);
      border-color: #8A520B;
      color: #141B29;
    }

    .ws8gt-overlay[data-beat='2'][data-reduced-motion='false'] .ws8gt-flap-card--after {
      animation: ws8gt-flap-clack 0.18s steps(2, end) infinite;
    }

    .ws8gt-flap-delta {
      display: inline-flex;
      align-items: center;
      padding: 4px 9px;
      border-radius: 999px;
      background: linear-gradient(180deg, #E64233 0%, #C6281C 100%);
      border: 1.5px solid #7A160E;
      color: #FFFDF7;
      font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
      font-weight: 900;
      font-size: 13px;
      letter-spacing: 0.03em;
      line-height: 1.15;
      font-variant-numeric: tabular-nums;
      box-shadow: 0 2px 0 rgba(92, 20, 12, 0.35);
    }

    .ws8gt-flap-arrow {
      font-family: 'Jost', sans-serif;
      font-weight: 900;
      font-size: 14px;
      color: #6E3B23;
    }

    .ws8gt-apron-foot {
      grid-area: foot;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-top: 4px;
      border-top: 1px solid rgba(184, 134, 45, 0.35);
    }

    .ws8gt-podium-slot {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      opacity: 0.52;
      transform: translateY(2px);
      transition: opacity 0.2s ease, transform 0.28s cubic-bezier(0.22, 1.35, 0.36, 1);
    }

    .ws8gt-podium-slot[data-stamped='true'] {
      opacity: 1;
      transform: translateY(0);
    }

    /* Tactile 1966 Spun-Brass & Tangerine SKIP ▶ Pill (>=48x48px Touch Target) */
    .ws8gt-skip-btn {
      appearance: none;
      flex: 0 0 auto;
      min-width: 112px;
      min-height: 48px;
      padding: 0 18px;
      border-radius: 999px;
      border: 2px solid #5C301B;
      background: linear-gradient(180deg, #FFE17D 0%, #F2A922 58%, #D9880F 100%);
      color: #141B29;
      font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
      font-weight: 900;
      font-size: 15px;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      cursor: pointer;
      touch-action: manipulation;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      box-shadow:
        inset 0 2px 0 #FFFDF5,
        0 4px 0 #5C301B,
        0 6px 14px rgba(58, 28, 12, 0.28);
      transition: transform 0.1s ease, filter 0.12s ease;
    }

    .ws8gt-skip-btn:hover {
      filter: brightness(1.05);
      transform: translateY(-1px);
    }

    .ws8gt-skip-btn:active {
      transform: translateY(2px);
      box-shadow:
        inset 0 1px 0 #FFFDF5,
        0 2px 0 #5C301B;
    }

    .ws8gt-skip-btn:focus-visible {
      outline: 3px solid #008B94;
      outline-offset: 2px;
    }

    .ws8gt-skip-tri {
      width: 11px;
      height: 12px;
      display: block;
      flex: 0 0 auto;
    }

    /* ========================================================================
       Spring-Loaded Podium Gremlin Standee (gremlin_podium_badge.jpg)
       Die-Cut Gold-and-Cream Medallion + Coiled Spring + Brass Ribbon!
       ======================================================================== */

    .ws8gt-standee-rack {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 3px 9px 3px 6px;
      border-radius: 999px;
      background: linear-gradient(180deg, #FFFDF7 0%, #FAF2DF 100%);
      border: 1.5px solid #D99216;
      box-shadow:
        inset 0 1px 0 #FFFFFF,
        0 2px 6px rgba(74, 37, 19, 0.22);
      vertical-align: middle;
    }

    .ws8gt-standee-rack--compact {
      gap: 5px;
      padding: 2px 8px 2px 4px;
    }

    .ws8gt-standee-rack--lockout {
      background: linear-gradient(180deg, #FFF5EE 0%, #FDE2D4 100%);
      border-color: #D93829;
      box-shadow:
        0 0 0 1.5px rgba(242, 169, 34, 0.72),
        0 3px 12px rgba(217, 56, 41, 0.35);
    }

    .ws8gt-standee-pins {
      display: inline-flex;
      align-items: flex-end;
      gap: 4px;
    }

    .ws8gt-standee-unit {
      position: relative;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      transform-origin: bottom center;
      flex: 0 0 auto;
    }

    .ws8gt-standee-unit--boing {
      animation: ws8gt-standee-boing 0.72s cubic-bezier(0.22, 1.48, 0.36, 1) both;
    }

    .ws8gt-standee-medallion {
      position: relative;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      overflow: hidden;
      background: #FAF2DF;
      border: 2.5px solid #D99216;
      box-shadow:
        inset 0 0 0 1.5px #FFFDF7,
        0 3px 6px rgba(74, 37, 19, 0.32);
      display: block;
    }

    .ws8gt-standee-rack--compact .ws8gt-standee-medallion {
      width: 30px;
      height: 30px;
      border-width: 2px;
    }

    .ws8gt-standee-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 48%;
      transform: scale(1.12);
      display: block;
    }

    /* Metallic Helical Spring Coil + Brass Podium Clamp Base */
    .ws8gt-standee-spring {
      width: 12px;
      height: 8px;
      background:
        repeating-linear-gradient(
          -18deg,
          #5C301B 0px,
          #E6DEC8 1.5px,
          #FFFDF7 2.5px,
          #8A520B 4px
        );
      border-left: 1px solid #5C301B;
      border-right: 1px solid #5C301B;
    }

    .ws8gt-standee-rack--compact .ws8gt-standee-spring {
      width: 9px;
      height: 5px;
    }

    .ws8gt-standee-foot {
      width: 18px;
      height: 3.5px;
      border-radius: 999px;
      background: linear-gradient(90deg, #C88212 0%, #FFE082 50%, #C88212 100%);
      border: 1px solid #5C301B;
    }

    .ws8gt-standee-rack--compact .ws8gt-standee-foot {
      width: 14px;
      height: 3px;
    }

    /* Crisp Spun-Brass "GREMLIN HIT #1" Ribbon */
    .ws8gt-brass-ribbon {
      display: inline-flex;
      align-items: center;
      padding: 3px 9px;
      border-radius: 999px;
      background: linear-gradient(180deg, #FFE89C 0%, #F2A922 56%, #CE840E 100%);
      border: 1.5px solid #5C301B;
      color: #141B29;
      font-family: 'Jost', 'Plus Jakarta Sans', sans-serif;
      font-weight: 900;
      font-size: 12.5px;
      line-height: 1.15;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
      box-shadow:
        inset 0 1px 0 #FFFDF5,
        0 2px 0 rgba(74, 37, 19, 0.3);
    }

    .ws8gt-standee-rack--compact .ws8gt-brass-ribbon {
      padding: 2px 7px;
      font-size: 11.5px;
    }

    .ws8gt-standee-rack--lockout .ws8gt-brass-ribbon {
      background: linear-gradient(180deg, #FF7A45 0%, #D93829 100%);
      border-color: #5C160E;
      color: #FFFDF7;
      box-shadow: 0 2px 0 rgba(92, 22, 14, 0.4);
    }

    /* ========================================================================
       Mobile Portrait (390x844 & 390x660) — Zero Overflow, Big 16:9 Art
       ======================================================================== */

    @media (max-width: 600px) {
      .ws8gt-cabinet {
        padding: 8px 9px 10px;
        gap: 6px;
        border-radius: 18px;
      }

      .ws8gt-crown {
        padding: 5px 9px 6px;
        gap: 4px;
      }

      .ws8gt-crown-reel {
        display: none;
      }

      .ws8gt-bezel-deck {
        grid-template-columns: minmax(0, 1fr) 48px;
        gap: 6px;
        padding: 6px;
        border-radius: 14px;
      }

      .ws8gt-vhf-strip {
        padding: 5px 3px;
        gap: 4px;
      }

      .ws8gt-rotary-knob {
        width: 32px;
        height: 32px;
      }

      .ws8gt-rotary-knob--uhf {
        width: 28px;
        height: 28px;
      }

      .ws8gt-knob-bar {
        width: 5px;
        height: 20px;
      }

      .ws8gt-rotary-knob--uhf .ws8gt-knob-bar {
        height: 16px;
      }

      .ws8gt-color-jewel span {
        display: none;
      }

      .ws8gt-apron {
        grid-template-columns: 1fr;
        grid-template-areas:
          'copy'
          'bank'
          'foot';
        gap: 6px;
        padding: 8px 10px;
      }

      .ws8gt-flap-strip {
        justify-content: flex-start;
      }

      .ws8gt-skip-btn {
        min-width: 102px;
        padding: 0 14px;
        font-size: 14px;
      }
    }

    /* Ultra-Compact Mobile Landscape (844x390) — 2-Column Console, 0px Overflow */
    @media (max-height: 500px) and (orientation: landscape) {
      .ws8gt-overlay {
        padding:
          max(5px, env(safe-area-inset-top, 0px))
          max(8px, env(safe-area-inset-right, 0px))
          max(5px, env(safe-area-inset-bottom, 0px))
          max(8px, env(safe-area-inset-left, 0px));
      }

      .ws8gt-cabinet {
        width: min(820px, 100%);
        padding: 7px 10px;
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(248px, 0.95fr);
        grid-template-areas:
          'crown crown'
          'bezel apron';
        gap: 6px 10px;
        align-items: stretch;
      }

      .ws8gt-crown {
        grid-area: crown;
        padding: 4px 10px;
        gap: 3px;
      }

      .ws8gt-bulb-strip {
        display: none;
      }

      .ws8gt-bezel-deck {
        grid-area: bezel;
        grid-template-columns: minmax(0, 1fr) 52px;
        padding: 6px;
      }

      .ws8gt-crt-mask {
        max-height: calc(100dvh - 88px);
      }

      .ws8gt-apron {
        grid-area: apron;
        grid-template-columns: 1fr;
        grid-template-areas:
          'copy'
          'bank'
          'foot';
        align-content: space-between;
        padding: 8px 10px;
        gap: 6px;
      }

      .ws8gt-headline {
        font-size: 17px;
      }

      .ws8gt-caption-line {
        font-size: 13px;
        line-height: 1.22;
      }

      .ws8gt-flap-strip {
        justify-content: flex-start;
      }
    }

    /* Reduced Motion Accessibility */
    .ws8gt-overlay[data-reduced-motion='true'],
    .ws8gt-overlay[data-reduced-motion='true'] *,
    .ws8gt-standee-rack[data-reduced-motion='true'] * {
      animation-duration: 0.001s !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001s !important;
    }

    @keyframes ws8gt-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes ws8gt-fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes ws8gt-cabinet-pop {
      from {
        opacity: 0;
        transform: scale(0.94) translateY(8px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes ws8gt-bulb-chase {
      0%, 34% {
        opacity: 1;
        transform: scale(1.06);
      }
      35%, 100% {
        opacity: 0.34;
        transform: scale(0.88);
      }
    }

    @keyframes ws8gt-slapstick-jolt {
      0% { transform: translate(0, 0) rotate(0deg); }
      20% { transform: translate(-4px, 3px) rotate(-0.7deg); }
      45% { transform: translate(4px, -3px) rotate(0.75deg); }
      70% { transform: translate(-2.5px, 2px) rotate(-0.4deg); }
      100% { transform: translate(0, 0) rotate(0deg); }
    }

    @keyframes ws8gt-flap-clack {
      0% { transform: scaleY(1); }
      50% { transform: scaleY(0.92); }
      100% { transform: scaleY(1); }
    }

    @keyframes ws8gt-standee-boing {
      0% { transform: scale(0.5, 0.34) translateY(8px); }
      30% { transform: scale(0.88, 1.32) translateY(-4px) rotate(-8deg); }
      54% { transform: scale(1.14, 0.84) translateY(1px) rotate(6deg); }
      74% { transform: scale(0.95, 1.08) rotate(-3deg); }
      88% { transform: scale(1.03, 0.98) rotate(1.5deg); }
      100% { transform: scale(1, 1) rotate(0deg); }
    }
  `;

  targetDoc.head.appendChild(styleEl);
}

// ============================================================================
// 2. Spring-Loaded Podium Gremlin Standee (`./assets/v7/gremlins/gremlin_podium_badge.jpg`)
// ============================================================================

function renderSingleStandeePinHTML(hitIndex: number, animateBoing: boolean): string {
  const boingCls = animateBoing ? ' ws8gt-standee-unit--boing' : '';
  return `
    <span class="ws8gt-standee-unit${boingCls}"
          data-gremlin-slot="${hitIndex}"
          title="Studio Gremlin Hit #${hitIndex}">
      <span class="ws8gt-standee-medallion">
        <img class="ws8gt-standee-img"
             src="${GREMLIN_PODIUM_BADGE_ASSET_V8}"
             alt="Studio Gremlin Standee #${hitIndex}"
             decoding="async"
             draggable="false" />
      </span>
      <span class="ws8gt-standee-spring" aria-hidden="true"></span>
      <span class="ws8gt-standee-foot" aria-hidden="true"></span>
    </span>
  `;
}

/**
 * Renders `1..4` die-cut gold-and-cream spring-loaded Podium Gremlin medallions
 * using `./assets/v7/gremlins/gremlin_podium_badge.jpg` + a brushed-brass
 * `GREMLIN HIT #N` ribbon (`transform-origin: bottom center` boing animation).
 */
export function renderPodiumGremlinStandeesHTMLV8(
  count: number,
  opts?: PodiumGremlinStandeeOptionsV8,
): string {
  ensureGremlinTheaterStylesV8();
  const clamped = clampInt(count, 0, 4);
  if (clamped <= 0) {
    return '';
  }

  const compact = Boolean(opts?.compact);
  const justAdded = Boolean(opts?.justAdded);
  const hitNumber = clampInt(opts?.hitNumber ?? clamped, 1, 4);
  const isLockout = clamped >= 4;

  const pins: string[] = [];
  for (let i = 0; i < clamped; i += 1) {
    const isNewest = i === clamped - 1;
    pins.push(renderSingleStandeePinHTML(i + 1, justAdded && isNewest));
  }

  const defaultRibbon = isLockout
    ? compact
      ? 'GREMLIN HIT #4 · LOCKOUT!'
      : 'GREMLIN HIT #4 · 4× LOCKOUT!'
    : `GREMLIN HIT #${hitNumber}`;
  const ribbonText = escapeHtml(opts?.ribbonLabel?.trim() || defaultRibbon);

  const rackClasses = [
    'ws8gt-standee-rack',
    compact ? 'ws8gt-standee-rack--compact' : '',
    isLockout ? 'ws8gt-standee-rack--lockout' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <span class="${rackClasses}"
          data-gremlin-count="${clamped}"
          data-lockout="${isLockout}"
          role="status"
          aria-label="${ribbonText}">
      <span class="ws8gt-standee-pins">${pins.join('')}</span>
      <span class="ws8gt-brass-ribbon">${ribbonText}</span>
    </span>
  `.trim();
}

export function renderPodiumGremlinMarkersHTMLV8(count: number): string {
  return renderPodiumGremlinStandeesHTMLV8(count, {
    compact: true,
    justAdded: true,
    hitNumber: clampInt(count, 1, 4),
  });
}

/**
 * Imperatively mounts a Spring-Loaded Podium Gremlin Standee medallion
 * (`./assets/v7/gremlins/gremlin_podium_badge.jpg` + `GREMLIN HIT #N` brass ribbon)
 * into `container`, returning a live handle for re-triggering `*BOING!*` or updating count.
 */
export function mountPodiumGremlinStandee(
  container: HTMLElement,
  opts?: MountPodiumGremlinStandeeOptionsV8,
): PodiumGremlinStandeeHandleV8 {
  const ownerDoc =
    container?.ownerDocument ?? (typeof document !== 'undefined' ? document : undefined);
  ensureGremlinTheaterStylesV8(ownerDoc);

  let currentCount = clampInt(opts?.count ?? opts?.hitNumber ?? 1, 1, 4);
  const compact = Boolean(opts?.compact);
  const reduced = Boolean(opts?.reducedMotion);
  const shouldAnimateInitial = (opts?.animateBoing ?? true) && !reduced;

  const host = (ownerDoc ?? document).createElement('span');
  host.className = 'ws8gt-standee-mount';
  if (reduced) {
    host.dataset.reducedMotion = 'true';
  }

  const renderIntoHost = (animate: boolean): void => {
    host.innerHTML = renderPodiumGremlinStandeesHTMLV8(currentCount, {
      compact,
      justAdded: animate && !reduced,
      hitNumber: clampInt(opts?.hitNumber ?? currentCount, 1, 4),
      ribbonLabel: opts?.ribbonText,
    });
    if (reduced) {
      host.querySelector<HTMLElement>('.ws8gt-standee-rack')?.setAttribute(
        'data-reduced-motion',
        'true',
      );
    }
  };

  renderIntoHost(shouldAnimateInitial);
  container.appendChild(host);
  if (shouldAnimateInitial) {
    opts?.onPlayBoing?.();
  }

  return {
    element: host,
    triggerBoing(): void {
      renderIntoHost(true);
      opts?.onPlayBoing?.();
    },
    updateCount(newCount: number, animateBoing = true): void {
      currentCount = clampInt(newCount, 0, 4);
      if (currentCount <= 0) {
        host.innerHTML = '';
        return;
      }
      renderIntoHost(animateBoing);
      if (animateBoing) {
        opts?.onPlayBoing?.();
      }
    },
    dispose(): void {
      host.remove();
    },
  };
}

export const mountPodiumGremlinStandeeV8 = mountPodiumGremlinStandee;

/**
 * Legacy-compatible export preserved for strict TypeScript callers:
 * Returns the real painted Studio Gremlin medallion (`./assets/v7/gremlins/gremlin_podium_badge.jpg`)
 * with zero programmer-drawn SVG cartoon stick-figures!
 */
export function buildStudioGremlinCharacterRigSvgV8(_opts?: {
  expression?: 'GLEEFUL' | 'STRAINING' | 'MOD_SHADES' | 'SINGED' | 'XRAY';
  hatKind?: 'NONE' | 'GROUNDSKEEPER' | 'HARDHAT' | 'SFX_VISOR' | 'SPACE_BUBBLE';
  holdingProp?: 'NONE' | 'BROOM';
}): string {
  return `<img class="ws8gt-standee-img" src="${GREMLIN_PODIUM_BADGE_ASSET_V8}" alt="Studio 6A Broadcast Gremlin" decoding="async" draggable="false" />`;
}

// ============================================================================
// 3. Hand-Painted 16:9 Hanna-Barbera CRT Stage + Golden Coin/Confetti Burst
// ============================================================================

function renderGoldenBezelCoinBurstSvg(): string {
  // Pure geometric 24k gold broadcast coins, Mid-Century 4-point sparkles & festive confetti ribbons
  // framing the outer CRT corners on Beat 2/3 impact (ZERO cartoon character doodles!).
  return `
    <svg class="ws8gt-coin-burst-svg" viewBox="0 0 640 360" fill="none" aria-hidden="true">
      <!-- Top-Left & Bottom-Left Festive Gold Coins + Atomic Starbursts -->
      <g>
        <ellipse cx="46" cy="58" rx="15" ry="11" transform="rotate(-24 46 58)" fill="#FFD166" stroke="#6E3B23" stroke-width="2.2"/>
        <ellipse cx="46" cy="58" rx="9" ry="6" transform="rotate(-24 46 58)" fill="#F2A922"/>
        <ellipse cx="86" cy="34" rx="12" ry="9" transform="rotate(18 86 34)" fill="#FFE599" stroke="#6E3B23" stroke-width="2"/>
        <rect x="64" y="82" width="14" height="6" rx="2" transform="rotate(-36 64 82)" fill="#2ECC71" stroke="#4A2513" stroke-width="1.4"/>
        <rect x="30" y="102" width="12" height="5" rx="2" transform="rotate(28 30 102)" fill="#FF6B35"/>
        <path d="M114,48 L117,57 L126,60 L117,63 L114,72 L111,63 L102,60 L111,57 Z" fill="#FFFDF5"/>
        <ellipse cx="54" cy="312" rx="14" ry="10" transform="rotate(22 54 312)" fill="#FFD166" stroke="#6E3B23" stroke-width="2.2"/>
        <rect x="88" y="322" width="15" height="6" rx="2" transform="rotate(-20 88 322)" fill="#E6397A"/>
      </g>
      <!-- Top-Right & Bottom-Right Festive Gold Coins + Atomic Starbursts -->
      <g>
        <ellipse cx="590" cy="54" rx="15" ry="11" transform="rotate(26 590 54)" fill="#FFD166" stroke="#6E3B23" stroke-width="2.2"/>
        <ellipse cx="590" cy="54" rx="9" ry="6" transform="rotate(26 590 54)" fill="#F2A922"/>
        <ellipse cx="548" cy="32" rx="12" ry="8.5" transform="rotate(-19 548 32)" fill="#FFE599" stroke="#6E3B23" stroke-width="2"/>
        <rect x="568" y="88" width="15" height="6" rx="2" transform="rotate(32 568 88)" fill="#2ECC71" stroke="#4A2513" stroke-width="1.4"/>
        <rect x="602" y="108" width="12" height="5" rx="2" transform="rotate(-24 602 108)" fill="#00A8B5"/>
        <path d="M522,52 L525,61 L534,64 L525,67 L522,76 L519,67 L510,64 L519,61 Z" fill="#FFFDF5"/>
        <ellipse cx="584" cy="310" rx="14" ry="10" transform="rotate(-20 584 310)" fill="#FFD166" stroke="#6E3B23" stroke-width="2.2"/>
        <rect x="542" y="322" width="15" height="6" rx="2" transform="rotate(18 542 322)" fill="#FF6B35"/>
      </g>
    </svg>
  `;
}

/**
 * Renders the curved 16:9 1966 RCA "Living Color" CRT stage displaying the genuine
 * hand-painted Hanna-Barbera cel-gouache illustration (`./assets/v7/gremlins/skit_<slug>.jpg`),
 * warm CRT glass sheen, reel corner bug, and golden vector coin/confetti bezel burst!
 */
export function renderGremlinSkitStageSvgV8(
  skitId: GremlinSkitIdV8,
  _scoreBefore: number,
  _cashLost: number,
  victimName: string,
): string {
  const spec = GREMLIN_SKIT_SPECS_V8[skitId] ?? GREMLIN_SKIT_SPECS_V8.REEL_MOWER;
  const cleanVictim = escapeHtml((victimName || 'CONTESTANT').trim().toUpperCase().slice(0, 18));

  return `
    <div class="ws8gt-stage-wrap" data-skit-stage="${escapeHtml(spec.id)}">
      <img class="ws8gt-cel-art"
           src="${escapeHtml(spec.artworkSrc)}"
           alt="${escapeHtml(`${spec.headline} — 1966 Hanna-Barbera Studio Gremlin hits ${cleanVictim}`)}"
           decoding="sync"
           loading="eager"
           draggable="false" />
      ${renderGoldenBezelCoinBurstSvg()}
      <div class="ws8gt-crt-sheen" aria-hidden="true"></div>
      <span class="ws8gt-crt-corner-tag">${escapeHtml(spec.reelCode)} · CH 6A COLOR</span>
    </div>
  `;
}

export const renderGremlinSkitStageHTMLV8 = renderGremlinSkitStageSvgV8;

/**
 * Deterministic 3-Beat Ken-Burns + Slapstick Camera Jolt + Mechanical Split-Flap
 * Bankroll Updater (`progress01` in `0..1`):
 *   - Beat 1 (`0.00..0.30`): Multiplane Ken-Burns push-in on the hand-painted cel
 *   - Beat 2 (`0.30..0.68`): Slapstick camera jolt, coin/confetti burst & live split-flap drain
 *   - Beat 3 (`0.68..1.00`): Wide punchline settle + Spring-Loaded Podium Medallion *BOING!*
 */
export function applyGremlinSkitFrameAtProgressV8(
  root: HTMLElement,
  skitId: GremlinSkitIdV8,
  progress01: number,
  scoreBefore: number,
  cashLost: number,
): void {
  const u = Math.max(0, Math.min(1, progress01));
  const spec = GREMLIN_SKIT_SPECS_V8[skitId] ?? GREMLIN_SKIT_SPECS_V8.REEL_MOWER;
  const safeBefore = Math.max(0, Math.round(scoreBefore));
  const safeLost = Math.max(0, Math.round(cashLost));

  const beat: '1' | '2' | '3' = u < 0.3 ? '1' : u < 0.68 ? '2' : '3';
  root.dataset.beat = beat;

  const captionEl = root.querySelector<HTMLElement>('.ws8gt-caption-line');
  if (captionEl) {
    captionEl.textContent =
      beat === '1' ? spec.captionBeat1 : beat === '2' ? spec.captionBeat2 : spec.captionBeat3;
  }

  // Live Mechanical Split-Flap Bankroll Drain Across Beat 2 (`u = 0.30 .. 0.68`)
  const drainFrac = u <= 0.3 ? 0 : u >= 0.68 ? 1 : (u - 0.3) / 0.38;
  const shownAfter = Math.max(0, Math.round(safeBefore - safeLost * drainFrac));
  const afterFlapEl = root.querySelector<HTMLElement>('.ws8gt-flap-card--after');
  if (afterFlapEl) {
    afterFlapEl.textContent = `$${shownAfter.toLocaleString()}`;
  }

  // Subtle Ken-Burns Pan/Zoom + Beat-2 Slapstick Camera Motion + VHF Turret Click
  const reduced = root.dataset.reducedMotion === 'true';
  if (reduced) {
    root.style.setProperty('--ws8gt-cam-x', '0px');
    root.style.setProperty('--ws8gt-cam-y', '0px');
    root.style.setProperty('--ws8gt-cam-scale', '1.02');
    root.style.setProperty('--ws8gt-cam-rot', '0deg');
    root.style.setProperty('--ws8gt-knob-deg', '18deg');
    return;
  }

  let camX = 0;
  let camY = 0;
  let camScale = 1.03;
  let camRot = 0;
  let knobDeg = -24;

  if (beat === '1') {
    const t1 = u / 0.3;
    camScale = 1.02 + t1 * 0.055;
    camX = (1 - t1) * -6;
    camY = (1 - t1) * 3;
    knobDeg = -24;
  } else if (beat === '2') {
    const t2 = (u - 0.3) / 0.38;
    const shakeWave = Math.sin(t2 * Math.PI * 10) * (1 - t2 * 0.45);
    camScale = 1.078 - t2 * 0.022;
    camX = shakeWave * 4.5;
    camY = Math.cos(t2 * Math.PI * 8) * 2.8;
    camRot = shakeWave * 0.65;
    knobDeg = 22;
  } else {
    const t3 = (u - 0.68) / 0.32;
    camScale = 1.056 - t3 * 0.036;
    camX = 0;
    camY = 0;
    camRot = 0;
    knobDeg = 8;
  }

  root.style.setProperty('--ws8gt-cam-x', `${camX.toFixed(1)}px`);
  root.style.setProperty('--ws8gt-cam-y', `${camY.toFixed(1)}px`);
  root.style.setProperty('--ws8gt-cam-scale', camScale.toFixed(3));
  root.style.setProperty('--ws8gt-cam-rot', `${camRot.toFixed(2)}deg`);
  root.style.setProperty('--ws8gt-knob-deg', `${knobDeg}deg`);
}

// ============================================================================
// 4. Main Theater Player (`playGremlinCartoonSkitV8`)
// ============================================================================

/**
 * Plays 1 of the 8 genuine hand-painted 1966 Hanna-Barbera Studio Gremlin Skits inside
 * a Sleek American Walnut, Spun-Brass & Warm Broadcast Cream (`#FAF2DF`) RCA "Living Color"
 * Studio Monitor Proscenium (`~2.60s` normal, `~0.92s` if `reducedMotion`).
 */
export function playGremlinCartoonSkitV8(
  container: HTMLElement,
  inputOrSkitId: GremlinSkitPlayInputV8 | GremlinSkitIdV8,
  maybeInput?: Partial<GremlinSkitPlayInputV8>,
): Promise<GremlinSkitIdV8> {
  const input: GremlinSkitPlayInputV8 =
    typeof inputOrSkitId === 'string'
      ? ({
          victimName: maybeInput?.victimName ?? 'YOU',
          isPlayerVictim: maybeInput?.isPlayerVictim ?? true,
          scoreBefore: maybeInput?.scoreBefore ?? 0,
          cashLost: maybeInput?.cashLost ?? 0,
          newGremlinCount: maybeInput?.newGremlinCount ?? 1,
          ...maybeInput,
          skitId: inputOrSkitId,
        } as GremlinSkitPlayInputV8)
      : inputOrSkitId;
  const ownerDoc =
    container?.ownerDocument ?? (typeof document !== 'undefined' ? document : undefined);
  ensureGremlinTheaterStylesV8(ownerDoc);

  const prevCleanup = container ? activeContainerCleanups.get(container) : undefined;
  if (prevCleanup) {
    prevCleanup();
  }

  const chosenSkit = chooseGremlinSkitId(input);
  preloadGremlinTheaterArtV8([chosenSkit]);
  const spec = GREMLIN_SKIT_SPECS_V8[chosenSkit];

  const prefersReduced =
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const reduced = Boolean(input.reducedMotion ?? prefersReduced);
  const totalDurationMs = reduced ? 920 : 2600;
  const boingAtMs = reduced ? 360 : 1680;

  const scoreBefore = Math.max(0, Math.round(input.scoreBefore || 0));
  const cashLost = Math.max(0, Math.round(input.cashLost || 0));
  const scoreAfter = Math.max(0, scoreBefore - cashLost);
  const clampedGremlins = clampInt(input.newGremlinCount || 1, 1, 4);
  const initialGremlins = Math.max(1, clampedGremlins - 1);
  const victimLabel = (
    input.victimName?.trim() || (input.isPlayerVictim ? 'YOU' : 'CHAMPION')
  ).toUpperCase();
  const deltaBadgeText = formatLossBadgeCopy(scoreBefore, cashLost);
  const bulbsHtml = Array.from({ length: 18 }, () => '<span class="ws8gt-bulb"></span>').join('');

  return new Promise<GremlinSkitIdV8>((resolve) => {
    if (!ownerDoc) {
      input.onPlayFoghorn?.();
      input.onPlayVoiceSting?.(chosenSkit);
      input.onPlayBoing?.();
      resolve(chosenSkit);
      return;
    }

    let finished = false;
    let boingFired = false;
    let rafId: number | null = null;
    let heartbeatIntervalId: number | null = null;
    const timers: number[] = [];

    const overlay = ownerDoc.createElement('section');
    overlay.className = 'ws8gt-overlay';
    overlay.dataset.skitId = chosenSkit;
    overlay.dataset.beat = reduced ? '3' : '1';
    overlay.dataset.reducedMotion = reduced ? 'true' : 'false';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `Studio Gremlin Strike: ${spec.headline}`);

    overlay.innerHTML = `
      <div class="ws8gt-cabinet">
        <header class="ws8gt-crown">
          <div class="ws8gt-bulb-strip" aria-hidden="true">${bulbsHtml}</div>
          <div class="ws8gt-crown-bar">
            <div class="ws8gt-crown-left">
              <span class="ws8gt-strike-badge">
                <svg class="ws8gt-bolt-svg" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M9.5 1L3 9.2H8L6.5 15L13 6.8H8L9.5 1Z" fill="#FFD166" stroke="#4A2513" stroke-width="1.1" stroke-linejoin="round"/>
                </svg>
                <span>STUDIO GREMLIN STRIKE!</span>
              </span>
              <span class="ws8gt-crown-reel">S01 SLAPSTICK REEL · ${escapeHtml(spec.kicker)}</span>
            </div>
            <span class="ws8gt-victim-pill" data-victim-kind="${input.isPlayerVictim ? 'player' : 'rival'}">
              <span class="ws8gt-tally-dot" aria-hidden="true"></span>
              <span>TARGET: ${escapeHtml(victimLabel)}</span>
            </span>
          </div>
        </header>

        <div class="ws8gt-bezel-deck">
          <div class="ws8gt-crt-mask">
            ${renderGremlinSkitStageSvgV8(chosenSkit, scoreBefore, cashLost, victimLabel)}
          </div>

          <aside class="ws8gt-vhf-strip" aria-hidden="true">
            <div class="ws8gt-knob-unit">
              <span class="ws8gt-knob-lbl">VHF 6A</span>
              <div class="ws8gt-rotary-knob">
                <span class="ws8gt-knob-bar"></span>
              </div>
            </div>
            <div class="ws8gt-knob-unit">
              <span class="ws8gt-knob-lbl">UHF</span>
              <div class="ws8gt-rotary-knob ws8gt-rotary-knob--uhf">
                <span class="ws8gt-knob-bar"></span>
              </div>
            </div>
            <div class="ws8gt-speaker-grille">
              <span class="ws8gt-louver"></span>
              <span class="ws8gt-louver"></span>
              <span class="ws8gt-louver"></span>
              <span class="ws8gt-louver"></span>
            </div>
            <div class="ws8gt-color-jewel">
              <span class="ws8gt-color-jewel-lamp"></span>
              <span>COLOR</span>
            </div>
          </aside>
        </div>

        <footer class="ws8gt-apron">
          <div class="ws8gt-copy-block">
            <h2 class="ws8gt-headline">${escapeHtml(spec.headline)}</h2>
            <p class="ws8gt-caption-line">${escapeHtml(
              reduced ? spec.captionBeat3 : spec.captionBeat1,
            )}</p>
          </div>

          <div class="ws8gt-flap-strip" aria-live="polite" aria-label="Bankroll drop">
            <span class="ws8gt-flap-card ws8gt-flap-card--before">$${scoreBefore.toLocaleString()}</span>
            <span class="ws8gt-flap-arrow" aria-hidden="true">→</span>
            <span class="ws8gt-flap-delta">${escapeHtml(deltaBadgeText)}</span>
            <span class="ws8gt-flap-arrow" aria-hidden="true">→</span>
            <strong class="ws8gt-flap-card ws8gt-flap-card--after">$${(reduced
              ? scoreAfter
              : scoreBefore
            ).toLocaleString()}</strong>
          </div>

          <div class="ws8gt-apron-foot">
            <div class="ws8gt-podium-slot" data-stamped="${reduced ? 'true' : 'false'}">
              ${renderPodiumGremlinStandeesHTMLV8(reduced ? clampedGremlins : initialGremlins, {
                compact: true,
                justAdded: false,
                hitNumber: clampedGremlins,
              })}
            </div>

            <button type="button"
                    class="ws8gt-skip-btn"
                    data-action="skip-gremlin-skit"
                    aria-label="Skip Studio Gremlin reel">
              <span>SKIP</span>
              <svg class="ws8gt-skip-tri" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 1.5L10.5 6L2 10.5V1.5Z" fill="#141B29"/>
              </svg>
            </button>
          </div>
        </footer>
      </div>
    `;

    const podiumSlotEl = overlay.querySelector<HTMLElement>('.ws8gt-podium-slot');
    const skipBtn = overlay.querySelector<HTMLButtonElement>('.ws8gt-skip-btn');

    const cleanup = (): void => {
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
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', onKeyDown);
      }
      if (container && activeContainerCleanups.get(container) === finish) {
        activeContainerCleanups.delete(container);
      }
      overlay.remove();
    };

    const finish = (): void => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(chosenSkit);
    };

    const triggerPodiumBoingStamp = (): void => {
      if (boingFired || finished) return;
      boingFired = true;
      if (podiumSlotEl) {
        podiumSlotEl.dataset.stamped = 'true';
        podiumSlotEl.innerHTML = renderPodiumGremlinStandeesHTMLV8(clampedGremlins, {
          compact: true,
          justAdded: !reduced,
          hitNumber: clampedGremlins,
        });
      }
      input.onPlayBoing?.();
    };

    const onKeyDown = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape' || ev.key === ' ' || ev.key === 'Enter') {
        ev.preventDefault();
        finish();
      }
    };

    skipBtn?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      finish();
    });

    if (container && typeof container.appendChild === 'function') {
      activeContainerCleanups.set(container, finish);
      container.appendChild(overlay);
    }

    // Initial Beat 1 pose + t=0ms Foghorn SFX
    applyGremlinSkitFrameAtProgressV8(
      overlay,
      chosenSkit,
      reduced ? 0.92 : 0.02,
      scoreBefore,
      cashLost,
    );
    input.onPlayFoghorn?.();

    if (typeof window === 'undefined') {
      input.onPlayVoiceSting?.(chosenSkit);
      triggerPodiumBoingStamp();
      finish();
      return;
    }

    window.addEventListener('keydown', onKeyDown);
    skipBtn?.focus({ preventScroll: true });

    // t=140ms Raspy Studio Gremlin Voice Sting
    timers.push(
      window.setTimeout(() => {
        if (!finished) {
          input.onPlayVoiceSting?.(chosenSkit);
        }
      }, 140),
    );

    // Spring-Loaded Podium Gremlin Standee Medallion Stamp (*BOING!*)
    timers.push(
      window.setTimeout(() => {
        triggerPodiumBoingStamp();
      }, boingAtMs),
    );

    const startTs = performance.now();
    const advanceAtNow = (now: number): boolean => {
      if (finished) return false;
      if (!overlay.isConnected && container?.isConnected) {
        finish();
        return false;
      }
      const elapsed = Math.max(0, now - startTs);
      const progress01 = Math.min(1, elapsed / totalDurationMs);
      applyGremlinSkitFrameAtProgressV8(overlay, chosenSkit, progress01, scoreBefore, cashLost);
      if (elapsed >= boingAtMs && !boingFired) {
        triggerPodiumBoingStamp();
      }
      if (progress01 >= 1) {
        finish();
        return false;
      }
      return true;
    };

    if (!reduced) {
      const tick = (now: number): void => {
        if (advanceAtNow(now)) {
          rafId = window.requestAnimationFrame(tick);
        }
      };
      rafId = window.requestAnimationFrame(tick);
      heartbeatIntervalId = window.setInterval(() => {
        advanceAtNow(performance.now());
      }, 45);
    }

    timers.push(
      window.setTimeout(() => {
        if (!finished) overlay.dataset.exiting = 'true';
      }, Math.max(0, totalDurationMs - 110)),
    );
    timers.push(window.setTimeout(finish, totalDurationMs + 60));
  });
}
