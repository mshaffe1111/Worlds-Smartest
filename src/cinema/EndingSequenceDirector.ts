// ============================================================================
// WORLD'S SMARTEST — All-4 Championship Ending Epilogue Sequence Director
// Implements PITCH_BIBLE.md §2.3 & Wave-2 Motion-Cinema Overhaul (#128):
//  1) THE SOVEREIGN ARBITER        (ending_1.mp3 · Julian Vance)
//  2) THE OPEN COMMONS             (ending_2.mp3 · Nadia Al-Mansoor)
//  3) THE KINGMAKER                (ending_3.mp3 · Chancellor Lindqvist)
//  4) THE ARCHITECT'S SUCCESSION   (ending_4.mp3 · Secret True Ending · Tariq)
//
// Features:
//  • Voiced Championship Monologue + Multi-Beat Character Epilogue Cinema
//  • 60fps Ending-Specific Atmospheric Canvas Backdrop over act5_apex_finale.jpg
//  • Personalized 7-City Decision Chronicle (Geneva -> Singapore) built live
//    from InkBlackboardSnapshot & PassportSystem
//  • 3D Championship Crown Showcase Hook (live Stage3DDirector GOLD_RESONANCE
//    peek toggle + standalone WebGL 3D Crown fallback)
//  • Interactive New Circuit+ ("The Second Dossier") Charter Heat Launcher!
// ============================================================================

import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import {
  mountStandaloneTrophyPreview,
  type Stage3DDirector,
} from '../stage3d/Stage3DDirector';
import {
  ORIGIN_DEFINITIONS,
  PERSONA_DEFINITIONS,
  type EndingId,
  type PassportSystem,
  type PrismSkinId,
} from '../narrative/PassportSystem';
import type {
  CastMemberId,
  InkBlackboard,
  InkBlackboardSnapshot,
  MutatorId,
} from '../narrative/InkBlackboard';
import type {
  CampaignDialogueBeat,
  CampaignEndingView,
} from '../narrative/CampaignCircuitDirector';
import {
  ensureMotionCinemaStyles,
  resolveCinemaPortraitUrl,
  stripHistoricalYearCommas,
} from './MotionCinemaDirector';

export interface JourneyDecisionRecord {
  cityCode: string;
  cityName: string;
  headline: string;
  outcomeSummary: string;
  tone: 'gold' | 'cyan' | 'emerald' | 'crimson';
}

export interface EndingSequencePlayOptions {
  /** Either a full `CampaignEndingView` from `CampaignCircuitDirector` or an `EndingId`. */
  ending: CampaignEndingView | EndingId;
  challengerName?: string;
  blackboard?: InkBlackboard | InkBlackboardSnapshot | null;
  passport?: PassportSystem | null;
  /** Live Three.js Stage3DDirector for 3D Championship Crown showcase (`showChampionshipTrophy`). */
  stage3d?: Stage3DDirector | null;
  /** Optional custom hook fired when entering 3D Crown Showcase mode. */
  onShowcase3DCrown?: () => void;
  /** Fired when the player clicks `LAUNCH NEW CIRCUIT+ ↻` with up to 3 Charter Heat mutators. */
  onStartNewCircuitPlus?: (charterHeatMutators: MutatorId[]) => void;
  /** Fired when the player clicks `RETURN TO WORLD GLOBE ▶` (or finishes without New Circuit+). */
  onReturnToHub?: () => void;
}

interface CanonicalEndingBlueprint {
  id: EndingId;
  number: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  isSecret: boolean;
  accentHex: string;
  secondaryHex: string;
  voiceUrl: string;
  endingSpeakerId: CastMemberId;
  endingSpeakerName: string;
  endingSpeech: string;
  epilogueBeats: Array<{
    id: string;
    speakerId: CastMemberId;
    speakerName: string;
    speakerRole: string;
    expression: 'neutral' | 'intense' | 'shocked' | 'smirk';
    tellHint: string;
    text: string;
    voiceUrl: string;
  }>;
  permanentUnlocks: {
    titleCrest: string;
    skin: PrismSkinId;
    skinDisplayName: string;
    extraUnlockLabel?: string;
  };
}

export const CANONICAL_ENDINGS: Readonly<Record<EndingId, CanonicalEndingBlueprint>> = {
  SOVEREIGN_ARBITER: {
    id: 'SOVEREIGN_ARBITER',
    number: 1,
    title: 'The Sovereign Arbiter',
    subtitle: 'Order Reborn Through World Law',
    isSecret: false,
    accentHex: '#f2cf7e',
    secondaryHex: '#56d4f5',
    voiceUrl: './assets/voice/ending_1.mp3',
    endingSpeakerId: 'vance',
    endingSpeakerName: 'Julian Vance',
    endingSpeech:
      'The crown is yours—and you kept your oath to no syndicate, no council, no shadow. The Ledger answers to one independent human conscience: yours.',
    epilogueBeats: [
      {
        id: 'end1_b1',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Chief Host · The Meridian',
        expression: 'smirk',
        tellHint: 'Pins the gold laurel onto your lapel beneath ocean sunrise.',
        text: 'You beat every faction without breaking the Charter. Now clean out the rot with fair law.',
        voiceUrl: './assets/voice/vance_victory.mp3',
      },
      {
        id: 'end1_b2',
        speakerId: 'lindqvist',
        speakerName: 'Chancellor Ingrid Lindqvist',
        speakerRole: 'Chair, Sovereign Bloc',
        expression: 'neutral',
        tellHint: 'Steps back from the podium, lowering her glasses in quiet respect.',
        text: 'History remembers those who bend institutions without shattering them.',
        voiceUrl: './assets/voice/lindqvist_london.mp3',
      },
    ],
    permanentUnlocks: {
      titleCrest: 'FIRST CITIZEN ARBITER',
      skin: 'DAMASCUS_TITANIUM',
      skinDisplayName: 'Damascus Folded Steel & Titanium',
    },
  },
  OPEN_COMMONS: {
    id: 'OPEN_COMMONS',
    number: 2,
    title: 'The Open Commons',
    subtitle: 'Two Billion Citizens Hold the Key',
    isSecret: false,
    accentHex: '#56d4f5',
    secondaryHex: '#39d49a',
    voiceUrl: './assets/voice/ending_2.mp3',
    endingSpeakerId: 'nadia',
    endingSpeakerName: 'Nadia Al-Mansoor',
    endingSpeech:
      "You opened the vault live before two billion witnesses. No secret algorithms, no rigged trials—for the first time, the world's knowledge belongs to everyone.",
    epilogueBeats: [
      {
        id: 'end2_b1',
        speakerId: 'teo',
        speakerName: "Mateo 'Teo' Rojas",
        speakerRole: 'Rogue Broadcast Producer',
        expression: 'smirk',
        tellHint: 'Watches live upload bars hit 100% across six continents.',
        text: 'You walked away from a hundred million dollars—and handed humanity back its own mirror!',
        voiceUrl: './assets/voice/teo_cairo_twist.mp3',
      },
      {
        id: 'end2_b2',
        speakerId: 'nadia',
        speakerName: 'Nadia Al-Mansoor',
        speakerRole: 'Acoustic Engineer & Rival',
        expression: 'neutral',
        tellHint: "Clasps Tariq's hand as ship horns echo below the citadel.",
        text: 'No secret vault will ever erase a brilliant mind in the dark again.',
        voiceUrl: './assets/voice/nadia_london_intro.mp3',
      },
    ],
    permanentUnlocks: {
      titleCrest: 'VOICE OF THE COMMONS',
      skin: 'BLACK_SALON_CRIMSON',
      skinDisplayName: 'Black Salon Crimson & Smoked Quartz',
    },
  },
  KINGMAKER: {
    id: 'KINGMAKER',
    number: 3,
    title: 'The Kingmaker',
    subtitle: 'Alone Atop the Glass Spire',
    isSecret: false,
    accentHex: '#f09d46',
    secondaryHex: '#e05263',
    voiceUrl: './assets/voice/ending_3.mp3',
    endingSpeakerId: 'lindqvist',
    endingSpeakerName: 'Chancellor Ingrid Lindqvist',
    endingSpeech:
      "A pragmatic coronation. With the Council's architecture behind your intellect, the next century will be governed with absolute precision.",
    epilogueBeats: [
      {
        id: 'end3_b1',
        speakerId: 'lindqvist',
        speakerName: 'Chancellor Ingrid Lindqvist',
        speakerRole: 'Chair, Sovereign Bloc',
        expression: 'smirk',
        tellHint: 'Slides the Master Ledger override smoothly into your palm.',
        text: 'Idealists earn applause. Sovereigns write the next century.',
        voiceUrl: './assets/voice/lindqvist_london.mp3',
      },
      {
        id: 'end3_b2',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Chief Host · The Meridian',
        expression: 'intense',
        tellHint: 'Alone in Geneva, adjusts his left brass cufflink and opens a brand-new scouting file.',
        text: "Impressive climb. Now let's see who I recruit next to topple you.",
        voiceUrl: './assets/voice/vance_defeat.mp3',
      },
    ],
    permanentUnlocks: {
      titleCrest: 'SHADOW KINGMAKER',
      skin: 'KYOTO_KINTSUGI',
      skinDisplayName: 'Kyoto Urushi Lacquer & Kintsugi Gold',
    },
  },
  ARCHITECT_SUCCESSION: {
    id: 'ARCHITECT_SUCCESSION',
    number: 4,
    title: "The Architect's Succession",
    subtitle: 'Secret True Ending · The Permanent Global Citizen Council',
    isSecret: true,
    accentHex: '#39d49a',
    secondaryHex: '#f2cf7e',
    voiceUrl: './assets/voice/ending_4.mp3',
    endingSpeakerId: 'tariq',
    endingSpeakerName: 'Tariq Al-Mansoor',
    endingSpeech:
      'You solved Trial Zero, outplayed every rival, and exposed the hidden key. Julian stepped aside—because the Meridian finally found its true architect.',
    epilogueBeats: [
      {
        id: 'end4_b1',
        speakerId: 'tariq',
        speakerName: 'Tariq Al-Mansoor',
        speakerRole: 'Missing 2019 Champion',
        expression: 'neutral',
        tellHint: 'Traces one final open circle across the marble—never closed again.',
        text: 'No single throne. You rewrote the Charter into a rotating Global Citizen Council!',
        voiceUrl: './assets/voice/tariq_reykjavik.mp3',
      },
      {
        id: 'end4_b2',
        speakerId: 'vance',
        speakerName: 'Julian Vance',
        speakerRole: 'Chief Host · The Meridian',
        expression: 'smirk',
        tellHint: 'Taps his silver pen twice beside his right ear—his deepest salute.',
        text: 'Every day at midnight, the Global Feed summons new minds. Welcome to your legacy.',
        voiceUrl: './assets/voice/vance_stamp.mp3',
      },
    ],
    permanentUnlocks: {
      titleCrest: 'ARCHITECT OF THE MERIDIAN',
      skin: 'EMERALD_SOVEREIGN',
      skinDisplayName: 'Imperial Emerald & Sovereign Brass',
      extraUnlockLabel: "TARIQ'S MARGIN NOTES · CANONIZED GLOBAL FEED",
    },
  },
};

const CHARTER_HEAT_OPTIONS: ReadonlyArray<{
  id: MutatorId;
  title: string;
  desc: string;
}> = [
  {
    id: 'CHRONO_SURGE',
    title: 'Speed Blitz',
    desc: 'Tighter Chrono-Ring + 2x speed bonus payouts.',
  },
  {
    id: 'BLUFF_WAGER',
    title: 'Bluff Wager Duels',
    desc: 'Rivals deploy live Overclock feints — Call Bluff for +1,500 PTS.',
  },
  {
    id: 'ANALOG_STATIC',
    title: 'No-Peel Purist',
    desc: 'Seals Depth Peel shut for +25% Cold Instinct mastery.',
  },
  {
    id: 'DOUBLE_OR_NOTHING',
    title: 'High-Wire Stakes',
    desc: '2x payout ceiling with punishing miss shock.',
  },
];

function toWebUrl(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('res://')) return `./${trimmed.slice('res://'.length)}`;
  if (trimmed.startsWith('/assets/')) return `.${trimmed}`;
  if (trimmed.startsWith('assets/')) return `./${trimmed}`;
  return trimmed;
}

function escapeHtml(text: string): string {
  return stripHistoricalYearCommas(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function skinLabel(skin: PrismSkinId): string {
  switch (skin) {
    case 'DAMASCUS_TITANIUM':
      return 'Damascus Folded Steel & Titanium';
    case 'BLACK_SALON_CRIMSON':
      return 'Black Salon Crimson & Smoked Quartz';
    case 'KYOTO_KINTSUGI':
      return 'Kyoto Urushi Lacquer & Kintsugi Gold';
    case 'EMERALD_SOVEREIGN':
      return 'Imperial Emerald & Sovereign Brass';
    default:
      return 'Sovereign Obsidian & 24K Brass';
  }
}

/**
 * Builds the personalized 7-City Geneva-to-Singapore Decision Chronicle from `InkBlackboardSnapshot`.
 */
export function buildPersonalizedJourneyChronicle(
  snap: InkBlackboardSnapshot | null,
  challengerName: string,
): JourneyDecisionRecord[] {
  if (!snap) {
    return [
      {
        cityCode: 'CH → SG',
        cityName: 'The Meridian Circuit',
        headline: `${challengerName}'s Championship Ascent`,
        outcomeSummary: 'Survived all 7 global venues and claimed the Master Ledger Key at the Apex Forum.',
        tone: 'gold',
      },
    ];
  }

  const originLabel = snap.origin ? ORIGIN_DEFINITIONS[snap.origin].title : 'Independent Outsider';
  const personaLabel = snap.persona ? PERSONA_DEFINITIONS[snap.persona].title : 'Stamped Finalist';
  const mirrorFlag = String(
    snap.branchFlags.prologue_leak ??
      snap.branchFlags.mirror_leak ??
      snap.branchFlags.prologue_mirror ??
      'CLEAN',
  );
  const mirrorSummary =
    mirrorFlag === 'EXPLOITED' || mirrorFlag === 'EXPLOIT_LEAK'
      ? 'Exploited the one-way mirror glimpse for an early edge.'
      : mirrorFlag === 'FLAGGED' || mirrorFlag === 'FLAG_BREACH'
        ? 'Flagged Teo’s reflection breach directly to Julian Vance.'
        : 'Ignored the leaked reflection and solved the Prism cleanly.';

  const londonFlag = snap.branchFlags.london_briefing;
  const londonSummary =
    londonFlag === 'BURNED'
      ? 'Burned Chancellor Lindqvist’s sealed briefing unopened — earned Clean Hands & entered the Black Salon.'
      : londonFlag === 'ACCEPTED'
        ? 'Accepted Lindqvist’s Sovereign briefing — triggered Diplomatic Redaction & Nadia’s Suspicion Audit.'
        : snap.firstFlight === 'JP'
          ? 'Flew the Horizon Track to Tokyo first before facing Nadia under London’s Sovereign dome.'
          : 'Cleared the Sovereign Rotunda over sealed Trial Zero drawers.';

  const tokyoFlag = snap.branchFlags.tokyo_earpiece;
  const tokyoSummary =
    tokyoFlag === 'JAMMED'
      ? 'Fired a live mid-match Signal Jammer — locked Peel shut under Twist-Fracture lights to break Soren’s telemetry.'
      : tokyoFlag === 'BLACKMAILED'
        ? 'Leveraged Soren’s sub-vocal earpiece — claimed the Horizon Probability Lens.'
        : 'Outpaced Soren Kael seventy floors above neon-drenched Shibuya.';

  const rioFlag = snap.branchFlags.rio_sabotage;
  const rioSummary =
    rioFlag === 'SAVED_NADIA' || snap.bondTiers.nadia === 'ALLIED'
      ? 'Sacrificed 1 Boss Prism Shield to rescue Nadia’s sabotaged pod — forged an unbreakable Ally.'
      : rioFlag === 'CLAIMED_SEED' || snap.bondTiers.nadia === 'NEMESIS'
        ? 'Claimed the #1 seed over Nadia’s sabotaged pod — awakening a relentless counter-picking Nemesis.'
        : 'Endured twilight broadcast pressure beneath Rio’s Botanical Glass Canopy.';

  const cairoSummary =
    snap.act3Branch === 'WHISTLEBLOWER'
      ? 'Broadcast Tariq Al-Mansoor’s 2019 Trial Zero dossier live — rallied the global public with People’s Lens.'
      : snap.act3Branch === 'INSIDER'
        ? 'Pocketed the 99.4% match dossier for the Insider Gambit — infiltrated the Council Conclave from within.'
        : 'Uncovered Trial Zero and your 99.4% psychometric resonance beneath Giza.';

  const vaultCount = snap.vaultClues.length;
  const clueCount = snap.unlockedEvidenceClues.length;
  const reykjavikSummary = `Uncovered Vance & Tariq’s Trojan Horse alliance (${vaultCount}/3 Secret Vault Clues · ${clueCount}/12 Dossier Clues).`;

  const betrayer = snap.singaporeBetrayer;
  const singaporeSummary =
    betrayer === 'nadia'
      ? 'Overcame Nadia’s Ransom Deal on the Sky-Bridge to carry the key into International Waters.'
      : betrayer === 'teo'
        ? 'Survived Teo’s live backstage exposé above The Ledger’s data monoliths.'
        : 'Defeated Lindqvist’s Emergency Article IX coup and Soren’s Interim Arbiter claim.';

  return [
    {
      cityCode: 'CH',
      cityName: 'Geneva · Vetting Chamber',
      headline: `${originLabel} · Stamped ${personaLabel}`,
      outcomeSummary: mirrorSummary,
      tone: 'gold',
    },
    {
      cityCode: 'GB',
      cityName: 'London · Sovereign Rotunda',
      headline:
        londonFlag === 'BURNED'
          ? 'Burned the Sealed Briefing'
          : londonFlag === 'ACCEPTED'
            ? 'Accepted Sovereign Briefing'
            : `Act I Route: ${snap.firstFlight === 'JP' ? 'Tokyo First' : 'London First'}`,
      outcomeSummary: londonSummary,
      tone: londonFlag === 'ACCEPTED' ? 'crimson' : 'gold',
    },
    {
      cityCode: 'JP',
      cityName: 'Tokyo · Sky Pavilion',
      headline:
        tokyoFlag === 'JAMMED'
          ? 'Live Signal Jammer Fired'
          : tokyoFlag === 'BLACKMAILED'
            ? 'Horizon Telemetry Leverage'
            : 'Shibuya High-Velocity Duel',
      outcomeSummary: tokyoSummary,
      tone: tokyoFlag === 'JAMMED' ? 'cyan' : 'gold',
    },
    {
      cityCode: 'BR',
      cityName: 'Rio · Glass Canopy',
      headline:
        rioFlag === 'SAVED_NADIA' || snap.bondTiers.nadia === 'ALLIED'
          ? 'Shield Sacrificed · Allied Nadia'
          : rioFlag === 'CLAIMED_SEED'
            ? 'Claimed #1 Seed · Nemesis Nadia'
            : 'Botanical Arena Showdown',
      outcomeSummary: rioSummary,
      tone: rioFlag === 'CLAIMED_SEED' ? 'crimson' : 'emerald',
    },
    {
      cityCode: 'EG',
      cityName: 'Cairo · Meridian Zero',
      headline:
        snap.act3Branch === 'WHISTLEBLOWER'
          ? 'Whistleblower Global Broadcast'
          : snap.act3Branch === 'INSIDER'
            ? 'Insider Gambit Infiltration'
            : '99.4% Psychometric Match',
      outcomeSummary: cairoSummary,
      tone: snap.act3Branch === 'WHISTLEBLOWER' ? 'cyan' : 'gold',
    },
    {
      cityCode: 'IS',
      cityName: 'Reykjavik · Basalt Caldera',
      headline: 'The Trojan Horse Alliance',
      outcomeSummary: reykjavikSummary,
      tone: vaultCount >= 3 ? 'emerald' : 'cyan',
    },
    {
      cityCode: 'SG',
      cityName: 'Singapore · Sky-Bridge',
      headline: `Sky-Bridge Reckoning · Integrity ${snap.axisIntegrity >= 0 ? `+${snap.axisIntegrity}` : snap.axisIntegrity}`,
      outcomeSummary: `${singaporeSummary} (Public Trust ${snap.publicTrust} · Council Favor ${snap.councilFavor})`,
      tone: snap.axisIntegrity >= 10 ? 'emerald' : 'gold',
    },
  ];
}

// ============================================================================
// SCOPED ENDING SEQUENCE STYLES (Zero Viewport Clipping on Mobile & Desktop)
// ============================================================================

let endingStylesInjected = false;

function ensureEndingStyles(): void {
  ensureMotionCinemaStyles();
  if (endingStylesInjected || typeof document === 'undefined') return;
  endingStylesInjected = true;

  const style = document.createElement('style');
  style.id = 'ws-ending-sequence-styles';
  style.textContent = `
    .ws-end-overlay {
      position: fixed;
      inset: 0;
      width: 100%;
      max-width: 100vw;
      height: 100dvh;
      z-index: 92;
      background: rgba(4, 6, 11, 0.94);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0;
      pointer-events: auto;
      user-select: none;
      -webkit-user-select: none;
      opacity: 0;
      transition: opacity 0.36s ease, background 0.32s ease;
    }
    .ws-end-overlay.is-mounted {
      opacity: 1;
    }
    /* 3D Championship Crown Showcase: Upper 50dvh is 100% open & unobstructed pass-through! */
    .ws-end-overlay.is-crown-peek {
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      pointer-events: none;
    }
    .ws-end-overlay.is-crown-peek * {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    .ws-end-overlay.is-crown-peek .ws-end-interactive {
      pointer-events: auto;
    }
    .ws-end-overlay.is-crown-peek .ws-end-body,
    .ws-end-overlay.is-crown-peek .ws-end-body.ws-end-interactive {
      pointer-events: none;
      max-width: 100%;
      margin: 0;
    }
    .ws-end-bg-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      z-index: 0;
      pointer-events: none;
      transition: opacity 0.32s ease;
    }
    .ws-end-overlay.is-crown-peek .ws-end-bg-canvas {
      opacity: 0 !important;
    }
    /* Sleek Frameless Top Atmospheric Bar */
    .ws-end-topbar {
      position: relative;
      z-index: 3;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px 12px;
      flex-shrink: 0;
      padding: max(10px, env(safe-area-inset-top, 0px)) max(14px, env(safe-area-inset-right, 0px)) 10px max(14px, env(safe-area-inset-left, 0px));
      background: linear-gradient(180deg, rgba(4, 6, 11, 0.86) 0%, rgba(5, 8, 15, 0.38) 68%, rgba(5, 8, 15, 0) 100%);
    }
    .ws-end-overlay.is-crown-peek .ws-end-topbar {
      padding: max(8px, env(safe-area-inset-top, 0px)) max(12px, env(safe-area-inset-right, 0px)) 8px max(12px, env(safe-area-inset-left, 0px));
      background: linear-gradient(180deg, rgba(4, 6, 11, 0.60) 0%, rgba(4, 6, 11, 0) 100%);
    }
    .ws-end-topbar .ws-chyron {
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
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.92);
    }
    .ws-end-topbar .ws-chyron-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.10em;
    }
    .ws-end-topbar .ws-chyron-sub {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 0.78;
    }
    .ws-end-topbar-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    /* Frameless Ghost Topbar Trigger (>= 44px touch target, zero heavy box border!) */
    .ws-end-pill-btn {
      min-height: 44px;
      min-width: 44px;
      padding: 8px 13px;
      border-radius: 999px;
      background: rgba(6, 10, 18, 0.56);
      border: none;
      box-shadow: inset 0 -1px 0 rgba(232, 197, 116, 0.42);
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-mono, monospace);
      font-size: clamp(10px, 1vw, 11.5px);
      font-weight: 700;
      letter-spacing: 0.07em;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      transition: color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
    }
    .ws-end-pill-btn:hover {
      color: var(--end-accent, #f2cf7e);
      background: rgba(14, 20, 34, 0.76);
      box-shadow: inset 0 -1px 0 var(--end-accent, #f2cf7e);
    }
    .ws-end-body {
      position: relative;
      z-index: 3;
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    /* Bottom Frameless Cinema Scrim for Act A Monologue */
    .ws-end-monologue-scrim {
      width: 100%;
      background: linear-gradient(180deg, rgba(4, 6, 11, 0) 0%, rgba(5, 8, 15, 0.72) 22%, rgba(4, 7, 13, 0.95) 58%, rgba(4, 6, 11, 0.99) 100%);
      padding: clamp(22px, 3.2dvh, 36px) max(16px, env(safe-area-inset-right, 0px)) max(12px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
    }
    /* 3D Crown Showcase: Open Upper >= 50dvh + Frameless Bottom Editorial Scrim */
    .ws-end-crown-stage {
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      pointer-events: none;
    }
    .ws-end-standalone-stage {
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
      max-height: 50dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }
    .ws-end-crown-sheet {
      position: relative;
      width: 100%;
      max-height: 44dvh;
      margin-top: auto;
      padding: clamp(18px, 2.8dvh, 28px) max(18px, env(safe-area-inset-right, 0px)) max(14px, env(safe-area-inset-bottom, 0px)) max(18px, env(safe-area-inset-left, 0px));
      background: linear-gradient(180deg, rgba(4, 6, 11, 0) 0%, rgba(5, 8, 15, 0.80) 24%, rgba(4, 6, 11, 0.96) 100%);
      border: none;
      border-radius: 0;
      box-shadow: none;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      pointer-events: auto;
    }
    .ws-end-crown-sheet::before {
      content: '';
      position: absolute;
      top: 0;
      left: 8%;
      right: 8%;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, var(--end-accent, #f2cf7e) 50%, transparent 100%);
      opacity: 0.65;
      pointer-events: none;
    }
    /* Act B: Sleek Frameless Editorial Legacy Chronicle (Zero Nested Boxes!) */
    .ws-end-dossier-scroll {
      position: relative;
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
      max-width: 1020px;
      margin: 0 auto;
      overflow-y: auto;
      padding: clamp(16px, 2.6dvh, 26px) max(16px, env(safe-area-inset-right, 0px)) max(16px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
      border-radius: 0;
      background: linear-gradient(180deg, rgba(6, 10, 19, 0.86) 0%, rgba(4, 7, 13, 0.97) 100%);
      border: none;
      box-shadow: none;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      display: flex;
      flex-direction: column;
      gap: clamp(14px, 2dvh, 18px);
    }
    .ws-end-dossier-scroll::before {
      content: '';
      position: absolute;
      top: 0;
      left: 4%;
      right: 4%;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, var(--end-accent, #f2cf7e) 50%, transparent 100%);
      opacity: 0.6;
      pointer-events: none;
    }
    .ws-end-dossier-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 12px 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(232, 197, 116, 0.22);
    }
    .ws-end-unlocks-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 18px;
      align-items: flex-start;
    }
    .ws-end-unlock-stat {
      padding: 2px 0 2px 12px;
      border: none;
      border-left: 1.5px solid var(--unlock-accent, rgba(232, 197, 116, 0.52));
      background: transparent;
      font-family: var(--font-mono, monospace);
      font-size: 11px;
      line-height: 1.35;
    }
    .ws-end-journey-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 8px 14px;
    }
    /* Frameless Editorial Chronicle Row with 2px Tone Hairline (Zero Box Border!) */
    .ws-end-journey-card {
      padding: 8px 10px 8px 12px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.026);
      border: none;
      box-shadow: inset 2px 0 0 var(--tone-accent, #f2cf7e);
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .ws-end-ncp-section {
      padding: 14px 0 0;
      border: none;
      border-top: 1px solid rgba(232, 197, 116, 0.24);
      border-radius: 0;
      background: transparent;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ws-end-heat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(195px, 1fr));
      gap: 8px 10px;
    }
    /* Frameless Toggle Strips (>= 44px touch target, glowing left accent bar!) */
    .ws-end-heat-chip {
      min-height: 44px;
      padding: 9px 12px 9px 14px;
      border-radius: 6px;
      text-align: left;
      background: rgba(255, 255, 255, 0.032);
      border: none;
      box-shadow: inset 3px 0 0 rgba(184, 178, 166, 0.28);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      transition: box-shadow 0.16s ease, background 0.16s ease;
    }
    .ws-end-heat-chip.is-selected {
      box-shadow: inset 3px 0 0 var(--end-accent, #f2cf7e);
      background: rgba(242, 207, 126, 0.12);
    }
    .ws-end-cta-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 6px;
      border-top: 1px solid rgba(255, 255, 255, 0.07);
    }
    .ws-end-cta-btn {
      min-height: 44px;
      padding: 10px 20px;
    }
    @media (max-width: 560px) {
      .ws-end-topbar .ws-chyron-sub {
        display: none;
      }
      .ws-end-topbar .ws-chyron-title {
        font-size: 10.5px;
        letter-spacing: 0.05em;
      }
      .ws-end-pill-btn {
        padding: 8px 10px;
        font-size: 10px;
      }
      .ws-end-monologue-scrim {
        padding: 18px 12px max(10px, env(safe-area-inset-bottom, 0px)) 12px;
      }
      .ws-end-cta-bar {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .ws-end-cta-btn {
        width: 100%;
        padding: 10px 10px;
        font-size: 11px;
      }
    }
    @media (max-height: 520px) and (orientation: landscape) {
      .ws-end-topbar {
        padding: 6px max(14px, env(safe-area-inset-right, 0px)) 6px max(14px, env(safe-area-inset-left, 0px));
      }
      .ws-end-monologue-scrim {
        padding: 10px max(14px, env(safe-area-inset-right, 0px)) 6px max(14px, env(safe-area-inset-left, 0px));
      }
      .ws-end-dossier-scroll {
        padding: 10px max(14px, env(safe-area-inset-right, 0px)) 10px max(14px, env(safe-area-inset-left, 0px));
        gap: 10px;
      }
      /* Landscape 3D Crown Showcase: Left 50vw 100% open 3D Crown, Right 48vw sleek caption */
      .ws-end-overlay.is-crown-peek .ws-end-crown-stage {
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
      }
      .ws-end-overlay.is-crown-peek .ws-end-standalone-stage {
        max-height: 100%;
        width: 50vw;
      }
      .ws-end-overlay.is-crown-peek .ws-end-crown-sheet {
        width: min(46vw, 380px);
        max-height: calc(100dvh - 60px);
        margin-top: 0;
        text-align: left;
        align-items: flex-start;
        background: linear-gradient(90deg, rgba(4, 6, 11, 0) 0%, rgba(5, 8, 15, 0.86) 22%, rgba(4, 6, 11, 0.96) 100%);
        padding: 16px max(16px, env(safe-area-inset-right, 0px)) 16px 26px;
      }
      .ws-end-overlay.is-crown-peek .ws-end-crown-sheet::before {
        top: 12%;
        bottom: 12%;
        left: 12px;
        right: auto;
        width: 1px;
        height: auto;
        background: linear-gradient(180deg, transparent 0%, var(--end-accent, #f2cf7e) 50%, transparent 100%);
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// MASTER 4-ENDING EPILOGUE SEQUENCE DIRECTOR
// ============================================================================

export class EndingSequenceDirector {
  private readonly audio: StudioAudioEngine;
  private readonly haptics: HapticsEngine;

  private activeOverlay: HTMLElement | null = null;
  private rafId = 0;
  private wordTimers: Array<ReturnType<typeof setTimeout>> = [];
  private disposeStandaloneTrophy: (() => void) | null = null;
  private boundResize: (() => void) | null = null;
  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;

  constructor(audio: StudioAudioEngine, haptics: HapticsEngine) {
    this.audio = audio;
    this.haptics = haptics;
    ensureEndingStyles();
  }

  public isActive(): boolean {
    return this.activeOverlay !== null;
  }

  /**
   * Launches the full cinematic epilogue sequence for any of the 4 Endings:
   *  Act A: Voiced Championship Monologue (`ending_1..4.mp3`) + Character Epilogue Beats
   *  Act B: Personalized Geneva-to-Singapore Chronicle + 3D Crown Showcase + New Circuit+ Unlock
   */
  public play(options: EndingSequencePlayOptions): void {
    this.close();
    ensureEndingStyles();

    const isViewObj = typeof options.ending === 'object' && options.ending !== null;
    const endingId: EndingId = isViewObj
      ? (options.ending as CampaignEndingView).id
      : (options.ending as EndingId);
    const canon = CANONICAL_ENDINGS[endingId] ?? CANONICAL_ENDINGS.SOVEREIGN_ARBITER;
    const view = isViewObj ? (options.ending as CampaignEndingView) : null;

    const bbSnap: InkBlackboardSnapshot | null = options.blackboard
      ? 'getSnapshot' in options.blackboard
        ? options.blackboard.getSnapshot()
        : options.blackboard
      : null;

    const challengerName =
      options.challengerName?.trim() ||
      options.passport?.getChallengerName() ||
      'Challenger';

    const interpolate = (txt: string) =>
      stripHistoricalYearCommas(
        txt
          .replace(/\[\[[\s\S]*?\]\]/g, '')
          .replace(/\{player\}|\{name\}|\{challengerName\}|<CHALLENGER>/gi, challengerName)
          .trim(),
      );

    const speechVoiceUrl = toWebUrl(view?.voiceUrl) || canon.voiceUrl;
    const speechText = interpolate(view?.endingSpeech || canon.endingSpeech);

    // Combine Beat 0 (Championship Monologue) + Character Epilogue Beats
    const epilogueQueue: Array<{
      id: string;
      speakerId: string;
      speakerName: string;
      speakerRole: string;
      expression: string;
      tellHint?: string;
      text: string;
      voiceUrl: string;
    }> = [
      {
        id: 'coronation_monologue',
        speakerId: view?.endingSpeakerId ?? canon.endingSpeakerId,
        speakerName: canon.endingSpeakerName,
        speakerRole: `ENDING ${canon.number} OF 4 · ${canon.title.toUpperCase()}`,
        expression: 'intense',
        tellHint: canon.subtitle,
        text: speechText,
        voiceUrl: speechVoiceUrl,
      },
    ];

    if (view && view.epilogueBeats.length > 0) {
      for (const b of view.epilogueBeats as CampaignDialogueBeat[]) {
        epilogueQueue.push({
          id: b.id,
          speakerId: b.speakerId,
          speakerName: b.speakerName,
          speakerRole: b.speakerRole,
          expression: b.expression,
          tellHint: b.tellHint,
          text: interpolate(b.text),
          voiceUrl: toWebUrl(b.voiceUrl),
        });
      }
    } else {
      for (const b of canon.epilogueBeats) {
        epilogueQueue.push({
          ...b,
          text: interpolate(b.text),
        });
      }
    }

    const journeyChronicle = buildPersonalizedJourneyChronicle(bbSnap, challengerName);
    const titleCrest = view?.permanentUnlocks.titleCrest ?? canon.permanentUnlocks.titleCrest;
    const unlockedSkin = view?.permanentUnlocks.skin ?? canon.permanentUnlocks.skin;
    const achievedCount = bbSnap ? Math.max(1, new Set([...bbSnap.achievedEndings, endingId]).size) : 1;
    const nextCircuitLoop = (bbSnap?.newCircuitPlusCount ?? 0) + 1;

    // Showcase the 3D Championship Crown on Stage3D right away!
    if (options.stage3d) {
      void options.stage3d.showChampionshipTrophy(0);
    }
    options.onShowcase3DCrown?.();

    this.haptics.correctBloom();
    this.audio.playSfx('gold_resonance');

    const overlay = document.createElement('div');
    overlay.className = 'ws-end-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `${canon.title} Epilogue`);
    overlay.style.setProperty('--end-accent', canon.accentHex);

    overlay.innerHTML = `
      <canvas class="ws-end-bg-canvas" id="ws-end-bg-cv"></canvas>

      <div class="ws-end-topbar ws-end-interactive">
        <div class="ws-chyron">
          <span class="ws-chyron-dot" style="background:${canon.accentHex};box-shadow:0 0 10px ${canon.accentHex};"></span>
          <span class="ws-chyron-title" style="color:${canon.accentHex};">
            ${canon.isSecret ? '★ SECRET TRUE ENDING' : `ENDING ${canon.number} / 4`} · ${escapeHtml(canon.title.toUpperCase())}
          </span>
          <span class="ws-chyron-sub">· ${escapeHtml(canon.subtitle)}</span>
        </div>

        <div class="ws-end-topbar-actions">
          <button type="button" class="ws-end-pill-btn" id="ws-end-crown-toggle">
            🏆 3D CROWN
          </button>
          <button type="button" class="ws-end-pill-btn" id="ws-end-skip-btn">
            LEGACY ⏭
          </button>
        </div>
      </div>

      <div class="ws-end-body ws-end-interactive" id="ws-end-stage-slot"></div>
    `;

    document.body.appendChild(overlay);
    this.activeOverlay = overlay;
    requestAnimationFrame(() => overlay.classList.add('is-mounted'));

    // Load Apex Finale painting for 60fps Ending Canvas Backdrop
    const bgCanvas = overlay.querySelector<HTMLCanvasElement>('#ws-end-bg-cv')!;
    const bgCtx = bgCanvas.getContext('2d');
    let backdropImg: HTMLImageElement | null = null;
    const rawImg = new Image();
    rawImg.decoding = 'async';
    rawImg.onload = () => {
      backdropImg = rawImg;
    };
    rawImg.src = './assets/cutscenes/act5_apex_finale.jpg';

    let vw = Math.max(320, window.innerWidth || 1280);
    let vh = Math.max(320, window.innerHeight || 720);
    const syncCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = Math.max(320, window.innerWidth || 1280);
      vh = Math.max(320, window.innerHeight || 720);
      bgCanvas.width = Math.round(vw * dpr);
      bgCanvas.height = Math.round(vh * dpr);
      bgCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    syncCanvas();

    const stageSlot = overlay.querySelector<HTMLElement>('#ws-end-stage-slot')!;
    const crownToggleBtn = overlay.querySelector<HTMLButtonElement>('#ws-end-crown-toggle')!;
    const skipBtn = overlay.querySelector<HTMLButtonElement>('#ws-end-skip-btn')!;

    let mode: 'MONOLOGUE' | 'CHRONICLE' = 'MONOLOGUE';
    let crownPeekMode = false;
    let beatIdx = 0;
    const selectedHeat = new Set<MutatorId>();

    const updateCrownPeekUi = () => {
      const uiRootEl = document.getElementById('ui-root');
      if (uiRootEl) {
        uiRootEl.style.visibility = crownPeekMode ? 'hidden' : 'visible';
      }
      overlay.classList.toggle('is-crown-peek', crownPeekMode);
      crownToggleBtn.textContent = crownPeekMode ? '◀ EPILOGUE' : '🏆 3D CROWN';
      if (crownPeekMode) {
        if (options.stage3d) {
          void options.stage3d.showChampionshipTrophy(0);
        }
        options.onShowcase3DCrown?.();
        stageSlot.innerHTML = `
          <div class="ws-end-crown-stage">
            ${
              !options.stage3d
                ? `<div class="ws-end-standalone-stage"><div id="ws-end-standalone-3d" style="width:min(86vw,300px);height:min(44dvh,280px);"></div></div>`
                : ''
            }
            <div class="ws-end-crown-sheet">
              <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.16em;color:var(--ivory-muted);">
                ↻ DRAG 3D CROWN TO ORBIT · 360° GOLD RESONANCE
              </div>
              <div style="font-family:var(--font-display);font-weight:800;font-size:clamp(15px,2.2vw,20px);color:${canon.accentHex};letter-spacing:0.09em;text-shadow:0 2px 16px rgba(0,0,0,0.9);">
                MASTER LEDGER CROWN · ${escapeHtml(titleCrest)}
              </div>
              <div style="font-size:clamp(11.5px,1.2vw,13px);color:var(--ivory-muted);max-width:440px;line-height:1.4;">
                ${escapeHtml(canon.title)} — ${escapeHtml(canon.subtitle)}
              </div>
            </div>
          </div>
        `;
        if (!options.stage3d) {
          const holder = stageSlot.querySelector<HTMLElement>('#ws-end-standalone-3d');
          if (holder) {
            this.disposeStandaloneTrophy?.();
            this.disposeStandaloneTrophy = mountStandaloneTrophyPreview(holder, './');
          }
        }
      } else {
        this.disposeStandaloneTrophy?.();
        this.disposeStandaloneTrophy = null;
        if (mode === 'MONOLOGUE') {
          renderMonologueBeat(beatIdx, false);
        } else {
          renderChronicleDossier();
        }
      }
    };

    const clearWordTimers = () => {
      for (const t of this.wordTimers) clearTimeout(t);
      this.wordTimers = [];
    };

    const renderMonologueBeat = (idx: number, playVo = true) => {
      clearWordTimers();
      const beat = epilogueQueue[idx];
      if (!beat) {
        enterChronicleMode();
        return;
      }
      const portraitUrl = resolveCinemaPortraitUrl(beat.speakerId, beat.expression);
      const isLast = idx + 1 >= epilogueQueue.length;
      const words = `“${beat.text}”`.split(/\s+/).filter(Boolean);
      const wordsHtml = words
        .map((w) => `<span class="ws-mc-word">${escapeHtml(w)}</span>`)
        .join(' ');

      stageSlot.innerHTML = `
        <div class="ws-end-monologue-scrim">
          <div class="ws-mc-deck" style="--mc-accent:${canon.accentHex};">
            <div class="ws-mc-dialogue-row">
              <div class="ws-mc-portrait-frame is-speaking">
                <img class="ws-mc-portrait-img is-visible" src="${escapeHtml(portraitUrl)}" alt="${escapeHtml(beat.speakerName)}" />
              </div>
              <div style="flex:1 1 auto;min-width:0;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 8px;">
                  <div>
                    <span style="font-family:var(--font-display);font-weight:800;font-size:clamp(13px,1.45vw,16.5px);color:${canon.accentHex};letter-spacing:0.09em;text-shadow:0 2px 12px rgba(0,0,0,0.85);">
                      ${escapeHtml(beat.speakerName.toUpperCase())}
                    </span>
                    <span style="font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);margin-left:8px;">
                      ${escapeHtml(beat.speakerRole)}
                    </span>
                  </div>
                  <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-muted);">
                    EPILOGUE ${idx + 1} / ${epilogueQueue.length}
                  </span>
                </div>
                <p id="ws-end-beat-text" style="margin:7px 0 0;font-size:clamp(14px,1.55vw,18.5px);line-height:1.48;color:var(--ivory-primary);font-weight:500;text-shadow:0 2px 14px rgba(0,0,0,0.9);">
                  ${wordsHtml}
                </p>
                ${
                  beat.tellHint
                    ? `<div style="margin-top:6px;font-family:var(--font-mono);font-size:11px;color:var(--cyan-clue);text-shadow:0 1px 8px rgba(0,0,0,0.85);">✦ ${escapeHtml(beat.tellHint)}</div>`
                    : ''
                }
              </div>
            </div>

            <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;padding-top:4px;">
              <button type="button" class="ws-btn-gold ws-end-cta-btn" id="ws-end-next-beat">
                ${isLast ? 'VIEW LEGACY & NEW CIRCUIT+ ▶' : 'NEXT EPILOGUE BEAT ▶'}
              </button>
            </div>
          </div>
        </div>
      `;

      const wordSpans = Array.from(stageSlot.querySelectorAll<HTMLElement>('.ws-mc-word'));
      let delayMs = 20;
      wordSpans.forEach((sp, wIdx) => {
        const tm = setTimeout(() => sp.classList.add('is-revealed'), delayMs);
        this.wordTimers.push(tm);
        const w = words[wIdx] || '';
        delayMs += 38 + (/[—.!?;:]/.test(w) ? 68 : 0);
      });

      if (playVo) {
        if (beat.voiceUrl) {
          this.audio.playVoice(beat.voiceUrl);
        } else {
          this.audio.stopVoice();
        }
      }

      stageSlot.querySelector<HTMLButtonElement>('#ws-end-next-beat')?.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        beatIdx += 1;
        if (beatIdx >= epilogueQueue.length) {
          enterChronicleMode();
        } else {
          renderMonologueBeat(beatIdx, true);
        }
      });
    };

    const enterChronicleMode = () => {
      mode = 'CHRONICLE';
      skipBtn.style.display = 'none';
      this.audio.stopVoice();
      this.haptics.passportStamp();
      this.audio.playSfx('passport_stamp');
      renderChronicleDossier();
    };

    const renderChronicleDossier = () => {
      const journeyHtml = journeyChronicle
        .map((item) => {
          const badgeColor =
            item.tone === 'emerald'
              ? 'var(--emerald-win)'
              : item.tone === 'cyan'
                ? 'var(--cyan-clue)'
                : item.tone === 'crimson'
                  ? 'var(--crimson-alert)'
                  : 'var(--gold-bright)';
          return `
            <div class="ws-end-journey-card" style="--tone-accent:${badgeColor};">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${badgeColor};letter-spacing:0.09em;">
                  ${escapeHtml(item.cityCode)} · ${escapeHtml(item.cityName.toUpperCase())}
                </span>
              </div>
              <div style="font-family:var(--font-display);font-size:12.5px;font-weight:700;color:var(--ivory-primary);">
                ${escapeHtml(item.headline)}
              </div>
              <div style="font-size:11.5px;line-height:1.4;color:var(--ivory-muted);">
                ${escapeHtml(item.outcomeSummary)}
              </div>
            </div>
          `;
        })
        .join('');

      const heatHtml = CHARTER_HEAT_OPTIONS.map((opt) => {
        const isSel = selectedHeat.has(opt.id);
        return `
          <button type="button" class="ws-end-heat-chip ${isSel ? 'is-selected' : ''}" data-heat="${opt.id}">
            <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${isSel ? canon.accentHex : 'var(--ivory-primary)'};">
              ${isSel ? '✓ ' : '+ '}${escapeHtml(opt.title)}
            </span>
            <span style="font-size:10.5px;color:var(--ivory-muted);line-height:1.3;">
              ${escapeHtml(opt.desc)}
            </span>
          </button>
        `;
      }).join('');

      stageSlot.innerHTML = `
        <div class="ws-end-dossier-scroll">
          <!-- Coronation Header & Frameless Permanent Unlocks Strip -->
          <div class="ws-end-dossier-header">
            <div>
              <div style="font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.15em;color:${canon.accentHex};">
                MERIDIAN CORONATION RECORD · CHALLENGER ${escapeHtml(challengerName.toUpperCase())}
              </div>
              <h2 style="margin:4px 0 0;font-family:var(--font-display);font-size:clamp(18px,2.6vw,28px);font-weight:900;color:var(--ivory-primary);letter-spacing:0.06em;">
                ${escapeHtml(canon.title)} — ${escapeHtml(canon.subtitle)}
              </h2>
            </div>

            <div class="ws-end-unlocks-strip">
              <div class="ws-end-unlock-stat" style="--unlock-accent:${canon.accentHex};">
                <div style="font-size:10px;letter-spacing:0.08em;color:var(--ivory-muted);">PERMANENT TITLE CREST</div>
                <div style="color:${canon.accentHex};font-weight:800;">★ ${escapeHtml(titleCrest)}</div>
              </div>
              <div class="ws-end-unlock-stat" style="--unlock-accent:var(--cyan-clue);">
                <div style="font-size:10px;letter-spacing:0.08em;color:var(--ivory-muted);">PRESTIGE PRISM FINISH</div>
                <div style="color:var(--cyan-clue);font-weight:700;">◆ ${escapeHtml(skinLabel(unlockedSkin))}</div>
              </div>
              <div class="ws-end-unlock-stat" style="--unlock-accent:var(--emerald-win);">
                <div style="font-size:10px;letter-spacing:0.08em;color:var(--ivory-muted);">ENDINGS ARCHIVED</div>
                <div style="color:var(--emerald-win);font-weight:700;">${achievedCount} / 4 UNLOCKED</div>
              </div>
            </div>
          </div>

          <!-- Personalized 7-City Geneva-to-Singapore Choice Summary -->
          <div>
            <div style="font-family:var(--font-display);font-size:12.5px;font-weight:800;color:var(--gold-bright);letter-spacing:0.10em;margin-bottom:8px;">
              YOUR GENEVA-TO-SINGAPORE CONSPIRACY CHRONICLE
            </div>
            <div class="ws-end-journey-grid">
              ${journeyHtml}
            </div>
          </div>

          <!-- New Circuit+ ("The Second Dossier") Unlock & Optional Charter Heat -->
          <div class="ws-end-ncp-section">
            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;">
              <div>
                <div style="font-family:var(--font-display);font-size:13.5px;font-weight:800;color:${canon.accentHex};letter-spacing:0.08em;">
                  ↻ NEW CIRCUIT+ UNLOCKED — THE SECOND DOSSIER (CYCLE #${nextCircuitLoop})
                </div>
                <div style="font-size:11.5px;color:var(--ivory-muted);margin-top:2px;">
                  Carry over all Relics, Perks, Prism Skins, Vault Clues & Endings (+0.45 IRT Escalation + Zero Question Repeats). Optional Charter Heat (up to 3):
                </div>
              </div>
              <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--gold-bright);font-variant-numeric:tabular-nums;">
                HEAT: ${selectedHeat.size} / 3
              </span>
            </div>

            <div class="ws-end-heat-grid">
              ${heatHtml}
            </div>
          </div>

          <!-- Final Coronation Actions -->
          <div class="ws-end-cta-bar">
            <button type="button" class="ws-btn-obsidian ws-end-cta-btn" id="ws-end-return-hub">
              RETURN TO GLOBE ▶
            </button>
            <button type="button" class="ws-btn-gold ws-end-cta-btn" id="ws-end-launch-ncp">
              LAUNCH NEW CIRCUIT+ ↻
            </button>
          </div>
        </div>
      `;

      stageSlot.querySelectorAll<HTMLButtonElement>('[data-heat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mut = btn.dataset.heat as MutatorId;
          this.haptics.uiTap();
          this.audio.playSfx('ui_tap');
          if (selectedHeat.has(mut)) {
            selectedHeat.delete(mut);
          } else if (selectedHeat.size < 3) {
            selectedHeat.add(mut);
          }
          renderChronicleDossier();
        });
      });

      stageSlot.querySelector<HTMLButtonElement>('#ws-end-return-hub')?.addEventListener('click', () => {
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        const cb = options.onReturnToHub;
        this.close();
        cb?.();
      });

      stageSlot.querySelector<HTMLButtonElement>('#ws-end-launch-ncp')?.addEventListener('click', () => {
        this.haptics.passportStamp();
        this.audio.playSfx('passport_stamp');
        const chosen = Array.from(selectedHeat);
        const ncpCb = options.onStartNewCircuitPlus;
        const hubCb = options.onReturnToHub;
        this.close();
        if (ncpCb) {
          ncpCb(chosen);
        } else {
          // Fallback only when no host callback owns the New Circuit+ transition
          const bb = options.blackboard;
          if (bb && 'startNewCircuitPlus' in bb) {
            bb.startNewCircuitPlus(chosen);
          }
          hubCb?.();
        }
      });
    };

    crownToggleBtn.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      crownPeekMode = !crownPeekMode;
      updateCrownPeekUi();
    });

    skipBtn.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      if (crownPeekMode) {
        crownPeekMode = false;
        updateCrownPeekUi();
      }
      enterChronicleMode();
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
      if (ev.key === 'Escape') {
        ev.preventDefault();
        if (crownPeekMode) {
          crownPeekMode = false;
          updateCrownPeekUi();
        } else if (mode === 'MONOLOGUE') {
          enterChronicleMode();
        } else {
          const cb = options.onReturnToHub;
          this.close();
          cb?.();
        }
      } else if (
        (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowRight') &&
        mode === 'MONOLOGUE' &&
        !crownPeekMode
      ) {
        ev.preventDefault();
        this.haptics.uiTap();
        this.audio.playSfx('ui_tap');
        beatIdx += 1;
        if (beatIdx >= epilogueQueue.length) {
          enterChronicleMode();
        } else {
          renderMonologueBeat(beatIdx, true);
        }
      }
    };
    window.addEventListener('resize', this.boundResize, { passive: true });
    window.addEventListener('keydown', this.boundKeyDown);

    // Begin Act A Beat 0 immediately!
    renderMonologueBeat(0, true);

    // 60fps Ending Atmospheric Backdrop Loop
    const startMs = performance.now();
    const motes = Array.from({ length: 56 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.025,
      vy: -0.025 - Math.random() * 0.045,
      r: 1.5 + (i % 4) * 1.4,
      a: 0.25 + Math.random() * 0.5,
    }));

    const tick = (nowMs: number) => {
      if (this.activeOverlay !== overlay) return;
      this.rafId = requestAnimationFrame(tick);
      if (!bgCtx || crownPeekMode || document.hidden) return;

      const t = (nowMs - startMs) / 1000;
      bgCtx.fillStyle = '#050811';
      bgCtx.fillRect(0, 0, vw, vh);

      if (backdropImg) {
        const scale = 1.05 + Math.sin(t * 0.18) * 0.025;
        const imgAspect = (backdropImg.naturalWidth || 1920) / Math.max(1, backdropImg.naturalHeight || 1080);
        const viewAspect = vw / Math.max(1, vh);
        const dw = viewAspect > imgAspect ? vw : vh * imgAspect;
        const dh = viewAspect > imgAspect ? vw / imgAspect : vh;
        bgCtx.save();
        bgCtx.translate(vw * 0.5, vh * 0.5);
        bgCtx.scale(scale, scale);
        bgCtx.globalAlpha = 0.68;
        bgCtx.drawImage(backdropImg, -dw * 0.5, -dh * 0.5, dw, dh);
        bgCtx.restore();
      }

      // Ending-specific atmospheric lighting signature
      bgCtx.save();
      bgCtx.globalCompositeOperation = 'screen';
      if (endingId === 'ARCHITECT_SUCCESSION') {
        // Secret True Ending: Sweeping Aurora Borealis + Citizen Council Rings
        const aurora = bgCtx.createLinearGradient(0, 0, vw, vh * 0.65);
        aurora.addColorStop(0, `rgba(57, 212, 154, ${(0.16 + 0.06 * Math.sin(t * 1.1)).toFixed(3)})`);
        aurora.addColorStop(0.5, `rgba(86, 212, 245, ${(0.14 + 0.05 * Math.cos(t * 0.9)).toFixed(3)})`);
        aurora.addColorStop(1, 'rgba(242, 207, 126, 0.08)');
        bgCtx.fillStyle = aurora;
        bgCtx.fillRect(0, 0, vw, vh);
      } else if (endingId === 'OPEN_COMMONS') {
        // Open Commons: Global Broadcast Uplink Arcs
        bgCtx.strokeStyle = 'rgba(86, 212, 245, 0.22)';
        bgCtx.lineWidth = 1.5;
        for (let arc = 0; arc < 4; arc++) {
          bgCtx.beginPath();
          bgCtx.ellipse(
            vw * 0.5,
            vh * 0.85,
            vw * (0.24 + arc * 0.12),
            vh * (0.22 + arc * 0.09),
            0,
            Math.PI,
            Math.PI * 2,
          );
          bgCtx.stroke();
        }
      } else if (endingId === 'KINGMAKER') {
        // Kingmaker: Cold Platinum & Amber Spire Vignette
        const spire = bgCtx.createRadialGradient(vw * 0.5, vh * 0.35, 30, vw * 0.5, vh * 0.5, vw * 0.7);
        spire.addColorStop(0, 'rgba(240, 157, 70, 0.16)');
        spire.addColorStop(1, 'rgba(224, 82, 99, 0.12)');
        bgCtx.fillStyle = spire;
        bgCtx.fillRect(0, 0, vw, vh);
      } else {
        // Sovereign Arbiter: Warm 24K Ocean Sunrise Rays
        const sun = bgCtx.createRadialGradient(vw * 0.6, vh * 0.3, 20, vw * 0.6, vh * 0.4, vw * 0.65);
        sun.addColorStop(0, 'rgba(250, 226, 156, 0.24)');
        sun.addColorStop(1, 'rgba(216, 175, 87, 0)');
        bgCtx.fillStyle = sun;
        bgCtx.fillRect(0, 0, vw, vh);
      }

      for (const m of motes) {
        m.x = (m.x + m.vx * 0.016 + 1) % 1;
        m.y = (m.y + m.vy * 0.016 + 1) % 1;
        bgCtx.fillStyle =
          endingId === 'OPEN_COMMONS'
            ? `rgba(86, 212, 245, ${m.a.toFixed(3)})`
            : endingId === 'ARCHITECT_SUCCESSION'
              ? `rgba(57, 212, 154, ${m.a.toFixed(3)})`
              : `rgba(242, 207, 126, ${m.a.toFixed(3)})`;
        bgCtx.beginPath();
        bgCtx.arc(m.x * vw, m.y * vh, m.r, 0, Math.PI * 2);
        bgCtx.fill();
      }
      bgCtx.restore();
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public close(): void {
    this.audio.stopVoice();
    for (const t of this.wordTimers) clearTimeout(t);
    this.wordTimers = [];
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    this.disposeStandaloneTrophy?.();
    this.disposeStandaloneTrophy = null;

    if (this.boundResize) {
      window.removeEventListener('resize', this.boundResize);
      this.boundResize = null;
    }
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
      this.boundKeyDown = null;
    }

    const uiRootEl = document.getElementById('ui-root');
    if (uiRootEl) {
      uiRootEl.style.visibility = 'visible';
    }

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
