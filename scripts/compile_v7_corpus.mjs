#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// 12-Gate Anti-Slop Trivia Corpus Compiler (`scripts/compile_v7_corpus.mjs`)
// Compiles `pack_e_1966_primetime_gold.mjs` (FIRST!) + curated v7 packs
// + `prime_time_witty_clues_seed.json` into `public/data/v7/*.json`.
// Enforces 12 Anti-Slop & Schema Integrity Gates + Same-Category Answer Dedup
// + Prime-Time Gold prioritization in `boot_pack.json` & `season_1.json`!
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const SEED_PATH = path.join(ROOT, 'scripts/seed_data/prime_time_witty_clues_seed.json');
const OUT_DIR = path.join(ROOT, 'public/data/v7');

const CATEGORY_TO_DOMAIN = {
  MEDICINE: 'SCI_TECH',
  CHEMISTRY: 'SCI_TECH',
  PHYSICS: 'SCI_TECH',
  GADGETS: 'SCI_TECH',
  ENGINES: 'SCI_TECH',
  LITERATURE: 'POP_LIT',
  LEXICON: 'POP_LIT',
  'FINE ARTS': 'POP_LIT',
  SCREEN: 'POP_LIT',
  JUKEBOX: 'POP_LIT',
  FINANCE: 'NUM_GEO',
  PRICING: 'NUM_GEO',
  ODDS: 'NUM_GEO',
  ATLAS: 'NUM_GEO',
  SPORTS: 'NUM_GEO',
  DYNASTIES: 'HIST_FACT',
  HEADLINES: 'HIST_FACT',
  FOLKLORE: 'HIST_FACT',
  FALLACIES: 'HIST_FACT',
  CUISINE: 'HIST_FACT',
};

const ALL_CATEGORIES = Object.keys(CATEGORY_TO_DOMAIN);
const BLITZ_LEGAL_TOYS = new Set([
  'TOY_01_KNIFE_SWITCH',
  'TOY_03_VERNIER_DIAL',
  'TOY_05_RELIEF_GLOBE_3D',
  'TOY_10_CLIFFHANGERS_THROTTLE',
  'TOY_11_MISSING_VOWELS_WHEEL',
]);

const BANNED_ROBOTIC_PATTERNS = [
  /what is the home country of/i,
  /what is the km of/i,
  /what is the capital of\b/i,
  /^(which|what) (chemical )?element has the atomic number\b/i,
  /^in which country is .* located\?/i,
  /locate waffle/i,
  /\bdelve\b|\btapestry\b|\btestament to\b|\bindelible mark\b/i,
  /\(\d{4}\)\?$/,
];

function fnv1aHash(str) {
  let h = 0x811c9dc5;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function normEntity(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 96);
}

function normAnswerDedupSlug(answerStr) {
  const cleaned = String(answerStr || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(the|a|an|gas|element|metal)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
  // Purely numeric / short measurement answers (e.g. "5cents", "100", "4") can legitimately belong to multiple distinct questions
  if (/^\d/.test(cleaned) || cleaned.length < 4) return null;
  return cleaned;
}

function classifySeedClue(c) {
  const cat = String(c.categoryLabel || '').toUpperCase();
  const sub = String(c.subcategoryLabel || '').toUpperCase();
  const cs = `${cat} ${sub}`;
  const txt = `${cs} ${c.prompt} ${c.choices?.[c.correctIndex] || ''}`.toUpperCase();

  // Strict word-boundary & priority-ordered classification (prevents REVOLUTION->EVOLUTION, TELEVISION/COMPUTER VISION->VISION, TEAM->TEA!)
  if (/\b(FALLACY|FALLACIES|PARADOX|PARADOXES|LOGIC TRAP|COGNITIVE BIAS|SYLLOGISM|STRAW MAN|SUNK COST|GAMBLER)\b/.test(cs) || /\b(FALLACY|PARADOX)\b/.test(txt)) return 'FALLACIES';
  if (/\b(LEXICON|ETYMOLOGY|ETYMOLOGIES|WORD ORIGINS|GRAMMAR|LINGUISTICS|SLANG|IDIOMS?|PALINDROMES?|ANAGRAMS?|DICTIONARY|SPELLING|ACRONYMS?|PHRASES|LATIN)\b/.test(cs) || /\b(ETYMOLOGY|LATIN PHRASE|LITERAL MEANING)\b/.test(txt)) return 'LEXICON';
  if (/\b(PRICING|AUCTION|AUCTIONS|RETAIL|LUXURY|BARGAIN|PRICES?)\b/.test(cs) || /SOLD FOR \$|MILLION AT AUCTION|COST \$|PRICED AT/.test(txt)) return 'PRICING';
  if (/\b(PROBABILITY|STATISTICS|GAME THEORY|CASINOS?|POKER|DICE|ROULETTE|LOTTERY|BETTING|MONTY HALL|BAYES|COMBINATORICS|LOGIC & MATH|NUMBERS & PRIMES|PUZZLES & PROOFS|GEOMETRY)\b/.test(cs)) return 'ODDS';
  if (/\b(FINANCE|ECONOMICS|ECONOMIC|CURRENCY|CURRENCIES|TAXES|TAXATION|BANKING|CENTRAL BANKS?|WALL STREET|STOCKS?|MONETARY|DEBT|GDP|INFLATION|WORLD TRADE|TREASURY)\b/.test(cs)) return 'FINANCE';

  // Screen, Music, Tech, Sports, Fine Arts & Physics checked BEFORE Medicine/Cuisine to avoid substring traps!
  if (/\b(SCREEN|CINEMA|TV & STREAMING|TELEVISION|ANIMATION|FILMS?|DIRECTORS?|OSCARS?|HOLLYWOOD|SITCOMS?|BROADWAY)\b/.test(cs)) return 'SCREEN';
  if (/\b(JUKEBOX|POP MUSIC|ROCK & SOUL|CLASSICAL MUSIC|OPERA|SOUNDTRACKS?|JAZZ|HIP HOP|ALBUMS?|SYMPHONIES|SYMPHONY|SONGS?|MUSICAL INSTRUMENTS?)\b/.test(cs)) return 'JUKEBOX';
  if (/\b(GADGETS?|TECH & COMPUTING|CODING|INTERNET|CYBERSECURITY|HARDWARE|MICROCHIPS?|AI & ROBOTICS|COMPUTER VISION|SILICON VALLEY|DIGITAL|VIDEO GAMES?|GAMING HISTORY)\b/.test(cs)) return 'GADGETS';
  if (/\b(SPORTS?|OLYMPICS?|BASEBALL|SOCCER|TENNIS|TABLE TENNIS|BASKETBALL|GOLF|MOTORSPORT|HOCKEY|FOOTBALL|WRESTLING|BOXING|CHESS|BOARD GAMES|ATHLETES?)\b/.test(cs)) return 'SPORTS';
  if (/\b(FINE ARTS?|ARCHITECTURE|SCULPTURE|PAINTINGS?|MUSEUMS?|PHOTOGRAPHY|FASHION & CRAFT|DESIGN & CRAFT|DECORATIVE)\b/.test(cs)) return 'FINE ARTS';
  if (/\b(ENGINES?|LOCOMOTIVES?|TURBINES?|AVIATION|ROCKETS?|SPACECRAFT|AUTOMOTIVE|MOTORS?|SUBMARINES?|PROPULSION|AEROSPACE|HOROLOGY|CLOCKWORK|MECHANICAL|INDUSTRIAL DESIGN)\b/.test(cs)) return 'ENGINES';
  if (/\b(PHYSICS|QUANTUM|RELATIVITY|OPTICS|THERMODYNAMICS?|ACOUSTICS?|ELECTROMAGNETISM|GRAVITY|NUCLEAR|PARTICLES?|SPACE & COSMOS|ASTRONOMY|ASTROBIOLOGY|EARTH SCIENCE|WEATHER)\b/.test(cs)) return 'PHYSICS';
  if (/\b(CHEMISTRY|ELEMENTS?|ALKALI|NOBLE GAS|POLYMERS?|ALLOYS?|METALLURGY|COMPOUNDS?|ISOTOPES?|CATALYSTS?|CRYSTALS?|MINERALS?|ACIDS?)\b/.test(cs)) return 'CHEMISTRY';
  if (/\b(LITERATURE|CLASSIC LIT|BOOK LORE|EPIC POETRY|SHAKESPEARE|NOVELS?|POETS?|POETRY|AUTHORS?|DRAMA)\b/.test(cs)) return 'LITERATURE';
  if (/\b(FOLKLORE|MYTHS?|MYTHOLOGY|WORLD MYTH|FAIRY TALES?|LEGENDS?|SUPERSTITIONS?|MONSTERS?|ARTHURIAN|NORSE|GREEK MYTH)\b/.test(cs)) return 'FOLKLORE';
  if (/\b(CUISINE|WORLD CUISINE|FOODS?|WINE & SPIRITS|CULINARY|PASTRY|BAKING|SPICES|CHEESES?|COFFEE|TEA|CHOCOLATE|CHEFS?|DISHES)\b/.test(cs) && !/\bTEA PARTY\b/.test(cs)) return 'CUISINE';
  if (/\b(MEDICINE|ANATOMY|HUMAN BODY|BRAIN|GENETICS|SURGERY|DISEASES?|VACCINES?|PHARMA|HEARTS?|NEUROLOGY|NEUROSCIENCE|IMMUNE|BLOOD|ORGANS?|CELLS?|DNA|SLEEP|HUMAN VISION|BIOLOGY|MAMMALS?|MARINE LIFE|OCEAN LIFE|BOTANY|BIRDS?|INSECTS?|REPTILES?|EVOLUTION|WILDLIFE|DINOSAURS?|ECOSYSTEMS?)\b/.test(cs)) return 'MEDICINE';
  if (/\b(ATLAS|GEOGRAPHY|ISLANDS?|CANYONS?|RIVERS?|MOUNTAINS?|OCEANS?|DESERTS?|CANALS?|CAPITALS?|COUNTRIES|COUNTRY|CITIES|CONTINENTS?|BORDERS?|VOLCANOES|VOLCANO|WATERFALLS?|GEODESY|CARTOGRAPHY)\b/.test(cs) || c.domainId === 2) return 'ATLAS';
  if (/\b(DYNASTIES|DYNASTY|EMPIRES?|ANCIENT WORLD|AFRICAN KINGDOMS|MEDIEVAL|ROYAL|MONARCHS?|PHARAOHS?|CAESARS?|SHOGUNS?|KINGDOMS?)\b/.test(cs)) return 'DYNASTIES';
  return 'HEADLINES';
}

function cleanDisplayCopy(str) {
  return String(str || '')
    .trim()
    .replace(/\.\.\.|\u2026/g, '—')
    .replace(/\*([^*]+)\*/g, '“$1”')
    .replace(/^In what year did\s+/i, 'Which landmark year saw ');
}

function buildMissingVowelsPayload(answerStr, seedInt, answerIdx = 0) {
  const upper = String(answerStr || '').toUpperCase().trim();
  if (!/^[A-Z ]{4,22}$/.test(upper)) return undefined;
  const vowels = [];
  let masked = '';
  for (const ch of upper) {
    if ('AEIOU'.includes(ch)) {
      vowels.push(ch);
    } else if (ch === ' ') {
      masked += '   ';
    } else {
      masked += (masked && !masked.endsWith(' ') ? ' ' : '') + ch;
    }
  }
  if (vowels.length < 2 || vowels.length > 7) return undefined;
  const consonantsCount = upper.replace(/[^B-DF-HJ-NP-TV-Z]/g, '').length;
  if (consonantsCount < 3) return undefined;

  const trueSeq = vowels.join('-');
  const pool = ['A', 'E', 'I', 'O', 'U'];
  const distractors = new Set();
  let attempt = 0;
  while (distractors.size < 3 && attempt < 40) {
    attempt++;
    const mutated = vowels.map((v, idx) => {
      if ((idx + attempt + seedInt) % 2 === 0) {
        return pool[(pool.indexOf(v) + attempt + idx + 1) % 5];
      }
      return v;
    });
    const cand = mutated.join('-');
    if (cand !== trueSeq) distractors.add(cand);
  }
  if (distractors.size < 3) return undefined;
  const correctChoiceIdx = [0, 1, 2, 3].includes(answerIdx) ? answerIdx : seedInt % 4;
  const distArr = Array.from(distractors);
  const vowelChoices = [];
  let di = 0;
  for (let i = 0; i < 4; i++) {
    if (i === correctChoiceIdx) vowelChoices.push(trueSeq);
    else vowelChoices.push(distArr[di++]);
  }
  return {
    maskedDisplay: masked.trim(),
    fullAnswer: upper,
    vowelChoices,
    correctChoiceIdx,
  };
}

function computeBijection(answerIdx, choices, seedInt) {
  const others = [0, 1, 2, 3].filter((i) => i !== answerIdx);
  const ansLen = choices[answerIdx].length;
  const ranked = [...others].sort(
    (a, b) => Math.abs(choices[a].length - ansLen) - Math.abs(choices[b].length - ansLen),
  );
  const rot = seedInt % 2;
  const poisonedFixIdx = ranked[0];
  const waiverPruneIdx = ranked[rot === 0 ? 1 : 2];
  const anchorIdx = ranked[rot === 0 ? 2 : 1];
  return { answerIdx, poisonedFixIdx, waiverPruneIdx, anchorIdx };
}

function permuteFourChoicesDeterministically(choices, answerIdx, seedHash) {
  const targetAnswerIdx = seedHash % 4;
  if (targetAnswerIdx === answerIdx) {
    return { choices, answerIdx };
  }
  const nextChoices = [...choices];
  const tmp = nextChoices[targetAnswerIdx];
  nextChoices[targetAnswerIdx] = nextChoices[answerIdx];
  nextChoices[answerIdx] = tmp;
  return { choices: nextChoices, answerIdx: targetAnswerIdx };
}

function convertSeedClue(c, idx) {
  const category = classifySeedClue(c);
  const domain = CATEGORY_TO_DOMAIN[category];
  const rawDiff = Number(c.difficultyScore || 2);
  const difficulty = Math.max(1, Math.min(5, Math.ceil(rawDiff / 2)));
  const stem = cleanDisplayCopy(c.prompt);
  const rawChoices = (c.choices || []).map((x) => cleanDisplayCopy(x));
  if (rawChoices.length !== 4) return null;
  const rawAnswerIdx = c.correctIndex;
  if (![0, 1, 2, 3].includes(rawAnswerIdx)) return null;

  const ahaFactoid = cleanDisplayCopy(c.wittyHostAside);
  const choices = rawChoices;
  const answerIdx = rawAnswerIdx;
  const { poisonedFixIdx, waiverPruneIdx, anchorIdx } = computeBijection(answerIdx, choices, idx);

  const supportedToys = ['TOY_01_KNIFE_SWITCH', 'TOY_02_CONFIDENCE_PNEUMATIC', 'TOY_06_FUSE_WIRE_SNIPPER'];
  const out = {
    qid: 0,
    canonicalEntityKey: normEntity(`${choices[answerIdx]}_${c.subcategoryLabel || category}`),
    category,
    domain,
    difficulty,
    isBlitzLegal: false,
    stem,
    choices,
    answerIdx,
    poisonedFixIdx,
    waiverPruneIdx,
    anchorIdx,
    isKlaxonMyth: /myth|misconception|actually|contrary|pedants|despite its name/i.test(stem),
    ahaFactoid,
    supportedToys,
    _goldPriority: false,
  };

  const ansNum = Number(String(choices[answerIdx]).replace(/[^0-9.-]/g, ''));
  if (
    typeof c.numericTarget === 'number' &&
    typeof c.numericMin === 'number' &&
    typeof c.numericMax === 'number' &&
    c.numericMax > c.numericMin &&
    (!Number.isNaN(ansNum) && Math.abs(ansNum - c.numericTarget) < 0.01)
  ) {
    out.numeric = {
      target: c.numericTarget,
      min: c.numericMin,
      max: c.numericMax,
      step: 1,
      unit: String(c.numericUnit || ''),
    };
    supportedToys.push('TOY_03_VERNIER_DIAL');
    if (c.numericTarget >= 0 && c.numericTarget <= 100 && c.numericMax <= 120) {
      supportedToys.push('TOY_10_CLIFFHANGERS_THROTTLE');
    }
  }

  const ansNormForGeo = normEntity(choices[answerIdx]);
  const geoNorm = normEntity(c.geoTarget?.landmarkLabel || '');
  if (
    c.geoTarget &&
    typeof c.geoTarget.lat === 'number' &&
    typeof c.geoTarget.lng === 'number' &&
    Math.abs(c.geoTarget.lat) <= 85 &&
    Math.abs(c.geoTarget.lng) <= 180 &&
    c.geoTarget.landmarkLabel &&
    !/waffle|ocean|basin/i.test(c.geoTarget.landmarkLabel) &&
    ansNormForGeo.length >= 3 &&
    (geoNorm.includes(ansNormForGeo) || ansNormForGeo.includes(geoNorm)) &&
    (category === 'ATLAS' || /where|city|country|island|mountain|river|canal|tower|statue|temple|palace|harbor|strait/i.test(stem))
  ) {
    out.geo = {
      lat: c.geoTarget.lat,
      lng: c.geoTarget.lng,
      landmarkLabel: cleanDisplayCopy(choices[answerIdx]),
      regionHint: cleanDisplayCopy(c.geoTarget.regionHint || ''),
    };
    supportedToys.push('TOY_05_RELIEF_GLOBE_3D');
  }

  if (
    c.binaryPair &&
    c.binaryPair.optionA &&
    c.binaryPair.optionB &&
    !/nonsense|fabrication|made-up/i.test(`${c.binaryPair.optionA} ${c.binaryPair.optionB}`) &&
    Array.isArray(c.binaryPair.items) &&
    c.binaryPair.items.length >= 4
  ) {
    const cleanItems = c.binaryPair.items
      .slice(0, 5)
      .filter((it) => it && typeof it.text === 'string' && it.text.length <= 26 && (it.bucket === 0 || it.bucket === 1))
      .map((it) => ({ label: it.text.trim(), chute: it.bucket }));
    if (cleanItems.length >= 4) {
      out.sorter = {
        chuteALabel: String(c.binaryPair.optionA).trim(),
        chuteBLabel: String(c.binaryPair.optionB).trim(),
        items: cleanItems,
      };
      supportedToys.push('TOY_07_MAIL_SORTER');
    }
  }

  if (Array.isArray(c.chronologyItems) && c.chronologyItems.length >= 3) {
    const evs = c.chronologyItems
      .slice(0, 4)
      .filter((ev) => ev && typeof ev.label === 'string' && ev.label.length <= 34 && typeof ev.yearOrOrder === 'number')
      .map((ev) => ({
        label: ev.label.trim(),
        year: ev.yearOrOrder,
        displayYear: ev.yearOrOrder < 0 ? `${Math.abs(ev.yearOrOrder)} BCE` : `${ev.yearOrOrder}`,
      }));
    const uniqueYears = new Set(evs.map((e) => e.year));
    if (evs.length >= 3 && uniqueYears.size === evs.length) {
      out.chronology = { events: evs };
      supportedToys.push('TOY_08_CHRONOLOGY_RAIL');
    }
  }

  const vowels = buildMissingVowelsPayload(choices[answerIdx], idx, answerIdx);
  if (vowels) {
    out.vowels = vowels;
    supportedToys.push('TOY_11_MISSING_VOWELS_WHEEL');
  }

  if (Array.isArray(c.progressiveHints) && c.progressiveHints.length === 4) {
    const ansLower = choices[answerIdx].toLowerCase();
    const ansTokens = ansLower.split(/[^a-z0-9]+/).filter((t) => t.length >= 4);
    const hintsClean = c.progressiveHints.map((h) => String(h || '').trim());
    const leaks = hintsClean.some((h) => {
      const hl = h.toLowerCase();
      if (hl.includes(ansLower)) return true;
      return ansTokens.some((tk) => hl.includes(tk));
    });
    if (!leaks && hintsClean.every((h) => h.length >= 12 && h.length <= 72)) {
      out.shutters = { shutters: hintsClean };
      supportedToys.push('TOY_14_FOUR_SHUTTER_REEL');
    }
  }

  return out;
}

function normalizeAuthoredClue(raw, idx) {
  const category = raw.category;
  if (!CATEGORY_TO_DOMAIN[category]) return null;
  const domain = CATEGORY_TO_DOMAIN[category];
  let choices = (raw.choices || []).map((c) => cleanDisplayCopy(c));
  if (choices.length !== 4) return null;
  let answerIdx = raw.answerIdx ?? raw.correctIndex ?? 0;
  if (![0, 1, 2, 3].includes(answerIdx)) return null;
  const rawStem = raw.stem ?? raw.prompt ?? '';
  const rawFactoid = raw.ahaFactoid ?? raw.wittyHostAside ?? '';

  const isBespokeContraptionOnly =
    Boolean(raw.cyanotype) ||
    Boolean(raw.patchbay) ||
    Boolean(raw.balance) ||
    Boolean(raw.lasso) ||
    Boolean(raw.sorter) ||
    Boolean(raw.chronology);

  // Ensure even A/B/C/D answerIdx balance across Prime-Time Gold 4-option clues
  const entitySeedKey = normEntity(raw.canonicalEntityKey || `${choices[answerIdx]}_${category}_${idx}`);
  if (raw.isPrimeTimeGold && !isBespokeContraptionOnly && !raw.vowels) {
    const permuted = permuteFourChoicesDeterministically(
      choices,
      answerIdx,
      fnv1aHash(entitySeedKey) + idx,
    );
    choices = permuted.choices;
    answerIdx = permuted.answerIdx;
  }

  const bij = computeBijection(answerIdx, choices, idx + 17);
  const initialToys =
    Array.isArray(raw.supportedToys) && raw.supportedToys.length > 0
      ? raw.supportedToys
      : raw.primaryToy
        ? [raw.primaryToy]
        : ['TOY_01_KNIFE_SWITCH', 'TOY_02_CONFIDENCE_PNEUMATIC', 'TOY_06_FUSE_WIRE_SNIPPER'];
  const supportedSet = new Set(initialToys);
  if (raw.primaryToy) supportedSet.add(raw.primaryToy);
  if (raw.balance) supportedSet.add('TOY_04_BALANCE_SCALE');
  if (raw.patchbay) supportedSet.add('TOY_09_SWITCHBOARD_PATCHBAY');
  if (raw.lasso) supportedSet.add('TOY_12_CONSPIRACY_LASSO');
  if (raw.cyanotype) supportedSet.add('TOY_13_CYANOTYPE_LOUPE');
  if (raw.shutters) supportedSet.add('TOY_14_FOUR_SHUTTER_REEL');
  if (raw.numeric) {
    supportedSet.add('TOY_03_VERNIER_DIAL');
    if (raw.numeric.target >= 0 && raw.numeric.target <= 100 && raw.numeric.max <= 120) {
      supportedSet.add('TOY_10_CLIFFHANGERS_THROTTLE');
    }
  }
  if (raw.geo) supportedSet.add('TOY_05_RELIEF_GLOBE_3D');
  if (raw.sorter) supportedSet.add('TOY_07_MAIL_SORTER');
  if (raw.chronology) supportedSet.add('TOY_08_CHRONOLOGY_RAIL');

  if (isBespokeContraptionOnly) {
    supportedSet.delete('TOY_01_KNIFE_SWITCH');
    supportedSet.delete('TOY_02_CONFIDENCE_PNEUMATIC');
    supportedSet.delete('TOY_06_FUSE_WIRE_SNIPPER');
  } else {
    supportedSet.add('TOY_01_KNIFE_SWITCH');
    supportedSet.add('TOY_02_CONFIDENCE_PNEUMATIC');
  }

  let vowels = raw.vowels;
  if (!vowels && !isBespokeContraptionOnly) {
    vowels = buildMissingVowelsPayload(choices[answerIdx], idx + 9, answerIdx);
  }
  if (vowels) {
    supportedSet.add('TOY_11_MISSING_VOWELS_WHEEL');
  }

  return {
    qid: 0,
    canonicalEntityKey: entitySeedKey,
    category,
    domain,
    difficulty: Math.max(1, Math.min(5, Number(raw.difficulty || 2))),
    isBlitzLegal: false,
    stem: cleanDisplayCopy(rawStem),
    choices,
    answerIdx,
    poisonedFixIdx: bij.poisonedFixIdx,
    waiverPruneIdx: bij.waiverPruneIdx,
    anchorIdx: bij.anchorIdx,
    isKlaxonMyth: Boolean(raw.isKlaxonMyth),
    ahaFactoid: cleanDisplayCopy(rawFactoid),
    supportedToys: Array.from(supportedSet),
    _goldPriority: Boolean(raw.isPrimeTimeGold),
    _packSource: raw._packSource || '',
    ...(raw.numeric ? { numeric: raw.numeric } : {}),
    ...(raw.balance ? { balance: raw.balance } : {}),
    ...(raw.geo ? { geo: raw.geo } : {}),
    ...(raw.sorter ? { sorter: raw.sorter } : {}),
    ...(raw.chronology ? { chronology: raw.chronology } : {}),
    ...(raw.patchbay ? { patchbay: raw.patchbay } : {}),
    ...(vowels ? { vowels } : {}),
    ...(raw.lasso ? { lasso: raw.lasso } : {}),
    ...(raw.cyanotype ? { cyanotype: raw.cyanotype } : {}),
    ...(raw.shutters ? { shutters: raw.shutters } : {}),
  };
}

// ============================================================================
// 12-Gate Anti-Slop Validator + Same-Category Answer Deduplicator
// ============================================================================
function validateClue12Gates(clue, seenEntities, seenCategoryAnswers, gateDrops) {
  // Gate 1: Zero robotic templates / AI slop
  for (const re of BANNED_ROBOTIC_PATTERNS) {
    if (re.test(clue.stem) || re.test(clue.ahaFactoid)) {
      gateDrops.gate1_robotic++;
      return false;
    }
  }
  // Gate 2: Stem length (24 .. 215 chars) & zero ellipsis
  if (clue.stem.length < 24 || clue.stem.length > 215 || clue.stem.includes('...')) {
    gateDrops.gate2_stemLen++;
    return false;
  }
  // Gate 3: 4 unique non-empty choices <= 38 chars (zero mobile clipping!)
  const normChoices = new Set(clue.choices.map((c) => c.toLowerCase()));
  const lens = clue.choices.map((c) => c.length);
  if (
    normChoices.size !== 4 ||
    Math.min(...lens) < 1 ||
    Math.max(...lens) > 38 ||
    clue.choices.some((c) => c.includes('...'))
  ) {
    gateDrops.gate3_choices++;
    return false;
  }
  // Gate 4: Distractor length-ratio guard (max/min <= 3.5 short code; <= 2.65 standard)
  const isShortCode = Math.min(...lens) <= 4;
  const ratioCap = isShortCode ? 3.5 : 2.65;
  if (Math.max(...lens) / Math.max(1, Math.min(...lens)) > ratioCap) {
    gateDrops.gate4_ratio++;
    return false;
  }
  // Gate 4b: Anti-longest-answer giveaway guard (legacy correct answer must not tower >= 5 chars above all 3 distractors)
  const ansLen = lens[clue.answerIdx];
  const maxDistractorLen = Math.max(...lens.filter((_, idx) => idx !== clue.answerIdx), 1);
  if (!clue._goldPriority && ansLen >= maxDistractorLen + 5) {
    gateDrops.gate4_ratio++;
    return false;
  }
  // Gate 5: Bijection {answerIdx, poisonedFixIdx, waiverPruneIdx, anchorIdx} == {0,1,2,3}
  const bijSet = new Set([
    clue.answerIdx,
    clue.poisonedFixIdx,
    clue.waiverPruneIdx,
    clue.anchorIdx,
  ]);
  if (bijSet.size !== 4 || ![0, 1, 2, 3].every((k) => bijSet.has(k))) {
    gateDrops.gate5_bijection++;
    return false;
  }
  // Gate 6: Mandatory non-empty ahaFactoid (18 .. 175 chars, not identical to stem)
  if (
    clue.ahaFactoid.length < 18 ||
    clue.ahaFactoid.length > 175 ||
    clue.ahaFactoid.toLowerCase() === clue.stem.toLowerCase()
  ) {
    gateDrops.gate6_factoid++;
    return false;
  }
  // Gate 7: Unique canonicalEntityKey + zero same-category duplicate 4-choice answers (e.g. Helium vs Helium gas)
  if (!clue.canonicalEntityKey || seenEntities.has(clue.canonicalEntityKey)) {
    gateDrops.gate7_dupEntity++;
    return false;
  }
  const isClassicFourChoice = clue.supportedToys.includes('TOY_01_KNIFE_SWITCH');
  const ansSlug = isClassicFourChoice ? normAnswerDedupSlug(clue.choices[clue.answerIdx]) : null;
  const catAnsKey = ansSlug ? `${clue.category}::${ansSlug}` : null;
  if (catAnsKey && seenCategoryAnswers.has(catAnsKey)) {
    gateDrops.gate7_dupEntity++;
    return false;
  }
  // Gate 8: Valid CategoryIdV7
  if (!CATEGORY_TO_DOMAIN[clue.category]) {
    gateDrops.gate8_category++;
    return false;
  }
  // Gate 9: GeoTarget integrity
  if (clue.supportedToys.includes('TOY_05_RELIEF_GLOBE_3D')) {
    const g = clue.geo;
    if (
      !g ||
      typeof g.lat !== 'number' ||
      typeof g.lng !== 'number' ||
      Math.abs(g.lat) > 85 ||
      Math.abs(g.lng) > 180 ||
      !g.landmarkLabel
    ) {
      gateDrops.gate9_geo++;
      return false;
    }
  }
  // Gate 10: BalanceScale integrity
  if (clue.supportedToys.includes('TOY_04_BALANCE_SCALE')) {
    const b = clue.balance;
    if (!b || !Array.isArray(b.weights) || b.weights.length !== 5 || !Array.isArray(b.validPair)) {
      gateDrops.gate10_balance++;
      return false;
    }
    const [i0, i1] = b.validPair;
    if (
      i0 === i1 ||
      i0 < 0 ||
      i1 < 0 ||
      i0 > 4 ||
      i1 > 4 ||
      b.weights[i0].value + b.weights[i1].value !== b.targetSum
    ) {
      gateDrops.gate10_balance++;
      return false;
    }
  }
  // Gate 11: ConspiracyLasso integrity
  if (clue.supportedToys.includes('TOY_12_CONSPIRACY_LASSO')) {
    const l = clue.lasso;
    if (
      !l ||
      !Array.isArray(l.cards) ||
      l.cards.length !== 9 ||
      new Set(l.cards.map((x) => x.toLowerCase())).size !== 9 ||
      !Array.isArray(l.triadIndices) ||
      new Set(l.triadIndices).size !== 3
    ) {
      gateDrops.gate11_lasso++;
      return false;
    }
  }
  // Gate 12: Cyanotype / Patchbay schema integrity
  if (clue.supportedToys.includes('TOY_13_CYANOTYPE_LOUPE')) {
    const cy = clue.cyanotype;
    if (!cy || !CATEGORY_TO_DOMAIN[cy.plateId] || cy.targetZoneIdx < 0 || cy.targetZoneIdx > 7 || !cy.targetZoneName) {
      gateDrops.gate12_payloads++;
      return false;
    }
  }
  if (clue.supportedToys.includes('TOY_09_SWITCHBOARD_PATCHBAY')) {
    const pb = clue.patchbay;
    if (
      !pb ||
      !Array.isArray(pb.callers) ||
      pb.callers.length !== 3 ||
      !Array.isArray(pb.jacks) ||
      pb.jacks.length !== 4 ||
      !Array.isArray(pb.correctMapping) ||
      new Set(pb.correctMapping).size !== 3
    ) {
      gateDrops.gate12_payloads++;
      return false;
    }
  }

  // Compute Blitz legality strictly
  const hasBlitzToy = clue.supportedToys.some((t) => BLITZ_LEGAL_TOYS.has(t));
  clue.isBlitzLegal =
    hasBlitzToy &&
    clue.stem.length <= 125 &&
    Math.max(...lens) <= 28 &&
    !clue.cyanotype;

  seenEntities.add(clue.canonicalEntityKey);
  if (catAnsKey) seenCategoryAnswers.add(catAnsKey);
  return true;
}

function stripTransientFields(clue) {
  const copy = { ...clue };
  delete copy._goldPriority;
  delete copy._packSource;
  return copy;
}

async function main() {
  const candidatePackDirs = [
    path.join(ROOT, 'scripts/seed_data/packs'),
    path.join(ROOT, 'scripts/seed_data'),
  ];
  const rawPackFiles = [];
  for (const dir of candidatePackDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir).sort()) {
      if (entry.endsWith('.mjs')) {
        rawPackFiles.push(path.join(dir, entry));
      }
    }
  }

  // Prioritize Gold human-authored packs (`pack_e`..`pack_k`) FIRST so All-Era handcrafted gems lead every category!
  const isGoldPackFile = (filePath) =>
    /pack_[efghijk](_|\.)/i.test(path.basename(filePath));

  const packFiles = rawPackFiles.sort((a, b) => {
    const aGold = isGoldPackFile(a) ? 0 : 1;
    const bGold = isGoldPackFile(b) ? 0 : 1;
    if (aGold !== bGold) return aGold - bGold;
    return a.localeCompare(b);
  });

  const authoredRaw = [];
  for (const full of packFiles) {
    const mod = await import(pathToFileURL(full).href);
    const arr =
      mod.CLUES ||
      mod.default ||
      Object.values(mod).find((v) => Array.isArray(v)) ||
      [];
    const stampGold = isGoldPackFile(full);
    const baseName = path.basename(full);
    console.log(
      `Loaded ${arr.length} authored clues from ${path.relative(ROOT, full)}${stampGold ? ' [GOLD PRIORITY]' : ''}`,
    );
    for (const item of arr) {
      authoredRaw.push({
        ...item,
        ...(stampGold && !item.isPrimeTimeGold ? { isPrimeTimeGold: true } : {}),
        _packSource: baseName,
      });
    }
  }

  const seedJson = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  const seedRaw = seedJson.clues || [];
  console.log(`Loaded ${seedRaw.length} seed witty clues from prime_time_witty_clues_seed.json`);

  const gateDrops = {
    gate1_robotic: 0,
    gate2_stemLen: 0,
    gate3_choices: 0,
    gate4_ratio: 0,
    gate5_bijection: 0,
    gate6_factoid: 0,
    gate7_dupEntity: 0,
    gate8_category: 0,
    gate9_geo: 0,
    gate10_balance: 0,
    gate11_lasso: 0,
    gate12_payloads: 0,
  };

  const seenEntities = new Set();
  const seenCategoryAnswers = new Set();
  const validClues = [];

  authoredRaw.forEach((raw, idx) => {
    const norm = normalizeAuthoredClue(raw, idx);
    if (norm && validateClue12Gates(norm, seenEntities, seenCategoryAnswers, gateDrops)) {
      validClues.push(norm);
    }
  });

  seedRaw.forEach((raw, idx) => {
    const conv = convertSeedClue(raw, idx);
    if (conv && validateClue12Gates(conv, seenEntities, seenCategoryAnswers, gateDrops)) {
      validClues.push(conv);
    }
  });

  // Deterministic non-alphabetical interleave: Prime-Time Gold first inside each difficulty tier,
  // followed by FNV-1a hash order (eliminating the old alphabetical '100', '118', 'Backward', 'Bamboo' bias!)
  validClues.sort((a, b) => {
    if (a._goldPriority !== b._goldPriority) return a._goldPriority ? -1 : 1;
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
    const ha = fnv1aHash(a.canonicalEntityKey);
    const hb = fnv1aHash(b.canonicalEntityKey);
    if (ha !== hb) return ha - hb;
    return a.canonicalEntityKey.localeCompare(b.canonicalEntityKey);
  });

  validClues.forEach((c, idx) => {
    c.qid = idx;
  });

  // Compute Category & Toy Histograms
  const catCounts = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, 0]));
  const toyCounts = {};
  let blitzCount = 0;
  let longestIsTrueCount = 0;
  let primeTimeGoldCount = 0;

  for (const c of validClues) {
    catCounts[c.category] = (catCounts[c.category] || 0) + 1;
    if (c._goldPriority) primeTimeGoldCount++;
    if (c.isBlitzLegal) blitzCount++;
    const maxDistractorLen = Math.max(
      ...c.choices.filter((_, idx) => idx !== c.answerIdx).map((x) => x.length),
      1,
    );
    if (c.choices[c.answerIdx].length > maxDistractorLen) longestIsTrueCount++;
    for (const t of c.supportedToys) {
      toyCounts[t] = (toyCounts[t] || 0) + 1;
    }
  }

  // Build A+ All-Era `boot_pack.json` (800 clues: 40 per category — ~40% 2000s–2026, ~35% 1960s–1990s, ~25% Ancient/timeless + curated Showcases!)
  const bootSet = new Set();
  const bootClues = [];
  for (const cat of ALL_CATEGORIES) {
    const current2015_2026 = validClues.filter((c) => c.category === cat && /^pack_k_11_/i.test(c._packSource));
    const modern1990_2015 = validClues.filter((c) => c.category === cat && /^pack_k_12_/i.test(c._packSource));
    const bullpenAllEra = validClues.filter((c) => c.category === cat && /^pack_k_0|^pack_k_10_/i.test(c._packSource));
    const classicGold = validClues.filter((c) => c.category === cat && /^pack_[efghij](_|\.)/i.test(c._packSource) && c.difficulty <= 2);
    const catGoldPicked = [
      ...current2015_2026.slice(0, 8),
      ...modern1990_2015.slice(0, 5),
      ...bullpenAllEra.filter((c) => c.difficulty === 1).slice(0, 11),
      ...bullpenAllEra.filter((c) => c.difficulty === 2).slice(0, 7),
      ...bullpenAllEra.filter((c) => c.difficulty >= 3).slice(0, 2),
      ...classicGold.slice(0, 4),
    ];
    for (const c of catGoldPicked) {
      if (!bootSet.has(c.qid)) {
        bootSet.add(c.qid);
        bootClues.push(stripTransientFields(c));
      }
    }
    const extraShowcase = validClues.filter(
      (c) =>
        c.category === cat &&
        !bootSet.has(c.qid) &&
        c.difficulty <= 3 &&
        c.supportedToys.some((t) =>
          [
            'TOY_03_VERNIER_DIAL',
            'TOY_05_RELIEF_GLOBE_3D',
            'TOY_08_CHRONOLOGY_RAIL',
            'TOY_10_CLIFFHANGERS_THROTTLE',
            'TOY_11_MISSING_VOWELS_WHEEL',
            'TOY_14_FOUR_SHUTTER_REEL',
          ].includes(t),
        ),
    );
    for (const c of extraShowcase) {
      if (bootClues.filter((b) => b.category === cat).length >= 40) break;
      bootSet.add(c.qid);
      bootClues.push(stripTransientFields(c));
    }
    // Top up to exact 40 per category (20 x 40 = 800!) from remaining Gold / D1-D3 clues
    const fallbackCat = validClues.filter((c) => c.category === cat && !bootSet.has(c.qid));
    for (const c of fallbackCat) {
      if (bootClues.filter((b) => b.category === cat).length >= 40) break;
      bootSet.add(c.qid);
      bootClues.push(stripTransientFields(c));
    }
  }

  // Partition all clues cleanly across season_1..4 shards (difficulty-progressive All-Era Gold across all 4 seasons!)
  const seasons = [[], [], [], []];
  let goldIdx = 0;
  let nonGoldIdx = 0;
  for (const c of validClues) {
    const clean = stripTransientFields(c);
    if (c._goldPriority) {
      let targetGoldSeason;
      if (c.difficulty === 1) targetGoldSeason = goldIdx % 3 === 2 ? 1 : 0;
      else if (c.difficulty === 2) targetGoldSeason = goldIdx % 3;
      else targetGoldSeason = 1 + (goldIdx % 3);
      seasons[targetGoldSeason].push(clean);
      goldIdx++;
      continue;
    }
    let targetSeason = nonGoldIdx % 4;
    if (c.difficulty <= 2) targetSeason = nonGoldIdx % 2;
    else if (c.difficulty >= 4) targetSeason = 2 + (nonGoldIdx % 2);
    seasons[targetSeason].push(clean);
    nonGoldIdx++;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, 'boot_pack.json'),
    JSON.stringify({ schema: 'WS_V7_CORPUS_1', totalCorpusCount: validClues.length, clues: bootClues }),
  );
  for (let s = 0; s < 4; s++) {
    fs.writeFileSync(
      path.join(OUT_DIR, `season_${s + 1}.json`),
      JSON.stringify({
        schema: 'WS_V7_CORPUS_1',
        season: s + 1,
        totalCorpusCount: validClues.length,
        clues: seasons[s],
      }),
    );
  }

  const manifest = {
    schema: 'WS_V7_CORPUS_MANIFEST_1',
    compiledAtIso: new Date().toISOString(),
    totalClues: validClues.length,
    primeTimeGoldCount,
    bootPackCount: bootClues.length,
    seasonCounts: seasons.map((s) => s.length),
    blitzLegalCount: blitzCount,
    longestIsTrueRatio: Number((longestIsTrueCount / Math.max(1, validClues.length)).toFixed(4)),
    categoryCounts: catCounts,
    toyCounts,
    gateDrops,
  };
  fs.writeFileSync(path.join(OUT_DIR, 'corpus_manifest.json'), JSON.stringify(manifest, null, 2));

  console.log('=== V7 12-GATE CORPUS COMPILATION COMPLETE ===');
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
