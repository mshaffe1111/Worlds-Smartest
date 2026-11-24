// ============================================================================
// WORLD'S SMARTEST v5.0 — Stage Board, "SCREW RIVAL!", Line-Sweep Jackpot &
// Balatro-Inspired Podium Lucky Charm Rules Engine
// Pure TypeScript rules module wrapping & extending BoardEngine.ts,
// ChallengerAI.ts, and ScoringV4.ts with strict 1:1 score conservation and
// zero-soft-lock mathematical guarantees.
// ============================================================================

import type { DomainId } from '../forge/types';
import {
  WEDGE_CATALOG_V4,
  domainToWedgeColor,
  type BoardTileStatus,
  type BoardTileV4,
  type BoardTopologyKind,
  type ChallengerProfileV4,
  type EvaluatedAnswerV4,
  type PlayerStatProfileForHost,
  type QuestionFormatV4,
  type StageBoardStateV4,
  type TileTwistKind,
  type WedgeColorId,
  type WheelSliceOutcome,
} from '../v4/contracts';
import {
  ALL_DOMAIN_IDS_V4,
  ALL_QUESTION_FORMATS_V4,
  ALL_WEDGE_IDS_V4,
  DOMAIN_TOPIC_SUBTITLE_V4,
  consumeBoardLifeline,
  createSeededRng,
  createStageBoard,
  ensurePlayableTilesOrStageSurge,
  getBoardDimensions,
  getPlayableTiles,
  getTileById,
  isUnplayedTileStatus,
  resolveTileResult,
  spinCurveballWheel,
  verifyBoardReachability,
  type CreateStageBoardConfigV4,
  type DraftedColumnSpecV4,
  type ResolveTileOptionsV4,
  type ResolveTileOutcomeV4,
  type WheelSpinResultV4,
} from '../v4/BoardEngine';
import {
  runChallengerTurn,
  type ChallengerTurnResultV4,
} from '../v4/ChallengerAI';
import {
  DOUBLE_DOWN_MISS_FRACTION_V4,
  NON_BOARD_BASE_POINTS_V4,
  applyScoreDelta,
  reconcileEvaluatedAnswerForBoard,
  type ScoreResolutionV4,
  type WheelActiveEffectV4,
} from '../v4/ScoringV4';
import type {
  CampaignNodeV5,
  ChallengerIdV5,
  CharmIdV5,
  PodiumCharmSpecV5,
} from './contracts_v5';

// ============================================================================
// 1. V5 RULE CONSTANTS & VISUAL TWIST TAGS
// ============================================================================

/** Minimum distinct QuestionFormatV4 types enforced on EVERY v5 board (bans all-CLASSIC forever!). */
export const MIN_DISTINCT_FORMATS_PER_BOARD_V5 = 4;

/** Honest 1:1 Stage Sweep Jackpot payout when completing a full Row or full Column. */
export const LINE_SWEEP_JACKPOT_POINTS_V5 = 300;

/** Maximum Podium Lucky Charms equippable simultaneously on the stage podium. */
export const MAX_EQUIPPED_CHARMS_V5 = 3;

/** Domains considered History / Literature for Denise's Red Pen (`denises_red_pen`). */
export const HISTORY_AND_LIT_DOMAIN_IDS_V5: readonly DomainId[] = [0, 10] as const;

/** Charm balance constants (single source of truth for UI tooltips & runtime math). */
export const CHARM_VALUES_V5 = {
  trevorsHotMicBonus: 75,
  priyasAdrenalineBonus: 120,
  priyasAdrenalineMaxSecRemaining: 5,
  alistairsPocketwatchBonusSec: 8,
  kenjisCyberLinkBonus: 150,
  kenjisCyberLinkMaxElapsedSec: 6,
  nadiasAstrolabeWedgeBonus: 150,
  grassrootsMegaphoneExtraClues: 1,
  syndicateGoldenDicePowerPlayRate: 0.25,
  velvetWaxSealExtraScrews: 1,
  underdogChipTrailingBonus: 100,
  screwShieldCharges: 1,
} as const;

export type VisualTwistTagV5 =
  | 'NONE'
  | 'PADLOCK'
  | 'WHEEL_TRIGGER'
  | 'LIGHTNING_BLITZ'
  | 'CROWN_WEDGE'
  | 'POWER_PLAY'
  | 'RIVAL_BOUNTY'
  | 'SPOTLIGHT_SWEEP';

/**
 * Returns the v5 visual twist badge tag for a board tile so UI views can cleanly
 * render chains (`PADLOCK`), `WHEEL_TRIGGER`, `LIGHTNING_BLITZ`, `CROWN_WEDGE`,
 * `POWER_PLAY`, or `RIVAL_BOUNTY` without ever falling back to a flat "CLASSIC" label.
 */
export function getTileVisualTwistTagV5(tile: BoardTileV4): VisualTwistTagV5 {
  if (tile.status === 'PADLOCKED') {
    return 'PADLOCK';
  }
  switch (tile.twist) {
    case 'WHEEL_CURVEBALL':
      return 'WHEEL_TRIGGER';
    case 'LIGHTNING_BLITZ':
      return 'LIGHTNING_BLITZ';
    case 'CROWN_WEDGE':
      return 'CROWN_WEDGE';
    case 'POWER_PLAY':
      return 'POWER_PLAY';
    case 'RIVAL_BOUNTY':
      return 'RIVAL_BOUNTY';
    case 'SPOTLIGHT_SWEEP':
      return 'SPOTLIGHT_SWEEP';
    case 'NONE':
    default:
      return 'NONE';
  }
}

export function isHistoryOrLitDomainV5(domainId: DomainId): boolean {
  return HISTORY_AND_LIT_DOMAIN_IDS_V5.includes(domainId);
}

// ============================================================================
// 2. ALL 12 PODIUM LUCKY CHARMS CATALOG (Balatro x Queen's Gambit)
// ============================================================================

export const ALL_PODIUM_CHARM_IDS_V5: readonly CharmIdV5[] = [
  'frankies_coaster',
  'denises_red_pen',
  'trevors_hot_mic',
  'priyas_adrenaline',
  'alistairs_pocketwatch',
  'kenjis_cyber_link',
  'nadias_astrolabe',
  'grassroots_megaphone',
  'syndicate_golden_dice',
  'velvet_wax_seal',
  'underdog_chip',
  'screw_shield',
] as const;

export const PODIUM_CHARMS_CATALOG_V5: Readonly<Record<CharmIdV5, PodiumCharmSpecV5>> = {
  frankies_coaster: {
    charmId: 'frankies_coaster',
    name: "Frankie's Coaster",
    tagline: 'First spilled double is on the house.',
    effectSummary: 'Your first missed 2x Double Down each match incurs 0 penalty.',
    originSource: 'Frankie "Last Call" Russo Alliance (Act I)',
    accentHex: '#f59e0b',
    svgEmblemKind: 'coaster',
  },
  denises_red_pen: {
    charmId: 'denises_red_pen',
    name: "Denise's Red Pen",
    tagline: 'Slashes one obvious distractor before you even blink.',
    effectSummary: 'Automatically eliminates 1 wrong option on History & Literature questions.',
    originSource: 'Denise Park Alliance (Act I)',
    accentHex: '#ef4444',
    svgEmblemKind: 'fountain_pen',
  },
  trevors_hot_mic: {
    charmId: 'trevors_hot_mic',
    name: "Trevor's Hot Mic",
    tagline: 'When the crowd catches fire, keep talking.',
    effectSummary: '+75 bonus points on every correct answer while on an active streak.',
    originSource: 'Trevor "14-Day" Blake Alliance (Act II)',
    accentHex: '#38bdf8',
    svgEmblemKind: 'mic',
  },
  priyas_adrenaline: {
    charmId: 'priyas_adrenaline',
    name: "Priya's Adrenaline",
    tagline: 'Steady hands when the studio clock turns red.',
    effectSummary: '+120 clutch bonus when you answer correctly with 5s or less remaining.',
    originSource: 'Dr. Priya Nair Alliance (Act II)',
    accentHex: '#10b981',
    svgEmblemKind: 'pulse',
  },
  alistairs_pocketwatch: {
    charmId: 'alistairs_pocketwatch',
    name: "Alistair's Pocketwatch",
    tagline: 'Civilized minds never rush a proper deduction.',
    effectSummary: '+8 seconds added to the Shot Clock on every timed clue.',
    originSource: 'Lord Alistair Finch Alliance (Act III)',
    accentHex: '#fbbf24',
    svgEmblemKind: 'watch',
  },
  kenjis_cyber_link: {
    charmId: 'kenjis_cyber_link',
    name: "Kenji's Cyber-Link",
    tagline: 'Frame-perfect buzzer speed pays in gold.',
    effectSummary: '+150 fast-lock bonus when you answer correctly in under 6 seconds.',
    originSource: 'Kenji "Zero-Lag" Takahashi Alliance (Act III)',
    accentHex: '#06b6d4',
    svgEmblemKind: 'circuit',
  },
  nadias_astrolabe: {
    charmId: 'nadias_astrolabe',
    name: "Nadia's Astrolabe",
    tagline: 'Aligned with the six crown jewels of the stage.',
    effectSummary: '+150 bonus points whenever you win a Crown Wedge tile.',
    originSource: 'Nadia Al-Mansoor Alliance (Act IV)',
    accentHex: '#a78bfa',
    svgEmblemKind: 'astrolabe',
  },
  grassroots_megaphone: {
    charmId: 'grassroots_megaphone',
    name: 'Grassroots Megaphone',
    tagline: 'The back row always brings an extra tip.',
    effectSummary: 'Start every match with +1 extra Studio Clue coin.',
    originSource: 'Independent Circuit Sponsor Track',
    accentHex: '#34d399',
    svgEmblemKind: 'megaphone',
  },
  syndicate_golden_dice: {
    charmId: 'syndicate_golden_dice',
    name: 'Syndicate Golden Dice',
    tagline: 'High rollers never settle for base odds.',
    effectSummary: '+25% extra payout whenever you win a Power Play wager.',
    originSource: 'Apex Network Prime-Time Sponsor Dare',
    accentHex: '#f5c451',
    svgEmblemKind: 'dice',
  },
  velvet_wax_seal: {
    charmId: 'velvet_wax_seal',
    name: 'Velvet Wax Seal',
    tagline: 'One extra red buzzer reserved for salon VIPs.',
    effectSummary: 'Start every rival match with +1 extra SCREW RIVAL! token.',
    originSource: 'Secret Velvet Salon Invitation',
    accentHex: '#e11d48',
    svgEmblemKind: 'seal',
  },
  underdog_chip: {
    charmId: 'underdog_chip',
    name: 'Underdog Chip',
    tagline: 'Never count out a contestant from the redemption lane.',
    effectSummary: '+100 comeback bonus on every correct answer while trailing your rival.',
    originSource: 'Late-Night Redemption Wildcard Circuit',
    accentHex: '#fb923c',
    svgEmblemKind: 'chip',
  },
  screw_shield: {
    charmId: 'screw_shield',
    name: 'Screw Shield',
    tagline: 'Backs up your podium with forged brass plating.',
    effectSummary: 'Automatically blocks the first Rival Screw or Column Freeze each match.',
    originSource: 'Velvet Salon Counter-Play Workshop',
    accentHex: '#60a5fa',
    svgEmblemKind: 'shield',
  },
};

export const PODIUM_CHARMS_LIST_V5: readonly PodiumCharmSpecV5[] = ALL_PODIUM_CHARM_IDS_V5.map(
  (id) => PODIUM_CHARMS_CATALOG_V5[id],
);

export function getPodiumCharmSpecV5(charmId: CharmIdV5): PodiumCharmSpecV5 {
  return PODIUM_CHARMS_CATALOG_V5[charmId];
}

export function sanitizeEquippedCharmsV5(
  charms?: readonly CharmIdV5[] | null,
): readonly CharmIdV5[] {
  if (!charms || charms.length === 0) return [];
  const seen = new Set<CharmIdV5>();
  const out: CharmIdV5[] = [];
  for (const id of charms) {
    if (seen.has(id)) continue;
    if (!(id in PODIUM_CHARMS_CATALOG_V5)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_EQUIPPED_CHARMS_V5) break;
  }
  return out;
}

// ============================================================================
// 3. CANON V5 CHALLENGER PROFILES & HILARIOUS "SCREW RIVAL!" BANTER BANK
// ============================================================================

export interface ChallengerScrewProfileV5 {
  readonly id: ChallengerIdV5 | string;
  readonly name: string;
  readonly title: string;
  readonly strongDomains: readonly DomainId[];
  readonly weakDomains: readonly DomainId[];
  readonly baseAccuracy: number;
  readonly onScrewedChokeLines: readonly string[];
  readonly onScrewedBackfireLines: readonly string[];
  readonly onDeployScrewLines: readonly string[];
  readonly onScrewShieldBlockedLines: readonly string[];
}

const CANON_CHALLENGER_SCREW_SPECS: Readonly<Record<string, ChallengerScrewProfileV5>> = {
  frankie_russo: {
    id: 'frankie_russo',
    name: 'Frankie "Last Call" Russo',
    title: 'Unbeaten Oakridge Pub-Quiz Bartender',
    strongDomains: [4, 5, 9],
    weakDomains: [1, 11],
    baseAccuracy: 0.42,
    onScrewedChokeLines: [
      'Hey! Nobody told me there was gonna be homework on this bar tab! I completely blanked!',
      'Whoa, you slipped me {category}?! My brain just dropped a whole tray of pint glasses!',
    ],
    onScrewedBackfireLines: [
      'Ha! You tried to Screw the bartender on {category}?! A regular explained that to me last Tuesday!',
      'Boom! Backfire special, on the house! Thanks for the free {points} points, kid!',
    ],
    onDeployScrewLines: [
      'Last call on easy picks! Have a tall glass of {category} — straight from your worst column!',
      'Red button time! Take {category} and see if you can keep your balance under these lights!',
    ],
    onScrewShieldBlockedLines: [
      'Wait, my red button bounced right off your brass shield?! Somebody check the wiring on that podium!',
      'You brought a Screw Shield to Oakridge Hall?! Alright, fair play, I respect the hustle!',
    ],
  },
  denise_park: {
    id: 'denise_park',
    name: 'Denise Park',
    title: 'Retired AP History Legend & Grammar Enforcer',
    strongDomains: [0, 8, 10],
    weakDomains: [4, 6],
    baseAccuracy: 0.48,
    onScrewedChokeLines: [
      'Excuse me, {category} was strictly NOT on the syllabus! I demand a faculty review!',
      'Oh bother... I just flunked {category} on live television. Please tell my former students to look away.',
    ],
    onScrewedBackfireLines: [
      'Did you truly think you could ambush a thirty-four-year veteran with {category}? A-plus, and +{points} for me!',
      'Detention for trying to Screw your elders! I read the footnotes on {category} before breakfast!',
    ],
    onDeployScrewLines: [
      'Pop quiz! Slamming the Screw buzzer on {category} — no notes, no whispering, no mercy!',
      'I graded your career transcript backstage. Step right up to {category}!',
    ],
    onScrewShieldBlockedLines: [
      'A Screw Shield?! That is the trivia equivalent of a doctor note excusing you from gym!',
      'Hmph! Your little brass shield deflected my pop quiz. Do not expect a second pass!',
    ],
  },
  trevor_blake: {
    id: 'trevor_blake',
    name: 'Trevor "14-Day" Blake',
    title: '14-Day Regional TV Streak Holder',
    strongDomains: [4, 2, 5],
    weakDomains: [1, 3],
    baseAccuracy: 0.55,
    onScrewedChokeLines: [
      'Cut! Cut to commercial! Do NOT air me whiffing {category} in HD!',
      'Whoa, {category}?! My Broadcast White smile just cracked in half — take the {points}, I got nothing!',
    ],
    onScrewedBackfireLines: [
      'Camera Two, zoom in on the BACKFIRE! You just gift-wrapped {points} points for Day Fifteen, baby!',
      'Tried to Screw me on {category}?! Plot twist: I read the teleprompter upside down in my sleep!',
    ],
    onDeployScrewLines: [
      'Producers, cue the dramatic red lights! I am Screwing you straight into {category}!',
      'You want prime-time ratings? Watch you sweat through {category} right now!',
    ],
    onScrewShieldBlockedLines: [
      'Hold on, that Screw Shield just ruined my best viral clip of the week!',
      'Wait, my sabotage got blocked?! Director, delete that angle immediately!',
    ],
  },
  priya_nair: {
    id: 'priya_nair',
    name: 'Dr. Priya Nair',
    title: 'ER Trauma Physician & Speed-Crossword Champ',
    strongDomains: [1, 7, 11],
    weakDomains: [5, 9],
    baseAccuracy: 0.62,
    onScrewedChokeLines: [
      'Code blue on {category}! Flatlined on live TV — well scouted, challenger.',
      'Okay, I can intubate in forty seconds, but {category}? My pulse just spiked and I missed it clean.',
    ],
    onScrewedBackfireLines: [
      'Vitals rock steady! You tried to shock me with {category} and handed me +{points} instead!',
      'Never try to rattle an ER doctor with a five-second Screw clock. Diagnosis: classic backfire!',
    ],
    onDeployScrewLines: [
      'Prescribing an emergency Screw on {category}. Stat!',
      'Your career chart shows an allergy to {category}. Let us test your immunity!',
    ],
    onScrewShieldBlockedLines: [
      'Impressive prophylaxis — that Screw Shield blocked my ambush completely.',
      'Smart prep bringing a Screw Shield to triage. I will adjust the treatment plan.',
    ],
  },
  alistair_finch: {
    id: 'alistair_finch',
    name: 'Lord Alistair Finch',
    title: 'Bone-Dry Oxford Classics Fellow',
    strongDomains: [0, 3, 10],
    weakDomains: [4, 6],
    baseAccuracy: 0.67,
    onScrewedChokeLines: [
      'Good heavens, what on earth is {category}?! I have been positively ambushed by modern nonsense!',
      'Blast it all — I blinked under that dreadful red lamp and fumbled {category}. Dreadfully clever of you.',
    ],
    onScrewedBackfireLines: [
      'Oh, how deliciously awkward for you. Even {category} yields to an Oxford reading list — +{points}!',
      'Your little sabotage just backfired rather spectacularly. Do fetch me a congratulatory scone.',
    ],
    onDeployScrewLines: [
      'Forgive the rudeness, but I am pressing this ghastly red button to assign you {category}.',
      'One simply cannot allow a challenger to avoid {category} forever. Off you pop!',
    ],
    onScrewShieldBlockedLines: [
      'A Screw Shield? How frightfully unsporting — and yet undeniably astute.',
      'My word, my ambush bounced clean off your lectern! Carry on then.',
    ],
  },
  kenji_takahashi: {
    id: 'kenji_takahashi',
    name: 'Kenji "Zero-Lag" Takahashi',
    title: 'Former Shogi & Quiz-Bowl Prodigy',
    strongDomains: [6, 11, 5],
    weakDomains: [9, 3],
    baseAccuracy: 0.72,
    onScrewedChokeLines: [
      'Gah! Frame-trapped on {category}?! You actually found the one gap in my memory bank!',
      'Input lag on {category}! Clean read — you just stole {points} right off my combo meter!',
    ],
    onScrewedBackfireLines: [
      'Counter-hit! You threw a Screw on {category} and walked straight into my +{points} punish!',
      'Zero-lag parry! Five seconds is an eternity when you already memorized {category}!',
    ],
    onDeployScrewLines: [
      'Checking your match-up chart... forcing you onto {category}! Show me your clutch speed!',
      'Slamming the Screw! Let us see if you can dodge a direct strike on {category}!',
    ],
    onScrewShieldBlockedLines: [
      'Perfect guard! Your Screw Shield parried my opener frame-one!',
      'Blocked?! Nice loadout tech — I burned my Screw token for zero damage!',
    ],
  },
  nadia_al_mansoor: {
    id: 'nadia_al_mansoor',
    name: 'Nadia Al-Mansoor',
    title: 'World Memory Champion & Polyglot',
    strongDomains: [2, 0, 8, 10],
    weakDomains: [5, 4],
    baseAccuracy: 0.76,
    onScrewedChokeLines: [
      'A brilliant trap! Even a memory palace has an unlocked back door in {category}!',
      'You studied my blind spot and struck at the exact right moment. +{points} earned fairly!',
    ],
    onScrewedBackfireLines: [
      'You thought I left {category} unindexed? That Screw just gifted me +{points} under the stars!',
      'A bold gambit, challenger — and a glorious backfire! I had {category} filed on shelf three!',
    ],
    onDeployScrewLines: [
      'I memorized your lowest career percentage before we took the stage. Step up to {category}!',
      'Pressing the Screw buzzer — let us see how your nerve holds inside {category}!',
    ],
    onScrewShieldBlockedLines: [
      'Ah, the Screw Shield! You anticipated my countermove two turns ahead. Respect!',
      'Deflected cleanly! That brass charm just saved you a very uncomfortable turn.',
    ],
  },
  viktor_volkov: {
    id: 'viktor_volkov',
    name: 'Viktor Volkov',
    title: 'Undefeated 3-Time World Grandmaster',
    strongDomains: [0, 1, 2, 8, 11],
    weakDomains: [4, 9],
    baseAccuracy: 0.8,
    onScrewedChokeLines: [
      'Impossible! A billion viewers just watched you catch me cold on {category}!',
      'Silence in the arena... you actually broke my armor on {category} for {points} points!',
    ],
    onScrewedBackfireLines: [
      'You dared Screw the World Champion on {category}?! A catastrophic blunder — +{points} to the throne!',
      'Pressure turns coal into diamonds, challenger. Your Screw backfired for +{points}!',
    ],
    onDeployScrewLines: [
      'Enough dancing around your weakness. I am slamming the Screw on {category} in front of the whole planet!',
      'A true World Champion survives their worst nightmare. Prove it on {category}!',
    ],
    onScrewShieldBlockedLines: [
      'A Screw Shield in the World Finale?! Clever preparation — my strike slides right off!',
      'You brought armor to a grandmaster duel. Your shield held, but only once.',
    ],
  },
  julian_vance: {
    id: 'julian_vance',
    name: 'Julian Vance',
    title: 'Undefeated 3-Time "World\'s Smartest" Champion',
    strongDomains: [0, 1, 2, 8, 11],
    weakDomains: [4, 9],
    baseAccuracy: 0.8,
    onScrewedChokeLines: [
      'Three championships and you catch me slipping on {category}?! That steal is going on every highlight reel!',
      'Unbelievable timing — I drew a complete blank on {category} and handed you {points}!',
    ],
    onScrewedBackfireLines: [
      'Trying to Screw a three-time champion on {category}? Bold move, costly backfire — +{points}!',
      'Five seconds was four seconds too generous. Thanks for the +{points} boost!',
    ],
    onDeployScrewLines: [
      'Time to test your championship mettle — I am Screwing you straight onto {category}!',
      'Every contender has a weak link. Tonight yours is {category}!',
    ],
    onScrewShieldBlockedLines: [
      'Well played — your Screw Shield absorbed the blow without flinching!',
      'Blocked my Screw clean! Now we really have a championship match!',
    ],
  },
};

const MAX_SCREW_CHOKE_LINES: readonly string[] = [
  'SCREW LANDED! {rival} choked on "{category}" and you just stole +{points} PTS straight into your bank{shatterNote}!',
  'OH, THE CARNAGE! {rival} froze under the red lamp on "{category}" — +{points} PTS stolen{shatterNote}!',
  'BULLSEYE SABOTAGE! {rival} whiffed "{category}" on live TV and handed you +{points} PTS{shatterNote}!',
  'SOMEBODY CALL SECURITY! You threw the Screw at {rival} on "{category}" and walked away with +{points} PTS{shatterNote}!',
];

const MAX_SCREW_BACKFIRE_LINES: readonly string[] = [
  'SCREW BACKFIRE! {rival} nailed "{category}" in cold blood and banked +{points} PTS right in your face!',
  'OOF! You threw the red trap at {rival} on "{category}" and they casually pocketed +{points} PTS!',
  'ABORT! ABORT! {rival} ate "{category}" for breakfast — your Screw just backfired for +{points} PTS to the rival!',
  'PLOT TWIST! {rival} stared straight into the Screw spotlight on "{category}" and cashed +{points} PTS!',
];

const MAX_RIVAL_SCREW_LINES: readonly string[] = [
  'RED ALERT! {rival} slammed the SCREW buzzer and locked you onto "{category}" ({weakNote})!',
  'COLD BLOODED! {rival} burned their Screw token to drag you straight into "{category}" ({weakNote})!',
  'STUDIO SIRENS! {rival} just Screwed you onto "{category}" — no dodging this one ({weakNote})!',
];

const MAX_SCREW_SHIELD_BLOCK_LINES: readonly string[] = [
  'CLANG! SCREW SHIELD ACTIVATED! {rival} tried to Screw you onto "{category}", and your brass shield bounced it straight off the stage!',
  'DENIED! {rival} slammed the red buzzer for "{category}", but your Screw Shield shattered the ambush cold!',
];

function fillTemplate(template: string, tokens: Readonly<Record<string, string>>): string {
  let out = template;
  for (const [k, v] of Object.entries(tokens)) {
    out = out.split(`{${k}}`).join(v);
  }
  return out;
}

function pickFrom<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

function sanitizeInt(value: number | undefined | null, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.round(value);
}

/**
 * Resolves a canon v5 Challenger spec from either a `ChallengerIdV5`, string ID,
 * or full `ChallengerProfileV4` object.
 */
export function getChallengerSpecV5(
  challenger?: ChallengerProfileV4 | ChallengerScrewProfileV5 | ChallengerIdV5 | string | null,
): ChallengerScrewProfileV5 {
  if (!challenger) {
    return CANON_CHALLENGER_SCREW_SPECS.frankie_russo;
  }
  if (typeof challenger === 'string') {
    const canon = CANON_CHALLENGER_SCREW_SPECS[challenger];
    if (canon) return canon;
    return {
      ...CANON_CHALLENGER_SCREW_SPECS.frankie_russo,
      id: challenger,
      name: challenger,
    };
  }
  if ('onScrewedChokeLines' in challenger) {
    return challenger;
  }
  const canon = CANON_CHALLENGER_SCREW_SPECS[challenger.id];
  if (canon) {
    return {
      ...canon,
      name: challenger.name,
      title: challenger.title,
      strongDomains: challenger.strongDomains,
      weakDomains: challenger.weakDomains,
      baseAccuracy: challenger.baseAccuracy,
    };
  }
  return {
    id: challenger.id,
    name: challenger.name,
    title: challenger.title,
    strongDomains: challenger.strongDomains,
    weakDomains: challenger.weakDomains,
    baseAccuracy: challenger.baseAccuracy,
    onScrewedChokeLines: [
      'Whoa — {category} completely caught me off guard! Take the {points} points!',
      'Not my finest hour on {category}. Well played with that Screw!',
    ],
    onScrewedBackfireLines: [
      'Nice try! I actually know {category} — thanks for the +{points} backfire!',
      'Backfire! You just handed me +{points} points on {category}!',
    ],
    onDeployScrewLines: [
      'Slamming the Screw! Let us see how you handle {category}!',
      'Time to test your blind spot on {category}!',
    ],
    onScrewShieldBlockedLines: [
      'Blocked by a Screw Shield?! Clever podium setup!',
      'My Screw bounced clean off your shield!',
    ],
  };
}

// ============================================================================
// 4. V5 STAGE BOARD STATE & MULTI-FORMAT GENERATOR (`generateStageBoardV5`)
// ============================================================================

export interface CharmRuntimeStateV5 {
  readonly equippedCharms: readonly CharmIdV5[];
  readonly frankiesCoasterUsed: boolean;
  readonly screwShieldChargesLeft: number;
  readonly totalCharmBonusPoints: number;
  readonly totalCharmPenaltySaved: number;
  readonly triggerCounts: Readonly<Partial<Record<CharmIdV5, number>>>;
}

export interface StageBoardStateV5 extends StageBoardStateV4 {
  readonly v5Version: '5.0';
  readonly campaignTopology: CampaignNodeV5['topology'];
  readonly challengerId: ChallengerIdV5 | string | null;
  readonly playerScrewTokensLeft: number;
  readonly playerScrewTokensMax: number;
  readonly rivalScrewTokensLeft: number;
  readonly playerSuccessfulScrews: number;
  readonly playerBackfiredScrews: number;
  readonly rivalScrewsDeployed: number;
  readonly rivalScrewsBlockedByShield: number;
  readonly paidOutRowIndices: readonly number[];
  readonly paidOutColIndices: readonly number[];
  readonly totalLineSweepJackpotPoints: number;
  readonly charms: CharmRuntimeStateV5;
  readonly bonusShotClockSec: number;
  readonly lifelinesUsedCount: number;
  readonly guaranteedFormats: readonly QuestionFormatV4[];
}

export interface GenerateStageBoardV5Config {
  readonly boardId?: string;
  readonly node?: CampaignNodeV5;
  readonly topology?: CampaignNodeV5['topology'] | BoardTopologyKind;
  readonly cols?: 4 | 5 | 6;
  readonly rows?: 3 | 4;
  readonly maxTurns?: number;
  readonly featuredFormats?: readonly QuestionFormatV4[];
  readonly preferredDomains?: readonly DomainId[];
  readonly draftedColumns?: readonly DraftedColumnSpecV4[];
  readonly challengerId?: ChallengerIdV5 | string | null;
  readonly hasActiveRival?: boolean;
  readonly soloTargetScore?: number;
  readonly equippedCharms?: readonly CharmIdV5[];
  readonly initialLifelines5050?: number;
  readonly initialLifelinesHint?: number;
  readonly seed?: number | string;
  readonly rng?: () => number;
}

const TACTILE_FORMAT_PRIORITY_V5: readonly QuestionFormatV4[] = [
  'MATCH_4',
  'SORT_4',
  'PINPOINT_DIAL',
  'CLUE_ESCALATOR',
  'MULTI_STRIKE',
  'VISUAL_SPOTTER',
  'MULTIPLE_CHOICE',
] as const;

/**
 * Maps any v5 `CampaignNodeV5['topology']` or v4 `BoardTopologyKind` cleanly into both
 * canonical v4 `BoardTopologyKind` and v5 `CampaignNodeV5['topology']`.
 */
export function mapCampaignTopologyToBoardV4(
  topology: CampaignNodeV5['topology'] | BoardTopologyKind | undefined,
): { readonly v4Topology: BoardTopologyKind; readonly campaignTopology: CampaignNodeV5['topology'] } {
  switch (topology) {
    case 'OPEN_TRYOUT':
    case 'OPEN_CLASSIC':
    case undefined:
      return { v4Topology: 'OPEN_CLASSIC', campaignTopology: 'OPEN_TRYOUT' };
    case 'PADLOCK_NEIGHBORS':
      return { v4Topology: 'PADLOCK_NEIGHBORS', campaignTopology: 'PADLOCK_NEIGHBORS' };
    case 'FOG_EXPLORER':
    case 'FOG_CROSSROADS':
      return { v4Topology: 'FOG_CROSSROADS', campaignTopology: 'FOG_EXPLORER' };
    case 'SPOTLIGHT_ROULETTE':
      return { v4Topology: 'SPOTLIGHT_ROULETTE', campaignTopology: 'SPOTLIGHT_ROULETTE' };
    case 'CROSSROADS_HYBRID':
    case 'CHALLENGER_GAUNTLET':
      return { v4Topology: 'CHALLENGER_GAUNTLET', campaignTopology: 'CROSSROADS_HYBRID' };
    case 'FINALE_GAUNTLET':
    case 'GRAND_FINALE_VAULT':
      return { v4Topology: 'GRAND_FINALE_VAULT', campaignTopology: 'FINALE_GAUNTLET' };
  }
}

function isCampaignNodeV5(
  input: CampaignNodeV5 | GenerateStageBoardV5Config,
): input is CampaignNodeV5 {
  return (
    typeof input === 'object' &&
    input !== null &&
    'nodeId' in input &&
    'boardCols' in input &&
    'boardRows' in input
  );
}

/**
 * Guarantees a rich format pool with AT LEAST `MIN_DISTINCT_FORMATS_PER_BOARD_V5` (4)
 * distinct `QuestionFormatV4` formats — permanently banning all-CLASSIC boards!
 */
function buildGuaranteedFormatPoolV5(
  requested: readonly QuestionFormatV4[] | undefined,
  rng: () => number,
): readonly QuestionFormatV4[] {
  const pool: QuestionFormatV4[] = [];
  if (requested) {
    for (const fmt of requested) {
      if (ALL_QUESTION_FORMATS_V4.includes(fmt) && !pool.includes(fmt)) {
        pool.push(fmt);
      }
    }
  }

  // Ensure at least 4 distinct formats (preferring tactile non-MC formats first!)
  const remaining = TACTILE_FORMAT_PRIORITY_V5.filter((f) => !pool.includes(f));
  // Deterministic mild shuffle of remaining non-MC formats so Act I boards feel fresh
  const nonMcRemaining = remaining.filter((f) => f !== 'MULTIPLE_CHOICE');
  for (let i = nonMcRemaining.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = nonMcRemaining[i];
    nonMcRemaining[i] = nonMcRemaining[j];
    nonMcRemaining[j] = tmp;
  }

  for (const fmt of nonMcRemaining) {
    if (pool.length >= Math.max(MIN_DISTINCT_FORMATS_PER_BOARD_V5, 5)) break;
    pool.push(fmt);
  }
  if (!pool.includes('MULTIPLE_CHOICE') && pool.length < MIN_DISTINCT_FORMATS_PER_BOARD_V5) {
    pool.push('MULTIPLE_CHOICE');
  }
  for (const fmt of ALL_QUESTION_FORMATS_V4) {
    if (pool.length >= MIN_DISTINCT_FORMATS_PER_BOARD_V5) break;
    if (!pool.includes(fmt)) pool.push(fmt);
  }

  return pool;
}

function expandPreferredDomainsForCols(
  preferred: readonly DomainId[] | undefined,
  cols: 4 | 5 | 6,
  rng: () => number,
): readonly DomainId[] | undefined {
  if (!preferred || preferred.length === 0) return undefined;
  const chosen: DomainId[] = [];
  for (const d of preferred) {
    if (ALL_DOMAIN_IDS_V4.includes(d) && !chosen.includes(d)) {
      chosen.push(d);
      if (chosen.length >= cols) return chosen;
    }
  }
  const usedWedges = new Set<WedgeColorId>(chosen.map((d) => domainToWedgeColor(d)));
  const shuffledWedges = [...ALL_WEDGE_IDS_V4];
  for (let i = shuffledWedges.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = shuffledWedges[i];
    shuffledWedges[i] = shuffledWedges[j];
    shuffledWedges[j] = tmp;
  }
  for (const wedge of shuffledWedges) {
    if (chosen.length >= cols) break;
    if (usedWedges.has(wedge)) continue;
    const candidates = WEDGE_CATALOG_V4[wedge].domainIds.filter((d) => !chosen.includes(d));
    if (candidates.length > 0) {
      chosen.push(pickFrom(candidates, rng));
      usedWedges.add(wedge);
    }
  }
  for (const d of ALL_DOMAIN_IDS_V4) {
    if (chosen.length >= cols) break;
    if (!chosen.includes(d)) chosen.push(d);
  }
  return chosen;
}

/**
 * Enforces v5 visual richness on every generated board (even Act I Node 1!):
 * - >= 2 PADLOCKED chain tiles (100% BFS-reachable from open neighbors)
 * - >= 1 WHEEL_CURVEBALL (`WHEEL_TRIGGER`)
 * - >= 1 LIGHTNING_BLITZ (Time-Bomb)
 * - >= cols CROWN_WEDGE (entire bottom 800 row)
 * - >= 1 POWER_PLAY (visible double-diamond unless under fog)
 * - >= 1 RIVAL_BOUNTY (fiery bounty crosshair)
 * - >= 4 distinct QuestionFormatV4 types across tiles (BANS all-CLASSIC forever!)
 */
function enforceV5BoardRichnessAndFormats(
  baseBoard: StageBoardStateV4,
  formatPool: readonly QuestionFormatV4[],
  rng: () => number,
): StageBoardStateV4 {
  const { cols, rows } = getBoardDimensions(baseBoard);
  const tiles = baseBoard.tiles.map((t) => ({ ...t }));

  // 1. Guarantee >= 2 PADLOCKED chain vault tiles even on OPEN_TRYOUT (outer bottom Crown Wedges)
  const padlockCount = tiles.filter((t) => t.status === 'PADLOCKED').length;
  if (padlockCount < 2) {
    const vaultCandidates = [
      tiles.find((t) => t.rowIndex === rows - 1 && t.colIndex === 0),
      tiles.find((t) => t.rowIndex === rows - 1 && t.colIndex === cols - 1),
      tiles.find((t) => t.rowIndex === rows - 1 && t.colIndex === Math.floor(cols / 2)),
    ].filter((t): t is BoardTileV4 => Boolean(t));

    let currentLocks = padlockCount;
    for (const cand of vaultCandidates) {
      if (currentLocks >= 2) break;
      if (cand.status === 'OPEN') {
        const idx = tiles.findIndex((t) => t.tileId === cand.tileId);
        tiles[idx] = {
          ...tiles[idx],
          status: 'PADLOCKED',
          twistRevealedToPlayer: true,
        };
        currentLocks++;
      }
    }
  }

  // 2. Guarantee bottom row is all CROWN_WEDGE (revealed unless FOGGED)
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].rowIndex === rows - 1) {
      tiles[i] = {
        ...tiles[i],
        twist: 'CROWN_WEDGE',
        twistRevealedToPlayer: tiles[i].status !== 'FOGGED',
      };
    }
  }

  // 3. Guarantee lively upper-row twists: POWER_PLAY, WHEEL_CURVEBALL, LIGHTNING_BLITZ, RIVAL_BOUNTY
  const ensureUpperTwist = (
    kind: TileTwistKind,
    preferRow: number,
    revealUnlessFogged = true,
  ): void => {
    const existing = tiles.filter((t) => t.twist === kind);
    if (existing.length > 0) {
      if (revealUnlessFogged) {
        for (const t of existing) {
          if (t.status !== 'FOGGED' && !t.twistRevealedToPlayer) {
            const idx = tiles.findIndex((x) => x.tileId === t.tileId);
            tiles[idx] = { ...tiles[idx], twistRevealedToPlayer: true };
          }
        }
      }
      return;
    }

    const upperNone = tiles.filter((t) => t.rowIndex < rows - 1 && t.twist === 'NONE');
    if (upperNone.length === 0) return;

    const preferred = upperNone.filter((t) => t.rowIndex === preferRow && t.status === 'OPEN');
    const openUpper = upperNone.filter((t) => t.status === 'OPEN');
    const pool = preferred.length > 0 ? preferred : openUpper.length > 0 ? openUpper : upperNone;
    const picked = pickFrom(pool, rng);
    const idx = tiles.findIndex((t) => t.tileId === picked.tileId);
    tiles[idx] = {
      ...tiles[idx],
      twist: kind,
      twistRevealedToPlayer: revealUnlessFogged ? tiles[idx].status !== 'FOGGED' : false,
    };
  };

  const midUpperRow = Math.max(0, rows - 2);
  ensureUpperTwist('POWER_PLAY', midUpperRow, true);
  ensureUpperTwist('WHEEL_CURVEBALL', Math.min(1, midUpperRow), true);
  ensureUpperTwist('LIGHTNING_BLITZ', 0, true);
  ensureUpperTwist('RIVAL_BOUNTY', 0, true);

  // Reveal all non-FOGGED special twists so the living 2.5D board sparkles from turn 1
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].twist !== 'NONE' && tiles[i].status !== 'FOGGED') {
      tiles[i] = { ...tiles[i], twistRevealedToPlayer: true };
    }
  }

  // 4. Enforce >= 4 distinct QuestionFormatV4 formats AND cap MULTIPLE_CHOICE so boards are NEVER all-CLASSIC!
  const nonMcPool = formatPool.filter((f) => f !== 'MULTIPLE_CHOICE');
  const safeNonMcPool: readonly QuestionFormatV4[] =
    nonMcPool.length >= 3
      ? nonMcPool
      : (['MATCH_4', 'SORT_4', 'PINPOINT_DIAL', 'CLUE_ESCALATOR', 'MULTI_STRIKE'] as const);

  // Cap MULTIPLE_CHOICE to at most ~33% of tiles (min 1 if LIGHTNING_BLITZ needs it)
  const maxMcTiles = Math.max(1, Math.floor(tiles.length / 3));
  let mcIndices = tiles
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => t.format === 'MULTIPLE_CHOICE');

  if (mcIndices.length > maxMcTiles) {
    // Keep LIGHTNING_BLITZ tiles as MULTIPLE_CHOICE first; convert excess MC tiles to tactile formats
    mcIndices.sort((a, b) => {
      const aBlitz = a.t.twist === 'LIGHTNING_BLITZ' ? 0 : 1;
      const bBlitz = b.t.twist === 'LIGHTNING_BLITZ' ? 0 : 1;
      return aBlitz - bBlitz;
    });
    const toConvert = mcIndices.slice(maxMcTiles);
    let cursor = 0;
    for (const { idx } of toConvert) {
      const replacement = safeNonMcPool[cursor % safeNonMcPool.length];
      cursor++;
      tiles[idx] = { ...tiles[idx], format: replacement };
    }
  }

  // Hard verification: ensure distinct format count >= MIN_DISTINCT_FORMATS_PER_BOARD_V5 (4)
  const countFormats = (): Map<QuestionFormatV4, number> => {
    const counts = new Map<QuestionFormatV4, number>();
    for (const t of tiles) {
      counts.set(t.format, (counts.get(t.format) ?? 0) + 1);
    }
    return counts;
  };

  let fmtCounts = countFormats();
  const missingFromPool = formatPool.filter((f) => !fmtCounts.has(f));
  const fallbackPool = ALL_QUESTION_FORMATS_V4.filter(
    (f) => !fmtCounts.has(f) && !missingFromPool.includes(f),
  );
  const injectQueue = [...missingFromPool, ...fallbackPool];

  while (fmtCounts.size < MIN_DISTINCT_FORMATS_PER_BOARD_V5 && injectQueue.length > 0) {
    const neededFmt = injectQueue.shift() as QuestionFormatV4;
    // Find a tile whose current format has count >= 2 (prefer non-LIGHTNING_BLITZ)
    let bestIdx = -1;
    let bestCount = 1;
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      if (t.twist === 'LIGHTNING_BLITZ' && neededFmt !== 'MULTIPLE_CHOICE') continue;
      const c = fmtCounts.get(t.format) ?? 0;
      if (c > bestCount) {
        bestCount = c;
        bestIdx = i;
      }
    }
    if (bestIdx < 0) break;
    tiles[bestIdx] = { ...tiles[bestIdx], format: neededFmt };
    fmtCounts = countFormats();
  }

  let nextBoard: StageBoardStateV4 = {
    ...baseBoard,
    tiles,
  };

  // 5. Re-verify 100% BFS reachability & >= 3 open tiles (0 soft-locks!)
  const reach = verifyBoardReachability(nextBoard);
  if (!reach.ok || reach.initialOpenCount < 3) {
    nextBoard = ensurePlayableTilesOrStageSurge(nextBoard, rng, 4).board;
  }

  return nextBoard;
}

/**
 * Computes match-start passive modifiers from equipped Podium Lucky Charms.
 */
export function getMatchStartCharmModifiers(
  equippedCharms?: readonly CharmIdV5[] | null,
  hasActiveRival = true,
): {
  readonly equippedCharms: readonly CharmIdV5[];
  readonly extraClueCoins: number;
  readonly extraScrewTokens: number;
  readonly bonusShotClockSec: number;
  readonly screwShieldCharges: number;
} {
  const sanitized = sanitizeEquippedCharmsV5(equippedCharms);
  const has = (id: CharmIdV5): boolean => sanitized.includes(id);
  return {
    equippedCharms: sanitized,
    extraClueCoins: has('grassroots_megaphone')
      ? CHARM_VALUES_V5.grassrootsMegaphoneExtraClues
      : 0,
    extraScrewTokens:
      hasActiveRival && has('velvet_wax_seal')
        ? CHARM_VALUES_V5.velvetWaxSealExtraScrews
        : 0,
    bonusShotClockSec: has('alistairs_pocketwatch')
      ? CHARM_VALUES_V5.alistairsPocketwatchBonusSec
      : 0,
    screwShieldCharges: has('screw_shield') ? CHARM_VALUES_V5.screwShieldCharges : 0,
  };
}

/**
 * Generates a rich, multi-format, zero-soft-lock `StageBoardStateV5`:
 * - Permanently BANS all-`"CLASSIC"` boards (`>= 4` distinct `QuestionFormatV4` types even on Act I Node 1!)
 * - Guarantees lively board twists (`PADLOCK` chains, `WHEEL_CURVEBALL`, `LIGHTNING_BLITZ`, `CROWN_WEDGE`, `POWER_PLAY`, `RIVAL_BOUNTY`)
 * - Initializes `"SCREW RIVAL!"` token economy (`1` base in rival matches, `+1` via `velvet_wax_seal`)
 * - Initializes match-start Podium Lucky Charm perks (`grassroots_megaphone`, `alistairs_pocketwatch`, `screw_shield`, `frankies_coaster`)
 */
export function generateStageBoardV5(
  configOrNode: CampaignNodeV5 | GenerateStageBoardV5Config = {},
  options?: Omit<GenerateStageBoardV5Config, 'node'>,
): StageBoardStateV5 {
  const node: CampaignNodeV5 | undefined = isCampaignNodeV5(configOrNode)
    ? configOrNode
    : configOrNode.node;
  const opts: GenerateStageBoardV5Config = isCampaignNodeV5(configOrNode)
    ? (options ?? {})
    : configOrNode;

  const rng =
    opts.rng ??
    (opts.seed !== undefined ? createSeededRng(opts.seed) : Math.random);

  const { v4Topology, campaignTopology } = mapCampaignTopologyToBoardV4(
    opts.topology ?? node?.topology ?? 'OPEN_TRYOUT',
  );

  const cols: 4 | 5 | 6 = opts.cols ?? node?.boardCols ?? 4;
  const rows: 3 | 4 = opts.rows ?? node?.boardRows ?? (campaignTopology === 'OPEN_TRYOUT' ? 3 : 4);
  const challengerId =
    opts.challengerId !== undefined ? opts.challengerId : (node?.challengerId ?? null);
  const hasActiveRival =
    opts.hasActiveRival !== undefined ? opts.hasActiveRival : challengerId !== null;
  const soloTargetScore = opts.soloTargetScore ?? node?.soloTargetScore ?? 1000;
  const maxTurns = opts.maxTurns ?? node?.maxTurns;

  const startMods = getMatchStartCharmModifiers(opts.equippedCharms, hasActiveRival);
  const formatPool = buildGuaranteedFormatPoolV5(
    opts.featuredFormats ?? node?.featuredFormats,
    rng,
  );
  const expandedDomains = expandPreferredDomainsForCols(
    opts.preferredDomains ?? node?.preferredDomains,
    cols,
    rng,
  );

  const baseConfig: CreateStageBoardConfigV4 = {
    boardId: opts.boardId ?? (node ? `v5_${node.nodeId}` : undefined),
    topology: v4Topology,
    cols,
    rows,
    maxTurns,
    allowedFormats: formatPool,
    domains: opts.draftedColumns ? undefined : expandedDomains,
    draftedColumns: opts.draftedColumns,
    hasActiveRival,
    soloTargetScore,
    initialLifelines5050: opts.initialLifelines5050 ?? 2,
    initialLifelinesHint: (opts.initialLifelinesHint ?? 2) + startMods.extraClueCoins,
    rng,
  };

  const v4Board = createStageBoard(baseConfig);
  const enrichedBoard = enforceV5BoardRichnessAndFormats(v4Board, formatPool, rng);

  const guaranteedFormats = Array.from(
    new Set(enrichedBoard.tiles.map((t) => t.format)),
  );

  const playerScrewTokensMax = hasActiveRival ? 1 + startMods.extraScrewTokens : 0;

  return {
    ...enrichedBoard,
    v5Version: '5.0',
    campaignTopology,
    challengerId,
    playerScrewTokensLeft: playerScrewTokensMax,
    playerScrewTokensMax,
    rivalScrewTokensLeft: hasActiveRival ? 1 : 0,
    playerSuccessfulScrews: 0,
    playerBackfiredScrews: 0,
    rivalScrewsDeployed: 0,
    rivalScrewsBlockedByShield: 0,
    paidOutRowIndices: [],
    paidOutColIndices: [],
    totalLineSweepJackpotPoints: 0,
    charms: {
      equippedCharms: startMods.equippedCharms,
      frankiesCoasterUsed: false,
      screwShieldChargesLeft: startMods.screwShieldCharges,
      totalCharmBonusPoints: 0,
      totalCharmPenaltySaved: 0,
      triggerCounts: {},
    },
    bonusShotClockSec: startMods.bonusShotClockSec,
    lifelinesUsedCount: 0,
    guaranteedFormats,
  };
}

// ============================================================================
// 5. ROW & COLUMN STAGE SWEEP JACKPOTS (`checkLineSweepJackpots`)
// ============================================================================

export interface LineSweepJackpotEntryV5 {
  readonly kind: 'ROW' | 'COLUMN';
  readonly index: number;
  readonly pointsAwarded: number;
  readonly unlockedWedge: WedgeColorId | null;
  readonly banner: string;
}

export interface LineSweepJackpotResultV5 {
  readonly board: StageBoardStateV5;
  readonly jackpots: readonly LineSweepJackpotEntryV5[];
  readonly totalPointsAwarded: number;
  readonly newlyUnlockedWedges: readonly WedgeColorId[];
  readonly previousPlayerScore: number;
  readonly newPlayerScore: number;
}

function pickUncollectedWedgeForLine(
  board: StageBoardStateV5,
  currentEarned: readonly WedgeColorId[],
  kind: 'ROW' | 'COLUMN',
  lineIndex: number,
): WedgeColorId | null {
  if (kind === 'COLUMN') {
    const colWedge = board.columns[lineIndex]?.wedgeId;
    if (colWedge && !currentEarned.includes(colWedge)) {
      return colWedge;
    }
  }
  // Prefer an uncollected wedge represented on the current board's columns first
  for (const col of board.columns) {
    if (!currentEarned.includes(col.wedgeId)) {
      return col.wedgeId;
    }
  }
  // Otherwise unlock any remaining uncollected color wedge from the 6-wedge medallion
  for (const wedge of ALL_WEDGE_IDS_V4) {
    if (!currentEarned.includes(wedge)) {
      return wedge;
    }
  }
  return null;
}

/**
 * Checks whether completing `completedTileId` (or any unpaid line on the board if omitted)
 * finishes **all tiles in that column OR all tiles in that row**.
 *
 * For each newly completed unpaid line:
 * - Awards an honest **`+300 PTS`** Stage Sweep Jackpot (`LINE_SWEEP_JACKPOT_POINTS_V5`)
 * - Unlocks an uncollected `WedgeColorId` if available
 * - Records the row/col index so no line ever pays out twice
 * - Guarantees strict 1:1 score conservation (`newPlayerScore === previousPlayerScore + totalPointsAwarded`)
 */
export function checkLineSweepJackpots(
  board: StageBoardStateV5,
  completedTileId?: string,
): LineSweepJackpotResultV5 {
  const { cols, rows } = getBoardDimensions(board);
  const previousPlayerScore = sanitizeInt(board.playerScore, 0);

  const rowCandidates: number[] = [];
  const colCandidates: number[] = [];

  if (completedTileId) {
    const tile = getTileById(board, completedTileId);
    if (tile) {
      rowCandidates.push(tile.rowIndex);
      colCandidates.push(tile.colIndex);
    }
  } else {
    for (let r = 0; r < rows; r++) rowCandidates.push(r);
    for (let c = 0; c < cols; c++) colCandidates.push(c);
  }

  const nextPaidRows = [...board.paidOutRowIndices];
  const nextPaidCols = [...board.paidOutColIndices];
  const nextEarnedWedges = [...board.earnedWedges];
  const jackpots: LineSweepJackpotEntryV5[] = [];
  const newlyUnlockedWedges: WedgeColorId[] = [];
  let totalPointsAwarded = 0;

  // Check Column sweeps
  for (const colIndex of colCandidates) {
    if (colIndex < 0 || colIndex >= cols) continue;
    if (nextPaidCols.includes(colIndex)) continue;
    const colTiles = board.tiles.filter((t) => t.colIndex === colIndex);
    if (colTiles.length === rows && colTiles.every((t) => !isUnplayedTileStatus(t.status))) {
      nextPaidCols.push(colIndex);
      totalPointsAwarded += LINE_SWEEP_JACKPOT_POINTS_V5;
      const unlockedWedge = pickUncollectedWedgeForLine(board, nextEarnedWedges, 'COLUMN', colIndex);
      if (unlockedWedge) {
        nextEarnedWedges.push(unlockedWedge);
        newlyUnlockedWedges.push(unlockedWedge);
      }
      const colTitle = board.columns[colIndex]?.wittyTitle ?? `Column ${colIndex + 1}`;
      const wedgeNote = unlockedWedge
        ? ` + ${WEDGE_CATALOG_V4[unlockedWedge].shortLabel} Crown Wedge!`
        : '!';
      jackpots.push({
        kind: 'COLUMN',
        index: colIndex,
        pointsAwarded: LINE_SWEEP_JACKPOT_POINTS_V5,
        unlockedWedge,
        banner: `COLUMN SWEEP JACKPOT! Cleared "${colTitle}" for +${LINE_SWEEP_JACKPOT_POINTS_V5} PTS${wedgeNote}`,
      });
    }
  }

  // Check Row sweeps
  for (const rowIndex of rowCandidates) {
    if (rowIndex < 0 || rowIndex >= rows) continue;
    if (nextPaidRows.includes(rowIndex)) continue;
    const rowTiles = board.tiles.filter((t) => t.rowIndex === rowIndex);
    if (rowTiles.length === cols && rowTiles.every((t) => !isUnplayedTileStatus(t.status))) {
      nextPaidRows.push(rowIndex);
      totalPointsAwarded += LINE_SWEEP_JACKPOT_POINTS_V5;
      const unlockedWedge = pickUncollectedWedgeForLine(board, nextEarnedWedges, 'ROW', rowIndex);
      if (unlockedWedge) {
        nextEarnedWedges.push(unlockedWedge);
        newlyUnlockedWedges.push(unlockedWedge);
      }
      const rowPoints = rowTiles[0]?.pointValue ?? (rowIndex + 1) * 100;
      const wedgeNote = unlockedWedge
        ? ` + ${WEDGE_CATALOG_V4[unlockedWedge].shortLabel} Crown Wedge!`
        : '!';
      jackpots.push({
        kind: 'ROW',
        index: rowIndex,
        pointsAwarded: LINE_SWEEP_JACKPOT_POINTS_V5,
        unlockedWedge,
        banner: `ROW SWEEP JACKPOT! Cleared the ${rowPoints}-PT row for +${LINE_SWEEP_JACKPOT_POINTS_V5} PTS${wedgeNote}`,
      });
    }
  }

  if (jackpots.length === 0) {
    return {
      board,
      jackpots: [],
      totalPointsAwarded: 0,
      newlyUnlockedWedges: [],
      previousPlayerScore,
      newPlayerScore: previousPlayerScore,
    };
  }

  const newPlayerScore = previousPlayerScore + totalPointsAwarded;
  const nextBoard: StageBoardStateV5 = {
    ...board,
    playerScore: newPlayerScore,
    earnedWedges: nextEarnedWedges,
    completedLinesCount: board.completedLinesCount + jackpots.length,
    paidOutRowIndices: nextPaidRows,
    paidOutColIndices: nextPaidCols,
    totalLineSweepJackpotPoints: board.totalLineSweepJackpotPoints + totalPointsAwarded,
  };

  return {
    board: nextBoard,
    jackpots,
    totalPointsAwarded,
    newlyUnlockedWedges,
    previousPlayerScore,
    newPlayerScore,
  };
}

// ============================================================================
// 6. AUTHENTIC "SCREW RIVAL!" MECHANIC (`executePlayerScrewOnTile` & `maybeTriggerRivalScrew`)
// ============================================================================

export interface ChallengerScrewOddsV5 {
  readonly challengerId: string;
  readonly challengerName: string;
  readonly domainAffinity: 'STRONG' | 'WEAK' | 'NEUTRAL';
  /** Probability [0.10..0.90] that the Challenger nails the forced tile (Backfire risk). */
  readonly nailProbability: number;
  /** Probability [0.10..0.90] that the Challenger chokes (Player steals +100% of tile value!). */
  readonly chokeProbability: number;
  readonly scoutingBadge: string;
}

/**
 * Evaluates a Challenger's live attempt probability when hit by `"SCREW RIVAL!"` based on
 * their canon specialty domains vs. weak domains + tile row value (`100..800`) under 5s pressure.
 */
export function evaluateChallengerScrewChance(
  challengerOrId:
    | ChallengerProfileV4
    | ChallengerScrewProfileV5
    | ChallengerIdV5
    | string
    | null
    | undefined,
  tile: Pick<BoardTileV4, 'domainId' | 'pointValue'>,
): ChallengerScrewOddsV5 {
  const spec = getChallengerSpecV5(challengerOrId);
  let nailProb = spec.baseAccuracy - 0.08; // 5-second Screw spotlight pressure

  let domainAffinity: 'STRONG' | 'WEAK' | 'NEUTRAL' = 'NEUTRAL';
  if (spec.weakDomains.includes(tile.domainId)) {
    domainAffinity = 'WEAK';
    nailProb -= 0.24;
  } else if (spec.strongDomains.includes(tile.domainId)) {
    domainAffinity = 'STRONG';
    nailProb += 0.18;
  }

  switch (tile.pointValue) {
    case 100:
      nailProb += 0.08;
      break;
    case 200:
      nailProb += 0.02;
      break;
    case 400:
      nailProb -= 0.06;
      break;
    case 800:
      nailProb -= 0.14;
      break;
  }

  const clampedNail = Math.max(0.1, Math.min(0.9, Number(nailProb.toFixed(4))));
  const chokeProbability = Number((1 - clampedNail).toFixed(4));
  const chokePct = Math.round(chokeProbability * 100);

  let scoutingBadge: string;
  if (domainAffinity === 'WEAK') {
    scoutingBadge = `WEAK SPOT · ${chokePct}% CHOKE CHANCE`;
  } else if (domainAffinity === 'STRONG') {
    scoutingBadge = `RIVAL TURF · ${chokePct}% CHOKE CHANCE`;
  } else {
    scoutingBadge = `LIVE TRAP · ${chokePct}% CHOKE CHANCE`;
  }

  return {
    challengerId: spec.id,
    challengerName: spec.name,
    domainAffinity,
    nailProbability: clampedNail,
    chokeProbability,
    scoutingBadge,
  };
}

export interface ExecutePlayerScrewOptionsV5 {
  readonly challenger?: ChallengerProfileV4 | ChallengerIdV5 | string | null;
  readonly rng?: () => number;
  /** Deterministic override for unit testing or tutorial scripts. */
  readonly forcedOutcome?: 'CHOKED' | 'NAILED';
  /** Defaults to true: resolves the tile as the current turn and checks Row/Col sweeps. */
  readonly consumeTurn?: boolean;
  /** Defaults to true: automatically awards +300 PTS + Wedge if a Choke completes a Row/Col. */
  readonly autoCheckLineSweeps?: boolean;
}

export interface PlayerScrewResultV5 {
  readonly executed: boolean;
  readonly errorReason?: string;
  readonly board: StageBoardStateV5;
  readonly targetTile: BoardTileV4 | null;
  readonly odds: ChallengerScrewOddsV5 | null;
  readonly outcome: 'CHOKED' | 'BACKFIRED' | 'REJECTED';
  readonly previousPlayerScore: number;
  readonly newPlayerScore: number;
  /** Exact 1:1 net change to playerScore (`screwStealPoints + lineSweepPoints`). */
  readonly playerScoreDelta: number;
  readonly screwStealPoints: number;
  readonly previousRivalScore: number;
  readonly newRivalScore: number;
  /** Exact 1:1 net change to rivalScore (`+tile.pointValue` on Backfire, else `0`). */
  readonly rivalScoreDelta: number;
  readonly shatteredNeighborTileIds: readonly string[];
  readonly stageSurgeUnlockedIds: readonly string[];
  readonly awardedPlayerWedge: WedgeColorId | null;
  readonly awardedRivalWedge: WedgeColorId | null;
  readonly lineSweepJackpots: readonly LineSweepJackpotEntryV5[];
  readonly challengerLine: string;
  readonly hostLine: string;
}

/**
 * Executes the authentic *You Don't Know Jack*-style `"SCREW RIVAL!"` trap on an open tile:
 * - Requires an active Rival, `playerScrewTokensLeft > 0`, and an `'OPEN'` unfrozen tile.
 * - **Challenger Chokes (Misses):** Player STEALS `+100%` of `tile.pointValue` (strict 1:1 addition),
 *   marks tile `'CLEARED_WIN'`, shatters orthogonal `PADLOCKED`/`FOGGED` neighbors open, awards
 *   Crown Wedge + Row/Column Stage Sweep Jackpots if completed, and delivers custom Max + Challenger lines!
 * - **Challenger Nails It (Backfire!):** Challenger banks `+100%` of `tile.pointValue` onto `rivalScore`,
 *   claims the tile (`'CLAIMED_BY_RIVAL'`), and delivers custom gloat + Max panic lines!
 * - Always protects against soft-locks via `ensurePlayableTilesOrStageSurge`.
 */
export function executePlayerScrewOnTile(
  board: StageBoardStateV5,
  tileId: string,
  options: ExecutePlayerScrewOptionsV5 = {},
): PlayerScrewResultV5 {
  const prevPlayerScore = sanitizeInt(board.playerScore, 0);
  const prevRivalScore = sanitizeInt(board.rivalScore, 0);

  const reject = (errorReason: string): PlayerScrewResultV5 => ({
    executed: false,
    errorReason,
    board,
    targetTile: getTileById(board, tileId) ?? null,
    odds: null,
    outcome: 'REJECTED',
    previousPlayerScore: prevPlayerScore,
    newPlayerScore: prevPlayerScore,
    playerScoreDelta: 0,
    screwStealPoints: 0,
    previousRivalScore: prevRivalScore,
    newRivalScore: prevRivalScore,
    rivalScoreDelta: 0,
    shatteredNeighborTileIds: [],
    stageSurgeUnlockedIds: [],
    awardedPlayerWedge: null,
    awardedRivalWedge: null,
    lineSweepJackpots: [],
    challengerLine: '',
    hostLine: errorReason,
  });

  if (board.isBoardComplete) {
    return reject('Cannot use SCREW RIVAL! after the board is complete.');
  }
  if (!board.hasActiveRival) {
    return reject('SCREW RIVAL! is only available in Rival head-to-head matches.');
  }
  if (board.playerScrewTokensLeft <= 0) {
    return reject('No SCREW RIVAL! tokens remaining this match.');
  }

  const tileIndex = board.tiles.findIndex((t) => t.tileId === tileId);
  if (tileIndex < 0) {
    return reject(`Unknown board tile "${tileId}".`);
  }
  const targetTile = board.tiles[tileIndex];
  if (targetTile.status !== 'OPEN') {
    return reject(`Tile "${tileId}" is not OPEN (${targetTile.status}).`);
  }
  const targetCol = board.columns[targetTile.colIndex];
  if (targetCol && targetCol.frozenTurnsRemaining > 0) {
    return reject(`Column "${targetCol.wittyTitle}" is frozen and cannot be targeted.`);
  }

  const rng = options.rng ?? Math.random;
  const consumeTurn = options.consumeTurn ?? true;
  const autoCheckLineSweeps = options.autoCheckLineSweeps ?? true;
  const challengerSpec = getChallengerSpecV5(options.challenger ?? board.challengerId);
  const odds = evaluateChallengerScrewChance(challengerSpec, targetTile);

  const roll = rng();
  const challengerChoked = options.forcedOutcome
    ? options.forcedOutcome === 'CHOKED'
    : roll >= odds.nailProbability;

  const nextColumns = board.columns.map((c) => ({ ...c }));
  const nextTiles = board.tiles.map((t) => ({ ...t }));

  // Decrement active column freezes cleanly when consuming a turn
  if (consumeTurn) {
    for (const col of nextColumns) {
      if (col.frozenTurnsRemaining > 0) {
        col.frozenTurnsRemaining = Math.max(0, col.frozenTurnsRemaining - 1);
        if (col.frozenTurnsRemaining === 0) {
          for (const t of nextTiles) {
            if (t.colIndex === col.colIndex && t.status === 'FROZEN_BY_RIVAL') {
              t.status = 'OPEN';
            }
          }
        }
      }
    }
  }

  const categoryTitle = targetCol?.wittyTitle ?? DOMAIN_TOPIC_SUBTITLE_V4[targetTile.domainId];
  const pointStr = String(targetTile.pointValue);
  const shatteredNeighborTileIds: string[] = [];
  let awardedPlayerWedge: WedgeColorId | null = null;
  let awardedRivalWedge: WedgeColorId | null = null;
  const nextEarnedWedges = [...board.earnedWedges];
  const nextRivalWedges = [...board.rivalWedges];

  const neighborDeltas: ReadonlyArray<readonly [number, number]> = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  let screwStealPoints = 0;
  let rivalScoreDelta = 0;
  let resolvedTile: BoardTileV4;

  if (challengerChoked) {
    // CHALLENGER CHOKED -> Player steals +100% of tile.pointValue + neighboring locks SHATTER open!
    screwStealPoints = targetTile.pointValue;
    resolvedTile = {
      ...nextTiles[tileIndex],
      status: 'CLEARED_WIN',
      twistRevealedToPlayer: true,
      forcedByRival: false,
    };
    nextTiles[tileIndex] = resolvedTile;

    for (const [dc, dr] of neighborDeltas) {
      const nbIdx = nextTiles.findIndex(
        (t) => t.colIndex === targetTile.colIndex + dc && t.rowIndex === targetTile.rowIndex + dr,
      );
      if (nbIdx < 0) continue;
      const nb = nextTiles[nbIdx];
      if (nb.status === 'PADLOCKED' || nb.status === 'FOGGED') {
        const nbFrozen = nextColumns[nb.colIndex].frozenTurnsRemaining > 0;
        nextTiles[nbIdx] = {
          ...nb,
          status: nbFrozen ? 'FROZEN_BY_RIVAL' : 'OPEN',
          twistRevealedToPlayer: true,
        };
        shatteredNeighborTileIds.push(nb.tileId);
      }
    }

    if (resolvedTile.twist === 'CROWN_WEDGE' && !nextEarnedWedges.includes(resolvedTile.wedgeId)) {
      nextEarnedWedges.push(resolvedTile.wedgeId);
      awardedPlayerWedge = resolvedTile.wedgeId;
    }
  } else {
    // BACKFIRE -> Challenger nails it and banks +100% of tile.pointValue onto rivalScore!
    rivalScoreDelta = targetTile.pointValue;
    resolvedTile = {
      ...nextTiles[tileIndex],
      status: 'CLAIMED_BY_RIVAL',
      twistRevealedToPlayer: true,
      forcedByRival: false,
    };
    nextTiles[tileIndex] = resolvedTile;

    // Unlock orthogonal neighbors just like ChallengerAI.executeClaimTile so board stays open
    for (const [dc, dr] of neighborDeltas) {
      const nbIdx = nextTiles.findIndex(
        (t) => t.colIndex === targetTile.colIndex + dc && t.rowIndex === targetTile.rowIndex + dr,
      );
      if (nbIdx < 0) continue;
      const nb = nextTiles[nbIdx];
      if (nb.status === 'PADLOCKED' || nb.status === 'FOGGED') {
        const nbFrozen = nextColumns[nb.colIndex].frozenTurnsRemaining > 0;
        nextTiles[nbIdx] = {
          ...nb,
          status: nbFrozen ? 'FROZEN_BY_RIVAL' : 'OPEN',
          twistRevealedToPlayer: nb.twist === 'POWER_PLAY' ? nb.twistRevealedToPlayer : true,
        };
      }
    }

    if (resolvedTile.twist === 'CROWN_WEDGE' && !nextRivalWedges.includes(resolvedTile.wedgeId)) {
      nextRivalWedges.push(resolvedTile.wedgeId);
      awardedRivalWedge = resolvedTile.wedgeId;
    }
  }

  const nextTurnNumber = consumeTurn ? board.turnNumber + 1 : board.turnNumber;
  const nextTurnsRemaining = consumeTurn
    ? Math.max(0, board.turnsRemaining - 1)
    : board.turnsRemaining;
  const unplayedRemaining = nextTiles.filter((t) => isUnplayedTileStatus(t.status)).length;
  const isBoardComplete = nextTurnsRemaining <= 0 || unplayedRemaining === 0;

  const clearedForced = board.forcedTileId === targetTile.tileId;

  let nextBoard: StageBoardStateV5 = {
    ...board,
    columns: nextColumns,
    tiles: nextTiles,
    turnNumber: nextTurnNumber,
    turnsRemaining: nextTurnsRemaining,
    playerScore: prevPlayerScore + screwStealPoints,
    rivalScore: prevRivalScore + rivalScoreDelta,
    earnedWedges: nextEarnedWedges,
    rivalWedges: nextRivalWedges,
    forcedTileId: isBoardComplete || clearedForced ? null : board.forcedTileId,
    forcedReasonBanner: isBoardComplete || clearedForced ? null : board.forcedReasonBanner,
    isBoardComplete,
    playerScrewTokensLeft: board.playerScrewTokensLeft - 1,
    playerSuccessfulScrews: board.playerSuccessfulScrews + (challengerChoked ? 1 : 0),
    playerBackfiredScrews: board.playerBackfiredScrews + (challengerChoked ? 0 : 1),
  };

  // Check Row & Column Stage Sweep Jackpots on successful Player Screw
  let lineSweepJackpots: readonly LineSweepJackpotEntryV5[] = [];
  let lineSweepPoints = 0;
  if (challengerChoked && autoCheckLineSweeps) {
    const sweepRes = checkLineSweepJackpots(nextBoard, targetTile.tileId);
    nextBoard = sweepRes.board;
    lineSweepJackpots = sweepRes.jackpots;
    lineSweepPoints = sweepRes.totalPointsAwarded;
    if (!awardedPlayerWedge && sweepRes.newlyUnlockedWedges.length > 0) {
      awardedPlayerWedge = sweepRes.newlyUnlockedWedges[0];
    }
  }

  // Zero-soft-lock Stage Surge check
  let stageSurgeUnlockedIds: readonly string[] = [];
  if (!nextBoard.isBoardComplete) {
    const surge = ensurePlayableTilesOrStageSurge(nextBoard, rng, 2);
    if (surge.triggered || surge.board !== nextBoard) {
      nextBoard = {
        ...nextBoard,
        ...surge.board,
      };
      stageSurgeUnlockedIds = surge.unlockedTileIds;
    }
  }

  const totalPlayerDelta = screwStealPoints + lineSweepPoints;
  const shatterNote =
    shatteredNeighborTileIds.length > 0
      ? ` and shattered ${shatteredNeighborTileIds.length} locked vault${shatteredNeighborTileIds.length === 1 ? '' : 's'}`
      : '';

  const challengerLine = fillTemplate(
    pickFrom(
      challengerChoked
        ? challengerSpec.onScrewedChokeLines
        : challengerSpec.onScrewedBackfireLines,
      rng,
    ),
    {
      category: categoryTitle,
      points: pointStr,
      rival: challengerSpec.name,
    },
  );

  const hostLine = fillTemplate(
    pickFrom(challengerChoked ? MAX_SCREW_CHOKE_LINES : MAX_SCREW_BACKFIRE_LINES, rng),
    {
      rival: challengerSpec.name,
      category: categoryTitle,
      points: pointStr,
      shatterNote,
    },
  );

  return {
    executed: true,
    board: nextBoard,
    targetTile: resolvedTile,
    odds,
    outcome: challengerChoked ? 'CHOKED' : 'BACKFIRED',
    previousPlayerScore: prevPlayerScore,
    newPlayerScore: nextBoard.playerScore,
    playerScoreDelta: totalPlayerDelta,
    screwStealPoints,
    previousRivalScore: prevRivalScore,
    newRivalScore: nextBoard.rivalScore,
    rivalScoreDelta,
    shatteredNeighborTileIds,
    stageSurgeUnlockedIds,
    awardedPlayerWedge,
    awardedRivalWedge,
    lineSweepJackpots,
    challengerLine,
    hostLine,
  };
}

export interface RivalScrewOptionsV5 {
  readonly challenger?: ChallengerProfileV4 | ChallengerIdV5 | string | null;
  readonly playerStats?: PlayerStatProfileForHost | null;
  /** Bypass cadence probability and immediately attempt Rival Screw if eligible. */
  readonly forceAttempt?: boolean;
  readonly rng?: () => number;
}

export interface RivalScrewResultV5 {
  readonly board: StageBoardStateV5;
  readonly triggered: boolean;
  readonly blockedByScrewShield: boolean;
  readonly targetTile: BoardTileV4 | null;
  readonly targetDomainId: DomainId | null;
  readonly targetedPlayerWeakness: boolean;
  readonly rivalLine: string | null;
  readonly hostLine: string | null;
  readonly forcedReasonBanner: string | null;
  readonly consumedRivalToken: boolean;
}

function pickRivalScrewTargetTile(
  board: StageBoardStateV5,
  challenger: ChallengerScrewProfileV5,
  playerStats: PlayerStatProfileForHost | null | undefined,
  rng: () => number,
): { readonly tile: BoardTileV4 | null; readonly targetedPlayerWeakness: boolean; readonly weakLabel: string } {
  const playable = getPlayableTiles(board);
  if (playable.length === 0) {
    return { tile: null, targetedPlayerWeakness: false, weakLabel: '' };
  }

  const weakDomainId = playerStats?.weakestDomainId ?? null;
  if (weakDomainId !== null) {
    const exactWeak = playable.filter((t) => t.domainId === weakDomainId);
    if (exactWeak.length > 0) {
      const sorted = [...exactWeak].sort((a, b) => b.pointValue - a.pointValue);
      const topValue = sorted[0].pointValue;
      const topBand = sorted.filter((t) => t.pointValue >= topValue / 2);
      const label =
        playerStats?.weakestDomainName ?? DOMAIN_TOPIC_SUBTITLE_V4[weakDomainId];
      return {
        tile: pickFrom(topBand, rng),
        targetedPlayerWeakness: true,
        weakLabel:
          playerStats && playerStats.totalAnswered > 0
            ? `${Math.round(playerStats.weakestAccuracyPct)}% career accuracy in ${label}`
            : `your weakest career domain: ${label}`,
      };
    }

    const weakWedge = domainToWedgeColor(weakDomainId);
    const wedgeWeak = playable.filter((t) => t.wedgeId === weakWedge);
    if (wedgeWeak.length > 0) {
      const sorted = [...wedgeWeak].sort((a, b) => b.pointValue - a.pointValue);
      const label =
        playerStats?.weakestDomainName ?? DOMAIN_TOPIC_SUBTITLE_V4[weakDomainId];
      return {
        tile: sorted[0],
        targetedPlayerWeakness: true,
        weakLabel: `same wedge family as your weakest domain (${label})`,
      };
    }
  }

  // Fallback: Challenger's strong turf or highest value open tile
  const rivalTurf = playable.filter((t) => challenger.strongDomains.includes(t.domainId));
  if (rivalTurf.length > 0) {
    const sorted = [...rivalTurf].sort((a, b) => b.pointValue - a.pointValue);
    return {
      tile: sorted[0],
      targetedPlayerWeakness: false,
      weakLabel: `${challenger.name}'s specialty turf`,
    };
  }

  const sortedAll = [...playable].sort((a, b) => b.pointValue - a.pointValue);
  return {
    tile: sortedAll[0],
    targetedPlayerWeakness: false,
    weakLabel: 'high-stakes board ambush',
  };
}

/**
 * Challenger AI strategically deploys its 1 `"SCREW!"` token to force the player onto
 * the player's **weakest Career Stats domain** — unless automatically blocked once by
 * the player's equipped `screw_shield` Podium Lucky Charm!
 */
export function maybeTriggerRivalScrew(
  board: StageBoardStateV5,
  options: RivalScrewOptionsV5 = {},
): RivalScrewResultV5 {
  const noTrigger: RivalScrewResultV5 = {
    board,
    triggered: false,
    blockedByScrewShield: false,
    targetTile: null,
    targetDomainId: null,
    targetedPlayerWeakness: false,
    rivalLine: null,
    hostLine: null,
    forcedReasonBanner: null,
    consumedRivalToken: false,
  };

  if (
    board.isBoardComplete ||
    !board.hasActiveRival ||
    board.rivalScrewTokensLeft <= 0 ||
    board.forcedTileId !== null
  ) {
    return noTrigger;
  }

  const rng = options.rng ?? Math.random;
  const challengerSpec = getChallengerSpecV5(options.challenger ?? board.challengerId);
  const picked = pickRivalScrewTargetTile(board, challengerSpec, options.playerStats, rng);
  if (!picked.tile) {
    return noTrigger;
  }

  // Strategic timing check unless forced
  if (!options.forceAttempt) {
    // Let the player make at least 1-2 openings before springing the Rival Screw trap
    if (board.turnNumber < 2 && board.turnsRemaining > 3) {
      return noTrigger;
    }
    let deployChance = 0.2;
    if (picked.targetedPlayerWeakness) deployChance += 0.35;
    if (board.rivalScore < board.playerScore) deployChance += 0.25;
    if (board.turnsRemaining <= Math.ceil(board.maxTurns * 0.45)) deployChance += 0.25;
    if (challengerSpec.baseAccuracy >= 0.62) deployChance += 0.1;
    const clampedChance = Math.min(0.88, deployChance);
    if (rng() >= clampedChance) {
      return noTrigger;
    }
  }

  const targetTile = picked.tile;
  const colTitle =
    board.columns[targetTile.colIndex]?.wittyTitle ??
    DOMAIN_TOPIC_SUBTITLE_V4[targetTile.domainId];

  // Check `screw_shield` Podium Lucky Charm interception!
  if (board.charms.screwShieldChargesLeft > 0) {
    const prevCount = board.charms.triggerCounts.screw_shield ?? 0;
    const nextBoard: StageBoardStateV5 = {
      ...board,
      rivalScrewTokensLeft: board.rivalScrewTokensLeft - 1,
      rivalScrewsBlockedByShield: board.rivalScrewsBlockedByShield + 1,
      charms: {
        ...board.charms,
        screwShieldChargesLeft: board.charms.screwShieldChargesLeft - 1,
        triggerCounts: {
          ...board.charms.triggerCounts,
          screw_shield: prevCount + 1,
        },
      },
    };

    const rivalLine = fillTemplate(
      pickFrom(challengerSpec.onScrewShieldBlockedLines, rng),
      { category: colTitle, rival: challengerSpec.name },
    );
    const hostLine = fillTemplate(pickFrom(MAX_SCREW_SHIELD_BLOCK_LINES, rng), {
      rival: challengerSpec.name,
      category: colTitle,
    });

    return {
      board: nextBoard,
      triggered: true,
      blockedByScrewShield: true,
      targetTile,
      targetDomainId: targetTile.domainId,
      targetedPlayerWeakness: picked.targetedPlayerWeakness,
      rivalLine,
      hostLine,
      forcedReasonBanner: null,
      consumedRivalToken: true,
    };
  }

  // Rival Screw lands! Force player onto targetTile (weakest domain priority).
  const nextTiles = board.tiles.map((t) =>
    t.tileId === targetTile.tileId
      ? { ...t, forcedByRival: true }
      : t.forcedByRival
        ? { ...t, forcedByRival: false }
        : t,
  );

  const forcedReasonBanner = `RIVAL SCREW! ${challengerSpec.name} forced you onto "${colTitle}" (${targetTile.pointValue} PTS) — ${picked.weakLabel}!`;
  const nextBoard: StageBoardStateV5 = {
    ...board,
    tiles: nextTiles,
    forcedTileId: targetTile.tileId,
    forcedReasonBanner,
    rivalScrewTokensLeft: board.rivalScrewTokensLeft - 1,
    rivalScrewsDeployed: board.rivalScrewsDeployed + 1,
  };

  const rivalLine = fillTemplate(pickFrom(challengerSpec.onDeployScrewLines, rng), {
    category: colTitle,
    rival: challengerSpec.name,
  });
  const hostLine = fillTemplate(pickFrom(MAX_RIVAL_SCREW_LINES, rng), {
    rival: challengerSpec.name,
    category: colTitle,
    weakNote: picked.weakLabel,
  });

  return {
    board: nextBoard,
    triggered: true,
    blockedByScrewShield: false,
    targetTile: { ...targetTile, forcedByRival: true },
    targetDomainId: targetTile.domainId,
    targetedPlayerWeakness: picked.targetedPlayerWeakness,
    rivalLine,
    hostLine,
    forcedReasonBanner,
    consumedRivalToken: true,
  };
}

// ============================================================================
// 7. BALATRO-STYLE PODIUM LUCKY CHARM PIPELINE (`applyEquippedCharmsToTurn`)
// ============================================================================

export interface CharmTriggerRecordV5 {
  readonly charmId: CharmIdV5;
  readonly name: string;
  readonly effectTag: string;
  /** Positive bonus points granted (strictly included in netPointsDelta). */
  readonly pointsDelta: number;
  /** Penalty points prevented (e.g. Frankie's Coaster waiving missed 2x penalty). */
  readonly penaltySaved: number;
  readonly description: string;
}

export interface PreQuestionCharmModifiersV5 {
  readonly shotClockBonusSec: number;
  readonly autoEliminateWrongCount: number;
  readonly autoEliminatedChoiceIndex: number | null;
  readonly activeCharms: readonly CharmTriggerRecordV5[];
}

/**
 * Evaluates pre-question Podium Lucky Charms before the player answers:
 * - `alistairs_pocketwatch`: `+8s` Shot Clock on every timed clue
 * - `denises_red_pen`: auto-eliminates 1 wrong option on History (0) & Literature (10)
 */
export function getPreQuestionCharmModifiers(
  boardOrCharms: StageBoardStateV5 | readonly CharmIdV5[],
  context: {
    readonly domainId: DomainId;
    readonly format?: QuestionFormatV4;
    readonly choices?: readonly string[];
    readonly correctIndex?: number;
    readonly rng?: () => number;
  },
): PreQuestionCharmModifiersV5 {
  const equipped: readonly CharmIdV5[] =
    'charms' in boardOrCharms
      ? boardOrCharms.charms.equippedCharms
      : sanitizeEquippedCharmsV5(boardOrCharms);
  const rng = context.rng ?? Math.random;
  const activeCharms: CharmTriggerRecordV5[] = [];
  let shotClockBonusSec = 0;
  let autoEliminateWrongCount = 0;
  let autoEliminatedChoiceIndex: number | null = null;

  for (const charmId of equipped) {
    if (charmId === 'alistairs_pocketwatch') {
      shotClockBonusSec += CHARM_VALUES_V5.alistairsPocketwatchBonusSec;
      activeCharms.push({
        charmId,
        name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
        effectTag: `+${CHARM_VALUES_V5.alistairsPocketwatchBonusSec}s CLOCK`,
        pointsDelta: 0,
        penaltySaved: 0,
        description: `Alistair's Pocketwatch added +${CHARM_VALUES_V5.alistairsPocketwatchBonusSec}s to the Shot Clock.`,
      });
    } else if (charmId === 'denises_red_pen' && isHistoryOrLitDomainV5(context.domainId)) {
      autoEliminateWrongCount = 1;
      if (
        context.choices &&
        context.choices.length >= 2 &&
        typeof context.correctIndex === 'number'
      ) {
        const wrongIndices: number[] = [];
        for (let i = 0; i < context.choices.length; i++) {
          if (i !== context.correctIndex) wrongIndices.push(i);
        }
        if (wrongIndices.length > 0) {
          autoEliminatedChoiceIndex = pickFrom(wrongIndices, rng);
        }
      }
      activeCharms.push({
        charmId,
        name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
        effectTag: '-1 WRONG OPTION',
        pointsDelta: 0,
        penaltySaved: 0,
        description: "Denise's Red Pen crossed out 1 wrong answer on History/Literature.",
      });
    }
  }

  return {
    shotClockBonusSec,
    autoEliminateWrongCount,
    autoEliminatedChoiceIndex,
    activeCharms,
  };
}

export interface ApplyEquippedCharmsInputV5 {
  /** Base answer evaluation before v5 charm bonuses (e.g. from QuestionGeneratorV4 or ScoringV4). */
  readonly evalResult: EvaluatedAnswerV4;
  readonly tilePointValue: number;
  readonly tileTwist?: TileTwistKind;
  readonly domainId?: DomainId;
  readonly currentPlayerScore: number;
  readonly currentRivalScore?: number;
  readonly hasActiveRival?: boolean;
  /** Consecutive-hit streak entering this turn (`>= 1` triggers Trevor's Hot Mic `+75`). */
  readonly currentStreak?: number;
  readonly doubleDownArmed?: boolean;
  readonly powerPlayWager?: number | null;
  readonly wheelEffect?: WheelActiveEffectV4;
  /** Elapsed answer seconds (`<= 6` triggers Kenji's Cyber-Link `+150` on hit). */
  readonly elapsedSec?: number;
  /** Seconds left on the Shot Clock (`> 0 && <= 5` triggers Priya's Adrenaline `+120` on hit). */
  readonly secondsRemaining?: number;
  readonly timedOut?: boolean;
  readonly allowNegative?: boolean;
  /** Current charm runtime state (or plain equipped charm ID array for stateless checks). */
  readonly charms: CharmRuntimeStateV5 | readonly CharmIdV5[];
}

export interface ApplyEquippedCharmsResultV5 {
  readonly evaluated: EvaluatedAnswerV4;
  readonly baseScoreResolution: ScoreResolutionV4;
  readonly previousPlayerScore: number;
  readonly newPlayerScore: number;
  /** Exact 1:1 player score delta (`newPlayerScore === previousPlayerScore + playerDelta`). */
  readonly playerDelta: number;
  readonly previousRivalScore: number;
  readonly newRivalScore: number;
  readonly rivalDelta: number;
  readonly charmBonusPoints: number;
  readonly charmPenaltySaved: number;
  readonly triggeredCharms: readonly CharmTriggerRecordV5[];
  readonly nextCharmState: CharmRuntimeStateV5;
  readonly shotClockBonusSec: number;
  readonly deniseRedPenActive: boolean;
  readonly newStreak: number;
}

function normalizeCharmState(
  input: CharmRuntimeStateV5 | readonly CharmIdV5[],
): CharmRuntimeStateV5 {
  if ('equippedCharms' in input) {
    return input;
  }
  const equipped = sanitizeEquippedCharmsV5(input);
  return {
    equippedCharms: equipped,
    frankiesCoasterUsed: false,
    screwShieldChargesLeft: equipped.includes('screw_shield')
      ? CHARM_VALUES_V5.screwShieldCharges
      : 0,
    totalCharmBonusPoints: 0,
    totalCharmPenaltySaved: 0,
    triggerCounts: {},
  };
}

/**
 * Evaluates all equipped Podium Lucky Charms in deterministic left-to-right Balatro order
 * and reconciles the turn's score through `ScoringV4` with **strict 1:1 score conservation**:
 *
 * Invariants guaranteed on EVERY call:
 * 1. `evaluated.netPointsDelta === evaluated.basePoints + evaluated.bonusPoints + evaluated.wagerDeltaPoints`
 * 2. `playerDelta === evaluated.netPointsDelta`
 * 3. `newPlayerScore === previousPlayerScore + playerDelta`
 * 4. `newRivalScore === previousRivalScore + rivalDelta`
 */
export function applyEquippedCharmsToTurn(
  input: ApplyEquippedCharmsInputV5,
): ApplyEquippedCharmsResultV5 {
  const charmState = normalizeCharmState(input.charms);
  const equipped = charmState.equippedCharms;
  const hasCharm = (id: CharmIdV5): boolean => equipped.includes(id);

  const tilePointValue = Math.max(
    0,
    sanitizeInt(input.tilePointValue, NON_BOARD_BASE_POINTS_V4),
  );
  const tileTwist: TileTwistKind = input.tileTwist ?? 'NONE';
  const previousPlayerScore = sanitizeInt(input.currentPlayerScore, 0);
  const previousRivalScore = sanitizeInt(input.currentRivalScore, 0);
  const hasActiveRival = Boolean(input.hasActiveRival);
  const currentStreak = Math.max(0, Math.floor(input.currentStreak ?? 0));
  const isPowerPlay = input.powerPlayWager != null;
  const doubleDownArmed = !isPowerPlay && Boolean(input.doubleDownArmed);
  const wheelEffect: WheelActiveEffectV4 = input.wheelEffect ?? 'NONE';
  const allowNegative = Boolean(input.allowNegative);

  const triggeredCharms: CharmTriggerRecordV5[] = [];
  const nextTriggerCounts: Partial<Record<CharmIdV5, number>> = {
    ...charmState.triggerCounts,
  };
  const recordTrigger = (rec: CharmTriggerRecordV5): void => {
    triggeredCharms.push(rec);
    nextTriggerCounts[rec.charmId] = (nextTriggerCounts[rec.charmId] ?? 0) + 1;
  };

  // 1. Check Frankie's Coaster BEFORE computing final miss penalty (1st missed 2x per match = 0 penalty!)
  let nextFrankiesCoasterUsed = charmState.frankiesCoasterUsed;
  let charmPenaltySaved = 0;
  let effectiveDoubleDownArmed = doubleDownArmed;

  if (
    !input.evalResult.isCorrect &&
    doubleDownArmed &&
    hasCharm('frankies_coaster') &&
    !charmState.frankiesCoasterUsed
  ) {
    // Compute exact penalty saved (respecting score floor if !allowNegative)
    const rawDdPenalty = Math.round(tilePointValue * DOUBLE_DOWN_MISS_FRACTION_V4);
    const unshieldedRes = reconcileEvaluatedAnswerForBoard({
      evalResult: input.evalResult,
      tilePointValue,
      tileTwist,
      currentPlayerScore: previousPlayerScore,
      currentRivalScore: previousRivalScore,
      hasActiveRival,
      currentStreak,
      doubleDownArmed: true,
      powerPlayWager: null,
      wheelEffect,
      allowNegative,
    });
    const shieldedRes = reconcileEvaluatedAnswerForBoard({
      evalResult: input.evalResult,
      tilePointValue,
      tileTwist,
      currentPlayerScore: previousPlayerScore,
      currentRivalScore: previousRivalScore,
      hasActiveRival,
      currentStreak,
      doubleDownArmed: false,
      powerPlayWager: null,
      wheelEffect,
      allowNegative,
    });
    const actualSaved = Math.max(0, shieldedRes.playerDelta - unshieldedRes.playerDelta);
    charmPenaltySaved = actualSaved > 0 ? actualSaved : rawDdPenalty;
    effectiveDoubleDownArmed = false;
    nextFrankiesCoasterUsed = true;

    recordTrigger({
      charmId: 'frankies_coaster',
      name: PODIUM_CHARMS_CATALOG_V5.frankies_coaster.name,
      effectTag: '2x PENALTY WAIVED',
      pointsDelta: 0,
      penaltySaved: charmPenaltySaved,
      description: `Frankie's Coaster absorbed your first missed 2x Double Down (${charmPenaltySaved} PTS saved)!`,
    });
  }

  // 2. Reconcile authoritative base ScoringV4 resolution (handles base, streak, 2x, Power Play, Wheel, Bounty)
  const baseRes = reconcileEvaluatedAnswerForBoard({
    evalResult: input.evalResult,
    tilePointValue,
    tileTwist,
    currentPlayerScore: previousPlayerScore,
    currentRivalScore: previousRivalScore,
    hasActiveRival,
    currentStreak,
    doubleDownArmed: effectiveDoubleDownArmed,
    powerPlayWager: input.powerPlayWager ?? null,
    wheelEffect,
    allowNegative,
  });

  // 3. Evaluate all offensive / situational Podium Lucky Charms in left-to-right equipped order
  let charmBonusPoints = 0;
  const charmBreakdownParts: string[] = [];

  if (charmPenaltySaved > 0) {
    charmBreakdownParts.push(`Frankie's Coaster saved ${charmPenaltySaved} DD penalty`);
  }

  if (baseRes.evaluated.isCorrect) {
    for (const charmId of equipped) {
      switch (charmId) {
        case 'trevors_hot_mic': {
          // +75 streak heat when answering correctly on an active streak (streak >= 1 entering turn)
          if (currentStreak >= 1) {
            const pts = CHARM_VALUES_V5.trevorsHotMicBonus;
            charmBonusPoints += pts;
            charmBreakdownParts.push(`+${pts} Trevor's Hot Mic`);
            recordTrigger({
              charmId,
              name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
              effectTag: `+${pts} STREAK HEAT`,
              pointsDelta: pts,
              penaltySaved: 0,
              description: `Trevor's Hot Mic fired on a ${currentStreak + 1}-answer streak (+${pts} PTS)!`,
            });
          }
          break;
        }

        case 'priyas_adrenaline': {
          // +120 clutch bonus when answered with <= 5s left (and not timed out)
          if (
            !input.timedOut &&
            typeof input.secondsRemaining === 'number' &&
            Number.isFinite(input.secondsRemaining) &&
            input.secondsRemaining >= 0 &&
            input.secondsRemaining <= CHARM_VALUES_V5.priyasAdrenalineMaxSecRemaining
          ) {
            const pts = CHARM_VALUES_V5.priyasAdrenalineBonus;
            charmBonusPoints += pts;
            charmBreakdownParts.push(`+${pts} Priya's Adrenaline`);
            recordTrigger({
              charmId,
              name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
              effectTag: `+${pts} CLUTCH`,
              pointsDelta: pts,
              penaltySaved: 0,
              description: `Priya's Adrenaline surged with ${input.secondsRemaining.toFixed(1)}s left (+${pts} PTS)!`,
            });
          }
          break;
        }

        case 'kenjis_cyber_link': {
          // +150 fast-lock bonus when answered in under 6s
          if (
            typeof input.elapsedSec === 'number' &&
            Number.isFinite(input.elapsedSec) &&
            input.elapsedSec >= 0 &&
            input.elapsedSec <= CHARM_VALUES_V5.kenjisCyberLinkMaxElapsedSec
          ) {
            const pts = CHARM_VALUES_V5.kenjisCyberLinkBonus;
            charmBonusPoints += pts;
            charmBreakdownParts.push(`+${pts} Kenji's Cyber-Link`);
            recordTrigger({
              charmId,
              name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
              effectTag: `+${pts} FAST LOCK`,
              pointsDelta: pts,
              penaltySaved: 0,
              description: `Kenji's Cyber-Link locked in ${input.elapsedSec.toFixed(1)}s (+${pts} PTS)!`,
            });
          }
          break;
        }

        case 'nadias_astrolabe': {
          // +150 bonus on Crown Wedge tiles
          if (tileTwist === 'CROWN_WEDGE') {
            const pts = CHARM_VALUES_V5.nadiasAstrolabeWedgeBonus;
            charmBonusPoints += pts;
            charmBreakdownParts.push(`+${pts} Nadia's Astrolabe`);
            recordTrigger({
              charmId,
              name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
              effectTag: `+${pts} WEDGE BONUS`,
              pointsDelta: pts,
              penaltySaved: 0,
              description: `Nadia's Astrolabe aligned on a Crown Wedge tile (+${pts} PTS)!`,
            });
          }
          break;
        }

        case 'syndicate_golden_dice': {
          // +25% Power Play payout on winning a Power Play wager
          const wagerForDice =
            baseRes.effectivePowerPlayWager != null && baseRes.effectivePowerPlayWager > 0
              ? baseRes.effectivePowerPlayWager
              : tileTwist === 'POWER_PLAY'
                ? Math.max(tilePointValue, baseRes.evaluated.basePoints)
                : 0;
          if (wagerForDice > 0) {
            const pts = Math.round(
              wagerForDice * CHARM_VALUES_V5.syndicateGoldenDicePowerPlayRate,
            );
            if (pts > 0) {
              charmBonusPoints += pts;
              charmBreakdownParts.push(`+${pts} Syndicate Golden Dice`);
              recordTrigger({
                charmId,
                name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
                effectTag: `+${pts} POWER PLAY +25%`,
                pointsDelta: pts,
                penaltySaved: 0,
                description: `Syndicate Golden Dice boosted your Power Play payout by +25% (+${pts} PTS)!`,
              });
            }
          }
          break;
        }

        case 'underdog_chip': {
          // +100 comeback bonus when trailing rival entering the turn
          if (hasActiveRival && previousPlayerScore < previousRivalScore) {
            const pts = CHARM_VALUES_V5.underdogChipTrailingBonus;
            charmBonusPoints += pts;
            charmBreakdownParts.push(`+${pts} Underdog Chip`);
            recordTrigger({
              charmId,
              name: PODIUM_CHARMS_CATALOG_V5[charmId].name,
              effectTag: `+${pts} COMEBACK`,
              pointsDelta: pts,
              penaltySaved: 0,
              description: `Underdog Chip sparked while trailing the Rival (+${pts} PTS)!`,
            });
          }
          break;
        }

        default:
          break;
      }
    }
  }

  // 4. Re-assemble strictly 1:1 conserved EvaluatedAnswerV4 + score totals
  const basePoints = baseRes.evaluated.basePoints;
  const bonusPoints = baseRes.evaluated.bonusPoints + charmBonusPoints;
  let wagerDeltaPoints = baseRes.evaluated.wagerDeltaPoints;

  const rawNetDelta = basePoints + bonusPoints + wagerDeltaPoints;
  const applied = applyScoreDelta(previousPlayerScore, rawNetDelta, allowNegative);
  if (applied.wasClampedAtZero) {
    wagerDeltaPoints += applied.appliedDelta - rawNetDelta;
  }

  const netPointsDelta = basePoints + bonusPoints + wagerDeltaPoints;
  const newPlayerScore = previousPlayerScore + netPointsDelta;
  const detailBreakdown =
    charmBreakdownParts.length > 0
      ? `${baseRes.evaluated.detailBreakdown} | ${charmBreakdownParts.join(' | ')}`
      : baseRes.evaluated.detailBreakdown;

  const evaluated: EvaluatedAnswerV4 = {
    ...baseRes.evaluated,
    basePoints,
    bonusPoints,
    wagerDeltaPoints,
    netPointsDelta,
    detailBreakdown,
  };

  const nextCharmState: CharmRuntimeStateV5 = {
    ...charmState,
    frankiesCoasterUsed: nextFrankiesCoasterUsed,
    totalCharmBonusPoints: charmState.totalCharmBonusPoints + charmBonusPoints,
    totalCharmPenaltySaved: charmState.totalCharmPenaltySaved + charmPenaltySaved,
    triggerCounts: nextTriggerCounts,
  };

  return {
    evaluated,
    baseScoreResolution: baseRes,
    previousPlayerScore,
    newPlayerScore,
    playerDelta: netPointsDelta,
    previousRivalScore,
    newRivalScore: baseRes.newRivalScore,
    rivalDelta: baseRes.rivalDelta,
    charmBonusPoints,
    charmPenaltySaved,
    triggeredCharms,
    nextCharmState,
    shotClockBonusSec: hasCharm('alistairs_pocketwatch')
      ? CHARM_VALUES_V5.alistairsPocketwatchBonusSec
      : 0,
    deniseRedPenActive:
      hasCharm('denises_red_pen') &&
      input.domainId !== undefined &&
      isHistoryOrLitDomainV5(input.domainId),
    newStreak: baseRes.newStreak,
  };
}

// ============================================================================
// 8. FULL V5 TURN WRAPPERS (`resolveTileResultV5`, `runChallengerTurnV5`, etc.)
// ============================================================================

export interface ResolveTileOptionsV5 extends ResolveTileOptionsV4 {
  readonly elapsedSec?: number;
  readonly secondsRemaining?: number;
  readonly timedOut?: boolean;
}

export interface ResolveTileOutcomeV5 extends Omit<ResolveTileOutcomeV4, 'board'> {
  readonly board: StageBoardStateV5;
  readonly charmResult: ApplyEquippedCharmsResultV5;
  readonly lineSweepJackpots: readonly LineSweepJackpotEntryV5[];
  readonly lineSweepJackpotPoints: number;
  readonly lineSweepUnlockedWedges: readonly WedgeColorId[];
  /** Exact 1:1 delta for the question turn alone (including charms, before line sweep). */
  readonly turnPlayerScoreDelta: number;
  /** Exact 1:1 total player score delta (`turnPlayerScoreDelta + lineSweepJackpotPoints`). */
  readonly totalPlayerScoreDelta: number;
  readonly previousPlayerScore: number;
  readonly newPlayerScore: number;
}

/**
 * Atomic v5 tile turn resolver uniting:
 * 1. `applyEquippedCharmsToTurn` (all 12 Podium Lucky Charms + `ScoringV4` 1:1 math)
 * 2. `BoardEngine.resolveTileResult` (neighbor padlock shattering, wedges, freezes, anti-soft-lock Stage Surge)
 * 3. `checkLineSweepJackpots` (`+300 PTS` + uncollected Wedge for every newly completed Row / Column)
 *
 * Strictly guarantees `outcome.newPlayerScore === outcome.previousPlayerScore + outcome.totalPlayerScoreDelta`.
 */
export function resolveTileResultV5(
  board: StageBoardStateV5,
  tileId: string,
  evalResult: EvaluatedAnswerV4,
  options: ResolveTileOptionsV5 = {},
): ResolveTileOutcomeV5 {
  const targetTile = getTileById(board, tileId);
  if (!targetTile) {
    throw new Error(`StageBoardRulesV5.resolveTileResultV5: unknown tileId "${tileId}"`);
  }

  const previousPlayerScore = sanitizeInt(board.playerScore, 0);

  // 1. Resolve ScoringV4 + all equipped Podium Lucky Charms
  const charmResult = applyEquippedCharmsToTurn({
    evalResult,
    tilePointValue: targetTile.pointValue,
    tileTwist: targetTile.twist,
    domainId: targetTile.domainId,
    currentPlayerScore: previousPlayerScore,
    currentRivalScore: board.rivalScore,
    hasActiveRival: board.hasActiveRival,
    currentStreak: options.currentStreak ?? 0,
    doubleDownArmed: options.doubleDownArmed ?? false,
    powerPlayWager: options.powerPlayWager ?? null,
    wheelEffect: options.wheelEffect ?? 'NONE',
    elapsedSec: options.elapsedSec,
    secondsRemaining: options.secondsRemaining,
    timedOut: options.timedOut,
    allowNegative: options.allowNegative ?? false,
    charms: board.charms,
  });

  // 2. Delegate spatial board mechanics & anti-soft-lock surge to BoardEngine.resolveTileResult
  const v4Outcome = resolveTileResult(board, tileId, charmResult.evaluated, {
    currentStreak: options.currentStreak ?? 0,
    allowNegative: options.allowNegative ?? false,
    rng: options.rng,
    evalResultIsFinalized: true,
    precomputedRivalDelta: charmResult.rivalDelta,
  });

  let nextBoard: StageBoardStateV5 = {
    ...board,
    ...v4Outcome.board,
    charms: charmResult.nextCharmState,
  };

  // 3. Check Row & Column Stage Sweep Jackpots when the player wins the closing tile
  let lineSweepJackpots: readonly LineSweepJackpotEntryV5[] = [];
  let lineSweepJackpotPoints = 0;
  let lineSweepUnlockedWedges: readonly WedgeColorId[] = [];
  if (charmResult.evaluated.isCorrect) {
    const sweepRes = checkLineSweepJackpots(nextBoard, tileId);
    nextBoard = sweepRes.board;
    lineSweepJackpots = sweepRes.jackpots;
    lineSweepJackpotPoints = sweepRes.totalPointsAwarded;
    lineSweepUnlockedWedges = sweepRes.newlyUnlockedWedges;
  }

  const turnPlayerScoreDelta = v4Outcome.playerScoreDelta;
  const totalPlayerScoreDelta = turnPlayerScoreDelta + lineSweepJackpotPoints;

  return {
    ...v4Outcome,
    board: nextBoard,
    playerScoreDelta: totalPlayerScoreDelta,
    turnPlayerScoreDelta,
    totalPlayerScoreDelta,
    previousPlayerScore,
    newPlayerScore: nextBoard.playerScore,
    bountyPlayerDelta: charmResult.baseScoreResolution.bountyPlayerDelta,
    bountyRivalDelta: charmResult.baseScoreResolution.bountyRivalDelta,
    awardedWedge: v4Outcome.awardedWedge ?? lineSweepUnlockedWedges[0] ?? null,
    charmResult,
    lineSweepJackpots,
    lineSweepJackpotPoints,
    lineSweepUnlockedWedges,
  };
}

export interface ChallengerTurnResultV5 extends Omit<ChallengerTurnResultV4, 'board'> {
  readonly board: StageBoardStateV5;
  readonly rivalScrewResult: RivalScrewResultV5 | null;
  readonly blockedFreezeByScrewShield: boolean;
}

/**
 * Runs a complete v5 Challenger AI turn:
 * 1. First checks strategic Rival Screw deployment (`maybeTriggerRivalScrew`, respecting `screw_shield`)
 * 2. Otherwise executes `ChallengerAI.runChallengerTurn`, also letting `screw_shield` intercept
 *    a Rival `FREEZE_FAVORITE_COLUMN` attack once per match!
 */
export function runChallengerTurnV5(
  board: StageBoardStateV5,
  challengerProfile: ChallengerProfileV4,
  playerStats?: PlayerStatProfileForHost | null,
  rng: () => number = Math.random,
): ChallengerTurnResultV5 {
  if (board.isBoardComplete || !board.hasActiveRival) {
    const v4Idle = runChallengerTurn(board, challengerProfile, playerStats, rng);
    return {
      ...v4Idle,
      board,
      rivalScrewResult: null,
      blockedFreezeByScrewShield: false,
    };
  }

  // 1. Check Rival's strategic Screw token deployment
  const screwAttempt = maybeTriggerRivalScrew(board, {
    challenger: challengerProfile,
    playerStats,
    rng,
  });
  if (screwAttempt.triggered) {
    return {
      board: screwAttempt.board,
      action: {
        moveKind: 'FORCE_WEAK_TILE',
        targetTileId: screwAttempt.targetTile?.tileId,
        targetColIndex: screwAttempt.targetTile?.colIndex,
        rivalPointsDelta: 0,
        rivalSucceeded: !screwAttempt.blockedByScrewShield,
        banterLine:
          screwAttempt.rivalLine ??
          screwAttempt.hostLine ??
          `${challengerProfile.name} deployed a Rival Screw!`,
      },
      forcedByStageSpotlight: false,
      usedPlayerWeaknessStats: screwAttempt.targetedPlayerWeakness,
      usedPlayerFavoriteStats: false,
      unlockedTileIds: [],
      awardedRivalWedge: null,
      stageSurgeTriggered: false,
      stageSurgeUnlockedIds: [],
      rivalScrewResult: screwAttempt,
      blockedFreezeByScrewShield: false,
    };
  }

  // 2. Run standard ChallengerAI turn
  const v4Turn = runChallengerTurn(board, challengerProfile, playerStats, rng);

  // 3. Intercept Rival Column Freeze if player holds an active `screw_shield` charge!
  if (
    v4Turn.action.moveKind === 'FREEZE_FAVORITE_COLUMN' &&
    board.charms.screwShieldChargesLeft > 0
  ) {
    const prevCount = board.charms.triggerCounts.screw_shield ?? 0;
    const targetColIndex = v4Turn.action.targetColIndex;
    const colTitle =
      targetColIndex !== undefined
        ? (board.columns[targetColIndex]?.wittyTitle ?? 'your favorite column')
        : 'your favorite column';
    const shieldedBoard: StageBoardStateV5 = {
      ...board,
      rivalScrewsBlockedByShield: board.rivalScrewsBlockedByShield + 1,
      charms: {
        ...board.charms,
        screwShieldChargesLeft: board.charms.screwShieldChargesLeft - 1,
        triggerCounts: {
          ...board.charms.triggerCounts,
          screw_shield: prevCount + 1,
        },
      },
    };
    return {
      ...v4Turn,
      board: shieldedBoard,
      action: {
        ...v4Turn.action,
        rivalSucceeded: false,
        banterLine: `SCREW SHIELD BLOCKED IT! ${challengerProfile.name} tried to freeze "${colTitle}", and your podium shield shattered the ice!`,
      },
      unlockedTileIds: [],
      stageSurgeTriggered: false,
      stageSurgeUnlockedIds: [],
      rivalScrewResult: null,
      blockedFreezeByScrewShield: true,
    };
  }

  return {
    ...v4Turn,
    board: {
      ...board,
      ...v4Turn.board,
    },
    rivalScrewResult: null,
    blockedFreezeByScrewShield: false,
  };
}

/**
 * Spins the 6-slice Show Wheel while preserving all `StageBoardStateV5` fields cleanly.
 */
export function spinCurveballWheelV5(
  board: StageBoardStateV5,
  rng: () => number = Math.random,
  forcedOutcome?: WheelSliceOutcome,
): Omit<WheelSpinResultV4, 'board'> & { readonly board: StageBoardStateV5 } {
  const res = spinCurveballWheel(board, rng, forcedOutcome);
  return {
    ...res,
    board: {
      ...board,
      ...res.board,
    },
  };
}

/**
 * Consumes a 50/50 or Clue coin lifeline while preserving `StageBoardStateV5` and
 * tracking `lifelinesUsedCount` for the `NO_LIFELINES_USED` Showman Dare.
 */
export function consumeBoardLifelineV5(
  board: StageBoardStateV5,
  kind: '5050' | 'HINT',
): { readonly board: StageBoardStateV5; readonly consumed: boolean } {
  const res = consumeBoardLifeline(board, kind);
  if (!res.consumed) {
    return { board, consumed: false };
  }
  return {
    board: {
      ...board,
      ...res.board,
      lifelinesUsedCount: board.lifelinesUsedCount + 1,
    },
    consumed: true,
  };
}
