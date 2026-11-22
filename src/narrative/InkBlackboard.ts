// ============================================================================
// WORLD'S SMARTEST — Ink Narrative Blackboard & Gameplay Mutation Bridge
// Implements PITCH_BIBLE.md §2.3–2.4 & Research #3 4-Layer Persistent State
// ============================================================================

import {
  getSovereignDomainMeta,
  type DomainId,
  type EndingId,
  type FactionId,
  type HeroRelicId,
  type HubId,
  type OriginId,
  type PerkId,
  type PersonaId,
  type PrismSkinId,
} from './PassportSystem';

export type CastMemberId = 'vance' | 'nadia' | 'soren' | 'teo' | 'lindqvist' | 'tariq';

export type BondLevel = 'NEMESIS' | 'RIVAL' | 'NEUTRAL' | 'ALLIED';

export type Act3BranchId = 'WHISTLEBLOWER' | 'INSIDER';

export type BetrayerId = 'nadia' | 'teo' | 'soren';

export type Stage3DLightingMode =
  | 'BROADCAST'
  | 'TWIST_FRACTURE'
  | 'INTERVIEW'
  | 'GOLD_RESONANCE';

export type MutatorId =
  | 'NONE'
  | 'ANALOG_STATIC'
  | 'TEMPO_STEAL'
  | 'BLUFF_WAGER'
  | 'BLACKOUT_SPOTLIGHT'
  | 'CHRONO_SURGE'
  | 'DOUBLE_OR_NOTHING'
  | 'GRUDGE_WEAKEST_DOMAIN'
  | 'CHAIN_SYNTHESIS'
  | 'WHISPERED_INSIDER'
  | 'ZERO_SHIELD_SUDDEN_DEATH'
  | 'MIRROR_LEAK_ETHICS'
  | 'REDEMPTION_GAUNTLET';

export type NarrativeTag =
  | 'SOVEREIGN_BLOC'
  | 'HORIZON_TECH'
  | 'AGORA_CIVIC'
  | 'MERIDIAN_ZERO'
  | 'BLACK_SALON'
  | 'ESPIONAGE'
  | 'ETHICS'
  | 'HIGH_POWER'
  | 'INVESTIGATIVE'
  | 'LATERAL_DEDUCTION'
  | 'CLASSIFIED_LEDGER'
  | 'HIGH_STAKES_BLUFF'
  | 'ARCHIVE_CORE'
  | 'CURRENT_PULSE'
  | 'RIVAL_PRESSURE'
  | 'FINALE_SYNTHESIS';

export interface PerkCatalogEntry {
  id: PerkId;
  name: string;
  tagline: string;
  effectDescription: string;
  sourceBranch: string;
}

export const PERK_CATALOG: Record<PerkId, PerkCatalogEntry> = {
  DIPLOMATIC_REDACTION: {
    id: 'DIPLOMATIC_REDACTION',
    name: 'Diplomatic Redaction',
    tagline: 'Sovereign Bloc Briefing',
    effectDescription:
      'Auto-shatters 1 high-plausibility decoy facet on Q1 (triggers Nadia Suspicion Audit).',
    sourceBranch: 'London · Accepted Chancellor Lindqvist’s Sealed Briefing',
  },
  CLEAN_HANDS: {
    id: 'CLEAN_HANDS',
    name: 'Clean Hands',
    tagline: 'Unassisted Purist',
    effectDescription:
      '+25% Cold Instinct bonus on unassisted Tier-1 locks + unlocks London Black Salon.',
    sourceBranch: 'London · Burned Lindqvist’s Briefing Unopened',
  },
  HORIZON_LENS: {
    id: 'HORIZON_LENS',
    name: 'Horizon Probability Lens',
    tagline: 'Telemetry Stress-Scan',
    effectDescription:
      'Hairline crystal stress-fractures subtly mark the weakest distractor at Tier 1.',
    sourceBranch: 'Tokyo · Blackmailed Soren for Horizon Telemetry',
  },
  ANALOG_STATIC_MASTER: {
    id: 'ANALOG_STATIC_MASTER',
    name: 'Analog Instinct',
    tagline: 'Off-Grid Clarity',
    effectDescription:
      '+3.0s Chrono-Ring time, +25% Static score bonus, and immunity to Rival Tempo Steal.',
    sourceBranch: 'Tokyo · Fired the Mid-Match Live Signal Jammer',
  },
  DIPLOMAT_COMPOSURE: {
    id: 'DIPLOMAT_COMPOSURE',
    name: "Diplomat's Composure",
    tagline: 'Measured Poise',
    effectDescription:
      '+2.0s Chrono-Ring time and blocks Rival Tempo Steal clock drain.',
    sourceBranch: 'Geneva · Stamped in The Vetting Chamber',
  },
  MAVERICK_GAMBIT: {
    id: 'MAVERICK_GAMBIT',
    name: "Maverick's Gambit",
    tagline: 'High-Wire Conviction',
    effectDescription:
      'Hold-to-Overclock charges 30% faster and reaches +125% peak multiplier.',
    sourceBranch: 'Geneva · Stamped in The Vetting Chamber',
  },
  COOP_CROSSCHECK: {
    id: 'COOP_CROSSCHECK',
    name: 'Co-Op Cross-Check',
    tagline: 'Allied Nadia Acoustic Signal',
    effectDescription:
      '1x free Tier-2 Peel per match without dropping your 3.0x Cold Instinct multiplier!',
    sourceBranch: 'Rio · Sacrificed 1 Prism Shield to Save Nadia',
  },
  PEOPLES_LENS: {
    id: 'PEOPLES_LENS',
    name: "People's Lens",
    tagline: 'Whistleblower Global Heatmap',
    effectDescription:
      'Simulated live global broadcast heatmap highlights crowd consensus across Prism facets.',
    sourceBranch: 'Cairo · Broadcast the Meridian Zero Dossier Live',
  },
  COUNCIL_OVERRIDE: {
    id: 'COUNCIL_OVERRIDE',
    name: 'Council Override',
    tagline: 'Insider Domain Veto',
    effectDescription:
      '1x Domain Veto re-roll per match + 20% bonus on History, Arts, Law & Myth.',
    sourceBranch: 'Cairo · Pocketed the Dossier for the Insider Gambit',
  },
  BLUFF_ECHO: {
    id: 'BLUFF_ECHO',
    name: 'Bluff Echo',
    tagline: 'Reykjavik Conclave Feint',
    effectDescription:
      'Flick-canceling an Overclock baits rivals into panicked early mis-locks and grants +1.5s.',
    sourceBranch: 'Reykjavik · Mastered Bluff Overclock Duels',
  },
};

export interface BondShiftToast {
  npcId: CastMemberId;
  npcName: string;
  previousTier: BondLevel;
  newTier: BondLevel;
  numericScore: number;
  message: string;
}

export interface InkBlackboardSnapshot {
  prologueComplete: boolean;
  origin: OriginId | null;
  persona: PersonaId | null;
  axisIntegrity: number; // -100 (Ruthless Ambition) .. +100 (Uncompromising Integrity)
  publicTrust: number; // 0..100
  councilFavor: number; // 0..100
  bondScores: Record<CastMemberId, number>; // -5..+8 raw score
  bondTiers: Record<CastMemberId, BondLevel>;
  branchFlags: Record<string, string | boolean | number>;
  vaultClues: string[]; // up to 3 secret vault clues
  unlockedEvidenceClues: string[]; // clue_01 .. clue_12
  unlockedPerks: PerkId[];
  activePerks: PerkId[]; // up to 3 active perks
  unlockedRelics: HeroRelicId[];
  unlockedSkins: PrismSkinId[];
  activeSkin: PrismSkinId;
  completedMissions: string[]; // ch_1 .. global_5
  currentMissionId: string;
  firstFlight: 'GB' | 'JP' | null;
  act3Branch: Act3BranchId | null;
  singaporeBetrayer: BetrayerId | null;
  achievedEndings: EndingId[];
  blackSalonUnlocked: boolean;
  pledgedFaction: FactionId | null;
  newCircuitPlusCount: number;
  charterHeatMutators: MutatorId[];
  spentStorylets: string[];
}

export interface RawCampaignCondition {
  min_integrity?: number;
  max_integrity?: number;
  min_public_trust?: number;
  max_public_trust?: number;
  min_council_favor?: number;
  max_council_favor?: number;
  min_vault_clues?: number;
  flag_equals?: Record<string, string | boolean | number>;
  min_any_bond?: {
    npcs: CastMemberId[];
    threshold: number;
  };
  any?: RawCampaignCondition[];
  all?: RawCampaignCondition[];
}

export interface RawChoiceEffects {
  integrity?: number;
  public_trust?: number;
  council_favor?: number;
  bond_nadia?: number;
  bond_teo?: number;
  bond_lindqvist?: number;
  bond_soren?: number;
  bond_tariq?: number;
  bond_vance?: number;
  unlock_perk?: PerkId;
  unlock_relic?: HeroRelicId;
  unlock_skin?: PrismSkinId;
  vault_clue?: string;
  evidence_clue?: string;
  black_salon_unlocked?: boolean;
  ending_id?: EndingId;
  branch_flag?: Record<string, string | boolean | number>;
}

export interface EffectApplicationReport {
  integrityDelta: number;
  publicTrustDelta: number;
  councilFavorDelta: number;
  bondShifts: BondShiftToast[];
  unlockedPerk?: PerkCatalogEntry;
  unlockedRelic?: HeroRelicId;
  unlockedSkin?: PrismSkinId;
  unlockedVaultClue?: string;
  unlockedEvidenceClue?: string;
  blackSalonNewlyUnlocked: boolean;
}

export interface CompiledMatchRules {
  missionId: string;
  hubId: HubId;
  stageLightingMode: Stage3DLightingMode;
  activeMutators: MutatorId[];
  startingShields: number;
  maxShields: number;
  startingPlayerScoreBonus: number;
  chronoBonusSec: number;
  peelLockedBothPlayers: boolean;
  peelLockReason: string | null;
  // London branch consequences
  autoShatterDecoyOnQ1: boolean;
  canManualRedaction: boolean;
  tier1ColdInstinctMultiplier: number; // 1.0 baseline, 1.25 with Clean Hands
  nadiaSuspicionTempoSteal: boolean;
  // Tokyo branch consequences
  markWeakDistractorFracture: boolean; // Horizon Probability Lens
  liveJammerActive: boolean;
  queryBoostTags: NarrativeTag[];
  preferCrypticLateral: boolean;
  // Rio branch consequences
  freeCoopPeelCount: number; // Allied Nadia Co-Op Cross-Check (1x free Tier-2 Peel/match)
  nemesisWeakestDomainActive: boolean;
  nemesisTargetDomainId: DomainId | null;
  nemesisTargetDomainName: string | null;
  nemesisTauntBanner: string | null;
  // Cairo & Reykjavik branch consequences
  peoplesLensHeatmapActive: boolean; // Whistleblower simulated crowd heatmap
  councilDomainVetoCount: number; // Insider Gambit 1x domain veto
  sovereignDomainBonusMultiplier: number; // 1.20 on History/Arts/Law/Myth
  bluffEchoEnabled: boolean;
  bluffOverclockDuels: boolean;
  tempoStealImmune: boolean;
  overclockChargeSpeedMultiplier: number; // 1.3x with Maverick's Gambit
  overclockPeakBonusScale: number; // 1.25x with Maverick's Gambit
}

const BLACKBOARD_STORAGE_KEY = 'ws_ink_blackboard_v2';
const MAX_EQUIPPED_PERKS = 3;

const NPC_DISPLAY_NAMES: Record<CastMemberId, string> = {
  vance: 'Julian Vance',
  nadia: 'Nadia Al-Mansoor',
  soren: 'Soren "Echo" Kael',
  teo: 'Mateo "Teo" Rojas',
  lindqvist: 'Chancellor Lindqvist',
  tariq: 'Tariq Al-Mansoor',
};

const RIVAL_NPCS: ReadonlySet<CastMemberId> = new Set(['nadia', 'soren']);

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

export function scoreToBondTier(npc: CastMemberId, score: number): BondLevel {
  if (score <= -2) return 'NEMESIS';
  if (score >= 2) return 'ALLIED';
  if (RIVAL_NPCS.has(npc)) {
    return score <= 0 ? 'RIVAL' : 'NEUTRAL';
  }
  return score < 0 ? 'RIVAL' : 'NEUTRAL';
}

export function mapRawLightingToStage3D(rawLighting?: string): Stage3DLightingMode {
  switch ((rawLighting ?? '').toUpperCase()) {
    case 'FRACTURE':
    case 'TWIST_FRACTURE':
      return 'TWIST_FRACTURE';
    case 'INTIMATE':
    case 'INTERVIEW':
    case 'ARCHIVE':
      return 'INTERVIEW';
    case 'GOLD_RESONANCE':
    case 'STREAK':
      return 'GOLD_RESONANCE';
    case 'BROADCAST':
    default:
      return 'BROADCAST';
  }
}

function createDefaultBlackboard(): InkBlackboardSnapshot {
  const bondScores: Record<CastMemberId, number> = {
    vance: 1,
    nadia: 0,
    soren: 0,
    teo: 0,
    lindqvist: 0,
    tariq: 0,
  };
  const bondTiers = {} as Record<CastMemberId, BondLevel>;
  for (const k of Object.keys(bondScores) as CastMemberId[]) {
    bondTiers[k] = scoreToBondTier(k, bondScores[k]);
  }
  return {
    prologueComplete: false,
    origin: null,
    persona: null,
    axisIntegrity: 0,
    publicTrust: 50,
    councilFavor: 50,
    bondScores,
    bondTiers,
    branchFlags: {},
    vaultClues: [],
    unlockedEvidenceClues: [],
    unlockedPerks: [],
    activePerks: [],
    unlockedRelics: [],
    unlockedSkins: ['OBSIDIAN_BRASS'],
    activeSkin: 'OBSIDIAN_BRASS',
    completedMissions: [],
    currentMissionId: 'ch_1',
    firstFlight: null,
    act3Branch: null,
    singaporeBetrayer: null,
    achievedEndings: [],
    blackSalonUnlocked: false,
    pledgedFaction: null,
    newCircuitPlusCount: 0,
    charterHeatMutators: [],
    spentStorylets: [],
  };
}

export class InkBlackboard {
  private state: InkBlackboardSnapshot;
  private readonly listeners = new Set<(snap: InkBlackboardSnapshot) => void>();

  constructor() {
    this.state = this.load();
  }

  private parseSnapshotObject(
    parsed: Partial<InkBlackboardSnapshot> | null | undefined
  ): InkBlackboardSnapshot {
    const defaults = createDefaultBlackboard();
    if (!parsed || typeof parsed !== 'object') return defaults;

    const bondScores: Record<CastMemberId, number> = { ...defaults.bondScores };
    if (parsed.bondScores && typeof parsed.bondScores === 'object') {
      for (const npc of Object.keys(bondScores) as CastMemberId[]) {
        const val = Number((parsed.bondScores as Record<string, unknown>)[npc]);
        if (Number.isFinite(val)) {
          bondScores[npc] = clamp(Math.round(val), -5, 8);
        }
      }
    }
    const bondTiers = {} as Record<CastMemberId, BondLevel>;
    for (const npc of Object.keys(bondScores) as CastMemberId[]) {
      bondTiers[npc] = scoreToBondTier(npc, bondScores[npc]);
    }

    const branchFlags: Record<string, string | boolean | number> = {};
    if (parsed.branchFlags && typeof parsed.branchFlags === 'object') {
      for (const [k, v] of Object.entries(parsed.branchFlags)) {
        if (typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number') {
          branchFlags[k] = v;
        }
      }
    }

    const unlockedPerks = Array.isArray(parsed.unlockedPerks)
      ? Array.from(
          new Set(
            parsed.unlockedPerks.filter(
              (p): p is PerkId => typeof p === 'string' && p in PERK_CATALOG
            )
          )
        )
      : [];

    const activePerks = Array.isArray(parsed.activePerks)
      ? Array.from(
          new Set(
            parsed.activePerks.filter(
              (p): p is PerkId =>
                typeof p === 'string' && p in PERK_CATALOG && unlockedPerks.includes(p as PerkId)
            )
          )
        ).slice(0, MAX_EQUIPPED_PERKS)
      : [];

    return {
      prologueComplete: Boolean(parsed.prologueComplete),
      origin:
        parsed.origin === 'ACADEMIC' ||
        parsed.origin === 'POLYMATH' ||
        parsed.origin === 'STRATEGIST'
          ? parsed.origin
          : null,
      persona:
        parsed.persona === 'MAVERICK' ||
        parsed.persona === 'DIPLOMAT' ||
        parsed.persona === 'ANALYST' ||
        parsed.persona === 'PRODIGY'
          ? parsed.persona
          : null,
      axisIntegrity: clamp(Math.round(Number(parsed.axisIntegrity) || 0), -100, 100),
      publicTrust: clamp(
        Math.round(parsed.publicTrust !== undefined ? Number(parsed.publicTrust) : 50),
        0,
        100
      ),
      councilFavor: clamp(
        Math.round(parsed.councilFavor !== undefined ? Number(parsed.councilFavor) : 50),
        0,
        100
      ),
      bondScores,
      bondTiers,
      branchFlags,
      vaultClues: Array.isArray(parsed.vaultClues)
        ? Array.from(new Set(parsed.vaultClues.filter((c): c is string => typeof c === 'string')))
        : [],
      unlockedEvidenceClues: Array.isArray(parsed.unlockedEvidenceClues)
        ? Array.from(
            new Set(
              parsed.unlockedEvidenceClues.filter((c): c is string => typeof c === 'string')
            )
          )
        : [],
      unlockedPerks,
      activePerks,
      unlockedRelics: Array.isArray(parsed.unlockedRelics)
        ? Array.from(new Set(parsed.unlockedRelics))
        : [],
      unlockedSkins: Array.isArray(parsed.unlockedSkins)
        ? Array.from(new Set<PrismSkinId>(['OBSIDIAN_BRASS', ...parsed.unlockedSkins]))
        : ['OBSIDIAN_BRASS'],
      activeSkin: parsed.activeSkin ?? 'OBSIDIAN_BRASS',
      completedMissions: Array.isArray(parsed.completedMissions)
        ? Array.from(
            new Set(parsed.completedMissions.filter((m): m is string => typeof m === 'string'))
          )
        : [],
      currentMissionId:
        typeof parsed.currentMissionId === 'string' && parsed.currentMissionId.length > 0
          ? parsed.currentMissionId
          : 'ch_1',
      firstFlight:
        parsed.firstFlight === 'GB' || parsed.firstFlight === 'JP' ? parsed.firstFlight : null,
      act3Branch:
        parsed.act3Branch === 'WHISTLEBLOWER' || parsed.act3Branch === 'INSIDER'
          ? parsed.act3Branch
          : null,
      singaporeBetrayer:
        parsed.singaporeBetrayer === 'nadia' ||
        parsed.singaporeBetrayer === 'teo' ||
        parsed.singaporeBetrayer === 'soren'
          ? parsed.singaporeBetrayer
          : null,
      achievedEndings: Array.isArray(parsed.achievedEndings)
        ? Array.from(new Set(parsed.achievedEndings))
        : [],
      blackSalonUnlocked: Boolean(parsed.blackSalonUnlocked),
      pledgedFaction:
        parsed.pledgedFaction === 'SOVEREIGN' ||
        parsed.pledgedFaction === 'HORIZON' ||
        parsed.pledgedFaction === 'AGORA'
          ? parsed.pledgedFaction
          : null,
      newCircuitPlusCount: Math.max(0, Math.floor(Number(parsed.newCircuitPlusCount) || 0)),
      charterHeatMutators: Array.isArray(parsed.charterHeatMutators)
        ? parsed.charterHeatMutators
        : [],
      spentStorylets: Array.isArray(parsed.spentStorylets)
        ? parsed.spentStorylets.slice(-250)
        : [],
    };
  }

  private load(): InkBlackboardSnapshot {
    const defaults = createDefaultBlackboard();
    try {
      if (typeof localStorage === 'undefined') return defaults;
      const raw = localStorage.getItem(BLACKBOARD_STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<InkBlackboardSnapshot> | null;
      return this.parseSnapshotObject(parsed);
    } catch {
      return defaults;
    }
  }

  private save(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(BLACKBOARD_STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch {
      // Ignore storage quota issues
    }
    const snap = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snap);
    }
  }

  public subscribe(listener: (snap: InkBlackboardSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSnapshot(): InkBlackboardSnapshot {
    return {
      ...this.state,
      bondScores: { ...this.state.bondScores },
      bondTiers: { ...this.state.bondTiers },
      branchFlags: { ...this.state.branchFlags },
      vaultClues: [...this.state.vaultClues],
      unlockedEvidenceClues: [...this.state.unlockedEvidenceClues],
      unlockedPerks: [...this.state.unlockedPerks],
      activePerks: [...this.state.activePerks],
      unlockedRelics: [...this.state.unlockedRelics],
      unlockedSkins: [...this.state.unlockedSkins],
      completedMissions: [...this.state.completedMissions],
      achievedEndings: [...this.state.achievedEndings],
      charterHeatMutators: [...this.state.charterHeatMutators],
      spentStorylets: [...this.state.spentStorylets],
    };
  }

  public setFlag(key: string, value: string | boolean | number): void {
    this.state.branchFlags[key] = value;
    if (key === 'first_flight' && (value === 'GB' || value === 'JP')) {
      this.state.firstFlight = value;
    }
    if (key === 'act3_branch' && (value === 'WHISTLEBLOWER' || value === 'INSIDER')) {
      this.state.act3Branch = value;
    }
    if (key === 'london_briefing' && value === 'BURNED') {
      this.state.blackSalonUnlocked = true;
    }
    if (key === 'act3_branch' && value === 'WHISTLEBLOWER') {
      this.state.blackSalonUnlocked = true;
    }
    if (key === 'origin' && (value === 'ACADEMIC' || value === 'POLYMATH' || value === 'STRATEGIST')) {
      this.state.origin = value;
    }
    this.save();
  }

  public getFlag(key: string): string | boolean | number | undefined {
    return this.state.branchFlags[key];
  }

  public adjustAxes(deltas: {
    integrity?: number;
    publicTrust?: number;
    councilFavor?: number;
  }): void {
    if (deltas.integrity) {
      this.state.axisIntegrity = clamp(
        this.state.axisIntegrity + Math.round(deltas.integrity),
        -100,
        100
      );
    }
    if (deltas.publicTrust) {
      this.state.publicTrust = clamp(
        this.state.publicTrust + Math.round(deltas.publicTrust),
        0,
        100
      );
    }
    if (deltas.councilFavor) {
      this.state.councilFavor = clamp(
        this.state.councilFavor + Math.round(deltas.councilFavor),
        0,
        100
      );
    }
    this.save();
  }

  public adjustBond(npc: CastMemberId, delta: number): BondShiftToast | null {
    const prevTier = this.state.bondTiers[npc];
    const nextScore = clamp(this.state.bondScores[npc] + Math.round(delta), -5, 8);
    const nextTier = scoreToBondTier(npc, nextScore);
    this.state.bondScores[npc] = nextScore;
    this.state.bondTiers[npc] = nextTier;
    this.save();

    if (prevTier !== nextTier) {
      return {
        npcId: npc,
        npcName: NPC_DISPLAY_NAMES[npc],
        previousTier: prevTier,
        newTier: nextTier,
        numericScore: nextScore,
        message: `${NPC_DISPLAY_NAMES[npc]} Bond shifted: ${prevTier} → ${nextTier}`,
      };
    }
    return null;
  }

  public unlockPerk(perkId: PerkId, autoEquip = true): PerkCatalogEntry {
    if (!this.state.unlockedPerks.includes(perkId)) {
      this.state.unlockedPerks.push(perkId);
    }
    if (autoEquip && !this.state.activePerks.includes(perkId)) {
      if (this.state.activePerks.length < MAX_EQUIPPED_PERKS) {
        this.state.activePerks.push(perkId);
      } else {
        this.state.activePerks = [...this.state.activePerks.slice(1), perkId];
      }
    }
    this.save();
    return PERK_CATALOG[perkId];
  }

  public toggleActivePerk(perkId: PerkId): { equipped: boolean; activePerks: PerkId[] } {
    if (!this.state.unlockedPerks.includes(perkId)) {
      return { equipped: false, activePerks: [...this.state.activePerks] };
    }
    const idx = this.state.activePerks.indexOf(perkId);
    if (idx >= 0) {
      this.state.activePerks.splice(idx, 1);
      this.save();
      return { equipped: false, activePerks: [...this.state.activePerks] };
    }
    if (this.state.activePerks.length >= MAX_EQUIPPED_PERKS) {
      this.state.activePerks.shift();
    }
    this.state.activePerks.push(perkId);
    this.save();
    return { equipped: true, activePerks: [...this.state.activePerks] };
  }

  public hasPerk(perkId: PerkId): boolean {
    return (
      this.state.activePerks.includes(perkId) || this.state.unlockedPerks.includes(perkId)
    );
  }

  public unlockEvidenceClue(clueId: string): boolean {
    if (!clueId || this.state.unlockedEvidenceClues.includes(clueId)) return false;
    this.state.unlockedEvidenceClues.push(clueId);
    this.save();
    return true;
  }

  public unlockVaultClue(vaultClueId: string): boolean {
    if (!vaultClueId || this.state.vaultClues.includes(vaultClueId)) return false;
    this.state.vaultClues.push(vaultClueId);
    this.save();
    return true;
  }

  public unlockRelic(relicId: HeroRelicId): boolean {
    if (this.state.unlockedRelics.includes(relicId)) return false;
    this.state.unlockedRelics.push(relicId);
    this.save();
    return true;
  }

  public unlockSkin(skinId: PrismSkinId, autoEquip = false): boolean {
    let added = false;
    if (!this.state.unlockedSkins.includes(skinId)) {
      this.state.unlockedSkins.push(skinId);
      added = true;
    }
    if (autoEquip) {
      this.state.activeSkin = skinId;
    }
    this.save();
    return added;
  }

  public setActiveSkin(skinId: PrismSkinId): boolean {
    if (!this.state.unlockedSkins.includes(skinId)) return false;
    this.state.activeSkin = skinId;
    this.save();
    return true;
  }

  public setPledgedFaction(faction: FactionId): void {
    this.state.pledgedFaction = faction;
    this.save();
  }

  public markMissionCompleted(missionId: string, nextMissionId?: string | null): void {
    if (!this.state.completedMissions.includes(missionId)) {
      this.state.completedMissions.push(missionId);
    }
    if (missionId === 'ch_4' || missionId === 'ch_5') {
      this.state.prologueComplete = true;
    }
    if (nextMissionId) {
      this.state.currentMissionId = nextMissionId;
    }
    this.save();
  }

  public setCurrentMissionId(missionId: string): void {
    this.state.currentMissionId = missionId;
    this.save();
  }

  public setPrologueComplete(origin: OriginId, persona: PersonaId): void {
    this.state.prologueComplete = true;
    this.state.origin = origin;
    this.state.persona = persona;
    this.save();
  }

  public recordEnding(endingId: EndingId): void {
    if (!this.state.achievedEndings.includes(endingId)) {
      this.state.achievedEndings.push(endingId);
    }
    this.save();
  }

  public markStoryletSpent(storyletId: string): void {
    if (!this.state.spentStorylets.includes(storyletId)) {
      this.state.spentStorylets.push(storyletId);
      this.save();
    }
  }

  /**
   * Evaluates any condition tree from `campaign_20hr.json` (`requires`, `endings`, `dynamic_betrayal_resolver`).
   */
  public evaluateCondition(cond?: RawCampaignCondition | null): boolean {
    if (!cond) return true;

    if (Array.isArray(cond.all) && cond.all.length > 0) {
      if (!cond.all.every((sub) => this.evaluateCondition(sub))) return false;
    }
    if (Array.isArray(cond.any) && cond.any.length > 0) {
      if (!cond.any.some((sub) => this.evaluateCondition(sub))) return false;
    }

    if (cond.min_integrity !== undefined && this.state.axisIntegrity < cond.min_integrity) {
      return false;
    }
    if (cond.max_integrity !== undefined && this.state.axisIntegrity > cond.max_integrity) {
      return false;
    }
    if (cond.min_public_trust !== undefined && this.state.publicTrust < cond.min_public_trust) {
      return false;
    }
    if (cond.max_public_trust !== undefined && this.state.publicTrust > cond.max_public_trust) {
      return false;
    }
    if (cond.min_council_favor !== undefined && this.state.councilFavor < cond.min_council_favor) {
      return false;
    }
    if (cond.max_council_favor !== undefined && this.state.councilFavor > cond.max_council_favor) {
      return false;
    }
    if (cond.min_vault_clues !== undefined && this.state.vaultClues.length < cond.min_vault_clues) {
      return false;
    }

    if (cond.flag_equals && typeof cond.flag_equals === 'object') {
      for (const [k, expected] of Object.entries(cond.flag_equals)) {
        const actual =
          this.state.branchFlags[k] ??
          (k === 'act3_branch' ? this.state.act3Branch : undefined) ??
          (k === 'first_flight' ? this.state.firstFlight : undefined) ??
          (k === 'origin' ? this.state.origin : undefined);
        if (actual !== expected) return false;
      }
    }

    if (cond.min_any_bond) {
      const { npcs, threshold } = cond.min_any_bond;
      const hit = npcs.some((npc) => (this.state.bondScores[npc] ?? 0) >= threshold);
      if (!hit) return false;
    }

    return true;
  }

  /**
   * Applies choice effects from `campaign_20hr.json` or Prologue ethical interrupts atomically.
   */
  public applyEffects(effects?: RawChoiceEffects | null): EffectApplicationReport {
    const report: EffectApplicationReport = {
      integrityDelta: 0,
      publicTrustDelta: 0,
      councilFavorDelta: 0,
      bondShifts: [],
      blackSalonNewlyUnlocked: false,
    };
    if (!effects) return report;

    if (effects.integrity) {
      report.integrityDelta = Math.round(effects.integrity);
      this.state.axisIntegrity = clamp(
        this.state.axisIntegrity + report.integrityDelta,
        -100,
        100
      );
    }
    if (effects.public_trust) {
      report.publicTrustDelta = Math.round(effects.public_trust);
      this.state.publicTrust = clamp(
        this.state.publicTrust + report.publicTrustDelta,
        0,
        100
      );
    }
    if (effects.council_favor) {
      report.councilFavorDelta = Math.round(effects.council_favor);
      this.state.councilFavor = clamp(
        this.state.councilFavor + report.councilFavorDelta,
        0,
        100
      );
    }

    const bondMap: Array<[CastMemberId, number | undefined]> = [
      ['nadia', effects.bond_nadia],
      ['teo', effects.bond_teo],
      ['lindqvist', effects.bond_lindqvist],
      ['soren', effects.bond_soren],
      ['tariq', effects.bond_tariq],
      ['vance', effects.bond_vance],
    ];

    for (const [npc, delta] of bondMap) {
      if (delta) {
        const prevTier = this.state.bondTiers[npc];
        const nextScore = clamp(this.state.bondScores[npc] + Math.round(delta), -5, 8);
        const nextTier = scoreToBondTier(npc, nextScore);
        this.state.bondScores[npc] = nextScore;
        this.state.bondTiers[npc] = nextTier;
        if (prevTier !== nextTier) {
          report.bondShifts.push({
            npcId: npc,
            npcName: NPC_DISPLAY_NAMES[npc],
            previousTier: prevTier,
            newTier: nextTier,
            numericScore: nextScore,
            message: `${NPC_DISPLAY_NAMES[npc]} Bond: ${prevTier} → ${nextTier}`,
          });
        }
      }
    }

    if (effects.branch_flag && typeof effects.branch_flag === 'object') {
      for (const [k, v] of Object.entries(effects.branch_flag)) {
        this.state.branchFlags[k] = v;
        if (k === 'origin' && (v === 'ACADEMIC' || v === 'POLYMATH' || v === 'STRATEGIST')) {
          this.state.origin = v;
        }
        if (k === 'first_flight' && (v === 'GB' || v === 'JP')) {
          this.state.firstFlight = v;
        }
        if (k === 'act3_branch' && (v === 'WHISTLEBLOWER' || v === 'INSIDER')) {
          this.state.act3Branch = v;
          if (v === 'WHISTLEBLOWER' && !this.state.blackSalonUnlocked) {
            this.state.blackSalonUnlocked = true;
            report.blackSalonNewlyUnlocked = true;
          }
        }
        if (k === 'london_briefing' && v === 'BURNED' && !this.state.blackSalonUnlocked) {
          this.state.blackSalonUnlocked = true;
          report.blackSalonNewlyUnlocked = true;
        }
      }
    }

    if (effects.black_salon_unlocked && !this.state.blackSalonUnlocked) {
      this.state.blackSalonUnlocked = true;
      report.blackSalonNewlyUnlocked = true;
    }

    if (effects.unlock_perk && effects.unlock_perk in PERK_CATALOG) {
      report.unlockedPerk = this.unlockPerk(effects.unlock_perk, true);
    }

    if (effects.unlock_relic) {
      this.unlockRelic(effects.unlock_relic);
      report.unlockedRelic = effects.unlock_relic;
    }

    if (effects.unlock_skin) {
      this.unlockSkin(effects.unlock_skin, true);
      report.unlockedSkin = effects.unlock_skin;
    }

    if (effects.vault_clue) {
      if (this.unlockVaultClue(effects.vault_clue)) {
        report.unlockedVaultClue = effects.vault_clue;
      }
    }

    if (effects.evidence_clue) {
      if (this.unlockEvidenceClue(effects.evidence_clue)) {
        report.unlockedEvidenceClue = effects.evidence_clue;
      }
    }

    if (effects.ending_id) {
      this.recordEnding(effects.ending_id);
    }

    this.save();
    return report;
  }

  /**
   * Computes the Singapore Dynamic Inner-Circle Betrayer (`sg_3` — PITCH_BIBLE.md §2.3):
   * - Low Nadia bond / Claimed Rio #1 Seed -> Nadia trades your seat for Tariq's amnesty
   * - Low Integrity (<= -15) -> Teo leaks your backstage deals live to the crowd
   * - Otherwise (Low Council Favor / Article IX) -> Lindqvist frames you & crowns Soren Interim Arbiter
   */
  public resolveSingaporeBetrayer(): {
    betrayerId: BetrayerId;
    title: string;
    signatureMutator: MutatorId;
    summary: string;
  } {
    let result: {
      betrayerId: BetrayerId;
      title: string;
      signatureMutator: MutatorId;
      summary: string;
    };

    if (
      this.state.branchFlags.rio_sabotage === 'CLAIMED_SEED' ||
      this.state.bondTiers.nadia === 'NEMESIS' ||
      this.state.bondScores.nadia <= -2
    ) {
      result = {
        betrayerId: 'nadia',
        title: "Nadia's Ransom Deal",
        signatureMutator: 'GRUDGE_WEAKEST_DOMAIN',
        summary:
          "Because you abandoned Nadia's sabotaged pod in Rio, she trades your seat for Tariq's pardon—and counter-picks your weakest trivia domain.",
      };
    } else if (this.state.axisIntegrity <= -15 || this.state.bondScores.teo <= -2) {
      result = {
        betrayerId: 'teo',
        title: "Teo's Live Exposé",
        signatureMutator: 'WHISPERED_INSIDER',
        summary:
          'Your backroom compromises pushed Integrity below the breaking point—Teo broadcasts your covert recordings live to two billion viewers.',
      };
    } else {
      result = {
        betrayerId: 'soren',
        title: 'Article IX Coup — Interim Arbiter Soren',
        signatureMutator: 'TEMPO_STEAL',
        summary:
          'With Nadia and Teo standing loyal beside you, Chancellor Lindqvist invokes Emergency Article IX to freeze your seat and crown Soren Interim Arbiter.',
      };
    }

    this.state.singaporeBetrayer = result.betrayerId;
    this.save();
    return result;
  }

  /**
   * Compiles ALL real gameplay-altering branch rules from PITCH_BIBLE.md §2.3–2.4 for a mission!
   */
  public compileMatchRules(params: {
    missionId: string;
    hubId: HubId;
    rawLighting?: string;
    missionMutators?: readonly string[];
    rivalId?: string | null;
    weakestDomainId?: DomainId;
  }): CompiledMatchRules {
    const { missionId, hubId, rawLighting, missionMutators = [], rivalId, weakestDomainId = 10 } =
      params;

    const mutators = new Set<MutatorId>();
    for (const m of missionMutators) {
      if (m && m !== 'NONE') {
        mutators.add(m as MutatorId);
      }
    }
    for (const heatMut of this.state.charterHeatMutators) {
      mutators.add(heatMut);
    }

    let stageLightingMode = mapRawLightingToStage3D(rawLighting);
    let startingShields = 3;
    const maxShields = 3;
    let startingPlayerScoreBonus = 0;

    // 1. LONDON BRANCH: Accept vs Burn Lindqvist's Briefing
    const londonBriefing = this.state.branchFlags.london_briefing;
    const hasRedaction =
      londonBriefing === 'ACCEPTED' || this.hasPerk('DIPLOMATIC_REDACTION');
    const hasCleanHands =
      londonBriefing === 'BURNED' || this.hasPerk('CLEAN_HANDS');
    const nadiaSuspicionTempoSteal =
      londonBriefing === 'ACCEPTED' &&
      rivalId === 'nadia' &&
      (hubId === 'gb' || hubId === 'br');
    if (nadiaSuspicionTempoSteal) {
      mutators.add('TEMPO_STEAL');
    }

    // 2. TOKYO BRANCH: Blackmail Soren vs Fire Live Jammer
    const tokyoEarpiece = this.state.branchFlags.tokyo_earpiece;
    const markWeakDistractorFracture =
      tokyoEarpiece === 'BLACKMAILED' || this.hasPerk('HORIZON_LENS');
    const tokyoJammerTriggered =
      tokyoEarpiece === 'JAMMED' &&
      hubId === 'jp' &&
      (missionId === 'jp_3' || missionId === 'jp_4');
    if (tokyoJammerTriggered) {
      mutators.add('ANALOG_STATIC');
      stageLightingMode = 'TWIST_FRACTURE';
    }

    // 3. RIO BRANCH: Sacrifice 1 Prism Shield to Save Nadia vs Claim #1 Seed
    const rioSabotage = this.state.branchFlags.rio_sabotage;
    if (rioSabotage === 'SAVED_NADIA' && missionId === 'br_5') {
      startingShields = 2; // Immediate tactical sacrifice in Rio Boss Showdown!
    } else if (rioSabotage === 'CLAIMED_SEED' && missionId === 'br_5') {
      startingPlayerScoreBonus = 500; // #1 Seed point lead, but Nadia becomes Nemesis!
    }

    const freeCoopPeelCount =
      rioSabotage === 'SAVED_NADIA' ||
      this.state.bondTiers.nadia === 'ALLIED' ||
      this.hasPerk('COOP_CROSSCHECK')
        ? 1
        : 0;

    const nemesisNadiaActive =
      (rioSabotage === 'CLAIMED_SEED' || this.state.bondTiers.nadia === 'NEMESIS') &&
      (rivalId === 'nadia' || missionId === 'br_5' || missionId === 'sg_3');

    if (nemesisNadiaActive) {
      mutators.add('GRUDGE_WEAKEST_DOMAIN');
    }

    // 4. CAIRO & REYKJAVIK BRANCH: Whistleblower Broadcast vs Insider Gambit
    const act3Branch = this.state.act3Branch;
    const peoplesLensHeatmapActive =
      act3Branch === 'WHISTLEBLOWER' || this.hasPerk('PEOPLES_LENS');
    const councilOverrideActive =
      act3Branch === 'INSIDER' || this.hasPerk('COUNCIL_OVERRIDE');

    if (missionId === 'is_1') {
      if (act3Branch === 'WHISTLEBLOWER') {
        stageLightingMode = 'TWIST_FRACTURE';
        mutators.add('WHISPERED_INSIDER');
      } else if (act3Branch === 'INSIDER') {
        stageLightingMode = 'INTERVIEW';
        mutators.add('BLUFF_WAGER');
      }
    }

    // 5. SINGAPORE DYNAMIC BETRAYAL (`sg_3`)
    if (missionId === 'sg_3') {
      const betrayal = this.resolveSingaporeBetrayer();
      mutators.add(betrayal.signatureMutator);
      stageLightingMode = 'TWIST_FRACTURE';
    }

    // Anti-lockout guardrail (Research #3 §5.1): never lock Peel when Grudge Weakest Domain is active
    // unless Charter Heat was explicitly opted into
    if (
      mutators.has('GRUDGE_WEAKEST_DOMAIN') &&
      mutators.has('ANALOG_STATIC') &&
      this.state.charterHeatMutators.length === 0
    ) {
      mutators.delete('ANALOG_STATIC');
    }

    if (mutators.has('ZERO_SHIELD_SUDDEN_DEATH')) {
      startingShields = 0;
    }

    const peelLockedBothPlayers = mutators.has('ANALOG_STATIC');
    const peelLockReason = peelLockedBothPlayers
      ? tokyoJammerTriggered
        ? 'LIVE SIGNAL JAMMER ACTIVE — Depth Peel sealed for both players!'
        : 'ANALOG STATIC — Depth Peel sealed; pure Cold Instinct (+25% bonus)!'
      : null;

    const hasDiplomatComposure = this.hasPerk('DIPLOMAT_COMPOSURE');
    const hasAnalogMaster = this.hasPerk('ANALOG_STATIC_MASTER');
    const hasMaverickGambit = this.hasPerk('MAVERICK_GAMBIT');
    const hasBluffEcho = this.hasPerk('BLUFF_ECHO') || act3Branch === 'INSIDER';

    let chronoBonusSec = 0;
    if (hasDiplomatComposure) chronoBonusSec += 2.0;
    if (hasAnalogMaster && peelLockedBothPlayers) chronoBonusSec += 3.0;

    const queryBoostTags: NarrativeTag[] = [];
    if (tokyoJammerTriggered || peelLockedBothPlayers) {
      queryBoostTags.push('LATERAL_DEDUCTION');
    }
    if (act3Branch === 'WHISTLEBLOWER') {
      queryBoostTags.push('BLACK_SALON', 'INVESTIGATIVE');
    } else if (act3Branch === 'INSIDER') {
      queryBoostTags.push('HIGH_POWER', 'HIGH_STAKES_BLUFF');
    }

    const isGrudgeActive = mutators.has('GRUDGE_WEAKEST_DOMAIN');
    const weakestMeta = getSovereignDomainMeta(weakestDomainId);

    return {
      missionId,
      hubId,
      stageLightingMode,
      activeMutators: Array.from(mutators),
      startingShields,
      maxShields,
      startingPlayerScoreBonus,
      chronoBonusSec,
      peelLockedBothPlayers,
      peelLockReason,
      autoShatterDecoyOnQ1: hasRedaction,
      canManualRedaction: hasRedaction,
      tier1ColdInstinctMultiplier:
        1.0 + (hasCleanHands ? 0.25 : 0) + (peelLockedBothPlayers ? 0.25 : 0),
      nadiaSuspicionTempoSteal,
      markWeakDistractorFracture,
      liveJammerActive: tokyoJammerTriggered,
      queryBoostTags,
      preferCrypticLateral: tokyoJammerTriggered,
      freeCoopPeelCount,
      nemesisWeakestDomainActive: isGrudgeActive,
      nemesisTargetDomainId: isGrudgeActive ? weakestDomainId : null,
      nemesisTargetDomainName: isGrudgeActive ? weakestMeta.name : null,
      nemesisTauntBanner: isGrudgeActive
        ? `NEMESIS COUNTER-PICK: Nadia targeted your weakest domain (${weakestMeta.name})!`
        : null,
      peoplesLensHeatmapActive,
      councilDomainVetoCount: councilOverrideActive ? 1 : 0,
      sovereignDomainBonusMultiplier: councilOverrideActive ? 1.2 : 1.0,
      bluffEchoEnabled: hasBluffEcho,
      bluffOverclockDuels: mutators.has('BLUFF_WAGER') || act3Branch === 'INSIDER',
      tempoStealImmune: hasDiplomatComposure || hasAnalogMaster,
      overclockChargeSpeedMultiplier: hasMaverickGambit ? 1.3 : 1.0,
      overclockPeakBonusScale: hasMaverickGambit ? 1.25 : 1.0,
    };
  }

  /**
   * Generates a deterministic simulated global crowd consensus heatmap (%) for People's Lens!
   */
  public computePeoplesLensHeatmap(
    facetCount: number,
    correctFacetIndex: number,
    questionIrtB: number
  ): number[] {
    const count = Math.max(2, facetCount);
    const weights: number[] = [];
    // Public trust increases clarity of crowd signal slightly (55%..82% on correct facet)
    const difficultyDrag = clamp((questionIrtB + 1.0) * 0.09, 0, 0.28);
    const trustLift = clamp((this.state.publicTrust - 50) * 0.002, -0.05, 0.1);
    const correctShare = clamp(0.74 - difficultyDrag + trustLift, 0.42, 0.86);
    const remainder = 1 - correctShare;

    let remSum = 0;
    for (let i = 0; i < count; i++) {
      if (i === correctFacetIndex) {
        weights.push(correctShare);
      } else {
        const w = 1 + ((i * 7 + 3) % 5) * 0.35;
        weights.push(w);
        remSum += w;
      }
    }

    const pcts = weights.map((w, idx) =>
      idx === correctFacetIndex
        ? Math.round(correctShare * 100)
        : Math.round(((w / Math.max(1e-6, remSum)) * remainder) * 100)
    );
    const diff = 100 - pcts.reduce((a, b) => a + b, 0);
    pcts[correctFacetIndex] = clamp(pcts[correctFacetIndex] + diff, 1, 99);
    return pcts;
  }

  /**
   * Starts New Circuit+ ("The Second Dossier"): preserves Relics, Perks, Skins, Vault Clues,
   * Evidence Clues, and Achieved Endings while resetting route/axes to explore opposite branches!
   */
  public startNewCircuitPlus(charterHeatMutators: MutatorId[] = []): InkBlackboardSnapshot {
    const preservedRelics = [...this.state.unlockedRelics];
    const preservedPerks = [...this.state.unlockedPerks];
    const preservedActivePerks = [...this.state.activePerks];
    const preservedSkins = [...this.state.unlockedSkins];
    const preservedActiveSkin = this.state.activeSkin;
    const preservedVaultClues = [...this.state.vaultClues];
    const preservedEvidence = [...this.state.unlockedEvidenceClues];
    const preservedEndings = [...this.state.achievedEndings];
    const nextPlusCount = this.state.newCircuitPlusCount + 1;

    this.state = {
      ...createDefaultBlackboard(),
      prologueComplete: true,
      origin: this.state.origin ?? 'STRATEGIST',
      persona: this.state.persona ?? 'PRODIGY',
      unlockedRelics: preservedRelics,
      unlockedPerks: preservedPerks,
      activePerks: preservedActivePerks,
      unlockedSkins: preservedSkins,
      activeSkin: preservedActiveSkin,
      vaultClues: preservedVaultClues,
      unlockedEvidenceClues: preservedEvidence,
      achievedEndings: preservedEndings,
      blackSalonUnlocked: true,
      currentMissionId: 'ch_5', // Jump right to Act I Flight Fork or replay any mission!
      completedMissions: ['ch_1', 'ch_2', 'ch_3', 'ch_4'],
      newCircuitPlusCount: nextPlusCount,
      charterHeatMutators: charterHeatMutators.slice(0, 3),
    };
    this.save();
    return this.getSnapshot();
  }

  public hydrateSnapshot(
    raw: Partial<InkBlackboardSnapshot> | null | undefined
  ): InkBlackboardSnapshot {
    this.state = this.parseSnapshotObject(raw);
    this.save();
    return this.getSnapshot();
  }

  public resetAll(): void {
    this.state = createDefaultBlackboard();
    this.save();
  }
}
