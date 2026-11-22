// ============================================================================
// WORLD'S SMARTEST — Career Analytics & Historical Right/Wrong Graphs (`#166` §2.1)
// Renders 5 High-DPI Interactive Graphs (`tabular-nums`, `backdrop-filter: none`,
// `390×844` portrait + `844×390` landscape + `1050×1080` square + desktop):
//  1. Graph 1: Historical Right vs. Wrong Stacked Bar & Rolling Accuracy % Spline
//  2. Graph 2: 12-Domain Right vs. Wrong Mastery Breakdown & Sovereign Polar Radar
//  3. Graph 3: Global IRT ELO & Overclock Conviction Trajectory Line Chart
//  4. Graph 4: 5-Morph & Peel-Tier Right/Wrong Matrix + 5-Bucket Speed Histogram
//  5. Ledger Tape: Scrollable Recent Question History (Right/Wrong, Domain, Morph, Time, Pts)
// ============================================================================

import { SOVEREIGN_DOMAINS, getSovereignDomainMeta, type PassportSystem } from '../narrative';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import {
  ALL_ANALYTICS_ARCHETYPES,
  SPEED_BUCKET_LABELS,
  type AnalyticsArchetype,
  type AnalyticsTimeRange,
  type CareerAnalyticsState,
  type CareerAnalyticsStore,
  type QuestionAnalyticsEvent,
} from './CareerAnalyticsStore';
import {
  attachMetaEscapeHandler,
  bindVaultJumperEvents,
  ensureMetaStylesInjected,
  escapeMetaHtml,
  renderVaultJumperHtml,
  type MetaSuiteSectionId,
} from './DiplomaticPassportBook';

export interface CareerAnalyticsDashboardDependencies {
  store: CareerAnalyticsStore;
  passport: PassportSystem;
  audio?: StudioAudioEngine;
  haptics?: HapticsEngine;
}

export interface CareerAnalyticsDashboardCallbacks {
  onNavigateSection?: (section: MetaSuiteSectionId) => void;
  onBack?: () => void;
  onClose?: () => void;
}

export interface CareerAnalyticsOpenOptions extends CareerAnalyticsDashboardCallbacks {
  initialRange?: AnalyticsTimeRange;
  canGoBack?: boolean;
}

interface BarBucketPoint {
  label: string;
  sublabel: string;
  right: number;
  wrong: number;
  rollingAccPct: number;
}

const ARCHETYPE_SHORT_LABELS: Record<AnalyticsArchetype, string> = {
  SIGHTLINE_LOCK: 'Sightline Prism',
  CODEX_DUAL_RING: 'Codex Dual-Ring',
  CALIBRATOR_DIAL: 'Calibrator Dial',
  GAUNTLET_SHATTER: 'Gauntlet Shatter',
  HERO_ARTIFACT_SYNTHESIS: 'Boss Relic Synth',
};

function pctStr(right: number, wrong: number): string {
  const tot = right + wrong;
  if (tot <= 0) return '—';
  return `${((right / tot) * 100).toFixed(1)}%`;
}

function buildRangeBarSeries(
  snap: CareerAnalyticsState,
  range: AnalyticsTimeRange,
): BarBucketPoint[] {
  if (range === 'LAST_25') {
    const recent = snap.events.slice(-25);
    if (recent.length === 0 && snap.totalRight + snap.totalWrong > 0) {
      const tot = snap.totalRight + snap.totalWrong;
      return [
        {
          label: 'Career',
          sublabel: `${snap.totalRight}R / ${snap.totalWrong}W`,
          right: snap.totalRight,
          wrong: snap.totalWrong,
          rollingAccPct: Math.round((snap.totalRight / tot) * 100),
        },
      ];
    }
    let runR = 0;
    let runTot = 0;
    return recent.map((ev, idx) => {
      runTot += 1;
      if (ev.correct) runR += 1;
      const dom = getSovereignDomainMeta(ev.domainId);
      return {
        label: `Q${idx + 1}`,
        sublabel: `${dom.shortName} · ${(ev.responseTimeMs / 1000).toFixed(1)}s · ${ev.correct ? `+${ev.pointsDelta} PTS` : 'MISS'}`,
        right: ev.correct ? 1 : 0,
        wrong: ev.correct ? 0 : 1,
        rollingAccPct: Math.round((runR / runTot) * 100),
      };
    });
  }

  const maxDays = range === 'DAYS_7' ? 7 : range === 'DAYS_30' ? 30 : 365;
  const sortedKeys = Object.keys(snap.dailyBuckets).sort().slice(-maxDays);
  let cumR = 0;
  let cumTot = 0;
  return sortedKeys.map((dk) => {
    const b = snap.dailyBuckets[dk];
    cumR += b.right;
    cumTot += b.right + b.wrong;
    const dayTot = b.right + b.wrong;
    const dayAcc = dayTot > 0 ? Math.round((b.right / dayTot) * 100) : 0;
    return {
      label: dk.slice(5), // MM-DD
      sublabel: `${dk}: ${b.right} Right · ${b.wrong} Wrong (${dayAcc}%) · +${b.pointsEarned.toLocaleString('en-US')} PTS`,
      right: b.right,
      wrong: b.wrong,
      rollingAccPct: cumTot > 0 ? Math.round((cumR / cumTot) * 100) : dayAcc,
    };
  });
}

/**
 * Graph 1: High-DPI SVG Stacked Right/Wrong Bars + Golden Rolling Accuracy % Trend Curve.
 */
function buildRightWrongTrendSvg(
  series: readonly BarBucketPoint[],
  selectedIdx: number | null,
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
          <tspan x="${w / 2}" dy="0">Answer questions in any mode to populate</tspan>
          <tspan x="${w / 2}" dy="17">Right/Wrong bars &amp; Rolling Accuracy</tspan>
        </text>
      </svg>
    `;
  }

  const maxCount = Math.max(1, ...series.map((p) => p.right + p.wrong));
  const stepX = plotW / series.length;
  const barW = Math.max(5, Math.min(26, stepX * 0.66));

  const gridLines = [0, 0.5, 1.0]
    .map((frac) => {
      const y = padT + (1 - frac) * plotH;
      const pctLbl = `${Math.round(frac * 100)}%`;
      const cntLbl = Math.round(frac * maxCount);
      return `
        <line x1="${padL}" y1="${y.toFixed(1)}" x2="${w - padR}" y2="${y.toFixed(1)}" stroke="rgba(216,175,87,0.15)" stroke-dasharray="3 3"/>
        <text x="${padL - 5}" y="${(y + 3).toFixed(1)}" text-anchor="end" fill="#7d8594" font-size="9" font-family="JetBrains Mono,monospace">${cntLbl}</text>
        <text x="${w - padR + 5}" y="${(y + 3).toFixed(1)}" text-anchor="start" fill="#f2cf7e" font-size="9" font-family="JetBrains Mono,monospace">${pctLbl}</text>
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
    const isSel = selectedIdx === idx;

    barsSvg.push(`
      <g data-g1-idx="${idx}" style="cursor:pointer;">
        <rect x="${(cx - stepX * 0.48).toFixed(1)}" y="${padT}" width="${(stepX * 0.96).toFixed(1)}" height="${plotH}" fill="${isSel ? 'rgba(242,207,126,0.10)' : 'transparent'}" rx="3"/>
        ${rH > 0 ? `<rect x="${(cx - barW / 2).toFixed(1)}" y="${rY.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(2, rH).toFixed(1)}" fill="#39d49a" rx="2"/>` : ''}
        ${wH > 0 ? `<rect x="${(cx - barW / 2).toFixed(1)}" y="${wY.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(2, wH).toFixed(1)}" fill="#e05263" rx="2"/>` : ''}
      </g>
    `);

    const accY = padT + (1 - pt.rollingAccPct / 100) * plotH;
    linePts.push(`${cx.toFixed(1)},${accY.toFixed(1)}`);
    dotsSvg.push(
      `<circle data-g1-idx="${idx}" cx="${cx.toFixed(1)}" cy="${accY.toFixed(1)}" r="${isSel ? '4.8' : '3.0'}" fill="#f2cf7e" stroke="#080b11" stroke-width="1.3" style="cursor:pointer;"/>`,
    );

    const showLabel =
      series.length <= 12 || idx === 0 || idx === series.length - 1 || idx % Math.ceil(series.length / 8) === 0;
    if (showLabel) {
      barsSvg.push(
        `<text x="${cx.toFixed(1)}" y="${h - 8}" text-anchor="middle" fill="#b8b2a6" font-size="8.8" font-family="JetBrains Mono,monospace">${escapeMetaHtml(pt.label)}</text>`,
      );
    }
  });

  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;">
      ${gridLines}
      ${barsSvg.join('')}
      <polyline points="${linePts.join(' ')}" fill="none" stroke="#f2cf7e" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
      ${dotsSvg.join('')}
    </svg>
  `;
}

/**
 * Graph 2 (Left): Sovereign 12-Domain Polar Accuracy & ELO Radar.
 */
function buildPolarDomainRadarSvg(snap: CareerAnalyticsState, focusedDomain: number): string {
  const cx = 155;
  const cy = 135;
  const maxR = 88;
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
  const labels: string[] = [];

  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const d = snap.byDomain[i];
    const tot = d.right + d.wrong;
    const eloNorm = Math.max(0.2, Math.min(1.0, (d.lastElo - 750) / 1350));
    const accNorm = tot > 0 ? Math.max(0.18, d.right / tot) : eloNorm;
    const rFrac = tot > 0 ? accNorm * 0.65 + eloNorm * 0.35 : eloNorm;

    const px = cx + cosA * maxR * rFrac;
    const py = cy + sinA * maxR * rFrac;
    polyPts.push(`${px.toFixed(1)},${py.toFixed(1)}`);

    const isFoc = i === focusedDomain;
    spokes.push(
      `<line x1="${cx}" y1="${cy}" x2="${(cx + cosA * maxR).toFixed(1)}" y2="${(cy + sinA * maxR).toFixed(1)}" stroke="${isFoc ? '#f2cf7e' : 'rgba(216,175,87,0.16)'}" stroke-width="${isFoc ? '1.6' : '1'}"/>`,
    );
    const lx = cx + cosA * (maxR + 15);
    const ly = cy + sinA * (maxR + 14);
    const anchor = cosA < -0.25 ? 'end' : cosA > 0.25 ? 'start' : 'middle';
    labels.push(
      `<text data-g2-dom="${i}" x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${anchor}" fill="${isFoc ? '#f2cf7e' : '#cfc9bc'}" font-size="8.8" font-weight="${isFoc ? '800' : '600'}" style="cursor:pointer;">${escapeMetaHtml(SOVEREIGN_DOMAINS[i].shortName)}</text>`,
    );
  }

  return `
    <svg viewBox="0 0 310 270" style="width:100%;max-width:295px;height:auto;display:block;margin:0 auto;">
      ${grid}
      ${spokes.join('')}
      <polygon points="${polyPts.join(' ')}" fill="rgba(57,212,154,0.22)" stroke="#39d49a" stroke-width="2"/>
      ${labels.join('')}
    </svg>
  `;
}

/**
 * Graph 3: Global IRT ELO Trajectory Line Chart (`800..2200`).
 */
function buildEloTrajectorySvg(snap: CareerAnalyticsState): string {
  const w = 520;
  const h = 156;
  const padX = 40;
  const padY = 18;
  const plotW = w - padX * 2;
  const plotH = h - padY * 2;

  const eloPoints: Array<{ label: string; elo: number }> = [{ label: 'Start', elo: 1200 }];
  if (snap.sessions.length > 0) {
    for (const s of snap.sessions.slice(-24)) {
      eloPoints.push({ label: s.mode.slice(0, 4), elo: s.eloAfter });
    }
  } else if (snap.events.length > 0) {
    const step = Math.max(1, Math.floor(snap.events.length / 20));
    for (let i = 0; i < snap.events.length; i += step) {
      eloPoints.push({ label: `Q${i + 1}`, elo: snap.events[i].eloAfter });
    }
    const lastEv = snap.events[snap.events.length - 1];
    eloPoints.push({ label: 'Now', elo: lastEv.eloAfter });
  } else {
    eloPoints.push({ label: 'Now', elo: snap.globalEloLatest });
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
      <text x="${padX - 6}" y="${padY + 4}" text-anchor="end" fill="#56d4f5" font-size="9" font-family="JetBrains Mono,monospace">${Math.round(maxElo)}</text>
      <line x1="${padX}" y1="${h - padY}" x2="${w - padX}" y2="${h - padY}" stroke="rgba(216,175,87,0.2)"/>
      <text x="${padX - 6}" y="${h - padY + 3}" text-anchor="end" fill="#7d8594" font-size="9" font-family="JetBrains Mono,monospace">${Math.round(minElo)}</text>
      <polygon points="${area}" fill="rgba(86,212,245,0.14)"/>
      <polyline points="${poly}" fill="none" stroke="#56d4f5" stroke-width="2.3" stroke-linejoin="round"/>
      ${coords
        .map(
          (c, i) =>
            i === coords.length - 1 || coords.length <= 12
              ? `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${i === coords.length - 1 ? '4.5' : '3'}" fill="${i === coords.length - 1 ? '#f2cf7e' : '#56d4f5'}" stroke="#080b11" stroke-width="1.2"/>`
              : '',
        )
        .join('')}
    </svg>
  `;
}

/**
 * Graph 4 (Right): 5-Bucket Response-Time Stacked Right/Wrong Histogram.
 */
function buildSpeedHistogramSvg(snap: CareerAnalyticsState): string {
  const w = 340;
  const h = 158;
  const padX = 24;
  const padT = 18;
  const padB = 28;
  const plotW = w - padX * 2;
  const plotH = h - padT - padB;

  const maxB = Math.max(1, ...snap.speedBuckets.map((b) => b.right + b.wrong));
  const stepX = plotW / 5;
  const barW = 34;

  const cols = snap.speedBuckets
    .map((b, idx) => {
      const cx = padX + stepX * (idx + 0.5);
      const rH = (b.right / maxB) * plotH;
      const wH = (b.wrong / maxB) * plotH;
      const rY = padT + plotH - rH;
      const wY = rY - wH;
      const tot = b.right + b.wrong;
      return `
        <g>
          ${rH > 0 ? `<rect x="${(cx - barW / 2).toFixed(1)}" y="${rY.toFixed(1)}" width="${barW}" height="${Math.max(2, rH).toFixed(1)}" fill="#39d49a" rx="3"/>` : ''}
          ${wH > 0 ? `<rect x="${(cx - barW / 2).toFixed(1)}" y="${wY.toFixed(1)}" width="${barW}" height="${Math.max(2, wH).toFixed(1)}" fill="#e05263" rx="3"/>` : ''}
          <text x="${cx.toFixed(1)}" y="${Math.max(11, (tot > 0 ? wY : padT + plotH) - 4).toFixed(1)}" text-anchor="middle" fill="#f6f2e9" font-size="9" font-family="JetBrains Mono,monospace">${tot}</text>
          <text x="${cx.toFixed(1)}" y="${h - 9}" text-anchor="middle" fill="#b8b2a6" font-size="9.5" font-family="JetBrains Mono,monospace">${escapeMetaHtml(SPEED_BUCKET_LABELS[idx])}</text>
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

  private activeRange: AnalyticsTimeRange = 'LAST_25';
  private selectedBarIdx: number | null = null;
  private focusedDomainIdx = 0;

  constructor(deps: CareerAnalyticsDashboardDependencies) {
    this.deps = deps;
    ensureMetaStylesInjected();
  }

  public isOpen(): boolean {
    return this.modalBackdrop !== null || this.mountedContainer !== null;
  }

  public open(options: CareerAnalyticsOpenOptions = {}): void {
    this.close();
    this.callbacks = options;
    this.activeRange = options.initialRange ?? 'LAST_25';
    this.selectedBarIdx = null;
    this.deps.store.syncAndBackfillFromProfile(this.deps.passport);

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-meta-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Career Stats & Historical Right/Wrong Graphs');
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
    this.activeRange = options.initialRange ?? 'LAST_25';
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
    if (this.modalBackdrop) {
      this.renderInto(this.modalBackdrop, true);
    } else if (this.mountedContainer) {
      this.renderInto(this.mountedContainer, false);
    }
  }

  private renderInto(host: HTMLElement, isModal: boolean): void {
    const snap = this.deps.store.getSnapshot();
    const challengerName = this.deps.passport.getChallengerName();
    const totalAnswered = snap.totalRight + snap.totalWrong;
    const avgMs = totalAnswered > 0 ? snap.totalResponseMs / totalAnswered : 0;
    const ocTotal = snap.overclock.overclockWins + snap.overclock.overclockMisses;
    const ocWinPct = ocTotal > 0 ? `${((snap.overclock.overclockWins / ocTotal) * 100).toFixed(0)}%` : '—';

    const barSeries = buildRangeBarSeries(snap, this.activeRange);
    const activeBarTooltip =
      this.selectedBarIdx !== null && barSeries[this.selectedBarIdx]
        ? barSeries[this.selectedBarIdx]
        : barSeries[barSeries.length - 1] ?? null;

    const vaultJumperHtml = renderVaultJumperHtml('ANALYTICS', {
      isModal,
      closeBtnId: 'ws-stats-close',
      canNavigate: Boolean(this.callbacks.onNavigateSection),
    });

    const recentLedger: QuestionAnalyticsEvent[] = [...snap.events].reverse().slice(0, 35);

    host.innerHTML = `
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-stats-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">CAREER STATS</h2>
              <div class="ws-meta-eyebrow">${escapeMetaHtml(challengerName)} · Right/Wrong &amp; IRT Telemetry</div>
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
                <button type="button" role="tab" aria-selected="${this.activeRange === id}" class="ws-meta-underline-tab ${this.activeRange === id ? 'is-active' : ''}" data-range-tab="${id}">
                  ${lbl}
                </button>
              `,
            )
            .join('')}
        </div>

        <div class="ws-meta-body-scroll">
          <!-- Frameless Hairline KPI Strip (Zero Nested KPI Boxes!) -->
          <div class="ws-meta-kpi-strip">
            <div class="ws-meta-kpi-cell">
              <span class="ws-meta-kpi-lbl">Right / Wrong</span>
              <span class="ws-meta-kpi-val">
                <span style="color:var(--emerald-win);">${snap.totalRight}R</span>
                <span style="color:var(--ivory-dim);font-weight:500;">·</span>
                <span style="color:var(--crimson-alert);">${snap.totalWrong}W</span>
              </span>
            </div>
            <div class="ws-meta-kpi-cell">
              <span class="ws-meta-kpi-lbl">Accuracy</span>
              <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${pctStr(snap.totalRight, snap.totalWrong)}</span>
            </div>
            <div class="ws-meta-kpi-cell">
              <span class="ws-meta-kpi-lbl">Streak</span>
              <span class="ws-meta-kpi-val">${snap.currentStreak} <span style="font-size:12px;color:var(--gold-bright);">/ ${snap.bestStreak}🔥</span></span>
            </div>
            <div class="ws-meta-kpi-cell">
              <span class="ws-meta-kpi-lbl">Global ELO</span>
              <span class="ws-meta-kpi-val" style="color:var(--cyan-clue);">${snap.globalEloLatest} <span style="font-size:11px;color:var(--ivory-dim);">(${snap.globalEloPeak})</span></span>
            </div>
            <div class="ws-meta-kpi-cell">
              <span class="ws-meta-kpi-lbl">Speed · Overclock</span>
              <span class="ws-meta-kpi-val" style="font-size:14.5px;">${totalAnswered > 0 ? `${(avgMs / 1000).toFixed(1)}s` : '—'} · <span style="color:var(--gold-bright);">${ocWinPct}</span></span>
            </div>
          </div>

          <!-- Graph 1: Historical Right vs. Wrong Stacked Bars & Rolling Accuracy % -->
          <div class="ws-meta-section">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">1. Right vs. Wrong &amp; Rolling Accuracy</h3>
              <span style="font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);">
                <span style="color:var(--emerald-win);">■ Right</span> · <span style="color:var(--crimson-alert);">■ Wrong</span> · <span style="color:var(--gold-bright);">— Accuracy %</span>
              </span>
            </div>

            ${buildRightWrongTrendSvg(barSeries, this.selectedBarIdx)}

            ${
              activeBarTooltip
                ? `<div class="ws-meta-note" style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--ivory-primary);">
                    <span>[${escapeMetaHtml(activeBarTooltip.label)}] ${escapeMetaHtml(activeBarTooltip.sublabel)}</span>
                    <span style="color:var(--gold-bright);font-weight:700;">Rolling ${activeBarTooltip.rollingAccPct}%</span>
                  </div>`
                : ''
            }
          </div>

          <!-- Graph 2: 12-Domain Mastery Breakdown & Polar Radar -->
          <div class="ws-meta-section">
            <h3 class="ws-meta-section-title">2. 12-Domain Mastery &amp; Polar Radar</h3>
            <div class="ws-meta-two-col" style="align-items:center;">
              <div>
                ${buildPolarDomainRadarSvg(snap, this.focusedDomainIdx)}
              </div>
              <div style="display:flex;flex-direction:column;">
                ${SOVEREIGN_DOMAINS.map((dom, idx) => {
                  const dc = snap.byDomain[idx];
                  const tot = dc.right + dc.wrong;
                  const rPct = tot > 0 ? (dc.right / tot) * 100 : 50;
                  const isFoc = idx === this.focusedDomainIdx;
                  return `
                    <div data-g2-dom="${idx}" class="ws-meta-row is-interactive ${isFoc ? 'is-focused' : ''}" style="padding:6px 4px;gap:8px;">
                      <img src="./${escapeMetaHtml(dom.medallionUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;flex-shrink:0;"/>
                      <span style="width:74px;font-size:11.5px;font-weight:600;color:var(--ivory-primary);flex-shrink:0;">${escapeMetaHtml(dom.shortName)}</span>
                      <div style="flex:1 1 auto;height:5px;border-radius:999px;background:rgba(224,82,99,0.38);overflow:hidden;">
                        <div style="width:${tot > 0 ? rPct.toFixed(1) : '0'}%;height:100%;background:#39d49a;"></div>
                      </div>
                      <span style="font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);min-width:112px;text-align:right;flex-shrink:0;">
                        <strong style="color:var(--emerald-win);">${dc.right}R</strong>·<strong style="color:var(--crimson-alert);">${dc.wrong}W</strong> <span style="color:var(--ivory-dim);">(${pctStr(dc.right, dc.wrong)})</span> · <strong style="color:${dom.accentHex};">${dc.lastElo}</strong>
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Graph 3: Global IRT ELO & Overclock Conviction Trajectory -->
          <div class="ws-meta-section">
            <h3 class="ws-meta-section-title">3. Global IRT ELO &amp; Conviction Telemetry</h3>
            <div class="ws-meta-two-col" style="align-items:center;">
              <div>
                ${buildEloTrajectorySvg(snap)}
              </div>
              <div style="display:flex;flex-direction:column;">
                <div class="ws-meta-row" style="font-family:var(--font-mono);font-size:11.5px;">
                  <span style="color:var(--ivory-muted);">Safe Lock Record</span>
                  <span><strong style="color:var(--emerald-win);">${snap.overclock.safeLockWins}W</strong> – <strong style="color:var(--crimson-alert);">${snap.overclock.safeLockMisses}L</strong> <span style="color:var(--ivory-dim);">(${pctStr(snap.overclock.safeLockWins, snap.overclock.safeLockMisses)})</span></span>
                </div>
                <div class="ws-meta-row" style="font-family:var(--font-mono);font-size:11.5px;">
                  <span style="color:var(--ivory-muted);">Overclock Wins</span>
                  <span style="color:var(--gold-bright);font-weight:700;">${snap.overclock.overclockWins} Wins · ${snap.overclock.max6xWins} at 6.0x</span>
                </div>
                <div class="ws-meta-row" style="font-family:var(--font-mono);font-size:11.5px;border-bottom:none;">
                  <span style="color:var(--ivory-muted);">Backfires / 6.0x Streak</span>
                  <span><strong style="color:var(--crimson-alert);">${snap.overclock.backfires}</strong> · Peak <strong style="color:var(--gold-bright);">${snap.overclock.bestConsecutiveMax6xWins}×</strong></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Graph 4: 5-Morph & Peel-Tier Matrix + Response-Time Histogram -->
          <div class="ws-meta-section">
            <div class="ws-meta-two-col">
              <div style="display:flex;flex-direction:column;gap:8px;">
                <h3 class="ws-meta-section-title">4A. 5-Morph &amp; Peel-Tier Matrix</h3>
                <div>
                  ${ALL_ANALYTICS_ARCHETYPES.map((arch) => {
                    const c = snap.byArchetype[arch];
                    return `
                      <div class="ws-meta-row" style="padding:7px 2px;font-family:var(--font-mono);font-size:11px;">
                        <span style="color:var(--ivory-primary);">${escapeMetaHtml(ARCHETYPE_SHORT_LABELS[arch])}</span>
                        <span><strong style="color:var(--emerald-win);">${c.right}R</strong> · <strong style="color:var(--crimson-alert);">${c.wrong}W</strong> <span style="color:var(--ivory-dim);">(${pctStr(c.right, c.wrong)})</span></span>
                      </div>
                    `;
                  }).join('')}
                </div>
                <div class="ws-meta-kpi-strip" style="border-bottom:none;padding-bottom:0;padding-top:4px;">
                  ${(
                    [
                      ['1', '3.0x Cold'],
                      ['2', '2.0x Clue'],
                      ['3', '1.2x Blue'],
                    ] as const
                  )
                    .map(([tk, lbl]) => {
                      const tc = snap.byPeelTier[tk];
                      return `
                        <div class="ws-meta-kpi-cell" style="padding:4px 8px;">
                          <span class="ws-meta-kpi-lbl" style="color:var(--gold-bright);">${lbl}</span>
                          <span class="ws-meta-kpi-val" style="font-size:13px;">${tc.right}R / ${tc.wrong}W</span>
                        </div>
                      `;
                    })
                    .join('')}
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:8px;">
                <h3 class="ws-meta-section-title">4B. Response-Time Histogram</h3>
                ${buildSpeedHistogramSvg(snap)}
              </div>
            </div>
          </div>

          <!-- 5. Chronological Question Ledger Tape -->
          <div class="ws-meta-section" style="border-bottom:none;">
            <h3 class="ws-meta-section-title">5. Question Ledger Tape (Last ${recentLedger.length})</h3>
            ${
              recentLedger.length > 0
                ? `<div style="display:flex;flex-direction:column;max-height:240px;overflow-y:auto;">
                    ${recentLedger
                      .map((ev) => {
                        const dom = getSovereignDomainMeta(ev.domainId);
                        const mult =
                          ev.peelTier === 1 ? 3.0 : ev.peelTier === 2 ? 2.0 : 1.2;
                        const effMult = (mult * (1 + ev.overclockCharge01)).toFixed(1);
                        return `
                          <div class="ws-meta-row" style="flex-wrap:wrap;padding:7px 4px;font-family:var(--font-mono);font-size:11px;box-shadow:inset 2px 0 0 ${ev.correct ? 'var(--emerald-win)' : 'var(--crimson-alert)'};padding-left:10px;">
                            <span style="display:inline-flex;align-items:center;gap:7px;">
                              <span style="font-weight:800;color:${ev.correct ? 'var(--emerald-win)' : 'var(--crimson-alert)'};">
                                ${ev.correct ? '✓' : ev.backfired ? '💥' : '✕'}
                              </span>
                              <img src="./${escapeMetaHtml(dom.medallionUrl)}" alt="" style="width:16px;height:16px;object-fit:contain;"/>
                              <span style="color:var(--ivory-primary);">${escapeMetaHtml(dom.shortName)}</span>
                              <span style="color:var(--ivory-dim);">· ${escapeMetaHtml(ARCHETYPE_SHORT_LABELS[ev.archetype])}</span>
                            </span>
                            <span style="color:var(--ivory-muted);">
                              ${(ev.responseTimeMs / 1000).toFixed(1)}s · ${effMult}x · <strong style="color:${ev.correct ? 'var(--gold-bright)' : 'var(--ivory-dim)'};">+${ev.pointsDelta.toLocaleString('en-US')} PTS</strong>
                            </span>
                          </div>
                        `;
                      })
                      .join('')}
                  </div>`
                : `<div style="padding:18px 0;text-align:center;font-size:12.5px;color:var(--ivory-muted);">No individual question events logged in this browser session yet.</div>`
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

    host.querySelectorAll<HTMLButtonElement>('[data-range-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.rangeTab as AnalyticsTimeRange | undefined;
        if (!next || next === this.activeRange) return;
        this.activeRange = next;
        this.selectedBarIdx = null;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.rerender();
      });
    });

    host.querySelectorAll<SVGElement>('[data-g1-idx]').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = Number(el.getAttribute('data-g1-idx'));
        if (!Number.isFinite(idx)) return;
        this.selectedBarIdx = idx;
        this.deps.haptics?.spinTick();
        this.deps.audio?.playSfx('spin_tick');
        this.rerender();
      });
    });

    host.querySelectorAll<Element>('[data-g2-dom]').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = Number(el.getAttribute('data-g2-dom'));
        if (!Number.isFinite(idx) || idx < 0 || idx > 11) return;
        this.focusedDomainIdx = idx;
        this.deps.haptics?.spinTick();
        this.deps.audio?.playSfx('spin_tick');
        this.rerender();
      });
    });
  }
}
