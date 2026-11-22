// ============================================================================
// WORLD'S SMARTEST — Live Mini-Rival-Prism Telemetry Indicator
// Implements docs/PITCH_BIBLE.md §3.4 ("Rival Head-to-Head Duels & Telemetry")
//
// Renders a jewel-grade 60fps HTML5 Canvas miniature 3D-projected Veritas Prism
// telemetry instrument showing physical rival/ghost actions in real time:
//   • THINKING: Horological 90° facet spin detents + equatorial brass gimbal
//   • TIER 2 PEEL: Pressurized 24K gold steam-vent plumes & brass micro-sparks
//   • TIER 3 PEEL: Shattering crystalline glass shard polygons + shockwave ring
//   • OVERCLOCKING: Surging crimson conviction aura + compressing clamping jaws
//   • LOCKED: Vault firing-pin flash (24K gold/emerald lock vs crimson backfire)
//
// Plugs directly into both Campaign `RivalLiveHUDState` AND Trials `LiveGhostReplayFrame`,
// auto-pausing its RAF loop whenever hidden or detached from the DOM!
// ============================================================================

import type { PeelTier } from '../forge/types';
import type { LiveGhostReplayFrame } from '../modes/CouncilTrialsGhostMode';
import type { RivalLiveHUDState, RivalPrismStatus } from '../narrative/RivalAI';
import { hexToRgba } from './CharacterStageActor';

export type TelemetryWidgetVariant = 'compact' | 'pod';

export interface RivalPrismTelemetryOptions {
  variant?: TelemetryWidgetVariant;
  /** CSS pixel size of the square prism canvas (default 38 for compact, 42 for pod) */
  canvasSizePx?: number;
  accentHex?: string;
}

interface SteamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  growRate: number;
  life: number;
  maxLife: number;
  isSpark: boolean;
}

interface GlassShard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  omega: number;
  size: number;
  life: number;
  maxLife: number;
  hueHex: string;
}

interface CrimsonEmber {
  angle: number;
  dist: number;
  speed: number;
  size: number;
  life: number;
  maxLife: number;
}

let rivalTelemetryStylesInjected = false;

function ensureTelemetryStyles(): void {
  if (rivalTelemetryStylesInjected || typeof document === 'undefined') return;
  rivalTelemetryStylesInjected = true;
  const style = document.createElement('style');
  style.id = 'ws-rival-prism-telemetry-styles';
  style.textContent = `
    .ws-rival-prism-widget {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      flex-shrink: 0;
      max-width: 100%;
      pointer-events: none;
      vertical-align: middle;
    }
    /* Frameless floating horological telemetry strip (zero nested pill/circle boxes!) */
    .ws-rival-prism-widget.is-pod {
      padding: 2px 9px 2px 3px;
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(9, 13, 22, 0.72) 0%, rgba(9, 13, 22, 0.32) 100%);
      border: none;
      box-shadow: inset 0 1px 0 rgba(232, 197, 116, 0.24);
      transition: box-shadow 0.18s ease, background 0.18s ease;
    }
    .ws-rival-prism-widget.is-pod[data-status="OVERCLOCKING"] {
      background: linear-gradient(90deg, rgba(64, 14, 26, 0.78) 0%, rgba(24, 10, 18, 0.36) 100%);
      box-shadow:
        inset 0 1px 0 rgba(255, 92, 114, 0.62),
        0 0 16px rgba(224, 82, 99, 0.36);
    }
    .ws-rival-prism-widget.is-pod[data-status="PEELING"] {
      box-shadow:
        inset 0 1px 0 rgba(242, 207, 126, 0.52),
        0 0 12px rgba(242, 207, 126, 0.22);
    }
    .ws-rival-prism-canvas-box {
      position: relative;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      background: radial-gradient(circle at 50% 45%, rgba(24, 34, 54, 0.74) 0%, rgba(7, 10, 17, 0) 78%);
      border: none;
      box-shadow: none;
    }
    .ws-rival-prism-widget[data-status="OVERCLOCKING"] .ws-rival-prism-canvas-box {
      box-shadow: 0 0 14px rgba(255, 62, 88, 0.52);
    }
    .ws-rival-prism-pod-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
      line-height: 1.15;
    }
    .ws-rival-prism-pod-status {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--gold-bright, #f2cf7e);
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.85);
      white-space: nowrap;
    }
    .ws-rival-prism-widget[data-status="OVERCLOCKING"] .ws-rival-prism-pod-status {
      color: #ff9aa6;
    }
    .ws-rival-prism-pod-sub {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10px;
      font-variant-numeric: tabular-nums;
      color: var(--ivory-muted, #b8b2a6);
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);
}

export class RivalPrismTelemetryWidget {
  private readonly rootEl: HTMLDivElement;
  private readonly canvasBoxEl: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly podStatusEl: HTMLDivElement | null = null;
  private readonly podSubEl: HTMLDivElement | null = null;

  private readonly variant: TelemetryWidgetVariant;
  private sizePx: number;
  private dpr = 1;
  private accentHex: string;

  // Live Telemetry State
  private status: RivalPrismStatus = 'HIDDEN';
  private peelTier: PeelTier = 1;
  private overclockCharge = 0; // 0..1
  private targetFacetIndex = 0;
  private lockedVerdict: 'clean' | 'backfire' = 'clean';
  private jammedStatic = false;

  // 3D Mini-Prism Mechanical Kinematics
  private prismYawRad = 0.4;
  private prismYawVel = 0;
  private crownLift01 = 0;
  private blueprintExpand01 = 0;
  private jawClamp01 = 0;
  private lockFlash01 = 0;
  private shatterWave01 = 0;
  private tempoStealFlash01 = 0;
  private nextIdleSpinAtSec = 1.6;

  // Particle Pools
  private readonly steamParticles: SteamParticle[] = [];
  private readonly glassShards: GlassShard[] = [];
  private readonly crimsonEmbers: CrimsonEmber[] = [];
  private steamEmitAccum = 0;
  private emberEmitAccum = 0;

  private rafId = 0;
  private lastFrameMs = 0;
  private elapsedSec = 0;
  private disposed = false;

  constructor(options: RivalPrismTelemetryOptions = {}) {
    ensureTelemetryStyles();
    this.variant = options.variant ?? 'compact';
    this.sizePx = options.canvasSizePx ?? (this.variant === 'pod' ? 40 : 36);
    this.accentHex = options.accentHex ?? '#f2cf7e';

    this.rootEl = document.createElement('div');
    this.rootEl.className = `ws-rival-prism-widget ${this.variant === 'pod' ? 'is-pod' : 'is-compact'}`;
    this.rootEl.dataset.status = 'HIDDEN';
    this.rootEl.style.display = 'none';

    this.canvasBoxEl = document.createElement('div');
    this.canvasBoxEl.className = 'ws-rival-prism-canvas-box';
    this.canvasBoxEl.style.width = `${this.sizePx}px`;
    this.canvasBoxEl.style.height = `${this.sizePx}px`;

    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
    this.canvasBoxEl.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    this.rootEl.appendChild(this.canvasBoxEl);

    if (this.variant === 'pod') {
      const meta = document.createElement('div');
      meta.className = 'ws-rival-prism-pod-meta';
      this.podStatusEl = document.createElement('div');
      this.podStatusEl.className = 'ws-rival-prism-pod-status';
      this.podStatusEl.textContent = 'THINKING';
      this.podSubEl = document.createElement('div');
      this.podSubEl.className = 'ws-rival-prism-pod-sub';
      this.podSubEl.textContent = '3.0x SEALED';
      meta.append(this.podStatusEl, this.podSubEl);
      this.rootEl.appendChild(meta);
    }

    this.syncDprBacking();
  }

  public getElement(): HTMLElement {
    return this.rootEl;
  }

  /** Zero-blink mount/re-parent into any HUD container */
  public mount(container: HTMLElement, prepend = false): this {
    if (this.disposed) return this;
    if (this.rootEl.parentElement !== container) {
      if (prepend) {
        container.prepend(this.rootEl);
      } else {
        container.appendChild(this.rootEl);
      }
    }
    this.syncDprBacking();
    if (this.status !== 'HIDDEN') {
      this.ensureLoopRunning();
    }
    return this;
  }

  public unmount(): void {
    this.stopLoop();
    this.rootEl.remove();
  }

  public setAccentHex(hex: string): this {
    if (hex) this.accentHex = hex;
    return this;
  }

  public hide(): void {
    this.setStatusInternal('HIDDEN');
  }

  public reset(): void {
    this.peelTier = 1;
    this.overclockCharge = 0;
    this.crownLift01 = 0;
    this.blueprintExpand01 = 0;
    this.jawClamp01 = 0;
    this.lockFlash01 = 0;
    this.shatterWave01 = 0;
    this.tempoStealFlash01 = 0;
    this.jammedStatic = false;
    this.lockedVerdict = 'clean';
    this.steamParticles.length = 0;
    this.glassShards.length = 0;
    this.crimsonEmbers.length = 0;
  }

  /**
   * Syncs live state directly from Campaign/Boss `RivalLiveHUDState`!
   */
  public syncFromRivalHUD(hud: RivalLiveHUDState): void {
    this.accentHex = hud.accentHex || this.accentHex;
    const prevStatus = this.status;
    const prevTier = this.peelTier;

    if (hud.status === 'HIDDEN') {
      this.setStatusInternal('HIDDEN');
      return;
    }

    // Detect fresh question start
    if (prevStatus === 'LOCKED' && hud.status === 'THINKING') {
      this.reset();
    }

    this.jammedStatic = (hud.tellPillText || '').toLowerCase().includes('jammed');

    if (hud.peeledTier >= 2 && prevTier < 2) {
      this.triggerTier2SteamVent();
    }

    if (hud.status === 'OVERCLOCKING') {
      this.overclockCharge = Math.max(0.25, hud.overclockCharge || 0.65);
    } else if (hud.status !== 'LOCKED') {
      this.overclockCharge = 0;
    }

    if (hud.status === 'LOCKED' && prevStatus !== 'LOCKED') {
      this.lockFlash01 = 1.0;
      const caughtOrMissed =
        (hud.tellPillText || '').includes('BLUFF CAUGHT') ||
        (hud.tellPillText || '').includes('missed that Prism') ||
        (hud.tellPillText || '').includes('mis-locked');
      this.lockedVerdict = caughtOrMissed ? 'backfire' : 'clean';
    }

    this.setStatusInternal(hud.status);
    this.updatePodLabels();
  }

  /**
   * Syncs 1:1 with Mode 5 `LiveGhostReplayFrame` (supports Tier 2 Steam AND Tier 3 Glass Shatter!)
   */
  public syncFromGhostFrame(frame: LiveGhostReplayFrame): void {
    const prevStatus = this.status;
    const prevTier = this.peelTier;

    if (prevStatus === 'LOCKED' && !frame.locked) {
      this.reset();
    }

    if (frame.activeFacetIndex !== this.targetFacetIndex) {
      this.spinToFacet(frame.activeFacetIndex);
    }

    if (frame.peelTier === 2 && prevTier < 2) {
      this.triggerTier2SteamVent();
    } else if (frame.peelTier === 3 && prevTier < 3) {
      this.triggerTier3GlassShatter();
    }

    if (frame.overclockCharging) {
      this.overclockCharge = Math.max(0.18, frame.overclockCharge);
    } else if (!frame.locked) {
      this.overclockCharge = 0;
    }

    if (frame.locked && prevStatus !== 'LOCKED') {
      this.lockFlash01 = 1.0;
      this.lockedVerdict = frame.lockedCorrect === false ? 'backfire' : 'clean';
    }

    this.setStatusInternal(frame.status);
    this.updatePodLabels();
  }

  public spinToFacet(facetIndex: number): void {
    this.targetFacetIndex = ((facetIndex % 4) + 4) % 4;
    this.ensureLoopRunning();
  }

  /** Fires pressurized 24K gold steam-vent plumes & micro-sparks (Tier 2 Clue Core!) */
  public triggerTier2SteamVent(): void {
    this.peelTier = 2;
    if (this.status === 'HIDDEN') {
      this.setStatusInternal('PEELING');
    }
    this.spawnSteamBurst(18);
    this.updatePodLabels();
    this.ensureLoopRunning();
  }

  /** Fires shattering crystalline glass sparks & blueprint expansion (Tier 3 Blueprint!) */
  public triggerTier3GlassShatter(): void {
    this.peelTier = 3;
    if (this.status === 'HIDDEN') {
      this.setStatusInternal('PEELING');
    }
    this.shatterWave01 = 1.0;
    this.spawnGlassShatterBurst(26);
    this.updatePodLabels();
    this.ensureLoopRunning();
  }

  /** Drives surging crimson Overclock aura & inward jaw compression */
  public setOverclockAura(active: boolean, charge01 = 0.75): void {
    if (active) {
      this.overclockCharge = Math.max(0.1, Math.min(1, charge01));
      this.setStatusInternal('OVERCLOCKING');
    } else if (this.status === 'OVERCLOCKING') {
      this.overclockCharge = 0;
      this.setStatusInternal('THINKING');
    }
    this.updatePodLabels();
  }

  public triggerTempoStealPulse(): void {
    this.tempoStealFlash01 = 1.0;
    this.ensureLoopRunning();
  }

  public dispose(): void {
    this.disposed = true;
    this.stopLoop();
    this.rootEl.remove();
  }

  // --------------------------------------------------------------------------
  // Internal State, Particle Spawners & 60fps Renderer
  // --------------------------------------------------------------------------

  private setStatusInternal(next: RivalPrismStatus): void {
    this.status = next;
    this.rootEl.dataset.status = next;
    if (next === 'HIDDEN') {
      this.rootEl.style.display = 'none';
      this.stopLoop();
      return;
    }
    this.rootEl.style.display = 'inline-flex';
    this.ensureLoopRunning();
  }

  private updatePodLabels(): void {
    if (!this.podStatusEl || !this.podSubEl) return;
    this.podStatusEl.textContent = this.status;
    const tierBase = this.peelTier === 1 ? 3.0 : this.peelTier === 2 ? 2.0 : 1.2;
    if (this.status === 'OVERCLOCKING') {
      const liveMult = (tierBase * (1 + this.overclockCharge)).toFixed(1);
      this.podSubEl.textContent = `⚡ ${liveMult}x WAGER`;
    } else if (this.peelTier === 3) {
      this.podSubEl.textContent = '1.2x SHATTERED';
    } else if (this.peelTier === 2) {
      this.podSubEl.textContent = '2.0x CLUE STEAM';
    } else {
      this.podSubEl.textContent = '3.0x SEALED';
    }
  }

  private syncDprBacking(): void {
    const nextDpr = Math.min(2, Math.max(1, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1));
    this.dpr = nextDpr;
    this.canvas.width = Math.round(this.sizePx * nextDpr);
    this.canvas.height = Math.round(this.sizePx * nextDpr);
  }

  private spawnSteamBurst(count: number): void {
    const cx = this.sizePx * 0.5;
    const cy = this.sizePx * 0.36;
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const isSpark = i % 4 === 0;
      this.steamParticles.push({
        x: cx + side * (this.sizePx * 0.14),
        y: cy + (Math.random() - 0.5) * 3,
        vx: side * (12 + Math.random() * 20),
        vy: -(10 + Math.random() * 22),
        r: isSpark ? 1.1 : 2.2 + Math.random() * 1.8,
        growRate: isSpark ? 0 : 5.5 + Math.random() * 4.5,
        life: 0,
        maxLife: isSpark ? 0.42 + Math.random() * 0.2 : 0.62 + Math.random() * 0.35,
        isSpark,
      });
    }
  }

  private spawnGlassShatterBurst(count: number): void {
    const cx = this.sizePx * 0.5;
    const cy = this.sizePx * 0.5;
    const palette = ['#8ee8ff', '#ffffff', '#fae29c', '#56d4f5'];
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 22 + Math.random() * 38;
      this.glassShards.push({
        x: cx + Math.cos(ang) * 3,
        y: cy + Math.sin(ang) * 3,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 12,
        rot: Math.random() * Math.PI * 2,
        omega: (Math.random() - 0.5) * 18,
        size: 1.8 + Math.random() * 2.6,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.4,
        hueHex: palette[i % palette.length],
      });
    }
  }

  private ensureLoopRunning(): void {
    if (this.disposed || this.rafId !== 0 || this.status === 'HIDDEN') return;
    this.lastFrameMs = performance.now();
    const tick = (now: number) => {
      if (this.disposed || !this.rootEl.isConnected || this.status === 'HIDDEN') {
        this.rafId = 0;
        return;
      }
      const dt = Math.min(0.064, Math.max(0.001, (now - this.lastFrameMs) / 1000));
      this.lastFrameMs = now;
      this.elapsedSec += dt;

      this.stepSimulation(dt);
      this.renderCanvas();

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private stepSimulation(dt: number): void {
    // 1. Periodic Rival Facet Spin while THINKING / PEELING
    if (this.status === 'THINKING' || this.status === 'PEELING') {
      if (this.elapsedSec >= this.nextIdleSpinAtSec) {
        this.targetFacetIndex = (this.targetFacetIndex + 1) % 4;
        this.nextIdleSpinAtSec = this.elapsedSec + 1.15 + Math.random() * 1.35;
      }
    }

    const desiredYaw = this.targetFacetIndex * (Math.PI * 0.5) + 0.38;
    // Shortest angular delta
    let deltaYaw = desiredYaw - this.prismYawRad;
    while (deltaYaw > Math.PI) deltaYaw -= Math.PI * 2;
    while (deltaYaw < -Math.PI) deltaYaw += Math.PI * 2;

    this.prismYawVel = (this.prismYawVel + deltaYaw * 38 * dt) * Math.exp(-9.5 * dt);
    this.prismYawRad += this.prismYawVel * dt;

    if (this.status === 'OVERCLOCKING') {
      // High-energy conviction spin + tremor
      this.prismYawRad += dt * (1.8 + this.overclockCharge * 4.2);
    }

    // 2. Mechanical Crown, Blueprint & Clamping Jaw Targets
    const targetCrown = this.peelTier >= 2 ? 1 : 0;
    const targetBlueprint = this.peelTier >= 3 ? 1 : 0;
    const targetJaw = this.status === 'OVERCLOCKING' ? Math.max(0.35, this.overclockCharge) : 0;

    this.crownLift01 += (targetCrown - this.crownLift01) * Math.min(1, dt * 10);
    this.blueprintExpand01 += (targetBlueprint - this.blueprintExpand01) * Math.min(1, dt * 11);
    this.jawClamp01 += (targetJaw - this.jawClamp01) * Math.min(1, dt * 12);

    this.lockFlash01 = Math.max(0, this.lockFlash01 - dt * 2.2);
    this.shatterWave01 = Math.max(0, this.shatterWave01 - dt * 2.4);
    this.tempoStealFlash01 = Math.max(0, this.tempoStealFlash01 - dt * 1.8);

    // 3. Continuous Gold Steam Venting while Rival has Tier 2 peeled and isn't locked yet
    if (this.peelTier === 2 && (this.status === 'PEELING' || this.status === 'THINKING')) {
      this.steamEmitAccum += dt * 16;
      while (this.steamEmitAccum >= 1) {
        this.steamEmitAccum -= 1;
        this.spawnSteamBurst(1);
      }
    }

    // Continuous Glass Spark Glints while Tier 3 Blueprint is active
    if (this.peelTier === 3 && this.status !== 'LOCKED' && Math.random() < dt * 10) {
      this.spawnGlassShatterBurst(2);
    }

    // Continuous Surging Crimson Embers while OVERCLOCKING
    if (this.status === 'OVERCLOCKING') {
      this.emberEmitAccum += dt * (14 + this.overclockCharge * 22);
      while (this.emberEmitAccum >= 1) {
        this.emberEmitAccum -= 1;
        this.crimsonEmbers.push({
          angle: Math.random() * Math.PI * 2,
          dist: this.sizePx * (0.42 + Math.random() * 0.08),
          speed: 18 + this.overclockCharge * 26,
          size: 1.1 + Math.random() * 1.4,
          life: 0,
          maxLife: 0.42 + Math.random() * 0.25,
        });
      }
    }

    // 4. Advance Particle Pools
    for (let i = this.steamParticles.length - 1; i >= 0; i--) {
      const p = this.steamParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.steamParticles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.exp(-3.2 * dt);
      p.r += p.growRate * dt;
    }

    for (let i = this.glassShards.length - 1; i >= 0; i--) {
      const s = this.glassShards[i];
      s.life += dt;
      if (s.life >= s.maxLife) {
        this.glassShards.splice(i, 1);
        continue;
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 92 * dt;
      s.rot += s.omega * dt;
    }

    for (let i = this.crimsonEmbers.length - 1; i >= 0; i--) {
      const e = this.crimsonEmbers[i];
      e.life += dt;
      if (e.life >= e.maxLife) {
        this.crimsonEmbers.splice(i, 1);
        continue;
      }
      e.dist = Math.max(2, e.dist - e.speed * dt);
      e.angle += 2.6 * dt;
    }
  }

  private renderCanvas(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const s = this.sizePx;
    const cx = s * 0.5;
    const cy = s * 0.52;

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, s, s);

    // 1. Surging Crimson Overclock Aura (PITCH_BIBLE.md §3.4)
    if (this.status === 'OVERCLOCKING' || (this.status === 'LOCKED' && this.lockedVerdict === 'backfire')) {
      const charge = this.status === 'OVERCLOCKING' ? Math.max(0.35, this.overclockCharge) : this.lockFlash01;
      const pulseHz = 2.8 + charge * 5.2;
      const pulse = 0.5 + 0.5 * Math.sin(this.elapsedSec * Math.PI * 2 * pulseHz);
      const auraR = s * (0.42 + pulse * 0.08 * charge);

      const aura = ctx.createRadialGradient(cx, cy, s * 0.05, cx, cy, auraR);
      aura.addColorStop(0, hexToRgba('#ff2a4b', 0.55 + pulse * 0.3));
      aura.addColorStop(0.6, hexToRgba('#e05263', 0.28 + charge * 0.22));
      aura.addColorStop(1, 'rgba(224, 82, 99, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, auraR, 0, Math.PI * 2);
      ctx.fill();

      // Expanding crimson heartbeat shockwave ring
      const wavePhase = (this.elapsedSec * (1.8 + charge * 1.8)) % 1;
      ctx.strokeStyle = hexToRgba('#ff5c74', (1 - wavePhase) * 0.85);
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.16 + wavePhase * s * 0.32, 0, Math.PI * 2);
      ctx.stroke();

      // Spiraling crimson conviction embers
      ctx.fillStyle = '#ff9aa8';
      for (const e of this.crimsonEmbers) {
        const a = 1 - e.life / e.maxLife;
        ctx.globalAlpha = a * 0.9;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(e.angle) * e.dist, cy + Math.sin(e.angle) * e.dist, e.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // 2. Draw Miniature 3D-Projected Veritas Prism Construct
    this.drawMiniVeritasPrism(ctx, cx, cy, s);

    // 3. Draw Gold Steam-Vent Plumes (Tier 2 Peel!)
    if (this.steamParticles.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const p of this.steamParticles) {
        const tNorm = p.life / p.maxLife;
        const alpha = (1 - tNorm) * (p.isSpark ? 0.95 : 0.58);
        if (p.isSpark) {
          ctx.fillStyle = hexToRgba('#fff3bd', alpha);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const g = ctx.createRadialGradient(p.x, p.y, 0.2, p.x, p.y, p.r);
          g.addColorStop(0, hexToRgba('#ffe79e', alpha));
          g.addColorStop(0.55, hexToRgba('#d8af57', alpha * 0.55));
          g.addColorStop(1, 'rgba(216, 175, 87, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 4. Draw Shattering Crystalline Glass Sparks (Tier 3 Peel!)
    if (this.shatterWave01 > 0.01) {
      ctx.strokeStyle = hexToRgba('#8ee8ff', this.shatterWave01 * 0.9);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, (1 - this.shatterWave01) * s * 0.48 + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.glassShards.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const sh of this.glassShards) {
        const alpha = 1 - sh.life / sh.maxLife;
        ctx.save();
        ctx.translate(sh.x, sh.y);
        ctx.rotate(sh.rot);
        ctx.fillStyle = hexToRgba(sh.hueHex, alpha * 0.92);
        ctx.beginPath();
        ctx.moveTo(0, -sh.size);
        ctx.lineTo(sh.size * 0.72, sh.size * 0.35);
        ctx.lineTo(-sh.size * 0.58, sh.size * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    // 5. Vault Firing-Pin Lock Flash & Tactical Overlays
    if (this.lockFlash01 > 0.02) {
      const flashHex = this.lockedVerdict === 'backfire' ? '#ff425b' : '#39d49a';
      ctx.strokeStyle = hexToRgba(flashHex, this.lockFlash01);
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.44 * (1.05 - this.lockFlash01 * 0.25), 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.tempoStealFlash01 > 0.02) {
      ctx.strokeStyle = hexToRgba('#d946ef', this.tempoStealFlash01 * 0.9);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.46, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.jammedStatic) {
      ctx.fillStyle = 'rgba(240, 157, 70, 0.34)';
      for (let y = 4; y < s - 4; y += 5) {
        if (Math.sin(this.elapsedSec * 38 + y) > 0.15) {
          ctx.fillRect(3, y, s - 6, 1);
        }
      }
    }

    ctx.restore();
  }

  private drawMiniVeritasPrism(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    s: number,
  ): void {
    const isOverclock = this.status === 'OVERCLOCKING';
    const isLocked = this.status === 'LOCKED';
    const jitterX = isOverclock ? (Math.random() - 0.5) * 1.1 * this.overclockCharge : 0;
    const jitterY = isOverclock ? (Math.random() - 0.5) * 1.1 * this.overclockCharge : 0;

    const px = cx + jitterX;
    const py = cy + jitterY;

    const prismR = s * (0.24 + this.blueprintExpand01 * 0.05);
    const halfH = s * 0.23;

    // Equatorial Brass Gimbal Ring
    ctx.strokeStyle = isOverclock ? 'rgba(255, 118, 134, 0.72)' : 'rgba(216, 175, 87, 0.52)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.ellipse(px, py + 1, prismR * 1.28, prismR * 0.42, -0.14, 0, Math.PI * 2);
    ctx.stroke();

    // Glowing Inner Holographic Clue Core when Peeled (Tier 2 or Tier 3)
    if (this.crownLift01 > 0.08) {
      const coreR = s * 0.10 * this.crownLift01;
      ctx.save();
      ctx.fillStyle = this.peelTier === 3 ? 'rgba(86, 212, 245, 0.92)' : 'rgba(250, 226, 156, 0.92)';
      ctx.beginPath();
      ctx.moveTo(px, py - coreR * 1.3);
      ctx.lineTo(px + coreR, py);
      ctx.lineTo(px, py + coreR * 1.3);
      ctx.lineTo(px - coreR, py);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 4 Rotating 3D-Projected Crystal Facets
    const facetAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((a) => a + this.prismYawRad);
    const faces = facetAngles
      .map((a0, idx) => {
        const a1 = a0 + Math.PI * 0.5;
        const midA = a0 + Math.PI * 0.25;
        const depthZ = Math.cos(midA);
        return { idx, a0, a1, midA, depthZ };
      })
      .sort((a, b) => a.depthZ - b.depthZ);

    for (const f of faces) {
      // On Tier-3 Blueprint Shatter, two opposing false facets are shattered away!
      if (this.peelTier === 3 && (f.idx === 1 || f.idx === 3)) {
        continue;
      }

      const expandOut = this.blueprintExpand01 * 2.2;
      const ox = Math.sin(f.midA) * expandOut;
      const oy = Math.cos(f.midA) * expandOut * 0.3;

      const x0 = px + Math.sin(f.a0) * prismR + ox;
      const y0Top = py - halfH + Math.cos(f.a0) * prismR * 0.26 + oy;
      const y0Bot = py + halfH + Math.cos(f.a0) * prismR * 0.26 + oy;

      const x1 = px + Math.sin(f.a1) * prismR + ox;
      const y1Top = py - halfH + Math.cos(f.a1) * prismR * 0.26 + oy;
      const y1Bot = py + halfH + Math.cos(f.a1) * prismR * 0.26 + oy;

      const isFront = f.depthZ > 0.25;

      let fill: string;
      let stroke: string;
      if (isOverclock) {
        fill = isFront ? 'rgba(185, 28, 52, 0.72)' : 'rgba(72, 14, 26, 0.55)';
        stroke = isFront ? '#ff99a8' : 'rgba(224, 82, 99, 0.6)';
      } else if (isLocked) {
        fill =
          this.lockedVerdict === 'backfire'
            ? 'rgba(130, 22, 36, 0.78)'
            : isFront
              ? 'rgba(28, 112, 82, 0.76)'
              : 'rgba(16, 48, 38, 0.58)';
        stroke = this.lockedVerdict === 'backfire' ? '#ff6478' : '#6cf0be';
      } else {
        fill = isFront ? 'rgba(32, 48, 76, 0.74)' : 'rgba(14, 21, 35, 0.62)';
        stroke = isFront ? this.accentHex : 'rgba(216, 175, 87, 0.36)';
      }

      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = isFront ? 1.25 : 0.85;

      ctx.beginPath();
      ctx.moveTo(x0, y0Top);
      ctx.lineTo(x1, y1Top);
      ctx.lineTo(x1, y1Bot);
      ctx.lineTo(x0, y0Bot);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Top Brass Crown Ring (separates upward on Peel!)
    const crownY = py - halfH - 1.5 - this.crownLift01 * 3.4;
    ctx.strokeStyle = '#fae29c';
    ctx.fillStyle = 'rgba(181, 132, 44, 0.85)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.ellipse(px, crownY, prismR * 0.78, prismR * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Side Brass Overclock Clamping Jaws (compress inward as Rival charges Overclock!)
    if (this.jawClamp01 > 0.04) {
      const jawDist = prismR * (1.42 - this.jawClamp01 * 0.36);
      ctx.strokeStyle = '#ff8e9b';
      ctx.lineWidth = 1.6;
      for (const dir of [-1, 1]) {
        const jx = px + dir * jawDist;
        ctx.beginPath();
        ctx.moveTo(jx - dir * 2.2, py - halfH * 0.55);
        ctx.lineTo(jx, py - halfH * 0.35);
        ctx.lineTo(jx, py + halfH * 0.35);
        ctx.lineTo(jx - dir * 2.2, py + halfH * 0.55);
        ctx.stroke();
      }
    }
  }
}
