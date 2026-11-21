import { DOMAINS, getDomainMeta, PERKS } from '../data/domains';
import type {
  ActiveQuestionState,
  Archetype3D,
  CampaignNodeMeta,
  CharacterId,
  DialogueDisplay,
  EndingId,
  EndlessCheckpointState,
  FactionId,
  GameActions,
  GameUIState,
  GhostOpponentProfile,
  GlobeCountryCode,
  HeroRelicId,
  MatchSummaryState,
  PerkId,
  PersonaId,
  PrismSkinId,
  QuestionResolution,
  TrialsHubState,
} from '../types/game';

type ObservatoryTab = 'PASSPORT' | 'VAULT';
type BriefingMorphFilter = Archetype3D | 'ALL';

const PORTRAIT_PATHS: Record<Exclude<CharacterId, 'none'>, string> = {
  vance: './assets/portraits/vance.jpg',
  nadia: './assets/portraits/nadia.jpg',
  soren: './assets/portraits/soren.jpg',
  teo: './assets/portraits/teo.jpg',
  lindqvist: './assets/portraits/lindqvist.jpg',
  tariq: './assets/portraits/tariq.jpg',
};

function getPortraitSrc(id: CharacterId | undefined): string | null {
  if (!id || id === 'none') return null;
  return PORTRAIT_PATHS[id] ?? null;
}

function inferPortraitFromSpeakerName(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes('vance') || lower.includes('julian')) return PORTRAIT_PATHS.vance;
  if (lower.includes('nadia') || lower.includes('okafor')) return PORTRAIT_PATHS.nadia;
  if (lower.includes('soren') || lower.includes('keller')) return PORTRAIT_PATHS.soren;
  if (lower.includes('teo') || lower.includes('marquez')) return PORTRAIT_PATHS.teo;
  if (lower.includes('lindqvist') || lower.includes('astrid') || lower.includes('chancellor')) {
    return PORTRAIT_PATHS.lindqvist;
  }
  if (lower.includes('tariq') || lower.includes('mansoor')) return PORTRAIT_PATHS.tariq;
  return null;
}

const GLOBE_COUNTRIES: GlobeCountryCode[] = ['CH', 'GB', 'JP', 'BR', 'EG', 'IS', 'SG', 'GLOBAL'];

const GLOBE_SHORT_CITY: Record<GlobeCountryCode, string> = {
  CH: 'Geneva',
  GB: 'London',
  JP: 'Tokyo',
  BR: 'Rio',
  EG: 'Cairo',
  IS: 'Reykjavík',
  SG: 'Singapore',
  GLOBAL: 'Apex',
};

const FALLBACK_NODES: Record<GlobeCountryCode, CampaignNodeMeta> = {
  CH: {
    id: 'ch_prologue',
    country: 'CH',
    city: 'Geneva',
    venueName: 'The Vetting Chamber',
    subtitle: 'Alpine intake monolith where every candidate is profiled.',
    status: 'AVAILABLE',
    factionLabel: 'THE MERIDIAN',
  },
  GB: {
    id: 'gb_london',
    country: 'GB',
    city: 'London',
    venueName: 'The Sovereign Rotunda',
    subtitle: 'Classical parliamentary dome steeped in archival intrigue.',
    status: 'LOCKED',
    factionLabel: 'SOVEREIGN BLOC',
  },
  JP: {
    id: 'jp_tokyo',
    country: 'JP',
    city: 'Tokyo',
    venueName: 'The Shinkansen Sky Pavilion',
    subtitle: 'High-altitude obsidian lattice overlooking Neo-Tokyo.',
    status: 'LOCKED',
    factionLabel: 'HORIZON TECH',
  },
  BR: {
    id: 'br_rio',
    country: 'BR',
    city: 'Rio de Janeiro',
    venueName: 'The Agora Amphitheater',
    subtitle: 'Open-air civic broadcast dome swept by live crowd telemetry.',
    status: 'LOCKED',
    factionLabel: 'AGORA CIVIC',
  },
  EG: {
    id: 'eg_cairo',
    country: 'EG',
    city: 'Cairo',
    venueName: 'Meridian Zero Vault',
    subtitle: 'Subterranean archive housing the classified Trial 00 dossier.',
    status: 'LOCKED',
    factionLabel: 'MERIDIAN ZERO',
  },
  IS: {
    id: 'is_reykjavik',
    country: 'IS',
    city: 'Reykjavík',
    venueName: 'The Geothermal Basalt Caldera',
    subtitle: 'Sub-glacial ledger server vault beneath active volcanic stone.',
    status: 'LOCKED',
    factionLabel: 'ARCHIVE CORE',
  },
  SG: {
    id: 'sg_singapore',
    country: 'SG',
    city: 'Singapore',
    venueName: 'The Diplomatic Sky-Bridge',
    subtitle: 'High-altitude Council enclave where alliances fracture live.',
    status: 'LOCKED',
    factionLabel: 'WORLD COUNCIL',
  },
  GLOBAL: {
    id: 'global_apex',
    country: 'GLOBAL',
    city: 'International Waters',
    venueName: 'The Apex Forum',
    subtitle: 'Grand Finale broadcast before two billion witnesses worldwide.',
    status: 'LOCKED',
    factionLabel: 'GRAND FINALE',
  },
};

const RELIC_META: Record<
  HeroRelicId,
  { name: string; shortName: string; origin: string; desc: string }
> = {
  meridian_astrolabe: {
    name: 'Meridian Astrolabe',
    shortName: 'Astrolabe',
    origin: 'Geneva',
    desc: 'Concentric brass celestial gimbal awarded in the Vetting Chamber.',
  },
  armillary_orrery: {
    name: 'Armillary Orrery',
    shortName: 'Orrery',
    origin: 'London',
    desc: 'Nested bronze planetary synthesis sphere from the Sovereign Rotunda.',
  },
  origami_prism: {
    name: 'Origami Prism',
    shortName: 'Origami',
    origin: 'Tokyo',
    desc: 'Kinetic obsidian-and-gold polyhedron from the Shinkansen Pavilion.',
  },
  emerald_sphere: {
    name: 'Emerald Sphere',
    shortName: 'Emerald',
    origin: 'Rio',
    desc: 'Civic geodesic crystal forged atop the sunlit Agora Amphitheater.',
  },
  cipher_box: {
    name: 'Meridian Cipher Box',
    shortName: 'Cipher Box',
    origin: 'Cairo',
    desc: 'Interlocking brass-and-lapis cryptex extracted from Meridian Zero.',
  },
  cryo_relay: {
    name: 'Cryo Ledger Relay',
    shortName: 'Cryo Relay',
    origin: 'Reykjavík',
    desc: 'Sub-glacial titanium thermal spire pulled from the Basalt Caldera.',
  },
  council_seal: {
    name: 'World Council Seal',
    shortName: 'Council Seal',
    origin: 'Singapore',
    desc: 'Sovereign diplomatic signet claimed on the Diplomatic Sky-Bridge.',
  },
  master_ledger: {
    name: 'The Master Ledger',
    shortName: 'Master Ledger',
    origin: 'Apex Forum',
    desc: 'The supreme polychromatic Veritas codex held by the World’s Smartest.',
  },
};

const RELIC_ORDER: HeroRelicId[] = [
  'meridian_astrolabe',
  'armillary_orrery',
  'origami_prism',
  'emerald_sphere',
  'cipher_box',
  'cryo_relay',
  'council_seal',
  'master_ledger',
];

const PRISM_SKIN_META: Record<
  PrismSkinId,
  { name: string; shortName: string; finish: string; swatchCss: string; unlockHint: string }
> = {
  OBSIDIAN_BRASS: {
    name: 'Obsidian Brass',
    shortName: 'Obsidian',
    finish: 'Meridian Standard',
    swatchCss: 'linear-gradient(135deg, #101624 0%, #242f44 46%, #d4a853 54%, #f7df9c 100%)',
    unlockHint: 'Standard Meridian Issue',
  },
  KYOTO_KINTSUGI: {
    name: 'Kyoto Kintsugi',
    shortName: 'Kintsugi',
    finish: 'Porcelain & Gold Vein',
    swatchCss: 'linear-gradient(135deg, #1d1924 0%, #382e42 42%, #f5cf6b 50%, #fff7df 60%, #1d1924 100%)',
    unlockHint: 'Complete the Apex Grand Finale',
  },
  DAMASCUS_TITANIUM: {
    name: 'Damascus Titanium',
    shortName: 'Damascus',
    finish: 'Cyan-Tempered Alloy',
    swatchCss: 'linear-gradient(135deg, #172333 0%, #334e6b 45%, #4fd1e8 55%, #b5f5ff 100%)',
    unlockHint: 'Choose Insider Path in Cairo',
  },
  EMERALD_SOVEREIGN: {
    name: 'Emerald Sovereign',
    shortName: 'Emerald',
    finish: 'Malachite & Bronze',
    swatchCss: 'linear-gradient(135deg, #0b261e 0%, #1a664c 45%, #3dd68c 55%, #e7c270 100%)',
    unlockHint: 'Clear Rio Agora Amphitheater',
  },
  BLACK_SALON_CRIMSON: {
    name: 'Black Salon Crimson',
    shortName: 'Crimson',
    finish: 'Ember Lacquer & Gold',
    swatchCss: 'linear-gradient(135deg, #240910 0%, #7d1728 45%, #e64553 55%, #f7df9c 100%)',
    unlockHint: 'Win Black Salon or Cairo Broadcast',
  },
};

const PRISM_SKIN_ORDER: PrismSkinId[] = [
  'OBSIDIAN_BRASS',
  'KYOTO_KINTSUGI',
  'DAMASCUS_TITANIUM',
  'EMERALD_SOVEREIGN',
  'BLACK_SALON_CRIMSON',
];

const PERSONA_META: Record<PersonaId, { title: string; tagline: string }> = {
  MAVERICK: {
    title: 'THE MAVERICK',
    tagline: 'High-conviction audacity under peak broadcast pressure',
  },
  DIPLOMAT: {
    title: 'THE DIPLOMAT',
    tagline: 'Measured composure & precision under scrutiny',
  },
  ANALYST: {
    title: 'THE ANALYST',
    tagline: 'Methodical lateral deduction across layered clues',
  },
  PRODIGY: {
    title: 'THE PRODIGY',
    tagline: 'Cold-instinct polymathic mastery at Tier 1',
  },
};

const PERK_ORDER: PerkId[] = [
  'DIPLOMAT_COMPOSURE',
  'MAVERICK_GAMBIT',
  'DIPLOMATIC_REDACTION',
  'CLEAN_HANDS',
  'HORIZON_LENS',
  'ANALOG_STATIC_MASTER',
  'COOP_CROSSCHECK',
  'PEOPLES_LENS',
  'COUNCIL_OVERRIDE',
  'BLUFF_ECHO',
];

const ENDING_META: Record<
  EndingId,
  {
    numeral: string;
    badge: string;
    title: string;
    subtitle: string;
    epilogue: string;
    tone: 'gold' | 'cyan' | 'crimson' | 'prismatic';
  }
> = {
  SOVEREIGN_ARBITER: {
    numeral: 'I',
    badge: 'ENDING I · INSTITUTIONAL MANDATE',
    title: 'THE SOVEREIGN ARBITER',
    subtitle: 'Reformed The Meridian from the Chair of Authority',
    epilogue:
      'Taking the Arbiter’s seat before the World Council, you bound The Ledger to transparent international charter law.',
    tone: 'gold',
  },
  OPEN_COMMONS: {
    numeral: 'II',
    badge: 'ENDING II · GLOBAL BROADCAST',
    title: 'THE OPEN COMMONS',
    subtitle: 'Decrypted Live for Two Billion Witnesses',
    epilogue:
      'Every redacted vault entry streamed simultaneously across every screen on Earth — ending closed-door rule in one broadcast.',
    tone: 'cyan',
  },
  KINGMAKER: {
    numeral: 'III',
    badge: 'ENDING III · UNILATERAL ASCENSION',
    title: 'THE KINGMAKER',
    subtitle: 'Absolute Dominion Atop the Apex Spire',
    epilogue:
      'You claimed the Master Ledger alone. In the shadows below, Julian Vance quietly dials the next challenger’s line.',
    tone: 'crimson',
  },
  ARCHITECT_SUCCESSION: {
    numeral: 'IV',
    badge: 'SECRET TRUE ENDING · ARCHITECT’S SEAL',
    title: 'THE ARCHITECT’S SUCCESSION',
    subtitle: 'Forged the Permanent Global Citizen Council',
    epilogue:
      'Vance and Tariq’s Trojan Horse succeeded beyond imagining — the Meridian Charter is reborn in open consensus for all humanity.',
    tone: 'prismatic',
  },
};

const ENDING_ORDER: EndingId[] = [
  'SOVEREIGN_ARBITER',
  'OPEN_COMMONS',
  'KINGMAKER',
  'ARCHITECT_SUCCESSION',
];

const FACTION_META: Record<
  FactionId,
  { name: string; shortName: string; motto: string; tone: 'gold' | 'cyan' | 'emerald' }
> = {
  SOVEREIGN: {
    name: 'Sovereign Bloc',
    shortName: 'SOVEREIGN',
    motto: 'Institutional Heritage',
    tone: 'gold',
  },
  HORIZON: {
    name: 'Horizon Collective',
    shortName: 'HORIZON',
    motto: 'Predictive Telemetry',
    tone: 'cyan',
  },
  AGORA: {
    name: 'Agora Coalition',
    shortName: 'AGORA',
    motto: 'Open Civic Mandate',
    tone: 'emerald',
  },
};

const FACTION_ORDER: FactionId[] = ['SOVEREIGN', 'HORIZON', 'AGORA'];

const BRIEFING_MORPH_FILTERS: Array<{ id: BriefingMorphFilter; label: string; fullName: string }> = [
  { id: 'ALL', label: 'ALL MORPHS', fullName: 'All 4 Prism Morphs' },
  { id: 'SIGHTLINE_LOCK', label: 'SIGHTLINE', fullName: 'Sightline Lock' },
  { id: 'CALIBRATOR_DIAL', label: 'CALIBRATOR', fullName: 'Calibrator Dial' },
  { id: 'CODEX_DUAL_RING', label: 'CODEX', fullName: 'Codex Dual-Ring' },
  { id: 'GAUNTLET_SHATTER', label: 'GAUNTLET', fullName: 'Gauntlet Shatter' },
];

const FALLBACK_GHOSTS: GhostOpponentProfile[] = [
  {
    id: 'ghost_keller_01',
    handle: 'S. KELLER // ZERO',
    countryCode: 'JP',
    faction: 'HORIZON',
    elo: 1680,
    portraitId: 'soren',
    styleTag: 'Tier-1 Overclock Predator',
  },
  {
    id: 'ghost_okafor_02',
    handle: 'DR. OKAFOR',
    countryCode: 'GB',
    faction: 'AGORA',
    elo: 1520,
    portraitId: 'nadia',
    styleTag: 'Precision Calibrator Specialist',
  },
  {
    id: 'ghost_marquez_03',
    handle: 'TEO.UPLINK',
    countryCode: 'BR',
    faction: 'AGORA',
    elo: 1380,
    portraitId: 'teo',
    styleTag: 'High-Tempo Gauntlet Breaker',
  },
  {
    id: 'ghost_lindqvist_04',
    handle: 'CHANCELLOR_A',
    countryCode: 'CH',
    faction: 'SOVEREIGN',
    elo: 1790,
    portraitId: 'lindqvist',
    styleTag: 'Cold-Blooded Diplomatic Purist',
  },
  {
    id: 'ghost_mansoor_05',
    handle: 'ARCHITECT_00',
    countryCode: 'EG',
    faction: 'SOVEREIGN',
    elo: 1850,
    portraitId: 'tariq',
    styleTag: 'Grandmaster Lateral Polymath',
  },
];

const CALIBRATOR_NUDGE_STEP = 0.02;
const CODEX_BUTTON_SPIN_PX = 68;
const OVERCLOCK_HOLD_DELAY_MS = 160;
const OVERCLOCK_CANCEL_DRAG_PX = 48;

const SVG_AUDIO_ON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>';
const SVG_AUDIO_OFF =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
const SVG_HAPTICS_ON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="4" width="10" height="16" rx="2"></rect><path d="M3 8v8"></path><path d="M21 8v8"></path></svg>';
const SVG_HAPTICS_OFF =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="4" width="10" height="16" rx="2"></rect><line x1="2" y1="2" x2="22" y2="22"></line></svg>';
const SVG_HOME =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5"></path><path d="M5 9.5V20h14V9.5"></path></svg>';
const SVG_BACK =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>';
const SVG_PASSPORT =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"></rect><circle cx="12" cy="11" r="3.5"></circle><line x1="8" y1="17.5" x2="16" y2="17.5"></line></svg>';

interface LiveRefs {
  audioBtn?: HTMLButtonElement;
  hapticsBtn?: HTMLButtonElement;
  titleEloMeta?: HTMLElement;
  titleBriefingMeta?: HTMLElement;
  hudScore?: HTMLElement;
  hudStreak?: HTMLElement;
  hudShields?: HTMLElement[];
  rivalPill?: HTMLElement;
  rivalScore?: HTMLElement;
  rivalStatus?: HTMLElement;
  rivalTell?: HTMLElement;
  timerText?: HTMLElement;
  chronoFill?: HTMLElement;
  facetText?: HTMLElement;
  facetDots?: HTMLElement[];
  overclockBtn?: HTMLButtonElement;
  overclockFill?: HTMLElement;
  overclockLabel?: HTMLElement;
  overclockSub?: HTMLElement;
  calibratorVal?: HTMLElement;
  calibratorMult?: HTMLElement;
  codexBadge?: HTMLElement;
  codexTopTexts?: HTMLElement[];
  codexBotTexts?: HTMLElement[];
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function formatCalibratorNumber(val: number, unit: string, range: number, step?: number): string {
  const isYear =
    /^(ce|bce|ad|bc|yr|year|years)$/i.test(unit.trim()) ||
    (unit.trim() === '' && val >= 1000 && val <= 2200 && Number.isInteger(Math.round(val)) && range >= 20);
  const useDecimal = (step !== undefined && step < 1) || range <= 25;
  if (useDecimal) {
    return val.toFixed(1);
  }
  const rounded = Math.round(val);
  if (isYear || Math.abs(rounded) < 10000) {
    return String(rounded);
  }
  return rounded.toLocaleString();
}

function formatCalibratorReadout(aq: ActiveQuestionState): string {
  const ext = aq.question.calibratorExt;
  if (!ext) {
    return `${Math.round(aq.calibratorVal)} ± ${Math.round(aq.calibratorTolerancePct * 100)}%`;
  }
  const range = Math.max(1e-6, ext.maxVal - ext.minVal);
  const unitStr = ext.unit ? ` ${ext.unit}` : '';
  const mainStr = formatCalibratorNumber(aq.calibratorVal, ext.unit, range, ext.step);

  let tolHalf: number;
  if (ext.logScale && ext.minVal > 0 && ext.maxVal > ext.minVal) {
    const ratio = Math.pow(ext.maxVal / ext.minVal, aq.calibratorTolerancePct);
    tolHalf = Math.abs(aq.calibratorVal * (ratio - 1));
  } else {
    tolHalf = range * aq.calibratorTolerancePct;
  }

  const tolStr =
    (ext.step !== undefined && ext.step < 1) || range <= 25
      ? tolHalf.toFixed(1)
      : Math.max(1, Math.round(tolHalf)).toLocaleString();

  return `${mainStr}${unitStr} ± ${tolStr}`;
}

function getCalibratorTierWord(multiplier: number): string {
  if (multiplier >= 3.0) return 'BULLSEYE';
  if (multiplier >= 2.2) return 'SHARP';
  if (multiplier >= 1.5) return 'TIGHT';
  return 'SAFE';
}

function buildRadarSvg(domainRatings: number[]): string {
  const cx = 160;
  const cy = 150;
  const maxR = 96;
  const labelR = 117;
  const rings = [
    { elo: 800, frac: 0.25, baseline: false },
    { elo: 1200, frac: 0.5, baseline: true },
    { elo: 1600, frac: 0.75, baseline: false },
    { elo: 2000, frac: 1.0, baseline: false },
  ];

  const pointAt = (index: number, radius: number): [number, number] => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 12;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  };

  const ringPolys = rings
    .map((ring) => {
      const pts = Array.from({ length: 12 }, (_, i) => {
        const [x, y] = pointAt(i, maxR * ring.frac);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');
      const stroke = ring.baseline ? 'rgba(247, 223, 156, 0.36)' : 'rgba(212, 168, 83, 0.16)';
      const dash = ring.baseline ? ' stroke-dasharray="3 3"' : '';
      return `<polygon points="${pts}" fill="none" stroke="${stroke}" stroke-width="1"${dash} />`;
    })
    .join('');

  const spokes = DOMAINS.map((_, i) => {
    const [x, y] = pointAt(i, maxR);
    return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(212, 168, 83, 0.14)" stroke-width="1" />`;
  }).join('');

  const vertices = DOMAINS.map((dom, i) => {
    const elo = domainRatings[i] ?? 1200;
    const norm = clamp((elo - 600) / 1600, 0.12, 1.0);
    const [x, y] = pointAt(i, maxR * norm);
    return { x, y, dom, elo };
  });

  const dataPolyPts = vertices.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');

  const dots = vertices
    .map(
      (v) =>
        `<circle cx="${v.x.toFixed(1)}" cy="${v.y.toFixed(1)}" r="3.4" fill="${v.dom.accentHex}" stroke="#070a10" stroke-width="1.2" />`
    )
    .join('');

  const labels = DOMAINS.map((dom, i) => {
    const [x, y] = pointAt(i, labelR);
    let anchor = 'middle';
    if (x > cx + 14) anchor = 'start';
    else if (x < cx - 14) anchor = 'end';
    const dy = y < cy - 16 ? '-2' : y > cy + 16 ? '8' : '3';
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" dy="${dy}" text-anchor="${anchor}" fill="#b7c3d8" font-family="JetBrains Mono, monospace" font-size="8.8" font-weight="600">${escapeHtml(dom.shortName)}</text>`;
  }).join('');

  return `
    <svg class="ws-radar-svg" viewBox="0 0 320 300" role="img" aria-label="12-Domain Elo Radar Chart">
      <defs>
        <radialGradient id="wsRadarFill" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="rgba(247, 223, 156, 0.42)" />
          <stop offset="100%" stop-color="rgba(212, 168, 83, 0.14)" />
        </radialGradient>
      </defs>
      ${ringPolys}
      ${spokes}
      <polygon points="${dataPolyPts}" fill="url(#wsRadarFill)" stroke="#f7df9c" stroke-width="1.8" stroke-linejoin="round" />
      ${dots}
      ${labels}
    </svg>
  `;
}

export class UIManager {
  private readonly rootEl: HTMLElement;
  private readonly actions: GameActions;

  private readonly shellEl: HTMLDivElement;
  private readonly vignetteEl: HTMLDivElement;
  private readonly toastEl: HTMLDivElement;
  private readonly stageEl: HTMLDivElement;

  private lastState: GameUIState | null = null;
  private lastStructuralKey = '';
  private lastToastMessage: string | null = null;
  private lastAudioMuted: boolean | null = null;
  private lastHapticsEnabled: boolean | null = null;

  private observatoryTab: ObservatoryTab = 'PASSPORT';
  private briefingMorphFilter: BriefingMorphFilter = 'ALL';
  private confirmResetPending = false;
  private refs: LiveRefs = {};

  // Overclock tactile pointer state (survives 60Hz ticks cleanly!)
  private holdPointerId: number | null = null;
  private holdStartX = 0;
  private holdOverclockStarted = false;
  private holdCancelled = false;
  private holdTimerId: number | null = null;
  private activeInteractionCleanup: (() => void) | null = null;

  constructor(rootEl: HTMLElement, actions: GameActions) {
    this.rootEl = rootEl;
    this.actions = actions;

    this.shellEl = document.createElement('div');
    this.shellEl.className = 'ws-shell';
    this.shellEl.dataset.lighting = 'BROADCAST';
    this.shellEl.dataset.screen = 'TITLE';

    this.vignetteEl = document.createElement('div');
    this.vignetteEl.className = 'ws-fracture-vignette';
    this.vignetteEl.setAttribute('aria-hidden', 'true');

    this.toastEl = document.createElement('div');
    this.toastEl.className = 'ws-toast';
    this.toastEl.setAttribute('aria-live', 'polite');

    this.stageEl = document.createElement('div');
    this.stageEl.className = 'ws-stage';

    this.shellEl.append(this.vignetteEl, this.toastEl, this.stageEl);
    this.rootEl.innerHTML = '';
    this.rootEl.appendChild(this.shellEl);
  }

  public render(state: GameUIState): void {
    this.lastState = state;

    if (this.shellEl.dataset.lighting !== state.lightingState) {
      this.shellEl.dataset.lighting = state.lightingState;
    }
    if (this.shellEl.dataset.screen !== state.screen) {
      this.shellEl.dataset.screen = state.screen;
    }

    if (state.screen !== 'PASSPORT_OBSERVATORY' && this.confirmResetPending) {
      this.confirmResetPending = false;
    }

    this.patchToast(state.toastMessage);

    const structuralKey = this.computeStructuralKey(state);
    if (structuralKey !== this.lastStructuralKey) {
      this.cleanupActiveInteractions();
      this.lastStructuralKey = structuralKey;
      this.lastAudioMuted = null;
      this.lastHapticsEnabled = null;
      this.refs = {};
      this.rebuildStage(state);
    }

    this.patchLiveRefs(state);
  }

  public dispose(): void {
    this.cleanupActiveInteractions();
    this.refs = {};
    this.lastState = null;
    this.lastStructuralKey = '';
    this.rootEl.innerHTML = '';
  }

  private rerenderCurrent(): void {
    if (this.lastState) {
      this.render(this.lastState);
    }
  }

  private patchToast(message: string | null): void {
    if (message === this.lastToastMessage) return;
    this.lastToastMessage = message;
    if (message) {
      this.toastEl.textContent = message;
      this.toastEl.classList.add('is-visible');
    } else {
      this.toastEl.classList.remove('is-visible');
    }
  }

  private computeStructuralKey(state: GameUIState): string {
    switch (state.screen) {
      case 'TITLE': {
        const s = state.story;
        return [
          'TITLE',
          s.prologueComplete ? 1 : 0,
          s.currentAct,
          s.completedCampaignNodes.length,
          s.unlockedRelics.length,
          s.dailyCompletedDate ?? '',
          s.dailyBestScore,
          s.endlessBestFloor,
          s.trialsWins ?? 0,
          s.salonTrophies ?? 0,
          s.pledgedFaction ?? '',
        ].join('|');
      }
      case 'DIALOGUE': {
        const d = state.dialogue;
        if (!d) return 'DIALOGUE|NONE';
        const choicesKey = (d.choices ?? []).map((c) => c.id).join(',');
        return `DIALOGUE|${d.sceneTitle}|${d.locationLabel}|${d.speakerId}|${d.speakerName}|${d.speakerRole}|${d.text}|${d.tellHint ?? ''}|${d.beatProgress ?? ''}|${d.accentTone ?? ''}|${choicesKey}`;
      }
      case 'WORLD_GLOBE': {
        const nodesKey = state.campaignNodes
          .map((n) => `${n.id}:${n.status}:${n.isBlackSalon ? 1 : 0}`)
          .join(',');
        return `WORLD_GLOBE|${state.selectedGlobeCountry}|${state.story.blackSalonUnlocked ? 1 : 0}|${nodesKey}`;
      }
      case 'ACTIVE_MATCH': {
        const aq = state.activeQuestion;
        if (!aq) return `ACTIVE_MATCH|NONE|${state.venueTitle}`;
        const facetsKey = aq.facets
          .map(
            (f) =>
              `${f.index}:${f.shattered ? 1 : 0}:${f.redacted ? 1 : 0}:${f.stressFracture ? 1 : 0}:${f.text}`
          )
          .join('|');
        const intKey = aq.ethicalInterrupt
          ? `${aq.ethicalInterrupt.speaker}:${aq.ethicalInterrupt.message}:${aq.ethicalInterrupt.choices.map((c) => c.id).join(',')}`
          : '';
        return [
          'ACTIVE_MATCH',
          aq.question.qid,
          aq.question.archetype,
          aq.questionNumber,
          aq.totalQuestions,
          aq.peelTier,
          aq.peelLocked ? 1 : 0,
          aq.peelLockReason ?? '',
          aq.canRedactionPerk ? 1 : 0,
          aq.revealedClues.join('~'),
          aq.activeModifiers.join(','),
          aq.tutorialHint ?? '',
          facetsKey,
          intKey,
          state.rival?.id ?? 'none',
          state.rival?.name ?? '',
          state.maxShields,
          state.venueTitle,
        ].join('::');
      }
      case 'INTEL_FLASH': {
        const r = state.lastResolution;
        if (!r) return 'INTEL_FLASH|NONE';
        const bookmarked = state.story.bookmarks.some((b) => b.qid === r.qid) ? 1 : 0;
        return `INTEL_FLASH|${r.qid}|${r.totalPoints}|${r.correct ? 1 : 0}|${r.bullseye ? 1 : 0}|${r.overclocked ? 1 : 0}|${r.backfired ? 1 : 0}|${bookmarked}|${state.maxShields}|${state.rival?.id ?? ''}|${state.rival?.name ?? ''}`;
      }
      case 'ENDLESS_AIRLOCK': {
        const cp = state.endlessCheckpoint;
        if (!cp) return 'ENDLESS_AIRLOCK|NONE';
        return `ENDLESS_AIRLOCK|${cp.floor}|${cp.strataName}|${cp.bankedScore}|${cp.unbankedScore}|${cp.shields}|${cp.maxShields}`;
      }
      case 'MATCH_SUMMARY': {
        const ms = state.matchSummary;
        if (!ms) return 'MATCH_SUMMARY|NONE';
        return `MATCH_SUMMARY|${ms.mode}|${ms.title}|${ms.won ? 1 : 0}|${ms.playerScore}|${ms.rivalScore ?? ''}|${ms.unlockedRelic ?? ''}|${ms.unlockedPerk?.id ?? ''}|${ms.personaAwarded ?? ''}|${state.endingAwarded ?? ''}`;
      }
      case 'BRIEFING_PICKER': {
        return `BRIEFING_PICKER|${this.briefingMorphFilter}|${Math.round(state.globalElo)}|${state.domainRatings.map((r) => Math.round(r)).join(',')}`;
      }
      case 'PASSPORT_OBSERVATORY': {
        const s = state.story;
        return [
          'PASSPORT_OBSERVATORY',
          this.observatoryTab,
          state.observatoryRelic,
          this.confirmResetPending ? 1 : 0,
          s.persona ?? '',
          s.origin ?? '',
          s.axisIntegrity,
          s.publicTrust,
          s.councilFavor,
          `${s.bonds.nadia},${s.bonds.teo},${s.bonds.lindqvist},${s.bonds.soren}`,
          s.activePerks.join(','),
          s.unlockedPerks.join(','),
          s.unlockedRelics.join(','),
          (s.unlockedSkins ?? []).join(','),
          s.activeSkin ?? 'OBSIDIAN_BRASS',
          (s.achievedEndings ?? []).join(','),
          s.bookmarks.length,
          Math.round(state.globalElo),
          state.domainRatings.map((r) => Math.round(r)).join(','),
        ].join('::');
      }
      case 'TRIALS_HUB': {
        const hub = state.trialsHub;
        const s = state.story;
        const standings = hub
          ? `${hub.factionStandings.SOVEREIGN},${hub.factionStandings.HORIZON},${hub.factionStandings.AGORA}`
          : 'fallback';
        const ghostsKey = hub
          ? hub.ghostContenders.map((g) => `${g.id}:${g.elo}`).join(',')
          : 'default';
        return [
          'TRIALS_HUB',
          hub?.pledgedFaction ?? s.pledgedFaction ?? 'NONE',
          standings,
          hub?.salonRound ?? 0,
          hub?.salonModifier ?? '',
          hub?.salonEliminated ? 1 : 0,
          ghostsKey,
          s.trialsWins ?? 0,
          s.salonTrophies ?? 0,
          Math.round(state.globalElo),
        ].join('::');
      }
    }
  }

  private cleanupActiveInteractions(): void {
    if (this.holdTimerId !== null) {
      window.clearTimeout(this.holdTimerId);
      this.holdTimerId = null;
    }
    this.holdPointerId = null;
    this.holdOverclockStarted = false;
    this.holdCancelled = false;
    if (this.activeInteractionCleanup) {
      this.activeInteractionCleanup();
      this.activeInteractionCleanup = null;
    }
  }

  private rebuildStage(state: GameUIState): void {
    switch (state.screen) {
      case 'TITLE':
        this.buildTitleScreen(state);
        break;
      case 'DIALOGUE':
        this.buildDialogueScreen(state);
        break;
      case 'WORLD_GLOBE':
        this.buildWorldGlobeScreen(state);
        break;
      case 'ACTIVE_MATCH':
        this.buildActiveMatchScreen(state);
        break;
      case 'INTEL_FLASH':
        this.buildIntelFlashScreen(state);
        break;
      case 'ENDLESS_AIRLOCK':
        this.buildEndlessAirlockScreen(state);
        break;
      case 'MATCH_SUMMARY':
        this.buildMatchSummaryScreen(state);
        break;
      case 'BRIEFING_PICKER':
        this.buildBriefingPickerScreen(state);
        break;
      case 'PASSPORT_OBSERVATORY':
        this.buildPassportObservatoryScreen(state);
        break;
      case 'TRIALS_HUB':
        this.buildTrialsHubScreen(state);
        break;
    }
  }

  private renderUtilityButtonsHtml(includeHome: boolean, includePassport = false): string {
    return `
      <div class="ws-icon-group">
        ${
          includePassport
            ? `<button type="button" class="ws-icon-btn" data-action="passport" aria-label="Passport & Observatory" title="Passport & 3D Observatory">${SVG_PASSPORT}</button>`
            : ''
        }
        <button type="button" class="ws-icon-btn" data-ref="audioBtn" aria-label="Toggle Audio" title="Toggle Audio">${SVG_AUDIO_ON}</button>
        <button type="button" class="ws-icon-btn" data-ref="hapticsBtn" aria-label="Toggle Haptics" title="Toggle Haptics">${SVG_HAPTICS_ON}</button>
        ${
          includeHome
            ? `<button type="button" class="ws-icon-btn" data-action="home" aria-label="Return to Title" title="Return to Title">${SVG_HOME}</button>`
            : ''
        }
      </div>
    `;
  }

  private bindCommonUtilityButtons(container: HTMLElement): void {
    const audioBtn = container.querySelector<HTMLButtonElement>('[data-ref="audioBtn"]');
    if (audioBtn) {
      this.refs.audioBtn = audioBtn;
      audioBtn.addEventListener('click', () => this.actions.toggleMute());
    }

    const hapticsBtn = container.querySelector<HTMLButtonElement>('[data-ref="hapticsBtn"]');
    if (hapticsBtn) {
      this.refs.hapticsBtn = hapticsBtn;
      hapticsBtn.addEventListener('click', () => this.actions.toggleHaptics());
    }

    const homeBtn = container.querySelector<HTMLButtonElement>('[data-action="home"]');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => this.actions.goToTitle());
    }

    const passportBtn = container.querySelector<HTMLButtonElement>('[data-action="passport"]');
    if (passportBtn) {
      passportBtn.addEventListener('click', () => this.actions.openPassportObservatory());
    }
  }

  // --------------------------------------------------------------------------
  // 1. TITLE SCREEN (Top Passport Pill + Open 3D Prism + 1 Gold CTA + 2×2 Grid)
  // --------------------------------------------------------------------------
  private buildTitleScreen(state: GameUIState): void {
    const s = state.story;
    const hasProgress = s.prologueComplete || s.completedCampaignNodes.length > 0;
    const ctaTitle = hasProgress ? 'CONTINUE MERIDIAN CIRCUIT' : 'BEGIN MERIDIAN CIRCUIT';
    const ctaSub = hasProgress
      ? `Act ${Math.max(1, s.currentAct)} · ${s.completedCampaignNodes.length}/8 Global Venues Cleared`
      : 'Prologue · The Geneva Summons';

    const todayUtc = new Date().toISOString().slice(0, 10);
    const dailyDone = s.dailyCompletedDate === todayUtc;
    const dailyKickerClass = dailyDone ? 'is-emerald' : 'is-cyan';
    const dailyKicker = dailyDone ? 'COMPLETED' : 'LIVE FEED';
    const dailyMeta = dailyDone ? `BEST · ${s.dailyBestScore.toLocaleString()}` : '7Q GLOBAL SEED';

    const endlessMeta =
      s.endlessBestFloor > 0
        ? `BEST FL.${s.endlessBestFloor} · ${s.endlessBestScore.toLocaleString()}`
        : '3 SHIELDS · ROGUELITE';

    const trialsWins = s.trialsWins ?? 0;
    const salonTrophies = s.salonTrophies ?? 0;
    const trialsMeta =
      trialsWins > 0 || salonTrophies > 0
        ? `${trialsWins}W · ${salonTrophies} SALON TROPH${salonTrophies === 1 ? 'Y' : 'IES'}`
        : 'GHOST DUELS · 16P SALON';

    this.stageEl.innerHTML = `
      <div class="ws-screen-title">
        <div class="ws-title-top">
          <div class="ws-title-utils">
            <button type="button" class="ws-passport-pill" data-action="observatory" aria-label="Open Passport and 3D Observatory">
              <span class="ws-passport-pill-icon">${SVG_PASSPORT}</span>
              <span class="ws-passport-pill-body">
                <span class="ws-passport-pill-label">PASSPORT &amp; VAULT</span>
                <span class="ws-passport-pill-meta" data-ref="titleEloMeta">ELO ${Math.round(state.globalElo)} &middot; ${s.unlockedRelics.length}/8</span>
              </span>
            </button>
            ${this.renderUtilityButtonsHtml(false)}
          </div>
          <div class="ws-title-eyebrow">THE MERIDIAN</div>
          <h1 class="ws-title-logo">WORLD&rsquo;S SMARTEST</h1>
          <div class="ws-title-tagline">SPIN &middot; PEEL &middot; OVERCLOCK</div>
        </div>

        <div class="ws-spacer ws-title-spacer" aria-hidden="true"></div>

        <div class="ws-title-deck">
          <button type="button" class="ws-btn-gold" data-action="campaign">
            <span>${escapeHtml(ctaTitle)}</span>
            <span class="ws-btn-gold-sub">${escapeHtml(ctaSub)}</span>
          </button>

          <div class="ws-title-grid">
            <button type="button" class="ws-mode-card" data-action="daily">
              <div class="ws-mode-card-kicker ${dailyKickerClass}">
                <span>${dailyKicker}</span>
                <span>UTC</span>
              </div>
              <div class="ws-mode-card-title">Daily: Global Feed</div>
              <div class="ws-mode-card-meta">${escapeHtml(dailyMeta)}</div>
            </button>

            <button type="button" class="ws-mode-card" data-action="briefing">
              <div class="ws-mode-card-kicker">
                <span>QUICK PLAY</span>
                <span>4 MORPHS</span>
              </div>
              <div class="ws-mode-card-title">Briefing Room</div>
              <div class="ws-mode-card-meta" data-ref="titleBriefingMeta">12 DOMAINS &middot; ELO ${Math.round(state.globalElo)}</div>
            </button>

            <button type="button" class="ws-mode-card" data-action="endless">
              <div class="ws-mode-card-kicker is-cyan">
                <span>THE LEDGER</span>
                <span>ENDLESS</span>
              </div>
              <div class="ws-mode-card-title">Archive Descent</div>
              <div class="ws-mode-card-meta">${escapeHtml(endlessMeta)}</div>
            </button>

            <button type="button" class="ws-mode-card is-trials-prestige" data-action="trials">
              <div class="ws-mode-card-kicker is-crimson">
                <span>FACTION WAR</span>
                <span>SALON</span>
              </div>
              <div class="ws-mode-card-title">World Council Trials</div>
              <div class="ws-mode-card-meta">${escapeHtml(trialsMeta)}</div>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindCommonUtilityButtons(this.stageEl);
    this.refs.titleEloMeta = this.stageEl.querySelector<HTMLElement>('[data-ref="titleEloMeta"]') ?? undefined;
    this.refs.titleBriefingMeta =
      this.stageEl.querySelector<HTMLElement>('[data-ref="titleBriefingMeta"]') ?? undefined;

    this.stageEl
      .querySelector('[data-action="campaign"]')
      ?.addEventListener('click', () => this.actions.startOrContinueCampaign());
    this.stageEl
      .querySelector('[data-action="daily"]')
      ?.addEventListener('click', () => this.actions.startDailyFeed());
    this.stageEl
      .querySelector('[data-action="briefing"]')
      ?.addEventListener('click', () => this.actions.openBriefingRoom());
    this.stageEl
      .querySelector('[data-action="endless"]')
      ?.addEventListener('click', () => this.actions.startEndlessDescent());
    this.stageEl
      .querySelector('[data-action="trials"]')
      ?.addEventListener('click', () => this.actions.openTrialsHub?.());
    this.stageEl
      .querySelector('[data-action="observatory"]')
      ?.addEventListener('click', () => this.actions.openPassportObservatory());
  }

  // --------------------------------------------------------------------------
  // 2. DIALOGUE CINEMA DRAWER (Fortiche/Arcane 60×76 Chamfered Portrait!)
  // --------------------------------------------------------------------------
  private buildDialogueScreen(state: GameUIState): void {
    const d: DialogueDisplay = state.dialogue ?? {
      sceneTitle: 'THE MERIDIAN',
      locationLabel: state.venueTitle,
      speakerId: 'vance',
      speakerName: 'Julian Vance',
      speakerRole: 'Chief Moderator',
      text: 'Connecting to broadcast feed...',
    };

    const tone = d.accentTone ?? 'gold';
    const hasChoices = Boolean(d.choices && d.choices.length > 0);
    const portraitSrc = getPortraitSrc(d.speakerId);

    const portraitHtml = portraitSrc
      ? `
        <div class="ws-portrait-medallion" data-tone="${escapeHtml(tone)}">
          <div class="ws-portrait-medallion-inner">
            <img
              class="ws-portrait-img"
              src="${escapeHtml(portraitSrc)}"
              alt="${escapeHtml(d.speakerName)}"
              decoding="async"
            />
            <span class="ws-portrait-sheen" aria-hidden="true"></span>
          </div>
        </div>
      `
      : '';

    const choicesHtml = hasChoices
      ? `<div class="ws-choices-stack">
          ${d.choices!
            .map(
              (c) => `
              <button type="button" class="ws-choice-card" data-choice-id="${escapeHtml(c.id)}">
                <div class="ws-choice-head">
                  <span class="ws-choice-label">${escapeHtml(c.label)}</span>
                  ${
                    c.tag
                      ? `<span class="ws-tag-pill" data-tone="${escapeHtml(c.tagTone ?? 'neutral')}">${escapeHtml(c.tag)}</span>`
                      : ''
                  }
                </div>
                <span class="ws-choice-subtext">${escapeHtml(c.subtext)}</span>
              </button>
            `
            )
            .join('')}
        </div>`
      : `<button type="button" class="ws-btn-gold" data-action="continue">
          <span>${escapeHtml(d.continueLabel ?? 'CONTINUE')}</span>
        </button>`;

    this.stageEl.innerHTML = `
      <div class="ws-screen-dialogue">
        <div class="ws-dialogue-top">
          <div class="ws-location-pill" data-tone="${escapeHtml(tone)}">
            <span class="ws-location-dot"></span>
            <span class="ws-location-text">${escapeHtml(d.locationLabel)}</span>
            ${d.beatProgress ? `<span class="ws-beat-badge">${escapeHtml(d.beatProgress)}</span>` : ''}
          </div>
          ${this.renderUtilityButtonsHtml(true)}
        </div>

        <div class="ws-spacer" aria-hidden="true"></div>

        <div class="ws-glass-strong ws-dialogue-drawer" data-tone="${escapeHtml(tone)}">
          <div class="ws-dialogue-header-flex">
            ${portraitHtml}
            <div class="ws-speaker-meta-col">
              <div class="ws-speaker-top-line">
                <span class="ws-speaker-name">${escapeHtml(d.speakerName)}</span>
                <span class="ws-scene-tag">${escapeHtml(d.sceneTitle)}</span>
              </div>
              <div class="ws-speaker-role">${escapeHtml(d.speakerRole)}</div>
              <div class="ws-speaker-loc">
                <span class="ws-speaker-loc-dot"></span>
                <span>${escapeHtml(d.locationLabel)}</span>
              </div>
            </div>
          </div>

          <p class="ws-dialogue-copy">${escapeHtml(d.text)}</p>

          ${
            d.tellHint
              ? `<div class="ws-tell-cue"><span>&#9670;</span><span>${escapeHtml(d.tellHint)}</span></div>`
              : ''
          }

          ${choicesHtml}
        </div>
      </div>
    `;

    this.bindCommonUtilityButtons(this.stageEl);

    if (hasChoices) {
      this.stageEl.querySelectorAll<HTMLButtonElement>('[data-choice-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.choiceId;
          if (id) this.actions.chooseDialogueOption(id);
        });
      });
    } else {
      this.stageEl
        .querySelector('[data-action="continue"]')
        ?.addEventListener('click', () => this.actions.advanceDialogue());
    }
  }

  // --------------------------------------------------------------------------
  // 3. WORLD GLOBE SCREEN (All 8 Playable Global Destinations incl. GLOBAL!)
  // --------------------------------------------------------------------------
  private buildWorldGlobeScreen(state: GameUIState): void {
    const selectedCountry = state.selectedGlobeCountry;
    const countryNodes = state.campaignNodes.filter((n) => n.country === selectedCountry);
    const primaryNode =
      countryNodes.find((n) => !n.isBlackSalon) ?? countryNodes[0] ?? FALLBACK_NODES[selectedCountry];
    const blackSalonNode = countryNodes.find(
      (n) => n.isBlackSalon && (n.status === 'AVAILABLE' || n.status === 'COMPLETED')
    );

    const countryStripHtml = GLOBE_COUNTRIES.map((code) => {
      const nodesForCode = state.campaignNodes.filter((n) => n.country === code);
      const mainNode = nodesForCode.find((n) => !n.isBlackSalon) ?? nodesForCode[0] ?? FALLBACK_NODES[code];
      const hasOpenSalon = nodesForCode.some(
        (n) => n.isBlackSalon && (n.status === 'AVAILABLE' || n.status === 'COMPLETED')
      );
      const isSelected = code === selectedCountry;
      const isComingSoon = mainNode.status === 'COMING_SOON';
      const isGlobal = code === 'GLOBAL';
      const dotClass =
        mainNode.status === 'COMPLETED'
          ? 'is-completed'
          : mainNode.status === 'AVAILABLE'
            ? 'is-available'
            : '';

      return `
        <button
          type="button"
          class="ws-country-chip${isSelected ? ' is-selected' : ''}${isComingSoon ? ' is-coming-soon' : ''}${isGlobal ? ' is-global-apex' : ''}"
          data-country="${code}"
          aria-label="${escapeHtml(GLOBE_SHORT_CITY[code])} (${code})"
        >
          <span class="ws-country-code-row">
            <span class="ws-country-code">${code}</span>
            <span class="ws-country-dot ${dotClass}"></span>
          </span>
          <span class="ws-country-city-mini">${escapeHtml(GLOBE_SHORT_CITY[code])}</span>
          ${hasOpenSalon ? '<span class="ws-country-dot is-salon" title="Black Salon Unlocked"></span>' : ''}
        </button>
      `;
    }).join('');

    let departHtml = '';
    if (primaryNode.status === 'AVAILABLE' || primaryNode.status === 'COMPLETED') {
      const label =
        primaryNode.status === 'COMPLETED'
          ? `REPLAY ${primaryNode.city.toUpperCase()}`
          : primaryNode.country === 'GLOBAL'
            ? 'ENTER GRAND FINALE'
            : `DEPART FOR ${primaryNode.city.toUpperCase()}`;
      departHtml = `
        <button type="button" class="ws-btn-gold" data-launch-node="${escapeHtml(primaryNode.id)}">
          <span>${escapeHtml(label)}</span>
          <span class="ws-btn-gold-sub">${escapeHtml(primaryNode.venueName)}</span>
        </button>
      `;
    } else if (primaryNode.status === 'LOCKED') {
      departHtml = `
        <button type="button" class="ws-btn-gold" disabled>
          <span>CLEARANCE LOCKED</span>
          <span class="ws-btn-gold-sub">Complete prior Meridian stage to unlock</span>
        </button>
      `;
    } else {
      departHtml = `
        <button type="button" class="ws-btn-gold" disabled>
          <span>CLASSIFIED ROUTE</span>
          <span class="ws-btn-gold-sub">Dossier decrypts as the Meridian Circuit unfolds</span>
        </button>
      `;
    }

    const blackSalonHtml = blackSalonNode
      ? `
        <button type="button" class="ws-salon-chip" data-launch-node="${escapeHtml(blackSalonNode.id)}">
          <div>
            <div class="ws-salon-chip-title">&#9670; BLACK SALON UNLOCKED</div>
            <div class="ws-salon-chip-sub">${escapeHtml(blackSalonNode.venueName)} &middot; 2&times; Stakes &middot; Off-Grid</div>
          </div>
          <span class="ws-tag-pill" data-tone="crimson">${blackSalonNode.status === 'COMPLETED' ? 'REPLAY' : 'ENTER'}</span>
        </button>
      `
      : '';

    this.stageEl.innerHTML = `
      <div class="ws-screen-globe">
        <div class="ws-top-bar">
          <div class="ws-top-title-block">
            <span class="ws-eyebrow">MERIDIAN CIRCUIT &middot; 8 VENUES</span>
            <h2 class="ws-top-title">GLOBAL FLIGHT MAP</h2>
          </div>
          ${this.renderUtilityButtonsHtml(true, true)}
        </div>

        <div class="ws-whisper-pill">DRAG GLOBE TO ORBIT &middot; TAP BEACON OR SELECT ROUTE</div>

        <div class="ws-spacer" aria-hidden="true"></div>

        <div class="ws-glass-strong ws-boarding-pass">
          <div class="ws-country-strip">${countryStripHtml}</div>

          <div class="ws-boarding-header">
            <div>
              <div class="ws-boarding-city">${escapeHtml(primaryNode.city)} &middot; ${primaryNode.country}</div>
              <div class="ws-boarding-venue">${escapeHtml(primaryNode.venueName)}</div>
            </div>
            <span class="ws-tag-pill" data-tone="${primaryNode.status === 'COMPLETED' ? 'cyan' : primaryNode.country === 'GLOBAL' ? 'crimson' : 'gold'}">
              ${escapeHtml(primaryNode.factionLabel)}
            </span>
          </div>

          <p class="ws-boarding-sub">${escapeHtml(primaryNode.subtitle)}</p>

          ${blackSalonHtml}
          ${departHtml}
        </div>
      </div>
    `;

    this.bindCommonUtilityButtons(this.stageEl);

    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-country]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const c = btn.dataset.country as GlobeCountryCode | undefined;
        if (c) this.actions.selectGlobeCountry(c);
      });
    });

    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-launch-node]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nodeId = btn.dataset.launchNode;
        if (nodeId) this.actions.launchCampaignNode(nodeId);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 4. ACTIVE MATCH SCREEN (Strict 3-Zone Veritas Prism Arena + Rival Portrait!)
  // --------------------------------------------------------------------------
  private buildActiveMatchScreen(state: GameUIState): void {
    const aq = state.activeQuestion;
    if (!aq) {
      this.stageEl.innerHTML = `
        <div class="ws-screen-match">
          <div class="ws-hud-bar">
            <span class="ws-eyebrow">${escapeHtml(state.venueTitle)}</span>
            ${this.renderUtilityButtonsHtml(true)}
          </div>
        </div>
      `;
      this.bindCommonUtilityButtons(this.stageEl);
      return;
    }

    const domain = getDomainMeta(aq.question.l0Domain);
    const qLabel =
      aq.totalQuestions > 0 ? `Q${aq.questionNumber}/${aq.totalQuestions}` : `FL.${aq.questionNumber}`;
    const tierMultLabel = aq.peelTier === 1 ? '3.0×' : aq.peelTier === 2 ? '2.0×' : '1.2×';

    const shieldsHtml =
      state.maxShields > 0
        ? `<div class="ws-shields" aria-label="Prism Shields">
            ${Array.from({ length: state.maxShields }, (_, i) => `<span class="ws-shield-diamond" data-shield-idx="${i}"></span>`).join('')}
          </div>`
        : '';

    const rivalPortraitSrc = state.rival ? getPortraitSrc(state.rival.id) : null;
    const rivalAvatarHtml = rivalPortraitSrc
      ? `
        <div class="ws-rival-avatar-ring">
          <img
            class="ws-rival-avatar-img"
            src="${escapeHtml(rivalPortraitSrc)}"
            alt="${escapeHtml(state.rival!.name)}"
            decoding="async"
          />
        </div>
      `
      : '<span class="ws-rival-dot"></span>';

    const rivalHtml = state.rival
      ? `
        <div class="ws-rival-strip">
          <div class="ws-rival-pill" data-ref="rivalPill" data-status="${escapeHtml(state.rival.status)}">
            <div class="ws-rival-id">
              ${rivalAvatarHtml}
              <div class="ws-rival-text-stack">
                <span class="ws-rival-name">${escapeHtml(state.rival.name)}</span>
                <span class="ws-rival-score ws-mono" data-ref="rivalScore">${state.rival.score.toLocaleString()}</span>
              </div>
            </div>
            <span class="ws-rival-status" data-ref="rivalStatus">${escapeHtml(state.rival.status)}</span>
          </div>
          <div class="ws-rival-tell${state.rival.tellMessage ? '' : ' is-empty'}" data-ref="rivalTell">
            ${escapeHtml(state.rival.tellMessage ?? '')}
          </div>
        </div>
      `
      : '';

    const modifiersHtml =
      aq.activeModifiers.length > 0
        ? `<div class="ws-modifier-row">
            ${aq.activeModifiers.map((m) => `<span class="ws-modifier-chip">${escapeHtml(m)}</span>`).join('')}
          </div>`
        : '';

    const cluesHtml =
      aq.revealedClues.length > 0
        ? `<div class="ws-clue-banner">
            ${aq.revealedClues
              .map(
                (clue, idx) => `
                <div class="ws-clue-item${idx >= 1 ? ' is-t3' : ''}">
                  <span class="ws-clue-tag">T${idx + 2} CLUE</span>
                  <span>${escapeHtml(clue)}</span>
                </div>
              `
              )
              .join('')}
          </div>`
        : '';

    const tutorialHtml = aq.tutorialHint
      ? `<div class="ws-tutorial-whisper">${escapeHtml(aq.tutorialHint)}</div>`
      : '';

    const archetypeDeckHtml = this.buildArchetypeControlsHtml(aq);
    const interruptHtml = aq.ethicalInterrupt ? this.buildEthicalInterruptHtml(aq) : '';

    this.stageEl.innerHTML = `
      <div class="ws-screen-match">
        <div class="ws-match-top">
          <div class="ws-hud-bar">
            <div class="ws-hud-left">
              <div class="ws-hud-venue-row">
                <span class="ws-hud-venue">${escapeHtml(state.venueTitle)}</span>
                <span class="ws-hud-qnum">${escapeHtml(qLabel)}</span>
              </div>
              <div class="ws-hud-stats-row">
                <span class="ws-hud-score ws-mono" data-ref="hudScore">${state.playerScore.toLocaleString()}</span>
                <span class="ws-hud-streak${state.streak < 2 ? ' is-cold' : ''}${state.streak >= 3 ? ' is-hot-streak' : ''}" data-ref="hudStreak">${state.streak}&times; STREAK</span>
                ${shieldsHtml}
              </div>
            </div>
            ${this.renderUtilityButtonsHtml(true)}
          </div>

          ${rivalHtml}
          ${modifiersHtml}
          ${cluesHtml}
          ${tutorialHtml}
        </div>

        <div class="ws-spotlight-zone" aria-hidden="true"></div>

        <div class="ws-match-deck">
          <div class="ws-prompt-card">
            <div class="ws-prompt-meta">
              <div class="ws-domain-badge">
                <span class="ws-domain-swatch" style="background:${escapeHtml(domain.accentHex)};box-shadow:0 0 8px ${escapeHtml(domain.accentHex)};"></span>
                <span class="ws-domain-cat">${escapeHtml(domain.shortName)} &middot; ${escapeHtml(aq.question.l1Category)}</span>
              </div>
              <div class="ws-prompt-right">
                <span class="ws-tier-pill">T${aq.peelTier} &middot; ${tierMultLabel}</span>
                <span class="ws-timer-text ws-mono" data-ref="timerText">${Math.max(0, aq.timeRemainingSec).toFixed(1)}s</span>
              </div>
            </div>
            <p class="ws-prompt-text">${escapeHtml(aq.question.prompt)}</p>
            <div class="ws-chrono-track">
              <div class="ws-chrono-fill" data-ref="chronoFill"></div>
            </div>
          </div>

          ${archetypeDeckHtml}
        </div>

        ${interruptHtml}
      </div>
    `;

    this.bindCommonUtilityButtons(this.stageEl);
    this.cacheAndBindActiveMatch(aq);
  }

  private buildArchetypeControlsHtml(aq: ActiveQuestionState): string {
    const archetype = aq.question.archetype;

    if (archetype === 'CALIBRATOR_DIAL') {
      return `
        <div class="ws-calibrator-card">
          <div class="ws-calibrator-readout-row">
            <span class="ws-calibrator-val ws-mono" data-ref="calibratorVal">${escapeHtml(formatCalibratorReadout(aq))}</span>
            <span class="ws-calibrator-mult" data-ref="calibratorMult">${aq.calibratorMultiplier.toFixed(1)}&times; ${getCalibratorTierWord(aq.calibratorMultiplier)}</span>
          </div>
          <div class="ws-calibrator-controls">
            <div class="ws-stepper-group">
              <button type="button" class="ws-stepper-btn" data-cal-pos="-1" aria-label="Aim Left">&#9664;</button>
              <span class="ws-stepper-label">NEEDLE</span>
              <button type="button" class="ws-stepper-btn" data-cal-pos="1" aria-label="Aim Right">&#9654;</button>
            </div>
            <div class="ws-stepper-group">
              <button type="button" class="ws-stepper-btn" data-cal-tol="-1" aria-label="Tighten Tolerance Cone">&minus;</button>
              <span class="ws-stepper-label">CONE</span>
              <button type="button" class="ws-stepper-btn" data-cal-tol="1" aria-label="Widen Tolerance Cone">+</button>
            </div>
          </div>
        </div>
        ${this.buildOverclockBarHtml()}
      `;
    }

    if (archetype === 'CODEX_DUAL_RING') {
      const pairsCount = Math.max(3, aq.codexOrderTop.length);
      const rowsHtml = Array.from({ length: Math.min(3, pairsCount) }, (_, i) => {
        const topTxt = aq.codexOrderTop[i] ?? '—';
        const botTxt = aq.codexOrderBottom[i] ?? '—';
        return `
          <div class="ws-codex-pair-row">
            <span class="ws-codex-top-txt" data-codex-top="${i}">${escapeHtml(topTxt)}</span>
            <span class="ws-codex-link">&harr;</span>
            <span class="ws-codex-bot-txt" data-codex-bot="${i}">${escapeHtml(botTxt)}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="ws-codex-card">
          <div class="ws-codex-head">
            <span class="ws-eyebrow">CODEX DUAL-RING</span>
            <span class="ws-codex-badge" data-ref="codexBadge">${aq.codexAlignedCount} / 3 ALIGNED</span>
          </div>
          <div class="ws-codex-pairs">${rowsHtml}</div>
          <div class="ws-calibrator-controls">
            <div class="ws-stepper-group">
              <button type="button" class="ws-stepper-btn" data-codex-spin="TOP:-1" aria-label="Spin Upper Ring Left">&#9664;</button>
              <span class="ws-stepper-label">UPPER</span>
              <button type="button" class="ws-stepper-btn" data-codex-spin="TOP:1" aria-label="Spin Upper Ring Right">&#9654;</button>
            </div>
            <div class="ws-stepper-group">
              <button type="button" class="ws-stepper-btn" data-codex-spin="BOTTOM:-1" aria-label="Spin Lower Ring Left">&#9664;</button>
              <span class="ws-stepper-label">LOWER</span>
              <button type="button" class="ws-stepper-btn" data-codex-spin="BOTTOM:1" aria-label="Spin Lower Ring Right">&#9654;</button>
            </div>
          </div>
        </div>
        <button type="button" class="ws-btn-gold" data-action="commitCodex">
          <span>LOCK ALIGNMENT</span>
        </button>
      `;
    }

    if (archetype === 'GAUNTLET_SHATTER') {
      return `
        <div class="ws-gauntlet-deck">
          <div class="ws-gauntlet-hint">SWIPE VERITAS PLATE OR TAP VERDICT</div>
          <div class="ws-gauntlet-row">
            <button type="button" class="ws-gauntlet-btn is-false" data-gauntlet="FALSE">
              <span>&#9664; FALSE</span>
            </button>
            <button type="button" class="ws-gauntlet-btn is-challenge" data-gauntlet="CHALLENGE">
              <span>&#9650; CHALLENGE 2&times;</span>
            </button>
            <button type="button" class="ws-gauntlet-btn is-true" data-gauntlet="TRUE">
              <span>TRUE &#9654;</span>
            </button>
          </div>
        </div>
      `;
    }

    // Default: SIGHTLINE_LOCK & HERO_ARTIFACT_SYNTHESIS
    const dotsHtml = aq.facets
      .map((f) => {
        const cls = [
          'ws-facet-dot',
          f.shattered ? 'is-shattered' : '',
          f.redacted ? 'is-redacted' : '',
          f.stressFracture ? 'is-fracture' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return `<span class="${cls}" data-facet-dot="${f.index}"></span>`;
      })
      .join('');

    let peelButtonHtml = '';
    if (aq.peelLocked) {
      const reason = aq.peelLockReason || 'ANALOG STATIC — PEEL JAMMED';
      peelButtonHtml = `<button type="button" class="ws-peel-btn is-locked" disabled>${escapeHtml(reason)}</button>`;
    } else if (aq.peelTier === 1) {
      peelButtonHtml = `<button type="button" class="ws-peel-btn" data-action="peel">&#9660; PEEL T2 &middot; 2.0&times;</button>`;
    } else if (aq.peelTier === 2) {
      peelButtonHtml = `<button type="button" class="ws-peel-btn" data-action="peel">&#9660; PEEL T3 &middot; 1.2&times;</button>`;
    } else {
      peelButtonHtml = `<button type="button" class="ws-peel-btn" disabled>MAX PEEL &middot; T3</button>`;
    }

    const redactButtonHtml = aq.canRedactionPerk
      ? `<button type="button" class="ws-redact-btn" data-action="redact">REDACT</button>`
      : '';

    return `
      <div class="ws-facet-bar">
        <button type="button" class="ws-nudge-btn" data-step="-1" aria-label="Previous Facet">&#9664;</button>
        <div class="ws-facet-readout">
          <div class="ws-facet-text" data-ref="facetText">—</div>
          <div class="ws-facet-dots">${dotsHtml}</div>
        </div>
        <button type="button" class="ws-nudge-btn" data-step="1" aria-label="Next Facet">&#9654;</button>
      </div>
      <div class="ws-action-row">
        ${peelButtonHtml}
        ${redactButtonHtml}
      </div>
      ${this.buildOverclockBarHtml()}
    `;
  }

  private buildOverclockBarHtml(): string {
    return `
      <button type="button" class="ws-overclock-btn" data-ref="overclockBtn">
        <div class="ws-overclock-fill" data-ref="overclockFill"></div>
        <div class="ws-overclock-content">
          <span class="ws-overclock-label" data-ref="overclockLabel">TAP LOCK &middot; HOLD OVERCLOCK</span>
          <span class="ws-overclock-sub" data-ref="overclockSub">SAFE 1.0&times; &middot; HOLD UP TO 2.0&times;</span>
        </div>
      </button>
    `;
  }

  private buildEthicalInterruptHtml(aq: ActiveQuestionState): string {
    const inter = aq.ethicalInterrupt!;
    const portraitSrc = inferPortraitFromSpeakerName(inter.speaker);
    const portraitHtml = portraitSrc
      ? `
        <div class="ws-portrait-medallion is-compact" data-tone="cyan">
          <div class="ws-portrait-medallion-inner">
            <img class="ws-portrait-img" src="${escapeHtml(portraitSrc)}" alt="${escapeHtml(inter.speaker)}" decoding="async" />
          </div>
        </div>
      `
      : '';

    return `
      <div class="ws-interrupt-backdrop" role="dialog" aria-modal="true" aria-label="Incoming Transmission">
        <div class="ws-interrupt-card">
          <div class="ws-dialogue-header-flex">
            ${portraitHtml}
            <div class="ws-speaker-meta-col">
              <span class="ws-eyebrow" style="color:var(--accent-cyan);">ENCRYPTED TRANSMISSION</span>
              <span class="ws-speaker-name" style="color:#a4f3ff;">${escapeHtml(inter.speaker)}</span>
            </div>
          </div>
          <p class="ws-dialogue-copy">${escapeHtml(inter.message)}</p>
          <div class="ws-interrupt-leak">
            <strong>INTERCEPTED SIGNAL:</strong> ${escapeHtml(inter.leakedHint)}
          </div>
          <div class="ws-choices-stack">
            ${inter.choices
              .map(
                (c) => `
                <button type="button" class="ws-choice-card" data-interrupt-choice="${escapeHtml(c.id)}">
                  <div class="ws-choice-head">
                    <span class="ws-choice-label">${escapeHtml(c.label)}</span>
                    ${
                      c.tag
                        ? `<span class="ws-tag-pill" data-tone="${escapeHtml(c.tagTone ?? 'neutral')}">${escapeHtml(c.tag)}</span>`
                        : ''
                    }
                  </div>
                  <span class="ws-choice-subtext">${escapeHtml(c.subtext)}</span>
                </button>
              `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  private cacheAndBindActiveMatch(aq: ActiveQuestionState): void {
    this.refs.hudScore = this.stageEl.querySelector<HTMLElement>('[data-ref="hudScore"]') ?? undefined;
    this.refs.hudStreak = this.stageEl.querySelector<HTMLElement>('[data-ref="hudStreak"]') ?? undefined;
    this.refs.hudShields = Array.from(this.stageEl.querySelectorAll<HTMLElement>('[data-shield-idx]'));
    this.refs.rivalPill = this.stageEl.querySelector<HTMLElement>('[data-ref="rivalPill"]') ?? undefined;
    this.refs.rivalScore = this.stageEl.querySelector<HTMLElement>('[data-ref="rivalScore"]') ?? undefined;
    this.refs.rivalStatus = this.stageEl.querySelector<HTMLElement>('[data-ref="rivalStatus"]') ?? undefined;
    this.refs.rivalTell = this.stageEl.querySelector<HTMLElement>('[data-ref="rivalTell"]') ?? undefined;
    this.refs.timerText = this.stageEl.querySelector<HTMLElement>('[data-ref="timerText"]') ?? undefined;
    this.refs.chronoFill = this.stageEl.querySelector<HTMLElement>('[data-ref="chronoFill"]') ?? undefined;
    this.refs.facetText = this.stageEl.querySelector<HTMLElement>('[data-ref="facetText"]') ?? undefined;
    this.refs.facetDots = Array.from(this.stageEl.querySelectorAll<HTMLElement>('[data-facet-dot]'));
    this.refs.calibratorVal =
      this.stageEl.querySelector<HTMLElement>('[data-ref="calibratorVal"]') ?? undefined;
    this.refs.calibratorMult =
      this.stageEl.querySelector<HTMLElement>('[data-ref="calibratorMult"]') ?? undefined;
    this.refs.codexBadge = this.stageEl.querySelector<HTMLElement>('[data-ref="codexBadge"]') ?? undefined;
    this.refs.codexTopTexts = Array.from(this.stageEl.querySelectorAll<HTMLElement>('[data-codex-top]'));
    this.refs.codexBotTexts = Array.from(this.stageEl.querySelectorAll<HTMLElement>('[data-codex-bot]'));

    // Facet step buttons
    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = Number(btn.dataset.step) < 0 ? -1 : 1;
        this.actions.stepFacet(dir);
      });
    });

    // Peel & Redact
    this.stageEl.querySelector('[data-action="peel"]')?.addEventListener('click', () => {
      this.actions.peelPrism();
    });
    this.stageEl.querySelector('[data-action="redact"]')?.addEventListener('click', () => {
      this.actions.useDiplomaticRedaction();
    });

    // Calibrator fine-tune buttons
    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-cal-pos]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sign = Number(btn.dataset.calPos) < 0 ? -1 : 1;
        this.actions.adjustCalibrator(sign * CALIBRATOR_NUDGE_STEP, 0);
      });
    });
    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-cal-tol]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sign = Number(btn.dataset.calTol) < 0 ? -1 : 1;
        this.actions.adjustCalibrator(0, sign * CALIBRATOR_NUDGE_STEP);
      });
    });

    // Codex ring spin buttons + Lock
    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-codex-spin]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const spec = btn.dataset.codexSpin ?? '';
        const [ringStr, dirStr] = spec.split(':');
        const ring = ringStr === 'TOP' ? 'TOP' : 'BOTTOM';
        const dir = Number(dirStr) < 0 ? -1 : 1;
        this.actions.spinPrism(dir * CODEX_BUTTON_SPIN_PX, ring);
      });
    });
    this.stageEl.querySelector('[data-action="commitCodex"]')?.addEventListener('click', () => {
      this.actions.commitCodex();
    });

    // Gauntlet verdict buttons
    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-gauntlet]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.gauntlet as 'TRUE' | 'FALSE' | 'CHALLENGE' | undefined;
        if (act) this.actions.swipeGauntlet(act);
      });
    });

    // Ethical interrupt choices
    if (aq.ethicalInterrupt) {
      this.stageEl.querySelectorAll<HTMLButtonElement>('[data-interrupt-choice]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.interruptChoice;
          if (id) this.actions.chooseEthicalInterrupt(id);
        });
      });
    }

    // Overclock tactile Hold-or-Tap Button
    const overclockBtn = this.stageEl.querySelector<HTMLButtonElement>('[data-ref="overclockBtn"]');
    if (overclockBtn) {
      this.refs.overclockBtn = overclockBtn;
      this.refs.overclockFill =
        this.stageEl.querySelector<HTMLElement>('[data-ref="overclockFill"]') ?? undefined;
      this.refs.overclockLabel =
        this.stageEl.querySelector<HTMLElement>('[data-ref="overclockLabel"]') ?? undefined;
      this.refs.overclockSub =
        this.stageEl.querySelector<HTMLElement>('[data-ref="overclockSub"]') ?? undefined;
      this.wireOverclockButton(overclockBtn);
    }
  }

  private wireOverclockButton(btn: HTMLButtonElement): void {
    const clearHoldTimer = (): void => {
      if (this.holdTimerId !== null) {
        window.clearTimeout(this.holdTimerId);
        this.holdTimerId = null;
      }
    };

    const onContextMenu = (e: Event): void => {
      e.preventDefault();
    };

    const onPointerDown = (e: PointerEvent): void => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (this.holdPointerId !== null) return;
      e.preventDefault();

      this.holdPointerId = e.pointerId;
      this.holdStartX = e.clientX;
      this.holdOverclockStarted = false;
      this.holdCancelled = false;

      try {
        btn.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture is unsupported
      }

      clearHoldTimer();
      this.holdTimerId = window.setTimeout(() => {
        this.holdTimerId = null;
        if (this.holdPointerId !== null && !this.holdCancelled) {
          this.holdOverclockStarted = true;
          this.actions.beginOverclock();
        }
      }, OVERCLOCK_HOLD_DELAY_MS);
    };

    const onPointerMove = (e: PointerEvent): void => {
      if (e.pointerId !== this.holdPointerId || this.holdCancelled) return;
      const absDx = Math.abs(e.clientX - this.holdStartX);
      if (this.holdOverclockStarted) {
        btn.classList.toggle('is-cancelling', absDx > 22);
      }
      if (absDx > OVERCLOCK_CANCEL_DRAG_PX) {
        this.holdCancelled = true;
        clearHoldTimer();
        btn.classList.remove('is-cancelling');
        const wasStarted = this.holdOverclockStarted;
        this.holdOverclockStarted = false;
        this.holdPointerId = null;
        try {
          if (btn.hasPointerCapture(e.pointerId)) {
            btn.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Ignore
        }
        if (wasStarted) {
          this.actions.cancelOverclock();
        }
      }
    };

    const onPointerUp = (e: PointerEvent): void => {
      if (e.pointerId !== this.holdPointerId) return;
      clearHoldTimer();
      btn.classList.remove('is-cancelling');
      const wasCancelled = this.holdCancelled;
      this.holdPointerId = null;
      this.holdOverclockStarted = false;
      this.holdCancelled = false;
      try {
        if (btn.hasPointerCapture(e.pointerId)) {
          btn.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
      if (!wasCancelled) {
        this.actions.commitLock();
      }
    };

    const onPointerCancel = (e: PointerEvent): void => {
      if (e.pointerId !== this.holdPointerId) return;
      clearHoldTimer();
      btn.classList.remove('is-cancelling');
      const wasStarted = this.holdOverclockStarted && !this.holdCancelled;
      this.holdPointerId = null;
      this.holdOverclockStarted = false;
      this.holdCancelled = true;
      if (wasStarted) {
        this.actions.cancelOverclock();
      }
    };

    const onLostPointerCapture = (e: PointerEvent): void => {
      if (e.pointerId !== this.holdPointerId) return;
      clearHoldTimer();
      btn.classList.remove('is-cancelling');
      const wasStarted = this.holdOverclockStarted && !this.holdCancelled;
      this.holdPointerId = null;
      this.holdOverclockStarted = false;
      this.holdCancelled = true;
      if (wasStarted) {
        this.actions.cancelOverclock();
      }
    };

    btn.addEventListener('contextmenu', onContextMenu);
    btn.addEventListener('pointerdown', onPointerDown);
    btn.addEventListener('pointermove', onPointerMove);
    btn.addEventListener('pointerup', onPointerUp);
    btn.addEventListener('pointercancel', onPointerCancel);
    btn.addEventListener('lostpointercapture', onLostPointerCapture);

    this.activeInteractionCleanup = () => {
      btn.removeEventListener('contextmenu', onContextMenu);
      btn.removeEventListener('pointerdown', onPointerDown);
      btn.removeEventListener('pointermove', onPointerMove);
      btn.removeEventListener('pointerup', onPointerUp);
      btn.removeEventListener('pointercancel', onPointerCancel);
      btn.removeEventListener('lostpointercapture', onLostPointerCapture);
    };
  }

  // --------------------------------------------------------------------------
  // 5. INTEL FLASH SCREEN (Backfire Screen-Shake & Radiant Shimmer Sweep!)
  // --------------------------------------------------------------------------
  private buildIntelFlashScreen(state: GameUIState): void {
    const res: QuestionResolution | null = state.lastResolution;
    if (!res) {
      this.stageEl.innerHTML = '';
      return;
    }

    const domain = getDomainMeta(res.domainId);
    const isBookmarked = state.story.bookmarks.some((b) => b.qid === res.qid);
    const isRadiant = Boolean(res.bullseye || (res.correct && res.overclocked));
    const isBackfire = Boolean(res.backfired);

    let verdictTitle = 'SIGHTLINE MISSED';
    const cardClasses: string[] = ['ws-glass-strong', 'ws-flash-card'];

    if (res.bullseye) {
      verdictTitle = 'BULLSEYE CALIBRATION!';
      cardClasses.push('is-bullseye');
    } else if (res.correct && res.overclocked) {
      verdictTitle = 'OVERCLOCK RESONANCE!';
      cardClasses.push('is-bullseye');
    } else if (res.correct) {
      verdictTitle = 'GOLD RESONANCE!';
    } else if (res.backfired) {
      verdictTitle = 'OVERCLOCK BACKFIRE!';
      cardClasses.push('is-wrong', 'is-backfire-recoil');
    } else {
      cardClasses.push('is-wrong');
    }

    if (isRadiant) {
      cardClasses.push('is-radiant-shimmer');
    }

    const screenClasses = ['ws-screen-flash', isBackfire ? 'is-backfire-shake' : '']
      .filter(Boolean)
      .join(' ');

    const deltaSign = res.totalPoints > 0 ? '+' : '';
    const deltaClass = res.totalPoints < 0 || !res.correct ? ' is-neg' : '';

    const rivalPortrait = state.rival ? getPortraitSrc(state.rival.id) : null;
    const rivalHtml =
      state.rival && res.rivalPointsDelta !== undefined
        ? `
          <div class="ws-flash-rival">
            <div class="ws-flash-rival-left">
              ${
                rivalPortrait
                  ? `<img class="ws-mini-avatar" src="${escapeHtml(rivalPortrait)}" alt="${escapeHtml(state.rival.name)}" decoding="async" />`
                  : ''
              }
              <span>${escapeHtml(state.rival.name)}: ${res.rivalCorrect ? 'LOCKED CORRECT' : 'MISSED'}</span>
            </div>
            <span class="ws-mono">${res.rivalPointsDelta >= 0 ? '+' : ''}${res.rivalPointsDelta}</span>
          </div>
        `
        : '';

    const shieldsHtml =
      state.maxShields > 0
        ? `<div class="ws-shields" aria-label="Prism Shields">
            ${Array.from({ length: state.maxShields }, (_, i) => `<span class="ws-shield-diamond${i >= state.shields ? ' is-broken' : ''}" data-shield-idx="${i}"></span>`).join('')}
          </div>`
        : '';

    this.stageEl.innerHTML = `
      <div class="${screenClasses}">
        <div class="ws-hud-bar">
          <div class="ws-hud-left">
            <span class="ws-hud-venue">${escapeHtml(state.venueTitle)}</span>
            <div class="ws-hud-stats-row">
              <span class="ws-hud-score ws-mono" data-ref="hudScore">${state.playerScore.toLocaleString()}</span>
              <span class="ws-hud-streak${state.streak < 2 ? ' is-cold' : ''}${state.streak >= 3 ? ' is-hot-streak' : ''}" data-ref="hudStreak">${state.streak}&times; STREAK</span>
              ${shieldsHtml}
            </div>
          </div>
          ${this.renderUtilityButtonsHtml(true)}
        </div>

        <div class="ws-spacer" aria-hidden="true"></div>

        <div class="${cardClasses.join(' ')}">
          <div class="ws-flash-header">
            <div>
              <div class="ws-domain-badge" style="margin-bottom:3px;">
                <span class="ws-domain-swatch" style="background:${escapeHtml(domain.accentHex)};"></span>
                <span>${escapeHtml(domain.name)}</span>
              </div>
              <div class="ws-flash-verdict">${verdictTitle}</div>
            </div>
            <div class="ws-flash-delta${deltaClass}">${deltaSign}${res.totalPoints.toLocaleString()}</div>
          </div>

          <div class="ws-flash-answer-box">
            <span class="ws-flash-answer-label">VERIFIED ANSWER</span>
            <span class="ws-flash-answer-val">${escapeHtml(res.correctAnswerDisplay)}</span>
          </div>

          <div class="ws-flash-breakdown">
            <span>BASE ${res.basePoints}</span>
            <span>&times; T${res.peelTier} (${res.tierMultiplier.toFixed(1)}&times;)</span>
            <span>&times; OC (${res.overclockMultiplier.toFixed(2)}&times;)</span>
            <span>+ SPEED ${res.speedBonus}</span>
          </div>

          ${rivalHtml}

          <p class="ws-flash-why">${escapeHtml(res.whyExplanation)}</p>

          <div class="ws-flash-actions">
            <button type="button" class="ws-bookmark-btn${isBookmarked ? ' is-saved' : ''}" data-action="bookmark">
              <span>${isBookmarked ? '&#9733; SAVED' : '&#9734; SAVE'}</span>
            </button>
            <button type="button" class="ws-btn-gold" data-action="continueFlash">
              <span>CONTINUE</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindCommonUtilityButtons(this.stageEl);
    this.refs.hudScore = this.stageEl.querySelector<HTMLElement>('[data-ref="hudScore"]') ?? undefined;
    this.refs.hudStreak = this.stageEl.querySelector<HTMLElement>('[data-ref="hudStreak"]') ?? undefined;
    this.refs.hudShields = Array.from(this.stageEl.querySelectorAll<HTMLElement>('[data-shield-idx]'));

    this.stageEl
      .querySelector('[data-action="bookmark"]')
      ?.addEventListener('click', () => this.actions.toggleBookmarkLastFlash());
    this.stageEl
      .querySelector('[data-action="continueFlash"]')
      ?.addEventListener('click', () => this.actions.continueAfterIntelFlash());
  }

  // --------------------------------------------------------------------------
  // 6. ENDLESS AIRLOCK SCREEN
  // --------------------------------------------------------------------------
  private buildEndlessAirlockScreen(state: GameUIState): void {
    const cp: EndlessCheckpointState | null = state.endlessCheckpoint;
    if (!cp) {
      this.stageEl.innerHTML = '';
      return;
    }

    const shieldsHtml = Array.from({ length: cp.maxShields }, (_, i) => {
      const broken = i >= cp.shields ? ' is-broken' : '';
      return `<span class="ws-shield-diamond${broken}"></span>`;
    }).join('');

    this.stageEl.innerHTML = `
      <div class="ws-screen-airlock">
        <div class="ws-top-bar" style="margin-bottom:auto;">
          <div class="ws-top-title-block">
            <span class="ws-eyebrow" style="color:var(--accent-cyan);">THE ARCHIVE DESCENT</span>
            <h2 class="ws-top-title">EXTRACTION AIRLOCK</h2>
          </div>
          ${this.renderUtilityButtonsHtml(true)}
        </div>

        <div class="ws-glass-strong ws-airlock-card">
          <div class="ws-boarding-header">
            <div>
              <span class="ws-eyebrow" style="color:var(--accent-cyan);">FLOOR ${cp.floor} REACHED</span>
              <div class="ws-boarding-city" style="margin-top:2px;">${escapeHtml(cp.strataName)}</div>
            </div>
            <div class="ws-shields">${shieldsHtml}</div>
          </div>

          <div class="ws-airlock-stats">
            <div class="ws-stat-tile">
              <span class="ws-stat-label">BANKED</span>
              <span class="ws-stat-value is-cyan">${cp.bankedScore.toLocaleString()}</span>
            </div>
            <div class="ws-stat-tile">
              <span class="ws-stat-label">AT RISK</span>
              <span class="ws-stat-value is-gold">+${cp.unbankedScore.toLocaleString()}</span>
            </div>
            <div class="ws-stat-tile">
              <span class="ws-stat-label">SHIELDS</span>
              <span class="ws-stat-value">${cp.shields}/${cp.maxShields}</span>
            </div>
          </div>

          <div class="ws-lore-box">
            <div class="ws-lore-kicker">LEDGER FRAGMENT // DECRYPTED</div>
            <div>${escapeHtml(cp.loreSnippet)}</div>
          </div>

          <div class="ws-airlock-actions">
            <button type="button" class="ws-btn-secondary" data-action="extract">
              <span>EXTRACT &amp; BANK</span>
            </button>
            <button type="button" class="ws-btn-gold" data-action="descend">
              <span>DESCEND DEEPER</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindCommonUtilityButtons(this.stageEl);
    this.stageEl
      .querySelector('[data-action="extract"]')
      ?.addEventListener('click', () => this.actions.endlessExtract());
    this.stageEl
      .querySelector('[data-action="descend"]')
      ?.addEventListener('click', () => this.actions.endlessDescend());
  }

  // --------------------------------------------------------------------------
  // 7. MATCH SUMMARY SCREEN (+ CINEMATIC ENDING CREDITS SEAL!)
  // --------------------------------------------------------------------------
  private buildMatchSummaryScreen(state: GameUIState): void {
    const ms: MatchSummaryState | null = state.matchSummary;
    if (!ms) {
      this.stageEl.innerHTML = '';
      return;
    }

    const accuracyPct = ms.totalCount > 0 ? Math.round((ms.correctCount / ms.totalCount) * 100) : 0;
    const outcomeText = ms.won ? 'CLEARANCE GRANTED · VICTORY' : 'SESSION CONCLUDED';
    const outcomeCls = ms.won ? 'is-win' : 'is-loss';

    const endingMeta = state.endingAwarded ? ENDING_META[state.endingAwarded] : null;
    const endingSealHtml = endingMeta
      ? `
        <div class="ws-ending-seal" data-tone="${endingMeta.tone}">
          <div class="ws-ending-crest" aria-hidden="true">
            <span class="ws-ending-numeral">${endingMeta.numeral}</span>
          </div>
          <div class="ws-ending-badge">${escapeHtml(endingMeta.badge)}</div>
          <h3 class="ws-ending-title">${escapeHtml(endingMeta.title)}</h3>
          <div class="ws-ending-sub">${escapeHtml(endingMeta.subtitle)}</div>
          <p class="ws-ending-epilogue">${escapeHtml(endingMeta.epilogue)}</p>
          <div class="ws-ending-credits-line">MERIDIAN CIRCUIT COMPLETE &middot; CREDITS SEALED</div>
        </div>
      `
      : '';

    const scoreVsHtml =
      ms.rivalName !== undefined && ms.rivalScore !== undefined
        ? `
          <div class="ws-score-vs">
            <div class="ws-score-col">
              <div class="ws-stat-label">YOU</div>
              <div class="ws-score-big">${ms.playerScore.toLocaleString()}</div>
            </div>
            <span class="ws-score-vs-divider">VS</span>
            <div class="ws-score-col">
              <div class="ws-stat-label">${escapeHtml(ms.rivalName)}</div>
              <div class="ws-score-big" style="color:var(--text-secondary);">${ms.rivalScore.toLocaleString()}</div>
            </div>
          </div>
        `
        : `
          <div class="ws-score-vs">
            <div class="ws-score-col">
              <div class="ws-stat-label">FINAL SCORE</div>
              <div class="ws-score-big">${ms.playerScore.toLocaleString()}</div>
            </div>
          </div>
        `;

    const personaHtml = ms.personaAwarded
      ? `
        <div class="ws-persona-stamp">
          <div>
            <span class="ws-eyebrow">PASSPORT STAMP ISSUED</span>
            <div class="ws-persona-name">${escapeHtml(PERSONA_META[ms.personaAwarded].title)}</div>
            <div class="ws-choice-subtext">${escapeHtml(PERSONA_META[ms.personaAwarded].tagline)}</div>
          </div>
          <span class="ws-tag-pill" data-tone="gold">VERIFIED</span>
        </div>
      `
      : '';

    const unlockedRelicMeta = ms.unlockedRelic ? RELIC_META[ms.unlockedRelic] : null;
    const relicHtml = unlockedRelicMeta
      ? `
        <div class="ws-unlock-card">
          <span class="ws-eyebrow">3D HERO RELIC UNLOCKED</span>
          <div class="ws-choice-label" style="color:var(--accent-bright);">${escapeHtml(unlockedRelicMeta.name)}</div>
          <div class="ws-choice-subtext">${escapeHtml(unlockedRelicMeta.desc)}</div>
        </div>
      `
      : '';

    const perkHtml = ms.unlockedPerk
      ? `
        <div class="ws-unlock-card">
          <span class="ws-eyebrow">TACTICAL PERK UNLOCKED</span>
          <div class="ws-choice-label" style="color:var(--accent-bright);">${escapeHtml(ms.unlockedPerk.name)}</div>
          <div class="ws-choice-subtext">${escapeHtml(ms.unlockedPerk.effectDescription)}</div>
        </div>
      `
      : '';

    const dailyHtml =
      ms.dailyShareText || ms.dailyPercentile !== undefined
        ? `
          <div class="ws-daily-share-box">
            <div class="ws-boarding-header">
              <span class="ws-eyebrow" style="color:var(--accent-cyan);">GLOBAL FEED TELEMETRY</span>
              ${
                ms.dailyPercentile !== undefined
                  ? `<span class="ws-tag-pill" data-tone="cyan">${Math.round(ms.dailyPercentile)}TH PERCENTILE</span>`
                  : ''
              }
            </div>
            ${ms.dailyShareText ? `<pre class="ws-daily-grid-pre">${escapeHtml(ms.dailyShareText)}</pre>` : ''}
            <button type="button" class="ws-btn-secondary" data-action="copyShare" style="width:100%;">
              <span>COPY SHARE GRID</span>
            </button>
          </div>
        `
        : '';

    this.stageEl.innerHTML = `
      <div class="ws-screen-scroll">
        <div class="ws-top-bar">
          <span class="ws-eyebrow">${escapeHtml(ms.mode)} DOSSIER</span>
          ${this.renderUtilityButtonsHtml(true)}
        </div>

        <div class="ws-glass-strong ws-summary-card">
          ${endingSealHtml}

          <div class="ws-summary-banner">
            <div class="ws-summary-outcome ${outcomeCls}">${outcomeText}</div>
            <h2 class="ws-summary-title">${escapeHtml(ms.title)}</h2>
            <p class="ws-summary-sub">${escapeHtml(ms.subtitle)}</p>
          </div>

          ${scoreVsHtml}

          <div class="ws-summary-metrics">
            <div class="ws-stat-tile">
              <span class="ws-stat-label">ACCURACY</span>
              <span class="ws-stat-value">${ms.correctCount}/${ms.totalCount} (${accuracyPct}%)</span>
            </div>
            <div class="ws-stat-tile">
              <span class="ws-stat-label">MAX STREAK</span>
              <span class="ws-stat-value is-gold">${ms.maxStreak}&times;</span>
            </div>
            <div class="ws-stat-tile">
              <span class="ws-stat-label">OVERCLOCK HITS</span>
              <span class="ws-stat-value is-gold">${ms.overclockHits}</span>
            </div>
            <div class="ws-stat-tile">
              <span class="ws-stat-label">AVG PEEL TIER</span>
              <span class="ws-stat-value is-cyan">T${ms.averagePeelTier.toFixed(1)}</span>
            </div>
          </div>

          ${personaHtml}
          ${relicHtml}
          ${perkHtml}
          ${dailyHtml}

          <div class="ws-summary-actions">
            <button type="button" class="ws-btn-gold" data-action="summaryPrimary">
              <span>${escapeHtml(ms.nextActionLabel)}</span>
            </button>
            ${
              ms.secondaryActionLabel
                ? `<button type="button" class="ws-btn-secondary" data-action="summarySecondary" style="width:100%;">
                    <span>${escapeHtml(ms.secondaryActionLabel)}</span>
                  </button>`
                : ''
            }
          </div>
        </div>
      </div>
    `;

    this.bindCommonUtilityButtons(this.stageEl);
    this.stageEl
      .querySelector('[data-action="copyShare"]')
      ?.addEventListener('click', () => this.actions.copyDailyShare());
    this.stageEl
      .querySelector('[data-action="summaryPrimary"]')
      ?.addEventListener('click', () => this.actions.summaryPrimaryAction());
    this.stageEl
      .querySelector('[data-action="summarySecondary"]')
      ?.addEventListener('click', () => this.actions.summarySecondaryAction());
  }

  // --------------------------------------------------------------------------
  // 8. BRIEFING PICKER SCREEN (Morph Practice Filter Bar + 12 L0 Domains)
  // --------------------------------------------------------------------------
  private buildBriefingPickerScreen(state: GameUIState): void {
    const activeFilterMeta =
      BRIEFING_MORPH_FILTERS.find((m) => m.id === this.briefingMorphFilter) ?? BRIEFING_MORPH_FILTERS[0];
    const archetypeArg = this.briefingMorphFilter === 'ALL' ? undefined : this.briefingMorphFilter;

    const filterPillsHtml = BRIEFING_MORPH_FILTERS.map((m) => {
      const isActive = m.id === this.briefingMorphFilter;
      return `
        <button
          type="button"
          class="ws-morph-chip${isActive ? ' is-active' : ''}"
          data-morph-filter="${m.id}"
          aria-pressed="${isActive}"
        >
          ${escapeHtml(m.label)}
        </button>
      `;
    }).join('');

    const domainsHtml = DOMAINS.map((dom) => {
      const elo = Math.round(state.domainRatings[dom.id] ?? 1200);
      const pct = Math.round(clamp((elo - 600) / 1600, 0.08, 1) * 100);
      return `
        <button type="button" class="ws-domain-card" data-domain-id="${dom.id}">
          <span class="ws-domain-stripe" style="background:${escapeHtml(dom.accentHex)};"></span>
          <div class="ws-domain-card-name">${escapeHtml(dom.name)}</div>
          <div class="ws-domain-card-mat">${escapeHtml(dom.materialLabel)}</div>
          <div class="ws-domain-card-elo">
            <span style="color:var(--text-muted);font-size:9.5px;">ELO</span>
            <span>${elo}</span>
          </div>
          <div class="ws-elo-mini-bar">
            <div class="ws-elo-mini-fill" style="width:${pct}%;background:${escapeHtml(dom.accentHex)};"></div>
          </div>
        </button>
      `;
    }).join('');

    this.stageEl.innerHTML = `
      <div class="ws-screen-scroll">
        <div class="ws-top-bar">
          <div style="display:flex;align-items:center;gap:10px;">
            <button type="button" class="ws-icon-btn" data-action="home" aria-label="Back">${SVG_BACK}</button>
            <div class="ws-top-title-block">
              <span class="ws-eyebrow">QUICK CALIBRATION</span>
              <h2 class="ws-top-title">THE BRIEFING ROOM</h2>
            </div>
          </div>
          ${this.renderUtilityButtonsHtml(false)}
        </div>

        <div class="ws-morph-filter-bar" role="group" aria-label="Filter by 3D Prism Morph">
          ${filterPillsHtml}
        </div>

        <button type="button" class="ws-briefing-hero" data-domain-mix="1">
          <div>
            <span class="ws-eyebrow">ALL 12 PILLARS &middot; ${escapeHtml(activeFilterMeta.label)}</span>
            <div class="ws-boarding-city" style="margin-top:2px;">GLOBAL MIX</div>
            <div class="ws-choice-subtext">5-question ${escapeHtml(activeFilterMeta.fullName)} dossier calibrated to Elo ${Math.round(state.globalElo)}</div>
          </div>
          <span class="ws-tag-pill" data-tone="gold">START &#9654;</span>
        </button>

        <div class="ws-domains-grid">${domainsHtml}</div>
      </div>
    `;

    this.bindCommonUtilityButtons(this.stageEl);

    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-morph-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.morphFilter as BriefingMorphFilter | undefined;
        if (next && next !== this.briefingMorphFilter) {
          this.briefingMorphFilter = next;
          this.rerenderCurrent();
        }
      });
    });

    this.stageEl
      .querySelector('[data-domain-mix]')
      ?.addEventListener('click', () => this.actions.startBriefingRun('MIX', archetypeArg));

    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-domain-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.domainId) as (typeof DOMAINS)[number]['id'];
        if (!Number.isNaN(id)) this.actions.startBriefingRun(id, archetypeArg);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 9. PASSPORT & 3D OBSERVATORY (8 Relics + Prism Atelier + 10 Perks + 4 Endings)
  // --------------------------------------------------------------------------
  private buildPassportObservatoryScreen(state: GameUIState): void {
    const s = state.story;
    const isPassport = this.observatoryTab === 'PASSPORT';

    let bodyHtml = '';
    if (isPassport) {
      const personaTitle = s.persona ? PERSONA_META[s.persona].title : 'UNSTAMPED CANDIDATE';
      const personaSub = s.persona
        ? PERSONA_META[s.persona].tagline
        : 'Complete the Geneva Vetting Interview to receive your Cognitive Stamp.';
      const accPct =
        s.totalQuestionsAnswered > 0
          ? Math.round((s.totalCorrect / s.totalQuestionsAnswered) * 100)
          : 0;
      const integrityPct = Math.round(((clamp(s.axisIntegrity, -100, 100) + 100) / 200) * 100);

      const bondsHtml = (['nadia', 'teo', 'lindqvist', 'soren'] as const)
        .map((id) => {
          const lvl = s.bonds[id];
          const label = id.charAt(0).toUpperCase() + id.slice(1);
          const portraitSrc = PORTRAIT_PATHS[id];
          return `
            <div class="ws-bond-chip" data-bond="${lvl}">
              <img class="ws-bond-avatar" src="${escapeHtml(portraitSrc)}" alt="${label}" decoding="async" />
              <span class="ws-bond-name">${label}</span>
              <span class="ws-bond-lvl" data-bond="${lvl}">${lvl}</span>
            </div>
          `;
        })
        .join('');

      const achievedEndings = s.achievedEndings ?? [];
      const endingsHtml = ENDING_ORDER.map((endingId) => {
        const meta = ENDING_META[endingId];
        const unlocked = achievedEndings.includes(endingId);
        return `
          <div class="ws-ending-medallion${unlocked ? ' is-unlocked' : ' is-locked'}" data-tone="${meta.tone}">
            <div class="ws-ending-medallion-head">
              <span class="ws-ending-medallion-num">${meta.numeral}</span>
              <span class="ws-tag-pill" data-tone="${unlocked ? (meta.tone === 'prismatic' ? 'cyan' : meta.tone) : 'neutral'}">${unlocked ? 'SEALED' : 'LOCKED'}</span>
            </div>
            <div class="ws-ending-medallion-title">${unlocked ? escapeHtml(meta.title) : 'CLASSIFIED ENDING'}</div>
            <div class="ws-ending-medallion-sub">${unlocked ? escapeHtml(meta.subtitle) : 'Complete the Apex Forum finale along this path.'}</div>
          </div>
        `;
      }).join('');

      const perksHtml = PERK_ORDER.map((perkId) => {
        const meta = PERKS[perkId];
        const unlocked = s.unlockedPerks.includes(perkId);
        const active = s.activePerks.includes(perkId);
        const cls = ['ws-perk-item', active ? 'is-active' : '', !unlocked ? 'is-locked' : '']
          .filter(Boolean)
          .join(' ');
        const badge = active ? 'EQUIPPED' : unlocked ? 'EQUIP' : 'LOCKED';
        const badgeTone = active ? 'gold' : unlocked ? 'cyan' : 'neutral';
        return `
          <button type="button" class="${cls}" data-perk-id="${perkId}" ${unlocked ? '' : 'disabled'}>
            <div class="ws-perk-top">
              <span class="ws-perk-name">${escapeHtml(meta.name)}</span>
              <span class="ws-tag-pill" data-tone="${badgeTone}">${badge}</span>
            </div>
            <div class="ws-perk-desc">${escapeHtml(unlocked ? meta.effectDescription : `Unlock: ${meta.source}`)}</div>
          </button>
        `;
      }).join('');

      bodyHtml = `
        <div class="ws-passport-body">
          <div class="ws-glass ws-section-card">
            <div class="ws-boarding-header">
              <div>
                <span class="ws-eyebrow">MERIDIAN DIPLOMATIC PASSPORT</span>
                <div class="ws-persona-name" style="margin-top:2px;">${escapeHtml(personaTitle)}</div>
                <div class="ws-choice-subtext">${escapeHtml(personaSub)}</div>
              </div>
              <div class="ws-stat-tile" style="min-width:74px;">
                <span class="ws-stat-label">ELO</span>
                <span class="ws-stat-value is-gold">${Math.round(state.globalElo)}</span>
              </div>
            </div>

            <div class="ws-airlock-stats">
              <div class="ws-stat-tile">
                <span class="ws-stat-label">SEEN</span>
                <span class="ws-stat-value">${s.totalQuestionsAnswered}</span>
              </div>
              <div class="ws-stat-tile">
                <span class="ws-stat-label">ACCURACY</span>
                <span class="ws-stat-value is-cyan">${accPct}%</span>
              </div>
              <div class="ws-stat-tile">
                <span class="ws-stat-label">BEST STREAK</span>
                <span class="ws-stat-value is-gold">${s.bestStreak}&times;</span>
              </div>
            </div>
          </div>

          <div class="ws-glass ws-section-card">
            <span class="ws-eyebrow">ALIGNMENT &amp; REPUTATION</span>
            <div class="ws-meter-row">
              <div class="ws-meter-labels">
                <span>AMBITION</span>
                <span>INTEGRITY (${s.axisIntegrity >= 0 ? '+' : ''}${s.axisIntegrity})</span>
              </div>
              <div class="ws-meter-track">
                <div class="ws-meter-fill" style="width:${integrityPct}%;"></div>
                <div class="ws-meter-center-tick"></div>
              </div>
            </div>

            <div class="ws-meter-row">
              <div class="ws-meter-labels">
                <span>PUBLIC TRUST</span>
                <span>${s.publicTrust}%</span>
              </div>
              <div class="ws-meter-track">
                <div class="ws-meter-fill is-cyan" style="width:${clamp(s.publicTrust, 0, 100)}%;"></div>
              </div>
            </div>

            <div class="ws-meter-row">
              <div class="ws-meter-labels">
                <span>COUNCIL FAVOR</span>
                <span>${s.councilFavor}%</span>
              </div>
              <div class="ws-meter-track">
                <div class="ws-meter-fill" style="width:${clamp(s.councilFavor, 0, 100)}%;"></div>
              </div>
            </div>

            <div class="ws-bonds-row">${bondsHtml}</div>
          </div>

          <div class="ws-glass ws-section-card">
            <div class="ws-boarding-header">
              <span class="ws-eyebrow">ENDINGS UNLOCKED</span>
              <span class="ws-tag-pill" data-tone="gold">${achievedEndings.length} / 4 SEALED</span>
            </div>
            <div class="ws-endings-shelf">${endingsHtml}</div>
          </div>

          <div class="ws-glass ws-section-card">
            <div class="ws-boarding-header">
              <span class="ws-eyebrow">12-DOMAIN COGNITIVE RADAR</span>
              <span class="ws-scene-tag">LIVE ELO</span>
            </div>
            <div class="ws-radar-wrap">${buildRadarSvg(state.domainRatings)}</div>
          </div>

          <div class="ws-glass ws-section-card">
            <div class="ws-boarding-header">
              <span class="ws-eyebrow">TACTICAL PERKS (10)</span>
              <span class="ws-tag-pill" data-tone="gold">${s.activePerks.length} / 2 ACTIVE</span>
            </div>
            <div class="ws-perks-list">${perksHtml}</div>
          </div>
        </div>
      `;
    } else {
      // Tab 2: 3D RELIC VAULT + PRISM ATELIER SKIN SELECTOR
      const relicPillsHtml = RELIC_ORDER.map((relicId) => {
        const meta = RELIC_META[relicId];
        const unlocked = s.unlockedRelics.includes(relicId);
        const selected = state.observatoryRelic === relicId;
        const cls = ['ws-relic-pill', selected ? 'is-selected' : '', !unlocked ? 'is-locked' : '']
          .filter(Boolean)
          .join(' ');
        return `
          <button type="button" class="${cls}" data-relic-id="${relicId}" ${unlocked ? '' : 'disabled'}>
            <span class="ws-relic-pill-name">${escapeHtml(meta.shortName)}</span>
            <span class="ws-scene-tag">${unlocked ? escapeHtml(meta.origin) : 'LOCKED'}</span>
          </button>
        `;
      }).join('');

      const activeRelicMeta = RELIC_META[state.observatoryRelic] ?? RELIC_META.meridian_astrolabe;
      const hasAnyRelic = s.unlockedRelics.length > 0;

      const unlockedSkins = new Set<PrismSkinId>(['OBSIDIAN_BRASS', ...(s.unlockedSkins ?? [])]);
      const activeSkin: PrismSkinId = s.activeSkin ?? 'OBSIDIAN_BRASS';
      const skinsHtml = PRISM_SKIN_ORDER.map((skinId) => {
        const meta = PRISM_SKIN_META[skinId];
        const unlocked = unlockedSkins.has(skinId);
        const equipped = activeSkin === skinId;
        const cls = ['ws-skin-card', equipped ? 'is-equipped' : '', !unlocked ? 'is-locked' : '']
          .filter(Boolean)
          .join(' ');
        return `
          <button
            type="button"
            class="${cls}"
            data-skin-id="${skinId}"
            ${unlocked ? '' : 'disabled'}
            title="${escapeHtml(unlocked ? `${meta.name} — ${meta.finish}` : `Unlock: ${meta.unlockHint}`)}"
          >
            <span class="ws-skin-swatch" style="background:${meta.swatchCss};"></span>
            <span class="ws-skin-name">${escapeHtml(meta.shortName)}</span>
            <span class="ws-skin-state">${equipped ? 'ACTIVE' : unlocked ? 'EQUIP' : 'LOCKED'}</span>
          </button>
        `;
      }).join('');

      const activeSkinMeta = PRISM_SKIN_META[activeSkin] ?? PRISM_SKIN_META.OBSIDIAN_BRASS;

      const bookmarksHtml =
        s.bookmarks.length > 0
          ? s.bookmarks
              .slice()
              .reverse()
              .map((b) => {
                const dom = getDomainMeta(b.domainId);
                return `
                  <div class="ws-bookmark-item">
                    <div class="ws-domain-badge">
                      <span class="ws-domain-swatch" style="background:${escapeHtml(dom.accentHex)};"></span>
                      <span>${escapeHtml(dom.shortName)}</span>
                    </div>
                    <div class="ws-bookmark-q">${escapeHtml(b.prompt)}</div>
                    <div class="ws-bookmark-a">${escapeHtml(b.answer)}</div>
                    <div class="ws-bookmark-why">${escapeHtml(b.why)}</div>
                  </div>
                `;
              })
              .join('')
          : `<div class="ws-choice-subtext">No saved Intel Flashes yet. Tap &#9734; SAVE after any reveal to archive facts here.</div>`;

      const resetControlsHtml = this.confirmResetPending
        ? `
          <div class="ws-reset-row">
            <button type="button" class="ws-btn-danger" data-action="confirmReset" style="flex:1;">CONFIRM WIPE</button>
            <button type="button" class="ws-btn-secondary" data-action="cancelReset" style="flex:1;">CANCEL</button>
          </div>
        `
        : `
          <div class="ws-reset-row">
            <button type="button" class="ws-btn-danger" data-action="requestReset" style="width:100%;">RESET CAMPAIGN PROGRESS</button>
          </div>
        `;

      bodyHtml = `
        <div class="ws-whisper-pill">DRAG ABOVE TO INSPECT 3D RELIC &amp; PRISM</div>
        <div class="ws-spacer" aria-hidden="true"></div>
        <div class="ws-glass-strong ws-vault-drawer">
          <div class="ws-boarding-header">
            <span class="ws-eyebrow">3D HERO RELICS</span>
            <span class="ws-tag-pill" data-tone="gold">${s.unlockedRelics.length} / 8 UNLOCKED</span>
          </div>
          <div class="ws-relic-grid">${relicPillsHtml}</div>

          <div>
            <div class="ws-boarding-venue">${escapeHtml(hasAnyRelic ? activeRelicMeta.name : 'Relic Pedestal Locked')}</div>
            <div class="ws-choice-subtext">${escapeHtml(hasAnyRelic ? activeRelicMeta.desc : 'Complete the Geneva Vetting Prologue to unlock the Meridian Astrolabe.')}</div>
          </div>

          <div class="ws-atelier-section">
            <div class="ws-boarding-header">
              <span class="ws-eyebrow">PRISM ATELIER SKINS</span>
              <span class="ws-tag-pill" data-tone="cyan">${unlockedSkins.size} / 5 UNLOCKED</span>
            </div>
            <div class="ws-skin-grid">${skinsHtml}</div>
            <div class="ws-choice-subtext">Active Finish: <strong style="color:var(--accent-bright);">${escapeHtml(activeSkinMeta.name)}</strong> &mdash; ${escapeHtml(activeSkinMeta.finish)}</div>
          </div>

          <div class="ws-boarding-header" style="margin-top:2px;">
            <span class="ws-eyebrow">INTEL FLASH BOOKMARKS</span>
            <span class="ws-scene-tag">${s.bookmarks.length} SAVED</span>
          </div>
          <div class="ws-bookmarks-list">${bookmarksHtml}</div>

          ${resetControlsHtml}
        </div>
      `;
    }

    this.stageEl.innerHTML = `
      <div class="ws-screen-observatory">
        <div class="ws-top-bar">
          <div style="display:flex;align-items:center;gap:10px;">
            <button type="button" class="ws-icon-btn" data-action="home" aria-label="Back">${SVG_BACK}</button>
            <div class="ws-top-title-block">
              <span class="ws-eyebrow">MERIDIAN DOSSIER</span>
              <h2 class="ws-top-title">PASSPORT &amp; VAULT</h2>
            </div>
          </div>
          ${this.renderUtilityButtonsHtml(false)}
        </div>

        <div class="ws-tab-bar" role="tablist">
          <button type="button" class="ws-tab-btn${isPassport ? ' is-active' : ''}" data-obs-tab="PASSPORT" role="tab" aria-selected="${isPassport}">
            PASSPORT
          </button>
          <button type="button" class="ws-tab-btn${!isPassport ? ' is-active' : ''}" data-obs-tab="VAULT" role="tab" aria-selected="${!isPassport}">
            3D RELIC VAULT
          </button>
        </div>

        ${bodyHtml}
      </div>
    `;

    this.bindCommonUtilityButtons(this.stageEl);

    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-obs-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.obsTab as ObservatoryTab | undefined;
        if (tab && tab !== this.observatoryTab) {
          this.observatoryTab = tab;
          this.confirmResetPending = false;
          this.rerenderCurrent();
        }
      });
    });

    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-perk-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.perkId as PerkId | undefined;
        if (id) this.actions.togglePerk(id);
      });
    });

    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-relic-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.relicId as HeroRelicId | undefined;
        if (id) this.actions.selectObservatoryRelic(id);
      });
    });

    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-skin-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.skinId as PrismSkinId | undefined;
        if (id) this.actions.selectPrismSkin?.(id);
      });
    });

    this.stageEl.querySelector('[data-action="requestReset"]')?.addEventListener('click', () => {
      this.confirmResetPending = true;
      this.rerenderCurrent();
    });

    this.stageEl.querySelector('[data-action="cancelReset"]')?.addEventListener('click', () => {
      this.confirmResetPending = false;
      this.rerenderCurrent();
    });

    this.stageEl.querySelector('[data-action="confirmReset"]')?.addEventListener('click', () => {
      this.confirmResetPending = false;
      this.actions.resetCampaignProgress();
    });
  }

  // --------------------------------------------------------------------------
  // 10. TRIALS HUB SCREEN (Mode 5 — Faction War · 3D Ghost Duels · Black Salon)
  // --------------------------------------------------------------------------
  private buildTrialsHubScreen(state: GameUIState): void {
    const s = state.story;
    const hub: TrialsHubState = state.trialsHub ?? {
      pledgedFaction: s.pledgedFaction ?? null,
      factionStandings: { SOVEREIGN: 36, HORIZON: 34, AGORA: 30 },
      ghostContenders: FALLBACK_GHOSTS,
      salonRound: 0,
      salonModifier: 'ANALOG STATIC — PEEL JAMMED',
      salonEliminated: false,
    };

    const standings = hub.factionStandings;
    const totalPoints = Math.max(
      1,
      (standings.SOVEREIGN ?? 0) + (standings.HORIZON ?? 0) + (standings.AGORA ?? 0)
    );
    const pctMap: Record<FactionId, number> = {
      SOVEREIGN: Math.round(((standings.SOVEREIGN ?? 0) / totalPoints) * 100),
      HORIZON: Math.round(((standings.HORIZON ?? 0) / totalPoints) * 100),
      AGORA: 0,
    };
    pctMap.AGORA = Math.max(0, 100 - pctMap.SOVEREIGN - pctMap.HORIZON);

    const factionCardsHtml = FACTION_ORDER.map((factionId) => {
      const meta = FACTION_META[factionId];
      const pct = pctMap[factionId];
      const isPledged = hub.pledgedFaction === factionId;
      return `
        <button
          type="button"
          class="ws-faction-card${isPledged ? ' is-pledged' : ''}"
          data-faction="${factionId}"
          data-tone="${meta.tone}"
          aria-pressed="${isPledged}"
        >
          <div class="ws-faction-card-top">
            <span class="ws-faction-name">${escapeHtml(meta.name)}</span>
            <span class="ws-faction-pct ws-mono">${pct}%</span>
          </div>
          <div class="ws-faction-motto">${escapeHtml(meta.motto)}</div>
          <div class="ws-faction-bar">
            <div class="ws-faction-bar-fill" style="width:${clamp(pct, 4, 100)}%;"></div>
          </div>
          <div class="ws-faction-cta">${isPledged ? '&#9670; PLEDGED ALLEGIANCE' : 'TAP TO PLEDGE'}</div>
        </button>
      `;
    }).join('');

    // Black Salon 16-Player Knockout Bracket Status
    const round = hub.salonRound;
    const eliminated = hub.salonEliminated;
    const bracketSteps: Array<{ idx: 1 | 2 | 3; label: string; sub: string }> = [
      { idx: 1, label: 'QF', sub: '16 → 8' },
      { idx: 2, label: 'SF', sub: '8 → 4' },
      { idx: 3, label: 'GRAND FINAL', sub: '2 → 1' },
    ];

    const bracketStepperHtml = bracketSteps
      .map((step) => {
        let stateClass = 'is-upcoming';
        if (eliminated && step.idx === Math.max(1, round)) {
          stateClass = 'is-eliminated';
        } else if (!eliminated && round > step.idx) {
          stateClass = 'is-cleared';
        } else if ((!eliminated && round === step.idx) || (round === 0 && step.idx === 1)) {
          stateClass = 'is-active';
        }
        return `
          <div class="ws-bracket-node ${stateClass}">
            <span class="ws-bracket-node-title">${step.label}</span>
            <span class="ws-bracket-node-sub">${step.sub}</span>
          </div>
        `;
      })
      .join('<span class="ws-bracket-arrow" aria-hidden="true">&#8594;</span>');

    let salonBtnLabel = 'ENTER BLACK SALON';
    let salonBtnSub = 'Quarterfinal · 16-Player Knockout Bracket';
    if (eliminated) {
      salonBtnLabel = 'RE-ENTER BLACK SALON';
      salonBtnSub = 'Reset Bracket · New Quarterfinal Draw';
    } else if (round === 2) {
      salonBtnLabel = 'ENTER SEMIFINAL';
      salonBtnSub = 'Top 4 Remaining · High-Voltage Fracture';
    } else if (round === 3) {
      salonBtnLabel = 'ENTER GRAND FINAL';
      salonBtnSub = 'Championship Duel · Black Salon Crimson Reward';
    } else if (round === 1) {
      salonBtnLabel = 'ENTER BLACK SALON · QF';
      salonBtnSub = 'Quarterfinal Round · Off-Grid Rules Active';
    }

    const contenders = hub.ghostContenders.length > 0 ? hub.ghostContenders : FALLBACK_GHOSTS;
    const ghostsHtml = contenders
      .map((ghost) => {
        const portraitSrc = PORTRAIT_PATHS[ghost.portraitId] ?? PORTRAIT_PATHS.soren;
        const facMeta = FACTION_META[ghost.faction];
        const eloDiff = Math.round(ghost.elo - state.globalElo);
        const diffLabel = eloDiff > 0 ? `+${eloDiff}` : eloDiff < 0 ? `${eloDiff}` : 'EVEN';
        return `
          <div class="ws-ghost-card" data-tone="${facMeta.tone}">
            <div class="ws-ghost-portrait-frame" data-tone="${facMeta.tone}">
              <img
                class="ws-portrait-img"
                src="${escapeHtml(portraitSrc)}"
                alt="${escapeHtml(ghost.handle)}"
                decoding="async"
              />
            </div>
            <div class="ws-ghost-info">
              <div class="ws-ghost-handle-row">
                <span class="ws-ghost-handle">${escapeHtml(ghost.handle)}</span>
                <span class="ws-ghost-country">${escapeHtml(ghost.countryCode)}</span>
              </div>
              <div class="ws-ghost-style">${escapeHtml(ghost.styleTag)}</div>
              <div class="ws-ghost-meta-row">
                <span class="ws-ghost-elo ws-mono">ELO ${ghost.elo}</span>
                <span class="ws-ghost-diff ws-mono">${diffLabel}</span>
                <span class="ws-ghost-fac" data-tone="${facMeta.tone}">${facMeta.shortName}</span>
              </div>
            </div>
            <button type="button" class="ws-btn-duel" data-ghost-id="${escapeHtml(ghost.id)}">
              <span>DUEL</span>
              <span>GHOST</span>
            </button>
          </div>
        `;
      })
      .join('');

    this.stageEl.innerHTML = `
      <div class="ws-screen-scroll">
        <div class="ws-top-bar">
          <div style="display:flex;align-items:center;gap:10px;">
            <button type="button" class="ws-icon-btn" data-action="home" aria-label="Back">${SVG_BACK}</button>
            <div class="ws-top-title-block">
              <span class="ws-eyebrow">FACTION LEAGUES &middot; OFF-GRID</span>
              <h2 class="ws-top-title">WORLD COUNCIL TRIALS</h2>
            </div>
          </div>
          ${this.renderUtilityButtonsHtml(false, true)}
        </div>

        <div class="ws-glass-strong ws-trials-faction-card">
          <div class="ws-boarding-header">
            <div>
              <span class="ws-eyebrow">GLOBAL FACTION WAR</span>
              <div class="ws-choice-subtext" style="margin-top:2px;">Every Trials victory shifts worldwide league dominance.</div>
            </div>
            <span class="ws-tag-pill" data-tone="gold">${s.trialsWins ?? 0}W RECORD</span>
          </div>

          <div class="ws-faction-war-bar" aria-label="Global Faction Standings">
            <div class="ws-war-seg is-sovereign" style="width:${pctMap.SOVEREIGN}%;"></div>
            <div class="ws-war-seg is-horizon" style="width:${pctMap.HORIZON}%;"></div>
            <div class="ws-war-seg is-agora" style="width:${pctMap.AGORA}%;"></div>
          </div>

          <div class="ws-faction-grid">${factionCardsHtml}</div>
        </div>

        <div class="ws-glass-strong ws-salon-bracket-card">
          <div class="ws-boarding-header">
            <div>
              <span class="ws-eyebrow" style="color:#ff8b96;">UNDERGROUND 16-PLAYER KNOCKOUT</span>
              <h3 class="ws-salon-title">THE BLACK SALON</h3>
            </div>
            <span class="ws-tag-pill" data-tone="crimson">${s.salonTrophies ?? 0} TROPH${(s.salonTrophies ?? 0) === 1 ? 'Y' : 'IES'}</span>
          </div>

          <div class="ws-bracket-stepper">${bracketStepperHtml}</div>

          <div class="ws-salon-mod-box">
            <span class="ws-salon-mod-kicker">ACTIVE MODIFIER</span>
            <span class="ws-salon-mod-val">${escapeHtml(hub.salonModifier || 'ANALOG STATIC — PEEL JAMMED')}</span>
          </div>

          <button type="button" class="ws-btn-crimson" data-action="enterBlackSalon">
            <span>${escapeHtml(salonBtnLabel)}</span>
            <span class="ws-btn-crimson-sub">${escapeHtml(salonBtnSub)}</span>
          </button>
        </div>

        <div class="ws-glass ws-section-card">
          <div class="ws-boarding-header">
            <div>
              <span class="ws-eyebrow" style="color:var(--accent-cyan);">3D ASYNC KINETIC GHOST DUELS</span>
              <div class="ws-choice-subtext" style="margin-top:2px;">Race recorded polymath Prisms in real-time telemetry.</div>
            </div>
            <span class="ws-tag-pill" data-tone="cyan">${contenders.length} LIVE</span>
          </div>

          <div class="ws-ghost-list">${ghostsHtml}</div>
        </div>
      </div>
    `;

    this.bindCommonUtilityButtons(this.stageEl);

    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-faction]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fac = btn.dataset.faction as FactionId | undefined;
        if (fac) this.actions.pledgeFaction?.(fac);
      });
    });

    this.stageEl
      .querySelector('[data-action="enterBlackSalon"]')
      ?.addEventListener('click', () => this.actions.startBlackSalonBracket?.());

    this.stageEl.querySelectorAll<HTMLButtonElement>('[data-ghost-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ghostId = btn.dataset.ghostId;
        if (ghostId) this.actions.startGhostDuel?.(ghostId);
      });
    });
  }

  // --------------------------------------------------------------------------
  // HIGH-FREQUENCY LIVE TELEMETRY PATCHING (60Hz — ZERO DOM THRASHING!)
  // --------------------------------------------------------------------------
  private patchLiveRefs(state: GameUIState): void {
    // 1. Utility audio/haptics toggle states
    if (this.refs.audioBtn && this.lastAudioMuted !== state.audioMuted) {
      this.lastAudioMuted = state.audioMuted;
      this.refs.audioBtn.innerHTML = state.audioMuted ? SVG_AUDIO_OFF : SVG_AUDIO_ON;
      this.refs.audioBtn.classList.toggle('is-muted', state.audioMuted);
      this.refs.audioBtn.classList.toggle('is-active', !state.audioMuted);
      this.refs.audioBtn.setAttribute('aria-pressed', String(!state.audioMuted));
    }
    if (this.refs.hapticsBtn && this.lastHapticsEnabled !== state.hapticsEnabled) {
      this.lastHapticsEnabled = state.hapticsEnabled;
      this.refs.hapticsBtn.innerHTML = state.hapticsEnabled ? SVG_HAPTICS_ON : SVG_HAPTICS_OFF;
      this.refs.hapticsBtn.classList.toggle('is-muted', !state.hapticsEnabled);
      this.refs.hapticsBtn.classList.toggle('is-active', state.hapticsEnabled);
      this.refs.hapticsBtn.setAttribute('aria-pressed', String(state.hapticsEnabled));
    }

    // 2. Title Elo / Relics telemetry
    if (state.screen === 'TITLE') {
      if (this.refs.titleEloMeta) {
        const txt = `ELO ${Math.round(state.globalElo)} · ${state.story.unlockedRelics.length}/8`;
        if (this.refs.titleEloMeta.textContent !== txt) {
          this.refs.titleEloMeta.textContent = txt;
        }
      }
      if (this.refs.titleBriefingMeta) {
        const txt = `12 DOMAINS · ELO ${Math.round(state.globalElo)}`;
        if (this.refs.titleBriefingMeta.textContent !== txt) {
          this.refs.titleBriefingMeta.textContent = txt;
        }
      }
      return;
    }

    // 3. Score & Streak (Active Match / Intel Flash)
    if (this.refs.hudScore) {
      const formatted = state.playerScore.toLocaleString();
      if (this.refs.hudScore.textContent !== formatted) {
        this.refs.hudScore.textContent = formatted;
      }
    }
    if (this.refs.hudStreak) {
      this.refs.hudStreak.classList.toggle('is-cold', state.streak < 2);
      this.refs.hudStreak.classList.toggle('is-hot-streak', state.streak >= 3);
      const streakTxt = `${state.streak}× STREAK`;
      if (this.refs.hudStreak.textContent !== streakTxt) {
        this.refs.hudStreak.textContent = streakTxt;
      }
    }
    if (this.refs.hudShields && this.refs.hudShields.length > 0) {
      for (let i = 0; i < this.refs.hudShields.length; i++) {
        this.refs.hudShields[i].classList.toggle('is-broken', i >= state.shields);
      }
    }

    // 4. Active Match 60Hz Live Telemetry
    if (state.screen !== 'ACTIVE_MATCH' || !state.activeQuestion) return;
    const aq = state.activeQuestion;

    // Rival live state (drives live portrait status ring with zero DOM rebuild!)
    if (state.rival) {
      if (this.refs.rivalPill && this.refs.rivalPill.dataset.status !== state.rival.status) {
        this.refs.rivalPill.dataset.status = state.rival.status;
      }
      if (this.refs.rivalScore) {
        const rs = state.rival.score.toLocaleString();
        if (this.refs.rivalScore.textContent !== rs) this.refs.rivalScore.textContent = rs;
      }
      if (this.refs.rivalStatus && this.refs.rivalStatus.textContent !== state.rival.status) {
        this.refs.rivalStatus.textContent = state.rival.status;
      }
      if (this.refs.rivalTell) {
        const msg = state.rival.tellMessage ?? '';
        this.refs.rivalTell.classList.toggle('is-empty', !msg);
        if (this.refs.rivalTell.textContent !== msg) {
          this.refs.rivalTell.textContent = msg;
        }
      }
    }

    // Chrono-bar & countdown text
    const timeTotal = Math.max(0.1, aq.timeTotalSec);
    const timeRatio = clamp(aq.timeRemainingSec / timeTotal, 0, 1);
    const isUrgent = timeRatio <= 0.25 || aq.timeRemainingSec <= 5;
    if (this.refs.timerText) {
      const tStr = `${Math.max(0, aq.timeRemainingSec).toFixed(1)}s`;
      if (this.refs.timerText.textContent !== tStr) this.refs.timerText.textContent = tStr;
      this.refs.timerText.classList.toggle('is-urgent', isUrgent);
    }
    if (this.refs.chronoFill) {
      this.refs.chronoFill.style.transform = `scaleX(${timeRatio.toFixed(4)})`;
      this.refs.chronoFill.classList.toggle('is-urgent', isUrgent);
    }

    // Sightline active facet readout & dots
    if (this.refs.facetText) {
      const activeFacet =
        aq.facets.find((f) => f.index === aq.activeFacetIndex) ?? aq.facets[aq.activeFacetIndex];
      const eliminated = Boolean(activeFacet?.shattered || activeFacet?.redacted);
      const label = activeFacet
        ? activeFacet.redacted
          ? 'REDACTED'
          : activeFacet.shattered
            ? `${activeFacet.text} (SHATTERED)`
            : activeFacet.text
        : '—';
      if (this.refs.facetText.textContent !== label) this.refs.facetText.textContent = label;
      this.refs.facetText.classList.toggle('is-eliminated', eliminated);
    }
    if (this.refs.facetDots) {
      for (const dot of this.refs.facetDots) {
        const idx = Number(dot.dataset.facetDot);
        dot.classList.toggle('is-active', idx === aq.activeFacetIndex);
      }
    }

    // Overclock meter & label
    if (this.refs.overclockBtn) {
      const progress = clamp(aq.overclockProgress, 0, 1);
      const maxBonus = state.story.activePerks.includes('MAVERICK_GAMBIT') ? 1.25 : 1.0;
      const liveMult = 1 + progress * maxBonus;
      const peakLabel = (1 + maxBonus).toFixed(maxBonus > 1 ? 2 : 1);

      this.refs.overclockBtn.classList.toggle('is-charging', aq.overclockActive);
      this.refs.overclockBtn.classList.toggle('is-max-charge', aq.overclockActive && progress >= 0.95);
      if (this.refs.overclockFill) {
        this.refs.overclockFill.style.transform = `scaleX(${(aq.overclockActive ? progress : 0).toFixed(4)})`;
      }
      if (this.refs.overclockLabel && this.refs.overclockSub) {
        if (aq.overclockActive) {
          const isMax = progress >= 0.98;
          this.refs.overclockLabel.textContent = isMax
            ? `MAX OVERCLOCK ${liveMult.toFixed(2)}× — RELEASE!`
            : `OVERCLOCK ${liveMult.toFixed(2)}× — RELEASE TO LOCK`;
          this.refs.overclockSub.textContent = 'SLIDE HORIZONTALLY TO CANCEL';
        } else {
          this.refs.overclockLabel.textContent = 'TAP LOCK · HOLD OVERCLOCK';
          this.refs.overclockSub.textContent = `SAFE 1.0× · HOLD UP TO ${peakLabel}×`;
        }
      }
    }

    // Calibrator live numeric readout & multiplier
    if (this.refs.calibratorVal) {
      const valStr = formatCalibratorReadout(aq);
      if (this.refs.calibratorVal.textContent !== valStr) {
        this.refs.calibratorVal.textContent = valStr;
      }
    }
    if (this.refs.calibratorMult) {
      const multStr = `${aq.calibratorMultiplier.toFixed(1)}× ${getCalibratorTierWord(aq.calibratorMultiplier)}`;
      if (this.refs.calibratorMult.textContent !== multStr) {
        this.refs.calibratorMult.textContent = multStr;
      }
      this.refs.calibratorMult.classList.toggle('is-bullseye', aq.calibratorMultiplier >= 3.0);
    }

    // Codex Dual-Ring live pairings & aligned count
    if (this.refs.codexBadge) {
      const badgeTxt = `${aq.codexAlignedCount} / 3 ALIGNED`;
      if (this.refs.codexBadge.textContent !== badgeTxt) {
        this.refs.codexBadge.textContent = badgeTxt;
      }
    }
    if (this.refs.codexTopTexts) {
      for (let i = 0; i < this.refs.codexTopTexts.length; i++) {
        const txt = aq.codexOrderTop[i] ?? '—';
        if (this.refs.codexTopTexts[i].textContent !== txt) {
          this.refs.codexTopTexts[i].textContent = txt;
        }
      }
    }
    if (this.refs.codexBotTexts) {
      for (let i = 0; i < this.refs.codexBotTexts.length; i++) {
        const txt = aq.codexOrderBottom[i] ?? '—';
        if (this.refs.codexBotTexts[i].textContent !== txt) {
          this.refs.codexBotTexts[i].textContent = txt;
        }
      }
    }
  }
}
