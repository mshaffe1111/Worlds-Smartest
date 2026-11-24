// ============================================================================
// WORLD'S SMARTEST v5.0 — Mahogany & Brass Rotary Topic Jukebox
// Matches approved visual target `mockup_v5_topic_wheel_menu_1795482685667.jpg`:
//  • Replaces dark-blue SaaS category modals with a carved mahogany-and-brass
//    theatrical jukebox cabinet lit by overhead stage lamps
//  • Glowing emerald-and-gold `TOPIC JUKEBOX` marquee header crowned by a
//    sculpted gold crown & flanked by twin golden trophies
//  • Interactive 12-Domain Rotary Jukebox Wheel (pointer-draggable central
//    10-hole spun-brass rotary dial + `"All 12 Domains"` center brass hub +
//    glowing golden pointer + 12 enameled circular domain medallions with
//    custom SVG emblems & personal accuracy mastery stars — ZERO SQL counts!)
//  • Expandable brass Subcategory / Topic Strip + Instant Search supporting
//    all 157 subcategories via `ForgeEngine` / `BriefingTaxonomyAdapter`
//  • Two physical riveted emerald-and-brass Throw-Switches (`7-Format Mix` /
//    `Classic` and `Shot Clock` / `Relaxed ∞`), brass run-length detents
//    (`5 / 10 / 20 / 50`), academic difficulty detent rail, and chunky
//    emerald-and-brass `START CUSTOM SHOW` stage pull-lever!
//  • Self-contained `<style id="v5-topic-jukebox-styles">` — ZERO glass blur
//    filters, ZERO OS emojis, ZERO raw database row counters!
// ============================================================================

import { normalizeBriefingDifficultyPreset } from '../forge/QuestionDifficultyCalibration';
import {
  FORGE_DOMAINS,
  type BriefingDifficultyPreset,
  type DomainId,
  type ForgeUniverseCounts,
} from '../forge/types';
import {
  buildNormalizedTaxonomyTree,
  countTaxonomyNodes,
  prefetchExternalTaxonomyJson,
  searchTaxonomyTree,
  type BriefingDrillLaunchSpec,
  type BriefingRoundCount,
  type TaxonomyL0Domain,
  type TaxonomyL1Category,
  type TaxonomyL2Topic,
} from '../ui/BriefingTaxonomyAdapter';
import type { BriefingFormatModeV4, TimerPaceModeV4 } from '../v4/contracts';

export interface TopicJukeboxLaunchSpec extends BriefingDrillLaunchSpec {
  readonly formatMode: BriefingFormatModeV4;
  readonly timerPace: TimerPaceModeV4;
}

export interface TopicJukeboxAccuracyStat {
  readonly pct: number;
  readonly total: number;
}

export interface TopicJukeboxOpenOptions {
  readonly initialDomainId?: DomainId | null;
  readonly initialL1SubcategoryId?: string | null;
  readonly initialL2TopicId?: string | null;
  readonly initialSearchQuery?: string;
  readonly initialFormatMode?: BriefingFormatModeV4;
  readonly initialTimerPace?: TimerPaceModeV4;
  readonly initialDifficulty?: BriefingDifficultyPreset;
  readonly initialCount?: BriefingRoundCount;
  readonly forgeInstance?: unknown;
  readonly universeCounts?: ForgeUniverseCounts | null;
  readonly domainAccuracyOverrides?: Partial<Record<DomainId, TopicJukeboxAccuracyStat>>;
  readonly mode?: 'page' | 'modal';
}

export interface TopicJukeboxCallbacks {
  readonly onStartCustomShow: (spec: TopicJukeboxLaunchSpec) => void;
  readonly onClose: () => void;
  readonly onChangeFormatMode?: (mode: BriefingFormatModeV4) => void;
  readonly onChangeTimerPace?: (pace: TimerPaceModeV4) => void;
  readonly onToggleFullscreen?: (isFullscreen: boolean) => void;
  readonly onInteractionFeedback?: (
    kind: 'dial_tick' | 'switch_flip' | 'lever_pull' | 'tap',
  ) => void;
}

const STYLE_ID = 'v5-topic-jukebox-styles';
const STORAGE_FORMAT_KEY = 'ws_briefing_format_mode_v4';
const STORAGE_TIMER_KEY = 'ws_briefing_timer_pace_v4';
const STORAGE_DIFF_KEY = 'ws_preferred_difficulty_v2';
const STORAGE_ANALYTICS_KEY = 'ws_career_analytics_v1';

const ROUND_LENGTH_DETENTS: readonly BriefingRoundCount[] = [5, 10, 20, 50];

const DIFFICULTY_DETENTS: ReadonlyArray<{
  readonly id: BriefingDifficultyPreset;
  readonly shortLabel: string;
}> = [
  { id: 'ADAPTIVE', shortLabel: 'Adaptive' },
  { id: 'MIDDLE_SCHOOL', shortLabel: 'Mid School' },
  { id: 'HIGH_SCHOOL', shortLabel: 'High School' },
  { id: 'COLLEGE', shortLabel: 'College' },
  { id: 'GRADUATE', shortLabel: 'Graduate' },
  { id: 'MENSA', shortLabel: 'Mensa' },
];

interface DomainVisualTheme {
  readonly enamelTop: string;
  readonly enamelBottom: string;
  readonly wheelShortLabel: string;
}

const DOMAIN_MEDALLION_THEMES: Readonly<Record<DomainId, DomainVisualTheme>> = {
  0: { enamelTop: '#249aa8', enamelBottom: '#0d4e5a', wheelShortLabel: 'History' },
  1: { enamelTop: '#296cd4', enamelBottom: '#0e2d6e', wheelShortLabel: 'Science' },
  2: { enamelTop: '#d6a438', enamelBottom: '#6f4c0e', wheelShortLabel: 'Geography' },
  3: { enamelTop: '#c28b42', enamelBottom: '#5e3912', wheelShortLabel: 'Arts' },
  4: { enamelTop: '#3a4a6e', enamelBottom: '#161f38', wheelShortLabel: 'Film & Pop' },
  5: { enamelTop: '#1ea05c', enamelBottom: '#0a4f2c', wheelShortLabel: 'Sports' },
  6: { enamelTop: '#1f9cb5', enamelBottom: '#0a4859', wheelShortLabel: 'Tech' },
  7: { enamelTop: '#2e9e4a', enamelBottom: '#114d20', wheelShortLabel: 'Nature' },
  8: { enamelTop: '#b92c34', enamelBottom: '#5c0e15', wheelShortLabel: 'Society' },
  9: { enamelTop: '#cc6828', enamelBottom: '#64290a', wheelShortLabel: 'Food' },
  10: { enamelTop: '#be352c', enamelBottom: '#5c1210', wheelShortLabel: 'Myth & Lit' },
  11: { enamelTop: '#7643bd', enamelBottom: '#351863', wheelShortLabel: 'Logic' },
};

// Clockwise order starting from top-left / 12 o'clock matching balanced wheel symmetry
const WHEEL_DOMAIN_ORDER: readonly DomainId[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

interface PersonalAccuracyLookup {
  domainStats: Partial<Record<DomainId, TopicJukeboxAccuracyStat>>;
  subcatStats: Record<string, TopicJukeboxAccuracyStat>;
}

function escapeHtml(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readLocalPref(key: string): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function writeLocalPref(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage restrictions
  }
}

function readPersonalAccuracyLookup(
  overrides?: Partial<Record<DomainId, TopicJukeboxAccuracyStat>>,
): PersonalAccuracyLookup {
  const domainStats: Partial<Record<DomainId, TopicJukeboxAccuracyStat>> = {};
  const subcatStats: Record<string, TopicJukeboxAccuracyStat> = {};

  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_ANALYTICS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          byDomain?: Array<{ right?: number; wrong?: number }>;
          events?: Array<{ subcatLabel?: string; correct?: boolean }>;
        } | null;

        if (parsed && Array.isArray(parsed.byDomain)) {
          parsed.byDomain.forEach((entry, idx) => {
            if (idx < 0 || idx > 11) return;
            const right = Math.max(0, Math.floor(Number(entry?.right) || 0));
            const wrong = Math.max(0, Math.floor(Number(entry?.wrong) || 0));
            const total = right + wrong;
            if (total > 0) {
              domainStats[idx as DomainId] = {
                pct: Math.round((right / total) * 100),
                total,
              };
            }
          });
        }

        if (parsed && Array.isArray(parsed.events)) {
          const map = new Map<string, { right: number; total: number }>();
          for (const ev of parsed.events) {
            const label =
              typeof ev?.subcatLabel === 'string'
                ? ev.subcatLabel.trim().toLowerCase()
                : '';
            if (!label) continue;
            const rec = map.get(label) ?? { right: 0, total: 0 };
            rec.total += 1;
            if (ev.correct) rec.right += 1;
            map.set(label, rec);
          }
          for (const [k, rec] of map.entries()) {
            if (rec.total > 0) {
              subcatStats[k] = {
                pct: Math.round((rec.right / rec.total) * 100),
                total: rec.total,
              };
            }
          }
        }
      }
    }
  } catch {
    // Ignore malformed analytics storage cleanly
  }

  if (overrides) {
    for (const [k, stat] of Object.entries(overrides)) {
      const id = Number(k) as DomainId;
      if (stat && Number.isInteger(id) && id >= 0 && id <= 11) {
        domainStats[id] = stat;
      }
    }
  }

  return { domainStats, subcatStats };
}

function accuracyToMasteryStars(stat?: TopicJukeboxAccuracyStat): 0 | 1 | 2 | 3 {
  if (!stat || stat.total <= 0) return 0;
  if (stat.pct >= 80 && stat.total >= 3) return 3;
  if (stat.pct >= 60) return 2;
  return 1;
}

// ============================================================================
// BESPOKE SCULPTED SVG ARTWORK (CROWN, TROPHIES, 12 DOMAIN EMBLEMS, ROTOR)
// ============================================================================

function renderCrownSvg(): string {
  return `
    <svg class="v5jb-crown-svg" viewBox="0 0 96 48" aria-hidden="true">
      <defs>
        <linearGradient id="v5jb-crown-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8cc"/>
          <stop offset="45%" stop-color="#f4c24d"/>
          <stop offset="100%" stop-color="#9e6110"/>
        </linearGradient>
      </defs>
      <path d="M 14 40 L 8 15 L 28 27 L 48 6 L 68 27 L 88 15 L 82 40 Z"
            fill="url(#v5jb-crown-g)" stroke="#5b3205" stroke-width="2.4" stroke-linejoin="round"/>
      <rect x="13" y="38" width="70" height="7" rx="3" fill="url(#v5jb-crown-g)" stroke="#5b3205" stroke-width="2"/>
      <circle cx="8" cy="13" r="3.6" fill="#fff5be" stroke="#6d3f07" stroke-width="1.3"/>
      <circle cx="48" cy="5" r="4.2" fill="#fff5be" stroke="#6d3f07" stroke-width="1.3"/>
      <circle cx="88" cy="13" r="3.6" fill="#fff5be" stroke="#6d3f07" stroke-width="1.3"/>
    </svg>
  `;
}

function renderTrophyPedestalSvg(): string {
  return `
    <svg class="v5jb-trophy-svg" viewBox="0 0 80 108" aria-hidden="true">
      <defs>
        <linearGradient id="v5jb-tr-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff6c0"/>
          <stop offset="42%" stop-color="#e8b13e"/>
          <stop offset="82%" stop-color="#a26512"/>
          <stop offset="100%" stop-color="#603606"/>
        </linearGradient>
      </defs>
      <!-- Cup handles -->
      <path d="M 20 22 C 6 22, 6 48, 24 50 M 60 22 C 74 22, 74 48, 56 50"
            fill="none" stroke="url(#v5jb-tr-gold)" stroke-width="4.5" stroke-linecap="round"/>
      <!-- Cup bowl -->
      <path d="M 18 14 L 62 14 L 57 44 C 55 56, 48 63, 40 63 C 32 63, 25 56, 23 44 Z"
            fill="url(#v5jb-tr-gold)" stroke="#583005" stroke-width="2.2"/>
      <ellipse cx="40" cy="14" rx="22" ry="4.5" fill="#fff0a6" stroke="#704008" stroke-width="1.5"/>
      <!-- Stem -->
      <path d="M 35 63 L 45 63 L 48 79 L 32 79 Z" fill="url(#v5jb-tr-gold)" stroke="#583005" stroke-width="1.8"/>
      <!-- Mahogany pedestal -->
      <rect x="16" y="79" width="48" height="8" rx="2" fill="url(#v5jb-tr-gold)" stroke="#502b04" stroke-width="1.6"/>
      <rect x="12" y="87" width="56" height="17" rx="2.5" fill="#4f2210" stroke="#9e641c" stroke-width="1.8"/>
      <rect x="24" y="92" width="32" height="7" rx="1.5" fill="#e8b447"/>
    </svg>
  `;
}

function renderMarqueeHeaderFrameSvg(): string {
  // Generate 24 perimeter incandescent bulbs around the emerald marquee plaque
  const bulbs: string[] = [];
  for (let i = 0; i < 10; i++) {
    const x = 36 + i * 32;
    bulbs.push(`<circle cx="${x}" cy="12" r="3.4" class="v5jb-bulb ${i % 2 === 0 ? 'is-alt' : ''}"/>`);
    bulbs.push(`<circle cx="${x}" cy="108" r="3.4" class="v5jb-bulb ${i % 2 === 1 ? 'is-alt' : ''}"/>`);
  }
  for (let j = 1; j <= 3; j++) {
    const y = 14 + j * 23;
    bulbs.push(`<circle cx="14" cy="${y}" r="3.4" class="v5jb-bulb ${j % 2 === 0 ? 'is-alt' : ''}"/>`);
    bulbs.push(`<circle cx="346" cy="${y}" r="3.4" class="v5jb-bulb ${j % 2 === 1 ? 'is-alt' : ''}"/>`);
  }

  return `
    <svg class="v5jb-marquee-svg" viewBox="0 0 360 120" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5jb-mq-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8c8"/>
          <stop offset="38%" stop-color="#f3be49"/>
          <stop offset="76%" stop-color="#a86a12"/>
          <stop offset="100%" stop-color="#ecc054"/>
        </linearGradient>
        <linearGradient id="v5jb-mq-emerald" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#15855e"/>
          <stop offset="52%" stop-color="#0b5c41"/>
          <stop offset="100%" stop-color="#053223"/>
        </linearGradient>
      </defs>
      <path d="M 28 6 L 332 6 C 332 18, 342 26, 354 26 L 354 94 C 342 94, 332 102, 332 114 L 28 114 C 28 102, 18 94, 6 94 L 6 26 C 18 26, 28 18, 28 6 Z"
            fill="url(#v5jb-mq-gold)" stroke="#5c3305" stroke-width="3"/>
      <path d="M 35 18 L 325 18 C 327 28, 333 34, 342 36 L 342 84 C 333 86, 327 92, 325 102 L 35 102 C 33 92, 27 86, 18 84 L 18 36 C 27 34, 33 28, 35 18 Z"
            fill="url(#v5jb-mq-emerald)" stroke="#623706" stroke-width="2.4"/>
      ${bulbs.join('')}
    </svg>
  `;
}

function renderStarsSvg(stars: 0 | 1 | 2 | 3, size = 11): string {
  const items: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const filled = i <= stars;
    items.push(`
      <svg width="${size}" height="${size}" viewBox="0 0 20 20" aria-hidden="true">
        <polygon
          points="10,1.5 12.6,7 18.7,7.6 14,11.6 15.4,17.7 10,14.5 4.6,17.7 6,11.6 1.3,7.6 7.4,7"
          fill="${filled ? '#ffd764' : 'rgba(255,224,152,0.16)'}"
          stroke="${filled ? '#754608' : 'rgba(220,174,78,0.45)'}"
          stroke-width="1.3"
        />
      </svg>
    `);
  }
  return `<span class="v5jb-stars" aria-label="${stars} of 3 mastery stars">${items.join('')}</span>`;
}

function renderDomainEmblemSvg(domainId: DomainId): string {
  switch (domainId) {
    case 0: // World History — Sculpted Antique Globe
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="14" fill="#d9b25f" stroke="#4d2c05" stroke-width="1.8"/>
          <path d="M 14 15 C 18 14, 21 17, 19 21 C 17 24, 22 28, 17 31 C 13 28, 11 22, 14 15 Z" fill="#2d6e4e"/>
          <path d="M 24 12 C 30 14, 33 19, 31 24 C 28 24, 25 22, 24 18 Z" fill="#2d6e4e"/>
          <ellipse cx="22" cy="22" rx="14" ry="5.5" fill="none" stroke="#623808" stroke-width="1.3" opacity="0.65"/>
          <path d="M 22 8 L 22 36" stroke="#623808" stroke-width="1.3" opacity="0.65"/>
        </svg>
      `;
    case 1: // Science & Space — Golden Atom Orbitals
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <ellipse cx="22" cy="22" rx="15" ry="6.2" fill="none" stroke="#ffe599" stroke-width="2" transform="rotate(30 22 22)"/>
          <ellipse cx="22" cy="22" rx="15" ry="6.2" fill="none" stroke="#ffe599" stroke-width="2" transform="rotate(-30 22 22)"/>
          <ellipse cx="22" cy="22" rx="15" ry="6.2" fill="none" stroke="#ffe599" stroke-width="2" transform="rotate(90 22 22)"/>
          <circle cx="22" cy="22" r="4.2" fill="#fff5cc" stroke="#754709" stroke-width="1.4"/>
        </svg>
      `;
    case 2: // Geography — Brass Compass Rose
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="14.5" fill="none" stroke="#fff0b5" stroke-width="2"/>
          <polygon points="22,6 25.5,18.5 38,22 25.5,25.5 22,38 18.5,25.5 6,22 18.5,18.5" fill="#ffe699" stroke="#5c3506" stroke-width="1.5"/>
          <circle cx="22" cy="22" r="3" fill="#5c3506"/>
        </svg>
      `;
    case 3: // Arts & Architecture — Classical Ionic Column
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <rect x="11" y="10" width="22" height="5" rx="2.5" fill="#fff0b3" stroke="#5d3606" stroke-width="1.5"/>
          <rect x="15" y="15" width="14" height="17" fill="#f3c558" stroke="#5d3606" stroke-width="1.5"/>
          <line x1="19" y1="16" x2="19" y2="31" stroke="#6c3e08" stroke-width="1.4"/>
          <line x1="25" y1="16" x2="25" y2="31" stroke="#6c3e08" stroke-width="1.4"/>
          <rect x="11" y="32" width="22" height="4.5" rx="1.5" fill="#fff0b3" stroke="#5d3606" stroke-width="1.5"/>
        </svg>
      `;
    case 4: // Film, Music & Pop — Cinema Clapperboard
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <rect x="9" y="18" width="26" height="17" rx="2.2" fill="#f7cf68" stroke="#472805" stroke-width="1.7"/>
          <path d="M 9 18 L 35 12 L 33 7 L 7 13 Z" fill="#fff1b8" stroke="#472805" stroke-width="1.6"/>
          <path d="M 14 11 L 17 16 M 22 9 L 25 14 M 29 8 L 32 12" stroke="#472805" stroke-width="2.2"/>
          <line x1="13" y1="24" x2="31" y2="24" stroke="#5c3406" stroke-width="1.6"/>
          <line x1="13" y1="29" x2="25" y2="29" stroke="#5c3406" stroke-width="1.6"/>
        </svg>
      `;
    case 5: // Sports & Games — Laurel Ball Crest
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="21" r="10.5" fill="#f8d26c" stroke="#5a3205" stroke-width="1.8"/>
          <path d="M 15 14 C 20 18, 20 24, 15 28 M 29 14 C 24 18, 24 24, 29 28" fill="none" stroke="#6c3d07" stroke-width="1.8"/>
          <path d="M 11 26 C 11 33, 16 36, 22 36 C 28 36, 33 33, 33 26" fill="none" stroke="#fff0b0" stroke-width="2.6" stroke-linecap="round"/>
        </svg>
      `;
    case 6: // Tech & Computing — Precision Brass Gear
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <path d="M 20 7 L 24 7 L 25 11 A 11 11 0 0 1 29 12.6 L 32.5 10.2 L 35.3 13 L 32.8 16.5 A 11 11 0 0 1 34.4 20.5 L 38 21.5 L 38 25.5 L 34.2 26.5 A 11 11 0 0 1 32.6 30.2 L 35 33.6 L 32.2 36.4 L 28.8 34 A 11 11 0 0 1 25 35.4 L 24 39 L 20 39 L 19 35.4 A 11 11 0 0 1 15.2 34 L 11.8 36.4 L 9 33.6 L 11.4 30.2 A 11 11 0 0 1 9.8 26.5 L 6 25.5 L 6 21.5 L 9.8 20.5 A 11 11 0 0 1 11.4 16.5 L 9 13 L 11.8 10.2 L 15.2 12.6 A 11 11 0 0 1 19 11 Z"
                fill="#ffe596" stroke="#523005" stroke-width="1.6" stroke-linejoin="round"/>
          <circle cx="22" cy="23" r="5.5" fill="#0d4e5e" stroke="#523005" stroke-width="1.5"/>
        </svg>
      `;
    case 7: // Nature & Biology — Golden Leaf & Helix
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <path d="M 11 33 C 11 18, 20 9, 34 9 C 34 23, 25 33, 11 33 Z" fill="#f7d16a" stroke="#4f2d05" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M 11 33 C 18 26, 24 19, 32 11" fill="none" stroke="#5c3506" stroke-width="2" stroke-linecap="round"/>
          <path d="M 18 25 L 18 19 M 23 20 L 29 20" stroke="#5c3506" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `;
    case 8: // World Affairs & Law — Golden Balance Scales
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <line x1="22" y1="9" x2="22" y2="34" stroke="#ffe599" stroke-width="2.4" stroke-linecap="round"/>
          <line x1="10" y1="15" x2="34" y2="15" stroke="#ffe599" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M 10 15 L 6.5 24 L 13.5 24 Z M 34 15 L 30.5 24 L 37.5 24 Z" fill="#f5c654" stroke="#5d3406" stroke-width="1.3"/>
          <rect x="14" y="33" width="16" height="3.8" rx="1.5" fill="#ffe599" stroke="#5d3406" stroke-width="1.3"/>
        </svg>
      `;
    case 9: // Food, Craft & Design — Culinary Chalice & Cloche
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <path d="M 10 27 C 10 17, 34 17, 34 27 Z" fill="#f8d26c" stroke="#5c3406" stroke-width="1.8"/>
          <circle cx="22" cy="14" r="3" fill="#fff2b8" stroke="#5c3406" stroke-width="1.4"/>
          <rect x="7" y="27" width="30" height="4.5" rx="2" fill="#ffe79e" stroke="#5c3406" stroke-width="1.6"/>
        </svg>
      `;
    case 10: // Myth & Literature — Winged Corinthian Helm
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <path d="M 13 24 C 13 13, 31 13, 31 24 L 30 35 L 24 32 L 24 23 L 20 23 L 20 32 L 14 35 Z"
                fill="#f8cf65" stroke="#5a3105" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M 15 14 C 16 7, 28 7, 29 14" fill="none" stroke="#fff1b5" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    case 11: // Logic & Math — Faceted Golden Prism
    default:
      return `
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <polygon points="22,7 36,22 22,37 8,22" fill="#f8d26c" stroke="#532d05" stroke-width="1.8" stroke-linejoin="round"/>
          <polyline points="22,7 22,37" stroke="#6c3f07" stroke-width="1.5"/>
          <polyline points="8,22 22,17 36,22" fill="none" stroke="#fff7cc" stroke-width="1.5"/>
        </svg>
      `;
  }
}

function renderRotaryDialCenterSvg(): string {
  const fingerHoles: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angleDeg = -130 + i * 28;
    const rad = (angleDeg * Math.PI) / 180;
    const cx = 100 + Math.cos(rad) * 63;
    const cy = 100 + Math.sin(rad) * 63;
    fingerHoles.push(`
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="12.5" fill="url(#v5jb-hole-shadow)" stroke="#f6ce6e" stroke-width="1.6"/>
    `);
  }
  return `
    <svg class="v5jb-rotor-svg" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="v5jb-rotor-brass" cx="42%" cy="34%" r="65%">
          <stop offset="0%" stop-color="#fff7cb"/>
          <stop offset="40%" stop-color="#e5b042"/>
          <stop offset="78%" stop-color="#a66c18"/>
          <stop offset="100%" stop-color="#603608"/>
        </radialGradient>
        <radialGradient id="v5jb-hole-shadow" cx="55%" cy="55%" r="55%">
          <stop offset="0%" stop-color="#45210c"/>
          <stop offset="70%" stop-color="#220e05"/>
          <stop offset="100%" stop-color="#140702"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#v5jb-rotor-brass)" stroke="#5b3406" stroke-width="3.5"/>
      <circle cx="100" cy="100" r="87" fill="none" stroke="#fff3bb" stroke-width="1.5" opacity="0.68"/>
      ${fingerHoles.join('')}
      <!-- Classic rotary brass finger stop -->
      <path d="M 152 132 L 194 148 C 197 154, 193 163, 185 162 L 144 146 Z"
            fill="url(#v5jb-rotor-brass)" stroke="#4f2c05" stroke-width="2.2" stroke-linejoin="round"/>
    </svg>
  `;
}

function renderSearchLensSvg(): string {
  return `
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#f5c654" stroke-width="2.2"/>
      <line x1="15.4" y1="15.4" x2="21" y2="21" stroke="#f5c654" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `;
}

function renderJukeboxFullscreenSvg(isFs: boolean): string {
  return isFs
    ? `
      <svg viewBox="0 0 36 36" width="17" height="17" aria-hidden="true">
        <path d="M 14 7 L 14 14 L 7 14 M 22 7 L 22 14 L 29 14 M 14 29 L 14 22 L 7 22 M 22 29 L 22 22 L 29 22"
              fill="none" stroke="#f8d26c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
    : `
      <svg viewBox="0 0 36 36" width="17" height="17" aria-hidden="true">
        <path d="M 7 14 L 7 7 L 14 7 M 22 7 L 29 7 L 29 14 M 7 22 L 7 29 L 14 29 M 22 29 L 29 29 L 29 22"
              fill="none" stroke="#f8d26c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
}

function toggleJukeboxFullscreen(onResult?: (isFs: boolean) => void): void {
  if (typeof document === 'undefined') return;
  const isCurrentlyFs = Boolean(document.fullscreenElement);
  const done = () => onResult?.(Boolean(document.fullscreenElement));
  try {
    if (isCurrentlyFs && typeof document.exitFullscreen === 'function') {
      void document.exitFullscreen().then(done).catch(done);
    } else if (!isCurrentlyFs && typeof document.documentElement.requestFullscreen === 'function') {
      void document.documentElement.requestFullscreen().then(done).catch(done);
    } else {
      onResult?.(!isCurrentlyFs);
    }
  } catch {
    onResult?.(isCurrentlyFs);
  }
}

// ============================================================================
// SELF-CONTAINED SCOPED CSS (`#v5-topic-jukebox-styles`)
// ============================================================================

function ensureJukeboxStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .v5jb-root {
      position: relative;
      width: 100%;
      min-height: 100dvh;
      min-height: 100vh;
      background:
        radial-gradient(ellipse 66% 36% at 50% 0%, rgba(255, 206, 110, 0.22) 0%, rgba(44, 16, 10, 0) 70%),
        linear-gradient(180deg, #34130a 0%, #240d07 34%, #1a0a05 100%);
      color: #fff3d6;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      overflow-x: hidden;
      overflow-y: auto;
      pointer-events: auto;
      touch-action: pan-y;
      box-sizing: border-box;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .v5jb-root.is-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 60;
      height: 100dvh;
    }
    .v5jb-root *, .v5jb-root *::before, .v5jb-root *::after {
      box-sizing: border-box;
    }

    .v5jb-cabinet {
      position: relative;
      width: 100%;
      max-width: 1180px;
      margin: 0 auto;
      padding: 5px 10px max(8px, env(safe-area-inset-bottom, 8px));
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Overhead Angled Cabinet Spotlights */
    .v5jb-lamp {
      position: absolute;
      top: -6px;
      width: 68px;
      height: 44px;
      pointer-events: none;
      z-index: 1;
    }
    .v5jb-lamp-left {
      left: 6px;
      background: radial-gradient(ellipse at 26% 18%, #fff8cf 0%, rgba(255, 212, 114, 0.65) 36%, rgba(255, 190, 72, 0) 74%);
    }
    .v5jb-lamp-right {
      right: 6px;
      background: radial-gradient(ellipse at 74% 18%, #fff8cf 0%, rgba(255, 212, 114, 0.65) 36%, rgba(255, 190, 72, 0) 74%);
    }

    /* Top Navigation Brass Back Latch */
    .v5jb-topbar {
      position: relative;
      z-index: 4;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .v5jb-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 36px;
      padding: 5px 13px;
      border-radius: 999px;
      border: 2px solid #d9a039;
      background: linear-gradient(180deg, #432211 0%, #241007 100%);
      box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.65),
        inset 0 1px 1px rgba(255, 236, 174, 0.45);
      color: #ffe8a8;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 11.5px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition: transform 140ms ease, filter 140ms ease;
    }
    .v5jb-back-btn:hover, .v5jb-back-btn:focus-visible {
      transform: translateY(-1px);
      filter: brightness(1.12);
      outline: none;
    }
    .v5jb-topbar-right {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .v5jb-fs-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 2px solid #d9a039;
      background: linear-gradient(180deg, #432211 0%, #241007 100%);
      box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.65),
        inset 0 1px 1px rgba(255, 236, 174, 0.45);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: transform 140ms ease, filter 140ms ease;
    }
    .v5jb-fs-btn:hover, .v5jb-fs-btn:focus-visible {
      transform: translateY(-1px);
      filter: brightness(1.12);
      outline: none;
    }
    .v5jb-catalog-tag {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #e4bd76;
      text-transform: uppercase;
      padding: 4px 9px;
      border-radius: 999px;
      border: 1px solid rgba(220, 166, 62, 0.45);
      background: rgba(34, 13, 6, 0.72);
    }

    /* ---------------- MARQUEE HEADER WITH CROWN & TWIN TROPHIES ---------------- */
    .v5jb-header-arch {
      position: relative;
      z-index: 3;
      width: 100%;
      max-width: 680px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1px;
      padding: 10px 8px 5px;
      border-radius: 16px 16px 8px 8px;
      background:
        radial-gradient(ellipse 74% 80% at 50% 42%, rgba(126, 18, 28, 0.78) 0%, rgba(52, 10, 14, 0.92) 72%, rgba(30, 10, 7, 0.96) 100%);
      border: 2.5px solid #c58b2b;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.75),
        inset 0 0 0 2px rgba(255, 224, 140, 0.22);
    }

    .v5jb-marquee-row {
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 6px;
    }
    .v5jb-trophy-svg {
      width: clamp(34px, 9.4vw, 60px);
      height: auto;
      flex: 0 0 auto;
      filter: drop-shadow(0 5px 8px rgba(0, 0, 0, 0.72));
    }

    .v5jb-marquee-plaque {
      position: relative;
      width: clamp(194px, 54vw, 316px);
      min-height: 58px;
      padding: 9px 16px 7px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 14px rgba(255, 206, 92, 0.42)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.75));
    }
    .v5jb-crown-svg {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      width: 44px;
      height: auto;
      z-index: 3;
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.75));
    }
    .v5jb-marquee-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .v5jb-bulb {
      fill: #fffbe0;
      stroke: #f5b93a;
      stroke-width: 1;
      animation: v5jb-bulb-glow 2.2s ease-in-out infinite;
    }
    .v5jb-bulb.is-alt {
      animation-delay: 1.1s;
    }
    .v5jb-marquee-title {
      position: relative;
      z-index: 2;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(19px, 5.2vw, 27px);
      line-height: 1.02;
      letter-spacing: 0.05em;
      text-align: center;
      text-transform: uppercase;
      background: linear-gradient(180deg, #fffbe2 0%, #ffd46a 50%, #d28e20 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 2px 2px rgba(4, 24, 16, 0.92));
    }

    .v5jb-ribbon {
      margin-top: 6px;
      padding: 3px 18px;
      border-radius: 4px;
      background: linear-gradient(180deg, #f8d474 0%, #cfa03b 68%, #9b6b19 100%);
      border: 1.5px solid #593305;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.65);
      color: #2f1404;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: 10.5px;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      text-align: center;
    }

    /* ---------------- MAIN STAGE BODY (WHEEL + CATALOG/CONSOLE) ---------------- */
    .v5jb-main-layout {
      position: relative;
      z-index: 3;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-top: 5px;
    }

    /* ---------------- 12-DOMAIN ROTARY JUKEBOX WHEEL ---------------- */
    .v5jb-wheel-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .v5jb-wheel-stage {
      --wheel-size: min(292px, calc(100vw - 24px));
      --orbit-r: calc(var(--wheel-size) * 0.398);
      --med-size: clamp(38px, 10.4vw, 45px);
      position: relative;
      width: var(--wheel-size);
      height: var(--wheel-size);
      border-radius: 50%;
      background:
        radial-gradient(circle at 50% 45%, #5c2b14 0%, #3a180b 58%, #210c05 100%);
      border: 4px solid #d49b34;
      box-shadow:
        0 14px 32px rgba(0, 0, 0, 0.84),
        inset 0 0 0 4px #4d250f,
        inset 0 0 0 6px rgba(255, 224, 140, 0.34);
      touch-action: pan-y;
    }

    /* Inner carved mahogany dial plate */
    .v5jb-wheel-inner-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 56%;
      height: 56%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background:
        radial-gradient(circle at 46% 36%, #683217 0%, #3d1a0b 62%, #240e05 100%);
      border: 3.5px solid #e6b449;
      box-shadow:
        0 6px 18px rgba(0, 0, 0, 0.76),
        inset 0 0 0 3px #633808,
        inset 0 0 18px rgba(0, 0, 0, 0.65);
    }

    /* Rotating Brass Telephone Rotor */
    .v5jb-rotor-dial {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 78%;
      height: 78%;
      transform: translate(-50%, -50%) rotate(var(--rotor-deg, 0deg));
      transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
      cursor: grab;
      touch-action: none;
    }
    .v5jb-rotor-dial.is-dragging {
      transition: none;
      cursor: grabbing;
    }
    .v5jb-rotor-svg {
      width: 100%;
      height: 100%;
      display: block;
      filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.7));
      pointer-events: none;
    }

    /* Glowing Golden Pointer Arrow Orbiting Inner Rim */
    .v5jb-pointer-arm {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      z-index: 12;
      transform: rotate(var(--pointer-deg, 0deg));
      transition: transform 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
      pointer-events: none;
    }
    .v5jb-pointer-arm.is-all-mix {
      opacity: 0;
    }
    .v5jb-pointer-head {
      position: absolute;
      left: -12px;
      top: calc(var(--wheel-size) * -0.285);
      width: 24px;
      height: 26px;
      filter: drop-shadow(0 0 10px rgba(255, 224, 108, 0.95));
    }

    /* Center Spun-Brass Hub Button ("ALL 12 DOMAINS") */
    .v5jb-center-hub {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 8;
      width: 44%;
      height: 44%;
      border-radius: 50%;
      border: 3px solid #f5c75a;
      background:
        radial-gradient(circle at 38% 32%, #fff6c5 0%, #e4ad3d 48%, #9a6012 100%);
      box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.78),
        inset 0 0 0 3px #6d4109,
        inset 0 2px 4px rgba(255, 250, 210, 0.65);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4px;
      text-align: center;
      color: #2f1404;
      cursor: pointer;
      transition: transform 150ms ease, box-shadow 180ms ease;
    }
    .v5jb-center-hub:hover, .v5jb-center-hub:focus-visible {
      transform: translate(-50%, -50%) scale(1.05);
      outline: none;
    }
    .v5jb-center-hub.is-active {
      background:
        radial-gradient(circle at 40% 34%, #25a574 0%, #0d6847 58%, #063826 100%);
      color: #fff6d2;
      box-shadow:
        0 0 18px rgba(46, 224, 152, 0.56),
        0 6px 14px rgba(0, 0, 0, 0.78),
        inset 0 0 0 2.5px #f7cf68;
    }
    .v5jb-hub-main {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: 11px;
      line-height: 1.05;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .v5jb-hub-sub {
      margin-top: 2px;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      opacity: 0.88;
    }

    /* 12 Enameled Circular Domain Medallions */
    .v5jb-medallion {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) translate(var(--tx), var(--ty));
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      transition: transform 170ms cubic-bezier(0.22, 1, 0.36, 1), filter 160ms ease;
    }
    .v5jb-medallion:hover, .v5jb-medallion:focus-visible {
      z-index: 9;
      transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1.09);
      outline: none;
    }
    .v5jb-medallion.is-selected {
      z-index: 10;
      transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1.13);
    }

    .v5jb-med-disc {
      width: var(--med-size);
      height: var(--med-size);
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, var(--enamel-top) 0%, var(--enamel-bottom) 100%);
      border: 3px solid #e4ae42;
      box-shadow:
        0 5px 12px rgba(0, 0, 0, 0.78),
        inset 0 0 0 2px rgba(255, 240, 185, 0.35),
        inset 0 -3px 6px rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }
    .v5jb-medallion.is-selected .v5jb-med-disc {
      border-color: #fff3b5;
      box-shadow:
        0 0 18px rgba(255, 218, 102, 0.85),
        0 6px 14px rgba(0, 0, 0, 0.85),
        inset 0 0 0 2px #fff5c8;
    }
    .v5jb-med-disc svg {
      width: 72%;
      height: 72%;
      display: block;
    }

    .v5jb-med-plate {
      margin-top: -5px;
      padding: 1.5px 6px 2px;
      border-radius: 7px;
      border: 1.5px solid #cc9532;
      background: linear-gradient(180deg, #3c1e10 0%, #1d0c05 100%);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.82);
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 52px;
      max-width: 74px;
    }
    .v5jb-medallion.is-selected .v5jb-med-plate {
      border-color: #ffe285;
      background: linear-gradient(180deg, #126d4d 0%, #073827 100%);
    }
    .v5jb-med-name {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 8.5px;
      line-height: 1.08;
      color: #ffeab0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .v5jb-stars {
      display: inline-flex;
      align-items: center;
      gap: 1px;
      line-height: 1;
    }

    /* ---------------- RIGHT / LOWER CATALOG & CONTROL CONSOLE ---------------- */
    .v5jb-console-col {
      width: 100%;
      max-width: 580px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* Active Selection Brass Engraving Plate + Expandable 157-Subcategory Drawer */
    .v5jb-strip-drawer {
      width: 100%;
      border-radius: 12px;
      border: 2px solid #c9902d;
      background: linear-gradient(180deg, #3d1c0d 0%, #240e06 100%);
      box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.68),
        inset 0 1px 0 rgba(255, 232, 168, 0.3);
      padding: 6px 9px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .v5jb-selection-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }
    .v5jb-now-spinning {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1 1 170px;
    }
    .v5jb-now-kicker {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #e4b14b;
      text-transform: uppercase;
    }
    .v5jb-now-label {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 14px;
      font-weight: 800;
      color: #fff4d2;
      line-height: 1.2;
      word-break: break-word;
    }
    .v5jb-now-meta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
      font-size: 11px;
      font-weight: 600;
      color: #e5c686;
    }
    .v5jb-drawer-actions {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .v5jb-mini-brass-btn {
      min-height: 32px;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1.5px solid #d59d39;
      background: linear-gradient(180deg, #4b2511 0%, #2a1208 100%);
      color: #ffe7a4;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .v5jb-mini-brass-btn:hover, .v5jb-mini-brass-btn:focus-visible {
      border-color: #ffe694;
      filter: brightness(1.12);
      outline: none;
    }

    /* Instant 157-Subcategory Search Slot */
    .v5jb-search-row {
      position: relative;
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 0 10px;
      min-height: 38px;
      border-radius: 10px;
      border: 1.5px solid #b98229;
      background: #1a0a05;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.72);
    }
    .v5jb-search-input {
      flex: 1 1 auto;
      min-width: 0;
      border: none;
      background: transparent;
      color: #fff5da;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      outline: none;
      padding: 7px 0;
    }
    .v5jb-search-input::placeholder {
      color: rgba(235, 202, 138, 0.56);
    }
    .v5jb-search-clear {
      border: none;
      background: rgba(217, 160, 57, 0.2);
      color: #ffe69c;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* Expandable Subcategory / Topic Song-Strip Chips */
    .v5jb-subcat-body {
      display: flex;
      flex-direction: column;
      gap: 7px;
      max-height: 164px;
      overflow-y: auto;
      padding-right: 2px;
    }
    .v5jb-subcat-body.is-collapsed {
      display: none;
    }
    .v5jb-strip-section-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #d9a752;
      text-transform: uppercase;
    }
    .v5jb-chip-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .v5jb-topic-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 30px;
      padding: 4px 10px;
      border-radius: 8px;
      border: 1.5px solid rgba(212, 155, 53, 0.62);
      background: linear-gradient(180deg, #432010 0%, #261007 100%);
      color: #ffefd0;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
    }
    .v5jb-topic-chip:hover, .v5jb-topic-chip:focus-visible {
      border-color: #ffe285;
      transform: translateY(-1px);
      outline: none;
    }
    .v5jb-topic-chip.is-selected {
      border-color: #ffea9e;
      background: linear-gradient(180deg, #147a55 0%, #094530 100%);
      color: #fffbe8;
      box-shadow: 0 0 10px rgba(38, 206, 142, 0.4);
    }
    .v5jb-chip-acc {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      color: #ffd76c;
    }
    .v5jb-empty-search {
      font-size: 12px;
      color: #d9b678;
      padding: 6px 2px;
    }

    /* ---------------- BRASS RUN-LENGTH & DIFFICULTY DETENTS ---------------- */
    .v5jb-detents-bar {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .v5jb-detent-group {
      border-radius: 11px;
      border: 1.8px solid #bf872a;
      background: linear-gradient(180deg, #391a0d 0%, #210d05 100%);
      padding: 5px 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.56);
    }
    .v5jb-detent-group.is-diff-group {
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
    }
    .v5jb-detent-label {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #e4b450;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .v5jb-detent-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .v5jb-detent-group.is-diff-group .v5jb-detent-row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 4px;
    }
    .v5jb-detent-btn {
      min-height: 28px;
      min-width: 34px;
      padding: 3px 8px;
      border-radius: 7px;
      border: 1.5px solid #a87424;
      background: linear-gradient(180deg, #4b2511 0%, #271107 100%);
      color: #f6dba1;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 110ms ease, border-color 120ms ease;
    }
    .v5jb-detent-btn.is-diff {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10.5px;
      padding: 3px 5px;
      text-align: center;
      white-space: nowrap;
    }
    .v5jb-detent-btn:hover, .v5jb-detent-btn:focus-visible {
      border-color: #ffe285;
      outline: none;
    }
    .v5jb-detent-btn.is-selected {
      border-color: #fff1b3;
      background: linear-gradient(180deg, #f3c14d 0%, #b57416 100%);
      color: #2b1203;
      box-shadow: 0 0 10px rgba(246, 199, 88, 0.45);
    }

    /* ---------------- PHYSICAL THROW-SWITCHES & START CUSTOM SHOW LEVER ---------------- */
    .v5jb-switch-deck {
      position: relative;
      width: 100%;
      padding: 10px 8px 6px;
      border-radius: 16px;
      border: 2.5px solid #c98f2d;
      background:
        linear-gradient(180deg, #542712 0%, #38180a 48%, #210c05 100%);
      box-shadow:
        0 10px 24px rgba(0, 0, 0, 0.78),
        inset 0 2px 3px rgba(255, 224, 142, 0.28);
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.32fr) minmax(0, 1fr);
      gap: 7px;
      align-items: end;
    }

    /* Physical Brass Throw-Switch Unit (exact mockup match) */
    .v5jb-throw-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #fff2cf;
    }
    .v5jb-throw-unit:focus-visible {
      outline: 2px solid #ffe48f;
      outline-offset: 2px;
      border-radius: 10px;
    }
    .v5jb-switch-top-plate {
      width: 100%;
      padding: 3px 5px;
      border-radius: 999px;
      border: 1.5px solid #cfa03b;
      background: linear-gradient(180deg, #3c1e10 0%, #1e0d06 100%);
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(9px, 2.5vw, 11px);
      letter-spacing: 0.03em;
      color: #d6b67a;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
    }
    .v5jb-throw-unit.is-up .v5jb-switch-top-plate {
      border-color: #ffe89e;
      color: #fff8d6;
      box-shadow: 0 0 10px rgba(255, 212, 92, 0.42);
    }

    .v5jb-switch-plate {
      position: relative;
      width: 100%;
      min-height: 76px;
      padding: 6px 5px 5px;
      border-radius: 10px;
      border: 2.5px solid #e2ac3e;
      background: linear-gradient(180deg, #137653 0%, #084832 62%, #063122 100%);
      box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.72),
        inset 0 0 0 2px rgba(255, 232, 165, 0.34);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    /* 4 Corner Brass Rivets */
    .v5jb-rivet {
      position: absolute;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #fff4bc 0%, #b57516 100%);
      border: 1px solid #4c2905;
    }
    .v5jb-rivet-tl { top: 4px; left: 4px; }
    .v5jb-rivet-tr { top: 4px; right: 4px; }
    .v5jb-rivet-bl { bottom: 4px; left: 4px; }
    .v5jb-rivet-br { bottom: 4px; right: 4px; }

    .v5jb-toggle-well {
      position: relative;
      width: 34px;
      height: 50px;
      border-radius: 10px;
      border: 2px solid #d59e35;
      background: linear-gradient(180deg, #271308 0%, #4d2911 50%, #1d0c05 100%);
      box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .v5jb-toggle-baton {
      width: 16px;
      height: 30px;
      border-radius: 8px;
      border: 1.8px solid #593205;
      background: linear-gradient(90deg, #8c5510 0%, #fff4bf 38%, #e4ac3b 70%, #6b3d07 100%);
      box-shadow: 0 5px 8px rgba(0, 0, 0, 0.82);
      transform: translateY(-9px);
      transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .v5jb-throw-unit.is-down .v5jb-toggle-baton {
      transform: translateY(9px);
    }

    .v5jb-switch-arrow {
      position: absolute;
      top: 34px;
      font-size: 11px;
      color: #ffd868;
      text-shadow: 0 0 8px rgba(255, 212, 92, 0.85);
    }
    .v5jb-switch-arrow-l { left: 6px; }
    .v5jb-switch-arrow-r { right: 6px; }

    .v5jb-switch-bot-label {
      margin-top: 4px;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(9.5px, 2.5vw, 11.5px);
      color: #b7d7c5;
      letter-spacing: 0.02em;
      white-space: nowrap;
      transition: color 140ms ease, text-shadow 140ms ease;
    }
    .v5jb-throw-unit.is-down .v5jb-switch-bot-label {
      color: #fff6c9;
      text-shadow: 0 0 10px rgba(255, 222, 112, 0.72);
    }

    /* Center Chunky Emerald & Brass START CUSTOM SHOW Stage Lever */
    .v5jb-lever-btn {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      transition: transform 150ms cubic-bezier(0.22, 1, 0.36, 1), filter 150ms ease;
    }
    .v5jb-lever-btn:hover, .v5jb-lever-btn:focus-visible {
      filter: brightness(1.09);
      outline: none;
    }
    .v5jb-lever-btn:hover .v5jb-lever-handle {
      transform: translateY(2px);
    }
    .v5jb-lever-btn:active .v5jb-lever-handle,
    .v5jb-lever-btn.is-pulling .v5jb-lever-handle {
      transform: translateY(11px) scaleY(0.92);
    }

    .v5jb-lever-handle {
      position: relative;
      z-index: 2;
      width: 84px;
      height: 36px;
      margin-bottom: -6px;
      transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
      filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.78));
    }

    .v5jb-start-plaque {
      position: relative;
      z-index: 3;
      width: 100%;
      min-height: 60px;
      padding: 6px 8px 6px;
      border-radius: 12px;
      border: 3px solid #f5c95c;
      background: linear-gradient(180deg, #16865f 0%, #0b5c41 55%, #063827 100%);
      box-shadow:
        0 0 18px rgba(255, 212, 92, 0.48),
        0 8px 16px rgba(0, 0, 0, 0.85),
        inset 0 0 0 2px rgba(255, 240, 178, 0.45);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .v5jb-start-big {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(19px, 5vw, 24px);
      line-height: 1;
      letter-spacing: 0.05em;
      background: linear-gradient(180deg, #fffbe2 0%, #ffd56b 55%, #d6911e 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 2px 2px rgba(4, 24, 16, 0.92));
    }
    .v5jb-start-sub {
      margin-top: 2px;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(9.5px, 2.5vw, 11.5px);
      letter-spacing: 0.06em;
      color: #fff2c4;
      text-transform: uppercase;
      white-space: nowrap;
    }

    /* ---------------- DESKTOP PANORAMIC CABINET (>= 920px) ---------------- */
    @media (min-width: 920px) {
      .v5jb-cabinet {
        padding: 10px 22px 14px;
      }
      .v5jb-header-arch {
        max-width: 780px;
        padding: 15px 14px 8px;
      }
      .v5jb-marquee-plaque {
        width: 344px;
        min-height: 76px;
      }
      .v5jb-main-layout {
        margin-top: 12px;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 24px;
      }
      .v5jb-wheel-col {
        width: auto;
        flex: 0 0 auto;
      }
      .v5jb-wheel-stage {
        --wheel-size: 468px;
        --orbit-r: 186px;
        --med-size: 60px;
      }
      .v5jb-med-plate {
        min-width: 66px;
        max-width: 86px;
        padding: 2px 7px 2.5px;
      }
      .v5jb-med-name {
        font-size: 9.5px;
      }
      .v5jb-hub-main {
        font-size: 13px;
      }
      .v5jb-hub-sub {
        font-size: 9.5px;
      }
      .v5jb-console-col {
        flex: 1 1 auto;
        max-width: 576px;
      }
      .v5jb-detent-group.is-diff-group .v5jb-detent-row {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }
      .v5jb-subcat-body {
        max-height: 190px;
      }
      .v5jb-switch-plate {
        min-height: 100px;
      }
      .v5jb-start-plaque {
        min-height: 76px;
      }
    }

    /* Bespoke Phone Landscape Cabinet (e.g. 844x390) — Fits cleanly inside 390px height! */
    @media (max-height: 500px) and (min-width: 600px) {
      .v5jb-cabinet {
        padding: 4px 12px 6px;
      }
      .v5jb-topbar {
        margin-bottom: 2px;
      }
      .v5jb-back-btn {
        min-height: 28px;
        padding: 3px 10px;
        font-size: 10px;
      }
      .v5jb-fs-btn {
        width: 28px;
        height: 28px;
      }
      .v5jb-header-arch {
        display: none;
      }
      .v5jb-main-layout {
        margin-top: 2px;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 14px;
      }
      .v5jb-wheel-col {
        width: auto;
        flex: 0 0 auto;
      }
      .v5jb-wheel-stage {
        --wheel-size: 326px;
        --orbit-r: 130px;
        --med-size: 40px;
      }
      .v5jb-med-plate {
        min-width: 48px;
        max-width: 66px;
        padding: 1px 4px;
      }
      .v5jb-med-name {
        font-size: 7.8px;
      }
      .v5jb-console-col {
        flex: 1 1 auto;
        max-width: 472px;
        gap: 3px;
      }
      .v5jb-strip-drawer {
        padding: 4px 7px;
        gap: 3px;
      }
      .v5jb-now-label { font-size: 12px; }
      .v5jb-now-meta { font-size: 9.5px; margin-top: 0; }
      .v5jb-mini-brass-btn { min-height: 26px; padding: 2px 8px; font-size: 9px; }
      .v5jb-search-row { min-height: 26px; padding: 0 8px; }
      .v5jb-search-input { font-size: 11.5px; padding: 3px 0; }
      .v5jb-subcat-body { max-height: 52px; gap: 3px; }
      .v5jb-topic-chip { min-height: 24px; padding: 2px 7px; font-size: 10px; }
      .v5jb-detents-bar { gap: 3px; }
      .v5jb-detent-group { padding: 3px 6px; }
      .v5jb-detent-group.is-diff-group .v5jb-detent-row {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }
      .v5jb-detent-btn { min-height: 22px; font-size: 9.5px; padding: 1px 4px; }
      .v5jb-detent-btn.is-diff { font-size: 9px; padding: 1px 3px; }
      .v5jb-switch-deck { padding: 5px 6px 4px; gap: 5px; }
      .v5jb-switch-plate { min-height: 56px; padding: 3px 4px 2px; }
      .v5jb-toggle-well { width: 26px; height: 34px; }
      .v5jb-toggle-baton { width: 12px; height: 19px; transform: translateY(-5px); }
      .v5jb-throw-unit.is-down .v5jb-toggle-baton { transform: translateY(5px); }
      .v5jb-switch-bot-label { margin-top: 2px; font-size: 8.5px; }
      .v5jb-lever-handle { width: 68px; height: 24px; margin-bottom: -4px; }
      .v5jb-start-plaque { min-height: 46px; padding: 3px 6px; }
      .v5jb-start-big { font-size: 16px; }
      .v5jb-start-sub { font-size: 8.2px; }
    }

    /* Narrow mobile tuning (<= 375px) */
    @media (max-width: 375px) {
      .v5jb-detents-bar {
        grid-template-columns: 1fr;
      }
      .v5jb-med-name {
        font-size: 8px;
      }
    }

    @keyframes v5jb-bulb-glow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.52; }
    }
    @media (prefers-reduced-motion: reduce) {
      .v5jb-bulb { animation: none !important; }
      .v5jb-rotor-dial, .v5jb-pointer-arm { transition: none !important; }
    }
  `;

  document.head.appendChild(style);
}

// ============================================================================
// TOPIC JUKEBOX VIEW CLASS
// ============================================================================

export class TopicJukeboxView {
  private readonly container: HTMLElement;
  private rootEl: HTMLElement | null = null;
  private callbacks: TopicJukeboxCallbacks | null = null;
  private options: TopicJukeboxOpenOptions = {};

  private tree: TaxonomyL0Domain[] = [];
  private accuracyLookup: PersonalAccuracyLookup = { domainStats: {}, subcatStats: {} };

  // Interactive Jukebox State
  private selectedDomainId: DomainId | null = null; // null => All 12 Domains Global Mix
  private selectedL1Id: string | null = null;
  private selectedL2Id: string | null = null;
  private searchQuery = '';
  private drawerExpanded = false;
  private formatMode: BriefingFormatModeV4 = 'VARIETY_MIX';
  private timerPace: TimerPaceModeV4 = 'STANDARD';
  private difficulty: BriefingDifficultyPreset = 'ADAPTIVE';
  private roundCount: BriefingRoundCount = 10;

  // Dial Drag State
  private rotorAngleDeg = 0;
  private isDraggingDial = false;
  private dragStartPointerAngle = 0;
  private dragStartRotorAngle = 0;
  private lastSnapStep = -1;

  private readonly boundKeydown = (ev: KeyboardEvent): void => {
    if (!this.rootEl) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this.callbacks?.onClose();
      return;
    }
    const activeTag = (document.activeElement?.tagName ?? '').toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea') return;

    if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
      ev.preventDefault();
      this.stepWheelSelection(1);
    } else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.stepWheelSelection(-1);
    }
  };

  constructor(container: HTMLElement) {
    this.container = container;
    ensureJukeboxStyles();
  }

  public mount(
    callbacks: TopicJukeboxCallbacks,
    options: TopicJukeboxOpenOptions = {},
  ): void {
    ensureJukeboxStyles();
    this.callbacks = callbacks;
    this.options = options;

    this.selectedDomainId =
      options.initialDomainId !== undefined ? options.initialDomainId : null;
    this.selectedL1Id = options.initialL1SubcategoryId ?? null;
    this.selectedL2Id = options.initialL2TopicId ?? null;
    this.searchQuery = options.initialSearchQuery ?? '';
    this.drawerExpanded = Boolean(
      this.selectedDomainId !== null || this.searchQuery.trim().length > 0,
    );

    const savedFmt = readLocalPref(STORAGE_FORMAT_KEY);
    this.formatMode =
      options.initialFormatMode ??
      (savedFmt === 'CLASSIC_4_ONLY' ? 'CLASSIC_4_ONLY' : 'VARIETY_MIX');

    const savedTimer = readLocalPref(STORAGE_TIMER_KEY);
    this.timerPace =
      options.initialTimerPace ??
      (savedTimer === 'RELAXED_UNTIMED' ? 'RELAXED_UNTIMED' : 'STANDARD');

    const savedDiff = readLocalPref(STORAGE_DIFF_KEY);
    this.difficulty =
      options.initialDifficulty ??
      (savedDiff ? normalizeBriefingDifficultyPreset(savedDiff) : 'ADAPTIVE');

    this.roundCount = options.initialCount ?? 10;
    this.accuracyLookup = readPersonalAccuracyLookup(options.domainAccuracyOverrides);

    // Build instant 3-level taxonomy tree (zero latency from frame 1)
    this.rebuildTree();

    if (this.selectedDomainId !== null) {
      this.rotorAngleDeg = this.domainToClockDeg(this.selectedDomainId);
    } else {
      this.rotorAngleDeg = 0;
    }

    this.renderFull();
    window.addEventListener('keydown', this.boundKeydown);

    // Non-blocking external taxonomy hydration (`./data/shards/taxonomy_tree.json`)
    void prefetchExternalTaxonomyJson().then((externalJson) => {
      if (!this.rootEl || !externalJson) return;
      this.rebuildTree();
      this.updateSubcategoryDrawerDom();
      this.updateCatalogCountTag();
    });
  }

  public setSelection(
    domainId: DomainId | null,
    l1Id: string | null = null,
    l2Id: string | null = null,
  ): void {
    this.selectedDomainId = domainId;
    this.selectedL1Id = l1Id;
    this.selectedL2Id = l2Id;
    if (domainId !== null) {
      this.rotorAngleDeg = this.domainToClockDeg(domainId);
      this.drawerExpanded = true;
    }
    this.updateWheelDom();
    this.updateSubcategoryDrawerDom();
  }

  public getCurrentLaunchSpec(): TopicJukeboxLaunchSpec {
    let selectionLabel = 'All 12 Domains · Global Mix';
    let topicKeywords: readonly string[] | undefined;

    if (this.selectedDomainId !== null) {
      const dom = this.tree.find((d) => d.domainId === this.selectedDomainId);
      const fallbackDom = FORGE_DOMAINS[this.selectedDomainId];
      const domName = dom?.name ?? fallbackDom?.name ?? 'Selected Domain';
      selectionLabel = domName;

      if (dom && this.selectedL1Id) {
        const l1 = dom.subcategories.find((c) => c.id === this.selectedL1Id);
        if (l1) {
          selectionLabel = `${dom.shortName} › ${l1.name}`;
          if (this.selectedL2Id) {
            const l2 = l1.topics.find((t) => t.id === this.selectedL2Id);
            if (l2) {
              selectionLabel = `${dom.shortName} › ${l1.name} › ${l2.name}`;
              topicKeywords = l2.keywords;
            }
          }
        }
      }
    }

    return {
      domains: this.selectedDomainId !== null ? [this.selectedDomainId] : [],
      l0DomainId: this.selectedDomainId !== null ? this.selectedDomainId : undefined,
      l1SubcategoryId: this.selectedL1Id ?? undefined,
      l2TopicId: this.selectedL2Id ?? undefined,
      selectionLabel,
      topicKeywords,
      difficulty: this.difficulty,
      count: this.roundCount,
      formatMode: this.formatMode,
      timerPace: this.timerPace,
    };
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.boundKeydown);
    if (this.rootEl && this.rootEl.parentElement === this.container) {
      this.rootEl.remove();
    }
    this.rootEl = null;
    this.callbacks = null;
  }

  // ==========================================================================
  // INTERNAL TAXONOMY & GEOMETRY HELPERS
  // ==========================================================================

  private buildFallbackCounts(): ForgeUniverseCounts {
    return {
      tier1HumanTotal: 0,
      shardFactTotal: 0,
      verifiedUniqueTotal: 0,
      codexSynthesisTotal: 0,
      totalPlayableCount: 0,
      qidSpaceCapacity: 1_048_575,
      seenTotal: 0,
      loadedShardDomains: [],
      byDomain: FORGE_DOMAINS.map((dom) => ({
        domainId: dom.id,
        key: dom.key,
        name: dom.name,
        shortName: dom.shortName,
        accentHex: dom.accentHex,
        medallionUrl: dom.medallionUrl,
        tier1HumanCount: 0,
        shardFactCount: 0,
        verifiedCount: 0,
        codexSynthesisCount: 0,
        totalPlayableCount: 0,
        shardLoaded: false,
        seenInDomainEst: 0,
      })),
    };
  }

  private rebuildTree(): void {
    let forgeCounts: ForgeUniverseCounts | null = this.options.universeCounts ?? null;

    const forge = this.options.forgeInstance as
      | {
          getTaxonomyTree?: () => unknown;
          getUniverseCounts?: () => ForgeUniverseCounts | null;
        }
      | undefined;

    if (forge && !forgeCounts) {
      try {
        forgeCounts = forge.getUniverseCounts?.() ?? null;
      } catch {
        forgeCounts = null;
      }
    }

    this.tree = buildNormalizedTaxonomyTree(
      forgeCounts ?? this.buildFallbackCounts(),
      this.options.forgeInstance,
    );
  }

  /**
   * Maps a DomainId to clock angle in degrees where 0deg = 12 o'clock (top),
   * progressing clockwise in 30-degree steps around the 12-domain ring.
   */
  private domainToClockDeg(domainId: DomainId): number {
    const idx = WHEEL_DOMAIN_ORDER.indexOf(domainId);
    const safeIdx = idx >= 0 ? idx : 0;
    return safeIdx * 30;
  }

  private clockDegToDomain(deg: number): DomainId {
    const normalized = ((deg % 360) + 360) % 360;
    const step = Math.round(normalized / 30) % 12;
    return WHEEL_DOMAIN_ORDER[step] ?? 0;
  }

  private stepWheelSelection(delta: 1 | -1): void {
    if (this.selectedDomainId === null) {
      this.selectDomain(delta > 0 ? WHEEL_DOMAIN_ORDER[0] : WHEEL_DOMAIN_ORDER[11]);
      return;
    }
    const idx = WHEEL_DOMAIN_ORDER.indexOf(this.selectedDomainId);
    const nextIdx = (idx + delta + 12) % 12;
    this.selectDomain(WHEEL_DOMAIN_ORDER[nextIdx]);
  }

  private selectDomain(domainId: DomainId | null): void {
    this.selectedDomainId = domainId;
    this.selectedL1Id = null;
    this.selectedL2Id = null;
    if (domainId !== null) {
      this.rotorAngleDeg = this.domainToClockDeg(domainId);
      this.drawerExpanded = true;
    }
    this.callbacks?.onInteractionFeedback?.('dial_tick');
    this.updateWheelDom();
    this.updateSubcategoryDrawerDom();
  }

  private getSelectedDomainNode(): TaxonomyL0Domain | null {
    if (this.selectedDomainId === null) return null;
    return this.tree.find((d) => d.domainId === this.selectedDomainId) ?? null;
  }

  // ==========================================================================
  // FULL RENDER & SURGICAL DOM UPDATERS
  // ==========================================================================

  private renderFull(): void {
    const counts = countTaxonomyNodes(this.tree);
    const totalSubtopics = counts.l2Count;
    const isModal = this.options.mode === 'modal';

    const root = document.createElement('section');
    root.className = `v5jb-root${isModal ? ' is-modal-overlay' : ''}`;
    root.setAttribute('aria-label', 'Topic Jukebox — 12 Domains and Subcategory Selector');

    const medallionsHtml = WHEEL_DOMAIN_ORDER.map((domainId, idx) => {
      const theme = DOMAIN_MEDALLION_THEMES[domainId];
      const domainMeta = FORGE_DOMAINS[domainId];
      const angleRad = ((idx * 30 - 90) * Math.PI) / 180;
      const cosVal = Math.cos(angleRad).toFixed(4);
      const sinVal = Math.sin(angleRad).toFixed(4);
      const stat = this.accuracyLookup.domainStats[domainId];
      const stars = accuracyToMasteryStars(stat);
      const isSelected = this.selectedDomainId === domainId;

      return `
        <button
          type="button"
          class="v5jb-medallion${isSelected ? ' is-selected' : ''}"
          data-v5jb-domain="${domainId}"
          style="--tx: calc(var(--orbit-r) * ${cosVal}); --ty: calc(var(--orbit-r) * ${sinVal}); --enamel-top: ${theme.enamelTop}; --enamel-bottom: ${theme.enamelBottom};"
          aria-pressed="${isSelected ? 'true' : 'false'}"
          aria-label="${escapeHtml(domainMeta.name)}${stat ? `, ${stat.pct}% accuracy` : ''}"
        >
          <span class="v5jb-med-disc">${renderDomainEmblemSvg(domainId)}</span>
          <span class="v5jb-med-plate">
            <span class="v5jb-med-name">${escapeHtml(theme.wheelShortLabel)}</span>
            ${renderStarsSvg(stars, 8)}
          </span>
        </button>
      `;
    }).join('');

    const pointerDeg =
      this.selectedDomainId !== null ? this.domainToClockDeg(this.selectedDomainId) : 0;

    root.innerHTML = `
      <div class="v5jb-cabinet">
        <div class="v5jb-lamp v5jb-lamp-left" aria-hidden="true"></div>
        <div class="v5jb-lamp v5jb-lamp-right" aria-hidden="true"></div>

        <!-- TOP BRASS BACK LATCH & 1-TAP FULLSCREEN -->
        <div class="v5jb-topbar">
          <button
            type="button"
            class="v5jb-back-btn"
            data-v5jb-close
            aria-label="Back to Green Room"
          >
            <svg viewBox="0 0 18 18" width="14" height="14" aria-hidden="true">
              <path d="M 11 3 L 5 9 L 11 15" fill="none" stroke="#ffe8a8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Green Room</span>
          </button>
          <div class="v5jb-topbar-right">
            <span class="v5jb-catalog-tag" data-v5jb-catalog-tag>12 Domains · ${totalSubtopics} Topics</span>
            <button
              type="button"
              class="v5jb-fs-btn"
              data-v5jb-fullscreen
              aria-label="Toggle Fullscreen Jukebox"
              title="Toggle Fullscreen"
            >
              ${renderJukeboxFullscreenSvg(typeof document !== 'undefined' && Boolean(document.fullscreenElement))}
            </button>
          </div>
        </div>

        <!-- MARQUEE HEADER FLANKED BY GOLDEN TROPHIES -->
        <header class="v5jb-header-arch">
          <div class="v5jb-marquee-row">
            ${renderTrophyPedestalSvg()}
            <div class="v5jb-marquee-plaque">
              ${renderCrownSvg()}
              ${renderMarqueeHeaderFrameSvg()}
              <h1 class="v5jb-marquee-title" style="margin:0;">TOPIC<br/>JUKEBOX</h1>
            </div>
            ${renderTrophyPedestalSvg()}
          </div>
          <div class="v5jb-ribbon">12 Domains · Trophy Showcase</div>
        </header>

        <!-- MAIN BODY: ROTARY WHEEL + SUBCATEGORY STRIP + THROW-SWITCH CONSOLE -->
        <div class="v5jb-main-layout">
          <!-- INTERACTIVE 12-DOMAIN ROTARY JUKEBOX WHEEL -->
          <div class="v5jb-wheel-col">
            <div class="v5jb-wheel-stage" data-v5jb-wheel-stage>
              ${medallionsHtml}

              <div class="v5jb-wheel-inner-ring">
                <div
                  class="v5jb-rotor-dial"
                  data-v5jb-rotor
                  style="--rotor-deg: ${this.rotorAngleDeg}deg;"
                  title="Drag to spin the brass rotary dial"
                >
                  ${renderRotaryDialCenterSvg()}
                </div>

                <button
                  type="button"
                  class="v5jb-center-hub${this.selectedDomainId === null ? ' is-active' : ''}"
                  data-v5jb-all-domains
                  aria-pressed="${this.selectedDomainId === null ? 'true' : 'false'}"
                  aria-label="Select All 12 Domains Global Mix"
                >
                  <span class="v5jb-hub-main" data-v5jb-hub-main>${this.selectedDomainId === null ? 'ALL 12' : escapeHtml(DOMAIN_MEDALLION_THEMES[this.selectedDomainId].wheelShortLabel)}</span>
                  <span class="v5jb-hub-sub" data-v5jb-hub-sub>${this.selectedDomainId === null ? 'Global Mix' : 'Tap: All 12'}</span>
                </button>
              </div>

              <!-- Glowing Golden Pointer Arrow -->
              <div
                class="v5jb-pointer-arm${this.selectedDomainId === null ? ' is-all-mix' : ''}"
                data-v5jb-pointer
                style="--pointer-deg: ${pointerDeg}deg;"
                aria-hidden="true"
              >
                <svg class="v5jb-pointer-head" viewBox="0 0 28 30">
                  <defs>
                    <linearGradient id="v5jb-ptr-g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#fffbe0"/>
                      <stop offset="55%" stop-color="#ffd052"/>
                      <stop offset="100%" stop-color="#b87212"/>
                    </linearGradient>
                  </defs>
                  <polygon points="14,1 26,27 14,21 2,27" fill="url(#v5jb-ptr-g)" stroke="#623605" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- EXPANDABLE BRASS SUBCATEGORY STRIP + DETENTS + THROW-SWITCH DECK -->
          <div class="v5jb-console-col">
            <!-- Brass Subcategory / Topic Strip + Instant Filter -->
            <section class="v5jb-strip-drawer" aria-label="Subcategory and Topic Filter">
              <div class="v5jb-selection-header">
                <div class="v5jb-now-spinning">
                  <span class="v5jb-now-kicker">Now Spinning</span>
                  <span class="v5jb-now-label" data-v5jb-now-label></span>
                  <span class="v5jb-now-meta" data-v5jb-now-meta></span>
                </div>
                <div class="v5jb-drawer-actions">
                  <button
                    type="button"
                    class="v5jb-mini-brass-btn"
                    data-v5jb-reset-all
                    style="display:none;"
                  >All 12</button>
                  <button
                    type="button"
                    class="v5jb-mini-brass-btn"
                    data-v5jb-toggle-drawer
                    aria-expanded="${this.drawerExpanded ? 'true' : 'false'}"
                  >${this.drawerExpanded ? 'Topics ▴' : 'Subtopics ▾'}</button>
                </div>
              </div>

              <div class="v5jb-search-row">
                ${renderSearchLensSvg()}
                <input
                  type="search"
                  class="v5jb-search-input"
                  data-v5jb-search
                  value="${escapeHtml(this.searchQuery)}"
                  placeholder="Filter ${totalSubtopics} topics (e.g. Baseball, Rome, Space)..."
                  aria-label="Filter subcategories and specialist topics"
                  autocomplete="off"
                />
                <button
                  type="button"
                  class="v5jb-search-clear"
                  data-v5jb-search-clear
                  aria-label="Clear topic filter"
                  style="display:${this.searchQuery.trim() ? 'inline-flex' : 'none'};"
                >✕</button>
              </div>

              <div class="v5jb-subcat-body${this.drawerExpanded ? '' : ' is-collapsed'}" data-v5jb-subcat-body></div>
            </section>

            <!-- Brass Run-Length Detents (5/10/20/50) & Difficulty Selector -->
            <div class="v5jb-detents-bar">
              <div class="v5jb-detent-group">
                <span class="v5jb-detent-label">Questions</span>
                <div class="v5jb-detent-row" role="group" aria-label="Run Length Questions">
                  ${ROUND_LENGTH_DETENTS.map(
                    (cnt) => `
                      <button
                        type="button"
                        class="v5jb-detent-btn${this.roundCount === cnt ? ' is-selected' : ''}"
                        data-v5jb-count="${cnt}"
                        aria-pressed="${this.roundCount === cnt ? 'true' : 'false'}"
                      >${cnt}</button>
                    `,
                  ).join('')}
                </div>
              </div>

              <div class="v5jb-detent-group is-diff-group">
                <span class="v5jb-detent-label">Difficulty</span>
                <div class="v5jb-detent-row" role="group" aria-label="Difficulty Preset">
                  ${DIFFICULTY_DETENTS.map(
                    (d) => `
                      <button
                        type="button"
                        class="v5jb-detent-btn is-diff${this.difficulty === d.id ? ' is-selected' : ''}"
                        data-v5jb-diff="${d.id}"
                        aria-pressed="${this.difficulty === d.id ? 'true' : 'false'}"
                      >${escapeHtml(d.shortLabel)}</button>
                    `,
                  ).join('')}
                </div>
              </div>
            </div>

            <!-- PHYSICAL BRASS THROW-SWITCHES & START CUSTOM SHOW STAGE LEVER -->
            <div class="v5jb-switch-deck">
              <!-- LEFT THROW-SWITCH: 7-Format Mix / Classic -->
              <button
                type="button"
                role="switch"
                class="v5jb-throw-unit ${this.formatMode === 'VARIETY_MIX' ? 'is-up' : 'is-down'}"
                data-v5jb-switch="format"
                aria-checked="${this.formatMode === 'VARIETY_MIX' ? 'true' : 'false'}"
                aria-label="Format Mode: currently ${this.formatMode === 'VARIETY_MIX' ? '7-Format Mix' : 'Classic 4-Choice'}"
              >
                <span class="v5jb-switch-top-plate">7-Format Mix</span>
                <span class="v5jb-switch-plate">
                  <span class="v5jb-rivet v5jb-rivet-tl"></span>
                  <span class="v5jb-rivet v5jb-rivet-tr"></span>
                  <span class="v5jb-rivet v5jb-rivet-bl"></span>
                  <span class="v5jb-rivet v5jb-rivet-br"></span>
                  <span class="v5jb-switch-arrow v5jb-switch-arrow-l" aria-hidden="true">
                    <svg viewBox="0 0 12 12" width="10" height="10"><polygon points="10,1 2,6 10,11" fill="#ffd868"/></svg>
                  </span>
                  <span class="v5jb-toggle-well">
                    <span class="v5jb-toggle-baton"></span>
                  </span>
                  <span class="v5jb-switch-bot-label">Classic</span>
                </span>
              </button>

              <!-- CENTER STAGE LEVER: START CUSTOM SHOW -->
              <button
                type="button"
                class="v5jb-lever-btn"
                data-v5jb-start
                aria-label="Start Custom Show"
              >
                <svg class="v5jb-lever-handle" viewBox="0 0 110 56" aria-hidden="true">
                  <defs>
                    <linearGradient id="v5jb-lev-brass" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stop-color="#7c4b0b"/>
                      <stop offset="45%" stop-color="#fff0a6"/>
                      <stop offset="100%" stop-color="#8b5510"/>
                    </linearGradient>
                    <linearGradient id="v5jb-lev-emerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#38d49c"/>
                      <stop offset="50%" stop-color="#0f7c56"/>
                      <stop offset="100%" stop-color="#063e2b"/>
                    </linearGradient>
                  </defs>
                  <!-- Pivot arms -->
                  <rect x="20" y="22" width="12" height="32" rx="4" fill="url(#v5jb-lev-brass)" stroke="#4c2905" stroke-width="2"/>
                  <rect x="78" y="22" width="12" height="32" rx="4" fill="url(#v5jb-lev-brass)" stroke="#4c2905" stroke-width="2"/>
                  <!-- End brass collars -->
                  <rect x="10" y="7" width="16" height="22" rx="6" fill="url(#v5jb-lev-brass)" stroke="#4c2905" stroke-width="2"/>
                  <rect x="84" y="7" width="16" height="22" rx="6" fill="url(#v5jb-lev-brass)" stroke="#4c2905" stroke-width="2"/>
                  <!-- Sculpted emerald cylindrical bar handle -->
                  <rect x="23" y="8" width="64" height="20" rx="8" fill="url(#v5jb-lev-emerald)" stroke="#5b3406" stroke-width="2"/>
                  <rect x="28" y="12" width="54" height="4" rx="2" fill="rgba(220,255,238,0.45)"/>
                </svg>
                <span class="v5jb-start-plaque">
                  <span class="v5jb-start-big">START</span>
                  <span class="v5jb-start-sub">Custom Show</span>
                </span>
              </button>

              <!-- RIGHT THROW-SWITCH: Shot Clock / Relaxed ∞ -->
              <button
                type="button"
                role="switch"
                class="v5jb-throw-unit ${this.timerPace === 'STANDARD' ? 'is-up' : 'is-down'}"
                data-v5jb-switch="timer"
                aria-checked="${this.timerPace === 'STANDARD' ? 'true' : 'false'}"
                aria-label="Clock Pace: currently ${this.timerPace === 'STANDARD' ? 'Shot Clock' : 'Relaxed Untimed'}"
              >
                <span class="v5jb-switch-top-plate">Shot Clock</span>
                <span class="v5jb-switch-plate">
                  <span class="v5jb-rivet v5jb-rivet-tl"></span>
                  <span class="v5jb-rivet v5jb-rivet-tr"></span>
                  <span class="v5jb-rivet v5jb-rivet-bl"></span>
                  <span class="v5jb-rivet v5jb-rivet-br"></span>
                  <span class="v5jb-switch-arrow v5jb-switch-arrow-r" aria-hidden="true">
                    <svg viewBox="0 0 12 12" width="10" height="10"><polygon points="2,1 10,6 2,11" fill="#ffd868"/></svg>
                  </span>
                  <span class="v5jb-toggle-well">
                    <span class="v5jb-toggle-baton"></span>
                  </span>
                  <span class="v5jb-switch-bot-label">Relaxed ∞</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.replaceChildren(root);
    this.rootEl = root;

    this.bindEvents(root);
    this.updateWheelDom();
    this.updateSubcategoryDrawerDom();
  }

  private bindEvents(root: HTMLElement): void {
    // Back latch & 1-Tap Fullscreen
    root.querySelector<HTMLButtonElement>('[data-v5jb-close]')?.addEventListener('click', () => {
      this.callbacks?.onInteractionFeedback?.('tap');
      this.callbacks?.onClose();
    });

    const fsBtn = root.querySelector<HTMLButtonElement>('[data-v5jb-fullscreen]');
    fsBtn?.addEventListener('click', () => {
      this.callbacks?.onInteractionFeedback?.('tap');
      toggleJukeboxFullscreen((isFs) => {
        fsBtn.innerHTML = renderJukeboxFullscreenSvg(isFs);
        fsBtn.setAttribute('aria-label', isFs ? 'Exit Fullscreen Jukebox' : 'Toggle Fullscreen Jukebox');
        this.callbacks?.onToggleFullscreen?.(isFs);
      });
    });

    // 12 Domain medallions
    root.querySelectorAll<HTMLButtonElement>('[data-v5jb-domain]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const domainId = Number(btn.dataset.v5jbDomain) as DomainId;
        if (this.selectedDomainId === domainId && !this.selectedL1Id) {
          // Clicking already-selected domain focuses/opens its subcategories
          this.drawerExpanded = true;
          this.updateSubcategoryDrawerDom();
          this.callbacks?.onInteractionFeedback?.('tap');
          return;
        }
        this.selectDomain(domainId);
      });
    });

    // Center "All 12 Domains" brass hub
    root.querySelector<HTMLButtonElement>('[data-v5jb-all-domains]')?.addEventListener('click', () => {
      this.selectDomain(null);
    });

    // Rotary brass dial drag-to-spin interaction
    const rotorEl = root.querySelector<HTMLElement>('[data-v5jb-rotor]');
    if (rotorEl) {
      const computePointerAngle = (ev: PointerEvent): number => {
        const rect = rotorEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        return (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI;
      };

      rotorEl.addEventListener('pointerdown', (ev) => {
        this.isDraggingDial = true;
        this.dragStartPointerAngle = computePointerAngle(ev);
        this.dragStartRotorAngle = this.rotorAngleDeg;
        this.lastSnapStep = Math.round((((this.rotorAngleDeg % 360) + 360) % 360) / 30) % 12;
        rotorEl.classList.add('is-dragging');
        try {
          rotorEl.setPointerCapture(ev.pointerId);
        } catch {
          // Ignore synthetic pointer events
        }
      });

      rotorEl.addEventListener('pointermove', (ev) => {
        if (!this.isDraggingDial) return;
        const currentAngle = computePointerAngle(ev);
        let delta = currentAngle - this.dragStartPointerAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        const nextAngle = this.dragStartRotorAngle + delta;
        this.rotorAngleDeg = nextAngle;
        rotorEl.style.setProperty('--rotor-deg', `${nextAngle.toFixed(1)}deg`);

        const nextDomain = this.clockDegToDomain(nextAngle);
        const step = WHEEL_DOMAIN_ORDER.indexOf(nextDomain);
        if (step !== this.lastSnapStep) {
          this.lastSnapStep = step;
          this.selectedDomainId = nextDomain;
          this.selectedL1Id = null;
          this.selectedL2Id = null;
          this.drawerExpanded = true;
          this.callbacks?.onInteractionFeedback?.('dial_tick');
          this.updateWheelDom(false);
          this.updateSubcategoryDrawerDom();
        }
      });

      const endDrag = (ev: PointerEvent): void => {
        if (!this.isDraggingDial) return;
        this.isDraggingDial = false;
        rotorEl.classList.remove('is-dragging');
        try {
          rotorEl.releasePointerCapture(ev.pointerId);
        } catch {
          // Ignore
        }
        if (this.selectedDomainId !== null) {
          this.rotorAngleDeg = this.domainToClockDeg(this.selectedDomainId);
        }
        this.updateWheelDom(true);
      };

      rotorEl.addEventListener('pointerup', endDrag);
      rotorEl.addEventListener('pointercancel', endDrag);
    }

    // Drawer expand/collapse & reset
    root.querySelector<HTMLButtonElement>('[data-v5jb-toggle-drawer]')?.addEventListener('click', () => {
      this.drawerExpanded = !this.drawerExpanded;
      this.callbacks?.onInteractionFeedback?.('tap');
      this.updateSubcategoryDrawerDom();
    });

    root.querySelector<HTMLButtonElement>('[data-v5jb-reset-all]')?.addEventListener('click', () => {
      this.searchQuery = '';
      const searchEl = root.querySelector<HTMLInputElement>('[data-v5jb-search]');
      if (searchEl) searchEl.value = '';
      this.selectDomain(null);
    });

    // Live instant search across all 157 subcategories
    const searchInput = root.querySelector<HTMLInputElement>('[data-v5jb-search]');
    const clearBtn = root.querySelector<HTMLButtonElement>('[data-v5jb-search-clear]');
    searchInput?.addEventListener('input', () => {
      this.searchQuery = searchInput.value;
      if (this.searchQuery.trim().length > 0) {
        this.drawerExpanded = true;
      }
      if (clearBtn) {
        clearBtn.style.display = this.searchQuery.trim().length > 0 ? 'inline-flex' : 'none';
      }
      this.updateSubcategoryDrawerDom();
    });

    clearBtn?.addEventListener('click', () => {
      this.searchQuery = '';
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      clearBtn.style.display = 'none';
      this.callbacks?.onInteractionFeedback?.('tap');
      this.updateSubcategoryDrawerDom();
    });

    // Run-length brass detents (5 / 10 / 20 / 50)
    root.querySelectorAll<HTMLButtonElement>('[data-v5jb-count]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = Number(btn.dataset.v5jbCount) as BriefingRoundCount;
        if (!ROUND_LENGTH_DETENTS.includes(val)) return;
        this.roundCount = val;
        this.callbacks?.onInteractionFeedback?.('tap');
        root.querySelectorAll<HTMLButtonElement>('[data-v5jb-count]').forEach((b) => {
          const active = Number(b.dataset.v5jbCount) === val;
          b.classList.toggle('is-selected', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      });
    });

    // Academic difficulty detents
    root.querySelectorAll<HTMLButtonElement>('[data-v5jb-diff]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = normalizeBriefingDifficultyPreset(btn.dataset.v5jbDiff ?? 'ADAPTIVE');
        this.difficulty = preset;
        writeLocalPref(STORAGE_DIFF_KEY, preset);
        this.callbacks?.onInteractionFeedback?.('tap');
        root.querySelectorAll<HTMLButtonElement>('[data-v5jb-diff]').forEach((b) => {
          const active = b.dataset.v5jbDiff === preset;
          b.classList.toggle('is-selected', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      });
    });

    // Physical Brass Throw-Switches
    const formatSwitch = root.querySelector<HTMLButtonElement>('[data-v5jb-switch="format"]');
    formatSwitch?.addEventListener('click', () => {
      this.formatMode =
        this.formatMode === 'VARIETY_MIX' ? 'CLASSIC_4_ONLY' : 'VARIETY_MIX';
      writeLocalPref(STORAGE_FORMAT_KEY, this.formatMode);
      const isUp = this.formatMode === 'VARIETY_MIX';
      formatSwitch.classList.toggle('is-up', isUp);
      formatSwitch.classList.toggle('is-down', !isUp);
      formatSwitch.setAttribute('aria-checked', isUp ? 'true' : 'false');
      formatSwitch.setAttribute(
        'aria-label',
        `Format Mode: currently ${isUp ? '7-Format Mix' : 'Classic 4-Choice'}`,
      );
      this.callbacks?.onInteractionFeedback?.('switch_flip');
      this.callbacks?.onChangeFormatMode?.(this.formatMode);
    });

    const timerSwitch = root.querySelector<HTMLButtonElement>('[data-v5jb-switch="timer"]');
    timerSwitch?.addEventListener('click', () => {
      this.timerPace =
        this.timerPace === 'STANDARD' ? 'RELAXED_UNTIMED' : 'STANDARD';
      writeLocalPref(STORAGE_TIMER_KEY, this.timerPace);
      const isUp = this.timerPace === 'STANDARD';
      timerSwitch.classList.toggle('is-up', isUp);
      timerSwitch.classList.toggle('is-down', !isUp);
      timerSwitch.setAttribute('aria-checked', isUp ? 'true' : 'false');
      timerSwitch.setAttribute(
        'aria-label',
        `Clock Pace: currently ${isUp ? 'Shot Clock' : 'Relaxed Untimed'}`,
      );
      this.callbacks?.onInteractionFeedback?.('switch_flip');
      this.callbacks?.onChangeTimerPace?.(this.timerPace);
    });

    // Center START CUSTOM SHOW Stage Lever
    const startBtn = root.querySelector<HTMLButtonElement>('[data-v5jb-start]');
    startBtn?.addEventListener('click', () => {
      startBtn.classList.add('is-pulling');
      this.callbacks?.onInteractionFeedback?.('lever_pull');
      writeLocalPref(STORAGE_FORMAT_KEY, this.formatMode);
      writeLocalPref(STORAGE_TIMER_KEY, this.timerPace);
      writeLocalPref(STORAGE_DIFF_KEY, this.difficulty);
      const spec = this.getCurrentLaunchSpec();
      window.setTimeout(() => {
        startBtn.classList.remove('is-pulling');
        this.callbacks?.onStartCustomShow(spec);
      }, 130);
    });
  }

  private updateCatalogCountTag(): void {
    if (!this.rootEl) return;
    const counts = countTaxonomyNodes(this.tree);
    const tag = this.rootEl.querySelector<HTMLElement>('[data-v5jb-catalog-tag]');
    if (tag) {
      tag.textContent = `12 Domains · ${counts.l2Count} Topics`;
    }
    const input = this.rootEl.querySelector<HTMLInputElement>('[data-v5jb-search]');
    if (input) {
      input.placeholder = `Filter ${counts.l2Count} topics (e.g. Baseball, Rome, Space)...`;
    }
  }

  private updateWheelDom(syncRotor = true): void {
    if (!this.rootEl) return;
    const isAllMix = this.selectedDomainId === null;

    this.rootEl.querySelectorAll<HTMLButtonElement>('[data-v5jb-domain]').forEach((btn) => {
      const id = Number(btn.dataset.v5jbDomain) as DomainId;
      const selected = this.selectedDomainId === id;
      btn.classList.toggle('is-selected', selected);
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    const hub = this.rootEl.querySelector<HTMLButtonElement>('[data-v5jb-all-domains]');
    const hubMain = this.rootEl.querySelector<HTMLElement>('[data-v5jb-hub-main]');
    const hubSub = this.rootEl.querySelector<HTMLElement>('[data-v5jb-hub-sub]');
    if (hub) {
      hub.classList.toggle('is-active', isAllMix);
      hub.setAttribute('aria-pressed', isAllMix ? 'true' : 'false');
    }
    if (hubMain && hubSub) {
      if (isAllMix) {
        hubMain.textContent = 'ALL 12';
        hubSub.textContent = 'Global Mix';
      } else {
        const theme = DOMAIN_MEDALLION_THEMES[this.selectedDomainId!];
        hubMain.textContent = theme.wheelShortLabel;
        hubSub.textContent = 'Tap: All 12';
      }
    }

    const pointer = this.rootEl.querySelector<HTMLElement>('[data-v5jb-pointer]');
    if (pointer) {
      pointer.classList.toggle('is-all-mix', isAllMix);
      if (!isAllMix) {
        pointer.style.setProperty(
          '--pointer-deg',
          `${this.domainToClockDeg(this.selectedDomainId!)}deg`,
        );
      }
    }

    if (syncRotor) {
      const rotor = this.rootEl.querySelector<HTMLElement>('[data-v5jb-rotor]');
      if (rotor) {
        rotor.style.setProperty('--rotor-deg', `${this.rotorAngleDeg}deg`);
      }
    }
  }

  private updateSubcategoryDrawerDom(): void {
    if (!this.rootEl) return;
    const spec = this.getCurrentLaunchSpec();

    const nowLabel = this.rootEl.querySelector<HTMLElement>('[data-v5jb-now-label]');
    const nowMeta = this.rootEl.querySelector<HTMLElement>('[data-v5jb-now-meta]');
    const resetAllBtn = this.rootEl.querySelector<HTMLButtonElement>('[data-v5jb-reset-all]');
    const toggleBtn = this.rootEl.querySelector<HTMLButtonElement>('[data-v5jb-toggle-drawer]');
    const bodyEl = this.rootEl.querySelector<HTMLElement>('[data-v5jb-subcat-body]');

    if (nowLabel) {
      nowLabel.textContent = spec.selectionLabel;
    }

    if (nowMeta) {
      if (this.selectedDomainId === null) {
        const playedDomains = Object.values(this.accuracyLookup.domainStats).filter(
          (s): s is TopicJukeboxAccuracyStat => Boolean(s && s.total > 0),
        );
        if (playedDomains.length > 0) {
          const avgPct = Math.round(
            playedDomains.reduce((acc, s) => acc + s.pct, 0) / playedDomains.length,
          );
          const avgStars = accuracyToMasteryStars({ pct: avgPct, total: 5 });
          nowMeta.innerHTML = `${renderStarsSvg(avgStars, 12)} <span>${avgPct}% Personal Accuracy</span>`;
        } else {
          nowMeta.innerHTML = `${renderStarsSvg(0, 12)} <span>Fresh Showcase · Ready to Spin</span>`;
        }
      } else {
        const stat = this.accuracyLookup.domainStats[this.selectedDomainId];
        const stars = accuracyToMasteryStars(stat);
        nowMeta.innerHTML = stat
          ? `${renderStarsSvg(stars, 12)} <span>${stat.pct}% Personal Accuracy</span>`
          : `${renderStarsSvg(0, 12)} <span>Uncharted Domain · Spin to Earn Stars</span>`;
      }
    }

    if (resetAllBtn) {
      resetAllBtn.style.display = this.selectedDomainId !== null ? 'inline-flex' : 'none';
    }

    if (toggleBtn) {
      toggleBtn.textContent = this.drawerExpanded ? 'Topics ▴' : 'Subtopics ▾';
      toggleBtn.setAttribute('aria-expanded', this.drawerExpanded ? 'true' : 'false');
    }

    if (!bodyEl) return;
    bodyEl.classList.toggle('is-collapsed', !this.drawerExpanded);
    if (!this.drawerExpanded) return;

    const query = this.searchQuery.trim();
    if (query.length > 0) {
      const hits = searchTaxonomyTree(this.tree, query);
      if (hits.length === 0) {
        bodyEl.innerHTML = `<div class="v5jb-empty-search">No topics matching "${escapeHtml(query)}". Try "Baseball", "Rome", "Space", or "Opera".</div>`;
        return;
      }

      bodyEl.innerHTML = `
        <div class="v5jb-strip-section-title">Instant Filter Matches (${hits.length})</div>
        <div class="v5jb-chip-wrap">
          ${hits
            .map((h) => {
              const isSelected =
                this.selectedDomainId === h.domainId &&
                this.selectedL1Id === h.l1Id &&
                (h.kind === 'L2' ? this.selectedL2Id === h.l2Id : !this.selectedL2Id);
              const leafKey = (h.l2Name ?? h.l1Name).trim().toLowerCase();
              const acc = this.accuracyLookup.subcatStats[leafKey];
              return `
                <button
                  type="button"
                  class="v5jb-topic-chip${isSelected ? ' is-selected' : ''}"
                  data-v5jb-hit-domain="${h.domainId}"
                  data-v5jb-hit-l1="${escapeHtml(h.l1Id)}"
                  data-v5jb-hit-l2="${escapeHtml(h.l2Id ?? '')}"
                >
                  <span>${escapeHtml(h.breadcrumb)}</span>
                  ${acc ? `<span class="v5jb-chip-acc">${acc.pct}%</span>` : ''}
                </button>
              `;
            })
            .join('')}
        </div>
      `;

      bodyEl.querySelectorAll<HTMLButtonElement>('[data-v5jb-hit-domain]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const domId = Number(btn.dataset.v5jbHitDomain) as DomainId;
          const l1 = btn.dataset.v5jbHitL1 || null;
          const l2 = btn.dataset.v5jbHitL2 || null;
          this.selectedDomainId = domId;
          this.selectedL1Id = l1;
          this.selectedL2Id = l2;
          this.rotorAngleDeg = this.domainToClockDeg(domId);
          this.callbacks?.onInteractionFeedback?.('dial_tick');
          this.updateWheelDom();
          this.updateSubcategoryDrawerDom();
        });
      });
      return;
    }

    // No search query: show either current domain's L1 -> L2 jukebox song-strip,
    // or all 12 domain quick jump tabs when on Global Mix!
    const domNode = this.getSelectedDomainNode();
    if (!domNode) {
      const featuredTopics: TaxonomyL2Topic[] = [];
      for (const d of this.tree) {
        const firstL1 = d.subcategories[0];
        const firstL2 = firstL1?.topics[0];
        if (firstL2) featuredTopics.push(firstL2);
      }

      bodyEl.innerHTML = `
        <div class="v5jb-strip-section-title">Quick-Spin Specialist Topics (All 12 Domains)</div>
        <div class="v5jb-chip-wrap">
          ${featuredTopics
            .map((t) => {
              const acc = this.accuracyLookup.subcatStats[t.name.trim().toLowerCase()];
              return `
                <button
                  type="button"
                  class="v5jb-topic-chip"
                  data-v5jb-quick-domain="${t.domainId}"
                  data-v5jb-quick-l1="${escapeHtml(t.l1Id)}"
                  data-v5jb-quick-l2="${escapeHtml(t.id)}"
                >
                  <span>${escapeHtml(t.name)}</span>
                  ${acc ? `<span class="v5jb-chip-acc">${acc.pct}%</span>` : ''}
                </button>
              `;
            })
            .join('')}
        </div>
      `;

      bodyEl.querySelectorAll<HTMLButtonElement>('[data-v5jb-quick-domain]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const domId = Number(btn.dataset.v5jbQuickDomain) as DomainId;
          this.selectedDomainId = domId;
          this.selectedL1Id = btn.dataset.v5jbQuickL1 || null;
          this.selectedL2Id = btn.dataset.v5jbQuickL2 || null;
          this.rotorAngleDeg = this.domainToClockDeg(domId);
          this.callbacks?.onInteractionFeedback?.('dial_tick');
          this.updateWheelDom();
          this.updateSubcategoryDrawerDom();
        });
      });
      return;
    }

    const activeL1: TaxonomyL1Category | null =
      domNode.subcategories.find((c) => c.id === this.selectedL1Id) ?? null;

    const l1Html = `
      <div class="v5jb-strip-section-title">${escapeHtml(domNode.name)} · Subcategories</div>
      <div class="v5jb-chip-wrap">
        <button
          type="button"
          class="v5jb-topic-chip${!this.selectedL1Id ? ' is-selected' : ''}"
          data-v5jb-l1=""
        >All ${escapeHtml(domNode.shortName)}</button>
        ${domNode.subcategories
          .map((c1) => {
            const active = this.selectedL1Id === c1.id;
            const acc = this.accuracyLookup.subcatStats[c1.name.trim().toLowerCase()];
            return `
              <button
                type="button"
                class="v5jb-topic-chip${active ? ' is-selected' : ''}"
                data-v5jb-l1="${escapeHtml(c1.id)}"
              >
                <span>${escapeHtml(c1.name)}</span>
                ${acc ? `<span class="v5jb-chip-acc">${acc.pct}%</span>` : ''}
              </button>
            `;
          })
          .join('')}
      </div>
    `;

    const l2Html = activeL1
      ? `
        <div class="v5jb-strip-section-title">${escapeHtml(activeL1.name)} · Specialist Topics</div>
        <div class="v5jb-chip-wrap">
          <button
            type="button"
            class="v5jb-topic-chip${!this.selectedL2Id ? ' is-selected' : ''}"
            data-v5jb-l2=""
          >All ${escapeHtml(activeL1.name)}</button>
          ${activeL1.topics
            .map((t2) => {
              const active = this.selectedL2Id === t2.id;
              const acc = this.accuracyLookup.subcatStats[t2.name.trim().toLowerCase()];
              return `
                <button
                  type="button"
                  class="v5jb-topic-chip${active ? ' is-selected' : ''}"
                  data-v5jb-l2="${escapeHtml(t2.id)}"
                >
                  <span>${escapeHtml(t2.name)}</span>
                  ${acc ? `<span class="v5jb-chip-acc">${acc.pct}%</span>` : ''}
                </button>
              `;
            })
            .join('')}
        </div>
      `
      : '';

    bodyEl.innerHTML = `${l1Html}${l2Html}`;

    bodyEl.querySelectorAll<HTMLButtonElement>('[data-v5jb-l1]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextL1 = btn.dataset.v5jbL1 || null;
        this.selectedL1Id = nextL1;
        this.selectedL2Id = null;
        this.callbacks?.onInteractionFeedback?.('tap');
        this.updateSubcategoryDrawerDom();
      });
    });

    bodyEl.querySelectorAll<HTMLButtonElement>('[data-v5jb-l2]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextL2 = btn.dataset.v5jbL2 || null;
        this.selectedL2Id = nextL2;
        this.callbacks?.onInteractionFeedback?.('tap');
        this.updateSubcategoryDrawerDom();
      });
    });
  }
}

export function mountTopicJukebox(
  container: HTMLElement,
  callbacks: TopicJukeboxCallbacks,
  options?: TopicJukeboxOpenOptions,
): TopicJukeboxView {
  const view = new TopicJukeboxView(container);
  view.mount(callbacks, options);
  return view;
}
