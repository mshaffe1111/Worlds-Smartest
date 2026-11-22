// ============================================================================
// WORLD'S SMARTEST — 60fps HTML5 WebGL2 / 2D Canvas Motion-Cinema Director
// Implements PITCH_BIBLE.md §2.2, §2.3 & Wave-2 Motion-Cinema Overhaul (#128):
//  • Multi-plane depth parallax (WebGL2 2.5D displacement shader + 2D fallback)
//  • Smooth cubic Ken-Burns pan/zoom curves + per-beat rack-focus impulse
//  • Prologue Encrypted Black-Glass Diplomatic Summons cold-open sequence
//  • Anamorphic 2.39:1 cinema letterbox framing (zero viewport clipping)
//  • 6 bespoke 60fps procedural weather systems:
//      - alpine_snow (frost crystal vignette + 3-depth snow + lamp motes)
//      - london_rain (rotunda downpour + refractive sliding glass droplets)
//      - neon_rain   (Shibuya rain + cyan/amber/magenta anamorphic bokeh)
//      - desert_dust (volumetric Giza oculus god-rays + illuminated dust)
//      - uv_storm    (monsoon rain + forked lightning flashes + UV alarm)
//      - ocean_mist  (crashing sea spray + twin sweeping Crown spotlights)
//  • Synced neural VO playback (StudioAudioEngine), dual-buffered portrait
//    cutout expression cross-dissolves, word-by-word cinema typography,
//    and instant NEXT BEAT / SKIP SCENE controls (>= 44px touch targets).
// ============================================================================

import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import type { ActCutsceneSpec } from '../narrative/CampaignCircuitDirector';
import type { Stage3DDirector } from '../stage3d/Stage3DDirector';

export type WeatherFxPreset =
  | 'alpine_snow'
  | 'london_rain'
  | 'neon_rain'
  | 'desert_dust'
  | 'uv_storm'
  | 'ocean_mist';

/** Legacy snake_case line shape compatible 1:1 with `src/ui/CutscenePlayer.ts`. */
export interface CutsceneLineItem {
  id: string;
  speaker: string;
  speaker_name: string;
  expression?: string;
  voice_clip?: string;
  text: string;
}

/** Legacy snake_case cutscene shape compatible 1:1 with `src/ui/CutscenePlayer.ts`. */
export interface LegacyCutsceneSpec {
  id: string;
  act_index?: number;
  title: string;
  location?: string;
  image: string;
  weather_fx?: WeatherFxPreset | string;
  ken_burns?: {
    start_scale?: number;
    end_scale?: number;
    pan_x?: number;
    pan_y?: number;
  };
  lines: CutsceneLineItem[];
}

export type MotionCutsceneInput = ActCutsceneSpec | LegacyCutsceneSpec;

export interface MotionPlayOptions {
  /** Force or skip the 1.85s Encrypted Black-Glass Diplomatic Summons intro. */
  showPrologueSummons?: boolean;
  /** Optional Stage3DDirector auto-paused while full-screen opaque cinema is active (#154 Pillar 3). */
  stage3d?: Stage3DDirector | null;
  /** Optional hook fired whenever a beat starts speaking. */
  onBeatChanged?: (beatIndex: number, totalBeats: number, speakerId: string) => void;
}

interface NormalizedBeat {
  id: string;
  speakerId: string;
  speakerName: string;
  expression: string;
  portraitUrl: string;
  voiceUrl: string;
  text: string;
}

interface NormalizedCutscene {
  id: string;
  actIndex: number;
  title: string;
  location: string;
  imageUrl: string;
  weatherFx: WeatherFxPreset;
  kenBurns: {
    startScale: number;
    endScale: number;
    panX: number;
    panY: number;
  };
  beats: NormalizedBeat[];
}

// ============================================================================
// CANONICAL 6-ACT MOTION CUTSCENE REGISTRY (Fallback & Direct Trigger Ready)
// ============================================================================

export const CANONICAL_ACT_CUTSCENES: Readonly<Record<string, LegacyCutsceneSpec>> = {
  act0_invitation: {
    id: 'act0_invitation',
    act_index: 0,
    title: 'ACT 0 · THE BLACK-GLASS SUMMONS',
    location: 'Geneva, Switzerland · 23:42 CET',
    image: './assets/cutscenes/act0_invitation.jpg',
    weather_fx: 'alpine_snow',
    ken_burns: { start_scale: 1.04, end_scale: 1.14, pan_x: 0.03, pan_y: -0.02 },
    lines: [
      {
        id: 'cutscene_act0_1',
        speaker: 'vance',
        speaker_name: 'Julian Vance',
        expression: 'neutral',
        voice_clip: './assets/voice/cutscene_act0_1.mp3',
        text: 'Midnight over Lake Geneva. Four hundred thousand minds entered the cipher—only one unlocked the door.',
      },
      {
        id: 'cutscene_act0_2',
        speaker: 'vance',
        speaker_name: 'Julian Vance',
        expression: 'intense',
        voice_clip: './assets/voice/cutscene_act0_2.mp3',
        text: 'Eight cities. Forty rounds. One hundred million dollars—and the lone human veto key over The Ledger.',
      },
      {
        id: 'cutscene_act0_3',
        speaker: 'teo',
        speaker_name: "Mateo 'Teo' Rojas",
        expression: 'intense',
        voice_clip: './assets/voice/cutscene_act0_3.mp3',
        text: "Don't trust the cameras, rookie. The last person who won this chair vanished in 2019.",
      },
    ],
  },
  act1_london_leak: {
    id: 'act1_london_leak',
    act_index: 1,
    title: 'ACT I · GLASS OVER ASHES',
    location: 'London, United Kingdom · The Sovereign Rotunda',
    image: './assets/cutscenes/act1_london_leak.jpg',
    weather_fx: 'london_rain',
    ken_burns: { start_scale: 1.05, end_scale: 1.15, pan_x: -0.03, pan_y: -0.01 },
    lines: [
      {
        id: 'cutscene_act1_1',
        speaker: 'nadia',
        speaker_name: 'Nadia Al-Mansoor',
        expression: 'neutral',
        voice_clip: './assets/voice/cutscene_act1_1.mp3',
        text: 'Welcome to London. Every answer in this rotunda goes live to two billion screens.',
      },
      {
        id: 'cutscene_act1_2',
        speaker: 'lindqvist',
        speaker_name: 'Chancellor Ingrid Lindqvist',
        expression: 'neutral',
        voice_clip: './assets/voice/cutscene_act1_2.mp3',
        text: 'The Council prefers predictable champions. Step outside the corridor, and we can discuss your future.',
      },
      {
        id: 'cutscene_act1_3',
        speaker: 'teo',
        speaker_name: "Mateo 'Teo' Rojas",
        expression: 'intense',
        voice_clip: './assets/voice/cutscene_act1_3.mp3',
        text: "I pulled the hidden signal logs. Someone fed encrypted answers straight into a contender's earpiece.",
      },
    ],
  },
  act2_tokyo_confrontation: {
    id: 'act2_tokyo_confrontation',
    act_index: 2,
    title: 'ACT II · SEVENTY FLOORS IN NEON RAIN',
    location: 'Tokyo, Japan · The Shinkansen Sky Pavilion',
    image: './assets/cutscenes/act2_tokyo_confrontation.jpg',
    weather_fx: 'neon_rain',
    ken_burns: { start_scale: 1.06, end_scale: 1.15, pan_x: 0.03, pan_y: 0.02 },
    lines: [
      {
        id: 'cutscene_act2_1',
        speaker: 'soren',
        speaker_name: "Soren 'Echo' Kael",
        expression: 'smirk',
        voice_clip: './assets/voice/cutscene_act2_1.mp3',
        text: 'Seventy floors above Shibuya, friend—where every heartbeat trades like a futures contract.',
      },
      {
        id: 'cutscene_act2_2',
        speaker: 'soren',
        speaker_name: "Soren 'Echo' Kael",
        expression: 'smirk',
        voice_clip: './assets/voice/cutscene_act2_2.mp3',
        text: "Think you're playing a quiz show? Half the syndicate already bet your streak breaks tonight.",
      },
      {
        id: 'cutscene_act2_3',
        speaker: 'vance',
        speaker_name: 'Julian Vance',
        expression: 'intense',
        voice_clip: './assets/voice/cutscene_act2_3.mp3',
        text: 'Soren Kael reads probabilities like oxygen. Outthink the house—or become its cautionary tale.',
      },
    ],
  },
  act3_cairo_vault: {
    id: 'act3_cairo_vault',
    act_index: 3,
    title: 'ACT III · MERIDIAN ZERO',
    location: 'Giza Plateau, Egypt · 38 Meters Below the Solar Hall',
    image: './assets/cutscenes/act3_cairo_vault.jpg',
    weather_fx: 'desert_dust',
    ken_burns: { start_scale: 1.05, end_scale: 1.16, pan_x: -0.02, pan_y: 0.02 },
    lines: [
      {
        id: 'cutscene_act3_1',
        speaker: 'teo',
        speaker_name: "Mateo 'Teo' Rojas",
        expression: 'intense',
        voice_clip: './assets/voice/cutscene_act3_1.mp3',
        text: "We cracked the Cairo vault. Trial Zero wasn't a rehearsal—it was a cover-up.",
      },
      {
        id: 'cutscene_act3_2',
        speaker: 'nadia',
        speaker_name: 'Nadia Al-Mansoor',
        expression: 'shocked',
        voice_clip: './assets/voice/cutscene_act3_2.mp3',
        text: "That signature on the dossier... that's Tariq. My brother didn't walk away. They erased him.",
      },
      {
        id: 'cutscene_act3_3',
        speaker: 'vance',
        speaker_name: 'Julian Vance',
        expression: 'intense',
        voice_clip: './assets/voice/cutscene_act3_3.mp3',
        text: 'Careful what ghosts you exhume in the desert. The Council is already listening.',
      },
    ],
  },
  act4_singapore_betrayal: {
    id: 'act4_singapore_betrayal',
    act_index: 4,
    title: 'ACT IV · THE KNIFE ON THE SKY-BRIDGE',
    location: 'Singapore · 90 Floors Above The Ledger Core',
    image: './assets/cutscenes/act4_singapore_betrayal.jpg',
    weather_fx: 'uv_storm',
    ken_burns: { start_scale: 1.04, end_scale: 1.15, pan_x: 0.02, pan_y: -0.02 },
    lines: [
      {
        id: 'cutscene_act4_1',
        speaker: 'tariq',
        speaker_name: 'Tariq Al-Mansoor',
        expression: 'neutral',
        voice_clip: './assets/voice/cutscene_act4_1.mp3',
        text: 'I stayed in the shadows in Reykjavik so you could carry the ledger key onto the world stage.',
      },
      {
        id: 'cutscene_act4_2',
        speaker: 'lindqvist',
        speaker_name: 'Chancellor Ingrid Lindqvist',
        expression: 'neutral',
        voice_clip: './assets/voice/cutscene_act4_2.mp3',
        text: 'Enough theater. Cut their feed and lock the vault—no outsider dictates terms to the World Council.',
      },
      {
        id: 'cutscene_act4_3',
        speaker: 'soren',
        speaker_name: "Soren 'Echo' Kael",
        expression: 'smirk',
        voice_clip: './assets/voice/cutscene_act4_3.mp3',
        text: "Plot twist, friend. Even a gambler knows when the house is burning down. I'm betting on you.",
      },
    ],
  },
  act5_apex_finale: {
    id: 'act5_apex_finale',
    act_index: 5,
    title: 'ACT V · THE APEX FORUM',
    location: 'International Waters · Two Billion Live Witnesses',
    image: './assets/cutscenes/act5_apex_finale.jpg',
    weather_fx: 'ocean_mist',
    ken_burns: { start_scale: 1.03, end_scale: 1.14, pan_x: 0.0, pan_y: -0.02 },
    lines: [
      {
        id: 'cutscene_act5_1',
        speaker: 'vance',
        speaker_name: 'Julian Vance',
        expression: 'intense',
        voice_clip: './assets/voice/cutscene_act5_1.mp3',
        text: 'The Apex Forum. Two billion witnesses watching every breath. No lifelines left to hide behind.',
      },
      {
        id: 'cutscene_act5_2',
        speaker: 'nadia',
        speaker_name: 'Nadia Al-Mansoor',
        expression: 'neutral',
        voice_clip: './assets/voice/cutscene_act5_2.mp3',
        text: 'For Tariq—and for everyone they tried to silence. Beat them clean, in front of the whole world.',
      },
      {
        id: 'cutscene_act5_3',
        speaker: 'vance',
        speaker_name: 'Julian Vance',
        expression: 'intense',
        voice_clip: './assets/voice/cutscene_act5_3.mp3',
        text: 'Take the crown, claim the veto key—and decide who the sharpest mind on Earth answers to.',
      },
    ],
  },
};

// ============================================================================
// ASSET & PORTRAIT RESOLUTION HELPERS
// ============================================================================

function toWebAssetUrl(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed.endsWith('.ogg')) return '';
  if (trimmed.startsWith('res://')) return `./${trimmed.slice('res://'.length)}`;
  if (trimmed.startsWith('/assets/')) return `.${trimmed}`;
  if (trimmed.startsWith('assets/')) return `./${trimmed}`;
  return trimmed;
}

export function resolveCinemaPortraitUrl(actorId: string, expression = 'neutral'): string {
  const id = (actorId || 'vance').toLowerCase();
  const expr = (expression || 'neutral').toLowerCase();
  if (id === 'vance' && (expr === 'intense' || expr === 'shocked' || expr === 'tense')) {
    return './assets/portraits_cutout/vance_intense.png';
  }
  if (id === 'nadia' && (expr === 'shocked' || expr === 'rattled')) {
    return './assets/portraits_cutout/nadia_shocked.png';
  }
  if (id === 'soren' && expr === 'smirk') {
    return './assets/portraits_cutout/soren_smirk.png';
  }
  if (id === 'teo' && (expr === 'intense' || expr === 'shocked' || expr === 'tense')) {
    return './assets/portraits_cutout/teo_intense.png';
  }
  const validActors = new Set(['vance', 'nadia', 'soren', 'teo', 'lindqvist', 'tariq']);
  const safeActor = validActors.has(id) ? id : 'vance';
  return `./assets/portraits_cutout/${safeActor}.png`;
}

function inferWeatherPreset(cutsceneId: string, explicit?: string): WeatherFxPreset {
  const raw = (explicit || '').toLowerCase();
  if (
    raw === 'alpine_snow' ||
    raw === 'london_rain' ||
    raw === 'neon_rain' ||
    raw === 'desert_dust' ||
    raw === 'uv_storm' ||
    raw === 'ocean_mist'
  ) {
    return raw;
  }
  const id = cutsceneId.toLowerCase();
  if (id.includes('act1') || id.includes('london')) return 'london_rain';
  if (id.includes('act2') || id.includes('tokyo')) return 'neon_rain';
  if (id.includes('act3') || id.includes('cairo')) return 'desert_dust';
  if (id.includes('act4') || id.includes('singapore')) return 'uv_storm';
  if (id.includes('act5') || id.includes('apex') || id.includes('finale')) return 'ocean_mist';
  return 'alpine_snow';
}

/**
 * Strips stray thousands commas from 4-digit historical years (`1,984` -> `1984`,
 * `1,863 CE` -> `1863 CE`, `(2,019)` -> `(2019)`, `1,980s` -> `1980s`) while
 * preserving scores, currency, and large counts (`+1,500 PTS`, `400,000`, `$1,200`).
 */
export function stripHistoricalYearCommas(text: string): string {
  if (!text || !text.includes(',')) return text;
  let out = text;
  // 1) Explicit year ranges (`1,914–1,918`, `1914–1,918`, `1,914–1918`), decades (`1,980s`), and era suffixes (`1,864 CE`)
  out = out.replace(/(?<![\d,$+])([12]),(\d{3})(\s*[–—-]\s*)([12]),(\d{3})(?!\d)/g, '$1$2$3$4$5');
  out = out.replace(/(?<![\d,$+])([12]\d{3}\s*[–—-]\s*)([12]),(\d{3})(?!\d)/g, '$1$2$3');
  out = out.replace(
    /(?<![\d,$+])([12]),(\d{3})(?='?s\b|\s*(?:CE|BCE|AD|BC)\b|\s*[–—-]\s*[12]\d{3}\b)/gi,
    '$1$2',
  );
  // 2) Parenthetical / bracketed standalone 4-digit years: `(1,984)`, `[2,026]`
  out = out.replace(/([(\[])([12]),(\d{3})([)\]])/g, '$1$2$3$4');
  // 3) Prepositional / temporal / historical year lead-ins: `in 1,984`, `since 2,019`, `Missing 2,019`
  out = out.replace(
    /\b(in|of|from|since|circa|c\.|until|by|year|years|around|during|before|after|between|to|through|founded|established|born|died|vanished|missing|trial|act|season|summer|winter|spring|autumn|fall|january|february|march|april|may|june|july|august|september|october|november|december)\s+([12]),(\d{3})(?!\d|\s*(?:pts|points|million|billion|thousand|dollars|usd|eur|chf|km|mi|ft|kg|lbs|people|minds|screens|witnesses)\b)/gi,
    '$1 $2$3',
  );
  return out;
}

function escapeHtml(text: string): string {
  return stripHistoricalYearCommas(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeCutsceneInput(raw: MotionCutsceneInput): NormalizedCutscene {
  const isActSpec = 'imageUrl' in raw;
  const id = raw.id || 'act0_invitation';
  const fallback = CANONICAL_ACT_CUTSCENES[id];

  if (isActSpec) {
    const act = raw as ActCutsceneSpec;
    return {
      id: act.id,
      actIndex: act.actIndex ?? 0,
      title: act.title,
      location: act.location || fallback?.location || '',
      imageUrl: toWebAssetUrl(act.imageUrl) || fallback?.image || './assets/cutscenes/act0_invitation.jpg',
      weatherFx: inferWeatherPreset(act.id, act.weatherFx),
      kenBurns: {
        startScale: act.kenBurns?.startScale ?? 1.04,
        endScale: act.kenBurns?.endScale ?? 1.14,
        panX: act.kenBurns?.panX ?? 0.025,
        panY: act.kenBurns?.panY ?? -0.02,
      },
      beats: (act.lines || []).map((ln) => ({
        id: ln.id,
        speakerId: ln.speakerId,
        speakerName: ln.speakerName,
        expression: ln.expression || 'neutral',
        portraitUrl: toWebAssetUrl(ln.portraitUrl) || resolveCinemaPortraitUrl(ln.speakerId, ln.expression),
        voiceUrl: toWebAssetUrl(ln.voiceUrl),
        text: ln.text,
      })),
    };
  }

  const leg = raw as LegacyCutsceneSpec;
  return {
    id: leg.id,
    actIndex: leg.act_index ?? fallback?.act_index ?? 0,
    title: leg.title,
    location: leg.location ?? fallback?.location ?? '',
    imageUrl: toWebAssetUrl(leg.image) || fallback?.image || './assets/cutscenes/act0_invitation.jpg',
    weatherFx: inferWeatherPreset(leg.id, leg.weather_fx ?? fallback?.weather_fx),
    kenBurns: {
      startScale: leg.ken_burns?.start_scale ?? fallback?.ken_burns?.start_scale ?? 1.04,
      endScale: leg.ken_burns?.end_scale ?? fallback?.ken_burns?.end_scale ?? 1.14,
      panX: leg.ken_burns?.pan_x ?? fallback?.ken_burns?.pan_x ?? 0.025,
      panY: leg.ken_burns?.pan_y ?? fallback?.ken_burns?.pan_y ?? -0.02,
    },
    beats: (leg.lines || []).map((ln) => ({
      id: ln.id,
      speakerId: ln.speaker,
      speakerName: ln.speaker_name,
      expression: ln.expression || 'neutral',
      portraitUrl: resolveCinemaPortraitUrl(ln.speaker, ln.expression),
      voiceUrl: toWebAssetUrl(ln.voice_clip),
      text: ln.text,
    })),
  };
}

// ============================================================================
// SCOPED ANAMORPHIC MOTION-CINEMA STYLES (Injected Once, Zero Cropping)
// ============================================================================

let cinemaStylesInjected = false;

export function ensureMotionCinemaStyles(): void {
  if (cinemaStylesInjected || typeof document === 'undefined') return;
  cinemaStylesInjected = true;

  const style = document.createElement('style');
  style.id = 'ws-motion-cinema-styles';
  style.textContent = `
    .ws-mc-overlay {
      position: fixed;
      inset: 0;
      width: 100%;
      max-width: 100vw;
      height: 100dvh;
      z-index: 90;
      background: #04060b;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      pointer-events: auto;
      user-select: none;
      -webkit-user-select: none;
      opacity: 0;
      transition: opacity 0.34s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ws-mc-overlay.is-mounted {
      opacity: 1;
    }
    .ws-mc-stage-viewport {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 1;
    }
    .ws-mc-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      pointer-events: none;
    }
    /* Anamorphic 2.39:1 Sleek Frameless Cinema Scrims (Zero Boxy Frames!) */
    .ws-mc-letterbox-top,
    .ws-mc-letterbox-bottom {
      position: relative;
      z-index: 4;
      width: 100%;
      flex-shrink: 0;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      transition: transform 0.52s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ws-mc-letterbox-top {
      padding: max(10px, env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) clamp(14px, 2.2dvh, 22px) max(16px, env(safe-area-inset-left, 0px));
      background: linear-gradient(180deg, rgba(4, 6, 11, 0.90) 0%, rgba(5, 8, 15, 0.54) 64%, rgba(5, 8, 15, 0) 100%);
      border: none;
      box-shadow: none;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .ws-mc-letterbox-top .ws-chyron {
      flex: 1 1 auto;
      min-width: 0;
      max-width: 100%;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0;
      background: transparent !important;
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      overflow: hidden;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9);
    }
    .ws-mc-letterbox-top .ws-chyron-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.11em;
    }
    .ws-mc-letterbox-top .ws-chyron-sub {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 0.78;
    }
    .ws-mc-letterbox-bottom {
      background: linear-gradient(180deg, rgba(4, 6, 11, 0) 0%, rgba(5, 8, 15, 0.70) 20%, rgba(4, 7, 13, 0.94) 56%, rgba(4, 6, 11, 0.99) 100%);
      padding: clamp(22px, 3.2dvh, 36px) max(16px, env(safe-area-inset-right, 0px)) max(12px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
    }
    .ws-mc-deck {
      position: relative;
      width: 100%;
      max-width: 920px;
      margin: 0 auto;
      padding: clamp(12px, 1.8dvh, 18px) clamp(2px, 1vw, 8px) 0;
      border-radius: 0;
      background: transparent;
      border: none;
      box-shadow: none;
      display: flex;
      flex-direction: column;
      gap: clamp(8px, 1.3dvh, 12px);
    }
    /* Signature 1px champagne-gold floating top hairline (zero closed box!) */
    .ws-mc-deck::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--mc-accent, rgba(232, 197, 116, 0.56)) 16%,
        var(--mc-accent, rgba(232, 197, 116, 0.56)) 84%,
        transparent 100%
      );
      pointer-events: none;
    }
    .ws-mc-dialogue-row {
      display: flex;
      align-items: flex-end;
      gap: clamp(10px, 2vw, 20px);
      min-width: 0;
    }
    /* Frameless Hades-style alpha-feathered portrait stage (zero picture frame box!) */
    .ws-mc-portrait-frame {
      position: relative;
      width: clamp(66px, 13vw, 96px);
      height: clamp(74px, 15vw, 108px);
      border-radius: 0;
      flex-shrink: 0;
      overflow: hidden;
      background: radial-gradient(circle at 50% 42%, rgba(242, 207, 126, 0.14) 0%, rgba(8, 12, 20, 0) 72%);
      border: none;
      box-shadow: none;
      -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 72%, transparent 100%);
      mask-image: linear-gradient(180deg, #000 0%, #000 72%, transparent 100%);
      transition: background 0.24s ease, filter 0.24s ease;
    }
    .ws-mc-portrait-frame.is-speaking {
      background: radial-gradient(
        circle at 50% 38%,
        rgba(242, 207, 126, 0.30) 0%,
        rgba(242, 207, 126, 0.08) 50%,
        transparent 76%
      );
      filter: drop-shadow(0 0 12px rgba(242, 207, 126, 0.28));
    }
    .ws-mc-portrait-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      opacity: 0;
      transform: scale(1.02);
      transition: opacity 0.28s ease, transform 0.38s ease;
      will-change: opacity, transform;
    }
    .ws-mc-portrait-img.is-visible {
      opacity: 1;
    }
    .ws-mc-copy-col {
      flex: 1 1 auto;
      min-width: 0;
      cursor: pointer;
    }
    .ws-mc-meta-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 4px 10px;
    }
    .ws-mc-speaker-group {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .ws-mc-speaker-name {
      font-family: var(--font-display, Georgia, serif);
      font-weight: 800;
      font-size: clamp(12.5px, 1.4vw, 16px);
      letter-spacing: 0.10em;
      color: var(--mc-accent, var(--gold-bright, #f2cf7e));
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.85);
    }
    /* Frameless editorial expression micro-tag (zero pill border box!) */
    .ws-mc-expr-badge {
      padding: 0 0 0 8px;
      border-radius: 0;
      font-family: var(--font-mono, monospace);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: var(--cyan-clue, #56d4f5);
      background: transparent;
      border: none;
      border-left: 1px solid rgba(232, 197, 116, 0.30);
      opacity: 0.9;
    }
    .ws-mc-voice-wave {
      display: inline-flex;
      align-items: flex-end;
      gap: 2px;
      height: 12px;
      opacity: 0.28;
      transition: opacity 0.18s ease;
    }
    .ws-mc-voice-wave.is-active {
      opacity: 1;
    }
    .ws-mc-voice-bar {
      width: 2px;
      height: 4px;
      border-radius: 2px;
      background: var(--mc-accent, var(--gold-bright, #f2cf7e));
      transition: height 0.08s ease;
    }
    .ws-mc-line-text {
      margin: 6px 0 0;
      font-family: var(--font-sans, sans-serif);
      font-size: clamp(14px, 1.55vw, 18.5px);
      line-height: 1.48;
      color: var(--ivory-primary, #f6f2e9);
      font-weight: 500;
      min-height: 2.8em;
      text-shadow: 0 2px 14px rgba(0, 0, 0, 0.90);
    }
    .ws-mc-word {
      display: inline-block;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ws-mc-word.is-revealed {
      opacity: 1;
      transform: translateY(0);
    }
    .ws-mc-controls-row {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-top: 4px;
    }
    .ws-mc-beat-pips {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .ws-mc-pip {
      width: 18px;
      height: 2px;
      border-radius: 999px;
      background: rgba(246, 242, 233, 0.20);
      transition: width 0.24s ease, background 0.24s ease;
    }
    .ws-mc-pip.is-done {
      background: rgba(232, 197, 116, 0.52);
    }
    .ws-mc-pip.is-current {
      width: 34px;
      background: var(--mc-accent, var(--gold-bright, #f2cf7e));
      box-shadow: 0 0 10px rgba(242, 207, 126, 0.58);
    }
    /* Sleek frameless floating editorial skip trigger (>= 44px touch target) */
    .ws-mc-btn-skip {
      min-height: 44px;
      min-width: 44px;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(6, 10, 18, 0.52);
      border: none;
      box-shadow: inset 0 -1px 0 rgba(232, 197, 116, 0.38);
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-mono, monospace);
      font-size: clamp(10.5px, 1vw, 12px);
      font-weight: 700;
      letter-spacing: 0.08em;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      white-space: nowrap;
      transition: color 0.16s ease, background 0.16s ease, box-shadow 0.16s ease;
    }
    .ws-mc-btn-skip:hover {
      color: var(--gold-bright, #f2cf7e);
      background: rgba(16, 22, 36, 0.72);
      box-shadow: inset 0 -1px 0 rgba(242, 207, 126, 0.85);
    }
    .ws-mc-btn-next {
      min-height: 44px;
      min-width: 132px;
      padding: 10px 22px;
      flex-shrink: 0;
    }
    /* Encrypted Black-Glass Diplomatic Summons — Frameless Floating Title Card */
    .ws-mc-summons-card {
      position: absolute;
      inset: 0;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: max(20px, env(safe-area-inset-top, 0px)) 20px max(20px, env(safe-area-inset-bottom, 0px));
      background: radial-gradient(circle at 50% 48%, rgba(12, 17, 29, 0.88) 0%, rgba(4, 6, 11, 0.98) 76%);
      transition: opacity 0.48s cubic-bezier(0.22, 1, 0.36, 1), transform 0.52s cubic-bezier(0.22, 1, 0.36, 1);
      pointer-events: auto;
      cursor: pointer;
    }
    .ws-mc-summons-card.is-dissolving {
      opacity: 0;
      transform: scale(1.06);
      pointer-events: none;
    }
    .ws-mc-summons-slab {
      position: relative;
      width: min(92vw, 560px);
      padding: clamp(22px, 3.8dvh, 36px) clamp(12px, 3vw, 28px);
      border-radius: 0;
      background: linear-gradient(180deg, rgba(10, 14, 24, 0) 0%, rgba(8, 12, 22, 0.72) 22%, rgba(8, 12, 22, 0.72) 78%, rgba(10, 14, 24, 0) 100%);
      border: none;
      box-shadow: none;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .ws-mc-summons-slab::before,
    .ws-mc-summons-slab::after {
      content: '';
      position: absolute;
      left: 8%;
      right: 8%;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(242, 207, 126, 0.65) 50%, transparent 100%);
      pointer-events: none;
    }
    .ws-mc-summons-slab::before {
      top: 0;
    }
    .ws-mc-summons-slab::after {
      bottom: 0;
    }
    @media (max-width: 560px) {
      .ws-mc-letterbox-top {
        padding: max(8px, env(safe-area-inset-top, 0px)) 12px 12px 12px;
      }
      .ws-mc-letterbox-top .ws-chyron-sub {
        display: none;
      }
      .ws-mc-letterbox-bottom {
        padding: 20px 12px max(10px, env(safe-area-inset-bottom, 0px)) 12px;
      }
      .ws-mc-dialogue-row {
        align-items: flex-start;
        gap: 10px;
      }
      .ws-mc-portrait-frame {
        width: 62px;
        height: 70px;
      }
      .ws-mc-line-text {
        min-height: 3.2em;
        font-size: 14px;
        line-height: 1.44;
      }
    }
    @media (max-height: 520px) and (orientation: landscape) {
      .ws-mc-letterbox-top {
        padding: 6px max(14px, env(safe-area-inset-right, 0px)) 8px max(14px, env(safe-area-inset-left, 0px));
      }
      .ws-mc-letterbox-bottom {
        padding: 12px max(14px, env(safe-area-inset-right, 0px)) 6px max(14px, env(safe-area-inset-left, 0px));
      }
      .ws-mc-deck {
        padding: 8px 4px 0;
        gap: 5px;
      }
      .ws-mc-portrait-frame {
        width: 50px;
        height: 54px;
      }
      .ws-mc-line-text {
        min-height: 1.7em;
        font-size: 13px;
        line-height: 1.36;
        margin-top: 3px;
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// WEBGL2 2.5D MULTI-PLANE DEPTH PARALLAX SHADER ENGINE
// ============================================================================

const PARALLAX_VERT_SHADER = `#version 300 es
precision highp float;
const vec2 POS[4] = vec2[4](
  vec2(-1.0, -1.0),
  vec2( 1.0, -1.0),
  vec2(-1.0,  1.0),
  vec2( 1.0,  1.0)
);
const vec2 UV[4] = vec2[4](
  vec2(0.0, 1.0),
  vec2(1.0, 1.0),
  vec2(0.0, 0.0),
  vec2(1.0, 0.0)
);
out vec2 vUv;
void main() {
  vUv = UV[gl_VertexID];
  gl_Position = vec4(POS[gl_VertexID], 0.0, 1.0);
}
`;

const PARALLAX_FRAG_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTex;
uniform vec2 uViewport;
uniform vec2 uImageSize;
uniform float uScale;
uniform vec2 uPan;
uniform vec2 uPointer;
uniform float uTime;
uniform float uLightning;
uniform int uSceneType;

void main() {
  // Aspect-correct cover UV mapping (zero stretching across 9:16, 1:1, 16:9)
  float viewAspect = max(0.01, uViewport.x / max(1.0, uViewport.y));
  float imgAspect = max(0.01, uImageSize.x / max(1.0, uImageSize.y));
  vec2 ratio = vec2(
    min(viewAspect / imgAspect, 1.0),
    min(imgAspect / viewAspect, 1.0)
  );
  vec2 baseUv = (vUv - 0.5) * ratio + 0.5;

  // Sample coarse luminance & vertical perspective to build 3 smooth depth planes
  vec3 preview = texture(uTex, clamp(baseUv, 0.002, 0.998)).rgb;
  float luma = dot(preview, vec3(0.299, 0.587, 0.114));

  // Foreground weighting: lower table/floor plane + left/right architectural columns
  float verticalDepth = smoothstep(0.18, 0.96, vUv.y);
  float edgeFrameDepth = smoothstep(0.22, 0.50, abs(vUv.x - 0.5)) * 0.35;
  float relief = mix(verticalDepth, 1.0 - luma * 0.35, 0.25) + edgeFrameDepth;
  float depthPlane = clamp(relief, 0.0, 1.0);

  // Multi-plane parallax displacement (near shifts 2.4x more than far horizon)
  float parallaxFactor = mix(0.38, 1.18, depthPlane);
  vec2 camOffset = (uPan + uPointer * vec2(0.016, 0.011)) * parallaxFactor;

  vec2 zoomedUv = (baseUv - 0.5) / max(1.0, uScale) + 0.5 + camOffset;
  zoomedUv = clamp(zoomedUv, 0.002, 0.998);

  // Subtle anamorphic chromatic micro-fringe near outer 12% edges
  float edgeDist = length((vUv - 0.5) * vec2(1.0, 0.7));
  float chromaShift = smoothstep(0.32, 0.72, edgeDist) * 0.0018;
  float r = texture(uTex, clamp(zoomedUv + vec2(chromaShift, 0.0), 0.002, 0.998)).r;
  float g = texture(uTex, zoomedUv).g;
  float b = texture(uTex, clamp(zoomedUv - vec2(chromaShift, 0.0), 0.002, 0.998)).b;
  vec3 col = vec3(r, g, b);

  // Scene-matched live illumination pulse
  if (uSceneType == 0) {
    // Geneva warm pendant spotlight breathing over brass astrolabe
    float spot = exp(-length((vUv - vec2(0.50, 0.42)) * vec2(1.3, 1.0)) * 2.4);
    col += vec3(0.08, 0.055, 0.02) * spot * (0.65 + 0.35 * sin(uTime * 1.7));
  } else if (uSceneType == 2) {
    // Tokyo central holographic icosahedron pulse
    float holo = exp(-length((vUv - vec2(0.50, 0.52)) * vec2(1.6, 1.2)) * 4.2);
    col += vec3(0.11, 0.08, 0.02) * holo * (0.55 + 0.45 * sin(uTime * 2.8));
  } else if (uSceneType == 3) {
    // Cairo solar oculus warm bounce
    float sun = exp(-length((vUv - vec2(0.52, 0.62)) * vec2(1.5, 1.1)) * 2.8);
    col += vec3(0.10, 0.07, 0.025) * sun * (0.6 + 0.4 * sin(uTime * 1.3));
  } else if (uSceneType == 4) {
    // Singapore UV storm lightning exposure burst
    col += vec3(0.26, 0.36, 0.52) * uLightning * (1.0 - vUv.y * 0.45);
  } else if (uSceneType == 5) {
    // Apex Forum floating Crown golden aura
    float crown = exp(-length((vUv - vec2(0.62, 0.62)) * vec2(2.2, 1.8)) * 4.5);
    col += vec3(0.13, 0.095, 0.03) * crown * (0.65 + 0.35 * sin(uTime * 2.2));
  }

  // Soft anamorphic cinema vignette (strictly edge0 < edge1 per GLSL ES 3.00 §8.3)
  float vig = 1.0 - smoothstep(0.28, 0.92, edgeDist);
  col *= mix(0.52, 1.04, vig);

  fragColor = vec4(col, 1.0);
}
`;

interface GlParallaxContext {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  texture: WebGLTexture;
  vao: WebGLVertexArrayObject;
  uViewport: WebGLUniformLocation | null;
  uImageSize: WebGLUniformLocation | null;
  uScale: WebGLUniformLocation | null;
  uPan: WebGLUniformLocation | null;
  uPointer: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;
  uLightning: WebGLUniformLocation | null;
  uSceneType: WebGLUniformLocation | null;
}

function createGlParallax(canvas: HTMLCanvasElement): GlParallaxContext | null {
  try {
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    if (!gl) return null;

    const compile = (type: number, src: string): WebGLShader | null => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, PARALLAX_VERT_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, PARALLAX_FRAG_SHADER);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }

    const vao = gl.createVertexArray();
    const texture = gl.createTexture();
    if (!vao || !texture) return null;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 1x1 obsidian placeholder pixel before async image finishes decoding
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([8, 11, 17, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return {
      gl,
      program,
      texture,
      vao,
      uViewport: gl.getUniformLocation(program, 'uViewport'),
      uImageSize: gl.getUniformLocation(program, 'uImageSize'),
      uScale: gl.getUniformLocation(program, 'uScale'),
      uPan: gl.getUniformLocation(program, 'uPan'),
      uPointer: gl.getUniformLocation(program, 'uPointer'),
      uTime: gl.getUniformLocation(program, 'uTime'),
      uLightning: gl.getUniformLocation(program, 'uLightning'),
      uSceneType: gl.getUniformLocation(program, 'uSceneType'),
    };
  } catch {
    return null;
  }
}

// ============================================================================
// PROCEDURAL WEATHER PARTICLE STATE TYPES
// ============================================================================

interface WeatherParticle {
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  depth: number; // 0 (far), 0.5 (mid), 1 (near)
  phase: number;
  hueIdx: number;
}

interface GlassDroplet {
  x: number;
  y: number;
  radius: number;
  vy: number;
  slipTimer: number;
  alpha: number;
}

interface LightningBolt {
  points: Array<{ x: number; y: number }>;
  branches: Array<Array<{ x: number; y: number }>>;
  life: number;
  maxLife: number;
}

// ============================================================================
// MASTER 60FPS MOTION-CINEMA DIRECTOR
// ============================================================================

export class MotionCinemaDirector {
  private readonly audio: StudioAudioEngine;
  private readonly haptics: HapticsEngine;
  private linkedStage3d: Stage3DDirector | null = null;
  private pausedStage3dDuringScene = false;

  private activeOverlay: HTMLElement | null = null;
  private glCtx: GlParallaxContext | null = null;
  private fallback2dCtx: CanvasRenderingContext2D | null = null;
  private fxCtx: CanvasRenderingContext2D | null = null;
  private loadedImg: HTMLImageElement | null = null;
  private imgNaturalW = 1920;
  private imgNaturalH = 1080;

  private rafId = 0;
  private wordRevealTimers: Array<ReturnType<typeof setTimeout>> = [];
  private summonsTimer: ReturnType<typeof setTimeout> | null = null;
  private summonsDissolveTimer: ReturnType<typeof setTimeout> | null = null;
  private summonsInterval: ReturnType<typeof setInterval> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private pointerTargetX = 0;
  private pointerTargetY = 0;
  private pointerCurX = 0;
  private pointerCurY = 0;
  private beatZoomKick = 0;

  private particles: WeatherParticle[] = [];
  private droplets: GlassDroplet[] = [];
  private activeBolts: LightningBolt[] = [];
  private nextLightningAtSec = 1.6;
  private lightningFlash01 = 0;

  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private boundResize: (() => void) | null = null;
  private boundPointerMove: ((e: PointerEvent) => void) | null = null;

  constructor(
    audio: StudioAudioEngine,
    haptics: HapticsEngine,
    stage3d?: Stage3DDirector | null,
  ) {
    this.audio = audio;
    this.haptics = haptics;
    this.linkedStage3d = stage3d ?? null;
    ensureMotionCinemaStyles();
  }

  public setStage3D(stage3d: Stage3DDirector | null): void {
    this.linkedStage3d = stage3d;
  }

  public isActive(): boolean {
    return this.activeOverlay !== null;
  }

  /**
   * Plays any of the 6 canonical Act Cutscenes directly by ID (`act0_invitation` .. `act5_apex_finale`).
   */
  public playActById(
    cutsceneId: keyof typeof CANONICAL_ACT_CUTSCENES | string,
    challengerName: string,
    onComplete: () => void,
    options?: MotionPlayOptions,
  ): void {
    const spec = CANONICAL_ACT_CUTSCENES[cutsceneId] ?? CANONICAL_ACT_CUTSCENES.act0_invitation;
    this.play(spec, challengerName, onComplete, options);
  }

  /**
   * Dedicated launcher for the Geneva Prologue Encrypted Black-Glass Diplomatic Summons + Act 0 Cinema.
   */
  public playPrologueSummons(
    challengerName: string,
    onComplete: () => void,
    customAct0?: MotionCutsceneInput,
  ): void {
    this.play(
      customAct0 ?? CANONICAL_ACT_CUTSCENES.act0_invitation,
      challengerName,
      onComplete,
      { showPrologueSummons: true },
    );
  }

  /**
   * Drop-in replacement for `CutscenePlayer.play(...)` supporting BOTH `ActCutsceneSpec` and `LegacyCutsceneSpec`.
   */
  public play(
    cutsceneInput: MotionCutsceneInput,
    challengerName: string,
    onComplete: () => void,
    options: MotionPlayOptions = {},
  ): void {
    this.close();
    ensureMotionCinemaStyles();

    const scene = normalizeCutsceneInput(cutsceneInput);
    if (scene.beats.length === 0) {
      onComplete();
      return;
    }

    const displayPlayerName = challengerName?.trim() || 'Challenger';
    const showSummonsColdOpen =
      options.showPrologueSummons !== undefined
        ? options.showPrologueSummons
        : scene.id === 'act0_invitation';

    this.initWeatherParticles(scene.weatherFx);
    this.pointerTargetX = 0;
    this.pointerTargetY = 0;
    this.pointerCurX = 0;
    this.pointerCurY = 0;
    this.beatZoomKick = 0;
    this.lightningFlash01 = 0;
    this.activeBolts = [];
    this.nextLightningAtSec = 1.1;

    const overlay = document.createElement('div');
    overlay.className = 'ws-mc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', scene.title);

    const pipsHtml = scene.beats
      .map((_, i) => `<span class="ws-mc-pip" data-pip="${i}"></span>`)
      .join('');

    overlay.innerHTML = `
      <div class="ws-mc-stage-viewport">
        <canvas class="ws-mc-canvas" id="ws-mc-art-canvas"></canvas>
        <canvas class="ws-mc-canvas" id="ws-mc-fx-canvas"></canvas>
      </div>

      ${
        showSummonsColdOpen
          ? `
        <div class="ws-mc-summons-card" id="ws-mc-summons">
          <div class="ws-mc-summons-slab">
            <canvas id="ws-mc-seal-canvas" width="92" height="92" style="width:76px;height:76px;display:block;"></canvas>
            <div style="font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.18em;color:var(--gold-bright);">
              MERIDIAN PROTOCOL 00 // ENCRYPTED DIPLOMATIC SUMMONS
            </div>
            <div id="ws-mc-cipher-line" style="font-family:var(--font-display);font-weight:800;font-size:clamp(16px,2.3vw,23px);letter-spacing:0.08em;color:var(--ivory-primary);line-height:1.3;">
              0x9F4A · DECRYPTING GENEVA SEAL...
            </div>
            <div style="font-family:var(--font-mono);font-size:11px;color:var(--cyan-clue);letter-spacing:0.08em;">
              PSYCHOMETRIC RESONANCE: 99.4% · CANDIDATE: ${escapeHtml(displayPlayerName.toUpperCase())}
            </div>
          </div>
        </div>
      `
          : ''
      }

      <!-- Top Anamorphic 2.39:1 Editorial Scrim -->
      <div class="ws-mc-letterbox-top">
        <div class="ws-chyron">
          <span class="ws-chyron-dot"></span>
          <span class="ws-chyron-title">${escapeHtml(scene.title)}</span>
          ${scene.location ? `<span class="ws-chyron-sub">· ${escapeHtml(scene.location)}</span>` : ''}
        </div>
        <button type="button" class="ws-mc-btn-skip" id="ws-mc-skip" aria-label="Skip Scene">
          SKIP ⏭
        </button>
      </div>

      <!-- Bottom Anamorphic 2.39:1 Cinema Dialogue Deck -->
      <div class="ws-mc-letterbox-bottom">
        <div class="ws-mc-deck">
          <div class="ws-mc-dialogue-row">
            <div class="ws-mc-portrait-frame" id="ws-mc-portrait-wrap">
              <img class="ws-mc-portrait-img" id="ws-mc-portrait-a" alt="" />
              <img class="ws-mc-portrait-img" id="ws-mc-portrait-b" alt="" />
            </div>

            <div class="ws-mc-copy-col" id="ws-mc-copy-area" title="Tap to reveal full line">
              <div class="ws-mc-meta-row">
                <div class="ws-mc-speaker-group">
                  <span class="ws-mc-speaker-name" id="ws-mc-speaker"></span>
                  <span class="ws-mc-expr-badge" id="ws-mc-expr"></span>
                  <span class="ws-mc-voice-wave" id="ws-mc-wave" aria-hidden="true">
                    <span class="ws-mc-voice-bar"></span>
                    <span class="ws-mc-voice-bar"></span>
                    <span class="ws-mc-voice-bar"></span>
                    <span class="ws-mc-voice-bar"></span>
                    <span class="ws-mc-voice-bar"></span>
                  </span>
                </div>
                <span id="ws-mc-step" style="font-family:var(--font-mono);font-size:11px;color:var(--ivory-muted);"></span>
              </div>
              <p class="ws-mc-line-text" id="ws-mc-text"></p>
            </div>
          </div>

          <div class="ws-mc-controls-row">
            <div class="ws-mc-beat-pips" id="ws-mc-pips">${pipsHtml}</div>
            <button type="button" class="ws-btn-gold ws-mc-btn-next" id="ws-mc-next">
              NEXT BEAT ▶
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeOverlay = overlay;
    const stageRef = options.stage3d ?? this.linkedStage3d;
    if (stageRef) {
      this.linkedStage3d = stageRef;
      stageRef.setPaused(true);
      this.pausedStage3dDuringScene = true;
    }
    requestAnimationFrame(() => overlay.classList.add('is-mounted'));

    let artCanvas = overlay.querySelector<HTMLCanvasElement>('#ws-mc-art-canvas')!;
    const fxCanvas = overlay.querySelector<HTMLCanvasElement>('#ws-mc-fx-canvas')!;
    const sealCanvas = overlay.querySelector<HTMLCanvasElement>('#ws-mc-seal-canvas');
    const sealCtx = sealCanvas?.getContext('2d') ?? null;

    this.glCtx = createGlParallax(artCanvas);
    if (!this.glCtx) {
      // Replace canvas element cleanly in case getContext('webgl2') locked context mode
      const replacement = document.createElement('canvas');
      replacement.className = 'ws-mc-canvas';
      replacement.id = 'ws-mc-art-canvas';
      artCanvas.replaceWith(replacement);
      artCanvas = replacement;
      this.fallback2dCtx = artCanvas.getContext('2d');
    } else {
      artCanvas.addEventListener(
        'webglcontextlost',
        (ev) => {
          ev.preventDefault();
          this.glCtx = null;
        },
        { once: true },
      );
    }
    this.fxCtx = fxCanvas.getContext('2d');

    let viewportW = Math.max(320, window.innerWidth || 1280);
    let viewportH = Math.max(320, window.innerHeight || 720);

    const syncSizes = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewportW = Math.max(320, window.innerWidth || 1280);
      viewportH = Math.max(320, window.innerHeight || 720);

      artCanvas.width = Math.round(viewportW * dpr);
      artCanvas.height = Math.round(viewportH * dpr);
      fxCanvas.width = Math.round(viewportW * dpr);
      fxCanvas.height = Math.round(viewportH * dpr);

      if (this.glCtx) {
        this.glCtx.gl.viewport(0, 0, artCanvas.width, artCanvas.height);
      } else if (this.fallback2dCtx) {
        this.fallback2dCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      if (this.fxCtx) {
        this.fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    syncSizes();

    // Load key-art painting into WebGL2 texture / 2D image
    this.loadedImg = null;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (this.activeOverlay !== overlay) return;
      this.loadedImg = img;
      this.imgNaturalW = Math.max(1, img.naturalWidth || 1920);
      this.imgNaturalH = Math.max(1, img.naturalHeight || 1080);
      if (this.glCtx) {
        const { gl, texture } = this.glCtx;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      }
    };
    img.src = scene.imageUrl;

    // DOM Element Refs
    const summonsEl = overlay.querySelector<HTMLElement>('#ws-mc-summons');
    const cipherLineEl = overlay.querySelector<HTMLElement>('#ws-mc-cipher-line');
    const portraitWrap = overlay.querySelector<HTMLElement>('#ws-mc-portrait-wrap')!;
    const portraitA = overlay.querySelector<HTMLImageElement>('#ws-mc-portrait-a')!;
    const portraitB = overlay.querySelector<HTMLImageElement>('#ws-mc-portrait-b')!;
    const speakerEl = overlay.querySelector<HTMLElement>('#ws-mc-speaker')!;
    const exprEl = overlay.querySelector<HTMLElement>('#ws-mc-expr')!;
    const waveEl = overlay.querySelector<HTMLElement>('#ws-mc-wave')!;
    const waveBars = Array.from(waveEl.querySelectorAll<HTMLElement>('.ws-mc-voice-bar'));
    const stepEl = overlay.querySelector<HTMLElement>('#ws-mc-step')!;
    const textEl = overlay.querySelector<HTMLElement>('#ws-mc-text')!;
    const copyArea = overlay.querySelector<HTMLElement>('#ws-mc-copy-area')!;
    const nextBtn = overlay.querySelector<HTMLButtonElement>('#ws-mc-next')!;
    const skipBtn = overlay.querySelector<HTMLButtonElement>('#ws-mc-skip')!;
    const pipEls = Array.from(overlay.querySelectorAll<HTMLElement>('.ws-mc-pip'));

    let activePortraitSlot: 'A' | 'B' = 'A';
    let lastPortraitUrl = '';
    let beatIndex = 0;
    let summonsActive = showSummonsColdOpen;
    let allWordsRevealed = false;
    let finished = false;

    const clearWordTimers = () => {
      for (const t of this.wordRevealTimers) clearTimeout(t);
      this.wordRevealTimers = [];
    };

    const revealAllWordsImmediately = () => {
      clearWordTimers();
      allWordsRevealed = true;
      const spans = textEl.querySelectorAll<HTMLElement>('.ws-mc-word');
      spans.forEach((s) => s.classList.add('is-revealed'));
    };

    const finishScene = () => {
      if (finished) return;
      finished = true;
      this.audio.stopVoice();
      this.close();
      onComplete();
    };

    const renderBeat = (idx: number) => {
      const beat = scene.beats[idx];
      if (!beat) {
        finishScene();
        return;
      }

      clearWordTimers();
      allWordsRevealed = false;
      this.beatZoomKick = 0.014;

      const interpolated = stripHistoricalYearCommas(
        beat.text
          .replace(/\[\[[\s\S]*?\]\]/g, '')
          .replace(/\{player\}|\{name\}|\{challengerName\}|<CHALLENGER>/gi, displayPlayerName)
          .trim(),
      );

      // Dual-buffered expression portrait swap (zero flicker!)
      const nextUrl = beat.portraitUrl || resolveCinemaPortraitUrl(beat.speakerId, beat.expression);
      if (nextUrl !== lastPortraitUrl) {
        lastPortraitUrl = nextUrl;
        const incoming = activePortraitSlot === 'A' ? portraitA : portraitB;
        const outgoing = activePortraitSlot === 'A' ? portraitB : portraitA;
        activePortraitSlot = activePortraitSlot === 'A' ? 'B' : 'A';
        incoming.src = nextUrl;
        incoming.alt = beat.speakerName;
        incoming.classList.add('is-visible');
        outgoing.classList.remove('is-visible');
      }

      speakerEl.textContent = beat.speakerName.toUpperCase();
      exprEl.textContent = (beat.expression || 'NEUTRAL').toUpperCase();
      stepEl.textContent = `BEAT ${idx + 1} / ${scene.beats.length}`;
      nextBtn.textContent = idx + 1 >= scene.beats.length ? 'ENTER STAGE ▶' : 'NEXT BEAT ▶';

      pipEls.forEach((pip, pIdx) => {
        pip.classList.toggle('is-done', pIdx < idx);
        pip.classList.toggle('is-current', pIdx === idx);
      });

      // Word-by-word cinema typography reveal
      const rawWords = `“${interpolated}”`.split(/\s+/).filter(Boolean);
      textEl.innerHTML = rawWords
        .map((w) => `<span class="ws-mc-word">${escapeHtml(w)}</span>`)
        .join(' ');

      const wordEls = Array.from(textEl.querySelectorAll<HTMLElement>('.ws-mc-word'));
      let delayMs = 20;
      wordEls.forEach((el, wIdx) => {
        const timer = setTimeout(() => {
          el.classList.add('is-revealed');
          if (wIdx === wordEls.length - 1) {
            allWordsRevealed = true;
          }
        }, delayMs);
        this.wordRevealTimers.push(timer);
        const txt = rawWords[wIdx] || '';
        const extraPause = /[—.!?;:]/.test(txt) ? 72 : /,/.test(txt) ? 36 : 0;
        delayMs += 38 + extraPause;
      });

      if (beat.voiceUrl) {
        this.audio.playVoice(beat.voiceUrl);
      } else {
        this.audio.stopVoice();
      }

      options.onBeatChanged?.(idx, scene.beats.length, beat.speakerId);
    };

    const dismissSummonsAndStartBeat0 = () => {
      if (!summonsActive) return;
      summonsActive = false;
      if (this.summonsTimer) {
        clearTimeout(this.summonsTimer);
        this.summonsTimer = null;
      }
      if (this.summonsInterval) {
        clearInterval(this.summonsInterval);
        this.summonsInterval = null;
      }
      this.haptics.passportStamp();
      this.audio.playSfx('cutscene_whoosh');
      if (summonsEl) {
        summonsEl.classList.add('is-dissolving');
        this.summonsDissolveTimer = setTimeout(() => {
          summonsEl.remove();
          this.summonsDissolveTimer = null;
        }, 520);
      }
      renderBeat(0);
    };

    // Launch Prologue Black-Glass Diplomatic Summons Cold-Open or jump straight to Beat 0
    if (showSummonsColdOpen && summonsEl && cipherLineEl) {
      this.audio.playSfx('passport_stamp');
      this.haptics.sightlineSnap();
      const targetPhrase = '“YOU SOLVED WHAT 400,000 COULDN’T.”';
      const hexGlyphs = '0123456789ABCDEF#◊∆§';
      let step = 0;
      const totalSteps = 16;
      this.summonsInterval = setInterval(() => {
        if (!summonsActive || finished) {
          if (this.summonsInterval) {
            clearInterval(this.summonsInterval);
            this.summonsInterval = null;
          }
          return;
        }
        step += 1;
        const lockedChars = Math.floor((step / totalSteps) * targetPhrase.length);
        let out = '';
        for (let i = 0; i < targetPhrase.length; i++) {
          const ch = targetPhrase[i];
          if (i < lockedChars || ch === ' ') {
            out += ch;
          } else {
            out += hexGlyphs[(i * 7 + step * 3) % hexGlyphs.length];
          }
        }
        cipherLineEl.textContent = out;
        if (step >= totalSteps && this.summonsInterval) {
          clearInterval(this.summonsInterval);
          this.summonsInterval = null;
        }
      }, 65);

      summonsEl.addEventListener('click', () => dismissSummonsAndStartBeat0());
      this.summonsTimer = setTimeout(() => dismissSummonsAndStartBeat0(), 1850);
    } else {
      this.audio.playSfx('cutscene_whoosh');
      renderBeat(0);
    }

    // Instant NEXT BEAT / SKIP SCENE / Tap-to-Reveal Controls
    const advanceNextBeat = () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      if (summonsActive) {
        dismissSummonsAndStartBeat0();
        return;
      }
      beatIndex += 1;
      if (beatIndex >= scene.beats.length) {
        finishScene();
      } else {
        renderBeat(beatIndex);
      }
    };

    nextBtn.addEventListener('click', advanceNextBeat);

    copyArea.addEventListener('click', () => {
      if (summonsActive) {
        dismissSummonsAndStartBeat0();
        return;
      }
      if (!allWordsRevealed) {
        this.haptics.uiTap();
        revealAllWordsImmediately();
      } else {
        advanceNextBeat();
      }
    });

    skipBtn.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      finishScene();
    });

    this.boundPointerMove = (e: PointerEvent) => {
      this.pointerTargetX = ((e.clientX / Math.max(1, viewportW)) - 0.5) * 2;
      this.pointerTargetY = ((e.clientY / Math.max(1, viewportH)) - 0.5) * 2;
    };
    this.boundResize = () => syncSizes();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => syncSizes());
      this.resizeObserver.observe(overlay);
    }
    this.boundKeyDown = (ev: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toUpperCase();
      if (
        activeTag === 'INPUT' ||
        activeTag === 'TEXTAREA' ||
        (document.activeElement as HTMLElement | null)?.isContentEditable
      ) {
        return;
      }
      if (ev.key === 'Escape') {
        ev.preventDefault();
        this.haptics.uiTap();
        finishScene();
      } else if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowRight') {
        ev.preventDefault();
        advanceNextBeat();
      }
    };

    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
    window.addEventListener('resize', this.boundResize, { passive: true });
    window.addEventListener('keydown', this.boundKeyDown);

    // 60fps Master Cinema Render Loop
    const sceneStartMs = performance.now();
    let prevMs = sceneStartMs;
    const totalKenBurnsDurationSec = Math.max(12, scene.beats.length * 6.5);

    const sceneTypeIndex: Record<WeatherFxPreset, number> = {
      alpine_snow: 0,
      london_rain: 1,
      neon_rain: 2,
      desert_dust: 3,
      uv_storm: 4,
      ocean_mist: 5,
    };

    const tick = (nowMs: number) => {
      if (this.activeOverlay !== overlay || finished) return;
      this.rafId = requestAnimationFrame(tick);
      if (document.hidden) {
        prevMs = nowMs;
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (nowMs - prevMs) / 1000));
      prevMs = nowMs;
      const elapsedSec = (nowMs - sceneStartMs) / 1000;

      // Smooth pointer parallax & per-beat rack-focus decay
      const damp = 1 - Math.exp(-dt * 5.5);
      this.pointerCurX += (this.pointerTargetX - this.pointerCurX) * damp;
      this.pointerCurY += (this.pointerTargetY - this.pointerCurY) * damp;
      this.beatZoomKick *= Math.exp(-dt * 3.8);

      // Smooth sinusoidal/hermite Ken-Burns trajectory (never snaps at end!)
      const rawProgress = Math.min(1, elapsedSec / totalKenBurnsDurationSec);
      const smoothT = rawProgress * rawProgress * (3 - 2 * rawProgress);
      const subtleBreath = Math.sin(elapsedSec * 0.45) * 0.006;
      const curScale =
        scene.kenBurns.startScale +
        (scene.kenBurns.endScale - scene.kenBurns.startScale) * smoothT +
        this.beatZoomKick +
        subtleBreath;
      const curPanX = scene.kenBurns.panX * smoothT;
      const curPanY = scene.kenBurns.panY * smoothT;

      // Animate Geneva Summons Sacred-Geometry Astrolabe Seal if visible
      if (summonsActive && sealCtx && sealCanvas) {
        this.renderSummonsAstrolabeSeal(sealCtx, elapsedSec);
      }

      // Render Layer 0: Multi-Plane Depth Parallax Painting
      if (this.glCtx) {
        const { gl, program, vao, texture } = this.glCtx;
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform2f(this.glCtx.uViewport, artCanvas.width, artCanvas.height);
        gl.uniform2f(this.glCtx.uImageSize, this.imgNaturalW, this.imgNaturalH);
        gl.uniform1f(this.glCtx.uScale, curScale);
        gl.uniform2f(this.glCtx.uPan, curPanX, curPanY);
        gl.uniform2f(this.glCtx.uPointer, this.pointerCurX, this.pointerCurY);
        gl.uniform1f(this.glCtx.uTime, elapsedSec);
        gl.uniform1f(this.glCtx.uLightning, this.lightningFlash01);
        gl.uniform1i(this.glCtx.uSceneType, sceneTypeIndex[scene.weatherFx]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      } else if (this.fallback2dCtx) {
        this.renderFallback2DParallax(
          this.fallback2dCtx,
          viewportW,
          viewportH,
          curScale,
          curPanX,
          curPanY,
        );
      }

      // Render Layer 1: Real-Time 60fps Procedural Weather & Atmospheric VFX
      if (this.fxCtx) {
        this.renderWeatherLayer(
          this.fxCtx,
          viewportW,
          viewportH,
          dt,
          elapsedSec,
          scene.weatherFx,
        );
      }

      // Sync Live Portrait Breathing & Voice Telemetry Indicator
      const speaking = this.audio.isVoicePlaying();
      portraitWrap.classList.toggle('is-speaking', speaking);
      waveEl.classList.toggle('is-active', speaking);
      if (speaking) {
        for (let i = 0; i < waveBars.length; i++) {
          const h = 3 + Math.abs(Math.sin(elapsedSec * (9.5 + i * 2.7) + i * 1.1)) * 9;
          waveBars[i].style.height = `${h.toFixed(1)}px`;
        }
      }
      const activePortrait = activePortraitSlot === 'B' ? portraitA : portraitB;
      const swayY = Math.sin(elapsedSec * 2.1) * 1.4;
      const speakScale = speaking ? 1.035 + Math.sin(elapsedSec * 11) * 0.008 : 1.02;
      activePortrait.style.transform = `translate3d(0, ${swayY.toFixed(2)}px, 0) scale(${speakScale.toFixed(3)})`;
    };

    this.rafId = requestAnimationFrame(tick);
  }

  // --------------------------------------------------------------------------
  // 2D MULTI-PLANE PARALLAX FALLBACK (Headless / Non-WebGL2 Environments)
  // --------------------------------------------------------------------------

  private renderFallback2DParallax(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    scale: number,
    panX: number,
    panY: number,
  ): void {
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, w, h);
    if (!this.loadedImg) return;

    const imgAspect = this.imgNaturalW / Math.max(1, this.imgNaturalH);
    const viewAspect = w / Math.max(1, h);
    let drawW = w;
    let drawH = h;
    if (viewAspect > imgAspect) {
      drawW = w;
      drawH = w / imgAspect;
    } else {
      drawH = h;
      drawW = h * imgAspect;
    }

    // Far + Mid plane
    ctx.save();
    const farScale = scale;
    const farOffX = (panX + this.pointerCurX * 0.012) * w * 0.55;
    const farOffY = (panY + this.pointerCurY * 0.01) * h * 0.55;
    ctx.translate(w * 0.5 - farOffX, h * 0.5 - farOffY);
    ctx.scale(farScale, farScale);
    ctx.drawImage(this.loadedImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
    ctx.restore();

    // Foreground depth plane (lower third table/floor parallax slice)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, h * 0.62, w, h * 0.38);
    ctx.clip();
    const nearScale = scale * 1.028;
    const nearOffX = (panX + this.pointerCurX * 0.018) * w * 1.05;
    const nearOffY = (panY + this.pointerCurY * 0.014) * h * 1.05;
    ctx.translate(w * 0.5 - nearOffX, h * 0.5 - nearOffY);
    ctx.scale(nearScale, nearScale);
    ctx.globalAlpha = 0.85;
    ctx.drawImage(this.loadedImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // PROLOGUE SUMMONS ASTROLABE SEAL CANVAS
  // --------------------------------------------------------------------------

  private renderSummonsAstrolabeSeal(ctx: CanvasRenderingContext2D, t: number): void {
    const size = 92;
    const cx = size * 0.5;
    const cy = size * 0.5;
    ctx.clearRect(0, 0, size, size);

    // Crimson-gold wax aura
    const glow = ctx.createRadialGradient(cx, cy, 6, cx, cy, 42);
    glow.addColorStop(0, 'rgba(224, 82, 99, 0.42)');
    glow.addColorStop(0.65, 'rgba(216, 175, 87, 0.22)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = '#f2cf7e';
    ctx.lineWidth = 1.6;

    // Outer vernier ring
    ctx.rotate(t * 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.stroke();

    // Counter-rotating octagram cipher seal
    ctx.rotate(-t * 1.9);
    for (let k = 0; k < 2; k++) {
      ctx.save();
      ctx.rotate((k * Math.PI) / 4);
      ctx.strokeRect(-19, -19, 38, 38);
      ctx.restore();
    }

    ctx.fillStyle = '#fae29c';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // 6 BESPOKE PROCEDURAL WEATHER SYSTEMS (60 FPS)
  // --------------------------------------------------------------------------

  private initWeatherParticles(preset: WeatherFxPreset): void {
    this.particles = [];
    this.droplets = [];

    const count =
      preset === 'london_rain' || preset === 'neon_rain' || preset === 'uv_storm'
        ? 110
        : preset === 'alpine_snow'
          ? 88
          : 78;

    for (let i = 0; i < count; i++) {
      const depth = i % 5 === 0 ? 1.0 : i % 2 === 0 ? 0.55 : 0.25;
      if (preset === 'alpine_snow') {
        this.particles.push({
          x: Math.random(),
          y: Math.random(),
          vx: -0.025 - Math.random() * 0.035,
          vy: 0.04 + depth * 0.08 + Math.random() * 0.04,
          size: 1.4 + depth * 3.8,
          alpha: 0.28 + depth * 0.48,
          depth,
          phase: Math.random() * Math.PI * 2,
          hueIdx: i % 3,
        });
      } else if (preset === 'london_rain' || preset === 'neon_rain' || preset === 'uv_storm') {
        const windX = preset === 'uv_storm' ? -0.26 : preset === 'neon_rain' ? -0.09 : -0.13;
        const speedY = preset === 'uv_storm' ? 0.95 : 0.78;
        this.particles.push({
          x: Math.random(),
          y: Math.random(),
          vx: windX * (0.7 + depth * 0.6),
          vy: speedY * (0.65 + depth * 0.75) + Math.random() * 0.25,
          size: 12 + depth * 22,
          alpha: 0.16 + depth * 0.34,
          depth,
          phase: Math.random() * Math.PI * 2,
          hueIdx: i % 3,
        });
      } else if (preset === 'desert_dust') {
        this.particles.push({
          x: Math.random(),
          y: Math.random(),
          vx: 0.012 + (Math.random() - 0.5) * 0.022,
          vy: -0.015 - Math.random() * 0.025,
          size: 1.3 + depth * 3.2,
          alpha: 0.22 + depth * 0.55,
          depth,
          phase: Math.random() * Math.PI * 2,
          hueIdx: i % 2,
        });
      } else {
        // ocean_mist
        this.particles.push({
          x: Math.random() * 0.75,
          y: 0.25 + Math.random() * 0.75,
          vx: 0.035 + Math.random() * 0.055,
          vy: -0.045 - Math.random() * 0.065,
          size: 3.5 + depth * 14,
          alpha: 0.12 + depth * 0.28,
          depth,
          phase: Math.random() * Math.PI * 2,
          hueIdx: i % 2,
        });
      }
    }

    if (preset === 'london_rain' || preset === 'alpine_snow') {
      const dropCount = preset === 'london_rain' ? 34 : 16;
      for (let i = 0; i < dropCount; i++) {
        this.droplets.push({
          x: 0.06 + Math.random() * 0.88,
          y: Math.random() * 0.85,
          radius: 1.6 + Math.random() * 2.8,
          vy: 0.012 + Math.random() * 0.045,
          slipTimer: Math.random() * 4,
          alpha: 0.26 + Math.random() * 0.38,
        });
      }
    }
  }

  private spawnForkedLightning(): void {
    const startX = 0.18 + Math.random() * 0.36;
    const points: Array<{ x: number; y: number }> = [{ x: startX, y: 0.04 }];
    const branches: Array<Array<{ x: number; y: number }>> = [];

    let cx = startX;
    let cy = 0.04;
    const steps = 11;
    for (let i = 0; i < steps; i++) {
      cx += (Math.random() - 0.46) * 0.055;
      cy += 0.036 + Math.random() * 0.025;
      points.push({ x: cx, y: cy });

      if (i > 1 && i < steps - 2 && Math.random() < 0.45) {
        const branch: Array<{ x: number; y: number }> = [{ x: cx, y: cy }];
        let bx = cx;
        let by = cy;
        const dir = Math.random() < 0.5 ? -1 : 1;
        for (let b = 0; b < 4; b++) {
          bx += dir * (0.018 + Math.random() * 0.025);
          by += 0.025 + Math.random() * 0.02;
          branch.push({ x: bx, y: by });
        }
        branches.push(branch);
      }
    }

    this.activeBolts.push({
      points,
      branches,
      life: 0,
      maxLife: 0.34,
    });
    this.lightningFlash01 = 0.92;
  }

  private renderWeatherLayer(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    dt: number,
    t: number,
    preset: WeatherFxPreset,
  ): void {
    ctx.clearRect(0, 0, w, h);

    // 1) Scene-specific volumetric beams / frost / bokeh pre-pass
    if (preset === 'alpine_snow') {
      // Icy Alpine frost vignette around corners
      const frost = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.32,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.72,
      );
      frost.addColorStop(0, 'rgba(160, 210, 245, 0)');
      frost.addColorStop(0.76, 'rgba(135, 195, 238, 0.07)');
      frost.addColorStop(1, 'rgba(175, 225, 255, 0.24)');
      ctx.fillStyle = frost;
      ctx.fillRect(0, 0, w, h);
    } else if (preset === 'desert_dust') {
      // Volumetric Giza Solar Oculus God-Rays
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let ray = 0; ray < 3; ray++) {
        const sway = Math.sin(t * 0.7 + ray * 1.4) * w * 0.015;
        const topX = w * (0.58 + ray * 0.035) + sway;
        const botX = w * (0.44 + ray * 0.045) - sway * 0.5;
        const grad = ctx.createLinearGradient(topX, h * 0.04, botX, h * 0.84);
        const pulse = 0.11 + 0.04 * Math.sin(t * 1.2 + ray);
        grad.addColorStop(0, `rgba(255, 232, 172, ${(pulse * 1.35).toFixed(3)})`);
        grad.addColorStop(0.55, `rgba(242, 198, 112, ${pulse.toFixed(3)})`);
        grad.addColorStop(1, 'rgba(216, 175, 87, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(topX - w * 0.045, 0);
        ctx.lineTo(topX + w * 0.055, 0);
        ctx.lineTo(botX + w * 0.13, h * 0.92);
        ctx.lineTo(botX - w * 0.11, h * 0.92);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    } else if (preset === 'neon_rain') {
      // Cyan & Amber Shibuya anamorphic bokeh streaks
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let b = 0; b < 8; b++) {
        const bx = w * (0.12 + ((b * 0.117 + Math.sin(t * 0.25 + b) * 0.03 + 1) % 0.78));
        const by = h * (0.24 + ((b * 0.09) % 0.48));
        const r = 26 + (b % 3) * 18;
        const isAmber = b % 2 === 0;
        const g = ctx.createRadialGradient(bx, by, 2, bx, by, r);
        const alpha = 0.08 + 0.05 * Math.sin(t * 1.8 + b * 1.3);
        g.addColorStop(
          0,
          isAmber ? `rgba(242, 207, 126, ${alpha.toFixed(3)})` : `rgba(86, 212, 245, ${alpha.toFixed(3)})`,
        );
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(bx - r * 2, by - r, r * 4, r * 2);
      }
      ctx.restore();
    } else if (preset === 'uv_storm') {
      // Trigger dynamic forked lightning bolts
      if (t >= this.nextLightningAtSec) {
        this.spawnForkedLightning();
        this.nextLightningAtSec = t + 2.5 + Math.random() * 2.4;
      }
      this.lightningFlash01 *= Math.exp(-dt * 7.5);

      if (this.lightningFlash01 > 0.02) {
        ctx.fillStyle = `rgba(150, 215, 255, ${(this.lightningFlash01 * 0.22).toFixed(3)})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw active forked lightning bolts
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = this.activeBolts.length - 1; i >= 0; i--) {
        const bolt = this.activeBolts[i];
        bolt.life += dt;
        if (bolt.life >= bolt.maxLife) {
          this.activeBolts.splice(i, 1);
          continue;
        }
        const a = 1 - bolt.life / bolt.maxLife;
        const drawChain = (pts: Array<{ x: number; y: number }>, widthPx: number, stroke: string) => {
          if (pts.length < 2) return;
          ctx.strokeStyle = stroke;
          ctx.lineWidth = widthPx;
          ctx.beginPath();
          ctx.moveTo(pts[0].x * w, pts[0].y * h);
          for (let p = 1; p < pts.length; p++) {
            ctx.lineTo(pts[p].x * w, pts[p].y * h);
          }
          ctx.stroke();
        };
        drawChain(bolt.points, 5.5, `rgba(110, 195, 255, ${(a * 0.38).toFixed(3)})`);
        drawChain(bolt.points, 2.0, `rgba(235, 250, 255, ${(a * 0.95).toFixed(3)})`);
        for (const br of bolt.branches) {
          drawChain(br, 1.1, `rgba(180, 230, 255, ${(a * 0.75).toFixed(3)})`);
        }
      }
      ctx.restore();

      // Subtle crimson/ultraviolet security alarm vignette pulse
      const alarmAlpha = 0.07 + 0.06 * Math.max(0, Math.sin(t * 3.2));
      const alarm = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.25, w * 0.5, h * 0.5, w * 0.72);
      alarm.addColorStop(0, 'rgba(0,0,0,0)');
      alarm.addColorStop(1, `rgba(224, 82, 99, ${alarmAlpha.toFixed(3)})`);
      ctx.fillStyle = alarm;
      ctx.fillRect(0, 0, w, h);
    } else if (preset === 'ocean_mist') {
      // Twin sweeping Apex Forum spotlights converging onto the Championship Crown
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const crownX = w * 0.62;
      const crownY = h * 0.62;
      for (const srcXRatio of [0.43, 0.80]) {
        const sway = Math.sin(t * 0.85 + srcXRatio * 5) * w * 0.018;
        const sx = w * srcXRatio;
        const grad = ctx.createLinearGradient(sx, 0, crownX + sway, crownY);
        grad.addColorStop(0, 'rgba(255, 234, 178, 0.20)');
        grad.addColorStop(0.75, 'rgba(242, 207, 126, 0.11)');
        grad.addColorStop(1, 'rgba(242, 207, 126, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sx - w * 0.022, 0);
        ctx.lineTo(sx + w * 0.022, 0);
        ctx.lineTo(crownX + sway + w * 0.085, crownY + h * 0.12);
        ctx.lineTo(crownX + sway - w * 0.085, crownY + h * 0.12);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // 2) Update & Render Primary Particle Field
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (preset === 'alpine_snow' || preset === 'desert_dust') {
        p.x += Math.sin(t * 1.4 + p.phase) * 0.018 * dt;
      }

      if (p.y > 1.06) {
        p.y = -0.05;
        p.x = Math.random();
      } else if (p.y < -0.06) {
        p.y = 1.05;
        p.x = preset === 'ocean_mist' ? Math.random() * 0.55 : Math.random();
      }
      if (p.x > 1.06) p.x = -0.05;
      else if (p.x < -0.06) p.x = 1.05;

      const px = (p.x - this.pointerCurX * 0.012 * p.depth) * w;
      const py = (p.y - this.pointerCurY * 0.008 * p.depth) * h;

      if (preset === 'london_rain' || preset === 'neon_rain' || preset === 'uv_storm') {
        const dx = p.vx * 24;
        const dy = p.vy * 32;
        ctx.strokeStyle =
          preset === 'neon_rain' && p.hueIdx === 0
            ? `rgba(86, 212, 245, ${p.alpha.toFixed(3)})`
            : preset === 'neon_rain' && p.hueIdx === 1
              ? `rgba(242, 207, 126, ${(p.alpha * 0.85).toFixed(3)})`
              : `rgba(195, 222, 248, ${p.alpha.toFixed(3)})`;
        ctx.lineWidth = 0.8 + p.depth * 0.9;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + dx, py + dy);
        ctx.stroke();
      } else if (preset === 'alpine_snow') {
        const r = p.size;
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, `rgba(240, 248, 255, ${p.alpha.toFixed(3)})`);
        g.addColorStop(1, 'rgba(210, 232, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (preset === 'desert_dust') {
        // Dust motes brighten dramatically inside the Giza solar beam
        const inBeam = Math.exp(-Math.pow((p.x - 0.52) / 0.18, 2));
        const effAlpha = Math.min(0.92, p.alpha * (0.45 + inBeam * 1.4));
        const r = p.size * (1 + inBeam * 0.5);
        const g = ctx.createRadialGradient(px, py, 0, px, py, r * 2);
        g.addColorStop(0, `rgba(255, 226, 156, ${effAlpha.toFixed(3)})`);
        g.addColorStop(1, 'rgba(216, 175, 87, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r * 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // ocean_mist sea spray
        const r = p.size;
        const isGoldEmber = p.hueIdx === 1 && p.x > 0.38;
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        if (isGoldEmber) {
          g.addColorStop(0, `rgba(242, 207, 126, ${(p.alpha * 1.3).toFixed(3)})`);
          g.addColorStop(1, 'rgba(242, 207, 126, 0)');
        } else {
          g.addColorStop(0, `rgba(130, 235, 255, ${p.alpha.toFixed(3)})`);
          g.addColorStop(1, 'rgba(86, 212, 245, 0)');
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3) Refractive Window-Glass Droplets (London Rotunda & Geneva Monolith)
    if (this.droplets.length > 0) {
      for (const d of this.droplets) {
        d.slipTimer -= dt;
        if (d.slipTimer <= 0) {
          d.y += d.vy * dt * 2.2;
          if (d.slipTimer < -0.7) {
            d.slipTimer = 1.2 + Math.random() * 3.5;
          }
        } else {
          d.y += d.vy * dt * 0.15;
        }
        if (d.y > 0.92) {
          d.y = 0.05 + Math.random() * 0.15;
          d.x = 0.06 + Math.random() * 0.88;
        }
        const dx = d.x * w;
        const dy = d.y * h;
        // Faint trail
        ctx.strokeStyle = `rgba(195, 224, 248, ${(d.alpha * 0.25).toFixed(3)})`;
        ctx.lineWidth = d.radius * 0.65;
        ctx.beginPath();
        ctx.moveTo(dx, dy - d.radius * 4.5);
        ctx.lineTo(dx, dy);
        ctx.stroke();

        // Specular glass bead
        ctx.fillStyle = `rgba(225, 242, 255, ${d.alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(dx, dy, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // --------------------------------------------------------------------------
  // CLEAN TEARDOWN (Zero GPU / Event / Timer Leaks)
  // --------------------------------------------------------------------------

  public close(): void {
    this.audio.stopVoice();
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    for (const t of this.wordRevealTimers) clearTimeout(t);
    this.wordRevealTimers = [];
    if (this.summonsTimer) {
      clearTimeout(this.summonsTimer);
      this.summonsTimer = null;
    }
    if (this.summonsDissolveTimer) {
      clearTimeout(this.summonsDissolveTimer);
      this.summonsDissolveTimer = null;
    }
    if (this.summonsInterval) {
      clearInterval(this.summonsInterval);
      this.summonsInterval = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.boundPointerMove) {
      window.removeEventListener('pointermove', this.boundPointerMove);
      this.boundPointerMove = null;
    }
    if (this.boundResize) {
      window.removeEventListener('resize', this.boundResize);
      this.boundResize = null;
    }
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
      this.boundKeyDown = null;
    }

    if (this.glCtx) {
      try {
        const { gl, program, texture, vao } = this.glCtx;
        gl.deleteTexture(texture);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(program);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {
        // Ignore teardown errors
      }
      this.glCtx = null;
    }
    if (this.pausedStage3dDuringScene && this.linkedStage3d) {
      this.linkedStage3d.setPaused(false);
      this.pausedStage3dDuringScene = false;
    }
    this.fallback2dCtx = null;
    this.fxCtx = null;
    this.loadedImg = null;

    if (this.activeOverlay) {
      this.activeOverlay.remove();
      this.activeOverlay = null;
    }
  }

  public dispose(): void {
    this.audio.stopVoice();
    this.close();
  }
}
