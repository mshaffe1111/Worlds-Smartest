// ============================================================================
// WORLD'S SMARTEST v4.0 — Witty Host Bank (Host Max Sterling)
// Sharp, warm, Ken Jennings x Ryan Reynolds 1-sentence host commentary,
// stat-aware banter, situational cues, and dynamic post-match media headlines.
// Bulk 270+ quip catalog is hydrated lazily from `./data/world_tour_v4.json`.
// ============================================================================

import type { DomainId } from '../forge/types';
import type {
  PlayerStatProfileForHost,
  QuestionFormatV4,
  TileTwistKind,
  WorldTourEpisodeV4,
} from './contracts';
import {
  computeAudienceJumpForMatch,
  formatAudienceCount,
  formatPrizeUsd,
  getChallengerById,
  getEpisodeById,
  getLoadedWorldTourPayload,
  getTierMeta,
  loadWorldTourData,
  type HeadlineClipping,
  type WorldTourQuipPayload,
  type WorldTourTierNumber,
} from './WorldTourCampaign';

export const HOST_MAX_STERLING = {
  id: 'max_sterling',
  name: 'Max Sterling',
  role: "Host & Showrunner, The World's Smartest Search",
  tagline: 'From 42 folding chairs to 1.4 billion living rooms.',
} as const;

export type StatAwareQuipCategory =
  | 'CAMPING_FAVORITE'
  | 'WIN_IN_WEAKEST'
  | 'MISS_IN_STRONGEST'
  | 'RIVAL_FORCED_WEAK'
  | 'RIVAL_FROZE_FAVORITE'
  | 'UNDERDOG_SURGE';

export type SituationalQuipCategory =
  | 'BUZZER_BEATER'
  | 'INSTANT_SNIPE'
  | 'MATCH4_SWEEP'
  | 'SORT4_PERFECT'
  | 'DOUBLE_DOWN_WIN'
  | 'DOUBLE_DOWN_BLOW'
  | 'POWER_PLAY_WIN'
  | 'POWER_PLAY_MISS'
  | 'SPOTLIGHT_ROULETTE_WIN'
  | 'SPOTLIGHT_ROULETTE_MISS'
  | 'MULTI_STRIKE_SWEEP'
  | 'PINPOINT_BULLSEYE'
  | 'CLUE_ESCALATOR_EARLY'
  | 'CROWN_WEDGE_EARNED'
  | 'WHEEL_CURVEBALL'
  | 'STREAK_HOT'
  | 'GENTLE_MISS'
  | 'MATCH_WIN'
  | 'MATCH_LOSS';

export type HostQuipCategory = StatAwareQuipCategory | SituationalQuipCategory | 'EPISODE_INTRO';

export interface HostQuipResult {
  readonly speaker: string;
  readonly category: HostQuipCategory;
  readonly text: string;
  readonly isStatAware: boolean;
}

export interface StatAwareQuipContext {
  readonly action:
    | 'PICK_TILE'
    | 'ANSWER_WIN'
    | 'ANSWER_MISS'
    | 'RIVAL_FORCED_TILE'
    | 'RIVAL_FROZE_COLUMN'
    | 'STREAK_MILESTONE';
  readonly domainId?: DomainId;
  readonly domainName?: string;
  readonly rivalName?: string;
  readonly currentStreak?: number;
  readonly consecutivePicksInDomain?: number;
  readonly rng?: () => number;
}

export interface SituationalQuipContext {
  readonly category?: SituationalQuipCategory;
  readonly won?: boolean;
  readonly format?: QuestionFormatV4;
  readonly twist?: TileTwistKind;
  readonly elapsedSec?: number;
  readonly secondsRemaining?: number;
  readonly doubleDownArmed?: boolean;
  readonly isBullseyeOrSweep?: boolean;
  readonly wasForcedSpotlight?: boolean;
  readonly escalatorCluesRevealed?: 1 | 2 | 3;
  readonly earnedWedge?: boolean;
  readonly currentStreak?: number;
  readonly domainName?: string;
  readonly rivalName?: string;
  readonly rng?: () => number;
}

export interface PostMatchHeadlineInput {
  readonly episodeId: string;
  readonly contestantName?: string;
  readonly won: boolean;
  readonly playerScore: number;
  readonly rivalScore?: number;
  readonly starsEarned?: 0 | 1 | 2 | 3;
  readonly viewerDelta?: number;
  readonly prizeDeltaUsd?: number;
  readonly wedgesEarned?: number;
  readonly buzzerBeatersCount?: number;
  readonly instantSnipesCount?: number;
  readonly match4SweepsCount?: number;
  readonly sort4PerfectsCount?: number;
  readonly pinpointBullseyesCount?: number;
  readonly clue1SnipesCount?: number;
  readonly powerPlaysWon?: number;
  readonly doubleDownsWon?: number;
  readonly doubleDownsBlown?: number;
  readonly weakDomainUpsets?: number;
  readonly weakDomainName?: string | null;
  readonly wasComebackWin?: boolean;
  readonly bestStreakInMatch?: number;
  readonly rng?: () => number;
}

// ============================================================================
// COMPACT INLINE FALLBACK QUIPS (Full 270+ Library Hydrates From JSON)
// ============================================================================

const FALLBACK_QUIPS: WorldTourQuipPayload = {
  CAMPING_FAVORITE: [
    'Going back to {domain} again? Shocking absolutely nobody on the sofa at home.',
    "You've practically got a mail-forwarding address in {domain} at this point.",
    'Look at you camping out in {domain} like you brought a tent and marshmallows.',
  ],
  WIN_IN_WEAKEST: [
    'Stop the broadcast! A clean hit in {weakDomain}?! Your career radar chart just fainted.',
    'Hold everything! You just aced {weakDomain}, your statistically worst subject!',
    'Breaking news: {weakDomain} is officially off your kryptonite list!',
  ],
  MISS_IN_STRONGEST: [
    'Wait, you missed a {strongDomain} question? Check the air conditioning in here.',
    'Whoa, a rare plot twist! Even in {strongDomain}, the board bites back occasionally.',
  ],
  RIVAL_FORCED_WEAK: [
    'Ooh, {rival} clearly read your stats sheet. Welcome to {weakDomain}!',
    'Cold move by {rival}! Straight into {weakDomain}, right where your stats look shaky.',
    'Somebody did their homework! {rival} is dragging you straight into {weakDomain}.',
  ],
  RIVAL_FROZE_FAVORITE: [
    '{rival} just put a velvet rope around {domain}. Time to explore the rest of the menu.',
    'Ice cold! {rival} slammed the freezer door right on your favorite {domain} column.',
  ],
  UNDERDOG_SURGE: [
    'New personal best streak at {bestStreak}! Your old stats are asking for a recount.',
    "Look at that climb! You're rewriting your entire career average in real time.",
  ],
  BUZZER_BEATER: [
    'With {secLeft}s on the clock! My cardiologist is sending you the bill for that one.',
    'Locked in with {secLeft}s left! Do you just enjoy giving the broadcast crew gray hair?',
  ],
  INSTANT_SNIPE: [
    'Did you even finish reading the question, or are you borrowing Wi-Fi from the future?',
    'Locked in under three seconds! Give the teleprompter a chance to catch its breath!',
  ],
  MATCH4_SWEEP: [
    'Four for four without a single tangled wire! Put that board in a museum.',
    'A clean Match-4 sweep! Every single pair clicked together like pricey luggage.',
  ],
  SORT4_PERFECT: [
    'Not a single card out of line! Somewhere, a librarian just wiped away a happy tear.',
    'Four-for-four exact order! Your mental timeline is sharper than a museum plaque.',
  ],
  DOUBLE_DOWN_WIN: [
    'You pushed all the chips in and actually cleared the table. Respect!',
    'Double Down nailed! Fortune favors the bold, and today it is writing you a nice check.',
  ],
  DOUBLE_DOWN_BLOW: [
    'Boldness: 10 out of 10. Accuracy: under investigation.',
    'You swung for the fences and accidentally hit the scoreboard! Shake it off.',
  ],
  POWER_PLAY_WIN: [
    'Big wager, bigger nerve, and the scoreboard just felt the shockwave!',
    'Power Play cashed! That is the kind of swing that flips an entire match on its head.',
  ],
  POWER_PLAY_MISS: [
    'Ouch. That wager just left a smoking crater where your lead used to live.',
    'Rough bounce on the Power Play! Comebacks make way better headlines anyway.',
  ],
  SPOTLIGHT_ROULETTE_WIN: [
    'No choice, no warning, no problem. The spotlight tried to trip you and lost.',
    'Surviving Spotlight Roulette like a seasoned pro! You cannot rattle this contestant.',
  ],
  SPOTLIGHT_ROULETTE_MISS: [
    'Hey, the wheel picked that one, not you. Blame the lighting guy!',
    'Tough draw from Spotlight Roulette! Next turn you are back in control.',
  ],
  MULTI_STRIKE_SWEEP: [
    'Spotted the fake faster than a bouncer with a flashlight!',
    'Multi-Strike perfection! Not a single decoy slipped past your radar.',
  ],
  PINPOINT_BULLSEYE: [
    "Dead center on the dial! Either you're a human encyclopedia or you brought a time machine.",
    'Bullseye on the Pinpoint Dial! Who even keeps numbers that exact in their head?!',
  ],
  CLUE_ESCALATOR_EARLY: [
    'Solved on Clue One?! The writers worked all week on Clues Two and Three!',
    'Clue One snipe for 3x points! You barely let the escalator leave the lobby!',
  ],
  CROWN_WEDGE_EARNED: [
    'Another Crown Wedge locked in! That ring is starting to look dangerously expensive.',
    'Boom, Crown Wedge secured! One huge piece closer to owning the whole broadcast.',
  ],
  WHEEL_CURVEBALL: [
    "Spin that wheel and pray it's feeling generous today!",
    'Show Wheel time! Let us see if lady luck brought gifts or pure chaos.',
  ],
  STREAK_HOT: [
    'Somebody hand the sound guy a fire extinguisher! This streak is out of control!',
    'Unstoppable heater! You are turning this board into a personal highlight tape.',
  ],
  GENTLE_MISS: [
    'Shake it off! Even Nobel winners forget where they parked.',
    'No sweat! Nobody wins a championship without dropping a clue or two along the way.',
  ],
  EPISODE_INTRO_BY_TIER: {
    '1': ['Welcome to Oakridge Community Hall! Forty-two neighbors, folding chairs, and the start of your World Search!'],
    '2': ['Upgrading from folding chairs to velvet balconies! Welcome to the Downtown Lyric Theater!'],
    '3': ['Three, two, one, we are LIVE on Channel 7 right after the weather!'],
    '4': ['Good evening, nation! Welcome to Starlight Broadcast Center for National Prime-Time!'],
    '5': ['Good evening from Grand Rotunda Hall in London! Watch out for the London fog on our board!'],
    '6': ['Konbanwa from Shibuya Broadcast Dome in Tokyo! Over two hundred million fans are watching!'],
    '7': ['Welcome under the stars at the Great Pavilion in Giza for the World Semifinals!'],
    '8': ["Over ONE BILLION people are tuned in live! Welcome to The World's Smartest Global Simulcast!"],
  },
  MATCH_WIN: [
    'What a victory! The crowd is on its feet and your name is climbing fast!',
    'Lights, cameras, triumph! You owned that stage from start to finish.',
  ],
  MATCH_LOSS: [
    'Tough finish tonight, but every great comeback montage needs a gritty chapter one!',
    'So close! Take a breath, study the twists, and run it right back.',
  ],
};

// ============================================================================
// NON-REPEATING RING BUFFER & TEMPLATE RENDERER
// ============================================================================

const RECENT_HISTORY_LIMIT = 80;
const recentQuipRing: string[] = [];

function getActiveQuipBank(): WorldTourQuipPayload {
  return getLoadedWorldTourPayload()?.quips ?? FALLBACK_QUIPS;
}

export async function ensureWittyHostBankLoaded(fetchUrl?: string): Promise<number> {
  await loadWorldTourData(fetchUrl);
  return getLoadedQuipCount();
}

export function getLoadedQuipCount(): number {
  const bank = getActiveQuipBank();
  let total = 0;
  for (const [key, value] of Object.entries(bank)) {
    if (key === 'EPISODE_INTRO_BY_TIER' && value && typeof value === 'object') {
      for (const arr of Object.values(value as Record<string, readonly string[]>)) {
        if (Array.isArray(arr)) total += arr.length;
      }
    } else if (Array.isArray(value)) {
      total += value.length;
    }
  }
  return total;
}

export function resetWittyHostHistory(): void {
  recentQuipRing.length = 0;
}

const DOMAIN_DISPLAY_NAMES: readonly string[] = [
  'World History',
  'Science & Space',
  'Geography & Wonders',
  'Arts & Architecture',
  'Film, Music & Pop',
  'Sports & Games',
  'Tech & Computing',
  'Nature & Biology',
  'World Affairs & Law',
  'Food, Craft & Design',
  'Myth & Literature',
  'Logic & Math',
];

function resolveDomainDisplayName(
  domainId?: DomainId | null,
  explicitName?: string | null,
): string {
  if (explicitName && explicitName.trim()) return explicitName.trim();
  if (typeof domainId === 'number' && domainId >= 0 && domainId < DOMAIN_DISPLAY_NAMES.length) {
    return DOMAIN_DISPLAY_NAMES[domainId];
  }
  return 'that category';
}

function pickNonRepeatingLine(pool: readonly string[], rng: () => number = Math.random): string {
  if (!pool.length) return '';
  const fresh = pool.filter((line) => !recentQuipRing.includes(line));
  const candidates = fresh.length > 0 ? fresh : pool;
  const idx = Math.floor(Math.max(0, Math.min(0.999999, rng())) * candidates.length);
  const chosen = candidates[idx];
  recentQuipRing.push(chosen);
  if (recentQuipRing.length > RECENT_HISTORY_LIMIT) {
    recentQuipRing.shift();
  }
  return chosen;
}

function fillTokens(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: string) => {
    return key in tokens ? tokens[key] : '';
  });
}

// ============================================================================
// 1. STAT-AWARE HOST QUIPS (`pickStatAwareQuip`)
// ============================================================================

/**
 * Selects a witty, human Max Sterling quip tailored to the player's real
 * Career Analytics profile (camping favorites, conquering weakest domain,
 * rival stat-targeting, or setting a new streak record).
 * Returns `null` when no stat-aware trigger applies so callers can fall back cleanly.
 */
export function pickStatAwareQuip(
  stats: PlayerStatProfileForHost | null | undefined,
  context: StatAwareQuipContext,
): HostQuipResult | null {
  const bank = getActiveQuipBank();
  const rng = context.rng ?? Math.random;
  const domainLabel = resolveDomainDisplayName(context.domainId, context.domainName);
  const weakLabel = resolveDomainDisplayName(
    stats?.weakestDomainId ?? context.domainId,
    stats?.weakestDomainName ?? context.domainName,
  );
  const strongLabel = resolveDomainDisplayName(
    stats?.strongestDomainId ?? context.domainId,
    stats?.strongestDomainName ?? context.domainName,
  );
  const rivalLabel = context.rivalName?.trim() || 'Your rival';
  const streakLabel = String(Math.max(3, Math.trunc(context.currentStreak ?? stats?.bestStreak ?? 3)));

  const tokens: Record<string, string> = {
    domain: domainLabel,
    weakDomain: weakLabel,
    strongDomain: strongLabel,
    rival: rivalLabel,
    bestStreak: streakLabel,
  };

  let chosenCategory: StatAwareQuipCategory | null = null;
  const hasEnoughHistory = Boolean(stats && stats.totalAnswered >= 3);

  if (context.action === 'RIVAL_FORCED_TILE') {
    chosenCategory = 'RIVAL_FORCED_WEAK';
  } else if (context.action === 'RIVAL_FROZE_COLUMN') {
    chosenCategory = 'RIVAL_FROZE_FAVORITE';
  } else if (context.action === 'PICK_TILE') {
    const isCampingFavorite =
      (context.consecutivePicksInDomain ?? 0) >= 2 ||
      (hasEnoughHistory &&
        context.domainId !== undefined &&
        (context.domainId === stats?.mostPlayedDomainId ||
          context.domainId === stats?.strongestDomainId));
    if (isCampingFavorite) {
      chosenCategory = 'CAMPING_FAVORITE';
    }
  } else if (context.action === 'ANSWER_WIN') {
    if (
      hasEnoughHistory &&
      context.domainId !== undefined &&
      stats?.weakestDomainId !== null &&
      context.domainId === stats?.weakestDomainId
    ) {
      chosenCategory = 'WIN_IN_WEAKEST';
    } else if (
      stats &&
      typeof context.currentStreak === 'number' &&
      context.currentStreak >= 3 &&
      context.currentStreak > stats.bestStreak
    ) {
      chosenCategory = 'UNDERDOG_SURGE';
    }
  } else if (context.action === 'ANSWER_MISS') {
    if (
      hasEnoughHistory &&
      context.domainId !== undefined &&
      stats?.strongestDomainId !== null &&
      context.domainId === stats?.strongestDomainId
    ) {
      chosenCategory = 'MISS_IN_STRONGEST';
    }
  } else if (context.action === 'STREAK_MILESTONE') {
    if ((context.currentStreak ?? 0) >= 3) {
      chosenCategory = 'UNDERDOG_SURGE';
    }
  }

  if (!chosenCategory) return null;

  const rawLine = pickNonRepeatingLine(bank[chosenCategory], rng);
  if (!rawLine) return null;

  return {
    speaker: HOST_MAX_STERLING.name,
    category: chosenCategory,
    text: fillTokens(rawLine, tokens),
    isStatAware: true,
  };
}

// ============================================================================
// 2. SITUATIONAL HOST QUIPS (`pickSituationalQuip` & `pickBestTurnQuip`)
// ============================================================================

export function pickSituationalQuip(context: SituationalQuipContext): HostQuipResult {
  const bank = getActiveQuipBank();
  const rng = context.rng ?? Math.random;

  let category: SituationalQuipCategory;
  if (context.category) {
    category = context.category;
  } else if (context.twist === 'POWER_PLAY') {
    category = context.won ? 'POWER_PLAY_WIN' : 'POWER_PLAY_MISS';
  } else if (context.doubleDownArmed) {
    category = context.won ? 'DOUBLE_DOWN_WIN' : 'DOUBLE_DOWN_BLOW';
  } else if (context.won && context.format === 'CLUE_ESCALATOR' && context.escalatorCluesRevealed === 1) {
    category = 'CLUE_ESCALATOR_EARLY';
  } else if (context.won && context.format === 'PINPOINT_DIAL' && context.isBullseyeOrSweep) {
    category = 'PINPOINT_BULLSEYE';
  } else if (context.won && context.format === 'MATCH_4' && context.isBullseyeOrSweep) {
    category = 'MATCH4_SWEEP';
  } else if (context.won && context.format === 'SORT_4' && context.isBullseyeOrSweep) {
    category = 'SORT4_PERFECT';
  } else if (context.won && context.format === 'MULTI_STRIKE' && context.isBullseyeOrSweep) {
    category = 'MULTI_STRIKE_SWEEP';
  } else if (
    context.won &&
    typeof context.secondsRemaining === 'number' &&
    context.secondsRemaining >= 0 &&
    context.secondsRemaining <= 2.5
  ) {
    category = 'BUZZER_BEATER';
  } else if (
    context.won &&
    typeof context.elapsedSec === 'number' &&
    context.elapsedSec > 0 &&
    context.elapsedSec < 3.0
  ) {
    category = 'INSTANT_SNIPE';
  } else if (context.wasForcedSpotlight) {
    category = context.won ? 'SPOTLIGHT_ROULETTE_WIN' : 'SPOTLIGHT_ROULETTE_MISS';
  } else if (context.won && context.earnedWedge) {
    category = 'CROWN_WEDGE_EARNED';
  } else if (context.won && (context.currentStreak ?? 0) >= 3) {
    category = 'STREAK_HOT';
  } else if (context.won) {
    category = 'STREAK_HOT';
  } else {
    category = 'GENTLE_MISS';
  }

  const secLeft =
    typeof context.secondsRemaining === 'number'
      ? Math.max(0.1, context.secondsRemaining).toFixed(1)
      : '1.2';

  const rawLine = pickNonRepeatingLine(bank[category], rng);
  return {
    speaker: HOST_MAX_STERLING.name,
    category,
    text: fillTokens(rawLine, {
      secLeft,
      domain: context.domainName?.trim() || 'that category',
      rival: context.rivalName?.trim() || 'your rival',
    }),
    isStatAware: false,
  };
}

/**
 * Unified turn-resolution helper: checks dramatic wager/format moments AND
 * stat-aware upsets so Max Sterling always delivers the funniest relevant line!
 */
export function pickBestTurnQuip(
  stats: PlayerStatProfileForHost | null | undefined,
  context: SituationalQuipContext & { readonly domainId?: DomainId },
): HostQuipResult {
  // High-stakes wagers and rare sweeps always get top billing
  if (context.twist === 'POWER_PLAY' || context.doubleDownArmed) {
    return pickSituationalQuip(context);
  }

  // Winning in statistically weakest domain is a huge narrative moment!
  if (context.won) {
    const statQuip = pickStatAwareQuip(stats, {
      action: 'ANSWER_WIN',
      domainId: context.domainId,
      domainName: context.domainName,
      rivalName: context.rivalName,
      currentStreak: context.currentStreak,
      rng: context.rng,
    });
    if (statQuip && statQuip.category === 'WIN_IN_WEAKEST') {
      return statQuip;
    }
  }

  // Format sweeps, buzzer-beaters, instant snipes, forced spotlight survival, wedges
  const hasBigSituationalFeat =
    (context.won &&
      (context.isBullseyeOrSweep ||
        (context.format === 'CLUE_ESCALATOR' && context.escalatorCluesRevealed === 1) ||
        (typeof context.secondsRemaining === 'number' && context.secondsRemaining <= 2.5) ||
        (typeof context.elapsedSec === 'number' && context.elapsedSec > 0 && context.elapsedSec < 3.0) ||
        context.earnedWedge)) ||
    context.wasForcedSpotlight;

  if (hasBigSituationalFeat) {
    return pickSituationalQuip(context);
  }

  // Otherwise check stat-aware miss-in-strongest or streak surge
  const statFallback = pickStatAwareQuip(stats, {
    action: context.won ? 'ANSWER_WIN' : 'ANSWER_MISS',
    domainId: context.domainId,
    domainName: context.domainName,
    rivalName: context.rivalName,
    currentStreak: context.currentStreak,
    rng: context.rng,
  });
  if (statFallback) return statFallback;

  return pickSituationalQuip(context);
}

export function pickEpisodeIntroQuip(
  tierNumber: WorldTourTierNumber,
  rng: () => number = Math.random,
): HostQuipResult {
  const bank = getActiveQuipBank();
  const pool =
    bank.EPISODE_INTRO_BY_TIER[String(tierNumber)] ??
    FALLBACK_QUIPS.EPISODE_INTRO_BY_TIER[String(tierNumber)] ??
    FALLBACK_QUIPS.EPISODE_INTRO_BY_TIER['1'];
  return {
    speaker: HOST_MAX_STERLING.name,
    category: 'EPISODE_INTRO',
    text: pickNonRepeatingLine(pool, rng),
    isStatAware: false,
  };
}

export function pickMatchWrapQuip(
  won: boolean,
  rng: () => number = Math.random,
): HostQuipResult {
  const bank = getActiveQuipBank();
  const category: SituationalQuipCategory = won ? 'MATCH_WIN' : 'MATCH_LOSS';
  return {
    speaker: HOST_MAX_STERLING.name,
    category,
    text: pickNonRepeatingLine(bank[category], rng),
    isStatAware: false,
  };
}

// ============================================================================
// 3. DYNAMIC POST-MATCH MEDIA & SOCIAL HEADLINES (`generatePostMatchHeadlines`)
// ============================================================================

function formatViewerJumpBadge(tierNumber: WorldTourTierNumber, delta: number): string {
  const formatted = formatAudienceCount(delta);
  if (tierNumber === 1) return `+${formatted} neighbors crowded the doorway!`;
  if (tierNumber === 2) return `+${formatted} locals tuned into the theater stream!`;
  return `+${formatted} new viewers tuned in!`;
}

function buildEpisodeHeadlineId(episodeId: string, index: number): string {
  return `hl_${episodeId}_${Date.now()}_${index}`;
}

/**
 * Generates 2-3 lively, tier-authentic media & social headlines reflecting
 * the player's exact match feats (upsets, buzzer-beaters, sweeps, wagers,
 * defeated challengers) and live audience jump!
 */
export function generatePostMatchHeadlines(
  input: PostMatchHeadlineInput,
): HeadlineClipping[] {
  const episode: WorldTourEpisodeV4 | undefined = getEpisodeById(input.episodeId);
  const tierNumber: WorldTourTierNumber = episode?.tierNumber ?? 1;
  const tierMeta = getTierMeta(tierNumber);
  const outlets = tierMeta.mediaOutlets;
  const challenger = episode?.challengerId ? getChallengerById(episode.challengerId) : null;
  const player = input.contestantName?.trim() || 'Local Contender';
  const stars = input.starsEarned ?? (input.won ? 2 : 0);
  const viewerDelta =
    typeof input.viewerDelta === 'number' && input.viewerDelta > 0
      ? Math.round(input.viewerDelta)
      : episode
        ? computeAudienceJumpForMatch(episode, input.won, stars, (input.match4SweepsCount ?? 0) + (input.pinpointBullseyesCount ?? 0))
        : 120;
  const viewerDeltaLabel = formatViewerJumpBadge(tierNumber, viewerDelta);
  const timestampIso = new Date().toISOString();

  const clippings: HeadlineClipping[] = [];

  // 1. Primary Headline: Stage Outcome + Rival Storyline
  if (input.won) {
    if (episode?.episodeId === 't8_ep4') {
      clippings.push({
        id: buildEpisodeHeadlineId(input.episodeId, 0),
        outlet: outlets[0],
        headline: `${player} Dethrones 3-Time Champion Julian Vance in Front of 1.4 Billion Viewers!`,
        subline: `From 42 folding chairs in Oakridge to the ${formatPrizeUsd(input.prizeDeltaUsd ?? 10_000_000)} World Crown!`,
        viewerDelta,
        viewerDeltaLabel,
        episodeId: input.episodeId,
        tierNumber,
        timestampIso,
      });
    } else if (challenger) {
      const scoreGap =
        typeof input.rivalScore === 'number' ? input.playerScore - input.rivalScore : null;
      const headline =
        input.wasComebackWin
          ? `Shock Comeback at ${tierMeta.venueName}: ${player} Stuns ${challenger.name}!`
          : episode?.episodeInTier === 4
            ? `${player} Claims ${tierMeta.name} Crown, Topples ${challenger.name}!`
            : `${player} Outduels ${challenger.name} Under the Lights at ${tierMeta.venueName}!`;
      const subline =
        scoreGap !== null && scoreGap > 0
          ? `Final tally ${input.playerScore.toLocaleString('en-US')} to ${input.rivalScore!.toLocaleString('en-US')} (${viewerDeltaLabel})`
          : `${viewerDeltaLabel} Next stop is already selling out.`;
      clippings.push({
        id: buildEpisodeHeadlineId(input.episodeId, 0),
        outlet: outlets[0],
        headline,
        subline,
        viewerDelta,
        viewerDeltaLabel,
        episodeId: input.episodeId,
        tierNumber,
        timestampIso,
      });
    } else {
      clippings.push({
        id: buildEpisodeHeadlineId(input.episodeId, 0),
        outlet: outlets[0],
        headline: `Who Is ${player}? Neighborhood Qualifier Turns Heads at ${tierMeta.venueName}!`,
        subline: `Posted ${input.playerScore.toLocaleString('en-US')} points on the board (${viewerDeltaLabel})`,
        viewerDelta,
        viewerDeltaLabel,
        episodeId: input.episodeId,
        tierNumber,
        timestampIso,
      });
    }
  } else {
    const rivalName = challenger?.name ?? 'the house target';
    clippings.push({
      id: buildEpisodeHeadlineId(input.episodeId, 0),
      outlet: outlets[0],
      headline: `Nail-Biter at ${tierMeta.venueName}: ${rivalName} Escapes ${player} in Tense Match!`,
      subline: `Fans already demanding an immediate rematch (${viewerDeltaLabel})`,
      viewerDelta,
      viewerDeltaLabel,
      episodeId: input.episodeId,
      tierNumber,
      timestampIso,
    });
  }

  // 2. Highlight Feat Headline (based on exact feats that happened in this match!)
  const featLines: Array<{ headline: string; subline: string }> = [];

  if ((input.weakDomainUpsets ?? 0) > 0) {
    const weakName = input.weakDomainName?.trim() || 'their weakest category';
    featLines.push({
      headline: `Stats Sheet Shredded: ${player} Pulls Off Wild Upset in ${weakName}!`,
      subline: 'Analysts backstage scrambled after watching a career weak spot turn into clutch points.',
    });
  }
  if ((input.clue1SnipesCount ?? 0) > 0) {
    featLines.push({
      headline: `Psychic or Just Ridiculously Well-Read? ${player} Nails 3x Clue-One Escalator!`,
      subline: 'The show writers spent three days writing Clues 2 and 3, and nobody even got to read them.',
    });
  }
  if ((input.buzzerBeatersCount ?? 0) > 0) {
    featLines.push({
      headline: `Heart-Stopping Buzzer-Beater Sends ${tierMeta.venueName} Into a Frenzy!`,
      subline: `${input.buzzerBeatersCount === 1 ? 'A last-second save' : `${input.buzzerBeatersCount} buzzer-beaters`} had viewers yelling at their screens.`,
    });
  }
  if ((input.match4SweepsCount ?? 0) > 0) {
    featLines.push({
      headline: `Flawless 4-for-4 Match-4 Sweep Goes Viral Within Minutes!`,
      subline: 'Zero crossed wires, zero hesitation, and instant replay clips across social feeds.',
    });
  }
  if ((input.pinpointBullseyesCount ?? 0) > 0) {
    featLines.push({
      headline: `Dead-Center Pinpoint Dial Bullseye Leaves Studio Crowd Speechless!`,
      subline: 'Viewers are asking whether a pocket calculator should be checked for at the podium.',
    });
  }
  if ((input.powerPlaysWon ?? 0) > 0) {
    featLines.push({
      headline: `Fearless Power Play Wager Flips the Scoreboard at ${tierMeta.venueName}!`,
      subline: 'Big bets make big television, and the live viewer counter spiked right on cue.',
    });
  }
  if ((input.doubleDownsBlown ?? 0) > 0) {
    featLines.push({
      headline: `Max Sterling Quips After Wild 2x Double Down Gamble: "Boldness 10, Accuracy Pending!"`,
      subline: 'Say what you want about the math, nobody changed the channel during that swing.',
    });
  } else if ((input.doubleDownsWon ?? 0) > 0) {
    featLines.push({
      headline: `Double Down Delivered! ${player} Pushes All In and Cashes Twice the Points!`,
      subline: 'High-stakes swagger paid off right when the scoreboard needed a spark.',
    });
  }
  if ((input.instantSnipesCount ?? 0) >= 2) {
    featLines.push({
      headline: `Fastest Buzzer Thumb on Stage: ${player} Drops ${input.instantSnipesCount} Instant Snipes!`,
      subline: 'Under three seconds per lock! Even the countdown clock looked offended.',
    });
  }
  if ((input.wedgesEarned ?? 0) >= 3) {
    featLines.push({
      headline: `Crown Wedge Collector: ${player} Snags ${input.wedgesEarned} Color Wedges in One Broadcast!`,
      subline: 'Sweeping the 800-point bottom vaults sent an unmistakable message to the bracket.',
    });
  }

  if (featLines.length > 0) {
    const pick = featLines[0];
    clippings.push({
      id: buildEpisodeHeadlineId(input.episodeId, 1),
      outlet: outlets[1],
      headline: pick.headline,
      subline: pick.subline,
      viewerDelta: Math.round(viewerDelta * 0.4),
      viewerDeltaLabel,
      episodeId: input.episodeId,
      tierNumber,
      timestampIso,
    });
  } else {
    // Grounded audience escalation social clipping when no special feat counter was passed
    clippings.push({
      id: buildEpisodeHeadlineId(input.episodeId, 1),
      outlet: outlets[1],
      headline:
        tierNumber <= 2
          ? `Word Is Spreading Fast After Tonight's Show at ${tierMeta.venueName}!`
          : `Ratings Surge: Viewers Pile In to Watch ${player}'s World Search Climb!`,
      subline: `${viewerDeltaLabel} Watch parties are already forming for the next broadcast.`,
      viewerDelta,
      viewerDeltaLabel,
      episodeId: input.episodeId,
      tierNumber,
      timestampIso,
    });
  }

  // 3. Optional Third Social/Ratings Clipping when multiple big feats occurred!
  if (featLines.length > 1) {
    const second = featLines[1];
    clippings.push({
      id: buildEpisodeHeadlineId(input.episodeId, 2),
      outlet: outlets[2],
      headline: second.headline,
      subline: second.subline,
      viewerDelta: Math.round(viewerDelta * 0.25),
      viewerDeltaLabel,
      episodeId: input.episodeId,
      tierNumber,
      timestampIso,
    });
  } else if (input.won && (input.bestStreakInMatch ?? 0) >= 4) {
    clippings.push({
      id: buildEpisodeHeadlineId(input.episodeId, 2),
      outlet: outlets[2],
      headline: `Heater Alert: ${player} Rattles Off ${input.bestStreakInMatch} Straight Answers Live!`,
      subline: `${viewerDeltaLabel} Social feeds are calling this the run of the season.`,
      viewerDelta: Math.round(viewerDelta * 0.25),
      viewerDeltaLabel,
      episodeId: input.episodeId,
      tierNumber,
      timestampIso,
    });
  }

  return clippings;
}
