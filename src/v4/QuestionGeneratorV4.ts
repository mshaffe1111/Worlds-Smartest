// ============================================================================
// WORLD'S SMARTEST v4.0 — 7-FORMAT QUESTION GENERATOR & HONEST EVALUATOR
// Combines curated_v4_witty_pack.json + Jeopardy Signature + Gold Venue +
// Visual/Globe + Clean Gold Core FIRST, then scales seamlessly across 500k+
// fame-gated, game-show-rewritten structured fact shards across ALL 7 formats!
// ============================================================================

import { forgeEngine, type ForgeEngine } from '../forge/ForgeEngine';
import {
  DeterministicRng,
  approxGreatCircleKm,
  decodeShardRawQuestion,
  fnv1a32,
  formatCleanTriviaNumber,
  hasRoboticWhyExplanation,
  isBenchmarkOrExamSlop,
  isCleanShardCandidate,
  isShardRowFamousEnoughForTier,
  normalizeToPrismQuestion,
  normalizeVisualAssetUrl,
  pickRegionalGlobeDecoys,
  sanitizeTriviaCopy,
  sharedCryptoRng,
  type RngLike,
} from '../forge/ShardDecoder';
import {
  doesCandidateMatchDifficultyPreset,
  getAcademicTierSpec,
  scoreQuestionDifficulty,
} from '../forge/QuestionDifficultyCalibration';
import {
  getForgeDomainInfo,
  type DomainId,
  type PrismQuestion,
  type RawQuestionRecord,
  type ShardChunkData,
  type ShardManifest,
  type ShardTableTypeSpec,
} from '../forge/types';
import {
  WEDGE_CATALOG_V4,
  domainToWedgeColor,
  type AnswerSubmissionV4,
  type ClueEscalatorSpec,
  type EvaluatedAnswerV4,
  type Match4PairItem,
  type MultiStrikeOption,
  type PinpointDialSpec,
  type QuestionCardV4,
  type QuestionFormatV4,
  type Sort4CardItem,
  type VisualSpotterSpec,
  type WedgeColorId,
} from './contracts';

export type DifficultyTierV4 = QuestionCardV4['difficultyTier'];

export const ALL_QUESTION_FORMATS_V4: readonly QuestionFormatV4[] = [
  'MULTIPLE_CHOICE',
  'MATCH_4',
  'SORT_4',
  'MULTI_STRIKE',
  'PINPOINT_DIAL',
  'CLUE_ESCALATOR',
  'VISUAL_SPOTTER',
];

export interface DrawQuestionCardV4Options {
  readonly format?: QuestionFormatV4;
  readonly allowedFormats?: readonly QuestionFormatV4[];
  readonly domainId?: DomainId;
  readonly subcategoryId?: string;
  readonly wedgeId?: WedgeColorId;
  readonly difficultyTier?: DifficultyTierV4;
  readonly isLightningBlitz?: boolean;
  readonly excludeQids?: ReadonlySet<number> | ReadonlyArray<number>;
  readonly seed?: number;
  readonly engine?: ForgeEngine;
  /** Prefer dynamic shard synthesis (e.g. for Endless deep runs or 500k+ corpus scale audits) */
  readonly preferDynamicShards?: boolean;
}

const WITTY_HEADERS_BY_DOMAIN: Readonly<Record<DomainId, readonly string[]>> = {
  0: ['History’s Plot Twists', 'Crown & Chaos', 'Before It Was Cool', 'Famous Last Moves', 'Time-Machine Check'],
  1: ['Mad Science Weekly', 'Cosmic Flex', 'Lab Coat Required', 'Gravity’s Fault', 'Elementary, Actually'],
  2: ['No GPS Allowed', 'Passport Stamp', 'Geography Dropouts', 'Where on Earth?', 'Borderline Genius'],
  3: ['Museum Heist', 'Masterpiece Theater', 'Architectural Flex', 'Frame It!', 'Gallery Gossip'],
  4: ['Pop Goes the Buzzer', 'Cue the Soundtrack', 'Box Office Gold', 'Chart Toppers', 'Roll Credits'],
  5: ['Buzzer Beater', 'Hall of Fame Heat', 'Instant Replay', 'Rulebook Check', 'Championship Form'],
  6: ['Ctrl+Alt+Genius', 'Silicon Legends', 'Patent Pending', 'Byte-Sized Brilliance', 'Reboot Required'],
  7: ['Wild Kingdom Flex', 'Mother Nature’s Tricks', 'Survival of the Wittiest', 'Creature Feature', 'Eco-Logic'],
  8: ['Wait, That’s Legal?', 'Gavel & Globe', 'Summit Showdown', 'Courtroom Drama', 'Treaty Table'],
  9: ['Chef’s Kiss', 'Check, Please!', 'Craft & Craving', 'Secret Ingredient', 'Design Classics'],
  10: ['Plot Twist!', 'Myth-Busted', 'Page Turners', 'Olympus Calling', 'Read Between the Lines'],
  11: ['Do the Math', 'Brain Freeze', 'Logic Trap', 'Checkmate Moment', 'Numbers Don’t Lie'],
};

const WITTY_FORMAT_HEADERS: Readonly<Record<QuestionFormatV4, readonly string[]>> = {
  MULTIPLE_CHOICE: ['Spotlight Showdown', 'Four-Way Faceoff', 'Classic Buzzer', 'Lock It In'],
  MATCH_4: ['Perfect Pairs', 'Connect the Dots', 'Matchmaker Live', 'Link Up Four'],
  SORT_4: ['Put ’Em in Order', 'Timeline Scramble', 'Rank & File', 'Stack the Deck'],
  MULTI_STRIKE: ['Spot the Fake', 'Truth Squad', 'Imposter Alert', 'Fact Check Frenzy'],
  PINPOINT_DIAL: ['Dial It In', 'Closest Without Panic', 'Bullseye Territory', 'Zero In'],
  CLUE_ESCALATOR: ['Three-Clue Gamble', 'Call It Early', 'Escalator Stakes', 'Read the Room'],
  VISUAL_SPOTTER: ['Eyes on the Stage', 'Blueprint Check', 'Picture Perfect', 'Spot the Target'],
};

export function pickWittyHeaderForCard(
  domainId: DomainId,
  categoryLabel: string,
  format: QuestionFormatV4,
  seed: number,
): string {
  const domPool = WITTY_HEADERS_BY_DOMAIN[domainId] ?? WITTY_HEADERS_BY_DOMAIN[0];
  const fmtPool = WITTY_FORMAT_HEADERS[format] ?? WITTY_FORMAT_HEADERS.MULTIPLE_CHOICE;
  const h = fnv1a32(`WITTY_HDR:${domainId}:${format}:${categoryLabel}:${seed}`);
  return (h & 3) === 0 ? fmtPool[(h >>> 2) % fmtPool.length] : domPool[(h >>> 2) % domPool.length];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function countWords(text: string): number {
  return String(text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function resolveCellValue(
  row: ReadonlyArray<string | number>,
  colIdx: number,
  poolCols: ReadonlySet<number>,
  pool: ReadonlyArray<string>,
): string {
  if (colIdx < 0 || colIdx >= row.length) return '';
  const raw = row[colIdx];
  if (poolCols.has(colIdx)) {
    const idx = Number(raw);
    return idx >= 0 && idx < pool.length ? pool[idx] : '';
  }
  return String(raw ?? '');
}

/** Ensures a 4-item array is deranged away from `canonicalIds` (never identical to [0,1,2,3]!). */
function derange4<T>(items: readonly [T, T, T, T], getId: (item: T) => string, rng: RngLike): [T, T, T, T] {
  const out: T[] = [...items];
  const canonical = items.map(getId);
  for (let attempt = 0; attempt < 16; attempt++) {
    rng.shuffleInPlace(out);
    const sameCount = out.reduce((acc, el, idx) => acc + (getId(el) === canonical[idx] ? 1 : 0), 0);
    if (sameCount === 0) {
      return [out[0], out[1], out[2], out[3]];
    }
  }
  // Guaranteed cyclic derangement if random shuffles landed a fixed point
  return [items[1], items[2], items[3], items[0]];
}

function isCleanCardText(card: QuestionCardV4): boolean {
  if (!card.prompt || !card.funFactWhy || !card.helpfulHint) return false;
  if (
    isBenchmarkOrExamSlop({
      qid: card.qid,
      l0Domain: card.domainId,
      prompt: card.prompt,
      whyExplanation: card.funFactWhy,
    })
  ) {
    return false;
  }
  if (hasRoboticWhyExplanation(card.funFactWhy)) {
    return false;
  }
  return true;
}

/**
 * Compact 7-format emergency sync fallback deck (1 card per format, 0ms instant availability
 * before any JSON fetch completes — keeps entry JS bundle tiny!).
 */
const EMERGENCY_FALLBACK_CARDS_V4: readonly QuestionCardV4[] = [
  {
    qid: 1_099_901,
    format: 'MULTIPLE_CHOICE',
    domainId: 1,
    wedgeId: 'EMERALD_SCIENCE',
    categoryLabel: 'Space Exploration',
    wittyHeader: 'One Giant Leap',
    difficultyTier: 'MIDDLE_SCHOOL',
    recommendedSec: 28,
    readInGraceSec: 2.0,
    prompt: 'Which Apollo 11 astronaut stayed in lunar orbit aboard Columbia while Neil and Buzz walked on the Moon?',
    funFactWhy: 'Michael Collins circled the Moon alone for over 21 hours—losing radio contact on every pass behind the far side.',
    helpfulHint: 'His surname shares a name with a classic gin-and-lemon cocktail.',
    choices: ['Michael Collins', 'Jim Lovell', 'Alan Shepard', 'John Glenn'],
    correctIndex: 0,
  },
  {
    qid: 1_099_902,
    format: 'MATCH_4',
    domainId: 2,
    wedgeId: 'SAPPHIRE_GEO',
    categoryLabel: 'World Landmarks',
    wittyHeader: 'No GPS Allowed',
    difficultyTier: 'MIDDLE_SCHOOL',
    recommendedSec: 35,
    readInGraceSec: 2.0,
    prompt: 'Match each world-famous landmark to its home country.',
    funFactWhy: 'All four monuments rank among the most photographed heritage sites on Earth, spanning four continents.',
    helpfulHint: 'Pair the sandstone desert city with Jordan and the mountain citadel with Peru first.',
    match4: {
      instruction: 'Pair each landmark with its country',
      pairs: [
        { pairId: 'p1', leftPrompt: 'Machu Picchu', rightAnswer: 'Peru' },
        { pairId: 'p2', leftPrompt: 'Petra', rightAnswer: 'Jordan' },
        { pairId: 'p3', leftPrompt: 'Angkor Wat', rightAnswer: 'Cambodia' },
        { pairId: 'p4', leftPrompt: 'Colosseum', rightAnswer: 'Italy' },
      ],
      shuffledRight: [
        { pairId: 'p3', text: 'Cambodia' },
        { pairId: 'p1', text: 'Peru' },
        { pairId: 'p4', text: 'Italy' },
        { pairId: 'p2', text: 'Jordan' },
      ],
    },
  },
  {
    qid: 1_099_903,
    format: 'SORT_4',
    domainId: 0,
    wedgeId: 'GOLD_HISTORY',
    categoryLabel: 'Modern Milestones',
    wittyHeader: 'Timeline Scramble',
    difficultyTier: 'MIDDLE_SCHOOL',
    recommendedSec: 30,
    readInGraceSec: 2.0,
    prompt: 'Stack these four historic breakthroughs from earliest year to latest year.',
    funFactWhy: 'Less than 66 years separated the Wright brothers’ 12-second hop at Kitty Hawk from footprints on the Moon.',
    helpfulHint: 'Start with powered flight at the dawn of the 1900s and finish with the fall of a famous Cold War wall.',
    sort4: {
      orderDirectionLabel: 'Earliest Year -> Latest Year',
      correctOrder: [
        { itemId: 's1', label: 'Wright Brothers’ First Flight', numericValue: 1903, formattedValue: '1903' },
        { itemId: 's2', label: 'Penicillin Discovered', numericValue: 1928, formattedValue: '1928' },
        { itemId: 's3', label: 'Apollo 11 Moon Landing', numericValue: 1969, formattedValue: '1969' },
        { itemId: 's4', label: 'Fall of the Berlin Wall', numericValue: 1989, formattedValue: '1989' },
      ],
      initialOrder: [
        { itemId: 's3', label: 'Apollo 11 Moon Landing', numericValue: 1969, formattedValue: '1969' },
        { itemId: 's1', label: 'Wright Brothers’ First Flight', numericValue: 1903, formattedValue: '1903' },
        { itemId: 's4', label: 'Fall of the Berlin Wall', numericValue: 1989, formattedValue: '1989' },
        { itemId: 's2', label: 'Penicillin Discovered', numericValue: 1928, formattedValue: '1928' },
      ],
    },
  },
  {
    qid: 1_099_904,
    format: 'MULTI_STRIKE',
    domainId: 7,
    wedgeId: 'EMERALD_SCIENCE',
    categoryLabel: 'Animal Kingdom',
    wittyHeader: 'Imposter Alert',
    difficultyTier: 'MIDDLE_SCHOOL',
    recommendedSec: 28,
    readInGraceSec: 2.0,
    prompt: 'Three of these creatures are true mammals—tap the 1 imposter!',
    funFactWhy: 'Whale sharks are the largest living fish on Earth, breathing through gills rather than surfacing for air.',
    helpfulHint: 'One of these ocean giants has gills instead of lungs.',
    multiStrike: {
      strikeMode: 'SPOT_THE_IMPOSTER',
      targetCount: 1,
      options: [
        { optionId: 'o1', label: 'Blue Whale', isTarget: false },
        { optionId: 'o2', label: 'Platypus', isTarget: false },
        { optionId: 'o3', label: 'Whale Shark', isTarget: true },
        { optionId: 'o4', label: 'Fruit Bat', isTarget: false },
      ],
    },
  },
  {
    qid: 1_099_905,
    format: 'PINPOINT_DIAL',
    domainId: 6,
    wedgeId: 'EMERALD_SCIENCE',
    categoryLabel: 'Internet History',
    wittyHeader: 'Dial It In',
    difficultyTier: 'HIGH_SCHOOL',
    recommendedSec: 28,
    readInGraceSec: 2.0,
    prompt: 'In what year did Tim Berners-Lee submit the CERN proposal that launched the World Wide Web?',
    funFactWhy: 'His boss famously scribbled "Vague, but exciting..." on the March 1989 cover page of the Web’s birth certificate.',
    helpfulHint: 'Think of the final year of the 1980s—the same year the Berlin Wall fell.',
    pinpoint: {
      minVal: 1965,
      maxVal: 2010,
      step: 1,
      exactVal: 1989,
      unitLabel: '',
      bullseyeRadius: 2,
      winRadius: 6,
    },
  },
  {
    qid: 1_099_906,
    format: 'CLUE_ESCALATOR',
    domainId: 3,
    wedgeId: 'VIOLET_ARTS',
    categoryLabel: 'Masterpieces',
    wittyHeader: 'Frame It!',
    difficultyTier: 'MIDDLE_SCHOOL',
    recommendedSec: 32,
    readInGraceSec: 2.0,
    prompt: 'Name the famous painting revealed across these three escalating clues.',
    funFactWhy: 'A 1911 theft by a Louvre handyman turned Leonardo da Vinci’s modest poplar-wood portrait into the planet’s most famous painting.',
    helpfulHint: 'Picture an enigmatic smile behind bulletproof glass in Paris.',
    escalator: {
      clues: [
        'Painted on a small poplar panel in Florence around 1503, it vanished from its museum wall for two years in 1911.',
        'Its subject sits before a misty alpine backdrop rendered in smoky sfumato shading with no visible eyebrows.',
        'Leonardo da Vinci’s iconic portrait of Lisa Gherardini is the crown jewel of the Louvre.',
      ],
      choices: ['Mona Lisa', 'Girl with a Pearl Earring', 'The Birth of Venus', 'Las Meninas'],
      correctIndex: 0,
    },
  },
  {
    qid: 1_099_907,
    format: 'VISUAL_SPOTTER',
    domainId: 5,
    wedgeId: 'ORANGE_SPORTS',
    categoryLabel: 'Ballpark Blueprints',
    wittyHeader: 'Blueprint Check',
    difficultyTier: 'MIDDLE_SCHOOL',
    recommendedSec: 28,
    readInGraceSec: 2.0,
    prompt: 'Study this iconic outfield blueprint: which historic ballpark pairs a towering 37-foot left-field wall with a 302-foot right-field foul pole?',
    funFactWhy: 'Opened in 1912, Fenway Park’s Green Monster was originally erected to stop freeloading fans from watching games from Lansdowne Street.',
    helpfulHint: 'Home to the Boston Red Sox since 1912—and its left-field wall has a famous colorful nickname.',
    visualSpotter: {
      visualKind: 'SVG_DIAGRAM',
      imageUrl: './assets/visuals/bp_fenway.svg',
      caption: 'Asymmetric Outfield Wall & Foul-Line Blueprint',
      choices: ['Fenway Park', 'Wrigley Field', 'Camden Yards', 'Dodger Stadium'],
      correctIndex: 0,
    },
  },
];

export function getEmergencyFallbackCardsV4(): readonly QuestionCardV4[] {
  return EMERGENCY_FALLBACK_CARDS_V4;
}

// ============================================================================
// STRUCTURED SHARD SYNTHESIS CONFIGS (MATCH_4 / SORT_4 / MULTI_STRIKE / ESCALATOR)
// ============================================================================

interface Match4TableConfig {
  readonly type: string;
  readonly leftCol: number;
  readonly rightCol: number;
  readonly prompt: string;
  readonly instruction: string;
  readonly wittyHeader: string;
  readonly hintTemplate: (cat: string) => string;
}

const MATCH4_TABLE_CONFIGS: readonly Match4TableConfig[] = [
  { type: 'hist_empire', leftCol: 0, rightCol: 1, prompt: 'Match each historic empire or state to its capital city.', instruction: 'Pair each empire with its capital', wittyHeader: 'Crown & Capital', hintTemplate: () => 'Lock in the most unmistakable ancient capital first to simplify the rest.' },
  { type: 'hist_battle', leftCol: 0, rightCol: 3, prompt: 'Match each historic battle to the modern country where it was fought.', instruction: 'Pair each battle with its country', wittyHeader: 'Map the Battlefield', hintTemplate: () => 'Match the European and Asian flashpoints separately to clear half the board.' },
  { type: 'hist_figure', leftCol: 0, rightCol: 3, prompt: 'Match each historical figure to the nation or realm they shaped.', instruction: 'Pair each figure with their homeland', wittyHeader: 'Passport to History', hintTemplate: () => 'Check royal houses and surnames for clues to each homeland.' },
  { type: 'sci_element', leftCol: 0, rightCol: 1, prompt: 'Match each chemical element to its official periodic-table symbol.', instruction: 'Pair each element with its symbol', wittyHeader: 'Elementary, Actually', hintTemplate: () => 'Watch for symbols borrowed from Latin names like ferrum, aurum, or natrium.' },
  { type: 'sci_space', leftCol: 0, rightCol: 1, prompt: 'Match each space mission to the agency that launched it.', instruction: 'Pair each mission with its agency', wittyHeader: 'Mission Control', hintTemplate: () => 'Naming conventions—like Soyuz, Chandrayaan, or Voyager—point straight to each agency.' },
  { type: 'sci_scientist', leftCol: 0, rightCol: 1, prompt: 'Match each scientist to their primary field of discovery.', instruction: 'Pair each scientist with their discipline', wittyHeader: 'Lab Coat Match', hintTemplate: () => 'Connect the signature field you know cold, then narrow the final three.' },
  { type: 'geo_city', leftCol: 0, rightCol: 1, prompt: 'Match each major city to the country it calls home.', instruction: 'Pair each city with its nation', wittyHeader: 'Passport Stamp', hintTemplate: () => 'Group the cities by continent first so each country snaps into place.' },
  { type: 'geo_mountain', leftCol: 0, rightCol: 1, prompt: 'Match each notable peak to the country where it rises.', instruction: 'Pair each mountain with its country', wittyHeader: 'Peak Performance', hintTemplate: () => 'Listen to the place-name language to separate Alpine, Andean, and Asian peaks.' },
  { type: 'geo_river', leftCol: 0, rightCol: 1, prompt: 'Match each river to the country it flows through.', instruction: 'Pair each river with its nation', wittyHeader: 'Go With the Flow', hintTemplate: () => 'Anchor the longest continental river first and eliminate outward.' },
  { type: 'art_work', leftCol: 0, rightCol: 1, prompt: 'Match each artwork to the artist who created it.', instruction: 'Pair each work with its artist', wittyHeader: 'Museum Heist', hintTemplate: () => 'Match the Renaissance or modern title you recognize immediately first.' },
  { type: 'art_landmark', leftCol: 0, rightCol: 3, prompt: 'Match each architectural landmark to its home country.', instruction: 'Pair each landmark with its country', wittyHeader: 'Architectural Flex', hintTemplate: () => 'Spot the distinct architectural tradition behind each monument.' },
  { type: 'pop_film', leftCol: 0, rightCol: 1, prompt: 'Match each film to the director behind the camera.', instruction: 'Pair each movie with its director', wittyHeader: 'Roll Credits', hintTemplate: () => 'Match the signature auteur style to their marquee title first.' },
  { type: 'pop_album', leftCol: 0, rightCol: 1, prompt: 'Match each album to the artist or band who recorded it.', instruction: 'Pair each album with its artist', wittyHeader: 'Vinyl Spin', hintTemplate: () => 'Lock in the decade’s biggest record first and work by elimination.' },
  { type: 'pop_song', leftCol: 0, rightCol: 1, prompt: 'Match each hit track to the artist who made it famous.', instruction: 'Pair each song with its performer', wittyHeader: 'Chart Toppers', hintTemplate: () => 'Hum the hook in your head to lock the easiest pair right away.' },
  { type: 'sport_athlete', leftCol: 0, rightCol: 1, prompt: 'Match each sporting icon to their signature sport.', instruction: 'Pair each athlete with their sport', wittyHeader: 'Hall of Fame Heat', hintTemplate: () => 'Clear the global superstar you know instantly, then match the remaining three.' },
  { type: 'sport_club', leftCol: 0, rightCol: 1, prompt: 'Match each sports franchise or club to its home country.', instruction: 'Pair each club with its country', wittyHeader: 'Home Turf', hintTemplate: () => 'Club prefixes and city hints give away the league fast.' },
  { type: 'sport_videogame', leftCol: 0, rightCol: 1, prompt: 'Match each acclaimed video game to its developer studio.', instruction: 'Pair each game with its studio', wittyHeader: 'Player One Ready', hintTemplate: () => 'Pair the flagship studio title you know cold to clear the rest.' },
  { type: 'tech_company', leftCol: 0, rightCol: 3, prompt: 'Match each tech and industrial pioneer to its home country.', instruction: 'Pair each company with its nation', wittyHeader: 'Silicon Legends', hintTemplate: () => 'Separate the Asian, European, and American headquarters first.' },
  { type: 'tech_vehicle', leftCol: 0, rightCol: 1, prompt: 'Match each iconic machine or model to its manufacturer.', instruction: 'Pair each vehicle with its maker', wittyHeader: 'Full Throttle', hintTemplate: () => 'Check whether each badge belongs to aerospace or automotive engineering.' },
  { type: 'nat_species', leftCol: 0, rightCol: 2, prompt: 'Match each wild species to its biological group.', instruction: 'Pair each species with its animal group', wittyHeader: 'Creature Feature', hintTemplate: () => 'Common names often hint whether it flies, swims, or crawls.' },
  { type: 'soc_country', leftCol: 0, rightCol: 1, prompt: 'Match each nation to its official capital city.', instruction: 'Pair each country with its capital', wittyHeader: 'Embassy Row', hintTemplate: () => 'Watch out for nations whose capital is not their largest metropolis.' },
  { type: 'soc_university', leftCol: 0, rightCol: 1, prompt: 'Match each historic university to its home country.', instruction: 'Pair each university with its country', wittyHeader: 'Campus Crawl', hintTemplate: () => 'City names and languages inside university titles narrow the map quickly.' },
  { type: 'food_item', leftCol: 0, rightCol: 2, prompt: 'Match each signature dish to its country of origin.', instruction: 'Pair each dish with its homeland', wittyHeader: 'Check, Please!', hintTemplate: () => 'Let the culinary language guide each dish back to its native kitchen.' },
  { type: 'food_brand', leftCol: 0, rightCol: 3, prompt: 'Match each famous heritage brand to its founding country.', instruction: 'Pair each brand with its country', wittyHeader: 'Label Check', hintTemplate: () => 'Pair the household staple you spot first, then work by elimination.' },
  { type: 'lit_work', leftCol: 0, rightCol: 1, prompt: 'Match each celebrated literary work to its author.', instruction: 'Pair each book with its author', wittyHeader: 'Page Turners', hintTemplate: () => 'Link the classic novel you remember from school first to narrow the shelf.' },
  { type: 'lit_myth', leftCol: 0, rightCol: 1, prompt: 'Match each legendary figure to its mythological tradition.', instruction: 'Pair each figure with its mythology', wittyHeader: 'Olympus Calling', hintTemplate: () => 'Listen to the spelling and syllables to distinguish Greek, Norse, and ancient Near Eastern lore.' },
  { type: 'math_person', leftCol: 0, rightCol: 3, prompt: 'Match each mathematical thinker to the country they called home.', instruction: 'Pair each mathematician with their country', wittyHeader: 'Numbers Don’t Lie', hintTemplate: () => 'Pair the surname origin and historical era to crack the lineup.' },
];

interface Sort4TableConfig {
  readonly type: string;
  readonly labelCol: number;
  readonly numCol: number;
  readonly isYear: boolean;
  readonly unit: string;
  readonly prompt: string;
  readonly direction: string;
  readonly wittyHeader: string;
  readonly minGapEasy: number;
}

const SORT4_TABLE_CONFIGS: readonly Sort4TableConfig[] = [
  { type: 'hist_battle', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Order these four historic battles from earliest to latest.', direction: 'Earliest Year -> Latest Year', wittyHeader: 'Battle Timeline', minGapEasy: 18 },
  { type: 'hist_empire', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Stack these historic empires and states from oldest founding to newest.', direction: 'Earliest Founded -> Latest Founded', wittyHeader: 'Rise of Empires', minGapEasy: 40 },
  { type: 'hist_war', labelCol: 0, numCol: 1, isYear: true, unit: '', prompt: 'Put these turning-point conflicts in chronological order.', direction: 'Earliest Year -> Latest Year', wittyHeader: 'Timeline Scramble', minGapEasy: 15 },
  { type: 'sci_element', labelCol: 0, numCol: 2, isYear: false, unit: 'protons', prompt: 'Sort these four chemical elements from lowest atomic number to highest.', direction: 'Lightest -> Heaviest (Atomic #)', wittyHeader: 'Periodic Stack', minGapEasy: 4 },
  { type: 'sci_space', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Put these space missions in launch order from earliest to latest.', direction: 'Earliest Launch -> Latest Launch', wittyHeader: 'Countdown Order', minGapEasy: 3 },
  { type: 'geo_mountain', labelCol: 0, numCol: 2, isYear: false, unit: 'm', prompt: 'Rank these four peaks from shortest elevation to tallest summit.', direction: 'Shortest -> Tallest Elevation', wittyHeader: 'Summit Stack', minGapEasy: 350 },
  { type: 'geo_river', labelCol: 0, numCol: 2, isYear: false, unit: 'km', prompt: 'Arrange these four rivers from shortest course to longest.', direction: 'Shortest -> Longest River', wittyHeader: 'River Run', minGapEasy: 250 },
  { type: 'geo_city', labelCol: 0, numCol: 3, isYear: false, unit: 'k pop.', prompt: 'Rank these four major cities from smallest population to largest.', direction: 'Smallest -> Largest Population', wittyHeader: 'Big City Energy', minGapEasy: 900 },
  { type: 'art_work', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Put these four works of art in chronological order from earliest to latest.', direction: 'Earliest Year -> Latest Year', wittyHeader: 'Gallery Timeline', minGapEasy: 20 },
  { type: 'art_landmark', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Order these iconic landmarks from oldest to most recently built.', direction: 'Oldest -> Newest Landmark', wittyHeader: 'Built to Last', minGapEasy: 25 },
  { type: 'pop_film', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Arrange these four movies from earliest theatrical release to latest.', direction: 'Earliest Release -> Latest Release', wittyHeader: 'Box Office Rewind', minGapEasy: 4 },
  { type: 'pop_album', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Stack these four albums from earliest release year to latest.', direction: 'Earliest Album -> Latest Album', wittyHeader: 'Spin the Decades', minGapEasy: 4 },
  { type: 'pop_song', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Put these four songs in chronological order from first released to newest.', direction: 'Earliest Year -> Latest Year', wittyHeader: 'Throwback Order', minGapEasy: 4 },
  { type: 'pop_tv', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Order these TV series from earliest premiere year to latest.', direction: 'Earliest Premiere -> Latest Premiere', wittyHeader: 'Channel Surfing', minGapEasy: 4 },
  { type: 'sport_stadium', labelCol: 0, numCol: 2, isYear: false, unit: 'seats', prompt: 'Rank these four stadiums from smallest capacity to largest crowd.', direction: 'Smallest -> Largest Capacity', wittyHeader: 'Pack the Stands', minGapEasy: 6000 },
  { type: 'sport_videogame', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Put these four video games in release-year order from earliest to latest.', direction: 'Earliest Release -> Latest Release', wittyHeader: 'Level Up Timeline', minGapEasy: 3 },
  { type: 'sport_club', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Order these four sports clubs from oldest founding year to newest.', direction: 'Oldest Club -> Newest Club', wittyHeader: 'Franchise History', minGapEasy: 8 },
  { type: 'tech_company', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Stack these four tech and industrial companies from oldest founding to newest.', direction: 'Oldest Founded -> Newest Founded', wittyHeader: 'Startup to Giant', minGapEasy: 8 },
  { type: 'tech_software', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Arrange these four software milestones from earliest debut to latest.', direction: 'Earliest Debut -> Latest Debut', wittyHeader: 'Version History', minGapEasy: 4 },
  { type: 'soc_university', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Order these four universities from oldest founding year to newest.', direction: 'Oldest -> Newest University', wittyHeader: 'Ivy & Beyond', minGapEasy: 35 },
  { type: 'food_brand', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Rank these four iconic brands from oldest founding year to newest.', direction: 'Oldest Founded -> Newest Founded', wittyHeader: 'Vintage Labels', minGapEasy: 10 },
  { type: 'lit_work', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Arrange these four literary works from earliest publication to latest.', direction: 'Earliest Published -> Latest Published', wittyHeader: 'Shelf Chronology', minGapEasy: 15 },
  { type: 'math_person', labelCol: 0, numCol: 2, isYear: true, unit: '', prompt: 'Order these four mathematical thinkers from earliest birth year to latest.', direction: 'Earliest Born -> Latest Born', wittyHeader: 'Proof Through Time', minGapEasy: 30 },
];

interface MultiStrikeTableConfig {
  readonly type: string;
  readonly labelCol: number;
  readonly groupCol: number;
  readonly pickAllPrompt: (group: string) => string;
  readonly imposterPrompt: (group: string) => string;
  readonly whyPickAll: (group: string, winners: string[]) => string;
  readonly whyImposter: (group: string, imposter: string, impGroup: string) => string;
}

const MULTISTRIKE_TABLE_CONFIGS: readonly MultiStrikeTableConfig[] = [
  {
    type: 'hist_battle',
    labelCol: 0,
    groupCol: 3,
    pickAllPrompt: (g) => `Tap all 3 historic battles fought in modern-day ${g}.`,
    imposterPrompt: (g) => `Three of these battles were fought in modern-day ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} all unfolded in modern-day ${g}.`,
    whyImposter: (g, imp, ig) => `${imp} is the odd one out—it took place in ${ig}, not ${g}.`,
  },
  {
    type: 'sci_element',
    labelCol: 0,
    groupCol: 3,
    pickAllPrompt: (g) => `Tap all 3 chemical elements classified as "${g}".`,
    imposterPrompt: (g) => `Three of these elements belong to the "${g}" family—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} all sit in the ${g} group on the periodic table.`,
    whyImposter: (g, imp, ig) => `${imp} breaks the pattern—it is classified as ${ig} rather than ${g}.`,
  },
  {
    type: 'geo_city',
    labelCol: 0,
    groupCol: 1,
    pickAllPrompt: (g) => `Tap all 3 major cities located in ${g}.`,
    imposterPrompt: (g) => `Three of these cities sit inside ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} are all major cities in ${g}.`,
    whyImposter: (g, imp, ig) => `${imp} is the geographic imposter—it is actually in ${ig}, not ${g}.`,
  },
  {
    type: 'geo_mountain',
    labelCol: 0,
    groupCol: 1,
    pickAllPrompt: (g) => `Tap all 3 mountains located in ${g}.`,
    imposterPrompt: (g) => `Three of these peaks rise in ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} all rise within ${g}.`,
    whyImposter: (g, imp, ig) => `${imp} doesn’t belong—it rises in ${ig}, not ${g}.`,
  },
  {
    type: 'art_landmark',
    labelCol: 0,
    groupCol: 3,
    pickAllPrompt: (g) => `Tap all 3 architectural landmarks located in ${g}.`,
    imposterPrompt: (g) => `Three of these landmarks stand in ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} all stand in ${g}.`,
    whyImposter: (g, imp, ig) => `${imp} is the architectural imposter—it stands in ${ig}, not ${g}.`,
  },
  {
    type: 'pop_film',
    labelCol: 0,
    groupCol: 1,
    pickAllPrompt: (g) => `Tap all 3 movies directed by ${g}.`,
    imposterPrompt: (g) => `Three of these films were directed by ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${g} sat in the director’s chair for ${w.join(', ')}.`,
    whyImposter: (g, imp, ig) => `${imp} was directed by ${ig}, not ${g}.`,
  },
  {
    type: 'pop_band',
    labelCol: 0,
    groupCol: 1,
    pickAllPrompt: (g) => `Tap all 3 bands or music acts formed in ${g}.`,
    imposterPrompt: (g) => `Three of these musical acts hail from ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} all launched their careers in ${g}.`,
    whyImposter: (g, imp, ig) => `${imp} breaks the streak—they hail from ${ig}, not ${g}.`,
  },
  {
    type: 'sport_athlete',
    labelCol: 0,
    groupCol: 1,
    pickAllPrompt: (g) => `Tap all 3 sporting stars best known for ${g}.`,
    imposterPrompt: (g) => `Three of these athletes starred in ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} all made their name in ${g}.`,
    whyImposter: (g, imp, ig) => `${imp} plays a different game—they starred in ${ig}, not ${g}.`,
  },
  {
    type: 'sport_club',
    labelCol: 0,
    groupCol: 1,
    pickAllPrompt: (g) => `Tap all 3 sports clubs based in ${g}.`,
    imposterPrompt: (g) => `Three of these clubs play out of ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} all compete out of ${g}.`,
    whyImposter: (g, imp, ig) => `${imp} is the away team here—it is based in ${ig}, not ${g}.`,
  },
  {
    type: 'tech_company',
    labelCol: 0,
    groupCol: 3,
    pickAllPrompt: (g) => `Tap all 3 technology or industrial companies founded in ${g}.`,
    imposterPrompt: (g) => `Three of these companies originated in ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} were all founded in ${g}.`,
    whyImposter: (g, imp, ig) => `${imp} is the imposter—it originated in ${ig}, not ${g}.`,
  },
  {
    type: 'nat_species',
    labelCol: 0,
    groupCol: 2,
    pickAllPrompt: (g) => `Tap all 3 species classified in the "${g}" group.`,
    imposterPrompt: (g) => `Three of these wild species belong to the "${g}" group—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} all belong to the ${g} group.`,
    whyImposter: (g, imp, ig) => `${imp} is the wild imposter—biologists classify it as a ${ig}, not a ${g}.`,
  },
  {
    type: 'soc_country',
    labelCol: 0,
    groupCol: 2,
    pickAllPrompt: (g) => `Tap all 3 countries located in ${g}.`,
    imposterPrompt: (g) => `Three of these nations sit in ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} are all sovereign nations of ${g}.`,
    whyImposter: (g, imp, ig) => `${imp} sits across the border in ${ig}, not ${g}.`,
  },
  {
    type: 'food_item',
    labelCol: 0,
    groupCol: 2,
    pickAllPrompt: (g) => `Tap all 3 traditional dishes originating in ${g}.`,
    imposterPrompt: (g) => `Three of these dishes come from ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} all hail from the kitchens of ${g}.`,
    whyImposter: (g, imp, ig) => `${imp} crashed the tasting menu—it comes from ${ig}, not ${g}.`,
  },
  {
    type: 'lit_myth',
    labelCol: 0,
    groupCol: 1,
    pickAllPrompt: (g) => `Tap all 3 mythic figures belonging to ${g}.`,
    imposterPrompt: (g) => `Three of these legendary figures belong to ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} all feature in ${g}.`,
    whyImposter: (g, imp, ig) => `${imp} wandered in from ${ig}, not ${g}.`,
  },
  {
    type: 'math_person',
    labelCol: 0,
    groupCol: 3,
    pickAllPrompt: (g) => `Tap all 3 mathematicians associated with ${g}.`,
    imposterPrompt: (g) => `Three of these mathematicians hailed from ${g}—spot the 1 imposter!`,
    whyPickAll: (g, w) => `${w.join(', ')} all contributed to ${g}’s mathematical heritage.`,
    whyImposter: (g, imp, ig) => `${imp} is the outlier—linked to ${ig} rather than ${g}.`,
  },
];

// ============================================================================
// CONVERSION HELPERS: PRISM -> QUESTIONCARDV4 & DYNAMIC SHARD SYNTHESIZERS
// ============================================================================

function resolveTargetDomains(opts: DrawQuestionCardV4Options): DomainId[] {
  if (opts.domainId !== undefined) {
    return [clamp(Math.trunc(opts.domainId), 0, 11) as DomainId];
  }
  if (opts.wedgeId && WEDGE_CATALOG_V4[opts.wedgeId]) {
    return [...WEDGE_CATALOG_V4[opts.wedgeId].domainIds];
  }
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
}

function resolveTargetFormat(opts: DrawQuestionCardV4Options, rng: RngLike): QuestionFormatV4 {
  if (opts.format) return opts.format;
  const pool =
    opts.allowedFormats && opts.allowedFormats.length > 0
      ? opts.allowedFormats
      : ALL_QUESTION_FORMATS_V4;
  return pool[rng.nextInt(0, pool.length - 1)];
}

function buildExcludedSet(opts: DrawQuestionCardV4Options): Set<number> {
  const out = new Set<number>();
  if (opts.excludeQids) {
    for (const q of opts.excludeQids) out.add(q);
  }
  return out;
}

function toExact4Choices(
  facets: PrismQuestion['facets'],
  correctFacetIndex: number,
): { choices: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3 } | null {
  if (!Array.isArray(facets) || facets.length < 4) return null;
  const correctFacet = facets[correctFacetIndex] ?? facets.find((f) => f.isCorrect);
  if (!correctFacet) return null;
  const seen = new Set<string>([correctFacet.text.trim().toLowerCase()]);
  const others: string[] = [];
  for (const f of facets) {
    if (f.index === correctFacet.index) continue;
    const t = sanitizeTriviaCopy(f.text);
    const low = t.toLowerCase();
    if (!t || seen.has(low)) continue;
    seen.add(low);
    others.push(t);
    if (others.length === 3) break;
  }
  if (others.length < 3) return null;
  const pos = clamp(correctFacetIndex, 0, 3) as 0 | 1 | 2 | 3;
  const arr = [...others];
  arr.splice(pos, 0, sanitizeTriviaCopy(correctFacet.text));
  return {
    choices: [arr[0], arr[1], arr[2], arr[3]],
    correctIndex: pos,
  };
}

function convertPrismToMultipleChoiceV4(
  pq: PrismQuestion,
  isLightningBlitz: boolean,
  seed: number,
  subcategoryId?: string,
): QuestionCardV4 | null {
  const packed = toExact4Choices(pq.facets, pq.correctFacetIndex);
  if (!packed) return null;
  const prompt = sanitizeTriviaCopy(pq.prompt);
  const words = countWords(prompt);
  // STRICT RULE: 12s ONLY if isLightningBlitz AND prompt <= 8 words; otherwise 28s!
  const recommendedSec = isLightningBlitz && words <= 8 ? 12 : 28;
  const helpfulHint = sanitizeTriviaCopy(
    pq.clues[0] && pq.clues[0].length >= 12 ? pq.clues[0] : pq.clues[1] || `Focus on the ${pq.l1Category} connection that separates this from the decoys.`,
  );
  const card: QuestionCardV4 = {
    qid: pq.qid,
    format: 'MULTIPLE_CHOICE',
    domainId: pq.l0Domain,
    wedgeId: domainToWedgeColor(pq.l0Domain),
    categoryLabel: sanitizeTriviaCopy(pq.l1Category || pq.domainMeta.name),
    wittyHeader: pickWittyHeaderForCard(pq.l0Domain, pq.l1Category, 'MULTIPLE_CHOICE', seed),
    ...(subcategoryId ? { subcategoryId } : {}),
    difficultyTier: pq.difficultyTier,
    recommendedSec,
    readInGraceSec: 2.0,
    prompt,
    funFactWhy: sanitizeTriviaCopy(pq.whyExplanation),
    helpfulHint,
    choices: packed.choices,
    correctIndex: packed.correctIndex,
    legacySource: pq,
  };
  return isCleanCardText(card) ? card : null;
}

function convertPrismToPinpointV4(
  pq: PrismQuestion,
  seed: number,
  subcategoryId?: string,
): QuestionCardV4 | null {
  if (!pq.calibrator) return null;
  const cal = pq.calibrator;
  const prompt = sanitizeTriviaCopy(pq.prompt);
  const isYear =
    /^(?:ce|ad|year|yr)$/i.test(cal.unit.trim()) ||
    (!cal.unit.trim() && cal.exactVal >= 1000 && cal.exactVal <= 2120);
  const unitLabel = isYear ? '' : sanitizeTriviaCopy(cal.unit.trim());
  const step = Math.max(1, Math.round(cal.step));
  const exactVal = Math.round(cal.exactVal / step) * step;
  const minVal = Math.min(Math.round(cal.minVal / step) * step, exactVal - step * 4);
  const maxVal = Math.max(Math.round(cal.maxVal / step) * step, exactVal + step * 4);
  const span = Math.max(step * 8, maxVal - minVal);
  const tierFactor =
    pq.difficultyTier === 'MIDDLE_SCHOOL'
      ? 1.25
      : pq.difficultyTier === 'HIGH_SCHOOL'
        ? 1.05
        : pq.difficultyTier === 'COLLEGE'
          ? 0.9
          : 0.72;
  const bullseyeRadius = Math.max(step, Math.round((span * 0.04 * tierFactor) / step) * step);
  const winRadius = Math.max(
    bullseyeRadius + step,
    Math.round((span * 0.14 * tierFactor) / step) * step,
  );

  const pinpoint: PinpointDialSpec = {
    minVal,
    maxVal,
    step,
    exactVal,
    unitLabel,
    bullseyeRadius,
    winRadius: Math.min(winRadius, Math.floor((span * 0.38) / step) * step || bullseyeRadius + step),
  };

  const card: QuestionCardV4 = {
    qid: pq.qid,
    format: 'PINPOINT_DIAL',
    domainId: pq.l0Domain,
    wedgeId: domainToWedgeColor(pq.l0Domain),
    categoryLabel: sanitizeTriviaCopy(pq.l1Category || pq.domainMeta.name),
    wittyHeader: pickWittyHeaderForCard(pq.l0Domain, pq.l1Category, 'PINPOINT_DIAL', seed),
    ...(subcategoryId ? { subcategoryId } : {}),
    difficultyTier: pq.difficultyTier,
    recommendedSec: 28,
    readInGraceSec: 2.0,
    prompt,
    funFactWhy: sanitizeTriviaCopy(pq.whyExplanation),
    helpfulHint: sanitizeTriviaCopy(pq.clues[0] || pq.clues[1] || 'Anchor the surrounding era or scale before dialing in.'),
    pinpoint,
    legacySource: pq,
  };
  return isCleanCardText(card) ? card : null;
}

function convertPrismToClueEscalatorV4(
  pq: PrismQuestion,
  seed: number,
  subcategoryId?: string,
): QuestionCardV4 | null {
  const packed = toExact4Choices(pq.facets, pq.correctFacetIndex);
  if (!packed) return null;
  const answerLow = packed.choices[packed.correctIndex].toLowerCase();
  const prompt = sanitizeTriviaCopy(pq.prompt);
  const c0 = sanitizeTriviaCopy(pq.clues[0] ?? '');
  const c1 = sanitizeTriviaCopy(pq.clues[1] ?? '');

  const leaksAnswer = (s: string): boolean =>
    !s || s.length < 14 || (answerLow.length >= 4 && s.toLowerCase().includes(answerLow));

  const hardClue = !leaksAnswer(c0)
    ? c0
    : `Category spotlight: ${pq.l1Category} (${pq.l2Subcategory || pq.domainMeta.name}) — trust your first instinct before the headline drops.`;
  const mediumClue =
    !leaksAnswer(c1) && c1.toLowerCase() !== hardClue.toLowerCase()
      ? c1
      : `Narrow it down inside ${pq.l1Category}: eliminate the two options from the wrong era or region.`;
  const clearClue = prompt;

  const escalator: ClueEscalatorSpec = {
    clues: [hardClue, mediumClue, clearClue],
    choices: packed.choices,
    correctIndex: packed.correctIndex,
  };

  const card: QuestionCardV4 = {
    qid: pq.qid,
    format: 'CLUE_ESCALATOR',
    domainId: pq.l0Domain,
    wedgeId: domainToWedgeColor(pq.l0Domain),
    categoryLabel: sanitizeTriviaCopy(pq.l1Category || pq.domainMeta.name),
    wittyHeader: pickWittyHeaderForCard(pq.l0Domain, pq.l1Category, 'CLUE_ESCALATOR', seed),
    ...(subcategoryId ? { subcategoryId } : {}),
    difficultyTier: pq.difficultyTier,
    recommendedSec: 32,
    readInGraceSec: 2.0,
    prompt: `Crack this ${sanitizeTriviaCopy(pq.l1Category || pq.domainMeta.name)} mystery early for up to 3x points.`,
    funFactWhy: sanitizeTriviaCopy(pq.whyExplanation),
    helpfulHint: mediumClue,
    escalator,
    legacySource: pq,
  };
  return isCleanCardText(card) ? card : null;
}

function convertPrismToVisualSpotterV4(
  pq: PrismQuestion,
  seed: number,
  subcategoryId?: string,
): QuestionCardV4 | null {
  if (pq.visualPlate?.imageUrl) {
    const packed = toExact4Choices(pq.facets, pq.correctFacetIndex);
    if (!packed) return null;
    const visualSpotter: VisualSpotterSpec = {
      visualKind: 'SVG_DIAGRAM',
      imageUrl: normalizeVisualAssetUrl(pq.visualPlate.imageUrl),
      caption: sanitizeTriviaCopy(pq.visualPlate.caption || pq.l1Category),
      choices: packed.choices,
      correctIndex: packed.correctIndex,
    };
    const card: QuestionCardV4 = {
      qid: pq.qid,
      format: 'VISUAL_SPOTTER',
      domainId: pq.l0Domain,
      wedgeId: domainToWedgeColor(pq.l0Domain),
      categoryLabel: sanitizeTriviaCopy(pq.l1Category || pq.domainMeta.name),
      wittyHeader: pickWittyHeaderForCard(pq.l0Domain, pq.l1Category, 'VISUAL_SPOTTER', seed),
      ...(subcategoryId ? { subcategoryId } : {}),
      difficultyTier: pq.difficultyTier,
      recommendedSec: 28,
      readInGraceSec: 2.0,
      prompt: sanitizeTriviaCopy(pq.prompt),
      funFactWhy: sanitizeTriviaCopy(pq.whyExplanation),
      helpfulHint: sanitizeTriviaCopy(pq.clues[0] || 'Inspect the highlighted dimensions and landmarks on the plate.'),
      visualSpotter,
      legacySource: pq,
    };
    return isCleanCardText(card) ? card : null;
  }

  if (pq.globePin) {
    const gp = pq.globePin;
    const targetLabel = sanitizeTriviaCopy(gp.targetLabel);
    // Guarantee regional neighbor choices within 350..2,200 km (never opposite continents!)
    const validRegional = gp.quickAnchors.filter((a) => {
      if (a.label.toLowerCase() === targetLabel.toLowerCase()) return false;
      const d = approxGreatCircleKm(gp.targetLat, gp.targetLon, a.lat, a.lon);
      return d >= 350 && d <= 2200;
    });
    const decoys =
      validRegional.length >= 3
        ? validRegional.slice(0, 3)
        : pickRegionalGlobeDecoys(gp.targetLat, gp.targetLon, targetLabel, seed ^ pq.qid, 3);
    if (decoys.length < 3) return null;

    const choicePool = [targetLabel, ...decoys.map((d) => sanitizeTriviaCopy(d.label))];
    const uniqueSet = new Set(choicePool.map((c) => c.toLowerCase()));
    if (uniqueSet.size < 4) return null;

    const rng = new DeterministicRng(fnv1a32(`VIS_MAP:${pq.qid}:${seed}`));
    rng.shuffleInPlace(choicePool);
    const correctIndex = choicePool.findIndex(
      (c) => c.toLowerCase() === targetLabel.toLowerCase(),
    ) as 0 | 1 | 2 | 3;

    const visualSpotter: VisualSpotterSpec = {
      visualKind: 'WORLD_REGION_MAP',
      caption: sanitizeTriviaCopy(gp.regionHint),
      targetLat: gp.targetLat,
      targetLon: gp.targetLon,
      choices: [choicePool[0], choicePool[1], choicePool[2], choicePool[3]],
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    };

    const card: QuestionCardV4 = {
      qid: pq.qid,
      format: 'VISUAL_SPOTTER',
      domainId: pq.l0Domain,
      wedgeId: domainToWedgeColor(pq.l0Domain),
      categoryLabel: sanitizeTriviaCopy(pq.l1Category || pq.domainMeta.name),
      wittyHeader: pickWittyHeaderForCard(pq.l0Domain, pq.l1Category, 'VISUAL_SPOTTER', seed),
      ...(subcategoryId ? { subcategoryId } : {}),
      difficultyTier: pq.difficultyTier,
      recommendedSec: 28,
      readInGraceSec: 2.0,
      prompt: sanitizeTriviaCopy(pq.prompt),
      funFactWhy: sanitizeTriviaCopy(pq.whyExplanation),
      helpfulHint: sanitizeTriviaCopy(gp.regionHint),
      visualSpotter,
      legacySource: pq,
    };
    return isCleanCardText(card) ? card : null;
  }

  return null;
}

// ============================================================================
// DYNAMIC MULTI-ROW SHARD SYNTHESIZERS (500K+ NON-REPEATING SCALE!)
// ============================================================================

function collectEligibleRowsForTier(
  chunk: ShardChunkData,
  tableIdx: number,
  spec: ShardTableTypeSpec,
  tier: DifficultyTierV4 | undefined,
): number[] {
  const rows = chunk.t[tableIdx]?.r;
  if (!rows || rows.length === 0) return [];
  const total = rows.length;
  const out: number[] = [];
  // For GRADUATE/MENSA sample upper bands; for MS/HS/COLLEGE honor strict fame gate!
  const startIdx =
    tier === 'MENSA'
      ? Math.floor(total * 0.55)
      : tier === 'GRADUATE'
        ? Math.floor(total * 0.25)
        : 0;
  const maxScan =
    tier === 'MIDDLE_SCHOOL'
      ? Math.min(total, 420)
      : tier === 'HIGH_SCHOOL'
        ? Math.min(total, 1100)
        : tier === 'COLLEGE'
          ? Math.min(total, 2600)
          : total;

  const step = Math.max(1, Math.floor((maxScan - startIdx) / 900));
  for (let ri = startIdx; ri < maxScan; ri += step) {
    if (isShardRowFamousEnoughForTier(chunk.t[tableIdx].type, rows[ri], spec, chunk.p, ri, total, tier)) {
      out.push(ri);
    }
  }
  return out;
}

function synthesizeMatch4FromShards(
  engine: ForgeEngine,
  domains: readonly DomainId[],
  tier: DifficultyTierV4 | undefined,
  excluded: ReadonlySet<number>,
  rng: RngLike,
  subcategoryId?: string,
): QuestionCardV4 | null {
  const manifest = engine.getUnifiedManifest();
  if (!manifest) return null;

  const eligibleTables: Array<{
    dom: DomainId;
    chunk: ShardChunkData;
    ti: number;
    spec: ShardTableTypeSpec;
    cfg: Match4TableConfig;
  }> = [];

  for (const dom of domains) {
    const chunks = engine.getLoadedShardChunksForDomain(dom);
    for (const chunk of chunks) {
      for (let ti = 0; ti < chunk.t.length; ti++) {
        const tbl = chunk.t[ti];
        const cfg = MATCH4_TABLE_CONFIGS.find((c) => c.type === tbl.type);
        const spec = chunk.types?.[tbl.type] ?? manifest.types[tbl.type];
        if (cfg && spec && tbl.r.length >= 8) {
          eligibleTables.push({ dom, chunk, ti, spec, cfg });
        }
      }
    }
  }
  if (eligibleTables.length === 0) return null;
  rng.shuffleInPlace(eligibleTables);

  for (const entry of eligibleTables) {
    const { dom, chunk, ti, spec, cfg } = entry;
    const rows = chunk.t[ti].r;
    const pool = chunk.p;
    const poolCols = new Set<number>(spec.poolCols ?? []);
    const rowIndices = collectEligibleRowsForTier(chunk, ti, spec, tier);
    if (rowIndices.length < 4) continue;

    rng.shuffleInPlace(rowIndices);
    const pairs: Match4PairItem[] = [];
    const usedLeft = new Set<string>();
    const usedRight = new Set<string>();
    const chosenRowIds: number[] = [];

    for (const ri of rowIndices) {
      const r = rows[ri];
      let left = sanitizeTriviaCopy(resolveCellValue(r, cfg.leftCol, poolCols, pool).trim());
      let right = sanitizeTriviaCopy(resolveCellValue(r, cfg.rightCol, poolCols, pool).trim());
      if (!left || !right || left.length > 34 || right.length > 28) continue;
      if (/^[a-z]/.test(left)) left = left[0].toUpperCase() + left.slice(1);
      if (/^[a-z]/.test(right) && cfg.type !== 'sci_element') {
        right = right[0].toUpperCase() + right.slice(1);
      }
      const lLow = left.toLowerCase();
      const rLow = right.toLowerCase();
      if (lLow === rLow || (rLow.length >= 4 && lLow.includes(rLow))) continue;
      if (usedLeft.has(lLow) || usedRight.has(rLow)) continue;
      usedLeft.add(lLow);
      usedRight.add(rLow);
      chosenRowIds.push(ri);
      pairs.push({ pairId: `p${pairs.length + 1}`, leftPrompt: left, rightAnswer: right });
      if (pairs.length === 4) break;
    }

    if (pairs.length < 4) continue;

    const qid = 2_000_000 + (fnv1a32(`M4:${cfg.type}:${chosenRowIds.join(',')}`) % 290_000);
    if (excluded.has(qid)) continue;

    const pairTuple: [Match4PairItem, Match4PairItem, Match4PairItem, Match4PairItem] = [
      pairs[0],
      pairs[1],
      pairs[2],
      pairs[3],
    ];
    const rightItems: [
      { pairId: string; text: string },
      { pairId: string; text: string },
      { pairId: string; text: string },
      { pairId: string; text: string },
    ] = [
      { pairId: pairTuple[0].pairId, text: pairTuple[0].rightAnswer },
      { pairId: pairTuple[1].pairId, text: pairTuple[1].rightAnswer },
      { pairId: pairTuple[2].pairId, text: pairTuple[2].rightAnswer },
      { pairId: pairTuple[3].pairId, text: pairTuple[3].rightAnswer },
    ];
    const shuffledRight = derange4(rightItems, (x) => x.pairId, rng);

    const funFactWhy = sanitizeTriviaCopy(
      `Complete lineup: ${pairTuple.map((p) => `${p.leftPrompt} -> ${p.rightAnswer}`).join('; ')}.`,
    );

    return {
      qid,
      format: 'MATCH_4',
      domainId: dom,
      wedgeId: domainToWedgeColor(dom),
      categoryLabel: sanitizeTriviaCopy(spec.l1Category || getForgeDomainInfo(dom).name),
      wittyHeader: cfg.wittyHeader,
      ...(subcategoryId ? { subcategoryId } : {}),
      difficultyTier: tier ?? 'COLLEGE',
      recommendedSec: 35,
      readInGraceSec: 2.0,
      prompt: cfg.prompt,
      funFactWhy,
      helpfulHint: cfg.hintTemplate(spec.l1Category),
      match4: {
        instruction: cfg.instruction,
        pairs: pairTuple,
        shuffledRight,
      },
    };
  }
  return null;
}

function synthesizeSort4FromShards(
  engine: ForgeEngine,
  domains: readonly DomainId[],
  tier: DifficultyTierV4 | undefined,
  excluded: ReadonlySet<number>,
  rng: RngLike,
  subcategoryId?: string,
): QuestionCardV4 | null {
  const manifest = engine.getUnifiedManifest();
  if (!manifest) return null;

  const eligibleTables: Array<{
    dom: DomainId;
    chunk: ShardChunkData;
    ti: number;
    spec: ShardTableTypeSpec;
    cfg: Sort4TableConfig;
  }> = [];

  for (const dom of domains) {
    const chunks = engine.getLoadedShardChunksForDomain(dom);
    for (const chunk of chunks) {
      for (let ti = 0; ti < chunk.t.length; ti++) {
        const tbl = chunk.t[ti];
        const cfg = SORT4_TABLE_CONFIGS.find((c) => c.type === tbl.type);
        const spec = chunk.types?.[tbl.type] ?? manifest.types[tbl.type];
        if (cfg && spec && tbl.r.length >= 8) {
          eligibleTables.push({ dom, chunk, ti, spec, cfg });
        }
      }
    }
  }
  if (eligibleTables.length === 0) return null;
  rng.shuffleInPlace(eligibleTables);

  for (const entry of eligibleTables) {
    const { dom, chunk, ti, spec, cfg } = entry;
    const rows = chunk.t[ti].r;
    const pool = chunk.p;
    const poolCols = new Set<number>(spec.poolCols ?? []);
    const rowIndices = collectEligibleRowsForTier(chunk, ti, spec, tier);
    if (rowIndices.length < 4) continue;

    rng.shuffleInPlace(rowIndices);
    const minGap =
      tier === 'MIDDLE_SCHOOL' || tier === 'HIGH_SCHOOL'
        ? cfg.minGapEasy
        : Math.max(1, Math.floor(cfg.minGapEasy * 0.35));

    const picked: Array<{ ri: number; label: string; num: number }> = [];
    const usedLabels = new Set<string>();
    const usedNums = new Set<number>();

    for (const passGap of [minGap, 1]) {
      if (picked.length >= 4) break;
      for (const ri of rowIndices) {
        if (picked.length >= 4) break;
        const r = rows[ri];
        let label = sanitizeTriviaCopy(resolveCellValue(r, cfg.labelCol, poolCols, pool).trim());
        const num = Number(r[cfg.numCol]);
        if (!label || label.length > 36 || !Number.isFinite(num)) continue;
        if (cfg.isYear && (num < 100 || num > 2026)) continue;
        if (!cfg.isYear && num <= 0) continue;
        if (/^[a-z]/.test(label)) label = label[0].toUpperCase() + label.slice(1);
        const lLow = label.toLowerCase();
        if (usedLabels.has(lLow) || usedNums.has(num)) continue;
        if (picked.some((p) => Math.abs(p.num - num) < passGap)) continue;
        usedLabels.add(lLow);
        usedNums.add(num);
        picked.push({ ri, label, num });
      }
    }

    if (picked.length < 4) continue;
    picked.sort((a, b) => a.num - b.num);

    const qid = 2_300_000 + (fnv1a32(`S4:${cfg.type}:${picked.map((p) => p.ri).join(',')}`) % 290_000);
    if (excluded.has(qid)) continue;

    const formatVal = (n: number): string => {
      if (cfg.isYear) return String(Math.round(n));
      const cleanNum = formatCleanTriviaNumber(n, cfg.unit);
      return cfg.unit ? `${cleanNum} ${cfg.unit}` : cleanNum;
    };

    const correctOrder: [Sort4CardItem, Sort4CardItem, Sort4CardItem, Sort4CardItem] = [
      { itemId: 's1', label: picked[0].label, numericValue: picked[0].num, formattedValue: formatVal(picked[0].num) },
      { itemId: 's2', label: picked[1].label, numericValue: picked[1].num, formattedValue: formatVal(picked[1].num) },
      { itemId: 's3', label: picked[2].label, numericValue: picked[2].num, formattedValue: formatVal(picked[2].num) },
      { itemId: 's4', label: picked[3].label, numericValue: picked[3].num, formattedValue: formatVal(picked[3].num) },
    ];
    const initialOrder = derange4(correctOrder, (x) => x.itemId, rng);

    return {
      qid,
      format: 'SORT_4',
      domainId: dom,
      wedgeId: domainToWedgeColor(dom),
      categoryLabel: sanitizeTriviaCopy(spec.l1Category || getForgeDomainInfo(dom).name),
      wittyHeader: cfg.wittyHeader,
      ...(subcategoryId ? { subcategoryId } : {}),
      difficultyTier: tier ?? 'COLLEGE',
      recommendedSec: 30,
      readInGraceSec: 2.0,
      prompt: cfg.prompt,
      funFactWhy: sanitizeTriviaCopy(
        `Exact order: ${correctOrder.map((c) => `${c.label} (${c.formattedValue})`).join(' -> ')}.`,
      ),
      helpfulHint: sanitizeTriviaCopy(
        `Anchor the extremes first: spot which entry sits at the very bottom (${correctOrder[0].formattedValue.replace(/\d/g, '?') === '????' ? 'earliest' : 'lowest'}) and very top.`,
      ),
      sort4: {
        orderDirectionLabel: cfg.direction,
        correctOrder,
        initialOrder,
      },
    };
  }
  return null;
}

function synthesizeMultiStrikeFromShards(
  engine: ForgeEngine,
  domains: readonly DomainId[],
  tier: DifficultyTierV4 | undefined,
  excluded: ReadonlySet<number>,
  rng: RngLike,
  subcategoryId?: string,
): QuestionCardV4 | null {
  const manifest = engine.getUnifiedManifest();
  if (!manifest) return null;

  const eligibleTables: Array<{
    dom: DomainId;
    chunk: ShardChunkData;
    ti: number;
    spec: ShardTableTypeSpec;
    cfg: MultiStrikeTableConfig;
  }> = [];

  for (const dom of domains) {
    const chunks = engine.getLoadedShardChunksForDomain(dom);
    for (const chunk of chunks) {
      for (let ti = 0; ti < chunk.t.length; ti++) {
        const tbl = chunk.t[ti];
        const cfg = MULTISTRIKE_TABLE_CONFIGS.find((c) => c.type === tbl.type);
        const spec = chunk.types?.[tbl.type] ?? manifest.types[tbl.type];
        if (cfg && spec && tbl.r.length >= 12) {
          eligibleTables.push({ dom, chunk, ti, spec, cfg });
        }
      }
    }
  }
  if (eligibleTables.length === 0) return null;
  rng.shuffleInPlace(eligibleTables);

  for (const entry of eligibleTables) {
    const { dom, chunk, ti, spec, cfg } = entry;
    const rows = chunk.t[ti].r;
    const pool = chunk.p;
    const poolCols = new Set<number>(spec.poolCols ?? []);
    const rowIndices = collectEligibleRowsForTier(chunk, ti, spec, tier);
    if (rowIndices.length < 10) continue;

    // Group clean entries by groupCol
    const groups = new Map<string, Array<{ ri: number; label: string; group: string }>>();
    const seenLabels = new Set<string>();
    for (const ri of rowIndices) {
      const r = rows[ri];
      let label = sanitizeTriviaCopy(resolveCellValue(r, cfg.labelCol, poolCols, pool).trim());
      const group = sanitizeTriviaCopy(resolveCellValue(r, cfg.groupCol, poolCols, pool).trim());
      if (!label || !group || label.length > 32 || group.length > 28) continue;
      if (/^[a-z]/.test(label)) label = label[0].toUpperCase() + label.slice(1);
      const lLow = label.toLowerCase();
      const gLow = group.toLowerCase();
      if (lLow === gLow || (gLow.length >= 4 && lLow.includes(gLow))) continue;
      if (seenLabels.has(lLow)) continue;
      seenLabels.add(lLow);
      let list = groups.get(group);
      if (!list) {
        list = [];
        groups.set(group, list);
      }
      list.push({ ri, label, group });
    }

    const richGroups = Array.from(groups.entries()).filter(([, list]) => list.length >= 3);
    if (richGroups.length < 2) continue;
    rng.shuffleInPlace(richGroups);

    const [targetGroup, targetItems] = richGroups[0];
    const otherItems = richGroups
      .slice(1)
      .flatMap(([, list]) => list)
      .filter((item) => item.group.toLowerCase() !== targetGroup.toLowerCase());
    if (otherItems.length < 3) continue;

    rng.shuffleInPlace(targetItems);
    rng.shuffleInPlace(otherItems);

    const strikeMode: 'PICK_ALL_TRUE' | 'SPOT_THE_IMPOSTER' =
      (rng.nextUint32() & 1) === 0 ? 'PICK_ALL_TRUE' : 'SPOT_THE_IMPOSTER';

    const true3 = targetItems.slice(0, 3);
    if (strikeMode === 'PICK_ALL_TRUE') {
      const false3 = otherItems.slice(0, 3);
      const all6 = [
        ...true3.map((x) => ({ label: x.label, isTarget: true, ri: x.ri })),
        ...false3.map((x) => ({ label: x.label, isTarget: false, ri: x.ri })),
      ];
      rng.shuffleInPlace(all6);
      const options: MultiStrikeOption[] = all6.map((x, i) => ({
        optionId: `o${i + 1}`,
        label: x.label,
        isTarget: x.isTarget,
      }));
      const qid = 2_600_000 + (fnv1a32(`MS_ALL:${cfg.type}:${all6.map((x) => x.ri).join(',')}`) % 190_000);
      if (excluded.has(qid)) continue;

      return {
        qid,
        format: 'MULTI_STRIKE',
        domainId: dom,
        wedgeId: domainToWedgeColor(dom),
        categoryLabel: sanitizeTriviaCopy(spec.l1Category || getForgeDomainInfo(dom).name),
        wittyHeader: pickWittyHeaderForCard(dom, spec.l1Category, 'MULTI_STRIKE', qid),
        ...(subcategoryId ? { subcategoryId } : {}),
        difficultyTier: tier ?? 'COLLEGE',
        recommendedSec: 28,
        readInGraceSec: 2.0,
        prompt: sanitizeTriviaCopy(cfg.pickAllPrompt(targetGroup)),
        funFactWhy: sanitizeTriviaCopy(cfg.whyPickAll(targetGroup, true3.map((x) => x.label))),
        helpfulHint: sanitizeTriviaCopy(
          `Exactly 3 of the 6 cards belong to ${targetGroup}—spot the geographic or stylistic outliers first.`,
        ),
        multiStrike: {
          strikeMode: 'PICK_ALL_TRUE',
          targetCount: 3,
          options,
        },
      };
    }

    // SPOT_THE_IMPOSTER: 3 belonging to targetGroup + 1 imposter (isTarget: true)
    const imposter = otherItems[0];
    const all4 = [
      ...true3.map((x) => ({ label: x.label, isTarget: false, ri: x.ri })),
      { label: imposter.label, isTarget: true, ri: imposter.ri },
    ];
    rng.shuffleInPlace(all4);
    const options: MultiStrikeOption[] = all4.map((x, i) => ({
      optionId: `o${i + 1}`,
      label: x.label,
      isTarget: x.isTarget,
    }));
    const qid = 2_800_000 + (fnv1a32(`MS_IMP:${cfg.type}:${all4.map((x) => x.ri).join(',')}`) % 190_000);
    if (excluded.has(qid)) continue;

    return {
      qid,
      format: 'MULTI_STRIKE',
      domainId: dom,
      wedgeId: domainToWedgeColor(dom),
      categoryLabel: sanitizeTriviaCopy(spec.l1Category || getForgeDomainInfo(dom).name),
      wittyHeader: 'Imposter Alert',
      ...(subcategoryId ? { subcategoryId } : {}),
      difficultyTier: tier ?? 'COLLEGE',
      recommendedSec: 28,
      readInGraceSec: 2.0,
      prompt: sanitizeTriviaCopy(cfg.imposterPrompt(targetGroup)),
      funFactWhy: sanitizeTriviaCopy(cfg.whyImposter(targetGroup, imposter.label, imposter.group)),
      helpfulHint: sanitizeTriviaCopy(
        `Three of these belong together in ${targetGroup}; one belongs to a completely different home.`,
      ),
      multiStrike: {
        strikeMode: 'SPOT_THE_IMPOSTER',
        targetCount: 1,
        options,
      },
    };
  }
  return null;
}

function synthesizeBlitzMultipleChoiceFromShards(
  engine: ForgeEngine,
  domains: readonly DomainId[],
  tier: DifficultyTierV4 | undefined,
  excluded: ReadonlySet<number>,
  rng: RngLike,
  subcategoryId?: string,
): QuestionCardV4 | null {
  const manifest = engine.getUnifiedManifest();
  if (!manifest) return null;

  const blitzSpecs: ReadonlyArray<{
    type: string;
    subjCol: number;
    ansCol: number;
    makePrompt: (subj: string) => string;
    makeWhy: (subj: string, ans: string) => string;
    makeHint: (cat: string) => string;
  }> = [
    { type: 'soc_country', subjCol: 0, ansCol: 1, makePrompt: (s) => `Capital of ${s}?`, makeWhy: (s, a) => `${a} serves as the official national capital of ${s}.`, makeHint: () => 'Think of the seat of government, not necessarily the biggest port.' },
    { type: 'sci_element', subjCol: 0, ansCol: 1, makePrompt: (s) => `Chemical symbol for ${s}?`, makeWhy: (s, a) => `On the periodic table, ${s} carries the official symbol ${a}.`, makeHint: () => 'Check both its English name and any classic Latin root.' },
    { type: 'pop_film', subjCol: 0, ansCol: 1, makePrompt: (s) => `Who directed ${s}?`, makeWhy: (s, a) => `${a} directed the film ${s}.`, makeHint: () => 'Match the film’s signature tone to its auteur.' },
    { type: 'lit_work', subjCol: 0, ansCol: 1, makePrompt: (s) => `Who wrote ${s}?`, makeWhy: (s, a) => `${a} authored "${s}".`, makeHint: () => 'Think of the literary era and genre of the title.' },
    { type: 'art_work', subjCol: 0, ansCol: 1, makePrompt: (s) => `Who created ${s}?`, makeWhy: (s, a) => `${a} created the celebrated work "${s}".`, makeHint: () => 'Picture the artistic movement behind the piece.' },
    { type: 'geo_city', subjCol: 0, ansCol: 1, makePrompt: (s) => `Which country is ${s} in?`, makeWhy: (s, a) => `${s} is a major metropolis located in ${a}.`, makeHint: () => 'Place the city on its continent first.' },
    { type: 'sport_athlete', subjCol: 0, ansCol: 1, makePrompt: (s) => `${s}’s signature sport?`, makeWhy: (s, a) => `${s} achieved global fame competing in ${a}.`, makeHint: () => 'Picture the arena, court, or pitch where they became a legend.' },
    { type: 'food_item', subjCol: 0, ansCol: 2, makePrompt: (s) => `Home country of ${s}?`, makeWhy: (s, a) => `${s} is a celebrated culinary tradition from ${a}.`, makeHint: () => 'Listen to the dish’s native language for a quick clue.' },
    { type: 'tech_company', subjCol: 0, ansCol: 3, makePrompt: (s) => `Home country of ${s}?`, makeWhy: (s, a) => `${s} was founded in ${a}.`, makeHint: () => 'Think of where this global brand keeps its flagship headquarters.' },
  ];

  const domOrder = [...domains];
  rng.shuffleInPlace(domOrder);

  for (const dom of domOrder) {
    const chunks = engine.getLoadedShardChunksForDomain(dom);
    for (const chunk of chunks) {
      for (let ti = 0; ti < chunk.t.length; ti++) {
        const tbl = chunk.t[ti];
        const bSpec = blitzSpecs.find((b) => b.type === tbl.type);
        const spec = chunk.types?.[tbl.type] ?? manifest.types[tbl.type];
        if (!bSpec || !spec) continue;
        const poolCols = new Set<number>(spec.poolCols ?? []);
        const eligible = collectEligibleRowsForTier(chunk, ti, spec, tier);
        if (eligible.length < 6) continue;
        rng.shuffleInPlace(eligible);

        for (const ri of eligible.slice(0, 20)) {
          const row = tbl.r[ri];
          const subj = sanitizeTriviaCopy(resolveCellValue(row, bSpec.subjCol, poolCols, chunk.p).trim());
          const ans = sanitizeTriviaCopy(resolveCellValue(row, bSpec.ansCol, poolCols, chunk.p).trim());
          if (!subj || !ans || subj.length > 26 || ans.length > 28) continue;
          const prompt = sanitizeTriviaCopy(bSpec.makePrompt(subj));
          if (countWords(prompt) > 8) continue;
          const qid = 3_000_000 + (fnv1a32(`BLITZ:${tbl.type}:${ri}`) % 140_000);
          if (excluded.has(qid)) continue;

          const dists: string[] = [];
          const seen = new Set<string>([ans.toLowerCase()]);
          for (const dri of eligible) {
            if (dri === ri) continue;
            const dVal = sanitizeTriviaCopy(resolveCellValue(tbl.r[dri], bSpec.ansCol, poolCols, chunk.p).trim());
            if (!dVal || dVal.length > 28 || seen.has(dVal.toLowerCase())) continue;
            seen.add(dVal.toLowerCase());
            dists.push(dVal);
            if (dists.length === 3) break;
          }
          if (dists.length < 3) continue;

          const allChoices = [ans, ...dists];
          rng.shuffleInPlace(allChoices);
          const correctIndex = allChoices.indexOf(ans) as 0 | 1 | 2 | 3;

          return {
            qid,
            format: 'MULTIPLE_CHOICE',
            domainId: dom,
            wedgeId: domainToWedgeColor(dom),
            categoryLabel: sanitizeTriviaCopy(spec.l1Category || getForgeDomainInfo(dom).name),
            wittyHeader: 'Lightning Blitz!',
            ...(subcategoryId ? { subcategoryId } : {}),
            difficultyTier: tier ?? 'HIGH_SCHOOL',
            recommendedSec: 12,
            readInGraceSec: 2.0,
            prompt,
            funFactWhy: sanitizeTriviaCopy(bSpec.makeWhy(subj, ans)),
            helpfulHint: bSpec.makeHint(spec.l1Category),
            choices: [allChoices[0], allChoices[1], allChoices[2], allChoices[3]],
            correctIndex,
          };
        }
      }
    }
  }
  return null;
}

function synthesizeShardMcqOrEscalator(
  engine: ForgeEngine,
  format: 'MULTIPLE_CHOICE' | 'CLUE_ESCALATOR' | 'PINPOINT_DIAL',
  domains: readonly DomainId[],
  tier: DifficultyTierV4 | undefined,
  excluded: ReadonlySet<number>,
  isLightningBlitz: boolean,
  rng: RngLike,
  subcategoryId?: string,
): QuestionCardV4 | null {
  const manifest = engine.getUnifiedManifest();
  if (!manifest) return null;

  const wantArch = format === 'PINPOINT_DIAL' ? 'CALIBRATOR_DIAL' : 'SIGHTLINE_LOCK';
  const domOrder = [...domains];
  rng.shuffleInPlace(domOrder);

  for (const dom of domOrder) {
    const chunks = engine.getLoadedShardChunksForDomain(dom);
    if (chunks.length === 0) continue;
    for (let attempt = 0; attempt < 48; attempt++) {
      const chunk = chunks[rng.nextInt(0, chunks.length - 1)];
      if (chunk.t.length === 0) continue;
      const ti = rng.nextInt(0, chunk.t.length - 1);
      const tbl = chunk.t[ti];
      const spec = chunk.types?.[tbl.type] ?? manifest.types[tbl.type];
      if (!spec || tbl.r.length === 0) continue;

      const angleCandidates = spec.angles
        .map((a, idx) => ({ a, idx }))
        .filter(
          ({ a }) =>
            a.archetype === wantArch &&
            a.id !== 'la_role' &&
            a.id !== 'lm_type' &&
            a.id !== 'ac_disc' &&
            a.id !== 'hw_rev',
        );
      if (angleCandidates.length === 0) continue;
      const { idx: ai } = angleCandidates[rng.nextInt(0, angleCandidates.length - 1)];

      const eligible = collectEligibleRowsForTier(chunk, ti, spec, tier);
      if (eligible.length === 0) continue;
      const ri = eligible[rng.nextInt(0, eligible.length - 1)];
      const qid = tbl.baseQid + ri * spec.angles.length + ai;
      if (excluded.has(qid) || engine.seenTracker.hasSeen(qid)) continue;

      const raw = decodeShardRawQuestion(manifest, chunk, ti, ri, ai, 3);
      if (!raw || !isCleanShardCandidate(raw)) continue;

      const pq = normalizeToPrismQuestion(raw, {
        facetCount: 4,
        shuffleSalt: rng.nextUint32(),
      });
      if (tier && !doesCandidateMatchDifficultyPreset(raw, tier, { allowAdjacent: true })) {
        // Re-align difficultyTier cleanly when fame-gated
        pq.difficultyTier = tier;
      }

      const seed = rng.nextUint32();
      if (format === 'PINPOINT_DIAL') {
        const card = convertPrismToPinpointV4(pq, seed, subcategoryId);
        if (card) return card;
      } else if (format === 'CLUE_ESCALATOR') {
        const card = convertPrismToClueEscalatorV4(pq, seed, subcategoryId);
        if (card) return card;
      } else {
        const card = convertPrismToMultipleChoiceV4(pq, isLightningBlitz, seed, subcategoryId);
        if (card) return card;
      }
    }
  }
  return null;
}

// ============================================================================
// CURATED V4 PACK & TIER-1 SELECTION HELPERS (CURATED ALWAYS SERVES FIRST!)
// ============================================================================

function pickCuratedV4Card(
  engine: ForgeEngine,
  format: QuestionFormatV4,
  domains: readonly DomainId[],
  tier: DifficultyTierV4 | undefined,
  isLightningBlitz: boolean,
  excluded: ReadonlySet<number>,
  rng: RngLike,
  subcategoryId?: string,
): QuestionCardV4 | null {
  const allCurated = engine.getCuratedV4Cards();
  if (allCurated.length === 0) return null;

  const domSet = new Set<number>(domains);
  const subLow = subcategoryId?.trim().toLowerCase();

  const tierRank = (t: DifficultyTierV4): number => {
    switch (t) {
      case 'MIDDLE_SCHOOL': return 0;
      case 'HIGH_SCHOOL': return 1;
      case 'COLLEGE': return 2;
      case 'GRADUATE': return 3;
      case 'MENSA': return 4;
    }
  };

  for (let pass = 0; pass < 3; pass++) {
    const candidates = allCurated.filter((card) => {
      if (card.format !== format) return false;
      if (excluded.has(card.qid)) return false;
      if (pass < 2 && engine.seenTracker.hasSeen(card.qid)) return false;
      if (!domSet.has(card.domainId)) return false;
      if (isLightningBlitz && format === 'MULTIPLE_CHOICE' && pass === 0 && countWords(card.prompt) > 8) {
        return false;
      }
      if (subLow && pass === 0) {
        const hay = `${card.subcategoryId ?? ''} ${card.categoryLabel} ${card.prompt}`.toLowerCase();
        if (!hay.includes(subLow.replace(/^[a-z]+_/, '').replace(/_/g, ' '))) {
          return false;
        }
      }
      if (tier) {
        const delta = Math.abs(tierRank(card.difficultyTier) - tierRank(tier));
        if (pass === 0 && delta > 0) return false;
        if (pass === 1 && delta > 1) return false;
      }
      return isCleanCardText(card);
    });

    if (candidates.length > 0) {
      const picked = candidates[rng.nextInt(0, candidates.length - 1)];
      const words = countWords(picked.prompt);
      const recommendedSec =
        picked.format === 'MULTIPLE_CHOICE'
          ? isLightningBlitz && words <= 8
            ? 12
            : 28
          : picked.recommendedSec;
      return {
        ...picked,
        recommendedSec,
        readInGraceSec: 2.0,
        ...(subcategoryId && !picked.subcategoryId ? { subcategoryId } : {}),
      };
    }
  }
  return null;
}

function pickFromCuratedLegacyPacks(
  engine: ForgeEngine,
  format: 'MULTIPLE_CHOICE' | 'PINPOINT_DIAL' | 'CLUE_ESCALATOR' | 'VISUAL_SPOTTER',
  domains: readonly DomainId[],
  tier: DifficultyTierV4 | undefined,
  isLightningBlitz: boolean,
  excluded: ReadonlySet<number>,
  rng: RngLike,
  subcategoryId?: string,
): QuestionCardV4 | null {
  const domSet = new Set<number>(domains);

  if (format === 'VISUAL_SPOTTER') {
    const visualPool = engine.getVisualGlobeRecords().filter((r) => {
      if (excluded.has(r.qid)) return false;
      if (!isCleanShardCandidate(r)) return false;
      return domSet.has(r.l0Domain);
    });
    const unseen = visualPool.filter((r) => !engine.seenTracker.hasSeen(r.qid));
    const activePool = unseen.length > 0 ? unseen : visualPool;
    if (activePool.length > 0) {
      rng.shuffleInPlace(activePool);
      for (const raw of activePool.slice(0, 20)) {
        const pq = normalizeToPrismQuestion(raw, { facetCount: 4, shuffleSalt: rng.nextUint32() });
        const card = convertPrismToVisualSpotterV4(pq, rng.nextUint32(), subcategoryId);
        if (card) return card;
      }
    }
    // Widen to any domain's Visual/Globe pack if requested domain had none left unseen
    const globalVis = engine
      .getVisualGlobeRecords()
      .filter((r) => !excluded.has(r.qid) && !engine.seenTracker.hasSeen(r.qid) && isCleanShardCandidate(r));
    if (globalVis.length > 0) {
      const raw = globalVis[rng.nextInt(0, globalVis.length - 1)];
      const pq = normalizeToPrismQuestion(raw, { facetCount: 4, shuffleSalt: rng.nextUint32() });
      const card = convertPrismToVisualSpotterV4(pq, rng.nextUint32(), subcategoryId);
      if (card) return card;
    }
    return null;
  }

  // MULTIPLE_CHOICE, PINPOINT_DIAL, CLUE_ESCALATOR from curated Tier-1 packs
  // (Jeopardy Signature + Gold Venue + Clean Gold Core + Clean Trivia API!)
  const wantArch = format === 'PINPOINT_DIAL' ? 'CALIBRATOR_DIAL' : 'SIGHTLINE_LOCK';
  const rawPool: RawQuestionRecord[] = [];
  for (const dom of domains) {
    const records = engine.getCleanTier1Records(dom);
    for (const r of records) {
      if (r.archetype !== wantArch) continue;
      if (excluded.has(r.qid)) continue;
      if (!isCleanShardCandidate(r)) continue;
      if (isLightningBlitz && format === 'MULTIPLE_CHOICE' && countWords(r.prompt) > 8) continue;
      rawPool.push(r);
    }
  }

  if (rawPool.length === 0) return null;

  // Score unseen curated packs highest (Jeopardy / Gold Venue / Gold Core first!)
  const scored: Array<{ r: RawQuestionRecord; s: number }> = [];
  for (const r of rawPool) {
    const unseen = !engine.seenTracker.hasSeen(r.qid);
    if (!unseen) continue;
    const diff = scoreQuestionDifficulty(r);
    if (tier && !doesCandidateMatchDifficultyPreset(r, tier, { allowAdjacent: true, assessment: diff })) {
      continue;
    }
    let s = 0;
    if (r.qid >= 1_090_000) s += 42;
    else if (r.qid >= 1_060_000 && r.qid < 1_070_000) s += 36;
    else if (r.qid >= 50_000 && r.qid < 60_000) s += 34;
    else if (r.qid <= 832) s += 32;
    else s += 14;
    if (tier && diff.difficultyTier === tier) s += 20;
    s += rng.nextFloat() * 14;
    scored.push({ r, s });
  }

  if (scored.length === 0) return null;
  scored.sort((a, b) => b.s - a.s);
  const top = scored.slice(0, Math.min(12, scored.length));
  rng.shuffleInPlace(top);

  for (const item of top) {
    const pq = normalizeToPrismQuestion(item.r, { facetCount: 4, shuffleSalt: rng.nextUint32() });
    const seed = rng.nextUint32();
    if (format === 'PINPOINT_DIAL') {
      const card = convertPrismToPinpointV4(pq, seed, subcategoryId);
      if (card) return card;
    } else if (format === 'CLUE_ESCALATOR') {
      const card = convertPrismToClueEscalatorV4(pq, seed, subcategoryId);
      if (card) return card;
    } else {
      const card = convertPrismToMultipleChoiceV4(pq, isLightningBlitz, seed, subcategoryId);
      if (card) return card;
    }
  }

  return null;
}

// ============================================================================
// PRIMARY PUBLIC ENTRY POINTS: `drawQuestionCardV4` & `drawQuestionCardV4Sync`
// ============================================================================

/**
 * Synchronous 0ms question card drawer (used for instant boot / fallback / offline sync paths).
 * Draws from loaded curated packs -> loaded shards -> compact 7-format emergency fallback.
 */
export function drawQuestionCardV4Sync(opts: DrawQuestionCardV4Options = {}): QuestionCardV4 {
  const engine = opts.engine ?? forgeEngine;
  const rng: RngLike =
    opts.seed !== undefined ? new DeterministicRng(opts.seed) : sharedCryptoRng;
  const format = resolveTargetFormat(opts, rng);
  const domains = resolveTargetDomains(opts);
  const excluded = buildExcludedSet(opts);
  const isBlitz = Boolean(opts.isLightningBlitz);

  // 1. Curated v4 witty pack FIRST (unless caller explicitly requested dynamic shards for scale testing)
  if (!opts.preferDynamicShards) {
    const curatedHit = pickCuratedV4Card(
      engine,
      format,
      domains,
      opts.difficultyTier,
      isBlitz,
      excluded,
      rng,
      opts.subcategoryId,
    );
    if (curatedHit) return curatedHit;

    // 2. Curated legacy packs (Jeopardy Signature 1,764 + Gold Venue 640 + Visual/Globe 340 + Gold Core 832)
    if (
      format === 'MULTIPLE_CHOICE' ||
      format === 'PINPOINT_DIAL' ||
      format === 'CLUE_ESCALATOR' ||
      format === 'VISUAL_SPOTTER'
    ) {
      const legacyCurated = pickFromCuratedLegacyPacks(
        engine,
        format,
        domains,
        opts.difficultyTier,
        isBlitz,
        excluded,
        rng,
        opts.subcategoryId,
      );
      if (legacyCurated) return legacyCurated;
    }
  }

  // 3. Dynamic multi-row synthesis over fame-gated 500k+ structured fact shards!
  if (format === 'MATCH_4') {
    const m4 = synthesizeMatch4FromShards(engine, domains, opts.difficultyTier, excluded, rng, opts.subcategoryId);
    if (m4) return m4;
  } else if (format === 'SORT_4') {
    const s4 = synthesizeSort4FromShards(engine, domains, opts.difficultyTier, excluded, rng, opts.subcategoryId);
    if (s4) return s4;
  } else if (format === 'MULTI_STRIKE') {
    const ms = synthesizeMultiStrikeFromShards(engine, domains, opts.difficultyTier, excluded, rng, opts.subcategoryId);
    if (ms) return ms;
  } else if (format === 'MULTIPLE_CHOICE' && isBlitz) {
    const blitz = synthesizeBlitzMultipleChoiceFromShards(engine, domains, opts.difficultyTier, excluded, rng, opts.subcategoryId);
    if (blitz) return blitz;
  } else if (format === 'MULTIPLE_CHOICE' || format === 'CLUE_ESCALATOR' || format === 'PINPOINT_DIAL') {
    const shardCard = synthesizeShardMcqOrEscalator(
      engine,
      format,
      domains,
      opts.difficultyTier,
      excluded,
      isBlitz,
      rng,
      opts.subcategoryId,
    );
    if (shardCard) return shardCard;
  }

  // 4. Cross-layer fallback: retry curated v4 even if preferDynamicShards or tier relaxed, then Visual/Legacy
  const relaxedCurated = pickCuratedV4Card(
    engine,
    format,
    domains,
    undefined,
    false,
    excluded,
    rng,
    opts.subcategoryId,
  );
  if (relaxedCurated) return relaxedCurated;

  if (
    format === 'MULTIPLE_CHOICE' ||
    format === 'PINPOINT_DIAL' ||
    format === 'CLUE_ESCALATOR' ||
    format === 'VISUAL_SPOTTER'
  ) {
    const relaxedLegacy = pickFromCuratedLegacyPacks(
      engine,
      format,
      domains,
      undefined,
      false,
      excluded,
      rng,
      opts.subcategoryId,
    );
    if (relaxedLegacy) return relaxedLegacy;
  }

  // Retry curated v4 across all domains for the exact requested format
  const anyDomainCurated = pickCuratedV4Card(
    engine,
    format,
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    undefined,
    false,
    excluded,
    rng,
    opts.subcategoryId,
  );
  if (anyDomainCurated) return anyDomainCurated;

  // 5. Emergency built-in 0ms fallback matching requested format
  const emergency =
    EMERGENCY_FALLBACK_CARDS_V4.find((c) => c.format === format) ?? EMERGENCY_FALLBACK_CARDS_V4[0];
  return emergency;
}

/**
 * Primary async entry point for World's Smartest v4.0:
 * Ensures ForgeEngine packs & requested domain shards are loaded, prioritizes curated witty packs
 * first, and seamlessly taps 500k+ fame-gated structured fact shards across ALL 7 formats!
 */
export async function drawQuestionCardV4(
  opts: DrawQuestionCardV4Options = {},
): Promise<QuestionCardV4> {
  const engine = opts.engine ?? forgeEngine;
  if (!engine.isInitialized()) {
    await engine.init();
  }
  const domains = resolveTargetDomains(opts);
  const rng: RngLike =
    opts.seed !== undefined ? new DeterministicRng(opts.seed) : sharedCryptoRng;
  const format = resolveTargetFormat(opts, rng);

  // Lazy-load domain shard(s) when needed for dynamic synthesis or when curated pool is getting thin
  const targetShardDomain = domains[rng.nextInt(0, domains.length - 1)];
  const needsShards =
    opts.preferDynamicShards ||
    format === 'MATCH_4' ||
    format === 'SORT_4' ||
    format === 'MULTI_STRIKE' ||
    Boolean(opts.subcategoryId);

  if (needsShards && !engine.isDomainShardLoaded(targetShardDomain)) {
    await engine.ensureDomainShardLoaded(targetShardDomain);
  } else if (opts.subcategoryId) {
    await engine.ensureTopicShardsLoaded({
      domains,
      l2TopicId: opts.subcategoryId,
      l1SubcategoryId: opts.subcategoryId,
    });
  }

  const card = drawQuestionCardV4Sync({ ...opts, format, engine });
  // If we hit emergency fallback and domain shard wasn't loaded yet, load shard & retry once!
  if (card.qid >= 1_099_900 && !engine.isDomainShardLoaded(targetShardDomain)) {
    await engine.ensureDomainShardLoaded(targetShardDomain);
    return drawQuestionCardV4Sync({ ...opts, format, engine });
  }
  return card;
}

/**
 * Convenience deck builder drawing `count` non-repeating `QuestionCardV4`s with varied formats.
 */
export async function drawQuestionDeckV4(
  count: number,
  opts: DrawQuestionCardV4Options = {},
): Promise<QuestionCardV4[]> {
  const safeCount = clamp(Math.trunc(count), 1, 50);
  const formatsPool =
    opts.allowedFormats && opts.allowedFormats.length > 0
      ? opts.allowedFormats
      : ALL_QUESTION_FORMATS_V4;
  const excluded = buildExcludedSet(opts);
  const deck: QuestionCardV4[] = [];

  for (let i = 0; i < safeCount; i++) {
    const fmt = opts.format ?? formatsPool[i % formatsPool.length];
    const card = await drawQuestionCardV4({
      ...opts,
      format: fmt,
      excludeQids: excluded,
      seed: opts.seed !== undefined ? (opts.seed + i * 7919) >>> 0 : undefined,
    });
    excluded.add(card.qid);
    deck.push(card);
  }
  return deck;
}

// ============================================================================
// 100% HONEST 7-FORMAT EVALUATOR (`evaluateSubmissionV4`)
// Exact invariant: `netPointsDelta === basePoints + bonusPoints + wagerDeltaPoints`
// ============================================================================

function formatCorrectSummaryLabel(card: QuestionCardV4): string {
  switch (card.format) {
    case 'MULTIPLE_CHOICE': {
      const idx = card.correctIndex ?? 0;
      return sanitizeTriviaCopy(card.choices?.[idx] ?? 'Verified Answer');
    }
    case 'VISUAL_SPOTTER': {
      const vs = card.visualSpotter;
      const idx = vs?.correctIndex ?? card.correctIndex ?? 0;
      return sanitizeTriviaCopy(vs?.choices[idx] ?? card.choices?.[idx] ?? 'Visual Target');
    }
    case 'CLUE_ESCALATOR': {
      const esc = card.escalator;
      const idx = esc?.correctIndex ?? card.correctIndex ?? 0;
      return sanitizeTriviaCopy(esc?.choices[idx] ?? card.choices?.[idx] ?? 'Escalator Answer');
    }
    case 'MATCH_4': {
      const pairs = card.match4?.pairs ?? [];
      return sanitizeTriviaCopy(pairs.map((p) => `${p.leftPrompt} = ${p.rightAnswer}`).join(' · '));
    }
    case 'SORT_4': {
      const order = card.sort4?.correctOrder ?? [];
      return sanitizeTriviaCopy(order.map((o) => `${o.label} (${o.formattedValue})`).join(' -> '));
    }
    case 'MULTI_STRIKE': {
      const targets = (card.multiStrike?.options ?? []).filter((o) => o.isTarget).map((o) => o.label);
      return sanitizeTriviaCopy(targets.join(', '));
    }
    case 'PINPOINT_DIAL': {
      const pp = card.pinpoint;
      if (!pp) return 'Exact Target';
      const numStr = formatCleanTriviaNumber(pp.exactVal, pp.unitLabel, card.prompt);
      return sanitizeTriviaCopy(pp.unitLabel ? `${numStr} ${pp.unitLabel}` : numStr);
    }
  }
}

export function evaluateSubmissionV4(
  card: QuestionCardV4,
  sub: AnswerSubmissionV4,
  baseTilePoints: number,
): EvaluatedAnswerV4 {
  const tileBase = Math.max(0, Math.round(Number.isFinite(baseTilePoints) ? baseTilePoints : 200));
  const doubleDown = Boolean(sub.doubleDownArmed);
  const doubleDownMissPenalty = doubleDown ? -Math.round(tileBase * 0.5) : 0;
  const correctSummaryLabel = formatCorrectSummaryLabel(card);

  if (sub.timedOut) {
    const wagerDeltaPoints = doubleDownMissPenalty;
    return {
      isCorrect: false,
      accuracyRatio: 0,
      isBullseyeOrSweep: false,
      basePoints: 0,
      bonusPoints: 0,
      wagerDeltaPoints,
      netPointsDelta: wagerDeltaPoints,
      correctSummaryLabel,
      detailBreakdown: doubleDown
        ? `Time expired (${wagerDeltaPoints} Double Down penalty)`
        : 'Time expired (+0 pts)',
    };
  }

  switch (card.format) {
    case 'MULTIPLE_CHOICE':
    case 'VISUAL_SPOTTER': {
      const correctIdx =
        card.format === 'VISUAL_SPOTTER'
          ? (card.visualSpotter?.correctIndex ?? card.correctIndex ?? 0)
          : (card.correctIndex ?? 0);
      const isCorrect = sub.chosenIndex === correctIdx;
      const basePoints = isCorrect ? tileBase : 0;
      const bonusPoints = 0;
      const wagerDeltaPoints = doubleDown ? (isCorrect ? tileBase : doubleDownMissPenalty) : 0;
      const netPointsDelta = basePoints + bonusPoints + wagerDeltaPoints;
      return {
        isCorrect,
        accuracyRatio: isCorrect ? 1 : 0,
        isBullseyeOrSweep: isCorrect && !sub.used5050 && !sub.usedHint,
        basePoints,
        bonusPoints,
        wagerDeltaPoints,
        netPointsDelta,
        correctSummaryLabel,
        detailBreakdown: isCorrect
          ? doubleDown
            ? `+${basePoints} Base +${wagerDeltaPoints} Double Down = +${netPointsDelta}`
            : `+${basePoints} Base`
          : doubleDown
            ? `Missed (${wagerDeltaPoints} Double Down risk)`
            : 'Missed (+0 pts)',
      };
    }

    case 'CLUE_ESCALATOR': {
      const correctIdx = card.escalator?.correctIndex ?? card.correctIndex ?? 0;
      const isCorrect = sub.chosenIndex === correctIdx;
      const cluesRevealed = clamp(Math.trunc(sub.escalatorCluesRevealed ?? 3), 1, 3) as 1 | 2 | 3;
      const multiplier = 4 - cluesRevealed; // Clue 1 -> 3x, Clue 2 -> 2x, Clue 3 -> 1x
      const basePoints = isCorrect ? tileBase : 0;
      const bonusPoints = isCorrect ? tileBase * (multiplier - 1) : 0;
      const wagerDeltaPoints = doubleDown ? (isCorrect ? tileBase : doubleDownMissPenalty) : 0;
      const netPointsDelta = basePoints + bonusPoints + wagerDeltaPoints;
      return {
        isCorrect,
        accuracyRatio: isCorrect ? 1 : 0,
        isBullseyeOrSweep: isCorrect && cluesRevealed === 1,
        basePoints,
        bonusPoints,
        wagerDeltaPoints,
        netPointsDelta,
        correctSummaryLabel,
        detailBreakdown: isCorrect
          ? `Clue ${cluesRevealed} Lock (${multiplier}x): +${basePoints} Base${bonusPoints > 0 ? ` +${bonusPoints} Early Bonus` : ''}${wagerDeltaPoints > 0 ? ` +${wagerDeltaPoints} Double Down` : ''} = +${netPointsDelta}`
          : doubleDown
            ? `Missed on Clue ${cluesRevealed} (${wagerDeltaPoints} Double Down risk)`
            : `Missed on Clue ${cluesRevealed} (+0 pts)`,
      };
    }

    case 'MATCH_4': {
      const pairs = card.match4?.pairs ?? [];
      const links = sub.match4Links ?? {};
      let matched = 0;
      for (const p of pairs) {
        if (links[p.pairId] === p.pairId) matched++;
      }
      const totalPairs = Math.max(1, pairs.length);
      const accuracyRatio = Number((matched / totalPairs).toFixed(2));
      const isSweep = matched === totalPairs;
      const isCorrect = matched >= Math.max(1, totalPairs - 1); // 3/4 or 4/4 passes
      const basePoints = isSweep
        ? tileBase
        : isCorrect
          ? Math.round(tileBase * 0.75)
          : 0;
      const bonusPoints = isSweep ? Math.round(tileBase * 0.25) : 0;
      const wagerDeltaPoints = doubleDown ? (isCorrect ? basePoints : doubleDownMissPenalty) : 0;
      const netPointsDelta = basePoints + bonusPoints + wagerDeltaPoints;
      return {
        isCorrect,
        accuracyRatio,
        isBullseyeOrSweep: isSweep,
        basePoints,
        bonusPoints,
        wagerDeltaPoints,
        netPointsDelta,
        correctSummaryLabel,
        detailBreakdown: isSweep
          ? `4/4 Clean Sweep: +${basePoints} Base +${bonusPoints} Sweep Bonus${wagerDeltaPoints > 0 ? ` +${wagerDeltaPoints} Double Down` : ''} = +${netPointsDelta}`
          : isCorrect
            ? `${matched}/${totalPairs} Matches: +${basePoints} Partial Credit${wagerDeltaPoints > 0 ? ` +${wagerDeltaPoints} Double Down` : ''} = +${netPointsDelta}`
            : doubleDown
              ? `${matched}/${totalPairs} Matches (${wagerDeltaPoints} Double Down risk)`
              : `${matched}/${totalPairs} Matches (+0 pts)`,
      };
    }

    case 'SORT_4': {
      const correctOrder = card.sort4?.correctOrder ?? [];
      const submittedIds = Array.isArray(sub.sort4Ids) ? sub.sort4Ids : [];
      let exactSlots = 0;
      for (let i = 0; i < correctOrder.length; i++) {
        if (submittedIds[i] === correctOrder[i].itemId) exactSlots++;
      }
      const total = Math.max(1, correctOrder.length);
      const accuracyRatio = Number((exactSlots / total).toFixed(2));
      const isCorrect = exactSlots === total;
      const basePoints = isCorrect ? tileBase : 0;
      const bonusPoints = isCorrect ? Math.round(tileBase * 0.25) : 0;
      const wagerDeltaPoints = doubleDown ? (isCorrect ? tileBase : doubleDownMissPenalty) : 0;
      const netPointsDelta = basePoints + bonusPoints + wagerDeltaPoints;
      return {
        isCorrect,
        accuracyRatio,
        isBullseyeOrSweep: isCorrect,
        basePoints,
        bonusPoints,
        wagerDeltaPoints,
        netPointsDelta,
        correctSummaryLabel,
        detailBreakdown: isCorrect
          ? `4/4 Perfect Order: +${basePoints} Base +${bonusPoints} Order Bonus${wagerDeltaPoints > 0 ? ` +${wagerDeltaPoints} Double Down` : ''} = +${netPointsDelta}`
          : doubleDown
            ? `${exactSlots}/${total} Slots Correct (${wagerDeltaPoints} Double Down risk)`
            : `${exactSlots}/${total} Slots Correct (+0 pts)`,
      };
    }

    case 'MULTI_STRIKE': {
      const spec = card.multiStrike;
      const options = spec?.options ?? [];
      const targetIds = new Set(options.filter((o) => o.isTarget).map((o) => o.optionId));
      const chosenIds = new Set(sub.multiStrikeIds ?? []);
      let hits = 0;
      let falsePositives = 0;
      for (const cid of chosenIds) {
        if (targetIds.has(cid)) hits++;
        else falsePositives++;
      }
      const targetCount = Math.max(1, targetIds.size);
      const isExactSweep = hits === targetCount && falsePositives === 0;
      const accuracyRatio = Number(
        clamp((hits - falsePositives * 0.5) / targetCount, 0, 1).toFixed(2),
      );
      const isCorrect = isExactSweep;
      const basePoints = isCorrect ? tileBase : 0;
      const bonusPoints =
        isCorrect && spec?.strikeMode === 'PICK_ALL_TRUE' ? Math.round(tileBase * 0.25) : 0;
      const wagerDeltaPoints = doubleDown ? (isCorrect ? tileBase : doubleDownMissPenalty) : 0;
      const netPointsDelta = basePoints + bonusPoints + wagerDeltaPoints;
      return {
        isCorrect,
        accuracyRatio,
        isBullseyeOrSweep: isExactSweep,
        basePoints,
        bonusPoints,
        wagerDeltaPoints,
        netPointsDelta,
        correctSummaryLabel,
        detailBreakdown: isCorrect
          ? `${hits}/${targetCount} Clean Strike: +${basePoints} Base${bonusPoints > 0 ? ` +${bonusPoints} Sweep Bonus` : ''}${wagerDeltaPoints > 0 ? ` +${wagerDeltaPoints} Double Down` : ''} = +${netPointsDelta}`
          : doubleDown
            ? `${hits}/${targetCount} Hits, ${falsePositives} Wrong (${wagerDeltaPoints} Double Down risk)`
            : `${hits}/${targetCount} Hits, ${falsePositives} Wrong (+0 pts)`,
      };
    }

    case 'PINPOINT_DIAL': {
      const pp = card.pinpoint;
      if (!pp) {
        return {
          isCorrect: false,
          accuracyRatio: 0,
          isBullseyeOrSweep: false,
          basePoints: 0,
          bonusPoints: 0,
          wagerDeltaPoints: doubleDownMissPenalty,
          netPointsDelta: doubleDownMissPenalty,
          correctSummaryLabel,
          detailBreakdown: 'Missing pinpoint spec',
        };
      }
      const submitted = Number(sub.pinpointValue);
      const diff = Number.isFinite(submitted) ? Math.abs(submitted - pp.exactVal) : Infinity;
      const isBullseye = diff <= pp.bullseyeRadius;
      const isWin = diff <= pp.winRadius;
      const span = Math.max(1, pp.maxVal - pp.minVal);
      const accuracyRatio = isBullseye
        ? 1
        : isWin
          ? Number(
              clamp(
                1 - ((diff - pp.bullseyeRadius) / Math.max(1, pp.winRadius - pp.bullseyeRadius)) * 0.4,
                0.6,
                0.99,
              ).toFixed(2),
            )
          : Number(clamp(1 - diff / span, 0, 0.55).toFixed(2));
      const basePoints = isWin ? tileBase : 0;
      const bonusPoints = isBullseye ? tileBase : 0;
      const wagerDeltaPoints = doubleDown ? (isWin ? tileBase : doubleDownMissPenalty) : 0;
      const netPointsDelta = basePoints + bonusPoints + wagerDeltaPoints;
      const offLabel = Number.isFinite(diff)
        ? `Off by ${formatCleanTriviaNumber(diff, pp.unitLabel)}${pp.unitLabel ? ` ${pp.unitLabel}` : ''}`
        : 'No dial input';

      return {
        isCorrect: isWin,
        accuracyRatio,
        isBullseyeOrSweep: isBullseye,
        basePoints,
        bonusPoints,
        wagerDeltaPoints,
        netPointsDelta,
        correctSummaryLabel,
        detailBreakdown: isBullseye
          ? `BULLSEYE (${offLabel}): +${basePoints} Base +${bonusPoints} Bullseye${wagerDeltaPoints > 0 ? ` +${wagerDeltaPoints} Double Down` : ''} = +${netPointsDelta}`
          : isWin
            ? `In the Zone (${offLabel}): +${basePoints} Base${wagerDeltaPoints > 0 ? ` +${wagerDeltaPoints} Double Down` : ''} = +${netPointsDelta}`
            : doubleDown
              ? `Outside Zone (${offLabel}; ${wagerDeltaPoints} Double Down risk)`
              : `Outside Zone (${offLabel}; +0 pts)`,
      };
    }
  }
}
