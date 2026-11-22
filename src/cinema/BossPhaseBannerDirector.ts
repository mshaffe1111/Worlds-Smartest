// ============================================================================
// WORLD'S SMARTEST — 3-Phase Country Boss Showdown Broadcast Stinger Director
// Implements PITCH_BIBLE.md §3.4 & Wave-2 Boss Presentation Overhaul (#128):
//  • PHASE I   — SHIELD BREAK (Rapid GAUNTLET_SHATTER Kinetic Blitz)
//  • PHASE II  — HERO ARTIFACT SYNTHESIS (3-Step Chained Deduction on 3D Relic)
//  • PHASE III — SOVEREIGN SUDDEN DEATH (Shared Prism Overclock — Backfire = Defeat!)
// ============================================================================

import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import type { Stage3DDirector } from '../stage3d/Stage3DDirector';
import {
  RELIC_CATALOG,
  type GlobeCountryCode,
  type HeroRelicId,
  type HubId,
} from '../narrative/PassportSystem';
import type { BossPhaseBlueprint } from '../narrative/CampaignCircuitDirector';
import type { CastMemberId } from '../narrative/InkBlackboard';
import {
  resolveCinemaPortraitUrl,
  stripHistoricalYearCommas,
} from './MotionCinemaDirector';

export type BossPhaseNumber = 1 | 2 | 3;

export interface BossPhaseTransitionQuery {
  isBossShowdown: boolean;
  questionIndex: number;
  totalQuestions: number;
  /** Current question's archetype (optional single-item hint). */
  archetype?: string;
  /** Full Boss round archetype sequence (`questions.map(q => q.archetype)`) for exact 1:1 morph sync (#176). */
  archetypes?: readonly string[] | null;
  /** Optional raw questions array (`{ archetype: string }[]`) — auto-extracts `archetypes` if provided. */
  questions?: ReadonlyArray<{ archetype: string }> | null;
  bossPhases?: readonly BossPhaseBlueprint[] | null;
}

export interface Wave2BossPhaseBannerDef {
  phase: BossPhaseNumber | number;
  code: string;
  bannerTitle: string;
  bannerSubtitle: string;
  archetype: string;
  lightingMode: string;
  voiceClipId?: string;
  voiceUrl?: string;
  text?: string;
}

export interface BossPhaseStingerOptions {
  phase: BossPhaseNumber;
  hubId?: HubId | string;
  countryCode?: GlobeCountryCode | string;
  cityName?: string;
  venueName?: string;
  missionTitle?: string;
  heroRelicId?: HeroRelicId | null;
  rivalId?: CastMemberId | string;
  rivalName?: string;
  voiceUrl?: string;
  /** Optional verbatim VO subtitle line (auto-populated on Apex `global` w/ `apex_vance_phase1..3.mp3`). */
  voiceQuote?: string;
  /** Auto-advance duration in ms (defaults to 2250ms; tap/Space/Enter dismisses early). */
  durationMs?: number;
  /** Optional Stage3DDirector hook for automatic lighting & camera trauma sync. */
  stage3d?: Stage3DDirector | null;
  /** Optional callback invoked in addition to resolving the returned Promise. */
  onComplete?: () => void;
}

export interface BossPhaseDescriptor {
  phase: BossPhaseNumber;
  roman: 'I' | 'II' | 'III';
  codeLabel: string;
  headline: string;
  subheadline: string;
  mechanicBadge: string;
  ruleCallout: string;
  accentHex: string;
  secondaryHex: string;
  relicTitle: string | null;
  relicLore: string | null;
}

const HUB_DEFAULT_RELIC: Readonly<Record<string, HeroRelicId>> = {
  ch: 'meridian_astrolabe',
  gb: 'armillary_orrery',
  jp: 'origami_prism',
  br: 'emerald_sphere',
  eg: 'cipher_box',
  is: 'cryo_relay',
  sg: 'council_seal',
  global: 'master_ledger',
};

const APEX_VANCE_PHASE_QUOTES: Readonly<Record<BossPhaseNumber, string>> = {
  1: 'Phase One: Gauntlet Shield Break. Prove your speed matches your conviction before the entire planet.',
  2: 'Phase Two: Master Ledger Synthesis. Three interlocking historical and scientific truths—one single key.',
  3: 'Final Phase: Sovereign Sudden Death. No shields, no redactions—just your mind against the architect of the Meridian.',
};

const RIVAL_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  vance: 'Julian Vance',
  nadia: 'Nadia Al-Mansoor',
  soren: 'Soren "Echo" Kael',
  teo: 'Mateo "Teo" Rojas',
  lindqvist: 'Chancellor Lindqvist',
  tariq: 'Tariq Al-Mansoor',
};

function escapeHtml(text: string): string {
  return stripHistoricalYearCommas(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Pure helper for `SovereignMasterController`: returns `1 | 2 | 3` ONLY when entering
 * a new Boss Showdown phase boundary, and `null` on all other questions.
 * Aligns 1:1 with `ForgeEngine.buildBossShowdownQuestions()` across 5–15 Q Boss Showdowns (#176).
 */
export function resolveBossPhaseTransition(query: BossPhaseTransitionQuery): BossPhaseNumber | null {
  if (!query.isBossShowdown || query.totalQuestions < 3) {
    return null;
  }

  const idx = query.questionIndex;
  const total = query.totalQuestions;

  if (idx === 0) return 1;

  const archList =
    query.archetypes && query.archetypes.length > 0
      ? query.archetypes
      : query.questions && query.questions.length > 0
        ? query.questions.map((q) => q.archetype)
        : null;

  if (archList && archList.length > 0) {
    const heroIdx = archList.indexOf('HERO_ARTIFACT_SYNTHESIS');
    if (heroIdx > 0) {
      if (idx === heroIdx) return 2;
      const lastHeroIdx = archList.lastIndexOf('HERO_ARTIFACT_SYNTHESIS');
      const p3Idx = lastHeroIdx + 1;
      if (p3Idx < total && idx === p3Idx) return 3;
      return null;
    }
  }

  if (query.archetype === 'HERO_ARTIFACT_SYNTHESIS' && idx > 0) {
    return 2;
  }

  // Fallback blueprint / scaled boundary math when archetypes list is omitted
  const defaultP1 = total >= 9 ? 4 : total >= 5 ? 2 : 1;
  const p1Count = query.bossPhases?.[0]?.questionCount ?? defaultP1;
  const p3Start = Math.max(p1Count + 1, total - (query.bossPhases?.[2]?.questionCount ?? 1));

  if (idx === p1Count) return 2;
  if (idx === p3Start) return 3;

  return null;
}

/**
 * Builds rich Sovereign Broadcast metadata for any of the 3 Country Boss Phases.
 */
export function describeBossPhase(opts: BossPhaseStingerOptions): BossPhaseDescriptor {
  const hubKey = (opts.hubId || 'gb').toLowerCase();
  const relicId: HeroRelicId =
    (opts.heroRelicId && RELIC_CATALOG[opts.heroRelicId] ? opts.heroRelicId : null) ??
    HUB_DEFAULT_RELIC[hubKey] ??
    'armillary_orrery';
  const relicMeta = RELIC_CATALOG[relicId];
  const cityUpper = (opts.cityName || relicMeta.cityLabel || 'SOVEREIGN').toUpperCase();

  if (opts.phase === 1) {
    return {
      phase: 1,
      roman: 'I',
      codeLabel: `${cityUpper} BOSS SHOWDOWN · PHASE I OF III`,
      headline: 'PHASE I — SHIELD BREAK',
      subheadline: 'Rapid GAUNTLET_SHATTER Kinetic Blitz',
      mechanicBadge: 'GAUNTLET_SHATTER · KINETIC SURGE',
      ruleCallout:
        'Swipe VERIFY, DEBUNK, or CHALLENGE at high velocity to fracture the Boss barrier plates!',
      accentHex: '#56d4f5',
      secondaryHex: '#f2cf7e',
      relicTitle: `${relicMeta.name} (${relicMeta.cityLabel})`,
      relicLore: null,
    };
  }

  if (opts.phase === 2) {
    return {
      phase: 2,
      roman: 'II',
      codeLabel: `${cityUpper} BOSS SHOWDOWN · PHASE II OF III`,
      headline: 'PHASE II — HERO ARTIFACT SYNTHESIS',
      subheadline: `3-Step Chained Deduction · ${relicMeta.name}`,
      mechanicBadge: '3-STEP BESPOKE 3D RELIC SYNTHESIS',
      ruleCallout:
        'Unlock 3 chained mechanical latches across the bespoke Country Relic to expose its core!',
      accentHex: '#f2cf7e',
      secondaryHex: '#39d49a',
      relicTitle: `${relicMeta.name} · ${relicMeta.venueLabel}`,
      relicLore: relicMeta.hiddenInscription,
    };
  }

  return {
    phase: 3,
    roman: 'III',
    codeLabel: `${cityUpper} BOSS SHOWDOWN · FINAL PHASE III`,
    headline: 'PHASE III — SOVEREIGN SUDDEN DEATH',
    subheadline: 'High-Stakes Shared Prism Overclock Showdown',
    mechanicBadge: 'SHARED PRISM · BACKFIRE = INSTANT DEFEAT!',
    ruleCallout:
      'One giant shared central Prism — hold OVERCLOCK to claim first strike, but Backfire means instant defeat!',
    accentHex: '#e05263',
    secondaryHex: '#fae29c',
    relicTitle: `CLINCHER FOR ${relicMeta.name.toUpperCase()}`,
    relicLore: null,
  };
}

// ============================================================================
// SCOPED BOSS STINGER STYLES (Injected Once, Zero Viewport Clipping)
// ============================================================================

let bossStingerStylesInjected = false;

function ensureBossStingerStyles(): void {
  if (bossStingerStylesInjected || typeof document === 'undefined') return;
  bossStingerStylesInjected = true;

  const style = document.createElement('style');
  style.id = 'ws-boss-phase-banner-styles';
  style.textContent = `
    .ws-boss-stinger-overlay {
      position: fixed;
      inset: 0;
      width: 100%;
      max-width: 100vw;
      height: 100dvh;
      z-index: 88;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: max(14px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) max(14px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
      background: radial-gradient(ellipse at 50% 48%, rgba(6, 10, 19, 0.72) 0%, rgba(4, 6, 12, 0.94) 84%);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      overflow: hidden;
      pointer-events: auto;
      user-select: none;
      -webkit-user-select: none;
      opacity: 0;
      transition: opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ws-boss-stinger-overlay.is-visible {
      opacity: 1;
    }
    .ws-boss-stinger-overlay.is-exiting {
      opacity: 0;
      transition: opacity 0.22s ease-in;
    }
    .ws-boss-stinger-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      pointer-events: none;
      z-index: 1;
    }
    /* Sleek 2026 Frameless Broadcast Title Band (Zero Box-Inside-Box Modal!) */
    .ws-boss-stinger-card {
      position: relative;
      z-index: 2;
      width: min(96vw, 780px);
      max-height: calc(100dvh - 28px);
      overflow-y: auto;
      padding: clamp(20px, 3.4dvh, 34px) clamp(14px, 3vw, 32px);
      border-radius: 0;
      background: linear-gradient(
        180deg,
        rgba(5, 8, 16, 0) 0%,
        rgba(6, 10, 19, 0.84) 16%,
        rgba(6, 10, 19, 0.88) 84%,
        rgba(5, 8, 16, 0) 100%
      );
      border: none;
      box-shadow: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: clamp(8px, 1.35dvh, 14px);
      transform: scale(0.95) translateY(8px);
      transition: transform 0.32s cubic-bezier(0.18, 1.15, 0.32, 1);
    }
    .ws-boss-stinger-card::before,
    .ws-boss-stinger-card::after {
      content: '';
      position: absolute;
      left: 6%;
      right: 6%;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--stinger-accent, #f2cf7e) 50%,
        transparent 100%
      );
      opacity: 0.72;
      pointer-events: none;
    }
    .ws-boss-stinger-card::before {
      top: 0;
    }
    .ws-boss-stinger-card::after {
      bottom: 0;
    }
    .ws-boss-stinger-overlay.is-visible .ws-boss-stinger-card {
      transform: scale(1) translateY(0);
    }
    /* Frameless Editorial Breadcrumb Phase Stepper (Zero Bordered Pills) */
    .ws-boss-phase-steps {
      display: inline-flex;
      align-items: center;
      gap: clamp(10px, 2.2vw, 22px);
      flex-wrap: wrap;
      justify-content: center;
    }
    .ws-boss-step-pill {
      padding: 3px 2px 5px;
      border-radius: 0;
      font-family: var(--font-mono, monospace);
      font-size: clamp(10px, 1.05vw, 11px);
      font-weight: 700;
      letter-spacing: 0.10em;
      border: none;
      border-bottom: 1.5px solid transparent;
      color: var(--ivory-dim, #7d8594);
      background: transparent;
      transition: color 0.2s ease, border-color 0.2s ease;
    }
    .ws-boss-step-pill.is-cleared {
      color: var(--emerald-win, #39d49a);
      border-bottom-color: rgba(57, 212, 154, 0.45);
    }
    .ws-boss-step-pill.is-active {
      color: var(--stinger-accent, #f2cf7e);
      border-bottom: 2px solid var(--stinger-accent, #f2cf7e);
      text-shadow: 0 0 16px var(--stinger-glow, rgba(242, 207, 126, 0.55));
    }
    .ws-boss-headline {
      margin: 0;
      font-family: var(--font-display, Georgia, serif);
      font-weight: 900;
      font-size: clamp(20px, 4.2vw, 38px);
      letter-spacing: 0.09em;
      line-height: 1.14;
      color: var(--ivory-primary, #f6f2e9);
      text-shadow:
        0 4px 26px rgba(0, 0, 0, 0.92),
        0 0 28px var(--stinger-glow, rgba(242, 207, 126, 0.25));
    }
    .ws-boss-subheadline {
      margin: 0;
      font-family: var(--font-display, Georgia, serif);
      font-weight: 700;
      font-size: clamp(12.5px, 1.65vw, 17.5px);
      letter-spacing: 0.07em;
      color: var(--stinger-accent, #f2cf7e);
      text-shadow: 0 2px 14px rgba(0, 0, 0, 0.88);
    }
    /* Frameless Glowing Broadcast Kicker (Zero Boxed Pill!) */
    .ws-boss-mechanic-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 2px 0;
      border-radius: 0;
      font-family: var(--font-mono, monospace);
      font-size: clamp(10px, 1.1vw, 12px);
      font-weight: 800;
      letter-spacing: 0.11em;
      color: var(--stinger-accent, #f2cf7e);
      background: transparent;
      border: none;
      text-shadow: 0 0 16px var(--stinger-glow, rgba(242, 207, 126, 0.45));
    }
    /* Frameless Lower-Third Rival Strip (Alpha-Feathered Portrait, Zero Box!) */
    .ws-boss-rival-strip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 10px 4px 2px;
      border-radius: 0;
      background: transparent;
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.09);
      max-width: min(100%, 560px);
      width: 100%;
    }
    .ws-boss-rival-portrait {
      width: clamp(44px, 7vw, 54px);
      height: clamp(48px, 7.6vw, 58px);
      object-fit: cover;
      object-position: center top;
      flex-shrink: 0;
      border: none;
      border-radius: 0;
      background: transparent;
      -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 72%, transparent 100%);
      mask-image: linear-gradient(180deg, #000 0%, #000 72%, transparent 100%);
      filter: drop-shadow(0 0 10px var(--stinger-glow, rgba(242, 207, 126, 0.30)));
    }
    .ws-boss-progress-track {
      width: min(86vw, 440px);
      height: 2px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.10);
      overflow: hidden;
    }
    .ws-boss-progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--stinger-accent, #f2cf7e), var(--stinger-secondary, #56d4f5));
      transition: width 0.08s linear;
    }
    .ws-boss-engage-btn {
      min-height: 44px;
      min-width: 176px;
      padding: 10px 24px;
    }
    @media (max-width: 560px) {
      .ws-boss-stinger-card {
        padding: 16px 10px;
        gap: 8px;
      }
      .ws-boss-phase-steps {
        gap: 8px 12px;
      }
    }
    @media (max-height: 520px) and (orientation: landscape) {
      .ws-boss-stinger-overlay {
        padding: 6px max(14px, env(safe-area-inset-right, 0px)) 6px max(14px, env(safe-area-inset-left, 0px));
      }
      .ws-boss-stinger-card {
        max-height: calc(100dvh - 12px);
        padding: 10px 18px;
        gap: 5px;
      }
      .ws-boss-headline {
        font-size: clamp(17px, 2.7vw, 24px);
      }
      .ws-boss-rival-strip {
        padding-top: 6px;
      }
      .ws-boss-rival-portrait {
        width: 38px;
        height: 42px;
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// SHARD / SPARK VFX STRUCTS FOR BOSS STINGER CANVAS
// ============================================================================

interface StingerShard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  size: number;
  alpha: number;
  sides: number;
}

export class BossPhaseBannerDirector {
  private readonly audio: StudioAudioEngine;
  private readonly haptics: HapticsEngine;

  private activeOverlay: HTMLElement | null = null;
  private rafId = 0;
  private autoTimer: ReturnType<typeof setTimeout> | null = null;
  private exitTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingCompleteCb: (() => void) | null = null;
  private boundKeyDown: ((ev: KeyboardEvent) => void) | null = null;
  private boundResize: (() => void) | null = null;
  private resolveActivePromise: (() => void) | null = null;
  private wave2Banners = new Map<BossPhaseNumber, Wave2BossPhaseBannerDef>();

  constructor(audio: StudioAudioEngine, haptics: HapticsEngine) {
    this.audio = audio;
    this.haptics = haptics;
    ensureBossStingerStyles();
  }

  /**
   * Optional Wave-2 hook (`narrative_wave2.json` `boss_phase_banners[]`) for verbatim VO/banner sync.
   */
  public ingestWave2Banners(banners?: readonly Wave2BossPhaseBannerDef[] | null): void {
    if (!Array.isArray(banners)) return;
    for (const b of banners) {
      if (b.phase === 1 || b.phase === 2 || b.phase === 3) {
        this.wave2Banners.set(b.phase, b);
      }
    }
  }

  public isActive(): boolean {
    return this.activeOverlay !== null;
  }

  /**
   * Convenience wrapper: checks if `query` hits a Boss Phase boundary (1, 2, or 3)
   * and plays the dramatic stinger only when transitioning into that phase.
   */
  public async playIfPhaseTransition(
    query: BossPhaseTransitionQuery,
    stingerContext: Omit<BossPhaseStingerOptions, 'phase'>,
  ): Promise<BossPhaseNumber | null> {
    const phase = resolveBossPhaseTransition(query);
    if (!phase) return null;
    await this.playPhaseStinger({ ...stingerContext, phase });
    return phase;
  }

  /**
   * Launches the full-stage 60fps broadcast transition stinger for Phase I, II, or III.
   */
  public playPhaseStinger(options: BossPhaseStingerOptions): Promise<void> {
    this.close();
    ensureBossStingerStyles();

    const desc = describeBossPhase(options);
    const isApexGlobal = (options.hubId || '').toLowerCase() === 'global';
    const w2 = this.wave2Banners.get(options.phase);
    const autoApexVo = isApexGlobal
      ? w2?.voiceUrl
        ? w2.voiceUrl.startsWith('./')
          ? w2.voiceUrl
          : `./${w2.voiceUrl.replace(/^\/+/, '')}`
        : `./assets/voice/apex_vance_phase${options.phase}.mp3`
      : '';
    const effectiveVoiceUrl = options.voiceUrl || autoApexVo;
    const effectiveVoiceQuote =
      options.voiceQuote ||
      (isApexGlobal ? w2?.text || APEX_VANCE_PHASE_QUOTES[options.phase] : '');
    if (effectiveVoiceUrl) {
      this.audio.playVoice(effectiveVoiceUrl);
    }
    const durationMs = Math.max(
      900,
      options.durationMs ?? (effectiveVoiceQuote ? 3600 : 2250),
    );
    const rivalId = (options.rivalId || 'vance').toLowerCase();
    const rivalName = options.rivalName || RIVAL_DISPLAY_NAMES[rivalId] || 'City Challenger';
    const rivalPortrait = resolveCinemaPortraitUrl(
      rivalId,
      options.phase === 3 ? 'intense' : 'smirk',
    );

    // Synchronize Stage3D lighting, camera shot & physical Foley/Haptics
    if (options.stage3d) {
      if (options.phase === 1) {
        options.stage3d.setLightingMode('BROADCAST');
        options.stage3d.setCameraShot('GAUNTLET_FOCUS');
        options.stage3d.triggerCameraShake(0.22);
      } else if (options.phase === 2) {
        options.stage3d.setLightingMode('BROADCAST');
        options.stage3d.triggerCameraShake(0.18);
      } else {
        options.stage3d.setLightingMode('TWIST_FRACTURE');
        options.stage3d.setCameraShot('PRISM_STANDARD');
        options.stage3d.triggerCameraShake(0.42);
      }
    }

    if (options.phase === 1) {
      this.audio.playSfx('cutscene_whoosh');
      this.audio.playSfx('glass_shatter');
      this.haptics.shatterPlate();
    } else if (options.phase === 2) {
      this.audio.playSfx('shutter_peel');
      this.audio.playSfx('sightline_snap');
      this.haptics.peel(3);
    } else {
      this.audio.playSfx('vault_thunk');
      this.audio.playSfx('gold_resonance');
      this.haptics.lockThunk();
    }

    return new Promise<void>((resolve) => {
      this.resolveActivePromise = resolve;

      const overlay = document.createElement('div');
      overlay.className = 'ws-boss-stinger-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-label', desc.headline);

      const glowRgba =
        options.phase === 1
          ? 'rgba(86, 212, 245, 0.34)'
          : options.phase === 2
            ? 'rgba(242, 207, 126, 0.34)'
            : 'rgba(224, 82, 99, 0.42)';

      overlay.style.setProperty('--stinger-accent', desc.accentHex);
      overlay.style.setProperty('--stinger-secondary', desc.secondaryHex);
      overlay.style.setProperty('--stinger-glow', glowRgba);

      const step1Class =
        options.phase === 1 ? 'is-active' : 'is-cleared';
      const step2Class =
        options.phase === 2 ? 'is-active' : options.phase > 2 ? 'is-cleared' : '';
      const step3Class = options.phase === 3 ? 'is-active' : '';

      overlay.innerHTML = `
        <canvas class="ws-boss-stinger-canvas" id="ws-boss-stinger-cv"></canvas>

        <div class="ws-boss-stinger-card" id="ws-boss-stinger-card">
          <div class="ws-boss-phase-steps">
            <span class="ws-boss-step-pill ${step1Class}">I · SHIELD BREAK</span>
            <span class="ws-boss-step-pill ${step2Class}">II · RELIC SYNTHESIS</span>
            <span class="ws-boss-step-pill ${step3Class}">III · SUDDEN DEATH</span>
          </div>

          <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.16em;color:var(--ivory-muted);">
            ${escapeHtml(desc.codeLabel)}
          </div>

          <h2 class="ws-boss-headline">${escapeHtml(desc.headline)}</h2>
          <p class="ws-boss-subheadline">${escapeHtml(desc.subheadline)}</p>

          <div class="ws-boss-mechanic-badge">
            <span>⚡</span>
            <span>${escapeHtml(desc.mechanicBadge)}</span>
          </div>

          <p style="margin:2px 0;max-width:580px;font-size:clamp(12.5px,1.35vw,15px);line-height:1.42;color:var(--ivory-primary);">
            ${escapeHtml(desc.ruleCallout)}
          </p>

          <div class="ws-boss-rival-strip">
            <img
              class="ws-boss-rival-portrait"
              src="${escapeHtml(rivalPortrait)}"
              alt="${escapeHtml(rivalName)}"
            />
            <div style="text-align:left;min-width:0;">
              <div style="font-family:var(--font-display);font-size:12px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;">
                VS ${escapeHtml(rivalName.toUpperCase())}
                ${desc.relicTitle ? ` · ${escapeHtml(desc.relicTitle)}` : ''}
              </div>
              ${
                effectiveVoiceQuote
                  ? `<div style="font-size:12px;color:var(--ivory-primary);font-style:italic;margin-top:2px;">“${escapeHtml(effectiveVoiceQuote)}”</div>`
                  : desc.relicLore
                    ? `<div style="font-family:var(--font-mono);font-size:10.5px;color:var(--cyan-clue);">${escapeHtml(desc.relicLore)}</div>`
                    : `<div style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-muted);">${escapeHtml(options.missionTitle || 'City Relic Championship Showdown')}</div>`
              }
            </div>
          </div>

          <div class="ws-boss-progress-track" aria-hidden="true">
            <div class="ws-boss-progress-fill" id="ws-boss-stinger-bar"></div>
          </div>

          <button type="button" class="ws-btn-gold ws-boss-engage-btn" id="ws-boss-engage">
            ENGAGE PHASE ${desc.roman} ▶
          </button>
        </div>
      `;

      document.body.appendChild(overlay);
      this.activeOverlay = overlay;
      requestAnimationFrame(() => overlay.classList.add('is-visible'));

      const canvas = overlay.querySelector<HTMLCanvasElement>('#ws-boss-stinger-cv')!;
      const barFill = overlay.querySelector<HTMLElement>('#ws-boss-stinger-bar')!;
      const engageBtn = overlay.querySelector<HTMLButtonElement>('#ws-boss-engage')!;
      const ctx = canvas.getContext('2d');

      let vw = Math.max(320, window.innerWidth || 1280);
      let vh = Math.max(320, window.innerHeight || 720);

      const syncCanvas = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        vw = Math.max(320, window.innerWidth || 1280);
        vh = Math.max(320, window.innerHeight || 720);
        canvas.width = Math.round(vw * dpr);
        canvas.height = Math.round(vh * dpr);
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      syncCanvas();

      const shards: StingerShard[] = [];
      for (let i = 0; i < 42; i++) {
        const ang = (Math.PI * 2 * i) / 42 + (Math.random() - 0.5) * 0.2;
        const spd = 95 + Math.random() * 240;
        shards.push({
          x: vw * 0.5,
          y: vh * 0.5,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 5.5,
          size: 7 + Math.random() * 14,
          alpha: 0.45 + Math.random() * 0.45,
          sides: options.phase === 1 ? 4 : options.phase === 2 ? 6 : 3,
        });
      }

      const startMs = performance.now();
      let prevMs = startMs;
      let done = false;

      this.pendingCompleteCb = options.onComplete ?? null;

      const finish = (userSkipped = false) => {
        if (done) return;
        done = true;
        if (userSkipped) {
          this.audio.stopVoice();
        }
        overlay.classList.add('is-exiting');
        this.exitTimer = setTimeout(() => {
          this.exitTimer = null;
          if (this.activeOverlay === overlay) {
            this.close();
          }
        }, 180);
      };

      engageBtn.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        finish(true);
      });

      overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay && performance.now() - startMs > 280) {
          this.haptics.uiTap();
          finish(true);
        }
      });

      this.boundResize = () => syncCanvas();
      this.boundKeyDown = (ev: KeyboardEvent) => {
        const activeTag = document.activeElement?.tagName.toUpperCase();
        if (
          activeTag === 'INPUT' ||
          activeTag === 'TEXTAREA' ||
          (document.activeElement as HTMLElement | null)?.isContentEditable
        ) {
          return;
        }
        if (performance.now() - startMs < 220) return;
        if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Escape') {
          ev.preventDefault();
          this.haptics.uiTap();
          finish(true);
        }
      };
      window.addEventListener('resize', this.boundResize, { passive: true });
      window.addEventListener('keydown', this.boundKeyDown);

      this.autoTimer = setTimeout(() => finish(false), durationMs);

      const tick = (nowMs: number) => {
        if (done || this.activeOverlay !== overlay) return;
        this.rafId = requestAnimationFrame(tick);
        if (document.hidden) {
          prevMs = nowMs;
          return;
        }

        const dt = Math.min(0.05, Math.max(0.001, (nowMs - prevMs) / 1000));
        prevMs = nowMs;
        const elapsedMs = nowMs - startMs;
        const elapsedSec = elapsedMs / 1000;
        const pct = Math.min(100, (elapsedMs / durationMs) * 100);
        barFill.style.width = `${pct.toFixed(1)}%`;

        if (!ctx) return;
        ctx.clearRect(0, 0, vw, vh);

        const cx = vw * 0.5;
        const cy = vh * 0.5;
        const minDim = Math.min(vw, vh);

        if (options.phase === 1) {
          // PHASE I: Expanding Cyan Shatter Shockwaves + Crystalline Veritas Shards
          const ringR = 40 + elapsedSec * minDim * 0.34;
          const ringAlpha = Math.max(0, 0.55 - elapsedSec * 0.25);
          ctx.strokeStyle = `rgba(86, 212, 245, ${ringAlpha.toFixed(3)})`;
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.stroke();

          for (const s of shards) {
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.rot += s.vRot * dt;
            const fade = Math.max(0, 1 - elapsedSec * 0.52);
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rot);
            ctx.strokeStyle = `rgba(86, 212, 245, ${(s.alpha * fade).toFixed(3)})`;
            ctx.fillStyle = `rgba(242, 207, 126, ${(s.alpha * fade * 0.24).toFixed(3)})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(0, -s.size);
            ctx.lineTo(s.size * 0.72, 0);
            ctx.lineTo(0, s.size);
            ctx.lineTo(-s.size * 0.72, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        } else if (options.phase === 2) {
          // PHASE II: 3 Counter-Rotating Horological Relic Rings + 3 Golden Latches
          ctx.save();
          ctx.translate(cx, cy);
          const radii = [minDim * 0.28, minDim * 0.35, minDim * 0.42];
          radii.forEach((r, idx) => {
            ctx.save();
            const dir = idx % 2 === 0 ? 1 : -1;
            ctx.rotate(elapsedSec * dir * (0.45 + idx * 0.2));
            ctx.strokeStyle =
              idx === 1 ? 'rgba(57, 212, 154, 0.32)' : 'rgba(242, 207, 126, 0.34)';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([18, 10]);
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();

            // Glowing mechanical latch node
            ctx.setLineDash([]);
            ctx.fillStyle = '#fae29c';
            ctx.beginPath();
            ctx.arc(r, 0, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
          ctx.restore();
        } else {
          // PHASE III: Twist-Fracture Crimson Dual Spotlights + Heartbeat Sudden-Death Pulse
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          for (const srcX of [vw * 0.22, vw * 0.78]) {
            const g = ctx.createLinearGradient(srcX, 0, cx, cy);
            g.addColorStop(0, 'rgba(224, 82, 99, 0.28)');
            g.addColorStop(0.7, 'rgba(242, 207, 126, 0.14)');
            g.addColorStop(1, 'rgba(224, 82, 99, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(srcX - vw * 0.04, 0);
            ctx.lineTo(srcX + vw * 0.04, 0);
            ctx.lineTo(cx + vw * 0.16, vh);
            ctx.lineTo(cx - vw * 0.16, vh);
            ctx.closePath();
            ctx.fill();
          }

          const beat = Math.abs(Math.sin(elapsedSec * 5.2));
          ctx.strokeStyle = `rgba(224, 82, 99, ${(0.18 + beat * 0.34).toFixed(3)})`;
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.arc(cx, cy, minDim * (0.26 + beat * 0.08), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      };

      this.rafId = requestAnimationFrame(tick);
    });
  }

  public close(): void {
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    if (this.autoTimer) {
      clearTimeout(this.autoTimer);
      this.autoTimer = null;
    }
    if (this.exitTimer) {
      clearTimeout(this.exitTimer);
      this.exitTimer = null;
    }
    if (this.boundResize) {
      window.removeEventListener('resize', this.boundResize);
      this.boundResize = null;
    }
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
      this.boundKeyDown = null;
    }
    if (this.activeOverlay) {
      this.activeOverlay.remove();
      this.activeOverlay = null;
    }
    const cb = this.pendingCompleteCb;
    this.pendingCompleteCb = null;
    if (this.resolveActivePromise) {
      const res = this.resolveActivePromise;
      this.resolveActivePromise = null;
      res();
    }
    cb?.();
  }

  public dispose(): void {
    this.audio.stopVoice();
    this.close();
  }
}
