// ============================================================================
// WORLD'S SMARTEST v5.0 — Tactile Tour Trunk Corkboard Overworld View
// ZERO 3D Globe! ZERO Jira Grid! ZERO Blur Filters! ZERO OS Color Emojis!
// Matches `mockup_v5_tour_pinboard`: Open cognac-leather & emerald-felt flight
// trunk over `tour_corkboard_bg.webp`, emerald-glass brass banker's lamp,
// 5 stamped brass luggage-tag Act tabs, Sponsor wax/brass seal, braided SVG
// gold/crimson/velvet yarn strings pinned by 3D brass tacks, organic tilted
// ephemera (Polaroids, torn pub flyers, boarding passes, wax-sealed velvet
// invites, yellow scouting call-sheet clips), slide-up Clipboard Call-Sheet
// (`STEP ONTO STAGE`), and bottom recessed brass Lucky Charm tray + Cash Clip.
// ============================================================================

import type { QuestionFormatV4 } from '../v4/contracts';
import {
  V5_CAST_CUTOUTS,
  V5_TOUR_TRUNK_SURFACE,
  V5_VENUE_STAGES,
  type BranchingCampaignSaveStateV5,
  type CampaignBracketLaneV5,
  type CampaignNodeV5,
  type ChallengerIdV5,
  type CharmIdV5,
  type PodiumCharmSpecV5,
  type SponsorFactionIdV5,
  type TourEphemeraStyleV5,
} from './contracts_v5';

// ============================================================================
// PUBLIC INTERFACES & DEFAULT CATALOGS
// ============================================================================

export type TourActNumberV5 = 1 | 2 | 3 | 4 | 5;

export interface TourChallengerSummaryV5 {
  readonly id: ChallengerIdV5;
  readonly name: string;
  readonly title: string;
  readonly hometown?: string;
  readonly accentHex?: string;
}

export interface TourNodeLaunchOptionsV5 {
  readonly acceptDare: boolean;
}

export interface TourTrunkPinboardCallbacksV5 {
  readonly onLaunchNode: (node: CampaignNodeV5, options?: TourNodeLaunchOptionsV5) => void;
  readonly onEquipCharms: (equippedCharmIds: CharmIdV5[]) => void;
  readonly onBackToGreenRoom: () => void;
  readonly onSelectAct?: (actNumber: TourActNumberV5) => void;
  readonly onSelectSponsor?: (sponsor: SponsorFactionIdV5) => void;
  readonly onPlayUiSfx?: (kind: 'click' | 'pin' | 'paper' | 'charm' | 'launch' | 'locked') => void;
}

export interface TourTrunkPinboardRenderPropsV5 {
  readonly saveState: BranchingCampaignSaveStateV5;
  readonly nodes: readonly CampaignNodeV5[];
  readonly charmsCatalog?: readonly PodiumCharmSpecV5[];
  readonly challengersById?: Readonly<Partial<Record<ChallengerIdV5, TourChallengerSummaryV5>>>;
  readonly activeAct?: TourActNumberV5;
  readonly selectedNodeId?: string | null;
  readonly actTitles?: Readonly<Partial<Record<TourActNumberV5, string>>>;
}

export const DEFAULT_ACT_TITLES_V5: Readonly<Record<TourActNumberV5, string>> = {
  1: 'Open Call',
  2: 'City Lights',
  3: 'Prime Time',
  4: 'World Circuit',
  5: 'Grand Crown',
};

export const DEFAULT_CHALLENGERS_V5: Readonly<Record<ChallengerIdV5, TourChallengerSummaryV5>> = {
  frankie_russo: {
    id: 'frankie_russo',
    name: 'Frankie Russo',
    title: 'Unbeaten Oakridge Pub-Quiz Bartender',
    hometown: 'Oakridge, Brooklyn',
    accentHex: '#f59e0b',
  },
  denise_park: {
    id: 'denise_park',
    name: 'Denise Park',
    title: 'Retired AP History Legend',
    hometown: 'Evanston, Illinois',
    accentHex: '#a78bfa',
  },
  trevor_blake: {
    id: 'trevor_blake',
    name: 'Trevor Blake',
    title: '14-Day Regional TV Streak Holder',
    hometown: 'Orlando, Florida',
    accentHex: '#38bdf8',
  },
  priya_nair: {
    id: 'priya_nair',
    name: 'Dr. Priya Nair',
    title: 'ER Trauma Physician & Crossword Champ',
    hometown: 'Boston, Massachusetts',
    accentHex: '#10b981',
  },
  alistair_finch: {
    id: 'alistair_finch',
    name: 'Lord Alistair Finch',
    title: 'Oxford Classics Fellow',
    hometown: 'Oxford, England',
    accentHex: '#e11d48',
  },
  kenji_takahashi: {
    id: 'kenji_takahashi',
    name: 'Kenji Takahashi',
    title: 'Shogi & Quiz-Bowl Speed Prodigy',
    hometown: 'Shibuya, Tokyo',
    accentHex: '#f43f5e',
  },
  nadia_al_mansoor: {
    id: 'nadia_al_mansoor',
    name: 'Nadia Al-Mansoor',
    title: 'World Memory Champion & Polyglot',
    hometown: 'Cairo, Egypt',
    accentHex: '#f5c451',
  },
  viktor_volkov: {
    id: 'viktor_volkov',
    name: 'Viktor Volkov',
    title: 'Reigning Global Grandmaster',
    hometown: 'Geneva, Switzerland',
    accentHex: '#fbbf24',
  },
};

export const DEFAULT_PODIUM_CHARMS_V5: readonly PodiumCharmSpecV5[] = [
  {
    charmId: 'frankies_coaster',
    name: 'Lucky Pub Coaster',
    tagline: "Oakridge's finest cardboard.",
    effectSummary: 'First missed 2x Double Down each match deals 0 point penalty.',
    originSource: 'Frankie Russo Alliance · Act I',
    accentHex: '#d98a36',
    svgEmblemKind: 'coaster',
  },
  {
    charmId: 'denises_red_pen',
    name: "Denise's Red Pen",
    tagline: 'Citations strictly required.',
    effectSummary: 'Auto-eliminates 1 wrong choice on History & Literature tiles.',
    originSource: 'Denise Park Alliance · Act I–II',
    accentHex: '#c92a2a',
    svgEmblemKind: 'fountain_pen',
  },
  {
    charmId: 'trevors_hot_mic',
    name: "Trevor's Hot Mic",
    tagline: 'Always live on air.',
    effectSummary: 'Adds +75 PTS broadcast heat bonus on active answer streaks.',
    originSource: 'Trevor Blake Showcase · Act II',
    accentHex: '#38bdf8',
    svgEmblemKind: 'mic',
  },
  {
    charmId: 'priyas_adrenaline',
    name: 'Adrenaline Ampoule',
    tagline: 'Steady hands under fire.',
    effectSummary: 'Awards +120 PTS clutch bonus when locking in under 5s left.',
    originSource: 'Dr. Priya Nair · Act III',
    accentHex: '#10b981',
    svgEmblemKind: 'pulse',
  },
  {
    charmId: 'alistairs_pocketwatch',
    name: 'Oxford Pocketwatch',
    tagline: 'Never rush a scholar.',
    effectSummary: 'Extends the broadcast Shot Clock by +8s on timed questions.',
    originSource: 'Lord Alistair Finch · Act IV',
    accentHex: '#e5b94c',
    svgEmblemKind: 'watch',
  },
  {
    charmId: 'kenjis_cyber_link',
    name: 'Shibuya Speed Chip',
    tagline: 'Zero-lag buzzer reflexes.',
    effectSummary: 'Grants +150 PTS fast-lock bonus for correct hits under 6s.',
    originSource: 'Kenji Takahashi · Act IV',
    accentHex: '#f43f5e',
    svgEmblemKind: 'circuit',
  },
  {
    charmId: 'nadias_astrolabe',
    name: 'Giza Astrolabe',
    tagline: 'Chart every crown wedge.',
    effectSummary: 'Adds +150 PTS bonus whenever you win a Crown Wedge tile.',
    originSource: 'Nadia Al-Mansoor · Act V',
    accentHex: '#f5c451',
    svgEmblemKind: 'astrolabe',
  },
  {
    charmId: 'grassroots_megaphone',
    name: 'Grassroots Megaphone',
    tagline: 'The crowd has your back.',
    effectSummary: 'Starts every match with +1 extra Clue brass coin on podium.',
    originSource: 'Independent Sponsor Track',
    accentHex: '#2fb36d',
    svgEmblemKind: 'megaphone',
  },
  {
    charmId: 'syndicate_golden_dice',
    name: 'Apex Golden Dice',
    tagline: 'High ratings, higher stakes.',
    effectSummary: 'Boosts winning Power Play wager payouts by +25%.',
    originSource: 'Apex Network Contract',
    accentHex: '#f59f00',
    svgEmblemKind: 'dice',
  },
  {
    charmId: 'velvet_wax_seal',
    name: 'Velvet Signet Seal',
    tagline: 'Invitation to sabotage.',
    effectSummary: 'Grants +1 extra SCREW RIVAL! token per rival showdown.',
    originSource: 'Secret Velvet Society',
    accentHex: '#a61e4d',
    svgEmblemKind: 'seal',
  },
  {
    charmId: 'underdog_chip',
    name: 'Wildcard Chip',
    tagline: 'Down, never out.',
    effectSummary: 'Awards +100 PTS comeback bonus on hits while trailing a rival.',
    originSource: 'Late-Night Redemption Circuit',
    accentHex: '#e8590c',
    svgEmblemKind: 'chip',
  },
  {
    charmId: 'screw_shield',
    name: 'Podium Brass Shield',
    tagline: 'Not on my stage.',
    effectSummary: 'Blocks the first Rival Screw or Column Freeze aimed at you.',
    originSource: 'Rival Grudge & Dares',
    accentHex: '#5c7cfa',
    svgEmblemKind: 'shield',
  },
];

interface SponsorMeta {
  readonly id: SponsorFactionIdV5;
  readonly name: string;
  readonly shortName: string;
  readonly tagline: string;
  readonly perk: string;
  readonly waxHex: string;
  readonly trimHex: string;
}

const SPONSOR_META: Readonly<Record<SponsorFactionIdV5, SponsorMeta>> = {
  INDEPENDENT: {
    id: 'INDEPENDENT',
    name: 'Independent',
    shortName: 'Independent',
    tagline: 'Self-funded grassroots crowd favorite',
    perk: 'Zero network leash, warm home-crowd applause, and grassroots fan boosts.',
    waxHex: '#156b43',
    trimHex: '#e0b965',
  },
  APEX_NETWORK: {
    id: 'APEX_NETWORK',
    name: 'Apex Network',
    shortName: 'Apex Network',
    tagline: 'Prime-time syndicate ratings powerhouse',
    perk: 'Fat broadcast purses, aggressive prime-time dares, and massive live viewership.',
    waxHex: '#1c4f94',
    trimHex: '#f5c754',
  },
  VELVET_SOCIETY: {
    id: 'VELVET_SOCIETY',
    name: 'Velvet Society',
    shortName: 'Velvet Society',
    tagline: 'Clandestine underground salons of elites',
    perk: 'High-stakes secret invitations, exotic Lucky Charms, and ruthless stage sabotage.',
    waxHex: '#8d1431',
    trimHex: '#e6b873',
  },
};

const FORMAT_SHORT_LABEL: Readonly<Record<QuestionFormatV4, string>> = {
  MULTIPLE_CHOICE: '4-Choice',
  MATCH_4: 'Cable Match',
  SORT_4: 'Timeline Sort',
  MULTI_STRIKE: 'Multi-Strike',
  PINPOINT_DIAL: 'Pinpoint Dial',
  CLUE_ESCALATOR: 'Clue Envelopes',
  VISUAL_SPOTTER: 'Visual Spotter',
};

const LANE_LABEL: Readonly<Record<CampaignBracketLaneV5, string>> = {
  MAIN_STAGE: 'Main Broadcast',
  REDEMPTION_GRIT: 'Redemption Circuit',
  VELVET_SALON: 'Secret Velvet Salon',
  SPONSOR_SHOWCASE: 'Sponsor Showcase',
  RIVAL_GRUDGE: 'Rival Grudge',
};

const TOPOLOGY_LABEL: Readonly<Record<CampaignNodeV5['topology'], string>> = {
  OPEN_TRYOUT: 'Open Stage',
  PADLOCK_NEIGHBORS: 'Chained Padlocks',
  FOG_EXPLORER: 'Stage Fog',
  SPOTLIGHT_ROULETTE: 'Spotlight Roulette',
  CROSSROADS_HYBRID: 'Crossroads Twist',
  FINALE_GAUNTLET: 'Grand Gauntlet',
};

const BOARD_TWIST_LABEL: Readonly<Record<string, string>> = {
  showcase_starter: 'Showcase Starter',
  chain_padlocks: '3D Chain Padlocks',
  spiral_labyrinth: 'Spiral Labyrinth',
  pyramid_ascent: 'Pyramid Ascent',
  fog_spotlight: 'Fog-of-War Spotlight',
  time_bomb_hot_potato: 'Time-Bomb Hot Potato',
  tug_of_war_turf: 'Tug-of-War Turf',
  velvet_x_crossroads: 'Velvet X-Crossroads',
  spotlight_roulette: 'Spotlight Roulette',
  power_play_minefield: 'Power-Play Minefield',
  ice_fire_columns: 'Ice & Fire Columns',
  gold_fever_contagion: 'Gold Fever Contagion',
  oxford_pick_ban: 'Oxford Pick & Ban',
  championship_gauntlet: 'Championship Gauntlet',
};

function resolveBoardTwistLabel(node: CampaignNodeV5): string {
  const twistId = (node as CampaignNodeV5 & { readonly boardTwistId?: string }).boardTwistId;
  if (twistId && BOARD_TWIST_LABEL[twistId]) {
    return BOARD_TWIST_LABEL[twistId];
  }
  return TOPOLOGY_LABEL[node.topology];
}

const ACT_ROMAN: Readonly<Record<TourActNumberV5, string>> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

// ============================================================================
// UTILITY HELPERS
// ============================================================================

function escapeHtml(raw: string): string {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatUsd(amount: number): string {
  const safe = Math.max(0, Math.round(Number(amount) || 0));
  if (safe >= 1_000_000) {
    const m = safe / 1_000_000;
    return `$${Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  return `$${safe.toLocaleString('en-US')}`;
}

function formatUsdFull(amount: number): string {
  const safe = Math.max(0, Math.round(Number(amount) || 0));
  return `$${safe.toLocaleString('en-US')}`;
}

function formatAudience(viewers: number): string {
  const safe = Math.max(0, Math.round(Number(viewers) || 0));
  if (safe >= 1_000_000_000) {
    const b = safe / 1_000_000_000;
    return `${b >= 10 ? b.toFixed(0) : Number(b.toFixed(2))}B`;
  }
  if (safe >= 1_000_000) {
    const m = safe / 1_000_000;
    return `${m >= 100 ? Math.round(m) : Number(m.toFixed(1))}M`;
  }
  if (safe >= 10_000) {
    const k = safe / 1_000;
    return `${k >= 100 ? Math.round(k) : Number(k.toFixed(1))}K`;
  }
  if (safe >= 1_000) {
    return `${Number((safe / 1_000).toFixed(1))}K`;
  }
  return safe.toLocaleString('en-US');
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function cityToAirportCode(cityStamp: string): string {
  const cleaned = cityStamp.replace(/[^a-zA-Z\s]/g, ' ').trim().toUpperCase();
  if (!cleaned) return 'AIR';
  const known: Readonly<Record<string, string>> = {
    'NEW YORK': 'NYC',
    'BROOKLYN': 'NYC',
    'OAKRIDGE': 'NYC',
    'LONDON': 'LDN',
    'OXFORD': 'OXF',
    'TOKYO': 'TYO',
    'SHIBUYA': 'TYO',
    'CAIRO': 'CAI',
    'GIZA': 'CAI',
    'GENEVA': 'GVA',
    'BOSTON': 'BOS',
    'ORLANDO': 'MCO',
    'CHICAGO': 'CHI',
    'EVANSTON': 'CHI',
    'PARIS': 'PAR',
    'GLOBAL': 'WLD',
  };
  for (const [key, code] of Object.entries(known)) {
    if (cleaned.includes(key)) return code;
  }
  const words = cleaned.split(/\s+/);
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).slice(0, 3);
  }
  if (words.length === 2 && words[0].length >= 2) {
    return (words[0].slice(0, 2) + words[1].slice(0, 1)).slice(0, 3);
  }
  return cleaned.slice(0, 3).padEnd(3, 'X');
}

function affinityDescriptor(score: number): { label: string; toneClass: string } {
  if (score >= 45) return { label: 'Sworn Ally', toneClass: 'is-ally' };
  if (score >= 15) return { label: 'Warm Respect', toneClass: 'is-warm' };
  if (score <= -45) return { label: 'Bitter Grudge', toneClass: 'is-grudge' };
  if (score <= -15) return { label: 'Heated Rival', toneClass: 'is-tense' };
  return { label: 'Rival Contender', toneClass: 'is-neutral' };
}

// ============================================================================
// CUSTOM INLINE SVG CRAFT (ZERO OS EMOJIS! 100% TACTILE METALLIC & INK ART)
// ============================================================================

function renderBankersLampSvg(): string {
  return `
    <svg class="v5pb-lamp-svg" viewBox="0 0 180 132" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="v5pbLampGlass" x1="12%" y1="6%" x2="88%" y2="94%">
          <stop offset="0%" stop-color="#0a4a24"/>
          <stop offset="28%" stop-color="#198749"/>
          <stop offset="52%" stop-color="#47c777"/>
          <stop offset="72%" stop-color="#14733c"/>
          <stop offset="100%" stop-color="#07341a"/>
        </linearGradient>
        <linearGradient id="v5pbLampSpec" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#a8f5c1" stop-opacity="0.08"/>
          <stop offset="35%" stop-color="#d7ffe3" stop-opacity="0.72"/>
          <stop offset="65%" stop-color="#8beaa8" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="v5pbLampBulb" cx="50%" cy="46%" r="54%">
          <stop offset="0%" stop-color="#fffef0"/>
          <stop offset="38%" stop-color="#ffea99"/>
          <stop offset="75%" stop-color="#f2a93b" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#f2a93b" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="v5pbBrassVert" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6e4d18"/>
          <stop offset="28%" stop-color="#e8c873"/>
          <stop offset="52%" stop-color="#fff1b8"/>
          <stop offset="76%" stop-color="#b3842d"/>
          <stop offset="100%" stop-color="#4e350d"/>
        </linearGradient>
        <radialGradient id="v5pbBrassBase" cx="42%" cy="38%" r="60%">
          <stop offset="0%" stop-color="#fff0b3"/>
          <stop offset="36%" stop-color="#d7ac4d"/>
          <stop offset="74%" stop-color="#875f1a"/>
          <stop offset="100%" stop-color="#422c09"/>
        </radialGradient>
      </defs>
      <!-- Warm cast shadow under brass base -->
      <ellipse cx="64" cy="112" rx="44" ry="16" fill="rgba(8,4,1,0.58)"/>
      <!-- Turned brass pedestal base -->
      <ellipse cx="64" cy="104" rx="39" ry="20" fill="url(#v5pbBrassBase)" stroke="#3e2808" stroke-width="1.6"/>
      <ellipse cx="64" cy="100" rx="30" ry="14" fill="none" stroke="rgba(255,243,194,0.45)" stroke-width="1.2"/>
      <ellipse cx="64" cy="96" rx="19" ry="9" fill="url(#v5pbBrassBase)" stroke="#614212" stroke-width="1.2"/>
      <!-- Turned brass stem -->
      <path d="M55 94 C54 84 57 76 58 64 L70 64 C71 76 74 84 73 94 Z" fill="url(#v5pbBrassVert)" stroke="#4c330c" stroke-width="1.1"/>
      <ellipse cx="64" cy="82" rx="11" ry="4.5" fill="url(#v5pbBrassVert)" stroke="#4c330c" stroke-width="0.9"/>
      <!-- Left brass hinge bracket -->
      <path d="M12 42 C6 42 4 47 9 50 L26 52 L28 45 Z" fill="url(#v5pbBrassVert)" stroke="#432c0a" stroke-width="1"/>
      <circle cx="11" cy="45" r="4.5" fill="url(#v5pbBrassBase)" stroke="#432c0a" stroke-width="0.9"/>
      <!-- Warm incandescent glow under emerald shade -->
      <ellipse cx="92" cy="68" rx="68" ry="22" fill="url(#v5pbLampBulb)"/>
      <!-- Underside white-gold milk glass inner liner -->
      <path d="M23 64 Q94 74 163 59 L154 48 Q92 56 32 51 Z" fill="#fff7d2" opacity="0.92"/>
      <ellipse cx="89" cy="63" rx="22" ry="8" fill="#ffffff" opacity="0.95"/>
      <!-- Pull chain + brass acorn bell -->
      <line x1="126" y1="62" x2="126" y2="103" stroke="#e4be63" stroke-width="1.8" stroke-dasharray="2.4 2"/>
      <path d="M121 103 L131 103 L129 111 Q126 114 123 111 Z" fill="url(#v5pbBrassVert)" stroke="#50350c" stroke-width="0.8"/>
      <!-- Sculpted Emerald Glass Hood -->
      <path d="M22 61 C24 27 42 12 68 11 L132 11 C154 12 167 30 165 58 C126 67 60 68 22 61 Z"
            fill="url(#v5pbLampGlass)" stroke="#062c15" stroke-width="1.8"/>
      <!-- Emerald specular gloss curve -->
      <path d="M35 28 C58 17 118 16 146 26 C126 24 62 25 35 34 Z" fill="url(#v5pbLampSpec)"/>
      <!-- Lower emerald glass rim bevel -->
      <path d="M23 60 C62 67 125 66 164 57" fill="none" stroke="#85e8a6" stroke-width="1.4" opacity="0.6"/>
      <!-- Top brass ferrule cap -->
      <path d="M84 11 C84 6 106 6 106 11 Z" fill="url(#v5pbBrassVert)" stroke="#4c330c" stroke-width="1"/>
    </svg>
  `;
}

function renderStarSvg(earned: boolean, size = 20): string {
  if (earned) {
    return `
      <svg class="v5pb-star-svg is-earned" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id="v5pbStarGold" x1="15%" y1="5%" x2="85%" y2="95%">
            <stop offset="0%" stop-color="#fff4b8"/>
            <stop offset="38%" stop-color="#f7c948"/>
            <stop offset="76%" stop-color="#c98515"/>
            <stop offset="100%" stop-color="#7c4a06"/>
          </linearGradient>
        </defs>
        <path d="M12 2.2 L14.9 8.2 L21.5 9.1 L16.7 13.7 L17.9 20.3 L12 17.1 L6.1 20.3 L7.3 13.7 L2.5 9.1 L9.1 8.2 Z"
              fill="url(#v5pbStarGold)" stroke="#5c3304" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M12 3.8 L14.2 8.4 L19.1 9.1 L12 12.1 Z" fill="rgba(255,255,240,0.45)"/>
      </svg>
    `;
  }
  return `
    <svg class="v5pb-star-svg is-empty" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 L14.8 8.3 L21.2 9.2 L16.6 13.7 L17.7 20.1 L12 17 L6.3 20.1 L7.4 13.7 L2.8 9.2 L9.2 8.3 Z"
            fill="rgba(46,32,16,0.28)" stroke="rgba(138,104,52,0.72)" stroke-width="1.3" stroke-linejoin="round"/>
    </svg>
  `;
}

function renderPadlockSvg(size = 16): string {
  return `
    <svg class="v5pb-padlock-svg" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 10 V7.5 C7 4.6 9.2 2.5 12 2.5 C14.8 2.5 17 4.6 17 7.5 V10"
            fill="none" stroke="#d9b465" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="4.5" y="10" width="15" height="11.5" rx="2.4" fill="#9a7229" stroke="#3c2607" stroke-width="1.3"/>
      <rect x="6" y="11.4" width="12" height="3.2" rx="1" fill="rgba(255,241,189,0.32)"/>
      <circle cx="12" cy="15.2" r="1.7" fill="#2d1a05"/>
      <path d="M11.3 16.4 L12.7 16.4 L12.4 19.3 L11.6 19.3 Z" fill="#2d1a05"/>
    </svg>
  `;
}

function renderWaxSealSvg(size = 44, hex = '#9a1728'): string {
  return `
    <svg class="v5pb-wax-svg" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="v5pbWaxGrad" cx="36%" cy="30%" r="68%">
          <stop offset="0%" stop-color="#e34257"/>
          <stop offset="38%" stop-color="${hex}"/>
          <stop offset="82%" stop-color="#5d0914"/>
          <stop offset="100%" stop-color="#38040b"/>
        </radialGradient>
      </defs>
      <!-- Organic melted wax rim -->
      <path d="M32 4 C40 3 47 7 52 12 C58 18 61 25 59 33 C58 41 56 49 49 54 C42 59 34 61 25 59 C17 57 9 52 6 44 C3 36 4 27 8 19 C12 11 22 5 32 4 Z"
            fill="url(#v5pbWaxGrad)" stroke="#3e050d" stroke-width="1.5"/>
      <!-- Recessed stamped ring -->
      <circle cx="32" cy="32" r="19" fill="none" stroke="rgba(255,190,196,0.34)" stroke-width="2"/>
      <circle cx="32" cy="32" r="17" fill="rgba(64,6,14,0.35)" stroke="rgba(255,156,166,0.22)" stroke-width="1"/>
      <!-- Embossed laurel & crown crest -->
      <path d="M23 37 C21 30 24 23 32 20 C40 23 43 30 41 37" fill="none" stroke="#f09aa6" stroke-width="2.1" stroke-linecap="round"/>
      <path d="M26 36 L32 24 L38 36 Z" fill="none" stroke="#ffd2d8" stroke-width="1.7" stroke-linejoin="round"/>
      <circle cx="32" cy="21" r="2.2" fill="#ffd2d8"/>
      <!-- Specular wax shine -->
      <path d="M18 17 C22 12 30 10 38 11" fill="none" stroke="rgba(255,225,228,0.48)" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `;
}

function renderSponsorEmblemSvg(sponsor: SponsorFactionIdV5, size = 24): string {
  if (sponsor === 'APEX_NETWORK') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="12.5" fill="#163d73" stroke="#f2c451" stroke-width="1.6"/>
        <path d="M14 5 L21 20 L16.8 20 L14 13.6 L11.2 20 L7 20 Z" fill="#f7d577"/>
        <circle cx="14" cy="19.2" r="1.9" fill="#59c3ff"/>
      </svg>
    `;
  }
  if (sponsor === 'VELVET_SOCIETY') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="12.5" fill="#7c102a" stroke="#e6b873" stroke-width="1.6"/>
        <path d="M8 18 L10 10 L14 14 L18 10 L20 18 Z" fill="#f6d186" stroke="#470715" stroke-width="0.9"/>
        <circle cx="14" cy="9" r="1.6" fill="#ff9eb5"/>
      </svg>
    `;
  }
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="12.5" fill="#125937" stroke="#e4be66" stroke-width="1.6"/>
      <path d="M9 19 C7 14 9 9 14 7 C19 9 21 14 19 19" fill="none" stroke="#f5d78e" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M14 8 L15.4 12.2 L19.6 12.2 L16.2 14.7 L17.4 18.8 L14 16.4 L10.6 18.8 L11.8 14.7 L8.4 12.2 L12.6 12.2 Z" fill="#f5d78e"/>
    </svg>
  `;
}

function renderCharmArtifactSvg(kind: PodiumCharmSpecV5['svgEmblemKind'], accentHex: string, size = 46): string {
  switch (kind) {
    case 'watch':
      return `
        <svg class="v5pb-charm-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="10" r="5" fill="none" stroke="#d8ae4e" stroke-width="3"/>
          <rect x="28.5" y="12" width="7" height="5" rx="1.5" fill="#c79734" stroke="#53380b" stroke-width="1"/>
          <circle cx="32" cy="37" r="22" fill="#b7882c" stroke="#4f3509" stroke-width="2"/>
          <circle cx="32" cy="37" r="18.5" fill="#f6ebd2" stroke="#7c5817" stroke-width="1.5"/>
          <circle cx="32" cy="37" r="14.5" fill="none" stroke="#9e762b" stroke-width="0.9" stroke-dasharray="1.8 3.2"/>
          <circle cx="32" cy="45" r="4.2" fill="none" stroke="#805b1a" stroke-width="0.9"/>
          <line x1="32" y1="37" x2="32" y2="25" stroke="#261708" stroke-width="2.2" stroke-linecap="round"/>
          <line x1="32" y1="37" x2="41" y2="33" stroke="#261708" stroke-width="1.8" stroke-linecap="round"/>
          <circle cx="32" cy="37" r="2.3" fill="#c7942a"/>
        </svg>
      `;
    case 'fountain_pen':
      return `
        <svg class="v5pb-charm-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
          <g transform="rotate(-42 32 32)">
            <path d="M12 32 L21 27.5 L21 36.5 Z" fill="#f2cf72" stroke="#54380a" stroke-width="1.2"/>
            <line x1="12" y1="32" x2="18.5" y2="32" stroke="#4e3107" stroke-width="1"/>
            <rect x="21" y="26.5" width="7" height="11" rx="1.5" fill="#1e1510"/>
            <rect x="28" y="26" width="24" height="12" rx="5" fill="#9c1922" stroke="#42090e" stroke-width="1.3"/>
            <rect x="33" y="26" width="4" height="12" fill="#f0c863"/>
            <rect x="29" y="28.2" width="21" height="2.4" rx="1" fill="rgba(255,214,218,0.42)"/>
            <path d="M35 25 L50 25 L52 27.5 L35 27.5 Z" fill="#ebd07e"/>
          </g>
        </svg>
      `;
    case 'coaster':
      return `
        <svg class="v5pb-charm-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="25" fill="#c28e53" stroke="#5e3a15" stroke-width="2"/>
          <circle cx="32" cy="32" r="21" fill="none" stroke="#6c4318" stroke-width="1.3" stroke-dasharray="3 2"/>
          <circle cx="32" cy="32" r="16" fill="#b47e42" stroke="#7d4f1e" stroke-width="1"/>
          <text x="32" y="28" text-anchor="middle" fill="#4f2c0b" font-family="Cinzel, Georgia, serif" font-weight="800" font-size="8">LUCKY</text>
          <text x="32" y="37" text-anchor="middle" fill="#4f2c0b" font-family="Cinzel, Georgia, serif" font-weight="800" font-size="7.5">PUB</text>
          <text x="32" y="45" text-anchor="middle" fill="#633a12" font-family="Cinzel, Georgia, serif" font-weight="700" font-size="6">COASTER</text>
        </svg>
      `;
    case 'mic':
      return `
        <svg class="v5pb-charm-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
          <rect x="22" y="10" width="20" height="27" rx="10" fill="#d9e2ec" stroke="#475569" stroke-width="2"/>
          <line x1="23" y1="18" x2="41" y2="18" stroke="#52606d" stroke-width="1.6"/>
          <line x1="22" y1="23" x2="42" y2="23" stroke="#52606d" stroke-width="1.6"/>
          <line x1="23" y1="28" x2="41" y2="28" stroke="#52606d" stroke-width="1.6"/>
          <path d="M16 27 C16 38 23 44 32 44 C41 44 48 38 48 27" fill="none" stroke="#d7aa44" stroke-width="3" stroke-linecap="round"/>
          <rect x="29" y="44" width="6" height="9" fill="#c79530"/>
          <ellipse cx="32" cy="54" rx="14" ry="4" fill="#a8791f" stroke="#4f3509" stroke-width="1.3"/>
          <circle cx="32" cy="32" r="2.5" fill="${accentHex}"/>
        </svg>
      `;
    case 'pulse':
      return `
        <svg class="v5pb-charm-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
          <rect x="23" y="12" width="18" height="40" rx="9" fill="#0f3d2e" stroke="#d8b053" stroke-width="2.2"/>
          <rect x="26" y="25" width="12" height="24" rx="6" fill="#23d38f" opacity="0.88"/>
          <path d="M18 33 L25 33 L28 24 L33 41 L37 30 L40 33 L46 33" fill="none" stroke="#fff7d4" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="27" y="7" width="10" height="6" rx="2" fill="#d8b053" stroke="#573a0a" stroke-width="1"/>
        </svg>
      `;
    case 'circuit':
      return `
        <svg class="v5pb-charm-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
          <polygon points="32,8 52,19 52,45 32,56 12,45 12,19" fill="#25132a" stroke="#e8b853" stroke-width="2.2"/>
          <polygon points="32,14 46,22 46,42 32,50 18,42 18,22" fill="none" stroke="${accentHex}" stroke-width="1.6"/>
          <path d="M24 32 H30 L34 24 L38 38 L42 32" fill="none" stroke="#ffd873" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="24" cy="32" r="2.2" fill="#ff7392"/>
          <circle cx="42" cy="32" r="2.2" fill="#ff7392"/>
        </svg>
      `;
    case 'astrolabe':
      return `
        <svg class="v5pb-charm-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="9" r="3.8" fill="none" stroke="#e4bc5b" stroke-width="2.2"/>
          <circle cx="32" cy="35" r="22" fill="none" stroke="#d8aa43" stroke-width="3.2"/>
          <circle cx="32" cy="35" r="15" fill="rgba(26,18,7,0.45)" stroke="#f5d57e" stroke-width="1.5"/>
          <ellipse cx="32" cy="35" rx="20" ry="8" fill="none" stroke="#d8aa43" stroke-width="1.5" transform="rotate(-25 32 35)"/>
          <line x1="14" y1="45" x2="50" y2="25" stroke="#fff0b5" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="32" cy="35" r="3.4" fill="#f5c451" stroke="#533708" stroke-width="1.1"/>
        </svg>
      `;
    case 'megaphone':
      return `
        <svg class="v5pb-charm-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
          <path d="M14 28 L46 15 L46 47 L14 35 Z" fill="#d9ad48" stroke="#4f3509" stroke-width="2" stroke-linejoin="round"/>
          <ellipse cx="46" cy="31" rx="4.5" ry="16" fill="#235c3d" stroke="#4f3509" stroke-width="1.6"/>
          <path d="M19 36 L23 50 L30 48 L26 38" fill="#825615" stroke="#442b06" stroke-width="1.5"/>
          <path d="M53 24 C57 28 57 34 53 38" fill="none" stroke="#6ee7b7" stroke-width="2.4" stroke-linecap="round"/>
        </svg>
      `;
    case 'dice':
      return `
        <svg class="v5pb-charm-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
          <rect x="11" y="17" width="27" height="27" rx="5" fill="#f2c85b" stroke="#5a3b08" stroke-width="2" transform="rotate(-10 24 30)"/>
          <rect x="27" y="21" width="27" height="27" rx="5" fill="#d89d26" stroke="#5a3b08" stroke-width="2" transform="rotate(11 40 34)"/>
          <circle cx="20" cy="25" r="2.2" fill="#3a2104"/>
          <circle cx="28" cy="35" r="2.2" fill="#3a2104"/>
          <circle cx="36" cy="29" r="2.2" fill="#3a2104"/>
          <circle cx="44" cy="39" r="2.2" fill="#3a2104"/>
          <circle cx="40" cy="34" r="2.2" fill="#3a2104"/>
        </svg>
      `;
    case 'seal':
      return renderWaxSealSvg(size, accentHex);
    case 'chip':
      return `
        <svg class="v5pb-charm-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="24" fill="#9c2414" stroke="#f0c869" stroke-width="2.4"/>
          <circle cx="32" cy="32" r="19" fill="none" stroke="#fff1cc" stroke-width="3.6" stroke-dasharray="5 6"/>
          <circle cx="32" cy="32" r="13" fill="#4f1209" stroke="#e6b852" stroke-width="1.5"/>
          <path d="M32 23 L34.6 28.8 L41 29.5 L36.2 33.8 L37.6 40 L32 36.8 L26.4 40 L27.8 33.8 L23 29.5 L29.4 28.8 Z" fill="#f7d371"/>
        </svg>
      `;
    case 'shield':
    default:
      return `
        <svg class="v5pb-charm-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
          <path d="M32 7 L52 15 V31 C52 44 43 53 32 58 C21 53 12 44 12 31 V15 Z"
                fill="#1d386a" stroke="#e4bc5b" stroke-width="2.6" stroke-linejoin="round"/>
          <path d="M32 13 L46 19 V31 C46 40 40 47 32 51 C24 47 18 40 18 31 V19 Z"
                fill="none" stroke="${accentHex}" stroke-width="1.5"/>
          <path d="M32 17 V48 M21 29 H43" stroke="#f5d57d" stroke-width="2.4" stroke-linecap="round"/>
        </svg>
      `;
  }
}

function renderCashStackSvg(): string {
  return `
    <svg class="v5pb-cash-svg" viewBox="0 0 116 86" aria-hidden="true">
      <defs>
        <linearGradient id="v5pbBillPaper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#dce5d5"/>
          <stop offset="50%" stop-color="#c3d2ba"/>
          <stop offset="100%" stop-color="#9cb092"/>
        </linearGradient>
        <linearGradient id="v5pbClipMetal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6b4d16"/>
          <stop offset="22%" stop-color="#d8b256"/>
          <stop offset="48%" stop-color="#fff0b3"/>
          <stop offset="76%" stop-color="#ad8129"/>
          <stop offset="100%" stop-color="#53390b"/>
        </linearGradient>
      </defs>
      <!-- Stacked currency layers -->
      <rect x="14" y="4" width="88" height="74" rx="3" fill="#7c8f73" stroke="#3c4a37" stroke-width="1.2"/>
      <rect x="11" y="7" width="88" height="74" rx="3" fill="#9eb194" stroke="#3c4a37" stroke-width="1.2"/>
      <rect x="8" y="10" width="88" height="72" rx="3" fill="url(#v5pbBillPaper)" stroke="#354630" stroke-width="1.4"/>
      <!-- Engraved bill border & denomination -->
      <rect x="14" y="15" width="76" height="62" rx="2" fill="none" stroke="#445c3e" stroke-width="1.3"/>
      <rect x="17" y="18" width="70" height="56" rx="1" fill="none" stroke="#5c7754" stroke-width="0.7" stroke-dasharray="2 2"/>
      <text x="21" y="29" fill="#2e452a" font-family="Cinzel, Georgia, serif" font-weight="800" font-size="11">100</text>
      <text x="82" y="29" text-anchor="end" fill="#2e452a" font-family="Cinzel, Georgia, serif" font-weight="800" font-size="11">100</text>
      <ellipse cx="52" cy="40" rx="15" ry="11" fill="none" stroke="#476141" stroke-width="1.1"/>
      <!-- Heavy brushed-brass money clip -->
      <rect x="4" y="34" width="98" height="24" rx="4" fill="rgba(16,9,2,0.42)" transform="translate(0,4)"/>
      <rect x="4" y="34" width="98" height="23" rx="4" fill="url(#v5pbClipMetal)" stroke="#4c3309" stroke-width="1.4"/>
      <line x1="8" y1="38" x2="98" y2="38" stroke="rgba(255,248,214,0.6)" stroke-width="1"/>
      <line x1="8" y1="53" x2="98" y2="53" stroke="rgba(68,42,6,0.45)" stroke-width="1"/>
    </svg>
  `;
}

function renderAudienceSignalSvg(size = 15): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="2.7" fill="#46e09a"/>
      <path d="M7.8 8.2 C5.7 10.3 5.7 13.7 7.8 15.8 M16.2 8.2 C18.3 10.3 18.3 13.7 16.2 15.8"
            fill="none" stroke="#8ff0c1" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M4.8 5.2 C1.4 8.9 1.4 15.1 4.8 18.8 M19.2 5.2 C22.6 8.9 22.6 15.1 19.2 18.8"
            fill="none" stroke="#e4c267" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
  `;
}

function renderBackLatchSvg(): string {
  return `
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="9" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
  `;
}

function renderFullscreenSvg(isFullscreen: boolean): string {
  if (isFullscreen) {
    return `
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 4 V9 H4 M15 4 V9 H20 M9 20 V15 H4 M15 20 V15 H20"
              fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
  return `
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9 V4 H9 M20 9 V4 H15 M4 15 V20 H9 M20 15 V20 H15"
            fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

// ============================================================================
// SCOPED STYLES (`<style id="v5-pinboard-styles">`)
// Strict Rules: ZERO blur filters, ZERO horizontal overflow, ZERO flat boxes
// ============================================================================

const PINBOARD_STYLE_ID = 'v5-pinboard-styles';

export function ensureTourPinboardStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(PINBOARD_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = PINBOARD_STYLE_ID;
  style.textContent = `
    /* ===== SHELL & MAHOGANY DESK BACKDROP ===== */
    .v5pb-shell,
    .v5pb-shell * {
      box-sizing: border-box;
    }

    .v5pb-shell {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 100dvh;
      max-width: 100vw;
      overflow-x: hidden;
      overflow-y: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: stretch;
      padding: max(6px, env(safe-area-inset-top)) 6px max(6px, env(safe-area-inset-bottom));
      background-color: #160a05;
      background-image:
        radial-gradient(ellipse 68% 54% at 14% 8%, rgba(255, 206, 102, 0.24) 0%, rgba(16, 8, 4, 0) 64%),
        radial-gradient(ellipse 100% 100% at 50% 50%, rgba(20, 9, 4, 0.34) 20%, rgba(8, 3, 1, 0.88) 100%),
        var(--v5pb-trunk-bg);
      background-size: cover;
      background-position: center;
      color: #f8eed9;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    /* ===== OPEN COGNAC-LEATHER & EMERALD-FELT FLIGHT TRUNK ===== */
    .v5pb-trunk {
      position: relative;
      width: 100%;
      max-width: 1220px;
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      padding: 10px;
      background:
        linear-gradient(155deg, #8b4c21 0%, #683313 38%, #472009 78%, #2e1205 100%);
      box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.82),
        inset 0 2px 2px rgba(255, 211, 152, 0.34),
        inset 0 -3px 6px rgba(18, 6, 1, 0.72);
      border: 2px solid #2b1206;
    }

    /* Stitched leather seam */
    .v5pb-trunk::before {
      content: '';
      position: absolute;
      inset: 4px;
      border-radius: 12px;
      border: 1.5px dashed rgba(242, 189, 118, 0.34);
      pointer-events: none;
      z-index: 1;
    }

    /* Brass corner protectors */
    .v5pb-corner {
      position: absolute;
      width: 24px;
      height: 24px;
      z-index: 8;
      pointer-events: none;
      background: linear-gradient(135deg, #f5da89 0%, #bd8d31 52%, #5d3f0d 100%);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 250, 214, 0.72);
    }
    .v5pb-corner::after {
      content: '';
      position: absolute;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #fff5c8, #6d4a11);
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
    }
    .v5pb-corner.is-tl {
      top: -1px; left: -1px;
      border-radius: 15px 0 10px 0;
      clip-path: polygon(0 0, 100% 0, 100% 38%, 38% 38%, 38% 100%, 0 100%);
    }
    .v5pb-corner.is-tl::after { top: 4px; left: 4px; }
    .v5pb-corner.is-tr {
      top: -1px; right: -1px;
      border-radius: 0 15px 0 10px;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 62% 100%, 62% 38%, 0 38%);
    }
    .v5pb-corner.is-tr::after { top: 4px; right: 4px; }
    .v5pb-corner.is-bl {
      bottom: -1px; left: -1px;
      border-radius: 0 10px 0 15px;
      clip-path: polygon(0 0, 38% 0, 38% 62%, 100% 62%, 100% 100%, 0 100%);
    }
    .v5pb-corner.is-bl::after { bottom: 4px; left: 4px; }
    .v5pb-corner.is-br {
      bottom: -1px; right: -1px;
      border-radius: 10px 0 15px 0;
      clip-path: polygon(62% 0, 100% 0, 100% 100%, 0 100%, 0 62%, 62% 62%);
    }
    .v5pb-corner.is-br::after { bottom: 4px; right: 4px; }

    /* Side brass trunk hinges & latches (subtle decorative silhouette) */
    .v5pb-side-clasp {
      position: absolute;
      width: 7px;
      height: 28px;
      border-radius: 3px;
      background: linear-gradient(180deg, #f4d884 0%, #b08026 55%, #5e400c 100%);
      border: 1px solid #3c2706;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.55);
      pointer-events: none;
      z-index: 8;
    }
    .v5pb-side-clasp.is-left-1 { left: -3px; top: 24%; }
    .v5pb-side-clasp.is-left-2 { left: -3px; bottom: 26%; }
    .v5pb-side-clasp.is-right-1 { right: -3px; top: 22%; }
    .v5pb-side-clasp.is-right-2 { right: -3px; bottom: 24%; }

    /* Emerald Velvet Inner Trunk Frame */
    .v5pb-felt-frame {
      position: relative;
      z-index: 2;
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      border-radius: 9px;
      background: linear-gradient(180deg, #0d5030 0%, #093c23 50%, #062817 100%);
      box-shadow:
        inset 0 3px 10px rgba(0, 0, 0, 0.72),
        inset 0 0 0 1.5px rgba(72, 189, 127, 0.2),
        0 1px 0 rgba(255, 224, 168, 0.22);
    }

    /* ===== TOP CROWN: BANKER'S LAMP, BACK LATCH, 5 BRASS ACT LUGGAGE TAGS & SPONSOR SEAL ===== */
    .v5pb-header {
      position: relative;
      z-index: 12;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 6px 10px;
      padding: 2px 4px 2px;
      min-height: 46px;
    }

    .v5pb-lamp-mount {
      position: absolute;
      top: -18px;
      left: -12px;
      width: 118px;
      height: 86px;
      pointer-events: none;
      z-index: 16;
      filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.68));
    }

    .v5pb-lamp-svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .v5pb-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-left: 88px;
      z-index: 17;
    }

    .v5pb-back-latch {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 38px;
      padding: 6px 12px 6px 9px;
      border-radius: 7px;
      border: 1.5px solid #4a3008;
      background: linear-gradient(180deg, #ebd07f 0%, #bc8b2f 54%, #825b16 100%);
      color: #211203;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow:
        0 3px 8px rgba(0, 0, 0, 0.56),
        inset 0 1px 1px rgba(255, 250, 217, 0.78);
      transition: transform 0.14s ease, filter 0.14s ease;
    }
    .v5pb-back-latch:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
    .v5pb-back-latch:active {
      transform: translateY(1px);
    }
    .v5pb-back-latch:focus-visible {
      outline: 2px solid #fff0a8;
      outline-offset: 2px;
    }

    /* 5 Stamped Brass Luggage-Tag Act Tabs */
    .v5pb-act-rail {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 5px;
      flex: 1 1 320px;
      max-width: 580px;
      z-index: 17;
    }

    .v5pb-act-tag {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1px;
      min-height: 40px;
      padding: 5px 4px 4px;
      border: none;
      cursor: pointer;
      color: #e6d1a3;
      background: linear-gradient(180deg, #5e441e 0%, #3d2a10 56%, #2a1b08 100%);
      clip-path: polygon(8px 0%, calc(100% - 8px) 0%, 100% 10px, 100% 100%, 0% 100%, 0% 10px);
      box-shadow: inset 0 1px 0 rgba(255, 224, 152, 0.25);
      transition: transform 0.15s ease, filter 0.15s ease;
    }
    /* Tiny brass luggage grommet hole */
    .v5pb-act-tag::before {
      content: '';
      position: absolute;
      top: 3px;
      left: 50%;
      transform: translateX(-50%);
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #140b03;
      border: 1px solid rgba(242, 207, 122, 0.55);
    }
    .v5pb-act-tag:hover {
      filter: brightness(1.14);
      transform: translateY(-1px);
    }
    .v5pb-act-tag:focus-visible {
      outline: 2px solid #ffe999;
      outline-offset: 1px;
    }
    .v5pb-act-tag.is-active {
      background: linear-gradient(180deg, #f8df93 0%, #ce9c3b 52%, #986b1a 100%);
      color: #211203;
      box-shadow:
        0 4px 12px rgba(245, 196, 81, 0.34),
        inset 0 1px 1px rgba(255, 252, 224, 0.85);
    }
    .v5pb-act-tag.is-locked {
      opacity: 0.72;
      background: linear-gradient(180deg, #3f3120 0%, #271d12 100%);
      color: #bda882;
    }
    .v5pb-act-tag.is-locked.is-active {
      opacity: 1;
      background: linear-gradient(180deg, #c2a05b 0%, #866529 100%);
      color: #1f1305;
    }

    .v5pb-act-tag-num {
      margin-top: 5px;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      line-height: 1.05;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    .v5pb-act-tag-meta {
      font-size: 9.5px;
      font-weight: 700;
      opacity: 0.86;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    /* Sponsor Contract Seal & Fullscreen Brass Toggle */
    .v5pb-header-right {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      z-index: 17;
    }

    .v5pb-fs-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      flex-shrink: 0;
      border-radius: 8px;
      border: 1.5px solid #4a3008;
      background: linear-gradient(180deg, #ebd07f 0%, #bc8b2f 54%, #825b16 100%);
      color: #211203;
      cursor: pointer;
      box-shadow:
        0 3px 8px rgba(0, 0, 0, 0.56),
        inset 0 1px 1px rgba(255, 250, 217, 0.78);
      transition: transform 0.14s ease, filter 0.14s ease;
    }
    .v5pb-fs-btn:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
    .v5pb-fs-btn:active {
      transform: translateY(1px);
    }
    .v5pb-fs-btn:focus-visible {
      outline: 2px solid #fff0a8;
      outline-offset: 2px;
    }

    .v5pb-sponsor-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 38px;
      padding: 4px 10px 4px 6px;
      border-radius: 999px;
      border: 1.5px solid #d5ab54;
      background: linear-gradient(180deg, #3c2210 0%, #231106 100%);
      color: #faeccd;
      cursor: pointer;
      box-shadow: 0 3px 9px rgba(0, 0, 0, 0.56), inset 0 1px 0 rgba(255, 232, 166, 0.3);
      transition: transform 0.14s ease, filter 0.14s ease;
      z-index: 17;
    }
    .v5pb-sponsor-btn:hover {
      filter: brightness(1.12);
      transform: translateY(-1px);
    }
    .v5pb-sponsor-btn:focus-visible {
      outline: 2px solid #ffe999;
      outline-offset: 2px;
    }
    .v5pb-sponsor-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.08;
    }
    .v5pb-sponsor-kicker {
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: #d6b267;
      font-weight: 700;
    }
    .v5pb-sponsor-name {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 11px;
      font-weight: 700;
      color: #fff3d6;
      white-space: nowrap;
    }

    /* ===== CORKBOARD INTERIOR VIEWPORT & STAGE ===== */
    .v5pb-board-frame {
      position: relative;
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      border-radius: 6px;
      border: 5px solid #492811;
      box-shadow:
        inset 0 6px 20px rgba(0, 0, 0, 0.78),
        0 2px 0 rgba(255, 214, 152, 0.16);
      overflow: hidden;
      background-color: #361e0f;
    }

    /* Pure cork interior grain cropped seamlessly from tour_corkboard_bg.webp */
    .v5pb-cork-tex {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background-color: #361e0f;
      background-image: var(--v5pb-trunk-bg);
      background-size: cover;
      background-position: 50.5% 51%;
      background-repeat: no-repeat;
      transform: scale(2.18);
      transform-origin: 50.5% 51%;
    }

    /* Ambient warm top-left banker's lamp light cone across cork */
    .v5pb-lamp-wash {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 5;
      background:
        radial-gradient(ellipse 64% 58% at 10% 4%, rgba(255, 216, 118, 0.28) 0%, rgba(255, 190, 74, 0.08) 42%, rgba(0, 0, 0, 0) 74%),
        radial-gradient(ellipse 96% 96% at 50% 50%, rgba(0, 0, 0, 0) 56%, rgba(10, 4, 1, 0.56) 100%);
    }

    .v5pb-board-viewport {
      position: relative;
      z-index: 1;
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y;
      scrollbar-width: thin;
      scrollbar-color: #9e762b #231107;
      background: transparent;
    }

    .v5pb-cork-stage {
      position: relative;
      width: 100%;
      min-height: 460px;
      overflow: hidden;
    }

    /* Subtle pinned Act brass plaque & yarn key inside top of corkboard */
    .v5pb-stage-plaque-bar {
      position: relative;
      z-index: 4;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: 8px 12px 2px;
      pointer-events: none;
    }

    .v5pb-act-plaque {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 12px;
      border-radius: 4px;
      background: linear-gradient(180deg, #dfc06e 0%, #a57723 100%);
      color: #211204;
      border: 1px solid #4f3409;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.56), inset 0 1px 0 rgba(255, 250, 218, 0.72);
      font-family: 'Cinzel', Georgia, serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .v5pb-yarn-legend {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 3px 9px;
      border-radius: 4px;
      background: rgba(24, 12, 5, 0.78);
      border: 1px solid rgba(214, 174, 93, 0.34);
      font-size: 10px;
      font-weight: 600;
      color: #f1dfbc;
    }
    .v5pb-legend-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }
    .v5pb-legend-cord {
      width: 14px;
      height: 4px;
      border-radius: 99px;
      display: inline-block;
    }
    .v5pb-legend-cord.is-gold {
      background: repeating-linear-gradient(60deg, #fff1aa 0 3px, #d99b26 3px 6px);
    }
    .v5pb-legend-cord.is-crimson {
      background: repeating-linear-gradient(60deg, #ff7b7b 0 3px, #b81d22 3px 6px);
    }
    .v5pb-legend-cord.is-velvet {
      background: repeating-linear-gradient(60deg, #f3a6ff 0 3px, #8f1d6c 3px 6px);
    }

    /* SVG Braided Yarn Layer */
    .v5pb-yarn-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
      overflow: visible;
    }

    /* ===== PINNED EPHEMERA NODE ANCHORS ===== */
    .v5pb-node-anchor {
      position: absolute;
      z-index: 3;
      transform: translate(-50%, -50%) rotate(var(--tilt, 0deg));
      transform-origin: 50% 8%;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      text-align: left;
      transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), filter 0.2s ease;
    }

    .v5pb-node-anchor:hover,
    .v5pb-node-anchor:focus-visible {
      z-index: 9;
      transform: translate(-50%, -50%) rotate(calc(var(--tilt, 0deg) * 0.28)) scale(1.055);
      outline: none;
    }

    .v5pb-node-anchor.is-selected {
      z-index: 10;
      transform: translate(-50%, -50%) rotate(0deg) scale(1.07);
    }

    .v5pb-node-anchor.is-locked {
      filter: sepia(0.32) brightness(0.76) saturate(0.74);
    }
    .v5pb-node-anchor.is-locked:hover {
      filter: sepia(0.18) brightness(0.88) saturate(0.85);
    }

    @keyframes v5pbFrontierPulse {
      0%, 100% { box-shadow: 0 0 0 2px rgba(248, 213, 104, 0.72), 0 0 18px rgba(248, 200, 72, 0.56); }
      50% { box-shadow: 0 0 0 4px rgba(255, 232, 148, 0.95), 0 0 28px rgba(248, 200, 72, 0.85); }
    }

    @keyframes v5pbLockedShake {
      0%, 100% { transform: translate(-50%, -50%) rotate(var(--tilt, 0deg)); }
      22% { transform: translate(calc(-50% - 4px), -50%) rotate(calc(var(--tilt, 0deg) - 2deg)); }
      52% { transform: translate(calc(-50% + 4px), -50%) rotate(calc(var(--tilt, 0deg) + 2deg)); }
      78% { transform: translate(calc(-50% - 2px), -50%) rotate(var(--tilt, 0deg)); }
    }

    .v5pb-node-anchor.is-shaking {
      animation: v5pbLockedShake 0.34s ease;
    }

    /* 3D-Shaded Brass Pushpin Tack */
    .v5pb-node-tack {
      position: absolute;
      top: -7px;
      left: 50%;
      transform: translateX(-50%);
      width: 17px;
      height: 17px;
      border-radius: 50%;
      z-index: 7;
      pointer-events: none;
      background:
        radial-gradient(circle at 32% 28%, #fffbe0 0%, #f5cf64 32%, #b57e1f 74%, #5e3b07 100%);
      border: 1.2px solid #492c04;
      box-shadow:
        2px 5px 5px rgba(8, 4, 1, 0.72),
        inset 0 1px 1px rgba(255, 255, 230, 0.82);
    }
    .v5pb-node-tack::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 4px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.85);
    }
    .v5pb-node-anchor.is-frontier .v5pb-node-tack {
      animation: v5pbFrontierPulse 2.2s ease-in-out infinite;
    }

    /* Next Stop brass beacon ribbon */
    .v5pb-next-ribbon {
      position: absolute;
      top: -18px;
      right: -8px;
      z-index: 8;
      padding: 2px 7px;
      border-radius: 3px;
      background: linear-gradient(180deg, #1b9b59 0%, #0d6938 100%);
      color: #fff6d1;
      border: 1px solid #f4cf6a;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.65);
      white-space: nowrap;
      pointer-events: none;
    }

    /* ===== STYLE 1: POLAROID SNAPSHOT ===== */
    .v5pb-polaroid {
      position: relative;
      width: 158px;
      padding: 8px 8px 10px;
      border-radius: 2px;
      background: linear-gradient(165deg, #fbf6ec 0%, #efe5d1 70%, #e2d3b8 100%);
      color: #21160d;
      box-shadow:
        0 10px 22px rgba(8, 3, 0, 0.72),
        0 2px 4px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(162, 138, 102, 0.55);
    }
    .v5pb-node-anchor.is-frontier .v5pb-polaroid,
    .v5pb-node-anchor.is-selected .v5pb-polaroid {
      box-shadow:
        0 0 0 2px #f6cf67,
        0 12px 28px rgba(246, 198, 72, 0.34),
        0 10px 22px rgba(8, 3, 0, 0.78);
    }
    .v5pb-polaroid-photo-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 11;
      overflow: hidden;
      background: #1a110b;
      border: 1px solid rgba(40, 26, 14, 0.45);
    }
    .v5pb-polaroid-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .v5pb-polaroid-photo-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(145deg, rgba(255, 248, 224, 0.14) 0%, transparent 45%, rgba(18, 9, 3, 0.25) 100%);
      pointer-events: none;
    }
    .v5pb-polaroid-stars {
      position: relative;
      z-index: 3;
      display: flex;
      justify-content: center;
      gap: 2px;
      margin-top: -12px;
      margin-bottom: 2px;
      filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.65));
    }
    .v5pb-polaroid-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-style: italic;
      font-weight: 700;
      font-size: 13.5px;
      line-height: 1.15;
      text-align: center;
      color: #1c130b;
      padding: 0 2px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .v5pb-polaroid-city {
      margin-top: 2px;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      text-align: center;
      color: #6a5238;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Rubber postal stamp (Cleared / Rematch / Locked) */
    .v5pb-ink-stamp {
      position: absolute;
      top: 10px;
      right: 6px;
      z-index: 4;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      transform: rotate(9deg);
      border: 1.5px solid currentColor;
      pointer-events: none;
    }
    .v5pb-ink-stamp.is-won {
      color: #0e6f3d;
      background: rgba(242, 252, 245, 0.88);
    }
    .v5pb-ink-stamp.is-lost {
      color: #a61e26;
      background: rgba(255, 240, 240, 0.9);
    }
    .v5pb-ticket .v5pb-ink-stamp {
      top: -8px;
      right: 10px;
      font-size: 7.5px;
      padding: 1px 5px;
    }
    .v5pb-lock-badge {
      position: absolute;
      inset: 0;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(22, 13, 6, 0.44);
      pointer-events: none;
    }
    .v5pb-lock-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 99px;
      background: rgba(24, 14, 6, 0.92);
      border: 1px solid #c69a44;
      color: #f4d88c;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.07em;
    }

    /* ===== STYLE 2: TORN PUB FLYER (PERFORATED VINTAGE TICKET) ===== */
    .v5pb-ticket {
      position: relative;
      width: 164px;
      padding: 12px 18px 13px;
      color: #241409;
      background:
        radial-gradient(circle 8px at 0% 50%, transparent 96%, #e7d1ae 100%) left / 51% 100% no-repeat,
        radial-gradient(circle 8px at 100% 50%, transparent 96%, #d9be92 100%) right / 51% 100% no-repeat;
      filter: drop-shadow(0 9px 14px rgba(8, 3, 0, 0.72));
    }
    .v5pb-ticket-inner {
      position: relative;
      border: 1.5px dashed rgba(94, 58, 25, 0.62);
      border-radius: 3px;
      padding: 6px 8px;
      text-align: center;
      background: rgba(252, 242, 222, 0.38);
    }
    .v5pb-ticket-stub-txt {
      position: absolute;
      top: 50%;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5px;
      font-weight: 700;
      letter-spacing: 0.14em;
      color: rgba(88, 55, 24, 0.72);
      pointer-events: none;
    }
    .v5pb-ticket-stub-txt.is-left {
      left: -3px;
      transform: translateY(-50%) rotate(-90deg);
    }
    .v5pb-ticket-stub-txt.is-right {
      right: -3px;
      transform: translateY(-50%) rotate(90deg);
    }
    .v5pb-ticket-kicker {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #9e2121;
      margin-bottom: 2px;
    }
    .v5pb-ticket-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-style: italic;
      font-weight: 700;
      font-size: 13px;
      line-height: 1.18;
      color: #1f1208;
    }
    .v5pb-ticket-sub {
      margin-top: 3px;
      font-size: 9.5px;
      font-weight: 700;
      color: #5b3c1c;
    }
    .v5pb-node-anchor.is-frontier .v5pb-ticket,
    .v5pb-node-anchor.is-selected .v5pb-ticket {
      filter: drop-shadow(0 0 8px rgba(246, 200, 76, 0.72)) drop-shadow(0 9px 14px rgba(8, 3, 0, 0.75));
    }

    /* ===== STYLE 3: BOARDING PASS (VINTAGE FLIGHT STUB) ===== */
    .v5pb-boarding {
      position: relative;
      width: 170px;
      border-radius: 5px;
      overflow: hidden;
      background: linear-gradient(170deg, #f8f1e1 0%, #eadbc0 100%);
      color: #1c1b29;
      border: 1px solid #9f8760;
      box-shadow: 0 10px 20px rgba(8, 3, 0, 0.72);
    }
    .v5pb-boarding-airmail {
      height: 7px;
      background: repeating-linear-gradient(
        -45deg,
        #b6252c 0 8px,
        #f7efe0 8px 13px,
        #1e457d 13px 21px,
        #f7efe0 21px 26px
      );
      border-bottom: 1px solid rgba(40, 30, 20, 0.25);
    }
    .v5pb-boarding-body {
      display: grid;
      grid-template-columns: 1fr 44px;
      padding: 7px 8px 8px;
      gap: 6px;
      align-items: center;
    }
    .v5pb-boarding-main {
      min-width: 0;
      border-right: 1.5px dashed rgba(94, 72, 42, 0.55);
      padding-right: 6px;
    }
    .v5pb-boarding-route {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #1e457d;
    }
    .v5pb-boarding-title {
      margin-top: 2px;
      font-family: Georgia, 'Times New Roman', serif;
      font-weight: 700;
      font-size: 12.5px;
      line-height: 1.15;
      color: #1c130c;
    }
    .v5pb-boarding-stub {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }
    .v5pb-boarding-code {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 13px;
      font-weight: 800;
      color: #9f2027;
      letter-spacing: 0.04em;
    }
    .v5pb-boarding-stars {
      display: flex;
      gap: 1px;
    }
    .v5pb-node-anchor.is-frontier .v5pb-boarding,
    .v5pb-node-anchor.is-selected .v5pb-boarding {
      box-shadow: 0 0 0 2px #f6cf67, 0 10px 24px rgba(246, 198, 72, 0.4), 0 10px 20px rgba(0, 0, 0, 0.72);
    }

    /* ===== STYLE 4: VELVET WAX INVITE (FOLDED PARCHMENT ENVELOPE + 3D CRIMSON WAX SEAL) ===== */
    .v5pb-envelope {
      position: relative;
      width: 168px;
      min-height: 112px;
      border-radius: 3px;
      overflow: hidden;
      background: linear-gradient(175deg, #f9f1e2 0%, #ebdec5 68%, #decca8 100%);
      border: 1px solid #a89069;
      box-shadow: 0 10px 22px rgba(8, 3, 0, 0.76), inset 0 1px 0 rgba(255, 255, 255, 0.85);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 46px 10px 10px;
    }
    .v5pb-envelope-flaps {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .v5pb-envelope-seal {
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
      filter: drop-shadow(0 4px 5px rgba(28, 3, 6, 0.56));
      pointer-events: none;
    }
    .v5pb-envelope-title {
      position: relative;
      z-index: 3;
      margin-top: 20px;
      font-family: Georgia, 'Times New Roman', serif;
      font-style: italic;
      font-weight: 700;
      font-size: 13px;
      line-height: 1.15;
      text-align: center;
      color: #26140c;
    }
    .v5pb-envelope-sub {
      position: relative;
      z-index: 3;
      margin-top: 2px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-align: center;
      color: #7c1831;
    }
    .v5pb-node-anchor.is-frontier .v5pb-envelope,
    .v5pb-node-anchor.is-selected .v5pb-envelope {
      box-shadow: 0 0 0 2px #f6cf67, 0 12px 26px rgba(190, 48, 128, 0.45), 0 10px 22px rgba(8, 3, 0, 0.78);
    }

    /* ===== STYLE 5: CALL SHEET CLIP (YELLOW SCOUTING NOTE + RIVAL PORTRAIT) ===== */
    .v5pb-scouting {
      position: relative;
      width: 146px;
      padding: 10px 9px 10px;
      border-radius: 2px 2px 8px 2px;
      background: linear-gradient(168deg, #fbf09b 0%, #f4df73 64%, #e5c750 100%);
      color: #211808;
      border: 1px solid rgba(154, 122, 34, 0.55);
      box-shadow:
        0 10px 20px rgba(8, 3, 0, 0.7),
        inset 0 -8px 12px rgba(162, 122, 18, 0.18);
    }
    .v5pb-scouting-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      font-family: Georgia, 'Times New Roman', serif;
      font-style: italic;
      font-weight: 700;
      font-size: 11px;
      color: #36250b;
      border-bottom: 1px dashed rgba(76, 54, 14, 0.35);
      padding-bottom: 3px;
      margin-bottom: 5px;
    }
    .v5pb-scouting-dare-tag {
      font-family: 'Cinzel', Georgia, serif;
      font-style: normal;
      font-size: 7.5px;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 3px;
      background: #9a1a22;
      color: #fff3d6;
      letter-spacing: 0.05em;
    }
    .v5pb-scouting-portrait-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .v5pb-scouting-portrait-box {
      width: 60px;
      height: 66px;
      flex-shrink: 0;
      border-radius: 3px;
      overflow: hidden;
      background: radial-gradient(circle at 50% 35%, rgba(255, 250, 224, 0.72), rgba(212, 178, 70, 0.4));
      border: 1px solid rgba(74, 52, 12, 0.35);
    }
    .v5pb-scouting-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      filter: sepia(0.28) contrast(1.1) brightness(1.02);
      display: block;
    }
    .v5pb-scouting-notes {
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .v5pb-scouting-rival {
      font-family: Georgia, 'Times New Roman', serif;
      font-style: italic;
      font-weight: 700;
      font-size: 11.5px;
      line-height: 1.12;
      color: #1f1406;
    }
    .v5pb-scouting-venue {
      font-size: 9px;
      font-weight: 700;
      line-height: 1.15;
      color: #5b4114;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .v5pb-scouting-purse {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      font-weight: 700;
      color: #145c34;
    }
    .v5pb-node-anchor.is-frontier .v5pb-scouting,
    .v5pb-node-anchor.is-selected .v5pb-scouting {
      box-shadow: 0 0 0 2px #f6cf67, 0 12px 24px rgba(246, 198, 72, 0.42), 0 10px 20px rgba(8, 3, 0, 0.72);
    }

    /* Cross-Act continuation luggage tag pinned at edge */
    .v5pb-cross-act-tag {
      position: absolute;
      z-index: 4;
      transform: translate(-50%, -50%) rotate(3deg);
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 11px;
      border-radius: 5px;
      border: 1.5px solid #53360a;
      background: linear-gradient(180deg, #f3d786 0%, #be8e2f 100%);
      color: #211204;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.06em;
      cursor: pointer;
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.65);
    }
    .v5pb-cross-act-tag:hover {
      filter: brightness(1.1);
    }

    /* Empty/Locked Act Ribbon */
    .v5pb-empty-act {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-width: 320px;
      padding: 18px 20px;
      border-radius: 6px;
      background: #f3e6cb;
      color: #24160a;
      border: 2px solid #9a7432;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.72);
      text-align: center;
      z-index: 4;
    }
    .v5pb-empty-act h3 {
      margin: 0 0 6px;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 14px;
    }
    .v5pb-empty-act p {
      margin: 0;
      font-size: 12.5px;
      line-height: 1.4;
      color: #543b1f;
    }

    /* ===== BOTTOM RECESSED BRASS LUCKY CHARM TRAY + CASH CLIP ===== */
    .v5pb-brass-tray {
      position: relative;
      z-index: 12;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 12px;
      background: linear-gradient(
        180deg,
        #6d5019 0%,
        #9d7a31 12%,
        #cca654 44%,
        #9f7b2f 82%,
        #5e4312 100%
      );
      border: 2px solid #442d08;
      box-shadow:
        inset 0 4px 10px rgba(34, 21, 3, 0.72),
        inset 0 -3px 6px rgba(255, 240, 184, 0.34),
        0 4px 12px rgba(0, 0, 0, 0.65);
    }

    .v5pb-tray-charms-group {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .v5pb-tray-label-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-right: 4px;
      border-right: 1px solid rgba(56, 35, 6, 0.38);
      min-width: 78px;
    }
    .v5pb-tray-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #241504;
      line-height: 1.1;
    }
    .v5pb-tray-sub {
      font-size: 9.5px;
      font-weight: 700;
      color: #3f2808;
      opacity: 0.9;
    }

    .v5pb-charm-slots {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      flex: 1 1 auto;
      max-width: 440px;
      min-width: 0;
    }

    .v5pb-charm-slot {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      min-height: 64px;
      padding: 4px 6px 5px;
      border-radius: 10px;
      border: 1.5px solid rgba(72, 46, 9, 0.68);
      background: radial-gradient(ellipse at 50% 42%, rgba(255, 238, 178, 0.28) 0%, rgba(92, 63, 15, 0.42) 100%);
      box-shadow:
        inset 0 3px 6px rgba(34, 21, 3, 0.48),
        0 1px 0 rgba(255, 245, 198, 0.48);
      cursor: pointer;
      color: #241404;
      transition: transform 0.15s ease, filter 0.15s ease;
    }
    .v5pb-charm-slot:hover {
      filter: brightness(1.1);
      transform: translateY(-2px);
    }
    .v5pb-charm-slot:focus-visible {
      outline: 2px solid #fff3bd;
      outline-offset: 2px;
    }
    .v5pb-charm-slot.is-empty {
      border-style: dashed;
      background: rgba(54, 35, 8, 0.28);
    }
    .v5pb-charm-art {
      display: block;
      filter: drop-shadow(0 4px 5px rgba(24, 13, 2, 0.62));
    }
    .v5pb-charm-slot-name {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.01em;
      line-height: 1.08;
      color: #211203;
      text-align: center;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 100%;
    }
    .v5pb-charm-empty-plus {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1.5px dashed rgba(52, 33, 7, 0.72);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      color: #3d2506;
    }

    /* Desktop hover tooltip above brass charm slot */
    .v5pb-charm-tooltip {
      position: absolute;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
      width: 218px;
      padding: 9px 11px;
      border-radius: 7px;
      background: #1d1209;
      border: 1.5px solid #ddb354;
      color: #fbf0d9;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.82);
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.14s ease;
      z-index: 30;
      text-align: left;
    }
    .v5pb-charm-slot:hover .v5pb-charm-tooltip,
    .v5pb-charm-slot:focus-visible .v5pb-charm-tooltip {
      opacity: 1;
      visibility: visible;
    }
    .v5pb-charm-tooltip-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 11px;
      font-weight: 800;
      color: #f7d67b;
      margin-bottom: 2px;
    }
    .v5pb-charm-tooltip-desc {
      font-size: 11px;
      line-height: 1.32;
      color: #f4e6ca;
    }
    .v5pb-charm-tooltip-hint {
      margin-top: 4px;
      font-size: 9.5px;
      font-weight: 700;
      color: #5ee2a5;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* Brass Cash Clip + Live Audience */
    .v5pb-cash-widget {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 10px 4px 8px;
      border-radius: 9px;
      background: linear-gradient(180deg, rgba(64, 42, 10, 0.45), rgba(38, 24, 5, 0.62));
      border: 1.5px solid rgba(64, 41, 8, 0.72);
      box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.45);
    }

    .v5pb-cash-clip-visual {
      position: relative;
      width: 72px;
      height: 54px;
      flex-shrink: 0;
      filter: drop-shadow(0 4px 6px rgba(16, 9, 2, 0.62));
    }
    .v5pb-cash-svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .v5pb-cash-metrics {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }
    .v5pb-bankroll-slip {
      padding: 3px 8px;
      border-radius: 3px;
      background: linear-gradient(180deg, #faf2df 0%, #e7d6b4 100%);
      border: 1px solid #8a6c3c;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.42);
      transform: rotate(-1.2deg);
    }
    .v5pb-bankroll-amount {
      font-family: Georgia, 'Times New Roman', serif;
      font-weight: 800;
      font-size: 14.5px;
      line-height: 1.05;
      color: #163d22;
      white-space: nowrap;
    }
    .v5pb-bankroll-label {
      font-family: Georgia, 'Times New Roman', serif;
      font-style: italic;
      font-size: 9.5px;
      font-weight: 700;
      color: #523b1e;
      line-height: 1.05;
    }
    .v5pb-audience-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 7px;
      border-radius: 4px;
      background: #1b1106;
      border: 1px solid #cfa349;
      color: #fff3d1;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      font-weight: 700;
      white-space: nowrap;
    }

    /* ===== OVERLAY SCRIM (SOLID OPAQUE ALPHA — ZERO BLUR) ===== */
    .v5pb-scrim {
      position: fixed;
      inset: 0;
      z-index: 60;
      background: rgba(10, 5, 2, 0.8);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 12px 10px max(12px, env(safe-area-inset-bottom));
      animation: v5pbFadeIn 0.16s ease-out;
    }

    @keyframes v5pbFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes v5pbSlideUp {
      from { transform: translateY(28px); opacity: 0.2; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* ===== SLIDE-UP CLIPBOARD CALL-SHEET / TICKET STUB ===== */
    .v5pb-clipboard {
      position: relative;
      width: 100%;
      max-width: 540px;
      max-height: calc(100dvh - 24px);
      display: flex;
      flex-direction: column;
      padding: 16px 10px 10px;
      border-radius: 14px;
      background: linear-gradient(160deg, #6b3617 0%, #441f0b 55%, #2b1105 100%);
      border: 2px solid #220d04;
      box-shadow:
        0 24px 56px rgba(0, 0, 0, 0.88),
        inset 0 2px 1px rgba(255, 208, 152, 0.28);
      animation: v5pbSlideUp 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* Metallic Brass Clipboard Spring Clasp */
    .v5pb-clipboard-clip {
      position: absolute;
      top: -11px;
      left: 50%;
      transform: translateX(-50%);
      width: 122px;
      height: 24px;
      border-radius: 6px 6px 4px 4px;
      background: linear-gradient(180deg, #f8e29a 0%, #c69635 55%, #7c5614 100%);
      border: 1.5px solid #422a06;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 253, 224, 0.82);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 4;
    }
    .v5pb-clipboard-clip::after {
      content: '';
      width: 44px;
      height: 6px;
      border-radius: 99px;
      background: #4e3309;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.7);
    }

    .v5pb-callsheet-paper {
      position: relative;
      display: flex;
      flex-direction: column;
      min-height: 0;
      border-radius: 7px;
      overflow: hidden;
      background: linear-gradient(180deg, #faf3e4 0%, #efe2c8 100%);
      color: #21150a;
      border: 1px solid #b69b6d;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
    }

    .v5pb-cs-banner {
      position: relative;
      height: 112px;
      flex-shrink: 0;
      overflow: hidden;
      background: #170e07;
    }
    .v5pb-cs-banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .v5pb-cs-banner-grad {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(16, 8, 3, 0.25) 0%, rgba(16, 8, 3, 0.88) 100%);
    }
    .v5pb-cs-close {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 3;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1.5px solid #e4bd63;
      background: #241307;
      color: #fff2cf;
      font-size: 19px;
      font-weight: 700;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.65);
    }
    .v5pb-cs-close:hover {
      background: #3d210d;
    }

    .v5pb-cs-banner-text {
      position: absolute;
      left: 12px;
      right: 48px;
      bottom: 8px;
      z-index: 2;
      color: #fff7e6;
    }
    .v5pb-cs-lane-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-bottom: 3px;
    }
    .v5pb-cs-lane-badge {
      padding: 2px 7px;
      border-radius: 3px;
      background: #d7a63e;
      color: #1f1103;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .v5pb-cs-lane-badge.is-redemption {
      background: #b82128;
      color: #fff3eb;
    }
    .v5pb-cs-lane-badge.is-velvet {
      background: #7e1955;
      color: #ffeaf7;
    }
    .v5pb-cs-city {
      font-size: 10.5px;
      font-weight: 700;
      color: #f3d896;
      letter-spacing: 0.04em;
    }
    .v5pb-cs-show-title {
      margin: 0;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 17px;
      font-weight: 800;
      line-height: 1.15;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
    }
    .v5pb-cs-venue-sub {
      font-size: 11.5px;
      font-weight: 600;
      color: #e8d9be;
      margin-top: 1px;
    }

    .v5pb-cs-scroll {
      overflow-y: auto;
      min-height: 0;
      padding: 11px 13px 10px;
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .v5pb-cs-blurb {
      margin: 0;
      font-family: Georgia, 'Times New Roman', serif;
      font-style: italic;
      font-size: 13px;
      line-height: 1.38;
      color: #362413;
    }

    /* Challenger Dossier Strip */
    .v5pb-cs-challenger {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 6px;
      background: rgba(112, 74, 30, 0.11);
      border: 1px solid rgba(128, 92, 42, 0.34);
    }
    .v5pb-cs-avatar {
      width: 54px;
      height: 58px;
      border-radius: 5px;
      overflow: hidden;
      flex-shrink: 0;
      background: radial-gradient(circle at 50% 35%, #51351e, #241309);
      border: 1.5px solid #b88e3d;
    }
    .v5pb-cs-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }
    .v5pb-cs-rival-info {
      min-width: 0;
      flex: 1;
    }
    .v5pb-cs-rival-kicker {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #7c5621;
    }
    .v5pb-cs-rival-name {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 13.5px;
      font-weight: 800;
      color: #1f1308;
    }
    .v5pb-cs-rival-title {
      font-size: 11px;
      color: #543d24;
    }
    .v5pb-affinity-tag {
      display: inline-block;
      margin-top: 3px;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 9.5px;
      font-weight: 700;
    }
    .v5pb-affinity-tag.is-ally { background: #14633c; color: #e8fff3; }
    .v5pb-affinity-tag.is-warm { background: #266b52; color: #e9fff7; }
    .v5pb-affinity-tag.is-neutral { background: #6b5231; color: #fdf2db; }
    .v5pb-affinity-tag.is-tense { background: #9b4818; color: #fff1e6; }
    .v5pb-affinity-tag.is-grudge { background: #9c1a24; color: #ffebed; }

    /* Stakes Ledger Strip (Purse, Audience, Entry Fee) */
    .v5pb-cs-stakes {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }
    .v5pb-stake-cell {
      padding: 6px 8px;
      border-radius: 5px;
      background: #f5ead2;
      border: 1px solid #c9b081;
      text-align: center;
    }
    .v5pb-stake-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #755830;
    }
    .v5pb-stake-val {
      margin-top: 2px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 800;
      color: #1d1208;
    }
    .v5pb-stake-val.is-gold { color: #8c5a08; }
    .v5pb-stake-val.is-green { color: #116638; }
    .v5pb-stake-val.is-danger { color: #a81c22; }

    /* Match Board Specs */
    .v5pb-cs-specs {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .v5pb-spec-chip {
      padding: 3px 7px;
      border-radius: 3px;
      background: rgba(54, 34, 15, 0.09);
      border: 1px solid rgba(112, 82, 40, 0.3);
      font-size: 10.5px;
      font-weight: 700;
      color: #46311a;
    }

    /* Optional Showman Dare Sub-Ticket */
    .v5pb-dare-slip {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 6px;
      background: linear-gradient(170deg, #fcf0b8 0%, #f1d97f 100%);
      border: 1.5px dashed #9e6b17;
      color: #2c1b06;
    }
    .v5pb-dare-kicker {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #981d22;
    }
    .v5pb-dare-desc {
      margin-top: 2px;
      font-size: 11.5px;
      font-weight: 600;
      line-height: 1.28;
    }
    .v5pb-dare-bonus {
      margin-top: 3px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      color: #145c34;
    }
    .v5pb-dare-toggle {
      flex-shrink: 0;
      min-height: 36px;
      padding: 6px 10px;
      border-radius: 5px;
      border: 1.5px solid #5c3a0b;
      background: #fff9e6;
      color: #3a2308;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 800;
      cursor: pointer;
    }
    .v5pb-dare-toggle.is-accepted {
      background: linear-gradient(180deg, #1b8c52 0%, #0f5f34 100%);
      color: #fff8de;
      border-color: #f0c966;
    }

    /* Reward Charm Preview Note */
    .v5pb-reward-note {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 9px;
      border-radius: 5px;
      background: rgba(154, 114, 41, 0.14);
      border: 1px solid rgba(154, 114, 41, 0.42);
      font-size: 11px;
      color: #36220a;
    }

    /* Perforated Ticket Stub Footer + Marquee STEP ONTO STAGE Button */
    .v5pb-cs-footer {
      flex-shrink: 0;
      padding: 10px 13px 12px;
      border-top: 2px dashed #b79b6a;
      background: linear-gradient(180deg, #ecdec1 0%, #dfd0b0 100%);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .v5pb-cs-warn {
      font-size: 11px;
      font-weight: 700;
      color: #9e1b22;
      text-align: center;
    }

    .v5pb-marquee-launch {
      position: relative;
      width: 100%;
      min-height: 50px;
      padding: 11px 18px;
      border-radius: 10px;
      border: 2.5px solid #f2cc6b;
      background: linear-gradient(180deg, #1c9658 0%, #0e6b3c 52%, #084827 100%);
      color: #fff9e3;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow:
        0 6px 18px rgba(10, 82, 44, 0.56),
        0 0 0 2px #523608,
        inset 0 2px 1px rgba(176, 255, 211, 0.42),
        inset 0 -3px 6px rgba(3, 28, 15, 0.55);
      transition: transform 0.14s ease, filter 0.14s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .v5pb-marquee-launch::before,
    .v5pb-marquee-launch::after {
      content: '';
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #fff2b2;
      box-shadow: 0 0 8px #ffd966;
      flex-shrink: 0;
    }
    .v5pb-marquee-launch:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .v5pb-marquee-launch:active:not(:disabled) {
      transform: translateY(1px);
    }
    .v5pb-marquee-launch:disabled {
      cursor: not-allowed;
      background: linear-gradient(180deg, #5e503d 0%, #3d3326 100%);
      border-color: #9e8a6b;
      color: #d6cbb8;
      box-shadow: none;
    }

    /* ===== VELVET CHARM CASE DRAWER & SPONSOR LEDGER OVERLAY ===== */
    .v5pb-drawer {
      position: relative;
      width: 100%;
      max-width: 620px;
      max-height: calc(100dvh - 28px);
      display: flex;
      flex-direction: column;
      border-radius: 14px;
      overflow: hidden;
      background: linear-gradient(180deg, #10452b 0%, #092c1b 100%);
      border: 2.5px solid #cfa349;
      box-shadow: 0 24px 56px rgba(0, 0, 0, 0.88), inset 0 1px 0 rgba(255, 240, 184, 0.45);
      color: #faf0da;
      animation: v5pbSlideUp 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .v5pb-drawer-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      background: linear-gradient(180deg, #4b2a10 0%, #2d1707 100%);
      border-bottom: 2px solid #c79c42;
    }
    .v5pb-drawer-title {
      margin: 0;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 15px;
      font-weight: 800;
      color: #fae19e;
      letter-spacing: 0.05em;
    }
    .v5pb-drawer-sub {
      margin-top: 2px;
      font-size: 11px;
      color: #dfd0b4;
    }
    .v5pb-drawer-body {
      overflow-y: auto;
      min-height: 0;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .v5pb-slot-selector {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
    }
    .v5pb-slot-pill {
      padding: 7px 6px;
      border-radius: 7px;
      border: 1.5px solid rgba(214, 174, 93, 0.45);
      background: rgba(12, 28, 18, 0.72);
      color: #e6d7b8;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10.5px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
    }
    .v5pb-slot-pill.is-target {
      background: linear-gradient(180deg, #ebd07f 0%, #b58429 100%);
      color: #211203;
      border-color: #fff2be;
    }

    .v5pb-charm-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(235px, 1fr));
      gap: 8px;
    }
    .v5pb-charm-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 9px;
      border: 1.5px solid rgba(212, 173, 88, 0.42);
      background: rgba(10, 24, 16, 0.86);
      color: #faf0da;
      text-align: left;
      cursor: pointer;
      transition: transform 0.14s ease, border-color 0.14s ease;
    }
    .v5pb-charm-card:hover:not(:disabled) {
      transform: translateY(-1px);
      border-color: #f7d67b;
    }
    .v5pb-charm-card.is-equipped {
      background: linear-gradient(160deg, rgba(168, 122, 34, 0.38), rgba(20, 48, 30, 0.94));
      border-color: #f6cf67;
    }
    .v5pb-charm-card:disabled {
      opacity: 0.54;
      cursor: not-allowed;
      filter: grayscale(0.5);
    }
    .v5pb-charm-card-info {
      min-width: 0;
      flex: 1;
    }
    .v5pb-charm-card-name {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 12px;
      font-weight: 800;
      color: #fce29c;
    }
    .v5pb-charm-card-effect {
      margin-top: 2px;
      font-size: 11px;
      line-height: 1.3;
      color: #f2e8d4;
    }
    .v5pb-charm-card-origin {
      margin-top: 3px;
      font-size: 9.5px;
      color: #b5cbbd;
    }
    .v5pb-charm-card-state {
      margin-top: 4px;
      display: inline-block;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background: rgba(246, 207, 103, 0.18);
      color: #f7d67b;
    }
    .v5pb-charm-card.is-equipped .v5pb-charm-card-state {
      background: #1b8c52;
      color: #fff8de;
    }

    /* Sponsor Ledger Cards */
    .v5pb-sponsor-list {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    .v5pb-sponsor-card {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 10px 12px;
      border-radius: 9px;
      background: rgba(12, 26, 18, 0.88);
      border: 1.5px solid rgba(212, 173, 88, 0.36);
      color: #faf0da;
    }
    .v5pb-sponsor-card.is-active {
      border-color: #f7d67b;
      background: linear-gradient(160deg, rgba(166, 120, 34, 0.32), rgba(14, 34, 22, 0.94));
    }
    .v5pb-rep-track {
      margin-top: 6px;
      width: 100%;
      height: 7px;
      border-radius: 99px;
      background: rgba(255, 255, 255, 0.12);
      overflow: hidden;
    }
    .v5pb-rep-fill {
      height: 100%;
      border-radius: 99px;
      background: linear-gradient(90deg, #d7a338, #ffe58a);
    }

    /* ===== RESPONSIVE: DESKTOP (>= 860px) ===== */
    @media (min-width: 860px) {
      .v5pb-shell {
        padding: 12px 18px;
      }
      .v5pb-trunk {
        padding: 12px;
      }
      .v5pb-felt-frame {
        padding: 10px 12px;
        gap: 9px;
      }
      .v5pb-lamp-mount {
        top: -22px;
        left: -14px;
        width: 146px;
        height: 106px;
      }
      .v5pb-header-left {
        padding-left: 118px;
      }
      .v5pb-stage-plaque-bar {
        padding: 10px 14px 2px 128px;
      }
      .v5pb-act-tag {
        min-height: 44px;
      }
      .v5pb-act-tag-num {
        font-size: 12px;
      }
      .v5pb-polaroid {
        width: 170px;
      }
      .v5pb-ticket {
        width: 176px;
      }
      .v5pb-boarding {
        width: 184px;
      }
      .v5pb-envelope {
        width: 180px;
      }
      .v5pb-scouting {
        width: 158px;
      }
      .v5pb-scrim {
        align-items: center;
      }
    }

    /* ===== RESPONSIVE: MOBILE PORTRAIT (<= 640px) ===== */
    @media (max-width: 640px) {
      .v5pb-shell {
        padding: max(4px, env(safe-area-inset-top)) 4px max(4px, env(safe-area-inset-bottom));
      }
      .v5pb-trunk {
        padding: 7px;
        border-radius: 13px;
      }
      .v5pb-felt-frame {
        padding: 6px;
        gap: 6px;
      }
      .v5pb-lamp-mount {
        top: -12px;
        left: -8px;
        width: 82px;
        height: 60px;
      }
      .v5pb-header {
        gap: 5px 6px;
        padding: 1px 2px;
      }
      .v5pb-header-left {
        padding-left: 64px;
      }
      .v5pb-back-latch {
        min-height: 34px;
        padding: 4px 9px 4px 6px;
        font-size: 10px;
      }
      .v5pb-sponsor-btn {
        min-height: 34px;
        padding: 3px 8px 3px 5px;
      }
      .v5pb-sponsor-kicker {
        font-size: 7.5px;
      }
      .v5pb-sponsor-name {
        font-size: 10px;
      }
      .v5pb-act-rail {
        order: 3;
        flex: 1 0 100%;
        gap: 4px;
      }
      .v5pb-act-tag {
        min-height: 36px;
        padding: 4px 2px 3px;
      }
      .v5pb-act-tag-num {
        font-size: 10px;
      }
      .v5pb-act-tag-meta {
        font-size: 8.5px;
      }
      .v5pb-stage-plaque-bar {
        padding: 6px 8px 2px;
      }
      .v5pb-act-plaque {
        font-size: 9.5px;
        padding: 3px 8px;
      }
      .v5pb-yarn-legend {
        font-size: 9px;
        gap: 6px;
        padding: 2px 6px;
      }
      .v5pb-polaroid {
        width: 124px;
        padding: 6px 6px 8px;
      }
      .v5pb-polaroid-title {
        font-size: 11.5px;
      }
      .v5pb-polaroid-city {
        font-size: 8.5px;
      }
      .v5pb-ticket {
        width: 132px;
        padding: 9px 13px 10px;
      }
      .v5pb-ticket-title {
        font-size: 11px;
      }
      .v5pb-boarding {
        width: 136px;
      }
      .v5pb-boarding-body {
        grid-template-columns: 1fr 34px;
        padding: 5px 6px 6px;
      }
      .v5pb-boarding-title {
        font-size: 11px;
      }
      .v5pb-boarding-code {
        font-size: 10.5px;
      }
      .v5pb-envelope {
        width: 134px;
        min-height: 92px;
        padding: 36px 8px 8px;
      }
      .v5pb-envelope-seal {
        top: 17px;
      }
      .v5pb-envelope-title {
        font-size: 11px;
        margin-top: 16px;
      }
      .v5pb-scouting {
        width: 126px;
        padding: 8px 7px;
      }
      .v5pb-scouting-portrait-box {
        width: 44px;
        height: 50px;
      }
      .v5pb-scouting-rival {
        font-size: 10.5px;
      }
      .v5pb-brass-tray {
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 6px;
        padding: 6px 7px;
      }
      .v5pb-tray-label-col {
        display: none;
      }
      .v5pb-charm-slots {
        gap: 5px;
      }
      .v5pb-charm-slot {
        min-height: 54px;
        padding: 3px 3px 4px;
      }
      .v5pb-charm-slot-name {
        font-size: 8px;
      }
      .v5pb-charm-tooltip {
        display: none;
      }
      .v5pb-cash-widget {
        gap: 5px;
        padding: 3px 6px;
      }
      .v5pb-cash-clip-visual {
        width: 44px;
        height: 36px;
      }
      .v5pb-bankroll-slip {
        padding: 2px 5px;
      }
      .v5pb-bankroll-amount {
        font-size: 12px;
      }
      .v5pb-bankroll-label {
        font-size: 8px;
      }
      .v5pb-audience-pill {
        font-size: 9px;
        padding: 2px 5px;
      }
      .v5pb-cs-banner {
        height: 96px;
      }
      .v5pb-cs-show-title {
        font-size: 15px;
      }
      .v5pb-fs-btn {
        width: 34px;
        height: 34px;
      }
    }

    /* ===== RESPONSIVE: ULTRA-COMPACT PHONE PORTRAIT (<= 380px, e.g. 360x640) ===== */
    @media (max-width: 380px) {
      .v5pb-header-left {
        padding-left: 56px;
      }
      .v5pb-lamp-mount {
        width: 72px;
        height: 52px;
      }
      .v5pb-back-latch {
        padding: 4px 7px 4px 5px;
        font-size: 9.5px;
      }
      .v5pb-sponsor-btn {
        padding: 3px 6px 3px 4px;
        gap: 4px;
      }
      .v5pb-sponsor-name {
        font-size: 9px;
      }
      .v5pb-polaroid {
        width: 114px;
      }
      .v5pb-ticket {
        width: 122px;
        padding: 8px 11px 9px;
      }
      .v5pb-boarding,
      .v5pb-envelope {
        width: 124px;
      }
      .v5pb-scouting {
        width: 118px;
      }
      .v5pb-cash-clip-visual {
        display: none;
      }
      .v5pb-charm-slot {
        min-height: 48px;
      }
    }

    /* ===== RESPONSIVE: MOBILE PHONE LANDSCAPE 2-COLUMN SPLIT TRUNK (<= 500px height) ===== */
    @media (max-height: 500px) and (orientation: landscape) {
      .v5pb-shell {
        padding: 3px 6px;
      }
      .v5pb-trunk {
        padding: 6px;
        border-radius: 12px;
      }
      .v5pb-felt-frame {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 216px;
        grid-template-rows: auto minmax(0, 1fr);
        gap: 5px 8px;
        padding: 5px 7px;
      }
      .v5pb-header {
        grid-column: 1 / 3;
        grid-row: 1;
        min-height: 36px;
        flex-wrap: nowrap;
        gap: 6px;
        padding: 0 2px;
      }
      .v5pb-lamp-mount {
        width: 74px;
        height: 52px;
        top: -11px;
        left: -8px;
      }
      .v5pb-header-left {
        padding-left: 62px;
      }
      .v5pb-back-latch,
      .v5pb-sponsor-btn {
        min-height: 32px;
        padding: 3px 8px;
        font-size: 9.5px;
      }
      .v5pb-fs-btn {
        width: 32px;
        height: 32px;
      }
      .v5pb-act-rail {
        order: 0;
        flex: 1 1 auto;
        max-width: 410px;
        gap: 4px;
      }
      .v5pb-act-tag {
        min-height: 32px;
        padding: 3px 3px 2px;
      }
      .v5pb-act-tag-num {
        margin-top: 3px;
        font-size: 10px;
      }
      .v5pb-act-tag-meta {
        display: none;
      }
      .v5pb-board-frame {
        grid-column: 1;
        grid-row: 2;
      }
      .v5pb-stage-plaque-bar {
        padding: 4px 8px 1px;
      }
      .v5pb-act-plaque {
        font-size: 9.5px;
        padding: 2px 7px;
      }
      .v5pb-yarn-legend {
        font-size: 9px;
        padding: 2px 6px;
      }
      .v5pb-polaroid {
        width: 126px;
        padding: 6px 6px 7px;
      }
      .v5pb-polaroid-title {
        font-size: 11px;
      }
      .v5pb-ticket {
        width: 132px;
        padding: 8px 13px 9px;
      }
      .v5pb-ticket-title {
        font-size: 11px;
      }
      .v5pb-boarding,
      .v5pb-envelope {
        width: 134px;
      }
      .v5pb-envelope {
        min-height: 90px;
        padding: 34px 8px 7px;
      }
      .v5pb-envelope-seal {
        top: 15px;
      }
      .v5pb-envelope-title {
        font-size: 11px;
        margin-top: 16px;
      }
      .v5pb-scouting {
        width: 124px;
        padding: 7px 6px;
      }
      .v5pb-scouting-portrait-box {
        width: 42px;
        height: 48px;
      }
      .v5pb-brass-tray {
        grid-column: 2;
        grid-row: 2;
        grid-template-columns: 1fr;
        grid-template-rows: minmax(0, 1fr) auto;
        gap: 6px;
        padding: 6px;
        align-items: stretch;
        overflow-y: auto;
      }
      .v5pb-tray-charms-group {
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
      }
      .v5pb-tray-label-col {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        border-right: none;
        border-bottom: 1px solid rgba(56, 35, 6, 0.35);
        padding: 0 2px 3px;
        min-width: 0;
      }
      .v5pb-tray-title {
        font-size: 9.5px;
      }
      .v5pb-tray-sub {
        font-size: 8.5px;
      }
      .v5pb-charm-slots {
        grid-template-columns: 1fr;
        gap: 4px;
        max-width: none;
      }
      .v5pb-charm-slot {
        flex-direction: row;
        justify-content: flex-start;
        gap: 7px;
        min-height: 40px;
        padding: 3px 6px;
      }
      .v5pb-charm-slot .v5pb-charm-art {
        width: 28px;
        height: 28px;
        flex-shrink: 0;
      }
      .v5pb-charm-slot-name {
        text-align: left;
        font-size: 9.5px;
      }
      .v5pb-charm-tooltip {
        display: none;
      }
      .v5pb-cash-widget {
        padding: 4px 6px;
        gap: 6px;
      }
      .v5pb-cash-clip-visual {
        width: 44px;
        height: 36px;
      }
      .v5pb-bankroll-amount {
        font-size: 12px;
      }
      .v5pb-audience-pill {
        font-size: 9.5px;
      }

      /* 2-Column Split Clipboard Call-Sheet in Phone Landscape (0 bottom clip!) */
      .v5pb-scrim {
        align-items: center;
        padding: 5px 10px;
      }
      .v5pb-clipboard {
        max-width: 760px;
        max-height: calc(100dvh - 10px);
        padding: 9px 7px 6px;
      }
      .v5pb-clipboard-clip {
        top: -7px;
        height: 16px;
        width: 96px;
      }
      .v5pb-callsheet-paper {
        display: grid;
        grid-template-columns: minmax(0, 0.96fr) minmax(0, 1.14fr);
        grid-template-rows: minmax(0, 1fr) auto;
        max-height: calc(100dvh - 26px);
      }
      .v5pb-cs-banner {
        grid-column: 1;
        grid-row: 1 / 3;
        height: 100%;
        min-height: 0;
      }
      .v5pb-cs-scroll {
        grid-column: 2;
        grid-row: 1;
        padding: 7px 9px 5px;
        gap: 5px;
      }
      .v5pb-cs-footer {
        grid-column: 2;
        grid-row: 2;
        padding: 5px 9px 6px;
      }
      .v5pb-marquee-launch {
        min-height: 38px;
        padding: 6px 10px;
        font-size: 12.5px;
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// LAYOUT & YARN GRAPH HELPERS
// ============================================================================

interface SafeNodeLayout {
  readonly node: CampaignNodeV5;
  readonly xPct: number;
  readonly yPct: number;
}

interface YarnEdgeSpec {
  readonly fromId: string;
  readonly toId: string;
  readonly kind: 'gold' | 'crimson' | 'velvet';
  readonly isCrossActTarget?: TourActNumberV5;
}

/**
 * Maps `pinX` / `pinY` into edge-safe percentages and runs a pixel-aware
 * separation pass so neither 6-node nor 18-node Acts ever overflow the leather
 * trunk or pile unreadably on narrow 360px/390px phones.
 */
function computeSafeNodeLayout(
  actNodes: readonly CampaignNodeV5[],
  stageWidthPx: number,
  stageHeightPx: number,
  isCompact: boolean,
): SafeNodeLayout[] {
  const approxW = Math.max(300, stageWidthPx);
  const approxH = Math.max(420, stageHeightPx);
  const cardW = isCompact ? 132 : 172;
  const cardH = isCompact ? 128 : 154;

  const padX = clamp(((cardW * 0.54) / approxW) * 100, isCompact ? 20 : 10, 26);
  const padYTop = clamp(((cardH * 0.56 + 44) / approxH) * 100, 12, 24);
  const padYBottom = clamp(((cardH * 0.54 + 14) / approxH) * 100, 8, 18);

  const working = actNodes.map((node) => ({
    node,
    x: clamp(padX + (clamp(node.pinX, 0, 100) / 100) * (100 - padX * 2), padX, 100 - padX),
    y: clamp(
      padYTop + (clamp(node.pinY, 0, 100) / 100) * (100 - padYTop - padYBottom),
      padYTop,
      100 - padYBottom,
    ),
  }));

  const minDx = clamp(((cardW * 0.88) / approxW) * 100, 13, 38);
  const minDy = clamp(((cardH * 0.84) / approxH) * 100, 7, 24);

  for (let iter = 0; iter < 8; iter += 1) {
    for (let i = 0; i < working.length; i += 1) {
      for (let j = i + 1; j < working.length; j += 1) {
        const a = working[i];
        const b = working[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (Math.abs(dx) < minDx && Math.abs(dy) < minDy) {
          const pushX = dx === 0 ? (j % 2 === 0 ? 1 : -1) * 2.5 : Math.sign(dx) * ((minDx - Math.abs(dx)) * 0.28);
          const pushY = dy === 0 ? 2.5 : Math.sign(dy) * ((minDy - Math.abs(dy)) * 0.36);
          a.x = clamp(a.x - pushX, padX, 100 - padX);
          b.x = clamp(b.x + pushX, padX, 100 - padX);
          a.y = clamp(a.y - pushY, padYTop, 100 - padYBottom);
          b.y = clamp(b.y + pushY, padYTop, 100 - padYBottom);
        }
      }
    }
  }

  return working.map((w) => ({
    node: w.node,
    xPct: Number(w.x.toFixed(2)),
    yPct: Number(w.y.toFixed(2)),
  }));
}

function resolveYarnKind(
  edgeSource: 'win' | 'loss' | 'secret',
  sourceNode: CampaignNodeV5,
  targetNode?: CampaignNodeV5,
): 'gold' | 'crimson' | 'velvet' {
  if (
    edgeSource === 'secret' ||
    targetNode?.lane === 'VELVET_SALON' ||
    sourceNode.lane === 'VELVET_SALON'
  ) {
    return 'velvet';
  }
  if (edgeSource === 'loss' || targetNode?.lane === 'REDEMPTION_GRIT') {
    return 'crimson';
  }
  return 'gold';
}

function buildBraidedYarnPathSvg(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  kind: 'gold' | 'crimson' | 'velvet',
  isActivePath: boolean,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  // Natural hanging string sag (sideways curve when nearly vertical)
  const sagY = Math.min(34, Math.max(10, dist * 0.12));
  const swayX = Math.abs(dx) < 28 ? (y1 < y2 ? 12 : -12) : 0;
  const cx = (x1 + x2) * 0.5 + swayX;
  const cy = (y1 + y2) * 0.5 + sagY;

  const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  const dShadow = `M ${(x1 + 2.5).toFixed(1)} ${(y1 + 5).toFixed(1)} Q ${(cx + 2.5).toFixed(1)} ${(cy + 6).toFixed(1)} ${(x2 + 2.5).toFixed(1)} ${(y2 + 5).toFixed(1)}`;

  const palette =
    kind === 'crimson'
      ? { dark: '#5b0c12', mid: '#ce242a', light: '#ff8a8a' }
      : kind === 'velvet'
        ? { dark: '#3f0c47', mid: '#a2217a', light: '#f3a6ff' }
        : { dark: '#6a4007', mid: '#e5af32', light: '#fff2b0' };

  const opacity = isActivePath ? 0.96 : 0.48;

  return `
    <g class="v5pb-yarn-strand is-${kind}" opacity="${opacity}">
      <path d="${dShadow}" fill="none" stroke="rgba(10,4,1,0.58)" stroke-width="7.4" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="${palette.dark}" stroke-width="6.4" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="${palette.mid}" stroke-width="4.4" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="${palette.light}" stroke-width="2.5" stroke-dasharray="4.5 5.5" stroke-linecap="round"/>
    </g>
  `;
}

// ============================================================================
// MAIN VIEW CLASS: `TourTrunkPinboardView`
// ============================================================================

export class TourTrunkPinboardView {
  private container: HTMLElement | null = null;
  private callbacks: TourTrunkPinboardCallbacksV5 | null = null;
  private props: TourTrunkPinboardRenderPropsV5 | null = null;

  private activeAct: TourActNumberV5 = 1;
  private inspectedNodeId: string | null = null;
  private acceptDareForInspected = true;
  private charmDrawerSlotIndex: number | null = null;
  private sponsorLedgerOpen = false;
  private shakingNodeId: string | null = null;

  private resizeObserver: ResizeObserver | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private fullscreenHandler: (() => void) | null = null;
  private viewportResizeHandler: (() => void) | null = null;
  private lastLayoutBucket = '';
  private yarnRafId: number | null = null;

  constructor(container?: HTMLElement, callbacks?: TourTrunkPinboardCallbacksV5) {
    if (container) {
      this.container = container;
    }
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  public mount(container: HTMLElement, callbacks?: TourTrunkPinboardCallbacksV5): void {
    this.container = container;
    if (callbacks) {
      this.callbacks = callbacks;
    }
    ensureTourPinboardStyles();
    this.attachGlobalKeyListener();
    if (this.props) {
      this.render(this.props);
    }
  }

  public setCallbacks(callbacks: TourTrunkPinboardCallbacksV5): void {
    this.callbacks = callbacks;
  }

  public render(props: TourTrunkPinboardRenderPropsV5): void {
    ensureTourPinboardStyles();
    this.props = props;

    if (props.activeAct) {
      this.activeAct = props.activeAct;
    } else if (!this.hasNodesInAct(this.activeAct, props.nodes)) {
      this.activeAct = props.saveState.currentAct;
    } else if (props.saveState.currentAct && !this.container?.querySelector('.v5pb-shell')) {
      this.activeAct = props.saveState.currentAct;
    }

    if (props.selectedNodeId !== undefined) {
      this.inspectedNodeId = props.selectedNodeId;
      this.acceptDareForInspected = true;
    }

    this.attachGlobalKeyListener();
    this.paint();
  }

  public update(props: TourTrunkPinboardRenderPropsV5): void {
    this.render(props);
  }

  public selectAct(actNumber: TourActNumberV5): void {
    this.activeAct = actNumber;
    this.inspectedNodeId = null;
    this.sponsorLedgerOpen = false;
    this.charmDrawerSlotIndex = null;
    this.callbacks?.onSelectAct?.(actNumber);
    this.callbacks?.onPlayUiSfx?.('paper');
    this.paint();
  }

  public inspectNode(nodeId: string | null): void {
    this.inspectedNodeId = nodeId;
    this.acceptDareForInspected = true;
    this.charmDrawerSlotIndex = null;
    this.sponsorLedgerOpen = false;
    this.paint();
  }

  public closeOverlays(): void {
    if (this.inspectedNodeId || this.charmDrawerSlotIndex !== null || this.sponsorLedgerOpen) {
      this.inspectedNodeId = null;
      this.charmDrawerSlotIndex = null;
      this.sponsorLedgerOpen = false;
      this.paint();
    }
  }

  public unmount(): void {
    this.dispose();
  }

  public dispose(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.yarnRafId !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.yarnRafId);
      this.yarnRafId = null;
    }
    if (this.keydownHandler && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.fullscreenHandler && typeof document !== 'undefined') {
      document.removeEventListener('fullscreenchange', this.fullscreenHandler);
      this.fullscreenHandler = null;
    }
    if (this.viewportResizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.viewportResizeHandler);
      this.viewportResizeHandler = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  // --------------------------------------------------------------------------
  // INTERNAL HELPERS
  // --------------------------------------------------------------------------

  private attachGlobalKeyListener(): void {
    if (typeof window !== 'undefined' && !this.keydownHandler) {
      this.keydownHandler = (ev: KeyboardEvent) => {
        if (ev.key === 'Escape') {
          this.closeOverlays();
        }
      };
      window.addEventListener('keydown', this.keydownHandler);
    }
    if (typeof window !== 'undefined' && !this.viewportResizeHandler) {
      this.viewportResizeHandler = () => {
        const bucket = `${window.innerWidth <= 640 ? 'c' : 'w'}:${window.innerHeight <= 500 && window.innerWidth > window.innerHeight ? 'pl' : 'n'}`;
        if (bucket !== this.lastLayoutBucket && this.props) {
          this.lastLayoutBucket = bucket;
          this.paint();
        }
      };
      window.addEventListener('resize', this.viewportResizeHandler);
    }
    if (typeof document !== 'undefined' && !this.fullscreenHandler) {
      this.fullscreenHandler = () => {
        this.syncFullscreenButtonState();
      };
      document.addEventListener('fullscreenchange', this.fullscreenHandler);
    }
  }

  private syncFullscreenButtonState(): void {
    if (!this.container || typeof document === 'undefined') return;
    const btn = this.container.querySelector('[data-v5-fullscreen-toggle]') as HTMLButtonElement | null;
    if (!btn) return;
    const isFs = Boolean(document.fullscreenElement);
    btn.setAttribute('aria-pressed', isFs ? 'true' : 'false');
    btn.setAttribute('aria-label', isFs ? 'Exit Fullscreen' : 'Enter Fullscreen');
    btn.innerHTML = renderFullscreenSvg(isFs);
  }

  private toggleFullscreen(): void {
    if (typeof document === 'undefined') return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }

  private hasNodesInAct(act: TourActNumberV5, nodes: readonly CampaignNodeV5[]): boolean {
    return nodes.some((n) => n.actNumber === act);
  }

  private getCharmsMap(): ReadonlyMap<CharmIdV5, PodiumCharmSpecV5> {
    const map = new Map<CharmIdV5, PodiumCharmSpecV5>();
    for (const c of DEFAULT_PODIUM_CHARMS_V5) {
      map.set(c.charmId, c);
    }
    if (this.props?.charmsCatalog) {
      for (const c of this.props.charmsCatalog) {
        map.set(c.charmId, c);
      }
    }
    return map;
  }

  private getChallenger(id: ChallengerIdV5 | null): TourChallengerSummaryV5 | null {
    if (!id) return null;
    return this.props?.challengersById?.[id] ?? DEFAULT_CHALLENGERS_V5[id] ?? null;
  }

  private getActTitle(act: TourActNumberV5): string {
    return this.props?.actTitles?.[act] ?? DEFAULT_ACT_TITLES_V5[act];
  }

  private isNodeUnlocked(node: CampaignNodeV5, save: BranchingCampaignSaveStateV5): boolean {
    return Boolean(node.initialUnlocked) || save.unlockedNodeIds.includes(node.nodeId);
  }

  private resolveFrontierNodeId(
    actNodes: readonly CampaignNodeV5[],
    save: BranchingCampaignSaveStateV5,
  ): string | null {
    const currentInAct = actNodes.find(
      (n) =>
        n.nodeId === save.currentNodeId &&
        this.isNodeUnlocked(n, save) &&
        !save.wonNodeIds.includes(n.nodeId),
    );
    if (currentInAct) return currentInAct.nodeId;

    const firstUnwonMain = actNodes.find(
      (n) =>
        this.isNodeUnlocked(n, save) &&
        !save.wonNodeIds.includes(n.nodeId) &&
        n.lane === 'MAIN_STAGE',
    );
    if (firstUnwonMain) return firstUnwonMain.nodeId;

    const anyUnwonUnlocked = actNodes.find(
      (n) => this.isNodeUnlocked(n, save) && !save.wonNodeIds.includes(n.nodeId),
    );
    return anyUnwonUnlocked?.nodeId ?? null;
  }

  // --------------------------------------------------------------------------
  // RENDER PIPELINE
  // --------------------------------------------------------------------------

  private paint(): void {
    if (!this.container || !this.props) return;
    const { saveState, nodes } = this.props;
    const charmsMap = this.getCharmsMap();
    const isCompact =
      typeof window !== 'undefined' ? window.innerWidth <= 640 : false;
    const isPhoneLandscape =
      typeof window !== 'undefined'
        ? window.innerHeight <= 500 && window.innerWidth > window.innerHeight
        : false;
    this.lastLayoutBucket = `${isCompact ? 'c' : 'w'}:${isPhoneLandscape ? 'pl' : 'n'}`;
    const approxStageWidth =
      typeof window !== 'undefined'
        ? Math.max(
            300,
            Math.min(1160, window.innerWidth - (isPhoneLandscape ? 256 : isCompact ? 34 : 76)),
          )
        : 980;

    const actNodes = nodes.filter((n) => n.actNumber === this.activeAct);
    const allNodesById = new Map<string, CampaignNodeV5>(nodes.map((n) => [n.nodeId, n]));
    const stageMinHeight = isCompact
      ? clamp(Math.max(580, actNodes.length * 102), 540, 1840)
      : isPhoneLandscape
        ? clamp(Math.max(520, actNodes.length * 90), 480, 1600)
        : clamp(Math.max(540, actNodes.length * 88), 520, 1520);

    const layouts = computeSafeNodeLayout(
      actNodes,
      approxStageWidth,
      stageMinHeight,
      isCompact || isPhoneLandscape,
    );
    const frontierNodeId = this.resolveFrontierNodeId(actNodes, saveState);

    // Collect edges within current Act + distinct cross-Act continuation targets
    const edges: YarnEdgeSpec[] = [];
    const crossActTargets = new Map<TourActNumberV5, { fromId: string; kind: 'gold' | 'crimson' | 'velvet' }>();

    const registerEdge = (
      fromNode: CampaignNodeV5,
      targetId: string,
      edgeSource: 'win' | 'loss' | 'secret',
    ) => {
      const targetNode = allNodesById.get(targetId);
      if (!targetNode) return;
      const kind = resolveYarnKind(edgeSource, fromNode, targetNode);
      if (targetNode.actNumber === this.activeAct) {
        edges.push({ fromId: fromNode.nodeId, toId: targetNode.nodeId, kind });
      } else if (targetNode.actNumber > this.activeAct && !crossActTargets.has(targetNode.actNumber)) {
        crossActTargets.set(targetNode.actNumber, { fromId: fromNode.nodeId, kind });
      }
    };

    for (const node of actNodes) {
      for (const tid of node.onWinUnlockIds) registerEdge(node, tid, 'win');
      for (const tid of node.onLossUnlockIds) registerEdge(node, tid, 'loss');
      if (node.secretUnlockIds) {
        for (const tid of node.secretUnlockIds) registerEdge(node, tid, 'secret');
      }
    }

    const sponsor = SPONSOR_META[saveState.activeSponsor] ?? SPONSOR_META.INDEPENDENT;
    const isFs = typeof document !== 'undefined' && Boolean(document.fullscreenElement);

    // Preserve vertical scroll position of corkboard across state updates
    const prevViewport = this.container.querySelector('.v5pb-board-viewport') as HTMLElement | null;
    const prevScrollTop = prevViewport ? prevViewport.scrollTop : 0;

    this.container.innerHTML = `
      <div class="v5pb-shell" style="--v5pb-trunk-bg: url('${escapeHtml(V5_TOUR_TRUNK_SURFACE)}');" data-act="${this.activeAct}">
        <div class="v5pb-trunk" role="region" aria-label="World Tour Flight Trunk Pinboard">
          <div class="v5pb-corner is-tl" aria-hidden="true"></div>
          <div class="v5pb-corner is-tr" aria-hidden="true"></div>
          <div class="v5pb-corner is-bl" aria-hidden="true"></div>
          <div class="v5pb-corner is-br" aria-hidden="true"></div>
          <div class="v5pb-side-clasp is-left-1" aria-hidden="true"></div>
          <div class="v5pb-side-clasp is-left-2" aria-hidden="true"></div>
          <div class="v5pb-side-clasp is-right-1" aria-hidden="true"></div>
          <div class="v5pb-side-clasp is-right-2" aria-hidden="true"></div>

          <div class="v5pb-felt-frame">
            <!-- TOP CROWN: BANKER'S LAMP + BACK LATCH + 5 ACT LUGGAGE TAGS + SPONSOR SEAL -->
            <header class="v5pb-header">
              <div class="v5pb-lamp-mount" aria-hidden="true">${renderBankersLampSvg()}</div>

              <div class="v5pb-header-left">
                <button
                  type="button"
                  class="v5pb-back-latch"
                  data-action="back-greenroom"
                  aria-label="Back to Green Room"
                >
                  ${renderBackLatchSvg()}
                  <span>Green Room</span>
                </button>
              </div>

              <nav class="v5pb-act-rail" aria-label="Tournament Acts">
                ${this.renderActTabsHtml(nodes, saveState)}
              </nav>

              <div class="v5pb-header-right">
                <button
                  type="button"
                  class="v5pb-sponsor-btn"
                  data-action="open-sponsor"
                  aria-label="Sponsor Contract: ${escapeHtml(sponsor.name)}"
                >
                  ${renderSponsorEmblemSvg(sponsor.id, 24)}
                  <span class="v5pb-sponsor-text">
                    <span class="v5pb-sponsor-kicker">Sponsor</span>
                    <span class="v5pb-sponsor-name">${escapeHtml(sponsor.shortName)}</span>
                  </span>
                </button>
                <button
                  type="button"
                  class="v5pb-fs-btn"
                  data-action="toggle-fullscreen"
                  data-v5-fullscreen-toggle="true"
                  aria-pressed="${isFs ? 'true' : 'false'}"
                  aria-label="${isFs ? 'Exit Fullscreen' : 'Enter Fullscreen'}"
                  title="${isFs ? 'Exit Fullscreen' : 'Fullscreen'}"
                >
                  ${renderFullscreenSvg(isFs)}
                </button>
              </div>
            </header>

            <!-- CORKBOARD PIN STAGE -->
            <div class="v5pb-board-frame">
              <div class="v5pb-cork-tex" aria-hidden="true"></div>
              <div class="v5pb-lamp-wash" aria-hidden="true"></div>
              <div class="v5pb-board-viewport">
                <div class="v5pb-cork-stage" style="min-height: ${stageMinHeight}px;" data-act-stage="${this.activeAct}">
                  <div class="v5pb-stage-plaque-bar">
                    <div class="v5pb-act-plaque">
                      <span>Act ${ACT_ROMAN[this.activeAct]}</span>
                      <span>·</span>
                      <span>${escapeHtml(this.getActTitle(this.activeAct))}</span>
                    </div>
                    <div class="v5pb-yarn-legend" aria-label="Route string legend">
                      <span class="v5pb-legend-item"><span class="v5pb-legend-cord is-gold"></span>Win Path</span>
                      <span class="v5pb-legend-item"><span class="v5pb-legend-cord is-crimson"></span>Redemption</span>
                      <span class="v5pb-legend-item"><span class="v5pb-legend-cord is-velvet"></span>Velvet Salon</span>
                    </div>
                  </div>

                  <svg class="v5pb-yarn-svg" aria-hidden="true"></svg>

                  ${
                    layouts.length > 0
                      ? layouts
                          .map((item) =>
                            this.renderPinnedNodeHtml(
                              item,
                              saveState,
                              frontierNodeId,
                              isCompact,
                            ),
                          )
                          .join('')
                      : this.renderEmptyActHtml()
                  }

                  ${this.renderCrossActTagsHtml(crossActTargets)}
                </div>
              </div>
            </div>

            <!-- BOTTOM RECESSED BRASS LUCKY CHARM TRAY + BRASS CASH CLIP -->
            <footer class="v5pb-brass-tray" aria-label="Podium Lucky Charms and Bankroll">
              <div class="v5pb-tray-charms-group">
                <div class="v5pb-tray-label-col">
                  <span class="v5pb-tray-title">Podium Charms</span>
                  <span class="v5pb-tray-sub">${saveState.equippedCharms.length}/3 · Tap to Swap</span>
                </div>
                <div class="v5pb-charm-slots">
                  ${this.renderBrassTrayCharmSlotsHtml(saveState, charmsMap, isCompact)}
                </div>
              </div>

              <div class="v5pb-cash-widget" aria-label="Bankroll ${escapeHtml(formatUsdFull(saveState.bankrollUsd))} and Live Audience ${escapeHtml(formatAudience(saveState.liveWorldAudience))}">
                <div class="v5pb-cash-clip-visual">${renderCashStackSvg()}</div>
                <div class="v5pb-cash-metrics">
                  <div class="v5pb-bankroll-slip">
                    <div class="v5pb-bankroll-amount">${escapeHtml(formatUsdFull(saveState.bankrollUsd))}</div>
                    <div class="v5pb-bankroll-label">Bankroll</div>
                  </div>
                  <div class="v5pb-audience-pill" title="Live World Audience">
                    ${renderAudienceSignalSvg(13)}
                    <span>${escapeHtml(formatAudience(saveState.liveWorldAudience))} Live</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>

        ${this.renderActiveOverlayHtml(allNodesById, saveState, charmsMap)}
      </div>
    `;

    // Restore corkboard scroll position
    const nextViewport = this.container.querySelector('.v5pb-board-viewport') as HTMLElement | null;
    if (nextViewport && prevScrollTop > 0) {
      nextViewport.scrollTop = prevScrollTop;
    }

    this.bindDomEvents(allNodesById, saveState, charmsMap);
    this.setupYarnGeometrySync(edges, crossActTargets, saveState, allNodesById);
  }

  private renderActTabsHtml(
    nodes: readonly CampaignNodeV5[],
    save: BranchingCampaignSaveStateV5,
  ): string {
    const acts: readonly TourActNumberV5[] = [1, 2, 3, 4, 5];
    return acts
      .map((act) => {
        const actNodes = nodes.filter((n) => n.actNumber === act);
        const unlockedCount = actNodes.filter((n) => this.isNodeUnlocked(n, save)).length;
        const earnedStars = actNodes.reduce((acc, n) => acc + (save.nodeStars[n.nodeId] ?? 0), 0);
        const maxStars = actNodes.length * 3;
        const isActive = act === this.activeAct;
        const isLocked = actNodes.length > 0 && unlockedCount === 0;

        return `
          <button
            type="button"
            class="v5pb-act-tag ${isActive ? 'is-active' : ''} ${isLocked ? 'is-locked' : ''}"
            data-action="select-act"
            data-act="${act}"
            aria-pressed="${isActive ? 'true' : 'false'}"
            aria-label="Act ${ACT_ROMAN[act]}: ${escapeHtml(this.getActTitle(act))}${isLocked ? ' (Locked)' : ''}"
          >
            <span class="v5pb-act-tag-num">
              <span>Act ${ACT_ROMAN[act]}</span>
              ${isLocked ? renderPadlockSvg(10) : ''}
            </span>
            <span class="v5pb-act-tag-meta">
              ${maxStars > 0 ? `${earnedStars}/${maxStars}★` : escapeHtml(this.getActTitle(act))}
            </span>
          </button>
        `;
      })
      .join('');
  }

  private renderPinnedNodeHtml(
    layout: SafeNodeLayout,
    save: BranchingCampaignSaveStateV5,
    frontierNodeId: string | null,
    isCompact: boolean,
  ): string {
    const { node, xPct, yPct } = layout;
    const isUnlocked = this.isNodeUnlocked(node, save);
    const isWon = save.wonNodeIds.includes(node.nodeId);
    const isLost = save.lostNodeIds.includes(node.nodeId) && !isWon;
    const stars = save.nodeStars[node.nodeId] ?? 0;
    const isFrontier = node.nodeId === frontierNodeId;
    const isSelected = node.nodeId === this.inspectedNodeId;
    const isShaking = node.nodeId === this.shakingNodeId;
    const tilt = clamp(node.tiltDeg, -7, 7);

    const classes = [
      'v5pb-node-anchor',
      isUnlocked ? 'is-unlocked' : 'is-locked',
      isWon ? 'is-won' : '',
      isLost ? 'is-lost' : '',
      isFrontier ? 'is-frontier' : '',
      isSelected ? 'is-selected' : '',
      isShaking ? 'is-shaking' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const bodyHtml = this.renderEphemeraBodyHtml(node, stars, isUnlocked, isWon, isLost, isCompact);

    return `
      <button
        type="button"
        class="${classes}"
        style="left: ${xPct}%; top: ${yPct}%; --tilt: ${tilt}deg;"
        data-action="inspect-node"
        data-node-id="${escapeHtml(node.nodeId)}"
        aria-label="${escapeHtml(node.venueName)} — ${escapeHtml(node.showTitle)}${isUnlocked ? '' : ' (Locked)'}"
      >
        <span class="v5pb-node-tack" data-tack-for="${escapeHtml(node.nodeId)}" aria-hidden="true"></span>
        ${isFrontier ? '<span class="v5pb-next-ribbon">Next Stop</span>' : ''}
        ${bodyHtml}
      </button>
    `;
  }

  private renderEphemeraBodyHtml(
    node: CampaignNodeV5,
    stars: 0 | 1 | 2 | 3,
    isUnlocked: boolean,
    isWon: boolean,
    isLost: boolean,
    isCompact: boolean,
  ): string {
    const style: TourEphemeraStyleV5 = node.ephemeraStyle;
    const lockOverlay = !isUnlocked
      ? `<div class="v5pb-lock-badge"><span class="v5pb-lock-pill">${renderPadlockSvg(11)} LOCKED</span></div>`
      : '';
    const statusStamp = isWon
      ? '<span class="v5pb-ink-stamp is-won">Cleared</span>'
      : isLost
        ? '<span class="v5pb-ink-stamp is-lost">Rematch</span>'
        : '';

    if (style === 'TORN_PUB_FLYER') {
      return `
        <div class="v5pb-ticket">
          <span class="v5pb-ticket-stub-txt is-left" aria-hidden="true">TICKET</span>
          <span class="v5pb-ticket-stub-txt is-right" aria-hidden="true">TICKET</span>
          <div class="v5pb-ticket-inner">
            <div class="v5pb-ticket-kicker">${escapeHtml(node.lane === 'REDEMPTION_GRIT' ? 'Redemption Wildcard' : 'Special Ticket')}</div>
            <div class="v5pb-ticket-title">${escapeHtml(node.showTitle)}</div>
            <div class="v5pb-ticket-sub">${escapeHtml(node.venueName)}</div>
          </div>
          ${statusStamp}
          ${lockOverlay}
        </div>
      `;
    }

    if (style === 'BOARDING_PASS') {
      const code = cityToAirportCode(node.cityStamp);
      const starSize = isCompact ? 10 : 11;
      return `
        <div class="v5pb-boarding">
          <div class="v5pb-boarding-airmail" aria-hidden="true"></div>
          <div class="v5pb-boarding-body">
            <div class="v5pb-boarding-main">
              <div class="v5pb-boarding-route">TOUR FLIGHT · ${escapeHtml(node.cityStamp)}</div>
              <div class="v5pb-boarding-title">${escapeHtml(node.venueName)}</div>
            </div>
            <div class="v5pb-boarding-stub">
              <span class="v5pb-boarding-code">${escapeHtml(code)}</span>
              <span class="v5pb-boarding-stars">
                ${renderStarSvg(stars >= 1, starSize)}${renderStarSvg(stars >= 2, starSize)}${renderStarSvg(stars >= 3, starSize)}
              </span>
            </div>
          </div>
          ${statusStamp}
          ${lockOverlay}
        </div>
      `;
    }

    if (style === 'VELVET_WAX_INVITE') {
      const sealSize = isCompact ? 34 : 42;
      return `
        <div class="v5pb-envelope">
          <svg class="v5pb-envelope-flaps" viewBox="0 0 180 116" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="0,0 180,0 90,62" fill="#f3e6cf" stroke="#cdb68c" stroke-width="1.4"/>
            <polyline points="0,116 66,56" fill="none" stroke="rgba(160,132,92,0.45)" stroke-width="1.2"/>
            <polyline points="180,116 114,56" fill="none" stroke="rgba(160,132,92,0.45)" stroke-width="1.2"/>
          </svg>
          <div class="v5pb-envelope-seal">${renderWaxSealSvg(sealSize)}</div>
          <div class="v5pb-envelope-title">${escapeHtml(node.showTitle)}</div>
          <div class="v5pb-envelope-sub">${escapeHtml(node.cityStamp)}</div>
          ${statusStamp}
          ${lockOverlay}
        </div>
      `;
    }

    if (style === 'CALL_SHEET_CLIP') {
      const rival = this.getChallenger(node.challengerId);
      const portraitUrl = node.challengerId
        ? V5_CAST_CUTOUTS.challengers[node.challengerId]
        : V5_CAST_CUTOUTS.maxWelcome;
      const rivalLabel = rival ? rival.name : 'Max Sterling';

      return `
        <div class="v5pb-scouting">
          <div class="v5pb-scouting-head">
            <span>Scouting</span>
            ${node.optionalDare ? '<span class="v5pb-scouting-dare-tag">DARE</span>' : ''}
          </div>
          <div class="v5pb-scouting-portrait-row">
            <div class="v5pb-scouting-portrait-box">
              <img class="v5pb-scouting-img" src="${escapeHtml(portraitUrl)}" alt="${escapeHtml(rivalLabel)}" loading="lazy" />
            </div>
            <div class="v5pb-scouting-notes">
              <div class="v5pb-scouting-rival">${escapeHtml(rivalLabel)}</div>
              <div class="v5pb-scouting-venue">${escapeHtml(node.venueName)}</div>
              <div class="v5pb-scouting-purse">${escapeHtml(formatUsd(node.purseUsd))}</div>
            </div>
          </div>
          ${statusStamp}
          ${lockOverlay}
        </div>
      `;
    }

    // Default: POLAROID_SNAPSHOT
    const venueImg = V5_VENUE_STAGES[node.tierNumber];
    const starSize = isCompact ? 17 : 20;
    return `
      <div class="v5pb-polaroid">
        <div class="v5pb-polaroid-photo-wrap">
          <img class="v5pb-polaroid-photo" src="${escapeHtml(venueImg)}" alt="${escapeHtml(node.venueName)}" loading="lazy" />
        </div>
        <div class="v5pb-polaroid-stars" aria-label="${stars} of 3 stars earned">
          ${renderStarSvg(stars >= 1, starSize)}
          ${renderStarSvg(stars >= 2, starSize)}
          ${renderStarSvg(stars >= 3, starSize)}
        </div>
        <div class="v5pb-polaroid-title">${escapeHtml(node.venueName)}</div>
        <div class="v5pb-polaroid-city">${escapeHtml(node.cityStamp)}</div>
        ${statusStamp}
        ${lockOverlay}
      </div>
    `;
  }

  private renderCrossActTagsHtml(
    crossActTargets: Map<TourActNumberV5, { fromId: string; kind: 'gold' | 'crimson' | 'velvet' }>,
  ): string {
    if (crossActTargets.size === 0) return '';
    const entries = Array.from(crossActTargets.entries());
    return entries
      .map(([targetAct], idx) => {
        const topPct = clamp(88 - idx * 14, 24, 92);
        return `
          <button
            type="button"
            class="v5pb-cross-act-tag"
            style="left: 84%; top: ${topPct}%;"
            data-action="select-act"
            data-act="${targetAct}"
            data-cross-tack="${targetAct}"
            aria-label="Continue yarn route to Act ${ACT_ROMAN[targetAct]}"
          >
            <span>To Act ${ACT_ROMAN[targetAct]}</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        `;
      })
      .join('');
  }

  private renderEmptyActHtml(): string {
    return `
      <div class="v5pb-empty-act">
        <h3>Act ${ACT_ROMAN[this.activeAct]} · ${escapeHtml(this.getActTitle(this.activeAct))}</h3>
        <p>No tour stops pinned to this act yet. Check an earlier Act tab to advance your broadcast run.</p>
      </div>
    `;
  }

  private renderBrassTrayCharmSlotsHtml(
    save: BranchingCampaignSaveStateV5,
    charmsMap: ReadonlyMap<CharmIdV5, PodiumCharmSpecV5>,
    isCompact: boolean,
  ): string {
    const iconSize = isCompact ? 34 : 42;
    const slots: readonly number[] = [0, 1, 2];

    return slots
      .map((slotIdx) => {
        const charmId = save.equippedCharms[slotIdx];
        const charm = charmId ? charmsMap.get(charmId) : undefined;
        if (!charm) {
          const hasReserve = save.unlockedCharms.some((id) => !save.equippedCharms.includes(id));
          return `
            <button
              type="button"
              class="v5pb-charm-slot is-empty"
              data-action="open-charm-drawer"
              data-slot-index="${slotIdx}"
              aria-label="Empty Lucky Charm Slot ${slotIdx + 1}${hasReserve ? ' — tap to equip' : ''}"
            >
              <span class="v5pb-charm-empty-plus" aria-hidden="true">+</span>
              <span class="v5pb-charm-slot-name">${hasReserve ? 'Equip' : `Slot ${slotIdx + 1}`}</span>
              <div class="v5pb-charm-tooltip" role="tooltip">
                <div class="v5pb-charm-tooltip-title">Empty Podium Cup #${slotIdx + 1}</div>
                <div class="v5pb-charm-tooltip-desc">Earn Lucky Charms via Rival Alliances, Secret Velvet Salons, and Sponsor Dares.</div>
                <div class="v5pb-charm-tooltip-hint">Click to open Charm Case</div>
              </div>
            </button>
          `;
        }

        return `
          <button
            type="button"
            class="v5pb-charm-slot is-filled"
            data-action="open-charm-drawer"
            data-slot-index="${slotIdx}"
            aria-label="${escapeHtml(charm.name)}: ${escapeHtml(charm.effectSummary)} (Tap to swap)"
          >
            ${renderCharmArtifactSvg(charm.svgEmblemKind, charm.accentHex, iconSize)}
            <span class="v5pb-charm-slot-name">${escapeHtml(charm.name)}</span>
            <div class="v5pb-charm-tooltip" role="tooltip">
              <div class="v5pb-charm-tooltip-title">${escapeHtml(charm.name)}</div>
              <div class="v5pb-charm-tooltip-desc">${escapeHtml(charm.effectSummary)}</div>
              <div class="v5pb-charm-tooltip-hint">Tap to swap charm</div>
            </div>
          </button>
        `;
      })
      .join('');
  }

  private renderActiveOverlayHtml(
    allNodesById: Map<string, CampaignNodeV5>,
    save: BranchingCampaignSaveStateV5,
    charmsMap: ReadonlyMap<CharmIdV5, PodiumCharmSpecV5>,
  ): string {
    if (this.inspectedNodeId) {
      const node = allNodesById.get(this.inspectedNodeId);
      if (node) {
        return this.renderCallSheetModalHtml(node, save, charmsMap);
      }
    }
    if (this.charmDrawerSlotIndex !== null) {
      return this.renderCharmDrawerHtml(save, charmsMap, this.charmDrawerSlotIndex);
    }
    if (this.sponsorLedgerOpen) {
      return this.renderSponsorLedgerHtml(save);
    }
    return '';
  }

  private renderCallSheetModalHtml(
    node: CampaignNodeV5,
    save: BranchingCampaignSaveStateV5,
    charmsMap: ReadonlyMap<CharmIdV5, PodiumCharmSpecV5>,
  ): string {
    const isUnlocked = this.isNodeUnlocked(node, save);
    const canAfford = save.bankrollUsd >= node.entryFeeUsd;
    const shortfall = Math.max(0, node.entryFeeUsd - save.bankrollUsd);
    const stars = save.nodeStars[node.nodeId] ?? 0;
    const highScore = save.nodeHighScores[node.nodeId] ?? 0;
    const rival = this.getChallenger(node.challengerId);
    const portraitUrl = node.challengerId
      ? V5_CAST_CUTOUTS.challengers[node.challengerId]
      : V5_CAST_CUTOUTS.maxWelcome;
    const affinityVal = node.challengerId ? (save.rivalAffinity[node.challengerId] ?? 0) : 0;
    const affinity = affinityDescriptor(affinityVal);

    const laneBadgeClass =
      node.lane === 'REDEMPTION_GRIT'
        ? 'is-redemption'
        : node.lane === 'VELVET_SALON'
          ? 'is-velvet'
          : '';

    const rewardCharm = node.rewardCharmId ? charmsMap.get(node.rewardCharmId) : undefined;
    const formatLabels = node.featuredFormats
      .slice(0, 4)
      .map((f) => FORMAT_SHORT_LABEL[f] ?? f)
      .join(' · ');

    const dareHtml = node.optionalDare
      ? `
        <div class="v5pb-dare-slip">
          <div>
            <div class="v5pb-dare-kicker">${escapeHtml(SPONSOR_META[node.optionalDare.sponsor].name)} Showman Dare</div>
            <div class="v5pb-dare-desc">${escapeHtml(node.optionalDare.description)}</div>
            <div class="v5pb-dare-bonus">+${escapeHtml(formatUsd(node.optionalDare.bonusPurseUsd))} Purse · +${escapeHtml(formatAudience(node.optionalDare.bonusViewers))} Viewers</div>
          </div>
          <button
            type="button"
            class="v5pb-dare-toggle ${this.acceptDareForInspected ? 'is-accepted' : ''}"
            data-action="toggle-dare"
            aria-pressed="${this.acceptDareForInspected ? 'true' : 'false'}"
          >
            ${this.acceptDareForInspected ? 'Dare On' : 'Accept Dare'}
          </button>
        </div>
      `
      : '';

    const rewardHtml = rewardCharm
      ? `
        <div class="v5pb-reward-note">
          ${renderCharmArtifactSvg(rewardCharm.svgEmblemKind, rewardCharm.accentHex, 28)}
          <div>
            <strong>Charm Reward: ${escapeHtml(rewardCharm.name)}</strong> — ${escapeHtml(rewardCharm.effectSummary)}
          </div>
        </div>
      `
      : '';

    const disabledReason = !isUnlocked
      ? 'Advance along connected yarn stops to unlock this call-sheet.'
      : !canAfford
        ? `Need ${formatUsdFull(shortfall)} more Bankroll for entry — play a free or Redemption stop first.`
        : '';

    return `
      <div class="v5pb-scrim" data-action="close-overlay" role="dialog" aria-modal="true" aria-label="Call Sheet: ${escapeHtml(node.showTitle)}">
        <div class="v5pb-clipboard" data-stop-propagation="true">
          <div class="v5pb-clipboard-clip" aria-hidden="true"></div>
          <div class="v5pb-callsheet-paper">
            <div class="v5pb-cs-banner">
              <img class="v5pb-cs-banner-img" src="${escapeHtml(V5_VENUE_STAGES[node.tierNumber])}" alt="${escapeHtml(node.venueName)}" />
              <div class="v5pb-cs-banner-grad" aria-hidden="true"></div>
              <button type="button" class="v5pb-cs-close" data-action="close-overlay" aria-label="Close Call Sheet">&times;</button>
              <div class="v5pb-cs-banner-text">
                <div class="v5pb-cs-lane-row">
                  <span class="v5pb-cs-lane-badge ${laneBadgeClass}">${escapeHtml(LANE_LABEL[node.lane])}</span>
                  <span class="v5pb-cs-city">${escapeHtml(node.cityStamp)} · Act ${ACT_ROMAN[node.actNumber]}</span>
                </div>
                <h2 class="v5pb-cs-show-title">${escapeHtml(node.showTitle)}</h2>
                <div class="v5pb-cs-venue-sub">${escapeHtml(node.venueName)}</div>
              </div>
            </div>

            <div class="v5pb-cs-scroll">
              <p class="v5pb-cs-blurb">"${escapeHtml(node.hookBlurb)}"</p>

              <div class="v5pb-cs-challenger">
                <div class="v5pb-cs-avatar">
                  <img src="${escapeHtml(portraitUrl)}" alt="${escapeHtml(rival ? rival.name : 'Host Max Sterling')}" />
                </div>
                <div class="v5pb-cs-rival-info">
                  <div class="v5pb-cs-rival-kicker">${rival ? 'Head-to-Head Challenger' : 'Solo Qualifying Showcase'}</div>
                  <div class="v5pb-cs-rival-name">${escapeHtml(rival ? rival.name : 'Host Max Sterling')}</div>
                  <div class="v5pb-cs-rival-title">${escapeHtml(rival ? rival.title : `Beat House Target: ${node.soloTargetScore.toLocaleString('en-US')} PTS`)}</div>
                  ${
                    rival
                      ? `<span class="v5pb-affinity-tag ${affinity.toneClass}">${escapeHtml(affinity.label)} (${affinityVal >= 0 ? `+${affinityVal}` : affinityVal})</span>`
                      : ''
                  }
                </div>
              </div>

              <div class="v5pb-cs-stakes">
                <div class="v5pb-stake-cell">
                  <div class="v5pb-stake-label">Winner Purse</div>
                  <div class="v5pb-stake-val is-gold">${escapeHtml(formatUsd(node.purseUsd))}</div>
                </div>
                <div class="v5pb-stake-cell">
                  <div class="v5pb-stake-label">Live Audience</div>
                  <div class="v5pb-stake-val is-green">${escapeHtml(formatAudience(node.baseAudience))}</div>
                </div>
                <div class="v5pb-stake-cell">
                  <div class="v5pb-stake-label">Entry Fee</div>
                  <div class="v5pb-stake-val ${!canAfford ? 'is-danger' : ''}">${node.entryFeeUsd > 0 ? escapeHtml(formatUsd(node.entryFeeUsd)) : 'FREE'}</div>
                </div>
              </div>

              <div class="v5pb-cs-specs">
                <span class="v5pb-spec-chip">${node.boardCols}&times;${node.boardRows} Stage Board</span>
                <span class="v5pb-spec-chip">${node.maxTurns} Turns</span>
                <span class="v5pb-spec-chip">${escapeHtml(resolveBoardTwistLabel(node))}</span>
                ${formatLabels ? `<span class="v5pb-spec-chip">${escapeHtml(formatLabels)}</span>` : ''}
                ${highScore > 0 ? `<span class="v5pb-spec-chip">Best: ${highScore.toLocaleString('en-US')} PTS (${stars}/3★)</span>` : ''}
              </div>

              ${dareHtml}
              ${rewardHtml}
            </div>

            <div class="v5pb-cs-footer">
              ${disabledReason ? `<div class="v5pb-cs-warn">${escapeHtml(disabledReason)}</div>` : ''}
              <button
                type="button"
                class="v5pb-marquee-launch"
                data-action="launch-node"
                data-node-id="${escapeHtml(node.nodeId)}"
                ${!isUnlocked || !canAfford ? 'disabled' : ''}
              >
                <span>${!isUnlocked ? 'Stop Locked' : 'Step Onto Stage'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderCharmDrawerHtml(
    save: BranchingCampaignSaveStateV5,
    charmsMap: ReadonlyMap<CharmIdV5, PodiumCharmSpecV5>,
    slotIndex: number,
  ): string {
    const allCharms = Array.from(charmsMap.values());
    const unlockedSet = new Set(save.unlockedCharms);
    const unlockedCharms = allCharms.filter((c) => unlockedSet.has(c.charmId));
    const lockedCharms = allCharms.filter((c) => !unlockedSet.has(c.charmId));

    const slotButtons = [0, 1, 2]
      .map((idx) => {
        const equippedId = save.equippedCharms[idx];
        const eqSpec = equippedId ? charmsMap.get(equippedId) : undefined;
        return `
          <button
            type="button"
            class="v5pb-slot-pill ${idx === slotIndex ? 'is-target' : ''}"
            data-action="select-charm-slot"
            data-slot-index="${idx}"
          >
            Cup ${idx + 1}: ${escapeHtml(eqSpec ? eqSpec.name : 'Empty')}
          </button>
        `;
      })
      .join('');

    const renderCard = (charm: PodiumCharmSpecV5, isUnlocked: boolean) => {
      const equippedIdx = save.equippedCharms.indexOf(charm.charmId);
      const isEquipped = equippedIdx >= 0;
      const stateText = !isUnlocked
        ? 'Locked'
        : isEquipped
          ? `Equipped in Cup ${equippedIdx + 1} · Tap to Unequip`
          : `Equip in Cup ${slotIndex + 1}`;

      return `
        <button
          type="button"
          class="v5pb-charm-card ${isEquipped ? 'is-equipped' : ''}"
          data-action="toggle-equip-charm"
          data-charm-id="${escapeHtml(charm.charmId)}"
          ${!isUnlocked ? 'disabled' : ''}
        >
          ${renderCharmArtifactSvg(charm.svgEmblemKind, charm.accentHex, 44)}
          <div class="v5pb-charm-card-info">
            <div class="v5pb-charm-card-name">${escapeHtml(charm.name)}</div>
            <div class="v5pb-charm-card-effect">${escapeHtml(charm.effectSummary)}</div>
            <div class="v5pb-charm-card-origin">${escapeHtml(charm.originSource)}</div>
            <span class="v5pb-charm-card-state">${escapeHtml(stateText)}</span>
          </div>
        </button>
      `;
    };

    return `
      <div class="v5pb-scrim" data-action="close-overlay" role="dialog" aria-modal="true" aria-label="Podium Lucky Charm Case">
        <div class="v5pb-drawer" data-stop-propagation="true">
          <div class="v5pb-drawer-head">
            <div>
              <h2 class="v5pb-drawer-title">Velvet Lucky Charm Case</h2>
              <div class="v5pb-drawer-sub">Equip up to 3 stage relics onto your brass contestant podium (${unlockedCharms.length}/${allCharms.length} unlocked)</div>
            </div>
            <button type="button" class="v5pb-cs-close" style="position:static;" data-action="close-overlay" aria-label="Close Charm Case">&times;</button>
          </div>
          <div class="v5pb-drawer-body">
            <div class="v5pb-slot-selector" role="tablist" aria-label="Choose Podium Cup">
              ${slotButtons}
            </div>
            <div class="v5pb-charm-grid">
              ${
                unlockedCharms.length > 0
                  ? unlockedCharms.map((c) => renderCard(c, true)).join('')
                  : '<div style="font-size:12px;color:#e6d5b2;">Win alliances, Redemption Wildcards, or Velvet Salons to earn your first Podium Lucky Charm.</div>'
              }
            </div>
            ${
              lockedCharms.length > 0
                ? `
                  <div style="font-family:Cinzel,Georgia,serif;font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#d6b267;margin-top:4px;">Undiscovered Charms</div>
                  <div class="v5pb-charm-grid">
                    ${lockedCharms.map((c) => renderCard(c, false)).join('')}
                  </div>
                `
                : ''
            }
          </div>
        </div>
      </div>
    `;
  }

  private renderSponsorLedgerHtml(save: BranchingCampaignSaveStateV5): string {
    const factions: readonly SponsorFactionIdV5[] = [
      'INDEPENDENT',
      'APEX_NETWORK',
      'VELVET_SOCIETY',
    ];
    const canSwitch = Boolean(this.callbacks?.onSelectSponsor);

    return `
      <div class="v5pb-scrim" data-action="close-overlay" role="dialog" aria-modal="true" aria-label="Sponsor Contract Ledger">
        <div class="v5pb-drawer" style="max-width:480px;" data-stop-propagation="true">
          <div class="v5pb-drawer-head">
            <div>
              <h2 class="v5pb-drawer-title">Broadcast Sponsor Contract</h2>
              <div class="v5pb-drawer-sub">Your backstage choices shape network favor, dares, and secret invitations.</div>
            </div>
            <button type="button" class="v5pb-cs-close" style="position:static;" data-action="close-overlay" aria-label="Close Sponsor Ledger">&times;</button>
          </div>
          <div class="v5pb-drawer-body">
            <div class="v5pb-sponsor-list">
              ${factions
                .map((fid) => {
                  const meta = SPONSOR_META[fid];
                  const isActive = save.activeSponsor === fid;
                  const rep = clamp(save.sponsorRep[fid] ?? 0, 0, 100);
                  return `
                    <div class="v5pb-sponsor-card ${isActive ? 'is-active' : ''}">
                      ${renderSponsorEmblemSvg(fid, 38)}
                      <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                          <strong style="font-family:Cinzel,Georgia,serif;font-size:13px;color:#fae19e;">${escapeHtml(meta.name)}</strong>
                          <span style="font-family:'JetBrains Mono',monospace;font-size:10.5px;color:#9ef2c8;">Rep ${rep}/100</span>
                        </div>
                        <div style="font-size:11px;color:#efe3cb;margin-top:2px;">${escapeHtml(meta.perk)}</div>
                        <div class="v5pb-rep-track"><div class="v5pb-rep-fill" style="width:${rep}%;"></div></div>
                      </div>
                      ${
                        isActive
                          ? '<span style="font-family:Cinzel,Georgia,serif;font-size:9.5px;font-weight:800;padding:4px 8px;border-radius:4px;background:#1b8c52;color:#fff7dc;">ACTIVE</span>'
                          : canSwitch
                            ? `<button type="button" class="v5pb-dare-toggle" data-action="switch-sponsor" data-sponsor="${fid}">Sign</button>`
                            : ''
                      }
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // DOM EVENT WIRING
  // --------------------------------------------------------------------------

  private bindDomEvents(
    allNodesById: Map<string, CampaignNodeV5>,
    save: BranchingCampaignSaveStateV5,
    _charmsMap: ReadonlyMap<CharmIdV5, PodiumCharmSpecV5>,
  ): void {
    if (!this.container) return;

    this.container.onclick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;

      const actionEl = target.closest('[data-action]') as HTMLElement | null;
      if (!actionEl) return;

      const action = actionEl.dataset.action;

      // Prevent scrim clicks when clicking inside modal panels
      if (action === 'close-overlay' && actionEl.classList.contains('v5pb-scrim')) {
        if (target.closest('[data-stop-propagation="true"]')) {
          return;
        }
      }

      switch (action) {
        case 'back-greenroom': {
          this.callbacks?.onPlayUiSfx?.('click');
          this.callbacks?.onBackToGreenRoom();
          break;
        }
        case 'toggle-fullscreen': {
          this.callbacks?.onPlayUiSfx?.('click');
          this.toggleFullscreen();
          break;
        }
        case 'select-act': {
          const act = Number(actionEl.dataset.act) as TourActNumberV5;
          if (act >= 1 && act <= 5) {
            this.selectAct(act);
          }
          break;
        }
        case 'inspect-node': {
          const nodeId = actionEl.dataset.nodeId;
          if (!nodeId) return;
          const node = allNodesById.get(nodeId);
          if (!node) return;
          const unlocked = this.isNodeUnlocked(node, save);
          if (!unlocked) {
            this.shakingNodeId = nodeId;
            this.callbacks?.onPlayUiSfx?.('locked');
          } else {
            this.shakingNodeId = null;
            this.callbacks?.onPlayUiSfx?.('pin');
          }
          this.inspectedNodeId = nodeId;
          this.acceptDareForInspected = Boolean(node.optionalDare);
          this.charmDrawerSlotIndex = null;
          this.sponsorLedgerOpen = false;
          this.paint();
          break;
        }
        case 'toggle-dare': {
          this.acceptDareForInspected = !this.acceptDareForInspected;
          this.callbacks?.onPlayUiSfx?.('click');
          this.paint();
          break;
        }
        case 'launch-node': {
          const nodeId = actionEl.dataset.nodeId;
          if (!nodeId) return;
          const node = allNodesById.get(nodeId);
          if (!node) return;
          if (!this.isNodeUnlocked(node, save) || save.bankrollUsd < node.entryFeeUsd) {
            this.callbacks?.onPlayUiSfx?.('locked');
            return;
          }
          this.callbacks?.onPlayUiSfx?.('launch');
          this.callbacks?.onLaunchNode(node, {
            acceptDare: Boolean(node.optionalDare && this.acceptDareForInspected),
          });
          break;
        }
        case 'open-charm-drawer': {
          const idx = clamp(Number(actionEl.dataset.slotIndex ?? 0), 0, 2);
          this.charmDrawerSlotIndex = idx;
          this.inspectedNodeId = null;
          this.sponsorLedgerOpen = false;
          this.callbacks?.onPlayUiSfx?.('charm');
          this.paint();
          break;
        }
        case 'select-charm-slot': {
          this.charmDrawerSlotIndex = clamp(Number(actionEl.dataset.slotIndex ?? 0), 0, 2);
          this.callbacks?.onPlayUiSfx?.('click');
          this.paint();
          break;
        }
        case 'toggle-equip-charm': {
          const charmId = actionEl.dataset.charmId as CharmIdV5 | undefined;
          if (!charmId || !save.unlockedCharms.includes(charmId)) return;
          const next = [...save.equippedCharms];
          const existingIdx = next.indexOf(charmId);
          const targetSlot = this.charmDrawerSlotIndex ?? 0;

          if (existingIdx >= 0) {
            next.splice(existingIdx, 1);
          } else if (targetSlot < next.length) {
            next[targetSlot] = charmId;
          } else if (next.length < 3) {
            next.push(charmId);
          } else {
            next[2] = charmId;
          }

          // Optimistically mirror on saveState reference for responsive tray feedback,
          // while firing the canonical callback so the owner persists the change.
          save.equippedCharms = next.slice(0, 3);
          this.callbacks?.onPlayUiSfx?.('charm');
          this.callbacks?.onEquipCharms([...save.equippedCharms]);
          this.paint();
          break;
        }
        case 'open-sponsor': {
          this.sponsorLedgerOpen = true;
          this.inspectedNodeId = null;
          this.charmDrawerSlotIndex = null;
          this.callbacks?.onPlayUiSfx?.('paper');
          this.paint();
          break;
        }
        case 'switch-sponsor': {
          const sponsorId = actionEl.dataset.sponsor as SponsorFactionIdV5 | undefined;
          if (!sponsorId) return;
          save.activeSponsor = sponsorId;
          this.callbacks?.onPlayUiSfx?.('pin');
          this.callbacks?.onSelectSponsor?.(sponsorId);
          this.paint();
          break;
        }
        case 'close-overlay': {
          this.callbacks?.onPlayUiSfx?.('click');
          this.closeOverlays();
          break;
        }
        default:
          break;
      }
    };
  }

  // --------------------------------------------------------------------------
  // EXACT TACK-TO-TACK SVG YARN GEOMETRY ENGINE
  // --------------------------------------------------------------------------

  private setupYarnGeometrySync(
    edges: readonly YarnEdgeSpec[],
    crossActTargets: Map<TourActNumberV5, { fromId: string; kind: 'gold' | 'crimson' | 'velvet' }>,
    save: BranchingCampaignSaveStateV5,
    allNodesById: Map<string, CampaignNodeV5>,
  ): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.yarnRafId !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.yarnRafId);
      this.yarnRafId = null;
    }

    const stage = this.container?.querySelector('.v5pb-cork-stage') as HTMLElement | null;
    const svg = this.container?.querySelector('.v5pb-yarn-svg') as SVGSVGElement | null;
    if (!stage || !svg) return;

    const drawYarns = () => {
      const stageRect = stage.getBoundingClientRect();
      if (stageRect.width < 10 || stageRect.height < 10) return;

      svg.setAttribute('viewBox', `0 0 ${stageRect.width.toFixed(1)} ${stageRect.height.toFixed(1)}`);

      const tackCenters = new Map<string, { x: number; y: number }>();
      const tacks = stage.querySelectorAll('[data-tack-for]');
      tacks.forEach((el) => {
        const nodeId = (el as HTMLElement).dataset.tackFor;
        if (!nodeId) return;
        const r = el.getBoundingClientRect();
        tackCenters.set(nodeId, {
          x: r.left - stageRect.left + r.width * 0.5,
          y: r.top - stageRect.top + r.height * 0.5,
        });
      });

      const paths: string[] = [];

      for (const edge of edges) {
        const a = tackCenters.get(edge.fromId);
        const b = tackCenters.get(edge.toId);
        if (!a || !b) continue;
        const toNode = allNodesById.get(edge.toId);
        const isActive = Boolean(toNode && this.isNodeUnlocked(toNode, save));
        paths.push(buildBraidedYarnPathSvg(a.x, a.y, b.x, b.y, edge.kind, isActive));
      }

      crossActTargets.forEach((meta, targetAct) => {
        const fromPt = tackCenters.get(meta.fromId);
        const crossEl = stage.querySelector(`[data-cross-tack="${targetAct}"]`) as HTMLElement | null;
        if (!fromPt || !crossEl) return;
        const r = crossEl.getBoundingClientRect();
        const toX = r.left - stageRect.left + r.width * 0.25;
        const toY = r.top - stageRect.top + r.height * 0.5;
        const fromNode = allNodesById.get(meta.fromId);
        const isActive = Boolean(fromNode && save.wonNodeIds.includes(fromNode.nodeId));
        paths.push(buildBraidedYarnPathSvg(fromPt.x, fromPt.y, toX, toY, meta.kind, isActive));
      });

      svg.innerHTML = paths.join('');
    };

    if (typeof requestAnimationFrame === 'function') {
      this.yarnRafId = requestAnimationFrame(() => {
        this.yarnRafId = null;
        drawYarns();
      });
    } else {
      drawYarns();
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        drawYarns();
      });
      this.resizeObserver.observe(stage);
    }
  }
}
