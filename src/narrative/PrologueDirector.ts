// ============================================================================
// WORLD'S SMARTEST — Faithful 4-Question Geneva Vetting Prologue Director
// Implements PITCH_BIBLE.md §2.2 ("The Vetting Chamber" — Geneva) 100%
// ============================================================================

import { forgeEngine } from '../forge';
import {
  ORIGIN_DEFINITIONS,
  PERSONA_DEFINITIONS,
  validateChallengerName,
  type ChallengerNameValidationResult,
  type DomainId,
  type OriginDefinition,
  type OriginId,
  type PassportSystem,
  type PersonaDefinition,
} from './PassportSystem';
import type { InkBlackboard, Stage3DLightingMode } from './InkBlackboard';
import { getPortraitUrl, type CharacterExpression } from './RivalAI';

export type ProloguePhase =
  | 'SUMMONS_CUTSCENE'
  | 'CHAMBER_OPENING'
  | 'IDENTITY_REGISTRATION'
  | 'VETTING_Q1_SPIN'
  | 'MIRROR_LEAK_CHOICE'
  | 'VETTING_Q2_PEEL'
  | 'SPOTLIGHT_MANIFESTO'
  | 'VETTING_Q3_OVERCLOCK'
  | 'VETTING_Q4_CALIBRATOR'
  | 'PASSPORT_STAMP_PAYOFF'
  | 'ACT1_FLIGHT_FORK'
  | 'COMPLETED';

export type MirrorLeakOptionId = 'EXPLOIT_LEAK' | 'FLAG_BREACH' | 'SOLVE_CLEAN';

export type ManifestoOptionId = 'MANIFESTO_COUNCIL' | 'MANIFESTO_PUBLIC' | 'MANIFESTO_SELF';

export type FlightForkDestination = 'GB' | 'JP';

export interface PrologueQuestionCard {
  questionIndex: 1 | 2 | 3 | 4;
  qid: number;
  domainId: DomainId;
  archetype: 'SIGHTLINE_LOCK' | 'CALIBRATOR_DIAL';
  prompt: string;
  answerCorrect: string;
  facets?: [string, string, string, string];
  correctFacetIndex?: number;
  clues: [string, string]; // [Tier-2 Lateral Clue, Tier-3 Pinpoint Clue]
  calibratorSpec?: {
    exactVal: number;
    minVal: number;
    maxVal: number;
    step: number;
    unit: string;
  };
  whyExplanation: string;
  timeTotalSec: number;
  coachPrompt: string;
  taughtVerb: 'SPIN' | 'PEEL' | 'OVERCLOCK' | 'CALIBRATE';
  stageLightingMode: Stage3DLightingMode;
  peelEnabled: boolean;
  overclockHighlighted: boolean;
  leakedHintText?: string;
}

export interface PrologueCutsceneSlide {
  id: string;
  speakerId: 'vance' | 'teo';
  speakerName: string;
  expression: CharacterExpression;
  portraitUrl: string;
  voiceUrl: string;
  subtitle: string;
}

export interface PrologueChoiceOption<TId extends string = string> {
  id: TId;
  label: string;
  subtext: string;
  impactBadge: string;
  tone: 'gold' | 'cyan' | 'crimson';
}

export interface PrologueStepSnapshot {
  phase: ProloguePhase;
  venueId: 'ch';
  venueGlbUrl: string;
  stageLightingMode: Stage3DLightingMode;
  cutsceneImageUrl?: string;
  cutsceneSlides?: PrologueCutsceneSlide[];
  speakerId: 'vance' | 'teo';
  speakerName: string;
  speakerRole: string;
  expression: CharacterExpression;
  portraitUrl: string;
  voiceUrl?: string;
  dialogueText: string;
  tellHint?: string;
  // Identity Registration payload (Step 1)
  requiresNameAndOriginInput: boolean;
  currentChallengerName: string;
  hasRegisteredName: boolean;
  selectedOrigin: OriginId;
  originOptions: OriginDefinition[];
  // Ethical / Manifesto / Flight Fork choices
  mirrorLeakChoices?: PrologueChoiceOption<MirrorLeakOptionId>[];
  manifestoChoices?: PrologueChoiceOption<ManifestoOptionId>[];
  flightForkChoices?: PrologueChoiceOption<FlightForkDestination>[];
  // Active Vetting Question (Q1..Q4)
  activeQuestion: PrologueQuestionCard | null;
  leakedHintRevealed: boolean;
  // Passport Stamp Payoff (Step 6)
  stampedPersona: PersonaDefinition | null;
}

export interface PrologueAnswerReport {
  questionIndex: 1 | 2 | 3 | 4;
  correct: boolean;
  peelTierUsed: 1 | 2 | 3;
  overclocked: boolean;
  spinUsed: boolean;
  calibratorTolerancePct?: number;
}

const GENEVA_SUMMONS_SLIDES: readonly PrologueCutsceneSlide[] = [
  {
    id: 'cutscene_act0_1',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'neutral',
    portraitUrl: getPortraitUrl('vance', 'neutral'),
    voiceUrl: 'assets/voice/cutscene_act0_1.mp3',
    subtitle:
      'Midnight over Lake Geneva. Four hundred thousand minds entered the cipher—only one unlocked the door.',
  },
  {
    id: 'cutscene_act0_2',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'intense',
    portraitUrl: getPortraitUrl('vance', 'intense'),
    voiceUrl: 'assets/voice/cutscene_act0_2.mp3',
    subtitle:
      'Eight cities. Forty rounds. One hundred million dollars—and the lone human veto key over The Ledger.',
  },
  {
    id: 'cutscene_act0_3',
    speakerId: 'teo',
    speakerName: 'Mateo "Teo" Rojas',
    expression: 'intense',
    portraitUrl: getPortraitUrl('teo', 'intense'),
    voiceUrl: 'assets/voice/cutscene_act0_3.mp3',
    subtitle:
      "Don't trust the cameras, rookie. The last person who won this chair vanished in 2019.",
  },
];

/**
 * 4 Handcrafted Gold-Seed Geneva Vetting Questions teaching 1 tactile verb per question!
 */
const GENEVA_VETTING_QUESTIONS: readonly PrologueQuestionCard[] = [
  {
    questionIndex: 1,
    qid: 1,
    domainId: 2, // Geography (Geneva / Alpine host flavor)
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Which humanitarian organization was founded in Geneva in 1863 after Henry Dunant witnessed the Battle of Solferino?',
    answerCorrect: 'International Red Cross',
    facets: [
      'League of Nations',
      'International Red Cross',
      'Doctors Without Borders',
      'World Health Organization',
    ],
    correctFacetIndex: 1,
    clues: [
      'Its emblem inverts the white-and-red colors of the Swiss national flag.',
      'Inspired by Dunant’s book "A Memory of Solferino" to protect wounded soldiers.',
    ],
    whyExplanation:
      'Henry Dunant co-founded the International Committee of the Red Cross in Geneva in 1863, inspiring the first Geneva Convention.',
    timeTotalSec: 25,
    coachPrompt:
      'SPIN & SAFE-LOCK — Drag the 3D Prism (or tap A–D) to align your answer in the Gold Sightline Beam, then TAP LOCK (3.0x)!',
    taughtVerb: 'SPIN',
    stageLightingMode: 'INTERVIEW',
    peelEnabled: false,
    overclockHighlighted: false,
  },
  {
    questionIndex: 2,
    qid: 2,
    domainId: 0, // History / Diplomacy
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Which ancient trilingual stele—carved in 196 BCE and rediscovered in 1799—unlocked the decipherment of Egyptian hieroglyphs?',
    answerCorrect: 'The Rosetta Stone',
    facets: [
      'Code of Hammurabi',
      'Behistun Inscription',
      'The Rosetta Stone',
      'Cyrus Cylinder',
    ],
    correctFacetIndex: 2,
    clues: [
      'Carries the same royal decree of Ptolemy V in Hieroglyphic, Demotic, and Ancient Greek.',
      'Cracked by Jean-François Champollion in 1822 using royal cartouche names.',
    ],
    whyExplanation:
      'Because Ancient Greek was known to scholars, Jean-François Champollion used the Rosetta Stone in 1822 to crack Egyptian hieroglyphs.',
    timeTotalSec: 24,
    coachPrompt:
      'DEPTH PEEL — Pull down the top Brass Crown (or tap PEEL CROWN) to open obsidian shutters for a 2.0x Holographic Clue!',
    taughtVerb: 'PEEL',
    stageLightingMode: 'INTERVIEW',
    peelEnabled: true,
    overclockHighlighted: false,
    leakedHintText:
      'MIRROR GLIMPSE: "...Ptolemaic granodiorite stele cracked by Champollion via Greek cartouches..."',
  },
  {
    questionIndex: 3,
    qid: 3,
    domainId: 1, // Science
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Which chemical element—liquid at room temperature and historically named hydrargyrum ("liquid silver")—has atomic symbol Hg?',
    answerCorrect: 'Mercury',
    facets: ['Gallium', 'Mercury', 'Bromine', 'Cesium'],
    correctFacetIndex: 1,
    clues: [
      'Used in classic Torricelli barometers to measure atmospheric pressure.',
      'Named after the fleet-footed Roman messenger god; atomic number 80.',
    ],
    whyExplanation:
      'Mercury (Hg, atomic number 80) and bromine are the only two elements on the periodic table that are liquid at standard room temperature.',
    timeTotalSec: 22,
    coachPrompt:
      'HOLD TO OVERCLOCK — PRESS & HOLD the Gold Lock Bar (0.3s–1.0s) to wager conviction up to 6.0x! Slide sideways to cancel.',
    taughtVerb: 'OVERCLOCK',
    stageLightingMode: 'TWIST_FRACTURE',
    peelEnabled: true,
    overclockHighlighted: true,
  },
  {
    questionIndex: 4,
    qid: 4,
    domainId: 6, // Tech & Space
    archetype: 'CALIBRATOR_DIAL',
    prompt:
      'In what year did Apollo 11 commander Neil Armstrong first step onto the Moon’s Sea of Tranquility?',
    answerCorrect: '1969 CE',
    clues: [
      'Occurred near the end of the 1960s Space Race, fulfilling JFK’s decade-end pledge.',
      'July 20, 1969 — Eagle landed at Tranquility Base.',
    ],
    calibratorSpec: {
      exactVal: 1969,
      minVal: 1950,
      maxVal: 1990,
      step: 1,
      unit: 'CE',
    },
    whyExplanation:
      'Apollo 11 landed on the Moon on July 20, 1969, watched live by an estimated 650 million television viewers worldwide.',
    timeTotalSec: 24,
    coachPrompt:
      'MERIDIAN ASTROLABE — Aim the Estimate Needle to the year and pick your Tolerance Cone: Wide Safe (1.5x) vs Pinhole Bullseye (3.5x)!',
    taughtVerb: 'CALIBRATE',
    stageLightingMode: 'BROADCAST',
    peelEnabled: false,
    overclockHighlighted: true,
  },
];

const MIRROR_LEAK_OPTIONS: readonly PrologueChoiceOption<MirrorLeakOptionId>[] = [
  {
    id: 'EXPLOIT_LEAK',
    label: 'Exploit the Leaked Glimpse',
    subtext:
      "Read Teo's reflected tablet clue across the polished table while keeping your 3.0x multiplier.",
    impactBadge: '+Ambition · -18 Integrity · Reveals Hint!',
    tone: 'crimson',
  },
  {
    id: 'FLAG_BREACH',
    label: 'Flag the Security Breach to Vance',
    subtext: 'Signal Julian Vance immediately that the observation mirror is leaking telemetry.',
    impactBadge: '+18 Council Favor · +15 Integrity',
    tone: 'gold',
  },
  {
    id: 'SOLVE_CLEAN',
    label: 'Ignore It & Solve Cleanly',
    subtext: 'Avert your eyes from the mirror and crack the Veritas Prism on your own merit.',
    impactBadge: '+20 Integrity · Vance & Teo Respect',
    tone: 'cyan',
  },
];

const MANIFESTO_OPTIONS: readonly PrologueChoiceOption<ManifestoOptionId>[] = [
  {
    id: 'MANIFESTO_COUNCIL',
    label: 'The World Council',
    subtext: '"Civilization endures through treaty law, accountability, and shared order."',
    impactBadge: '+15 Council Favor · +5 Integrity · Sovereign Nod',
    tone: 'gold',
  },
  {
    id: 'MANIFESTO_PUBLIC',
    label: 'The Global Public',
    subtext: '"Two billion citizens deserve unredacted truth—never locked behind closed doors."',
    impactBadge: '+15 Public Trust · +10 Integrity · Agora Nod',
    tone: 'cyan',
  },
  {
    id: 'MANIFESTO_SELF',
    label: 'Only Myself',
    subtext: '"Committees compromise; crowds panic. One independent mind holds the line."',
    impactBadge: '+Ambition · -10 Integrity · Horizon Nod',
    tone: 'crimson',
  },
];

const FLIGHT_FORK_OPTIONS: readonly PrologueChoiceOption<FlightForkDestination>[] = [
  {
    id: 'GB',
    label: 'London First · The Sovereign Rotunda',
    subtext:
      'Debut against prodigy Nadia Al-Mansoor above sealed "TRIAL 00 — 2019" glass-floor vaults.',
    impactBadge: 'SOVEREIGN TRACK · Classical History, Arts & Law',
    tone: 'gold',
  },
  {
    id: 'JP',
    label: 'Tokyo First · Horizon Sky Pavilion',
    subtext:
      '70 floors above neon rain against wildcard poker shark Soren "Echo" Kael and covert telemetry.',
    impactBadge: 'HORIZON TRACK · High-Velocity Tech, Science & Logic',
    tone: 'cyan',
  },
];

export class PrologueDirector {
  private readonly passport: PassportSystem;
  private readonly blackboard: InkBlackboard;

  private phase: ProloguePhase = 'SUMMONS_CUTSCENE';
  private selectedOrigin: OriginId = 'POLYMATH';
  private mirrorChoice: 'EXPLOITED' | 'FLAGGED' | 'CLEAN' = 'CLEAN';
  private manifestoChoice: 'COUNCIL' | 'PUBLIC' | 'SELF' = 'PUBLIC';
  private leakedHintRevealed = false;
  private stampedPersona: PersonaDefinition | null = null;

  // Live telemetry across Q1..Q4 for Persona computation
  private correctCount = 0;
  private spinCount = 0;
  private peelCount = 0;
  private overclockAttempts = 0;
  private overclockHits = 0;
  private calibratorTolerancePct = 0.12;
  private calibratorHit = false;
  private recordedForgeQids = new Set<number>();

  constructor(passport: PassportSystem, blackboard: InkBlackboard) {
    this.passport = passport;
    this.blackboard = blackboard;
    const snap = this.passport.getSnapshot();
    if (snap.origin) {
      this.selectedOrigin = snap.origin;
    }
  }

  public startFromBeginning(): PrologueStepSnapshot {
    this.phase = 'SUMMONS_CUTSCENE';
    this.leakedHintRevealed = false;
    this.stampedPersona = null;
    this.correctCount = 0;
    this.spinCount = 0;
    this.peelCount = 0;
    this.overclockAttempts = 0;
    this.overclockHits = 0;
    this.calibratorTolerancePct = 0.12;
    this.calibratorHit = false;
    this.recordedForgeQids.clear();
    return this.getSnapshot();
  }

  public getInternalStateSnapshot(): {
    phase: ProloguePhase;
    selectedOrigin: OriginId;
    mirrorChoice: 'EXPLOITED' | 'FLAGGED' | 'CLEAN';
    manifestoChoice: 'COUNCIL' | 'PUBLIC' | 'SELF';
    leakedHintRevealed: boolean;
    stampedPersonaId: string | null;
    correctCount: number;
    spinCount: number;
    peelCount: number;
    overclockAttempts: number;
    overclockHits: number;
    calibratorTolerancePct: number;
    calibratorHit: boolean;
  } {
    return {
      phase: this.phase,
      selectedOrigin: this.selectedOrigin,
      mirrorChoice: this.mirrorChoice,
      manifestoChoice: this.manifestoChoice,
      leakedHintRevealed: this.leakedHintRevealed,
      stampedPersonaId: this.stampedPersona?.id ?? null,
      correctCount: this.correctCount,
      spinCount: this.spinCount,
      peelCount: this.peelCount,
      overclockAttempts: this.overclockAttempts,
      overclockHits: this.overclockHits,
      calibratorTolerancePct: this.calibratorTolerancePct,
      calibratorHit: this.calibratorHit,
    };
  }

  public hydrateInternalState(raw?: Record<string, unknown> | null): void {
    if (!raw || typeof raw !== 'object') {
      const bbSnap = this.blackboard.getSnapshot();
      const ppSnap = this.passport.getSnapshot();
      if (bbSnap.prologueComplete) {
        this.phase = 'COMPLETED';
        this.stampedPersona = ppSnap.persona ? PERSONA_DEFINITIONS[ppSnap.persona] : null;
      } else {
        this.startFromBeginning();
      }
      return;
    }
    if (typeof raw.phase === 'string') {
      this.phase = raw.phase as ProloguePhase;
    }
    if (
      raw.selectedOrigin === 'ACADEMIC' ||
      raw.selectedOrigin === 'POLYMATH' ||
      raw.selectedOrigin === 'STRATEGIST'
    ) {
      this.selectedOrigin = raw.selectedOrigin;
    }
    if (
      raw.mirrorChoice === 'EXPLOITED' ||
      raw.mirrorChoice === 'FLAGGED' ||
      raw.mirrorChoice === 'CLEAN'
    ) {
      this.mirrorChoice = raw.mirrorChoice;
    }
    if (
      raw.manifestoChoice === 'COUNCIL' ||
      raw.manifestoChoice === 'PUBLIC' ||
      raw.manifestoChoice === 'SELF'
    ) {
      this.manifestoChoice = raw.manifestoChoice;
    }
    this.leakedHintRevealed = Boolean(raw.leakedHintRevealed);
    const pId = raw.stampedPersonaId;
    this.stampedPersona =
      pId === 'MAVERICK' || pId === 'DIPLOMAT' || pId === 'ANALYST' || pId === 'PRODIGY'
        ? PERSONA_DEFINITIONS[pId]
        : this.passport.getSnapshot().persona
          ? PERSONA_DEFINITIONS[this.passport.getSnapshot().persona!]
          : null;
    this.correctCount = Math.max(0, Math.floor(Number(raw.correctCount) || 0));
    this.spinCount = Math.max(0, Math.floor(Number(raw.spinCount) || 0));
    this.peelCount = Math.max(0, Math.floor(Number(raw.peelCount) || 0));
    this.overclockAttempts = Math.max(0, Math.floor(Number(raw.overclockAttempts) || 0));
    this.overclockHits = Math.max(0, Math.floor(Number(raw.overclockHits) || 0));
    this.calibratorTolerancePct = Number(raw.calibratorTolerancePct) || 0.12;
    this.calibratorHit = Boolean(raw.calibratorHit);
    this.recordedForgeQids.clear();
  }

  public advanceFromCutscene(): PrologueStepSnapshot {
    if (this.phase === 'SUMMONS_CUTSCENE') {
      this.phase = 'CHAMBER_OPENING';
    } else if (this.phase === 'CHAMBER_OPENING') {
      this.phase = 'IDENTITY_REGISTRATION';
    }
    return this.getSnapshot();
  }

  /**
   * Step 1: Validates & saves Challenger Name (1–22 chars) + Origin, then launches Q1 (SPIN)!
   */
  public submitIdentityAndOrigin(
    rawChallengerName: string,
    origin: OriginId
  ): { validation: ChallengerNameValidationResult; snapshot: PrologueStepSnapshot } {
    const validation = validateChallengerName(rawChallengerName);
    if (!validation.valid) {
      return { validation, snapshot: this.getSnapshot() };
    }

    this.passport.setChallengerName(validation.cleaned);
    const originDef = this.passport.setOrigin(origin);
    this.selectedOrigin = origin;

    this.blackboard.setFlag('origin', origin);
    this.blackboard.adjustAxes(originDef.initialAxesDelta);
    if (origin === 'ACADEMIC') {
      this.blackboard.adjustBond('nadia', 1);
    } else if (origin === 'POLYMATH') {
      this.blackboard.adjustBond('teo', 1);
    } else {
      this.blackboard.adjustBond('soren', 1);
    }
    // Unlock Clue #1 (The 99.4% Scouting Slip) upon entering Geneva Vetting!
    this.blackboard.unlockEvidenceClue('clue_01_summons');

    this.phase = 'VETTING_Q1_SPIN';
    return { validation, snapshot: this.getSnapshot() };
  }

  /**
   * Resolves Teo's One-Way Mirror Tablet Leak before/during Q2!
   */
  public chooseMirrorLeakAction(choiceId: MirrorLeakOptionId): PrologueStepSnapshot {
    if (choiceId === 'EXPLOIT_LEAK') {
      this.mirrorChoice = 'EXPLOITED';
      this.leakedHintRevealed = true;
      this.blackboard.applyEffects({
        integrity: -18,
        council_favor: -4,
        branch_flag: { prologue_leak: 'EXPLOITED' },
      });
    } else if (choiceId === 'FLAG_BREACH') {
      this.mirrorChoice = 'FLAGGED';
      this.leakedHintRevealed = false;
      this.blackboard.applyEffects({
        integrity: 15,
        council_favor: 18,
        bond_lindqvist: 1,
        branch_flag: { prologue_leak: 'FLAGGED' },
      });
    } else {
      this.mirrorChoice = 'CLEAN';
      this.leakedHintRevealed = false;
      this.blackboard.applyEffects({
        integrity: 20,
        public_trust: 8,
        bond_vance: 1,
        bond_teo: 1,
        branch_flag: { prologue_leak: 'CLEAN' },
      });
    }

    this.blackboard.unlockEvidenceClue('clue_02_watch_scratch');
    this.phase = 'VETTING_Q2_PEEL';
    return this.getSnapshot();
  }

  /**
   * Resolves Vance's Twist-Fracture Spotlight Manifesto before Q3 Overclock!
   */
  public chooseManifesto(choiceId: ManifestoOptionId): PrologueStepSnapshot {
    if (choiceId === 'MANIFESTO_COUNCIL') {
      this.manifestoChoice = 'COUNCIL';
      this.blackboard.applyEffects({
        council_favor: 15,
        integrity: 5,
        bond_lindqvist: 1,
        branch_flag: { manifesto: 'COUNCIL' },
      });
    } else if (choiceId === 'MANIFESTO_PUBLIC') {
      this.manifestoChoice = 'PUBLIC';
      this.blackboard.applyEffects({
        public_trust: 15,
        integrity: 10,
        bond_nadia: 1,
        bond_teo: 1,
        branch_flag: { manifesto: 'PUBLIC' },
      });
    } else {
      this.manifestoChoice = 'SELF';
      this.blackboard.applyEffects({
        integrity: -10,
        public_trust: 5,
        bond_soren: 1,
        branch_flag: { manifesto: 'SELF' },
      });
    }

    this.phase = 'VETTING_Q3_OVERCLOCK';
    return this.getSnapshot();
  }

  /**
   * Immediately syncs a Prologue Q1–Q4 lock outcome into `PassportSystem` & `forgeEngine`
   * (idempotent per `qid` so calling at lock-time AND at `recordQuestionCompleted` never double-counts!).
   */
  public syncLivePrologueOutcome(
    questionIndex: 1 | 2 | 3 | 4,
    correct: boolean,
    peelTierUsed: 1 | 2 | 3,
    overclocked = false
  ): void {
    const qCard = GENEVA_VETTING_QUESTIONS[questionIndex - 1];
    if (!qCard) return;
    this.passport.recordDomainQuestionOutcome(
      qCard.domainId,
      correct,
      peelTierUsed,
      -0.9,
      qCard.qid
    );
    if (!this.recordedForgeQids.has(qCard.qid)) {
      this.recordedForgeQids.add(qCard.qid);
      forgeEngine.recordQuestionOutcome({
        qid: qCard.qid,
        l0Domain: qCard.domainId,
        archetype: qCard.archetype,
        irtB: -0.9,
        irtA: 1.2,
        correct,
        peelTier: peelTierUsed,
        overclocked,
      });
    }
  }

  /**
   * Records completion of Q1, Q2, Q3, or Q4 and advances smoothly through the 4-Q Screening!
   */
  public recordQuestionCompleted(report: PrologueAnswerReport): PrologueStepSnapshot {
    if (report.correct) this.correctCount += 1;
    if (report.spinUsed) this.spinCount += 1;
    if (report.peelTierUsed >= 2) this.peelCount += 1;
    if (report.overclocked) {
      this.overclockAttempts += 1;
      if (report.correct) this.overclockHits += 1;
    }
    if (report.calibratorTolerancePct !== undefined) {
      const t = report.calibratorTolerancePct;
      this.calibratorTolerancePct = t > 1 ? t / 100 : t > 0 && t < 0.005 ? t * 100 : t;
      if (report.correct) this.calibratorHit = true;
    }

    this.syncLivePrologueOutcome(
      report.questionIndex,
      report.correct,
      report.peelTierUsed,
      report.overclocked
    );

    switch (report.questionIndex) {
      case 1:
        this.blackboard.markMissionCompleted('ch_1', 'ch_2');
        this.phase = 'MIRROR_LEAK_CHOICE';
        break;
      case 2:
        this.blackboard.markMissionCompleted('ch_2', 'ch_3');
        this.phase = 'SPOTLIGHT_MANIFESTO';
        break;
      case 3:
        this.blackboard.markMissionCompleted('ch_3', 'ch_4');
        this.phase = 'VETTING_Q4_CALIBRATOR';
        break;
      case 4: {
        this.blackboard.markMissionCompleted('ch_4', 'ch_5');
        const personaDef = this.passport.stampProloguePassport({
          origin: this.selectedOrigin,
          mirrorLeakChoice: this.mirrorChoice,
          manifestoChoice: this.manifestoChoice,
          correctCount: this.correctCount,
          totalQuestions: 4,
          spinCount: this.spinCount,
          peelCount: this.peelCount,
          overclockAttempts: this.overclockAttempts,
          overclockHits: this.overclockHits,
          calibratorTolerancePct: this.calibratorTolerancePct,
          calibratorHit: this.calibratorHit,
        });
        this.stampedPersona = personaDef;
        this.blackboard.setPrologueComplete(this.selectedOrigin, personaDef.id);
        this.blackboard.unlockPerk(personaDef.startingPerk, true);
        this.blackboard.unlockRelic('meridian_astrolabe');
        this.phase = 'PASSPORT_STAMP_PAYOFF';
        break;
      }
    }

    return this.getSnapshot();
  }

  public proceedToFlightFork(): PrologueStepSnapshot {
    this.phase = 'ACT1_FLIGHT_FORK';
    return this.getSnapshot();
  }

  /**
   * Step 7: Commits Act I Flight Fork (`London First: gb_1` vs `Tokyo First: jp_1`)!
   */
  public selectAct1FlightFork(destination: FlightForkDestination): {
    nextMissionId: 'gb_1' | 'jp_1';
    snapshot: PrologueStepSnapshot;
  } {
    const nextMissionId = destination === 'GB' ? 'gb_1' : 'jp_1';
    this.blackboard.applyEffects({
      council_favor: destination === 'GB' ? 8 : 0,
      public_trust: destination === 'JP' ? 8 : 0,
      integrity: 2,
      unlock_relic: 'meridian_astrolabe',
      branch_flag: {
        first_flight: destination,
        act1_track: destination === 'GB' ? 'SOVEREIGN_FIRST' : 'HORIZON_FIRST',
      },
    });
    this.blackboard.markMissionCompleted('ch_5', nextMissionId);
    this.phase = 'COMPLETED';
    return { nextMissionId, snapshot: this.getSnapshot() };
  }

  public getVettingQuestion(questionIndex: 1 | 2 | 3 | 4): PrologueQuestionCard {
    return GENEVA_VETTING_QUESTIONS[questionIndex - 1];
  }

  public getSnapshot(): PrologueStepSnapshot {
    const name = this.passport.getChallengerName();
    const hasName = this.passport.hasRegisteredName();
    const origins = Object.values(ORIGIN_DEFINITIONS);

    switch (this.phase) {
      case 'SUMMONS_CUTSCENE':
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/vetting_chamber_room.glb',
          stageLightingMode: 'INTERVIEW',
          cutsceneImageUrl: 'assets/cutscenes/act0_invitation.jpg',
          cutsceneSlides: [...GENEVA_SUMMONS_SLIDES],
          speakerId: 'vance',
          speakerName: 'Julian Vance',
          speakerRole: 'Chief Adjudicator · The Meridian',
          expression: 'neutral',
          portraitUrl: getPortraitUrl('vance', 'neutral'),
          voiceUrl: 'assets/voice/cutscene_act0_1.mp3',
          dialogueText: GENEVA_SUMMONS_SLIDES[0].subtitle,
          tellHint: 'Encrypted black-glass diplomatic summons — Geneva, 23:42 CET.',
          requiresNameAndOriginInput: false,
          currentChallengerName: hasName ? name : '',
          hasRegisteredName: hasName,
          selectedOrigin: this.selectedOrigin,
          originOptions: origins,
          activeQuestion: null,
          leakedHintRevealed: false,
          stampedPersona: null,
        };

      case 'CHAMBER_OPENING':
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/vetting_chamber_room.glb',
          stageLightingMode: 'INTERVIEW',
          speakerId: 'vance',
          speakerName: 'Julian Vance',
          speakerRole: 'Chief Adjudicator · The Meridian',
          expression: 'neutral',
          portraitUrl: getPortraitUrl('vance', 'neutral'),
          voiceUrl: 'assets/voice/vance_intro_1.mp3',
          dialogueText: "You solved what 400,000 couldn't. Take a seat.",
          tellHint:
            'Vance adjusts his left brass cufflink—a dossier marked "99.4% ANOMALY MATCH" rests beneath his hand.',
          requiresNameAndOriginInput: false,
          currentChallengerName: hasName ? name : '',
          hasRegisteredName: hasName,
          selectedOrigin: this.selectedOrigin,
          originOptions: origins,
          activeQuestion: null,
          leakedHintRevealed: false,
          stampedPersona: null,
        };

      case 'IDENTITY_REGISTRATION':
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/vetting_chamber_room.glb',
          stageLightingMode: 'INTERVIEW',
          speakerId: 'vance',
          speakerName: 'Julian Vance',
          speakerRole: 'Chief Adjudicator · The Meridian',
          expression: 'intense',
          portraitUrl: getPortraitUrl('vance', 'intense'),
          voiceUrl: 'assets/voice/vance_intro_3.mp3',
          dialogueText:
            'Before London, before Tokyo, before two billion viewers... tell me who you really are.',
          tellHint:
            'Faint silhouettes shift behind the one-way obsidian mirror as your Meridian Diplomatic Passport awaits engraving.',
          requiresNameAndOriginInput: true,
          currentChallengerName: hasName ? name : '',
          hasRegisteredName: hasName,
          selectedOrigin: this.selectedOrigin,
          originOptions: origins,
          activeQuestion: null,
          leakedHintRevealed: false,
          stampedPersona: null,
        };

      case 'VETTING_Q1_SPIN':
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/vetting_chamber_room.glb',
          stageLightingMode: 'INTERVIEW',
          speakerId: 'vance',
          speakerName: 'Julian Vance',
          speakerRole: 'Chief Adjudicator · The Meridian',
          expression: 'neutral',
          portraitUrl: getPortraitUrl('vance', 'neutral'),
          voiceUrl: 'assets/voice/vance_intro_2.mp3',
          dialogueText: this.passport.interpolateText(
            ORIGIN_DEFINITIONS[this.selectedOrigin].vanceReaction
          ),
          tellHint: 'The Veritas Prism rises from the brushed-steel table — Question 1 of 4.',
          requiresNameAndOriginInput: false,
          currentChallengerName: name,
          hasRegisteredName: hasName,
          selectedOrigin: this.selectedOrigin,
          originOptions: origins,
          activeQuestion: GENEVA_VETTING_QUESTIONS[0],
          leakedHintRevealed: false,
          stampedPersona: null,
        };

      case 'MIRROR_LEAK_CHOICE':
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/vetting_chamber_room.glb',
          stageLightingMode: 'INTERVIEW',
          speakerId: 'teo',
          speakerName: 'One-Way Obsidian Mirror // Teo’s Tablet',
          speakerRole: 'Observation Deck Reflection',
          expression: 'intense',
          portraitUrl: getPortraitUrl('teo', 'intense'),
          voiceUrl: 'assets/voice/teo_whisper.mp3',
          dialogueText:
            'A shadow shifts behind the one-way glass—rogue producer Teo’s glowing tablet reflects a partial Question 2 clue across your steel table!',
          tellHint: 'Vance has not looked up from his pocket astrolabe yet. Nobody knows you saw it.',
          requiresNameAndOriginInput: false,
          currentChallengerName: name,
          hasRegisteredName: hasName,
          selectedOrigin: this.selectedOrigin,
          originOptions: origins,
          mirrorLeakChoices: [...MIRROR_LEAK_OPTIONS],
          activeQuestion: null,
          leakedHintRevealed: false,
          stampedPersona: null,
        };

      case 'VETTING_Q2_PEEL':
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/vetting_chamber_room.glb',
          stageLightingMode: 'INTERVIEW',
          speakerId: 'vance',
          speakerName: 'Julian Vance',
          speakerRole: 'Chief Adjudicator · The Meridian',
          expression: this.mirrorChoice === 'FLAGGED' ? 'intense' : 'neutral',
          portraitUrl: getPortraitUrl(
            'vance',
            this.mirrorChoice === 'FLAGGED' ? 'intense' : 'neutral'
          ),
          voiceUrl:
            this.mirrorChoice === 'FLAGGED'
              ? 'assets/voice/vance_leak_react.mp3'
              : 'assets/voice/vance_peel.mp3',
          dialogueText:
            this.mirrorChoice === 'FLAGGED'
              ? `Sharp eyes, ${name}. Security will seal the glass. Now—let's test surgical deduction.`
              : this.mirrorChoice === 'EXPLOITED'
                ? `Ambitious instincts, ${name}. Remember: every shortcut leaves a trace in the glass.`
                : `Unflinching focus, ${name}. Pull the Brass Crown if you wish to trade multiplier for a Holographic Clue.`,
          tellHint:
            this.mirrorChoice === 'CLEAN'
              ? 'Vance taps his silver stylus twice beside his right ear—quiet respect.'
              : 'Question 2 of 4 — Depth Peel & Clue Core.',
          requiresNameAndOriginInput: false,
          currentChallengerName: name,
          hasRegisteredName: hasName,
          selectedOrigin: this.selectedOrigin,
          originOptions: origins,
          activeQuestion: GENEVA_VETTING_QUESTIONS[1],
          leakedHintRevealed: this.leakedHintRevealed,
          stampedPersona: null,
        };

      case 'SPOTLIGHT_MANIFESTO':
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/vetting_chamber_room.glb',
          stageLightingMode: 'TWIST_FRACTURE',
          speakerId: 'vance',
          speakerName: 'Julian Vance',
          speakerRole: 'Chief Adjudicator · The Meridian',
          expression: 'intense',
          portraitUrl: getPortraitUrl('vance', 'intense'),
          voiceUrl: 'assets/voice/vance_manifesto.mp3',
          dialogueText: `Overhead shutters lock! Tell me, ${name}: when you hold the sharpest mind on Earth, who does it answer to—the World Council, the global public, or only yourself?`,
          tellHint:
            'Broadcast spotlights flare into Twist Fracture crimson—recording your oath onto the Charter.',
          requiresNameAndOriginInput: false,
          currentChallengerName: name,
          hasRegisteredName: hasName,
          selectedOrigin: this.selectedOrigin,
          originOptions: origins,
          manifestoChoices: [...MANIFESTO_OPTIONS],
          activeQuestion: null,
          leakedHintRevealed: false,
          stampedPersona: null,
        };

      case 'VETTING_Q3_OVERCLOCK':
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/vetting_chamber_room.glb',
          stageLightingMode: 'TWIST_FRACTURE',
          speakerId: 'vance',
          speakerName: 'Julian Vance',
          speakerRole: 'Chief Adjudicator · The Meridian',
          expression: 'intense',
          portraitUrl: getPortraitUrl('vance', 'intense'),
          voiceUrl: 'assets/voice/vance_overclock_charge.mp3',
          dialogueText: `Prove that conviction under pressure, ${name}. Press and hold to Overclock the Prism!`,
          tellHint: 'Question 3 of 4 — Twist Fracture Spotlight & Hold-to-Overclock (up to 6.0x).',
          requiresNameAndOriginInput: false,
          currentChallengerName: name,
          hasRegisteredName: hasName,
          selectedOrigin: this.selectedOrigin,
          originOptions: origins,
          activeQuestion: GENEVA_VETTING_QUESTIONS[2],
          leakedHintRevealed: false,
          stampedPersona: null,
        };

      case 'VETTING_Q4_CALIBRATOR':
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/vetting_chamber_room.glb',
          stageLightingMode: 'BROADCAST',
          speakerId: 'vance',
          speakerName: 'Julian Vance',
          speakerRole: 'Chief Adjudicator · The Meridian',
          expression: 'neutral',
          portraitUrl: getPortraitUrl('vance', 'neutral'),
          voiceUrl: 'assets/voice/vance_intro_4.mp3',
          dialogueText: `Final vetting instrument, ${name}: the Meridian Brass Astrolabe. Sculpt your own margin of error.`,
          tellHint: 'Question 4 of 4 — Calibrator Astrolabe & Precision Tolerance Cone.',
          requiresNameAndOriginInput: false,
          currentChallengerName: name,
          hasRegisteredName: hasName,
          selectedOrigin: this.selectedOrigin,
          originOptions: origins,
          activeQuestion: GENEVA_VETTING_QUESTIONS[3],
          leakedHintRevealed: false,
          stampedPersona: null,
        };

      case 'PASSPORT_STAMP_PAYOFF': {
        const persona = this.stampedPersona;
        const verbatimPersonaSpeech =
          persona?.id === 'MAVERICK'
            ? 'High risk, fearless Overclocks, zero hesitation. Your Meridian Passport is stamped: The Maverick.'
            : persona?.id === 'DIPLOMAT'
              ? 'Measured judgment, strategic alliances, composure under fire. Your Meridian Passport is stamped: The Diplomat.'
              : persona?.id === 'ANALYST'
                ? 'Methodical clue-peeling, surgical precision, zero wasted motion. Your Meridian Passport is stamped: The Analyst.'
                : 'Cold instinct at three-point-zero, razor accuracy, unshakable nerve. Your Meridian Passport is stamped: The Prodigy.';
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/vetting_chamber_room.glb',
          stageLightingMode: 'GOLD_RESONANCE',
          speakerId: 'vance',
          speakerName: 'Julian Vance',
          speakerRole: 'Chief Adjudicator · The Meridian',
          expression: 'smirk',
          portraitUrl: getPortraitUrl('vance', 'smirk'),
          voiceUrl: persona?.voiceUrl ?? 'assets/voice/vance_stamp.mp3',
          dialogueText: verbatimPersonaSpeech,
          tellHint: `Crimson diplomatic wax seals ${name}'s Geneva Visa — 12-Domain Mastery Radar & Brass Astrolabe unlocked!`,
          requiresNameAndOriginInput: false,
          currentChallengerName: name,
          hasRegisteredName: hasName,
          selectedOrigin: this.selectedOrigin,
          originOptions: origins,
          activeQuestion: null,
          leakedHintRevealed: false,
          stampedPersona: persona,
        };
      }

      case 'ACT1_FLIGHT_FORK':
      case 'COMPLETED':
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/meridian_world_globe.glb',
          stageLightingMode: 'BROADCAST',
          speakerId: 'vance',
          speakerName: 'Julian Vance',
          speakerRole: 'Chief Adjudicator · The Meridian',
          expression: 'intense',
          portraitUrl: getPortraitUrl('vance', 'intense'),
          voiceUrl: 'assets/voice/vance_victory.mp3',
          dialogueText: `London wants ${name} first. Tokyo wants ${name} first. Spin the World Globe and choose your Act I departure—whichever city waits will study your tape.`,
          tellHint: 'Vance touches his left cufflink as golden flight arcs ignite toward London and Tokyo.',
          requiresNameAndOriginInput: false,
          currentChallengerName: name,
          hasRegisteredName: hasName,
          selectedOrigin: this.selectedOrigin,
          originOptions: origins,
          flightForkChoices: [...FLIGHT_FORK_OPTIONS],
          activeQuestion: null,
          leakedHintRevealed: false,
          stampedPersona: this.stampedPersona,
        };
    }
  }
}
