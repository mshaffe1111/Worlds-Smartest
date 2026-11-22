// ============================================================================
// WORLD'S SMARTEST — Prism Atelier (`PITCH_BIBLE.md` §7.1 & `#166` §2.2)
// Sacred Studio Guardrail: 100% ZERO PAY-TO-WIN Cosmetic Horological Workshop.
// Features:
//  • Live 3D Interactive Preview (`Stage3DDirector`) & Equip Screen for all 12
//    Prestige Veritas Prism PBR Material Finishes (6 Campaign/Mode Milestones +
//    6 Hall of Honours Trophy/Medal Rewards — Easy to Mythic 0.1%!)
//  • Persists equipped finish in `localStorage` & emits `onEquipSkin(skinSpec)`
//    to re-tint live Three.js PBR crystal, shutter & horological gimbal materials!
// ============================================================================

import * as THREE from 'three';
import { forgeEngine } from '../forge';
import type { Stage3DDirector } from '../stage3d';
import type {
  HubId,
  InkBlackboard,
  PassportStateSnapshot,
  PassportSystem,
  PrismSkinId,
} from '../narrative';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import {
  attachMetaEscapeHandler,
  bindVaultJumperEvents,
  ensureMetaStylesInjected,
  escapeMetaHtml,
  renderVaultJumperHtml,
  sanitizeMetaCopy,
  type MetaSuiteSectionId,
} from './DiplomaticPassportBook';

export type PrismFinishId =
  | 'SOVEREIGN_OBSIDIAN_24K'
  | 'DAMASCUS_STEEL_AMBER'
  | 'KYOTO_URUSHI_KINTSUGI'
  | 'IMPERIAL_EMERALD_BRASS'
  | 'PHARAONIC_LAPIS_ELECTRUM'
  | 'AURORA_DICHROIC_TITANIUM'
  | 'BLACK_SALON_CRIMSON_OBSIDIAN'
  | 'STERLING_CHRONOMETER_RHODIUM'
  | 'CONSUL_MALACHITE_VERDIGRIS'
  | 'ARBITER_SMOKED_SAPPHIRE_PLATINUM'
  | 'SOLAR_OCULUS_WHITE_GOLD'
  | 'CELESTIAL_DIAMOND_SOVEREIGN'
  | 'SAPPHIRE_BLUEPRINT_CYANOTYPE'
  | 'DUELIST_BLOODSTONE_PLATINUM'
  | 'NEURAL_ENGRAM_AMETHYST_GOLD'
  | 'MENSA_QUANTUM_IRIDIUM_GLASS';

export interface PrismMaterialFinishSpec {
  id: PrismFinishId;
  legacyBlackboardSkinId: PrismSkinId;
  order: number;
  name: string;
  shortBadge: string;
  milestoneTitle: string;
  unlockRequirementSummary: string;
  craftProvenance: string;
  hubOrigin: HubId;
  baseDomainId: number;
  swatchPrimaryCss: string;
  swatchSecondaryCss: string;
  swatchCrystalCss: string;
  stage3dSkinId:
    | 'SOVEREIGN_OBSIDIAN'
    | 'DAMASCUS_STEEL'
    | 'KYOTO_KINTSUGI'
    | 'IMPERIAL_EMERALD'
    | 'PHARAONIC_LAPIS'
    | 'AURORA_DICHROIC'
    | 'SINGAPORE_SKYBRIDGE'
    | 'CRIMSON_BLACK_SALON'
    | 'METEORITE_ROSE_GOLD'
    | 'ARCTIC_CRYO_SAPPHIRE'
    | 'ELECTRUM_MOTHER_OF_PEARL'
    | 'MYTHIC_CELESTIAL_DIAMOND';
  primaryMetalHex: number;
  secondaryMetalHex: number;
  metalRoughness: number;
  shutterRoughness: number;
  crystalColorHex: number;
  attenuationHex: number;
  crystalRoughness: number;
  iridescence: number;
  ior: number;
  emissiveHex: number;
  emissiveIntensity: number;
  sightlineBeamHex: number;
}

export interface PrismFinishUnlockStatus {
  spec: PrismMaterialFinishSpec;
  unlocked: boolean;
  equipped: boolean;
  progressRatio: number;
  progressLabel: string;
}

export interface PrismAtelierDependencies {
  passport: PassportSystem;
  stage3d?: Stage3DDirector;
  blackboard?: InkBlackboard;
  audio?: StudioAudioEngine;
  haptics?: HapticsEngine;
}

export interface PrismAtelierCallbacks {
  onEquipSkin?: (skinSpec: PrismMaterialFinishSpec) => void;
  onNavigateSection?: (section: MetaSuiteSectionId) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onClose?: () => void;
}

const ATELIER_EQUIPPED_STORAGE_KEY = 'ws_prism_atelier_equipped_v1';
const ATELIER_HONOUR_UNLOCKS_STORAGE_KEY = 'ws_prism_atelier_honour_unlocks_v1';
const DAILY_STORAGE_KEY = 'ws_daily_global_feed_v2';
const ENDLESS_STORAGE_KEY = 'ws_archive_descent_v2';
const TRIALS_STORAGE_KEY = 'ws_council_trials_v2';

/**
 * Core v1.0 12 Prestige Veritas Prism PBR Material Finishes (`#127` + `#166` §2.2).
 */
export const PRISM_ATELIER_FINISHES_V1_CORE: readonly PrismMaterialFinishSpec[] = [
  {
    id: 'SOVEREIGN_OBSIDIAN_24K',
    legacyBlackboardSkinId: 'OBSIDIAN_BRASS',
    order: 1,
    name: 'Sovereign Obsidian & 24K Gold',
    shortBadge: 'GENEVA ISSUE',
    milestoneTitle: 'Default Geneva Charter Issue',
    unlockRequirementSummary: 'Issued upon summons to The Vetting Chamber in Geneva.',
    craftProvenance:
      'Hand-milled Swiss obsidian-sapphire lenses suspended in brushed 24K Geneva horological gold with champagne Sightline optics.',
    hubOrigin: 'ch',
    baseDomainId: 0,
    swatchPrimaryCss: '#e5be67',
    swatchSecondaryCss: '#182238',
    swatchCrystalCss: '#121724',
    stage3dSkinId: 'SOVEREIGN_OBSIDIAN',
    primaryMetalHex: 0xe5be67,
    secondaryMetalHex: 0x182033,
    metalRoughness: 0.21,
    shutterRoughness: 0.25,
    crystalColorHex: 0x0b101c,
    attenuationHex: 0x1e2c47,
    crystalRoughness: 0.16,
    iridescence: 0.22,
    ior: 1.52,
    emissiveHex: 0xffd884,
    emissiveIntensity: 0.05,
    sightlineBeamHex: 0xffd875,
  },
  {
    id: 'DAMASCUS_STEEL_AMBER',
    legacyBlackboardSkinId: 'DAMASCUS_TITANIUM',
    order: 2,
    name: 'Damascus Folded Steel & Amber',
    shortBadge: 'LONDON FORGE',
    milestoneTitle: 'London Milestone · Sovereign Rotunda',
    unlockRequirementSummary: 'London (GB) Visa · 2-Day Daily Streak · OR Initiate Honour.',
    craftProvenance:
      '320-layer acid-etched gunmetal Damascus gimbals paired with warm Baltic cognac-amber quartz facets forged beneath Westminster.',
    hubOrigin: 'gb',
    baseDomainId: 9,
    swatchPrimaryCss: '#b4c2d4',
    swatchSecondaryCss: '#434f61',
    swatchCrystalCss: '#5e3310',
    stage3dSkinId: 'DAMASCUS_STEEL',
    primaryMetalHex: 0xb4c2d4,
    secondaryMetalHex: 0x3b4657,
    metalRoughness: 0.24,
    shutterRoughness: 0.28,
    crystalColorHex: 0x1c1006,
    attenuationHex: 0x8a4810,
    crystalRoughness: 0.17,
    iridescence: 0.18,
    ior: 1.55,
    emissiveHex: 0xffad42,
    emissiveIntensity: 0.06,
    sightlineBeamHex: 0xffb347,
  },
  {
    id: 'KYOTO_URUSHI_KINTSUGI',
    legacyBlackboardSkinId: 'KYOTO_KINTSUGI',
    order: 3,
    name: 'Kyoto Urushi Lacquer & Kintsugi Gold',
    shortBadge: 'TOKYO ATELIER',
    milestoneTitle: 'Tokyo Milestone · Shinkansen Sky Pavilion',
    unlockRequirementSummary: 'Tokyo (JP) Visa · Archive Depth ≥ 5 · OR 3-Day Daily Streak.',
    craftProvenance:
      'Mirror-polished vermilion-ebony urushi lacquer shutters joined with 24K powdered maki-e kintsugi gold seams.',
    hubOrigin: 'jp',
    baseDomainId: 3,
    swatchPrimaryCss: '#f3cf72',
    swatchSecondaryCss: '#7a1622',
    swatchCrystalCss: '#3b0b14',
    stage3dSkinId: 'KYOTO_KINTSUGI',
    primaryMetalHex: 0xf3cf72,
    secondaryMetalHex: 0x7a1622,
    metalRoughness: 0.18,
    shutterRoughness: 0.15,
    crystalColorHex: 0x24070f,
    attenuationHex: 0x8f1a2c,
    crystalRoughness: 0.14,
    iridescence: 0.32,
    ior: 1.56,
    emissiveHex: 0xffb86c,
    emissiveIntensity: 0.06,
    sightlineBeamHex: 0xffca68,
  },
  {
    id: 'IMPERIAL_EMERALD_BRASS',
    legacyBlackboardSkinId: 'EMERALD_SOVEREIGN',
    order: 4,
    name: 'Imperial Emerald Quartz & Botanical Brass',
    shortBadge: 'RIO CANOPY',
    milestoneTitle: 'Rio Milestone · Botanical Glass Canopy',
    unlockRequirementSummary: 'Rio de Janeiro (BR) Visa · OR Archive Descent Depth ≥ 10.',
    craftProvenance:
      'Deep Minas Gerais emerald-tourmaline crystal facets set in satin botanical brass tuned to Nadia Al-Mansoor’s acoustic key.',
    hubOrigin: 'br',
    baseDomainId: 2,
    swatchPrimaryCss: '#d9bc6a',
    swatchSecondaryCss: '#146944',
    swatchCrystalCss: '#0c472f',
    stage3dSkinId: 'IMPERIAL_EMERALD',
    primaryMetalHex: 0xd9bc6a,
    secondaryMetalHex: 0x146944,
    metalRoughness: 0.22,
    shutterRoughness: 0.22,
    crystalColorHex: 0x07241a,
    attenuationHex: 0x188557,
    crystalRoughness: 0.16,
    iridescence: 0.28,
    ior: 1.58,
    emissiveHex: 0x4ef2ad,
    emissiveIntensity: 0.06,
    sightlineBeamHex: 0x46eba8,
  },
  {
    id: 'PHARAONIC_LAPIS_ELECTRUM',
    legacyBlackboardSkinId: 'OBSIDIAN_BRASS',
    order: 5,
    name: 'Pharaonic Lapis Lazuli & Solar Electrum',
    shortBadge: 'CAIRO VAULT',
    milestoneTitle: 'Cairo Milestone · Meridian Zero Vault',
    unlockRequirementSummary: 'Cairo (EG) Visa · 5-Day Streak · OR Daily Top 25% Broadcast.',
    craftProvenance:
      'Celestial Badakhshan lapis lazuli crystal infused with pyrite starlight and pale silver-gold Solar Electrum from Giza’s oculus.',
    hubOrigin: 'eg',
    baseDomainId: 10,
    swatchPrimaryCss: '#f2e4b8',
    swatchSecondaryCss: '#1b3f96',
    swatchCrystalCss: '#122b6e',
    stage3dSkinId: 'PHARAONIC_LAPIS',
    primaryMetalHex: 0xf2e4b8,
    secondaryMetalHex: 0x1b3f96,
    metalRoughness: 0.19,
    shutterRoughness: 0.23,
    crystalColorHex: 0x0b1a45,
    attenuationHex: 0x2452bd,
    crystalRoughness: 0.16,
    iridescence: 0.48,
    ior: 1.57,
    emissiveHex: 0x7acbff,
    emissiveIntensity: 0.06,
    sightlineBeamHex: 0x6ed0ff,
  },
  {
    id: 'AURORA_DICHROIC_TITANIUM',
    legacyBlackboardSkinId: 'BLACK_SALON_CRIMSON',
    order: 6,
    name: 'Aurora Dichroic Titanium',
    shortBadge: 'REYKJAVIK APEX',
    milestoneTitle: 'Reykjavik / Grandmaster Milestone',
    unlockRequirementSummary: 'Reykjavik (IS) Visa · Depth ≥ 15 · OR Global/Trials Elo ≥ 1550.',
    craftProvenance:
      'Heat-anodized Icelandic titanium housing a high-dispersion dichroic prism that refracts borealis cyan, violet, and white-gold.',
    hubOrigin: 'is',
    baseDomainId: 11,
    swatchPrimaryCss: '#dceeff',
    swatchSecondaryCss: '#4b3d82',
    swatchCrystalCss: '#16384c',
    stage3dSkinId: 'AURORA_DICHROIC',
    primaryMetalHex: 0xdceeff,
    secondaryMetalHex: 0x3e316e,
    metalRoughness: 0.16,
    shutterRoughness: 0.17,
    crystalColorHex: 0x0a1726,
    attenuationHex: 0x1e5c73,
    crystalRoughness: 0.12,
    iridescence: 0.96,
    ior: 1.64,
    emissiveHex: 0x72f7e8,
    emissiveIntensity: 0.07,
    sightlineBeamHex: 0x6bf7e2,
  },
  {
    id: 'BLACK_SALON_CRIMSON_OBSIDIAN',
    legacyBlackboardSkinId: 'BLACK_SALON_CRIMSON',
    order: 7,
    name: 'Black Salon Velvet Crimson & Carbon',
    shortBadge: 'BLACK SALON',
    milestoneTitle: 'Hall of Honours · Bluff & Ghost Trial Citation',
    unlockRequirementSummary: 'Catch a Rival Bluff (CALL BLUFF) · OR Win a World Council Ghost Duel.',
    craftProvenance:
      'Matte forged-carbon tourbillon rings accented with ruby-garnet corundum facets from Teo Rojas’s underground Camden & Shinjuku tables.',
    hubOrigin: 'gb',
    baseDomainId: 4,
    swatchPrimaryCss: '#f0546a',
    swatchSecondaryCss: '#1b1622',
    swatchCrystalCss: '#240812',
    stage3dSkinId: 'CRIMSON_BLACK_SALON',
    primaryMetalHex: 0xd9a86c,
    secondaryMetalHex: 0x26121b,
    metalRoughness: 0.22,
    shutterRoughness: 0.2,
    crystalColorHex: 0x1a060e,
    attenuationHex: 0x85162c,
    crystalRoughness: 0.14,
    iridescence: 0.36,
    ior: 1.58,
    emissiveHex: 0xff546e,
    emissiveIntensity: 0.06,
    sightlineBeamHex: 0xff627a,
  },
  {
    id: 'STERLING_CHRONOMETER_RHODIUM',
    legacyBlackboardSkinId: 'DAMASCUS_TITANIUM',
    order: 8,
    name: 'Vallée de Joux Rhodium & Sterling',
    shortBadge: 'STERLING ENVOY',
    milestoneTitle: 'Hall of Honours · Envoy Sterling Citation',
    unlockRequirementSummary: 'Reach a 10-Question Streak · OR Earn 5 Tier-2 Sterling Medals.',
    craftProvenance:
      'Mirror-rhodium escapement bridges and coined 925 sterling silver shutters framing glacier-clear sapphire chronometer crystal.',
    hubOrigin: 'ch',
    baseDomainId: 1,
    swatchPrimaryCss: '#e4edf7',
    swatchSecondaryCss: '#2a3d59',
    swatchCrystalCss: '#0c1c33',
    stage3dSkinId: 'SINGAPORE_SKYBRIDGE',
    primaryMetalHex: 0xe2ebf5,
    secondaryMetalHex: 0x243652,
    metalRoughness: 0.14,
    shutterRoughness: 0.18,
    crystalColorHex: 0x0a1628,
    attenuationHex: 0x24568a,
    crystalRoughness: 0.12,
    iridescence: 0.42,
    ior: 1.56,
    emissiveHex: 0x8ad4ff,
    emissiveIntensity: 0.06,
    sightlineBeamHex: 0x7acbff,
  },
  {
    id: 'CONSUL_MALACHITE_VERDIGRIS',
    legacyBlackboardSkinId: 'EMERALD_SOVEREIGN',
    order: 9,
    name: 'Consul Imperial Malachite & Bronze',
    shortBadge: 'CONSUL BRONZE',
    milestoneTitle: 'Hall of Honours · Consul 24K Gold Citation',
    unlockRequirementSummary: 'Reach 20-Streak · 100 Lifetime Correct · OR 1,500 Domain ELO.',
    craftProvenance:
      'Banded malachite-jade crystal slabs encased in patinated treaty bronze and hand-burnished 22K Roman consul gold.',
    hubOrigin: 'eg',
    baseDomainId: 7,
    swatchPrimaryCss: '#d4a652',
    swatchSecondaryCss: '#18473c',
    swatchCrystalCss: '#08241d',
    stage3dSkinId: 'METEORITE_ROSE_GOLD',
    primaryMetalHex: 0xd4a652,
    secondaryMetalHex: 0x18453a,
    metalRoughness: 0.23,
    shutterRoughness: 0.24,
    crystalColorHex: 0x071f19,
    attenuationHex: 0x166e58,
    crystalRoughness: 0.16,
    iridescence: 0.3,
    ior: 1.57,
    emissiveHex: 0x56f0c4,
    emissiveIntensity: 0.06,
    sightlineBeamHex: 0x52ebc0,
  },
  {
    id: 'ARBITER_SMOKED_SAPPHIRE_PLATINUM',
    legacyBlackboardSkinId: 'DAMASCUS_TITANIUM',
    order: 10,
    name: 'Arbiter Smoked Sapphire & 950 Platinum',
    shortBadge: 'ARBITER SAPPHIRE',
    milestoneTitle: 'Hall of Honours · Very Rare Sapphire Citation',
    unlockRequirementSummary: 'Singapore (SG) Visa · 35-Streak · OR Earn Any Tier-4 Sapphire Trophy.',
    craftProvenance:
      'Heavy 950 diplomatic platinum gimbals clasping midnight Ceylon smoked-sapphire facets cut for World Council Arbiters.',
    hubOrigin: 'sg',
    baseDomainId: 8,
    swatchPrimaryCss: '#dce4f2',
    swatchSecondaryCss: '#182952',
    swatchCrystalCss: '#081129',
    stage3dSkinId: 'ARCTIC_CRYO_SAPPHIRE',
    primaryMetalHex: 0xdce4f2,
    secondaryMetalHex: 0x17264d,
    metalRoughness: 0.14,
    shutterRoughness: 0.17,
    crystalColorHex: 0x070f26,
    attenuationHex: 0x1f459c,
    crystalRoughness: 0.12,
    iridescence: 0.62,
    ior: 1.61,
    emissiveHex: 0x6cb8ff,
    emissiveIntensity: 0.06,
    sightlineBeamHex: 0x62b4ff,
  },
  {
    id: 'SOLAR_OCULUS_WHITE_GOLD',
    legacyBlackboardSkinId: 'OBSIDIAN_BRASS',
    order: 11,
    name: 'Solar Oculus 18K White-Gold & Topaz',
    shortBadge: '6.0X ROULETTE',
    milestoneTitle: 'Hall of Honours · High-Conviction Overclock Citation',
    unlockRequirementSummary: 'Land 3× 6.0x Max Overclocks in 1 Match · OR 5× Bullseye Calibrations.',
    craftProvenance:
      'Satin 18K white-gold clamping jaws paired with imperial golden-topaz crystal engineered to withstand 6.0x Overclock thermal surges.',
    hubOrigin: 'eg',
    baseDomainId: 5,
    swatchPrimaryCss: '#fff0c2',
    swatchSecondaryCss: '#5e3c14',
    swatchCrystalCss: '#241506',
    stage3dSkinId: 'ELECTRUM_MOTHER_OF_PEARL',
    primaryMetalHex: 0xf7e8be,
    secondaryMetalHex: 0x4f3210,
    metalRoughness: 0.15,
    shutterRoughness: 0.2,
    crystalColorHex: 0x1a1005,
    attenuationHex: 0x8f5d14,
    crystalRoughness: 0.13,
    iridescence: 0.44,
    ior: 1.59,
    emissiveHex: 0xffe07d,
    emissiveIntensity: 0.06,
    sightlineBeamHex: 0xffe282,
  },
  {
    id: 'CELESTIAL_DIAMOND_SOVEREIGN',
    legacyBlackboardSkinId: 'OBSIDIAN_BRASS',
    order: 12,
    name: 'Mythic Celestial Diamond & Astral 24K',
    shortBadge: 'MYTHIC 0.1%',
    milestoneTitle: 'Hall of Honours · Mythic Tier-5 Sovereign Crown',
    unlockRequirementSummary: 'Unlock ANY Tier-5 Mythic (0.1%) Trophy in the Hall of Honours!',
    craftProvenance:
      'Synthetic flawless Type-IIa diamond lenses with full-spectrum astral dispersion mounted in First Citizen Arbiter 24K bullion.',
    hubOrigin: 'global',
    baseDomainId: 11,
    swatchPrimaryCss: '#fff6d6',
    swatchSecondaryCss: '#2c2559',
    swatchCrystalCss: '#0e162b',
    stage3dSkinId: 'MYTHIC_CELESTIAL_DIAMOND',
    primaryMetalHex: 0xf9e398,
    secondaryMetalHex: 0x26204f,
    metalRoughness: 0.12,
    shutterRoughness: 0.14,
    crystalColorHex: 0x091124,
    attenuationHex: 0x2d587a,
    crystalRoughness: 0.1,
    iridescence: 1.0,
    ior: 1.68,
    emissiveHex: 0x9ef7ff,
    emissiveIntensity: 0.07,
    sightlineBeamHex: 0xffe999,
  },
];

/**
 * Modular v2.0 Prism Atelier PBR Finish Expansion Pack (+4 Prestige Finishes -> 16 Total).
 */
export const PRISM_ATELIER_FINISHES_V2_EXPANSION: readonly PrismMaterialFinishSpec[] = [
  {
    id: 'SAPPHIRE_BLUEPRINT_CYANOTYPE',
    legacyBlackboardSkinId: 'DAMASCUS_TITANIUM',
    order: 13,
    name: 'Sapphire Blueprint Cyanotype & Brass',
    shortBadge: 'CYANOTYPE',
    milestoneTitle: 'Hall of Honours v2.0 · Master Blueprint Architect',
    unlockRequirementSummary: 'Solve 10 Visual Blueprint Questions (#75) · Zero Pay-to-Win.',
    craftProvenance:
      'Architectural Prussian-blue cyanotype optics encased in drafting-instrument brushed brass tuned for Sapphire Hologram Plates.',
    hubOrigin: 'ch',
    baseDomainId: 3,
    swatchPrimaryCss: '#64e6ff',
    swatchSecondaryCss: '#0f2e5e',
    swatchCrystalCss: '#071a38',
    stage3dSkinId: 'ARCTIC_CRYO_SAPPHIRE',
    primaryMetalHex: 0xe6c373,
    secondaryMetalHex: 0x103166,
    metalRoughness: 0.17,
    shutterRoughness: 0.19,
    crystalColorHex: 0x061833,
    attenuationHex: 0x1a5ca8,
    crystalRoughness: 0.13,
    iridescence: 0.72,
    ior: 1.6,
    emissiveHex: 0x56d4f5,
    emissiveIntensity: 0.07,
    sightlineBeamHex: 0x64e6ff,
  },
  {
    id: 'DUELIST_BLOODSTONE_PLATINUM',
    legacyBlackboardSkinId: 'BLACK_SALON_CRIMSON',
    order: 14,
    name: 'Duelist Bloodstone & 950 Platinum',
    shortBadge: 'H2H DUELIST',
    milestoneTitle: 'Hall of Honours v2.0 · Ghost Split Breaker',
    unlockRequirementSummary: 'Beat a Challenger Ghost in a 1v1 Head-to-Head Duel (#78).',
    craftProvenance:
      'Machined 950 platinum duel jaws clasping deep bloodstone-garnet crystal forged for one-tap Head-to-Head rivals.',
    hubOrigin: 'gb',
    baseDomainId: 5,
    swatchPrimaryCss: '#e5ecf5',
    swatchSecondaryCss: '#6e1120',
    swatchCrystalCss: '#2b0710',
    stage3dSkinId: 'CRIMSON_BLACK_SALON',
    primaryMetalHex: 0xe5ecf5,
    secondaryMetalHex: 0x6b1222,
    metalRoughness: 0.15,
    shutterRoughness: 0.19,
    crystalColorHex: 0x22060e,
    attenuationHex: 0x8f182d,
    crystalRoughness: 0.14,
    iridescence: 0.46,
    ior: 1.59,
    emissiveHex: 0xff5a73,
    emissiveIntensity: 0.06,
    sightlineBeamHex: 0xff6b81,
  },
  {
    id: 'NEURAL_ENGRAM_AMETHYST_GOLD',
    legacyBlackboardSkinId: 'KYOTO_KINTSUGI',
    order: 15,
    name: 'Neural Engram Amethyst & 24K Gold',
    shortBadge: 'BOX-5 ENGRAM',
    milestoneTitle: 'Hall of Honours v2.0 · Leitner Box-5 Polymath',
    unlockRequirementSummary: 'Promote 5 Cards to Box 5 Mastered in the Leitner Deck (#81).',
    craftProvenance:
      'Synaptic Siberian amethyst crystal faceted with 24K Geneva memory-lattice filigree celebrating permanent recall mastery.',
    hubOrigin: 'jp',
    baseDomainId: 10,
    swatchPrimaryCss: '#f2cf7e',
    swatchSecondaryCss: '#5b2f8f',
    swatchCrystalCss: '#1b0e36',
    stage3dSkinId: 'AURORA_DICHROIC',
    primaryMetalHex: 0xf2cf7e,
    secondaryMetalHex: 0x5b2f8f,
    metalRoughness: 0.16,
    shutterRoughness: 0.18,
    crystalColorHex: 0x160a2e,
    attenuationHex: 0x6a35ab,
    crystalRoughness: 0.12,
    iridescence: 0.84,
    ior: 1.63,
    emissiveHex: 0xc79bff,
    emissiveIntensity: 0.07,
    sightlineBeamHex: 0xd2a8ff,
  },
  {
    id: 'MENSA_QUANTUM_IRIDIUM_GLASS',
    legacyBlackboardSkinId: 'OBSIDIAN_BRASS',
    order: 16,
    name: 'Mensa Quantum Iridium & Prismatic Glass',
    shortBadge: 'MENSA 99TH',
    milestoneTitle: 'Hall of Honours v2.0 · Mensa 99th-Percentile Laureate',
    unlockRequirementSummary: 'Score ≥ 80% on a Mensa-Tier Round (#69) · Zero Pay-to-Win.',
    craftProvenance:
      'Ultra-dense sintered iridium-platinum gimbals suspending ultraviolet quantum-dispersion crystal reserved for 99th-percentile laureates.',
    hubOrigin: 'global',
    baseDomainId: 11,
    swatchPrimaryCss: '#e8f1ff',
    swatchSecondaryCss: '#39227a',
    swatchCrystalCss: '#091124',
    stage3dSkinId: 'MYTHIC_CELESTIAL_DIAMOND',
    primaryMetalHex: 0xe8f1ff,
    secondaryMetalHex: 0x39227a,
    metalRoughness: 0.11,
    shutterRoughness: 0.13,
    crystalColorHex: 0x091124,
    attenuationHex: 0x4b2eb8,
    crystalRoughness: 0.09,
    iridescence: 1.0,
    ior: 1.7,
    emissiveHex: 0x8ef2ff,
    emissiveIntensity: 0.07,
    sightlineBeamHex: 0xc8a2ff,
  },
];

export const PRISM_ATELIER_FINISHES: readonly PrismMaterialFinishSpec[] = [
  ...PRISM_ATELIER_FINISHES_V1_CORE,
  ...PRISM_ATELIER_FINISHES_V2_EXPANSION,
];

function readHonourUnlockedFinishIds(): PrismFinishId[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(ATELIER_HONOUR_UNLOCKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is PrismFinishId =>
      PRISM_ATELIER_FINISHES.some((f) => f.id === id),
    );
  } catch {
    return [];
  }
}

export function grantAtelierFinishUnlock(id: PrismFinishId): boolean {
  const current = readHonourUnlockedFinishIds();
  if (current.includes(id)) return false;
  current.push(id);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ATELIER_HONOUR_UNLOCKS_STORAGE_KEY, JSON.stringify(current));
    }
  } catch {
    // Ignore quota errors
  }
  return true;
}

export function getPrismFinishSpec(id: PrismFinishId | string | null | undefined): PrismMaterialFinishSpec {
  const found = PRISM_ATELIER_FINISHES.find((f) => f.id === id);
  return found ?? PRISM_ATELIER_FINISHES[0];
}

export function getEquippedPrismFinishId(): PrismFinishId {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(ATELIER_EQUIPPED_STORAGE_KEY);
      if (saved && PRISM_ATELIER_FINISHES.some((f) => f.id === saved)) {
        return saved as PrismFinishId;
      }
    }
  } catch {
    // Ignore storage read restrictions
  }
  return 'SOVEREIGN_OBSIDIAN_24K';
}

export function loadEquippedPrismFinish(): PrismMaterialFinishSpec {
  return getPrismFinishSpec(getEquippedPrismFinishId());
}

export function saveEquippedPrismFinishId(id: PrismFinishId): PrismMaterialFinishSpec {
  const spec = getPrismFinishSpec(id);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ATELIER_EQUIPPED_STORAGE_KEY, spec.id);
    }
  } catch {
    // Ignore storage quota errors
  }
  return spec;
}

interface MilestoneTelemetry {
  dailyStreak: number;
  dailyBestPercentile: number;
  bestEndlessDepth: number;
  trialsElo: number;
  trialsWins: number;
  globalElo: number;
  bestStreak: number;
  totalCorrect: number;
  visualBlueprintsSolved: number;
  duelWins: number;
  srsBox5Mastered: number;
  mensaBestAccPct: number;
}

function readMilestoneTelemetry(pSnap: PassportStateSnapshot): MilestoneTelemetry {
  let dailyStreak = 0;
  let dailyBestPercentile = Math.max(0, ...pSnap.dailyHistory.map((d) => d.percentile));
  let bestEndlessDepth = 0;
  let trialsElo = 1200;
  let trialsWins = 0;
  let visualBlueprintsSolved = 0;
  let duelWins = 0;
  let srsBox5Mastered = 0;
  let mensaBestAccPct = 0;

  try {
    if (typeof localStorage !== 'undefined') {
      const rawDaily = localStorage.getItem(DAILY_STORAGE_KEY);
      if (rawDaily) {
        const parsed = JSON.parse(rawDaily) as { dailyStreak?: number; bestPercentile?: number };
        dailyStreak = Math.max(0, Math.floor(Number(parsed?.dailyStreak) || 0));
        dailyBestPercentile = Math.max(
          dailyBestPercentile,
          Math.floor(Number(parsed?.bestPercentile) || 0),
        );
      }
      const rawEndless = localStorage.getItem(ENDLESS_STORAGE_KEY);
      if (rawEndless) {
        const parsed = JSON.parse(rawEndless) as { bestDepthEver?: number; depth?: number };
        bestEndlessDepth = Math.max(
          0,
          Math.floor(Number(parsed?.bestDepthEver) || 0),
          Math.floor(Number(parsed?.depth) || 0) - 1,
        );
      }
      const rawTrials = localStorage.getItem(TRIALS_STORAGE_KEY);
      if (rawTrials) {
        const parsed = JSON.parse(rawTrials) as { trialsElo?: number; wins?: number };
        trialsElo = Math.max(700, Math.floor(Number(parsed?.trialsElo) || 1200));
        trialsWins = Math.max(0, Math.floor(Number(parsed?.wins) || 0));
      }
      const rawAnalytics = localStorage.getItem('ws_career_analytics_v1');
      if (rawAnalytics) {
        const parsed = JSON.parse(rawAnalytics) as {
          feats?: {
            visualBlueprintsSolved?: number;
            duelGhostWins?: number;
            difficultyBestAccuracyPct?: { MENSA?: number };
          };
        };
        visualBlueprintsSolved = Math.max(0, Math.floor(Number(parsed?.feats?.visualBlueprintsSolved) || 0));
        duelWins = Math.max(duelWins, Math.floor(Number(parsed?.feats?.duelGhostWins) || 0));
        mensaBestAccPct = Math.max(0, Math.floor(Number(parsed?.feats?.difficultyBestAccuracyPct?.MENSA) || 0));
      }
      const rawDuels = localStorage.getItem('ws_duel_rivals_v2');
      if (rawDuels) {
        const parsed = JSON.parse(rawDuels) as {
          history?: Array<{ winner?: string }>;
          rivalsById?: Record<string, { lossesAgainstPlayer?: number }>;
        };
        const histWins = Array.isArray(parsed?.history)
          ? parsed.history.filter((h) => h?.winner === 'PLAYER').length
          : 0;
        const rivalWins =
          parsed?.rivalsById && typeof parsed.rivalsById === 'object'
            ? Object.values(parsed.rivalsById).reduce(
                (acc, r) => acc + Math.max(0, Math.floor(Number(r?.lossesAgainstPlayer) || 0)),
                0,
              )
            : 0;
        duelWins = Math.max(duelWins, histWins, rivalWins);
      }
      const rawSrs = localStorage.getItem('ws_spaced_repetition_v2');
      if (rawSrs) {
        const parsed = JSON.parse(rawSrs) as { cards?: Array<{ box?: number }> };
        if (Array.isArray(parsed?.cards)) {
          srsBox5Mastered = parsed.cards.filter((c) => Number(c?.box) === 5).length;
        }
      }
    }
  } catch {
    // Ignore parse errors
  }

  const skillSnap = forgeEngine.getSkillSnapshot();
  return {
    dailyStreak,
    dailyBestPercentile,
    bestEndlessDepth,
    trialsElo,
    trialsWins,
    globalElo: skillSnap.globalElo,
    bestStreak: skillSnap.bestStreak,
    totalCorrect: skillSnap.totalCorrect,
    visualBlueprintsSolved,
    duelWins,
    srsBox5Mastered,
    mensaBestAccPct,
  };
}

/**
 * Evaluates real-time Zero-Pay-to-Win unlock status & progress across all 12 finishes!
 */
export function evaluatePrismFinishUnlocks(
  passport: PassportSystem,
  blackboard?: InkBlackboard,
): PrismFinishUnlockStatus[] {
  const pSnap = passport.getSnapshot();
  const bSnap = blackboard?.getSnapshot() ?? null;
  const equippedId = getEquippedPrismFinishId();
  const tel = readMilestoneTelemetry(pSnap);
  const honourUnlocked = new Set(readHonourUnlockedFinishIds());
  const maxDomainElo = Math.max(1200, ...pSnap.domainElo);

  return PRISM_ATELIER_FINISHES.map((spec): PrismFinishUnlockStatus => {
    const equipped = spec.id === equippedId;
    const byHonour = honourUnlocked.has(spec.id);

    if (spec.id === 'SOVEREIGN_OBSIDIAN_24K') {
      return { spec, unlocked: true, equipped, progressRatio: 1, progressLabel: 'Geneva Standard Issue' };
    }

    if (spec.id === 'DAMASCUS_STEEL_AMBER') {
      const gbVisa = pSnap.visas.gb;
      const unlocked =
        byHonour ||
        Boolean(gbVisa?.cleared) ||
        tel.dailyStreak >= 2 ||
        tel.bestEndlessDepth >= 3 ||
        Boolean(bSnap?.unlockedSkins.includes('DAMASCUS_TITANIUM'));
      const ratio = unlocked
        ? 1
        : Math.max((gbVisa?.missionsCompleted ?? 0) / 5, tel.dailyStreak / 2, tel.bestEndlessDepth / 3);
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: Math.min(1, ratio),
        progressLabel: unlocked ? 'Unlocked · London / Citation' : `London ${gbVisa?.missionsCompleted ?? 0}/5 · Streak ${tel.dailyStreak}/2d`,
      };
    }

    if (spec.id === 'KYOTO_URUSHI_KINTSUGI') {
      const jpVisa = pSnap.visas.jp;
      const unlocked =
        byHonour ||
        Boolean(jpVisa?.cleared) ||
        tel.bestEndlessDepth >= 5 ||
        tel.dailyStreak >= 3 ||
        Boolean(bSnap?.unlockedSkins.includes('KYOTO_KINTSUGI'));
      const ratio = unlocked
        ? 1
        : Math.max((jpVisa?.missionsCompleted ?? 0) / 5, tel.bestEndlessDepth / 5, tel.dailyStreak / 3);
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: Math.min(1, ratio),
        progressLabel: unlocked ? 'Unlocked · Tokyo / Depth 5' : `Tokyo ${jpVisa?.missionsCompleted ?? 0}/5 · Depth ${tel.bestEndlessDepth}/5`,
      };
    }

    if (spec.id === 'IMPERIAL_EMERALD_BRASS') {
      const brVisa = pSnap.visas.br;
      const unlocked =
        byHonour ||
        Boolean(brVisa?.cleared) ||
        tel.bestEndlessDepth >= 10 ||
        Boolean(bSnap?.unlockedSkins.includes('EMERALD_SOVEREIGN'));
      const ratio = unlocked
        ? 1
        : Math.max((brVisa?.missionsCompleted ?? 0) / 5, tel.bestEndlessDepth / 10);
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: Math.min(1, ratio),
        progressLabel: unlocked ? 'Unlocked · Rio / Depth 10' : `Rio ${brVisa?.missionsCompleted ?? 0}/5 · Depth ${tel.bestEndlessDepth}/10`,
      };
    }

    if (spec.id === 'PHARAONIC_LAPIS_ELECTRUM') {
      const egVisa = pSnap.visas.eg;
      const unlocked =
        byHonour || Boolean(egVisa?.cleared) || tel.dailyStreak >= 5 || tel.dailyBestPercentile >= 75;
      const ratio = unlocked
        ? 1
        : Math.max((egVisa?.missionsCompleted ?? 0) / 5, tel.dailyStreak / 5, tel.dailyBestPercentile / 75);
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: Math.min(1, ratio),
        progressLabel: unlocked ? 'Unlocked · Cairo / Top 25%' : `Cairo ${egVisa?.missionsCompleted ?? 0}/5 · Best ${tel.dailyBestPercentile}/75%ile`,
      };
    }

    if (spec.id === 'AURORA_DICHROIC_TITANIUM') {
      const isVisa = pSnap.visas.is;
      const peakElo = Math.max(tel.globalElo, tel.trialsElo);
      const unlocked =
        byHonour ||
        Boolean(isVisa?.cleared) ||
        Boolean(pSnap.visas.global?.cleared) ||
        tel.bestEndlessDepth >= 15 ||
        peakElo >= 1550;
      const ratio = unlocked
        ? 1
        : Math.max((isVisa?.missionsCompleted ?? 0) / 5, tel.bestEndlessDepth / 15, Math.max(0, (peakElo - 1200) / 350));
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: Math.min(1, ratio),
        progressLabel: unlocked ? 'Unlocked · Reykjavik / Grandmaster' : `Reykjavik ${isVisa?.missionsCompleted ?? 0}/5 · Elo ${peakElo}/1550`,
      };
    }

    if (spec.id === 'BLACK_SALON_CRIMSON_OBSIDIAN') {
      const unlocked =
        byHonour ||
        tel.trialsWins >= 1 ||
        Boolean(bSnap?.unlockedSkins.includes('BLACK_SALON_CRIMSON'));
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: unlocked ? 1 : 0,
        progressLabel: unlocked ? 'Unlocked · Black Salon Citation' : 'Win 1 Ghost Duel or Catch a Rival Bluff',
      };
    }

    if (spec.id === 'STERLING_CHRONOMETER_RHODIUM') {
      const unlocked = byHonour || tel.bestStreak >= 10;
      const ratio = unlocked ? 1 : Math.min(1, tel.bestStreak / 10);
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: ratio,
        progressLabel: unlocked ? 'Unlocked · Envoy Sterling Citation' : `Peak Streak ${tel.bestStreak} / 10`,
      };
    }

    if (spec.id === 'CONSUL_MALACHITE_VERDIGRIS') {
      const unlocked = byHonour || tel.bestStreak >= 20 || tel.totalCorrect >= 100 || maxDomainElo >= 1500;
      const ratio = unlocked
        ? 1
        : Math.min(1, Math.max(tel.bestStreak / 20, tel.totalCorrect / 100, Math.max(0, (maxDomainElo - 1200) / 300)));
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: ratio,
        progressLabel: unlocked ? 'Unlocked · Consul 24K Citation' : `Correct ${tel.totalCorrect}/100 · Max ELO ${maxDomainElo}/1500`,
      };
    }

    if (spec.id === 'ARBITER_SMOKED_SAPPHIRE_PLATINUM') {
      const sgVisa = pSnap.visas.sg;
      const unlocked = byHonour || Boolean(sgVisa?.cleared) || tel.bestStreak >= 35 || pSnap.unlockedRelics.length >= 6;
      const ratio = unlocked
        ? 1
        : Math.min(1, Math.max((sgVisa?.missionsCompleted ?? 0) / 5, tel.bestStreak / 35, pSnap.unlockedRelics.length / 6));
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: ratio,
        progressLabel: unlocked ? 'Unlocked · Arbiter Sapphire Citation' : `Relics ${pSnap.unlockedRelics.length}/6 · Streak ${tel.bestStreak}/35`,
      };
    }

    if (spec.id === 'SOLAR_OCULUS_WHITE_GOLD') {
      const unlocked = byHonour || tel.bestStreak >= 15;
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: unlocked ? 1 : Math.min(1, tel.bestStreak / 15),
        progressLabel: unlocked ? 'Unlocked · 6.0x Overclock Citation' : '3× 6.0x Max Overclocks in 1 Match · OR 15-Streak',
      };
    }

    if (spec.id === 'CELESTIAL_DIAMOND_SOVEREIGN') {
      const unlocked = byHonour || Boolean(bSnap && bSnap.achievedEndings.length >= 4);
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: unlocked ? 1 : Math.min(1, (bSnap?.achievedEndings.length ?? 0) / 4),
        progressLabel: unlocked ? 'Unlocked · Mythic 0.1% Crown' : 'Earn ANY Tier-5 Mythic Trophy in Hall of Honours',
      };
    }

    if (spec.id === 'SAPPHIRE_BLUEPRINT_CYANOTYPE') {
      const unlocked = byHonour || tel.visualBlueprintsSolved >= 10;
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: unlocked ? 1 : Math.min(1, tel.visualBlueprintsSolved / 10),
        progressLabel: unlocked
          ? 'Unlocked · Master Blueprint Architect'
          : `Visual Blueprints Solved ${tel.visualBlueprintsSolved}/10`,
      };
    }

    if (spec.id === 'DUELIST_BLOODSTONE_PLATINUM') {
      const unlocked = byHonour || tel.duelWins >= 1;
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: unlocked ? 1 : 0,
        progressLabel: unlocked
          ? 'Unlocked · Ghost Split Breaker'
          : 'Beat a Challenger Ghost in a 1v1 Duel',
      };
    }

    if (spec.id === 'NEURAL_ENGRAM_AMETHYST_GOLD') {
      const unlocked = byHonour || tel.srsBox5Mastered >= 5;
      return {
        spec,
        unlocked,
        equipped,
        progressRatio: unlocked ? 1 : Math.min(1, tel.srsBox5Mastered / 5),
        progressLabel: unlocked
          ? 'Unlocked · Leitner Box-5 Polymath'
          : `Box-5 Mastered Cards ${tel.srsBox5Mastered}/5`,
      };
    }

    // 16. MENSA_QUANTUM_IRIDIUM_GLASS
    const unlocked = byHonour || tel.mensaBestAccPct >= 80;
    return {
      spec,
      unlocked,
      equipped,
      progressRatio: unlocked ? 1 : Math.min(1, tel.mensaBestAccPct / 80),
      progressLabel: unlocked
        ? 'Unlocked · Mensa 99th-Percentile Laureate'
        : `Mensa Best Round ${tel.mensaBestAccPct}% / 80%`,
    };
  });
}

const PRISM_HARDWARE_NODE_PREFIXES = [
  'Facet_Carousel',
  'Carousel_Spider',
  'Facet_',
  'Gimbal_Outer',
  'Gimbal_Equatorial',
  'Brass_Crown',
  'Shutter_',
  'Overclock_Jaw_',
  'Firing_Pin',
  'Prism_Pedestal',
  'Ring_Outer',
  'Ring_Mid',
  'Petal_',
  'Caliper_',
  'Orb_Base',
  'Cryptex_Ring_',
  'Chronometer_Bezel',
  'Chronometer_Needle',
];

function classifyPrismHardwareRole(obj: THREE.Object3D): 'PRIMARY_METAL' | 'SHUTTER_SECONDARY' | 'NONE' {
  let curr: THREE.Object3D | null = obj;
  let insidePrismHardware = false;
  let isSecondary = false;

  while (curr) {
    const nm = curr.name || '';
    if (nm.startsWith('Shutter_') || nm.startsWith('Petal_') || nm === 'Gimbal_Equatorial' || nm === 'Ring_Mid') {
      isSecondary = true;
      insidePrismHardware = true;
    } else if (PRISM_HARDWARE_NODE_PREFIXES.some((p) => nm.startsWith(p))) {
      insidePrismHardware = true;
    }
    curr = curr.parent;
  }

  if (!insidePrismHardware) return 'NONE';
  return isSecondary ? 'SHUTTER_SECONDARY' : 'PRIMARY_METAL';
}

export function applyPrismFinishToStage3D(
  stage3d: Stage3DDirector,
  skinSpec: PrismMaterialFinishSpec,
  options: { updateDomainPalette?: boolean } = {},
): void {
  if (options.updateDomainPalette) {
    stage3d.setDomain(skinSpec.baseDomainId);
  }

  stage3d.equipPrismSkin({
    id: skinSpec.stage3dSkinId,
    name: skinSpec.name,
    metalHex: skinSpec.primaryMetalHex,
    secondaryMetalHex: skinSpec.secondaryMetalHex,
    shutterHex: skinSpec.secondaryMetalHex,
    crystalHex: skinSpec.crystalColorHex,
    accentHex: skinSpec.sightlineBeamHex,
    metalRoughness: skinSpec.metalRoughness,
    iridescence: skinSpec.iridescence,
    useDomainAccent: skinSpec.id === 'SOVEREIGN_OBSIDIAN_24K',
  });

  const root = stage3d.prismRig.root;
  root.traverse((obj) => {
    if (obj instanceof THREE.PointLight) {
      obj.color.setHex(skinSpec.emissiveHex);
      return;
    }

    if (!(obj instanceof THREE.Mesh)) return;
    if ('curveRadius' in obj && 'sync' in obj) return;

    if (obj.material instanceof THREE.ShaderMaterial && obj.material.uniforms?.uColor) {
      obj.material.uniforms.uColor.value.setHex(skinSpec.sightlineBeamHex);
      return;
    }

    if (obj.geometry instanceof THREE.RingGeometry && obj.material instanceof THREE.MeshBasicMaterial) {
      obj.material.color.setHex(skinSpec.sightlineBeamHex);
      return;
    }

    const rawMats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const clonedMats = rawMats.map((m) => {
      if (!m || !m.visible) return m;

      if (
        m instanceof THREE.MeshPhysicalMaterial &&
        (m.transmission > 0.25 || (m.transparent && m.clearcoat >= 0.8 && m.opacity < 0.96))
      ) {
        m.color.setHex(skinSpec.crystalColorHex);
        m.attenuationColor.setHex(skinSpec.attenuationHex);
        m.roughness = skinSpec.crystalRoughness;
        m.iridescence = Math.max(0.2, skinSpec.iridescence);
        m.ior = Math.max(1.77, skinSpec.ior);
        m.clearcoat = 1.0;
        m.clearcoatRoughness = 0.04;
        m.emissive.setHex(skinSpec.emissiveHex);
        m.emissiveIntensity = skinSpec.emissiveIntensity;
        return m;
      }

      if (m instanceof THREE.MeshStandardMaterial) {
        const role = classifyPrismHardwareRole(obj);
        if (role === 'NONE') return m;

        if (m.metalness < 0.32 && m.roughness > 0.45 && role === 'PRIMARY_METAL') {
          return m;
        }

        let targetMat = m;
        if (!(m.userData && m.userData.__wsAtelierUnique)) {
          targetMat = m.clone();
          targetMat.userData = { ...m.userData, __wsAtelierUnique: true };
        }

        if (role === 'SHUTTER_SECONDARY') {
          targetMat.color.setHex(skinSpec.secondaryMetalHex);
          targetMat.roughness = skinSpec.shutterRoughness;
          targetMat.metalness = Math.max(0.68, targetMat.metalness);
        } else {
          targetMat.color.setHex(skinSpec.primaryMetalHex);
          targetMat.roughness = skinSpec.metalRoughness;
          targetMat.metalness = Math.max(0.92, targetMat.metalness);
        }
        // Respect #171/#172 chiaroscuro IBL ceiling (<= 0.64) so 4.2-lux Key Light never washes out 24K gold
        targetMat.envMapIntensity = Math.min(targetMat.envMapIntensity || 0.62, 0.64);
        return targetMat;
      }

      return m;
    });

    obj.material = Array.isArray(obj.material) ? clonedMats : clonedMats[0];
  });
}

export function applyEquippedPrismFinishToStage3D(stage3d: Stage3DDirector): PrismMaterialFinishSpec {
  const spec = loadEquippedPrismFinish();
  applyPrismFinishToStage3D(stage3d, spec, { updateDomainPalette: false });
  return spec;
}

export class PrismAtelierView {
  private readonly deps: PrismAtelierDependencies;
  private modalBackdrop: HTMLElement | null = null;
  private mountedContainer: HTMLElement | null = null;
  private detachEscape: (() => void) | null = null;
  private callbacks: PrismAtelierCallbacks = {};

  private previewFinishId: PrismFinishId = getEquippedPrismFinishId();
  private peelPreviewOpen = false;
  private previewReqToken = 0;
  private overclockSurgeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(deps: PrismAtelierDependencies) {
    this.deps = deps;
    ensureMetaStylesInjected();
  }

  public isOpen(): boolean {
    return this.modalBackdrop !== null || this.mountedContainer !== null;
  }

  public open(callbacks: PrismAtelierCallbacks = {}): void {
    this.close();
    this.callbacks = callbacks;
    this.previewFinishId = getEquippedPrismFinishId();
    this.peelPreviewOpen = false;

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-meta-backdrop is-stage-dock';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-label', 'Prism Atelier — 12 Zero Pay-to-Win Finishes');

    document.body.appendChild(backdrop);
    this.modalBackdrop = backdrop;
    this.detachEscape = attachMetaEscapeHandler(() => this.handleBackOrClose());

    this.syncUiRootVisibility(true);
    void this.syncLive3DPreview(getPrismFinishSpec(this.previewFinishId), true);
    this.renderInto(backdrop, true);
  }

  private handleBackOrClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    if (this.callbacks.canGoBack && this.callbacks.onBack) {
      this.callbacks.onBack();
      return;
    }
    this.handleClose();
  }

  private handleClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    const onClose = this.callbacks.onClose;
    this.close();
    onClose?.();
  }

  public mount(container: HTMLElement, callbacks: PrismAtelierCallbacks = {}): void {
    this.unmount();
    this.callbacks = callbacks;
    this.previewFinishId = getEquippedPrismFinishId();
    this.mountedContainer = container;
    void this.syncLive3DPreview(getPrismFinishSpec(this.previewFinishId), true);
    this.renderInto(container, false);
  }

  public unmount(): void {
    this.previewReqToken += 1;
    if (this.detachEscape) {
      this.detachEscape();
      this.detachEscape = null;
    }
    if (this.overclockSurgeTimer) {
      clearTimeout(this.overclockSurgeTimer);
      this.overclockSurgeTimer = null;
    }
    this.syncUiRootVisibility(false);
    if (this.mountedContainer) {
      this.mountedContainer.innerHTML = '';
      this.mountedContainer = null;
    }
  }

  public close(): void {
    this.unmount();

    if (this.deps.stage3d) {
      this.deps.stage3d.setOverclockState(false, 0);
      applyEquippedPrismFinishToStage3D(this.deps.stage3d);
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.remove();
      this.modalBackdrop = null;
    }
  }

  private syncUiRootVisibility(hideBehind3D: boolean): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('ws-3d-showcase-open', hideBehind3D);
    const uiRoot = document.getElementById('ui-root');
    if (uiRoot) {
      uiRoot.style.visibility = hideBehind3D ? 'hidden' : 'visible';
    }
  }

  private async syncLive3DPreview(
    spec: PrismMaterialFinishSpec,
    reconfigurePrism = false,
  ): Promise<void> {
    const stage3d = this.deps.stage3d;
    if (!stage3d) return;
    const reqToken = ++this.previewReqToken;

    if (reconfigurePrism) {
      stage3d.setLightingMode('BROADCAST');
      await stage3d.setMorph('SIGHTLINE_LOCK', {
        options: ['SPIN', 'PEEL', 'OVERCLOCK', spec.shortBadge],
        domainId: spec.baseDomainId,
        initialIndex: 0,
        peelTier: this.peelPreviewOpen ? 2 : 1,
      });
      if (reqToken !== this.previewReqToken || !this.isOpen()) return;
      stage3d.setCameraShot(this.peelPreviewOpen ? 'PRISM_PEEL_INSPECT' : 'PRISM_STANDARD');
    } else {
      stage3d.setDomain(spec.baseDomainId);
    }

    if (reqToken !== this.previewReqToken || !this.isOpen()) return;
    applyPrismFinishToStage3D(stage3d, spec, { updateDomainPalette: false });
  }

  private rerender(): void {
    if (this.modalBackdrop) {
      this.modalBackdrop.className = 'ws-meta-backdrop is-stage-dock';
      this.syncUiRootVisibility(true);
      this.renderInto(this.modalBackdrop, true);
    } else if (this.mountedContainer) {
      this.renderInto(this.mountedContainer, false);
    }
  }

  private renderInto(host: HTMLElement, isModal: boolean): void {
    const statuses = evaluatePrismFinishUnlocks(this.deps.passport, this.deps.blackboard);
    const activeStatus =
      statuses.find((s) => s.spec.id === this.previewFinishId) ?? statuses[0];
    const activeSpec = activeStatus.spec;
    const unlockedCount = statuses.filter((s) => s.unlocked).length;

    const swatchStripHtml = `
      <div class="ws-meta-hscroll" style="padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.06);" aria-label="Select Prism Finish">
        ${statuses
          .map((st) => {
            const isPreview = st.spec.id === this.previewFinishId;
            return `
              <button
                type="button"
                class="ws-meta-chip ${isPreview ? 'is-active' : ''}"
                data-atelier-select="${st.spec.id}"
              >
                <span style="width:16px;height:16px;border-radius:50%;flex-shrink:0;background:conic-gradient(${st.spec.swatchPrimaryCss} 0deg 140deg, ${st.spec.swatchSecondaryCss} 140deg 260deg, ${st.spec.swatchCrystalCss} 260deg 360deg);box-shadow:0 0 0 1px rgba(255,255,255,0.45);"></span>
                <span>${escapeMetaHtml(st.spec.shortBadge)}</span>
                ${st.equipped ? '<span style="color:var(--emerald-win);font-size:10px;">✓</span>' : st.unlocked ? '' : '<span style="opacity:0.65;font-size:10px;">◇</span>'}
              </button>
            `;
          })
          .join('')}
      </div>
    `;

    const finishBodyHtml = `
      <!-- Active Finish Editorial Header & Equip Action -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:11px;min-width:0;">
            <span style="width:34px;height:34px;border-radius:50%;flex-shrink:0;background:conic-gradient(${activeSpec.swatchPrimaryCss} 0deg 140deg, ${activeSpec.swatchSecondaryCss} 140deg 260deg, ${activeSpec.swatchCrystalCss} 260deg 360deg);box-shadow:0 0 0 1.5px var(--gold-bright);"></span>
            <div style="min-width:0;">
              <div style="font-family:var(--font-display);font-size:15.5px;font-weight:800;color:var(--gold-bright);line-height:1.2;">
                ${escapeMetaHtml(activeSpec.name)}
              </div>
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--cyan-clue);margin-top:2px;">
                ${escapeMetaHtml(activeSpec.milestoneTitle)}
              </div>
            </div>
          </div>

          ${
            activeStatus.equipped
              ? `<span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--emerald-win);white-space:nowrap;flex-shrink:0;">✓ EQUIPPED</span>`
              : activeStatus.unlocked
                ? `<button type="button" class="ws-meta-btn-gold" id="ws-atelier-equip-btn" style="flex-shrink:0;">Equip</button>`
                : `<span style="font-family:var(--font-mono);font-size:10.5px;color:#9aa4b7;white-space:nowrap;flex-shrink:0;">◇ Preview</span>`
          }
        </div>

        <p style="margin:0;font-size:12.5px;color:var(--ivory-primary);line-height:1.45;">
          ${escapeMetaHtml(sanitizeMetaCopy(activeSpec.craftProvenance))}
        </p>

        <div style="display:flex;flex-direction:column;gap:5px;">
          <div style="display:flex;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:10.5px;color:${activeStatus.unlocked ? 'var(--emerald-win)' : 'var(--ivory-muted)'};">
            <span>${escapeMetaHtml(activeStatus.progressLabel)}</span>
            <span>${Math.round(activeStatus.progressRatio * 100)}%</span>
          </div>
          <div class="ws-meta-progress-track">
            <div class="ws-meta-progress-fill" style="width:${Math.round(activeStatus.progressRatio * 100)}%;background:${activeStatus.unlocked ? 'var(--emerald-win)' : 'var(--gold-bright)'};"></div>
          </div>
        </div>
      </div>

      <!-- Hairline Catalog of All Zero-Pay-to-Win Finishes -->
      <div class="ws-meta-section" style="border-bottom:none;gap:2px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
          <span class="ws-meta-section-title">All ${PRISM_ATELIER_FINISHES.length} Finishes (${unlockedCount}/${PRISM_ATELIER_FINISHES.length})</span>
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--emerald-win);">✦ 100% Zero Pay-to-Win</span>
        </div>
        ${statuses
          .map((st) => {
            const isPreview = st.spec.id === this.previewFinishId;
            return `
              <button
                type="button"
                class="ws-meta-row is-interactive ${isPreview ? 'is-focused' : ''}"
                data-atelier-select="${st.spec.id}"
                style="width:100%;text-align:left;"
              >
                <span style="display:inline-flex;align-items:center;gap:10px;min-width:0;">
                  <span style="width:20px;height:20px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg, ${st.spec.swatchPrimaryCss} 0%, ${st.spec.swatchSecondaryCss} 55%, ${st.spec.swatchCrystalCss} 100%);box-shadow:0 0 0 1px rgba(255,255,255,0.4);"></span>
                  <span style="min-width:0;display:flex;flex-direction:column;">
                    <span style="font-size:12.5px;font-weight:600;color:var(--ivory-primary);line-height:1.25;">${st.spec.order}. ${escapeMetaHtml(st.spec.name)}</span>
                    <span style="font-family:var(--font-mono);font-size:10px;color:#9aa4b7;">${escapeMetaHtml(st.spec.unlockRequirementSummary)}</span>
                  </span>
                </span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${st.equipped ? 'var(--emerald-win)' : st.unlocked ? 'var(--gold-bright)' : 'var(--ivory-dim)'};flex-shrink:0;">
                  ${st.equipped ? '✓ ON' : st.unlocked ? '◆ READY' : `${Math.round(st.progressRatio * 100)}%`}
                </span>
              </button>
            `;
          })
          .join('')}
      </div>
    `;

    if (isModal) {
      const vaultFloatingHtml = renderVaultJumperHtml('ATELIER', {
        isModal: true,
        closeBtnId: 'ws-atelier-close',
        canNavigate: Boolean(this.callbacks.onNavigateSection),
        floatingVariant: true,
      });

      host.innerHTML = `
        <!-- Open Unobstructed 50dvh Portrait / 50vw Landscape 3D Prism Stage -->
        <div class="ws-meta-stage-zone">
          <div class="ws-meta-stage-top">
            <button type="button" class="ws-meta-float-pill" id="ws-atelier-back" data-meta-back="true" aria-label="Back">← Back</button>
            ${vaultFloatingHtml}
          </div>
          <div class="ws-meta-stage-bottom">
            <span class="ws-meta-orbit-whisper">↻ Drag 3D to Orbit</span>
            ${
              this.deps.stage3d
                ? `
                  <div class="ws-meta-stage-actions">
                    <button
                      type="button"
                      class="ws-meta-float-pill ${this.peelPreviewOpen ? 'is-active-gold' : ''}"
                      id="ws-atelier-peel-toggle"
                      aria-pressed="${this.peelPreviewOpen}"
                    >
                      ✦ ${this.peelPreviewOpen ? 'Seal' : 'Peel'}
                    </button>
                    <button
                      type="button"
                      class="ws-meta-float-pill"
                      id="ws-atelier-overclock-pulse"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Surge
                    </button>
                  </div>
                `
                : ''
            }
          </div>
        </div>

        <!-- Sleek 45-46dvh Portrait / 50vw Landscape Dark-Obsidian Bottom Sheet -->
        <div class="ws-meta-sheet">
          <div class="ws-meta-drag-handle" aria-hidden="true"></div>
          <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:4px 16px 6px;border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0;">
            <h2 class="ws-meta-title" style="flex-shrink:0;">PRISM ATELIER</h2>
            <span class="ws-meta-eyebrow">${unlockedCount}/${PRISM_ATELIER_FINISHES.length} Unlocked</span>
          </div>
          ${swatchStripHtml}
          <div class="ws-meta-body-scroll">
            ${finishBodyHtml}
          </div>
        </div>
      `;

      this.bindEvents(host);
      return;
    }

    const vaultJumperHtml = renderVaultJumperHtml('ATELIER', {
      isModal: false,
      closeBtnId: 'ws-atelier-close',
      canNavigate: Boolean(this.callbacks.onNavigateSection),
    });

    host.innerHTML = `
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-atelier-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">PRISM ATELIER</h2>
              <div class="ws-meta-eyebrow">${unlockedCount}/${PRISM_ATELIER_FINISHES.length} Finishes Unlocked</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${vaultJumperHtml}
          </div>
        </div>
        ${swatchStripHtml}
        <div class="ws-meta-body-scroll">
          ${finishBodyHtml}
        </div>
      </div>
    `;

    this.bindEvents(host);
  }

  private bindEvents(host: HTMLElement): void {
    host.querySelector('#ws-atelier-back')?.addEventListener('click', () => {
      this.handleBackOrClose();
    });

    bindVaultJumperEvents(host, {
      closeBtnId: 'ws-atelier-close',
      onNavigate: (target) => this.callbacks.onNavigateSection?.(target),
      onClose: () => this.handleClose(),
      onTapFeedback: () => {
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
      },
    });

    host.querySelectorAll<HTMLButtonElement>('[data-atelier-select]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.atelierSelect as PrismFinishId | undefined;
        if (!id) return;
        this.previewFinishId = id;
        const spec = getPrismFinishSpec(id);
        this.deps.haptics?.sightlineSnap();
        this.deps.audio?.playSfx('sightline_snap');
        void this.syncLive3DPreview(spec, true);
        this.rerender();
      });
    });

    host.querySelector('#ws-atelier-equip-btn')?.addEventListener('click', () => {
      const statuses = evaluatePrismFinishUnlocks(this.deps.passport, this.deps.blackboard);
      const chosen = statuses.find((s) => s.spec.id === this.previewFinishId);
      if (!chosen || !chosen.unlocked) return;

      const equippedSpec = saveEquippedPrismFinishId(chosen.spec.id);
      this.deps.blackboard?.unlockSkin(equippedSpec.legacyBlackboardSkinId, true);

      if (this.deps.stage3d) {
        applyPrismFinishToStage3D(this.deps.stage3d, equippedSpec, { updateDomainPalette: false });
      }
      this.deps.haptics?.lockThunk();
      this.deps.audio?.playSfx('vault_thunk');
      this.deps.audio?.playSfx('gold_resonance');
      this.callbacks.onEquipSkin?.(equippedSpec);
      this.rerender();
    });

    host.querySelector('#ws-atelier-peel-toggle')?.addEventListener('click', () => {
      this.peelPreviewOpen = !this.peelPreviewOpen;
      this.deps.haptics?.peel(this.peelPreviewOpen ? 2 : 1);
      this.deps.audio?.playSfx('shutter_peel');
      void this.syncLive3DPreview(getPrismFinishSpec(this.previewFinishId), true);
      this.rerender();
    });

    host.querySelector('#ws-atelier-overclock-pulse')?.addEventListener('click', () => {
      const stage3d = this.deps.stage3d;
      if (!stage3d) return;
      if (this.overclockSurgeTimer) {
        clearTimeout(this.overclockSurgeTimer);
      }
      this.deps.haptics?.overclockPulse(0.85);
      this.deps.audio?.playSfx('overclock_charge');
      stage3d.setOverclockState(true, 0.92);
      this.overclockSurgeTimer = setTimeout(() => {
        this.overclockSurgeTimer = null;
        if (!this.isOpen()) return;
        stage3d.setOverclockState(false, 0);
        this.deps.audio?.playSfx('gold_resonance');
      }, 950);
    });
  }
}
