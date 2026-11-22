// ============================================================================
// WORLD'S SMARTEST — Wave-2 Deep Narrative, Backstage Hub, Callouts & Lore Logs
// Implements #130 & #131 Contracts:
//   • Hydrates `public/data/narrative_wave2.json` seamlessly (w/ full built-in seed)
//   • 8 Backstage Interrogation & Hub Conversations wired to `vo_wave2_manifest.json`
//   • 24 Modular Tier-2 Live Gameplay Callouts (`callout_*.mp3`) w/ anti-repeat queue
//   • 40 Redacted Ledger Lore Logs for Endless Archive Descent Airlocks (Q5..Q200)
//   • 8 Detailed Tier-3 Relic Provenance & 3-Step Engraved Latch Clues
//   • Personalized Geneva-to-Singapore Choice Chronicle for Ending Sequences
// ============================================================================

import { PERK_CATALOG, type CastMemberId, type InkBlackboard } from './InkBlackboard';
import type { HeroRelicId, HubId, PassportSystem, PerkId } from './PassportSystem';
import {
  claimGameplayBarkVoiceUrl,
  hasPlayedGameplayBarkInSession,
  reactionVarietyBank,
  type ReactionTriggerKind,
} from './ReactionVarietyBank';
import { getPortraitUrl, type CharacterExpression } from './RivalAI';

export type LiveCalloutEvent =
  | 'COLD_INSTINCT'
  | 'TIER2_PEEL'
  | 'TIER3_PEEL'
  | 'OVERCLOCK_BOLD'
  | 'OVERCLOCK_CANCEL'
  | 'CALIBRATOR_PINHOLE'
  | 'CODEX_LOCK'
  | 'GAUNTLET_SWEEP'
  | 'RELIC_LATCH'
  | 'FINAL_QUESTION'
  | 'RIVAL_OVERCLOCK_TAUNT'
  | 'RIVAL_PEEL_TAUNT'
  | 'RIVAL_IMPRESSED'
  | 'SOREN_BLUFF'
  | 'SOREN_COIN_FREEZE'
  | 'TEO_HINT_NUDGE'
  | 'SHIELD_WARN';

export interface LiveGameplayCallout {
  id: string;
  event: LiveCalloutEvent;
  speakerId: CastMemberId;
  speakerName: string;
  expression: CharacterExpression;
  portraitUrl: string;
  voiceUrl: string;
  subtitle: string;
}

export interface BackstageDialogueOption {
  id: string;
  label: string;
  nextNodeId?: string;
  responseVoiceUrl?: string;
  responseText: string;
  integrityDelta?: number;
  publicTrustDelta?: number;
  councilFavorDelta?: number;
  bondNpc?: CastMemberId;
  bondDelta?: number;
  bondsDeltaMap?: Partial<Record<CastMemberId, number>>;
  setFlag?: Record<string, string | boolean>;
  unlockEvidenceClue?: string;
  unlockPerk?: PerkId;
  vaultClue?: string;
}

export interface BackstageDialogueNode {
  id: string;
  speakerId: CastMemberId;
  speakerName: string;
  expression: CharacterExpression;
  portraitUrl: string;
  voiceClipId?: string;
  voiceUrl?: string;
  text: string;
  tellId?: string;
  tellHint?: string;
  nextNodeId?: string | null;
  passiveDomainCheck?: {
    domainId: number;
    minTheta: number;
    insight: string;
  };
  options?: BackstageDialogueOption[];
}

export interface BackstageHubConversation {
  id?: string;
  hubId: HubId;
  city?: string;
  title: string;
  locationLabel: string;
  venueRoomGlb?: string;
  ambienceUrl: string;
  lightingMode?: string;
  unlockAfterMission?: string;
  entryNodeId?: string;
  interlocutorId: CastMemberId;
  nodes: BackstageDialogueNode[];
}

export interface RelicLatchClue {
  step: 1 | 2 | 3;
  latchName: string;
  nodeHint?: string;
  engraving: string;
  deductionHint: string;
  domainId?: number;
  glyphId?: string;
  glyphUrl?: string;
  unlockVoiceUrl?: string;
}

export interface Tier3RelicDeepProvenance {
  relicId: HeroRelicId;
  hubId: HubId;
  name?: string;
  city?: string;
  venueName?: string;
  glbUrl: string;
  fallbackGlbUrl: string;
  visaStampUrl?: string;
  signatureGlyphId?: string;
  signatureGlyphUrl?: string;
  domainId?: number;
  yearCrafted?: number;
  artisanAttribution?: string;
  metallurgySpec?: string;
  archiveCode: string;
  provenanceEssay: string;
  conspiracySignificance: string;
  uvHiddenInscription?: string;
  inspectionHotspots?: Array<Record<string, unknown>>;
  latches: [RelicLatchClue, RelicLatchClue, RelicLatchClue];
}

export interface PersonaCeremonySpec {
  personaId: string;
  title: string;
  motto: string;
  startingPerkId: string;
  speaker: CastMemberId;
  expression: CharacterExpression;
  tellId?: string;
  tellCaption?: string;
  voiceClipId: string;
  voiceUrl: string;
  text: string;
  portraitUrl: string;
}

export interface BossPhaseBannerSpec {
  phaseNumber: 1 | 2 | 3;
  phase?: 1 | 2 | 3;
  code?: string;
  title: string;
  bannerTitle?: string;
  subtitle: string;
  bannerSubtitle?: string;
  archetype?: string;
  lightingMode?: string;
  voiceClipId?: string;
  voiceUrl?: string;
  text?: string;
}

export interface ArchiveWave2LoreLog {
  id?: string;
  airlockNumber: number; // 1..40 (unlocked at Depth 5, 10, ..., 200)
  depth: number;
  strataId?: string;
  strataLabel: string;
  classification?: string;
  dateStamp?: string;
  source?: string;
  relatedSuspectId?: CastMemberId;
  code: string;
  title: string;
  redactedTeaser?: string;
  body: string;
  nextStrataWarning?: string;
}

export interface ChoiceChronicleEntry {
  hubId: HubId;
  city: string;
  decisionTitle: string;
  chosenOutcome: string;
  tone: 'gold' | 'cyan' | 'crimson';
}

const SPEAKER_NAMES: Record<CastMemberId, string> = {
  vance: 'Julian Vance',
  nadia: 'Nadia Al-Mansoor',
  soren: 'Soren "Echo" Kael',
  teo: 'Mateo "Teo" Rojas',
  lindqvist: 'Chancellor Ingrid Lindqvist',
  tariq: 'Tariq Al-Mansoor',
};

/**
 * Exact 5 Real Microphone-Recorded Venue Acoustic Room-Air Beds (`#131`, ZERO MIDI!)
 */
export const VENUE_AMBIENCE_URLS: Record<HubId, string> = {
  ch: 'assets/audio/ambience_chamber_room.mp3',
  gb: 'assets/audio/ambience_london_rain.mp3',
  jp: 'assets/audio/ambience_tokyo_neon_rain.mp3',
  br: 'assets/audio/ambience_london_rain.mp3',
  eg: 'assets/audio/ambience_cairo_vault_air.mp3',
  is: 'assets/audio/ambience_cairo_vault_air.mp3',
  sg: 'assets/audio/ambience_tokyo_neon_rain.mp3',
  global: 'assets/audio/ambience_ocean_storm_air.mp3',
};

export function getVenueAmbienceUrl(hubId: HubId): string {
  return VENUE_AMBIENCE_URLS[hubId] ?? 'assets/audio/ambience_chamber_room.mp3';
}

/**
 * All 24 Modular Tier-2 Live Gameplay Callouts wired 1:1 to `#131` `callout_*.mp3`!
 */
export const TIER2_GAMEPLAY_CALLOUTS: readonly Omit<LiveGameplayCallout, 'portraitUrl'>[] = [
  {
    id: 'callout_vance_cold_instinct_1',
    event: 'COLD_INSTINCT',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_vance_cold_instinct_1.mp3',
    subtitle: 'Cold Instinct at three-point-zero—ruthless.',
  },
  {
    id: 'callout_vance_cold_instinct_2',
    event: 'COLD_INSTINCT',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_vance_cold_instinct_2.mp3',
    subtitle: 'Zero peel, pure conviction. Masterful.',
  },
  {
    id: 'callout_vance_tier2_peel_1',
    event: 'TIER2_PEEL',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_vance_tier2_peel_1.mp3',
    subtitle: 'Tier-Two Peel—trading multiplier for lateral clarity.',
  },
  {
    id: 'callout_vance_tier3_peel_1',
    event: 'TIER3_PEEL',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_vance_tier3_peel_1.mp3',
    subtitle: 'Blueprint Core exposed. Decoys shattered.',
  },
  {
    id: 'callout_vance_overclock_bold_1',
    event: 'OVERCLOCK_BOLD',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'intense',
    voiceUrl: 'assets/voice/callout_vance_overclock_bold_1.mp3',
    subtitle: 'Bold Overclock! Six-times stakes on the line.',
  },
  {
    id: 'callout_vance_overclock_cancel',
    event: 'OVERCLOCK_CANCEL',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_vance_overclock_cancel.mp3',
    subtitle: 'Bluff Echo! Pulled back from the edge just in time.',
  },
  {
    id: 'callout_vance_calibrator_pinhole',
    event: 'CALIBRATOR_PINHOLE',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'intense',
    voiceUrl: 'assets/voice/callout_vance_calibrator_pinhole.mp3',
    subtitle: 'Pinhole tolerance—dead center on the chronometer!',
  },
  {
    id: 'callout_vance_codex_lock',
    event: 'CODEX_LOCK',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_vance_codex_lock.mp3',
    subtitle: 'Dual rings aligned. The cryptex yields.',
  },
  {
    id: 'callout_vance_gauntlet_sweep',
    event: 'GAUNTLET_SWEEP',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'intense',
    voiceUrl: 'assets/voice/callout_vance_gauntlet_sweep.mp3',
    subtitle: 'Clean Gauntlet shatter. Reflexes like lightning.',
  },
  {
    id: 'callout_vance_relic_latch',
    event: 'RELIC_LATCH',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_vance_relic_latch.mp3',
    subtitle: 'Relic latch unlocked. One step closer to the core.',
  },
  {
    id: 'callout_vance_final_question',
    event: 'FINAL_QUESTION',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'intense',
    voiceUrl: 'assets/voice/callout_vance_final_question.mp3',
    subtitle: 'Final Prism on the table. Everything rides on this lock.',
  },
  {
    id: 'callout_nadia_overclock_taunt',
    event: 'RIVAL_OVERCLOCK_TAUNT',
    speakerId: 'nadia',
    speakerName: 'Nadia Al-Mansoor',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_nadia_overclock_taunt.mp3',
    subtitle: "Overclocking against me? You'd better be dead certain.",
  },
  {
    id: 'callout_nadia_peel_taunt',
    event: 'RIVAL_PEEL_TAUNT',
    speakerId: 'nadia',
    speakerName: 'Nadia Al-Mansoor',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_nadia_peel_taunt.mp3',
    subtitle: 'Peeling the seal already? Playing it safe, I see.',
  },
  {
    id: 'callout_nadia_impressed',
    event: 'RIVAL_IMPRESSED',
    speakerId: 'nadia',
    speakerName: 'Nadia Al-Mansoor',
    expression: 'shocked',
    voiceUrl: 'assets/voice/callout_nadia_impressed.mp3',
    subtitle: 'Okay—locking Cold Instinct on that domain was genuinely sharp.',
  },
  {
    id: 'callout_soren_bluff_1',
    event: 'SOREN_BLUFF',
    speakerId: 'soren',
    speakerName: 'Soren "Echo" Kael',
    expression: 'smirk',
    voiceUrl: 'assets/voice/callout_soren_bluff_1.mp3',
    subtitle: "My coin says you're bluffing that Overclock.",
  },
  {
    id: 'callout_soren_coin_freeze',
    event: 'SOREN_COIN_FREEZE',
    speakerId: 'soren',
    speakerName: 'Soren "Echo" Kael',
    expression: 'smirk',
    voiceUrl: 'assets/voice/callout_soren_coin_freeze.mp3',
    subtitle: 'Coin stopped spinning, friend. That means I already know it cold.',
  },
  {
    id: 'callout_soren_respect',
    event: 'RIVAL_IMPRESSED',
    speakerId: 'soren',
    speakerName: 'Soren "Echo" Kael',
    expression: 'smirk',
    voiceUrl: 'assets/voice/callout_soren_respect.mp3',
    subtitle: "Three-times Cold Instinct?! You're wrecking the spread!",
  },
  {
    id: 'callout_teo_hint_nudge',
    event: 'TEO_HINT_NUDGE',
    speakerId: 'teo',
    speakerName: 'Mateo "Teo" Rojas',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_teo_hint_nudge.mp3',
    subtitle: 'If the wording looks tricky, pull the Brass Crown once for the lateral clue!',
  },
  {
    id: 'callout_teo_bullseye',
    event: 'CALIBRATOR_PINHOLE',
    speakerId: 'teo',
    speakerName: 'Mateo "Teo" Rojas',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_teo_bullseye.mp3',
    subtitle: 'Dead bullseye on the dial! Look at that telemetry spike!',
  },
  {
    id: 'callout_teo_shield_warn',
    event: 'SHIELD_WARN',
    speakerId: 'teo',
    speakerName: 'Mateo "Teo" Rojas',
    expression: 'intense',
    voiceUrl: 'assets/voice/callout_teo_shield_warn.mp3',
    subtitle: "Careful—one Prism Shield left! Don't force a blind Overclock!",
  },
  {
    id: 'callout_lindqvist_cold',
    event: 'RIVAL_IMPRESSED',
    speakerId: 'lindqvist',
    speakerName: 'Chancellor Ingrid Lindqvist',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_lindqvist_cold.mp3',
    subtitle: 'Impressive precision. Almost worthy of Council clearance.',
  },
  {
    id: 'callout_lindqvist_scorn',
    event: 'RIVAL_OVERCLOCK_TAUNT',
    speakerId: 'lindqvist',
    speakerName: 'Chancellor Ingrid Lindqvist',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_lindqvist_scorn.mp3',
    subtitle: 'Reckless wagering is the mark of an amateur.',
  },
  {
    id: 'callout_tariq_steady',
    event: 'TEO_HINT_NUDGE',
    speakerId: 'tariq',
    speakerName: 'Tariq Al-Mansoor',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_tariq_steady.mp3',
    subtitle: "Trust the first connection your mind sees—don't second-guess it.",
  },
  {
    id: 'callout_tariq_triumph',
    event: 'RIVAL_IMPRESSED',
    speakerId: 'tariq',
    speakerName: 'Tariq Al-Mansoor',
    expression: 'neutral',
    voiceUrl: 'assets/voice/callout_tariq_triumph.mp3',
    subtitle: "Flawless synthesis! That's how you outthink the Ledger.",
  },
];

/**
 * 8 Backstage Interrogation & Hub Conversations wired to `#131` Wave-2 VO!
 */
export const DEFAULT_BACKSTAGE_CONVERSATIONS: Record<HubId, BackstageHubConversation> = {
  ch: {
    hubId: 'ch',
    title: 'Geneva Observation Gallery',
    locationLabel: 'Alpine Monolith · Backstage Corridor',
    ambienceUrl: VENUE_AMBIENCE_URLS.ch,
    interlocutorId: 'vance',
    nodes: [
      {
        id: 'ch_bs_1',
        speakerId: 'vance',
        speakerName: SPEAKER_NAMES.vance,
        expression: 'neutral',
        portraitUrl: getPortraitUrl('vance', 'neutral'),
        voiceUrl: 'assets/voice/vance_intro_2.mp3',
        text: 'Four hundred thousand applicants took the blind cipher, {challengerName}. Only your timing curve matched our 2019 benchmark.',
        tellHint: 'Vance adjusts his left brass cufflink when mentioning 2019.',
        options: [
          {
            id: 'ch_ask_2019',
            label: '"What happened in the 2019 benchmark?"',
            responseText: 'A dry run, officially. Unofficially—ask again if you survive Cairo.',
            integrityDelta: 4,
            bondNpc: 'vance',
            bondDelta: 1,
          },
          {
            id: 'ch_ask_blocs',
            label: '"Which Council bloc funded this vault?"',
            responseText: 'All three—because none of them trust the other two alone in the dark.',
            councilFavorDelta: 4,
          },
        ],
      },
    ],
  },
  gb: {
    hubId: 'gb',
    title: 'Sovereign Rotunda Antechamber',
    locationLabel: 'London · Beneath the Glass Floor',
    ambienceUrl: VENUE_AMBIENCE_URLS.gb,
    interlocutorId: 'lindqvist',
    nodes: [
      {
        id: 'gb_bs_1',
        speakerId: 'lindqvist',
        speakerName: SPEAKER_NAMES.lindqvist,
        expression: 'neutral',
        portraitUrl: getPortraitUrl('lindqvist', 'neutral'),
        voiceUrl: 'assets/voice/london_lindqvist_offer_1.mp3',
        text: 'Close the door. Every champion before you understood that brilliance requires institutional protection.',
        tellHint: 'Lindqvist slowly removes her platinum spectacles.',
        options: [
          {
            id: 'gb_confront_trial00',
            label: '"Refuse her protection & ask about Trial Zero"',
            responseVoiceUrl: 'assets/voice/london_lindqvist_burn.mp3',
            responseText: 'Sentimental defiance. Remember this moment when the Rotunda turns cold.',
            integrityDelta: 6,
            bondNpc: 'nadia',
            bondDelta: 1,
          },
          {
            id: 'gb_probe_nadia',
            label: '"Ask Nadia what she found under her plinth"',
            responseVoiceUrl: 'assets/voice/london_nadia_trial00_1.mp3',
            responseText: 'Hold on—did you see the brass serial under my Rotunda plinth? Trial Double-Zero, dated twenty nineteen.',
            integrityDelta: 8,
            bondNpc: 'nadia',
            bondDelta: 1,
          },
        ],
      },
    ],
  },
  jp: {
    hubId: 'jp',
    title: 'Sky Pavilion Rain Terrace',
    locationLabel: 'Tokyo · 72nd Floor Observation Deck',
    ambienceUrl: VENUE_AMBIENCE_URLS.jp,
    interlocutorId: 'soren',
    nodes: [
      {
        id: 'jp_bs_1',
        speakerId: 'soren',
        speakerName: SPEAKER_NAMES.soren,
        expression: 'smirk',
        portraitUrl: getPortraitUrl('soren', 'smirk'),
        voiceUrl: 'assets/voice/tokyo_soren_backstage_1.mp3',
        text: 'Nice view from the seventy-second floor, right? Down there is Shibuya—up here, information is currency.',
        tellHint: 'His silver coin freezes dead when Horizon’s relay pings.',
        options: [
          {
            id: 'jp_call_wire',
            label: '"Confront Soren with Teo’s 0.8-second packet trace"',
            responseVoiceUrl: 'assets/voice/tokyo_soren_confront_1.mp3',
            responseText: 'Caught my Horizon earpiece, did you? Name your price: share my probability lens, or trigger a live jammer and fly blind with me.',
            integrityDelta: 6,
            bondNpc: 'teo',
            bondDelta: 1,
          },
          {
            id: 'jp_poker_read',
            label: '"Press Soren on who bankrolled his feed"',
            responseVoiceUrl: 'assets/voice/tokyo_soren_aftermath.mp3',
            responseText: 'No feed, no odds, just pure nerve—and you still beat me. Listen: whoever bankrolled my feed answers to Cairo.',
            publicTrustDelta: 5,
            bondNpc: 'soren',
            bondDelta: 1,
          },
        ],
      },
    ],
  },
  br: {
    hubId: 'br',
    title: 'Botanical Canopy Greenroom',
    locationLabel: 'Rio de Janeiro · Sabotaged Calibration Bay',
    ambienceUrl: VENUE_AMBIENCE_URLS.br,
    interlocutorId: 'nadia',
    nodes: [
      {
        id: 'br_bs_1',
        speakerId: 'nadia',
        speakerName: SPEAKER_NAMES.nadia,
        expression: 'shocked',
        portraitUrl: getPortraitUrl('nadia', 'shocked'),
        voiceUrl: 'assets/voice/rio_nadia_sabotage_1.mp3',
        text: "My Prism clamps are surging—someone spiked my pod's voltage! If I let go now, my shield shatters!",
        tellHint: 'Teo scans the scorched relay under UV light.',
        options: [
          {
            id: 'br_trace_firmware',
            label: '"Have Teo trace the voltage spike origin"',
            responseVoiceUrl: 'assets/voice/rio_teo_trace.mp3',
            responseText: "That voltage spike didn't come from the arena—it was triggered with a Council override key.",
            integrityDelta: 8,
            bondNpc: 'teo',
            bondDelta: 1,
          },
        ],
      },
    ],
  },
  eg: {
    hubId: 'eg',
    title: 'Sub-Arena Limestone Vault',
    locationLabel: 'Cairo / Giza · Meridian Zero Chamber',
    ambienceUrl: VENUE_AMBIENCE_URLS.eg,
    interlocutorId: 'teo',
    nodes: [
      {
        id: 'eg_bs_1',
        speakerId: 'teo',
        speakerName: SPEAKER_NAMES.teo,
        expression: 'intense',
        portraitUrl: getPortraitUrl('teo', 'intense'),
        voiceUrl: 'assets/voice/cairo_teo_match_1.mp3',
        text: "Stop everything. Look at Julian Vance's private psychometric ledger: ninety-nine-point-four percent cognitive match.",
        tellHint: 'Emergency amber lanterns flicker across sealed Trial Zero crates.',
        options: [
          {
            id: 'eg_vance_why',
            label: '"Demand Julian Vance explain why he recruited you"',
            responseVoiceUrl: 'assets/voice/cairo_vance_confess_1.mp3',
            responseText: "I didn't recruit you by chance. Yours was the only mind on Earth capable of finishing what Tariq began.",
            integrityDelta: 6,
            bondNpc: 'vance',
            bondDelta: 1,
          },
        ],
      },
    ],
  },
  is: {
    hubId: 'is',
    title: 'Geothermal Relay Bunker',
    locationLabel: 'Reykjavik · Beneath the Basalt Caldera',
    ambienceUrl: VENUE_AMBIENCE_URLS.is,
    interlocutorId: 'tariq',
    nodes: [
      {
        id: 'is_bs_1',
        speakerId: 'tariq',
        speakerName: SPEAKER_NAMES.tariq,
        expression: 'neutral',
        portraitUrl: getPortraitUrl('tariq', 'neutral'),
        voiceUrl: 'assets/voice/reykjavik_tariq_reveal_1.mp3',
        text: "Step into the light. Yes—it's really me. Seven winters beneath the basalt caldera, waiting for a mind like yours.",
        tellHint: 'Tariq traces a crisp triangle on the volcanic table.',
        options: [
          {
            id: 'is_trojan_plan',
            label: '"Ask how the Trojan Horse Championship stops the Council"',
            responseVoiceUrl: 'assets/voice/reykjavik_vance_trojan_1.mp3',
            responseText: 'Once two billion viewers crown you live at the Apex Forum, not even the World Council can erase the keyholder.',
            integrityDelta: 10,
            bondNpc: 'tariq',
            bondDelta: 2,
          },
        ],
      },
    ],
  },
  sg: {
    hubId: 'sg',
    title: 'Sky-Bridge Crisis Concourse',
    locationLabel: 'Singapore · Above The Ledger Monoliths',
    ambienceUrl: VENUE_AMBIENCE_URLS.sg,
    interlocutorId: 'lindqvist',
    nodes: [
      {
        id: 'sg_bs_1',
        speakerId: 'lindqvist',
        speakerName: SPEAKER_NAMES.lindqvist,
        expression: 'neutral',
        portraitUrl: getPortraitUrl('lindqvist', 'neutral'),
        voiceUrl: 'assets/voice/singapore_lindqvist_trap.mp3',
        text: 'Did you truly believe every ally in your corner was immune to price? Step forward and show them.',
        tellHint: 'Ultraviolet alarms sweep across the glass sky-bridge.',
      },
    ],
  },
  global: {
    hubId: 'global',
    title: 'The Arbiter’s Threshold',
    locationLabel: 'International Waters · Apex Forum Podium',
    ambienceUrl: VENUE_AMBIENCE_URLS.global,
    interlocutorId: 'vance',
    nodes: [
      {
        id: 'global_bs_1',
        speakerId: 'vance',
        speakerName: SPEAKER_NAMES.vance,
        expression: 'neutral',
        portraitUrl: getPortraitUrl('vance', 'neutral'),
        voiceUrl: 'assets/voice/apex_vance_pass_torch.mp3',
        text: 'Seven years of shadow end tonight. The Veritas Prism is yours, Challenger. Make your final decree.',
        tellHint: 'Vance taps his silver stylus twice beside his right ear—his highest salute.',
      },
    ],
  },
};

/**
 * 8 Detailed Tier-3 Relic Provenances & 3-Step Engraved Latch Clues (`#127` & `#130`)
 */
export const TIER3_RELIC_PROVENANCE: Record<HeroRelicId, Tier3RelicDeepProvenance> = {
  meridian_astrolabe: {
    relicId: 'meridian_astrolabe',
    hubId: 'ch',
    glbUrl: 'assets/aaa_models/calibrator_chronometer.glb',
    fallbackGlbUrl: 'assets/aaa_models/calibrator_chronometer.glb',
    archiveCode: 'REL-CH-01 // GENEVA',
    provenanceEssay:
      'Hand-machined by master Geneva horologists in 2018 from meteoritic brass and synthetic corundum. Used by Julian Vance to test epistemic humility—whether a mind knows the exact bounds of its own certainty.',
    conspiracySignificance:
      'Its vernier zero-mark is offset by 0.6 degrees—the exact key angle needed to open Cairo’s Cipher Box.',
    latches: [
      {
        step: 1,
        latchName: 'Outer Horizon Vernier',
        engraving: 'IN CERTAINTY, MEASURE MARGIN',
        deductionHint: 'Align historical chronology within ±5 years.',
      },
      {
        step: 2,
        latchName: 'Solar Altitude Alidade',
        engraving: 'GENEVA CHARTER ART. IV',
        deductionHint: 'Cross-reference diplomatic treaty origins.',
      },
      {
        step: 3,
        latchName: 'Sapphire Zenith Pin',
        engraving: '99.4% RESONANCE',
        deductionHint: 'Lock the precision pinhole cone without hesitation.',
      },
    ],
  },
  armillary_orrery: {
    relicId: 'armillary_orrery',
    hubId: 'gb',
    glbUrl: 'assets/aaa_models/relic_london_orrery.glb',
    fallbackGlbUrl: 'assets/aaa_models/veritas_astrolabe_orb.glb',
    archiveCode: 'REL-GB-02 // LONDON',
    provenanceEssay:
      'Commissioned by the Sovereign Bloc in Greenwich brass and carved ivory. Three counter-balanced planetary rings model treaty equilibrium across centuries.',
    conspiracySignificance:
      'Scratched inside the inner ecliptic band are the initials "A.M. — 2019", proving Tariq Al-Mansoor held this exact sphere in Trial Zero.',
    latches: [
      {
        step: 1,
        latchName: 'Greenwich Prime Ring',
        engraving: 'LONGITUDE ZERO · 1884',
        deductionHint: 'Identify the maritime meridian standard.',
      },
      {
        step: 2,
        latchName: 'Sovereign Ecliptic Clasp',
        engraving: 'ORDO EX HISTORIA',
        deductionHint: 'Connect European constitutional turning points.',
      },
      {
        step: 3,
        latchName: 'Hidden Trial-00 Notch',
        engraving: 'A.M. — 19',
        deductionHint: 'Unseal the core planetary lock.',
      },
    ],
  },
  origami_prism: {
    relicId: 'origami_prism',
    hubId: 'jp',
    glbUrl: 'assets/aaa_models/relic_tokyo_origami.glb',
    fallbackGlbUrl: 'assets/aaa_models/codex_cryptex.glb',
    archiveCode: 'REL-JP-03 // TOKYO',
    provenanceEssay:
      'Sculpted in Kyoto urushi black lacquer with 24K kintsugi gold seams along Miura-fold rigid origami hinges designed for orbital solar arrays.',
    conspiracySignificance:
      'Refracting a laser through Fold 3 projects Giza coordinates (29.9792° N, 31.1342° E) signed with Vance’s private cipher.',
    latches: [
      {
        step: 1,
        latchName: 'Miura Tessellation Hinge',
        engraving: 'UNFOLD IN ONE MOTION',
        deductionHint: 'Apply spacecraft geometric engineering.',
      },
      {
        step: 2,
        latchName: 'Kintsugi Gold Seam',
        engraving: 'STRENGTH IN FRACTURE',
        deductionHint: 'Bridge classical Japanese craft and modern physics.',
      },
      {
        step: 3,
        latchName: 'Smoked-Quartz Core Aperture',
        engraving: '29.9792 N · 31.1342 E',
        deductionHint: 'Decode the desert coordinate projection.',
      },
    ],
  },
  emerald_sphere: {
    relicId: 'emerald_sphere',
    hubId: 'br',
    glbUrl: 'assets/aaa_models/relic_rio_sphere.glb',
    fallbackGlbUrl: 'assets/aaa_models/veritas_astrolabe_orb.glb',
    archiveCode: 'REL-BR-04 // RIO',
    provenanceEssay:
      'A Minas Gerais emerald acoustic Helmholtz resonator cradled inside gilded botanical filigree. Tuned to 432 Hz architectural harmonics.',
    conspiracySignificance:
      'Matches Nadia Al-Mansoor’s acoustic research—and acts as the physical sonic key to the buried Giza hall.',
    latches: [
      {
        step: 1,
        latchName: 'Botanical Canopy Rib',
        engraving: 'BIOSPHERE HARMONIC',
        deductionHint: 'Synthesize Neotropical ecology and earth science.',
      },
      {
        step: 2,
        latchName: 'Helmholtz Acoustic Vent',
        engraving: 'RESONANCE UNLOCKS STONE',
        deductionHint: 'Calculate standing-wave frequency relationships.',
      },
      {
        step: 3,
        latchName: 'Emerald Prism Heart',
        engraving: 'VOX POPULI',
        deductionHint: 'Seal the Agora resonance chord.',
      },
    ],
  },
  cipher_box: {
    relicId: 'cipher_box',
    hubId: 'eg',
    glbUrl: 'assets/aaa_models/relic_cairo_cipher.glb',
    fallbackGlbUrl: 'assets/aaa_models/codex_cryptex.glb',
    archiveCode: 'REL-EG-05 // CAIRO',
    provenanceEssay:
      'Carved from Tura limestone and brushed electrum brass, combining Mamluk combination tumblers with modern quantum-resistant rotor teeth.',
    conspiracySignificance:
      'Preserved Tariq Al-Mansoor’s unredacted 2019 dossier and Julian Vance’s witness-protection extraction stamp.',
    latches: [
      {
        step: 1,
        latchName: 'Solar Oculus Tumbler',
        engraving: 'WHEN DAYLIGHT DIES, READ SHADOW',
        deductionHint: 'Solve ancient astronomical alignments.',
      },
      {
        step: 2,
        latchName: 'Electrum Polyalphabetic Ring',
        engraving: 'AL-KINDI FREQUENCY',
        deductionHint: 'Apply classical cryptanalysis history.',
      },
      {
        step: 3,
        latchName: 'Meridian Zero Seal',
        engraving: 'WITNESS OVERRIDE 00',
        deductionHint: 'Expose the witness-protection rescue cipher.',
      },
    ],
  },
  cryo_relay: {
    relicId: 'cryo_relay',
    hubId: 'is',
    glbUrl: 'assets/aaa_models/relic_reykjavik_cryo.glb',
    fallbackGlbUrl: 'assets/aaa_models/calibrator_chronometer.glb',
    archiveCode: 'REL-IS-06 // REYKJAVIK',
    provenanceEssay:
      'Hexagonal columnar basalt housing a liquid-nitrogen optical relay cooled by sub-glacial meltwater beneath Iceland’s rift valley.',
    conspiracySignificance:
      'Carried seven years of encrypted chess moves and broadcast schematics between Tariq’s caldera bunker and Vance’s Geneva study.',
    latches: [
      {
        step: 1,
        latchName: 'Basalt Rift Collar',
        engraving: 'MID-ATLANTIC DIVIDE',
        deductionHint: 'Connect plate tectonics and geothermal physics.',
      },
      {
        step: 2,
        latchName: 'Aurora Optical Waveguide',
        engraving: 'SOLAR WIND SPECTRA',
        deductionHint: 'Identify magnetospheric emission lines.',
      },
      {
        step: 3,
        latchName: 'Trojan Handshake Core',
        engraving: 'TWO BILLION WITNESSES',
        deductionHint: 'Complete the Geneva–Reykjavik handshake.',
      },
    ],
  },
  council_seal: {
    relicId: 'council_seal',
    hubId: 'sg',
    glbUrl: 'assets/aaa_models/relic_singapore_seal.glb',
    fallbackGlbUrl: 'assets/aaa_models/veritas_astrolabe_orb.glb',
    archiveCode: 'REL-SG-07 // SINGAPORE',
    provenanceEssay:
      'Tri-part platinum and sapphire executive seal uniting Sovereign, Horizon, and Agora charter keys—fractured cleanly down the Article IX seam.',
    conspiracySignificance:
      'Embedded micro-audit log proves Chancellor Lindqvist’s proxy ordered the Rio pod sabotage to frame Horizon.',
    latches: [
      {
        step: 1,
        latchName: 'Tri-Bloc Quorum Ring',
        engraving: 'NULLIUS IN VERBA',
        deductionHint: 'Audit international treaty governance.',
      },
      {
        step: 2,
        latchName: 'Monolith Optical Bus',
        engraving: 'STRAIT OF MALACCA NODE',
        deductionHint: 'Trace global fiber-optic and trade chokepoints.',
      },
      {
        step: 3,
        latchName: 'Fractured Article IX Pin',
        engraving: 'NO SILENCE IN THE LIGHT',
        deductionHint: 'Shatter the emergency censorship lock.',
      },
    ],
  },
  master_ledger: {
    relicId: 'master_ledger',
    hubId: 'global',
    glbUrl: 'assets/aaa_models/relic_apex_ledger.glb',
    fallbackGlbUrl: 'assets/aaa_models/championship_trophy.glb',
    archiveCode: 'REL-GL-08 // APEX FORUM',
    provenanceEssay:
      'The crowning horological monument of The Meridian—uniting 24K gold gimbals, sapphire tourbillon lenses, and the sole human veto key over planetary crisis models.',
    conspiracySignificance:
      'Designed so its final lock can only turn while live broadcast telemetry streams unencrypted to every continent.',
    latches: [
      {
        step: 1,
        latchName: 'Sovereign Law Gimbal',
        engraving: 'MEMORY WITHOUT TYRANNY',
        deductionHint: 'Synthesize world history and jurisprudence.',
      },
      {
        step: 2,
        latchName: 'Horizon Forecast Gimbal',
        engraving: 'VELOCITY WITH CONSCIENCE',
        deductionHint: 'Unite physical science, logic, and technology.',
      },
      {
        step: 3,
        latchName: 'Agora Human Veto Crown',
        engraving: 'FIRST CITIZEN ARBITER',
        deductionHint: 'Deliver the final sudden-death verdict.',
      },
    ],
  },
};

/**
 * Generates all 40 Redacted *Ledger* Lore Logs (`Airlocks 1..40` = `Depths 5..200`)!
 */
const BUILTIN_40_LORE_TOPICS: ReadonlyArray<[string, string]> = [
  ['SUB-LEVEL GENEVA POUR', 'Bedrock servers beneath Lake Geneva were poured in 2017—two years before the public Charter existed.'],
  ['TRIAL ZERO ROSTER', 'Twelve polymaths entered the unannounced 2019 pilot. Eleven signed lifetime NDAs; Number Twelve—Tariq Al-Mansoor—refused.'],
  ['VANCE CUFFLINK TRANSMITTER', 'Julian Vance’s left brass cufflink houses a dead-man cryptographic shard keyed to Reykjavik.'],
  ['ACOUSTIC LIMESTONE THESIS', 'Nadia Al-Mansoor’s ETH Zurich thesis on Giza acoustic resonance was requisitioned by Sovereign architects in 2021.'],
  ['SUB-VOCAL PROTOTYPE LAB', 'Horizon’s Osaka lab tested bone-conduction trivia relays on high-stakes poker pros before hiring Soren Kael.'],
  ['CAMDEN PIRATE RELAY', 'Teo Rojas built the first Black Salon transmitter out of decommissioned BBC shortwave vans in North London.'],
  ['ZURICH SHELL INVOICE', 'Wire transfer #8841-CH proves a Sovereign front company purchased Horizon relay chips three weeks before Rio.'],
  ['SOLAR OCULUS OVERRIDE', 'Cairo’s brass oculus shutter was wired to an off-grid manual winch—allowing Teo and Nadia to drop into Vault Zero.'],
  ['PSYCHOMETRIC TWIN SEARCH', 'Vance’s scouting cipher evaluated 400,000 minds not just on IQ, but on ethical refusal under mirror temptation.'],
  ['CALDERA GEOTHERMAL SHIELD', 'Infrared plume heat from Iceland’s rift masked Tariq’s server cluster from Council reconnaissance satellites for seven years.'],
  ['LINDQVIST TREATY REDACTION', 'In 2020, Sovereign suppressed a Ledger climate-grain forecast that would have repriced Nordic shipping corridors.'],
  ['TAKAHASHI LATENCY ARBITRAGE', 'Horizon sought a 400-millisecond head start on Ledger energy alerts—worth $14B a quarter on Tokyo futures.'],
  ['OKAFOR COMMONS DISSENT', 'Ambassador Amara Okafor threatened to pull 54 Agora nations out of Geneva unless an independent human Arbiter held veto power.'],
  ['THE BROKEN STYLUS', 'Vance snapped his favorite silver pen the night Trial Zero was sealed—and swore the next contest would air live to two billion eyes.'],
  ['NADIA’S UNSENT LETTER', 'Recovered from Cairo’s cipher box: a handwritten note from Tariq telling Nadia never to trust Lindqvist’s scholarships.'],
  ['SOREN’S WEIGHTED COIN', 'Soren’s lucky silver crown is hollow—not for cheating at cards, but hiding an encrypted backup of Horizon’s black-budget ledger.'],
  ['TEO’S PRESS CREDENTIAL', 'Mateo Rojas was fired from Buenos Aires investigative television in 2019 after asking where Tariq Al-Mansoor vanished.'],
  ['THE 125-KILOBYTE BITSET', 'Ledger engineers modeled human polymath memory using compact roaring bitmaps so no arbiter is ever tested twice on the same fact.'],
  ['ARTICLE IX DRAFTING NOTE', 'Emergency Rule Nine was slipped into the Singapore annex at 03:12 UTC without Agora parliamentary review.'],
  ['MARITIME CITADEL ANCHORAGE', 'The Apex Forum floats at Point Nemo’s legal twin in international waters so no single nation’s police can storm the stage.'],
  ['GENEVA MIRROR RECORDING', 'Every finalist’s Q2 mirror-leak reaction in Geneva was archived—91% exploited the reflection; Vance flagged the rare exceptions.'],
  ['GREENWICH ORRERY GEARING', 'Prime tooth count 127 on London’s Armillary Orrery encodes the RSA header of Trial Zero’s payout ledger.'],
  ['SHINKANSEN DOPPLER TEST', 'Tokyo’s Sky Pavilion acoustic glass cancels bullet-train rumble at 62 Hz—the exact carrier Soren’s earpiece piggybacked on.'],
  ['RIO CANOPY RAINFALL SENSOR', 'Botanical humidity sensors logged unauthorized rooftop footsteps 14 minutes before Nadia’s pod shorted out.'],
  ['GIZA SUB-CHAMBER OXYGEN', 'Someone replaced the desiccant cartridges in Cairo’s buried archive every six months between 2019 and 2025—Julian Vance.'],
  ['AURORA IONOSPHERIC BOUNCE', 'Whistleblower broadcasts from Reykjavik bounced off polar E-layer plasma to bypass Sovereign undersea cable filters.'],
  ['SKY-BRIDGE MONOLITH COOLING', 'Singapore’s Ledger core circulates deep seawater at 4°C; tampering spikes UV coolant alarms within 1.8 seconds.'],
  ['THE SECOND SCOUTING FILE', 'Inside Vance’s locked desk sits an empty folder labeled "CIRCUIT II"—ready should any Arbiter turn tyrant.'],
  ['CALIBRATOR ASTROLABE ALLOY', 'Smelted from retired Swiss observatory meridian circles that measured star transits in 1894.'],
  ['CODEX CRYPTEX TUMBLERS', 'Inspired by Leon Battista Alberti’s 1467 cipher disk—requiring dual-ring relational synthesis rather than rote recall.'],
  ['VERITAS CRYSTAL REFRACTION', 'Smoked-sapphire facets are grown via Kyropoulos boules to exact refractive index 1.768 so peripheral answers dim naturally.'],
  ['BLACK SALON WAGER LEDGER', 'Underground contenders wager zero cash—only signed intellectual proofs and unredacted historical archives.'],
  ['TARIQ’S CHESS ENDGAME', 'Vance and Tariq played 260 correspondence chess games over seven years; Game 260 ended in a deliberate Queen sacrifice.'],
  ['SOVEREIGN PROTOCOL SEVEN', 'Allows faction chairs to veto a single trivia domain—the exact Insider perk turned back against them in Act III.'],
  ['PEOPLE’S LENS TELEMETRY', 'When two billion viewers guess simultaneously, wisdom-of-crowds peaks at 78% on History—but drops to 41% on Cryptic traps.'],
  ['OVERCLOCK HEARTBEAT BIOMETRICS', 'Tabletop capacitance pads read pulse elevation during a 1.0-second Overclock hold—separating calm mastery from panic.'],
  ['THE FOURTH ENDINGS CLAUSE', 'Hidden in Charter Footnote 44: an Arbiter with unanimous public and witness backing may dissolve their own throne into a Citizen Council.'],
  ['MERIDIAN ZERO MANIFESTO', '"Knowledge hoarded becomes leverage; knowledge shared becomes civilization." — Tariq Al-Mansoor, Reykjavik Log.'],
  ['VANCE’S FINAL REHEARSAL', 'Before walking onto the Apex stage, Julian Vance left his resignation letter signed and dated beside the Master Key.'],
  ['OMEGA ARCHIVE SEAL', 'Depth 200 cleared. You have read every unredacted stratum of The Ledger. Nothing beneath the surface remains hidden from you.'],
];

export const DEFAULT_40_ARCHIVE_LORE_LOGS: ArchiveWave2LoreLog[] = BUILTIN_40_LORE_TOPICS.map(
  ([title, body], idx) => {
    const airlockNumber = idx + 1;
    const depth = airlockNumber * 5;
    const strataLabel =
      depth <= 25
        ? 'PUBLIC STRATA'
        : depth <= 75
          ? 'DIPLOMATIC VAULTS'
          : 'MERIDIAN ZERO CORE';
    return {
      airlockNumber,
      depth,
      strataLabel,
      code: `LEDGER-LOG-${String(airlockNumber).padStart(2, '0')}`,
      title,
      body,
    };
  }
);

export class Wave2NarrativeDirector {
  private readonly passport: PassportSystem;
  private readonly blackboard: InkBlackboard;

  private backstageByHub: Record<HubId, BackstageHubConversation> = {
    ...DEFAULT_BACKSTAGE_CONVERSATIONS,
  };
  private relicProvenance: Record<HeroRelicId, Tier3RelicDeepProvenance> = {
    ...TIER3_RELIC_PROVENANCE,
  };
  private archiveLoreLogs: ArchiveWave2LoreLog[] = [...DEFAULT_40_ARCHIVE_LORE_LOGS];
  private callouts: Omit<LiveGameplayCallout, 'portraitUrl'>[] = [...TIER2_GAMEPLAY_CALLOUTS];
  private backstageConversationsList: BackstageHubConversation[] = [];
  private personaCeremonies: PersonaCeremonySpec[] = [];
  private bossPhaseBanners: BossPhaseBannerSpec[] = [];
  private recentCalloutIds: string[] = [];
  private lastCalloutAtMs = -Infinity;
  private loaded = false;

  constructor(passport: PassportSystem, blackboard: InkBlackboard) {
    this.passport = passport;
    this.blackboard = blackboard;
  }

  /**
   * Hydrates `public/data/narrative_wave2.json` (`backstage_hubs`, `backstage_conversations`,
   * `tier2_gameplay_callouts`, `archive_lore_logs`, `tier3_relic_provenance`) seamlessly!
   */
  public async loadWave2Data(url = 'data/narrative_wave2.json'): Promise<boolean> {
    if (this.loaded) return true;
    try {
      const resp = await fetch(url);
      if (!resp.ok) return false;
      const data = (await resp.json()) as Record<string, unknown>;
      this.ingestWave2Json(data);
      this.loaded = true;
      return true;
    } catch {
      return false;
    }
  }

  private normalizeBackstageConversation(raw: Record<string, unknown>): BackstageHubConversation {
    const hubId = (raw.hubId as HubId) ?? 'ch';
    const entryNodeId = typeof raw.entryNodeId === 'string' ? raw.entryNodeId : undefined;

    // `nodes` can be either an Array (`backstage_hubs`) or a Record<nodeId, nodeObj> (`backstage_conversations`)
    let rawNodeList: Array<Record<string, unknown>> = [];
    let rawNodeById: Record<string, Record<string, unknown>> = {};
    if (Array.isArray(raw.nodes)) {
      rawNodeList = raw.nodes as Array<Record<string, unknown>>;
      for (const rn of rawNodeList) {
        if (typeof rn.id === 'string') rawNodeById[rn.id] = rn;
      }
    } else if (raw.nodes && typeof raw.nodes === 'object') {
      rawNodeById = raw.nodes as Record<string, Record<string, unknown>>;
      const keys = Object.keys(rawNodeById);
      if (entryNodeId && rawNodeById[entryNodeId]) {
        rawNodeList.push(rawNodeById[entryNodeId]);
      }
      for (const k of keys) {
        if (k !== entryNodeId && rawNodeById[k]) {
          rawNodeList.push(rawNodeById[k]);
        }
      }
    }

    const normalizedNodes: BackstageDialogueNode[] = rawNodeList.map((rn, idx) => {
      const speakerId = ((rn.speakerId ?? rn.speaker) as CastMemberId) ?? 'vance';
      const expression = (rn.expression as CharacterExpression) ?? 'neutral';
      const rawOptions = Array.isArray(rn.options)
        ? (rn.options as Array<Record<string, unknown>>)
        : Array.isArray(rn.choices)
          ? (rn.choices as Array<Record<string, unknown>>)
          : [];

      const options: BackstageDialogueOption[] = rawOptions.map((opt, optIdx) => {
        const nextNodeId = typeof opt.nextNodeId === 'string' ? opt.nextNodeId : undefined;
        const targetNode = nextNodeId ? rawNodeById[nextNodeId] : undefined;
        const effects =
          opt.effects && typeof opt.effects === 'object'
            ? (opt.effects as Record<string, unknown>)
            : undefined;
        const bondsMap =
          effects?.bonds && typeof effects.bonds === 'object'
            ? (effects.bonds as Partial<Record<CastMemberId, number>>)
            : undefined;
        const firstBondNpc = bondsMap ? (Object.keys(bondsMap)[0] as CastMemberId | undefined) : undefined;

        return {
          id: String(opt.id ?? `opt_${optIdx + 1}`),
          label: String(opt.label ?? ''),
          nextNodeId,
          responseVoiceUrl:
            typeof opt.responseVoiceUrl === 'string'
              ? opt.responseVoiceUrl
              : typeof targetNode?.voiceUrl === 'string'
                ? targetNode.voiceUrl
                : undefined,
          responseText:
            typeof opt.responseText === 'string'
              ? opt.responseText
              : typeof targetNode?.text === 'string'
                ? targetNode.text
                : '',
          integrityDelta:
            typeof opt.integrityDelta === 'number'
              ? opt.integrityDelta
              : typeof effects?.integrity === 'number'
                ? effects.integrity
                : undefined,
          publicTrustDelta:
            typeof opt.publicTrustDelta === 'number'
              ? opt.publicTrustDelta
              : typeof effects?.publicTrust === 'number'
                ? effects.publicTrust
                : undefined,
          councilFavorDelta:
            typeof opt.councilFavorDelta === 'number'
              ? opt.councilFavorDelta
              : typeof effects?.councilFavor === 'number'
                ? effects.councilFavor
                : undefined,
          bondNpc: (opt.bondNpc as CastMemberId | undefined) ?? firstBondNpc,
          bondDelta:
            typeof opt.bondDelta === 'number'
              ? opt.bondDelta
              : firstBondNpc && typeof bondsMap?.[firstBondNpc] === 'number'
                ? bondsMap[firstBondNpc]
                : undefined,
          bondsDeltaMap: bondsMap,
          setFlag:
            effects?.setFlag && typeof effects.setFlag === 'object'
              ? (effects.setFlag as Record<string, string | boolean>)
              : undefined,
          unlockEvidenceClue:
            typeof effects?.unlockEvidenceClue === 'string' ? effects.unlockEvidenceClue : undefined,
          unlockPerk:
            typeof effects?.unlockPerk === 'string' && effects.unlockPerk in PERK_CATALOG
              ? (effects.unlockPerk as PerkId)
              : undefined,
          vaultClue:
            typeof effects?.vaultClue === 'string' && effects.vaultClue.trim()
              ? effects.vaultClue.trim()
              : undefined,
        };
      });

      const pdc =
        rn.passiveDomainCheck && typeof rn.passiveDomainCheck === 'object'
          ? (rn.passiveDomainCheck as Record<string, unknown>)
          : undefined;

      return {
        id: String(rn.id ?? `n${idx + 1}`),
        speakerId,
        speakerName: String(rn.speakerName ?? SPEAKER_NAMES[speakerId]),
        expression,
        portraitUrl: String(rn.portraitUrl ?? getPortraitUrl(speakerId, expression)),
        voiceClipId: typeof rn.voiceClipId === 'string' ? rn.voiceClipId : undefined,
        voiceUrl: typeof rn.voiceUrl === 'string' ? rn.voiceUrl : undefined,
        text: String(rn.text ?? ''),
        tellId: typeof rn.tellId === 'string' ? rn.tellId : undefined,
        tellHint:
          typeof rn.tellHint === 'string'
            ? rn.tellHint
            : typeof rn.tellCaption === 'string'
              ? rn.tellCaption
              : undefined,
        nextNodeId: typeof rn.nextNodeId === 'string' ? rn.nextNodeId : null,
        passiveDomainCheck: pdc
          ? {
              domainId: Number(pdc.domainId ?? 0),
              minTheta: Number(pdc.minTheta ?? 0.2),
              insight: String(pdc.insight ?? ''),
            }
          : undefined,
        options,
      };
    });

    const interlocutorId =
      (raw.interlocutorId as CastMemberId | undefined) ??
      normalizedNodes[0]?.speakerId ??
      'vance';

    return {
      id: typeof raw.id === 'string' ? raw.id : undefined,
      hubId,
      city: typeof raw.city === 'string' ? raw.city : undefined,
      title: String(raw.title ?? 'Backstage Briefing'),
      locationLabel: String(raw.locationLabel ?? hubId.toUpperCase()),
      venueRoomGlb: typeof raw.venueRoomGlb === 'string' ? raw.venueRoomGlb : undefined,
      ambienceUrl: String(raw.ambienceUrl ?? raw.ambientAudioUrl ?? getVenueAmbienceUrl(hubId)),
      lightingMode: typeof raw.lightingMode === 'string' ? raw.lightingMode : undefined,
      unlockAfterMission:
        typeof raw.unlockAfterMission === 'string' ? raw.unlockAfterMission : undefined,
      entryNodeId: entryNodeId ?? normalizedNodes[0]?.id,
      interlocutorId,
      nodes: normalizedNodes,
    };
  }

  public ingestWave2Json(data: Record<string, unknown>): void {
    if (data.backstage_hubs && typeof data.backstage_hubs === 'object') {
      const hubsMap = data.backstage_hubs as Partial<Record<HubId, Record<string, unknown>>>;
      for (const k of Object.keys(hubsMap) as HubId[]) {
        const entry = hubsMap[k];
        if (entry && typeof entry === 'object') {
          this.backstageByHub[k] = this.normalizeBackstageConversation({
            ...entry,
            hubId: entry.hubId ?? k,
          });
        }
      }
    }

    if (Array.isArray(data.backstage_conversations)) {
      this.backstageConversationsList = (
        data.backstage_conversations as Array<Record<string, unknown>>
      ).map((raw) => this.normalizeBackstageConversation(raw));
    }

    if (Array.isArray(data.persona_ceremonies)) {
      this.personaCeremonies = data.persona_ceremonies as PersonaCeremonySpec[];
    }

    if (Array.isArray(data.boss_phase_banners)) {
      this.bossPhaseBanners = (data.boss_phase_banners as Array<Record<string, unknown>>).map(
        (b, idx) => {
          const p = (Number(b.phaseNumber ?? b.phase ?? idx + 1) as 1 | 2 | 3) || 1;
          const title = String(b.title ?? b.bannerTitle ?? `PHASE ${p}`);
          const subtitle = String(b.subtitle ?? b.bannerSubtitle ?? '');
          return {
            phaseNumber: p,
            phase: p,
            code: typeof b.code === 'string' ? b.code : undefined,
            title,
            bannerTitle: title,
            subtitle,
            bannerSubtitle: subtitle,
            archetype: typeof b.archetype === 'string' ? b.archetype : undefined,
            lightingMode: typeof b.lightingMode === 'string' ? b.lightingMode : undefined,
            voiceClipId: typeof b.voiceClipId === 'string' ? b.voiceClipId : undefined,
            voiceUrl: typeof b.voiceUrl === 'string' ? b.voiceUrl : undefined,
            text: typeof b.text === 'string' ? b.text : undefined,
          };
        }
      );
    }

    if (Array.isArray(data.tier2_gameplay_callouts) && data.tier2_gameplay_callouts.length > 0) {
      this.callouts = (data.tier2_gameplay_callouts as Array<Record<string, unknown>>).map((c) => {
        const speakerId = ((c.speakerId ?? c.actor) as CastMemberId) ?? 'vance';
        return {
          id: String(c.id ?? ''),
          event: (c.event as LiveCalloutEvent) ?? 'COLD_INSTINCT',
          speakerId,
          speakerName: String(c.speakerName ?? SPEAKER_NAMES[speakerId]),
          expression: (c.expression as CharacterExpression) ?? 'neutral',
          voiceUrl: String(c.voiceUrl ?? ''),
          subtitle: String(c.subtitle ?? c.text ?? ''),
        };
      });
    }

    if (data.tier3_relic_provenance && typeof data.tier3_relic_provenance === 'object') {
      const provMap = data.tier3_relic_provenance as Partial<
        Record<HeroRelicId, Tier3RelicDeepProvenance>
      >;
      for (const k of Object.keys(provMap) as HeroRelicId[]) {
        if (provMap[k]) {
          this.relicProvenance[k] = {
            ...this.relicProvenance[k],
            ...provMap[k]!,
          };
        }
      }
    }

    const rawLogs = data.archive_lore_logs ?? data.lore_logs;
    if (Array.isArray(rawLogs) && rawLogs.length > 0) {
      this.archiveLoreLogs = rawLogs.map((item: Record<string, unknown>, idx: number) => ({
        id: typeof item.id === 'string' ? item.id : undefined,
        airlockNumber: Number(item.airlock_number ?? item.airlockNumber ?? item.logNumber ?? idx + 1),
        depth: Number(item.depth ?? item.unlockDepth ?? (idx + 1) * 5),
        strataId: typeof item.strataId === 'string' ? item.strataId : undefined,
        strataLabel: String(item.strata ?? item.strataLabel ?? 'MERIDIAN ZERO CORE'),
        classification: typeof item.classification === 'string' ? item.classification : undefined,
        dateStamp: typeof item.dateStamp === 'string' ? item.dateStamp : undefined,
        source: typeof item.source === 'string' ? item.source : undefined,
        relatedSuspectId: item.relatedSuspectId as CastMemberId | undefined,
        code: String(item.code ?? item.id ?? `LEDGER-LOG-${String(idx + 1).padStart(2, '0')}`),
        title: String(item.title ?? `Archive Log ${idx + 1}`),
        redactedTeaser: typeof item.redactedTeaser === 'string' ? item.redactedTeaser : undefined,
        body: String(item.body ?? item.text ?? item.summary ?? ''),
        nextStrataWarning:
          typeof item.nextStrataWarning === 'string' ? item.nextStrataWarning : undefined,
      }));
    }
  }

  private mapCalloutEventToBankKind(event: LiveCalloutEvent): ReactionTriggerKind {
    switch (event) {
      case 'OVERCLOCK_BOLD':
      case 'RIVAL_OVERCLOCK_TAUNT':
        return 'OVERCLOCK_WIN';
      case 'CALIBRATOR_PINHOLE':
        return 'CALIBRATOR_BULLSEYE';
      case 'TIER2_PEEL':
      case 'TIER3_PEEL':
      case 'RIVAL_PEEL_TAUNT':
        return 'PEEL_USED';
      case 'SHIELD_WARN':
        return 'CLOSE_CALL';
      default:
        return 'STREAK_3';
    }
  }

  /**
   * Picks a Tier-2 Modular Voice Callout (`callout_*.mp3`) enforcing `#200`'s once-per-session
   * `.mp3` guard (`playedBarkUrlsInSession`): once a clip has played once in the session,
   * `voiceUrl` is returned as `''` (Foley-only) and subtitle draws from `ReactionVarietyBank`!
   */
  public getLiveGameplayCallout(
    event: LiveCalloutEvent,
    preferredSpeaker?: CastMemberId
  ): LiveGameplayCallout {
    let candidates = this.callouts.filter((c) => c.event === event);
    if (preferredSpeaker) {
      const speakerMatches = candidates.filter((c) => c.speakerId === preferredSpeaker);
      if (speakerMatches.length > 0) candidates = speakerMatches;
    }
    if (candidates.length === 0) {
      candidates = [this.callouts[0] ?? TIER2_GAMEPLAY_CALLOUTS[0]];
    }

    // Strongly prefer clips whose `.mp3` has NEVER played yet in this session (`#200`)!
    const unplayedInSession = candidates.filter(
      (c) => !hasPlayedGameplayBarkInSession(c.voiceUrl)
    );
    const unspentRecent = (unplayedInSession.length > 0 ? unplayedInSession : candidates).filter(
      (c) => !this.recentCalloutIds.includes(c.id)
    );
    const chosen =
      (unspentRecent.length > 0
        ? unspentRecent
        : unplayedInSession.length > 0
          ? unplayedInSession
          : candidates)[0];

    this.recentCalloutIds.push(chosen.id);
    if (this.recentCalloutIds.length > 8) {
      this.recentCalloutIds.shift();
    }

    const claimedUrl = claimGameplayBarkVoiceUrl(chosen.voiceUrl);
    const subtitleText = claimedUrl
      ? chosen.subtitle
      : reactionVarietyBank.pickGuaranteedLine(
          chosen.speakerId,
          this.mapCalloutEventToBankKind(event)
        ).text;

    return {
      ...chosen,
      voiceUrl: claimedUrl ?? '',
      portraitUrl: getPortraitUrl(chosen.speakerId, chosen.expression),
      subtitle: this.passport.interpolateText(subtitleText),
    };
  }

  /**
   * Cooldown-gated & once-per-session live voice callout selector (`#200` Anti-Annoyance):
   * returns `null` during cooldown OR once every `.mp3` for `event` has already played once in this session!
   */
  public getLiveGameplayCalloutIfReady(
    event: LiveCalloutEvent,
    nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now(),
    minCooldownMs = 14000,
    preferredSpeaker?: CastMemberId
  ): LiveGameplayCallout | null {
    if (nowMs - this.lastCalloutAtMs < minCooldownMs) {
      return null;
    }
    let candidates = this.callouts.filter((c) => c.event === event);
    if (preferredSpeaker) {
      const speakerMatches = candidates.filter((c) => c.speakerId === preferredSpeaker);
      if (speakerMatches.length > 0) candidates = speakerMatches;
    }
    const hasFreshVoClip = candidates.some((c) => !hasPlayedGameplayBarkInSession(c.voiceUrl));
    if (!hasFreshVoClip) {
      return null;
    }
    this.lastCalloutAtMs = nowMs;
    return this.getLiveGameplayCallout(event, preferredSpeaker);
  }

  public getBackstageConversation(hubId: HubId): BackstageHubConversation {
    const conv = this.backstageByHub[hubId] ?? DEFAULT_BACKSTAGE_CONVERSATIONS.ch;
    return {
      ...conv,
      nodes: conv.nodes.map((n) => ({
        ...n,
        text: this.passport.interpolateText(n.text),
      })),
    };
  }

  public getAllBackstageConversationsForHub(hubId: HubId): BackstageHubConversation[] {
    const extras = this.backstageConversationsList.filter((c) => c.hubId === hubId);
    if (extras.length > 0) {
      return extras.map((conv) => ({
        ...conv,
        nodes: conv.nodes.map((n) => ({
          ...n,
          text: this.passport.interpolateText(n.text),
        })),
      }));
    }
    return [this.getBackstageConversation(hubId)];
  }

  /**
   * Returns only Backstage Conversations unlocked by completed campaign missions
   * (preventing Act II/III/IV spoilers before prerequisites are cleared, while
   * keeping the earliest hub intro conversation available once the hub is reached).
   */
  public getUnlockedBackstageConversationsForHub(hubId: HubId): BackstageHubConversation[] {
    const all = this.getAllBackstageConversationsForHub(hubId);
    if (all.length <= 1) return all;

    const parseUnlockSlot = (missionId?: string): number => {
      if (!missionId) return 0;
      const m = /_(\d+)$/.exec(missionId);
      return m ? Number(m[1]) : 99;
    };

    const sorted = [...all].sort(
      (a, b) => parseUnlockSlot(a.unlockAfterMission) - parseUnlockSlot(b.unlockAfterMission)
    );
    const completed = new Set(this.blackboard.getSnapshot().completedMissions);
    const unlocked = sorted.filter(
      (conv) => !conv.unlockAfterMission || completed.has(conv.unlockAfterMission)
    );
    return unlocked.length > 0 ? unlocked : [sorted[0]];
  }

  /**
   * Applies InkBlackboard axes, bond deltas, flags, evidence clues, perks & vault clues
   * when a player selects an option in a Backstage Conversation!
   */
  public selectBackstageOption(
    hubId: HubId,
    nodeId: string,
    optionId: string,
    conversationId?: string
  ): {
    responseText: string;
    responseVoiceUrl?: string;
    nextNode?: BackstageDialogueNode;
    unlockedPerk?: PerkId;
    unlockedVaultClue?: string;
  } | null {
    const allConvs = this.getAllBackstageConversationsForHub(hubId);
    const convs = conversationId
      ? allConvs.filter((c) => c.id === conversationId)
      : allConvs;
    for (const conv of convs.length > 0 ? convs : allConvs) {
      const node = conv.nodes.find((n) => n.id === nodeId);
      const opt = node?.options?.find((o) => o.id === optionId);
      if (node && opt) {
        this.blackboard.adjustAxes({
          integrity: opt.integrityDelta,
          publicTrust: opt.publicTrustDelta,
          councilFavor: opt.councilFavorDelta,
        });
        if (opt.bondsDeltaMap) {
          for (const [npc, delta] of Object.entries(opt.bondsDeltaMap) as Array<
            [CastMemberId, number]
          >) {
            if (typeof delta === 'number' && delta !== 0) {
              this.blackboard.adjustBond(npc, delta);
            }
          }
        } else if (opt.bondNpc && opt.bondDelta) {
          this.blackboard.adjustBond(opt.bondNpc, opt.bondDelta);
        }
        if (opt.setFlag) {
          for (const [fk, fv] of Object.entries(opt.setFlag)) {
            this.blackboard.setFlag(fk, fv);
          }
        }
        if (opt.unlockEvidenceClue) {
          this.blackboard.unlockEvidenceClue(opt.unlockEvidenceClue);
        }
        if (opt.unlockPerk) {
          this.blackboard.unlockPerk(opt.unlockPerk);
        }
        if (opt.vaultClue) {
          this.blackboard.unlockVaultClue(opt.vaultClue);
        }
        const nextNode = opt.nextNodeId
          ? conv.nodes.find((n) => n.id === opt.nextNodeId)
          : undefined;
        return {
          responseText: this.passport.interpolateText(opt.responseText),
          responseVoiceUrl: opt.responseVoiceUrl,
          nextNode,
          unlockedPerk: opt.unlockPerk,
          unlockedVaultClue: opt.vaultClue,
        };
      }
    }
    return null;
  }

  public getRelicDeepProvenance(relicId: HeroRelicId): Tier3RelicDeepProvenance {
    return this.relicProvenance[relicId] ?? TIER3_RELIC_PROVENANCE.meridian_astrolabe;
  }

  public getPersonaCeremony(personaId: string): PersonaCeremonySpec | undefined {
    return this.personaCeremonies.find((p) => p.personaId === personaId);
  }

  public getBossPhaseBanners(): readonly BossPhaseBannerSpec[] {
    return this.bossPhaseBanners;
  }

  public getArchiveLoreLog(airlockNumber: number): ArchiveWave2LoreLog {
    const idx = Math.max(0, Math.min(this.archiveLoreLogs.length - 1, Math.floor(airlockNumber) - 1));
    return this.archiveLoreLogs[idx];
  }

  public getAllArchiveLoreLogs(): readonly ArchiveWave2LoreLog[] {
    return this.archiveLoreLogs;
  }

  public getRuntimeStateSnapshot(): { recentCalloutIds: string[] } {
    return {
      recentCalloutIds: [...this.recentCalloutIds],
    };
  }

  public hydrateRuntimeState(raw?: { recentCalloutIds?: unknown } | null): void {
    if (raw && Array.isArray(raw.recentCalloutIds)) {
      this.recentCalloutIds = raw.recentCalloutIds
        .filter((x): x is string => typeof x === 'string')
        .slice(-8);
    } else {
      this.recentCalloutIds = [];
    }
    this.lastCalloutAtMs = -Infinity;
  }

  public resetRuntimeState(): void {
    this.recentCalloutIds = [];
    this.lastCalloutAtMs = -Infinity;
  }

  /**
   * Builds a personalized Geneva-to-Singapore Choice Chronicle for `EndingSequenceDirector` (`#128`)!
   */
  public buildPlayerChoiceChronicle(): ChoiceChronicleEntry[] {
    const snap = this.blackboard.getSnapshot();
    const entries: ChoiceChronicleEntry[] = [];

    const leak = snap.branchFlags.prologue_leak;
    entries.push({
      hubId: 'ch',
      city: 'Geneva',
      decisionTitle: 'The One-Way Mirror Test',
      chosenOutcome:
        leak === 'EXPLOITED'
          ? 'Exploited Teo’s leaked reflection for an early edge'
          : leak === 'FLAGGED'
            ? 'Flagged the observation breach directly to Julian Vance'
            : 'Ignored the mirror leak and solved on pure Cold Instinct',
      tone: leak === 'EXPLOITED' ? 'crimson' : leak === 'FLAGGED' ? 'gold' : 'cyan',
    });

    if (snap.firstFlight) {
      entries.push({
        hubId: snap.firstFlight === 'GB' ? 'gb' : 'jp',
        city: snap.firstFlight === 'GB' ? 'London First' : 'Tokyo First',
        decisionTitle: 'Act I World Departure',
        chosenOutcome:
          snap.firstFlight === 'GB'
            ? 'Chose Sovereign Rotunda debut against Nadia Al-Mansoor'
            : 'Chose Sky Pavilion high-velocity debut against Soren Kael',
        tone: snap.firstFlight === 'GB' ? 'gold' : 'cyan',
      });
    }

    if (snap.branchFlags.london_briefing) {
      const burned = snap.branchFlags.london_briefing === 'BURNED';
      entries.push({
        hubId: 'gb',
        city: 'London',
        decisionTitle: 'Chancellor Lindqvist’s Sealed Briefing',
        chosenOutcome: burned
          ? 'Burned the briefing unopened & entered the Camden Black Salon'
          : 'Accepted Sovereign redaction clearance under Nadia’s suspicion',
        tone: burned ? 'cyan' : 'crimson',
      });
    }

    if (snap.branchFlags.tokyo_earpiece) {
      const jammed = snap.branchFlags.tokyo_earpiece === 'JAMMED';
      entries.push({
        hubId: 'jp',
        city: 'Tokyo',
        decisionTitle: 'Soren’s Sub-Vocal Telemetry',
        chosenOutcome: jammed
          ? 'Fired the Live Signal Jammer—sealing Peel in Twist Fracture'
          : 'Leveraged Soren’s Horizon Probability Lens in secret',
        tone: jammed ? 'cyan' : 'crimson',
      });
    }

    if (snap.branchFlags.rio_sabotage) {
      const saved = snap.branchFlags.rio_sabotage === 'SAVED_NADIA';
      entries.push({
        hubId: 'br',
        city: 'Rio de Janeiro',
        decisionTitle: 'Nadia’s Sabotaged Pod',
        chosenOutcome: saved
          ? 'Sacrificed 1 Prism Shield to save Nadia—forging an unbreakable Ally'
          : 'Claimed the #1 Seed—turning Nadia into a ruthless Nemesis',
        tone: saved ? 'gold' : 'crimson',
      });
    }

    if (snap.act3Branch) {
      const whistle = snap.act3Branch === 'WHISTLEBLOWER';
      entries.push({
        hubId: 'eg',
        city: 'Cairo / Giza',
        decisionTitle: 'Meridian Zero & 99.4% Match',
        chosenOutcome: whistle
          ? 'Broadcast Tariq’s dossier live to the world (Whistleblower Path)'
          : 'Pocketed the dossier to infiltrate the Conclave (Insider Gambit)',
        tone: whistle ? 'cyan' : 'gold',
      });
    }

    if (snap.singaporeBetrayer) {
      entries.push({
        hubId: 'sg',
        city: 'Singapore',
        decisionTitle: 'Sky-Bridge Article IX Crisis',
        chosenOutcome: `Survived ${SPEAKER_NAMES[snap.singaporeBetrayer]}’s emergency confrontation above The Ledger`,
        tone: 'crimson',
      });
    }

    return entries;
  }
}
