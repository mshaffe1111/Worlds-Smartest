// ============================================================================
// WORLD'S SMARTEST — DETERMINISTIC MILLION-SCALE SHARD DECODER & NORMALIZER
// Mirrors tools/validate_million_shards.py 1:1 (exact 32-bit FNV-1a via Math.imul)
// + Deterministic Graded Codex Synthesis + 5-Morph PrismQuestion Normalizer
// ============================================================================

import { scoreQuestionDifficulty } from './QuestionDifficultyCalibration';
import {
  getCampaignStageSpec,
  getForgeDomainInfo,
  type Archetype3D,
  type CalibratorDialSpec,
  type CalibratorToleranceCone,
  type ClueTierTuple,
  type CodexRingSpec,
  type DomainId,
  type FacetSlotLetter,
  type GauntletPlateSpec,
  type GlobePinDropSpec,
  type GlyphHint,
  type HeroRelicId,
  type NarrativeTag,
  type PrismQuestion,
  type QuestionSourceTier,
  type RawDistractor,
  type RawQuestionRecord,
  type ShardAngleSpec,
  type ShardChunkData,
  type ShardDecoderSpec,
  type ShardManifest,
  type ShardTableTypeSpec,
  type SightlineFacet,
  type ToneTag,
  type VisualLensPlateSpec,
} from './types';

export const CODEX_SYNTHESIS_BASE_QID = 995_000;
export const CODEX_SYNTHESIS_PER_DOMAIN = 4_200; // 12 * 4,200 = 50,400 -> QIDs 995,000..1,045,399 (<= 1,048,575)

const SLOT_LETTERS: ReadonlyArray<FacetSlotLetter> = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Exact 36 SDF Holographic Core Glyphs from public/assets/glyphs/manifest.json (3 per L0 Domain) */
export const DOMAIN_SDF_GLYPHS: Record<DomainId, readonly [string, string, string]> = {
  0: ['double_eagle', 'astrolabe', 'wax_seal_scroll'],
  1: ['atom_orbital', 'prism_refraction', 'ringed_planet'],
  2: ['compass_rose', 'globe_grid', 'volcano'],
  3: ['ionic_column', 'gothic_rose', 'painters_palette'],
  4: ['apollo_lyre', 'cinema_reel', 'vinyl_waveform'],
  5: ['olympic_torch', 'victory_laurel', 'chronograph_dial'],
  6: ['cipher_key', 'quantum_chip', 'neural_network'],
  7: ['dna_helix', 'botanical_frond', 'nautilus_shell'],
  8: ['scales_treaty', 'gavel_charter', 'diplomatic_olive'],
  9: ['horology_gears', 'artisan_amphora', 'alembic_flask'],
  10: ['grimoire_quill', 'trident_crown', 'ouroboros_sun'],
  11: ['fibonacci_spiral', 'chess_knight', 'mobius_infinity'],
};

const VALID_SDF_GLYPH_SET = new Set<string>(
  Object.values(DOMAIN_SDF_GLYPHS).flatMap((triplet) => [...triplet]),
);

const GLYPH_KEYWORD_RULES: ReadonlyArray<{ glyphId: string; pattern: RegExp }> = [
  { glyphId: 'wax_seal_scroll', pattern: /treaty|charter|constitution|decree|magna|code|edict/i },
  { glyphId: 'astrolabe', pattern: /chronometer|longitude|navigation|voyage|explorer|calendar|century/i },
  { glyphId: 'ringed_planet', pattern: /planet|exoplanet|orbit|moon|solar|galaxy|nebula|comet|telescope|space/i },
  { glyphId: 'prism_refraction', pattern: /light|optics|laser|wavelength|spectrum|photon|refraction/i },
  { glyphId: 'volcano', pattern: /volcano|mountain|peak|caldera|summit|tectonic|eruption|glacier/i },
  { glyphId: 'globe_grid', pattern: /latitude|longitude|equator|hemisphere|meridian|timezone|continent/i },
  { glyphId: 'painters_palette', pattern: /painting|painter|canvas|portrait|fresco|impressionis|baroque|museum/i },
  { glyphId: 'gothic_rose', pattern: /cathedral|gothic|dome|basilica|chapel|abbey|stained/i },
  { glyphId: 'cinema_reel', pattern: /film|movie|director|cinema|oscar|academy award|animation|screen/i },
  { glyphId: 'vinyl_waveform', pattern: /album|song|band|singer|symphony|opera|jazz|vinyl|acoustic/i },
  { glyphId: 'chronograph_dial', pattern: /record|seconds|race|lap|marathon|sprint|speed|formula/i },
  { glyphId: 'victory_laurel', pattern: /champion|cup|grand slam|medal|title|tournament|trophy/i },
  { glyphId: 'quantum_chip', pattern: /semiconductor|transistor|processor|cpu|chip|quantum|hardware|circuit/i },
  { glyphId: 'neural_network', pattern: /ai|neural|algorithm|software|web|internet|protocol|network/i },
  { glyphId: 'botanical_frond', pattern: /plant|tree|flower|forest|botan|leaf|seed|fungi|crop/i },
  { glyphId: 'nautilus_shell', pattern: /ocean|marine|fish|coral|mollusk|whale|shark|shell|amphibian/i },
  { glyphId: 'gavel_charter', pattern: /court|judge|supreme|statute|trial|criminal|constitutional|law/i },
  { glyphId: 'diplomatic_olive', pattern: /united nations|embassy|diplomat|alliance|summit|peace|geneva|council/i },
  { glyphId: 'alembic_flask', pattern: /ferment|wine|tea|coffee|distill|spice|umami|flavor|chemistry/i },
  { glyphId: 'artisan_amphora', pattern: /ceramic|pottery|dish|cuisine|bread|cheese|culinary|textile|porcelain/i },
  { glyphId: 'trident_crown', pattern: /god|goddess|zeus|odin|poseidon|olympus|deity|pantheon|hero/i },
  { glyphId: 'ouroboros_sun', pattern: /egypt|ra|solar|underworld|creation|alchemy|eternal|oracle|folklore/i },
  { glyphId: 'chess_knight', pattern: /chess|game|strategy|cipher|enigma|puzzle|sudoku|grid|knight/i },
  { glyphId: 'mobius_infinity', pattern: /topology|infinity|calculus|prime|theorem|set|geometry|proof/i },
];

export function resolveSdfGlyphId(raw: RawQuestionRecord, domId: DomainId): string {
  if (raw.glyphId && VALID_SDF_GLYPH_SET.has(raw.glyphId)) {
    return raw.glyphId;
  }
  const triplet = DOMAIN_SDF_GLYPHS[domId] ?? DOMAIN_SDF_GLYPHS[0];
  const blob = `${raw._glyphKw ?? ''} ${raw.l1Category ?? ''} ${raw.l2Subcategory ?? ''} ${raw.prompt ?? ''}`;
  // Prefer domain-local keyword match first so the glyph stays thematically aligned with DomainId!
  for (const rule of GLYPH_KEYWORD_RULES) {
    if (triplet.includes(rule.glyphId) && rule.pattern.test(blob)) {
      return rule.glyphId;
    }
  }
  // Deterministic rotation across the 3 domain SDF glyphs for visual variety
  const idx = fnv1a32(`GLYPH:${raw.qid}:${raw.l1Category ?? ''}`) % 3;
  return triplet[idx];
}

const LITERARY_ROLE_HYPERNYMS = new Set<string>([
  'writer',
  'novelist',
  'poet',
  'playwright',
  "children's author",
  'author',
  'essayist',
  'screenwriter',
  'dramatist',
]);

const MYTHIC_ROLE_HYPERNYMS = new Set<string>([
  'mythological figure',
  'legendary figure',
  'folklore figure',
  'mythic hero',
]);

const ARTIST_DISCIPLINE_HYPERNYMS = new Set<string>([
  'painter',
  'sculptor',
  'architect',
  'photographer',
  'illustrator',
  'printmaker',
]);

const QUARANTINED_TIER1_QIDS = new Set<number>([
  983, 1167, 1333, 1547, 1850, 2769, 3639, 3852, 3885, 6624, 9578, 10522, 13680,
]);

const JUNK_DISTRACTOR_SET = new Set<string>([
  'unknown',
  'n/a',
  'none',
  'other',
  'none of the above',
  'all of the above',
]);

const STOPWORD_TOKENS = new Set<string>([
  'united',
  'states',
  'kingdom',
  'republic',
  'empire',
  'north',
  'south',
  'saint',
  'mount',
  'river',
  'island',
  'islands',
  'great',
  'national',
  'international',
  'world',
  'first',
  'second',
  'third',
  'street',
  'avenue',
  'square',
  'bridge',
  'palace',
  'castle',
  'museum',
  'temple',
  'church',
  'cathedral',
  'mosque',
  'observatory',
  'telescope',
  'station',
  'railway',
  'airport',
  'university',
  'college',
  'institute',
  'academy',
  'society',
  'council',
  'nations',
  'league',
  'province',
  'region',
  'county',
  'district',
  'dynasty',
  'battle',
  'treaty',
  'crisis',
  'revolution',
  'system',
  'effect',
  'theorem',
  'number',
  'constant',
  'formula',
  'principle',
  'protocol',
  'language',
  'software',
  'network',
  'london',
]);

const YEAR_UNIT_RE = /^(?:ce|bce|ad|bc|c\.e\.|b\.c\.e\.|a\.d\.|b\.c\.|year|yr)$/i;

const YEAR_PROMPT_RE =
  /\b(what year|which year|in what year|when was|when did|born|died|founded|opened|inducted|established|debuted|world series|season|released in|published in|fought in)\b/i;

const YEAR_COL_RE =
  /^(?:year|yr|debut|born|died|founded|opened|inducted|established|birth_year|death_year|release_year|start_year|end_year)$/i;

/**
 * Determines whether a numeric trivia value represents a calendar year/date
 * (which must NEVER be formatted with thousands commas: `1984`, NEVER `1,984`).
 */
export function isYearNumberContext(
  val: number,
  unit?: string,
  promptContext?: string,
  colName?: string,
): boolean {
  const uTrim = (unit ?? '').trim();
  const pTrim = (promptContext ?? '').trim();
  const cTrim = (colName ?? '').trim();

  if (YEAR_UNIT_RE.test(uTrim)) {
    return true;
  }

  if (!uTrim) {
    if (pTrim && YEAR_PROMPT_RE.test(pTrim)) {
      return true;
    }
    if (val >= 1000 && val <= 2120) {
      if (cTrim && YEAR_COL_RE.test(cTrim)) {
        return true;
      }
      if (pTrim && /\b(?:year|yr)\b/i.test(pTrim)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Formats a numeric trivia value with typographic hygiene:
 * - Calendar years & dates ALWAYS render as plain integers (`1984`, NEVER `1,984`).
 * - Non-year quantities (`km`, `meters`, `seats`, `hits`, `RBIs`, `strikeouts`, `PTS`)
 *   render with crisp `en-US` thousands separators (`40,075`, `5,714`, `13.8`).
 */
export function formatCleanTriviaNumber(
  val: number,
  unit?: string,
  promptContext?: string,
  colName?: string,
): string {
  if (!Number.isFinite(val)) {
    return Number.isNaN(val) ? '0' : String(val);
  }
  if (isYearNumberContext(val, unit, promptContext, colName)) {
    return String(Math.round(val));
  }
  if (Math.abs(val - Math.round(val)) < 1e-9) {
    return Math.round(val).toLocaleString('en-US');
  }
  return val.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

const NON_ARTICLE_AFTER_A = new Set<string>([
  'and',
  'or',
  'is',
  'are',
  'in',
  'into',
  'above',
  'over',
  'under',
  'onto',
  'equals',
  'equal',
  'at',
  'of',
  'on',
  'up',
  'out',
  'off',
  'as',
  'if',
  'after',
  'about',
  'against',
  'along',
  'among',
  'around',
  'across',
  'also',
  'already',
  'always',
  'away',
  'either',
  'else',
]);

const LABEL_BEFORE_CAP_A_RE =
  /\b(?:concert|stock|type|vitamin|grade|series|group|class|plan|model|option|facet|letter|note|key|point|set|matrix|vector|side|angle|node|vertex|team|line|route|zone|track|tier|phase|part|section|appendix|figure|table|column|row|level|stage|act|category|module|unit|factor|blood|hepatitis|influenza|studio|annex|wing|deck|pier|gate|terminal|block|lot|hall|building|room|suite|seat|box|card|list|test|sample|specimen|solution|compound|drug|protein|gene|enzyme|receptor|channel|wave|band|ray|form|schedule|title|rule|article|clause|subpart|exhibit|item|choice|answer|statement|assertion|element|variable|parameter|constant|function|object|body|mass|charge|particle|atom|ion|mapping|let|for|if|where|when|of|from|to|between|than|versus|vs\.?)\s+$/i;

export function fixIndefiniteArticles(text: string): string {
  if (!text) return text;
  return text.replace(
    /(?<![A-Za-z0-9-])([Aa]) ([AEIOUaeiou][a-zA-Z0-9-]{2,})\b/g,
    (full, art: string, word: string, offset: number, str: string) => {
      const wLow = word.toLowerCase();
      if (NON_ARTICLE_AFTER_A.has(wLow)) {
        return full;
      }
      if (art === 'A') {
        const before = str.slice(Math.max(0, offset - 28), offset);
        if (LABEL_BEFORE_CAP_A_RE.test(before)) {
          return full;
        }
      }
      // Keep "a" before U-initial acronyms/hyphenated forms ("a UNESCO", "a USDA", "a UPC", "a U-shaped") & Roman numerals ("a IIIrd")
      if (/^(?:U[A-Z]|U-|II|III|IV\b|IX\b)/.test(word)) {
        return full;
      }
      // Keep "a" before phonetic /ju:/ or /w/ vowel-letter openings ("a university", "a unicycle", "a unicellular", "a uterus", "a European", "a ewe", "a uranium", "a one-way")
      if (
        /^(?:unanim|uni(?:c|d|f|l|o|p|q|s|t|v|x)|us(?:a|e|u)|utah|uter|utens|util|uro|ura|uku|ukrain|ubiquit|ugand|uruguay|u-?boat|u-?turn|eu[a-z]|ewe|one|once|ouija)/i.test(
          word,
        )
      ) {
        return full;
      }
      return `${art === 'A' ? 'An' : 'an'} ${word}`;
    },
  );
}

const US_CA_POSTAL_CODES = new Set<string>([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS',
  'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY', 'DC', 'PR', 'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK',
  'YT', 'UK',
]);

const AMBIGUOUS_POSTAL_WORDS = new Set<string>([
  'AL', 'DE', 'HI', 'IN', 'LA', 'MA', 'ME', 'OK', 'ON', 'OR', 'PA', 'OH', 'PE',
]);

const NON_CITY_ABBREVS = new Set<string>([
  'vs', 'v', 'st', 'mt', 'ft', 'dr', 'mr', 'mrs', 'ms', 'jr', 'sr', 'no', 'co', 'lt', 'capt', 'gen',
  'prof', 'rev', 'sen', 'rep', 'gov', 'hon', 'sgt', 'col', 'maj', 'adm', 'fig', 'vol', 'ch', 'sec',
  'art', 'ed', 'inc', 'ltd', 'corp', 'univ', 'est', 'approx', 'etc', 'jan', 'feb', 'mar', 'apr',
  'aug', 'sep', 'sept', 'oct', 'nov', 'dec', 'dept', 'assn', 'bros', 'ave', 'blvd', 'rd', 'ln',
  'pl', 'sq', 'hwy', 'pkwy', 'ste', 'bldg', 'al', 'op', 'et',
]);

const KEEP_DOT_BEFORE_Q_RE =
  /(?:(?:[A-Za-z]\.){1,}[A-Za-z]|\b(?:Jr|Sr|Inc|Ltd|Co|Corp|Dr|Mr|Mrs|Ms|St|Mt|Ft|etc|vs|Prof|Rev|Gen|Col|Lt|Sgt|No|Vol|Fig|Bros|Dept|Assn|Ave|Blvd|Rd|Sq|a\.m|p\.m|Ph\.D|M\.D|B\.A|M\.A))$/i;

const HTML_NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  lsquo: "'",
  rsquo: "'",
  ldquo: '"',
  rdquo: '"',
  hellip: '...',
  deg: '°',
  times: '×',
  divide: '÷',
  minus: '−',
  plusmn: '±',
  eacute: 'é',
  egrave: 'è',
  ecirc: 'ê',
  uuml: 'ü',
  ouml: 'ö',
  auml: 'ä',
  ntilde: 'ñ',
  ccedil: 'ç',
  oacute: 'ó',
  aacute: 'á',
  iacute: 'í',
  uacute: 'ú',
  shy: '',
};

const NON_YEAR_FOLLOW_RE =
  /^(?:,\d{3}|\+|\s*-\s*year|\s+(?:years?\b|yrs?\b|light-?years?\b|thousand\b|million\b|billion\b|trillion\b|protons?\b|km\b|kilometers?\b|kilometres?\b|m\b|meters?\b|metres?\b|feet\b|ft\b|miles?\b|mi\b|blocks?\b|planks?\b|pieces?\b|parts?\b|steps?\b|pages?\b|rooms?\b|species\b|hits?\b|hr\b|rbis?\b|strikeouts?\b|seats?\b|people\b|trees?\b|islands?\b|reefs?\b|fish\b|games?\b|points?\b|pts\b|dollars?\b|tons?\b|kg\b|g\b|grams?\b|seconds?\b|minutes?\b|hours?\b|days?\b|months?\b|percent\b|times?\b|atmospheres?\b|floodlights?\b|k\b|°)|%|\s*m\/s|\s*km\/h|\s*g\/mol)/i;

const QUANTITY_PREFIX_BEFORE_YEAR_RE =
  /\b(?:over|under|than|nearly|almost|about|roughly|approximately|around|of|has|have|had|with|won|scored|hit|struck|played|recorded)\s+$/i;

function decodeHtmlEntities(input: string): string {
  if (!input.includes('&')) return input;
  let out = input;
  for (let pass = 0; pass < 2; pass++) {
    const next = out
      .replace(/&#x([0-9a-fA-F]+);/g, (m, hex: string) => {
        const cp = parseInt(hex, 16);
        if (cp === 160) return ' ';
        return cp >= 32 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
      })
      .replace(/&#(\d+);/g, (m, dec: string) => {
        const cp = parseInt(dec, 10);
        if (cp === 160) return ' ';
        return cp >= 32 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
      })
      .replace(/&([a-zA-Z]+);/g, (m, name: string) => {
        const rep = HTML_NAMED_ENTITIES[name.toLowerCase()];
        return rep !== undefined ? rep : m;
      });
    if (next === out) break;
    out = next;
  }
  return out;
}

function stripCalendarYearCommas(text: string): string {
  if (!/[1-9],\d{3}/.test(text)) return text;
  let s = text;
  // 1. Era suffixes ("1,863 CE" -> "1863 CE", "1,200 BCE" -> "1200 BCE")
  s = s.replace(/\b([1-9]),(\d{3})(?!,\d{3}|\d)\s+(BCE|BC|B\.C\.E\.|B\.C\.)\b/gi, '$1$2 $3');
  s = s.replace(/\b([12]),(\d{3})(?!,\d{3}|\d)\s+(CE|AD|C\.E\.|A\.D\.)\b/gi, '$1$2 $3');
  // 2. Era / circa prefixes ("AD 1,066" -> "AD 1066", "c. 1,450" -> "c. 1450")
  s = s.replace(/\b(AD|CE|A\.D\.|C\.E\.|circa|ca\.|c\.)\s+([12]),(\d{3})(?!,\d{3}|\d)\b/gi, '$1 $2$3');
  // 3. Parenthesized years ("(1,903)" -> "(1903)", "(b. 1,879)" -> "(b. 1879)")
  s = s.replace(
    /(\(\s*(?:(?:b\.|d\.|born|died|founded|opened|established|est\.|debut|inducted|released|published|formed|launched|built|c\.|circa|MLB games from|first MLB game)\s+)?)([12]),(\d{3})(?=\s*(?:\)|[–—-]\s*[12],?\d{3}|\s*(?:CE|BCE|AD|BC)\b))/gi,
    '$1$2$3',
  );
  // 4. Year ranges ("1,914–1,918" -> "1914–1918", "1,939–45" -> "1939–45")
  s = s.replace(
    /\b(1,\d{3}|2,0\d{2}|2,1[01]\d|2,120)(?!,\d{3}|\d)(\s*[–—-]\s*)(1,\d{3}|2,0\d{2}|2,1[01]\d|2,120|[12]\d{3}|\d{2})(?!,\d{3}|\d)\b/g,
    (m, y1: string, dash: string, y2: string, off: number, full: string) => {
      if (NON_YEAR_FOLLOW_RE.test(full.slice(off + m.length))) return m;
      return `${y1.replace(',', '')}${dash}${y2.replace(',', '')}`;
    },
  );
  // 5. Decades ("1,960s" -> "1960s")
  s = s.replace(/\b(1,\d{2}0|2,0\d0)s\b/g, (_m, y: string) => `${y.replace(',', '')}s`);
  // 6. Month [day,] year ("July 20, 1,969" -> "July 20, 1969")
  s = s.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan\.?|Feb\.?|Mar\.?|Apr\.?|Jun\.?|Jul\.?|Aug\.?|Sep\.?|Sept\.?|Oct\.?|Nov\.?|Dec\.?)(\s+(?:\d{1,2}(?:st|nd|rd|th)?,?\s+)?)(1,\d{3}|2,0\d{2}|2,1[01]\d|2,120)(?!,\d{3}|\d)\b/gi,
    (_m, mon: string, mid: string, yr: string) => `${mon}${mid}${yr.replace(',', '')}`,
  );
  // 7. Preposition/verb + year ("in 1,984" -> "in 1984", "between 1,960 and 2,005" -> "between 1960 and 2005")
  s = s.replace(
    /\b(in|on|born|died|founded|opened|established|inducted|debut|debuted|released|published|fought|signed|launched|premiered|formed|created|built|completed|discovered|invented|dated|since|until|before|after|by|around|year|season|between|from)(\s+)(1,\d{3}|2,0\d{2}|2,1[01]\d|2,120)(?!,\d{3}|\d)(?:(\s+(?:and|to|through)\s+)(1,\d{3}|2,0\d{2}|2,1[01]\d|2,120)(?!,\d{3}|\d))?\b/gi,
    (
      m,
      prep: string,
      sp: string,
      y1: string,
      mid: string | undefined,
      y2: string | undefined,
      off: number,
      full: string,
    ) => {
      const tail = full.slice(off + m.length);
      if (NON_YEAR_FOLLOW_RE.test(tail)) return m;
      // Do not partially strip the start of a dashed numeric range already preserved by Rule 4 (e.g. "around 1,320–1,330 kilometers")
      if (!mid && /^\s*[–—-]\s*\d/.test(tail)) return m;
      const clean1 = y1.replace(',', '');
      if (mid && y2) return `${prep}${sp}${clean1}${mid}${y2.replace(',', '')}`;
      return `${prep}${sp}${clean1}`;
    },
  );
  // 8. Year before named events/editions ("1,984 World Series" -> "1984 World Series")
  s = s.replace(
    /\b(1,\d{3}|2,0\d{2}|2,1[01]\d|2,120)(?!,\d{3}|\d)(\s+)(World Series|(?:MLB|NFL|NBA|NHL|FIFA)\s+(?:season|draft|finals|playoffs|all-star|mvp|championship|world)|Olympics?|Summer\s+Olympics?|Winter\s+Olympics?|Super Bowl|Stanley Cup|World Cup|Grand Slam|season|election|treaty|census|film|movie|novel|album|song|edition|pilot|charter|constitution|revolution|war|uprising|massacre|convention|expedition|championship|tournament|cup)\b/gi,
    (m, yr: string, sp: string, noun: string, off: number, full: string) => {
      const before = full.slice(Math.max(0, off - 20), off);
      if (QUANTITY_PREFIX_BEFORE_YEAR_RE.test(before)) return m;
      return `${yr.replace(',', '')}${sp}${noun}`;
    },
  );
  return s;
}

function fixCityStatePeriods(text: string): string {
  if (!text.includes('.')) return text;
  return text.replace(
    /\b([A-Z][a-zA-Z'-]{1,24})\.\s+([A-Z]{2})(?=[?.!,;)\]\s]|$)/g,
    (m, city: string, st: string, off: number, full: string) => {
      if (!US_CA_POSTAL_CODES.has(st)) return m;
      if (NON_CITY_ABBREVS.has(city.toLowerCase())) return m;
      const after = full.slice(off + m.length);
      const isEndOrPunct = /^(?:[?.!,;)\]]|$|\s+\()/.test(after);
      if (!isEndOrPunct) {
        if (AMBIGUOUS_POSTAL_WORDS.has(st)) return m;
        if (
          !/^\s+(?:in|from|to|at|for|with|was|is|were|are|until|since|during|and|\d{4})\b/.test(
            after,
          )
        ) {
          return m;
        }
      }
      return `${city}, ${st}`;
    },
  );
}

/**
 * Runtime trivia copy & typography sanitizer applied across every decoded
 * `prompt`, `facets[].text`, `clueTiers[].clueText`, and `whyExplanation`:
 *  - Decodes stray HTML entities (`&quot;`, `&#039;`, `&amp;`, numeric/hex entities)
 *  - Strips commas from calendar years (`in 1,984` -> `in 1984`, `(1,903)` -> `(1903)`, `1,863 CE` -> `1863 CE`)
 *    while preserving legitimate commas in non-year quantities (`40,075 km`, `1,500 years`)
 *  - Repairs `"City. ST?"` typos (`"Detroit. MI?"` -> `"Detroit, MI?"`) without touching `vs. DC` / `St. Louis`
 *  - Repairs stray space-before-punctuation & double punctuation while preserving `...` & `U.S.?`
 *  - Applies safe indefinite article polish (`a urban` -> `an urban`, `a Aircraft` -> `an Aircraft`)
 */
export function sanitizeTriviaCopy(text: string): string {
  if (!text || typeof text !== 'string') return text ?? '';
  let out = decodeHtmlEntities(text);
  out = out.replace(/\u00a0/g, ' ');
  // Repair malformed grouped-thousands templates like "~3821,000" -> "~3,821,000" or "~20938,000" -> "~20,938,000"
  out = out.replace(/\b(\d{1,3})(\d{3}),(\d{3})(?!\d)/g, '$1,$2,$3');
  // Clean raw Lahman baseball award suffixes & league prefix ("ML World Series MVP (winner debut 1995) (2000)" -> "MLB World Series MVP (2000)")
  out = out.replace(/\s*\(winner debut \d{4}\)/gi, '');
  out = out.replace(
    /\bML(?=\s+(?:World Series|Cy Young|Rookie of the Year|MVP|Batting|Pitching|Triple Crown|Gold Glove|Silver Slugger|All-Star|Manager|Reliever|Comeback)\b)/g,
    'MLB',
  );
  out = stripCalendarYearCommas(out);
  out = fixCityStatePeriods(out);
  out = out.replace(/\s+([?,;!])/g, '$1');
  out = out.replace(/([a-zA-Z0-9)\]'\"’”]) +\.(\s|$)/g, '$1.$2');
  out = out.replace(/,{2,}/g, ',');
  out = out.replace(/\?{2,}(?=\s|$|[)"'’”])/g, '?');
  out = out.replace(/(?<![\d)])!{2,}/g, '!');
  out = out.replace(/,\s*\.(?!\.|\d)/g, '.');
  out = out.replace(/(?<![\d)])([?!])\.(?!\.)/g, '$1');
  out = out.replace(/(?<!\.)\.\.(?!\.)/g, (m, off: number, full: string) => {
    const prevCh = off > 0 ? full[off - 1] : '';
    const nextCh = off + 2 < full.length ? full[off + 2] : '';
    // Preserve integer range notation like "1..12" or "{1..9}"
    if (/\d/.test(prevCh) && /\d/.test(nextCh)) return m;
    return '.';
  });
  out = out.replace(/\.([?!])/g, (m, q: string, off: number, full: string) => {
    const prev = full.slice(Math.max(0, off - 12), off);
    if (prev.endsWith('..')) return m;
    if (KEEP_DOT_BEFORE_Q_RE.test(prev)) return m;
    return q;
  });
  out = out.replace(/\b([Tt]he)\s+The(?=\s+[A-Z0-9])/g, '$1');
  out = fixIndefiniteArticles(out);
  out = out.replace(/ {2,}/g, ' ').trim();
  return out;
}

function sanitizeAnswerOrFacet(text: string, promptContext?: string): string {
  const cleaned = sanitizeTriviaCopy(text);
  if (
    promptContext &&
    YEAR_PROMPT_RE.test(promptContext) &&
    /^(?:1,\d{3}|2,0\d{2}|2,1[01]\d|2,120)$/.test(cleaned)
  ) {
    return cleaned.replace(',', '');
  }
  return cleaned;
}

function areHypernymCollidingLabels(aLow: string, bLow: string): boolean {
  if (LITERARY_ROLE_HYPERNYMS.has(aLow) && LITERARY_ROLE_HYPERNYMS.has(bLow)) {
    return true;
  }
  if (MYTHIC_ROLE_HYPERNYMS.has(aLow) && MYTHIC_ROLE_HYPERNYMS.has(bLow)) {
    return true;
  }
  if (ARTIST_DISCIPLINE_HYPERNYMS.has(aLow) && ARTIST_DISCIPLINE_HYPERNYMS.has(bLow)) {
    return true;
  }
  return false;
}

const RE_SHUFFLED_LETTER_REF_OPTION = /^(?:both\s+)?[a-d]\s+and\s+[a-d](?:\s+only)?$/i;

const LEAK_STOPWORDS_EXT = new Set<string>([
  ...STOPWORD_TOKENS,
  'the',
  'of',
  'and',
  'in',
  'to',
  'for',
  'on',
  'at',
  'by',
  'with',
  'from',
  'as',
  'an',
  'or',
  'la',
  'le',
  'de',
  'el',
  'al',
  'von',
  'van',
  'city',
  'river',
  'lake',
  'mount',
  'sea',
  'ocean',
  'park',
  'national',
  'state',
  'states',
  'united',
  'school',
  'empire',
  'kingdom',
  'federation',
  'union',
  'war',
  'act',
  'law',
  'theory',
  'order',
  'house',
  'world',
  'new',
  'old',
  'north',
  'south',
  'east',
  'west',
  'central',
  'upper',
  'lower',
  'great',
  'grand',
  'saint',
  'san',
  'santa',
  'king',
  'queen',
  'prince',
  'princess',
  'emperor',
  'general',
  'president',
  'prime',
  'minister',
  'doctor',
  'sir',
  'lord',
  'lady',
  'club',
  'team',
  'fc',
  'sc',
  'ac',
  'bc',
  'cf',
  'sport',
  'sports',
  'cup',
  'open',
  'championship',
  'series',
  'games',
  'palace',
  'castle',
  'bridge',
  'tower',
  'square',
  'street',
  'avenue',
  'company',
  'corporation',
  'group',
  'bank',
  'press',
  'books',
  'music',
  'records',
  'films',
  'pictures',
  'studios',
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'black',
  'white',
  'red',
  'blue',
  'green',
  'gold',
  'golden',
  'silver',
  'royal',
  'american',
  'british',
  'english',
  'french',
  'german',
  'italian',
  'spanish',
  'russian',
  'chinese',
  'japanese',
  'indian',
  'canadian',
  'australian',
  'peninsula',
  'bay',
  'gulf',
  'strait',
  'cape',
  'valley',
  'desert',
  'forest',
  'part',
  'book',
  'song',
  'film',
  'movie',
  'play',
  'poem',
  'novel',
  'story',
  'tale',
  'chronicle',
  'history',
  'life',
  'time',
  'times',
  'international',
  'global',
  'modern',
  'ancient',
  'classic',
  'classical',
  'major',
  'minor',
  'super',
  'ultra',
  'mega',
  'mini',
  'stadium',
  'arena',
  'field',
  'ballpark',
  'gardens',
  'garden',
  'center',
  'centre',
  'coliseum',
  'dome',
  'bowl',
  'ground',
  'grounds',
]);

function singularStemToken(tok: string): string {
  if (tok.length > 5 && tok.endsWith('ies')) return `${tok.slice(0, -3)}y`;
  if (tok.length > 5 && tok.endsWith('es')) return tok.slice(0, -2);
  if (tok.length > 4 && tok.endsWith('s') && !tok.endsWith('ss')) return tok.slice(0, -1);
  return tok;
}

function hasWordStem(hayLow: string, stem: string): boolean {
  let idx = hayLow.indexOf(stem);
  while (idx !== -1) {
    const beforeOk = idx === 0 || !/[a-z0-9]/.test(hayLow[idx - 1]);
    if (beforeOk) {
      const afterPos = idx + stem.length;
      const tail = hayLow.slice(afterPos, afterPos + 3);
      if (tail === '' || /^[^a-z0-9]|^(?:s|es|ed|er|y)(?:[^a-z0-9]|$)/.test(tail)) {
        return true;
      }
    }
    idx = hayLow.indexOf(stem, idx + 1);
  }
  return false;
}

const BENCHMARK_SLOP_QID_MIN = 4_965;
const BENCHMARK_SLOP_QID_MAX = 20_165;

const RE_EXAM_STEM_SLOP =
  /\b(?:which of the following|all of the following except|none of the above|all of the above|which statement best|which option best|which sentence best|select the correct statement|choose the correct option|the best answer is|statement 1\s*\||statement 2\s*\|)\b/i;

const RE_FILL_IN_BLANK = /_{3,}|\[\s*blank\s*\]|\(\s*blank\s*\)/i;

const RE_ARC_WORKSHEET_SLOP =
  /^(?:jerry|marta|sally|tommy|timmy|billy|bobby|suzy|susie|maria|carlos|jamal|keisha|a student|a teacher|a class|four students|two students|three students|a group of students|some students|a boy|a girl|a scientist is studying|a researcher wants)\b|\b(?:a student wants to|a student is investigating|students are studying|students in a class|teacher asked the class|in an experiment, a student)\b/i;

const RE_MMLU_MATH_SLOP =
  /\b(?:find the derivative|evaluate the integral|characteristic of the ring|suppose that\s+[a-z]\b|let\s+[fgh]\(x\)|homomorphism from|sylow subgroup|abelian group of order|for which values of x|what is the limit as|find the characteristic of)\b|\\(?:frac|int|sum|lim|sqrt|alpha|beta|theta)\b|\bdy\/dx\b/i;

const RE_BOOLQ_TYPO_SLOP = /\binfonity\b|\bTim raines\b/i;

const RE_APOLLO_SPACE_TERMS =
  /\b(?:apollo\s*(?:11|13|17|8|9|10|12|program|mission|spacecraft)|moon landing|lunar module|nasa|neil armstrong|buzz aldrin|space shuttle|saturn v)\b/i;

const RE_ROBOTIC_WHY =
  /stands as the (?:exact |accurate )?(?:verified )?solution|verified\b[^.]{0,60}\b(?:match is|record confirms|answer is|solution is)|(?:record confirms|archive locks in|ledger locks in)\s+["'“]|confirmed (?:true|false|under|in)\b[^.]{0,65}(?:verified record|precise match|accurate answer|stands on|for this)|^false on the\b[^.]{0,50}\brecord:|setting it apart from the three decoys|directly satisfies the\b|is the precise match for this|verified in the meridian ledger/i;

const RE_LOWERCASE_START = /^[a-z](?!H\b|Phone|Pad|Pod|Mac|OS|Bay|RNA|DNA|Sports)/;

/**
 * Detects scraped benchmark/exam slop (MMLU, MMLU-Pro, AI2 ARC, Google BoolQ),
 * fill-in-the-blank school stems, lowercase search queries, and mis-filed Apollo-in-Myth items.
 */
export function isBenchmarkOrExamSlop(raw: Pick<RawQuestionRecord, 'qid' | 'l0Domain' | 'prompt' | 'whyExplanation' | 'microTopicId'>): boolean {
  // Block the entire QID 4,965..20,165 MMLU / MMLU-Pro / AI2 ARC / Google BoolQ partition in questions.json
  if (raw.qid >= BENCHMARK_SLOP_QID_MIN && raw.qid <= BENCHMARK_SLOP_QID_MAX) {
    return true;
  }
  const promptTrim = String(raw.prompt ?? '').trim();
  if (!promptTrim) return true;

  const promptCore = promptTrim.replace(/^["'“‘(\[]+/, '').trim();
  if (RE_LOWERCASE_START.test(promptCore)) {
    return true;
  }
  if (
    RE_FILL_IN_BLANK.test(promptTrim) ||
    RE_EXAM_STEM_SLOP.test(promptTrim) ||
    RE_ARC_WORKSHEET_SLOP.test(promptTrim) ||
    RE_MMLU_MATH_SLOP.test(promptTrim) ||
    RE_BOOLQ_TYPO_SLOP.test(promptTrim)
  ) {
    return true;
  }
  // Never allow Apollo 11 / NASA spaceflight items mis-filed under Domain 10 (Myth & Literature)
  if (raw.l0Domain === 10 && RE_APOLLO_SPACE_TERMS.test(promptTrim)) {
    return true;
  }
  return false;
}

/**
 * Detects zero-info robotic template explanations (`"stands as the exact verified solution"`,
 * `"The verified ... record confirms"`, `"archive locks in"`, etc.).
 */
export function hasRoboticWhyExplanation(why?: string | null): boolean {
  if (!why || typeof why !== 'string') return false;
  return RE_ROBOTIC_WHY.test(why.trim());
}

const RE_CATALOG_ENTITY_NAME =
  /^(?:HD|HIP|GJ|K2|KOI|TOI|WASP|HAT-?P|OGLE|Kepler|TRAPPIST|PSR|CoRoT|LHS|WD|NGC|IC|UGC|PGC|MACS|Abell|SDSS|2MASS|Gliese|Ross|Wolf|BD|CD|CPD|HR|PSO|CFBDS|WISE|DENIS|EPIC|TIC|Gaia|MOA|KELT|QATAR|HATS|TrES|XO|SWEEPS|OTV|Kosmos|Cosmos|USA)[-+\s]?\d/i;

export function isObscureCatalogEntityName(name: string): boolean {
  return RE_CATALOG_ENTITY_NAME.test(String(name ?? '').trim());
}

/**
 * Fame & Familiarity Gate for structured fact shards:
 * Ensures `MIDDLE_SCHOOL`..`COLLEGE` tiers never pull pop-15k obscure towns,
 * catalog exoplanets (`HD ...`, `Kepler-...`, `PSR ...`), `NGC`/`MACS` deep-sky catalogs,
 * or obscure synthetic chemicals — reserving deep cuts strictly for `GRADUATE` / `MENSA`.
 */
export function isShardRowFamousEnoughForTier(
  typeId: string,
  row: ReadonlyArray<string | number>,
  spec: Pick<ShardTableTypeSpec, 'cols' | 'poolCols'>,
  pool: ReadonlyArray<string>,
  rowIdx: number,
  totalRows: number,
  tier?: 'MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'COLLEGE' | 'GRADUATE' | 'MENSA' | null,
): boolean {
  if (!tier || tier === 'GRADUATE' || tier === 'MENSA') {
    return true;
  }

  // Strictly reserve exoplanet discovery catalogs for GRADUATE / MENSA
  if (typeId === 'sci_exoplanet' || typeId === 'sub_sci_exo_deep') {
    return false;
  }

  const poolCols = new Set<number>(spec.poolCols ?? []);
  const entityName = resolveCell(row, 0, poolCols, pool).trim();
  if (!entityName || isObscureCatalogEntityName(entityName)) {
    return false;
  }

  // City population familiarity gate (`geo_city`: col 3 is pop_k in thousands)
  if (typeId === 'geo_city') {
    const popColIdx = spec.cols.indexOf('pop_k');
    const popK = popColIdx >= 0 ? Number(row[popColIdx]) : 0;
    if (tier === 'MIDDLE_SCHOOL') {
      return Number.isFinite(popK) && popK >= 1200 && rowIdx < 320;
    }
    if (tier === 'HIGH_SCHOOL') {
      return Number.isFinite(popK) && popK >= 500 && rowIdx < 900;
    }
    // COLLEGE: >= 200k cities only (never obscure pop-15k towns!)
    return Number.isFinite(popK) && popK >= 200 && rowIdx < 2400;
  }

  // Chemical familiarity gate: only household molecules in Middle/High/College
  if (typeId === 'sci_chemical') {
    if (tier === 'MIDDLE_SCHOOL') return rowIdx < 45;
    if (tier === 'HIGH_SCHOOL') return rowIdx < 140;
    return rowIdx < 400;
  }

  // Astronomical deep-sky objects: keep named icons (Pleiades, Andromeda, Orion Nebula) in lower tiers
  if (typeId === 'sci_astro') {
    if (tier === 'MIDDLE_SCHOOL') return rowIdx < 30;
    if (tier === 'HIGH_SCHOOL') return rowIdx < 90;
    return rowIdx < 220;
  }

  const rank01 = totalRows > 1 ? rowIdx / (totalRows - 1) : 0;
  if (tier === 'MIDDLE_SCHOOL') {
    const maxRow = totalRows <= 220 ? Math.ceil(totalRows * 0.45) : Math.min(220, Math.max(35, Math.floor(totalRows * 0.08)));
    return rowIdx <= maxRow && (totalRows <= 220 || rank01 <= 0.09);
  }
  if (tier === 'HIGH_SCHOOL') {
    const maxRow = totalRows <= 220 ? Math.ceil(totalRows * 0.72) : Math.min(650, Math.max(90, Math.floor(totalRows * 0.22)));
    return rowIdx <= maxRow && (totalRows <= 220 || rank01 <= 0.24);
  }
  // COLLEGE
  const maxRow = totalRows <= 220 ? totalRows : Math.min(1800, Math.max(180, Math.floor(totalRows * 0.45)));
  return rowIdx <= maxRow && (totalRows <= 220 || rank01 <= 0.46);
}

/**
 * Runtime prose hygiene & anti-slop quarantine check:
 *   1. Blocks 100% of MMLU, MMLU-Pro, AI2 ARC, Google BoolQ, fill-in-the-blank stems,
 *      "which of the following" exam stems, lowercase-starting prompts, robotic zero-info
 *      `whyExplanation`s, and mis-filed Apollo-in-Myth items across ALL archetypes.
 *   2. Blocks quarantined Tier-1 items, junk distractors ("Unknown"), hypernym collisions,
 *      and broken shuffled letter-reference MCQ options ("A and B only", "Both C and D").
 *   3. Blocks self-answering stems & clues on SIGHTLINE_LOCK (l0Domain !== 11).
 */
export function isCleanShardCandidate(raw: RawQuestionRecord): boolean {
  if (QUARANTINED_TIER1_QIDS.has(raw.qid)) {
    return false;
  }
  if (isBenchmarkOrExamSlop(raw)) {
    return false;
  }
  if (hasRoboticWhyExplanation(raw.whyExplanation)) {
    return false;
  }
  if (raw.archetype !== 'SIGHTLINE_LOCK') {
    return true;
  }
  const ansTrim = raw.answerCorrect.trim();
  const ansLow = ansTrim.toLowerCase();
  if (!ansLow || JUNK_DISTRACTOR_SET.has(ansLow) || RE_SHUFFLED_LETTER_REF_OPTION.test(ansTrim)) {
    return false;
  }

  const distTextsLower = Array.isArray(raw.distractors)
    ? raw.distractors.map((d) =>
        String(typeof d === 'string' ? d : d?.text ?? '').trim().toLowerCase(),
      )
    : [];

  // Block broken shuffled letter-reference options ("A and B only", "Both C and D")
  for (let i = 0; i < distTextsLower.length; i++) {
    if (RE_SHUFFLED_LETTER_REF_OPTION.test(distTextsLower[i])) {
      return false;
    }
  }

  // 1. Self-answering stem & clue leak guard (non-math domains)
  if (raw.l0Domain !== 11 && ansLow.length >= 3) {
    const promptLow = raw.prompt.toLowerCase();
    if (ansLow.length >= 4 && promptLow.includes(ansLow)) {
      return false;
    }
    if (Array.isArray(raw.clues) && ansLow.length >= 4) {
      for (let i = 0; i < raw.clues.length; i++) {
        if (raw.clues[i].toLowerCase().includes(ansLow)) {
          return false;
        }
      }
    }
    // Prefix/token leak guard (e.g., "Republic of San Marino" -> "San Marino", "Europa Universalis" -> "Europa")
    const strippedCore = ansLow
      .replace(/^(?:the|a|an|republic of|kingdom of|state of|city of)\s+/i, '')
      .trim();
    if (strippedCore.length >= 5 && promptLow.includes(strippedCore)) {
      return false;
    }

    const ansTokens = strippedCore
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 4 && !LEAK_STOPWORDS_EXT.has(t));

    // Singular-stem all-tokens leak check (catches plural/singular variants across all shards)
    if (ansTokens.length >= 2) {
      const allInStem = ansTokens.every((tok) => hasWordStem(promptLow, singularStemToken(tok)));
      if (allInStem) {
        const distAlsoAllInStem = distTextsLower.some((dt) => {
          const dts = dt
            .split(/[^a-z0-9]+/)
            .filter((t) => t.length >= 4 && !LEAK_STOPWORDS_EXT.has(t));
          return dts.length >= 2 && dts.every((t) => hasWordStem(promptLow, singularStemToken(t)));
        });
        if (!distAlsoAllInStem) {
          return false;
        }
      }
    }

    // Legacy 6-char substring guard
    const longTokens = strippedCore
      .split(/[\s-]+/)
      .filter((t) => t.length >= 6 && !STOPWORD_TOKENS.has(t));
    if (longTokens.length > 0 && longTokens.every((tok) => promptLow.includes(tok))) {
      return false;
    }

    // Subcategory single-token stem giveaway guard (ballpark mascots/cities, exoplanet hosts, aero makers)
    const isSubcatLeakSensitive =
      raw.shardType === 'sub_bb_ballpark' ||
      raw.shardType === 'sub_sci_exo_deep' ||
      raw.shardType === 'sub_tech_aero_year';
    if (isSubcatLeakSensitive) {
      // Catch 3-char exact word leaks on exoplanet hosts / makers (e.g., "PH1 b" -> "PH1", "ZiL" -> "ZiL")
      if (strippedCore.length >= 3 && strippedCore.length <= 4 && hasWordStem(promptLow, strippedCore)) {
        if (!distTextsLower.some((dt) => hasWordStem(dt, strippedCore))) {
          return false;
        }
      }
      for (const tok of ansTokens) {
        const stem = singularStemToken(tok);
        const leakedInPrompt =
          hasWordStem(promptLow, stem) ||
          (raw.shardType === 'sub_bb_ballpark' && stem.length >= 5 && promptLow.includes(stem));
        if (leakedInPrompt && !distTextsLower.some((dt) => hasWordStem(dt, stem))) {
          return false;
        }
      }
    }
  }

  // 2. Hypernym & junk distractor collision guard
  if (distTextsLower.length > 0) {
    for (let i = 0; i < distTextsLower.length; i++) {
      if (JUNK_DISTRACTOR_SET.has(distTextsLower[i])) {
        return false;
      }
    }
    const allLabels = [ansLow, ...distTextsLower];
    for (let i = 0; i < allLabels.length; i++) {
      for (let j = i + 1; j < allLabels.length; j++) {
        if (allLabels[i] === allLabels[j] || areHypernymCollidingLabels(allLabels[i], allLabels[j])) {
          return false;
        }
      }
    }
  }

  return true;
}

const utf8Encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

/**
 * Exact 32-bit unsigned FNV-1a hash matching Python's `fnv1a_32` in validate_million_shards.py.
 * Uses `Math.imul` so 32-bit overflow wraps identically to C/Python without IEEE-754 float loss!
 */
export function fnv1a32(text: string): number {
  let h = 0x811c9dc5;
  if (utf8Encoder) {
    const bytes = utf8Encoder.encode(text);
    for (let i = 0; i < bytes.length; i++) {
      h ^= bytes[i];
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) & 0xff;
    h ^= code;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export interface RngLike {
  nextUint32(): number;
  nextFloat(): number;
  nextInt(minInclusive: number, maxInclusive: number): number;
  shuffleInPlace<T>(arr: T[]): T[];
}

/**
 * Hardware CSPRNG backed by `crypto.getRandomValues()` (`#181` §2.2 User Mandate).
 * Used for ALL non-Daily modes (Briefing Room, Subcategory Drill-Down, Campaign, Endless, Trials)
 * so candidate selection & facet option order are truly unpredictable and never walk sequential QIDs!
 */
export class CryptoRandomRng implements RngLike {
  private readonly buf = new Uint32Array(256);
  private cursor = 256;

  public nextUint32(): number {
    if (this.cursor >= this.buf.length) {
      if (
        typeof globalThis.crypto !== 'undefined' &&
        typeof globalThis.crypto.getRandomValues === 'function'
      ) {
        globalThis.crypto.getRandomValues(this.buf);
      } else {
        for (let i = 0; i < this.buf.length; i++) {
          this.buf[i] = Math.floor(Math.random() * 4294967296) >>> 0;
        }
      }
      this.cursor = 0;
    }
    return this.buf[this.cursor++] >>> 0;
  }

  public nextFloat(): number {
    return this.nextUint32() / 4294967296;
  }

  public nextInt(minInclusive: number, maxInclusive: number): number {
    if (maxInclusive <= minInclusive) return minInclusive;
    const span = maxInclusive - minInclusive + 1;
    const limit = 4294967296 - (4294967296 % span);
    let r = this.nextUint32();
    while (r >= limit) {
      r = this.nextUint32();
    }
    return minInclusive + (r % span);
  }

  public shuffleInPlace<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }
}

export const sharedCryptoRng = new CryptoRandomRng();

/** Deterministic 32-bit LCG PRNG (`state -> [nextState, float01]`) — used strictly for UTC Daily Seed */
export class DeterministicRng implements RngLike {
  private state: number;

  constructor(seed: number) {
    this.state = (seed >>> 0) || 0x9e3779b9;
  }

  public nextUint32(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state;
  }

  public nextFloat(): number {
    return this.nextUint32() / 4294967296;
  }

  public nextInt(minInclusive: number, maxInclusive: number): number {
    if (maxInclusive <= minInclusive) return minInclusive;
    const span = maxInclusive - minInclusive + 1;
    return minInclusive + (this.nextUint32() % span);
  }

  public shuffleInPlace<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }
}

function intGcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return Math.max(1, x);
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function resolveCell(
  row: ReadonlyArray<string | number>,
  colIdx: number,
  poolCols: ReadonlySet<number>,
  pool: ReadonlyArray<string>,
): string {
  if (colIdx < 0 || colIdx >= row.length) return '';
  const raw = row[colIdx];
  if (poolCols.has(colIdx)) {
    const pIdx = Number(raw);
    return pIdx >= 0 && pIdx < pool.length ? pool[pIdx] : '';
  }
  return String(raw);
}

function formatTemplate(tpl: string, ctx: Record<string, string | number>): string {
  const filled = tpl.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: string) => {
    const val = ctx[key];
    return val !== undefined ? String(val) : '';
  });
  return sanitizeTriviaCopy(filled);
}

function pickAngleTemplate(
  variants: ReadonlyArray<string> | undefined,
  fallback: string | undefined,
  qid: number,
): string {
  if (Array.isArray(variants) && variants.length > 0) {
    // Full 32-bit Murmur3 fmix32 avalanche so modulo 2/3/4/5/6 never locks onto qid parity!
    let h = (qid >>> 0) ^ 0x9e3779b9;
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    const candidate = variants[(h >>> 0) % variants.length];
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return fallback ?? '';
}

function adaptiveStep(exactVal: number, brackets: ReadonlyArray<[number, number]>): number {
  const av = Math.abs(exactVal);
  for (let i = 0; i < brackets.length; i++) {
    if (av <= brackets[i][0]) {
      return brackets[i][1];
    }
  }
  return 500;
}

export function computeShardCalibratorBounds(
  exactValIn: number,
  angle: ShardAngleSpec,
  qid: number,
  decoderSpec: ShardDecoderSpec,
): { exactVal: number; minVal: number; maxVal: number; step: number } {
  let exactVal = exactValIn;
  let step = Math.trunc(angle.step ?? 1);
  let pad = Math.trunc(angle.pad ?? 0);
  const minClamp = Math.trunc(angle.minClamp ?? -1_000_000);
  const maxClamp = Math.trunc(angle.maxClamp ?? 1_000_000);

  if (step <= 0) {
    step = adaptiveStep(exactVal, decoderSpec.adaptiveStepBrackets);
  }
  if (step > 1 && exactVal % step !== 0) {
    exactVal = Math.round(exactVal / step) * step;
  }

  if (pad <= 0) {
    pad = Math.max(
      step * 8,
      Math.round(Math.max(Math.abs(exactVal) * 0.55, step * 10) / step) * step,
    );
  }
  const span = Math.round(Math.max(step * 10, pad * 2) / step) * step;

  const offsets =
    decoderSpec.calibratorOffsets && decoderSpec.calibratorOffsets.length > 0
      ? decoderSpec.calibratorOffsets
      : [0.24, 0.34, 0.66, 0.76];
  const h = fnv1a32(`CAL:${qid}`);
  const off = offsets[h % offsets.length];

  let minGrid = Math.ceil(minClamp / step) * step;
  let maxGrid = Math.floor(maxClamp / step) * step;
  if (exactVal <= minGrid + step) minGrid = exactVal - step * 4;
  if (exactVal >= maxGrid - step) maxGrid = exactVal + step * 4;

  const rawMin = Math.round((exactVal - span * off) / step) * step;
  let minVal = Math.max(minGrid, Math.min(rawMin, exactVal - step * 2));
  let maxVal = minVal + span;
  if (maxVal > maxGrid) {
    maxVal = maxGrid;
    minVal = Math.max(minGrid, maxVal - span);
  }
  if (maxVal <= exactVal + step) maxVal = exactVal + step * 2;
  if (minVal >= exactVal - step) minVal = exactVal - step * 2;

  // Prevent exactVal sitting dead-center on the dial
  const mid = (minVal + maxVal) * 0.5;
  const curSpan = Math.max(step * 4, maxVal - minVal);
  if (Math.abs(exactVal - mid) < curSpan * 0.14) {
    const shift = Math.ceil((curSpan * 0.22) / step) * step;
    if (minVal - shift >= minGrid && maxVal - shift >= exactVal + step * 2) {
      minVal -= shift;
      maxVal -= shift;
    } else if (maxVal + shift <= maxGrid && minVal + shift <= exactVal - step * 2) {
      minVal += shift;
      maxVal += shift;
    }
  }

  return { exactVal, minVal, maxVal, step };
}

export function pickShardDistractors(
  rows: ReadonlyArray<ReadonlyArray<string | number>>,
  rowIdx: number,
  spec: ShardTableTypeSpec,
  angle: Pick<ShardAngleSpec, 'distractorCol' | 'avoidSameCol' | 'preferSameCol'>,
  pool: ReadonlyArray<string>,
  qid: number,
  radius = 60,
  desiredCount = 3,
): string[] {
  const poolCols = new Set<number>(spec.poolCols ?? []);
  const dcol = Math.trunc(angle.distractorCol ?? 1);
  const ans = resolveCell(rows[rowIdx], dcol, poolCols, pool);
  const ansLow = ans.toLowerCase();

  const avoidCol =
    angle.avoidSameCol !== undefined && angle.avoidSameCol !== null
      ? Math.trunc(angle.avoidSameCol)
      : null;
  const avoidVal =
    avoidCol !== null ? resolveCell(rows[rowIdx], avoidCol, poolCols, pool).toLowerCase() : null;

  const preferCol =
    angle.preferSameCol !== undefined && angle.preferSameCol !== null
      ? Math.trunc(angle.preferSameCol)
      : null;
  const preferVal =
    preferCol !== null ? resolveCell(rows[rowIdx], preferCol, poolCols, pool).toLowerCase() : null;

  const n = rows.length;
  const h = fnv1a32(`DIST:${qid}:${rowIdx}`);
  const picked: string[] = [];
  const seen = new Set<string>([ansLow]);

  const tryRow = (candIdx: number, requirePrefer: boolean): boolean => {
    if (candIdx === rowIdx || candIdx < 0 || candIdx >= n) return false;
    const crow = rows[candIdx];
    if (avoidCol !== null) {
      if (resolveCell(crow, avoidCol, poolCols, pool).toLowerCase() === avoidVal) {
        return false;
      }
    }
    if (requirePrefer && preferCol !== null) {
      if (resolveCell(crow, preferCol, poolCols, pool).toLowerCase() !== preferVal) {
        return false;
      }
    }
    const cval = resolveCell(crow, dcol, poolCols, pool);
    if (!cval) return false;
    const clow = cval.toLowerCase();
    if (seen.has(clow) || areHypernymCollidingLabels(ansLow, clow)) return false;
    for (let p = 0; p < picked.length; p++) {
      if (areHypernymCollidingLabels(picked[p].toLowerCase(), clow)) {
        return false;
      }
    }
    seen.add(clow);
    picked.push(cval);
    return picked.length >= desiredCount;
  };

  // Pass 1: Local window with preferSameCol
  if (preferCol !== null) {
    const lo = Math.max(0, rowIdx - radius * 3);
    const hi = Math.min(n, rowIdx + radius * 3 + 1);
    const span = Math.max(1, hi - lo);
    let stride = Math.max(1, (h % 13) + 1);
    if (intGcd(stride, span) !== 1) stride = 1;
    const start = h % span;
    for (let k = 0; k < span; k++) {
      if (tryRow(lo + ((start + k * stride) % span), true)) return picked;
    }
    if (picked.length < desiredCount) {
      const stepW = Math.max(1, Math.floor(n / 400));
      for (let k = 0; k < n; k += stepW) {
        if (tryRow((h + k) % n, true)) return picked;
      }
    }
  }

  // Pass 2: Local fame/era window [rowIdx - radius .. rowIdx + radius]
  const lo = Math.max(0, rowIdx - radius);
  const hi = Math.min(n, rowIdx + radius + 1);
  const span = Math.max(1, hi - lo);
  let step = (h % 7) + 1;
  while (intGcd(step, span) !== 1 && step < span) step++;
  const start = (h >>> 5) % span;
  for (let k = 0; k < span; k++) {
    if (tryRow(lo + ((start + k * step) % span), false)) return picked;
  }

  // Pass 3: Full table deterministic scan fallback
  const startFull = h % Math.max(1, n);
  let stepFull = Math.max(1, (h % 17) + 1);
  while (intGcd(stepFull, n) !== 1 && stepFull < n) stepFull++;
  for (let k = 0; k < n; k++) {
    if (tryRow((startFull + k * stepFull) % n, false)) return picked;
  }

  return picked;
}

const RE_DRY_LETTER_HINT =
  /\b(?:starts with|begins with|opening (?:letter|word) (?:is|begins)|first letter)\s+["'“‘]?[A-Za-z0-9]["'”’]?/i;

function describeCenturyFromYear(rawYear: string | number | undefined): string | null {
  const y = Number(rawYear);
  if (!Number.isFinite(y) || y === 0) return null;
  if (y < 0) {
    const c = Math.ceil(Math.abs(y) / 100);
    return `the ${c}${c === 1 ? 'st' : c === 2 ? 'nd' : c === 3 ? 'rd' : 'th'} century BCE`;
  }
  if (y >= 1000 && y <= 2120) {
    const decade = Math.floor(y / 10) * 10;
    const cent = Math.ceil(y / 100);
    const suf = cent % 10 === 1 && cent !== 11 ? 'st' : cent % 10 === 2 && cent !== 12 ? 'nd' : cent % 10 === 3 && cent !== 13 ? 'rd' : 'th';
    return y >= 1900 ? `the ${decade}s` : `the ${cent}${suf} century`;
  }
  return null;
}

/**
 * Rewrites dry dictionary shard stems into lively, broadcast-ready game-show phrasing
 * while keeping exact factual meaning and deterministic variation per QID.
 */
function polishShardBroadcastPrompt(
  prompt: string,
  typeId: string,
  angleId: string,
  ctx: Record<string, string | number>,
  qid: number,
): string {
  let out = sanitizeTriviaCopy(prompt);
  const v = fnv1a32(`V4_REWRITE:${qid}:${angleId}`) % 4;
  const name = String(ctx.name ?? ctx.title ?? '').trim();
  const country = String(ctx.country ?? '').trim();
  const year = ctx.year !== undefined ? String(ctx.year).trim() : '';
  const role = String(ctx.role ?? ctx.field ?? ctx.discipline ?? ctx.craft ?? '').trim();

  // Rewrite dry "Which country [or realm] was [historical figure / scientist / role] X associated with?"
  if (/which country(?: or realm)? was /i.test(out) && /associated with\??$/i.test(out) && name) {
    const roleBit = role ? `${role.toLowerCase()} ` : '';
    const yearBit = year && /^\d{3,4}$/.test(year) ? ` (born ${year})` : '';
    const variants = [
      `Passport check: which nation can claim ${roleBit}${name}${yearBit} as part of its story?`,
      `Which country's flag belongs beside ${roleBit}${name}${yearBit} in the history books?`,
      `Put ${roleBit}${name}${yearBit} on the map—which country or realm did they hail from?`,
      `Which country shaped the legacy of ${roleBit}${name}${yearBit}?`,
    ];
    return sanitizeTriviaCopy(variants[v]);
  }

  // Rewrite dry "Which of these ... was associated with {country}?"
  if (/which of these .* was associated with /i.test(out) && country) {
    const variants = [
      `Spotlight on ${country}: which of these notable names belongs to its heritage?`,
      `Step onto ${country}'s stage—which one of these figures comes from there?`,
      `Only one of these names ties back to ${country}. Who makes the cut?`,
      `Who among these four shares a homeland link with ${country}?`,
    ];
    return sanitizeTriviaCopy(variants[v]);
  }

  // Rewrite dry "was directly associated with {country}" / "was associated with {country}" T/F statements
  if (/\bwas (?:directly )?associated with\b/i.test(out)) {
    out = out.replace(/\bwas directly associated with\b/gi, 'left its mark on');
    out = out.replace(/\bwas associated with\b/gi, 'hailed from');
  }

  // Rewrite dry "Check this {cat} result: {stmt}? Answer: {ans}."
  if (/^Check this .* (?:result|puzzle):/i.test(out) && ctx.stmt && ctx.ans !== undefined) {
    const cat = String(ctx.cat ?? 'Logic').trim();
    const stmt = String(ctx.stmt).replace(/\?+$/, '').trim();
    const ansText = String(ctx.fake ?? ctx.ans).trim();
    return sanitizeTriviaCopy(`Quick ${cat} check: "${stmt}?" — Does that come out to ${ansText}?`);
  }

  // Rewrite dry "Estimate the exact value: {stmt}?"
  if (/^Estimate the exact value:/i.test(out) && ctx.stmt) {
    const stmt = String(ctx.stmt).replace(/\?+$/, '').trim();
    return sanitizeTriviaCopy(`Lock the dial on this number: ${stmt}?`);
  }

  // Capitalize leading lowercase species/chemical names cleanly
  if (typeId === 'nat_species' || typeId === 'sci_chemical') {
    out = out.replace(/^([a-z])/, (_m, c: string) => c.toUpperCase());
  }

  return sanitizeTriviaCopy(out);
}

/**
 * Generates genuine lateral contextual hints for shard questions — NEVER `'starts with "K"'`
 * and NEVER printing the answer verbatim.
 */
function buildLateralShardHint(
  spec: ShardTableTypeSpec,
  ctx: Record<string, string | number>,
  cleanAnswer: string,
  existingClue: string,
  qid: number,
): string {
  const ansLow = cleanAnswer.trim().toLowerCase();
  const isCleanExisting =
    existingClue.trim().length >= 16 &&
    !RE_DRY_LETTER_HINT.test(existingClue) &&
    !/^category context:/i.test(existingClue.trim()) &&
    !(ansLow.length >= 4 && existingClue.toLowerCase().includes(ansLow));

  if (isCleanExisting) {
    return sanitizeTriviaCopy(existingClue);
  }

  const hints: string[] = [];
  const century = describeCenturyFromYear(ctx.year);
  const safeAdd = (candidate: string): void => {
    const clean = sanitizeTriviaCopy(candidate);
    if (!clean) return;
    if (ansLow.length >= 4 && clean.toLowerCase().includes(ansLow)) return;
    hints.push(clean);
  };

  if (century) {
    safeAdd(`Timeframe check: anchor your mental timeline right around ${century}.`);
  }
  if (ctx.conflict) {
    safeAdd(`This flashpoint unfolded as part of ${ctx.conflict}.`);
  }
  if (ctx.region && ctx.country && !ansLow.includes(String(ctx.region).toLowerCase())) {
    safeAdd(`Zoom in on the ${ctx.region} region to narrow the map down fast.`);
  }
  if (ctx.continent) {
    safeAdd(`Keep your compass pointed toward ${ctx.continent}.`);
  }
  if (ctx.medium) {
    safeAdd(`Picture this masterpiece in its original medium: ${String(ctx.medium).toLowerCase()}.`);
  }
  if (ctx.category && spec.l0Domain === 1) {
    safeAdd(`On the periodic table, it sits among the ${String(ctx.category).toLowerCase()} elements.`);
  }
  if (ctx.anum !== undefined && Number.isFinite(Number(ctx.anum))) {
    const z = Number(ctx.anum);
    const band = z <= 20 ? 'the light first 20 elements' : z <= 54 ? 'the middle rows (atomic numbers 21 to 54)' : 'the heavier lower rows of the periodic table';
    safeAdd(`Look among ${band} to zero in on the right match.`);
  }
  if (ctx.constellation) {
    safeAdd(`Stargazers trace this deep-sky sight inside the constellation ${ctx.constellation}.`);
  }
  if (ctx.sport) {
    safeAdd(`Keep your head in the game—this record comes straight from ${String(ctx.sport).toLowerCase()}.`);
  }
  if (ctx.industry) {
    safeAdd(`Think of the major pioneers shaping the ${String(ctx.industry).toLowerCase()} sector.`);
  }
  if (ctx.sw_type) {
    safeAdd(`In tech history, this one made its name as a ${String(ctx.sw_type).toLowerCase()}.`);
  }
  if (ctx.group && spec.l0Domain === 7) {
    safeAdd(`In the animal kingdom, place this entry in the ${String(ctx.group).toLowerCase()} branch.`);
  }
  if (ctx.tradition) {
    safeAdd(`Flip open the folklore shelf for ${ctx.tradition}.`);
  }
  if (ctx.lang) {
    safeAdd(`Its earliest pages were written in ${ctx.lang}.`);
  }
  if (ctx.role) {
    safeAdd(`Remember their calling: best remembered as a ${String(ctx.role).toLowerCase()}.`);
  }
  if (ctx.cat && spec.l0Domain === 11) {
    safeAdd(`Work step by step using classic ${String(ctx.cat).toLowerCase()} rules—check parity and order of magnitude first.`);
  }

  if (hints.length > 0) {
    const idx = fnv1a32(`V4_HINT:${qid}:${spec.l1Category}`) % hints.length;
    return hints[idx];
  }

  const fallbackPool = [
    `Cross-check the era and home region—eliminating the two biggest outliers in ${spec.l1Category.toLowerCase()} makes the answer jump out.`,
    `Think of the signature hallmark inside ${spec.l1Category.toLowerCase()} that separates this classic from its rivals.`,
    `Trust your first instinct on ${spec.l1Category.toLowerCase()} context—two of the options belong to a completely different corner of the field.`,
  ];
  return sanitizeTriviaCopy(fallbackPool[fnv1a32(`V4_HFB:${qid}`) % fallbackPool.length]);
}

function polishShardWhyExplanation(
  why: string,
  spec: ShardTableTypeSpec,
  ctx: Record<string, string | number>,
  cleanAnswer: string,
): string {
  let out = sanitizeTriviaCopy(why);
  if (!out || /^exact (?:answer|value):|^verified solution:/i.test(out) || hasRoboticWhyExplanation(out)) {
    const cat = String(ctx.cat ?? spec.l1Category).trim();
    if (spec.l0Domain === 11 && ctx.stmt && cleanAnswer) {
      return sanitizeTriviaCopy(`Working through this ${cat.toLowerCase()} puzzle lands cleanly on ${cleanAnswer}.`);
    }
    const subj = String(ctx.name ?? ctx.title ?? '').trim();
    if (subj && cleanAnswer && cleanAnswer !== 'TRUE' && cleanAnswer !== 'FALSE') {
      return sanitizeTriviaCopy(`In ${spec.l1Category}, ${subj} pairs directly with ${cleanAnswer}.`);
    }
  }
  out = out.replace(/\bwas associated with\b/gi, 'made a lasting mark in');
  out = out.replace(/\bwas directly associated with\b/gi, 'shaped the history of');
  return sanitizeTriviaCopy(out);
}

/**
 * Ensures Codex Dual-Ring / Synthesis clues NEVER leak any `subject <-> target` answer pair
 * verbatim and NEVER reveal `decoyTarget` verbatim!
 */
function buildNonLeakingCodexClues(
  catLabel: string,
  pairs: ReadonlyArray<{ subject: string; target: string }>,
  decoyTarget: string,
  qid: number,
  rawClues?: ReadonlyArray<string>,
): [string, string] {
  const leaksAnswer = (clue: string): boolean => {
    const low = clue.toLowerCase();
    if (!low || low.length < 12) return true;
    const decoyLow = decoyTarget.trim().toLowerCase();
    if (decoyLow.length >= 3 && low.includes(decoyLow)) return true;
    for (const p of pairs) {
      const sLow = p.subject.trim().toLowerCase();
      const tLow = p.target.trim().toLowerCase();
      if (sLow.length >= 3 && tLow.length >= 3 && low.includes(sLow) && low.includes(tLow)) {
        return true;
      }
    }
    return false;
  };

  const rawCatLow = catLabel.toLowerCase();
  const decoyLow = decoyTarget.trim().toLowerCase();
  const catCollidesWithAnswer =
    (decoyLow.length >= 3 && rawCatLow.includes(decoyLow)) ||
    pairs.some((p) => {
      const sl = p.subject.trim().toLowerCase();
      const tl = p.target.trim().toLowerCase();
      return (sl.length >= 3 && rawCatLow.includes(sl)) || (tl.length >= 3 && rawCatLow.includes(tl));
    });
  const catLow = catCollidesWithAnswer ? 'featured' : rawCatLow;
  const safeDefaults: [string, string] =
    (fnv1a32(`CDX_HINT:${qid}`) & 1) === 0
      ? [
          `Lock in the single ${catLow} match you feel 100% sure about first—each upper entry owns a distinct partner below.`,
          `Compare era, region, or signature style across the final two items; one option on the lower ring is an uninvited odd-one-out.`,
        ]
      : [
          `Start by spotting the most iconic ${catLow} connection, then narrow the remaining pairs by process of elimination.`,
          `No two entries share a partner—once two links click into place, only one match and one odd-one-out decoy remain.`,
        ];

  const c1 = rawClues?.[0] && !leaksAnswer(rawClues[0]) ? sanitizeTriviaCopy(rawClues[0]) : safeDefaults[0];
  const c2 = rawClues?.[1] && !leaksAnswer(rawClues[1]) ? sanitizeTriviaCopy(rawClues[1]) : safeDefaults[1];
  return [c1, c2];
}

/**
 * Decodes a single question from a `WS_SHARD_V1` chunk in <0.05ms, matching
 * `validate_million_shards.py::decode_question` bit-for-bit.
 */
export function decodeShardRawQuestion(
  manifest: Pick<ShardManifest, 'types' | 'decoderSpec'>,
  chunk: ShardChunkData,
  tableIdx: number,
  rowIdx: number,
  angleIdx: number,
  desiredDistractors = 3,
  restrictedRowIndices?: ReadonlyArray<number>,
): RawQuestionRecord | null {
  const table = chunk.t[tableIdx];
  if (!table) return null;
  const typeId = table.type;
  const spec = chunk.types?.[typeId] ?? manifest.types[typeId];
  if (!spec) return null;
  const angle = spec.angles[angleIdx];
  const rows = table.r;
  if (!angle || rowIdx < 0 || rowIdx >= rows.length) return null;

  const pool = chunk.p;
  const row = rows[rowIdx];
  const nAngles = spec.angles.length;
  const qid = Math.trunc(table.baseQid) + rowIdx * nAngles + angleIdx;

  const poolCols = new Set<number>(spec.poolCols ?? []);
  const ctx: Record<string, string | number> = {};
  for (let idx = 0; idx < spec.cols.length && idx < row.length; idx++) {
    const cname = spec.cols[idx];
    ctx[cname] = poolCols.has(idx) ? (pool[Number(row[idx])] ?? '') : row[idx];
  }

  // Strip leading "{maker} " or "{maker}-" prefix from vehicle/aerospace "{name}" ("Toyota Aygo" -> "Aygo", "ZIL-111" -> "111")
  // so manufacturer questions never leak the answer inside the model name (#118, #249)!
  if (
    (typeId === 'tech_vehicle' || typeId === 'sub_tech_aero_year') &&
    typeof ctx.name === 'string' &&
    typeof ctx.maker === 'string'
  ) {
    const makerTrim = ctx.maker.trim();
    const nameTrim = ctx.name.trim();
    if (makerTrim.length >= 2 && nameTrim.length > makerTrim.length + 1) {
      const lowName = nameTrim.toLowerCase();
      const lowMaker = makerTrim.toLowerCase();
      if (lowName.startsWith(`${lowMaker} `) || lowName.startsWith(`${lowMaker}-`)) {
        const stripped = nameTrim.slice(makerTrim.length + 1).trim();
        if (stripped.length >= 2) {
          ctx.name = stripped;
        }
      }
    }
  }

  const baseIrt = Number(row[row.length - 1]) / 100.0;
  const irtB =
    Math.round(clamp(baseIrt + Number(angle.irtOffset ?? 0.0), -1.6, 2.75) * 100) / 100;
  let shardRowRank01 = rows.length > 1 ? rowIdx / (rows.length - 1) : 0;
  if (restrictedRowIndices && restrictedRowIndices.length > 1) {
    const localPos = restrictedRowIndices.indexOf(rowIdx);
    if (localPos >= 0) {
      shardRowRank01 = localPos / (restrictedRowIndices.length - 1);
    }
  }
  shardRowRank01 = Math.round(clamp(shardRowRank01, 0, 1) * 10000) / 10000;
  const arch = angle.archetype;
  const radius = manifest.decoderSpec?.distractorWindowRadius ?? 60;
  const primarySubject = resolveCell(row, 0, poolCols, pool);
  const microSlug = primarySubject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 36);

  const out: RawQuestionRecord = {
    qid,
    l0Domain: spec.l0Domain,
    l1Category: spec.l1Category,
    l2Subcategory: typeId.replace(/^[a-z]+_/, '').replace(/_/g, ' '),
    microTopicId: `${typeId}_${microSlug || rowIdx}`,
    regions: ['GLOBAL'],
    narrativeTags: [],
    tone: 'PRESTIGE',
    irtB,
    irtA: 1.25,
    freshness: 'EVERGREEN',
    archetype: arch,
    prompt: '',
    answerCorrect: '',
    glyphHint: spec.glyphHint ?? getForgeDomainInfo(spec.l0Domain).glyphShape,
    shardType: typeId,
    angleId: angle.id,
    shardRowRank01,
  };

  if (arch === 'SIGHTLINE_LOCK') {
    const ans = resolveCell(row, Math.trunc(angle.answerCol ?? 0), poolCols, pool);
    ctx.ans_init = ans ? ans[0].toUpperCase() : '?';
    let dists: string[];
    if (Array.isArray(angle.inlineDistCols) && angle.inlineDistCols.length > 0) {
      dists = angle.inlineDistCols.map((ci) => resolveCell(row, Math.trunc(ci), poolCols, pool));
    } else if (restrictedRowIndices && restrictedRowIndices.length >= 8) {
      const subRows = restrictedRowIndices.map((ri) => rows[ri]);
      const localPos = Math.max(0, restrictedRowIndices.indexOf(rowIdx));
      dists = pickShardDistractors(
        subRows,
        localPos,
        spec,
        angle,
        pool,
        qid,
        radius,
        Math.max(3, desiredDistractors),
      );
      if (dists.length < Math.max(3, desiredDistractors)) {
        dists = pickShardDistractors(
          rows,
          rowIdx,
          spec,
          angle,
          pool,
          qid,
          radius,
          Math.max(3, desiredDistractors),
        );
      }
    } else {
      dists = pickShardDistractors(
        rows,
        rowIdx,
        spec,
        angle,
        pool,
        qid,
        radius,
        Math.max(3, desiredDistractors),
      );
    }
    const sightPromptTpl = pickAngleTemplate(
      angle.stemVariants ?? angle.promptVariants,
      angle.prompt ?? angle.stem,
      qid,
    );
    out.prompt = polishShardBroadcastPrompt(
      formatTemplate(sightPromptTpl, ctx),
      typeId,
      angle.id,
      ctx,
      qid,
    );
    const cleanAns = sanitizeAnswerOrFacet(ans, out.prompt);
    out.answerCorrect = cleanAns;
    out.distractors = dists.map((d, idx) => ({
      text: sanitizeAnswerOrFacet(d, out.prompt),
      plausibility: Number((0.84 - idx * 0.06).toFixed(2)),
    }));
    const rawC1 = sanitizeTriviaCopy(formatTemplate(angle.clue1 ?? '', ctx));
    const rawC2 = sanitizeTriviaCopy(formatTemplate(angle.clue2 ?? '', ctx));
    const c1 = buildLateralShardHint(spec, ctx, cleanAns, rawC1, qid);
    const c2 = buildLateralShardHint(spec, ctx, cleanAns, rawC2, qid ^ 0x4f1bbcdc);
    out.clues = [c1, c2];
    out.whyExplanation = polishShardWhyExplanation(
      formatTemplate(angle.why ?? '', ctx),
      spec,
      ctx,
      cleanAns,
    );
  } else if (arch === 'GAUNTLET_SHATTER') {
    const isTrue = (fnv1a32(`TF:${qid}`) & 1) === 0;
    if (isTrue) {
      const trueTpl = pickAngleTemplate(
        angle.truePromptVariants ?? angle.trueStemVariants,
        angle.truePrompt,
        qid,
      );
      out.prompt = polishShardBroadcastPrompt(
        formatTemplate(trueTpl, ctx),
        typeId,
        angle.id,
        ctx,
        qid,
      );
      out.answerCorrect = 'TRUE';
      out.whyExplanation = polishShardWhyExplanation(
        formatTemplate(angle.whyTrue ?? '', ctx),
        spec,
        ctx,
        'TRUE',
      );
    } else {
      let fake = 'Unknown';
      if (angle.inlineFakeCol !== undefined) {
        fake = resolveCell(row, Math.trunc(angle.inlineFakeCol), poolCols, pool);
      } else {
        const fakeCol = Math.trunc(angle.fakeCol ?? 1);
        const fakeCands = pickShardDistractors(
          rows,
          rowIdx,
          spec,
          { distractorCol: fakeCol },
          pool,
          (qid ^ 0x5a5a) >>> 0,
          radius,
          1,
        );
        if (fakeCands.length > 0) fake = fakeCands[0];
      }
      ctx.fake = sanitizeTriviaCopy(fake);
      const falseTpl = pickAngleTemplate(
        angle.falsePromptVariants ?? angle.falseStemVariants,
        angle.falsePrompt,
        qid,
      );
      out.prompt = polishShardBroadcastPrompt(
        formatTemplate(falseTpl, ctx),
        typeId,
        angle.id,
        ctx,
        qid,
      );
      out.answerCorrect = 'FALSE';
      out.whyExplanation = polishShardWhyExplanation(
        formatTemplate(angle.whyFalse ?? '', ctx),
        spec,
        ctx,
        'FALSE',
      );
    }
    const rawC1 = sanitizeTriviaCopy(formatTemplate(angle.clue1 ?? '', ctx));
    const c1 = buildLateralShardHint(spec, ctx, out.answerCorrect, rawC1, qid);
    out.clues = [
      c1,
      sanitizeTriviaCopy(
        `Check the headline fact on ${primarySubject}—watch closely for a swapped country, year, or creator.`,
      ),
    ];
    out.gauntletExt = { isTrue, isTrick: false, windowSec: 8 };
  } else if (arch === 'CALIBRATOR_DIAL') {
    const exactColIdx = Math.trunc(angle.exactCol ?? 2);
    const exactColName = spec.cols[exactColIdx] ?? '';
    const exactV = Math.round(Number(row[exactColIdx]));
    const unit =
      angle.unitCol !== undefined
        ? resolveCell(row, Math.trunc(angle.unitCol), poolCols, pool)
        : String(angle.unit ?? '');
    const bounds = computeShardCalibratorBounds(exactV, angle, qid, manifest.decoderSpec);
    const calPromptTpl = pickAngleTemplate(
      angle.stemVariants ?? angle.promptVariants,
      angle.prompt ?? angle.stem,
      qid,
    );
    out.prompt = polishShardBroadcastPrompt(
      formatTemplate(calPromptTpl, ctx),
      typeId,
      angle.id,
      ctx,
      qid,
    );
    const formattedExact = formatCleanTriviaNumber(bounds.exactVal, unit, out.prompt, exactColName);
    out.answerCorrect = sanitizeTriviaCopy(`${formattedExact}${unit ? ` ${unit}` : ''}`.trim());
    const rawC1 = sanitizeTriviaCopy(formatTemplate(angle.clue1 ?? '', ctx));
    const c1 = buildLateralShardHint(spec, ctx, out.answerCorrect, rawC1, qid);
    const halfSpan = Math.max(bounds.step, Math.round((bounds.maxVal - bounds.minVal) * 0.25));
    const bandLo = Math.max(bounds.minVal, bounds.exactVal - halfSpan);
    const bandHi = Math.min(bounds.maxVal, bounds.exactVal + halfSpan);
    const formattedLo = formatCleanTriviaNumber(bandLo, unit, out.prompt, exactColName);
    const formattedHi = formatCleanTriviaNumber(bandHi, unit, out.prompt, exactColName);
    out.clues = [
      c1,
      sanitizeTriviaCopy(
        `Pinpoint band: between ${formattedLo} and ${formattedHi}${unit ? ` ${unit}` : ''}.`,
      ),
    ];
    out.whyExplanation = polishShardWhyExplanation(
      formatTemplate(angle.why ?? '', ctx),
      spec,
      ctx,
      out.answerCorrect,
    );
    out.calibratorExt = {
      exactVal: bounds.exactVal,
      minVal: bounds.minVal,
      maxVal: bounds.maxVal,
      step: bounds.step,
      unit,
    };
  } else if (arch === 'CODEX_DUAL_RING') {
    const subjCol = Math.trunc(angle.subjectCol ?? 0);
    const targCol = Math.trunc(angle.targetCol ?? angle.answerCol ?? 1);
    const candIndices =
      restrictedRowIndices && restrictedRowIndices.length >= 6
        ? restrictedRowIndices
        : rows.map((_, i) => i);
    const startPos = Math.max(0, candIndices.indexOf(rowIdx));
    const pairs: Array<{ subject: string; target: string }> = [];
    const usedSubj = new Set<string>();
    const usedTarg = new Set<string>();
    let decoyTarget = '';

    if (Array.isArray(angle.pairCols) && angle.pairCols.length >= 3) {
      for (let pi = 0; pi < 3; pi++) {
        const [sc, tc] = angle.pairCols[pi];
        pairs.push({
          subject: sanitizeTriviaCopy(resolveCell(row, sc, poolCols, pool)),
          target: sanitizeTriviaCopy(resolveCell(row, tc, poolCols, pool)),
        });
      }
      decoyTarget = sanitizeTriviaCopy(
        angle.decoyCol !== undefined
          ? resolveCell(row, angle.decoyCol, poolCols, pool)
          : 'Alternate Record',
      );
    } else {
      const stride = Math.max(1, ((fnv1a32(`CDX:${qid}`) % 7) + 1));
      for (let step = 0; step < candIndices.length; step++) {
        const rCand = rows[candIndices[(startPos + step * stride) % candIndices.length]];
        const s = sanitizeTriviaCopy(resolveCell(rCand, subjCol, poolCols, pool).trim());
        const t = sanitizeTriviaCopy(resolveCell(rCand, targCol, poolCols, pool).trim());
        if (!s || !t || s.length > 28 || t.length > 28) continue;
        const sl = s.toLowerCase();
        const tl = t.toLowerCase();
        if (sl === tl || usedSubj.has(sl) || usedTarg.has(tl)) continue;
        if (pairs.length < 3) {
          usedSubj.add(sl);
          usedTarg.add(tl);
          pairs.push({ subject: s, target: t });
        } else {
          decoyTarget = t;
          break;
        }
      }
    }
    if (pairs.length < 3 || !decoyTarget) return null;
    const codexPromptTpl = pickAngleTemplate(
      angle.stemVariants ?? angle.promptVariants,
      angle.prompt ??
        angle.stem ??
        `Pair each ${spec.l1Category.toLowerCase()} headline with its true partner—watch out for the odd-one-out decoy.`,
      qid,
    );
    out.prompt = sanitizeTriviaCopy(formatTemplate(codexPromptTpl, ctx));
    out.answerCorrect = `3/3 ${spec.l1Category} Matches`;
    const candidateClues = [
      angle.clue1 ? formatTemplate(angle.clue1, ctx) : '',
      angle.clue2 ? formatTemplate(angle.clue2, ctx) : '',
    ];
    out.clues = buildNonLeakingCodexClues(
      spec.l1Category,
      pairs,
      decoyTarget,
      qid,
      candidateClues,
    );
    out.whyExplanation = sanitizeTriviaCopy(
      formatTemplate(
        angle.why ??
          `Full lineup: ${pairs[0].subject} pairs with ${pairs[0].target}, ${pairs[1].subject} with ${pairs[1].target}, and ${pairs[2].subject} with ${pairs[2].target}.`,
        ctx,
      ),
    );
    out.codexExt = { pairs, decoyTarget };
  }

  // Apply universal runtime copy & numeric hygiene across prompt, clues & why (#224)!
  out.prompt = sanitizeTriviaCopy(out.prompt);
  if (Array.isArray(out.clues)) {
    out.clues = out.clues.map((c) => sanitizeTriviaCopy(c));
  }
  if (out.whyExplanation) {
    out.whyExplanation = sanitizeTriviaCopy(out.whyExplanation);
  }

  return out;
}

/** Alias preserving clean naming for runtime shard question decoding */
export const decodeShardQuestion = decodeShardRawQuestion;

/**
 * Deterministically synthesizes a graded `CODEX_DUAL_RING` 3-pair sibling-entity puzzle
 * from verified shard tables inside QID space `1,004,100 .. 1,047,299` (<= 1,048,575).
 * Zero ungrounded invention: every pair & decoy comes directly from verified table rows.
 */
export function synthesizeShardCodexQuestion(
  manifest: ShardManifest,
  chunks: ReadonlyArray<ShardChunkData>,
  domainId: DomainId,
  synthSlot: number,
  targetIrtB = 0.4,
): RawQuestionRecord | null {
  if (chunks.length === 0) return null;
  const clampedSlot = Math.abs(Math.trunc(synthSlot)) % CODEX_SYNTHESIS_PER_DOMAIN;
  const qid = CODEX_SYNTHESIS_BASE_QID + domainId * CODEX_SYNTHESIS_PER_DOMAIN + clampedSlot;
  const rng = new DeterministicRng(fnv1a32(`CODEX_SYNTH:${qid}:${domainId}`));

  // Collect eligible tables with a SIGHTLINE_LOCK angle whose answerCol != 0
  const candidates: Array<{
    chunk: ShardChunkData;
    tableIdx: number;
    spec: ShardTableTypeSpec;
    answerCol: number;
  }> = [];

  for (const chunk of chunks) {
    for (let ti = 0; ti < chunk.t.length; ti++) {
      const tbl = chunk.t[ti];
      const spec = manifest.types[tbl.type];
      if (!spec || tbl.r.length < 16) continue;
      const sightAngle = spec.angles.find(
        (a) => a.archetype === 'SIGHTLINE_LOCK' && (a.answerCol ?? 0) > 0,
      );
      if (sightAngle && sightAngle.answerCol !== undefined) {
        candidates.push({
          chunk,
          tableIdx: ti,
          spec,
          answerCol: sightAngle.answerCol,
        });
      }
    }
  }
  if (candidates.length === 0) return null;

  const chosen = candidates[rng.nextInt(0, candidates.length - 1)];
  const tbl = chosen.chunk.t[chosen.tableIdx];
  const rows = tbl.r;
  const pool = chosen.chunk.p;
  const poolCols = new Set<number>(chosen.spec.poolCols ?? []);
  const ansCol = chosen.answerCol;

  // Map targetIrtB [-1.5..+2.4] to approximate row center (rows are sorted Easy -> Hard!)
  const normDiff = clamp((targetIrtB + 1.4) / 3.6, 0.05, 0.92);
  const centerIdx = clamp(
    Math.floor(normDiff * rows.length) + rng.nextInt(-25, 25),
    0,
    Math.max(0, rows.length - 1),
  );

  const pairs: Array<{ subject: string; target: string; irt: number }> = [];
  const usedSubjects = new Set<string>();
  const usedTargets = new Set<string>();
  let decoyTarget = '';

  const stride = Math.max(1, (rng.nextUint32() % 11) + 1);
  for (let step = 0; step < rows.length; step++) {
    const ri = (centerIdx + step * stride) % rows.length;
    const r = rows[ri];
    const subj = sanitizeTriviaCopy(resolveCell(r, 0, poolCols, pool).trim());
    const targ = sanitizeTriviaCopy(resolveCell(r, ansCol, poolCols, pool).trim());
    if (!subj || !targ || subj.length > 28 || targ.length > 28) continue;
    const sLow = subj.toLowerCase();
    const tLow = targ.toLowerCase();
    if (
      sLow === tLow ||
      (tLow.length >= 4 && sLow.includes(tLow)) ||
      areHypernymCollidingLabels(sLow, tLow) ||
      usedSubjects.has(sLow) ||
      usedTargets.has(tLow)
    ) {
      continue;
    }
    let hypernymConflict = false;
    for (const prevT of usedTargets) {
      if (areHypernymCollidingLabels(prevT, tLow)) {
        hypernymConflict = true;
        break;
      }
    }
    if (hypernymConflict) continue;

    if (pairs.length < 3) {
      usedSubjects.add(sLow);
      usedTargets.add(tLow);
      pairs.push({
        subject: subj,
        target: targ,
        irt: Number(r[r.length - 1]) / 100.0,
      });
    } else {
      decoyTarget = targ;
      break;
    }
  }

  if (pairs.length < 3 || !decoyTarget) return null;

  const avgIrt =
    Math.round(
      clamp((pairs[0].irt + pairs[1].irt + pairs[2].irt) / 3 + 0.15, -1.4, 2.65) * 100,
    ) / 100;
  const catLabel = chosen.spec.l1Category;

  return {
    qid,
    l0Domain: domainId,
    l1Category: catLabel,
    l2Subcategory: 'Codex Synthesis',
    microTopicId: `codex_synth_${tbl.type}_${clampedSlot}`,
    regions: ['GLOBAL'],
    narrativeTags: ['LATERAL_DEDUCTION'],
    tone: 'PRESTIGE',
    irtB: avgIrt,
    irtA: 1.32,
    freshness: 'EVERGREEN',
    archetype: 'CODEX_DUAL_RING',
    prompt: sanitizeTriviaCopy(
      `Pair each ${catLabel.toLowerCase()} entry with its true match—one option below is an uninvited decoy.`,
    ),
    answerCorrect: `3/3 ${catLabel} Matches`,
    clues: buildNonLeakingCodexClues(
      catLabel,
      pairs.map((p) => ({ subject: p.subject, target: p.target })),
      decoyTarget,
      qid,
    ),
    glyphHint: chosen.spec.glyphHint ?? getForgeDomainInfo(domainId).glyphShape,
    whyExplanation: sanitizeTriviaCopy(
      `Full lineup: ${pairs[0].subject} pairs with ${pairs[0].target}, ${pairs[1].subject} with ${pairs[1].target}, and ${pairs[2].subject} with ${pairs[2].target}.`,
    ),
    codexExt: {
      pairs: pairs.map((p) => ({ subject: p.subject, target: p.target })),
      decoyTarget,
    },
    shardType: `${tbl.type}:codex_synth`,
  };
}

/**
 * Lookup binary search for an arbitrary QID `60,000..1,004,024` inside a loaded chunk.
 */
export function decodeQuestionByQidFromChunks(
  manifest: ShardManifest,
  chunks: ReadonlyArray<ShardChunkData>,
  qid: number,
  desiredDistractors = 3,
): RawQuestionRecord | null {
  for (const chunk of chunks) {
    for (let ti = 0; ti < chunk.t.length; ti++) {
      const tbl = chunk.t[ti];
      const spec = chunk.types?.[tbl.type] ?? manifest.types[tbl.type];
      if (!spec) continue;
      const nAngles = spec.angles.length;
      const start = tbl.baseQid;
      const end = start + tbl.r.length * nAngles - 1;
      if (qid >= start && qid <= end) {
        const offset = qid - start;
        const rowIdx = Math.floor(offset / nAngles);
        const angleIdx = offset % nAngles;
        return decodeShardRawQuestion(
          manifest,
          chunk,
          ti,
          rowIdx,
          angleIdx,
          desiredDistractors,
        );
      }
    }
  }
  return null;
}

// ============================================================================
// UNIFIED 5-MORPH PRISM QUESTION NORMALIZER
// ============================================================================

export interface NormalizeOptions {
  timerSec?: number;
  facetCount?: 4 | 5 | 6;
  shuffleSalt?: number;
  sourceTier?: QuestionSourceTier;
  shardRowRank01?: number;
}

function buildSightlineFacets(
  raw: RawQuestionRecord,
  facetCount: 4 | 5 | 6,
  shuffleSalt: number,
  cleanPrompt?: string,
): { facets: SightlineFacet[]; correctFacetIndex: number; shatteredIndices: number[] } {
  const promptCtx = cleanPrompt ?? sanitizeTriviaCopy(raw.prompt);
  const cleanAnswer = sanitizeAnswerOrFacet(raw.answerCorrect, promptCtx);
  const rawDists: RawDistractor[] = Array.isArray(raw.distractors) ? raw.distractors : [];
  const neededDistractors = Math.max(3, facetCount - 1);

  const poolItems: Array<{ text: string; isCorrect: boolean; plausibility: number }> = [
    { text: cleanAnswer, isCorrect: true, plausibility: 1.0 },
  ];

  const seenText = new Set<string>([cleanAnswer.trim().toLowerCase()]);
  for (const d of rawDists) {
    if (poolItems.length >= facetCount) break;
    const rawText = typeof d === 'string' ? d : d?.text;
    const rawPlaus = typeof d === 'string' ? 0.74 : d?.plausibility;
    const t = sanitizeAnswerOrFacet(String(rawText ?? '').trim(), promptCtx);
    if (!t || seenText.has(t.toLowerCase())) continue;
    seenText.add(t.toLowerCase());
    poolItems.push({
      text: t,
      isCorrect: false,
      plausibility: clamp(Number(rawPlaus ?? 0.72), 0.1, 0.95),
    });
  }

  // Pad cleanly only if a caller explicitly asks for 5-6 facets on a 4-option question
  const fallbackDecoys = ['Unverified Protocol', 'Secondary Archive', 'Null Hypothesis', 'Alternate Meridian'];
  let fbIdx = 0;
  while (poolItems.length < Math.min(facetCount, 1 + Math.max(3, rawDists.length)) || poolItems.length < 4) {
    const cand = fallbackDecoys[fbIdx % fallbackDecoys.length];
    fbIdx++;
    if (!seenText.has(cand.toLowerCase())) {
      seenText.add(cand.toLowerCase());
      poolItems.push({ text: cand, isCorrect: false, plausibility: 0.35 });
    }
    if (fbIdx > 8) break;
  }
  void neededDistractors;

  // Deterministic shuffle so option A is NEVER predetermined, yet daily/ghost seeds stay reproducible
  const rng = new DeterministicRng(
    fnv1a32(`WS_PRISM_FACETS:${raw.qid}:${shuffleSalt}:${raw.answerCorrect}`),
  );
  rng.shuffleInPlace(poolItems);

  // Choose which false facets shatter on Tier-3 Blueprint Core:
  // Keep the single highest-plausibility false decoy + the true answer (leaving a 2-facet duel!)
  const falseIndices = poolItems
    .map((item, idx) => ({ idx, plausibility: item.plausibility, isCorrect: item.isCorrect }))
    .filter((x) => !x.isCorrect)
    .sort((a, b) => a.plausibility - b.plausibility); // weakest decoys shatter first!

  const shatterTargetCount = Math.max(1, poolItems.length - 2);
  const shatterSet = new Set<number>(
    falseIndices.slice(0, shatterTargetCount).map((x) => x.idx),
  );

  // Synthesize realistic People's Lens global consensus percentages summing to 100%
  const rawWeights = poolItems.map((item) => {
    if (item.isCorrect) {
      return clamp(0.68 - raw.irtB * 0.14, 0.34, 0.84);
    }
    return clamp(item.plausibility * (0.18 + Math.max(0, raw.irtB) * 0.06), 0.04, 0.42);
  });
  const weightSum = rawWeights.reduce((acc, v) => acc + v, 0) || 1;
  const pctList = rawWeights.map((w) => Math.max(2, Math.round((w / weightSum) * 100)));
  const pctDiff = 100 - pctList.reduce((acc, v) => acc + v, 0);
  const correctIdx = Math.max(
    0,
    poolItems.findIndex((x) => x.isCorrect),
  );
  pctList[correctIdx] = Math.max(5, pctList[correctIdx] + pctDiff);

  const facets: SightlineFacet[] = poolItems.map((item, idx) => ({
    index: idx,
    slotLabel: SLOT_LETTERS[idx] ?? 'A',
    text: item.text,
    isCorrect: item.isCorrect,
    plausibility: item.plausibility,
    crowdSharePct: pctList[idx],
    shattersOnTier3: shatterSet.has(idx),
  }));

  return {
    facets,
    correctFacetIndex: correctIdx,
    shatteredIndices: Array.from(shatterSet).sort((a, b) => a - b),
  };
}

function buildCalibratorSpec(raw: RawQuestionRecord): CalibratorDialSpec {
  const ext = raw.calibratorExt ?? {
    exactVal: 1900,
    minVal: 1800,
    maxVal: 2000,
    step: 1,
    unit: 'CE',
  };
  const step = Math.max(0.1, Number(ext.step ?? 1));
  const minVal = Number(ext.minVal);
  const maxVal = Number(ext.maxVal) > minVal ? Number(ext.maxVal) : minVal + step * 20;
  const exactVal = clamp(Number(ext.exactVal), minVal, maxVal);
  const span = maxVal - minVal;

  const snapMargin = (rawMargin: number, minSteps: number): number => {
    const snapped = Math.round(rawMargin / step) * step;
    return Math.max(step * minSteps, snapped);
  };

  const totalSteps = Math.max(4, Math.round(span / step));
  const maxWideSteps = Math.max(1, Math.floor(totalSteps * 0.32));
  const wideMargin = Math.min(snapMargin(span * 0.16, 2), maxWideSteps * step);
  const sharpMargin = Math.min(
    snapMargin(span * 0.065, 1),
    Math.max(step, wideMargin - step),
  );
  const pinholeMargin = Math.min(
    snapMargin(span * 0.015, 1),
    Math.max(wideMargin > step ? step : 0, sharpMargin - step),
  );

  const cleanPrompt = sanitizeTriviaCopy(raw.prompt);
  const cones: [CalibratorToleranceCone, CalibratorToleranceCone, CalibratorToleranceCone] = [
    {
      id: 'WIDE',
      label: `WIDE ±${formatCleanTriviaNumber(wideMargin, ext.unit, cleanPrompt)}${ext.unit ? ` ${ext.unit}` : ''}`,
      margin: wideMargin,
      pctOfSpan: Number(clamp(wideMargin / span, 0.08, 0.32).toFixed(3)),
      multiplier: 1.5,
    },
    {
      id: 'SHARP',
      label: `SHARP ±${formatCleanTriviaNumber(sharpMargin, ext.unit, cleanPrompt)}${ext.unit ? ` ${ext.unit}` : ''}`,
      margin: sharpMargin,
      pctOfSpan: Number(clamp(sharpMargin / span, 0.03, 0.15).toFixed(3)),
      multiplier: 2.5,
    },
    {
      id: 'PINHOLE',
      label: `PINHOLE ±${formatCleanTriviaNumber(pinholeMargin, ext.unit, cleanPrompt)}${ext.unit ? ` ${ext.unit}` : ''}`,
      margin: pinholeMargin,
      pctOfSpan: Number(clamp(pinholeMargin / span, 0.008, 0.05).toFixed(3)),
      multiplier: 3.5,
    },
  ];

  // Prevent untouched dial auto-win (#190 P1): guarantee initialEstimate sits strictly outside WIDE tolerance!
  const snapToStep = (v: number): number => clamp(Math.round(v / step) * step, minVal, maxVal);
  const midSnap = snapToStep((minVal + maxVal) * 0.5);
  let initialEstimate = midSnap;
  if (Math.abs(initialEstimate - exactVal) <= wideMargin * 1.15) {
    const lowAnchor = snapToStep(minVal + span * 0.14);
    const highAnchor = snapToStep(minVal + span * 0.86);
    const lowDist = Math.abs(lowAnchor - exactVal);
    const highDist = Math.abs(highAnchor - exactVal);
    if (lowDist > wideMargin * 1.15 && highDist > wideMargin * 1.15) {
      initialEstimate = (fnv1a32(`CAL_INIT:${raw.qid}`) & 1) === 0 ? lowAnchor : highAnchor;
    } else {
      initialEstimate = lowDist >= highDist ? lowAnchor : highAnchor;
    }
    if (Math.abs(initialEstimate - exactVal) <= wideMargin) {
      initialEstimate =
        Math.abs(minVal - exactVal) >= Math.abs(maxVal - exactVal) ? minVal : maxVal;
    }
  }

  return {
    exactVal,
    minVal,
    maxVal,
    step,
    unit: String(ext.unit ?? ''),
    logScale: Boolean(ext.logScale),
    initialEstimate,
    exactNormalized: clamp((exactVal - minVal) / span, 0, 1),
    toleranceCones: cones,
  };
}

function buildCodexSpec(raw: RawQuestionRecord, shuffleSalt: number): CodexRingSpec {
  const pairsRaw = raw.codexExt?.pairs ?? [];
  const rawP0 = pairsRaw[0] ?? { subject: 'Alpha Node', target: 'Key I' };
  const rawP1 = pairsRaw[1] ?? { subject: 'Beta Node', target: 'Key II' };
  const rawP2 = pairsRaw[2] ?? { subject: 'Gamma Node', target: 'Key III' };
  const p0 = { subject: sanitizeTriviaCopy(rawP0.subject), target: sanitizeTriviaCopy(rawP0.target) };
  const p1 = { subject: sanitizeTriviaCopy(rawP1.subject), target: sanitizeTriviaCopy(rawP1.target) };
  const p2 = { subject: sanitizeTriviaCopy(rawP2.subject), target: sanitizeTriviaCopy(rawP2.target) };
  const decoy = sanitizeTriviaCopy(String(raw.codexExt?.decoyTarget ?? 'Decoy Node'));

  const subjects: [string, string, string] = [p0.subject, p1.subject, p2.subject];
  const targetList = [p0.target, p1.target, p2.target, decoy];

  const rng = new DeterministicRng(fnv1a32(`WS_CODEX_RING:${raw.qid}:${shuffleSalt}`));
  rng.shuffleInPlace(targetList);

  // Guarantee submitting untouched [0, 1, 2] NEVER auto-passes (neither 3/3 nor 2/3 partial credit, #284)!
  const countIdentityMatches = (list: ReadonlyArray<string>): number => {
    let matches = 0;
    if (list[0] === p0.target) matches += 1;
    if (list[1] === p1.target) matches += 1;
    if (list[2] === p2.target) matches += 1;
    return matches;
  };
  let guardSteps = 0;
  while (countIdentityMatches(targetList) >= 2 && guardSteps < 8) {
    const last = targetList.pop()!;
    targetList.unshift(last);
    guardSteps += 1;
  }

  const targets = [targetList[0], targetList[1], targetList[2], targetList[3]] as [
    string,
    string,
    string,
    string,
  ];

  const correctTargetIndexBySubject: [number, number, number] = [
    Math.max(0, targets.indexOf(p0.target)),
    Math.max(0, targets.indexOf(p1.target)),
    Math.max(0, targets.indexOf(p2.target)),
  ];

  return {
    subjects,
    targets,
    correctTargetIndexBySubject,
    pairs: [p0, p1, p2],
    decoyTarget: decoy,
  };
}

function buildGauntletSpec(raw: RawQuestionRecord, cleanPrompt?: string): GauntletPlateSpec {
  const ext =
    raw.gauntletExt ??
    (raw as RawQuestionRecord & { gauntlet?: RawQuestionRecord['gauntletExt'] }).gauntlet;
  const isTrue = Boolean(ext?.isTrue ?? raw.answerCorrect.toUpperCase() === 'TRUE');
  const isTrick = Boolean(
    ext?.isTrick ?? raw.answerCorrect.toUpperCase().includes('CHALLENGE'),
  );
  const windowSec = clamp(Number(ext?.windowSec ?? 8), 4, 15);
  return {
    statement: cleanPrompt ?? sanitizeTriviaCopy(raw.prompt),
    isTrue,
    isTrick,
    windowSec,
    correctAction: isTrick ? 'CHALLENGE' : isTrue ? 'VERIFY' : 'DEBUNK',
  };
}

/** Dense 128-city regional anchor atlas so GLOBE_PIN_DROP & VISUAL_SPOTTER always pick plausible regional neighbors (350–2,200 km). */
export const REGIONAL_GLOBE_ANCHORS: ReadonlyArray<{ label: string; lat: number; lon: number }> = [
  // North America — East & Midwest
  { label: 'Boston, USA', lat: 42.3601, lon: -71.0589 },
  { label: 'New York, USA', lat: 40.7128, lon: -74.006 },
  { label: 'Philadelphia, USA', lat: 39.9526, lon: -75.1652 },
  { label: 'Washington, D.C., USA', lat: 38.9072, lon: -77.0369 },
  { label: 'Baltimore, USA', lat: 39.2904, lon: -76.6122 },
  { label: 'Pittsburgh, USA', lat: 40.4406, lon: -79.9959 },
  { label: 'Atlanta, USA', lat: 33.749, lon: -84.388 },
  { label: 'Miami, USA', lat: 25.7617, lon: -80.1918 },
  { label: 'New Orleans, USA', lat: 29.9511, lon: -90.0715 },
  { label: 'Chicago, USA', lat: 41.8781, lon: -87.6298 },
  { label: 'Detroit, USA', lat: 42.3314, lon: -83.0458 },
  { label: 'St. Louis, USA', lat: 38.627, lon: -90.1994 },
  { label: 'Minneapolis, USA', lat: 44.9778, lon: -93.265 },
  { label: 'Kansas City, USA', lat: 39.0997, lon: -94.5786 },
  { label: 'Dallas, USA', lat: 32.7767, lon: -96.797 },
  { label: 'Houston, USA', lat: 29.7604, lon: -95.3698 },
  // North America — West, Canada & Mexico/Caribbean
  { label: 'Denver, USA', lat: 39.7392, lon: -104.9903 },
  { label: 'Phoenix, USA', lat: 33.4484, lon: -112.074 },
  { label: 'Salt Lake City, USA', lat: 40.7608, lon: -111.891 },
  { label: 'Los Angeles, USA', lat: 34.0522, lon: -118.2437 },
  { label: 'San Diego, USA', lat: 32.7157, lon: -117.1611 },
  { label: 'San Francisco, USA', lat: 37.7749, lon: -122.4194 },
  { label: 'Seattle, USA', lat: 47.6062, lon: -122.3321 },
  { label: 'Portland, USA', lat: 45.5152, lon: -122.6784 },
  { label: 'Toronto, Canada', lat: 43.6532, lon: -79.3832 },
  { label: 'Montreal, Canada', lat: 45.5017, lon: -73.5673 },
  { label: 'Vancouver, Canada', lat: 49.2827, lon: -123.1207 },
  { label: 'Calgary, Canada', lat: 51.0447, lon: -114.0719 },
  { label: 'Halifax, Canada', lat: 44.6488, lon: -63.5752 },
  { label: 'Anchorage, Alaska', lat: 61.2181, lon: -149.9003 },
  { label: 'Fairbanks, Alaska', lat: 64.8378, lon: -147.7164 },
  { label: 'Juneau, Alaska', lat: 58.3019, lon: -134.4197 },
  { label: 'Mexico City, Mexico', lat: 19.4326, lon: -99.1332 },
  { label: 'Guadalajara, Mexico', lat: 20.6597, lon: -103.3496 },
  { label: 'Monterrey, Mexico', lat: 25.6866, lon: -100.3161 },
  { label: 'Cancun, Mexico', lat: 21.1619, lon: -86.8515 },
  { label: 'Havana, Cuba', lat: 23.1136, lon: -82.3666 },
  { label: 'San Juan, Puerto Rico', lat: 18.4655, lon: -66.1057 },
  { label: 'Panama City, Panama', lat: 8.9824, lon: -79.5199 },
  { label: 'San Jose, Costa Rica', lat: 9.9281, lon: -84.0907 },
  // South America
  { label: 'Bogota, Colombia', lat: 4.711, lon: -74.0721 },
  { label: 'Quito, Ecuador', lat: -0.1807, lon: -78.4678 },
  { label: 'Lima, Peru', lat: -12.0464, lon: -77.0428 },
  { label: 'Cusco, Peru', lat: -13.5319, lon: -71.9675 },
  { label: 'La Paz, Bolivia', lat: -16.4897, lon: -68.1193 },
  { label: 'Santiago, Chile', lat: -33.4489, lon: -70.6693 },
  { label: 'Buenos Aires, Argentina', lat: -34.6037, lon: -58.3816 },
  { label: 'Montevideo, Uruguay', lat: -34.9011, lon: -56.1645 },
  { label: 'Sao Paulo, Brazil', lat: -23.5505, lon: -46.6333 },
  { label: 'Rio de Janeiro, Brazil', lat: -22.9068, lon: -43.1729 },
  { label: 'Brasilia, Brazil', lat: -15.7975, lon: -47.8919 },
  { label: 'Salvador, Brazil', lat: -12.9714, lon: -38.5014 },
  { label: 'Manaus, Brazil', lat: -3.119, lon: -60.0217 },
  { label: 'Caracas, Venezuela', lat: 10.4806, lon: -66.9036 },
  { label: 'Asuncion, Paraguay', lat: -25.2637, lon: -57.5759 },
  { label: 'Bariloche, Argentina', lat: -41.1335, lon: -71.3103 },
  { label: 'Comodoro Rivadavia, Argentina', lat: -45.8641, lon: -67.4966 },
  { label: 'Puerto Montt, Chile', lat: -41.4693, lon: -72.9424 },
  { label: 'Stanley, Falkland Islands', lat: -51.6977, lon: -57.8517 },
  { label: 'Mar del Plata, Argentina', lat: -38.0055, lon: -57.5426 },
  // Europe
  { label: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { label: 'Edinburgh, UK', lat: 55.9533, lon: -3.1883 },
  { label: 'Dublin, Ireland', lat: 53.3498, lon: -6.2603 },
  { label: 'Paris, France', lat: 48.8566, lon: 2.3522 },
  { label: 'Lyon, France', lat: 45.764, lon: 4.8357 },
  { label: 'Madrid, Spain', lat: 40.4168, lon: -3.7038 },
  { label: 'Barcelona, Spain', lat: 41.3874, lon: 2.1686 },
  { label: 'Lisbon, Portugal', lat: 38.7223, lon: -9.1393 },
  { label: 'Amsterdam, Netherlands', lat: 52.3676, lon: 4.9041 },
  { label: 'Brussels, Belgium', lat: 50.8503, lon: 4.3517 },
  { label: 'Geneva, Switzerland', lat: 46.2044, lon: 6.1432 },
  { label: 'Zurich, Switzerland', lat: 47.3769, lon: 8.5417 },
  { label: 'Berlin, Germany', lat: 52.52, lon: 13.405 },
  { label: 'Munich, Germany', lat: 48.1351, lon: 11.582 },
  { label: 'Rome, Italy', lat: 41.9028, lon: 12.4964 },
  { label: 'Milan, Italy', lat: 45.4642, lon: 9.19 },
  { label: 'Venice, Italy', lat: 45.4408, lon: 12.3155 },
  { label: 'Vienna, Austria', lat: 48.2082, lon: 16.3738 },
  { label: 'Prague, Czechia', lat: 50.0755, lon: 14.4378 },
  { label: 'Warsaw, Poland', lat: 52.2297, lon: 21.0122 },
  { label: 'Budapest, Hungary', lat: 47.4979, lon: 19.0402 },
  { label: 'Athens, Greece', lat: 37.9838, lon: 23.7275 },
  { label: 'Istanbul, Turkey', lat: 41.0082, lon: 28.9784 },
  { label: 'Stockholm, Sweden', lat: 59.3293, lon: 18.0686 },
  { label: 'Oslo, Norway', lat: 59.9139, lon: 10.7522 },
  { label: 'Copenhagen, Denmark', lat: 55.6761, lon: 12.5683 },
  { label: 'Helsinki, Finland', lat: 60.1699, lon: 24.9384 },
  { label: 'Reykjavik, Iceland', lat: 64.1466, lon: -21.9426 },
  { label: 'Torshavn, Faroe Islands', lat: 62.0079, lon: -6.791 },
  { label: 'Nuuk, Greenland', lat: 64.1814, lon: -51.6941 },
  { label: 'Bergen, Norway', lat: 60.3913, lon: 5.3221 },
  { label: 'Moscow, Russia', lat: 55.7558, lon: 37.6173 },
  { label: 'Saint Petersburg, Russia', lat: 59.9311, lon: 30.3609 },
  { label: 'Kyiv, Ukraine', lat: 50.4501, lon: 30.5234 },
  { label: 'Bucharest, Romania', lat: 44.4268, lon: 26.1025 },
  // Africa & Middle East
  { label: 'Cairo, Egypt', lat: 30.0444, lon: 31.2357 },
  { label: 'Casablanca, Morocco', lat: 33.5731, lon: -7.5898 },
  { label: 'Tunis, Tunisia', lat: 36.8065, lon: 10.1815 },
  { label: 'Algiers, Algeria', lat: 36.7538, lon: 3.0588 },
  { label: 'Lagos, Nigeria', lat: 6.5244, lon: 3.3792 },
  { label: 'Accra, Ghana', lat: 5.6037, lon: -0.187 },
  { label: 'Dakar, Senegal', lat: 14.7167, lon: -17.4677 },
  { label: 'Addis Ababa, Ethiopia', lat: 9.032, lon: 38.7469 },
  { label: 'Nairobi, Kenya', lat: -1.2921, lon: 36.8219 },
  { label: 'Kampala, Uganda', lat: 0.3476, lon: 32.5825 },
  { label: 'Kigali, Rwanda', lat: -1.9441, lon: 30.0619 },
  { label: 'Lusaka, Zambia', lat: -15.3875, lon: 28.3228 },
  { label: 'Harare, Zimbabwe', lat: -17.8292, lon: 31.0522 },
  { label: 'Dar es Salaam, Tanzania', lat: -6.7924, lon: 39.2083 },
  { label: 'Kinshasa, DR Congo', lat: -4.4419, lon: 15.2663 },
  { label: 'Johannesburg, South Africa', lat: -26.2041, lon: 28.0473 },
  { label: 'Durban, South Africa', lat: -29.8587, lon: 31.0218 },
  { label: 'Gaborone, Botswana', lat: -24.6282, lon: 25.9231 },
  { label: 'Bloemfontein, South Africa', lat: -29.0852, lon: 26.1596 },
  { label: 'Cape Town, South Africa', lat: -33.9249, lon: 18.4241 },
  { label: 'Windhoek, Namibia', lat: -22.5609, lon: 17.0658 },
  { label: 'Maputo, Mozambique', lat: -25.9692, lon: 32.5732 },
  { label: 'Jerusalem', lat: 31.7683, lon: 35.2137 },
  { label: 'Amman, Jordan', lat: 31.9454, lon: 35.9284 },
  { label: 'Beirut, Lebanon', lat: 33.8938, lon: 35.5018 },
  { label: 'Riyadh, Saudi Arabia', lat: 24.7136, lon: 46.6753 },
  { label: 'Dubai, UAE', lat: 25.2048, lon: 55.2708 },
  { label: 'Tehran, Iran', lat: 35.6892, lon: 51.389 },
  { label: 'Baghdad, Iraq', lat: 33.3152, lon: 44.3661 },
  { label: 'Tashkent, Uzbekistan', lat: 41.2995, lon: 69.2401 },
  { label: 'Almaty, Kazakhstan', lat: 43.222, lon: 76.8512 },
  { label: 'Ulaanbaatar, Mongolia', lat: 47.8864, lon: 106.9057 },
  { label: 'Novosibirsk, Russia', lat: 55.0084, lon: 82.9357 },
  { label: 'Krasnoyarsk, Russia', lat: 56.0153, lon: 92.8932 },
  { label: 'Harbin, China', lat: 45.8038, lon: 126.5349 },
  // Asia & Oceania
  { label: 'New Delhi, India', lat: 28.6139, lon: 77.209 },
  { label: 'Mumbai, India', lat: 19.076, lon: 72.8777 },
  { label: 'Bengaluru, India', lat: 12.9716, lon: 77.5946 },
  { label: 'Hyderabad, India', lat: 17.385, lon: 78.4867 },
  { label: 'Chennai, India', lat: 13.0827, lon: 80.2707 },
  { label: 'Kochi, India', lat: 9.9312, lon: 76.2673 },
  { label: 'Kolkata, India', lat: 22.5726, lon: 88.3639 },
  { label: 'Kathmandu, Nepal', lat: 27.7172, lon: 85.324 },
  { label: 'Colombo, Sri Lanka', lat: 6.9271, lon: 79.8612 },
  { label: 'Islamabad, Pakistan', lat: 33.6844, lon: 73.0479 },
  { label: 'Bangkok, Thailand', lat: 13.7563, lon: 100.5018 },
  { label: 'Hanoi, Vietnam', lat: 21.0278, lon: 105.8342 },
  { label: 'Ho Chi Minh City, Vietnam', lat: 10.8231, lon: 106.6297 },
  { label: 'Phnom Penh, Cambodia', lat: 11.5564, lon: 104.9282 },
  { label: 'Kuala Lumpur, Malaysia', lat: 3.139, lon: 101.6869 },
  { label: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { label: 'Jakarta, Indonesia', lat: -6.2088, lon: 106.8456 },
  { label: 'Surabaya, Indonesia', lat: -7.2575, lon: 112.7521 },
  { label: 'Denpasar, Bali', lat: -8.6705, lon: 115.2126 },
  { label: 'Makassar, Indonesia', lat: -5.1477, lon: 119.4327 },
  { label: 'Dili, Timor-Leste', lat: -8.5569, lon: 125.5603 },
  { label: 'Manila, Philippines', lat: 14.5995, lon: 120.9842 },
  { label: 'Beijing, China', lat: 39.9042, lon: 116.4074 },
  { label: 'Shanghai, China', lat: 31.2304, lon: 121.4737 },
  { label: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
  { label: 'Taipei, Taiwan', lat: 25.033, lon: 121.5654 },
  { label: 'Seoul, South Korea', lat: 37.5665, lon: 126.978 },
  { label: 'Busan, South Korea', lat: 35.1796, lon: 129.0756 },
  { label: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { label: 'Osaka, Japan', lat: 34.6937, lon: 135.5023 },
  { label: 'Sapporo, Japan', lat: 43.0618, lon: 141.3545 },
  { label: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
  { label: 'Melbourne, Australia', lat: -37.8136, lon: 144.9631 },
  { label: 'Brisbane, Australia', lat: -27.4698, lon: 153.0251 },
  { label: 'Adelaide, Australia', lat: -34.9285, lon: 138.6007 },
  { label: 'Hobart, Australia', lat: -42.8821, lon: 147.3272 },
  { label: 'Cairns, Australia', lat: -16.9186, lon: 145.7781 },
  { label: 'Darwin, Australia', lat: -12.4634, lon: 130.8456 },
  { label: 'Perth, Australia', lat: -31.9505, lon: 115.8605 },
  { label: 'Port Moresby, Papua New Guinea', lat: -9.4438, lon: 147.1803 },
  { label: 'Auckland, New Zealand', lat: -36.8485, lon: 174.7633 },
  { label: 'Wellington, New Zealand', lat: -41.2865, lon: 174.7762 },
  { label: 'Christchurch, New Zealand', lat: -43.5321, lon: 172.6362 },
  { label: 'Queenstown, New Zealand', lat: -45.0312, lon: 168.6626 },
  { label: 'Dunedin, New Zealand', lat: -45.8788, lon: 170.5028 },
  { label: 'Suva, Fiji', lat: -18.1416, lon: 178.4419 },
  { label: 'Honolulu, Hawaii', lat: 21.3069, lon: -157.8583 },
  { label: 'Papeete, French Polynesia', lat: -17.5516, lon: -149.5585 },
];

export function approxGreatCircleKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const sLat = Math.sin(dLat * 0.5);
  const sLon = Math.sin(dLon * 0.5);
  const a = clamp(
    sLat * sLat + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * sLon * sLon,
    0,
    1,
  );
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function cityCoreToken(label: string): string {
  const afterDot = label.includes('·') ? label.split('·').pop()!.trim() : label.trim();
  // If afterDot is "City, Country", extract "city". If afterDot has no comma (e.g. "Australia" or "India"),
  // use the landmark/city prefix before "·" so we NEVER exclude other cities in the same country!
  if (afterDot.includes(',')) {
    return afterDot.split(',')[0].trim().toLowerCase();
  }
  const beforeDot = label.includes('·') ? label.split('·')[0].trim().toLowerCase() : afterDot.toLowerCase();
  return beforeDot;
}

/**
 * Picks plausible regional neighbor decoys strictly within `350–2,200 km` of `(targetLat, targetLon)`
 * (widening gently ONLY for ultra-isolated oceanic islands with fewer than 3 cities in 2,200 km)
 * so GLOBE_PIN_DROP & VISUAL_SPOTTER NEVER pair Boston with Seoul or New York with Sydney!
 */
export function pickRegionalGlobeDecoys(
  targetLat: number,
  targetLon: number,
  targetLabel: string,
  seed: number,
  desiredCount = 3,
): Array<{ label: string; lat: number; lon: number }> {
  const targetLow = targetLabel.trim().toLowerCase();
  const targetCityCore = cityCoreToken(targetLabel);
  const rng = new DeterministicRng(seed);

  const scored = REGIONAL_GLOBE_ANCHORS.map((cand) => ({
    ...cand,
    distKm: approxGreatCircleKm(targetLat, targetLon, cand.lat, cand.lon),
  })).filter((cand) => {
    const cLow = cand.label.toLowerCase();
    const cCore = cityCoreToken(cand.label);
    if (cLow === targetLow || cCore === targetCityCore) return false;
    if (targetCityCore.length >= 4 && (cLow.includes(targetCityCore) || targetLow.includes(cCore))) {
      return false;
    }
    return cand.distKm >= 350;
  });

  // Primary regional band: 350..2,200 km!
  const regionalBand = scored.filter((c) => c.distKm >= 350 && c.distKm <= 2200);
  rng.shuffleInPlace(regionalBand);

  const picked: Array<{ label: string; lat: number; lon: number }> = [];
  const tryPickFrom = (
    pool: ReadonlyArray<{ label: string; lat: number; lon: number; distKm: number }>,
    minPeerSpacingKm: number,
  ): void => {
    for (const cand of pool) {
      if (picked.length >= desiredCount) break;
      if (picked.some((p) => p.label.toLowerCase() === cand.label.toLowerCase())) continue;
      if (
        picked.some(
          (p) => approxGreatCircleKm(p.lat, p.lon, cand.lat, cand.lon) < minPeerSpacingKm,
        )
      ) {
        continue;
      }
      picked.push({ label: cand.label, lat: cand.lat, lon: cand.lon });
    }
  };

  tryPickFrom(regionalBand, 260);
  if (picked.length < desiredCount) {
    tryPickFrom(regionalBand, 120);
  }
  if (picked.length < desiredCount) {
    // Only for ultra-isolated oceanic targets (e.g. Honolulu / Easter Island): pick nearest Pacific/basin peers
    const nearestFallback = [...scored].sort((a, b) => a.distKm - b.distKm);
    tryPickFrom(nearestFallback, 200);
  }
  return picked;
}

/**
 * Normalizes any visual blueprint path into a subpath-safe `./assets/visuals/...` URL
 * so SVGs load cleanly on both localhost and `https://<host>/Worlds-Smartest/`.
 */
export function normalizeVisualAssetUrl(rawUrl: string): string {
  const trimmed = String(rawUrl ?? '').trim();
  if (!trimmed) return '';
  if (/^(?:https?:\/\/|data:)/i.test(trimmed)) {
    return trimmed;
  }
  const cleaned = trimmed
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/')
    .replace(/^\.\/+/, '')
    .replace(/^\/+/, '')
    .replace(/^public\//i, '');

  if (cleaned.startsWith('assets/visuals/')) {
    return `./${cleaned}`;
  }
  if (cleaned.startsWith('visuals/')) {
    return `./assets/${cleaned}`;
  }
  if (cleaned.startsWith('assets/')) {
    return `./${cleaned}`;
  }
  return `./assets/visuals/${cleaned}`;
}

function buildVisualPlateSpec(raw: RawQuestionRecord): VisualLensPlateSpec | undefined {
  if (!raw.visualPlate || !raw.visualPlate.imageUrl) {
    return undefined;
  }
  const normalizedUrl = normalizeVisualAssetUrl(raw.visualPlate.imageUrl);
  if (!normalizedUrl) return undefined;
  const cleanCaption = sanitizeTriviaCopy(
    raw.visualPlate.caption?.trim() || raw.l1Category?.trim() || 'Visual Blueprint Plate',
  );
  return {
    imageUrl: normalizedUrl,
    caption: cleanCaption,
    aspect: raw.visualPlate.aspect === 'SQUARE' ? 'SQUARE' : 'WIDE',
    ...(raw.visualPlate.altText
      ? { altText: sanitizeTriviaCopy(raw.visualPlate.altText) }
      : { altText: cleanCaption }),
    ...(raw.visualPlate.kind ? { kind: raw.visualPlate.kind } : {}),
  };
}

function synthesizeGlobeRegionHint(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'Northern' : 'Southern';
  const ew = lon >= 0 ? 'Eastern' : 'Western';
  let zone = 'global meridian sector';
  if (lon >= -170 && lon <= -50 && lat >= 12) {
    zone = 'North & Central America';
  } else if (lon >= -85 && lon <= -30 && lat < 12) {
    zone = 'South America';
  } else if (lon >= -26 && lon <= 45 && lat >= 34) {
    zone = 'Europe & the Mediterranean basin';
  } else if (lon >= -20 && lon <= 52 && lat < 34 && lat >= -36) {
    zone = 'Africa & the Middle East';
  } else if (lon > 45 && lon <= 150 && lat >= 5) {
    zone = 'Asia & the Indo-Pacific arc';
  } else if (lon >= 110 && lat < 5) {
    zone = 'Oceania & the South Pacific';
  }
  return `Target lies in the ${ns} and ${ew} Hemispheres — focus on ${zone}.`;
}

function synthesizeGlobeCoordHint(lat: number, lon: number): string {
  const latBand = Math.round(Math.abs(lat) / 5) * 5;
  const lonBand = Math.round(Math.abs(lon) / 5) * 5;
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `Coordinate corridor: near ${latBand}° ${latDir}, ${lonBand}° ${lonDir}.`;
}

function buildGlobePinSpec(raw: RawQuestionRecord, shuffleSalt: number): GlobePinDropSpec {
  const ext = raw.globePin;
  const targetLat = clamp(Number(ext?.targetLat ?? 46.2044), -89.9, 89.9);
  const targetLon = clamp(Number(ext?.targetLon ?? 6.1432), -180, 180);
  const targetLabel = sanitizeTriviaCopy(
    ext?.targetLabel?.trim() || raw.answerCorrect?.trim() || 'Meridian Target',
  );
  const bullseyeKm = clamp(Number(ext?.bullseyeKm ?? 300), 50, 1500);
  const goldKm = Math.max(bullseyeKm + 150, clamp(Number(ext?.goldKm ?? 1000), 250, 3500));
  const grazeKm = Math.max(goldKm + 300, clamp(Number(ext?.grazeKm ?? 2200), 600, 6000));

  const rawClues = Array.isArray(raw.clues) ? raw.clues : [];
  const regionHint = sanitizeTriviaCopy(
    ext?.regionHint?.trim() ||
      rawClues[0]?.trim() ||
      synthesizeGlobeRegionHint(targetLat, targetLon),
  );
  const coordHint = sanitizeTriviaCopy(
    ext?.coordHint?.trim() ||
      rawClues[1]?.trim() ||
      synthesizeGlobeCoordHint(targetLat, targetLon),
  );

  const seed = fnv1a32(`WS_GLOBE_ANCHORS:${raw.qid}:${shuffleSalt}:${targetLabel}`);
  const rng = new DeterministicRng(seed);

  // Validate any pre-authored quickAnchors: keep ONLY regional decoys within 350..2,200 km!
  // Any opposite-hemisphere / far-away legacy decoy (e.g. Seoul for Boston) is replaced cleanly.
  const targetAnchor = { label: targetLabel, lat: targetLat, lon: targetLon };
  const validRegionalDecoys: Array<{ label: string; lat: number; lon: number }> = [];
  const seenDecoyLabels = new Set<string>([targetLabel.toLowerCase(), cityCoreToken(targetLabel)]);

  if (Array.isArray(ext?.quickAnchors)) {
    for (const a of ext.quickAnchors) {
      if (!a || !a.label) continue;
      const lbl = sanitizeTriviaCopy(String(a.label).trim());
      if (!lbl) continue;
      const lat = clamp(Number(a.lat), -89.9, 89.9);
      const lon = clamp(Number(a.lon), -180, 180);
      const d = approxGreatCircleKm(targetLat, targetLon, lat, lon);
      // Skip the target itself or anything too close (<350 km) or far away (>2,200 km)
      if (d < 350 || d > 2200) continue;
      const low = lbl.toLowerCase();
      const core = cityCoreToken(lbl);
      if (seenDecoyLabels.has(low) || seenDecoyLabels.has(core)) continue;
      seenDecoyLabels.add(low);
      seenDecoyLabels.add(core);
      validRegionalDecoys.push({ label: lbl, lat, lon });
      if (validRegionalDecoys.length >= 3) break;
    }
  }

  if (validRegionalDecoys.length < 3) {
    const regionalFill = pickRegionalGlobeDecoys(
      targetLat,
      targetLon,
      targetLabel,
      seed ^ 0x51ed270b,
      6,
    );
    for (const cand of regionalFill) {
      if (validRegionalDecoys.length >= 3) break;
      const low = cand.label.toLowerCase();
      const core = cityCoreToken(cand.label);
      if (seenDecoyLabels.has(low) || seenDecoyLabels.has(core)) continue;
      if (
        validRegionalDecoys.some(
          (existing) => approxGreatCircleKm(existing.lat, existing.lon, cand.lat, cand.lon) < 180,
        )
      ) {
        continue;
      }
      seenDecoyLabels.add(low);
      seenDecoyLabels.add(core);
      validRegionalDecoys.push(cand);
    }
  }

  const anchors: Array<{ label: string; lat: number; lon: number }> = [
    targetAnchor,
    ...validRegionalDecoys.slice(0, 3),
  ];
  rng.shuffleInPlace(anchors);

  return {
    targetLat,
    targetLon,
    targetLabel,
    bullseyeKm,
    goldKm,
    grazeKm,
    regionHint,
    coordHint,
    quickAnchors: anchors,
  };
}

export function normalizeToPrismQuestion(
  raw: RawQuestionRecord,
  options: NormalizeOptions = {},
): PrismQuestion {
  const domId = clamp(Math.trunc(raw.l0Domain ?? raw.domainId ?? 0), 0, 11) as DomainId;
  const domainMeta = getForgeDomainInfo(domId);
  const arch: Archetype3D = raw.archetype ?? 'SIGHTLINE_LOCK';
  const facetCount: 4 | 5 | 6 = options.facetCount ?? 4;
  const salt = options.shuffleSalt ?? 0;

  const isCodexSynthQid =
    raw.qid >= CODEX_SYNTHESIS_BASE_QID &&
    raw.qid < CODEX_SYNTHESIS_BASE_QID + CODEX_SYNTHESIS_PER_DOMAIN * 12;
  const isCuratedPackQid =
    raw.qid <= 4_964 ||
    (raw.qid >= 50_000 && raw.qid < 60_000) ||
    (raw.qid >= 1_060_000 && raw.qid < 1_100_000);

  const sourceTier: QuestionSourceTier =
    options.sourceTier ??
    (isCodexSynthQid
      ? 'CODEX_SYNTHESIS'
      : isCuratedPackQid
        ? 'GOLD_CURATED'
        : raw.qid >= 60_000
          ? 'FACT_GRAPH_SHARD'
          : 'VERIFIED_BENCHMARK');

  const cleanPrompt = sanitizeTriviaCopy(raw.prompt);
  const globePin = arch === 'GLOBE_PIN_DROP' ? buildGlobePinSpec(raw, salt) : undefined;
  const visualPlate = buildVisualPlateSpec(raw);

  const cleanAnswerCorrect =
    arch === 'CALIBRATOR_DIAL' && raw.calibratorExt
      ? sanitizeTriviaCopy(
          `${formatCleanTriviaNumber(raw.calibratorExt.exactVal, raw.calibratorExt.unit, cleanPrompt)}${raw.calibratorExt.unit ? ` ${raw.calibratorExt.unit}` : ''}`.trim(),
        )
      : arch === 'GLOBE_PIN_DROP' && globePin
        ? globePin.targetLabel
        : sanitizeAnswerOrFacet(raw.answerCorrect, cleanPrompt);

  const rawClues = Array.isArray(raw.clues) ? raw.clues : [];
  let lateralClue =
    arch === 'GLOBE_PIN_DROP' && globePin
      ? globePin.regionHint
      : sanitizeTriviaCopy(
          rawClues[0]?.trim() ||
            `Think of the signature hallmark in ${raw.l1Category ?? domainMeta.name} that rules out the two outliers.`,
        );
  let pinpointClue =
    arch === 'GLOBE_PIN_DROP' && globePin
      ? globePin.coordHint
      : sanitizeTriviaCopy(
          rawClues[1]?.trim() ||
            (arch === 'SIGHTLINE_LOCK' || arch === 'HERO_ARTIFACT_SYNTHESIS'
              ? `Eliminate the two most distant ${domainMeta.shortName.toLowerCase()} outliers to zero in on the true link.`
              : lateralClue),
        );

  if (arch === 'CODEX_DUAL_RING' && raw.codexExt) {
    const safeCodexClues = buildNonLeakingCodexClues(
      raw.l1Category?.trim() || domainMeta.name,
      raw.codexExt.pairs,
      raw.codexExt.decoyTarget,
      raw.qid,
      [lateralClue, pinpointClue],
    );
    lateralClue = safeCodexClues[0];
    pinpointClue = safeCodexClues[1];
  } else if (RE_DRY_LETTER_HINT.test(pinpointClue)) {
    pinpointClue = lateralClue;
  }

  const glyphHint: GlyphHint = raw.glyphHint ?? domainMeta.glyphShape;
  const glyphId = resolveSdfGlyphId(raw, domId);
  const glyphUrl = `./assets/glyphs/${glyphId}.png`;
  const l1Category = raw.l1Category?.trim() || domainMeta.name;
  const l2Subcategory = raw.l2Subcategory?.trim() || raw.l2Category?.trim() || 'General Archive';
  const glyphCategoryLabel = `${domainMeta.shortName.toUpperCase()} · ${l1Category.toUpperCase()}`;

  let facets: SightlineFacet[] = [];
  let correctFacetIndex = 0;
  let shatteredFacetIndices: number[] = [];

  if (arch === 'SIGHTLINE_LOCK' || arch === 'HERO_ARTIFACT_SYNTHESIS') {
    const built = buildSightlineFacets(raw, facetCount, salt, cleanPrompt);
    facets = built.facets;
    correctFacetIndex = built.correctFacetIndex;
    shatteredFacetIndices = built.shatteredIndices;
  }

  const clueTiers: ClueTierTuple = [
    {
      tier: 1,
      title: 'COLD INSTINCT',
      multiplier: 3.0,
      sealed: true,
      clueText: null,
      glyphHint,
      glyphId,
      glyphUrl,
      glyphCategoryLabel,
      shatteredFacetIndices: [],
    },
    {
      tier: 2,
      title: 'THE CLUE CORE',
      multiplier: 2.0,
      sealed: false,
      clueText: lateralClue,
      glyphHint,
      glyphId,
      glyphUrl,
      glyphCategoryLabel,
      shatteredFacetIndices: [],
    },
    {
      tier: 3,
      title: 'THE BLUEPRINT CORE',
      multiplier: 1.2,
      sealed: false,
      clueText: pinpointClue,
      glyphHint,
      glyphId,
      glyphUrl,
      glyphCategoryLabel,
      shatteredFacetIndices,
    },
  ];

  const diff = scoreQuestionDifficulty(
    {
      ...raw,
      prompt: cleanPrompt,
      answerCorrect: cleanAnswerCorrect,
      archetype: arch,
    },
    { shardRowRank01: options.shardRowRank01 ?? raw.shardRowRank01 },
  );

  const defaultTimer =
    arch === 'GAUNTLET_SHATTER'
      ? Number(raw.gauntletExt?.windowSec ?? 10)
      : arch === 'GLOBE_PIN_DROP'
        ? Math.max(20, diff.timerSec)
        : diff.timerSec;

  const normalized: PrismQuestion = {
    qid: raw.qid,
    l0Domain: domId,
    domainMeta,
    l1Category,
    l2Subcategory,
    microTopicId: raw.microTopicId?.trim() || `q_${raw.qid}`,
    regions: Array.isArray(raw.regions) && raw.regions.length > 0 ? raw.regions : ['GLOBAL'],
    narrativeTags: (Array.isArray(raw.narrativeTags) ? raw.narrativeTags : []) as NarrativeTag[],
    tone: (raw.tone as ToneTag) || 'PRESTIGE',
    irtB: Number(raw.irtB ?? diff.calibratedIrtB),
    irtA: Number(raw.irtA ?? 1.25),
    difficultyTier: diff.difficultyTier,
    difficultyScore: diff.difficultyScore,
    difficultyLabel: diff.difficultyLabel,
    difficultyMultiplier: diff.scoreMultiplier,
    freshness: raw.freshness ?? 'EVERGREEN',
    sourceTier,
    archetype: arch,
    prompt: cleanPrompt,
    answerCorrect: cleanAnswerCorrect,
    clues: [lateralClue, pinpointClue],
    clueTiers,
    glyphHint,
    glyphId,
    glyphUrl,
    whyExplanation: sanitizeTriviaCopy(
      raw.whyExplanation?.trim() && !hasRoboticWhyExplanation(raw.whyExplanation)
        ? raw.whyExplanation.trim()
        : `${cleanAnswerCorrect} takes the spotlight in ${l1Category} (${domainMeta.name}).`,
    ),
    timerSec: options.timerSec ?? defaultTimer,
    facets,
    correctFacetIndex,
    heroRelicId: raw.heroRelicId as HeroRelicId | undefined,
  };

  if (arch === 'CODEX_DUAL_RING') {
    normalized.codex = buildCodexSpec(raw, salt);
  } else if (arch === 'CALIBRATOR_DIAL') {
    normalized.calibrator = buildCalibratorSpec(raw);
  } else if (arch === 'GAUNTLET_SHATTER') {
    normalized.gauntlet = buildGauntletSpec(raw, cleanPrompt);
  } else if (arch === 'GLOBE_PIN_DROP' && globePin) {
    normalized.globePin = globePin;
  }

  if (visualPlate) {
    normalized.visualPlate = visualPlate;
  }

  return normalized;
}

/**
 * Assembles a 3-step chained `HERO_ARTIFACT_SYNTHESIS` Boss Relic encounter for any of
 * the 8 Campaign hubs (`meridian_astrolabe` .. `master_ledger`).
 */
export function attachHeroSynthesisChain(
  leadQuestion: PrismQuestion,
  companionQuestions: ReadonlyArray<PrismQuestion>,
  hubCode = 'ch',
  meta?: { chainId?: string; chainTitle?: string; relicName?: string; relicId?: HeroRelicId },
): PrismQuestion {
  const stage = getCampaignStageSpec(hubCode);
  // Prefer explicit meta.relicId or stage.heroRelicId so hub Bosses never inherit another hub's relic (#190 P0)!
  const relicId: HeroRelicId = meta?.relicId ?? stage.heroRelicId ?? leadQuestion.heroRelicId;
  const stepQuestions = [
    leadQuestion,
    companionQuestions[0] ?? leadQuestion,
    companionQuestions[1] ?? companionQuestions[0] ?? leadQuestion,
  ];
  const latchTitles = ['PRIMARY SEAL', 'EQUATORIAL VERNIER', 'SOVEREIGN CORE LATCH'];

  // Guarantee leadQuestion itself also has >= 4 Sightline facets
  if (leadQuestion.facets.length < 4) {
    const rebuilt = buildSightlineFacets(
      {
        qid: leadQuestion.qid,
        l0Domain: leadQuestion.l0Domain,
        irtB: leadQuestion.irtB,
        archetype: 'HERO_ARTIFACT_SYNTHESIS',
        prompt: leadQuestion.prompt,
        answerCorrect: leadQuestion.answerCorrect,
      },
      4,
      leadQuestion.qid,
    );
    leadQuestion.facets = rebuilt.facets;
    leadQuestion.correctFacetIndex = rebuilt.correctFacetIndex;
  }

  leadQuestion.archetype = 'HERO_ARTIFACT_SYNTHESIS';
  leadQuestion.heroRelicId = relicId;
  leadQuestion.heroSynthesis = {
    chainId: meta?.chainId,
    chainTitle: meta?.chainTitle,
    relicId,
    relicName: meta?.relicName ?? stage.heroRelicTitle,
    hub: stage.hub,
    steps: [0, 1, 2].map((idx) => {
      const sq = stepQuestions[idx];
      let stepFacets = sq.facets;
      let stepCorrectIdx = sq.correctFacetIndex;
      if (stepFacets.length < 4) {
        const rebuilt = buildSightlineFacets(
          {
            qid: sq.qid,
            l0Domain: sq.l0Domain,
            irtB: sq.irtB,
            archetype: 'HERO_ARTIFACT_SYNTHESIS',
            prompt: sq.prompt,
            answerCorrect: sq.answerCorrect,
          },
          4,
          sq.qid + idx * 31,
        );
        stepFacets = rebuilt.facets;
        stepCorrectIdx = rebuilt.correctFacetIndex;
      }
      return {
        stepIndex: idx as 0 | 1 | 2,
        stepLabel: `STEP ${idx + 1} OF 3`,
        latchTitle: latchTitles[idx],
        qid: sq.qid,
        prompt: sq.prompt,
        answerCorrect: sq.answerCorrect,
        facets: stepFacets,
        correctFacetIndex: stepCorrectIdx,
        clueTiers: sq.clueTiers,
        glyphId: sq.glyphId,
        glyphUrl: sq.glyphUrl,
        whyExplanation: sq.whyExplanation,
      };
    }) as [
      import('./types').HeroSynthesisStep,
      import('./types').HeroSynthesisStep,
      import('./types').HeroSynthesisStep,
    ],
  };

  return leadQuestion;
}
