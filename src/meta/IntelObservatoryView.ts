// ============================================================================
// WORLD'S SMARTEST — 3D Intel Observatory (`PITCH_BIBLE.md` §5.2 & §7.1)
// Interactive Luxury Trophy Study & Epistemic "Aha!" Archive:
//  1. Full 360° 3D Inspection (`Stage3DDirector.showHeroRelic(relicId)`) for all
//     8 Tier-3 Country Boss Relics + the 24K Championship Crown Trophy
//  2. Deep Historical/Horological Provenance + Interactive UV Blacklight
//     Conspiracy Inscription Decoder (Trial Zero & Trojan Horse lore)
//  3. Bookmarked "Intel Flash" Vault: Instant Search, 12-Domain Medallion Filter,
//     Bookmark Management, and Interactive 4-Choice / Shutter-Flip Self-Quiz!
// ============================================================================

import type { Stage3DDirector, HeroRelicKey } from '../stage3d';
import {
  RELIC_CATALOG,
  SOVEREIGN_DOMAINS,
  getSovereignDomainMeta,
  type DomainId,
  type HeroRelicId,
  type IntelBookmark,
  type InkBlackboard,
  type PassportSystem,
} from '../narrative';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import {
  attachMetaEscapeHandler,
  bindVaultJumperEvents,
  ensureMetaStylesInjected,
  escapeMetaHtml,
  formatMetaYear,
  renderVaultJumperHtml,
  sanitizeMetaCopy,
  type MetaSuiteSectionId,
} from './DiplomaticPassportBook';
import {
  LEITNER_BOX_LABELS,
  LEITNER_BOX_SHORT_INTERVALS,
  SpacedRepetitionEngine,
  formatTimeUntilReview,
  type LeitnerBox,
  type SrsReviewAttemptResult,
  type SrsReviewCard,
} from './SpacedRepetitionEngine';

export type ObservatoryTabId = 'RELICS_3D' | 'INTEL_FLASHES' | 'SELF_QUIZ';

export type SrsDeckFilter = 'DUE' | 'ALL' | 'MASTERED';

export type ShowcaseArtifactId = 'championship_trophy' | HeroRelicId;

export interface ObservatoryArtifactDossier {
  id: ShowcaseArtifactId;
  title: string;
  cityLabel: string;
  venueLabel: string;
  countryCode: string;
  domainId: DomainId;
  metallurgySpec: string;
  historicalProvenance: string;
  conspiracyNote: string;
  uvHiddenInscription: string;
  unlockHowTo: string;
}

export interface IntelObservatoryDependencies {
  passport: PassportSystem;
  srsEngine?: SpacedRepetitionEngine;
  stage3d?: Stage3DDirector;
  blackboard?: InkBlackboard;
  audio?: StudioAudioEngine;
  haptics?: HapticsEngine;
}

export interface IntelObservatoryCallbacks {
  onInspectRelic?: (artifactId: ShowcaseArtifactId) => void;
  onUvScan?: (artifactId: ShowcaseArtifactId) => void;
  onLatchesOpened?: (artifactId: ShowcaseArtifactId) => void;
  onLaunchLivePrismReview?: (cards: readonly SrsReviewCard[]) => void;
  onNavigateSection?: (section: MetaSuiteSectionId) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onClose?: () => void;
}

export interface IntelObservatoryOpenOptions extends IntelObservatoryCallbacks {
  initialTab?: ObservatoryTabId;
  initialArtifactId?: ShowcaseArtifactId;
}

interface FlashCardItem extends IntelBookmark {
  isSeedExemplar?: boolean;
}

interface Wave2HotspotSpec {
  id: string;
  label: string;
  orbitDeg: [number, number];
  note: string;
}

interface Wave2LatchSpec {
  step: number;
  latchName: string;
  nodeHint: string;
  engraving: string;
  deductionHint: string;
  glyphUrl: string;
  unlockVoiceUrl?: string;
}

interface Wave2RelicProvenanceEntry {
  relicId: HeroRelicId;
  name: string;
  archiveCode: string;
  artisanAttribution: string;
  yearCrafted: number;
  metallurgySpec: string;
  signatureGlyphUrl: string;
  provenanceEssay: string;
  conspiracySignificance: string;
  uvHiddenInscription: string;
  inspectionHotspots: Wave2HotspotSpec[];
  latches: Wave2LatchSpec[];
}

let cachedWave2RelicMap: Partial<Record<HeroRelicId, Wave2RelicProvenanceEntry>> | null = null;
let wave2FetchPromise: Promise<Partial<Record<HeroRelicId, Wave2RelicProvenanceEntry>>> | null = null;

function fetchWave2RelicProvenance(): Promise<Partial<Record<HeroRelicId, Wave2RelicProvenanceEntry>>> {
  if (cachedWave2RelicMap) return Promise.resolve(cachedWave2RelicMap);
  if (wave2FetchPromise) return wave2FetchPromise;

  wave2FetchPromise = (async () => {
    try {
      if (typeof fetch !== 'function') return {};
      const resp = await fetch('./data/narrative_wave2.json');
      if (!resp.ok) return {};
      const ct = resp.headers.get('content-type') ?? '';
      if (ct.includes('text/html')) return {};
      const json = (await resp.json()) as {
        tier3_relic_provenance?: Partial<Record<HeroRelicId, Wave2RelicProvenanceEntry>>;
      };
      cachedWave2RelicMap = json.tier3_relic_provenance ?? {};
      return cachedWave2RelicMap;
    } catch {
      return {};
    }
  })();

  return wave2FetchPromise;
}

export const OBSERVATORY_ARTIFACT_DOSSIERS: readonly ObservatoryArtifactDossier[] = [
  {
    id: 'championship_trophy',
    title: 'First Citizen Arbiter Crown Trophy',
    cityLabel: 'Apex Citadel',
    venueLabel: 'World Council Grand Dais',
    countryCode: 'WORLD',
    domainId: 0,
    metallurgySpec: '24K Recycled Central-Bank Bullion · Suspended Sapphire Star Core',
    historicalProvenance:
      'Commissioned under the Geneva Charter of Human Stewardship to crown humanity’s First Citizen Arbiter before two billion live viewers.',
    conspiracyNote:
      'Its counter-rotating astrolabe rings physically house the analog optical key required to authorize—or veto—The Ledger’s global crisis protocols.',
    uvHiddenInscription:
      'UV MICRO-ETCHING: "NO SINGLE SUPERPOWER SHALL HOLD THE PEN ALONE — GENEVA ART. I"',
    unlockHowTo: 'Showcase Preview Active · Full Arbiter Seal awarded upon completing The Apex Forum.',
  },
  {
    id: 'meridian_astrolabe',
    title: RELIC_CATALOG.meridian_astrolabe.name,
    cityLabel: RELIC_CATALOG.meridian_astrolabe.cityLabel,
    venueLabel: RELIC_CATALOG.meridian_astrolabe.venueLabel,
    countryCode: 'CH',
    domainId: 1,
    metallurgySpec: 'Vallée de Joux Brushed Brass · Anti-Reflective Sapphire Vernier',
    historicalProvenance:
      'Milled by fifth-generation Geneva chronometer makers for Chief Adjudicator Julian Vance’s private Vetting Chamber table.',
    conspiracyNote:
      'Vance uses its tolerance cone during Q4 not merely to score estimation accuracy, but to fingerprint risk-calibrated minds matching Trial Zero.',
    uvHiddenInscription: RELIC_CATALOG.meridian_astrolabe.hiddenInscription,
    unlockHowTo: 'Clear the 4-Question Geneva Vetting Prologue.',
  },
  {
    id: 'armillary_orrery',
    title: RELIC_CATALOG.armillary_orrery.name,
    cityLabel: RELIC_CATALOG.armillary_orrery.cityLabel,
    venueLabel: RELIC_CATALOG.armillary_orrery.venueLabel,
    countryCode: 'GB',
    domainId: 0,
    metallurgySpec: 'Aged Admiralty Bronze · 18K Sovereign Gold Declination Rings',
    historicalProvenance:
      'Modeled after 18th-century Greenwich celestial spheres and mounted beneath the glass rotunda of the Sovereign Bloc’s London headquarters.',
    conspiracyNote:
      'When rotated to 23.4° obliquity, a concealed spring latch exposes initials scratched during the erased 2019 pilot tournament.',
    uvHiddenInscription: RELIC_CATALOG.armillary_orrery.hiddenInscription,
    unlockHowTo: 'Defeat the London Stage 1 Boss Showdown in The Sovereign Rotunda.',
  },
  {
    id: 'origami_prism',
    title: RELIC_CATALOG.origami_prism.name,
    cityLabel: RELIC_CATALOG.origami_prism.cityLabel,
    venueLabel: RELIC_CATALOG.origami_prism.venueLabel,
    countryCode: 'JP',
    domainId: 6,
    metallurgySpec: 'Smoked Synthetic Quartz · Vapor-Deposited Titanium Hinges',
    historicalProvenance:
      'Engineered by Director Kenji Takahashi’s Horizon Collective seventy floors above Tokyo Station to celebrate high-velocity deduction.',
    conspiracyNote:
      'Internal waveguides double as a passive laser interferometer—encoding geodesic survey coordinates pointing directly beneath the Giza plateau.',
    uvHiddenInscription: RELIC_CATALOG.origami_prism.hiddenInscription,
    unlockHowTo: 'Clear the Tokyo Stage 2 Boss Showdown in the Shinkansen Sky Pavilion.',
  },
  {
    id: 'emerald_sphere',
    title: RELIC_CATALOG.emerald_sphere.name,
    cityLabel: RELIC_CATALOG.emerald_sphere.cityLabel,
    venueLabel: RELIC_CATALOG.emerald_sphere.venueLabel,
    countryCode: 'BR',
    domainId: 7,
    metallurgySpec: 'Beryl-Quartz Acoustic Resonator · Spun Botanical Brass Ribs',
    historicalProvenance:
      'Suspended beneath Rio de Janeiro’s Botanical Glass Canopy, resonating at 432 Hz whenever a Challenger locks an unassisted Cold Instinct.',
    conspiracyNote:
      'Acoustic engineer Nadia Al-Mansoor recognized the sphere’s Helmholtz chamber immediately—it was tuned using her vanished brother Tariq’s equations.',
    uvHiddenInscription: RELIC_CATALOG.emerald_sphere.hiddenInscription,
    unlockHowTo: 'Clear the Rio de Janeiro Stage 3 Boss Showdown.',
  },
  {
    id: 'cipher_box',
    title: RELIC_CATALOG.cipher_box.name,
    cityLabel: RELIC_CATALOG.cipher_box.cityLabel,
    venueLabel: RELIC_CATALOG.cipher_box.venueLabel,
    countryCode: 'EG',
    domainId: 10,
    metallurgySpec: 'Tura Limestone Core · Counter-Rotating Pharaonic Electrum Tumblers',
    historicalProvenance:
      'Recovered from the subterranean Meridian Zero vault beneath Cairo’s Solar Acoustic Hall during the staged broadcast blackout.',
    conspiracyNote:
      'Contains the unredacted 2019 Trial Zero psychometric ledger—proving your 99.4% cognitive match with erased first champion Tariq Al-Mansoor.',
    uvHiddenInscription: RELIC_CATALOG.cipher_box.hiddenInscription,
    unlockHowTo: 'Decrypt Cairo’s Stage 4 Meridian Zero Boss Showdown.',
  },
  {
    id: 'cryo_relay',
    title: RELIC_CATALOG.cryo_relay.name,
    cityLabel: RELIC_CATALOG.cryo_relay.cityLabel,
    venueLabel: RELIC_CATALOG.cryo_relay.venueLabel,
    countryCode: 'IS',
    domainId: 11,
    metallurgySpec: 'Columnar Icelandic Basalt · Superconducting Niobium-Gold Coil',
    historicalProvenance:
      'Cooled by sub-glacial meltwater inside Reykjavik’s Geothermal Basalt Caldera to sustain zero-latency global truth verification.',
    conspiracyNote:
      'Proves Julian Vance never eliminated Tariq—he faked Tariq’s erasure and spent five years co-engineering The Meridian as a public Trojan Horse trap.',
    uvHiddenInscription: RELIC_CATALOG.cryo_relay.hiddenInscription,
    unlockHowTo: 'Complete Reykjavik’s Stage 5 Caldera Showdown.',
  },
  {
    id: 'council_seal',
    title: RELIC_CATALOG.council_seal.name,
    cityLabel: RELIC_CATALOG.council_seal.cityLabel,
    venueLabel: RELIC_CATALOG.council_seal.venueLabel,
    countryCode: 'SG',
    domainId: 8,
    metallurgySpec: '950 Platinum Charter Disc · Fractured Crimson Corundum Core',
    historicalProvenance:
      'The ceremonial Article IX Emergency Seal held above The Ledger’s primary data monoliths on Singapore’s Diplomatic Sky-Bridge.',
    conspiracyNote:
      'Split cleanly down its treaty seam during the inner-circle betrayal crisis—exposing the proxy signature behind Rio’s pod sabotage.',
    uvHiddenInscription: RELIC_CATALOG.council_seal.hiddenInscription,
    unlockHowTo: 'Survive Singapore’s Stage 6 Sky-Bridge Showdown.',
  },
  {
    id: 'master_ledger',
    title: RELIC_CATALOG.master_ledger.name,
    cityLabel: RELIC_CATALOG.master_ledger.cityLabel,
    venueLabel: RELIC_CATALOG.master_ledger.venueLabel,
    countryCode: 'GLOBAL',
    domainId: 6,
    metallurgySpec: 'Dichroic Diamond-Carbon Lattice · Triple-Gimbal 24K Veto Key',
    historicalProvenance:
      'Anchored in International Waters aboard The Apex Forum—the planetary crisis-forecasting and treaty-verification heart of The Ledger.',
    conspiracyNote:
      'Unlocked live before two billion witnesses in The Arbiter’s Gambit against Julian Vance himself.',
    uvHiddenInscription: RELIC_CATALOG.master_ledger.hiddenInscription,
    unlockHowTo: 'Triumph in Stage 7 International Waters — The Apex Forum Finale.',
  },
];

/**
 * Curated Geneva Archival Seed Flashes surfaced when a new Challenger wants to try Search & Recall Quiz
 * before bookmarking live match debriefs (or toggled alongside personal bookmarks).
 */
const GENEVA_SEED_INTEL_FLASHES: readonly FlashCardItem[] = [
  {
    qid: 900001,
    domainId: 0,
    prompt: 'Which 1814–1815 European diplomatic summit was nicknamed "The Dancing Congress"?',
    answer: 'Congress of Vienna',
    whyExplanation:
      'Prince Metternich hosted lavish nightly balls in Vienna while redrawing post-Napoleonic Europe’s borders.',
    savedAtIso: '2026-11-01T00:00:00.000Z',
    isSeedExemplar: true,
  },
  {
    qid: 900002,
    domainId: 1,
    prompt: 'Which element has the highest melting point of all pure metals at 3,422 °C?',
    answer: 'Tungsten',
    whyExplanation:
      'Tungsten (W, atomic number 74) owes its extreme thermal resilience to dense 5d-orbital metallic bonding.',
    savedAtIso: '2026-11-01T00:00:00.000Z',
    isSeedExemplar: true,
  },
  {
    qid: 900003,
    domainId: 2,
    prompt: 'Which strait separates the European and Asian sides of Istanbul?',
    answer: 'Bosphorus Strait',
    whyExplanation:
      'Linking the Black Sea to the Sea of Marmara, the Bosphorus is the world’s narrowest strait used for international navigation.',
    savedAtIso: '2026-11-01T00:00:00.000Z',
    isSeedExemplar: true,
  },
  {
    qid: 900004,
    domainId: 3,
    prompt: 'Traditional Japanese art of repairing broken pottery with lacquer dusted in powdered gold?',
    answer: 'Kintsugi',
    whyExplanation:
      'Literally "golden joinery," Kintsugi treats breakage and repair as proud chapters of an object’s history rather than flaws to disguise.',
    savedAtIso: '2026-11-01T00:00:00.000Z',
    isSeedExemplar: true,
  },
  {
    qid: 900005,
    domainId: 6,
    prompt: 'Who authored the 1843 Note G algorithm for Charles Babbage’s Analytical Engine?',
    answer: 'Ada Lovelace',
    whyExplanation:
      'Lovelace computed Bernoulli numbers and foresaw that symbolic engines could compose music and art beyond pure arithmetic.',
    savedAtIso: '2026-11-01T00:00:00.000Z',
    isSeedExemplar: true,
  },
  {
    qid: 900006,
    domainId: 11,
    prompt: 'In game theory, what state occurs when no player gains by unilaterally changing strategy?',
    answer: 'Nash Equilibrium',
    whyExplanation:
      'Proven by John Nash in 1950 via Kakutani’s fixed-point theorem across every finite non-cooperative game.',
    savedAtIso: '2026-11-01T00:00:00.000Z',
    isSeedExemplar: true,
  },
];

const DOMAIN_FALLBACK_DECOYS: Record<DomainId, readonly string[]> = {
  0: ['Treaty of Utrecht', 'Peace of Westphalia', 'Congress of Berlin', 'Treaty of Tilsit'],
  1: ['Molybdenum', 'Osmium', 'Tantalum', 'Rhenium'],
  2: ['Dardanelles', 'Strait of Hormuz', 'Bab-el-Mandeb', 'Kerch Strait'],
  3: ['Raku Ware', 'Cloisonné', 'Chiaroscuro', 'Shibori'],
  4: ['Palme d’Or', 'Golden Lion', 'Cinéma Vérité', 'Nouvelle Vague'],
  5: ['Fosbury Flop', 'Elo Rating', 'Marquis of Queensberry', 'Tourbillon'],
  6: ['Alan Turing', 'Grace Hopper', 'Claude Shannon', 'John von Neumann'],
  7: ['Cambrian Explosion', 'Symbiogenesis', 'Convergent Evolution', 'Homeostasis'],
  8: ['Geneva Convention', 'Westphalian Sovereignty', 'Habeas Corpus', 'Jus Cogens'],
  9: ['Maillard Reaction', 'Guilloché', 'Damascus Steel', 'Haute Horlogerie'],
  10: ['Allegory of the Cave', 'Ship of Theseus', 'Occam’s Razor', 'Categorical Imperative'],
  11: ['Pareto Optimality', 'Prisoner’s Dilemma', 'Gödel Incompleteness', 'Bayes’ Theorem'],
};

const BOOLEAN_CARD_VALUES = new Set([
  'verify (true)',
  'debunk (false)',
  'true',
  'false',
]);

function buildSrsQuizOptions(
  card: SrsReviewCard,
  pool: readonly SrsReviewCard[],
  seedOverride?: number,
): {
  options: string[];
  correctIdx: number;
} {
  const answerClean = sanitizeMetaCopy(card.correctAnswer).trim();
  const answerNorm = answerClean.toLowerCase();

  // GAUNTLET_SHATTER True/False cards ALWAYS present clean 2-choice binary options
  if (answerNorm === 'verify (true)' || answerNorm === 'debunk (false)') {
    return {
      options: ['VERIFY (True)', 'DEBUNK (False)'],
      correctIdx: answerNorm === 'verify (true)' ? 0 : 1,
    };
  }
  if (answerNorm === 'true' || answerNorm === 'false') {
    return {
      options: ['True', 'False'],
      correctIdx: answerNorm === 'true' ? 0 : 1,
    };
  }

  const seen = new Set<string>([answerNorm]);
  const candidates: string[] = [];

  const tryPush = (raw: string, skipBooleans = false): void => {
    const clean = sanitizeMetaCopy(raw).trim();
    if (!clean) return;
    const norm = clean.toLowerCase();
    if (skipBooleans && BOOLEAN_CARD_VALUES.has(norm)) return;
    if (seen.has(norm)) return;
    seen.add(norm);
    candidates.push(clean);
  };

  for (const dist of card.distractors) {
    tryPush(dist, true);
  }

  // If a CALIBRATOR_DIAL calendar-year card has fewer than 3 distractors, synthesize era-matched comma-free years
  const yearMatch = answerClean.match(/^(\d{3,4})(?:\s+(CE|BCE|AD|BC))?$/i);
  if (yearMatch && candidates.length < 3) {
    const baseYear = Number(yearMatch[1]);
    const eraSuffix = yearMatch[2] ? ` ${yearMatch[2].toUpperCase()}` : '';
    const offsets =
      baseYear >= 1900
        ? [-11, -5, 6, 13, -18, 19]
        : baseYear >= 1500
          ? [-24, -9, 12, 27, -38, 41]
          : [-65, -25, 30, 75, -110, 120];
    const rot = Math.abs(card.qid) % offsets.length;
    for (let k = 0; k < offsets.length && candidates.length < 3; k++) {
      const yr = baseYear + offsets[(rot + k) % offsets.length];
      if (yr > 0 && yr <= 2026) {
        tryPush(`${yr}${eraSuffix}`, true);
      }
    }
  }

  for (const other of pool) {
    if (candidates.length >= 3) break;
    if (other.qid !== card.qid && other.domainId === card.domainId) {
      tryPush(other.correctAnswer, true);
    }
  }
  for (const dec of DOMAIN_FALLBACK_DECOYS[card.domainId] ?? DOMAIN_FALLBACK_DECOYS[0]) {
    if (candidates.length >= 3) break;
    tryPush(dec, true);
  }
  for (const other of pool) {
    if (candidates.length >= 3) break;
    if (other.qid !== card.qid) {
      tryPush(other.correctAnswer, true);
    }
  }

  const distractors = candidates.slice(0, 3);
  while (distractors.length < 3) {
    distractors.push(`Archive Candidate ${distractors.length + 1}`);
  }

  const raw = [answerClean, ...distractors];
  // Deterministic Fisher-Yates keyed by (qid, reviewCount) so UI re-renders stay identical
  // for a given review turn while shuffling cleanly on future reviews!
  let state = ((seedOverride ?? (card.qid * 2654435761 + card.totalReviews * 1013904223)) >>> 0) || 1;
  for (let i = raw.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = raw[i];
    raw[i] = raw[j];
    raw[j] = tmp;
  }
  const correctIdx = raw.indexOf(answerClean);
  return { options: raw, correctIdx: Math.max(0, correctIdx) };
}

const SRS_BOX_ACCENTS: Record<LeitnerBox, string> = {
  1: '#e05263',
  2: '#f09d46',
  3: '#56d4f5',
  4: '#f2cf7e',
  5: '#39d49a',
};

export class IntelObservatoryView {
  private readonly deps: IntelObservatoryDependencies;
  private readonly srs: SpacedRepetitionEngine;
  private modalBackdrop: HTMLElement | null = null;
  private mountedContainer: HTMLElement | null = null;
  private detachEscape: (() => void) | null = null;
  private callbacks: IntelObservatoryCallbacks = {};

  private activeTab: ObservatoryTabId = 'RELICS_3D';
  private selectedArtifactId: ShowcaseArtifactId = 'championship_trophy';
  private uvBlacklightActive = false;
  private relicLatchesOpen = false;
  private activeHotspotId: string | null = null;
  private showcaseReqToken = 0;

  // Intel Flash Vault & 5-Box Leitner Mastery Deck State
  private searchQuery = '';
  private domainFilter: DomainId | 'ALL' = 'ALL';
  private includeSeedExemplars = true;

  private srsFilter: SrsDeckFilter = 'DUE';
  private srsBoxFilter: LeitnerBox | null = null;
  private srsActiveCard: SrsReviewCard | null = null;
  private srsActiveOptions: { qid: number; options: string[]; correctIdx: number } | null = null;
  private srsLastAttemptResult: SrsReviewAttemptResult | null = null;

  private quizCursor = 0;
  private quizPickedIdx: number | null = null;
  private quizShutterFlipped = false;
  private quizCorrectCount = 0;
  private quizAttemptedCount = 0;
  private quizStreak = 0;

  constructor(deps: IntelObservatoryDependencies) {
    this.deps = deps;
    this.srs = deps.srsEngine ?? new SpacedRepetitionEngine(deps.passport);
    ensureMetaStylesInjected();
  }

  public isOpen(): boolean {
    return this.modalBackdrop !== null || this.mountedContainer !== null;
  }

  public open(options: IntelObservatoryOpenOptions = {}): void {
    this.close();
    this.callbacks = options;
    this.activeTab = options.initialTab ?? 'RELICS_3D';
    this.selectedArtifactId = options.initialArtifactId ?? 'championship_trophy';
    this.uvBlacklightActive = false;
    this.resetSrsRunnerTurn(true);
    this.syncSrsBookmarksAndDefaultFilter();

    const backdrop = document.createElement('div');
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-label', '3D Intel Observatory & Trophy Study');
    document.body.appendChild(backdrop);
    this.modalBackdrop = backdrop;
    this.detachEscape = attachMetaEscapeHandler(() => this.handleBackOrClose());

    void fetchWave2RelicProvenance().then(() => {
      if (this.isOpen()) this.rerender();
    });
    void this.sync3DShowcase();
    this.rerender();
  }

  private handleBackOrClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    if (this.callbacks.canGoBack && this.callbacks.onBack) {
      this.callbacks.onBack();
      return;
    }
    const onClose = this.callbacks.onClose;
    this.close();
    onClose?.();
  }

  private handleClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    const onClose = this.callbacks.onClose;
    this.close();
    onClose?.();
  }

  public mount(container: HTMLElement, options: IntelObservatoryOpenOptions = {}): void {
    this.unmount();
    this.callbacks = options;
    this.activeTab = options.initialTab ?? 'RELICS_3D';
    this.selectedArtifactId = options.initialArtifactId ?? 'championship_trophy';
    this.mountedContainer = container;
    this.resetSrsRunnerTurn(true);
    this.syncSrsBookmarksAndDefaultFilter();
    void fetchWave2RelicProvenance().then(() => {
      if (this.isOpen()) this.rerender();
    });
    void this.sync3DShowcase();
    this.renderInto(container, false);
  }

  private resetSrsRunnerTurn(resetCursor = false): void {
    this.srsActiveCard = null;
    this.srsActiveOptions = null;
    this.srsLastAttemptResult = null;
    this.quizPickedIdx = null;
    this.quizShutterFlipped = false;
    if (resetCursor) {
      this.quizCursor = 0;
      this.srsBoxFilter = null;
    }
  }

  private syncSrsBookmarksAndDefaultFilter(): void {
    this.srs.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks);
    const summary = this.srs.getDeckSummary();
    if (summary.dueCount > 0) {
      this.srsFilter = 'DUE';
    } else if (summary.totalCards > 0) {
      this.srsFilter = 'ALL';
    } else {
      this.srsFilter = 'DUE';
    }
  }

  private getFilteredSrsCards(): SrsReviewCard[] {
    let base: ReadonlyArray<SrsReviewCard>;
    if (this.srsFilter === 'DUE') {
      base = this.srs.getDueCards();
    } else if (this.srsFilter === 'MASTERED') {
      base = this.srs.getMasteredCards();
    } else {
      base = this.srs.getAllCards();
    }
    if (this.srsBoxFilter !== null) {
      return base.filter((c) => c.box === this.srsBoxFilter);
    }
    return [...base];
  }

  public unmount(): void {
    const wasMounted = this.mountedContainer !== null;
    this.showcaseReqToken += 1;
    if (this.detachEscape) {
      this.detachEscape();
      this.detachEscape = null;
    }
    this.syncUiRootVisibility(false);
    if (this.mountedContainer) {
      this.mountedContainer.innerHTML = '';
      this.mountedContainer = null;
    }
    if (wasMounted || this.modalBackdrop !== null) {
      this.deps.audio?.stopVoice();
    }
  }

  public close(): void {
    this.unmount();
    if (this.modalBackdrop) {
      this.modalBackdrop.remove();
      this.modalBackdrop = null;
    }
  }

  public selectArtifact(artifactId: ShowcaseArtifactId): void {
    this.selectedArtifactId = artifactId;
    this.activeTab = 'RELICS_3D';
    this.uvBlacklightActive = false;
    void this.sync3DShowcase();
    this.rerender();
  }

  private syncUiRootVisibility(hideBehind3D: boolean): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('ws-3d-showcase-open', hideBehind3D);
    const uiRoot = document.getElementById('ui-root');
    if (uiRoot) {
      uiRoot.style.visibility = hideBehind3D ? 'hidden' : 'visible';
    }
  }

  private async sync3DShowcase(): Promise<void> {
    const dossier =
      OBSERVATORY_ARTIFACT_DOSSIERS.find((d) => d.id === this.selectedArtifactId) ??
      OBSERVATORY_ARTIFACT_DOSSIERS[0];

    const reqToken = ++this.showcaseReqToken;
    this.callbacks.onInspectRelic?.(dossier.id);
    if (!this.deps.stage3d) return;

    await this.deps.stage3d.showHeroRelic(dossier.id as HeroRelicKey, dossier.domainId);
    if (reqToken !== this.showcaseReqToken || !this.isOpen()) return;
    if (this.uvBlacklightActive) {
      this.deps.stage3d.setLightingMode('TWIST_FRACTURE');
    }
    this.actuate3DRelicLatches(this.relicLatchesOpen);
  }

  /**
   * Actuates bespoke `Latch_0..2` mechanical nodes on Wave-2 Blender Tier-3 Relics (#139 / #149).
   */
  private actuate3DRelicLatches(open: boolean): void {
    if (this.deps.stage3d) {
      this.deps.stage3d.actuateRelicLatches(open ? 3 : 0);
      return;
    }
  }

  private isArtifactUnlocked(id: ShowcaseArtifactId): boolean {
    if (id === 'championship_trophy') return true;
    const pSnap = this.deps.passport.getSnapshot();
    const bSnap = this.deps.blackboard?.getSnapshot();
    if (pSnap.unlockedRelics.includes(id)) return true;
    if (bSnap?.unlockedRelics.includes(id)) return true;
    const entry = RELIC_CATALOG[id];
    if (entry && pSnap.visas[entry.hubId]?.cleared) return true;
    return false;
  }

  private getCombinedFlashes(): FlashCardItem[] {
    const pSnap = this.deps.passport.getSnapshot();
    const personal: FlashCardItem[] = pSnap.bookmarks.map((b) => ({
      ...b,
      isSeedExemplar: false,
    }));

    const baseList =
      personal.length === 0 || this.includeSeedExemplars
        ? [
            ...personal,
            ...GENEVA_SEED_INTEL_FLASHES.filter((s) => !personal.some((p) => p.qid === s.qid)),
          ]
        : personal;

    const q = this.searchQuery.trim().toLowerCase();
    return baseList.filter((item) => {
      if (this.domainFilter !== 'ALL' && item.domainId !== this.domainFilter) {
        return false;
      }
      if (!q) return true;
      const domName = getSovereignDomainMeta(item.domainId).name.toLowerCase();
      return (
        item.prompt.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.whyExplanation.toLowerCase().includes(q) ||
        domName.includes(q)
      );
    });
  }

  private rerender(): void {
    const isRelicDock = this.activeTab === 'RELICS_3D';
    if (this.modalBackdrop) {
      this.modalBackdrop.className = isRelicDock
        ? 'ws-meta-backdrop is-stage-dock'
        : 'ws-meta-backdrop';
      this.syncUiRootVisibility(isRelicDock);
      this.renderInto(this.modalBackdrop, true);
    } else if (this.mountedContainer) {
      this.renderInto(this.mountedContainer, false);
    }
  }

  private renderInto(host: HTMLElement, isModal: boolean): void {
    const pSnap = this.deps.passport.getSnapshot();
    this.srs.syncFromPassportBookmarks(pSnap.bookmarks);
    const srsSummary = this.srs.getDeckSummary();
    const unlockedRelicsCount = OBSERVATORY_ARTIFACT_DOSSIERS.filter(
      (d) => d.id !== 'championship_trophy' && this.isArtifactUnlocked(d.id),
    ).length;

    const underlineTabsHtml = `
      <div class="ws-meta-underline-tabs" role="tablist" aria-label="Observatory Sections">
        <button type="button" role="tab" aria-selected="${this.activeTab === 'RELICS_3D'}" class="ws-meta-underline-tab ${this.activeTab === 'RELICS_3D' ? 'is-active' : ''}" data-obs-tab="RELICS_3D">
          360° Relics
        </button>
        <button type="button" role="tab" aria-selected="${this.activeTab === 'INTEL_FLASHES'}" class="ws-meta-underline-tab ${this.activeTab === 'INTEL_FLASHES' ? 'is-active' : ''}" data-obs-tab="INTEL_FLASHES">
          Saved Flashes${pSnap.bookmarks.length > 0 ? ` (${pSnap.bookmarks.length})` : ''}
        </button>
        <button type="button" role="tab" aria-selected="${this.activeTab === 'SELF_QUIZ'}" class="ws-meta-underline-tab ${this.activeTab === 'SELF_QUIZ' ? 'is-active' : ''}" data-obs-tab="SELF_QUIZ">
          Mastery Deck${srsSummary.dueCount > 0 ? ` (${srsSummary.dueCount})` : ''}
        </button>
      </div>
    `;

    const uvIconSvg =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>';
    const latchIconSvg =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

    if (isModal && this.activeTab === 'RELICS_3D') {
      const vaultFloatingHtml = renderVaultJumperHtml('OBSERVATORY', {
        isModal: true,
        closeBtnId: 'ws-obs-close',
        canNavigate: Boolean(this.callbacks.onNavigateSection),
        floatingVariant: true,
      });

      host.innerHTML = `
        <!-- Open Unobstructed 54-55dvh Portrait / 50vw Landscape 3D Stage (pointer-events: none pass-through!) -->
        <div class="ws-meta-stage-zone">
          <div class="ws-meta-stage-top">
            <button type="button" class="ws-meta-float-pill" id="ws-obs-back" data-meta-back="true" aria-label="Back">← Back</button>
            ${vaultFloatingHtml}
          </div>
          <div class="ws-meta-stage-bottom">
            <span class="ws-meta-orbit-whisper">↻ Drag 3D to Orbit</span>
            <div class="ws-meta-stage-actions">
              <button
                type="button"
                class="ws-meta-float-pill ${this.uvBlacklightActive ? 'is-active-cyan' : ''}"
                id="ws-obs-uv-scan"
                aria-pressed="${this.uvBlacklightActive}"
              >
                ${uvIconSvg} UV
              </button>
              <button
                type="button"
                class="ws-meta-float-pill ${this.relicLatchesOpen ? 'is-active-gold' : ''}"
                id="ws-obs-latch-toggle"
                aria-pressed="${this.relicLatchesOpen}"
              >
                ${latchIconSvg} Latches
              </button>
            </div>
          </div>
        </div>

        <!-- Sleek 45-46dvh Portrait / 50vw Landscape Dark-Obsidian Bottom Sheet -->
        <div class="ws-meta-sheet">
          <div class="ws-meta-drag-handle" aria-hidden="true"></div>
          ${underlineTabsHtml}
          ${this.renderRelicSelectorStrip()}
          <div class="ws-meta-body-scroll">
            ${this.renderRelics3DStudy(unlockedRelicsCount)}
          </div>
        </div>
      `;

      this.bindEvents(host);
      return;
    }

    const vaultJumperHtml = renderVaultJumperHtml('OBSERVATORY', {
      isModal,
      closeBtnId: 'ws-obs-close',
      canNavigate: Boolean(this.callbacks.onNavigateSection),
    });

    host.innerHTML = `
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-obs-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">OBSERVATORY</h2>
              <div class="ws-meta-eyebrow">${unlockedRelicsCount}/8 Relics · ${srsSummary.dueCount} Due · ${pSnap.bookmarks.length} Flashes</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${vaultJumperHtml}
          </div>
        </div>

        ${underlineTabsHtml}
        ${this.activeTab === 'RELICS_3D' ? this.renderRelicSelectorStrip() : ''}

        <div class="ws-meta-body-scroll">
          ${
            this.activeTab === 'RELICS_3D'
              ? this.renderRelics3DStudy(unlockedRelicsCount, true)
              : this.activeTab === 'INTEL_FLASHES'
                ? this.renderIntelFlashesVault()
                : this.renderSelfQuizMode()
          }
        </div>
      </div>
    `;

    this.bindEvents(host);
  }

  private renderRelicSelectorStrip(): string {
    return `
      <div class="ws-meta-hscroll" style="padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.06);" aria-label="Select 3D Relic">
        ${OBSERVATORY_ARTIFACT_DOSSIERS.map((item) => {
          const isSel = item.id === this.selectedArtifactId;
          const isUnl = this.isArtifactUnlocked(item.id);
          const chipLabel = item.id === 'championship_trophy' ? 'Crown' : item.cityLabel;
          return `
            <button
              type="button"
              class="ws-meta-chip ${isSel ? 'is-active' : ''}"
              data-select-artifact="${item.id}"
            >
              <span style="color:${item.id === 'championship_trophy' || isUnl ? 'var(--gold-bright)' : 'var(--ivory-dim)'};">${item.id === 'championship_trophy' ? '♛' : isUnl ? '◆' : '◇'}</span>
              <span>${escapeMetaHtml(chipLabel)}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  private renderRelics3DStudy(unlockedRelicsCount: number, showInlineTools = false): string {
    const dossier =
      OBSERVATORY_ARTIFACT_DOSSIERS.find((d) => d.id === this.selectedArtifactId) ??
      OBSERVATORY_ARTIFACT_DOSSIERS[0];
    const unlocked = this.isArtifactUnlocked(dossier.id);
    const w2 =
      dossier.id !== 'championship_trophy'
        ? cachedWave2RelicMap?.[dossier.id] ?? null
        : null;
    const hotspots = w2?.inspectionHotspots ?? [];
    const focusedHotspot =
      hotspots.find((h) => h.id === this.activeHotspotId) ?? hotspots[0] ?? null;

    const yearSuffix = w2?.yearCrafted ? ` (${formatMetaYear(w2.yearCrafted)})` : '';
    const specLine = sanitizeMetaCopy(
      `${w2?.metallurgySpec ?? dossier.metallurgySpec}${w2?.artisanAttribution ? ` · ${w2.artisanAttribution}${yearSuffix}` : ''}`,
    );

    return `
      ${
        showInlineTools
          ? `
            <div style="display:flex;gap:8px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.07);">
              <button type="button" class="ws-meta-chip ${this.uvBlacklightActive ? 'is-active' : ''}" id="ws-obs-uv-scan">✦ UV</button>
              <button type="button" class="ws-meta-chip ${this.relicLatchesOpen ? 'is-active' : ''}" id="ws-obs-latch-toggle">⚙ Latches</button>
            </div>
          `
          : ''
      }

      <!-- Crisp Frameless Provenance Header -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            ${
              w2?.signatureGlyphUrl
                ? `<img src="./${escapeMetaHtml(w2.signatureGlyphUrl)}" alt="" style="width:30px;height:30px;object-fit:contain;flex-shrink:0;" />`
                : ''
            }
            <div style="min-width:0;">
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--cyan-clue);letter-spacing:0.08em;">
                ${escapeMetaHtml(w2?.archiveCode ?? `${dossier.countryCode} · ${dossier.cityLabel.toUpperCase()}`)} · ${unlockedRelicsCount}/8 RECOVERED
              </div>
              <div style="font-family:var(--font-display);font-size:16px;font-weight:800;color:var(--gold-bright);margin-top:2px;line-height:1.2;">
                ${escapeMetaHtml(w2?.name ?? dossier.title)}
              </div>
            </div>
          </div>
          <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.05em;color:${unlocked ? 'var(--emerald-win)' : 'var(--crimson-alert)'};white-space:nowrap;flex-shrink:0;padding-top:2px;">
            ${unlocked ? '✦ RECOVERED' : '◇ CLASSIFIED'}
          </span>
        </div>

        <div style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);line-height:1.38;">
          ${escapeMetaHtml(specLine)}
        </div>

        <p style="margin:0;font-size:13px;color:var(--ivory-primary);line-height:1.48;">
          ${escapeMetaHtml(sanitizeMetaCopy(w2?.provenanceEssay ?? dossier.historicalProvenance))}
        </p>

        ${
          hotspots.length > 0
            ? `
              <div style="display:flex;flex-direction:column;gap:8px;padding-top:4px;">
                <div class="ws-meta-hscroll">
                  ${hotspots
                    .map((hs) => {
                      const isAct = focusedHotspot?.id === hs.id;
                      return `
                        <button type="button" class="ws-meta-chip ${isAct ? 'is-active' : ''}" data-obs-hotspot="${escapeMetaHtml(hs.id)}" data-orbit-deg="${hs.orbitDeg[0]}">
                          ◎ ${escapeMetaHtml(hs.label)}
                        </button>
                      `;
                    })
                    .join('')}
                </div>
                ${
                  focusedHotspot
                    ? `<div class="ws-meta-note is-cyan">
                        <strong>${escapeMetaHtml(focusedHotspot.label)}:</strong> ${escapeMetaHtml(sanitizeMetaCopy(focusedHotspot.note))}
                      </div>`
                    : ''
                }
              </div>
            `
            : ''
        }
      </div>

      <!-- Conspiracy Provenance, Latches & UV Blacklight Readout (Frameless Hairlines) -->
      <div class="ws-meta-section" style="border-bottom:none;">
        ${
          unlocked
            ? `
              <div class="ws-meta-note">
                <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;margin-bottom:3px;">
                  CONSPIRACY PROVENANCE
                </div>
                ${escapeMetaHtml(sanitizeMetaCopy(w2?.conspiracySignificance ?? dossier.conspiracyNote))}
              </div>
              ${
                this.relicLatchesOpen && w2?.latches && w2.latches.length > 0
                  ? `
                    <div style="display:flex;flex-direction:column;gap:4px;padding-top:4px;">
                      <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;">
                        ⚙ UNSEALED MECHANICAL LATCHES
                      </div>
                      ${w2.latches
                        .map(
                          (lt) => `
                            <div class="ws-meta-row" style="justify-content:flex-start;gap:8px;font-size:11.5px;">
                              <img src="./${escapeMetaHtml(lt.glyphUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;flex-shrink:0;" />
                              <span><strong>${escapeMetaHtml(lt.latchName)}:</strong> <code style="color:var(--gold-bright);">“${escapeMetaHtml(sanitizeMetaCopy(lt.engraving))}”</code></span>
                            </div>
                          `,
                        )
                        .join('')}
                    </div>
                  `
                  : ''
              }
              ${
                this.uvBlacklightActive
                  ? `
                    <div class="ws-meta-note is-cyan" style="font-family:var(--font-mono);font-size:11px;">
                      ✦ ${escapeMetaHtml(sanitizeMetaCopy(w2?.uvHiddenInscription ?? dossier.uvHiddenInscription))}
                    </div>
                  `
                  : `<div style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">Tap <strong>UV</strong> or <strong>Latches</strong> on the 3D stage to inspect concealed engravings.</div>`
              }
            `
            : `
              <div class="ws-meta-note is-crimson">
                <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--amber-warn);letter-spacing:0.06em;margin-bottom:2px;">
                  SEALED CONSPIRACY NOTE
                </div>
                ${escapeMetaHtml(sanitizeMetaCopy(dossier.unlockHowTo))}
              </div>
            `
        }
      </div>
    `;
  }

  private renderIntelFlashesVault(): string {
    const items = this.getCombinedFlashes();
    const personalCount = this.deps.passport.getSnapshot().bookmarks.length;

    return `
      <!-- Search, Curated Toggle & Launch Quiz -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;gap:10px;align-items:center;">
          <input
            id="ws-obs-flash-search"
            class="ws-meta-input ws-name-input"
            style="flex:1 1 auto;"
            type="search"
            autocomplete="off"
            spellcheck="false"
            placeholder="Search bookmarked flashes, answers, or debriefs..."
            value="${escapeMetaHtml(this.searchQuery)}"
          />
          <button type="button" class="ws-meta-btn-gold" id="ws-obs-launch-quiz">
            Mastery Deck ▶
          </button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <button type="button" class="ws-meta-chip ${this.includeSeedExemplars ? 'is-active' : ''}" id="ws-obs-toggle-seeds">
            ${this.includeSeedExemplars ? '✓ Geneva Curated Included' : '+ Include Geneva Curated'}
          </button>
          ${
            personalCount === 0
              ? `<span style="font-size:11px;color:#9aa4b7;">Tap <strong>◇ Save Intel</strong> after any question to archive flashes here.</span>`
              : `<span style="font-family:var(--font-mono);font-size:10.5px;color:var(--gold-bright);">${personalCount} Personal Saved</span>`
          }
        </div>

        <!-- Single-Row Horizontal Scrollable 12-Domain Filter -->
        <div class="ws-meta-hscroll" aria-label="Filter by Domain">
          <button type="button" class="ws-meta-chip ${this.domainFilter === 'ALL' ? 'is-active' : ''}" data-flash-domain="ALL">
            All Domains
          </button>
          ${SOVEREIGN_DOMAINS.map((dom) => {
            const isAct = this.domainFilter === dom.id;
            return `
              <button type="button" class="ws-meta-chip ${isAct ? 'is-active' : ''}" data-flash-domain="${dom.id}">
                <img src="./${escapeMetaHtml(dom.medallionUrl)}" alt="" style="width:16px;height:16px;object-fit:contain;" />
                ${escapeMetaHtml(dom.shortName)}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Hairline-Divided Intel Flash List (Zero Nested Cards!) -->
      <div class="ws-meta-section" style="border-bottom:none;padding-top:4px;gap:0;">
        ${
          items.length > 0
            ? items
                .map((item) => {
                  const dom = getSovereignDomainMeta(item.domainId);
                  return `
                    <div style="padding:13px 0;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;flex-direction:column;gap:6px;">
                      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                        <span style="display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:${dom.accentHex};">
                          <img src="./${escapeMetaHtml(dom.medallionUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;" />
                          ${escapeMetaHtml(dom.name)}
                          <span style="color:var(--ivory-dim);font-weight:500;">· ${item.isSeedExemplar ? 'Geneva Archive' : '★ Saved'}</span>
                        </span>
                        ${
                          !item.isSeedExemplar
                            ? `<button type="button" class="ws-meta-inline-link" data-remove-bookmark="${item.qid}" style="color:var(--ivory-dim);font-size:10.5px;">Remove</button>`
                            : ''
                        }
                      </div>
                      <div style="font-size:13.5px;font-weight:600;color:var(--ivory-primary);line-height:1.4;">
                        ${escapeMetaHtml(sanitizeMetaCopy(item.prompt))}
                      </div>
                      <div style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--emerald-win);">
                        ✓ ${escapeMetaHtml(sanitizeMetaCopy(item.answer))}
                      </div>
                      <div class="ws-meta-note is-cyan" style="font-size:12px;">
                        ${escapeMetaHtml(sanitizeMetaCopy(item.whyExplanation))}
                      </div>
                    </div>
                  `;
                })
                .join('')
            : `<div style="padding:28px 0;text-align:center;color:var(--ivory-muted);font-size:13px;">No Intel Flashes match your current filter.</div>`
        }
      </div>
    `;
  }

  private renderSelfQuizMode(): string {
    const summary = this.srs.getDeckSummary();
    const allCards = this.srs.getAllCards();
    const filteredQueue = this.getFilteredSrsCards();
    const maxBoxCount = Math.max(1, ...summary.boxCounts);
    const boxes: readonly LeitnerBox[] = [1, 2, 3, 4, 5];

    const headerStatsAndBarsHtml = `
      <!-- Frameless 4-KPI Leitner Mastery Strip -->
      <div class="ws-meta-kpi-strip is-four-col" id="ws-srs-kpi-strip">
        <div class="ws-meta-kpi-cell" data-srs-kpi="due">
          <span class="ws-meta-kpi-lbl">Due Now</span>
          <span class="ws-meta-kpi-val" id="ws-srs-due-count" style="color:${summary.dueCount > 0 ? 'var(--gold-bright)' : 'var(--emerald-win)'};">${summary.dueCount}</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="total">
          <span class="ws-meta-kpi-lbl">Deck Cards</span>
          <span class="ws-meta-kpi-val" id="ws-srs-total-count">${summary.totalCards}</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="retention">
          <span class="ws-meta-kpi-lbl">Retention</span>
          <span class="ws-meta-kpi-val" id="ws-srs-retention" style="color:var(--cyan-clue);">${summary.retentionPct}%</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="mastered">
          <span class="ws-meta-kpi-lbl">Mastered</span>
          <span class="ws-meta-kpi-val" id="ws-srs-mastered-count" style="color:var(--emerald-win);">${summary.masteredCount}</span>
        </div>
      </div>

      <!-- 5-Box Leitner Mastery Bars (Zero Nested Boxes) -->
      <div class="ws-meta-section" style="padding-top:10px;padding-bottom:10px;gap:8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <h3 class="ws-meta-section-title">5-Box Leitner Mastery Deck</h3>
          <span style="font-family:var(--font-mono);font-size:10px;color:#a5afc2;">
            ${this.srsBoxFilter ? `Filtered: Box ${this.srsBoxFilter} (tap to clear)` : 'Box 1 Immediate → Box 5 Mastered (21d)'}
          </span>
        </div>

        <div class="ws-srs-boxes-grid" id="ws-srs-box-bars" aria-label="Leitner Boxes 1 to 5">
          ${boxes
            .map((boxNum) => {
              const count = summary.boxCounts[boxNum - 1];
              const fillPct = summary.totalCards > 0 ? Math.max(count > 0 ? 14 : 0, Math.round((count / maxBoxCount) * 100)) : 0;
              const accent = SRS_BOX_ACCENTS[boxNum];
              const isSelected = this.srsBoxFilter === boxNum;
              return `
                <button
                  type="button"
                  class="ws-srs-box-bar ${isSelected ? 'is-active' : ''}"
                  data-srs-box="${boxNum}"
                  data-srs-box-count="${count}"
                  aria-pressed="${isSelected}"
                >
                  <div class="ws-srs-box-head">
                    <span class="ws-srs-box-name">Box ${boxNum}</span>
                    <span class="ws-srs-box-count" style="color:${accent};">${count}</span>
                  </div>
                  <div class="ws-srs-box-track">
                    <div class="ws-srs-box-fill" style="width:${fillPct}%;background:${accent};"></div>
                  </div>
                  <span class="ws-srs-box-interval">${escapeMetaHtml(LEITNER_BOX_SHORT_INTERVALS[boxNum])}</span>
                </button>
              `;
            })
            .join('')}
        </div>

        <!-- Filter Pills + Optional 3D Stage Review Launch (Zero Right-Edge Clip on 360px!) -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;" role="group" aria-label="Mastery Deck Filter">
          <button type="button" class="ws-meta-chip ${this.srsFilter === 'DUE' ? 'is-active' : ''}" data-srs-filter="DUE">
            Due (${summary.dueCount})
          </button>
          <button type="button" class="ws-meta-chip ${this.srsFilter === 'ALL' ? 'is-active' : ''}" data-srs-filter="ALL">
            All (${summary.totalCards})
          </button>
          <button type="button" class="ws-meta-chip ${this.srsFilter === 'MASTERED' ? 'is-active' : ''}" data-srs-filter="MASTERED">
            Mastered (${summary.masteredCount})
          </button>
          ${
            this.callbacks.onLaunchLivePrismReview && filteredQueue.length > 0
              ? `<button type="button" class="ws-meta-chip" id="ws-srs-launch-3d" style="color:var(--cyan-clue);">
                  3D Review ▶
                </button>`
              : ''
          }
        </div>
      </div>
    `;

    // Empty Deck Onboarding State
    if (summary.totalCards === 0) {
      return `
        ${headerStatsAndBarsHtml}
        <div class="ws-meta-section" style="text-align:center;padding:24px 8px;border-bottom:none;gap:12px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--gold-bright);">
            Your Leitner Mastery Deck Is Ready
          </div>
          <p style="margin:0 auto;max-width:440px;font-size:12.5px;color:var(--ivory-muted);line-height:1.48;">
            Every missed question automatically enters <strong>Box 1 (Immediate Review)</strong>, and every Saved Intel Flash enters <strong>Box 2 (24h)</strong>. Promote cards across 5 spaced intervals to lock facts into permanent memory.
          </p>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;padding-top:4px;">
            <button type="button" class="ws-meta-btn-gold" id="ws-srs-load-demo">
              Load Geneva Starter Deck (6 Cards)
            </button>
          </div>
        </div>
      `;
    }

    // Resolve currently displayed review card (keep revealed card visible until Next is clicked!)
    const answered = this.quizPickedIdx !== null || this.quizShutterFlipped;
    let current: SrsReviewCard | null = answered ? this.srsActiveCard : null;
    if (!current && filteredQueue.length > 0) {
      const safeIdx = ((this.quizCursor % filteredQueue.length) + filteredQueue.length) % filteredQueue.length;
      current = filteredQueue[safeIdx];
    }

    if (!current) {
      const isDueEmpty = this.srsFilter === 'DUE' && this.srsBoxFilter === null;
      const headline = isDueEmpty
        ? 'All Due Reviews Cleared'
        : this.srsFilter === 'MASTERED'
          ? 'No Cards in Box 5 Mastered Yet'
          : 'No Cards Match This Box Filter';
      const detail = isDueEmpty
        ? `All ${summary.totalCards} card${summary.totalCards === 1 ? '' : 's'} in your Leitner deck are scheduled ahead. Review the full deck early or play another match to capture new cards.`
        : 'Promote cards correctly through Boxes 1 → 5 or switch to All Saved & Missed to practice now.';
      return `
        ${headerStatsAndBarsHtml}
        <div class="ws-meta-section" style="text-align:center;padding:22px 8px;border-bottom:none;gap:12px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:${isDueEmpty ? 'var(--emerald-win)' : 'var(--gold-bright)'};">
            ${isDueEmpty ? '✦ ' : ''}${escapeMetaHtml(headline)}
          </div>
          <p style="margin:0 auto;max-width:440px;font-size:12.5px;color:var(--ivory-muted);line-height:1.45;">
            ${escapeMetaHtml(detail)}
          </p>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
            <button type="button" class="ws-meta-btn-gold" id="ws-obs-reset-quiz-filter">
              Practice All Deck Cards (${summary.totalCards}) ▶
            </button>
          </div>
        </div>
      `;
    }

    // Keep exact same A-D options during an active/revealed turn
    let quizChoice = this.srsActiveOptions;
    if (!quizChoice || quizChoice.qid !== current.qid) {
      const built = buildSrsQuizOptions(current, allCards);
      quizChoice = { qid: current.qid, options: built.options, correctIdx: built.correctIdx };
      this.srsActiveOptions = quizChoice;
    }

    const { options, correctIdx } = quizChoice;
    const dom = getSovereignDomainMeta(current.domainId);
    const displayBox: LeitnerBox = this.srsLastAttemptResult?.newBox ?? current.box;
    const letters = ['A', 'B', 'C', 'D'];
    const sourceBadge =
      current.source === 'BOTH'
        ? 'Missed + Saved'
        : current.source === 'MISSED'
          ? 'Auto-Captured Miss'
          : current.source === 'BOOKMARKED'
            ? 'Saved Flash'
            : 'Geneva Archive';
    const dueLabel = formatTimeUntilReview(
      this.srsLastAttemptResult?.card.nextReviewAtMs ?? current.nextReviewAtMs,
    );
    const queuePos =
      filteredQueue.length > 0
        ? `${(((this.quizCursor % filteredQueue.length) + filteredQueue.length) % filteredQueue.length) + 1}/${filteredQueue.length}`
        : 'Done';

    const result = this.srsLastAttemptResult;
    const promotionBadgeHtml = result
      ? result.wasCorrect
        ? `<span class="ws-srs-promotion-badge is-promoted" id="ws-srs-promotion-badge">
            ${
              result.promoted
                ? `✦ BOX ${result.previousBox} → BOX ${result.newBox} · NEXT IN ${result.nextIntervalLabel.toUpperCase()}`
                : `✦ BOX 5 MASTERED · NEXT IN ${result.nextIntervalLabel.toUpperCase()}`
            }
          </span>`
        : `<span class="ws-srs-promotion-badge is-reset" id="ws-srs-promotion-badge">
            ↺ RESET BOX ${result.previousBox} → BOX 1 · DUE NOW
          </span>`
      : '';

    return `
      ${headerStatsAndBarsHtml}
      <div class="ws-meta-section ws-srs-runner" id="ws-srs-runner" data-srs-active-qid="${current.qid}" data-srs-active-box="${displayBox}" style="padding-top:12px;border-bottom:none;gap:12px;">
        <div class="ws-srs-card-header">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <img src="./${escapeMetaHtml(dom.medallionUrl)}" alt="" style="width:22px;height:22px;object-fit:contain;flex-shrink:0;" />
            <div style="min-width:0;">
              <div style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:${dom.accentHex};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${escapeMetaHtml(dom.name)}${current.subcatLabel ? ` · ${escapeMetaHtml(current.subcatLabel)}` : ''}
              </div>
              <div style="font-family:var(--font-mono);font-size:10px;color:#a5afc2;">
                ${escapeMetaHtml(sourceBadge)} · ${escapeMetaHtml(dueLabel)} · Card ${escapeMetaHtml(queuePos)}
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;">
            <span class="ws-srs-box-pill is-box-${displayBox}" id="ws-srs-card-box-pill">
              ${escapeMetaHtml(LEITNER_BOX_LABELS[displayBox])}
            </span>
          </div>
        </div>

        <div style="font-size:clamp(14.5px,1.55vw,17px);font-weight:600;color:var(--ivory-primary);line-height:1.44;">
          ${escapeMetaHtml(sanitizeMetaCopy(current.prompt))}
        </div>

        <!-- 4 Sleek Borderless A-D Review Strips -->
        <div class="ws-srs-options-list">
          ${options
            .map((optText, idx) => {
              const isCorrect = idx === correctIdx;
              const isPicked = this.quizPickedIdx === idx;
              const stateClass = answered
                ? isCorrect
                  ? 'is-correct'
                  : isPicked
                    ? 'is-wrong'
                    : ''
                : '';
              return `
                <button
                  type="button"
                  class="ws-srs-option-btn ${stateClass}"
                  data-quiz-pick="${idx}"
                  data-srs-correct="${isCorrect ? 'true' : 'false'}"
                  ${answered ? 'disabled' : ''}
                >
                  <span class="ws-srs-option-key">${letters[idx]}</span>
                  <span style="white-space:normal;line-height:1.3;">${escapeMetaHtml(optText)}</span>
                </button>
              `;
            })
            .join('')}
        </div>

        ${
          answered
            ? `
              <div class="ws-meta-note ${result?.wasCorrect ? 'is-emerald' : 'is-crimson'}" style="display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;">
                  <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${result?.wasCorrect ? 'var(--emerald-win)' : '#ff99a5'};">
                    ${result?.wasCorrect ? '✦ EXACT RECALL' : `✓ ${escapeMetaHtml(sanitizeMetaCopy(current.correctAnswer))}`}
                  </span>
                  ${promotionBadgeHtml}
                </div>
                ${
                  current.whyExplanation
                    ? `<div style="font-size:12.5px;color:var(--ivory-primary);line-height:1.42;">
                        ${escapeMetaHtml(sanitizeMetaCopy(current.whyExplanation))}
                      </div>`
                    : ''
                }
              </div>
            `
            : ''
        }

        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:4px;">
          ${
            !answered
              ? `<button type="button" class="ws-meta-btn" id="ws-obs-quiz-flip">Reveal Answer</button>`
              : `<span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">Session: ${this.quizCorrectCount}/${this.quizAttemptedCount} · Streak ${this.quizStreak}</span>`
          }
          <button type="button" class="ws-meta-btn-gold" id="ws-obs-quiz-next">
            ${this.srsFilter === 'DUE' ? 'Next Due Card ▶' : 'Next Card ▶'}
          </button>
        </div>
      </div>
    `;
  }

  private bindEvents(host: HTMLElement): void {
    host.querySelector('#ws-obs-back')?.addEventListener('click', () => {
      this.handleBackOrClose();
    });

    bindVaultJumperEvents(host, {
      closeBtnId: 'ws-obs-close',
      onNavigate: (target) => this.callbacks.onNavigateSection?.(target),
      onClose: () => this.handleClose(),
      onTapFeedback: () => {
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
      },
    });

    host.querySelectorAll<HTMLButtonElement>('[data-obs-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextTab = btn.dataset.obsTab as ObservatoryTabId | undefined;
        if (!nextTab || nextTab === this.activeTab) return;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        if (nextTab !== 'RELICS_3D') {
          this.deps.audio?.stopVoice();
        }
        this.activeTab = nextTab;
        if (nextTab === 'RELICS_3D') {
          void this.sync3DShowcase();
        } else if (nextTab === 'SELF_QUIZ') {
          this.resetSrsRunnerTurn(true);
          this.syncSrsBookmarksAndDefaultFilter();
        }
        this.rerender();
      });
    });

    // 360° 3D Relic Study Controls
    host.querySelectorAll<HTMLButtonElement>('[data-select-artifact]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.selectArtifact as ShowcaseArtifactId | undefined;
        if (!id) return;
        this.deps.haptics?.sightlineSnap();
        this.deps.audio?.playSfx('sightline_snap');
        this.deps.audio?.stopVoice();
        this.selectedArtifactId = id;
        this.uvBlacklightActive = false;
        this.relicLatchesOpen = false;
        this.activeHotspotId = null;
        void this.sync3DShowcase();
        this.rerender();
      });
    });

    host.querySelectorAll<HTMLButtonElement>('[data-obs-hotspot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeHotspotId = btn.dataset.obsHotspot ?? null;
        const deg = Number(btn.dataset.orbitDeg) || 0;
        if (this.deps.stage3d) {
          this.deps.stage3d.prismRig.applyInspectDrag((deg * Math.PI) / 180, 0.8);
          this.deps.stage3d.prismRig.releaseInspectDrag();
        }
        this.deps.haptics?.spinTick();
        this.deps.audio?.playSfx('sightline_snap');
        this.rerender();
      });
    });

    host.querySelector('#ws-obs-latch-toggle')?.addEventListener('click', () => {
      this.relicLatchesOpen = !this.relicLatchesOpen;
      this.actuate3DRelicLatches(this.relicLatchesOpen);
      this.deps.haptics?.peel(this.relicLatchesOpen ? 2 : 1);
      this.deps.audio?.playSfx('shutter_peel');
      if (this.relicLatchesOpen) {
        this.callbacks.onLatchesOpened?.(this.selectedArtifactId);
        if (this.isArtifactUnlocked(this.selectedArtifactId)) {
          this.deps.audio?.playVoice('callout_vance_relic_latch.mp3');
        }
      }
      this.rerender();
    });

    host.querySelector('#ws-obs-uv-scan')?.addEventListener('click', () => {
      this.uvBlacklightActive = !this.uvBlacklightActive;
      this.deps.haptics?.peel(2);
      this.deps.audio?.playSfx('shutter_peel');
      if (this.uvBlacklightActive) {
        this.callbacks.onUvScan?.(this.selectedArtifactId);
      }
      if (this.deps.stage3d) {
        this.deps.stage3d.setLightingMode(
          this.uvBlacklightActive
            ? 'TWIST_FRACTURE'
            : this.selectedArtifactId === 'championship_trophy'
              ? 'GOLD_RESONANCE'
              : 'BROADCAST',
        );
      }
      this.rerender();
    });

    // Intel Flash Search Input (stop key propagation so game shortcuts never trigger!)
    const searchInput = host.querySelector<HTMLInputElement>('#ws-obs-flash-search');
    if (searchInput) {
      const stopKeys = (ev: KeyboardEvent) => ev.stopPropagation();
      searchInput.addEventListener('keydown', stopKeys);
      searchInput.addEventListener('keyup', stopKeys);
      searchInput.addEventListener('keypress', stopKeys);
      searchInput.addEventListener('input', () => {
        const caret = searchInput.selectionStart ?? searchInput.value.length;
        this.searchQuery = searchInput.value;
        this.quizCursor = 0;
        this.rerender();
        const nextEl = host.querySelector<HTMLInputElement>('#ws-obs-flash-search');
        if (nextEl) {
          nextEl.focus();
          nextEl.setSelectionRange(caret, caret);
        }
      });
    }

    host.querySelector('#ws-obs-toggle-seeds')?.addEventListener('click', () => {
      this.includeSeedExemplars = !this.includeSeedExemplars;
      this.quizCursor = 0;
      this.deps.haptics?.uiTap();
      this.deps.audio?.playSfx('ui_tap');
      this.rerender();
    });

    host.querySelector('#ws-obs-launch-quiz')?.addEventListener('click', () => {
      this.activeTab = 'SELF_QUIZ';
      this.resetSrsRunnerTurn(true);
      this.syncSrsBookmarksAndDefaultFilter();
      this.deps.haptics?.uiTap();
      this.deps.audio?.playSfx('ui_tap');
      this.rerender();
    });

    host.querySelectorAll<HTMLButtonElement>('[data-flash-domain]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const raw = btn.dataset.flashDomain;
        this.domainFilter = raw === 'ALL' ? 'ALL' : (Number(raw) as DomainId);
        this.quizCursor = 0;
        this.quizPickedIdx = null;
        this.quizShutterFlipped = false;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.rerender();
      });
    });

    host.querySelectorAll<HTMLButtonElement>('[data-remove-bookmark]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qid = Number(btn.dataset.removeBookmark);
        const found = this.deps.passport.getSnapshot().bookmarks.find((b) => b.qid === qid);
        if (!found) return;
        this.deps.passport.toggleIntelBookmark(found);
        this.srs.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks);
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.rerender();
      });
    });

    // 5-Box Leitner Spaced-Repetition Mastery Deck Events
    host.querySelectorAll<HTMLButtonElement>('[data-srs-box]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const boxNum = Number(btn.dataset.srsBox) as LeitnerBox;
        if (boxNum < 1 || boxNum > 5) return;
        this.srsBoxFilter = this.srsBoxFilter === boxNum ? null : boxNum;
        if (this.srsBoxFilter !== null && this.srsFilter === 'DUE') {
          this.srsFilter = 'ALL';
        }
        this.resetSrsRunnerTurn(false);
        this.quizCursor = 0;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.rerender();
      });
    });

    host.querySelectorAll<HTMLButtonElement>('[data-srs-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextFilter = btn.dataset.srsFilter as SrsDeckFilter | undefined;
        if (!nextFilter) return;
        this.srsFilter = nextFilter;
        this.srsBoxFilter = null;
        this.resetSrsRunnerTurn(true);
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.rerender();
      });
    });

    host.querySelector('#ws-srs-load-demo')?.addEventListener('click', () => {
      this.srs.seedDemoCardsIfEmpty();
      this.srsFilter = 'DUE';
      this.srsBoxFilter = null;
      this.resetSrsRunnerTurn(true);
      this.deps.haptics?.correctBloom();
      this.deps.audio?.playSfx('sightline_snap');
      this.rerender();
    });

    host.querySelector('#ws-srs-launch-3d')?.addEventListener('click', () => {
      const queue = this.getFilteredSrsCards();
      if (queue.length === 0 || !this.callbacks.onLaunchLivePrismReview) return;
      const launchCb = this.callbacks.onLaunchLivePrismReview;
      this.deps.haptics?.uiTap();
      this.deps.audio?.playSfx('ui_tap');
      this.close();
      launchCb(queue);
    });

    host.querySelector('#ws-obs-reset-quiz-filter')?.addEventListener('click', () => {
      this.srsFilter = 'ALL';
      this.srsBoxFilter = null;
      this.resetSrsRunnerTurn(true);
      this.deps.haptics?.uiTap();
      this.deps.audio?.playSfx('ui_tap');
      this.rerender();
    });

    host.querySelectorAll<HTMLButtonElement>('[data-quiz-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.quizPickedIdx !== null || this.quizShutterFlipped) return;
        const idx = Number(btn.dataset.quizPick);
        const queue = this.getFilteredSrsCards();
        if (queue.length === 0) return;
        const safeIdx = ((this.quizCursor % queue.length) + queue.length) % queue.length;
        const card = queue[safeIdx];
        const choice =
          this.srsActiveOptions && this.srsActiveOptions.qid === card.qid
            ? this.srsActiveOptions
            : { qid: card.qid, ...buildSrsQuizOptions(card, this.srs.getAllCards()) };
        this.srsActiveOptions = choice;

        const isCorrect = idx === choice.correctIdx;
        this.srsActiveCard = card;
        this.quizPickedIdx = idx;
        this.quizAttemptedCount += 1;
        this.srsLastAttemptResult = this.srs.recordReviewAttempt(card.qid, isCorrect);

        if (isCorrect) {
          this.quizCorrectCount += 1;
          this.quizStreak += 1;
          this.deps.haptics?.correctBloom();
          this.deps.audio?.playSfx('gold_resonance');
        } else {
          this.quizStreak = 0;
          this.deps.haptics?.wrongThud(false);
          this.deps.audio?.playSfx('backfire_fracture');
        }
        this.rerender();
      });
    });

    host.querySelector('#ws-obs-quiz-flip')?.addEventListener('click', () => {
      if (this.quizPickedIdx !== null || this.quizShutterFlipped) return;
      const queue = this.getFilteredSrsCards();
      if (queue.length === 0) return;
      const safeIdx = ((this.quizCursor % queue.length) + queue.length) % queue.length;
      const card = queue[safeIdx];
      this.srsActiveCard = card;
      this.quizShutterFlipped = true;
      this.quizAttemptedCount += 1;
      this.quizStreak = 0;
      this.srsLastAttemptResult = this.srs.recordReviewAttempt(card.qid, false);
      this.deps.haptics?.peel(2);
      this.deps.audio?.playSfx('shutter_peel');
      this.rerender();
    });

    host.querySelector('#ws-obs-quiz-next')?.addEventListener('click', () => {
      const wasRemovedFromDueQueue =
        this.srsFilter === 'DUE' && Boolean(this.srsLastAttemptResult?.wasCorrect);
      if (wasRemovedFromDueQueue) {
        this.quizCursor = 0;
      } else {
        this.quizCursor += 1;
      }
      this.resetSrsRunnerTurn(false);
      this.deps.haptics?.spinTick();
      this.deps.audio?.playSfx('spin_tick');
      this.rerender();
    });
  }
}
