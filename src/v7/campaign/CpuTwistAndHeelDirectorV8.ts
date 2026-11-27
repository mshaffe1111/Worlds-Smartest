// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v8.0 "Sweeps Week Deluxe")
// `src/v7/campaign/CpuTwistAndHeelDirectorV8.ts`
// Match-Level CPU Twist Parity, Randomized Heel Cheat Schedules & Multi-Bust
// Rattle Director (Upgrade #4 — *Twenty-One* Scandal Dramaturgy & Fair AI):
//   1. `generateHeelCheatTurnsV8`: Deterministic per-match non-adjacent cheat
//      turns (`[]` for HONEST, `2` in Season 2, `3` in Seasons 3–4 across
//      `[2 .. totalTurns - 1]`; zero hardcoded `[2, 5, 8]` repetition) +
//      Turn 7/8 trailing (`>= $600`) Control Booth A emergency rigged tell +
//      100% telegraphed `getTellTelegraphSpec(turnNumber)`.
//   2. `recordBoothBust`: Progressive multi-bust rattle & bounty escalation
//      (Bust #1 `RATTLED` `-0.10` `2` tilt `$175`; Bust #2 `BREAKDOWN` `-0.20`
//      `3` tilt `$275` + `"STANDARDS & PRACTICES LOCKS BOOTH A!"` episode feed
//      cutoff; Bust #3+ `$350`).
//   3. `resolveCpuBigWheelWedge` & `consumeArmedCpuMultiplier`: Full CPU parity
//      across all 5 `BigWheelWedgeKindV7` wedges (`CASH`, `DOUBLE`, `LIFELINE`,
//      `STEAL`, `GREMLIN`), Mystery Curtain `DOUBLE_CHIPS` `2.0x` arming,
//      `cpuGremlinCount` (`0..4`), and CPU animated Gremlin skit payload.
//   4. `resolveEffectiveRivalBaseAccuracyV8`: Wires `getEpisodeRivalAccuracyV7`
//      in Campaign (`0.42–0.46` onboarding -> `0.85` Season 4 Masterminds) while
//      preserving raw `CAST_PROFILES_V7[rivalId].baseAccuracy` in Quick / Daily.
// ============================================================================

import {
  ALL_GREMLIN_SKIT_IDS_V8,
  ALL_RIVAL_IDS_V7,
  type CastIdV7,
  type CastProfileV7,
  type CategoryIdV7,
  type GremlinSkitIdV8,
  type GremlinSkitPlayInputV8,
  type PortraitEmotionV7,
  type ReactionPipSpecV8,
  type RivalIdV7,
  type StudioVoiceCueIdV8,
} from '../contracts_v7';
import type { MysteryCurtainOutcomeV7 } from '../boards/BoardTwistsEngineV7';
import type {
  BigWheelSpinResultV7,
  BigWheelWedgeKindV7,
} from '../ui/TvTwistTheaterV7';
import {
  CAST_PROFILES_V7,
  CHAMPION_VOICE_KITS_V7,
  getEpisodeRivalAccuracyV7,
} from './CastAndRelicsCatalogV7';

// ----------------------------------------------------------------------------
// 1. Public Types & Contracts
// ----------------------------------------------------------------------------

export type ActiveCheatChannelV8 =
  | 'ROW_C_GLINT'
  | 'SOLENOID_SPARK'
  | 'FRESNEL_LAMP';

export type MatchBroadcastModeV8 =
  | 'CAMPAIGN'
  | 'QUICK_PLAY'
  | 'DAILY_BROADCAST'
  | 'COUCH_2P';

export interface HeelScheduleInputV8 {
  readonly matchSeed: number;
  readonly rivalId: CastIdV7;
  readonly seasonTier?: 1 | 2 | 3 | 4;
  readonly totalTurns?: number;
}

export interface TellTelegraphLiveContextV8 {
  readonly playerCash?: number;
  readonly rivalCash?: number;
  readonly hasMatchingSpotterRelic?: boolean;
}

export interface TellTelegraphSpecV8 {
  readonly active: boolean;
  readonly channel: ActiveCheatChannelV8;
  readonly warningHeadline: string;
  readonly tellQuip: string;
  readonly isEmergencyTrailingTell: boolean;
  readonly windowDurationSec: number;
  readonly suggestedVoiceCue: StudioVoiceCueIdV8 | null;
  readonly reactionPip: ReactionPipSpecV8 | null;
}

export interface BoothBustOptionsV8 {
  readonly turnNumber?: number;
  readonly hasSubpoenaSignet?: boolean;
}

export interface BoothBustResolutionV8 {
  readonly bustNumber: number;
  readonly emotion: PortraitEmotionV7;
  readonly accuracyPenalty: number; // -0.10 on Bust #1, -0.20 on Bust #2+
  readonly tiltTurns: number; // 2 on Bust #1, 3 on Bust #2+
  readonly cleanBountyCash: number; // 175 -> 275 -> 350
  readonly signetBoostedBountyCash: number; // Optional +$125 Inspector's Signet upgrade
  readonly boothLockedOut: boolean; // True starting on Bust #2
  readonly lockoutBanner: string | null; // "STANDARDS & PRACTICES LOCKS BOOTH A!" on Bust #2+
  readonly bustedHeadline: string;
  readonly bustedQuip: string;
  readonly suggestedVoiceCue: StudioVoiceCueIdV8;
  readonly reactionPip: ReactionPipSpecV8;
}

export interface CpuBigWheelStateInputV8 {
  readonly rivalCash: number;
  readonly playerCash: number;
  readonly cpuTiltTurns: number;
}

export interface CpuBigWheelResolutionV8 {
  readonly kind: BigWheelWedgeKindV7;
  readonly rivalDelta: number;
  readonly playerDelta: number;
  readonly nextRivalCash: number;
  readonly nextPlayerCash: number;
  readonly newTiltTurns: number;
  readonly clearedTilt: boolean;
  readonly cpuArmedNextClaimMult: number;
  readonly cpuGremlinCount: number; // 0..4
  readonly banner: string;
  readonly championQuip: string;
  readonly emotion: PortraitEmotionV7;
  readonly suggestedVoiceCue: StudioVoiceCueIdV8 | null;
  readonly triggerGremlinSkit: boolean;
  readonly gremlinSkitId: GremlinSkitIdV8 | null;
  readonly gremlinVoiceCue: StudioVoiceCueIdV8 | null;
  readonly gremlinSkitSpec: GremlinSkitPlayInputV8 | null;
}

export interface CpuMysteryCurtainResolutionV8 {
  readonly kind: MysteryCurtainOutcomeV7['kind'];
  readonly rivalDelta: number;
  readonly playerDelta: number;
  readonly nextRivalCash: number;
  readonly nextPlayerCash: number;
  readonly cpuArmedNextClaimMult: number;
  readonly swappedCategory?: CategoryIdV7;
  readonly banner: string;
}

export interface RivalAccuracyContextV8 {
  readonly rivalId: CastIdV7;
  readonly episodeNumber?: number;
  readonly mode?: MatchBroadcastModeV8;
  readonly isCampaign?: boolean;
  readonly isQuickPlay?: boolean;
  readonly isDailyBroadcast?: boolean;
}

export interface CpuMatchDirectorConfigV8 {
  readonly matchSeed: number;
  readonly rivalId: CastIdV7;
  readonly episodeNumber?: number;
  readonly seasonTier?: 1 | 2 | 3 | 4;
  readonly totalTurns?: number;
  readonly mode?: MatchBroadcastModeV8;
  readonly isQuickPlay?: boolean;
  readonly isDailyBroadcast?: boolean;
}

// ----------------------------------------------------------------------------
// 2. Bespoke 1966 Quiz-Show Scandal Telegraph & Bust Copy Catalog
// ----------------------------------------------------------------------------

interface HeelScandalCopySpecV8 {
  readonly tellHeadline: string;
  readonly tellQuip: string;
  readonly bust1Headline: string;
  readonly bust1Quip: string;
  readonly bust2Quip: string;
}

const HEEL_SCANDAL_COPY_V8: Partial<Record<CastIdV7, HeelScandalCopySpecV8>> = {
  GIGI_ST_CLAIR: {
    tellHeadline: 'LIVE BOOTH TELL · ROW-C MIRROR COMPACT GLINT!',
    tellQuip:
      'Gigi angles her Carnaby powder compact toward her mod entourage in Row C—slap CATCH CHEAT!',
    bust1Headline: '📸 ROW-C COMPACT INTERCEPTED — GIGI ST. CLAIR RATTLED!',
    bust1Quip:
      '“Oi! Put that spotlight down—I was merely checking my lashes, darling!”',
    bust2Quip:
      '“Frightful! Standards & Practices just escorted my entire Soho entourage out of Row C!”',
  },
  SYLVIE_BEAUMONT: {
    tellHeadline: 'LIVE BOOTH TELL · SPOTLIGHT #4 BARN-DOOR WINK!',
    tellQuip:
      'Sylvie lifts her pillbox chin toward Fresnel Lamp #4 for Roz’s cue—hit CATCH CHEAT!',
    bust1Headline: '🔦 FRESNEL CUE EXPOSED — SYLVIE BEAUMONT RATTLED!',
    bust1Quip:
      '“Mon Dieu! That dreadful boom shadow ruined my concentration—nothing more!”',
    bust2Quip:
      '“Sacré bleu! Standards & Practices padlocked Booth A—my soufflé is collapsing on network air!”',
  },
  MARGO_STERLING: {
    tellHeadline: 'LIVE BOOTH TELL · GOLD BROOCH CATCHING LAMP #4!',
    tellQuip:
      'Margo tilts her Madison Avenue cocktail brooch toward Spotlight #4’s blink—CATCH CHEAT!',
    bust1Headline: '🔦 SPONSOR LAMP BLINK BUSTED — MARGO STERLING RATTLED!',
    bust1Quip:
      '“Watch your tone, announcer—my agency buys half the commercial minutes on this hour!”',
    bust2Quip:
      '“Pull the plug! Vera Karp just locked Control Booth A and tore up our cue sheet!”',
  },
  HANK_MCCOY: {
    tellHeadline: 'LIVE BOOTH TELL · PODIUM TWO SOLENOID BUZZING!',
    tellQuip:
      'Hank presses his knuckles along the brass lectern rail to read Booth A’s pulse—CATCH CHEAT!',
    bust1Headline: '⚡ RIGGED PODIUM COIL SHORTED — HANK MCCOY RATTLED!',
    bust1Quip:
      '“Tarnation! That copper rail nearly singed my Stetson—must be static electricity!”',
    bust2Quip:
      '“Dagnabbit! Standards & Practices cut the booth wire—I’m drilling blind out here!”',
  },
  ALASTAIR_KERR: {
    tellHeadline: 'LIVE BOOTH TELL · SAVILE ROW CUFFLINK LAMP CUE!',
    tellQuip:
      'Alastair aligns his gold cufflink with Overhead Fresnel #4’s secret blink—CATCH CHEAT!',
    bust1Headline: '🔦 CUFFLINK SIGNAL CAUGHT LIVE — ALASTAIR KERR RATTLED!',
    bust1Quip:
      '“Preposterous accusation! A gentleman may adjust his French cuffs on live television!”',
    bust2Quip:
      '“Good grief—nine undefeated weeks and Vera Karp bolts Control Booth A shut on camera!”',
  },
  LANA_STARLING: {
    tellHeadline: 'LIVE BOOTH TELL · ROW-C PRESS AGENT OPERA FLASH!',
    tellQuip:
      'Lana flutters her Burbank lashes toward her publicist’s lens in Row C—slap CATCH CHEAT!',
    bust1Headline: '📸 ROW-C CUE FLASH BUSTED — LANA STARLING RATTLED!',
    bust1Quip:
      '“Cut! Can we take five? Camera Two caught a reflection off my publicist’s spectacles!”',
    bust2Quip:
      '“My agent is suing! Standards & Practices just locked Booth A in the middle of my close-up!”',
  },
  VINCE_CASTELLANO: {
    tellHeadline: 'LIVE BOOTH TELL · LECTERN SOLENOID PINKY TAP!',
    tellQuip:
      'Vince rests his Sands pinky ring over Podium Two’s 24Hz rigged solenoid—CATCH CHEAT!',
    bust1Headline: '⚡ CASINO WIRE INTERCEPTED — VINCE CASTELLANO RATTLED!',
    bust1Quip:
      '“Easy with the siren, pal—just drumming my ring while the house counts the pot.”',
    bust2Quip:
      '“Dead shoe! The feds just padlocked Booth A—somebody cut the pit boss’s house wire!”',
  },
  REX_CALLOWAY: {
    tellHeadline: 'LIVE BOOTH TELL · ROW-C SEAT 14 OPERA-GLASS GLINT!',
    tellQuip:
      'Rex coughs behind his fist toward his syndicate tipster in Row C Seat 14—CATCH CHEAT!',
    bust1Headline: '📸 PRESS-ROW TIPSTER EXPOSED — REX CALLOWAY RATTLED!',
    bust1Quip:
      '“Whoa, hold the front page—a guy can’t clear his throat under studio lights?!”',
    bust2Quip:
      '“Stop the presses… Vera Karp just bolted Booth A shut and booted my tipster to Sixth Ave!”',
  },
  NORMA_JEAN_BAKER: {
    tellHeadline: 'LIVE BOOTH TELL · WHITE MOD SHADES CATCHING LAMP #4!',
    tellQuip:
      'Norma Jean dips her oversized mod shades to read Fresnel #4’s reflection—CATCH CHEAT!',
    bust1Headline: '🔦 FRESNEL REFLECTION BUSTED — NORMA JEAN RATTLED!',
    bust1Quip:
      '“Tsk—an inelegant optical glare off Booth A. Recalculating without telemetry.”',
    bust2Quip:
      '“Zugzwang in Control Booth A! Standards & Practices just severed the overhead lamp relay!”',
  },
  STERLING_VANCE: {
    tellHeadline: 'LIVE BOOTH TELL · WATCH-CHAIN SOLENOID PULSE!',
    tellQuip:
      'Sterling thumbs his Broad Street gold chain over the pulsing lectern coil—CATCH CHEAT!',
    bust1Headline: '⚡ TICKER SOLENOID GROUNDED — STERLING VANCE RATTLED!',
    bust1Quip:
      '“Unhand that circuit! My attorneys on Broad Street frown upon unscheduled audits!”',
    bust2Quip:
      '“Trading halted?! Vera Karp just padlocked Control Booth A—liquidate the margin!”',
  },
  SEO_YUN_KANG: {
    tellHeadline: 'LIVE BOOTH TELL · CHROME PEN SYNCED TO SOLENOID!',
    tellQuip:
      'Seo-Yun taps her Geneva pen in lockstep with Booth A’s copper spark—CATCH CHEAT!',
    bust1Headline: '⚡ SOLENOID TELEMETRY SEVERED — SEO-YUN KANG RATTLED!',
    bust1Quip:
      '“Signal interference noted—my confidence interval just widened considerably.”',
    bust2Quip:
      '“Control variable lost! Standards & Practices just sealed Booth A for the rest of the trial!”',
  },
  CLARA_VON_BERG: {
    tellHeadline: 'LIVE BOOTH TELL · BATON FLICK TO SPOTLIGHT #4!',
    tellQuip:
      'Clara cues Fresnel Lamp #4 with a sharp flick of her Vienna baton—CATCH CHEAT!',
    bust1Headline: '🔦 OVERHEAD CUE LAMP SNUFFED — CLARA VON BERG RATTLED!',
    bust1Quip:
      '“UNERHÖRT! Who dared dim my key light in the middle of the second movement?!”',
    bust2Quip:
      '“SKANDAL! Standards & Practices just chained Control Booth A shut—my prompter is dark!”',
  },
  VICTOR_LAZAR: {
    tellHeadline: 'LIVE BOOTH TELL · ONYX LAPEL PIN SOLENOID SPARK!',
    tellQuip:
      'A copper spark shivers beside Victor Lazar’s onyx lapel pin—hammer CATCH CHEAT!',
    bust1Headline: '⚡ SPHINX LECTERN WIRE EXPOSED — VICTOR LAZAR RATTLED!',
    bust1Quip:
      '“Interesting… in eleven Fridays, nobody had ever heard the coil beneath Podium Two.”',
    bust2Quip:
      '“Remarkable. Vera Karp has padlocked Booth A—for the first time, the Sphinx plays alone.”',
  },
  GRANT_BELLAMY: {
    tellHeadline: 'LIVE BOOTH TELL · PENTHOUSE MASTER SOLENOID FEED!',
    tellQuip:
      'Bellamy touches his gold wristwatch as Booth A juices the lectern coil—CATCH CHEAT!',
    bust1Headline: '⚡ HOST MASTER COIL SHORTED — GRANT BELLAMY RATTLED!',
    bust1Quip:
      '“Easy, folks—just fifty thousand watts of Living Color warming the walnut rail!”',
    bust2Quip:
      '“Vera, put away that padlock—you’re locking me out of my own Penthouse control room!”',
  },
  ROZ_KORMAN: {
    tellHeadline: 'LIVE BOOTH TELL · SPONSOR BOOM-MIC FRESNEL CUE!',
    tellQuip:
      'Roz taps her sponsor headset to flash Spotlight #4’s barn doors—slap CATCH CHEAT!',
    bust1Headline: '🔦 SPONSOR BOOTH CUE CAUGHT — ROZ KORMAN RATTLED!',
    bust1Quip:
      '“That’s a lighting rehearsal, sweetheart—keep your hands off the Standards buzzer!”',
    bust2Quip:
      '“Vera Karp just bolted Control Booth A from the outside—my headset is dead air!”',
  },
};

const GREMLIN_SKIT_TO_VOICE_CUE_V8: Readonly<
  Record<GremlinSkitIdV8, StudioVoiceCueIdV8>
> = {
  REEL_MOWER: 'VO_GREMLIN_REEL_MOWER',
  CANISTER_VAC: 'VO_GREMLIN_CANISTER_VAC',
  JACKHAMMER_SANDBAG: 'VO_GREMLIN_JACKHAMMER',
  TNT_PLUNGER: 'VO_GREMLIN_TNT_PLUNGER',
  CABLE_SHEARS: 'VO_GREMLIN_CABLE_SHEARS',
  WATUSI_BROOM: 'VO_GREMLIN_WATUSI_BROOM',
  CATWALK_MAGNET: 'VO_GREMLIN_CATWALK_MAGNET',
  TIN_UFO: 'VO_GREMLIN_TIN_UFO',
};

const RIVAL_ID_SET_V8: ReadonlySet<string> = new Set<string>(ALL_RIVAL_IDS_V7);

function isRivalIdV8(id: CastIdV7): id is RivalIdV7 {
  return RIVAL_ID_SET_V8.has(id);
}

// ----------------------------------------------------------------------------
// 3. High-Avalanche Deterministic 32-Bit Hash & Exact Non-Adjacent Combinatorics
// ----------------------------------------------------------------------------

function mix32(h: number): number {
  let x = h >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}

function hashMatchKey32(
  matchSeed: number,
  rivalId: string,
  seasonTier: number,
  totalTurns: number,
  salt = 0,
): number {
  let h = (0x811c9dc5 ^ mix32(Math.floor(matchSeed) + Math.imul(salt, 0x9e3779b9))) >>> 0;
  const key = `${rivalId}|S${seasonTier}|T${totalTurns}|#${Math.floor(matchSeed)}|${salt}`;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return mix32(h ^ Math.imul(Math.floor(matchSeed) >>> 0, 0x9e3779b1));
}

function enumerateNonAdjacentTurnTuples(
  minTurn: number,
  maxTurn: number,
  pickCount: number,
): number[][] {
  if (pickCount <= 0 || maxTurn < minTurn) return [];
  const results: number[][] = [];
  const current: number[] = [];

  const dfs = (nextCandidate: number, remaining: number): void => {
    if (remaining === 0) {
      results.push([...current]);
      return;
    }
    // Need `remaining` non-adjacent picks starting >= nextCandidate -> max start is `maxTurn - 2*(remaining - 1)`
    const latestStart = maxTurn - 2 * (remaining - 1);
    for (let t = nextCandidate; t <= latestStart; t += 1) {
      current.push(t);
      dfs(t + 2, remaining - 1);
      current.pop();
    }
  };

  dfs(minTurn, pickCount);
  return results;
}

// ----------------------------------------------------------------------------
// 4. Standalone Pure Functions (`generateHeelCheatTurnsV8` & `resolveEffectiveRivalBaseAccuracyV8`)
// ----------------------------------------------------------------------------

/**
 * Generates a deterministic-per-match, non-adjacent Heel cheat turn schedule in `[2 .. totalTurns - 1]`.
 * - Returns `[]` for all `HONEST` rivals (`cheatChannel === 'HONEST'`).
 * - Picks `2` non-adjacent turns in Season 2 (`seasonTier <= 2`) or `3` in Seasons 3–4 (`seasonTier >= 3`).
 * - Never falls into the legacy hardcoded `[2, 5, 8]` pattern; hits 18–19 distinct schedules across 50 seeds.
 */
export function generateHeelCheatTurnsV8(input: HeelScheduleInputV8): readonly number[];
export function generateHeelCheatTurnsV8(
  matchSeed: number,
  rivalId: CastIdV7,
  seasonTier?: 1 | 2 | 3 | 4,
  totalTurns?: number,
): readonly number[];
export function generateHeelCheatTurnsV8(
  seedOrInput: number | HeelScheduleInputV8,
  rivalIdArg?: CastIdV7,
  seasonTierArg?: 1 | 2 | 3 | 4,
  totalTurnsArg?: number,
): readonly number[] {
  const matchSeed =
    typeof seedOrInput === 'object' ? seedOrInput.matchSeed : seedOrInput;
  const rivalId =
    typeof seedOrInput === 'object'
      ? seedOrInput.rivalId
      : (rivalIdArg ?? 'CARMEN_DELGADO');
  const profile: CastProfileV7 | undefined = CAST_PROFILES_V7[rivalId];

  if (!profile || profile.cheatChannel === 'HONEST') {
    return [];
  }
  if (profile.role !== 'RIVAL_HEEL' && profile.role !== 'BOOTH_BROKER') {
    return [];
  }

  const effectiveSeasonTier =
    (typeof seedOrInput === 'object' ? seedOrInput.seasonTier : seasonTierArg) ??
    profile.seasonTier ??
    2;
  const totalTurns = Math.max(
    4,
    Math.floor(
      (typeof seedOrInput === 'object' ? seedOrInput.totalTurns : totalTurnsArg) ??
        10,
    ),
  );

  const minTurn = 2;
  const maxTurn = totalTurns - 1;
  const spanLen = maxTurn - minTurn + 1;
  if (spanLen <= 0) return [];

  const desiredCount = effectiveSeasonTier <= 2 ? 2 : 3;
  const maxFeasibleNonAdjacent = Math.ceil(spanLen / 2);
  const pickCount = Math.min(desiredCount, maxFeasibleNonAdjacent);
  if (pickCount <= 0) return [];

  const allTuples = enumerateNonAdjacentTurnTuples(minTurn, maxTurn, pickCount);
  if (allTuples.length === 0) return [];

  // Filter out the legacy hardcoded `[2, 5, 8]` cliché whenever alternatives exist
  const variedTuples =
    allTuples.length > 1
      ? allTuples.filter(
          (t) => !(t.length === 3 && t[0] === 2 && t[1] === 5 && t[2] === 8),
        )
      : allTuples;

  const h = hashMatchKey32(matchSeed, rivalId, effectiveSeasonTier, totalTurns, 17);
  const chosen = variedTuples[h % variedTuples.length] ?? variedTuples[0];
  return [...chosen];
}

/**
 * Smooth Campaign Episode Accuracy Resolver:
 * - In `'CAMPAIGN'` mode: wires `getEpisodeRivalAccuracyV7(rivalId, episodeNumber)` so
 *   Episodes 1–3 smoothly onboard (`0.42`, `0.44`, `0.46`), Episodes 4–6 cap at `0.48`,
 *   and Seasons 2–4 scale smoothly up to `0.85` Masterminds.
 * - In `'QUICK_PLAY'` / `'DAILY_BROADCAST'` / `'COUCH_2P'`: returns raw
 *   `CAST_PROFILES_V7[rivalId].baseAccuracy` directly so exhibition & daily shows play at true rating!
 */
export function resolveEffectiveRivalBaseAccuracyV8(
  context: RivalAccuracyContextV8,
): number;
export function resolveEffectiveRivalBaseAccuracyV8(
  rivalId: CastIdV7,
  episodeNumber: number,
  modeOrIsCampaign?: MatchBroadcastModeV8 | boolean,
): number;
export function resolveEffectiveRivalBaseAccuracyV8(
  episodeNumber: number,
  rivalId: CastIdV7,
  modeOrIsCampaign?: MatchBroadcastModeV8 | boolean,
): number;
export function resolveEffectiveRivalBaseAccuracyV8(
  first: RivalAccuracyContextV8 | CastIdV7 | number,
  second?: number | CastIdV7,
  third?: MatchBroadcastModeV8 | boolean,
): number {
  let rivalId: CastIdV7;
  let episodeNumber = 1;
  let useCampaignCurve = true;

  if (typeof first === 'object' && first !== null) {
    rivalId = first.rivalId;
    episodeNumber = Math.max(1, Math.floor(first.episodeNumber ?? 1));
    if (first.mode !== undefined) {
      useCampaignCurve = first.mode === 'CAMPAIGN';
    } else if (first.isQuickPlay || first.isDailyBroadcast) {
      useCampaignCurve = false;
    } else if (typeof first.isCampaign === 'boolean') {
      useCampaignCurve = first.isCampaign;
    } else {
      useCampaignCurve = true;
    }
  } else if (typeof first === 'string') {
    rivalId = first;
    episodeNumber = Math.max(1, Math.floor(typeof second === 'number' ? second : 1));
    useCampaignCurve =
      third === undefined
        ? true
        : typeof third === 'boolean'
          ? third
          : third === 'CAMPAIGN';
  } else {
    episodeNumber = Math.max(1, Math.floor(first));
    rivalId = typeof second === 'string' ? second : 'CARMEN_DELGADO';
    useCampaignCurve =
      third === undefined
        ? true
        : typeof third === 'boolean'
          ? third
          : third === 'CAMPAIGN';
  }

  const profile = CAST_PROFILES_V7[rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
  if (!useCampaignCurve) {
    return profile.baseAccuracy;
  }

  if (isRivalIdV8(rivalId)) {
    return getEpisodeRivalAccuracyV7(rivalId, episodeNumber);
  }
  // Broker fallback (Grant Bellamy / Roz Korman / Vera Karp)
  if (episodeNumber <= 1) return Math.min(profile.baseAccuracy, 0.42);
  if (episodeNumber === 2) return Math.min(profile.baseAccuracy, 0.44);
  if (episodeNumber === 3) return Math.min(profile.baseAccuracy, 0.46);
  if (episodeNumber <= 6) return Math.min(profile.baseAccuracy, 0.48);
  return profile.baseAccuracy;
}

// ----------------------------------------------------------------------------
// 5. Stateful Match-Level Director (`CpuTwistAndHeelDirectorV8`)
// ----------------------------------------------------------------------------

export class CpuTwistAndHeelDirectorV8 {
  public static readonly generateHeelCheatTurns = generateHeelCheatTurnsV8;
  public static readonly generateHeelCheatTurnsV8 = generateHeelCheatTurnsV8;
  public static readonly resolveEffectiveRivalBaseAccuracy =
    resolveEffectiveRivalBaseAccuracyV8;
  public static readonly resolveEffectiveRivalBaseAccuracyV8 =
    resolveEffectiveRivalBaseAccuracyV8;

  private matchSeed = 0;
  private rivalId: CastIdV7 = 'CARMEN_DELGADO';
  private episodeNumber = 1;
  private seasonTier: 1 | 2 | 3 | 4 = 1;
  private totalTurns = 10;
  private mode: MatchBroadcastModeV8 = 'CAMPAIGN';

  private scheduledCheatTurns: readonly number[] = [];
  private emergencyTellTurn: number | null = null;
  private activeTellTurn: number | null = null;
  private readonly bustedTurns = new Set<number>();
  private readonly expiredOrClearedTurns = new Set<number>();

  private boothBustCount = 0;
  private boothLockedOut = false;

  private cachedPlayerCash = 0;
  private cachedRivalCash = 0;

  private _cpuArmedNextClaimMult = 1.0;
  private _cpuGremlinCount = 0;
  private wheelSpinCounter = 0;

  public constructor(initialConfig?: CpuMatchDirectorConfigV8) {
    if (initialConfig) {
      this.resetForMatch(initialConfig);
    }
  }

  // --------------------------------------------------------------------------
  // Match Lifecycle & Live Score Sync
  // --------------------------------------------------------------------------

  public resetForMatch(config: CpuMatchDirectorConfigV8): void {
    const profile =
      CAST_PROFILES_V7[config.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    this.matchSeed = Math.floor(config.matchSeed);
    this.rivalId = config.rivalId;
    this.episodeNumber = Math.max(1, Math.floor(config.episodeNumber ?? 1));
    this.seasonTier = config.seasonTier ?? profile.seasonTier ?? 1;
    this.totalTurns = Math.max(4, Math.floor(config.totalTurns ?? 10));
    this.mode =
      config.mode ??
      (config.isDailyBroadcast
        ? 'DAILY_BROADCAST'
        : config.isQuickPlay
          ? 'QUICK_PLAY'
          : 'CAMPAIGN');

    // Daily Broadcast is strictly clean-room (zero booth rigging); Campaign Ep 1 is vs Carmen (HONEST)
    this.scheduledCheatTurns =
      this.mode === 'DAILY_BROADCAST'
        ? []
        : generateHeelCheatTurnsV8({
            matchSeed: this.matchSeed,
            rivalId: this.rivalId,
            seasonTier: this.seasonTier,
            totalTurns: this.totalTurns,
          });

    this.emergencyTellTurn = null;
    this.activeTellTurn = null;
    this.bustedTurns.clear();
    this.expiredOrClearedTurns.clear();

    this.boothBustCount = 0;
    this.boothLockedOut = false;

    this.cachedPlayerCash = 0;
    this.cachedRivalCash = 0;

    this._cpuArmedNextClaimMult = 1.0;
    this._cpuGremlinCount = 0;
    this.wheelSpinCounter = 0;
  }

  public syncLiveScores(playerCash: number, rivalCash: number): void {
    this.cachedPlayerCash = Math.max(0, Math.floor(playerCash));
    this.cachedRivalCash = Math.max(0, Math.floor(rivalCash));
  }

  // --------------------------------------------------------------------------
  // Getters & Accuracy Queries
  // --------------------------------------------------------------------------

  public get cpuArmedNextClaimMult(): number {
    return this._cpuArmedNextClaimMult;
  }

  public get cpuGremlinCount(): number {
    return this._cpuGremlinCount;
  }

  public getBoothBustCount(): number {
    return this.boothBustCount;
  }

  public isBoothLockedOut(): boolean {
    return this.boothLockedOut;
  }

  public getScheduledCheatTurns(): readonly number[] {
    return this.scheduledCheatTurns;
  }

  public isHeelCapable(): boolean {
    if (this.mode === 'DAILY_BROADCAST') return false;
    const profile = CAST_PROFILES_V7[this.rivalId];
    if (!profile || profile.cheatChannel === 'HONEST') return false;
    return profile.role === 'RIVAL_HEEL' || profile.role === 'BOOTH_BROKER';
  }

  /** Smooth Campaign / Exhibition base accuracy before mid-match rattle or tilt. */
  public getEffectiveBaseAccuracy(): number {
    return resolveEffectiveRivalBaseAccuracyV8({
      rivalId: this.rivalId,
      episodeNumber: this.episodeNumber,
      mode: this.mode,
    });
  }

  /** Instance alias for `resolveEffectiveRivalBaseAccuracyV8` (defaults to active match config). */
  public resolveEffectiveRivalBaseAccuracyV8(
    overrideContext?: Partial<RivalAccuracyContextV8>,
  ): number {
    return resolveEffectiveRivalBaseAccuracyV8({
      rivalId: overrideContext?.rivalId ?? this.rivalId,
      episodeNumber: overrideContext?.episodeNumber ?? this.episodeNumber,
      mode: overrideContext?.mode ?? this.mode,
      isCampaign: overrideContext?.isCampaign,
      isQuickPlay: overrideContext?.isQuickPlay,
      isDailyBroadcast: overrideContext?.isDailyBroadcast,
    });
  }

  /** Instance alias for `generateHeelCheatTurnsV8` (defaults to active match config). */
  public generateHeelCheatTurnsV8(
    overrideInput?: Partial<HeelScheduleInputV8>,
  ): readonly number[] {
    return generateHeelCheatTurnsV8({
      matchSeed: overrideInput?.matchSeed ?? this.matchSeed,
      rivalId: overrideInput?.rivalId ?? this.rivalId,
      seasonTier: overrideInput?.seasonTier ?? this.seasonTier,
      totalTurns: overrideInput?.totalTurns ?? this.totalTurns,
    });
  }

  /** Cumulative episode accuracy penalty inflicted by live Booth Busts (`0`, `-0.10`, `-0.20`). */
  public getBustAccuracyPenalty(): number {
    if (this.boothBustCount <= 0) return 0;
    if (this.boothBustCount === 1) return -0.1;
    return -0.2;
  }

  /**
   * Effective Rival base accuracy for a turn, incorporating Campaign onboarding AND
   * progressive Booth Bust rattle (`-0.10` after Bust #1, `-0.20` after Bust #2+).
   * If a Heel has an active UNBUSTED Booth Tell on `turnNumber`, Control Booth A feeds `+0.08`!
   */
  public getEffectiveTurnBaseAccuracy(turnNumber?: number): number {
    const rawBase = this.getEffectiveBaseAccuracy();
    const bustPenalty = this.getBustAccuracyPenalty();
    const unbustedFeedBoost =
      typeof turnNumber === 'number' &&
      this.activeTellTurn === turnNumber &&
      !this.bustedTurns.has(turnNumber) &&
      !this.boothLockedOut
        ? 0.08
        : 0;
    return Number(
      Math.max(0.15, Math.min(0.94, rawBase + bustPenalty + unbustedFeedBoost)).toFixed(
        2,
      ),
    );
  }

  // --------------------------------------------------------------------------
  // 1. Deterministic Heel Cheat Schedule, Emergency Trailing Trigger & Tell Spec
  // --------------------------------------------------------------------------

  /**
   * Evaluates whether `turnNumber` has an active, 100% fairly telegraphed Booth Cheat Tell:
   * - Fires on deterministic non-adjacent `scheduledCheatTurns` (`2` in S2, `3` in S3–S4).
   * - Fires an emergency Control Booth A rigged tell on Turn `7` or `8` if the Heel trails
   *   by `>= $600` and hasn't been busted twice yet (`boothBustCount < 2`).
   * - Always returns `active: false` for `HONEST` rivals or once Bust #2 locks Booth A!
   */
  public getTellTelegraphSpec(
    turnNumber: number,
    liveContext?: TellTelegraphLiveContextV8,
  ): TellTelegraphSpecV8 {
    if (liveContext?.playerCash !== undefined && liveContext?.rivalCash !== undefined) {
      this.syncLiveScores(liveContext.playerCash, liveContext.rivalCash);
    }

    const profile =
      CAST_PROFILES_V7[this.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const channel: ActiveCheatChannelV8 =
      profile.cheatChannel !== 'HONEST' ? profile.cheatChannel : 'SOLENOID_SPARK';

    const inactiveSpec: TellTelegraphSpecV8 = {
      active: false,
      channel,
      warningHeadline: '',
      tellQuip: '',
      isEmergencyTrailingTell: false,
      windowDurationSec: 0,
      suggestedVoiceCue: null,
      reactionPip: null,
    };

    if (!this.isHeelCapable()) {
      return inactiveSpec;
    }
    if (
      this.boothLockedOut ||
      this.bustedTurns.has(turnNumber) ||
      this.expiredOrClearedTurns.has(turnNumber)
    ) {
      return inactiveSpec;
    }

    const isScheduled = this.scheduledCheatTurns.includes(turnNumber);
    const trailingMargin = this.cachedPlayerCash - this.cachedRivalCash;
    const canTriggerEmergency =
      !isScheduled &&
      (turnNumber === 7 || turnNumber === 8) &&
      this.boothBustCount < 2 &&
      trailingMargin >= 600 &&
      (this.emergencyTellTurn === null || this.emergencyTellTurn === turnNumber);

    if (!isScheduled && !canTriggerEmergency) {
      return inactiveSpec;
    }

    if (canTriggerEmergency) {
      this.emergencyTellTurn = turnNumber;
    }
    this.activeTellTurn = turnNumber;

    const copy = HEEL_SCANDAL_COPY_V8[this.rivalId];
    const upperName = profile.name.toUpperCase();
    const baseHeadline =
      copy?.tellHeadline ??
      (channel === 'ROW_C_GLINT'
        ? `LIVE BOOTH TELL · ROW-C GLINT FOR ${upperName}!`
        : channel === 'FRESNEL_LAMP'
          ? `LIVE BOOTH TELL · SPOTLIGHT #4 CUE FOR ${upperName}!`
          : `LIVE BOOTH TELL · RIGGED LECTERN COIL ON ${upperName}!`);

    const warningHeadline = canTriggerEmergency
      ? `🚨 BOOTH A PANIC FEED ($${trailingMargin} BEHIND) · ${baseHeadline}`
      : baseHeadline;

    const tellQuip =
      copy?.tellQuip ?? profile.signatureTellText;

    const windowDurationSec = liveContext?.hasMatchingSpotterRelic ? 12.0 : 8.0;

    return {
      active: true,
      channel,
      warningHeadline,
      tellQuip,
      isEmergencyTrailingTell: canTriggerEmergency,
      windowDurationSec,
      suggestedVoiceCue: 'VO_BOOTH_TELL_ALERT',
      reactionPip: {
        castId: this.rivalId,
        displayName: profile.name,
        emotion: 'TELL',
        badgeLabel: canTriggerEmergency ? 'EMERGENCY FIX!' : 'LIVE BOOTH TELL!',
        quipText: tellQuip,
        accentHex: profile.accentHex,
        durationMs: 3200,
      },
    };
  }

  /** Marks the current turn's tell window as expired/dismissed when the timer runs out unbusted. */
  public expireActiveTell(turnNumber?: number): void {
    const targetTurn = turnNumber ?? this.activeTellTurn;
    if (targetTurn !== null) {
      this.expiredOrClearedTurns.add(targetTurn);
    }
    if (turnNumber === undefined || this.activeTellTurn === turnNumber) {
      this.activeTellTurn = null;
    }
  }

  // --------------------------------------------------------------------------
  // 2. Progressive Multi-Bust Rattle & Bounty Escalation (`recordBoothBust`)
  // --------------------------------------------------------------------------

  /**
   * Resolves a live `CATCH CHEAT` Booth Bust:
   * - Bust #1: `emotion = 'RATTLED'`, `accuracyPenalty = -0.10`, `tiltTurns = 2`, `cleanBountyCash = 175`
   * - Bust #2: `emotion = 'BREAKDOWN'`, `accuracyPenalty = -0.20`, `tiltTurns = 3`, `cleanBountyCash = 275`,
   *            locks out Control Booth A for the rest of the episode (`"STANDARDS & PRACTICES LOCKS BOOTH A!"`)!
   * - Bust #3+: `cleanBountyCash = 350`!
   */
  public recordBoothBust(opts?: BoothBustOptionsV8): BoothBustResolutionV8 {
    this.boothBustCount += 1;
    const bustedTurn = opts?.turnNumber ?? this.activeTellTurn;
    if (bustedTurn !== null && bustedTurn !== undefined) {
      this.bustedTurns.add(bustedTurn);
    }
    this.activeTellTurn = null;

    const profile =
      CAST_PROFILES_V7[this.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const copy = HEEL_SCANDAL_COPY_V8[this.rivalId];
    const upperName = profile.name.toUpperCase();

    if (this.boothBustCount === 1) {
      const cleanBountyCash = 175;
      const signetBoostedBountyCash = opts?.hasSubpoenaSignet ? 300 : cleanBountyCash;
      const bustedHeadline =
        copy?.bust1Headline ??
        `🚨 BOOTH FEED INTERCEPTED — ${upperName} RATTLED (-10% ACCURACY)!`;
      const bustedQuip =
        copy?.bust1Quip ??
        `“Hold on—Camera One caught ${profile.name} red-handed on the first Booth A wire!”`;

      return {
        bustNumber: 1,
        emotion: 'RATTLED',
        accuracyPenalty: -0.1,
        tiltTurns: 2,
        cleanBountyCash,
        signetBoostedBountyCash,
        boothLockedOut: false,
        lockoutBanner: null,
        bustedHeadline,
        bustedQuip,
        suggestedVoiceCue: 'VO_BOOTH_FEED_INTERCEPTED',
        reactionPip: {
          castId: this.rivalId,
          displayName: profile.name,
          emotion: 'RATTLED',
          badgeLabel: 'BUSTED! (-10%)',
          quipText: bustedQuip,
          accentHex: profile.accentHex,
          durationMs: 3000,
        },
      };
    }

    // Bust #2+ permanently locks Control Booth A for the remainder of the episode!
    this.boothLockedOut = true;
    const lockoutBanner = 'STANDARDS & PRACTICES LOCKS BOOTH A!';

    if (this.boothBustCount === 2) {
      const cleanBountyCash = 275;
      const signetBoostedBountyCash = opts?.hasSubpoenaSignet ? 400 : cleanBountyCash;
      const bustedHeadline = `🚨 ${lockoutBanner} · ${upperName} IN FULL BREAKDOWN!`;
      const bustedQuip =
        copy?.bust2Quip ??
        `Vera Karp padlocks Control Booth A live on air—${profile.name} is completely on their own!`;

      return {
        bustNumber: 2,
        emotion: 'BREAKDOWN',
        accuracyPenalty: -0.2,
        tiltTurns: 3,
        cleanBountyCash,
        signetBoostedBountyCash,
        boothLockedOut: true,
        lockoutBanner,
        bustedHeadline,
        bustedQuip,
        suggestedVoiceCue: 'VO_BOOTH_FEED_INTERCEPTED',
        reactionPip: {
          castId: this.rivalId,
          displayName: profile.name,
          emotion: 'BREAKDOWN',
          badgeLabel: 'BOOTH A LOCKED!',
          quipText: bustedQuip,
          accentHex: profile.accentHex,
          durationMs: 3400,
        },
      };
    }

    // Bust #3+
    const cleanBountyCash = 350;
    const signetBoostedBountyCash = opts?.hasSubpoenaSignet ? 475 : cleanBountyCash;
    const bustedHeadline = `🚨 FEDERAL BROADCAST CITATION #${this.boothBustCount} · ${lockoutBanner}`;
    const bustedQuip = `Vera Karp stamps a $350 Grand-Jury Bounty as ${profile.name} melts under 300 footcandles!`;

    return {
      bustNumber: this.boothBustCount,
      emotion: 'BREAKDOWN',
      accuracyPenalty: -0.2,
      tiltTurns: 3,
      cleanBountyCash,
      signetBoostedBountyCash,
      boothLockedOut: true,
      lockoutBanner,
      bustedHeadline,
      bustedQuip,
      suggestedVoiceCue: 'VO_BOOTH_FEED_INTERCEPTED',
      reactionPip: {
        castId: this.rivalId,
        displayName: profile.name,
        emotion: 'BREAKDOWN',
        badgeLabel: `BUST #${this.boothBustCount}! (+$350)`,
        quipText: bustedQuip,
        accentHex: profile.accentHex,
        durationMs: 3400,
      },
    };
  }

  // --------------------------------------------------------------------------
  // 3. Full CPU Big Wheel & Tile Twist Parity (`resolveCpuBigWheelWedge` & `consumeArmedCpuMultiplier`)
  // --------------------------------------------------------------------------

  /** Arms `2.0x` on the CPU's next tile claim (used by Big Wheel `DOUBLE` & Mystery Curtain `DOUBLE_CHIPS`). */
  public armCpuNextClaimMultiplier(mult = 2.0): number {
    this._cpuArmedNextClaimMult = Math.max(this._cpuArmedNextClaimMult, mult);
    return this._cpuArmedNextClaimMult;
  }

  /** Returns the currently armed CPU claim multiplier (`1.0` or `2.0`) and resets it to `1.0`. */
  public consumeArmedCpuMultiplier(): number {
    const armed = this._cpuArmedNextClaimMult;
    this._cpuArmedNextClaimMult = 1.0;
    return armed;
  }

  /** Convenience helper applying & consuming any armed `2.0x` CPU multiplier cleanly to `$25` increments. */
  public applyArmedMultiplierToCpuClaim(baseClaimCash: number): {
    readonly finalClaimCash: number;
    readonly appliedMult: number;
    readonly wasDoubled: boolean;
  } {
    const mult = this.consumeArmedCpuMultiplier();
    const cleanBase = Math.max(0, Math.round(baseClaimCash));
    const finalClaimCash =
      mult > 1.0 ? Math.round((cleanBase * mult) / 25) * 25 : cleanBase;
    return {
      finalClaimCash,
      appliedMult: mult,
      wasDoubled: mult > 1.0,
    };
  }

  /** Full CPU parity for `MYSTERY_CURTAIN` tiles (including `DOUBLE_CHIPS` arming `2.0x`). */
  public resolveCpuMysteryCurtain(
    curtain: Pick<
      MysteryCurtainOutcomeV7,
      | 'kind'
      | 'instantCashDelta'
      | 'rivalCashDelta'
      | 'chipsMultiplier'
      | 'swappedCategory'
    >,
    state: { readonly rivalCash: number; readonly playerCash: number },
  ): CpuMysteryCurtainResolutionV8 {
    const profile =
      CAST_PROFILES_V7[this.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const rivalCash = Math.max(0, Math.floor(state.rivalCash));
    const playerCash = Math.max(0, Math.floor(state.playerCash));

    switch (curtain.kind) {
      case 'DOUBLE_CHIPS': {
        this._cpuArmedNextClaimMult = 2.0;
        return {
          kind: 'DOUBLE_CHIPS',
          rivalDelta: 0,
          playerDelta: 0,
          nextRivalCash: rivalCash,
          nextPlayerCash: playerCash,
          cpuArmedNextClaimMult: this._cpuArmedNextClaimMult,
          banner: `${profile.name} ARMS 2.0× DOUBLE NEXT CLAIM!`,
        };
      }
      case 'STEAL_FROM_RIVAL': {
        const rawSteal = Math.abs(Math.round(curtain.rivalCashDelta || 150));
        const swiped = Math.min(playerCash, rawSteal);
        const playerDelta = swiped > 0 ? -swiped : 0;
        const rivalDelta = swiped;
        return {
          kind: 'STEAL_FROM_RIVAL',
          rivalDelta,
          playerDelta,
          nextRivalCash: rivalCash + rivalDelta,
          nextPlayerCash: playerCash + playerDelta,
          cpuArmedNextClaimMult: this._cpuArmedNextClaimMult,
          banner:
            swiped > 0
              ? `${profile.name} PULLS TAKE! CURTAIN · STEALS $${swiped}!`
              : `${profile.name} PULLS TAKE! CURTAIN — NO CASH TO STEAL!`,
        };
      }
      case 'WILD_CATEGORY_SWAP': {
        const gain = Math.max(0, Math.round(curtain.instantCashDelta || 0));
        return {
          kind: 'WILD_CATEGORY_SWAP',
          rivalDelta: gain,
          playerDelta: 0,
          nextRivalCash: rivalCash + gain,
          nextPlayerCash: playerCash,
          cpuArmedNextClaimMult: this._cpuArmedNextClaimMult,
          swappedCategory: curtain.swappedCategory,
          banner: `${profile.name} SPINS WILD CURTAIN SWAP${curtain.swappedCategory ? ` TO ${curtain.swappedCategory}` : ''}!`,
        };
      }
      case 'BONUS_ENVELOPE':
      default: {
        const envCash = Math.max(0, Math.round(curtain.instantCashDelta || 250));
        return {
          kind: 'BONUS_ENVELOPE',
          rivalDelta: envCash,
          playerDelta: 0,
          nextRivalCash: rivalCash + envCash,
          nextPlayerCash: playerCash,
          cpuArmedNextClaimMult: this._cpuArmedNextClaimMult,
          banner: `${profile.name} OPENS +$${envCash} GOLD CURTAIN ENVELOPE!`,
        };
      }
    }
  }

  /**
   * Resolves all 5 `BigWheelWedgeKindV7` wedges for the CPU with 100% symmetry:
   * - `CASH`: `rivalDelta = +wheelRes.cashValue`
   * - `DOUBLE`: arms `cpuArmedNextClaimMult = 2.0` (`banner = "${rivalName} ARMS 2.0× DOUBLE NEXT CLAIM!"`)
   * - `LIFELINE`: if `cpuTiltTurns > 0`, clears tilt (`newTiltTurns = 0`) + `+$150` composure recovery;
   *               otherwise banks `+$200` Studio Lifeline Bonus!
   * - `STEAL`: swipes `Math.min(playerCash, 250)` (`playerDelta = -swiped`, `rivalDelta = +swiped`)!
   * - `GREMLIN`: deducts `Math.round((rivalCash * 0.25) / 25) * 25`, increments `cpuGremlinCount` (`1..4`),
   *              sets `newTiltTurns = 2`, and builds an animated `GremlinSkitPlayInputV8` for the CPU!
   */
  public resolveCpuBigWheelWedge(
    wheelRes: BigWheelSpinResultV7,
    state: CpuBigWheelStateInputV8,
  ): CpuBigWheelResolutionV8 {
    this.wheelSpinCounter += 1;
    const profile =
      CAST_PROFILES_V7[this.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const rivalName = profile.name;
    const voiceKit = isRivalIdV8(this.rivalId)
      ? CHAMPION_VOICE_KITS_V7[this.rivalId]
      : undefined;

    const rivalCash = Math.max(0, Math.floor(state.rivalCash));
    const playerCash = Math.max(0, Math.floor(state.playerCash));
    const currentTilt = Math.max(0, Math.floor(state.cpuTiltTurns));

    switch (wheelRes.kind) {
      case 'CASH': {
        const cashWon = Math.max(0, Math.round(wheelRes.cashValue));
        const isJackpot = cashWon >= 750;
        return {
          kind: 'CASH',
          rivalDelta: cashWon,
          playerDelta: 0,
          nextRivalCash: rivalCash + cashWon,
          nextPlayerCash: playerCash,
          newTiltTurns: currentTilt,
          clearedTilt: false,
          cpuArmedNextClaimMult: this._cpuArmedNextClaimMult,
          cpuGremlinCount: this._cpuGremlinCount,
          banner: isJackpot
            ? `🎡 JACKPOT! ${rivalName} SPINS +$${cashWon.toLocaleString()}!`
            : `🎡 ${rivalName} SPINS +$${cashWon.toLocaleString()} ON THE BIG WHEEL!`,
          championQuip:
            voiceKit?.wheelLine ??
            `${rivalName} cashes +$${cashWon.toLocaleString()} off the Studio Big Wheel!`,
          emotion: 'POISED',
          suggestedVoiceCue: isJackpot ? 'VO_TWIST_BIG_WHEEL_JACKPOT' : null,
          triggerGremlinSkit: false,
          gremlinSkitId: null,
          gremlinVoiceCue: null,
          gremlinSkitSpec: null,
        };
      }

      case 'DOUBLE': {
        this._cpuArmedNextClaimMult = 2.0;
        return {
          kind: 'DOUBLE',
          rivalDelta: 0,
          playerDelta: 0,
          nextRivalCash: rivalCash,
          nextPlayerCash: playerCash,
          newTiltTurns: currentTilt,
          clearedTilt: false,
          cpuArmedNextClaimMult: 2.0,
          cpuGremlinCount: this._cpuGremlinCount,
          banner: `${rivalName} ARMS 2.0× DOUBLE NEXT CLAIM!`,
          championQuip:
            voiceKit?.wheelLine ??
            `${rivalName} locks 2.0× Double Dollars onto their next square!`,
          emotion: 'POISED',
          suggestedVoiceCue: 'VO_TWIST_BIG_WHEEL_DOUBLE',
          triggerGremlinSkit: false,
          gremlinSkitId: null,
          gremlinVoiceCue: null,
          gremlinSkitSpec: null,
        };
      }

      case 'LIFELINE': {
        if (currentTilt > 0) {
          const recoveryBonus = 150;
          return {
            kind: 'LIFELINE',
            rivalDelta: recoveryBonus,
            playerDelta: 0,
            nextRivalCash: rivalCash + recoveryBonus,
            nextPlayerCash: playerCash,
            newTiltTurns: 0,
            clearedTilt: true,
            cpuArmedNextClaimMult: this._cpuArmedNextClaimMult,
            cpuGremlinCount: this._cpuGremlinCount,
            banner: `${rivalName} CLEARS TILT + BANKS +$150 COMPOSURE RECOVERY!`,
            championQuip: `${rivalName} steadies their nerves at the lectern (+$150 Lifeline Recovery)!`,
            emotion: 'POISED',
            suggestedVoiceCue: null,
            triggerGremlinSkit: false,
            gremlinSkitId: null,
            gremlinVoiceCue: null,
            gremlinSkitSpec: null,
          };
        }
        const lifelineBonus = 200;
        return {
          kind: 'LIFELINE',
          rivalDelta: lifelineBonus,
          playerDelta: 0,
          nextRivalCash: rivalCash + lifelineBonus,
          nextPlayerCash: playerCash,
          newTiltTurns: 0,
          clearedTilt: false,
          cpuArmedNextClaimMult: this._cpuArmedNextClaimMult,
          cpuGremlinCount: this._cpuGremlinCount,
          banner: `${rivalName} BANKS +$200 STUDIO LIFELINE BONUS!`,
          championQuip:
            voiceKit?.wheelLine ??
            `${rivalName} cashes in a crisp +$200 Studio Lifeline Bonus!`,
          emotion: 'POISED',
          suggestedVoiceCue: null,
          triggerGremlinSkit: false,
          gremlinSkitId: null,
          gremlinVoiceCue: null,
          gremlinSkitSpec: null,
        };
      }

      case 'STEAL': {
        const swiped = Math.min(playerCash, 250);
        const playerDelta = swiped > 0 ? -swiped : 0;
        const rivalDelta = swiped;
        return {
          kind: 'STEAL',
          rivalDelta,
          playerDelta,
          nextRivalCash: rivalCash + rivalDelta,
          nextPlayerCash: playerCash + playerDelta,
          newTiltTurns: currentTilt,
          clearedTilt: false,
          cpuArmedNextClaimMult: this._cpuArmedNextClaimMult,
          cpuGremlinCount: this._cpuGremlinCount,
          banner:
            swiped > 0
              ? `🎡 ${rivalName} STEALS $${swiped} OFF YOUR TOTE!`
              : `🎡 ${rivalName} SPINS STEAL — YOUR TOTE IS AT $0!`,
          championQuip:
            swiped > 0
              ? `${rivalName} swipes $${swiped} straight across the stage!`
              : `${rivalName} reaches for your stack, but your drum reads $0!`,
          emotion: 'POISED',
          suggestedVoiceCue: null,
          triggerGremlinSkit: false,
          gremlinSkitId: null,
          gremlinVoiceCue: null,
          gremlinSkitSpec: null,
        };
      }

      case 'GREMLIN': {
        const loss = Math.round((rivalCash * 0.25) / 25) * 25;
        const rivalDelta = loss > 0 ? -loss : 0;
        this._cpuGremlinCount = Math.min(4, Math.max(1, this._cpuGremlinCount + 1));

        const skitSeed = hashMatchKey32(
          this.matchSeed,
          this.rivalId,
          this.seasonTier,
          this.totalTurns,
          101 + this.wheelSpinCounter + this._cpuGremlinCount,
        );
        const skitId =
          ALL_GREMLIN_SKIT_IDS_V8[skitSeed % ALL_GREMLIN_SKIT_IDS_V8.length] ??
          'REEL_MOWER';
        const gremlinVoiceCue = GREMLIN_SKIT_TO_VOICE_CUE_V8[skitId];
        const formattedLoss = `$${loss.toLocaleString()}`;
        const championQuip = voiceKit
          ? voiceKit.zonkLine.replace(/\{cash\}/g, formattedLoss)
          : `Studio Gremlin zaps ${rivalName} for -${formattedLoss}!`;

        const gremlinSkitSpec: GremlinSkitPlayInputV8 = {
          skitId,
          seed: skitSeed,
          victimName: rivalName,
          isPlayerVictim: false,
          scoreBefore: rivalCash,
          cashLost: loss,
          newGremlinCount: this._cpuGremlinCount,
        };

        return {
          kind: 'GREMLIN',
          rivalDelta,
          playerDelta: 0,
          nextRivalCash: Math.max(0, rivalCash + rivalDelta),
          nextPlayerCash: playerCash,
          newTiltTurns: 2,
          clearedTilt: false,
          cpuArmedNextClaimMult: this._cpuArmedNextClaimMult,
          cpuGremlinCount: this._cpuGremlinCount,
          banner:
            loss > 0
              ? `⚡ STUDIO GREMLIN #${this._cpuGremlinCount} ZAPS ${rivalName.toUpperCase()} (-$${loss.toLocaleString()})!`
              : `⚡ STUDIO GREMLIN #${this._cpuGremlinCount} RATTLES ${rivalName.toUpperCase()}!`,
          championQuip,
          emotion: 'BREAKDOWN',
          suggestedVoiceCue: gremlinVoiceCue,
          triggerGremlinSkit: true,
          gremlinSkitId: skitId,
          gremlinVoiceCue,
          gremlinSkitSpec,
        };
      }
    }
  }

  /**
   * Records a CPU Gremlin hit from the 12-square *Press Your Luck* Light-Board so
   * `cpuGremlinCount` (`1..4`) and animated CPU Gremlin skits stay 100% unified!
   */
  public recordCpuLightBoardGremlinZonk(state: {
    readonly rivalCashBefore: number;
    readonly cashLost: number;
  }): {
    readonly cpuGremlinCount: number;
    readonly newTiltTurns: number;
    readonly gremlinSkitId: GremlinSkitIdV8;
    readonly gremlinVoiceCue: StudioVoiceCueIdV8;
    readonly gremlinSkitSpec: GremlinSkitPlayInputV8;
    readonly championQuip: string;
  } {
    this.wheelSpinCounter += 1;
    this._cpuGremlinCount = Math.min(4, Math.max(1, this._cpuGremlinCount + 1));
    const profile =
      CAST_PROFILES_V7[this.rivalId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
    const voiceKit = isRivalIdV8(this.rivalId)
      ? CHAMPION_VOICE_KITS_V7[this.rivalId]
      : undefined;

    const skitSeed = hashMatchKey32(
      this.matchSeed,
      this.rivalId,
      this.seasonTier,
      this.totalTurns,
      307 + this.wheelSpinCounter + this._cpuGremlinCount,
    );
    const skitId =
      ALL_GREMLIN_SKIT_IDS_V8[skitSeed % ALL_GREMLIN_SKIT_IDS_V8.length] ??
      'CABLE_SHEARS';
    const gremlinVoiceCue = GREMLIN_SKIT_TO_VOICE_CUE_V8[skitId];
    const cleanLost = Math.abs(Math.round(state.cashLost));
    const formattedLoss = `$${cleanLost.toLocaleString()}`;

    return {
      cpuGremlinCount: this._cpuGremlinCount,
      newTiltTurns: 2,
      gremlinSkitId: skitId,
      gremlinVoiceCue,
      gremlinSkitSpec: {
        skitId,
        seed: skitSeed,
        victimName: profile.name,
        isPlayerVictim: false,
        scoreBefore: Math.max(0, Math.floor(state.rivalCashBefore)),
        cashLost: cleanLost,
        newGremlinCount: this._cpuGremlinCount,
      },
      championQuip: voiceKit
        ? voiceKit.zonkLine.replace(/\{cash\}/g, formattedLoss)
        : `Studio Gremlin zaps ${profile.name} for -${formattedLoss}!`,
    };
  }
}
