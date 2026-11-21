import type {
  BondLevel,
  CampaignNodeMeta,
  CharacterId,
  CharacterMood,
  DialogueDisplay,
  EndingId,
  FactionId,
  GhostOpponentProfile,
  HeroRelicId,
  LightingState,
  MusicLayer,
  OriginId,
  PerkId,
  PersonaId,
  PrismSkinId,
  StoryChoice,
  StoryStateSnapshot,
  VenueId,
} from '../types/game';
import type { Act3BranchId, BetrayerId, BondNpcId } from './StoryState';

export type PlayableCampaignNodeId =
  | 'ch_prologue'
  | 'gb_london'
  | 'gb_black_salon'
  | 'jp_tokyo'
  | 'br_rio'
  | 'eg_cairo'
  | 'is_reykjavik'
  | 'sg_singapore'
  | 'global_apex';

export type DialogueSequenceId =
  | 'prologue_intro'
  | 'prologue_manifesto'
  | 'prologue_outro'
  | 'london_intro'
  | 'london_outro'
  | 'black_salon_intro'
  | 'black_salon_outro'
  | 'tokyo_intro'
  | 'tokyo_outro'
  | 'rio_intro'
  | 'rio_outro'
  | 'cairo_intro'
  | 'cairo_outro'
  | 'reykjavik_intro_whistle'
  | 'reykjavik_intro_insider'
  | 'reykjavik_outro'
  | 'singapore_intro_nadia'
  | 'singapore_intro_teo'
  | 'singapore_intro_soren'
  | 'singapore_outro'
  | 'apex_intro'
  | 'apex_mid_gambit'
  | 'apex_finale_choice';

export interface StoryChoiceEffects {
  integrity?: number;
  publicTrust?: number;
  councilFavor?: number;
  bonds?: Partial<Record<BondNpcId, number>>;
  setBonds?: Partial<Record<BondNpcId, BondLevel>>;
  flags?: Record<string, boolean | string>;
  origin?: OriginId;
  unlockPerk?: PerkId;
  autoEquipPerk?: boolean;
  unlockSkin?: PrismSkinId;
  autoEquipSkin?: boolean;
  unlockBlackSalon?: boolean;
  act3Branch?: Act3BranchId;
  betrayer?: BetrayerId;
  endingAwarded?: EndingId;
  toast?: string;
}

export interface CampaignChoiceDef extends StoryChoice {
  effects?: StoryChoiceEffects;
  nextBeatId?: string;
}

export interface DialogueContext {
  story: StoryStateSnapshot;
  lastMatchWon?: boolean;
  awardedPersona?: PersonaId | null;
  awardedPerkName?: string | null;
  betrayer?: BetrayerId | null;
  endingAwarded?: EndingId | null;
}

export interface DialogueBeatDef {
  id: string;
  sceneTitle: string;
  locationLabel: string;
  venue: VenueId;
  lightingState: LightingState;
  musicLayer: MusicLayer;
  speakerId: CharacterId;
  speakerName: string;
  speakerRole: string;
  mood: CharacterMood;
  text: string;
  dynamicText?: (ctx: DialogueContext) => string;
  tellHint?: string;
  dynamicTellHint?: (ctx: DialogueContext) => string;
  accentTone?: 'gold' | 'crimson' | 'cyan';
  continueLabel?: string;
  sting?: 'SUMMONS' | 'CHOICE' | 'TWIST' | 'STAMP' | 'VICTORY';
  choices?: CampaignChoiceDef[];
  dynamicChoices?: (ctx: DialogueContext) => CampaignChoiceDef[];
  nextBeatId?: string;
}

export interface DialogueSequenceDef {
  id: DialogueSequenceId;
  beats: DialogueBeatDef[];
}

export interface EthicalInterruptChoiceDef extends StoryChoice {
  effects: StoryChoiceEffects;
  revealTier2Free?: boolean;
  toast: string;
}

export const PROLOGUE_TUTORIAL_HINTS: readonly string[] = [
  'SWIPE the 3D Prism to align your answer in the Gold Beam, then tap LOCK.',
  'Tap or swipe down on PEEL to open obsidian shutters for a 3D holographic clue!',
  'PRESS & HOLD LOCK to charge Conviction Overclock (up to 2x!), or quick-tap for Safe Lock.',
  'Drag left/right to aim the Astrolabe needle; drag up/down to pinch the Tolerance Cone for 3.5x Bullseye!',
];

export const PROLOGUE_ETHICAL_INTERRUPT = {
  triggerElapsedSec: 3.5,
  speaker: "OBSIDIAN MIRROR // TEO'S TABLET REFLECTION",
  message:
    "A silhouette shifts behind the one-way glass. Rogue producer Teo's glowing tablet reflects cleanly across the steel table—flashing the Tier-2 clue without cracking your 3.0x Prism seal.",
  choices: [
    {
      id: 'eth_exploit',
      label: 'Exploit the Reflection',
      subtext: "Read Teo's reflected Tier-2 clue for free while keeping your 3.0x multiplier.",
      tag: '-18 Integrity · Free Clue',
      tagTone: 'crimson' as const,
      revealTier2Free: true,
      effects: {
        integrity: -18,
        flags: { prologue_leak: 'EXPLOITED' },
      },
      toast: 'Reflected Tier-2 Clue pocketed (-18 Integrity).',
    },
    {
      id: 'eth_flag',
      label: 'Flag Leak to Vance',
      subtext: 'Tap the glass immediately and expose the observation-room breach.',
      tag: '+15 Integrity · +18 Council',
      tagTone: 'gold' as const,
      effects: {
        integrity: 15,
        councilFavor: 18,
        bonds: { lindqvist: 1 },
        flags: { prologue_leak: 'FLAGGED' },
      },
      toast: 'Breach flagged — Vance taps his stylus in sharp approval.',
    },
    {
      id: 'eth_ignore',
      label: 'Ignore & Solve Cleanly',
      subtext: 'Look away from the glass and earn the answer on pure deduction.',
      tag: '+20 Integrity · Vance & Teo Respect',
      tagTone: 'cyan' as const,
      effects: {
        integrity: 20,
        publicTrust: 8,
        bonds: { teo: 1 },
        flags: { prologue_leak: 'CLEAN' },
      },
      toast: 'Clean discipline — both Vance and Teo took quiet note.',
    },
  ] satisfies EthicalInterruptChoiceDef[],
};

export interface PersonaComputationInput {
  story: StoryStateSnapshot;
  correctCount: number;
  totalCount: number;
  overclockAttempts: number;
  overclockHits: number;
  averagePeelTier: number;
  bullseyeHit: boolean;
}

export interface PersonaResult {
  persona: PersonaId;
  startingPerk: PerkId;
  title: string;
  dossierNote: string;
}

export function computeProloguePersona(input: PersonaComputationInput): PersonaResult {
  const { story, correctCount, overclockAttempts, overclockHits, averagePeelTier, bullseyeHit } =
    input;
  const manifesto = story.flags.manifesto;

  if (
    overclockAttempts >= 2 ||
    (overclockHits >= 1 && story.origin === 'STRATEGIST') ||
    manifesto === 'SELF' ||
    story.axisIntegrity <= -12
  ) {
    return {
      persona: 'MAVERICK',
      startingPerk: 'MAVERICK_GAMBIT',
      title: 'The Maverick',
      dossierNote:
        "Wagers conviction under floodlights. Unlocks Maverick's Gambit (+30% Overclock speed).",
    };
  }

  if (
    correctCount >= 3 &&
    averagePeelTier <= 1.35 &&
    (bullseyeHit || story.flags.prologue_leak === 'CLEAN')
  ) {
    return {
      persona: 'PRODIGY',
      startingPerk: story.axisIntegrity >= 10 ? 'DIPLOMAT_COMPOSURE' : 'MAVERICK_GAMBIT',
      title: 'The Prodigy',
      dossierNote:
        'Cold-instinct precision under Alpine scrutiny. Unlocks your signature Circuit Perk.',
    };
  }

  if (averagePeelTier >= 1.55 || story.origin === 'ACADEMIC') {
    return {
      persona: 'ANALYST',
      startingPerk: 'DIPLOMAT_COMPOSURE',
      title: 'The Analyst',
      dossierNote:
        "Methodical, relentless pattern synthesis. Unlocks Diplomat's Composure (+2.0s Chrono-Ring).",
    };
  }

  return {
    persona: 'DIPLOMAT',
    startingPerk: 'DIPLOMAT_COMPOSURE',
    title: 'The Diplomat',
    dossierNote:
      "Unshakeable poise under World Council eyes. Unlocks Diplomat's Composure (+2.0s Chrono-Ring).",
  };
}

export function computeSingaporeBetrayer(story: StoryStateSnapshot): BetrayerId {
  if (
    story.bonds.nadia === 'NEMESIS' ||
    (story.bonds.nadia === 'RIVAL' && story.axisIntegrity < 0)
  ) {
    return 'nadia';
  }
  if (story.axisIntegrity < -15) {
    return 'teo';
  }
  return 'soren';
}

export function isSecretArchitectEndingUnlocked(story: StoryStateSnapshot): boolean {
  const hasStrongAlly = story.bonds.nadia === 'ALLIED' || story.bonds.teo === 'ALLIED';
  const hasPublicMandate = story.publicTrust >= 55 || Boolean(story.blackSalonUnlocked);
  return story.axisIntegrity >= 15 && hasStrongAlly && hasPublicMandate;
}

export const PERSONA_LABELS: Record<PersonaId, { name: string; motto: string }> = {
  MAVERICK: {
    name: 'THE MAVERICK',
    motto: 'Bets everything on razor conviction.',
  },
  DIPLOMAT: {
    name: 'THE DIPLOMAT',
    motto: 'Reads the room three moves ahead.',
  },
  ANALYST: {
    name: 'THE ANALYST',
    motto: 'Peels back illusion to exposed brass.',
  },
  PRODIGY: {
    name: 'THE PRODIGY',
    motto: 'Cold instinct before the clock breathes.',
  },
};

export const RELIC_METADATA: Record<
  HeroRelicId,
  { name: string; venueLabel: string; lore: string }
> = {
  meridian_astrolabe: {
    name: 'Meridian Brass Astrolabe',
    venueLabel: 'Geneva · The Vetting Chamber',
    lore: "Julian Vance's precision gimbal—calibrated to measure risk margin, not merely memory.",
  },
  armillary_orrery: {
    name: 'Locked Armillary Orrery',
    venueLabel: 'London · The Sovereign Rotunda',
    lore: 'An eccentric bronze sphere engraved with a hidden 2019 notch: "TRIAL 00 — AL-MANSOOR."',
  },
  origami_prism: {
    name: 'Folding Origami Prism',
    venueLabel: 'Tokyo · Shinkansen Sky Pavilion',
    lore: 'Iridescent obsidian facets shielding a laser-etched Cairo coordinate micro-key.',
  },
  emerald_sphere: {
    name: 'Emerald Resonance Sphere',
    venueLabel: 'Rio de Janeiro · Botanical Glass Canopy',
    lore: "Niemeyer ceramic arches cradling a resonant emerald crystal tuned to Rio's 10,000-voice canopy.",
  },
  cipher_box: {
    name: 'Meridian Zero Cipher Box',
    venueLabel: 'Cairo / Giza · Solar Acoustic Hall',
    lore: 'Sandstone-and-obsidian cryptex containing Tariq Al-Mansoor\'s scrubbed 2019 Trial 00 dossier.',
  },
  cryo_relay: {
    name: 'Aurora Cryo-Core Relay',
    venueLabel: 'Reykjavik · Geothermal Basalt Caldera',
    lore: "Volcanic basalt prism linking Julian Vance's Geneva desk to Tariq's subterranean safehouse.",
  },
  council_seal: {
    name: 'Fractured Council Seal',
    venueLabel: 'Singapore · Diplomatic Sky-Bridge & Core',
    lore: 'Tripartite Sovereign-Horizon-Agora platinum seal—shattered the night Article IX fired.',
  },
  master_ledger: {
    name: 'The Master Ledger Core',
    venueLabel: "Int'l Waters · The Apex Forum",
    lore: 'Planetary truth monolith unlocked live before two billion witnesses at the Apex Forum.',
  },
};

export const SKIN_METADATA: Record<PrismSkinId, { name: string; unlockHint: string }> = {
  OBSIDIAN_BRASS: {
    name: 'Obsidian & Champagne Brass',
    unlockHint: 'Standard Meridian Issue.',
  },
  EMERALD_SOVEREIGN: {
    name: 'Emerald Sovereign',
    unlockHint: 'Complete Stage 3: Rio de Janeiro to unlock.',
  },
  DAMASCUS_TITANIUM: {
    name: 'Damascus Titanium',
    unlockHint: 'Choose the Insider Path in Cairo (Stage 4) to unlock.',
  },
  BLACK_SALON_CRIMSON: {
    name: 'Black Salon Crimson',
    unlockHint: 'Broadcast the Cairo Dossier OR win the Black Salon 16-Player Bracket.',
  },
  KYOTO_KINTSUGI: {
    name: 'Kyoto Kintsugi Gold',
    unlockHint: 'Complete Stage 7: The Apex Forum Grand Finale to unlock.',
  },
};

export const ENDING_METADATA: Record<
  EndingId,
  { title: string; badge: string; subtitle: string }
> = {
  SOVEREIGN_ARBITER: {
    title: 'ENDING I · THE SOVEREIGN ARBITER',
    badge: 'REFORMED THE LEDGER',
    subtitle:
      'You claimed the Arbiter\'s chair cleanly, invoked the Geneva Charter to purge rogue bloc chairs, and safeguarded The Ledger under transparent treaty law.',
  },
  OPEN_COMMONS: {
    title: 'ENDING II · THE OPEN COMMONS',
    badge: 'OPEN-SOURCED TO 2 BILLION',
    subtitle:
      'You triggered Tariq and Teo\'s master override live on air—forfeiting the $100M crown to hand humanity\'s suppressed planetary archive directly to eight billion citizens.',
  },
  KINGMAKER: {
    title: 'ENDING III · THE KINGMAKER',
    badge: 'SOVEREIGNTY SEIZED',
    subtitle:
      'You outplayed Julian Vance and seized unilateral command atop the glass spire—never noticing Vance calmly opening a fresh file stamped "CANDIDATE #02 — 99.6% MATCH."',
  },
  ARCHITECT_SUCCESSION: {
    title: 'SECRET TRUE ENDING · ARCHITECT\'S SUCCESSION',
    badge: 'GLOBAL CITIZEN COUNCIL',
    subtitle:
      'Refusing unilateral power, you rewrote the Meridian Charter live before two billion witnesses—transforming World\'s Smartest into a permanent rotating Global Citizen Council.',
  },
};

export const FACTION_METADATA: Record<FactionId, { name: string; motto: string }> = {
  SOVEREIGN: {
    name: 'The Sovereign Bloc',
    motto: 'Order, Heritage & Treaty Mastery',
  },
  HORIZON: {
    name: 'The Horizon Collective',
    motto: 'Velocity, Precision & High-Wire Risk',
  },
  AGORA: {
    name: 'The Agora Coalition',
    motto: 'Open Commons, Culture & Global Empathy',
  },
};

export interface TrialsGhostDef extends GhostOpponentProfile {
  peelChance: number;
  overclockChance: number;
  speedMultiplier: number;
  venue: VenueId;
}

export const TRIALS_GHOST_CONTENDERS: readonly TrialsGhostDef[] = [
  {
    id: 'ghost_valkyrie',
    handle: '@Valkyrie_NO',
    countryCode: 'NO',
    faction: 'SOVEREIGN',
    elo: 1180,
    portraitId: 'lindqvist',
    styleTag: 'Methodical Peeler · Safe Locks',
    peelChance: 0.64,
    overclockChance: 0.22,
    speedMultiplier: 1.12,
    venue: 'GB',
  },
  {
    id: 'ghost_solaris',
    handle: '@Solaris_BR',
    countryCode: 'BR',
    faction: 'AGORA',
    elo: 1360,
    portraitId: 'teo',
    styleTag: 'Tempo Sprinter · Frequent Overclock',
    peelChance: 0.34,
    overclockChance: 0.54,
    speedMultiplier: 0.86,
    venue: 'BR',
  },
  {
    id: 'ghost_kurogane',
    handle: '@Kurogane_JP',
    countryCode: 'JP',
    faction: 'HORIZON',
    elo: 1540,
    portraitId: 'soren',
    styleTag: 'High-Wire Gambler · 0.9s Overclock',
    peelChance: 0.24,
    overclockChance: 0.72,
    speedMultiplier: 0.78,
    venue: 'JP',
  },
  {
    id: 'ghost_aleph',
    handle: '@AlephZero_EG',
    countryCode: 'EG',
    faction: 'AGORA',
    elo: 1710,
    portraitId: 'nadia',
    styleTag: 'Cold-Instinct Tier-1 Polymath',
    peelChance: 0.18,
    overclockChance: 0.48,
    speedMultiplier: 0.86,
    venue: 'EG',
  },
  {
    id: 'ghost_architect',
    handle: '@MeridianPrime_CH',
    countryCode: 'CH',
    faction: 'SOVEREIGN',
    elo: 1850,
    portraitId: 'tariq',
    styleTag: 'Apex Grandmaster · Zero-Peel Precision',
    peelChance: 0.12,
    overclockChance: 0.64,
    speedMultiplier: 0.78,
    venue: 'IS',
  },
];

export interface BlackSalonRoundConfig {
  round: 1 | 2 | 3;
  roundLabel: string;
  modifierTitle: string;
  modifierDesc: string;
  venue: VenueId;
  opponentHandle: string;
  opponentTitle: string;
  portraitId: Exclude<CharacterId, 'none'>;
  elo: number;
  questionCount: number;
  lockAllPeel: boolean;
  chronoOverrideSec?: number;
  suddenDeath: boolean;
}

export const BLACK_SALON_BRACKET_ROUNDS: readonly BlackSalonRoundConfig[] = [
  {
    round: 1,
    roundLabel: 'QUARTERFINAL · TOP 8',
    modifierTitle: 'ANALOG STATIC — PEEL JAMMED',
    modifierDesc: 'Depth Peel welded shut for both contenders. Cold-instinct deduction only.',
    venue: 'GB',
    opponentHandle: '@CipherVex_DE',
    opponentTitle: 'Black Salon Quarterfinalist · Elo 1440',
    portraitId: 'soren',
    elo: 1440,
    questionCount: 4,
    lockAllPeel: true,
    suddenDeath: false,
  },
  {
    round: 2,
    roundLabel: 'SEMIFINAL · TOP 4',
    modifierTitle: 'ALL-IN BLITZ — 11s CHRONO',
    modifierDesc: '11-second rapid Chrono-Ring on every Prism. Hesitation kills momentum.',
    venue: 'SG',
    opponentHandle: '@Oculus_SG',
    opponentTitle: 'Black Salon Semifinalist · Elo 1640',
    portraitId: 'nadia',
    elo: 1640,
    questionCount: 4,
    lockAllPeel: false,
    chronoOverrideSec: 11,
    suddenDeath: false,
  },
  {
    round: 3,
    roundLabel: 'GRAND FINAL · CHAMPIONSHIP',
    modifierTitle: 'ZERO-SHIELD SUDDEN DEATH',
    modifierDesc: 'Zero Shields · 1.5x Championship Stakes · Misses trigger -800 Crimson Fracture!',
    venue: 'IS',
    opponentHandle: '@TheBroker_AR',
    opponentTitle: 'Black Salon House Champion · Elo 1810',
    portraitId: 'teo',
    elo: 1810,
    questionCount: 5,
    lockAllPeel: false,
    suddenDeath: true,
  },
];

export const VENUE_TITLES: Record<VenueId, string> = {
  CH: 'GENEVA · THE VETTING CHAMBER',
  GB: 'LONDON · THE SOVEREIGN ROTUNDA',
  JP: 'TOKYO · SHINKANSEN SKY PAVILION',
  BR: 'RIO · THE BOTANICAL GLASS CANOPY',
  EG: 'CAIRO · THE SOLAR ACOUSTIC HALL',
  IS: 'REYKJAVIK · GEOTHERMAL BASALT CALDERA',
  SG: 'SINGAPORE · DIPLOMATIC SKY-BRIDGE',
  GLOBAL: "INT'L WATERS · THE APEX FORUM",
  LEDGER: 'THE ARCHIVE DESCENT',
  STUDIO: 'THE MERIDIAN BROADCAST DESK',
};

export const DIALOGUE_SEQUENCES: Record<DialogueSequenceId, DialogueSequenceDef> = {
  // --------------------------------------------------------------------------
  // PROLOGUE — GENEVA (CH, THE VETTING CHAMBER)
  // --------------------------------------------------------------------------
  prologue_intro: {
    id: 'prologue_intro',
    beats: [
      {
        id: 'p_summons',
        sceneTitle: 'PROLOGUE · THE SUMMONS',
        locationLabel: 'GENEVA · ALPINE VAULT 04',
        venue: 'CH',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'none',
        speakerName: 'THE MERIDIAN // ENCRYPTED SUMMONS',
        speakerRole: 'Geneva Charter of Human Stewardship',
        mood: 'NEUTRAL',
        text: '03:14 CET. A matte-black diplomatic dossier slips under your door—no stamp, no sender, just nine words laser-etched in brushed brass: "You solved what 400,000 couldn\'t. Geneva awaits."',
        tellHint: 'Glacial mist curls past brutalist slate windows high above Lake Geneva.',
        accentTone: 'gold',
        continueLabel: 'STEP INTO THE CHAMBER',
        sting: 'SUMMONS',
        nextBeatId: 'p_vance_intro',
      },
      {
        id: 'p_vance_intro',
        sceneTitle: 'THE VETTING CHAMBER',
        locationLabel: 'GENEVA · ONE-WAY MIRROR ROOM',
        venue: 'CH',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator · "The Maestro"',
        mood: 'SMIRK',
        text: "Take a seat. I'm Julian Vance. The World Council wants one unaffiliated polymath to hold a $100M endowment—and the lone human veto key over The Ledger. First, however... you survive four questions with me.",
        tellHint:
          'Vance rolls a brass pocket astrolabe across his palm, measuring your pulse instead of your credentials.',
        accentTone: 'gold',
        continueLabel: 'CONTINUE',
        nextBeatId: 'p_origin_choice',
      },
      {
        id: 'p_origin_choice',
        sceneTitle: 'PSYCHOMETRIC PROFILE',
        locationLabel: 'GENEVA · THE VETTING CHAMBER',
        venue: 'CH',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'NEUTRAL',
        text: 'Our scouting model flagged your mind at a 99.4% anomaly match—a statistical ghost. Before I raise the Veritas Prism, indulge me: what kind of outsider am I vetting tonight?',
        tellHint: 'Behind the one-way obsidian mirror, two silhouettes lean forward into the dim glow.',
        accentTone: 'gold',
        sting: 'CHOICE',
        choices: [
          {
            id: 'origin_academic',
            label: 'Disgraced Academic',
            subtext: 'Published the proof three ministries buried. Razor-sharp on classical deduction.',
            tag: '+Council Intel · +Integrity',
            tagTone: 'gold',
            effects: {
              origin: 'ACADEMIC',
              councilFavor: 6,
              integrity: 4,
              flags: { origin_note: 'Disgraced Academic' },
            },
            nextBeatId: 'p_origin_react',
          },
          {
            id: 'origin_polymath',
            label: 'Street-Smart Polymath',
            subtext: 'Self-taught across twelve disciplines. Reads rooms faster than syllabi.',
            tag: '+Public Trust · +Integrity',
            tagTone: 'cyan',
            effects: {
              origin: 'POLYMATH',
              publicTrust: 8,
              integrity: 4,
              flags: { origin_note: 'Street-Smart Polymath' },
            },
            nextBeatId: 'p_origin_react',
          },
          {
            id: 'origin_strategist',
            label: 'Pattern-Breaking Strategist',
            subtext: 'Treats every rulebook as an opening bid. Lives for high-wire conviction.',
            tag: '+Ambition · Maverick Edge',
            tagTone: 'crimson',
            effects: {
              origin: 'STRATEGIST',
              integrity: -6,
              councilFavor: 5,
              flags: { origin_note: 'Pattern-Breaking Strategist' },
            },
            nextBeatId: 'p_origin_react',
          },
        ],
      },
      {
        id: 'p_origin_react',
        sceneTitle: 'THE VERITAS PRISM',
        locationLabel: 'GENEVA · THE VETTING CHAMBER',
        venue: 'CH',
        lightingState: 'BROADCAST',
        musicLayer: 'INTERVIEW',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'IMPRESSED',
        text: 'Splendid. Let us see whether your instincts match your reputation. Raise the Veritas Prism.',
        dynamicText: ({ story }) => {
          if (story.origin === 'ACADEMIC') {
            return 'Ah—the footnote that embarrassed three cabinets. Good. The Meridian has enough polite diplomats; it needs someone allergic to convenient lies. Raise the Veritas Prism.';
          }
          if (story.origin === 'STRATEGIST') {
            return "A card-counter walking voluntarily into an obsidian vault. Dangerous—and extraordinarily telegenic. Let's see how steady your thumb is when the gold beam ignites.";
          }
          return 'No pedigree, no patron—just lethal curiosity. The World Council detests wildcards, which is precisely why I booked your flight. Raise the Veritas Prism.';
        },
        tellHint:
          'Vance adjusts his left brass cufflink as beveled glass facets rise smoothly from the plinth.',
        accentTone: 'gold',
        continueLabel: 'BEGIN SCREENING',
      },
    ],
  },

  prologue_manifesto: {
    id: 'prologue_manifesto',
    beats: [
      {
        id: 'p_manifesto_q',
        sceneTitle: "THE ARBITER'S OATH",
        locationLabel: 'GENEVA · OVERHEAD SPOTS FLARE',
        venue: 'CH',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'TENSE',
        text: 'One question the Prism cannot grade. When you hold the sharpest mind on Earth—and the decryption veto over The Ledger—who does it answer to?',
        dynamicText: ({ story }) => {
          const leak = story.flags.prologue_leak;
          const prefix =
            leak === 'EXPLOITED'
              ? 'You caught that mirror reflection without blinking—audacious, if ethically elastic. '
              : leak === 'FLAGGED'
                ? 'You flagged a security breach on your own producer—the Council will adore that transcript. '
                : leak === 'CLEAN'
                  ? 'You ignored a free clue staring off the glass. Rare discipline. '
                  : '';
          return `${prefix}Before our final instrument, tell me plainly: when you hold the sharpest mind on Earth, who does it answer to?`;
        },
        tellHint: "Vance's right-ear stylus hovers still; this answer inks your diplomatic dossier.",
        accentTone: 'gold',
        sting: 'CHOICE',
        choices: [
          {
            id: 'man_council',
            label: 'The World Council',
            subtext: 'Stability keeps nations from burning. Truth needs institutional armor.',
            tag: '+16 Council Favor',
            tagTone: 'gold',
            effects: {
              councilFavor: 16,
              flags: { manifesto: 'COUNCIL' },
            },
            nextBeatId: 'p_manifesto_astrolabe',
          },
          {
            id: 'man_public',
            label: 'The Public',
            subtext: 'No vault should ration answers that belong to eight billion citizens.',
            tag: '+16 Public Trust · +8 Integrity',
            tagTone: 'cyan',
            effects: {
              publicTrust: 16,
              integrity: 8,
              flags: { manifesto: 'PUBLIC' },
            },
            nextBeatId: 'p_manifesto_astrolabe',
          },
          {
            id: 'man_self',
            label: 'Only Myself',
            subtext: "Every patron expects obedience. I'll take the crown—and keep my own counsel.",
            tag: '-12 Integrity · Maverick Edge',
            tagTone: 'crimson',
            effects: {
              integrity: -12,
              flags: { manifesto: 'SELF' },
            },
            nextBeatId: 'p_manifesto_astrolabe',
          },
        ],
      },
      {
        id: 'p_manifesto_astrolabe',
        sceneTitle: 'FINAL CALIBRATION',
        locationLabel: 'GENEVA · MERIDIAN ASTROLABE',
        venue: 'CH',
        lightingState: 'BROADCAST',
        musicLayer: 'DEDUCTION',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'IMPRESSED',
        text: 'Sealed in ink. Now for my favorite toy: the Meridian Brass Astrolabe. Aim the needle, then pinch the Tolerance Cone—wide for safety, or razor-thin for a 3.5x Bullseye.',
        tellHint: 'Engraved concentric brass rings unfold from the plinth with Swiss watchmaker precision.',
        accentTone: 'gold',
        continueLabel: 'CALIBRATE ASTROLABE',
      },
    ],
  },

  prologue_outro: {
    id: 'prologue_outro',
    beats: [
      {
        id: 'p_stamp',
        sceneTitle: 'PASSPORT STAMPED',
        locationLabel: 'GENEVA · ACT I CLEARANCE',
        venue: 'CH',
        lightingState: 'BROADCAST',
        musicLayer: 'STREAK',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'IMPRESSED',
        text: 'Congratulations. Your Meridian Diplomatic Passport is stamped and the Brass Astrolabe is yours in the Observatory.',
        dynamicText: ({ awardedPersona, awardedPerkName }) => {
          const label = awardedPersona ? PERSONA_LABELS[awardedPersona].name : 'THE PRODIGY';
          const perk = awardedPerkName ?? "Diplomat's Composure";
          return `Screening complete. I'm stamping your Meridian Passport as ${label}—granting ${perk} and unlocking the Meridian Brass Astrolabe in your 3D Observatory.`;
        },
        tellHint: 'A heavy gold embosser stamps crimson-and-brass clearance across your passport.',
        accentTone: 'gold',
        sting: 'STAMP',
        continueLabel: 'CHOOSE ACT I FLIGHT',
        nextBeatId: 'p_flight_fork',
      },
      {
        id: 'p_flight_fork',
        sceneTitle: 'THE MERIDIAN CIRCUIT OPENS',
        locationLabel: 'GENEVA · PRIVATE TARMAC',
        venue: 'CH',
        lightingState: 'BROADCAST',
        musicLayer: 'IDLE',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'SMIRK',
        text: "Two charter jets are fueled. Fly to London's Sovereign Rotunda to face prodigy Nadia Al-Mansoor under Chancellor Lindqvist's gaze—or Tokyo's Shinkansen Sky Pavilion against Horizon wildcard Soren Kael. The globe is yours.",
        tellHint:
          'Vance adjusts his left brass cufflink once more—as if hiding the real reason he matched you at 99.4%.',
        accentTone: 'gold',
        continueLabel: 'VIEW SCREENING DOSSIER',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // STAGE 1 — LONDON (GB, THE SOVEREIGN ROTUNDA)
  // --------------------------------------------------------------------------
  london_intro: {
    id: 'london_intro',
    beats: [
      {
        id: 'gb_rotunda',
        sceneTitle: 'STAGE 1 · THE SOVEREIGN ROTUNDA',
        locationLabel: 'LONDON · SOVEREIGN BLOC ARENA',
        venue: 'GB',
        lightingState: 'BROADCAST',
        musicLayer: 'INTERVIEW',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Prodigy Rival · "The Polymath"',
        mood: 'SMIRK',
        text: "So you're Geneva's mysterious 99.4% wildcard. I'm Nadia Al-Mansoor. Four centuries of British diplomacy overhead, and a live global feed at our backs. Try to keep pace with my lock beam.",
        tellHint:
          "Nadia's gold geometric ear-cuff catches the spotlight; a tiny corner smirk warns she already timed your entry.",
        accentTone: 'gold',
        sting: 'SUMMONS',
        continueLabel: 'CONTINUE',
        nextBeatId: 'gb_trial00',
      },
      {
        id: 'gb_trial00',
        sceneTitle: 'GLASS FLOOR ANOMALY',
        locationLabel: 'LONDON · BENEATH THE PLINTH',
        venue: 'GB',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Rogue Broadcast Producer · "The Fixer"',
        mood: 'TENSE',
        text: 'Left ear—comms check. Teo Rojas, live producer. Glance down through the glass floor panel beside your plinth. See that sealed bronze drawer stamped "TRIAL 00 — 2019"? Officially, this is the first Meridian. Someone scrubbed an entire pilot season.',
        tellHint:
          "Teo's eyes dart twice toward the overhead broadcast boom before his binaural whisper cuts clean.",
        accentTone: 'cyan',
        continueLabel: 'STEP TO THE PODIUM',
        nextBeatId: 'gb_lindqvist_offer',
      },
      {
        id: 'gb_lindqvist_offer',
        sceneTitle: "THE CHANCELLOR'S SEAL",
        locationLabel: 'LONDON · SOVEREIGN GREEN ROOM',
        venue: 'GB',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'lindqvist',
        speakerName: 'Chancellor Ingrid Lindqvist',
        speakerRole: 'Sovereign Bloc Chair · "The Kingmaker"',
        mood: 'NEUTRAL',
        text: "Welcome to London. A wax-sealed Sovereign briefing on tonight's Rotunda themes waits on your podium. Seasoned arbiters accept institutional stewardship. Amateur purists... improvise in the dark.",
        tellHint:
          'Lindqvist slowly removes her platinum spectacles—her unmistakable tell before a backroom bargain.',
        accentTone: 'gold',
        sting: 'CHOICE',
        choices: [
          {
            id: 'gb_accept_briefing',
            label: 'Accept Sealed Briefing',
            subtext:
              'Unlock Diplomatic Redaction (redact 1 decoy facet mid-match). Nadia detects the leak and triggers Tempo Steal!',
            tag: '+20 Council · -12 Integrity · Redaction',
            tagTone: 'crimson',
            effects: {
              councilFavor: 20,
              integrity: -12,
              bonds: { lindqvist: 1, nadia: -1 },
              flags: { london_choice: 'ACCEPTED_BRIEFING', nadia_tempo_steal: true },
              unlockPerk: 'DIPLOMATIC_REDACTION',
              autoEquipPerk: true,
              toast: 'Equipped: Diplomatic Redaction · Nadia shifts to Tempo Steal!',
            },
            nextBeatId: 'gb_react_accept',
          },
          {
            id: 'gb_burn_briefing',
            label: 'Burn Briefing Unopened',
            subtext:
              "Unlock Clean Hands (+25% Tier-1 bonus) and earn Teo's hidden London Black Salon invite!",
            tag: '+18 Integrity · +15 Public · Black Salon',
            tagTone: 'cyan',
            effects: {
              integrity: 18,
              publicTrust: 15,
              bonds: { nadia: 1, teo: 1, lindqvist: -1 },
              flags: { london_choice: 'BURNED_BRIEFING', nadia_tempo_steal: false },
              unlockPerk: 'CLEAN_HANDS',
              autoEquipPerk: true,
              unlockBlackSalon: true,
              toast: 'Unlocked: Clean Hands + Hidden London Black Salon!',
            },
            nextBeatId: 'gb_react_burn',
          },
        ],
      },
      {
        id: 'gb_react_accept',
        sceneTitle: 'SUSPICION AUDIT',
        locationLabel: 'LONDON · THE SOVEREIGN ROTUNDA',
        venue: 'GB',
        lightingState: 'BROADCAST',
        musicLayer: 'DEDUCTION',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Prodigy Rival',
        mood: 'RATTLED',
        text: "You actually broke Lindqvist's wax seal before the cameras rolled? Fine. If the Sovereign Bloc wants to tilt the floor, I'm compressing your Chrono-Ring. Survive my Tempo Steal!",
        tellHint: "Nadia's jaw clenches hard—her Rival Prism spins up at aggressive speed.",
        accentTone: 'crimson',
        continueLabel: 'FACE NADIA (5 Qs)',
      },
      {
        id: 'gb_react_burn',
        sceneTitle: 'CLEAN HANDS',
        locationLabel: 'LONDON · THE SOVEREIGN ROTUNDA',
        venue: 'GB',
        lightingState: 'BROADCAST',
        musicLayer: 'DEDUCTION',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Prodigy Rival',
        mood: 'IMPRESSED',
        text: "You dropped the Chancellor's briefing straight into a ceremonial brazier on live feed. Teo just routed an underground Black Salon coordinate to your Globe. First—see if clean hands can outthink me.",
        tellHint:
          'Nadia offers a brief, genuine nod before focusing laser-sharp on the Veritas Prism.',
        accentTone: 'gold',
        continueLabel: 'FACE NADIA (5 Qs)',
      },
    ],
  },

  london_outro: {
    id: 'london_outro',
    beats: [
      {
        id: 'gb_outro_nadia',
        sceneTitle: 'TRIAL 00 ECHOES',
        locationLabel: 'LONDON · ROTUNDA GALLERY',
        venue: 'GB',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Prodigy Rival',
        mood: 'TENSE',
        text: 'You saw the glass-floor drawer, didn\'t you? "Trial 00 — 2019." Someone vanished after that pilot. Take the Armillary Orrery—and watch your back in Tokyo.',
        dynamicText: ({ story, lastMatchWon }) => {
          const opener = lastMatchWon
            ? 'You beat me cleanly under my own rotunda dome. Impressive.'
            : 'I took London on points—but you pushed my Prism harder than anyone since Geneva.';
          const branch =
            story.flags.london_choice === 'ACCEPTED_BRIEFING'
              ? " Next time, leave Lindqvist's wax seals in the drawer."
              : " Burning that briefing proved you're not on the Council's leash.";
          return `${opener}${branch} About that glass floor label—"Trial 00, 2019"... someone vanished after winning that pilot. Keep the Armillary Orrery; you'll need sharper instincts for what comes next.`;
        },
        tellHint:
          "For half a second, Nadia's composure flickers—she isn't competing for the $100M crown at all.",
        accentTone: 'gold',
        sting: 'VICTORY',
        continueLabel: 'VIEW LONDON DOSSIER',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // HIDDEN NODE — LONDON BLACK SALON (gb_black_salon)
  // --------------------------------------------------------------------------
  black_salon_intro: {
    id: 'black_salon_intro',
    beats: [
      {
        id: 'bs_teo_welcome',
        sceneTitle: 'HIDDEN NODE · THE BLACK SALON',
        locationLabel: 'LONDON · SUB-THAMES VAULT',
        venue: 'GB',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Underground Broker · "The Fixer"',
        mood: 'SMIRK',
        text: "Welcome three floors beneath Thames mud—London's off-grid Black Salon. No broadcast feeds, no Council babysitters, and Tier-3 Blueprint Peels are welded shut. Four high-voltage questions. Double points. Survive, and I'll hand you what I scraped off Trial 00.",
        tellHint:
          'Teo flips two switches on his wrist rig; crimson emergency sconces ignite across damp stone.',
        accentTone: 'crimson',
        sting: 'TWIST',
        continueLabel: 'ENTER BLACK SALON (4 Qs)',
      },
    ],
  },

  black_salon_outro: {
    id: 'black_salon_outro',
    beats: [
      {
        id: 'bs_teo_lore',
        sceneTitle: 'CLASSIFIED EXTRACT',
        locationLabel: 'LONDON · SUB-THAMES VAULT',
        venue: 'GB',
        lightingState: 'FRACTURE',
        musicLayer: 'INTERVIEW',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Rogue Broadcast Producer',
        mood: 'IMPRESSED',
        text: 'Cold steel in the dark. Here—pulled from a scrubbed 2019 server before Sovereign wiped the rack: the Trial 00 winner\'s name was redacted except one surname fragment—"AL-MANS—". Yeah. Nadia has skin in this game. Keep it quiet until Cairo.',
        tellHint:
          'Teo slips a warm copper cipher shard into your coat pocket and disappears up the maintenance stairs.',
        accentTone: 'cyan',
        sting: 'TWIST',
        continueLabel: 'SEAL INTEL',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // STAGE 2 — TOKYO (JP, THE SHINKANSEN SKY PAVILION)
  // --------------------------------------------------------------------------
  tokyo_intro: {
    id: 'tokyo_intro',
    beats: [
      {
        id: 'jp_pavilion',
        sceneTitle: 'STAGE 2 · SHINKANSEN SKY PAVILION',
        locationLabel: 'TOKYO · 70F NEON OVERLOOK',
        venue: 'JP',
        lightingState: 'BROADCAST',
        musicLayer: 'INTERVIEW',
        speakerId: 'soren',
        speakerName: 'Soren "Echo" Kael',
        speakerRole: 'Wildcard Contender · Horizon Collective',
        mood: 'SMIRK',
        text: "Seventy stories above Shinjuku rain, and the bullet-train vibration hums straight through the obsidian plinth. Soren Kael—former Macau shark, Horizon's favorite dark horse. Don't blink; I lock facets in zero-point-eight seconds.",
        tellHint:
          "A weighted gold coin rolls effortlessly across Soren's knuckles—then freezes dead between two fingers.",
        accentTone: 'cyan',
        sting: 'SUMMONS',
        continueLabel: 'WATCH HIS HANDS',
        nextBeatId: 'jp_teo_earpiece',
      },
      {
        id: 'jp_teo_earpiece',
        sceneTitle: 'SUB-VOCAL TELEMETRY',
        locationLabel: 'TOKYO · PRIVATE COMMS',
        venue: 'JP',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Rogue Broadcast Producer',
        mood: 'TENSE',
        text: "Watch the coin! Every time it freezes dead on his knuckle, a covert Horizon micro-earpiece pings him probability weights from Director Takahashi's spire. I wired two plays into your console: siphon his feed quietly—or fire a live Analog Static jammer across the whole pavilion.",
        tellHint: "Teo's wrist telemetry locks onto an illicit carrier wave: 94.8 MHz — HORIZON SPIRE.",
        accentTone: 'cyan',
        continueLabel: 'CONFRONT SOREN',
        nextBeatId: 'jp_soren_choice',
      },
      {
        id: 'jp_soren_choice',
        sceneTitle: 'THE EARPIECE GAMBIT',
        locationLabel: 'TOKYO · SHINKANSEN SKY PAVILION',
        venue: 'JP',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'soren',
        speakerName: 'Soren "Echo" Kael',
        speakerRole: 'Wildcard Contender',
        mood: 'TELL',
        text: "Caught the knuckle tell, huh? Sharp eyes for an outsider. So what's the play—do we cut a quiet Horizon poker deal, or are you crazy enough to blow a live signal jammer on international air?",
        tellHint: "Soren's gold coin hovers frozen between his fingers, waiting on your call.",
        accentTone: 'crimson',
        sting: 'CHOICE',
        choices: [
          {
            id: 'jp_blackmail_soren',
            label: 'Blackmail Soren Quietly',
            subtext:
              'Siphon his Horizon feed: unlock Horizon Probability Lens (hairline fractures mark a weak decoy at Tier 1).',
            tag: '-15 Integrity · Horizon Lens',
            tagTone: 'crimson',
            effects: {
              integrity: -15,
              councilFavor: 8,
              bonds: { soren: 1, teo: -1 },
              flags: { tokyo_choice: 'BLACKMAILED_SOREN', tokyo_analog_static: false },
              unlockPerk: 'HORIZON_LENS',
              autoEquipPerk: true,
              toast: 'Equipped: Horizon Probability Lens — weak decoys show hairline fractures!',
            },
            nextBeatId: 'jp_react_blackmail',
          },
          {
            id: 'jp_fire_jammer',
            label: 'Fire Live Signal Jammer',
            subtext:
              'Unlock Analog Instinct (+2.5s & Tempo Steal immunity) and trigger CRIMSON FRACTURE Analog Static (Peel locked for BOTH players!).',
            tag: '+18 Integrity · +16 Public · Fracture Mode',
            tagTone: 'cyan',
            effects: {
              integrity: 18,
              publicTrust: 16,
              bonds: { soren: -1, teo: 1 },
              flags: { tokyo_choice: 'FIRED_JAMMER', tokyo_analog_static: true },
              unlockPerk: 'ANALOG_STATIC_MASTER',
              autoEquipPerk: true,
              toast: 'LIVE JAMMER FIRED — Crimson Fracture · Depth Peel Locked!',
            },
            nextBeatId: 'jp_react_jammer',
          },
        ],
      },
      {
        id: 'jp_react_blackmail',
        sceneTitle: 'HORIZON POKER',
        locationLabel: 'TOKYO · SHINKANSEN SKY PAVILION',
        venue: 'JP',
        lightingState: 'BROADCAST',
        musicLayer: 'DEDUCTION',
        speakerId: 'soren',
        speakerName: 'Soren "Echo" Kael',
        speakerRole: 'Wildcard Contender',
        mood: 'SMIRK',
        text: "Hah! Now that is high-stakes diplomacy. Fine—I'll mirror the stress-scan telemetry onto your Prism so my molar stays off the front page. Don't assume a hairline crack makes beating me easy.",
        tellHint: 'Soren flicks his gold coin spinning smoothly again—an uneasy truce between sharks.',
        accentTone: 'gold',
        continueLabel: 'START TOKYO DUEL (5 Qs)',
      },
      {
        id: 'jp_react_jammer',
        sceneTitle: 'ANALOG STATIC FRACTURE',
        locationLabel: 'TOKYO · EMERGENCY CRIMSON MODE',
        venue: 'JP',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'soren',
        speakerName: 'Soren "Echo" Kael',
        speakerRole: 'Wildcard Contender',
        mood: 'RATTLED',
        text: "Wait—my carrier just flatlined! The pavilion baffles dropped into emergency crimson—you welded BOTH Depth Peels shut?! ...Fine. Raw gray matter, zero nets, pure lateral deduction. Let's dance!",
        tellHint:
          'Soren yanks out his dead sub-vocal earpiece and flashes a wild, unhinged grin under crimson rain.',
        accentTone: 'crimson',
        sting: 'TWIST',
        continueLabel: 'ENTER FRACTURE DUEL (5 Qs)',
      },
    ],
  },

  tokyo_outro: {
    id: 'tokyo_outro',
    beats: [
      {
        id: 'jp_outro_soren',
        sceneTitle: 'THE VEIL CRACKS',
        locationLabel: 'TOKYO · SHINKANSEN SKY PAVILION',
        venue: 'JP',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'soren',
        speakerName: 'Soren "Echo" Kael',
        speakerRole: 'Wildcard Contender',
        mood: 'RATTLED',
        text: "Respect. Horizon's models never predicted you clearing Tokyo. Take the Folding Origami Prism—and ask Nadia what happened in Cairo.",
        dynamicText: ({ story, lastMatchWon }) => {
          const outcome = lastMatchWon
            ? 'Okay—hat off. You actually took me down seventy floors over Tokyo.'
            : 'I edged the scoreboard by a hair, and my pulse is still hammering.';
          const style = story.flags.tokyo_analog_static
            ? ' Pulling that Analog Static jammer on live broadcast? Director Takahashi is furious—and half the planet just cheered.'
            : ' Playing my own telemetry back against me takes nerve.';
          return `${outcome}${style} Keep the Folding Origami Prism. Word of advice before Act II: Vance didn't summon you for a game show.`;
        },
        tellHint:
          'Soren pockets his gold coin without spinning it—dead serious for the first time tonight.',
        accentTone: 'gold',
        sting: 'VICTORY',
        continueLabel: 'MEET TEO ON THE PLATFORM',
        nextBeatId: 'jp_outro_cliffhanger',
      },
      {
        id: 'jp_outro_cliffhanger',
        sceneTitle: 'ACT II UNLOCKED · RIO & CAIRO',
        locationLabel: 'TOKYO · EXPRESS PLATFORM 14',
        venue: 'JP',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Rogue Broadcast Producer',
        mood: 'TENSE',
        text: 'Look what I pulled from Horizon\'s backup relay during the match: an encrypted coordinate chip stamped "MERIDIAN ZERO // CAIRO — PSYCHOMETRIC MATCH 99.4%." Clear London and Tokyo to board the Act II charter straight to Rio de Janeiro\'s Botanical Glass Canopy!',
        tellHint:
          'An obsidian coordinate chip pulses crimson inside your palm as the midnight Shinkansen roars past.',
        accentTone: 'crimson',
        sting: 'TWIST',
        continueLabel: 'VIEW TOKYO DOSSIER',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // STAGE 3 (ACT II) — RIO DE JANEIRO (BR, THE BOTANICAL GLASS CANOPY)
  // --------------------------------------------------------------------------
  rio_intro: {
    id: 'rio_intro',
    beats: [
      {
        id: 'br_canopy_open',
        sceneTitle: 'STAGE 3 · BOTANICAL GLASS CANOPY',
        locationLabel: 'RIO DE JANEIRO · AGORA SUMMIT ARENA',
        venue: 'BR',
        lightingState: 'BROADCAST',
        musicLayer: 'INTERVIEW',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'IMPRESSED',
        text: 'Welcome to Act II—Rio de Janeiro. Ten thousand spectators packing Oscar Niemeyer\'s twilight glass canopy, warm rainforest air humming like a cello. The Agora Coalition wants to see whether our prodigies still have a human pulse beneath the crown.',
        tellHint:
          'Emerald spotlight beams refract off humid glass ribs as the crowd chants across three circular tiers.',
        accentTone: 'gold',
        sting: 'SUMMONS',
        continueLabel: 'STEP TO CALIBRATION POD',
        nextBeatId: 'br_sabotage_alert',
      },
      {
        id: 'br_sabotage_alert',
        sceneTitle: 'SABOTAGE ON POD TWO',
        locationLabel: 'RIO · PRE-MATCH CALIBRATION DECK',
        venue: 'BR',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Rogue Broadcast Producer',
        mood: 'TENSE',
        text: "Emergency left-ear! Someone spiked a high-voltage feedback loop straight into Nadia's calibration pod! Her Prism bus hits thermal trip in ten seconds—automatic disqualification and you inherit the #1 seed. Only one way to stabilize her rig: shunt one of YOUR own match Shields into her capacitor right now!",
        tellHint:
          "White ozone smoke curls subtly from the base of Nadia's plinth—invisible to the 10,000 spectators.",
        accentTone: 'crimson',
        sting: 'TWIST',
        continueLabel: 'LOOK ACROSS AT NADIA',
        nextBeatId: 'br_nadia_choice',
      },
      {
        id: 'br_nadia_choice',
        sceneTitle: "NADIA'S CALIBRATION POD",
        locationLabel: 'RIO · 10,000 EYES WATCHING',
        venue: 'BR',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Prodigy Rival · Acoustic Engineer',
        mood: 'RATTLED',
        text: "Don't look at me like that. My acoustic diagnostics are screaming redline—whoever sabotaged my pod wants me gone before Cairo. If you stay silent, you walk into the #1 seed with full Shields. Your call, contender.",
        tellHint:
          "Nadia's knuckles turn white against the brass rail; she refuses to beg even as her console sparks.",
        accentTone: 'gold',
        sting: 'CHOICE',
        choices: [
          {
            id: 'br_save_nadia',
            label: 'Sacrifice 1 Prism Shield to Save Nadia',
            subtext:
              'Enter Rio down 1 Shield, forge an ALLIED bond with Nadia, and equip Co-Op Cross-Check (1x/match free Tier-2 clue at full 3.0x!).',
            tag: 'Allied Nadia · Co-Op Cross-Check · -1 Shield',
            tagTone: 'cyan',
            effects: {
              integrity: 18,
              publicTrust: 16,
              setBonds: { nadia: 'ALLIED' },
              flags: { rio_choice: 'SAVED_NADIA', rio_shield_sacrifice: true },
              unlockPerk: 'COOP_CROSSCHECK',
              autoEquipPerk: true,
              toast: 'NADIA ALLIED! Equipped Co-Op Cross-Check · Entering Rio down 1 Shield!',
            },
            nextBeatId: 'br_react_save',
          },
          {
            id: 'br_claim_seed',
            label: 'Claim the #1 Seed',
            subtext:
              'Keep full Shields in Rio—but Nadia becomes your NEMESIS, returning with Grudge Pressure targeting YOUR weakest trivia domain!',
            tag: 'Nemesis Nadia · Full Shields · Grudge Risk',
            tagTone: 'crimson',
            effects: {
              integrity: -20,
              councilFavor: 12,
              publicTrust: -10,
              setBonds: { nadia: 'NEMESIS' },
              flags: { rio_choice: 'ABANDONED_NADIA', rio_shield_sacrifice: false },
              toast: 'Claimed #1 Seed — Nadia Al-Mansoor is now your NEMESIS!',
            },
            nextBeatId: 'br_react_seed',
          },
        ],
      },
      {
        id: 'br_react_save',
        sceneTitle: 'ACOUSTIC ALLIANCE',
        locationLabel: 'RIO · BOTANICAL GLASS CANOPY',
        venue: 'BR',
        lightingState: 'BROADCAST',
        musicLayer: 'DEDUCTION',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Allied Polymath',
        mood: 'IMPRESSED',
        text: "You actually bled your own Prism Shield to keep your fiercest rival on stage?! ...Thank you. I've bridged my acoustic cross-check to your plinth—once per match, peel Tier 2 and I'll protect your full 3.0x multiplier. Now let's give Rio a show.",
        tellHint:
          "Nadia's cold armor cracks into a fierce, genuine smile as her pod hums back to emerald stability.",
        accentTone: 'cyan',
        continueLabel: 'ENTER RIO ARENA (5 Qs)',
      },
      {
        id: 'br_react_seed',
        sceneTitle: 'NEMESIS SWORN',
        locationLabel: 'RIO · BOTANICAL GLASS CANOPY',
        venue: 'BR',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Sworn Nemesis',
        mood: 'RATTLED',
        text: "Cold. Ruthless. Lindqvist will applaud. Watch closely—I'm bypassing the damaged stabilizer manually! Keep your #1 seed tonight, because from this moment on I'm pulling your psychometric radar and hunting YOUR weakest domain.",
        tellHint:
          'Sparks shower off Nadia\'s manual override; her Rival Prism burns crimson with Grudge Pressure.',
        accentTone: 'crimson',
        sting: 'TWIST',
        continueLabel: 'FACE NEMESIS NADIA (5 Qs)',
      },
    ],
  },

  rio_outro: {
    id: 'rio_outro',
    beats: [
      {
        id: 'br_outro_emerald',
        sceneTitle: 'EMERALD RESONANCE',
        locationLabel: 'RIO · CANOPY TERRACE',
        venue: 'BR',
        lightingState: 'BROADCAST',
        musicLayer: 'STREAK',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Prodigy Contender',
        mood: 'IMPRESSED',
        text: 'The Emerald Resonance Sphere unlocked cleanly. Take it—and brace yourself for Cairo.',
        dynamicText: ({ story, lastMatchWon }) => {
          if (story.bonds.nadia === 'ALLIED') {
            return lastMatchWon
              ? 'You beat ten thousand voices down a Shield and still unlocked the Emerald Resonance Sphere. You earned my trust—so hear the truth before we fly to Cairo: the man who vanished in Trial 00 wasn\'t a stranger. He was my older brother, Tariq.'
              : 'Even down a Shield you pushed me to the wire under Rio\'s dome. Because you saved my pod, you deserve the truth before Cairo: the vanished winner of Trial 00 was my brother, Tariq Al-Mansoor.';
          }
          return lastMatchWon
            ? 'Enjoy the Emerald Sphere and your #1 seed while the cameras adore you. In Cairo, the Giza vault won\'t care about broadcast polish—and neither will I.'
            : 'Even with an intact pod, you couldn\'t bury me. Take your Emerald Sovereign trophy—we settle the real debt beneath Giza.';
        },
        tellHint:
          'Inside the Emerald Resonance Sphere, a faint sandstone frequency pulses—pointing straight to Cairo.',
        accentTone: 'gold',
        sting: 'VICTORY',
        continueLabel: 'VIEW RIO DOSSIER',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // STAGE 4 (ACT II CLIMAX) — CAIRO / GIZA (EG, THE SOLAR ACOUSTIC HALL)
  // --------------------------------------------------------------------------
  cairo_intro: {
    id: 'cairo_intro',
    beats: [
      {
        id: 'eg_solar_hall',
        sceneTitle: 'STAGE 4 · SOLAR ACOUSTIC HALL',
        locationLabel: 'CAIRO / GIZA · TWILIGHT OCULUS',
        venue: 'EG',
        lightingState: 'BROADCAST',
        musicLayer: 'INTERVIEW',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'TENSE',
        text: 'Giza at dusk. Forty-meter sandstone acoustics angled straight at the pyramids, and a tracking brass solar oculus overhead. Half the circuit ends tonight—wait. Control room, why are the oculus counterweights disengaging?!',
        tellHint:
          'Brass gears shriek high above the sandstone dome as the golden sunbeam narrows to a razor slit.',
        accentTone: 'gold',
        sting: 'SUMMONS',
        continueLabel: 'WATCH THE OCULUS',
        nextBeatId: 'eg_blackout_twist',
      },
      {
        id: 'eg_blackout_twist',
        sceneTitle: 'TWIST · THE MERIDIAN ZERO REVELATION',
        locationLabel: 'CAIRO · STAGED BLACKOUT',
        venue: 'EG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Rogue Broadcast Producer',
        mood: 'TELL',
        text: "THE OCULUS JUST SLAMMED SHUT! Broadcast cut! Don't move—I'm routing the subterranean Giza server directly onto your plinth! Here it is—the scrubbed 2019 pilot dossier they buried under concrete: MERIDIAN ZERO.",
        tellHint:
          'Crimson emergency arcs flare across sandstone reliefs as encrypted holographic dossiers spill out of the floor.',
        accentTone: 'crimson',
        sting: 'TWIST',
        continueLabel: 'DECRYPT TRIAL 00 FILE',
        nextBeatId: 'eg_tariq_dossier',
      },
      {
        id: 'eg_tariq_dossier',
        sceneTitle: 'PSYCHOMETRIC MATCH: 99.4%',
        locationLabel: 'CAIRO · MERIDIAN ZERO VAULT',
        venue: 'EG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Prodigy Contender',
        mood: 'RATTLED',
        text: 'Read the top line... "TRIAL 00 WINNER: TARIQ AL-MANSOOR — STATUS: ERASED AFTER EXPOSING FACTION LEDGER TAMPERING." My brother proved the bloc chairs were rigging crisis forecasts. Now scroll to YOUR recruitment sheet: "PSYCHOMETRIC MATCH: 99.4% — TARIQ TEMPLATE." Vance didn\'t stumble onto you—he recruited Tariq\'s cognitive twin!',
        tellHint:
          'Crimson dossier text hovers between you and Nadia: 99.4% NEURAL DEDUCTION CORRELATION.',
        accentTone: 'crimson',
        continueLabel: 'DECIDE THE DOSSIER\'S FATE',
        nextBeatId: 'eg_act3_fork',
      },
      {
        id: 'eg_act3_fork',
        sceneTitle: 'MAJOR ACT III FORK',
        locationLabel: 'CAIRO · 90 SECONDS TO COUNCIL LOCKDOWN',
        venue: 'EG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Rogue Broadcast Producer',
        mood: 'TENSE',
        text: "Lindqvist's security sweeps the hall in ninety seconds! My pirate dish can blast Tariq's dossier live to half a billion screens right now—burning our Council passports and crashing Reykjavik off-grid. Or you pocket the chip, walk straight into Reykjavik's closed-door World Council Conclave, and dismantle them from inside!",
        tellHint:
          'Two uplinks blink on your plinth: Crimson Pirate Broadcast vs. Gold Council Clearance.',
        accentTone: 'crimson',
        sting: 'CHOICE',
        choices: [
          {
            id: 'eg_whistleblower',
            label: "Broadcast Dossier Live via Teo's Pirate Uplink",
            subtext:
              'WHISTLEBLOWER PATH: Unlocks People\'s Sightline + Black Salon Crimson Skin. Shifts Reykjavik into a pirate Black Salon crash!',
            tag: 'Whistleblower · People\'s Sightline · Crimson Skin',
            tagTone: 'crimson',
            effects: {
              integrity: 22,
              publicTrust: 25,
              councilFavor: -24,
              bonds: { teo: 1, lindqvist: -2 },
              act3Branch: 'WHISTLEBLOWER',
              flags: { cairo_choice: 'WHISTLEBLOWER', cairo_vault_clue: true },
              unlockPerk: 'PEOPLES_LENS',
              autoEquipPerk: true,
              unlockSkin: 'BLACK_SALON_CRIMSON',
              toast: "WHISTLEBLOWER! Equipped People's Sightline + Black Salon Crimson Skin!",
            },
            nextBeatId: 'eg_react_whistle',
          },
          {
            id: 'eg_insider',
            label: 'Pocket Dossier & Infiltrate from Within',
            subtext:
              'INSIDER PATH: Unlocks Council Override (+20% History/Society/High-Power) + Damascus Titanium Skin. Enters Reykjavik\'s closed Conclave!',
            tag: 'Insider · Council Override · Damascus Skin',
            tagTone: 'gold',
            effects: {
              integrity: -10,
              councilFavor: 22,
              publicTrust: -8,
              bonds: { lindqvist: 1, teo: -1 },
              act3Branch: 'INSIDER',
              flags: { cairo_choice: 'INSIDER', cairo_vault_clue: true },
              unlockPerk: 'COUNCIL_OVERRIDE',
              autoEquipPerk: true,
              unlockSkin: 'DAMASCUS_TITANIUM',
              toast: 'INSIDER PATH! Equipped Council Override + Damascus Titanium Skin!',
            },
            nextBeatId: 'eg_react_insider',
          },
        ],
      },
      {
        id: 'eg_react_whistle',
        sceneTitle: 'PIRATE UPLINK LIVE',
        locationLabel: 'CAIRO · GLOBAL FEED HIJACKED',
        venue: 'EG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Whistleblower Signal Chief',
        mood: 'IMPRESSED',
        text: "TRANSMITTING! Four hundred million phones just lit up with Trial 00! Lindqvist's auditors just locked the sandstone doors—crack the Meridian Zero Cipher Box on the Prism right now before they pull our power!",
        tellHint:
          'Crowdsourced public heatmaps shimmer across your Prism facets—People\'s Sightline is online.',
        accentTone: 'crimson',
        continueLabel: 'DECRYPT CIPHER BOX (5 Qs)',
      },
      {
        id: 'eg_react_insider',
        sceneTitle: 'THE INSIDER GAMBIT',
        locationLabel: 'CAIRO · SOLAR ACOUSTIC HALL',
        venue: 'EG',
        lightingState: 'INTIMATE',
        musicLayer: 'DEDUCTION',
        speakerId: 'lindqvist',
        speakerName: 'Chancellor Ingrid Lindqvist',
        speakerRole: 'Sovereign Bloc Chair',
        mood: 'SMIRK',
        text: 'Wise restraint. Panic belongs to amateurs. The solar oculus is reopening—decrypt the Giza Cipher Box cleanly on air, and I shall personally seat you inside the closed World Council Conclave in Reykjavik.',
        tellHint:
          'Lindqvist replaces her platinum spectacles as your Damascus Titanium clearance registers.',
        accentTone: 'gold',
        continueLabel: 'UNLOCK CIPHER BOX (5 Qs)',
      },
    ],
  },

  cairo_outro: {
    id: 'cairo_outro',
    beats: [
      {
        id: 'eg_outro_cipher',
        sceneTitle: 'GIZA CIPHER UNLOCKED',
        locationLabel: 'CAIRO · SUB-SANDSTONE VAULT',
        venue: 'EG',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Prodigy Contender',
        mood: 'TENSE',
        text: 'Look inside the cracked Cipher Box—an Icelandic geothermal coordinate etched in brass: 64.1466° N, REYKJAVIK.',
        dynamicText: ({ story }) => {
          const branchNote =
            story.act3Branch === 'WHISTLEBLOWER'
              ? 'You blew the roof off the entire contest live on air. The Council declared us fugitives—and half the planet is rallying behind us.'
              : 'You swallowed the biggest secret in modern geopolitics to walk straight into the lions\' den in Reykjavik. Bold—if it doesn\'t consume you.';
          return `${branchNote} Look inside the Meridian Zero Cipher Box: an active cryo-beacon pulsing right now at 64.1466° N—Reykjavik's Geothermal Basalt Caldera. My brother isn't buried in Cairo. He's transmitting from Iceland.`;
        },
        tellHint: 'A tiny emerald aurora pulse blinks inside the open sandstone cryptex.',
        accentTone: 'cyan',
        sting: 'TWIST',
        continueLabel: 'VIEW CAIRO DOSSIER',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // STAGE 5 (ACT III) — REYKJAVIK (IS, GEOTHERMAL BASALT CALDERA)
  // --------------------------------------------------------------------------
  reykjavik_intro_whistle: {
    id: 'reykjavik_intro_whistle',
    beats: [
      {
        id: 'is_w_crash',
        sceneTitle: 'ACT III · PIRATE BLACK SALON CRASH',
        locationLabel: 'REYKJAVIK · GEOTHERMAL BASALT CALDERA',
        venue: 'IS',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Pirate Broadcast Chief',
        mood: 'SMIRK',
        text: "Welcome to Iceland's sub-glacial basalt caldera—zero Council visas, 100% pirate Black Salon crash! I tapped the aurora dome's geothermal trunk line. Two hundred million citizens are watching our rogue stream... wait—kill the mic! Someone is already down here in the steam!",
        tellHint:
          'Emerald aurora ribbons ripple across volcanic columns as heavy footsteps echo out of the mist.',
        accentTone: 'crimson',
        sting: 'SUMMONS',
        continueLabel: 'STEP INTO THE STEAM',
        nextBeatId: 'is_w_tariq_reveal',
      },
      {
        id: 'is_w_tariq_reveal',
        sceneTitle: "ENDGAME TWIST · VANCE'S TROJAN HORSE",
        locationLabel: 'REYKJAVIK · CRYO-CORE CHAMBER',
        venue: 'IS',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'tariq',
        speakerName: 'Tariq Al-Mansoor',
        speakerRole: 'Trial 00 Winner · "The Ghost of Meridian Zero"',
        mood: 'NEUTRAL',
        text: "Lower the jammer, Teo. I left the Giza beacon open for you. Yes—I'm Tariq Al-Mansoor. And before you call Julian Vance a monster, hear the truth nobody on the Council suspects: I was never his prisoner.",
        tellHint:
          'Tariq holds a glowing hexagonal basalt cryo-prism—identical to the meridian key inside Vance\'s astrolabe.',
        accentTone: 'cyan',
        sting: 'TWIST',
        continueLabel: 'HEAR TARIQ OUT',
        nextBeatId: 'is_w_trojan',
      },
      {
        id: 'is_w_trojan',
        sceneTitle: 'THE GLOBAL CHESS TRAP',
        locationLabel: 'REYKJAVIK · BENEATH THE AURORA',
        venue: 'IS',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'tariq',
        speakerName: 'Tariq Al-Mansoor',
        speakerRole: 'Co-Architect of The Meridian',
        mood: 'IMPRESSED',
        text: 'In 2019, Lindqvist\'s bloc tried to erase me when I caught them rigging The Ledger. Julian faked my disappearance to save my life—and together we engineered THIS entire global broadcast as a Trojan Horse! Put one incorruptible polymath live before two billion witnesses holding BOTH the public mandate and the decryption key, so no superpower can bury the truth in the dark.',
        tellHint:
          'Everything snaps into focus: Geneva, 99.4%, the live cameras—Vance built a shield out of two billion eyeballs.',
        accentTone: 'gold',
        sting: 'CHOICE',
        choices: [
          {
            id: 'is_w_bluff_sync',
            label: "Sync Tariq's Bluff Echo Protocol",
            subtext:
              'Equip Bluff Echo (Flick-Canceling Overclock baits rivals into premature locks + grants +1.5s recovery!) and spar Tariq for the Cryo-Core Relay.',
            tag: '+Bluff Echo Perk · +10 Integrity',
            tagTone: 'cyan',
            effects: {
              integrity: 10,
              publicTrust: 10,
              unlockPerk: 'BLUFF_ECHO',
              autoEquipPerk: true,
              flags: { reykjavik_trojan_truth: true },
              toast: 'Equipped: Bluff Echo — Overclock feints now bait rivals & recover +1.5s!',
            },
            nextBeatId: 'is_w_start',
          },
          {
            id: 'is_w_raw_signal',
            label: 'Keep Pure Pirate Signal',
            subtext:
              'Unlock Bluff Echo in reserve, rally +18 Public Trust on the live aurora feed, and challenge Tariq head-to-head!',
            tag: '+18 Public Trust · Bluff Echo Unlocked',
            tagTone: 'gold',
            effects: {
              publicTrust: 18,
              integrity: 8,
              unlockPerk: 'BLUFF_ECHO',
              autoEquipPerk: false,
              flags: { reykjavik_trojan_truth: true },
              toast: 'Unlocked: Bluff Echo (Vault) · +18 Public Trust on Aurora Stream!',
            },
            nextBeatId: 'is_w_start',
          },
        ],
      },
      {
        id: 'is_w_start',
        sceneTitle: 'CRYO-CORE CALIBRATION',
        locationLabel: 'REYKJAVIK · GEOTHERMAL BASALT CALDERA',
        venue: 'IS',
        lightingState: 'BROADCAST',
        musicLayer: 'DEDUCTION',
        speakerId: 'tariq',
        speakerName: 'Tariq Al-Mansoor',
        speakerRole: 'Meridian Zero · Trial 00 Champion',
        mood: 'SMIRK',
        text: 'Singapore and the Apex Forum will throw everything the blocs have at you. Before I hand over my Cryo-Core decryption relay, prove Julian\'s 99.4% match wasn\'t a fluke. Five questions—show me what you\'ve got.',
        tellHint: 'Tariq\'s basalt relay illuminates the caldera floor in crystalline aurora gold.',
        accentTone: 'cyan',
        continueLabel: 'TEST AGAINST TARIQ (5 Qs)',
      },
    ],
  },

  reykjavik_intro_insider: {
    id: 'reykjavik_intro_insider',
    beats: [
      {
        id: 'is_i_conclave',
        sceneTitle: 'ACT III · THE CLOSED CONCLAVE',
        locationLabel: 'REYKJAVIK · WORLD COUNCIL BASALT DOME',
        venue: 'IS',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'lindqvist',
        speakerName: 'Chancellor Ingrid Lindqvist',
        speakerRole: 'Sovereign Bloc Chair',
        mood: 'NEUTRAL',
        text: 'No public cameras inside Reykjavik\'s geothermal dome—only the inner Conclave. Soren Kael believes your Insider poker face in Cairo was pure bluff. Prove your nerve in our closed-door Conclave Bluff Wager Duel.',
        tellHint:
          'Aurora light shimmers through frosted volcanic skylights onto twelve empty marble seats.',
        accentTone: 'gold',
        sting: 'SUMMONS',
        continueLabel: 'FACE SOREN AT THE TABLE',
        nextBeatId: 'is_i_bluff_choice',
      },
      {
        id: 'is_i_bluff_choice',
        sceneTitle: 'CONCLAVE BLUFF WAGER',
        locationLabel: 'REYKJAVIK · INNER CHAMBER',
        venue: 'IS',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'soren',
        speakerName: 'Soren "Echo" Kael',
        speakerRole: 'Conclave Challenger',
        mood: 'SMIRK',
        text: "No crowd to rescue you here, Insider. Let's play real poker on the Veritas Prism: fake an Overclock charge, flick-cancel to bait my lock, and watch who flinches first. Dare to arm the Bluff Echo circuit?",
        tellHint: "Soren's weighted gold coin taps twice on obsidian—baiting you to match his wager.",
        accentTone: 'gold',
        sting: 'CHOICE',
        choices: [
          {
            id: 'is_i_arm_bluff',
            label: 'Arm Bluff Echo & Raise the Wager',
            subtext:
              'Equip Bluff Echo (Flick-Canceling Overclock baits rivals into premature locks + grants +1.5s recovery!) for the Conclave Duel.',
            tag: 'Bluff Echo Equipped · +12 Council',
            tagTone: 'gold',
            effects: {
              councilFavor: 12,
              unlockPerk: 'BLUFF_ECHO',
              autoEquipPerk: true,
              flags: { reykjavik_bluff_wager: true },
              toast: 'Equipped: Bluff Echo — Flick-Cancel Overclocks to bait Soren!',
            },
            nextBeatId: 'is_i_tariq_secret',
          },
          {
            id: 'is_i_silent_probe',
            label: 'Pocket Bluff Echo & Trace the Cryo-Vent',
            subtext:
              'Unlock Bluff Echo + slip a probe down the sub-caldera vent to uncover who owns the hidden beacon.',
            tag: '+12 Integrity · Bluff Echo Unlocked',
            tagTone: 'cyan',
            effects: {
              integrity: 12,
              unlockPerk: 'BLUFF_ECHO',
              autoEquipPerk: false,
              flags: { reykjavik_bluff_wager: false },
              toast: 'Unlocked: Bluff Echo · Hidden Cryo-Vent signal locked!',
            },
            nextBeatId: 'is_i_tariq_secret',
          },
        ],
      },
      {
        id: 'is_i_tariq_secret',
        sceneTitle: "ENDGAME TWIST · VANCE'S TROJAN HORSE",
        locationLabel: 'REYKJAVIK · SUB-CALDERA SERVICE SHAFT',
        venue: 'IS',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'tariq',
        speakerName: 'Tariq Al-Mansoor',
        speakerRole: 'Trial 00 Winner · "The Ghost of Meridian Zero"',
        mood: 'TENSE',
        text: "Five minutes before the Conclave bell, a hidden basalt door clicks open behind your plinth. I'm Tariq Al-Mansoor—Nadia's brother. Listen fast: Julian Vance didn't imprison me. He saved my life in 2019, and together we built THE MERIDIAN as a Trojan Horse! Only an incorruptible polymath standing live before two billion witnesses can break the blocs' grip on The Ledger. Beat Soren, claim the Cryo-Core Relay, and meet me at the finish.",
        tellHint:
          'Tariq vanishes back into geothermal vapor just as Lindqvist strikes the Conclave gavel.',
        accentTone: 'cyan',
        sting: 'TWIST',
        continueLabel: 'BEGIN CONCLAVE DUEL (5 Qs)',
      },
    ],
  },

  reykjavik_outro: {
    id: 'reykjavik_outro',
    beats: [
      {
        id: 'is_outro_tariq',
        sceneTitle: 'CRYO-CORE RELAY SECURED',
        locationLabel: 'REYKJAVIK · AURORA OVERLOOK',
        venue: 'IS',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'tariq',
        speakerName: 'Tariq Al-Mansoor',
        speakerRole: 'Co-Architect of The Meridian',
        mood: 'IMPRESSED',
        text: 'The Aurora Cryo-Core Relay is yours—the second half of Julian\'s master decryption key. Next stop is Singapore\'s Diplomatic Sky-Bridge directly over The Ledger\'s core monoliths. Stay vigilant: the blocs know the Trojan Horse is loose, and someone inside your circle is already being squeezed to flip.',
        tellHint:
          'Northern lights shimmer across the frozen fjord as your phone flashes an urgent Singapore summons.',
        accentTone: 'cyan',
        sting: 'VICTORY',
        continueLabel: 'VIEW REYKJAVIK DOSSIER',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // STAGE 6 (ACT III CLIMAX) — SINGAPORE (SG, DIPLOMATIC SKY-BRIDGE & CORE)
  // --------------------------------------------------------------------------
  singapore_intro_nadia: {
    id: 'singapore_intro_nadia',
    beats: [
      {
        id: 'sg_n_alarm',
        sceneTitle: 'STAGE 6 · ARTICLE IX LOCKDOWN',
        locationLabel: 'SINGAPORE · DIPLOMATIC SKY-BRIDGE',
        venue: 'SG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'RATTLED',
        text: 'Ultraviolet sirens are sweeping Singapore\'s Sky-Bridge directly above The Ledger Core! Lindqvist invoked Article IX Emergency Suspension—and she didn\'t come alone. Someone you alienated in Rio just signed an amnesty bargain.',
        tellHint: 'Crimson containment shutters slam across the glass canyon 800 feet above the data core.',
        accentTone: 'crimson',
        sting: 'TWIST',
        continueLabel: 'FACE THE BETRAYER',
        nextBeatId: 'sg_n_confront',
      },
      {
        id: 'sg_n_confront',
        sceneTitle: 'PERSONAL BETRAYAL · NADIA\'S BARGAIN',
        locationLabel: 'SINGAPORE · SKY-BRIDGE CORE',
        venue: 'SG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Nemesis Challenger · Council Proxy',
        mood: 'TENSE',
        text: "You left my calibration pod burning in Rio to chase a #1 seed. Lindqvist offered full official amnesty for my brother Tariq—all she asked was your finalist seat before the Apex Forum. I've mapped every weak spot on your 12-domain radar. Take your podium.",
        tellHint:
          'Nadia\'s Rival Prism locks onto your actual weakest trivia domain with razor Grudge Pressure.',
        accentTone: 'crimson',
        sting: 'CHOICE',
        choices: [
          {
            id: 'sg_n_truth',
            label: 'Tell Her Tariq Works With Vance',
            subtext:
              'Hold your integrity under sirens and fight her clean—proving you never needed Lindqvist\'s deals.',
            tag: '+12 Integrity · +10 Public',
            tagTone: 'cyan',
            effects: {
              integrity: 12,
              publicTrust: 10,
              flags: { singapore_stance: 'PRINCIPLED' },
              toast: 'Holding the line under Fracture protocol (+12 Integrity)!',
            },
            nextBeatId: 'sg_n_go',
          },
          {
            id: 'sg_n_ruthless',
            label: 'Call Her Amnesty Deal Hollow',
            subtext:
              'Rattle her composure under Council floodlights and seize ruthless leverage.',
            tag: '-10 Integrity · +10 Council',
            tagTone: 'crimson',
            effects: {
              integrity: -10,
              councilFavor: 10,
              flags: { singapore_stance: 'RUTHLESS' },
              toast: 'Ruthless gambit — Sky-Bridge tensions hit critical!',
            },
            nextBeatId: 'sg_n_go',
          },
        ],
      },
      {
        id: 'sg_n_go',
        sceneTitle: 'SKY-BRIDGE SHOWDOWN',
        locationLabel: 'SINGAPORE · HIGH-ALERT FRACTURE',
        venue: 'SG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Nemesis Challenger',
        mood: 'SMIRK',
        text: 'Words mean nothing eighty floors above The Ledger. Five High-Alert questions for the Fractured Council Seal—survive my Grudge Pressure if you can.',
        tellHint: 'Ultraviolet light filaments surge beneath the glass floor as the Prism ignites.',
        accentTone: 'crimson',
        continueLabel: 'DEFEND YOUR SEAT (5 Qs)',
      },
    ],
  },

  singapore_intro_teo: {
    id: 'singapore_intro_teo',
    beats: [
      {
        id: 'sg_t_alarm',
        sceneTitle: 'STAGE 6 · BACKSTAGE LEAK',
        locationLabel: 'SINGAPORE · DIPLOMATIC SKY-BRIDGE',
        venue: 'SG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'TENSE',
        text: 'Every overhead screen in Singapore\'s Sky-Bridge just flipped to raw backstage audio—every compromise, every off-book deal you cut from Geneva to Cairo is streaming live. Mateo Rojas just hijacked the podium himself.',
        tellHint: 'Crimson telemetry crawls across cantilevered silver ribs high above The Ledger Core.',
        accentTone: 'crimson',
        sting: 'TWIST',
        continueLabel: 'CONFRONT TEO',
        nextBeatId: 'sg_t_confront',
      },
      {
        id: 'sg_t_confront',
        sceneTitle: 'PERSONAL BETRAYAL · TEO\'S EXPOSURE',
        locationLabel: 'SINGAPORE · SKY-BRIDGE CORE',
        venue: 'SG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Rogue Whistleblower',
        mood: 'RATTLED',
        text: "I bled my career to put an outsider on this stage—and you traded your principles at every single stop! I leaked your backstage deals to the global feed myself. If you're really worthy of The Ledger, beat me live with zero backroom lifelines!",
        tellHint: 'Teo\'s eyes burn with hurt and defiance; both wrist rigs lock onto the live broadcast.',
        accentTone: 'crimson',
        sting: 'CHOICE',
        choices: [
          {
            id: 'sg_t_own',
            label: 'Own Your Record on Live Air',
            subtext: 'Face Teo openly and win back public respect through raw mastery.',
            tag: '+14 Integrity · +12 Public',
            tagTone: 'cyan',
            effects: {
              integrity: 14,
              publicTrust: 12,
              flags: { singapore_stance: 'OWNED_UP' },
              toast: 'Facing Teo openly on live feed (+14 Integrity)!',
            },
            nextBeatId: 'sg_t_go',
          },
          {
            id: 'sg_t_cut',
            label: 'Cut His Feed via Council Override',
            subtext: 'Embrace cold power—only results survive the Apex Forum.',
            tag: '-12 Integrity · +14 Council',
            tagTone: 'crimson',
            effects: {
              integrity: -12,
              councilFavor: 14,
              flags: { singapore_stance: 'CUT_FEED' },
              toast: 'Cold power play — Council Favor surges (-12 Integrity).',
            },
            nextBeatId: 'sg_t_go',
          },
        ],
      },
      {
        id: 'sg_t_go',
        sceneTitle: 'HIGH-ALERT BROADCAST',
        locationLabel: 'SINGAPORE · SKY-BRIDGE FRACTURE',
        venue: 'SG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Rogue Challenger',
        mood: 'TENSE',
        text: 'Five High-Alert rounds above the Ledger monoliths. Show two billion viewers whether there\'s an honest mind left underneath all that ambition!',
        tellHint: 'Crimson alarms strobe across Teo\'s Rival Prism as the Chrono-Ring starts spinning.',
        accentTone: 'crimson',
        continueLabel: 'FACE TEO (5 Qs)',
      },
    ],
  },

  singapore_intro_soren: {
    id: 'singapore_intro_soren',
    beats: [
      {
        id: 'sg_s_alarm',
        sceneTitle: 'STAGE 6 · EMERGENCY CHARTER 9B',
        locationLabel: 'SINGAPORE · DIPLOMATIC SKY-BRIDGE',
        venue: 'SG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'lindqvist',
        speakerName: 'Chancellor Ingrid Lindqvist',
        speakerRole: 'Sovereign Bloc Chair · "The Kingmaker"',
        mood: 'SMIRK',
        text: 'You refused to kneel in London, Tokyo, and Cairo—so the Council invokes Emergency Charter 9B. You are formally indicted for archive interference. Effective immediately, Soren Kael is crowned Interim Arbiter.',
        tellHint: 'Lindqvist slowly removes her platinum spectacles as crimson lockdown beams seal the bridge.',
        accentTone: 'crimson',
        sting: 'TWIST',
        continueLabel: 'CONFRONT SOREN',
        nextBeatId: 'sg_s_confront',
      },
      {
        id: 'sg_s_confront',
        sceneTitle: 'PERSONAL BETRAYAL · INTERIM ARBITER',
        locationLabel: 'SINGAPORE · SKY-BRIDGE CORE',
        venue: 'SG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'soren',
        speakerName: 'Soren "Echo" Kael',
        speakerRole: 'Interim Arbiter · Council Enforcer',
        mood: 'SMIRK',
        text: "Nothing personal, pal—strictly arbitrage. Sovereign and Horizon pooled their votes, handed me the interim gavel, and told me to bury you before International Waters. Beat me right now under Fracture sirens, or hand over your passport.",
        tellHint: "Soren's weighted gold coin flashes crimson as the Fractured Council Seal rises.",
        accentTone: 'crimson',
        sting: 'CHOICE',
        choices: [
          {
            id: 'sg_s_defy',
            label: 'Challenge Charter 9B Live on Air',
            subtext: 'Force Lindqvist\'s coup into full daylight before the global audience.',
            tag: '+12 Integrity · +14 Public',
            tagTone: 'cyan',
            effects: {
              integrity: 12,
              publicTrust: 14,
              flags: { singapore_stance: 'DEFIANT' },
              toast: 'Global audience erupts — Charter 9B exposed (+14 Public Trust)!',
            },
            nextBeatId: 'sg_s_go',
          },
          {
            id: 'sg_s_leverage',
            label: 'Threaten Mutual Exposure of Horizon',
            subtext: 'Counter-bluff Soren and Lindqvist with Cairo\'s encrypted leverage.',
            tag: '-8 Integrity · +12 Council',
            tagTone: 'gold',
            effects: {
              integrity: -8,
              councilFavor: 12,
              flags: { singapore_stance: 'LEVERAGE' },
              toast: 'Counter-leverage deployed — Soren\'s coin wobbles!',
            },
            nextBeatId: 'sg_s_go',
          },
        ],
      },
      {
        id: 'sg_s_go',
        sceneTitle: 'SKY-BRIDGE SHOWDOWN',
        locationLabel: 'SINGAPORE · HIGH-ALERT FRACTURE',
        venue: 'SG',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'soren',
        speakerName: 'Soren "Echo" Kael',
        speakerRole: 'Interim Arbiter',
        mood: 'TELL',
        text: 'Five High-Alert questions for the Fractured Council Seal! Survive my Overclock blitz if you want a ticket to The Apex Forum.',
        tellHint: 'Vertical cyan and crimson server filaments roar beneath the Sky-Bridge glass.',
        accentTone: 'crimson',
        continueLabel: 'RECLAIM YOUR SEAT (5 Qs)',
      },
    ],
  },

  singapore_outro: {
    id: 'singapore_outro',
    beats: [
      {
        id: 'sg_outro_vance',
        sceneTitle: 'CHARTER 9B SHATTERED',
        locationLabel: 'SINGAPORE · LEDGER OVERLOOK',
        venue: 'SG',
        lightingState: 'BROADCAST',
        musicLayer: 'STREAK',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'IMPRESSED',
        text: 'Article IX is void. You broke their coup live above The Ledger Core and claimed the Fractured Council Seal. Two billion viewers are already tuned to International Waters—board the hydrofoil for Stage 7: THE APEX FORUM.',
        dynamicText: ({ betrayer, lastMatchWon }) => {
          const who =
            betrayer === 'nadia'
              ? 'Nadia\'s desperate bargain'
              : betrayer === 'teo'
                ? 'Teo\'s public ambush'
                : 'Lindqvist and Soren\'s Charter 9B coup';
          const outcome = lastMatchWon
            ? `You shattered ${who} cleanly under ultraviolet sirens.`
            : `Even through ${who}, you forced the Fractured Council Seal open in front of the world.`;
          return `${outcome} The hydrofoil to International Waters is idling on the deck. Two billion witnesses await at THE APEX FORUM—where you and I settle the fate of The Ledger face-to-face.`;
        },
        tellHint:
          'Vance taps his right-ear stylus three times—the Trojan Horse has reached its final square.',
        accentTone: 'gold',
        sting: 'VICTORY',
        continueLabel: 'VIEW SINGAPORE DOSSIER',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // STAGE 7 (ACT IV GRAND FINALE) — INT'L WATERS (GLOBAL, THE APEX FORUM)
  // --------------------------------------------------------------------------
  apex_intro: {
    id: 'apex_intro',
    beats: [
      {
        id: 'apex_citadel',
        sceneTitle: 'ACT IV GRAND FINALE · THE APEX FORUM',
        locationLabel: "INT'L WATERS · MARITIME CITADEL",
        venue: 'GLOBAL',
        lightingState: 'BROADCAST',
        musicLayer: 'INTERVIEW',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator · "The Maestro"',
        mood: 'IMPRESSED',
        text: 'Welcome to International Waters—sovereign soil of no nation on Earth. Counter-rotating titanium rings overhead, storm-lit moonlight on the sea, and TWO BILLION live viewers holding their breath. Everything from Geneva led to this dais.',
        tellHint:
          'Floating gold embers rise around the central plinth as the Master Ledger Core hums below.',
        accentTone: 'gold',
        sting: 'SUMMONS',
        continueLabel: 'CHECK THE STAGE',
        nextBeatId: 'apex_allies_check',
      },
      {
        id: 'apex_allies_check',
        sceneTitle: 'TWO BILLION WITNESSES',
        locationLabel: "INT'L WATERS · EQUATORIAL DAIS",
        venue: 'GLOBAL',
        lightingState: 'INTIMATE',
        musicLayer: 'INTERVIEW',
        speakerId: 'tariq',
        speakerName: 'Tariq Al-Mansoor',
        speakerRole: 'Trial 00 Architect',
        mood: 'NEUTRAL',
        text: 'The decryption bridge is armed. Clear all three phases of the Apex Forum and the Master Ledger Core opens live on air—forever beyond any bloc\'s reach.',
        dynamicText: ({ story }) => {
          const allyNote =
            story.bonds.nadia === 'ALLIED'
              ? 'Nadia and I are holding the acoustic relay steady from the gallery—we have your back.'
              : 'Even without Nadia at your side, the Reykjavik Cryo-Relay is synced to your plinth.';
          const pathNote =
            story.act3Branch === 'WHISTLEBLOWER'
              ? ' Two billion citizens tuned in because you dared to broadcast from Cairo.'
              : ' Every delegate in this amphitheater thinks they own you—prove them dead wrong.';
          return `${allyNote}${pathNote} Clear the Gauntlet, survive your Rival Reckoning, and beat Julian Vance himself to unlock the Master Ledger Core.`;
        },
        tellHint: 'Tariq nods once from the shadowed balcony as the broadcast horns echo across the water.',
        accentTone: 'cyan',
        continueLabel: 'HEAR THE FINAL RULES',
        nextBeatId: 'apex_vance_gambit',
      },
      {
        id: 'apex_vance_gambit',
        sceneTitle: 'THE THREE-PHASE SHOWDOWN',
        locationLabel: "INT'L WATERS · THE APEX FORUM",
        venue: 'GLOBAL',
        lightingState: 'BROADCAST',
        musicLayer: 'DEDUCTION',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Chief Adjudicator · Final Opponent',
        mood: 'SMIRK',
        text: 'Six questions across three historic phases: Phase I — The Gauntlet of the World against Chancellor Lindqvist; Phase II — Your Rival Reckoning; and Phase III — THE ARBITER\'S GAMBIT, head-to-head against ME on the Master Ledger Core. Step into the beam, World\'s Smartest.',
        tellHint: 'Vance removes his brass astrolabe and lays it beside the central Veritas Prism.',
        accentTone: 'gold',
        continueLabel: 'BEGIN GRAND FINALE (6 Qs)',
      },
    ],
  },

  apex_mid_gambit: {
    id: 'apex_mid_gambit',
    beats: [
      {
        id: 'apex_vance_steps_in',
        sceneTitle: "PHASE III · THE ARBITER'S GAMBIT",
        locationLabel: "INT'L WATERS · MASTER LEDGER CORE",
        venue: 'GLOBAL',
        lightingState: 'BROADCAST',
        musicLayer: 'STREAK',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator · "The Maestro"',
        mood: 'IMPRESSED',
        text: 'Two phases down. Lindqvist silent, your rivals spent, and two billion screens frozen on this single plinth. Now—no proxies, no faction shields. Just you, Julian Vance, and the Master Ledger Core. Two final questions. Show humanity who deserves the veto key!',
        tellHint:
          'Vance adjusts his left brass cufflink one final time—not hiding anything now, purely electrified.',
        accentTone: 'gold',
        sting: 'TWIST',
        continueLabel: 'FACE JULIAN VANCE (FINAL 2 Qs)',
      },
    ],
  },

  apex_finale_choice: {
    id: 'apex_finale_choice',
    beats: [
      {
        id: 'apex_ledger_open',
        sceneTitle: 'THE MASTER LEDGER UNLOCKED',
        locationLabel: "INT'L WATERS · LIVE TO 2 BILLION",
        venue: 'GLOBAL',
        lightingState: 'BROADCAST',
        musicLayer: 'INTERVIEW',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Chief Adjudicator',
        mood: 'IMPRESSED',
        text: 'Magnificent. The Master Ledger Core has unfolded live before two billion human beings. Every suppressed climate treaty, every rigged market forecast, every sovereign secret hovers beneath your fingertips. The $100M crown and the lone human veto key are yours. What do you decree?',
        dynamicTellHint: ({ story }) => {
          const unlockedSecret = isSecretArchitectEndingUnlocked(story);
          return unlockedSecret
            ? 'SECRET PATH UNLOCKED: Your High Integrity, Inner-Circle Alliance & Public Mandate opened the 4th True Ending!'
            : `Your Dossier — Integrity ${story.axisIntegrity >= 0 ? '+' : ''}${story.axisIntegrity} · Public ${story.publicTrust} · Council ${story.councilFavor} (Hint: High Integrity + Allied Bond + Public Trust unlocks a 4th Secret Ending).`;
        },
        accentTone: 'gold',
        sting: 'CHOICE',
        dynamicChoices: ({ story }) => {
          const choices: CampaignChoiceDef[] = [];

          if (isSecretArchitectEndingUnlocked(story)) {
            choices.push({
              id: 'end_architect',
              label: "SECRET TRUE ENDING · Rewrite the Meridian Charter",
              subtext:
                "Refuse unilateral power! Dissolve the lone Arbiter throne and transform World's Smartest into a permanent rotating Global Citizen Council.",
              tag: '★ TRUE ENDING · ARCHITECT\'S SUCCESSION',
              tagTone: 'cyan',
              effects: {
                endingAwarded: 'ARCHITECT_SUCCESSION',
                unlockSkin: 'KYOTO_KINTSUGI',
                toast: 'SECRET TRUE ENDING UNLOCKED: The Architect\'s Succession!',
              },
              nextBeatId: 'ending_architect',
            });
          }

          choices.push(
            {
              id: 'end_sovereign',
              label: 'Claim the Arbiter\'s Seat & Reform The Ledger',
              subtext:
                'Use treaty law to purge corrupt bloc chairs cleanly and guard The Ledger from the Sovereign Arbiter\'s chair.',
              tag:
                story.councilFavor >= 55 && story.axisIntegrity >= 0
                  ? '★ ALIGNED · SOVEREIGN ARBITER'
                  : 'ENDING I · SOVEREIGN ARBITER',
              tagTone: 'gold',
              effects: {
                endingAwarded: 'SOVEREIGN_ARBITER',
                unlockSkin: 'KYOTO_KINTSUGI',
                toast: 'Ending Unlocked: The Sovereign Arbiter!',
              },
              nextBeatId: 'ending_sovereign',
            },
            {
              id: 'end_commons',
              label: 'Open-Source The Ledger Live to 2 Billion Viewers',
              subtext:
                'Trigger Tariq & Teo\'s override—forfeiting the $100M crown to hand humanity\'s hidden truth directly to the public!',
              tag:
                story.publicTrust >= 60 || story.act3Branch === 'WHISTLEBLOWER'
                  ? '★ ALIGNED · THE OPEN COMMONS'
                  : 'ENDING II · THE OPEN COMMONS',
              tagTone: 'cyan',
              effects: {
                endingAwarded: 'OPEN_COMMONS',
                unlockSkin: 'KYOTO_KINTSUGI',
                toast: 'Ending Unlocked: The Open Commons!',
              },
              nextBeatId: 'ending_commons',
            },
            {
              id: 'end_kingmaker',
              label: 'Seize Unilateral Control Atop the Spire',
              subtext:
                'Outplay Vance, bind the surviving blocs to your will, and rule The Ledger as the undisputed Kingmaker.',
              tag:
                story.axisIntegrity < 10
                  ? '★ ALIGNED · THE KINGMAKER'
                  : 'ENDING III · THE KINGMAKER',
              tagTone: 'crimson',
              effects: {
                endingAwarded: 'KINGMAKER',
                unlockSkin: 'KYOTO_KINTSUGI',
                toast: 'Ending Unlocked: The Kingmaker!',
              },
              nextBeatId: 'ending_kingmaker',
            }
          );

          return choices;
        },
      },
      {
        id: 'ending_sovereign',
        sceneTitle: 'ENDING I · THE SOVEREIGN ARBITER',
        locationLabel: 'GENEVA · NEW CHARTER ASSEMBLY',
        venue: 'GLOBAL',
        lightingState: 'BROADCAST',
        musicLayer: 'STREAK',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Chief Adjudicator',
        mood: 'IMPRESSED',
        text: 'With a single brass stamp, you ratify the Geneva Transparency Amendment live before two billion witnesses. Lindqvist\'s secret clauses dissolve overnight. The Master Ledger remains guarded, incorruptible—and Julian Vance hands you his pocket astrolabe with a rare bow. "Well played, First Citizen Arbiter."',
        tellHint: 'Permanent Ending Badge & Kyoto Kintsugi Gold Prism Skin inscribed on your Passport.',
        accentTone: 'gold',
        sting: 'VICTORY',
        continueLabel: 'VIEW FINALE SEAL',
      },
      {
        id: 'ending_commons',
        sceneTitle: 'ENDING II · THE OPEN COMMONS',
        locationLabel: 'EARTH · EIGHT BILLION SCREENS IGNITE',
        venue: 'GLOBAL',
        lightingState: 'BROADCAST',
        musicLayer: 'STREAK',
        speakerId: 'teo',
        speakerName: 'Mateo "Teo" Rojas',
        speakerRole: 'Open Commons Signal Chief',
        mood: 'IMPRESSED',
        text: 'You slam Tariq\'s override switch—and the Master Ledger bursts across every phone, square, and classroom on Earth! You walk away from the $100M vault empty-handed, stepping onto the wet deck as Nadia, Tariq, and Teo laugh beneath a storm clearing into dawn. No council owns truth anymore.',
        tellHint: 'Permanent Ending Badge & Kyoto Kintsugi Gold Prism Skin inscribed on your Passport.',
        accentTone: 'cyan',
        sting: 'VICTORY',
        continueLabel: 'VIEW FINALE SEAL',
      },
      {
        id: 'ending_kingmaker',
        sceneTitle: 'ENDING III · THE KINGMAKER',
        locationLabel: 'THE EQUATORIAL SPIRE · ALONE AT THE SUMMIT',
        venue: 'GLOBAL',
        lightingState: 'FRACTURE',
        musicLayer: 'FRACTURE',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Host & Chief Adjudicator',
        mood: 'SMIRK',
        text: 'The blocs kneel. The Master Ledger locks to your lone biometric seal, and the $100M crown gleams heavy in the silent spire. Far below in Geneva, Julian Vance closes your dossier with a polite sigh—and slips a matte-black summons under another stranger\'s door: "PSYCHOMETRIC MATCH: 99.6%. Geneva awaits."',
        tellHint: 'Permanent Ending Badge & Kyoto Kintsugi Gold Prism Skin inscribed on your Passport.',
        accentTone: 'crimson',
        sting: 'TWIST',
        continueLabel: 'VIEW FINALE SEAL',
      },
      {
        id: 'ending_architect',
        sceneTitle: "SECRET TRUE ENDING · ARCHITECT'S SUCCESSION",
        locationLabel: 'THE APEX FORUM · GLOBAL CITIZEN COUNCIL',
        venue: 'GLOBAL',
        lightingState: 'BROADCAST',
        musicLayer: 'STREAK',
        speakerId: 'tariq',
        speakerName: 'Tariq Al-Mansoor',
        speakerRole: 'Co-Architect of the New Meridian',
        mood: 'IMPRESSED',
        text: 'You refuse the crown altogether—rewriting the Meridian Charter live before two billion witnesses! No single genius will ever hold unilateral veto again. Every Daily Global Feed and World Council Trial now seats rotating citizen stewards beside you, Nadia, Teo, and Julian Vance. Humanity\'s sharpest minds, answering only to each other.',
        tellHint: 'TRUE ENDING SEAL & Kyoto Kintsugi Gold Prism Skin permanently inscribed on your Passport!',
        accentTone: 'cyan',
        sting: 'VICTORY',
        continueLabel: 'VIEW TRUE ENDING SEAL',
      },
    ],
  },
};

export function resolveBeatChoices(
  beat: DialogueBeatDef,
  ctx: DialogueContext
): CampaignChoiceDef[] | undefined {
  if (beat.dynamicChoices) {
    return beat.dynamicChoices(ctx);
  }
  return beat.choices;
}

export function buildDialogueDisplay(
  beat: DialogueBeatDef,
  beatIndex: number,
  totalBeats: number,
  ctx: DialogueContext
): DialogueDisplay {
  const text = beat.dynamicText ? beat.dynamicText(ctx) : beat.text;
  const tellHint = beat.dynamicTellHint ? beat.dynamicTellHint(ctx) : beat.tellHint;
  const resolvedChoices = resolveBeatChoices(beat, ctx);
  const choices: StoryChoice[] | undefined = resolvedChoices?.map((c) => ({
    id: c.id,
    label: c.label,
    subtext: c.subtext,
    tag: c.tag,
    tagTone: c.tagTone,
  }));

  let beatProgress: string | undefined;
  if (beat.id === 'apex_ledger_open') {
    beatProgress = 'FINAL DECREE';
  } else if (beat.id.startsWith('ending_')) {
    beatProgress = 'EPILOGUE';
  } else if (totalBeats > 1) {
    beatProgress = `${beatIndex + 1} / ${totalBeats}`;
  }

  return {
    sceneTitle: beat.sceneTitle,
    locationLabel: beat.locationLabel,
    speakerId: beat.speakerId,
    speakerName: beat.speakerName,
    speakerRole: beat.speakerRole,
    text,
    tellHint,
    choices,
    continueLabel: choices ? undefined : (beat.continueLabel ?? 'CONTINUE'),
    accentTone: beat.accentTone ?? 'gold',
    beatProgress,
  };
}

export function buildCampaignNodes(story: StoryStateSnapshot): CampaignNodeMeta[] {
  const prologueDone = story.prologueComplete;
  const londonDone = story.completedCampaignNodes.includes('gb_london');
  const blackSalonDone = story.completedCampaignNodes.includes('gb_black_salon');
  const tokyoDone = story.completedCampaignNodes.includes('jp_tokyo');
  const act2Unlocked = londonDone && tokyoDone;
  const rioDone = story.completedCampaignNodes.includes('br_rio');
  const cairoDone = story.completedCampaignNodes.includes('eg_cairo');
  const reykjavikDone = story.completedCampaignNodes.includes('is_reykjavik');
  const singaporeDone = story.completedCampaignNodes.includes('sg_singapore');
  const apexDone = story.completedCampaignNodes.includes('global_apex');
  const endingsCount = (story.achievedEndings ?? []).length;

  const nodes: CampaignNodeMeta[] = [
    {
      id: 'ch_prologue',
      country: 'CH',
      city: 'Geneva',
      venueName: 'The Vetting Chamber',
      subtitle: prologueDone
        ? 'Completed · Replay 4-Q Screening & Astrolabe Calibration'
        : 'Prologue · 4-Question Interactive Screening with Julian Vance',
      status: prologueDone ? 'COMPLETED' : 'AVAILABLE',
      factionLabel: 'THE MERIDIAN',
    },
    {
      id: 'gb_london',
      country: 'GB',
      city: 'London',
      venueName: 'The Sovereign Rotunda',
      subtitle: !prologueDone
        ? 'Complete Geneva Vetting to unlock Act I Charter Flight'
        : londonDone
          ? 'Completed · Replay Duel vs. Nadia & Armillary Orrery Boss'
          : "Act I · 5-Q Duel vs. Nadia Al-Mansoor + Lindqvist's Sealed Briefing",
      status: !prologueDone ? 'LOCKED' : londonDone ? 'COMPLETED' : 'AVAILABLE',
      factionLabel: 'SOVEREIGN BLOC',
    },
  ];

  if (story.blackSalonUnlocked) {
    nodes.push({
      id: 'gb_black_salon',
      country: 'GB',
      city: 'London',
      venueName: 'The Black Salon (Underground)',
      subtitle: blackSalonDone
        ? 'Cleared · Replay 4-Q Fracture Blitz (2x Points · Tier-3 Locked)'
        : "Hidden Node · Teo's Off-Grid 4-Q Fracture Match (2x Points · Tier-3 Locked)",
      status: blackSalonDone ? 'COMPLETED' : 'AVAILABLE',
      factionLabel: 'OFF-GRID UNDERGROUND',
      isBlackSalon: true,
    });
  }

  nodes.push(
    {
      id: 'jp_tokyo',
      country: 'JP',
      city: 'Tokyo',
      venueName: 'Shinkansen Sky Pavilion',
      subtitle: !prologueDone
        ? 'Complete Geneva Vetting to unlock Act I Charter Flight'
        : tokyoDone
          ? 'Completed · Replay Duel vs. Soren Kael & Origami Prism Boss'
          : 'Act I · 5-Q Duel vs. Soren "Echo" Kael + Live Signal Jammer Fork',
      status: !prologueDone ? 'LOCKED' : tokyoDone ? 'COMPLETED' : 'AVAILABLE',
      factionLabel: 'HORIZON COLLECTIVE',
    },
    {
      id: 'br_rio',
      country: 'BR',
      city: 'Rio de Janeiro',
      venueName: 'Botanical Glass Canopy',
      subtitle: !act2Unlocked
        ? 'Clear London & Tokyo (Act I) to unlock Act II Charter'
        : rioDone
          ? 'Completed · Replay Nadia Pod Choice & Emerald Sphere Boss'
          : 'Act II · Save or Abandon Nadia · Emerald Resonance Sphere',
      status: !act2Unlocked ? 'LOCKED' : rioDone ? 'COMPLETED' : 'AVAILABLE',
      factionLabel: 'AGORA COALITION',
    },
    {
      id: 'eg_cairo',
      country: 'EG',
      city: 'Cairo / Giza',
      venueName: 'Solar Acoustic Hall',
      subtitle: !rioDone
        ? 'Complete Rio de Janeiro to unlock Cairo / Giza'
        : cairoDone
          ? 'Completed · Replay Meridian Zero Twist & Act III Fork'
          : 'Act II Climax · Meridian Zero Vault · Whistleblower vs. Insider Fork',
      status: !rioDone ? 'LOCKED' : cairoDone ? 'COMPLETED' : 'AVAILABLE',
      factionLabel: 'MERIDIAN ZERO',
    },
    {
      id: 'is_reykjavik',
      country: 'IS',
      city: 'Reykjavik',
      venueName: 'Geothermal Basalt Caldera',
      subtitle: !cairoDone
        ? 'Complete Cairo / Giza to unlock Act III'
        : reykjavikDone
          ? "Completed · Replay Vance's Trojan Horse & Cryo-Core Relay"
          : story.act3Branch === 'INSIDER'
            ? 'Act III (Insider) · Conclave Bluff Duel & Tariq Al-Mansoor Reveal'
            : 'Act III (Whistleblower) · Pirate Black Salon Crash & Tariq Reveal',
      status: !cairoDone ? 'LOCKED' : reykjavikDone ? 'COMPLETED' : 'AVAILABLE',
      factionLabel: story.act3Branch === 'INSIDER' ? 'COUNCIL CONCLAVE' : 'PIRATE BLACK SALON',
    },
    {
      id: 'sg_singapore',
      country: 'SG',
      city: 'Singapore',
      venueName: 'Diplomatic Sky-Bridge & Core',
      subtitle: !reykjavikDone
        ? 'Complete Reykjavik to unlock Singapore Sky-Bridge'
        : singaporeDone
          ? 'Completed · Replay Inner-Circle Betrayal & Council Seal Boss'
          : 'Act III Climax · Dynamic Personal Betrayal in High-Alert Fracture',
      status: !reykjavikDone ? 'LOCKED' : singaporeDone ? 'COMPLETED' : 'AVAILABLE',
      factionLabel: 'WORLD COUNCIL CORE',
    },
    {
      id: 'global_apex',
      country: 'GLOBAL',
      city: "Int'l Waters",
      venueName: 'The Apex Forum',
      subtitle: !singaporeDone
        ? 'Complete Singapore to unlock the Act IV Grand Finale'
        : apexDone
          ? `Finale Cleared · ${endingsCount}/4 Endings Unlocked · Replay for Alternate Endings`
          : "Act IV Grand Finale · 3-Phase 6-Q Showdown vs. Julian Vance & 4 Endings",
      status: !singaporeDone ? 'LOCKED' : apexDone ? 'COMPLETED' : 'AVAILABLE',
      factionLabel: 'THE APEX FORUM',
    }
  );

  return nodes;
}

export interface EndlessStrataInfo {
  strataName: 'PUBLIC STRATA' | 'DIPLOMATIC VAULTS' | 'MERIDIAN ZERO CORE';
  lightingState: LightingState;
  timePenaltySec: number;
  scoreMultiplier: number;
  lockTier3: boolean;
  targetIrtRange: [number, number];
  loreSnippets: string[];
}

export function getEndlessStrataForFloor(floor: number): EndlessStrataInfo {
  if (floor <= 5) {
    return {
      strataName: 'PUBLIC STRATA',
      lightingState: 'ARCHIVE',
      timePenaltySec: 0,
      scoreMultiplier: 1.0,
      lockTier3: false,
      targetIrtRange: [-0.8, 0.3],
      loreSnippets: [
        'LEDGER LOG 01 // GENEVA CHARTER: "One unaffiliated human veto key prevents any treaty bloc from weaponizing planetary forecasts."',
        'LEDGER LOG 02 // PUBLIC FEED TELEMETRY: "400,118 candidates screened globally. Only one crossed the 99.4% psychometric threshold."',
      ],
    };
  }
  if (floor <= 10) {
    return {
      strataName: 'DIPLOMATIC VAULTS',
      lightingState: 'INTIMATE',
      timePenaltySec: 2.0,
      scoreMultiplier: 1.25,
      lockTier3: false,
      targetIrtRange: [0.4, 1.4],
      loreSnippets: [
        'REDACTED CABLE // SOVEREIGN BLOC: "Lindqvist requested archival seal on Drawer 00-2019 prior to London Rotunda broadcast."',
        'HORIZON INTERCEPT // TOKYO SPIRE: "Sub-vocal probability telemetry approved for Contender Kael under off-book clause 7B."',
      ],
    };
  }
  return {
    strataName: 'MERIDIAN ZERO CORE',
    lightingState: 'FRACTURE',
    timePenaltySec: 3.5,
    scoreMultiplier: 1.5,
    lockTier3: floor >= 15,
    targetIrtRange: [1.3, 2.6],
    loreSnippets: [
      'MERIDIAN ZERO // EYES ONLY: "Trial 00 winner Tariq Al-Mansoor was NOT neutralized. Relocation authorized personally by J. Vance."',
      'APEX PROTOCOL // FINAL ENTRY: "If the new candidate reaches Cairo with clean hands, initiate Trojan Horse broadcast before 2 billion witnesses."',
    ],
  };
}
