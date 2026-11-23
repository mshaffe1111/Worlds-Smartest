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
      'Three weeks ago, legendary puzzle-maker Dr. Mara Sato passed away—leaving one final riddle tucked inside Sunday papers and public archives. Four hundred thousand people tried it, and your 2:14 AM answer earned a seat on Lake Geneva.',
  },
  {
    id: 'cutscene_act0_2',
    speakerId: 'vance',
    speakerName: 'Julian Vance',
    expression: 'intense',
    portraitUrl: getPortraitUrl('vance', 'intense'),
    voiceUrl: 'assets/voice/cutscene_act0_2.mp3',
    subtitle:
      "I'm Julian Vance, Mara's longtime co-creator. Rather than hand her hundred-million-dollar Meridian Archive to a committee, she built an eight-city tournament—betting everything on one agile, curious mind.",
  },
  {
    id: 'cutscene_act0_3',
    speakerId: 'teo',
    speakerName: 'Mateo "Teo" Rojas',
    expression: 'neutral',
    portraitUrl: getPortraitUrl('teo', 'neutral'),
    voiceUrl: 'assets/voice/cutscene_act0_3.mp3',
    subtitle:
      "Relax, the Geneva warmup is the fun part. I'm Teo—audio engineer and official espresso smuggler. Mara built these first four questions just to see how you think—though... weird. Her private terminal just woke up the second you walked in.",
  },
];

/**
 * 4 Joyful, Confidence-Building Middle-School Warmup Questions teaching 1 clear mechanic per question!
 */
const GENEVA_VETTING_QUESTIONS: readonly PrologueQuestionCard[] = [
  {
    questionIndex: 1,
    qid: 1,
    domainId: 2, // Geography
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      "Built for the 1889 World's Fair, which iron landmark towers over Paris along the River Seine?",
    answerCorrect: 'Eiffel Tower',
    facets: ['Big Ben', 'Eiffel Tower', 'Colosseum', 'Brandenburg Gate'],
    correctFacetIndex: 1,
    clues: [
      "Named after French engineer Gustave Eiffel, it was the world's tallest structure for 41 years.",
      'Its famous iron lattice rises above the Champ de Mars in the heart of Paris.',
    ],
    whyExplanation:
      "Gustave Eiffel's wrought-iron tower opened for the 1889 Paris World's Fair and was originally meant to stand for just twenty years.",
    timeTotalSec: 35,
    coachPrompt:
      'STEP 1: PICK & LOCK — Tap your answer below and click LOCK ANSWER (+300 pts)!',
    taughtVerb: 'SPIN',
    stageLightingMode: 'INTERVIEW',
    peelEnabled: false,
    overclockHighlighted: false,
  },
  {
    questionIndex: 2,
    qid: 2,
    domainId: 1, // Science & Nature
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Famous for its dazzling icy rings, which giant planet is the sixth from the Sun?',
    answerCorrect: 'Saturn',
    facets: ['Mars', 'Venus', 'Saturn', 'Mercury'],
    correctFacetIndex: 2,
    clues: [
      'Its sparkling rings are made of billions of chunks of ice and rock—and it is less dense than water.',
      'Named for the Roman god of agriculture, and orbited by the giant moon Titan.',
    ],
    whyExplanation:
      'Saturn is the sixth planet from the Sun; its sprawling icy rings span roughly 282,000 kilometers yet are often thinner than a city block.',
    timeTotalSec: 35,
    coachPrompt:
      'STEP 2: USE A HINT — Tap HINT (2x) if you ever want an extra clue, or 50/50 to cross out two wrong choices!',
    taughtVerb: 'PEEL',
    stageLightingMode: 'INTERVIEW',
    peelEnabled: true,
    overclockHighlighted: false,
    leakedHintText:
      'MARA\'S MARGIN NOTE (02:14 AM): "...sixth planet from the Sun, ringed in ice—and ask Julian why 2019\'s winner never got his trophy..."',
  },
  {
    questionIndex: 3,
    qid: 3,
    domainId: 3, // Arts & Culture
    archetype: 'SIGHTLINE_LOCK',
    prompt:
      'Painted by Leonardo da Vinci and displayed in the Louvre, which portrait is famous for her mysterious smile?',
    answerCorrect: 'Mona Lisa',
    facets: ['Starry Night', 'Mona Lisa', 'Girl with a Pearl Earring', 'The Scream'],
    correctFacetIndex: 1,
    clues: [
      'Leonardo da Vinci painted it on a poplar wood panel in Florence during the early 1500s.',
      'In Italian it is known as La Gioconda—drawn after Lisa Gherardini.',
    ],
    whyExplanation:
      'Leonardo da Vinci painted the Mona Lisa in the early 1500s using soft smoky sfumato shading that makes her smile seem to shift as you move.',
    timeTotalSec: 35,
    coachPrompt:
      "STEP 3: 2x DOUBLE DOWN — When you're sure you know it, tap 2x DOUBLE DOWN to double your points to +600!",
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
    prompt: 'In what year did Neil Armstrong and Apollo 11 first walk on the Moon?',
    answerCorrect: '1969 CE',
    clues: [
      'Occurred at the close of the 1960s Space Race, fulfilling JFK’s decade-end pledge.',
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
      'Apollo 11 landed on the Moon on July 20, 1969, watched live on television by an estimated 650 million people around the globe.',
    timeTotalSec: 35,
    coachPrompt:
      'STEP 4: CLOSEST YEAR — Drag the slider (or tap -1 / +1) to 1969. Even a close guess scores points!',
    taughtVerb: 'CALIBRATE',
    stageLightingMode: 'BROADCAST',
    peelEnabled: false,
    overclockHighlighted: true,
  },
];

const MIRROR_LEAK_OPTIONS: readonly PrologueChoiceOption<MirrorLeakOptionId>[] = [
  {
    id: 'EXPLOIT_LEAK',
    label: "Read Mara's Margin Note",
    subtext:
      'Study the timestamped hint Dr. Sato left on her studio monitor—keeping your full 300-point bonus intact.',
    impactBadge: '+Curiosity · Reveals Mara’s Clue · Bold Move',
    tone: 'crimson',
  },
  {
    id: 'FLAG_BREACH',
    label: 'Point It Out to Julian',
    subtext:
      "Call Julian over immediately so Chancellor Lindqvist's board can't claim you took an unfair shortcut.",
    impactBadge: '+18 Board Favor · +15 Integrity',
    tone: 'gold',
  },
  {
    id: 'SOLVE_CLEAN',
    label: 'Leave It Untouched & Solve Clean',
    subtext: "Close the monitor yourself and solve Mara's puzzle purely on your own wits.",
    impactBadge: '+20 Integrity · Julian & Teo Respect',
    tone: 'cyan',
  },
];

const MANIFESTO_OPTIONS: readonly PrologueChoiceOption<ManifestoOptionId>[] = [
  {
    id: 'MANIFESTO_COUNCIL',
    label: 'Trusted Institutions',
    subtext:
      '"Shared archives endure when guarded by steady stewardship, treaty law, and accountability."',
    impactBadge: '+15 Board Favor · +5 Integrity · Sovereign Nod',
    tone: 'gold',
  },
  {
    id: 'MANIFESTO_PUBLIC',
    label: 'Everyone — Open to the World',
    subtext:
      '"Mara hid her qualifier in Sunday newspapers for a reason. Truth belongs in open daylight."',
    impactBadge: '+15 Public Trust · +10 Integrity · Agora Nod',
    tone: 'cyan',
  },
  {
    id: 'MANIFESTO_SELF',
    label: 'An Independent Mind',
    subtext:
      '"Committees hedge and crowds panic. One sharp, unbought steward keeps the record honest."',
    impactBadge: '+Ambition · -10 Integrity · Horizon Nod',
    tone: 'crimson',
  },
];

const FLIGHT_FORK_OPTIONS: readonly PrologueChoiceOption<FlightForkDestination>[] = [
  {
    id: 'GB',
    label: 'Fly to London · The Sovereign Rotunda',
    subtext:
      'Meet sharp acoustic engineer Nadia Al-Mansoor—and a sealed 2019 archive drawer beneath the glass floor.',
    impactBadge: 'LONDON · History, Arts & Mystery · Easy+',
    tone: 'gold',
  },
  {
    id: 'JP',
    label: 'Fly to Tokyo · Horizon Sky Pavilion',
    subtext:
      '70 floors above Shibuya against witty probability trader Soren "Echo" Kael—and a curious signal anomaly.',
    impactBadge: 'TOKYO · Science, Logic & Tech · Medium',
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
      -1.45,
      qCard.qid
    );
    if (!this.recordedForgeQids.has(qCard.qid)) {
      this.recordedForgeQids.add(qCard.qid);
      forgeEngine.recordQuestionOutcome({
        qid: qCard.qid,
        l0Domain: qCard.domainId,
        archetype: qCard.archetype,
        irtB: -1.45,
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
          speakerRole: 'Host & Co-Creator · The Meridian',
          expression: 'neutral',
          portraitUrl: getPortraitUrl('vance', 'neutral'),
          voiceUrl: 'assets/voice/cutscene_act0_1.mp3',
          dialogueText: GENEVA_SUMMONS_SLIDES[0].subtitle,
          tellHint: 'Lake Geneva · Dr. Mara Sato’s private study, three weeks after her will was read.',
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
          speakerRole: 'Host & Co-Creator · The Meridian',
          expression: 'neutral',
          portraitUrl: getPortraitUrl('vance', 'neutral'),
          voiceUrl: 'assets/voice/vance_intro_1.mp3',
          dialogueText:
            "Welcome to Dr. Mara Sato's study. You solved her Sunday cipher from home—so grab a chair, take a breath, and let's start easy.",
          tellHint:
            'Julian smiles over two steaming espressos—though his thumb briefly brushes his left brass cufflink beside a 2019 notebook.',
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
          speakerRole: 'Host & Co-Creator · The Meridian',
          expression: 'intense',
          portraitUrl: getPortraitUrl('vance', 'intense'),
          voiceUrl: 'assets/voice/vance_intro_3.mp3',
          dialogueText:
            'Before London, before Tokyo, before the board tries to box you into a biography—tell me your name, and how you like to think.',
          tellHint:
            'Dr. Sato’s brass engraving press rests beside a fresh Meridian Passport, waiting for your signature.',
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
          speakerRole: 'Host & Co-Creator · The Meridian',
          expression: 'neutral',
          portraitUrl: getPortraitUrl('vance', 'neutral'),
          voiceUrl: 'assets/voice/vance_intro_2.mp3',
          dialogueText: this.passport.interpolateText(
            ORIGIN_DEFINITIONS[this.selectedOrigin].vanceReaction
          ),
          tellHint: 'Warmup 1 of 4 — Tap your answer below and click LOCK ANSWER.',
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
          speakerName: 'Mateo "Teo" Rojas',
          speakerRole: 'Lead Audio Engineer · Mara Sato Studio',
          expression: 'neutral',
          portraitUrl: getPortraitUrl('teo', 'neutral'),
          voiceUrl: 'assets/voice/teo_whisper.mp3',
          dialogueText:
            "Whoa—hang on. Mara's desk monitor just flashed an old margin note from the night she died, right next to Question Two. Looks like she left a clue... and a timestamp.",
          tellHint:
            'Julian is pouring coffee across the study. On the glass monitor beside you, Mara’s handwritten note glows faintly.',
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
          speakerRole: 'Host & Co-Creator · The Meridian',
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
              ? `Well spotted, ${name}. Mara hated shortcuts almost as much as she loved leaving breadcrumbs in the margins. Let's keep going.`
              : this.mirrorChoice === 'EXPLOITED'
                ? `Curious instincts, ${name}. Mara wrote that note for someone observant—just remember, Lindqvist's board watches every log.`
                : `Classy move, ${name}. Whenever a question gets tricky later, tap Hint or 50/50—no shame in checking the clues.`,
          tellHint:
            this.mirrorChoice === 'CLEAN'
              ? 'Julian taps his silver pen twice beside his right ear—genuinely delighted.'
              : 'Warmup 2 of 4 — Try Hint (2x) or 50/50 anytime you want an extra clue.',
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
          speakerRole: 'Host & Co-Creator · The Meridian',
          expression: 'intense',
          portraitUrl: getPortraitUrl('vance', 'intense'),
          voiceUrl: 'assets/voice/vance_manifesto.mp3',
          dialogueText: `Between us, ${name}—if you win Mara's archive and a hundred million dollars, who should knowledge answer to? Institutions, the public, or one independent mind?`,
          tellHint:
            'The study lamps dim to warm amber as Mara’s brass charter recorder clicks softly to life.',
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
          speakerRole: 'Host & Co-Creator · The Meridian',
          expression: 'intense',
          portraitUrl: getPortraitUrl('vance', 'intense'),
          voiceUrl: 'assets/voice/vance_overclock_charge.mp3',
          dialogueText: `Let's put a little spice on Question Three, ${name}. When you're sure you know it, tap 2x Double Down to double your points!`,
          tellHint: 'Warmup 3 of 4 — Tap 2x DOUBLE DOWN when you’re sure for +600 pts!',
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
          speakerRole: 'Host & Co-Creator · The Meridian',
          expression: 'neutral',
          portraitUrl: getPortraitUrl('vance', 'neutral'),
          voiceUrl: 'assets/voice/vance_intro_4.mp3',
          dialogueText: `Last warmup, ${name}—Mara's favorite brass toy, the Closest-Year Dial. Even a close estimate scores points, so trust your gut.`,
          tellHint: 'Warmup 4 of 4 — Drag the slider or tap -1 / +1 to pick the year.',
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
            ? 'Fearless double-downs, sharp instinct, zero hesitation. Mara would have loved you. Your Meridian Passport is stamped: The Maverick.'
            : persona?.id === 'DIPLOMAT'
              ? 'Warm composure, clever diplomacy, calm under the lights. Mara would have loved you. Your Meridian Passport is stamped: The Diplomat.'
              : persona?.id === 'ANALYST'
                ? 'Patient deduction, smart use of clues, zero wasted motion. Mara would have loved you. Your Meridian Passport is stamped: The Analyst.'
                : 'Effortless precision, razor speed, unshakable poise. Mara would have loved you. Your Meridian Passport is stamped: The Prodigy.';
        return {
          phase: this.phase,
          venueId: 'ch',
          venueGlbUrl: 'assets/aaa_models/vetting_chamber_room.glb',
          stageLightingMode: 'GOLD_RESONANCE',
          speakerId: 'vance',
          speakerName: 'Julian Vance',
          speakerRole: 'Host & Co-Creator · The Meridian',
          expression: 'smirk',
          portraitUrl: getPortraitUrl('vance', 'smirk'),
          voiceUrl: persona?.voiceUrl ?? 'assets/voice/vance_stamp.mp3',
          dialogueText: verbatimPersonaSpeech,
          tellHint: `Warm crimson wax seals ${name}'s Geneva Visa — 12-Domain Radar & Mara's Brass Astrolabe unlocked!`,
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
          speakerRole: 'Host & Co-Creator · The Meridian',
          expression: 'intense',
          portraitUrl: getPortraitUrl('vance', 'intense'),
          voiceUrl: 'assets/voice/vance_stamp.mp3',
          dialogueText: `Warmup cleared, ${name}! Geneva's easy Stage 1 rounds stay open on your map anytime—now choose your first international flight: London with Nadia, or Tokyo with Soren.`,
          tellHint:
            'Julian taps the brass globe as golden routes light up toward London and Tokyo—while Geneva stays open for extra warmup.',
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
