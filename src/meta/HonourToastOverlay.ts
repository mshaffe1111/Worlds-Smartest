// ============================================================================
// WORLD'S SMARTEST — Non-Blocking 24K Gold Citation Toast (`#166` §2.2 & `#203` §1)
// Pops cleanly in the safe top-right lane below the broadcast header whenever a
// Trophy, Medal, or Unlockable Reward is earned (`backdrop-filter: none`, zero
// obstruction over Top Nav, Score Bar, 3D Veritas Prism, or Bottom Thumb Arc!).
// ============================================================================

import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import { escapeMetaHtml } from './DiplomaticPassportBook';
import { RARITY_TIER_META, type HonourProgressItem } from './HallOfHonoursSystem';

export interface HonourToastOptions {
  audio?: StudioAudioEngine;
  haptics?: HapticsEngine;
  onInspectHonour?: (honourId: string) => void;
}

function ensureToastStylesInjected(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('ws-honour-toast-styles')) return;

  const style = document.createElement('style');
  style.id = 'ws-honour-toast-styles';
  style.textContent = `
    .ws-honour-toast-host {
      position: fixed;
      top: calc(env(safe-area-inset-top, 0px) + 74px);
      right: max(12px, env(safe-area-inset-right, 12px));
      left: max(12px, env(safe-area-inset-left, 12px));
      transform: none;
      z-index: 95;
      width: auto;
      max-width: 366px;
      margin-left: auto;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      box-sizing: border-box;
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-honour-toast-host {
        top: calc(env(safe-area-inset-top, 0px) + 46px);
        left: auto;
        right: max(12px, env(safe-area-inset-right, 12px));
        transform: none;
        width: min(280px, calc(100vw - 24px));
        max-width: 280px;
      }
      .ws-honour-toast-card {
        min-height: 44px;
        padding: 6px 10px;
        gap: 8px;
      }
    }

    /* Hide rival/actor tell strip cleanly while an Honour citation toast occupies the upper slot (zero text bleed!) */
    body.ws-honour-toast-active .ws-actor-tell-cluster,
    body.ws-honour-toast-active .ws-rival-strip,
    body:has(.ws-honour-toast-card.is-visible) .ws-actor-tell-cluster,
    body:has(.ws-honour-toast-card.is-visible) .ws-rival-strip {
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.12s ease !important;
    }

    .ws-honour-toast-card {
      pointer-events: auto;
      width: 100%;
      box-sizing: border-box;
      min-height: 52px;
      padding: 8px 12px;
      border-radius: 12px;
      background: linear-gradient(165deg, #351d0e 0%, #1d0e06 100%);
      border: 1.5px solid #dfaa44;
      border-left: 4px solid var(--toast-accent, #f2cf7e);
      box-shadow:
        0 14px 34px rgba(0, 0, 0, 0.86),
        inset 0 0 0 1px rgba(232, 197, 116, 0.22);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      opacity: 1;
      animation: wsHonourToastIn 0.24s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .ws-honour-toast-card.is-leaving {
      animation: wsHonourToastOut 0.22s ease-in forwards;
    }

    @keyframes wsHonourToastIn {
      from {
        opacity: 1;
        transform: translateY(-10px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes wsHonourToastOut {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
      }
    }
  `;
  document.head.appendChild(style);
}

export class HonourToastOverlay {
  private readonly options: HonourToastOptions;
  private hostEl: HTMLElement | null = null;
  private queue: HonourProgressItem[] = [];
  private activeTimer: ReturnType<typeof setTimeout> | null = null;
  private showing = false;

  constructor(options: HonourToastOptions = {}) {
    this.options = options;
    ensureToastStylesInjected();
  }

  public enqueue(items: readonly HonourProgressItem[]): void {
    if (!items || items.length === 0 || typeof document === 'undefined') return;
    for (const item of items) {
      if (!this.queue.some((q) => q.def.id === item.def.id)) {
        this.queue.push(item);
      }
    }
    if (!this.showing) {
      this.presentNext();
    }
  }

  private ensureHost(): HTMLElement {
    if (this.hostEl && document.body.contains(this.hostEl)) {
      return this.hostEl;
    }
    const el = document.createElement('div');
    el.className = 'ws-honour-toast-host';
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    this.hostEl = el;
    return el;
  }

  private setBodyToastActive(active: boolean): void {
    if (typeof document === 'undefined' || !document.body) return;
    document.body.classList.toggle('ws-honour-toast-active', active);
  }

  private presentNext(): void {
    const next = this.queue.shift();
    if (!next) {
      this.showing = false;
      this.setBodyToastActive(false);
      return;
    }

    this.showing = true;
    this.setBodyToastActive(true);
    const host = this.ensureHost();
    const tierMeta = RARITY_TIER_META[next.def.tier];

    this.options.haptics?.correctBloom();
    this.options.audio?.playSfx('gold_resonance');

    const card = document.createElement('div');
    card.className = 'ws-honour-toast-card ws-unlock-toast is-visible';
    card.style.setProperty('--toast-accent', tierMeta.colorHex);
    card.innerHTML = `
      <img
        src="${escapeMetaHtml(next.emblemPngUrl)}"
        data-fallback-src="${escapeMetaHtml(next.emblemFallbackDataUri)}"
        alt=""
        style="width:38px;height:38px;object-fit:contain;flex-shrink:0;"
      />
      <div style="min-width:0;flex:1 1 auto;">
        <div style="font-family:var(--font-mono,monospace);font-size:9px;font-weight:800;letter-spacing:0.08em;color:${tierMeta.colorHex};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          TROPHY UNLOCKED · STAGE HONOURS
        </div>
        <div style="font-family:var(--font-display,Georgia,serif);font-size:13px;font-weight:800;color:var(--ivory-primary,#f6f2e9);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${escapeMetaHtml(next.def.title)}
        </div>
        ${
          next.def.reward
            ? `<div style="font-family:var(--font-mono,monospace);font-size:10px;color:var(--emerald-win,#39d49a);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ✦ +${escapeMetaHtml(next.def.reward.rewardLabel)}
              </div>`
            : `<div style="font-size:10.5px;color:var(--ivory-muted,#b8b2a6);line-height:1.22;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${escapeMetaHtml(next.def.description)}
              </div>`
        }
      </div>
    `;

    const img = card.querySelector<HTMLImageElement>('img[data-fallback-src]');
    img?.addEventListener(
      'error',
      () => {
        const fb = img.dataset.fallbackSrc;
        if (fb && img.src !== fb) img.src = fb;
      },
      { once: true },
    );

    const dismiss = (inspect = false) => {
      if (this.activeTimer) {
        clearTimeout(this.activeTimer);
        this.activeTimer = null;
      }
      card.classList.remove('is-visible');
      card.classList.add('is-leaving');
      setTimeout(() => {
        card.remove();
        if (inspect) {
          this.options.onInspectHonour?.(next.def.id);
        }
        this.presentNext();
      }, 220);
    };

    card.addEventListener('click', () => dismiss(true));
    host.appendChild(card);

    this.activeTimer = setTimeout(() => dismiss(false), 3600);
  }

  public dispose(): void {
    if (this.activeTimer) {
      clearTimeout(this.activeTimer);
      this.activeTimer = null;
    }
    this.queue = [];
    this.showing = false;
    this.setBodyToastActive(false);
    if (this.hostEl) {
      this.hostEl.remove();
      this.hostEl = null;
    }
  }
}
