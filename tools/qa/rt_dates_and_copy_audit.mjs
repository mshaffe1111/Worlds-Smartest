#!/usr/bin/env node
/**
 * RT-COPY-DATES-AUDITOR v3 — Parallel Exhaustive 100%-Corpus Date-Comma,
 * Typography, Self-Answering & Formatting Red-Team Audit across:
 *   - Live TypeScript `ShardDecoder` + `SovereignHUD` + `VeritasPrismRig` formatters
 *     (compiled fresh from `src/**` via esbuild)
 *   - ALL `public/data/**` JSON + `.gz` files (100% of QIDs, zero sampling,
 *     parallelized across worker_threads)
 *   - ALL `src/ui/**`, `src/meta/**`, `src/stage3d/**`, `src/forge/**`,
 *     `src/modes/**`, `src/narrative/**`, `src/cinema/**`, `src/characters/**`
 *
 * Usage:
 *   node tools/qa/rt_dates_and_copy_audit.mjs [--json-out <path>] [--src-only]
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { build as esbuild } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(ROOT, 'public/data');
const SHARDS_DIR = path.join(DATA_DIR, 'shards');

// ============================================================================
// 1. LIVE TYPESCRIPT MODULE LOADER (resolves node_modules from ROOT cleanly)
// ============================================================================
async function bundleTsToTempFile(relEntry, bundleAll = true) {
  const safeName = relEntry.replace(/[^a-z0-9]/gi, '_');
  const tmpFile = path.join(os.tmpdir(), `ws_rt_${safeName}_${process.pid}_${Date.now()}.mjs`);
  await esbuild({
    entryPoints: [path.join(ROOT, relEntry)],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    external: bundleAll ? [] : ['three', 'troika-three-text'],
    outfile: tmpFile,
    logLevel: 'silent',
  });
  return tmpFile;
}

// ============================================================================
// 2. HIGH-PRECISION DEFECT REGEXES & DETECTORS
// ============================================================================
const US_CA_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE',
]);

const AMBIGUOUS_STATE_WORDS = new Set([
  'IN', 'ME', 'OR', 'OH', 'OK', 'HI', 'ON', 'LA', 'DE', 'PA', 'MA', 'AL', 'CO', 'NO', 'ID', 'MS', 'MT', 'NE', 'UT', 'VA', 'WA',
]);

const ABBREV_BEFORE_PERIOD = new Set([
  'st', 'mt', 'ft', 'dr', 'mr', 'mrs', 'ms', 'jr', 'sr', 'no', 'vs', 'prof', 'rev', 'gen', 'col', 'capt', 'lt', 'sgt', 'gov', 'sen', 'rep', 'pres', 'hon', 'vol', 'ch', 'fig', 'ed', 'inc', 'corp', 'ltd', 'co', 'etc', 'est', 'ca', 'approx', 'dept', 'univ', 'assn', 'intl', 'natl', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec', 'bros', 'e.g', 'i.e', 'b', 'd', 'c', 'fl', 'r', 'p', 'pp', 'u', 'a', 'e', 'i', 'o', 'k', 'j', 'h', 'w', 'm', 'n', 's', 't', 'v', 'g', 'f', 'l', 'q', 'x', 'y', 'z',
]);

const NON_YEAR_AFTER_NUM = /^(?:,\d{3}|\+|\s*[–-]\s*[\d,]+\s*(?:km|kilometers?|miles?|meters?|metres?|m\b|ft|feet|hits?|rbis?|strikeouts?|thousand|million|billion|light-years|days?|years?)|\s+and\s+[\d,]+\s*(?:hits?|rbis?|strikeouts?|km|kilometers?|miles?|meters?|metres?|m\b|ft|feet|thousand|million|billion|light-years|days?|hr|hrs|home\s+runs?)|\s*(?:-(?:year|meter|metre|foot|mile|km|day|hour|lb|kg|ton|seat|bed|room|page|word|step|piece|plank|tile)|(?:years?\s+(?:old|ago|later|earlier|dormant|long|of)|year-old|km|kilometers?|m\b|meters?|metres?|miles?|mi\b|feet|ft\b|cm|mm|kg|lbs?|pounds?|tons?|tonnes?|°[cf]?|deg|kelvin|k\b|copies|planks?|tiles?|stars?|works?|songs?|albums?|films?|books?|pages?|games?|hits?|rbis?|strikeouts?|home\s+runs?|wins?|goals?|pts|points?|seats?|people|residents|inhabitants|soldiers|troops|species|trees|floodlights|dollars|usd|euros?|yen|thousand|million|billion|percent|%|nhl|nba|nfl|mlb|recordings|\/)))/i;

const RE_YEAR_COMMA_PREFIX = /\b(?:in|from|until|since|by|before|after|between|around|circa|c\.|born|died|founded|opened|closed|established|inducted|elected|signed|built|released|published|premiered|debuted|won|season|series|world\s+series|olympics|year|january|february|march|april|may|june|july|august|september|october|november|december|jan\.|feb\.|mar\.|apr\.|aug\.|sept?\.|oct\.|nov\.|dec\.|ad|bc|ce|bce)\s+([12]),(\d{3})\b/gi;
const RE_YEAR_COMMA_SUFFIX = /\b([12]),(\d{3})\s*(?:CE|BCE|AD|BC|season|World\s+Series|Olympics|treaty|rebellion|revolution|expedition|census|edition|Games|Cup|Draft|MVP|Cy\s+Young)\b/gi;
const RE_YEAR_COMMA_DECADE = /\b([12]),(\d{2}0)s\b/g;
const RE_YEAR_COMMA_PAREN = /\((?:(?:b\.|d\.|c\.|ca\.|fl\.|r\.|est\.|opened|founded|born|died)\s*)?([12]),(\d{3})(?:\s*[–-]\s*(?:[12],?\d{3})?)?\)/gi;
const RE_YEAR_COMMA_RANGE = /\b(?:([12]),(\d{3})\s*[–-]\s*([12]),?(\d{3})|([12]\d{3})\s*[–-]\s*([12]),(\d{3}))\b/g;
const RE_YEAR_PROMPT_CUE = /\b(what year|which year|in what year|when was|when did|born|died|founded|opened|inducted|established|debuted|world series|season|released in|published in|fought in|signed)\b/i;
const RE_YEAR_UNIT = /^(?:ce|bce|ad|bc|c\.e\.|b\.c\.e\.|a\.d\.|b\.c\.|year|yr)$/i;

const RE_MALFORMED_COMMA_NUM = /\b\d{4,},\d{3}\b/;
const RE_CITY_PERIOD_STATE = /\b([A-Z][a-zA-Z'-]{2,})\.\s+([A-Z]{2})(?=[?!,)\s]|$)/g;
const RE_DOUBLE_DOT_BAD = /(?<!\.|\d)\.\.(?!\.|\d)/;
const RE_BAD_DOT_Q = /\b([A-Za-z]{3,}|\d+)\.\?(?:\s|$)/;
const RE_BAD_PUNCT_SEQ = /\?\?|,,|,\.(?!\.)|:\?|;\?|\?\./;
const RE_BAD_DOUBLE_BANG = /(?<![)\w])!!/;
const RE_SPACE_BEFORE_PUNCT = /\s+[?!,;:]|\s+\.(?!\d|\.\.|[a-z]{2,4}\b)/;
const RE_HTML_ENTITY = /&(?:quot|amp|apos|lt|gt|nbsp|ndash|mdash|rsquo|lsquo|rdquo|ldquo|hellip|deg|times|divide|minus|plusmn);|&#\d+;|&#x[0-9a-f]+;/i;
const RE_LATEX_SUB_SUP = /[_^]\{[^}]+\}/;
const RE_CORRUPT_QMARK = /[A-Za-z]\?[A-Za-z0-9?]+|\s\?\s/;
const RE_UNRESOLVED_TPL = /(?<![_^A-Za-z])\{[a-zA-Z_][a-zA-Z0-9_]{1,}\}|\[\[(?![\s\d,-]+\])|\bundefined\b|\bNaN\b/;
const RE_DOUBLE_SPACE = / {2,}/;
const RE_DOUBLE_WORD = /(?<![\p{L}\p{N}_-])(the|in|of|is|to|at|for|on|with|from|by|was|were|are|a|an)\s+\1(?![\p{L}\p{N}_&])/giu;
const RE_LETTER_REF_OPTION = /^(?:both\s+)?[a-d]\s+and\s+[a-d](?:\s+only)?$/i;

const RE_A_VOWEL = /(?<![\p{L}\p{N}_'-])([Aa])\s+([AEIOUaeiou][a-zA-Z-]{2,})(?![\p{L}\p{N}_])/gu;
const RE_A_VOWEL_EXCEPT = /^(?:uni|use|usu|utens|util|uro|uran|uter|utah|ugand|ukrain|uruguay|eup|eur|euk|eul|euth|eugl|one|once|ouija|ufo|usa|usb|url|uber|utopi|ukulel|unanim|ubiquit|unicorn|uniform|union|uniqu|unit|univers|usurp|ewe|one-|u-|un-|iiird|and|or|are|is|in|on|at|of|as|if|up|out|off|into|over|under|after|about|against|along|among|around|across|also|already|always|away|either|else|equals|equal)/i;
const RE_LABEL_BEFORE_A = /(?:Group|Class|Tier|Grade|Type|Serie|List|Plan|Model|Vitamin|Option|Team|Zone|Phase|Part|Act|Section|Category|Division|League|Annex|Schedule|Appendix|Side|Form|Track|Band|Note|Key|Flat|Sharp|Major|Minor|Double|Triple|Single|Concert|Stock|Blood|Hepatitis|Studio|Block|Room|Suite|Seat|Box|Card|Test|Sample|Specimen|Solution|Compound|Drug|Protein|Gene|Enzyme|Channel|Wave|Ray|Title|Rule|Article|Clause|Exhibit|Item|Choice|Answer|Statement|Element|Variable|Parameter|Constant|Function|Object|Body|Mass|Charge|Particle|Atom|Ion|Let|Both|Between|From|Than|Versus|Vs\.?)\s+$/i;

const RE_AN_CONSONANT = /(?<![\p{L}\p{N}_'-])([Aa]n)\s+([BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz][a-zA-Z-]{2,})(?![\p{L}\p{N}_])/gu;
const RE_AN_CONSONANT_EXCEPT = /^(?:hour|honest|honor|honour|heir|heiress|herb|homage|hors|der|den|dem|das|die|des|mri|mlb|mls|mvp|mma|mba|mph|mtv|mit|mgm|ngo|nba|nfl|nhl|ncaa|npr|nsa|nwa|fbi|fda|fcc|fifa|fps|ftc|html|http|https|hbo|hiv|hpv|hdtv|sql|svg|sms|ssd|suv|snl|sec|swat|x-ray|xbox|xml|led|lcd|lsd|lga|lax|rpg|rpm|rna|rsa|rsvp|sos|nfc|nrl|nbl|nra|nypd|lapd|lpga|fha|faa|fema|fdr|jfk|lbj|mlk|hbc|hmv|hmo|hvac|mfa|mla|mpa|msc|mta|nasdaq|nato|noaa|norad|n-type|l-shape|s-curve|f-stop|h-bomb|m-theory|r-value|x-axis|x-chrom|s-wave|p-wave)/i;

const RE_CORRUPTED_TOTIENT_RANGE = /count of integers 1\.\d+ coprime to/i;
const RE_CORRUPTED_DOUBLE_FACTORIAL = /\(2n\)!\/\(2n\+1\)!/;
const RE_WINNER_DEBUT_LEAK = /\(winner debut \d{4}\)|\bML\s+(?:World Series|All-Star|MVP|Cy Young|Rookie|Gold Glove|Silver Slugger|Batting|Home Run|RBI|Pitching|Triple Crown)/i;

const LEAK_STOPWORDS = new Set([
  'the', 'of', 'and', 'in', 'to', 'for', 'on', 'at', 'by', 'with', 'from', 'as', 'an', 'or', 'la', 'le', 'de', 'el', 'al', 'von', 'van',
  'city', 'river', 'lake', 'mount', 'sea', 'ocean', 'island', 'islands', 'park', 'national', 'state', 'states', 'united',
  'university', 'college', 'institute', 'school', 'academy', 'empire', 'kingdom', 'republic', 'federation', 'union',
  'war', 'battle', 'treaty', 'act', 'law', 'theory', 'effect', 'constant', 'number', 'system', 'order', 'house',
  'world', 'new', 'old', 'north', 'south', 'east', 'west', 'central', 'upper', 'lower', 'great', 'grand', 'saint', 'san', 'santa',
  'king', 'queen', 'prince', 'princess', 'emperor', 'general', 'president', 'prime', 'minister', 'doctor', 'sir', 'lord', 'lady',
  'club', 'team', 'fc', 'sc', 'ac', 'bc', 'cf', 'sport', 'sports', 'league', 'cup', 'open', 'championship', 'series', 'games',
  'museum', 'palace', 'castle', 'cathedral', 'church', 'temple', 'bridge', 'tower', 'square', 'street', 'avenue', 'station', 'airport',
  'company', 'corporation', 'group', 'bank', 'press', 'books', 'music', 'records', 'films', 'pictures', 'studios', 'network',
  'first', 'second', 'third', 'fourth', 'fifth', 'black', 'white', 'red', 'blue', 'green', 'gold', 'golden', 'silver', 'royal',
  'american', 'british', 'english', 'french', 'german', 'italian', 'spanish', 'russian', 'chinese', 'japanese', 'indian', 'canadian', 'australian',
  'county', 'province', 'region', 'district', 'peninsula', 'bay', 'gulf', 'strait', 'cape', 'valley', 'desert', 'forest',
  'part', 'book', 'song', 'film', 'movie', 'play', 'poem', 'novel', 'story', 'tale', 'chronicle', 'history', 'life', 'time', 'times',
  'international', 'global', 'modern', 'ancient', 'classic', 'classical', 'major', 'minor', 'super', 'ultra', 'mega', 'mini',
  'stadium', 'arena', 'field', 'ballpark', 'gardens', 'garden', 'center', 'centre', 'coliseum', 'dome', 'bowl', 'ground', 'grounds',
]);

class AuditReport {
  constructor() {
    this.counts = Object.create(null);
    this.bySource = Object.create(null);
    this.byShardType = Object.create(null);
    this.samples = Object.create(null);
    this.maxSamples = 25;
  }

  add(kind, detail) {
    this.counts[kind] = (this.counts[kind] ?? 0) + 1;
    const src = detail.source ?? 'unknown';
    this.bySource[kind] ??= Object.create(null);
    this.bySource[kind][src] = (this.bySource[kind][src] ?? 0) + 1;
    if (detail.shardType) {
      const k2 = `${detail.shardType}:${detail.angleId ?? ''}`;
      this.byShardType[kind] ??= Object.create(null);
      this.byShardType[kind][k2] = (this.byShardType[kind][k2] ?? 0) + 1;
    }
    this.samples[kind] ??= [];
    if (this.samples[kind].length < this.maxSamples) {
      this.samples[kind].push(detail);
    }
  }

  mergeFrom(other) {
    for (const [k, v] of Object.entries(other.counts)) {
      this.counts[k] = (this.counts[k] ?? 0) + v;
    }
    for (const [k, map] of Object.entries(other.bySource)) {
      this.bySource[k] ??= Object.create(null);
      for (const [s, c] of Object.entries(map)) {
        this.bySource[k][s] = (this.bySource[k][s] ?? 0) + c;
      }
    }
    for (const [k, map] of Object.entries(other.byShardType)) {
      this.byShardType[k] ??= Object.create(null);
      for (const [s, c] of Object.entries(map)) {
        this.byShardType[k][s] = (this.byShardType[k][s] ?? 0) + c;
      }
    }
    for (const [k, list] of Object.entries(other.samples)) {
      this.samples[k] ??= [];
      for (const item of list) {
        if (this.samples[k].length < this.maxSamples) this.samples[k].push(item);
      }
    }
  }
}

function checkTextCopy(report, text, meta, isYearContext = false) {
  if (typeof text !== 'string' || !text) return;

  // Fast ASCII pre-checks to keep 1.3M-QID loop blazingly fast!
  const hasComma = text.includes(',');
  const hasDot = text.includes('.');
  const hasAmp = text.includes('&');
  const hasBrace = text.includes('{') || text.includes('[');
  const hasQ = text.includes('?');

  if (hasComma) {
    let foundYearComma = false;
    // Skip non-year math/estimate pinpoint bands (`Pinpoint band: between 1,000 and 1,800.` when not a year question!)
    const isNonYearPinpointBand = !isYearContext && /^Pinpoint band: between /i.test(text);
    if (!isNonYearPinpointBand) {
      for (const re of [RE_YEAR_COMMA_PREFIX, RE_YEAR_COMMA_SUFFIX, RE_YEAR_COMMA_DECADE, RE_YEAR_COMMA_PAREN, RE_YEAR_COMMA_RANGE]) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(text)) !== null) {
          const yr = Number((m[1] ?? m[5] ?? '0') + (m[2] ?? m[6] ?? '000'));
          if (yr < 1000 || yr > 2099) continue;
          const after = text.slice(m.index + m[0].length);
          if (NON_YEAR_AFTER_NUM.test(after)) continue;
          foundYearComma = true;
          report.add('DATE_YEAR_COMMA', { ...meta, match: m[0], snippet: text.slice(Math.max(0, m.index - 20), m.index + 65) });
          break;
        }
        if (foundYearComma) break;
      }
    }
    if (!foundYearComma && isYearContext && (meta.field === 'answerCorrect' || meta.field?.startsWith('facet') || meta.field?.startsWith('codex.t') || meta.field?.startsWith('cone.'))) {
      const m = /\b([12]),(\d{3})\b/.exec(text);
      if (m) {
        const yr = Number(m[1] + m[2]);
        const after = text.slice(m.index + m[0].length);
        if (yr >= 1000 && yr <= 2099 && !NON_YEAR_AFTER_NUM.test(after)) {
          report.add('DATE_YEAR_COMMA', { ...meta, match: m[0], snippet: text.slice(0, 140) });
        }
      }
    }
    if (RE_MALFORMED_COMMA_NUM.test(text)) {
      const m = RE_MALFORMED_COMMA_NUM.exec(text);
      report.add('MALFORMED_COMMA_NUMBER', { ...meta, match: m[0], snippet: text.slice(0, 140) });
    }
  }

  if (hasDot) {
    RE_CITY_PERIOD_STATE.lastIndex = 0;
    let cm;
    while ((cm = RE_CITY_PERIOD_STATE.exec(text)) !== null) {
      const cityWord = cm[1];
      const stCode = cm[2];
      if (!US_CA_STATE_CODES.has(stCode)) continue;
      if (ABBREV_BEFORE_PERIOD.has(cityWord.toLowerCase())) continue;
      const afterChar = text[cm.index + cm[0].length] ?? '';
      if (AMBIGUOUS_STATE_WORDS.has(stCode) && !/[?!,)]|$/.test(afterChar)) continue;
      report.add('CITY_PERIOD_STATE', { ...meta, match: cm[0], snippet: text.slice(Math.max(0, cm.index - 20), cm.index + 40) });
      break;
    }
    if (RE_CORRUPTED_TOTIENT_RANGE.test(text)) {
      report.add('MATH_FORMULA_CORRUPTED', { ...meta, snippet: text.slice(0, 140) });
    }
    if (RE_DOUBLE_DOT_BAD.test(text) && !/(?:Mm\.\. Food|Dil Se\.\.|Hain Koun\.\.!)/.test(text)) {
      report.add('DOUBLE_PUNCTUATION', { ...meta, sub: '..', snippet: text.slice(0, 140) });
    } else if (hasQ && RE_BAD_DOT_Q.test(text)) {
      const m = RE_BAD_DOT_Q.exec(text);
      const word = m[1].toLowerCase();
      if (!ABBREV_BEFORE_PERIOD.has(word) && !/^(inc|corp|ltd|jr|sr|etc|phd|mph|rpm|est|vol|nos|dept|univ|assoc|bros|co|ave|blvd|rd|ln|ct|pl|sq|bldg|ste|apt|fl|ft|mt|st|dr|prof|rev|hon|gov|sen|rep|gen|col|maj|capt|lt|sgt|cpl|pvt|adm|cmdr|ens)$/.test(word)) {
        report.add('DOUBLE_PUNCTUATION', { ...meta, sub: '.?', match: m[0], snippet: text.slice(0, 140) });
      }
    }
  }

  if (text.includes('!')) {
    if (RE_CORRUPTED_DOUBLE_FACTORIAL.test(text)) {
      report.add('MATH_FORMULA_CORRUPTED', { ...meta, snippet: text.slice(0, 140) });
    }
    if (RE_BAD_DOUBLE_BANG.test(text)) {
      report.add('DOUBLE_PUNCTUATION', { ...meta, sub: '!!', snippet: text.slice(0, 140) });
    }
  }

  if (RE_BAD_PUNCT_SEQ.test(text)) {
    report.add('DOUBLE_PUNCTUATION', { ...meta, sub: RE_BAD_PUNCT_SEQ.exec(text)[0], snippet: text.slice(0, 140) });
  }

  if (RE_SPACE_BEFORE_PUNCT.test(text)) {
    const m = RE_SPACE_BEFORE_PUNCT.exec(text);
    const isPublishedTitlePunct =
      /\. \. \. That Thou Art|Human\. :II: Nature\.|:wumpscut:/.test(text);
    if (!isPublishedTitlePunct && !(meta.l0Domain === 11 && /[.:]/.test(m[0]))) {
      report.add('SPACE_BEFORE_PUNCT', { ...meta, match: JSON.stringify(m[0]), snippet: text.slice(0, 140) });
    }
  }

  if (text.includes('(') || text.includes('ML ')) {
    if (RE_WINNER_DEBUT_LEAK.test(text)) {
      report.add('BASEBALL_AWARD_FORMAT_BUG', { ...meta, match: RE_WINNER_DEBUT_LEAK.exec(text)[0], snippet: text.slice(0, 140) });
    }
  }
  if (hasAmp && RE_HTML_ENTITY.test(text)) {
    report.add('HTML_ENTITY', { ...meta, match: RE_HTML_ENTITY.exec(text)[0], snippet: text.slice(0, 140) });
  }
  if (hasBrace) {
    if (RE_LATEX_SUB_SUP.test(text)) {
      report.add('RAW_LATEX_SUBSCRIPT', { ...meta, match: RE_LATEX_SUB_SUP.exec(text)[0], snippet: text.slice(0, 140) });
    }
    if (RE_UNRESOLVED_TPL.test(text) && !meta.isTemplateDoc) {
      report.add('UNRESOLVED_TEMPLATE', { ...meta, match: RE_UNRESOLVED_TPL.exec(text)[0], snippet: text.slice(0, 140) });
    }
  }
  if (hasQ && RE_CORRUPT_QMARK.test(text)) {
    report.add('CORRUPT_UTF8_QMARK', { ...meta, match: RE_CORRUPT_QMARK.exec(text)[0], snippet: text.slice(0, 140) });
  }
  if (text.includes('  ') && RE_DOUBLE_SPACE.test(text)) {
    report.add('DOUBLE_SPACE', { ...meta, snippet: text.slice(0, 140) });
  }

  RE_DOUBLE_WORD.lastIndex = 0;
  let dw;
  while ((dw = RE_DOUBLE_WORD.exec(text)) !== null) {
    const rawPair = dw[0];
    if (/^(?:in In|on On|for For|of Of|to To|from From|at At|by By|with With|the The|IS is|for FOR|Is Is|The The)$/.test(rawPair)) {
      if (rawPair === 'the The' && !/the The The\b/.test(text) && !/band|album|song/i.test(text)) {
        report.add('DOUBLE_WORD', { ...meta, match: rawPair, snippet: text.slice(Math.max(0, dw.index - 20), dw.index + 50) });
        break;
      }
      continue;
    }
    if (/throw-?in in soccer|back in in soccer|The The|\"Is Is\"|\bIs Is\b/i.test(text)) continue;
    report.add('DOUBLE_WORD', { ...meta, match: rawPair, snippet: text.slice(Math.max(0, dw.index - 20), dw.index + 50) });
    break;
  }

  RE_A_VOWEL.lastIndex = 0;
  let am;
  while ((am = RE_A_VOWEL.exec(text)) !== null) {
    const word = am[2];
    if (RE_A_VOWEL_EXCEPT.test(word) || /^U[A-Z]{1,}$/.test(word)) continue;
    if (/A esmorga/.test(text)) continue;
    const before = text.slice(Math.max(0, am.index - 18), am.index);
    if (RE_LABEL_BEFORE_A.test(before)) continue;
    if (am[1] === 'A' && /^[A-Z]/.test(word) && am.index > 0 && !/[.?!:\n"“]\s*$/.test(text.slice(0, am.index))) continue;
    report.add('ARTICLE_A_VOWEL', { ...meta, match: am[0], snippet: text.slice(Math.max(0, am.index - 25), am.index + 50) });
    break;
  }

  RE_AN_CONSONANT.lastIndex = 0;
  while ((am = RE_AN_CONSONANT.exec(text)) !== null) {
    const word = am[2];
    if (RE_AN_CONSONANT_EXCEPT.test(word)) continue;
    if (/^[FHLMNRSX][A-Z0-9-]{1,}$/.test(word)) continue;
    if (/^[A-Z]/.test(word) && !/^(?:Russian|French|German|Spanish|Italian|British|Japanese|Chinese|Korean|Polish|Dutch|Greek|Swiss|Swedish|Norwegian|Danish|Finnish|Czech|Turkish|Persian|Roman|Latin|Catholic|Christian|Jewish|Muslim|Buddhist|Hindu|Nordic|Celtic|Slavic|Baltic|Balkan|Pacific|Caribbean|Brazilian|Mexican|Canadian)$/.test(word)) {
      continue;
    }
    report.add('ARTICLE_AN_CONSONANT', { ...meta, match: am[0], snippet: text.slice(Math.max(0, am.index - 25), am.index + 50) });
    break;
  }
}

function singularStem(tok) {
  if (tok.length > 5 && tok.endsWith('ies')) return tok.slice(0, -3) + 'y';
  if (tok.length > 5 && tok.endsWith('es')) return tok.slice(0, -2);
  if (tok.length > 4 && tok.endsWith('s') && !tok.endsWith('ss')) return tok.slice(0, -1);
  return tok;
}

function hasWordStem(hayLow, stem) {
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

function checkQuestionLeaksAndSelfAnswering(report, raw, norm, sourceLabel, liveIsClean) {
  if (norm.archetype !== 'SIGHTLINE_LOCK' && norm.archetype !== 'HERO_ARTIFACT_SYNTHESIS') return;

  if (Array.isArray(norm.facets)) {
    for (const f of norm.facets) {
      if (RE_LETTER_REF_OPTION.test(String(f.text ?? '').trim())) {
        report.add('BROKEN_LETTER_REF_OPTION', {
          source: sourceLabel,
          qid: norm.qid,
          option: f.text,
          prompt: norm.prompt.slice(0, 100),
          playableAtRuntime: liveIsClean ? liveIsClean(raw) : true,
        });
        break;
      }
    }
  }

  if (norm.l0Domain === 11) return;
  const playable = liveIsClean ? liveIsClean(raw) : true;
  if (!playable) return;

  const prompt = String(norm.prompt ?? '').trim();
  const ans = String(norm.answerCorrect ?? '').trim();
  if (!prompt || !ans) {
    report.add('EMPTY_PROMPT_OR_ANSWER', { source: sourceLabel, qid: norm.qid, shardType: raw.shardType, angleId: raw.angleId });
    return;
  }

  const promptLow = prompt.toLowerCase();
  const ansLow = ans.toLowerCase();
  const meta = { source: sourceLabel, qid: norm.qid, shardType: raw.shardType, angleId: raw.angleId, ans, prompt: prompt.slice(0, 130) };

  if (ansLow.length >= 4 && promptLow.includes(ansLow)) {
    report.add('STEM_EXACT_ANSWER_LEAK_LIVE', meta);
    return;
  }
  const strippedCore = ansLow.replace(/^(?:the|a|an|republic of|kingdom of|state of|city of)\s+/i, '').trim();
  if (strippedCore.length >= 5 && promptLow.includes(strippedCore)) {
    if (hasWordStem(promptLow, strippedCore) && norm.qid !== 16) {
      report.add('STEM_CORE_ANSWER_LEAK_LIVE', meta);
      return;
    }
  }

  const ansTokens = strippedCore.split(/[^a-z0-9]+/).filter((t) => t.length >= 4 && !LEAK_STOPWORDS.has(t));
  if (ansTokens.length >= 2) {
    const allInStem = ansTokens.every((t) => hasWordStem(promptLow, singularStem(t)));
    const distTexts = (norm.facets ?? []).filter((f) => !f.isCorrect).map((f) => f.text.toLowerCase());
    const distAlsoAllInStem = distTexts.some((dt) => {
      const dts = dt.split(/[^a-z0-9]+/).filter((t) => t.length >= 4 && !LEAK_STOPWORDS.has(t));
      return dts.length >= 2 && dts.every((t) => hasWordStem(promptLow, singularStem(t)));
    });
    if (allInStem && !distAlsoAllInStem) {
      report.add('SELF_ANSWERING_ALL_TOKENS_LIVE', { ...meta, tokens: ansTokens });
      return;
    }
  }

  // Flag subcategory ballpark/exo/aero city/mascot/host/maker giveaways specifically!
  if (raw.shardType === 'sub_bb_ballpark' || raw.shardType === 'sub_sci_exo_deep' || raw.shardType === 'sub_tech_aero_year') {
    const distTexts = (norm.facets ?? []).filter((f) => !f.isCorrect).map((f) => f.text.toLowerCase());
    if (ansTokens.length >= 1 && distTexts.length >= 2) {
      for (const tok of ansTokens) {
        if (tok.length < 4) continue;
        const stem = singularStem(tok);
        if (hasWordStem(promptLow, stem) && !distTexts.some((dt) => hasWordStem(dt, stem))) {
          report.add('SUBCAT_SELF_ANSWERING_GIVEAWAY_LIVE', { ...meta, leakedToken: tok, distractors: distTexts.slice(0, 3) });
          break;
        }
      }
    }
  }

  if (Array.isArray(norm.clues)) {
    for (let ci = 0; ci < norm.clues.length; ci++) {
      const cl = String(norm.clues[ci] ?? '');
      if (ansLow.length >= 4 && cl.toLowerCase().includes(ansLow)) {
        report.add('CLUE_EXACT_ANSWER_LEAK_LIVE', { ...meta, clueIdx: ci, clue: cl.slice(0, 120) });
        break;
      }
    }
  }

  const allOpts = (norm.facets ?? []).map((f) => f.text.trim().toLowerCase());
  if (new Set(allOpts).size < allOpts.length) {
    report.add('DUPLICATE_OPTIONS_LIVE', { ...meta, options: allOpts });
  }
  for (const o of allOpts) {
    if (!o || o === 'unknown' || o === 'n/a' || o === 'none') {
      report.add('JUNK_DISTRACTOR_LIVE', { ...meta, badOption: o });
      break;
    }
  }
}

function auditNormalizedQuestion(report, raw, norm, sourceLabel, liveIsClean) {
  const isYearQ =
    RE_YEAR_PROMPT_CUE.test(norm.prompt ?? '') ||
    RE_YEAR_UNIT.test(String(norm.calibrator?.unit ?? ''));

  const baseMeta = {
    source: sourceLabel,
    qid: norm.qid,
    shardType: raw.shardType,
    angleId: raw.angleId,
    l0Domain: norm.l0Domain,
  };

  checkTextCopy(report, norm.prompt, { ...baseMeta, field: 'prompt' }, isYearQ);
  checkTextCopy(report, norm.answerCorrect, { ...baseMeta, field: 'answerCorrect' }, isYearQ);
  if (Array.isArray(norm.clues)) {
    for (let i = 0; i < norm.clues.length; i++) {
      checkTextCopy(report, norm.clues[i], { ...baseMeta, field: `clue${i + 1}` }, isYearQ);
    }
  }
  if (norm.whyExplanation) {
    checkTextCopy(report, norm.whyExplanation, { ...baseMeta, field: 'why' }, isYearQ);
  }
  if (Array.isArray(norm.facets)) {
    for (let i = 0; i < norm.facets.length; i++) {
      checkTextCopy(report, norm.facets[i].text, { ...baseMeta, field: `facet[${i}]` }, isYearQ);
    }
  }
  if (norm.codex) {
    for (let i = 0; i < norm.codex.pairs.length; i++) {
      checkTextCopy(report, norm.codex.pairs[i].subject, { ...baseMeta, field: `codex.s${i}` }, false);
      checkTextCopy(report, norm.codex.pairs[i].target, { ...baseMeta, field: `codex.t${i}` }, isYearQ);
    }
    checkTextCopy(report, norm.codex.decoyTarget, { ...baseMeta, field: 'codex.decoy' }, isYearQ);
  }
  if (norm.calibrator) {
    for (const cone of norm.calibrator.toleranceCones) {
      checkTextCopy(report, cone.label, { ...baseMeta, field: `cone.${cone.id}` }, isYearQ);
    }
  }

  checkQuestionLeaksAndSelfAnswering(report, raw, norm, sourceLabel, liveIsClean);
}

// ============================================================================
// WORKER THREAD EXECUTION (decodes & audits assigned shard files in parallel)
// ============================================================================
if (!isMainThread) {
  (async () => {
    const { forgeBundlePath, files, doCodexDomains } = workerData;
    const forgeMod = await import(pathToFileURL(forgeBundlePath).href);
    const {
      decodeShardRawQuestion,
      normalizeToPrismQuestion,
      synthesizeShardCodexQuestion,
      isCleanShardCandidate,
      CODEX_SYNTHESIS_PER_DOMAIN,
    } = forgeMod;

    const manifest = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, 'shard_manifest.json'), 'utf8'));
    const taxTree = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, 'taxonomy_tree.json'), 'utf8'));
    const mergedManifest = { ...manifest, types: { ...(manifest.types ?? {}), ...(taxTree.types ?? {}) } };

    const report = new AuditReport();
    const fileStats = [];
    let calTotal = 0;
    let calYearTotal = 0;
    const chunksByDomain = new Map();

    for (const fileName of files) {
      const ft0 = Date.now();
      const chunk = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, fileName), 'utf8'));
      let count = 0;
      for (let ti = 0; ti < chunk.t.length; ti++) {
        const tbl = chunk.t[ti];
        const spec = chunk.types?.[tbl.type] ?? mergedManifest.types[tbl.type];
        if (!spec) {
          report.add('MISSING_SHARD_SPEC', { source: fileName, shardType: tbl.type });
          continue;
        }
        for (let ri = 0; ri < tbl.r.length; ri++) {
          for (let ai = 0; ai < spec.angles.length; ai++) {
            const raw = decodeShardRawQuestion(mergedManifest, chunk, ti, ri, ai, 3);
            if (!raw) continue;
            const norm = normalizeToPrismQuestion(raw);
            count++;
            if (norm.calibrator) {
              calTotal++;
              if (RE_YEAR_UNIT.test(norm.calibrator.unit) || RE_YEAR_PROMPT_CUE.test(norm.prompt)) calYearTotal++;
            }
            auditNormalizedQuestion(report, raw, norm, fileName, isCleanShardCandidate);
          }
        }
      }
      if (/^domain_\d+(_\d+)?\.json$/.test(fileName)) {
        const d = Number(chunk.d);
        if (!chunksByDomain.has(d)) chunksByDomain.set(d, []);
        chunksByDomain.get(d).push(chunk);
      }
      fileStats.push({ fileName, count, sec: Number(((Date.now() - ft0) / 1000).toFixed(1)) });
    }

    let codexCount = 0;
    for (const d of doCodexDomains ?? []) {
      const dChunks = chunksByDomain.get(d) ?? [];
      for (let slot = 0; slot < CODEX_SYNTHESIS_PER_DOMAIN; slot++) {
        const raw = synthesizeShardCodexQuestion(mergedManifest, dChunks, d, slot, 0.4);
        if (!raw) continue;
        const norm = normalizeToPrismQuestion(raw);
        codexCount++;
        auditNormalizedQuestion(report, raw, norm, `codex_synth_d${d}`, isCleanShardCandidate);
      }
    }

    parentPort.postMessage({
      fileStats,
      codexCount,
      calTotal,
      calYearTotal,
      report: {
        counts: report.counts,
        bySource: report.bySource,
        byShardType: report.byShardType,
        samples: report.samples,
      },
    });
  })().catch((err) => {
    parentPort.postMessage({ error: String(err?.stack || err) });
  });
}

// ============================================================================
// MAIN THREAD
// ============================================================================
function walkJsonStrings(report, node, sourceLabel, jsonPath = '$') {
  if (typeof node === 'string') {
    if (/^(?:https?:\/\/|\.?\/?assets\/|res:\/\/|#[0-9a-f]{3,8}$|[a-z0-9_:-]+$)/i.test(node.trim())) return;
    const isTemplateDoc = jsonPath.includes('share_card_format');
    checkTextCopy(report, node, { source: sourceLabel, path: jsonPath, isTemplateDoc }, false);
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) walkJsonStrings(report, node[i], sourceLabel, `${jsonPath}[${i}]`);
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (/^(?:id|slug|url|path|voiceUrl|audioUrl|portrait|image|glyph|icon|key|code|schema|hash|color|hex|asset)/i.test(k)) continue;
      walkJsonStrings(report, v, sourceLabel, `${jsonPath}.${k}`);
    }
  }
}

function listTsFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listTsFiles(full));
    else if (ent.name.endsWith('.ts') && !ent.name.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

async function auditSourceAndFormatters(report, forgeMod) {
  const dirs = ['src/ui', 'src/meta', 'src/stage3d', 'src/forge', 'src/modes', 'src/narrative', 'src/cinema', 'src/characters'];
  const unsafeToLocale = [];

  for (const relDir of dirs) {
    for (const file of listTsFiles(path.join(ROOT, relDir))) {
      const relFile = path.relative(ROOT, file).replace(/\\/g, '/');
      const src = fs.readFileSync(file, 'utf8');
      const lines = src.split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

        if (/\.toLocaleString\s*\(|Intl\.NumberFormat/.test(line)) {
          const ctx = lines.slice(Math.max(0, i - 35), Math.min(lines.length, i + 3)).join('\n');
          const insideSafeHelper =
            /(?:export )?function (?:formatCleanTriviaNumber|formatHudValue|formatCalibratorMargin|formatCalibratorDialNumber|formatCount|fmtCount|formatQuestionCount)/.test(ctx);
          const isSafeScoreOrCount =
            /(?:PTS|playerScore|rivalScore|earnedPoints|pointsDelta|pointsEarned|bankedSafeScore|unbankedFloorHaul|bestScore|dailyBestScore|endlessBestScore|cupPoints|verifiedQuestionTotal|verifiedUniqueTotal|totalPlayableCount|verifiedCount|Qs\b|Verified|item\.current|item\.target|playerBonusPoints|scoreFormatted|pScoreStr|rScoreStr|new Date\([^)]+\)\.toLocaleString|OUTSCORED BY|vs \$\{)/.test(line);

          if (!insideSafeHelper && !isSafeScoreOrCount) {
            unsafeToLocale.push({ file: relFile, line: i + 1, code: trimmed });
            report.add('SRC_UNSAFE_TOLOCALE', { source: relFile, line: i + 1, code: trimmed });
          }
        }
      }
    }
  }

  const formatterResults = { forge: [], hud: [], stage3d: [] };

  // 1. Forge (`ShardDecoder.ts`)
  const { formatCleanTriviaNumber, sanitizeTriviaCopy } = forgeMod;
  const forgeNumCases = [
    { val: 1864, unit: 'CE', prompt: 'In what year was the First Geneva Convention signed?', expect: '1864' },
    { val: 1984, unit: '', prompt: 'In what year was it founded?', expect: '1984' },
    { val: 1903, unit: 'year', prompt: 'First World Series', expect: '1903' },
    { val: 1969, unit: 'CE', prompt: 'Apollo 11', expect: '1969' },
    { val: 44, unit: 'BCE', prompt: 'Caesar', expect: '44' },
    { val: 2026, unit: 'CE', prompt: 'Year', expect: '2026' },
    { val: 3000, unit: 'hits', prompt: 'How many career hits?', expect: '3,000' },
    { val: 1500, unit: 'light-years', prompt: 'Distance to exoplanet', expect: '1,500' },
    { val: 8849, unit: 'm', prompt: 'Elevation of Mount Everest', expect: '8,849' },
  ];
  for (const c of forgeNumCases) {
    const got = formatCleanTriviaNumber(c.val, c.unit, c.prompt);
    const ok = got === c.expect;
    formatterResults.forge.push({ ...c, got, ok });
    if (!ok) report.add('SRC_FORMATTER_MISMATCH', { source: 'src/forge/ShardDecoder.ts', ...c, got });
  }
  const copyCases = [
    { in: 'Which MLB club played home games at Tiger Stadium in Detroit. MI?', expect: 'Which MLB club played home games at Tiger Stadium in Detroit, MI?' },
    { in: 'Founded in 1,864 CE in Geneva.', expect: 'Founded in 1864 CE in Geneva.' },
    { in: 'First World Series (1,903) winner?', expect: 'First World Series (1903) winner?' },
    { in: 'Won 3,000 hits in 1,984.', expect: 'Won 3,000 hits in 1984.' },
    { in: 'Who wrote &quot;Hamlet&quot; ?', expect: 'Who wrote "Hamlet"?' },
    { in: "What is Euler's totient phi(6) (count of integers 1..6 coprime to 6)?", expect: "What is Euler's totient phi(6) (count of integers 1..6 coprime to 6)?" },
    { in: 'What is the limit of (2n)!!/(2n+1)!! as n goes to infinity?', expect: 'What is the limit of (2n)!!/(2n+1)!! as n goes to infinity?' },
    { in: 'In which U.S. state is the city of Los Angeles (pop. ~3821,000) located?', expect: 'In which U.S. state is the city of Los Angeles (pop. ~3,821,000) located?' },
    { in: 'In what year did Derek Jeter earn the MLB milestone: ML World Series MVP (winner debut 1995) (2000)?', expect: 'In what year did Derek Jeter earn the MLB milestone: MLB World Series MVP (2000)?' },
  ];
  for (const c of copyCases) {
    const got = sanitizeTriviaCopy(c.in);
    const ok = got === c.expect;
    formatterResults.forge.push({ fn: 'sanitizeTriviaCopy', ...c, got, ok });
    if (!ok) report.add('SRC_SANITIZER_MISMATCH', { source: 'src/forge/ShardDecoder.ts', in: c.in, expect: c.expect, got });
  }

  let hudFormat = null;
  let stage3dFormat = null;

  // 2. HUD (`SovereignHUD.ts`)
  const hudBundle = await bundleTsToTempFile('src/ui/SovereignHUD.ts', true);
  try {
    const hudMod = await import(pathToFileURL(hudBundle).href);
    hudFormat = hudMod.formatHudValue;
    const hudCases = [
      { val: 1864, unit: 'CE', prompt: 'In what year was the First Geneva Convention signed?', expect: '1864' },
      { val: 1780, unit: 'CE', prompt: 'In what year was the First Geneva Convention signed?', expect: '1780' },
      { val: 1960, unit: 'CE', prompt: 'In what year was the First Geneva Convention signed?', expect: '1960' },
      { val: 1984, unit: '', prompt: 'In what year was it founded?', expect: '1984' },
      { val: 1500, unit: 'light-years', prompt: 'Approximately how many light-years from Earth?', expect: '1,500' },
      { val: 1500, unit: 'Earth years', prompt: 'Orbital period in Earth years', expect: '1,500' },
      { val: 1800, unit: 'seats', prompt: 'Opened in 1912, how many seats did it have?', expect: '1,800' },
      { val: 5714, unit: 'strikeouts', prompt: 'Career strikeouts', expect: '5,714' },
    ];
    for (const c of hudCases) {
      const got = hudMod.formatHudValue(c.val, c.unit, c.prompt);
      const ok = got === c.expect;
      formatterResults.hud.push({ ...c, got, ok });
      if (!ok) report.add('SRC_HUD_FORMATTER_MISMATCH', { source: 'src/ui/SovereignHUD.ts', ...c, got });
    }
  } finally {
    try { fs.unlinkSync(hudBundle); } catch { /* ignore */ }
  }

  // 3. Stage3D (`VeritasPrismRig.ts`) — bundle pure ESM (`three` is pure JS, stub only `troika-three-text`)
  const rigTmp = path.join(os.tmpdir(), `ws_rt_rig_${process.pid}_${Date.now()}.mjs`);
  await esbuild({
    entryPoints: [path.join(ROOT, 'src/stage3d/VeritasPrismRig.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    plugins: [
      {
        name: 'stub-troika',
        setup(build) {
          build.onResolve({ filter: /^troika-three-text(?:\/.*)?$/ }, (args) => ({
            path: args.path,
            namespace: 'troika-stub',
          }));
          build.onLoad({ filter: /.*/, namespace: 'troika-stub' }, () => ({
            contents: 'export class Text { sync(){} dispose(){} } export default { Text };',
            loader: 'js',
          }));
        },
      },
    ],
    outfile: rigTmp,
    logLevel: 'silent',
  });
  try {
    const rigMod = await import(pathToFileURL(rigTmp).href);
    stage3dFormat = rigMod.formatCalibratorDialNumber;
    const rigCases = [
      { val: 1864, unit: 'CE', min: 1780, max: 1960, expect: '1864' },
      { val: 1780, unit: 'CE', min: 1780, max: 1960, expect: '1780' },
      { val: 1960, unit: 'CE', min: 1780, max: 1960, expect: '1960' },
      { val: 1969, unit: '', min: 1900, max: 2020, expect: '1969' },
      { val: 44, unit: 'BCE', min: 0, max: 200, expect: '44' },
      { val: 1500, unit: 'light-years', min: 500, max: 3000, expect: '1,500' },
      { val: 1500, unit: 'Earth years', min: 500, max: 3000, expect: '1,500' },
      { val: 5714, unit: 'strikeouts', min: 2000, max: 7000, expect: '5,714' },
    ];
    for (const c of rigCases) {
      const got = rigMod.formatCalibratorDialNumber(c.val, c.unit, c.min, c.max);
      const ok = got === c.expect;
      formatterResults.stage3d.push({ ...c, got, ok });
      if (!ok) report.add('SRC_STAGE3D_FORMATTER_MISMATCH', { source: 'src/stage3d/VeritasPrismRig.ts', ...c, got });
    }
    const s3d = rigMod.sanitize3DYearCommas('Founded in 1,864 CE (1,903)');
    formatterResults.stage3d.push({ fn: 'sanitize3DYearCommas', got: s3d, ok: s3d === 'Founded in 1864 CE (1903)' });
    if (s3d !== 'Founded in 1864 CE (1903)') {
      report.add('SRC_STAGE3D_SANITIZER_MISMATCH', { source: 'src/stage3d/VeritasPrismRig.ts', got: s3d });
    }
  } finally {
    try { fs.unlinkSync(rigTmp); } catch { /* ignore */ }
  }

  return { unsafeToLocale, formatterResults, hudFormat, stage3dFormat };
}

async function runMain() {
  const t0 = Date.now();
  const jsonOutIdx = process.argv.indexOf('--json-out');
  const jsonOutPath = jsonOutIdx !== -1 ? process.argv[jsonOutIdx + 1] : null;
  const srcOnly = process.argv.includes('--src-only');

  console.log('========================================================================');
  console.log('RT-COPY-DATES-AUDITOR v3 — PARALLEL 100% CORPUS + LIVE RUNTIME AUDIT');
  console.log('========================================================================');

  const forgeBundlePath = await bundleTsToTempFile('src/forge/index.ts', true);
  try {
    const forgeMod = await import(pathToFileURL(forgeBundlePath).href);
    const { normalizeToPrismQuestion, isCleanShardCandidate } = forgeMod;

    const report = new AuditReport();
    const stats = {
      tier1Count: 0,
      gzParityOk: false,
      goldVenueCount: 0,
      goldBossStepCount: 0,
      mainShardQuestions: 0,
      subcatBaseballQuestions: 0,
      domainSubcatQuestions: 0,
      codexSynthQuestions: 0,
      totalQuestionsAudited: 0,
      calibratorQuestionsTotal: 0,
      calibratorYearQuestionsTotal: 0,
      qid4Check: null,
    };

    console.log('[1/5] Auditing src/** & live Forge + SovereignHUD + VeritasPrismRig formatters...');
    const srcAudit = await auditSourceAndFormatters(report, forgeMod);

    if (!srcOnly) {
      console.log('[2/5] Auditing questions.json (+ .gz parity) & gold_venue_packs.json...');
      const qJsonText = fs.readFileSync(path.join(DATA_DIR, 'questions.json'), 'utf8');
      const qGzText = zlib.gunzipSync(fs.readFileSync(path.join(DATA_DIR, 'questions.json.gz'))).toString('utf8');
      stats.gzParityOk = qJsonText === qGzText;
      if (!stats.gzParityOk) {
        report.add('QUESTIONS_GZ_OUT_OF_SYNC', { source: 'public/data/questions.json.gz', jsonLen: qJsonText.length, gzLen: qGzText.length });
      }
      for (const raw of JSON.parse(qJsonText).questions) {
        const norm = normalizeToPrismQuestion(raw);
        stats.tier1Count++;
        stats.totalQuestionsAudited++;
        if (norm.calibrator) {
          stats.calibratorQuestionsTotal++;
          if (RE_YEAR_UNIT.test(norm.calibrator.unit) || RE_YEAR_PROMPT_CUE.test(norm.prompt)) stats.calibratorYearQuestionsTotal++;
        }
    if (raw.qid === 4 && norm.calibrator) {
      const cal = norm.calibrator;
      const hudEst = srcAudit.hudFormat?.(cal.exactVal, cal.unit, norm.prompt);
      const hudMin = srcAudit.hudFormat?.(cal.minVal, cal.unit, norm.prompt);
      const hudMax = srcAudit.hudFormat?.(cal.maxVal, cal.unit, norm.prompt);
      const rigEst = srcAudit.stage3dFormat?.(cal.exactVal, cal.unit, cal.minVal, cal.maxVal);
      const rigMin = srcAudit.stage3dFormat?.(cal.minVal, cal.unit, cal.minVal, cal.maxVal);
      const rigMax = srcAudit.stage3dFormat?.(cal.maxVal, cal.unit, cal.minVal, cal.maxVal);
      stats.qid4Check = {
        qid: norm.qid,
        prompt: norm.prompt,
        answerCorrect: norm.answerCorrect,
        hudReadout: `${hudEst} ${cal.unit} [${hudMin}..${hudMax}]`,
        stage3dReadout: `${rigEst} ${cal.unit} [${rigMin}..${rigMax}]`,
        cones: cal.toleranceCones.map((c) => c.label),
        zeroYearCommas:
          !/,/.test(`${norm.answerCorrect} ${hudEst} ${hudMin} ${hudMax} ${rigEst} ${rigMin} ${rigMax}`),
      };
      if (!stats.qid4Check.zeroYearCommas) {
        report.add('QID4_CALIBRATOR_YEAR_COMMA', stats.qid4Check);
      }
    }
        auditNormalizedQuestion(report, raw, norm, 'questions.json', isCleanShardCandidate);
      }

      const gvp = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'gold_venue_packs.json'), 'utf8'));
      for (const raw of gvp.questions ?? []) {
        const norm = normalizeToPrismQuestion(raw);
        stats.goldVenueCount++;
        stats.totalQuestionsAudited++;
        if (norm.calibrator) {
          stats.calibratorQuestionsTotal++;
          if (RE_YEAR_UNIT.test(norm.calibrator.unit) || RE_YEAR_PROMPT_CUE.test(norm.prompt)) stats.calibratorYearQuestionsTotal++;
        }
        auditNormalizedQuestion(report, raw, norm, 'gold_venue_packs.json', isCleanShardCandidate);
      }
      for (const bc of gvp.bossChains ?? []) {
        if (bc.chainTitle) checkTextCopy(report, bc.chainTitle, { source: 'gold_venue_packs.json', field: 'bossChain.title', chainId: bc.chainId }, false);
        for (const raw of bc.steps ?? bc.questions ?? []) {
          const norm = normalizeToPrismQuestion(raw);
          stats.goldBossStepCount++;
          stats.totalQuestionsAudited++;
          auditNormalizedQuestion(report, raw, norm, 'gold_venue_packs.json:bossChain', isCleanShardCandidate);
        }
      }

      console.log('[3/5] Auditing campaign_20hr.json (+ godot sync), narrative_wave2.json, taxonomy_tree.json...');
      const campText = fs.readFileSync(path.join(DATA_DIR, 'campaign_20hr.json'), 'utf8');
      walkJsonStrings(report, JSON.parse(campText), 'campaign_20hr.json');
      const godotCampPath = path.join(ROOT, 'godot/data/campaign_20hr.json');
      if (fs.existsSync(godotCampPath) && fs.readFileSync(godotCampPath, 'utf8') !== campText) {
        report.add('GODOT_CAMPAIGN_OUT_OF_SYNC', { source: 'godot/data/campaign_20hr.json' });
      }
      walkJsonStrings(report, JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'narrative_wave2.json'), 'utf8')), 'narrative_wave2.json');
      const taxTree = JSON.parse(fs.readFileSync(path.join(SHARDS_DIR, 'taxonomy_tree.json'), 'utf8'));
      walkJsonStrings(report, taxTree.domains, 'taxonomy_tree.json');

      // Parallelize ALL 26 shard files + ALL 12 Codex Synthesis domains across worker_threads!
      const allShardFiles = fs.readdirSync(SHARDS_DIR)
        .filter((f) => /^(?:domain_\d+(?:_\d+)?|subcat_baseball|domain_subcats_\d+)\.json$/.test(f))
        .sort();

      // Group domain_11_0 + domain_11_1 on the same worker so Codex Synthesis for domain 11 has both chunks!
      const nWorkers = Math.min(6, Math.max(2, os.cpus().length - 1));
      const buckets = Array.from({ length: nWorkers }, () => ({ files: [], doCodexDomains: [] }));
      for (let d = 0; d < 12; d++) {
        const b = buckets[d % nWorkers];
        b.doCodexDomains.push(d);
        for (const f of allShardFiles) {
          if (new RegExp(`^domain_${d}(?:_\\d+)?\\.json$`).test(f)) b.files.push(f);
        }
      }
      const subFiles = allShardFiles.filter((f) => /^(?:subcat_|domain_subcats_)/.test(f));
      subFiles.forEach((f, idx) => buckets[idx % nWorkers].files.push(f));

      console.log(`[4/5] Decoding ALL 26 shard files + 50,400 Codex QIDs across ${nWorkers} parallel workers...`);
      const workerPromises = buckets.map(
        (b) =>
          new Promise((resolve, reject) => {
            const w = new Worker(fileURLToPath(import.meta.url), {
              workerData: { forgeBundlePath, files: b.files, doCodexDomains: b.doCodexDomains },
            });
            w.on('message', (msg) => {
              if (msg?.error) reject(new Error(msg.error));
              else resolve(msg);
            });
            w.on('error', reject);
          }),
      );
      const results = await Promise.all(workerPromises);
      console.log('[5/5] Aggregating parallel worker results...');
      for (const res of results) {
        report.mergeFrom(res.report);
        stats.codexSynthQuestions += res.codexCount;
        stats.totalQuestionsAudited += res.codexCount;
        stats.calibratorQuestionsTotal += res.calTotal;
        stats.calibratorYearQuestionsTotal += res.calYearTotal;
        for (const fsItem of res.fileStats) {
          stats.totalQuestionsAudited += fsItem.count;
          if (/^domain_\d+/.test(fsItem.fileName)) stats.mainShardQuestions += fsItem.count;
          else if (fsItem.fileName === 'subcat_baseball.json') stats.subcatBaseballQuestions += fsItem.count;
          else stats.domainSubcatQuestions += fsItem.count;
        }
      }
    }

    const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);
    console.log('\n========================================================================');
    console.log(`AUDIT v3 COMPLETE in ${elapsedSec}s — TOTAL DECODED QIDS: ${stats.totalQuestionsAudited.toLocaleString()}`);
    console.log('========================================================================');
    if (!srcOnly) {
      console.log(`  Tier-1 (questions.json):       ${stats.tier1Count.toLocaleString()} (gz parity: ${stats.gzParityOk})`);
      console.log(`  Gold Venue Packs + Boss Steps: ${stats.goldVenueCount} + ${stats.goldBossStepCount}`);
      console.log(`  Main Shards (domain_0..11):    ${stats.mainShardQuestions.toLocaleString()}`);
      console.log(`  Baseball Subcat Shard:         ${stats.subcatBaseballQuestions.toLocaleString()}`);
      console.log(`  Domain Subcat Shards (0..11):  ${stats.domainSubcatQuestions.toLocaleString()}`);
      console.log(`  Codex Synthesis QIDs:          ${stats.codexSynthQuestions.toLocaleString()}`);
      console.log(`  Calibrator Qs (Year/Date):     ${stats.calibratorQuestionsTotal.toLocaleString()} (${stats.calibratorYearQuestionsTotal.toLocaleString()})`);
      console.log(`  QID 4 Check (1864 CE):         ${JSON.stringify(stats.qid4Check)}`);
    }

    const fPass = srcAudit.formatterResults.forge.filter((x) => x.ok).length;
    const hPass = srcAudit.formatterResults.hud.filter((x) => x.ok).length;
    const sPass = srcAudit.formatterResults.stage3d.filter((x) => x.ok).length;
    console.log(`LIVE FORMATTERS: Forge=${fPass}/${srcAudit.formatterResults.forge.length}, HUD=${hPass}/${srcAudit.formatterResults.hud.length}, Stage3D=${sPass}/${srcAudit.formatterResults.stage3d.length}`);
    console.log('UNSAFE SRC toLocaleString:', srcAudit.unsafeToLocale.length);

    console.log('\nDEFECT SUMMARY BY KIND:');
    const sortedKinds = Object.keys(report.counts).sort((a, b) => report.counts[b] - report.counts[a]);
    if (sortedKinds.length === 0) {
      console.log('  *** 0 DEFECTS ACROSS ENTIRE CORPUS & SRC! ***');
    } else {
      for (const k of sortedKinds) {
        console.log(`  - ${k}: ${report.counts[k].toLocaleString()}`);
        const srcs = Object.entries(report.bySource[k] ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
        console.log(`      by source: ${srcs.map(([s, c]) => `${s}=${c}`).join(', ')}`);
        const sts = Object.entries(report.byShardType[k] ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
        if (sts.length > 0) console.log(`      by type:   ${sts.map(([s, c]) => `${s}=${c}`).join(', ')}`);
        for (const s of (report.samples[k] ?? []).slice(0, 5)) {
          console.log(`      sample:    ${JSON.stringify(s)}`);
        }
      }
    }

    if (jsonOutPath) {
      fs.writeFileSync(jsonOutPath, JSON.stringify({ elapsedSec: Number(elapsedSec), stats, counts: report.counts, bySource: report.bySource, byShardType: report.byShardType, samples: report.samples, srcAudit }, null, 2), 'utf8');
      console.log(`\nFull JSON report written to ${jsonOutPath}`);
    }
  } finally {
    try { fs.unlinkSync(forgeBundlePath); } catch { /* ignore */ }
  }
}

if (isMainThread) {
  runMain().catch((err) => {
    console.error('AUDIT FATAL ERROR:', err);
    process.exit(1);
  });
}
