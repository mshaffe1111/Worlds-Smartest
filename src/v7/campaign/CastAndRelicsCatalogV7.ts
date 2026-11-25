// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.5 — 1966 IN LIVING COLOR)
// `src/v7/campaign/CastAndRelicsCatalogV7.ts`
// 6 Rivals + 3 Booth Power Brokers (20/20 Category Weak-Spot Coverage,
// Gentle 52%–58% Episode 1–3 Onboarding Curve, Vivid 1966 TV Guide Wit),
// 28 Plain-English Studio Relics x 4 Foils, 36 Sovereign Trophies &
// Bounded 10-Turn Economy (`0.0%` 1/5 Fluke Wins, Exact $1 Integer Ledger).
// ============================================================================

import {
  ALL_CATEGORIES_V7,
  type BoardTileNodeV7,
  type BrokerIdV7,
  type CastIdV7,
  type CastProfileV7,
  type CategoryIdV7,
  type ClueRecordV7,
  type ContestantWaiverV7,
  type CoupRegimeIdV7,
  type DomainIdV7,
  type FoilFinishV7,
  type OwnedRelicV7,
  type PortraitEmotionV7,
  type RelicSpecV7,
  type RivalIdV7,
  type ToyResolutionV7,
  type TrophySpecV7,
} from '../contracts_v7';
import { TROPHY_CATALOG_V7 } from '../engine/LitTrophyVaultV7';

export { TROPHY_CATALOG_V7, type TrophySpecV7 };

// ----------------------------------------------------------------------------
// 1. 2x2 1966 TV Guide Gouache Sprite Sheet Coordinates & Living Color Avatar
// ----------------------------------------------------------------------------

export const PORTRAIT_SPRITE_POSITIONS_V7: Record<
  PortraitEmotionV7,
  {
    readonly bgPosX: string;
    readonly bgPosY: string;
    readonly bgPosition: string;
    readonly badgeLabel: string;
  }
> = {
  POISED: { bgPosX: '0%', bgPosY: '0%', bgPosition: '0% 0%', badgeLabel: 'POISED' },
  TELL: { bgPosX: '100%', bgPosY: '0%', bgPosition: '100% 0%', badgeLabel: 'LIVE TELL' },
  RATTLED: { bgPosX: '0%', bgPosY: '100%', bgPosition: '0% 100%', badgeLabel: 'RATTLED' },
  BREAKDOWN: { bgPosX: '100%', bgPosY: '100%', bgPosition: '100% 100%', badgeLabel: 'CRACKING' },
};

export const RIVAL_IDS_V7: readonly RivalIdV7[] = [
  'CARMEN_DELGADO',
  'TOBY_OKAFOR',
  'INEZ_CALLAHAN',
  'ALASTAIR_KERR',
  'SEO_YUN_KANG',
  'REX_CALLOWAY',
];

export const BROKER_IDS_V7: readonly BrokerIdV7[] = [
  'GRANT_BELLAMY',
  'ROZ_KORMAN',
  'VERA_KARP',
];

// ----------------------------------------------------------------------------
// 2. 6 Rivals (6 x 3 = 18 Distinct Weak Categories) + 3 Booth Brokers
//    Union with GRANT_BELLAMY's 4 Stage-10 Blind Spots = 20/20 Categories!
//    Episodes 1–3 tuned to a welcoming ~52%–58% accuracy ramp!
// ----------------------------------------------------------------------------

export const CAST_PROFILES_V7: Record<CastIdV7, CastProfileV7> = {
  CARMEN_DELGADO: {
    id: 'CARMEN_DELGADO',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Carmen Delgado',
    age: 34,
    title: 'Queens Night-Shift ER Nurse — Playing Square to Save Her Clinic',
    silhouetteShape: 'SQUARE',
    portraitAsset: './assets/v7/portraits/carmen_delgado.jpg',
    accentHex: '#FF6738',
    weakCategories: ['FINANCE', 'DYNASTIES', 'FINE ARTS'],
    strongCategories: ['MEDICINE', 'CHEMISTRY', 'CUISINE'],
    signatureTellText:
      'Checks her nurse’s sweep-second watch whenever a Truce square opens—honor her truce and she keeps the match clean.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.52,
  },
  TOBY_OKAFOR: {
    id: 'TOBY_OKAFOR',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Toby Okafor',
    age: 41,
    title: 'Con Ed High-Voltage Lineman — Hears a Rigged Podium a Block Away',
    silhouetteShape: 'SQUARE',
    portraitAsset: './assets/v7/portraits/toby_okafor.jpg',
    accentHex: '#F4A91F',
    weakCategories: ['LITERATURE', 'LEXICON', 'CUISINE'],
    strongCategories: ['ENGINES', 'PHYSICS', 'GADGETS'],
    signatureTellText:
      'Tilts one ear toward the floor cables whenever Control Booth A juices a square—test him on Books, Words, or Food.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.55,
  },
  INEZ_CALLAHAN: {
    id: 'INEZ_CALLAHAN',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Inez Callahan',
    age: 63,
    title: 'Fifth Avenue Head Librarian — Sharper Than a Freshly Stamped Card Catalog',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/inez_callahan.jpg',
    accentHex: '#0096A6',
    weakCategories: ['GADGETS', 'ENGINES', 'SPORTS'],
    strongCategories: ['LITERATURE', 'LEXICON', 'FOLKLORE'],
    signatureTellText:
      'Peers over her cat-eye reading glasses before dissecting a word clue—pull her into Gadgets, Engines, or Sports.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.58,
  },
  ALASTAIR_KERR: {
    id: 'ALASTAIR_KERR',
    role: 'RIVAL_HEEL',
    name: 'Alastair Kerr',
    age: 49,
    title: 'Nine-Week Velvet Champion — Savile Row Suit, Bought-and-Paid-For Crown',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/alastair_kerr.jpg',
    accentHex: '#F4A91F',
    weakCategories: ['PRICING', 'PHYSICS', 'JUKEBOX'],
    strongCategories: ['FINE ARTS', 'DYNASTIES', 'LITERATURE'],
    signatureTellText:
      'Lifts his chin toward Spotlight #4 for Roz’s secret blink—slap CATCH CHEAT when LIVE TELL flashes to bust his feed!',
    cheatChannel: 'FRESNEL_LAMP',
    baseAccuracy: 0.63,
  },
  SEO_YUN_KANG: {
    id: 'SEO_YUN_KANG',
    role: 'RIVAL_HEEL',
    name: 'Seo-Yun Kang',
    age: 31,
    title: 'Monte Carlo House Actuary — Prices Every Board to the Franc',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/seo_yun_kang.jpg',
    accentHex: '#1E56C5',
    weakCategories: ['MEDICINE', 'FOLKLORE', 'SCREEN'],
    strongCategories: ['FINANCE', 'ODDS', 'PRICING'],
    signatureTellText:
      'Rests two gloved fingertips on the podium trim to feel secret booth buzzes—bust her LIVE TELL and hit Silver Screen or Myths!',
    cheatChannel: 'SOLENOID_SPARK',
    baseAccuracy: 0.66,
  },
  REX_CALLOWAY: {
    id: 'REX_CALLOWAY',
    role: 'RIVAL_HEEL',
    name: 'Rex Calloway',
    age: 38,
    title: 'Matinee Soap Idol — Million-Dollar Teeth, Borrowed Answers',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/rex_calloway.jpg',
    accentHex: '#E63B7A',
    weakCategories: ['CHEMISTRY', 'ODDS', 'FALLACIES'],
    strongCategories: ['SCREEN', 'JUKEBOX', 'SPORTS'],
    signatureTellText:
      'Flashes his camera-ready grin toward Row C Seat 14 for an opera-glass cue—tap CATCH CHEAT the instant LIVE TELL lights!',
    cheatChannel: 'ROW_C_GLINT',
    baseAccuracy: 0.58,
  },
  GRANT_BELLAMY: {
    id: 'GRANT_BELLAMY',
    role: 'BOOTH_BROKER',
    name: 'Grant Bellamy',
    age: 57,
    title: 'The Velvet Voice of Eight O’Clock — Host & Network Kingmaker',
    silhouetteShape: 'SQUARE',
    portraitAsset: './assets/v7/portraits/grant_bellamy.jpg',
    accentHex: '#F4A91F',
    weakCategories: ['ATLAS', 'HEADLINES', 'PRICING', 'FALLACIES'],
    strongCategories: ['SCREEN', 'DYNASTIES', 'LITERATURE', 'JUKEBOX'],
    signatureTellText:
      'Drops his famous baritone half an octave right before tightening the studio clock—aim at World Atlas, Headlines, or Price Tag.',
    cheatChannel: 'SOLENOID_SPARK',
    baseAccuracy: 0.82,
  },
  ROZ_KORMAN: {
    id: 'ROZ_KORMAN',
    role: 'BOOTH_BROKER',
    name: 'Roz Korman',
    age: 46,
    title: 'VP of Sponsor Accounts — Architect of the Canary-Yellow Fix',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/roz_korman.jpg',
    accentHex: '#E63B7A',
    weakCategories: ['MEDICINE', 'FOLKLORE', 'PHYSICS'],
    strongCategories: ['FINANCE', 'PRICING', 'ODDS'],
    signatureTellText:
      'Snaps her gold Dunhill lighter beside the booth mic right before sliding a wax-sealed sponsor tip onto your lectern.',
    cheatChannel: 'FRESNEL_LAMP',
    baseAccuracy: 0.80,
  },
  VERA_KARP: {
    id: 'VERA_KARP',
    role: 'BOOTH_BROKER',
    name: 'Vera Karp',
    age: 52,
    title: 'Broadcast Standards Chief — Armed With Two Stopwatches & a Subpoena',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/vera_karp.jpg',
    accentHex: '#0096A6',
    weakCategories: ['JUKEBOX', 'SPORTS', 'SCREEN'],
    strongCategories: ['FALLACIES', 'HEADLINES', 'LEXICON'],
    signatureTellText:
      'Clicks her chrome stopwatch twice every time you torch a dirty sponsor tip or bust Control Booth rigging live on air.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.79,
  },
};

/** Vivid 1966 TV Guide "Close-Up" 1-line profiles for Green Room & Cast previews. */
export const CAST_TV_GUIDE_BIOS_V7: Record<CastIdV7, string> = {
  CARMEN_DELGADO:
    'TV GUIDE CLOSE-UP: Straight off night triage at Queens General, Nurse Delgado owns Medicine and Food—make her play Wall Street, Kings, or Fine Art.',
  TOBY_OKAFOR:
    'TV GUIDE CLOSE-UP: The lineman who keeps Midtown lit knows Engines and Physics cold, though poetry and French sauces give him fits.',
  INEZ_CALLAHAN:
    'TV GUIDE CLOSE-UP: Forty years running the Fifth Avenue Reference Room made Callahan unbeatable on Books—just ask her about spark plugs or baseball.',
  ALASTAIR_KERR:
    'TV GUIDE CLOSE-UP: Nine weeks undefeated in custom velvet, Kerr blanks on grocery Price Tags and jukebox hits whenever Roz’s lamp stays dark.',
  SEO_YUN_KANG:
    'TV GUIDE CLOSE-UP: Recruited from Monte Carlo’s baccarat salon, Kang prices Odds to the penny—drag her into Hollywood, Folklore, or Medicine.',
  REX_CALLOWAY:
    'TV GUIDE CLOSE-UP: Afternoon TV’s top heartthrob breezes through Movies and Sports, but Chemistry and Brain Twisters melt his hairspray.',
  GRANT_BELLAMY:
    'TV GUIDE CLOSE-UP: Television’s smoothest emcee charms fifty million homes at eight o’clock while guarding the 36th-Floor Penthouse keys.',
  ROZ_KORMAN:
    'TV GUIDE CLOSE-UP: Madison Avenue’s sharpest fixer protects sponsor ratings with canary-yellow halftime tips—always check her ink for traps.',
  VERA_KARP:
    'TV GUIDE CLOSE-UP: Standards & Practices’ sleepless investigator pays clean certified bounties to challengers who expose booth rigging on camera.',
};

/** Helper returning gentler onboarding Rival accuracy in Episodes 1–3 (~52%–58%). */
export function getEpisodeRivalAccuracyV7(
  rivalId: RivalIdV7,
  episodeNumber: number,
): number {
  const base = CAST_PROFILES_V7[rivalId].baseAccuracy;
  if (episodeNumber <= 1) return Math.min(base, 0.52);
  if (episodeNumber === 2) return Math.min(base, 0.55);
  if (episodeNumber === 3) return Math.min(base, 0.58);
  return base;
}

/** Verifies the 6x3 = 18 distinct Rival weak spots + Bellamy's 4 = 20/20 category coverage law. */
export function verifyCastCategoryCoverageV7(): {
  readonly rivalWeakCount: number;
  readonly rivalDistinctWeakCount: number;
  readonly totalCoveredCount: number;
  readonly uncovered: readonly CategoryIdV7[];
  readonly valid: boolean;
} {
  const rivalSet = new Set<CategoryIdV7>();
  let rivalWeakCount = 0;
  for (const rivalId of RIVAL_IDS_V7) {
    for (const cat of CAST_PROFILES_V7[rivalId].weakCategories) {
      rivalWeakCount += 1;
      rivalSet.add(cat);
    }
  }
  const unionSet = new Set<CategoryIdV7>(rivalSet);
  for (const cat of CAST_PROFILES_V7.GRANT_BELLAMY.weakCategories) {
    unionSet.add(cat);
  }
  const uncovered = ALL_CATEGORIES_V7.filter((c) => !unionSet.has(c));
  return {
    rivalWeakCount,
    rivalDistinctWeakCount: rivalSet.size,
    totalCoveredCount: unionSet.size,
    uncovered,
    valid:
      rivalWeakCount === 18 &&
      rivalSet.size === 18 &&
      unionSet.size === 20 &&
      uncovered.length === 0,
  };
}

/** Crisp 1966 Living Color NBC/CBS studio monogram SVG data URI while portrait JPG loads. */
export function buildCastMonogramSvgDataUriV7(
  castId: CastIdV7,
  emotion: PortraitEmotionV7 = 'POISED',
): string {
  const profile = CAST_PROFILES_V7[castId];
  const parts = profile.name.split(' ');
  const initials = parts
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const emotionRingHex =
    emotion === 'TELL'
      ? '#F4A91F'
      : emotion === 'RATTLED'
        ? '#FF6738'
        : emotion === 'BREAKDOWN'
          ? '#E63B7A'
          : '#0096A6';

  const shapeMarkup =
    profile.silhouetteShape === 'TRIANGLE'
      ? `<polygon points="48,14 82,76 14,76" fill="${profile.accentHex}" fill-opacity="0.34" stroke="${emotionRingHex}" stroke-width="2.6"/>`
      : profile.silhouetteShape === 'CIRCLE'
        ? `<circle cx="48" cy="48" r="32" fill="${profile.accentHex}" fill-opacity="0.34" stroke="${emotionRingHex}" stroke-width="2.6"/>`
        : `<rect x="16" y="16" width="64" height="64" rx="12" fill="${profile.accentHex}" fill-opacity="0.34" stroke="${emotionRingHex}" stroke-width="2.6"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96"><rect width="96" height="96" rx="48" fill="#0B1D30"/><circle cx="48" cy="48" r="44" fill="none" stroke="${emotionRingHex}" stroke-width="3"/>${shapeMarkup}<text x="48" y="57" text-anchor="middle" font-family="Jost,sans-serif" font-weight="800" font-size="28" fill="#F7EEDB" letter-spacing="1">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ----------------------------------------------------------------------------
// 3. 28 Plain-English Studio Relics (16 Clean + 12 Backstage) & 4 Foil Finishes
// ----------------------------------------------------------------------------

export const LIVE_SCORE_BURN_SHOP_COST_V7 = 450;
export const MAX_TRUNK_SLOTS_V7 = 5;
export const MAX_MULT_DRIVER_SLOTS_V7 = 2;

export interface FoilBonusSpecV7 {
  readonly foil: FoilFinishV7;
  readonly label: string;
  readonly badgeHex: string;
  readonly summary: string;
}

export const FOIL_SPECS_V7: Record<FoilFinishV7, FoilBonusSpecV7> = {
  GILDED: {
    foil: 'GILDED',
    label: '24K Marquee Gold',
    badgeHex: '#F4A91F',
    summary: '+$18 bonus square dollars on every right answer.',
  },
  SILVER_HALIDE: {
    foil: 'SILVER_HALIDE',
    label: 'Royal Cobalt Chrome',
    badgeHex: '#1E56C5',
    summary: '+0.08× multiplier when you lock in within 7 seconds.',
  },
  DICHROIC: {
    foil: 'DICHROIC',
    label: 'Peacock Teal Prism',
    badgeHex: '#0096A6',
    summary: '+0.07× multiplier on ★ Weak-Spot or Bonus Halo squares.',
  },
  TAX_STAMPED: {
    foil: 'TAX_STAMPED',
    label: 'Certified Network Seal',
    badgeHex: '#FF6738',
    summary: '+$25 certified bonus on every winning turn.',
  },
};

export const RELIC_CATALOG_V7: readonly RelicSpecV7[] = [
  // ======================== 16 CLEAN NETWORK PROPS ==========================
  {
    relicId: 'relic_vera_audit_ledger',
    name: 'Vera’s Clean-Air Ledger',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 450,
    description:
      'Standards & Practices blue ledger: +0.35× multiplier whenever your Backstage Cash is $0 (+0.50× during Clean-Air Season).',
    triggerSummary:
      'Adds +0.35× multiplier whenever your Backstage Cash is $0 (+0.50× during Clean-Air Season).',
    defaultFoil: 'TAX_STAMPED',
  },
  {
    relicId: 'relic_inez_root_scalpel',
    name: 'Inez’s Red Editor Pencil',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 420,
    description:
      'Fifth Avenue Librarian’s pencil: crosses out 1 wrong choice on Turns 1–4 and adds +$65 on Arts & History squares.',
    triggerSummary:
      'Crosses out 1 wrong choice on Turns 1–4 and adds +$65 on Arts & History squares.',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_carmen_tourniquet',
    name: 'Carmen’s Night-Shift Strap',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 400,
    description:
      'Queens ER field strap: adds +$70 on Science clues or while trailing, and keeps your streak alive on 50%+ close calls.',
    triggerSummary:
      'Adds +$70 on Science clues or while trailing, and keeps streaks alive on 50%+ close calls.',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_solari_overdrive',
    name: 'Split-Flap Overdrive Gear',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 520,
    description:
      'Studio 6A tote-board governor: boosts your multiplier by +0.40× on a 2+ answer streak (+0.55× at 4+ in a row).',
    triggerSummary:
      'Boosts your multiplier by +0.40× on a 2+ answer streak (+0.55× at 4+ in a row).',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_amber_chalk_holder',
    name: 'Green-Room Truce Chalk',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 450,
    description:
      'Contestants’ honor chalk: adds +0.35× multiplier plus +$45 Clean Purse cash whenever you win a Studio Truce square.',
    triggerSummary:
      'Adds +0.35× multiplier plus +$45 Clean Purse cash whenever you win a Studio Truce square.',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_weston_peak_limiter',
    name: 'Quick-Draw Buzzer Spring',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 380,
    description:
      'Hair-trigger Studio 6A podium spring: adds +$75 bonus dollars whenever you lock in a right answer within 6 seconds.',
    triggerSummary:
      'Adds +$75 bonus dollars whenever you lock in a right answer within 6 seconds.',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_brass_vernier_caliper',
    name: 'Price-Check Slide Rule',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 410,
    description:
      'Daytime shopping champ’s slide rule: +$85 on Numbers & World clues plus +15% forgiveness on dial and globe rounds.',
    triggerSummary:
      'Adds +$85 on Numbers & World clues and boosts close-call dial and globe scores by +15%.',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_chronometer_escapement',
    name: 'Prime-Time Gold Sweep Watch',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 490,
    description:
      'Network presentation wristwatch: boosts your multiplier by +0.45× on every late-show turn (Turns 7 through 10).',
    triggerSummary:
      'Boosts your multiplier by +0.45× on every late-show turn (Turns 7 through 10).',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_patent_cyanotype_tube',
    name: 'World’s Fair Blueprint Tube',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 390,
    description:
      '’64 Queens Pavilion tube: adds +$80 on Science & Tech clues and lights up helpful target hints on Visual Monitors.',
    triggerSummary:
      'Adds +$80 on Science & Tech clues and lights up helpful target hints on Visual Monitors.',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_studio_b_on_air_prism',
    name: '“APPLAUSE” Sign Ruby Lens',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 500,
    description:
      'Overhead studio-sign ruby lens: boosts your multiplier by +0.40× whenever you win a Champion ★ Weak-Spot square.',
    triggerSummary:
      'Boosts your multiplier by +0.40× whenever you win one of the Champion’s ★ Weak-Spot squares.',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_goodson_cue_bell',
    name: 'Stage Manager’s Cue Bell',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 360,
    description:
      'Five-seconds-to-air brass desk bell: adds +$95 opening bonus dollars on Turns 1, 2, 5, and 6.',
    triggerSummary:
      'Adds +$95 opening bonus dollars on Turns 1, 2, 5, and 6.',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_subpoena_wax_signet',
    name: 'Broadcast Inspector’s Badge',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 440,
    description:
      'Federal quiz-oversight seal: adds +$60 per busted Booth Cheat and boosts Burn-on-Air tip rewards to +$275.',
    triggerSummary:
      'Adds +$60 per busted Booth Cheat and boosts Burn-on-Air tip rewards to +$275.',
    defaultFoil: 'TAX_STAMPED',
  },
  {
    relicId: 'relic_ribbon_mic_windscreen',
    name: 'RCA 44-BX Velvet Mic Cover',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 370,
    description:
      'Vintage studio silk mic cover: adds +$70 on Arts & Culture clues and cuts Double-or-Nothing miss penalties in half.',
    triggerSummary:
      'Adds +$70 on Arts & Culture clues and cuts Double-or-Nothing miss penalties in half.',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_world_fair_astrolabe',
    name: 'Unisphere Souvenir Globe',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 430,
    description:
      'Flushing Meadows desk globe: adds +$30 bonus dollars for each different subject color won this show (up to +$120).',
    triggerSummary:
      'Adds +$30 bonus dollars for each different subject color won this episode (up to +$120).',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_bakelite_tally_counter',
    name: '30 Rock Usher’s Clicker',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 350,
    description:
      'Mezzanine ticket clicker: adds +$25 bonus dollars for every right answer banked so far this show (up to +$125).',
    triggerSummary:
      'Adds +$25 bonus dollars for every right answer banked so far this episode (up to +$125).',
    defaultFoil: 'TAX_STAMPED',
  },
  {
    relicId: 'relic_sovereign_plumb_bob',
    name: 'Top-Row Jackpot Weight',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 540,
    description:
      'Stage rigging counterweight: boosts your multiplier by +0.45× on late-round prime-time stumper clues.',
    triggerSummary:
      'Boosts your multiplier by +0.45× on tough late-round prime-time stumper clues.',
    defaultFoil: 'TAX_STAMPED',
  },

  // ====================== 12 BACKSTAGE HUSTLE PROPS =========================
  {
    relicId: 'relic_toby_copper_shunt',
    name: 'Toby’s Grounding Clip',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 450,
    description:
      'Lineman Toby’s podium clip: adds +$110 on rigged booth squares and spots podium-buzz cheats for CATCH CHEAT.',
    triggerSummary:
      'Adds +$110 on rigged booth squares and spots podium-buzz cheats for CATCH CHEAT.',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_uv_blacklight_loupe',
    name: 'Spymaster’s UV Pocket Lamp',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 450,
    description:
      '47th Street spy blacklight: automatically exposes rigged traps inside halftime tips and adds +$75 on tip turns.',
    triggerSummary:
      'Exposes rigged traps inside commercial-break envelopes automatically and adds +$75 on tip turns.',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_channel_83_crystal',
    name: 'Pirate UHF Tuner Crystal',
    ledgerKind: 'CONTRABAND',
    slotKind: 'MULT_DRIVER',
    costCash: 480,
    description:
      'Offshore radio crystal: adds +0.20× multiplier every turn, jumping to +0.50× on glowing Channel 83 Halo squares.',
    triggerSummary:
      'Adds +0.20× multiplier every turn, jumping to +0.50× on glowing Channel 83 Halo squares.',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_roz_velvet_cufflink',
    name: 'Sponsor’s Gold Cufflink',
    ledgerKind: 'CONTRABAND',
    slotKind: 'MULT_DRIVER',
    costCash: 520,
    description:
      'Makeup-room sponsor token: boosts your multiplier by +0.45× and pays +$35 Backstage Cash per win after pocketing a tip.',
    triggerSummary:
      'Boosts your multiplier by +0.45× and pays +$35 Backstage Cash per win after pocketing a tip.',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_monte_carlo_loaded_shoe',
    name: 'Monte Carlo Dealing Shoe',
    ledgerKind: 'CONTRABAND',
    slotKind: 'MULT_DRIVER',
    costCash: 530,
    description:
      'Riviera baccarat shoe: boosts your multiplier by +0.45× whenever you win a high-risk bonus wager or early-clue reveal.',
    triggerSummary:
      'Boosts your multiplier by +0.45× whenever you win a high-risk bonus wager or early-clue reveal.',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_row_c_opera_monocle',
    name: 'Row-C Pearl Opera Glasses',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 420,
    description:
      'Audience-spotting opera glasses: adds +$90 when you steal the Champion’s targeted square and spots Row-C cheat flashes.',
    triggerSummary:
      'Adds +$90 when you snatch the Champion’s targeted square and spots Row-C cheat flashes.',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_larson_pattern_rom',
    name: 'Tote-Board Master Punch Card',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 460,
    description:
      'Smuggled IBM keypunch card: adds +$95 bonus dollars whenever you win a big $300–$500 square on the tote board.',
    triggerSummary:
      'Adds +$95 bonus dollars whenever you win a big $300–$500 square on the tote board.',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_fresnel_barn_filter',
    name: 'Stagehand’s Amber Lamp Gel',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 410,
    description:
      'Friendly grip’s spotlight filter: adds +$85 against crooked Heel Champions and spots overhead lamp-blink cheats.',
    triggerSummary:
      'Adds +$85 against crooked Heel Champions and spots overhead spotlight-blink cheats.',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_atlantic_tilt_plumb',
    name: 'Steel Pier Pinball Tilt Wedge',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 390,
    description:
      'Atlantic City arcade wedge: adds +$115 bonus dollars whenever you sidestep a famous trick-question myth.',
    triggerSummary:
      'Adds +$115 bonus dollars whenever you cleanly sidestep a famous trick-question myth.',
    defaultFoil: 'TAX_STAMPED',
  },
  {
    relicId: 'relic_vaudeville_sleeve_ace',
    name: 'Burbank Joke-Wall Sleeve Ace',
    ledgerKind: 'CONTRABAND',
    slotKind: 'MULT_DRIVER',
    costCash: 500,
    description:
      '’68 Burbank Pop-Art magician’s cuff: boosts your multiplier by +0.50× whenever you trail the Champion by $200 or more.',
    triggerSummary:
      'Boosts your multiplier by +0.50× whenever you trail the Champion by $200 or more.',
    defaultFoil: 'TAX_STAMPED',
  },
  {
    relicId: 'relic_isolation_wiretap_coil',
    name: '1964 Isolation-Booth Stethoscope',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 440,
    description:
      'Teak-booth listening cup: adds +$80 on History & World clues and previews the Champion’s projected finish.',
    triggerSummary:
      'Adds +$80 on History & World clues and previews the Champion’s projected finish.',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_dirty_marker_ledger',
    name: 'Pink-Carbon Side-Bet Book',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 450,
    description:
      'Backstage bookie’s pocket pad: adds +$25 per $500 stashed in your Backstage Cash + Comeback Pot (up to +$125).',
    triggerSummary:
      'Adds +$25 per $500 stashed in your Backstage Cash + Comeback Pot (up to +$125).',
    defaultFoil: 'TAX_STAMPED',
  },
];

export const RELIC_BY_ID_V7: Readonly<Record<string, RelicSpecV7>> = Object.fromEntries(
  RELIC_CATALOG_V7.map((r) => [r.relicId, r]),
);

export function getRelicSpecV7(relicId: string): RelicSpecV7 | undefined {
  return RELIC_BY_ID_V7[relicId];
}

// ----------------------------------------------------------------------------
// 4. 5-Slot Studio Prop Trunk Validation (<= 2 MULT_DRIVER Law)
// ----------------------------------------------------------------------------

export interface TrunkValidationResultV7 {
  readonly ok: boolean;
  readonly reason?: string;
  readonly totalSlots: number;
  readonly multDriverCount: number;
}

export function validateTrunkLoadoutV7(
  loadout: readonly OwnedRelicV7[],
): TrunkValidationResultV7 {
  if (loadout.length > MAX_TRUNK_SLOTS_V7) {
    return {
      ok: false,
      reason: `Your Studio Prop Trunk holds up to ${MAX_TRUNK_SLOTS_V7} props.`,
      totalSlots: loadout.length,
      multDriverCount: 0,
    };
  }
  const seen = new Set<string>();
  let multDriverCount = 0;
  for (const item of loadout) {
    if (seen.has(item.relicId)) {
      return {
        ok: false,
        reason: 'Each studio prop can only be packed once.',
        totalSlots: loadout.length,
        multDriverCount,
      };
    }
    seen.add(item.relicId);
    const spec = RELIC_BY_ID_V7[item.relicId];
    if (!spec) {
      return {
        ok: false,
        reason: `Unknown studio prop ID: ${item.relicId}.`,
        totalSlots: loadout.length,
        multDriverCount,
      };
    }
    if (spec.slotKind === 'MULT_DRIVER') {
      multDriverCount += 1;
    }
  }
  if (multDriverCount > MAX_MULT_DRIVER_SLOTS_V7) {
    return {
      ok: false,
      reason: `You can pack up to ${MAX_MULT_DRIVER_SLOTS_V7} Multiplier Props at once—swap a Multiplier slot or pick a Dollars Prop.`,
      totalSlots: loadout.length,
      multDriverCount,
    };
  }
  return {
    ok: true,
    totalSlots: loadout.length,
    multDriverCount,
  };
}

// ----------------------------------------------------------------------------
// 5. Pre-Turn Live Waiver & Relic Toy Helper Hooks
// ----------------------------------------------------------------------------

export interface PreTurnRelicAssistV7 {
  readonly autoPruneChoiceIdx: number | null;
  readonly revealFreeShutter: boolean;
  readonly highlightCyanotypeChamfer: boolean;
  readonly showExactRivalEv: boolean;
  readonly exposesPoisonedCanaryInk: boolean;
  readonly spotsCheatChannels: readonly CastProfileV7['cheatChannel'][];
}

export function evaluatePreTurnRelicHooksV7(
  clue: Pick<ClueRecordV7, 'waiverPruneIdx' | 'domain'>,
  turnNumber: number,
  waiver: ContestantWaiverV7 | null,
  equippedRelics: readonly OwnedRelicV7[],
): PreTurnRelicAssistV7 {
  const ids = new Set(equippedRelics.slice(0, MAX_TRUNK_SLOTS_V7).map((r) => r.relicId));
  const autoPrune =
    (waiver?.dayJob === 'NIGHT_FACT_CHECKER' && turnNumber <= 2) ||
    (ids.has('relic_inez_root_scalpel') && turnNumber <= 4);

  const spots: CastProfileV7['cheatChannel'][] = [];
  if (ids.has('relic_toby_copper_shunt')) spots.push('SOLENOID_SPARK');
  if (ids.has('relic_row_c_opera_monocle')) spots.push('ROW_C_GLINT');
  if (ids.has('relic_fresnel_barn_filter')) spots.push('FRESNEL_LAMP');

  return {
    autoPruneChoiceIdx: autoPrune ? clue.waiverPruneIdx : null,
    revealFreeShutter: waiver?.dayJob === 'MONOLOGUE_WRITER',
    highlightCyanotypeChamfer:
      waiver?.dayJob === 'PATENT_CLERK' || ids.has('relic_patent_cyanotype_tube'),
    showExactRivalEv: waiver?.dayJob === 'VEGAS_ACTUARY' || ids.has('relic_isolation_wiretap_coil'),
    exposesPoisonedCanaryInk: ids.has('relic_uv_blacklight_loupe'),
    spotsCheatChannels: spots,
  };
}

// ----------------------------------------------------------------------------
// 6. Piece 3 Bounded 10-Turn Economy (`evaluateTurnEconomyV7`) & $450 Shop Burn
// ----------------------------------------------------------------------------

export interface TurnEconomyInputV7 {
  readonly tile: Pick<
    BoardTileNodeV7,
    | 'baseChips'
    | 'boardMultBonus'
    | 'category'
    | 'domain'
    | 'hasAmberTruce'
    | 'hasUhfHalo'
    | 'isRiggedSolenoid'
    | 'isRivalTarget'
    | 'isWheelhouse'
  >;
  readonly clue: Pick<ClueRecordV7, 'category' | 'domain' | 'difficulty' | 'isKlaxonMyth'>;
  readonly resolution: ToyResolutionV7;
  readonly turnNumber: number; // 1 .. 10
  readonly answerTimeSec: number;
  readonly currentStreak: number;
  readonly playerMatchScore: number;
  readonly rivalMatchScore: number;
  readonly rivalExpectedMatchScore: number;
  readonly rivalRole: CastProfileV7['role'];
  readonly waiver: ContestantWaiverV7 | null;
  readonly equippedRelics: readonly OwnedRelicV7[];
  readonly activeCoupRegime?: CoupRegimeIdV7;
  readonly contrabandTrunkCash?: number;
  readonly grudgeBountyPool?: number;
  readonly claimedDomainsThisMatch?: readonly DomainIdV7[];
  readonly correctCountBeforeTurn?: number;
  readonly pocketedCanaryThisMatch?: boolean;
  readonly activeCanaryTurn?: boolean;
  readonly boothArrestsThisMatch?: number;
  readonly juryBoonChips?: number;
  readonly juryBaneMultPenalty?: number;
  readonly isFinale?: boolean;
  readonly allowFinaleJackpot?: boolean;
}

export interface TurnEconomyBreakdownV7 {
  readonly scored: boolean;
  readonly baseChips: number;
  readonly bonusChips: number;
  readonly foilChips: number;
  readonly totalChips: number;
  readonly baseMult: number;
  readonly boardMult: number;
  readonly waiverMult: number;
  readonly relicMult: number;
  readonly foilMult: number;
  readonly totalMult: number;
  readonly actuaryMultiplier: number;
  readonly rawTurnCash: number;
  readonly turnCashCap: number;
  readonly wasCapped: boolean;
  readonly turnCash: number; // Exact $1 integer >= 0 added on scoring turns
  readonly penaltyCash: number; // Exact $1 integer deducted on Double-or-Nothing miss
  readonly netCashDelta: number; // turnCash - penaltyCash
  readonly cleanSideDividend: number; // Extra clean purse side bonus (e.g. Green-Room Truce Chalk)
  readonly contrabandSideCut: number; // Extra contraband side cut (e.g. Sponsor's Cufflink)
  readonly nextStreak: number;
  readonly triggeredRelicIds: readonly string[];
  readonly summaryNotes: readonly string[];
}

export function evaluateTurnEconomyV7(input: TurnEconomyInputV7): TurnEconomyBreakdownV7 {
  const validTrunk = input.equippedRelics.slice(0, MAX_TRUNK_SLOTS_V7);
  const relicIds = new Set(validTrunk.map((r) => r.relicId));
  const notes: string[] = [];
  const triggeredRelicIds: string[] = [];

  const rivalExpected = Math.max(1200, Math.floor(input.rivalExpectedMatchScore));
  // Finale jackpot unlocks higher mult ceiling when player has banked >= 2 correct answers (0.0% 1/5 fluke guarantee!)
  const finaleJackpotUnlocked =
    Boolean(input.isFinale) &&
    Boolean(input.allowFinaleJackpot) &&
    (input.correctCountBeforeTurn ?? 0) >= 2;
  const maxTotalMultCap = finaleJackpotUnlocked ? 4.5 : 3.5;
  const turnCashCap = Math.max(4500, rivalExpected * 2);

  let effectiveAccuracy = Math.max(0, Math.min(1, input.resolution.accuracyRatio));
  if (
    effectiveAccuracy > 0 &&
    effectiveAccuracy < 1 &&
    relicIds.has('relic_brass_vernier_caliper')
  ) {
    effectiveAccuracy = Math.min(1, effectiveAccuracy + 0.15);
    triggeredRelicIds.push('relic_brass_vernier_caliper');
  }

  const scored = input.resolution.isCorrect || effectiveAccuracy >= 0.35;

  if (!scored) {
    let penaltyCash = 0;
    if (input.waiver?.stageVice === 'DOUBLE_OR_NOTHING') {
      const baseSting = relicIds.has('relic_ribbon_mic_windscreen') ? 50 : 100;
      if (relicIds.has('relic_ribbon_mic_windscreen')) {
        triggeredRelicIds.push('relic_ribbon_mic_windscreen');
      }
      penaltyCash = Math.min(Math.max(0, Math.floor(input.playerMatchScore)), baseSting);
      if (penaltyCash > 0) {
        notes.push(`Double-or-Nothing miss penalty: -$${penaltyCash}`);
      }
    }
    return {
      scored: false,
      baseChips: 0,
      bonusChips: 0,
      foilChips: 0,
      totalChips: 0,
      baseMult: 1,
      boardMult: 0,
      waiverMult: 0,
      relicMult: 0,
      foilMult: 0,
      totalMult: 1,
      actuaryMultiplier: 1,
      rawTurnCash: 0,
      turnCashCap,
      wasCapped: false,
      turnCash: 0,
      penaltyCash,
      netCashDelta: -penaltyCash,
      cleanSideDividend: 0,
      contrabandSideCut: 0,
      nextStreak: 0,
      triggeredRelicIds,
      summaryNotes: notes,
    };
  }

  const nextStreak =
    input.resolution.isCorrect ||
    (effectiveAccuracy >= 0.5 && relicIds.has('relic_carmen_tourniquet'))
      ? input.currentStreak + 1
      : 0;

  if (
    !input.resolution.isCorrect &&
    effectiveAccuracy >= 0.5 &&
    relicIds.has('relic_carmen_tourniquet')
  ) {
    triggeredRelicIds.push('relic_carmen_tourniquet');
    notes.push('Carmen’s Night-Shift Strap saved your streak on a close call');
  }

  const clampedToyMult = Math.max(0.25, Math.min(2.25, input.resolution.chipMultiplier));
  const baseChips = Math.max(
    25,
    Math.round(input.tile.baseChips * effectiveAccuracy * clampedToyMult),
  );

  let bonusChips = 0;
  let foilChips = 0;
  let waiverMult = 0;
  let relicMult = 0;
  let foilMult = 0;
  let cleanSideDividend = 0;
  let contrabandSideCut = 0;
  let taxStampedDividend = 0;

  // Waiver DayJob live bonuses
  if (input.waiver) {
    if (input.waiver.dayJob === 'PATENT_CLERK' && input.clue.domain === 'SCI_TECH') {
      const add = Math.round(input.tile.baseChips * 0.2);
      bonusChips += add;
      notes.push(`Patent Clerk +$${add}`);
    } else if (input.waiver.dayJob === 'MONOLOGUE_WRITER' && input.clue.domain === 'POP_LIT') {
      const add = Math.round(input.tile.baseChips * 0.2);
      bonusChips += add;
      notes.push(`Monologue Writer +$${add}`);
    } else if (input.waiver.dayJob === 'NIGHT_FACT_CHECKER' && input.turnNumber <= 2) {
      bonusChips += 25;
      notes.push('Fact-Checker Bonus +$25');
    }

    // Waiver StageVice live bonuses
    if (input.waiver.stageVice === 'DOUBLE_OR_NOTHING' && nextStreak >= 2) {
      waiverMult += 0.45;
      notes.push('Double or Nothing +0.45×');
    } else if (input.waiver.stageVice === 'KNOW_IT_ALL' && input.answerTimeSec <= 4.5) {
      bonusChips += 60;
      notes.push('Quick Buzzer +$60');
    } else if (
      input.waiver.stageVice === 'SCOREBOARD_GRUDGE' &&
      input.playerMatchScore < input.rivalMatchScore
    ) {
      waiverMult += 0.5;
      notes.push('Comeback Boost +0.50×');
    }
  }

  // Board Mult (capped 2.0x cold / 3.0x streaking total board contribution)
  const rawBoardBonus =
    Math.max(0, input.tile.boardMultBonus) +
    (input.tile.hasAmberTruce ? 0.35 : 0) +
    (input.tile.isWheelhouse ? 0.5 : 0) +
    (input.tile.hasUhfHalo ? 0.2 : 0);
  const maxBoardBonus = nextStreak >= 2 ? 2.0 : 1.0;
  const boardMult = Math.min(maxBoardBonus, rawBoardBonus);
  if (input.tile.isWheelhouse) notes.push('Champion Weak Spot +0.50×');
  if (input.tile.hasAmberTruce) notes.push('Studio Truce Bonus +0.35×');

  // VIP Jury Boon / Bane
  if ((input.juryBoonChips ?? 0) > 0) {
    bonusChips += Math.floor(input.juryBoonChips ?? 0);
    notes.push(`VIP Balcony Cheer +$${Math.floor(input.juryBoonChips ?? 0)}`);
  }

  // Active Relics (strictly <= 2 MULT_DRIVER slots evaluated!)
  let multDriversUsed = 0;
  const contrabandCash = input.contrabandTrunkCash ?? 0;
  const grudgeCash = input.grudgeBountyPool ?? 0;

  for (const owned of validTrunk) {
    const spec = RELIC_BY_ID_V7[owned.relicId];
    if (!spec) continue;

    const canFireMult =
      spec.slotKind !== 'MULT_DRIVER' || multDriversUsed < MAX_MULT_DRIVER_SLOTS_V7;
    if (spec.slotKind === 'MULT_DRIVER' && canFireMult) {
      multDriversUsed += 1;
    }

    let fired = false;

    switch (spec.relicId) {
      case 'relic_vera_audit_ledger':
        if (canFireMult && contrabandCash === 0) {
          relicMult += input.activeCoupRegime === 'REGIME_C_VERA_FORENSIC' ? 0.5 : 0.35;
          fired = true;
        }
        break;
      case 'relic_inez_root_scalpel':
        if (input.clue.domain === 'POP_LIT' || input.clue.domain === 'HIST_FACT') {
          bonusChips += 65;
          fired = true;
        }
        break;
      case 'relic_carmen_tourniquet':
        if (
          input.clue.domain === 'SCI_TECH' ||
          input.playerMatchScore < input.rivalMatchScore
        ) {
          bonusChips += 70;
          fired = true;
        }
        break;
      case 'relic_solari_overdrive':
        if (canFireMult && nextStreak >= 2) {
          relicMult += nextStreak >= 4 ? 0.55 : 0.4;
          fired = true;
        }
        break;
      case 'relic_amber_chalk_holder':
        if (canFireMult && input.tile.hasAmberTruce) {
          relicMult += 0.35;
          cleanSideDividend += 45;
          fired = true;
        }
        break;
      case 'relic_weston_peak_limiter':
        if (input.answerTimeSec <= 6.0) {
          bonusChips += 75;
          fired = true;
        }
        break;
      case 'relic_brass_vernier_caliper':
        if (input.clue.domain === 'NUM_GEO') {
          bonusChips += 85;
          fired = true;
        }
        break;
      case 'relic_chronometer_escapement':
        if (canFireMult && input.turnNumber >= 7) {
          relicMult += 0.45;
          fired = true;
        }
        break;
      case 'relic_patent_cyanotype_tube':
        if (input.clue.domain === 'SCI_TECH') {
          bonusChips += 80;
          fired = true;
        }
        break;
      case 'relic_studio_b_on_air_prism':
        if (canFireMult && input.tile.isWheelhouse) {
          relicMult += 0.4;
          fired = true;
        }
        break;
      case 'relic_goodson_cue_bell':
        if (
          input.turnNumber === 1 ||
          input.turnNumber === 2 ||
          input.turnNumber === 5 ||
          input.turnNumber === 6
        ) {
          bonusChips += 95;
          fired = true;
        }
        break;
      case 'relic_subpoena_wax_signet':
        if ((input.boothArrestsThisMatch ?? 0) > 0) {
          bonusChips += 60 * Math.min(3, input.boothArrestsThisMatch ?? 0);
          fired = true;
        }
        break;
      case 'relic_ribbon_mic_windscreen':
        if (input.clue.domain === 'POP_LIT') {
          bonusChips += 70;
          fired = true;
        }
        break;
      case 'relic_world_fair_astrolabe': {
        const domainSet = new Set<DomainIdV7>(input.claimedDomainsThisMatch ?? []);
        domainSet.add(input.tile.domain);
        bonusChips += Math.min(120, domainSet.size * 30);
        fired = true;
        break;
      }
      case 'relic_bakelite_tally_counter': {
        const count = (input.correctCountBeforeTurn ?? 0) + 1;
        bonusChips += Math.min(125, count * 25);
        fired = true;
        break;
      }
      case 'relic_sovereign_plumb_bob':
        if (canFireMult && input.clue.difficulty >= 4) {
          relicMult += 0.45;
          fired = true;
        }
        break;
      case 'relic_toby_copper_shunt':
        if (input.tile.isRiggedSolenoid) {
          bonusChips += 110;
          fired = true;
        }
        break;
      case 'relic_uv_blacklight_loupe':
        if (input.activeCanaryTurn) {
          bonusChips += 75;
          fired = true;
        }
        break;
      case 'relic_channel_83_crystal':
        if (canFireMult) {
          const boosted =
            input.tile.hasUhfHalo || input.activeCoupRegime === 'REGIME_B_BELLAMY_UHF';
          relicMult += boosted ? 0.5 : 0.2;
          fired = true;
        }
        break;
      case 'relic_roz_velvet_cufflink':
        if (
          canFireMult &&
          (input.pocketedCanaryThisMatch || input.activeCoupRegime === 'REGIME_A_ROZ_PHARMA')
        ) {
          relicMult += input.pocketedCanaryThisMatch ? 0.45 : 0.2;
          contrabandSideCut += 35;
          fired = true;
        }
        break;
      case 'relic_monte_carlo_loaded_shoe':
        if (canFireMult && input.resolution.chipMultiplier > 1.0) {
          relicMult += 0.45;
          fired = true;
        }
        break;
      case 'relic_row_c_opera_monocle':
        if (input.tile.isRivalTarget) {
          bonusChips += 90;
          fired = true;
        }
        break;
      case 'relic_larson_pattern_rom':
        if (input.tile.baseChips >= 300) {
          bonusChips += 95;
          fired = true;
        }
        break;
      case 'relic_fresnel_barn_filter':
        if (input.rivalRole === 'RIVAL_HEEL') {
          bonusChips += 85;
          fired = true;
        }
        break;
      case 'relic_atlantic_tilt_plumb':
        if (input.clue.isKlaxonMyth && !input.resolution.triggeredKlaxon) {
          bonusChips += 115;
          fired = true;
        }
        break;
      case 'relic_vaudeville_sleeve_ace':
        if (canFireMult && input.rivalMatchScore - input.playerMatchScore >= 200) {
          relicMult += 0.5;
          fired = true;
        }
        break;
      case 'relic_isolation_wiretap_coil':
        if (input.clue.domain === 'HIST_FACT' || input.clue.domain === 'NUM_GEO') {
          bonusChips += 80;
          fired = true;
        }
        break;
      case 'relic_dirty_marker_ledger': {
        const stacks = Math.floor((contrabandCash + grudgeCash) / 500);
        if (stacks > 0) {
          bonusChips += Math.min(125, stacks * 25);
          fired = true;
        }
        break;
      }
    }

    if (fired && !triggeredRelicIds.includes(spec.relicId)) {
      triggeredRelicIds.push(spec.relicId);
    }

    // 4 Foil live bonuses
    if (owned.foil === 'GILDED') {
      foilChips += 18;
    } else if (owned.foil === 'SILVER_HALIDE' && input.answerTimeSec <= 7.0) {
      foilMult += 0.08;
    } else if (
      owned.foil === 'DICHROIC' &&
      (input.tile.isWheelhouse || input.tile.hasUhfHalo)
    ) {
      foilMult += 0.07;
    } else if (owned.foil === 'TAX_STAMPED') {
      taxStampedDividend += 25;
    }
  }

  // Season 3 Coup Regime global board/economy flavor
  let regimeMult = 0;
  if (input.activeCoupRegime === 'REGIME_A_ROZ_PHARMA' && input.pocketedCanaryThisMatch) {
    regimeMult += 0.15;
  } else if (input.activeCoupRegime === 'REGIME_B_BELLAMY_UHF' && input.tile.hasUhfHalo) {
    regimeMult += 0.2;
  } else if (input.activeCoupRegime === 'REGIME_C_VERA_FORENSIC' && contrabandCash === 0) {
    regimeMult += 0.15;
  }

  if (
    input.waiver?.dayJob === 'VEGAS_ACTUARY' &&
    input.resolution.chipMultiplier > 1.0
  ) {
    const actuaryAdd = Math.round(baseChips * 0.15);
    bonusChips += actuaryAdd;
    notes.push(`Vegas Actuary +$${actuaryAdd}`);
  }
  if (taxStampedDividend > 0) {
    foilChips += taxStampedDividend;
  }

  const banePenalty = Math.max(0, Math.min(0.35, input.juryBaneMultPenalty ?? 0));
  const totalChips = Math.max(
    25,
    Math.min(finaleJackpotUnlocked ? 1150 : 900, baseChips + bonusChips + foilChips),
  );
  const totalMult = Number(
    Math.min(
      maxTotalMultCap,
      Math.max(
        1.0,
        1.0 + boardMult + waiverMult + relicMult + foilMult + regimeMult - banePenalty,
      ),
    ).toFixed(2),
  );

  const actuaryMultiplier = 1.0;

  // 100% Honest Split-Flap Equation: totalChips × totalMult === turnCash to the dollar!
  const rawTurnCash = Math.round(totalChips * totalMult);
  const wasCapped = false;
  const turnCash = Math.max(0, rawTurnCash);

  return {
    scored: true,
    baseChips,
    bonusChips,
    foilChips,
    totalChips,
    baseMult: 1,
    boardMult: Number(boardMult.toFixed(2)),
    waiverMult: Number((waiverMult + regimeMult - banePenalty).toFixed(2)),
    relicMult: Number(relicMult.toFixed(2)),
    foilMult: Number(foilMult.toFixed(2)),
    totalMult,
    actuaryMultiplier,
    rawTurnCash,
    turnCashCap,
    wasCapped,
    turnCash,
    penaltyCash: 0,
    netCashDelta: turnCash,
    cleanSideDividend,
    contrabandSideCut,
    nextStreak,
    triggeredRelicIds,
    summaryNotes: notes,
  };
}

/** $450 Mid-Match Live Score-Burn Shop Buy (*Sale of the Century* live match lead bargain!). */
export interface LiveScoreBurnResultV7 {
  readonly ok: boolean;
  readonly reason?: string;
  readonly nextPlayerMatchScore: number;
  readonly nextEquippedRelics: OwnedRelicV7[];
  readonly costBurned: number;
}

export function executeLiveScoreBurnBuyV7(
  playerMatchScore: number,
  equippedRelics: readonly OwnedRelicV7[],
  relicId: string,
  foilOverride?: FoilFinishV7,
  replaceSlotIdx?: number,
): LiveScoreBurnResultV7 {
  const spec = RELIC_BY_ID_V7[relicId];
  if (!spec) {
    return {
      ok: false,
      reason: 'Selected prop is not in the Studio 6A Prop Shop.',
      nextPlayerMatchScore: playerMatchScore,
      nextEquippedRelics: [...equippedRelics],
      costBurned: 0,
    };
  }
  if (Math.floor(playerMatchScore) < LIVE_SCORE_BURN_SHOP_COST_V7) {
    return {
      ok: false,
      reason: `Need at least $${LIVE_SCORE_BURN_SHOP_COST_V7} on your live scoreboard to trade for a prop.`,
      nextPlayerMatchScore: playerMatchScore,
      nextEquippedRelics: [...equippedRelics],
      costBurned: 0,
    };
  }

  const nextOwned: OwnedRelicV7 = {
    relicId: spec.relicId,
    foil: foilOverride ?? spec.defaultFoil,
  };
  const candidate = [...equippedRelics];
  if (
    typeof replaceSlotIdx === 'number' &&
    replaceSlotIdx >= 0 &&
    replaceSlotIdx < candidate.length
  ) {
    candidate[replaceSlotIdx] = nextOwned;
  } else if (candidate.length < MAX_TRUNK_SLOTS_V7) {
    candidate.push(nextOwned);
  } else {
    return {
      ok: false,
      reason: 'All 5 Studio Trunk slots are full—unequip a prop first to make room.',
      nextPlayerMatchScore: playerMatchScore,
      nextEquippedRelics: [...equippedRelics],
      costBurned: 0,
    };
  }

  const check = validateTrunkLoadoutV7(candidate);
  if (!check.ok) {
    return {
      ok: false,
      reason: check.reason,
      nextPlayerMatchScore: playerMatchScore,
      nextEquippedRelics: [...equippedRelics],
      costBurned: 0,
    };
  }

  return {
    ok: true,
    nextPlayerMatchScore: Math.floor(playerMatchScore) - LIVE_SCORE_BURN_SHOP_COST_V7,
    nextEquippedRelics: candidate,
    costBurned: LIVE_SCORE_BURN_SHOP_COST_V7,
  };
}
