// ============================================================================
// WORLD'S SMARTEST — Meridian Diplomatic Passport & Challenger Identity System
// Implements PITCH_BIBLE.md §2.2, §6.3, §7.1 + Real Challenger Name Entry
// ============================================================================

export type DomainId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type FactionId = 'SOVEREIGN' | 'HORIZON' | 'AGORA';

export type OriginId = 'ACADEMIC' | 'POLYMATH' | 'STRATEGIST';

export type PersonaId = 'MAVERICK' | 'DIPLOMAT' | 'ANALYST' | 'PRODIGY';

export type HubId = 'ch' | 'gb' | 'jp' | 'br' | 'eg' | 'is' | 'sg' | 'global';

export type GlobeCountryCode = 'CH' | 'GB' | 'JP' | 'BR' | 'EG' | 'IS' | 'SG' | 'GLOBAL';

export type HeroRelicId =
  | 'meridian_astrolabe'
  | 'armillary_orrery'
  | 'origami_prism'
  | 'emerald_sphere'
  | 'cipher_box'
  | 'cryo_relay'
  | 'council_seal'
  | 'master_ledger';

export type PrismSkinId =
  | 'OBSIDIAN_BRASS'
  | 'KYOTO_KINTSUGI'
  | 'DAMASCUS_TITANIUM'
  | 'EMERALD_SOVEREIGN'
  | 'BLACK_SALON_CRIMSON';

export type EndingId =
  | 'SOVEREIGN_ARBITER'
  | 'OPEN_COMMONS'
  | 'KINGMAKER'
  | 'ARCHITECT_SUCCESSION';

export type PerkId =
  | 'DIPLOMATIC_REDACTION'
  | 'CLEAN_HANDS'
  | 'HORIZON_LENS'
  | 'ANALOG_STATIC_MASTER'
  | 'DIPLOMAT_COMPOSURE'
  | 'MAVERICK_GAMBIT'
  | 'COOP_CROSSCHECK'
  | 'PEOPLES_LENS'
  | 'COUNCIL_OVERRIDE'
  | 'BLUFF_ECHO';

export interface SovereignDomainMeta {
  id: DomainId;
  key: string;
  name: string;
  shortName: string;
  medallionUrl: string;
  accentHex: string;
  secondaryHex: string;
  materialLabel: string;
  factionAffinity: FactionId;
}

export const SOVEREIGN_DOMAINS: readonly SovereignDomainMeta[] = [
  {
    id: 0,
    key: 'HISTORY',
    name: 'History',
    shortName: 'History',
    medallionUrl: 'assets/ui/cat_0.png',
    accentHex: '#d4a853',
    secondaryHex: '#6c4d26',
    materialLabel: 'Aged Bronze Patina',
    factionAffinity: 'SOVEREIGN',
  },
  {
    id: 1,
    key: 'SCIENCE',
    name: 'Science',
    shortName: 'Science',
    medallionUrl: 'assets/ui/cat_1.png',
    accentHex: '#48b8f0',
    secondaryHex: '#184e77',
    materialLabel: 'Iridescent Cobalt',
    factionAffinity: 'HORIZON',
  },
  {
    id: 2,
    key: 'GEOGRAPHY',
    name: 'Geography',
    shortName: 'Geography',
    medallionUrl: 'assets/ui/cat_2.png',
    accentHex: '#38c793',
    secondaryHex: '#17594a',
    materialLabel: 'Topographic Brass',
    factionAffinity: 'AGORA',
  },
  {
    id: 3,
    key: 'ARTS',
    name: 'Arts & Culture',
    shortName: 'Arts',
    medallionUrl: 'assets/ui/cat_3.png',
    accentHex: '#e6c78b',
    secondaryHex: '#7d5a50',
    materialLabel: 'Carrara & Kintsugi',
    factionAffinity: 'SOVEREIGN',
  },
  {
    id: 4,
    key: 'POP',
    name: 'Film, Music & Pop',
    shortName: 'Film & Pop',
    medallionUrl: 'assets/ui/cat_4.png',
    accentHex: '#e85d99',
    secondaryHex: '#5a1e4d',
    materialLabel: 'Obsidian Lacquer',
    factionAffinity: 'AGORA',
  },
  {
    id: 5,
    key: 'SPORTS',
    name: 'Sports & Games',
    shortName: 'Sports',
    medallionUrl: 'assets/ui/cat_5.png',
    accentHex: '#f08a3e',
    secondaryHex: '#6e3514',
    materialLabel: 'Carbon Graphite',
    factionAffinity: 'AGORA',
  },
  {
    id: 6,
    key: 'TECH',
    name: 'Tech & Engineering',
    shortName: 'Tech',
    medallionUrl: 'assets/ui/cat_6.png',
    accentHex: '#5ce1e6',
    secondaryHex: '#1c4459',
    materialLabel: 'Etched PCB Gold',
    factionAffinity: 'HORIZON',
  },
  {
    id: 7,
    key: 'NATURE',
    name: 'Nature & Biology',
    shortName: 'Nature',
    medallionUrl: 'assets/ui/cat_7.png',
    accentHex: '#58d66b',
    secondaryHex: '#1c4d2e',
    materialLabel: 'Basalt & Jade Vein',
    factionAffinity: 'AGORA',
  },
  {
    id: 8,
    key: 'SOCIETY',
    name: 'World Affairs & Law',
    shortName: 'World Affairs',
    medallionUrl: 'assets/ui/cat_8.png',
    accentHex: '#c8b89d',
    secondaryHex: '#4f463b',
    materialLabel: 'Portland Limestone',
    factionAffinity: 'SOVEREIGN',
  },
  {
    id: 9,
    key: 'FOOD',
    name: 'Food, Design & Craft',
    shortName: 'Craft',
    medallionUrl: 'assets/ui/cat_9.png',
    accentHex: '#e08e5a',
    secondaryHex: '#69341d',
    materialLabel: 'Hammered Copper',
    factionAffinity: 'AGORA',
  },
  {
    id: 10,
    key: 'MYTH',
    name: 'Myth, Lit & Philosophy',
    shortName: 'Myth & Lit',
    medallionUrl: 'assets/ui/cat_10.png',
    accentHex: '#8d7bf0',
    secondaryHex: '#2f2966',
    materialLabel: 'Lapis & Astral Gold',
    factionAffinity: 'SOVEREIGN',
  },
  {
    id: 11,
    key: 'LOGIC',
    name: 'Logic, Math & Cryptic',
    shortName: 'Logic',
    medallionUrl: 'assets/ui/cat_11.png',
    accentHex: '#f5d469',
    secondaryHex: '#3c2e63',
    materialLabel: 'Dichroic Refraction',
    factionAffinity: 'HORIZON',
  },
];

export function getSovereignDomainMeta(id: number): SovereignDomainMeta {
  const safeIdx = Math.max(0, Math.min(11, Math.floor(id))) as DomainId;
  return SOVEREIGN_DOMAINS[safeIdx];
}

export interface OriginDefinition {
  id: OriginId;
  title: string;
  shortLabel: string;
  subtitle: string;
  vanceReaction: string;
  affinityDomains: DomainId[];
  initialAxesDelta: {
    integrity: number;
    publicTrust: number;
    councilFavor: number;
  };
}

export const ORIGIN_DEFINITIONS: Record<OriginId, OriginDefinition> = {
  ACADEMIC: {
    id: 'ACADEMIC',
    title: 'Disgraced Academic',
    shortLabel: 'Disgraced Academic',
    subtitle:
      'Published suppressed findings your university tried to bury. They kept the chair; you kept the proof.',
    vanceReaction:
      'Institutions fear anyone who checks the footnotes, {challengerName}. Nadia Al-Mansoor will respect your rigor.',
    affinityDomains: [0, 1, 8, 10],
    initialAxesDelta: { integrity: 10, publicTrust: 4, councilFavor: -4 },
  },
  POLYMATH: {
    id: 'POLYMATH',
    title: 'Street-Smart Polymath',
    shortLabel: 'Street-Smart Polymath',
    subtitle:
      'Self-taught across twelve disciplines far outside ivory walls—connecting patterns specialists miss.',
    vanceReaction:
      'No syndicate pedigree, no handler, no leash. Two billion viewers love an outsider, {challengerName}.',
    affinityDomains: [2, 4, 7, 9],
    initialAxesDelta: { integrity: 4, publicTrust: 10, councilFavor: -2 },
  },
  STRATEGIST: {
    id: 'STRATEGIST',
    title: 'Pattern-Breaking Strategist',
    shortLabel: 'Pattern-Breaking Strategist',
    subtitle:
      'Reads probabilities, clock pressure, and human micro-tells three moves ahead of the table.',
    vanceReaction:
      'A dangerous habit in Geneva, {challengerName}—reading the adjudicator as closely as the Prism.',
    affinityDomains: [6, 8, 11, 5],
    initialAxesDelta: { integrity: -2, publicTrust: 2, councilFavor: 8 },
  },
};

export interface PersonaDefinition {
  id: PersonaId;
  title: string;
  stampCode: string;
  motto: string;
  dossierAssessment: string;
  startingPerk: PerkId;
  startingPerkName: string;
  startingPerkDesc: string;
  accentHex: string;
  voiceUrl: string;
}

export const PERSONA_DEFINITIONS: Record<PersonaId, PersonaDefinition> = {
  MAVERICK: {
    id: 'MAVERICK',
    title: 'The Maverick',
    stampCode: 'MRD-01 // CONVICTION HIGH-WIRE',
    motto: 'Bets everything on razor conviction under floodlights.',
    dossierAssessment:
      'High-conviction wager profile. Presses Overclock under timer pressure and backs instinct with nerve.',
    startingPerk: 'MAVERICK_GAMBIT',
    startingPerkName: "Maverick's Gambit",
    startingPerkDesc: 'Overclock charges 30% faster and reaches +125% peak bonus.',
    accentHex: '#f06458',
    voiceUrl: 'assets/voice/vance_persona_maverick.mp3',
  },
  DIPLOMAT: {
    id: 'DIPLOMAT',
    title: 'The Diplomat',
    stampCode: 'MRD-02 // SOVEREIGN POISE',
    motto: 'Reads the chamber three moves ahead without flinching.',
    dossierAssessment:
      'Measured institutional poise. Balances Council protocol with unshakeable composure under scrutiny.',
    startingPerk: 'DIPLOMAT_COMPOSURE',
    startingPerkName: "Diplomat's Composure",
    startingPerkDesc: '+2.0s Chrono-Ring time and blocks Rival Tempo Steal clock drain.',
    accentHex: '#e8c474',
    voiceUrl: 'assets/voice/vance_persona_diplomat.mp3',
  },
  ANALYST: {
    id: 'ANALYST',
    title: 'The Analyst',
    stampCode: 'MRD-03 // FORENSIC DEDUCTION',
    motto: 'Peels back illusion to exposed horological brass.',
    dossierAssessment:
      'Forensic deductive thinker. Trades raw multiplier surgically when needed to guarantee precision.',
    startingPerk: 'DIPLOMAT_COMPOSURE',
    startingPerkName: "Diplomat's Composure",
    startingPerkDesc: '+2.0s Chrono-Ring time and blocks Rival Tempo Steal clock drain.',
    accentHex: '#48b8f0',
    voiceUrl: 'assets/voice/vance_persona_analyst.mp3',
  },
  PRODIGY: {
    id: 'PRODIGY',
    title: 'The Prodigy',
    stampCode: 'MRD-04 // 99.4% COLD INSTINCT',
    motto: 'Cold instinct before the clock takes a breath.',
    dossierAssessment:
      'Rare 99.4% unassisted Cold-Instinct resonance. Solves sealed Tier-1 Prisms with surgical clarity.',
    startingPerk: 'CLEAN_HANDS',
    startingPerkName: 'Clean Hands',
    startingPerkDesc: '+25% bonus score on every unassisted Tier-1 Cold Instinct lock.',
    accentHex: '#5ce1e6',
    voiceUrl: 'assets/voice/vance_persona_prodigy.mp3',
  },
};

export interface FactionCatalogEntry {
  id: FactionId;
  name: string;
  emblemTitle: string;
  chairName: string;
  philosophy: string;
  crestUrl: string;
  accentHex: string;
  affinityDomains: DomainId[];
}

export const FACTION_CATALOG: Record<FactionId, FactionCatalogEntry> = {
  SOVEREIGN: {
    id: 'SOVEREIGN',
    name: 'The Sovereign Bloc',
    emblemTitle: 'The Iron Laurel',
    chairName: 'Chancellor Ingrid Lindqvist',
    philosophy: 'Order, Heritage, Protocol & Treaty Law',
    crestUrl: 'assets/factions/faction_sovereign.png',
    accentHex: '#d4a853',
    affinityDomains: [0, 3, 8, 10],
  },
  HORIZON: {
    id: 'HORIZON',
    name: 'The Horizon Collective',
    emblemTitle: 'The Glass Spire',
    chairName: 'Director Kenji Takahashi',
    philosophy: 'Velocity, Optimization, Precision & Risk',
    crestUrl: 'assets/factions/faction_horizon.png',
    accentHex: '#5ce1e6',
    affinityDomains: [1, 6, 11],
  },
  AGORA: {
    id: 'AGORA',
    name: 'The Agora Coalition',
    emblemTitle: 'The Open Commons',
    chairName: 'Ambassador Amara Okafor',
    philosophy: 'Transparency, Empathy, Culture & Public Truth',
    crestUrl: 'assets/factions/faction_agora.png',
    accentHex: '#38c793',
    affinityDomains: [2, 4, 5, 7, 9],
  },
};

export interface RelicCatalogEntry {
  id: HeroRelicId;
  name: string;
  hubId: HubId;
  countryCode: GlobeCountryCode;
  cityLabel: string;
  venueLabel: string;
  glbUrl: string;
  lore: string;
  hiddenInscription: string;
}

export const RELIC_CATALOG: Record<HeroRelicId, RelicCatalogEntry> = {
  meridian_astrolabe: {
    id: 'meridian_astrolabe',
    name: 'Meridian Brass Astrolabe',
    hubId: 'ch',
    countryCode: 'CH',
    cityLabel: 'Geneva',
    venueLabel: 'The Vetting Chamber',
    glbUrl: 'assets/aaa_models/calibrator_chronometer.glb',
    lore: "Julian Vance's Geneva instrument—awarded to finalists who clear the Vetting Chamber.",
    hiddenInscription: 'Engraved beneath the vernier ring: "CALIBRATE WHO YOU BECOME."',
  },
  armillary_orrery: {
    id: 'armillary_orrery',
    name: 'Locked Armillary Orrery',
    hubId: 'gb',
    countryCode: 'GB',
    cityLabel: 'London',
    venueLabel: 'The Sovereign Rotunda',
    glbUrl: 'assets/aaa_models/relic_london_orrery.glb',
    lore: 'Sovereign Bloc celestial sphere claimed after outplaying Nadia Al-Mansoor in London.',
    hiddenInscription: 'Scratched inside the third bronze ring: "A.M. — 2019 · TRIAL ZERO."',
  },
  origami_prism: {
    id: 'origami_prism',
    name: 'Folding Origami Prism',
    hubId: 'jp',
    countryCode: 'JP',
    cityLabel: 'Tokyo',
    venueLabel: 'Shinkansen Sky Pavilion',
    glbUrl: 'assets/aaa_models/relic_tokyo_origami.glb',
    lore: 'Smoked-quartz geometric trophy won seventy floors above neon-lit Tokyo.',
    hiddenInscription: 'Laser-etched inside the core: Giza coordinates 29.9792° N, 31.1342° E.',
  },
  emerald_sphere: {
    id: 'emerald_sphere',
    name: 'Emerald Resonance Sphere',
    hubId: 'br',
    countryCode: 'BR',
    cityLabel: 'Rio de Janeiro',
    venueLabel: 'Botanical Glass Canopy',
    glbUrl: 'assets/aaa_models/relic_rio_sphere.glb',
    lore: 'Acoustic emerald sphere tuned to resonant frequencies beneath Giza.',
    hiddenInscription: 'Harmonic notch matches Nadia Al-Mansoor’s private acoustic key.',
  },
  cipher_box: {
    id: 'cipher_box',
    name: 'Meridian Zero Cipher Box',
    hubId: 'eg',
    countryCode: 'EG',
    cityLabel: 'Cairo / Giza',
    venueLabel: 'Solar Acoustic Hall',
    glbUrl: 'assets/aaa_models/relic_cairo_cipher.glb',
    lore: 'Limestone and brass vault reliquary housing Tariq Al-Mansoor’s 2019 Trial Zero dossier.',
    hiddenInscription: 'Vance’s erasure code decodes to a Reykjavik witness-protection relay.',
  },
  cryo_relay: {
    id: 'cryo_relay',
    name: 'Cryo-Core Relay',
    hubId: 'is',
    countryCode: 'IS',
    cityLabel: 'Reykjavik',
    venueLabel: 'Geothermal Basalt Caldera',
    glbUrl: 'assets/aaa_models/relic_reykjavik_cryo.glb',
    lore: 'Sub-glacial basalt transceiver linking Julian Vance’s Geneva desk to Tariq’s hideout.',
    hiddenInscription: 'Seven years of encrypted heartbeats—the Trojan Horse blueprint.',
  },
  council_seal: {
    id: 'council_seal',
    name: 'Fractured Council Seal',
    hubId: 'sg',
    countryCode: 'SG',
    cityLabel: 'Singapore',
    venueLabel: 'Diplomatic Sky-Bridge & Core',
    glbUrl: 'assets/aaa_models/relic_singapore_seal.glb',
    lore: 'Platinum Emergency Article IX seal shattered above The Ledger’s data monoliths.',
    hiddenInscription: 'Bears the Sovereign proxy cipher that sabotaged Rio’s pod.',
  },
  master_ledger: {
    id: 'master_ledger',
    name: 'Master Ledger Core & Championship Trophy',
    hubId: 'global',
    countryCode: 'GLOBAL',
    cityLabel: 'Apex Forum',
    venueLabel: 'International Waters Citadel',
    glbUrl: 'assets/aaa_models/relic_apex_ledger.glb',
    lore: 'The sole human veto key over The Ledger—won live before two billion witnesses.',
    hiddenInscription: 'Stamped with the First Citizen Arbiter’s permanent signature.',
  },
};

export interface CountryVisaRecord {
  hubId: HubId;
  countryCode: GlobeCountryCode;
  city: string;
  country: string;
  visaTitle: string;
  stampSerial: string;
  visaStampUrl: string;
  cleared: boolean;
  missionsCompleted: number;
  totalMissions: number;
  stampedAtIso: string | null;
  relicId: HeroRelicId;
  relicUnlocked: boolean;
}

export interface ChallengerNameValidationResult {
  valid: boolean;
  cleaned: string;
  error?: string;
}

export interface ProloguePersonaInput {
  origin: OriginId;
  mirrorLeakChoice: 'EXPLOITED' | 'FLAGGED' | 'CLEAN';
  manifestoChoice: 'COUNCIL' | 'PUBLIC' | 'SELF';
  correctCount: number;
  totalQuestions: number;
  spinCount: number;
  peelCount: number;
  overclockAttempts: number;
  overclockHits: number;
  calibratorTolerancePct: number; // e.g. 0.03 bullseye .. 0.25 safe
  calibratorHit: boolean;
}

export interface DomainRadarVertex {
  domainId: DomainId;
  key: string;
  name: string;
  shortName: string;
  medallionUrl: string;
  accentHex: string;
  elo: number;
  theta: number;
  normalizedRadius: number; // 0.18 .. 1.0
  masteryTier: 'INITIATE' | 'ADEPT' | 'SPECIALIST' | 'FELLOW' | 'POLYMATH';
  angleRad: number;
  pointX: number;
  pointY: number;
  labelX: number;
  labelY: number;
}

export interface DomainSkillRadarModel {
  centerX: number;
  centerY: number;
  maxRadius: number;
  svgPolygonPoints: string;
  gridRingsSvgPoints: string[]; // 25%, 50%, 75%, 100% dodecagon rings
  vertices: DomainRadarVertex[];
  strongestDomain: SovereignDomainMeta;
  weakestDomain: SovereignDomainMeta;
  averageElo: number;
}

export interface DailyPercentileEntry {
  utcDate: string;
  score: number;
  percentile: number;
  correctCount: number;
}

export interface IntelBookmark {
  qid: number;
  domainId: DomainId;
  prompt: string;
  answer: string;
  whyExplanation: string;
  savedAtIso: string;
}

export interface PassportStateSnapshot {
  passportNumber: string;
  challengerName: string;
  hasCustomName: boolean;
  origin: OriginId | null;
  persona: PersonaId | null;
  stampedAtIso: string | null;
  titleCrests: string[];
  activeTitleCrest: string;
  visas: Record<HubId, CountryVisaRecord>;
  unlockedRelics: HeroRelicId[];
  domainElo: number[]; // length 12, 600..2400
  domainQuestionsSolved: number[]; // length 12
  totalQuestionsAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  accuracyPct: number;
  dailyHistory: DailyPercentileEntry[];
  bookmarks: IntelBookmark[];
}

const PASSPORT_STORAGE_KEY = 'ws_meridian_passport_v2';
const LEGACY_NAME_STORAGE_KEY = 'ws_challenger_name';
const MAX_CHALLENGER_NAME_LEN = 22;

const VISA_BLUEPRINTS: ReadonlyArray<{
  hubId: HubId;
  countryCode: GlobeCountryCode;
  city: string;
  country: string;
  visaTitle: string;
  stampSerial: string;
  relicId: HeroRelicId;
}> = [
  {
    hubId: 'ch',
    countryCode: 'CH',
    city: 'Geneva',
    country: 'Switzerland',
    visaTitle: 'VETTING CHAMBER CLEARED',
    stampSerial: 'CH-VET-001',
    relicId: 'meridian_astrolabe',
  },
  {
    hubId: 'gb',
    countryCode: 'GB',
    city: 'London',
    country: 'United Kingdom',
    visaTitle: 'SOVEREIGN ROTUNDA DIPLOMAT',
    stampSerial: 'GB-SOV-104',
    relicId: 'armillary_orrery',
  },
  {
    hubId: 'jp',
    countryCode: 'JP',
    city: 'Tokyo',
    country: 'Japan',
    visaTitle: 'HORIZON SKY CLEARANCE',
    stampSerial: 'JP-HRZ-208',
    relicId: 'origami_prism',
  },
  {
    hubId: 'br',
    countryCode: 'BR',
    city: 'Rio de Janeiro',
    country: 'Brazil',
    visaTitle: 'AGORA CANOPY ENVOY',
    stampSerial: 'BR-AGR-312',
    relicId: 'emerald_sphere',
  },
  {
    hubId: 'eg',
    countryCode: 'EG',
    city: 'Cairo',
    country: 'Egypt',
    visaTitle: 'MERIDIAN ZERO ARCHIVIST',
    stampSerial: 'EG-MRZ-409',
    relicId: 'cipher_box',
  },
  {
    hubId: 'is',
    countryCode: 'IS',
    city: 'Reykjavik',
    country: 'Iceland',
    visaTitle: 'CALDERA CONCLAVE SEAL',
    stampSerial: 'IS-CLD-517',
    relicId: 'cryo_relay',
  },
  {
    hubId: 'sg',
    countryCode: 'SG',
    city: 'Singapore',
    country: 'Singapore',
    visaTitle: 'LEDGER CORE CLEARANCE',
    stampSerial: 'SG-COR-623',
    relicId: 'council_seal',
  },
  {
    hubId: 'global',
    countryCode: 'GLOBAL',
    city: 'Apex Forum',
    country: 'International Waters',
    visaTitle: 'FIRST CITIZEN ARBITER',
    stampSerial: 'GL-APX-999',
    relicId: 'master_ledger',
  },
];

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function generatePassportSerial(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `MRD-${digits}-994`;
}

/**
 * Sanitizes live input while typing in `<input type="text" maxlength="22">`
 * without stripping trailing single space mid-typing.
 */
export function sanitizeLiveChallengerInput(raw: string): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[<>{}[\]\\/`~^|]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, MAX_CHALLENGER_NAME_LEN);
}

/**
 * Validates and cleans a Challenger Name (1–22 clean characters).
 */
export function validateChallengerName(raw: string): ChallengerNameValidationResult {
  if (typeof raw !== 'string') {
    return { valid: false, cleaned: '', error: 'Enter your Challenger name (1–22 characters).' };
  }
  const cleaned = raw
    .replace(/[<>{}[\]\\/`~^|]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CHALLENGER_NAME_LEN);

  if (cleaned.length < 1) {
    return {
      valid: false,
      cleaned: '',
      error: 'Please enter your name (1–22 characters) for your Meridian Passport.',
    };
  }

  // Require at least one letter or alphanumeric character
  if (!/[\p{L}\p{N}]/u.test(cleaned)) {
    return {
      valid: false,
      cleaned: '',
      error: 'Name must include at least one letter or digit.',
    };
  }

  return { valid: true, cleaned };
}

function createInitialVisas(): Record<HubId, CountryVisaRecord> {
  const out = {} as Record<HubId, CountryVisaRecord>;
  for (const bp of VISA_BLUEPRINTS) {
    out[bp.hubId] = {
      hubId: bp.hubId,
      countryCode: bp.countryCode,
      city: bp.city,
      country: bp.country,
      visaTitle: bp.visaTitle,
      stampSerial: bp.stampSerial,
      visaStampUrl: `assets/visas/visa_${bp.hubId}.png`,
      cleared: false,
      missionsCompleted: 0,
      totalMissions: 5,
      stampedAtIso: null,
      relicId: bp.relicId,
      relicUnlocked: false,
    };
  }
  return out;
}

function createDefaultPassportState(): PassportStateSnapshot {
  return {
    passportNumber: generatePassportSerial(),
    challengerName: 'Challenger',
    hasCustomName: false,
    origin: null,
    persona: null,
    stampedAtIso: null,
    titleCrests: ['MERIDIAN CANDIDATE'],
    activeTitleCrest: 'MERIDIAN CANDIDATE',
    visas: createInitialVisas(),
    unlockedRelics: [],
    domainElo: Array.from({ length: 12 }, () => 1200),
    domainQuestionsSolved: Array.from({ length: 12 }, () => 0),
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
    accuracyPct: 0,
    dailyHistory: [],
    bookmarks: [],
  };
}

/**
 * Computes one of the 4 Starting Cognitive Personas from real Geneva Q1–Q4 telemetry!
 */
export function computeCognitivePersona(input: ProloguePersonaInput): PersonaDefinition {
  let maverickScore = 0;
  let diplomatScore = 0;
  let analystScore = 0;
  let prodigyScore = 0;

  // 1. Origin weighting
  if (input.origin === 'STRATEGIST') {
    maverickScore += 2;
    prodigyScore += 1;
  } else if (input.origin === 'ACADEMIC') {
    analystScore += 3;
    diplomatScore += 1;
  } else if (input.origin === 'POLYMATH') {
    prodigyScore += 2;
    maverickScore += 1;
  }

  // 2. Mirror Leak ethical reflex
  if (input.mirrorLeakChoice === 'EXPLOITED') {
    maverickScore += 4;
  } else if (input.mirrorLeakChoice === 'FLAGGED') {
    diplomatScore += 4;
    analystScore += 1;
  } else if (input.mirrorLeakChoice === 'CLEAN') {
    prodigyScore += 3;
    diplomatScore += 1;
  }

  // 3. Spotlight Manifesto choice
  if (input.manifestoChoice === 'COUNCIL') {
    diplomatScore += 3;
  } else if (input.manifestoChoice === 'PUBLIC') {
    analystScore += 2;
    diplomatScore += 2;
  } else if (input.manifestoChoice === 'SELF') {
    maverickScore += 3;
    prodigyScore += 1;
  }

  // 4. Tactile Veritas Prism gestures (Spin, Peel, Overclock, Astrolabe Cone)
  if (input.overclockAttempts >= 2 || input.overclockHits >= 1) {
    maverickScore += 3 + input.overclockHits * 2;
  }
  if (input.peelCount >= 2) {
    analystScore += 4;
  } else if (input.peelCount === 1) {
    analystScore += 2;
  } else if (input.peelCount === 0 && input.correctCount >= 3) {
    prodigyScore += 4;
  }

  const rawTol = Number(input.calibratorTolerancePct) || 0.12;
  const normalizedTol =
    rawTol > 1 ? rawTol / 100 : rawTol > 0 && rawTol < 0.005 ? rawTol * 100 : rawTol;

  if (normalizedTol <= 0.06) {
    maverickScore += 2;
    if (input.calibratorHit) prodigyScore += 3;
  } else if (normalizedTol >= 0.16) {
    analystScore += 2;
    diplomatScore += 1;
  }

  if (input.correctCount >= 4) {
    prodigyScore += 3;
  }

  const ranked: Array<{ id: PersonaId; score: number }> = [
    { id: 'PRODIGY', score: prodigyScore },
    { id: 'MAVERICK', score: maverickScore },
    { id: 'ANALYST', score: analystScore },
    { id: 'DIPLOMAT', score: diplomatScore },
  ];
  ranked.sort((a, b) => b.score - a.score);
  return PERSONA_DEFINITIONS[ranked[0].id];
}

export class PassportSystem {
  private state: PassportStateSnapshot;
  private readonly listeners = new Set<(snapshot: PassportStateSnapshot) => void>();
  private lastRecordedQid: number | null = null;

  constructor() {
    this.state = this.load();
  }

  private parseSnapshotObject(
    parsed: Partial<PassportStateSnapshot> | null | undefined
  ): PassportStateSnapshot {
    const defaults = createDefaultPassportState();
    if (!parsed || typeof parsed !== 'object') return defaults;

    const nameCheck =
      typeof parsed.challengerName === 'string'
        ? validateChallengerName(parsed.challengerName)
        : { valid: false, cleaned: '' };

    const hasCustom = Boolean(parsed.hasCustomName) && nameCheck.valid;
    const challengerName = hasCustom ? nameCheck.cleaned : 'Challenger';

    const visas = createInitialVisas();
    if (parsed.visas && typeof parsed.visas === 'object') {
      for (const bp of VISA_BLUEPRINTS) {
        const savedVisa = (parsed.visas as Record<string, Partial<CountryVisaRecord>>)[bp.hubId];
        if (savedVisa && typeof savedVisa === 'object') {
          visas[bp.hubId] = {
            ...visas[bp.hubId],
            cleared: Boolean(savedVisa.cleared),
            totalMissions: clamp(Math.floor(Number(savedVisa.totalMissions) || 5), 5, 16),
            missionsCompleted: clamp(Math.floor(Number(savedVisa.missionsCompleted) || 0), 0, 16),
            stampedAtIso:
              typeof savedVisa.stampedAtIso === 'string' ? savedVisa.stampedAtIso : null,
            relicUnlocked: Boolean(savedVisa.relicUnlocked),
          };
        }
      }
    }

    const domainElo =
      Array.isArray(parsed.domainElo) && parsed.domainElo.length === 12
        ? parsed.domainElo.map((v) => Math.round(clamp(Number(v) || 1200, 600, 2400)))
        : defaults.domainElo;

    const domainQuestionsSolved =
      Array.isArray(parsed.domainQuestionsSolved) && parsed.domainQuestionsSolved.length === 12
        ? parsed.domainQuestionsSolved.map((v) => Math.max(0, Math.floor(Number(v) || 0)))
        : defaults.domainQuestionsSolved;

    const unlockedRelics = Array.isArray(parsed.unlockedRelics)
      ? parsed.unlockedRelics.filter(
          (r): r is HeroRelicId => typeof r === 'string' && r in RELIC_CATALOG
        )
      : [];

    const titleCrests =
      Array.isArray(parsed.titleCrests) && parsed.titleCrests.length > 0
        ? Array.from(
            new Set(parsed.titleCrests.filter((t): t is string => typeof t === 'string'))
          )
        : ['MERIDIAN CANDIDATE'];

    return {
      passportNumber:
        typeof parsed.passportNumber === 'string' && parsed.passportNumber.length >= 6
          ? parsed.passportNumber
          : defaults.passportNumber,
      challengerName,
      hasCustomName: hasCustom,
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
      stampedAtIso: typeof parsed.stampedAtIso === 'string' ? parsed.stampedAtIso : null,
      titleCrests,
      activeTitleCrest:
        typeof parsed.activeTitleCrest === 'string' &&
        titleCrests.includes(parsed.activeTitleCrest)
          ? parsed.activeTitleCrest
          : titleCrests[titleCrests.length - 1],
      visas,
      unlockedRelics,
      domainElo,
      domainQuestionsSolved,
      totalQuestionsAnswered: Math.max(0, Math.floor(Number(parsed.totalQuestionsAnswered) || 0)),
      totalCorrect: Math.max(0, Math.floor(Number(parsed.totalCorrect) || 0)),
      currentStreak: Math.max(0, Math.floor(Number(parsed.currentStreak) || 0)),
      bestStreak: Math.max(0, Math.floor(Number(parsed.bestStreak) || 0)),
      accuracyPct: clamp(Math.round(Number(parsed.accuracyPct) || 0), 0, 100),
      dailyHistory: Array.isArray(parsed.dailyHistory) ? parsed.dailyHistory.slice(-60) : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks.slice(-80) : [],
    };
  }

  private load(): PassportStateSnapshot {
    const defaults = createDefaultPassportState();
    try {
      if (typeof localStorage === 'undefined') return defaults;
      const raw = localStorage.getItem(PASSPORT_STORAGE_KEY);
      const legacyName = localStorage.getItem(LEGACY_NAME_STORAGE_KEY);

      if (!raw) {
        if (legacyName) {
          const check = validateChallengerName(legacyName);
          if (check.valid) {
            defaults.challengerName = check.cleaned;
            defaults.hasCustomName = true;
          }
        }
        return defaults;
      }

      const parsed = JSON.parse(raw) as Partial<PassportStateSnapshot> | null;
      return this.parseSnapshotObject(parsed);
    } catch {
      return defaults;
    }
  }

  private save(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(this.state));
        if (this.state.hasCustomName) {
          localStorage.setItem(LEGACY_NAME_STORAGE_KEY, this.state.challengerName);
        }
      }
    } catch {
      // Ignore quota errors
    }
    const snap = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snap);
    }
  }

  public subscribe(listener: (snapshot: PassportStateSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSnapshot(): PassportStateSnapshot {
    const visasCopy = {} as Record<HubId, CountryVisaRecord>;
    for (const k of Object.keys(this.state.visas) as HubId[]) {
      visasCopy[k] = { ...this.state.visas[k] };
    }
    return {
      ...this.state,
      titleCrests: [...this.state.titleCrests],
      visas: visasCopy,
      unlockedRelics: [...this.state.unlockedRelics],
      domainElo: [...this.state.domainElo],
      domainQuestionsSolved: [...this.state.domainQuestionsSolved],
      dailyHistory: this.state.dailyHistory.map((d) => ({ ...d })),
      bookmarks: this.state.bookmarks.map((b) => ({ ...b })),
    };
  }

  /**
   * Returns the player's real Challenger Name (NEVER returns "YOU").
   */
  public getChallengerName(): string {
    return this.state.hasCustomName && this.state.challengerName.trim().length > 0
      ? this.state.challengerName
      : 'Challenger';
  }

  public hasRegisteredName(): boolean {
    return this.state.hasCustomName;
  }

  /**
   * Validates and persists the Challenger's real name (1–22 chars).
   * Callable both in Geneva Prologue and anytime inside the Meridian Passport modal!
   */
  public setChallengerName(rawName: string): ChallengerNameValidationResult {
    const validation = validateChallengerName(rawName);
    if (!validation.valid) {
      return validation;
    }
    this.state.challengerName = validation.cleaned;
    this.state.hasCustomName = true;
    this.save();
    return validation;
  }

  /**
   * Interpolates Challenger Name tokens across Vance/Rival dialogue, Dossier headers, & Share Cards.
   */
  public interpolateText(template: string): string {
    if (!template) return '';
    const name = this.getChallengerName();
    return template
      .replace(/\[\[\s*[^\]]+\][^\]]*\]/g, '')
      .replace(/\[\[[\s\S]*?\]\]/g, '')
      .replace(/\{challengerName\}/gi, name)
      .replace(/\{challenger\}/gi, name)
      .replace(/\{player_name\}/gi, name)
      .replace(/\{name\}/gi, name)
      .replace(/<YOUR NAME>/gi, name.toUpperCase())
      .replace(/<CHALLENGER NAME>/gi, name.toUpperCase())
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Formats live broadcast scoreboard banner (`<YOUR NAME> 1,450 vs NADIA 1,100`) — NEVER "YOU vs NADIA"!
   */
  public formatScoreboardBanner(
    rivalShortName: string,
    playerScore: number,
    rivalScore?: number
  ): string {
    const pName = this.getChallengerName().toUpperCase();
    const pScoreStr = Math.max(0, Math.round(playerScore)).toLocaleString('en-US');
    if (rivalScore === undefined) {
      return `${pName} · ${pScoreStr} PTS`;
    }
    const rScoreStr = Math.max(0, Math.round(rivalScore)).toLocaleString('en-US');
    return `${pName} ${pScoreStr}  vs  ${rivalShortName.toUpperCase()} ${rScoreStr}`;
  }

  public setOrigin(origin: OriginId): OriginDefinition {
    this.state.origin = origin;
    const def = ORIGIN_DEFINITIONS[origin];
    // Give subtle initial Elo lift (+35) to origin affinity domains if still at baseline
    for (const d of def.affinityDomains) {
      if (this.state.domainQuestionsSolved[d] === 0 && this.state.domainElo[d] === 1200) {
        this.state.domainElo[d] = 1245;
      }
    }
    this.save();
    return def;
  }

  public stampProloguePassport(input: ProloguePersonaInput): PersonaDefinition {
    this.state.origin = input.origin;
    const personaDef = computeCognitivePersona(input);
    this.state.persona = personaDef.id;
    this.state.stampedAtIso = new Date().toISOString();

    // Stamp Geneva Visa & unlock Meridian Brass Astrolabe
    this.recordMissionCleared('ch', 5, true, 'meridian_astrolabe');
    const personaCrest = `${personaDef.title.toUpperCase()} · GENEVA CHARTER`;
    if (!this.state.titleCrests.includes(personaCrest)) {
      this.state.titleCrests.push(personaCrest);
    }
    this.state.activeTitleCrest = personaCrest;
    this.save();
    return personaDef;
  }

  public setPersona(persona: PersonaId): PersonaDefinition {
    this.state.persona = persona;
    if (!this.state.stampedAtIso) {
      this.state.stampedAtIso = new Date().toISOString();
    }
    this.save();
    return PERSONA_DEFINITIONS[persona];
  }

  public recordMissionCleared(
    hubId: HubId,
    completedInHubCount: number,
    hubCleared = false,
    unlockedRelic?: HeroRelicId,
    totalMissionsInHub?: number
  ): void {
    const visa = this.state.visas[hubId];
    if (visa) {
      if (typeof totalMissionsInHub === 'number' && totalMissionsInHub >= 5) {
        visa.totalMissions = clamp(Math.floor(totalMissionsInHub), 5, 16);
      }
      visa.missionsCompleted = clamp(
        Math.max(visa.missionsCompleted, completedInHubCount),
        0,
        visa.totalMissions
      );
      if (hubCleared) {
        visa.cleared = true;
        if (!visa.stampedAtIso) {
          visa.stampedAtIso = new Date().toISOString();
        }
      }
    }
    if (unlockedRelic) {
      this.unlockRelic(unlockedRelic);
    } else {
      this.save();
    }
  }

  public unlockRelic(relicId: HeroRelicId): boolean {
    let added = false;
    if (!this.state.unlockedRelics.includes(relicId)) {
      this.state.unlockedRelics.push(relicId);
      added = true;
    }
    const entry = RELIC_CATALOG[relicId];
    if (entry && this.state.visas[entry.hubId]) {
      this.state.visas[entry.hubId].relicUnlocked = true;
    }
    this.save();
    return added;
  }

  public unlockTitleCrest(crest: string, makeActive = true): void {
    if (!crest) return;
    if (!this.state.titleCrests.includes(crest)) {
      this.state.titleCrests.push(crest);
    }
    if (makeActive) {
      this.state.activeTitleCrest = crest;
    }
    this.save();
  }

  /**
   * Syncs live 12-Domain IRT theta vector (`-3.0 .. +3.2`) or Elo ratings (`600 .. 2400`) from ForgeEngine.
   */
  public syncDomainMasteryFromTheta(thetaDomains: readonly number[]): void {
    if (!Array.isArray(thetaDomains) || thetaDomains.length < 12) return;
    for (let i = 0; i < 12; i++) {
      const val = Number(thetaDomains[i]);
      if (!Number.isFinite(val)) continue;
      // Detect whether caller passed IRT theta (-4..+4) or Elo (400..2600)
      if (Math.abs(val) <= 6.0) {
        this.state.domainElo[i] = Math.round(clamp(1200 + val * 260, 600, 2400));
      } else {
        this.state.domainElo[i] = Math.round(clamp(val, 600, 2400));
      }
    }
    this.save();
  }

  /**
   * Updates domain mastery directly after a question resolution (Cold Instinct > Clue Core > Blueprint).
   */
  public recordDomainQuestionOutcome(
    domainId: DomainId,
    correct: boolean,
    peelTier: 1 | 2 | 3,
    questionIrtB = 0,
    qid?: number
  ): number {
    const idx = clamp(Math.floor(domainId), 0, 11);
    if (qid !== undefined && qid === this.lastRecordedQid) {
      return this.state.domainElo[idx];
    }
    if (qid !== undefined) {
      this.lastRecordedQid = qid;
    }

    this.state.totalQuestionsAnswered += 1;
    if (correct) {
      this.state.totalCorrect += 1;
      this.state.currentStreak += 1;
      if (this.state.currentStreak > this.state.bestStreak) {
        this.state.bestStreak = this.state.currentStreak;
      }
      this.state.domainQuestionsSolved[idx] += 1;
    } else {
      this.state.currentStreak = 0;
    }
    this.state.accuracyPct = Math.round(
      (this.state.totalCorrect / Math.max(1, this.state.totalQuestionsAnswered)) * 100
    );

    const currentElo = this.state.domainElo[idx];
    const questionElo = 1200 + clamp(questionIrtB, -2.5, 3.2) * 250;
    const expected = 1 / (1 + Math.pow(10, (questionElo - currentElo) / 400));
    const epistemicScore = !correct ? 0 : peelTier === 1 ? 1.0 : peelTier === 2 ? 0.78 : 0.58;
    const kFactor = 28;
    const nextElo = Math.round(clamp(currentElo + kFactor * (epistemicScore - expected), 600, 2400));
    this.state.domainElo[idx] = nextElo;
    this.save();
    return nextElo;
  }

  public getWeakestDomainId(externalTheta?: readonly number[]): DomainId {
    if (externalTheta && externalTheta.length >= 12) {
      let minIdx = 0;
      let minVal = Infinity;
      for (let i = 0; i < 12; i++) {
        const v = Number(externalTheta[i]);
        if (Number.isFinite(v) && v < minVal) {
          minVal = v;
          minIdx = i;
        }
      }
      return minIdx as DomainId;
    }

    let minIdx = 0;
    let minElo = Infinity;
    for (let i = 0; i < 12; i++) {
      if (this.state.domainElo[i] < minElo) {
        minElo = this.state.domainElo[i];
        minIdx = i;
      }
    }
    return minIdx as DomainId;
  }

  /**
   * Builds a complete, ready-to-render SVG 12-Domain Mastery Radar geometry model!
   */
  public buildSkillRadarModel(
    options?: {
      thetaDomains?: readonly number[];
      centerX?: number;
      centerY?: number;
      maxRadius?: number;
    }
  ): DomainSkillRadarModel {
    if (options?.thetaDomains) {
      this.syncDomainMasteryFromTheta(options.thetaDomains);
    }

    const cx = options?.centerX ?? 160;
    const cy = options?.centerY ?? 160;
    const maxR = options?.maxRadius ?? 112;
    const labelR = maxR + 26;

    const vertices: DomainRadarVertex[] = [];
    let eloSum = 0;
    let bestIdx = 0;
    let worstIdx = 0;

    for (let i = 0; i < 12; i++) {
      const meta = SOVEREIGN_DOMAINS[i];
      const elo = this.state.domainElo[i] ?? 1200;
      eloSum += elo;
      if (elo > this.state.domainElo[bestIdx]) bestIdx = i;
      if (elo < this.state.domainElo[worstIdx]) worstIdx = i;

      const theta = Number(((elo - 1200) / 260).toFixed(2));
      const norm = clamp((elo - 650) / (2150 - 650), 0.18, 1.0);
      const angleRad = -Math.PI / 2 + (i * Math.PI * 2) / 12;
      const r = maxR * norm;
      const px = Number((cx + Math.cos(angleRad) * r).toFixed(2));
      const py = Number((cy + Math.sin(angleRad) * r).toFixed(2));
      const lx = Number((cx + Math.cos(angleRad) * labelR).toFixed(2));
      const ly = Number((cy + Math.sin(angleRad) * labelR).toFixed(2));

      const masteryTier: DomainRadarVertex['masteryTier'] =
        elo >= 1850
          ? 'POLYMATH'
          : elo >= 1580
            ? 'FELLOW'
            : elo >= 1360
              ? 'SPECIALIST'
              : elo >= 1160
                ? 'ADEPT'
                : 'INITIATE';

      vertices.push({
        domainId: meta.id,
        key: meta.key,
        name: meta.name,
        shortName: meta.shortName,
        medallionUrl: meta.medallionUrl,
        accentHex: meta.accentHex,
        elo,
        theta,
        normalizedRadius: Number(norm.toFixed(3)),
        masteryTier,
        angleRad,
        pointX: px,
        pointY: py,
        labelX: lx,
        labelY: ly,
      });
    }

    const svgPolygonPoints = vertices.map((v) => `${v.pointX},${v.pointY}`).join(' ');
    const ringScales = [0.25, 0.5, 0.75, 1.0];
    const gridRingsSvgPoints = ringScales.map((scale) => {
      const pts: string[] = [];
      for (let i = 0; i < 12; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 12;
        const rx = (cx + Math.cos(a) * maxR * scale).toFixed(2);
        const ry = (cy + Math.sin(a) * maxR * scale).toFixed(2);
        pts.push(`${rx},${ry}`);
      }
      return pts.join(' ');
    });

    return {
      centerX: cx,
      centerY: cy,
      maxRadius: maxR,
      svgPolygonPoints,
      gridRingsSvgPoints,
      vertices,
      strongestDomain: SOVEREIGN_DOMAINS[bestIdx],
      weakestDomain: SOVEREIGN_DOMAINS[worstIdx],
      averageElo: Math.round(eloSum / 12),
    };
  }

  public recordDailyPercentile(entry: DailyPercentileEntry): void {
    const existingIdx = this.state.dailyHistory.findIndex((e) => e.utcDate === entry.utcDate);
    if (existingIdx >= 0) {
      if (entry.score >= this.state.dailyHistory[existingIdx].score) {
        this.state.dailyHistory[existingIdx] = { ...entry };
      }
    } else {
      this.state.dailyHistory.push({ ...entry });
    }
    this.save();
  }

  public toggleIntelBookmark(bookmark: Omit<IntelBookmark, 'savedAtIso'>): boolean {
    const idx = this.state.bookmarks.findIndex((b) => b.qid === bookmark.qid);
    if (idx >= 0) {
      this.state.bookmarks.splice(idx, 1);
      this.save();
      return false;
    }
    this.state.bookmarks.unshift({
      ...bookmark,
      savedAtIso: new Date().toISOString(),
    });
    if (this.state.bookmarks.length > 80) {
      this.state.bookmarks.length = 80;
    }
    this.save();
    return true;
  }

  public hydrateSnapshot(
    raw: Partial<PassportStateSnapshot> | null | undefined
  ): PassportStateSnapshot {
    this.state = this.parseSnapshotObject(raw);
    this.lastRecordedQid = null;
    this.save();
    return this.getSnapshot();
  }

  /**
   * Resets Campaign-specific Visas, Relics, Origin, Persona, & Title Crests back to Act 0 Geneva Start
   * while preserving lifetime Career Stats, Domain ELOs, Daily History, & Bookmarks!
   */
  public resetCampaignProgress(keepChallengerName = true): PassportStateSnapshot {
    const savedName = this.state.challengerName;
    const savedHasName = this.state.hasCustomName;
    const savedDomainElo = [...this.state.domainElo];
    const savedDomainSolved = [...this.state.domainQuestionsSolved];
    const savedTotalAnswered = this.state.totalQuestionsAnswered;
    const savedTotalCorrect = this.state.totalCorrect;
    const savedCurrentStreak = this.state.currentStreak;
    const savedBestStreak = this.state.bestStreak;
    const savedAccuracyPct = this.state.accuracyPct;
    const savedDaily = [...this.state.dailyHistory];
    const savedBookmarks = [...this.state.bookmarks];

    const fresh = createDefaultPassportState();
    this.state = {
      ...fresh,
      challengerName: keepChallengerName && savedHasName ? savedName : fresh.challengerName,
      hasCustomName: keepChallengerName && savedHasName,
      domainElo: savedDomainElo,
      domainQuestionsSolved: savedDomainSolved,
      totalQuestionsAnswered: savedTotalAnswered,
      totalCorrect: savedTotalCorrect,
      currentStreak: savedCurrentStreak,
      bestStreak: savedBestStreak,
      accuracyPct: savedAccuracyPct,
      dailyHistory: savedDaily,
      bookmarks: savedBookmarks,
    };
    this.lastRecordedQid = null;
    this.save();
    return this.getSnapshot();
  }

  public resetPassport(keepChallengerName = true): void {
    const savedName = this.state.challengerName;
    const savedHasName = this.state.hasCustomName;
    this.state = createDefaultPassportState();
    if (keepChallengerName && savedHasName) {
      this.state.challengerName = savedName;
      this.state.hasCustomName = true;
    }
    this.lastRecordedQid = null;
    this.save();
  }
}
