// ============================================================================
// WORLD'S SMARTEST — High-DPI Radial VFX & Celebration Overlay Canvas
// Uses smooth radial gradients + spark_glow.png (ZERO square pixels!)
// ============================================================================

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  hue: 'gold' | 'emerald' | 'crimson' | 'cyan';
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
}

export class VfxOverlayCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private sparkImg: HTMLImageElement | null = null;
  private sparks: SparkParticle[] = [];
  private rings: ShockwaveRing[] = [];
  private edgePulseAlpha = 0;
  private edgePulseColor = 'rgba(224, 82, 99, 0.45)';
  private rafId = 0;
  private lastTs = 0;
  private width = 1;
  private height = 1;

  private readonly handleResize = () => this.resize();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.loadSparkSprite();
    this.resize();
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  private loadSparkSprite(): void {
    const img = new Image();
    img.src = './assets/ui/spark_glow.png';
    img.onload = () => {
      this.sparkImg = img;
    };
  }

  public resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, window.innerWidth);
    this.height = Math.max(1, window.innerHeight);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  /**
   * Computes the 2D screen anchor matching the 3D Veritas Prism center across
   * portrait phones, compact mobile landscape split, and desktop/tablet viewports.
   */
  private getStageCenter(): { cx: number; cy: number } {
    if (this.width < this.height * 0.95) {
      // Portrait mobile/tablet: Prism floats in the open upper viewport above the dock
      return { cx: this.width * 0.5, cy: this.height * 0.27 };
    }
    if (this.height <= 520 && this.width > this.height * 1.35) {
      // Mobile landscape split: Prism sits symmetrically in the left 3D pane
      return { cx: this.width * 0.3, cy: this.height * 0.5 };
    }
    return { cx: this.width * 0.5, cy: this.height * 0.44 };
  }

  /** Gold Resonance & Streak-Scaled Spark Fountain */
  public playGoldResonance(streak = 1, bullseye = false): void {
    const { cx, cy } = this.getStageCenter();
    const count = bullseye ? 76 : Math.min(68, 26 + streak * 10);

    this.rings.push({
      x: cx,
      y: cy,
      radius: 18,
      maxRadius: Math.min(this.width, this.height) * (bullseye ? 0.46 : 0.34),
      life: 0,
      maxLife: 0.62,
      color: 'rgba(242, 207, 126,',
    });

    if (streak >= 2 || bullseye) {
      this.rings.push({
        x: cx,
        y: cy,
        radius: 8,
        maxRadius: Math.min(this.width, this.height) * 0.42,
        life: -0.08,
        maxLife: 0.72,
        color: 'rgba(57, 212, 154,',
      });
    }

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
      const speed = 110 + Math.random() * (bullseye ? 320 : 240);
      this.sparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 45,
        size: 14 + Math.random() * 18,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.42,
        hue: i % 3 === 0 ? 'emerald' : 'gold',
      });
    }

    this.edgePulseColor = 'rgba(242, 207, 126, 0.24)';
    this.edgePulseAlpha = 0.75;
    this.ensureLoop();
  }

  /** Restrained Crimson-Bronze Vignette & Embers on Miss / Overclock Backfire */
  public playBackfirePulse(severe = false): void {
    const { cx, cy } = this.getStageCenter();
    this.edgePulseColor = severe ? 'rgba(224, 62, 82, 0.44)' : 'rgba(204, 76, 88, 0.26)';
    this.edgePulseAlpha = 1.0;

    const emberCount = severe ? 30 : 14;
    for (let i = 0; i < emberCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 150;
      this.sparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 25,
        size: 10 + Math.random() * 12,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.35,
        hue: 'crimson',
      });
    }
    this.ensureLoop();
  }

  /** Shimmering Cyan-Gold Halo on Depth Peel */
  public playPeelShimmer(): void {
    const { cx, cy } = this.getStageCenter();
    this.rings.push({
      x: cx,
      y: cy,
      radius: 24,
      maxRadius: Math.min(this.width, this.height) * 0.26,
      life: 0,
      maxLife: 0.48,
      color: 'rgba(86, 212, 245,',
    });
    this.ensureLoop();
  }

  private ensureLoop(): void {
    if (this.rafId !== 0) return;
    this.lastTs = performance.now();
    const tick = (ts: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (ts - this.lastTs) / 1000));
      this.lastTs = ts;
      const active = this.stepAndDraw(dt);
      if (active) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = 0;
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stepAndDraw(dt: number): boolean {
    const ctx = this.ctx;
    if (!ctx) return false;

    ctx.clearRect(0, 0, this.width, this.height);

    // Edge theater vignette pulse
    if (this.edgePulseAlpha > 0.01) {
      this.edgePulseAlpha = Math.max(0, this.edgePulseAlpha - dt * 1.85);
      const grad = ctx.createRadialGradient(
        this.width * 0.5,
        this.height * 0.5,
        Math.min(this.width, this.height) * 0.28,
        this.width * 0.5,
        this.height * 0.5,
        Math.max(this.width, this.height) * 0.72,
      );
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, this.edgePulseColor);
      ctx.save();
      ctx.globalAlpha = this.edgePulseAlpha;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }

    // Expanding shockwave rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life += dt;
      if (r.life < 0) continue;
      if (r.life >= r.maxLife) {
        this.rings.splice(i, 1);
        continue;
      }
      const t = r.life / r.maxLife;
      const eased = 1 - Math.pow(1 - t, 3);
      const rad = r.radius + (r.maxRadius - r.radius) * eased;
      const alpha = (1 - t) * 0.65;
      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, rad, 0, Math.PI * 2);
      ctx.strokeStyle = `${r.color}${alpha.toFixed(3)})`;
      ctx.lineWidth = Math.max(1.5, 5 * (1 - t));
      ctx.stroke();
      ctx.restore();
    }

    // Smooth radial sparks
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.sparks.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 210 * dt; // gentle gravity
      p.vx *= 0.985;

      const t = p.life / p.maxLife;
      const alpha = Math.sin((1 - t) * Math.PI * 0.5);
      const sz = p.size * (1 - t * 0.45);

      ctx.globalAlpha = alpha;
      if (this.sparkImg) {
        ctx.drawImage(this.sparkImg, p.x - sz * 0.5, p.y - sz * 0.5, sz, sz);
      } else {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 0.5);
        const col =
          p.hue === 'emerald'
            ? '57,212,154'
            : p.hue === 'crimson'
              ? '224,82,99'
              : '245,212,122';
        g.addColorStop(0, `rgba(${col},1)`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    return this.sparks.length > 0 || this.rings.length > 0 || this.edgePulseAlpha > 0.01;
  }

  public dispose(): void {
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    window.removeEventListener('resize', this.handleResize);
  }
}
