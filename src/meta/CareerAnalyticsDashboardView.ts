// ============================================================================
// WORLD'S SMARTEST — Career Analytics & Linked Interactive Graphs (`v3.0`)
// 100% Live Multi-Dimensional Cross-Filtering across all 5 Sections:
//  • Unified `AnalyticsFilterState` (range, domainId, subcatLabel, archetype,
//    peelTier, outcome, speedBucket, bucketKey)
//  • Active Drill-Down Breadcrumb & 3 Linked Action Buttons (`#ws-stats-filter-bar`)
//  • Graph 1: Stacked Right/Wrong Bars & Rolling Accuracy % (clickable bars)
//  • Graph 2: 12-Domain Polar Radar (clickable spokes/labels) + 12 Domain Rows
//    + Live Subcategory Breakdown when a domain is active
//  • Graph 3: Filtered IRT ELO Trajectory & Double-Down Conviction Telemetry
//  • Graph 4A: Clickable 6-Morph Matrix & Plain-English Hint Tiers
//    (`No Hint (3x)` · `Hint (2x)` · `50/50 (1x)`)
//  • Graph 4B: Clickable 5-Bucket Speed Histogram SVG (`[data-speed-bucket]`)
//  • Section 5: Live-Filtered Question Ledger Tape
//  • Zero OS color emojis · Zero nested 4-sided boxes · Zero backdrop-filter ·
//    Zero year commas · >= 44px touch targets · 0px overflow on 360x640..1280x800
// ============================================================================

import {
  SOVEREIGN_DOMAINS,
  getSovereignDomainMeta,
  type DomainId,
  type PassportSystem,
} from '../narrative';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import {
  ALL_ANALYTICS_ARCHETYPES,
  ALL_V4_QUESTION_FORMATS,
  SPEED_BUCKET_LABELS,
  buildPlayerStatProfileForHost,
  computeFilteredAnalyticsView,
  computeSpeedBucketIdx,
  createDefaultAnalyticsFilter,
  inferQuestionFormatFromEvent,
  isDoubleDownEvent,
  type AnalyticsArchetype,
  type AnalyticsBarBucketPoint,
  type AnalyticsEloPoint,
  type AnalyticsFilterState,
  type AnalyticsOutcomeFilter,
  type AnalyticsSpeedBucketIndex,
  type AnalyticsTimeRange,
  type CareerAnalyticsStore,
  type FilteredAnalyticsView,
  type QuestionAnalyticsEvent,
} from './CareerAnalyticsStore';
import type { QuestionFormatV4 } from '../v4/contracts';
import type { HonourAspectCategory } from './HallOfHonoursSystem';
import type { SpacedRepetitionEngine } from './SpacedRepetitionEngine';
import {
  attachMetaEscapeHandler,
  bindVaultJumperEvents,
  ensureMetaStylesInjected,
  escapeMetaHtml,
  renderVaultJumperHtml,
  sanitizeMetaCopy,
  type MetaSuiteSectionId,
} from './DiplomaticPassportBook';

export interface PracticeSliceRequest {
  domainId: number | null;
  subcatLabel: string | null;
  outcome: AnalyticsOutcomeFilter;
  archetype?: AnalyticsArchetype | null;
  questionFormat?: QuestionFormatV4 | null;
  peelTier?: 1 | 2 | 3 | null;
  speedBucket?: AnalyticsSpeedBucketIndex | null;
}

export interface RelatedHonoursRequest {
  aspect: HonourAspectCategory | 'ALL';
  contextLabel?: string | null;
  domainId: DomainId | null;
  archetype: AnalyticsArchetype | null;
  peelTier: 1 | 2 | 3 | null;
  outcome: AnalyticsOutcomeFilter;
  speedBucket: AnalyticsSpeedBucketIndex | null;
}

export interface CareerAnalyticsDashboardDependencies {
  store: CareerAnalyticsStore;
  passport: PassportSystem;
  srsEngine?: SpacedRepetitionEngine;
  audio?: StudioAudioEngine;
  haptics?: HapticsEngine;
}

export interface CareerAnalyticsDashboardCallbacks {
  onPracticeSlice?: (slice: PracticeSliceRequest) => void;
  onOpenMissedCards?: (domainId: DomainId | null) => void;
  onOpenRelatedHonours?: (req: RelatedHonoursRequest) => void;
  onNavigateSection?: (section: MetaSuiteSectionId) => void;
  onBack?: () => void;
  onClose?: () => void;
}

export interface CareerAnalyticsOpenOptions extends CareerAnalyticsDashboardCallbacks {
  initialRange?: AnalyticsTimeRange;
  initialDomainId?: DomainId | number | null;
  initialSubcatLabel?: string | null;
  initialArchetype?: AnalyticsArchetype | null;
  initialQuestionFormat?: QuestionFormatV4 | null;
  initialPeelTier?: 1 | 2 | 3 | null;
  initialOutcome?: AnalyticsOutcomeFilter;
  initialSpeedBucket?: AnalyticsSpeedBucketIndex | null;
  canGoBack?: boolean;
}

const ARCHETYPE_SHORT_LABELS: Record<AnalyticsArchetype, string> = {
  SIGHTLINE_LOCK: 'Classic 4-Choice',
  CODEX_DUAL_RING: 'Dual-Ring Match',
  CALIBRATOR_DIAL: 'Calibrator Dial',
  GAUNTLET_SHATTER: 'Rapid Shatter',
  HERO_ARTIFACT_SYNTHESIS: 'Finale Chain',
  GLOBE_PIN_DROP: 'Globe Pin-Drop',
};

const FORMAT_MASTERY_LABELS: Record<QuestionFormatV4, string> = {
  MULTIPLE_CHOICE: '4-Choice',
  MATCH_4: 'Match-4',
  SORT_4: 'Sort-4',
  MULTI_STRIKE: 'Multi-Strike',
  PINPOINT_DIAL: 'Pinpoint',
  CLUE_ESCALATOR: '3-Clue',
  VISUAL_SPOTTER: 'Visual',
};

const PEEL_TIER_LABELS: Record<'1' | '2' | '3', string> = {
  '1': 'No Hint (3x)',
  '2': 'Hint (2x)',
  '3': '50/50 (1x)',
};

const PEEL_TIER_SHORT_TAGS: Record<1 | 2 | 3, string> = {
  1: 'No Hint',
  2: 'Hint',
  3: '50/50',
};

const OUTCOME_LABELS: Record<AnalyticsOutcomeFilter, string> = {
  ALL: 'All Answers',
  RIGHT: 'Right Only',
  WRONG: 'Wrong Only',
  DOUBLE_DOWN: '2x Double Down',
};

function pctStr(right: number, wrong: number): string {
  const tot = right + wrong;
  if (tot <= 0) return '—';
  return `${((right / tot) * 100).toFixed(1)}%`;
}

function clampDomainOrNull(raw?: DomainId | number | null): DomainId | null {
  if (raw === undefined || raw === null) return null;
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 0 || n > 11) return null;
  return n as DomainId;
}

function inferRelatedHonourAspect(filter: AnalyticsFilterState): HonourAspectCategory | 'ALL' {
  if (filter.domainId !== null) return 'DOMAINS_POLYMATH';
  if (filter.speedBucket !== null) return 'STREAK_SPEED';
  if (
    filter.archetype !== null ||
    Boolean(filter.questionFormat) ||
    filter.peelTier !== null ||
    filter.outcome === 'DOUBLE_DOWN'
  ) {
    return 'PRISM_OVERCLOCK';
  }
  return 'ALL';
}

function buildFilterContextLabel(filter: AnalyticsFilterState): string | null {
  const parts: string[] = [];
  if (filter.domainId !== null) {
    parts.push(getSovereignDomainMeta(filter.domainId).name);
  }
  if (filter.subcatLabel) parts.push(filter.subcatLabel);
  if (filter.questionFormat) parts.push(FORMAT_MASTERY_LABELS[filter.questionFormat]);
  if (filter.archetype) parts.push(ARCHETYPE_SHORT_LABELS[filter.archetype]);
  if (filter.peelTier !== null) parts.push(PEEL_TIER_LABELS[String(filter.peelTier) as '1' | '2' | '3']);
  if (filter.outcome !== 'ALL') parts.push(OUTCOME_LABELS[filter.outcome]);
  if (filter.speedBucket !== null) parts.push(SPEED_BUCKET_LABELS[filter.speedBucket]);
  return parts.length > 0 ? parts.join(' · ') : null;
}

/**
 * Graph 1: High-DPI SVG Stacked Right/Wrong Bars + Golden Rolling Accuracy % Trend Curve.
 * Every bar is clickable to filter the entire dashboard to that day or question!
 */
function buildRightWrongTrendSvg(
  series: readonly AnalyticsBarBucketPoint[],
  activeBucketKey: string | null,
): string {
  const w = 560;
  const h = 192;
  const padL = 36;
  const padR = 36;
  const padT = 18;
  const padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  if (series.length === 0) {
    return `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;">
        <rect x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" rx="8" fill="rgba(12,17,28,0.65)" stroke="rgba(216,175,87,0.2)" stroke-dasharray="4 4"/>
        <text x="${w / 2}" y="${h / 2 - 7}" text-anchor="middle" fill="#b8b2a6" font-size="11.5" font-family="Inter,sans-serif">
          <tspan x="${w / 2}" dy="0">No questions match this active filter slice</tspan>
          <tspan x="${w / 2}" dy="17">Adjust filters or reset to inspect all history</tspan>
        </text>
      </svg>
    `;
  }

  const maxCount = Math.max(1, ...series.map((p) => p.right + p.wrong));
  const stepX = plotW / series.length;
  const barW = Math.max(6, Math.min(28, stepX * 0.66));

  const gridLines = [0, 0.5, 1.0]
    .map((frac) => {
      const y = padT + (1 - frac) * plotH;
      const pctLbl = `${Math.round(frac * 100)}%`;
      const cntLbl = Math.round(frac * maxCount);
      return `
        <line x1="${padL}" y1="${y.toFixed(1)}" x2="${w - padR}" y2="${y.toFixed(1)}" stroke="rgba(216,175,87,0.15)" stroke-dasharray="3 3"/>
        <text x="${padL - 5}" y="${(y + 3).toFixed(1)}" text-anchor="end" fill="#a5afc2" font-size="9.5" font-family="JetBrains Mono,monospace">${cntLbl}</text>
        <text x="${w - padR + 5}" y="${(y + 3).toFixed(1)}" text-anchor="start" fill="#f2cf7e" font-size="9.5" font-family="JetBrains Mono,monospace">${pctLbl}</text>
      `;
    })
    .join('');

  const barsSvg: string[] = [];
  const linePts: string[] = [];
  const dotsSvg: string[] = [];

  series.forEach((pt, idx) => {
    const cx = padL + stepX * (idx + 0.5);
    const rH = (pt.right / maxCount) * plotH;
    const wH = (pt.wrong / maxCount) * plotH;
    const rY = padT + plotH - rH;
    const wY = rY - wH;
    const isSel = pt.isSelected || activeBucketKey === pt.bucketKey;
    const dimmed = activeBucketKey !== null && !isSel;

    barsSvg.push(`
      <g
        data-g1-idx="${idx}"
        data-g1-bucket="${escapeMetaHtml(pt.bucketKey)}"
        data-g1-right="${pt.right}"
        data-g1-wrong="${pt.wrong}"
        role="button"
        tabindex="0"
        aria-label="${escapeMetaHtml(`${pt.label}: ${pt.right} right, ${pt.wrong} wrong`)}"
        style="cursor:pointer;opacity:${dimmed ? '0.32' : '1'};"
      >
        <rect x="${(cx - stepX * 0.48).toFixed(1)}" y="${padT}" width="${(stepX * 0.96).toFixed(1)}" height="${plotH + 18}" fill="${isSel ? 'rgba(242,207,126,0.15)' : 'transparent'}" rx="3"/>
        ${rH > 0 ? `<rect x="${(cx - barW / 2).toFixed(1)}" y="${rY.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(2, rH).toFixed(1)}" fill="#39d49a" rx="2"/>` : ''}
        ${wH > 0 ? `<rect x="${(cx - barW / 2).toFixed(1)}" y="${wY.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(2, wH).toFixed(1)}" fill="#e05263" rx="2"/>` : ''}
        ${isSel ? `<line x1="${cx.toFixed(1)}" y1="${padT}" x2="${cx.toFixed(1)}" y2="${padT + plotH}" stroke="#f2cf7e" stroke-width="1.2" stroke-dasharray="2 2"/>` : ''}
      </g>
    `);

    const accY = padT + (1 - pt.rollingAccPct / 100) * plotH;
    linePts.push(`${cx.toFixed(1)},${accY.toFixed(1)}`);
    dotsSvg.push(
      `<circle data-g1-idx="${idx}" data-g1-bucket="${escapeMetaHtml(pt.bucketKey)}" cx="${cx.toFixed(1)}" cy="${accY.toFixed(1)}" r="${isSel ? '5.2' : '3.2'}" fill="#f2cf7e" stroke="#080b11" stroke-width="1.3" style="cursor:pointer;opacity:${dimmed ? '0.4' : '1'};"/>`,
    );

    const showLabel =
      series.length <= 12 || idx === 0 || idx === series.length - 1 || idx % Math.ceil(series.length / 8) === 0;
    if (showLabel) {
      barsSvg.push(
        `<text data-g1-idx="${idx}" data-g1-bucket="${escapeMetaHtml(pt.bucketKey)}" x="${cx.toFixed(1)}" y="${h - 8}" text-anchor="middle" fill="${isSel ? '#f2cf7e' : '#b8b2a6'}" font-size="9" font-weight="${isSel ? '800' : '500'}" font-family="JetBrains Mono,monospace" style="cursor:pointer;">${escapeMetaHtml(pt.label)}</text>`,
      );
    }
  });

  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;">
      ${gridLines}
      ${barsSvg.join('')}
      <polyline points="${linePts.join(' ')}" fill="none" stroke="#f2cf7e" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>
      ${dotsSvg.join('')}
    </svg>
  `;
}

/**
 * Graph 2 (Left): Sovereign 12-Domain Polar Accuracy & ELO Radar.
 * Clicking ANY spoke, vertex, or domain label toggles that exact domain filter!
 */
function buildPolarDomainRadarSvg(
  view: FilteredAnalyticsView,
  activeDomainId: DomainId | null,
): string {
  const cx = 155;
  const cy = 135;
  const maxR = 86;
  const rings = [0.33, 0.66, 1.0];

  const grid = rings
    .map((r) => {
      const pts: string[] = [];
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
        pts.push(`${(cx + Math.cos(a) * maxR * r).toFixed(1)},${(cy + Math.sin(a) * maxR * r).toFixed(1)}`);
      }
      return `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(216,175,87,0.2)" stroke-width="1"/>`;
    })
    .join('');

  const polyPts: string[] = [];
  const spokes: string[] = [];
  const vertices: string[] = [];
  const labels: string[] = [];

  const maxDomTotal = Math.max(1, ...view.byDomain.map((d) => d.right + d.wrong));
  const isWrongOnly = view.filter.outcome === 'WRONG';

  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const d = view.byDomain[i];
    const tot = d.right + d.wrong;
    let rFrac: number;
    if (isWrongOnly) {
      // In Wrong Only slice, show relative miss concentration per domain cleanly
      rFrac = tot > 0 ? Math.max(0.22, tot / maxDomTotal) : 0.1;
    } else if (tot > 0) {
      const accNorm = Math.max(0.18, d.right / tot);
      const eloNorm = Math.max(0.2, Math.min(1.0, (d.lastElo - 750) / 1350));
      rFrac = accNorm * 0.72 + eloNorm * 0.28;
    } else {
      rFrac = view.hasActiveDimensionFilter ? 0.12 : Math.max(0.18, Math.min(0.85, (d.lastElo - 750) / 1350));
    }

    const px = cx + cosA * maxR * rFrac;
    const py = cy + sinA * maxR * rFrac;
    polyPts.push(`${px.toFixed(1)},${py.toFixed(1)}`);

    const isAct = activeDomainId === i;
    const ox = cx + cosA * maxR;
    const oy = cy + sinA * maxR;

    spokes.push(`
      <g data-g2-dom="${i}" data-radar-spoke="${i}" role="button" tabindex="0" aria-label="Filter by ${escapeMetaHtml(SOVEREIGN_DOMAINS[i].name)}" style="cursor:pointer;">
        <line x1="${cx}" y1="${cy}" x2="${ox.toFixed(1)}" y2="${oy.toFixed(1)}" stroke="transparent" stroke-width="14"/>
        <line x1="${cx}" y1="${cy}" x2="${ox.toFixed(1)}" y2="${oy.toFixed(1)}" stroke="${isAct ? '#f2cf7e' : 'rgba(216,175,87,0.18)'}" stroke-width="${isAct ? '2.2' : '1'}"/>
      </g>
    `);

    vertices.push(`
      <g data-g2-dom="${i}" style="cursor:pointer;">
        <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="12" fill="transparent"/>
        <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${isAct ? '5.4' : tot > 0 ? '3.3' : '2.1'}" fill="${isAct ? '#f2cf7e' : isWrongOnly ? '#ff7c8c' : '#39d49a'}" stroke="#080b11" stroke-width="1.3"/>
      </g>
    `);

    const lx = cx + cosA * (maxR + 15);
    const ly = cy + sinA * (maxR + 14);
    const anchor = cosA < -0.25 ? 'end' : cosA > 0.25 ? 'start' : 'middle';
    labels.push(
      `<text data-g2-dom="${i}" x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${anchor}" fill="${isAct ? '#f2cf7e' : tot > 0 ? '#ebe5d8' : '#8f99ad'}" font-size="${isAct ? '9.6' : '8.8'}" font-weight="${isAct ? '800' : '600'}" style="cursor:pointer;">${escapeMetaHtml(SOVEREIGN_DOMAINS[i].shortName)}</text>`,
    );
  }

  const polyStroke = isWrongOnly ? '#e05263' : '#39d49a';
  const polyFill = isWrongOnly ? 'rgba(224,82,99,0.22)' : 'rgba(57,212,154,0.22)';

  return `
    <svg viewBox="0 0 310 270" style="width:100%;max-width:295px;height:auto;display:block;margin:0 auto;">
      ${grid}
      ${spokes.join('')}
      <polygon points="${polyPts.join(' ')}" fill="${polyFill}" stroke="${polyStroke}" stroke-width="2" pointer-events="none"/>
      ${vertices.join('')}
      ${labels.join('')}
    </svg>
  `;
}

/**
 * Graph 3: Filtered Global/Slice IRT ELO Trajectory Line Chart.
 */
function buildEloTrajectorySvg(eloPoints: readonly AnalyticsEloPoint[]): string {
  const w = 520;
  const h = 156;
  const padX = 42;
  const padY = 18;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  if (eloPoints.length === 0) {
    return `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;">
        <rect x="${padX}" y="${padY}" width="${plotW}" height="${plotH}" rx="8" fill="rgba(12,17,28,0.65)" stroke="rgba(86,212,245,0.2)" stroke-dasharray="4 4"/>
        <text x="${w / 2}" y="${h / 2 + 4}" text-anchor="middle" fill="#b8b2a6" font-size="11" font-family="Inter,sans-serif">
          No ELO trajectory points in this active slice
        </text>
      </svg>
    `;
  }

  const minElo = Math.min(1000, ...eloPoints.map((p) => p.elo)) - 40;
  const maxElo = Math.max(1500, ...eloPoints.map((p) => p.elo)) + 40;
  const span = Math.max(100, maxElo - minElo);

  const coords = eloPoints.map((pt, idx) => {
    const x =
      eloPoints.length === 1 ? w / 2 : padX + (idx / (eloPoints.length - 1)) * plotW;
    const y = padY + (1 - (pt.elo - minElo) / span) * plotH;
    return { x, y, elo: pt.elo, label: pt.label };
  });

  const poly = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const area = `${coords[0].x.toFixed(1)},${h - padY} ${poly} ${coords[coords.length - 1].x.toFixed(1)},${h - padY}`;

  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;">
      <line x1="${padX}" y1="${padY}" x2="${w - padX}" y2="${padY}" stroke="rgba(86,212,245,0.22)" stroke-dasharray="3 3"/>
      <text x="${padX - 6}" y="${padY + 4}" text-anchor="end" fill="#56d4f5" font-size="9.5" font-family="JetBrains Mono,monospace">${Math.round(maxElo)}</text>
      <line x1="${padX}" y1="${h - padY}" x2="${w - padX}" y2="${h - padY}" stroke="rgba(216,175,87,0.2)"/>
      <text x="${padX - 6}" y="${h - padY + 3}" text-anchor="end" fill="#a5afc2" font-size="9.5" font-family="JetBrains Mono,monospace">${Math.round(minElo)}</text>
      <polygon points="${area}" fill="rgba(86,212,245,0.14)"/>
      <polyline points="${poly}" fill="none" stroke="#56d4f5" stroke-width="2.3" stroke-linejoin="round"/>
      ${coords
        .map(
          (c, i) =>
            i === coords.length - 1 || coords.length <= 16
              ? `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${i === coords.length - 1 ? '4.5' : '3'}" fill="${i === coords.length - 1 ? '#f2cf7e' : '#56d4f5'}" stroke="#080b11" stroke-width="1.2"/>`
              : '',
        )
        .join('')}
    </svg>
  `;
}

/**
 * Graph 4 (Right): Clickable 5-Bucket Response-Time Stacked Right/Wrong Histogram.
 */
function buildSpeedHistogramSvg(
  view: FilteredAnalyticsView,
  activeSpeedBucket: AnalyticsSpeedBucketIndex | null,
): string {
  const w = 340;
  const h = 166;
  const padX = 18;
  const padT = 20;
  const padB = 30;
  const plotW = w - padX * 2;
  const plotH = h - padT - padB;

  const maxB = Math.max(1, ...view.speedBuckets.map((b) => b.right + b.wrong));
  const stepX = plotW / 5;
  const barW = 36;

  const cols = view.speedBuckets
    .map((b, idx) => {
      const cx = padX + stepX * (idx + 0.5);
      const rH = (b.right / maxB) * plotH;
      const wH = (b.wrong / maxB) * plotH;
      const rY = padT + plotH - rH;
      const wY = rY - wH;
      const tot = b.right + b.wrong;
      const isSel = activeSpeedBucket === idx;
      const dimmed = activeSpeedBucket !== null && !isSel;

      return `
        <g
          data-speed-bucket="${idx}"
          data-speed-right="${b.right}"
          data-speed-wrong="${b.wrong}"
          data-speed-total="${tot}"
          role="button"
          tabindex="0"
          aria-pressed="${isSel}"
          aria-label="Speed bucket ${escapeMetaHtml(SPEED_BUCKET_LABELS[idx])}: ${b.right} right, ${b.wrong} wrong"
          style="cursor:pointer;opacity:${dimmed ? '0.35' : '1'};"
        >
          <rect
            x="${(cx - stepX * 0.45).toFixed(1)}"
            y="${padT - 12}"
            width="${(stepX * 0.9).toFixed(1)}"
            height="${plotH + 34}"
            rx="6"
            fill="${isSel ? 'rgba(242,207,126,0.14)' : 'transparent'}"
          />
          ${rH > 0 ? `<rect x="${(cx - barW / 2).toFixed(1)}" y="${rY.toFixed(1)}" width="${barW}" height="${Math.max(2, rH).toFixed(1)}" fill="#39d49a" rx="3"/>` : ''}
          ${wH > 0 ? `<rect x="${(cx - barW / 2).toFixed(1)}" y="${wY.toFixed(1)}" width="${barW}" height="${Math.max(2, wH).toFixed(1)}" fill="#e05263" rx="3"/>` : ''}
          ${isSel ? `<line x1="${(cx - barW / 2).toFixed(1)}" y1="${padT + plotH + 2}" x2="${(cx + barW / 2).toFixed(1)}" y2="${padT + plotH + 2}" stroke="#f2cf7e" stroke-width="2.4"/>` : ''}
          <text x="${cx.toFixed(1)}" y="${Math.max(12, (tot > 0 ? wY : padT + plotH) - 5).toFixed(1)}" text-anchor="middle" fill="${isSel ? '#f2cf7e' : '#f6f2e9'}" font-size="9.5" font-weight="700" font-family="JetBrains Mono,monospace">${tot}</text>
          <text x="${cx.toFixed(1)}" y="${h - 9}" text-anchor="middle" fill="${isSel ? '#f2cf7e' : '#c8c2b6'}" font-size="9.5" font-weight="${isSel ? '800' : '500'}" font-family="JetBrains Mono,monospace">${escapeMetaHtml(SPEED_BUCKET_LABELS[idx])}</text>
        </g>
      `;
    })
    .join('');

  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;">
      <line x1="${padX}" y1="${padT + plotH}" x2="${w - padX}" y2="${padT + plotH}" stroke="rgba(216,175,87,0.28)"/>
      ${cols}
    </svg>
  `;
}

export class CareerAnalyticsDashboardView {
  private readonly deps: CareerAnalyticsDashboardDependencies;
  private modalBackdrop: HTMLElement | null = null;
  private mountedContainer: HTMLElement | null = null;
  private detachEscape: (() => void) | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private callbacks: CareerAnalyticsOpenOptions = {};

  private filter: AnalyticsFilterState = createDefaultAnalyticsFilter('ALL_TIME');

  constructor(deps: CareerAnalyticsDashboardDependencies) {
    this.deps = deps;
    ensureMetaStylesInjected();
  }

  public isOpen(): boolean {
    return this.modalBackdrop !== null || this.mountedContainer !== null;
  }

  public getFilterState(): AnalyticsFilterState {
    return { ...this.filter };
  }

  public setFilter(partial: Partial<AnalyticsFilterState>): void {
    const nextDomain =
      partial.domainId !== undefined ? clampDomainOrNull(partial.domainId) : this.filter.domainId;
    const domainChanged = nextDomain !== this.filter.domainId;
    const nextRange = partial.range ?? this.filter.range;
    const rangeChanged = nextRange !== this.filter.range;

    this.filter = {
      range: nextRange,
      domainId: nextDomain,
      subcatLabel:
        nextDomain === null
          ? null
          : partial.subcatLabel !== undefined
            ? partial.subcatLabel
            : domainChanged
              ? null
              : this.filter.subcatLabel,
      archetype: partial.archetype !== undefined ? partial.archetype : this.filter.archetype,
      questionFormat:
        partial.questionFormat !== undefined
          ? partial.questionFormat
          : this.filter.questionFormat ?? null,
      peelTier: partial.peelTier !== undefined ? partial.peelTier : this.filter.peelTier,
      outcome: partial.outcome ?? this.filter.outcome,
      speedBucket: partial.speedBucket !== undefined ? partial.speedBucket : this.filter.speedBucket,
      bucketKey:
        partial.bucketKey !== undefined
          ? partial.bucketKey
          : rangeChanged
            ? null
            : this.filter.bucketKey,
    };
    if (this.isOpen()) {
      this.rerender();
    }
  }

  public resetFilters(): void {
    this.filter = createDefaultAnalyticsFilter(this.filter.range);
    if (this.isOpen()) {
      this.rerender();
    }
  }

  private applyInitialOptions(options: CareerAnalyticsOpenOptions): void {
    const domainId = clampDomainOrNull(options.initialDomainId);
    this.filter = {
      range: options.initialRange ?? 'ALL_TIME',
      domainId,
      subcatLabel: domainId !== null ? options.initialSubcatLabel?.trim() || null : null,
      archetype: options.initialArchetype ?? null,
      questionFormat: options.initialQuestionFormat ?? null,
      peelTier: options.initialPeelTier ?? null,
      outcome: options.initialOutcome ?? 'ALL',
      speedBucket: options.initialSpeedBucket ?? null,
      bucketKey: null,
    };
  }

  public open(options: CareerAnalyticsOpenOptions = {}): void {
    this.close();
    this.callbacks = options;
    this.applyInitialOptions(options);
    this.deps.store.syncAndBackfillFromProfile(this.deps.passport);

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-meta-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Career Stats — Strengths, Weak Spots & Domain Radar');
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) {
        this.handleClose();
      }
    });

    document.body.appendChild(backdrop);
    this.modalBackdrop = backdrop;
    this.detachEscape = attachMetaEscapeHandler(() => this.handleBackOrClose());
    this.unsubscribeStore = this.deps.store.subscribe(() => {
      if (this.isOpen()) this.rerender();
    });

    this.renderInto(backdrop, true);
  }

  public mount(container: HTMLElement, options: CareerAnalyticsOpenOptions = {}): void {
    this.unmount();
    this.callbacks = options;
    this.applyInitialOptions(options);
    this.deps.store.syncAndBackfillFromProfile(this.deps.passport);
    this.mountedContainer = container;
    this.unsubscribeStore = this.deps.store.subscribe(() => {
      if (this.isOpen()) this.rerender();
    });
    this.renderInto(container, false);
  }

  public unmount(): void {
    if (this.detachEscape) {
      this.detachEscape();
      this.detachEscape = null;
    }
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    if (this.mountedContainer) {
      this.mountedContainer.innerHTML = '';
      this.mountedContainer = null;
    }
  }

  public close(): void {
    this.unmount();
    if (this.modalBackdrop) {
      this.modalBackdrop.remove();
      this.modalBackdrop = null;
    }
  }

  private handleBackOrClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    if (this.callbacks.canGoBack && this.callbacks.onBack) {
      this.callbacks.onBack();
      return;
    }
    this.handleClose();
  }

  private handleClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    const onClose = this.callbacks.onClose;
    this.close();
    onClose?.();
  }

  private rerender(): void {
    const prevScroll =
      (this.modalBackdrop ?? this.mountedContainer)?.querySelector<HTMLElement>('.ws-meta-body-scroll')
        ?.scrollTop ?? 0;

    if (this.modalBackdrop) {
      this.renderInto(this.modalBackdrop, true);
    } else if (this.mountedContainer) {
      this.renderInto(this.mountedContainer, false);
    }

    const bodyEl = (this.modalBackdrop ?? this.mountedContainer)?.querySelector<HTMLElement>(
      '.ws-meta-body-scroll',
    );
    if (bodyEl && prevScroll > 0) {
      bodyEl.scrollTop = prevScroll;
    }
  }

  private computeMissedCardsBadgeCount(view: FilteredAnalyticsView): number {
    let srsDomainCount = 0;
    if (this.deps.srsEngine) {
      this.deps.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks);
      const cards = this.deps.srsEngine.getAllCards();
      srsDomainCount =
        this.filter.domainId !== null
          ? cards.filter((c) => c.domainId === this.filter.domainId).length
          : cards.length;
    }
    const sliceMissed = view.kpis.totalWrong;
    return srsDomainCount > 0 ? srsDomainCount : sliceMissed;
  }

  private renderActiveFilterBar(view: FilteredAnalyticsView): string {
    const chips: Array<{ key: string; label: string }> = [];
    if (this.filter.domainId !== null) {
      chips.push({ key: 'domain', label: getSovereignDomainMeta(this.filter.domainId).name });
    }
    if (this.filter.subcatLabel) {
      chips.push({ key: 'subcat', label: this.filter.subcatLabel });
    }
    if (this.filter.outcome !== 'ALL') {
      chips.push({ key: 'outcome', label: OUTCOME_LABELS[this.filter.outcome] });
    }
    if (this.filter.archetype) {
      chips.push({ key: 'archetype', label: ARCHETYPE_SHORT_LABELS[this.filter.archetype] });
    }
    if (this.filter.questionFormat) {
      chips.push({ key: 'format', label: FORMAT_MASTERY_LABELS[this.filter.questionFormat] });
    }
    if (this.filter.peelTier !== null) {
      chips.push({
        key: 'peel',
        label: PEEL_TIER_LABELS[String(this.filter.peelTier) as '1' | '2' | '3'],
      });
    }
    if (this.filter.speedBucket !== null) {
      chips.push({ key: 'speed', label: `Speed ${SPEED_BUCKET_LABELS[this.filter.speedBucket]}` });
    }
    if (this.filter.bucketKey !== null) {
      const matchedBar = view.barSeries.find((b) => b.bucketKey === this.filter.bucketKey);
      chips.push({
        key: 'bucket',
        label: matchedBar
          ? `${this.filter.range === 'LAST_25' ? matchedBar.label : matchedBar.bucketKey}`
          : this.filter.bucketKey,
      });
    }

    const missedCount = this.computeMissedCardsBadgeCount(view);
    const activeDomMeta =
      this.filter.domainId !== null ? getSovereignDomainMeta(this.filter.domainId) : null;
    const practiceTitle = activeDomMeta
      ? `Practice ${activeDomMeta.shortName} Slice`
      : 'Practice This Slice';

    return `
      <div
        id="ws-stats-filter-bar"
        class="ws-stats-filter-bar ${view.hasActiveDimensionFilter ? 'is-filtered' : ''}"
        data-active-filter-count="${view.activeFilterCount}"
        data-active-domain="${this.filter.domainId ?? ''}"
      >
        <div class="ws-stats-filter-chips-row">
          ${
            chips.length > 0
              ? `
                <span class="ws-stats-slice-summary">
                  ✦ Slice: <strong>${view.kpis.totalAnswered}</strong> of ${view.rangeTotalCount} Q
                </span>
                ${chips
                  .map(
                    (ch) => `
                      <button
                        type="button"
                        class="ws-stats-filter-chip"
                        data-remove-filter="${ch.key}"
                        aria-label="Remove ${escapeMetaHtml(ch.label)} filter"
                      >
                        <span>${escapeMetaHtml(ch.label)}</span>
                        <span aria-hidden="true" style="color:var(--ivory-primary);font-weight:800;">✕</span>
                      </button>
                    `,
                  )
                  .join('')}
                <button
                  type="button"
                  class="ws-stats-reset-btn"
                  id="ws-stats-reset-filters"
                  data-reset-filters="true"
                >
                  ↺ Reset All
                </button>
              `
              : `
                <span class="ws-stats-slice-summary">
                  Showing all <strong>${view.kpis.totalAnswered}</strong> questions · Tap any domain, spoke, pill, or bar to cross-filter
                </span>
              `
          }
        </div>

        <div class="ws-stats-linked-actions">
          <button
            type="button"
            class="ws-meta-btn-gold ws-stats-action-cta"
            id="ws-stats-practice-slice"
            aria-label="${escapeMetaHtml(practiceTitle)}"
          >
            ▸ Practice This Slice
          </button>
          <button
            type="button"
            class="ws-meta-btn ws-stats-action-btn"
            id="ws-stats-open-srs"
            style="color:#8ee5ff;"
          >
            ✦ Review Missed Cards (${missedCount})
          </button>
          <button
            type="button"
            class="ws-meta-btn ws-stats-action-btn"
            id="ws-stats-open-honours"
            style="color:var(--gold-bright);"
          >
            ◆ Related Trophies
          </button>
        </div>
      </div>
    `;
  }

  private renderSubcategoryBreakdown(view: FilteredAnalyticsView): string {
    if (this.filter.domainId === null) return '';
    const domMeta = getSovereignDomainMeta(this.filter.domainId);

    return `
      <div id="ws-stats-subcat-panel" class="ws-stats-subcat-panel" data-subcat-domain="${this.filter.domainId}">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
          <span class="ws-meta-section-title" style="color:${domMeta.accentHex};">
            ◆ Subcategory Breakdown · ${escapeMetaHtml(domMeta.name)}
          </span>
          ${
            this.filter.subcatLabel
              ? `<button type="button" class="ws-meta-inline-link" data-remove-filter="subcat" style="min-height:44px;padding:0 6px;">✕ Clear Subcategory</button>`
              : `<span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">Tap a topic to drill deeper</span>`
          }
        </div>
        ${
          view.subcategories.length > 0
            ? `<div style="display:flex;flex-direction:column;">
                ${view.subcategories
                  .map((row) => {
                    const isSel =
                      this.filter.subcatLabel !== null &&
                      this.filter.subcatLabel.toLowerCase() === row.subcatLabel.toLowerCase();
                    const dimmed = this.filter.subcatLabel !== null && !isSel;
                    return `
                      <button
                        type="button"
                        data-subcat-filter="${escapeMetaHtml(row.subcatLabel)}"
                        data-subcat-right="${row.right}"
                        data-subcat-wrong="${row.wrong}"
                        aria-pressed="${isSel}"
                        class="ws-meta-row is-interactive ws-stats-row-btn ${isSel ? 'is-focused' : ''} ${dimmed ? 'is-dimmed' : ''}"
                      >
                        <span style="min-width:0;flex:0 1 138px;font-size:12px;font-weight:600;color:var(--ivory-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                          ${escapeMetaHtml(sanitizeMetaCopy(row.subcatLabel))}
                        </span>
                        <div style="flex:1 1 60px;min-width:36px;height:5px;border-radius:999px;background:rgba(224,82,99,0.38);overflow:hidden;">
                          <div style="width:${row.accuracyPct}%;height:100%;background:#39d49a;"></div>
                        </div>
                        <span style="font-family:var(--font-mono);font-size:11px;color:#c8c2b6;white-space:nowrap;flex-shrink:0;">
                          <strong style="color:#67ebb8;">${row.right}R</strong>·<strong style="color:#ff8a98;">${row.wrong}W</strong>
                          <span style="color:#a5afc2;">(${row.accuracyPct}%)</span>
                        </span>
                      </button>
                    `;
                  })
                  .join('')}
              </div>`
            : `<div style="padding:10px 0;font-size:12px;color:#a5afc2;">No questions recorded in ${escapeMetaHtml(domMeta.name)} for this filter slice yet.</div>`
        }
      </div>
    `;
  }

  private renderInto(host: HTMLElement, isModal: boolean): void {
    const snap = this.deps.store.getSnapshot();
    const view = computeFilteredAnalyticsView(snap, this.filter);
    const challengerName = this.deps.passport.getChallengerName();
    const { kpis } = view;

    const activeBarTooltip =
      (this.filter.bucketKey !== null
        ? view.barSeries.find((b) => b.bucketKey === this.filter.bucketKey)
        : null) ??
      view.barSeries[view.barSeries.length - 1] ??
      null;

    const vaultJumperHtml = renderVaultJumperHtml('ANALYTICS', {
      isModal,
      closeBtnId: 'ws-stats-close',
      canNavigate: Boolean(this.callbacks.onNavigateSection),
    });

    const recentLedger: QuestionAnalyticsEvent[] = view.ledgerEvents.slice(0, 50);
    const ddWinPctStr = kpis.doubleDownWinPct !== null ? `${kpis.doubleDownWinPct}%` : '—';
    const hasDomFilter = this.filter.domainId !== null;
    const hasArchFilter = this.filter.archetype !== null;
    const hasFormatFilter = Boolean(this.filter.questionFormat);
    const hasPeelFilter = this.filter.peelTier !== null;

    const sliceSubtitle = buildFilterContextLabel(this.filter);
    const hostProfile = buildPlayerStatProfileForHost(snap);
    const strengthWeakHtml =
      hostProfile.strongestDomainId !== null || hostProfile.weakestDomainId !== null
        ? `<div id="ws-stats-strength-weak-strip" class="ws-meta-hscroll" style="padding:2px 0 4px;" aria-label="Strengths and Weak Spots">
            ${
              hostProfile.strongestDomainId !== null && hostProfile.strongestDomainName
                ? `<button type="button" class="ws-meta-chip" data-quick-dom="${hostProfile.strongestDomainId}" style="color:#67ebb8;">
                    ✦ Strongest: ${escapeMetaHtml(hostProfile.strongestDomainName)} (${hostProfile.strongestAccuracyPct}%)
                  </button>`
                : ''
            }
            ${
              hostProfile.weakestDomainId !== null && hostProfile.weakestDomainName
                ? `<button type="button" class="ws-meta-chip" data-quick-dom="${hostProfile.weakestDomainId}" style="color:#ff9aa6;">
                    ◆ Weak Spot: ${escapeMetaHtml(hostProfile.weakestDomainName)} (${hostProfile.weakestAccuracyPct}%)
                  </button>`
                : ''
            }
          </div>`
        : '';

    host.innerHTML = `
      <div class="ws-meta-shell" data-stats-filtered="${view.hasActiveDimensionFilter ? 'true' : 'false'}">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-stats-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">CAREER STATS</h2>
              <div class="ws-meta-eyebrow">${escapeMetaHtml(challengerName)} · ${escapeMetaHtml(sliceSubtitle ?? 'Strengths, Weak Spots & Domain Radar')}</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${vaultJumperHtml}
          </div>
        </div>

        <!-- Single-Row Borderless Underline Time-Range Tabs -->
        <div class="ws-meta-underline-tabs" role="tablist" aria-label="Analytics Time Range">
          ${(
            [
              ['LAST_25', 'Last 25 Q'],
              ['DAYS_7', '7 Days'],
              ['DAYS_30', '30 Days'],
              ['ALL_TIME', 'All Time'],
            ] as const
          )
            .map(
              ([id, lbl]) => `
                <button type="button" role="tab" aria-selected="${this.filter.range === id}" class="ws-meta-underline-tab ${this.filter.range === id ? 'is-active' : ''}" data-range-tab="${id}">
                  ${lbl}
                </button>
              `,
            )
            .join('')}
        </div>

        <div class="ws-meta-body-scroll">
          <!-- Clickable Outcome KPI Filter Pills -->
          <div class="ws-meta-hscroll ws-stats-outcome-strip" role="group" aria-label="Filter by Outcome">
            ${(
              [
                ['ALL', `All (${view.outcomeCounts.all})`],
                ['RIGHT', `Right Only (${view.outcomeCounts.right})`],
                ['WRONG', `Wrong Only (${view.outcomeCounts.wrong})`],
                ['DOUBLE_DOWN', `2x Double Down (${view.outcomeCounts.doubleDown})`],
              ] as const
            )
              .map(([oid, lbl]) => {
                const isAct = this.filter.outcome === oid;
                return `
                  <button
                    type="button"
                    class="ws-meta-chip ws-stats-outcome-pill ${isAct ? 'is-active' : ''}"
                    data-outcome-filter="${oid}"
                    aria-pressed="${isAct}"
                  >
                    ${lbl}
                  </button>
                `;
              })
              .join('')}
          </div>

          <!-- Frameless Hairline KPI Strip (100% Live Recomputed from Filtered Slice!) -->
          <div class="ws-meta-kpi-strip" id="ws-stats-kpi-strip" data-kpi-total="${kpis.totalAnswered}" data-kpi-right="${kpis.totalRight}" data-kpi-wrong="${kpis.totalWrong}">
            <div class="ws-meta-kpi-cell" data-stats-kpi="rw">
              <span class="ws-meta-kpi-lbl">Right / Wrong</span>
              <span class="ws-meta-kpi-val">
                <span data-stats-right="${kpis.totalRight}" style="color:#67ebb8;">${kpis.totalRight}R</span>
                <span style="color:#a5afc2;font-weight:500;">·</span>
                <span data-stats-wrong="${kpis.totalWrong}" style="color:#ff8a98;">${kpis.totalWrong}W</span>
              </span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="accuracy">
              <span class="ws-meta-kpi-lbl">Accuracy</span>
              <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${kpis.accuracyPct !== null ? `${kpis.accuracyPct.toFixed(1)}%` : '—'}</span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="streak">
              <span class="ws-meta-kpi-lbl">Streak</span>
              <span class="ws-meta-kpi-val">${kpis.currentStreak} <span style="font-size:11.5px;color:var(--gold-bright);">/ ${kpis.bestStreak} BEST</span></span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="elo">
              <span class="ws-meta-kpi-lbl">${this.filter.domainId !== null ? 'Slice ELO' : 'Global ELO'}</span>
              <span class="ws-meta-kpi-val" style="color:var(--cyan-clue);">${kpis.eloLatest} <span style="font-size:11px;color:#a5afc2;">(${kpis.eloPeak})</span></span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="speed">
              <span class="ws-meta-kpi-lbl">Speed · 2x Win</span>
              <span class="ws-meta-kpi-val" style="font-size:14.5px;">${kpis.totalAnswered > 0 ? `${(kpis.avgResponseMs / 1000).toFixed(1)}s` : '—'} · <span style="color:var(--gold-bright);">${ddWinPctStr}</span></span>
            </div>
          </div>

          <!-- Active Drill-Down Breadcrumb & 3 Linked Action Buttons -->
          ${this.renderActiveFilterBar(view)}

          <!-- Graph 1: Historical Right vs. Wrong Stacked Bars & Rolling Accuracy % -->
          <div class="ws-meta-section" id="ws-stats-section-1">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">1. Right vs. Wrong &amp; Rolling Accuracy</h3>
              <span style="font-family:var(--font-mono);font-size:10.5px;color:#c8c2b6;">
                <span style="color:#67ebb8;">■ Right</span> · <span style="color:#ff8a98;">■ Wrong</span> · <span style="color:var(--gold-bright);">— Accuracy %</span>
              </span>
            </div>

            ${buildRightWrongTrendSvg(view.barSeries, this.filter.bucketKey)}

            ${
              activeBarTooltip
                ? `<div class="ws-meta-note" style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--ivory-primary);">
                    <span>[${escapeMetaHtml(activeBarTooltip.label)}] ${escapeMetaHtml(activeBarTooltip.sublabel)}</span>
                    <span style="color:var(--gold-bright);font-weight:700;">Rolling ${activeBarTooltip.rollingAccPct}%${this.filter.bucketKey ? ' · Filtered (tap bar to clear)' : ' · Tap any bar to filter'}</span>
                  </div>`
                : ''
            }
          </div>

          <!-- Graph 2: 12-Domain Mastery Breakdown, Polar Radar & Subcategory Drill-Down -->
          <div class="ws-meta-section" id="ws-stats-section-2">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">2. 12-Domain Mastery &amp; Polar Radar</h3>
              <span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">
                ${hasDomFilter ? 'Tap active domain again to show all 12' : 'Tap any spoke or domain row to drill down'}
              </span>
            </div>
            ${strengthWeakHtml}

            <div class="ws-meta-two-col" style="align-items:center;">
              <div>
                ${buildPolarDomainRadarSvg(view, this.filter.domainId)}
              </div>
              <div style="display:flex;flex-direction:column;">
                ${SOVEREIGN_DOMAINS.map((dom, idx) => {
                  const dc = view.byDomain[idx];
                  const tot = dc.right + dc.wrong;
                  const rPct = tot > 0 ? (dc.right / tot) * 100 : 0;
                  const isAct = idx === this.filter.domainId;
                  const isDim = hasDomFilter && !isAct;
                  return `
                    <button
                      type="button"
                      data-g2-dom="${idx}"
                      data-g2-right="${dc.right}"
                      data-g2-wrong="${dc.wrong}"
                      aria-pressed="${isAct}"
                      class="ws-meta-row is-interactive ws-stats-row-btn ${isAct ? 'is-focused' : ''} ${isDim ? 'is-dimmed' : ''}"
                    >
                      <span style="display:inline-flex;align-items:center;gap:7px;min-width:0;flex:0 1 104px;">
                        <img src="./${escapeMetaHtml(dom.medallionUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;flex-shrink:0;"/>
                        <span style="font-size:12px;font-weight:${isAct ? '700' : '600'};color:${isAct ? 'var(--gold-bright)' : 'var(--ivory-primary)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeMetaHtml(dom.shortName)}</span>
                      </span>
                      <div style="flex:1 1 44px;min-width:28px;height:5px;border-radius:999px;background:${tot > 0 ? 'rgba(224,82,99,0.42)' : 'rgba(255,255,255,0.08)'};overflow:hidden;">
                        <div style="width:${rPct.toFixed(1)}%;height:100%;background:#39d49a;"></div>
                      </div>
                      <span style="font-family:var(--font-mono);font-size:10.5px;color:#c8c2b6;white-space:nowrap;flex-shrink:0;">
                        <strong style="color:#67ebb8;">${dc.right}R</strong>·<strong style="color:#ff8a98;">${dc.wrong}W</strong> <span style="color:#a5afc2;">(${pctStr(dc.right, dc.wrong)})</span> · <strong style="color:${dom.accentHex};">${dc.lastElo}</strong>
                      </span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            ${this.renderSubcategoryBreakdown(view)}
          </div>

          <!-- Graph 3: Filtered Rating Trajectory & Double-Down Record -->
          <div class="ws-meta-section" id="ws-stats-section-3">
            <h3 class="ws-meta-section-title">3. Skill Rating &amp; Double-Down Record${this.filter.domainId !== null ? ` · ${escapeMetaHtml(getSovereignDomainMeta(this.filter.domainId).shortName)}` : ''}</h3>
            <div class="ws-meta-two-col" style="align-items:center;">
              <div>
                ${buildEloTrajectorySvg(view.eloSeries)}
              </div>
              <div style="display:flex;flex-direction:column;">
                <div class="ws-meta-row" style="font-family:var(--font-mono);font-size:11.5px;">
                  <span style="color:#c8c2b6;">Standard Lock Record</span>
                  <span><strong style="color:#67ebb8;">${kpis.safeLockWins}W</strong> – <strong style="color:#ff8a98;">${kpis.safeLockMisses}L</strong> <span style="color:#a5afc2;">(${pctStr(kpis.safeLockWins, kpis.safeLockMisses)})</span></span>
                </div>
                <button
                  type="button"
                  class="ws-meta-row is-interactive ws-stats-row-btn ${this.filter.outcome === 'DOUBLE_DOWN' ? 'is-focused' : ''}"
                  data-outcome-filter="DOUBLE_DOWN"
                  style="font-family:var(--font-mono);font-size:11.5px;"
                >
                  <span style="color:#c8c2b6;">2x Double-Down Wins</span>
                  <span style="color:var(--gold-bright);font-weight:700;">${kpis.doubleDownWins}W – ${kpis.doubleDownMisses}L (${ddWinPctStr})</span>
                </button>
                <div class="ws-meta-row" style="font-family:var(--font-mono);font-size:11.5px;border-bottom:none;">
                  <span style="color:#c8c2b6;">Backfires / Max Streak</span>
                  <span><strong style="color:#ff8a98;">${kpis.backfires}</strong> · Peak <strong style="color:var(--gold-bright);">${kpis.bestConsecutiveMax6xWins}×</strong></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Graph 4: Format Mastery Strip + Mode Matrix & Speed Histogram -->
          <div class="ws-meta-section" id="ws-stats-section-4">
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
              <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
                <h3 class="ws-meta-section-title">Format Mastery Strip (7 Game-Show Formats)</h3>
                <span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">
                  ${hasFormatFilter ? 'Tap active format to clear' : 'Tap any format to cross-filter'}
                </span>
              </div>
              <div id="ws-stats-format-strip" class="ws-meta-hscroll" role="group" aria-label="Filter by Question Format">
                ${ALL_V4_QUESTION_FORMATS.map((fmt) => {
                  const fc = view.byFormat[fmt];
                  const isAct = this.filter.questionFormat === fmt;
                  const isDim = hasFormatFilter && !isAct;
                  const pct = pctStr(fc.right, fc.wrong);
                  return `
                    <button
                      type="button"
                      class="ws-meta-chip ${isAct ? 'is-active' : ''}"
                      data-format-filter="${fmt}"
                      data-format-right="${fc.right}"
                      data-format-wrong="${fc.wrong}"
                      aria-pressed="${isAct}"
                      style="${isDim ? 'opacity:0.45;' : ''}display:inline-flex;align-items:center;gap:6px;"
                    >
                      <span>${escapeMetaHtml(FORMAT_MASTERY_LABELS[fmt])}</span>
                      <span style="font-family:var(--font-mono);font-size:10.5px;color:${isAct ? 'var(--gold-bright)' : '#c8c2b6'};">
                        ${fc.right}R·${fc.wrong}W${pct !== '—' ? ` (${pct})` : ''}
                      </span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="ws-meta-two-col">
              <div style="display:flex;flex-direction:column;gap:8px;">
                <h3 class="ws-meta-section-title">4A. Mode &amp; Lifeline Matrix</h3>
                <div>
                  ${ALL_ANALYTICS_ARCHETYPES.map((arch) => {
                    const c = view.byArchetype[arch];
                    const isAct = this.filter.archetype === arch;
                    const isDim = hasArchFilter && !isAct;
                    return `
                      <button
                        type="button"
                        data-arch-filter="${arch}"
                        data-arch-right="${c.right}"
                        data-arch-wrong="${c.wrong}"
                        aria-pressed="${isAct}"
                        class="ws-meta-row is-interactive ws-stats-row-btn ${isAct ? 'is-focused' : ''} ${isDim ? 'is-dimmed' : ''}"
                        style="font-family:var(--font-mono);font-size:11px;"
                      >
                        <span style="color:${isAct ? 'var(--gold-bright)' : 'var(--ivory-primary)'};font-weight:${isAct ? '700' : '500'};">${escapeMetaHtml(ARCHETYPE_SHORT_LABELS[arch])}</span>
                        <span><strong style="color:#67ebb8;">${c.right}R</strong> · <strong style="color:#ff8a98;">${c.wrong}W</strong> <span style="color:#a5afc2;">(${pctStr(c.right, c.wrong)})</span></span>
                      </button>
                    `;
                  }).join('')}
                </div>
                <div class="ws-stats-peel-grid" role="group" aria-label="Filter by Hint Tier">
                  ${(
                    [
                      [1, '1', PEEL_TIER_LABELS['1']],
                      [2, '2', PEEL_TIER_LABELS['2']],
                      [3, '3', PEEL_TIER_LABELS['3']],
                    ] as const
                  )
                    .map(([tierNum, tk, lbl]) => {
                      const tc = view.byPeelTier[tk];
                      const isAct = this.filter.peelTier === tierNum;
                      const isDim = hasPeelFilter && !isAct;
                      return `
                        <button
                          type="button"
                          class="ws-stats-peel-btn ${isAct ? 'is-active' : ''} ${isDim ? 'is-dimmed' : ''}"
                          data-peel-filter="${tierNum}"
                          data-peel-right="${tc.right}"
                          data-peel-wrong="${tc.wrong}"
                          aria-pressed="${isAct}"
                        >
                          <span class="ws-meta-kpi-lbl" style="color:${isAct ? 'var(--gold-bright)' : '#e6d095'};">${lbl}</span>
                          <span class="ws-meta-kpi-val" style="font-size:13px;">
                            <span style="color:#67ebb8;">${tc.right}R</span> / <span style="color:#ff8a98;">${tc.wrong}W</span>
                          </span>
                        </button>
                      `;
                    })
                    .join('')}
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:6px;">
                  <h3 class="ws-meta-section-title">4B. Response-Time Histogram</h3>
                  <span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">
                    ${this.filter.speedBucket !== null ? 'Tap active bar to clear' : 'Tap any bar to filter'}
                  </span>
                </div>
                ${buildSpeedHistogramSvg(view, this.filter.speedBucket)}
              </div>
            </div>
          </div>

          <!-- 5. Chronological Question Ledger Tape (Strictly Filtered!) -->
          <div class="ws-meta-section" id="ws-stats-section-5" style="border-bottom:none;">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">
                5. Question Ledger Tape (${recentLedger.length}${view.filteredEvents.length > recentLedger.length ? ` of ${view.filteredEvents.length}` : ''})
              </h3>
              ${
                view.hasActiveDimensionFilter
                  ? `<span style="font-family:var(--font-mono);font-size:10.5px;color:var(--gold-bright);">Filtered Slice Only</span>`
                  : ''
              }
            </div>
            ${
              recentLedger.length > 0
                ? `<div id="ws-stats-ledger" style="display:flex;flex-direction:column;max-height:280px;overflow-y:auto;">
                    ${recentLedger
                      .map((ev) => {
                        const dom = getSovereignDomainMeta(ev.domainId);
                        const mult =
                          ev.peelTier === 1 ? 3.0 : ev.peelTier === 2 ? 2.0 : 1.0;
                        const dd = isDoubleDownEvent(ev);
                        const effMult = (mult * (dd ? 2 : 1)).toFixed(1);
                        const speedIdx = ev.speedBucketIdx ?? computeSpeedBucketIdx(ev.responseTimeMs);
                        const fmtKey = inferQuestionFormatFromEvent(ev);
                        const modeOrFmtLabel = ev.questionFormat
                          ? FORMAT_MASTERY_LABELS[fmtKey]
                          : ARCHETYPE_SHORT_LABELS[ev.archetype];
                        const cleanPrompt = ev.promptSnippet ? sanitizeMetaCopy(ev.promptSnippet) : '';
                        const cleanSubcat = ev.subcatLabel ? sanitizeMetaCopy(ev.subcatLabel) : '';
                        return `
                          <div
                            class="ws-meta-row"
                            data-ledger-domain="${ev.domainId}"
                            data-ledger-correct="${ev.correct ? 'true' : 'false'}"
                            data-ledger-arch="${ev.archetype}"
                            data-ledger-format="${fmtKey}"
                            data-ledger-peel="${ev.peelTier}"
                            data-ledger-speed="${speedIdx}"
                            data-ledger-date="${escapeMetaHtml(ev.dateKey)}"
                            style="flex-direction:column;align-items:stretch;gap:4px;padding:9px 4px 9px 10px;font-family:var(--font-mono);font-size:11px;box-shadow:inset 2px 0 0 ${ev.correct ? 'var(--emerald-win)' : 'var(--crimson-alert)'};"
                          >
                            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;">
                              <span style="display:inline-flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap;">
                                <span style="font-weight:800;color:${ev.correct ? '#67ebb8' : '#ff8a98'};">
                                  ${ev.correct ? '✓' : ev.backfired ? '✕!' : '✕'}
                                </span>
                                <img src="./${escapeMetaHtml(dom.medallionUrl)}" alt="" style="width:16px;height:16px;object-fit:contain;flex-shrink:0;"/>
                                <span style="color:var(--ivory-primary);font-weight:600;">${escapeMetaHtml(dom.shortName)}</span>
                                ${cleanSubcat ? `<span style="color:${dom.accentHex};">· ${escapeMetaHtml(cleanSubcat)}</span>` : ''}
                                <span style="color:#a5afc2;">· ${escapeMetaHtml(modeOrFmtLabel)} · ${PEEL_TIER_SHORT_TAGS[ev.peelTier]}${dd ? ' · 2x' : ''}</span>
                              </span>
                              <span style="color:#c8c2b6;white-space:nowrap;">
                                ${(ev.responseTimeMs / 1000).toFixed(1)}s · ${effMult}x · <strong style="color:${ev.correct ? 'var(--gold-bright)' : '#a5afc2'};">+${ev.pointsDelta.toLocaleString('en-US')} PTS</strong>
                              </span>
                            </div>
                            ${
                              cleanPrompt
                                ? `<div style="font-family:var(--font-sans);font-size:11.5px;color:#c8c2b6;line-height:1.35;white-space:normal;">
                                    ${escapeMetaHtml(cleanPrompt)}${ev.answerLabel ? ` — <strong style="color:var(--ivory-primary);">${escapeMetaHtml(sanitizeMetaCopy(ev.answerLabel))}</strong>` : ''}
                                  </div>`
                                : ''
                            }
                          </div>
                        `;
                      })
                      .join('')}
                  </div>`
                : `<div id="ws-stats-ledger-empty" style="padding:18px 0;text-align:center;font-size:12.5px;color:#c8c2b6;display:flex;flex-direction:column;align-items:center;gap:10px;">
                    <span>${view.hasActiveDimensionFilter ? 'No recorded questions match every active filter in this slice.' : 'No individual question events logged in this browser session yet.'}</span>
                    ${view.hasActiveDimensionFilter ? `<button type="button" class="ws-stats-reset-btn" data-reset-filters="true">↺ Reset All Filters</button>` : ''}
                  </div>`
            }
          </div>
        </div>
      </div>
    `;

    this.bindEvents(host);
  }

  private bindEvents(host: HTMLElement): void {
    host.querySelector('#ws-stats-back')?.addEventListener('click', () => this.handleBackOrClose());

    bindVaultJumperEvents(host, {
      closeBtnId: 'ws-stats-close',
      onNavigate: (target) => this.callbacks.onNavigateSection?.(target),
      onClose: () => this.handleClose(),
      onTapFeedback: () => {
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
      },
    });

    // Time range tabs (preserves domain/outcome/morph/speed filters; clears range-scoped bucketKey)
    host.querySelectorAll<HTMLButtonElement>('[data-range-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.rangeTab as AnalyticsTimeRange | undefined;
        if (!next || next === this.filter.range) return;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.setFilter({ range: next, bucketKey: null });
      });
    });

    // Outcome filter pills (All / Right Only / Wrong Only / 2x Double Down)
    host.querySelectorAll<HTMLElement>('[data-outcome-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.outcomeFilter as AnalyticsOutcomeFilter | undefined;
        if (!next) return;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        const resolved: AnalyticsOutcomeFilter =
          next !== 'ALL' && this.filter.outcome === next ? 'ALL' : next;
        this.setFilter({ outcome: resolved });
      });
    });

    // Removable active filter chips
    host.querySelectorAll<HTMLButtonElement>('[data-remove-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.removeFilter;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        if (key === 'domain') this.setFilter({ domainId: null, subcatLabel: null });
        else if (key === 'subcat') this.setFilter({ subcatLabel: null });
        else if (key === 'outcome') this.setFilter({ outcome: 'ALL' });
        else if (key === 'archetype') this.setFilter({ archetype: null });
        else if (key === 'format') this.setFilter({ questionFormat: null });
        else if (key === 'peel') this.setFilter({ peelTier: null });
        else if (key === 'speed') this.setFilter({ speedBucket: null });
        else if (key === 'bucket') this.setFilter({ bucketKey: null });
      });
    });

    // Reset All button(s)
    host.querySelectorAll<HTMLButtonElement>('[data-reset-filters]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.resetFilters();
      });
    });

    // Linked Action 1: Practice This Slice
    host.querySelector('#ws-stats-practice-slice')?.addEventListener('click', () => {
      this.deps.haptics?.lockThunk();
      this.deps.audio?.playSfx('vault_thunk');
      this.callbacks.onPracticeSlice?.({
        domainId: this.filter.domainId,
        subcatLabel: this.filter.subcatLabel,
        outcome: this.filter.outcome,
        archetype: this.filter.archetype,
        questionFormat: this.filter.questionFormat ?? null,
        peelTier: this.filter.peelTier,
        speedBucket: this.filter.speedBucket,
      });
    });

    // Linked Action 2: Review Missed Cards (pre-filtered to domainId in Mastery Deck!)
    host.querySelector('#ws-stats-open-srs')?.addEventListener('click', () => {
      this.deps.haptics?.uiTap();
      this.deps.audio?.playSfx('ui_tap');
      if (this.callbacks.onOpenMissedCards) {
        this.callbacks.onOpenMissedCards(this.filter.domainId);
      } else {
        this.callbacks.onNavigateSection?.('OBSERVATORY');
      }
    });

    // Linked Action 3: Related Trophies (pre-filtered in Hall of Honours!)
    host.querySelector('#ws-stats-open-honours')?.addEventListener('click', () => {
      this.deps.haptics?.uiTap();
      this.deps.audio?.playSfx('ui_tap');
      if (this.callbacks.onOpenRelatedHonours) {
        this.callbacks.onOpenRelatedHonours({
          aspect: inferRelatedHonourAspect(this.filter),
          contextLabel: buildFilterContextLabel(this.filter),
          domainId: this.filter.domainId,
          archetype: this.filter.archetype,
          peelTier: this.filter.peelTier,
          outcome: this.filter.outcome,
          speedBucket: this.filter.speedBucket,
        });
      } else {
        this.callbacks.onNavigateSection?.('HONOURS');
      }
    });

    // Graph 1: Clickable bars & dots filter to that exact day/question (toggle!)
    host.querySelectorAll<Element>('[data-g1-bucket]').forEach((el) => {
      el.addEventListener('click', () => {
        const key = el.getAttribute('data-g1-bucket');
        if (!key) return;
        this.deps.haptics?.spinTick();
        this.deps.audio?.playSfx('spin_tick');
        this.setFilter({ bucketKey: this.filter.bucketKey === key ? null : key });
      });
    });

    // Graph 2: Clickable Polar Radar spokes/labels AND 12 Domain rows (toggle!)
    host.querySelectorAll<Element>('[data-g2-dom]').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = Number(el.getAttribute('data-g2-dom'));
        if (!Number.isFinite(idx) || idx < 0 || idx > 11) return;
        const domId = idx as DomainId;
        this.deps.haptics?.spinTick();
        this.deps.audio?.playSfx('spin_tick');
        this.setFilter({
          domainId: this.filter.domainId === domId ? null : domId,
          subcatLabel: null,
        });
      });
    });

    // Graph 2: Clickable Subcategory Breakdown rows (toggle!)
    host.querySelectorAll<HTMLButtonElement>('[data-subcat-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lbl = btn.dataset.subcatFilter?.trim();
        if (!lbl) return;
        this.deps.haptics?.spinTick();
        this.deps.audio?.playSfx('spin_tick');
        const isSame =
          this.filter.subcatLabel !== null &&
          this.filter.subcatLabel.toLowerCase() === lbl.toLowerCase();
        this.setFilter({ subcatLabel: isSame ? null : lbl });
      });
    });

    // Graph 2: Clickable Strengths & Weak Spots quick-jump chips (toggle!)
    host.querySelectorAll<HTMLButtonElement>('[data-quick-dom]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.quickDom);
        if (!Number.isFinite(idx) || idx < 0 || idx > 11) return;
        const domId = idx as DomainId;
        this.deps.haptics?.spinTick();
        this.deps.audio?.playSfx('spin_tick');
        this.setFilter({
          domainId: this.filter.domainId === domId ? null : domId,
          subcatLabel: null,
        });
      });
    });

    // Graph 4: Clickable Format Mastery Strip pills (toggle!)
    host.querySelectorAll<HTMLButtonElement>('[data-format-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fmt = btn.dataset.formatFilter as QuestionFormatV4 | undefined;
        if (!fmt) return;
        this.deps.haptics?.spinTick();
        this.deps.audio?.playSfx('spin_tick');
        this.setFilter({
          questionFormat: this.filter.questionFormat === fmt ? null : fmt,
        });
      });
    });

    // Graph 4A: Clickable Morph rows (toggle!)
    host.querySelectorAll<HTMLButtonElement>('[data-arch-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const arch = btn.dataset.archFilter as AnalyticsArchetype | undefined;
        if (!arch) return;
        this.deps.haptics?.spinTick();
        this.deps.audio?.playSfx('spin_tick');
        this.setFilter({ archetype: this.filter.archetype === arch ? null : arch });
      });
    });

    // Graph 4A: Clickable Hint-Tier cells (toggle!)
    host.querySelectorAll<HTMLButtonElement>('[data-peel-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const raw = Number(btn.dataset.peelFilter);
        if (raw !== 1 && raw !== 2 && raw !== 3) return;
        const tier = raw as 1 | 2 | 3;
        this.deps.haptics?.spinTick();
        this.deps.audio?.playSfx('spin_tick');
        this.setFilter({ peelTier: this.filter.peelTier === tier ? null : tier });
      });
    });

    // Graph 4B: Clickable Speed Histogram SVG bars (toggle!)
    host.querySelectorAll<Element>('[data-speed-bucket]').forEach((el) => {
      el.addEventListener('click', () => {
        const raw = Number(el.getAttribute('data-speed-bucket'));
        if (!Number.isInteger(raw) || raw < 0 || raw > 4) return;
        const sb = raw as AnalyticsSpeedBucketIndex;
        this.deps.haptics?.spinTick();
        this.deps.audio?.playSfx('spin_tick');
        this.setFilter({ speedBucket: this.filter.speedBucket === sb ? null : sb });
      });
    });
  }
}
