// ============================================================================
// WORLD'S SMARTEST — Interactive 12-Clue Conspiracy Evidence Board (DOSSIER)
// Implements PITCH_BIBLE.md §2.3, §2.5 & campaign_20hr.json v4.0 Evidence Board
// ============================================================================

import type { HubId, PassportSystem } from './PassportSystem';
import type { BondLevel, CastMemberId, InkBlackboard } from './InkBlackboard';
import { getPortraitUrl } from './RivalAI';

export type ClueCategory =
  | 'DOCUMENT'
  | 'ARTIFACT'
  | 'PHOTOGRAPH'
  | 'HARDWARE'
  | 'DOSSIER'
  | 'CIPHER'
  | 'LOG'
  | 'MASTER KEY';

export interface RawEvidenceClue {
  id: string;
  number: number;
  title: string;
  city_id: HubId;
  city_label: string;
  unlock_mission: string;
  suspect_id: CastMemberId;
  category: ClueCategory;
  summary: string;
  red_thread_to: string[];
  board_pos: [number, number];
}

export interface RawEvidenceBoardSchema {
  board_title: string;
  board_subtitle: string;
  music?: string;
  suspects: Array<{
    id: CastMemberId;
    name: string;
    role: string;
    portrait: string;
    status_hint: string;
  }>;
  clues: RawEvidenceClue[];
}

export interface SuspectDossierCard {
  id: CastMemberId;
  name: string;
  role: string;
  portraitUrl: string;
  bondTier: BondLevel;
  bondScore: number;
  statusHint: string;
  linkedClueCount: number;
  unlockedClueCount: number;
}

export interface EvidenceClueNode {
  id: string;
  number: number;
  title: string;
  displayTitle: string;
  cityId: HubId;
  cityLabel: string;
  unlockMissionId: string;
  suspectId: CastMemberId;
  suspectName: string;
  category: ClueCategory;
  unlocked: boolean;
  summary: string;
  displaySummary: string;
  boardPos: [number, number]; // normalized [x, y] in 0..1
  redThreadTo: string[];
}

export interface EvidenceThreadEdge {
  id: string;
  fromClueId: string;
  toClueId: string;
  x1: number; // normalized 0..1
  y1: number;
  x2: number;
  y2: number;
  state: 'LOCKED' | 'PARTIAL_CRIMSON' | 'VERIFIED_GOLD';
  strokeHex: string;
  opacity: number;
}

export interface VaultClueStatus {
  id: string;
  number: 1 | 2 | 3;
  missionId: string;
  cityLabel: string;
  title: string;
  summary: string;
  unlocked: boolean;
}

export interface DossierBoardViewModel {
  boardTitle: string;
  boardSubtitle: string;
  investigatorHeader: string;
  challengerName: string;
  unlockedCount: number;
  totalCount: number;
  completionPct: number;
  conspiracyStageLabel: string;
  suspects: SuspectDossierCard[];
  clues: EvidenceClueNode[];
  threads: EvidenceThreadEdge[];
  vaultClues: VaultClueStatus[];
  vaultCluesUnlockedCount: number;
  secretEndingReady: boolean;
}

const CANONICAL_CLUES: readonly RawEvidenceClue[] = [
  {
    id: 'clue_01_summons',
    number: 1,
    title: 'The 99.4% Scouting Slip',
    city_id: 'ch',
    city_label: 'Geneva',
    unlock_mission: 'ch_1',
    suspect_id: 'vance',
    category: 'DOCUMENT',
    summary:
      "Julian Vance's private Geneva note flags your mind as a 99.4% anomaly match—without naming who you matched.",
    red_thread_to: ['clue_06_trial00_photo', 'clue_07_psychometric_match'],
    board_pos: [0.14, 0.22],
  },
  {
    id: 'clue_02_watch_scratch',
    number: 2,
    title: "Vance's Engraved Watch",
    city_id: 'ch',
    city_label: 'Geneva',
    unlock_mission: 'ch_2',
    suspect_id: 'vance',
    category: 'ARTIFACT',
    summary:
      "Inside Julian's brass pocket watch is a hidden scratch: 'TRIAL ZERO — DO NOT LET THEM ERASE ANOTHER.'",
    red_thread_to: ['clue_03_drawer_00', 'clue_09_rescue_code'],
    board_pos: [0.35, 0.18],
  },
  {
    id: 'clue_03_drawer_00',
    number: 3,
    title: 'Drawer 00 Floor Stamp',
    city_id: 'gb',
    city_label: 'London',
    unlock_mission: 'gb_2',
    suspect_id: 'lindqvist',
    category: 'PHOTOGRAPH',
    summary:
      "Sealed mahogany drawers beneath London's glass stage prove a secret 2019 pilot contest happened seven years ago.",
    red_thread_to: ['clue_04_wax_briefing', 'clue_06_trial00_photo'],
    board_pos: [0.58, 0.2],
  },
  {
    id: 'clue_04_wax_briefing',
    number: 4,
    title: "Lindqvist's Wax Envelope",
    city_id: 'gb',
    city_label: 'London',
    unlock_mission: 'gb_3',
    suspect_id: 'lindqvist',
    category: 'DOCUMENT',
    summary:
      "Chancellor Lindqvist's backroom folder uses a Sovereign wax stamp dated 2019—linking her straight to the cover-up.",
    red_thread_to: ['clue_08_rio_burnt_relay', 'clue_10_sovereign_receipt'],
    board_pos: [0.82, 0.22],
  },
  {
    id: 'clue_05_horizon_chip',
    number: 5,
    title: 'Tokyo Earpiece Wafer',
    city_id: 'jp',
    city_label: 'Tokyo',
    unlock_mission: 'jp_2',
    suspect_id: 'soren',
    category: 'HARDWARE',
    summary:
      "Soren's sub-vocal earpiece was powered by Horizon servers—whose backup log also pinged buried coordinates under Giza.",
    red_thread_to: ['clue_07_psychometric_match', 'clue_08_rio_burnt_relay'],
    board_pos: [0.84, 0.48],
  },
  {
    id: 'clue_06_trial00_photo',
    number: 6,
    title: 'Engraved Trophy Notch',
    city_id: 'gb',
    city_label: 'London',
    unlock_mission: 'gb_5',
    suspect_id: 'tariq',
    category: 'ARTIFACT',
    summary:
      "Etched inside London's bronze trophy: 'A.M. — 2019.' Nadia froze on sight—it belongs to her missing brother Tariq.",
    red_thread_to: ['clue_07_psychometric_match', 'clue_09_rescue_code'],
    board_pos: [0.16, 0.49],
  },
  {
    id: 'clue_07_psychometric_match',
    number: 7,
    title: 'Cairo Twin-Mind Dossier',
    city_id: 'eg',
    city_label: 'Cairo',
    unlock_mission: 'eg_3',
    suspect_id: 'vance',
    category: 'DOSSIER',
    summary:
      'Pulled from the buried Giza vault: Tariq Al-Mansoor won Trial Zero, found Council rigging, and shares your 99.4% profile.',
    red_thread_to: ['clue_09_rescue_code', 'clue_12_trojan_blueprint'],
    board_pos: [0.42, 0.48],
  },
  {
    id: 'clue_08_rio_burnt_relay',
    number: 8,
    title: 'Rio Burnt Podium Relay',
    city_id: 'br',
    city_label: 'Rio',
    unlock_mission: 'br_2',
    suspect_id: 'lindqvist',
    category: 'HARDWARE',
    summary:
      "Sabotaged Nadia's podium using Horizon chips—yet Soren's smooth coin tell proved he wasn't the saboteur.",
    red_thread_to: ['clue_10_sovereign_receipt'],
    board_pos: [0.64, 0.49],
  },
  {
    id: 'clue_09_rescue_code',
    number: 9,
    title: "Vance's Hidden Rescue Code",
    city_id: 'eg',
    city_label: 'Cairo',
    unlock_mission: 'eg_5',
    suspect_id: 'tariq',
    category: 'CIPHER',
    summary:
      "Vance's 'erasure' stamp on Tariq's 2019 file wasn't a hit order—it was a diplomatic witness-protection rescue code!",
    red_thread_to: ['clue_11_caldera_log'],
    board_pos: [0.18, 0.78],
  },
  {
    id: 'clue_10_sovereign_receipt',
    number: 10,
    title: 'Sovereign Frame-Job Receipt',
    city_id: 'sg',
    city_label: 'Singapore',
    unlock_mission: 'sg_2',
    suspect_id: 'lindqvist',
    category: 'DOCUMENT',
    summary:
      "Found inside Singapore's server core: Lindqvist's own proxies bought Horizon parts to frame Soren and cut Nadia in Rio.",
    red_thread_to: ['clue_12_trojan_blueprint'],
    board_pos: [0.8, 0.78],
  },
  {
    id: 'clue_11_caldera_log',
    number: 11,
    title: "Tariq's Seven-Year Ice Log",
    city_id: 'is',
    city_label: 'Reykjavik',
    unlock_mission: 'is_3',
    suspect_id: 'tariq',
    category: 'LOG',
    summary:
      'Tariq has been alive and partnering with Julian Vance in Iceland for seven years—building a global broadcast trap.',
    red_thread_to: ['clue_12_trojan_blueprint'],
    board_pos: [0.4, 0.78],
  },
  {
    id: 'clue_12_trojan_blueprint',
    number: 12,
    title: 'The Apex Trojan Charter',
    city_id: 'global',
    city_label: 'Apex Forum',
    unlock_mission: 'global_4',
    suspect_id: 'vance',
    category: 'MASTER KEY',
    summary:
      'The complete puzzle: put one uncorrupted mind live before two billion people holding the Master Ledger Key so no bloc can silence them.',
    red_thread_to: [],
    board_pos: [0.6, 0.78],
  },
];

const CANONICAL_VAULT_CLUES: ReadonlyArray<{
  id: string;
  number: 1 | 2 | 3;
  missionId: string;
  cityLabel: string;
  title: string;
  summary: string;
}> = [
  {
    id: 'vault_clue_1_london_drawer',
    number: 1,
    missionId: 'gb_4',
    cityLabel: 'London · Camden Black Salon',
    title: 'The 2019 Secret Contest Manifest',
    summary:
      "Smuggled from London's glass-floor archive: a 2019 champion payout stamped 'ERASED BY COUNCIL VOTE.'",
  },
  {
    id: 'vault_clue_2_cairo_cipher',
    number: 2,
    missionId: 'eg_5',
    cityLabel: 'Cairo · Solar Vault',
    title: "Vance's Witness-Protection Code",
    summary:
      "Found inside Cairo's Cipher Box: Julian Vance's erasure stamp was actually a secret rescue code.",
  },
  {
    id: 'vault_clue_3_caldera_log',
    number: 3,
    missionId: 'is_3',
    cityLabel: 'Reykjavik · Basalt Caldera',
    title: "Tariq's Seven-Year Broadcast Log",
    summary:
      'Proves Julian Vance built the entire televised contest to corner corrupt leaders live before two billion people.',
  },
];

const ALL_SIX_SUSPECT_META: ReadonlyArray<{
  id: CastMemberId;
  name: string;
  role: string;
  baseHint: string;
}> = [
  {
    id: 'vance',
    name: 'Julian Vance',
    role: 'Chief Adjudicator · Architect?',
    baseHint: 'Handpicked you for a 99.4% match—ally or puppet-master?',
  },
  {
    id: 'nadia',
    name: 'Nadia Al-Mansoor',
    role: 'Acoustic Prodigy · Sister of Tariq',
    baseHint: 'Entered The Meridian hunting the truth behind Trial Zero.',
  },
  {
    id: 'soren',
    name: 'Soren "Echo" Kael',
    role: 'Horizon Wildcard',
    baseHint: 'Caught with a covert earpiece in Tokyo—framed for Rio?',
  },
  {
    id: 'teo',
    name: 'Mateo "Teo" Rojas',
    role: 'Rogue Broadcast Producer',
    baseHint: 'Runs underground Black Salons & covert press uplinks.',
  },
  {
    id: 'lindqvist',
    name: 'Chancellor Lindqvist',
    role: 'Chair, Sovereign Bloc',
    baseHint: 'Offers sealed briefings and guards the 2019 archive.',
  },
  {
    id: 'tariq',
    name: 'Tariq Al-Mansoor',
    role: 'Missing 2019 Champion',
    baseHint: 'Erased after winning Trial Zero—shares your 99.4% mind.',
  },
];

export class EvidenceDossier {
  private readonly blackboard: InkBlackboard;
  private readonly passport: PassportSystem;
  private cluesSchema: RawEvidenceClue[] = [...CANONICAL_CLUES];
  private boardTitle = 'THE MERIDIAN CONSPIRACY DOSSIER';
  private boardSubtitle =
    'Uncover 12 physical clues across 8 cities to expose who rigged the $100M Ledger Key.';

  constructor(blackboard: InkBlackboard, passport: PassportSystem) {
    this.blackboard = blackboard;
    this.passport = passport;
  }

  public hydrateFromCampaignSchema(schema?: RawEvidenceBoardSchema | null): void {
    if (!schema) return;
    if (schema.board_title) this.boardTitle = schema.board_title;
    if (schema.board_subtitle) this.boardSubtitle = schema.board_subtitle;
    if (Array.isArray(schema.clues) && schema.clues.length > 0) {
      this.cluesSchema = schema.clues.map((c) => ({ ...c }));
    }
  }

  public unlockClueForMission(missionId: string): EvidenceClueNode | null {
    const match = this.cluesSchema.find((c) => c.unlock_mission === missionId);
    if (!match) return null;
    this.blackboard.unlockEvidenceClue(match.id);
    const vm = this.buildViewModel();
    return vm.clues.find((c) => c.id === match.id) ?? null;
  }

  public buildViewModel(): DossierBoardViewModel {
    const snap = this.blackboard.getSnapshot();
    const challengerName = this.passport.getChallengerName();
    const unlockedSet = new Set<string>(snap.unlockedEvidenceClues);

    // Also auto-unlock any clue whose unlock_mission is already in completedMissions
    for (const c of this.cluesSchema) {
      if (snap.completedMissions.includes(c.unlock_mission)) {
        unlockedSet.add(c.id);
      }
    }

    const clueById = new Map<string, EvidenceClueNode>();
    const clues: EvidenceClueNode[] = this.cluesSchema.map((raw) => {
      const unlocked = unlockedSet.has(raw.id);
      const suspectMeta =
        ALL_SIX_SUSPECT_META.find((s) => s.id === raw.suspect_id) ?? ALL_SIX_SUSPECT_META[0];
      const node: EvidenceClueNode = {
        id: raw.id,
        number: raw.number,
        title: raw.title,
        displayTitle: unlocked
          ? `#${String(raw.number).padStart(2, '0')} · ${raw.title}`
          : `#${String(raw.number).padStart(2, '0')} · [CLASSIFIED — ${raw.city_label.toUpperCase()}]`,
        cityId: raw.city_id,
        cityLabel: raw.city_label,
        unlockMissionId: raw.unlock_mission,
        suspectId: raw.suspect_id,
        suspectName: suspectMeta.name,
        category: raw.category,
        unlocked,
        summary: raw.summary,
        displaySummary: unlocked
          ? this.passport.interpolateText(raw.summary)
          : `Encrypted ${raw.category} located in ${raw.city_label}. Clear mission ${raw.unlock_mission.toUpperCase()} to decrypt.`,
        boardPos: [raw.board_pos[0], raw.board_pos[1]],
        redThreadTo: [...raw.red_thread_to],
      };
      clueById.set(node.id, node);
      return node;
    });

    const threads: EvidenceThreadEdge[] = [];
    for (const src of clues) {
      for (const dstId of src.redThreadTo) {
        const dst = clueById.get(dstId);
        if (!dst) continue;
        let state: EvidenceThreadEdge['state'] = 'LOCKED';
        let strokeHex = '#3a4256';
        let opacity = 0.28;

        if (src.unlocked && dst.unlocked) {
          state = 'VERIFIED_GOLD';
          strokeHex = '#e8c474';
          opacity = 0.92;
        } else if (src.unlocked || dst.unlocked) {
          state = 'PARTIAL_CRIMSON';
          strokeHex = '#d94854';
          opacity = 0.72;
        }

        threads.push({
          id: `${src.id}__${dst.id}`,
          fromClueId: src.id,
          toClueId: dst.id,
          x1: src.boardPos[0],
          y1: src.boardPos[1],
          x2: dst.boardPos[0],
          y2: dst.boardPos[1],
          state,
          strokeHex,
          opacity,
        });
      }
    }

    const suspects: SuspectDossierCard[] = ALL_SIX_SUSPECT_META.map((meta) => {
      const linked = clues.filter((c) => c.suspectId === meta.id);
      const unlockedLinked = linked.filter((c) => c.unlocked);
      let dynamicHint = meta.baseHint;

      if (meta.id === 'vance' && unlockedSet.has('clue_11_caldera_log')) {
        dynamicHint = 'CONFIRMED: Co-engineered The Meridian with Tariq as a Trojan Horse trap.';
      } else if (meta.id === 'tariq' && unlockedSet.has('clue_11_caldera_log')) {
        dynamicHint = 'ALIVE IN REYKJAVIK: Guiding the final broadcast lock override.';
      } else if (meta.id === 'lindqvist' && unlockedSet.has('clue_10_sovereign_receipt')) {
        dynamicHint = 'EXPOSED: Ordered the Rio sabotage proxy to frame Horizon.';
      }

      return {
        id: meta.id,
        name: meta.name,
        role: meta.role,
        portraitUrl: getPortraitUrl(meta.id, 'neutral'),
        bondTier: snap.bondTiers[meta.id],
        bondScore: snap.bondScores[meta.id],
        statusHint: dynamicHint,
        linkedClueCount: linked.length,
        unlockedClueCount: unlockedLinked.length,
      };
    });

    const vaultClues: VaultClueStatus[] = CANONICAL_VAULT_CLUES.map((vc) => ({
      ...vc,
      unlocked: snap.vaultClues.includes(vc.id),
    }));
    const vaultCluesUnlockedCount = vaultClues.filter((v) => v.unlocked).length;

    const unlockedCount = clues.filter((c) => c.unlocked).length;
    const totalCount = clues.length;
    const completionPct = Math.round((unlockedCount / Math.max(1, totalCount)) * 100);

    const conspiracyStageLabel =
      unlockedCount >= 11
        ? 'TROJAN HORSE COMPLETE — THE ARCHITECT REVEALED'
        : unlockedCount >= 7
          ? 'MERIDIAN ZERO UNSEALED — 99.4% TWIN MIND'
          : unlockedCount >= 3
            ? 'TRIAL ZERO ANOMALY DETECTED (2019)'
            : 'GENEVA SCREENING — ACTIVE SURVEILLANCE';

    const secretEndingReady =
      vaultCluesUnlockedCount >= 3 &&
      snap.axisIntegrity >= 20 &&
      snap.publicTrust >= 55 &&
      (snap.bondScores.nadia >= 2 || snap.bondScores.teo >= 2);

    return {
      boardTitle: this.boardTitle,
      boardSubtitle: this.boardSubtitle,
      investigatorHeader: `CLASSIFIED DOSSIER // CHALLENGER: ${challengerName.toUpperCase()}`,
      challengerName,
      unlockedCount,
      totalCount,
      completionPct,
      conspiracyStageLabel,
      suspects,
      clues,
      threads,
      vaultClues,
      vaultCluesUnlockedCount,
      secretEndingReady,
    };
  }
}
