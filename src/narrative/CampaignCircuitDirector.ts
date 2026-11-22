// ============================================================================
// WORLD'S SMARTEST — 40-Mission Branching Campaign & Cutscene Director
// Implements PITCH_BIBLE.md §2.3–2.4, §3.4 & campaign_20hr.json v4.0
// ============================================================================

import {
  type DomainId,
  type EndingId,
  type GlobeCountryCode,
  type HeroRelicId,
  type HubId,
  type PassportSystem,
  type PrismSkinId,
} from './PassportSystem';
import {
  mapRawLightingToStage3D,
  type CastMemberId,
  type CompiledMatchRules,
  type EffectApplicationReport,
  type InkBlackboard,
  type MutatorId,
  type NarrativeTag,
  type RawCampaignCondition,
  type RawChoiceEffects,
  type Stage3DLightingMode,
} from './InkBlackboard';
import type { EvidenceDossier, RawEvidenceBoardSchema } from './EvidenceDossier';
import type { PrologueDirector } from './PrologueDirector';
import {
  claimGameplayBarkVoiceUrl,
  hasPlayedGameplayBarkInSession,
  reactionVarietyBank,
  type ReactionPickRequest,
  type ReactionPickResult,
} from './ReactionVarietyBank';
import { getPortraitUrl, type CharacterExpression } from './RivalAI';
import type { Wave2NarrativeDirector } from './Wave2NarrativeDirector';

export type MissionFailReason =
  | 'OUTSCORED_BY_RIVAL'
  | 'SHIELDS_DEPLETED'
  | 'PHASE3_SUDDEN_DEATH_BACKFIRE'
  | 'TIMEOUT';

export interface FailedMissionAttemptInfo {
  missionId: string;
  attempts: number;
  bestScore: number;
  lastRivalScore: number;
  lastFailReason: MissionFailReason;
  lastFailedAtIso: string;
  statusBadge: '⚠ FAILED — RETRYABLE';
}

export interface CampaignMissionSummary {
  id: string;
  missionNumber: number;
  hubId: HubId;
  rhythmSlot: number;
  title: string;
  subtitle: string;
  difficultyLabel: string;
  isSideInvestigation: boolean;
  category: 'CORE_STORY' | 'DOSSIER_INVESTIGATION';
  questionCount: number;
  estimatedMinutes: number;
  completed: boolean;
  isNextPlayable: boolean;
  failedAttemptInfo: FailedMissionAttemptInfo | null;
  statusBadge: 'COMPLETED' | '⚠ FAILED — RETRYABLE' | 'NEXT' | 'AVAILABLE' | 'LOCKED';
}

export interface CampaignHubView {
  hub: HubGridCard;
  missions: CampaignMissionSummary[];
  coreMissions: CampaignMissionSummary[];
  sideInvestigations: CampaignMissionSummary[];
  failedMissionCount: number;
  hubCompletionPct: number;
  estimatedRemainingHours: number;
}

export interface CampaignOverviewStats {
  completedMissionsCount: number;
  totalMissionsCount: number; // 96 when full 20+ hr JSON is loaded (40 core + 56 dossier side-ops)
  completionPct: number; // 0..100
  completionLabel: string; // e.g. "12 / 96 Missions (13%)"
  coreCompletedCount: number;
  coreTotalCount: number;
  sideCompletedCount: number;
  sideTotalCount: number;
  totalQuestionsCount: number;
  estimatedTotalHours: number;
  estimatedPlayedHours: number;
  estimatedRemainingHours: number;
  estimatedRemainingLabel: string; // e.g. "~19.4 hrs remaining"
  diplomaticCrossClearanceActive: boolean;
}

export type Archetype3D =
  | 'SIGHTLINE_LOCK'
  | 'CODEX_DUAL_RING'
  | 'CALIBRATOR_DIAL'
  | 'GAUNTLET_SHATTER'
  | 'HERO_ARTIFACT_SYNTHESIS';

export type RivalReactionTrigger =
  | 'on_player_streak'
  | 'on_player_miss'
  | 'on_rival_ahead'
  | 'on_boss_intro'
  | 'on_defeat';

export function resolveWebAssetPath(rawPath?: string | null): string | undefined {
  if (!rawPath || typeof rawPath !== 'string') return undefined;
  // Never return purged MIDI .ogg or legacy unshipped Godot .wav paths (per #109 / #120 / #145)
  if (
    rawPath.endsWith('.ogg') ||
    rawPath.includes('sfx_streak_') ||
    rawPath.includes('sfx_cutscene_whoosh')
  ) {
    return undefined;
  }
  if (rawPath.startsWith('res://')) {
    return rawPath.slice('res://'.length);
  }
  if (rawPath.startsWith('/assets/')) {
    return rawPath.slice(1);
  }
  return rawPath;
}

export interface ActCutsceneLine {
  id: string;
  speakerId: CastMemberId;
  speakerName: string;
  expression: CharacterExpression;
  portraitUrl: string;
  voiceUrl?: string;
  text: string;
}

export interface ActCutsceneSpec {
  id: string;
  actIndex: number;
  triggerBeforeMissionId: string;
  hubId: HubId;
  title: string;
  location: string;
  imageUrl: string;
  weatherFx: string;
  kenBurns: {
    startScale: number;
    endScale: number;
    panX: number;
    panY: number;
  };
  lines: ActCutsceneLine[];
}

export interface CampaignDialogueBeat {
  id: string;
  speakerId: CastMemberId;
  speakerName: string;
  speakerRole: string;
  expression: CharacterExpression;
  portraitUrl: string;
  tellHint?: string;
  text: string;
  voiceUrl?: string;
  passiveDomainInsight?: {
    domainId: DomainId;
    minElo: number;
    unlocked: boolean;
    insightText: string;
  };
}

export interface CampaignChoiceOption {
  id: string;
  label: string;
  subtext: string;
  impactBadge: string;
  tone: 'gold' | 'cyan' | 'crimson';
  isRedCheck: boolean;
  available: boolean;
  lockedReason?: string;
  endingId?: EndingId;
  responseLine?: string;
  nextMissionId?: string | null;
  rawEffects?: RawChoiceEffects | null;
}

export interface BossPhaseBlueprint {
  phaseNumber: 1 | 2 | 3;
  title: string;
  subtitle: string;
  archetypes: Archetype3D[];
  questionCount: number;
  suddenDeathOverclock: boolean;
}

export interface CampaignMatchSpec {
  missionId: string;
  missionNumber: number;
  act: string;
  hubId: HubId;
  countryCode: GlobeCountryCode;
  rhythmSlot: 1 | 2 | 3 | 4 | 5;
  rhythmRole: string;
  title: string;
  subtitle: string;
  difficultyLabel: string;
  passGoal: string;
  venueGlbUrl: string;
  venueBackdropUrl: string;
  stageLightingMode: Stage3DLightingMode;
  questionCount: number;
  timePerQuestionSec: number;
  irtBRange: [number, number];
  preferredDomains: DomainId[];
  regions: string[];
  morphSequence: Archetype3D[];
  boostTags: NarrativeTag[];
  rivalId: CastMemberId;
  heroRelicId: HeroRelicId | null;
  unlockRelicId: HeroRelicId | null;
  isBossShowdown: boolean;
  bossPhases: BossPhaseBlueprint[] | null;
  compiledRules: CompiledMatchRules;
  mutatorBrief: string;
  cliffhangerHook: string;
}

export interface CampaignMissionView {
  id: string;
  missionNumber: number;
  hubId: HubId;
  countryCode: GlobeCountryCode;
  rhythmSlot: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  difficultyLabel: string;
  passGoal: string;
  cutsceneBefore: ActCutsceneSpec | null;
  preMatchBeats: CampaignDialogueBeat[];
  choices: CampaignChoiceOption[];
  postMatchBeats: CampaignDialogueBeat[];
  cliffhangerHook: string;
  matchSpec: CampaignMatchSpec;
  failedAttemptInfo: FailedMissionAttemptInfo | null;
}

export interface HubGridCard {
  hubId: HubId;
  countryCode: GlobeCountryCode;
  order: number; // 1..8
  city: string;
  country: string;
  venueName: string;
  venueGlbUrl: string;
  backdropUrl: string;
  difficultyLabel: string;
  tagline: string;
  globeLatLon: [number, number];
  bossRelicId: HeroRelicId;
  leadSpeakerId: CastMemberId;
  missionIds: string[];
  coreMissionIds: string[];
  sideInvestigationIds: string[];
  completedCount: number;
  totalCount: number;
  coreCompletedCount: number;
  coreTotalCount: number;
  sideCompletedCount: number;
  sideTotalCount: number;
  diplomaticCrossClearance: boolean;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  nextPlayableMissionId: string;
  activeBranchBadge: string | null;
  failedMissionIds: string[];
  failedAttemptInfo: FailedMissionAttemptInfo | null;
  statusBadge: string;
}

export interface RivalReactionCue {
  actorId: CastMemberId;
  speakerName: string;
  trigger: RivalReactionTrigger;
  expression: CharacterExpression;
  portraitUrl: string;
  voiceUrl: string;
  text: string;
}

export interface CampaignEndingView {
  id: EndingId;
  number: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  isSecret: boolean;
  unlocked: boolean;
  lockedReason?: string;
  voiceUrl: string;
  endingSpeech: string;
  endingSpeakerId: CastMemberId;
  epilogueBeats: CampaignDialogueBeat[];
  permanentUnlocks: {
    titleCrest: string;
    skin: PrismSkinId;
    newCircuitPlus: boolean;
  };
}

export interface WhisperedInsiderSignal {
  sourceId: 'teo' | 'nadia';
  suggestedFacetIndex: number;
  isGenuine: boolean;
  compromisedCameraTell: boolean;
  bannerText: string;
  voiceUrl: string;
}

export interface RedemptionGauntletSpec {
  failedMissionId: string;
  questionCount: 3;
  timePerQuestionSec: 15;
  targetDomains: DomainId[];
  archetypes: Archetype3D[];
  passThreshold: 2;
  rewardShieldsRestored: 1;
  rewardHeadStartPoints: 400;
  vancePrompt: string;
}

interface RawHubDef {
  id: HubId;
  act: string;
  order: number;
  city: string;
  country: string;
  region: GlobeCountryCode;
  difficulty_label: string;
  venue_name: string;
  venue_3d_scene: string;
  backdrop: string;
  boss_relic_id: HeroRelicId;
  lead_speaker: CastMemberId;
  globe_lat_lon: [number, number];
  tagline: string;
  mission_ids: string[];
  core_mission_ids?: string[];
  side_mission_ids?: string[];
}

interface RawDialogueBeat {
  id: string;
  speaker: CastMemberId;
  speaker_name: string;
  speaker_role: string;
  portrait?: string;
  mood?: string;
  tell_hint?: string;
  text: string;
  voice_clip?: string;
  passive_elo_check?: {
    domain_id: DomainId;
    min_elo: number;
    insight: string;
  };
}

interface RawMissionChoice {
  id: string;
  ending_id?: EndingId;
  label: string;
  subtext: string;
  impact_badge: string;
  tone?: 'gold' | 'cyan' | 'crimson';
  is_red_check?: boolean;
  requires?: RawCampaignCondition | null;
  effects?: RawChoiceEffects | null;
  response_line?: string;
  next_mission_id?: string | null;
}

interface RawMissionDef {
  id: string;
  mission_number: number;
  act: string;
  hub_id: HubId;
  rhythm_slot: number;
  rhythm_role: string;
  optional_side_mission?: boolean;
  is_side_mission?: boolean;
  estimated_minutes?: number;
  title: string;
  subtitle: string;
  difficulty_label: string;
  pass_goal: string;
  venue_region: GlobeCountryCode;
  venue_3d_scene: string;
  lighting_state: string;
  question_count: number;
  time_per_question_sec: number;
  irt_b_range: [number, number];
  narrative_tags?: NarrativeTag[];
  preferred_domains: DomainId[];
  morph_mix: Partial<Record<Archetype3D, number>>;
  mutators?: string[];
  mutator?: string;
  mutator_brief: string;
  speaker: CastMemberId;
  rival_id: CastMemberId;
  hero_relic_id: HeroRelicId | null;
  unlock_relic: HeroRelicId | null;
  next_mission_id: string | null;
  alternate_next_ids?: string[];
  dialogue_beats: RawDialogueBeat[];
  choices?: RawMissionChoice[];
  post_match_beats?: RawDialogueBeat[];
  cliffhanger_hook: string;
  cutscene_before?: string | null;
  unlocks_evidence_clue?: string | null;
}

interface RawActCutscene {
  id: string;
  act_index: number;
  trigger_before_mission: string;
  hub_id: HubId;
  title: string;
  location: string;
  image: string;
  weather_fx: string;
  ken_burns?: {
    start_scale: number;
    end_scale: number;
    pan_x: number;
    pan_y: number;
  };
  lines: Array<{
    id: string;
    speaker: CastMemberId;
    speaker_name: string;
    expression: CharacterExpression;
    voice_clip?: string;
    text: string;
  }>;
}

interface RawEndingDef {
  id: EndingId;
  number: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  is_secret?: boolean;
  requirements?: RawCampaignCondition;
  voice_clip: string;
  epilogue_beats: RawDialogueBeat[];
  permanent_unlocks: {
    title_crest: string;
    skin: PrismSkinId;
    new_circuit_plus: boolean;
  };
  ending_speech: string;
  ending_speaker: CastMemberId;
}

interface RawCampaignJson {
  schema_version: string;
  hubs: RawHubDef[];
  act_cutscenes: RawActCutscene[];
  evidence_board: RawEvidenceBoardSchema;
  rival_reactions: Record<
    CastMemberId,
    Record<
      RivalReactionTrigger,
      {
        expression: CharacterExpression;
        voice_clip: string;
        text: string;
      }
    >
  >;
  missions: RawMissionDef[];
  endings: RawEndingDef[];
}

export const CANONICAL_VENUE_GLB_BY_HUB: Record<HubId, string> = {
  ch: 'vetting_chamber_room.glb',
  gb: 'london_rotunda_room.glb',
  jp: 'tokyo_pavilion_room.glb',
  br: 'rio_canopy_room.glb',
  eg: 'cairo_solar_hall.glb',
  is: 'reykjavik_caldera_room.glb',
  sg: 'singapore_skybridge_room.glb',
  global: 'apex_forum_room.glb',
};

const BOOTSTRAP_HUBS: readonly RawHubDef[] = [
  {
    id: 'ch',
    act: 'ACT_0',
    order: 1,
    city: 'Geneva',
    country: 'Switzerland',
    region: 'CH',
    difficulty_label: 'EASY',
    venue_name: 'The Vetting Chamber',
    venue_3d_scene: 'vetting_chamber_room.glb',
    backdrop: 'assets/venues/ch.jpg',
    boss_relic_id: 'meridian_astrolabe',
    lead_speaker: 'vance',
    globe_lat_lon: [46.2044, 6.1432],
    tagline: 'Alpine monolith screening where Julian Vance stamps your Meridian Passport.',
    mission_ids: ['ch_1', 'ch_2', 'ch_3', 'ch_4', 'ch_5'],
  },
  {
    id: 'gb',
    act: 'ACT_I_A',
    order: 2,
    city: 'London',
    country: 'United Kingdom',
    region: 'GB',
    difficulty_label: 'EASY+',
    venue_name: 'The Sovereign Rotunda',
    venue_3d_scene: 'london_rotunda_room.glb',
    backdrop: 'assets/venues/gb.jpg',
    boss_relic_id: 'armillary_orrery',
    lead_speaker: 'nadia',
    globe_lat_lon: [51.5072, -0.1276],
    tagline: 'Grand Rotunda above sealed Trial 00 drawers & Chancellor Lindqvist’s briefing.',
    mission_ids: ['gb_1', 'gb_2', 'gb_3', 'gb_4', 'gb_5'],
  },
  {
    id: 'jp',
    act: 'ACT_I_B',
    order: 3,
    city: 'Tokyo',
    country: 'Japan',
    region: 'JP',
    difficulty_label: 'MEDIUM',
    venue_name: 'Shinkansen Sky Pavilion',
    venue_3d_scene: 'tokyo_pavilion_room.glb',
    backdrop: 'assets/venues/jp.jpg',
    boss_relic_id: 'origami_prism',
    lead_speaker: 'soren',
    globe_lat_lon: [35.6762, 139.6503],
    tagline: 'Seventy floors above neon rain vs wildcard Soren Kael & covert telemetry.',
    mission_ids: ['jp_1', 'jp_2', 'jp_3', 'jp_4', 'jp_5'],
  },
  {
    id: 'br',
    act: 'ACT_II_A',
    order: 4,
    city: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'BR',
    difficulty_label: 'MEDIUM+',
    venue_name: 'Botanical Glass Canopy',
    venue_3d_scene: 'london_rotunda_room.glb',
    backdrop: 'assets/venues/br.jpg',
    boss_relic_id: 'emerald_sphere',
    lead_speaker: 'nadia',
    globe_lat_lon: [-22.9068, -43.1729],
    tagline: 'Twilight broadcast before 10,000 fans—save Nadia’s sabotaged pod or claim #1 seed.',
    mission_ids: ['br_1', 'br_2', 'br_3', 'br_4', 'br_5'],
  },
  {
    id: 'eg',
    act: 'ACT_II_B',
    order: 5,
    city: 'Cairo',
    country: 'Egypt',
    region: 'EG',
    difficulty_label: 'CHALLENGING',
    venue_name: 'Solar Acoustic Hall',
    venue_3d_scene: 'cairo_solar_hall.glb',
    backdrop: 'assets/venues/eg.jpg',
    boss_relic_id: 'cipher_box',
    lead_speaker: 'teo',
    globe_lat_lon: [29.9792, 31.1342],
    tagline: 'Meridian Zero blackout twist—uncover Tariq Al-Mansoor & your 99.4% match.',
    mission_ids: ['eg_1', 'eg_2', 'eg_3', 'eg_4', 'eg_5'],
  },
  {
    id: 'is',
    act: 'ACT_III_A',
    order: 6,
    city: 'Reykjavik',
    country: 'Iceland',
    region: 'IS',
    difficulty_label: 'HARD',
    venue_name: 'Geothermal Basalt Caldera',
    venue_3d_scene: 'vetting_chamber_room.glb',
    backdrop: 'assets/venues/is.jpg',
    boss_relic_id: 'cryo_relay',
    lead_speaker: 'tariq',
    globe_lat_lon: [64.1466, -21.9426],
    tagline: 'Aurora dome & sub-glacial vaults—the Trojan Horse alliance comes to light.',
    mission_ids: ['is_1', 'is_2', 'is_3', 'is_4', 'is_5'],
  },
  {
    id: 'sg',
    act: 'ACT_III_B',
    order: 7,
    city: 'Singapore',
    country: 'Singapore',
    region: 'SG',
    difficulty_label: 'EXPERT',
    venue_name: 'Diplomatic Sky-Bridge & Core',
    venue_3d_scene: 'tokyo_pavilion_room.glb',
    backdrop: 'assets/venues/sg.jpg',
    boss_relic_id: 'council_seal',
    lead_speaker: 'lindqvist',
    globe_lat_lon: [1.3521, 103.8198],
    tagline: 'Suspended above The Ledger’s data monoliths—dynamic inner-circle betrayal.',
    mission_ids: ['sg_1', 'sg_2', 'sg_3', 'sg_4', 'sg_5'],
  },
  {
    id: 'global',
    act: 'ACT_IV',
    order: 8,
    city: 'Apex Forum',
    country: 'International Waters',
    region: 'GLOBAL',
    difficulty_label: 'GENIUS',
    venue_name: 'The Apex Forum Citadel',
    venue_3d_scene: 'cairo_solar_hall.glb',
    backdrop: 'assets/venues/global.jpg',
    boss_relic_id: 'master_ledger',
    lead_speaker: 'vance',
    globe_lat_lon: [0.0, -30.0],
    tagline: 'Two billion live viewers—face Julian Vance for the Master Ledger Key & 4 Endings.',
    mission_ids: ['global_1', 'global_2', 'global_3', 'global_4', 'global_5'],
  },
];

function moodToExpression(mood?: string): CharacterExpression {
  const m = (mood ?? '').toUpperCase();
  if (m.includes('SHOCK') || m.includes('RATTLE') || m.includes('ALARM')) return 'shocked';
  if (m.includes('SMIRK') || m.includes('TRIUMPH') || m.includes('PROUD')) return 'smirk';
  if (
    m.includes('INTENSE') ||
    m.includes('INTRIGUE') ||
    m.includes('TENSE') ||
    m.includes('CHILL') ||
    m.includes('CRYPTIC')
  ) {
    return 'intense';
  }
  return 'neutral';
}

const CORE_SPINE_ID_RE = /^(ch|gb|jp|br|eg|is|sg|global)_[1-5]$/;

function isOptionalSideMission(raw?: Partial<RawMissionDef> | null, fallbackId = ''): boolean {
  const id = raw?.id ?? fallbackId;
  // Canonical 5 Core Story Spine missions (`ch_1..5` .. `global_1..5` = 40 Core Spine) are ALWAYS Core Story!
  if (CORE_SPINE_ID_RE.test(id)) return false;
  if (raw?.optional_side_mission || raw?.is_side_mission) return true;
  if (/_(side|op|inv|dossier|contract)_/i.test(id)) return true;
  const suffixNum = Number(id.split('_')[1]);
  if (Number.isFinite(suffixNum) && suffixNum > 5) return true;
  if (typeof raw?.rhythm_slot === 'number' && raw.rhythm_slot > 5) return true;
  return false;
}

function estimateMissionMinutes(raw?: RawMissionDef | null): number {
  const qCount = raw?.question_count ?? 8;
  const beatCount =
    (raw?.dialogue_beats?.length ?? 2) + (raw?.post_match_beats?.length ?? 1);
  const cutsceneBonus = raw?.cutscene_before ? 1.5 : 0;
  // Honest ~1.05 min per 3D Prism (Spin + Peel + Overclock + Reveal Why) + dialogue + backstage cadence
  return Number((qCount * 1.05 + beatCount * 0.35 + 1.4 + cutsceneBonus).toFixed(2));
}

function expandMorphMix(
  morphMix: Partial<Record<Archetype3D, number>>,
  totalCount: number,
  isBoss: boolean
): Archetype3D[] {
  if (isBoss && totalCount >= 5) {
    // 1:1 Phase boundary alignment with ForgeEngine & BossPhaseBannerDirector (#176):
    // p1Count = totalCount >= 9 ? 4 : 2; HERO_ARTIFACT_SYNTHESIS sits at index === p1Count!
    const p1Count = totalCount >= 9 ? 4 : 2;
    const p1Pool: Archetype3D[] = [
      'GAUNTLET_SHATTER',
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'CALIBRATOR_DIAL',
    ];
    const p3Pool: Archetype3D[] = [
      'CODEX_DUAL_RING',
      'SIGHTLINE_LOCK',
      'CALIBRATOR_DIAL',
      'GAUNTLET_SHATTER',
      'SIGHTLINE_LOCK',
      'CODEX_DUAL_RING',
      'CALIBRATOR_DIAL',
      'SIGHTLINE_LOCK',
      'GAUNTLET_SHATTER',
      'SIGHTLINE_LOCK',
    ];
    const seq: Archetype3D[] = [
      ...p1Pool.slice(0, p1Count),
      'HERO_ARTIFACT_SYNTHESIS',
      ...p3Pool,
    ];
    return seq.slice(0, totalCount);
  }

  const expanded: Archetype3D[] = [];
  const order: Archetype3D[] = [
    'SIGHTLINE_LOCK',
    'CODEX_DUAL_RING',
    'GAUNTLET_SHATTER',
    'CALIBRATOR_DIAL',
    'HERO_ARTIFACT_SYNTHESIS',
  ];
  for (const arch of order) {
    const c = Math.max(0, Math.floor(Number(morphMix[arch]) || 0));
    for (let i = 0; i < c; i++) expanded.push(arch);
  }
  // Interleave so we don't stack identical secondary morphs back-to-back
  const sightlines = expanded.filter((a) => a === 'SIGHTLINE_LOCK');
  const others = expanded.filter((a) => a !== 'SIGHTLINE_LOCK');
  const interleaved: Archetype3D[] = [];
  while (sightlines.length > 0 || others.length > 0) {
    if (sightlines.length > 0) interleaved.push(sightlines.shift()!);
    if (others.length > 0) interleaved.push(others.shift()!);
  }
  while (interleaved.length < totalCount) interleaved.push('SIGHTLINE_LOCK');
  return interleaved.slice(0, totalCount);
}

const FAILED_ATTEMPTS_STORAGE_KEY = 'ws_campaign_failed_attempts_v1';

export class CampaignCircuitDirector {
  private readonly blackboard: InkBlackboard;
  private readonly passport: PassportSystem;
  private readonly dossier: EvidenceDossier;
  private attachedPrologue: PrologueDirector | null = null;
  private attachedWave2: Wave2NarrativeDirector | null = null;

  private loaded = false;
  private loadingPromise: Promise<void> | null = null;

  private hubs: RawHubDef[] = [...BOOTSTRAP_HUBS];
  private missionsById = new Map<string, RawMissionDef>();
  private cutscenesByMission = new Map<string, ActCutsceneSpec>();
  private cutscenesById = new Map<string, ActCutsceneSpec>();
  private rivalReactions: RawCampaignJson['rival_reactions'] | null = null;
  private endings: RawEndingDef[] = [];
  private failedMissionAttempts: Record<string, FailedMissionAttemptInfo> = {};
  private lastRivalReactionAtMs = -Infinity;

  constructor(blackboard: InkBlackboard, passport: PassportSystem, dossier: EvidenceDossier) {
    this.blackboard = blackboard;
    this.passport = passport;
    this.dossier = dossier;
    this.failedMissionAttempts = this.loadFailedAttempts();
  }

  public attachDirectors(deps: {
    prologue?: PrologueDirector;
    wave2?: Wave2NarrativeDirector;
  }): void {
    if (deps.prologue) this.attachedPrologue = deps.prologue;
    if (deps.wave2) this.attachedWave2 = deps.wave2;
  }

  private parseFailedAttemptsObject(
    raw: unknown
  ): Record<string, FailedMissionAttemptInfo> {
    const out: Record<string, FailedMissionAttemptInfo> = {};
    if (!raw || typeof raw !== 'object') return out;
    for (const [missionId, entry] of Object.entries(raw as Record<string, unknown>)) {
      if (!entry || typeof entry !== 'object') continue;
      const rec = entry as Partial<FailedMissionAttemptInfo>;
      const validReason: MissionFailReason =
        rec.lastFailReason === 'OUTSCORED_BY_RIVAL' ||
        rec.lastFailReason === 'SHIELDS_DEPLETED' ||
        rec.lastFailReason === 'PHASE3_SUDDEN_DEATH_BACKFIRE' ||
        rec.lastFailReason === 'TIMEOUT'
          ? rec.lastFailReason
          : 'OUTSCORED_BY_RIVAL';
      const attempts = Math.max(1, Math.floor(Number(rec.attempts) || 1));
      out[missionId] = {
        missionId,
        attempts,
        bestScore: Math.max(0, Math.round(Number(rec.bestScore) || 0)),
        lastRivalScore: Math.max(0, Math.round(Number(rec.lastRivalScore) || 0)),
        lastFailReason: validReason,
        lastFailedAtIso:
          typeof rec.lastFailedAtIso === 'string'
            ? rec.lastFailedAtIso
            : new Date().toISOString(),
        statusBadge: '⚠ FAILED — RETRYABLE',
      };
    }
    return out;
  }

  private loadFailedAttempts(): Record<string, FailedMissionAttemptInfo> {
    try {
      if (typeof localStorage === 'undefined') return {};
      const raw = localStorage.getItem(FAILED_ATTEMPTS_STORAGE_KEY);
      if (!raw) return {};
      return this.parseFailedAttemptsObject(JSON.parse(raw));
    } catch {
      return {};
    }
  }

  private saveFailedAttempts(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          FAILED_ATTEMPTS_STORAGE_KEY,
          JSON.stringify(this.failedMissionAttempts)
        );
      }
    } catch {
      // Ignore storage quota issues
    }
  }

  public getFailedMissionAttemptsSnapshot(): Record<string, FailedMissionAttemptInfo> {
    const copy: Record<string, FailedMissionAttemptInfo> = {};
    for (const [k, v] of Object.entries(this.failedMissionAttempts)) {
      copy[k] = { ...v };
    }
    return copy;
  }

  public hydrateFailedMissionAttempts(raw: unknown): void {
    this.failedMissionAttempts = this.parseFailedAttemptsObject(raw);
    this.saveFailedAttempts();
  }

  public clearFailedMissionAttempts(): void {
    this.failedMissionAttempts = {};
    this.saveFailedAttempts();
  }

  public getFailedAttemptInfo(missionId: string): FailedMissionAttemptInfo | null {
    const completed = this.blackboard.getSnapshot().completedMissions;
    if (completed.includes(missionId)) return null;
    const rec = this.failedMissionAttempts[missionId];
    return rec ? { ...rec } : null;
  }

  /**
   * Records an explicit Mission Failure (`#171` — NEVER marks the mission completed or grants Visa/Relic!).
   */
  public recordMissionFailed(
    missionId: string,
    score: number,
    rivalScore: number,
    failReason: MissionFailReason
  ): FailedMissionAttemptInfo {
    const prev = this.failedMissionAttempts[missionId];
    const safeScore = Math.max(0, Math.round(score));
    const safeRival = Math.max(0, Math.round(rivalScore));
    const updated: FailedMissionAttemptInfo = {
      missionId,
      attempts: (prev?.attempts ?? 0) + 1,
      bestScore: Math.max(prev?.bestScore ?? 0, safeScore),
      lastRivalScore: safeRival,
      lastFailReason: failReason,
      lastFailedAtIso: new Date().toISOString(),
      statusBadge: '⚠ FAILED — RETRYABLE',
    };
    this.failedMissionAttempts[missionId] = updated;
    this.saveFailedAttempts();
    return { ...updated };
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Loads `public/data/campaign_20hr.json` (40 missions, 6 Act Cutscenes, 12 Clues, 30 Reactions, 4 Endings).
   */
  public async loadCampaignData(url = 'data/campaign_20hr.json'): Promise<void> {
    if (this.loaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Failed to load ${url}: HTTP ${resp.status}`);
      }
      const raw = (await resp.json()) as RawCampaignJson;
      this.ingestCampaignJson(raw);
      this.loaded = true;
    })();

    try {
      await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }

  public ingestCampaignJson(raw: RawCampaignJson): void {
    if (Array.isArray(raw.hubs) && raw.hubs.length > 0) {
      this.hubs = raw.hubs;
    }

    this.cutscenesByMission.clear();
    this.cutscenesById.clear();
    if (Array.isArray(raw.act_cutscenes)) {
      for (const cs of raw.act_cutscenes) {
        const spec: ActCutsceneSpec = {
          id: cs.id,
          actIndex: cs.act_index,
          triggerBeforeMissionId: cs.trigger_before_mission,
          hubId: cs.hub_id,
          title: cs.title,
          location: cs.location,
          imageUrl: resolveWebAssetPath(cs.image) ?? `assets/cutscenes/${cs.id}.jpg`,
          weatherFx: cs.weather_fx,
          kenBurns: {
            startScale: cs.ken_burns?.start_scale ?? 1.04,
            endScale: cs.ken_burns?.end_scale ?? 1.14,
            panX: cs.ken_burns?.pan_x ?? 0.03,
            panY: cs.ken_burns?.pan_y ?? -0.02,
          },
          lines: cs.lines.map((ln) => ({
            id: ln.id,
            speakerId: ln.speaker,
            speakerName: ln.speaker_name,
            expression: ln.expression,
            portraitUrl: getPortraitUrl(ln.speaker, ln.expression),
            voiceUrl: resolveWebAssetPath(ln.voice_clip),
            text: this.passport.interpolateText(ln.text),
          })),
        };
        this.cutscenesById.set(spec.id, spec);
        this.cutscenesByMission.set(spec.triggerBeforeMissionId, spec);
      }
    }

    if (raw.evidence_board) {
      this.dossier.hydrateFromCampaignSchema(raw.evidence_board);
    }

    if (raw.rival_reactions) {
      this.rivalReactions = raw.rival_reactions;
    }

    this.missionsById.clear();
    if (Array.isArray(raw.missions)) {
      for (const m of raw.missions) {
        this.missionsById.set(m.id, m);
      }
    }

    if (Array.isArray(raw.endings)) {
      this.endings = raw.endings;
    }
    this.loaded = true;
  }

  private resolveHubMissionSplit(hub: RawHubDef): {
    allIds: string[];
    coreIds: string[];
    sideIds: string[];
  } {
    const seen = new Set<string>();
    const orderedIds: string[] = [];
    for (const id of hub.core_mission_ids ?? []) {
      if (!seen.has(id)) {
        seen.add(id);
        orderedIds.push(id);
      }
    }
    for (const id of hub.mission_ids ?? []) {
      if (!seen.has(id)) {
        seen.add(id);
        orderedIds.push(id);
      }
    }
    for (const id of hub.side_mission_ids ?? []) {
      if (!seen.has(id)) {
        seen.add(id);
        orderedIds.push(id);
      }
    }
    for (const [mId, mRaw] of this.missionsById.entries()) {
      if (mRaw.hub_id === hub.id && !seen.has(mId)) {
        seen.add(mId);
        orderedIds.push(mId);
      }
    }

    const coreIds: string[] = [];
    const sideIds: string[] = [];
    for (const id of orderedIds) {
      const raw = this.missionsById.get(id);
      if (isOptionalSideMission(raw, id)) {
        sideIds.push(id);
      } else {
        coreIds.push(id);
      }
    }
    return {
      allIds: [...coreIds, ...sideIds],
      coreIds,
      sideIds,
    };
  }

  /**
   * Explicitly grants Diplomatic Cross-Clearance / Hub unlock (`#175` §2), preserving `act1_route` flags!
   */
  public unlockHub(hubId: HubId): HubGridCard | null {
    this.blackboard.setFlag(`unlocked_hub_${hubId}`, true);
    if (hubId === 'gb' || hubId === 'jp') {
      this.blackboard.setFlag('diplomatic_cross_clearance', true);
    }
    return this.getHubGridCards().find((c) => c.hubId === hubId) ?? null;
  }

  /**
   * Returns all 8 Global Hubs for the responsive 4×2 / 2×4 World Globe Campaign Grid (`#175` Core + Side Dossiers)!
   */
  public getHubGridCards(): HubGridCard[] {
    const snap = this.blackboard.getSnapshot();
    const completed = new Set(snap.completedMissions);

    const isHubCoreCleared = (hubId: HubId) => completed.has(`${hubId}_5`);
    const prologueCleared = snap.prologueComplete || isHubCoreCleared('ch');
    const act1AnyCleared = isHubCoreCleared('gb') || isHubCoreCleared('jp');
    const act1BothCleared = isHubCoreCleared('gb') && isHubCoreCleared('jp');
    const act2Reached =
      act1BothCleared ||
      snap.currentMissionId.startsWith('br_') ||
      completed.has('br_1') ||
      Boolean(snap.branchFlags.diplomatic_cross_clearance);

    return this.hubs.map((hub) => {
      const { allIds, coreIds, sideIds } = this.resolveHubMissionSplit(hub);
      const coreDone = coreIds.filter((id) => completed.has(id)).length;
      const sideDone = sideIds.filter((id) => completed.has(id)).length;
      const doneInHub = coreDone + sideDone;
      const coreAllDone = coreIds.length > 0 && coreDone >= coreIds.length;
      const explicitUnlock = Boolean(snap.branchFlags[`unlocked_hub_${hub.id}`]);

      let unlocked = explicitUnlock;
      let diplomaticCrossClearance = false;

      if (!unlocked) {
        switch (hub.id) {
          case 'ch':
            unlocked = true;
            break;
          case 'gb':
            unlocked =
              prologueCleared &&
              (snap.firstFlight === 'GB' ||
                snap.firstFlight === null ||
                isHubCoreCleared('jp') ||
                act2Reached);
            if (snap.firstFlight === 'JP' && (isHubCoreCleared('jp') || act2Reached)) {
              diplomaticCrossClearance = true;
            }
            break;
          case 'jp':
            unlocked =
              prologueCleared &&
              (snap.firstFlight === 'JP' || isHubCoreCleared('gb') || act2Reached);
            if (
              (snap.firstFlight === 'GB' || snap.firstFlight === null) &&
              (isHubCoreCleared('gb') || act2Reached)
            ) {
              diplomaticCrossClearance = true;
            }
            break;
          case 'br':
            unlocked =
              act1BothCleared ||
              (act1AnyCleared && snap.currentMissionId.startsWith('br_')) ||
              completed.has('br_1');
            break;
          case 'eg':
            unlocked = isHubCoreCleared('br');
            break;
          case 'is':
            unlocked = isHubCoreCleared('eg');
            break;
          case 'sg':
            unlocked = isHubCoreCleared('is');
            break;
          case 'global':
            unlocked = isHubCoreCleared('sg');
            break;
        }
      } else if (
        (hub.id === 'gb' && snap.firstFlight === 'JP') ||
        (hub.id === 'jp' && snap.firstFlight === 'GB')
      ) {
        diplomaticCrossClearance = true;
      }

      const status: HubGridCard['status'] = coreAllDone
        ? 'COMPLETED'
        : !unlocked
          ? 'LOCKED'
          : doneInHub > 0
            ? 'IN_PROGRESS'
            : 'AVAILABLE';

      const nextPlayableMissionId =
        coreIds.find((id) => !completed.has(id)) ??
        sideIds.find((id) => !completed.has(id)) ??
        allIds[0] ??
        `${hub.id}_1`;

      let activeBranchBadge: string | null = null;
      if (hub.id === 'gb' && snap.branchFlags.london_briefing === 'BURNED') {
        activeBranchBadge = 'CLEAN HANDS · BLACK SALON';
      } else if (hub.id === 'gb' && snap.branchFlags.london_briefing === 'ACCEPTED') {
        activeBranchBadge = 'SOVEREIGN BRIEFING';
      } else if (hub.id === 'jp' && snap.branchFlags.tokyo_earpiece === 'JAMMED') {
        activeBranchBadge = 'SIGNAL JAMMER FIRED';
      } else if (hub.id === 'jp' && snap.branchFlags.tokyo_earpiece === 'BLACKMAILED') {
        activeBranchBadge = 'HORIZON LENS';
      } else if (hub.id === 'br' && snap.branchFlags.rio_sabotage === 'SAVED_NADIA') {
        activeBranchBadge = 'ALLIED NADIA';
      } else if (hub.id === 'br' && snap.branchFlags.rio_sabotage === 'CLAIMED_SEED') {
        activeBranchBadge = 'NEMESIS NADIA';
      } else if ((hub.id === 'eg' || hub.id === 'is') && snap.act3Branch === 'WHISTLEBLOWER') {
        activeBranchBadge = 'WHISTLEBLOWER PATH';
      } else if ((hub.id === 'eg' || hub.id === 'is') && snap.act3Branch === 'INSIDER') {
        activeBranchBadge = 'INSIDER GAMBIT';
      } else if (hub.id === 'sg' && snap.singaporeBetrayer) {
        activeBranchBadge = `BETRAYER: ${snap.singaporeBetrayer.toUpperCase()}`;
      } else if (diplomaticCrossClearance) {
        activeBranchBadge = 'DIPLOMATIC CROSS-CLEARANCE';
      }

      const failedMissionIds = allIds.filter(
        (id) => !completed.has(id) && Boolean(this.failedMissionAttempts[id])
      );
      const nextFail = !completed.has(nextPlayableMissionId)
        ? this.failedMissionAttempts[nextPlayableMissionId]
          ? { ...this.failedMissionAttempts[nextPlayableMissionId] }
          : null
        : null;
      const statusBadge =
        status === 'COMPLETED'
          ? sideIds.length > 0 && sideDone < sideIds.length
            ? `STORY CLEARED · ${sideDone}/${sideIds.length} DOSSIERS`
            : 'CLEARED'
          : status === 'LOCKED'
            ? 'LOCKED'
            : nextFail
              ? '⚠ FAILED — RETRYABLE'
              : status === 'IN_PROGRESS'
                ? 'IN PROGRESS'
                : diplomaticCrossClearance
                  ? 'ENVOY CROSS-CLEARANCE'
                  : 'AVAILABLE';

      return {
        hubId: hub.id,
        countryCode: hub.region,
        order: hub.order,
        city: hub.city,
        country: hub.country,
        venueName: hub.venue_name,
        venueGlbUrl: `assets/aaa_models/${CANONICAL_VENUE_GLB_BY_HUB[hub.id] ?? hub.venue_3d_scene}`,
        backdropUrl: resolveWebAssetPath(hub.backdrop) ?? `assets/venues/${hub.id}.jpg`,
        difficultyLabel: hub.difficulty_label,
        tagline: hub.tagline,
        globeLatLon: hub.globe_lat_lon,
        bossRelicId: hub.boss_relic_id,
        leadSpeakerId: hub.lead_speaker,
        missionIds: allIds,
        coreMissionIds: coreIds,
        sideInvestigationIds: sideIds,
        completedCount: doneInHub,
        totalCount: allIds.length,
        coreCompletedCount: coreDone,
        coreTotalCount: coreIds.length,
        sideCompletedCount: sideDone,
        sideTotalCount: sideIds.length,
        diplomaticCrossClearance,
        status,
        nextPlayableMissionId,
        activeBranchBadge,
        failedMissionIds,
        failedAttemptInfo: nextFail,
        statusBadge,
      };
    });
  }

  /**
   * Returns a detailed Hub View cleanly separating Core Story Missions (`5`) vs
   * City Dossier Investigations (`7` optional story side-ops) + `⚠ FAILED — RETRYABLE` badges (`#171` & `#175`)!
   */
  public getHubView(hubId: HubId): CampaignHubView | null {
    const hub = this.getHubGridCards().find((h) => h.hubId === hubId);
    if (!hub) return null;
    const snap = this.blackboard.getSnapshot();
    const completed = new Set(snap.completedMissions);
    const hubUnlocked = hub.status !== 'LOCKED';

    const buildSummary = (
      mId: string,
      idx: number,
      isSide: boolean
    ): CampaignMissionSummary => {
      const raw = this.missionsById.get(mId);
      const isDone = completed.has(mId);
      const failInfo = !isDone && this.failedMissionAttempts[mId]
        ? { ...this.failedMissionAttempts[mId] }
        : null;
      // Core Story missions unlock sequentially; Optional City Dossier Investigations unlock as soon as the Hub is unlocked!
      const isNext = !isDone && hubUnlocked && mId === hub.nextPlayableMissionId;
      const isSideAvailable = isSide && hubUnlocked && !isDone;
      const statusBadge: CampaignMissionSummary['statusBadge'] = isDone
        ? 'COMPLETED'
        : failInfo
          ? '⚠ FAILED — RETRYABLE'
          : isNext
            ? 'NEXT'
            : isSideAvailable
              ? 'AVAILABLE'
              : 'LOCKED';

      const qCount = raw?.question_count ?? (isSide ? 10 : 8);
      const estMin = estimateMissionMinutes(raw);

      return {
        id: mId,
        missionNumber: raw?.mission_number ?? idx + 1,
        hubId,
        rhythmSlot: raw?.rhythm_slot ?? (isSide ? 6 + idx : idx + 1),
        title: raw?.title ?? (isSide ? `Dossier Operation ${idx + 1}` : `Stage ${idx + 1}`),
        subtitle: raw?.subtitle ?? hub.venueName,
        difficultyLabel: raw?.difficulty_label ?? hub.difficultyLabel,
        isSideInvestigation: isSide,
        category: isSide ? 'DOSSIER_INVESTIGATION' : 'CORE_STORY',
        questionCount: qCount,
        estimatedMinutes: estMin,
        completed: isDone,
        isNextPlayable: isNext || isSideAvailable,
        failedAttemptInfo: failInfo,
        statusBadge,
      };
    };

    const coreMissions = hub.coreMissionIds.map((id, idx) => buildSummary(id, idx, false));
    const sideInvestigations = hub.sideInvestigationIds.map((id, idx) =>
      buildSummary(id, idx, true)
    );
    const missions = [...coreMissions, ...sideInvestigations];
    const remainingMinutes = missions
      .filter((m) => !m.completed)
      .reduce((acc, m) => acc + m.estimatedMinutes, 0);
    const hubCompletionPct =
      missions.length > 0
        ? Math.round((missions.filter((m) => m.completed).length / missions.length) * 100)
        : 0;

    return {
      hub,
      missions,
      coreMissions,
      sideInvestigations,
      failedMissionCount: missions.filter((m) => m.failedAttemptInfo !== null).length,
      hubCompletionPct,
      estimatedRemainingHours: Number((remainingMinutes / 60).toFixed(1)),
    };
  }

  public getAllHubViews(): CampaignHubView[] {
    return this.getHubGridCards()
      .map((c) => this.getHubView(c.hubId))
      .filter((v): v is CampaignHubView => v !== null);
  }

  /**
   * Computes global 20+ Hour Campaign Overview (`X / 96 Missions`, Completion %, & Estimated Remaining Hours — `#175` §2)!
   */
  public getCampaignOverview(): CampaignOverviewStats {
    const cards = this.getHubGridCards();
    const snap = this.blackboard.getSnapshot();
    const completed = new Set(snap.completedMissions);

    let coreTotalCount = 0;
    let coreCompletedCount = 0;
    let sideTotalCount = 0;
    let sideCompletedCount = 0;
    let totalQuestionsCount = 0;
    let totalMinutes = 0;
    let playedMinutes = 0;

    for (const card of cards) {
      coreTotalCount += card.coreTotalCount;
      coreCompletedCount += card.coreCompletedCount;
      sideTotalCount += card.sideTotalCount;
      sideCompletedCount += card.sideCompletedCount;

      for (const mId of card.missionIds) {
        const raw = this.missionsById.get(mId);
        const qCount = raw?.question_count ?? 10;
        const mins = estimateMissionMinutes(raw);
        totalQuestionsCount += qCount;
        totalMinutes += mins;
        if (completed.has(mId)) {
          playedMinutes += mins;
        }
      }
    }

    // If called before `campaign_20hr.json` has been fetched, report the canonical 96-mission / 21.5h circuit scale
    if (this.missionsById.size === 0) {
      coreTotalCount = 40;
      sideTotalCount = 56;
      totalQuestionsCount = 1056;
      totalMinutes = 21.5 * 60;
      playedMinutes = completed.size * (totalMinutes / 96);
    }

    const totalMissionsCount = Math.max(1, coreTotalCount + sideTotalCount);
    const completedMissionsCount = coreCompletedCount + sideCompletedCount;
    const completionPct = Math.min(
      100,
      Math.round((completedMissionsCount / totalMissionsCount) * 100)
    );
    const estimatedTotalHours = Number((totalMinutes / 60).toFixed(1));
    const estimatedPlayedHours = Number((playedMinutes / 60).toFixed(1));
    const estimatedRemainingHours = Math.max(
      0,
      Number(((totalMinutes - playedMinutes) / 60).toFixed(1))
    );
    const diplomaticCrossClearanceActive = cards.some((c) => c.diplomaticCrossClearance);

    return {
      completedMissionsCount,
      totalMissionsCount,
      completionPct,
      completionLabel: `${completedMissionsCount} / ${totalMissionsCount} Missions (${completionPct}%)`,
      coreCompletedCount,
      coreTotalCount,
      sideCompletedCount,
      sideTotalCount,
      totalQuestionsCount,
      estimatedTotalHours,
      estimatedPlayedHours,
      estimatedRemainingHours,
      estimatedRemainingLabel:
        estimatedRemainingHours <= 0
          ? 'Circuit Complete'
          : `~${estimatedRemainingHours.toFixed(1)} hrs remaining`,
      diplomaticCrossClearanceActive,
    };
  }

  /**
   * Prepares full Mission View (Cutscene, Dialogue Beats w/ Passive Domain Insights, Choices, & Match Spec).
   */
  public getMissionView(missionId?: string, weakestDomainId?: DomainId): CampaignMissionView | null {
    const targetId = missionId ?? this.blackboard.getSnapshot().currentMissionId;
    const raw = this.missionsById.get(targetId);
    if (!raw) return null;

    const snap = this.blackboard.getSnapshot();
    const passportSnap = this.passport.getSnapshot();
    const effectiveWeakest = weakestDomainId ?? this.passport.getWeakestDomainId();

    const cutsceneBefore = raw.cutscene_before
      ? this.cutscenesById.get(raw.cutscene_before) ?? null
      : this.cutscenesByMission.get(raw.id) ?? null;

    const mapBeat = (b: RawDialogueBeat): CampaignDialogueBeat => {
      let expr = moodToExpression(b.mood);
      let passiveDomainInsight: CampaignDialogueBeat['passiveDomainInsight'];
      if (b.passive_elo_check) {
        const dId = b.passive_elo_check.domain_id;
        const playerElo = passportSnap.domainElo[dId] ?? 1200;
        const solvedInDomain = passportSnap.domainQuestionsSolved[dId] ?? 0;
        const cleanInsight = this.passport
          .interpolateText(b.passive_elo_check.insight)
          .replace(/\[\[\s*[^\]]+\][^\]]*\]/g, '')
          .replace(/^\s*\[[^\]]+\]\s*/, '')
          .replace(/\[\[[\s\S]*?\]\]/g, '')
          .trim();
        passiveDomainInsight = {
          domainId: dId,
          minElo: b.passive_elo_check.min_elo,
          unlocked: solvedInDomain > 0 && playerElo >= Math.max(1250, b.passive_elo_check.min_elo),
          insightText: cleanInsight,
        };
      }

      // Dynamic speaker, dialogue, tellHint & voice substitution on Singapore Betrayal (`sg_3`)
      let speakerId = b.speaker;
      let speakerName = b.speaker_name;
      let speakerRole = b.speaker_role;
      let beatText = b.text;
      let beatTellHint = b.tell_hint;
      let beatVoiceClip: string | undefined = b.voice_clip;

      if (raw.id === 'sg_3' && b.speaker === 'nadia') {
        const betrayal = this.blackboard.resolveSingaporeBetrayer();
        speakerId = betrayal.betrayerId;
        beatVoiceClip = `assets/voice/singapore_betrayal_${speakerId}.mp3`;
        if (speakerId === 'teo') {
          speakerName = 'Mateo "Teo" Rojas';
          speakerRole = 'Rogue Broadcast Producer';
          expr = 'intense';
          beatTellHint =
            'Hands trembling over the live lockout console—glancing toward an encrypted Geneva relay.';
          beatText =
            "They threatened my family in Geneva... I'm sorry! Solve the seal fast before my lockout finishes!";
        } else if (speakerId === 'soren') {
          speakerName = 'Soren "Echo" Kael';
          speakerRole = 'Card Shark & Rival';
          expr = 'smirk';
          beatTellHint =
            'Spins a silver Sovereign clearance coin across his knuckles—concealing a bridge override.';
          beatText =
            "Nothing personal, friend—the Council cleared my syndicate slate. Beat me clean, and I'll still hand you the override.";
        } else {
          speakerName = 'Nadia Al-Mansoor';
          speakerRole = 'Acoustic Engineer & Rival';
          expr = 'shocked';
          beatTellHint = 'Jaw clenched tight—holding a signed Sovereign pardon for her brother Tariq.';
          beatText =
            "Lindqvist promised me Tariq's freedom if I stop you tonight. Forgive me—family comes first.";
        }
      } else if (raw.id === 'is_1' && b.id === 'is_1_b1' && snap.act3Branch === 'INSIDER') {
        // Insider Gambit covert Conclave entry (no 40M pirate broadcast)
        speakerId = 'vance';
        speakerName = 'Julian Vance';
        speakerRole = 'Chief Host · The Meridian';
        expr = 'intense';
        beatTellHint =
          'Lowers his voice beside the sealed basalt Conclave doors as Sovereign delegates file inside.';
        beatText =
          'No pirate cameras tonight—your discretion in Cairo put us inside the closed Council Conclave. Play them from within.';
        beatVoiceClip = undefined;
      } else if (
        raw.id === 'jp_3' &&
        b.id === 'jp_3_post' &&
        snap.branchFlags.tokyo_earpiece === 'BLACKMAILED'
      ) {
        // Blackmailed Soren branch (silent telemetry pact instead of live signal jam)
        beatTellHint =
          'Eyes narrowing as Soren’s Horizon telemetry feed goes conspicuously silent across the sky terrace.';
        beatText =
          'A silent telemetry pact at seventy stories. Tokyo rewards leverage—just watch who holds the other end.';
        beatVoiceClip = undefined;
      }

      return {
        id: b.id,
        speakerId,
        speakerName,
        speakerRole,
        expression: expr,
        portraitUrl: getPortraitUrl(speakerId, expr),
        tellHint: beatTellHint ? this.passport.interpolateText(beatTellHint) : undefined,
        text: this.passport.interpolateText(beatText),
        voiceUrl: resolveWebAssetPath(beatVoiceClip),
        passiveDomainInsight,
      };
    };

    const choices: CampaignChoiceOption[] = (raw.choices ?? []).map((c) => {
      const available = this.blackboard.evaluateCondition(c.requires);
      return {
        id: c.id,
        label: this.passport.interpolateText(c.label),
        subtext: this.passport.interpolateText(c.subtext),
        impactBadge: c.impact_badge,
        tone: c.tone ?? 'gold',
        isRedCheck: Boolean(c.is_red_check),
        available,
        lockedReason: available
          ? undefined
          : `Requires: ${c.impact_badge.replace(/^.*Needs\s*/i, '')}`,
        endingId: c.ending_id,
        responseLine: c.response_line
          ? this.passport.interpolateText(c.response_line)
          : undefined,
        nextMissionId: c.next_mission_id,
        rawEffects: c.effects,
      };
    });

    // #145 [P1] Guarantee >= 1 playable Championship Ending on `global_5` (zero-softlock!)
    if (choices.length > 0 && choices.every((c) => !c.available)) {
      const fallbackEndingId = this.computeBestFitEndingId();
      const bestChoice =
        choices.find((c) => c.endingId === fallbackEndingId) ?? choices[0];
      bestChoice.available = true;
      bestChoice.lockedReason = undefined;
    }

    const matchSpec = this.prepareMissionMatch(raw, effectiveWeakest);
    const failedAttemptInfo = this.getFailedAttemptInfo(raw.id);

    return {
      id: raw.id,
      missionNumber: raw.mission_number,
      hubId: raw.hub_id,
      countryCode: raw.venue_region,
      rhythmSlot: Math.min(5, Math.max(1, Math.round(raw.rhythm_slot || 1))) as 1 | 2 | 3 | 4 | 5,
      title: raw.title,
      subtitle: raw.subtitle,
      difficultyLabel: raw.difficulty_label,
      passGoal: raw.pass_goal,
      cutsceneBefore,
      preMatchBeats: raw.dialogue_beats.map(mapBeat),
      choices,
      postMatchBeats: (raw.post_match_beats ?? []).map(mapBeat),
      cliffhangerHook: this.passport.interpolateText(raw.cliffhanger_hook),
      matchSpec,
      failedAttemptInfo,
    };
  }

  private prepareMissionMatch(
    raw: RawMissionDef,
    weakestDomainId: DomainId
  ): CampaignMatchSpec {
    const snap = this.blackboard.getSnapshot();
    const hubDef = this.hubs.find((h) => h.id === raw.hub_id) ?? BOOTSTRAP_HUBS[0];

    // Determine effective rival (substituting dynamic betrayer in sg_3 and finalist in global_3)
    let effectiveRivalId: CastMemberId = raw.rival_id;
    if (raw.id === 'sg_3') {
      effectiveRivalId = this.blackboard.resolveSingaporeBetrayer().betrayerId;
    } else if (raw.id === 'global_3') {
      effectiveRivalId =
        snap.singaporeBetrayer === 'nadia'
          ? 'nadia'
          : snap.singaporeBetrayer === 'soren'
            ? 'soren'
            : snap.bondTiers.nadia === 'NEMESIS'
              ? 'nadia'
              : 'soren';
    }

    const rawMutators =
      raw.mutators && raw.mutators.length > 0
        ? raw.mutators
        : raw.mutator
          ? [raw.mutator]
          : [];

    const compiledRules = this.blackboard.compileMatchRules({
      missionId: raw.id,
      hubId: raw.hub_id,
      rawLighting: raw.lighting_state,
      missionMutators: rawMutators,
      rivalId: effectiveRivalId,
      weakestDomainId,
    });

    // Apply New Circuit+ IRT escalation (+0.45 per loop)
    const ncpLift = snap.newCircuitPlusCount * 0.45;
    const irtBRange: [number, number] = [
      Number((raw.irt_b_range[0] + ncpLift).toFixed(2)),
      Number((raw.irt_b_range[1] + ncpLift).toFixed(2)),
    ];

    // If Nemesis Nadia GRUDGE_WEAKEST_DOMAIN is active, focus preferredDomains onto weakestDomainId!
    const preferredDomains: DomainId[] =
      compiledRules.nemesisWeakestDomainActive && compiledRules.nemesisTargetDomainId !== null
        ? [compiledRules.nemesisTargetDomainId, ...raw.preferred_domains.slice(0, 1)]
        : [...raw.preferred_domains];

    const isBossShowdown = raw.rhythm_slot === 5 && !isOptionalSideMission(raw, raw.id);
    const morphSequence = expandMorphMix(raw.morph_mix, raw.question_count, isBossShowdown);

    let bossPhases: BossPhaseBlueprint[] | null = null;
    if (isBossShowdown) {
      const p1Count = raw.question_count >= 9 ? 4 : raw.question_count >= 5 ? 2 : 1;
      const p2Count = 1; // 3-step chained HERO_ARTIFACT_SYNTHESIS at index === p1Count (#176)
      const p3Count = Math.max(1, raw.question_count - p1Count - p2Count);
      bossPhases = [
        {
          phaseNumber: 1,
          title: 'Phase I · Shield Break',
          subtitle: 'Shatter crystalline Veritas Plates to breach the Boss barrier.',
          archetypes: ['GAUNTLET_SHATTER', 'SIGHTLINE_LOCK'],
          questionCount: p1Count,
          suddenDeathOverclock: false,
        },
        {
          phaseNumber: 2,
          title: 'Phase II · Hero Artifact Synthesis',
          subtitle: 'Unlock mechanical latches across the bespoke 3D city relic.',
          archetypes: ['HERO_ARTIFACT_SYNTHESIS'],
          questionCount: p2Count,
          suddenDeathOverclock: false,
        },
        {
          phaseNumber: 3,
          title: 'Phase III · Sovereign Sudden Death',
          subtitle: 'Final clincher — high-conviction Overclock claims the city Relic!',
          archetypes: ['CODEX_DUAL_RING', 'CALIBRATOR_DIAL', 'SIGHTLINE_LOCK'],
          questionCount: p3Count,
          suddenDeathOverclock: compiledRules.activeMutators.includes('ZERO_SHIELD_SUDDEN_DEATH'),
        },
      ];
    }

    const baseTime = raw.time_per_question_sec;
    const surgeAdjustedTime = compiledRules.activeMutators.includes('CHRONO_SURGE')
      ? Math.max(10, Math.round(baseTime * 0.72))
      : baseTime;

    return {
      missionId: raw.id,
      missionNumber: raw.mission_number,
      act: raw.act,
      hubId: raw.hub_id,
      countryCode: raw.venue_region,
      rhythmSlot: Math.min(5, Math.max(1, Math.round(raw.rhythm_slot || 1))) as 1 | 2 | 3 | 4 | 5,
      rhythmRole: raw.rhythm_role,
      title: raw.title,
      subtitle: raw.subtitle,
      difficultyLabel: raw.difficulty_label,
      passGoal: raw.pass_goal,
      venueGlbUrl: `assets/aaa_models/${CANONICAL_VENUE_GLB_BY_HUB[raw.hub_id] ?? raw.venue_3d_scene}`,
      venueBackdropUrl: resolveWebAssetPath(hubDef.backdrop) ?? `assets/venues/${raw.hub_id}.jpg`,
      stageLightingMode: compiledRules.stageLightingMode,
      questionCount: raw.question_count,
      timePerQuestionSec: surgeAdjustedTime + compiledRules.chronoBonusSec,
      irtBRange,
      preferredDomains,
      regions: [raw.venue_region, 'GLOBAL'],
      morphSequence,
      boostTags: [...(raw.narrative_tags ?? []), ...compiledRules.queryBoostTags],
      rivalId: effectiveRivalId,
      heroRelicId: raw.hero_relic_id,
      unlockRelicId: raw.unlock_relic,
      isBossShowdown,
      bossPhases,
      compiledRules,
      mutatorBrief: compiledRules.nemesisTauntBanner ?? raw.mutator_brief,
      cliffhangerHook: this.passport.interpolateText(raw.cliffhanger_hook),
    };
  }

  /**
   * Commits a campaign choice, applies InkBlackboard & Passport consequences, and resolves routing!
   */
  public selectMissionChoice(
    missionId: string,
    choiceId: string
  ): {
    report: EffectApplicationReport;
    responseLine?: string;
    endingCommitted?: CampaignEndingView;
    overrideNextMissionId?: string | null;
  } {
    const raw = this.missionsById.get(missionId);
    const choice = raw?.choices?.find((c) => c.id === choiceId);
    if (!choice) {
      return {
        report: {
          integrityDelta: 0,
          publicTrustDelta: 0,
          councilFavorDelta: 0,
          bondShifts: [],
          blackSalonNewlyUnlocked: false,
        },
      };
    }

    const report = this.blackboard.applyEffects(choice.effects);
    if (report.unlockedRelic) {
      this.passport.unlockRelic(report.unlockedRelic);
    }

    let endingCommitted: CampaignEndingView | undefined;
    if (choice.ending_id) {
      endingCommitted = this.commitEnding(choice.ending_id);
    }

    return {
      report,
      responseLine: choice.response_line
        ? this.passport.interpolateText(choice.response_line)
        : undefined,
      endingCommitted,
      overrideNextMissionId: choice.next_mission_id,
    };
  }

  /**
   * Completes a mission, unlocks its Evidence Clue & Boss Relic/Visa, and computes exact next mission
   * (honoring London-First vs Tokyo-First Act I Flight Order so neither city is ever skipped!).
   */
  public completeMission(
    missionId: string,
    choiceNextMissionOverride?: string | null
  ): {
    nextMissionId: string | null;
    unlockedEvidenceClueId: string | null;
    unlockedRelicId: HeroRelicId | null;
    hubCleared: boolean;
  } {
    // Clear any prior failed-attempt badge now that the player conquered this level!
    if (this.failedMissionAttempts[missionId]) {
      delete this.failedMissionAttempts[missionId];
      this.saveFailedAttempts();
    }

    const raw = this.missionsById.get(missionId);
    if (!raw) {
      this.blackboard.markMissionCompleted(missionId);
      return {
        nextMissionId: null,
        unlockedEvidenceClueId: null,
        unlockedRelicId: null,
        hubCleared: false,
      };
    }

    // Mark mission done first so hub completion checks see it
    this.blackboard.markMissionCompleted(missionId);
    const snap = this.blackboard.getSnapshot();
    const completed = new Set(snap.completedMissions);

    // Resolve Act I Flight Fork routing (London <-> Tokyo -> Rio)
    let nextMissionId: string | null =
      choiceNextMissionOverride !== undefined ? choiceNextMissionOverride : raw.next_mission_id;

    if (missionId === 'gb_5') {
      nextMissionId = completed.has('jp_5') ? 'br_1' : 'jp_1';
    } else if (missionId === 'jp_5') {
      nextMissionId = completed.has('gb_5') ? 'br_1' : 'gb_1';
    }

    // Only update currentMissionId on Core Story Spine progression so optional side-ops don't overwrite main story pointer!
    const isSide = isOptionalSideMission(raw, missionId);
    if (!isSide && nextMissionId) {
      this.blackboard.setCurrentMissionId(nextMissionId);
    }
    if (missionId === 'gb_5' || missionId === 'jp_5' || missionId === 'br_1') {
      this.blackboard.setFlag('diplomatic_cross_clearance', true);
    }

    let unlockedEvidenceClueId: string | null = null;
    if (raw.unlocks_evidence_clue) {
      if (this.blackboard.unlockEvidenceClue(raw.unlocks_evidence_clue)) {
        unlockedEvidenceClueId = raw.unlocks_evidence_clue;
      }
    }

    let unlockedRelicId: HeroRelicId | null = null;
    if (raw.unlock_relic) {
      this.blackboard.unlockRelic(raw.unlock_relic);
      this.passport.unlockRelic(raw.unlock_relic);
      unlockedRelicId = raw.unlock_relic;
    }

    const hubDef = this.hubs.find((h) => h.id === raw.hub_id);
    const split = hubDef ? this.resolveHubMissionSplit(hubDef) : null;
    const completedInHub = split
      ? split.allIds.filter((id) => completed.has(id)).length
      : raw.rhythm_slot;
    const coreCompletedInHub = split
      ? split.coreIds.filter((id) => completed.has(id)).length
      : raw.rhythm_slot;
    const hubCleared =
      (!isSide && raw.rhythm_slot === 5) ||
      (split ? split.coreIds.length > 0 && coreCompletedInHub >= split.coreIds.length : coreCompletedInHub >= 5);

    this.passport.recordMissionCleared(
      raw.hub_id,
      completedInHub,
      hubCleared,
      unlockedRelicId ?? undefined,
      split?.allIds.length
    );

    return {
      nextMissionId,
      unlockedEvidenceClueId,
      unlockedRelicId,
      hubCleared,
    };
  }

  /**
   * Fires Tokyo's Mid-Match Live Signal Jammer (`PITCH_BIBLE.md` §2.4):
   * Slams lighting into Twist Fracture crimson, seals Depth Peel for BOTH players,
   * and shifts queries to lateral deduction!
   */
  public triggerTokyoLiveJammer(): CompiledMatchRules {
    this.blackboard.applyEffects({
      integrity: 14,
      public_trust: 10,
      bond_teo: 1,
      unlock_perk: 'ANALOG_STATIC_MASTER',
      branch_flag: { tokyo_earpiece: 'JAMMED' },
    });
    return this.blackboard.compileMatchRules({
      missionId: 'jp_3',
      hubId: 'jp',
      rawLighting: 'FRACTURE',
      missionMutators: ['ANALOG_STATIC'],
      rivalId: 'soren',
    });
  }

  /**
   * Evaluates a `WHISPERED_INSIDER` covert tip based on Teo/Nadia Bond & Teo's Camera-Flick Tell!
   */
  public generateWhisperedInsiderTip(
    correctFacetIndex: number,
    facetCount: number,
    seedVal = 1
  ): WhisperedInsiderSignal {
    const snap = this.blackboard.getSnapshot();
    const teoScore = snap.bondScores.teo;
    const reliability =
      teoScore >= 2 ? 0.85 : teoScore >= 0 ? 0.55 : 0.25;
    const roll = Math.abs(Math.sin(seedVal * 12.9898) * 43758.5453) % 1;
    const isGenuine = roll < reliability;

    const suggestedFacetIndex = isGenuine
      ? correctFacetIndex
      : (correctFacetIndex + 1 + (Math.abs(seedVal) % Math.max(1, facetCount - 1))) % facetCount;

    const facetLetter = ['A', 'B', 'C', 'D', 'E', 'F'][suggestedFacetIndex] ?? 'A';
    const compromisedCameraTell = !isGenuine;

    return {
      sourceId: 'teo',
      suggestedFacetIndex,
      isGenuine,
      compromisedCameraTell,
      bannerText: compromisedCameraTell
        ? `INSIDER WHISPER: "Check Facet ${facetLetter}..." (Tell: Teo's eyes flicked to the red tally camera — TAPPED LINE!)`
        : `INSIDER WHISPER: "Clean feed—Facet ${facetLetter} matches the archive." (Tell: Teo's eyes stay steady on console.)`,
      voiceUrl: 'assets/voice/teo_whisper.mp3',
    };
  }

  /**
   * Builds a 3-question Redemption Gauntlet ("Second Wind") when a player fails a mission!
   */
  public buildRedemptionGauntlet(
    failedMissionId: string,
    missedDomains: readonly DomainId[]
  ): RedemptionGauntletSpec {
    const uniqueDomains = Array.from(new Set(missedDomains));
    if (uniqueDomains.length === 0) {
      uniqueDomains.push(this.passport.getWeakestDomainId());
    }
    const name = this.passport.getChallengerName();
    return {
      failedMissionId,
      questionCount: 3,
      timePerQuestionSec: 15,
      targetDomains: uniqueDomains,
      archetypes: ['GAUNTLET_SHATTER', 'SIGHTLINE_LOCK', 'SIGHTLINE_LOCK'],
      passThreshold: 2,
      rewardShieldsRestored: 1,
      rewardHeadStartPoints: 400,
      vancePrompt: `Don't yield the stage yet, ${name}. Clear 2 of 3 Redemption Prisms to restore 1 Shield and re-enter with a +400 PTS lead.`,
    };
  }

  /**
   * Returns a Rival reaction cue (`#200` Anti-Annoyance enforced!):
   * - Routine `on_player_miss` / `on_player_streak` NEVER return a VO `.mp3` (`voiceUrl: ''`,
   *   Foley-only!) and draw from `ReactionVarietyBank`'s 396-line 150-history bank.
   * - Dramatic triggers (`on_rival_ahead`, `on_boss_intro`, `on_defeat`) claim their `.mp3`
   *   via `playedBarkUrlsInSession` so NO gameplay bark `.mp3` ever plays more than once per session!
   */
  public getRivalReaction(
    actorId: CastMemberId,
    trigger: RivalReactionTrigger
  ): RivalReactionCue {
    const entry = this.rivalReactions?.[actorId]?.[trigger];
    const expression: CharacterExpression = entry?.expression ?? 'intense';
    const rawVoiceUrl =
      resolveWebAssetPath(entry?.voice_clip) ?? `assets/voice/${actorId}_${trigger}.mp3`;
    const isRoutinePerQuestionBark =
      trigger === 'on_player_miss' || trigger === 'on_player_streak';
    const voiceUrl = isRoutinePerQuestionBark
      ? ''
      : (claimGameplayBarkVoiceUrl(rawVoiceUrl) ?? '');

    const fallbackNames: Record<CastMemberId, string> = {
      vance: 'Julian Vance',
      nadia: 'Nadia Al-Mansoor',
      soren: 'Soren "Echo" Kael',
      teo: 'Mateo "Teo" Rojas',
      lindqvist: 'Chancellor Lindqvist',
      tariq: 'Tariq Al-Mansoor',
    };

    const rawText = isRoutinePerQuestionBark
      ? reactionVarietyBank.pickGuaranteedLine(
          actorId,
          trigger === 'on_player_miss' ? 'MISS' : 'STREAK_3'
        ).text
      : entry?.text ??
        (trigger === 'on_rival_ahead'
          ? 'Your rival holds the lead. Strike back.'
          : trigger === 'on_boss_intro'
            ? 'City Boss Showdown—every lock counts now.'
            : 'Clean victory. The circuit takes notice.');

    return {
      actorId,
      speakerName: fallbackNames[actorId],
      trigger,
      expression,
      portraitUrl: getPortraitUrl(actorId, expression),
      voiceUrl,
      text: this.passport.interpolateText(rawText),
    };
  }

  /**
   * Cooldown-gated & once-per-session Rival VO selector (`#200` Anti-Annoyance):
   * - ALWAYS returns `null` for routine `on_player_miss` / `on_player_streak` (zero nagging VO!).
   * - For dramatic triggers (`on_rival_ahead`, `on_boss_intro`, `on_defeat`), returns `null` if
   *   within cooldown OR if that `.mp3` has already played once in `playedBarkUrlsInSession`.
   */
  public getRivalReactionIfReady(
    actorId: CastMemberId,
    trigger: RivalReactionTrigger,
    nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now(),
    minCooldownMs = 22000
  ): RivalReactionCue | null {
    if (trigger === 'on_player_miss' || trigger === 'on_player_streak') {
      return null;
    }
    if (nowMs - this.lastRivalReactionAtMs < minCooldownMs) {
      return null;
    }
    const entry = this.rivalReactions?.[actorId]?.[trigger];
    const rawVoiceUrl =
      resolveWebAssetPath(entry?.voice_clip) ?? `assets/voice/${actorId}_${trigger}.mp3`;
    if (hasPlayedGameplayBarkInSession(rawVoiceUrl)) {
      return null;
    }
    this.lastRivalReactionAtMs = nowMs;
    return this.getRivalReaction(actorId, trigger);
  }

  /**
   * Convenience bridge to `ReactionVarietyBank` (`396` non-repeating written lines + ~60% routine silence)!
   */
  public pickWrittenReaction(req: ReactionPickRequest): ReactionPickResult | null {
    const res = reactionVarietyBank.pickReaction(req);
    if (!res) return null;
    return {
      ...res,
      text: this.passport.interpolateText(res.text),
    };
  }

  /**
   * Computes the best-fit primary Championship Ending when a balanced run hits no strict threshold (#145).
   */
  public computeBestFitEndingId(): EndingId {
    const snap = this.blackboard.getSnapshot();
    const sovereignScore = snap.councilFavor + Math.max(0, snap.axisIntegrity);
    const commonsScore =
      snap.publicTrust + (snap.act3Branch === 'WHISTLEBLOWER' ? 25 : 0);
    const kingmakerScore =
      55 - snap.axisIntegrity + (snap.branchFlags.trojan_pact === 'SOLO' ? 25 : 0);

    if (commonsScore >= sovereignScore && commonsScore >= kingmakerScore) {
      return 'OPEN_COMMONS';
    }
    if (sovereignScore >= kingmakerScore) {
      return 'SOVEREIGN_ARBITER';
    }
    return 'KINGMAKER';
  }

  /**
   * Returns all 4 Distinct Voiced Endings with live eligibility status (`PITCH_BIBLE.md` §2.3)!
   */
  public getEndingsView(): CampaignEndingView[] {
    const views = this.endings.map((e) => {
      const unlocked = this.blackboard.evaluateCondition(e.requirements);
      const lockedReason = unlocked
        ? undefined
        : e.id === 'SOVEREIGN_ARBITER'
          ? 'Requires Council Favor >= 60 & Integrity >= 10'
          : e.id === 'OPEN_COMMONS'
            ? 'Requires Whistleblower Branch or Public Trust >= 60'
            : e.id === 'KINGMAKER'
              ? 'Requires Ambition (Integrity <= 0) or Solo Trojan Pact'
              : 'Secret Ending: Integrity >= 20, Public Trust >= 55, Allied Nadia/Teo & All 3 Vault Clues';

      return {
        id: e.id,
        number: e.number,
        title: e.title,
        subtitle: e.subtitle,
        isSecret: Boolean(e.is_secret),
        unlocked,
        lockedReason,
        voiceUrl: resolveWebAssetPath(e.voice_clip) ?? `assets/voice/ending_${e.number}.mp3`,
        endingSpeech: this.passport.interpolateText(e.ending_speech),
        endingSpeakerId: e.ending_speaker,
        epilogueBeats: e.epilogue_beats.map((b) => {
          const expr = moodToExpression(b.mood);
          return {
            id: b.id,
            speakerId: b.speaker,
            speakerName: b.speaker_name,
            speakerRole: b.speaker_role,
            expression: expr,
            portraitUrl: getPortraitUrl(b.speaker, expr),
            tellHint: b.tell_hint ? this.passport.interpolateText(b.tell_hint) : undefined,
            text: this.passport.interpolateText(b.text),
            voiceUrl: resolveWebAssetPath(b.voice_clip),
          };
        }),
        permanentUnlocks: {
          titleCrest: e.permanent_unlocks.title_crest,
          skin: e.permanent_unlocks.skin,
          newCircuitPlus: e.permanent_unlocks.new_circuit_plus,
        },
      };
    });

    if (views.length > 0 && views.every((v) => !v.unlocked)) {
      const fallbackId = this.computeBestFitEndingId();
      const target = views.find((v) => v.id === fallbackId) ?? views[0];
      target.unlocked = true;
      target.lockedReason = undefined;
    }

    return views;
  }

  /**
   * Commits one of the 4 Endings, unlocks permanent Title Crest + Prism Skin + Apex Visa!
   */
  public commitEnding(endingId: EndingId): CampaignEndingView | undefined {
    const view = this.getEndingsView().find((e) => e.id === endingId);
    this.blackboard.recordEnding(endingId);
    this.passport.recordMissionCleared('global', 5, true, 'master_ledger');
    if (view) {
      this.blackboard.unlockSkin(view.permanentUnlocks.skin, true);
      this.passport.unlockTitleCrest(view.permanentUnlocks.titleCrest, true);
    }
    return view;
  }

  public startNewCircuitPlus(charterHeatMutators: MutatorId[] = []): void {
    this.clearFailedMissionAttempts();
    this.blackboard.startNewCircuitPlus(charterHeatMutators);
  }

  /**
   * Resets a single City Hub back to its Stage 1 mission (`${hubId}_1`) so the player can replay
   * the current city from Q1 (`#171` "Restart Current City" option)!
   */
  public restartCurrentCityFromStart(hubId: HubId): string {
    const snap = this.blackboard.getSnapshot();
    const prefix = `${hubId}_`;
    const remainingCompleted = snap.completedMissions.filter((id) => !id.startsWith(prefix));
    const firstMissionId = `${hubId}_1`;

    for (const k of Object.keys(this.failedMissionAttempts)) {
      if (k.startsWith(prefix)) {
        delete this.failedMissionAttempts[k];
      }
    }
    this.saveFailedAttempts();

    this.blackboard.hydrateSnapshot({
      ...snap,
      completedMissions: remainingCompleted,
      currentMissionId: firstMissionId,
    });
    return firstMissionId;
  }

  /**
   * Cleanly resets `CampaignCircuitDirector`, `InkBlackboard`, `PassportSystem` campaign visas/persona,
   * `PrologueDirector`, and `Wave2NarrativeDirector` backstage flags back to **Act 0 Geneva Start**
   * while preserving lifetime Career Stats, Career Analytics, & Hall of Honours (`#171`)!
   */
  public restartCampaignFromBeginning(options?: {
    keepChallengerName?: boolean;
    prologue?: PrologueDirector;
    wave2?: Wave2NarrativeDirector;
  }): void {
    const keepName = options?.keepChallengerName ?? true;
    this.clearFailedMissionAttempts();
    this.blackboard.resetAll();
    this.passport.resetCampaignProgress(keepName);
    (options?.prologue ?? this.attachedPrologue)?.startFromBeginning();
    (options?.wave2 ?? this.attachedWave2)?.resetRuntimeState();
  }
}
