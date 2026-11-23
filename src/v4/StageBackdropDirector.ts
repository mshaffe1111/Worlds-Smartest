// ============================================================================
// WORLD'S SMARTEST v4.0 — Broadcast Stage Backdrop & Lighting Director
// Lightweight 60fps 2D Canvas atmospheric spotlights, warm venue glow, and
// reactive studio lighting pulses for all 8 World Tour venues + Home Studio.
// ZERO spinning 3D objects, ZERO WebGL overhead, ZERO text obstruction.
// ============================================================================

import type { VenueStageThemeId } from './contracts';

export type StageBackdropThemeId = VenueStageThemeId | 'HOME_STUDIO';
export type StageLightingIntensity = 'calm' | 'board' | 'question' | 'tension' | 'celebration';
export type StageLightingPulseKind =
  | 'win'
  | 'miss'
  | 'power_play'
  | 'spotlight'
  | 'wedge'
  | 'lock_in';

export interface VenuePaletteSpec {
  readonly id: StageBackdropThemeId;
  readonly venueTag: string;
  readonly bgTop: string;
  readonly bgMid: string;
  readonly bgBottom: string;
  readonly floorGlow: string;
  readonly beamPrimary: string;
  readonly beamSecondary: string;
  readonly accentGold: string;
  readonly moteColor: string;
  readonly beamCount: number;
  readonly moteCount: number;
  readonly sweepSpeed: number;
  readonly crowdBokehRows: number;
}

export const VENUE_STAGE_PALETTES: Readonly<Record<StageBackdropThemeId, VenuePaletteSpec>> = {
  HOME_STUDIO: {
    id: 'HOME_STUDIO',
    venueTag: 'PRIME-TIME BROADCAST STUDIO',
    bgTop: '#081229',
    bgMid: '#0d1d3d',
    bgBottom: '#070e20',
    floorGlow: 'rgba(245, 196, 81, 0.22)',
    beamPrimary: 'rgba(245, 196, 81, 0.14)',
    beamSecondary: 'rgba(70, 168, 255, 0.13)',
    accentGold: '#f5c451',
    moteColor: 'rgba(255, 232, 168, 0.52)',
    beamCount: 4,
    moteCount: 34,
    sweepSpeed: 0.28,
    crowdBokehRows: 1,
  },
  TIER1_COMMUNITY_HALL: {
    id: 'TIER1_COMMUNITY_HALL',
    venueTag: 'OAKRIDGE COMMUNITY HALL · 42 WATCHING',
    bgTop: '#1d120c',
    bgMid: '#2c1b11',
    bgBottom: '#140c08',
    floorGlow: 'rgba(246, 179, 82, 0.24)',
    beamPrimary: 'rgba(255, 206, 122, 0.15)',
    beamSecondary: 'rgba(232, 134, 62, 0.11)',
    accentGold: '#f6b352',
    moteColor: 'rgba(255, 224, 160, 0.45)',
    beamCount: 2,
    moteCount: 20,
    sweepSpeed: 0.16,
    crowdBokehRows: 1,
  },
  TIER2_CIVIC_THEATER: {
    id: 'TIER2_CIVIC_THEATER',
    venueTag: 'DOWNTOWN LYRIC THEATER · 1.4K WATCHING',
    bgTop: '#210b16',
    bgMid: '#331122',
    bgBottom: '#13070e',
    floorGlow: 'rgba(245, 196, 81, 0.22)',
    beamPrimary: 'rgba(245, 196, 81, 0.15)',
    beamSecondary: 'rgba(224, 82, 124, 0.12)',
    accentGold: '#f5c451',
    moteColor: 'rgba(255, 218, 158, 0.48)',
    beamCount: 3,
    moteCount: 26,
    sweepSpeed: 0.21,
    crowdBokehRows: 1,
  },
  TIER3_REGIONAL_TV: {
    id: 'TIER3_REGIONAL_TV',
    venueTag: 'CHANNEL 7 STUDIO B · 78K WATCHING',
    bgTop: '#081733',
    bgMid: '#0e2854',
    bgBottom: '#061024',
    floorGlow: 'rgba(70, 168, 255, 0.24)',
    beamPrimary: 'rgba(70, 168, 255, 0.16)',
    beamSecondary: 'rgba(245, 196, 81, 0.13)',
    accentGold: '#6ec0ff',
    moteColor: 'rgba(182, 224, 255, 0.5)',
    beamCount: 4,
    moteCount: 30,
    sweepSpeed: 0.26,
    crowdBokehRows: 1,
  },
  TIER4_NATIONAL_ARENA: {
    id: 'TIER4_NATIONAL_ARENA',
    venueTag: 'STARLIGHT NATIONAL ARENA · 5.2M WATCHING',
    bgTop: '#0b1030',
    bgMid: '#141e52',
    bgBottom: '#070b21',
    floorGlow: 'rgba(245, 196, 81, 0.26)',
    beamPrimary: 'rgba(245, 196, 81, 0.16)',
    beamSecondary: 'rgba(92, 148, 255, 0.15)',
    accentGold: '#f5c451',
    moteColor: 'rgba(255, 232, 174, 0.55)',
    beamCount: 5,
    moteCount: 38,
    sweepSpeed: 0.31,
    crowdBokehRows: 2,
  },
  TIER5_LONDON_ROTUNDA: {
    id: 'TIER5_LONDON_ROTUNDA',
    venueTag: 'GRAND ROTUNDA HALL, LONDON · 34M WATCHING',
    bgTop: '#071c19',
    bgMid: '#0d302a',
    bgBottom: '#051210',
    floorGlow: 'rgba(52, 217, 147, 0.2)',
    beamPrimary: 'rgba(245, 196, 81, 0.16)',
    beamSecondary: 'rgba(52, 217, 147, 0.14)',
    accentGold: '#f2cf7e',
    moteColor: 'rgba(218, 252, 226, 0.5)',
    beamCount: 5,
    moteCount: 40,
    sweepSpeed: 0.27,
    crowdBokehRows: 2,
  },
  TIER6_TOKYO_SKYDOME: {
    id: 'TIER6_TOKYO_SKYDOME',
    venueTag: 'SHIBUYA BROADCAST DOME, TOKYO · 160M WATCHING',
    bgTop: '#100c2d',
    bgMid: '#1e154c',
    bgBottom: '#09071d',
    floorGlow: 'rgba(242, 100, 152, 0.23)',
    beamPrimary: 'rgba(70, 168, 255, 0.16)',
    beamSecondary: 'rgba(242, 100, 152, 0.15)',
    accentGold: '#ff7eb0',
    moteColor: 'rgba(214, 210, 255, 0.58)',
    beamCount: 6,
    moteCount: 46,
    sweepSpeed: 0.38,
    crowdBokehRows: 2,
  },
  TIER7_CAIRO_PAVILION: {
    id: 'TIER7_CAIRO_PAVILION',
    venueTag: 'GREAT PAVILION AT GIZA · 490M WATCHING',
    bgTop: '#141121',
    bgMid: '#261c34',
    bgBottom: '#0d0a16',
    floorGlow: 'rgba(245, 178, 72, 0.26)',
    beamPrimary: 'rgba(245, 196, 81, 0.17)',
    beamSecondary: 'rgba(94, 152, 255, 0.13)',
    accentGold: '#f5c451',
    moteColor: 'rgba(255, 224, 148, 0.58)',
    beamCount: 6,
    moteCount: 48,
    sweepSpeed: 0.32,
    crowdBokehRows: 2,
  },
  TIER8_GLOBAL_FINALE: {
    id: 'TIER8_GLOBAL_FINALE',
    venueTag: 'GLOBAL CHAMPIONSHIP ARENA · 1.4B LIVE SIMULCAST',
    bgTop: '#0a0f24',
    bgMid: '#171d3e',
    bgBottom: '#060814',
    floorGlow: 'rgba(255, 214, 108, 0.30)',
    beamPrimary: 'rgba(255, 215, 114, 0.19)',
    beamSecondary: 'rgba(130, 180, 255, 0.16)',
    accentGold: '#ffe082',
    moteColor: 'rgba(255, 240, 190, 0.68)',
    beamCount: 7,
    moteCount: 56,
    sweepSpeed: 0.4,
    crowdBokehRows: 3,
  },
};

interface StageMote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  alpha: number;
}

interface CrowdBokehDot {
  nx: number;
  ny: number;
  r: number;
  hueMix: number;
  phase: number;
}

interface ActiveLightingPulse {
  kind: StageLightingPulseKind;
  color: string;
  startedAt: number;
  durationMs: number;
}

const PULSE_COLOR_MAP: Readonly<Record<StageLightingPulseKind, string>> = {
  win: 'rgba(52, 217, 147, 0.34)',
  miss: 'rgba(235, 86, 104, 0.30)',
  power_play: 'rgba(255, 210, 92, 0.40)',
  spotlight: 'rgba(255, 232, 150, 0.34)',
  wedge: 'rgba(180, 124, 255, 0.36)',
  lock_in: 'rgba(245, 196, 81, 0.24)',
};

export class StageBackdropDirector {
  private readonly container: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private themeId: StageBackdropThemeId = 'HOME_STUDIO';
  private intensity: StageLightingIntensity = 'calm';
  private rafId: number | null = null;
  private width = 1280;
  private height = 800;
  private dpr = 1;
  private motes: StageMote[] = [];
  private bokehDots: CrowdBokehDot[] = [];
  private activePulse: ActiveLightingPulse | null = null;
  private disposed = false;
  private reducedMotion = false;
  private lastFrameTs = 0;
  private elapsedSec = 0;

  private readonly onResizeBound = (): void => {
    this.handleResize();
  };

  private readonly onVisibilityBound = (): void => {
    if (document.hidden) {
      this.stopLoop();
    } else if (!this.disposed) {
      this.startLoop();
    }
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.classList.add('ws4-backdrop-host');
    this.container.setAttribute('aria-hidden', 'true');

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ws4-backdrop-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', { alpha: false });

    this.reducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.handleResize();
    this.rebuildParticles();
    this.applyContainerThemeAttributes();

    window.addEventListener('resize', this.onResizeBound, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityBound);

    this.renderFrame(0);
    if (!this.reducedMotion) {
      this.startLoop();
    }
  }

  public setTheme(themeId: StageBackdropThemeId): void {
    if (this.themeId === themeId) return;
    this.themeId = themeId;
    this.applyContainerThemeAttributes();
    this.rebuildParticles();
    this.renderFrame(0);
  }

  public getCurrentTheme(): StageBackdropThemeId {
    return this.themeId;
  }

  public setIntensity(mode: StageLightingIntensity): void {
    this.intensity = mode;
    this.container.dataset.ws4Intensity = mode;
    if (this.reducedMotion) {
      this.renderFrame(0);
    }
  }

  public triggerLightingPulse(kind: StageLightingPulseKind): void {
    this.activePulse = {
      kind,
      color: PULSE_COLOR_MAP[kind],
      startedAt: performance.now(),
      durationMs: kind === 'power_play' || kind === 'wedge' ? 950 : 620,
    };
    if (this.reducedMotion) {
      this.renderFrame(0);
    }
  }

  public start(): void {
    if (!this.disposed && !this.reducedMotion) {
      this.startLoop();
    }
  }

  public stop(): void {
    this.stopLoop();
  }

  public dispose(): void {
    this.disposed = true;
    this.stopLoop();
    window.removeEventListener('resize', this.onResizeBound);
    document.removeEventListener('visibilitychange', this.onVisibilityBound);
    this.canvas.remove();
  }

  private applyContainerThemeAttributes(): void {
    const palette = VENUE_STAGE_PALETTES[this.themeId];
    this.container.dataset.ws4Theme = this.themeId;
    this.container.style.setProperty('--ws4-venue-top', palette.bgTop);
    this.container.style.setProperty('--ws4-venue-mid', palette.bgMid);
    this.container.style.setProperty('--ws4-venue-bottom', palette.bgBottom);
    this.container.style.setProperty('--ws4-venue-accent', palette.accentGold);
  }

  private handleResize(): void {
    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(320, Math.round(rect.width || window.innerWidth || 1280));
    this.height = Math.max(320, Math.round(rect.height || window.innerHeight || 800));
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    if (this.ctx) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  }

  private rebuildParticles(): void {
    const palette = VENUE_STAGE_PALETTES[this.themeId];
    // Deterministic seeded distribution so first paint is lush and balanced
    let seed = this.themeId.split('').reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 17);
    const rand = (): number => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    this.motes = [];
    for (let i = 0; i < palette.moteCount; i++) {
      this.motes.push({
        x: rand() * this.width,
        y: rand() * this.height,
        r: 1.0 + rand() * 2.4,
        vx: (rand() - 0.5) * 9,
        vy: -(4 + rand() * 12),
        phase: rand() * Math.PI * 2,
        alpha: 0.25 + rand() * 0.55,
      });
    }

    this.bokehDots = [];
    const perRow = 18;
    for (let row = 0; row < palette.crowdBokehRows; row++) {
      for (let i = 0; i < perRow; i++) {
        this.bokehDots.push({
          nx: (i + 0.2 + rand() * 0.6) / perRow,
          ny: 0.78 + row * 0.075 + rand() * 0.045,
          r: 4 + rand() * 11,
          hueMix: rand(),
          phase: rand() * Math.PI * 2,
        });
      }
    }
  }

  private startLoop(): void {
    if (this.rafId !== null) return;
    this.lastFrameTs = performance.now();
    const step = (now: number): void => {
      if (this.disposed) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameTs) / 1000));
      this.lastFrameTs = now;
      this.elapsedSec += dt;
      this.renderFrame(dt);
      this.rafId = window.requestAnimationFrame(step);
    };
    this.rafId = window.requestAnimationFrame(step);
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private renderFrame(dt: number): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const palette = VENUE_STAGE_PALETTES[this.themeId];
    const w = this.width;
    const h = this.height;
    const t = this.elapsedSec;

    // 1. Rich Studio Backdrop Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, palette.bgTop);
    bgGrad.addColorStop(0.56, palette.bgMid);
    bgGrad.addColorStop(1, palette.bgBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle radial overhead dome glow
    const domeGrad = ctx.createRadialGradient(w * 0.5, h * 0.08, 12, w * 0.5, h * 0.2, Math.max(w, h) * 0.72);
    domeGrad.addColorStop(0, palette.floorGlow);
    domeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = domeGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Architectural Broadcast Ring Arcs (subtle, never competes with text)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.038)';
    ctx.lineWidth = 1.25;
    const cx = w * 0.5;
    const cy = h * 0.42;
    const baseRadius = Math.min(w, h) * 0.34;
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius + ring * (Math.min(w, h) * 0.14), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Sweeping Volumetric Studio Spotlights (from top-left/top-right truss)
    const speedScale =
      this.intensity === 'celebration'
        ? 1.75
        : this.intensity === 'tension'
          ? 1.35
          : this.intensity === 'question'
            ? 0.55
            : 1.0;
    const beamOpacityScale =
      this.intensity === 'question'
        ? 0.58
        : this.intensity === 'celebration'
          ? 1.25
          : 0.95;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const beamCount = palette.beamCount;
    for (let i = 0; i < beamCount; i++) {
      const ratio = beamCount === 1 ? 0.5 : i / (beamCount - 1);
      const originX = w * (0.08 + ratio * 0.84);
      const originY = -28;
      const swingAngle =
        Math.sin(t * palette.sweepSpeed * speedScale + i * 1.47) * 0.32 +
        (ratio - 0.5) * 0.42;
      const beamLen = Math.hypot(w, h) * 0.98;
      const spread = 0.085 + (i % 2) * 0.028;

      const x1 = originX + Math.sin(swingAngle - spread) * beamLen;
      const y1 = originY + Math.cos(swingAngle - spread) * beamLen;
      const x2 = originX + Math.sin(swingAngle + spread) * beamLen;
      const y2 = originY + Math.cos(swingAngle + spread) * beamLen;

      const bGrad = ctx.createLinearGradient(originX, originY, (x1 + x2) * 0.5, h * 0.92);
      const rawColor = i % 2 === 0 ? palette.beamPrimary : palette.beamSecondary;
      bGrad.addColorStop(0, rawColor);
      bGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.025)');
      bGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalAlpha = beamOpacityScale;
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 4. Lower Stage Horizon & Warm Studio Audience Bokeh
    const floorY = h * 0.84;
    const floorGrad = ctx.createRadialGradient(w * 0.5, floorY + 60, 20, w * 0.5, floorY + 40, w * 0.65);
    floorGrad.addColorStop(0, palette.floorGlow);
    floorGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h * 0.58, w, h * 0.42);

    ctx.save();
    for (let i = 0; i < this.bokehDots.length; i++) {
      const b = this.bokehDots[i];
      const twinkle = 0.26 + 0.18 * Math.sin(t * 1.4 + b.phase);
      ctx.globalAlpha = twinkle * (this.intensity === 'question' ? 0.5 : 0.9);
      ctx.fillStyle = b.hueMix > 0.45 ? palette.accentGold : '#8bc8ff';
      ctx.beginPath();
      ctx.arc(b.nx * w, b.ny * h, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 5. Floating Studio Dust / Golden Light Motes
    ctx.save();
    ctx.fillStyle = palette.moteColor;
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      if (dt > 0) {
        m.x += (m.vx + Math.sin(t * 0.7 + m.phase) * 4) * dt;
        m.y += m.vy * dt * (this.intensity === 'celebration' ? 1.8 : 1);
        if (m.y < -8) {
          m.y = h + 8;
          m.x = (m.x + w * 0.37) % w;
        }
        if (m.x < -8) m.x = w + 8;
        if (m.x > w + 8) m.x = -8;
      }
      const shimmer = 0.5 + 0.5 * Math.sin(t * 2.1 + m.phase);
      ctx.globalAlpha = m.alpha * shimmer * (this.intensity === 'question' ? 0.45 : 0.85);
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 6. Reactive Lighting Pulse Overlay (win / miss / Power Play / Wedge)
    if (this.activePulse) {
      const ageMs = performance.now() - this.activePulse.startedAt;
      if (ageMs >= this.activePulse.durationMs) {
        this.activePulse = null;
      } else {
        const p = ageMs / this.activePulse.durationMs;
        const envelope = Math.sin(p * Math.PI) * (1 - p * 0.35);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, envelope));
        const pGrad = ctx.createRadialGradient(w * 0.5, h * 0.35, 10, w * 0.5, h * 0.4, Math.max(w, h) * 0.75);
        pGrad.addColorStop(0, this.activePulse.color);
        pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
    }

    // 7. Gentle Readability Vignette around edges so foreground text stays razor-crisp
    const vigGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, Math.min(w, h) * 0.25, w * 0.5, h * 0.5, Math.max(w, h) * 0.78);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(3, 6, 15, 0.56)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);
  }
}
