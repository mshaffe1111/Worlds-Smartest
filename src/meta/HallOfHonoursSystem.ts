// ============================================================================
// WORLD'S SMARTEST — Hall of Honours System (`#166` §2.2)
//  • 64 Distinct Trophies & Medals across 5 Rarity Tiers:
//      - Tier 1: EASY (Initiate Bronze — 14 medals)
//      - Tier 2: MEDIUM (Envoy Sterling — 14 medals)
//      - Tier 3: HARD (Consul 24K Gold — 14 medals/trophies)
//      - Tier 4: VERY RARE (Arbiter Smoked Sapphire — 12 trophies)
//      - Tier 5: EXTREMELY RARE (Mythic Celestial Diamond 0.1% Feats — 10 trophies)
//  • 32 Equippable Gameplay Unlockables (100% Zero Pay-to-Win):
//      - 12 PBR 3D Veritas Prism Material Finishes (`PrismAtelierView`)
//      - 12 Diplomatic Broadcast Titles (`PassportSystem` + HUD)
//      - 8 Chrono-Ring & HUD Accent Themes (`localStorage` + CSS vars)
// ============================================================================

import type { InkBlackboard, PassportStateSnapshot, PassportSystem } from '../narrative';
import type { CareerAnalyticsState, CareerAnalyticsStore } from './CareerAnalyticsStore';
import {
  grantAtelierFinishUnlock,
  type PrismFinishId,
} from './PrismAtelierView';

export type HonourRarityTier =
  | 'TIER_1_EASY'
  | 'TIER_2_MEDIUM'
  | 'TIER_3_HARD'
  | 'TIER_4_VERY_RARE'
  | 'TIER_5_MYTHIC';

export type HonourAspectCategory =
  | 'PRISM_OVERCLOCK'
  | 'STREAK_SPEED'
  | 'CAMPAIGN_LORE'
  | 'MODES_TRIALS'
  | 'DOMAINS_POLYMATH';

export type MedalEmblemKey =
  | 'medal_tier1_bronze'
  | 'medal_tier2_sterling'
  | 'medal_tier3_gold'
  | 'medal_tier4_sapphire'
  | 'medal_tier5_mythic'
  | 'trophy_streak_chronometer'
  | 'trophy_overclock_roulette'
  | 'trophy_polymath_globe';

export type HudAccentThemeId =
  | 'GENEVA_CHAMPAGNE_24K'
  | 'SOVEREIGN_PLATINUM_IVORY'
  | 'HORIZON_ELECTRIC_CYAN'
  | 'AGORA_BOTANICAL_EMERALD'
  | 'TOKYO_VERMILION_EMBER'
  | 'CAIRO_SOLAR_AMBER'
  | 'REYKJAVIK_BOREALIS_VIOLET'
  | 'MYTHIC_PRISMATIC_DIAMOND';

export interface HudAccentThemeSpec {
  id: HudAccentThemeId;
  order: number;
  name: string;
  primaryHex: string;
  secondaryHex: string;
  ringGlowRgba: string;
  unlockRequirement: string;
}

export interface BroadcastTitleSpec {
  id: string;
  order: number;
  title: string;
  unlockRequirement: string;
}

export interface HonourRewardGrant {
  prismFinishId?: PrismFinishId;
  broadcastTitle?: string;
  hudThemeId?: HudAccentThemeId;
  rewardLabel: string;
}

export interface HonourEvaluationContext {
  analytics: CareerAnalyticsState;
  passport: PassportStateSnapshot;
  blackboard: ReturnType<InkBlackboard['getSnapshot']> | null;
}

export interface HonourDefinition {
  id: string;
  number: number; // 1..64
  title: string;
  description: string;
  tier: HonourRarityTier;
  aspect: HonourAspectCategory;
  emblemKey: MedalEmblemKey;
  target: number;
  measure: (ctx: HonourEvaluationContext) => number;
  reward?: HonourRewardGrant;
}

export interface HonourProgressItem {
  def: HonourDefinition;
  unlocked: boolean;
  unlockedAtIso: string | null;
  current: number;
  target: number;
  ratio: number;
  emblemPngUrl: string;
  emblemFallbackDataUri: string;
}

const HONOURS_STORAGE_KEY = 'ws_hall_of_honours_v1';
const HUD_THEME_EQUIPPED_KEY = 'ws_equipped_hud_theme_v1';
const HUD_THEME_UNLOCKED_KEY = 'ws_unlocked_hud_themes_v1';

export const RARITY_TIER_META: Record<
  HonourRarityTier,
  { label: string; shortLabel: string; rarityPct: string; colorHex: string; bgRgba: string }
> = {
  TIER_1_EASY: {
    label: 'Tier 1 · Initiate Bronze',
    shortLabel: 'Initiate Bronze',
    rarityPct: 'Common',
    colorHex: '#e09b63',
    bgRgba: 'rgba(224, 155, 99, 0.15)',
  },
  TIER_2_MEDIUM: {
    label: 'Tier 2 · Envoy Sterling',
    shortLabel: 'Envoy Sterling',
    rarityPct: 'Uncommon',
    colorHex: '#cfdceb',
    bgRgba: 'rgba(207, 220, 235, 0.15)',
  },
  TIER_3_HARD: {
    label: 'Tier 3 · Consul 24K Gold',
    shortLabel: 'Consul 24K Gold',
    rarityPct: 'Rare',
    colorHex: '#f2cf7e',
    bgRgba: 'rgba(242, 207, 126, 0.16)',
  },
  TIER_4_VERY_RARE: {
    label: 'Tier 4 · Arbiter Sapphire',
    shortLabel: 'Arbiter Sapphire',
    rarityPct: 'Very Rare (2.5%)',
    colorHex: '#56d4f5',
    bgRgba: 'rgba(86, 212, 245, 0.16)',
  },
  TIER_5_MYTHIC: {
    label: 'Tier 5 · Mythic Celestial Diamond',
    shortLabel: 'Mythic 0.1%',
    rarityPct: 'Mythic (0.1%)',
    colorHex: '#c79bff',
    bgRgba: 'rgba(199, 155, 255, 0.18)',
  },
};

/**
 * 12 Equippable Diplomatic Broadcast Titles (`#166` §2.2).
 */
export const BROADCAST_TITLES_CATALOG: readonly BroadcastTitleSpec[] = [
  { id: 'bt_01', order: 1, title: 'MERIDIAN CANDIDATE', unlockRequirement: 'Default Geneva Summons Title' },
  { id: 'bt_02', order: 2, title: 'GENEVA CHARTER INITIATE', unlockRequirement: 'Tier 1: First Sightline Lock' },
  { id: 'bt_03', order: 3, title: 'COLD INSTINCT SPECIALIST', unlockRequirement: 'Tier 2: 10 Unpeeled 3.0x Tier-1 Locks' },
  { id: 'bt_04', order: 4, title: 'CONVICTION HIGH-ROLLER', unlockRequirement: 'Tier 2: First 6.0x Max Overclock Win' },
  { id: 'bt_05', order: 5, title: 'FORENSIC TELL READER', unlockRequirement: 'Tier 2: Catch a Rival Bluff (⚡ CALL BLUFF)' },
  { id: 'bt_06', order: 6, title: 'ARCHIVE VAULT DELVER', unlockRequirement: 'Tier 2: Reach Archive Descent Depth 15' },
  { id: 'bt_07', order: 7, title: 'CONSUL OF THE TWELVE', unlockRequirement: 'Tier 3: Reach 1,500 ELO in Any Domain' },
  { id: 'bt_08', order: 8, title: 'BLACK SALON SHARK', unlockRequirement: 'Tier 3: Win a 3D Kinetic Ghost Duel' },
  { id: 'bt_09', order: 9, title: 'RELIC ARCHIVIST SUPREME', unlockRequirement: 'Tier 3: Unlock 4 Country Boss Relics' },
  { id: 'bt_10', order: 10, title: 'FIRST CITIZEN ARBITER', unlockRequirement: 'Tier 4: Complete The Meridian Circuit Campaign' },
  { id: 'bt_11', order: 11, title: 'UNPEELED SOVEREIGN', unlockRequirement: 'Tier 5 Mythic: Win a Boss Showdown with 0 Peels' },
  { id: 'bt_12', order: 12, title: 'POLYMATH SUPREME', unlockRequirement: 'Tier 5 Mythic: 1,850+ ELO Across All 12 Domains' },
];

/**
 * 8 Equippable Chrono-Ring & HUD Accent Themes (`#166` §2.2).
 */
export const HUD_ACCENT_THEMES: readonly HudAccentThemeSpec[] = [
  {
    id: 'GENEVA_CHAMPAGNE_24K',
    order: 1,
    name: 'Geneva 24K Champagne Gold',
    primaryHex: '#f2cf7e',
    secondaryHex: '#d8af57',
    ringGlowRgba: 'rgba(242, 207, 126, 0.36)',
    unlockRequirement: 'Default Geneva Issue',
  },
  {
    id: 'SOVEREIGN_PLATINUM_IVORY',
    order: 2,
    name: 'Sovereign Platinum & Ivory',
    primaryHex: '#eae6dc',
    secondaryHex: '#b8c4d4',
    ringGlowRgba: 'rgba(234, 230, 220, 0.34)',
    unlockRequirement: 'Tier 1: Stamp Diplomatic Passport',
  },
  {
    id: 'HORIZON_ELECTRIC_CYAN',
    order: 3,
    name: 'Horizon Telemetry Cyan',
    primaryHex: '#64e6ff',
    secondaryHex: '#35a7db',
    ringGlowRgba: 'rgba(100, 230, 255, 0.36)',
    unlockRequirement: 'Tier 1: Pledge World Council Faction',
  },
  {
    id: 'AGORA_BOTANICAL_EMERALD',
    order: 4,
    name: 'Agora Emerald Commons',
    primaryHex: '#52eba8',
    secondaryHex: '#28b87a',
    ringGlowRgba: 'rgba(82, 235, 168, 0.35)',
    unlockRequirement: 'Tier 2: 25 Lifetime Correct Answers',
  },
  {
    id: 'TOKYO_VERMILION_EMBER',
    order: 5,
    name: 'Shinkansen Vermilion & Gold',
    primaryHex: '#ff9d5c',
    secondaryHex: '#e05263',
    ringGlowRgba: 'rgba(255, 157, 92, 0.36)',
    unlockRequirement: 'Tier 2: Clear Act I (London & Tokyo)',
  },
  {
    id: 'CAIRO_SOLAR_AMBER',
    order: 6,
    name: 'Meridian Zero Solar Amber',
    primaryHex: '#ffcf56',
    secondaryHex: '#d98a2b',
    ringGlowRgba: 'rgba(255, 207, 86, 0.38)',
    unlockRequirement: 'Tier 3: Reach Archive Depth 50',
  },
  {
    id: 'REYKJAVIK_BOREALIS_VIOLET',
    order: 7,
    name: 'Caldera Borealis Violet-Teal',
    primaryHex: '#b494ff',
    secondaryHex: '#5ce1e6',
    ringGlowRgba: 'rgba(180, 148, 255, 0.38)',
    unlockRequirement: 'Tier 4: 1,750+ ELO Across 6 Domains',
  },
  {
    id: 'MYTHIC_PRISMATIC_DIAMOND',
    order: 8,
    name: 'Mythic Celestial White-Diamond',
    primaryHex: '#fff8e7',
    secondaryHex: '#9ef2ff',
    ringGlowRgba: 'rgba(255, 248, 231, 0.44)',
    unlockRequirement: 'Tier 5 Mythic: Lightning Savant (10× <3s Streak)',
  },
];

export function getUnlockedHudThemeIds(): HudAccentThemeId[] {
  const base: HudAccentThemeId[] = ['GENEVA_CHAMPAGNE_24K'];
  try {
    if (typeof localStorage === 'undefined') return base;
    const raw = localStorage.getItem(HUD_THEME_UNLOCKED_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return base;
    for (const item of parsed) {
      if (HUD_ACCENT_THEMES.some((t) => t.id === item) && !base.includes(item as HudAccentThemeId)) {
        base.push(item as HudAccentThemeId);
      }
    }
  } catch {
    // Ignore
  }
  return base;
}

export function grantHudThemeUnlock(id: HudAccentThemeId): boolean {
  const curr = getUnlockedHudThemeIds();
  if (curr.includes(id)) return false;
  curr.push(id);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(HUD_THEME_UNLOCKED_KEY, JSON.stringify(curr));
    }
  } catch {
    // Ignore
  }
  return true;
}

export function getEquippedHudTheme(): HudAccentThemeSpec {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(HUD_THEME_EQUIPPED_KEY);
      const found = HUD_ACCENT_THEMES.find((t) => t.id === saved);
      if (found) return found;
    }
  } catch {
    // Ignore
  }
  return HUD_ACCENT_THEMES[0];
}

export function equipHudAccentTheme(id: HudAccentThemeId): HudAccentThemeSpec {
  const spec = HUD_ACCENT_THEMES.find((t) => t.id === id) ?? HUD_ACCENT_THEMES[0];
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(HUD_THEME_EQUIPPED_KEY, spec.id);
    }
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--gold-bright', spec.primaryHex);
      root.style.setProperty('--gold-24k', spec.secondaryHex);
      root.style.setProperty('--gold-glow', spec.ringGlowRgba);
      root.style.setProperty('--ws-chrono-accent', spec.primaryHex);
    }
  } catch {
    // Ignore
  }
  return spec;
}

/**
 * Generates a crisp luxury horological SVG data-URI fallback for `./assets/medals/<key>.png`
 * so `0` broken images ever occur while PNGs stream or build.
 */
export function getMedalFallbackDataUri(key: MedalEmblemKey): string {
  const palette: Record<MedalEmblemKey, { c1: string; c2: string; rim: string; ribbon: string; glyph: string }> = {
    medal_tier1_bronze: {
      c1: '#f0b67f',
      c2: '#8c4f27',
      rim: '#ffd5ab',
      ribbon: '#9e2638',
      glyph: '<polygon points="48,28 53,40 66,41 56,50 59,63 48,56 37,63 40,50 30,41 43,40" fill="#ffd5ab"/>',
    },
    medal_tier2_sterling: {
      c1: '#f2f7fc',
      c2: '#6e8299',
      rim: '#ffffff',
      ribbon: '#1f4478',
      glyph: '<polygon points="48,26 55,40 70,42 59,52 62,67 48,59 34,67 37,52 26,42 41,40" fill="#ffffff"/>',
    },
    medal_tier3_gold: {
      c1: '#fff0ad',
      c2: '#b38124',
      rim: '#fff8d6',
      ribbon: '#166347',
      glyph: '<polygon points="48,24 54,39 70,39 57,49 62,65 48,55 34,65 39,49 26,39 42,39" fill="#39d49a"/>',
    },
    medal_tier4_sapphire: {
      c1: '#8ce6ff',
      c2: '#1a498a',
      rim: '#dff8ff',
      ribbon: '#2a2259',
      glyph: '<polygon points="48,23 60,46 48,69 36,46" fill="#dff8ff"/>',
    },
    medal_tier5_mythic: {
      c1: '#fff8eb',
      c2: '#7a52cc',
      rim: '#ffe89e',
      ribbon: '#401b6b',
      glyph: '<polygon points="48,22 63,46 48,70 33,46" fill="#fffdf7"/><circle cx="48" cy="46" r="6" fill="#f2cf7e"/>',
    },
    trophy_streak_chronometer: {
      c1: '#ffe799',
      c2: '#9e6c1c',
      rim: '#fff6cf',
      ribbon: '#7d2029',
      glyph: '<circle cx="48" cy="46" r="14" fill="none" stroke="#fff6cf" stroke-width="3"/><path d="M48,46 L48,36 M48,46 L56,49" stroke="#fff6cf" stroke-width="2.6" stroke-linecap="round"/>',
    },
    trophy_overclock_roulette: {
      c1: '#ffb86b',
      c2: '#9e2638',
      rim: '#ffe699',
      ribbon: '#591624',
      glyph: '<path d="M51,26 L37,48 L48,48 L45,68 L61,44 L49,44 Z" fill="#fff6cf"/>',
    },
    trophy_polymath_globe: {
      c1: '#9ef5d8',
      c2: '#1b6b5c',
      rim: '#ffe89e',
      ribbon: '#17455e',
      glyph: '<circle cx="48" cy="46" r="14" fill="none" stroke="#fff6cf" stroke-width="2.2"/><ellipse cx="48" cy="46" rx="7" ry="14" fill="none" stroke="#fff6cf" stroke-width="1.8"/><line x1="34" y1="46" x2="62" y2="46" stroke="#fff6cf" stroke-width="1.8"/>',
    },
  };

  const p = palette[key];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="mg_${key}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${p.c1}"/>
        <stop offset="100%" stop-color="${p.c2}"/>
      </linearGradient>
    </defs>
    <polygon points="34,6 62,6 56,30 40,30" fill="${p.ribbon}" stroke="${p.rim}" stroke-width="1.2"/>
    <circle cx="48" cy="48" r="30" fill="url(#mg_${key})" stroke="${p.rim}" stroke-width="2.6"/>
    <circle cx="48" cy="48" r="24" fill="rgba(8,11,18,0.42)" stroke="${p.rim}" stroke-width="1" stroke-dasharray="3 2"/>
    ${p.glyph}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function clearedVisasCount(p: PassportStateSnapshot): number {
  return Object.values(p.visas).filter((v) => v.cleared).length;
}

function unlockedRelicsTotal(ctx: HonourEvaluationContext): number {
  const set = new Set<string>([
    ...ctx.passport.unlockedRelics,
    ...(ctx.blackboard?.unlockedRelics ?? []),
  ]);
  for (const v of Object.values(ctx.passport.visas)) {
    if (v.cleared || v.relicUnlocked) set.add(v.relicId);
  }
  return set.size;
}

function maxDomainEloOf(ctx: HonourEvaluationContext): number {
  let m = 1200;
  for (let i = 0; i < 12; i++) {
    m = Math.max(m, ctx.analytics.byDomain[i]?.peakElo ?? 1200, ctx.passport.domainElo[i] ?? 1200);
  }
  return m;
}

function countDomainsAboveElo(ctx: HonourEvaluationContext, threshold: number): number {
  let cnt = 0;
  for (let i = 0; i < 12; i++) {
    const elo = Math.max(ctx.analytics.byDomain[i]?.peakElo ?? 1200, ctx.passport.domainElo[i] ?? 1200);
    if (elo >= threshold) cnt += 1;
  }
  return cnt;
}

/**
 * Canonical 64 Trophies & Medals (`14 + 14 + 14 + 12 + 10 = 64` across 5 Rarity Tiers).
 */
export const HALL_OF_HONOURS_CATALOG: readonly HonourDefinition[] = [
  // ================= TIER 1 — EASY (Initiate Bronze, 14) =================
  {
    id: 't1_first_lock',
    number: 1,
    title: 'First Sightline Lock',
    description: 'Solve your first Veritas Prism question in any mode.',
    tier: 'TIER_1_EASY',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier1_bronze',
    target: 1,
    measure: (c) => c.analytics.totalRight,
    reward: { broadcastTitle: 'GENEVA CHARTER INITIATE', rewardLabel: 'Title: GENEVA CHARTER INITIATE' },
  },
  {
    id: 't1_first_peel',
    number: 2,
    title: 'Horological Curiosity',
    description: 'Peel open the Brass Crown to solve a question using the Clue or Blueprint Core.',
    tier: 'TIER_1_EASY',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier1_bronze',
    target: 1,
    measure: (c) => c.analytics.byPeelTier['2'].right + c.analytics.byPeelTier['3'].right,
  },
  {
    id: 't1_first_overclock',
    number: 3,
    title: 'Conviction Spark',
    description: 'Hold-to-Overclock and win your first confidence wager.',
    tier: 'TIER_1_EASY',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier1_bronze',
    target: 1,
    measure: (c) => c.analytics.overclock.overclockWins,
  },
  {
    id: 't1_passport_stamp',
    number: 4,
    title: 'Credentials Registered',
    description: 'Register your Challenger Name or stamp your Meridian Diplomatic Passport.',
    tier: 'TIER_1_EASY',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier1_bronze',
    target: 1,
    measure: (c) => (c.analytics.feats.passportStamped || c.passport.hasCustomName || c.passport.persona ? 1 : 0),
    reward: { hudThemeId: 'SOVEREIGN_PLATINUM_IVORY', rewardLabel: 'HUD Theme: Sovereign Platinum & Ivory' },
  },
  {
    id: 't1_geneva_cleared',
    number: 5,
    title: 'Vetting Chamber Cleared',
    description: 'Complete Julian Vance’s 4-Question Geneva Vetting Prologue.',
    tier: 'TIER_1_EASY',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier1_bronze',
    target: 1,
    measure: (c) => (c.analytics.feats.prologueCleared || c.passport.visas.ch?.cleared ? 1 : 0),
    reward: { prismFinishId: 'DAMASCUS_STEEL_AMBER', rewardLabel: 'Prism Finish: Damascus Steel & Amber' },
  },
  {
    id: 't1_first_daily',
    number: 6,
    title: 'World Broadcast Debut',
    description: 'Complete your first synchronized 00:00 UTC Daily Global Feed.',
    tier: 'TIER_1_EASY',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier1_bronze',
    target: 1,
    measure: (c) => Math.max(c.analytics.feats.dailyBroadcastsCompleted, c.passport.dailyHistory.length),
  },
  {
    id: 't1_first_briefing',
    number: 7,
    title: 'Briefing Room Calibrated',
    description: 'Solve 5 calibration questions in Nadia’s Briefing Room.',
    tier: 'TIER_1_EASY',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier1_bronze',
    target: 5,
    measure: (c) => c.analytics.byMode.BRIEFING.right,
  },
  {
    id: 't1_first_endless',
    number: 8,
    title: 'First Extraction Airlock',
    description: 'Reach Depth 5 (First Airlock) or solve 5 Prisms in The Archive Descent.',
    tier: 'TIER_1_EASY',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier1_bronze',
    target: 5,
    measure: (c) => Math.max(c.analytics.feats.maxEndlessDepth, c.analytics.byMode.ENDLESS.right),
  },
  {
    id: 't1_first_trials',
    number: 9,
    title: 'Kinetic Ghost Contender',
    description: 'Solve 5 Prisms in World Council Async Ghost Trials.',
    tier: 'TIER_1_EASY',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier1_bronze',
    target: 5,
    measure: (c) => c.analytics.byMode.TRIALS.right,
  },
  {
    id: 't1_backstage_1',
    number: 10,
    title: 'Behind the Obsidian Glass',
    description: 'Conduct your first Backstage Interrogation conversation.',
    tier: 'TIER_1_EASY',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier1_bronze',
    target: 1,
    measure: (c) => c.analytics.feats.backstageInterrogations,
  },
  {
    id: 't1_uv_scan_1',
    number: 11,
    title: 'Blacklight Forensics',
    description: 'Scan a Relic under UV light inside the 3D Intel Observatory.',
    tier: 'TIER_1_EASY',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier1_bronze',
    target: 1,
    measure: (c) => c.analytics.feats.uvScansCount,
  },
  {
    id: 't1_atelier_equip',
    number: 12,
    title: 'Bespoke Horologist',
    description: 'Equip a custom material finish inside the Prism Atelier.',
    tier: 'TIER_1_EASY',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier1_bronze',
    target: 1,
    measure: (c) => c.analytics.feats.atelierFinishesEquipped,
  },
  {
    id: 't1_faction_pledge',
    number: 13,
    title: 'Council Allegiance',
    description: 'Pledge allegiance to Sovereign, Horizon, or Agora.',
    tier: 'TIER_1_EASY',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier1_bronze',
    target: 1,
    measure: (c) => (c.analytics.feats.factionPledged || c.blackboard?.pledgedFaction ? 1 : 0),
    reward: { hudThemeId: 'HORIZON_ELECTRIC_CYAN', rewardLabel: 'HUD Theme: Horizon Telemetry Cyan' },
  },
  {
    id: 't1_bookmark_1',
    number: 14,
    title: 'Archivist of Epiphanies',
    description: 'Bookmark an “Aha!” Intel Flash debrief to your Observatory study.',
    tier: 'TIER_1_EASY',
    aspect: 'DOMAINS_POLYMATH',
    emblemKey: 'medal_tier1_bronze',
    target: 1,
    measure: (c) => c.passport.bookmarks.length,
  },

  // ================= TIER 2 — MEDIUM (Envoy Sterling, 14) =================
  {
    id: 't2_streak_5',
    number: 15,
    title: 'Quintuple Resonance',
    description: 'Achieve a 5-question consecutive correct streak.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'STREAK_SPEED',
    emblemKey: 'medal_tier2_sterling',
    target: 5,
    measure: (c) => c.analytics.bestStreak,
  },
  {
    id: 't2_streak_10',
    number: 16,
    title: 'Decade of Precision',
    description: 'Achieve a 10-question consecutive correct streak.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'STREAK_SPEED',
    emblemKey: 'trophy_streak_chronometer',
    target: 10,
    measure: (c) => c.analytics.bestStreak,
    reward: { prismFinishId: 'STERLING_CHRONOMETER_RHODIUM', rewardLabel: 'Prism Finish: Vallée de Joux Rhodium & Sterling' },
  },
  {
    id: 't2_max6x_1',
    number: 17,
    title: 'Maximum 6.0x Conviction',
    description: 'Lock and win a full-charge 6.0x Tier-1 Cold Instinct Overclock.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'trophy_overclock_roulette',
    target: 1,
    measure: (c) => c.analytics.overclock.max6xWins,
    reward: { broadcastTitle: 'CONVICTION HIGH-ROLLER', rewardLabel: 'Title: CONVICTION HIGH-ROLLER' },
  },
  {
    id: 't2_bluff_echo_1',
    number: 18,
    title: 'Bluff Echo Vent',
    description: 'Safely flick-cancel an active Overclock charge to bait your Rival.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier2_sterling',
    target: 1,
    measure: (c) => c.analytics.feats.bluffEchoCancels,
  },
  {
    id: 't2_call_bluff_1',
    number: 19,
    title: 'Human Tell Reader',
    description: 'Spot a physical character tell and catch a Rival Bluff (⚡ CALL BLUFF).',
    tier: 'TIER_2_MEDIUM',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier2_sterling',
    target: 1,
    measure: (c) => c.analytics.feats.rivalBluffsCaught,
    reward: {
      prismFinishId: 'BLACK_SALON_CRIMSON_OBSIDIAN',
      broadcastTitle: 'FORENSIC TELL READER',
      rewardLabel: 'Finish: Black Salon Crimson + Title: FORENSIC TELL READER',
    },
  },
  {
    id: 't2_perfect_match',
    number: 20,
    title: 'Flawless Five',
    description: 'Complete any 5+ question match with 100% accuracy.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'STREAK_SPEED',
    emblemKey: 'medal_tier2_sterling',
    target: 1,
    measure: (c) => c.analytics.feats.perfectMatchesCount,
  },
  {
    id: 't2_act1_cleared',
    number: 21,
    title: 'Dual-Track Envoy',
    description: 'Earn both London (GB) and Tokyo (JP) Act I Diplomatic Visas.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier2_sterling',
    target: 2,
    measure: (c) => (c.passport.visas.gb?.cleared ? 1 : 0) + (c.passport.visas.jp?.cleared ? 1 : 0),
    reward: {
      prismFinishId: 'KYOTO_URUSHI_KINTSUGI',
      hudThemeId: 'TOKYO_VERMILION_EMBER',
      rewardLabel: 'Finish: Kyoto Kintsugi + Theme: Vermilion Ember',
    },
  },
  {
    id: 't2_archive_15',
    number: 22,
    title: 'Diplomatic Vaults Delver',
    description: 'Reach Depth 15 in Endless Archive Descent.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier2_sterling',
    target: 15,
    measure: (c) => c.analytics.feats.maxEndlessDepth,
    reward: { broadcastTitle: 'ARCHIVE VAULT DELVER', rewardLabel: 'Title: ARCHIVE VAULT DELVER' },
  },
  {
    id: 't2_calibrator_bullseye',
    number: 23,
    title: 'Pinhole Astrolabe',
    description: 'Hit a 3.5x Pinhole Bullseye on the 3D Calibrator Dial.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier2_sterling',
    target: 1,
    measure: (c) => c.analytics.feats.calibratorBullseyes,
  },
  {
    id: 't2_codex_first_try',
    number: 24,
    title: 'Cryptex Synchronizer',
    description: 'Align and lock a 3D Codex Dual-Ring at unpeeled Tier 1.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier2_sterling',
    target: 1,
    measure: (c) => c.analytics.feats.codexFirstTryLocks,
  },
  {
    id: 't2_gauntlet_10',
    number: 25,
    title: 'Kinetic Plate Shatterer',
    description: 'Shatter 10 Gauntlet Veritas Plates accurately.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier2_sterling',
    target: 10,
    measure: (c) => c.analytics.byArchetype.GAUNTLET_SHATTER.right,
  },
  {
    id: 't2_cold_instinct_10',
    number: 26,
    title: 'Cold Instinct X',
    description: 'Solve 10 questions sealed at 3.0x Tier-1 Cold Instinct.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier2_sterling',
    target: 10,
    measure: (c) => c.analytics.byPeelTier['1'].right,
    reward: { broadcastTitle: 'COLD INSTINCT SPECIALIST', rewardLabel: 'Title: COLD INSTINCT SPECIALIST' },
  },
  {
    id: 't2_correct_25',
    number: 27,
    title: 'Quarter-Century Scholar',
    description: 'Reach 25 lifetime correct answers across all modes.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'DOMAINS_POLYMATH',
    emblemKey: 'medal_tier2_sterling',
    target: 25,
    measure: (c) => c.analytics.totalRight,
    reward: { hudThemeId: 'AGORA_BOTANICAL_EMERALD', rewardLabel: 'HUD Theme: Agora Emerald Commons' },
  },
  {
    id: 't2_clues_4',
    number: 28,
    title: 'Red Thread Investigator',
    description: 'Uncover 4 Conspiracy Evidence Clues on the Dossier Board.',
    tier: 'TIER_2_MEDIUM',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier2_sterling',
    target: 4,
    measure: (c) => c.blackboard?.unlockedEvidenceClues.length ?? 0,
  },

  // ================= TIER 3 — HARD (Consul 24K Gold, 14) =================
  {
    id: 't3_streak_20',
    number: 29,
    title: 'Twentyfold Harmonic',
    description: 'Achieve a 20-question consecutive correct streak.',
    tier: 'TIER_3_HARD',
    aspect: 'STREAK_SPEED',
    emblemKey: 'trophy_streak_chronometer',
    target: 20,
    measure: (c) => c.analytics.bestStreak,
    reward: { prismFinishId: 'CONSUL_MALACHITE_VERDIGRIS', rewardLabel: 'Prism Finish: Consul Malachite & Bronze' },
  },
  {
    id: 't3_triple_6x_match',
    number: 30,
    title: 'Triple Turbine Surge',
    description: 'Land 3× 6.0x Max Overclocks inside a single match.',
    tier: 'TIER_3_HARD',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'trophy_overclock_roulette',
    target: 1,
    measure: (c) => (c.analytics.feats.max3x6xInSingleMatch ? 1 : 0),
    reward: { prismFinishId: 'SOLAR_OCULUS_WHITE_GOLD', rewardLabel: 'Prism Finish: Solar Oculus 18K White-Gold' },
  },
  {
    id: 't3_flawless_boss',
    number: 31,
    title: 'Untouched Sovereign',
    description: 'Defeat a 3-Phase Country Boss Showdown with 0 Prism Shields lost.',
    tier: 'TIER_3_HARD',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier3_gold',
    target: 1,
    measure: (c) => c.analytics.feats.flawlessBossWins,
  },
  {
    id: 't3_correct_100',
    number: 32,
    title: 'Centurion Initiate',
    description: 'Reach 100 lifetime correct answers.',
    tier: 'TIER_3_HARD',
    aspect: 'DOMAINS_POLYMATH',
    emblemKey: 'medal_tier3_gold',
    target: 100,
    measure: (c) => c.analytics.totalRight,
  },
  {
    id: 't3_domain_elo_1500',
    number: 33,
    title: 'Consul of Mastery',
    description: 'Climb to 1,500 IRT ELO in any knowledge domain.',
    tier: 'TIER_3_HARD',
    aspect: 'DOMAINS_POLYMATH',
    emblemKey: 'trophy_polymath_globe',
    target: 1500,
    measure: (c) => maxDomainEloOf(c),
    reward: { broadcastTitle: 'CONSUL OF THE TWELVE', rewardLabel: 'Title: CONSUL OF THE TWELVE' },
  },
  {
    id: 't3_relics_4',
    number: 34,
    title: 'Curator of Four Capitals',
    description: 'Recover 4 Tier-3 Country Boss Relics for your Observatory.',
    tier: 'TIER_3_HARD',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier3_gold',
    target: 4,
    measure: (c) => unlockedRelicsTotal(c),
    reward: { broadcastTitle: 'RELIC ARCHIVIST SUPREME', rewardLabel: 'Title: RELIC ARCHIVIST SUPREME' },
  },
  {
    id: 't3_archive_50',
    number: 35,
    title: 'Subterranean Consul',
    description: 'Survive to Depth 50 in Endless Archive Descent.',
    tier: 'TIER_3_HARD',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier3_gold',
    target: 50,
    measure: (c) => c.analytics.feats.maxEndlessDepth,
    reward: { hudThemeId: 'CAIRO_SOLAR_AMBER', rewardLabel: 'HUD Theme: Meridian Zero Solar Amber' },
  },
  {
    id: 't3_ghost_win_1',
    number: 36,
    title: 'Phantom Victor',
    description: 'Defeat a Recorded 3D Kinetic Ghost in World Council Trials.',
    tier: 'TIER_3_HARD',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier3_gold',
    target: 1,
    measure: (c) => c.analytics.feats.ghostTrialWins,
    reward: { broadcastTitle: 'BLACK SALON SHARK', rewardLabel: 'Title: BLACK SALON SHARK' },
  },
  {
    id: 't3_fast_under3s_15',
    number: 37,
    title: 'Reflex Chronometer',
    description: 'Lock 15 correct answers in under 3.0 seconds each.',
    tier: 'TIER_3_HARD',
    aspect: 'STREAK_SPEED',
    emblemKey: 'medal_tier3_gold',
    target: 15,
    measure: (c) => c.analytics.speedBuckets[0].right,
  },
  {
    id: 't3_all_12_domains_1',
    number: 38,
    title: 'Renaissance Passport',
    description: 'Solve at least 1 question across all 12 Sovereign Domains.',
    tier: 'TIER_3_HARD',
    aspect: 'DOMAINS_POLYMATH',
    emblemKey: 'trophy_polymath_globe',
    target: 12,
    measure: (c) => c.analytics.byDomain.filter((d) => d.right >= 1).length,
    reward: { prismFinishId: 'IMPERIAL_EMERALD_BRASS', rewardLabel: 'Prism Finish: Imperial Emerald & Brass' },
  },
  {
    id: 't3_daily_5',
    number: 39,
    title: 'Global Feed Correspondent',
    description: 'Complete 5 Daily Global Feed World Broadcasts.',
    tier: 'TIER_3_HARD',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier3_gold',
    target: 5,
    measure: (c) => Math.max(c.analytics.feats.dailyBroadcastsCompleted, c.passport.dailyHistory.length),
  },
  {
    id: 't3_hero_synth_3',
    number: 40,
    title: 'Relic Synthesis Adept',
    description: 'Solve 3 chained Hero Artifact Synthesis steps.',
    tier: 'TIER_3_HARD',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier3_gold',
    target: 3,
    measure: (c) => c.analytics.byArchetype.HERO_ARTIFACT_SYNTHESIS.right,
  },
  {
    id: 't3_backstage_6',
    number: 41,
    title: 'Grand Inquisitor',
    description: 'Complete 6 Backstage Interrogations across the global circuit.',
    tier: 'TIER_3_HARD',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier3_gold',
    target: 6,
    measure: (c) => c.analytics.feats.backstageInterrogations,
  },
  {
    id: 't3_visas_5',
    number: 42,
    title: 'Plenipotentiary Envoy',
    description: 'Stamp 5 Country Diplomatic Visas into your Meridian Passport.',
    tier: 'TIER_3_HARD',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier3_gold',
    target: 5,
    measure: (c) => clearedVisasCount(c.passport),
    reward: { prismFinishId: 'PHARAONIC_LAPIS_ELECTRUM', rewardLabel: 'Prism Finish: Pharaonic Lapis & Electrum' },
  },

  // ================= TIER 4 — VERY RARE (Arbiter Smoked Sapphire, 12) =================
  {
    id: 't4_streak_35',
    number: 43,
    title: 'Thirty-Five Unbroken',
    description: 'Achieve a 35-question consecutive correct streak.',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'STREAK_SPEED',
    emblemKey: 'trophy_streak_chronometer',
    target: 35,
    measure: (c) => c.analytics.bestStreak,
    reward: { prismFinishId: 'ARBITER_SMOKED_SAPPHIRE_PLATINUM', rewardLabel: 'Prism Finish: Arbiter Smoked Sapphire' },
  },
  {
    id: 't4_soren_coin_defeat',
    number: 44,
    title: 'Dead Coin Counterplay',
    description: 'Read Soren Kael’s coin tell & defeat him (or catch 3 Rival Bluffs).',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier4_sapphire',
    target: 3,
    measure: (c) => (c.analytics.feats.sorenCoinBluffDefeated ? 3 : c.analytics.feats.rivalBluffsCaught),
  },
  {
    id: 't4_campaign_complete',
    number: 45,
    title: 'Champion of The Meridian',
    description: 'Complete The Meridian Circuit Campaign at The Apex Forum.',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier4_sapphire',
    target: 1,
    measure: (c) =>
      c.analytics.feats.campaignCompleted ||
      c.passport.visas.global?.cleared ||
      (c.blackboard?.achievedEndings.length ?? 0) > 0
        ? 1
        : 0,
    reward: { broadcastTitle: 'FIRST CITIZEN ARBITER', rewardLabel: 'Title: FIRST CITIZEN ARBITER' },
  },
  {
    id: 't4_all_8_relics_24_latches',
    number: 46,
    title: 'Master of Twenty-Four Latches',
    description: 'Recover all 8 Tier-3 Relics and actuate all 24 mechanical latches.',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier4_sapphire',
    target: 24,
    measure: (c) =>
      unlockedRelicsTotal(c) >= 8
        ? c.analytics.feats.openedLatchKeys.length
        : Math.min(23, c.analytics.feats.openedLatchKeys.length),
  },
  {
    id: 't4_correct_500_acc80',
    number: 47,
    title: 'High Arbiter Laureate',
    description: 'Reach 500 lifetime correct answers while maintaining ≥ 80% accuracy.',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'DOMAINS_POLYMATH',
    emblemKey: 'medal_tier4_sapphire',
    target: 500,
    measure: (c) => {
      const tot = c.analytics.totalRight + c.analytics.totalWrong;
      const acc = tot > 0 ? c.analytics.totalRight / tot : 0;
      return acc >= 0.8 ? c.analytics.totalRight : Math.min(499, c.analytics.totalRight);
    },
  },
  {
    id: 't4_six_domains_1750',
    number: 48,
    title: 'Hexagonal Savant',
    description: 'Reach 1,750+ ELO across at least 6 knowledge domains.',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'DOMAINS_POLYMATH',
    emblemKey: 'trophy_polymath_globe',
    target: 6,
    measure: (c) => countDomainsAboveElo(c, 1750),
    reward: { hudThemeId: 'REYKJAVIK_BOREALIS_VIOLET', rewardLabel: 'HUD Theme: Caldera Borealis Violet-Teal' },
  },
  {
    id: 't4_archive_100',
    number: 49,
    title: 'Abyssal Vault Walker',
    description: 'Reach Depth 100 in Endless Archive Descent.',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier4_sapphire',
    target: 100,
    measure: (c) => c.analytics.feats.maxEndlessDepth,
  },
  {
    id: 't4_black_salon_champ',
    number: 50,
    title: 'Sovereign of the Black Salon',
    description: 'Win a High-Stakes Underground Black Salon Knockout match.',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier4_sapphire',
    target: 1,
    measure: (c) => c.analytics.feats.blackSalonWins,
  },
  {
    id: 't4_overclock_wins_50',
    number: 51,
    title: 'Fiftyfold Overclocker',
    description: 'Win 50 Hold-to-Overclock confidence wagers.',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'trophy_overclock_roulette',
    target: 50,
    measure: (c) => c.analytics.overclock.overclockWins,
  },
  {
    id: 't4_cold_instinct_100',
    number: 52,
    title: 'Hundredfold Cold Instinct',
    description: 'Solve 100 Prisms sealed at 3.0x Tier-1 Cold Instinct.',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier4_sapphire',
    target: 100,
    measure: (c) => c.analytics.byPeelTier['1'].right,
  },
  {
    id: 't4_clues_12',
    number: 53,
    title: 'Conspiracy Unmasked',
    description: 'Pin all 12 Classified Clues onto the Conspiracy Dossier Board.',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier4_sapphire',
    target: 12,
    measure: (c) => c.blackboard?.unlockedEvidenceClues.length ?? 0,
    reward: { prismFinishId: 'AURORA_DICHROIC_TITANIUM', rewardLabel: 'Prism Finish: Aurora Dichroic Titanium' },
  },
  {
    id: 't4_bullseyes_10',
    number: 54,
    title: 'Master Astrolabist',
    description: 'Land 10 Pinhole Bullseyes on the 3D Calibrator Dial.',
    tier: 'TIER_4_VERY_RARE',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier4_sapphire',
    target: 10,
    measure: (c) => c.analytics.feats.calibratorBullseyes,
  },

  // ================= TIER 5 — EXTREMELY RARE (Mythic Celestial Diamond 0.1%, 10) =================
  {
    id: 't5_unpeeled_sovereign',
    number: 55,
    title: 'The Unpeeled Sovereign',
    description: 'Win a 3-Phase Country Boss Showdown with 0 Peels — 100% Pure Crown!',
    tier: 'TIER_5_MYTHIC',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'medal_tier5_mythic',
    target: 1,
    measure: (c) => c.analytics.feats.unpeeledBossWins,
    reward: {
      prismFinishId: 'CELESTIAL_DIAMOND_SOVEREIGN',
      broadcastTitle: 'UNPEELED SOVEREIGN',
      rewardLabel: 'Mythic Finish: Celestial Diamond + Title: UNPEELED SOVEREIGN',
    },
  },
  {
    id: 't5_horological_perfection',
    number: 56,
    title: 'Horological Perfection',
    description: 'Achieve 50 consecutive correct answers without a single miss.',
    tier: 'TIER_5_MYTHIC',
    aspect: 'STREAK_SPEED',
    emblemKey: 'trophy_streak_chronometer',
    target: 50,
    measure: (c) => c.analytics.bestStreak,
    reward: { prismFinishId: 'CELESTIAL_DIAMOND_SOVEREIGN', rewardLabel: 'Mythic Finish: Celestial Diamond & 24K' },
  },
  {
    id: 't5_polymath_supreme',
    number: 57,
    title: 'Polymath Supreme',
    description: 'Reach 1,850+ Genius IRT ELO across ALL 12 Sovereign Domains.',
    tier: 'TIER_5_MYTHIC',
    aspect: 'DOMAINS_POLYMATH',
    emblemKey: 'trophy_polymath_globe',
    target: 12,
    measure: (c) => countDomainsAboveElo(c, 1850),
    reward: { broadcastTitle: 'POLYMATH SUPREME', rewardLabel: 'Mythic Title: POLYMATH SUPREME' },
  },
  {
    id: 't5_6x_russian_roulette',
    number: 58,
    title: '6.0x Russian Roulette',
    description: 'Win 5 consecutive 6.0x Max Overclocks in a row without Backfire.',
    tier: 'TIER_5_MYTHIC',
    aspect: 'PRISM_OVERCLOCK',
    emblemKey: 'trophy_overclock_roulette',
    target: 5,
    measure: (c) => c.analytics.overclock.bestConsecutiveMax6xWins,
  },
  {
    id: 't5_lightning_savant',
    number: 59,
    title: 'Lightning Savant',
    description: 'Lock 10 consecutive correct answers each in under 3.0 seconds.',
    tier: 'TIER_5_MYTHIC',
    aspect: 'STREAK_SPEED',
    emblemKey: 'medal_tier5_mythic',
    target: 10,
    measure: (c) => c.analytics.bestFastUnder3sStreak,
    reward: { hudThemeId: 'MYTHIC_PRISMATIC_DIAMOND', rewardLabel: 'Mythic HUD Theme: Celestial White-Diamond' },
  },
  {
    id: 't5_architect_succession',
    number: 60,
    title: "The Architect's Succession",
    description: 'Uncover all 12 Conspiracy Clues and unlock the Secret 4th Ending.',
    tier: 'TIER_5_MYTHIC',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier5_mythic',
    target: 2,
    measure: (c) => {
      const cluesOk = (c.blackboard?.unlockedEvidenceClues.length ?? 0) >= 12 ? 1 : 0;
      const endOk =
        c.blackboard?.achievedEndings.includes('ARCHITECT_SUCCESSION') ||
        c.analytics.feats.achievedEndings.includes('ARCHITECT_SUCCESSION')
          ? 1
          : 0;
      return cluesOk + endOk;
    },
  },
  {
    id: 't5_meridian_leviathan',
    number: 61,
    title: 'Meridian Zero Leviathan',
    description: 'Descend to Depth 200 inside The Ledger’s Meridian Zero Core.',
    tier: 'TIER_5_MYTHIC',
    aspect: 'MODES_TRIALS',
    emblemKey: 'medal_tier5_mythic',
    target: 200,
    measure: (c) => c.analytics.feats.maxEndlessDepth,
  },
  {
    id: 't5_fourfold_destiny',
    number: 62,
    title: 'Fourfold Destiny',
    description: 'Unlock all 4 Championship Endings across New Circuit+ replays.',
    tier: 'TIER_5_MYTHIC',
    aspect: 'CAMPAIGN_LORE',
    emblemKey: 'medal_tier5_mythic',
    target: 4,
    measure: (c) => {
      const set = new Set([
        ...(c.blackboard?.achievedEndings ?? []),
        ...c.analytics.feats.achievedEndings,
      ]);
      return set.size;
    },
  },
  {
    id: 't5_centurion_million',
    number: 63,
    title: 'Centurion of the Million',
    description: 'Solve 1,000 unique verified Question IDs from THE FORGE.',
    tier: 'TIER_5_MYTHIC',
    aspect: 'DOMAINS_POLYMATH',
    emblemKey: 'trophy_polymath_globe',
    target: 1000,
    measure: (c) => c.analytics.uniqueSolvedCount,
  },
  {
    id: 't5_grand_completionist',
    number: 64,
    title: 'Grand Sovereign Completionist',
    description: 'Unlock all 63 other Trophies & Medals in the Hall of Honours.',
    tier: 'TIER_5_MYTHIC',
    aspect: 'DOMAINS_POLYMATH',
    emblemKey: 'medal_tier5_mythic',
    target: 63,
    measure: () => 0, // Evaluated dynamically over the first 63 honours!
  },
];

interface PersistedHonoursMap {
  unlockedTimestamps: Record<string, string>;
}

export class HallOfHonoursSystem {
  private readonly analyticsStore: CareerAnalyticsStore;
  private readonly passport: PassportSystem;
  private readonly blackboard?: InkBlackboard;
  private unlockedTimestamps: Record<string, string>;

  constructor(
    analyticsStore: CareerAnalyticsStore,
    passport: PassportSystem,
    blackboard?: InkBlackboard,
  ) {
    this.analyticsStore = analyticsStore;
    this.passport = passport;
    this.blackboard = blackboard;
    this.unlockedTimestamps = this.load();
    // Apply persisted HUD accent theme at boot if previously customized
    const equippedTheme = getEquippedHudTheme();
    if (equippedTheme.id !== 'GENEVA_CHAMPAGNE_24K') {
      equipHudAccentTheme(equippedTheme.id);
    }
    // Silent initial sync (do not fire toasts on cold boot)
    this.evaluateAndUnlock(true);
  }

  private load(): Record<string, string> {
    try {
      if (typeof localStorage === 'undefined') return {};
      const raw = localStorage.getItem(HONOURS_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Partial<PersistedHonoursMap> | null;
      if (parsed?.unlockedTimestamps && typeof parsed.unlockedTimestamps === 'object') {
        return { ...parsed.unlockedTimestamps };
      }
    } catch {
      // Ignore
    }
    return {};
  }

  private save(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const payload: PersistedHonoursMap = { unlockedTimestamps: this.unlockedTimestamps };
        localStorage.setItem(HONOURS_STORAGE_KEY, JSON.stringify(payload));
      }
    } catch {
      // Ignore
    }
  }

  private applyRewardGrant(def: HonourDefinition): void {
    const rw = def.reward;
    if (!rw) return;
    if (rw.prismFinishId) {
      grantAtelierFinishUnlock(rw.prismFinishId);
    }
    if (rw.broadcastTitle) {
      this.passport.unlockTitleCrest(rw.broadcastTitle, false);
    }
    if (rw.hudThemeId) {
      grantHudThemeUnlock(rw.hudThemeId);
    }
  }

  /**
   * Evaluates all 64 Trophies & Medals, grants any newly earned 32 Unlockables,
   * and returns ONLY newly unlocked Honours (empty on silent boot sync).
   */
  public evaluateAndUnlock(silentBoot = false): HonourProgressItem[] {
    const ctx: HonourEvaluationContext = {
      analytics: this.analyticsStore.getSnapshot(),
      passport: this.passport.getSnapshot(),
      blackboard: this.blackboard?.getSnapshot() ?? null,
    };

    const newlyUnlocked: HonourProgressItem[] = [];
    const nowIso = new Date().toISOString();
    let dirty = false;

    // Pass 1: Honours 1..63
    let unlockedFirst63 = 0;
    for (let i = 0; i < HALL_OF_HONOURS_CATALOG.length - 1; i++) {
      const def = HALL_OF_HONOURS_CATALOG[i];
      const rawCurr = Math.max(0, Math.floor(def.measure(ctx)));
      const already = Boolean(this.unlockedTimestamps[def.id]);

      if (already || rawCurr >= def.target) {
        unlockedFirst63 += 1;
        if (!already) {
          this.unlockedTimestamps[def.id] = nowIso;
          this.applyRewardGrant(def);
          dirty = true;
          if (!silentBoot) {
            newlyUnlocked.push(this.buildProgressItem(def, def.target));
          }
        } else {
          // Ensure reward stays unlocked idempotently
          this.applyRewardGrant(def);
        }
      }
    }

    // Pass 2: Honour #64 (Grand Sovereign Completionist: all 63 others unlocked)
    const compDef = HALL_OF_HONOURS_CATALOG[HALL_OF_HONOURS_CATALOG.length - 1];
    const compAlready = Boolean(this.unlockedTimestamps[compDef.id]);
    if (compAlready || unlockedFirst63 >= 63) {
      if (!compAlready) {
        this.unlockedTimestamps[compDef.id] = nowIso;
        dirty = true;
        if (!silentBoot) {
          newlyUnlocked.push(this.buildProgressItem(compDef, 63));
        }
      }
    }

    if (dirty) {
      this.save();
    }
    return newlyUnlocked;
  }

  private buildProgressItem(def: HonourDefinition, measuredVal: number): HonourProgressItem {
    const unlockedAtIso = this.unlockedTimestamps[def.id] ?? null;
    const unlocked = unlockedAtIso !== null;
    const current = unlocked ? def.target : Math.min(def.target, Math.max(0, Math.floor(measuredVal)));
    return {
      def,
      unlocked,
      unlockedAtIso,
      current,
      target: def.target,
      ratio: def.target > 0 ? Math.min(1, current / def.target) : 1,
      emblemPngUrl: `./assets/medals/${def.emblemKey}.png`,
      emblemFallbackDataUri: getMedalFallbackDataUri(def.emblemKey),
    };
  }

  public getAllProgress(): HonourProgressItem[] {
    const ctx: HonourEvaluationContext = {
      analytics: this.analyticsStore.getSnapshot(),
      passport: this.passport.getSnapshot(),
      blackboard: this.blackboard?.getSnapshot() ?? null,
    };

    let first63Unlocked = 0;
    const items: HonourProgressItem[] = [];
    for (let i = 0; i < HALL_OF_HONOURS_CATALOG.length - 1; i++) {
      const def = HALL_OF_HONOURS_CATALOG[i];
      const item = this.buildProgressItem(def, def.measure(ctx));
      if (item.unlocked) first63Unlocked += 1;
      items.push(item);
    }

    const compDef = HALL_OF_HONOURS_CATALOG[HALL_OF_HONOURS_CATALOG.length - 1];
    items.push(this.buildProgressItem(compDef, first63Unlocked));
    return items;
  }
}
