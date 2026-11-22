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

/**
 * Runtime prose hygiene check (per @qa-art-critic #118, @redteam-fun-ux-audio #190,
 * & @rt-copy-dates-auditor #249):
 *   1. Blocks quarantined Tier-1 items, junk distractors ("Unknown"), hypernym collisions,
 *      and broken shuffled letter-reference MCQ options ("A and B only", "Both C and D").
 *   2. Blocks self-answering stems & clues on SIGHTLINE_LOCK (l0Domain !== 11) where
 *      `answerCorrect` (or distinctive singular-stem tokens, e.g., "Tiger Stadium" -> "Tigers")
 *      leaks inside `prompt` or `clues`.
 */
export function isCleanShardCandidate(raw: RawQuestionRecord): boolean {
  if (QUARANTINED_TIER1_QIDS.has(raw.qid)) {
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
    out.prompt = sanitizeTriviaCopy(formatTemplate(sightPromptTpl, ctx));
    const cleanAns = sanitizeAnswerOrFacet(ans, out.prompt);
    out.answerCorrect = cleanAns;
    out.distractors = dists.map((d, idx) => ({
      text: sanitizeAnswerOrFacet(d, out.prompt),
      plausibility: Number((0.84 - idx * 0.06).toFixed(2)),
    }));
    let c1 = sanitizeTriviaCopy(formatTemplate(angle.clue1 ?? '', ctx));
    let c2 = sanitizeTriviaCopy(formatTemplate(angle.clue2 ?? '', ctx));
    if (spec.l0Domain !== 11 && cleanAns.trim().length >= 4) {
      const ansLow = cleanAns.trim().toLowerCase();
      if (c1.toLowerCase().includes(ansLow)) {
        c1 = `Category context: ${spec.l1Category}.`;
      }
      if (c2.toLowerCase().includes(ansLow)) {
        c2 = `The verified answer begins with "${ctx.ans_init}".`;
      }
    }
    out.clues = [c1, c2 || `The verified answer begins with "${ctx.ans_init}".`];
    out.whyExplanation = sanitizeTriviaCopy(formatTemplate(angle.why ?? '', ctx));
  } else if (arch === 'GAUNTLET_SHATTER') {
    const isTrue = (fnv1a32(`TF:${qid}`) & 1) === 0;
    if (isTrue) {
      const trueTpl = pickAngleTemplate(
        angle.truePromptVariants ?? angle.trueStemVariants,
        angle.truePrompt,
        qid,
      );
      out.prompt = sanitizeTriviaCopy(formatTemplate(trueTpl, ctx));
      out.answerCorrect = 'TRUE';
      out.whyExplanation = sanitizeTriviaCopy(formatTemplate(angle.whyTrue ?? '', ctx));
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
      out.prompt = sanitizeTriviaCopy(formatTemplate(falseTpl, ctx));
      out.answerCorrect = 'FALSE';
      out.whyExplanation = sanitizeTriviaCopy(formatTemplate(angle.whyFalse ?? '', ctx));
    }
    const c1 = sanitizeTriviaCopy(formatTemplate(angle.clue1 ?? '', ctx));
    out.clues = [
      c1,
      sanitizeTriviaCopy(
        `Cross-check the verified ${spec.l1Category.toLowerCase()} record for ${primarySubject}.`,
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
    out.prompt = sanitizeTriviaCopy(formatTemplate(calPromptTpl, ctx));
    const formattedExact = formatCleanTriviaNumber(bounds.exactVal, unit, out.prompt, exactColName);
    out.answerCorrect = sanitizeTriviaCopy(`${formattedExact}${unit ? ` ${unit}` : ''}`.trim());
    const c1 = sanitizeTriviaCopy(formatTemplate(angle.clue1 ?? '', ctx));
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
    out.whyExplanation = sanitizeTriviaCopy(formatTemplate(angle.why ?? '', ctx));
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
        `Align each ${spec.l1Category.toLowerCase()} entry on the upper ring with its verified match below.`,
      qid,
    );
    out.prompt = sanitizeTriviaCopy(formatTemplate(codexPromptTpl, ctx));
    out.answerCorrect = `3/3 ${spec.l1Category} Matches`;
    out.clues = [
      sanitizeTriviaCopy(
        formatTemplate(angle.clue1 ?? `${pairs[0].subject} aligns with ${pairs[0].target}.`, ctx),
      ),
      sanitizeTriviaCopy(
        formatTemplate(
          angle.clue2 ??
            `${pairs[1].subject} pairs with ${pairs[1].target}; "${decoyTarget}" is the decoy.`,
          ctx,
        ),
      ),
    ];
    out.whyExplanation = sanitizeTriviaCopy(
      formatTemplate(
        angle.why ??
          `Verified links: ${pairs[0].subject} = ${pairs[0].target}; ${pairs[1].subject} = ${pairs[1].target}; ${pairs[2].subject} = ${pairs[2].target}.`,
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
      `Align each ${catLabel.toLowerCase()} subject on the upper ring with its verified match below.`,
    ),
    answerCorrect: `3/3 ${catLabel} Matches`,
    clues: [
      sanitizeTriviaCopy(`${pairs[0].subject} locks directly to ${pairs[0].target}.`),
      sanitizeTriviaCopy(
        `${pairs[1].subject} pairs with ${pairs[1].target}; "${decoyTarget}" is the unaligned decoy.`,
      ),
    ],
    glyphHint: chosen.spec.glyphHint ?? getForgeDomainInfo(domainId).glyphShape,
    whyExplanation: sanitizeTriviaCopy(
      `Verified links: ${pairs[0].subject} -> ${pairs[0].target}; ${pairs[1].subject} -> ${pairs[1].target}; ${pairs[2].subject} -> ${pairs[2].target}.`,
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

const WORLD_CAPITAL_ANCHORS: ReadonlyArray<{ label: string; lat: number; lon: number }> = [
  { label: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { label: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { label: 'Cairo, Egypt', lat: 30.0444, lon: 31.2357 },
  { label: 'Rio de Janeiro, Brazil', lat: -22.9068, lon: -43.1729 },
  { label: 'New York, USA', lat: 40.7128, lon: -74.006 },
  { label: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
  { label: 'Reykjavik, Iceland', lat: 64.1466, lon: -21.9426 },
  { label: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { label: 'Nairobi, Kenya', lat: -1.2921, lon: 36.8219 },
  { label: 'Mexico City, Mexico', lat: 19.4326, lon: -99.1332 },
  { label: 'New Delhi, India', lat: 28.6139, lon: 77.209 },
  { label: 'Buenos Aires, Argentina', lat: -34.6037, lon: -58.3816 },
  { label: 'Paris, France', lat: 48.8566, lon: 2.3522 },
  { label: 'Athens, Greece', lat: 37.9838, lon: 23.7275 },
  { label: 'Cape Town, South Africa', lat: -33.9249, lon: 18.4241 },
  { label: 'Lima, Peru', lat: -12.0464, lon: -77.0428 },
  { label: 'Seoul, South Korea', lat: 37.5665, lon: 126.978 },
  { label: 'Toronto, Canada', lat: 43.6532, lon: -79.3832 },
  { label: 'Istanbul, Turkey', lat: 41.0082, lon: 28.9784 },
  { label: 'Wellington, New Zealand', lat: -41.2865, lon: 174.7762 },
  { label: 'Anchorage, Alaska', lat: 61.2181, lon: -149.9003 },
  { label: 'Honolulu, Hawaii', lat: 21.3069, lon: -157.8583 },
  { label: 'Rome, Italy', lat: 41.9028, lon: 12.4964 },
  { label: 'Geneva, Switzerland', lat: 46.2044, lon: 6.1432 },
];

function approxGreatCircleKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  const rng = new DeterministicRng(
    fnv1a32(`WS_GLOBE_ANCHORS:${raw.qid}:${shuffleSalt}:${targetLabel}`),
  );

  let anchors: Array<{ label: string; lat: number; lon: number }> = [];
  if (Array.isArray(ext?.quickAnchors) && ext.quickAnchors.length >= 4) {
    const seenLabels = new Set<string>();
    for (const a of ext.quickAnchors) {
      if (!a || !a.label) continue;
      const lbl = sanitizeTriviaCopy(String(a.label).trim());
      if (!lbl || seenLabels.has(lbl.toLowerCase())) continue;
      seenLabels.add(lbl.toLowerCase());
      anchors.push({
        label: lbl,
        lat: clamp(Number(a.lat), -89.9, 89.9),
        lon: clamp(Number(a.lon), -180, 180),
      });
      if (anchors.length >= 4) break;
    }
  }

  if (anchors.length < 4) {
    anchors = [{ label: targetLabel, lat: targetLat, lon: targetLon }];
    const targetLow = targetLabel.toLowerCase();
    const minDistFromTarget = Math.max(grazeKm + 400, 2600);
    const pool = [...WORLD_CAPITAL_ANCHORS];
    rng.shuffleInPlace(pool);

    for (const cand of pool) {
      if (anchors.length >= 4) break;
      const cLow = cand.label.toLowerCase();
      if (cLow === targetLow || cLow.includes(targetLow) || targetLow.includes(cLow)) continue;
      const dTarget = approxGreatCircleKm(targetLat, targetLon, cand.lat, cand.lon);
      if (dTarget < minDistFromTarget) continue;
      const tooCloseToExisting = anchors.some(
        (existing) => approxGreatCircleKm(existing.lat, existing.lon, cand.lat, cand.lon) < 1800,
      );
      if (tooCloseToExisting) continue;
      anchors.push({ ...cand });
    }
    // Safety fallback if target is unusual or spacing was tight
    for (const cand of pool) {
      if (anchors.length >= 4) break;
      if (anchors.some((existing) => existing.label.toLowerCase() === cand.label.toLowerCase())) {
        continue;
      }
      if (approxGreatCircleKm(targetLat, targetLon, cand.lat, cand.lon) > goldKm + 200) {
        anchors.push({ ...cand });
      }
    }
  }

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
    (raw.qid >= 1_060_000 && raw.qid < 1_090_000);

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
  const lateralClue =
    arch === 'GLOBE_PIN_DROP' && globePin
      ? globePin.regionHint
      : sanitizeTriviaCopy(
          rawClues[0]?.trim() ||
            `Category focus: ${raw.l1Category ?? domainMeta.name}.`,
        );
  const pinpointClue =
    arch === 'GLOBE_PIN_DROP' && globePin
      ? globePin.coordHint
      : sanitizeTriviaCopy(
          rawClues[1]?.trim() ||
            (arch === 'SIGHTLINE_LOCK' || arch === 'HERO_ARTIFACT_SYNTHESIS'
              ? `Half of the false facets have been eliminated—verify the ${domainMeta.shortName.toLowerCase()} link.`
              : lateralClue),
        );

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
      raw.whyExplanation?.trim() ||
        `Verified in The Meridian Ledger (${domainMeta.name} · ${l1Category}).`,
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
