// ============================================================================
// WORLD'S SMARTEST v5.0 — Diegetic Green-Room Theatrical Main Menu
// Matches approved visual target `mockup_v5_main_menu_1795482490248.jpg` 1:1:
//  • ZERO stacked dark-blue SaaS KPI boxes, ZERO glass blur filters, ZERO emojis
//  • Upper Theatrical Stage Vista: Era-evolving painted backdrop
//    (`V5_GREENROOM_BACKDROPS[era]`), parted crimson velvet curtains, golden
//    volumetric spotlight, sculpted laurel-brain crest, incandescent marquee
//    `WORLD'S SMARTEST` title, transparent-alpha Max Sterling (`max_welcome`)
//    with warm speech callout, and optional ringing Green-Room Brass Phone!
//  • Lower Tactile Mahogany & Brass Backstage Desk:
//    - Centerpiece glowing emerald-and-gold marquee ticket: `STEP ON STAGE`
//    - Left prop: Open cognac-leather `TOUR TRUNK` with peeking Polaroids
//    - Right prop: Knurled brass rotary `TOPIC DIAL · 12 Categories`
//    - Lower-left prop: Glowing red vintage `DAILY SHOW` ticket dispenser
//    - Lower-right prop: Flaming emerald-and-gold `ENDLESS STREAK` medallion
//    - Corner sculpted brass medallions: `STATS RADAR`, `100 TROPHIES`,
//      `DOSSIER SAVES`, and `AUDIO ON/OFF`
//  • Self-contained `<style id="v5-greenroom-styles">` — renders faithfully
//    standalone AND harmoniously alongside `src/styles/showtime_v5.css`!
// ============================================================================

import {
  V5_CAST_CUTOUTS,
  V5_GREENROOM_BACKDROPS,
  type BranchingCampaignSaveStateV5,
  type GreenRoomEraV5,
} from './contracts_v5';

export interface GreenRoomMenuViewModel {
  readonly era: GreenRoomEraV5;
  readonly isFreshSave: boolean;
  readonly stepOnStageSubtitle?: string;
  readonly currentAct?: 1 | 2 | 3 | 4 | 5;
  readonly currentVenueName?: string;
  readonly currentShowTitle?: string;
  readonly contestantName?: string;
  readonly hostCallout?: string;
  readonly inboxCount: number;
  readonly inboxHeadline?: string;
  readonly inboxCallerName?: string;
  readonly tourProgressLabel?: string;
  readonly dailyBroadcastNumber?: number;
  readonly dailyBroadcastLabel?: string;
  readonly dailyCompletedToday?: boolean;
  readonly endlessBestStreak: number;
  readonly trophiesUnlockedCount?: number;
  readonly trophiesTotalCount?: number;
  readonly audioEnabled: boolean;
  readonly activeSaveSlotLabel?: string;
}

export interface GreenRoomMenuCallbacks {
  readonly onStepOnStage: () => void;
  readonly onOpenTourTrunk: () => void;
  readonly onOpenTopicJukebox: () => void;
  readonly onStartDaily: () => void;
  readonly onStartEndless: () => void;
  readonly onOpenStatsRadar: () => void;
  readonly onOpenTrophies: () => void;
  readonly onOpenSaves: () => void;
  readonly onToggleAudio: () => void;
  readonly onToggleFullscreen?: (isFullscreen: boolean) => void;
  readonly onOpenInboxCall?: () => void;
  readonly onInteractionFeedback?: (kind: 'hover' | 'tap' | 'ring') => void;
}

const STYLE_ID = 'v5-greenroom-styles';

function escapeHtml(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function romanAct(act: 1 | 2 | 3 | 4 | 5): string {
  switch (act) {
    case 1:
      return 'Act I';
    case 2:
      return 'Act II';
    case 3:
      return 'Act III';
    case 4:
      return 'Act IV';
    case 5:
      return 'Act V';
  }
}

export function deriveGreenRoomEra(currentAct: 1 | 2 | 3 | 4 | 5): GreenRoomEraV5 {
  if (currentAct <= 1) return 'LOCAL_PUB';
  if (currentAct <= 3) return 'TV_DRESSING_ROOM';
  return 'GLOBAL_VIP_SUITE';
}

export function buildGreenRoomModelFromSave(
  save: BranchingCampaignSaveStateV5,
  extras?: Partial<GreenRoomMenuViewModel>,
): GreenRoomMenuViewModel {
  const isFreshSave = !save.coldOpenCompleted && save.totalMatchesPlayed === 0;
  const era = extras?.era ?? deriveGreenRoomEra(save.currentAct);
  const totalStars = Object.values(save.nodeStars).reduce<number>((acc, s) => acc + s, 0);
  const inboxCount = extras?.inboxCount ?? save.inboxCallsQueue.length;

  return {
    era,
    isFreshSave,
    currentAct: save.currentAct,
    contestantName: save.contestantName,
    inboxCount,
    tourProgressLabel:
      extras?.tourProgressLabel ??
      (isFreshSave ? 'Open Tour Map' : `${romanAct(save.currentAct)} · ${totalStars} Stars`),
    endlessBestStreak: extras?.endlessBestStreak ?? 0,
    audioEnabled: extras?.audioEnabled ?? true,
    trophiesTotalCount: extras?.trophiesTotalCount ?? 100,
    ...extras,
  };
}

function defaultHostCallout(model: GreenRoomMenuViewModel): string {
  if (model.hostCallout && model.hostCallout.trim().length > 0) {
    return model.hostCallout.trim();
  }
  if (model.isFreshSave) {
    return 'Folding chairs are squeaking out front. Grab the mic for your live open-call audition.';
  }
  if (model.era === 'GLOBAL_VIP_SUITE') {
    return 'Forty-two satellite uplinks are blinking green. Ready to step under the stadium lights?';
  }
  if (model.era === 'TV_DRESSING_ROOM') {
    return 'Stagehand just chalked your mark on Floor Two. Coffee down, collar straight — you are up.';
  }
  return 'Frankie already put twenty bucks on table four. Step back out before the beer gets warm.';
}

function resolveStepSubtitle(model: GreenRoomMenuViewModel): string {
  if (model.stepOnStageSubtitle && model.stepOnStageSubtitle.trim().length > 0) {
    return model.stepOnStageSubtitle.trim();
  }
  if (model.isFreshSave) {
    return 'Start Playable Story Audition';
  }
  const actLabel = romanAct(model.currentAct ?? 1);
  if (model.currentVenueName) {
    return `${actLabel} · ${model.currentVenueName}`;
  }
  if (model.currentShowTitle) {
    return `${actLabel} · ${model.currentShowTitle}`;
  }
  return `${actLabel} · Live Broadcast Stage`;
}

function resolveDailyTicketCode(model: GreenRoomMenuViewModel): string {
  if (model.dailyCompletedToday) {
    return 'CLEARED';
  }
  if (model.dailyBroadcastLabel && model.dailyBroadcastLabel.trim().length > 0) {
    return model.dailyBroadcastLabel.trim();
  }
  if (typeof model.dailyBroadcastNumber === 'number' && Number.isFinite(model.dailyBroadcastNumber)) {
    return `#${Math.max(1, Math.round(model.dailyBroadcastNumber))}`;
  }
  return 'TICKET';
}

// ============================================================================
// BESPOKE THEATRICAL SVG ARTWORK (ZERO EMOJIS · MULTI-GRADIENT METALLIC CRAFT)
// ============================================================================

function renderLeftCurtainSvg(): string {
  return `
    <svg class="v5gr-curtain-svg" viewBox="0 0 180 540" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-velvet-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#380408"/>
          <stop offset="22%" stop-color="#7c0c16"/>
          <stop offset="44%" stop-color="#a81b25"/>
          <stop offset="64%" stop-color="#5d070f"/>
          <stop offset="86%" stop-color="#981620"/>
          <stop offset="100%" stop-color="#400409"/>
        </linearGradient>
        <linearGradient id="v5gr-gold-cord" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff0a8"/>
          <stop offset="50%" stop-color="#d49b35"/>
          <stop offset="100%" stop-color="#7b4e0c"/>
        </linearGradient>
      </defs>
      <path d="M 0 0 L 172 0 C 138 118, 102 228, 66 322 C 92 385, 86 462, 92 540 L 0 540 Z" fill="url(#v5gr-velvet-l)"/>
      <path d="M 28 0 C 20 115, 22 225, 42 326 C 28 402, 24 468, 28 540" fill="none" stroke="rgba(255,140,145,0.22)" stroke-width="5"/>
      <path d="M 76 0 C 66 115, 58 228, 54 322 C 58 405, 56 472, 62 540" fill="none" stroke="rgba(18,0,2,0.52)" stroke-width="9"/>
      <path d="M 122 0 C 102 108, 82 214, 62 322" fill="none" stroke="rgba(255,130,130,0.18)" stroke-width="6"/>
      <path d="M 164 0 C 132 115, 98 226, 65 322" fill="none" stroke="#d9a13b" stroke-width="2.5" opacity="0.62"/>
      <!-- Gold velvet tieback sash -->
      <path d="M 0 308 Q 38 334, 72 320 L 70 336 Q 36 350, 0 326 Z" fill="url(#v5gr-gold-cord)" stroke="#5c3606" stroke-width="1.4"/>
      <circle cx="71" cy="328" r="7" fill="url(#v5gr-gold-cord)" stroke="#5c3606" stroke-width="1.3"/>
    </svg>
  `;
}

function renderRightCurtainSvg(): string {
  return `
    <svg class="v5gr-curtain-svg" viewBox="0 0 180 540" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-velvet-r" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stop-color="#380408"/>
          <stop offset="22%" stop-color="#7c0c16"/>
          <stop offset="44%" stop-color="#a81b25"/>
          <stop offset="64%" stop-color="#5d070f"/>
          <stop offset="86%" stop-color="#981620"/>
          <stop offset="100%" stop-color="#400409"/>
        </linearGradient>
        <linearGradient id="v5gr-gold-cord-r" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff0a8"/>
          <stop offset="50%" stop-color="#d49b35"/>
          <stop offset="100%" stop-color="#7b4e0c"/>
        </linearGradient>
      </defs>
      <path d="M 180 0 L 8 0 C 42 118, 78 228, 114 322 C 88 385, 94 462, 88 540 L 180 540 Z" fill="url(#v5gr-velvet-r)"/>
      <path d="M 152 0 C 160 115, 158 225, 138 326 C 152 402, 156 468, 152 540" fill="none" stroke="rgba(255,140,145,0.22)" stroke-width="5"/>
      <path d="M 104 0 C 114 115, 122 228, 126 322 C 122 405, 124 472, 118 540" fill="none" stroke="rgba(18,0,2,0.52)" stroke-width="9"/>
      <path d="M 58 0 C 78 108, 98 214, 118 322" fill="none" stroke="rgba(255,130,130,0.18)" stroke-width="6"/>
      <path d="M 16 0 C 48 115, 82 226, 115 322" fill="none" stroke="#d9a13b" stroke-width="2.5" opacity="0.62"/>
      <!-- Gold velvet tieback sash -->
      <path d="M 180 308 Q 142 334, 108 320 L 110 336 Q 144 350, 180 326 Z" fill="url(#v5gr-gold-cord-r)" stroke="#5c3606" stroke-width="1.4"/>
      <circle cx="109" cy="328" r="7" fill="url(#v5gr-gold-cord-r)" stroke="#5c3606" stroke-width="1.3"/>
    </svg>
  `;
}

function renderLaurelBrainCrestSvg(): string {
  return `
    <svg class="v5gr-crest-svg" viewBox="0 0 220 156" role="img" aria-label="World's Smartest Golden Laurel Brain Crest">
      <defs>
        <radialGradient id="v5gr-crest-aura" cx="50%" cy="44%" r="50%">
          <stop offset="0%" stop-color="#ffe799" stop-opacity="0.58"/>
          <stop offset="55%" stop-color="#d89226" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#d89226" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="v5gr-gold-metal" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stop-color="#fff7c8"/>
          <stop offset="28%" stop-color="#f5c654"/>
          <stop offset="64%" stop-color="#b87618"/>
          <stop offset="88%" stop-color="#eab646"/>
          <stop offset="100%" stop-color="#7c4909"/>
        </linearGradient>
        <linearGradient id="v5gr-brain-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff6c2"/>
          <stop offset="38%" stop-color="#f2be47"/>
          <stop offset="76%" stop-color="#b26f13"/>
          <stop offset="100%" stop-color="#734206"/>
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="68" rx="92" ry="64" fill="url(#v5gr-crest-aura)"/>
      <!-- Left Laurel Wreath -->
      <g fill="url(#v5gr-gold-metal)" stroke="#6d3e07" stroke-width="1.2">
        <path d="M 103 122 C 62 114, 34 84, 38 40 C 42 26, 48 16, 56 10" fill="none" stroke="url(#v5gr-gold-metal)" stroke-width="4" stroke-linecap="round"/>
        <path d="M 46 28 C 36 18, 38 7, 50 10 C 56 19, 54 27, 46 28 Z"/>
        <path d="M 38 47 C 24 38, 22 25, 36 27 C 44 34, 44 43, 38 47 Z"/>
        <path d="M 36 68 C 20 62, 16 49, 31 48 C 40 53, 42 63, 36 68 Z"/>
        <path d="M 42 88 C 25 87, 20 74, 34 70 C 44 74, 47 83, 42 88 Z"/>
        <path d="M 55 106 C 39 109, 32 98, 45 90 C 56 92, 60 100, 55 106 Z"/>
        <path d="M 75 118 C 60 124, 52 115, 64 105 C 75 106, 80 112, 75 118 Z"/>
        <!-- Inner leaves -->
        <path d="M 50 38 C 60 28, 66 36, 56 48 Z"/>
        <path d="M 46 58 C 58 51, 63 60, 51 70 Z"/>
        <path d="M 51 80 C 64 75, 67 85, 55 93 Z"/>
        <path d="M 65 98 C 78 96, 79 106, 68 111 Z"/>
      </g>
      <!-- Right Laurel Wreath (mirrored) -->
      <g transform="translate(220, 0) scale(-1, 1)" fill="url(#v5gr-gold-metal)" stroke="#6d3e07" stroke-width="1.2">
        <path d="M 103 122 C 62 114, 34 84, 38 40 C 42 26, 48 16, 56 10" fill="none" stroke="url(#v5gr-gold-metal)" stroke-width="4" stroke-linecap="round"/>
        <path d="M 46 28 C 36 18, 38 7, 50 10 C 56 19, 54 27, 46 28 Z"/>
        <path d="M 38 47 C 24 38, 22 25, 36 27 C 44 34, 44 43, 38 47 Z"/>
        <path d="M 36 68 C 20 62, 16 49, 31 48 C 40 53, 42 63, 36 68 Z"/>
        <path d="M 42 88 C 25 87, 20 74, 34 70 C 44 74, 47 83, 42 88 Z"/>
        <path d="M 55 106 C 39 109, 32 98, 45 90 C 56 92, 60 100, 55 106 Z"/>
        <path d="M 75 118 C 60 124, 52 115, 64 105 C 75 106, 80 112, 75 118 Z"/>
        <path d="M 50 38 C 60 28, 66 36, 56 48 Z"/>
        <path d="M 46 58 C 58 51, 63 60, 51 70 Z"/>
        <path d="M 51 80 C 64 75, 67 85, 55 93 Z"/>
        <path d="M 65 98 C 78 96, 79 106, 68 111 Z"/>
      </g>
      <!-- Sculpted Golden Trophy Pedestal Base -->
      <path d="M 96 116 L 124 116 L 119 132 L 101 132 Z" fill="url(#v5gr-gold-metal)" stroke="#623805" stroke-width="1.3"/>
      <ellipse cx="110" cy="136" rx="28" ry="8" fill="url(#v5gr-gold-metal)" stroke="#5c3305" stroke-width="1.5"/>
      <ellipse cx="110" cy="142" rx="34" ry="8" fill="url(#v5gr-gold-metal)" stroke="#4c2804" stroke-width="1.6"/>
      <!-- Sculpted Golden Brain Emblem (Dual Hemispheres + Cortical Folds) -->
      <g transform="translate(110, 62)">
        <!-- Left Hemisphere -->
        <path d="M -2 -36 C -16 -38, -32 -30, -37 -16 C -43 -4, -40 12, -29 20 C -22 25, -10 25, -2 21 Z"
              fill="url(#v5gr-brain-grad)" stroke="#5b3204" stroke-width="2.2" stroke-linejoin="round"/>
        <!-- Right Hemisphere -->
        <path d="M 2 -36 C 16 -38, 32 -30, 37 -16 C 43 -4, 40 12, 29 20 C 22 25, 10 25, 2 21 Z"
              fill="url(#v5gr-brain-grad)" stroke="#5b3204" stroke-width="2.2" stroke-linejoin="round"/>
        <!-- Cerebellum / Brainstem Accent -->
        <path d="M -14 23 C -9 31, 9 31, 14 23 C 8 34, 4 39, 0 41 C -4 39, -8 34, -14 23 Z"
              fill="url(#v5gr-gold-metal)" stroke="#5b3204" stroke-width="1.8"/>
        <!-- Central Longitudinal Fissure -->
        <line x1="0" y1="-35" x2="0" y2="23" stroke="#5a3104" stroke-width="2.6" stroke-linecap="round"/>
        <!-- Left Hemisphere Cortical Gyri -->
        <path d="M -28 -20 C -20 -26, -9 -22, -7 -13 C -6 -6, -15 -2, -22 -7" fill="none" stroke="#6a3b06" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M -33 -3 C -24 2, -14 1, -8 -4" fill="none" stroke="#6a3b06" stroke-width="2.1" stroke-linecap="round"/>
        <path d="M -28 11 C -19 16, -9 14, -5 6" fill="none" stroke="#6a3b06" stroke-width="2.1" stroke-linecap="round"/>
        <!-- Right Hemisphere Cortical Gyri -->
        <path d="M 28 -20 C 20 -26, 9 -22, 7 -13 C 6 -6, 15 -2, 22 -7" fill="none" stroke="#6a3b06" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M 33 -3 C 24 2, 14 1, 8 -4" fill="none" stroke="#6a3b06" stroke-width="2.1" stroke-linecap="round"/>
        <path d="M 28 11 C 19 16, 9 14, 5 6" fill="none" stroke="#6a3b06" stroke-width="2.1" stroke-linecap="round"/>
        <!-- Metallic Rim Specular Glints -->
        <path d="M -24 -27 C -16 -32, -8 -32, -4 -29" fill="none" stroke="#fffbe0" stroke-width="2" stroke-linecap="round" opacity="0.86"/>
        <path d="M 24 -27 C 16 -32, 8 -32, 4 -29" fill="none" stroke="#fffbe0" stroke-width="1.9" stroke-linecap="round" opacity="0.78"/>
      </g>
    </svg>
  `;
}

function renderMarqueeTitleSvg(): string {
  return `
    <svg class="v5gr-title-svg" viewBox="0 0 640 162" role="img" aria-label="World's Smartest">
      <defs>
        <linearGradient id="v5gr-title-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8d4"/>
          <stop offset="28%" stop-color="#ffd56b"/>
          <stop offset="56%" stop-color="#e39d28"/>
          <stop offset="85%" stop-color="#f7c956"/>
          <stop offset="100%" stop-color="#a2610c"/>
        </linearGradient>
        <filter id="v5gr-title-glow" x="-12%" y="-20%" width="124%" height="145%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" flood-color="#1c0902" flood-opacity="0.92"/>
          <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#ffbe44" flood-opacity="0.52"/>
        </filter>
      </defs>
      <!-- Line 1: WORLD'S -->
      <g filter="url(#v5gr-title-glow)">
        <text x="320" y="68" text-anchor="middle" class="v5gr-svg-title-shadow" font-size="68" letter-spacing="4">WORLD'S</text>
        <text x="320" y="64" text-anchor="middle" class="v5gr-svg-title-bevel" font-size="68" letter-spacing="4">WORLD'S</text>
        <text x="320" y="64" text-anchor="middle" class="v5gr-svg-title-face" font-size="68" letter-spacing="4" fill="url(#v5gr-title-gold)">WORLD'S</text>
        <text x="320" y="64" text-anchor="middle" class="v5gr-svg-title-bulbs-halo" font-size="68" letter-spacing="4">WORLD'S</text>
        <text x="320" y="64" text-anchor="middle" class="v5gr-svg-title-bulbs" font-size="68" letter-spacing="4">WORLD'S</text>
      </g>
      <!-- Line 2: SMARTEST -->
      <g filter="url(#v5gr-title-glow)">
        <text x="320" y="144" text-anchor="middle" class="v5gr-svg-title-shadow" font-size="74" letter-spacing="3.5">SMARTEST</text>
        <text x="320" y="140" text-anchor="middle" class="v5gr-svg-title-bevel" font-size="74" letter-spacing="3.5">SMARTEST</text>
        <text x="320" y="140" text-anchor="middle" class="v5gr-svg-title-face" font-size="74" letter-spacing="3.5" fill="url(#v5gr-title-gold)">SMARTEST</text>
        <text x="320" y="140" text-anchor="middle" class="v5gr-svg-title-bulbs-halo" font-size="74" letter-spacing="3.5">SMARTEST</text>
        <text x="320" y="140" text-anchor="middle" class="v5gr-svg-title-bulbs v5gr-svg-title-bulbs-alt" font-size="74" letter-spacing="3.5">SMARTEST</text>
      </g>
    </svg>
  `;
}

function renderBrassPhoneSvg(): string {
  return `
    <svg class="v5gr-phone-svg" viewBox="0 0 88 76" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-brass-p" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff4bf"/>
          <stop offset="40%" stop-color="#e4ac3d"/>
          <stop offset="80%" stop-color="#9e6514"/>
          <stop offset="100%" stop-color="#5d3607"/>
        </linearGradient>
      </defs>
      <!-- Acoustic ring waves -->
      <path class="v5gr-ring-wave" d="M 14 14 Q 6 24, 14 34" fill="none" stroke="#ffd86b" stroke-width="2.6" stroke-linecap="round"/>
      <path class="v5gr-ring-wave" d="M 74 14 Q 82 24, 74 34" fill="none" stroke="#ffd86b" stroke-width="2.6" stroke-linecap="round"/>
      <!-- Cradle base -->
      <path d="M 22 66 L 66 66 L 60 40 L 28 40 Z" fill="url(#v5gr-brass-p)" stroke="#4c2905" stroke-width="2"/>
      <rect x="18" y="64" width="52" height="7" rx="3" fill="url(#v5gr-brass-p)" stroke="#4c2905" stroke-width="1.8"/>
      <!-- Rotary dial -->
      <circle cx="44" cy="52" r="10.5" fill="#2c1709" stroke="#f6c758" stroke-width="2"/>
      <circle cx="44" cy="52" r="4.2" fill="#e8b648"/>
      <circle cx="38" cy="48" r="1.4" fill="#fff0b3"/>
      <circle cx="44" cy="45" r="1.4" fill="#fff0b3"/>
      <circle cx="50" cy="48" r="1.4" fill="#fff0b3"/>
      <circle cx="51" cy="54" r="1.4" fill="#fff0b3"/>
      <!-- Cradle forks -->
      <path d="M 33 40 L 31 28 M 55 40 L 57 28" stroke="#f0be4d" stroke-width="3.2" stroke-linecap="round"/>
      <!-- Rattling Handset -->
      <g class="v5gr-phone-handset">
        <path d="M 18 22 C 26 11, 62 11, 70 22 C 74 26, 70 33, 63 31 L 58 26 C 50 22, 38 22, 30 26 L 25 31 C 18 33, 14 26, 18 22 Z"
              fill="url(#v5gr-brass-p)" stroke="#4b2905" stroke-width="2"/>
      </g>
    </svg>
  `;
}

function renderTourTrunkSvg(): string {
  return `
    <svg class="v5gr-prop-svg v5gr-trunk-svg" viewBox="0 0 210 142" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-leather" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#c67638"/>
          <stop offset="48%" stop-color="#8d491d"/>
          <stop offset="100%" stop-color="#51240a"/>
        </linearGradient>
        <linearGradient id="v5gr-leather-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a85c27"/>
          <stop offset="100%" stop-color="#4e230b"/>
        </linearGradient>
        <linearGradient id="v5gr-trunk-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff0a6"/>
          <stop offset="50%" stop-color="#d89d30"/>
          <stop offset="100%" stop-color="#7d4d0c"/>
        </linearGradient>
        <linearGradient id="v5gr-polaroid-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f7c873"/>
          <stop offset="55%" stop-color="#9e5a38"/>
          <stop offset="100%" stop-color="#22192b"/>
        </linearGradient>
        <linearGradient id="v5gr-polaroid-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#75b6d9"/>
          <stop offset="60%" stop-color="#30577c"/>
          <stop offset="100%" stop-color="#132133"/>
        </linearGradient>
      </defs>
      <!-- Desk contact shadow -->
      <ellipse cx="106" cy="129" rx="84" ry="11" fill="rgba(8,3,1,0.68)"/>
      <!-- Hinged Open Lid (Back) -->
      <path d="M 28 24 L 140 12 L 152 68 L 40 82 Z" fill="url(#v5gr-leather-lid)" stroke="#3e1b07" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M 35 28 L 134 18 L 144 64 L 45 76 Z" fill="#3a190a" stroke="#6f3615" stroke-width="1.4"/>
      <!-- Lid brass clasps -->
      <rect x="44" y="13" width="16" height="9" rx="2" transform="rotate(-6 52 17)" fill="url(#v5gr-trunk-brass)" stroke="#4c2906" stroke-width="1.2"/>
      <rect x="115" y="6" width="16" height="9" rx="2" transform="rotate(-6 123 10)" fill="url(#v5gr-trunk-brass)" stroke="#4c2906" stroke-width="1.2"/>
      <!-- Trunk interior cavity -->
      <polygon points="34,76 144,62 182,82 74,100" fill="#2c1308" stroke="#5c2b10" stroke-width="1.8"/>
      <!-- 3 Angled Peeking Miniature Polaroids -->
      <g class="v5gr-trunk-polaroids">
        <!-- Left Polaroid -->
        <g transform="translate(76, 70) rotate(-18)">
          <rect x="-20" y="-26" width="38" height="44" rx="2" fill="#f7efdd" stroke="#c8b99c" stroke-width="1.2"/>
          <rect x="-16" y="-22" width="30" height="28" fill="url(#v5gr-polaroid-blue)"/>
          <path d="M -16 6 L -6 -7 L 3 1 L 10 -10 L 14 6 Z" fill="#172230"/>
        </g>
        <!-- Right Polaroid -->
        <g transform="translate(132, 69) rotate(13)">
          <rect x="-20" y="-26" width="38" height="44" rx="2" fill="#f5ead4" stroke="#c8b99c" stroke-width="1.2"/>
          <rect x="-16" y="-22" width="30" height="28" fill="url(#v5gr-polaroid-sky)"/>
          <path d="M -16 6 L -8 -12 L 4 -3 L 14 -14 L 14 6 Z" fill="#261714"/>
        </g>
        <!-- Center Hero Polaroid -->
        <g transform="translate(105, 74) rotate(-3)">
          <rect x="-22" y="-28" width="42" height="48" rx="2.5" fill="#fffaf0" stroke="#d5c6a8" stroke-width="1.4"/>
          <rect x="-17" y="-23" width="32" height="30" fill="url(#v5gr-polaroid-sky)"/>
          <circle cx="6" cy="-14" r="5" fill="#fff0b3" opacity="0.88"/>
          <path d="M -17 7 L -7 -9 L 2 -2 L 10 -12 L 15 7 Z" fill="#1e1518"/>
        </g>
      </g>
      <!-- Trunk Lower Front & Side Body -->
      <polygon points="34,76 74,100 74,132 34,106" fill="#6b3413" stroke="#361606" stroke-width="2.2" stroke-linejoin="round"/>
      <polygon points="74,100 182,82 182,114 74,132" fill="url(#v5gr-leather)" stroke="#361606" stroke-width="2.2" stroke-linejoin="round"/>
      <!-- Stitched leather rim highlight -->
      <line x1="77" y1="103" x2="179" y2="86" stroke="#e49b5b" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.55"/>
      <!-- Brass Corner Guards & Rivets -->
      <path d="M 74 100 L 89 97 L 89 108 L 74 111 Z" fill="url(#v5gr-trunk-brass)" stroke="#4c2a06" stroke-width="1.3"/>
      <path d="M 74 121 L 89 118 L 89 129 L 74 132 Z" fill="url(#v5gr-trunk-brass)" stroke="#4c2a06" stroke-width="1.3"/>
      <path d="M 167 84 L 182 82 L 182 93 L 167 96 Z" fill="url(#v5gr-trunk-brass)" stroke="#4c2a06" stroke-width="1.3"/>
      <path d="M 167 105 L 182 103 L 182 114 L 167 117 Z" fill="url(#v5gr-trunk-brass)" stroke="#4c2a06" stroke-width="1.3"/>
      <!-- Brass Locks -->
      <rect x="97" y="96" width="11" height="12" rx="2" transform="skewY(-9)" fill="url(#v5gr-trunk-brass)" stroke="#4a2905" stroke-width="1.2"/>
      <rect x="149" y="88" width="11" height="12" rx="2" transform="skewY(-9)" fill="url(#v5gr-trunk-brass)" stroke="#4a2905" stroke-width="1.2"/>
      <!-- Leather Carry Handle -->
      <path d="M 114 110 C 114 124, 146 119, 146 105" fill="none" stroke="#471d08" stroke-width="8" stroke-linecap="round"/>
      <path d="M 114 110 C 114 124, 146 119, 146 105" fill="none" stroke="#ba6c31" stroke-width="4.4" stroke-linecap="round"/>
      <circle cx="114" cy="109" r="3.4" fill="url(#v5gr-trunk-brass)" stroke="#4b2905" stroke-width="1"/>
      <circle cx="146" cy="104" r="3.4" fill="url(#v5gr-trunk-brass)" stroke="#4b2905" stroke-width="1"/>
    </svg>
  `;
}

function renderTopicDialSvg(): string {
  const ticks: string[] = [];
  for (let i = 0; i < 12; i++) {
    const rad = (i * 30 * Math.PI) / 180;
    const x1 = 105 + Math.cos(rad) * 53;
    const y1 = 68 + Math.sin(rad) * 23;
    const x2 = 105 + Math.cos(rad) * 66;
    const y2 = 68 + Math.sin(rad) * 29;
    ticks.push(
      `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#4a2a05" stroke-width="2.4" stroke-linecap="round"/>`,
    );
  }
  return `
    <svg class="v5gr-prop-svg v5gr-dial-svg" viewBox="0 0 210 132" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-dial-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#5e3708"/>
          <stop offset="26%" stop-color="#e5b146"/>
          <stop offset="50%" stop-color="#fff0a6"/>
          <stop offset="76%" stop-color="#ba7e1f"/>
          <stop offset="100%" stop-color="#4c2a06"/>
        </linearGradient>
        <radialGradient id="v5gr-dial-face" cx="46%" cy="38%" r="60%">
          <stop offset="0%" stop-color="#fff6c7"/>
          <stop offset="46%" stop-color="#e4ad3d"/>
          <stop offset="85%" stop-color="#a66c17"/>
          <stop offset="100%" stop-color="#6b4009"/>
        </radialGradient>
        <radialGradient id="v5gr-dial-cap" cx="44%" cy="34%" r="64%">
          <stop offset="0%" stop-color="#fff9d8"/>
          <stop offset="42%" stop-color="#f0be4c"/>
          <stop offset="100%" stop-color="#965e12"/>
        </radialGradient>
      </defs>
      <!-- Contact shadow -->
      <ellipse cx="105" cy="108" rx="88" ry="18" fill="rgba(8,3,1,0.72)"/>
      <!-- Base flange rim -->
      <ellipse cx="105" cy="94" rx="82" ry="30" fill="url(#v5gr-dial-side)" stroke="#482705" stroke-width="2.2"/>
      <ellipse cx="105" cy="87" rx="80" ry="29" fill="url(#v5gr-dial-face)" stroke="#623808" stroke-width="1.6"/>
      <!-- Knurled cylinder skirt -->
      <path d="M 33 70 L 33 84 A 72 28 0 0 0 177 84 L 177 70 Z" fill="url(#v5gr-dial-side)" stroke="#4d2b05" stroke-width="1.8"/>
      <!-- Knurling teeth notches along skirt -->
      <path d="M 42 78 L 42 90 M 54 83 L 54 95 M 68 87 L 68 99 M 82 90 L 82 102 M 96 91 L 96 104 M 112 91 L 112 104 M 126 90 L 126 102 M 140 87 L 140 99 M 154 83 L 154 95 M 166 78 L 166 90"
            stroke="#593306" stroke-width="2" opacity="0.72"/>
      <!-- Main Rotary Top Plate -->
      <g class="v5gr-dial-rotor">
        <ellipse cx="105" cy="68" rx="72" ry="31" fill="url(#v5gr-dial-face)" stroke="#fff0a6" stroke-width="1.8"/>
        <ellipse cx="105" cy="68" rx="51" ry="21" fill="none" stroke="#6c3f09" stroke-width="2"/>
        ${ticks.join('')}
        <!-- Raised Machined Center Cap -->
        <path d="M 67 52 L 67 66 A 38 16 0 0 0 143 66 L 143 52 Z" fill="url(#v5gr-dial-side)" stroke="#4d2b05" stroke-width="1.6"/>
        <ellipse cx="105" cy="52" rx="38" ry="16" fill="url(#v5gr-dial-cap)" stroke="#fff4bc" stroke-width="1.5"/>
        <ellipse cx="105" cy="52" rx="28" ry="11" fill="none" stroke="#996114" stroke-width="1.2" opacity="0.6"/>
        <!-- Indicator dimple -->
        <circle cx="105" cy="86" r="3.4" fill="#18a572" stroke="#fff2b5" stroke-width="1.2"/>
      </g>
    </svg>
  `;
}

function renderDailyDispenserSvg(ticketCode: string, completed: boolean): string {
  const safeCode = escapeHtml(ticketCode);
  return `
    <svg class="v5gr-prop-svg v5gr-daily-svg" viewBox="0 0 190 162" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-red-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d82b27"/>
          <stop offset="48%" stop-color="#9e1416"/>
          <stop offset="100%" stop-color="#530608"/>
        </linearGradient>
        <linearGradient id="v5gr-red-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff9955"/>
          <stop offset="50%" stop-color="#e33622"/>
          <stop offset="100%" stop-color="#9e1214"/>
        </linearGradient>
        <linearGradient id="v5gr-cream-lit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8dd"/>
          <stop offset="65%" stop-color="#f6d893"/>
          <stop offset="100%" stop-color="#d8a24a"/>
        </linearGradient>
        <linearGradient id="v5gr-disp-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff0a6"/>
          <stop offset="52%" stop-color="#dc9e31"/>
          <stop offset="100%" stop-color="#764509"/>
        </linearGradient>
        <linearGradient id="v5gr-ticket-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff2b0"/>
          <stop offset="100%" stop-color="#d69527"/>
        </linearGradient>
      </defs>
      <!-- Wooden corbel shelf -->
      <polygon points="22,126 118,144 156,120 60,104" fill="#6d3516" stroke="#311406" stroke-width="2"/>
      <polygon points="22,126 118,144 118,156 22,138" fill="#47200c" stroke="#260f04" stroke-width="1.8"/>
      <!-- Dispenser Housing Side (glowing red vintage lamp window) -->
      <path d="M 32 34 C 32 22, 46 15, 62 18 L 106 28 C 118 31, 124 41, 124 54 L 124 128 L 78 136 L 32 114 Z"
            fill="url(#v5gr-red-body)" stroke="#3e0708" stroke-width="2.4" stroke-linejoin="round"/>
      <!-- Side backlit sconce panel -->
      <path d="M 41 44 C 41 38, 49 35, 58 38 L 69 42 L 69 112 L 41 99 Z" fill="url(#v5gr-red-glow)" stroke="url(#v5gr-disp-gold)" stroke-width="2.6"/>
      <!-- Front Faceplate -->
      <path d="M 78 46 C 78 36, 92 28, 108 28 L 136 24 C 145 24, 150 32, 150 42 L 150 116 L 78 136 Z"
            fill="url(#v5gr-red-body)" stroke="url(#v5gr-disp-gold)" stroke-width="2.6" stroke-linejoin="round"/>
      <!-- Illuminated DAILY SHOW Glass Sign -->
      <polygon points="88,48 142,37 142,87 88,99" fill="url(#v5gr-cream-lit)" stroke="url(#v5gr-disp-gold)" stroke-width="3"/>
      <g transform="matrix(1, -0.21, 0, 1, 115, 66)">
        <text x="0" y="-4" text-anchor="middle" fill="#6a1b08" font-family="Cinzel, Georgia, serif" font-weight="800" font-size="14" letter-spacing="0.6">DAILY</text>
        <text x="0" y="13" text-anchor="middle" fill="#6a1b08" font-family="Cinzel, Georgia, serif" font-weight="800" font-size="14" letter-spacing="0.6">SHOW</text>
      </g>
      <!-- Brass Ticket Dispenser Slot -->
      <polygon points="94,108 140,97 140,106 94,117" fill="#1e0a04" stroke="url(#v5gr-disp-gold)" stroke-width="2"/>
      <!-- Protruding Perforated Golden Ticket -->
      <g class="v5gr-daily-ticket">
        <path d="M 103 111 L 133 103 L 166 135 L 158 140 L 160 144 L 151 146 L 149 151 L 139 150 L 136 155 L 103 111 Z"
              fill="${completed ? '#167d57' : 'url(#v5gr-ticket-gold)'}" stroke="#693e07" stroke-width="1.8" stroke-linejoin="round"/>
        <text x="135" y="132" text-anchor="middle" transform="rotate(42 135 132)"
              fill="${completed ? '#fff6cf' : '#422004'}" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11.5" letter-spacing="0.8">${safeCode}</text>
      </g>
    </svg>
  `;
}

function renderEndlessFlameMedallionSvg(): string {
  return `
    <svg class="v5gr-prop-svg v5gr-endless-svg" viewBox="0 0 180 166" aria-hidden="true">
      <defs>
        <radialGradient id="v5gr-emerald-disc" cx="44%" cy="38%" r="60%">
          <stop offset="0%" stop-color="#29b87e"/>
          <stop offset="56%" stop-color="#0d6c49"/>
          <stop offset="100%" stop-color="#053222"/>
        </radialGradient>
        <linearGradient id="v5gr-flame-outer" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#d85b0c"/>
          <stop offset="48%" stop-color="#ffab2e"/>
          <stop offset="86%" stop-color="#fff29b"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
        <linearGradient id="v5gr-flame-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8c8"/>
          <stop offset="45%" stop-color="#f3bd48"/>
          <stop offset="100%" stop-color="#9e5d10"/>
        </linearGradient>
        <radialGradient id="v5gr-flame-halo" cx="50%" cy="46%" r="48%">
          <stop offset="0%" stop-color="#ffae34" stop-opacity="0.58"/>
          <stop offset="65%" stop-color="#ff6b14" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#ff6b14" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="90" cy="82" r="78" fill="url(#v5gr-flame-halo)"/>
      <!-- Rising Animated Outer Flame Crown -->
      <g class="v5gr-flame-crown">
        <path d="M 48 64 C 42 40, 56 28, 66 39 C 68 18, 86 4, 92 2 C 98 18, 112 20, 114 38 C 126 27, 138 42, 132 64 Z"
              fill="url(#v5gr-flame-outer)" opacity="0.92"/>
      </g>
      <!-- Sculpted Ornate Brass Laurel Ring -->
      <circle cx="90" cy="96" r="56" fill="url(#v5gr-flame-gold)" stroke="#5b3206" stroke-width="2.6"/>
      <circle cx="90" cy="96" r="48" fill="#5e3406" stroke="#ffeba0" stroke-width="1.6"/>
      <!-- Glowing Emerald Enamel Core -->
      <circle cx="90" cy="96" r="44" fill="url(#v5gr-emerald-disc)" stroke="#f6c758" stroke-width="2.2"/>
      <!-- Center Sculpted Golden Flame Emblem -->
      <path d="M 90 54 C 102 70, 119 79, 118 100 C 117 118, 105 130, 90 130 C 74 130, 62 117, 63 99 C 64 85, 73 79, 77 71 C 78 78, 81 82, 84 82 C 81 71, 84 61, 90 54 Z"
            fill="url(#v5gr-flame-gold)" stroke="#5f3406" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M 91 80 C 98 90, 104 97, 102 109 C 101 118, 95 123, 90 123 C 83 123, 78 117, 79 108 C 80 101, 86 96, 87 89 C 89 92, 91 93, 91 80 Z"
            fill="#fff4b8" opacity="0.82"/>
    </svg>
  `;
}

function renderMarqueeTicketFrameSvg(): string {
  return `
    <svg class="v5gr-ticket-frame-svg" viewBox="0 0 420 144" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-tk-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8cc"/>
          <stop offset="30%" stop-color="#f7ca59"/>
          <stop offset="68%" stop-color="#b87616"/>
          <stop offset="100%" stop-color="#f2c04b"/>
        </linearGradient>
        <linearGradient id="v5gr-tk-emerald" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#15845d"/>
          <stop offset="48%" stop-color="#0b5e42"/>
          <stop offset="100%" stop-color="#063928"/>
        </linearGradient>
      </defs>
      <!-- Outer beveled gold notched theater ticket silhouette -->
      <path d="M 26 8 L 394 8 C 394 21, 403 30, 412 30 L 412 52 C 401 52, 394 60, 394 72 C 394 84, 401 92, 412 92 L 412 114 C 403 114, 394 123, 394 136 L 26 136 C 26 123, 17 114, 8 114 L 8 92 C 19 92, 26 84, 26 72 C 26 60, 19 52, 8 52 L 8 30 C 17 30, 26 21, 26 8 Z"
            fill="url(#v5gr-tk-gold)" stroke="#5b3405" stroke-width="3"/>
      <!-- Inner emerald enamel face -->
      <path d="M 34 16 L 386 16 C 388 28, 395 35, 404 37 L 404 46 C 391 49, 384 59, 384 72 C 384 85, 391 95, 404 98 L 404 107 C 395 109, 388 116, 386 128 L 34 128 C 32 116, 25 109, 16 107 L 16 98 C 29 95, 36 85, 36 72 C 36 59, 29 49, 16 46 L 16 37 C 25 35, 32 28, 34 16 Z"
            fill="url(#v5gr-tk-emerald)" stroke="#512c04" stroke-width="2.2"/>
      <!-- Inner fine gold pinstripe -->
      <path d="M 41 23 L 379 23 C 382 33, 388 39, 396 42 L 396 44 C 382 49, 376 60, 376 72 C 376 84, 382 95, 396 100 L 396 102 C 388 105, 382 111, 379 121 L 41 121 C 38 111, 32 105, 24 102 L 24 100 C 38 95, 44 84, 44 72 C 44 60, 38 49, 24 44 L 24 42 C 32 39, 38 33, 41 23 Z"
            fill="none" stroke="#f7ce68" stroke-width="1.6" opacity="0.72"/>
    </svg>
  `;
}

function renderStatsRadarIconSvg(): string {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="18" fill="none" stroke="#f6c758" stroke-width="2.4"/>
      <circle cx="24" cy="24" r="11" fill="none" stroke="#f6c758" stroke-width="1.8" opacity="0.75"/>
      <circle cx="24" cy="24" r="4.5" fill="#ffe699"/>
      <line x1="24" y1="24" x2="36" y2="12" stroke="#fff4c4" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M 24 6 A 18 18 0 0 1 39 14 L 24 24 Z" fill="#f6c758" opacity="0.28"/>
    </svg>
  `;
}

function renderTrophyIconSvg(): string {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M 14 10 L 34 10 L 32 23 C 31 29, 28 32, 24 32 C 20 32, 17 29, 16 23 Z" fill="#f6c758" stroke="#623805" stroke-width="1.6"/>
      <path d="M 14 13 L 9 13 C 9 20, 12 24, 16 24 M 34 13 L 39 13 C 39 20, 36 24, 32 24" fill="none" stroke="#f6c758" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="21" y="32" width="6" height="6" fill="#e2a634"/>
      <rect x="15" y="37" width="18" height="4.5" rx="2" fill="#f8d26c" stroke="#623805" stroke-width="1.4"/>
      <polygon points="24,14 25.7,18.2 30.2,18.4 26.7,21.1 27.9,25.5 24,23 20.1,25.5 21.3,21.1 17.8,18.4 22.3,18.2" fill="#5e3406"/>
    </svg>
  `;
}

function renderSavesDossierIconSvg(): string {
  return `
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <path d="M 8 13 C 8 11, 10 9, 12 9 L 19 9 L 22 13 L 34 13 C 36 13, 37 15, 37 17 L 37 32 C 37 34, 35 35, 33 35 L 11 35 C 9 35, 8 34, 8 32 Z"
            fill="#f5c654" stroke="#5b3205" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="22" cy="24" r="4.5" fill="#5b3205"/>
      <circle cx="22" cy="24" r="2" fill="#fff0b3"/>
    </svg>
  `;
}

function renderAudioSpeakerIconSvg(enabled: boolean): string {
  return `
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <path d="M 10 17 L 17 17 L 26 10 L 26 34 L 17 27 L 10 27 Z" fill="#f5c654" stroke="#5b3205" stroke-width="1.7" stroke-linejoin="round"/>
      ${
        enabled
          ? `<path d="M 30 16 C 33 19, 33 25, 30 28" fill="none" stroke="#fff0b3" stroke-width="2.4" stroke-linecap="round"/>
             <path d="M 34 12 C 39 17, 39 27, 34 32" fill="none" stroke="#f5c654" stroke-width="2.2" stroke-linecap="round"/>`
          : `<line x1="29" y1="15" x2="38" y2="29" stroke="#f46a5a" stroke-width="2.8" stroke-linecap="round"/>
             <line x1="38" y1="15" x2="29" y2="29" stroke="#f46a5a" stroke-width="2.8" stroke-linecap="round"/>`
      }
    </svg>
  `;
}

function renderFullscreenIconSvg(isFs: boolean): string {
  return isFs
    ? `
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path d="M 14 7 L 14 14 L 7 14 M 22 7 L 22 14 L 29 14 M 14 29 L 14 22 L 7 22 M 22 29 L 22 22 L 29 22"
              fill="none" stroke="#f8d26c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
    : `
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path d="M 7 14 L 7 7 L 14 7 M 22 7 L 29 7 L 29 14 M 7 22 L 7 29 L 14 29 M 22 29 L 29 29 L 29 22"
              fill="none" stroke="#f8d26c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
}

function toggleBrowserFullscreen(onResult?: (isFs: boolean) => void): void {
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
// SELF-CONTAINED SCOPED CSS (`#v5-greenroom-styles`)
// ============================================================================

function ensureGreenRoomStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .v5gr-root {
      position: relative;
      width: 100%;
      min-height: 100dvh;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #140906;
      color: #fff5dd;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      overflow-x: hidden;
      overflow-y: auto;
      pointer-events: auto;
      touch-action: pan-y;
      box-sizing: border-box;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .v5gr-root *, .v5gr-root *::before, .v5gr-root *::after {
      box-sizing: border-box;
    }

    /* ---------------- UPPER THEATRICAL STAGE VISTA ---------------- */
    .v5gr-vista {
      position: relative;
      flex: 0 0 auto;
      width: 100%;
      min-height: 332px;
      height: clamp(326px, 43dvh, 390px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      overflow: hidden;
      background: #1a0b07;
    }

    .v5gr-backdrop-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 42%;
      filter: brightness(0.64) saturate(1.12) contrast(1.06);
      transform: scale(1.02);
      pointer-events: none;
    }

    .v5gr-vista-vignette {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 68% 72% at 50% 42%, rgba(255, 206, 112, 0.16) 0%, rgba(36, 12, 7, 0.44) 62%, rgba(16, 4, 4, 0.88) 100%),
        linear-gradient(180deg, rgba(16, 5, 4, 0.56) 0%, rgba(16, 5, 4, 0.08) 46%, rgba(22, 9, 4, 0.86) 100%);
      pointer-events: none;
    }

    .v5gr-spotlight-cone {
      position: absolute;
      top: -12%;
      left: 50%;
      transform: translateX(-50%);
      width: min(88vw, 540px);
      height: 118%;
      background: conic-gradient(
        from 180deg at 50% 0%,
        rgba(255, 224, 138, 0) 144deg,
        rgba(255, 224, 138, 0.24) 168deg,
        rgba(255, 240, 186, 0.34) 180deg,
        rgba(255, 224, 138, 0.24) 192deg,
        rgba(255, 224, 138, 0) 216deg
      );
      pointer-events: none;
      mix-blend-mode: screen;
    }

    .v5gr-stage-horizon-glow {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: min(90vw, 560px);
      height: 54px;
      background: radial-gradient(ellipse 50% 80% at 50% 95%, rgba(255, 208, 116, 0.62) 0%, rgba(212, 126, 36, 0.16) 62%, rgba(0, 0, 0, 0) 100%);
      pointer-events: none;
    }

    /* Parted Crimson Velvet Curtains */
    .v5gr-curtain {
      position: absolute;
      top: 0;
      bottom: 0;
      width: clamp(78px, 24vw, 240px);
      z-index: 4;
      pointer-events: none;
    }
    .v5gr-curtain-left { left: 0; }
    .v5gr-curtain-right { right: 0; }
    .v5gr-curtain-svg {
      width: 100%;
      height: 100%;
      display: block;
      filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.72));
    }

    /* Top Corner Sculpted Brass Utility Medallions */
    .v5gr-top-corners {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9;
      pointer-events: none;
    }

    .v5gr-corner-pill {
      pointer-events: auto;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 12px 4px 5px;
      border-radius: 999px;
      border: 2px solid #d49c37;
      background: linear-gradient(180deg, #3c1f10 0%, #231008 100%);
      box-shadow:
        0 3px 10px rgba(0, 0, 0, 0.68),
        inset 0 1px 1px rgba(255, 238, 178, 0.55);
      color: #fce3a1;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      min-height: 36px;
      transition: transform 140ms ease, filter 140ms ease, border-color 140ms ease;
    }
    .v5gr-corner-pill-right {
      flex-direction: row-reverse;
      padding: 4px 5px 4px 12px;
    }
    .v5gr-corner-pill:hover, .v5gr-corner-pill:focus-visible {
      transform: translateY(-1px);
      border-color: #ffe38f;
      filter: brightness(1.1);
      outline: none;
    }
    .v5gr-corner-pill:active {
      transform: translateY(1px) scale(0.98);
    }
    .v5gr-corner-coin {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #6a3d14 0%, #271307 100%);
      border: 2px solid #f0be4d;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      box-shadow: inset 0 1px 2px rgba(255, 240, 184, 0.4);
    }
    .v5gr-corner-coin svg {
      width: 19px;
      height: 19px;
      display: block;
    }
    .v5gr-audio-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #2fe09a;
      box-shadow: 0 0 7px rgba(47, 224, 154, 0.85);
    }
    .v5gr-corner-pill.is-muted .v5gr-audio-dot {
      background: #e5584a;
      box-shadow: 0 0 6px rgba(229, 88, 74, 0.6);
    }

    /* Center Crest + Marquee Hero Stack */
    .v5gr-marquee-center {
      position: relative;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 40px;
      padding: 0 18px;
      max-width: 680px;
      width: 100%;
      pointer-events: none;
    }

    .v5gr-crest-svg {
      width: clamp(80px, 22vw, 118px);
      height: auto;
      display: block;
      filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.72));
      margin-bottom: -4px;
    }

    .v5gr-title-svg {
      width: clamp(238px, 72vw, 412px);
      height: auto;
      display: block;
      overflow: visible;
    }
    .v5gr-svg-title-shadow,
    .v5gr-svg-title-bevel,
    .v5gr-svg-title-face,
    .v5gr-svg-title-bulbs-halo,
    .v5gr-svg-title-bulbs {
      font-family: 'Cinzel', 'Georgia', serif;
      font-weight: 800;
    }
    .v5gr-svg-title-shadow {
      fill: #270e03;
      stroke: #270e03;
      stroke-width: 11;
      stroke-linejoin: round;
    }
    .v5gr-svg-title-bevel {
      fill: none;
      stroke: #7a4609;
      stroke-width: 9;
      stroke-linejoin: round;
    }
    .v5gr-svg-title-face {
      stroke: #fff2b2;
      stroke-width: 1.5;
      stroke-linejoin: round;
    }
    .v5gr-svg-title-bulbs-halo {
      fill: none;
      stroke: rgba(255, 214, 108, 0.75);
      stroke-width: 5.2;
      stroke-dasharray: 0.2 13.5;
      stroke-linecap: round;
    }
    .v5gr-svg-title-bulbs {
      fill: none;
      stroke: #fffef4;
      stroke-width: 2.6;
      stroke-dasharray: 0.2 13.5;
      stroke-linecap: round;
      animation: v5gr-marquee-twinkle 2.4s ease-in-out infinite;
    }
    .v5gr-svg-title-bulbs-alt {
      animation-delay: 1.2s;
    }

    /* Host Max Sterling standing by right crimson curtain */
    .v5gr-host-wrap {
      position: absolute;
      right: clamp(2px, 3vw, 74px);
      bottom: -8px;
      z-index: 6;
      width: clamp(134px, 35vw, 224px);
      pointer-events: none;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
    }
    .v5gr-host-img {
      width: 100%;
      height: auto;
      display: block;
      filter: drop-shadow(-4px 6px 14px rgba(0, 0, 0, 0.8));
      animation: v5gr-host-breathe 4.6s ease-in-out infinite;
      transform-origin: bottom center;
    }

    /* Stacked Callout Column (Prevents Brass Phone + Speech Bubble overlap on mobile!) */
    .v5gr-stage-callouts {
      position: absolute;
      left: 10px;
      right: clamp(128px, 34vw, 236px);
      bottom: 12px;
      z-index: 8;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 7px;
      pointer-events: none;
    }

    /* Subtle Warm Theatrical Speech Callout near Max */
    .v5gr-host-callout {
      position: relative;
      width: 100%;
      max-width: 300px;
      padding: 7px 11px 7px 12px;
      background: linear-gradient(180deg, #3c2112 0%, #241209 100%);
      border: 1.5px solid #d59d3a;
      border-radius: 12px 12px 2px 12px;
      box-shadow:
        0 6px 16px rgba(0, 0, 0, 0.72),
        inset 0 1px 0 rgba(255, 238, 178, 0.36);
      color: #ffefd0;
      font-size: 11.5px;
      line-height: 1.3;
      font-weight: 500;
      pointer-events: none;
    }
    .v5gr-host-callout::after {
      content: '';
      position: absolute;
      right: -7px;
      bottom: 10px;
      width: 11px;
      height: 11px;
      background: #28140a;
      border-right: 1.5px solid #d59d3a;
      border-bottom: 1.5px solid #d59d3a;
      transform: rotate(-45deg);
    }
    .v5gr-host-speaker {
      display: block;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.09em;
      color: #f6c758;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    /* Ringing Green-Room Brass Phone Notification Badge (inboxCount > 0) */
    .v5gr-inbox-phone-btn {
      pointer-events: auto;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 11px 4px 6px;
      border: 2px solid #f4c24f;
      border-radius: 13px;
      background: linear-gradient(180deg, #4b1d12 0%, #280d07 100%);
      box-shadow:
        0 6px 18px rgba(0, 0, 0, 0.78),
        0 0 16px rgba(255, 198, 72, 0.4),
        inset 0 1px 1px rgba(255, 240, 178, 0.5);
      color: #fff3d1;
      cursor: pointer;
      max-width: 100%;
      text-align: left;
      transition: transform 140ms ease, filter 140ms ease;
    }
    .v5gr-inbox-phone-btn:hover, .v5gr-inbox-phone-btn:focus-visible {
      transform: translateY(-2px) scale(1.02);
      filter: brightness(1.1);
      outline: none;
    }
    .v5gr-phone-svg {
      width: 40px;
      height: 34px;
      flex: 0 0 auto;
    }
    .v5gr-phone-handset {
      transform-origin: 44px 20px;
      animation: v5gr-phone-rattle 1.5s ease-in-out infinite;
    }
    .v5gr-ring-wave {
      animation: v5gr-ring-pulse 1.5s ease-in-out infinite;
    }
    .v5gr-inbox-copy {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .v5gr-inbox-kicker {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #ffcf63;
      text-transform: uppercase;
    }
    .v5gr-inbox-text {
      font-size: 11.5px;
      font-weight: 600;
      color: #fff6e0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .v5gr-inbox-count {
      position: absolute;
      top: -7px;
      right: -7px;
      min-width: 21px;
      height: 21px;
      padding: 0 5px;
      border-radius: 999px;
      background: linear-gradient(180deg, #ea3d32 0%, #9b1212 100%);
      border: 2px solid #ffe49c;
      color: #fffef5;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
    }

    /* ---------------- LOWER MAHOGANY & BRASS BACKSTAGE DESK ---------------- */
    .v5gr-desk {
      position: relative;
      z-index: 7;
      flex: 1 1 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        repeating-linear-gradient(
          180deg,
          rgba(255, 198, 130, 0.022) 0px,
          rgba(255, 198, 130, 0.022) 2px,
          rgba(0, 0, 0, 0.032) 2px,
          rgba(0, 0, 0, 0.032) 7px
        ),
        radial-gradient(ellipse 68% 28% at 50% 6%, rgba(255, 198, 118, 0.16) 0%, rgba(0, 0, 0, 0) 75%),
        linear-gradient(
          180deg,
          #663016 0%,
          #7b3b1c 14%,
          #4f220e 29%,
          #2a1107 32%,
          #3e1b0d 35%,
          #2e1309 72%,
          #1c0a04 100%
        );
      border-top: 3px solid #d9a03b;
      box-shadow:
        0 -10px 26px rgba(0, 0, 0, 0.78),
        inset 0 2px 6px rgba(255, 224, 152, 0.34);
    }

    /* Horizontal chamfered brass molding dividing tabletop & front wainscoting */
    .v5gr-desk-lip {
      position: absolute;
      top: 126px;
      left: 0;
      right: 0;
      height: 11px;
      background: linear-gradient(180deg, #fae094 0%, #c88b26 42%, #6d4109 80%, #2a1206 100%);
      box-shadow: 0 5px 14px rgba(0, 0, 0, 0.75);
      pointer-events: none;
      z-index: 1;
    }

    /* Wainscoting ornate brass panel border accents */
    .v5gr-wainscot-ornament {
      position: absolute;
      top: 156px;
      bottom: 66px;
      left: 50%;
      transform: translateX(-50%);
      width: min(92vw, 940px);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      pointer-events: none;
      z-index: 0;
      opacity: 0.42;
    }
    .v5gr-wainscot-panel {
      border: 2px solid #b57b24;
      border-radius: 6px;
      box-shadow:
        inset 0 0 0 4px rgba(32, 12, 5, 0.7),
        inset 0 0 0 5px rgba(235, 185, 86, 0.45);
    }

    /* Desk Interactive Layout Container */
    .v5gr-desk-grid {
      position: relative;
      z-index: 3;
      width: 100%;
      max-width: 1120px;
      margin: 0 auto;
      padding: 6px 10px 6px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "trunk dial"
        "stage stage"
        "daily endless";
      align-items: end;
      justify-items: center;
      row-gap: 4px;
      column-gap: 8px;
    }

    /* Base Tactile Desk Prop Button */
    .v5gr-prop-btn {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      background: transparent;
      border: none;
      padding: 2px 4px;
      color: #fff4d8;
      cursor: pointer;
      transition: transform 150ms cubic-bezier(0.22, 1, 0.36, 1), filter 150ms ease;
      -webkit-appearance: none;
      appearance: none;
    }
    .v5gr-prop-btn:hover, .v5gr-prop-btn:focus-visible {
      transform: translateY(-3px) scale(1.03);
      filter: brightness(1.09);
      outline: none;
    }
    .v5gr-prop-btn:active {
      transform: translateY(1px) scale(0.97);
    }

    .v5gr-prop-svg {
      display: block;
      height: auto;
      filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.65));
      transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .v5gr-prop-trunk:hover .v5gr-trunk-polaroids {
      transform: translateY(-4px);
    }
    .v5gr-trunk-polaroids {
      transition: transform 220ms ease;
    }
    .v5gr-prop-dial:hover .v5gr-dial-rotor {
      transform: rotate(22deg);
    }
    .v5gr-dial-rotor {
      transform-origin: 105px 68px;
      transition: transform 340ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .v5gr-prop-daily:hover .v5gr-daily-ticket {
      transform: translate(3px, 4px);
    }
    .v5gr-daily-ticket {
      transition: transform 200ms ease;
    }
    .v5gr-flame-crown {
      transform-origin: 90px 64px;
      animation: v5gr-flame-flicker 2.1s ease-in-out infinite;
    }

    /* Sculpted Mahogany & Brass Nameplates (Zero SaaS boxes!) */
    .v5gr-nameplate {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 14px;
      margin-top: -6px;
      border-radius: 999px;
      border: 2px solid #e4ae42;
      background: linear-gradient(180deg, #3c2010 0%, #1f0e06 100%);
      box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.72),
        inset 0 1px 1px rgba(255, 240, 182, 0.45);
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(11px, 3vw, 13.5px);
      letter-spacing: 0.06em;
      color: #ffe8a8;
      text-transform: uppercase;
      white-space: nowrap;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
    }
    .v5gr-subplate {
      margin-top: -2px;
      padding: 2px 10px;
      border-radius: 0 0 10px 10px;
      border: 1.5px solid #b88128;
      border-top: none;
      background: linear-gradient(180deg, #271309 0%, #170a04 100%);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.03em;
      color: #f3d28c;
      white-space: nowrap;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.6);
    }

    .v5gr-top-right-group {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    }

    .v5gr-fs-btn {
      pointer-events: auto;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid #d49c37;
      background: linear-gradient(180deg, #3c1f10 0%, #231008 100%);
      box-shadow:
        0 3px 10px rgba(0, 0, 0, 0.68),
        inset 0 1px 1px rgba(255, 238, 178, 0.55);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: transform 140ms ease, filter 140ms ease, border-color 140ms ease;
    }
    .v5gr-fs-btn:hover, .v5gr-fs-btn:focus-visible {
      transform: translateY(-1px);
      border-color: #ffe38f;
      filter: brightness(1.12);
      outline: none;
    }
    .v5gr-fs-btn svg {
      width: 19px;
      height: 19px;
      display: block;
    }

    /* Grid placement on Mobile Portrait (matches mockup_v5_main_menu 1:1 with subtle tactile asymmetry!) */
    .v5gr-prop-trunk {
      grid-area: trunk;
      margin-top: -24px;
      transform: rotate(-1.4deg);
    }
    .v5gr-trunk-svg { width: clamp(134px, 37vw, 178px); }

    .v5gr-prop-dial {
      grid-area: dial;
      margin-top: -12px;
      transform: rotate(1.1deg);
    }
    .v5gr-dial-svg { width: clamp(128px, 35vw, 170px); }

    /* Centerpiece Hero: STEP ON STAGE Emerald & Gold Beveled Marquee Ticket */
    .v5gr-step-ticket {
      grid-area: stage;
      position: relative;
      width: min(86vw, 344px);
      min-height: 102px;
      margin: -4px 0 4px;
      padding: 18px 30px 15px;
      border: none;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      filter: drop-shadow(0 0 18px rgba(255, 206, 86, 0.44)) drop-shadow(0 10px 18px rgba(0, 0, 0, 0.82));
      transition: transform 150ms cubic-bezier(0.22, 1, 0.36, 1), filter 160ms ease;
    }
    .v5gr-step-ticket:hover, .v5gr-step-ticket:focus-visible {
      transform: translateY(-3px) scale(1.025);
      filter: drop-shadow(0 0 26px rgba(255, 222, 118, 0.68)) drop-shadow(0 12px 20px rgba(0, 0, 0, 0.85));
      outline: none;
    }
    .v5gr-step-ticket:active {
      transform: translateY(2px) scale(0.985);
    }
    .v5gr-ticket-frame-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .v5gr-step-title {
      position: relative;
      z-index: 2;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(22px, 6.2vw, 29px);
      line-height: 1.04;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: linear-gradient(180deg, #fffbe2 0%, #ffd56c 48%, #d99524 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 2px 2px rgba(4, 24, 16, 0.95));
      text-align: center;
    }
    .v5gr-step-sub {
      position: relative;
      z-index: 2;
      margin-top: 4px;
      padding: 2px 10px;
      border-radius: 999px;
      background: rgba(5, 36, 24, 0.72);
      border: 1px solid rgba(247, 206, 104, 0.56);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #fff2c6;
      max-width: 92%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Lower-left Daily Show & Lower-right Endless Streak */
    .v5gr-prop-daily {
      grid-area: daily;
    }
    .v5gr-daily-svg { width: clamp(128px, 35vw, 164px); }

    .v5gr-prop-endless {
      grid-area: endless;
    }
    .v5gr-endless-svg { width: clamp(122px, 34vw, 156px); }

    /* ---------------- BOTTOM SCULPTED BRASS CORNER MEDALLIONS ---------------- */
    .v5gr-bottom-rail {
      position: relative;
      z-index: 4;
      width: 100%;
      max-width: 1180px;
      margin: auto auto 0;
      padding: 6px 10px max(10px, env(safe-area-inset-bottom, 10px));
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .v5gr-medallion-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      border: none;
      background: transparent;
      padding: 0;
      cursor: pointer;
      color: #ffe9ad;
      transition: transform 140ms ease, filter 140ms ease;
    }
    .v5gr-medallion-btn:hover, .v5gr-medallion-btn:focus-visible {
      transform: translateY(-2px) scale(1.03);
      filter: brightness(1.1);
      outline: none;
    }
    .v5gr-medallion-btn:active {
      transform: translateY(1px) scale(0.98);
    }

    .v5gr-medallion-disc {
      position: relative;
      z-index: 2;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background:
        radial-gradient(circle at 36% 30%, #4d2e12 0%, #1c0d06 72%, #120703 100%);
      border: 3.5px solid #ecc054;
      box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.82),
        inset 0 0 0 3px #6b410a,
        inset 0 2px 4px rgba(255, 240, 184, 0.45);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
    }
    .v5gr-medallion-disc svg {
      width: 34px;
      height: 34px;
      display: block;
    }

    .v5gr-medallion-ribbon {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 40px;
      padding: 5px 14px 5px 22px;
      margin-left: -16px;
      border-radius: 0 999px 999px 0;
      border: 2px solid #dca43b;
      border-left: none;
      background: linear-gradient(180deg, #3c1f10 0%, #1d0c05 100%);
      box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.72),
        inset 0 1px 1px rgba(255, 236, 174, 0.4);
      text-align: left;
    }
    .v5gr-medallion-btn-right .v5gr-medallion-ribbon {
      margin-left: 0;
      margin-right: -16px;
      padding: 5px 22px 5px 14px;
      border-radius: 999px 0 0 999px;
      border: 2px solid #dca43b;
      border-right: none;
      text-align: right;
    }
    .v5gr-medallion-label {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: 11.5px;
      line-height: 1.12;
      letter-spacing: 0.05em;
      color: #ffeaad;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .v5gr-medallion-meta {
      font-size: 10px;
      font-weight: 600;
      color: #dfb975;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    /* ---------------- DESKTOP PANORAMIC STAGE LAYOUT (>= 820px) ---------------- */
    @media (min-width: 820px) {
      .v5gr-vista {
        min-height: 300px;
        height: clamp(296px, 41dvh, 360px);
      }
      .v5gr-marquee-center {
        margin-top: 12px;
      }
      .v5gr-crest-svg {
        width: 112px;
      }
      .v5gr-title-svg {
        width: 398px;
      }
      .v5gr-host-wrap {
        right: clamp(72px, 11vw, 190px);
        width: 214px;
      }
      .v5gr-stage-callouts {
        left: clamp(68px, 9vw, 170px);
        right: clamp(276px, 28vw, 410px);
        bottom: 22px;
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
      }
      .v5gr-host-callout {
        max-width: 280px;
        margin-left: auto;
        font-size: 12.5px;
      }
      .v5gr-inbox-phone-btn {
        max-width: 274px;
      }
      .v5gr-desk-lip {
        top: 156px;
      }
      .v5gr-desk-grid {
        padding: 8px 28px 4px;
        grid-template-columns: 1fr 1.28fr 1fr;
        grid-template-areas:
          "trunk stage dial"
          "daily stage endless";
        align-items: center;
        row-gap: 8px;
        column-gap: 18px;
      }
      .v5gr-prop-trunk { margin-top: -28px; }
      .v5gr-trunk-svg { width: 174px; }
      .v5gr-prop-dial { margin-top: -16px; }
      .v5gr-dial-svg { width: 168px; }
      .v5gr-daily-svg { width: 156px; }
      .v5gr-endless-svg { width: 146px; }

      .v5gr-step-ticket {
        width: 374px;
        min-height: 128px;
        margin: 0;
        padding: 22px 36px 18px;
      }
      .v5gr-step-title {
        font-size: 31px;
      }
      .v5gr-step-sub {
        font-size: 12px;
        margin-top: 6px;
      }
      .v5gr-medallion-disc {
        width: 64px;
        height: 64px;
      }
      .v5gr-medallion-label {
        font-size: 13px;
      }
      .v5gr-corner-pill {
        font-size: 12px;
        padding: 5px 15px 5px 6px;
      }
      .v5gr-corner-pill-right {
        padding: 5px 6px 5px 15px;
      }
    }

    /* Bespoke Phone Landscape Stage Split (e.g. 844x390) — 100% fits above 390px fold! */
    @media (max-height: 500px) and (min-width: 600px) {
      .v5gr-root {
        flex-direction: row;
        height: 100dvh;
        min-height: 100dvh;
        overflow: hidden;
      }
      .v5gr-vista {
        flex: 0 0 43%;
        width: 43%;
        height: 100%;
        min-height: 0;
        border-right: 3px solid #d9a03b;
      }
      .v5gr-curtain {
        width: 58px;
      }
      .v5gr-top-corners {
        top: 6px;
        left: 6px;
        right: 6px;
      }
      .v5gr-corner-pill {
        min-height: 30px;
        font-size: 9.5px;
        padding: 2px 9px 2px 3px;
        gap: 5px;
      }
      .v5gr-corner-pill-right {
        padding: 2px 3px 2px 9px;
      }
      .v5gr-corner-coin {
        width: 22px;
        height: 22px;
      }
      .v5gr-corner-coin svg {
        width: 14px;
        height: 14px;
      }
      .v5gr-fs-btn {
        width: 30px;
        height: 30px;
      }
      .v5gr-marquee-center {
        margin-top: 34px;
        padding: 0 10px;
      }
      .v5gr-crest-svg { width: 64px; }
      .v5gr-title-svg { width: 218px; }
      .v5gr-host-wrap {
        right: 4px;
        width: 122px;
        bottom: -6px;
      }
      .v5gr-stage-callouts {
        left: 8px;
        right: 118px;
        bottom: 8px;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      .v5gr-inbox-phone-btn {
        padding: 3px 8px 3px 4px;
        gap: 5px;
      }
      .v5gr-phone-svg { width: 28px; height: 24px; }
      .v5gr-inbox-kicker { font-size: 8px; }
      .v5gr-inbox-text { font-size: 10px; }
      .v5gr-host-callout {
        padding: 5px 8px;
        font-size: 10px;
        max-width: 100%;
        margin-left: 0;
      }
      .v5gr-desk {
        flex: 1 1 57%;
        width: 57%;
        height: 100%;
        border-top: none;
        overflow-y: auto;
        justify-content: space-between;
      }
      .v5gr-desk-lip { display: none; }
      .v5gr-wainscot-ornament { display: none; }
      .v5gr-desk-grid {
        margin: auto 0;
        padding: 6px 12px 2px;
        grid-template-columns: 1fr 1.38fr 1fr;
        grid-template-areas:
          "trunk stage dial"
          "daily stage endless";
        align-items: center;
        row-gap: 4px;
        column-gap: 6px;
      }
      .v5gr-prop-trunk, .v5gr-prop-dial { margin-top: 0; }
      .v5gr-trunk-svg { width: 102px; }
      .v5gr-dial-svg { width: 96px; }
      .v5gr-daily-svg { width: 96px; }
      .v5gr-endless-svg { width: 88px; }
      .v5gr-nameplate { font-size: 9.5px; padding: 2px 9px; margin-top: -4px; }
      .v5gr-subplate { font-size: 8.5px; padding: 1px 7px; }
      .v5gr-step-ticket {
        width: 100%;
        max-width: 242px;
        min-height: 94px;
        padding: 12px 14px 10px;
      }
      .v5gr-step-title { font-size: 20px; }
      .v5gr-step-sub { font-size: 8.8px; padding: 1px 7px; max-width: 96%; }
      .v5gr-bottom-rail {
        padding: 4px 12px 6px;
      }
      .v5gr-medallion-disc { width: 42px; height: 42px; border-width: 2.5px; }
      .v5gr-medallion-disc svg { width: 24px; height: 24px; }
      .v5gr-medallion-ribbon { min-height: 32px; padding: 3px 10px 3px 18px; }
      .v5gr-medallion-btn-right .v5gr-medallion-ribbon { padding: 3px 18px 3px 10px; }
      .v5gr-medallion-label { font-size: 10px; }
      .v5gr-medallion-meta { font-size: 8.5px; }
    }

    /* Ultra-narrow Mobile (360x640) */
    @media (max-width: 374px) {
      .v5gr-vista {
        min-height: 292px;
        height: 300px;
      }
      .v5gr-corner-pill {
        font-size: 10px;
        padding: 3px 9px 3px 4px;
      }
      .v5gr-corner-pill-right {
        padding: 3px 4px 3px 9px;
      }
      .v5gr-medallion-disc {
        width: 50px;
        height: 50px;
      }
      .v5gr-medallion-label {
        font-size: 10.5px;
      }
    }

    /* Keyframes */
    @keyframes v5gr-marquee-twinkle {
      0%, 100% { opacity: 0.98; }
      50% { opacity: 0.62; }
    }
    @keyframes v5gr-host-breathe {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-3px); }
    }
    @keyframes v5gr-phone-rattle {
      0%, 66%, 100% { transform: rotate(0deg); }
      70% { transform: rotate(-6deg); }
      76% { transform: rotate(6deg); }
      82% { transform: rotate(-5deg); }
      88% { transform: rotate(4deg); }
      94% { transform: rotate(-2deg); }
    }
    @keyframes v5gr-ring-pulse {
      0%, 64%, 100% { opacity: 0.25; }
      78% { opacity: 1; }
    }
    @keyframes v5gr-flame-flicker {
      0%, 100% { transform: scaleY(1) scaleX(1); }
      45% { transform: scaleY(1.06) scaleX(0.97); }
      75% { transform: scaleY(0.97) scaleX(1.03); }
    }
    @media (prefers-reduced-motion: reduce) {
      .v5gr-svg-title-bulbs,
      .v5gr-host-img,
      .v5gr-phone-handset,
      .v5gr-ring-wave,
      .v5gr-flame-crown {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// GREEN ROOM MENU VIEW CLASS
// ============================================================================

export class GreenRoomMenuView {
  private readonly container: HTMLElement;
  private rootEl: HTMLElement | null = null;
  private currentModel: GreenRoomMenuViewModel | null = null;
  private currentCallbacks: GreenRoomMenuCallbacks | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    ensureGreenRoomStyles();
  }

  public render(
    model: GreenRoomMenuViewModel,
    callbacks: GreenRoomMenuCallbacks,
  ): void {
    ensureGreenRoomStyles();
    this.currentModel = model;
    this.currentCallbacks = callbacks;

    const backdropUrl =
      V5_GREENROOM_BACKDROPS[model.era] ?? V5_GREENROOM_BACKDROPS.LOCAL_PUB;
    const stepSubtitle = resolveStepSubtitle(model);
    const hostCallout = defaultHostCallout(model);
    const ticketCode = resolveDailyTicketCode(model);
    const endlessMeta =
      model.endlessBestStreak > 0
        ? `Best Streak: ${model.endlessBestStreak}`
        : '3 Strikes · Infinite';
    const trophiesTotal = model.trophiesTotalCount ?? 100;
    const trophiesMeta =
      typeof model.trophiesUnlockedCount === 'number'
        ? `${model.trophiesUnlockedCount} / ${trophiesTotal} Earned`
        : 'Hall of Fame';
    const savesLabel = model.activeSaveSlotLabel
      ? `Dossier · ${model.activeSaveSlotLabel}`
      : 'Dossier Saves';
    const inboxHeadline =
      model.inboxHeadline?.trim() ||
      (model.inboxCallerName
        ? `${model.inboxCallerName} is calling backstage!`
        : 'Backstage line is ringing!');

    const root = document.createElement('section');
    root.className = 'v5gr-root';
    root.setAttribute('aria-label', "World's Smartest Backstage Green Room");
    root.dataset.greenroomEra = model.era;

    root.innerHTML = `
      <!-- UPPER THEATRICAL STAGE VISTA -->
      <header class="v5gr-vista">
        <img
          class="v5gr-backdrop-img"
          src="${escapeHtml(backdropUrl)}"
          alt=""
          aria-hidden="true"
        />
        <div class="v5gr-vista-vignette" aria-hidden="true"></div>
        <div class="v5gr-spotlight-cone" aria-hidden="true"></div>
        <div class="v5gr-stage-horizon-glow" aria-hidden="true"></div>

        <!-- Parted Crimson Velvet Stage Curtains -->
        <div class="v5gr-curtain v5gr-curtain-left" aria-hidden="true">
          ${renderLeftCurtainSvg()}
        </div>
        <div class="v5gr-curtain v5gr-curtain-right" aria-hidden="true">
          ${renderRightCurtainSvg()}
        </div>

        <!-- Top Corner Sculpted Brass Medallions: DOSSIER SAVES, AUDIO ON/OFF & 1-TAP FULLSCREEN -->
        <div class="v5gr-top-corners">
          <button
            type="button"
            class="v5gr-corner-pill"
            data-v5gr-action="saves"
            aria-label="Open Dossier Saves"
          >
            <span class="v5gr-corner-coin">${renderSavesDossierIconSvg()}</span>
            <span>${escapeHtml(savesLabel)}</span>
          </button>

          <div class="v5gr-top-right-group">
            <button
              type="button"
              class="v5gr-corner-pill v5gr-corner-pill-right ${model.audioEnabled ? '' : 'is-muted'}"
              data-v5gr-action="audio"
              aria-pressed="${model.audioEnabled ? 'true' : 'false'}"
              aria-label="${model.audioEnabled ? 'Mute Studio Audio' : 'Unmute Studio Audio'}"
            >
              <span class="v5gr-corner-coin" data-v5gr-audio-icon>${renderAudioSpeakerIconSvg(model.audioEnabled)}</span>
              <span class="v5gr-audio-dot" aria-hidden="true"></span>
              <span data-v5gr-audio-label>${model.audioEnabled ? 'Audio On' : 'Audio Off'}</span>
            </button>

            <button
              type="button"
              class="v5gr-fs-btn"
              data-v5gr-action="fullscreen"
              aria-label="Toggle Fullscreen Stage"
              title="Toggle Fullscreen"
            >
              ${renderFullscreenIconSvg(typeof document !== 'undefined' && Boolean(document.fullscreenElement))}
            </button>
          </div>
        </div>

        <!-- Golden Laurel-Brain Crest & Incandescent Marquee Title -->
        <div class="v5gr-marquee-center">
          ${renderLaurelBrainCrestSvg()}
          ${renderMarqueeTitleSvg()}
        </div>

        <!-- Ringing Green-Room Brass Phone + Max Sterling Speech Callout (Zero-Overlap Flex Stack) -->
        <div class="v5gr-stage-callouts">
          ${
            model.inboxCount > 0
              ? `
                <button
                  type="button"
                  class="v5gr-inbox-phone-btn"
                  data-v5gr-action="inbox"
                  aria-label="${escapeHtml(inboxHeadline)} (${model.inboxCount} backstage call${model.inboxCount === 1 ? '' : 's'})"
                >
                  ${renderBrassPhoneSvg()}
                  <span class="v5gr-inbox-copy">
                    <span class="v5gr-inbox-kicker">Backstage Line</span>
                    <span class="v5gr-inbox-text">${escapeHtml(inboxHeadline)}</span>
                  </span>
                  <span class="v5gr-inbox-count" aria-hidden="true">${model.inboxCount}</span>
                </button>
              `
              : ''
          }

          <div class="v5gr-host-callout" role="status" aria-live="polite">
            <span class="v5gr-host-speaker">Max Sterling</span>
            <span>${escapeHtml(hostCallout)}</span>
          </div>
        </div>

        <!-- Transparent-Alpha Host Max Sterling Standing by Right Curtain -->
        <div class="v5gr-host-wrap">
          <img
            class="v5gr-host-img"
            src="${escapeHtml(V5_CAST_CUTOUTS.maxWelcome)}"
            alt="Host Max Sterling welcoming you backstage"
          />
        </div>
      </header>

      <!-- LOWER TACTILE MAHOGANY & BRASS BACKSTAGE DESK -->
      <main class="v5gr-desk">
        <div class="v5gr-desk-lip" aria-hidden="true"></div>
        <div class="v5gr-wainscot-ornament" aria-hidden="true">
          <div class="v5gr-wainscot-panel"></div>
          <div class="v5gr-wainscot-panel"></div>
        </div>

        <div class="v5gr-desk-grid">
          <!-- LEFT DESK PROP: OPEN COGNAC-LEATHER TOUR TRUNK -->
          <button
            type="button"
            class="v5gr-prop-btn v5gr-prop-trunk"
            data-v5gr-action="trunk"
            aria-label="Open Tour Trunk World Tour Pinboard"
          >
            ${renderTourTrunkSvg()}
            <span class="v5gr-nameplate">Tour Trunk</span>
            ${
              model.tourProgressLabel
                ? `<span class="v5gr-subplate">${escapeHtml(model.tourProgressLabel)}</span>`
                : ''
            }
          </button>

          <!-- CENTERPIECE HERO: STEP ON STAGE MARQUEE TICKET -->
          <button
            type="button"
            class="v5gr-step-ticket"
            data-v5gr-action="stage"
            aria-label="Step On Stage — ${escapeHtml(stepSubtitle)}"
          >
            ${renderMarqueeTicketFrameSvg()}
            <span class="v5gr-step-title">STEP ON<br/>STAGE</span>
            <span class="v5gr-step-sub">${escapeHtml(stepSubtitle)}</span>
          </button>

          <!-- RIGHT DESK PROP: KNURLED BRASS ROTARY TOPIC DIAL -->
          <button
            type="button"
            class="v5gr-prop-btn v5gr-prop-dial"
            data-v5gr-action="jukebox"
            aria-label="Open Topic Jukebox Dial — 12 Categories and 157 Subcategories"
          >
            ${renderTopicDialSvg()}
            <span class="v5gr-nameplate">Topic Dial</span>
            <span class="v5gr-subplate">12 Categories</span>
          </button>

          <!-- LOWER-LEFT PROP: GLOWING RED VINTAGE DAILY SHOW TICKET DISPENSER -->
          <button
            type="button"
            class="v5gr-prop-btn v5gr-prop-daily"
            data-v5gr-action="daily"
            aria-label="Start Daily Show Broadcast ${escapeHtml(ticketCode)}"
          >
            ${renderDailyDispenserSvg(ticketCode, Boolean(model.dailyCompletedToday))}
            <span class="v5gr-nameplate">Daily Show</span>
            <span class="v5gr-subplate">${model.dailyCompletedToday ? 'Today Cleared' : `Broadcast ${escapeHtml(ticketCode)}`}</span>
          </button>

          <!-- LOWER-RIGHT PROP: FLAMING EMERALD-AND-GOLD ENDLESS STREAK MEDALLION -->
          <button
            type="button"
            class="v5gr-prop-btn v5gr-prop-endless"
            data-v5gr-action="endless"
            aria-label="Start Endless Streak — ${escapeHtml(endlessMeta)}"
          >
            ${renderEndlessFlameMedallionSvg()}
            <span class="v5gr-nameplate">Endless Streak</span>
            <span class="v5gr-subplate">${escapeHtml(endlessMeta)}</span>
          </button>
        </div>

        <!-- BOTTOM CORNER SCULPTED BRASS MEDALLIONS: STATS RADAR & 100 TROPHIES -->
        <footer class="v5gr-bottom-rail">
          <button
            type="button"
            class="v5gr-medallion-btn"
            data-v5gr-action="stats"
            aria-label="Open Career Stats Radar"
          >
            <span class="v5gr-medallion-disc">${renderStatsRadarIconSvg()}</span>
            <span class="v5gr-medallion-ribbon">
              <span class="v5gr-medallion-label">Stats<br/>Radar</span>
              <span class="v5gr-medallion-meta">Domain Profile</span>
            </span>
          </button>

          <button
            type="button"
            class="v5gr-medallion-btn v5gr-medallion-btn-right"
            data-v5gr-action="trophies"
            aria-label="Open 100 Trophies Hall of Fame"
          >
            <span class="v5gr-medallion-ribbon">
              <span class="v5gr-medallion-label">${trophiesTotal}<br/>Trophies</span>
              <span class="v5gr-medallion-meta">${escapeHtml(trophiesMeta)}</span>
            </span>
            <span class="v5gr-medallion-disc">${renderTrophyIconSvg()}</span>
          </button>
        </footer>
      </main>
    `;

    this.bindInteractions(root, callbacks);
    this.container.replaceChildren(root);
    this.rootEl = root;
  }

  public updateAudioState(enabled: boolean): void {
    if (this.currentModel) {
      this.currentModel = { ...this.currentModel, audioEnabled: enabled };
    }
    if (!this.rootEl) return;
    const btn = this.rootEl.querySelector<HTMLButtonElement>('[data-v5gr-action="audio"]');
    if (!btn) return;
    btn.classList.toggle('is-muted', !enabled);
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    btn.setAttribute('aria-label', enabled ? 'Mute Studio Audio' : 'Unmute Studio Audio');
    const iconSlot = btn.querySelector<HTMLElement>('[data-v5gr-audio-icon]');
    if (iconSlot) {
      iconSlot.innerHTML = renderAudioSpeakerIconSvg(enabled);
    }
    const labelSlot = btn.querySelector<HTMLElement>('[data-v5gr-audio-label]');
    if (labelSlot) {
      labelSlot.textContent = enabled ? 'Audio On' : 'Audio Off';
    }
  }

  public updateInboxBadge(inboxCount: number, headline?: string): void {
    if (!this.currentModel || !this.currentCallbacks) return;
    this.render(
      {
        ...this.currentModel,
        inboxCount,
        inboxHeadline: headline ?? this.currentModel.inboxHeadline,
      },
      this.currentCallbacks,
    );
  }

  public dispose(): void {
    if (this.rootEl && this.rootEl.parentElement === this.container) {
      this.rootEl.remove();
    }
    this.rootEl = null;
    this.currentCallbacks = null;
  }

  private bindInteractions(
    root: HTMLElement,
    callbacks: GreenRoomMenuCallbacks,
  ): void {
    const buttons = root.querySelectorAll<HTMLButtonElement>('[data-v5gr-action]');
    buttons.forEach((btn) => {
      btn.addEventListener('pointerenter', () => {
        callbacks.onInteractionFeedback?.('hover');
      });
      btn.addEventListener('click', () => {
        const action = btn.dataset.v5grAction;
        callbacks.onInteractionFeedback?.(action === 'inbox' ? 'ring' : 'tap');
        switch (action) {
          case 'stage':
            callbacks.onStepOnStage();
            break;
          case 'trunk':
            callbacks.onOpenTourTrunk();
            break;
          case 'jukebox':
            callbacks.onOpenTopicJukebox();
            break;
          case 'daily':
            callbacks.onStartDaily();
            break;
          case 'endless':
            callbacks.onStartEndless();
            break;
          case 'stats':
            callbacks.onOpenStatsRadar();
            break;
          case 'trophies':
            callbacks.onOpenTrophies();
            break;
          case 'saves':
            callbacks.onOpenSaves();
            break;
          case 'audio':
            callbacks.onToggleAudio();
            break;
          case 'fullscreen':
            toggleBrowserFullscreen((isFs) => {
              btn.innerHTML = renderFullscreenIconSvg(isFs);
              btn.setAttribute('aria-label', isFs ? 'Exit Fullscreen Stage' : 'Toggle Fullscreen Stage');
              callbacks.onToggleFullscreen?.(isFs);
            });
            break;
          case 'inbox':
            if (callbacks.onOpenInboxCall) {
              callbacks.onOpenInboxCall();
            } else {
              callbacks.onStepOnStage();
            }
            break;
        }
      });
    });
  }
}

export function renderGreenRoomMenu(
  container: HTMLElement,
  model: GreenRoomMenuViewModel,
  callbacks: GreenRoomMenuCallbacks,
): GreenRoomMenuView {
  const view = new GreenRoomMenuView(container);
  view.render(model, callbacks);
  return view;
}
